"use client";

import { motion } from "framer-motion";
import { Mouse } from "lucide-react";

export function ScrollMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="hidden lg:flex flex-col items-center gap-2 absolute left-10 xl:left-20 top-1/2 -translate-y-1/2 text-muted-foreground/60 select-none pointer-events-none"
    >
      <div className="flex flex-col items-center">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Mouse size={24} strokeWidth={1.5} />
        </motion.div>
        
        <div className="h-12 w-px bg-linear-to-b from-muted-foreground/40 to-transparent mt-2" />
      </div>
      
      <span className="text-[10px] uppercase tracking-[0.2em] font-medium [writing-mode:vertical-rl] mt-2">
        Scroll
      </span>
    </motion.div>
  );
}
