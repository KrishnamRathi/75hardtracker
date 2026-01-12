"use client";
import React, { useState } from 'react';
import { X, Target, Sun, Moon, Heart, Star, Coffee, Book, Dumbbell, Brain, Music, Sparkles, LucideIcon } from 'lucide-react';
import styles from './AddHabitModal.module.css';
import clsx from 'clsx';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (habit: { name: string; subtitle: string; icon: string; colorClass: string }) => void;
}

const ICON_OPTIONS = [
    { name: 'Target', component: Target },
    { name: 'Sun', component: Sun },
    { name: 'Moon', component: Moon },
    { name: 'Heart', component: Heart },
    { name: 'Star', component: Star },
    { name: 'Coffee', component: Coffee },
    { name: 'Book', component: Book },
    { name: 'Dumbbell', component: Dumbbell },
    { name: 'Brain', component: Brain },
    { name: 'Music', component: Music },
    { name: 'Sparkles', component: Sparkles },
];

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Target');
    const [selectedColor, setSelectedColor] = useState('text-blue');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter a habit name');
            return;
        }
        onAdd({
            name: name.trim(),
            subtitle: subtitle.trim() || 'Custom habit',
            icon: selectedIcon,
            colorClass: selectedColor,
        });
        // Reset form
        setName('');
        setSubtitle('');
        setSelectedIcon('Target');
        setSelectedColor('text-blue');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add Custom Habit</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Habit Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Meditation"
                            className={styles.input}
                            maxLength={30}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Subtitle</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g., 10 minutes"
                            className={styles.input}
                            maxLength={30}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Icon</label>
                        <div className={styles.iconGrid}>
                            {ICON_OPTIONS.map(({ name, component: Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={`${styles.iconButton} ${selectedIcon === name ? styles.selected : ''}`}
                                    onClick={() => setSelectedIcon(name)}
                                >
                                    <Icon size={24} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Add Habit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
