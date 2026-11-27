# Vorprüfung landmarken-geologie-8 — Heimholer: der Wurf der Landmarke je Saat auf main

Zweig `landmarken-geologie-8` auf `origin/main` 1336dcb8 (Kopf 5; Kopf 4 auf 38194f83, Kopf 1–2 auf 45bad33f, begonnen auf 4a188bf2; der neue main — w28-wind-boee-haus, w28-krieg-lage, w28-sprache-saaten — berührt keine Datei des Wurfs).
Beanspruchte Sprosse: `karte2.erleben.spieler.wegfindung#1`. Status ZWISCHENSTAND.
Heimgeholt: die Arbeit K4–K5 aus `landmarken-geologie-7` (65cd4581; Blatt `git show 65cd4581:cloud-post/landmarken-geologie-3.md`),
merge-tree gegen main Exit 0, als EIN glatter Kopf.

## Täter-Zahl (vor dem Schnitt)

- main 4a188bf2: `stamm/vegetation-baum.js:2565` `_rollGenome(\`${_saatJe(this)}|cx,cz\`, "landmarke")` — der Wurf liest nur die geladene
  Saat; `_landmarkenDesChunks` fehlt am main (0 Treffer). Die Station (Runde 39, Kopf 99649186): 1 von 51 Adressen.
- Beim Heimholen: der Werfer des Vorgängers nahm ein Bündel `welt` (Lage, Saat, Boden, Land), die Linse, der Playtest und der Kandidat
  bauten die Lage einer fremden Saat je selbst nach (`lageAus` aus der Normalform der Heimat) — vier Zwillinge von main's
  `_gelaende(saat)` (stamm/gelaende-boden.js:837, seit spanne-auge). Und `_gelaende(saat)` selbst brach an jeder fremden Saat für jeden
  Leser über `ortDer`: gelaende-core `lageGrund` trug kein Ort-Gesetz („die Lage trägt kein Ort-Gesetz“, gelaende-core.js:6355).

## Schnitte dieses Kopfs (über K4–K5)

| # | Ursache | Schnitt | Zahl vorher → nachher |
| --- | --- | --- | --- |
| H-1 | Der Werfer nahm ein Bündel der Welt, jeder Leser einer fremden Saat baute es nach (Linse, Playtest, Kandidat). | stamm/vegetation-baum.js `_landmarkenDesChunks(cx, cz, saat)`: die Lage liest er selbst, `_gelaende(saat)` — EINE Quelle der Saat-Lage. Linse scripts/diag-phyto-tree.cjs und Zeuge scripts/playtest/feld-leben.cjs W6.G P3 fragen mit der Saat. | Nachbauten der Saat-Lage 3 → 0 (`lageAus` in Linse, Playtest, Kandidat) · Linse: Saat „-andere“ 4 000 Tafel-Chunks, Bögen 3 (Gesetz 6,3) · Türme 17 (Gesetz 23,0), 20 Chunks anders als die geladene — Zahl für Zahl wie vorher |
| H-2 | `_gelaende(saat)` (main) brach für jede fremde Saat an jedem Leser über `ortDer` (Landmarke, Klima, Schnee, Pegel). | gelaende-core.js `lageGrund`: `ort: ortGesetz(null)` (die Heimat, wie die lebende Lage ohne worldMeta). Byte-sicher: jeder Leser des Ort-Gesetzes im Kern geht über `ortDer` und brach vorher. Linse: ROT beim Namen „_gelaende(saat): … trägt kein Ort-Gesetz“ statt Absturz; Selbsttest mit gepflanzter Lage ohne `ort` → ROT. | Linse am Kern von main: ❌ 2 Verletzungen beim Namen → ✅ |
| H-3 | Der Stations-Kandidat (Zweig `landmarken-station` 2096875d) maß vor K5: Wurf nur im Ring (≤ 275 m), Höhe die größte Hülle. | Kandidat `cloud-post/landmarken-geologie-8-station/` (Diff gegen Zweig `punkte-maschine`): der EINE Werfer je Saat bis `LANDMARKE_FERN_M`, die Höhe je Landmarke aus `_felsHuellBoxen`, der Zeuge liest das Register des Spiels `_landmarkeWurf`. | Adressen 1 → 51 von 51 (1,6 s) · sichtbar 0 → 37 von 51 (Obergrenze 0,725) · 717 Landmarken in 1–3 km, 208 im Kegel, 87 frei · Zeuge 16 Chunks: gleich 2, wartend 14, anders 0 |

