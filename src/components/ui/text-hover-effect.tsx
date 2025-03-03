
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TextHoverEffectProps {
  text: string;
  className?: string;
  textClassName?: string;
}

export function TextHoverEffect({
  text,
  className,
  textClassName,
}: TextHoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charactersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto max-w-5xl overflow-hidden",
        className
      )}
    >
      <h1 className="flex flex-wrap text-center text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
        {text.split("").map((char, index) => (
          <span
            key={`${index}-${char}`}
            ref={(el) => (charactersRef.current[index] = el)}
            className={cn(
              "relative inline-block transition-transform duration-300 ease-out",
              char === " " ? "mr-6" : "",
              hoveredIndex === index
                ? "text-primary -translate-y-2 scale-110"
                : isInView 
                  ? "animate-slide-up opacity-0" 
                  : "opacity-0",
              textClassName
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "forwards",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}
