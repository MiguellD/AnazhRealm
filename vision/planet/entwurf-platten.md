# planet-core.js — Entwurf aus dem Blickwinkel PLATTEN

Stand 14.11.2026. Architekt-Blatt, kein Code im Repo berührt. Ein Spike (node, ohne Fremd-Pakete) liegt daneben:
`bild-platten/spike-platten.cjs`, die Karten in `bild-platten/*.png`. Alle Zahlen unten sind gemessen, wo sie so heißen;
der Rest heißt **ungemessen**.

## 1 Der Kern in sechs Sätzen

1. Der Planet ist `f(samen, breite, laenge, zeit)`: eine **Vorab-Tafel** (Kilobytes, Funktion des Samens) plus eine **Punkt-Abfrage**, die nur die wenigen Platten der Tafel liest — nie ein Gitter über die Kugel.
2. Die Platten sind eine **gewichtete, verwirbelte Voronoi-Zerlegung der Kugel** (Potenz-Diagramm: Zelle i, wo `q·c_i + w_i` maximal ist, q = der verwirbelte Punkt); jede Platte dreht starr um ihren **Euler-Pol** mit eigener Rate, je **Epoche** (20–60 Ma) konstant.
3. Die **Kruste** ist nicht die Zelle, sondern ein eigenes, dauerhaftes Objekt: **Kratone** (Kontinentkerne mit Identität) reiten im Rahmen ihrer Platte; wo sie liegen, ist Kontinent, sonst Ozean — dadurch ist die Hypsometrie bimodal aus Isostasie, nicht aus einer Kurve.
4. Das **Relief folgt aus den Rändern**: je Nachbar der Abstand zur Bisektor-Ebene und die Relativ-Geschwindigkeit `(ω_i − ω_j) × p`, zerlegt in Normal- und Scher-Anteil, wählen eine Schablone (Kollision → Orogen, Ozean unter Kontinent → Graben + Vulkanbogen, Ozean–Ozean → Graben + Inselbogen, divergent → Rücken mit Tiefe aus dem Meeresboden-Alter `2,5 + 0,35·√Alter` km bzw. Rift, Scherung → Bruchzone); **Hotspots** stehen im Mantel still, ihre Spur ist der Kleinkreis um den Euler-Pol der Platte darüber — analytisch.
5. **Zeit** ist dieselbe Abfrage mit anderem `zeit`: in der Epoche eine exakte Drehung, über Epochen eine Kette von Quaternionen aus der Vorab-Tafel; ein Superkontinent-Zyklus wird im Vorab auf den Kratonen allein (Punkt-Scheiben, ein paar Dutzend) vorgerechnet, Kollisionen hinterlassen **Nähte**, die als alte Gebirge mit dem Alter verwittern.
6. Meeresspiegel (Wasser-Volumen des Samens gegen die Hypsometrie der Epoche), Klima (Energiebilanz nach Breite + Höhe + Luv/Lee stromauf entlang der Zonal-Winde) und Biome (Köppen/Whittaker) sind Leser derselben Punkt-Abfrage; an `gelaende-core` gibt der Planet nur die **Parameter des Orts** weiter, an dem der Spieler steht.

## 2 Der Spike — was das Bild heute sagt

Drei Saaten, 1024×512, Meeresspiegel noch fest bei 0 (nicht gelöst), Jahresmittel-Klima:

| Saat | Platten | Land | Hypsometrie (Modi) | Gipfel > 2,5 km ≤ 7° an konvergentem Rand |
|---|---|---|---|---|
| erde-1 | 22 | 17,4 % | −4,5 km (20,4 %) · +1,0 km (8,0 %) | 94,1 % |
| kepler-22 | 17 | 28,0 % | −4,5 km (16,1 %) · +0,5…1 km (23,7 %) | 93,0 % |
| gaia-3 | 14 | 24,7 % | −5,0 km (17,7 %) · +1,0 km (12,0 %) | 90,4 % |

Erde zum Vergleich: Land 29 %, Modi etwa −4,5 km und 0…1 km. Bimodal in 3/3 Saaten; Gebirge an konvergenten Rändern ≥ 90 % in 3/3.

**Das Bild (eigenes Auge, `bild-platten/karte-kepler-22.png`, `karte-gaia-3.png`):** liest als Planet — Kontinente mit
fraktaler Küste, Meeresboden mit Rücken, Gräben und Bruchzonen, Hotspot-Ketten als Perlenschnur (gaia-3, kepler-22),
Eis an den Polen, Klimabänder nach Breite. `karte-erde-1-t-60.png` gegen `karte-erde-1.png`: dieselbe Saat bei −60 Ma,
die Kontinente stehen anders, das Klima folgt ihrer Breite.

