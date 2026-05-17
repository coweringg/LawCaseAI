"use client";

import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  yOffset = 20, 
  duration = 0.5,
  className,
  as: Component = 'div',
  ...props 
}: ScrollRevealProps & { as?: keyof typeof motion }) {
  const MotionComponent = (motion as any)[Component] || motion.div;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
