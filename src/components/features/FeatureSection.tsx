import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Define the feature step type
interface FeatureStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

interface FeatureSectionProps {
  steps: FeatureStep[];
  autoPlayDuration?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function FeatureSection({
  steps,
  autoPlayDuration = 5000,
  className,
  title = "How it works",
  subtitle = "Follow these simple steps to get started with our platform"
}: FeatureSectionProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const numSteps = steps.length;

  // Reset progress when active step changes
  useEffect(() => {
    setProgress(0);
    
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (autoPlayDuration / 100));
        if (newProgress >= 100) {
          // Move to next step when progress reaches 100%
          setActiveStep(prevStep => (prevStep + 1) % numSteps);
          return 0;
        }
        return newProgress;
      });
    }, 100);
    
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [activeStep, autoPlayDuration, numSteps]);

  return (
    <section className={cn("py-20 overflow-hidden", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Steps */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-border">
              <div 
                className="absolute w-[1px] bg-primary transition-all duration-500" 
                style={{ 
                  top: 0, 
                  height: `${((activeStep + 1) / numSteps) * 100}%`
                }} 
              />
            </div>
            
            <div className="space-y-12">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "relative pl-16 transition-all duration-300",
                      isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                    )}
                  >
                    {/* Step indicator */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300",
                        isCompleted ? "bg-primary/10 border-primary" : 
                        isActive ? "bg-primary/5 border-primary" : 
                        "bg-muted border-border"
                      )}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-6 w-6 text-primary" />
                      ) : (
                        <div className={cn(
                          "flex items-center justify-center rounded-full w-10 h-10",
                          isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div 
                      className="cursor-pointer" 
                      onClick={() => setActiveStep(index)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="mr-3 text-primary">
                          {step.icon}
                        </div>
                        <h3 className={cn(
                          "text-xl font-semibold transition-colors duration-300",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      
                      {isActive && (
                        <div className="mt-4">
                          <Progress value={progress} className="h-1 w-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveStep(prevStep => prevStep > 0 ? prevStep - 1 : numSteps - 1)}
              >
                Previous
              </Button>
              <Button 
                onClick={() => setActiveStep(prevStep => (prevStep + 1) % numSteps)}
              >
                Next <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Right side - Image */}
          <div className="relative h-[500px] shadow-2xl rounded-2xl overflow-hidden border">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={steps[activeStep].image} 
                  alt={`Step ${activeStep + 1}: ${steps[activeStep].title}`}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-white/80">
                    {steps[activeStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Step dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === activeStep 
                      ? "bg-white w-8" 
                      : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 