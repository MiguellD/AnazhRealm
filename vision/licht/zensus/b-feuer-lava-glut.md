# (b) FEUER · HERD · GLUTBRUNNEN · BRAND · LAVA · GLUT — die Temperatur-Strahler

Stand: Zweig `strahler-leuchte` = 2ce8a033d, nur gelesen. Rechnungen nachgerechnet mit den kopierten Formeln
(`leuchtdichte`, `lichtFarbe`) in `scratchpad/zensus/b-rechnung/r.js`, `r3.js` (node, keine Datei im Baum berührt).
Vergleichswert „Planck exakt“ = Schwarzkörper, gefaltet mit der CIE-1931-Mehrkeulen-Näherung (Wyman–Sloan–Shirley 2013),
NICHT mit der CIE-Tafel. Kürzel: FC = fachwerk-core.js, DK = stamm/dirigent-kern.js, SW = stamm/siedlung-wege.js,
FB = stamm/feld-brand.js, FL = stamm/feld-leben.js, SM = stamm/stoff-material.js, SS = stamm/studio-stoff.js,
WL = welt-licht.js, GC = gelaende-core.js, FW = worlds/fachwerk/fachwerk.js.

## 1. TAFEL DER GRÖSSEN

| # | Name | Wert | Einheit | Anker | Definition | Leser (datei:zeile) | F/G |
|---|------|------|---------|-------|-----------|---------------------|-----|
| 1 | LICHT_GESETZ.feuer.kelvin | 2000 | K | Kommentar „Holzfeuer 1 800–2 000 K: die gelben Flammen tragen das Licht“, keine Quelle | FC:6456 | DK:1903 (über D.kelvin), DK:1923/1930 (Brand), FW:652, FW:675 | GESETZT |
| 2 | LICHT_GESETZ.feuer.abfall | 2 | Exponent | Physik 1/d² | FC:6456 | nur das Labor: FW:655, FW:675 (die Welt liest Nr. 9) | GESETZT (Physik) |
| 3 | LICHT_GESETZ.feuer.kernM | 0,76 | m (als Ø gemeint, heißt „Kern“) | „wie klang bettRefM“ | FC:6456 | nur das Labor FW:652 (als Ø: π·k²/4); in der Welt ungelesen | GESETZT |
| 4 | LICHT_GESETZ.feuer.hoeheM | 0,35 | m | „0,35 m über dem Bett“, keine Quelle | FC:6456 | DK:1903 → DK:1911; FW:748 | GESETZT |
| 5 | feuer.flacker.amp | 0,18 | Stellwert ohne Einheit (relativ) | keiner | FC:6456 | DK:1838; FW:1052 | GESETZT |
| 6 | feuer.flacker.hz | [6,3 · 9,7] | Hz | „die Flamme atmet in 6–10 Hz“, keine Quelle | FC:6456 | FC:6553 | GESETZT |
| 7 | lichtFlackern-Gewichte | 0,6 / 0,4, Phase ×2,1 + 1,3 | ohne Einheit | keiner | FC:6553 | DK:1838 | GESETZT |
| 8 | LICHT_GESETZ.feuer.cdM2 | 10 000 | cd/m² | „das Mittel über sein Bett“, keine Quelle, keine Rechnung | FC:6529 | DK:1629 (`lichtGlut.feuer`), SM:742 (Filter), FW:666 (LAB_GLUT) | GESETZT |
| 9 | STRAHLER.abfall | 2 | Exponent | Physik 1/d² | FC:6527 | FC:6545 → DK:1712/1726 → Stoff | GESETZT (Physik) |
| 10 | STRAHLER.emissiv.flamme | 0,0012 | ohne Einheit | Rückrechnung im Kommentar: Kerze 80 W → 13 lm, ein Feuer 10–20 kW → 130–250 cd; Wert so gewählt, dass Ø 0,76 m ≈ 250 cd | FC:6527 | DK:1756 (Vorgabe jedes `_strahler`), FW:652 | FOLGT aus Ziel-Candela (kalibriert) |
| 11 | STRAHLER.emissiv.lava | 0,95 | ohne Einheit | keine Quelle | FC:6527 | DK:1788, SW:602 | GESETZT |
| 12 | STRAHLER.emissiv.stahl | 0,8 | ohne Einheit | keine Quelle | FC:6527 | FL:2575 | GESETZT |
| 13 | leuchtdichte: 683 · 2hc² 1,1910429e-16 · c₂ 0,014387769 · V(λ) ≈ 1,019·e^(−285,4(λ−0,559)²) · 380–780 nm / 5 nm | — | lm/W, W·m², m·K | Norm/Physik (CIE 1924 in Gauß-Näherung) | FC:6532–6538 | FC:6542; DK:1788; SW:602 | Physik (Abweichung zur CIE-Näherung −2 % bei 2000 K, −8 % bei 798 K) |
| 14 | lichtFarbe: Kim–Kang 2002 kubisch, sRGB-Matrix IEC 61966-2-1, Klemme 1667–25 000 K, Kanäle max(0,·), Norm auf hellsten Kanal = 1 | — | linear sRGB | Norm | FC:6487–6498 | DK:1743, SW:570, FB:850, FW:650/675, kampf.js:930 | Physik/Norm |
| 15 | GLUT_LUMA | 0,344 | Luma (ohne Einheit) | „Glut-Mitte 0,75/0,25/0,08 (Luma 0,344)“ — diese Farbe malt keine Ecke (gesucht: `0.75, 0.25, 0.08`, `[0.75,` in FC: nur der Kommentar FC:2102) | FC:2107 | FC:2099 (`__leucht = 1/0,344 = 2,907`) → SS:398 | GESETZT |
| 16 | gemalte Glut-Töne: Bett Mitte 0,30/0,10/0,03 → Rand 0,06/0,04/0,03 · Scheit-Stirn 0,3/0,1/0,03 | — | lineare Albedo/Leuchtfarbe | keiner | FC:7111, FC:7155 | Vertex-Farbe → SS:398 (`vcol × leucht × Höhe`) | GESETZT |
| 17 | FLAMME.ton (Flamme der Feuerstelle) | R 0,55−0,10t · G 0,30−0,16t · B 0,08−0,045t | linear | keiner (kein kelvin) | FC:11336 | FC:7188 | GESETZT |
| 18 | UMWELT.stimmen.glut.bettRefM | 0,76 | m (Ø) | „fachwerk DIE MASSE: Glutbett Ø 0,76 m“ (= 2 × glutR 0,38 · G, FC:7095) | klang-core.js:469 | DK:1886 (Bezugs-Bett jeder Glut), klang-core.js:915 | FOLGT (als Literal kopiert) |
| 19 | klang-core flaeche 0,4536 | 0,4536 | m² | = π/4·0,76² als Literal | klang-core.js:521, :524 | Klang-Bühne | Zwilling von Nr. 18 |
| 20 | BRAND.aufS | 4 | s | keiner | FB:946 | FB:564 (`glut` 0→1) → DK:1930 | GESETZT |
| 21 | LIFE_FIELD.cell (Deckel der Brand-Fläche) | 16 | m | Raster | FL:3074 | DK:1922/1929 (r ≤ 8 m) | GESETZT |
| 22 | Höhe des Brand-Lichts | Boden + 1 | m | keiner | FB:639 | DK:1931 | GESETZT |
| 23 | BRAND.licht | 4 | — | — | FB:964 | ungelesen (gesucht `BRAND.licht`, `B.licht` im Brand: kein Leser; Kommentar FB:941 nennt ihn noch) | ungelesen |
| 24 | BRAND.bild.flamme.kelvin | [3000 Wurzel · 1700 Spitze] | K | keiner | FB:994 | FB:841/849 | GESETZT |
| 25 | BRAND.bild.flamme.ziel | 1,6 | Bild-Zahl vor der Tonkurve (÷ Belichtung) | keiner | FB:995 | FB:896 | GESETZT |
| 26 | BRAND.bild.flamme.schein | 7,5 | „Welt-Einheiten“ | — | FB:997 | ungelesen (gesucht `schein`, `BF.schein`; nur Kommentare FB:975, DK:1753) | ungelesen |
| 27 | BRAND.bild.flamme.mantel | 1 | ohne Einheit | keiner | FB:996 | FB:894 | GESETZT |
| 28 | T⁴-Gewicht der Flammen-Tafel | (K/K0)⁴ | ohne Einheit | „Stefan–Boltzmann“ | FB:850 | FB:851 (Bytes der Tafel) | Physik, falsch angewandt (s. 3) |
| 29 | LAVA.glueht (Draper-Punkt) | 798 | K | Physik (Draper) | GC:1822 | SW:533, GC:1832 | GESETZT (Physik) |
| 30 | LAVA.ueberhitzung | 150 | K | keine Quelle | GC:1818 | SW:533, GC:1843 | GESETZT |
| 31 | STOFF_GESETZ stein tSchmelz | 1500 | K | Zeile der Stoff-Tafel (Quelle dort nicht geprüft) | schmiede-core.js:2892 | SW:530–533, GC:1843 | GESETZT (Tafel) |
| 32 | Ausbruch t0 = tSchmelz + ueberhitzung | 1650 | K | folgt aus 30+31 | SW:533 | SW:570, SW:591, DK:1788 | FOLGT |
| 33 | GLUT_BILD c₂ · λ [611, 549, 464] | 1,438777e-2 · nm | m·K, nm | CODATA 2018 · sRGB-Primärfarben IEC | SW:3034–3037 | SW:572 | Physik/Norm |
| 34 | LAVA_KRUSTE sigma 0,25 · offen 0,17 · platte 0,62 · randDicke [0,5 · 1] | — | ohne Einheit / m | keiner (Bild-Maße) | SW:3044–3049 | SW:597–601 (Licht-Mittel), SW:626 (Scheibe) | GESETZT |
| 35 | ESSE.feuerK | 1573 | K | „gelbe Glut 1 300 °C“, keine Quelle | FL:3118 | FL:2512, :2526, :2561 (nur Wärme des Stahls; das LICHT der Esse liest Nr. 1) | GESETZT |
| 36 | ESSE.flaecheM2 (Klinge) | 0,06 | m² | keiner | FL:3125 | FL:2572 | GESETZT |
| 37 | ESSE.handHoeheM | 1,1 | m | keiner | FL:3126 | FL:2567 | GESETZT |
| 38 | FUNKEN.kelvin · FUNKEN.leucht | 1900 · 4 | K · ohne Einheit | „≈ 1 900 K“ ohne Quelle · keiner | kampf.js:2683–2684 | kampf.js:930 (Farbe × 4, MeshBasic) | GESETZT |
| 39 | Stoff „glut“: Farbe 0xff5a14, wärmeleitung 0,95, brennbar 1, magieleitung 0,75 | — | sRGB-Hex, Tags 0…1 | keiner | stamm/bau-vorlagen.js:1861–1869 | SM:787–794 (glimmen) | GESETZT |
| 40 | Glimm-Formel: glimmen = min(1, mag·0,55 + wl·brenn·0,6); I = min(1,5, glimmen·0,6·boost) | 0,9825 → I 0,59 | ohne Einheit | keiner | SM:787, SM:899 | SM:895–900 | GESETZT |
| 41 | Esse-Kohlenbett: Farbe 0xff7a2a, emissiveBoost 1,5 / 1,7 (Meister) | I 0,884 / 1,002 | — | keiner | stamm/bau-teile.js:1771–1774 | SM:898 | GESETZT |
| 42 | M.feuer emissive 0xff5212 × 1,5, color 0xff8636 | — | sRGB-Hex | keiner | FC:2073 | color: Grundton `_colFor` FC:2329; emissive reist (koerper-leib.js:1455, SS:345), im Bild vom Knoten ersetzt (SS:398, FC:2112) | ungelesen im Bild |
| 43 | `_strahler`-Stufen: 25 K · ¼ m Kern · Speicher 512 | — | K, m | keiner | DK:1759–1777 | DK:1903, :1930, :1954, FL:2570 | GESETZT |
| 44 | `_lavaLeucht`-Stufen: 5 K · 128 Proben · Scheibe ½ m | — | K, m | keiner | SW:587, SW:596, DK:1953 | DK:1950/1954 | GESETZT |
| 45 | Labor-Herd: Bezug 2 m, Reichweite ≥ 2,5 m, (1 − 2/R)^abfall | — | m | keiner | FW:655 | FW:1052 | GESETZT |
| 46 | Ersatz-Umgebung ohne Lesung `_augeLux ?? 1` | 1 | lx | keiner | DK:1623, :1629, :1849 | — | GESETZT |