**Was das Bild ROT zeigt (die Lehren, die der Entwurf unten schon einbaut):**
- **Gerade Küsten, wo eine Zellgrenze einen Kraton schneidet** (kepler-22 Mitte links, erde-1 bei −60 Ma): im Spike gehört
  Kruste nur in der eigenen Zelle. → Regel K1: Kruste ist die Vereinigung ALLER Kraton-Felder (jedes im Rahmen seiner Platte);
  die Zellgrenze schneidet nie Kruste weg, Überlappung ist Kollision.
- **Facetten im Meeresboden** (gaia-3): das Alter aus Bisektoren von Platten, die gar keine Nachbarn sind. → Nachbar-Liste
  aus dem Vorab und weiches Minimum.
- **Zu viel Wüste, Klimabänder mit harten Stufen**: die Feuchte-Tafel des Spikes ist eine Skizze. → Abschnitt 5.6, geeicht
  gegen Köppen-Anteile.
- **Gebirge zu schmal und zu selten im Inneren**: nur aktive Ränder tragen Relief. → Nähte (alte Orogene) und Kraton-Alter.

Kosten (gemessen, node 24, dieser Laptop mit fremder Last, bestes von 5 Läufen über 200 000 Zufallspunkte):

| Platten | µs je Punkt (Relief) |
|---|---|
| 8 | 6,26 |
| 16 | 5,02 |
| 24 | 5,11 |
| 48 | 7,03 |
| 96 | 11,61 |

Im Karten-Lauf (warm, 524 288 Punkte) 3,26–3,58 µs je Punkt; Klima mit 6 Proben stromauf 2,6–6,2 µs je Pixel über die
ganze Karte (nur Land rechnet Klima). Vorab im Spike (Platten, Kratone, Hotspots): 5,5–33,5 µs je Samen. Das Rauschen
(≈ 31 Aufrufe `noise3`) ist der Hauptposten, nicht die Platten — bis 48 Platten bleibt die Abfrage flach.

## 3 Die Datenstruktur

```
Planet = Object.freeze({
  samen, version,                      // version = Gesetz-Version (Cache-Schlüssel)
  koerper: { radiusKm, g, wasserKm,     // Wasser als globale Schicht (Erde ≈ 2,7 km); setzt den Land-Anteil
             waermeFluss, neigungRad,   // Achsneigung (Jahreszeiten), Sternfluss relativ zur Erde
             regime },                  // "platten" | "deckel" | "eis" — aus Masse, Wärme, Wasser (Abschnitt 5.9)
  epochen: Float64Array,               // Start-Zeiten in Ma, aufsteigend, von −alter bis +zukunft
  platten: [ je Epoche e: {             // N_e Platten (8–48)
      c: Float64Array(3*N),             // Zentren zur Epochen-Start-Zeit (Einheitsvektoren)
      w: Float64Array(N),               // Potenz-Gewichte (Vorab so gelöst, dass kein Kraton geschnitten wird, ausser bei Rift)
      pol: Float64Array(3*N), rate: Float64Array(N),   // Euler-Pol, rad/Ma
      nachbar: Int16Array, nachbarAb: Int16Array,       // Nachbar-Liste (CSR), aus 4096 Fibonacci-Proben
      eimer: Int16Array                 // Würfel-Karte 6×16×16 → ≤ 6 Kandidaten-Platten (nur für N > 48)
  }],
  kratone: { c0: Float64Array(3*K),     // Kern in eigenem Rahmen
             r: Float64Array(K), alter: Float64Array(K),   // Radius, Bildungs-Alter (Kraton-Inneres = Tafelland)
             platteJe: Int16Array(E*K),  // Platte des Kratons je Epoche (Rift teilt: ein Kraton hat 1–3 Teile)
             teilEbene: Float64Array },  // die Ebene, an der ein Rift ihn teilt
  rahmen: Float64Array(E*P*4),         // Quaternion je (Epoche, Platte) zur Epochen-Start-Zeit — LAZY je Epoche, gecacht
  naehte: Float64Array(S*8),           // Kollisions-Naht: Kleinkreis-Bogen im Kraton-Rahmen, Zeit, Höhe, Breite
  hotspots: Float64Array(H*5),         // Ort im Mantel-Rahmen, Stärke, Beginn, Ende
  ereignisse: Float64Array(X*6),       // Trapp/LIP, Einschlag: Ort, Zeit, Radius, Stärke
  meer: Map<epoche, Float64Array>,     // Meeresspiegel je 10-Ma-Stützstelle, LAZY je besuchter Epoche
  ebm: Map<epoche, Float64Array>       // Energiebilanz-Koeffizienten je Stützstelle (T0, T2, Jahres-Amplitude)
})
```

