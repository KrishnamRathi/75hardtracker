"use client";
import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import TaskCard from '@/components/TaskCard';
import WaterTracker from '@/components/WaterTracker';
import BottomNav from '@/components/BottomNav';
import DateStrip from '@/components/DateStrip';
import { Dumbbell, Sun, BookOpen, Carrot, Camera, RotateCcw, Brain } from 'lucide-react';
import styles from './page.module.css';
import clsx from 'clsx';

import Onboarding from '@/components/Onboarding';
import Login from '@/components/Login';
import SyncStatus from '@/components/SyncStatus';

export default function Home() {
  const { entries, getEntry, toggleHabit, updateWater, startDate, setStartDate, startDateLocked, resetChallenge, setPhoto, hasSeenOnboarding, completeOnboarding, user, loading, userName } = useHabit();
  const [currentDate, setCurrentDate] = useState<string>('');
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Client-side date init
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  if (loading) return null; // Or spinner
  if (!user) return <Login />;

  if (!currentDate) return null;

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const entry = getEntry(currentDate);
  const today = new Date().toISOString().split('T')[0];
  const isToday = currentDate === today;

  // Calculate remaining days based on incomplete tasks
  const calculateRemainingDays = () => {
    let completedDays = 0;
    const totalDays = 75;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntry = getEntry(dateStr);

      // Check if all tasks are complete for this day
      const isComplete =
        dayEntry.workouts.indoor &&
        dayEntry.workouts.outdoor &&
        dayEntry.diet &&
        dayEntry.reading &&
        dayEntry.photo &&
        dayEntry.water >= 4000;

      if (isComplete) {
        completedDays++;
      }
    }

    return totalDays - completedDays;
  };

  const handleWaterAdd = () => {
    if (!isToday) return; // Disable for non-current dates
    const newAmount = Math.min(entry.water + 500, 4000);
    updateWater(currentDate, newAmount);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setStartDate(e.target.value);
    }
  };

  const handlePhotoClick = () => {
    if (!isToday) return; // Disable for non-current dates
    if (entry.photo) {
      fileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhoto(currentDate, true, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaskClick = (habit: 'workout1' | 'workout2' | 'reading' | 'diet' | 'meditation') => {
    if (!isToday) return; // Disable for non-current dates
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
        {!isToday && (
          <div style={{
            padding: '12px',
            background: 'rgba(255, 165, 0, 0.1)',
            borderRadius: '12px',
            marginBottom: '16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            ⚠️ You can only edit tasks for today. Switch to today's date to track your progress.
          </div>
        )}

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

        <WaterTracker
          current={entry.water}
          target={4000}
          onAdd={handleWaterAdd}
        />

        <TaskCard
          title="Progress Photo"
          subtitle="Take a selfie"
          icon={Camera}
          completed={entry.photo}
          onClick={handlePhotoClick}
          colorClass="text-purple"
          actionLabel={entry.photo ? "Retake" : "Camera"}
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

        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <BottomNav />
    </main>
  );
}
