"use client";

import { profile } from "@/data/profile";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function BentoLocation() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="col-span-1 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-end relative overflow-hidden shadow-2xl group order-5 lg:col-start-2 lg:row-start-3"
    >
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,#fff_0.5px,transparent_0.5px)] bg-size-[24px_24px]" />
      </div>
      <div className="absolute top-4 right-4 text-muted-foreground/30">
        <Globe size={16} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter leading-none mb-1">
          {profile.location.split(",")[0]}
          <span className="block text-muted-foreground text-base font-medium tracking-normal mt-0.5">{profile.location.split(",")[1]}</span>
        </h3>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">50.06° N, 19.94° E</span>
           <span className="text-[8px] font-mono text-accent/60 font-bold">- GMT+1</span>
        </div>
      </div>
    </motion.div>
  );
}
