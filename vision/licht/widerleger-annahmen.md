# WIDERLEGER (annahmen) — die Eingänge des Spikes und die Stellwerte des Gesetzes

Stand: Arbeitsbaum `strahler-leuchte` 2ce8a033d. Ich habe nur gelesen und gerechnet: keine GPU, kein Browser, keine Änderung im Repo.
Die Zeilen unten sind auf 2ce8 gelesen; die Spike-Zitate liegen dort teils um 3–10 Zeilen verschoben.
- Meine Rechnungen:
  - `widerleger-annahmen.cjs` → `widerleger-annahmen.out.txt`: Glutbett-Schwelle, Lava nach dem Spiel-Gesetz, Planck-Farbton, (a) im Monte Carlo, Toleranz der Gegenprobe, Mond, Nacht-Knoten, Bild-Anteile.
  - `wa-fuss.cjs` → `wa-fuss.out.txt`: wo (a) bricht, mit Beispielen.
  - `wa-sonne.cjs` → `wa-sonne.out.txt`: Zahlbereich der Sonnenscheibe.
- Gelesen habe ich:
  - fachwerk-core.js: :6412-6545 und :6443 (BRENNER), :6456-6483 (LICHT_GESETZ, Wandlaterne), :6512-6529 (STRAHLER, `cdM2`), :6532-6539 (`leuchtdichte`), :7591 und :9310.
  - welt-licht.js: :36-39, :83, :794-817 (Sonnen- und Mondbahn).
  - stamm/stoff-material.js: :2450-2465 (Volumen-Leser), :3896-3899 (HALM_VOLUMEN, LICHT_POOL).
  - stamm/bild-kosten.js: :2998-3017 (NACHT_AUGE, Anker S0).
  - stamm/siedlung-wege.js: :528-605 (`_lavaSpanne`, `_lavaLeucht`) und :3044-3048 (LAVA_KRUSTE).
  - gelaende-core.js: :1817-1822 (LAVA). schmiede-core.js: :2892 (Stein, tSchmelz 1 500).
  - stamm/dirigent-kern.js: :1935-1955.
  - spec/farbe/tag-ref.json und spec/farbe/albedo-tafel.json, ganz.
  - die Fits `../quellen-herd.json` und `../quellen-lava.json`.

**Urteil in einem Satz.** Die Kurve bricht (a). Nur die Messart (b) und den Farbton (c) photopisch hält das Gesetz, und beide durch
Konstruktion. (d) hält. Von den Rissen des Spikes überleben R1 als Befund über p98 und die Hintertür hinter R3. R2, die Zahl in R3,
R4-Vollmond und R4-Lava kippen innerhalb des ehrlichen Fehlers ihrer Eingänge oder fallen an der Quelle.

---

## 1. Die Eigenschaften aus SOLL.md

