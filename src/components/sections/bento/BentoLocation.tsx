"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { motion } from "framer-motion";
import { useState } from "react";
import { Globe } from "@/components/animate-ui/icons/globe";

export function BentoLocation() {
  const identity = useIdentity();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      viewport={{ once: true }}
      transition={{ delay: 0.4 }}
      className="col-span-1 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-end relative overflow-hidden shadow-2xl group order-5 lg:col-start-2 lg:row-start-3"
    >
      <div
        aria-hidden
        className="map-stencil absolute inset-0 text-accent pointer-events-none"
      />
      {/* Escurece a base do card para o nome da cidade não competir com as ruas. */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent pointer-events-none" />
      <div className="absolute top-4 right-4 text-foreground/60">
        <Globe animate={isHovered} size={16} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter leading-none mb-1">
          {identity.location.split(",")[0]}
          <span className="block text-muted-foreground text-base font-medium tracking-normal mt-0.5">{identity.location.split(",")[1]}</span>
        </h3>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">28°40&apos;44.110&quot; S, 49°22&apos;11.748&quot; W</span>
           <span className="text-[8px] font-mono text-accent/60 font-bold">- GMT-3</span>
        </div>
      </div>
    </motion.div>
  );
}
