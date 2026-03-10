"use client";

import { useReducedMotion, motion } from "framer-motion";
import { profile } from "@/data/profile";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const nameLetters = profile.name.split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section
      id="hero"
      className="min-h-[90vh] flex flex-col justify-center py-24"
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-sm text-muted mb-6 tracking-widest uppercase">
              Portfolio
            </p>
            <h1
              aria-label={profile.name}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6"
            >
              <motion.span
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                aria-hidden="true"
                className="inline-block"
              >
                {nameLetters.map((letter, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="inline-block"
                    style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: 0.5 }}
              className="text-2xl text-muted mb-8"
            >
              {profile.role}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.8, duration: 0.5 }}
              className="text-base text-muted max-w-md leading-relaxed"
            >
              {profile.bio}
            </motion.p>
          </div>

          {/* Portrait placeholder */}
          <div className="flex justify-center md:justify-end">
            <div
              className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gray-100 flex items-center justify-center text-muted font-mono text-sm"
              role="img"
              aria-label="Profile portrait placeholder"
            >
              portrait
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: 0.5 }}
          className="mt-16 flex items-center gap-2 text-sm text-muted font-mono"
          aria-hidden="true"
        >
          <ChevronDown size={16} strokeWidth={2} className="animate-bounce" />
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
