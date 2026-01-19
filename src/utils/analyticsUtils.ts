import { DailyProgress } from '@/types';
import { checkCompletion } from './completion';
import { getIndiaDate } from './dateUtils';

export interface StreakData {
    current: number;
    longest: number;
}

export interface WeeklyStats {
    weekStart: Date;
    weekEnd: Date;
    totalDays: number;
    completedDays: number;
    completionRate: number;
    habitBreakdown: {
        workout1: number;
        workout2: number;
        diet: number;
        reading: number;
        photos: number;
        water: number;
        meditation: number;
    };
}

export interface MonthlyStats {
    month: number;
    year: number;
    totalDays: number;
    completedDays: number;
    completionRate: number;
    habitBreakdown: {
        workout1: number;
        workout2: number;
        diet: number;
        reading: number;
        photos: number;
        water: number;
        meditation: number;
    };
}

export function calculateStreaks(
    entries: Record<string, DailyProgress>,
    startDate: string
): StreakData {
    const start = new Date(startDate);
    // Use getIndiaDate() to ensure we get "today" in IST
    const today = new Date(getIndiaDate());
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate from start date to today
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const entry = entries[dateStr];
        const isComplete = checkCompletion(entry);

        if (isComplete) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    // Calculate current streak (working backwards from today)
    for (let d = new Date(today); d >= start; d.setDate(d.getDate() - 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const entry = entries[dateStr];
        const isComplete = checkCompletion(entry);

        if (isComplete) {
            currentStreak++;
        } else {
            break;
        }
    }

    return { current: currentStreak, longest: longestStreak };
}

export function getWeekRange(weekStartDate: Date): { start: Date; end: Date } {
    const start = new Date(weekStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

export function getMonthRange(month: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

export function calculateWeeklyStats(
    entries: Record<string, DailyProgress>,
    weekStartDate: Date
): WeeklyStats {
    const { start, end } = getWeekRange(weekStartDate);

    let completedDays = 0;
    let totalDays = 0;
    const habitBreakdown = {
        workout1: 0,
        workout2: 0,
        diet: 0,
        reading: 0,
        photos: 0,
        water: 0,
        meditation: 0,
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const entry = entries[dateStr];

        totalDays++;

        if (checkCompletion(entry)) {
            completedDays++;
        }

        if (entry) {
            if (entry.workouts.indoor) habitBreakdown.workout1++;
            if (entry.workouts.outdoor) habitBreakdown.workout2++;
            if (entry.diet) habitBreakdown.diet++;
            if (entry.reading) habitBreakdown.reading++;
            if (entry.photos && entry.photos.length > 0) habitBreakdown.photos++;
            if (entry.water >= 4000) habitBreakdown.water++;
            if (entry.meditation) habitBreakdown.meditation++;
        }
    }

    return {
        weekStart: start,
        weekEnd: end,
        totalDays,
        completedDays,
        completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
        habitBreakdown,
    };
}

export function calculateMonthlyStats(
    entries: Record<string, DailyProgress>,
    month: number,
    year: number
): MonthlyStats {
    const { start, end } = getMonthRange(month, year);

    let completedDays = 0;
    let totalDays = 0;
    const habitBreakdown = {
        workout1: 0,
        workout2: 0,
        diet: 0,
        reading: 0,
        photos: 0,
        water: 0,
        meditation: 0,
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const entry = entries[dateStr];

        totalDays++;

        if (checkCompletion(entry)) {
            completedDays++;
        }

        if (entry) {
            if (entry.workouts.indoor) habitBreakdown.workout1++;
            if (entry.workouts.outdoor) habitBreakdown.workout2++;
            if (entry.diet) habitBreakdown.diet++;
            if (entry.reading) habitBreakdown.reading++;
            if (entry.photos && entry.photos.length > 0) habitBreakdown.photos++;
            if (entry.water >= 4000) habitBreakdown.water++;
            if (entry.meditation) habitBreakdown.meditation++;
        }
    }

    return {
        month,
        year,
        totalDays,
        completedDays,
        completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
        habitBreakdown,
    };
}

export function getMonthName(month: number): string {
    const names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return names[month];
}

export function formatWeekRange(start: Date, end: Date): string {
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}`;
    } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
}
