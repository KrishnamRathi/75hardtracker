"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DailyProgress, INITIAL_STATE } from '@/types';

interface HabitContextType extends AppState {
    toggleHabit: (date: string, habit: keyof DailyProgress | 'workout1' | 'workout2') => void;
    updateWater: (date: string, amount: number) => void;
    setPhoto: (date: string, hasPhoto: boolean, data?: string | null) => void;
    getEntry: (date: string) => DailyProgress;
    setStartDate: (date: string) => void;
    resetChallenge: () => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

const STORAGE_KEY = '75hard_data';

export function HabitProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setState(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved state', e);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state, loaded]);

    const getEntry = (date: string): DailyProgress => {
        return state.entries[date] || {
            date,
            workouts: { indoor: false, outdoor: false },
            diet: false,
            reading: false,
            water: 0,
            photo: false
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
                photo: false
            };

            let nextEntryData: Partial<DailyProgress>;
            if (typeof update === 'function') {
                nextEntryData = update(currentEntry);
            } else {
                nextEntryData = update;
            }

            return {
                ...prev,
                entries: {
                    ...prev.entries,
                    [date]: { ...currentEntry, ...nextEntryData }
                }
            };
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
            return {};
        });
    };

    const updateWater = (date: string, amount: number) => {
        updateEntry(date, { water: amount });
    };

    const setPhoto = (date: string, hasPhoto: boolean, data?: string | null) => {
        updateEntry(date, { photo: hasPhoto, photoData: hasPhoto ? data : null });
    };

    const setStartDate = (date: string) => {
        if (state.startDateLocked) return;
        setState(prev => ({ ...prev, startDate: date, startDateLocked: true }));
    };

    const resetChallenge = () => {
        setState(INITIAL_STATE);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!loaded) return null; // Or loading spinner

    return (
        <HabitContext.Provider value={{
            ...state,
            toggleHabit,
            updateWater,
            setPhoto,
            getEntry,
            setStartDate,
            resetChallenge
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
