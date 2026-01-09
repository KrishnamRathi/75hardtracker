import React from 'react';
import { LucideIcon, Check } from 'lucide-react';
import clsx from 'clsx';
import styles from './TaskCard.module.css';

interface TaskCardProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    completed: boolean;
    onClick: () => void;
    colorClass?: string;
    actionLabel?: string;
}

export default function TaskCard({
    title,
    subtitle,
    icon: Icon,
    completed,
    onClick,
    colorClass = 'text-primary',
}: TaskCardProps) {
    return (
        <div
            className={clsx(styles.card, completed && styles.completed)}
            onClick={onClick}
        >
            <div className={styles.header}>
                <div className={clsx(styles.iconWrapper, colorClass)}>
                    <Icon size={24} />
                </div>
                {completed && <div className={styles.check}><Check size={16} /></div>}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                {!completed && (
                    <div className={styles.actionBadge}>{'Pending'}</div>
                )}
            </div>
        </div>
    );
}
