# ENTSCHEID — `planet-core.js`: Scholle, Schlüsselbild, Rand

Stand 14.11.2026 · Blatt des Entscheiders · kein Code berührt.
Gelesen: die fünf Entwürfe dieses Ordners (voll), die drei Urteile, `REGELN.md`, die Blätter 01 · 04 · 05 · 32 · 33 (Leitern und
HEUTE), `gelaende-core.js` an main im Baum `w28-planet-kern` (359–420 Regler und Splines, 560–600 `grossform`, 1262–1325 `SCHNEE`
und `TEMPERATUR`, 1548 Abflussspende, 2687–2698 die Lage ohne Wirt, Export 7463–7540), `phyto-core.js` 4089–4190 (`WX_GESETZ`, `wetterAt`).
Angesehen mit dem eigenen Auge: `bild-platten/karte-kepler-22.png`, `entwurf-felder-karte-7.png`, `entwurf-faul-saat1-t300.png`,
`entwurf-zeit-karte-t0.png`.

Jede Zahl in diesem Blatt trägt ihre Herkunft: **gemessen** (mit Spike), **gerechnet** (aus Gemessenem), **Literatur** (vom Macher
vor dem ersten Lauf gegen die Quelle zu prüfen und einzufrieren) oder **Schwelle** (die Annahme-Zahl, an der ein Bau-Schritt
gerichtet wird). Alles andere heißt ungemessen.

---

## 0 Der Entscheid

**EINE Architektur: das Raum-Gesetz von PLATTEN auf der Zeit von ZEIT, mit dem Gesicht von FELDER, dem Gedächtnis von FAUL als
Kilobyte-Tafel und der Naht von BRÜCKE.**

| | Entscheid | Ursache in Zahlen |
|---|---|---|
| E1 | **Raum = PLATTEN.** Die Kette Scholle → Platte → Rand → Relief → Klima ist das Gesetz. | Einziger Entwurf mit gemessener Kostenkurve über die Plattenzahl: 6,26 · 5,02 · 5,11 · 7,03 µs bei 8 · 16 · 24 · 48 Platten (flach), 3,26–3,58 µs im Karten-Lauf (gemessen, Spike Platten). Kein Gitter über die Kugel. Zwei von drei Urteilen. |
| E2 | **Zeit = Schlüsselbilder (ZEIT), nicht Epochen.** Die Epochen-Tafel von PLATTEN mit Grenz-Sprüngen, ±2-Ma-Überblendung und dem Kraton-Lauf fällt. | Der Kraton-Lauf (4 500 Schritte × K²/2 Paare ≈ 2·10⁶ Tests, gerechnet) ist ungemessen. Der Plan von ZEIT ist gemessen: 1,9–13,6 ms und 7 760–9 528 B für −4 000 … +1 000 Ma, die Scheibe 0,1–2,4 ms, der Sprung nach −4 Ga kostet wie der nach −4 a. |
| E3 | **Gedächtnis = Tafel im Schollen-Rahmen, nicht Strahl je Punkt.** Der Gauss-Laguerre-Strahl von ZEIT fällt. | Der Strahl kostet gemessen +5–8 µs je Punkt (9,2 → 14,1–17,0 µs), die Karte 1024×512 läge bei 7,3 s (gerechnet). Weil die Kollisionen per Bau in den versammelten Schlüsselbildern stehen, ist die Naht-Liste geschlossen aus dem Plan ableitbar; der Punkt zahlt dann nur den Vergleich mit den Einträgen SEINER Scholle. Kosten ungemessen, Schwelle in bau1. |
| E4 | **Gesicht = FELDER.** Küste als Rausch-Schwelle im Schollen-Rahmen, Schelf als zweite Schwelle, Kopplung Meer ↔ Freibord, Grat-Rauschen, Versatz-Treppe der Rücken. | FELDER trägt das beste Bild der fünf (Urteile 6–7 von 10) und die erdnächste Statistik: Land 25,5–30,4 %, zweigipflig 5/5, Gipfel-Abstand 4/5 im Band 3–6 km (gemessen). PLATTEN allein: Land 17,4–28,0 % bei festem Spiegel, Bild 5. |
| E5 | **Ozeanboden = GDH1 mit Alter aus der Öffnung (FAUL + FELDER-Skelett).** | Steady-State-Alter riss in drei Spikes: Ozean-Gipfel −6,0 … −6,5 km (ZEIT, ROT), mittleres Alter 106 Ma statt ~64 (FAUL), Facetten (PLATTEN, FELDER). |
| E6 | **Brücke = Kragen auf der Würfel-Fläche (BRÜCKE), mit Pflichtfeldern ohne Rückfall (PLATTEN, ZEIT).** In diesem Lauf als Funktion geliefert, nicht verdrahtet. | s_v = 0,0065 / 0,1108 = 0,0587 ist aus dem Gesetz gelesen (`gelaende-core.js` 1316: 18 K / 162,5 m). Maßstab-Fehler bis 100 km ≤ 1,24·10⁻⁴ (gerechnet, Entwurf Brücke). |

**Nicht genommen, mit Ursache:**
- Der Gitter-Schnitt von FAUL (2,4 MB je Schlüsselbild, 128–2 606 ms): bricht „Kilobytes, Sekundenbruchteile“.
- Die Vorab-Reihen je 1 Ma von BRÜCKE (`meer[]`: 4 500 × 102–154 ms = 7,7–11,6 Minuten je Samen, gerechnet).
- Unabhängig gezogene Felder (FELDER ohne Skelett): die Ketten stehen im Meer, t ≠ 0 ist ein anderer Planet.
- Eine Luv-Feuchte-Tafel (BRÜCKE) und ein GPU-Port: beides wäre eine zweite Ausführung desselben Gesetzes.

**Die Bedingung aus Urteil 3 gilt und ist die Annahme von bau1:** der Sieg von PLATTEN steht erst, wenn das neue Bild mindestens
wie `entwurf-felder-karte-7.png` als Planet liest (Bildpaar, §5).

**Das eigene Auge an den Spikes:** kepler-22 (PLATTEN) zeigt kreisförmige Schollen mit geraden Schnittkanten und Klima in harten Stufen;
Karte 7 (FELDER) zeigt Schelf, Inseln, gezackte Küsten, aber gerade Linien quer durch Land und Meer; t300 (FAUL) zeigt als
einziges einen Superkontinent mit Naht-Gürteln im Inneren; t0 (ZEIT) ist 360×180 mit braunen Klecksen. Kein Bild trägt allein.

