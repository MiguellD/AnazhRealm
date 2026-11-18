# ZÄHL — die Zahlen der Tafel und des Entscheids zweitgezählt (Bau-Zensus Runde 2, Lese-Baum main b7ed8419)

Skripte (alle hier, `node <skript>` aus diesem Ordner): `zaehl-tafel.cjs` (Tafel + Blätter + Deckung), `zaehl-welle.cjs`
(Welle 1 aus entscheid.md §(2)), `stichprobe.cjs` (30 Größen am Code, Wurzel n1011-hg). Regeln stehen im Kopf jedes Skripts.
Kein Rückfall: ein nicht zählbares Feld wirft. Gelesen nur Dateien; git nur lesend (`rev-parse`, `diff --stat`).

## WAS NICHT HÄLT (oben, weil es zählt)

1. **Die Zahlen sind arithmetisch dicht, aber nur in sich.** Das Skript zählt 882 / 769 / 127 / 58 / 55 und 196 / 14 / 559 exakt nach —
   es prüft die Summen über die Zeilen der Tafel, nicht, ob jede Zeile die richtige Zahl n trägt. Die Brücke Blätter → Tafel
   (1 047 → 882 Größen, 842 → 769 ohne Anker, tafel.md:26–40) ist **Freitext ohne Teilzahlen** und maschinell nicht zählbar.
   Von Hand erklärt sind 81 der 165 fehlenden Größen (Liste unten, „Brücke“), 84 bleiben ohne Teilzahl (unsicher).
2. **Die Einheit „Größe“ ist nicht einheitlich.** D5 zählt jeden Einzelwert (NOISEAMP = 18, tafel.md:172; KULTUR.col = 99 Hex,
   tafel.md:163), D6 zählt Schrägstrich-Paare als eine Größe (gasseAb/Hinter = 1, tafel.md:200; lesen-f-stadtplan.md:23 „Eine
   Zeile = eine Größe bzw. ein Bündel“), D7 zählt 64 Messwerte als 1 Block (tafel.md:37). D5 allein trägt 385 der 769
   (50,1 %, Rechenweg 385/769). Wer „25 % fallen“ liest, liest eine Quote über gemischte Einheiten; ohne D5 sind es 122/384 = 31,8 %.
3. **Eine Teil-Dublette, nicht abgezogen (belegt):** c#43 „Wand-Ausfachung um die Öffnung“ (D3, tafel.md:119, n 1) trägt
   Backstein 0,085 (`bt=dick||0.085`, fachwerk-core.js:641) und GLATT 0,16 (= post, fachwerk-core.js:678) — beide stehen schon in D2
   (Gefach-Backstein tafel.md:90, Wanddicke glatt tafel.md:91). Eigen ist nur Lehm 0,06 (fachwerk-core.js:644). Der Entscheid lässt
   beides fallen (D2 „Gefach-Backstein (1)“, „Wanddicke … (4)“ und D3 „Ausfachung (1)“, entscheid.md:246–251). Folge, wenn c#43 nur
   für 0,06 steht: Zahl unverändert; wenn c#43 als Dicken-Gruppe gemeint ist: 769 → 768 und 196 → 195 (unsicher, welche Lesart gilt).
4. **Stichprobe:** 1 von 30 datei:zeile stimmt am Kopf b7ed8419 nicht mehr (NAESSE, Code-Drift nach 18058dba, kein Fehler der
   Tafel an ihrem Stand); 3 von 30 Leser-Zitate zeigen auf eine Kommentarzeile oder einen Folgewert statt auf den Leser.
   0 von 30 Werten falsch, 0 von 30 übersehene Anker, 4 von 4 „kein Leser/tot“-Behauptungen bestätigt. Die Auswahl ist **gewählt**,
   nicht zufällig (benannte Konstanten, leicht prüfbar) — die Quote ist eine Untergrenze für diese Art Zeile.
5. Weiter ungeprüft (nicht dieser Schritt): Spearman 0,09, 3,11 Leute je Haus, 2,26 ms je Plan (entscheid.md:58–59).

## DIE ZAHLEN — Tafel sagt · Skript zählt · Differenz · Ursache

