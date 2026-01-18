"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DailyProgress, DailyHabit, HabitCategory, INITIAL_STATE } from '@/types';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, User, signOut, updateProfile } from 'firebase/auth';
import { getIndiaDate } from '@/utils/dateUtils';

interface HabitContextType extends AppState {
    toggleHabit: (date: string, habit: keyof DailyProgress | 'workout1' | 'workout2') => void;
    updateWater: (date: string, amount: number) => void;
    uploadPhoto: (date: string, file: File) => Promise<string>;
    deletePhoto: (date: string, photoUrl: string) => Promise<void>;
    getEntry: (date: string) => DailyProgress;
    setStartDate: (date: string) => void;
    resetChallenge: () => void;
    completeOnboarding: () => void;
    completeHabitOnboarding: () => void;
    toggleDailyHabit: (date: string, habitId: string) => void;
    getDailyHabitEntry: (date: string) => DailyHabit;
    addHabitCategory: (category: Omit<HabitCategory, 'id'>) => void;
    removeHabitCategory: (id: string) => void;
    reorderHabitCategories: (newOrder: HabitCategory[]) => void;
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

        const localOnboarding = localStorage.getItem('hasSeenOnboarding');
        const localHabitOnboarding = localStorage.getItem('hasSeenHabitOnboarding');
        if (localOnboarding === 'true' || localHabitOnboarding === 'true') {
            setState(prev => ({
                ...prev,
                hasSeenOnboarding: localOnboarding === 'true',
                hasSeenHabitOnboarding: localHabitOnboarding === 'true'
            }));
        }

