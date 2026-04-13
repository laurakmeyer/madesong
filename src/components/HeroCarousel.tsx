"use client";

import { useRef, useState } from "react";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2];

const CARDS = [
  { anlass: "Geburtstag",  name: "Maria, 60 Jahre",    preview: "Sechzig Jahre voller Glanz, heut' ist dein ganz besondrer Tanz...", icon: "🎂", tag: null },
  { anlass: "Schlaflied",  name: "Für kleine Emma",    preview: "Schlaf, mein kleines Sternenkind, träum von allem was du bist...",   icon: "🍼", tag: null },
  { anlass: "Liebeslied",  name: "Laura & Frank",        preview: "Seit dem ersten Augenblick wusst ich, du bist mein Glück...",        icon: "💑", tag: "Beliebt" },
  { anlass: "Muttertag",   name: "Für Mama",           preview: "Mama, du bist mein Anker, mein Licht und mein Zuhause...",          icon: "🌸", tag: null },
  { anlass: "Vatertag",    name: "Für Papa",           preview: "Papa, kein Tag verging, wo ich nicht dankbar für dich bin...",      icon: "👨‍👧", tag: null },
  { anlass: "Weihnachten", name: "Familie Meyer",      preview: "An Weihnachten, wenn Kerzen glüh'n, denk ich an euch, die ich lieb...", icon: "🎄", tag: null },
  { anlass: "Jahrestag",   name: "3 Jahre zusammen",  preview: "Drei Jahre voller Lachen, voller Abenteuer und Glück...",           icon: "💍", tag: null },
];

export default function HeroCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(false);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    scrollRef.current!.style.cursor = "grabbing";
    scrollRef.current!.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 5) setIsDragging(true);
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }

  function onMouseUp() {
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "";
    }
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto pb-4 select-none"
      style={{
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
      }}
      onMouseDown={onMouseDown}
    >
      {/* padding links/rechts so erste/letzte Karte zentriert werden kann */}
      <div className="flex gap-4 px-[max(24px,calc(50vw-520px))]" style={{width: "max-content"}}>
        {CARDS.map((card, i) => (
          <a
            key={i}
            href={isDragging ? undefined : `/?anlass=${card.anlass}#erstellen`}
            onClick={(e) => isDragging && e.preventDefault()}
            className="flex-shrink-0 bg-white rounded-3xl shadow-xl p-6 flex flex-col"
            style={{
              width: "220px",
              height: "340px",
              transition: "box-shadow 0.2s",
            }}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <p className="text-xs font-bold tracking-wider uppercase text-[#d97706] mb-1">{card.anlass}</p>
            <p className="font-display text-xl text-[#18120e] leading-snug mb-3">{card.name}</p>
            <p className="text-xs text-[#78716c] leading-relaxed italic flex-1">
              &ldquo;{card.preview}&rdquo;
            </p>


            {card.tag && (
              <span className="absolute top-5 right-5 text-xs font-bold bg-[#d97706] text-white px-2.5 py-1 rounded-full">
                {card.tag}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
