import SongForm from "@/components/SongForm";
import Link from "next/link";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2, 0.3, 0.05, 0.15, 0.25, 0.4, 0.08, 0.18, 0.28, 0.12, 0.22];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080810] text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-[#080810]/90 backdrop-blur-md">
        <span className="text-xl font-bold tracking-tight">MadeSong</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#so-funktionierts" className="hover:text-white transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-white transition-colors">Preise</a>
        </nav>
        <a href="#erstellen"
          className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-zinc-100 transition-colors">
          Song erstellen →
        </a>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[100px] pointer-events-none" />

        <div className="relative text-center max-w-5xl mx-auto">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-purple-400 mb-6">
            KI-generierte Musik · Sofort · Persönlich
          </p>

          <h1 className="font-display text-6xl md:text-8xl lg:text-[108px] leading-[0.95] tracking-tight mb-8">
            Das Geschenk,<br />
            das <span className="text-shimmer">wirklich</span><br />
            bewegt.
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Erstelle in Minuten einen personalisierten Song — für Geburtstage, Schlaflieder,
            Jahrestage oder einfach so.
          </p>

          <a href="#erstellen"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-base md:text-lg px-8 py-4 rounded-full hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95">
            Jetzt kostenlos starten
            <span className="text-xl">→</span>
          </a>

          <p className="text-xs text-zinc-600 mt-4">Kein Account nötig · 3 Songs kostenlos</p>
        </div>

        {/* Animated waveform */}
        <div className="relative mt-16 md:mt-24 flex items-end gap-1 h-16">
          {WAVE_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="wave-bar w-1.5 md:w-2 rounded-full bg-gradient-to-t from-purple-600 to-pink-400"
              style={{
                height: "100%",
                animationDelay: `${delay}s`,
                animationDuration: `${0.9 + (i % 4) * 0.15}s`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>

        {/* Occasions strip */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {["🎂 Geburtstag", "🌙 Schlaflied", "💕 Jahrestag", "🎄 Weihnachten", "💝 Muttertag", "☀️ Einfach so"].map((o) => (
            <span key={o} className="text-sm text-zinc-500 border border-white/8 rounded-full px-4 py-1.5 bg-white/3">
              {o}
            </span>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="erstellen" className="bg-[#0c0c18] py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-400 mb-3">Sofort loslegen</p>
            <h2 className="font-display text-4xl md:text-5xl">Dein Song wartet.</h2>
          </div>
          <SongForm />
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-400 mb-4">Der Prozess</p>
            <h2 className="font-display text-4xl md:text-6xl max-w-xl leading-tight">
              Von Idee zu Song<br />in 3 Schritten.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { num: "01", icon: "✍️", title: "Erzähl die Geschichte", desc: "Name, Anlass, ein paar persönliche Details — das reicht. Je mehr, desto persönlicher." },
              { num: "02", icon: "✨", title: "KI komponiert", desc: "Claude schreibt den Text, Mureka AI vertont ihn. Echte Musik, keine Computerstimme." },
              { num: "03", icon: "🎁", title: "Teilen & bewegen", desc: "Lade als MP3 herunter, teile per WhatsApp oder poste als Story-Video auf Instagram." },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} className="bg-[#0c0c18] p-8 md:p-10">
                <span className="text-6xl font-black text-white/6 font-display block mb-6">{num}</span>
                <span className="text-3xl mb-4 block">{icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6 border-t border-white/5 bg-[#0c0c18]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "2 Min", label: "bis zum fertigen Song" },
              { num: "€3,99", label: "ab dem ersten Song" },
              { num: "100%", label: "persönlich & einzigartig" },
              { num: "0", label: "Technikkenntnisse nötig" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-display text-4xl md:text-5xl text-white mb-2">{num}</div>
                <div className="text-sm text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-400 mb-4">Preise</p>
            <h2 className="font-display text-4xl md:text-6xl">Einfach.<br />Transparent.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Single",
                price: "€3,99",
                sub: "einmalig",
                desc: "1 Song",
                features: ["1 personalisierter Song", "Text + Musik", "MP3-Download", "Teilen-Link", "Story-Video Export"],
                highlight: false,
                cta: "Jetzt starten",
              },
              {
                name: "Paket",
                price: "€14,99",
                sub: "einmalig",
                desc: "5 Songs",
                features: ["5 personalisierte Songs", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund", "Story-Video Export"],
                highlight: true,
                cta: "Beliebteste Wahl",
              },
              {
                name: "Flat",
                price: "€34,99",
                sub: "pro Monat",
                desc: "Bis zu 20 Songs",
                features: ["20 Songs pro Monat", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund", "Story-Video Export"],
                highlight: false,
                cta: "Jetzt starten",
              },
            ].map(({ name, price, sub, desc, features, highlight, cta }) => (
              <div key={name}
                className={`rounded-2xl p-8 border flex flex-col ${highlight
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-950/60 to-[#0c0c18]"
                  : "border-white/8 bg-[#0c0c18]"}`}>
                {highlight && (
                  <span className="text-xs font-semibold tracking-widest uppercase text-purple-400 mb-3">
                    ★ Beliebteste Wahl
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <div className="mt-4 mb-1">
                  <span className="font-display text-5xl text-white">{price}</span>
                </div>
                <p className="text-sm text-zinc-500 mb-1">{sub} · {desc}</p>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <span className="text-purple-400 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <a href="#erstellen"
                  className={`mt-8 text-center text-sm font-bold py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 ${highlight
                    ? "bg-white text-black hover:bg-zinc-100"
                    : "border border-white/20 text-white hover:border-white/50"}`}>
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 border-t border-white/5 bg-[#0c0c18] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl leading-tight mb-6">
            Mach den<br />
            <span className="text-shimmer">nächsten Moment</span><br />
            unvergesslich.
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            In 2 Minuten erstellt. Für immer in Erinnerung.
          </p>
          <a href="#erstellen"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-lg px-10 py-5 rounded-full hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95">
            Meinen Song erstellen →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white">MadeSong</span>
          <p className="text-sm text-zinc-600">© 2026 MadeSong — Ein persönlicher Song für jeden Moment.</p>
          <div className="flex gap-6 text-sm text-zinc-600">
            <Link href="#" className="hover:text-white transition-colors">Impressum</Link>
            <Link href="#" className="hover:text-white transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
