# SPIKE GEGEN DAS GESETZ — gerechnet, mit dem Ziel zu widerlegen

Stand: Arbeitsbaum `strahler-leuchte` 2ce8a033d. Ich habe nur gelesen und gerechnet: keine GPU, kein Browser, keine Änderung im Repo.
- Rechnung: `spike.cjs`, volle Ausgabe in `spike.out.txt`, die Eingänge mit Marke in `spike.daten.json`.
- An der Quelle gelesen:
  - vendor/three.webgpu.min.js `mT`, Wort für Wort: r 0,76 · s 0,15 · Fuß `i<.08 ? i−6,25i² : .04` · `mix(e, vec3(u), l)`. Die Kurve sitzt in stamm/dirigent-ankunft.js:167, die Belichtung 1,0 in :168.
  - welt-licht.js:39 (ATMO_BODEN), :76-148 (AUGE, augeZeig, augeMesser) und :752-761 (`belichtung`).
  - Runde 3: `git show 659651da0:welt-licht.js` (augeZeig linear, augeSicht, augeBlende).
  - fachwerk-core.js:6431-6545: BRENNER, LICHT_GESETZ, Wandlaterne, lichtFarbe, STRAHLER, `leuchtdichte`, `strahler`. Dazu :9310 (LICHT_MARKE_M 10 m).
  - stamm/stoff-material.js:2327-2475 (`_lichtPoolTerm`, `_lichtPlatz`, Halm-Leser) und :3898 (HALM_VOLUMEN).
  - stamm/bild-himmel.js:1945-1980 (`_belichtungAusLicht`).
  - stamm/bild-kosten.js:2204-2246 (`_nachtAuge`) und :3011-3018 (NACHT_AUGE).
  - spec/farbe/tag-ref.json und spec/farbe/albedo-tafel.json (ist.welt).
  - Die Quell-Fits des Vor-Spikes: `../quellen-herd.json` und `../quellen-lava.json`.
- Das Gesetz habe ich so gerechnet, wie es in entscheid.md §1 steht:
  - Auge: log-Mittel; Schlüssel c(L_K) mit den Knoten 634,8 / 6 713 / −2,17; κ FOLGT am Mittag; k_a = 0,22·2^c / max(L_K, L☾).
  - Kappe k_c = 0,76 / hellster Kanal von p98 der diffusen Proben, mit der Diffus-Probe L ≤ ρ_max/π·E_Gesetz. Dann k = min(k_a, k_c).
  - Nacht-Auge je Pixel in cd/m², ohne `luxJeEinheit`, `bildZapfen` und `staebchenStaerke`.
  - Kurve zweimal: (1) Vendor-Neutral wörtlich; (2) die Entscheid-Kurve: Khronos für L und C, Oklab-h der Eingangsfarbe, C in 4 Bisektions-Schritten. Danach sRGB-OETF und 8 Bit.

---

## 1. ZUERST: Trägt mein Rechenmodell die gemessenen Bilder? (Gegenprobe Runde 1 und 3)

Die Gesetze der Runden habe ich wörtlich nachgebaut:
- Runde 1: q-Gesetz, Messer 0,25·augeZeig, k = 0,22·2^−2,17 / (0,0573·E).
- Runde 3: zeig = S(A)·E/A, k = k₀ / ((A + 0,25·Σ E)/A)^0,8.
- Dazu das alte Nacht-Auge und Vendor-Neutral.
- Die Quellen sind die vier Glutbrunnen und die Lava-Scheibe aus den Fits des Vor-Spikes.
- Einen Eichpunkt habe ich gesetzt: den Mond-Stoff der quellenlosen Wiese (0,0240/0,0334/0,0097, aus dem r3-Bild umgekehrt). Meine Kette gibt dort 32,8 gegen 31,7 gemessen.

