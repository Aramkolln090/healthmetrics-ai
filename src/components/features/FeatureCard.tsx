
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  index?: number;
}

const FeatureCard = ({
  title,
  description,
  icon,
  className,
  index = 0,
}: FeatureCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "glass-panel p-6 md:p-8 rounded-2xl transition-all duration-700 group hover:shadow-xl relative overflow-hidden flex flex-col",
        isInView ? "animate-scale-in opacity-100" : "opacity-0",
        className
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
