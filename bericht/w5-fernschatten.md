# w5-fernschatten — ZWISCHENSTAND (licht.K4 · ferne.K4, Gruppe g3, Gerät radeon)

**Geschnitten:** EIN Schatten, der nicht aus der Kaskade kommt, sondern aus Funktionen der Gesetze — `_sonnenSicht`
(`stamm/dirigent-ankunft.js:1445`) im EINEN CSM-Knoten aller Empfänger (`:422`) und im Licht-Baustein von Feld-March und
Panorama (`stamm/bild-sicht.js:2540`); ihr Wolken-Teil ist die EINE Wolken-Funktion der Kuppel `_wolkenMenge`
(`stamm/bild-himmel.js:93`, HIMMEL_GESETZ, Schicht `WOLKEN_SCHICHT` 800 m in der Welt verankert am Auge des Bilds) längs des
Lichts auf jeden Empfänger (`_wolkenSchatten`, `:149`), ihr Horizont-Teil die Schatten-Höhe zur Sonne aus dem Gitter des
Gelände-Gesetzes (`_horizontKarte` `:1347`, Gitter im Feld-Faden `voxel-worker.js:4030`, Takt `stamm/bild-kosten.js:3003`/`:3035`)
— die D3-Licht-Tiefe der Ring-Masche ist gefallen.
**Gemessen (headless, Nachbau der Stationen):** licht.K4 am Dorf (640 × 360, T 12,5 s, Blick 43,8°) σ 0,0018 → 0,0505,
r 0,9829 @ [0,0] → 0,7445 @ [18,−6] (r0 0,5758) — urteilt 1; Mutanten: Drift steht → r = r0 = 1 @ [0,0] ROT, Wurf aus → σ 0 ROT;
ferne.K4 am Dorf (Sonne 5,0°, das Gesetz) die Sonnen-Sicht in den Schatten-Orten 1 → 0 (4/4 dunkel), in den Licht-Orten 1 (39/39),
Mutante „ohne Karte“ 0/4 dunkel.
**Ehrlich offen:** ferne.K4 bleibt am Dorf 0 — der Nachbau trifft die Radeon-Zahl genau (3/7 Orte im Bild), die Station verlangt
≥ 5 Schatten-Orte, die Orts-Wahl ist Gesetz und Auge, kein Bild (FUND); das Luma-Verhältnis ≤ 0,4 und licht.K4 urteilt der
Bild-Beweis auf der Radeon (Himmels-Licht und Dunst tragen beide Hänge, ungemessen).

## Kosten

- Je Bild: kein neuer Pass. Je beleuchtetem Fragment der Wolken-Wurf (2 × fbm2 à 5 Oktaven, dieselbe ALU wie ein Himmels-Pixel;
  geschätzt ≤ 0,3 ms an der GTX 1060, 1080p × 0,75², ungemessen) und EINE bilineare Abtastung der Horizont-Karte.
- Der Horizont-Pass: 256² Texel × 50 Abtastungen (3,3 Mio.), nur wenn das Licht sich um 0,05° dreht oder ein Gitter kommt — bei
  60-min-Tag und Sonnen-Stufe ≤ 0,22° höchstens alle ~2 s. Gefallen: das ortho Bild aller drei Ring-Schalen je 0,22° Drehung.
- Der Feld-Faden: 65 536 Rufe des Gesetzes (`hoehe` ohne Detail) je 1 km Anker-Weg, erst nach dem ersten Weltbild, in Aufträgen à
  8 192 Rufe (node hier: 45 µs/Ruf warm, 6,7–8,1 s kalt für das ganze Gitter); die Ankunft trägt es nie.
- VRAM: `tex:horizont-karte` 0,5 MB → 0,375 MB (Gitter r16f 128 KB + Karte rg16f 256 KB).

## Belege

- Nachbau licht.K4: die Station verbatim (Blöcke 8 px, Korrelation über ±gx/4), die Wolke `_wolkenMenge` in JS, Licht : Himmel 3 : 1.
  Höhe der Schicht an 96 zufälligen Orten × Blick × Uhr: 600 m 56 · 800 m 62 · 1 000 m 63 · 1 200 m 56 · 1 500 m 60 — oberhalb der
  Drift begrenzt das Gesetz selbst (das feine Feld zieht gegen das grobe: r − r0 klein), die Höhe nur σ und Ausschnitt.
- Nachbau ferne.K4: `wirtAmGesetz` (das echte `_terrainMacroSurfaceY`), Orts-Wahl der Station verbatim (Saat 7, 2 000 Würfe):
  43 Orte, 4 im Schatten, 39 im Licht, im besten Azimut 30° nur 3/7 — Radeon 5fba36ea: „aus 3/7 Orten“.
- Linsen: `npm run check`, `diag-atlas --check`, `stamm:lint`, eslint, format:check grün; die Stoff-Wand fing den ersten Fang des
  Gitters (`_bruchMelden` statt `_stoffBruch`) — geheilt im selben Zug.

## FUNDE

- ferne.K4 (Station, punkte-maschine `g3.js` ~:1207): am Ort dorf überleben aus 2 000 Würfen 43 Orte (N·L > 0,2, ±1,5°-Band, Sicht aus
  80 m), im besten Azimut 3 Schatten-Orte — `imBild[0] ≥ 5` ist dort unerreichbar, was immer das Bild zeigt. Der Ort oder die Zahl der
  Würfe gehört der Station; ohne das steht ferne.K4 am Dorf ROT beim Namen „zu wenige Orte im Bild“.
- Der Panorama-Horizont trägt bis 12,3 km (das Gitter); jenseits davon wirft kein Grat (8–40 km im Feld-Pass: am Abend volles Licht).
- Die Kuppel liest ihre Wolke jetzt am Ort des Auges (eine Verschiebung des Felds, am Ursprung byte-gleich): Linsen, die Wolken-Pixel
  des Himmels an einem festen Ort vergleichen, sehen ein anderes Stück desselben Felds.
