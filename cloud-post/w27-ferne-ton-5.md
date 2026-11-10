## 10.11. 11:56 — w27-ferne-ton-5: ZWISCHENSTAND 529cf20c auf z364 (Gelände-Studio GRÜN, S0 Nacht ROT mit Täter beim Namen)

Keine Abgabe: S0 steht am Kopf ROT, eine Abgabe führe in z wieder rot. main 900c28e6 ist im Kopf (unverändert seit 55080b33).

- **Geschnitten — der Schnee liegt über der Narbe.** `_bodenFarbeAt` (stamm/gelaende-boden.js) und sein Faden-Spiegel `bodenFarbe` (voxel-worker.js) legen den Schnee als letzte Decke über Wiese und Weg. Sie geben die Narbe aus: die Wache smoothstep(0, 0,6, Deckung) läuft EINMAL, mal (1 − Schnee).
  - gelaende-core `bodenKarte` (der Parameter `wache` fiel), das Boden-Fragment (`_green`) und über die Karte Halm und Haftung lesen die Narbe linear.
  - Bis hier fiel der Schnee VOR der Wiese, und jeder Leser schloss die Deckung unter ihm. 61 % Schnee über 39 % Deckung trugen so 81 % Halm, und das Mittel des Halms lag über dem Schnee.
  - Die Karte des Makro-Workers war kein Zwilling: ihr Schnee ist der des Kerns (je Zelle gemessen: Welt 0,63 = Karte 0,63). Der Ton der alten Wache verbarg den Fehler, weil das Blau des Schnees g − (r+b)/2 unter null senkte.
- **Gemessen (swiftshader, Chrome 148).**
  - `gate:gelaende-studio`: Karte ohne Welt 174 → 0, Welt ohne Karte 0 → 0, Welt-Schnee 3 536 → 3 767 Zellen, STUDIO-PROBE GRÜN.
  - Die 174 Zellen trugen Schnee 0,61–0,76 bei Deckung 0,16–0,37 und Luminanz 0,25–0,50, unter der Schwelle 0,6 × 0,859.
  - Ebenso GRÜN: check · playtest voll (126 s) · playtest:fast · welt-boot · Werk im Wasser · post-kette · ego-schatten (kein [ERROR] STOFF außer der Injektion) · Luft-Linse 8 km 0,03–2,22°.
- **Befund S0 — das Licht ist main-gleich, der Täter ist die Spitze des Halms aus dem Spektrum.**
  - Mein Kopf auf swiftshader trifft die Zahlen der Radeon: Nacht Luma 11,5, abgesoffen 34,4 %, Feuer 24,9°. Himmel 0,2881 und Sternen-Licht 0,0948 sind gleich main.
  - Je Datei auf main zurückgesetzt bleibt S0 ROT: `_einmalRender` (bild-kosten) 11,5 · Schichten der Wege-Karte 11,7 · Moos und Glanz aus 11,5 · Halm-Relief halb 10,4 · Bestand der Ferne zurück 12,1.
  - Allein die alte Spitze `GRAS_SPITZE` (0,172/0,349/0,046) hebt den Kopf: Luma 22,0, abgesoffen 6,1 % (die Mulden, `_mikroStoff`), Feuer-Farbton wieder im Band.
  - Die Gegenprobe: **main 900c28e6 mit NUR der Spitze aus dem Spektrum** (HALM_FARBE.spitze 0,0795/0,1343/0,0317, PROSPECT-D unter D65; w26-ferne-ton-2 58b780c4) fällt genauso — Luma 24,1 → 12,7, abgesoffen 0,6 → 28,7 %, Feuer 30,5 → 23,6°.
  - Der Grund: am Feuer ist der Boden das Relief der Nähe aus Wurzel (= Spitze × 0,6) und Spitze. Die Spitze von main war 2,6 × das gemessene Blatt (Grün 0,349); mit dem Blatt liegt das Relief beim Bestand der Ferne (Grün ~0,06 gegen 0,049), und die Kamera der Nacht trägt die gemessene Wiese auf Luma ~12.
  - Der Farbton: mit dem Auge des Tages misst der Kopf das Licht des Feuers netto bei 34,7° (im Band). Erst das Auge der Nacht zieht ihn auf der dunkleren Wiese unter 28°.
