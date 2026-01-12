"use client";
import React, { useState } from 'react';
import { X, Target, Sun, Moon, Heart, Star, Coffee, Book, Dumbbell, Brain, Music, Sparkles, Plus, Trash2, GripVertical, LucideIcon } from 'lucide-react';
import styles from './ManageHabitsModal.module.css';
import { HabitCategory } from '@/types';

interface ManageHabitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: HabitCategory[];
    onAdd: (habit: { name: string; subtitle: string; icon: string; colorClass: string }) => void;
    onDelete: (id: string) => void;
    onReorder: (newOrder: HabitCategory[]) => void;
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

const ICON_MAP: Record<string, LucideIcon> = {
    Target, Sun, Moon, Heart, Star, Coffee, Book, Dumbbell, Brain, Music, Sparkles
};

export default function ManageHabitsModal({ isOpen, onClose, categories, onAdd, onDelete, onReorder }: ManageHabitsModalProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Target');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);

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
            colorClass: 'text-blue',
        });
        // Reset form
        setName('');
        setSubtitle('');
        setSelectedIcon('Target');
        setShowAddForm(false);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedIndex];
        newCategories.splice(draggedIndex, 1);
        newCategories.splice(index, 0, draggedItem);

        onReorder(newCategories);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Touch drag handlers for mobile
    const handleTouchStart = (e: React.TouchEvent, index: number) => {
        setDraggedIndex(index);
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent, index: number) => {
        if (draggedIndex === null || touchStartY === null) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY;

        // Determine if we should swap with item above or below
        const itemHeight = 70; // Approximate height of each item
        const threshold = itemHeight / 2;

        if (Math.abs(deltaY) > threshold) {
            let targetIndex = index;
            if (deltaY > 0 && index < categories.length - 1) {
                // Moving down
                targetIndex = index + 1;
            } else if (deltaY < 0 && index > 0) {
                // Moving up
                targetIndex = index - 1;
            }

            if (targetIndex !== index && draggedIndex !== targetIndex) {
                const newCategories = [...categories];
                const draggedItem = newCategories[draggedIndex];
                newCategories.splice(draggedIndex, 1);
                newCategories.splice(targetIndex, 0, draggedItem);

                onReorder(newCategories);
                setDraggedIndex(targetIndex);
                setTouchStartY(currentY);
            }
        }
    };

    const handleTouchEnd = () => {
        setDraggedIndex(null);
        setTouchStartY(null);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            onDelete(id);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Manage Habits</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Habit List */}
                    <div className={styles.habitList}>
                        {categories.map((category, index) => {
                            const IconComponent = ICON_MAP[category.icon] || Target;
                            const isCustom = category.id.startsWith('custom_');

                            return (
                                <div
                                    key={category.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onTouchStart={(e) => handleTouchStart(e, index)}
                                    onTouchMove={(e) => handleTouchMove(e, index)}
                                    onTouchEnd={handleTouchEnd}
                                    className={styles.habitItem}
                                    style={{
                                        opacity: draggedIndex === index ? 0.5 : 1,
                                    }}
                                >
                                    <div className={styles.dragHandle}>
                                        <GripVertical size={20} />
                                    </div>
                                    <div className={styles.habitIcon}>
                                        <IconComponent size={20} className={category.colorClass} />
                                    </div>
                                    <div className={styles.habitInfo}>
                                        <div className={styles.habitName}>{category.name}</div>
                                        <div className={styles.habitSubtitle}>{category.subtitle}</div>
                                    </div>
                                    {isCustom && (
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(category.id, category.name)}
                                            title="Delete habit"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Habit Section */}
                    {!showAddForm ? (
                        <button
                            className={styles.addButton}
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus size={20} />
                            Add New Habit
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.addForm}>
                            <h3 className={styles.formTitle}>Add New Habit</h3>

                            <div className={styles.field}>
                                <label className={styles.label}>Habit Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Meditation"
                                    className={styles.input}
                                    maxLength={30}
                                    autoFocus
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
                                            <Icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setName('');
                                        setSubtitle('');
                                        setSelectedIcon('Target');
                                    }}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitButton}>
                                    Add Habit
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
