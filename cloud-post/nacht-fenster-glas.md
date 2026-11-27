# nacht-fenster-glas: jede Quelle der Nacht geht durch den EINEN Lichtweg (GTX 1050, 27.11.)

## 27.11. 05:41 — GPU-PROBE 69e777d7 auf gtx1050-desktop: GRÜN in 1126 s (gate:studio-begehen GRÜN 559 s auf gtx1050-desktop · bild:dorf@0 GRÜN 270 s auf gtx1050-desktop · gate:webgl-probe GRÜN 162 s auf gtx1050-desktop) → probe-post/nacht-fenster-glas/69e777d7.md

ZWISCHENSTAND. Vorprüf-Kopf `69e777d7` auf `origin/nacht-fenster-glas`, EIN Commit auf main 920fa974 (V18.546.448).
- Tag `[gpu-probe: gate:studio-begehen, bild:dorf@0] [ci voll]`. Der Beitrag fasst `fachwerk-core.js` an, die Regel „Haus“ verlangt `gate:studio-begehen`.
- `bild:dorf@0` ist das Nachtbild am Dorf um Mitternacht.
- `gate:nacht-licht:echt` trägt das Tag nicht: es fährt stadt-voll, und die Stadt steht an der 1050 seit f7e5f23b nicht.
- Sprosse: `karte2.erleben.bild.nacht#2`. Das Urteil an stadt-voll fährt die Radeon als Vor-Richter.

## Der Schnitt

Das wache Glas jedes Hauses ist eine Quelle `LICHT_GESETZ.fenster` im EINEN Lichtweg.

- **Fachwerk, die EINE Formel.** `fensterZeile(raum, masse)` gibt je wachem Glas `[cx, cy, cz, w, h, nx, nz]` haus-lokal.
  - Wach heißt: der Würfel `fensterSchlaeft` wählte beim Bau `glas`, nicht `glasdunkel`. Die Öffnung trägt ihn jetzt mit (`schlaf`).
  - Die Normale zeigt von der Mitte des EINEN Körpers fort, an dessen Kante das Fenster sitzt.
  - Ein Fenster zwischen zwei Körpern steht in einer Innenwand und gibt keine Zeile.
  - Alle drei Stufen-Pfade schreiben `__huelle.fenster`: Stufe 0, der Plan ohne Dachwerk (Stufe 3) und der Massenbau.
  - Additiv, must-ignore. Die Gaube ist EINE Quelle (`GAUBEN_FENSTER`): das Dachwerk baut sie, der Plan ohne Dachwerk nennt sie.
- **Der Wirt.** `_hausHuelleSetzen` trägt das Haus mit Fenstern ins Verzeichnis „licht“ (`_blockerNameSetzen`). `_leuchtQuellen` gibt je Zeile EINE Quelle „fenster“, 0,05 m vor dem Glas, mit Normale.
- **Der Lichtweg.** Glas nimmt nie einen Platz des Pools (`_leuchtWahl`). Sein Licht geht nur in die Licht-Karte: `_lichtKarteFleck` × cos θ zur Normale, hinter der Wand keine Zelle.
  - Die Stärke ist die Lambert-Scheibe π·L·k²/(1 + k²) mit k = √(A/π), nicht L·A.
- **Kosten an der Änderung (Gebot 7).** Das Soll der Karte rechnet nur neu, wenn die Wahl oder die Stunde des Schaltplans wechselt (`_zeitplanFest`). Je Bild rechnet es nur die Plätze.
- **Band.** Novák, CIE x051 2025: ein erleuchtetes Wohnfenster im Mittel 6 cd/m² bei 1,44 m². Das Gesetz trägt 8 cd/m².

## Gemessen

**Konsum, Node (Dorf Saat 5, Mitternacht).** Die Linse ist gate:settlement Teil F (`--nur-f`), am Kopf 69e777d7 EXIT 0 (28,5 s). check:statik am Kopf ganz EXIT 0.
- 468 wache Fenster in 24 Häusern tragen 468 Quellen „fenster“, je Zeile genau eine.
- 24 Häuser stehen im Verzeichnis „licht“. 0 Glas auf einem Platz, je Fleck 301 Zellen, 0 Zellen hinter der Wand.
- Selbsttest: die drei Mutanten fallen beim Namen.
  - „ohne Glas-Zweig“ → `_leuchtQuellen`.
  - „Glas auf dem Platz“ → `_leuchtWahl`.
  - „ohne Lambert“ → 26 540 Zellen hinter der Wand → `_lichtKarteFleck`.

**Stufen.** Die Zeilen sind in Stufe 0, 1 und 2 Zeile für Zeile gleich.
- 111 Dorf-Häuser (Saaten 1–5, mit ihrem ov).
- 55 Kulturen × 5 Saaten zählen in Stufe 0–3 gleich viele Zeilen.