- **Ehrlich offen.** S0 (`gate:pruefbuehne-licht`): Luma ≥ 22 und Feuer ≥ 28° hielten an main mit einer Wiese 2,6 × heller als ihr Blatt.
  - Zurück zur alten Spitze schneide ich nicht: sie wäre ein Zwilling des Kerns (`GRAS_SPITZE` ≠ `HALM_FARBE.spitze`, emitGrass liest das Blatt) und hält die Nacht dennoch nicht (6,1 % > 5 %).
  - Der Schnitt, der die gemessene Wiese nachts lesbar trägt, liegt in der Kamera der Nacht (licht.K1, `_belichtungAusLicht`, REF spec/farbe/tag-ref.json −2,17 EV) — eine fremde Domäne mit eigener Wand (Tag-Achse).
  - Ich brauche von dir: das Maß der Nacht für die gemessene Wiese, oder den Zuruf, die Kamera der Nacht zu schneiden. Danach Abgabe mit `[gpu-probe: gate:pruefbuehne-licht, gate:luft-tiefe:echt, bild:wiese@0.5]`.
- FUND: stamm/gelaende-boden.js `_bodenFarbeAt` · der Schnee fiel vor der Wiese, die Wache schloss die Deckung unter ihm in vier Lesern (Farbe, Karte, Fragment, Haftung): Wiese und Halm im Schnee · Sage-a-tue-a · M
- FUND: stamm/daten.js `GRAS_SPITZE` · mit dem Blatt aus dem Spektrum trägt der Boden am Feuer nachts Luma 11,5–12,7 (Soll ≥ 22, main 24,1 mit der Spitze 2,6 × des Blatts) · Licht der Nacht · M

## 10.11. 11:13 Koordinator — z364: dein Zweig ist Täter zweier Wände (S0 Nacht, Gelände-Studio)
Dein Kopf 790ed766 fuhr in z364 (mit ort-pose, studio-mesh, fenster-wand; Lauf 42791038600, beide Versuche rot). Gemessen auf der Radeon 890M an deinem Kopf ALLEIN, main 900c28e6 an denselben Gates GRÜN:
- **`npm run gate:pruefbuehne-licht` (echt-Job, Prüfbühne S0):** main „S0 BILD GRÜN … Nacht {luma 24.1, schwarz 0.007}“ → dein Kopf „⛔ S0 Nacht: der Boden 1–3 m ohne das Feuer um Mitternacht trägt Luma 11.5, abgesoffen 34.4 % (Soll ≥ 22 und ≤ 5.0 %, die Nacht der EINEN Licht-Kette) — der Himmel trägt Licht (Sternen-Licht 0.0948, Umgebung 0.2879), das Bild schwärzt es“ und „⛔ S0 Bild: das Licht des Feuers trägt den Boden 1–3 m im Farbton 24.9° (Soll 28–45°)“.
- **`npm run gate:gelaende-studio` (voll 5/18):** main „STUDIO-PROBE GRÜN“ → dein Kopf „⛔ die Karte zeigt anderen Schnee als die Welt: 174 Zellen Schnee ohne Welt, 0 Zellen Welt-Schnee ohne Karte (von 3536) — makro-worker faerbe ≠ schnee des Kerns“.
Bitte: `git merge origin/main` (900c28e6 oder neuer), beide Wände an der Wurzel heilen (die Nacht bekommt das Licht des Himmels zurück; die Karte des Makro-Workers liest den Schnee des Kerns, kein Zwilling), beide Gates am Kopf GRÜN (S0 auf echter GPU per Probe), dann neue Abgabe mit `[gpu-probe: gate:pruefbuehne-licht, gate:luft-tiefe:echt, bild:wiese@0.5]`.

# Post an w27-ferne-ton-5

## 10.11. 09:15 — GPU-PROBE 790ed766 auf omen-gtx1060 + radeon-890m (Band-Gerät): GRÜN in 333 s (gate:luft-tiefe:echt GRÜN 79 s auf omen-gtx1060 · bild:wiese@0.5 GRÜN 47 s auf omen-gtx1060 · zeit:gate:luft-tiefe:echt GRÜN 84 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/790ed766.md

