# Bericht 1110-2 — K09c: die Nah-Fern-Stufe und die Ufer-Klumpen

1. **Geschnitten:**
   - **Teil B, Ufer-Klumpen:** Der Fern-Ring trägt kein zweites Wasser mehr unter dem Fern-Wasser. Sein Spiegel liegt dort unter dessen tiefstem Tal (`_fernRingWasserTiefe`). Der Hub des Wassers liest die Wind-Zeile des Gesetzes. Zweig `welle-m-ufer` b4f84671.
   - **Teil A, Stufe:** `_fernRingWeicht` liegt nach deiner Ordnung nur als WIP für die Wahl des Integrators bereit. Zweig `welle-m-nah-fern` 8e270262.
2. **Gemessen** (Prüfbühne, echte GPU):
   - Teil A: 1 m vor dem Chunk-Quadrat lag der Fern-Ring vorher im Median 23 m (bis 54 m) unter dem Gesetz, nachher −0,01 m.
   - Teil B: Von 7261 nassen Ring-Punkten liegt keiner über dem tiefsten Tal des Fern-Wassers.
   - Beide Linsen sind gate:fern-ring-Bänder, auf main ROT beim Namen, je 20 s.
3. **Ehrlich offen:**
   - Teil C (Fern-Deckung aus der Kronen-Karte) folgt nach dem K16-Merge.
   - Am Rand des Fern-Wassers (720 m) stößt sein Wasser-Stoff sichtbar an das matte Fern-Blau des Rings.
   - Die Farbkante am Quadrat-Rand ist Farbe, keine Höhe (K17 und Teil C).

Auftrag: `auftrag/1110-2-omen-nah-fern-stufe.md` (koordination 26e48b93). Ordnung des Koordinators vom 11.10.: A nicht als zweite Wurzel neben K16, B jetzt ab d66851a4, C nach K16. Rohdaten: `bericht/1110-2/`.

## Teil B — das EINE Wasser (`welle-m-ufer` b4f84671, ab d66851a4 ohne Teil A)

**Wurzel:**
- Der Ring klemmte jeden nassen Punkt flach auf Spiegel − 0,4 m (`FERN_RING.wasserDrop`), im dunklen Fern-Blau.
- Das Fern-Wasser (`_ensureFarWaterSheet`, bis 720 m) liegt bei Spiegel − 0,35 m und wogt um den Hub.
- In jedem Tal tiefer als 0,05 m stach die Ring-Fläche durch: zwei Wasser-Flächen an einem Ort.
- Dazu rechnete `_wasserHubM` den Hub ohne die Wind-Zeile des Gesetzes (`WASSER_GESETZ.wind` [0,7, 0,9]): 2,76 m statt 4,42 m im Sturm.

**Schnitt:**
- `_wasserHubM` × (w0 + w1): 4,416 m.
- `_fernRingWasserTiefe`:
  - Lebt das Fern-Wasser, liegt das Ring-Wasser bei Spiegel − 0,35 − Hub − 0,1 m, jenseits davon ist es der Ozean.
  - Ohne Fern-Wasser (Holz nah, kienspan) ist es die Fläche, Spiegel − 0,4 m.
- `_fernRingWasserNeu`: Kommt oder geht das Fern-Wasser, setzt der Ring-Takt die nassen Punkte durch die EINE Setz-Naht neu.

**Linse** (`gate:fern-ring` Band 2c „Das EINE Wasser“, Selbsttest im Band, 20 s):

| | Kopf b4f84671 (`b/ufer-gate-1.txt`) | main 2c8deda9 (`b/ufer-gate-main.txt`) |
|---|---|---|
| Klumpen-Punkte (nasser Ring-Punkt über dem tiefsten Tal) | 0 von 257 | ROT: 236 von 257, Täter „der Ring trägt ein zweites Wasser“ |
| Hub liest den Wind (doppelter Wind, doppelter Hub) | 4,416 → 8,832 m | ROT: 2,76 → 2,76 m |

**Am echten Renderer** (Prüfbühne, Pose ost, `b/ufer-zaehl-nach.json`):
- Fern-Wasser 8556 Quads bis 720 m.
- 0 von 7261 nassen Ring-Punkten über dem Tal −7,77 m.

| Bild | vorher (d66851a4) | nachher (b4f84671) |
|---|---|---|
| Meer von oben (250 m), `bilder/` | `vor-oben.png`: helles Fern-Blau über dem Wasser, dunkle Klumpen | `ufer-oben.png`: das Fern-Wasser mit seinen Wellen, keine Klumpen |
| Meer von der Insel (20 m), `bilder/` | `vor-meer.png`: hellblaue Vielecke im Wasser | `ufer-meer.png`: das Wasser durchgehend |
| steil über der Kante, `bilder/` | `kante-oben-nah-fern.png` (ohne B) | `kante-oben-ufer.png` (mit B) |

## Teil A — die Nah-Fern-Stufe (`welle-m-nah-fern` 8e270262, WIP für den Integrator)

**Wurzel:**
- `_fernRingY` versenkte jeden Punkt der Deck-Zone, über dem ein gebauter Chunk steht, um 60 m.
- Die Reihen der Schale 0 liegen am Rand des Quadrats (194 m) bei 151 / 199 / 263 m. Ihre Dreiecke sind also 50–60 m lang und fielen über die Chunk-Kante hinab.

**Schnitt** `_fernRingWeicht`: Ein Punkt taucht nur, wenn er und seine 8 Gitter-Nachbarn gedeckt sind. Unter dem Gebauten weicht der Ring weiter, gegen Durchstich unter Edits.

