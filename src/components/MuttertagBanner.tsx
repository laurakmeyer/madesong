const MUTTERTAG = new Date("2026-05-10T00:00:00+02:00");

export default function MuttertagBanner() {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((MUTTERTAG.getTime() - now.getTime()) / msPerDay);

  if (daysLeft < 0 || daysLeft > 30) return null;

  const label =
    daysLeft === 0 ? "Heute ist Muttertag" :
    daysLeft === 1 ? "Morgen ist Muttertag" :
    `Muttertag in ${daysLeft} Tagen`;

  return (
    <a
      href="/?anlass=Muttertag#erstellen"
      className="block w-full bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 text-white text-center text-sm font-semibold py-2.5 px-4 hover:brightness-110 transition-all"
    >
      <span className="mr-2">🌸</span>
      {label} — jetzt einen persönlichen Song für Mama erstellen
      <span className="ml-2 underline">→</span>
    </a>
  );
}
