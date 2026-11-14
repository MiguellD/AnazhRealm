# Planet-Kern — Entwurf aus dem Blickwinkel BRÜCKE

Stand 14.11.2026 · Architekt „Brücke" · gelesen an main (Baum `w28-planet-kern`) · kein Code im Repo berührt.
Skizze zum Nachrechnen (nicht Repo): `C:/Users/micha/AppData/Local/Temp/claude/053872f8f4337776/ba8543ef-321d-4cbc-a751-10d7d9cf31c5/scratchpad/planet/planet-skizze.cjs`
(Aufruf `node planet-skizze.cjs <samen> <tMa> <out.png>`), dazu `karte-metrik.cjs`, `gel-kosten.cjs`, `gel-gross.cjs` im selben Ordner.
Bilder dieses Blatts: `entwurf-bruecke-karte-a.png` (Samen „erde-nicht"), `entwurf-bruecke-karte-b.png` (Samen „welt-7"), `entwurf-bruecke-karte-b-m120.png` (welt-7 bei −120 Ma).

## 0 · Der Kern in sechs Sätzen

1. Der Planet ist eine reine Funktion `planet(samen)` → ein Vorab-Satz von ~3 KB (Platten, Euler-Pole, Kraton-Gruppen, Hotspots, Wasser-Inventar, Bahn) und die Abfragen `relief/klima/gestein(p, t, fuss)` mit Kosten O(Platten + Kratone + Hotspots), nie O(Planet).
2. Die Ebene von heute wird die **Mitte einer Würfel-Fläche** einer equi-angularen Würfel-Kugel: Spiel-(x, z) = Karten-Meter (ξ, η) dieser Fläche — dieselben Zahlen, darum kippt am Genesis-Ort kein Byte, und bis 100 km ist der Längenfehler ≤ 1,24·10⁻⁴ (gerechnet).
3. **Bandteilung statt Zwilling:** jede Wellenlänge hat EINEN Besitzer — der Planet ab 32 km, gelaende-core darunter (C 9 km, E 3,2 km, Flussnetz 1 600/400/100 m); der Planet speist gelaende-core über fünf Leitgrößen in `grossform` (Basis-Hülle, Land-Versatz, Relief-Skala, Gestein/Tafel, Meeresspiegel) und über Klima-Zahlen in `temperaturFeld`, `SCHNEE` und `wetterAt`.
4. **Der Kragen** k(d) ist eine Zahl R₀: innerhalb R₀ um den Anker ist das Planet-Gewicht exakt 0 und der Code-Pfad unverändert (byte-gleich), dahinter steigt es glatt auf 1 — R₀ = ∞ heißt „heute", R₀ = 16 km heißt „Genesis und ihre Sicht bleiben, die Welt dahinter ist Planet". Das ist das „bis man es will" — EINE Zahl, kein Flag, kein Zweitpfad.
5. **Die Höhen-Stauchung** s_v = 0,0587 ist aus dem heutigen Gesetz gelesen, nicht gesetzt: `temperaturFeld` kühlt mit 18 K / 162,5 m = 0,1108 K/m (gelaende-core.js:1316), die Luft der Erde mit 0,0065 K/m — der Planet rechnet in wahren Kilometern, die Brücke staucht mit s_v.
6. Breite und Länge kommen aus der Karte (ξ, η → Richtung → φ, λ): sie setzen die Sonne (Deklination aus Achsneigung und Saison, Ortszeit aus λ), die Halbkugel der Saison, die Zirkulationszelle (Passat/Westwind/Polar-Ost) und damit die Zug-Richtung der Fronten.

## 1 · Was heute steht (gelesen, mit Stelle)

| Größe | heute | Stelle |
|---|---|---|
| Großform | drei glatte Felder C (λ 9 km), E (λ 3,2 km), Stil (λ ≈ 5,2 km) + Warp (λ ≈ 3,8 km, ±70 m) → Splines OFFSET −48…+62 m, RELIEF 2…175 m | gelaende-core.js:359–420, 563–594, 1251–1256 |
| Regler | `land` 0,35 · `kontinentLambda` 9 000 · `hoehe` 1 · `rauhLambda` 3 200 · `tafel` 0,5 · `schichtDicke` 26 · `hartAnteil` 0,55 | :381–405 |
| Meeresspiegel | Basis − 3 m, Konstante | :2687, :5630 |
| Klima | gemäßigt-kontinental, Sommer 18 °C / Winter −4 °C am Meer, Tagesgang ±5 °C, Kühlung 0,1108 K/m | :1301–1319 |
| Schnee | Grenze 140 → 185 m über dem Meer + Zungen | :1270–1282 |
| Wetter | `wetterAt(saat, x, z, t)`: drei Sinus-Wellen längs einer Hauptrichtung θ0 aus dem Samen-Hash, Zug 11 m/s | phyto-core.js:4115–4185 |
| Sonne | `sonnenRichtung(winkel)` ohne Breite und Jahr (z = 0,4·sin(w/2)); die Meeus-Bahn fiel an `gate:tag-achse:echt` (Lichtmesser-Sprung 0,15–0,18 EV, Soll 0,1) | welt-licht.js:696–715 |
| Kugel | nur im Himmel: `ATMO_GESETZ.erdeM` 6 360 km — ein Himmel-Boden-Zwilling, den der Planet auflöst (R wird EINE Zahl des Samens) | foundry-core.js:284 |

