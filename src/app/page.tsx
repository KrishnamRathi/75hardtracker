"use client";
import React, { useState, useEffect } from 'react';
import { useHabit } from '@/context/HabitContext';
import TaskCard from '@/components/TaskCard';
import WaterTracker from '@/components/WaterTracker';
import BottomNav from '@/components/BottomNav';
import DateStrip from '@/components/DateStrip';
import { Dumbbell, Sun, BookOpen, Carrot, Camera, RotateCcw } from 'lucide-react';
import styles from './page.module.css';
import clsx from 'clsx';

import Onboarding from '@/components/Onboarding';

export default function Home() {
  const { entries, getEntry, toggleHabit, updateWater, startDate, setStartDate, startDateLocked, resetChallenge, setPhoto, hasSeenOnboarding, completeOnboarding } = useHabit();
  const [currentDate, setCurrentDate] = useState<string>('');
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Client-side date init
    setCurrentDate(new Date().toISOString().split('T')[0]);
  }, []);

  if (!currentDate) return null;

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const entry = getEntry(currentDate);

  const handleWaterAdd = () => {
    const newAmount = Math.min(entry.water + 500, 4000);
    updateWater(currentDate, newAmount);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setStartDate(e.target.value);
    }
  };

  const handlePhotoClick = () => {
    if (entry.photo) {
      // If already has photo, we could toggle off or ask to retake.
      // For now, let's toggle off to allow retaking easily, or just open camera again?
      // Let's toggle off so they can see the "Camera" state again if they want.
      // logic: setPhoto(currentDate, false, null);
      // OR better: Always open camera to retake.
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



  return (
    <main className="container" style={{ paddingTop: 0 }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div
            className={styles.challengeSelector}
            onClick={() => !startDateLocked && dateInputRef.current?.showPicker()}
            style={{ cursor: startDateLocked ? 'default' : 'pointer', position: 'relative' }}
          >
            Start: {new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {!startDateLocked && <span style={{ fontSize: 12, opacity: 0.7 }}> ▼</span>}

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
          onClick={() => toggleHabit(currentDate, 'workout1')}
          colorClass="text-blue"
          actionLabel={entry.workouts.indoor ? "Completed" : "Start"}
        />

        <TaskCard
          title="Second Workout"
          subtitle="45 min, outdoors"
          icon={Sun}
          completed={entry.workouts.outdoor}
          onClick={() => toggleHabit(currentDate, 'workout2')}
          colorClass="text-yellow"
          actionLabel={entry.workouts.outdoor ? "Completed" : "Start"}
        />

        <TaskCard
          title="Read 10 Pages"
          subtitle="Non-fiction"
          icon={BookOpen}
          completed={entry.reading}
          onClick={() => toggleHabit(currentDate, 'reading')}
          colorClass="text-orange"
        />

        <TaskCard
          title="Healthy Diet"
          subtitle="Follow reading"
          icon={Carrot}
          completed={entry.diet}
          onClick={() => toggleHabit(currentDate, 'diet')}
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
