"use client";

import { profile } from "@/data/profile";
import { motion } from "framer-motion";
import Image from "next/image";

export function BentoBrand() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="col-span-1 row-span-1 bg-zinc-900/50 rounded-3xl border border-white/10 p-6 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group order-1 transition-colors duration-300"
    >
      <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-1" />
      
      {/* Background Avatar Image */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20 group-hover:opacity-10 transition-opacity duration-500"
        whileHover={{ 
          rotate: [0, -1, 1, -1, 1, 0],
          scale: 1.05
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        <Image 
          src="/images/me-1.jpg" 
          alt={profile.name}
          fill 
          className="object-cover"
        />
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Primary Content Container */}
        <motion.div 
          className="flex flex-col items-center group-hover:-translate-y-6 transition-transform duration-500"
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-[0.9]">
            {profile.name.split(" ")[0]} <br />
            <span className="text-white/90">{profile.name.split(" ")[1]}</span>
          </h2>
          <div className="h-px w-10 bg-white/20 my-3" />
          <p className="text-[9px] md:text-[10px] tracking-[0.2em] text-white/40 font-bold uppercase">
            {profile.role[0]}
          </p>
        </motion.div>
        
        {/* Absolute "Let's Connect" Button (does not affect centering) */}
        <motion.a 
          href="#contact"
          className="absolute bottom-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80 hover:bg-accent/20 hover:border-accent/40 hover:text-accent transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto"
        >
          Let&apos;s Connect
        </motion.a>
      </div>
    </motion.div>
  );
}