Nachgerechnete Zahlen (r.js): leuchtdichte 1300 K 628 · 1573 K 1,61·10⁴ · 1650 K 3,33·10⁴ · 2000 K 4,57·10⁵ cd/m² ·
Flamme 2000 K × 0,0012 = 548 cd/m²; Bezugs-Bett 0,4536 m² → 249 cd, Kern 0,38 m; Esse-Bett (latheProfile 0,5·1,4·1,2 =
0,84 m², klang.js:339) → 460 cd; Lava-Ausbruch 3,16·10⁴ cd/m²; Stahl 1573 K × 0,8 × 0,06 m² = 772 cd (12 861 cd/m²).
lichtFarbe 2000 K = [1, 0,2562, 0,0079] (Planck exakt [1, 0,267, 0,0076]); 1900 K [1, 0,2317, 0] (exakt 0,243);
1300 · 1500 · 1573 · 1650 K alle [1, 0,1758, 0] (exakt 0,097 · 0,146 · 0,164 · 0,182).

## 2. DIE RECHENWEGE

W1 — Herdfeuer mit Gestalt (Feuerstelle, Glutbrunnen `studioGestalt: "feuerstelle"`, bau-vorlagen.js:1061), Pool:
`leuchte("feuerstelle")` (FC:7626, Datum = Klon von LICHT_GESETZ.feuer, FC:6585) → `flacker` vorhanden → A = π/4·bettRefM²·sk²
(DK:1886–1900, m²) → `_strahler(2000 K, A, fest)` (DK:1756) → FC `strahler`: L = leuchtdichte(2000)·0,0012 = 548 cd/m²,
candela = L·A = 249 cd, kern = √(A/π) (FC:6540–6545) → `_leuchtCandela` × (1 + 0,18·Flackern) (DK:1839, cd) →
Reichweite `augeReichweite` (WL:144, m, ≤ 48 m, DK:1850) → Uniform `lichtFarbe[k]` = lichtFarbe(2000)/Luma × cd (DK:1711–1712).
Einheiten bis zum Uniform cd; danach rechnet der Stoff E = cd/(d²+k²) lx und die Skala S (Übergabe an Domäne Auge/Pool).

