"use client";

import { useEffect, useState } from "react";

const ICONS = ["🎲", "♟️", "🎯", "🃏", "🏆", "⚔️", "🔮", "🎩", "🧩", "♛"];
const ANIMS = ["floatA", "floatB", "floatC", "floatD", "floatE"];

interface Icon {
  id: number; emoji: string; x: number; y: number;
  size: number; anim: string; delay: string; duration: string;
}

export default function FloatingIcons() {
  const [icons, setIcons] = useState<Icon[]>([]);

  useEffect(() => {
    const slots = [
      { x: 6, y: 8 },  { x: 18, y: 55 }, { x: 30, y: 20 },
      { x: 45, y: 68 }, { x: 58, y: 10 }, { x: 72, y: 50 },
      { x: 85, y: 22 }, { x: 12, y: 38 }, { x: 60, y: 38 }, { x: 88, y: 72 },
    ];
    setIcons(slots.map((pos, i) => ({
      id: i,
      emoji: ICONS[i % ICONS.length],
      x: pos.x + (Math.random() * 3 - 1.5),
      y: pos.y + (Math.random() * 3 - 1.5),
      size: 20 + Math.random() * 18,
      anim: ANIMS[i % ANIMS.length],
      delay: `${(i * 0.55).toFixed(1)}s`,
      duration: `${(4.5 + Math.random() * 3).toFixed(1)}s`,
    })));
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {icons.map((icon) => (
        <div key={icon.id} style={{
          position: "absolute",
          left: `${icon.x}%`, top: `${icon.y}%`,
          fontSize: `${icon.size}px`,
          opacity: 0.22,
          filter: "drop-shadow(0 2px 8px rgba(167,139,250,0.5))",
          animationName: icon.anim,
          animationDuration: icon.duration,
          animationDelay: icon.delay,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          userSelect: "none",
        }}>
          {icon.emoji}
        </div>
      ))}
    </div>
  );
}