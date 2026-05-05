import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  error?: boolean;
  dropUp?: boolean;
}

export function Select({ value, onChange, options, placeholder = "Select...", className = "", icon, error, dropUp = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-black/80 backdrop-blur-xl border 
          ${error ? 'border-rose-500/50 focus:border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(255,255,255,0.03)]' : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]'} 
          rounded-2xl py-4 ${icon ? 'pl-12' : 'pl-6'} pr-10 text-white text-sm outline-none transition-all cursor-pointer shadow-xl flex items-center justify-between
        `}
      >
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        
        <span className={`truncate font-black tracking-widest uppercase text-[11px] ${!selectedOption ? 'text-slate-500' : 'text-white'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[100] w-full ${dropUp ? 'bottom-full mb-2' : 'mt-2'} bg-black/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden`}
          >
            <div className="max-h-60 overflow-y-auto p-2 overscroll-contain">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-xs font-black tracking-widest uppercase transition-all
                      ${isSelected ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-primary" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
