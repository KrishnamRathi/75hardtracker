import React, { useState } from 'react';
import { Target, Check, Zap, ArrowRight } from 'lucide-react';

interface HabitOnboardingProps {
    onComplete: () => void;
}

const slides = [
    {
        title: "Daily Habits",
        subtitle: "The small things matter.",
        icon: Target,
        description: "Track minor habits that contribute to your overall well-being. These are personal and flexible.",
        color: "#0A84FF"
    },
    {
        title: "Stay Consistent",
        subtitle: "Consistency IS the goal.",
        icon: Zap,
        description: "Small daily wins lead to massive long-term results. Keep your streak alive!",
        color: "#FFD60A"
    },
    {
        title: "Independent Tracking",
        subtitle: "No pressure, just progress.",
        icon: Check,
        description: "Unlike 75 Hard, these habits won't reset your challenge. They are here to help you build a better lifestyle.",
        color: "#30D158"
    }
];

export default function HabitOnboarding({ onComplete }: HabitOnboardingProps) {
    const [current, setCurrent] = useState(0);

    const handleNext = () => {
        if (current < slides.length - 1) {
            setCurrent(current + 1);
        } else {
            onComplete();
        }
    };

    const SlideIcon = slides[current].icon;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #050505 0%, #111 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
        }}>
            <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `rgba(255,255,255,0.03)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
                boxShadow: `0 0 30px ${slides[current].color}30`,
                border: `1px solid ${slides[current].color}30`
            }}>
                <SlideIcon size={40} color={slides[current].color} />
            </div>

            <h1 className="heading-xl" style={{ textAlign: 'center', marginBottom: 12 }}>
                {slides[current].title}
            </h1>
            <p className="text-md" style={{ textAlign: 'center', opacity: 0.8, marginBottom: 24, fontWeight: 500 }}>
                {slides[current].subtitle}
            </p>
            <p className="text-sm" style={{ textAlign: 'center', opacity: 0.6, maxWidth: 300, lineHeight: 1.6 }}>
                {slides[current].description}
            </p>

            <div style={{ display: 'flex', gap: 8, marginTop: 40, marginBottom: 40 }}>
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: idx === current ? '#fff' : '#333',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>

            <button
                onClick={handleNext}
                style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: 30,
                    fontSize: 16,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                }}
            >
                {current === slides.length - 1 ? "Start Tracking" : "Next"}
                <ArrowRight size={18} />
            </button>
        </div>
    );
}
