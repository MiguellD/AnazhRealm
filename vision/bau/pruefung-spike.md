# PRÜFUNG DES SPIKES — 100 Häuser gegen das Gesetz (Skeptiker, main 18058dba, nur gelesen)

Gelesen: spike-100-haeuser.md ganz, entscheid.md ganz (§5 zweimal), die Skripte unter p3/n1811/bau-spike/ ganz (lade.cjs, gesetz-proto.cjs,
pool.cjs, haus100.cjs; tabelle.cjs nicht geöffnet, nur ihre Ausgabe), lesen-b-tragwerk.md ganz, lesen-f-stadtplan.md nur per Grep (Mauer).
**Die Blätter a, c, d, e, g, h habe ich NICHT ganz gelesen** — keine meiner Aussagen stützt sich auf sie; sie stehen als ERSTER PUNKT 1 unten.
An der Quelle nachgelesen: fachwerk-core.js (FC) :252–261 (NORM, fw), :416–473 (axis, geruest, Balkenlage), :584–631 (Herd, Raum-Schnitt),
:893–932 (Innenwände, Türen, Herd), :2196–2276 (bauRezept, bauProgramm), :4403–4517 (DORF).
Eigene Skripte, nur unter p3/n1811/bau-spike/pruef/ (jeder Lauf < 15 s, einer zur Zeit): `mach.cjs` → `pool-p.cjs` (pool.cjs bis vor den Preis
unverändert, Analyse angehängt) → `analyse.json`, `pool-p.log`; `haus-p.cjs` → `haus-p.json`, `haus-p.log`; `preis-p.cjs` → `preis-p.log`.

## Ergebnis in drei Sätzen

Der Spike rechnet mit dem ECHTEN Kern (kern/fachwerk-core.js SHA-256 028CC2D0…, byte-gleich mit n1011-hg am HEAD 18058dba, `git diff` sauber;
three.module/three.core byte-gleich mit vendor/), seine Statik hält der Handrechnung an drei Häusern stand, und die zwei tragenden Brüche
— Behauptung 1a (Ständerreihe gegen Treppe/Tür, auch ohne Raster-Artefakt 52/94 = 55 %) und 3c (Traufe-Spanne 2,67 < 2,82 m für jedes dZiel
10–16) — stehen. **Gekippt** sind vier Urteile: Behauptung 4 hält am §5-Satz (2/30 = 6,7 % der G-Städte über 0,8; die 42 % entstehen aus 20
eigens zugefügten Städten der frühen Neuzeit), „heute trägt kein Balken" (400 von 844 Balkenlinien liegen auf einer Wand), „MEHR in der Breite"
(sichtbar sind 3 Breiten statt 21, die häufigste Form trägt je Stadt 28 % statt 6 % der Häuser) und damit „drei der fünf fallen" (sicher fallen 1
und 3). **Nicht entscheidbar** sind 3a (zirkulär), 3d und 5c (sie kippen an den Gesinde-Annahmen S3 des Spikes selbst), 5b (der Gesetz-DORF ist
nicht gemessen, nur geschätzt; der heutige DORF kalt liegt schon bei 4,1–5,2 ms > 3,5) sowie die Fenster- und Bau-ms-Vergleiche.

## (1) URTEIL FÜR URTEIL

