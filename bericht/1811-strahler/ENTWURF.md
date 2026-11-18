# w28-strahler — Entwurf der Abgabe (GTX 1050, 18.11., Kopf c4edde167, main V18.546.334 eingemergt)

Zwischenstand, kein Stempel von mir. Bilder am Kopf: `bericht/1811-strahler/messer/m-*.png` (Herd nah/fern, Lava, Gasse, Tor; `nacht`, `tag`, `d0` = Sonne 0°, `d10` = Sonne 10,8°). Die Gegen-Bilder von main stehen in `ende/main-*.png` (Nacht und Mittag, main V18.546.330); main in der Dämmerung ist nie geschossen. Alles in `ende/ende-*.png` und `kopf-*.png` ist ein Stand VOR dem Messer — kein Beleg mehr.

## Die Zerlegung der Dämmerung (Koordinator 11:25) — die Wurzel

Karte der Mess-Wiese, vier Glutbrunnen in 13–21 m, Σ E an der Karte 3,72 lx. VOR dem Schnitt (e5edfc239 ohne Blende):

| Sonne | w des Messers (Welt) | A, das `augeZeig` nahm | A von Hand (linear) | gezeigtes Becken | von Hand mit wahrem A | k |
|---|---|---|---|---|---|---|
| 0° | 0,0561 | 0,000002 lx | 824 lx | 0,402 (×7,2 der Umgebung) | 0,0055 | 7,27 (mit Blende 0,387) |
| 10,8° | 0,5077 | 0,13 lx | 7 457 lx | 0,391 (+77 %) | 0,0010 (0,2 %) | 2,49 |
| Mitternacht | 0,5515 | 0,199 lx | — (Nacht steht auf S) | 0,386 | 0,386 | 1,547 |

**Wurzel, Datei und Zeile:** `welt-licht.js` `augeLux` (vor dem Schnitt Zeile 88) kehrte die Skala S über die GANZE Lesung um. Die Welt trägt aber zwei Maße: der Tag (Sonne + ihr Himmel aus den Tafeln) steht LINEAR in Lux, nur die Ersatz-Lichter der Nacht (Mond, Sterne, Dämmerlicht, Hemisphäre, Umgebung) stehen auf S. In der Dämmerung ist der Tag schon klein und die Nacht noch nicht eingeblendet: A fiel WEIT unter die Nacht. Deine Vermutung traf. Der Zeitplan hatte das verdeckt, die Blende gepflastert.

**Zweite Hälfte derselben Wurzel** (am Lava-Bild bei Sonne 0° gefunden, nach dem ersten Schnitt): das Auge ZEIGT auf S, die Welt trägt für 779 lx aber 0,056 Einheiten, S gäbe 2,88. Die Lava stand weiß mit orangen Bäumen (Riss RGB 254/209/201 am Anschlag, Baumlinie Luma 146).

## Geschnitten (seit e5edfc239)

- **42f03b8d6** `augeLux(welt, tag)`: der Tag linear, der Rest über S. Der Messer trägt den Tag-Anteil seiner Lesung (`_belichtungTag`: das Richtlicht, solange es die Sonne ist, + das Sonnen-Glied der Himmels-Tafel aus `bestrahlung`). **Die Blende der Quelle ist gefallen** (samt `lichtAuge.z` als Blende und der gestellten Kamera in stand-takt).
- **f42a86136** der Messer im EINEN Schreiber: `_beckenAmAuge` (Σ E der gehaltenen Plätze an der Kamera, mittlere Candela ohne Flackern, derselbe Abfall wie im Stoff) → `augeZeig` → Zuschlag auf die Lesung in `_belichtungAusLicht`. Kein zweiter Schreiber. Linse tag-achse: ASYNC urteilt ohne das Becken, neu **MESSER** (k neben dem Gesetz MIT dem Becken, von der Linse selbst gerechnet, 0,02 EV; kein Becken an irgendeiner Uhr ist ROT), Selbsttest zwei Fälle.
- **e439969e0** main fa61024d eingemergt (Merge-Treiber `setup:merge` in diesem Klon eingerichtet; Konflikt nur im Export-Block von `fachwerk-core.js`; `recipes.json` + `manifest.json` neu geprägt, kein anderes Golden bewegt sich gegen main).
- **c4edde167** `augeMass` = Lesung ÷ S(Lux der Lesung): Nacht 1, Sonne 0° 0,019, Sonne 10,8° 0,112, Mittag der Wiese 0,93. EINE Zahl je Bild aus `_leuchtTakt` an Becken (`lichtAuge.y/.z`), Glut (`lichtGlut`, `lavaGlut`) und am Messer.

## Gemessen

