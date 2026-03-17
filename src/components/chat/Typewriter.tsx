'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  animate?: boolean;
  onComplete?: () => void;
  onUpdate?: () => void;
}

export function Typewriter({ text, speed = 10, animate = true, onComplete, onUpdate }: TypewriterProps) {
  const [displayText, setDisplayText] = useState(animate ? '' : text);
  const [currentIndex, setCurrentIndex] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setDisplayText(text);
      setCurrentIndex(text.length);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        if (onUpdate) onUpdate();
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, animate]);

  return (
    <motion.span
      initial={{ opacity: animate ? 0 : 1 }}
      animate={{ opacity: 1 }}
      className="inline-block"
    >
      {displayText}
      {animate && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block ml-0.5 w-1 h-3.5 bg-accent/50 vertical-middle"
        />
      )}
    </motion.span>
  );
}
