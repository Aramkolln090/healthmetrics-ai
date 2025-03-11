
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

  // Add scroll-to-top button functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollButton = document.getElementById('scroll-to-top');
      if (scrollButton) {
        if (window.scrollY > 300) {
          scrollButton.classList.remove('hidden');
          scrollButton.classList.add('flex');
        } else {
          scrollButton.classList.remove('flex');
          scrollButton.classList.add('hidden');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <SmoothScrollProvider>
      <div data-scroll-container className="relative">
        {children}
        <button
          id="scroll-to-top"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </button>
      </div>
    </SmoothScrollProvider>
  );
};

export default SmoothScrollContainer;
