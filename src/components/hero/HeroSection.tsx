
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  const handleGetStarted = () => {
    navigate('/chat');
  };
  
  return (
    <AuroraBackground className="min-h-screen w-full">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          
          <TextHoverEffect text="HealthyAI" className="pb-4 md:pb-8" />

          <h2 className={`text-lg sm:text-xl md:text-2xl text-foreground max-w-2xl mx-auto mb-6 sm:mb-8 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            The only platform that combines advanced health metrics tracking with
            AI-powered insights for your wellness journey.
          </h2>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <Button 
              size={isMobile ? "default" : "lg"} 
              className={`rounded-full relative overflow-hidden ${isMobile ? 'px-6 py-5 text-sm w-full' : 'px-8 py-6 text-base'} font-semibold
                bg-gradient-to-r from-purple-600 via-pink-600 to-blue-500 hover:from-purple-500 hover:via-pink-500 hover:to-blue-400
                text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
              onClick={handleGetStarted}
            >
              <span className="relative z-10 flex items-center justify-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 animate-pulse-subtle" />
              </span>
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "lg"} 
              className={`rounded-full ${isMobile ? 'px-6 py-5 text-sm w-full' : 'px-8 py-6 text-base'} hover:bg-secondary/80 transition-all duration-300`}
            >
              View Demo
            </Button>
          </div>
        </div>

        <motion.div 
          className={`absolute bottom-0 left-0 right-0 flex justify-center pb-8 sm:pb-12 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <a href="#features" className="flex flex-col items-center justify-center text-xs sm:text-sm text-foreground/70 hover:text-foreground transition-colors">
            <span className="mb-2">Scroll to learn more</span>
            <div className="w-5 h-9 sm:w-6 sm:h-10 border-2 border-foreground/50 rounded-full flex justify-center p-1">
              <div className="w-1 h-1 bg-foreground/70 rounded-full animate-bounce"></div>
            </div>
          </a>
        </motion.div>
      </section>
    </AuroraBackground>
  );
};

export default HeroSection;