Größe (Rechnung, Erde-artig 4,5 Ga, E = 90 Epochen, N ≈ 20, K ≈ 30): Platten-Tafel 90·20·(3+1+3+1)·8 B ≈ 115 KB
Float64 — ungemessen als Datei, also wird nur die Epoche gehalten, die gerade gefragt ist (≤ 2 KB) und `rahmen` lazy
aus den Polen nachgerechnet (90 Quaternion-Produkte ≈ µs). Kratone/Nähte/Hotspots/Ereignisse: < 10 KB.

## 4 Die Signaturen

```js
// Vorab — reine Funktion des Samens, ohne Wanduhr, ohne Math.random.
planetVorab(samen: string, koerperWunsch?: {radiusKm?, wasserKm?, …}) -> Planet

// Die Punkt-Abfrage. Breite/Länge in rad, zeit in Ma (0 = Gegenwart, negativ = Vergangenheit).
// Schreibt in `aus` (keine Allokation je Punkt), gibt die Höhe in m relativ zum Meeresspiegel der Zeit zurück.
planetPunkt(P, breite, laenge, zeit, aus?) -> hoeheM
//   aus = { hoeheM, kruste: 0..1 (ozeanisch..kontinental), platte, kraton,
//           rand: { abstandKm, art: -1|0|1 (div|transform|konv), rateCmA, nachbar },
//           ozeanAlterMa, orogenAlterMa, vulkan: { art, abstandKm, alterMa }, hotspot: { abstandKm, alterMa } }

planetMeer(P, zeit) -> meeresspiegelM          // aus der Stützstellen-Kurve, linear zwischen 10-Ma-Stützen + Eis-Term
planetKlima(P, breite, laenge, zeit, saison?, aus?) ->
//   { tJahrC, tSommerC, tWinterC, niederschlagMm, saisonalitaet, windRad, koeppen: "Af"|…, biom: id, eis: bool }
planetOrt(P, breite, laenge, zeit) -> OrtParameter   // DIE Brücke zu gelaende-core (Abschnitt 7)
planetKarte(P, zeit, breitePx, schicht: "relief"|"biom"|"platten"|"alter", ziel?) -> Uint8Array  // dieselbe planetPunkt, abgetastet
planetPng(P, zeit, breitePx, schicht) -> Buffer   // Richter-Werkzeug: PNG über zlib, CPU, ohne Fremd-Pakete
```

LOD ist nur die Abtast-Dichte: `planetKarte` ruft `planetPunkt` je Pixel; der Orbit, der Abstieg und der Ort lesen
dieselbe Funktion. Das Detail-Rauschen hat eine **untere Wellenlänge** `λmin` (≈ 20 km, Planet-Tafel); darunter gehört die
Form `gelaende-core` (Abschnitt 7) — die Oktaven-Zahl hängt an `λmin`, nie am Radius.

**Determinismus über Geräte:** `+ − × ÷ Math.sqrt Math.imul` sind IEEE-exakt; `Math.sin/cos/acos/asin/atan2/exp` sind
laut ECMAScript „implementation-approximated" — verschiedene Engines dürfen im letzten Bit abweichen. Der Kern bringt
darum eigene Polynome (`ksin kcos kacos katan2 kexp`, Minimax, nur aus + × ÷) und benutzt `Math.*`-Transzendente nie.
Der Spike verletzt das (25 Aufrufe) — der Macher ersetzt sie; Richter: byte-Hash der Karte auf V8 und SpiderMonkey gleich.

Zufall: `h(samen, pfad)` zählerbasiert (Philox-Art, im Spike `mix(mix(S0, pfad), k)` mit `Math.imul`) — der Baum-Pfad
aus Blatt 32 (Planet → Epoche → Platte → Kraton), nie ein Strom mit Zustand.

## 5 Das Verfahren je Größe

### 5.1 Platten (Vorab + Abfrage)
- **Zentren:** die ersten K_p Platten an den Kratonen (je Kontinent eine Platte), der Rest ozeanisch, Mindestabstand
  per Verwerfungs-Ziehung aus `h`. Plattenzahl N aus `regime` und `waermeFluss` (Erde-Saat 12–20; Spike 14–23).
