# SPIKE v2 GEGEN DAS GESETZ (BAU-ZENSUS Runde 2, Kapitel GEBÄUDE/STADT · Lese-Baum n1011-hg main b7ed8419, nur gelesen)

Ziel war, das Gesetz v2 (entscheid-v2.md §1, §3, §5) zu WIDERLEGEN. Gelesen: entscheid-v2.md ganz, entwurf-grundriss-tragwerk.md (A),
entwurf-reichtum-ursachen.md (B), die Prototypen grundriss-proto.cjs (GP, sha256 710dac5c…) und stadt-proto.cjs (SP, 30cbb834…), dazu
zaehl/richter-kopplung.cjs, kopplung-richter.cjs, spike/haus100.cjs, spike/pool.cjs, spike/lade.cjs. Am Kern gelesen: FC:250–479
(Treppe, Achsen, `layJoists`), FC:44–56 und FC:1488 (`terrain`), FC:2304 (MASSNUR), FC:4399/4436/4473/4483 (DORF setzt `terrain:0`).

**Der Kern:** `n1011-hg/fachwerk-core.js` (der Kern liegt im Wurzelordner des Baums, NICHT unter worlds/fachwerk/ — der Pfad im Auftrag
gibt es nicht) ist byte-gleich kopiert nach `p3/n1811/bau-spike2/v2spike/kern/`. SHA-256 beider Dateien **028cc2d012a9d47c…bea06**.
Jeder Lauf von spike-v2.cjs prüft das neu und wirft bei Ungleichheit (spike-v2.cjs:31). Die „heute“-Zahlen sind NEU gerechnet aus
`FC.DORF` der Kopie (stadt-b-m03.log Zeile „heute“): **440 Formen / 21 Breiten / Traufe-Spanne 4,70 m / häufigste Form Q50 5,8 %**.
Sie sind gleich den Zahlen der Runde 1.

**Skripte und rohe Zahlen** (Arbeitskopie im Scratch `p3/n1811/bau-spike2/v2spike/`, Kopie in `vision/bau/v2/spike/`; laufen nur im Scratch,
weil sie `kern/` und `../../../../n1011-hg` relativ lesen):

| Datei | Rolle |
|---|---|
| `stadt-b.cjs` (023cc0dd…) | SP wörtlich, nur der Pfad zu gesetz-proto.cjs (Z.17) angepasst. Lauf `STADT_V2='{"inwohner":0.3}' STADT_TAG=m03` → stadt-v2-haeuser-m03.json, stadt-b-m03.log |
| `grundriss-a.cjs` (8be32898…) | GP + EIN Haken `H.hoch` (grundriss-a.cjs:85–86, nur Lauf H) |
| `spike-v2.cjs` (02482fa4…) | die gekoppelte Kette, alle Läufe, S-a … S-i, die 100, das HAUS des Kerns → spike-v2.log, spike-v2-zahlen.json, spike-v2-laeufe.json, spike-v2-hundert.json |
| `linse-v2.cjs` (16147f5b…) | der Prüfer (S-a, S-b), Selbsttest 5/5 GRÜN. Er liest nur Geometrie: Balken-Linien, Auflager, Ständer, Öffnungen |
| `ascii.cjs` (5b6ca329…) | drei Grundrisse → ascii.log |
| `diag-sa-unten.cjs`, `diag-sab.cjs` | Aufschlüsselung S-a/S-b (diag-sab.log stammt vom ERSTEN Stand der Linse, vor den zwei Korrekturen unten) |
| `zaehl/spike-v2-zweit.cjs` (ac35b883…) | Zweitzählung aus den Rohzeilen mit eigenem Code → **ZWEITZÄHLUNG GRÜN** (spike-v2-zweit.log); zählt dazu „aufgestockt ohne Grundriss“ |

Laufzeit `node spike-v2.cjs` ≈ 16–30 s (gierig). `node spike-v2.cjs --erschoepfend`: nach Lauf E abgebrochen (> 6 min), Lauf E steht
in spike-v2-erschoepfend.log. Kein git, kein GPU, kein Browser, kein Spiel-Code.

## DIE TAFEL — S-a … S-i (Lauf E = Entscheid wörtlich, 2 595 Lose, gierig; in Klammern erschöpfend)