| H-4 (Kopf 2) | Batterie an Kopf 1 a85350d0: „URTEIL voll 14/18: ROT — Takt-Wand“. Der Selbsttest T19 (gate:takt) maß im gesunden Gang „fiel 8031 von 4 gesammelten Eimern“: das Register `_landmarkeWurf` trug 7 677 Würfe 3–6 km fern (der Fern-Wurf am Sprung 3 km aus T18, geprüft dort, wo sie standen, während der Gang vom Halt 270 km fern lief), und `zuEnde` hielt an, sobald kein Gang lief — bevor der Gang der neuen Lage begann. | scripts/diag-takt.cjs T19 `zuEnde`: die Tafel ruht erst, wenn ein Ruf keinen Gang mehr beginnt (Gang ohne `nachMs`). Kein Spiel-Code: die Würfe fallen im Spiel mit dem Gang der neuen Lage. | T19 gesunder Gang: fiel 8 031 → 4 von 4 (Soll 4); Selbsttest ✅, Lauf T19 ✅ |

Die Arbeit K4-1 … K5-6 (Wurf als Funktion, `_luftDurchlass`, Felsturm und Felsbogen in ihrer Größe, Kollision mit Öffnung, Fern-Hülle,
Fern-Wurf bis 3 000 m) steht mit Ursache, Schnitt und Zahl im Blatt des Vorgängers (oben); sie kam unverändert über merge-tree.

## Station

`karte2.erleben.spieler.wegfindung#1 · ROT · Station nicht gefahren: GPU` (der GPU-Prozess stirbt in der Wolke). Rumpf headless am Kopf 4
(swiftshader, der Kandidat betritt jede Saat und misst an der Ankunft des Spiels): 51 von 51 Adressen, Obergrenze sichtbarer Landmarke im
ersten Blick in 1–3 km 0,686 → 1,000; Kontrast C₀ ungemessen → L.leser ROT. Der Vor-Richter fährt `wegfindung#1` mit dem Kandidaten.

## Belege am Kopf (lokal, swiftshader)

| Lauf | Exit | Urteil (`probeUrteil`) |
| --- | --- | --- |
| `npm run check:statik` ganz (darin `gate:phyto-core`: „LANDMARKE Fern-Wurf an (0, 0)“ 14 = Gesetz 14, „LANDMARKE IM BILD … gezeichnet“ Turm-Median 22,43 m) | 0 | alle Landmarken-Zeilen ✅, fünf Selbsttests beim Namen |
| `npm run playtest` | 0 | GRÜN — „Alle Invarianten OK“, W6.G P3: der Wurf ist eine Funktion der Saat |
| `gate:kollision-bild` (die Familie der Hülle) | 0 | GRÜN (126 s) |
| `gate:takt` (Kopf 2) | 1 | Selbsttest ✅, T19 ✅; ROT allein T18 „die Rückkehr zeigt denselben Bestand … anders 53 … Täter _saatGeht“ — am main 45bad33f lokal gleich ROT (anders 53), die Batterie am main 45bad33f grün: die Wolken-Umgebung, nicht der Kopf |
| `gate:studio-begehen` | 0 | GRÜN (257 s) |
| `gate:pruefbuehne-licht` | 1 | ROT, am main 45bad33f byte-gleich ROT: „S0 Himmel … Umgebung 1.16e-7, Himmel des Orts 1.07e-7“ und „S0 BILD ROT · Nacht luma 43.5“ — geerbt (welt-licht), nicht geheilt |
| `gate:tag-achse:echt` · `bild:wiese@0.5` | 1 | in der Wolke nicht fahrbar: „DIE WELT HÄNGT … das erste Weltbild fehlt“ (der GPU-Prozess), am main 45bad33f gleich (594 s) — der Richter ist die Radeon |
| `gate:weltbild-frost:echt` (Kopf 3) | 124 | in der Wolke nicht fahrbar: ohne X-Server „Missing X server to start the headful browser“, unter `xvfb-run` 900 s ohne eine Zeile nach „[linse-gpu] google/swiftshader“ — der Richter ist die GPU-Probe |
| `npm run check:statik` ganz (Kopf 4; §9 erklärt `RING_SPIRALE`/`ringSpirale`) | 0 | alle Wände ✅ |
| `npm run playtest` (Kopf 4) | 0 | GRÜN — „Alle Invarianten OK“ |
| `gate:fall-waechter` (Kopf 4; `_ankunft` als Platzierung benannt: das Auge am Stand, die Position nur an der Kamera des Kegels) | 0 | GRÜN |
| `gate:worker-dichte` (Kopf 4; die Spirale des Genesis-Orts aus dem Kern) | 0 | GRÜN |
| `gate:v1-pfad` (Kopf 4; die Rückkehr nach dem Tod liest `_genesisAnkunft`) | 0 | GRÜN |

`format:check` ✅ · `lint` 0 Fehler · `stamm-umzug --nach-karte` 0 Abweichungen · Atlas-Ratsche OK. Der probe-tag-Prüfer
(`artifacts/profiband/werkzeug/zug.sh`) liegt nicht in diesem Container; der Ruf ist gegen den Einlass von `.github/workflows/gpu-probe.yml` geprüft.