- **Gewichte w_i:** im Vorab iterativ (≤ 10 Schritte über die 4096 Proben) so gelöst, dass jeder Kraton ganz in seiner Zelle
  liegt (Regel K1), ausser die Epoche verlangt sein Rift.
- **Verwirbelung:** q = norm(p + 0,16·rausch3(2,1·p)) — Ränder werden Kurven statt Großkreise (Spike: wirkt).
- **Abfrage:** Pass 1: i = argmax_i (q·c_i(t) + w_i) über N (oder über ≤ 6 Kandidaten aus `eimer`). Pass 2: nur die
  Nachbarn j von i: `d_ij = asin((q·(c_i−c_j) + w_i − w_j) / |c_i−c_j|)` (Winkel zum Rand), `n` = Tangente Richtung c_j,
  `v = (ω_i − ω_j) × p`, `konv = v·n`, `scher = √(|v|² − konv²)`; Art: konvergent, wenn konv > 0,35·scher, divergent, wenn
  konv < −0,35·scher, sonst Transform (Spike-Schwelle, ungeeicht).
- **Rate in cm/a** = rad/Ma · R_km · 0,1. Erde-Band 1–15 cm/a; die Raten-Ziehung wird je Saat auf dieses Band
  normiert: `rate_rad = U(1..15 cm/a) / (R_km·0,1)` — dadurch ist die Drift unabhängig von der Planetengröße physikalisch.

### 5.2 Kruste und Kratone
- kont(p, t) = max über alle Kratone k: (r_k − ∠(p_k, c0_k)) / 7° + 1,5·fbm(p_k, 2,2, 8) + 0,6·fbm(p_k, 7, 5), mit
  p_k = p zurückgedreht in den Rahmen der Platte, die k in Epoche e trägt. Das Rauschen liegt im Kraton-Rahmen: die Küste
  reist mit (Spike: fraktale Küste, kein Flimmern bei Drift).
- Kontinental bei kont > 0; Schelf 0…0,35 (Höhe −0,15…+0,45 km), Kontinentalhang −0,35…0.
- **Kraton-Inneres = Tafelland:** Alter des Kratons > 1 Ga und Abstand zum aktiven Rand > 800 km → hoher Tafel-Anteil an
  `gelaende-core` (Abschnitt 7) — das Schicht-Gesetz T5 bekommt seine Ursache.

### 5.3 Relief aus den Rändern (km, Breiten in km, Höhen skaliert mit g_Erde/g)
| Rand | Kruste i / j | Form (Abstand x vom Rand, auf Seite i) |
|---|---|---|
| konvergent | Kont / Kont | Orogen: 5,5·s·exp(−(x−150)²/(2·390²)), s = min(1,6, konv in °/Ma); plus Naht (5.5) |
| konvergent | Kont / Ozean | Vulkanbogen (Anden): 4,2·s·exp(−(x−280)²/(2·145²)); Vulkane 5.4a |
| konvergent | Ozean / Kont | Tiefseegraben: −6,5·s·exp(−(x−45)²/(2·55²)) |
| konvergent | Ozean / Ozean | ältere Platte taucht ab: Graben −6; jüngere: Inselbogen 3,2·s bei x ≈ 220 km |
| divergent | Ozean | Rücken: Tiefe aus Alter, Alter = x / halbe Spreizrate |
| divergent | Kont | Rift: −1,2·exp(−x/130) (Graben, später Ozean) |
| Transform | beide | Bruchzone −0,6·exp(−x/45), Versatz der Rücken-Achse |

- **Meeresboden-Tiefe (Parsons–Sclater / Stein–Stein-artig):** d = 2,5 + 0,35·√Alter km bis 70 Ma, darüber gegen 6,4 km
  abflachend; Alter = weiches Minimum über die DIVERGENTEN Nachbarn (Lehre aus den Facetten), gedeckelt beim Alter der
  Epoche plus Übertrag (5.8).
- Die Breiten stehen in km, nicht in Grad: auf einem Mond ist dasselbe Orogen ein größerer Bogen der Kugel — die
  Abfrage rechnet x = d_ij · R_km.

