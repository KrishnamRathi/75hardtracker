"use client";
import React from 'react';
import { useHabit } from '@/context/HabitContext';
import { Flame, TrendingUp } from 'lucide-react';
import StatsCard from './StatsCard';
import styles from './ChallengeAnalytics.module.css';
import { calculateStreaks } from '@/utils/analyticsUtils';

export default function ChallengeAnalytics() {
    const { entries, startDate } = useHabit();

    const streaks = calculateStreaks(entries, startDate);

    // Calculate overall completion rate
    const totalEntries = Object.keys(entries).length;
    const completedEntries = Object.values(entries).filter(entry => {
        return entry.workouts.indoor &&
            entry.workouts.outdoor &&
            entry.diet &&
            entry.reading &&
            entry.photos && entry.photos.length > 0 &&
            entry.water >= 4000 &&
            entry.meditation;
    }).length;

    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

    return (
        <div className={styles.container}>
            {/* Streak Stats */}
            <div className={styles.statsGrid}>
                <StatsCard
                    title="Current Streak"
                    value={streaks.current}
                    subtitle={`${streaks.current} ${streaks.current === 1 ? 'day' : 'days'}`}
                    icon={Flame}
                    colorClass="text-orange"
                />
                <StatsCard
                    title="Longest Streak"
                    value={streaks.longest}
                    subtitle={`${streaks.longest} ${streaks.longest === 1 ? 'day' : 'days'}`}
                    icon={TrendingUp}
                    colorClass="text-green"
                />
                <StatsCard
                    title="Completion"
                    value={`${Math.round(completionRate)}%`}
                    subtitle={`${completedEntries}/${totalEntries} days`}
                    icon={TrendingUp}
                    colorClass="text-blue"
                />
            </div>
        </div>
    );
}
