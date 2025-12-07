"use client";

import { useEffect, useRef } from "react";

// A playful animated cat that follows the cursor on desktop.
const CAT_SIZE = 72;

export default function CatFollower() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMove = (event: MouseEvent) =>
      window.requestAnimationFrame(() => {
        node.style.transform = `translate(${event.clientX - CAT_SIZE / 2}px, ${event.clientY - CAT_SIZE / 2}px)`;
      });

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[72px] w-[72px] select-none items-center justify-center transition-transform duration-150 ease-out md:flex"
      >
        <div className="cat-glow absolute inset-[-8px] rounded-full bg-gradient-to-br from-emerald-400/25 via-cyan-300/20 to-transparent blur-xl" />
        <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/10 bg-slate-900/90 shadow-lg shadow-emerald-500/25 backdrop-blur">
          <div className="cat-wiggle text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" role="img" aria-label="cat">
            😺
          </div>
        </div>
      </div>
      <style jsx>{`
        .cat-wiggle {
          animation: cat-wiggle 2.4s ease-in-out infinite, cat-bounce 5s ease-in-out infinite;
        }
        @keyframes cat-wiggle {
          0%,
          100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }
        @keyframes cat-bounce {
          0%,
          100% {
            filter: drop-shadow(0 4px 12px rgba(45, 212, 191, 0.3));
          }
          50% {
            filter: drop-shadow(0 10px 18px rgba(59, 130, 246, 0.35));
          }
        }
      `}</style>
    </>
  );
}
