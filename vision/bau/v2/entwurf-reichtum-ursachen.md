# ENTWURF B v2 — Reichtum aus Ursachen (BAU-ZENSUS Runde 2, Kapitel GEBÄUDE/STADT · main b7ed8419, nur gelesen)

Gelesen ganz: spike-100-haeuser.md, pruefung-spike.md, entscheid.md §0 und §1 (:1–219), lesen-f-stadtplan.md, die Skripte der Runde 1
(vision/bau/spike/pool.cjs, gesetz-proto.cjs, lade.cjs; p3/n1811/bau-spike/pruef/analyse.cjs, mach.cjs). An der Quelle nachgelesen
(fachwerk-core.js = FC, byte-gleich mit der Kopie, SHA-256 028cc2d0…, `sha256sum` beider Dateien gleich): FC:2117–2276 (KULTUR, BAU_NUTZUNG,
`_bauweiseWurf`, `bauRezept`, `bauProgramm`), :3605–3649 (REGION_HIST, EPOCHEN, DORF_NORM), :3693–3697 (`rangSchluessel`), :3815–3939
(STADT_NETZ, `kachelNetz`, STADT_FORM, `stadtPlan`), :4062–4121 (`kachelMassen`, `hausMasse`), :4403–4517 (DORF). Leben: stamm/bau-teile.js
:1475–1509 (`_rollGenome`), stamm/siedlung-bewohner.js:838–853, vision/leben/entscheid.md:1–90; phyto-core.js:470–483 (`genomStrom`).
Kein Spiel-Code berührt, kein git, kein GPU. Prototyp: p3/n1811/bau-spike2/stadt-proto.cjs (läuft in 1,2 s), Empfindlichkeit
p3/n1811/bau-spike2/empfindlich.sh → empfindlich.txt, Zweitzählung vision/bau/zaehl/vielfalt-zweit.cjs.

## WAS NICHT HÄLT (zuerst)

1. **Die häufigste Form fällt knapp.** Basislauf: Anteil der häufigsten Form je Stadt Q50 **6,3 %** gegen heute **5,8 %** — Stopp „≥ heute“
   FÄLLT an diesem einen Maß (stadt-proto.log (1)). Er hält in 4 von 9 Läufen (Ereignisse ×2: 5,2 %; nur nördliche Einheiten: 4,7 %;
   dMinHaus 4: 5,2 %), er fällt, sobald die Miete auf den englischen Beleg sinkt (8,0 %) oder der Familien-Zyklus fehlt (9,2 %)
   (empfindlich.txt). Die drei anderen Maße halten in allen 9 Läufen.
2. **Die Höhe hängt zum Teil an einer gewählten Ursache gegen den Beleg.** Die Miet-Haushalte (Inwohner) tragen im Basislauf **21 %** der
   Leute; belegt sind für England **5–6 %** „lodgers“ (Laslett-Zusammenfassung). Mit 0,3 Miet-Haushalten (7 % der Leute) bleibt die
   Traufe-Spanne 5,14 m > 4,70 m, ohne Miete 4,94 m — die Spanne hält auch ohne sie, die häufigste Form nicht (8,0 % / 8,8 %).
3. **V2 ist ZU REGELMÄSSIG am Los.** 100 % der V2-Lose liegen auf dem Viertel-Raster ± 0,5 m, belegt sind ~⅔ (Edinburgh, 49 Lose, Stell & Tait
   2016). Das fehlende Drittel ist Absteckung und Grenzverschiebung — es hat in V2 KEINE Ursache und fehlt darum. Als Gegenprobe (kein Teil
   von V2) mit genau dieser belegten Streuung: 895 Formen, häufigste Form **3,5 %** — die eine Varianz, die V2 fehlt, ist benannt.
4. **„100 % rückführbar“ ist Konstruktion, kein Beweis der Ursachen.** Jedes sichtbare Maß ist in V2 eine Funktion NUR seiner Ursachen-Zeile
   (Tafel ABH, stadt-proto.cjs:304); die Gruppen-Prüfung findet in 11 von 11 Maßen 0 Gruppen gleicher Ursachen mit zwei Werten. Das prüft,
   dass der Code seiner Tafel folgt — nicht, dass die Ursachen wahr sind. Wahr-Prüfungen sind nur die Belege (Los-Raster, Laslett), und
   die sind lückenhaft (unten §4).
5. **Alle Ereignis-Raten sind gewählt.** Brand 3,5 % · Teilung 10 % · Kauf 5 % · Aufstockung 10 % · Anbau 5 % je Erbgang, Erbgang 30 Jahre
   (unsicher): keine Quelle gefunden. Bei ×0,5 fällt die häufigste Form (8,0 %), bei ×2 hält sie (5,2 %).
