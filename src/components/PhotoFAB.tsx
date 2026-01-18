import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Camera, Image as ImageIcon, Plus, Upload } from 'lucide-react';
import styles from './PhotoFAB.module.css';
import clsx from 'clsx';

export interface PhotoFABRef {
    open: () => void;
}

interface PhotoFABProps {
    onUpload: (file: File) => Promise<string>;
}

const PhotoFAB = forwardRef<PhotoFABRef, PhotoFABProps>(({ onUpload }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true)
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await onUpload(file);
            setIsOpen(false);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container}>
            {/* Action Buttons (Visible when open) */}
            <div className={clsx(styles.options, isOpen && styles.visible)}>
                <button
                    className={clsx(styles.fab, styles.option)}
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    title="Take Photo"
                >
                    {uploading ? <Upload size={20} className={styles.spin} /> : <Camera size={20} />}
                </button>

                <button
                    className={clsx(styles.fab, styles.option)}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Gallery"
                >
                    {uploading ? <Upload size={20} className={styles.spin} /> : <ImageIcon size={20} />}
                </button>
            </div>

            {/* Main Toggle Button */}
            <button
                className={clsx(styles.fab, styles.main, isOpen && styles.active)}
                onClick={() => setIsOpen(!isOpen)}
                disabled={uploading}
            >
                <Plus size={24} className={styles.plusIcon} />
            </button>

            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
});

PhotoFAB.displayName = 'PhotoFAB';

export default PhotoFAB;