| # | Urteil des Spikes (Blatt-Stelle) | Prüfung | Zahl | Mein Urteil |
|---|---|---|---|---|
| 1 | Kern echt, kein Nachbau (spike :21–22) | SHA-256 Kopie = n1011-hg/fachwerk-core.js; `git -C n1011-hg diff --quiet HEAD -- fachwerk-core.js` sauber; three r184 = vendor/ | 3/3 Dateien byte-gleich | BESTÄTIGT |
| 2 | Waage reproduziert den Entscheid (spike :26–27) | pool-p.log:4–5, :11 | 1 691 · 0,09 · 7/10/14 · 3,10/7,80 · 3,11 — Zahl für Zahl | BESTÄTIGT |
| 3 | Heute tragen 0/100 Häuser (spike :59) | eigener Lauf am echten HAUS, Auflager = Traufwände + Querwände (FC:916) + Längswand unter dem Balken (Giebel, Flur FC:915) | 0/100 Häuser tragen; die Flur-Balken (bx zwischen ±fw, FC:422) spannen in jedem Haus die volle Tiefe | BESTÄTIGT |
| 4 | „heute trägt kein Balken", „spannt die volle Tiefe" (spike :12, :57) | wie 3, je Balkenlinie (haus-p.log `heute`) | 844 Linien: **400 liegen auf einer Wand** (±W/2, ±fw — FC:422 legt sie dorthin), 186 Flur-Linien spannen D, 258 Streifen-Linien laufen über Querwände; über L_max 429 der 444 spannenden (97 %) | **GEKIPPT** im Wortlaut — richtig wäre „97 % der spannenden Linien, in jedem Haus der Flur" |
| 5 | Statik-Formel (gesetz-proto.cjs:74–80) | eigene Formel in kN/m/MPa (pruef/analyse.cjs `nachweis`), drei Häuser — Tabelle (2) | Einheiten (kN/m² × 1e3 × e = N/m), Lasten g 1,5 + q 2,0, γG 1,35 / γQ 1,5, kmod 0,8, γM 1,3, kdef 0,6, ψ2 0,3, E D30 11 GPa: alle wie EN-Anker des Entscheids §1.1 | BESTÄTIGT |
| 6 | Gesetz trägt 94/94 (spike :81) | Konstruktion `schiffe = ⌈D/L_max⌉` (gesetz-proto.cjs:81); Handrechnung G2#1 | Balken 0,149 × 0,211, L 4,17, e 0,85: η_fin 0,75; bei L_max 4,59: η_fin 1,00 | BESTÄTIGT (als Konstruktion, nicht als Prüfung — sagt der Spike selbst) |
| 7 | Unterzug trägt bis 2,64 m (spike :83, „nicht im Skript") | Handrechnung, Einzug = spann 4,17 | bei 2,64 m: η_Biegung 0,90, η_fin 0,93; bei 1,7 m: 0,37 / 0,25 | BESTÄTIGT |
| 8 | 1a WIDERLEGT, 64 % bei bester Lage (spike :101) | Nachlauf am echten HAUS (haus-p.log `B1.spike` = 60/94); dann zwei Gegen-Lagen: V2 Ständer nur so dicht wie der Unterzug trägt (≤ 2,64 m statt bayMax 1,7), V3 Querwände der Seitenstreifen tragen, Unterzug nur über dem Flur | Spike 60/94 (Treppe 40 · Tür 27 · Raum 32); V2 **52/94** (35 · 27 · **0**); V3 52/94 | BESTÄTIGT — die Klasse „Raum < 1,8" (32) ist ein Artefakt des 1,7-m-Rasters und fällt ganz, der Rest (55 %) liegt fünfmal über 10 % |
| 9 | 1b NICHT PRÜFBAR (spike :102) | keine Bauaufnahme im Baum | — | BESTÄTIGT |
| 10 | 2 HÄLT (spike :103) | pool-p.log:6 | W < 4,5: 0 · st > Kultur-st+2: 0 · Traufe > 2D: 0 von 2 595 | BESTÄTIGT nach Buchstabe — die Schwelle ist zahnlos: W < 4,5 ist unmöglich (losVon ≥ 5, gesetz-proto.cjs:93), st ≤ 2 bei Q90; Gegenbeispiel (3) Nr. 3 |
| 11 | 3a HÄLT, zirkulär (spike :104) | Breite = 15/[3,2,1][Klasse] (gesetz-proto.cjs:93) | 1,00 gegen wohl, 0,89 gegen q, 0,87 bei wörtlicher Klasse | **NICHT ENTSCHEIDBAR** — die Behauptung kann am Prototyp nicht fallen; sie prüft nur, dass die Klasse aus q gezogen wird |
| 12 | 3b HÄLT, 3,00 (spike :105) | Klasse als Wert q < 0,5 / < 0,9 statt als Rang (S6) | Rang 3,00 · **Wert 1,50** (reich 1,8 % → Q90 = 7,5 m) | BESTÄTIGT unter S6 — das Wort „Quantil-Grenzen" (entscheid :90) trägt die Rang-Lesung; hängt an S6 |
| 13 | 3c WIDERLEGT, 2,67 m (spike :106) | analyse.json `traufeDz`, `woertlich`, `traufeHeuteHH` | dZiel 8: 1,20 · 9: 0,40 · 10–16: 2,67 · wörtliche Klasse 2,67; heute an denselben 2 595 Losen 4,70 | BESTÄTIGT |
| 14 | 3d WIDERLEGT, 5,62 Köpfe (spike :107) | Gesinde der 7 Spike-Annahmen (gesetz-proto.cjs:50–56) variiert | Spike 5,62 · Annahmen-Gesinde halbiert **5,00** · Annahmen-Gesinde 0 **4,75** · Kinder −0,5 **5,12** — drei von vier Lesungen liegen in 4,75 ± 0,75 | **NICHT ENTSCHEIDBAR** — die Widerlegung trägt die eigene Schließung S3 |
| 15 | 4 WIDERLEGT, 22/52 (spike :108) | analyse.json `mauer` | §5-Satz (30 Pläne nH 90, alle städtisch vor 1750): **2/30 = 6,7 %** (G2 1549, G9 1522); E 0/2; F 20/20 — F sind 20 eigens zugefügte Städte 1500–1728 (pool.cjs:53) | **GEKIPPT** — nach §5 hält 4; der Befund bleibt: Anteil = Ø Los·dichte/(Ø Köpfe·10⁴) ist planunabhängig, 0,56 bei 150, 0,94 bei 250 E/ha; Grenze 213 E/ha; jede FNZ-Stadt fällt; im Würfel FC:4412 trifft FNZ 8,8 % der Jahre (60/680) — knapp unter 10 % |
| 16 | 5a HÄLT (spike :109) | preis-p.log, frischer Prozess, dieselben 94 | Gesetz kalt (erster Durchgang) 9,1–10,7 µs, warm 1,1–1,5 µs; heute 2,7–4,2 / 0,6–0,7 µs; erster Ruf 614–757 µs (JIT) | BESTÄTIGT (auch kalt ≤ 20 µs) |
| 17 | 5b HÄLT (spike :110) | pool.cjs:171: Gesetz-DORF = heute + n·µs, ohne gewerbeVon, Klassen-Rang (pool.cjs:72–92), losVon | heute DORF kalt (erster Ruf) **4,1–5,2 ms**, lauwarm 0,71–0,95 ms; Spike warm 0,40–0,44; Entscheid 2,26 (preis2.cjs fehlt) | **NICHT ENTSCHEIDBAR** — gemessen ist nur heute; kalt reißt schon heute die 3,5 ms, die Schwelle hat keine Messart |
| 18 | 5c WIDERLEGT, ×1,81 (spike :111) | Nenner: Spike teilt Ø Köpfe (2 595 Haushalts-Lose) durch Ø Leute der 1 691 Wohnhäuser | dieselben Lose ×1,79 · Plan-Summe mit Sonderbauten ×1,74 · Annahmen-Gesinde halbiert 5,00/3,14 = **×1,59** · 0 → ×1,51 | **NICHT ENTSCHEIDBAR** — hängt an S3 wie 14 |
| 19 | Bau je Haus gleich teuer, 0,96–0,97 (spike :91) | haus100.cjs:85–98: je Haus ein Ruf, Maschine misst nebenher | Streuung zwischen Läufen 73–109 ms > Unterschied 2–4 ms; Unterzug, Ständerreihe, Mittelpfette nicht gebaut | NICHT ENTSCHEIDBAR (der Spike sagt es selbst) |
| 20 | Streuung: Breite „MEHR", sichtbar (spike :65, :84) | analyse.json `vielfalt` (G, 2 595 Lose) | Q90/Q10 3,00 gegen 1,98 — aber **3 Breiten gegen 21**, **32 Formen W×D×st gegen 440**, häufigste Form je Stadt Q50 **28 % gegen 6 %** der Häuser | **GEKIPPT** — Q90/Q10 und Variationskoeffizient messen Spanne, nicht was man sieht; im Bild wird die Gesetz-Stadt gleichförmiger |
| 21 | Fenster-Anteil „WENIGER" (spike :70) | haus100.json: heute aus gebauten Öffnungen, Gesetz aus der Formel lichtAnteil × Netto (haus100.cjs:103) | heute 0,040/0,073/0,138 · Gesetz Formel 0,037/0,046/0,059 · Gesetz gebaut 0,057/0,111/0,175 | NICHT ENTSCHEIDBAR — zwei Maße verglichen; am selben Maß (gebaut) liegt das Gesetz höher, baut aber die heutigen Fenster |
| 22 | „drei der fünf Behauptungen fallen" (spike :14–15) | aus 8, 13, 14, 15, 17, 18 | sicher fallen 1 (1a) und 3 (3c); 4 hält nach §5; 5 nicht entscheidbar | **GEKIPPT** — zwei fallen; die Folgen nach §5 (Schiffigkeit, Umkehr Haus ← Mensch) bleiben, weil sie an 1 und 3 hängen |

## (2) DREI HÄUSER VON HAND (pruef/analyse.cjs `nachweis`, unabhängig von `balkenSpann` geschrieben)

| Haus | Lage | L m | e m | σ_d / f_m,d MPa | w_inst / l/300 mm | w_fin / l/250 mm | Spike |
|---|---|---|---|---|---|---|---|
| heute G29#35 (8 × 7,5 × 3) | Flur-Balken 0,15 × 0,21 | 7,46 | 1,31 | 41,4 / 18,5 (η 2,24) | 145 / 25 | 197 / 30 | L_max 3,98, Bruch — gleich |
| heute G12#83 (5 × 4,5 × 1) | wie oben | 4,46 | 1,51 | 17,1 / 18,5 (η 0,93) | 21 / 15 | 29 / 18 | trägt nicht, kein Bruch — gleich (versagt an der Durchbiegung, nicht am Riss) |
| Gesetz G2#1 (7,5 × 12,5 × 3, 3 Schiffe) | Balken 0,149 × 0,211 | 4,17 | 0,85 | 8,4 / 18,5 (η 0,46) | 9 / 14 | 12 / 17 | trägt — gleich |
| dasselbe, e = bayMax 1,7 | Balken auf jedem Ständer wie heute | 4,17 | 1,70 | 16,8 / 18,5 | 18 / 14 | 25 / 17 (η 1,49) | — trägt NICHT: S1 entscheidet die Schiffzahl |
| dasselbe, Unterzug | 0,149 × 0,211 über 2,64 m | 2,64 | 4,17 | 16,6 / 18,5 | 7 / 9 | 10 / 11 | „bis 2,64" — gleich |

Nicht im Nachweis (weder Spike noch ich): Schub (überschlagen am Unterzug 2,64 m: τ_d ≈ 1,3 MPa gegen f_v,d ≈ 1,6 MPa mit k_cr 0,67 —
Vermutung, f_v,k D30 3,9 aus dem Gedächtnis), Auflagerpressung, Knicken der Ständer, Eigengewicht des Balkens (Vermutung: in g_Decke 1,5).
w_inst mit g + q statt nur q ist die strengere Lesung von EN 1995 Tab. 7.2; sie schadet dem Gesetz, nicht dem heutigen Bau.

## (3) GEGENBEISPIELE, DIE DER SPIKE ÜBERSAH

1. **Der Kaufmann fehlt in den 100.** Der Entscheid zeigt als Bild „das Kaufmannshaus über die ganze Hofstätte am Markt" (entscheid :34,
   :260); unter den 94 Haushalten ist kein Kaufmann (G-Satz 61/2 595), Handel nur 2 (Krämer), Bäcker 1 (analyse.json `hundert`). Die Wahl ist nur
   nach Baujahr geschichtet (pool.cjs:175–178), nicht nach Wohlstand × Gewerbe: 21 der 24 Tagelöhner sind arm, ≥ 1800 stehen 6 Haushalte, keiner reich.