W2 — Glut ohne Gestalt (Esse, jede Glut-Fläche), Pool: `_lichtDatum` → LICHT_GESETZ.feuer (DK:1971) → A = `_glutFlaeche`
(klang.js:326–344, Grundfläche der Teile „glut“) → `_strahler(2000 K, A, fest)` → wie W1; Höhe = `_glutBett` + 0,35 m
(DK:1911, DK:1994). Die Esse leuchtet bei 2000 K × ε 0,0012, ihre Temperatur für den Stahl ist 1573 K (Nr. 35).

W3 — Brand, Pool: je glühende Zelle `_brandGlutUm` (FB:587) → a = Alter·R/(1+ecc), r = min(8 m, a·(1−ecc²)^¼)
(DK:1928–1929, m) → A = π r² · glut (glut = Rampe 0→1 über 4 s, FB:564) → `_strahler(2000 K, A)` mit A auf ¼-m-Kern gerundet,
mindestens k4 = 1 → 0,196 m² (DK:1759–1760) → 548 cd/m² · A, Ort Boden + 1 m (FB:639). Die Byram-Intensität I (kW/m) der
Zelle (FB:737, FB:750) geht in die Flammen-Länge, nicht ins Licht.

W4 — Lava, Pool: Temperatur je Decke `_lavaZustand` (FL:2482 → GC `lava`, Newton-Gang, K) → `_lavaLeucht(TK)` (SW:586):
Mittel über das Schollen-Feld von leuchtdichte(Ts)·0,95 (cd/m²) → Scheibe `_lavaScheibe` (SW:615, m²), Radius auf ½ m
gerundet (DK:1953) → `_strahler(TK, A, flach, {cdM2})` (DK:1954) → Farbe lichtFarbe(TK) (DK:1743) — unter 1667 K konstant
[1, 0,1758, 0].

