# Zahlen-Spike Nacht-Auge — Gesetz 659651da0 (Runde 3), reine Rechnung

Rechnung: `spike-auge.cjs` (+ `spike-auge-farbe.cjs`, `png.cjs`; Quellen-Fits `spike-auge-fit-herd.cjs` → `quellen-herd.json`, `spike-auge-fit-lava.cjs` → `quellen-lava.json`), volle Ausgabe `spike-auge.out`.
Kette nachgebaut aus `git show`: Stoff (Welt-Einheiten) → [r4: von Kries im CAT02-LMS, `_augeAngleich`] → Auge der Nacht (`_nachtAuge`: s = (1 − Zapfen(l))·(1 − smoothstep(0,18; 1; l·k)), Grau = skotopisch × 1,22) → × k → r184-webgpu `neutralToneMapping` (startCompression 0,76, desaturation 0,15, Versatz x − 6,25x² / 0,04) → sRGB-OETF → 8 Bit → Luma 709, HSV.
Flecke = selbst gesetzte Ausschnitte (960×540, je 2. Pixel); Werte weichen von den Zahlen des Auftrags ab (siehe 5.).

## 1. Eichung

**Quellenlose Wiese** (r3/wiese-ohne-nacht, Box 0,300–960,540, k 1,5): gemessen 31,7 (29/34/19) S 0,44. Umgekehrt: Stoff 0,0240/0,0334/0,0097 = 0,052 × S(A); Albedo × Geometrie gegen den Mond-Ton ρ = 0,151/0,182/0,044. Rückweg je Pixel 31,7 (exakt); aus EINER Mittel-Farbe 32,5 (+0,8).

**Die Kette ist umkehrbar und trägt** (je Pixel aus r3 umgekehrt, unabhängig von E):

| Prüfung | gemessen | gerechnet | Δ Luma |
|---|---|---|---|
| Rückweg r3 → r3, größter Pixelfehler, alle 16 Flecke | — | — | ≤ 3,0 |
| Gras Ring links r3 → r4 (k 0,199 → 0,111, LMS-Gewinne) | 165,9 (201/160/119) S 0,41 | 167,7 (199/162/130) S 0,35 | +1,7 |
| Gras Ring rechts r3 → r4 | 176,5 S 0,40 | 178,3 S 0,34 | +1,8 |
| Gras hinter dem Bett r3 → r4 | 183,5 S 0,38 | 186,0 S 0,30 | +2,4 |
| ferne Wiese links / rechts (nah) r3 → r4 | 32,3 / 11,7 | 32,4 / 11,9 | +0,2 / +0,3 |
| Ufer-Saum links / vorn r3 → r4 (k 0,003 → 0,079) | 240,6 / 221,8 | 241,9 / 228,5 | +1,3 / +6,6 |
| Gras ferne Ufer (~15 m) r3 → r4 | 187,8 | 203,2 | +15,5 |
| Baumlinie Lava r3 → r4 | 31,9 | 187,3 | **+155** (k-invarianter Anteil, s. 5.) |
| Gassen-Wand / Wand 2 / Hang / Himmel r3 → r4 (k 1,245 → 0,187) | 9,3 / 9,5 / 5,4 / 9,2 | 9,2 / 9,5 / 5,2 / 8,8 | 0,0 / 0,0 / −0,2 / −0,4 |
| Himmel Gasse r3 → main (k 1,574, ohne Gewinne) | 35,1 | 35,1 | 0,0 |
| Fenster (Glut-S-Form, κ 0,405 an r3 138,5 geeicht) → r4 | 166,5 | 153,4 | −13,1 |

Mit dem Clip auf 249 gekappt fällt Gras am Herd an r4 um −6,6 … −17,1 daneben: die ungekappte Umkehr gilt.

**Rück-Eichung über die Geometrie** (E = cd ÷ (d² + k²), Halm-Volumen quer 0,89/hoch 0,34; Herd: vier Glutbrunnen an 28 Feld-Punkte von r4 gefittet, fern ±6 %, nah 10–14 % unter dem Feld, Σ E am Auge nah 9,84 lx ↔ Log 10,587; Lava: Scheibe r 7,51 m aus πL = 14 500 lx, E am Auge 1 687 ↔ Log 2 270):