2. **Kaufmanns-Fläche verschwindet aus dem Körper.** `form` zählt nur eg/og (gesetz-proto.cjs:117); Lager 80 m² (dach), Keller 40 m² und die
   Scheune 60 m² (getrennt) gehen in keine Hülle — der Kaufmann reich baut D Q50 8 m auf 15 m, eingeschossig bis zweigeschossig (pool-p.log:7).
3. **Das Programm passt nur als Röhre.** D/W > 2 bei 627 von 2 595 Losen (24 %), Q90 2,4; Wirt arm 5 × 16,5, Brauer arm 5 × 15 — Behauptung 2
   misst W < 4,5 und st, aber nicht die Gestalt (analyse.json `b2`, pool-p.log:7).
4. **Die Ständerreihe hängt am Flur, nicht an der Statik.** In jedem Gesetz-Haus spannen die Flur-Balken voll (FC:422, :467–470); sobald die
   Querwände tragen, braucht 42/94 den Unterzug NUR über dem Flur — dort steht die Treppe (FC:385–389). Die Konflikte 35 Treppe · 27 Tür bleiben
   in jeder Lage (haus-p.log V2/V3).
5. **Die Schiffzahl springt an S1.** 31 der 94 Gesetz-Häuser sind 9,5 m tief und werden mit L_max 4,59 (e 0,85) dreischiffig (9,5/4,59 = 2,07);
   bei L_max ≥ 4,75 wären sie zweischiffig, bei e 1,7 (bayMax bleibt, entscheid :220) vierschiffig.
