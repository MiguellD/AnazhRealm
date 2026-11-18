# WIDERLEGER (Rechnung) — spike.cjs unabhängig nachgerechnet

Stand: Arbeitsbaum `strahler-leuchte` 2ce8a033d. Ich habe nur gelesen und gerechnet: keine GPU, kein Browser, keine Änderung im Repo.
- Rechnung: `widerleger-rechnung.cjs`, Ausgabe `widerleger-rechnung.out.txt`.
- Eigene Teile:
  - V(λ) als CIE-1924-Tafel in 10 nm (nicht die Gauß-Näherung), Planck-Ort nach Krystek 1985 (nicht Wyman).
  - Tonkurve neu getippt aus vendor/three.webgpu.min.js `mT`.
  - Oklab-Halt und Auge nach entscheid.md §1, eigener Code.
- Übernommen, weil ohne Spiel nicht prüfbar: die GEOMETRIE der Sichten aus spike.cjs (Pixel-Anteile, Abstände, Halm-Modell).
- An der Quelle gelesen:
  - vendor `mT`: `setLayout` ist gesetzt, also wirkt das `return` im `If` (vendor: „Return statement used in an inline Fn()“ greift nur ohne Layout).
  - dirigent-ankunft.js:167-168 mit welt-licht.js:174 `kurve: "NeutralToneMapping"`.
  - fachwerk-core.js:6435-6545 (BRENNER, LICHT_GESETZ.feuer kernM 0,76, STRAHLER ε 0,0012, `leuchtdichte`, `strahler`).
  - dirigent-kern.js:1756-1781 und :1895-1903 (`_strahler`, `fest: true` → Fläche = Bett).
  - welt-licht.js:39 (ATMO_BODEN) und :85-90 (AUGE p/q/anteil/welt/lux).
  - stoff-material.js:2455-2463 und :3898 (Halm-Leser, 0,89/0,34).
  - bild-kosten.js:3000-3018 (NACHT_AUGE, S0-Anker).
  - scripts/diag-pruefbuehne.cjs:946-962 (S0_TON satMax 0,75 mit seiner Begründung).
  - die Fit-Skripte `../spike-auge-fit-herd.cjs` und `../spike-auge-fit-lava.cjs`, dazu `vor-spike-auge.md` §1.

**Die Zahlen des Spikes stimmen rechnerisch.** Meine unabhängige Kette trifft sie auf 0–3 %: k herd-nah 0,0445 (Spike 0,0453), herd-fern 1,048 (1,07), Kipp −2,21 EV (−2,16), Wiese 4,8, Knoten −0,59. Der Rest kommt aus Krystek gegen Wyman. **Gekippt sind Deutungen**, und zwar an sechs Stellen; unten jeweils mit Zahl.

---

## 1. Urteil je Eigenschaft (SOLL.md)

