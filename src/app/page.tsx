import SongForm from "@/components/SongForm";
import Link from "next/link";
import Image from "next/image";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2, 0.3, 0.05, 0.15, 0.25, 0.4, 0.08, 0.18, 0.28, 0.12, 0.22];

const FAQ = [
  { q: "Klingt das wirklich gut — oder wie ein Computer?", a: "Echter Gesang, echte Instrumente. Mureka AI erzeugt vollständige Songs mit menschlicher Stimme — kein synthetisches Text-to-Speech. Hör selbst: einfach einen kostenlosen Song erstellen." },
  { q: "Was wenn mir der Song nicht gefällt?", a: "Du kannst den Text direkt im Browser bearbeiten, ihn per KI mit einem Satz verfeinern (z.B. \"Mach es fröhlicher\") oder komplett neu generieren — so oft du willst, vor der Zahlung." },
  { q: "Wie persönlich ist das wirklich?", a: "Du gibst Name, Alter, Anlass, Lieblingstiere, persönliche Details ein — alles fließt in den Song ein. Kein anderer Mensch auf der Welt hat denselben Song." },
  { q: "Wie lange dauert die Erstellung?", a: "Unter 2 Minuten. Der Songtext erscheint in Sekunden, die Musik dauert ca. 60 Sekunden. Kein Warten, kein Mensch dazwischen." },
  { q: "Was bekomme ich kostenlos?", a: "Du erstellst deinen Song vollständig und hörst die ersten 10 Sekunden als Vorschau. Für den kompletten Song inkl. MP3-Download und Teilen-Link zahlst du einmalig €3,99." },
  { q: "Kann ich den Song behalten und teilen?", a: "Ja. MP3-Download, ein dauerhafter Teilen-Link (madesong.com/song/…) und ein Story-Video für Instagram & WhatsApp. Alles gehört dir." },
  { q: "Brauche ich Technikkenntnisse oder ein Konto?", a: "Nein. Formular ausfüllen, auf \"Erstellen\" klicken, fertig. Kein Account, keine App, keine Kreditkarte für die Vorschau." },
  { q: "Funktioniert das auch für Kinder?", a: "Besonders gut. Die KI erkennt das Alter und passt Sprache und Stil automatisch an — einfach für Kleinkinder, cool für Teenies." },
];