**Gemessen (node, dieser Laptop, 14.11.):** `hoehe` dicht und warm **0,45 µs/Spalte**; dicht kalt 0,97 µs; **karg (1 km Abstand) kalt 316–402 µs/Spalte** (das Flussnetz baut seine Knoten); karg warm 4,5 µs; `grossform` allein karg **0,48 µs**. Bei ξ = 4 900 km liefert `hoehe` endliche Werte (33,60 m) — das Gesetz trägt die Koordinaten einer ganzen Würfel-Fläche in Float64.
Folge für die Brücke: gelaende-core darf nie karg über Hunderte Kilometer abgetastet werden (316 µs × 10⁵ Proben = 32 s). Der Blick aus der Höhe liest den Planeten und `grossform`, das Netz nur nah.

## 2 · Die Brücke — vier Gesetze

### B1 Die Karte: die Ebene ist die Mitte einer Würfel-Fläche

- Kugel = equi-angularer Würfel: Fläche f ∈ {±X, ±Y, ±Z}, Karten-Meter (ξ, η) ∈ [−πR/4, +πR/4]², Richtung `p = Q · norm(tan(ξ/R), tan(η/R), 1)` (Achsen je Fläche permutiert). Q ist eine Drehung aus dem Samen, gewählt so, dass der **Anker** (φ₀, λ₀) die Mitte der Fläche +Y trifft.
- Spiel-(x, z) ≡ (ξ, η) der Anker-Fläche. Kein Umrechnen, keine neue Koordinate im Code der Welt: gelaende-core rechnet weiter auf x, z; nur der Planet und die Licht-/Himmels-Leser übersetzen (x, z) → p → (φ, λ).
- Metrik (gerechnet, `karte-metrik.cjs`, R = 6 360 km): Maßstab bei 8 km 0,999999; bei (100 km, 100 km) 0,999876 und 11,65 m Abstandsfehler; bei (1 000, 1 000) km 0,98826; am Flächenrand (4 900 km, 0) quer 0,7176. Bis 1 000 km ist die Ebene der Spiel-Physik also auf ≤ 1,2 % wahr; dahinter verzerrt die Karte (B1 kann nicht: siehe §8).
- **Genesis sucht ihren Ort:** der Anker ist kein Erd-Datum, sondern eine Funktion des Samens — unter 64 Kandidaten (Fibonacci-Punkte auf Land) wählt der Planet den, dessen Klima den heutigen Konstanten am nächsten liegt (T_Sommer 18, T_Winter −4, Niederschlag gemäßigt, Abstand zur Küste ≤ 300 km, nicht an einer aktiven Grenze). So bedeutet „die Welt von heute" auf jedem Planeten einen Ort, an dem sie physikalisch stehen könnte.
- Krümmung ist Bild, nicht Gesetz: die Senke d²/2R beträgt 5,0 m bei 8 km, 41,6 m bei 23 km (Kante der heutigen Sicht), 786 m bei 100 km. Sie lebt im Vertex-Schritt des Renderers (relativ zur Kamera), nie in `hoehe` — die Bytes des Gesetzes bleiben.
- Float32 der GPU: bei ξ = 5 000 km ist die Auflösung 0,5 m → der Renderer rechnet kamera-relativ (Ursprungs-Versatz je 4 km), das Gesetz in Float64.

### B2 Bandteilung: jede Wellenlänge hat einen Besitzer

| Band | Besitzer | was |
|---|---|---|
| λ ≥ 32 km | planet-core | Kontinent/Ozean, Schelf, Gebirgsgürtel, Plateaus, Becken, Inselbögen, Hotspot-Ketten, Vulkan-Lagen |
| 24 km > λ ≥ 100 m | gelaende-core | C-, E-, Stil-Feld, Flussnetz 1 600/400/100 m, Schichten, Höhlen |
| 24–32 km | Übergangsfenster: der Planet blendet sein letztes Oktav mit glatt(24, 32, λ) aus; gelaende-core hat dort keine Energie (C hat λ 9 km, Warp 3,8 km) |

Der Planet speist gelaende-core über **fünf Leitgrößen**, je eine glatte Funktion von (x, z), gelesen in `grossform` (gelaende-core.js:565) — dem EINEN Chokepoint, durch den heute Basis-Höhe K, Relief und Hebung fließen:

