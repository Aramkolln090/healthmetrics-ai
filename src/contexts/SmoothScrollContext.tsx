
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SmoothScrollContextType {
  scroll: number;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scroll: 0,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const [scroll, setScroll] = useState<number>(0);

  // Add basic scroll listener
  React.useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scroll }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