| # | Schwelle (entscheid-v2 §5) | gemessen | Urteil |
|---|---|---|---|
| S-a | 0 von 100 Häusern mit Balkenlinie > L_max am GEBAUTEN HAUS; Linse ROT an der Mutante | **Prototyp-Geometrie: 16 von 48** gültigen der 100 · 441 von 1 763 (25,0 %) der Stadt, alle in der OBERSTEN Decke, größte Spannweite 1,96 × L_max · Mutante „Balken auf jedem Ständer“: Linse ROT in 34/48 bzw. 1 343/1 763 · HAUS des Kerns: ROT in 32/48 | **FÄLLT** am Prototyp. Am gebauten HAUS **NICHT ENTSCHEIDBAR**: der Kern kennt keinen Grundriss, er legt heute die Balken nach FC:466–470 (das ist die Mutante) |
| S-b | Ständer trifft Tür/Loch/Lauf/Podest ≤ 10 % | **1 von 1 763 (0,1 %)**, 0 von 48 der 100. Dazu 220 Häuser, deren Podest an der Außenwand nur 0,82 m licht hat | **HÄLT** am Prototyp — an der Geometrie des Bauplans, nicht am HAUS |
| S-c | Formen ≥ 440, Breiten ≥ 21, Spanne ≥ 4,70 m, häufigste Form ≤ 6 % | **490 / 38 / 3,14 m / 9,2 %** (512 / 38 / 3,47 / 8,7 %) · bester Lauf H: 544 / 38 / 4,93 / 8,0 % | **FÄLLT** (Spanne und häufigste Form; in keinem Lauf halten alle vier) |
| S-d | ≥ 95 % von 1 200 Paaren rückführbar UND die Prüfung ROT an der Würfel-Mutante ± 1,1 m auf W | Gegenwelt-Prüfung: Kette 549/549 = 100 % · Mutante W 19,5 % (ROT) · Mutante D 27,5 % (ROT). Die Ursachen-Tafel nach B: Mutante W 81,7 % (ROT), **Mutante D 100 % (GRÜN, blind)** | **HÄLT** nach dem Wortlaut. Es ist aber nur bewiesen, dass die Kette keinen verborgenen Eingang hat. Die Prüfung nach B ist blind für jeden Würfel auf D, st oder Traufe |
| S-e | im Band ¾–2½ ≥ 80 %; am Viertel-Raster ± 0,5 m 50–80 % | 86,7 % · **100,0 %** | **FÄLLT** (zweites Maß, wie angekündigt) |
| S-f | ≤ 5 % ohne gültigen Grundriss (mit Hülle) | **32,1 %** (28,6 %) ohne Grundriss · Hülle (K7) ohne Füllung 9,2 % · der Grundriss trifft die Hülle (gleiches st, ΔD ≤ 0,5 m) nur in 604 von 1 759 | **FÄLLT** |
| S-g | Hülle ≤ 20 µs warm / ≤ 50 µs kalt · DORF nH 90 ≤ 3,5 ms warm · kalt ≤ heute + 20 % · Grundriss ≤ 2 ms | Hülle 1,5 µs warm / **68,7 µs kalt** · DORF heute 0,67 ms warm, 4,96 ms kalt · gerechnet DORF + 90 Hüllen 0,80 ms · Grundriss gierig 0,16 ms Q50 / 0,62 Q90, erschöpfend 4,85 ms | **NICHT ENTSCHEIDBAR**: die Hülle füllt der Grundriss nicht (S-f), also ist der Preis der Hülle nicht der Preis des Hauses. Hülle kalt FÄLLT (68,7 > 50 µs) |
| S-h | Spearman(Traufe, Druck) ≥ 0,4 und Spanne ≥ 4,70 m | **0,125** (0,17) · Spanne 3,14 m · stärkerer Druck (Lauf K) 0,118 · Lauf H 0,251 / 4,93 m | **FÄLLT**: Druck macht in der Kette Häuser UNGÜLTIG, nicht höher |
| S-i | Ø 4,75 ± 0,5 · Gesinde 11–14 % · Miete 5–8 % der Leute | 4,85 · 12,5 % · 6,7 % | **HÄLT** — geeicht, nicht vorhergesagt; Laslett nur aus Zusammenfassungen (unsicher) |

**Pflicht-Häuser:** Kaufmann G20#28, Hang G4#10·Hang und Ecke G2#9·Ecke sind in den 100. **Hang und Ecke sind byte-gleich ihren Zwillingen
ohne Merkmal**: die Kette hat für beide keinen Eingang (spike-v2.log „Zwilling … GLEICH“).

## WAS NICHT HÄLT (zuerst)

