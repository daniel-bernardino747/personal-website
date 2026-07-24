"use client";

import { useIdentity } from "@/components/IdentityProvider";
import { motion } from "framer-motion";
import Image from "next/image";

export function BentoPhoto() {
  const identity = useIdentity();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="col-span-1 row-span-1 bg-surface rounded-3xl border border-border overflow-hidden relative group shadow-2xl order-2 lg:order-4 lg:col-start-2 lg:row-start-2"
    >
      <Image 
        src="/images/avatar.png"
        alt={identity.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
    </motion.div>
  );
}