## GPU-Probe an Kopf 1 (a85350d0, gtx1050-desktop, Zweig `koordination` probe-post/landmarken-geologie-8/a85350d0.md)

`gate:pruefbuehne-licht` GRÜN 104 s (S0 BILD GRÜN · Nacht luma 43,3) · `gate:tag-achse:echt` GRÜN 276 s (genesis und wiese) ·
`gate:studio-begehen` GRÜN 490 s · `gate:webgl-probe` GRÜN 101 s · `bild:wiese@0.5` ROT 9 s: „listen EADDRINUSE 127.0.0.1:4790 — die
Werkbank endete vor dem Start“ (das verwaiste Schloss `hand-stadt-voll-kopf` des Läufers hielt den Port) — kein Bild; Kopf 2 ruft es erneut.

## GPU-Probe an Kopf 2 (a2e4a3d7, omen-gtx1060, Zweig `koordination` probe-post/landmarken-geologie-8/a2e4a3d7.md)

GRÜN in 1 715 s: `bild:wiese@0.5` GRÜN 48 s · `gate:pruefbuehne-licht` GRÜN 56 s · `gate:tag-achse:echt` GRÜN 127 s · `gate:studio-begehen`
GRÜN 238 s · `gate:webgl-probe` GRÜN 45 s. Kein Stempel (Koordinator 22:43): dem Ruf fehlte `gate:weltbild-frost:echt` (stamm/siedlung-instanz.js
ist berührt), und wegfindung#1 steht bei 0,725 < 0,9.

## Kopf 3 — die 14 Adressen ohne sichtbare Landmarke nach URSACHE (Koordinator 22:43)

Gemessen mit dem Kandidaten (`cloud-post/landmarken-geologie-8-station/`, Diff gegen Zweig `punkte-maschine` 068a8fb3) an der Werkbank,
Wiese −280,4/−1045,6, ego, swiftshader, 51 Adressen in 12,3 s:

| Ursache | Adressen | Täter (Datei:Zeile) |
| --- | --- | --- |
| (a) keine Landmarke im Kegel | 3 (s1-6, s1-17, s1-44; in 1–3 km rundum 11 · 6 · 5) | das Los des Wurfs (Poisson aus der Dichte der Bänder, gelaende-core.js:6376 `landmarke`, stamm/vegetation-baum.js:2654) |
| (b) im Kegel, vom Gelände verdeckt | 11 — an 8 bricht die Gerade in den ersten 10 % des Wegs (≤ 300 m vor dem Auge) | der Grund vor dem Auge: gelaende-core.js:3152 `hoehe` an der Wiese dieser Saaten (9 Adressen mit ≤ 3 % freiem Kegel) |
| (b′) vom Wald verdeckt | ungemessen | die Gerade liest nur den Boden |
| (c) frei, unter der Sicht-Schwelle | 0 | jede freie: Winkel ≥ 2,8 mrad (≈ 2,3 px bei 75° / 1 080), Durchlass ≥ 0,577 |

Die größte Klasse ist (b), ihr Täter der Boden VOR dem Auge, nicht der Ort der Landmarke. Gegenprobe am Wurf-Gesetz (Werkbank, dieselben
51 Adressen): die Landmarke auf dem höchsten Punkt einer Zelle 130 / 260 / 520 / 1 037 m statt 43 m (stamm/vegetation-baum.js:2664) gab
im Los 0,647 / 0,549 / 0,608 / 0,569 — und derselbe Wurf mit anderem Gen-Schlüssel 0,529 statt 0,725: das Los überdeckt die Platzierung.
Als Erwartung (nie als Los) hebt der Kamm den freien Anteil 0,392 → 0,429 / 0,453 / 0,481. Kein Schnitt am Wurf: die Zahl trägt ihn nicht.

DAS UMFANG-GLIED (die Erde, mit Quelle — im Kandidaten je Adresse, Maß `erde_erwartet`): Λ_frei = Σ Dichte des Gesetzes · Fläche über den
freien Zellen 100 m des Kegels in 1–3 km (Boden gelaende-core `hoehe`, Dichte `landmarke`: Sächsische Schweiz 1 134 Gipfel / 363 km²,
Dartmoor 160 Tors / 954 km²), 1 − e^{−Λ_frei}: **die Erde trägt 0,543** (Median 0,61, ≥ 0,9 an 10 von 51) — die Decke, die die Bänder und
der Boden dem Soll 0,9 lassen. Der freie Anteil des Kegels im Mittel 0,394. Vorher = nachher (kein Spiel-Code in Kopf 3): Anteil 0,725.

