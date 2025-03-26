import React, { ReactNode, useEffect, useRef } from 'react';
import { SmoothScrollProvider } from '@/contexts/SmoothScrollContext';
import { useLocation } from 'react-router-dom';

interface SmoothScrollContainerProps {
  children: ReactNode;
}

const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Enable smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = anchor.getAttribute('href')?.replace('#', '');
        const element = document.getElementById(id || '');
        
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Prevent scrolling beyond footer
  useEffect(() => {
    const preventOverscroll = () => {
      if (containerRef.current) {
        const footer = document.querySelector('footer');
        if (footer) {
          // Set max-height for the content area to prevent scrolling beyond the footer
          const windowHeight = window.innerHeight;
          const footerHeight = footer.getBoundingClientRect().height;
          const mainContent = containerRef.current.querySelector('.main-content') as HTMLElement;
          
          if (mainContent) {
            const maxHeight = `calc(100vh - ${footerHeight}px)`;
            document.documentElement.style.setProperty('--main-content-max-height', maxHeight);
          }
        }
      }
    };

    preventOverscroll();
    window.addEventListener('resize', preventOverscroll);
    return () => window.removeEventListener('resize', preventOverscroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <SmoothScrollProvider>
      <div 
        ref={containerRef}
        data-scroll-container 
        className="relative min-h-screen w-full overflow-x-hidden bg-background flex flex-col"
      >
        <div className="main-content flex-grow overflow-y-auto">
          {children}
        </div>
        <button
          id="scroll-to-top"
          onClick={scrollToTop}
          className="hidden fixed bottom-6 right-6 z-50 items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300"
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
