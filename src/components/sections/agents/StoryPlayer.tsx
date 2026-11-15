"use client";

import { MotionConfig, useInView, useReducedMotion } from "framer-motion";
import { type ComponentType, useEffect, useRef, useState } from "react";

/**
 * What an agent's animation is made of (`.scratch/projects-and-agents/`). A scene
 * is a pure picture of one step; the player decides which step is showing.
 */
export interface Story {
  /** Draws the scene at `step`; animates between steps on its own. */
  Scene: ComponentType<{ step: number }>;
  /** How long each step stays, in ms. Its length is the number of steps. */
  durations: readonly number[];
  /** The caption each step belongs to, an index into `captions`. */
  captionOf: readonly number[];
  /** The steps drawn side by side, one per caption, when motion is reduced. */
  frames: readonly number[];
}

/**
 * Plays a Story in a loop while it is on screen, with its captions as an ordered
 * list beside it, the current one lit — the words a visitor reads, and what a
 * screen reader hears, since the picture itself is decorative. Off screen it
 * holds still. For anyone who prefers reduced motion it plays nothing: each
 * caption gets its own still frame.
 */
export function StoryPlayer({
  story,
  captions,
  label,
}: {
  story: Story;
  captions: readonly string[];
  /** Names the list of steps for assistive tech. */
  label: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(0);
  const { Scene, durations, captionOf, frames } = story;

  useEffect(() => {
    if (!inView || reduced) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => window.clearTimeout(timer);
  }, [inView, reduced, step, durations]);

  if (reduced) {
    return (
      <ol aria-label={label} className="grid gap-4 sm:grid-cols-2">
        {frames.map((frame, i) => (
          <li key={frame}>
            <MotionConfig reducedMotion="always">
              <div aria-hidden="true">
                <Scene step={frame} />
              </div>
            </MotionConfig>
            <p className="mt-2 text-sm font-medium text-foreground">
              <span className="mr-2 font-mono text-xs text-accent-text">{i + 1}</span>
              {captions[i]}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  const current = captionOf[step];
  return (
    <div ref={ref}>
      <div aria-hidden="true">
        <Scene step={step} />
      </div>
      <ol aria-label={label} className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {captions.map((caption, i) => (
          <li
            key={caption}
            aria-current={i === current ? "step" : undefined}
            className={`border-t-2 pt-2 text-xs font-medium transition-colors duration-300 motion-reduce:transition-none ${
              i === current ? "border-accent text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <span className="mr-1.5 font-mono text-accent-text">{i + 1}</span>
            {caption}
          </li>
        ))}
      </ol>
    </div>
  );
}
