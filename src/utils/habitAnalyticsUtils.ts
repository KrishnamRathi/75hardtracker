import { DailyHabit, HabitCategory } from '@/types';
import { getIndiaDate } from '@/utils/dateUtils';

export interface HabitWeeklyStats {
    weekStart: Date;
    weekEnd: Date;
    totalDays: number;
    habitStats: Array<{
        habitId: string;
        completedDays: number;
        completionRate: number;
    }>;
}

export interface HabitMonthlyStats {
    month: number;
    year: number;
    totalDays: number;
    habitStats: Array<{
        habitId: string;
        completedDays: number;
        completionRate: number;
    }>;
}

export function calculateHabitWeeklyStats(
    habitEntries: Record<string, DailyHabit>,
    habitCategories: HabitCategory[],
    weekStartDate: Date
): HabitWeeklyStats {
    const start = new Date(weekStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    let totalDays = 0;
    const habitCounts: Record<string, number> = {};

    // Initialize counts
    habitCategories.forEach(cat => {
        habitCounts[cat.id] = 0;
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = getIndiaDate(d);
        const entry = habitEntries[dateStr];

        totalDays++;

        if (entry) {
            habitCategories.forEach(cat => {
                if (entry[cat.id] === true) {
                    habitCounts[cat.id]++;
                }
            });
        }
    }

    const habitStats = habitCategories.map(cat => ({
        habitId: cat.id,
        completedDays: habitCounts[cat.id] || 0,
        completionRate: totalDays > 0 ? ((habitCounts[cat.id] || 0) / totalDays) * 100 : 0,
    }));

    return {
        weekStart: start,
        weekEnd: end,
        totalDays,
        habitStats,
    };
}

export function calculateHabitMonthlyStats(
    habitEntries: Record<string, DailyHabit>,
    habitCategories: HabitCategory[],
    month: number,
    year: number
): HabitMonthlyStats {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    end.setHours(23, 59, 59, 999);

    let totalDays = 0;
    const habitCounts: Record<string, number> = {};

    // Initialize counts
    habitCategories.forEach(cat => {
        habitCounts[cat.id] = 0;
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = getIndiaDate(d);
        const entry = habitEntries[dateStr];

        totalDays++;

        if (entry) {
            habitCategories.forEach(cat => {
                if (entry[cat.id] === true) {
                    habitCounts[cat.id]++;
                }
            });
        }
    }

    const habitStats = habitCategories.map(cat => ({
        habitId: cat.id,
        completedDays: habitCounts[cat.id] || 0,
        completionRate: totalDays > 0 ? ((habitCounts[cat.id] || 0) / totalDays) * 100 : 0,
    }));

    return {
        month,
        year,
        totalDays,
        habitStats,
    };
}
