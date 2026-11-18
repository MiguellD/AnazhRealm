# SPIKE — 100 Häuser gegen das Gesetz (entscheid.md §5) · main 18058dba, nur gelesen

Gelesen ganz: entscheid.md, entwurf-stoff-statik.md, entwurf-mensch-nutzung.md, die acht Lese-Blätter a–h. An der Quelle (Kopie des
Kerns) nachgelesen: fachwerk-core.js (FC) :155–224 (Default-Block), :253–392 (NORM, Flur `fw`, Treppe, STAIR), :416–495 (Achse, Balkenlage,
wallSpec), :584–630 (Herd, Raumteilung), :895–932 (Innenwände, Türen, Herd), :1784–1813 (Export `dims`), :2118–2276 (KULTUR, BAU_NUTZUNG,
bauRezept, bauProgramm), :3605–3632 (REGION_HIST, EPOCHEN), :4303–4517 (STADT_GRAMMATIK, DORF), :9519–9538 (LEUTE_GESETZ), :12300–12518
(Export). Lade-Muster: scripts/lib/welt-boot.cjs:556–572 (`ENGINE_THREE`, `studioKern`).

## Ergebnis in drei Sätzen

Geschnitten wurde nichts: der Spike baut die 100 Adressen einmal mit dem heutigen Kern und einmal mit dem Gesetz als Prototyp, beide
durch den ECHTEN `HAUS` (Kopie). Gemessen: heute trägt kein Balken (0/100, Bruch 99/100; 0 von 1 691 Wohnhäusern), das Gesetz trägt
jede Spannweite (94/94, 2–4 Schiffe) und kostet je Rezept 1,6–1,8 µs statt 0,7–0,8 µs, je Bau gleich viel (72–105 ms gegen 73–109 ms);
aber **drei der fünf Behauptungen fallen**: 1 (Ständerreihe trifft Treppe/Tür/schmalen Raum in 64 % selbst bei bester Lage), 3 (Traufe-Spanne
2,67 m < 2,82 m; Köpfe 5,62 > 5,50) und 4 (jede Stadt der frühen Neuzeit: Lose 92–96 % der Mauerfläche), 5 fällt am Köpfe-Teil (×1,81 > ×1,7).
Ehrlich offen: das Gesetz rechnet ohne sechs Schließungen des Spikes kein Haus (S1–S6 unten), Behauptung 1b (≥ 20 Bauaufnahmen) ist
offline NICHT PRÜFBAR, und nach §5 des Entscheids fallen damit die Schiffigkeit als Gesetz und die Umkehr Haus ← Mensch in ihrer jetzigen Form.

## (0) METHODE

- **Kern:** Kopie von fachwerk-core.js, three.module.min.js, three.core.min.js nach p3/n1811/bau-spike/kern/ (Original unberührt); geladen wie die
  Linsen (`lade.cjs`: three r184 als globales THREE, ColorManagement aus, dann der Kern als Skript → `__fachwerkCore`). Kein Browser, kein GPU.
- **Pläne:** G = 30 Pläne `DORF({seed 1–30, nH 90})` (dieselben wie entscheid.md Kopf) · E = 9 EPOCHEN × Saat 1–2 · K = 10 Weiler nH 12 ·
  F = 20 Großstädte 1500–1728 über `DP.erbe` (FC:4414) nur für Behauptung 4 (der Würfel `jahr = 880 + 680u`, FC:4412, trifft die frühe Neuzeit
  in G nur zweimal).
- **Gleichheit der Waage:** am G-Satz reproduziert der Spike die Ausgangszahlen des Entscheids Zahl für Zahl: 1 691 Wohnhäuser, Spearman(Breite,
  wohl) 0,09, Breite Q10/Q50/Q90 7/10/14 m, Traufe Q10/Q90 3,10/7,80 m, 3,11 Leute je Wohnhaus.
- **Adresse:** je Los i der Gründungs-Folge Rang t = i/(N−1), Baujahr, Kultur kn und Haus-Same hs aus dem Export; u aus dem heutigen
  `wohl = (1,22 − 0,5t)(0,78 + 0,44u)` zurückgerechnet (FC:4438) — dieselbe Ziehung, kein neuer Zufall.
- **Die 100:** geschichtet G 42 · E 40 · K 18, je nach Baujahr gleich verteilt; erzwungen die Gegenbeispiele ärmstes Haus, größtes Gewerbe,
  früheste Epoche, schmalstes Los (heute), höchste Traufe (Gesetz), meiste Köpfe in Klasse arm. Epochen: < 1300 34 · 1300–1499 28 ·
  1500–1799 29 · ≥ 1800 9. 94 Haushalts-Lose, 6 Sonderbauten (rathaus 2, burg, kirche, turm, halle — bleiben benannte Maß-Zeilen, entscheid §2).
- **Prototyp** (gesetz-proto.cjs): alle 40 Einträge von BAU_GESETZ wörtlich aus entscheid §1.1, die drei Holz-Zeilen aus Entwurf A §1.1, die
  Funktionen §1.2 (kreuzholz, vierkant, balkenSpann, schiffe, geschossH, schneeLast, deckungVon, neigung, losVon, mauerRadius, haushalt,
  raumProgramm, tragwerk). **Selbsttest B1 grün:** kreuzholz(0,258) = 0,1490 × 0,2107; balkenSpann(0,15 × 0,21, e 1,7) = 3,643 m (∈ 3,5–3,9);
  geschossH(1650, 0,211) = 2,471 m.
- **SPIKE-SCHLIESSUNGEN** — was der Entscheid nicht festlegt, ohne das aber kein Haus entsteht (jede ist ein Befund, ERSTER PUNKT 3–6):
  - S1 Balkenabstand e: BAU_GESETZ trägt kein e. Gesetzt 0,85 m (Entwurf A gesetz.cjs) → L_max 4,59 m; bei e 1,70 (heutiges Raster) 3,65 m.
  - S2 Stamm-Durchmesser: nur Eiche 0,258 m benannt; der Ort ist für alle die Heimat (Eiche, s_k 1,51). Kein Ort-Wechsel geprüft.
  - S3 GEWERBE: 4 von 11 Zeilen stehen in Entwurf B (tagelöhner, bäcker, kaufmann, ackerbürger); schmied, wirt, gerber, weber, brauer, krämer,
    geistlich sind Annahmen des Spikes (Gesinde 1–4, Räume 12–40 m²). GEWERBE_ANTEIL als Werte in Bs Spannen (Stadt: handel 0,05 ·
    lebensmittel 0,10 · handwerk 0,45 · acker 0,10 · unter 0,30; Dorf: 0,03/0,05/0,12/0,50/0,30); Lage-Regel: zuerst die Lose des Viertels
    (markt · handwerk), dann nach q.
  - S4 Geschosse: der Entscheid lässt Packer, capK, capL, F0, Mindestfuß und W/D-Klammer fallen (§2 D1) und nennt keinen Ersatz für die Wahl
    von st bei F = W·D·st. Gesetzt: W = b (das Los gibt die Breite), st = das kleinste, dessen Tiefe ≤ dZiel 11 m (Bs geliehenes dMax); passt
    schon das EG nicht, bleibt D > 11 (`EG>11`). Gegenrechnung mit dZiel 9 und 14 unten.
  - S5 Kammern: arm 1, sonst ⌈Köpfe/2⌉ (B rechnet 1/3/6 ohne Formel).
  - S6 Klasse: `klasse: [0.5, 0.9]` als Rang-Quantil von q im Plan (50/40/10 %). Wörtlich q < 0,5 | < 0,9 gäbe 51/47/2 % — q = (1 − t + u)/2
    ist dreieck-verteilt, „reich“ träfe 2 von 100 Häusern.
