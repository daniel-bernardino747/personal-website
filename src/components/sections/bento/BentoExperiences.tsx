"use client";

import { motion } from "framer-motion";

export function BentoExperiences() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="col-span-2 lg:col-span-2 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-between shadow-2xl overflow-hidden relative group order-3 lg:order-2"
    >
      <div className="absolute inset-0 bg-linear-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-accent/40 transition-colors">Hover to read more</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full items-end mt-4 z-10">
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/90">Science Club</h3>
          <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">Active member of the GenAI Science Club. Training CV models.</p>
        </div>
        <div className="flex flex-col gap-2 border-y sm:border-y-0 sm:border-x border-border py-4 sm:py-0 sm:px-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/90">University</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">Pursuing Computer Science at UFSC.</p>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/90">Experience</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">Building high-performance web systems.</p>
        </div>
      </div>
    </motion.div>
  );
}