| Saat | in 1–3 km | im Kegel | sichtbar | Ursache | Bruch (Anteil des Wegs) | frei im Kegel | die Erde trägt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| s1-1 | 22 | 2 | 1 | sichtbar | 0.138 | 0.515 | 0.481 |
| s1-2 | 11 | 2 | 1 | sichtbar | 0.011 | 0.524 | 0.748 |
| s1-3 | 20 | 6 | 2 | sichtbar | 0.019 | 0.419 | 0.844 |
| s1-4 | 13 | 4 | 3 | sichtbar | 0.844 | 0.637 | 0.969 |
| s1-5 | 15 | 3 | 1 | sichtbar | 0.328 | 0.028 | 0.057 |
| s1-6 | 11 | 0 | 0 | keine_im_kegel | — | 0.9 | 0.71 |
| s1-7 | 15 | 6 | 0 | verdeckt | 0.056 | 0.008 | 0.01 |
| s1-8 | 15 | 4 | 4 | sichtbar | — | 0.585 | 0.849 |
| s1-9 | 10 | 5 | 1 | sichtbar | 0.086 | 0.172 | 0.885 |
| s1-10 | 20 | 4 | 1 | sichtbar | 0.038 | 0.437 | 0.643 |
| s1-11 | 29 | 9 | 1 | sichtbar | 0.031 | 0.349 | 0.819 |
| s1-12 | 21 | 5 | 2 | sichtbar | 0.127 | 0.415 | 0.411 |
| s1-13 | 20 | 5 | 5 | sichtbar | — | 0.511 | 0.927 |
| s1-14 | 18 | 6 | 0 | verdeckt | 0.356 | 0.001 | 0.039 |
| s1-15 | 8 | 1 | 1 | sichtbar | — | 0.825 | 0.641 |
| s1-16 | 12 | 2 | 2 | sichtbar | — | 0.596 | 0.594 |
| s1-17 | 6 | 0 | 0 | keine_im_kegel | — | 0.287 | 0.306 |
| s1-18 | 26 | 7 | 2 | sichtbar | 0.662 | 0.772 | 0.902 |
| s1-19 | 13 | 3 | 1 | sichtbar | 0.659 | 0.421 | 0.433 |
| s1-20 | 8 | 5 | 5 | sichtbar | — | 0.655 | 0.943 |
| s1-21 | 7 | 2 | 1 | sichtbar | 0.784 | 0.212 | 0.686 |
| s1-22 | 12 | 5 | 5 | sichtbar | — | 0.636 | 0.977 |
| s1-23 | 9 | 4 | 2 | sichtbar | 0.484 | 0.356 | 0.365 |
| s1-24 | 9 | 2 | 0 | verdeckt | 0.107 | 0.177 | 0.202 |
| s1-25 | 10 | 2 | 2 | sichtbar | — | 0.943 | 0.7 |
| s1-26 | 10 | 2 | 0 | verdeckt | 0.013 | 0.113 | 0.135 |
| s1-27 | 7 | 2 | 2 | sichtbar | — | 0.686 | 0.877 |
| s1-28 | 16 | 7 | 6 | sichtbar | 0.242 | 0.677 | 0.971 |
| s1-29 | 22 | 5 | 1 | sichtbar | 0.018 | 0.376 | 0.416 |
| s1-30 | 5 | 1 | 1 | sichtbar | — | 0.845 | 0.775 |
| s1-31 | 16 | 8 | 7 | sichtbar | 0.65 | 0.596 | 0.993 |
| s1-32 | 15 | 4 | 3 | sichtbar | 0.323 | 0.636 | 0.556 |
| s1-33 | 24 | 9 | 4 | sichtbar | 0.438 | 0.528 | 0.979 |
| s1-34 | 6 | 1 | 1 | sichtbar | — | 0.745 | 0.765 |
| s1-35 | 20 | 5 | 0 | verdeckt | 0.054 | 0.016 | 0.02 |
| s1-36 | 21 | 11 | 0 | verdeckt | 0.05 | 0.001 | 0.009 |
| s1-37 | 12 | 1 | 1 | sichtbar | — | 0.029 | 0.208 |
| s1-38 | 17 | 3 | 1 | sichtbar | 0.035 | 0.255 | 0.277 |
| s1-39 | 16 | 4 | 2 | sichtbar | 0.703 | 0.492 | 0.938 |
| s1-40 | 20 | 7 | 4 | sichtbar | 0.139 | 0.515 | 0.886 |
| s1-41 | 14 | 7 | 0 | verdeckt | 0.011 | 0 | 0 |
| s1-42 | 26 | 16 | 4 | sichtbar | 0.538 | 0.353 | 0.481 |
| s1-43 | 10 | 3 | 1 | sichtbar | 0.072 | 0.167 | 0.323 |
| s1-44 | 5 | 0 | 0 | keine_im_kegel | — | 0.293 | 0.855 |
| s1-45 | 17 | 9 | 4 | sichtbar | 0.749 | 0.62 | 0.998 |
| s1-46 | 5 | 1 | 1 | sichtbar | — | 0.1 | 0.12 |
| s1-47 | 5 | 1 | 0 | verdeckt | 0.1 | 0.007 | 0.008 |
| s1-48 | 12 | 2 | 1 | sichtbar | 0.535 | 0.355 | 0.61 |
| s1-49 | 12 | 3 | 0 | verdeckt | 0.018 | 0.084 | 0.102 |
| s1-50 | 8 | 1 | 0 | verdeckt | 0.013 | 0 | 0 |
| anazh-realm-seed | 16 | 1 | 0 | verdeckt | 0.039 | 0.209 | 0.233 |

