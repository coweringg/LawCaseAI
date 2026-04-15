import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton = ({ 
    className = "", 
    width, 
    height, 
    borderRadius, 
    variant = 'rounded' 
}: SkeletonProps) => {
    const getBorderRadius = () => {
        if (borderRadius) return borderRadius;
        if (variant === 'circular') return '9999px';
        if (variant === 'rounded') return '1rem';
        return '0';
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ 
                opacity: [0.3, 0.6, 0.3],
                background: [
                    'rgba(255, 255, 255, 0.03)', 
                    'rgba(255, 255, 255, 0.08)', 
                    'rgba(255, 255, 255, 0.03)'
                ]
            }}
            transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
            className={`overflow-hidden relative ${className}`}
            style={{ 
                width: width || '100%', 
                height: height || '20px',
                borderRadius: getBorderRadius(),
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
        >
            <motion.div 
                animate={{ 
                    x: ['-100%', '100%'] 
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
        </motion.div>
    );
};
