
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

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
  const locoScroll = useRef<any>(null);

  useEffect(() => {
    // Import locomotive-scroll dynamically
    const initLocomotiveScroll = async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        
        // Initialize locomotive-scroll
        locoScroll.current = new LocomotiveScroll({
          el: document.querySelector('[data-scroll-container]')!,
          smooth: true,
          smartphone: {
            smooth: true,
          },
          tablet: {
            smooth: true,
          },
          reloadOnContextChange: true,
        });

        // Update scroll position
        locoScroll.current.on('scroll', (instance: any) => {
          setScroll(instance.scroll.y);
        });

        // Add some delay for elements to be properly measured
        setTimeout(() => {
          locoScroll.current.update();
        }, 500);

        // Cleanup
        return () => {
          if (locoScroll.current) {
            locoScroll.current.destroy();
          }
        };
      } catch (error) {
        console.error('Failed to initialize Locomotive Scroll:', error);
      }
    };

    initLocomotiveScroll();

    return () => {
      if (locoScroll.current) {
        locoScroll.current.destroy();
      }
    };
  }, []);

  // Update locomotive scroll when the window is resized
  useEffect(() => {
    const handleResize = () => {
      if (locoScroll.current) {
        locoScroll.current.update();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scroll }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
