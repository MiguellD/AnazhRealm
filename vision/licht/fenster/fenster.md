# FENSTER — die Existenz-Frage, gerechnet gegen SOLL-FENSTER (GTX 1050, 19.11., nur gerechnet)

**Zwischenstand in drei Sätzen.** Geschnitten: je Fall das Fenster des Zustands, in dem sein ganzes Soll hält (k = a ÷ max(Z, L_min),
K1, keine Kappe), und acht Funktionale derselben Sicht mit je eigenem a aus der Eichung — `fenster.cjs`, roh `fenster.roh.out.txt`,
Soll davor 597410d0a. Gemessen: **drei Fenster sind LEER** — Lava nah (Z_min 5,55 > Z_max 3,14 cd/m², 0,82 EV; leer unter allen drei
Schwellen-Sätzen), Herd nah und Herd fern Zeile A (Z_min 0,349 > Z_max 0,247, 0,50 EV; offen nur unter den milden Schwellen, 0,11 EV
breit) — also existiert unter K1 kein globaler Skalar, gleich welches Mittel; und KEINES der acht Funktionale liegt in allen offenen
Fenstern. Offen: der Schluss „Feld" hat einen zweiten Ausgang, den die Rechnung nicht schließt (unten „Was das leere Fenster sagt").

## a) Die Fenster (Z = a_log ÷ k, a_log 0,1399)

| Fall | Z_min (sonst zu hell) | Z_max (sonst zu dunkel) | Breite | streng (k·L 2, Luma 12/18) | mild (k·L 4, Luma 6/9) |
|---|---|---|---|---|---|
| Mittag, Mess-Wiese | 4 160 | 4 370 | 0,07 EV | gleich | gleich |
| Herd nah 3 m | 0,349 (Ring ≤ 3) | 0,247 (Gras 14 m ≥ Luma 8) | **LEER, 0,50 EV** | LEER 1,41 EV | 0,263 … 0,284 (0,11 EV) |
| Herd fern 25 m — A „unter der Schulter" | 0,349 | 0,247 | **LEER, 0,50 EV** | LEER 1,41 EV | 0,263 … 0,284 |
| Herd fern 25 m — B „hell, Farbton gehalten" | 0,0223 (Ring 1,75 m trägt noch Farbe) | 0,247 | 3,47 EV | 0,0223 … 0,198 | 0,0223 … 0,284 |
| Gasse (beide Sichten, gleiche Flecke) | 1,36e-3 (Wände ≤ 3) | 0,0597 (Mondwand ≥ 8, Paare ≥ 2 Code) | 5,46 EV | 2,03e-3 … 0,0481 | 1,01e-3 … 0,0724 |
| Lava nah 3 m | 5,55 (Decke ↔ Saum ≥ 2 Code) | 3,14 (Ufer fern ≥ Luma 8) | **LEER, 0,82 EV** | LEER 1,15 EV | LEER 0,55 EV |
| Vollmond-Wiese 0,1 lx | 5,47e-4 | 0,0112 | 4,36 EV | … 8,81e-3 | … 0,013 |
| Vollmond-Wiese 0,3 lx | 5,47e-4 | 0,0338 | 5,95 EV | … 0,0263 | … 0,0388 |

Flecke (cd/m²): Herd — Ring 3,57 / 3,27 / 1,73, Gras 14 m 0,0351 · Gasse — Mondwand 8,86e-3, Laternen-Wand 8,67e-3 (hellster Kanal
0,0289), Schattenwand 9,89e-4 · Lava — Decke 858, Saum 145, Ufer fern 0,462, Baumlinie 6,93 · Wiese 0,1 lx — 1,95e-3 / 2,61e-3 / 1,72e-3.
Der Verdacht „Gasse leer" trifft NICHT zu: sie ist mit 5,46 EV das weiteste Fenster der Nacht; Gasse und Vollmond reichen unter L_min,
das Datum 0,005 liegt in beiden. Schwelle (Ferwerda 1996) an den Rändern der Gasse: Stäbchen ΔL_s 2,59e-3 (heller Rand) … 0,0456
(dunkler Rand) gegen Mondwand ↔ Schatten ΔL_s 0,0129 — am dunklen Rand des Fensters fällt die Wand unter die Schwelle (×0,28), das
Fenster der WAHRNEHMUNG endet also früher als das der Code-Werte.

## b) Acht Funktionale (Wert F in cd/m² → k_F; eigenes a_F: log 0,1402 · arithm. 0,1426 · p90 0,1773 · Maximum 0,22)

| Fall (Strahler-Anteil) | log-Mittel ohne / mit | arithm. Mittel ohne / mit | p90 ohne / mit | Maximum ohne / mit |
|---|---|---|---|---|
| Mittag (0 %) | 4 280 — im Fenster | 4 350 — im Fenster | 5 410 — im Fenster | 6 710 — im Fenster |
| Herd nah (0,52 %) | 0,135 / 0,140 → k 1,04 / 1,00 | 0,883 / 6,49 → k 0,162 / 0,022 | 2,14 / 2,20 → k 0,083 / 0,081 | 35,2 / 1,00e4 → k 6,3e-3 / 2,2e-5 |
| Herd fern (< 0,01 %) | 0,0121 → k 11,5 | 0,017 / 0,171 → k 8,38 / 0,832 | 0,0226 → k 7,83 | 34,9 / 1,00e4 → k 6,3e-3 / 2,2e-5 |
| … gegen Zeile B (k 0,566 … 6,28) | zu hell 0,88 EV | zu hell 0,42 EV / **im Fenster** | zu hell 0,32 EV | zu dunkel 6,5 / 14,7 EV |
| Gasse r1 (4,59 %) | 3,44e-3 / 3,82e-3 — im Fenster | 8,29e-3 / 0,018 — im Fenster | 0,0317 / 0,0318 — im Fenster | 0,421 / 13,4 — zu dunkel 2,17 / 7,16 EV |
| Gasse längs (4,89 %) | 5,23e-3 / 5,74e-3 — im Fenster | 0,0103 / 0,0222 — im Fenster | 0,0316 / 0,0318 — im Fenster | zu dunkel 2,17 / 7,16 EV |
| Lava (15,83 %) | 0,641 / 1,19 → k 0,219 / 0,118 | 24,2 / 424 → k 5,9e-3 / 3,4e-4 | 62,1 / 281 → k 2,9e-3 / 6,3e-4 | 318 / 3,16e4 → k 6,9e-4 / 7,0e-6 |
| Vollmond 0,1 und 0,3 lx (0 %) | im Fenster | im Fenster | im Fenster | im Fenster |