## Kopf 3 — abgebrochen

Der Koordinator (27.11. 00:16) brach Probe und Batterie an Kopf 3 (8ed5d4f0) ab: kein Stempel bei 0,725 < 0,9, der nächste Schnitt liegt
am ANKUNFTS-Gesetz. An Kopf 2 stand im Code-Check Persistenz (D) ROT (`wetterWuensche` 5,0 kB gegen 0,3 kB an Kopf 1, derselbe Spiel-Code,
Kopf 1 grün) — ein Ausreißer der Umgebung, kein Täter des Kopfs.

## Kopf 4 — das Gesetz der Ankunft (Koordinator 27.11. 00:16)

BEFUND (Karte ≠ Code, der erste): die Station maß an der Pose der Wiese über dem Boden jeder fremden Saat; das Spiel lässt eine Saat an
der Mitte ihres Genesis-Plans ankommen (`_genesisAnkunft`, stamm/gelaende-boden.js — die erste Ankunft und jede Rückkehr nach dem Tod),
mit Gier 0. Kein Spieler sah den geurteilten Blick. Zweiter Befund: eine frische Welt trägt far = 1 000 m, bis der Fern-Ring steht — ein
Kegel am Boot-far verliert jede Marke in 1–3 km am Ladezustand (am Kandidaten ohne die Weite 0,137).

| # | Ursache | Schnitt | Zahl vorher → nachher |
| --- | --- | --- | --- |
| A-1 | Die Ankunft trug keinen Blick: Mitte, Gier 0, egal was dort steht. | stamm/gelaende-chunks.js `_ankunft(heim)` — EIN Gesetz, zwei Glieder an einer Wurzel: (1) BLICK: trägt der Kegel der Gier 0 keine freie Landmarke der Mittelsicht, blickt die Ankunft auf die TRAGENDE (die freie mit dem größten Winkel Höhe/Weg); (2) ORT: steht an der Heimat keine frei, rückt der Stand auf der Ring-Spirale (Kuppe statt Mulde, über dem Wasser, außerhalb jedes Grundrisses). `_genesisAnkunft` ruft es: Stand, Gier, Neigung 0. | an der Ankunft sichtbar 35 → 51 von 51 (0,686 → 1,000) · Glieder heimat 34 · blick 16 · ort 1 |
| A-2 | Der Genesis-Ort suchte seine Spirale inline im Faden; die Ankunft brauchte dieselbe. | gelaende-core.js `RING_SPIRALE`/`ringSpirale` (12 m bis 240 m, 8 Richtungen) — der voxel-worker `genesisPlan` und `_ankunft` rufen sie (§9 erklärt). | Spiralen 1 inline → 1 im Kern, 2 Leser |
| A-3 | Die Höhe der Gestalt rechnete die Station allein. | stamm/vegetation-baum.js `_landmarkeHoehe` (Hülle × Welt-Skala) — Gesetz und Station lesen sie. | Rechner der Gipfel-Höhe 2 → 1 |
| A-4 | Die Weite der Kamera lebte als Literal im Ring-Takt (`aussen + 500`). | stamm/bild-sicht.js `_weltKameraFern` — der Ring öffnet die Kamera damit, das Gesetz und die Station fragen den Kegel damit. | Kegel des Gesetzes am Boot-far 1 000 m → 8 500 m (die stehende Welt) |

DAS BAND (Profis, mit Zahl — im Gesetz `ANKUNFT_SICHT`, nie eine Schwelle der Station): die Mittelsicht, in der eine Landform als Ziel liest,
beginnt beim 60-fachen der Höhe des herrschenden Baums (Higuchi, „The Visual and Spatial Structure of Landscapes“; die Higuchi-Viewsheds
bei Wheatley & Gillings 2000, „Vision, perception and GIS“: nah bis 60 ×, fern ab 1 100 ×). Der Baum ist der Median der Bestandeshöhen
des Wald-Gesetzes (phyto-core `FOREST_ERTRAG`: 15,55 m → 933 m); sie endet an der Weite des Wurfs (`LANDMARKE_FERN_M` 3 000 m).

