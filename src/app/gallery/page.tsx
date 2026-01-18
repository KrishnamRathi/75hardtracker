"use client";
import React, { useState } from 'react';
import BottomNav from "@/components/BottomNav";
import { useHabit } from '@/context/HabitContext';
import { DailyProgress } from '@/types';

export default function Gallery() {
    const { entries, startDate } = useHabit();
    const [selectedPhoto, setSelectedPhoto] = useState<{ date: string; url: string } | null>(null);

    // Get all photos
    const photos = Object.values(entries)
        .filter(e => e.photos && e.photos.length > 0)
        .flatMap(e => e.photos.map(url => ({ date: e.date, url })))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate day number relative to start date
    const getDayNum = (dateStr: string) => {
        const start = new Date(startDate);
        const current = new Date(dateStr);
        const diffTime = Math.abs(current.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="container" style={{ paddingBottom: 100 }}>
            <header style={{ marginBottom: 32, paddingTop: 20 }}>
                <h1 className="heading-xl">Gallery</h1>
                <p className="text-sm">Your Progress Photos</p>
            </header>

            {photos.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 100, opacity: 0.5 }}>
                    <p>No photos yet.</p>
                    <p className="text-sm">Take a photo from the Home screen.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: 12
                }}>
                    {photos.map((item) => (
                        <div
                            key={`${item.date}-${item.url}`}
                            onClick={() => setSelectedPhoto(item)}
                            style={{
                                position: 'relative',
                                aspectRatio: '3/4',
                                borderRadius: 12,
                                overflow: 'hidden',
                                backgroundColor: '#333',
                                cursor: 'pointer'
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt={`Day ${getDayNum(item.date)}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '8px 4px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                fontSize: 10,
                                fontWeight: 600,
                                textAlign: 'center'
                            }}>
                                Day {getDayNum(item.date)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20
                    }}
                    onClick={() => setSelectedPhoto(null)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={selectedPhoto.url}
                        alt="Full view"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80vh',
                            objectFit: 'contain',
                            borderRadius: 8
                        }}
                    />
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <h2 className="heading-lg">Day {getDayNum(selectedPhoto.date)}</h2>
                        <p className="text-sm" style={{ opacity: 0.7 }}>{new Date(selectedPhoto.date).toLocaleDateString()}</p>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
