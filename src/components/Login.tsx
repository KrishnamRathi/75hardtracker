"use client";
import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function Login() {
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Login failed", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, #000 0%, #111 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
        }}>
            <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
                boxShadow: '0 0 30px rgba(10, 132, 255, 0.3)',
                border: '1px solid rgba(10, 132, 255, 0.3)'
            }}>
                <Dumbbell size={48} color="#0A84FF" />
            </div>

            <h1 className="heading-xl" style={{ marginBottom: 16 }}>75 Days Hard</h1>
            <p className="text-md" style={{ opacity: 0.7, marginBottom: 48, textAlign: 'center' }}>
                Sign in to save your progress in the cloud.
            </p>

            <button
                onClick={handleGoogleLogin}
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
                    gap: 12,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                }}
            >
                {/* Simple Google G icon logic or text */}
                <span>Sign in with Google</span>
                <ArrowRight size={18} />
            </button>
        </div>
    );
}
