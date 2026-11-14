# Planet-Kern, Entwurf aus dem Blickwinkel ZEIT

**Name: Schlüsselbild und Strahl.** Der Planet als f(samen, breite, laenge, t). Die Zeit ist eine Achse erster Klasse, von −4,5 Ga bis +1 Ga, und jeder Zeitpunkt ist direkt abrufbar.

Gelesen: `gelaende-core.js` 359–420 (die Großform aus drei Feldern, die Regler), 560–575 (`grossform`), 1283–1308 (EIN Klima, `TEMPERATUR`, Tiefpass geschlossen), 2682 (die Lage ohne Wirt, Meer = Basis − 3), `phyto-core.js` 4064–4091 (die Wetter-Tafel). Dazu REGELN.md und die Blätter 01 (L1, L3), 04 (L3, L5), 05 (L1–L3, L8, Zweifel), 32 (Same, Stand heute), 33 (Same).

Der Spike liegt daneben: `entwurf-zeit-spike.js` (node, ohne Fremd-Pakete, PNG über zlib). Die Karten `entwurf-zeit-karte-t-600.png`, `-t-300.png` und `-t0.png` zeigen die Saat `erde-saat-1` zu drei Zeiten. Jede Zahl unten mit „gemessen" stammt aus diesem Spike, gemessen am Laptop unter App-Last. Alles andere heißt ungemessen.

---

## 1. Der Kern in sechs Sätzen

1. **Die Bewegung ist ein Video-Codec.** Aus dem Samen kommen die **Schlüsselbilder** des Wilson-Zyklus: abwechselnd versammelt (Superkontinent) und verstreut, alle 200–275 Ma. Jedes Schlüsselbild trägt je Kraton eine Lage als Quaternion. Dazwischen liegt ein Slerp mit Smoothstep. Damit ist jede Platte zu jedem t in O(log K) abrufbar, und innerhalb eines Abschnitts dreht sie sich um EINEN festen Euler-Pol.
2. **Die Gegenwart ist ein Schnitt.** Ein Punkt zur Zeit t ist ein Materialpunkt im Rahmen seines Kratons. Seine Geschichte ist der Pfad R(τ)·q, geschlossen bekannt für jedes τ.
3. **Was sich ansammelt und abklingt, ist ein Strahl durch die Zeit.** Das gilt für Gebirge, Abtrag, Senkung und Eis. Gerechnet wird das Integral ∫₀^∞ e^(−s) · Quelle(t − τₑ·s) ds über die eigene Vergangenheit des Punkts, mit 8 Gauss-Laguerre-Knoten. Das ist die „Bohrsäule als Strahl" aus Blatt 05, ohne Integration von t = 0.
4. **Die Knotenzeiten t − τₑ·sⱼ sind für alle Punkte gleich.** Darum werden die Plattenlagen an diesen 9 Zeiten EINMAL je Bild gerechnet (die **Zeitscheibe**). Der Punkt zahlt danach nur Skalarprodukte.
5. **Globale Größen sind Gesetze von t, keine Zustände.** Leuchtkraft, Orbit, CO₂-Gleichgewicht, Tageslänge und Mondabstand sind geschlossene Formeln. Der Meeresspiegel folgt aus dem erhaltenen Wasservolumen über der Hypsometrie und wird je Zeit-Fach memoisiert.
6. **Die einzige echte Pfadabhängigkeit wird vorab zu einer Ereignisliste gefaltet.** Das ist die Hysterese der Eis-Albedo, also der Schneeball: ein Scan über die globalen Antriebe in 2 ms, die Ereignisliste nur Bytes. Danach gibt es kein Gedächtnis mehr außer dem Plan.

---

## 2. Datenstruktur

