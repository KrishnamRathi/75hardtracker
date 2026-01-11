export interface DailyProgress {
    date: string; // ISO date string YYYY-MM-DD
    workouts: {
        indoor: boolean;
        outdoor: boolean;
    };
    diet: boolean;
    reading: boolean; // 10 pages
    water: number; // in oz, target 128
    photo: boolean;
    meditation: boolean;
    photoData?: string | null; // Base64 data
}

export interface DailyHabit {
    date: string;
    workOnGoals: boolean;
    skinCareMorning: boolean;
    skinCareNight: boolean;
    brushTeethNight: boolean;
    guitar: boolean;
}

export interface AppState {
    entries: Record<string, DailyProgress>;
    habitEntries: Record<string, DailyHabit>;
    startDate: string;
    startDateLocked: boolean;
    hasSeenOnboarding: boolean;
    hasSeenHabitOnboarding: boolean;
    userName?: string;
}

export const INITIAL_STATE: AppState = {
    entries: {},
    habitEntries: {},
    startDate: '', // Will be initialized to today's date in IST
    startDateLocked: false,
    hasSeenOnboarding: false,
    hasSeenHabitOnboarding: false,
    userName: '',
};
