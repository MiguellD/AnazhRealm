# Zensus Mond-Phase (Welle 2, Punkt 1) — LESEND, GTX 1050, 19.11., Stand licht-eine-skala 085b9ee10

Auftrag (Koordinator, Urteil zur Abgabe Welle 1): der Mond läuft seine Phase aus der Welt-Uhr, eine mondlose Nacht trägt ihre
Sterne; Soll vor der Rechnung, Zensus zuerst. Nichts gebaut.

## 1. Wer setzt die Richtung des Mondes (heute: der Vollmond, −Sonne) — VIER Ausdrücke

| # | Stelle | Ausdruck | Leser |
|---|---|---|---|
| R1 | `welt-licht.js:793` `mondRichtung(winkel)` | `sonnenRichtung(winkel).map(v => -v)` | die Bühne der Studios (`welt-licht.js:1195`) |
| R2 | `stamm/bild-himmel.js:1158` | `sunDir.clone().negate()` (Kommentar sagt „aus der EINEN Quelle“, ruft sie aber nicht) | `_atmoTakt` (`U.mond`, :1627), `_dayNightApplyDirectionalLight` (Richtlicht nachts), `lightDir` (Wasser-Glitzer, Gras-Durchlicht) |
| R3 | `stamm/bild-himmel.js:1832` | Rückfall `{ x: -sunDir.x, … }`, wenn kein moonDir gereicht wird | das Richtlicht |
| R4 | `stamm/bild-himmel.js:2560` | Körper: `skyOffset = dir × −sunDist` | die Mond-Scheibe (`state.moonMesh`) |

Die Klasse fällt ganz: EINE Funktion `mondRichtung(winkel, alter)`, R2–R4 lesen sie.

## 2. Wer liest das Licht des Mondes (heute ohne Phase)

| # | Stelle | Größe | Phase heute |
|---|---|---|---|
| L1 | `welt-licht.js:81–86` | `MOND_LX` 0,26 lx (Kyba 2017, Vollmond im Zenit) → `MOND_STAERKE`, `MOND_E` | keine |
| L2 | `welt-licht.js:151–156` `MOONLIGHT.intensity` | das Richtlicht nachts (`bild-himmel.js:1905`: × Wetter × `_mondDurchlass`) | keine |
| L3 | `welt-licht.js:757–759` `tafelEinheit` | der Boden der Tafel-Einheit nachts: `max(mondY > 0 ? MOND_E : 0, Sternenlicht)` | keine — liest die Konstante, nicht den Mond von jetzt |
| L4 | `welt-licht.js:762–767` `tafelLicht` → `U.mondE` | der Mond in den Himmels-Tafeln (Kuppel, Umgebung, Bestrahlung, Wolken `:1092`) | keine |
| L5 | `stamm/dirigent-ankunft.js:340–352` die Scheibe | Kugel r 9 m, `HIMMEL.mondCd` 2 500 cd/m², additiv, EINMAL beim Bau gesetzt | keine; dazu 2,71° statt 0,52° (27-facher Raumwinkel, S10 Nr 12), ohne Wetter und Durchlass |
| L6 | `stamm/bild-himmel.js:1807` `_mondDurchlass(y)` | der Durchlass der Luft zum Mond | trägt die Höhe, nicht die Phase |
| L7 | `scripts/lib/licht-linsen.cjs:1018` | Linse „ohne Mond“ (mondE = 0) | Probe-Eingang |
| L8 | `scripts/lib/abnahme-urteil.cjs:1154` | Kommentar „MOONLIGHT ohne Phase“ | — |

## 3. Die Uhr, aus der die Phase kommt

- Es gibt ZWEI Tage: `worldMeta.tag` (der Tag der SICHT: zählt, wenn die Uhr des Spielers Mitternacht kreuzt, `bild-himmel.js:2687–2694`,
  reist im worldMeta) und `_weltTag()` (der Tag der PROZESSE, `stamm/feld-leben.js:2604`, Welt-Uhr ab `worldMeta.tagNull`).
