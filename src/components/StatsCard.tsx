import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './StatsCard.module.css';
import clsx from 'clsx';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    colorClass?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    colorClass = 'text-primary',
}: StatsCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                {Icon && (
                    <div className={clsx(styles.iconWrapper, colorClass)}>
                        <Icon size={16} />
                    </div>
                )}
                <span className={styles.title}>{title}</span>
            </div>
            <div className={styles.value}>{value}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
    );
}