| | Urteil | Grund (Zahl) |
|---|---|---|
| **(a) Ordnung** | **WIDERLEGT** | Die Kurve des Entscheids bricht (a) selbst, weil sie die Helligkeit aus Neutral nimmt. Neutral staucht nach dem **hellsten** Kanal und zieht im Fuß nach dem **dunkelsten** ab; beides ist nicht monoton in der Leuchtdichte über verschiedene Farborte. Monte Carlo über Planck(1 100 … 5 772 K) × 7 Albedos × k·L 2⁻⁶ … 2⁴, 39 607 Paare: **1 063 Paare (2,7 %) kehren sich um, 776 davon um mehr als 0,1 EV, höchstens um 2,74 EV**. Vendor-Neutral zum Vergleich: 1 057. Nach Zonen: im Fuß 486 von 18 493 Paaren, in der Schulter 290 von 21 030, dazwischen 0 von 84. Zwei Beispiele: Schulter: 1 100 K × Fels bei Y 0,463 gibt 0,327 und liegt damit **unter** 1 850 K × Gras bei Y 0,436, das 0,398 gibt. Fuß: Grau 5 772 K × Haus bei Y 0,0073 gibt 0,0039 und liegt damit **unter** 1 100 K × Fels bei Y 0,0062, das 0,0062 gibt. Das ist genau die Gasse: die graue Mondwand gegen die orange Laternen-Wand. Das „✓“ des Spikes stand auf ein paar Flecken je Sicht, nicht auf der Kurve. |
| **(b) Schulter** | **HÄLT als Messart, WIDERLEGT als Bau** | Die Spanne 0 ist hergeleitet: Bei 0,76 verlässt Neutral die Identität (vendor `mT`), das ist kein gewählter Wert. Die Kappe hält (b) aber nur für **98 %** der diffusen Pixel. SOLL verlangt „kein diffuser Fleck“, also das Maximum. p98 ist ein Stellwert (siehe §4). |
| **(c) Farbton** | **HÄLT photopisch, durch Konstruktion** · **offen mesopisch** | Die Kurve trägt den Oklab-Farbton der Eingangsfarbe weiter. ≤ 1,3° ist darum ein Befund über die Bisektion, nicht über das Licht. Zwei Einschränkungen: (1) Der Bezug ist `planckFarbe` mit zugemischtem Weiß, und das dreht den wahren Planck-Ton schon **vor** der Kurve: 1 100 K um 2,1°, 1 326 K (die Kruste im Spiel) um 2,0°, 1 650 K um 1,1°. Δh_tol liegt satt-orange bei 1,0–2,5°. Gegen den wahren Planck-Ort ist (c) an Glut und Kruste also grenzwertig. Das Spiel heute (`lichtFarbe`, geklemmt) liegt bei 1 100 K 9,5° daneben. (2) Nachts entscheidet der Stäbchen-Farbort (**unsicher**): Grau gibt 0°, Jensen gibt 161°. (c) sagt nachts nichts, solange dieser Ort kein Datum ist. |
| **(d) Zustand je Sicht** | **HÄLT** | k ist eine Funktion des Sichtinhalts, also log-Mittel und Kappe. Den Einwand des Spikes in R1 („mit der Kappe am Maximum stehen nah und fern im selben Zustand, (d) bringt nichts“) **widerlege ich**: SOLL (d) sagt „**dürfen** verschiedene Zustände haben“. Gleiches k an nah und fern, weil beide denselben hellsten Fleck tragen, bricht (d) nicht. Was dann bricht, ist das gefallene Band „ferne Wiese ≥ 8“. |

---

## 2. Die Eingänge des Spikes an der Quelle

„Kippt?“ meint ein Urteil des Spikes (R1–R4, (a)–(d)), wenn die Zahl um ihren ehrlichen Fehler wandert.