```
Plan (eingefroren, Funktion des Samens, gemessen 7 760–9 528 B Float64 für Platten + Hotspots)
  samen, k                      // k = hash32(samen); jede Zahl ist h(k, pfad), zählerbasiert, ohne Zustand
  planet  { radius_km, masse_E, wasser_km, Q0 }       // wasser_km = mittlere Wassersäule über die Kugel
  stern   { L0, alter_Ga }
  regime  { t_magmaEnde, t_plattenStart, t_deckel? }  // aus Q(t) = Σ Qᵢ·e^(−λᵢ(t−t₀)), 4 Zerfallsreihen, geschlossen
  kratone [{ r_rad, geburt_Ma, rausch }] × nK (7–9 im Spike)    // Krustenwachstum: Geburt nach Sigmoid in t
  schluessel [{ t_Ma, posen: Float64Array(nK·4), ozean: Float64Array(nO·3) }] × 21–22 (−4 000 … +1 000 Ma)
  hotspots [{ d: vec3 (Mantel-Rahmen), t0, dauer, staerke }] × 12
  orbit   [{ periode_ka, amp, phase }] × 5–8          // Präzession, Schiefe, Exzentrizität (Erd-Saat: 19/23, 41, 95/125/405 ka)
  mond    { a0, k }                                   // a(t)^(13/2) linear in t
  ereignisse [{ art: 'schneeball'|'trapp'|'einschlag', t0, t1, ort?, groesse }]   // aus dem Vorab-Scan

Zeitscheibe (je t, je Bild EINMAL; gemessen 0,1–2,4 ms für 9 Zeiten)
  t, q[nK], inv[nK], ctr[nK+nO], om[nK+nO]           // Lage, Inverse, Zentrum, Winkelgeschwindigkeit (rad/Ma)
  knoten[8]                                           // dieselbe Struktur an t − τₑ·sⱼ
  global { L, co2, T_mittel, eislinie, hadley, tag_h, mond_km, meer_m }

Zeit = { ma: ganze Zahl (negativ = Vergangenheit), jahr: Float64 in [0, 10⁶) }
```

Warum die Zeit geteilt ist: Float64 hat bei 4,5·10⁹ a einen Abstand von 2⁻²⁰ a ≈ 30 s. Uhr und Saison brauchen Sekunden, darum trägt `jahr` die Feinzeit. Die Tektonik liest nur `ma + jahr/10⁶`.

---

## 3. Funktions-Signaturen

```js
// planet-core.js — UMD wie die anderen Kerne, keine Abhängigkeit, kein Math.random, keine Wanduhr
planetPlan(samen, opts?)                 -> Plan          // opts: { masse_E, wasser_km, stern } — Fremdwelt-Achsen
zeitScheibe(plan, zeit)                  -> Scheibe       // Lagen bei t und an 8 Laguerre-Knoten + globale Größen
punkt(scheibe, breite, laenge)           -> { hoehe_m, kruste: 'kontinent'|'ozean', alter_Ma, platte,
                                              rand: { art: 'konvergent'|'divergent'|'transform', abstand_km, rate_cm_a },
                                              orogen: { staerke, alter_Ma }, vulkan: { art, aktiv, alter_Ma } }
pegel(plan, zeit)                        -> { meer_m, land_anteil, eis_m3 }   // memo je Zeit-Fach, kubisch interpoliert
klimaGlobal(plan, zeit)                  -> { L, co2, T_mittel, eislinie_breite, hadley_breite, tag_h, mond_km, schiefe, exz }
ortKlima(scheibe, breite, laenge, saison) -> { T_jahr, T_sommer, T_winter, tagAmp, P_mm, koeppen, biom }
ortParameter(plan, zeit, breite, laenge) -> { land, hoehe, rauhLambda, tafel, trog, meerUnterBasis,
                                              klima: { sommer, winter, tagAmp, sommerPhase }, abfluss_mm }   // die Brücke
karte(plan, zeit, w, h, art)             -> Uint8Array RGB    // dieselbe punkt-Funktion, die Abtastdichte ist der LOD
zeitFilter(plan, zeit, dt)               -> Scheibe           // Zeitraffer: Wellen unter dt gemittelt (§4.7)
```

---

## 4. Das Verfahren je Größe

### 4.1 Platten und Drift (geschlossen, Schlüsselbilder)

- **Schlüsselbilder.** Versammelt heißt: ein Pol P aus dem Samen, die Kratone in einer Spirale dicht um P. Verstreut heißt: Poisson-Scheibe auf der Kugel mit Mindestabstand r_a + r_b + 0,25 rad. Ein Zyklus dauert 400–550 Ma.
- **Auswertung.** Gesucht wird der Abschnitt [Kᵢ, Kᵢ₊₁] (binäre Suche), dann gilt u = smooth((t − tᵢ)/Δt) und Q_k(t) = slerp(Qᵢ, Qᵢ₊₁, u).
- **Winkelgeschwindigkeit.** ω = Achse(Qᵢ₊₁Qᵢ⁻¹) · Winkel · du/dt, geschlossen.
- **Gemessen:** Drift der Kratone über −3 000 … +900 Ma: Median 5,6 cm/a, p95 10,9, Maximum 13,0 (Saat `erde-saat-1`); bei `zweite-saat` Median 6,0, Maximum 14,5. Das liegt im Band 1–15 cm/a von Blatt 05 L2·2, und zwar durch Bau, weil Δt und der maximale Winkel die Rate begrenzen.
- **Plattengrenzen.** Gewichtetes Voronoi der Zentren zur Zeit t, mit Rausch-Verzug der Grenze: Kratone als große Platten, dazu nO = 5–7 ozeanische Platten.
  - Die Art der Grenze folgt aus (v_a − v_b)·n, mit v = ω × p.
  - Konvergent, divergent und transform sind damit geschlossen in jedem Punkt bekannt.