W5 — Stahl der Esse, Pool: Temperatur `_tickEsse` (FL:2499–2515, Gang gegen ESSE.feuerK 1573 K) → Tor `glutAus(T, 1573) > 0`
(FL:2561, T⁴ über 798 K, nur Ja/Nein) → `_strahler(T, 0,06 m², ESSE_FEST, ε 0,8)` (FL:2570–2576) → 772 cd bei 1573 K.

W6 — gemalte Glut des Herdfeuers (Bett, Scheit-Stirn, Flamme der Feuerstelle): Vertex-Farbe (FC:7111/7155/7188, linear) ×
`__leucht` 2,907 (FC:2099) × `_glutHoehe` = Luma von `lichtGlut.feuer` (SM:2110–2114) ← `_leuchtTakt`: lichtFarbe(2000)/Luma ×
`augeGlut(10 000 cd/m², A lx)` × augeMass (DK:1626–1631; WL:138–142: E = π·L, S(A+E)·E/(A+E)/π). Einheit bricht hier:
cd/m² → Bild-Zahl (Skala S). Am Bett-Mittelpunkt zeigt die Ecke 0,137/0,344 = 40 % der Datums-Höhe, die Flammen-Wurzel 98 %.

W7 — Bild der Lava (Boden-Stoff): `_lavaGlutZahlen` amp = lichtFarbe(1650)/Luma = [2,956, 0,520, 0] (SW:566–574) ×
e^(c₂/λ_k·(1/t0 − 1/T)) je Kanal (SW:558, Wien) × `lavaGlut` = augeGlut(3,16·10⁴ cd/m²) × augeMass (DK:1623) → emissiveNode
(SM:990–992). Nachgerechnet (r3.js) gegen das Pool-Gesetz W4: Luma-Verhältnis zum Ausbruch Bild/Pool 1500 K 0,2268/0,2270 ·
1100 K 6,33/6,62·10⁻⁴ · 798 K 1,68/2,11·10⁻⁷.