---

## 1 Die Architektur

Der Planet ist `f(samen, breite, laenge, zeit)` in vier Stufen; nur die unterste läuft je Punkt.

```
Plan(samen)            eifrig, ms, KB     Körper, Schollen, Schlüsselbilder, Gruppen, Hotspots — die ganze Zeitachse
 └ Abschnitt(plan, i)  faul, Memo         was zwischen zwei Schlüsselbildern fest ist: Pole, Paar-Tafel, Gedächtnis bis hierher
    └ Scheibe(plan, t) je Bild/Sprung     Lagen, Stätten, Winkelgeschwindigkeiten, Reife, Hotspot-Ketten, Meer(t)
       └ Punkt(scheibe, p, fuss)  µs      Kruste → Platte → Rand → Relief → Vulkan; Klima und Biom lesen denselben Punkt
```

1. **Schollen** (Kraton-Lappen, 20–40 aus dem Samen) sind die dauerhaften Atome der Kruste; jede trägt ihr Küsten-Rauschen im
   eigenen Rahmen. Ein **Kontinent** ist eine Gruppe von 2–6 Schollen und gilt für einen Zyklus.
2. **Schlüsselbilder** sind der Wilson-Zyklus als Video-Codec: je Zyklus *verstreut* · *versammelt* · *gelöst* (Ende der
   Verweildauer des Superkontinents). Jedes trägt eine Quaternion je Scholle; dazwischen dreht jeder Kontinent um EINEN festen
   Euler-Pol (Slerp mit Tempo-Kurve). Beim Lösen wird die Gruppe neu geschnitten, bevorzugt an jungen Nähten.
3. **Platten** sind eine Lesart je Zeit: die Kruste bestimmt zuerst (ein Punkt auf Kruste fährt mit seinem Kontinent), der Rest
   der Kugel ist ein verwirbeltes Potenz-Diagramm über Kontinent- und Ozean-Stätten.
4. **Relief folgt aus den Rändern**: Abstand zum Rand und Relativ-Geschwindigkeit `(ω_i − ω_j) × p` wählen die Schablone nach
   Kruste × Kruste; die Höhe wächst mit der Reife des Rands und geht beim Erlöschen höhen-gleich ins Gedächtnis.
5. **Meer, Klima, Biome** sind Leser derselben Punkt-Abfrage. **LOD** ist `fussKm`, die Abtast-Dichte desselben Gesetzes.

### Die Regeln (bindend für alle drei Bau-Schritte)

- **K1 Kruste zuerst.** Kruste ist die Vereinigung ALLER Schollen-Felder, jedes im eigenen Rahmen. Die Platten-Zuordnung liest die
  Kruste, nie umgekehrt: keine Plattengrenze schneidet Kruste weg, Überlappung heißt Kollision. (Heilt die geraden Schnittküsten
  des Platten-Spikes.)
- **K2 Ein Kontinent, eine Platte.** Eine Gruppe gehört je Abschnitt GANZ einer Platte und zerbricht nur an einem Schlüsselbild.
  (Lehre aus `entwurf-bruecke-karte-b-m120.png`: einzeln zugeordnete Teilchen zerreißen Kontinente.)
- **K3 Der aktive Rand liegt vorn.** Die Stätte einer Kontinent-Platte sitzt gegen die Fahrtrichtung versetzt: vorn eine schmale
  Schürze Ozeanboden (150–450 km, gesetzt), hinten Boden bis zum Rücken. Die Ursache des Küstengebirges ist die Bewegungsrichtung.
- **K4 Gedächtnis reist mit.** Jede Naht (Kontakt zweier Gruppen im versammelten Schlüsselbild) und jeder erloschene aktive Rand
  steht im Rahmen seiner Scholle. Höhe = `H0 · (1 − e^(−a/τw)) · e^(−a/τa)` mit dem Alter a — eine geschlossene Funktion, kein
  Integrator. τw = 20 Ma, τa = 120 Ma (gesetzt, nicht geeicht).
- **K5 Stetig in t.** Lagen sind stetig; keine Höhe springt schneller als ihre Rate. An Schlüsselbildern wechselt nur die
  Richtung; das Tempo dort bleibt ≥ 40 % des Abschnitt-Mittels (kein Stillstand der Tektonik).
- **K6 Alter aus der Öffnung.** Ozeanboden zwischen zwei getrennten Kontinenten: `Alter = T_offen · d_Rücken / (d_Rücken + d_Rand)`;
  sonst `d_Rücken / halbe Rate`; gedeckelt bei 180–200 Ma (aus dem Samen); weiches Minimum nur über divergente NACHBARN. Tiefe
  nach GDH1 (Stein & Stein): `2,6 + 0,365·√a` km für a < 20 Ma, sonst `5,651 − 2,473·e^(−0,0278·a)` km (Literatur).
- **K7 Meer und Freibord gekoppelt.** Der Spiegel löst das Wasser-Volumen des Samens über der Hypsometrie. Das Kontinent-Niveau
  liegt um den Freibord des Samens (0,25–0,75 km) über dem Bezugs-Spiegel des Zyklus — die Erosionsbasis als Gesetz. Der
  Spiegel der Zeit weicht davon ab (junge Ozeane heben ihn, Eis senkt ihn) und flutet oder entblößt Schelf und Tafel.
- **K8 Band und LOD.** Der Planet trägt nur Wellenlängen ≥ 32 km (darunter gehört die Form `gelaende-core`). `fussKm` schneidet
  Oktaven unter 2·fuss weich ab; jede Oktave ist mittelwertfrei. Kosten ∝ log₂(R/λmin), nie ∝ Fläche — das ist die ehrliche
  Form von „unabhängig von der Größe“ und wird bei GLEICHEM Samen gemessen.
- **K9 Bytes.** Erlaubt sind `+ − × ÷`, `Math.sqrt floor abs min max imul`. Sinus, Kosinus, Arcus-Tangens, Exponent kommen aus
  der eigenen `planetMathe` (Polynome nach Bereichs-Reduktion). Zufall ist zählerbasiert `h(samen, pfad)`, nie ein Strom mit
  Zustand. Keine Wanduhr. Ein Memo ändert nie ein Ergebnis.
- **K10 Kein Rückfall.** Fehlt ein Feld, liegt t außerhalb des gebauten Regimes oder ist ein Regime nicht gebaut, bricht der Kern
  beim Namen. In diesem Lauf ist NUR das Regime `platten` gebaut.