- **Die Regime vor den Platten.** t < t_magmaEnde ist Magma-Ozean, t < t_plattenStart ist Deckel-Tektonik (stagnant lid). Beides sind Schwellen auf Q(t), geschlossen. Für fremde Welten setzt die Masse Q₀, und kleine oder große Welten bleiben im Deckel. Die Schwellen sind ungemessen.

### 4.2 Relief

- **Kontinent.** Ein Sockel aus dem Kraton-Rand in seinem eigenen Rahmen (Kappe plus fbm, 5 Oktaven) liegt bei +0,35 km. Dazu kommt das Orogen (§4.3) und ein Schelf als Rampe am Maskenrand.
- **Ozean.** Die Tiefe folgt der Halbraum-Abkühlung, d = 2,6 + 0,33·√Alter km. Am Rücken ist es seicht, am Graben kommen −2,5 km auf der Unterseite der Konvergenz dazu.
  - Im Spike ist das Alter ein Platzhalter: Abstand zum divergenten Rand geteilt durch die halbe Rate.
  - Für den Bau gilt stattdessen eine Bisektion über die Zeitscheiben: Gesucht ist die letzte τ < t, an der der Materialpunkt am divergenten Rand lag. Das sind etwa 20 Schritte × N Platten. Die Kosten sind ungemessen.
- **Gemessen (Hypsometrie, 4 096 Fibonacci-Punkte):** bimodal zu jeder Zeit, also bei −600, −300, 0 und +250 Ma. Der Ozean-Gipfel liegt im Fach −6,5…−6,0 km, der Land-Gipfel im Fach 0…+0,5 km. Der Land-Anteil beträgt 17,9–21,2 % (`erde-saat-1`, Wassersäule 2,4 km) bzw. 28,0–28,4 % (`zweite-saat`).
- **Abweichung von der Erde:** Der Ozean-Gipfel liegt etwa 2 km zu tief (Erde ≈ −4,5 km), weil das Alter im Spike zu schnell sättigt. Das ist der erste Messname für den Bau: `hyps.ozeanGipfel`.

### 4.3 Gebirge: wachsen und abgetragen werden (der Strahl)

Die Hebung eines Materialpunkts ist h_oro(t) = ∫₀^∞ e^(−s) · U(R(t − τₑs)·q, t − τₑs) ds. Dabei ist U die Hebungsrate am Ort, an dem der Punkt zur Knotenzeit LAG:

- Ozean–Kontinent: konvergenter Rand im Abstand 150 ± 250 km, mal Rate.
- Kontinent–Kontinent: ein Band um den Rand eines anderen Kratons, e^(−(e/0,07 rad)²) als Naht.

Die Zeitkonstante τₑ = 60 Ma ist die Abtrag-Konstante; der Wert ist gesetzt, nicht geeicht. Die 8 Knoten decken bis 23·τₑ ≈ 1,4 Ga zurück. Ein junges Gebirge ist hoch und schmal. Ein altes hat nur noch die Gewichte der hinteren Knoten und ist flach (Appalachen-Fall), ohne eigenen Code.

**Gemessen:**
- Mit dem Strahl kostet ein Punkt 14,1–17,0 µs, ohne Strahl 9,2 µs. Der Strahl trägt also etwa 5–8 µs (Saat `erde-saat-1`, t = 0, gleicher Lauf).
- Die erste Fassung legte die Kollision auf die ganze Überdeckung, und der Superkontinent wurde ganz weiß. Die Naht als Band legt die Gebirge an die Ränder; das zeigen die Karte t0 und t-600.

### 4.4 Vulkanismus

