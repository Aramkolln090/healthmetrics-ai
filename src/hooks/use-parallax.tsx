
import { useEffect, useState, useRef } from 'react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  easing?: number;
}

export const useParallax = ({ 
  speed = 0.1, 
  direction = 'up',
  easing = 0.1 
}: ParallaxOptions = {}) => {
  const [position, setPosition] = useState(0);
  const elementRef = useRef<HTMLElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousScrollY = useRef(0);
  const currentPosition = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      let targetPosition = 0;
      if (elementRef.current) {
        const { top, height } = elementRef.current.getBoundingClientRect();
        const elementCenter = top + height / 2;
        const windowCenter = window.innerHeight / 2;
        const distance = elementCenter - windowCenter;
        
        // Adjust the parallax offset based on direction
        switch (direction) {
          case 'up':
            targetPosition = distance * speed;
            break;
          case 'down':
            targetPosition = -distance * speed;
            break;
          case 'left':
            targetPosition = distance * speed;
            break;
          case 'right':
            targetPosition = -distance * speed;
            break;
        }
      }
      
      // Apply easing to make smoother transitions
      currentPosition.current += (targetPosition - currentPosition.current) * easing;
      setPosition(currentPosition.current);
      previousScrollY.current = scrollY;
      
      requestRef.current = requestAnimationFrame(handleScroll);
    };
    
    requestRef.current = requestAnimationFrame(handleScroll);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [speed, direction, easing]);
  
  return { ref: elementRef, position };
};