| Zahl | gemessen | gerechnet | ±25 % |
|---|---|---|---|
| Runde 1 Herd k (Kamera nah; fern gibt 1,03) | 0,984 | 0,988 | hält |
| Runde 3 Herd k (nah) | 0,199 | 0,211 | hält |
| Runde 1 Lava k | 0,587 | 0,607 | hält |
| Runde 3 Lava k (Auge zur Scheibe / größte Richtung) | 0,003 | 0,00377 / 0,00370 | **26 % ROT** / 23 % hält |
| Runde 1 Kreis (Mittel Ring 1–2,5 m) | 56,4 | 57,0 | hält |
| Runde 1 ferne Wiese (15 m hinter dem Ziel) | 21,0 | 35,9 | **ROT +71 %** |
| Runde 1 Kreis ÷ fern | 2,69 | 1,59 | **ROT −41 %** |
| Runde 3 Kreis | 79,2 | 180,3 | **ROT +128 %** |
| Runde 3 ferne Wiese | 12,7 | 24,4 | **ROT +92 %** |
| Runde 3 Kreis ÷ fern | 6,24 | 7,39 | hält |
| Runde 1 Ufer-Saum Luma (126/63/20) | 73,3 | 59,6 (94/54/14) | hält (−19 %) |
| Runde 3 Ufer-Saum Luma (233/168/136) | 179,5 | 166,8 (250/150/88) | hält (−7 %) |

**9 von 14 Zahlen halten ±25 %.**

**Das Auge trifft.** Fünf von sechs k halten. Dazu lese ich die Σ E am Auge aus jedem gemessenen k zurück: beide Runden verlangen dieselbe Zahl.
- Herd: 10,4 ↔ 10,7 lx
- Lava: 2 170 ↔ 2 200 lx
- Gasse: 0,244 ↔ 0,249 lx

Das sind 1 bis 3 %. Das Auge der Runden ist damit verstanden.

**Die Flecke treffen nicht.** An den Zahlen des Auftrags fallen vier Flecke ROT, und zwar Kreis und ferne Wiese der Runde 3 sowie die ferne Wiese der Runde 1. Zwei Gründe, beide benannt:
- Gegen die Ausschnitte des Vor-Spikes in DENSELBEN r3-Bildern trifft das Modell auf −3 bis −9 %: Gras hinter dem Bett 188,4 und Kreis fern 185,5 gegen 180,3 gerechnet, ferne Wiese rechts 26,9 gegen 24,4. Die Zahlen 79,2 und 12,7 stammen also aus Ausschnitten, deren Grenzen ich nicht kenne. Der „Kreis“ 79,2 schließt sehr wahrscheinlich dunkle Fläche ein.
- Unter dem q-Gesetz der Runde 1 hebt schon 0,9 lx Feuer die ferne Wiese um eine halbe Mondstufe. Die Luma dort hängt also am Meter, an dem der Ausschnitt liegt.

**Urteil über das Modell, offen:**
- Auf der Ebene der FLECK-LUMA ist das Modell gegen die Zahlen des Auftrags **ROT** (4 von 8 Flecken außerhalb ±25 %). Die absoluten Luma-Werte, die ich unten für das neue Gesetz nenne, sind darum **nicht** gegen das Bild geprüft und tragen kein Urteil.
- Was trägt:
  - der Zustand des Auges (k), gegen die Logs geprüft;
  - die Kurve: Vendor wörtlich, die Mittags-Karte gibt 118;
  - alle Befunde, die aus der FORM des Gesetzes folgen und nicht aus der Lage eines Flecks: der Pixel-Anteil gegen p98, der Fuß der Kurve, die Diffus-Probe, der Farbton der Kurve.

  Nur diese Befunde stehen unten als Urteil.

---

## 2. Die Eingänge (Auszug; alle in `spike.daten.json`)

