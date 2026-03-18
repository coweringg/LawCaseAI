import React from 'react';
import { motion } from 'framer-motion';

interface FloatingGlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  showHeader?: boolean;
}

const FloatingGlassCard: React.FC<FloatingGlassCardProps> = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 4,
  yOffset = 10,
  showHeader = false
}) => {
  return (
    <div className={`group transition-all duration-150 hover:scale-[1.03] hover:-translate-y-2 hover:rotate-1 will-change-transform transform-gpu ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: [0, -yOffset, 0],
        }}
        transition={{
          opacity: { duration: 0.8, delay },
          scale: { duration: 0.8, delay },
          y: {
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
          }
        }}
        className={`premium-glass border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_40px_80px_rgba(30,58,138,0.4)] transition-shadow duration-150 backdrop-blur-md rounded-2xl overflow-hidden cursor-default h-full w-full`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />
        
        {showHeader && (
          <div className="h-10 border-b border-white/5 bg-slate-900/50 flex items-center px-5 gap-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/20"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400/20"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400/20"></div>
            </div>
            <div className="h-4 w-32 bg-white/5 rounded-full flex items-center px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 opacity-60"></div>
              <div className="h-0.5 w-full bg-white/10 rounded"></div>
            </div>
          </div>
        )}

        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingGlassCard;
