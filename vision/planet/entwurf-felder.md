# Planet-Kern, Entwurf „felder“ — der Planet als Funktion f(samen, breite, laenge, zeit)

Architekt, Blickwinkel FELDER ZUERST. Stand 14.11.2026. Ein Spike (node, keine Fremd-Pakete, PNG über zlib) hat den Kern
bei t = 0 an fünf Saaten gerechnet; die Zahlen unten sind gemessen, wo nicht „ungemessen“ steht. Spike-Skript (nicht im
Repo): `C:\Users\micha\AppData\Local\Temp\claude\053872f8f4337776\ba8543ef-321d-4cbc-a751-10d7d9cf31c5\scratchpad\planet-felder-v3.mjs`.
Bilder neben diesem Blatt: `entwurf-felder-karte-42.png`, `entwurf-felder-karte-7.png`, `entwurf-felder-karte-11-ohne-freibord.png` (der Fehler, den der Freibord heilt).

## 1. Der Kern in sechs Sätzen

1. Jede Größe des Planeten ist ein **Feld auf der Einheitskugel**: Gradienten-Rauschen in 3D am Punkt p = (x, y, z), keine Naht, keine Pole, Oktaven = Abtast-Dichte (LOD ist die Zahl der Oktaven, die eine Abfrage summiert).
2. **Bimodal statt Gauß**: die Krustenart ist EIN tieffrequentes Feld, durch eine scharfe Schwelle (Quantil aus dem Samen, Breite ±0,015) gezogen — Kontinent und Ozeanboden sind zwei Populationen, nicht zwei Enden einer Glocke; der Schelf ist der Übergangsstreifen.
3. **Platten sind eine Lesart, kein Zustand**: ein gewichtetes, verbogenes Voronoi-Distanzfeld über K Saat-Punkten (K = 10–18 aus dem Samen), jede Platte mit einem Euler-Vektor; aus den zwei besten Werten folgen Abstand zur Grenze, Normale und Konvergenz-Rate in cm/a — geschlossen, je Abfrage.
4. **Ketten statt Flecken**: Relief über 2 km entsteht NUR als Profil quer zur konvergenten Grenze (Kollision, Anden-Bogen, Graben + Inselbogen), längs moduliert durch Grat-Rauschen; der Ozeanboden sinkt mit √Alter vom Rücken (Parsons–Sclater).
5. **Meer und Freibord vorab**: der Meeresspiegel löst das Wasser-Volumen des Samens auf 8 192 flächentreuen Punkten (Fibonacci), und das Kontinent-Innere wird auf Freibord über dieses Meer gehoben (0,25–0,75 km aus dem Samen) — sonst ertrinken oder vergletschern die Kontinente (Bild `…-11-ohne-freibord.png`).
6. **Die Zeit heilt der Felder-Ansatz nicht allein**: er braucht ein **Kinematik-Skelett** von ~150 KB (Euler-Rotationen je Epoche, Kraton-Kappen, Ereignisliste der Kollisionen und Risse), in dessen mitbewegten Rahmen dieselben Felder ausgewertet werden — die Felder bleiben die Gestalt, das Skelett ist die Geschichte.

## 2. Die Datenstruktur

```
Planet = {                                   // = planetAus(samen), unveränderlich, nur Zahlen
  samen: u32,
  koerper: { radiusKm, masseErde, wasserKm, freibordKm, schiefe, tagStunden, sternLeucht },  // aus dem Samen, ~64 B
  kruste:  { schwelle Q, anteilKont },                                  // 16 B
  platten: Float64Array(K × 7)    // Mittelpunkt c (3), Gewicht, Euler-Vektor ω (3)      — K=14: 784 B
  meer0:   f64                    // Meeresspiegel bei t = 0 (km, Planeten-Mittel)
  skelett: {                      // erst für die Zeitachse (Abschnitt 4.7)
    epochen: Float32Array(E × K × 4)   // Quaternion je Platte je Epoche, E ≈ 180 (25 Ma)  — ~46 KB
    kratone: Float32Array(B × 5)       // Kappen-Mitte (3), Radius, Platte@t0, B ≈ 40          — 0,8 KB
    mitglied: Uint8Array(E × B)        // welche Platte trägt den Kraton in Epoche e           — 7 KB
    ereignisse: Float32Array(N × 8)    // Kollision/Riss: t, Ort in beiden Rahmen, Stärke, N ≤ 500 — 16 KB
    meerKurve: Float32Array(E)         // Rücken-Volumen → Meer(t), Eis kommt geschlossen dazu  — 0,7 KB
  }
}
```

