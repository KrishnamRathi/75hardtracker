import React from 'react';
import { Droplets, Plus } from 'lucide-react';
import clsx from 'clsx';
import styles from './TaskCard.module.css'; // Reuse basic card styles but extend
import waterStyles from './WaterTracker.module.css';

interface WaterTrackerProps {
    current: number;
    target: number;
    onAdd: () => void;
}

export default function WaterTracker({ current, target, onAdd }: WaterTrackerProps) {
    const progress = Math.min((current / target) * 100, 100);
    const completed = current >= target;

    return (
        <div
            className={clsx(styles.card, completed && styles.completed)}
            onClick={onAdd}
        >
            <div className={styles.header}>
                <div className={clsx(styles.iconWrapper, 'text-blue-500')} style={{ color: '#0A84FF' }}>
                    <Droplets size={24} />
                </div>
                {completed && <div className={styles.check}><Plus size={16} /></div>}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>Water</h3>
                <p className={styles.subtitle} style={{ color: '#0A84FF' }}>
                    {(current / 1000).toFixed(1)}/{(target / 1000).toFixed(1)} L
                </p>

                {/* Progress Bar */}
                <div className={waterStyles.progressContainer}>
                    <div
                        className={waterStyles.progressBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
