# Entwurf der Abgabe — w28-strahler (Zwischenstand, GTX 1050, 18.11.)

Kopf der Vorprüfung: **ddaf2376b** (Form B, `[ci voll]`, Code-Check **#6890**). Neuer Kopf der Vorprüfung: **db5fb33f3** (`[ci voll]`, Lauf folgt). Darauf liegen WIP **5f2b43bcc** (nur `scripts/lib/licht-linsen.cjs`: die Bahn-Linse, siehe „Ehrlich offen“ 1). Main beim Merge: ee5c80d4e (V18.546.335).

## Geschnitten

- EIN Strahler-Gesetz: jede Quelle des Pools trägt Candela (`_leuchtCandela` wirft sonst), der Stoff rechnet Lux und staucht die SUMME durch das Auge über der Umgebung der Stunde (`welt-licht.js` `AUGE`, `augeZeig`); Glut und Licht der Lava hängen nicht mehr an `LEUCHT_FEUER` × `_flammenLicht`.
- Der Lichtmesser liest das Becken am Auge erst ÜBER der mesopischen Decke (`AUGE.deckeLux` = `zapfenCd`·π ÷ Karte = 87,3 lx; `augeMesser(Σ E, A) = augeZeig(Σ E − Decke, A + Decke)`, EIN Leser `_belichtungAusLicht`). Unter ihr steht die Kamera (Laterne, Herd), über ihr schließt sie (Lava).
- Linsen: `gate:pruefbuehne-licht` S0 MESSER (unter der Decke k am Gesetz ± 0,02 EV; 2 157 lx gestellt → k am Gesetz und unter k ohne Becken; Mutant „der Messer liest unter der Decke“ und „Schreiber taub“), `tag-achse` MESSER mit der Decke aus `MESOPISCH`, WIP: NACHT ohne die Quellen, QUELLE.

## Gemessen (GTX 1050, Nacht, Kopf Form B)

| Ort | Σ E am Auge | k | Bild |
|---|---|---|---|
| Bühne S0 | 66,5 lx (< 87,3) | 1,4968 = Gesetz | Boden Luma 24,3 (Soll ≥ 22), schwarz 0 |
| Gasse | 6,02 lx | 1,574 | Wand 76,3 · unter Laterne 29,2 · Boden fern 18,8 · unter Fenster 8,4 (main .330: 61,6 / 49,4 / 17,9 / 6,8) |
| Herd nah (Wiese) | 9,58 lx | 1,504 | Kreis 98,6 ÷ ferne Wiese 54,2 = **×1,82** (am Kopf neu gemessen) |
| Herd-Reihe am Auge | 3 m 21,4 · 1,7 m 47,9 · 1,4 m 59,5 · 1 m 80,2 lx | 1,503 an allen | die Decke fällt am Herd nie |
| Lava nah | 2 157 lx | 0,216 | Saum 42,6 ÷ Gras in 15 m 27,3 = 1,56 · Baumlinie 4,2 (main 13,3) |

- Gasse, die Frage „ist der flachere Kreis die ehrliche 100-cd-Laterne?“: unter der Laterne (3,6 m hoch) E = 100 ÷ 3,6² = 7,7 lx (mit den Nachbarn 8,2 lx), in 8 m am Boden 100 ÷ (64 + 13) × cos = 0,5 lx — über der Umgebung A + Knie ≈ 2,9 lx zeigt das q-Gesetz darunter +0,71 Welt-Einheiten, fern +0,06 (die Umgebung selbst 0,54): der Kreis ist das Gesetz der Quelle, nicht mehr die Reichweite-Rampe von main.
- `gate:tag-achse:echt` am Kopf GRÜN: Wiese Karte 125,6 · Sonne 10° −1,04 EV R/B ×1,07 · Nacht ohne Quellen −3,35 EV Luma 32,8 (mit −2,53 / 45,5); Genesis Karte 126,4 · Nacht ohne Quellen −2,05 EV Luma 43,9 (mit −1,84 / 49,6).
- Preis (gpu-bank 60 × 3, `gpuJeFrameMs`, main ↔ Kopf): Herd Nacht 8,66 / 9,58 ↔ 9,78 / 8,93 ms (zwei Paare, Mittel 9,12 ↔ 9,36: im Rauschen von ±1 ms kein Aufpreis lesbar) · Herd Mittag 7,90 / 7,97 ↔ 7,83 / 7,72 ms · Lava nah Nacht 8,87 ↔ 8,13 ms (ein Paar)

## Tore

- Am Gerät, kopf ddaf2376b bzw. 213142376 (gleicher Baum): `gate:pruefbuehne-licht` mit Selbsttest EXIT 0 · `gate:tag-achse:echt` EXIT 0 · Atlas `--check`, `stamm:lint`, `format:check` grün nach dem Merge.
- Der Cloud überlassen (kopf ddaf2376b, Code-Check #6890): die 18 Gruppen samt der 45 Schritte, die das Licht-Gesetz lesen (Liste `linsen-karte.txt`). Stand beim Schreiben: **ROT**, 16 von 18 Gruppen grün. voll 12/18 `gate:wasser-leben`: L1 ERSTARRT NIE (die frische Lava ist der Probe keine Quelle: `licht` false bei Glut 1) und H1 KALT (der Stahl bei 1 118 °C ohne Quelle: `kelvin` null); voll 15/18 `gate:weltgrenze`: „die Pflanzung ist blind: `_leuchtPool` trägt das Zeichen von A nicht“ auf allen zwölf Wegen. Beide am Gerät nachgestellt (EXIT 1, dieselben Zeilen). Geheilt in c37a332b3, siehe „Ehrlich offen“ 0.

## Ehrlich offen

0. **Die Cloud war am ddaf2376b ROT (#6890: zwei Gruppen, drei Linsen), EINE Ursache, geheilt in c37a332b3.** Die Proben fragten `_leuchtQuellen` am Mittag (88 362 lx); nach dem Gesetz des Auges steht dort keine Glut zur Wahl (`_leuchtReichweite` 0: Lava 19 670 cd, Stahl 114 cd, Tor 60 cd). Sie stellen die Uhr jetzt über das Spieler-Wort auf Mitternacht; das Probe-Tor der Weltgrenze trägt seine Bogenbreite (ohne sie war der Kern NaN). Am Gerät: `gate:weltgrenze` EXIT 0 (13 Wege, drei Scheine rot), `gate:wasser-leben` EXIT 0 mit Selbsttest. Folge für das Spiel, gewollt vom Gesetz, aber zu entscheiden: am hellen Mittag wirft KEINE Quelle Licht in den Pool (auch die Lava nicht) — sie glüht nur.

1. **QUELLE (tag-achse, WIP 5f2b43bcc) ist in der Bahn ROT, Ursache unbenannt.** Die 18-%-Karte im Stoff der Welt, der stärksten Quelle zugeneigt: mit ÷ ohne Quellen +0,40 EV (Wiese, Σ E 1,49 lx) und +0,41 EV (Genesis, 1,82 lx); die Rechnung der Linse (augeZeig(Σ E, A) × Maß ÷ Lesung des Messers) gibt +0,72 an beiden. Zerlegt je ρ·k: das Quellen-Glied zeigt 0,21, das Umgebungs-Glied 0,42 (Lambert ρ/π wäre 0,318 für beide). Ausgeschlossen: der Würfel-Schatten (ohne ihn dieselbe Zahl), die Umkehr der Tonkurve (je Farbe gerechnet). Entweder liest der Messer nachts weniger Umgebung, als die Karte empfängt (×1,32), oder der Pool zeigt weniger (×0,66) — das trifft die Einheit, in der `_belichtungAusLicht` das Becken zur Lesung addiert. Braucht einen Entscheid.
2. Genesis Nacht ohne Quellen −2,05 EV liegt außerhalb des Bands −5 … −3 (in `--kurz` nur Wand; in der Bahn ROT). An main nicht gegengemessen.
3. Der Mutant „Kamera −1 EV → NACHT rot“ hält an der Kurve des Kopfs nicht (−3,36 → −4,36 EV bleibt im Band, Luma 25,6 ≥ 22); im Selbsttest fällt die Kamera darum um 2 Stufen (wie der Schein der Prüfbühne).
4. `augeMass` am Mittag 0,93 (nicht 1).
5. Fenster, Stahl, Tor: 0 % am neuen Gesetz geprüft (keine Station in dieser Welle).
6. Nicht am Kopf gemessen: tag-achse:bahn (100 Uhren × 4 Orte), der Mutant am Schreiber in tag-achse, die 45 Schritte (Cloud).

## Bilder

`kopf/` und `main/` (ee5c80d4e), dieselbe Kamera: Herd nah/fern (Nacht, Tag, Sonne 0°, Sonne 10°), Gasse (Nacht, Tag, 0°, 10°), Lava nah (Nacht, Tag, 0°, 10°). Bühne S0 (`buehne-s0.png`, `buehne-s0-nacht.png`) an beiden Köpfen. Mit dem eigenen Auge gesehen: Lava nah Nacht (main: lesbare Nacht, Gras kaum beleuchtet; Kopf: schwarze Nacht, das Gras im Vordergrund satt orange, einfarbig) und Gasse Nacht (main: enger heller Kreis unter der Laterne; Kopf: flacher Kreis, wärmere Wand).
