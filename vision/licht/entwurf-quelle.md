# ENTWURF „VON DER QUELLE HER“ — das EINE Gesetz des Lichts

Stand: Arbeitsbaum `strahler-leuchte` 2ce8a033d, nur gelesen und gerechnet (kein Bau, keine GPU, kein Browser).
Rechnungen (node, in diesem Ordner): `quelle-physik.cjs` (Planck → CIE 1931 → sRGB, Neutral wie Vendor `mT`, Oklab, Krawczyk),
`quelle-daten.cjs` → `quelle-daten.out.txt` (die Quellen), `quelle-sichten.cjs` → `quelle-sichten.out.txt` (Herd nah/fern, Lava-Ufer,
Gasse, Mittag; Runde 1), `quelle-bruch.cjs` → `quelle-bruch.out.txt` (Fenster der Kurve, Runde 2, Reichweite), `quelle-zaehle.cjs` →
`quelle-zaehle.out.txt` (das Urteil je Zeile der Tafel).
Selbst an der Quelle gelesen: welt-licht.js:40-239 und :735-790 · fachwerk-core.js:6415-6560 · stamm/dirigent-kern.js:1595-1851 ·
stamm/stoff-material.js:2290-2505 · stamm/bild-himmel.js:1925-2124 · stamm/bild-kosten.js:2197-2250, :2990-3018 · foundry-core.js:286-315 ·
vendor/three.webgpu.min.js `mT` (Khronos PBR Neutral) · spec/farbe/tag-ref.json.

**Der Kern in einem Satz.** Heute trägt die Welt ZWEI Maße für Licht: der Tag steht linear (1 Welt-Einheit = 14 690 lx), die Nacht auf
der Skala S = 7,83·(lx/115 000)^0,2 (welt-licht.js:94, :102-106), und das Auge staucht das Licht der Quellen schon VOR dem Stoff
(`_lichtPoolTerm` stoff-material.js:2359-2365, `augeGlut` welt-licht.js:138-142). Der Mond der Vollmondnacht (0,28 lx) steht darum mit
dem 30 900-Fachen seines Tag-Maßes in der Welt (`quelle-sichten.out.txt`, Runde 1). Ein Feuer von 250 cd steht im Tag-Maß. Jedes
Auge, das danach aus diesen Zahlen eine Belichtung liest, liest zwei Maße. Der Entwurf macht daraus EIN Maß, nämlich cd/m². Das Auge
wird ein dünner Schritt am Ende, der die Leuchtdichte der Sicht liest.

---

## 1. Die Kette in echten Einheiten

| Schritt | Formel | Einheit |
|---|---|---|
| **Quelle: Körper** (Flamme, Glut, Lava, Stahl, Funke) | L = ε · 683 lm/W · ∫ B_λ(T) · ȳ(λ) dλ (Planck, CIE 1931 2°); Farbe = Planck → XYZ → lineares sRGB, auf Luma 1 genormt, außerhalb des Gamuts **Weiß gleicher Luma zugemischt** statt geklemmt | cd/m² |
| **Quelle: Lampe** (Brenner, Fenster, Fahrzeug, Tor) | I(ω) = I₀ · sicht_Kopf(ω) (Candela des Datums × der Anteil der Flamme, den der Kopf in Richtung ω frei gibt); L_Glas = I₀ / A_Glas | cd · cd/m² |
| **Quelle: Himmelskörper** | Sonne E⊥ = 133 800 lx über der Luft; Mond E⊥ = 0,3965 lx × Phase; L_Scheibe = E⊥ / Ω (Ω = π·r²) | lx · cd/m² |
| **Quelle: Himmel** | L_Himmel(ω) = E⊥_Sonne · LUT_Hillaire(ω) (die Tafel rechnet heute schon in Bruchteilen von E0); nachts: Mond durch dieselbe Luft + Nachthimmel 1,7·10⁻⁴ cd/m² (22 mag/″²) | cd/m² |
| **Weg** | E(p) = I(ω) · cos θ / (d² + k²) · e^(−β·d) · V(p); Scheibe (Lava): der geschlossene Sichtfaktor wie heute (stoff-material.js:2399-2440) · L; In-Streuung im Dunst: L_in = β · I · ∫ p(θ)/r² e^(−β(s+r)) ds (geschlossen nach Sun et al. 2005) | lx · cd/m² |
| **Stoff** | L_aus = (ρ/π + f_GGX) · E (r184 Lambert + GGX, `_punktLichtBrdf`); ein Strahler addiert sein L | cd/m² |
| **Brücke** (die EINE) | **Szenen-Zahl = L [cd/m²] × k** — `vorbelichtet`: jede Quelle wird VOR dem Schreiben ihres Uniforms mit dem k des letzten Bilds multipliziert (Filament „pre-exposed lights“). Keine zweite Skala, kein S, kein LEGACY_LICHT, keine KEY_BASE. | ohne Einheit |
| **Auge** | Zustand L_a = exp(Mittel ln Y) der Sicht (die Luma des gerenderten Bilds, ein Histogramm auf 1/8-Auflösung, verzögert um ein Bild); Schlüssel a(L_a) = 1,03 − 2/(2 + log₁₀(L_a + 1)) (Krawczyk 2005); k = min( N⁻¹(0,18·a(L_a)/a₀) / (κ·L_a) , 0,76 / max_c L_diffus,p98 ); zeitlich: τ ins Helle 0,3 s, ins Dunkle 0,8 s; mesopisch je Pixel: Zapfen-Anteil m = log(L/0,005)/log(1000) aus der echten Leuchtdichte | m²/cd |
| **Tonkurve** | Khronos PBR Neutral (0,76 · 0,15 · Fuß 0,08/6,25/0,04), über der Schulter die Entsättigung im **Oklab-Farbton der Eingangsfarbe** (Farbton-Halt) | linear Ausgabe |
| **Schirm** | sRGB-OETF (IEC 61966-2-1) | 8 bit |

