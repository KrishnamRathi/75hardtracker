"use client";
import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import TaskCard from '@/components/TaskCard';
import BottomNav from '@/components/BottomNav';
import ManageHabitsModal from '@/components/ManageHabitsModal';
import DailyHabitsAnalytics from '@/components/DailyHabitsAnalytics';
import DateStrip from '@/components/DateStrip';
import { Target, Sun, Moon, Sparkles, Brain, Music, Heart, Star, Coffee, Book, Dumbbell, Settings, LucideIcon } from 'lucide-react';
import styles from '../page.module.css';
import { getIndiaDate } from '@/utils/dateUtils';
import HabitOnboarding from '@/components/HabitOnboarding';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
    Target,
    Sun,
    Moon,
    Sparkles,
    Brain,
    Music,
    Heart,
    Star,
    Coffee,
    Book,
    Dumbbell,
};

export default function Habits() {
    const {
        getDailyHabitEntry,
        toggleDailyHabit,
        habitCategories,
        addHabitCategory,
        removeHabitCategory,
        reorderHabitCategories,
        user,
        loading,
        hasSeenHabitOnboarding,
        completeHabitOnboarding,
        startDate
    } = useHabit();
    const [currentDate, setCurrentDate] = useState<string>('');
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        setCurrentDate(getIndiaDate());
    }, []);

    if (loading) return null;
    if (!user) return null;
    if (!currentDate) return null;

    if (!hasSeenHabitOnboarding) {
        return <HabitOnboarding onComplete={completeHabitOnboarding} />;
    }

    const entry = getDailyHabitEntry(currentDate);

    return (
        <main className="container" style={{ paddingTop: 0 }}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Daily Habits</h1>
                    <button
                        onClick={() => setIsManageModalOpen(true)}
                        style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            color: 'var(--primary-color)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        }}
                    >
                        <Settings size={16} />
                        Manage
                    </button>
                </div>

                {/* Date Strip */}
                <DateStrip
                    startDate={startDate}
                    selectedDate={currentDate}
                    onSelectDate={setCurrentDate}
                    mode="habits"
                />
            </header>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

            <div className={styles.grid}>
                {habitCategories?.map((category) => {
                    const IconComponent = ICON_MAP[category.icon] || Target;
                    const isCompleted = entry[category.id] === true;

                    return (
                        <TaskCard
                            key={category.id}
                            title={category.name}
                            subtitle={category.subtitle}
                            icon={IconComponent}
                            completed={isCompleted}
                            onClick={() => toggleDailyHabit(currentDate, category.id)}
                            colorClass={category.colorClass}
                            actionLabel={isCompleted ? "Completed" : "Pending"}
                        />
                    );
                })}
            </div>

            <ManageHabitsModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                categories={habitCategories || []}
                onAdd={addHabitCategory}
                onDelete={removeHabitCategory}
                onReorder={reorderHabitCategories}
            />

            <BottomNav />
        </main>
    );
}