6. **Teilung macht in V2 kein neues Haus.** Die Zahl der Häuser bleibt das Wort von DORF (n = 90); eine Erbteilung verschmälert das Los des
   EINEN Hauses an der Adresse. In der echten Stadt stehen danach zwei Häuser. Das Los-Gesetz muss die Zahl der Lose aus der Geschichte
   rechnen (ERSTER PUNKT 2).
7. **Die Erblichkeit der Schule hat im Spiel kein Vorbild im Code.** Das Leben vererbt heute NICHTS: jeder Bewohner wird frisch aus seiner
   Adresse gerollt (`_rollGenome(`${plan.seed}:${si}:${k}`, "bewohner")`, stamm/siedlung-bewohner.js:848), `leben-core.js` liegt nicht im
   Baum (`ls` leer, cores.manifest.json 0 Treffer „leben“). Die Vererbung steht nur als Entscheid (vision/leben/entscheid.md:55–57
   `gruender`/`kind`). V2 übernimmt dessen Form (Elter + Mutation), nicht gebauten Code.
8. **Ort und Elter der Schule sind Stellvertreter.** Die Pläne G tragen keine Weltlage: der Stoff des Orts ist die Region (gewählt), die
   Eltern-Siedlung ist die nächst-ältere derselben Region. Im Spiel gehört beides an die Zelle (§2 d, e).
9. **Kein Bild.** Der Prototyp rechnet Maße, keine Geometrie. Nach der Goldenen Definition ist das Mechanik, nicht Erlebnis.
10. **Die Geschoss-Verteilung kippt nach unten.** V2: 41 % eingeschossig (1 056/2 595), heute 14 % (354), R1 33 % (846). Die Spanne wächst
    nach oben (Q90 8,31 m gegen 7,80), aber die Stadt hat mehr Buden. Ob das richtig ist, sagt kein Beleg hier.

## ERGEBNIS IN DREI SÄTZEN

Geschnitten (im Prototyp): das Los als Gründungs-Einheit × Viertel-Anteil, das Erbgang für Erbgang geteilt, gekauft, abgebrannt, aufgestockt
und angebaut wird; der Haushalt mit Familien-Zyklus, Gesinde und Miete; die Schule der Zimmerleute als erbliches Genom je Siedlung.
Gemessen an denselben 2 595 Losen: V2 **746 Formen / 63 Breiten / Traufe-Spanne 5,74 m / häufigste Form 6,3 %** gegen heute 440 / 21 / 4,70 /
5,8 % und R1 32 / 3 / 2,67 / 27,9 % — drei von vier Maßen halten, die häufigste Form fällt knapp; jede Differenz der 2 395 verschiedenen
Paare ist rückführbar (Konstruktion). Befund für heute: in derselben Stadt sind **58 % der Breiten-Varianz, 52 % der Tiefen-Varianz und
25 % der Form-Unterschiede reiner Würfel** (Kultur-Wahl im selben Pool und Maß-Jitter) — 317 der 378 Formen der nachgerechneten Lose
verschwinden ohne Würfel.

## (1) BEFUND HEUTE — welche Varianz hat KEINE Ursache

Wie DORF heute ein Haushalts-Los baut (Pläne G: kein Ring, kein Stadtkörper, kein Erbe, weil `jahr` ≤ 1559 — FC:4412, :4417, :4440, :4445):

| Maß | Rechnung | datei:zeile | Ursache? |
|---|---|---|---|
| Kultur des Loses | `pool[(rnd()*pool.length)|0]` aus REGION_HIST[Region] im Baujahr | FC:4435, :3609–3615 | Pool = Region × Epoche (Ursache); **Wahl im Pool = Würfel** |
| Breite | KULTUR.W + (rnd − 0,5)·2,2, auf 0,5 m, 5–15 | FC:2208 | **Jitter = Würfel** |
| … | × (0,84 + 0,30·w), w = (1,22 − 0,5t)(0,78 + 0,44·rnd) | FC:4438–4439 | Lage t (Ursache) · u (Würfel mit Namen „Wohlstand“, ohne Haushalt: `bauRezept(…, null, …)` FC:4436) |
| Tiefe | KULTUR.D + (rnd − 0,5)·1,8, 4–11 | FC:2209 | **Jitter = Würfel** |
| Geschosse | KULTUR.st (Streuung nur ab st ≥ 4), +1 wenn städtisch ∧ w > 0,9 | FC:2210, :4444 | Kultur, Wohlstand |
| Keller, Anbau, Balkon | rnd < 0,35 · < 0,25 · w > 0,95 ∧ rnd < 0,5 | FC:4446, :4448 | **Würfel** |

Gemessen (stadt-proto.cjs (6), nachgerechnet mit dem byte-treuen Wurf `wurfZuege` :90 und `heuteForm` :99; 1 644 der 1 691 Wohnhaus-Lose
treffen den Export genau = 97 %; die 904 Haushalts-Lose mit Grammatik-Rolle (Gasthaus, Kaufhaus, Werkstatt …) sind NICHT nachgerechnet):

