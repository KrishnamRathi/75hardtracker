"use client";
import React from 'react';
import { useHabit } from '@/context/HabitContext';
import BottomNav from '@/components/BottomNav';
import HabitHeatmap from '@/components/HabitHeatmap';
import DailyHabitsAnalytics from '@/components/DailyHabitsAnalytics';
import styles from '../page.module.css';

export default function Insights() {
    return (
        <main className="container" style={{ paddingTop: 0 }}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Habits Insights</h1>
                </div>
            </header>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {/* Daily Habits Analytics */}
                <DailyHabitsAnalytics />

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Daily Habits Heatmap */}
                <HabitHeatmap />
            </div>

            <BottomNav />
        </main>
    );
}
