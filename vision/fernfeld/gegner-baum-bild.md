# Gegner Bild — w28-baum-schirm gegen main

Stand 15.11.2026 09:40 (date). Auftrag: widerlegen, dass der Kandidat nirgends schlechter aussieht als main.

**Urteil: nicht widerlegt.** In 27 eigenen Bildpaaren an 13 Posen, die der Bauer nicht gewählt hat, und in zwei Gängen ist der Kandidat
nirgends reproduzierbar schlechter als main; kein Tausch wird durch ihn sichtbar, der nicht genauso auf main steht. Ein einzelnes Bild
des Kandidaten (Gegenlicht-Tele, Lauf 1) fehlt ein Baum am rechten Rand — in fünf weiteren Schüssen derselben Pose auf dem Kandidaten
nicht wieder, also kein Fund, sondern ein offener Verdacht (unten, V1).

## Was verglichen wurde

- **Kandidat:** Zweig `w28-baum-schirm` 34a1bc7f. Von den fünf Schnitten trägt er nur Schnitt 3 („die Verdeckung in Metern stirbt“:
  Kronen-Gitter, `occDist`, `useOcclusionDemotion`, `_occluded` fallen; `_lodSlotVollNachzug`, `vollNode`); Schnitt 1, 2, 4 und 5 sind
  auf dem Zweig zurückgenommen. Stamm-Diff gegen die Merge-Basis: 15 Dateien, 81 + / 203 −, davon sichtbar wirksam nur
  `stamm/siedlung-bauten.js` und `stamm/siedlung-instanz.js` (der Rest ist Kommentar und Umbenennung).
- **main:** a6555b12 (V18.546.292, die Merge-Basis des Kandidaten; origin/main 4ee205bd ist im Stamm byte-gleich: kein Laufzeit-Byte).
  Eigener Lese-Baum `.claude/worktrees/gegner-bild-main` (detached, node_modules als Verweis).
- **Welt:** Radeon 890M (amd rdna-3), jede Sitzung eine eigene Welt ab Boot in 1920 × 1080 (`werkbank start --fenster 1920x1080`).
  `r._schirm()` = 1920 × 1080 nach dem Boot, nach den Posen und am Ende jeder Sitzung; **53 von 53 eigenen Bildern** tragen in ihrer
  Abnahme `zeilen 1080` und Leinwand 1920 × 1080. Jeder Schuss mit `--wahl 0` (keine Blick-Wahl versetzt die Kamera), Spieler vorher
  per `umstellen` an die Kamera-Stelle, Laub-Rand 216 m auf beiden Seiten.
- **Rauschen derselben Welt:** main gegen main, gleiche Pose, zwei Sitzungen: 0,02–0,05 %; zwei Runden einer Sitzung bis 3,18 %
  (Wind, Tiere, Vögel). Ein Paar zählt erst als Fund, wenn der Unterschied wiederkehrt und nicht auf main steht.
- Werkzeug und alle Bilder: `artifacts/profiband/auge/w28-baum-schirm/gegner-bild/` (`vergleich.cjs`: Pixel mit max. Kanal-Differenz
  > 24, Zellen 60 px, Differenz- und Ausschnitt-Bilder; `erkunde.js`, `plan.cjs`, `schuss.sh`, `gang.js`, `tausch-scan.js`,
  `wer-rechts.js`, `diag.sh`, `diag2.sh`). „zaehlt-nicht-main-lauf1-pfadfehler.log“ zählt nicht (der erste Lauf brach an Windows-Pfaden).

## Die Paare der Bauer, selbst angesehen

| Paar | Zeilen | abweichend | Urteil |
|---|---|---|---|
| Schnitt 3 `main-p3-rot` ↔ `kandidat-p3-rot` | 1080 / 1080 | 154 px (0,007 %), Kronen-Lücken 840–1140 × 600–720 | gleich |
| Schnitt 3 `main-p3b` ↔ `kandidat-p3b` | 1080 / 1080 | 103 px (0,005 %) | gleich |
| Schnitt 3 Ausschnitt `paar-p3-ausschnitt-400`, `diff-p3`, `diff-p3b` | — | rote Punkte nur in Lücken | gleich |
| Schnitt 4 `main45-p4-75` · `-tele120` · `-tele75-rot` · `main-wiese-ego` ↔ Kandidat | 1080 | 0,016–0,028 %, nur Horizont-Zeile 480–540 | gleich (Schnitt zurückgenommen) |
| Schnitt 5 `main-gang-b1…b8` ↔ `kandidat-gang-b1…b8` | 1080 | 2,69 % → 0,21 % | Kandidat voller (Wald gesät), nicht schlechter; Schnitt zurückgenommen |

