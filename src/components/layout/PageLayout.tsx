import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageLayoutProps {
  children: ReactNode;
  withPadding?: boolean;
  withNavbar?: boolean;
  className?: string;
}

/**
 * PageLayout - A consistent layout wrapper for all pages
 * 
 * @param children - The page content
 * @param withPadding - Whether to add standard page padding
 * @param withNavbar - Whether to include the navbar (default: true)
 * @param className - Additional classes to apply to the content container
 */
const PageLayout: React.FC<PageLayoutProps> = ({ 
  children,
  withPadding = true,
  withNavbar = true,
  className = ""
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {withNavbar && <Navbar />}
      
      <main className={`flex-grow flex flex-col ${withNavbar ? 'pt-16' : 'pt-0'}`}>
        <div className={`
          h-full w-full max-h-[calc(100vh-80px)] 
          ${withPadding ? 'p-6' : ''} 
          ${className}
        `}>
          <ScrollArea className="h-full w-full">
            {children}
          </ScrollArea>
        </div>
      </main>
    </div>
  );
};

export default PageLayout; 