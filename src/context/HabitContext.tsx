"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DailyProgress, DailyHabit, INITIAL_STATE } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface HabitContextType extends AppState {
    toggleHabit: (date: string, habit: keyof DailyProgress | 'workout1' | 'workout2') => void;
    updateWater: (date: string, amount: number) => void;
    setPhoto: (date: string, hasPhoto: boolean, data?: string | null) => void;
    getEntry: (date: string) => DailyProgress;
    setStartDate: (date: string) => void;
    resetChallenge: () => void;
    completeOnboarding: () => void;
    toggleDailyHabit: (date: string, habit: keyof DailyHabit) => void;
    getDailyHabitEntry: (date: string) => DailyHabit;
    user: User | null;
    loading: boolean;
    error: string | null;
    setUserName: (name: string) => void;
    logout: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth Subscription
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
            if (!u) {
                // If logged out, reset to initial
                setState(INITIAL_STATE);
            }
        });

        // Initial LocalStorage check for onboarding (device specific)
        const localOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (localOnboarding === 'true') {
            setState(prev => ({ ...prev, hasSeenOnboarding: true }));
        }

        return () => unsubscribe();
    }, []);

    // Data Subscription to Firestore
    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, 'users', user.uid, 'challenge', 'data');
        const unsub = onSnapshot(docRef, (snap) => {
            setError(null); // Clear error on success
            if (snap.exists()) {
                const firestoreData = snap.data() as AppState;

                // Hydrate photos from localStorage
                const hydratedEntries = { ...firestoreData.entries };
                Object.keys(hydratedEntries).forEach(date => {
                    if (hydratedEntries[date].photo) {
                        const localPhotoKey = `photo_${user.uid}_${date}`;
                        try {
                            const localPhoto = localStorage.getItem(localPhotoKey);
                            if (localPhoto) {
                                hydratedEntries[date].photoData = localPhoto;
                            }
                        } catch (e) { console.error(e) }
                    }
                });

                // Auto-populate userName from OAuth if not set
                let finalUserName = firestoreData.userName;
                if (!finalUserName && user.displayName) {
                    finalUserName = user.displayName;
                    // Save it to Firestore for future use
                    const updatedState = { ...firestoreData, userName: finalUserName };
                    setDoc(docRef, { userName: finalUserName }, { merge: true });
                }

                // MERGE: Keep local hasSeenOnboarding, take everything else from Firestore
                setState(prev => ({
                    ...firestoreData,
                    entries: hydratedEntries,
                    userName: finalUserName,
                    hasSeenOnboarding: prev.hasSeenOnboarding // Keep local truth
                }));
            } else {
                // Initialize doc if not exists
                // Don't sync hasSeenOnboarding even here
                const { hasSeenOnboarding, ...initialRest } = INITIAL_STATE;

                // Auto-populate userName from OAuth on first setup
                const initialUserName = user.displayName || '';
                const docToCreate = { ...initialRest, userName: initialUserName };

                setDoc(docRef, docToCreate, { merge: true });

                // Update local state with the userName
                setState(prev => ({ ...prev, userName: initialUserName }));
            }
        }, (err) => {
            console.error("Firestore Error:", err);
            if (err.code === 'permission-denied') {
                setError("Database permission denied. Your progress is NOT saving. Please update Firestore Rules.");
            } else {
                setError(err.message);
            }
        });

        return () => unsub();
    }, [user]);

    // Helper to sync state to firestore (Stripping photoData AND hasSeenOnboarding)
    const syncToFirestore = async (newState: AppState) => {
        if (!user) return;
        try {
            // Create a copy of state to clean up before saving
            // EXCLUDE hasSeenOnboarding from Firestore
            const { hasSeenOnboarding, ...stateToSave } = newState;

            // Re-assign entries object to avoid mutating original
            const entriesToSave = { ...stateToSave.entries };

            // Strip photoData to avoid size limits and save to localStorage instead
            Object.keys(entriesToSave).forEach(date => {
                const entry = entriesToSave[date];
                if (entry.photoData) {
                    // Make sure it's null in Firestore
                    entriesToSave[date] = { ...entry, photoData: null };
                }
            });

            // @ts-ignore - we are intentionally saving a partial object (without hasSeenOnboarding)
            const finalDoc = { ...stateToSave, entries: entriesToSave };

            const docRef = doc(db, 'users', user.uid, 'challenge', 'data');
            await setDoc(docRef, finalDoc, { merge: true });
            setError(null);
        } catch (e: any) {
            console.error("Error writing document: ", e);
            if (e.code === 'permission-denied') {
                setError("Database permission denied. Changes won't save.");
            }
        }
    };
    const getEntry = (date: string): DailyProgress => {
        return state.entries[date] || {
            date,
            workouts: { indoor: false, outdoor: false },
            diet: false,
            reading: false,
            water: 0,
            photo: false,
            meditation: false
        };
    };

    const updateEntry = (date: string, update: Partial<DailyProgress> | ((prev: DailyProgress) => Partial<DailyProgress>)) => {
        setState(prev => {
            const currentEntry = prev.entries[date] || {
                date,
                workouts: { indoor: false, outdoor: false },
                diet: false,
                reading: false,
                water: 0,
                photo: false,
                meditation: false
            };

            let nextEntryData: Partial<DailyProgress>;
            if (typeof update === 'function') {
                nextEntryData = update(currentEntry);
            } else {
                nextEntryData = update;
            }

            const nextEntries = {
                ...prev.entries,
                [date]: { ...currentEntry, ...nextEntryData }
            };

            // Auto-lock start date when any activity begins
            const shouldLock = !prev.startDateLocked;
            const newState = {
                ...prev,
                entries: nextEntries,
                startDateLocked: shouldLock ? true : prev.startDateLocked
            };

            syncToFirestore(newState);
            return newState;
        });
    };

    const toggleHabit = (date: string, habit: string) => { // Type loose here to handle the workout special case
        updateEntry(date, (curr) => {
            if (habit === 'workout1') {
                return { workouts: { ...curr.workouts, indoor: !curr.workouts.indoor } };
            }
            if (habit === 'workout2') {
                return { workouts: { ...curr.workouts, outdoor: !curr.workouts.outdoor } };
            }
            if (habit === 'diet') return { diet: !curr.diet };
            if (habit === 'reading') return { reading: !curr.reading };
            if (habit === 'photo') return { photo: !curr.photo };
            if (habit === 'meditation') return { meditation: !curr.meditation };
            return {};
        });
    };

    const updateWater = (date: string, amount: number) => {
        updateEntry(date, { water: amount });
    };

    const setPhoto = (date: string, hasPhoto: boolean, data?: string | null) => {
        if (!user) return;

        // 1. Save to LocalStorage
        const localPhotoKey = `photo_${user.uid}_${date}`;
        if (hasPhoto && data) {
            try {
                localStorage.setItem(localPhotoKey, data);
            } catch (e) {
                console.error("Failed to save photo to localStorage", e);
                alert("Storage full! Cannot save photo.");
                return;
            }
        } else {
            localStorage.removeItem(localPhotoKey);
        }

        // 2. Update Context state (for immediate UI) AND sync to Firestore (stripped)
        updateEntry(date, { photo: hasPhoto, photoData: data }); // Context keeps data for UI
    };

    const setStartDate = (date: string) => {
        if (state.startDateLocked) return;
        setState(prev => {
            const newState = { ...prev, startDate: date, startDateLocked: true };
            syncToFirestore(newState);
            return newState;
        });
    };

    const resetChallenge = () => {
        if (user) {
            // 1. Clear LocalStorage Photos
            const prefix = `photo_${user.uid}_`;
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => { localStorage.removeItem(k) });
        }

        // 2. Clear Onboarding
        // localStorage.removeItem('hasSeenOnboarding');

        // 3. Reset State & Sync to Firestore
        const newState = INITIAL_STATE;
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
        if (hasSeenOnboarding) {
            newState.hasSeenOnboarding = hasSeenOnboarding === 'true';
        }
        setState(newState);
        syncToFirestore(newState);
    };

    const completeOnboarding = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setState(prev => {
            const newState = { ...prev, hasSeenOnboarding: true };
            // syncToFirestore(newState); // No need to sync this anymore
            return newState;
        });
    };

    const setUserName = (name: string) => {
        setState(prev => {
            const newState = { ...prev, userName: name };
            syncToFirestore(newState);
            return newState;
        });
    };

    const logout = async () => {
        try {
            await auth.signOut();
            setState(INITIAL_STATE);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // Daily Habit Tracker Functions
    const getDailyHabitEntry = (date: string): DailyHabit => {
        if (!state.habitEntries) {
            return {
                date,
                workOnGoals: false,
                skinCareMorning: false,
                skinCareNight: false,
                brushTeethNight: false,
                guitar: false
            };
        }
        return state.habitEntries[date] || {
            date,
            workOnGoals: false,
            skinCareMorning: false,
            skinCareNight: false,
            brushTeethNight: false,
            guitar: false
        };
    };

    const toggleDailyHabit = (date: string, habit: keyof DailyHabit) => {
        if (habit === 'date') return; // Don't toggle the date field

        setState(prev => {
            const currentEntry = getDailyHabitEntry(date);
            const updatedEntry = {
                ...currentEntry,
                [habit]: !currentEntry[habit]
            };

            const newHabitEntries = {
                ...(prev.habitEntries || {}),
                [date]: updatedEntry
            };

            const newState = { ...prev, habitEntries: newHabitEntries };
            syncToFirestore(newState);
            return newState;
        });
    };

    if (loading) return null; // Or loading spinner

    return (
        <HabitContext.Provider value={{
            ...state,
            toggleHabit,
            updateWater,
            setPhoto,
            getEntry,
            setStartDate,
            resetChallenge,
            completeOnboarding,
            setUserName,
            logout,
            toggleDailyHabit,
            getDailyHabitEntry,
            user,
            loading,
            error
        }}>
            {children}
        </HabitContext.Provider>
    );
}

export function useHabit() {
    const context = useContext(HabitContext);
    if (!context) throw new Error('useHabit must be used within HabitProvider');
    return context;
}
