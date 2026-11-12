"use client";

import { useDictionary } from "@/components/DictionaryProvider";
import { Emphasized } from "@/components/ui/Emphasized";
import { stack } from "@/data/stack";
import { motion } from "framer-motion";
import { CircuitBoard } from "@/components/animate-ui/icons/circuit-board";
import { useMemo, useState } from "react";
import { InfiniteMarquee } from "../../ui/InfiniteMarquee";

export function BentoCraft() {
  const t = useDictionary();
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
      className="col-span-1 row-span-2 bg-surface rounded-3xl border border-border p-6 flex flex-col shadow-2xl group order-6 lg:col-start-3 lg:row-start-2 overflow-hidden"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-3xl font-bold">{t.bento.craftTitle}</h3>
           <CircuitBoard animate={isHovered} size={20} className="text-accent/60" />
        </div>
        <div className="h-1 w-10 bg-accent/60 rounded-full mb-3" />
        <p className="text-muted-foreground text-sm leading-snug">
          <Emphasized text={t.bento.craftLead} className="text-foreground font-semibold" />
        </p>
      </div>
      
      <div className="mb-4">
        <p className="text-muted-foreground text-[13px] leading-relaxed">
          {t.bento.craftBody}
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
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface backdrop-blur-sm hover:border-accent/40 transition-colors group cursor-default"
                >
                  {/* The SVG is a mask, so every logo takes the text colour: one
                      consistent set in both themes, brighter on hover. */}
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 bg-muted-foreground transition-colors duration-300 group-hover:bg-foreground"
                    style={{
                      maskImage: `url(${tech.iconImage})`,
                      maskSize: "contain",
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                    }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80 group-hover/status:text-emerald-500 transition-colors">{t.bento.openToCollaboration}</span>
      </div>
    </motion.div>
  );
}
