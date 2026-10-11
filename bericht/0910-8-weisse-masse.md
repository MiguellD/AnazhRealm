# Bericht 0910-8 — die weiße Masse (O4): EINE Boden-Farbe je Ort

1. **Geschnitten:** Der Boden-Satz trägt jetzt dort, wo kein echter Wald zeichnet, dieselbe Krone × Deckung wie der Fern-Ring.
   - Wo: jenseits des Laub-Radius vom Spieler oder 354–384 m vom Auge.
   - Woher: eine Karte 64² über dem Chunk-Quadrat (`_fernKroneNahMisch`), gefüllt im Fern-Farb-Budget, nah zuerst.
2. **Gemessen:** aus 420 m an der Mess-Wiese, je Ort der Boden-Satz gegen den Fern-Ring.
   - main: der Boden-Satz liegt +77 … +167 % über dem Fern-Ring an derselben Stelle, 8 von 8 Orten ROT, Täter Boden-Satz.
   - Kopf: −13 … +11 %, 8 von 8 GRÜN.
   - Das Bild aus 420 m zeigt kein weißes Quadrat mehr. Die Mischung kostet an der Bühne ≤ 0,07 ms.
3. **Ehrlich offen:**
   - Das Fern-Gesetz kennt in dieser Welt keine Wiese: Deckung ≥ 0,78 auf jedem 150-m-Quadrat über ±3 km. Die „Wiesen-Orte“ der Linse sind darum Lichtungen.
   - Der nahe Boden ohne Krone liegt das 1,03- bis 1,17-Fache über dem Boden des Gesetzes, weil die Geologie-Terme nur nah wirken.

Auftrag: `auftrag/0910-8-omen-weisse-masse.md` (koordination 614ff0e1).

**Zweig:** `welle-m-weisse-masse` **d66851a4** (per `git ls-remote`), auf main 2c8deda9 (V18.541).

| Commit | Inhalt |
|---|---|
| 8dff4e7b | der Schnitt |
| 08f3fd27 | Linse, Budget nah zuerst |
| 4698a1d3 | gate:nah-fern, Urteil gegen das Gesetz |
| d66851a4 | die Karte auf dem Chunk-Quadrat, `[ci voll]` |

Rohdaten: `bericht/0910-8/`.

## Die Wurzel

- **Auf main zeigt der Boden-Satz nackten Boden:**
  - Boden-Satz an den Wald-Orten: Y 0,126–0,129.
  - Fern-Ring an derselben Stelle: Kronendach × Deckung, Y 0,048–0,064.
  - Roh: `linse-echt/main-linse.json`.
- **Warum:**
  - Der gezeichnete Wald endet am Laub-Radius des Reglers (`foliageRadius`, in dieser Sitzung 127,5 m: `linse-echt/kopf-karte.json` `waldR`), die Bäume enden 384 m vom Auge.
  - Dazwischen, und aus 420 m überall, trägt niemand den Wald: Der Boden-Satz deckt genau den Ring zu, der ihn trüge.
  - Das ist das „Wald-Gewicht“ des Auftrags: eine Stelle, zwei Farben.

## Geschnitten (anazhRealm.js)

1. **`_fernKroneNahMisch`** im Boden-Stoff (`_buildPbrNodeMaterial`, Wege-Karten-Pfad nach `_geo`).
   - Formel: `mix(geo, krone × uSeasonMul, deckung × ohneWald × bereit × innen)`. Das ist die Formel des Ring-Stoffs.
   - `ohneWald = max(smoothstep(waldR, waldR + 30, |xz − Spieler|), smoothstep(354, 384, |Welt − Auge|))`.
2. **Die Karte** (`_fernKroneNahEnsure`, `_fernKroneNahTakt`).
   - Format: 64² RGBA8 (16 KB), die Krone sRGB-kodiert, die Deckung linear im Alpha.
   - Lage: Die Mitte ist die Mitte des Chunks unter dem Spieler, die Größe (2 × Ring + 4) Chunks.
   - Quelle: Sie füllt aus `_fernFarbeTeile`, demselben Gesetz wie der Ring, und tauscht erst, wenn sie ganz steht.
3. **Das Fern-Farb-Budget** (`_fernFarbTakt`) geht nah zuerst.
   - Die Karte läuft vor den Ring-Farben, mit mindestens 64 Punkten je Takt.
   - Als letzter Verbraucher verhungerte sie: Nach dem Wechsel an die Wiese stand `bereit` auf 0.
