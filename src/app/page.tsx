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
          <a href="#how-it-works" className="hover:text-purple-600 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-16 pb-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          A personalized song,<br />
          <span className="text-purple-600">made just for them.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Turn any occasion into an unforgettable memory — birthdays, anniversaries,
          bedtime, or just because. Create a unique AI-generated song in seconds.
        </p>

        {/* Occasions */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["🎂 Birthday", "🌙 Lullaby", "💍 Anniversary", "🎄 Christmas", "💝 Just Because", "👨 Father's Day"].map((tag) => (
            <span key={tag} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-8 pb-24">
        <SongForm />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "1", icon: "✍️", title: "Tell us the story", desc: "Enter the name, occasion, and a few personal details." },
              { step: "2", icon: "✨", title: "AI creates the song", desc: "We generate unique lyrics and a full melody in seconds." },
              { step: "3", icon: "🎁", title: "Share the gift", desc: "Download or share the song directly with your loved one." },
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500 mb-12">Start for free, upgrade when you love it.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Free", price: "€0", desc: "Try it out", features: ["3 songs", "Standard quality", "MP3 download"] },
              { name: "Pack", price: "€4.99", desc: "10 songs", features: ["10 songs", "High quality", "MP3 & share link"], highlight: true },
              { name: "Unlimited", price: "€9.99/mo", desc: "For frequent gifters", features: ["Unlimited songs", "Highest quality", "Priority generation"] },
            ].map(({ name, price, desc, features, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 border ${highlight ? "border-purple-400 bg-purple-50 shadow-md" : "border-gray-200 bg-white"}`}>
                {highlight && <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Most popular</span>}
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
        <p>© 2026 MadeSong — A personalized song for every moment.</p>
      </footer>
    </main>
  );
}
