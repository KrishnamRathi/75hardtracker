"use client";
import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import { useRouter } from 'next/navigation';
import TaskCard from '@/components/TaskCard';
import WaterTracker from '@/components/WaterTracker';
import BottomNav from '@/components/BottomNav';
import DateStrip from '@/components/DateStrip';
import { Dumbbell, Sun, BookOpen, Carrot, RotateCcw, Brain, Camera, BarChart2 } from 'lucide-react';
import styles from './page.module.css';
import { getIndiaDate } from '@/utils/dateUtils';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoFAB, { PhotoFABRef } from '@/components/PhotoFAB';

import Onboarding from '@/components/Onboarding';
import Login from '@/components/Login';
import SyncStatus from '@/components/SyncStatus';

export default function Home() {
  const {
    entries,
    getEntry,
    toggleHabit,
    updateWater,
    startDate,
    setStartDate,
    startDateLocked,
    resetChallenge,
    uploadPhoto,
    deletePhoto,
    hasSeenOnboarding,
    completeOnboarding,
    user,
    loading,
    userName
  } = useHabit();

  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('');
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const photoFabRef = React.useRef<PhotoFABRef>(null);

  useEffect(() => {
    // Client-side date init in IST
    setCurrentDate(getIndiaDate());
  }, []);

  if (loading) return null;
  if (!user) return <Login />;
  if (!currentDate) return null;

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const entry = getEntry(currentDate);
  const today = getIndiaDate();

  // Calculate remaining days based on incomplete tasks
  const calculateRemainingDays = () => {
    let completedDays = 0;
    const totalDays = 75;

    for (let i = 0; i < totalDays; i++) {
      if (!startDate) break;
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = getIndiaDate(date);
      if (!dateStr) continue;
      const dayEntry = getEntry(dateStr);

      // Check if all tasks are complete for this day
      const isComplete =
        dayEntry.workouts.indoor &&
        dayEntry.workouts.outdoor &&
        dayEntry.diet &&
        dayEntry.reading &&
        dayEntry.photos.length > 0 &&
        dayEntry.water >= 4000 &&
        dayEntry.meditation;

      if (isComplete) {
        completedDays++;
      }
    }

    return totalDays - completedDays;
  };

  const handleWaterAdd = () => {
    const newAmount = Math.min(entry.water + 500, 4000);
    updateWater(currentDate, newAmount);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setStartDate(e.target.value);
    }
  };

  const handleTaskClick = (habit: 'workout1' | 'workout2' | 'reading' | 'diet' | 'meditation') => {
    toggleHabit(currentDate, habit);
  };

  return (
    <main className="container" style={{ paddingTop: 0 }}>
      {/* Header */}
      <header className={styles.header}>
        <SyncStatus />
        <div className={styles.topRow}>
          <h1 className="heading-lg" style={{ margin: 0 }}>
            {userName ? `${userName.split(' ')[0]}'s 75 Hard` : '75 Days Hard'}
          </h1>
          <button
            className={styles.refreshBtn}
            onClick={() => {
              if (confirm("Reset challenge? This will clear all data.")) {
                resetChallenge();
              }
            }}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className={styles.statsRow} style={{ display: 'flex', gap: '16px', marginTop: '12px', marginBottom: '16px' }}>
          <div
            className={styles.statItem}
            onClick={() => !startDateLocked && dateInputRef.current?.showPicker()}
            style={{
              cursor: startDateLocked ? 'default' : 'pointer',
              opacity: startDateLocked ? 0.7 : 1,
              position: 'relative',
              flex: 1
            }}
          >
            <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>Start Date</span>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {!startDateLocked && <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 4 }}> ▼</span>}
            </span>
            {!startDateLocked && (
              <input
                type="date"
                ref={dateInputRef}
                min={today}
                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                onChange={handleDateChange}
                value={startDate}
              />
            )}
          </div>
          <div className={styles.statItem} style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>Current Day</span>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              Day {Math.floor((new Date(currentDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
            </span>
          </div>
          <div className={styles.statItem} style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>Remaining Days</span>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              {calculateRemainingDays()}
            </span>
          </div>
          <div
            onClick={() => router.push('/challenge-insights')}
            style={{
              cursor: 'pointer',
              background: 'rgba(10, 132, 255, 0.15)',
              border: '1px solid rgba(10, 132, 255, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              minWidth: '44px',
              height: '44px',
              color: '#0A84FF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(10, 132, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(10, 132, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <BarChart2 size={20} />
          </div>
        </div>

        {/* Date Strip */}
        <DateStrip
          startDate={startDate}
          selectedDate={currentDate}
          onSelectDate={setCurrentDate}
        />
      </header>

      {/* Grid */}
      <div className={styles.grid}>
        <TaskCard
          title="First Workout"
          subtitle="45 min"
          icon={Dumbbell}
          completed={entry.workouts.indoor}
          onClick={() => handleTaskClick('workout1')}
          colorClass="text-blue"
          actionLabel={entry.workouts.indoor ? "Completed" : "Start"}
        />

        <TaskCard
          title="Second Workout"
          subtitle="45 min, outdoors"
          icon={Sun}
          completed={entry.workouts.outdoor}
          onClick={() => handleTaskClick('workout2')}
          colorClass="text-yellow"
          actionLabel={entry.workouts.outdoor ? "Completed" : "Start"}
        />

        <TaskCard
          title="Read 10 Pages"
          subtitle="Non-fiction"
          icon={BookOpen}
          completed={entry.reading}
          onClick={() => handleTaskClick('reading')}
          colorClass="text-orange"
        />

        <TaskCard
          title="Healthy Diet"
          subtitle="Follow reading"
          icon={Carrot}
          completed={entry.diet}
          onClick={() => handleTaskClick('diet')}
          colorClass="text-green"
        />

        <TaskCard
          title="Progress Photo"
          subtitle="Physical tracking"
          icon={Camera}
          completed={entry.photos.length > 0}
          onClick={() => photoFabRef.current?.open()}
          colorClass="text-purple"
        />

        <WaterTracker
          current={entry.water}
          target={4000}
          onAdd={handleWaterAdd}
        />

        <TaskCard
          title="Meditation"
          subtitle="Mindfulness"
          icon={Brain}
          completed={entry.meditation}
          onClick={() => handleTaskClick('meditation')}
          colorClass="text-orange"
          actionLabel={entry.meditation ? "Completed" : "Pending"}
        />
      </div>

      <div style={{ marginTop: 24 }}>
      </div>

      <PhotoFAB ref={photoFabRef} onUpload={(file) => uploadPhoto(currentDate, file)} />

      <BottomNav />
    </main>
  );
}