- **Raumteilung:** das Gesetz schreibt keine (B4 „Raumteilung aus den Räumen des Programms“ ist ungeschrieben). Räume, Treppe, Türen und Kamin
  kommen darum für BEIDE Seiten aus dem heutigen HAUS (FC:253–392, 584–630, 897–932), gebaut mit den Maßen des Gesetzes (W, D, st, egH =
  ogH = geschossH, foundH 0,30, Balken 0,149 × 0,211). Behauptung 1 prüft also das Gesetz gegen den Innenausbau, den es heute erben würde.

## (1) HEUTE — 100 Häuser aus dem Samen

- **Bauen sie?** 100/100 bauen (HAUS MASSNUR, kein Wurf). 30 Pläne G: 2 886 Häuser, 1 691 Wohnhäuser.
- **Spannweite:** der Deckenbalken 0,15 × 0,21 (FC:179) liegt auf jedem Ständer (FC:466–470), e = Einzugsbreite im Raster 1,31–1,63 m (Q10/Q90),
  und spannt die volle Tiefe D (Q10/Q50/Q90 5,5/7,5/10 m). L_max (Gesetzes-Statik, Eiche D30) Q50 3,88 m; D/L_max Q10/Q50/Q90 1,38/1,90/2,50.
- **Tragen sie?** 0/100 tragen. 99/100 **reißen** (D > L_Biegung, nicht nur Durchbiegung); 100/100 über L_max. An allen Wohnhäusern G:
  0/1 691 tragen, 1 641 reißen (97 %, D30), 1 677 (99 %) als Nadelholz C24. Das bestätigt Entwurf A §2 an der Zahl.
- **Wie stark unterscheiden sie sich** (die 94 Haushalts-Lose, Q10/Q50/Q90 · Variationskoeffizient · Q90/Q10):

| Maß | heute | Gesetz | sichtbar |
|---|---|---|---|
| Breite m | 7 / 9 / 13,85 · 0,26 · 1,98 | 5 / 7,5 / 15 · 0,44 · 3,00 | MEHR |
| Tiefe m | 5,5 / 7,5 / 9,5 · 0,19 · 1,73 | 8,15 / 9,5 / 12,35 · 0,18 · 1,52 | gleich (tiefer) |
| Traufe m | 3,81 / 5,45 / 7,80 · 0,51 · 2,05 | 2,57 / 4,84 / 5,24 · 0,29 · 2,04 | WENIGER |
| Geschosse | 1,3 / 2 / 3 · 0,61 | 1 / 2 / 2 · 0,31 | WENIGER |
| Dachneigung ° | 18 / 45,5 / 59 · 0,38 | 14 / 44,5 / 58,7 · 0,42 | etwas mehr |
| Fenster-Anteil der Fassade | 0,04 / 0,07 / 0,14 · 0,52 | 0,04 / 0,05 / 0,06 · 0,20 | WENIGER |
| Leute / Köpfe | 2 / 3 / 5 · 0,56 | 4 / 6 / 7,5 · 0,22 | WENIGER (mehr Köpfe) |
| verschiedene Paletten | 24 | 23 (Heimat-Ort: holz/stamm/gefach/stein/lehm = Ort) | gleich |

  Heute: Fenster-Anteil aus den gebauten Öffnungen (`windows`, FC:1789–1796) je Fassadenfläche; Gesetz: `fensterFuer` = lichtAnteil(Jahr) ×
  Netto-Fläche (entscheid §1.2) je Fassadenfläche. Paletten: Gesetz ersetzt die Stoff-Farben durch den Ort (stoffTon), Anstrich/Ziegel/Putz
  bleiben (entscheid §2 „bleibt“); an EINEM Ort fällt nur eine Palette.

## (2) NACH DEM GESETZ — dieselben 100 Adressen

- **Bauen sie?** 94/94 Haushalts-Lose bauen durch HAUS; 0 Würfe. Die 6 Sonderbauten bleiben heute.
- **Trägt jede Spannweite?** ja, 94/94 spann ≤ L_max (4,59 m) — das ist Konstruktion (`schiffe` = ⌈D/L_max⌉), keine Prüfung. Schiffe 1/2/3/4:
  0/23/69/2 — **kein** Haus bleibt einschiffig, weil das Programm die Tiefe auf ≥ 8 m treibt (G: D Q10 8 m). Der Unterzug selbst (Kreuzholz
  0,149 × 0,211, Ständer im Raster ≤ 1,7 m, Einzug = spann ≤ 4,5 m) trägt bis 2,64 m (nachgerechnet, nicht im Skript).