4. **Der Anker der Karte.**
   - Vorher lag ihre Mitte auf einem Raster von einem Viertel ihrer Größe, also bis 59 m neben dem Quadrat, bei nur 43 m Rand.
   - Folge: Aus 420 m blieb ein Streifen von 22 m blass (`bilder/kopf-vor-anker-420.png`, rechter Rand).

## Die Linse, vorher ROT

**`werkbank albedo --nah-fern`** (Familie `werkbank albedo`; `scripts/lib/licht-linsen.cjs` `nahFernSicht` / `nahFernUrteil`):
- **Schüsse:** Je Ort im Chunk-Quadrat zwei Schüsse, orthogonal aus 420 m über 132 m, unter weißem Umgebungslicht π (hell − dunkel, wie `__albedoSicht`). Einer zeigt nur den Boden-Satz, einer nur den Fern-Ring.
- **Richter:** Dazu kommt das Gesetz an der Stelle, das Mittel von `_fernRingTeile` über 32 × 32 Punkte.
- **Urteil:** Jeder Leser muss in seinem Band um das Gesetz liegen.
  - Bänder: nah 10 %, fern 25 %, Grün-Anteil 0,03 / 0,05.
  - Der Täter steht beim Namen in der Meldung.
- **ROT auch:**
  - bei weniger als 3 Orten je Klasse,
  - bei einem leeren Schuss,
  - bei einer Karte, die für den Ort nicht steht (bereit 0 oder Füll-Job offen).
- Selbsttest 8 Fälle, EXIT=0.

**`gate:nah-fern`** (`scripts/diag-nah-fern.cjs`, CI Gruppe 2, Batterie „voll“):
- Fährt die Werkbank im Software-Holz (swiftshader, kienspan) an der Mess-Wiese.
- `spec/ci/ci-zeiten.json` trägt den Schritt mit „geschaetzt“ 90 s.

| Seite | main 2c8deda9 | Kopf d66851a4 | roh |
|---|---|---|---|
| echte GPU (GTX 1060), 8 Orte | ROT 8/8: nah gegen fern +77 … +167 %, Täter Boden-Satz +60 … +144 % gegen das Gesetz | GRÜN 8/8: nah gegen fern −13 … +11 %, nah gegen Gesetz −6 … −3 % | `linse-echt/` |
| Software-Holz (das Gate) | ROT 7/7, Täter Boden-Satz +133 … +143 % | GRÜN in 4 Läufen, je 23–31 s | `software/` |

**Der Fußabdruck von 132 m** (eine Sitzung, Kopf, `nach/fuss-*.json`): Der Fern-Ring schnappt in Schale 0 auf 24 m. Auf kleiner Fläche rauscht er allein durch seine Abtastung.

| Fußabdruck | nah gegen Gesetz | fern gegen Gesetz | nah gegen fern |
|---|---|---|---|
| 44 m | −14 … 0 % | −22 … +20 % | −29 … +27 % |
| 88 m | −6 … −1 % | −15 … +8 % | −10 … +13 % |
| 132 m | −6 … −3 % | −12 … +7 % | −11 … +10 % |

## Abnahme

- **Δ nah ↔ fern** (Kopf, echte GPU, `linse-echt/kopf-linse.json`):
  - 4 Wald-Orte (Deckung 1): −13 … +6 %.
  - 4 Wiesen-Orte (die lichtesten Lichtungen, Deckung in der Mitte 0,36–0,42): 0 … +11 %.
  - Das Rausch-Band ist die Abtastung des Rings gegen das Gesetz in denselben Läufen: −12 … +9 %. Der Boden-Satz liegt −6 … −3 % neben dem Gesetz.
- **Makro-Bild aus 420 m** (Ausgabe-Pfad, `werkbank bild` → `__ausgabeAufnahme`):
  - `bilder/main-420.png`: das blasse Quadrat im Grün des Rings.
  - `bilder/kopf-420.png`: das Quadrat in der Krone des Rings, ohne weißes Quadrat.
  - Die 8-m-Texel der Karte sind als weiche Flecken zu sehen.
  - Der weiße Fluss unten ist das Wasser, in beiden Bildern gleich.
- **Blick aus 60 m** (`bilder/main-60.png`, `bilder/kopf-60.png`):
  - main zeigt hinter den echten Bäumen blass-graue Bodenflecken.
  - Der Kopf trägt dort die Krone.
  - Der Waldboden unter den echten Kronen bleibt gleich, dort zeichnet echter Wald.