Kein Gitter des Planeten, keine Textur, keine Kachel. Der Speicher wächst nicht mit dem Radius und nicht mit der Abfrage.

## 3. Die Signaturen

```js
// Vorab (Sekundenbruchteile, Kilobytes, rein aus dem Samen)
planetAus(samen: u32, optionen?: { koerper?: Partial<Koerper> }) → Planet        // Erd-Saat = Samen + Koerper-Schlüssel, nie Geometrie

// Punkt-Abfragen (Mikrosekunden; p ist der Einheitsvektor, breite/laenge in Grad werden einmal umgerechnet)
punkt(breite, laenge) → [x, y, z]
huelle(P, p, t = 0, oktaven = 12) → km über dem Planeten-Mittel   // die Großform; oktaven = LOD
platte(P, p, t = 0) → { k1, k2, abstandKm, normale[3], konvergenzCmA, art: "kollision"|"anden"|"bogen"|"ruecken"|"riss"|"transform"|"innen" }
kruste(P, p, t = 0) → { kont: 0…1, innen: 0…1, alterMa }          // Ozeanboden-Alter bzw. Kraton-Alter
meer(P, t = 0) → km                                                // Meeresspiegel, global, O(1)
klima(P, p, t = 0) → { tMittel, tJahrAmp, tTagAmp, niederschlagMmA, schneeKm, windRichtung, regenschatten }
biom(P, p, t = 0) → { koeppen: "Af"|…|"EF", whittaker: id }        // reine Lesart aus klima + huelle
vulkane(P, p, radiusKm, t = 0) → [{ ort[3], art: "bogen"|"ruecken"|"hotspot"|"riss", rateKm3Ma, letzterAusbruchA }]
wetterLage(P, p, t) → { druckAnomalie, front, regenWahrsch }       // synoptisch, Feld im mitrotierenden Rahmen (4.6)

// Die Brücke (einmal je Lage, nicht je Punkt)
ortParameter(P, breite0, laenge0, t) → OrtParameter               // Abschnitt 6
```

Zeit `t` in Jahren relativ zur Gegenwart der Saat (t = 0 heute, t < 0 Vergangenheit). Bruchteil = Saison und Uhr:
`saison = frac(t)`, `uhr = frac(t · tageJeJahr)`. Mit f64 trägt ±4,5·10⁹ a noch 2⁻²⁰ a ≈ 30 s Auflösung —
genügt der Uhr nicht unter einer Minute; die Uhr läuft darum als zweiter Parameter `(tJahr: i53, tBruch: f64)`.

## 4. Das Verfahren je Größe

### 4.1 Rauschen und Zufall — byte-gleich auf jedem Gerät
- Zufall: `h32(samen, a, b, c, salz)` aus `Math.imul`/Shift (Philox-Art, ohne Zustand). Ganzzahl-Arithmetik ist in JS auf jedem Gerät bit-gleich.
- **Fallstrick, im Spike noch offen**: `Math.sin/cos/exp/asin/hypot` sind in ECMAScript NICHT bit-genau festgelegt (V8, SpiderMonkey, JavaScriptCore dürfen im letzten Bit abweichen). Der Kern rechnet darum NUR mit `+ − × ÷ Math.sqrt Math.floor Math.fround` (IEEE-genau) und bringt seine eigene `planetMathe` mit: sin/cos als Polynom nach Bereichsreduktion, exp als 2^k · Polynom, atan2 als Polynom. Eine Linse rechnet 4 096 Abfragen in node und im Browser und vergleicht den Hash.
- Gradienten-Rauschen 3D, quintische Glättung, 12 Gradienten; fBm mit Faktor 2,03 je Oktave (keine Gitter-Resonanz); Grat-Rauschen `(1 − |n|)²` für Ketten.