- **Unterscheiden sie sich mehr oder weniger?** Tabelle oben: MEHR in der Breite (Q90/Q10 3,00 gegen 1,98 — die drei Los-Breiten 5/7,5/15),
  WENIGER in Höhe, Geschossen, Fenstern und Köpfen. Die Stadt wird flach: Geschosse Q90 2 (heute 3), weil `form` nur so viele Geschosse
  nimmt, wie das Programm braucht; der Stadtkörper (FC:4440–4445, `erbe.hoch` FC:4491–4495) hat im Gesetz keine Zeile. Der Wohnturm
  (FC:2199, 6 × 6 × 6) wird ein Krämer auf 15 × 10 × 1 (#42), der Glasturm von 1963 (13 G.) ein Wirtshaus mit 3 Geschossen (#98).
- **Was kostet eines** (process.hrtime):
  - Rezept je Haus (400 Häuser × 200, warm, zwei Läufe): heute `bauRezept(null)` 0,66–0,78 µs, mit Haushalt (Packer) 1,02–1,10 µs;
    Gesetz-Prototyp 1,60–1,79 µs, mit dem bleibenden Kultur-Wurf 1,95–2,31 µs.
  - Bau je Haus (HAUS, MASSNUR, über die 100, drei Läufe): heute 75,4 · 73,5 · 109,2 ms; Gesetz 73,1 · 72,1 · 105,3 ms (Verhältnis 0,96–0,97;
    die Maschine misst nebenher, die Streuung zwischen Läufen ist größer als der Unterschied). Unterzug, Ständerreihe und Mittelpfette baut
    der heutige HAUS nicht — ihr Preis (+ < 1 % Dreiecke, entscheid §3) ist darin nicht enthalten.
  - DORF nH 90 heute 0,395–0,440 ms (30 Pläne × 5, warm) → mit Gesetz ≤ 0,53–0,60 ms (+87 Haushalte × Gesetz-µs, die fallenden Würfel nicht
    abgezogen). Der Entscheid nennt 4,02 µs und 2,26 ms (preis2.cjs, nicht vorliegend) — andere Messart; heute und Gesetz sind hier gleich gemessen.

## (3) FALSIFIKATION — je Behauptung aus §5

| # | Behauptung (Schwelle) | Zahl | Urteil |
|---|---|---|---|
| 1a | Ständerreihe durch Treppe, Tür oder Raum < 1,8 m in ≤ 10 % der Häuser | gleich geteilt 93/94 (99 %: Treppe 80 · Tür 69 · Raum 32); **beste Lage** im Spiel der Spannweite (Raster 0,05 m) 60/94 = **64 %** (Treppe 40 · Tür 27 · Raum 32); nur auf Querwänden: 71/94 ohne Folge ≤ L_max, Konflikt 93/94; Unterzug über dem Treppenloch gleich 87/94 | **WIDERLEGT** (64 % > 10 %) |
| 1b | ≥ 20 Bauaufnahmen: Tiefe je Schiff ≤ 1,3·L_max, Geschosshöhe − Balkenhöhe 1,9–2,6 m in ≥ 80 % | keine Bauaufnahme offline lesbar; am eigenen Ergebnis: geschossH − h = licht + diele = 2,06/2,26/2,66/2,46 m, außerhalb 1,9–2,6 nur 1800–1899 (2,66), 3/94 | **NICHT PRÜFBAR** (eigene Häuser 3 % außerhalb) |
| 2 | ≤ 10 % der Lose W < 4,5 oder st > Kultur-st + 2; Traufe ≤ 2·D | G (2 595 Haushalts-Lose): W < 4,5 **0** · st > Kultur-st + 2 **0** · Traufe > 2D **0** (heute 0/1 691) | **HÄLT** — W < 4,5 ist unmöglich (losVon ≥ 5 m), st hängt an S4; unter S4 verlangen 20,9 % ein EG tiefer als 11 m (bis 16,5 m), mit dZiel 9 43 %, mit 14 0,6 % |
| 3a | Spearman(Breite, Wohlstand) ≥ 0,6 | 0,89 gegen q, **1,00** gegen wohl (heute 0,09) | **HÄLT — zirkulär**: Breite = 15/[3,2,1][Klasse], wohl = [0,44; 1; 1,8][Klasse] |
| 3b | Breite Q90/Q10 ≥ 2,0 | 15/5 = **3,00** (heute 14/7 = 2,00) | **HÄLT** (Konstruktion) |
| 3c | Traufe Q90 − Q10 ≥ 60 % von 4,70 = 2,82 m | 5,24 − 2,57 = **2,67 m** (dZiel 9: 0,40 m; dZiel 14: 2,67 m) | **WIDERLEGT** |
| 3d | Köpfe je Wohnhaus 4,75 ± 0,75 | **5,62** (nur Kern ohne Gesinde 4,30) | **WIDERLEGT** (knapp, hängt an S3) |
| 4 | Σ Los-Fläche der Mauer-Epoche ≤ 0,8 × Ringfläche in ≥ 90 % der städtischen Pläne | städtisch vor 1750: **22/52 = 42 %** über 0,8; dichte 150 (vor 1500): 0/30, Anteil Q50 0,56; dichte 250 (1500–1749): **22/22**, Anteil 0,92–0,96; allein G: 2/30 | **WIDERLEGT** (jede Stadt der frühen Neuzeit) |
| 5a | bauRezept mit Gesetz ≤ 20 µs | 1,60–2,31 µs | **HÄLT** |
| 5b | DORF nH 90 ≤ 3,5 ms | 0,40–0,44 → ≤ 0,53–0,60 ms | **HÄLT** |
| 5c | Köpfe ≤ ×1,7 | 5,62 / 3,11 = **×1,81** (nur Kern ×1,38) | **WIDERLEGT** (knapp, hängt an S3) |

**Warum, an der Quelle:**
- 1a: die Treppe läuft LÄNGS der Tiefe im Flur (Lauf ≤ D − 1,9, FC:362; Schacht `STAIR` FC:385–389) und belegt 3,5–4,5 m der Tiefe; jede
  Ständerreihe quer zur Tiefe kreuzt sie, sobald die Felder ≤ L_max bleiben müssen. Die Flurwände stehen bei ±fw (FC:261) und tragen je Raum
  eine Tür (FC:913–915), die Räume schneiden auf dem 1,7-m-Raster (FC:609–613) — keine dieser Linien kennt einen Unterzug. Gegenprobe: ein
  Unterzug in der Mitte des HEUTIGEN Baus träfe 98/100. Der Konflikt liegt im Innenausbau, den das Gesetz erbt, nicht in der Statik.
- 3c: `form` nimmt das kleinste st, das trägt — die Höhe folgt nur dem Programm, das Programm braucht nie mehr als 2–3 Geschosse; was heute
  die Höhe streut (Kultur-st, Stadtkörper, +1 Geschoss FC:4440–4445), fällt (entscheid §2 D1) ohne Erben.
- 4: der Anteil ist eine Formel, keine Stichprobe: Ø Los 210 m² (0,5·5 + 0,4·7,5 + 0,1·15) × 30 m) × dichte / (Ø Köpfe 5,63 × 10⁴) =
  0,56 bei 150 E/ha, 0,93 bei 250 E/ha. Mit weniger Köpfen (nur Kern) wird es schlimmer (1,22). Hofstätte 15 × 30 m und Dichte 250 E/ha
  (beide „unsicher“, §1.1) passen nicht zusammen.

**Folgen nach §5 des Entscheids (wörtlich dort festgelegt):** „Fällt 1, fällt die Schiffigkeit als Gesetz (nicht die Zahl)“ — 1a ist gefallen
gegen den Innenausbau des heutigen HAUS. „Fällt 3, fällt die Umkehr Haus ← Mensch, und das Gesetz wird neu geschrieben, nicht nachgeregelt“ —
3c und 3d sind gefallen. Eine Bau-Welle nach §4 hat damit keine Grundlage.

## (4) GEGENBEISPIELE UND UNSINN — beim Namen

