"use client";
import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import TaskCard from '@/components/TaskCard';
import BottomNav from '@/components/BottomNav';
import { Target, Sun, Moon, Sparkles, Brain, Music } from 'lucide-react';
import styles from '../page.module.css';
import { getIndiaDate } from '@/utils/dateUtils';

export default function Habits() {
    const { getDailyHabitEntry, toggleDailyHabit, user, loading } = useHabit();
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        setCurrentDate(getIndiaDate());
    }, []);

    if (loading) return null;
    if (!user) return null;
    if (!currentDate) return null;

    const entry = getDailyHabitEntry(currentDate);

    return (
        <main className="container" style={{ paddingTop: 0 }}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Daily Habits</h1>
                </div>
                <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                    textAlign: 'center'
                }}>
                    {new Date(currentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </header>

            <div className={styles.grid}>
                <TaskCard
                    title="Work on Goals"
                    subtitle="Daily progress"
                    icon={Target}
                    completed={entry.workOnGoals}
                    onClick={() => toggleDailyHabit(currentDate, 'workOnGoals')}
                    colorClass="text-blue"
                    actionLabel={entry.workOnGoals ? "Completed" : "Pending"}
                />

                <TaskCard
                    title="Skin Care - Morning"
                    subtitle="Morning routine"
                    icon={Sun}
                    completed={entry.skinCareMorning}
                    onClick={() => toggleDailyHabit(currentDate, 'skinCareMorning')}
                    colorClass="text-yellow"
                    actionLabel={entry.skinCareMorning ? "Completed" : "Pending"}
                />

                <TaskCard
                    title="Skin Care - Night"
                    subtitle="Night routine"
                    icon={Moon}
                    completed={entry.skinCareNight}
                    onClick={() => toggleDailyHabit(currentDate, 'skinCareNight')}
                    colorClass="text-purple"
                    actionLabel={entry.skinCareNight ? "Completed" : "Pending"}
                />

                <TaskCard
                    title="Brush Teeth - Night"
                    subtitle="Before bed"
                    icon={Sparkles}
                    completed={entry.brushTeethNight}
                    onClick={() => toggleDailyHabit(currentDate, 'brushTeethNight')}
                    colorClass="text-green"
                    actionLabel={entry.brushTeethNight ? "Completed" : "Pending"}
                />



                <TaskCard
                    title="Guitar"
                    subtitle="Practice session"
                    icon={Music}
                    completed={entry.guitar}
                    onClick={() => toggleDailyHabit(currentDate, 'guitar')}
                    colorClass="text-blue"
                    actionLabel={entry.guitar ? "Completed" : "Pending"}
                />
            </div>

            <BottomNav />
        </main>
    );
}
