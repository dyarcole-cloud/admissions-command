"use client";

import { useEffect, useRef } from "react";

type BrainVideoProps = {
  opacity?: number;
  /** Skip rendering on reduced-motion preference */
  respectReducedMotion?: boolean;
};

export function BrainVideo({
  opacity = 0.28,
  respectReducedMotion = true,
}: BrainVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (respectReducedMotion) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        ref.current?.pause();
      }
    }
  }, [respectReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/icon.svg"
      >
        <source src="/ntn-brain.mp4" type="video/mp4" />
      </video>
      <div className="brain-video-overlay" />
    </div>
  );
}