### 5.4 Vulkanismus (der Ort des Vulkans; das Fließen am Hang ist ein Gesetz des Orts)
- **a Bogen:** auf der oberen Platte bei x ≈ 150–300 km; Kegel einzeln aus `h(samen, platte, nachbar, Bogen-Index)`,
  Bogen-Index = ⌊Längs-Koordinate längs des Rands / 70 km⌋ (Längs-Koordinate = Winkel um die Achse c_i × c_j). Höhe aus
  Konvergenz-Rate und Magma-Art (andesitisch → Stratovulkan).
- **b Hotspot:** Mantel-fest. Für p auf Platte i mit Pol e: Kolatitude-Differenz |∠(p,e) − ∠(q,e)| und Drehwinkel φ um e;
  τ = φ / ω_i = Alter der Spur an p. Kette aus Kegeln im Takt von 3,5 Ma, Höhe 6,5 km − 0,09 km/Ma·τ, Absinken mit
  exp(−τ/40). Über Epochen-Wechsel knickt die Spur von selbst (Hawaii–Emperor), weil ω_i wechselt. Spike: sichtbar als
  Perlenschnur (gaia-3, kepler-22); der Spike lässt sie noch über Kontinente laufen — dort wird sie Trapp-/Dom-Feld statt
  Seamount.
- **c Rift- und Rücken-Vulkane:** Spalten längs des divergenten Rands (Island, wo Hotspot × Rücken).
- **d Ereignisse:** Trapp/LIP (Zeit, Ort, Radius aus `h`), Einschläge (Krater-Form ist ein Gesetz des Orts; der Planet
  liefert Ort, Durchmesser, Alter).
- `aus.vulkan = {art, abstandKm, alterMa, aktiv}` ist der Leser-Eingang für das Vulkan-Gesetz des Orts (Blatt 01 L2).

### 5.5 Nähte (Gebirge mit Geschichte)
Im Vorab simuliert ein Kraton-Lauf (nur K Scheiben, 1-Ma-Schritte über die ganze Geschichte) Annäherung und Stoß. Jeder Stoß
schreibt eine Naht: Bogen im Rahmen beider Kratone, Stoß-Zeit, Anfangshöhe. Höhe heute: H0 / (1 + Alter/60 Ma)
(Appalachen-artig: alt, niedrig, noch da). Kosten des Laufs: 4500 Schritte × K²/2 Paare — ungemessen (für K = 30:
2·10⁶ Paar-Tests).

### 5.6 Klima (Jahresmittel und zwei Jahreszeiten)
- **Strahlung:** 1-D-Energiebilanz (North 1975) mit Diffusion, gelöst je Stützstelle als Legendre-Reihe:
  T(x) = T0 + T2·P2(x), x = sin(Breite); Jahres-Amplitude aus Achsneigung und Land-Anteil der Breite. Sternfluss und Albedo
  (Eis aus dem eigenen T) sind Eingänge — ein fremder Planet kippt ohne Sonderfall.
- **Höhe:** −6,5 K/km über dem Meeresspiegel der Zeit (auf der Planeten-Skala; die Stauchung der Welt ist Sache der Brücke).
- **Kontinentalität und Feuchte:** 6–8 Proben `planetPunkt` stromauf entlang des Zonal-Winds der Breite (Passat 0–30° Ost,
  Westwind 30–60°, polar Ost), Abstände 400…2400 km (in km, nicht Grad): Meer-Anteil gewichtet 1/k → Feuchte und
  Jahres-Amplitude; höchster Kamm stromauf über dem Ort → Regenschatten (Lee-Faktor), Anstieg zum Ort → Luv-Bonus.
- **Niederschlag:** Breiten-Band (ITCZ nass, 20–30° trocken, 45–60° nass, Pole trocken), die ITCZ wandert mit der Saison um
  ±Neigung·0,4; × Feuchte × Lee. Monsun: Land-Meer-Kontrast der Breite verschiebt die ITCZ über Land.
- **Eichung:** die Band-Tafel des Spikes ist ROT (zu viel Wüste). Richter: Köppen-Haupt-Klassen-Anteile der Land-Fläche der
  Erde-Saat gegen die Köppen-Geiger-Karte (Beck et al. 2018), Toleranz vor dem ersten Lauf eingefroren.
- **Kosten:** 7–9 `planetPunkt` je Klima-Abfrage (Spike gemessen: Karte mit Klima 2,6–6,2 µs/px über alle Pixel).

### 5.7 Biome
Köppen aus (tSommer, tWinter, Niederschlag, Saisonalität) → Biom-Id (Whittaker), stetig gemischt an den Grenzen (die
harten Stufen im Spike-Bild sind ROT). Eisschild: tJahr < −10 °C auf Land; Meereis: Wasser-T < −2 °C. Die Biom-Id ist der
Eingang für Pflanzen/Tiere des Orts (phyto-core, tetrapoda-core) — das ist deren Leser, nicht dieser Kern.