DIE URSACHEN-TAFEL (Werkbank swiftshader, dieselbe Sitzung, der Kandidat betritt jede Saat — `cloud-post/landmarken-geologie-8-station/
messung-swiftshader.json`): vorher die alte Ankunft (Mitte, Gier 0), nachher der Kopf. Die 34 Adressen mit Glied „heimat“ sind gleich
geblieben (sichtbar bei Gier 0); es wechseln:

| Saat | vorher (Mitte, Gier 0) | nachher (Glied · Stand x/z · Gier rad · Marke) |
| --- | --- | --- |
| s1-1 | sichtbar 1 401 m | blick · 0/0 · 1,175 · sichtbar 1 126 m (die Kamera des ersten Bilds steht 0,7 m über dem stehenden Auge, an dem das Gesetz urteilt) |
| s1-2 | verdeckt | blick · 0/0 · −2,956 · sichtbar 1 047 m |
| s1-8 | verdeckt | blick · 0/0 · 1,763 · sichtbar 1 142 m |
| s1-11 | verdeckt | blick · 0/0 · −2,203 · sichtbar 1 235 m |
| s1-17 | verdeckt | blick · 12/0 · 1,414 · sichtbar 2 785 m |
| s1-22 | verdeckt | blick · −8/−8 · 3,073 · sichtbar 1 406 m |
| s1-23 | verdeckt | blick · 0/0 · −2,942 · sichtbar 1 473 m |
| s1-25 | verdeckt | ort · 102/−102 · −1,533 · sichtbar 2 612 m |
| s1-29 | verdeckt | blick · 0/0 · 2,967 · sichtbar 1 518 m |
| s1-30 | verdeckt | blick · 0/0 · 2,201 · sichtbar 2 350 m |
| s1-32 | verdeckt | blick · 0/0 · −2,419 · sichtbar 2 935 m |
| s1-38 | verdeckt | blick · 0/0 · 2,021 · sichtbar 1 197 m |
| s1-40 | verdeckt | blick · 0/0 · −1,827 · sichtbar 2 722 m |
| s1-42 | verdeckt | blick · 0/0 · −2,664 · sichtbar 1 479 m |
| s1-44 | verdeckt | blick · 0/0 · −2,920 · sichtbar 1 189 m |
| s1-46 | keine im Kegel | blick · 0/0 · −2,273 · sichtbar 1 809 m |
| s1-47 | verdeckt | blick · 0/0 · 1,610 · sichtbar 2 683 m |

Summe: sichtbar 35 → 51 · verdeckt 15 → 0 · keine im Kegel 1 → 0. Die Stände 8/8, 12/0, −8/−8 der Heimat sind der Genesis-Ort des
Faden-Plans dieser Saaten (die Mitte des Plans, nicht das Gesetz der Ankunft). DIE STANDARD-WELT (anazh-realm-seed): Glied heimat,
0/0, Gier 0, sichtbar 2 049 m — 0 m, 0°. Zeuge der Karte (Stand und Gier, mit denen der Spieler in jeder betretenen Welt ankam, gleich dem
Gesetz): 50 von 50. Die Kosten: `_ankunft` 25–28 ms je Ankunft (einmal je Welt und je Tod), keine je Bild.

DIE ECHTE ANKUNFT (Werkbank, „neue welt saat …“): s1-25 kommt bei 102/−102 an, Gier −1,533 (die Marke 2 612 m), s1-1 bei 0/0, Gier
1,175 — die Position und die Gier, die der Spieler nach `r.erwacht` trägt, gleich dem Gesetz.

## Kopf 5 — der Leser von C₀ und der Deckel (Koordinator 27.11. 02:29)

Probe an Kopf 4 (e25fc8c0, radeon-890m, Zweig `koordination` probe-post/landmarken-geologie-8/e25fc8c0.md): GRÜN. Der Vor-Richter am Gerät:
ROT „C₀ fehlt … Ankunft 51 Adressen … in 36518 ms … Deckel 60 s gerissen: Stille seit 15 s nach 74.3 s“.

