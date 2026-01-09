"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useHabit } from '@/context/HabitContext';
import BottomNav from '@/components/BottomNav';
import styles from '../page.module.css';
import { LogOut } from 'lucide-react';

export default function Profile() {
    const { userName, logout, user } = useHabit();
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm("Are you sure you want to sign out?")) {
            await logout();
            router.push('/'); // Redirect to home (which will show login)
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.topRow}>
                    <h1 className="heading-lg" style={{ margin: 0 }}>Profile</h1>
                </div>
            </header>

            <div className={styles.grid} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Email
                    </label>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)'
                    }}>
                        {user?.email}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Display Name
                    </label>
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px'
                    }}>
                        {userName || user?.displayName || 'Not set'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Synced from your Google account
                    </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '14px',
                        background: 'rgba(255, 59, 48, 0.15)',
                        color: '#FF3B30',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