### 5.8 Meeresspiegel
- Volumen des Wassers `wasserKm` (Samen) minus Eis-Volumen. Je 10-Ma-Stützstelle: M Fibonacci-Proben von `planetPunkt`
  ohne Meer, sortiert, Meeresspiegel s per Bisektion, so dass Σ max(0, s − h)·A = Volumen. Rücken-Volumen wirkt von selbst
  (junge Ozeane, flache Becken → hoher Spiegel, wie in der Kreide).
- Kosten (Rechnung aus der gemessenen Einheit 5 µs): M = 4096 → ≈ 20 ms, M = 16 384 → ≈ 82 ms je Stützstelle; nur die
  besuchte Epoche und ihre zwei Nachbarn, gecacht.
- **Eis-Term:** Vereisungs-Index aus Pol-Land-Anteil und Orbit (Milankovitch 23/41/100 ka analytisch) × −120 m (Erde).
- Der Spike hält den Spiegel noch bei 0 — der Land-Anteil 17–28 % ist darum nicht der Samen-Wert.

### 5.9 Regime (fremde Welten aus demselben Gesetz)
- **platten** (Erde-artig), **deckel** (Mars/Mond: N = 1, keine Ränder, nur Hotspots — wachsen ohne Drift zu Olympus-Mons-
  Höhe ∝ g_Erde/g, plus Krater), **eis** (Europa: Kruste aus Eis, Ränder = Bänder/Risse, Kryovulkane an Hotspots).
- Der Regime-Schalter ist eine Funktion von Masse, Wärmefluss und Wasser im Körper der Saat — derselbe Kern, keine
  Sonder-Module.

## 6 Die Zeit t

- **Uhr und Saison** bleiben, wo sie sind (gelaende-core, phyto-core). `zeit` in Ma ist die neue Achse.
- **In der Epoche:** c_i(t) = R(pol_i, rate_i·(t − t_e)) · c_i(t_e) — exakte Drehung, stetig in t; Zeitraffer ist nur
  ein Schieber auf t. Spike: −60 Ma gegen 0 zeigt verschobene Kontinente bei gleichen Kosten.
- **Über Epochen:** der Rahmen eines Kratons ist das Quaternion-Produkt der Epochen-Drehungen (lazy, gecacht).
  Plattengrenzen springen an Epochen-Wechseln; das Relief wird über ±2 Ma überblendet, Gebirge bleiben über Nähte,
  Meeresboden-Alter wird je Epoche übertragen (Alter am Rand-Wechsel = alt + Δt).
- **Superkontinent-Zyklus (Vorab, Kraton-Lauf):** Sammel-Phase: die Pole werden so gezogen, dass Kratone zum Sammel-Punkt
  (kalter Abstrom) laufen; Stoß → Naht, gemeinsame Platte. Zerfall: der Superkontinent heizt den Mantel darunter (Plume
  als Hotspot-Ereignis), Rifts teilen Kratone an `teilEbene`, neue Ozeane öffnen sich. Periode 300–500 Ma aus dem Samen.
  Richter (Blatt 01 L1.6): ≥ 1 Superkontinent-Phase in ≥ 50 % von 50 Saaten.
- **Vor den Platten (Hadaikum/Archaikum):** Regime „deckel", bis der Wärmefluss unter die Schwelle der Saat fällt;
  Kratone entstehen in dieser Zeit (ihr Bildungs-Alter).
- **Zukunft:** die Epochen-Tafel läuft über 0 hinaus (+250 Ma): derselbe Kraton-Lauf.
- **Klima über Äonen:** Sternfluss steigt mit der Zeit (junge Sonne schwächer), CO₂-Antrieb aus Vulkan-Rate (Rand-Länge ×
  Konvergenz) gegen Verwitterung (Land in warm-feuchten Breiten) als Stützstellen-Kurve im Vorab — ungemessen.

## 7 Die Brücke zu gelaende-core (kein Zwilling)

