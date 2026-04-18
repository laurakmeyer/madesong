import { Music } from "lucide-react";

export default function Datenschutz() {
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
          <h1 className="text-3xl font-extrabold text-[#18120e]">Datenschutzerklärung</h1>

          <div className="space-y-6 text-[#44403c] leading-relaxed">
            <div>
              <h2 className="font-bold text-[#18120e]">1. Verantwortliche Stelle</h2>
              <p>Laura Meyer</p>
              <p>Mauerkircherstraße 191, 81925 München</p>
              <p>E-Mail: laura.katharina.meyer@gmail.com</p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">2. Erhebung und Speicherung personenbezogener Daten</h2>
              <p>
                Beim Besuch unserer Website werden automatisch Informationen durch den Hosting-Anbieter (Vercel Inc.) erfasst.
                Diese Daten umfassen: Browsertyp, Betriebssystem, Referrer-URL, IP-Adresse, Zeitpunkt des Zugriffs.
                Diese Daten werden nicht mit anderen Datenquellen zusammengeführt.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">3. Nutzung der Song-Erstellung</h2>
              <p>
                Wenn Sie einen Song erstellen, werden die von Ihnen eingegebenen Daten (Name, Anlass, Alter, persönliche Details)
                zur Generierung des Songs verwendet und in unserer Datenbank (Supabase) gespeichert. Hochgeladene Fotos werden
                ebenfalls gespeichert, um den Song-Link bereitzustellen. Diese Daten werden nicht an Dritte zu Werbezwecken weitergegeben.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">4. Zahlungsabwicklung</h2>
              <p>
                Für die Zahlungsabwicklung nutzen wir Stripe (Stripe Inc., 354 Oyster Point Blvd, South San Francisco, CA 94080, USA).
                Bei einer Zahlung werden Ihre Zahlungsdaten direkt an Stripe übermittelt und dort verarbeitet.
                Wir selbst speichern keine Kreditkarten- oder Kontodaten. Es gelten die{" "}
                <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:underline">
                  Datenschutzbestimmungen von Stripe
                </a>.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">5. Einsatz von KI-Diensten</h2>
              <p>
                Zur Erstellung der Songtexte und der Musik werden KI-Dienste von Drittanbietern genutzt.
                Die von Ihnen eingegebenen Daten (Name, Anlass, persönliche Details) werden an diese Dienste übermittelt,
                um den personalisierten Song zu generieren. Die Daten werden ausschließlich für die Song-Erstellung verwendet.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">6. Hosting</h2>
              <p>
                Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet.
                Vercel verarbeitet Zugriffsdaten im Rahmen der Bereitstellung der Website. Es gelten die{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:underline">
                  Datenschutzbestimmungen von Vercel
                </a>.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">7. Ihre Rechte</h2>
              <p>Sie haben das Recht auf:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerspruch gegen die Verarbeitung</li>
              </ul>
              <p className="mt-2">Wenden Sie sich dazu an: laura.katharina.meyer@gmail.com</p>
            </div>

            <div>
              <h2 className="font-bold text-[#18120e]">8. Beschwerderecht</h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
                Zuständig ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA).
              </p>
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