- **Bögen.** Sie stehen auf der Oberplatte, 150–300 km hinter dem konvergenten Rand, solange er aktiv ist. Ein Punktprozess längs der Bogen-Koordinate im Rahmen der Oberplatte (h(k, Bogen-Index)) gibt einzelne Kegel. Bogen und Hebung sind derselbe Randterm.
- **Hotspots.** Sie sind fest im Mantel-Rahmen. Innerhalb eines Abschnitts dreht sich die Platte um einen festen Pol e, darum ist die Spur im Plattenrahmen ein Kleinkreis-Bogen.
  - Abstand des Punkts q zur Spur: |∠(q,e) − ∠(h,e)|.
  - Alter der Insel aus dem Azimut um e: geschlossen, ein Term je Abschnitt in der Lebenszeit des Hotspots.
  - Die Insel sinkt mit √Alter und wird nach dem Strahl-Gesetz abgetragen. So entsteht die Hawaii-Kette als Gesetz, nicht als Asset.
  - Im Spike steht nur der aktive Kopf, die Spur ist ungebaut.
- **Trapp / LIP.** Jeder Hotspot-Start zeugt ein Ereignis (Fläche bis 10⁶ km², Dauer < 1 Ma). Seine Fläche ist im Plattenrahmen zur Ausbruchszeit fixiert und reist mit der Platte, mit bekanntem Alter. Die Kopplung zum Klima ist ein CO₂-Puls im Gleichgewicht von §4.6.
- **Fließendes Magma am Ort** bleibt das Gesetz von Gelände und Foundry (Lava-Decke). Der Planet liefert nur „hier ist ein aktiver Schlot, Art, Förderrate".

### 4.5 Meeresspiegel

Das Gesetz: Das Wasservolumen V_w(t) ist erhalten. Es gilt V_w(t) = V_w0 − V_Eis(t) − V_Verlust(t), wobei der Verlust ab der Schwelle des feuchten Treibhauses beginnt, wenn L(t) steigt. Der Pegel ist die Höhe L mit Σ max(0, L − zᵢ)·Aᵢ = V_w. Die Lösung ist eine Bisektion über eine Fibonacci-Stichprobe der Kugel.

- **Gemessen:** 4 096 Punkte kosten 59–254 ms (die Spanne kommt von der Last). Die Pegel lagen bei −2,42 … −2,61 km gegen die Sockel-Null. Die Verschiebung über die Zeit kommt aus dem Rückenvolumen (junge Ozeane sind seicht und heben den Pegel) und aus dem Eis, beides aus demselben Gesetz.
- **Zeit-Fächer.** Ein Fach ist 5 Ma breit für die Tektonik; das Eis wird geschlossen addiert (§4.6). Gerechnet wird lazy, nur die Fächer um die Reisezeit, und dazwischen kubisch interpoliert.
- **Ankunft.** Sie zahlt EIN Fach. Mit 1 024 Punkten wird es etwa viermal billiger; die Genauigkeit gegen 4 096 ist ungemessen.

### 4.6 Klima über Äonen (geschlossen plus Ereignisliste)

**Antriebe, alle geschlossen:**
- Leuchtkraft nach Gough 1981: L(t)/L₀ = 1 / (1 + 0,4·(1 − Alter/Alter₀)). Daraus folgen 71,7 % bei −4,5 Ga (gerechnet).
- Orbit als Summe von 5–8 Sinus aus dem Samen. Daraus folgt die Einstrahlung je Breite und Saison nach Berger.
- Tageslänge und Mondabstand: a(t)^(13/2) linear in t (Gezeiten-Drehmoment, konstantes Q); die Tageslänge folgt aus der Drehimpuls-Erhaltung.

**CO₂ als Quasi-Gleichgewicht.** Die Verweilzeit des Kohlenstoffs (~0,5 Ma) ist viel kürzer als die Tektonik. Darum löst man je t: Ausgasung(t) = Verwitterung(T, Landfläche in den Tropen, Gebirge).
- Ausgasung ∝ Σ Spreizrate, aus der Zeitscheibe: Σ|ω| und die Rand-Längen.
- Die Landfläche je Breitenband folgt analytisch aus den Kappen der Kratone.
- Das sind 5 Newton-Schritte und kein Zustand. Daraus folgen Treibhaus und Eishaus aus Kontinentlage und Hebung. Die Bandbreite gegen die Scotese-Kurve ist ungemessen.