`gelaende-core` bleibt das Gesetz des Orts: Flussnetz, Talprofile, Schicht-Treppe, Höhlen, Schnee. Heute erfindet es seine
Großform selbst: drei Rauschfelder (Kontinentalität λ 9 km, Erosion λ 3,2 km, Stil λ 5 km, `gelaende-core.js` K16-Block
~359–420 und `grossform()` ~570), den Spiegel als Basis − 3 m (Lage ohne Wirt, ~2682), EIN Klima (`TEMPERATUR`,
~1287–1305). Der Planet ersetzt genau diese drei Eingänge — das Gesetz des Orts rechnet weiter alles Lokale, der Planet
nichts davon.

```js
planetOrt(P, breite, laenge, zeit) -> {
  anker: { breite, laenge, zeit, ostVektor, nordVektor },   // die Tangential-Ebene des Orts (x = Ost, z = Süd in m)
  wildnis: { land, hoehe, rauhLambda, kontinentLambda, tafel, trog, ks },   // die bestehenden LANDFORM_REGLER
  feldC: Float64Array(9*9),     // Stufe 2: Kontinentalität des Planeten auf 9×9 Stützen über 64 km (bilinear)
  meer: { wasserUeberBasisM },  // Spiegel relativ zur Basis — ersetzt die Konstante „Basis − 3"
  klima: { sommer, winter, tagAmp, abflussMm },             // ersetzt TEMPERATUR + Abflussspende 330 mm
  vulkan, hotspot, rand                                     // für die Ort-Gesetze von Vulkan, Beben, Gestein
}
```

- **Abbildung:** `land` aus der Kruste und der Planet-Höhe am Anker (Schelf → um 0, Inneres → 0,5–0,9, Meer → negativ);
  `hoehe` aus der Orogen-Intensität (Rand-Schablone + Naht); `rauhLambda` kleiner im aktiven Gebirge; `tafel` aus
  Kraton-Alter und Rand-Abstand (5.2); `trog` aus Eis-Geschichte (Vereisungs-Index); `ks` aus Hebung (Konvergenz-Rate).
- **Stauchung:** die Welt staucht die Höhe (Kommentar am Klima: 160 m tragen, was in den Alpen 3 km tragen). Die Brücke
  trägt diesen Faktor als EINE benannte Konstante, bis die Welt sie aufgibt (Blatt 04 L3-2) — dann fällt sie dort, nicht
  hier.
- **Stufe 1 (byte-gleich):** `TEMPERATUR`, die Abflussspende und der Spiegel wandern als Pflichtfelder in die Lage
  (`L.klima`, `L.waterLevel` — gibt es schon); ohne Feld bricht der Kern beim Namen (kein Rückfall). Die Lage-Bauer füllen
  sie im selben Commit mit den heutigen Werten. Beweis: byte-Diff der Höhen und Temperaturen über Studio- und Saat-Welten = 0.
- **Stufe 2 (sichtbar, gewollt):** die Lage-Bauer rufen `planetOrt` am Ankunfts-Ort; `feldC` wird in `grossform()` zu c
  addiert (vor dem Spline). Damit liegt die Küste der Orbit-Karte und die Küste am Boden oberhalb von ~8 km an derselben
  Stelle; darunter bleibt das lokale Rauschen die bedingte Verfeinerung (Blatt 32: das Kind erbt das Mittel). Studios mit
  eigenem Erbgut bleiben byte-gleich; Saat-Welten ändern sich — Bildpaar am Ankunfts-Ort, und das Tor „Plan-Hash Studio =
  Welt" (gate:settlement Teil O) wird im selben Commit nachgezogen, nicht abgeschaltet.
- **Kosten an der Brücke:** 81 Punkte für `feldC` + 1 Klima + 1 Ort ≈ 90 `planetPunkt` ≈ 0,5 ms je Ankunft (Rechnung aus
  der gemessenen Einheit); pro Bild 0.
- **Wetter:** `phyto-core wetterAt` (drei Sinus-Bänder) bleibt Wetter-Gesetz; der Planet liefert ihm nur den Rahmen
  (Niederschlag, Saisonalität, Sturmbahn-Stärke ∝ Temperatur-Gefälle der Breite), die Zustands-Häufigkeiten werden davon
  abhängig. Das Druckfeld selbst ist Sache des Wetter-Entwurfs.

## 8 Was dieser Ansatz NICHT kann (ehrlich)

- **Keine echte Geodynamik:** keine Mantel-Konvektion, keine Spannungs-Rechnung; Platten sind starre Kappen mit gezogenen
  Polen. Plattengrenzen sind Bisektoren (verwirbelt), keine aus Kräften gewachsenen Ränder; Mikroplatten, diffuse Ränder
  (Tibet-Plateau-Breite), Delamination, Terran-Anlagerung fehlen oder sind Schablone.