export default function Home() {
  return (
    <main className="mesh-bg text-[#1c1917]">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 backdrop-blur-md border-b border-white/10" style={{ backgroundColor: "rgba(44,28,16,0.85)" }}>
        <span className="font-display text-2xl font-bold tracking-tight text-white">MadeSong</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#so-funktionierts" className="hover:text-white transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-white transition-colors">Preise</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <a href="#erstellen" className="text-sm font-semibold bg-white text-[#18120e] px-5 py-2.5 rounded-full hover:bg-amber-100 transition-colors">
          Song erstellen →
        </a>
      </header>

      {/* Hero */}
      <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-8 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-300 mb-6">Personalisierte KI-Musik · Ab €3,99</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[100px] leading-[0.95] tracking-tight mb-6 text-white">
          Das Geschenk,<br />
          das <em className="not-italic text-amber-300">wirklich</em><br />
          bewegt.
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-lg mx-auto mb-4 leading-relaxed">
          Ein Song mit ihrem Namen, ihrer Geschichte, ihrer Melodie — in unter 2 Minuten. Kein anderer Mensch auf der Welt hat diesen Song.
        </p>
        <p className="text-sm text-white/50 mb-8">€3,99. Weniger als ein Kaffee. Mehr als jedes Geschenk.</p>
        <a href="#erstellen" className="inline-flex items-center gap-2 bg-white text-[#18120e] font-bold text-base md:text-lg px-8 py-4 rounded-full hover:bg-amber-100 transition-all hover:scale-105 active:scale-95">
          Jetzt kostenlos ausprobieren →
        </a>
        <p className="text-xs text-white/40 mt-3">Erste 10 Sekunden kostenlos hören · Kein Account</p>
        <div className="mt-12 flex items-end gap-1 h-12">
          {WAVE_DELAYS.map((delay, i) => (
            <div key={i} className="wave-bar w-1.5 rounded-full"
              style={{ height: "100%", background: i % 2 === 0 ? "#7c3aed" : "#f43f5e", animationDelay: `${delay}s`, animationDuration: `${0.9 + (i % 4) * 0.15}s`, opacity: 0.4 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </section>

      {/* Form — direkt nach Hero */}
      <section id="erstellen" className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Dein Song. Jetzt.</h2>
            <p className="text-[#78716c] mt-2">Erste 10 Sekunden kostenlos hören — kein Account, keine Kreditkarte.</p>
          </div>
          <SongForm />
        </div>
      </section>

      {/* Problem vs. MadeSong */}
      <section className="py-14 px-6 border-y border-black/8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { pain: "Blumen welken.", solution: "Ein Song bleibt für immer." },
            { pain: "Gutscheine sind unpersönlich.", solution: "Kein Song klingt wie der andere." },
            { pain: "Wettbewerber: €49, 3 Tage.", solution: "MadeSong: €3,99, unter 2 Minuten." },
          ].map(({ pain, solution }) => (
            <div key={pain} className="space-y-2">
              <p className="text-[#a8a29e] line-through text-sm">{pain}</p>
              <p className="text-[#18120e] font-semibold">{solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature 1: Oma */}
      <section className="py-20 md:py-32 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
            <Image src="/hero-oma.png" alt="Oma hört personalisierten Song" fill className="object-cover" />
          </div>
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d97706]">Geburtstag · Muttertag · Einfach so</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Das erste Mal, dass ein Geschenk ihren Namen singt.
            </h2>
            <ul className="space-y-3 text-[#78716c]">
              <li className="flex gap-3"><span className="text-[#d97706] font-bold mt-0.5">✓</span><span>Echter Song mit Gesang — keine Computerstimme</span></li>
              <li className="flex gap-3"><span className="text-[#d97706] font-bold mt-0.5">✓</span><span>Fertig in unter 2 Minuten — nicht in 3 Tagen</span></li>
              <li className="flex gap-3"><span className="text-[#d97706] font-bold mt-0.5">✓</span><span>Per WhatsApp teilen, als MP3 laden oder als Video auf Instagram posten</span></li>
              <li className="flex gap-3"><span className="text-[#d97706] font-bold mt-0.5">✓</span><span>Text direkt bearbeiten oder per KI verfeinern</span></li>
            </ul>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-[#d97706] text-white px-6 py-3 rounded-full hover:bg-[#b45309] transition-all">
              Song erstellen →
            </a>
          </div>
        </div>
      </section>

      {/* Feature 2: Baby */}
      <section className="py-20 md:py-32 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d97706]">Schlaflied · Taufe · Geburt</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Kein Kind schläft besser als mit seinem eigenen Lied.
            </h2>
            <p className="text-[#78716c] leading-relaxed">
              Du gibst an: Name, Lieblingstier, Lieblingsding. Die KI schreibt einen altersgerechten Text — liebevoll, persönlich, einzigartig.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[["<2 Min", "Fertig"],["€3,99", "Ab dem 1. Song"],["100%", "Persönlich"],["∞", "Für immer"]].map(([num, label]) => (
                <div key={label} className="bg-white/70 rounded-2xl p-4 text-center border border-black/5 backdrop-blur">
                  <div className="font-display text-2xl text-[#18120e]">{num}</div>
                  <div className="text-xs text-[#78716c] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-[#d97706] text-white px-6 py-3 rounded-full hover:bg-[#b45309] transition-all">
              Schlaflied erstellen →
            </a>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2">
            <Image src="/hero-baby.png" alt="Mutter singt Schlaflied" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Vollbild: Paar */}
      <section className="relative h-[80vh] overflow-hidden">
        <Image src="/hero-paar.png" alt="Paar teilt Musik" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18120e]/85 via-[#18120e]/30 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-24">
          <div className="max-w-lg">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f43f5e] mb-3">Jahrestag · Valentinstag · Hochzeit</p>
            <h2 className="font-display text-5xl md:text-6xl text-white leading-tight mb-4">
              &ldquo;Unser Song&rdquo; —<br />aber wirklich<br />eurer.
            </h2>
            <p className="text-[#d6d3d1] mb-6">Kein generischer Liebessong. Sondern einer, der eure Geschichte erzählt — eure erste Begegnung, euren Insider, euren Moment.</p>
            <a href="#erstellen" className="inline-flex items-center gap-2 bg-[#f43f5e] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[#e11d48] transition-all">
              Liebeslied erstellen →
            </a>
          </div>
        </div>
      </section>

      {/* Feature 3: Geburtstag */}
      <section className="py-20 md:py-32 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
            <Image src="/hero-geburtstag.png" alt="Geburtstagssong" fill className="object-cover" />
          </div>
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d97706]">Warum MadeSong?</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Weil &ldquo;Happy Birthday&rdquo; es nicht mehr tut.
            </h2>
            <p className="text-[#78716c] leading-relaxed">Alle singen dasselbe Lied. Du schenkst etwas, das es genau einmal auf der Welt gibt.</p>
            <div className="space-y-3 text-sm text-[#78716c] border-t border-black/8 pt-4">
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Wettbewerber: €29–€50 und Tage Wartezeit</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>MadeSong: €3,99 — fertig bevor du den Tab schließt</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Text bearbeiten, verfeinern, neu generieren — unlimitiert</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Foto hochladen → erscheint als Hintergrund auf der Teilen-Seite</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Story-Video als MP4 für Instagram & WhatsApp Status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Video Section */}
      <section className="py-20 md:py-28 px-6 border-y border-black/8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f43f5e]">Neu · Story-Video Export</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Erstellt in 2 Minuten.<br />Viral in Sekunden.
            </h2>
            <p className="text-[#78716c] leading-relaxed">
              MadeSong generiert automatisch ein 60-Sekunden Story-Video — mit deinem Foto als Hintergrund, scrollenden Lyrics und deiner Musik. Fertig zum Posten auf Instagram oder WhatsApp Status.
            </p>
            <ul className="space-y-2 text-sm text-[#78716c]">
              <li className="flex gap-3"><span className="text-[#f43f5e] font-bold">✓</span>9:16 Format — perfekt für Stories</li>
              <li className="flex gap-3"><span className="text-[#f43f5e] font-bold">✓</span>Dein Foto als Blur-Hintergrund</li>
              <li className="flex gap-3"><span className="text-[#f43f5e] font-bold">✓</span>Lyrics scrollen mit der Musik</li>
              <li className="flex gap-3"><span className="text-[#f43f5e] font-bold">✓</span>MadeSong-Branding — kostenlose Werbung für dich</li>
            </ul>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-[#f43f5e] text-white px-6 py-3 rounded-full hover:bg-[#e11d48] transition-all">
              Song + Video erstellen →
            </a>
          </div>
          {/* Phone mockup placeholder */}
          <div className="flex justify-center">
            <div className="relative w-64 h-[520px] bg-[#18120e] rounded-[40px] shadow-2xl border-4 border-[#2d2520] overflow-hidden">
              {/* Status bar */}
              <div className="flex justify-between px-6 pt-3 pb-1 text-white/50 text-xs">
                <span>9:41</span><span>●●●</span>
              </div>
              {/* Instagram Story mockup */}
              <div className="relative h-full bg-gradient-to-b from-[#3b0764] to-[#1e0a4a] flex flex-col items-center justify-between pb-12 pt-4">
                <div className="w-full px-4">
                  <div className="h-1 bg-white/30 rounded-full mb-3">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#d97706] flex items-center justify-center text-xs font-bold text-white">M</div>
                    <span className="text-white text-xs font-semibold">MadeSong</span>
                  </div>
                </div>
                <div className="text-center px-4 space-y-2">
                  <div className="text-4xl">🎵</div>
                  <p className="text-white font-bold text-lg font-display">Emma</p>
                  <p className="text-white/60 text-xs">Geburtstag</p>
                  <div className="space-y-1 mt-3">
                    {["Happy Birthday Emma,", "dein Lachen macht uns froh,", "du bist so wunderbar..."].map((line, i) => (
                      <p key={i} className="text-white/80 text-xs">{line}</p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-0.5 h-6">
                    {[3,5,8,5,3,6,4,7,5,3].map((h, i) => (
                      <div key={i} className="wave-bar w-1 rounded-full bg-white/60" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="text-white/40 text-[10px]">madesong.com</p>
                </div>
              </div>
              {/* Add video overlay hint */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[36px]">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-2xl ml-1">▶</span>
                  </div>
                  <p className="text-white text-xs font-medium">Demo-Video</p>
                  <p className="text-white/50 text-[10px] mt-1">kommt bald</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Von Idee zu Song — in unter 2 Minuten.</h2>
            <p className="text-[#78716c] mt-3">Kein Studium. Kein Aufwand. Schneller als eine Pizzabestellung.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "✍️", title: "Details eingeben", desc: "Name, Anlass, Alter und ein paar persönliche Details. Das dauert 60 Sekunden." },
              { num: "02", icon: "✨", title: "KI komponiert sofort", desc: "Claude AI schreibt den Text. Mureka AI vertont ihn mit echtem Gesang — alles in ~60 Sekunden." },
              { num: "03", icon: "📱", title: "Teilen als Song oder Video", desc: "MP3-Download, Teilen-Link oder Story-Video für Instagram & WhatsApp Status. Fertig." },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} className="bg-white/70 backdrop-blur rounded-3xl p-8 border border-black/5">
                <span className="text-5xl font-black text-black/6 font-display block mb-3">{num}</span>
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="text-base font-bold text-[#18120e] mb-2">{title}</h3>
                <p className="text-[#78716c] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="py-24 px-6 border-t border-black/8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Weniger als ein Blumenstrauß.</h2>
            <p className="text-[#78716c] mt-3">Und unvergesslicher.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Single", price: "€3,99", sub: "einmalig", desc: "1 Song", features: ["1 personalisierter Song", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Story-Video als MP4"], highlight: false, note: "" },
              { name: "Paket", price: "€14,99", sub: "einmalig · spart €5", desc: "5 Songs", features: ["5 personalisierte Songs", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video als MP4"], highlight: true, note: "★ Beliebteste Wahl" },
              { name: "Flat", price: "€34,99", sub: "pro Monat", desc: "max. 20 Songs", features: ["20 Songs/Monat", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video als MP4"], highlight: false, note: "Ideal für Familien & Kreative" },
            ].map(({ name, price, sub, desc, features, highlight, note }) => (
              <div key={name} className={`rounded-3xl p-8 border flex flex-col ${highlight ? "bg-[#d97706] border-[#d97706]" : "bg-white/70 border-black/8"}`}>
                {note && <span className={`text-xs font-semibold tracking-widest uppercase mb-3 ${highlight ? "text-amber-200" : "text-[#78716c]"}`}>{note}</span>}
                <h3 className={`text-xl font-bold ${highlight ? "text-white" : "text-[#18120e]"}`}>{name}</h3>
                <div className="mt-3 mb-1">
                  <span className={`font-display text-5xl ${highlight ? "text-white" : "text-[#18120e]"}`}>{price}</span>
                </div>
                <p className={`text-sm mb-6 ${highlight ? "text-white/60" : "text-[#78716c]"}`}>{sub} · {desc}</p>
                <ul className="space-y-2.5 flex-1">
                  {features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${highlight ? "text-white/80" : "text-[#78716c]"}`}>
                      <span className={`font-bold mt-0.5 ${highlight ? "text-white" : "text-[#d97706]"}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#erstellen" className={`mt-8 text-center text-sm font-bold py-3.5 rounded-full transition-all hover:scale-105 ${highlight ? "bg-white text-[#d97706] hover:bg-zinc-100" : "bg-[#d97706] text-white hover:bg-[#b45309]"}`}>
                  Jetzt starten
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d97706] mb-3">Häufige Fragen</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Du fragst. Wir antworten.</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white/70 backdrop-blur rounded-2xl border border-black/5 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-semibold text-[#18120e] list-none">
                  {q}
                  <span className="text-[#d97706] text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-6 pb-6 text-[#78716c] leading-relaxed text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 text-center border-t border-black/8">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl leading-tight mb-4 text-[#18120e]">
            Wann hast du zuletzt<br />jemanden wirklich<br /><em className="not-italic text-[#f43f5e]">überrascht?</em>
          </h2>
          <p className="text-[#78716c] mb-8">Erste 10 Sekunden kostenlos hören. Kein Risiko.</p>
          <a href="#erstellen" className="inline-flex items-center gap-2 bg-[#d97706] text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-[#b45309] transition-all hover:scale-105 active:scale-95">
            Meinen ersten Song erstellen →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-[#18120e]">Made<span className="text-[#d97706]">Song</span></span>
          <p className="text-sm text-[#a8a29e]">© 2026 MadeSong — Ein persönlicher Song für jeden Moment.</p>
          <div className="flex gap-6 text-sm text-[#a8a29e]">
            <Link href="#" className="hover:text-[#1c1917] transition-colors">Impressum</Link>
            <Link href="#" className="hover:text-[#1c1917] transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
