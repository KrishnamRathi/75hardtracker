"use client";
import React from 'react';
import { Home, BarChart2, Grid, User, CheckSquare } from 'lucide-react';
import styles from './BottomNav.module.css';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNav() {
    const pathname = usePathname();

    const items = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: CheckSquare, label: 'Habits', path: '/habits' },
        { icon: BarChart2, label: 'Insights', path: '/insights' },
        { icon: Grid, label: 'Gallery', path: '/gallery' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className={styles.nav}>
            {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link key={item.path} href={item.path} className={clsx(styles.item, isActive && styles.active)}>
                        <item.icon size={24} />
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