1. **Die Druck-Ursache trägt die Höhe nicht, sie tötet die Häuser.** Die Regel des Entscheids (§1 Entscheid 2: „st_Grund ist das kleinste st, bei dem die
   EG-Tiefe ≤ T·(1 − hof(Druck))“) kann die Höhe in A's Grundriss gar nicht heben. Ab st = 2 liegen ALLE EG-Räume im EG, egal wie
   viele Geschosse (GP:88–97 `geschosse`: nur bei st = 1 wandern OG-Räume ins EG). Ein engeres EG ist darum kein höheres Haus, sondern
   ein ungültiges: im oberen Druck-Drittel sind nur 361 von 842 gültig (unteres Drittel: 761/848). Traufe Q50 3,00 gegen 2,77 m.
   Stärkerer Druck (Lauf K, hofK 1,2) senkt Spearman auf 0,118. Erst wenn der Druck Räume ins OG hebt (Lauf H, Schließung K6, nicht im
   Entscheid), steigt Spearman auf 0,251. Die Spanne erreicht dann 4,93 m, die Schwelle 0,4 aber nicht. **Die Wurzel:** dem Gesetz fehlt
   die Verteilung des Programms über die Geschosse. Das hat A in seinem ERSTEN PUNKT 4 offen gelassen („OG aus dem eigenen Programm“).
2. **Ein Drittel der Stadt hat keinen Grundriss** (32,1 % gierig, 28,6 % erschöpfend; ohne Druck 11,5 %). Der Grund ist 591-mal „Tiefe“.
   Je Breite gültig: W < 5 m 17/268 · 5–6,5 m 31/163 · 6,5–8 m 82/175. Von den 100 stratifizierten Häusern haben nur **48** einen
   Grundriss (reiche Gewerbe auf schmalen Losen, spike-v2.log „ohne Grundriss in den 100“).
3. **Die Breiten-Regel des Entscheids baut Band-Häuser.** „Breite = Los, auf Losen > 12 m abzüglich der Torfahrt“ (§1) wörtlich
   genommen: **321 Häuser breiter als 20 m, 297 mit W/D > 5**. Der Kaufmann G20#28 wird 36 × 5 m. B's eigene Regel (SP:229, Lauf EB)
   bringt das auf 42 / 19 herunter, die Stadt wird aber nicht reicher (469 / 50 / 3,54 / 8,4 %).
4. **S-a fällt an der Geometrie des Bauplans, und A's eigener Prüfer verdeckt es.** A baut die Unterzüge JEDES Geschosses so, als
   kreuzte dort das Treppenloch (GP:383–393). Auch die OBERSTE Decke ist an der Treppen-Stelle unterbrochen, obwohl darüber kein Lauf
   geht (A baut keinen Lauf in den Dachraum). Die Balken dort spannen über zwei Bänder: bis 1,96 × L_max (Nadel 0,30, 11,0 m). A's
   `pruefe` setzt das Loch als Auflager auf jedes Geschoss (GP:478) und zählt darum 0. In 441 von 1 763 Häusern (alle Modus „wechsel“)
   fällt das. In den Decken MIT Loch liegt nach den zwei Korrekturen der Linse (Streichbalken, Ständer-Kopf ± 0,08) kein Balken über
   L_max (diag-sa-unten.log: {}).
5. **Aufgestockte Geschosse haben keinen Grundriss.** B's Aufstockungen (SP:219, 237) sind Geschosse ohne Räume, Treppe und Balkenfeld
   in A. Betroffen sind 265 von 1 763 gültigen Häusern (Lauf E) und 10 von 48 der 100 (spike-v2-zweit.log). Der Kaufmann hat 1
   Grund-Geschoss und darauf 1 leeres.
6. **Hang und Ecke haben keinen Leser.** DORF baut jedes Haus mit `terrain:0` (FC:4436, 4399, 4473, 4483). Die Pläne G tragen kein Los
   der Kachel (`pl.lose` 94 × null). Weder die Kette noch der HAUS haben einen Eingang für Gefälle oder zweite Straßenseite (FC:1488
   baut nur eine flache Wiese). Gemessen am Zwilling: gleich.
7. **S-d ist Konstruktion, wie B Punkt 4 sagt — und B's Prüfung ist schlimmer als Konstruktion.** Wohlstand und Druck sind STETIG und je
   Haus einmalig: 2 595 Werte bei 2 595 Häusern. Jedes Paar unterscheidet sich darum „in einer Ursache“, und jeder Würfel auf D, st
   oder Traufe bleibt GRÜN (Mutante D: 100 %). Nur die Gegenwelt-Prüfung (B's Ursachen an A's Adresse rechnen, spike-v2.cjs:163–179)
   wird an beiden Mutanten ROT. Sie beweist aber nur „kein verborgener Eingang“, nicht „die Ursache ist wahr“.