**Zonale Temperatur.** Budyko-North-Energiebilanz: T(x) = T₀ + T₂·P₂(x), x = sin(Breite), die Eislinie aus der algebraischen Bedingung (geschlossen).
- Bistabilität: Der Vorab-Scan läuft über die globalen Antriebe in Fächern von 25 Ma (220 Fächer × µs, nur Zeitscheiben-Größen, keine Punkt-Stichprobe).
- Er findet die Kreuzung zum kalten Ast und damit den Beginn eines Schneeballs.
- Das Ende ist geschlossen, weil CO₂ ohne Verwitterung linear steigt: t₁ = t₀ + ΔCO₂_kipp / Ausgasung.
- Beides kommt in die Ereignisliste.

**Eiszeiten.** V_Eis(t) ist ein linearer Tiefpass der Sommer-Einstrahlung bei 65° Breite (τ ≈ 10–20 ka) und geschlossen als Phasor. Das ist dieselbe Methode, die `temperaturFeld` in gelaende-core schon für die Trägheit fährt (1291–1296). Er wirkt nur, wenn T_mittel(t) unter der Eishaus-Schwelle liegt. Der Meeresspiegel antwortet sofort (§4.5). Die 41-ka-Spitze kommt direkt aus der Schiefe. Die 100-ka-Sägezahn-Form kommt nur angenähert (siehe §8).

**Ortsklima.** `ortKlima(breite, laenge)` setzt sich zusammen aus:
- T zonal − 6,5 K/km × Höhe über dem Meer (echte Meter);
- Kontinentalität aus einem groben Land-Anteil-Feld, je Zeitscheibe lazy: 64 × 32 Zellen, Größe unabhängig vom Planeten, Kosten ungemessen;
- Niederschlag aus dem Hadley-Muster. Die Breite der Zelle nach Held-Hou, geschlossen aus Rotation und Temperaturgefälle, setzt ITCZ, die Trockengürtel bei etwa 30° und die feuchten Mittelbreiten.
- Feuchte entsteht durch einen Strahl gegen den Wind über 6 Stützstellen im groben Feld, also die räumliche Schwester des Zeit-Strahls. Luv wird nass, Lee bekommt Regenschatten.

**Biom.** Whittaker nach (T_jahr, P) plus Köppen-Klasse. Das ist eine Tafel, kein Zustand.

### 4.7 Die Zeit selbst: Sprung, Raffer, Zeit-LOD

- **Sprung.** Ein Sprung auf ein beliebiges t kostet eine Zeitscheibe (0,1–2,4 ms gemessen) und ein Pegel-Fach (59–254 ms gemessen, lazy). Er hängt nicht davon ab, wie weit der Sprung geht: −4 Ga kostet so viel wie −4 a.
- **Raffer und Zeit-LOD.** Im Raffer mit Schrittweite dt wird jede Welle mit Periode unter ~dt geschlossen box-gefiltert: Amplitude × sinc(ω·dt/2). So flackern Orbitzyklen und Saisons im Ma-Raffer nicht, sie gehen stetig in ihr Mittel über. Das ist der LOD der Zeitachse, und er ist dasselbe Gesetz, nur anders abgetastet.
- **Begrenzte Rate.** Die Bewegung zwischen zwei Bildern des Raffers ist durch die Plattenrate begrenzt, weil der Slerp stetig ist und Smoothstep an den Schlüsselbildern C¹. Blatt 05 L1·1 (Höhenänderung nie schneller als die physikalische Rate) ist dadurch prüfbar. Die Zahl ist ungemessen.
- **Die Gegenwart ist t = 0 derselben Funktion** (Blatt 05 L8·5). Rückreise und Heimkehr sind bildgleich, weil nichts integriert wird: Die Rückkehr ist eine erneute Auswertung (Blatt 05 L1·3).

---

## 5. Kosten-Modell (mit Zahlen)

| Posten | Gemessen (node 24, Laptop, App-Last) | Bindung |
|---|---|---|
| Plan aus dem Samen | 1,9–13,6 ms; 7 760 B (7 Kratone, 5 ozean., 21 Schlüsselbilder) bzw. 9 528 B (9, 5, 22) | an Zahl der Kratone × Schlüsselbilder, nie an Radius |
| Zeitscheibe (9 Zeiten) | 0,1–2,4 ms (warm/kalt JIT) | je Bild bzw. je Sprung EINMAL |
| Punkt, ohne Strahl | 9,2 µs | N_Platten (12) × Distanz + 7 Kraton-Masken (fbm) |
| Punkt, mit Strahl (8 Knoten) | 14,1–17,0 µs (erster Lauf derselben Saat: 10,9–11,5 µs vor der Naht-Fassung) | 8 × (N_Platten + nK Masken à 2 Oktaven) |
| Pegel-Fach | 59–254 ms bei 4 096 Punkten | je Fach, lazy, memoisiert |
| Weltkarte 360 × 180 | 0,59–1,10 s, ein Faden | w·h × Punkt |
| Determinismus | dieselbe Abfrage zweimal: `Object.is` wahr | eine Engine; geräteübergreifend siehe §8 |