        return () => unsubscribe();
    }, []);

    // Data Subscription to Firestore
    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, 'users', user.uid, 'challenge', 'data');
        const unsub = onSnapshot(docRef, (snap: DocumentSnapshot<DocumentData>) => {
            setError(null); // Clear error on success
            if (snap.exists()) {
                const firestoreData = snap.data() as AppState;

                // Hydrate photos from localStorage - REMOVED legacy single photo logic
                const hydratedEntries = { ...firestoreData.entries };

                // Auto-populate userName from OAuth if not set
                let finalUserName = firestoreData.userName;
                if (!finalUserName && user.displayName) {
                    finalUserName = user.displayName;
                    // Save it to Firestore for future use
                    const updatedState = { ...firestoreData, userName: finalUserName };
                    setDoc(docRef, { userName: finalUserName }, { merge: true });
                }

                // MERGE: Keep local hasSeenOnboarding/hasSeenHabitOnboarding, take everything else from Firestore
                setState(prev => ({
                    ...firestoreData,
                    entries: hydratedEntries,
                    userName: finalUserName,
                    hasSeenOnboarding: prev.hasSeenOnboarding, // Keep local truth
                    hasSeenHabitOnboarding: prev.hasSeenHabitOnboarding // Keep local truth
                }));
            } else {
                // Initialize doc if not exists
                // Don't sync hasSeenOnboarding even here
                const { hasSeenOnboarding, hasSeenHabitOnboarding, ...initialRest } = INITIAL_STATE;

                // Auto-populate userName from OAuth on first setup
                const initialUserName = user.displayName || '';
                const todayIST = getIndiaDate();
                const docToCreate = { ...initialRest, userName: initialUserName, startDate: todayIST };

                setDoc(docRef, docToCreate, { merge: true });

                // Update local state with the userName and startDate
                setState(prev => ({ ...prev, userName: initialUserName, startDate: todayIST }));
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
            // EXCLUDE hasSeenOnboarding/hasSeenHabitOnboarding from Firestore
            const { hasSeenOnboarding, hasSeenHabitOnboarding, ...stateToSave } = newState;

            // Re-assign entries object to avoid mutating original
            const entriesToSave = { ...stateToSave.entries };

            // Strip photoData to avoid size limits and save to localStorage instead - REMOVED legacy logic
            /*
            Object.keys(entriesToSave).forEach(date => {
                const entry = entriesToSave[date];
                // Legacy cleanup if needed
            });
            */

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
        const entry = state.entries[date];
        if (!entry) {
            return {
                date,
                workouts: { indoor: false, outdoor: false },
                diet: false,
                reading: false,
                water: 0,
                photos: [],
                meditation: false
            };
        }
        return {
            ...entry,
            photos: entry.photos || []
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
                photos: [],
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
            // if (habit === 'photo') return { photo: !curr.photo }; // REMOVED
            if (habit === 'meditation') return { meditation: !curr.meditation };
            return {};
        });
    };

    const updateWater = (date: string, amount: number) => {
        updateEntry(date, { water: amount });
    };

    const uploadPhoto = async (date: string, file: File): Promise<string> => {
        if (!user) throw new Error("User not authenticated");

        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `users/${user.uid}/photos/${date}/${filename}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Update Firestore
            const entry = getEntry(date);
            const newPhotos = [...(entry.photos || []), downloadURL];
            updateEntry(date, { photos: newPhotos });

            return downloadURL;
        } catch (error) {
            console.error("Error uploading photo:", error);
            throw error;
        }
    };

    const deletePhoto = async (date: string, photoUrl: string) => {
        if (!user) throw new Error("User not authenticated");

        try {
            // Delete from Storage
            const storageRef = ref(storage, photoUrl);
            await deleteObject(storageRef);

            // Update Firestore
            const entry = getEntry(date);
            const newPhotos = (entry.photos || []).filter(url => url !== photoUrl);
            updateEntry(date, { photos: newPhotos });
        } catch (error) {
            console.error("Error deleting photo:", error);
            throw error;
        }
    };

    const setStartDate = (date: string) => {
        if (state.startDateLocked) return;
        const today = getIndiaDate();
        if (date < today) {
            alert("Start date cannot be in the past.");
            return;
        }
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

        // 2. Update State & Sync to Firestore
        setState(prev => {
            const newState: AppState = {
                ...INITIAL_STATE,
                startDate: getIndiaDate(),       // Reset to today in IST
                habitEntries: prev.habitEntries, // Preserve habits
                userName: prev.userName,         // Preserve name
                hasSeenOnboarding: prev.hasSeenOnboarding, // Preserve onboarding status
                hasSeenHabitOnboarding: prev.hasSeenHabitOnboarding // Preserve habit onboarding status
            };

            // Re-check onboarding from localStorage for extra safety
            const hasSeenOnboardingLocal = localStorage.getItem('hasSeenOnboarding');
            if (hasSeenOnboardingLocal) {
                newState.hasSeenOnboarding = hasSeenOnboardingLocal === 'true';
            }

            syncToFirestore(newState);
            return newState;
        });
    };

    const completeOnboarding = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setState(prev => {
            const newState = { ...prev, hasSeenOnboarding: true };
            // syncToFirestore(newState); // No need to sync this anymore
            return newState;
        });
    };

    const completeHabitOnboarding = () => {
        localStorage.setItem('hasSeenHabitOnboarding', 'true');
        setState(prev => {
            const newState = { ...prev, hasSeenHabitOnboarding: true };
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
            return { date };
        }
        return state.habitEntries[date] || { date };
    };

    const toggleDailyHabit = (date: string, habitId: string) => {
        if (habitId === 'date') return; // Don't toggle the date field

        setState(prev => {
            const currentEntry = getDailyHabitEntry(date);
            const currentValue = currentEntry[habitId];
            const updatedEntry = {
                ...currentEntry,
                [habitId]: typeof currentValue === 'boolean' ? !currentValue : true
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

    const addHabitCategory = (category: Omit<HabitCategory, 'id'>) => {
        setState(prev => {
            const id = `custom_${Date.now()}`;
            const newCategory: HabitCategory = { ...category, id };
            const currentCategories = prev.habitCategories || [];
            const newCategories = [...currentCategories, newCategory];
            const newState = { ...prev, habitCategories: newCategories };
            syncToFirestore(newState);
            return newState;
        });
    };

    const removeHabitCategory = (id: string) => {
        setState(prev => {
            const currentCategories = prev.habitCategories || [];
            const newCategories = currentCategories.filter(cat => cat.id !== id);
            const newState = { ...prev, habitCategories: newCategories };
            syncToFirestore(newState);
            return newState;
        });
    };

    const reorderHabitCategories = (newOrder: HabitCategory[]) => {
        setState(prev => {
            const newState = { ...prev, habitCategories: newOrder };
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
            uploadPhoto,
            deletePhoto,
            getEntry,
            setStartDate,
            resetChallenge,
            completeOnboarding,
            completeHabitOnboarding,
            setUserName,
            logout,
            toggleDailyHabit,
            getDailyHabitEntry,
            addHabitCategory,
            removeHabitCategory,
            reorderHabitCategories,
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
