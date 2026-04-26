import { Music } from "lucide-react";

export default function Impressum() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdf8f2] via-[#f5ede0] to-[#ede0cc] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2">
            <Music className="h-5 w-5 text-[#d97706]" />
            <span className="text-lg font-bold text-[#1c1917]">MadeSong</span>
          </a>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50 space-y-6">
          <h1 className="text-3xl font-extrabold text-[#18120e]">Impressum</h1>

          <div className="space-y-4 text-[#44403c] leading-relaxed">
            <div>
              <h2 className="font-bold text-[#18120e]">Angaben gemäß § 5 DDG</h2>
              <p>Laura Meyer</p>
              <p>Mauerkircherstraße 191</p>
              <p>81925 München</p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">Kontakt</h2>
              <p>Telefon: +49 173 4549365</p>
              <p>E-Mail: laura.katharina.meyer@gmail.com</p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</h2>
              <p>Laura Meyer</p>
              <p>Mauerkircherstraße 191</p>
              <p>81925 München</p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-[#78716c] hover:text-[#d97706]">← Zurück zur Startseite</a>
        </div>
      </div>
    </main>
  );
}