### 4.2 Platten
- K Saat-Punkte c_k auf der Kugel, Gewicht g_k ∈ [0,6; 1,4] (große und kleine Platten), Euler-Vektor ω_k (Pol zufällig, Rate 0,3–1,5 °/Ma).
- `score_k(p) = g_k · (p · c_k) + Verbiegung(p)`; Verbiegung = 0,22 · fBm(p, 5 Oktaven) — ohne sie sind die Grenzen Großkreis-Bögen (im Spike bei 0,10 deutlich sichtbar, bei 0,22 gebrochen, aber noch zu gerade, s. 7).
- Abstand zur Grenze ≈ (s₁ − s₂) / |g₁c₁ − g₂c₂| · R; Normale = tangentiale Projektion von −(g₁c₁ − g₂c₂); Relativ-Geschwindigkeit `(ω₁ − ω₂) × p`, ihre Normal-Komponente ist die Konvergenz (> 0) oder Spreizung (< 0), die Tangential-Komponente die Transform-Bewegung.
- Kosten O(K) Skalarprodukte; ab K > 40 (Super-Erden mit vielen Mikroplatten) ein Ikosaeder-Kandidatenraster (Vorab, ≤ 2 KB), das je Zelle die ≤ 6 möglichen Platten nennt.

### 4.3 Relief (die Hülle)
`H(p) = kont · Land(innen) + (1 − kont) · Ozean(alter) + Rand(art, abstand, konvergenz) + Detail(p, oktaven)`
- Land: Schelf bei Meer − (0,2…0,7) km, Inneres bei Meer + Freibord, dazwischen `innen` (zweite, breitere Schwelle desselben Krustenfelds) — der Kontinentalhang ist der steile Teil der Schwelle.
- Ozean: −(2,6 + 0,33 · √Alter) km; Alter = Abstand zum spreizenden Rand / halbe Rate (Steady-State); am Rücken Grat-Rauschen ±0,25 km.
- Ränder (konvergent, Rate > 0,5 cm/a, Kraft = min(1, Rate/6)):
  - Kontinent beteiligt → Gürtel 5 km · Kraft · Gauß(Abstand − 120 km, 260 km) · Ketten-Faktor (0,45 + 0,55 · Grat-Rauschen).
  - Ozean subduziert → Graben −4 km bei 20 km, Bogen 3,6 km bei 180 km Versatz auf der oberen Platte, gefleckt (Inselbogen).
  - Kontinentaler Riss → Graben −1,2 km, 60 km breit.
- Detail: fBm, Amplitude 0,25–0,85 km nach `innen`; bis zur Oktave, die die Abfrage verlangt (LOD).

### 4.4 Vulkanismus
- Bogen-Vulkane: diskrete Kegel entlang der Bogen-Linie — Kandidat je 40 km Bogen-Länge, Existenz aus `h32(Zelle)`, Kegelprofil mit Krater; abgefragt nur, wenn `platte().art` Bogen oder Anden und der Abstand im Band liegt (sonst 0 Kosten).
- Rücken: Spalten-Vulkanismus als Grat-Rauschen am Rücken (Island, wo ein Hotspot auf einem Rücken sitzt).
- Hotspots: H = 8–40 mantelfeste Punkte aus dem Samen. Die Spur einer Platte über dem Hotspot ist geschlossen: Seamount i liegt bei `R_k(t) · R_k(t − i·Δ)⁻¹ · h`, i = 0…20, Höhe ∝ exp(−i·Δ/τ_Absinken). Je Abfrage nur die Hotspots, deren Spur-Kappe p enthält (Vorab: Kappe je Hotspot).
- Das fließende Magma selbst ist NICHT der Planet: `vulkane()` liefert Ort, Art, Förderrate und letzte Eruption an das Gesetz des Ortes (Lava-Decke, Blatt 01 L2), das die Ströme hangab rechnet.

### 4.5 Meeresspiegel
- Vorab: 8 192 Fibonacci-Punkte, Hülle ohne Detail-Oktaven, Bisektion auf das Wasser-Volumen des Samens (mittlere Tiefe über die Kugel 2,0–3,2 km), dreimal mit Freibord-Kopplung iteriert.
- Über die Zeit: `meer(t) = meer0 + ΔRücken(t) − Eis(t) · 0,0025 km je 10⁶ km³`; ΔRücken aus der mittleren Ozeanboden-Jugend der Epoche (Skelett, Tabelle `meerKurve`), Eis geschlossen aus dem Klima-Antrieb (4.6). Abfrage O(1) + Interpolation.

