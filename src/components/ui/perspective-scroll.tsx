
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface PerspectiveImageProps {
  src: string;
  alt: string;
  index: number;
}

const PerspectiveImage: React.FC<PerspectiveImageProps> = ({ src, alt, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Calculate different transform values based on index (even/odd)
  const isEven = index % 2 === 0;
  const rotateValue = isEven ? [5, -5] : [-5, 5];
  const xValue = isEven ? ["10%", "-10%"] : ["-10%", "10%"];

  const rotate = useTransform(scrollYProgress, [0, 1], rotateValue);
  const translateX = useTransform(scrollYProgress, [0, 1], xValue);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.6, 1, 1, 0.6]);

  return (
    <div 
      ref={containerRef} 
      className="relative h-[500px] md:h-[700px] my-32 perspective-container"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          rotate,
          translateX,
          scale,
          opacity
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          className="object-cover w-[80%] h-[80%] rounded-lg shadow-xl"
        />
      </motion.div>
    </div>
  );
};

interface PerspectiveScrollProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
}

export const PerspectiveScroll: React.FC<PerspectiveScrollProps> = ({ images }) => {
  return (
    <div className="w-full">
      {images.map((image, index) => (
        <PerspectiveImage 
          key={index}
          src={image.src} 
          alt={image.alt} 
          index={index} 
        />
      ))}
    </div>
  );
};