8. **B's Zeit läuft in die Zukunft.** `jetzt = Gründung + spanne` (SP:202) gibt 192 Häuser mit Baujahr nach 1900 (bis 2181, G24) in
   Plänen der Jahre 899–1466. Sie bekommen die lichte Höhe 2,6 m (BAU_GESETZ.licht ≥ 1900) und Aufstockungen nach 1900 (87).
   Gezählt mit node über stadt-v2-haeuser-m03.json (Rechenweg: `bau > 1900`). Das hebt die Traufe in B — die Kette übernimmt es.
9. **Kein Haus ist gesehen.** Die 48 HAUS-Bauten des Kerns tragen W, D, st der Kette, aber den Innenausbau und die Balken von HEUTE.
   Ein HAUS nach dem Gesetz gibt es nicht (Bahn 3 ist nicht geschnitten). Alles hier ist Mechanik.

## ERGEBNIS IN DREI SÄTZEN

Gebaut ist EIN Spike für die gekoppelte Kette (B's Lose, Geschichte und Haushalt mit Miete 0,3; A's Grundriss; Breite mit Torfahrt;
Höhe aus den Geschossen ihres Jahres; Druck → EG-Tiefe), mit einem Prüfer von anderer Hand, am SHA-geprüften Kern 028cc2d0, für
2 595 Lose und 100 Häuser. Gemessen: S-a fällt am Prototyp (441/1 763 Häuser mit Balken bis 1,96 × L_max in der obersten Decke), S-c
(490 / 38 / 3,14 m / 9,2 %), S-e (100 % am Raster), S-f (32,1 % ohne Grundriss) und S-h (Spearman 0,125) fallen; S-b (0,1 %), S-d
(nach Wortlaut) und S-i (4,85 / 12,5 % / 6,7 %) halten; S-g ist nicht entscheidbar. Ehrlich offen: die Verteilung des Programms über
die Geschosse (ohne sie trägt keine Druck-Regel die Höhe), Hang und Ecke ohne Leser, und jedes Bild.

## (1) DER AUFBAU

**Die Kette** (`kette`, spike-v2.cjs:66–80), je Los eine Zeile `ursachen` (spike-v2.cjs:51):
1. Los, Geschichte, Haushalt aus B: `stadt-b.cjs` mit Miete 0,3 (entscheid-v2 §1 Entscheid 4). Die Lose sind dieselben 2 595
   Haushalts-Lose der 30 Pläne G (Saaten 1–30, nH 90) wie Runde 1 (pool.cjs; SP:126–164 wirft bei ≠ 2 595).
2. Breite W (spike-v2.cjs:64): `halb(b)` bis 12 m, darüber `halb(b − 3,5)` (K1).
3. Druck = 0,5 + 0,5·(1 − t) (SP:203), t aus der Haus-Liste (auf 0,01 gerundet, SP:378). Die EG-Tiefen-Grenze ist
   11 · (1 − hofK·(Druck − 0,5)) (K3, spike-v2.cjs:65); sie reicht als `los.T = Grenze + 4` in A (GP:123 `Dgrenze = min(dZiel, T − hofMin)`).
4. Haushalt nach B (kern, gesinde, koepfe, wohl) an A's `raumProgramm`. Jeder Miet-Haushalt wird ein OG-Raum zu 27,3 m² (K5).
5. Grundriss `GP.grundrissVon` (A, unverändert bis auf den Haken). Tiefe D und Grund-Geschosse st0 kommen aus ihm.
6. Höhe: st0 Geschosse im Baujahr plus B's Aufstockungen, jedes in `geschossH(Jahr, h_Balken des Stoffs)`. Gekappt bei Traufe ≤ 2·D
   (FC:3892 STADT_FORM.stab, wie SP:241).

**Die Läufe** (spike-v2.log): E = Entscheid wörtlich · 0 = ohne Druck · H = Druck hebt Räume (K6) · EB = Breite nach B (SP:229) ·
K = stärkerer Druck (hofK 1,2).

**Der Prüfer** linse-v2.cjs, Selbsttest 5/5 (linse-v2.cjs:106):
- S-a: Der Balken ist eine LINIE über die ganze Spannrichtung, e 0,85 (linse-v2.cjs:35–57). Er trägt, wo eine tragende Wand oder ein
  Unterzug unter ihm liegt. Die Spannweite ist der größte Abstand zweier Auflager. Die Bänder des Bauplans liest der Prüfer nicht.
- Zwei Korrekturen nach dem ersten Lauf, beide sind Fehler des Prüfers, nicht des Baus:
  (a) ein Balken an einer parallelen tragenden Wand liegt auf ihr (Streichbalken);
  (b) eine Linie trägt bis zur Außenkante ihres End-Ständers (± post/2).
  Vorher zeigte die Linse 47 bzw. 23 Häuser in den Decken mit Loch; nachher 0 (diag-sa-unten.log).
