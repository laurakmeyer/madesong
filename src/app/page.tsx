import SongForm from "@/components/SongForm";
import { Music } from "lucide-react";

export default function Home() {
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
      <section className="max-w-4xl mx-auto px-8 pt-16 pb-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Ein persönlicher Song,<br />
          <span className="text-purple-600">gemacht nur für sie oder ihn.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-4 max-w-2xl mx-auto">
          Mach jeden Anlass unvergesslich — Geburtstag, Jahrestag, Gute Nacht oder einfach so.
          Erstelle in Sekunden einen einzigartigen KI-Song.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-8 pb-24">
        <SongForm />
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
          <p className="text-gray-500 mb-12">Bezahl nur was du brauchst — kein Abo-Zwang.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Single", price: "€3,99", desc: "1 Song", features: ["1 personalisierter Song", "Text + Musik", "MP3-Download", "Teilen-Link"] },
              { name: "Paket", price: "€14,99", desc: "5 Songs", features: ["5 personalisierte Songs", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund"], highlight: true },
              { name: "Flat", price: "€34,99/Monat", desc: "Bis zu 20 Songs", features: ["20 Songs pro Monat", "Text + Musik", "MP3-Download", "Teilen-Link", "Foto-Hintergrund"] },
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
