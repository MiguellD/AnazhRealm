# front-brand — Befund am Kopf der Vorprüfung (GTX 1050, 21.11.2026)

Zwischenstand. Basis `origin/main` 1e204f835 (V18.546.362), Zweig `front-brand`. Gemessen je Sprosse durch EINEN Lauf ihrer
Station an diesem Gerät (`punkte.cjs --nur <station>`, Stationen von `punkte-maschine` d42a29b14).

## Geschnitten (ein Gesetz, `stamm/feld-brand.js`)

| Schnitt | Wurzel | Glied |
| --- | --- | --- |
| A — die Zunge ist ein dünner Strahler | die Flamme stand als deckende Tafel im Rauch, ihr Licht kam nicht ins Bild | `_flammeTafel`, `_flammeOptik` |
| B — die Masse bleibt | die Zelle trug kein Holz, die Tat keine Asche, der Ballen keinen Rauch | Zelle `w · iw · kg`, Buch `_brandMasse`, Tat `brand.kg`, Ballen `m · tr2` |
| B2 — die Fahne hängt nie am Bild | der Rauch-Strom wurde in den Winkeln des Bilds gezählt und im Takt des Bilds weitergegeben | `_brandStrom` (96 feste Strahlen, je Welt-Sekunde), `holz` an der Welt-Uhr, Schuld `rauchKg`, Geburts-Schwelle `aGeburt` |

## Zahl vorher ↔ nachher je Sprosse

| Sprosse | Station, wie sie auf `punkte-maschine` steht (main) | main mit Herd-Patch | front-brand mit Herd-Patch |
| --- | --- | --- | --- |
| kopplung.kaskade#1 (Flammen-Pixel, Soll ≥ 200) | ROT +20 (4 Flammen) | ROT +9 (32 Flammen) | **GRÜN +328** (Spanne 328–328, bei laufender Schleife 218; Regen löscht nach 7 s) |
| kopplung.stoerung#1 (Luma ÷, Soll ≤ 0,5) | ROT ÷ 0,732, Asche 0 | GRÜN ÷ 0,370 | GRÜN ÷ 0,331 (0,181 → 0,06) |
| mensch.zeit.erleben#1 (dunkler, Soll ≥ 50 %) | ROT 32 %, Asche 0 | GRÜN 85 % | GRÜN 89 % |
| physik.reaktion#1 (masse_abw_pct, Soll ≤ 10) | kein Leser (Stummel) | kein Leser | **0,767 %** mit dem Leser-Patch: Holz 21,978 kg → Asche 1,22 kg + Rauch 20,927 kg, umgesetzt 22,147 kg (Zwischenstand Schnitt B allein: 8,589 %) |
| gedaechtnis.schicht#1 (Brandschicht, ≥ 3 Lagen in der Grubenwand) | — | — | NICHT gebaut, siehe offen |

Ehrlich gelesen: **stoerung#1 und erleben#1 werden durch den Herd-Patch der Station grün, nicht durch das Gesetz** — die Station
wählte ihren Herd mit einer eigenen Anteil-Rechnung (`g1.js:1425`) und zündete bei −248/−1080 eine Zelle mit Kies in der Mitte
(Anteil 0,2). Das Gesetz trägt kaskade#1 (+9 → +328) und reaktion#1 (Stummel → 0,767 %).

## Linsen (in bestehenden Familien, vorher ROT am Täter, Selbsttest grün)

- `diag-post-kette.cjs` (l) ZUNGE — die Zunge deckt nie, sie strahlt (Schnitt A).
- `diag-stand-takt.cjs --narbe` N8 — Holz, Bilanz, Asche, Rauch, Deckung, Erhalt, Proportional, Mutante (Schnitt B).
- `--narbe` N8-BILD — die Masse der Fahne hängt nie am Bild. ROT am Stand 44d954be2: Auge 100 m ab 0,884 von 1,135 kg, Bild in
  250 ms 0,435 von 1,134 kg. Am Kopf: voll 1,152 ↔ 1,146 · halb 0,196 ↔ 0,195 · fern 1,151 ↔ 1,148 · lahm 1,194 ↔ 1,162 ·
  jung 0,302 ↔ 0,298 kg; Mutante Erhalt × 1,548.

## Bild (selbst angesehen)

`paar-vor-nach.jpg` — die Mess-Wiese am Tag, Herd −248/−1064, links main, rechts front-brand (Ausschnitt × 2): vorher verdeckt
ein grauer Rauch-Klumpen die Flammen und die Asche, nachher steht ein heller Flammen-Ring um die dunkle Asche, der Rauch zieht
dünner dahinter ab.

Was ein Art Director noch Amateur nennt: die Zungen stehen als gleichmäßiger Kranz gleicher Zähne um eine hart gerandete
Asche-Ellipse, der Rauch als wenige weiche Ballen.

## Offen (mit Grund und Messname)

- **gedaechtnis.schicht#1** — nicht gebaut. Die ehrliche Brandschicht eines Gras-Brands ist 0,015 mm Asche (mit Kohle ≈ 0,15 mm):
  kein Pixel in der Grubenwand; das Soll verlangt ≥ 3 Lagen. Bäume, die der Brand nimmt, tragen kein Holz ins Buch —
  `vegetation-baum.js` steht auf der Sperr-Liste dieser Welle. Der Grabe-Schritt der Station hängt am Mess-Halt.
- **Nacht-Belichtung um den Brand clippt** — `bild-himmel` / `dirigent-kern`, außerhalb der Grenze des Auftrags.
- **`diag-stand-takt.cjs --brand` (Hand-Modus)** bricht beim Boot ab, wie auf main — sein Richter DECKUNG ist ungemessen.
- **Stationen**: kaskade, stoerung, erleben sind nur mit `g1-herd.patch` grün, reaktion#1 nur mit `k2-same-reaktion.patch`;
  beide liegen hier, `punkte-maschine` schreibe ich nicht.

## Die zwei Stations-Patches

Gegen `punkte-maschine` d42a29b14 (`g1.js` Blob 23429cd9, `k2-same.js` Blob 2760fef2), anlegen mit `git apply`:

- `g1-herd.patch` (11 Zeilen) — der Herd liest den Anteil des Gesetzes (`_brandStoff(...).anteil`), nie eine eigene Rechnung.
- `k2-same-reaktion.patch` (135 Zeilen) — der Leser `masseProbe`: die Station misst das Holz des Betts selbst (Last × lebendig ×
  Anteil × Zell-Fläche), liest die Asche aus der Tat `brand` des allein ausgebrannten Herds und die Rauch-Masse aus den Ballen
  der Fahne gegen das Holz, das die Front im Fenster verzehrte (Ankunft ihrer Ellipse auf einem Gitter). Kein Wert kommt aus
  dem Buch des Gesetzes. `L.gemessen(1, { masse_abw_pct }, { erzeugt: 1, welt: { umgesetzt_kg }, taeter })`; der Lauf-Text
  wächst von 2 457 auf 11 527 Zeichen (unter `tragenLauf` 18 559).

Karte 2 gebucht 41 von 1 718.
