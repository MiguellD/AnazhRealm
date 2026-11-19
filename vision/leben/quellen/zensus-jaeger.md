# ZENSUS der Jäger-Ebene des Bestands (19.11.)

Baum `C:/Users/micha/AnazhRealm-leben` (leben-erbe, 9c36ec126a), Vergleich main b7ed8419 (Baum AnazhRealm-profiband, nur gelesen).
Messung: Kaskade-Läufe, 8 Saaten grund + 8 Saaten ohneWolf, Fenster Takt 1080–2160, je 34 560 Revier-Takte der nahen Regionen
(`bau/zensus-jagd.cjs` → `bau/zj-main.json`, `bau/zj-kopf.json`, gelesen mit `bau/zj-lesen.cjs`).

## 1. Einheit, Anker, Leser

| Was | Formel / Wert heute | Einheit | Datei:Zeile |
|---|---|---|---|
| Das Revier | Kachel der Welt, Seite revierM 113 × √π = 200,3 m = 4,01 ha, 4 × 4 Zellen zu 0,2507 ha | m, ha | tetrapoda-core.js:2192 · stamm/kreatur-leben.js:2262–2268, 3782–3788 |
| K je Gattung | K_g = kopfJeHa 25 × Σ Zellen lebensraum(g, Klasse) × ha × Nahrung_g | KÖPFE je Revier | stamm/kreatur-leben.js:2170–2181 · tetrapoda-core.js:2194 |
| Nahrung | (1 − diet) × Äsung + diet × Beute; diet Wolf 1 · Fuchs 1 · Bär 0,5 · Reh 0 | 0..1 | tetrapoda-core.js:2212–2215, 62 |
| Beute-Glied | Beute = min(1, Köpfe der Pflanzenfresser (diet ≤ 0,25: nur das Reh) im SELBEN Revier ÷ beuteVoll 30) | 0..1, aus Köpfen | stamm/kreatur-leben.js:2165–2167 · tetrapoda-core.js:2195, 210 |
| Lebensraum | Wolf nur „wald“ × 0,35 · Reh „wiese“, „waldrand“ × 1 · Fuchs × 0,4 · Bär „fluss“, „hang“ × 0,25 | Eignung × Häufigkeit | tetrapoda-core.js:2065–2088 |
| K Wolf heute | = 6,27 × 0,35 × Wald-Zellen × n_Reh ÷ 30 — linear in den Reh-KÖPFEN: gemessen K 1,93 bei 3,93 Rehen = 0,49 Wolf je Reh-Kopf, in kg (Guss) 0,33 kg Wolf je kg Reh | Köpfe | wie oben |
| Bilanz | n < K: Geburt 0,1 × (1 − n/K) je Takt; n > K: Hungertod 0,2 × min(1, n/K − 1); n = KÖPFE | Chance je Takt (10 s) | tetrapoda-core.js:2217–2222, 2196–2197 · Leser stamm/kreatur-leben.js:2185 |
| Der Riss | p = min(1, riss 0,6 × jaeger × D² ÷ (rissHalb 0,1² + D²)), jaeger = Σ diet der wilden Jäger im Revier, D = Köpfe ihrer Beute ÷ 30; EIN Riss je Gattung, Revier und Takt | Chance je Takt | tetrapoda-core.js:2207–2211, 2199–2200 · Ruf stamm/kreatur-leben.js:2182 |
| Riss in Zahlen | Kopf: Kost 1,21, Beute 2,01 Köpfe → p im Mittel 0,267 (270 Risse je 1000 Revier-Takte); main: Kost 1,12, Beute 1,20 → 0,194 (198) | | st-kopf.json, st-main.json |
| Wer ist Jäger, wer Beute | Jäger: diet > 0 UND wild (diet ≥ 0,75 und ≥ jagdKg 21,5 kg — Wolf, schwerer Fuchs; der Bär ist nie wild). Beute: andere Gattung, nicht wild, ≤ beuteMasse 2,0 × kg des Jägers | kg | stamm/kreatur-leben.js:2205–2226 · tetrapoda-core.js:166, 209–213, 1952–1956 |
| Leser des Risses | `_bestandTakt`: je Gattung ein Wurf gegen p, Opfer `_bestandRissOpfer` (Gewicht ∝ Masse unter den Gejagten) | | stamm/kreatur-leben.js:2444–2466 · stamm/kreatur-erbe.js:114–118 |
| Kaskaden-Probe | 6 Szenarien × 8 Saaten, gemessen im TAL = EINEM Revier; Bänder: hirsche ≥ +0,3 · jungwuchs ≤ −0,2 · woelfe ≤ 0 (KI < 0) · nahrung ≤ −0,3 · mutante hält nicht; Kappe 0, Band [⅓×, 3×], Dichte ≥ 1,5 je ha, ms ≤ 5,8 | relativ zum Grundlauf | scripts/diag-kreatur-leben.cjs:327–433 (Bänder :400–408), Urteil :1596–1636 |
| Gründer-Gruppe | Wirft eine Gattung (Geburt-Chance) in einem Revier OHNE reifes Tier ihrer Art, tritt eine Gruppe von herde.wurf Köpfen (Wolf 3–6, Reh 3–7) ERWACHSEN (alterS = reifeS) am Kandidaten-Ort ein — aus dem Nichts, kein Nachbar-Revier gibt sie ab | Köpfe | stamm/kreatur-leben.js:2005–2007, 2031–2035 · tetrapoda-core.js:282 |
| Bindung an das Revier | EIN Revier: `_kreaturBestand(key)` liest nur `regionen[key].tiere` und das Feld dieser Kachel; kein Tier wechselt je das Verzeichnis (nur Geburt, Tod, Annahme-Akt) — Jäger und Beute teilen dieselben 4 ha | | stamm/kreatur-leben.js:2153–2159, 2037, 2476 · stamm/feld-leben.js:2356–2372 |
| Masse | `_gattungKg` = Volumen des Gusses × ρ: Reh 94,2 · Wolf 64,0 · Fuchs 15,0 · Bär 335,4 kg | kg | stamm/kreatur-leben.js:2384–2386 |
| Zeit | lebensdauerS = refS 2100 × (M ÷ 64)^0,2: Wolf 2100 s (210 Takte), Reh 2269 s; reif Wolf 420 s, Reh 463 s | s | leben-core.js:152–154, 63, 72–74 |

