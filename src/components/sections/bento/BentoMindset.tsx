"use client";

import type { MindsetSlide } from "@/lib/mindset";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// Kept in step with CLIP_SECONDS in scripts/mindset.mjs, so a clip plays whole.
const SLIDE_MS = 2500;

export function BentoMindset({ slides }: { slides: MindsetSlide[] }) {
  const [index, setIndex] = useState(0);

  // Paused while the tab is hidden: the browser freezes the fade there but not
  // the timer, so slides would pile up mid-exit until the visitor came back.
  useEffect(() => {
    if (slides.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (document.visibilityState === "visible") {
        timer = setInterval(
          () => setIndex((i) => (i + 1) % slides.length),
          SLIDE_MS,
        );
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [slides.length]);

  const slide = slides[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="col-span-1 row-span-2 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-between overflow-hidden relative group shadow-2xl order-4 lg:order-3 lg:col-start-1 lg:row-start-2"
    >
      <div>
        <h3 className="text-3xl font-bold mb-3">Mindset</h3>
        <p className="text-muted-foreground text-base leading-snug">
          <span className="text-foreground font-semibold">Building more than software.</span> My passions provide the <span className="text-foreground font-semibold">discipline and focus</span> I need to grow.
        </p>
      </div>

      <div className="mt-8 group-hover:-translate-y-2 transition-transform duration-500">
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-border bg-zinc-800">
          {/* Most phone media is portrait in a landscape frame; anchoring the crop
              high keeps heads in shot instead of framing a torso. */}
          {slide ? (
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {slide.kind === "video" ? (
                  // Restarts from 0 on every visit — the key remounts it — so the
                  // clip plays whole in its slot, like a GIF.
                  <video
                    src={slide.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden
                    className="size-full object-cover object-[50%_25%]"
                  />
                ) : (
                  <img
                    src={slide.src}
                    alt=""
                    className="size-full object-cover object-[50%_25%]"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-4xl">
              🌊
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Focus & Discipline</span>
            {slides.length > 1 && (
              <div className="flex gap-1" aria-hidden>
                {slides.map((s, i) => (
                  <span
                    key={s.src}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      i === index ? "w-3 bg-white" : "w-1 bg-white/40",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-muted-foreground text-base leading-snug">
          Mastering body and mind is my path to <span className="text-foreground font-semibold">excellence.</span>
        </p>
      </div>
    </motion.div>
  );
}
