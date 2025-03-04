
import React, { ReactNode } from 'react';
import { SmoothScrollProvider } from '@/contexts/SmoothScrollContext';

interface SmoothScrollContainerProps {
  children: ReactNode;
}

const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({ children }) => {
  return (
    <SmoothScrollProvider>
      <div data-scroll-container className="relative">
        {children}
      </div>
    </SmoothScrollProvider>
  );
};

export default SmoothScrollContainer;
