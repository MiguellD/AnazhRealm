# tiere-im-blick, Vorprüfung 3 (auf main 967bd422), ZWISCHENSTAND

## Das Gesetz (fünf Sätze)
1. Der Leib eines wilden Tiers erschien bis Vorprüfung 1 nur ≥ 130 m vom Spieler und auf einer Spirale weg von seinem Tier (Versatz im Median 93 m); seit Welle 1 steht er am Ort seines Tiers, wie im Gehege (`_gehegeLeiber`).
2. Welle 1 ließ ihn nur außer Blick erscheinen: was der Gehende vor sich in Reichweite bekam, stand im Kegel und erschien nie — der Kegel vor ihm blieb leer.
3. Welle 2: KEIN LEIB ERSCHEINT SICHTBAR — außer Blick, ODER im Blick so fern, dass seine Höhe am Schirm ≤ 8 px misst (`_bestandErscheint` in stamm/kreatur-leben.js, `BESTAND_REGION.erscheinenPx`; Strecke aus Leib-Höhe, Brennweite des Schirms `_brennweite(_schirm().hoehe)` und Abstand zur Kamera).
4. Ein Rothirsch (1,68 m) erscheint so im Blick ab ~76 m (720 Zeilen) und wächst, während der Spieler auf ihn zugeht; die Ankunft (ein Sprung des Spielers, ein Stand, eine neue Uhr) zeichnet das ganze Bild in EINEM Ruf, jeden Leib an seinem Ort.
5. Die Wanderung hält ihr Ziel bis 1,5 × Weg + Blick (`_kreaturWanderZiel`), der Revier-Anteil liest 13 Punkte (`_kreaturRevier`).

## Das Band (Quelle mit Zahl)
- Erscheinen: Johnson 1958 — Entdecken 1,0 ± 0,25, Erkennen 4,0 ± 0,8, Identifizieren 6,4 ± 1,5 Linienpaare über der kritischen Ausdehnung (50 % Wahrscheinlichkeit); Gesetz 4 Linienpaare = 8 px, Richter die Oberkante 4,8 = 9,6 px.
- Dichte Rothirsch: > 5 je km² auf 84 % der schottischen Bergfläche, Jagdreviere ~15 je km²; Streifgebiet Hindin 2,75–7,1 km² (Exmoor).

## Je Sprosse: echte Station am Kopf 99f687f3 (Radeon, Hand-Lauf; dazu der Kopf 4a439789)
| Sprosse | Akte vorher | 99f687f3 · 4a439789 | Urteil |
|---|---|---|---|
| tiere.K5#1 (leben.oeko.vielfalt#1) | ego 0 Sichtungen, 0 Masken (c445936d) | ego 0 Sichtungen, 12 Masken; third 0, 33 Masken · ego 1 (Hirsch 204 px, 31 m), 22 Masken; third 2 (Bär 372/262 px); im Blick erschienen 0 / 0 in beiden | ROT (Soll ≥ 3 je Sicht) |
| karte2.leben.tiere.arten#1 | 2 Arten (5b36f69a) | 3 · 3 Arten (am Kopf 7bbf1495: 4) | ROT (Soll ≥ 5; spielStunden 0,013 gegen ≥ 1) |
| karte2.leben.tiere.wanderung#1 | min 0,47 (5b36f69a) | Hirsch 0,56–0,71, Bär 0,59–0,75, Fuchs 0,85–1,06, Wolf 0,76–0,88 | GRÜN, keine Akte (Preis-Lauf 0 Bilder) |

Werkbank, Ich-Sicht Kreis 600 Spiel-s an der Wiese, gleiche Seite: Tiere mit möglicher Maske ≥ 200 px altes Gesetz 0 ↔ neues 5 / 2; Leib-Box ≥ 400 px 0 ↔ 3 / 1.

## Kosten an der Wiese (Radeon, `werkbank lauf 30 --tiere frei`, ABAB)
| Lauf | CPU-Takt p95 | Bild p95 | GPU p95 | Zeichen-Rufe | Dreiecke |
|---|---|---|---|---|---|
| A alt | 12,91 ms | 33,54 | 9,34 | 120 | 393 772 |
| B neu | 12,65 ms | 33,49 | 7,22 | 121 | 407 610 |
| A alt | 10,66 ms | 33,41 | 6,68 | 121 | 389 581 |
| B neu | 12,90 ms | 33,58 | 5,81 | 121 | 390 559 |