Gesucht: das ärmste Haus, das größte Gewerbe, die früheste Epoche, das schmalste Los, die höchste Traufe, die meisten Köpfe in Klasse arm.

| Gegenbeispiel | Adresse | heute | Gesetz | Unsinn |
|---|---|---|---|---|
| ärmstes | E-antike-2#25, antik 130, griechisch | Wohnhaus 8,5 × 6,5 × 2 | Ackerbürger arm, 6 Köpfe, Los 5 → 5 × 12 × 2, 3 Schiffe à 4,0 | 2 Räume ohne Tür, 4 Räume < 0,9 m, EG > 11 m; Stall im antiken Stadthaus |
| größtes Gewerbe | G2#1, mediterran 1552, italienisch | Gasthaus 15 × 8,5 × 3 | Wirt mittel, 7,5 K, Los 7,5 → 7,5 × 12,5 × 3 | Ständer in Treppe, Tür und Raum < 1,8 auch bei bester Lage; das Gasthaus am Markt wird halb so breit |
| früheste Epoche | G29#1, antik −104, römisch | Gasthaus 15 × 10,5 × 2 | Wirt, Einraum-Herd (vor 1300), 7,5 × 11 × 3 | wie oben; römische Domus mit Herdraum statt Atrium |
| schmalstes Los | G12#83, alpin 1158, Holzhütte | 5 × 4,5 × 1 | Ackerbürger arm → 5 × 12 × 2 | Raum ohne Tür, 6 Räume < 0,9 m, EG > 11 m |
| höchste Traufe | E-moderne-1#1, 1963, modern | Glas-Gasthaus 15 × 11 × 13, Traufe 28,95 | Wirt 7,5 × 12,5 × 3, Traufe 8,31 | **Haushalt ohne Herd** (Stil glas, FC:919); 13 Geschosse werden 3 |
| meiste Köpfe arm | G2#8, mediterran 1581 | Kaufhaus 8,5 × 10 × 3 | Brauer arm, 8 Köpfe, Los 5 → **5 × 15 × 2**, 4 Schiffe | Haus 3 : 1 tief, 2 Räume ohne Tür, 5 Räume < 0,9 m |

Zählung an den 94 (heute an den 100):
- **Raum ohne Tür:** Gesetz 30 Häuser, heute 8. Alle 30 auf 5-m-Losen: bei W = 5 liegt der Herd (x = ±(W/2 − 0,645), FC:592) näher als 0,85 m
  an der Flurwand ±fw, das Kaminfeld nimmt die Tür (FC:906–907).
- **Raum schmaler als 0,9 m:** Gesetz 38 Häuser, heute 1. Der Seitenstreifen ist W/2 − 0,12 − fw; fw ≥ 1,96 m bei zwei Treppenspuren (FC:259–261)
  → 0,42 m bei W = 5 — der Raum ist schmaler als ein Mensch.
- **Haushalt ohne Herd:** 4 — G20#74 (barock, Kuppel), E-moderne-2#25, E-moderne-1#34, E-moderne-1#1 (Stil modern/glas): HAUS baut keinen Herd
  (FC:919), das Programm hat einen.
- **Spannweite über dem Maß:** Gesetz 0; heute 100/100.
- **Haus größer als sein Los:** 0 (W = b, D ≤ 16,5 < 30). Aber EG tiefer als 11 m: 26/94 (G 20,9 %): Ackerbürger, Gerber, Schmied, Brauer arm
  auf 5 m, Wirt mittel auf 7,5 m.
