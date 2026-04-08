"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

const OCCASIONS = ["Birthday", "Lullaby", "Anniversary", "Christmas", "Valentine's Day", "Father's Day", "Mother's Day", "Just Because"];
const LANGUAGES = ["English", "Deutsch"];
const MOODS = ["Happy & Upbeat", "Warm & Tender", "Funny & Playful", "Calm & Soothing"];

export default function SongForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recipientName: "",
    occasion: "Birthday",
    language: "English",
    mood: "Happy & Upbeat",
    details: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API call will be added soon
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    alert("Song generation coming soon! 🎵");
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Create your song</CardTitle>
        <CardDescription>Fill in the details and we&apos;ll make the magic happen ✨</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Recipient Name */}
          <div className="space-y-1.5">
            <Label htmlFor="recipientName">Who is this song for?</Label>
            <Input
              id="recipientName"
              placeholder="e.g. Emma, Grandma, Max..."
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              required
            />
          </div>

          {/* Occasion */}
          <div className="space-y-1.5">
            <Label>Occasion</Label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setForm({ ...form, occasion: o })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.occasion === o
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <Label>Language</Label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, language: l })}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.language === l
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-1.5">
            <Label>Mood</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mood: m })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.mood === m
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-1.5">
            <Label htmlFor="details">Personal details <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Textarea
              id="details"
              placeholder="e.g. She loves cats, her favorite color is yellow, she just turned 5..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !form.recipientName}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-base rounded-xl"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating your song...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Create My Song</>
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            3 free songs included — no credit card required
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