W8 — Bild der Brand-Flammen: Tafel 32 Texel, K = 3000 → 1700 K über die Höhe, Ton = lichtFarbe(K)·(K/3000)⁴ in Bytes
(FB:841–853) → × `ziel` 1,6 ÷ toneMappingExposure → `_nachtAuge` (FB:896). Keine Leuchtdichte, kein `augeGlut`.

W9 — Glimmen des Stoffs „glut“ (Esse-Kohlenbett, die unsichtbaren Glut-Parts des Glutbrunnens, bau-vorlagen.js:180–196):
Tags → glimmen 0,9825 (SM:787) → emissive = Hex der Part-Farbe (0xff7a2a / 0xff5a14) × min(1,5; 0,9825·0,6·boost) (SM:893–900),
konstant zu jeder Stunde, ohne Temperatur, ohne Auge.

W10 — Funken: lichtFarbe(1900)·4 = [4, 0,927, 0] als MeshBasic-Farbe (kampf.js:930), konstant.

W11 — Labor (r128): `_FEU_S` = strahler(2000 K, π·0,76²/4, 0,0012) (FW:652) → PointLight-Stärke = augeZeig(cd/(4+k²))/π/(1−2/R)²
(FW:655), Flackern FW:1052; die gemalte Glut über `LAB_GLUT = augeGlut(10 000, lux)` (FW:666, FC:2112).