- **Spike-eigener Unsinn (an S3/S6, nicht am Entscheid):** reicher Tagelöhner 3 (K8#4, K10#2, K9#2 — im Weiler bleibt nach der Quote nur
  „unter“); Ackerbürger in der Glasstadt 1979 (E-moderne-1#34) — der Entscheid hat kein Programm der Moderne (B §5 Mietshaus).
- **Dorf als Zeile (Vermutung, nicht gebaut):** W = b gibt im Weiler Häuser ohne Abstand; heute hält das Dorf `gap` 2,5 m (FC:3649), das als
  `b − W` fällt (entscheid §2 D6).

## (5) DIE 100 — verdichtet

Spalten: HEUTE W × D × st · Traufe m · Leute · D/L_max; GESETZ Gewerbe/Klasse (0 arm · 1 mittel · 2 reich) · Köpfe · Los-Breite b; GESETZ
W × D × st · Traufe · Schiffe × Spannweite; Ständer-Konflikt gleich geteilt / beste Lage (T Treppe · Ü Tür · R Raum < 1,8 · – keiner);
Unsinn (o.Tür = Raum ohne Tür · < 0,9 = Raum schmaler 0,9 m · o.Herd · EG>11 = EG tiefer als dZiel). Sortiert nach Baujahr.

| # | Adresse | Jahr | Region · Kultur | Rolle heute | HEUTE W×D×st · Traufe · Leute · D/L_max | GESETZ Gewerbe/Kl · Köpfe · Los b | GESETZ W×D×st · Traufe · Schiffe×Spann | Ständer-Konflikt gleich/best | Unsinn |
|---|---|---|---|---|---|---|---|---|---|
| 1 | G29#1 **fruehesteEpoche** | -104 | antik · roemisch | gasthaus | 15×10,5×2 · 5,45 · 5 · 2,76 | Wirt/1 · 7,5 · 7,5 | 7,5×11×3 · 7,11 · 3×3,67 | TÜR / TR | EG>11 |
| 2 | G29#35 | -79 | antik · griechisch | wohnhaus | 8×7,5×3 · 7,8 · 3 · 1,89 | Web/1 · 5,5 · 7,5 | 7,5×7×2 · 4,84 · 2×3,5 | T / T | – |
| 3 | K8#4 | -46 | antik · griechisch | wohnhaus | 10,5×7,5×2 · 5,45 · 2 · 2,01 | Tagl/2 · 5 · 15 | 15×5,5×1 · 2,57 · 2×2,75 | Ü / – | – |
| 4 | G8#30 | -43 | antik · roemisch | wohnhaus | 15×9,5×2 · 5,45 · 5 · 2,5 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | TÜ / TÜ | – |
| 5 | K8#13 | -16 | antik · griechisch | wohnhaus | 8×7,5×2 · 5,45 · 2 · 1,98 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 8×<0,9 EG>11 |
| 6 | G21#4 | 32 | antik · roemisch | wohnhaus | 15×9,5×2 · 5,45 · 4 · 2,5 | Wirt/2 · 8 · 15 | 15×9×2 · 4,84 · 2×4,5 | TÜ / TÜ | – |
| 7 | E-antike-1#3 | 75 | antik · griechisch | wohnhaus | 10×7,5×3 · 7,8 · 3 · 1,98 | Kräm/2 · 6 · 15 | 15×8,5×1 · 2,57 · 2×4,25 | Ü / Ü | – |
| 8 | G21#62 | 91 | antik · roemisch | wohnhaus | 13,5×10,5×1 · 3,1 · 3 · 2,81 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | Ü / – | – |
| 9 | E-antike-2#2 | 92 | antik · griechisch | wohnhaus | 9,5×7×3 · 7,8 · 3 · 1,8 | Bäck/2 · 8 · 15 | 15×11×1 · 2,57 · 3×3,67 | – / – | – |
| 10 | E-antike-2#6 | 105 | antik · griechisch | wohnhaus | 8×7,5×3 · 7,8 · 3 · 1,89 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | TÜ / TÜ | – |
| 11 | E-antike-1#16 | 120 | antik · griechisch | wohnhaus | 9×6,5×3 · 7,8 · 3 · 1,63 | Web/1 · 5,5 · 7,5 | 7,5×7×2 · 4,84 · 2×3,5 | TÜ / T | – |
| 12 | E-antike-2#25 **aermstes** | 130 | antik · griechisch | wohnhaus | 8,5×6,5×2 · 5,45 · 2 · 1,63 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | T / – | 2×o.Tür 4×<0,9 EG>11 |
| 13 | E-antike-2#22 | 144 | antik · griechisch | wohnhaus | 9,5×6,5×2 · 5,45 · 3 · 1,76 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | Ü / – | 1×o.Tür |
| 14 | G16#58 | 233 | antik · griechisch | wohnhaus | 9×7×2 · 5,45 · 2 · 1,85 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | Ü / – | – |
| 15 | G12#7 | 943 | alpin · holzhuette | kaufhaus | 7,5×10×3 · 7,8 · 4 · 2,51 | Wirt/0 · 7 · 5 | 5×16,5×2 · 4,84 · 4×4,13 | TÜ / – | 6×<0,9 EG>11 |
| 16 | G22#6 | 1007 | mitte · mittelalterlich | kaufhaus | 7×10×3 · 7,8 · 4 · 2,59 | Brau/1 · 8,5 · 7,5 | 7,5×10×2 · 4,84 · 3×3,33 | TÜR / R | – |
| 17 | G15#4 | 1048 | medit · italienisch | rathaus | 13×10×3 · 7,8 · 7 · 2,64 | — | — | — | Sonderbau |
| 18 | K1#1 | 1084 | mitte · mittelalterlich | gasthaus | 11×7×2 · 5,45 · 3 · 1,76 | Wirt/1 · 7,5 · 7,5 | 7,5×11×3 · 7,11 · 3×3,67 | TÜR / TÜR | EG>11 |
| 19 | G22#23 | 1093 | mitte · mittelalterlich | wohnturm | 6×6×6 · 14,85 · 4 · 1,51 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | ÜR / ÜR | – |
| 20 | G18#28 | 1115 | nordi · russisch | wohnhaus | 8×7,5×2 · 5,45 · 2 · 1,89 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | ÜR / ÜR | – |
| 21 | G18#67 | 1134 | nordi · russisch | wohnhaus | 8×7×2 · 5,45 · 2 · 1,76 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | ÜR / ÜR | – |
| 22 | K5#7 | 1139 | ferno · japanisch | wohnhaus | 14×8×1 · 3,1 · 2 · 2,17 | Acker/1 · 6,5 · 7,5 | 7,5×8×2 · 4,84 · 2×4 | TÜR / ÜR | – |
| 23 | G28#4 | 1156 | medit · provenzalisch | rathaus | 13×10×3 · 7,8 · 6 · 2,64 | — | — | — | Sonderbau |
| 24 | G12#83 **schmalstesLosHeute** | 1158 | alpin · holzhuette | wohnhaus | 5×4,5×1 · 3,1 · 1 · 1,19 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 1×o.Tür 6×<0,9 EG>11 |
| 25 | G1#56 | 1170 | mitte · mittelalterlich | werkstatt | 8×5,5×2 · 5,45 · 2 · 1,38 | Gerb/0 · 5 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 2×o.Tür 5×<0,9 EG>11 |
| 26 | G25#16 | 1194 | alpin · holzhuette | wohnhaus | 6,5×5,5×2 · 5,45 · 1 · 1,38 | Schmied/1 · 6,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | ÜR / ÜR | – |
| 27 | K4#1 | 1224 | alpin · holzhuette | gasthaus | 9,5×6,5×2 · 5,45 · 2 · 1,67 | Wirt/1 · 7,5 · 7,5 | 7,5×11×3 · 7,11 · 3×3,67 | TÜR / TÜR | EG>11 |
| 28 | G22#84 | 1233 | mitte · mittelalterlich | wohnhaus | 7,5×5,5×2 · 5,45 · 2 · 1,38 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 1×o.Tür 5×<0,9 EG>11 |
| 29 | K7#6 | 1252 | medit · italienisch | wohnhaus | 14×8×2 · 5,45 · 4 · 2,17 | Acker/1 · 6,5 · 7,5 | 7,5×8×2 · 4,84 · 2×4 | T / T | – |
| 30 | G7#40 | 1254 | medit · provenzalisch | patrizierhaus | 10,5×8,5×3 · 7,8 · 4 · 2,31 | Web/1 · 5,5 · 7,5 | 7,5×7×2 · 4,84 · 2×3,5 | TÜ / T | – |
| 31 | G22#68 | 1273 | mitte · mittelalterlich | wohnhaus | 7,5×5,5×2 · 5,45 · 2 · 1,38 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 32 | K7#13 | 1278 | medit · provenzalisch | wohnhaus | 10,5×9×2 · 5,45 · 4 · 2,44 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 1×o.Tür 7×<0,9 EG>11 |
| 33 | G26#47 | 1286 | ferno · chinesisch | wohnhaus | 13,5×9,5×2 · 5,45 · 5 · 2,54 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 34 | G3#94 | 1298 | mitte · gotisch | burg | 14×11×3 · 7,8 · 7 · 2,98 | — | — | — | Sonderbau |
| 35 | E-fernost-2#4 | 1302 | ferno · chinesisch | wohnhaus | 13,5×8,5×1 · 3,1 · 2 · 2,27 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 36 | G17#56 | 1308 | alpin · holzhuette | werkstatt | 6,5×5,5×2 · 5,45 · 1 · 1,38 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / ÜR | – |
| 37 | G5#73 | 1331 | ferno · japanisch | wohnhaus | 12,5×8×2 · 5,45 · 3 · 2,07 | Web/1 · 5,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | R / R | – |
| 38 | E-hanse-1#2 | 1334 | mitte · mittelalterlich | wohnhaus | 7×6×3 · 7,8 · 2 · 1,55 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 39 | E-hanse-1#3 | 1347 | mitte · mittelalterlich | wohnhaus | 7×7×3 · 7,8 · 2 · 1,81 | Wirt/2 · 8 · 15 | 15×9×2 · 4,84 · 2×4,5 | Ü / Ü | – |
| 40 | E-moderne-2#2 | 1357 | mitte · alemannisch | wohnhaus | 8×9×3 · 7,8 · 3 · 2,26 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / ÜR | – |
| 41 | K10#2 | 1358 | nordi · norwegisch | wohnhaus | 10,5×6,5×2 · 5,45 · 2 · 1,76 | Tagl/2 · 5 · 15 | 15×7,5×1 · 2,57 · 2×3,75 | T / T | – |
| 42 | G27#21 | 1361 | mitte · fraenkisch | wohnturm | 6×6×6 · 14,85 · 3 · 1,51 | Kräm/2 · 6 · 15 | 15×10×1 · 2,57 · 3×3,33 | TÜ / – | – |
| 43 | E-mittelalter-1#5 | 1366 | mitte · tudor | wohnhaus | 6,5×6,5×3 · 7,8 · 2 · 1,63 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 44 | G27#68 | 1378 | mitte · fraenkisch | wohnhaus | 12,5×7×3 · 7,8 · 5 · 1,81 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / TR | – |
| 45 | E-fernost-2#7 | 1378 | ferno · japanisch | wohnhaus | 14,5×9×1 · 3,1 · 2 · 2,47 | Acker/2 · 7 · 15 | 15×6×2 · 4,84 · 2×3 | TÜ / T | – |
| 46 | E-barock-1#8 | 1385 | mitte · mittelalterlich | wohnhaus | 7,5×6×3 · 7,8 · 2 · 1,51 | Gerb/2 · 6 · 15 | 15×10,5×1 · 2,57 · 3×3,5 | TÜ / – | – |
| 47 | E-moderne-2#5 | 1387 | mitte · fraenkisch | wohnhaus | 9,5×7×3 · 7,8 · 3 · 1,8 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / TR | – |
| 48 | E-mittelalter-2#6 | 1393 | mitte · tudor | wohnhaus | 6×6,5×3 · 7,8 · 2 · 1,63 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / R | – |
| 49 | G10#37 | 1397 | nordi · norwegisch | patrizierhaus | 10×7×3 · 7,8 · 3 · 1,85 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / ÜR | – |
| 50 | E-hanse-1#11 | 1398 | mitte · tudor | wohnhaus | 9×5×3 · 7,8 · 2 · 1,26 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / R | – |
| 51 | K3#4 | 1401 | mitte · alemannisch | wohnhaus | 9,5×9×2 · 5,45 · 3 · 2,31 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 52 | E-hanse-2#8 | 1404 | mitte · alemannisch | wohnhaus | 9×8,5×3 · 7,8 · 4 · 2,14 | Brau/2 · 9 · 15 | 15×7×2 · 4,84 · 2×3,5 | TÜ / T | – |
| 53 | E-moderne-2#9 | 1409 | mitte · fraenkisch | wohnhaus | 9,5×6×3 · 7,8 · 3 · 1,54 | Web/1 · 5,5 · 7,5 | 7,5×9×2 · 4,84 · 2×4,5 | ÜR / ÜR | – |
| 54 | G3#40 | 1419 | mitte · alemannisch | wohnhaus | 8,5×9,5×3 · 7,8 · 4 · 2,39 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 4,84 · 3×3,5 | TÜR / TR | – |
| 55 | K4#4 | 1440 | alpin · russisch | wohnhaus | 7,5×7,5×1 · 3,1 · 1 · 1,98 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,57 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 56 | G3#53 | 1443 | mitte · mittelalterlich | werkstatt | 8×5,5×2 · 5,45 · 2 · 1,38 | Gerb/0 · 5 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 1×o.Tür 5×<0,9 EG>11 |
| 57 | E-hanse-1#12 | 1444 | mitte · tudor | wohnhaus | 7×6×3 · 7,8 · 2 · 1,55 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / TR | – |
| 58 | G30#10 | 1459 | alpin · russisch | wohnhaus | 8,5×7×2 · 5,45 · 2 · 1,76 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / ÜR | – |
| 59 | K4#7 | 1460 | alpin · russisch | wohnhaus | 9×8×1 · 3,1 · 1 · 2,11 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / ÜR | – |
| 60 | K10#12 | 1474 | nordi · norwegisch | wohnhaus | 9×7×2 · 5,45 · 2 · 1,76 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 4,84 · 3×3,17 | TÜR / TR | – |
| 61 | G11#87 | 1476 | mitte · mittelalterlich | wohnhaus | 7×6×2 · 5,45 · 2 · 1,55 | Acker/0 · 6 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 2×o.Tür 6×<0,9 EG>11 |
| 62 | G6#85 | 1493 | mitte · tudor | wohnhaus | 9×5,5×2 · 5,45 · 2 · 1,38 | Gerb/0 · 5 · 5 | 5×12×2 · 4,84 · 3×4 | TÜ / – | 1×o.Tür 6×<0,9 EG>11 |
| 63 | E-barock-2#13 | 1504 | mitte · alemannisch | wohnhaus | 8×8×3 · 7,8 · 3 · 2,01 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 64 | K4#8 | 1506 | alpin · holzhuette | schmiede | 5,5×5×1 · 3,1 · 2 · 1,32 | Schmied/0 · 6 · 5 | 5×13,5×2 · 5,24 · 3×4,5 | TÜ / TÜ | 8×<0,9 EG>11 |
| 65 | G20#34 | 1521 | medit · provenzalisch | wohnhaus | 11×8,5×2 · 5,45 · 4 · 2,14 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 66 | K9#2 | 1528 | alpin · russisch | wohnhaus | 9,5×6,5×1 · 3,1 · 1 · 1,76 | Tagl/2 · 5 · 15 | 15×7,5×1 · 2,77 · 2×3,75 | T / T | – |
| 67 | E-mediterran-1#1 | 1531 | medit · provenzalisch | gasthaus | 13,5×9×2 · 5,45 · 4 · 2,41 | Wirt/2 · 8 · 15 | 15×9×2 · 5,24 · 2×4,5 | T / T | – |
| 68 | G9#26 | 1538 | alpin · holzhuette | patrizierhaus | 10×5,5×3 · 7,8 · 3 · 1,45 | Wirt/2 · 8 · 15 | 15×9×2 · 5,24 · 2×4,5 | TÜ / TÜ | – |
| 69 | K9#6 | 1546 | alpin · russisch | wohnhaus | 9×7×1 · 3,1 · 1 · 1,85 | Acker/0 · 6 · 5 | 5×12×2 · 5,24 · 3×4 | TÜ / T | 8×<0,9 EG>11 |
| 70 | G2#1 **groesstesGewerbe** | 1552 | medit · italienisch | gasthaus | 15×8,5×3 · 7,8 · 6 · 2,24 | Wirt/1 · 7,5 · 7,5 | 7,5×12,5×3 · 7,71 · 3×4,17 | TÜR / TÜR | EG>11 |
| 71 | G20#55 | 1556 | medit · provenzalisch | werkstatt | 8×8,5×2 · 5,45 · 2 · 2,14 | Schmied/1 · 6,5 · 7,5 | 7,5×10,5×2 · 5,24 · 3×3,5 | TÜR / TR | – |
| 72 | E-barock-1#15 | 1562 | mitte · fraenkisch | wohnhaus | 12×7,5×3 · 7,8 · 5 · 1,9 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 73 | K10#15 | 1566 | nordi · norwegisch | wohnhaus | 8×7,5×2 · 5,45 · 2 · 1,89 | Acker/0 · 6 · 5 | 5×12×2 · 5,24 · 3×4 | T / T | 2×o.Tür 4×<0,9 EG>11 |
| 74 | G14#55 | 1577 | mitte · fraenkisch | werkstatt | 8×6,5×2 · 5,45 · 2 · 1,63 | Schmied/0 · 6 · 5 | 5×13,5×2 · 5,24 · 3×4,5 | TÜ / TÜ | 2×o.Tür 5×<0,9 EG>11 |
| 75 | E-moderne-2#15 | 1580 | mitte · tudor | wohnhaus | 7,5×5,5×2 · 5,45 · 2 · 1,38 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 2×<0,9 |
| 76 | G2#8 **meisteKoepfeArm** | 1581 | medit · provenzalisch | kaufhaus | 8,5×10×3 · 7,8 · 5 · 2,51 | Brau/0 · 8 · 5 | 5×15×2 · 5,24 · 4×3,75 | TÜ / T | 2×o.Tür 5×<0,9 EG>11 |
| 77 | G30#74 | 1609 | alpin · alpenchalet | wohnhaus | 13×8,5×2 · 5,45 · 4 · 2,24 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 78 | E-barock-2#16 | 1614 | mitte · niedersaechsisch | wohnhaus | 15×7,5×3 · 7,8 · 5 · 1,97 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜR / ÜR | – |
| 79 | E-barock-1#17 | 1629 | mitte · alemannisch | wohnhaus | 8,5×9×3 · 7,8 · 4 · 2,26 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 80 | E-barock-2#17 | 1647 | mitte · tudor | wohnhaus | 8,5×5,5×2 · 5,45 · 2 · 1,38 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 1×o.Tür 3×<0,9 |
| 81 | G25#87 | 1652 | alpin · schwarzwald | wohnhaus | 13×9,5×2 · 5,45 · 5 · 2,51 | Acker/0 · 6 · 5 | 5×12×2 · 5,24 · 3×4 | TÜ / T | 1×o.Tür 7×<0,9 EG>11 |
| 82 | K2#7 | 1657 | medit · andalusisch | wohnhaus | 11×9×2 · 5,45 · 3 · 2,45 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜ / – | – |
| 83 | E-hanse-1#18 | 1659 | mitte · franzoesisch | wohnhaus | 9,5×8,5×3 · 7,8 · 4 · 2,18 | Acker/0 · 6 · 5 | 5×12×2 · 5,24 · 3×4 | TÜ / T | 7×<0,9 EG>11 |
| 84 | E-moderne-2#18 | 1677 | mitte · franzoesisch | wohnhaus | 9×8×3 · 7,8 · 4 · 2,01 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜR / R | – |
| 85 | G20#74 | 1696 | medit · barock | wohnhaus | 11,5×9,5×2 · 5,45 · 5 · 2,39 | Tagl/0 · 4 · 5 | 5×9,5×1 · 2,77 · 3×3,17 | T / – | 3×<0,9 o.Herd |
| 86 | E-gruenderzeit-2#19 | 1706 | mitte · franzoesisch | wohnhaus | 9×7,5×2 · 5,45 · 3 · 1,89 | Tagl/0 · 4 · 5 | 5×10,5×1 · 2,77 · 3×3,5 | TÜ / T | 3×<0,9 |
| 87 | E-alpin-2#11 | 1716 | alpin · schwarzwald | wohnhaus | 13,5×9×2 · 5,45 · 4 · 2,41 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜR / ÜR | – |
| 88 | E-alpin-2#9 | 1734 | alpin · schwarzwald | wohnhaus | 12,5×9,5×2 · 5,45 · 4 · 2,46 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜR / TR | – |
| 89 | E-gruenderzeit-2#12 | 1747 | mitte · franzoesisch | wohnhaus | 9,5×8×3 · 7,8 · 4 · 2,06 | Gerb/1 · 5,5 · 7,5 | 7,5×9,5×2 · 5,24 · 3×3,17 | TÜR / TR | – |
| 90 | E-barock-1#23 | 1768 | mitte · renaissance | wohnhaus | 12×8,5×3 · 7,8 · 5 · 2,16 | Acker/0 · 6 · 5 | 5×13×2 · 5,24 · 3×4,33 | TÜ / TÜ | 2×o.Tür 5×<0,9 EG>11 |
| 91 | G2#55 | 1772 | medit · andalusisch | gerberei | 9×9,5×2 · 5,45 · 3 · 2,51 | Gerb/0 · 5 · 5 | 5×13×2 · 5,24 · 3×4,33 | T / T | 2×o.Tür 4×<0,9 EG>11 |
| 92 | E-alpin-1#15 | 1809 | alpin · alpenchalet | wohnhaus | 11,5×8,5×2 · 5,45 · 4 · 2,14 | Acker/1 · 6,5 · 7,5 | 7,5×9,5×2 · 6,04 · 3×3,17 | TÜR / TR | – |
| 93 | K2#11 | 1854 | medit · spanisch | wohnhaus | 10×7×2 · 5,45 · 3 · 1,85 | Acker/0 · 6 · 5 | 5×13×2 · 6,04 · 3×4,33 | TÜ / TÜ | 1×o.Tür 6×<0,9 EG>11 |
| 94 | G23#77 | 1872 | nordi · skandinavisch | wohnhaus | 8,5×6,5×2 · 5,45 · 2 · 1,63 | Tagl/0 · 4 · 5 | 5×10,5×1 · 3,17 · 3×3,5 | TÜ / T | 3×<0,9 |
| 95 | E-gruenderzeit-1#0 | 1878 | mitte · viktorianisch | kirche | 9,5×7,5×3 · 7,8 · 1 · 1,93 | — | — | — | Sonderbau |
| 96 | E-moderne-2#25 | 1926 | mitte · modern | wohnhaus | 10,5×7,5×2 · 5,45 · 3 · 2,01 | Tagl/0 · 4 · 5 | 5×10,5×1 · 2,97 · 3×3,5 | Ü / – | o.Herd |
| 97 | E-moderne-2#7 | 1947 | mitte · modern | turm | 14×10×9 · 21,9 · 12 · 2,71 | — | — | — | Sonderbau |
| 98 | E-moderne-1#1 **hoechsteTraufeGesetz** | 1963 | mitte · modern | gasthaus | 15×11×13 · 28,95 · 12 · 2,9 | Wirt/1 · 7,5 · 7,5 | 7,5×12,5×3 · 8,31 · 3×4,17 | TÜR / TR | o.Herd EG>11 |
| 99 | E-moderne-1#34 | 1979 | mitte · volle_moderne | wohnhaus | 15×9×9 · 21,9 · 12 · 2,37 | Acker/0 · 6 · 5 | 5×13×2 · 5,64 · 3×4,33 | TÜ / TÜ | 7×<0,9 o.Herd EG>11 |
| 100 | E-moderne-1#36 | 1993 | mitte · volle_moderne | halle | 14×12×1 · 3,1 · 0 · 3,25 | — | — | — | Sonderbau |

Aufschlüsselung der besten Lage nach Los-Breite: Los 5 m 13/42 Konflikte (die Streifen sind so schmal, dass kein Ständer in einem Raum
steht — dafür 30 ohne Tür, 38 mit Räumen < 0,9 m), Los 7,5 m 38/39 (Streifen 1,67 m < 1,8 m), Los 15 m 9/13. Nach Schiffen: 2 Schiffe 22/23,
3 Schiffe 37/69, 4 Schiffe 1/2.

## (6) SKRIPTE

Arbeitsordner p3/n1811/bau-spike/ (dort laufen sie: `node pool.cjs` → pool.json, dann `node haus100.cjs` → haus100.json und
haus100-zahlen.json, dann `node tabelle.cjs`; jeder Lauf < 60 s, einer zur Zeit). Kopien ohne den Kern unter vision/bau/spike/:
- `lade.cjs` — lädt kern/ (Kopie fachwerk-core.js, three r184) wie welt-boot.cjs:556–572.
- `probe0.cjs` — Lade-Probe: DORF, HAUS mit MASSNUR.
- `gesetz-proto.cjs` — BAU_GESETZ §1.1 wörtlich, Holz-Zeilen, die Funktionen §1.2, SCHLIESSUNG S1–S6, GEWERBE, GEWERBE_ANTEIL.
- `pool.cjs` — Pläne G/E/K/F, Adressen, heute und Gesetz je Haus, Behauptungen 2–5, Preis µs/ms, Wahl der 100 → pool.json (189 KB).
- `haus100.cjs` — die 100 durch HAUS heute und Gesetz, Behauptung 1 (gleich, beste Lage, Querwand), Unsinn, Streuung, ms je Haus → haus100.json
  (133 KB), haus100-zahlen.json.
- `tabelle.cjs` — die Tabelle (5) und die Aufschlüsselungen.

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. **Behauptung 1 fiel → die Schiffigkeit als Gesetz fällt nach §5**, oder der Entscheid schreibt die Ständerreihe in das Raumprogramm um:
   Unterzug = Querwand des Programms, Treppe im Schiff oder parallel zur Traufe (heute längs der Tiefe, FC:362, 385–389). Prüfung dann:
   dieselben 94 Adressen, Konflikt ≤ 10 % (heute 64 % bei bester Lage, 71/94 ohne tragende Querwand-Folge).
2. **Behauptung 3 fiel → das Gesetz wird neu geschrieben (§5), nicht nachgeregelt:** die Höhe hat im Gesetz keine Quelle außer dem
   Programm (Traufe-Spanne 2,67 m, Geschosse Q90 2); die Bodenrente wirkt nur in der Breite. Gemessen am selben Satz G: Traufe-Spanne ≥ 2,82 m
   und Köpfe 4,0–5,5.
3. **st aus Fläche und Los (S4)** steht im Entscheid nicht: Packer, capK, capL, F0, Mindestfuß und Klammer fallen ohne Ersatz (§2 D1). Ohne
   Regel ist F = W·D·st unterbestimmt; mit dZiel 9/11/14 springt „EG passt nicht“ zwischen 43 %, 21 % und 0,6 %.
4. **Mauer (Behauptung 4):** Hofstätte 15 × 30 m mit Teilung 3/2/1 und Dichte 250 E/ha geben 0,93 der Ringfläche als Lose — jede Stadt der
   frühen Neuzeit liegt über 0,8 (22/22). Eine der drei Zahlen (Hofstätte, Teilung, Dichte) ist falsch angesetzt; ERSTER PUNKT 4 des Entscheids
   (Anker nachschlagen) trägt sie.
5. **GEWERBE (S3):** 7 der 11 Zeilen, GEWERBE_ANTEIL als Zahlen, die Lage-Regel und die Kammer-Zahl (S5) schreiben; an ihnen hängen
   Behauptung 3d (5,62 mit Gesinde, 4,30 ohne) und 5c (×1,81 / ×1,38).
6. **Balkenabstand e (S1) als Zeile in BAU_GESETZ:** L_max 4,59 m bei 0,85 gegen 3,65 m beim heutigen Raster 1,7 — die Schiffzahl hängt daran.
7. **Klasse (S6):** „Quantil-Grenzen“ entscheiden — Rang im Plan (50/40/10 %) oder Wert von q (51/47/2 %).
8. **Raumteilung schmaler Lose (B4):** bei W = 5 m frisst der Flur (fw ≥ 1,96, FC:261) die Streifen auf 0,42 m und das Kaminfeld (FC:906)
   die Tür — 38 bzw. 30 von 94 Häusern; heute 1 bzw. 8 von 100. Die 5-m-Bude des Gesetzes braucht ihren eigenen Grundriss.
9. **Herd der Haushalte in Stil modern/glas/Kuppel** (FC:919): 4/94 Haushalte ohne Herd; herdBrennt (B7) hätte keinen Kamin zu lesen.
10. **Moderne und Dorf:** kein Programm für Mietshaus und Turm (der Glasturm 13 G. wird 3 G.); im Weiler setzt W = b die Häuser ohne Abstand
    (heute gap 2,5 m, FC:3649).
11. **Behauptung 1b:** ≥ 20 Bauaufnahmen (Hallenhaus, Ernhaus, Schwarzwaldhaus, Kontorhaus) lesen — offline nicht prüfbar. Am Gesetz selbst
    liegt geschossH − h für 1800–1899 bei 2,66 m, über dem Band 2,6.
12. **Messart des Preises angleichen:** hier bauRezept 0,66–0,78 µs und DORF 0,40–0,44 ms (warm, n genannt) gegen 4,02 µs und 2,26 ms im
    Entscheid (preis2.cjs liegt nicht vor). Die Schwellen 5a/5b halten unter beiden Messarten.