- S-b: Ständer gegen Türöffnung, Loch und die Podeste je 0,9 m vor beiden Lauf-Enden, gemessen im LICHTEN Innenraum (linse-v2.cjs:83–104).
  Der erste Stand maß das Podest bis zur Wand-ACHSE und fand 221 Häuser (diag-sab.log). Das waren die Außenwand-Ständer. Sie stehen jetzt
  als eigene Zahl da: 220 Häuser mit einem Podest von 0,82 m licht an der Außenwand (A legt den Lauf 0,9 m von der Achse,
  GP:275 `clamp(…, NORM.podest, …)`).
- HAUS: Balken = Box `balkenB × balkenH` in `subsystems.geruest`, Auflager = liegende Boxen (Rähm) auf Balkenhöhe (linse-v2.cjs:66–81).

## (2) ZAHLEN JE LAUF (2 595 Lose; spike-v2.log, zweitgezählt GLEICH)

| Lauf | ohne Grundriss | Formen | Breiten | Traufe-Spanne | häufigste Form Q50 | Spearman(Traufe, Druck) | W > 20 m | aufgestockt ohne Grundriss | ms je Haus |
|---|---|---|---|---|---|---|---|---|---|
| heute (DORF, Kopie) | — | 440 | 21 | 4,70 | 5,8 % | — | — | — | — |
| V2 B allein, Miete 0,3 (stadt-b-m03.log) | — | 725 | 58 | 5,14 | 8,0 % | — | — | — | — |
| **E Entscheid wörtlich** | **32,1 %** | **490** | **38** | **3,14** | **9,2 %** | **0,125** | 321 | 265/1 763 | 0,45 |
| E erschöpfend | 28,6 % | 512 | 38 | 3,47 | 8,7 % | 0,17 | 320 | — | 30,5 |
| 0 ohne Druck | 11,5 % | 559 | 39 | 4,54 | 7,5 % | 0,204 | 323 | 395/2 296 | 0,38 |
| H Druck hebt Räume | 24,4 % | 544 | 38 | 4,93 | 8,0 % | 0,251 | 322 | 298/1 962 | 0,44 |
| EB Breite nach B | 32,5 % | 469 | 50 | 3,54 | 8,4 % | 0,296 | 42 | 262/1 751 | 0,28 |
| K Druck stärker | 36,8 % | 488 | 38 | 3,07 | 9,5 % | 0,118 | 319 | 242/1 641 | 0,25 |

Gezählt nur über gültige Häuser (wie zaehl/richter-kopplung.cjs). Ein ungültiges Haus zählt nicht als Form — würde es als „Haus wie
heute“ zählen, wäre das der Fallback, den das Gesetz verbietet. Die ms-Spalte ist je Lauf ein Durchgang mit Rauschen (zwischen zwei Läufen
0,45 ↔ 0,60 ms bei Lauf E).

**Der Druck in Dritteln (Lauf E):** Druck 0,50–0,67: 761/848 gültig, Traufe Q50 2,77 m, st0 Ø 1,18 · 0,67–0,83: 641/905, 3,00, 1,37 ·
0,83–1,00: **361/842**, 3,00, 1,52. Spearman(st0, Druck) 0,187. In Lauf 0 ohne Druck-Regel ist Spearman(Traufe, Druck) schon 0,204: B's
Aufstockungen hängen am Druck (SP:219 `pAuf · druck`). Die Druck-Regel des Entscheids SENKT das auf 0,125.

## (3) JE BEHAUPTUNG — Rechenweg

- **S-a** (spike-v2.log „S-a“, „DIE 100“; Rechenweg linse-v2.cjs:14–57).
  - Prototyp: 441 / 1 763 Häuser, Typ z·wechsel 331, x·wechsel 110; 36 933 Balken-Stücke, 0 freie Enden.
  - Mutante: `mutanteJederStaender` (linse-v2.cjs:59–64), heute FC:466–470: der Balken an jedem Ständer über die volle Tiefe, nur
    Außenwände tragen. ROT in 1 343 / 1 763.
  - HAUS des Kerns mit W, D, st, gH und Balken der Kette (spike-v2.cjs:240–247, `nur = MASSNUR + geruest`): ROT in 32 / 48.
    Kaufmann 43 / 45 Balken > L_max, größter 4,96 m. Die 16 übrigen tragen D ≤ L_max.
  - Die „ODER“-Klausel der Schwelle ist erfüllt (die Linse ist ROT an der Mutante). Die erste Klausel fällt am Prototyp.