| | Spike sagt | Urteil | Zahl (meine Rechnung) |
|---|---|---|---|
| **(a) Ordnung** | monoton außer Vollmond (Purkinje) und Lava in der Code-Luma | **HÄLT** | Lava: Code 148/40/0 hat Luma 60,1 bei Y 0,0781, Code 109/57/0 Luma 63,9 bei Y 0,0618; die Code-Luma kehrt um, Y nicht. Vollmond: photopisch Himmel 0,00707 < Wiese 0,00797 cd/m², skotopisch 0,00781 > 0,00510, im Bild Y 0,00187 > 0,00152. Der Bruch des Einzelfalls hängt an der **unsicheren** Himmels-Leuchtdichte 6,8·10⁻³: er besteht nur, wenn sie ≳ 0,65 × diesem Wert ist. Die Form ist robust: bei mesopischer Mischung ist (a) in photopischen cd/m² nicht haltbar, also muss (a) die Leuchtdichte benennen. |
| **(b) Schulter** | R1 +4,55 EV (herd-fern), R2 +2,16 EV (herd-nah) | **R1 HÄLT · R2 WIDERLEGT als (b)-Bruch** | Siehe §2. R1 bleibt auch bei der Spanne „8-Bit-Weiß“ (+4,15 EV) mit +0,41 EV bestehen. R2: das Glutbett ist eine QUELLE. Die (b)-Zeile des Spikes zählt also einen Fehlgriff der Diffus-Probe als Bruch des Gesetzes. |
| **(c) Farbton** | Entscheid-Kurve ≤ 1,3° überall; Neutral bricht an Schulter und Fuß | **gegen die mesopische Erwartung HÄLT · gegen SOLL wörtlich WIDERLEGT** | Gegen die Erwartung höchstens 2,4° (Gras 25 m fern, tol 16,3°; Spike 1,3°), immer unter Δh_tol. **SOLL (c) verlangt aber den PHYSIKALISCHEN Farbton (Lichtfarbe × Albedo).** Dagegen bricht die Entscheid-Kette: herd-fern Gras 2,5 / 4 / 8 / 14 m 2,9 / 4,4 / 6,2 / 7,6° > tol 1,4 / 1,5 / 3,2 / 6,6°; Gasse Wand unter der Laterne 7,9° > 2,7°, Fenster 10,0° > 3,1°. Täter ist das Nacht-Auge: die Grau-Mischung der Stäbchen dreht den Oklab-Farbton. Die Kurve ist es nicht. Die Spalte (c) des Spikes misst gegen die schon gemischte Erwartung. Neutral bricht an Schulter (15,3° bei tol 6,5°) und Fuß (Wand 7,6° > 2,7°; Fenster 8,5° > 3,1°): **HÄLT**. |
| **(d) Zustand je Sicht** | herd ×23,6; Lava ×1,00 (nicht als Bruch gezählt) | **HÄLT, aber nur unter p98** | Gerechnet ×23,5. Mit der Kappe am Maximum (p100) gilt herd nah = fern = 0,0096, weil das Glutbett in beiden Sichten bindet. Nach SOLL („dürfen“) ist das kein Bruch, denn der Zustand bleibt eine Funktion der Sicht. Das ×23,6 ist also eine Folge der gewählten p98, kein Beweis von (d). |

## 2. Urteil je tragender Behauptung

