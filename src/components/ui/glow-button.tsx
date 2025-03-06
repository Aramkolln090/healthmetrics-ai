
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
    <div className="relative inline-flex">
      <GlowEffect
        colors={glowColors}
        mode={glowMode}
        blur={glowBlur}
        scale={glowScale}
        duration={glowDuration}
      />
      <Button 
        className={cn(
          "relative z-10 shadow-md hover:shadow-lg transition-all duration-300", 
          className
        )} 
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