Der Anstieg 27,5 → 37,7 ms der Vorprüfung 1 (ein Lauf je Seite) steht nicht: alt 10,7–12,9, neu 12,7–12,9 ms; kein Schnitt. Leiber als Leib: 19–20 auf beiden Seiten (Kappe 20), nah ≤ 50 m alt 0–5 ↔ neu 4–7.

## Die Linse (gate:kreatur-takt, Probe lebensraum, Richter-Entscheid Welle 2)
Sollen: Versatz Leib ↔ Tier im Median ≤ 1 m · Abstand ≥ `CREATURE_SPAWN_CLEAR_M` · 0 Geburten sichtbar im Blick (> 9,6 px Höhe). Selbsttest: Grund GRÜN, Täter 6 von 6 ROT beim Namen — `erscheinen-nah` „2 Geburten sichtbar im Blick (> 9,6 px Höhe, größte 10.3 px)“, `geburt-fern` „3 von 71 Würfen am Ort ihres Tiers, Versatz im Median 70.7 m“. Der Kreis-Zähler `imBlick` der Station (scripts/lib/zerlege-linse.cjs `kreisGang`) zählt nach demselben Entscheid nur sichtbar Erschienene (> 9,6 px).

## Fund: das Gras verdeckt das Tier (kein Schnitt in dieser Welle)
Halm der Nah-Wiese: Spitze 0,74 m (p90 0,61 m). Die Ferne vergrößert jedes Büschel gleichförmig um `skala` (`_wieseFern`, stamm/vegetation-wiese.js, `NAH_WIESE.fern.skalaMax` 2,5): flach bei 20 m × 1,23, 30 m × 1,85, ab 40 m × 2,5 — die Spitze steht dort 1,37 m bzw. 1,85 m. Hirsch: Bauch 0,93 m (Beinlänge), Höhe 1,68 m. Ab ~20 m reicht das Gras über den Bauch, ab ~40 m bis an den Rücken: der Hirsch liest als Rücken im Gras (Bilder rund2, rund3 der Vorprüfung 1). Leser: Zeile im FUND-REGISTER (Zweig koordination), Sprosse tiere.K5#1.

## arten#1: die fünfte Art
Am nächsten liegt der Singvogel (Werkbank: 235–280 angetroffen in 40 Takten, 0 im Bild). Ihm fehlt die Nähe: gezeichnet wird er nur singend in 5–14 m Höhe in der Krone; 200 px trägt ein Vogel von 0,15 m erst unter ~5 m. Danach die Forelle (29 angetroffen, unter dem Spiegel).

## Offen (mit Grund und Messnamen)
- 13 % der Würfe stehen 25–178 m neben ihrem Tier. Ursache gemessen (42 Fälle): 36 liegen im Reich eines kommenden Orts (`_imReichEinesOrts`), 6 im Grundriss. Der Schreiber des Bestands-Orts (`_creatureNaturalBirth` in stamm/kreatur-leben.js) fragt nach feld.K2#2 nur die Saat; das Reich hängt am Sitzungs-Stand (Gedächtnis der Zellen, kaltes Buch). Heilung am Schreiber braucht ein reines Reich des Gesetzes in stamm/siedlung-ort.js. Leser: gate:kreatur-takt lebensraum (versatz).
- tiere.K5#1 ego 0–1 von 3 (12–22 Masken, davon 0–1 ≥ 200 px): das Gras der Ferne (Fund oben). Leser: Sprosse leben.oeko.vielfalt#1.
- arten#1 3–4 von 5. Leser: Sprosse karte2.leben.tiere.arten#1.

## Bilder
Gang nach vorn (Radeon, `--echt`, Wiese, gleiche Kamera, Start bei Genesis, W 662 Takte von 31 auf 13,9 m an den Ort des nächsten Hirschs): gang-altgesetz — leer, nächster Leib 72 m außer Bild; gang-neugesetz — vier Hirsche 13–17 m, mit Hals und Kopf lesbar. Wiese-ego-rund1–4: Vorprüfung 1.
960 × 540 in `cloud-post/tiere-im-blick-bild/`; Originale (1920 × 1080) unter
C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/9c27a074-223e-48c0-a5af-60ae0385359b/scratchpad/tiere-bild/ und …/scratchpad/tiere-bild2/.