1. **ΔB — Basis-Hülle:** `off += k · s_v · (H_planet(p) − H_planet(Anker)) · 1000` [m]. H_planet ist die Planet-Höhe ohne Oktaven unter 32 km. Weil `K = base + off + 0,3·rel` das Netz der Ebene 0 lenkt (:590), folgen die Flüsse dem Hang des Planeten von selbst — kein zweites Netz.
2. **Δland — Küste:** `c += k · (Λ(p) − Λ(Anker))`, Λ = Kontinentalität des Planeten (vorzeichenbehafteter Küstenabstand / 150 km, geklemmt ±1,5). Damit die Basis nicht doppelt zählt, wird der erwartete Spline-Wert abgezogen: `off − ō(land_eff)` mit ō aus einer Tafel von 31 Werten (Mittel des OFFSET-Splines über die Verteilung von C, einmal je Regler-Satz gerechnet). Der Planet trägt das Mittel, gelaende-core die Abweichung.
3. **ρ — Relief-Skala:** `rel *= 1 + k · (A(p)/A(Anker) − 1)`, A = tektonische Aktivität (Konvergenz-Rate × Nähe zum Orogen, + Alter der Sutur). Geklemmt auf den Regler-Bereich 0,2…1,6; was darüber geht, trägt ΔB (der Himalaya ist Hülle, nicht E-Feld).
4. **σ — Gestein/Stil:** Gesteins-Klasse des Planeten (Schild · Sediment-Tafel · Vulkanit · Metamorphit) setzt `tafel` (Sediment → hoch, Schild/Orogen → tief), `schichtDicke`, `hartAnteil`; foundry `rockPhenotype` (foundry-core.js:5204) liest dieselbe Klasse — Blatt 01 L5 bekommt seinen ersten Leser.
5. **w — Meeresspiegel:** `waterLevel(t) = −3 + s_v · (S(t) − S(0)) · 1000` [m]. S(t) ist global (EINE Zahl je Zeit), also bleibt die Konstante je Lage eine Konstante; bei t = 0 exakt −3.

Das Netz der Lage (NETZE, :504–558) ist an (Saat, Regler, Basis, Wasser) gekeyt; der Planet geht als (planetSamen, Anker, R₀) in denselben Schlüssel — keine Regler wandern je Spalte, die Leitgrößen sind Felder in `grossform`.

### B3 Der Kragen: byte-gleich am Genesis-Ort, bis man es will

```
k(d) = d ≤ R₀ ? 0 : glatt(R₀, R₁, d)        d = hypot(x, z) (Karten-Meter vom Anker)
```

- In `grossform` (und in `temperaturFeld`, `wetterAt`) steht der Planet-Zweig hinter `if (k !== 0)`. Innerhalb R₀ läuft **dieselbe Folge von Gleitkomma-Operationen** wie heute — kein `+ 0·x`, kein umgestellter Term. Beweis: byte-Diff des Weltbilds an Genesis (gate:pop/Plan-Hash Studio = Welt, `gate:settlement Teil O`) vor ↔ nach dem Einbau bei R₀ = ∞ und bei R₀ = 16 km.
- Stufen: **R₀ = ∞** (Phase 0: der Planet existiert für Karte, Orbit, Klima-Leser; die Spielwelt unverändert) → **R₀ = 16 km, R₁ = 64 km** (Genesis + 8-km-Sicht bleiben; wer 20 km geht, betritt den Planeten) → **R₀ = 0** (der Anker selbst trägt Planet; erst wenn das Bild an Genesis gegen heute als gleich gut oder besser gerichtet ist).
- Weil ΔB, Δland usw. als Differenz zum Anker formuliert sind, ist der Kragen-Rand stetig: bei d = R₀ ist die Differenz klein (glatte Planet-Felder ab 32 km), und glatt() blendet sie ohne Knick.

### B4 Die Höhen-Stauchung: EINE Konstante, aus dem Gesetz gelesen

- Heute: Schneegrenze 162,5 m bei 18 °C → 0,1108 K/m. Wahr: 6,5 K/km → **s_v = 0,0065 / 0,1108 = 0,0587** (Faktor 17).
- Der Planet rechnet wahre Kilometer (8,8-km-Gipfel, 11-km-Gräben, 2,5-km-Rücken); die Brücke multipliziert jede Höhe mit s_v (ein 8,8-km-Gipfel wird 517 m Spielhöhe) und jede Temperatur-Kühlung bleibt 0,1108 K/m. Breiten-Temperatur, Saison-Amplitude, Niederschlag sind ungestaucht.
- s_v ist die einzige Stelle, an der „Spiel" und „Planet" verschieden messen. s_v → 1 (wahre Berge) ist eine spätere Entscheidung des Schöpfers: er verlangt, dass OFFSET/RELIEF-Splines, SCHNEE und `TEMPERATUR` aus s_v abgeleitet werden statt Konstanten zu sein — dann ist es dieselbe eine Zahl.

## 3 · Datenstruktur (Vorab, eine Funktion des Samens)

