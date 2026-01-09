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
    photoData?: string | null; // Base64 data
    notes?: string;
}

export interface AppState {
    entries: Record<string, DailyProgress>;
    startDate: string;
    startDateLocked: boolean; // New field
}

export const INITIAL_STATE: AppState = {
    entries: {},
    startDate: new Date().toISOString().split('T')[0],
    startDateLocked: false,
};