| Fleck | E geom (lx) | r3 gemessen | aus E geom | E nötig (lx) | nötig ÷ geom |
|---|---|---|---|---|---|
| Gras Ring links (nah) | 10,8 | 177,9 (244/167/95) | 125,5 (196/116/12) | 31,4 | 2,90 UNSICHER |
| Gras Ring rechts (nah) | 10,8 | 184,2 | 125,5 | 38,7 | 3,58 UNSICHER |
| Gras hinter dem Bett (nah) | 674 | 188,4 | 245,3 | 44,6 | 0,07 UNSICHER |
| ferne Wiese links (nah) | 0,6 | 56,6 | 24,0 | 2,6 | 4,04 UNSICHER |
| ferne Wiese rechts (nah) | 0,8 | 26,9 | 26,9 | 0,8 | 1,00 ±20 % |
| Kreis (fern) | 27,5 | 185,5 | 187,8 | 25,4 | 0,93 ±20 % |
| ferne Wiese (fern) | 0,2 | 14,1 | 18,3 | 0,1 | 0,60 UNSICHER |
| Vordergrund (fern) | 3,5 | 98,2 | 85,6 | 4,5 | 1,29 UNSICHER |
| Ufer-Saum links | 5 285 | 151,6 | 203,0 | 1 235 | 0,23 UNSICHER |
| Ufer-Saum vorn | 424 | 127,9 | 99,2 | 732 | 1,73 UNSICHER |
| Gras ferne Ufer (~15 m) | 268 | 85,7 | 79,6 | 312 | 1,16 ±20 % |

3 von 11 auf ±20 %. Die Tafel rechnet darum NICHT über E geom, sondern über den Stoff je Pixel aus r3 (oben an r4 geprüft) — alle Messer ändern nur k, das Licht am Ort `S(A)·E/A` bleibt.

## 2. Tafel Messer × Ort

Zustand (lx) / k:

| Messer | nah | fern | lava | gasse |
|---|---|---|---|---|
| (a) A + 0,25·Σ E am Auge | 2,88 / 0,199 | 1,63 / 0,315 | 568 / 0,0029 | 0,245 / 1,245 |
| (b) log-Mittel A + E_i (Feld) | 5,99 / 0,111 | 3,61 / 0,166 | 9,25 / 0,079 | 2,63 / 0,187 |
| (c) Schulter, k = min(k0, max(k_a, k_c)) | = (a) | = (a) | 110 / 0,0109 | = (a) |
| (c′) Schulter, k = min(k_a, k_c) | 136 / 0,0091 | 96 / 0,0120 | 568 / 0,0029 | 58 / 0,0157 |
| (d) A + π·L_v ÷ 0,18 | 61,4 / 0,0172 | 60,7 / 0,0174 | 1 083 / 0,0018 | 0,925 / 0,431 |
| (e) A + Σ E am Auge | 10,8 / 0,069 | 5,81 / 0,114 | 2 270 / 0,0010 | 0,432 / 0,792 |

(c): Karte ρ 0,18 unter E_max (Feld-Maximum ohne die Decke: nah 235, fern 179, Lava 199, Gasse 114 lx) mit dem hellsten Kanal am Schulter-Beginn. Herleitung: die Kurve komprimiert ab Spitze − Versatz = 0,76; der Versatz ist für Feuerlicht (kleinster Kanal ≈ 0) ≈ 0, also k · ρ/π · S(A)/A · E_max · max_c(Farbe ÷ Luma) = 0,76 → **k_c = 0,76·π·A ÷ (ρ·S(A)·E_max·2,52)** (2,52 = R ÷ Luma bei 2 000 K). k_c roh: nah 0,0091 · fern 0,0120 · Lava 0,0109 · Gasse 0,0157.
(d): L_v = 10·Σ E_i·cos θ_i ÷ θ_i² (θ in Grad, ≥ 1°), L_v nah 3,51 · fern 3,47 · Lava 62,0 (Scheibe in 0,25-m-Elementen) · Gasse 0,0425 cd/m² (zwei Docht-Laternen + sechs Fenster 0,6 m² in 14 m, Glutbrunnen hinter dem Haus verdeckt).
(e) eigener Kandidat: das Auge passt sich an das Licht an, das auf es fällt (Anteil 1, kein Stellwert).