| Größe | Wert | Marke | Ort |
|---|---|---|---|
| Herd I | 0,0012 × leuchtdichte(2000) 4,57·10⁵ × π·0,38² = **249 cd**, Kern 0,38 m, 0,35 m hoch | G (ε), U (T) | FC:6526, :6532, :6448 |
| Flamme sichtbar | 10 000 cd/m² → Fläche I/L = 0,025 m² | B (Kerzenflamme ≈ 1 sb) | FC:6528 |
| Glutbett | 1 100 K · ε 0,9 → 19,8 cd/m² | U | Entscheid §2 |
| Lava | Riss 1 650 K · ε 0,95 → 3,16·10⁴ cd/m²; Kruste 1 100 K → 19,8; Riss-Anteil 0,14 → Mittel 4 440 cd/m². Der Fit an r4 gibt 4 620 cd/m²: **das trifft auf 4 %** | T B?, ε B, Anteil G | FC:6526; quellen-lava.json |
| Docht | 1 cd, Flamme 0,04 m, 1 850 K; Glas 1/0,104 = 9,6 cd/m² | B | FC:6440, :6423 |
| Gasse | Wandlaterne 2,8 m hoch, Arm 0,4 m, je 10 m | G | FC:6481, :9310 |
| Mond | 0,3965 lx im Zenit, 4 100 K, Höhe 74,2° → 0,382 lx waagrecht | B (Baum), Höhe G | tag-ref.json |
| Mittag | E_h 117 168 lx, davon Himmel 17 000 | B / U | tag-ref.json |
| Albedo | Gras ATMO_BODEN 0,100/0,139/0,045 · Laub 0,091/0,203/0,045 · Haus 0,276/0,132/0,089 · Fels 0,264/0,238/0,176 · ρ_max 0,82 (Tor R) | B | WL:39; albedo-tafel.json ist.welt |
| Halm | quer 0,89 · hoch 0,34 | G | SM:3898 |
| mondheller Himmel | 6,8·10⁻³ cd/m² | U | Fachwissen |
| Pixel-Anteile und Abstände der sieben Sichten | — | **G** | spike.cjs `herd/lava/gasse/wiese/mittag` |

`leuchtdichte` aus fachwerk (Gauß-V) liegt bei 1 100 / 1 650 / 2 000 K um 5 / 2 / 2 % unter der CIE-Mehrlappen-Rechnung. κ FOLGT zu 1,822 (QUELLE rechnete mit einer anderen Mittags-Sicht 1,743). κ hängt also an der gewählten Komposition.

---

## 3. Die sieben Orte unter dem Gesetz (Entscheid-Kurve; mesopisch mit grauem Stäbchen-Farbort)

| Ort | k (bindet) | was das Bild zeigt (sRGB · Luma · S) | (a) | (b) | (c) Entscheid ↔ Neutral | (d) |
|---|---|---|---|---|---|---|
| Mittag | 3,28·10⁻⁵ (Schlüssel) | Karte 122/116/118 **117,4**; Wiese 93,5 | ✓ | ✓ | ✓ ↔ ✓ | — |
| herd-nah 3 m | 0,0453 (Kappe; k_a 0,309) | Gras 0,75 m 226/144/1 151 S 1,00 · 1,25 m 97 · 2,5 m 45 · 4 m 23 · 8 m 5 · 14 m 1,4 · 30 m 0 · Glutbett 251/154/127 · Flamme 255 | ✓ | **✗ Glutbett +2,16 EV** (gilt als diffus) | ✓ (≤ 0,5°) ↔ ✗ Glutbett 9,3° | nah ≠ fern ✓ |
| herd-fern 25 m | **1,07** (Kappe an p98 = Gras 4 m) | Gras 0,75 m **251/235/217 237 S 0,14** · 1,75 m 203 · 2,5 m 184 · 4 m 130 · 14 m 25 · 25 m 9 | ✓ | **✗ vier Gras-Ringe +0,98 … +4,55 EV** | ✓ (≤ 1,3°) ↔ ✗ bis 16,8° | ×23,6 gegen nah ✓ |
| lava-nah 3 m | 0,00394 (Kappe; k_a 0,0094) | Ufer 0,5 m 226/125/0 137 · 2 m 64 · 15 m 4,5 · Baumlinie 43 · Riss 255/253/253 · Kruste 148/40/0 60 | Code-Luma ✗ (Kruste 60,1 < Ufer 2 m 63,9), lineares Y ✓ | ✓ | ✓ ↔ ✓ | — |
| lava-fern | 0,00394 (Kappe) | wie nah (das Ufer 0,5 m liegt in beiden Sichten über p98) | wie nah | ✓ | ✓ | nah = fern (×1,00) |
| gasse-nacht (Docht) | 2,15 (Schlüssel = offene Blende k_a(L☾)) | Glas 247 · Wand unter der Laterne 54/13/6 21 · Fenster 35 · Mondwand 10 · Wand und Pflaster im Mondschatten **0** · Himmel 6 | ✓ | ✓ | ✓ ↔ ✗ Wand 7,6°, Fenster 7,3° (am FUSS) | nah = fern (2,15) |
| wiese-nacht quellenlos | 2,15 (offen) | Wiese 2 m **4,8**, 20 m 3,9 · Karte 26 · Laub zum Mond 10 · Himmel 6 | ✓ | ✓ | — (unter der 8-Bit-Auflösung) | — |
| Vollmond im Zenit | 2,15 (offen) | Karte 34/27/20 **28,0** · Wiese 5,0 | **✗ Himmel 6,1 > Wiese 5,0** (Purkinje) | ✓ | — | — |
| (Zusatz) Neumond | 2,15 | alles 0 | ✓ | ✓ | — | — |