(Verbraucher ohne eigene Rechnung: der Rauch liest den Pool, stamm/siedlung-bewohner.js:162 `_leuchtStoff(mat, null)`.)

## 3. ZWILLINGE UND BRÜCHE

Z1 — Glutbett/Flamme als ZWEI Leuchtdichten für dasselbe Feuer: der Pool rechnet 2000 K × ε 0,0012 = 548 cd/m² (FC:6527,
DK:1903), das gemalte Bett trägt `cdM2` 10 000 cd/m² (FC:6529, gelesen DK:1629). Faktor 18,2; ein ε, das 10 000 trüge, wäre
0,022. Keine der beiden Zahlen folgt aus der anderen.

Z2 — Drei Flammen-Farbgesetze für EINE Zunge (`FLAMME.zunge`, FC:11335): die Feuerstelle gemalt mit `FLAMME.ton` ohne kelvin
(FC:11336, FC:7188); die Brand-Flamme 3000 → 1700 K über lichtFarbe (FB:994, FB:850); ihr Licht 2000 K (DK:1930).

Z3 — T⁴ für sichtbares Licht im Brand-Bild (FB:850: `Math.pow(K / K0, 4)`), während das Gesetz sagt „T⁴ trägt nur die WÄRME
(`glutAus`), nie das Licht“ (FC:6518). Spitze 1700 K: T⁴ gibt 0,103 des Wurzel-Tons, Planck im Sichtbaren 0,0017
(leuchtdichte 5,2·10⁴ / 3,0·10⁷) — Faktor 60.

Z4 — Klemme der Lichtfarbe bei 1667 K (FC:6488): jede Quelle unter 1667 K trägt dieselbe Farbe [1, 0,1758, 0] — der ganze
Lava-Gang 798–1650 K (W4), der Stahl bis 1573 K (W5), die Esse-Temperatur. Das Bild der Lava (W7) kühlt dagegen über Wien
zu G/R 0,03 aus (r3.js: 1650 K 0,176 → 1000 K 0,062 → 798 K 0,031): Pool-Licht und Bild derselben Decke tragen ab dem
Ausbruch verschiedene Farben. Der Kommentar SW:549–550 nennt die Klemme für den Ausbruch selbst. Unter 2000 K liegt die
Kim-Näherung zudem 4–5 % unter Planck im Grün (1900 K 0,232 statt 0,243).

Z5 — Esse: Licht bei 2000 K (LICHT_GESETZ.feuer über DK:1971), Temperatur des Feuers für den Stahl 1573 K (FL:3118). Ihr Bett
leuchtet mit ε 0,0012 → 548 cd/m², die Klinge darin bei 1573 K mit ε 0,8 → 12 861 cd/m² (23-mal heller je m² als das Feuer,
das sie heizt); das Bett selbst zeigt im Bild W9 (konstantes Hex-Glimmen), nicht W6.

Z6 — Glimmen aus Tags (W9, SM:787–900): Glut-Stoffe ohne Studio-Gestalt glühen mit sRGB-Hex × fester Zahl, ohne cd/m²,
ohne Auge, ohne Tag/Nacht — neben dem `augeGlut`-Weg W6 für dieselbe Klasse „Glutbett“.