**Tag-Achse** (`gate:tag-achse:echt`, Kopf): GRÜN. Wiese: Buckel 0,00 · Sprung 0,09 · Sonne 10° −1,04 EV **R/B ×1,07** (main ×1,07; e5edfc239 ×2,40; Spike ×5,05) · Nacht −3,46 EV Luma 31,4 (ohne Messer −2,53 EV: außerhalb des Bands −5…−3). Genesis: R/B ×0,91, Nacht −2,79 EV. **Mutant** (Messer aus im Schreiber): ROT beim Namen — `MESSER wiese: Uhr 0 0.718 EV neben dem Gesetz mit 3.357 lx am Auge`.

**Nach dem Schnitt an der Karte:** Sonne 0° A 779 lx, gezeigt 0,0023, Reichweite 1,5 m · Sonne 10,8° A 7 456 lx, Pool leer · Mitternacht A 0,1994 lx unverändert.

**Lava nah** (Luma, 960 × 540):

| | Saum-Gras | Gras 15 m | Baumlinie | Riss RGB | Stein |
|---|---|---|---|---|---|
| main Nacht | 47,5 | — | 13,3 | 120/65/47 | 43,9 |
| Kopf Nacht | 41,7 | 26,5 (÷ = 1,57) | 4,1 (×0,31) | 100/39/9 (R/G 2,56) | 17,5 |
| Kopf Sonne 0° | 67,2 | 59,3 | 57,6 | 156/76/63 | 68,8 |
| Kopf Sonne 10,8° | 71,7 | 112,3 | 92,2 | 142/72/53 | 83,7 |
| Kopf Mittag | 101,4 | 124,2 | 50,4 | 145/86/63 | 111,3 |

Nacht: k 0,206, Σ E am Auge 2 157 lx, gezeigt 3,57.

**Herd nah Nacht:** Kreis 2 m 58,8/59,0 ÷ ferne Wiese 28,1 = **×2,09** im Bild (main ×1,19–1,47, ohne Messer ×1,82); Bett 55,1; k 0,631 (9,6 lx am Auge). Herd fern: Scheibe 50,2 · Rand 7 m 31,3 · Straße 16,6 (main 32,0); k 0,842. **Pumpen:** Luma der fernen Wiese über 5 s 5,03–5,09, Hub 1,07 % (Soll ≤ 3 %); k Hub 1,01 %. Bild-Zahlen in 1 m und 3 m: nicht gemessen.

**Gasse nah2 Nacht — das Dorf mit Messer:** k 0,769 (6,0 lx am Auge, gezeigt 0,567).

| | Wand | unter der Laterne | ferner Boden | unter dem Fenster |
|---|---|---|---|---|
| main (.330) | 61,6 | 49,4 | 17,9 | 6,8 |
| e5edfc239 | 76,3 | 29,2 | 18,8 | 8,4 |
| Kopf mit Messer | **44,7** | **16,4** | 6,9 | 2,9 |

Die Wand steht knapp über deiner Schwelle 40, der Boden der Gasse geht fast schwarz; das Haus und die Laterne bleiben lesbar (eigenes Auge), der Stand und die Bewohner am Boden kaum. Die Laterne (100 cd in 3,6 m) gibt unter sich 7,7 lx; `augeZeig` über A 0,18 lx zeigt daraus 0,68 gegen 0,55 Umgebung — durch k 0,769 statt 1,55 steht der Boden bei der Hälfte.

**Preis** (gpu-bank 60 × 3, GPU ms je Frame, zwei Läufe): Herd Nacht 8,95/8,95 (main .330: 8,71/8,48; e5edfc239-Vorgänger 9,23/9,05) · Herd Mittag 7,93/7,82 (main 7,85/7,81).

**Gatter am Kopf c4edde167:** EIN Lauf des Satzes — siehe unten „Gatter“ (wird nach dem Lauf ergänzt). Vorab am Kopf grün: tag-achse:echt, diag-atlas --check, format:check.

## Ehrlich offen

- **Fenster als Strahler: 0 %.** Ebenso Stahl, Tor, Fahrzeug, Funken auf alten Wegen.
- **Die Gasse nachts:** Boden unter der Laterne Luma 16,4, Wand 44,7 — die gehobene Nacht fällt um jede Quelle; deine Sicht mit eigenem Auge steht aus.
- **Mittag:** `augeMass` 0,93 an der Wiese (w 7,19 statt 7,83) — Glut und Lava am Mittag 7 % tiefer als vor dem Maß; Riss mittags 146/87/63 → 145/86/63.
- **Zwei Leuchtdichten für das Herdfeuer** (Becken 548 cd/m², gemalte Glut 10 000) und **zwei Formeln** (Karte 0,80 ↔ Fenster 0,53).
- **Das Fachwerk-Labor** ruft `augeLux` mit einem Wort (seine eigene Tageszeit, kein Tag-Anteil) — unverändert, ungeprüft gegen die neue Dämmerung.
- **stand-takt und settlement im Null-Renderer** (Mittag gestellt).
- main in der Dämmerung nie geschossen: für `d0`/`d10` gibt es kein Paar, nur das Bild des Kopfs.