| an den 1 644 Losen | Formen | Breiten | Traufe-Spanne | häufigste Form Q50 |
|---|---|---|---|---|
| heute, mit Würfeln | 378 | 21 | 4,70 | 6,5 % |
| ohne Maß-Würfel (Jitter = 0) | 92 | 19 | 4,70 | 24,2 % |
| ohne jeden Würfel (eine Kultur je Pool, `pool[0]`) | 61 | 19 | 4,70 | 35,7 % |

- In DERSELBEN Stadt (Mittel der Varianz je Plan): Var(Breite) 3,13 → 2,65 → **1,30 m²** (58 % ohne Ursache) · Var(Tiefe) 1,30 → 1,02 →
  **0,63** (52 %) · Var(Geschosse) 0,29 → 0,25 (14 %). Über alle Städte bleibt Var(Breite) 6,78 → 6,86: zwischen den Städten trägt die
  Kultur der Region und Epoche die Breite (Ursache), IN der Gasse ist sie zur Hälfte Würfel.
- Paare (1 200 in derselben Stadt, 1 185 mit verschiedener Form): **302 = 25 % reiner Würfel** — B, gebaut mit den Würfeln von A (A's
  Kultur, wo sie in B's Pool liegt, und A's Maß-Züge), IST A. Davon 143 nur die Kultur-Wahl im selben Pool (Beispiel G21#20 römisch
  15 × 9,5 × 2 ↔ #48 griechisch 8,5 × 7 × 3), 159 nur der Maß-Jitter (G22#48 ↔ #79, beide mittelalterlich). 793 trennt auch ohne Würfel
  der Wohlstand, 90 gemischt.
- Die Höhe hat heute eine Ursache: die Traufe-Spanne 4,70 m bleibt ohne jeden Würfel stehen (Kultur-st der Epoche, +1 Geschoss des Wohlstands).
- **Zwei Los-Setzer ohne gemeinsames Los:** Stufe 1 hat schon eine STETIGE Los-Breite — `breit: frei / n` je Block-Kante (FC:4092–4094) —
  und baut darauf `W = p.W ≥ q.breit ? q.breit : min(p.W, q.breit − 0,8)` (FC:4110); Stufe 2 legt die Lose anders (FC:4067, eingestanden).
  Das Haus kommt in beiden aus DORF, das Los aus zwei Geometrien.

**Das Urteil der Falsifikation (§2 des Koordinators):** Die Vielfalt der heutigen Stadt ist an der FORM zum größten Teil Würfel ohne Ursache
— Kultur-Wahl im Pool (FC:4435) und Maß-Jitter (FC:2208–2209). An der HÖHE ist sie verursacht.

## (2) DIE URSACHEN-KETTE DER STADT (der Entwurf)

Reihenfolge der Rechnung: Gründung der Stadt (Lokator, Schule, Ort) → je Los: Gründungs-Anteil → Geschichte Erbgang für Erbgang (Ereignisse)
→ Haushalt der Gegenwart → Programm im Jahr des Baus → Breite, Tiefe, Geschosse → Höhe je Geschoss aus dem Jahr des Geschosses → Dach,
Vorkragung, Fenster, Raster, Strebe aus der Schule im Jahr des Baus → Stoff aus Ort und Geschichte. Kein eigener Zufall außer dem Strom der
Adresse (FNV-1a + fmix32, wie `_rollGenome` stamm/bau-teile.js:1479–1489 und `rangSchluessel` FC:3693–3697); jeder Zug hat einen Namen.

### (a) Das Los — stetig über die Zeit

| Größe | Wert | Quelle |
|---|---|---|
| `rute` | 5,03 m (16½ ft) | belegt: Statute of Ells and Perches (zit. Alnwick Civic Society 2020); für alle Regionen **gewählt** |
| Einheit U der Gründung (je Stadt, der Lokator) | eine aus {1,46 · 1,61 · 1,70 · 1,5 · 3 · 4 · 3,5} Ruten = 7,34 · 8,10 · 8,55 · 7,55 · 15,09 · 20,12 · 17,61 m | belegt als Menge: Edinburgh 24 ft = 7,32 m (Stell & Tait 2016), Elgin 8,1 m (Tait 2010, nur Zusammenfassung gelesen), Alnwick 28 ft (Conzen), Burford 1½ dann 3 Perches (VCH-Tafel, Zusammenfassung), Thame ~4 Perches (Spavold & Gilman 2002), Stratford 3½ (**unsicher**, Blog nach Slater); gleiche Gewichte **gewählt** |
| Anteil f0 des Gründungs-Loses | Viertel-Raster von 0,75 + 1,25·q | Spanne ¾ … 2½ Einheiten **belegt** (Stell & Tait 2016: „three-quarters of a unit, one and a quarter, and up to two and a half units … in all eight towns“); Kopplung an den Wohlstand q **gewählt** |
| Teilung | f → ⌊f/2 auf Viertel⌋, nur wenn f·U ≥ 2 · 3,5 m; p = 0,10 · Druck je Erbgang | Vorgang **belegt** (Halbe Burgage 2 Perches, Thame; „broader plots … divided into two narrower plots which also conformed to the quarter plot scheme“, Stell & Tait); Rate **gewählt** |
| Kauf (Zusammenlegung) | f + ½ oder + 1 bis 2½; p = 0,05 · Klasse | Vorgang belegt (Gladstone's Land 1617 / Tolbooth 1571 über den Nachbarn, Stell & Tait); Rate **gewählt** |
| Druck | 0,5 + 0,5·(1 − t), t = Rang der Gründung | **gewählt** (der Kern trägt den Markt) |
| Ecke, Hang | NICHT im Prototyp | die Pläne G tragen weder Block noch Gelände — Ecke liegt in `kachelNetz` (Blöcke FC:3864–3865), Hang in `trasseLenk` (lesen-f §4); **offen** |

Funktion (rein): `losGeschichte(stadt, i, gruendung, jetzt) → {U, f, ereignisse[], bau}` (stadt-proto.cjs:201–222). Gegen Runde 1
(`losVon` = 15 / [3, 2, 1], gesetz-proto.cjs:93: 3 Breiten) trägt V2 an den 2 595 Losen Breiten Q05/10/25/50/75/90/95 =
**4,05 / 4,40 / 8,10 / 10,69 / 17,61 / 25,15 / 30,18 m**; Anteile f: ¼ 2 % · ½ 11 % · ¾ 12 % · 1 15 % · 1¼ 26 % · 1½ 18 % · 1¾ 8 % · 2 2 % ·
2¼ 1 % · 2½ 4 %.

### (b) Der Haushalt — Größe, Gewerbe, Gesinde, Wohlstand, Lebensphase, Miete

| Größe | Wert | Quelle |
|---|---|---|
| Gewerbe, Klasse | wörtlich wie Runde 1 (Rang-Quantil 50/40/10, Lage zuerst, dann Quote) | pool.cjs:68–93 — dieselben Adressen; GEWERBE-Zeilen und GEWERBE_ANTEIL bleiben **Annahmen** (S3 der Runde 1); kein deutscher Steuerlisten-Beleg gefunden (Suche ohne Zahlen) |
| Wohlstand | log-linear über den Rang q: 0,44·(1,8/0,44)^q statt drei Stufen | Enden = BAU_GESETZ.wohl (entscheid §1.1); Form **gewählt** |
| Lebensphase | Ehejahre gleich 0–40; Kinder im Haus = kMax[Klasse] · Zyklus (0 → 1 bis 15 J. → 1 bis 25 J. → 0,3 mit 40 J.); ab 30 J. Witwe/r p 0,3 | **gewählt**; kMax [3,0 · 3,6 · 4,4] geeicht auf hhMittel |
| hhMittel | Ergebnis 4,85 | **belegt** 4,75 „or a little below“, England 1574–1821 (Laslett) |
| Gesinde | ⌊Gesinde-Basis des Gewerbes · [0 · 0,45 · 1,0][Klasse] + u⌋ | Ergebnis 12,5 % der Leute (0,1250, aus stadt-v2-haeuser-basis.json); **belegt** 11–14 % 1650–1821 (Laslett-Zusammenfassung); Haushalte mit Gesinde 36 % (die Zahl ~29 % ist **unsicher**, nicht bestätigt) |
| Miete (Inwohner) | ⌊1,2 · Druck · min(1, Alter der Stadt/300) + u⌋ Haushalte à 27,3 m² | **gewählt** — 21 % der Leute gegen **belegt** 5–6 % lodgers in England; für die Stadt des Kontinents **unsicher** |

Größen-Verteilung V2 (1 … 10+ Köpfe): 0 · 5 · 17 · 21 · 31 · 12 · 7 · 2 · 1 · 3 % (stadt-proto.log (3)). Gegen eine belegte Verteilung
NICHT geprüft (Laslett-Tafel nicht gelesen).

### (c) Die ZEIT — die Geschichte eines Hauses aus Samen + Adresse

Je Los, je Erbgang g = 1 … ⌊(jetzt − Gründung)/30⌋, in dieser Reihenfolge, das erste Ereignis gewinnt (stadt-proto.cjs:214–222):

| Ereignis | Bedingung (Zug `ax(name, adresse, g)`) | Spur am Haus |
|---|---|---|
| Brand | < 0,035 | Neubau im Jahr y: neues Programm, neue Schul-Generation; Mitteleuropa ab 1550 **EG in Stein** unter Fachwerk (Stoffwechsel; **unsicher**, Bauordnungen nicht nachgeschlagen); Aufstockungen fallen |
| Teilung | Los ≥ 7 m ∧ < 0,10·Druck | schmaleres Los, Neubau |
| Kauf | Klasse ≥ 1 ∧ < 0,05·Klasse | breiteres Los, Neubau |
| Aufstockung | < 0,10·Druck, höchstens 2 | +1 Geschoss in der lichten Höhe SEINES Jahrs (BAU_GESETZ.licht) → **Fuge** (Jahr ≠ Baujahr: andere Schul-Generation = anderes Raster und Strebe oben); nie über Traufe ≤ 2·Tiefe (STADT_FORM.stab FC:3892, gelesen FC:4494) |
| Anbau | < 0,05, einmal | Grundriss L |

Ergebnis an den 2 595 Losen: Erbgänge Q10/50/90 0/4/17 · Brand 555 · Teilung 926 · Kauf 500 · Aufstockung 1 024 · Anbau 558; 465 Häuser
tragen eine Aufstockungs-Fuge, 67 ein Stein-EG nach Brand, 558 einen L-Grundriss; 1 541 stehen noch als Gründungsbau.

### (d) Der Stoff des Orts

V2 rechnet den Stoff aus der Region (Stellvertreter, **gewählt**: Mitteleuropa Fachwerk Eiche · Alpin/Nordisch Block Nadel · Fernost Ständer
Nadel · Mediterran/Antik Stein; stadt-proto.cjs:80–87) — ohne Ort wirft er (`muss`, :24). Im Spiel gehört der Stoff an den ORT der Siedlung:
`holzDesOrts(forestNische)` (entscheid §1.2, pc:3047 laut entscheid :17), Bruch und Lehm aus `kahlGrund` (gc:5835). Der Weg des `ort` durch den
Worker-Kanal ist NICHT Teil dieses Entwurfs (ERSTER PUNKT 4 des Kopfs); hier gilt nur: DORF verlangt `DP.ort` und wirft ohne ihn, kein
`?? Heimat`. Stoff-Spur der Zeit: Stein-EG nach Brand (c). Verteilung V2: Fachwerk 710 · Stein-EG + Fachwerk 67 · Stein 786 · Block 774 ·
Ständer 258.

### (e) Die Schule der Zimmerleute — ein erbliches Genom je Siedlung

| Gen | Wurzel | Mutation σ je Schul-Generation | Quelle |
|---|---|---|---|
| Dachneigung ° | KULTUR.pitch der ersten Kultur des Regions-Pools (FC:3609–3615 → FC:2121–2153) | 2,5° | Wurzel gelesen; σ **gewählt** |
| Rastermaß (Ständerabstand) m | 1,25 | 0,06 | **gewählt** (bayMax 1,7 FC:420 ist eine Obergrenze, kein Maß) |
| Vorkragung m je Geschoss | 0,52 (nur Fachwerk) | 0,06 | **belegt**: 52–60 cm je Geschoss, englische Fachwerk-Stadthäuser 15. Jh. (Stell & Tait 2016) |
| Fenster h/w | 1,4 | 0,08 | **gewählt** |
| Strebenform | KULTUR.brace der Wurzel | Wechsel p 0,2 unter mann · k · andreas · wild | **gewählt** |

Vererbung: Schule(Stadt) = Schule(Eltern-Stadt) + σ·N(Strom „schule|Stadt|Gen“) — die Form von `kind` (vision/leben/entscheid.md:56) mit
EINEM Elter, ohne Segregation. Drift innerhalb der Stadt je Erbgang 0,5·σ (die nächste Gesellen-Generation): ein Haus von 1350 und eines von
1500 in derselben Stadt unterscheiden sich in Neigung und Raster — Ursache „Baujahr (Schul-Generation)“. Eltern-Stadt im Prototyp: die
nächst-ältere derselben Region (Stellvertreter); im Spiel **gewählt**: die älteste Siedlung im Umkreis von `ORT_REICH_ZELLEN` 3 Zellen
(siedlung-ort.js:3609, lesen-f Z.144) mit früherem Gründungsjahr, sonst die Wurzel der Region. Stelle des Lebens: der Strom
`_rollGenome` (stamm/bau-teile.js:1479) — Vererbung im Code: keine (Punkt 7 oben). Beispiel-Linie Mitteleuropa (stadt-proto.log (4)):
G19 (899) ← Wurzel · G22 (984) ← G19 · G1 (1068) ← G22 … G6 (1436) ← G27; Neigung 55,4 → 53,5 → 50,6 … 55,1°, Strebe mann → wild (G11) →
mann (G3).

### Was am Haus sichtbar wird (die Abhängigkeits-Tafel, stadt-proto.cjs:304)

| Maß | Ursachen |
|---|---|
| Breite W | Lokator U · Los-Geschichte f; auf Losen > 12 m (Torfahrt 3,5 m) zusätzlich Programm (Haushalt, Baujahr, Miete) |
| Tiefe D, Geschosse, Traufe | U · f · Haushalt · Baujahr/Epoche · Miete · Aufstockungen |
| Neigung | Schule · Ort (Deckung, R1 `deckungVon` gesetz-proto.cjs:85–90) |
| Vorkragung | Schule · Ort · Brand (Stein-EG) · Geschosse |
| Fenster h/w, Raster, Strebe | Schule (· Ort für Strebe) |
| Stoff | Ort · Brand |
| Grundriss | Anbau |

## (3) DER PROTOTYP — Zahlen gegen HEUTE und R1

Gleichheit der Waage: der Prototyp baut die Adressen der Runde 1 wörtlich nach (pool.cjs:47, 57–99 → stadt-proto.cjs:127–163, wirft bei
≠ 2 595 Losen) und zählt mit dem Maß der Prüfung (pruef/analyse.cjs:49–56 → stadt-proto.cjs:111–118). Zweitzählung grün:
`node koordination/vision/bau/zaehl/vielfalt-zweit.cjs` → „heute 440/21/4.7/0.058 · R1 32/3/2.67/0.279“.

| Satz (2 595 Haushalts-Lose, 30 Pläne G) | Formen W×D×st | Breiten | Traufe Q10/Q90 (Spanne) | häufigste Form Q50 | Breite Q10/50/90 | Geschosse 1/2/3/4/5/6 |
|---|---|---|---|---|---|---|
| heute | 440 | 21 | 3,10/7,80 (4,70) | 5,8 % | 7/10/14 | 354/1171/1010/3/0/57 |
| R1 | 32 | 3 | 2,57/5,24 (2,67) | 27,9 % | 5/7,5/15 | 846/1703/46/0/0/0 |
| **V2** | **746** | **63** | 2,57/8,31 (**5,74**) | **6,3 %** | 4,5/9,5/15,5 | 1056/793/575/144/26/1 |
| Gegenprobe V2 + belegte Absteckungs-Streuung | 895 | 62 | — | 3,5 % | — | — |

Die 63 Breiten-Stufen zählen auch Häuser unter 5 m (268) und über 15 m (300), die der heutige Wurf klemmt (FC:2208) — ohne sie wären es
weniger; im Lauf „nur nördliche Einheiten“ (U 7,3–8,6 m) sind es 25.

**Paare V2** (stadt-proto.log (5)): 1 200 Paare in derselben Stadt, 1 195 verschieden, **1 195 rückführbar**; 1 200 über die Städte, alle
verschieden, alle rückführbar. Häufigste Ursachen in der Stadt (Anteil der Paare): Haushalt 1,00 · Baujahr 0,98 · Los 0,82 · Schule 0,70 ·
Miete 0,31 · Epoche 0,31 · Aufstockung 0,28 · Anbau 0,27 · Brand 0,04. Die FORM allein in der Stadt (1 184 Paare): Baujahr + Haushalt + Los
33 % · + Miete 12 % · + Epoche 9 % · Baujahr + Haushalt 9 % · mit Aufstockung 16 %. Beispiele:
- G4#78 ↔ G4#85: 11,5 × 8,5 × 1, Traufe 2,97 ↔ 12 × 8 × 3, Traufe 8,71, Grundriss I ↔ L ⇐ Los, Haushalt, Baujahr, Epoche, Miete, Aufstockung, Schule, Anbau.
- G13#69 ↔ G13#17: 1 ↔ 2 Geschosse, Neigung 32 ↔ 31° ⇐ Haushalt, Baujahr, Epoche, Schule.
- G17#72 ↔ G28#50 (Alpin ↔ Mediterran): 7,5 ↔ 20,5 m, Neigung 49 ↔ 11°, Block ↔ Stein ⇐ Lokator, Los, Haushalt, Baujahr, Epoche, Schule, Ort.

**Empfindlichkeit** (empfindlich.sh, je ein gewählter Wert verschoben; H = hält, F = fällt; Reihenfolge Formen/Breiten/Spanne/häufigste Form):

| Lauf | Formen | Breiten | Spanne | häufigste | Stopp | Köpfe | Gesinde | Miete-Leute |
|---|---|---|---|---|---|---|---|---|
| basis | 746 | 63 | 5,74 | 6,3 % | H/H/H/F | 4,85 | 0,13 | 0,21 |
| Miete 0,3 | 725 | 58 | 5,14 | 8,0 % | H/H/H/F | 4,85 | 0,13 | 0,07 |
| Miete 0 | 681 | 57 | 4,94 | 8,8 % | H/H/H/F | 4,85 | 0,13 | 0 |
| Ereignisse ×0,5 | 646 | 62 | 5,14 | 8,0 % | H/H/H/F | 4,85 | 0,13 | 0,20 |
| Ereignisse ×2 | 857 | 55 | 6,81 | 5,2 % | H/H/H/H | 4,85 | 0,13 | 0,23 |
| nur nördliche Einheiten (1,46/1,61/1,70 Ruten) | 713 | 25 | 6,34 | 4,7 % | H/H/H/H | 4,85 | 0,13 | 0,21 |
| dMinHaus 4 | 785 | 63 | 5,74 | 5,2 % | H/H/H/H | 4,85 | 0,13 | 0,21 |
| ohne Familien-Zyklus | 672 | 60 | 5,74 | 9,2 % | H/H/H/F | 4,98 | 0,12 | 0,21 |
| ohne Schul-Drift | 746 | 63 | 5,74 | 6,3 % | H/H/H/F | 4,85 | 0,13 | 0,21 |

## (4) FALSIFIKATION — Stopp des Koordinators

| Stopp | Zahl | Urteil |
|---|---|---|
| Formen ≥ heute | 746 ≥ 440 (alle 9 Läufe ≥ 646) | HÄLT |
| Breiten-Stufen ≥ heute | 63 ≥ 21 (alle ≥ 25) | HÄLT — teils durch Breiten jenseits der heutigen Klemme 5–15 m |
| Traufe-Spanne ≥ heute | 5,74 ≥ 4,70 (alle ≥ 4,94) | HÄLT |
| häufigste Form ≤ heute | 6,3 % > 5,8 % (4 von 9 Läufen ≤) | **FÄLLT knapp**, hängt an gewählten Raten |
| jede Differenz auf eine Ursache | 2 395 / 2 395 Paare; 0 Gruppen gleicher Ursachen mit zwei Werten | HÄLT durch Konstruktion (Punkt 4 oben) |
| Los gegen belegte Verteilung | Träger: 87 % der V2-Lose in ¾ … 2½ Einheiten (belegt: alle 8 Burghs), 13 % darunter durch Teilung; am Raster ± 0,5 m 100 % gegen ~67 % (Edinburgh, 49 Lose); Thame ~40 % der Fronten auf Perch-Vielfachen (Bond 1984–5) gegen V2 Einheiten aus 1½–4 Ruten | **teils**: die Ordnung (Viertel einer Ortseinheit) ist belegt und gebaut; die Streuung um sie fehlt; echte Quantile einer Stadt liegen NICHT vor (Tait-Histogramm nicht lesbar: 403) |
| Haushalt gegen Laslett | 4,85 gegen 4,75; Gesinde 12,5 % in 11–14 % | HÄLT (geeicht, nicht vorhergesagt) |
| Miete gegen Beleg | 21 % gegen 5–6 % (England) | **FÄLLT gegen den englischen Beleg**; kontinentaler Beleg fehlt |

**Die Varianz der heutigen Stadt OHNE Ursache** (verlangt, falls die Stadt ärmer bliebe — sie bleibt es an drei Maßen nicht, der Befund gilt
trotzdem): Kultur-Wahl im Pool (FC:4435) und Maß-Jitter (FC:2208–2209) tragen in derselben Stadt 58 % der Breiten- und 52 % der
Tiefen-Varianz und 25 % der Form-Unterschiede; 317 von 378 Formen sind ohne sie nicht da. Keller, Anbau und Balkon (FC:4446, :4448) sind
reine Würfel. Die Höhe ist heute verursacht.

## (5) FÜR DEN SCHNITT DER BAHNEN (nur was dieser Entwurf berührt)

- Das Los, die Geschichte und der Haushalt ersetzen den Wurf an DREI Stellen derselben Funktion: FC:4435 (Kultur je Los → Schule je Stadt),
  FC:4436–4439 (Wurf, Wohlstand, Breite), FC:4444–4448 (Geschoss-Bonus, Keller, Anbau, Balkon). Leser des Ergebnisses: Stufe 1
  `kachelMassen` (FC:4078, :4110) und Stufe 2 `dorfLayout`/`tryPlace` (FC:5487 laut lesen-f) — das Los muss in BEIDEN dasselbe sein; heute
  rechnet Stufe 1 eine eigene stetige Breite (FC:4092–4094). Die Herrenlosen FC:3110–4059 (pruefung-quelle F4–F9, entscheid §0 :52–54)
  gehören damit zu der Bahn, die DORF besitzt.
- `_bauweiseWurf` (FC:2204–2216) bleibt für das Labor (`bauRezept` ohne Los); die Welt ruft ihn nicht mehr für Haushalts-Lose. Ein
  Zwilling entsteht nicht, wenn KULTUR nur noch die Wurzel der Schule liefert (FC:2121–2153 wird Wurzel-Tafel, kein Würfel).
- Der Strom: FNV-1a der Adresse + fmix32 (`rangSchluessel` FC:3693). Befund im Prototyp: ohne Mischer tragen Namen, die sich nur im
  letzten Zeichen unterscheiden, korrelierte obere Bits („lokator|1“ … „lokator|30“ → floor(4u) trifft nur 2 von 4 Klassen; gemessen mit
  node am Prototyp-Strom). Ob `_rollGenome` (Name hinter dem Samen, bau-teile.js:1480–1489) davon betroffen ist: **unsicher**, nicht gemessen.

## (6) ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. **Die häufigste Form am belegten Maß entscheiden:** eine Ursache für die Streuung um das Viertel-Raster (Absteckung, Grenz-Überbau,
   Traufgasse) mit Beleg, oder die Schwelle „≤ heute“ gegen eine belegte Gasse messen statt gegen den heutigen Würfel. Mit der belegten
   Streuung allein: 3,5 %.
2. **Teilung macht Lose:** die Zahl der Häuser aus der Geschichte der Lose rechnen (heute das Wort n von DORF), dann Mauer-Fläche (Behauptung
   4 der Runde 1) neu.
3. **Miete mit Anker:** Inwohner-/Hausgenossen-Anteil einer kontinentalen Stadt nachschlagen (Steuerbuch, z. B. Augsburg, Basel — Suche
   fand Werke, keine Zahl). Bis dahin 0,3 (≈ 7 % der Leute, nahe dem englischen Beleg) statt 1,2.
4. **Ereignis-Raten mit Anker:** Stadtbrand-Häufigkeit, Erbteilungs- und Besitzwechsel-Raten einer Häuserbuch-Stadt.
5. **Ecke und Hang** in das Los (Blöcke `kachelNetz` FC:3864–3865, Gelände `trasseLenk`), das Los auf das Netz der Kachel legen (EIN Los für
   beide Stufen).
6. **Das Bild:** dieselben 30 Städte als Massen (`hausMasse` FC:4119) in Stufe 1 rendern, heute ↔ V2, an derselben Kamera — erst dann ist
   „sichtbar reicher“ gesehen statt gezählt.
7. **Laslett-Verteilung der Haushaltsgrößen** lesen und gegen V2 (0/5/17/21/31/12/7/2/1/3 %) prüfen.

## QUELLEN (Netz; nur Suchbegriffe ohne Projekt- oder Nutzerdaten gesendet)

- G. Stell & R. Tait, „Framework and form: burgage plots, street lines and domestic architecture in early urban Scotland“, Urban History 43(1),
  2016, doi 10.1017/S0963926814000789 — PDF-Text gelesen (Viertel-Schema, 8 Städte, Edinburgh 49 Lose ~⅔ ± 0,5 m, Plot 24 ft = 7,32 m,
  Vorkragung 52–60 cm je Geschoss).
- R. Tait, Edinburgh und Elgin, PSAS (Elgin Einheit 8,1 m, Viertel-Intervalle) — nur über die Zusammenfassung der Suche (Abruf 403).
- J. Spavold & M. Gilman, „The Burgage Plots of Thame, 1150–1340“, Oxoniensia 2002 — PDF-Text gelesen (Einheit ~4 Perches, Bond 1984–5 ~40 %
  der Fronten auf Perch-Vielfachen, halbe Burgage 2 Perches).
- Alnwick Civic Society, „Rods, poles and perches“, 2020 (Conzen 28 ft; 5½ yards = 1 perch).
- Burford (1½ und 3 Perches, Halb-Lose): VCH-Tafel ihr-archive.github.io — nur Zusammenfassung der Suche.
- Laslett (England 1574–1821, hhMittel 4,75; Gesinde 11–14 %, lodgers 5–6 % 1650–1821) — nur Zusammenfassungen der Suche (rug.nl, herts.ac.uk).

## SKRIPTE (Scratch p3/n1811/bau-spike2/, jeder Lauf < 2 s, einer zur Zeit)

- `kern/` — Kopie von p3/n1811/bau-spike/kern (fachwerk-core.js SHA-256 028cc2d0… = n1011-hg), `lade.cjs` — Kopie der Runde 1.
- `stadt-proto.cjs` — der Prototyp: Adressen R1, HEUTE, R1, V2, Gegenprobe, Paare, heute ohne Würfel → `stadt-proto.json`,
  `stadt-v2-haeuser.json` (alle 2 595 Häuser mit Los, Haushalt, Ereignissen), `stadt-proto.log`. `STADT_V2='{…}'` verschiebt gewählte
  Werte (unbekannter Schlüssel wirft), `STADT_TAG` benennt die Ausgabe.
- `empfindlich.sh` — die 9 Läufe → `lauf-*.log`, `stadt-proto-*.json`, `empfindlich.txt`.
- `koordination/vision/bau/zaehl/vielfalt-zweit.cjs` — Zweitzählung heute/R1, wirft bei Abweichung.
- `_edit.cjs` — Hilfsskript der Bearbeitung (ohne Inhalt für das Ergebnis; nicht gelöscht nach der Regel „nichts löschen“).