| # | Behauptung (spike.md) | Urteil | Begründung mit Zahl |
|---|---|---|---|
| 1 | Kurve = vendor `mT` wörtlich | **HÄLT** | Grau 0,18 / 0,22 / 0,5 → 105 / 118 / 181. Der hellste Kanal erreicht Code 255 bei x 13,45 (+4,15 EV). Elastizität: 1,000 bei 0,76, 0,522 bei 0,866, 0,098 bei 1,5. |
| 2 | „Die Kurve trägt von 0,76 bis Code 1 nur 6,77 Stufen“ (R1-Argument „9 Stufen“) | **WIDERLEGT als allgemeine Aussage** | Für Grau gilt sie (7,27 EV mit der Rundungsschwelle 0,5). Für satte Feuerfarben gilt sie nicht: der Fuß zieht nur den kleinsten Kanal ab, also gibt es **12,3 EV** bis Code 1. Das Argument trägt nur für den mondgrauen Teil der fernen Wiese. R1 selbst steht trotzdem, und zwar auf den direkt gerechneten Luma-Werten. |
| 3 | `leuchtdichte` (Gauß) 2–5 % unter CIE | **HÄLT** | Belegter Anker: Platin-Erstarrungspunkt 2 042 K = 60 cd/cm² = 6,0·10⁵ cd/m². Meine Tafel gibt 5,99·10⁵, fachwerk 5,90·10⁵ (−1,7 %). Gauß/Tafel: 0,954 bei 1 100 K, 0,977 bei 1 650 K, 0,984 bei 2 000 K. Herd I = 249 cd (Tafel 253). Glutbett 19,8 cd/m² (Tafel 20,8). |
| 4 | Lava „Fit an r4 4 620 cd/m² trifft auf 4 %“ (§2) | **WIDERLEGT als Beleg** | 4 615 = 14 500/π. Die 14 500 lx sind der Wert, den der Feld-Messer von r4 auf der Decke ablas (`spike-auge.cjs`:123, `spike-auge-fit-lava.cjs` setzt r = √(I/14 500)). Das ist die Leuchtdichte, die das r4-GESETZ einsetzte, keine Messung von Licht. Getroffen wird sie mit dem **gewählten** Riss-Anteil 0,14. §5 des Spikes räumt das halb ein. |
| 5 | Gegenprobe „9 von 14 halten ±25 %“ | **WIDERLEGT als Zählung** | Die 14 Zeilen enthalten Doppel und Abgeleitetes: R1-Herd-k zweimal gegen dieselbe Messung 0,984 (nah und fern); R3-Lava-k zweimal mit nachträglich gewählter Richtung; drei Verhältnisse, die aus den Flecken folgen. Unabhängig sind 10 gemessene Größen, davon halten **7**: k 4/4, Lava-R3 nur innerhalb der Rundung von „0,003“; **Flecke 3/6**. Die ±25 % selbst sind gewählt. |
| 6 | „Das Auge trifft“, Rückrechnung 1–3 % | **HÄLT, aber nur als Abschrift-Prüfung** | Die Konstanten stimmen mit welt-licht.js:85-90 überein. Beide Runden verlangen dasselbe Σ E, das ist eine echte Konsistenz. Geprüft ist damit aber das Auge der RUNDEN. Kein Teil des neuen Auges (Diffus-Probe, Kappe, Schlüssel, Nacht-Auge in cd/m²) ist gegen ein Bild geeicht. Die Quell-Orte sind an 28 Feld-Punkte derselben Welt (r4) gefittet. |
| 7 | Rettung der roten Flecke: „gegen die Vor-Spike-Ausschnitte −3 bis −9 %“ | **WIDERLEGT** | (i) „Kreis 185,5“ ist der Ausschnitt der FERNEN Kamera (Vor-Spike: E 27,5 lx, k 0,315). Verglichen wird er mit dem Ring-Mittel bei k der NAHEN Kamera (0,211). (ii) „Gras hinter dem Bett 188,4“ führt der Vor-Spike selbst als UNSICHER (E geom 674 lx → 245,3; nötig ÷ geom 0,07). Der Spike setzt sein Ring-Mittel dagegen. (iii) Gewählt ist „ferne Wiese rechts“ (26,9 ↔ 24,4); „links“ (56,6 gegen 24,0 aus der Geometrie) fehlt. Die geometrische Rück-Eichung des Vor-Spikes hält **3 von 11** auf ±20 %. Die Photometrie der Flecke bleibt also **ROT**. |
| 8 | „Absolute Luma ungeprüft; das Urteil steht nur auf Formbefunden“ | **WIDERLEGT als Selbstbindung** | R1 und R2 sind Formbefunde: die Schwellen sind Pixel-Anteile, die Kipp-Grenze von R2 ist rein die 2 % von p98, weil das Glutbett heller ist als jedes Gras. **R3 ist ein absoluter Luma-Befund** (Wiese 4,8 gegen 31,7). Der Spike urteilt also auf genau der Ebene, die er selbst für ungeprüft erklärt. |
| 9 | R1: p98 übersieht den Feuerkreis (1,57 %) | **HÄLT, robuster als gerechnet** | Nachgerechnet 1,57 %; p98 sieht den Kreis erst beim **2,50-fachen** Anteil. Bei 25 m und vFOV 60° (gewählt) trägt der Kreis r ≤ 2,5 m nur 0,145 % des Bilds (Kamera 1,7 m) bzw. 0,33 % (4 m). Der Spike setzt 0,83 % an. **Aber:** die Größe ist p98, und die ist gewählt. Mit p100 hält herd-fern (a), (b) und (c-meso) mit 0 Brüchen; Gras 0,75 m steht dann bei Luma 72,7, 14 m bei 0,2. |
| 10 | R2: Glutbett besteht die Diffus-Probe, ab 1,4 % fällt k um −2,16 EV | **Kipp HÄLT und ist realistisch · „(b) reißt um +2,16 EV“ WIDERLEGT** | Schranke 184 cd/m² > 19,8. Auch mit Holzkohle-ρ 0,1 statt ρ_max bleibt das Bett „diffus“ (Schranke 22,4); erst ρ 0,05 trennt es. Kipp bei **1,40 %** → k −2,21 EV, Gras 0,75 m von 149 auf 72,7. Bild-Anteil des Betts (Ego 1,7 m, vFOV 60°, gewählt): 4,5 / 2,9 / 1,9 / 1,3 % in 1,5 / 2 / 2,5 / 3 m. **Ab ≲ 2,8 m kippt es also im Normalfall.** Nach §7 des Entscheids (\|Δ\| > 0,5 EV) ist das ROT. |
| 11 | R3: Knoten −2,17 legt die Mondwiese auf 4,8; für ≥ 22 bräuchte es −0,59 EV | **Zahlen HÄLT · als Riss des Gesetzes WIDERLEGT** | Wiese k·L 0,0165 → 4,8 (mit Stäbchen-Stärke 1,22: 5,8). Für 22 braucht es den Knoten −0,59 (mit 1,22: −0,82); für 31,7 braucht es −0,12. Keine Eigenschaft (a)–(d) bricht. Es stoßen zwei **gewählte** Zahlen zusammen: der Knoten −2,17 („gewählt, kein Tor“) und S0 ≥ 22, laut bild-kosten.js:3005-3006 „dieselbe Luma wie main (24,1 ± 0,3)“. Mit 31,7 und ≥ 22 tritt hier eine gewählte Zahl als Tor auf, und genau das verbietet SOLL. |
| 12 | Mittag 117,4 ist tautologisch | **HÄLT** | c(L_K = 6 710) = 0,0000 EV, k·L_Karte = 0,2200, also 118 per Konstruktion. κ = 1,822 hängt an der gewählten Mittags-Komposition (QUELLE rechnete 1,743). |
| 13 | Tor 0,75 fällt | **HÄLT** | Feuer-Gras 0,75–2,5 m: S 1,00 / 0,99 / 0,98 / 0,97 bei m 1,00 / 0,94 / 0,85 / 0,75. Der Fuß zieht das Stäbchen-Grau mit dem kleinsten Kanal wieder ab. Damit trägt die Prämisse des Tors (diag-pruefbuehne.cjs:948 „Sättigung ist eine WAND: das Auge der Nacht sieht mesopisch“) im Ring 1–3 m nicht. |
| 13b | Entscheid §5: „S ≤ 0,75 gibt es nur in der Schulter oder durch mitleuchtende Umgebung“ | **WIDERLEGT** | herd-fern Gras 4 m: S 0,76 (Spike 0,75) bei m 0,61 und 0 EV über der Schulter. Das mesopische Auge selbst entsättigt, sobald x > 0,08 (fester Versatz 0,04). |
| 14 | Ohne Kappe: Rosa der Runde 3 (254/204/166, S 0,35) | **HÄLT** | 254/203/167, S 0,34, Δh 11,2°. |
| 15 | Hauptantwort „EIN Gesetz hält nicht alle Eigenschaften an allen Orten zugleich (R1–R3)“ | **Ergebnis HÄLT, Begründung WIDERLEGT** | R1 ist ein Bruch der gewählten p98, kein Bruch „des Gesetzes“: p100 heilt ihn. R2 ist als (b)-Bruch ein Artefakt; real ist es der Kipp nach §7. R3 bricht keine Eigenschaft. Was unter JEDER Perzentil-Wahl bleibt: (a) in photopischen cd/m² bei mesopischer Mischung, (c) gegen den physikalischen Farbton am Nacht-Auge, und der §7-Kipp des Glutbetts. Der echte Zielkonflikt liegt zwischen (b) und der Lesbarkeit der fernen Sicht. Lesbarkeit ist in SOLL keine Eigenschaft. |

