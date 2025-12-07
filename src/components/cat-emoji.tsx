"use client";

import { useEffect, useState } from "react";

type CatEmojiProps = {
  message?: string;
  hideOnDesktop?: boolean;
};

// A playful cat that wanders around the viewport on mobile and can be "kicked" (tapped) away briefly.
export function CatEmojiMobile({ message, hideOnDesktop = true }: CatEmojiProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 18, rot: 0 });
  const [kicked, setKicked] = useState(false);
  const [targetY, setTargetY] = useState<number | null>(null);
  const minX = 18;
  const maxX = 82;
  const clampX = (value: number) => Math.max(minX, Math.min(maxX, value));

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: clampX(10 + Math.random() * 80),
        y: targetY ?? 20 + Math.random() * 70,
        rot: -18 + Math.random() * 36,
      }));
    }, 3200);
    return () => clearInterval(interval);
  }, [visible, targetY]);

  // Listen for a custom event from the card currently in view on mobile to reposition the cat nearby.
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ y: number }>).detail;
      if (detail?.y != null) {
        const clamped = Math.max(15, Math.min(85, detail.y));
        setTargetY(clamped);
        setPos((prev) => ({ ...prev, y: clamped, x: clampX(prev.x) }));
      }
    };
    window.addEventListener("cat-focus-product", handler as EventListener);
    return () => window.removeEventListener("cat-focus-product", handler as EventListener);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className={`pointer-events-none fixed inset-0 z-40 ${hideOnDesktop ? "md:hidden" : ""}`}>
        <button
          type="button"
          onClick={() => {
            setKicked(true);
            setTimeout(() => setKicked(false), 1400);
          }}
          className="pointer-events-auto absolute flex items-center gap-3 rounded-full border border-white/10 bg-white/15 px-4 py-2 shadow-lg shadow-emerald-500/15 backdrop-blur transition-all duration-600"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) rotate(${pos.rot}deg) ${
              kicked ? "translateY(140px) scale(0.85)" : ""
            }`,
          }}
        >
          <span
            className="text-2xl transition-transform duration-500"
            style={{ transform: `scaleX(${pos.rot < 0 ? -1 : 1})` }}
            role="img"
            aria-label="cat"
          >
            😺
          </span>
          <span className="text-xs text-slate-200">{message ?? "Cat says: pick wisely."}</span>
        </button>
      </div>
      <style jsx>{`
        .floating {
          animation: floaty 3s ease-in-out infinite;
        }
        @keyframes floaty {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          50% {
            transform: translate(-50%, -52%) rotate(2deg);
          }
        }
      `}</style>
    </>
  );
}