| Eingang (Spike) | Quelle gelesen | Befund | Marke | ehrlicher Fehler | kippt? |
|---|---|---|---|---|---|
| Herd T 2 000 K | FC:6456 `feuer.kelvin 2000`; Kommentar :6419 „1 800–2 000 K“ | stimmt | U | 1 800–2 000 K | nein: Unter der Kappe ist das Bild am Herd skalen-invariant, und (c) hält durch Konstruktion. |
| ε_Flamme 0,0012 → I 249 cd | FC:6527; :6514-6518: „so, dass ein Lagerfeuer Ø 0,76 m **um 250 cd** trägt … rundum 130–250 cd“ | ε ist **gewählt**, damit I an den **oberen Rand** einer Überschlagsrechnung fällt (Kerze 0,16 lm/W × 10–20 kW). Der Entscheid schreibt „I belegt (Größenordnung)“; das ist zu stark. | G | 130–500 cd (×0,5 … ×2) | nur über die Schwelle von R2 (unten) |
| Flamme 10 000 cd/m² (B) | FC:6528-6529: `LICHT_GESETZ.feuer.cdM2 = 10000`, „die Leuchtdichte des Herdfeuers (cd/m², **das Mittel über sein Bett**)“ | **Zwilling an der Quelle**: Dasselbe Bett trägt aus ε·L(2 000 K) **548 cd/m²** und aus `cdM2` **10 000**, also ×18. Spike und Entscheid deuten die 10 000 still als „sichtbare Flamme“ und leiten A = I/L = 0,025 m² ab. Das ist eine Flamme von Ø 18 cm über einem Bett von 0,76 m, physikalisch zu klein. Bei Flammenfläche 0,15 m² wären es 1 660 cd/m². | B für die Kerze, **G** für das Herdfeuer | 1 600–10 000 cd/m² | nein: Die Flamme bleibt Strahler, solange L > ρ_max/π·I/k² = 451 cd/m². |
| Kern 0,38 m | FC:6544 `kernM = √(A/π)`; quellen-herd.json k 0,38 | stimmt mit dem Spiel überein. **Aber** FC:6456 trägt `feuer.kernM: 0.76`, und das ist der Durchmesser unter dem Namen Kern: ein zweites Datum mit demselben Namen. | B (Spiel) | 0,38 ↔ 0,76 | Schwelle von R2: T* sinkt um ≈ 50 K. Am Gras in 0,75 m ändert sich E um ×1,59 (0,67 EV); unter der Kappe ist das unsichtbar. |
| Glutbett 1 100 K, ε 0,9 | nur entscheid.md §2 („Holzkohle 900–1 200 K“); im Baum kein Datum | U | U | 900–1 300 K → L 0,2 … 565 cd/m² | **JA, R2 kippt.** Das Bett gilt erst über T* als Strahler. T* hängt an I, Kern und ρ_max und liegt zwischen **1 097 und 1 271 K**, bei den Spike-Werten (249 cd, 0,38 m, 0,82) bei **1 226 K**. Bei 1 200 K und I 130 cd (T* 1 186 K) ist das Bett Strahler, und R2 entfällt. Bei 1 100 K und Spike-Werten bleibt R2. |
| Glutbett-Anteil (Kipp bei 1,4 %) | gewählt (spike.cjs:195-196) | Eigene Geometrie (Bildfeld 1,88 sr, U): aus 3 m mit Auge 1,6 m **0,98 %**, aus 2 m **2,30 %**, aus der NAH-Pose der Runden (5,1 m, 0,62 m) **0,11 %**. Flammen und Scheite decken einen Teil ab. | G | ×0,1 … ×2 | **JA**, R2 liegt auf der Schwelle. Mit p98 tritt R2 aus 3 m nicht ein. Mit der Kappe am Maximum (wie SOLL (b) verlangt) tritt R2 **immer** ein, sobald T < T*, und k fällt um −2,16 EV. |
| Lava Riss 1 650 K (B?) | schmiede-core.js:2892 Stein tSchmelz **1 500** + gelaende-core.js:1818 `ueberhitzung: 150` | Der Schmelzpunkt ist belegt (Basalt 1 370–1 520 K). Die **Überhitzung um 150 K ist gewählt**: Lava bricht am oder unter dem Liquidus aus. | tSchmelz B, ü **G** | t0 1 470–1 650 K → Mittel ÷ 6,0 | nein: Unter der Kappe ist lava-nah skalen-invariant, das Ufer setzt k. Es ändert sich nur das Verhältnis zu anderen Quellen in derselben Sicht. |
| Kruste 1 100 K, Riss-Anteil 0,14 (G) | siedlung-wege.js:586-605 `_lavaLeucht` und :3044-3048 LAVA_KRUSTE (σ 0,25, offen 0,17, **platte 0,62**) | **Falsch gegen das Spiel.** Die Scholle trägt 798 + 0,62·852 = **1 326 K → 861 cd/m²**, nicht 19,8 (**×43**). Das Mittel des Spiel-Gesetzes bei frischer Lava ist **6 261 cd/m²**, nicht 4 440. „Der Fit an r4 trifft auf 4 %“ ist ein Fit: Der Riss-Anteil 0,14 ist so gewählt, dass das Mittel passt. Ein Beleg ist das nicht. | **G, widerlegt** | — | **JA, R4-Lava fällt.** Unter der Kappe gilt k ≈ 2,8·10⁻³, die Kruste steht bei **k·L 2,41** (+1,66 EV über der Schulter) statt bei 0,078. Sie leuchtet weiß-orange, nicht 148/40/0. Der Bruch „Kruste 60,1 < Ufer 2 m 63,9“ entsteht nur aus der falschen Kruste. |
| Lava-Scheibe r 7,51 m | quellen-lava.json (Fit) | folgt aus dem Fit | F | — | nein |
| Docht 1 cd, Flamme 0,04 m | FC:6443 | stimmt | B | — | nein |
| Docht 1 850 K | im Baum kein `kelvin` an BRENNER; `laterne.kelvin` 1 900 (FC:6458) | Kerze 1 850–1 930 K | B (Literatur) | ±50 K | nein |
| Wandlaterne 2,8 / 0,4 m | FC:6483 `(LICHT_GESETZ.laterne, 2.8, 0.4)` | stimmt | G (Bau) | — | nein: Die Gasse steht auf der offenen Blende, k wird vom Knoten gesetzt. |
| Abstand 10 m | FC:9310 `LICHT_MARKE_M = 10` | Das ist die **größte Lücke**, bevor eine Wandlaterne gesetzt wird, nicht der Abstand. Der wahre Abstand ist ≤ 10 m. | G | 5–10 m | nein (offene Blende) |
| Kopf-Glas 0,104 m² | FC:6423-6424, :7591 (0,26 × 0,40) | stimmt | B (Bau) | — | nein |
| Mond E⊥ 0,3965 lx | tag-ref.json Zeile [−90, 0,397] | stimmt mit dem Baum. Literatur aus dem Gedächtnis: V = −12,7 gibt ≈ 0,32 lx über der Luft und ≈ 0,26 lx im Zenit. | B (Baum), Wert U | 0,25–0,40 lx | **nein, und zwar exakt**: Unter der offenen Blende gilt k ∝ 1/E⊥ und L_Wiese ∝ E⊥. k·L der Wiese = **0,0165** bei 0,25, 0,30 und 0,3965 lx. |
| Mond 74,2° um Mitternacht | welt-licht.js:806-817: `mondRichtung = −sonnenRichtung` | stimmt mit dem Spiel überein. In der Wirklichkeit steht der Vollmond gegenüber einer Mittags-Sonne von 74° tief (≈ 28° bei φ ≈ 39°). Das gehört zur Welt-Dynamik, nicht zur Licht-Kette. | G (Welt) | — | nein (nur dunkler) |
| mondheller Himmel 6,8·10⁻³ cd/m² | keine Quelle im Baum („≈ 18 mag/″²“) | Die Umrechnung 18 mag/″² → 6,8·10⁻³ prüft nach. Der Wert hängt am Mondabstand. | U | ±1 mag = ×2,5 | **JA, R4-Vollmond kippt.** Himmel 6,1 gegen Wiese 5,0 ist ein Abstand von 0,3 EV. Der Fehler des Himmels (×2,5) und der Halm-Faktor (×2) überdecken ihn. |
| Mittag E_h 117 168, Himmel 17 000 | tag-ref.json (interpoliert); Himmel ohne Quelle | Die Mittags-Eichung ist tautologisch, das gibt der Spike selbst an. | B / U | Himmel 12–40 % | nein |
| Gras-Albedo ATMO_BODEN (B) | welt-licht.js:36-39 | **Kein Gras.** Es ist das Mittel aus Laub und Waldboden, und albedo-tafel.json hat keine Gras-Zeile. Der Spike setzt es als „Gras-Albedo, belegt“ an. Die heutige Tafel gibt als Mittel 0,1030/0,1410/0,0459, also 2–3 % neben der eingefrorenen Konstante. | **G (Stellvertreter)** | Y 0,12 … 0,20 → +0,69 EV | **JA, über die Zahl in R3** (unten) |
| Laub, Haus, Fels, ρ_max 0,8196 | albedo-tafel.json: laub, haus, fels, tor (rgb wörtlich) | stimmt. ρ_max ist der R-Kanal von **tor** (Y 0,649), der hellste der 13 Zeilen. Schnee und weißer Putz fehlen in der Tafel. | B | ρ_max 0,39 (klinge) … 0,9 (Schnee) | Schwelle von R2: T* verschiebt sich um 40–50 K. |
| Halm 0,89 / 0,34 (G) | SM:3896-3898: „gemessen an der Geometrie der Nah-Wiese (Studio-Gras, 20 432 Dreiecke: 0,892 · 0,338)“; Formel SM:2450-2465 = spike.cjs:137 | gemessen, also **B** und nicht G. Der Anteil 0,3 für das waagrechte Mondlicht am Halm ist aber eigene Wahl des Spikes (spike.cjs:237). | B (Werte), G (Mond-Gebrauch) | Faktor 0,51 … 1 | **JA, über die Zahl in R3** |
| MESOPISCH 0,005/5, skotopisch | welt-licht.js:83; bild-kosten.js:3014-3015 | stimmt | B | — | nein |
| Knoten 634,8 / 6 713 / −2,17 / 0,25 | tag-ref.json Spalte `stufen` | 634,8 = 0,18·11 080/π (Sonne 10°) und 6 713 = 0,18·117 168/π folgen aus Lux-Zeilen. **Steigung und −2,17 sind die Spalte `stufen`**, und die nennt tag-ref.json selbst „die Kamera AnazhRealm.BELICHTUNG“. Das ist der alte Fahrplan des Spiels, kein Messwert. | **G** | — | setzt das Nachtbild (siehe §4) |