## 3. Gewählte Zahlen, die als Tor auftreten (eigene Rechnung)

| Zahl | Wo | Marke | Tritt als Tor auf? |
|---|---|---|---|
| ±25 % | Gegenprobe des Spikes („Modell trägt“) | gewählt | **ja**: die Zählung 9/14 entscheidet, welche Befunde gelten |
| S0 ≥ 22 / main 31,7 | R3 | gewählt (= main 24,1 ± 0,3) | **ja**: R3 ist allein gegen diese Zahlen ein „Riss“ |
| p98 · 2 % | Entscheid §1.3; R1, R2 | gewählt | **ja, indirekt**: R1 entsteht durch p98, p100 heilt ihn; die Kipp-Grenze 1,40 % ist reine 2 %-Arithmetik |
| \|Δ\| > 0,5 EV | Entscheid §7 (Spike-Rot) | gewählt | ja, als ROT-Schwelle des GPU-Paars. Der R2-Kipp liegt mit 2,21 EV weit darüber, die Schwelle entscheidet dort also nichts. |
| Stäbchen-Farbort | Entscheid Zielbild A, (c) an wiese/gasse | **unsicher** (Spike rechnet Grau, gewählt) | **ja**: die (c)-Erwartung der Nacht steht auf ihr. Mit Jensen (0,25/0,25) liegt die Mondwiese 161° vom physikalischen Ton entfernt. |
| κ (Mittags-Komposition) | Fall MITTAG-KARTE | folgt aus gewählter Sicht | ja, und tautologisch (siehe 12) |
| Spanne 0 von (b) | Entscheid Zielbild A | **hergeleitet HÄLT**: die Kurve ist bis 0,76 die Identität (Elastizität 1,000). Jede Spanne > 0 braucht eine gewählte Elastizität (½ → 0,188 EV). | — |
| Δh_tol (±1 Code) | (c) | hergeleitet, HÄLT | — |
| Filter Luma ≥ 8, C > 0,02 | Spike (c) | gewählt | nein, denn tol wächst im Dunkel ohnehin über 16° |