Z7 — Brand-Licht ohne Brennstoff: die Fläche ist die ganze überstrichene Ellipse bis 8 m Radius × glut (DK:1928–1930), ε die
Lagerfeuer-Konstante; die Feuerleistung der Zelle (Byram I = H·w·R, FB:737/750, aus der Stoff-Zeile) liest das Licht nicht,
obwohl der Anker von ε selbst eine Leistung ist („0,16 lm je W Brand“, FC:6516). Höchstwert: π·8²·548 ≈ 1,1·10⁵ cd je Zelle.

Z8 — Abfall und Kern doppelt: `LICHT_GESETZ.feuer.abfall` 2 (nur Labor) neben `STRAHLER.abfall` 2 (Welt);
`feuer.kernM` 0,76 (heißt Kern = Radius in `lichtAbfall` FC:6505, wird im Labor als Ø gelesen FW:652) neben `bettRefM` 0,76
(klang-core.js:469) neben dem Literal 0,4536 (klang-core.js:521/524) neben `glutR` 0,38·G der Gestalt (FC:7095).

Z9 — Zwei Temperatur→Leuchtdichte-Formeln der Lava: Pool V(λ)-Integral (SW:602), Bild Wien an drei Wellenlängen (SW:558).
Zahlengleich im oberen Gang (0,1 % bei 1500 K), −4 % bei 1100 K, −20 % am Draper-Punkt.

Klammern, Deckel, Böden im Lichtweg:
- FC:6488 T ∈ [1667, 25 000] K; FC:6493–6495 Kanäle ≥ 0 (Blau 0 unter ≈ 1950 K).
- DK:1759 k4 ≥ 1: jede nicht-feste Flamme (Brand) hat mindestens 0,196 m² → ≥ 108 cd, auch eine eben gezündete Zelle.
- DK:1953 Lava-Scheibe Radius ≥ 0,5 m.
- DK:1929 Brand-Radius ≤ cell/2 = 8 m.
- DK:1850 Reichweite ≤ 48 m (`LICHT_POOL.umkreisM`, SM:3899) und 0 bei R ≤ Kern.
- SM:899 Glimmen ≤ 1,5; SM:787 glimmen ≤ 1.
- GC:1833 glutAus ∈ [0, 1]; SW:541, SW:594 Wärme ∈ [0, 1].
- DK:1777 Speicher > 512 → leer (die Daten werden neu gerechnet).
- DK:1623/1629/1849 `this._augeLux ?? 1`: ohne Lesung rechnet die Glut über 1 lx.

Kommentare, die nicht mehr stimmen:
- DK:1750–1751 „Seine Glut ist die des Wärme-Gesetzes (gelaende-core `glutAus` gegen den Anker `STRAHLER.ankerK`)“ —
  `ankerK` existiert nicht (git grep: nur dieser Kommentar), `_strahler` ruft `glutAus` nicht; „gedeckelt am Umkreis“ steht
  in `_leuchtReichweite`, nicht hier.
- FB:941–942 „Glut leuchtet als Feuer (LICHT_GESETZ.feuer, Masse `licht` × Glut)“ — das Licht läuft über `_strahler`, `licht` ist ungelesen.
- FB:975 `schein` „ihr Licht (`_flammenLicht` …)“ — `_flammenLicht` existiert nicht mehr, `schein` ungelesen.
- FC:2102 „die Glut-Mitte 0,75/0,25/0,08 (Luma 0,344)“ — gemalt wird 0,30/0,10/0,03 (FC:7111).
- WL:125 nennt „Glutbett und Flamme“ als Leser von `augeGlut` — die Brand-Flamme (W8) liest es nicht.
- Zeitpläne: keiner mehr im Lichtweg dieser Domäne; alle Stellen tragen „Bis hier …“-Geschichte (DK:1753–1755, DK:1898–1899,
  DK:1939–1940, SW:581–583, FL:2553–2554).

## 4. ZAHLEN DER DOMÄNE