Vorhersage je Fleck — Luma (rgb) Sättigung, ✓ Band gehalten / ✗:

| Fleck · Band | (a) | (b) | (c) | (c′) | (d) | (e) |
|---|---|---|---|---|---|---|
| Gras Ring links · 90–150, S ≤ 0,75, orange | 177,9 (244/167/95) 0,61 ✗ | 154,6 (228/143/49) 0,78 ✗ | ✗ = (a) | 50,3 1,00 ✗ | 69,5 0,99 ✗ | 132,1 (204/122/20) 0,90 ✗ |
| Gras Ring rechts | 184,2 0,58 ✗ | 162,7 0,76 ✗ | ✗ | 54,0 1,00 ✗ | 74,3 0,99 ✗ | 140,4 0,89 ✗ |
| Gras hinter dem Bett | 188,4 0,50 ✗ | 168,2 0,66 ✗ | ✗ | 60,7 0,98 ✗ | 83,4 0,97 ✗ | 148,9 0,79 ✗ |
| ferne Wiese links (nah) · ≥ 8 | 56,7 ✓ | 41,1 ✓ | 56,7 ✓ | 7,3 ✗ | 12,3 ✓ | 31,3 ✓ |
| ferne Wiese rechts (nah) · ≥ 8 | 27,0 ✓ | 18,3 ✓ | 27,0 ✓ | 2,3 ✗ | 4,1 ✗ | 13,0 ✓ |
| ferne Wiese (fern) · ≥ 8 | 14,1 ✓ | 8,4 ✓ | 14,1 ✓ | 0,7 ✗ | 1,0 ✗ | 6,0 ✗ |
| Ufer-Saum links · ≤ 200, nicht rosa-weiß | 150,7 (227/136/73) 0,68 ✓ | 239,0 (254/236/228) 0,10 ✗ | 197,7 (248/187/153) 0,38 ✗ | 150,7 ✓ | 129,5 0,81 ✓ | 103,5 0,93 ✓ |
| Ufer-Saum vorn | 127,1 (196/113/60) 0,69 ✓ | 223,8 (249/218/206) 0,18 ✗ | 172,8 (228/161/124) 0,45 ✗ | 127,1 ✓ | 108,2 0,79 ✓ | 86,6 0,89 ✓ |
| Gassen-Wand · 15–30 | 28,4 ✓ | 1,0 ✗ | 28,4 ✓ | 0,0 ✗ | 4,8 ✗ | 15,2 ✓ |
| Gassen-Wand 2 · 15–30 | 29,2 ✓ | 1,0 ✗ | 29,2 ✓ | 0,0 ✗ | 5,0 ✗ | 15,7 ✓ |
| Fenster · warm, ≤ 250 | 138,5 (182/131/84) ✓ | 141,3 (196/133/64) ✓ | ✓ | 111,0 (162/104/30) ✓ | 140,8 ✓ | 139,6 (186/132/80) ✓ |
| Mittag · k 0,5317 unverändert | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Bänder verfehlt** | **3** | **7** | **5** | **8** | **7** | **4** |

(Das Fenster ist messer-fest: k · Glut(Z) · Blende(Z) = k0 · Glut(Z). Mittag: Pool leer → Σ E, Feld, E_max, Blendquellen 0 → Blende 1; (c) über min(k0, …).)

**k-Fenster je Fleck — jede Belichtung, nicht nur die sechs Messer:**

| Sicht | Fleck | Band hält für k in |
|---|---|---|
| nah | Gras Ring links / rechts / hinter dem Bett | **LEER / LEER / LEER** |
| nah | ferne Wiese links / rechts | ≥ 0,0101 / ≥ 0,0377 |
| fern | ferne Wiese | ≥ 0,160 |
| lava | Saum links / vorn | ≤ 0,0062 / ≤ 0,0083 |
| gasse | Wand / Wand 2 | 0,794–1,297 / 0,771–1,260 |
| gasse | Fenster | ≥ 0,0030 |

