
import React from "react";
import { Button } from "@/components/ui/button";
import { GlowEffect } from "@/components/ui/glow-effect";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface GlowButtonProps extends ButtonProps {
  glowColors?: string[];
  glowMode?: 'rotate' | 'pulse' | 'breathe' | 'colorShift' | 'flowHorizontal' | 'static';
  glowBlur?: 'softest' | 'soft' | 'medium' | 'strong' | 'stronger' | 'strongest' | 'none' | number;
  glowScale?: number;
  glowDuration?: number;
}

export function GlowButton({
  children,
  className,
  glowColors = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'],
  glowMode = 'colorShift',
  glowBlur = 'soft',
  glowScale = 1.15,
  glowDuration = 5,
  ...props
}: GlowButtonProps) {
  return (
    <div className="relative inline-flex group">
      <GlowEffect
        colors={glowColors}
        mode={glowMode}
        blur={glowBlur}
        scale={glowScale}
        duration={glowDuration}
        className="opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      />
      <Button 
        className={cn(
          "relative z-10 shadow-md transition-all duration-300 font-medium backdrop-blur-[2px]", 
          "hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]",
          "bg-background/60 border border-primary/20 text-foreground",
          "after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r after:from-transparent after:via-primary/5 after:to-transparent after:opacity-0 after:hover:opacity-100 after:transition-opacity after:z-[-1]",
          className
        )} 
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