### 4.6 Klima, Wetter, Biome
- Temperatur: `T = T_äq(L_Stern, Treibhaus(t)) − ΔT_Pol · sin²(Breite) − 6,5 K/km · Höhe über Meer`; Jahres-Amplitude aus Schiefe, Breite und **Kontinentalität** — die ist im Felder-Ansatz gratis: dasselbe Krustenfeld mit nur 2 Oktaven ausgewertet = „wie weit ist das Meer“ (Tiefpass ohne Suche).
- Niederschlag: Zell-Gürtel (ITCZ nass, 25–30° trocken, 45–60° nass, Pole trocken), Gürtel saisonal verschoben mit der Sonnen-Deklination; Wind je Gürtel (Passat Ost, Westwind, polar Ost).
- **Regenschatten**: luvwärts 6 Schritte zu 250 km entlang der Gürtel-Windrichtung, Hülle OHNE Detail-Oktaven; jeder Landschritt trocknet (×0,93), der höchste Kamm davor dämpft exp(−Δh/1,2 km). Das ist die teuerste Zeile des Kerns (6 Hüllen-Abfragen).
- Biome: Köppen-Regeln aus (T-Monate, N-Monate); Whittaker-Index für die Pflanzenwelt.
- Klima über Äonen: Sonnen-Leuchtkraft nach Gough (L(t) = L₀ / (1 + 0,4 · (1 − Alter/Alter₀))), Orbit-Antrieb als Summe von Kosinus-Wellen 23/41/100 ka mit Saat-Phasen, Eis-Volumen als Tiefpass erster Ordnung darüber — **geschlossen gerechnet wie `temperaturFeld` in gelaende-core** (Dämpfung 1/√(1+(ωτ)²), Verspätung atan(ωτ)) — eine Funktion, kein Integrator.
- Wetter (synoptisch, später): Druck-Anomalie = Rausch-Feld im mit dem Westwind rotierenden Rahmen (`R_z(−Ω_Gürtel · t)⁻¹ p`) plus langsame Zeit-Oktave — Tiefs ziehen ostwärts, ohne Zustand.

### 4.7 Die Zeitachse — wo die Felder scheitern und wie sie heilen
Reine Felder kennen keine Geschichte: ein Krustenfeld bei t = −200 Ma, das aus Rauschen anders gezogen wird, ist ein anderer Planet, nicht derselbe in der Vergangenheit. Die Heilung behält die Felder als GESTALT und gibt ihnen einen BEWEGTEN RAHMEN:
- **Kinematik-Skelett (Vorab)**: E ≈ 180 Epochen zu 25 Ma (die letzten 4,5 Ga; vor 1 Ga gröber). Je Epoche ein Euler-Vektor je Platte. Der Superkontinent-Zyklus ist ENTWORFEN, nicht erhofft: alle 300–500 Ma (Samen) wählt der Generator einen Sammelpunkt und Pole, die die Kratone dorthin tragen (Introversion oder Extroversion aus dem Samen), danach Riss entlang der jüngsten Nähte — das Video-Codec-Prinzip aus Blatt 05: Superkontinente sind Schlüsselbilder, die Plattenbahnen die Deltas.
- **Kratone**: B ≈ 40 Kappen kontinentaler Kruste, jede einer Platte je Epoche zugeordnet. Das Krustenfeld wird im **Kraton-festen Rahmen** ausgewertet: `kont(p, t) = max_b Kappe_b(R_b(t)⁻¹ p) · Küstenrauschen(R_b(t)⁻¹ p)` — die Küste bewegt sich starr mit, der Kontinent bleibt erkennbar derselbe.
- **Ereignisse**: ein Vorab-Lauf in Epochen-Schritten prüft Kraton-Paare (40² × 180 ≈ 290 000 Abstands-Tests) und schreibt Kollisionen und Risse in die Liste. Ein Kollisions-Gürtel lebt im Rahmen BEIDER Kratone und zerfällt mit exp(−(t − t_c)/τ_Abtrag), τ = 50–100 Ma — alte Gürtel bleiben als niedrige Rücken (Appalachen-Prinzip).
- **Ozeanboden-Alter**: für Ozean, der aus einem Riss des Skeletts entstand, ist das Alter EXAKT `t − t_Riss` am Rand und wächst zum Rücken hin linear ab — kein Steady-State-Raten mehr.
- Kosten je Abfrage zur Zeit t: Epoche finden O(1), Quaternion-Slerp je Kandidat-Kraton (Vorab-Kappe schneidet auf ≤ 6), Felder wie bei t = 0.
- Gewicht des Skeletts: ~70 KB Daten (Tabelle oben) — **ungemessen**: Vorab-Zeit und tatsächliche Bytes, weil der Spike nur t = 0 rechnet.