- **Band:**
  - Der Schnitt bringt eine Textur von 16 KB und einen Term im Boden-Stoff, keinen Draw und keine Geometrie.
  - Programme nach dem ersten Slot in beiden Toggle-Varianten gleich 21/20/19/21, im ersten 20/19/18/20 (`kosten/fortschritt.log`).
  - Eine Band-Serie an der Wiese habe ich nicht gefahren. Das ABAB des Koordinators misst es.
- **GPU** (Bühne, Pose ost, EINE Sitzung, ABAB dreifach, je drei Bänke 120 × 6, `kosten/fortschritt.log`):
  - k1 (ohne Mischung) gegen das Mittel der k0-Nachbarn: −0,002 · +0,069 · +0,005 ms.
  - Damit kostet die Mischung nichts Messbares.
  - Mitten in der Sitzung gab es einen Pegelsprung von +0,1 ms für beide Varianten (71 → 83 °C).

## Prüfungen (auf d66851a4, `end/status.txt`)

| Prüfung | Ergebnis |
|---|---|
| `npm run check` | EXIT=0 |
| `npm run lint` | EXIT=0 (die 2 Warnungen standen schon vorher) |
| Selbsttest | EXIT=0 |
| `playtest:fast` | 20 ✅ · 0 ❌, EXIT=0 |
| `npm run playtest` | „Alle Invarianten OK“, 120 s, EXIT=0 |
| `gate:nah-fern` | GRÜN in 30 s, EXIT=0 |

CI 38168874025 (`[ci voll]`) war beim Bericht noch in der Warteschlange.

## Offen (mit Zahl)

1. **Die Fern-Deckung ist keine Kronen-Deckung.** Entscheidung des Koordinators (11.10.): fällt in 1110-2 als dieselbe Klasse (nah und fern lesen den Wald-Ort aus EINER Quelle, der Kronen-Karte).
   - `forestGeburt` ist die Geburts-Wahrscheinlichkeit eines Darts (Boden 0,3).
   - In dieser Welt (`nach/deckung.json`): 1515 trockene 150-m-Quadrate über ±3 km, Minimum 0,784, Median 0,903, keines unter 0,5. Das Fern-Gesetz kennt keine Wiese.
   - Darum sind die Wiesen-Orte der Linse Lichtungen (Mitte 0,36–0,42, Fußabdruck im Mittel um 0,9).
   - Echte Wiesen wie die Mess-Wiese tragen die Krone jetzt auch nah jenseits des Laub-Radius. Nah folgt fern, beide gleich falsch, wo das Gesetz falsch ist.
   - Die Wurzel wäre EINE Deckung aus dem Gesetz des Wald-Generators (Bestandsdichte × Kronenfläche) für beide Leser.
2. **Der Boden-Anteil.**
   - Nah: Vertex-Farbe → Streu und Wege → Geologie (Fels, Moos, Wiesen-Grund Y 0,18).
   - Fern: das rohe `_bodenFarbeAt`.
   - Der nahe Boden ohne Krone liegt das 1,03- bis 1,17-Fache über dem Boden des Gesetzes (`nach/boden.json`).
   - Unter einer Deckung ≥ 0,78 sind das höchstens ~4 % der Mischung. Sichtbar würde es erst, wenn das Fern-Gesetz Wiesen kennt.
   - **Übergabe an K17** (Entscheidung des Koordinators, 11.10.): der Fels-Stoff als EIN Gesetz im gelaende-core, nah und fern gelesen. Nicht bei mir; die Zahl oben ist der Ausgangswert.
3. **Der Fern-Ring tastet auf 24 m:** auf 44 m −22 … +20 % gegen sein eigenes Gesetz (`nach/fuss-22.json`). Das ist Abtastung, keine Farbe.
4. **Die Karte füllt je Chunk-Wechsel neu** (4096 Punkte `_fernFarbeTeile` im Fern-Farb-Budget). Nach einem Sprung mischt das Quadrat nichts, bis die Füllung steht. Die Dauer habe ich nicht gemessen.
5. **Die CI-Zeit von `gate:nah-fern`** steht als „geschaetzt“ 90 s, bis der erste CI-Lauf sie misst.

## Status: ZWISCHENSTAND · Übergabe

- **Pflicht-OFFEN Rest:** A · B · C · E stehen unverändert.
- **Worktrees:**
  - `welle-m-weisse-masse` bleibt stehen.
  - `abab-b541` (main 2c8deda9) ist sauber; die Linse lief dort gegen main mit kurz kopierten und danach zurückgesetzten Skripten.
- **Als Nächstes laut Warteschlange:**
  - 1110-2 (`welle-m-nah-fern` ab main 2c8deda9; dieselbe Domäne, `_fernRingY` −60 m unter gedeckten Chunks),
  - danach 1110-5.