| # | Ursache | Schnitt | Zahl vorher → nachher |
| --- | --- | --- | --- |
| C-1 | Das Licht einer Fläche lebte nur als TSL-Knoten (`_weltLicht`); kein Leser auf der CPU konnte die Leuchtdichte der Marke rechnen. | welt-licht.js `flaechenLicht` + `halbraum` mit zwei Sätzen von Rechen-Gliedern (`RECHNEN_TSL` · `RECHNEN_ZAHL`): `_weltLicht` und `_rueckstrahlHalbraum` bauen ihren Knoten aus ihnen, `_weltLichtAn(n, s)` (stamm/bild-sicht.js) rechnet dasselbe auf Zahlen mit denselben Uniforms und dem Himmel der Normale (`_himmelBestrahlungAn`, das Kosinus-Integral über `_skyEnvData`). | Licht-Modelle der Fläche 1 Knoten + 0 Leser → 1 Gesetz, 2 Leser · Zahl = Hand-Rechnung (Δ ≤ 1e-16) |
| C-2 | Die Sonnen-Sicht (Horizont des Gesetzes) gab es nur als Karte auf der GPU. | stamm/dirigent-ankunft.js `_horizontSichtAn(p, l)`: dieselbe Schatten-Höhe, derselbe Marsch und Halbschatten auf der Höhe des Gesetzes. | CPU-Leser 0 → 1 |
| C-3 | Die Albedo der fernen Marke stand nur im Satz des Welt-Marchs. | stamm/studio-bruecke.js `_archFitVon` (der EINE Rumpf des Fits, `_archFoundryZiegel` ruft ihn) · stamm/vegetation-baum.js `_landmarkeFarbe`. | Albedo des Fits am Turm 0,281/0,240/0,151 (Band Fels 0,10–0,30) |
| C-4 | Der Kontrast hatte keinen Leser im Spiel. | stamm/vegetation-baum.js `_landmarkeKontrast(auge, l, hinter)`: Marke und Grund (Himmel über dem Gipfel · Hang dahinter) × Durchlass + Himmels-Sicht × (1 − Durchlass), Y Rec. 709 → Kontrast, C₀. | Mechanik (synthetischer Himmel, danach gelöscht): Kontrast 0,600, C₀ 0,858 |
| D-1 | Nach der letzten Ankunft wuchs die Wiese still ein zweites Mal (die Preis-Pose des Rahmens, EIN `/umstellen`). | Kandidat: S1 zuerst, die Wiese einmal danach; der Puls liest je ≤ 5 s den Stand der Seite neben jedem langen Ruf; die Erde auf 200-m-Zellen; `sek` 45. | S1 (51 Adressen, swiftshader) 39,0 → 29,7 s · Lebenszeichen alle 5,1–5,3 s · Wiese-Wachstum 2 → 1 |

BAND zur Schwelle 0,1: Middleton 1952 (1 000 Beobachter: 0,01 … 0,20), Koschmieder 1924 0,02 (C₀ = −1), WMO 0,05.
BEFUND (Karte ≠ Code): der Zeuge am Gerät (|Kontrast Gesetz − Kontrast Pixel| ≤ 0,03 an ≥ 3 Saaten mit Bild und Maske) stand nur im
Wortlaut der Station; der Kandidat nennt ihn als fehlenden Leser, sobald das Gesetz das Soll trägt.
DIE WOLKE: der GPU-Prozess der Werkbank stürzt am Boot (der Renderer meldet das Gerät verloren) — der Himmel kommt dort nie zurück, der Kandidat urteilt
dann „Kontrast … ungelesen — der Himmel auf der CPU (`_skyEnvData`) ist noch nicht gelesen“. Die Kontrast-Zahl am Gerät liefert die Probe.
WÄNDE: die Liste der Punkte-Maschine (`liste --kopf <dieser Kopf>`) mit dem Kandidaten (Zweig `punkte-maschine` b93a50c5 + diff.txt): 1 976 Stationen,
genau zwei ROT gelaende.K2#1/#2 „Wand HAKEN“ (= Basis); wegfindung#1 „Sitzung ≤ 45 s“. Headless: lint · format · check:statik ganz ·
fall-waechter · v1-pfad · playtest (110 s) RC 0 · gate:betriebsgesetz GRÜN.

## Kopf 5 am Gerät und Kopf 6 (WIP) — der Zeuge als Wegweiser, der Leser des Ziel-Gangs (Koordinator 27.11. 04:40)

Radeon am b32c6773: Ankunft 50 von 50, Kontrast Median 0,461, Leiter 0,75 min, p95 25,16 ms; GPU-Probe GRÜN
(probe-post/landmarken-geologie-8/b32c6773.md im Zweig `koordination`). Kopf 5 bleibt, wie er ist; der Zeuge mit Bild gehört dem Macher
mit GPU, sein Wegweiser steht in `cloud-post/landmarken-geologie-8-station/zeuge.txt` (8f114916, c89df8ee).