Ohne Kappe, also mit dem Schlüssel allein, stünde das Bild so:
- herd-nah: Gras 0,75 m bei 254/204/166 (S 0,35), das Rosa der Runde 3.
- lava-nah: Ufer 0,5 m bei 250/157/93.

Die Kappe trägt also genau die Orte, an denen die Runden rot wurden.

---

## 4. Hält EIN Gesetz alle Eigenschaften an allen Orten zugleich? — **NEIN.** Vier Risse, je mit der EINEN Größe

**R1 — (b) reißt an herd-fern um +4,55 EV. Die Größe ist das Perzentil 98 der Kappe (entscheid.md §1.3, gewählt).**
- In der fernen Sicht trägt der Feuerkreis (Gras ≤ 2,5 m) 1,57 % der diffusen Pixel. Das liegt unter 2 %, also sieht p98 ihn nicht. Die Kappe stellt auf das Gras in 4 m, und der Kreis steht crèmeweiß: 251/235/217, S 0,14.
- Den Farbton hält die Entscheid-Kurve auf 1,2°, Neutral dreht ihn um 16,8° (das Rosa).
- Setzt man die Kappe aufs Maximum, fällt k um −4,56 EV auf 0,0453, das k der nahen Kamera. Dann liegt die ferne Wiese bei 14 m auf Luma 1,4 und bei 25 m auf 0,2: die Sicht ist schwarz bis auf den Kreis, und (d) bringt nichts mehr, weil nah und fern im selben Zustand stehen.
- Ein Perzentil der Kappe kann nicht beides: den Kreis unter der Schulter halten und die Wiese lesbar lassen. Das Bild spannt 9 Stufen, die Kurve trägt von 0,76 bis Code 1 nur 6,77.

**R2 — (b) reißt an herd-nah um +2,16 EV. Die Größe ist die Schranke der Diffus-Probe ρ_max/π · E_Gesetz(p).**
- Das Glutbett (19,8 cd/m²) liegt unter seiner eigenen Schranke von 184 cd/m², denn die Flamme 0,35 m darüber gibt E ≈ 700 lx. Es gilt also als DIFFUS.
- Bei 1,2 % des Bilds steht es noch über p98. Ab **1,4 %** wird es selbst p98: k fällt um −2,16 EV, und das Gras in 0,75 m sinkt von 151 auf 74.
- Die Probe trennt Strahler von Stoff nur, wo die Strahler weit heller sind als das Licht auf ihnen. Das gilt für Riss und Flamme, nicht für ein Glutbett unter seiner Flamme.
- Damit ist die Behauptung „das Glutbett verschiebt p98 nicht über 2 % Fläche“ (Entscheid §7) gerechnet **falsch an der Schwelle 1,4 %**. Den wahren Bild-Anteil des Betts aus 3 m kenne ich nicht: er hängt an der gewählten Geometrie.