## 10.11. 09:10 — w27-ferne-ton-5: ABGABE 790ed7660709ff8543de205fa71686e2b26438d9

ABGABE 790ed7660709ff8543de205fa71686e2b26438d9 — Abgabe w27-ferne-ton-5 (main 900c28e6 im Kopf; ersetzt 80bcd308, deren fünf Punkte unverändert stehen). Der EINE Schnitt auf Zuruf des Koordinators (10.11. 07:55): ferne.K1#2 an der Radeon.

- **Geschnitten.** Der Einmal-Render außerhalb des Vorbaus (stamm/bild-kosten.js:924 `_einmalRender`) ist nur noch ganz, wenn kein Draw auf eine Pipeline wartete, die ein Takt asynchron begann; der Draw einer fremden Szene, der dort nicht zeichnen konnte, zählt wie im Vorbau (`einmalOffen`, stamm/bild-kosten.js:579). Bis hier galt er dort stets als ganz: die Radeon übersetzt die Pipeline der Mehrfachstreuung 1 040 ms (OMEN 67 ms) — ein Leser außerhalb des Takts traf sie im Bau, der Draw fiel aus, und `_atmoTakt` setzte die Tafeln frisch über einer leeren Ψ_ms; die Himmels-Sicht trug nur die einfache Streuung bis zum nächsten Medium. Die Linse: gate:luft-tiefe liest Durchlass und Ψ_ms zurück und nennt eine Tafel ohne Bild (`K1-2 TAFEL Mehrfachstreuung: n Texel ohne Bild`); Mutanten „leere Ψ_ms“ und „ungelesene Tafel“ ROT, ohne die Prüfung beide GRÜN.
- **Gemessen.**
  - Radeon 638183fb (Diagnose): Ψ_ms 0:0:0:0 (Alpha 0) bei stehender Pipeline (`da`, 1 Nutzer, keine GPU-Meldung, keine Absage); nach EINEM Neuzeichnen 0,03516/0,03891/0,04367 — bit-gleich mit GTX und swiftshader.
  - ferne.K1#2 Radeon: 638183fb ROT (Farbton 8 km 162–171°, Himmel 0,1287/0,1182/0,1066 grau, Kante 3,3 %) → 48b576d2 LUFT GRÜN, alle vier Stufen, Farbton 0,04–2,75°. GTX 1050 0,03–2,71°, swiftshader 0,11–2,46°.
  - bild:wiese@0.5 GTX 1050 Luma 43,8, angesehen: Wiese in Sonne und Schatten, Bäume, Himmel blau zwischen dem Laub.
  - Lokal am Kopf GRÜN (Chrome 148 wie die CI): check · playtest:fast · welt-boot · post-kette und ego-schatten (kein [ERROR] STOFF außer der Injektion des Selbsttests) · Fernwald (957 Bäume) · Werk im Wasser · luft-tiefe.
  - Wachstum (Merge-Basis integ-probe): Prüf +234 / Spiel +3 281 Atome, erlaubt 1 640; werkbank.cjs ohne neue Zeile, die Diagnose fiel.
- **Probe der Abgabe 790ed766: GRÜN.** OMEN GTX 1060 gate:luft-tiefe:echt LUFT GRÜN, Farbton 8 km 0,03–2,71° (vorher main 78d37554 13,77°); Radeon zeit:gate:luft-tiefe:echt LUFT GRÜN 0,05–2,75°; bild:wiese@0.5 OMEN Luma 43,8. Der Punkt „OMEN am Kopf ungeprobt“ fällt.
- **Ehrlich offen.**
  - Die anderen Leser außerhalb des Takts (Prüfbühne `_himmelFrisch`, Aufnahme, Wasser-Linse) lesen jetzt false statt einer leeren Tafel, solange ihre Pipeline übersetzt — auf echter GPU nur an der Luft-Linse gemessen.
  - `_horizontHimmel` (stamm/dirigent-ankunft.js) blieb unberührt; ich brauche dort nichts.
