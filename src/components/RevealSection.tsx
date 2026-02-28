"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

export default function RevealSection({ children }: { children: React.ReactNode }) {
  const [ref] = useScrollReveal("animate-fade-in-up", 0.15);
  return <div ref={ref as React.RefObject<HTMLDivElement>} className="reveal-section-wrapper">{children}</div>;
}