Zu den Zeichen: N⁻¹ ist die Umkehr von Neutral für ein Grau (Fuß √(D/6,25), linear D + 0,04). a₀ = a(L_a) der Mess-Wiese am Mittag.
κ = L_Karte / L_a am Mittag ist 1,743 und FOLGT (`quelle-sichten.out.txt`, Eichung). Damit legt k am Mittag die 18-%-Karte auf
k·L = 0,220. Das ist die Eichung der Lehre 21: sie bleibt, gerechnet und nicht gesetzt.

---

## 2. Die Daten, die übrig bleiben (alles andere FOLGT)

Marke: **belegt** (Norm, Literatur, fremde Messung) · **gewählt** · **unsicher**.

| Quelle | Temperatur / Farbort | Stärke | Geometrie | Marke |
|---|---|---|---|---|
| Sonne | 5 772 K (IAU 2015) | E⊥ 133 800 lx über der Luft (Darula/Kittler/Gueymard 2005). Planck × Ω gibt 125 000 lx, also −6,6 %: die Sonne ist kein schwarzer Strahler, das Datum ist die Messung. | Winkelradius 0,2666° | belegt |
| Mond | 4 100 K (Jensen et al. 2001) | E⊥ 0,3965 lx Vollmond im Zenit (tag-ref.json, USNO 171) × Phase(Datum) → L 6 180 cd/m² FOLGT | 0,259° | belegt (L unsicher: gemessen eher 2 500–4 000) |
| Nachthimmel (Airglow + Sterne) | Farbort gewählt (grünlich-neutral) | 1,71·10⁻⁴ cd/m² (22 mag/″²) → E_h 5,4·10⁻⁴ lx (tag-ref: 0,0005) | Halbkugel | belegt |
| Sterne | aus B−V | E = 10^(−0,4(m + 13,99)) lx je Stern, die Größen N30 | Punkt | belegt |
| Himmel bei Tag | FOLGT (Hillaire, Luft-Daten S13–S24) | FOLGT aus E⊥_Sonne | — | — |
| Herdfeuer (Flamme) | 2 000 K (Holzfeuer 1 800–2 000 K) | I 250 cd (15 kW · 0,16 lm/W), L_Flamme 10 000 cd/m² (Kerzenflamme ~1 sb). Daraus FOLGT die leuchtende Fläche A = I/L = 0,025 m². | hoeheM 0,35 | I belegt (Größenordnung) · L belegt · T unsicher |
| Glutbett | 1 100 K (Holzkohle 900–1 200 K), ε 0,9 → L 20,8 cd/m² FOLGT | — | Bett ⌀ 0,76 m | unsicher |
| Brand | **dieselbe Flamme wie der Herd** (eine Temperatur, ein L) | I FOLGT aus der brennenden Fläche × L | Zelle | — |
| Lava | T der Decke (Ausbruch 1 650 K), ε 0,95 → Riss 32 400 cd/m² FOLGT | Decke: Riss-Anteil × L | Scheibe r | ε belegt (Basalt-Schmelze ~0,9–0,95) |
| Stahl / Esse / Funke | T des Zustands, ε 0,8 | FOLGT | Fläche | ε unsicher |
| Laterne je Brenner | docht 1 850 · argand 1 950 · gas 2 000 · glühstrumpf 2 700 · glühlampe 2 856 K (**neu: Kelvin je Brenner**) | 1 · 10 · 16 · 100 · 110 cd (BRENNER, FC:6443-6447) | Flamme flammeM, Kopf (Haube/Boden/**Drehung**) | cd belegt · K: docht und glühlampe belegt (Kerze, CIE A), die anderen drei unsicher |
| Fenster | der Brenner des Hauses (sein Jahr) | L = τ_Glas · ρ_Wand · (I/d²)/π FOLGT: docht 0,032 · argand 0,32 · gas 0,51 · glühstrumpf 3,2 · glühlampe 3,5 cd/m² | d 2 m, ρ 0,5, τ 0,8 | d und ρ gewählt |
| Tor | Farbort 0xffd9a0 (Absicht) | I 15 cd (L28) | Spanne | gewählt |
| Fahrzeug | Farbort nach ECE (weiß · gelb · rot) | Tagfahr 400–1 200 · Schluss 4–12 · Brems 60–185 · Abblend ≤ ~20 000 cd im Kegel (R87, R7, R112) | Linse | belegt |
| Augen-Licht (Höhle) | 4 750 K (R7) | I in cd (eine Leuchte am Leib, kein Bezug auf k) | — | gewählt |
| **Stoff** | — | Albedo ρ je Kanal aus `spec/farbe/albedo-tafel.json` (E16, heute ohne Leser in der Welt) und ATMO_BODEN; Glas τ; Rauheit/Metall MERL | — | belegt |
| **Luft** | — | S13–S24 wie heute (Bruneton/Hillaire, AERONET, Koschmieder) | — | belegt |
| **Auge** | — | MESOPISCH 0,005/5 cd/m² (CIE 191) · V′ (A12) · Krawczyk a(L_a) · τ 0,3/0,8 s · Stäbchen-Farbort (Jensen-Blauverschiebung) | — | belegt bis auf den Stäbchen-Farbort (unsicher) |

**Was dadurch verschwindet.** Das Blau der Mondnacht ist kein Datum der Quelle mehr: `nacht.mond` 0x9fb8dc (foundry-core.js:312)
fällt, denn Mondlicht ist rötlicher als Sonnenlicht. Das Blau trägt das Auge, als Farbort des Stäbchen-Graus. Ohne diesen Farbort
steht die Mondwand warm-grau (Gasse: „Wand zum Mond“ sRGB 56/46/36, `quelle-sichten.out.txt`). Das ist die sichtbarste Änderung des
Entwurfs, und sie hängt an einer unsicheren Zahl.

---

## 3. Signaturen und der EINE Chokepoint je Schritt

| Schritt | Funktion (Ort) | Eingang → Ausgang | Chokepoint (ersetzt) |
|---|---|---|---|
| Quelle | `quelle(datum)` in fachwerk-core.js (ersetzt `strahler` FC:6540, `LICHT_GESETZ.*.cdM2`, den Pool-Teil von `leuchte().candela/cdM2`) | {art: koerper·lampe·flamme·himmel·farbort, T/xy, ε, I₀, L, A, kopf, drehung} → {farbe (Luma 1, linear), L cd/m², I₀ cd, A m², kern m, kopf} | FC:6540 |
| Farbe | `planckFarbe(T)` (ersetzt `lichtFarbe` FC:6487-6498) | K → lineares sRGB, Luma 1; gültig 800–25 000 K, Gamut durch Weiß gleicher Luma | FC:6487 |
| Leuchtdichte | `leuchtdichte(T)` (FC:6532, bleibt; dieselbe ȳ-Tafel wie `planckFarbe`) | K → cd/m² | FC:6532 |
| Weg (GPU) | `_lichtPlatz` (SM:2391) | Platz {Lage, I·k·farbe, kern, kopf+drehung, flach}, β → E·BRDF·k (rgb), ohne Stauchung | SM:2391; `_lichtPoolTerm` SM:2327 liefert die SUMME, die Zeilen 2359-2365 fallen |
| Weg (CPU) | `lichtAbfall` (FC:6504) + `kopfSicht` | dieselbe Formel für Reichweite, Rang und Wurf | FC:6504 |
| Reichweite | `reichweite(I, k)` = √(k·I·ρ_max/(π·v₁)), v₁ = 0,00697 (die erste sichtbare Stufe im Fuß von Neutral) | cd, m²/cd → m (Deckel 48 m bleibt Technik) | ersetzt `augeReichweite` WL:144 und `_leuchtReichweite` DK:1846 |
| Stoff | `_punktLichtBrdf` (SM:2487) + r184 Standard | ρ, Rauheit → BRDF 1/sr | unverändert |
| Strahler-Bild | `glut = L · k` je **Instanz** (Ecken-Kanal `aGlut`) | cd/m² → Szenen-Zahl | ersetzt `lichtGlut[Schlüssel]`/`lavaGlut` (DK:1622-1631) |
| Brücke | `vorbelichtet(L, k)` = L·k, einmal je Bild für jede Quelle (Sonne `dl.intensity`, Himmel-LUT-Faktor, Pool `farbe`, Glut) | cd/m² · lx → Szenen-Zahl | EIN Schreiber `_augeTakt` |
| Auge | `_augeTakt()` (ersetzt `_belichtungAusLicht` BH:1945, `belichtung` WL:769, `belichtungStufen` WL:743, den Augen-Teil von `_raumBlendeTakt` BH:1983) | Histogramm (ln Y, p98 der Pixel ohne Strahler-Marke) des letzten Bilds → L_a, k | BH:1945 |
| Mesopisch | `_nachtAuge` (BK:2204) liest die Leuchtdichte L = Szenen-Zahl / k direkt in cd/m² | Pixel → Zapfen-Anteil m, Grau der Stäbchen | BK:2204; `luxJeEinheit`, `bildZapfen` und `staebchenStaerke` fallen |
| Tonkurve | `neutralFarbton(c)` im Ausgabe-Knoten der Post-Kette | k·L → Ausgabe linear | DA:167 (`renderer.toneMapping`) |

---

## 4. Was fällt (Zahl)

Urteil je Zeile der Tafel (`quelle-zaehle.cjs`; D bleibt Datum · F folgt · X fällt · U unberührt, d. h. Technik, Kosmetik,
Stoff-Look, Form, Welt-Dynamik oder eigene Studio-Bühne):

| | Felder |
|---|---|
| ganze Tafel (221 Zeilen · 583 Felder) | **fällt 169** · folgt 39 · bleibt 116 · unberührt 259 |
| Licht-Kette (407 Felder: ohne Technik, Kosmetik und Studios) | **fällt 159** · folgt 34 · bleibt 116 · unberührt 98 |
| davon GESETZT ohne Anker (252) | **108 fallen** |
| davon GESETZT, Anker eigenes Bild (20) | **15 fallen** |
| neue Daten | **+17** (Sonne E⊥ und T, Mond T und Phase, Nachthimmel L und Farbort, Glutbett T, 5 × Kelvin je Brenner, Stube d und ρ, Stäbchen-Farbort, Krawczyk-Schlüssel, Tapetum des Tier-Auges) |
| **Datum in der Kette danach** | **116 + 17 = 133** (aus 407) |

Die Fälle mit datei:zeile:

- **Die zweite Skala und ihre Eichungen:** KEY_BASE und LEGACY_LICHT (welt-licht.js:49, :53), AUGE p/q/anteil/welt/lux/eps/saum/zustandMinLux
  (welt-licht.js:84-93), `augeS/augeLux/augeMass/augeZeig/augeGlut/augeReichweite/augeMesser` (welt-licht.js:94-148), NACHT_AUGE
  `luxJeEinheit`/`bildZapfen`/`staebchenStaerke` (bild-kosten.js:3011-3016), die Stauchung im Stoff (stoff-material.js:2359-2365),
  `lichtAuge` (dirigent-kern.js:1619), Augen-Licht ÷π×π (bild-himmel.js:2092 ↔ dirigent-kern.js:2012).
- **Der Fahrplan der Kamera:** BELICHTUNG min/steigung/gleitung/stufen/nachtKnotenE/nachtKnotenGrad/nachtGrad (welt-licht.js:173-183),
  `belichtungStufen`/`belichtung` (welt-licht.js:743-774), der Raum-Deckel (bild-himmel.js:1987, :2003, :2018), INNEN_DAEMMER (FC:2771),
  `tagAchse.nacht/tag/hell` als Lichtschalter (welt-licht.js:838-854), GRENZGROESSE als Tafel (welt-licht.js:187-196; die Grenzgröße
  FOLGT aus der Leuchtdichte des Himmels), der fail-soft-Ersatz `?? 1` (dirigent-kern.js:1621-1629, :1849; bild-himmel.js:2071).
- **Die Ersatz-Lichter der Nacht:** MOND_STAERKE (welt-licht.js:169), `nacht.mond/himmel/skala/lum` (foundry-core.js:312), STERNENLICHT
  `daemmer` (welt-licht.js:226), Ambient 0,04·nacht und Gefühl (bild-himmel.js:2251-2252), Hemi 0,1 und Hemi-Boden (bild-himmel.js:2471,
  :2492), Aura (bild-himmel.js:2474-2486), Boot-Saat (dirigent-ankunft.js:356, :455), sonneLeucht 4 und Mondscheibe 9 m (bild-himmel.js:3355;
  dirigent-ankunft.js:339-347), mondGegenHimmel (bild-himmel.js:3349), sternKontrast (bild-himmel.js:3343), Wasser-Boden max(0,22)
  (bild-himmel.js:2566).
- **Wetter als Lichtstellwert:** WX_LICHT (phyto-core.js:4302), WEATHER_GREY_K (daten.js:130), Tönung, Nenner und Klammer (bild-himmel.js:
  1207, 1216-1281, 1755) sowie die Stärke-Rampe der DSL-Himmelsfarbe (feld-dsl.js:996-1009). Die Farbe des Satzes bleibt als Datum der
  Luft: eine Absorption je Kanal. Die Gefühls- und Aura-Tönung (S10, N33; 24 Felder) verlässt die Licht-Kette. Soll sie bleiben,
  dann nur als EINE benannte Farbkorrektur nach der Kurve. Das entscheidet der Schöpfer (Scope), ich streiche es nicht still.
- **Zwillinge der Quellen:** `feuer.abfall/kernM` (FC:6456), `STRAHLER.abfall` und `emissiv.flamme` 0,0012 (FC:6527; die Fläche FOLGT aus
  I/L), GLUT_LUMA und die gemalten Glut-Töne (FC:2107, :7111, :7155, :11336), `BRAND.licht/schein` (FB:964, :997), die zweite Flammen-
  Temperatur, `ziel` 1,6 und T⁴ (FB:850, :994-996), `M.feuer` (FC:2073), Funken-`leucht` (kampf.js:2684), `laterne.kelvin/cdM2/abfall/kernM`
  (FC:6458), `fenster.kelvin/cdM2` (FC:6457), die Wandlaterne mit eigener Candela 118 (FC:6466-6482; sie trägt den Brenner), die
  Glut-Uniform je Schlüssel (dirigent-kern.js:1626-1631), Tor i0/iOpen/dist/decay (porta-core.js:1722-1724), Fahrzeug-`ei` (vehicle-core.js:
  164-186), Porta-Rahmen und Glimmen aus Tags (porta-core.js:1331; stoff-material.js:787-900), Studio-Emissiv ohne Datum (studio-stoff.js:
  344-347), Tier-Augen-Glut (tetrapoda-core.js:3692), environmentIntensity, Membran-F0 0,04 (porta-core.js:1667, FOLGT 0,020),
  `kernAnteil` (bild-schatten.js:1701), das Labor-Rig des fachwerk (fachwerk.js:640-669; das Labor liest dasselbe Gesetz).

---

## 5. Die vier Runden, gerechnet — und warum der Entwurf nicht an dieselbe Wand läuft

**Die gemeinsame Wand.** Alle vier Runden stellten das Auge aus **Beleuchtungsstärke** (am Auge, im Feld, im Becken). Gelesen wurde sie
in einer Welt mit zwei Maßen (Tag linear, Nacht auf S), und das Licht der Quellen war schon vor dem Stoff gestaucht. Die Leuchtdichte,
die tatsächlich in der Sicht liegt, las keine Runde. Die Kurve aber verlangt genau das, in Zahlen: Feuer-Gras (2 000 K ×
ATMO_BODEN) trägt den hellsten Kanal beim 2,10-Fachen seiner Luma. Bei k·L(Luma) = 0,362 erreicht der rote Kanal 0,76, und dort
beginnt Neutral, R zu kappen und G und B zum Weiß zu heben: das ist das Rosa (`quelle-bruch.out.txt`; der Weg über die Schulter:
Luma 0,5 → 242/157/39, Luma 1 → 251/177/104, Luma 4 → 254/217/191, `quelle-sichten.out.txt`).

- **Runde 1 (q-Gesetz).** Gras in 0,8 m trägt 234 lx vom Feuer, in 14 m 0,727 lx: physikalisch 321 : 1, also 8,33 Stufen. Das q-Gesetz
  (welt-licht.js:120-124, A 0,2988 lx) zeigt 5,58 : 1, also 2,48 Stufen. Fast sechs Stufen Verlauf sind weg, das ist die warme Wäsche ohne
  Verlauf. Es ist eine Stauchung des LICHTS, kein Zustand des Auges.
- **Runde 2 (das Knie, welt-licht.js:67-69).** Der Glühstrumpf trug im Dorf von 1320 einen orangen Schleier über 46 m. Unter dem Entwurf
  brennt dort der Docht (1 cd). Wo die Laterne unter dem Mond liegt, liest das mesopische Auge die echte Leuchtdichte (0,011 cd/m²,
  Zapfen-Anteil 0,12). Die Farbe der Laterne trägt am Fleck in 8 m 0,2 % (Docht) bzw. 17,6 % (Glühstrumpf), in 46 m 0,0 % bzw. 0,2 %.
  Die Kante gehört der Quelle (Brenner), die Wäsche der fernen Fläche fällt am Auge.
- **Runde 3 (ein Zustand je Sicht, 659651da0).** Der Messer (a) setzte k aus Σ E am Auge mit Anteil 0,25. Im Vor-Spike stand Gras am Herd
  nah bei 177,9 (244/167/95), S 0,61: über der Schulter. Das Band „Luma 90–150 und S ≤ 0,75“ ist für JEDES k leer (`vor-spike-auge.md`
  §2, §4). Rechnung des Entwurfs: unter der Schulter trägt Feuer-Gras physikalisch **S_HSV 1,000** (k·L 0,05/0,15/0,30 →
  91/55/0 · 152/95/0 · 208/132/0). Die Sättigung 0,948 des Tors liegt also UNTER der Physik. **Das Tor 0,75 folgt nicht aus dem
  Gesetz und fällt; (c) ersetzt es.**
- **Runde 4 (Feld-Messer + von Kries).** Das Feld-Log-Mittel der Beleuchtungsstärke setzte an der Lava einen Zustand von 9,25 lx, nötig
  waren ≥ 223 lx (k um 12,7× zu hoch, der Saum 239,0 rosa-weiß). An der Gasse setzte es 2,63 lx, nötig waren ≤ 0,43 lx (k um 4–7× zu
  niedrig, Wand 1,0, blau-schwarz) (`vor-spike-auge.md` §2). Beide Fehler kommen aus derselben Quelle. Das Feld misst E dort, wo Licht
  ist, nicht die Leuchtdichte, die der Blick sieht: an der Lava liegt das hellste diffuse Gras über E am Auge, in der Gasse sind 85 % der
  Pixel Schatten-Wand. Von Kries nahm dazu der Quelle ihre Farbe.

**Der Entwurf an denselben Orten** (`quelle-sichten.out.txt`, Neutral, Docht in der Gasse):

| Sicht | L_a cd/m² | k (welche Grenze) | heller diffuser Fleck | dunkler Fleck | (a) Ordnung | (b) diffus über der Schulter | (c) Farbton-Drift diffus |
|---|---|---|---|---|---|---|---|
| Mittag | 3 850 | 3,28·10⁻⁵ (Schlüssel) | Karte k·L 0,220 | — | — | 0 | — |
| Herd nah (3 m) | 0,207 | 0,0411 (Deckel; Schlüssel 0,151) | Gras 0,8 m 226/144/0, Luma 151, S 1,00 | Gras 14 m Luma 1,4 | 0 Brüche | 0 | 0,2° |
| Herd fern (25 m) | 0,014 | 0,261 (Deckel; Schlüssel 1,54) | Gras 2 m 207/133/21, Luma 141 | Wiese 25 m Luma 3,2 | 0 | 0 | 0,4° |
| Lava-Ufer (3 m) | 5,5 | 0,00225 (Deckel; Schlüssel 0,0131) | Ufer 0,5 m 226/125/0, Luma 137 | Ufer 15 m Luma 4,7 · Baumlinie 31,9 | 0 | 0 | 0,1° |
| Gasse (1320) | 0,0094 | 2,26 (Schlüssel; Deckel 4,49) | Wand unter Laterne 108/57/24, Luma 66 | Wand im Schatten Luma 3,1 · Mondwand 47 · Fenster 37 | 0 | 0 | — |

(d) Zustand je Sicht: nah 0,0411 und fern 0,261, also verschiedene Zustände an beiden Kameras (×6,35). Ohne den Deckel läge der
Schlüssel allein über der Schulter: Herd nah 2 Flecke (Gras 0,8 m 252/186/126, S 0,50, das Rosa), Lava 3 Flecke (Ufer 0,5 m
253/189/156, S 0,38). **Der Deckel ist also die Eigenschaft (b), gebaut statt geprüft.** Seine Spanne ist aus der Kurve hergeleitet:
0,76 ÷ (hellster Kanal ÷ Luma).

**Über der Schulter stehen nur Strahler.** Mit Neutral driftet ihr Farbton: Glutbett 1 100 K 253/149/136, Oklab-Farbton 37° → 28°;
Laternen-Glas 255/246/243, 55° → 38°. Mit dem Farbton-Halt hält er: Glutbett 251/152/123 bei 37°, Glas bei 55°. Das ist (c) über der
Schulter, und darum steht der Farbton-Halt in der Kette.

**Wo der Entwurf am ehesten bricht.** Neutral trägt für ein Grau von der Schulter (0,76) bis zur ersten sichtbaren Stufe (sRGB 1/255,
im Fuß v = 0,00697) **6,77 Stufen**. Am Herd nah spannt die diffuse Leuchtdichte vom Gras in 0,8 m bis zur Mondwiese in 30 m
**9,02 Stufen**, dazu 1,07 Stufen Kanal-Faktor über der Luma. Mit dem Deckel fällt die Mondwiese also nah am Feuer unter Luma 1
(14 m: 1,4; 30 m: 0,2), fern unter Luma 4. Das ist physikalisch richtig (Blendung durch das Feuer), aber es ist der Ort, an dem der
Spieler „die Welt wird schwarz“ sagt (vgl. welt-licht.js:77, Baumlinie 4,2). Ein globales k mit Neutral kann ihn nicht heilen.
Heilen kann ihn nur eine örtliche Anpassung, und die ist nicht Teil dieses Entwurfs. Zweitens: der Deckel braucht die Marke
„Strahler“ je Pixel. Ohne sie fiele p98 an der Lava in die Risse (32 400 cd/m²), und das Ufer würde schwarz.

---

## 6. Der Preis, grob, mit Grund (nichts davon am Gerät gemessen)

- **Stoff:** `_lichtPoolTerm` verliert die Stauchung (zwei `pow` und ein `min` je Fragment, stoff-material.js:2362-2364). Dazu kommt je Platz
  ein `exp(−β·d)` in der Schleife. Netto etwa gleich viele Operationen, der Fragment-Text wird kürzer. Uniforms: `lichtAuge` (vec3) fällt.
  k steckt in den bestehenden Quell-Uniforms (CPU), es gibt keinen neuen Uniform.
- **Auge:** neu ist ein Rechen-Programm für das Histogramm (64 Fächer ln Y und p98 auf 1/8-Auflösung, 240 × 135 Pixel) und eins für die
  Reduktion, also +2 Programme. Schätzung GTX 1050: 0,05–0,1 ms GPU, Rücklesen asynchron (ein Bild Verzug, CPU ~0,05 ms). Die
  Strahler-Marke steht im Alpha des Szenen-Ziels (opake Stoffe tragen dort heute nichts): 0 Byte mehr Bandbreite. Ob die Post-Kette
  oder TRAA das Alpha liest, habe ich NICHT geprüft.
- **CPU:** es fallen `augeLux`/`augeMass`/`_beckenAmAuge` und `augeReichweite` je Quelle und Bild. Dazu kommen das Rücklesen und
  „× k“ beim Schreiben der Quell-Uniforms. Netto ≤ 0.
- **Tonkurve:** Farbton-Halt im bestehenden Ausgabe-Knoten der Post-Kette (kein Durchgang mehr). Je Pixel über der Schulter ~25 ALU
  (zwei Oklab-Wandlungen). Schätzung < 0,05 ms bei 1080p.
- **In-Streuung der Quellen im Dunst:** bei klarer Luft (β 1,96·10⁻⁴/m) unsichtbar (≤ 10⁻³ cd/m² neben 10⁻² Mondwiese, grob). Erst im
  Nebel nötig. Je Platz ein geschlossener Term in der Luft-Stelle, Schätzung ~0,1 ms. Diese Stelle habe ich nicht gelesen.
- **fp16:** die Vorbelichtung hält die Zahlen im Bereich. Mittags trägt die Sonnenscheibe 1,85·10⁹ × 3,28·10⁻⁵ = 6,1·10⁴ < 65 504.
  Ohne Vorbelichtung liefe sie über.

**Die drei alten offenen Punkte an ihrem Platz:**
1. **Kopf-Glut und Kelvin je Brenner** gehören in den Schritt Quelle. BRENNER trägt `kelvin` (fünf neue Daten). Die Glut des Kopfs ist
   `I₀/A_Glas × k` je Instanz über den Ecken-Kanal `aGlut`. Die Uniform je Schlüssel von LICHT_GESETZ (DK:1626-1631) fällt, und L8 und
   L16 fallen mit ihr. L20 (`leuchte().cdM2`) bekommt seinen Leser.
2. **Kopf als Inkreis** gehört zur Geometrie der Quelle. Der Pool-Eintrag trägt `drehung` (DK:1908-1917 trägt heute keine), `kopfSicht`
   rechnet im Rahmen des Kopfs über das Rechteck statt über den Inkreis, `lichtLeib` nimmt die Haube (0,20 m).
3. **`_lichtWurfTakt` kennt den Kopf nicht** — das gehört in den Schritt Weg. Rang, Reichweite und Wurf lesen dieselbe Funktion
   I(ω) = I₀·kopfSicht(ω) wie der Stoff (EINE Funktion für SM:2423-2436, DK:1819, DK:1846-1851, DK:1879-1882 und BS:493-507). Die
   Wichtigkeit ist E·k am Bezugsort, nicht mehr `augeZeig`.

---

## Nicht gelesen, nicht gerechnet (benannt)

- Die Luft-Stelle der Post-Kette (wo `luftProben`/`_luftBeta` das Bild löschen) habe ich nicht gelesen, ebenso das Alpha in der Post-Kette
  und in TRAA, die Panoramen der Studios und den Weg Tor → Membran. Bloom (A25) misst heute VOR k. Ob es unter der Vorbelichtung neu
  geeicht werden muss, ist ungerechnet.
- Die Geometrie der drei Sichten (Pixel-Anteile, Kamera, Bodenhöhen, Wandmaße, Albedo von Putz und Pflaster) ist GEWÄHLT und nicht aus
  dem Spiel gelesen. Die Flecke des Vor-Spikes (aus Bildern von r3/r4) habe ich nicht neu berechnet, ich zitiere sie nur. Der Vergleich
  mit den Runden 3 und 4 trägt die Zahlen von `vor-spike-auge.md`, nicht meine.
- Mesopisch rechne ich je Pixel (wie der Kern heute). CIE 191 bezieht m eigentlich auf die Leuchtdichte der Anpassung. Mit dem EINEN L_a
  würde das Feuer-Gras am Herd nah halb entsättigt (m(0,207) = 0,54). Das ist ungerechnet.
- Der Krawczyk-Schlüssel ist für einen Reinhard-Operator veröffentlicht. Unter Neutral mit Fuß-Umkehr ist er nicht gegen ein Bild
  geprüft. Bei der Nacht-Karte gibt er −2,55 EV gegen den Mittag, der Bild-Anker der Welt −2,17 EV. Das ist eine Probe, kein Beleg.
- Die CIE-Funktionen sind die Mehrlappen-Näherung (Wyman/Sloan/Shirley 2013), nicht die Tafel. Die Planck-Farbe weicht von Kim–Kang
  ≤ 0,02 im Grün ab (2 000 K: 0,267 ↔ 0,256), unter 1 667 K stärker (1 300 K: 0,118 ↔ 0,176 geklemmt).
- Die Schatten der drei Plätze ohne Würfel (sie leuchten durch Wände, e B-1) bleiben ein Bruch des Wegs. Der Entwurf schneidet sie nicht.
- Kein Bild, kein Gerät, keine ms gemessen. Jede Preisangabe ist eine Schätzung mit Grund.
