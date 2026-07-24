"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MessageSquare } from "lucide-react";

export function BentoSocials() {
  const identity = useIdentity();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 }}
      className="col-span-1 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-center items-center gap-4 shadow-2xl relative overflow-hidden group order-7 lg:hidden"
    >
       <div className="flex gap-4">
         <a href={identity.social.github} target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"><Github size={20} /></a>
         <a href={identity.social.linkedin} target="_blank" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"><Linkedin size={20} /></a>
         <a href={`mailto:${identity.social.email}`} className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"><Mail size={20} /></a>
       </div>
       <div className="flex items-center gap-2 text-muted-foreground/30">
         <MessageSquare size={12} />
         <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Let&apos;s talk</span>
       </div>
    </motion.div>
  );
}