- **Unstetigkeit an Epochen-Wechseln:** Grenzen springen; die Überblendung versteckt es im Zeitraffer, beweist aber keine
  Erhaltung (Krusten-Fläche, Meeresboden-Alter sind nur genähert, nicht bilanziert).
- **Kein Abtrag auf Planeten-Maßstab:** Flussnetze und Erosion über 1000 km (Amazonas-Becken, Deltas, Sediment-Keile)
  entstehen nicht aus den Platten; die Erosion lebt nur im Ort (gelaende-core). Kontinent-Inneres ist Rauschen + Nähte.
- **Die Küste ist nur oberhalb ~8 km dieselbe** von Orbit bis Boden (Stufe 2); darunter ist sie statistisch, nicht
  geometrisch konsistent.
- **Schichtfolge/Gestein je Ort** (Blatt 05 L4, Blatt 01 L5) liefert der Kern nur als Geschichte-Eingang (Kruste, Rand-Art,
  Meer ja/nein über t an einem Punkt); die Bohrsäule ist ein eigener Leser.
- **Klima ist kein Wetter:** Energiebilanz + Proben stromauf, keine Zirkulation, keine Ozeanströme (Golfstrom-Wärme fehlt),
  keine Feedback-Dynamik über Äonen ausser der Stützstellen-Kurve.
- **Die Erde-Saat ist nicht die Erdgeschichte:** Rodinia–Pangäa erkennbar zu machen (Blatt 05 L2.4) braucht eine Saat mit
  Schlüssel (Erd-Parameter der Kinematik) — ohne Geometrie aus Erd-Daten ist das ungemessen und vielleicht nicht erreichbar.
- **Krümmung im Ort:** der Kern liefert die Kugel; dass das flache Gelände bei 50 km 196 m unter der Tangente liegt
  (d²/2R), muss der Zeichner (Blatt 33) lösen, nicht dieser Kern.

## 9 Risiken

1. **Bit-Gleichheit über Engines** (Math-Transzendente) — mit eigenen Polynomen lösbar; Richter V8 ↔ SpiderMonkey.
2. **Kraton-Gewichte lösbar?** Bei vielen großen Kratonen gibt es evtl. kein Potenz-Diagramm, das keinen schneidet → dann
   Rift erzwingen (Geschichte statt Fehler) oder Kraton verkleinern; ungemessen, wie oft.
3. **Klima-Eichung** kann zur Kurven-Kosmetik werden (Band-Tafel gegen Köppen gefittet). Gegenlauf (R7): Gebirge stromauf
   entfernen → Lee-Wüste verschwindet; sonst zählt es nicht.
4. **Kosten im Spiel:** 5 µs/Punkt ist node auf einem Laptop unter Last; der Browser-Haupt-Faden ist bei Ankunft 97 % belegt
   (PFLICHT-OFFEN B). Die Brücke darf die Ankunft nicht verlängern: Vorab + Ort ≤ 1 ms Ziel, ungemessen im Spiel; die
   Orbit-Karte gehört in einen Worker oder auf die GPU.
5. **Facetten und Nähte im Bild** (Spike: Meeresboden-Facetten, gerade Küsten) sind in 5.1–5.3 adressiert, aber erst ein
   neuer Bild-Lauf belegt das.

## 10 Der Richter dieses Kerns (vor dem ersten Lauf eingefroren)

- **Bild:** Weltkarte als PNG (equirektangulär + Orthografie, Relief × Biom, Schummerung) an 5 zufällig gezogenen von 30
  Saaten, plus dieselbe Saat bei 0 / −60 / −250 Ma.
- **Erd-Statistik über ≥ 30 Saaten:** Hypsometrie bimodal (zwei Modi, Tal dazwischen < 1/3 des kleineren Modus) ≥ 90 %;
  Land-Anteil folgt `wasserKm` (Erde-Saat 29 % ± 5); Gipfel > 2,5 km an (jemals) konvergenten Rändern ≥ 95 % (Spike heute
  90–94 %, aktive Ränder allein); Drift 1–15 cm/a; Köppen-Anteile der Erde-Saat gegen Beck 2018; Regenschatten-Gegenlauf.
- **Kosten:** µs je Punkt (Median, V8 und SpiderMonkey), Vorab-ms und -KB je Saat, unabhängig vom Radius (Mond, Erde,
  Super-Erde gleiche Kosten).
- **Bytes:** gleiche Saat → gleicher PNG-Hash auf beiden Engines.