- **S-b** (spike-v2.log „S-b“): 102 032 Ständer, Tür 0, Loch 0, Podest 3 (alle 3 „frei:flur“, diag-sab.log), Treppenpfosten im Podest 0.
- **S-c** (spike-v2.cjs:98–106, Maß wie SP:111–118; Zweitzählung GLEICH).
- **S-d** (spike-v2.cjs:163–190, Druck in 181–190). Gezogen sind 1 200 Paare derselben Stadt wie SP:313–315. Nenner: beide gültig und W, D, st oder Traufe verschieden (549).
  - Gegenwelt: `kette(Ursachen von B, Adresse von A) === kette(B)`.
  - Tafel wie B: die Paare, in denen jedes verschiedene Maß eine verschiedene Ursache aus ABH hat.
  - Mutante W: `W + (ax("mutW", adr) − 0,5)·2,2` (= FC:2208). Mutante D: `D + (ax("mutD", adr) − 0,5)·1,8` (= FC:2209, meine Ergänzung über den Entscheid hinaus).
- **S-e** (spike-v2.log „S-e“): f = b/U in [0,75; 2,5]; Raster-Abstand |4b/U − round(4b/U)|·U/4 ≤ 0,5. b = f·U ist nach Konstruktion
  genau auf dem Raster (SP:222), darum 100 %.
- **S-f** (spike-v2.log „LAUF E“, „S-f HÜLLE“). Die Hülle `huelle` (spike-v2.cjs:82–95, K7) ist A's Ausrichtung und Tiefe (GP:121–130)
  ohne Belegung. Möglich in 1 998 Losen; davon trifft der Grundriss sie in 604 (st gleich, |ΔD| ≤ 0,5 m), st verschieden 82,
  D verschieden 1 073, keinen Grundriss 239 (9,2 % der 2 595).
- **S-g** (spike-v2.log „S-g“, ein Prozess, ein Lauf, node). Kalt = erster Ruf im Prozess.
  - DORF nH 90 heute: kalt 4,96 ms, warm Q50 0,67 ms (neue Saat), 0,37 ms (gleiche Saat).
  - Hülle: 68,7 µs kalt, 1,5 µs warm (2 000 Rufe).
  - Kette mit gierigem Grundriss: 0,32 ms kalt, 0,16 / 0,62 ms Q50 / Q90 warm; erschöpfend 4,85 ms Q50 (20 Rufe).
  - Gerechnet, nicht gemessen: DORF + 90 Hüllen = 0,67 + 90 · 0,0015 = 0,80 ms; DORF + 90 gierige Grundrisse = 15,2 ms.
  - Rauschen zwischen drei Läufen derselben Datei: DORF warm 0,67–1,18 ms, Hülle kalt 69–129 µs.
  - Ein „kalter DORF der Kette“ existiert nicht. Er ist nicht gemessen.
- **S-h** (spike-v2.log „Höhe ↔ Druck“, Zweitzählung GLEICH).
- **S-i** (spike-v2.log „S-i“). Miete = 3 · Miet-Haushalte / (3 · Miet-Haushalte + Köpfe). 3 Leute je Miet-Haushalt wie SP:291.

## (4) DIE 100 UND DREI GRUNDRISSE

**Auswahl** (spike-v2.cjs:208–222), deterministisch aus dem Strom `ax("hundert", adr)`:
- Zellen Epoche (< 1300 · 1300–1499 · 1500–1699 · ≥ 1700) × Klasse × Gewerbe, im Wechsel über die Zellen gezogen.
- Zuerst der erste gültige Kaufmann; dazu Hang und Ecke als Zwillinge echter Lose.
- Das Merkmal ist gewählt: Hang = Gefälle 15 %, Ecke = zweite Straßenseite.
- Verteilung: Epoche 26/23/26/25 · Klasse 36/33/31 · 11 Gewerbe, Kaufmann 4.

Statt „Saaten 1–2“ (entscheid-v2 §5) kommen die 100 aus allen 30 Saaten. Die Saaten 1–2 tragen nur zwei Gründungsjahre (1068, 1549) und zwei
Regionen (stadt-b: G1 mitteleuropa, G2 mediterran) — zu wenig für Epoche × Wohlstand × Gewerbe.

**Ergebnis:** gültig 48/100 · S-a 16 · Mutante ROT 34 · S-b 0 · HAUS (MASSNUR + Gerüst) 59,5 ms Q50 je Bau.

ASCII (ascii.log, Raster 0,5 m; `#` Außenwand, `=` tragende Bandwand, `:` Flurwand, `|` Querwand, `~` Unterzug, `o` Ständer,
`T` Treppenloch, Lücke = Tür; Straße oben):