## 5. Das Kosten-Modell (gemessen im Spike, node 24, Laptop unter Fremdlast durch andere Arbeiter)

| Größe | gemessen | Begründung |
|---|---|---|
| Vorab t = 0 (Platten, Schwelle aus 8 192 Punkten, Meer in 3 Pässen) | 45–400 ms (5 Saaten; Spreizung = Fremdlast) | 4 × 8 192 Hüllen-Abfragen dominieren; mit 4 096 Punkten und einmal sortierter Volumen-Kurve statt 50 Bisektionen erwartbar halb — ungemessen |
| Vorab-Bytes t = 0 | 800–1 024 B | K × 7 f64 + Schwelle + Meer |
| `huelle` je Punkt, volle Oktaven | 2,3–12,8 µs (Bestwert 2,3; Median der 5 Läufe 4,4) | 6 + 5 + 6 Oktaven Rauschen + K Skalarprodukte + 1–4 Grat-Oktaven am Rand |
| `huelle + klima` je Punkt | 12,9–74 µs (Bestwert 12,9) | + 6 luvwärtige Hüllen-Abfragen ohne Detail |
| Weltkarte 1 024 × 512 auf der CPU | 1,1–6,1 s Hülle + 1,7–6,5 s Klima | 0,52 Mio. Punkte, ein Faden |
| Planetengröße | nicht gemessen; aus dem Verfahren: +1 Oktave je Verdopplung des Radius bei gleicher Boden-Auflösung ≈ +0,3 µs | Kosten ∝ log₂(R / Δ), nie ∝ R² |

Folgen: (a) Der Spieler am Boden zahlt NICHTS je Frame — die Brücke liest den Planeten einmal je Lage (Abschnitt 6). (b) Die Orbit-Ansicht kann nicht je Frame auf der CPU entstehen: eine Würfel-Karte 6 × 256² = 393 000 Punkte ≈ 0,9–1,7 s im Worker, einmal je (Samen, Epoche) — für den Zeitraffer 6 × 128² ≈ 0,3 s je Bild (hochgerechnet, ungemessen). (c) Eine GPU-Fassung derselben Funktion wäre ein Zwilling, solange sie nicht aus derselben Quelle erzeugt und gegen die CPU-Fassung gelinst wird; Entscheidung: CPU-Worker zuerst, GPU nur als generierter Übersetzer desselben Quelltexts.

## 6. Die Brücke zu gelaende-core — kein Zwilling

Heute (gelesen in `gelaende-core.js`): die Großform sind drei glatte Felder (Kontinentalität λ ≈ 9 km, Erosion λ ≈ 3,2 km, Stil) über Splines (`grossform`, ~Zeile 563–600, Regler `land`, `kontinentLambda`, `hoehe` ~Zeile 381); das Klima ist EINE Tafel (`TEMPERATUR`, sommer 18 / winter −4 °C, Höhe gestaucht 0,11 K/m, ~Zeile 1294); das Meer liegt bei Basis − 3 (`LAGE_GRUND.meerUnterBasis`, ~Zeile 2687); das Wetter sind Tafel-Zeilen (`WX_GESETZ`, phyto-core ~Zeile 4088).

Die Teilung nach Frequenzband — EIN Spektrum, zwei Besitzer, nichts doppelt:
- **Der Planet besitzt alles mit Wellenlänge ≥ ~50 km** (Krustenart, Platten-Ränder, Gürtel, Meer, Klima).
- **gelaende-core besitzt alles darunter** — seine bestehenden C- und E-Felder (9 km, 3,2 km) werden die oberen Oktaven DESSELBEN Spektrums, die Flussnetze, Schichten und Höhlen bleiben unberührt.