**Begründung der Bindung.**
- Der Planet lebt im Winkel. Der Radius ist nur die Einheit km je rad, er erscheint in keiner Schleife.
- Die Kosten je Punkt sind O(N_Platten × 8). Wächst N mit der Masse (Super-Erde), bekommt die Zeitscheibe einen Würfel-Index mit 6 × 16 × 16 Zellen und Kandidatenlisten. Dann sind die Kosten je Punkt O(1); der Index kostet ms je Scheibe, die genaue Zahl ist ungemessen.
- **Ein Punkt kostet Mikrosekunden, ob Mond oder Super-Erde.** Das ist durch Bau so; mit verschiedenem Radius ist es nicht gemessen, weil der Radius im Code nur Faktor ist.

**Was nicht in µs geht und wohin es gehört.**
- Eine Orbit-Karte von 1 024 × 512 würde nach dem Spike etwa 524 288 × 14 µs ≈ 7,3 s auf einem Faden kosten (gerechnet, nicht gemessen).
- Darum: Die Orbit-Karte rechnet dieselbe `punkt`-Funktion auf der GPU (WGSL-Port, byte-geprüft gegen den JS-Kern an Stichpunkten) oder progressiv in Workern.
- Der Kern-JS ist die Wahrheit für die Brücke, das Gesetz und die Prüfung, nicht für Millionen Texel je Bild.

**Ankunft (Blatt 05 L1·0, PFLICHT-OFFEN B).** Die Brücke braucht EINE Zeitscheibe, EINEN Anker-Punkt, ein Pegel-Fach mit 1 024 Punkten und das grobe Klima-Feld. Nach den gemessenen Posten sind das unter 0,1 s plus das ungemessene Klima-Feld. Der Planet darf die 16,6 s nicht verlängern. Gemessen werden muss es im Fenster.

---

## 6. Die Brücke zu gelaende-core (kein Zwilling)

gelaende-core bleibt das Gesetz des ORTES: Flussnetz, Talprofil, Schichten, Höhlen, Uhr und Saison. Der Planet rechnet nichts davon. Er liefert, was heute Konstante oder Rauschen ist.

**Stufe 1: Regler aus dem Planeten.** Die Lage trägt `{ art: "wildnis", …Regler }`, und `ortParameter(plan, zeit, breite, laenge)` füllt genau diese Regler aus 359–390:

| Regler / Konstante heute | Quelle im Planeten |
|---|---|
| `land` (C-Versatz) | relative Höhe des Ankers über dem Pegel, Kontinent/Schelf/Ozean |
| `hoehe` (Relief-Skala) | Orogen-Stärke am Anker (Strahl, §4.3) |
| `rauhLambda` | Alter des Orogens: jung → kurz und rau, alt → lang und glatt |
| `tafel` | Kraton-Inneres ohne Orogen, mit Senkungsgeschichte (Sedimentbecken) |
| `trog` | Eis am Anker in den letzten 100 ka (V_Eis, Eislinie) |
| Meer = Basis − 3 (Lage ohne Wirt, ~2682) | `meerUnterBasis` aus pegel(t) − Planetenhöhe(Anker), gestaucht |
| `TEMPERATUR` 18 / −4 / ±5 (1287) | `ortKlima` am Anker: Sommer, Winter, Tagesamplitude, Phase nach Breite und Halbkugel |
| Abflussspende 330 mm (1548, laut Blatt 04) | P − ET aus `ortKlima` |

Die Änderung in gelaende-core ist klein und an EINER Stelle: `temperaturFeld(L, …)` liest `L.klima` statt der eingefrorenen Konstante. Jede Lage trägt `klima`, auch die Lage ohne Wirt, die genau die heutigen Werte trägt. Damit gibt es keinen `||`-Rückfall und keinen stillen Zwilling.

