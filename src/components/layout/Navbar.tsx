"use client";

import { Button } from "@/components/ui/Button";
import { useIdentity } from "@/components/IdentityProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Every link must land somewhere the home actually renders. "Skills" and "Other"
// used to point at `/#skills` and `/#other` — anchors no page carries — while
// /achievements and /chat, the two pages with the proof, had no link at all.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Labs", href: "/#labs" },
  { label: "Achievements", href: "/achievements" },
  { label: "Chat", href: "/chat" },
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
  const identity = useIdentity();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/chat") return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.header 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6"
    >
      <nav
        className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 max-w-full border rounded-full bg-surface backdrop-blur-md border-border shadow-navbar"
        aria-label="Main navigation"
      >
        <motion.div 
          variants={itemVariants}
          className="shrink-0 p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={toggleTheme}
        >
          {mounted ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-[18px] h-[18px]" />
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="h-4 w-px bg-border mx-1 hidden md:block" />

        {/* Five links do not fit a phone. The list scrolls sideways instead of
            pushing the pill past the viewport; the theme toggle and the booking
            button stay pinned at either end, and the fade on the right edge is
            what says there is more. */}
        <ul
          className="flex min-w-0 items-center gap-1 md:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_80%,transparent)] lg:[mask-image:none]"
          role="list"
        >
          {navLinks.map((link) => (
            <motion.li key={link.href} variants={itemVariants}>
              <Link
                href={link.href}
                className={`block whitespace-nowrap px-3 md:px-4 py-1.5 text-sm rounded-full transition-all ${
                  link.href === pathname
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={itemVariants} className="h-4 w-px bg-border mx-1 hidden md:block" />

        <motion.div variants={itemVariants} className="shrink-0">
          <a href={identity.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="rounded-full bg-accent text-white border border-accent/20 hover:bg-accent/80 flex gap-2 items-center shadow-lg shadow-accent/20 transition-all active:scale-95"
            >
              <Calendar size={14} />
              <span className="hidden md:inline">Get it off the ground</span>
            </Button>
          </a>
        </motion.div>
      </nav>
    </motion.header>
  );
}