| Feld | Inhalt | Größe |
|---|---|---|
| `bahn` | R (0,3–1,8 R_E), g, Tageslänge, Jahreslänge, Achsneigung ε, Exzentrizität, Präzessions-/Neigungs-Perioden + Phasen (Milankovitch) | 16 Zahlen |
| `epochen[]` | je Platten-Epoche (Dauer 150–300 Ma aus dem Samen, ~20 Epochen für 4,5 Ga): Start-Zeit, N_p Platten {Zentrum c, Gewicht w, Euler-Pol a, Rate r}, Kraton-Zuordnung | 20 × 16 × 8 Zahlen ≈ 20 KB (Float64) |
| `kratone[]` | 4–8 Kraton-Gruppen, je 6–14 Teilchen {p₀ im Platten-Rahmen, Radius}; Lage zu jedem Epochen-Start (vorab integriert) | 60 × 20 × 4 Zahlen ≈ 38 KB |
| `suturen[]` | wo Kratone verschiedener Platten sich nahe kamen: {Lage, Zeit, Stärke} — das Gedächtnis alter Gebirge (Appalachen-Prinzip), in 6×8×8 Würfel-Eimern | ≤ 400 × 5 Zahlen ≈ 16 KB |
| `hotspots[]` | 8–40 Plumes, im Mantel-Rahmen fest {Lage, Stärke, Start, Ende} | ≤ 40 × 5 |
| `wasser` | Füllgrad der Becken (Samen) → Inventar in km Schicht | 1 |
| `meer[]` | S(t) je 1 Ma über 4,5 Ga, aus der Volumen-Gleichung + Eis-Volumen | 4 500 Zahlen = 36 KB |
| `klimaReihe[]` | globales ΔT(t), CO₂-Antrieb, Eis-Volumen je 1 Ma (0-d-Energie-Bilanz mit Eis-Albedo-Hysterese, vorab integriert) | 3 × 4 500 = 108 KB (Float64) / 54 KB (Float32) |
| `anker` | (φ₀, λ₀), Drehung Q | 13 Zahlen |

Summe ≈ 0,25 MB bei Float64; als Float32/Int16 quantisiert ≈ 0,1 MB. Die Skizze trägt nur Epoche 0: **2 920–2 952 B, Vorab 0,45–0,77 ms**.

## 4 · Signaturen

```js
// planet-core.js — rein, deterministisch, THREE-frei, ohne Wanduhr. Alle Winkel rad, Höhen km, Zeit Ma (0 = heute, < 0 Vergangenheit).
planet(samen: string) -> Planet                                   // Vorab, memoisiert je Samen
richtung(P, flaeche: 0..5, xi: m, eta: m) -> p: [x,y,z]            // Karte -> Kugel (B1)
karteVon(P, p) -> { flaeche, xi, eta }                              // Kugel -> Karte
breiteLaenge(P, p) -> { phi, lambda }
tektonik(P, p, t) -> { platte, nachbar, grenzAbstandKm, konvergenzCmJ, art: "konv"|"div"|"trans", alterBodenMa, kruste: 0..1 }
relief(P, p, t, fussKm) -> { h: km, huelle: km /* ohne Oktaven < 32 km */, aktiv: 0..1, gestein: "schild"|"sediment"|"vulkanit"|"metamorphit" }
vulkane(P, flaeche, xiMin, etaMin, xiMax, etaMax, t) -> Array<{ xi, eta, art: "bogen"|"hotspot"|"rift"|"trapp", foerderung, alterMa }>
meer(P, t) -> km                                                    // S(t)
klima(P, p, t, saison, hKm) -> { tJahr, tSommer, tWinter, niederschlagMmJ, windAus: [x,y,z], zelle: "hadley"|"ferrel"|"polar", schneeKm }
biom(P, p, t) -> { klasse /* Whittaker × Köppen */, eis: 0..1 }
sonne(P, phi, lambda, t, saison, uhrGlobal) -> { richtung: [x,y,z], deklination, ortsZeit }
// die Brücke — der EINE Leser in gelaende-core (grossform, temperaturFeld) und phyto-core (wetterAt)
ortLeit(P, x, z, t, kragen: { R0, R1 }) -> { k, dB_m, dLand, rho, gestein, wl_m, tSommer, tWinter, schneeVersatz_m, thetaFront, stufenVersatz, saisonVersatz, uhrVersatz }
```

`ortLeit` ist die einzige Funktion, die gelaende-core und phyto-core rufen. Sie liefert bei k = 0 ein festes Objekt `LEIT_NULL` (alle Differenzen 0) und der Aufrufer nimmt den heutigen Pfad.

## 5 · Verfahren je Größe