**Was byte-gleich bleibt.**
- Eine Welt ohne Planet im Erbgut trägt dieselben Regler-Werte und dieselbe Klima-Tafel wie heute. Alle Bytes bleiben gleich, und der Plan-Hash Studio = Welt (gate:settlement Teil O) ist der Richter.
- Eine Welt MIT Planet ist eine neue Welt. Ihre Bytes sind eine Funktion von (samen, anker, t) und auf einer Engine gleich (gemessen im Spike).

**Stufe 2: die Großform aus dem Planeten (Blatt 05 L8·5).**
- `grossform(N, x, z)` liest das Feld c nicht mehr aus dem Rauschen (566–568), sondern aus der Planetenhöhe auf der Tangentialebene am Anker: p(x, z) = norm(p₀ + x/R·ê_Ost + z/R·ê_Nord).
- Das Rauschen bleibt nur als Meso-Detail unter der Skala, die der Planet auflöst (km-Strukturen).
- Erst damit ist die Gegenwart der Schnitt der Geschichte und nicht ein zweites Gesetz daneben.
- Stufe 2 bricht die Byte-Gleichheit für Planeten-Welten absichtlich. Ob die Eingangs-Welt (Saat `anazh-realm-seed`) Planeten-Welt wird, entscheidet der Schöpfer (Scope).