---

## 2 Die Datenstruktur

Koordinaten: Einheitsvektor `(x, y, z)`, y = Drehachse (Nord); `x = cos φ · cos λ`, `y = sin φ`, `z = cos φ · sin λ`; Winkel in
rad, Längen in km, Höhen in km (wahr, ungestaucht), Zeit in Ma (0 = Gegenwart der Saat, negativ = Vergangenheit). Saison und
Uhr bleiben Argumente des Wirts wie in `gelaende-core`; `zeitMa` als Float64 trägt bei 4,5 Ga noch etwa 30 s Auflösung — das
genügt der Tektonik, und die Uhr liest nie `zeitMa`.

```
Plan = Object.freeze({                         // Summe byteLength: Schwelle ≤ 96 KB
  samen, k,                                    // k = planetHash(samen); jede Zahl ist planetZufall(k, pfad…)
  version,                                     // Gesetz-Version des Kerns
  koerper: { radiusKm, g, wasserKm, krustenAnteil, freibordKm, neigungRad, tagStunden, jahrTage,
             drehsinn, sternFluss, alterMa, bodenAlterMaxMa, regime },   // aus dem Samen ODER aus dem Schlüssel
  schollen: Float64Array(nS × 8),              // mitte0[3] im eigenen Rahmen, radiusRad, alterMa, rauschSaat, lappenGewicht, frei
  bilder:   Float64Array(nB),                  // Zeiten der Schlüsselbilder, aufsteigend, −4 000 … +1 000 Ma
  art:      Uint8Array(nB),                    // 0 verstreut · 1 versammelt · 2 gelöst
  lage:     Float64Array(nB × nS × 4),         // Quaternion je Scholle je Schlüsselbild
  gruppe:   Uint8Array(nB × nS),               // Kontinent der Scholle im Abschnitt ab Bild b (K2; Neuschnitt bei art 2)
  ozean:    Float64Array(nB × nO × 4),         // Stätte[3] + Gewicht der nO ozeanischen Platten je Bild (nO je Plan fest)
  naehte:   Float64Array(nN × 8),              // Scholle a, Scholle b, Azimut-Mitte und -Halbbreite in a, Zeit, H0, Breite, frei
  hotspots: Float64Array(nH × 6),              // Ort[3] im Mantel-Rahmen, Beginn, Ende, Stärke
  ereignisse: Float64Array(nE × 6)             // Trapp: Ort im Schollen- oder Platten-Rahmen, Zeit, Radius, Stärke
})

Abschnitt (Memo je (Plan, Abschnitt-Index); Schwelle ≤ 25 ms, ≤ 64 KB)
  pol[nP×3], winkel[nP]                        // EIN Euler-Pol je Platte im Abschnitt
  paar[nP×nP × 4]                              // konvergiert seit, öffnet seit (T_offen), Rift-Zeit, frei
  randGedaechtnis: Float32Array(nS × 32 × 2)   // je Scholle 32 Azimut-Fächer: Ende-Zeit und H0 des letzten erloschenen Rands

Scheibe (je t EINMAL; Schwelle warm ≤ 5 ms, ≤ 64 KB)
  plan, zeitMa, abschnitt
  q[nS×4]                                      // Lage je Scholle zur Zeit t
  staette[nP×3], gewicht[nP], omega[nP×3]      // Platten zur Zeit t (rad/Ma)
  nachbar (CSR), reife[nP×nP], art[nP×nP]      // Nachbar-Liste aus 4 096 Fibonacci-Proben; Reife = 1 − e^(−Dauer/τw)
  ketten: Float64Array(nH × 24 × 4)            // Hotspot-Spur: Ort[3] + Alter je Stütze (Takt 3,5 Ma), plus Hüll-Kappe
  meerKm, eisKm
```

Erd-Schlüssel (Parameter, nie Geometrie — R4): `PLANET_ERDE = { radiusKm 6371, g 9,81, wasserKm 2,62, krustenAnteil 0,41,
neigungRad 0,4091, tagStunden 24, jahrTage 365,25, drehsinn +1, sternFluss 1, alterMa 4570 }` (Literatur). Die Saat-Liste des
Richters ist `erde-01 … erde-30` mit diesem Schlüssel, dazu zehn freie Saaten (Körper aus dem Samen) für die Robustheit.

---

## 3 Jede Signatur von `planet-core.js`

Form wie die anderen Gesetz-Kerne: IIFE über `self`/`globalThis`, Namensraum `__planetCore`, `STUDIO_VERTRAG: 1`, `FUNKTION: 1`,
THREE-frei. In diesem Lauf steht der Kern NICHT in `cores.manifest.json` und nicht in `index.html` (kein Leser im Spiel, die
Ankunft darf nicht wachsen).