## 2. Die Zahlen der Welt gegen die Pyramide (0,009 kg Jäger je kg Beute, Carbone & Gittleman 2002)

| je Revier (4 ha), grund | main | Kopf |
|---|---|---|
| Reh Köpfe · kg · kg je Kopf | 5,27 · 2 459 · 466,7 | 3,93 · 252 · 64,2 (M∞ 101,3) |
| Wolf Köpfe · kg · kg je Kopf | 2,50 · 242 · 96,8 | 1,89 · 102 · 53,9 |
| kg Wolf ÷ kg Reh | 0,099 (11× die Pyramide) | 0,403 (45×) |
| Reh ohne Wolf Köpfe · kg | 7,16 · 1 601 | 7,75 · 707 |
| N Reviere je Rudel (4,5 Köpfe × 64 kg = 288 kg ÷ 0,009 = 32 000 kg Reh) | 13,0 | 126,8 (mit Wolf) · 45,3 (Reh-Stand ohne Wolf) |
| Risse je Wolf je Leben (210 Takte) | 18,9 Risse · 2 175 kg | 32,9 Risse · 1 778 kg |
| Bedarf je Wolf je Leben | 59 900 kg (Wolf 96,8 kg) | 38 600 kg (Wolf 53,9 kg) = 714 Risse zu 54 kg |
| heute gedeckt | 3,6 % | 4,6 % |
| Druck auf das Reh (gerissene kg ÷ kg Reh je Takt) | 1,05 % | 6,33 % |
| Druck unter der Pyramide (0,009 × Bedarf ÷ kg Wolf) | 2,94 % | 2,94 % |

Bedarf: Kleiber 293 kJ/d × m^¾, Feld = 3 × Grund, Beute 7 kJ/g feucht × 0,84 assimiliert × 0,75 genutzt = 0,199 kg/d je kg^¾
(Wolf 64 kg: 4,5 kg/d). Die EINE Raffung: refS 2100 s = t_max des 64-kg-Wolfs, t_max = 11,6 a × M^0,20 (Calder 1984) = 26,6 a
→ 46,4 Tage je Takt → Wolf 64 kg: 209 kg Beute je Takt, 43 900 kg je Leben. UNSICHER ist der Anker der Raffung: mit 8 a
(Lebensdauer im Freiland) fällt der Bedarf auf ein Drittel (heute gedeckt ~15 %).

