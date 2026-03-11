"use client";

import { Button } from "@/components/ui/Button";
import { profile } from "@/data/profile";
import { motion } from "framer-motion";
import { Calendar, Moon } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Other", href: "/#other" },
];

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
  },
};

export function Navbar() {
  return (
    <motion.header 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6"
    >
      <nav
        className="flex items-center gap-2 md:gap-4 px-4 py-2 border rounded-full bg-white/5 backdrop-blur-md border-white/10"
        aria-label="Main navigation"
      >
        <motion.div 
          variants={itemVariants}
          className="p-2 text-muted hover:text-foreground cursor-pointer transition-colors"
        >
          <Moon size={18} />
        </motion.div>

        <motion.div variants={itemVariants} className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

        <ul className="flex items-center gap-1 md:gap-2" role="list">
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={itemVariants}>
              <Link
                href={link.href}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  link.label === "Home"
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={itemVariants} className="h-4 w-px bg-white/10 mx-1 hidden md:block" />

        <motion.div variants={itemVariants}>
          <a href={profile.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white flex gap-2 items-center"
            >
              <Calendar size={14} />
              <span className="hidden md:inline">Book a Call</span>
            </Button>
          </a>
        </motion.div>
      </nav>
    </motion.header>
  );
}
