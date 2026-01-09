"use client";
import React, { useEffect, useRef } from 'react';
import styles from './DateStrip.module.css';
import clsx from 'clsx';

interface DateStripProps {
    startDate: string;
    selectedDate: string;
    onSelectDate: (date: string) => void;
    daysCount?: number;
}

import { useHabit } from '@/context/HabitContext';
import { checkCompletion } from '@/utils/completion';
import { getIndiaDate } from '@/utils/dateUtils';

// inside component
export default function DateStrip({
    startDate,
    selectedDate,
    onSelectDate,
    daysCount = 75
}: DateStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { getEntry } = useHabit();
    const today = getIndiaDate();

    // Generate dates
    const dates = React.useMemo(() => {
        if (!startDate) return [];
        const list = [];
        const start = new Date(startDate);
        for (let i = 0; i < daysCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = getIndiaDate(d);
            if (dateStr) list.push(dateStr);
        }
        return list;
    }, [startDate, daysCount]);

    useEffect(() => {
        // Scroll to selected date on mount or change
        if (scrollRef.current) {
            const selectedIndex = dates.indexOf(selectedDate);
            if (selectedIndex !== -1) {
                const itemWidth = 60; // Approximate width + gap
                const scrollPos = selectedIndex * itemWidth - (window.innerWidth / 2) + (itemWidth / 2);
                scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
        }
    }, [selectedDate, dates]);

    return (
        <div className={styles.container} ref={scrollRef}>
            {dates.map((dateStr, index) => {
                const date = new Date(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === today;
                const isPast = dateStr < today;
                const dayNum = index + 1;

                const entry = getEntry(dateStr);
                const isComplete = checkCompletion(entry);

                // Status classes: 
                // Green if complete (past or present).
                // Red if past AND not complete.
                // Neutral otherwise.
                const showSuccess = isComplete;
                const showFail = isPast && !isComplete;

                return (
                    <div
                        key={dateStr}
                        className={clsx(
                            styles.dateItem,
                            isSelected && styles.selected,
                            isToday && styles.today,
                            showSuccess && styles.success,
                            showFail && styles.fail
                        )}
                        onClick={() => onSelectDate(dateStr)}
                    >
                        <span className={styles.dayLabel}>Day {dayNum}</span>
                        <div className={styles.dateCircle}>
                            <span className={styles.weekday}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className={styles.dayNumber}>{date.getDate()}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