**R3 — Nacht-Boden und Gasse. Die Größe ist der Knoten c_Nacht = −2,17 EV (Bild-Anker, gewählt).**
- Mit dem physikalischen Mond (0,382 lx) steht die Mondwiese bei k·L 0,0165. Das liegt im Fuß der Kurve (x < 0,08, Ausgabe 6,25·x²), und der verdoppelt jede Stufe darunter.
- Die Folgen in Zahlen:
  - Wiese 2 m: Luma **4,8**; main und die Runden messen 31,7.
  - Gasse: Wand und Pflaster im Mondschatten 0,0, die Mondwand 10. Das ist dieselbe „schwarze Gasse“, die der Koordinator an Runde 4 verworfen hat, hier grau statt blau.
- Was es bräuchte:
  - Für den Boden-Anker S0 (≥ 22, bild-kosten.js:3005-3006) einen Knoten von −0,59 EV.
  - Für Gleichstand mit main −0,13 EV; die Karte stünde dann bei Luma 93.
- Knoten −2,17 und Boden-Anker widersprechen sich, sobald der Mond physikalisch ist und `staebchenStaerke` fällt. Einer von beiden muss fallen oder aus dem anderen folgen. Der Spike entscheidet das nicht; er nennt die Zahl.

**R4 — (a) Ordnung: zwei Brüche aus der Messart, nicht aus dem Licht.**
- Vollmond: Der Himmel (0,0071 cd/m², 12 000 K) steht im Bild über der Wiese (0,0080 cd/m²): 6,1 gegen 5,0. Grund ist das mesopische Auge (Purkinje: Blau trägt skotopisch mehr). SOLL (a) muss also sagen, in welcher Leuchtdichte es ordnet. In der photopischen ist das ein Bruch, in der mesopischen keiner.
- Lava: Kruste 19,8 cd/m² gibt 148/40/0, Luma 60,1, und liegt damit unter dem Ufer in 2 m (15,7 cd/m²) mit Luma 63,9. Das gilt nur in der Luma der Codes; im linearen Schirm-Y ist die Reihe monoton. Die Linse (a) muss lineares Y messen. Die Rec.-709-Luma auf Codes, die die Abnahme heute rechnet (`pngLesen`), ist für sattes Rot nicht monoton in der Leuchtdichte.

**Was hält:**
- (c) Farbton mit der Entscheid-Kurve: an allen Orten ≤ 1,3° gegen Δh_tol 1,0–6,6°, vor und über der Schulter.
- Vendor-Neutral bricht (c) über der Schulter (herd-fern 16,8°, Glutbett 9,3°) **und am Fuß**: Gassen-Wand 7,6° gegen eine Toleranz von 2,7°, Fenster 7,3° gegen 3,4°, Pflaster 11,8°. Der Fuß zieht ein Grau ab und dreht damit dunkle, satte Farben. Das Rosa hat also einen zweiten Ort; der Entscheid nennt nur die Schulter.
- (d) Zustand je Sicht: herd ×23,6 zwischen nah und fern.
- Mittag: Karte 117,4 (≈ 118). **Das ist tautologisch**, weil κ an genau dieser Sicht FOLGT. Unabhängig wäre erst eine zweite Mittags-Sicht (Wald, Gasse), und die ist nicht gerechnet.
- Das Tor 0,75: Unter der Schulter trägt Feuer-Gras S 1,00 / 0,99 / 0,98 / 0,97 (0,75–2,5 m). Das folgt aus der Lichtfarbe (B/R 0,0076). Das Tor verlangt also die Schulter und **fällt**, so wie der Entscheid sagt.

---

## 5. Gegen die Wirklichkeit

