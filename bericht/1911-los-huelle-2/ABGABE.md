# Abgabe Welle `los-huelle-2` — die Brandwand liest die Körper-Hülle (OMEN GTX 1060, 19.11.)

**Kopf:** `los-huelle-2` **8e6127764** (Baum = bf3e7fd2d: Schnitt 1f125464d + Merge main 7d9c4d51 + Merge main 92b7afd0, beide ohne Konflikt).
Zweig vom gestempelten 922283fb. Ich stempele nicht.

## Die Zahl
**Öffnung im Nachbarn (Öffnungsteil einer Seite ohne Brandwand > 1 cm im Körper des Nachbarn): 26 Paare an 25 Häusern → 0**
(Stadt 7/4750, 3 × 3 Kacheln auf dem Gelände, 1 488 Slots; Roh p3/n1911/los-huelle-2/zaehlung-26.log).
Die drei Stufen des Schnitts: Hülle allein 7 Paare · + zweiter Ruf nach `loseEntzerren` 5 · + Reichweite der Öffnungsteile **0**.
Daneben: Brandwand-Seiten 268 → 502 · Körper im Körper > 1 cm 17 → 1 (tiefste 0,016 m).

## Der Schnitt (eigener Diff 7 Dateien, +118 / −39)
- `brandwand` (fachwerk-core.js ~:9859) misst „anliegend“ an der Körper-Hülle statt an dims.W/D: der Nachbar wird auf die Achsen projiziert,
  Toleranz je Seite = max(Norm, Reichweite der Öffnungsteile dieser Seite); zweiter Ruf nach `loseEntzerren` (~:10189).
- `bx.reich` (koerperHuelle ~:5946): derselbe Gang, der die Hülle ohne die Öffnungs-Teilbäume (`oeffnung`/`window`/`door`) misst, legt diese
  Teilbäume in ihre eigene Box und trägt je Seite, wie weit sie über den Körper reichen. **Keine Konstante, kein zweiter Schreiber:** die Zahl
  kommt aus der gebauten Geometrie der Flügel (Flügel-Breite × Lage aus dem Öffnungs-Bau, Fenster-Flügel `rotation.y = ±0,62` :1101/:1106,
  Tür-Blatt `openA` :995) und wird nur gelesen. Am Wohnturm 0,259 m je Giebel über der Hülle (der offene Flügel 0,51 m vor der Wand).
  Befund am Rand (NICHT in dieser Welle): der Öffnungswinkel 0,62 steht zweimal — als Literal in `fensterAt` (:1101/:1106) und als
  `FLUEGEL_LAGE` cos/sin (:2811). `bx.reich` folgt jedem der beiden, weil es die Geometrie misst.
- Labor worlds/fachwerk/fachwerk.js reicht `reich` mit (Labor = Welt).
- Linse `brandwandProben` (B1) in scripts/lib/los-proben.cjs, gate:settlement Teil A + Selbsttest. Mutanten ROT: „an dims“ 11 Paare ·
  „ohne Reichweite“ 1 · „nur vor dem Los-Gesetz“ 4.

## Goldens neu geprägt (beim Namen)
- spec/asset-contract/v6/golden/siedlung.json — 2 sha (7/12 und 12345/6): die neuen Brandwand-Seiten schließen Fenster.
- spec/asset-contract/v6/golden/siedlung-lose.json — 8 Lose rücken 0,02–0,19 m (7/60 und 2/120): der zweite Ruf nach `loseEntzerren`.

## Der Zähl-Widerspruch (Plan main 4 ↔ Kopf 14 gegen Welt 0 ↔ 0), aufgelöst an EINER Definition
Falsch war meine Welt-Zahl: gasse-welt.cjs schrumpfte je Seite 0,01 m und zählte damit erst ab 2 cm Durchdringung. Mit 0,005 m je Seite
(= Paar ab 1 cm, die Definition des Lesers) zählt die Welt 4 ↔ 14 wie der Plan. Roh p3/n1911/los-huelle-2/zaehlung-koerper.log.

## Bildpaar am Gelenk Same 712412 Wohnturm ↔ 400335 Patrizierhaus (Stadt-Mitte d:7@836,438), gleiche Posen (VORHER_GELENK)
koordination bericht/1911-los-huelle-2/: j1-gelenk-front, j2-gelenk-oben, j3-gelenk-spalt, j4/j5 gelenk-innen-eg/og, j6/j7 im-a-eg/og,
je `-alt` (922283fb) ↔ `-neu` (1f125464). Treiber p3/n1811/bau-bild/vorher.cjs.
- Vorher: offene Fensterflügel beider Giebel stehen übereinander in der 0,70-m-Fuge (j3), innen zwei Fenster in die Fuge (j4).
- Nachher: die Fuge ist frei, beide Giebel sind Brandwände, innen eine geschlossene Giebelwand.
- **Was ein Art Director noch als laienhaft sieht:** die 0,70-m-Fuge zwischen zwei Häusern ohne Fenster bleibt ein Schlitz, den niemand
  begehen kann — eine Stadt baut dort Wand an Wand oder lässt eine Traufgasse ≥ 1 m.

## Tore am Kopf bf3e7fd2 (Roh p3/n1911/los-huelle-2/tore-bf3e7fd2/)
| Tor | Urteil |
|---|---|
| diag-settlement --selftest | GRÜN, 108 s |
| diag-settlement --nur-a | GRÜN, 210 s |
| gate:fachwerk-contract | GRÜN, 86 s |
| gate:studio-vertrag | GRÜN |
| gate:betriebsgesetz | GRÜN |
| gate:haus-fern | GRÜN, 254 s |
| format:check | GRÜN |
| check:statik | GRÜN, 407 s |
| gate:settlement ganz (mit Teil O), GPU | GRÜN 115 ✅ · 0 ❌ (B1 „0 Paare“), 431 s |
| gate:haus-welt 1/2, GPU | GRÜN, 20 Welten, 943 s |
| gate:haus-welt 2/2, GPU | GRÜN im zweiten Lauf, 19 Welten, 564 s. Erster Lauf 23:13 ABSTURZ: alle 4 Seiten standen beim Start 219 s NATIV (Renderer 257 % CPU, kein JS-Stapel, „keine Probe stempelte“), waitForFunction `_gameLoopTick` riss nach 180 s — Start-Last der Apparatur, kein Befund der Welle (Teil 1/2 mit 20 Welten davor grün) |
| bewohner-Probe (diag-kreatur-takt --proben bewohner), GPU | GRÜN, alsLeib 4 (Soll ≤ 4), 77/77 Leiber, 18 Häuser, 256 s; die Stall-Akte sah einmal _tickBewohner (siedlung-bewohner.js:1554) als JS-Schleife, der Lauf kehrte zurück |

## Ehrlich offen
1. `npm run check` ganz habe ich am Kopf NICHT gefahren — die Batterie fährt CI mit `[ci voll]`.
2. Körper im Körper > 1 cm: 1 Paar bleibt (0,016 m) — nicht Gegenstand dieser Welle, beim Namen in zaehlung-26.log.
3. Die 0,70-m-Fuge (siehe Bildpaar) ist ein Gesetz des Loses, keine Folge dieses Schnitts.
4. Der zweifache Öffnungswinkel 0,62 (Literal + FLUEGEL_LAGE) ist ein Zwilling für die Ein-Schreiber-Wand.
