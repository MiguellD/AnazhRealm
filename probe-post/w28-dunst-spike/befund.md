# Spike „das frühe Bild im Dunst“ (Auftrag Koordinator 15.11. ~18:03) — ZWISCHENSTAND

GTX 1050, 15.11. 18:08–18:18, Kopf 19ac21b3 (= main 2b826a89 + Weckruf), echter Renderer, Genesis-Ankunft der Sonde, kalt
(frisches Profil je Lauf), im Wechsel gegen heute. Kein Bau, ein Eingriff von außen (`eingriff-nebel.js`).

## Das Urteil: der Spike TRÄGT — mit zwei Bedingungen aus der Messung

| | heute (n 3) | frühes Bild im Dunst (n 4) |
|---|---|---|
| Sekunden bis zum Bild des Spielers | 21,9 · 22,5 · 23,7 | **11,3 · 11,2 · 11,8 · 13,9** |
| Sekunden, bis alles gebaut ist (das heutige Weltbild) | 21,9 · 22,5 · 23,7 | 21,1 · 21,5 · 22,0 · 22,7 — nicht schlechter |
| Sekunden, bis die Luft wieder klar ist | — | 26,3 · 26,7 · 27,4 · 28,3 (die Rate des Hebens ist gewählt: ×3 je Sekunde) |
| neu gebaute Bäume und Bauten nach dem frühen Bild | — | 218 · 222 · 218 · 219 |
| davon im klaren Radius erschienen (Kontrast der Luft > 10 %) | — | **0 · 0 · 0 · 0** |
| Bild-Abstand zwischen frühem Bild und Weltbild, Median / p95 | — | 20–35 ms / 178–239 ms |

1. **EIN Regler, ja:** die Extinktion β der EINEN Luft (`luft.U.beta`, je Bild geschrieben aus `_luftBeta`, V = 3,912 / β).
   Der Radius folgt dem nächsten offenen Bau-Posten: offene Pflanzung 15 m, offene Streu 10 m, offener Horizont oder Karten
   höchstens der Cull-Radius, sonst der nächste ungebaute Eintrag; minus Rand (15 %, mindestens 4 m). Er wächst nur, nie
   zurück, und er steht, solange ein Programm des Bilds entsteht.
2. **Bedingung 1 — die Welt bleibt im Lade-Takt, bis alles steht.** Gibt man das erste Weltbild wirklich früh frei
   (`_weltbildSteht` bei 12,2 s), baut der Rest im Takt des Spiels: nach 28 s standen Pflanzung, Bauten und Karten noch
   offen, der Radius bei 11 m (n 1). Tragfähig ist nur: der Ladeschirm weicht früh, der Lade-Takt bleibt.
3. **Bedingung 2 — β allein gibt keinen Morgen.** Dieselbe Extinktion ist das Aerosol der EINEN Atmosphäre: bei 11–46 m
   Sichtweite wird der ganze Himmel dunkel rotbraun, dann orange (`beta-allein-*.jpg` — ein Sandsturm). Der Nebel des Spikes
   setzt darum nur die Uniforms des Luft-Knotens: neutrales Spektrum, eine flache Schicht (Skalenhöhe 40 m) auf der Höhe des
   Spielers; die Atmosphäre bleibt klar. Das ist ein eigenes Glied im Gesetz der Luft (Bodennebel), kein Wetter-Wort von heute.

## Die Bilder (EIN Lauf, dieselbe Kamera, 948 px aus der Leinwand)

- `nebel-0-freigabe.jpg` (11,8 s, Radius 11 m): blauer Himmel über einer grauen Wand — der Boden ist kaum zu sehen.
- `nebel-1-plus3s.jpg` (Radius ~28 m): der Boden liegt frei bis in den Dunst, noch kein Baum.
- `nebel-2-plus8s.jpg` (Radius ~33–55 m): Stämme und Kronen treten rechts aus dem Dunst.
- `nebel-3-gehoben-plus2s.jpg` (2,5 s nach dem Weltbild): der Wald steht — und die Kronen tragen graue Flecken.

## OFFEN, ehrlich

- Die ersten 3–5 s sind eine graue Wand (Radius 11 m, solange die Pflanzung offen ist): der Spieler steht, sieht aber nur
  Himmel und Grau. Ob das besser ist als ein Ladeschirm, urteilt das Auge.
- „Kann gehen“ ist NICHT geprüft: im Lade-Takt gehört keine Taste der Welt (`_ladeschirmSteht`); der Spike hat den Schirm
  nur durchsichtig gemacht. Der Bild-Abstand zeigt 5 % der Bilder über 180–240 ms — Gehen im Dunst würde ruckeln.
- Beim Heben tragen die Kronen graue Flecken (Bild 3): meine Lesart, nicht geprüft — das Gedächtnis der zeitlichen
  Auflösung hält den Nebel der letzten Bilder.
- Gezählt sind Bäume und Bauten (Einträge). Karten jenseits der Mesh-Zone, Fern-Ring und Boden-Kacheln zählt der Zähler
  nicht; sie stehen vor dem Heben, weil der Radius bis zum Weltbild unter 60 m bleibt.
- Ist alles gebaut, steht der Radius erst bei 31–55 m; das Heben auf klare Luft dauert bei der gewählten Rate 5 s.
- Nur die GTX 1050, nur der Genesis-Ort (Wald), Ego-Blick der Sonde.

Roh: `.git/gtx1050-werkzeug/gc/stoff-b1115d` (β allein, Lade- und Spiel-Takt), `gc/stoff-b1115n` (Bodennebel), Leser `tmp/dunst-lesen.cjs`.