```js
// ── bau1 ─────────────────────────────────────────────────────────────────────────────────────────────
planetMathe: { ksin(x), kcos(x), katan2(y, x), kacos(x), kexp(x) }           // K9; Linse zählt Fremd-Aufrufe = 0
planetHash(samen: string) -> u32
planetZufall(k: u32, a: i32, b?: i32, c?: i32) -> number                     // [0, 1), zählerbasiert
PLANET_ERDE, RAND_ART, KRUSTE, VULKAN_ART, SCHICHT                           // eingefrorene Tafeln (Zahlen-Codes)

planetPlan(samen: string, koerper?: Partial<Koerper>) -> Plan                // rein; bricht bei Regime ≠ "platten"
planetScheibe(plan: Plan, zeitMa: number) -> Scheibe                         // bricht außerhalb [bilder[0], bilder[nB−1]]

planetRichtung(breite, laenge, aus3?: Float64Array) -> Float64Array          // (φ, λ) -> (x, y, z)
planetBreiteLaenge(x, y, z, aus2?: Float64Array) -> Float64Array             // (x, y, z) -> (φ, λ)

planetPunkt(scheibe, breite, laenge, fussKm, aus?: Punkt) -> number          // Höhe in m über dem Meer der Zeit
planetPunktR(scheibe, x, y, z, fussKm, aus?: Punkt) -> number                // dasselbe am Einheitsvektor (Karten-Schleife)
//   Punkt = { hoeheM, hoeheKm, kont /* km zur Küste, + landein */, kruste /* KRUSTE */, scholle, platte, nachbar,
//             randArt /* RAND_ART: divergent · transform · konvergent · innen */, randAbstandKm, randRateCmA,
//             ozeanAlterMa, orogenStaerke /* 0..1 */, orogenAlterMa,
//             vulkanArt /* VULKAN_ART */, vulkanAbstandKm, vulkanAlterMa }
planetHuelle(scheibe, x, y, z) -> number                                     // km; grobe Hülle ohne Detail und Kegel
                                                                             //   (Leser: Meer-Löser, Klima-Luv) — dieselbe Formel
planetMeer(plan, zeitMa) -> { meerKm, landAnteil, ozeanAlterMa, eisKm }      // faul je 10-Ma-Fach, Memo, dazwischen linear
planetVulkane(scheibe, breite, laenge, radiusKm, aus?: Vulkan[]) -> number   // Anzahl; Vulkan = { breite, laenge, art,
                                                                             //   hoeheKm, alterMa, aktiv, foerderKm3Ma }
planetKarte(scheibe, breitePx, schicht, ziel?: Uint8Array) -> Uint8Array     // RGB, breitePx × breitePx/2, equirektangulär,
                                                                             //   Nord oben; schicht: "relief" | "platten" | "alter"
// ── bau2 ─────────────────────────────────────────────────────────────────────────────────────────────
planetKlimaGlobal(plan, zeitMa) -> { sternFluss, tMittelC, tAequatorC, tPolC, eisBreite, zellBreite /* Hadley-Rand */,
                                    zellen /* je Halbkugel */, eisKm }
planetKlima(scheibe, breite, laenge, saison /* 0..1 oder −1 = Jahr */, aus?: Klima) -> Klima
//   Klima = { tJahrC, tSommerC, tWinterC, tagAmpC, niederschlagMm, sommerAnteil /* 0..1 */, kontinental /* 0..1 */,
//             windOst, windNord /* Einheit, woher */, luv /* 0..1 */, lee /* 0..1 */, stromK /* K aus Küstenseite */,
//             schneeKm /* Schneegrenze */, abflussMm }
planetBiom(klima: Klima, hoeheM: number, aus?: Biom) -> Biom                 // reine Tafel
//   Biom = { koeppen /* Code 0..29 */, hauptklasse /* 0 A · 1 B · 2 C · 3 D · 4 E */, biom /* Whittaker-Id */,
//            eis /* 0 kein · 1 Schild · 2 Meereis */ }
planetKarte(…, schicht: "biom" | "temperatur" | "niederschlag")              // dieselbe Funktion, drei weitere Schichten
// ── bau3 ─────────────────────────────────────────────────────────────────────────────────────────────
planetAnker(plan, zeitMa, ortGesetz) -> { breite, laenge }                   // der Ort, an dem die heutigen Konstanten wahr sind
planetFlaeche(plan, anker, flaeche /* 0..5 */, xiM, etaM, aus3?) -> Float64Array   // Würfel-Karte (Spiel-x, z) -> Richtung
planetKarteVon(plan, anker, x, y, z, aus?) -> { flaeche, xiM, etaM }
planetOrt(scheibe, breite, laenge, ortGesetz, aus?: Ort) -> Ort              // DIE Brücke (§6); geliefert, nicht verdrahtet
//   ortGesetz = { kuehlungKJeM, meerUnterBasisM, regler /* LANDFORM_REGLER */, klimaHeute /* TEMPERATUR + Spende */ }
//               — vom Aufrufer aus den Exporten von gelaende-core gebaut, nie im Planeten kopiert
```

Das Richter-Werkzeug `scripts/diag-planet.cjs` (node, ohne Fremd-Pakete; Familie `diag-*`):
`--karte <samen> <zeitMa> <schicht> <breitePx> <aus.png>` (PNG selbst geschrieben: Signatur, IHDR, IDAT über `zlib.deflateSync`,
IEND, CRC-32 aus eigener Tafel) · `--richter [bau1|bau2|bau3]` (Statistik über die Saat-Liste, Urteil je Messname) · `--kosten` ·
`--bytes` · `--selbsttest` (eine gepflanzte `Math.sin`-Zeile, eine gepflanzte gerade Küste und eine gepflanzte Facette müssen ROT
werden).

---

## 4 Das Verfahren je Größe (wer es trug)