```js
OrtParameter = ortParameter(P, breite0, laenge0, t) = {
  land:        Kontinentalität des Planeten am Ort, abgebildet auf den C-Versatz (ersetzt den Regler-Wert `land`)
  hoehe:       Relief-Hülle des Planeten (km) / Referenz → Relief-Skala (ersetzt `hoehe`)
  gefaelle:    Gradient der Planeten-Hülle über die Lage (linear; ≤ 2 Zahlen) → additive schiefe Ebene in OFFSET
  hebung:      Konvergenz-Rate am Ort → Faktor auf U (ks = ks₀ · U; aktive Gürtel schneiden steiler ein)
  meer:        meer(P, t) relativ zur Lage → L.waterLevel (bleibt die EINE Quelle im Ort)
  klima:       { sommer, winter, tagAmp, schneegrenze } → ersetzt die Konstanten der TEMPERATUR-Tafel
  wetter:      Anteile klar/regen/sturm je Saison aus niederschlagMmA → Gewichte auf die WX_GESETZ-Zeilen
  biom:        Köppen-Klasse → Erbgut-Wahl der Pflanzen (phyto liest sie)
  vulkane:     vulkane(P, p0, 20 km, t) → Schlote für das Lava-Gesetz des Ortes
  stauchung:   EINE Konstante km → Spiel-Meter (heute 160 m ≙ 3 km); fällt, sobald die Welt Erd-Höhe trägt (Blatt 04 L3·2)
}
```

- **Byte-gleich**: trägt das Erbgut keinen `planet`, liest `netzFuer(L)` die Regler wie heute — keine neue Rechnung, kein neuer Zweig im heißen Pfad. Beweis: Hash von `hoehe(L, x, z)` und `temperatur()` an 4 096 Punkten der Eingangs-Welt vor ↔ nach dem Einbau = gleich (`gate:settlement Teil O` trägt den Plan-Hash schon).
- **Mit Planet**: die Parameter werden EINMAL je Lage (10² km²) gelesen — 1 `ortParameter` ≈ 1 Hülle + 1 Klima + 1 Vulkan-Abfrage ≈ 20 µs je Lage-Wechsel; je Gelände-Punkt 0 zusätzliche Rausch-Abfragen.
- **Naht Ort ↔ Ferne**: über die Sichtweite des Ortes hinaus (18–23 km, Blatt 33) liest der Fern-Ring direkt `huelle(P, p, t, oktaven)` mit wenigen Oktaven. Damit Nah und Fern dieselbe Welt sind, darf gelaende-core unterhalb der Planeten-Grenzfrequenz nur Varianz addieren, deren Mittel über ~50 km null ist — dieselbe Bedingung, die das Rinnen-Detail heute schon hält („kehrt nie ein Gefälle um“).

## 7. Was der Felder-Ansatz NICHT kann (gesehen im Bild, gezählt im Spike)

