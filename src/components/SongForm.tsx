"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Music2, RefreshCw } from "lucide-react";

const OCCASIONS = ["Geburtstag", "Schlaflied", "Jahrestag", "Weihnachten", "Valentinstag", "Vatertag", "Muttertag", "Einfach so"];
const LANGUAGES = ["Deutsch", "English"];
const MOODS = ["Fröhlich & mitreißend", "Warm & zärtlich", "Lustig & verspielt", "Ruhig & sanft"];

export default function SongForm({ preselectedOccasion }: { preselectedOccasion?: string }) {
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    recipientName: "",
    age: "",
    occasion: preselectedOccasion || "Geburtstag",
    language: "Deutsch",
    mood: "Fröhlich & mitreißend",
    favoriteThing: "",
    favoriteAnimal: "",
    details: "",
  });

  // Wenn Hero-Chip geklickt wird, Anlass im Formular aktualisieren
  if (preselectedOccasion && form.occasion !== preselectedOccasion) {
    setForm((f) => ({ ...f, occasion: preselectedOccasion }));
  }

  const isChild = form.age !== "" && parseInt(form.age) <= 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLyrics(null);
    setError(null);

    try {
      const res = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLyrics(data.lyrics);
    } catch (err) {
      setError("Ups, da ist etwas schiefgelaufen. Bitte versuche es nochmal.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Songtexte formatiert anzeigen
  const formatLyrics = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="text-lg font-bold text-purple-700 mt-2 mb-3">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.startsWith("[") && line.endsWith("]")) {
        return <p key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-4 mb-1">{line}</p>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="text-gray-800 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">Deinen Song erstellen</CardTitle>
          <CardDescription>Füll die Details aus und wir zaubern etwas Besonderes ✨</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + Alter */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="recipientName">Für wen ist dieser Song?</Label>
                <Input
                  id="recipientName"
                  placeholder="z.B. Emma, Oma, Max..."
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Alter</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="99"
                  placeholder="z.B. 5"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
            </div>

            {/* Kindspezifische Felder */}
            {isChild && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="col-span-2 text-sm font-medium text-purple-700 mb-1">
                  🧒 Erzähl uns mehr über {form.recipientName || "das Kind"}!
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="favoriteAnimal">Lieblingstier</Label>
                  <Input
                    id="favoriteAnimal"
                    placeholder="z.B. Einhorn, Hund, Dino..."
                    value={form.favoriteAnimal}
                    onChange={(e) => setForm({ ...form, favoriteAnimal: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="favoriteThing">Lieblingsding</Label>
                  <Input
                    id="favoriteThing"
                    placeholder="z.B. Fußball, Malen, Lego..."
                    value={form.favoriteThing}
                    onChange={(e) => setForm({ ...form, favoriteThing: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Anlass */}
            <div className="space-y-1.5">
              <Label>Anlass</Label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button key={o} type="button" onClick={() => setForm({ ...form, occasion: o })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.occasion === o ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprache */}
            <div className="space-y-1.5">
              <Label>Sprache</Label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} type="button" onClick={() => setForm({ ...form, language: l })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${form.language === l ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Stimmung */}
            <div className="space-y-1.5">
              <Label>Stimmung</Label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.mood === m ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Persönliche Details */}
            <div className="space-y-1.5">
              <Label htmlFor="details">
                {isChild ? `Noch mehr über ${form.recipientName || "das Kind"}` : "Persönliche Details"}
                {" "}<span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="details"
                placeholder={isChild
                  ? `z.B. ${form.recipientName || "sie/er"} liebt Spaghetti, hat einen Bruder namens Luca, geht gerne in den Park...`
                  : "z.B. wir kennen uns seit 10 Jahren, liebt Reisen, arbeitet als Lehrerin..."}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                rows={3}
              />
            </div>

            {/* Button */}
            <Button type="submit" disabled={loading || !form.recipientName}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-base rounded-xl">
              {loading
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Song wird erstellt...</>
                : <><Sparkles className="mr-2 h-5 w-5" /> Meinen Song erstellen</>}
            </Button>

            <p className="text-center text-xs text-gray-400">
              3 kostenlose Songs inklusive — keine Kreditkarte nötig
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Fehler */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* Songtext Ergebnis */}
      {lyrics && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold text-gray-900">Dein Song ist fertig! 🎉</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="text-purple-600 hover:text-purple-700 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Neu generieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 rounded-xl p-6 space-y-1">
              {formatLyrics(lyrics)}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              🎵 Audio-Generierung kommt bald!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