Herd nah und Lava gegen ihre (leeren) Ränder: am Herd nah müsste k zugleich ≤ 0,401 (Ring) und ≥ 0,566 (Umfeld) sein — das
log-Mittel (1,04) liegt über beiden, arithm. Mittel und p90 (0,16 / 0,08) unter beiden: der Ring trägt, das Umfeld säuft ab. An der Lava
k ≤ 0,0252 und ≥ 0,0445 — das log-Mittel (0,219 / 0,118) über beiden, alle anderen (≤ 5,9e-3) unter beiden.
k_fern ÷ k_nah am Herd: log 11,2 / 11,5 · arithm. 51,8 / 37,9 · p90 94,4 / 97,4 · Maximum 1,01 / 1,00 (trennt nicht).
**Im Fenster von 9 Zeilen:** log, arithm. ohne, p90 je 5 · arithm. mit Strahlern 6 · Maximum 3. Kein Funktional über 6.

## c) Urteil

**Unter K1 existiert kein globaler Skalar, der alle Fälle trägt — gleich welches Mittel:** die Lava hat ein leeres Fenster unter
jedem der drei Schwellen-Sätze (0,55–1,15 EV), der Herd nah unter Basis und streng (er kippt erst unter den milden Schwellen auf
0,11 EV Breite). Herd fern: Zeile A ist leer wie nah; Zeile B ist offen (3,47 EV), getroffen nur vom arithmetischen Mittel MIT Strahlern.

## Was das leere Fenster sagt — und was nicht

Das Fenster ist leer, wenn die Spanne der Welt zwischen „oben noch unterscheidbar" und „unten noch sichtbar" größer ist als die
Spanne der Kurve: Lava Saum 145 ↔ Ufer fern 0,462 cd/m² = 8,3 Stufen, plus die Decke darüber; Herd Ring 3,57 ↔ Gras 14 m 0,0351 =
6,7 Stufen bei Ring ≤ 3. Damit hat der Schluss **zwei** Ausgänge, nicht einen:
1. der Zustand ist ein FELD (Anpassung je Ort) — der Verdacht des Koordinators; oder
2. EIN Skalar mit einer Kurve, die mehr Spanne trägt als K1 (längere Schulter / tieferer Fuß) — dann ist nicht das Auge, sondern die
   Kurve das fehlende Stück.
Die Rechnung trennt die zwei nicht; das Auge trennt sie (der Quellen-Zensus: lokal ↔ global, Radius). Ein drittes: fällt an der Lava
das Soll „Ufer fern ≥ Luma 8" (das Schwarz hinter dem Feuer BLEIBT, Entscheid 18.11.), ist ihr Fenster offen ab Z ≥ 5,55 — dann
bleibt nur der Herd, und der hängt an der Wahl der Schwelle. Das ist Entscheid, nicht Rechnung.

## Am Text gelesen (für den Quellen-Zensus; beide Stellen aus EINER Sekundär-Quelle)

Krawczyk, G.: *Perception-inspired Tone Mapping*, Dissertation, MPI Informatik / Universität des Saarlandes 2007
(`people.mpi-inf.mpg.de/alumni/d4/2014/krawczyk/phd/krawczyk07phd_final.pdf`):
- **§ 4.2.2, Gl. (4.5)–(4.6):** exponentieller Nachlauf nach Durand & Dorsey 2000; τ_rods = 0,4 s, τ_cones = 0,1 s — ausdrücklich
  für die Anpassung ZUM HELLEN; „the adaptation to dark is not simulated because the full process takes up to tens of minutes".
  Für den Schwenk vom Feuer WEG (zum Dunklen, Zapfen-Ast) steht dort also KEINE Sekunden-Zahl — τ Zapfen zum Dunklen bleibt ungeprüft.
- **§ 3.1.5:** neurale Prozesse „mostly accomplished after several seconds"; Sonne → Dunkel bis 30 min, umgekehrt etwa 5 min.
- **§ 4.3.1, Gl. (4.11):** a(Ȳ) = 1,03 − 2 ÷ (2 + log10(Ȳ + 1)) — eine unvollständige Kompensation, vom Autor selbst als empirisch
  gesetzt bezeichnet („no scientifically based experimental data … a matter of experience"). Benannt, keine Zahl gesetzt, nichts baut darauf.
Dieselbe Gl. (τ 0,4 / 0,1 s) steht in Myszkowski, Mantiuk, Krawczyk: *High Dynamic Range Video*, 2008, Gl. (6.9).
Die Primär-Quelle (Durand & Dorsey 2000) habe ich nicht am Text gelesen.

## Nicht gerechnet

Neumond · der Stäbchen-Schritt · ein Feld (kein Modell gebaut) · eine andere Kurve als K1 · Kosten am GPU.
