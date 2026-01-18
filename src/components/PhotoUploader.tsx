import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, X, Upload } from 'lucide-react';
import styles from './PhotoUploader.module.css';
import clsx from 'clsx';

interface PhotoUploaderProps {
    photos: string[];
    onUpload: (file: File) => Promise<string>;
    onDelete: (url: string) => Promise<void>;
    readOnly?: boolean;
    variant?: 'default' | 'grid-only';
}

export default function PhotoUploader({
    photos = [],
    onUpload,
    onDelete,
    readOnly = false,
    variant = 'default'
}: PhotoUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    const isGridOnly = variant === 'grid-only';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await onUpload(file);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
            // Reset inputs
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const handleDelete = async (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this photo?")) {
            try {
                await onDelete(url);
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete photo.");
            }
            if (viewingPhoto === url) setViewingPhoto(null);
        }
    };

    return (
        <div className={clsx(styles.container, isGridOnly && styles.gridOnly)}>
            {!isGridOnly && (
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconContainer}>
                            <Camera size={20} className="text-purple" />
                        </div>
                        <div className={styles.textInfo}>
                            <h3 className={styles.title}>Progress Body Photos</h3>
                            <p className={styles.subtitle}>Track your physical changes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className={styles.grid}>
                    {photos.map((url, index) => (
                        <div
                            key={url}
                            className={styles.photoItem}
                            onClick={() => setViewingPhoto(url)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Progress ${index + 1}`} className={styles.image} />

                            {!readOnly && (
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDelete(url, e)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            {!readOnly && !isGridOnly && (
                <div className={styles.actions}>
                    <button
                        className={styles.actionBtn}
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? <Upload size={18} className={styles.spin} /> : <Camera size={18} />}
                        <span>Take Photo</span>
                    </button>

                    <button
                        className={styles.actionBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? <Upload size={18} className={styles.spin} /> : <ImageIcon size={18} />}
                        <span>Gallery</span>
                    </button>
                </div>
            )}

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

            {/* Lightbox */}
            {viewingPhoto && (
                <div className={styles.lightbox} onClick={() => setViewingPhoto(null)}>
                    <button className={styles.closeBtn} onClick={() => setViewingPhoto(null)}>
                        <X size={24} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={viewingPhoto} alt="Full view" className={styles.lightboxImage} />
                </div>
            )}
        </div>
    );
}