**Byte.** Häuser byte-gleich: 260 Fälle, Hash über alle Fingerabdrücke Basis = Kopf (`45f41d706b005369`). gate:fachwerk-contract EXIT 0 (Golden v6).

**GTX 1050, dorf:third, nachtSicht** (`werkbank licht --nacht dorf:third --eigen`). Vorher am main 2a2e8a54, nachher am Kopf auf 031f4700 (derselbe Schnitt, vor dem Zug auf 920fa974). Von 2a2e8a54 bis 920fa974 landeten Sprache, Klang, bahn-klima, die Höhenstufen des Walds und ci-puls-frist; den Lichtweg fasst keiner davon an. Je zwei Läufe:

| Wert | vorher | nachher |
|---|---|---|
| Bodenfleck | 5/5 = 1 | 5/5 = 1 |
| ohne Karte | 3/5 = 0,6 | 3/5 = 0,6 |
| Kelvin | ±33 K | ±38 K |
| ein Fleck | 3,2 · 1,85 ms | 1,69 · 1,86 ms |
| Bau der Mitte | 6,81 · 7,17 ms | 8,17 · 8,15 ms |
| Takt höchstens | 13,04 · 7,89 ms | 19,04 · 10,92 ms |

- Die Linse endet vorher wie nachher mit EXIT 1: „Wurf am freien Boden ungemessen (0 gesehene Punkte um laterne_dorf)“.

**K5 Pfosten-Kontrast, GTX 1050, dorf ego.**
- punkte.cjs sperrt `schatten.K5` auf der GTX („kein Adapter der Klasse radeon“). Gelaufen ist dieselbe Seite (`neunSeite`, g3.js) gegen eine eigene Werkbank-Welt.
- Pose: laterne_dorf 2,5 m vom Spieler, im Pool, Pfosten im Blick, Boden gesehen 1, 12 Punkte.
- Vorher: Kontrolle ohne Pfosten 1,226. Nachher: 1,221.
- Lschatten ist genau 0, der Schatten ist schwarz (u8 = 0). Das Licht daneben liegt bei 2,2·10⁻⁶; die Belichtung der Nacht teilt, darum rundet r4 es auf 0.
- Der Kontrast ist ∞ und erfüllt das Soll ≥ 3:1. Die Station liest ihn als `null` (`s1.L > 0 ? … : null`), also ROT. Das ist ein Fehler des Maßes, nicht des Bilds.

## Bildpaar

Alle Bilder habe ich angesehen.

**`nacht-fenster-glas/dorf-nacht-bildpaar.png`** zeigt dorf:third um Mitternacht in drei Feldern: links main, Mitte Kopf, rechts der Unterschied.
- Im Unterschied heißt rot heller, blau dunkler, ×8.
- Heller werden das Gras links vom großen Haus und die Giebel der Häuser dahinter: dort fällt jetzt Fensterlicht.
- Die übrige Szene ist dunkler, die mittlere Luma fällt von 37,9 auf 35,6. Die Belichtung folgt dem Mehr an Licht.

**`nacht-fenster-glas/dorf-nacht-ausschnitt.png`** vergrößert das große Haus und seine Nachbarn ×2, links vorher, rechts nachher.

**`nacht-fenster-glas/k5-pfosten.png`** zeigt die K5-Pose von oben: links mit Marken, rechts der Mess-Schuss. Der Pfosten wirft einen harten, schwarzen Schatten.

**Satz des Laien:** Nachts fällt jetzt aus den erleuchteten Fenstern Licht auf das Gras und die Nachbarhäuser — vorher leuchteten die Scheiben, warfen aber nichts.

## Offen beim Namen

- **Der Preis.** Der Bau der Mitte steigt um gut 1 ms, und der teuerste Takt der Karte steigt in beiden Paaren, um 3 bzw. 6 ms (Frist `bauMs` 2 ms, schon am main überschritten). Der Richter ist der Preis p95 am Vor-Richter (Messname nacht#1, nacht#2).
- **Der Halbschatten am Pfostenfuß und der Mitternachts-Kontrast 2,36 : 1 (nacht#1).** Beide sind nicht in diesem Schnitt.
  - An der GTX ist der Schatten des Pfostens hart und schwarz: kein Halbschatten, Kontrast ∞.
  - Die 2,36 : 1 der Radeon an stadt-voll kann ich an der 1050 nicht nachstellen.
- **Die Linse K5** liest einen schwarzen Schatten als `null` statt ∞ (punkte-maschine g3.js, Teil schatten.K5).
- **Der Wurf am freien Boden** ist an dorf:third vorher wie nachher ungemessen (0 gesehene Punkte um laterne_dorf).
- **Nicht nachgestellt:** der Fund des Arbeiters „marokkanisch Saat 3: Stufe L1/L2 null statt 22 Zeilen“. 111 Dorf-Häuser und 55 Kulturen × 5 Saaten tragen in allen Stufen dasselbe Glas.
- **Karte 2 gebucht:** unverändert, bis der Vor-Richter den Kopf misst.