Schnitt 1 und 2 haben keine Bilder (kein Schnitt). Keine grobe Stufe bei großer Pixel-Höhe in diesen Paaren: jede Welt lebte in 1080.

## Die eigenen Paare (main ↔ Kandidat, gleiche Pose, `diff-*.png`, `uebersicht-*.png`, `paar-*.png`)

Ort der Erkundung: Mess-Wiese (−280,4 / −1045,6). Die Verdeckungs-Orte fand ein Marsch durchs Kronen-Gitter von main über ein Raster
± 150 m (je Ort der Blick mit den meisten verdeckt geurteilten Bäumen 30–150 m), fern von P3 und P3b des Bauers.

| Pose | Kamera → Blick | abweichend | Urteil |
|---|---|---|---|
| Wiese 50 · 75 · 100 m, 75° | Mess-Wiese → (−0,92 / −0,39) | 0,0013–0,0015 % | gleich |
| dasselbe Tele 20° | | 0,014–0,018 % (Gras im Wind, unten) | gleich |
| Wiese ins Offene 50 · 75 · 100 m, 75° und 20° | Mess-Wiese → Westen (270°, erster Baum 144 m) | siehe Nachtrag | |
| Baumreihe am Horizont 75° / 20° | Mess-Wiese → 105°, erster Baum 91 m | 0,41 % / 0,05 % | gleich — der Unterschied ist die nahe Krone oben rechts im Wind (`paar-horizont-fov75-oben.png`) |
| Gegenlicht 75° (Uhr 0,3, Sonne 86° / 18° hoch) | Mess-Wiese → Sonne | 0,49 % | gleich — Krone im Wind, ein Vogel (`paar-gegenlicht-fov75.png`) |
| Gegenlicht Tele 20° | Mess-Wiese → Sonne | 2,04 % in Lauf 1 | **V1** unten; in vier Wiederholungen 0,07–0,17 % gegen main |
| Verdeckt 1, 75° / 20° | (−330,4 / −995,6) → 60°, im Blick 489 Bäume 30–150 m, davon 364 im Gitter verdeckt | 0,06 % / 0,28 % | gleich — Tier und Lichtflecken auf dem Fels (`paar-verdeckt1-fov20.png`) |
| Verdeckt 2, 75° / 20° | (−205,4 / −1170,6) → 30°, 451 / 331 | 0,026 % / 0,003 % | gleich |
| Einzelbaum beim Näherkommen 45 · 41,6 · 40,4 · 37 m | Kiefer (−437,3 / −1042,9, Größe 0,55) von Osten über die Wiese | 0,11–0,15 % | gleich — nur Gras im Wind (`paar-baum-40.4.png`) |

**Der Tausch der Kiefer.** Die Stufe wechselt auf beiden Seiten gleich: langsam (120 Takte je Meter) Karte → L1 bei 41 → 40 m, L1 → L0
bei 22 → 21 m, main und Kandidat identisch; in 1-m-Schritten zu 24 Takten 46–47 → 45–46 m und 25 → 24 m, je zweimal, beide ohne
Rücksprung. Im Bild ist der Wechsel bei 41,6 ↔ 40,4 m auf keiner Seite als Sprung der Krone zu sehen (`paar-tausch-main-41.6-40.4.png`,
`paar-tausch-kandidat-41.6-40.4.png`; die Differenz dort ist die Kamera, die 1,2 m weiterging).

## In Bewegung

`gang.js` (Abschrift von `popGang`: je Schritt zwei Aufnahmen derselben Pose, vor und nach 12 Takten, Pop = ΔLuma > 18, 1920 × 1080),
8 Schritte zu 0,5 m:

