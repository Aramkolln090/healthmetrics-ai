
import React, { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ParallaxSection: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = '',
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const calculateTransform = (progress: MotionValue<number>) => {
    switch (direction) {
      case 'up':
        return useTransform(progress, [0, 1], ['0%', `${-100 * speed}%`]);
      case 'down':
        return useTransform(progress, [0, 1], ['0%', `${100 * speed}%`]);
      case 'left':
        return useTransform(progress, [0, 1], ['0%', `${-100 * speed}%`]);
      case 'right':
        return useTransform(progress, [0, 1], ['0%', `${100 * speed}%`]);
      default:
        return useTransform(progress, [0, 1], ['0%', `${-100 * speed}%`]);
    }
  };

  const y = direction === 'up' || direction === 'down' 
    ? calculateTransform(scrollYProgress) 
    : useTransform(scrollYProgress, [0, 1], ['0%', '0%']);
    
  const x = direction === 'left' || direction === 'right'
    ? calculateTransform(scrollYProgress)
    : useTransform(scrollYProgress, [0, 1], ['0%', '0%']);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y, x }}
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