**Pixel-Anteile (R1).** Der Feuerkreis r ≤ 2,5 m aus 25 m Entfernung deckt mit Auge 1,6 m **0,11 %** des Bilds, mit Auge 5 m (die FERN-Pose)
**0,32 %**. Der Spike rechnet 1,57 % der diffusen Pixel. R1 steht also **fester**, als der Spike sagt: Kein ehrlicher Bild-Anteil
hebt den Kreis über 2 %.

---

## 3. Die tragenden Behauptungen

| Behauptung | Wer | Urteil | Zahl |
|---|---|---|---|
| R1: (b) reißt an herd-fern +4,55 EV, weil p98 den Kreis nicht sieht | Spike | **HÄLT** als Befund über p98, robust gegen die Geometrie (0,11–0,32 % ≪ 2 %) | — |
| R1-Zusatz: „ein Perzentil kann nicht beides, (d) bringt nichts mehr“ | Spike | **WIDERLEGT** | Das zweite Ziel („Wiese lesbar“) ist das gefallene Band. Mit der Kappe am Maximum bricht keine Eigenschaft aus SOLL. Siehe (d). |
| R2: (b) reißt an herd-nah +2,16 EV, Kipp bei 1,4 % | Spike | **WIDERLEGT als Riss, HÄLT als Schwäche der Probe** | T_Glut (U, 900–1 300 K) liegt beiderseits von T* (1 097–1 271 K). Der Anteil aus 3 m beträgt 0,98 % < 1,4 %. Was bleibt: Die Diffus-Probe hat **keinen Abstand** zwischen Stoff und Strahler, wenn ein Strahler unter seinem eigenen Nachbarlicht liegt. |
| R3: Der Knoten −2,17 legt die Wiese auf Luma 4,8 und verlangt −0,59 EV für den Anker ≥ 22 | Spike | **Zahl WIDERLEGT, Kern HÄLT** | Der Halm-Faktor (0,51 → 1: +0,97 EV) und die Gras-Albedo (Y 0,12 → 0,20: +0,69 EV) tragen zusammen **+1,67 EV**. Nötig wären +1,57 EV. Die Zahl 4,8 und die −0,59 EV liegen also im Fehler der Eingänge. Was hält: Das Nachtbild hängt **allein** am Knoten, denn k·L ist unabhängig von E⊥ (§2). Den „Widerspruch Knoten ↔ Anker S0“ führe ich auf: S0 ≥ 22 ist selbst gesetzt, bild-kosten.js:3003-3005 „dieselbe Luma wie main (24,1 ± 0,3; Soll ≥ 22)“. Zwei gewählte Zahlen widersprechen sich hier, keine Eigenschaft. |
| R4-Vollmond: Himmel 6,1 > Wiese 5,0 (Purkinje) | Spike | **WIDERLEGT als Befund**, die Forderung „(a) nennt ihre Leuchtdichte“ HÄLT | 0,3 EV Abstand gegen ×2,5 (Himmel) und ×2 (Halm) |
| R4-Lava: Kruste 60,1 < Ufer 2 m 63,9 | Spike | **WIDERLEGT an der Quelle** | Die Kruste trägt im Spiel 1 326 K / 861 cd/m², k·L 2,41 |
| „Der Fit an r4 trifft auf 4 %“ | Spike | **WIDERLEGT als Beleg** | Der Riss-Anteil ist gewählt. Das Spiel-Gesetz gibt 6 261 cd/m². |
| „Das Auge trifft: 5 von 6 k, 9 von 14 Zahlen“ | Spike | **hängt an der gewählten Toleranz ±25 %** | bei ±20 %: k 4 von 6, gesamt 8 von 14; bei ±30 %: 6 von 6 und 10 von 14. Die Rückrechnung von ΣE (1–3 %) ist dagegen ein echter innerer Beleg. |
| „(c) hält überall ≤ 1,3°“ | Spike | **HÄLT durch Konstruktion** | siehe §1 (c); gegen den wahren Planck-Ort sind es 2,0–2,1° an Glut und Kruste |
| „Vendor-Neutral bricht (c) auch am Fuß“ | Spike | **HÄLT** | Ein neuer Befund kommt dazu: Der Fuß bricht auch **(a)**, 486 Umkehrungen, und zwar in beiden Kurven, weil die Helligkeit aus Neutral kommt. |
| Tor 0,75 fällt | Entscheid, Spike | **HÄLT** | Feuer-Licht B/R 0,0077 × Gras B/R 0,45 → B ≈ 0 → S_HSV 1,00 unter der Schulter |
| Spanne (b) = 0, hergeleitet | Entscheid §5 | **HÄLT**, denn bei 0,76 verlässt die Kurve die Identität. Der Entscheid widerspricht sich aber selbst: §0 führt die Spanne von AUGE mit 0,188 EV und „½ gewählt“, die Tabelle in §5 sagt 0. Es gilt 0. | — |
| κ FOLGT am Mittag | Entscheid §1.2 | **WIDERLEGT als „folgt“** | κ ist das Verhältnis Karte ÷ log-Mittel an **einer gewählten** Mittags-Komposition (1,743 ↔ 1,822, also 0,07 EV zwischen zwei Kompositionen). In allen Nacht-Sichten des Spikes ist κ wirkungslos, weil dort Kappe oder offene Blende binden. Am Tag verschiebt κ k über k ∝ κ^−0,75. |
| „Sonnenscheibe ≈ 6,1·10⁴ < 65 024 (rg11b10)“ | Entscheid §4 | **WIDERLEGT unter 35°** | Unter dem Schlüssel gilt x_Sonne = L_Scheibe·k. Bei 45°: 4,4–6,5·10⁴. Bei 25°: 6,2–9,2·10⁴. Bei 18°: 7,6–11,2·10⁴. Bei 10°: **1,1–1,6·10⁵**, also ×1,7–2,5 über dem Maximum. Die Spanne entsteht aus dem Himmelsanteil 12–40 %. Ob rg11b10 dann klemmt oder Inf trägt, habe ich nicht gelesen. |
| „Das Glutbett verschiebt p98 nicht über 2 % Fläche“ | Entscheid §7 | **WIDERLEGT als Satz** | Er gilt nur, wenn T_Glut über T* liegt oder der Anteil unter der Schwelle. Beide Zahlen sind U bzw. G. |