| Größe | Verfahren | Quelle |
|---|---|---|
| Kruste | Je Scholle ein Feld im eigenen Rahmen: Fenster über den Radius + verzogenes fBm (5–6 Oktaven), sodass im Rand-Gürtel das Rauschen die Küste zieht und im Kern das Fenster trägt. Kontinent = weiches Maximum seiner 2–6 Schollen. Zwei Schwellen: Küste und `innen`; dazwischen Schelf, außen der Hang. Das Küsten-Rauschen wird nur im Rand-Gürtel gerechnet (früher Ausstieg in Tiefsee und Kern). | FELDER (Schwellen, Schelf), PLATTEN (Rahmen), BRÜCKE (Gruppen) |
| Kinematik | Schlüsselbilder: *verstreut* = Poisson-Scheibe mit Mindestabstand; *versammelt* = Tangenten-Packung der Gruppen ohne Überdeckung um einen Pol des Samens; *gelöst* = dieselbe Lage nach der Verweildauer (50–150 Ma). Tempo-Kurve `e(u) = 0,4·u + 0,6·glatt(u)`. Dauer eines Abschnitts = Winkel · R / Rate, Rate aus dem Samen im Band 2–8 cm/a — die Drift ist damit bei jeder Planetengröße physikalisch. | ZEIT (Codec), PLATTEN (Raten-Norm), FAUL (Neuschnitt an Nähten) |
| Platten | Schritt 1: liegt p auf Kruste (inkl. Schelf und Hang), ist seine Platte die seiner Gruppe (K1). Schritt 2: sonst `argmax_i (q·z_i + w_i)` über alle Stätten, q = p verzogen. Ab nP > 40 ein Kandidaten-Index je Scheibe. | PLATTEN, FAUL |
| Rand | Nur über die Nachbar-Liste: Abstand zur Bisektor-Fläche bzw. zum fremden Krusten-Rand, `v = (ω_i − ω_j) × p`, Normal- und Scher-Anteil → konvergent · divergent · transform. | PLATTEN |
| Relief | Land: Meer-Bezug + Freibord·Profil(`innen`) + träge Tafel-Welle (±0,3 km, Becken und Schilde, unter dem Spiegel = Randmeer). Ozean: −GDH1(Alter) + Tiefsee-Hügel. Rand-Schablonen nach Kruste × Kruste (Tafel des Platten-Entwurfs §5.3: Orogen, Anden-Bogen + Graben, Graben + Inselbogen, Rücken, Rift, Bruchzone), Breiten in km, Höhen × g_Erde/g, × Reife × Ketten-Faktor `0,45 + 0,55·Grat`. Dazu Vorland-Senke (Biege-Profil), Versatz-Treppe der Rücken (Versatz je 200–600 km längs des Rands aus dem Hash). | PLATTEN (Schablonen), FELDER (Grat, Treppe, Biegung) |
| Gedächtnis | Naht-Tafel und Rand-Gedächtnis im Schollen-Rahmen (K4); der Gürtel wird mit dem Alter breiter und flacher. | PLATTEN (Nähte), FAUL (reist mit), E3 |
| Vulkanismus | Bogen: einzelne Kegel im Takt ~70 km längs der Bogen-Koordinate, 150–300 km hinter dem Graben. Hotspot: mantel-fest; die Spur ist `R(t)·R(τ)⁻¹·h`, je Scheibe als Kette gebaut, knickt an Schlüsselbildern von selbst; Höhe sinkt mit dem Bodenalter. Rücken und Rift: Spalten; Hotspot × Rücken = Insel-Plateau. Trapp: Ereignis mit Fläche, Zeit, Alter. `foerderKm3Ma` je Vulkan ist der Eingang des Lava-Gesetzes am Ort. | PLATTEN, FAUL, FELDER |
| Meer | Je 10-Ma-Fach: 4 096 Fibonacci-Proben von `planetHuelle`, einmal sortiert, Volumen-Kurve, Spiegel durch Suche; Freibord-Kopplung am Bezugs-Fach des Zyklus (K7). | FELDER, PLATTEN |
| Klima | Global: Energiebilanz `T(x) = T0 + T2·P2(x)` mit Eis-Albedo, Sternfluss nach Gough, Zell-Breite nach Held-Hou aus der Drehung. Ort: −6,5 K/km × Höhe über dem Meer; Kontinentalität aus dem glatten Krustenfeld (ohne Suche); Feuchte durch 6 Schritte luvwärts auf `planetHuelle`; Regenschatten `e^(−Δh/1,5 km)`, Luv-Hub; Gürtel wandern mit der Deklination, über Land weiter (Monsun). | PLATTEN, FELDER, BRÜCKE |
| Meeresströmung grob | Eine Lesart der Becken, kein Strömungsfeld: aus Breite und Küstenseite (liegt das Meer im Westen oder Osten, aus dem Gefälle des glatten Krustenfelds) folgt der Wirbel-Ast. Subtropen: Westküste kalt und trocken, Ostküste warm und feucht. Westwind-Breiten: Westküste mild, Ostküste winterkalt. Abklingen mit dem Küstenabstand. Koeffizienten gesetzt, gegen Köppen-Anteile gerichtet. | neu (heilt „zu zonal, zu viel Wüste“ aller fünf Spikes) |
| Biome | Köppen aus (tSommer, tWinter, Niederschlag, Sommer-Anteil); Whittaker-Id für Pflanzen und Tiere. Die Karte färbt stetig im (T, N)-Raum, nie in Klassen-Stufen. | alle |

---

## 5 Drei Bau-Schritte, nacheinander im selben Baum (`w28-planet-kern`)

Gemeinsam: Messplatz ist node 24 auf diesem Laptop, bestes von 5 Läufen; die Saat-Liste, die Ziehung der fünf Bild-Saaten (aus
dem Hash der Liste) und alle Schwellen unten sind vor dem ersten Lauf eingefroren. Erd-Vergleichswerte sind Literatur (ETOPO1-
Hypsometrie; Köppen-Anteile nach Peel 2007 / Beck 2018) und werden vom Macher vor dem ersten Lauf an der Quelle geprüft. Bilder
nach `vision/planet/bild-kern/` im Zweig `koordination`. Jeder Schritt berichtet in drei Sätzen: geschnitten · gemessen · offen.
Dieser Lauf bucht keine Sprosse der Meisterkarte (Z2: gebucht wird nur im echten Spiel).

### bau1 — Kugel, Platten, Bewegung, Relief, Vulkanismus, Meeresspiegel, Karte

**Liefert:** alle bau1-Signaturen aus §3, das Werkzeug `scripts/diag-planet.cjs`, die Karten (Schichten relief, platten, alter)
von fünf Saaten bei t = 0 und das Bildpaar gegen `entwurf-felder-karte-7.png`.

**Erd-Statistik (Erd-Schlüssel, 30 Saaten, t = 0, 16 384 Fibonacci-Proben je Saat, fuss 40 km):**

| Messname | Schwelle | Erde (Literatur) | bester Spike |
|---|---|---|---|
| `hyps.bimodal` | zwei Gipfel (0,5-km-Fächer): Land in [−0,5; +1,0] km, Ozean in [−5,5; −3,5] km, Abstand 3–6 km, Tal < ⅓ des kleineren Gipfels — in ≥ 27 von 30 | Fach 0…+1 km und Fach −4…−5 km | 4/5 (FELDER) |
| `land.anteil` | Median 29 ± 4 %, jede Saat in 20–38 % | 29,2 % | 25,5–30,4 % (FELDER) |
| `schelf.anteil` | Fläche 0 … −1 km: Median 4–12 % der Kugel | ~8,5 % | 0,0–0,1 % in −1…−3 km (FAUL, ROT) |
| `hoch.anteil` | Fläche > 2 km: Median 1–5 % | ~3,8 % | 2,1–2,5 % (FELDER) |
| `platten.zahl` | 8–20 Platten; ≥ 3 über 5 % Fläche; die größte ≤ 35 % | 7 große + 8 mittlere | 14–23 (PLATTEN) |
| `gebirge.guertel` | ≥ 70 % der Fläche > 1,5 km (Komponenten ≥ 5·10⁴ km²) liegt in Komponenten mit Achsenverhältnis ≥ 4:1; ≥ 60 % dieser Fläche auf Kontinenten; ≥ 70 % der Kontinente über 3·10⁶ km² tragen einen Gürtel ≥ 1 000 km | Blatt 01 L1·2 | ungemessen in allen fünf |
| `gebirge.vorn` (Ursache K3) | bei Kontinenten mit aktivem Rand liegt der Gürtel an der führenden Küste (Skalarprodukt Gürtel-Schwerpunkt × Fahrtrichtung > 0) in ≥ 80 % | — | ungemessen |
| `ozean.alter` | Mittel 40–90 Ma, Maximum ≤ 200 Ma | ~64 Ma | 106 Ma (FAUL, ROT) |
| `ozean.facette` | Tiefsee-Proben > 300 km von jedem Rand und Vulkan: Höhen-Sprung zum Nachbar-Pixel (40 km) ≤ 250 m in ≥ 99,5 % | — | Facetten sichtbar (PLATTEN, FELDER) |
| `kueste.dimension` | Box-Dimension der Küstenlinie (Karte 2048×1024): Median 1,15–1,35 | ~1,2–1,3 | ungemessen |
| `vulkan.zahl` | aktive Vulkane je Saat 300–3 000 | Blatt 01 L2·6: 500–3 000 | ungemessen |
| `vulkan.kette` | Alters-Rang längs Hotspot-Ketten (Spearman, Ketten ≥ 5 Glieder): Median ≥ 0,8; ≥ 3 Ketten je Saat im Ozean | Blatt 01 L2·5 | im Bild (PLATTEN) |
| `meer.volumen` | an 65 536 unabhängigen Proben nachgezählt: Abweichung vom Wasser-Volumen ≤ 1 %; +0,5 km Wasser senkt den Land-Anteil monoton über fünf Stufen | — | — |

