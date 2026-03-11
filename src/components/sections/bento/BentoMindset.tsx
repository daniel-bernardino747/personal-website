"use client";

import { motion } from "framer-motion";

export function BentoMindset() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="col-span-1 row-span-2 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-between overflow-hidden relative group shadow-2xl order-4 lg:order-3 lg:col-start-1 lg:row-start-2"
    >
      <div>
        <h3 className="text-3xl font-bold mb-3">Mindset</h3>
        <p className="text-muted-foreground text-base leading-snug">
          <span className="text-foreground font-semibold">Building more than software.</span> My passions provide the <span className="text-foreground font-semibold">discipline and focus</span> I need to grow.
        </p>
      </div>
      
      <div className="mt-8 group-hover:-translate-y-2 transition-transform duration-500">
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-border">
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-4 left-4 z-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Focus & Discipline</span>
          </div>
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white/10 text-4xl">
            🌊
          </div>
        </div>
        <p className="mt-4 text-muted-foreground text-base leading-snug">
          Mastering body and mind is my path to <span className="text-foreground font-semibold">excellence.</span>
        </p>
      </div>
    </motion.div>
  );
}
