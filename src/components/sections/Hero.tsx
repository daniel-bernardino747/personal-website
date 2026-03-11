"use client";

import { profile } from "@/data/profile";
import { motion, useReducedMotion } from "framer-motion";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AIInput } from "../AIInput";
import { ScrollMessage } from "./ScrollMessage";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const items = [profile.name, ...profile.role];

  useEffect(() => {
    const delay = currentIndex === 0 ? 6000 : 2000;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [currentIndex, items.length]);

  const gradientClass = currentIndex === 0 
    ? "from-emerald-400 to-teal-500" 
    : "from-violet-400 to-indigo-500";

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  return (
    <section
      id="hero"
      className="min-h-[80vh] flex flex-col justify-center items-center py-32 text-center relative overflow-hidden"
    >
      <ScrollMessage />
      <div className="max-w-5xl mx-auto px-6 w-full flex flex-col items-center">
        {/* Avatar */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: prefersReducedMotion ? 0.9 : 0.5, 
            y: prefersReducedMotion ? 0 : -100 
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 1
          }}
          className="mb-10 relative"
        >
          <video
            src="/avatar-animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-2 border-accent/20"
          />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.h1 
            layout
            transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 min-h-[1.2em] flex items-center justify-center"
          >
            <span className="text-foreground mr-3">Hi, I&apos;m </span>
            <div className="relative h-[1.2em] flex items-center justify-center overflow-visible">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut", 
                    delay: 0.1 
                  }}
                  className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent inline-block`}
                >
                  {items[currentIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.h1>
          <AIInput />
        </motion.div>
      </div>
    </section>
  );
}
