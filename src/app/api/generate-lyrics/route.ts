import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { recipientName, age, occasion, language, mood, favoriteAnimal, favoriteThing, details, refinement, existingLyrics } = await req.json();

  // Verfeinern-Modus: bestehende Lyrics anpassen
  if (refinement && existingLyrics) {
    try {
      const message = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: `Hier ist ein Songtext:\n\n${existingLyrics}\n\nBitte passe ihn an: ${refinement}\n\nBehalte das gleiche Format bei. Gib nur den überarbeiteten Songtext zurück, nichts anderes.` }],
      });
      const lyrics = message.content[0].type === "text" ? message.content[0].text : "";
      return NextResponse.json({ lyrics });
    } catch (error) {
      console.error("Claude API Error:", error);
      return NextResponse.json({ error: "Song konnte nicht angepasst werden." }, { status: 500 });
    }
  }

  const ageNum = age ? parseInt(age) : null;

  // Altersgruppe bestimmen
  let ageGuide = "";
  if (ageNum !== null) {
    if (ageNum <= 4) {
      ageGuide = `Das Kind ist ${ageNum} Jahre alt. Verwende sehr einfache, kurze Wörter (max. 2 Silben wenn möglich). Viele Wiederholungen. Lustige Klänge und Reime. Sehr kurze Strophen. Erwähne den Namen oft.`;
    } else if (ageNum <= 8) {
      ageGuide = `Das Kind ist ${ageNum} Jahre alt. Einfache, klare Sprache. Fröhliche Bilder und Fantasie. Reime sind wichtig. Erwähne Lieblingsthemen oft. Nicht zu lang.`;
    } else if (ageNum <= 12) {
      ageGuide = `Das Kind ist ${ageNum} Jahre alt. Etwas komplexere Sprache ist okay, aber noch spielerisch. Kann "cool" klingen. Keine Baby-Sprache.`;
    } else {
      ageGuide = `Die Person ist ${ageNum} Jahre alt. Normale Songsprache, emotional und persönlich.`;
    }
  }

  const personalDetails = [
    favoriteAnimal && `Lieblingstier: ${favoriteAnimal}`,
    favoriteThing && `Lieblingsding/Hobby: ${favoriteThing}`,
    details && `Weitere Details: ${details}`,
  ].filter(Boolean).join("\n");

  const prompt = `Du bist ein kreativer Songwriter. Schreibe einen personalisierten Song mit folgenden Infos:

Name: ${recipientName}
Anlass: ${occasion}
Stimmung: ${mood}
Sprache: ${language}
${ageGuide ? `\nAltershinweis: ${ageGuide}` : ""}
${personalDetails ? `\nPersönliche Details:\n${personalDetails}` : ""}

Schreibe einen kompletten Song mit:
- Einem Titel
- 2 Strophen
- Einem Refrain (der sich wiederholt)
- Optional: einer Bridge

Formatiere den Song so:
**Titel: [Titel]**

[Strophe 1]
...

[Refrain]
...

[Strophe 2]
...

[Refrain]
...

Der Song soll ${recipientName} ansprechen, persönlich wirken und zum Anlass "${occasion}" passen. Nutze die persönlichen Details um den Song einzigartig zu machen.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const lyrics = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error("Claude API Error:", error);
    return NextResponse.json({ error: "Song konnte nicht erstellt werden." }, { status: 500 });
  }
}
