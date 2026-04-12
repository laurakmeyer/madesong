import SongForm from "@/components/SongForm";
import Link from "next/link";
import Image from "next/image";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2, 0.3, 0.05, 0.15, 0.25, 0.4, 0.08, 0.18, 0.28, 0.12, 0.22];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#faf9f7]/90 backdrop-blur-md border-b border-black/5">
        <span className="text-xl font-bold tracking-tight">MadeSong</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
          <a href="#so-funktionierts" className="hover:text-black transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-black transition-colors">Preise</a>
        </nav>
        <a href="#erstellen"
          className="text-sm font-semibold bg-black text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors">
          Song erstellen →
        </a>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
        <div className="relative text-center max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-purple-500 mb-6">
            KI-generierte Musik · Sofort · Persönlich
          </p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[100px] leading-[0.95] tracking-tight mb-8 text-[#1a1a1a]">
            Das Geschenk,<br />
            das <em className="not-italic text-purple-600">wirklich</em><br />
            bewegt.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Personalisierte Songs mit KI — für Geburtstage, Schlaflieder, Jahrestage und mehr.
          </p>
          <a href="#erstellen"
            className="inline-flex items-center gap-2 bg-black text-white font-bold text-base md:text-lg px-8 py-4 rounded-full hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
            Jetzt kostenlos starten
            <span>→</span>
          </a>
          <p className="text-xs text-zinc-400 mt-4">Kein Account nötig · 3 Songs kostenlos</p>
        </div>

        {/* Waveform */}
        <div className="mt-16 flex items-end gap-1 h-12">
          {WAVE_DELAYS.map((delay, i) => (
            <div key={i} className="wave-bar w-1.5 rounded-full bg-purple-400"
              style={{ height: "100%", animationDelay: `${delay}s`, animationDuration: `${0.9 + (i % 4) * 0.15}s`, opacity: 0.4 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </section>

      {/* Bild-Feature 1: Oma — Bild links, Text rechts */}
      <section className="py-20 md:py-32 px-6 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
            <Image src="/hero-oma.png" alt="Oma hört ihren persönlichen Song" fill className="object-cover" />
          </div>
          <div className="space-y-6">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-500">Für die Liebsten</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Mach Oma<br />zum Weinen —<br /><em className="not-italic text-purple-600">vor Freude.</em>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              Ein Song mit ihrem Namen, ihrer Geschichte, ihrer Melodie. In 2 Minuten erstellt. Für immer in Erinnerung.
            </p>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold text-black border border-black px-6 py-3 rounded-full hover:bg-black hover:text-white transition-all">
              Song für Oma erstellen →
            </a>
          </div>
        </div>
      </section>

      {/* Bild-Feature 2: Baby — Text links, Bild rechts */}
      <section className="py-20 md:py-32 px-6 md:px-20 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-500">Schlaflied</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Ein Lied,<br />das nur für<br /><em className="not-italic text-purple-600">dein Kind</em> ist.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              Mit dem Namen, dem Lieblingstier, dem kleinen Geheimnis — genau so persönlich wie der Moment selbst.
            </p>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold text-black border border-black px-6 py-3 rounded-full hover:bg-black hover:text-white transition-all">
              Schlaflied erstellen →
            </a>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2">
            <Image src="/hero-baby.png" alt="Mutter singt Schlaflied" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Bild-Feature 3: Paar — Vollbild mit Text-Overlay */}
      <section className="relative h-[80vh] overflow-hidden">
        <Image src="/hero-paar.png" alt="Paar teilt Musik" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-24">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-300 mb-4">Für Paare</p>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
              Euer Song.<br />Eure<br />Geschichte.
            </h2>
            <a href="#erstellen"
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-7 py-3.5 rounded-full hover:bg-zinc-100 transition-all hover:scale-105">
              Liebeslied erstellen →
            </a>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="erstellen" className="bg-white py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-500 mb-3">Sofort loslegen</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#1a1a1a]">Dein Song wartet.</h2>
          </div>
          <SongForm />
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-500 mb-4">Der Prozess</p>
            <h2 className="font-display text-4xl md:text-6xl leading-tight">3 Schritte.<br />1 unvergesslicher Moment.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", icon: "✍️", title: "Erzähl die Geschichte", desc: "Name, Anlass, ein paar persönliche Details — das reicht. Je mehr, desto persönlicher." },
              { num: "02", icon: "✨", title: "KI komponiert", desc: "Claude schreibt den Text, Mureka AI vertont ihn. Echte Musik, keine Computerstimme." },
              { num: "03", icon: "🎁", title: "Teilen & bewegen", desc: "Als MP3 herunterladen, per WhatsApp teilen oder als Story-Video auf Instagram posten." },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
                <span className="text-5xl font-black text-black/6 font-display block mb-4">{num}</span>
                <span className="text-3xl mb-4 block">{icon}</span>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white border-y border-black/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "2 Min", label: "bis zum fertigen Song" },
            { num: "€3,99", label: "ab dem ersten Song" },
            { num: "100%", label: "persönlich & einzigartig" },
            { num: "0", label: "Technikkenntnisse nötig" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-display text-4xl md:text-5xl text-[#1a1a1a] mb-2">{num}</div>
              <div className="text-sm text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-purple-500 mb-4">Preise</p>
            <h2 className="font-display text-4xl md:text-6xl">Einfach.<br />Transparent.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Single", price: "€3,99", sub: "einmalig", desc: "1 Song", features: ["1 personalisierter Song", "Text + Musik", "MP3-Download", "Teilen-Link", "Story-Video Export"], highlight: false },
              { name: "Paket", price: "€14,99", sub: "einmalig", desc: "5 Songs", features: ["5 personalisierte Songs", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund", "Story-Video Export"], highlight: true },
              { name: "Flat", price: "€34,99", sub: "pro Monat", desc: "Bis zu 20 Songs", features: ["20 Songs pro Monat", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund", "Story-Video Export"], highlight: false },
            ].map(({ name, price, sub, desc, features, highlight }) => (
              <div key={name} className={`rounded-3xl p-8 border flex flex-col ${highlight ? "bg-black text-white border-black" : "bg-white border-black/8"}`}>
                {highlight && <span className="text-xs font-semibold tracking-widest uppercase text-purple-400 mb-3">★ Beliebteste Wahl</span>}
                <h3 className={`text-xl font-bold ${highlight ? "text-white" : "text-[#1a1a1a]"}`}>{name}</h3>
                <div className="mt-4 mb-1">
                  <span className={`font-display text-5xl ${highlight ? "text-white" : "text-[#1a1a1a]"}`}>{price}</span>
                </div>
                <p className={`text-sm mb-6 ${highlight ? "text-zinc-400" : "text-zinc-500"}`}>{sub} · {desc}</p>
                <ul className="space-y-2.5 flex-1">
                  {features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${highlight ? "text-zinc-300" : "text-zinc-600"}`}>
                      <span className="text-purple-400 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#erstellen"
                  className={`mt-8 text-center text-sm font-bold py-3.5 rounded-full transition-all hover:scale-105 ${highlight ? "bg-white text-black hover:bg-zinc-100" : "bg-black text-white hover:bg-zinc-800"}`}>
                  Jetzt starten
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-5xl md:text-7xl leading-tight mb-6 text-[#1a1a1a]">
            Mach den<br />
            nächsten Moment<br />
            <em className="not-italic text-purple-600">unvergesslich.</em>
          </h2>
          <p className="text-zinc-500 text-lg mb-10">In 2 Minuten erstellt. Für immer in Erinnerung.</p>
          <a href="#erstellen"
            className="inline-flex items-center gap-2 bg-black text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
            Meinen Song erstellen →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 py-10 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-[#1a1a1a]">MadeSong</span>
          <p className="text-sm text-zinc-400">© 2026 MadeSong — Ein persönlicher Song für jeden Moment.</p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="#" className="hover:text-black transition-colors">Impressum</Link>
            <Link href="#" className="hover:text-black transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
