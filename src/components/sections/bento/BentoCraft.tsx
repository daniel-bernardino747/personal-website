"use client";

import { stack } from "@/data/stack";
import { motion } from "framer-motion";
import { CircuitBoard } from "@/components/animate-ui/icons/circuit-board";
import Image from "next/image";
import { useMemo, useState } from "react";
import { InfiniteMarquee } from "../../ui/InfiniteMarquee";

export function BentoCraft() {
  const [isStacksHovered, setIsStacksHovered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const rowSpeeds = useMemo(() => stack.map(() => 25 + Math.random() * 15), []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="col-span-1 row-span-2 bg-zinc-900/50 rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl group order-6 lg:col-start-3 lg:row-start-2 overflow-hidden"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-3xl font-bold">Craft</h3>
           <CircuitBoard animate={isHovered} size={20} className="text-accent/60" />
        </div>
        <div className="h-1 w-10 bg-accent/60 rounded-full mb-3" />
        <p className="text-white/50 text-sm leading-snug">
          Building scalable <span className="text-white font-semibold">apps, websites, and automations.</span>
        </p>
      </div>
      
      <div className="mb-4">
        <p className="text-white/40 text-[13px] leading-relaxed">
          I understand what advantages modern tech can provide, helping me advise on the solutions a business actually needs.
        </p>
      </div>

      {/* Infinite Marquee Bands */}
      <div 
        className="flex flex-col gap-0 -mx-6 mb-6"
        onMouseEnter={() => setIsStacksHovered(true)}
        onMouseLeave={() => setIsStacksHovered(false)}
      >
        {stack.map((item, index) => (
          <div key={index} className="flex flex-col">
            <InfiniteMarquee 
              direction={index % 2 === 0 ? "left" : "right"} 
              speed={rowSpeeds[index]}
              slowOnHover={true}
              parentIsHovered={isStacksHovered}
              className="py-3 border-y border-white/5 bg-white/2"
            >
              {item.related.map((tech, techIndex) => (
                <div 
                  key={techIndex} 
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent/40 transition-colors group cursor-default"
                >
                  <div className="relative w-4 h-4 grayscale group-hover:grayscale-0 transition-all duration-300">
                    <Image
                      src={tech.iconImage}
                      alt={tech.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-white/60 group-hover:text-white transition-colors">
                    {tech.name}
                  </span>
                </div>
              ))}
            </InfiniteMarquee>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl group/status">
        <div className="w-2 h-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80 group-hover/status:text-emerald-500 transition-colors">Open to collaboration</span>
      </div>
    </motion.div>
  );
}