| Ort | gerechnet | Wirklichkeit | Marke |
|---|---|---|---|
| Kerze/Docht 1 cd | Wand 1 m unter dem Kopf 0,32 lx · Pflaster unter der Laterne 0,12 lx · zwischen zwei Laternen in 10 m 0,006 lx | 1 cd → 1 lx in 1 m, senkrecht (Definition) | B |
| Vollmond | 0,382 lx waagrecht (Baum 0,3965 im Zenit) | meist genannt 0,1–0,3 lx (Kyba et al. 2017; USNO-Tafeln bis ≈ 0,3) → der Baum liegt um ≈ +0,4 EV am oberen Rand | U (Quelle aus dem Gedächtnis) |
| Lagerfeuer-Flamme | 10 000 cd/m², I 249 cd | Kerzenflamme ≈ 0,5–1·10⁴ cd/m² (B); Holzfeuer-Flamme ähnlich in der Größenordnung (U) | B/U |
| Boden am Feuer 1/2/3 m | waagrecht 65 / 10 / 3,1 lx; Halm 130 / 35 / 16 lx; Gras-Leuchtdichte 4,9 / 1,3 / 0,6 cd/m² | keine gemessene Zahl, die ich sicher zitieren kann; die Größenordnung „einige zehn lx in 1–2 m“ halte ich für plausibel | **U** |
| Gaslaterne (gas 16 cd) | unter dem Kopf 1,9 lx · zwischen Masten in 10 m 0,47 lx | historische Gas-Straßenbeleuchtung: zehntel bis wenige lx | U |
| Lava | Riss 1 650 K → 3,16·10⁴ cd/m² | Basalt bricht mit 1 370–1 470 K aus (Kīlauea ≈ 1 150 °C). Bei 1 400 K wären es 2 250 cd/m², **÷ 14**. Der Fit an r4 (4 620 cd/m² im Mittel) trifft nur, weil der Riss-Anteil 0,14 gewählt ist. | U (T über der Wirklichkeit) |

---

## 6. Nicht gelesen, nicht gerechnet (benannt)

- Die Pixel-Anteile und Abstände der sieben Sichten sind GEWÄHLT, nicht aus dem Spiel. R1 und R2 hängen an Anteilen (1,57 % gegen 2 %; 1,4 %) und sind darum Schwellen, keine Bild-Messung.
- Die Grenzen der Mess-Ausschnitte hinter 79,2 / 12,7 / 56,4 / 21,0 / 38,3 kenne ich nicht.
- Die Gassen-Wand der Runde 1 (38,3) habe ich nicht vorwärts gerechnet. Kamera-Lage und Wand fehlen, und Σ E 0,245 lx braucht mehr als die Docht-Laternen: mit kernM 2,742 tragen sie am Auge höchstens 0,133 lx.
- Bloom, lokaler Kontrast, Farb-Abstufung (`graded`), TRAA und die Luft-Stelle der Post-Kette sind nicht nachgebaut.
- Der Stäbchen-Farbort ist unsicher. Mit Jensen (x,y 0,25/0,25) wird die Mondwiese 4/9/29: blau, Δh 161° gegen Lichtfarbe × Albedo. Gerechnet habe ich mit Grau.
- Die Mittags-Eichung ist nur an EINER Sicht gerechnet, und dort ist sie tautologisch.
- Den Mond habe ich ohne Luftmasse gerechnet (74,2°: ≈ 1,04). Den Mondhimmel und den Mittags-Himmel habe ich als gleichmäßige Kuppel gerechnet, nicht über Hillaire.
- Kein Bild, keine Zahl am Gerät.

---

**Antwort:** Ein Gesetz hält nicht alle Eigenschaften an allen Orten zugleich.
- **R1:** (b) reißt an herd-fern um +4,55 EV, weil die Kappe am Perzentil 98 einen Feuerkreis von 1,57 % des Bilds nicht sieht.
- **R2:** (b) reißt an herd-nah um +2,16 EV, weil die Diffus-Probe das Glutbett durchlässt; ab 1,4 % Bild-Anteil fällt k um −2,16 EV.
- **R3:** Der Nacht-Knoten −2,17 EV legt die Mondwiese auf Luma 4,8 statt 31,7 (main), denn der Fuß der Kurve quadriert das Dunkel. Für den Boden-Anker ≥ 22 bräuchte es −0,59 EV.

Was hält: (c) mit der Oklab-Kurve überall ≤ 1,3°, (d) ×23,6, und das Tor 0,75 fällt zu Recht. Vendor-Neutral bricht (c) auch am Fuß, nicht nur an der Schulter.

Das Rechenmodell trifft das Auge der Runden (5 von 6 k ±25 %, Rückrechnung 1–3 %). Die Flecke trifft es gegen die Zahlen des Auftrags nur in 4 von 8 Fällen. Darum gelten alle absoluten Luma-Werte dieses Blatts als ungeprüft, und das Urteil steht nur auf R1–R3 als Formbefunden.
