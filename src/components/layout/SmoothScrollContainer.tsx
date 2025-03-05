
import React, { ReactNode, useEffect } from 'react';
import { SmoothScrollProvider } from '@/contexts/SmoothScrollContext';
import { useLocation } from 'react-router-dom';

interface SmoothScrollContainerProps {
  children: ReactNode;
}

const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({ children }) => {
  const location = useLocation();
  
  // Reset scroll position when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SmoothScrollProvider>
      <div data-scroll-container className="relative">
        {children}
      </div>
    </SmoothScrollProvider>
  );
};

export default SmoothScrollContainer;
