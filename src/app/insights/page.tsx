"use client";
import React from 'react';
import { useHabit } from '@/context/HabitContext';
import BottomNav from '@/components/BottomNav';
import Heatmap from '@/components/Heatmap';
import HabitHeatmap from '@/components/HabitHeatmap';
import styles from '../page.module.css';

export default function Insights() {
    return (
        <main className="container" style={{ paddingTop: 0 }}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Insights</h1>
                </div>
            </header>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                    <h3 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                        75 Hard Challenge
                    </h3>
                    <Heatmap />
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                <HabitHeatmap />
            </div>

            <BottomNav />
        </main>
    );
}