| # | Ursache | Schnitt | Zahl vorher → nachher |
| --- | --- | --- | --- |
| Z-1 | Der Kontrast der drei stärksten Saaten stand nirgends (das Gerät nennt nur den Median). | Der WebGL2-Rückfall liest den Himmel auch in der Wolke zurück (23,8 s nach dem Weltbild): `_landmarkeKontrast` je Saat. | s1-4: 0,584 · s1-41: 0,565 · s1-12: 0,520 (12 von 50 gelesen) |
| H-1 | In der Wolke maß S1 an 38 von 50 Saaten vor der Lesung des Himmels der neuen Welt. | Kandidat: LANDMARKE_AN wartet ≤ 3 s auf `_himmelFrisch` (stamm/bild-himmel.js, das Versprechen des Spiels). | gelesen 12 → 50 von 50 · Median 0,431 · ≥ 0,1: 45 von 51 = 0,882 (s1-27 Durchlass 0: Nebel; 5 vor gleich hellem Grund) |
| G-1 | wegfindung#2 hatte keinen Leser des Ziel-Gangs. | WIP: stamm/koerper-bewegung.js `_zielGangBeginn` · `_zielGangSchritt` im EINEN Sim-Schritt, `_landmarkeFuss` (stamm/vegetation-baum.js), die Ankunft beginnt den Gang; der Kandidat geht von der Wiese zu jeder Landmarke in 1 km. | S2 LESER → gemessen: Erfolg 1 (2 von 2), Umweg 1,0000 (Felsturm 519 m und 897 m) |

## Offen (Grund · Messname · Adresse)

1. Der Zeuge am Gerät: kein Bild der Ankunft mit Maske der Marke · S1 LESER „der Zeuge am Gerät … kein Leser“ ·
   `karte2.erleben.spieler.wegfindung#1` (die Sprosse bleibt ROT, auch über dem Soll).
2. Die Kontrast-Zahl am Gerät: die Wolke liest den Himmel nicht zurück · S1 „Kontrast … ungelesen“ · Probe am Gerät.
3. Der Wurf der Wolke hat keinen CPU-Leser: die Marke gilt als unbewölkt besonnt, wo das Gesetz sie besonnt · `_landmarkeKontrast`.
4. Die Sonde des Bilds (PMREM Rauheit 1) gegen das Kosinus-Integral des Lesers: 7 % (ferne.K4) · `_himmelBestrahlungAn`.
5. Wald vor dem Gipfel: die Gerade liest nur den Boden · `karte2.erleben.spieler.wegfindung#1`.
6. Das erste Bild: die Kamera 0,7 m über dem stehenden Auge · s1-1.
7. Das Bogen-Band N = 2 · `gate:phyto-core`.
8. Der Testspieler von wegfindung#2 ist ein Peil-Gänger, kein Mensch (die Sprosse nennt „menschlicher Testspieler“; das Panel R11
   setzt der Schöpfer) · S2 `karte2.erleben.spieler.wegfindung#2`.
9. Die Ankunft wählt die tragende Marke nach dem Winkel Höhe/Weg, nie nach ihrem Kontrast: mit frischem Himmel 6 von 50 Saaten unter
   0,1 (Wolke, WebGL2; Anteil 0,882) · S1 `anteil_landmarke` · stamm/gelaende-chunks.js `_ankunft`.

## Stand 27.11. 06:36 UTC (Wartezimmer 4 h, letzte Post 04:40)

- **Geschnitten:** Kopf 5 b32c6773 — EIN Licht-Gesetz `flaechenLicht` mit zwei Lesern, `_landmarkeKontrast` im Spiel, S1 zuerst mit
  Puls · Wegweiser des Zeugen `cloud-post/landmarken-geologie-8-station/zeuge.txt` · WIP 63d6e65e (Zweig `landmarken-geologie-8-wip`):
  der Leser des Ziel-Gangs (`_zielGangBeginn` · `_zielGangSchritt` im Sim-Schritt, `_landmarkeFuss`), S1 wartet auf `_himmelFrisch`.
- **Gemessen:** Radeon an b32c6773 Ankunft 50/50, Kontrast Median 0,461, Leiter 74,3 → 45 s (0,75 min), p95 25,16 ms · Wolke WebGL2:
  Ziel-Gang an der Wiese 2 von 2, Umweg 1,0000 · S1 mit frischem Himmel gelesen 12 → 50 von 50, Anteil 0,882.
- **Offen:** der Zeuge mit Bild (Bild + Maske, Macher mit GPU; S1 LESER) · die Ankunft wählt nach Winkel, nie nach Kontrast (6 von 50
  unter 0,1; `anteil_landmarke`, stamm/gelaende-chunks.js `_ankunft`) · der Testspieler von #2 ist ein Peil-Gänger (Panel R11; S2) ·
  Offen 3–7 oben.
- **Kopf:** landmarken-geologie-8 c89df8ee (Vorprüfung 5 b32c6773) · WIP 63d6e65e
- **Beanspruchte Sprossen:** `karte2.erleben.spieler.wegfindung#1` · im WIP `karte2.erleben.spieler.wegfindung#2`
- **Karte 2 gebucht:** 137 von 1 718 · **Status:** ZWISCHENSTAND