- Der Mond ist Himmel, also Sicht: Vorschlag — sein Alter liest `worldMeta.tag + timeOfDay` (dieselbe Uhr wie die Sonne), nie den
  Prozess-Tag. Sonst stünde der Mond nach einem Sprung der Uhr (das Spieler-Wort) in einer anderen Nacht als die Sonne.
- Ungelesen: ob `worldMeta.tag` beim Laden eines alten Stands fehlt (dann Alter 0 = Neumond als Rückfall — wäre ein stiller
  Wert; der Bau muss das benennen).

## 4. Soll (vor der Rechnung, Daten mit Quelle)

- M1 PHASE: Alter a = (Tag + Uhr + a0) mod 29,530 589 d (synodischer Monat); Phasenwinkel α = 180° − Elongation. Die Helligkeit
  folgt dem Gesetz der Mond-Helligkeit (Allen, Astrophysical Quantities: V = −12,73 + 0,026·|α| + 4·10⁻⁹·α⁴, α in Grad):
  E(α) = 0,26 lx × 10^(−0,4·(0,026·|α| + 4·10⁻⁹·α⁴)). Rechnung vorab (node): α 45° 0,087 lx (× 0,335) · Halbmond α 90°
  0,0237 lx (× 0,091, ~ 1⁄11 — die Oppositions-Überhöhung) · α 120° 0,0068 lx · α 150° 0,0011 lx · Neumond 0 (unter dem
  Sternenlicht 0,0005 lx; die Formel gilt bis etwa 150°).
- M2 RICHTUNG: der Mond steht um die Elongation (360° · a ÷ 29,53) hinter der Sonne auf derselben Bahn: `mondRichtung(winkel, a)` =
  `sonnenRichtung(winkel − 2π·a ÷ P)` (Neumond bei der Sonne, Vollmond gegenüber); R1–R4 lesen sie, sonst ROT.
- M3 LICHT: L1–L4 lesen E(α) und die Richtung von jetzt — `tafelEinheit` den Mond von jetzt, nie `MOND_E`; Tag bleibt bildgleich
  (wiese-mittag ± 0,05).
- M4 SCHEIBE: 0,52° (r = 0,00454 × Abstand), die Leuchtdichte 2 500 cd/m² × Phasenfunktion je Fläche, der beleuchtete Teil aus der
  Normale gegen die Sonne (der Terminator steht im Bild), mit Durchlass und Wetter.
- M5 NACHT OHNE MOND: an der Mess-Wiese, Alter um den Neumond, jeder Stern m ≤ 5 am freien Himmel sichtbar (Pixel ≥ 2 × Himmel
  daneben, die Linse von S13); die Boden-Leuchtdichte unter Sternen allein am Gesetz (0,0005 lx, gate:tafel-ganz:echt Zeile 5).
- M6 HIMMEL BEI VOLLMOND: das Urteil des Koordinators „sternloser grauer Dunst“ als Zahl — die Zenit-Leuchtdichte des Himmels bei
  Vollmond gegen das Datum (dunkler Himmel ~22 mag/arcsec² ≈ 0,17 mcd/m²; Vollmond-Himmel ~19 mag/arcsec² ≈ 3 mcd/m², Quelle
  vor dem Bau lesen); heute ungemessen. Liegt der Himmel darüber, ist DAS der Grund des Dunsts, nicht die Phase.
- Linse (vor dem Schnitt ROT am Täter): „der Mond hat genau EINE Richtung“ (R2–R4 rufen `mondRichtung`), Mutant „Mond = −Sonne
  bei Alter 7“ ROT; Phase: E(α) an drei Altern ± 2 %, Mutant „E konstant“ ROT; Paar „mondlos“ wird möglich, ohne den Mond zu löschen.

## 5. Offen beim Lesen

- Die Bahn-Neigung (5,1°) und die Libration: nicht Welle-2-Pflicht, als Rest benannt.
- Die Gezeiten: kein Leser im Spiel gefunden (nicht gesucht über `worlds/`).
- Die Tier-Nacht, Umwelt-Klang und das Brennglas lesen den Sonnenstand (`bild-himmel.js:1331`) — ob einer davon den Mond meint, ungelesen.