Gras am Herd: Luma 90 bei S 0,98 (Ring links, k 0,029), Luma 150 bei S 0,81 (k 0,100); Ring rechts an Luma 150 S 0,84; hinter dem Bett an Luma 150 S 0,79.
Nur die Luma-Bänder (Sättigung weggelassen) verlangen den Zustand: nah 10,6–23,1 lx (Σ E am Auge 10,6 → Anteil α ≥ 0,98), fern ≤ 3,79 lx (Σ E 5,58 → α ≤ 0,64), Lava ≥ 223 lx (α ≥ 0,10), Gasse 0,242–0,431 lx (α 0,24–1,00).
Kontrast im Stoff: Gras Ring links ÷ ferne Wiese rechts 4,92 Stufen; die Kurve trägt für Gras im Feuerlicht von Luma 8 bis 150 7,13 Stufen.

## 3. Farbe

| T (K) | CIE 1931 x, y | Planck lin. sRGB (R = 1) | (Luma 1) | `lichtFarbe` heute (R = 1) |
|---|---|---|---|---|
| 1300 | 0,6057, 0,3832 | 1 / 0,0967 / **−0,0240** | 3,571 / 0,345 / −0,086 | 1 / 0,1758 / 0 (auf 1 667 K geklemmt) |
| 1600 | 0,5694, 0,4031 | 1 / 0,1696 / **−0,0177** | 3,006 / 0,510 / −0,053 | 1 / 0,1758 / 0 (geklemmt) |
| 2000 | 0,5242, 0,4157 | 1 / 0,2663 / 0,0077 | 2,478 / 0,660 / 0,019 | 1 / 0,2562 / 0,0079 |

(Planck → CIE 1931 über die Mehrlappen-Näherung von Wyman/Sloan/Shirley 2013, 1-nm-Schritte; `lichtFarbe` = Kim-Kubik, gilt erst ab 1 667 K und klemmt darunter.) Negatives Blau liegt außerhalb des sRGB-Gamuts: geklemmt wie im Code (1 300 K, Luma 1: 3,549/0,343/0) oder Weiß zugemischt bis min = 0 bei gleicher Luma (3,369/0,397/0); 1 600 K: 2,995/0,508/0 ↔ 2,905/0,535/0. Die Tafel unten rechnet geklemmt.

Durch die Kette (Stoff aus E nötig, Albedo der quellenlosen Wiese):

| Fleck | Lichtfarbe | k | Ergebnis |
|---|---|---|---|
| Gras Ring links | heute 2 000 K | 0,199 (a) | 177,9 (250/165/95) S 0,62 H 27° |
| Gras Ring links | Planck 2 000 K | 0,199 | 178,8 (250/166/94) S 0,62 H 28° |
| Gras Ring links | Planck 1 600 K | 0,199 | 171,0 (251/153/109) S 0,57 H 19° |
| Ufer-Saum vorn | heute (< 1 667 K → 1 667 K) | 0,0029 (a) | 126,6 (224/110/0) S 1,00 H 30° |
| Ufer-Saum vorn | Planck 1 300 K | 0,0029 | 116,5 (237/91/18) S 0,92 H 20° |
| Ufer-Saum vorn | heute | 0,0109 (c) | 179,7 (252/164/126) S 0,50 H 18° |
| Ufer-Saum vorn | Planck 1 300 K | 0,0109 | 176,4 (253/158/138) S 0,45 H 10° |

Das Rosa wird mit der echten Farbe NICHT Pfirsich/Gelb-Weiß: bei 2 000 K ist `lichtFarbe` schon Planck (B/R 0,0079 ↔ 0,0077, Gras 177,9 ↔ 178,8); unter 1 667 K trägt die echte Farbe weniger Grün (1 300 K: 0,097 statt 0,176), der Saum wird röter (H 18° → 10°), nicht gelber. Das Rosa ist Orange über der Schulter: R steht an 255, die Entsättigung der Kurve hebt G und B zum Weiß; unter Luma ~150 steht dasselbe Gras gesättigt orange (S 0,8–1,0).

