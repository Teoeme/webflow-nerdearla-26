"use client";

import { useEffect, useState } from "react";
import { Stat } from "@/components/ui/stat";

// How long the count-up takes to reach its target, from first render.
const COUNT_UP_DURATION_MS = 800;

function easeOutQuad(progress: number): number {
  return 1 - (1 - progress) * (1 - progress);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// A summary stat (races logged, medals, ...) that counts up from 0 to its target
// on first render, instead of appearing already at its final value. Reuses the
// shared `Stat` presentation as-is; only the numeric text animates.
export function AnimatedStat({
  label,
  target,
  emphasis,
}: {
  label: string;
  target: number;
  emphasis?: boolean;
}) {
  const [displayedValue, setDisplayedValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayedValue(target);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    function tick(now: number): void {
      const progress = Math.min((now - startTime) / COUNT_UP_DURATION_MS, 1);
      setDisplayedValue(Math.round(target * easeOutQuad(progress)));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return <Stat label={label} value={String(displayedValue)} emphasis={emphasis} />;
}
