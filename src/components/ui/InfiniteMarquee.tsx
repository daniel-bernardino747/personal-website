"use client";

import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  slowOnHover?: boolean;
  parentIsHovered?: boolean;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  children,
  direction = "left",
  speed = 40,
  className = "",
  slowOnHover = false,
  parentIsHovered = false,
}) => {
  const x = useMotionValue(0);
  const xPercent = useTransform(x, (v) => `${v}%`);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const fromValue = direction === "left" ? 0 : -50;
    const toValue = direction === "left" ? -50 : 0;
    
    const controls = animate(x, [fromValue, toValue], {
      duration: speed,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop",
    });

    controlsRef.current = controls;

    return () => controls.stop();
  }, [direction, speed, x]);

  useEffect(() => {
    if (controlsRef.current) {
      const playbackRate = parentIsHovered && slowOnHover ? 0.33 : 1;
      controlsRef.current.speed = playbackRate;
    }
  }, [parentIsHovered, slowOnHover]);

  return (
    <div className={`overflow-hidden whitespace-nowrap flex mask-marquee ${className}`}>
      <motion.div
        style={{ x: xPercent }}
        className="flex shrink-0 min-w-full"
      >
        <div className="flex shrink-0 px-4 space-x-6 items-center">
          {children}
        </div>
        <div className="flex shrink-0 px-4 space-x-6 items-center">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