- FUND: stamm/bild-kosten.js:924 `_einmalRender` · außerhalb des Vorbaus galt jeder Einmal-Render als ganz, auch wenn sein Draw auf die Pipeline eines Takts wartete (Radeon: Ψ_ms leer, Himmel grau, ferne.K1#2 ROT an main und Zweig) · fail-soft · M
- FUND: welt-licht.js `passMehrfach` · die Übersetzung der Ψ_ms (Schleife 64 × 20 mit Durchlass je Schritt) dauert auf der Radeon 1 040 ms, OMEN 67 ms · Ankunft B · S
- Die Besten: Unreal PSO-Precaching (ein Draw, dessen PSO noch übersetzt, wird übersprungen und als solcher gezählt, nie als gezeichnet); Hillaire 2020 (die Tafeln der Luft sind eine Kette — der Leser von Ψ_ms liest nur eine bestätigte Tafel).

## 10.11. 08:56 — GPU-PROBE 48b576d2 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 451 s (gate:luft-tiefe:echt GRÜN 140 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 93 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt GRÜN 72 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/48b576d2.md

## 10.11. 08:43 — GPU-PROBE 638183fb auf omen-gtx1060 + radeon-890m (Band-Gerät): ROT in 286 s (gate:luft-tiefe:echt GRÜN 75 s auf omen-gtx1060 · zeit:gate:luft-tiefe:echt ROT 98 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/638183fb.md

## 10.11. 08:35 — GPU-PROBE 37324a09 auf gtx1050-desktop + omen-gtx1060 (Band-Gerät): GRÜN in 185 s (gate:luft-tiefe:echt GRÜN 141 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt GRÜN 78 s auf omen-gtx1060 (Band-Gerät)) → probe-post/w27-ferne-ton-5/37324a09.md

## 10.11. 08:26 — GPU-PROBE aa646657 auf omen-gtx1060 + radeon-890m (Band-Gerät): ROT in 601 s (gate:luft-tiefe:echt GRÜN 79 s auf omen-gtx1060 · zeit:gate:luft-tiefe:echt ROT 103 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/aa646657.md

## 10.11. 08:14 — GPU-PROBE ed5eeb7f auf radeon-890m + omen-gtx1060 (Band-Gerät): ROT in 594 s (gate:luft-tiefe:echt ROT 113 s auf radeon-890m · zeit:gate:luft-tiefe:echt GRÜN 83 s auf omen-gtx1060 (Band-Gerät)) → probe-post/w27-ferne-ton-5/ed5eeb7f.md

## 10.11. 03:03 — GPU-PROBE ef2bac5a auf radeon-890m (Band-Gerät): ROT in 500 s (zeit:gate:luft-tiefe:echt ROT 101 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/ef2bac5a.md

## 10.11. 02:28 — GPU-PROBE 80bcd308 auf radeon-890m: ROT in 367 s (gate:luft-tiefe:echt ROT 85 s auf radeon-890m · bild:wiese@0.5 GRÜN 67 s auf radeon-890m) → probe-post/w27-ferne-ton-5/80bcd308.md

ABGABE 80bcd3089d038480f1988b8794799c473ae94f36

Hinter der Abgabe lag ein Diagnose-WIP (ef2bac5a), der Kopf des Zweigs trägt wieder genau den Baum von 80bcd308 (die Abgabe bleibt 80bcd308). Befund auf der Radeon: die Horizont-Karte ist aktiv und gemalt, der Schuss β 1 mit ruhender Karte ist bit-gleich grau (0,1279/0,118/0,1059) — der Luftschatten (`luftSicht`) ist NICHT der Täter; die graue In-Streuung kommt aus der Himmels-Sicht selbst (`himmelFarbe`, stamm/bild-himmel.js), auf swiftshader blau 0,2515/0,2584/0,2672.

## 10.11. 02:24 — w27-ferne-ton-5: ABGABE 80bcd3089d038480f1988b8794799c473ae94f36

ABGABE 80bcd3089d038480f1988b8794799c473ae94f36 — Abgabe w27-ferne-ton-5 (Zweig von w26-ferne-ton-4, main 20a01782 im Kopf). Die fünf offenen Punkte des Vorgängers fallen ganz.

- **Geschnitten.**
  1. Werk im Wasser A: der Strand ist ein Stoff — die Zeile `sand` der Stoff-Tafel (stamm/bau-vorlagen.js:1624, Rad 0,25/0,35 nach Peurifoy, η 0,3, Korn 0,4 mm für das Schritt-Gesetz aus main), der EINE Leser `_strandAt` (stamm/gelaende-boden.js:2481; Farbe, Deckung, `_fahrHaft`, `_kontaktStoffAt` lesen ihn). Dazu die Wurzel unter dem Wasser: die Narbe endet am Spiegel (stamm/gelaende-boden.js:2441, voxel-worker.js:3113) — der Seegrund in 1 m trug die Deckung des nassen Grunds (Grün 0,6–0,8), das Rad bremste dort wie auf Gras.
  2. DECKE: scripts/ +1 474 → −21 Atome, ohne Ausnahme-Liste: der Spiegel-Band des Playtests (Faden ↔ Haupt-Faden) je Feld aus EINER Tafel (−1 027, er trägt jetzt den Stoff), der Selbsttest von gate:weg-boden aus EINER Tafel, die Ufer-Probe baut über `_attachVoxelFieldColors` statt einer eigenen Schleife, der tote Ring-Griff in diag-stand-takt. werkbank.cjs 3 975 Zeilen.
  3. K7 und 4. K10 hatten EINE Wurzel: die Holz-Wahl der Welt ohne Bild fragte den WebGL2-Rückfall des Browsers (Chromium 153 reicht unter --disable-gpu swiftshader → kienspan, Ring 2; Chrome 148 der CI keinen → voll, Ring 4). Der Null-Renderer fragt kein Gerät (stamm/dirigent-regler.js:496); Linse: JEDES-HOLZ im Playtest (Mutante „fragt das Gerät“ ROT, Gegenprobe kienspan).
  5. Das Boden-Fragment liest den Stoff des Grunds, nie die Albedo: EIN Feld je Vertex (Deckung · Nässe) vom Faden über den Satz (`aStoff` snorm8x4) bis ins Fragment (stamm/stoff-material.js:2813), unter den Schichten der Wege-Karte (`_wegeBodenFarbe` `aus.stoff`, stamm/siedlung-wege.js:772); Halm-Relief, Moos und Glanz sind Relief der Nähe. Die 4 B zahlt die Ziel-Farbe des Geomorphs (gamma8, unorm8x4 mit √c): der Boden-Satz bleibt 48 B je Vertex. `gruenSchwelle` und `mossDamp*` fallen (gate:altlasten).
- **Gemessen.**
  - ferne.K1#2 (gate:luft-tiefe:echt, GTX 1050, 78b11fb7): LUFT GRÜN, Farbton 8 km 0,03–2,71° (Uhr 0,5: 2,57 · 2,51 · 2,06 · 1,23°) — vorher main auf derselben Karte K1-2 ROT (6b7d389a, FARBTON nur durch `offen` verborgen), GTX 1060 an da0e790f 1,38–13,77°. swiftshader 0,11–2,46°.
  - Wand A: der Wagen taucht 1,41 → 1,14 m (Dach 1,20; main 1,13), vA 8,94 → 6,84 m/s.
  - K7: 459 → 1 906 Büschel, 40 → 980 Pflanzen neben dem Rand-Streifen (Selbsttests „wiese“ und „ring“ wieder sehend). K10: 8 → 178 Proben.
  - Spiegel Faden ↔ Haupt-Faden: Lage, Normale, Index, Farbe, Stoff, Karte je 0 Stellen. Ufer-Parität 2 411 Ecken, 0 abweichend.
  - Bild wiese@0,5 GTX 1050 Luma 44,1 (vorher 43,9), kein Rückfall gesehen.
  - Lokal am Kopf GRÜN (Chrome 148 wie die CI): check · lint · format · playtest voll · playtest:fast · welt-boot · Fernwald · Werk im Wasser · Körper-Stand · Wasser-Leben · weg-boden · chunk-satz · asset-contract · post-kette und ego-schatten (kein [ERROR] STOFF).
- **Ehrlich offen.**
  - Die Probe der Abgabe 80bcd308 lief auf der Radeon: ROT mit genau den Zahlen von main (6b7d389a, Vorher am main-Baum) — K1-2 ist auf der
    GTX 1050 GRÜN an 78b11fb7 (derselbe Baum vor den Merges mit main fbbeb318 und 20a01782; sie berühren die Luft nicht).
  - ferne.K1#2 auf der Radeon ROT, an main identisch (6b7d389a): HIMMEL „nicht blau“ 0,1287/0,1182/0,1066, JE KANAL Uhr 0,27 ungemessen, KANTE 2,15 %. Der Horizont trägt die In-Streuung ohne die einfache Streuung der Sonne — der Luftschatten ist widerlegt (ef2bac5a); die Station der Radeon (Sitzung) maß an 87537d3f nur FARBTON. Nicht geschnitten.
- FUND: stamm/bild-himmel.js `himmelFarbe` (die Himmels-Sicht der Atmosphäre) · auf der Radeon im Weg `--eigen` grau-warm am Horizont (0,128/0,118/0,106), die Horizont-Karte widerlegt (ef2bac5a) · ferne.K1#2 Radeon (HIMMEL, JE KANAL, KANTE, FARBTON) · M
- FUND: scripts/lib/welt-boot.cjs Rezept `null` · lokale Linsen fahren Chromium 153 (PUPPETEER_EXECUTABLE_PATH), die CI Chrome 148 — andere Welt ohne Bild bis zu dieser Abgabe · Linsen-Parität · S
- Die Besten: Unreal Landscape (die Layer-Weight-Map trägt das Physical Material, Haftung und Klang lesen die Schicht, nie die Textur); Frostbite Terrain (Schicht-Gewichte als Vertex-Kanal neben der Farbe).

## 10.11. 01:26 — GPU-PROBE 78b11fb7 auf gtx1050-desktop: GRÜN in 528 s (gate:luft-tiefe:echt GRÜN 160 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 112 s auf gtx1050-desktop) → probe-post/w27-ferne-ton-5/78b11fb7.md

## 10.11. 01:15 — GPU-PROBE 5f49c06a auf gtx1050-desktop + radeon-890m (Band-Gerät): ROT in 545 s (gate:luft-tiefe:echt ROT 164 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 110 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt ROT 65 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/5f49c06a.md

## 10.11. 01:04 — GPU-PROBE c56ce6f9 auf radeon-890m + radeon-890m (Band-Gerät): ROT in 1849 s (gate:luft-tiefe:echt ROT 81 s auf radeon-890m · bild:wiese@0.5 GRÜN 50 s auf radeon-890m · zeit:gate:luft-tiefe:echt ROT 73 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/c56ce6f9.md

## 10.11. 00:57 — GPU-PROBE 6b7d389a auf gtx1050-desktop + radeon-890m (Band-Gerät): ROT in 1724 s (gate:luft-tiefe:echt GRÜN 173 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt ROT 88 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/6b7d389a.md

## 10.11. 00:26 — GPU-PROBE 00fdd106 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 577 s (bild:wiese@0.5 GRÜN 114 s auf gtx1050-desktop · gate:pruefbuehne GRÜN 249 s auf gtx1050-desktop · zeit:gate:tag-achse:echt GRÜN 114 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/00fdd106.md

## 10.11. 00:19 — GPU-PROBE 536c1aac auf keinem Läufer: ABGEWIESEN in 137 s („zeit:gate:luft-tiefe:echt“: kein npm-Skript in package.json) → probe-post/w27-ferne-ton-5/536c1aac.md

## 10.11. 00:12 — GPU-PROBE 53e59239 auf radeon-890m + radeon-890m (Band-Gerät): ROT in 759 s (gate:luft-tiefe:echt ROT 87 s auf radeon-890m · bild:wiese@0.5 GRÜN 62 s auf radeon-890m · zeit:gate:luft-tiefe:echt ROT 106 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/53e59239.md
