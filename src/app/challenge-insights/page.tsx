"use client";
import React from 'react';
import BottomNav from '@/components/BottomNav';
import Heatmap from '@/components/Heatmap';
import ChallengeAnalytics from '@/components/ChallengeAnalytics';
import styles from '../page.module.css';

export default function ChallengeInsights() {
    return (
        <main className="container" style={{ paddingTop: 0 }}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Challenge Insights</h1>
                </div>
            </header>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {/* Challenge Analytics */}
                <ChallengeAnalytics />

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Challenge Heatmap */}
                <div>
                    <h3 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                        75 Hard Challenge
                    </h3>
                    <Heatmap />
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
