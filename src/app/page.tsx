import SongForm from "@/components/SongForm";
import Link from "next/link";
import Image from "next/image";

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.35, 0.1, 0.2, 0.3, 0.05, 0.15, 0.25, 0.4, 0.08, 0.18, 0.28, 0.12, 0.22];

const FAQ = [
  { q: "Klingt das wirklich gut — oder wie ein Computer?", a: "Echter Gesang, echte Instrumente. Mureka AI erzeugt vollständige Songs mit menschlicher Stimme — kein synthetisches Text-to-Speech. Hör selbst: einfach einen kostenlosen Song erstellen." },
  { q: "Was wenn mir der Song nicht gefällt?", a: "Du kannst den Text direkt im Browser bearbeiten, ihn per KI mit einem Satz verfeinern (z.B. \"Mach es fröhlicher\") oder komplett neu generieren — so oft du willst, vor der Zahlung." },
  { q: "Wie persönlich ist das wirklich?", a: "Du gibst Name, Alter, Anlass, Lieblingstiere, persönliche Details ein — alles fließt in den Song ein. Kein anderer Mensch auf der Welt hat denselben Song." },
  { q: "Wie lange dauert die Erstellung?", a: "~2 Minuten von Eingabe bis fertigem Song. Der Songtext erscheint in Sekunden, die Musik dauert ca. 60 Sekunden. Kein Warten, kein Bearbeiten durch Menschen." },
  { q: "€3,99 klingt zu günstig — wo ist der Haken?", a: "Kein Haken. KI macht es möglich: Wettbewerber zahlen Musiker und brauchen Tage. Wir brauchen Sekunden. Die Ersparnis geben wir weiter." },
  { q: "Kann ich den Song behalten und teilen?", a: "Ja. MP3-Download, ein dauerhafter Teilen-Link (madesong.com/song/…) und ein Story-Video für Instagram & WhatsApp. Alles gehört dir." },
  { q: "Brauche ich Technikkenntnisse oder ein Konto?", a: "Nein. Formular ausfüllen, auf \"Erstellen\" klicken, fertig. Kein Account, keine App, keine Kreditkarte für die ersten 3 Songs." },
  { q: "Funktioniert das auch für Kinder?", a: "Besonders gut. Die KI erkennt das Alter und passt Sprache, Wortwahl und Stil automatisch an — einfach und liebevoll für Kleinkinder, cool für Teenies." },
];