Ehrlich daneben: „≥ 95 % der Proben über 2,5 km liegen an einem aktiven Rand, einer Naht oder einem Vulkan“ wird gezählt, ist
aber per Bau wahr und kein Erd-Beleg (die Tautologie, die FELDER selbst benannt hat). Die Belege sind `gebirge.guertel` und
`gebirge.vorn`.

**Kosten (Schwellen):** `planetPunkt` Median ≤ 8 µs, p95 ≤ 20 µs (200 000 Zufallspunkte, fuss 40 km) · flach über die
Plattenzahl: nP 9 ↔ 17 höchstens +40 % · **Radius bei GLEICHEM Samen** R = 1 737 · 6 371 · 12 742 km (Regime per Schlüssel
gehalten): Median max/min ≤ 1,35 · `planetPlan` ≤ 25 ms und ≤ 96 KB · Abschnitt ≤ 25 ms · `planetScheibe` warm ≤ 5 ms und
≤ 64 KB · `planetMeer` je Fach ≤ 40 ms · Karte 1024×512 relief ≤ 5 s auf einem Faden.

**Determinismus:** (a) Absenz: 0 Treffer für `Math.sin cos tan asin acos atan atan2 exp expm1 log log2 log10 log1p pow hypot
cbrt sinh cosh tanh random`, `Date`, `performance` in `planet-core.js`; (b) SHA-256 der PNG gleich über zwei Prozesse, über
`node` und `node --jitless`, über die Abfrage-Reihenfolge vorwärts · rückwärts · gemischt; (c) Genauigkeit der `planetMathe`
gegen `Math.*` ≤ 1·10⁻¹² an 10⁶ Argumenten; (d) zweite Engine (SpiderMonkey oder JavaScriptCore): Hash gleich — steht keine
am Platz, bleibt das unter dem Messnamen `planet.bytes.engines` offen und heißt ungemessen.

**Woran die Karte als Planet liest:** Man kann ohne Legende zeigen, WO Platten auseinandergehen (ein zusammenhängendes
Rücken-Netz mit Versatz-Treppen mitten in den Ozeanen), WO sie zusammenstoßen (Graben vor der Küste, Kette dahinter,
Inselbögen im Meer) und WELCHE Küste eines Kontinents die führende ist — und kein Kontinent ist ein Kreis, keine Küste ein Lineal.

### bau2 — Klima und Biome

**Liefert:** `planetKlimaGlobal`, `planetKlima`, `planetBiom`, die Schichten biom · temperatur · niederschlag, die Biom-Karten
derselben fünf Saaten und den Richter-Teil bau2.

| Messname | Schwelle | Erde (Literatur) |
|---|---|---|
| `klima.global` | Erd-Schlüssel: Mittel 14 ± 3 °C; Äquator 24–30 °C; Gefälle Äquator–Pol 35–55 K; Hadley-Rand 30 ± 4° | 14–15 °C |
| `klima.koeppen` | Anteile der Hauptklassen an der Landfläche, Median über 30 Saaten, je im Band ±50 % der Erde: A 9,5–28,5 % · B 15–45 % · C 6,7–20 % · D 12,3–37 % · E 6,4–19,2 % (Blatt 04 L3·5) | A 19,0 · B 30,2 · C 13,4 · D 24,6 · E 12,8 % (Peel 2007) |
| `klima.wueste` | B ≤ 45 % der Landfläche in ≥ 27 von 30 | 30,2 % |
| `klima.regenschatten` | über Kämmen > 2 km in den Westwind-Breiten: Niederschlag Luv/Lee ≥ 2:1 in ≥ 80 % der Kamm-Abschnitte (Blatt 04 L3·3) | — |
| `klima.gegenlauf` (R7) | derselbe Samen mit `koerper.drehsinn = −1`: die trockene Seite wechselt an ≥ 80 % dieser Kämme | — |
| `klima.kuestenseite` | Breite 15–35°: Niederschlag der Westküsten ≤ 0,6 × Ostküsten derselben Breite (Median über Saaten) | Atacama, Namib gegen Südost-Küsten |
| `klima.eis` | Eis (Schild + Meereis) 3–15 % der Kugel bei t = 0 | ~8–10 % |
| `klima.widerspruch` | 0 Proben mit Eis bei tSommer > +5 °C, Wüste bei > 1 500 mm oder Regen ohne Meer luvwärts innerhalb 6 Schritten, an 30 × 16 384 Proben (Blatt 04 L3·7) | — |

**Kosten (Schwellen):** `planetKlima` auf Land Median ≤ 25 µs, auf Meer ≤ 4 µs · `planetKlimaGlobal` ≤ 1 ms · Biom-Karte
1024×512 ≤ 15 s auf einem Faden (Richter-Werkzeug, nie ein Pfad des Spiels). **Determinismus:** wie bau1, am PNG der Schicht
biom. Die Punkt-Kosten von bau1 dürfen nicht steigen (dieselbe Messung, ±10 %).

