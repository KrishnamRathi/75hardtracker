import React from 'react';
import { useHabit } from '@/context/HabitContext';
import { AlertTriangle } from 'lucide-react';

export default function SyncStatus() {
    const { error } = useHabit();

    if (!error) return null;

    return (
        <div style={{
            background: '#FF3B30',
            color: 'white',
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textAlign: 'center',
            marginBottom: 0
        }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
        </div>
    );
}