6. **Heute DORF kalt reißt die Preis-Schwelle schon heute:** erster Ruf 4,1–5,2 ms > 3,5 ms (preis-p.log) — 5b ist ohne Messart (kalt/warm)
   keine Schwelle.
7. **Mauer:** heute ist der Fuß der Häuser 0,17–0,27 der Ringfläche (pool-p.log:22–43), im Gesetz die Lose 0,92–0,96 — verglichen werden
   Hausfuß gegen ganze Hofstätte (15 × 30) ohne Straße, Platz, Kirche; eine Zahl für „passt in die Mauer" verlangt beide Seiten am selben Maß.

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. Die Lese-Blätter a, c, d, e, g, h ganz lesen und dieses Blatt an ihnen prüfen — heute nicht geschehen (Grund: Auftrag auf den Spike
   gerichtet, die Zeit ging in die Gegenrechnung).
2. Behauptung 4 am richtigen Satz entscheiden: die städtischen Pläne der WELT (Würfel FC:4412 plus Erbe-Städte der Kachel) zählen, nicht 20
   zugefügte FNZ-Städte; dazu Hofstätte gegen Ringfläche abzüglich Straße/Platz. Formel-Grenze heute 213 E/ha.
3. 3d und 5c erst nach GEWERBE mit Anker (S3, Spike-Punkt 5) — bis dahin fallen sie nicht und halten nicht; Spanne 4,75–5,62 Köpfe,
   ×1,51–×1,81.
4. 5b mit einer Messart: Gesetz-DORF als gebaute Funktion (gewerbeVon, Klassen-Rang, losVon im Strom) kalt UND warm im selben Prozess gegen
   heute; preis2.cjs des Entscheids beilegen oder die 2,26 ms fallen lassen.
5. Ein Unterschieds-Maß, das man sieht: Zahl der Formen je Stadt, Anteil der häufigsten Form, Breiten-Stufen — gegen heute (32/440, 28 %/6 %,
   3/21) — als Schwelle in §5 statt Q90/Q10.
6. Behauptung 1a gegen einen Grundriss aus dem Programm prüfen (B4), nicht gegen den geerbten Längs-Flur: erst dann ist entschieden, ob die
   Schiffigkeit fällt oder der Flur.
