'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface AvatarVideoProps {
  className?: string;
  containerClassName?: string;
}

export const AvatarVideo = memo(function AvatarVideo({ className, containerClassName }: AvatarVideoProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();
  return (
    <motion.div
      layoutId="avatar-video"
      layout
      layoutDependency={pathname}
      initial={false}
      transition={
        prefersReducedMotion
          ? { 
            duration: 0 
          }
          : { 
              layout: { type: 'spring', stiffness: 200, damping: 25, mass: 1 },
              opacity: { duration: 0.2 }
            }
      }
      className={containerClassName}
    >
      <video
        src="/avatar-animation.mp4"
        autoPlay
        loop
        muted
        playsInline
        className={`${className} bg-surface`}
      />
    </motion.div>
  );
});