1. **Gebirge auf den Kontinenten fehlen fast.** Krustenfeld und Plattenfeld sind unabhängig gezogen; die meisten konvergenten Grenzen laufen durch Ozean, daher stehen die Ketten als Inselbögen im Meer, und die Kontinent-Innern sind Tafeln (Bild 42). „100 % der Höhen > 2 km liegen an Konvergenz“ ist eine Tautologie des Verfahrens, KEIN Erd-Beleg. Heilung: die Kopplung des Skeletts (4.7) — Kratone sitzen in Platten, aktive Ränder entstehen dort, wo ein Kraton-Rand auf eine Konvergenz trifft, und alte Nähte tragen Rumpf-Gebirge.
2. **Plattengrenzen bleiben zu gerade.** Gewichtetes Voronoi auf der Kugel erzeugt Großkreis-Bögen; die Verbiegung bricht sie, doch Transform-Versätze (die Treppe der Rücken) fehlen ganz. Heilung: Rücken-Segmente in Grenz-Koordinaten quantisieren (Versatz je 200–600 km aus `h32`) — ein Feld in (Abstand, Längs-Position) statt in p.
3. **Ozeanboden zeigt Platten-Facetten.** Alter nur aus dem Abstand zur EIGENEN Grenze; an Grenzen ohne Spreizung springt die Tiefe (Ringe im Bild 7/42). Heilung: das Riss-Alter aus der Ereignisliste (4.7) — ohne Skelett nicht lösbar.
4. **Inselbögen sind Linien, keine Bögen.** Echte Bögen krümmen sich konvex zum Ozean (Kugelschalen-Geometrie der abtauchenden Platte); das Voronoi kennt keine Krümmung. Heilung: Bogen-Kurve als Kleinkreis um einen Saat-Pol je Subduktions-Segment.
5. **Klimagürtel zu streng zonal.** Kein Ost-West-Unterschied der Kontinente (Monsun, kalte Küstenströme, Westküsten-Wüsten). Heilung: Meeresströmungs-Lesart aus den Becken (Gyre-Richtung je Gürtel + Küstenseite) als Korrektur auf T und N — ungemessen.
6. **Die Zeitachse liegt außerhalb des Felder-Ansatzes.** Ohne Skelett heißt t ≠ 0 ein anderer Planet. Mit Skelett ist der Wilson-Zyklus entworfen, nicht emergent — er wird nie überraschen, wie ein Konvektions-Modell überrascht. Blatt 01 L1·7 (Deckel-, Venus-, Io-Welten aus Masse und Wärme) braucht ein Regime-Gesetz über dem Skelett: ab welchem Wärmefluss bricht der Deckel — der Felder-Kern hat dafür nur den Schalter `regime` aus dem Samen, keine Ursache.
7. **Isostasie, Biegung, Vorland-Becken fehlen.** Keine Senke vor dem Gebirge, keine Schulter am Riss. Heilung: Biege-Profil (Turcotte–Schubert, Biegewellenlänge ~100–300 km) als zusätzliches Profil quer zur Grenze — billig, gleiche Lesart.
8. **Erosion über Zeit ist nur ein exp-Zerfall.** Die echte Abtragung (Flüsse schneiden, Sedimente füllen Becken) ist das Gesetz des ORTES (gelaende-core T2). Auf Planeten-Maßstab gibt es keine Sedimentbecken, keine Deltas.

## 8. Die Erd-Statistik gegen den Spike (t = 0, 5 Saaten: 7, 11, 23, 42, 101)

| Maß | Erde | Spike |
|---|---|---|
| Hypsometrie zweigipflig | Gipfel −4,5 km und +0,1 km | 5/5 zweigipflig; Gipfel (Bin-Mitten, 0,75-km-Bins, relativ zum Meer) −6,1 … −3,1 km und −0,1 … +0,6 km; Abstand 3,0 · 3,7 · 4,5 · 5,2 · 6,7 km — 4/5 im Band 3–6 km von Blatt 01 L1·3, Saat 7 zu tief |
| Land-Anteil | 0,29 | 0,255–0,304 |
| Fläche > 2 km über Meer | ~0,03 der Kugel | 0,021–0,025 |
| Plattenzahl | 7 große + 8 kleine | 14–18 (aus dem Samen 10–18) |
| Meer relativ zur Mitte | — | −1,81 … −0,52 km |
| Gebirge an konvergenten Rändern | ~0,9 | 1,0 — tautologisch (7.1) |
| Klimazonen nach Breite + Regenschatten | ja | zonal ja, Regenschatten luvwärts ja, Ost-West-Asymmetrie nein (7.5) |
| bei 100 Saaten | Blatt 01 L1·3 | ungemessen (5 Saaten gerechnet) |

## 9. Risiken

- Bit-Gleichheit über Browser hängt an der eigenen `planetMathe`; der Spike benutzt `Math.sin/exp` und ist darum NICHT geräte-gleich.
- Die CPU-Karte kostet Sekunden: Orbit und Zeitraffer brauchen einen Worker und Caches je (Samen, Epoche); eine GPU-Fassung ist der Zwilling, den Abschnitt 5c verbietet, solange sie nicht generiert wird.
- Die Stauchung 160 m ≙ 3 km bleibt eine Übersetzung in der Brücke; solange sie gilt, stimmen Planeten-Klima und Orts-Höhenstufen nur relativ.
- Das Skelett ist der Teil mit den meisten Entscheidungen (Sammelpunkt-Generator, Kraton-Zahl, Riss-Regel); dort entscheidet sich, ob 01 L1·6 („Superkontinent in ≥ 50 % der Saaten“) per Bau GRÜN ist oder per Zufall.