**Woran die Karte als Planet liest:** Grün am Äquator; zwei Wüsten-Gürtel um 20–30°, die an Westküsten bis ans Meer reichen und
an Ostküsten grün unterbrochen sind; Wald in den Westwind-Breiten mit braunem Lee hinter jedem Kamm; Tundra und Eis an den
Polen — und jede Farbgrenze hat eine nennbare Ursache (Breite, Kamm, Küstenseite, Höhe), keine ist eine Stufe der Tafel.

### bau3 — die Zeit t und die Brücke `planetOrt`

**Liefert:** die Zeitachse über alle Abschnitte (K5 über Schlüsselbilder hinweg, Rand-Gedächtnis, Meer(t), Klima am Ort der
Zeit mit Sternfluss nach Gough), die Karten EINER Saat bei 0 · −50 · −100 · −200 · +50 Ma (Schichten relief und biom) plus
eine Karte am nächsten versammelten Schlüsselbild, `planetAnker`, `planetFlaeche`, `planetKarteVon`, `planetOrt` samt der
Beschreibung §6 als Kommentar-Kopf im Kern, und den Richter-Teil bau3.

| Messname | Schwelle |
|---|---|
| `drift.cm_a` | Kontinente × 20 Zufalls-Zeiten in [−540; +250] Ma × 30 Saaten: p05 ≥ 1, p95 ≤ 15, Median 2–8 cm/a (Blatt 05 L2·2) |
| `zeit.stetig` | 10⁴ Materialpunkte (im Schollen-Rahmen), Schritt 0,1 Ma an 20 Zufalls-Zeiten, auch über Schlüsselbilder: Höhen-Änderung ≤ 1 km je 0,1 Ma (Hebung ≤ 10 mm/a, Blatt 05 L1·1); Küsten-Versatz zwischen Karten im Abstand 1 Ma ≤ 150 km |
| `zeit.rueckkehr` | Karte bei 0 → Abfragen bei −200 → Karte bei 0: SHA-256 gleich; ebenso bei gemischter Reihenfolge der fünf Zeiten |
| `zeit.sprung` | `planetScheibe` kalt (neuer Abschnitt + zwei Meer-Fächer) ≤ 120 ms, warm ≤ 5 ms; Kosten bei −200 Ma und −3 000 Ma je innerhalb ±20 % von t = 0 |
| `zeit.statistik` | `hyps.bimodal` und `land.anteil` (Band 20–38 %) halten an allen fünf Zeiten in ≥ 27 von 30 Saaten |
| `superkontinent` | am versammelten Schlüsselbild hängen ≥ 70 % des Landes zusammen (Blatt 05 L2·3) — per Bau, als Bild belegt; im Inneren stehen Naht-Gürtel |
| `meer.zeit` | über 20 Fächer eines Zyklus: Spiegel gegen mittleres Bodenalter Rang ≤ −0,6 (junge Ozeane heben ihn); Spanne innerhalb ±300 m |
| `gebirge.vorn.zeit` (R7) | 30 Ma vor und 60 Ma nach einem *verstreut*-Schlüsselbild: der aktive Gürtel liegt jeweils an der dann führenden Küste in ≥ 80 %; der alte Gürtel steht als Gedächtnis mit sinkender Höhe |
| `ort.anker` | 30 Saaten: der Anker liegt auf Land; Sommer 18 ± 4 °C und Winter −4 ± 6 °C, Küste ≤ 300 km, aktiver Rand ≥ 500 km in ≥ 80 % |
| `ort.bereich` | 30 Saaten × 256 Land-Orte: jeder Regler von `planetOrt` liegt in min…max seiner Zeile in `LANDFORM_REGLER` (100 %); `meer.waterLevelM` bei t = 0 am Anker ist genau −3 (`Object.is`) |
| `ort.kosten` | `planetOrt` ≤ 1 ms, `planetAnker` ≤ 10 ms; zweimal gerufen: gleiche Bytes |
| `ort.leser` | Leser im Spiel = 0, beim Namen genannt: Konsum-Tiefe 0 % (die Brücke ist Funktion, nicht Verdrahtung) |

**Woran die Karten als Planet lesen:** Auf den fünf Karten erkennt man dieselben Kontinente an ihrer Küste wieder; sie stehen
anders, ihr Klima folgt ihrer neuen Breite, Ozeane hinter ihnen sind breiter oder schmaler geworden, und kein Gebirge
erscheint oder verschwindet zwischen zwei Karten ohne einen Rand, der es erklärt.

---

## 6 Die Brücke — beschrieben, in diesem Lauf nicht verdrahtet

`gelaende-core` bleibt das Gesetz des Ortes (Flussnetz, Talprofil, Schicht-Treppe, Höhlen, Schnee, Uhr und Saison). Der Planet
ersetzt später genau die drei Eingänge, die es heute selbst erfindet: die Großform aus Rauschen (`grossform`, 565–575), den
Spiegel als Konstante (`waterLevel = baseHeight − 3`, 2696) und das eine Klima (`TEMPERATUR`, 1301; Abflussspende 330 mm, 1548).

```js
planetOrt(scheibe, breite, laenge, ortGesetz, aus?) -> {
  anker:   { breite, laenge, zeitMa, ost: [x, y, z], nord: [x, y, z] },
  wildnis: { land, hoehe, kontinentLambda, rauhLambda, trog, ks, tafel, schichtDicke, hartAnteil },   // geklemmt auf die Regler
  meer:    { waterLevelM },                  // −meerUnterBasisM + s_v · (Meer(t) − Meer(0)) · 1000
  klima:   { sommer, winter, sommerPhase, tagAmp, tagGipfel, jahrTage, spendeMm },   // die Felder von TEMPERATUR + Spende
  wetter:  { windX, windZ, regenQuote, sturmQuote },                                 // der Rahmen für wetterAt
  biom:    { koeppen, hauptklasse, biom },
  leit:    { kanteM: 8000, huelleM: Float64Array(81), landC: Float64Array(81) },     // 9×9 Stützen über 64 km:
                                             //   gestauchte Hüllen-Differenz zum Anker (m) und Differenz der Kontinentalität
  vulkan:  { art, abstandKm, alterMa, foerderKm3Ma },
  rand:    { art, abstandKm, rateCmA },
  stauchung                                  // s_v = 0,0065 K/m ÷ ortGesetz.kuehlungKJeM (heute 0,0587) — gelesen, nie gesetzt
}
```