**Die Stauchung.**
- gelaende-core staucht die Höhe: 160 m tragen, was die Alpen in 3 km tragen, also etwa Faktor 19 und 0,11 K/m.
- Der Planet spricht echte Meter. Die Brücke führt die Stauchung als EINE benannte Konstante, die beide Seiten lesen.
- Solange sie gilt, kann Blatt 04 L3·2 („Gebirge in Erd-Höhe") nicht steigen. Das ist ein offener Konflikt, kein Detail.

**Zeit an der Brücke.** Die Saison von gelaende (`saison` 0…1) ist der Bruchteil von `zeit.jahr`, die Uhr ist der Bruchteil des Tages mit der Tageslänge `tag_h(t)`. Uhr und Saison bleiben also gelaende-Gesetz; der Planet liefert nur die Länge von Tag und Jahr und die Amplituden.

---

## 7. Erd-Statistik als Richter (was der Bau zuerst misst)

| Messname | Ziel (Blatt) | Spike-Stand |
|---|---|---|
| `hyps.bimodal` | zwei Gipfel, Abstand 3–6 km (01 L1·3) | bimodal an 4/4 Zeiten, Abstand ≈ 6,5 km: an der Kante, 1 Saat |
| `hyps.ozeanGipfel` | ≈ −4,5 km | −6,0 … −6,5 km: ROT |
| `land.anteil` | ≈ 29 % (Erde) | 17,9–21,2 % / 28,0–28,4 % (2 Saaten) |
| `drift.cm_a` | 1–15 cm/a (05 L2·2) | Median 5,6, Maximum 13,0 / 14,5 |
| `gebirge.amRand` | ≥ 90 % an Konvergenz (05 L2·1) | im Bild an Rändern und Nähten (t0, t-600); ungezählt |
| `superkontinent` | ≥ 1 je Ga in ≥ 80 % (05 L2·3) | durch Bau: der Zyklus ist vorgeschrieben (siehe §8) |
| `klima.zonen` | Köppen gegen Lage ≥ 80 % (04 L3·5) | ungebaut |
| `eis.spektrum` | 41 ± 5 und 100 ± 15 ka (05 L3·2) | ungebaut |

Gemessen wird über ≥ 30 Saaten (R2). Der Spike hat 2.

---

## 8. Was dieser Ansatz NICHT kann (ehrlich)

1. **Die Tektonik ist vorgeschrieben, nicht entstanden.**
   - Der Wilson-Zyklus steckt in den Schlüsselbildern. Superkontinente gibt es, weil der Plan sie setzt, nicht weil Mantelkonvektion sie erzwingt.
   - Den Richter L2·3 besteht das durch Bau. Die Fremdwelt-Probe (R10: Ursache kappen → Merkmal kippt) besteht es nur, wenn die Masse den Zyklus über Q(t) wirklich steuert.
2. **Die Plattengrenzen sind keine Materiallinien.**
   - Ein Voronoi bewegter Zentren erhält keine Fläche. Grenzen können springen, wenn die Rangfolge kippt, und Subduktion verbraucht keine Lithosphäre physikalisch.
   - Das Ozean-Alter ist darum eine Näherung (Bisektion über die Zugehörigkeit), keine Isochronen-Karte.
3. **Kratone sind starr.** Keine Biegung, kein Terran-Anbau außer der geplanten Geburt. Im Superkontinent dürfen sie sich überdecken. Die Naht zeigt Gebirge, aber die Geometrie ist eine Vereinigung von Masken; der Bau braucht eine Packung ohne Überdeckung in den Schlüsselbildern.
4. **Die Kontinente lesen noch als Kleckse.** Der Spike zeigt Kappen mit fbm-Rand (Karten t-600, t-300, t0). Ein Planet ist das, aber noch nicht die Erde: Halbinseln, Randmeere und Inselbögen fehlen. Das Bild führt; das ist der erste Schnitt des Baus, nicht dieses Blatts.
5. **Der Sedimenttransport ist nicht lokal** (Blatt 05, Zweifel 1). Der Strahl integriert die Geschichte EINES Punkts: Hebung, Abtrag, Senkung. Wohin der Abtrag fließt (Delta, Becken über 1 000 km), weiß er nicht. Die Schichtfolge (05 L4, 01 L9) bekommt aus diesem Kern nur die Umwelt je Epoche (Meer → Kalk, Wüste → Sandstein) und die Senkung, keine Massenbilanz.
6. **Die Hysterese gibt es nur als Ereignisliste.** Der Schneeball und andere bistabile Zustände sind vorab gescannt. Eine Kopplung von unten nach oben (eine Tat des Spielers verschiebt das Klima, Blatt 32 L9) passt nicht in eine reine Funktion; sie braucht Akten als Randbedingung, und der Scan läuft dann neu ab der Akte.
7. **Die 100-ka-Eiszeit ist angenähert.** Ein linearer Tiefpass erzeugt die Kraft bei 41 ka und den Exzentrizitäts-Takt, aber nicht die steilen Terminationen des Sägezahns. Das verlangt eine nichtlineare Schwelle (Paillard-Art), und die ist pfadabhängig, also wieder ein Fall für die Ereignisliste.
8. **Es gibt kein Wetter.** Der Kern liefert Klima-Mittel und Zonen. Fronten, Druckfelder und Wolken bleiben die Domäne von Wetter/Phyto (4064–4091) und lesen künftig `ortKlima` als Rahmen.
9. **Die Erd-Saat ist keine Erde.** Keine Erd-Geometrie, also kein Rodinia → Pangäa → heute erkennbar (05 L2·4). Die Erde ist hier eine Saat mit Erd-Parametern (Masse, Wasser, Orbit-Perioden), gemessen gegen Erd-Statistik, nicht gegen die Erdkarte.
10. **Bytes über Geräte sind nicht gesichert.**
    - ECMAScript legt Math.sin, cos, acos und exp nicht bitgenau fest; nur + − × ÷ und sqrt sind IEEE-exakt.
    - Der Kern braucht eigene Polynom-Transzendenten (psin, pcos, pacos, pexp aus + und ×) oder eine Quantisierung der Ausgabe.
    - Der Spike benutzt Math.* und beweist nur Gleichheit auf EINER Engine.
11. **Die Stauchung bleibt ein Konflikt.** Solange gelaende-core 3 km auf 160 m staucht, sieht der Spieler nie die echte Planeten-Höhe am Boden.
12. **Hadaikum und ferne Zukunft sind Schwellen, kein Inhalt.** Für Magma-Ozean, Deckel-Tektonik und Ozeanverlust stehen die Regime als Bedingungen auf Q(t) und L(t). Was der Spieler dort sieht (Magma-Oberfläche, Wasserwelt ohne Kontinente), ist in diesem Entwurf nicht gestaltet.

---

## 9. Reihenfolge für den Macher (aus dem Blickwinkel Zeit)

1. Plan, Zeitscheibe und `punkt` mit Strahl als Kern, mit eigenen Transzendenten. Der Byte-Beweis: dieselbe Saat auf V8 und SpiderMonkey bitgleich.
2. Weltkarte als PNG je Saat an 4 Zeiten. Die Messnamen aus §7 über 30 Saaten, zuerst `hyps.ozeanGipfel`, durch das Alter aus der Bisektion.
3. Pegel und `klimaGlobal` mit Ereignisliste. Bild: dieselbe Saat bei Eishaus und Treibhaus.
4. Brücke Stufe 1 (Regler, `L.klima`, Meer). Der Beweis: Welt ohne Planet byte-gleich (gate:settlement Teil O) und Welt mit Planet im Fenster.
5. Brücke Stufe 2 (c aus dem Planeten), sobald der Schöpfer die Eingangs-Welt entscheidet.
