export interface DailyProgress {
    date: string; // ISO date string YYYY-MM-DD
    workouts: {
        indoor: boolean;
        outdoor: boolean;
    };
    diet: boolean;
    reading: boolean; // 10 pages
    water: number; // in oz, target 128
    photos: string[]; // Array of Firebase Storage URLs
    meditation: boolean;
}

export interface HabitCategory {
    id: string;
    name: string;
    subtitle: string;
    icon: string; // Lucide icon name
    colorClass: string; // CSS class like 'text-blue', 'text-purple', etc.
}

export interface DailyHabit {
    date: string;
    [habitId: string]: boolean | string; // Dynamic habit tracking, date is string
}

export interface AppState {
    entries: Record<string, DailyProgress>;
    habitEntries: Record<string, DailyHabit>;
    habitCategories: HabitCategory[];
    startDate: string;
    startDateLocked: boolean;
    hasSeenOnboarding: boolean;
    hasSeenHabitOnboarding: boolean;
    userName?: string;
}

const DEFAULT_HABIT_CATEGORIES: HabitCategory[] = [
    { id: 'workOnGoals', name: 'Work on Goals', subtitle: 'Daily progress', icon: 'Target', colorClass: 'text-blue' },
    { id: 'skinCareMorning', name: 'Skin Care - Morning', subtitle: 'Morning routine', icon: 'Sun', colorClass: 'text-yellow' },
    { id: 'skinCareNight', name: 'Skin Care - Night', subtitle: 'Night routine', icon: 'Moon', colorClass: 'text-purple' },
    { id: 'brushTeethNight', name: 'Brush Teeth - Night', subtitle: 'Before bed', icon: 'Sparkles', colorClass: 'text-green' },
    { id: 'guitar', name: 'Guitar', subtitle: 'Practice session', icon: 'Music', colorClass: 'text-blue' },
];

export const INITIAL_STATE: AppState = {
    entries: {},
    habitEntries: {},
    habitCategories: DEFAULT_HABIT_CATEGORIES,
    startDate: '', // Will be initialized to today's date in IST
    startDateLocked: false,
    hasSeenOnboarding: false,
    hasSeenHabitOnboarding: false,
    userName: '',
};