## 4. Nicht gelesen, nicht gerechnet

- Die Kette der Runde 3 an der FERNEN Kamera (`zeig3`, altes Nacht-Auge) habe ich nicht selbst nachgebaut. Den Kamera-Fehler in 7(i) belege ich aus den Zahlen des Vor-Spikes, nicht aus eigener Vorwärtsrechnung.
- Die Geometrie aller Sichten (Anteile, Abstände, Halm-Modell, Mond-Anteile an Wand und Halm) habe ich ungeprüft übernommen. Meine Bild-Anteile (Kreis, Bett) stehen auf einer gewählten Kamera: vFOV 60°, 16:9, 1,7 m bzw. 4 m hoch.
- Mond 0,3965 lx gegen die Literatur (0,1–0,3 lx) habe ich nicht an einer Quelle geprüft.
- Die Farbe habe ich nach Krystek gerechnet, der Spike nach Wyman; daher 1–3 % Unterschied in k und Luma. Die CIE-1931-Tafel für x̄/z̄ hatte ich nicht.
- Die Gassen-Sicht der Tabelle §1 nach SOLL-(c) habe ich mit eigener Geometrie-Abschrift gerechnet, die Lava-Sichten nicht erneut.
- Bloom, TRAA, `graded`, die Luft der Post-Kette: nicht gerechnet. Keine Zahl am Gerät.
