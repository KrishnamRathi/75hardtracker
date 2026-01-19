"use client";
import React, { useState } from 'react';
import { useHabit } from '@/context/HabitContext';
import styles from './Heatmap.module.css';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getIndiaDate } from '@/utils/dateUtils';

export default function HabitHeatmap() {
    const { getDailyHabitEntry, habitCategories } = useHabit();
    const [selectedDate, setSelectedDate] = useState(new Date(getIndiaDate()));

    const checkHabitCompletion = (entry: ReturnType<typeof getDailyHabitEntry>): boolean => {
        if (!entry) return false;
        // Check if all habits in categories are completed
        return habitCategories.every(category => entry[category.id] === true);
    };

    const goToPreviousMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const goToNextMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    // Calculate days for selected month
    const days = React.useMemo(() => {
        const list = [];
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const todayStr = getIndiaDate();

        // Get total days in selected month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const dateStr = getIndiaDate(currentDate);

            if (!dateStr) continue;

            const isFuture = dateStr > todayStr;
            const entry = getDailyHabitEntry(dateStr);
            const isComplete = checkHabitCompletion(entry);

            list.push({
                date: dateStr,
                dayNum: i,
                isFuture,
                isComplete,
                entry
            });
        }
        return list;
    }, [selectedDate, getDailyHabitEntry]);

    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <button
                    onClick={goToPreviousMonth}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ChevronLeft size={20} />
                </button>

                <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--text-primary)' }}>
                    Daily Habits - {monthName}
                </h3>

                <button
                    onClick={goToNextMonth}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className={styles.heatmapGrid}>
                {days.map((day) => (
                    <div
                        key={day.date}
                        className={clsx(
                            styles.cell,
                            day.isFuture ? styles.future : (day.isComplete ? styles.success : styles.fail)
                        )}
                        title={`Day ${day.dayNum}: ${day.date}`}
                    >
                        <span className={styles.cellDayNum}>{day.dayNum}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