**Platten.** Je Epoche N_p = 8–20 Zentren (Samen-Hash, Fibonacci-jitter), Zelle = gewichtetes sphärisches Voronoi mit 3D-Warp (Amplitude 0,09 rad, λ ≈ R/3) → unregelmäßige Grenzen. Für Punkt p: nächste und zweitnächste Platte, Grenzabstand b = (d_j − d_i)/2, Relativgeschwindigkeit (ω_i − ω_j) × p, Normale = Tangential-Anteil von c_j. Konvergent / divergent / transform nach dem Vorzeichen. Kosten O(N_p) Skalarprodukte. **Lehre aus der Skizze (−120 Ma):** ordnet man Kraton-Teilchen einzeln der Platte zu, in deren Zelle sie liegen, zerreißt die Drift Kontinente in Kappen (Bild b-m120). Darum gehört eine Kraton-Gruppe **ganz** einer Platte je Epoche; die Plattenzentren der Kontinent-Platten sitzen auf den Gruppen-Schwerpunkten; ein Kontinent zerbricht nur an einer Epochen-Grenze als benanntes Rift-Ereignis (die Gruppe wird geteilt, die Teile bekommen eigene Pole).

**Kontinente.** Kruste c(p) = glatte Vereinigung der Kraton-Kappen (zur Zeit t: Teilchen um ihren Pol gedreht) + Rand-Rauschen (λ R/6). Neue Kruste an Bögen (Akkretion: Suturen und Bögen hinterlassen dauerhaft c > 0 nach ihrem Ende) — so wächst das Land über Äonen.

**Relief.** h = Ozean-Tiefe aus dem Alter (Halbraum-Kühlung: −(2,6 + 0,33·√Alter[Ma]), Deckel −6,4 km) für c = 0, Kontinent-Niveau +0,25…+1,15 km für c = 1, dazu Grenzprofile: Konvergenz kontinental → Orogen 180 km hinter der Grenze, Höhe ∝ Rate (bis +4,2 km in der Skizze, Plateau bei Kontinent-Kontinent); ozeanisch → Graben −3,2 km + Inselbogen 200 km dahinter; divergent kontinental → Grabenbruch −1,2 km; Suturen alter Epochen mit exp(−Alter/100 Ma); fBm-Detail mit Amplitude ∝ Aktivität. **LOD = Oktavenzahl** = log₂(1/(4·fuss)) bis zum Band-Ende 32 km — Orbit und Boden lesen dieselbe Funktion, nur dichter.

**Vulkanismus.** Bögen: Kandidaten auf einem gejitterten Würfel-Gitter (50-km-Zellen), behalten, wo die Kandidaten-Lage 150–220 km hinter einem konvergenten ozeanischen Rand liegt. Hotspots: die Spur eines Plumes auf Platte i ist ein Kleinkreis-Bogen um ihren Pol — für p **analytisch**: Breite um den Pol (asin(p·a) gegen asin(h·a)) und Bahnwinkel → Alter τ = Winkel/Rate; Höhe ∝ exp(−τ/25 Ma), Inseln entlang der Spur (Hawaii-Emperor-Prinzip, in der Skizze sichtbar als Punkt-Ketten). Trapps (große magmatische Provinzen): seltene Ereignisse je Epoche, Fläche 10⁵–10⁶ km², hinterlassen Basalt-Plateau und Klima-Spitze in `klimaReihe`. **Das fließende Magma ist nicht Planet:** `vulkane(...)` liefert Lage, Art, Förderrate, Alter für die Kachel unter dem Spieler; das Lava-Gesetz von gelaende-core (`LAVA`, `lava`, `glutAus`, exportiert :7534–7537) baut Kegel, Strom und Röhre als Ort-Term im Erbgut (wie `termY`, :2790) — der Planet sagt WO und WIE STARK, der Ort sagt WIE ES FLIESST.

**Meeresspiegel.** S(t) löst ∫ max(0, S − h) dA = V_Wasser(t) − V_Eis(t) über Fibonacci-Proben (Skizze: 12 000 Proben, Bisektion 50 Schritte, **101–290 ms** je Zeit). Eustasie entsteht von selbst: junge Rücken (schnelle Spreizung) heben den Boden → S steigt (Kreide-Meere), Eis senkt S. Vorab je 1 Ma in `meer[]`, dazwischen linear, Milankovitch-Eis analytisch obendrauf.

**Klima.** Jahresmittel aus der Einstrahlung (Legendre-2 mit Achsneigung, für die Erde 28 °C Äquator / −15 °C Pol), − 6,5 K/km × Höhe, + ΔT(t) aus `klimaReihe`. Saison-Amplitude ∝ |sin φ| × Kontinentalität. Wind nach Zelle (|φ| < 30° Passat aus Ost, 30–60° Westwind, > 60° polar Ost; Zellbreite skaliert mit der Rotation nach Held-Hou — fremde Planeten bekommen andere Gürtel). Niederschlag = Zonal-Profil (ITCZ nass, 25° trocken, 50° nass, Pol trocken) × Feuchte luvwärts (6 Schritte à 300 km gegen den Wind, Meeres-Anteil gewichtet) × Regenschatten exp(−(max. Hindernis − eigene Höhe)/1,8 km).

