'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/components/animate-ui/icons/icon';

type GlobeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    circle: {},
    // The meridian squashes to a line and opens back out, which is what a
    // wireframe globe looks like turning on its axis. The outline stays put —
    // rotating that too would read as the whole icon spinning, not the planet.
    meridian: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.06, 1],
        transition: {
          duration: 1.1,
          ease: 'easeInOut',
        },
      },
    },
    equator: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0.05, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GlobeProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        // `fill-box` puts the origin at the meridian's own centre — (12,12) —
        // so it squashes inward instead of sliding left. The non-scaling stroke
        // keeps the line from thinning out as it narrows.
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        vectorEffect="non-scaling-stroke"
        variants={variants.meridian}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 12h20"
        variants={variants.equator}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Globe(props: GlobeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Globe,
  Globe as GlobeIcon,
  type GlobeProps,
  type GlobeProps as GlobeIconProps,
};
