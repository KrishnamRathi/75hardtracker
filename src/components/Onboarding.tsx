import React, { useState } from 'react';
import { Dumbbell, Camera, BarChart2, ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';

interface OnboardingProps {
    onComplete: () => void;
}

const slides = [
    {
        title: "75 Days Hard",
        subtitle: "Transform your life with discipline.",
        icon: Dumbbell,
        description: "Commit to 5 critical daily habits. No excuses. If you fail, you start over.",
        color: "#0A84FF"
    },
    {
        title: "Track Daily",
        subtitle: "Stay consistent.",
        icon: Check,
        description: "Mark tasks as complete. Green completion rings show your success for the day.",
        color: "#30D158"
    },
    {
        title: "Photo & Gallery",
        subtitle: "Visual proof.",
        icon: Camera,
        description: "Take a progress photo every day. View your transformation in the Gallery.",
        color: "#BF5AF2"
    },
    {
        title: "Insights",
        subtitle: "Data driven.",
        icon: BarChart2,
        description: "Visualize your 75-day journey with the heatmap. Red means missed, Green means crushed it.",
        color: "#FF9F0A"
    }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
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
            background: 'linear-gradient(135deg, #111 0%, #000 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
        }}>
            <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `rgba(255,255,255,0.05)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
                boxShadow: `0 0 30px ${slides[current].color}40`,
                border: `1px solid ${slides[current].color}40`
            }}>
                <SlideIcon size={48} color={slides[current].color} />
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
                            width: 8,
                            height: 8,
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
                    padding: '16px 32px',
                    borderRadius: 30,
                    fontSize: 16,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                }}
            >
                {current === slides.length - 1 ? "Get Started" : "Next"}
                <ArrowRight size={18} />
            </button>
        </div>
    );
}