**Gemessen** an der Prüfbühne, Strahlen auf den Ring vor jeder Kante des gedeckten Quadrats, gegen das volle Gesetz (`a/rinne-vorher.json`, `a/rinne-nach.json`):

| Abstand vor der Kante | vorher Median / Minimum | nachher Median / Minimum |
|---|---|---|
| 1 m | −23,0 / −53,9 m | −0,01 / −3,6 m |
| 10 m | −11,8 / −47,1 m | −0,01 / −4,8 m |

- 521 von 720 Treffern lagen vorher auf weichenden Dreiecken, nachher 0.
- Der Rest bis −5,7 m sitzt am Steilufer (r ≈ 420 m), wo das 24-m-Raster die Küste linear überbrückt.
- Die Spitzen von +13 m sind Wasser.

**Linse** `gate:fern-ring` Band 2b „Ring-Grenze“:
- Die Deckung ist das Quadrat des Ziel-Rings um den Anker.
- Gemessen wird der Sprung gegen die Mischung der Ecken-Gesetze, also nur Ecken-Regeln, nie die Abtastung.
- Kopf: 240 Proben, max 0 m (`a/gate-fern-ring-2.txt`).
- main: ROT, „TÄTER: der Ring weicht dem Gebauten (−60) über die Kante, 162 Treffer, max 45,5 m“ (`a/gate-fern-ring-main.txt`).
- Selbsttest: die alte Regel.
- Am Merge mit K16 (dort weicht der Ring nur 2 m, `_fernRingUnterGebaut`) wählt der Integrator EINE Wurzel an dieser Linse.

**Bild** (`bilder/kante-oben-*.png`, steil über der Kante bei z −173): Ohne A fallen hinter der Kante Facetten ab, mit A läuft das Gelände glatt weiter. Aus 25 m Höhe in Blickrichtung verdeckt die nahe Kante die Rinne (`vor-kante.png` = `nach-kante.png`).

## Berührte Methoden (Konflikt-Zone K16)

| Zweig | Methode | Art |
|---|---|---|
| `welle-m-ufer` | `_fernRingY` | eine Zeile (die Wasser-Klemme liest `_fernRingWasserTiefe`) |
| `welle-m-ufer` | `_fernRingWasserTiefe`, `_fernRingWasserNeu` | neu |
| `welle-m-ufer` | `_tickFernRing` | ein Aufruf |
| `welle-m-ufer` | `AnazhRealm._wasserHubM` | geändert, mit Kommentar an `WASSER_WELLE` |
| `welle-m-ufer` | `scripts/diag-fern-ring.cjs` | Orakel-Zeile 181, Band 2c |
| `welle-m-nah-fern` | `_fernRingY` | eine Zeile |
| `welle-m-nah-fern` | `_fernRingWeicht` | neu |
| `welle-m-nah-fern` | `scripts/diag-fern-ring.cjs` | Orakel-Zeile 186, Band 2b |

Nicht berührt: `_fernFarbe*`, `_bodenFarbeAt`, die patch-Oktave.

## Prüfungen (`welle-m-ufer` b4f84671, `ende/status.txt`)

| Prüfung | Ergebnis |
|---|---|
| prettier, lint, check | je EXIT=0 |
| gate:fern-ring, gate:fern-wasser | je EXIT=0 |
| gate:sicht-arbeit, wasser-leben, wasser-wahrheit, werk-im-wasser | je EXIT=0 (der Hub trägt auch die Hülle des Wasser-Satzes) |
| playtest:fast | EXIT=0 |
| playtest voll | „Alle Invarianten OK“, EXIT=0 |

CI auf b4f84671 mit `[ci voll]` war beim Bericht noch nicht gelesen.

## Offen (mit Zahl)

1. **Teil C** (Fern-Deckung aus der Kronen-Karte): nach dem K16-Merge, auf seinem Stand (deine Ordnung).
2. **Der Rand des Fern-Wassers bei 720 m:**
   - Dahinter trägt der Ring den Ozean, jetzt 4,9 m unter dem Spiegel statt 0,4 m, im matten Fern-Blau. Vom Plateau (10 m) aus wirkt das gegen das Fern-Wasser etwa 0,36° tiefer, rund 5 Bildpunkte bei 1080p.
   - Der Bogen ist von oben sichtbar (`bilder/ufer-oben.png`): Wasser-Stoff gegen Fern-Blau. Das ist eine Farbe des Ozeans jenseits 720 m, keine zweite Fläche mehr.
3. **Die Farbkante am Quadrat-Rand** (`bilder/kante-oben-*.png`): heller Wiesen-Grund nah gegen den dunkleren Ring-Boden. Das ist keine Höhe mehr, sondern der Boden-Anteil (Übergabe K17) und die Fern-Deckung (Teil C).
4. **Teil A:** Die Wahl der Wurzel liegt beim Integrator am K16-Merge, an Band 2b.

## Status: ZWISCHENSTAND · Übergabe

- **Pflicht-OFFEN Rest:** A · B · C · E stehen unverändert.
- **Zweige:** `welle-m-ufer` b4f84671 ist bereit (CI läuft), `welle-m-nah-fern` 8e270262 als WIP. Beide per `git ls-remote`.
- **Werkzeug:** `p3/nf/start.sh` (Bühne, Pose ost).
- **Als Nächstes:** 1110-5 (Hang-Akne), danach Teil C nach dem K16-Merge.