| Ort | main | Kandidat |
|---|---|---|
| Verdeckt 1 (−330,4 / −995,6) → 60° | 0,0349 % (724 px; 10/243/100/1/30/71/0/269) | 0,0355 % (737 px; 345/19/83/1/17/0/9/263) |
| Verdeckt 2 (−205,4 / −1170,6) → 30° | 22,96 % (476 190 px) | 22,97 % (476 250 px) |

- Verdeckt 1: gleich (+13 px, +1,8 %). Der größte Schritt-Wert verschiebt sich um einen Schritt: main Schritt 2, Kandidat Schritt 1 —
  in beiden zwölf Karten-Dinge in 176–189 m, die erstmals zeichnen (der Eintritt am Laub-Rand, Schnitt 5, nicht dieser Schnitt). Auf
  main urteilt in Schritt 3 die Verdeckung einen Baum in 31 m von L1 auf die Karte (`31m:9>15v`); sein Feld trägt auf main 89, auf dem
  Kandidaten 78 Pop-Pixel — der Tausch hinter der Krone ist auf main nicht sichtbar und fehlt beim Kandidaten.
- Verdeckt 2: der Gang führt die Kamera ab Schritt 5 in eine Erle (Rinde in 6,3 m, Vordergrund 100 %); das nahe Laub bewegt sich im
  Wind zwischen den zwei Aufnahmen. Gleich auf beiden Seiten, kein Pop der Stufen-Wahl.

**Beidseitig, nicht des Kandidaten:** in 2-m-Schritten zu 24 Takten (5 m/s, ein Läufer) springt die Kiefer auf main UND Kandidat
zurück — L1 → Karte → L1 zwischen 50 und 40 m, bis zu zweimal je Annäherung (main 1/2/1, Kandidat 1/2/2 Rücksprünge in drei Läufen;
`scan2-*-an-2m-*.json`); die Wechsel-Distanz folgt dem Tempo (langsam 41 m, schnell 45–47 m). Das ist ein Flattern der Stufen-Wahl
unter Bewegung auf main — Gegenstand für lod.K2, nicht für diesen Schnitt.

## V1 — Verdacht, nicht reproduziert

`kandidat-gegenlicht-uhr0.3-fov20-rot.png` (Lauf 1, 08:10–08:16): am rechten Rand fehlt ein Stamm (x 1805–1840, y 0–820) und die glatte
hellgrüne Krone davor (x 1550–1750, y 430–670); dort steht die wässrige Fern-Textur der Karten (`paar-gegenlicht-fov20-rechts.png`,
`paar-gegenlicht-kandidat-lauf1-gegen-lauf2.png`). Kamera (−280,4 / 29,31 / −1045,6), Blick (0,996 / 0,057 / 0,065), 20°.
- Wiederholt: dieselbe Pose auf dem Kandidaten in zwei weiteren Sitzungen viermal (direkt nach `umstellen`, nach einem Umweg über
  (−330,4 / −995,6), und zweimal nach genau der Folge von Lauf 1: Wiese → Horizont → Gegenlicht) — der Stamm steht jedes Mal, 0,07–0,17 %
  gegen main. Auf main in sechs Schüssen nie gefehlt.
- Die Stufen der 61 Bäume in diesem Bildteil (`wer-rechts.js`, ≤ 200 m) sind in jeder Messung beider Seiten gleich (Kiefer 78,1 m
  L1/Band 2, die Tannen und Haseln Karte). Wer in Lauf 1 fehlte, ist ungelesen: die Messung lief erst danach.
- Damit 1 von 5 Kandidat-Schüssen, 0 von 6 main-Schüssen. Kein Beweis, aber nicht wegzureden: wer den Schnitt landet, schießt diese
  Pose in einer frischen Welt noch einmal in der Folge von Lauf 1 (`schuss.sh`).

## Ehrlich offen

- Nur die Radeon; die GTX 1060 ungemessen.
- Nacht, Regen, Winter, Third-Person ungeprüft; nur Mess-Wiese und zwei Wald-Orte um sie (±150 m).
- Die Kosten (GPU-Zeit, VRAM) waren nicht Auftrag dieses Gegners.