| Zahl | Tafel/Entscheid sagt (Ort) | Skript zählt | Diff. | Ursache der Differenz |
|---|---|---|---|---|
| Größen gesamt | 882 (tafel.md:24) | 882 (zaehl-tafel) | 0 | — (Teil-Dublette c#43 siehe oben 3) |
| GESETZT ohne Anker | 769 (tafel.md:24) | 769 = Σ Spalte n | 0 | — (c#43: ggf. 768, unsicher) |
| Zeilen ohne Anker | 127 (tafel.md:24) | 127 | 0 | — |
| GESETZT mit Anker | 58 (tafel.md:24) | 58 Glieder der „Mit Anker“-Listen | 0 | — |
| FOLGT | 55 (tafel.md:24) | 55 Glieder der „FOLGT“-Listen | 0 | — |
| je Domäne D1–D8 (4 Summen) | tafel.md:16–23 + Köpfe ### + (k) | gleich, 8 × 9 Prüfungen | 0 | — |
| Blätter Σ Größen | 1 047 (tafel.md:26) | a 97 · b 75 · c 66 · d 84 · e 420 · f 153 maschinell = 895; g 152 nur aus der Schlusszeile (g hat kein n je Zeile) | 0 | Hand: 895 + 152 = 1 047 |
| Blätter Σ ohne Anker | 842 (tafel.md:27) | a 74/75 (Lesart, siehe unten) · b 62 · c 51 (+3 TEILS) · d 55 (+3 Samen) · e 402 · f 128 · g 69 (Schluss) | 0 | Hand: 75+62+51+55+402+128+69 = 842 |
| Welle fällt | 196 (entscheid.md:232) | 196 = Σ Klammerzahlen vor „Anker neu:“ | 0 | — (c#43: ggf. 195) |
| Welle verankert | 14 (entscheid.md:232) | 14 | 0 | 2 Glieder ohne Klammerzahl als 1 gezählt: D2 foundH (entscheid.md:248), D3 Anbau-Tor (entscheid.md:252–253) |
| Welle bleibt | 559 (entscheid.md:232) | 559 = 769 − 196 − 14 | 0 | — |
| 25 % / 32 % | entscheid.md:89–90 | 25,5 % / 31,8 % (122/384) | Rundung | „25 %“ ist abgeschnitten, gerundet 25 (25,49 %) |
| 58 → 5 fallen, 53 bleiben | entscheid.md:234–235 | Hand: 5 Namen gelistet, 58 − 5 = 53 | 0 | LEUTE_GESETZ.flaeche steht auch im D1-Glied „(3)“ (entscheid.md:237) — Name doppelt, Zahl nicht: die (3) sind a#3, a#4, a#37 (tafel.md:53) |

**Blatt a, zwei Lesarten (maschinell):** Urteilsspalte allein gibt 91 GESETZT / 0 Anker / 6 FOLGT; die Anker-Spalte gibt 74 ohne / 17 mit.
Die Schlusszeile sagt 75 / 16 (lesen-a-raumprogramm.md:159). Die Differenz 1 ist a#54 (Kirchen-Marke, Anker-Spalte „Region/Jahr (Wahl)“),
die die Tafel selbst benennt (tafel.md:39–40). Blatt d ebenso: Anker-Spalte 58 ohne (= 55 + 3 „nur Samen“) / 8 mit — gleich der
Schlusszeile (lesen-d-dach.md:164).

**Name/n-Warnungen:** tafel.md:193 „STADT_FORM übrige 12“ trägt n 10 — n ist richtig (f#33–42 = 10 Zeilen, lesen-f-stadtplan.md:59–68),
der Name zählt randTeil/kern (mit Anker) mit. tafel.md:163 „(32 Kulturen)“ vs n 99 ist kein Fehler (32 Kulturen, 99 Hex).

**Deckung (maschinell):** jede Blatt-Zeile a–d, f, g wird in Teil 1 mindestens einmal genannt (0 verloren). Drei Blatt-Zeilen stehen in
zwei Domänen: b#67 (D4 Ziegel-Geometrie tafel.md:140 + D5 VERBAND deckung tafel.md:166 — Zwilling Z7, zwei Code-Orte, zu Recht zweimal),
c#34 (D3 FOLGT tafel.md:126 + Verweis im D4-Gauben-Bündel tafel.md:145 — n dort 5 = d#55–59, keine Doppelzählung),
f#71 (D1 Viertel-Grammatik tafel.md:64 + D6 Kirche/Burg tafel.md:198 — f#71 bündelt Burg-Regel UND herrAb 49; herrAb zählt in D1 als a#59,
die Burg-Regel in D6: keine Doppelzählung der Zahl, nur des Verweises).

**Glied-Probe Welle (von Hand):** jedes fallende Glied (z) wurde gegen das n seiner Tafel-Zeile gelegt; kein Glied übersteigt seine Zeile
(z. B. D3 „acht Teilbau-Maßsätze (8)“ ↔ tafel.md:118 n 8; D2 „post … pfetteH (8)“ + „sparH (1)“ ↔ tafel.md:83 n 9; D4 Kamin
„Existenz, Herd-Lage (2)“ + Anker „Kaminkopf (1)“ ↔ tafel.md:149 n 5; D5 „KULTUR.col 11+7+4+2+2 (26)“ ↔ tafel.md:163 n 99).
Geprüft D1–D7 alle Glieder, D8 fällt 0. Die maschinelle Warnung „FC:171 in D2+D4“ ist keine Doppelzählung: auf der Zeile stehen
zwei Größen (jetty → D2, pitchDeg → D4; fachwerk-core.js:171).

## BRÜCKE Blätter → Tafel (Freitext tafel.md:26–40, von Hand mit Liste)

Fehlend 1 047 − 882 = 165 Größen. Von Hand belegt:
- g#19 LOD_SCHIRM.fehler 64 → 1 Block (tafel.md:37, 225): **−63**.
- D5 aus e: e 420 → D5 402 = −18: REGION_HIST 6 + EPOCHEN 9 → D6 mit Anker als 2 Glieder (tafel.md:211, lesen-e-stoffe.md Urteil „6/9 GESETZT“) = −15+2 in D6;
  Region-Würfel 1 → D6 DORF-Würfel (tafel.md:195); FENSTER_SCHLAF 1 → D3 (tafel.md:114); INNEN_DAEMMER 1 → D3 mit Anker (tafel.md:125).
  Probe: 420 − 15 − 1 − 1 − 1 = 402 = D5 gesamt; ohne Anker 402 − 15 − 1 − 1 = 385 = D5 ohne (der Rest der 402 e-Gesetzten). **−18**.
Summe von Hand **−81**; Rest **−84** (Dubletten foundH/egH/ogH, ovEave/ovRake, STADT_MASSEN, Viertel-Grammatik, LEUTE_GESETZ u. a.,
tafel.md:29–31) — ohne n je Blatt-Zeile in g und ohne Zeilen-Liste der Dubletten nicht zählbar (unsicher).
Für ohne Anker: 842 − 769 = 73. Von Hand belegt −15 (REGION_HIST + EPOCHEN wechseln von „ohne“ in e zu „mit Anker“ in D6,
tafel.md:34–35); Region-Würfel und FENSTER_SCHLAF wechseln nur die Domäne und bleiben „ohne“ (0). Rest −58 nicht zählbar (unsicher).

## STICHPROBE 30 „ohne Anker“-Größen am Code b7ed8419 (stichprobe.cjs)

Stand: fachwerk-core.js 18058dba ↔ b7ed8419 unverändert (`git diff --stat` leer); stamm/stoff-material.js +7/−1.

| # | Größe (tafel.md) | datei:zeile | Wert | Leser | Anker? | Urteil |
|---|---|---|---|---|---|---|
| 1 | LEUTE_GESETZ.max (54) | FC:9526 | 12 ✓ | 2274, 9531, 9537 ✓ | Kommentar 9523–9525 ohne Quelle | stimmt |
| 2 | Packer capK (56) | FC:2255–2270 (Wert 2256) | ✓ | 2264–2267 | keiner | stimmt |
| 3 | Keller-Würfel 0,35 (58) | FC:4446 | ✓ | FC:212 ✓ | keiner | stimmt |
| 4 | Innenwand 0,12 / Tür 1,0×2,0 (66) | FC:897 | ✓ | 898 ✓ | keiner | stimmt |
| 5 | Herd 1,5 × 1,1 (70) | FC:589 (halb 0,75/0,55) | ✓ | 590, 922, 1244 ✓ | keiner | stimmt |
| 6 | TAGES_GESETZ.angebot (72) | KC:5177–5187 | ✓ | KC:5243 ✓ | keiner | stimmt |
| 7 | foundH (81) | FC:178 | ✓ | 8 Fundstellen ✓ | keiner | stimmt |
| 8 | sparH „0 Leser“ (83) | FC:180 | ✓ | 0 Fundstellen ✓ | — | stimmt |
| 9 | jetty „tot“ (85) | FC:171 | ✓ | 0 Fundstellen ✓ | — | stimmt |
| 10 | bayMax (84) | FC:181 | ✓ | 420 ✓ (+1842 Kommentar) | keiner | stimmt |
| 11 | Diele (92) | FC:860 | ✓ | 861 ✓ | keiner | stimmt |
| 12 | Tempel-Modul „kein Spiel-Pfad“ (98) | bau-teile.js:1296 | ✓ | `_buildClassicalTemple` ohne Rufer (Def :1291, Kommentar :2980) ✓ | keiner | stimmt |
| 13 | winEG/winOG (107) | FC:476 | ✓ | 491, 495 ✓ | keiner | stimmt |
| 14 | Flügel 0,62 rad (111) | FC:1084, 1089 | ✓ | 339, 2788 ✓ | keiner | stimmt |
| 15 | FENSTER_SCHLAF (114) | FC:2751 | ✓ | 2758 ✓ | keiner | stimmt |
| 16 | Möbel-Freizone 0,40 (116) | FC:634 | ✓ | 635 ✓ | Grund „Belichtung“ (632), keine Zahl-Quelle | stimmt |
| 17 | ovEave/ovRake (135) | FC:181 | ✓ | 707, 1800 ✓ | keiner | stimmt |
| 18 | Kniestock 1,15 (144) | FC:887 | ✓ | 887 ✓ | Zweck „Stehraum ≥ 1,9“ (886), keine Quelle für 1,15 | stimmt |
| 19 | STIL_GRENZNEIGUNG (134) | FC:160 | ✓ | 208, 2230 ✓ | keine Norm (157–159) | stimmt |
| 20 | STACK_W 0,84 (149) | FC:219 (in der Zeile genannt) | ✓ | 928–932 ✓ | keiner | stimmt |
| 21 | NAESSE 8/64/4 (151) | **stoff-material.js:3793–3796 → heute 3799–3802** | ✓ | stoff-dach.js:155–269 ✓ | keiner | **Zeile verschoben (Drift)** |
| 22 | DEFCOL (162) | FC:2119 | ✓ | 14 Fundstellen ✓ | keiner | stimmt |
| 23 | NOISEAMP (172) | FC:2320 | ✓ | 2426, 2468 ✓ | keiner | stimmt |
| 24 | WEG_GESETZ.ton (175) | FC:10099 | ✓ | **SW:1376 ist Kommentar**, Leser SW:1404 (`W.ton`) | keiner | Leser-Zitat ungenau |
| 25 | Zaun-Holz (179) | SW:2731 | ✓ | — | keiner | stimmt |
| 26 | DORF_NORM.budget „tot“ (194) | FC:3649 | ✓ | geschrieben FC:4516, `norm.budget` 0 Leser ✓ | keiner | stimmt |
| 27 | STADT_NETZ (191) | FC:3819 | ✓ | 11 Fundstellen ✓ | jeKachel mit Spike-Anker, zu Recht dort | stimmt |
| 28 | ORT_SIEDLUNG (208) | gelaende-core.js:5762 | ✓ | ORT:1710 ✓; **ORT:1431 liest `ort.siedlung.bau` (Folgewert)** | keiner | Leser-Zitat ungenau |
| 29 | STADT_MASSEN (222) | FC:4072 | ✓ | 4492, 4494 ✓ | keiner | stimmt |
| 30 | WELT_MARCH satzPx (220) | dienst.js:2322 | ✓ | **dienst.js:739 Kommentar**, Leser 742/746 | keiner | Leser-Zitat ungenau |

**Fehlerquote:** datei:zeile am Kopf b7ed8419 1/30 = 3,3 % (Drift, am Stand 18058dba nicht nachprüfbar ohne checkout) · Wert 0/30 ·
Anker übersehen 0/30 · Leser-Behauptung falsch 0/30 · Leser-Zitat ungenau 3/30 = 10 %.

---

## ROHE AUSGABE `node zaehl-tafel.cjs`

```
TAFEL tafel.md — Teil 1 Z.42–238 (Regel im Kopf dieses Skripts)
Dom | ohne(Σn) Zeilen | mit  | FOLGT | gesamt || Kopf ohne/Zeilen | (k) mit/FOLGT | SUMME ges/ohne/Zeilen/mit/FOLGT
D1  |   72     21    |   11 |     4 |     87 ||   72/21       |  11/ 4         | 87/72/21/11/4
D2  |   52     18    |    2 |     3 |     57 ||   52/18       |   2/ 3         | 57/52/18/2/3
D3  |   47     17    |    5 |     9 |     61 ||   47/17       |   5/ 9         | 61/47/17/5/9
D4  |   54     21    |    1 |    13 |     68 ||   54/21       |   1/13         | 68/54/21/1/13
D5  |  385     19    |    9 |     8 |    402 ||  385/19       |   9/ 8         | 402/385/19/9/8
D6  |  112     22    |   17 |     8 |    137 ||  112/22       |  17/ 8         | 137/112/22/17/8
D7  |   31      6    |   13 |     5 |     49 ||   31/ 6       |  13/ 5         | 49/31/6/13/5
D8  |   16      3    |    0 |     5 |     21 ||   16/ 3       |   0/ 5         | 21/16/3/0/5
Σ   |  769    127    |   58 |    55 |    882 || SUMME-Zeile 882/769/127/58/55 (tafel.md:24)
Abweichungen Tafel: keine
  Name/n: tafel.md:163 "KULTUR.col (32 Kulturen)" nennt 32, n = 99
  Name/n: tafel.md:193 "STADT_FORM übrige 12" nennt 12, n = 10

BLÄTTER (2)-Tafeln, maschinell nach Urteilszelle — Vergleich mit der Schlusszeile
lesen-a: 97 Zeilen · Größen 97 · GESETZT 91 · mit Anker 0 · FOLGT 6
         Schluss: Schluss: Größen gesamt 97 · davon GESETZT ohne Anker 75 · davon FOLGT 6 (Nr. 33, 34, 40, 41, 42, 79; 33/34 nur im Labor) · GESETZT mit Anker (nur Kommentar, keine Quelle)
         Anker-Spalten-Lesart: GESETZT ohne 74 · mit Anker/Etikett 17
lesen-b: 75 Zeilen · Größen 75 · GESETZT 62 · mit Anker 5 · FOLGT 8
         Schluss: Schluss: 75 Größen gesamt · 62 GESETZT ohne Zahlen-Anker (davon 2 tot, 3 nur in Labor/Playtest: #60, #61, #75) · 8 FOLGT (5 im Hausbau, alle nur Samen × gesetzte Kultur-M
         Anker-Spalten-Lesart: GESETZT ohne 55 · mit Anker/Etikett 12
lesen-c: 66 Zeilen · Größen 66 · GESETZT 54 · mit Anker 5 · FOLGT 7
         Schluss: Größen gesamt 66 · davon GESETZT ohne Anker 51 (dazu GESETZT mit Anker 5, TEILS 3) · davon FOLGT 7
         Anker-Spalten-Lesart: GESETZT ohne 48 · mit Anker/Etikett 11
lesen-d: 84 Zeilen · Größen 84 · GESETZT 66 · mit Anker 0 · FOLGT 18
         Schluss: Größen gesamt 84 · davon GESETZT ohne Anker 55 (+ 3 nur Samen: #56, #69, #84; + 8 GESETZT mit benanntem Anker) · davon FOLGT 18 (inkl. der Mischzeilen #6, #63, #71, deren
         Anker-Spalten-Lesart: GESETZT ohne 58 · mit Anker/Etikett 8
lesen-e: 47 Zeilen · Größen 420 · GESETZT 402 · mit Anker 10 · FOLGT 8
         Schluss: Schluss: 420 Größen gesamt · davon GESETZT ohne Anker 402 · davon FOLGT 8 (dazu 10 mit Anker: NF ×3, DIN ×2, IEC, USDA, FeO(OH), MERL, interne Leuchtdichte-Messung).
         (e: 24 Rollen-Einzelzeilen ohne Zahl-Urteil übersprungen, in der Summenzeile enthalten)
lesen-f: 153 Zeilen · Größen 153 · GESETZT 128 · mit Anker 17 · FOLGT 8
         Schluss: Schluss: 153 Größen gesamt · davon GESETZT ohne Anker 128 · davon FOLGT 8 (17 GESETZT mit Anker).
         Anker-Spalten-Lesart: GESETZT ohne 125 · mit Anker/Etikett 20
lesen-g: 53 Zeilen · Größen 53 · GESETZT 37 · mit Anker 12 · FOLGT 4
         Schluss: Stufen: 8 (+ nurWurf-Schatten, Horizont leer) · Größen gesamt: 152 (53 Zeilen) · davon GESETZT ohne Anker: 69 · Zwillinge: 10 (davon 1 latent)
         Anker-Spalten-Lesart: GESETZT ohne 37 · mit Anker/Etikett 12

DECKUNG Teil 1 → Blatt-Zeilen (Verweise x#N in tafel.md Z.42–238)
a: Blatt 97 Zeilen · in Teil 1 genannt 97 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D1 85 · D2 4 · D4 1 · D6 6 · D7 1 · in > 1 Domäne: 0
b: Blatt 75 Zeilen · in Teil 1 genannt 75 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D1 7 · D2 53 · D4 4 · D5 4 · D6 2 · D8 6 · in > 1 Domäne: 1 [b#67 in D4+D5]
c: Blatt 66 Zeilen · in Teil 1 genannt 66 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D2 2 · D3 61 · D4 2 · D5 2 · in > 1 Domäne: 1 [c#34 in D3+D4]
d: Blatt 84 Zeilen · in Teil 1 genannt 84 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D1 2 · D2 6 · D4 63 · D5 2 · D6 2 · D7 5 · D8 4 · in > 1 Domäne: 0
f: Blatt 153 Zeilen · in Teil 1 genannt 153 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D1 10 · D6 137 · D7 7 · in > 1 Domäne: 1 [f#71 in D1+D6]
g: Blatt 53 Zeilen · in Teil 1 genannt 53 · nie genannt 0
   Zeilen je Domäne (eine Zeile kann in mehreren stehen): D2 4 · D4 4 · D6 4 · D7 41 · in > 1 Domäne: 0
```

## ROHE AUSGABE `node zaehl-welle.cjs`

```
WELLE 1 — entscheid.md §(2) Z.220–279 (Regel im Kopf dieses Skripts)
Dom | ohne(Tafel) | fällt  | verankert | bleibt || Kopf (N) | §(2)-Tafel ohne/fällt/Anker/bleibt
D1  |          72 |     42 |         0 |     30 ||       42 | 72/42/0/30 (Z.224)
D2  |          52 |     22 |         1 |     29 ||       22 | 52/22/1/29 (Z.225)
      Anker-Glied ohne Klammerzahl, als 1 gezählt: „foundH → sockel 0,30 (DIN 68800-2)“
D3  |          47 |     21 |         1 |     25 ||       21 | 47/21/1/25 (Z.226)
      Anker-Glied ohne Klammerzahl, als 1 gezählt: „Anbau-Tor → Wagen lichtM (BRUECKE_GESETZ FC:4662, Blatt f#13“
D4  |          54 |     14 |         9 |     31 ||       14 | 54/14/9/31 (Z.227)
D5  |         385 |     74 |         3 |    308 ||       74 | 385/74/3/308 (Z.228)
D6  |         112 |     12 |         0 |    100 ||       12 | 112/12/0/100 (Z.229)
D7  |          31 |     11 |         0 |     20 ||       11 | 31/11/0/20 (Z.230)
D8  |          16 |      0 |         0 |     16 ||    (kein) | 16/0/0/16 (Z.231)
Σ   |         769 |    196 |        14 |    559 || Σ-Zeile 769/196/14/559 (entscheid.md:232)
Abweichungen: keine
Anteil: 196/769 = 25.5 % · ohne D5: 122/384 = 31.8 %
FC-Zeile in zwei Domänen fallend: FC:171 in D2+D4
```

## ROHE AUSGABE `node stichprobe.cjs`

```
Wurzel C:\Users\micha\Desktop\AnazhRealm-OMEN\n1011-hg · 126 Spiel-.js-Dateien durchsucht (ohne scripts/, node_modules)

#1 D1 LEUTE_GESETZ.max 12 — tafel.md:54 · fachwerk-core.js:9526 · Wert STEHT an der Zeile
    9523: // mindestens 1, höchstens `max`. Die Rollen ohne Haushalt tragen ihre Zahl (`rolle`): die Scheune und die Halle des
    9524: // Gewerbes niemanden, die Kirche ihren Pfarrer, die Schmiede Meister und Gesellen. REIN: dieselbe Zeile ⇒ dieselbe Zahl.
    9525: // Leser: der Wirt (die Bewohner je Haus) und gate:kreatur-takt bewohner.
   >9526: var LEUTE_GESETZ = { nutz: 0.7, flaeche: 20, wohlFlaeche: 20, max: 12, rolle: { scheune: 0, halle: 0, kirche: 1, schmiede: 2, kapelle: 0, speicher: 0, zeughaus: 0, backhaus: 2, torhaus: 2 } 
    9527: function leuteVon(hp) {
   Leser fachwerk-core.js:2274: hp.leute=Math.max(0,Math.min(LEUTE_GESETZ.max,P)); hp.programm=N.zeile||null;
   Leser fachwerk-core.js:9531: if (isFinite(hp.leute) && hp.leute !== null) return Math.max(0, Math.min(LEUTE_GESETZ.max, Math.round(Number(hp.leute)))); // der Haushalt des Loses (bauProgramm schreibt ihn)
   Leser fachwerk-core.js:9537: return Math.max(1, Math.min(LEUTE_GESETZ.max, Math.round(fl / jeP)));

#2 D1 Packer capK 1,6/1,3/0,55 — tafel.md:56 · fachwerk-core.js:2255 · Wert FEHLT an der Zeile
    2252: if(lage==='anbau'){ A.anbau+=a; continue; } if(lage==='fluegel'||lage==='hof_umlauf'){ A.fluegel+=a; continue; }
    2253: if(lage==='turm') A.turm+=a;
    2254: A[g==='og'?'og':g==='alle'?'alle':'eg']+=a; }
   >2255: const pz=hp.parzelle||hp, F0=Math.max(20,pz.W*pz.D), dicht=!!rahmen.dicht, kultSt=(KULTUR[hp.kultur]||{}).st||1;
    2256: const turmig=A.turm>0&&A.turm>=0.5*(A.eg+A.og+A.alle), capK=Math.min(165, F0*(turmig?0.55:dicht?1.3:1.6)), capL=F0*(dicht?1.6:2.6);
   Fundstellen "capK" außer Def: 4 — fachwerk-core.js:2256 fachwerk-core.js:2264 fachwerk-core.js:2265 fachwerk-core.js:2267

#3 D1 Los-Würfel Keller 0,35 — tafel.md:58 · fachwerk-core.js:4446 · Wert STEHT an der Zeile
    4443: else if(t9>0.74&&p.baujahr>1915&&rnd()<0.55) p.storeys=Math.max(p.storeys, 6+((rnd()*5)|0)); }
    4444: if(staedtisch&&w>0.9&&p.storeys<4)p.storeys++; p.turmbau=0;
    4445: if(DP.erbe&&DP.erbe.hoch>0) p.storeys=Math.max(1, Math.min(12, Math.round(p.storeys*DP.erbe.hoch))); /*DIE HOEHE DES VIERTELS (STADT_FORM, `viertelWort`): die Geschosse steigen zur Mitte der
   >4446: p.keller=(rnd()<0.35)?1:0; p.annexN=(rnd()<0.25)?1:0;
    4447: p.arm=(n>=16&&w<0.72)?1:0;
   Leser fachwerk-core.js:212: P.keller = (P.keller===0)?0:1; // Keller default an (abschaltbar via {keller:0}); echtes Untergeschoss unter Grade

#4 D1 Innenwand 0,12 · Innentür 1,0×2,0 — tafel.md:66 · fachwerk-core.js:897 · Wert STEHT an der Zeile
    894: for(let i=0;i<nb;i++){const u=-w/2+(i+0.5)*w/nb; if(horiz)beam(g,cx+u,cy,cz,w/nb*0.92,h,0.05,role); else beam(g,cx,cy,cz+u,0.05,h,w/nb*0.92,role);}
    895: if(horiz){beam(g,cx,cy+h*0.32,cz,w,0.12,0.06,role);beam(g,cx,cy-h*0.32,cz,w,0.12,0.06,role);} else {beam(g,cx,cy+h*0.32,cz,0.06,0.12,w,role);beam(g,cx,cy-h*0.32,cz,0.06,0.12,w,role);} }
    896: 
   >897: function innenwaende(){const g=grp(); if(ROUND)return g; const t=0.12,dW=1.0,dH=2.0; let curK=0;
    898: const seg=(h,f,a0,a1,hh,y0)=>{ if(a1-a0<0.05)return; const ac=(a0+a1)/2,al=a1-a0; if(h){beam(g,ac,y0+hh/2,f,al,hh,t,'gefach');addSolid(ac,y0+hh/2,f,al,hh,t);} else {beam(g,f,y0+hh/2,ac,t,hh,
   Leser fachwerk-core.js:898: const seg=(h,f,a0,a1,hh,y0)=>{ if(a1-a0<0.05)return; const ac=(a0+a1)/2,al=a1-a0; if(h){beam(g,ac,y0+hh/2,f,al,hh,t,'gefach');addSolid(ac,y0+hh/2,f,al,hh,t);} else {beam(g,f,y0+hh/2,ac,t,hh,

#5 D1 Herd-Körper 1,5 × 1,1 — tafel.md:70 · fachwerk-core.js:589 · Wert STEHT an der Zeile
    586: let _ch=(P.seed*2654435761+0x9E3779B9)>>>0; _ch=((_ch^(_ch>>>16))*2246822519)>>>0; _ch=(_ch^(_ch>>>13))>>>0; const _chS=_ch/4294967296; // gut gestreuter Kamin-Strom
    587: const _pw=wings.find(w=>!w.outIsX); // senkrechter (verschmelzender) Flügel: sein Dach-Tent liegt auf seiner Seite über dem Hauptdach
    588: // ════ HERD-PLATZIERUNG · EINE HÜLLE: Körper 1.5(x)×1.1(z) bleibt VOLLSTÄNDIG hinter den Innenflächen der Traufe-/Giebelwände → Stack tritt first-nah aus, Feuer-Öffnung weist nach innen, Kü
   >589: const bodyHX=0.75, bodyHZ=0.55; // halbe Herd-Grundfläche (Körper 1.5×1.1)
    590: const xLim=Math.max(0, W/2-0.10-bodyHX), zLim=Math.max(0, Dp/2-0.10-bodyHZ); // GESETZ: max. |hearthX|/|hearthZ|, damit keine Kante die Wandinnenfläche überschreitet
   Leser fachwerk-core.js:590: const xLim=Math.max(0, W/2-0.10-bodyHX), zLim=Math.max(0, Dp/2-0.10-bodyHZ); // GESETZ: max. |hearthX|/|hearthZ|, damit keine Kante die Wandinnenfläche überschreitet
   Leser fachwerk-core.js:922: beam(g,hx,baseY+bH/2,hz,bD,bH,bW,'stein'); addSolid(hx,baseY+bH/2,hz,bD,bH,bW);
   Leser fachwerk-core.js:1244: { const fO=hearthX+hearthNX*(hearthBD/2); GBLK.push({f:0, fp:[Math.min(fO,fO+hearthNX*1.0), hearthZ-hearthBW/2-0.15, Math.max(fO,fO+hearthNX*1.0), hearthZ+hearthBW/2+0.15]}); } // HERD-BEDIE

#6 D1 TAGES_GESETZ.angebot — tafel.md:72 · koerper-core.js:5177 · Wert FEHLT an der Zeile
    5174: // DAS ANGEBOT JE ORT (Art → Güte je Bedürfnis): die Rolle eines Slots, der Platz, der Acker; `sonst` jede Rolle, die
    5175: // hier keine Zeile trägt; `daheim` das eigene Haus aus der Sicht seiner Leute (der Tisch, die Bank vor der Tür)
    5176: angebot: Object.freeze({
   >5177: wohnhaus: Object.freeze({ besuch: 1 }),
    5178: platz: Object.freeze({ arbeit: 5, markt: 1, mahl: 3, treff: 6 }),
   Leser koerper-core.js:5243: return Object.prototype.hasOwnProperty.call(A, art) ? A[art] : A.sonst;
   Fundstellen "TAGES_GESETZ" außer Def: 22 — koerper-core.js:5098 koerper-core.js:5126 koerper-core.js:5147 koerper-core.js:5220 koerper-core.js:5222 koerper-core.js:5223 koerper-core.js:5239 koerper-core.js:5241 koerper-core.js:5254 koerper-core.js:5256 koerper-core.js:5258 koerper-core.js:5270 koerper-core.js:5324 koerper-core.js:5327 …

#7 D2 foundH 0,55 — tafel.md:81 · fachwerk-core.js:178 · Wert STEHT an der Zeile
    175: wing:1, // L-Flügel (Quergiebel) an +x über TEIL der Tiefe → nicht-rechteckiger Grundriss
    176: balcony:0, // Balkon (Laube) an der Rückseite, OG
    177: seed:3,
   >178: foundH:0.55, egH:2.55, ogH:2.35,
    179: post:0.16, sill:0.18, raehm:0.16, balkenB:0.15, balkenH:0.21,
   Leser fachwerk-core.js:211: const baseY=P.foundH+(P.pilotis?2.6:0); // PILOTIS: das ganze Haus steigt → alles relativ zu baseY folgt automatisch (Synergie)
   Fundstellen "foundH" außer Def: 8 — fachwerk-core.js:211 fachwerk-core.js:429 fachwerk-core.js:430 fachwerk-core.js:437 fachwerk-core.js:439 fachwerk-core.js:440 fachwerk-core.js:441 fachwerk-core.js:442

#8 D2 sparH 0,15 (Tafel: 0 Leser) — tafel.md:83 · fachwerk-core.js:180 · Wert STEHT an der Zeile
    177: seed:3,
    178: foundH:0.55, egH:2.55, ogH:2.35,
    179: post:0.16, sill:0.18, raehm:0.16, balkenB:0.15, balkenH:0.21,
   >180: spar:0.10, sparH:0.15, pfetteB:0.14, pfetteH:0.18,
    181: bayMax:1.7, ovEave:0.42, ovRake:0.32, doorW:1.1, doorH:2.05
   Fundstellen "sparH" außer Def: 0

#9 D2 jetty 0,0 (Tafel: 0 Leser, tot) — tafel.md:85 · fachwerk-core.js:171 · Wert STEHT an der Zeile
    168: function HAUS(THREE, mat, PARAMS){
    169: const D2R=Math.PI/180, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    170: const P=Object.assign({
   >171: W:9.0, D:7.0, storeys:2, pitchDeg:50, jetty:0.0,
    172: hip:0.0, // 0 = Satteldach · 0<..<1 = Krüppelwalm · 1 = Walmdach
   Fundstellen "jetty" außer Def: 0

#10 D2 bayMax 1,7 — tafel.md:84 · fachwerk-core.js:181 · Wert STEHT an der Zeile
    178: foundH:0.55, egH:2.55, ogH:2.35,
    179: post:0.16, sill:0.18, raehm:0.16, balkenB:0.15, balkenH:0.21,
    180: spar:0.10, sparH:0.15, pfetteB:0.14, pfetteH:0.18,
   >181: bayMax:1.7, ovEave:0.42, ovRake:0.32, doorW:1.1, doorH:2.05
    182: }, PARAMS||{});
   Leser fachwerk-core.js:420: for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil((b-a)/P.bayMax-1e-6));
   Fundstellen "bayMax" außer Def: 2 — fachwerk-core.js:420 fachwerk-core.js:1842

#11 D2 Diele 0,06 × 0,28 — tafel.md:92 · fachwerk-core.js:860 · Wert STEHT an der Zeile
    857: 
    858: const Wi=W/2-0.08, Di=Dp/2-0.08; // Treppe (stW/wx0/wx1/wz1/STAIR) im Weltmodell oben definiert
    859: function boeden(){const g=grp(); if(ROUND)return g; let levelTop;
   >860: const rect=(y,x0,x1,z0,z1,role,sol)=>{ if(x1-x0<0.08||z1-z0<0.08)return; const w=x1-x0,d=z1-z0,nb=P.flaechig?1:Math.max(1,Math.round(d/(0.28*GROSSFORMAT()))),cx=(x0+x1)/2; // FLÄCHEN-STUFE: 
    861: for(let i=0;i<nb;i++){const z=z0+(i+0.5)*d/nb; beam(g,cx,y,z,w,0.06,d/nb*0.98,role);} if(sol!==false)addSolid(cx,y,(z0+z1)/2,w,0.12,d); };
   Leser fachwerk-core.js:861: for(let i=0;i<nb;i++){const z=z0+(i+0.5)*d/nb; beam(g,cx,y,z,w,0.06,d/nb*0.98,role);} if(sol!==false)addSolid(cx,y,(z0+z1)/2,w,0.12,d); };

#12 D2 Tempel-Modul D 0,85 (kein Spiel-Pfad) — tafel.md:98 · stamm/bau-teile.js:1296 · Wert STEHT an der Zeile
    1293: (AnazhRealm.CLASSICAL_ORDERS && AnazhRealm.CLASSICAL_ORDERS[orderName]) ||
    1294: AnazhRealm.CLASSICAL_ORDERS.dorisch;
    1295: opts = opts || {};
   >1296: const D = opts.columnDiameter || 0.85; // unterer Säulen-Durchmesser = das Modul
    1297: const colsFront = Math.max(2, opts.columnsFront || O.columnsFront || 6); // hexastyle
   Leser stamm/bau-teile.js:1298: const colsSide = Math.max(2, opts.columnsSide || 2 * (O.columnsFront || 6) - 3); // dorische Tiefen-Regel

#13 D3 winEG/winOG off·ch — tafel.md:107 · fachwerk-core.js:476 · Wert STEHT an der Zeile
    473: if(!P.flaechig) layJoists(L.top); }); // levels[last].top == eaveY → Dachbalkenlage inklusive, keine Doppellage · FLÄCHEN-STUFE: die Balkenlage schläft im Innern, der Ständer-/Rähm-Ring blei
    474: return g; }
    475: 
   >476: const winEG = modern?{off:1.18,ch:1.55}:{off:0.95,ch:0.95}, winOG = modern?{off:1.02,ch:1.45}:{off:0.80,ch:0.92}; // modern: grosse Fensterbänder
    477: function wallSpec(){const S=[];
   Leser fachwerk-core.js:491: levels.forEach((L,k)=>{ const ground=k===0, yLo=L.y+(ground?P.sill:P.raehm), yHi=L.top-P.raehm, wp=ground?winEG:winOG;
   Leser fachwerk-core.js:495: let win=null; if(t==='window'){ const wd=Math.min(modern?1.7:1.05,f.wdt-0.34); win={cy:yLo+wp.off,ch:wp.ch,wd}; }

#14 D3 Flügel-Öffnung 0,62 rad — tafel.md:111 · fachwerk-core.js:1084 · Wert STEHT an der Zeile
    1081: if(horiz){ beam(g,cx,cy+h/2+0.05,cz,w+0.2,0.1,0.18,fr); if(P.bogenTyp&&P.bogenTyp!=='none')bogenRahmen(g,cx,cy+h/2+0.12,cz,w*0.58,true,P.bogenTyp,fr,{art:'fenster',cap:_cap}); beam(g,cx,cy-h
    1082: beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr); // Pfosten
    1083: const L=grp(); const inner=windowSash(w,h,true,fr,gl); inner.position.x=w/2; L.add(inner);
   >1084: L.position.set(...deform(cx-w/2,cy,cz)); L.rotation.y=(cz<0?0.62:-0.62)+(DEF_bk>0?(cx-w/2)*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L);
    1085: strahlFluegel(L,w*Math.cos(L.rotation.y),-w*Math.sin(L.rotation.y),h);
   Leser fachwerk-core.js:1089: L.position.set(...deform(cx,cy,cz-w/2)); L.rotation.y=(cx<0?-0.62:0.62)+(DEF_bk>0?cx*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L);
   Leser fachwerk-core.js:339: function strahlFluegel(L,dx,dz,h){ const p=L.position, s=0.04; addStrahl(Math.min(p.x,p.x+dx)-s,p.y-h/2,Math.min(p.z,p.z+dz)-s,Math.max(p.x,p.x+dx)+s,p.y+h/2,Math.max(p.z,p.z+dz)+s); }
   Leser fachwerk-core.js:2788: FLUEGEL_LAGE = [0.8138785, 0.5810352]; // cos und sin der Flügel-Öffnung der L0 (fensterAt: 0,62 rad)

#15 D3 FENSTER_SCHLAF 0,45 — tafel.md:114 · fachwerk-core.js:2751 · Wert STEHT an der Zeile
    2748: // Und der Schlaf der Fenster würfelte nur die L1 (in Lauf-Reihenfolge): nah wachten alle, ab 20 m schlief fast die Hälfte.
    2749: // DER EINE WÜRFEL je Fenster aus Samen und Lage (Wand-Achse, Seite, Lage längs der Wand und Höhe auf 0,25 m): der Bau
    2750: // jeder Stufe (fensterAt nah und mittel, fensterFern fern) fragt ihn — dasselbe Fenster schläft in jeder Stufe.
   >2751: var FENSTER_SCHLAF = 0.45;
    2752: function fensterSchlaeft(seed, perp, wand, u, cy) {
   Leser fachwerk-core.js:2758: return ((h >>> 0) & 0xffff) / 0x10000 < FENSTER_SCHLAF;
   Fundstellen "FENSTER_SCHLAF" außer Def: 1 — fachwerk-core.js:2758

#16 D3 Möbel-Freizone vor Fenster 0,40 — tafel.md:116 · fachwerk-core.js:634 · Wert STEHT an der Zeile
    631: const winW=w=>(w.win&&w.win.wd)?w.win.wd:Math.min(w.hi-w.lo-0.3,1.1);
    632: // Außenfenster freihalten: Möbel nicht vor/unter ein Fenster (Belichtung). Zone = Fensterbreite × 0.4 m in den Raum.
    633: WALLS.forEach(w=>{ if(!w.win) return; let k=0; for(let i=0;i<levels.length;i++){ if(w.yLo>=levels[i].y-0.25 && w.yLo<levels[i].top){k=i;break;} }
   >634: const wd=winW(w), c=(w.lo+w.hi)/2, a0=c-wd/2-0.1, a1=c+wd/2+0.1, d=0.40;
    635: if(w.horiz){ const z=w.fixed, zi=z>0?z-d:z+d; addCircR(a0,Math.min(z,zi),a1,Math.max(z,zi),k,'fenster'); }
   Leser fachwerk-core.js:635: if(w.horiz){ const z=w.fixed, zi=z>0?z-d:z+d; addCircR(a0,Math.min(z,zi),a1,Math.max(z,zi),k,'fenster'); }

#17 D4 ovEave 0,42 · ovRake 0,32 — tafel.md:135 · fachwerk-core.js:181 · Wert STEHT an der Zeile
    178: foundH:0.55, egH:2.55, ogH:2.35,
    179: post:0.16, sill:0.18, raehm:0.16, balkenB:0.15, balkenH:0.21,
    180: spar:0.10, sparH:0.15, pfetteB:0.14, pfetteH:0.18,
   >181: bayMax:1.7, ovEave:0.42, ovRake:0.32, doorW:1.1, doorH:2.05
    182: }, PARAMS||{});
   Leser fachwerk-core.js:707: const eaveZ=Dp/2, ovZ=P.ovEave, ovX=P.ovRake, dY=ridgeY-eaveY, tanP=mS;
   Leser fachwerk-core.js:1800: { const hm={art:'haupt',x0:-W/2,x1:W/2,z0:-Dp/2,z1:Dp/2,y0:P.pilotis?baseY-0.24:0,eY:eaveY,rY:ridgeY,egTop:levels[0].top,dach:ROOFMODE==='alt'?'alt:'+P.dachTyp:ROOFMODE,hip:P.hip,ovZ:P.ovEav
   Fundstellen "ovEave" außer Def: 2 — fachwerk-core.js:707 fachwerk-core.js:1800

#18 D4 Kniestock 1,15 — tafel.md:144 · fachwerk-core.js:887 · Wert STEHT an der Zeile
    884: rect(eaveY-0.05,L.x0,L.x1,-Di,L.z0,'boden'); rect(eaveY-0.05,L.x0,L.x1,L.z1,Di,'boden');
    885: const hclx=(L.x0+L.x1)/2,hclz=(L.z0+L.z1)/2,zR=(L.dir>0)?L.z0:L.z1; railSeg(L.x0,zR,L.x1,zR,hclx,hclz); railSeg(L.x0,L.z0,L.x0,L.z1,undefined,hclz); railSeg(L.x1,L.z0,L.x1,L.z1,undefined,hcl
    886: // ── KNIESTOCK (Drempelwand) bei ±zBandTop: Barriere zum niedrigen Traufkopfraum → Spieler bleibt im Stehraum ≥1.9 m (schliesst den Trauf-Anstoss); Lücke an der Speichertreppenspur ──
   >887: [-zBandTop,zBandTop].forEach(zc=>{ if(!KNIESTOCK)return; const kH=1.15,y0=eaveY,yc=y0+kH/2, crosses=(zc>L.z0-0.3&&zc<L.z1+0.3);
    888: (crosses?[[-Wi,L.x0-0.1],[L.x1+0.1,Wi]]:[[-Wi,Wi]]).forEach(([x0,x1])=>{ if(x1-x0<0.3)return; const xc=(x0+x1)/2,len=x1-x0;

#19 D4 STIL_GRENZNEIGUNG — tafel.md:134 · fachwerk-core.js:160 · Wert STEHT an der Zeile
    157: // DIE GRENZNEIGUNG JE STIL (w28-bau-rezept, EINE Quelle): so flach trägt die Deckung des Stils — HAUS klemmt jede Neigung darauf,
    158: // und das Bau-Gesetz schreibt die gebaute Neigung ins Rezept (`grenzNeigung`); vorher stand sie nur in STILMODE, und das Rezept
    159: // trug eine tote Zahl: die griechischen Wohnhäuser 10–14° im Plan, 18° gebaut. Ohne Stil-Eintrag (alt) 28°.
   >160: var STIL_GRENZNEIGUNG = { modern: 14, huette: 30, stein: 18, glas: 4, klinker: 22, stroh: 38 };
    161: // der Stil, den HAUS baut (das Monument trägt keinen Holzbau: FEATURE→MATERIAL), und seine Grenzneigung
   Leser fachwerk-core.js:208: const pitch=clamp(P.pitchDeg, grenzNeigung(P), 62)*D2R; // EINE Grenzneigung (STIL_GRENZNEIGUNG), dieselbe, die das Bau-Gesetz ins Rezept schreibt
   Leser fachwerk-core.js:2230: hp.pitchDeg=Math.max(hp.pitchDeg, grenzNeigung(hp)); // die gebaute Neigung steht im Rezept (STIL_GRENZNEIGUNG), keine tote Zahl
   Fundstellen "STIL_GRENZNEIGUNG" außer Def: 9 — fachwerk-core.js:165 fachwerk-core.js:191 fachwerk-core.js:192 fachwerk-core.js:193 fachwerk-core.js:194 fachwerk-core.js:195 fachwerk-core.js:196 fachwerk-core.js:208 fachwerk-core.js:2230

#20 D4 Kamin STACK_W 0,84 — tafel.md:149 · fachwerk-core.js:919 · Wert FEHLT an der Zeile
    916: s.cuts.forEach(zc=>wallX(zc,Math.min(xf,xOut),Math.max(xf,xOut),[],hh,y0)); }); }); // Querwände (Vollwand)
    917: return g; }
    918: 
   >919: function herd(){const g=grp(); if(ROUND||P.kuppel){chimney=null;return g;} if(modern){ chimney=null; return g; } // KAMIN-GESETZ (Realität): Rücken an der Giebelwand · Feuerraum mit Wangen+S
    920: const hx=hearthX, hz=hearthZ, nx=hearthNX, bD=hearthBD, bW=hearthBW, bH=1.0, fO=hx+nx*(bD/2);
   Leser fachwerk-core.js:932: chimney=aabb(hx,(levels[0].top+top)/2,hz,STACK_W,top-levels[0].top,STACK_W); return g; }
   Fundstellen "STACK_W" außer Def: 7 — fachwerk-core.js:219 fachwerk-core.js:597 fachwerk-core.js:928 fachwerk-core.js:929 fachwerk-core.js:930 fachwerk-core.js:931 fachwerk-core.js:932

#21 D4 NAESSE dachPlätze 8/64/4 — tafel.md:151 · stamm/stoff-material.js:3793 · Wert FEHLT an der Zeile
    3790: benetzenS: 150,
    3791: verdunstS: 480,
    3792: sonne: 0.6,
   >3793: wind: 0.4,
    3794: luft: 0.15,
   Fundstellen "NAESSE" außer Def: 16 — stamm/bild-himmel.js:3062 stamm/koerper-fahrt.js:1809 stamm/stoff-dach.js:155 stamm/stoff-dach.js:166 stamm/stoff-dach.js:262 stamm/stoff-dach.js:269 stamm/stoff-material.js:707 stamm/stoff-material.js:710 stamm/stoff-material.js:2009 stamm/stoff-material.js:2012 stamm/stoff-material.js:2120 stamm/stoff-material.js:2126 stamm/stoff-material.js:2204 stamm/stoff-material.js:2230 …

#22 D5 DEFCOL 15 Hex — tafel.md:162 · fachwerk-core.js:2119 · Wert STEHT an der Zeile
    2116: // bleibt Shell-Glue — sie liest bauRezept aus DIESER Quelle.
    2117: // ═══════════════════════════════════════════════════════════════════════
    2118: // prettier-ignore
   >2119: const DEFCOL={holz:0x5a4632, gefach:0xd9d0c1, ziegel:0x9c4a35, ziegel2:0x803a28, putz:0xe7e3da, dachmod:0x3b3e44, stamm:0x5b4327, glas:0x33576a, glasfern:0x46687e, metall:0x6b6b73, backstein
    2120: // prettier-ignore
   Fundstellen "DEFCOL" außer Def: 14 — fachwerk-core.js:56 fachwerk-core.js:2162 fachwerk-core.js:2325 fachwerk-core.js:3685 fachwerk-core.js:12474 stamm/siedlung-wege.js:2739 stamm/siedlung-wege.js:2748 stamm/siedlung-wege.js:2749 worlds/fachwerk/fachwerk.js:24 worlds/fachwerk/fachwerk.js:25 worlds/fachwerk/fachwerk.js:33 worlds/fachwerk/fachwerk.js:35 worlds/fachwerk/fachwerk.js:217 worlds/fachwerk/fachwerk.js:712

#23 D5 NOISEAMP 18 Rollen — tafel.md:172 · fachwerk-core.js:2320 · Wert STEHT an der Zeile
    2317: // prettier-ignore
    2318: const AO_KNIE=2.6;
    2319: // prettier-ignore
   >2320: const NOISEAMP={putz:0.07,stein:0.08,lehm:0.07,backstein:0.055,gefach:0.055,ziegel:0.045,ziegel2:0.045,stroh:0.08,boden:0.06,holz:0.035,stamm:0.05,blockholz:0.04,lattung:0.03,dachmod:0.025,k
    2321: // prettier-ignore
   Leser fachwerk-core.js:2426: const namp=NOISEAMP[role]||0, nz=namp? (1+namp*(_noise01(G.pos[G.pos.length-3]*1.7, wy*1.7, G.pos[G.pos.length-1]*1.7)*2-1)) : 1;
   Leser fachwerk-core.js:2468: const namp=NOISEAMP[role]||0, nz=namp? (1+namp*(_noise01(G.pos[G.pos.length-3]*1.7, wy*1.7, G.pos[G.pos.length-1]*1.7)*2-1)) : 1; // MATERIAL-ILLUSION: Welt-Hash → jede Fläche atmet, determi
   Fundstellen "NOISEAMP" außer Def: 2 — fachwerk-core.js:2426 fachwerk-core.js:2468

#24 D5 WEG_GESETZ.ton — tafel.md:175 · fachwerk-core.js:10099 · Wert STEHT an der Zeile
    10096: var WEG_GESETZ = {
    10097: bord: { hochM: 0.12, breitM: 0.16, steinM: 1, rinneM: 0.3 },
    10098: kant: { breitM: 0.2 },
   >10099: ton: { fahr: 0.84, rinne: 0.72, bord: 1.12, flanke: 0.62, kant: 0.8, schatten: 0.42 },
    10100: fernM: 30,
   Leser stamm/siedlung-wege.js:1376: // DER BORD DES WEGS (TSL, Leser `_wegeBodenFarbe`; fachwerk WEG_GESETZ — w28-weg-koerper): der Körper der Fahrstraße als

#25 D5 Zaun-Holz 0x6a4e32 — tafel.md:179 · stamm/siedlung-wege.js:2731 · Wert STEHT an der Zeile
    2728: 0.12,
    2729: 0.85,
    2730: len,
   >2731: 0x6a4e32
    2732: );

#26 D6 DORF_NORM gap … budget 170000 (budget tot) — tafel.md:194 · fachwerk-core.js:3649 · Wert STEHT an der Zeile
    3646: // prettier-ignore
    3647: // VERTRAGS-AKT 18.07.: LOD1SKIP ist GESTRICHEN (0 Leser — der tote LOD1F-Zwilling).
    3648: // prettier-ignore
   >3649: const DORF_NORM={ gap:2.5, strasseW:5.0, laneW:3.2, gehweg:1.2, budget:170000, laneiv:17 }; // VERTRAGS-AKT 18.07.: gapStadt gestrichen (0 Leser, matchte kein lebendes Layout-Literal)
    3650: // ── SPIEGEL-ZENSUS 17.07. — DAS SIEDLUNGS-EXISTENZ-GESETZ (rein additive
   Leser fachwerk-core.js:5358: const N=plan.norm, gap=N.gap, sW=N.strasseW, lw=N.laneW, n=ext.length, nG=plan.nGestalt||n; /*nG: die Lose der GESTALT (der Chronik) — Mauer, Platz und Staende stehen fuer jeden Schnitt glei
   Fundstellen "DORF_NORM\.budget" außer Def: 1 — fachwerk-core.js:4516

#27 D6 STADT_NETZ tore 5 … — tafel.md:191 · fachwerk-core.js:3819 · Wert STEHT an der Zeile
    3816: // runde Viertel in 1024 m — im Bild ein ummauertes Dorf und Dörfer auf der Wiese (am echten Grund 357 Lose von 490 auf
    3817: // r 435 m: 6 Häuser je Hektar; die Kachel trägt dort 193–194 auf 6,5 ha: 30 je Hektar, Spike 15.11.).
    3818: var STADT_FUNKTION = { voll: GROESSE_WAND, schritt: 1, rest: 8 };
   >3819: var STADT_NETZ = { tore: 5, spiel: 0.4, jeKachel: 190, torLueckeM: 3.5, mauerInnenM: 2.4, turmJeM: 42 };
    3820: // der Hash des Netzes: jede Zahl mischt den Stand (fmix32) — (a, b) und (b, a) tragen verschiedene Werte
   Fundstellen "STADT_NETZ" außer Def: 11 — fachwerk-core.js:3830 fachwerk-core.js:3837 fachwerk-core.js:3845 fachwerk-core.js:3904 fachwerk-core.js:3926 fachwerk-core.js:4027 fachwerk-core.js:4038 fachwerk-core.js:9751 fachwerk-core.js:9975 fachwerk-core.js:12418 stamm/siedlung-ort.js:1586

#28 D6 ORT_SIEDLUNG mensch/naehrt — tafel.md:208 · gelaende-core.js:5762 · Wert STEHT an der Zeile
    5759: // der Oase) mindestens diesen Anteil trägt — in der Wüste stehen sie am Wasser, in der Heimat überall.
    5760: // Leser: die Wahl der Dorf-Zelle und ihres Grunds (Stamm `_autoSettlementCellInfo`, `_autoSettlementSiteOk`), der Acker
    5761: // (`_stlWegeBuild`), der Plan des Prüfplatzes (Stamm `_genesisPlanAn`, Faden `genesisPlan`).
   >5762: const ORT_SIEDLUNG = Object.freeze({ mensch: Object.freeze([-0.3, -0.012]), naehrt: 0.5 });
    5763: function ortSiedlung(zeitMa, wuchs, heimat) {
   Leser stamm/siedlung-ort.js:1431: if (((z.seed >>> 12) & 0xffff) / 65536 >= this._gelaende().ort.siedlung.bau) return null;
   Leser stamm/siedlung-ort.js:1710: const soll = K.ORT_SIEDLUNG.naehrt;
   Fundstellen "ORT_SIEDLUNG" außer Def: 8 — gelaende-core.js:5755 gelaende-core.js:5765 gelaende-core.js:7784 stamm/siedlung-ort.js:1703 stamm/siedlung-ort.js:1710 stamm/siedlung-wege.js:2668 stamm/siedlung-wege.js:2677 stamm/siedlung-wege.js:2679

#29 D7 STADT_MASSEN einzugM 4,2 … — tafel.md:222 · fachwerk-core.js:4072 · Wert STEHT an der Zeile
    4069: // längs der Straße), ton: [Wand r g b, Dach r g b] linear, strassen: [{ p: [x, z, …], w, belag, saum, art }], haeuser, plaetze, m }
    4070: // oder null (dort steht keine Kachel).
    4071: // Kosten: das Netz und die Liste, 2–4 ms je Kachel (einmal, der Wirt merkt sie).
   >4072: var STADT_MASSEN = { einzugM: 4.2, platzM: 11, eckeM: 9, geschossM: 2.7, sockelM: 0.5, flachGrad: 8, strasseJe: 4 };
    4073: // prettier-ignore
   Leser fachwerk-core.js:4492: const fuss=Math.ceil((Math.max(1,v.storeys||1)*STADT_MASSEN.geschossM+STADT_MASSEN.sockelM)/STADT_FORM.schlank*2)/2;
   Leser fachwerk-core.js:4494: const trag=Math.floor((STADT_FORM.stab*v.D-STADT_MASSEN.sockelM)/STADT_MASSEN.geschossM); /*DIE HOEHE FOLGT DEM LOS: mehr Geschosse, als seine Tiefe traegt (Traufe ≤ `stab` × Tiefe), steigen
   Fundstellen "STADT_MASSEN" außer Def: 5 — fachwerk-core.js:4077 fachwerk-core.js:4119 fachwerk-core.js:4492 fachwerk-core.js:4494 fachwerk-core.js:12423

#30 D7 WELT_MARCH satzPx 16 … — tafel.md:220 · stamm/dienst.js:2322 · Wert STEHT an der Zeile
    2319: // Feld die wenigsten Bildpunkte liest, dem Warter, der `weichFaktor`² mal so viele liest; freier Platz weckt die Wartenden
    2320: // höchstens je `platzMs`. `reserve`: so viele Felder lassen die Glieder der Leiber und die vorgebackenen Sätze frei
    2321: // (`_weltLeibTakt`) — gesetzt auf rund zwei Drittel einer erwachenden Kachel (190 Häuser): der Zuwachs zwischen zwei Gängen.
   >2322: satzPx: 16,
    2323: satzBand: 0.1,
   Leser stamm/dienst.js:739: // 3 DER FERNSTE WEICHT: ist eine Liste voll, gibt der fernste Halter sein Feld dem Warter, der mindestens
   Fundstellen "satzPx" außer Def: 6 — stamm/dienst.js:737 stamm/dienst.js:742 stamm/dienst.js:746 stamm/dienst.js:798 stamm/dienst.js:2318 stamm/studio-glieder.js:441
```
