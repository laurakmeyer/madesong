import SongForm from "@/components/SongForm";
import HeroCarousel from "@/components/HeroCarousel";
import DragTicker from "@/components/DragTicker";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2, 0.3, 0.05, 0.15, 0.25, 0.4, 0.08, 0.18, 0.28, 0.12, 0.22];

const HERO_CARDS = [
  { anlass: "Geburtstag", name: "Maria, 60 Jahre", preview: "Sechzig Jahre voller Glanz, heut' ist dein ganz besondrer Tanz...", icon: "🎂", tag: null },
  { anlass: "Schlaflied", name: "Für kleine Emma", preview: "Schlaf, mein kleines Sternenkind, träum von allem was du bist...", icon: "🍼", tag: null },
  { anlass: "Liebeslied", name: "Laura & Tom", preview: "Seit dem ersten Augenblick wusst ich, du bist mein Glück...", icon: "💑", tag: "Beliebt" },
  { anlass: "Muttertag", name: "Für Mama", preview: "Mama, du bist mein Anker, mein Licht und mein Zuhause...", icon: "🌸", tag: null },
  { anlass: "Weihnachten", name: "Familie Meyer", preview: "An Weihnachten, wenn Kerzen glüh'n, denk ich an euch, die ich lieb...", icon: "🎄", tag: null },
];

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
    <main className="bg-white text-[#1c1917]">

      {/* Header — hell, wie Hims */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-white/90 backdrop-blur-md border-b border-black/6">
        <span className="text-2xl font-bold tracking-tight text-[#18120e]">MadeSong</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#78716c]">
          <a href="#so-funktionierts" className="hover:text-[#18120e] transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-[#18120e] transition-colors">Preise</a>
          <a href="#faq" className="hover:text-[#18120e] transition-colors">FAQ</a>
        </nav>
        <a href="#erstellen" className="text-sm font-semibold bg-[#18120e] text-white px-5 py-2.5 rounded-full hover:bg-[#3a2c18] transition-colors">
          Song erstellen →
        </a>
      </header>

      {/* Hero — Foto rechts von ganz oben */}
      <section className="pt-24 pb-0 px-6 md:px-12 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

          {/* Links: Label + Headline + Amber Card */}
          <div className="flex flex-col pt-8 pb-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d97706] mb-4">Personalisierte KI-Musik · Ab €3,99</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.93] tracking-tight mb-6 text-[#18120e]">
              Das Geschenk,<br />
              das <em className="not-italic text-[#d97706]">wirklich</em><br />
              bewegt.
            </h1>
            <div className="relative rounded-3xl overflow-hidden flex-1 hero-bg flex flex-col justify-between p-8 min-h-64">
              <div>
                <p className="text-white/60 text-sm font-medium mb-2">Für jeden Moment</p>
                <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
                  Ein Song, den es<br />nur einmal gibt.
                </h2>
              </div>
              <div>
                <div className="flex items-end gap-1 h-8 mb-4">
                  {WAVE_DELAYS.slice(0, 12).map((delay, i) => (
                    <div key={i} className="wave-bar w-1.5 rounded-full bg-white/60"
                      style={{ height: "100%", animationDelay: `${delay}s`, animationDuration: `${0.9 + (i % 4) * 0.15}s` }} />
                  ))}
                </div>
                <a href="#erstellen" className="inline-flex items-center gap-2 bg-white text-[#18120e] font-bold text-sm px-6 py-3 rounded-full hover:bg-amber-50 transition-all">
                  Jetzt kostenlos ausprobieren →
                </a>
              </div>
            </div>
            <p className="text-xs text-[#a8a29e] text-center mt-3">Erste 10 Sekunden kostenlos · Kein Account · Keine Kreditkarte</p>
          </div>

          {/* Rechts: Foto mit Tiles als Overlay */}
          <div className="relative rounded-3xl overflow-hidden" style={{minHeight: "600px"}}>
            <Image src="/hero-mutter.png" alt="Frau tanzt" fill className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />
            <div className="absolute top-6 left-6">
              <p className="text-white/70 text-sm font-medium">Perfekt für</p>
              <p className="font-display text-2xl md:text-3xl text-white leading-tight">Jeden Anlass.<br />Jede Person.</p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
              {[
                { icon: "🎂", label: "Geburtstag" },
                { icon: "🍼", label: "Schlaflied" },
                { icon: "💑", label: "Liebeslied" },
                { icon: "🌸", label: "Muttertag" },
              ].map(({ icon, label }) => (
                <a key={label} href={`/?anlass=${label}#erstellen`}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 text-sm font-medium text-[#18120e] hover:bg-white transition-colors">
                  <span>{icon}</span> {label} <span className="ml-auto text-[#78716c] text-xs">›</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Form — amber Hintergrund */}
      <section id="erstellen" className="py-20 px-6 hero-bg">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl md:text-5xl text-white">Erstelle deinen Song. Jetzt.</h2>
            <p className="text-white/60 mt-2">Erste 10 Sekunden kostenlos hören — kein Account, keine Kreditkarte.</p>
          </div>
          <Suspense fallback={null}><SongForm /></Suspense>
        </div>
      </section>

      {/* Karussell 1 — Sterne-Ticker, manuell schiebbar */}
      <div className="py-5 hero-bg">
        <DragTicker variant="text" items={[
          "Ein Song bleibt für immer.",
          "Kein Song klingt wie der andere.",
          "Fertig in unter 2 Minuten.",
          "Ab €3,99 — einmalig.",
          "Echter Gesang, keine KI-Stimme.",
          "Kein Account nötig.",
          "Einzigartig wie die Person.",
        ]} />
      </div>

      {/* Karussell 2 — Drag-scrollbare Anlass-Karten */}
      <div className="hero-bg py-12">
        <div className="text-center mb-8 px-6">
          <h2 className="font-display text-3xl md:text-4xl text-white">Für jeden Anlass den perfekten Song.</h2>
          <p className="text-white/60 mt-2 text-sm">Einfach klicken und direkt loslegen.</p>
        </div>
        <HeroCarousel />
      </div>

      {/* Feature 1: Baby/Schlaflied — amber Hintergrund */}
      <section className="py-20 px-6 md:px-20 hero-bg">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-300">Schlaflied · Taufe · Geburt</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-white">
              Kein Kind schläft besser als mit seinem eigenen Lied.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Du gibst an: Name, Lieblingstier, Lieblingsding. Die KI schreibt einen altersgerechten Text — liebevoll, persönlich, einzigartig.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[["<2 Min", "Fertig"],["€3,99", "Ab dem 1. Song"],["100%", "Persönlich"],["∞", "Für immer"]].map(([num, label]) => (
                <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                  <div className="font-display text-2xl text-white">{num}</div>
                  <div className="text-xs text-white/60 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-white text-[#18120e] px-6 py-3 rounded-full hover:bg-amber-50 transition-all">
              Schlaflied erstellen →
            </a>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2">
            <Image src="/hero-baby.png" alt="Mutter mit Kind" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Ticker — nach Schlaflied, manuell schiebbar */}
      <div className="py-5 hero-bg border-t border-white/10">
        <DragTicker variant="text" items={[
          "Ein Song bleibt für immer.",
          "Kein Song klingt wie der andere.",
          "Fertig in 2 Minuten.",
          "Ab €3,99.",
          "Kein Account.",
          "Echter Gesang.",
          "Einzigartig wie die Person.",
        ]} />
      </div>

      {/* Feature 2: Mutter/Geburtstag */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
            <Image src="/18jähriger.png" alt="Junger Mann bekommt Song zum 18. Geburtstag" fill className="object-cover" />
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
      <section className="py-20 px-6 md:px-20">
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
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Kein Warten — fertig bevor du den Tab schließt</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>MadeSong: €3,99 — fertig bevor du den Tab schließt</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Text bearbeiten, verfeinern, neu generieren — unlimitiert</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Foto hochladen → erscheint als Hintergrund auf der Teilen-Seite</p>
              <p className="flex gap-3"><span className="text-[#d97706]">✓</span>Story-Video als MP4 für Instagram & WhatsApp Status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Video Section */}
      <section className="py-20 px-6" style={{background: "linear-gradient(180deg, #fdf8f2 0%, #f5ede0 100%)"}}>
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
              <div className="relative h-full bg-gradient-to-b from-[#3a2c18] to-[#1e180e] flex flex-col items-center justify-between pb-12 pt-4">
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
      <section id="so-funktionierts" className="py-20 px-6" style={{background: "linear-gradient(180deg, #f5ede0 0%, #fdf8f2 100%)"}}>
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
      <section id="preise" className="py-20 px-6 border-t border-black/8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Ein Geschenk für die Ewigkeit.</h2>
            <p className="text-[#78716c] mt-3">Ab €3,99. Einmalig. Unvergesslich.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Song", price: "€3,99", sub: "einmalig", desc: "1 Song", features: ["1 personalisierter Song", "Text + echter Gesang", "MP3-Download", "Dauerhafter Teilen-Link"], highlight: false, note: "" },
              { name: "Song + Video", price: "€4,99", sub: "einmalig · nur €1 mehr", desc: "1 Song + Story-Video", features: ["1 personalisierter Song", "Text + echter Gesang", "MP3-Download", "Dauerhafter Teilen-Link", "Story-Video als MP4 (9:16)", "Direkt auf Instagram & WhatsApp"], highlight: true, note: "★ Empfohlen" },
              { name: "Paket", price: "€19,99", sub: "einmalig · spart €5", desc: "5× Song oder Song + Video", features: ["5 personalisierte Songs", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video als MP4"], highlight: false, note: "Ideal für Familien & Kreative" },
              { name: "Flat", price: "€34,99", sub: "pro Monat", desc: "bis zu 20 Songs oder Song + Video", features: ["20 Songs/Monat", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video als MP4"], highlight: false, note: "Für Familien & Vielschenker" },
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
      <section id="faq" className="py-20 px-6">
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

      {/* Final CTA — warme Gradient + Foto */}
      <section className="py-20 px-6 md:px-12 overflow-hidden" style={{background: "linear-gradient(135deg, #fdf0e0 0%, #f5d9a8 40%, #e8b872 100%)"}}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-5xl md:text-6xl leading-tight mb-4 text-[#18120e]">
              Wann hast du zuletzt<br />jemanden wirklich<br /><em className="not-italic text-[#c2410c]">überrascht?</em>
            </h2>
            <p className="text-[#78716c] mb-8 text-lg">Erste 10 Sekunden kostenlos hören. Kein Risiko.</p>
            <a href="#erstellen" className="inline-flex items-center gap-2 bg-[#18120e] text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-[#3a2c18] transition-all hover:scale-105 active:scale-95">
              Meinen ersten Song erstellen →
            </a>
          </div>
          <div className="relative h-80 md:h-[480px] rounded-3xl overflow-hidden shadow-2xl">
            <Image src="/mid aged man.png" alt="Mann bekommt emotionalen Song" fill className="object-cover object-center" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-[#18120e]">MadeSong</span>
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
