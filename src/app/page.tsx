"use client";

import SongForm from "@/components/SongForm";
import { Music } from "lucide-react";
import { useState, useRef } from "react";

const HERO_OCCASIONS = [
  { label: "🎂 Geburtstag", value: "Geburtstag" },
  { label: "🌙 Schlaflied", value: "Schlaflied" },
  { label: "💍 Jahrestag", value: "Jahrestag" },
  { label: "🎄 Weihnachten", value: "Weihnachten" },
  { label: "💝 Einfach so", value: "Einfach so" },
  { label: "👨 Vatertag", value: "Vatertag" },
];

export default function Home() {
  const [selectedOccasion, setSelectedOccasion] = useState("Geburtstag");
  const formRef = useRef<HTMLDivElement>(null);

  const handleOccasionClick = (value: string) => {
    setSelectedOccasion(value);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="w-full py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="h-7 w-7 text-purple-600" />
          <span className="text-2xl font-bold text-purple-700">MadeSong</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#so-funktionierts" className="hover:text-purple-600 transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-purple-600 transition-colors">Preise</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Ein persönlicher Song,<br />
          <span className="text-purple-600">gemacht nur für sie oder ihn.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Mach jeden Anlass unvergesslich — Geburtstag, Jahrestag, Gute Nacht oder einfach so.
          Erstelle in Sekunden einen einzigartigen KI-Song.
        </p>

        {/* Klickbare Anlass-Chips */}
        <p className="text-sm text-gray-400 mb-3">Wähle einen Anlass und leg direkt los:</p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {HERO_OCCASIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleOccasionClick(o.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                selectedOccasion === o.value
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:text-purple-600 shadow-sm"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* Form */}
      <section ref={formRef} className="max-w-2xl mx-auto px-8 pb-24">
        <SongForm preselectedOccasion={selectedOccasion} />
      </section>

      {/* So funktioniert's */}
      <section id="so-funktionierts" className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">So funktioniert&apos;s</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "1", icon: "✍️", title: "Erzähl uns die Geschichte", desc: "Gib Name, Anlass und ein paar persönliche Details ein." },
              { step: "2", icon: "✨", title: "KI erstellt den Song", desc: "Wir generieren einzigartige Songtexte und eine Melodie in Sekunden." },
              { step: "3", icon: "🎁", title: "Verschenke den Moment", desc: "Lade den Song herunter oder teile ihn direkt mit deiner Lieblingsperson." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preise */}
      <section id="preise" className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Einfache Preise</h2>
          <p className="text-gray-500 mb-12">Kostenlos starten, upgraden wenn du es liebst.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Gratis", price: "€0", desc: "Einfach ausprobieren", features: ["3 Songs", "Standardqualität", "MP3-Download"] },
              { name: "Paket", price: "€4,99", desc: "10 Songs", features: ["10 Songs", "Hohe Qualität", "MP3 & Teilen-Link"], highlight: true },
              { name: "Unlimited", price: "€9,99/Monat", desc: "Für alle Anlässe", features: ["Unbegrenzte Songs", "Höchste Qualität", "Prioritätsgenerierung"] },
            ].map(({ name, price, desc, features, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 border ${highlight ? "border-purple-400 bg-purple-50 shadow-md" : "border-gray-200 bg-white"}`}>
                {highlight && <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Beliebteste Wahl</span>}
                <h3 className="text-xl font-bold text-gray-900 mt-1">{name}</h3>
                <div className="text-3xl font-extrabold text-purple-700 my-2">{price}</div>
                <p className="text-sm text-gray-500 mb-4">{desc}</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  {features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-8 text-center text-sm">
        <p>© 2026 MadeSong — Ein persönlicher Song für jeden Moment.</p>
      </footer>
    </main>
  );
}