Abbildung: `land` aus `kont` (Küste um −0,2, Inneres 0,35–0,9, Meer bis −0,6); `hoehe` aus `orogenStaerke`; `rauhLambda` aus
`orogenAlterMa` (jung kurz, alt lang); `tafel` aus Schollen-Alter und Rand-Abstand; `trog` aus der Kälte am Ort; `ks` aus der
Konvergenz-Rate; `kontinentLambda`, `schichtDicke`, `hartAnteil` bleiben die Vorgabe des Reglers, bis ein Gesteins-Leser sie
trägt.

Die Verdrahtung danach, in dieser Reihenfolge (kein Teil dieses Laufs):
1. **Pflichtfelder, byte-gleich.** `L.klima` und `L.waterLevel` werden Pflicht der Lage; die sechs Stellen mit
   `Number.isFinite(L.waterLevel) ? … : (L.baseHeight || 0) − …meerUnterBasis` (1279 · 1309 · 1377 · 1474 · 1519 · 1745)
   brechen beim Namen statt zurückzufallen. Beweis: byte-Diff von Höhe und Temperatur = 0, `gate:settlement` Teil O.
2. **Der Kragen.** In `grossform`, `temperaturFeld`, `SCHNEE`, `wetterAt` steht der Planet hinter `if (k !== 0)`,
   `k(d) = d ≤ R₀ ? 0 : glatt(R₀, R₁, d)`. R₀ = ∞ heißt heute (byte-gleich ohne Flag), R₀ = 16 km lässt Genesis und ihre Sicht,
   R₀ = 0 erst nach dem Bildpaar an Genesis. Leitgrößen als Differenz zum Anker: `off += s_v·ΔHülle − ō(land)`, `c += ΔLand`,
   `rel *= ρ`.
3. **Die Karte.** Spiel-(x, z) sind die Karten-Meter (ξ, η) der Würfel-Fläche, in deren Mitte der Anker liegt; Krümmung nur im
   Vertex-Schritt des Zeichners. Bandteilung: Planet ≥ 32 km, `gelaende-core` < 24 km. Drei Abtast-Bereiche: ≥ 8 km nur der
   Planet, 400 m – 8 km mit `grossform` (0,48 µs gemessen), darunter das volle `hoehe`; der Netz-Speicher braucht Verdrängung
   je Kachel.

---

## 7 Was draußen bleibt (offen, benannt, mit Ursache)

- **Das Spiel.** Der Kern lebt nach diesem Lauf nur im Richter-Werkzeug und im PNG: Konsum-Tiefe im Spiel 0 %. Kein Eintrag im
  Manifest, kein Leser in `gelaende-core`, `phyto-core`, `stamm/`. Orbit-Ansicht, Worker, Abstieg, Krümmung, Flächen-Säume,
  Netz-Verdrängung: ungebaut. Kosten im Browser und an der Ankunft (PFLICHT-OFFEN B): ungemessen.
- **Ursache statt Drehbuch.** Die Tektonik ist vorgeschrieben: Superkontinente gibt es, weil der Plan sie setzt. Die
  Fremdwelt-Probe R10 besteht das nicht. Keine Mantel-Konvektion, keine Mikroplatten, keine diffusen Ränder.
- **Magma, das Land MACHT — nur zum Teil.** Magma baut hier Kegel, Ketten, Inselbögen und Plateaus; es bilanziert keine
  Kruste (keine Akkretion, keine Subduktions-Erosion, Schollen wachsen nicht). Das Fließen am Hang bleibt das Lava-Gesetz des
  Ortes. Messname der Lücke: `kruste.bilanz`.
- **Regime außer `platten`.** Deckel-, Eis-, Venus-, Io-Welten, Magma-Ozean und Hadaikum: der Plan bricht beim Namen. Krater
  und Einschläge: ungebaut.
- **Abtrag mit Transport.** Keine Becken über 1 000 km, keine Deltas, keine Sediment-Keile; Schichtfolge, Bohrsäule und
  Gestein je Ort: ungebaut.
- **Wetter und Zirkulation.** Kein Druckfeld, keine Fronten aus Ursache, kein Strömungsfeld der Ozeane (nur die
  Küstenseiten-Lesart), keine Kopplung Tat → Klima.
- **Klima über Äonen.** CO₂-Gleichgewicht, Schneeball-Hysterese, Milankovitch-Eis (41 und 100 ka), Mond und Tageslänge über t:
  ungebaut. Gebaut ist nur Sternfluss nach Gough und das Gleichgewichts-Eis der Zeit. Messname: `eis.spektrum`.
- **Wahre Höhen am Boden.** Die Stauchung s_v bleibt; s_v → 1 ist eine Entscheidung des Schöpfers.
- **Benannte Zwillinge, die stehen bleiben.** Die Sonne ohne Breite (`welt-licht.js` 696–715) und `ATMO_GESETZ.erdeM` 6 360 km
  (`foundry-core.js` 284) neben `koerper.radiusKm`.
- **Die Erd-Saat ist nicht die Erdgeschichte.** Rodinia bis Pangäa erkennbar: nein.
- **Sonnensysteme.** Der Körper kommt aus dem Samen; die Ebene System (mehrere Körper, Stern, Bahnen) ist ungebaut.
- **Statistik und Buchung.** ≥ 100 Saaten, Blindpaare (R11), KS gegen die Erd-Hypsometrie (Blatt 01 L1·5): ungemessen. Dieser
  Lauf hebt keine Sprosse.

## 8 Risiken, die der Macher zuerst misst

1. **Das Bild.** Die Pfropfen sind einzeln belegt, zusammen nie gelaufen. Erster Lauf von bau1 ist darum die Karte, nicht
   die Statistik: liest sie schlechter als Felder-Karte 7, steht E1 nicht.
2. **K3 und die Schürze.** Ob die versetzte Stätte den Graben verlässlich vor die führende Küste legt, ist ungemessen;
   `gebirge.vorn` richtet es.
3. **Rand-Gedächtnis.** Der höhen-gleiche Übergang am Schlüsselbild (K5) ist die heikelste Stelle; `zeit.stetig` richtet ihn
   schon in bau1 an EINEM Schlüsselbild, in bau3 an allen.
4. **Eichung als Kosmetik.** Die Koeffizienten von Strömung und Gürteln sind gesetzt; ohne `klima.gegenlauf` zählt kein
   Köppen-Treffer.
5. **Wände des Repos.** Eine neue Kern-Datei im Wurzel-Ordner kann Datei-Listen-, Versions- und Wachstums-Tore treffen; vor dem
   ersten Commit `npm run check` lesen, nicht raten.