```
Kaufmann — G20#28 · mediterran · Baujahr 1616 · kaufmann/Klasse 2 · 12 Köpfe · Los 39,61 m (2 Käufe) · Druck 0,855
   Haus 36 × 5 m × 2 Geschosse (Grund 1 + 1 Aufstockung 1736 ohne Grundriss) · Traufe 5,24 m · Eiche L_max 4,59 m · s='z' · Treppe quer
   o##o##o##o##o##o##o##o##o##o##o#o##o o##o#o##o##o##o##o##o##o##o##o##o##o
   #                       o     :           :     o           o           #
   o         stube               o           o         kamme       kamme   o
   #                             :           :                             #
   #                       o     :           :     o           o           #
   o==o==o==o==o==o==o==o==o~~~~~o~~~~~o~~~~~o~~~~~o==o==o==o==o==o==o==o==o
   #           o           o     o           o     o           o           #
   o   kamme       kuech                               kamme       kamme   o
   #           o           o     o TTTTTTTTT o     o           o           #
   #           |           |     : TTTTTTTTT :     |           |           #
   o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o##o
   Balkenfeld Band 0: s 0–2,36 m · Spann 2,36 · Band 1: s 2,36–4,84 · Spann 2,48 · Balken in s, e 0,85
   Decke über G0 (oberste der Grundriss-Geschosse): 42 Stücke, 0 über L_max, größte 2,48 m
   (Kontor als Halle unter den Labels verdeckt; Lager 80 m² „dach“ und Keller baut A nicht)

Hang — G4#10·Hang · alpin · Baujahr 2000 (!) · schmied/Klasse 1 · 3 Köpfe · Miete 1 · Los 25,15 m · Druck 0,945
   Haus 21,5 × 6 m × 1 Geschoss · Traufe 3,00 m · Nadel L_max 5,62 m · Treppe quer-spar (in einem eingeschossigen Haus) · Zwilling GLEICH
   o##o#o##o##o#o##o#o#o  o#o#o##o##o###o##o##o
   #       o       o          o         o     #
   #                                          #
   o kamme   kuech               stube   kammeo
   #       o       o          o         o     #
   o==o=o==o==o=o==o~~~~~o~~~~o==o==o===o==o==o
   #               :          :               #
   o               o          o               o
   #                                          #
   #     werks                      miete     #
   o               o TTTTTTTT o               o
   #               : TTTTTTTT :               #
   o##o##o###o##o##o##o##o#o##o##o##o###o##o##o
   Band 0: 0–2,53 · Band 1: 2,53–6,10 (Spann 3,57) · oberste Decke 25 Stücke, 0 über L_max

Ecke — G2#9·Ecke · mediterran · Baujahr 1766 · kraemer/Klasse 2 · 6 Köpfe · Los 21,38 m · Druck 0,95
   Haus 18 × 5 m × 2 Geschosse (Grund 2) · Traufe 5,24 m · Eiche L_max 4,59 m · Treppe quer · Zwilling GLEICH
   o##o#o##o##o##o#o##o o##o#o###o##o##o
   #             o           o         #
   o    kuech                   laden  o
   #             o           o         #
   o==o=o==o==o==o~~~~~o~~~~~o===o==o==o
   #             :           :         #
   #             o           o         #
   o    stube                   lager  o
   #             o TTTTTTTTT o         #
   #             : TTTTTTTTT :         #
   o##o#o##o##o##o##o##o##o##o###o##o##o
   Band 0: 0–2,23 · Band 1: 2,23–5,05 (Spann 2,83) · Decke über G0 26 Stücke, über G1 21 Stücke, 0 über L_max
```

Was die drei zeigen:
- Alle drei sind 18–36 m breite, 5–6 m tiefe Riegel (K1 wörtlich).
- Der Laden des Eckhauses liegt an EINER Straße; die zweite Seite liest niemand.
- Das Haus am Hang steht wie im Flachland, im Jahr 2000 eines Plans von 1153 (Punkt 8 oben).
- Alle drei sind „quer“-Treppen; keines dieser drei fällt unter S-a (die 16 der 100 sind „wechsel“).

## (5) SCHLIESSUNGEN UND ANNAHMEN, die der Spike über den Entscheid hinaus brauchte

