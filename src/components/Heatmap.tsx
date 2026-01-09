"use client";
import React from 'react';
import { useHabit } from '@/context/HabitContext';
import styles from './Heatmap.module.css';
import clsx from 'clsx';
import { DailyProgress } from '@/types';

import { checkCompletion } from '@/utils/completion';
import { getIndiaDate } from '@/utils/dateUtils';

export default function Heatmap() {
    const { startDate, getEntry } = useHabit();

    // Calculate 75 days
    const days = React.useMemo(() => {
        const list = [];
        const start = new Date(startDate);
        const todayStr = getIndiaDate();

        for (let i = 0; i < 75; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = getIndiaDate(d);

            // Determine status
            const isFuture = dateStr > todayStr;
            const entry = getEntry(dateStr);
            const isComplete = checkCompletion(entry);

            list.push({
                date: dateStr,
                dayNum: i + 1,
                isFuture,
                isComplete,
                entry
            });
        }
        return list;
    }, [startDate, getEntry]);

    return (
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
    );
}