- Getrennte Lichtwege: **11** (W1–W11; davon 5 Pool-Quellen, 5 Bild-Wege, 1 Labor).
- Größen: **46** Zeilen der Tafel.
- davon GESETZT ohne Anker (keine Quelle, keine Rechnung): **31** (Nr. 1, 3, 4, 5, 6, 7, 8, 11, 12, 15, 16, 17, 20, 21, 22,
  24, 25, 27, 30, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46).
- Ungelesen: **3** (BRAND.licht, flamme.schein, M.feuer-emissive im Bild); in der Welt ungelesen zusätzlich feuer.kernM und feuer.abfall (nur Labor).
- Zwillinge/Brüche beim Namen: **9** (Z1–Z9).

Antwort auf die Kernfragen:
- Die Candela eines Feuers folgt aus GESETZTER Temperatur (2000 K, ein Datum für jedes Feuer: Herd, Esse, Brand) ×
  Fläche × GESETZTEM ε (0,0012, gefittet auf 250 cd). Wurzel bis Brennstoff/Stoff: nein — weder die Stoff-Zeile des Betts
  noch die Feuerleistung erreicht das Licht; die Fläche ist Geometrie (Bett der Gestalt, Glut-Parts, Ellipse der Front).
  Nur Lava (Temperatur aus Gang + Stoff-Zeile stein) und Stahl (Gang gegen 1573 K) tragen eine Temperatur, die FOLGT.
- Farbe: `lichtFarbe` = Kim-Planck-Ort → XYZ (Y = 1) → lineares sRGB, negativ auf 0 geklemmt, auf den hellsten Kanal 1
  genormt (FC:6487–6498); die Verbraucher normen danach noch einmal auf Luma 1 (DK:1630, DK:1711, SW:573). 2000 K
  [1, 0,2562, 0,0079]; 1300–1650 K geklemmt auf [1, 0,1758, 0], Planck dort 0,097–0,182.
- Flamme und Glutbett als zwei Rechnungen: Pool W1/W2 (548 cd/m²) gegen gemaltes Bett W6 (10 000 cd/m²); dazu W8 (Brand-
  Flamme, eigene Höhe `ziel` 1,6) und W9 (Esse-Bett, Hex-Glimmen).

## 5. NICHT GELESEN · ÜBERGABEN

Nicht gelesen: `_lichtPoolTerm` und die Scheiben-Bestrahlung im Stoff (SM:2399 ff.); `_nachtAuge` (stamm/bild-kosten.js);
`_lavaKruste` im Ganzen (SW:1589–1680, nur die Glut-Zeile SW:1668); `_brandBild` Flammen-Setzung FB:655–760 nur bei der
Byram-Zeile; der Quell-Kommentar der Stoff-Zeile stein in schmiede-core.js (nur die Zahl 1500); `_brandZuenden`; die
Linsen in scripts/ (diag-stand-takt.cjs:1204, diag-pruefbuehne.cjs:211/1783 nur im Grep gesehen); klang-core.js außer
469/521/524/915.

Übergaben:
- Auge/Skala S, `augeGlut`, `augeReichweite`, `augeMass`, `zustandMinLux` → Domäne Auge (WL:84–148).
- Pool-Stoff, E = cd/(d²+k²), flache Scheibe, Saum, Wahl der 4 Plätze → Domäne Pool (SM:2399, DK:1600–1736, SM:3899).
- Laterne, Wandlaterne, Fenster, BRENNER, `leuchte`/`kopfSicht` → Domäne Leuchte (FC:6442–6482, FC:7626–7660).
- Tor-Glut (porta GLUT_GESETZ, `_portalLeuchte`) → DK:1960, DK:1740.
- Licht des Auges (`ersatz`, `LEGACY_LICHT` π) → DK:1836, DK:2011, stamm/bild-himmel.js:3392.
- Wärme-Achse `glutAus` / `auraAt` (kein Licht) → GC:1831, GC:1847.