| # | Wert | wo | Status |
|---|---|---|---|
| K1 | W = halb(b) bis 12 m, darüber halb(b − 3,5); keine Obergrenze | spike-v2.cjs:64 | gewählt (entscheid-v2 §1 wörtlich gelesen; Lauf EB = B's Regel als Gegenprobe) |
| K2 | Los-Tiefe 30 m, Hof ≥ 4 m, dZiel 11 m | spike-v2.cjs:36 | gewählt (Richter), A G6, S4 |
| K3 | hof(Druck) als EG-Tiefen-Grenze 11·(1 − (Druck − 0,5)), also 11 → 5,5 m | spike-v2.cjs:37, 65 | gewählt — der Entscheid nennt keine Form. Die RICHTUNG (mehr Druck → mehr Hof) ist **unsicher**; ob dichte Kerne eher den Hof überbauten, ist hier nicht nachgeschlagen |
| K4 | Stoff: Fachwerk und Stein → Eiche-Decke, Block und Ständer → Nadel 0,30 | spike-v2.cjs:38 | gewählt (wie Richter); Nadel-d unsicher (A S2) |
| K5 | Miet-Haushalt = ein OG-Raum 27,3 m², 3 Leute | spike-v2.cjs:39, 57–61 | belegt aus SP:55 (B), Leute-Zahl SP:291 |
| K6 | Lauf H: Druck hebt kontor, stube, lager, webstube, werkraum ins OG | spike-v2.cjs:40, 70–73; grundriss-a.cjs:85–86 | gewählt, nicht im Entscheid (Gegenprobe) |
| K7 | `huelleVon` ausgeschrieben = A's Ausrichtung/Tiefe ohne Belegung, st ∈ {1, 2}, n = ⌈Ls/L_max⌉ | spike-v2.cjs:82–95 | gewählt — der Entscheid gibt nur die Signatur (§3) |
| K8 | Druck aus t auf 0,01 gerundet (die Haus-Liste SP:378 rundet) | spike-v2.cjs:51 | gewählt, Fehler ≤ 0,005 |
| K9 | Paarprüfung „Gegenwelt“ und Mutante D | spike-v2.cjs:163–180 | gewählt (über §5 hinaus) |
| K10 | Prüfer: Streichbalken an paralleler tragender Wand; Auflager bis ± post/2 über das Linien-Ende; Podest im lichten Innern | linse-v2.cjs:45–48, 19–20, 89 | gewählt; post 0,16 belegt FC:179 |
| K11 | 100 aus allen 30 Saaten statt aus Saat 1–2 | spike-v2.cjs:208–214 | gewählt (Grund oben) |
| K12 | Hang = Gefälle 15 %, Ecke = zweite Straßenseite, als Merkmal am Los | spike-v2.cjs:215–222 | gewählt; ohne Leser in Kette und Kern (gemessen) |
| K13 | HAUS-Bau mit `nur = MASSNUR + geruest`, `keller 0, annexN 0, balcony 0, grundriss 'I'` | spike-v2.cjs:226, 243 | gewählt (wie spike/haus100.cjs:79) |
| — | A's `dach`-Räume (Lager 80 m² des Kaufmanns, Trockenboden) und Keller sind nicht gebaut | GP:78–86 `aussen` | belegt (A §1), offen |

## (6) WAS DIESER SPIKE NICHT WEISS

- **Wie ein Haus des Gesetzes aussieht.** Kein Bild. Der Kern baut keinen Grundriss nach A; S-a und S-b sind an der Geometrie des Bauplans gezählt, nicht am HAUS.
- **Ob eine andere Druck-Regel trägt.** Gemessen sind drei: E, K und H (H mit gewählter Raumliste). Ohne eine Verteilung des Programms
  über die Geschosse sehe ich keinen Weg (Punkt 1). Das ist eine Folgerung aus GP:88–97, nicht gemessen für jede denkbare Regel.
- **Ob eine bessere Hülle den Grundriss trifft.** K7 ist meine Schreibung. Eine Hülle, die A's Band-Klemmen und Treppen-Zug
  vorwegnimmt, könnte öfter treffen. S-g bleibt bis dahin NICHT ENTSCHEIDBAR.
- **Die erschöpfenden Läufe 0, H, EB, K** sind nicht gerechnet (Abbruch nach > 6 min). Lauf E erschöpfend liegt 3,5 Punkte besser im
  Ausfall, im Urteil gleich.
- **Laslett** (S-i) nur aus Zusammenfassungen; GEWERBE-Zeilen unsicher (R1 S3); alle Ereignis-Raten von B gewählt.
- **Nicht gezählt:** Tris, Draw-Calls und ms im Spiel; der Speicher der Bewohner; Wechselbalken, Wand auf Unterzug, Schub, Kamin (A Punkt 7).
- **Prüfer-Hand:** die Linse ist von mir, getrennt vom Bau (A). Die Kette (Breite, Höhe, Druck) ist aber auch von mir. Für Traufe und Breite
  prüft darum dieselbe Hand, die gebaut hat — nur die Zweitzählung (zaehl/spike-v2-zweit.cjs) ist neuer Code.