export default function Home() {
  return (
    <main className="mesh-bg text-[#1c1917]">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 backdrop-blur-md border-b border-black/5" style={{ backgroundColor: "rgba(253,248,242,0.92)" }}>
        <span className="font-display text-xl font-bold tracking-tight text-[#1c1917]">MadeSong</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#78716c]">
          <a href="#so-funktionierts" className="hover:text-[#1c1917] transition-colors">So funktioniert&apos;s</a>
          <a href="#preise" className="hover:text-[#1c1917] transition-colors">Preise</a>
          <a href="#faq" className="hover:text-[#1c1917] transition-colors">FAQ</a>
        </nav>
        <a href="#erstellen" className="text-sm font-semibold bg-[#7c3aed] text-white px-5 py-2.5 rounded-full hover:bg-[#6d28d9] transition-colors">
          Song erstellen →
        </a>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7c3aed] mb-6">Personalisierte KI-Musik · Ab €3,99</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[100px] leading-[0.95] tracking-tight mb-6 text-[#18120e]">
          Sie wird weinen.<br />
          <em className="not-italic text-[#7c3aed]">Vor Freude.</em>
        </h1>
        <p className="text-lg md:text-xl text-[#78716c] max-w-lg mx-auto mb-4 leading-relaxed">
          Ein Song mit ihrem Namen, ihrer Geschichte, ihrer Melodie — in 2 Minuten fertig. Kein anderer Mensch auf der Welt hat diesen Song.
        </p>
        <p className="text-sm text-[#a8a29e] mb-8">€3,99. Weniger als ein Kaffee. Mehr als jedes Geschenk.</p>
        <a href="#erstellen" className="inline-flex items-center gap-2 bg-[#18120e] text-white font-bold text-base md:text-lg px-8 py-4 rounded-full hover:bg-[#7c3aed] transition-all hover:scale-105 active:scale-95">
          Jetzt kostenlos ausprobieren →
        </a>
        <p className="text-xs text-[#a8a29e] mt-3">3 kostenlose Songs · Kein Account · Keine Kreditkarte</p>
        <div className="mt-16 flex items-end gap-1 h-12">
          {WAVE_DELAYS.map((delay, i) => (
            <div key={i} className="wave-bar w-1.5 rounded-full"
              style={{ height: "100%", background: i % 2 === 0 ? "#7c3aed" : "#f43f5e", animationDelay: `${delay}s`, animationDuration: `${0.9 + (i % 4) * 0.15}s`, opacity: 0.4 + (i % 3) * 0.2 }} />
          ))}
        </div>
      </section>

      {/* Problem vs. MadeSong */}
      <section className="py-16 px-6 bg-[#18120e] text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { pain: "Blumen welken.", solution: "Ein Song bleibt für immer." },
            { pain: "Gutscheine sind unpersönlich.", solution: "Kein Song klingt wie der andere." },
            { pain: "Wettbewerber: €49, 3 Tage.", solution: "MadeSong: €3,99, 2 Minuten." },
          ].map(({ pain, solution }) => (
            <div key={pain} className="space-y-2">
              <p className="text-[#78716c] line-through text-sm">{pain}</p>
              <p className="text-white font-semibold">{solution}</p>
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
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7c3aed]">Geburtstag · Muttertag · Einfach so</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Das erste Mal, dass ein Geschenk ihren Namen singt.
            </h2>
            <ul className="space-y-3 text-[#78716c]">
              <li className="flex gap-3"><span className="text-[#7c3aed] font-bold mt-0.5">✓</span><span>Echter Song mit Gesang — keine Computerstimme</span></li>
              <li className="flex gap-3"><span className="text-[#7c3aed] font-bold mt-0.5">✓</span><span>Fertig in ~2 Minuten, nicht in 3 Tagen</span></li>
              <li className="flex gap-3"><span className="text-[#7c3aed] font-bold mt-0.5">✓</span><span>Per WhatsApp teilen, als MP3 laden oder als Story-Video posten</span></li>
              <li className="flex gap-3"><span className="text-[#7c3aed] font-bold mt-0.5">✓</span><span>Text direkt bearbeiten oder per KI verfeinern</span></li>
            </ul>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-[#7c3aed] text-white px-6 py-3 rounded-full hover:bg-[#6d28d9] transition-all">
              Song erstellen →
            </a>
          </div>
        </div>
      </section>

      {/* Feature 2: Baby */}
      <section className="py-20 md:py-32 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-5 order-2 md:order-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7c3aed]">Schlaflied · Taufe · Geburt</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Kein Kind schläft besser als mit seinem eigenen Lied.
            </h2>
            <p className="text-[#78716c] leading-relaxed">
              Du gibst an: Name, Lieblingstier, Lieblingsding. Die KI schreibt einen altersgerechten Text — liebevoll, persönlich, einzigartig.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[["2 Min", "Fertig"],["€3,99", "Ab dem 1. Song"],["100%", "Persönlich"],["∞", "Für immer"]].map(([num, label]) => (
                <div key={label} className="bg-white/70 rounded-2xl p-4 text-center border border-black/5 backdrop-blur">
                  <div className="font-display text-2xl text-[#18120e]">{num}</div>
                  <div className="text-xs text-[#78716c] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <a href="#erstellen" className="inline-flex items-center gap-2 text-sm font-bold bg-[#7c3aed] text-white px-6 py-3 rounded-full hover:bg-[#6d28d9] transition-all">
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
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7c3aed]">Warum MadeSong?</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#18120e]">
              Weil &ldquo;Happy Birthday&rdquo; es nicht mehr tut.
            </h2>
            <p className="text-[#78716c] leading-relaxed">Alle singen dasselbe Lied. Du schenkst etwas, das es genau einmal auf der Welt gibt.</p>
            <div className="space-y-3 text-sm text-[#78716c] border-t border-black/8 pt-4">
              <p className="flex gap-3"><span className="text-[#7c3aed]">✓</span>Wettbewerber: €29–€50 und Tage Wartezeit</p>
              <p className="flex gap-3"><span className="text-[#7c3aed]">✓</span>MadeSong: €3,99 — fertig bevor du den Tab schließt</p>
              <p className="flex gap-3"><span className="text-[#7c3aed]">✓</span>Text bearbeiten, verfeinern, neu generieren — unlimitiert</p>
              <p className="flex gap-3"><span className="text-[#7c3aed]">✓</span>Foto hochladen → als Hintergrund auf der Teilen-Seite</p>
              <p className="flex gap-3"><span className="text-[#7c3aed]">✓</span>Story-Video Export für Instagram & WhatsApp Status</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="erstellen" className="py-24 px-6 bg-[#18120e] text-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#f43f5e] mb-3">Sofort · Kostenlos · Kein Account</p>
            <h2 className="font-display text-4xl md:text-5xl text-white">Erstell deinen ersten Song.</h2>
            <p className="text-[#78716c] mt-3">3 Songs kostenlos. Kreditkarte erst wenn du mehr willst.</p>
          </div>
          <SongForm />
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">So einfach geht&apos;s.</h2>
            <p className="text-[#78716c] mt-3">Keine Vorkenntnisse. Kein Aufwand. Einfach ausfüllen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "✍️", title: "Details eingeben", desc: "Name, Anlass, Alter — und ein paar persönliche Details die den Unterschied machen." },
              { num: "02", icon: "✨", title: "KI komponiert", desc: "Claude AI schreibt den Text. Mureka AI vertont ihn mit echtem Gesang und Instrumenten." },
              { num: "03", icon: "🎁", title: "Teilen & staunen", desc: "WhatsApp, Instagram Story, MP3-Download. Du entscheidest — und sie staunen." },
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
      <section id="preise" className="py-24 px-6 bg-[#18120e] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-white">Weniger als ein Blumenstrauß.</h2>
            <p className="text-[#78716c] mt-3">Und unvergesslicher.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Single", price: "€3,99", sub: "einmalig", desc: "1 Song", features: ["1 personalisierter Song", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Story-Video Export"], highlight: false, note: "" },
              { name: "Paket", price: "€14,99", sub: "einmalig · spart €5", desc: "5 Songs", features: ["5 personalisierte Songs", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video Export"], highlight: true, note: "★ Beliebteste Wahl" },
              { name: "Flat", price: "€34,99", sub: "pro Monat", desc: "max. 20 Songs", features: ["20 Songs/Monat", "Text + echter Gesang", "MP3-Download", "Teilen-Link", "Foto als Hintergrund", "Story-Video Export"], highlight: false, note: "Ideal für Familien & Kreative" },
            ].map(({ name, price, sub, desc, features, highlight, note }) => (
              <div key={name} className={`rounded-3xl p-8 border flex flex-col ${highlight ? "bg-[#7c3aed] border-[#7c3aed]" : "bg-white/5 border-white/10"}`}>
                {note && <span className={`text-xs font-semibold tracking-widest uppercase mb-3 ${highlight ? "text-purple-200" : "text-[#78716c]"}`}>{note}</span>}
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <div className="mt-3 mb-1">
                  <span className="font-display text-5xl text-white">{price}</span>
                </div>
                <p className="text-sm mb-6 text-white/60">{sub} · {desc}</p>
                <ul className="space-y-2.5 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                      <span className={`font-bold mt-0.5 ${highlight ? "text-white" : "text-[#7c3aed]"}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#erstellen" className={`mt-8 text-center text-sm font-bold py-3.5 rounded-full transition-all hover:scale-105 ${highlight ? "bg-white text-[#7c3aed] hover:bg-zinc-100" : "bg-white text-[#18120e] hover:bg-zinc-100"}`}>
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
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7c3aed] mb-3">Häufige Fragen</p>
            <h2 className="font-display text-4xl md:text-5xl text-[#18120e]">Du fragst. Wir antworten.</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group bg-white/70 backdrop-blur rounded-2xl border border-black/5 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer font-semibold text-[#18120e] list-none">
                  {q}
                  <span className="text-[#7c3aed] text-xl shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-6 pb-6 text-[#78716c] leading-relaxed text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 text-center bg-[#18120e]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl md:text-6xl leading-tight mb-4 text-white">
            Wann hast du zuletzt<br />jemanden wirklich<br /><em className="not-italic text-[#f43f5e]">überrascht?</em>
          </h2>
          <p className="text-[#78716c] mb-8">3 kostenlose Songs warten. Kein Risiko.</p>
          <a href="#erstellen" className="inline-flex items-center gap-2 bg-[#7c3aed] text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-[#6d28d9] transition-all hover:scale-105 active:scale-95">
            Meinen ersten Song erstellen →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 py-10 px-6 mesh-bg">
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