## 4. Entscheidung

**Keiner.** Gras am Herd trägt bei Luma 150 die Sättigung 0,81 (Ring links) bzw. 0,84 (Ring rechts), bei Luma 90 0,98; unter 0,75 fällt sie erst über der Schulter (Runde 3: Luma 178, S 0,61). Das Band „Luma 90–150 UND S ≤ 0,75" ist damit für JEDES k leer, also für jeden Messer, der nur die Belichtung setzt — die Planck-Farbe ändert es nicht (S 0,62 ↔ 0,62). Auch ohne die Sättigung hält kein Messer aus dem Licht am Auge alle Luma-Bänder: nah verlangt Zustand ≥ 10,6 lx bei Σ E 10,6 lx (Anteil ≥ 0,98), fern ≤ 3,79 lx bei Σ E 5,58 lx (Anteil ≤ 0,64) — 0,6 Stufen Widerspruch; der Feld-Messer (b) verfehlt die Lava um 4,6 Stufen im Zustand (9,25 statt ≥ 223 lx) und die Gasse (2,63 statt ≤ 0,43 lx). Der Kontrast ist nicht der Grund: Ring ÷ ferne Wiese 4,9 Stufen, die Kurve trägt 7,1.

## 5. Unsicher, beim Namen

- **Flecke selbst gesetzt**, Runde-3-Werte weichen vom Auftrag ab: Kreis nah 188,4 (Auftrag 191,5), ferne Wiese fern 14,1 (12,7), Saum 151,6/127,9 (179,3), Wand 28,4 (35,1), Baumlinie 37,3 (38), Himmel Lava 0 (4,3). Mit der Wand des Auftrags (35,1) verschiebt sich das Wand-Fenster nach unten, dann fiele (a) dort.
- **fern**: k der Runde 3 nicht geloggt (0,315 aus Σ E 5,58 des Fits). Das Log 10,587 lx steht nach dem nahen Schuss (befehl-3 folgt `bild` nah) — es ist die nahe Kamera, nicht die ferne.
- **E geom** trifft 3 von 11 Flecken auf ±20 % (Halm-Volumen, Höhen, runde Scheibe statt der echten Decke) — die Tafel hängt nicht daran, (c) und die Farb-Tafel schon.
- **Lava-Hintergrund**: Baumlinie (+155 r3 → r4) und Gras 15 m (+15,5) tragen einen k-festen Anteil (Glut-artig, × Blende); ohne Band, aus dem Urteil genommen.
- **Sättigung**: r3 → r4 rechnet sie am Gras 0,06–0,08 zu NIEDRIG (0,35 ↔ 0,41) — die Wirklichkeit ist satter, das stützt das Urteil.
- **(b)**: Zustand aus dem Log; meine Geometrie gibt nah 6,97 statt 5,99, Lava 12,5 statt 9,25 (Bodenhöhen unbekannt). Fern 3,61 nur aus meiner Geometrie.
- **(c)** zwei Lesarten von „nach unten gedeckelt durch (a)", beide gerechnet; Karte ρ 0,18.
- **(d) Formel belegt**: Stiles-Holladay L_v = 10 · Σ E_i ÷ θ_i² (cd/m², lx am Auge senkrecht zur Blickrichtung, θ in Grad, ~1°–30°; CIE 146:2002 erweitert um Alter und Pigment). Unsicher sind meine Umrechnung L_v → Zustand (π·L_v ÷ 0,18) und die Fenster als Blendquellen (0,6 m² in 14 m).
- **Fenster-Modell** (κ an r3 geeicht) liegt an r4 −13 Luma daneben; das Fenster hält unter allen Messern.
- Bloom, Nachschärfe, TRAA nicht nachgebaut; Bänder „orange" = H 15–45°, „rosa-weiß" = S < 0,5 bei Luma > 150 sind meine Lesart.