**Biome.** Whittaker-Tafel (T_Jahr, Niederschlag) + Eis (T < −10 °C), Hochgebirge über Schnee-Höhe; Köppen-Klasse daneben für die Statistik (Richter: Klimazonen nach Breite und Regenschatten).

**Zeit.** t in Ma, Gleitkomma. Epoche e(t) per Binärsuche, Teilchen = Rot(Pol, Rate·(t − Start_e)) der vorab integrierten Startlage — der Sprung zu jeder Zeit kostet O(log Epochen) + die Punkt-Abfrage, nie das Nachrechnen der Geschichte. Klima über Äonen: die Hysterese (Schneeball-Erde) ist vorab als Zeitreihe je 1 Ma integriert; darunter Milankovitch (41 ka, 23 ka, 100/405 ka) analytisch. Die Uhr des Spiels (`saison`, `uhr`) bleibt die Zeit unter 1 Jahr.

## 6 · Die Brücke im Detail — was gelaende-core und die Welt künftig lesen

| Leser | heute | künftig (k > 0) | am Genesis-Ort (k = 0) |
|---|---|---|---|
| `grossform` off/K (:572–590) | Spline aus C | + s_v·ΔH_Hülle − ō-Korrektur | unverändert |
| `grossform` c (:572) | Rauschen + `land` | + Δland(Λ) | unverändert |
| `grossform` rel (:575) | Spline × `hoehe` | × ρ | unverändert |
| `tafel`, `schichtDicke`, `hartAnteil` | Regler-Vorgabe | aus Gestein des Planeten | Regler-Vorgabe |
| `waterLevel` (:2696) | Basis − 3 | − 3 + s_v·(S(t) − S(0)) | −3 bei t = 0 |
| `TEMPERATUR.sommer/winter` (:1301) | 18 / −4 | + k·(T_planet − T_Anker) | 18 / −4 |
| `SCHNEE.start/voll` (:1268) | 140 / 185 m | + k·ΔT_Sommer / 0,1108 | 140 / 185 |
| `wetterAt` θ0 (phyto :4171) | Hash des Samens | Wind-Richtung der Zelle an φ | Hash |
| `wetterAt` Stufen | fest (sturm 0,79 …) | verschoben, sodass die Regen-Tage-Quote dem Planet-Niederschlag folgt; Wüste → klar, Tropen → Konvektions-Zeilen an die Uhr gekoppelt | fest |
| `saison` | global | + 0,5 auf der Südhalbkugel | unverändert (Anker nördlich) |
| `uhr` | global | Ortszeit = uhr + (λ − λ₀)/2π | unverändert |
| `sonnenRichtung` (welt-licht :708) | ohne Breite | Meeus aus φ, ε, Saison | **kippt** — siehe §8 |
| `ATMO_GESETZ.erdeM` | 6 360 km | R des Planeten | 6 360 km, solange der Anker-Samen R so setzt (Erd-Vorgabe der Saat „anazh-realm-seed") |

**Orbit → Boden (drei Bereiche nach Abtastdichte f):**
- f ≥ 8 km: nur `relief(P, p, t, f)`; Kosten Skizze 5–9 µs/Punkt (unoptimiert, s. §7).
- 400 m ≤ f < 8 km: `relief` + `grossform` (0,48 µs gemessen) — die Bänder darunter (Netz) liegen unter der Nyquist-Grenze und fallen, wie jede LOD sie fallen lässt. Kein zweites Gesetz: dieselbe `grossform`, nur ohne die feineren Terme.
- f < 400 m: volles `hoehe` (0,45 µs warm, 1 µs dicht kalt). Das Netz wird nur im Umkreis des Spielers gebaut; **der Netz-Speicher (`N.knoten`, `N.zellen` als Map je Lage) wächst heute mit der begangenen Fläche** — auf einem Planeten muss er nach Kacheln verdrängt werden (LRU je 1 600-m-Zelle), sonst bindet er Kosten an die Reise, nicht an den Schirm.

**Reisen über den Horizont.** Innerhalb einer Würfel-Fläche läuft der Spieler in Karten-Metern weiter; die Ebene trägt bis 1 000 km ≤ 1,2 % Maßstab-Fehler. Am Flächenrand wechselt die Karte: ein Saum von 8 km, in dem beide Flächen gerechnet und mit glatt() gemischt werden (Kosten × 2 im Saum, Saum-Anteil an der Fläche ≈ 4·8 km / 10 000 km = 0,3 %). Teleport/Orbit-Abstieg: Ziel-(φ, λ) → Fläche + (ξ, η) → Ankunft wie heute an einem neuen Ort (gemessen wird die Ankunft, PFLICHT-OFFEN B).

**Breite/Länge für Sonne, Jahreszeit, Wetter.** φ setzt Deklinations-Umfang (±ε), Tageslänge, Mitternachtssonne, die Zelle und damit Wind und Front-Richtung; λ setzt nur die Ortszeit. Der Saison-Versatz der Südhalbkugel ist eine Konstante je Ort (k-gewichtet nicht nötig: an der Äquator-Linie springt die Saison um ½ — weich mischen über ±5° Breite, sonst Naht im Schnee).

## 7 · Kosten-Modell (gemessen in der Skizze, node 24, ein Faden, dieser Laptop)

| Posten | Samen „erde-nicht" (R 5 099 km, 13 Platten, 26 Teilchen, 10 Hotspots) | Samen „welt-7" (R 8 449 km) | woran gebunden |
|---|---|---|---|
| Vorab Epoche 0 | 0,77 ms, 2 920 B | 0,45 ms, 2 952 B | Samen |
| Meeresspiegel je Zeit | 154 ms (12 000 Proben) | 102 ms | Proben-Zahl, nie R |
| `relief` je Punkt | 8,1 µs | 5,2 µs | O(N_p² für Alter + Teilchen + Hotspots + Oktaven) |
| `klima` je Punkt | 38 µs | 27 µs | 6 Relief-Abfragen luvwärts |
| Weltkarte 720 × 360 | 9,7 s | 9,2 s | Pixel (≈ 50 µs/Pixel inkl. Klima und Hangschatten) |
| Determinismus | dieselbe Abfrage zweimal: gleich | gleich | — |

Bei −120 Ma (welt-7) wurden 21 µs/Relief und 70 µs/Klima gemessen — Ursache ungemessen (Last am Gerät oder die Drehung je Teilchen); vor dem Bau neu messen.
**Unabhängig von R:** die R-Spanne 5 099 ↔ 8 449 km ändert die Abfrage-Kosten nicht nach oben (8,1 → 5,2 µs); keine Schleife läuft über Fläche. **Der teuerste Posten ist das Alter:** O(N_p) Grenzen je Punkt mit je einer Rotation — vorab je Plattenpaar die divergenten Paare listen (≤ 3 N_p) halbiert ihn (Ziel, ungemessen). Klima je Punkt fällt, wenn die Luv-Feuchte auf einer groben Tafel (6 × 32 × 32 Zellen je Epoche, 6 144 × 2 B = 12 KB) vorab liegt: dann 1 Relief + 1 Tafel-Abfrage (Ziel ≈ 6 µs, ungemessen).
**Am Boden** fragt die Brücke `ortLeit` nicht je Spalte, sondern je Kachel 2 048 m an 4 Ecken + bikubisch (die Leitgrößen sind ab 32 km glatt): bei 0,45 µs/Spalte gelaende-core und 4 × ~40 µs je Kachel mit ~4·10⁶ Spalten bleibt der Planet-Anteil am Boden < 0,01 % (gerechnet aus den gemessenen Einzelkosten, als Ganzes ungemessen).

## 8 · Was dieser Ansatz NICHT kann (ehrlich)

1. **Die Sonne bleibt nicht byte-gleich.** Breite heißt Meeus; die heutige `sonnenRichtung` hat keine Breite. Die Bahn fiel am Lichtmesser (welt-licht.js:701–707, w28-nacht-licht OFFEN). Der Planet liefert φ und ε; die Sonne des Spiels kippt erst, wenn der Messer den Wurf der Waldkante stetig liest. Bis dahin hat der Genesis-Ort eine Sonne ohne Breite — ein benannter Zwilling von Himmel und Planet, der stehen bleibt.
2. **Würfel-Flächen-Ränder verzerren die Ebene:** quer bis 0,72 (gerechnet) — gelaende-cores Felder (C 9 km, Netz 1 600 m) werden dort bis 39 % gedehnt. Die Brücke heilt das nicht; erst ein Gelände-Gesetz, das die Metrik liest (λ_lokal = λ·Maßstab), oder lokale Karten je Region.
3. **Flüsse über Flächen-Säume** sind nicht garantiert: das Netz entwässert je Fläche; im 8-km-Saum mischt es Höhen zweier Netze. Ein Fluss, der über eine Würfel-Kante läuft, kann im Saum eine Senke treffen.
4. **Wahre Höhen am Boden** gibt es nur mit s_v → 1, und das ändert die Spline-Knoten, SCHNEE und `TEMPERATUR` — dann kippt jede Spalte außerhalb des Kragens; innen nur, wenn R₀ fällt.
5. **Kontinental-Drift in der Spielzeit** (Minuten) ist 0: t ist Ma; die Spielwelt ruht in der Plattenbewegung (1–15 cm/Jahr). Beben und Ausbruch sind Ereignisse des Ortes, nicht Drift.
6. **Plattenzahl, Superkontinent-Zyklus, Land-Anteil sind ungemessen gegen die Erde.** Die Skizze trifft Land 9–17 % (Erde 29 %), Hypsometrie bimodal (Gipfel −4…−3,5 km und 0…+0,5 km relativ zum Meer bei „erde-nicht"); dass sich Superkontinente bilden, ist bei Zufalls-Polen nicht garantiert — es braucht eine Anziehung zum Geoid-Tief (ein Gesetz, keine Zahl), offen.
7. **Wetter bleibt Front-Bänder** mit Planet-Richtung und Planet-Quote — kein Druckfeld, keine Zyklone. Der Planet hebt `wetterAt` auf richtige Richtungen und Häufigkeiten, nicht auf Synoptik (Blatt 04 L1 Sprosse 3+).
8. **Bit-gleich auf jedem Gerät** hält nur, wenn planet-core keine Math.sin/cos/acos/atan2/exp nutzt: V8 und SpiderMonkey rechnen sie mit fdlibm, JavaScriptCore nicht verbindlich. Die Skizze nutzt sie (nur Skizze); der Kern braucht eigene Polynome (nur + − × ÷ √ floor sind IEEE-754-exakt). Gilt auch für gelaende-core heute (Math.sin im Flussnetz und `wetterAt`) — ungemessen über Browser.

## 9 · Risiken

- **Kragen-Rand im Bild:** zwischen R₀ und R₁ ändert sich die Basis um s_v·ΔH; bei einem Orogen-Rand 100 km entfernt kann das 100–200 m Spielhöhe über 48 km sein (gerechnet aus s_v und 3 km Planet-Unterschied) — sichtbar als langer Hang. Richter: Bildpaar an der Kragen-Kante.
- **Anker ohne Treffer:** liefert ein Samen kein Land mit gemäßigtem Klima, gibt es keinen Ort für „die Welt von heute" — dann wählt der Anker den nächsten und k = 0 macht ihn trotzdem byte-gleich; das Klima-Gefälle am Kragen wird dann steil.
- **Netz-Speicher auf Reisen** (s. §6): ohne Verdrängung wächst der Haupt-Faden-Speicher je begangenem km² — heute ungemessen.
- **Karten-Kosten:** 9–10 s für 720 × 360 auf einem Faden (Skizze). Die Orbit-Ansicht braucht Worker-Teilung oder GPU-Port derselben Funktion (WGSL) — ein GPU-Port ist eine zweite Ausführung desselben Gesetzes und muss per Byte-/Toleranz-Diff gegen die CPU gehalten werden, sonst ist er ein Zwilling.
- **Ankunft (PFLICHT-OFFEN B):** der Planet darf die kalte Ankunft nicht verlängern. Vorab < 1 ms Epoche 0, aber Meeresspiegel 100–150 ms und alle Epochen (~20) + Klima-Reihe ungemessen → vorab im Worker oder nur bei Bedarf (t ≠ 0 braucht `meer[]`; t = 0 braucht nur S(0), und das liefert bei k = 0 niemand).

## 10 · Bau-Folge für den Macher (eine Abgabe je Stufe, jede mit Bild)

1. **planet-core.js Epoche 0** (Platten, Kruste, Relief, Hotspots, Meer, Klima, Biome) + `karte.cjs` (CPU-PNG über zlib) — Richter: Weltkarte für ≥ 30 Samen, Land-Anteil, Hypsometrie-Bimodalität, Gebirge an konvergenten Rändern (Anteil Hochland ≤ 500 km von konvergenter Grenze), Klimazonen-Breite; eigene Trig-Polynome; byte-Hash der Karte auf zwei Engines.
2. **Epochen + Zeit** (Kraton-Gruppen ganz je Platte, Rift-Ereignisse, Suturen, `meer[]`, `klimaReihe[]`) — Richter: Karten bei 0, −300, −600 Ma, Drift 1–15 cm/Jahr, Superkontinent-Phase in ≥ 50 % von 50 Samen.
3. **Brücke R₀ = ∞**: `ortLeit` + die fünf Leitgrößen hinter `k !== 0` in `grossform`, `temperaturFeld`, `SCHNEE`, `wetterAt`; Netz-Verdrängung — Richter: byte-Diff Genesis = 0, Plan-Hash Studio = Welt unverändert.
4. **R₀ = 16 km**: Bildpaar am Kragen, Reise 50 km über die Kante, p95 am Profi-Band; Krümmung im Vertex-Schritt.
5. **Orbit-Abstieg** über die drei LOD-Bereiche; Sonne mit Breite erst nach dem Lichtmesser.

## Bilder dieses Entwurfs

- `entwurf-bruecke-karte-a.png` — „erde-nicht", 0 Ma: Plattengrenzen und Rücken im Ozean, Grabenbruch und Schelf, Eis an beiden Polen; Land 16,7 %, Meer −0,31 km.
- `entwurf-bruecke-karte-b.png` — „welt-7", 0 Ma: Orogen längs des Kontinentrands an einer konvergenten Grenze, Wüsten im Passat-Gürtel, Wald im Westwind; Land 9,5 %.
- `entwurf-bruecke-karte-b-m120.png` — „welt-7", −120 Ma: die Drift ist sichtbar, und sichtbar ist auch der Fehler, den §5 benennt (Kontinente zerfallen in Kappen, weil Teilchen einzeln Platten folgen).
