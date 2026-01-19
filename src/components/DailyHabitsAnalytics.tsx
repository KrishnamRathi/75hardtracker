"use client";
import React, { useState } from 'react';
import { useHabit } from '@/context/HabitContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import styles from './DailyHabitsAnalytics.module.css';
import clsx from 'clsx';
import {
    calculateHabitWeeklyStats,
    calculateHabitMonthlyStats,
} from '@/utils/habitAnalyticsUtils';
import {
    formatWeekRange,
    getMonthName,
} from '@/utils/analyticsUtils';
import { getIndiaDate } from '@/utils/dateUtils';

type ViewMode = 'week' | 'month';

export default function DailyHabitsAnalytics() {
    const { habitEntries, habitCategories } = useHabit();
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const today = new Date(getIndiaDate());
        const day = today.getDay();
        const diff = today.getDate() - day;
        return new Date(today.setDate(diff));
    });
    // Use IST date for initial month/year
    const [currentMonth, setCurrentMonth] = useState(() => new Date(getIndiaDate()).getMonth());
    const [currentYear, setCurrentYear] = useState(() => new Date(getIndiaDate()).getFullYear());

    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const weeklyStats = calculateHabitWeeklyStats(habitEntries, habitCategories, currentWeekStart);
    const monthlyStats = calculateHabitMonthlyStats(habitEntries, habitCategories, currentMonth, currentYear);

    const stats = viewMode === 'week' ? weeklyStats : monthlyStats;

    const handlePreviousPeriod = () => {
        if (viewMode === 'week') {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() - 7);
            setCurrentWeekStart(newDate);
        } else {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        }
    };

    const handleNextPeriod = () => {
        if (viewMode === 'week') {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() + 7);
            setCurrentWeekStart(newDate);
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNextPeriod();
        } else if (isRightSwipe) {
            handlePreviousPeriod();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    const periodLabel = viewMode === 'week'
        ? formatWeekRange(weeklyStats.weekStart, weeklyStats.weekEnd)
        : `${getMonthName(currentMonth)} ${currentYear}`;

    return (
        <div className={styles.container}>
            {/* View Mode Switcher */}
            <div className={styles.modeSwitcher}>
                <button
                    className={clsx(styles.modeButton, viewMode === 'week' && styles.active)}
                    onClick={() => setViewMode('week')}
                >
                    Week
                </button>
                <button
                    className={clsx(styles.modeButton, viewMode === 'month' && styles.active)}
                    onClick={() => setViewMode('month')}
                >
                    Month
                </button>
            </div>

            {/* Period Selector */}
            <div className={styles.periodSelector}>
                <button className={styles.navButton} onClick={handlePreviousPeriod}>
                    <ChevronLeft size={20} />
                </button>
                <h2 className={styles.periodLabel}>{periodLabel}</h2>
                <button className={styles.navButton} onClick={handleNextPeriod}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Swipeable Content */}
            <div
                className={styles.content}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Bar Chart */}
                <div className={styles.barChart}>
                    {habitCategories.map((category) => {
                        const habitStat = stats.habitStats.find(s => s.habitId === category.id);
                        const percentage = habitStat?.completionRate || 0;

                        // Get the icon dynamically
                        const IconComponent = (Icons as any)[category.icon];

                        return (
                            <div key={category.id} className={styles.barItem}>
                                <div className={styles.barContainer}>
                                    <div
                                        className={clsx(styles.bar, category.colorClass)}
                                        style={{ height: `${percentage}%` }}
                                    >
                                        <span className={styles.barPercentage}>
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.barLabel}>
                                    <div className={clsx(styles.barIcon, category.colorClass)}>
                                        {IconComponent && <IconComponent size={16} />}
                                    </div>
                                    <span className={styles.barName}>{category.name}</span>
                                    <span className={styles.barCount}>
                                        {habitStat?.completedDays}/{stats.totalDays} days
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