---

## 4. Stellwerte durch die Hintertür (Exponent · Deckel · Anteil ohne Anker)

| Stellwert | Wo im Gesetz | Anker? | Wirkung |
|---|---|---|---|
| **Steigung 0,25 und Knoten −2,17**, dazu die Form „linear in log2 L“ zwischen L☾ und L₁₀ | §1.2 Schlüssel | **nein**: die Spalte `stufen` von tag-ref.json = die alte Kamera BELICHTUNG | Sie setzen das ganze Bild außerhalb der Kappe: Abend, Gasse, Wiese, Vollmond. „Abends wie main ± 0,12 EV“ ist darum tautologisch, es ist der alte Fahrplan, nur von der Sonnenhöhe auf L_K umgestellt. Der Entscheid schreibt „gewählt, kein Tor“. Ein Stellwert **ist** es trotzdem, und SOLL verlangt für absolute Zahlen ein „dokumentiertes Auge-/Kamera-Modell“. |
| **p98** der Kappe | §1.3 | nein | Er erlaubt 2 % diffuse Pixel über der Schulter, R1. Dabei schreibt §1.1 vom Zustand ausdrücklich „ohne gewählte Perzentile“: ein Widerspruch im eigenen Text. Die Forderung von SOLL (b) ist das Maximum. |
| **κ** | §1.2 | eine gewählte Komposition | ±0,07 EV zwischen den beiden gerechneten Kompositionen; über reale Sichten (Wald gegen offene Wiese) nicht gerechnet |
| **≤ 4 Plätze** in E_Gesetz | §1.3 (= LICHT_POOL `plaetze: 4`, SM:3899) | Leistung, nicht Physik | Trägt eine Sicht mehr als 4 Quellen (Brand, Gasse mit Wandlaternen je ≤ 10 m, Stadt), unterschätzt die Schranke E. Dann gelten diffuse Flecke als Strahler, die Kappe sieht sie nicht, und sie liegen ungeprüft über der Schulter. Das ist **kein** oberes Maß mehr, obwohl der Entscheid es „obere Schranke“ nennt. |
| **ρ_max = tor R** | §1.3 | der hellste Kanal einer Tafel mit 13 Zeilen | Ein Stoff über 0,82 (Schnee, Kalk) gilt als Strahler. T* der Glut verschiebt sich um 40–50 K. |
| `planckFarbe`: „Weiß gleicher Luma zumischen“ | §1 Quelle | eine Wahl der Gamut-Abbildung | Sie dreht den Farbton bei 1 100–1 326 K um 2,0–2,1° vor der Kurve, siehe (c). |
| Überhitzung 150 K | gelaende-core.js:1818 | nein | Lava ×6 heller als bei realem Basalt. Unter der Kappe unsichtbar, sichtbar neben anderen Quellen. |
| ε_Flamme 0,0012 | FC:6527 | eine Überschlagsrechnung, gesetzt auf den oberen Rand | I 249 statt 130–250 cd |

