"use client";

import { useRef } from "react";

interface DragTickerProps {
  items: string[];
  variant?: "pills" | "text";
}

export default function DragTicker({ items, variant = "pills" }: DragTickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragging = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = false;
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0);
    scrollLeft.current = ref.current?.scrollLeft ?? 0;
    ref.current!.style.cursor = "grabbing";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 4) dragging.current = true;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }

  function onMouseUp() {
    if (ref.current) ref.current.style.cursor = "grab";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  return (
    <div
      ref={ref}
      className="overflow-x-auto select-none"
      style={{ scrollbarWidth: "none", cursor: "grab", WebkitOverflowScrolling: "touch" }}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center gap-3 px-6 w-max">
        {items.map((text) =>
          variant === "pills" ? (
            <span
              key={text}
              className="inline-flex items-center bg-[#d97706] text-white text-sm font-semibold px-5 py-2.5 rounded-full whitespace-nowrap flex-shrink-0"
            >
              {text}
            </span>
          ) : (
            <span
              key={text}
              className="flex items-center gap-3 text-sm font-semibold text-white/70 whitespace-nowrap flex-shrink-0 mx-4"
            >
              <span className="text-amber-300">✦</span>
              {text}
            </span>
          )
        )}
      </div>
    </div>
  );
}
