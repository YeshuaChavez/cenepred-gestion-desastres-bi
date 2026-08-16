'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
  distance?: number;
  durationMs?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  distance = 32,
  durationMs = 700
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const getTransformStyle = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0) scale(0.98)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0) scale(0.98)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0) scale(0.98)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0) scale(0.98)`;
      case 'zoom':
        return 'translate3d(0, 0, 0) scale(0.92)';
      case 'fade':
        return 'translate3d(0, 0, 0) scale(1)';
      default:
        return `translate3d(0, ${distance}px, 0) scale(0.98)`;
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransformStyle(),
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