Lesart der Tafel: am Kopf stehen 45× zu viele Wölfe, jeder reißt 1/22 seines Bedarfs — zusammen das 2,15-Fache des Drucks der
Pyramide. Die Zahl der Wölfe ist falsch UND die Rate je Wolf; nur ihr Produkt liegt in der Größenordnung.

## 3. Die Größen-Flucht

| Anteil der Reh-Köpfe, die Beute sind (≤ 2 × kg eines wilden Jägers im Revier) | main | Kopf |
|---|---|---|
| gemessen | 0,227 (in kg 0,057) | 0,512 (reif 0,348 · jung 0,659) |
| alle Rehe auf bs 1,000 (Guss) gesetzt, dieselben Jäger | 0,876 | 0,552 |
| alle Rehe auf bs 1,075 (Mittel der vier Wurf-Bänder von main) | 0,788 | — |
| Rehe unausgelesen aus den vier Bändern gewürfelt | 0,734 | — |
| Reh-Köpfe in Revier-Takten OHNE wilden Jäger | 0,049 | 0,388 |

BESTÄTIGT, mit einer Korrektur am Mechanismus: an main wuchs kein Tier (bs fest ab Geburt, vier Bänder, tetrapoda-core.js an
b7ed8419 `groessen`); der Riss nahm nur, was klein genug war, und ließ die Großen stehen — die AUSLESE trieb das Mittel der
Stehenden von bs 1,075 auf 1,548 (kg je Kopf 467 statt Guss 94). Nach dem Gesetz gewürfelt wären 73 % der Rehe Beute gewesen,
gemessen waren es 23 %. Zwei Neben-Funde: (a) ein Guss-Reh (94 kg) liegt UNTER 2 × Guss-Wolf (128 kg) — am Kopf ist das reife
Reh Beute, sobald ein wilder Wolf im Revier steht; (b) an main waren die Füchse wild (≥ 21,5 kg durch die Bänder: 84 % im
Grundlauf, 49 % ohne Wolf) und rissen im Szenario „ohneWolf“ 42 Rehe je 1000 Revier-Takte — der Gegenlauf von main war nie räuberfrei (Kopf: 5).

## Anhang: der Spike „Pyramide“ (Mittelfeld-Rudel, N 45), `bau/spike-rudel.js`, Ergebnis `bau/st-rudel45.json`

Näherung beim Namen: DAS MITTELFELD-RUDEL — gerechnet werden nur die 4 nahen Reviere; die übrigen 41 Reviere des Rudel-Reviers
tragen als Annahme dieselbe Beute je Revier (f = N ÷ 4); das Rudel sind alle Wölfe der 4 Reviere, EINE Bilanz in kg.

| Soll | Ist | |
|---|---|---|
| kaskade nahrung ≤ −0,3 | −0,334 [−0,402; −0,238] | GRÜN |
| Reh mit Wolf 0,40–0,80 K in Last | 0,403 (ohne Wolf 0,858) | GRÜN, am unteren Rand |
| Jung-Anteil Reh ≤ 0,40 | 0,610 | ROT |
| Gründer-Gruppen ≤ 10 % der Reh-Geburten | 22,9 % (1 376 von 6 006) | ROT |
| kg Wolf ÷ kg Reh über dem Rudel-Revier 0,005–0,02 | 0,0086 (je Saat 0,0079–0,0093) | GRÜN |
| Wolf stirbt nicht aus, ≥ 7 von 8 Saaten mit Rudel am Ende | 4 von 8 mit ≥ 2 Köpfen (Köpfe 2 1 1 1 2 2 2 1; 8 von 8 mit ≥ 1) | ROT |
| reife Rehe CV ≤ 0,12 | 0,086 | GRÜN |
| Maximum bs ≤ 1,4 | 1,279 | GRÜN |

Dazu: der Bedarf wird gedeckt (gerissen 44,4 kg je Takt im Fenster = 102 % des Bedarfs, Klemme p > 1 in 335 von 34 560
Revier-Takten); Rudel im Mittel 142 kg bei 366 kg Reh je Revier. Die Richtung „woelfe“ der Probe bricht (0 Wölfe im Tal in
7 von 8 Saaten: das Rudel steht in dem Revier seines Baus, die Probe zählt EIN Revier).