Unschädlich sind 0,22 (Mittelgrau, Lehre 21, belegt über die Karte 118), τ 0,3/0,8 s (Zeit, kein Bildwert), ε 10⁻⁶ im log-Mittel (bei
offener Blende ohne Wirkung) und die 4 Bisektions-Schritte (Rechenweg).

---

## 5. Gewählte Zahlen, die als Tor auftreten

| Zahl | Wo | Tor? | Eigene Rechnung |
|---|---|---|---|
| **|Δ| > 0,5 EV → Rot** | Entscheid §7, Spike-Auftrag | **ja** | Mit Spanne 0 widerspricht das Tor (b): +0,5 EV an p98 hebt das Gras in 0,75 m auf 0,76·2^0,5 = **1,07**, also 0,5 EV in die Schulter. Was (b) verbietet, lässt das Tor grün. Herleitbar ist nur Δ ≤ 0 nach oben. Nach unten fehlt ein Anker. |
| **2 % Fläche** | Entscheid §7 | ja (die Spike-Prüfung) | Das ist p98 unter anderem Namen, siehe §4. |
| **Anker S0 ≥ 22** (Nacht-Boden) | bild-kosten.js:3003-3005, gate:pruefbuehne-licht | **ja**, heute im Gate | „Dieselbe Luma wie main“ ist eine Look-Eichung und kein Datum. Nach SOLL darf eine gewählte Zahl kein Tor werden, also **fällt S0 mit den Luma-Bändern** oder muss aus einem Auge-Modell folgen. R3 misst gegen sie. |
| ±25 % der Gegenprobe | spike.md §1 | als Urteil „hält/ROT“ | Das Ergebnis hängt an der Toleranz: 8, 9 oder 10 von 14 bei 20, 25 oder 30 %. |
| Aussage-Grenze von (c): C > 0,02 und Luma ≥ 8 | spike.cjs:277 | geht als Linse (c) in Bahn L, wenn übernommen | gewählt. Herleitbar wäre: (c) schweigt, wo Δh_tol größer ist als die gemessene Drift. Dafür braucht es keine Schwelle. |
| Ordnungs-Toleranz 0,5 Luma | spike.cjs:284 | Linse (a) | gewählt. Herleitbar ist 1 Code (die 8-Bit-Stufe), und zu messen ist lineares Y, wie der Spike selbst sagt. |
| Tor 0,75 Sättigung | diag-pruefbuehne.cjs | heute ja | fällt zu Recht (§3) |

---

## 6. Nicht gelesen, nicht gerechnet (benannt)

- Ob rg11b10 in r184/WebGPU über 65 024 klemmt oder Inf trägt. Davon hängt ab, ob die Sonne unter 35° ein Fehler ist oder nur Weiß.
- Wie das Spiel das Mondlicht am Gras rechnet: Den Volumen-Leser habe ich nur für die Punktlichter gelesen (SM:2450-2465). Der Halm-Faktor 0,51 des Mondes ist eine Wahl des Spikes.
- Die wirkliche Gras-Albedo der Studio-Wiese. Die Tafel hat keine Gras-Zeile.
- Das Bildfeld des Spiels: Mit 1,88 sr habe ich angenommen, nicht gelesen. Die Bild-Anteile in §2 sind darum U.
- Der Mond in Lux aus der Literatur stammt aus dem Gedächtnis (U).
- Bloom, TRAA, `graded` und die Luft-Stelle der Post-Kette.
- Ob (a) im mesopischen Bereich in skotopischer oder photopischer Leuchtdichte ordnen soll. Das muss SOLL (a) festlegen.
- Kein Bild, keine Zahl am Gerät.
