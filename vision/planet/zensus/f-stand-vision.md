# Zensus F — der Stand der Vision im Kapitel PLANET (ZWISCHENSTAND 18.11.2026)

**Gelesen:**
- Die Blätter unter `vision/planet/` aus dem Checkout `/home/user/zensus-planet`, dazu `vision/kapitel/planet.md` mit `planet.json`, `vision/MEISTERKARTE-2.md`, `vision/meisterkarte-2.json` und die Köpfe von `vision/blatt/01…05`.
- **Code:** `main` am Kopf b7ed8419 (V18.546.339, 18.11.2026 20:16).
  - `planet-core.js` hat 2 397 Zeilen und 178 914 B. Es trägt `VERSION = 'planet-h2-4'` (`planet-core.js:57`).
  - `git log -- planet-core.js` zeigt nur **einen** Commit: 241967bd „Merge w28-bremsweg in integ-probe“ vom 16.11.2026 22:06. Der Klon ist flach (`git rev-parse --is-shallow-repository` = true). Die Herkunft der Datei vor dem 16.11. ist deshalb hier nicht nachlesbar.

**Kürzel für die Dateien:**

| Kürzel | Datei |
|---|---|
| E | `ENTSCHEID.md` |
| E2 | `ENTSCHEID-2.md` |
| ER | `ENTSCHEID-REISE.md` |
| B | `BERICHT.md` |
| B2 | `BERICHT-2.md` |
| BR3 | `BERICHT-REISE-3.md` |
| BG | `befund-gesicht.md` |
| BRe | `befund-reise.md` |
| G2Z | `gegner2-zahl.md` |
| GRG | `gegner-reise-gesetz.md` |
| S1 | `bericht-reise-schnitt1.md` |

Alle liegen unter `vision/planet/`. Zeilennummern im Code gelten für `main` b7ed8419.

---

## §1 ENTSCHEIDE — was bindet

### ENTSCHEID (14.11.) §0 — sechs Entscheide

- **E1 Raum = PLATTEN.** Ein Potenz-Diagramm teilt die Kugel in Platten, und jede Platte dreht um ihren Euler-Pol (E §0).
- **E2 Zeit = Schlüsselbilder.** Der Wilson-Zyklus hat drei Bilder: verstreut, versammelt, gelöst. Dazwischen wird per slerp interpoliert, mit einem Euler-Pol je Abschnitt (E §0).
- **E3 Gedächtnis = Tafel.** Nähte und Rand-Gedächtnis stehen als Tafel im Rahmen der Scholle. Ein Strahl durch die Zeit wurde verworfen (E §0).
- **E4 Gesicht = FELDER.** Die Schollen-Felder bilden die Krusten-Gestalt (E §0).
- **E5 Ozeanboden = GDH1.** Das Steady-State-Modell ist gefallen (E §0).
- **E6 Brücke = Höhen-Stauchung.** Es gilt s_v = 0,0065/0,1108 = 0,0587 aus `gelaende-core.js`. Die Stauchung wird gelesen, nie kopiert (E §0).

### ENTSCHEID §1 — die Regeln K1–K10 (E Z. 69–95; im Kopf von `planet-core.js:15–27` gespiegelt)

- **K1 Kruste zuerst.** Die Platten-Zuordnung liest die Kruste (die Vereinigung aller Schollen-Felder), nie umgekehrt.
- **K2 Ein Kontinent, eine Platte.** Eine Gruppe gehört je Abschnitt ganz einer Platte. Sie zerbricht nur am Schlüsselbild „gelöst“.
- **K3 Der aktive Rand liegt vorn.** In Fahrtrichtung liegt eine Schürze von 150–450 km, nach hinten reicht die Platte weit.
- **K4 Das Gedächtnis reist mit.** Nähte und erloschene Ränder bleiben im Schollen-Rahmen, mit der Höhe H0·(1−e^(−a/20))·e^(−a/120).
- **K5 Stetig in t.** Keine Höhe springt schneller als ihre Rate. Am Schlüsselbild bleibt die Geschwindigkeit ≥ 40 % des Abschnitt-Mittels.
- **K6 Alter aus der Öffnung.** Die Tiefe folgt GDH1: 2,6+0,365√a, sonst 5,651−2,473e^(−0,0278a). Das Alter wird bei 180–200 Ma weich gedeckelt.
- **K7 Meer und Freibord gekoppelt.** Der Spiegel löst das Wasser-Volumen. Das Kontinent-Niveau ist der Bezugs-Spiegel plus Freibord (0,25–0,75 km).
- **K8 Band.** Der Planet trägt nur Wellenlängen ≥ 32 km, die Kosten gehen mit log₂(R/λmin).
- **K9 Bytes.** Erlaubt sind nur + − × ÷ und Math.sqrt/floor/abs/min/max/imul. Den Rest liefert `planetMathe`. Der Zufall ist zählerbasiert, eine Wanduhr gibt es nicht.
- **K10 Kein Rückfall.** Nur das Regime `platten` läuft. Ein fehlendes Feld oder ein t außerhalb bricht beim Namen.

### ENTSCHEID §2–§4 — Körper, Signaturen, Verfahren

- **§2:** `PLANET_ERDE` = {radiusKm 6371, g 9,81, wasserKm 2,62, krustenAnteil 0,41, neigungRad 0,4091, tagStunden 24, **jahrTage 365,25**, drehsinn +1, sternFluss 1, alterMa 4570}. Der Plan bleibt ≤ 96 KB (E §2, Z. 137).
- **§3 Signaturen:**
  - bau1 liefert Plan, Scheibe, Punkt, Hülle, Meer, Vulkane und Karte.
  - bau2 liefert `planetKlima` {…, windOst, windNord, luv, lee, stromK, schneeKm, abflussMm} und `planetBiom`.
  - bau3 liefert `planetAnker`, `planetFlaeche`, `planetKarteVon` und `planetOrt`.
  - Für diesen Lauf gilt: „Kern NICHT in `cores.manifest.json` und nicht in `index.html`“ (E §3, Z. 145).
- **§4 Verfahren:**
  - Das Klima ist T(x) = T0 + T2·P2(x), mit −6,5 K/km.
  - Die Feuchte kommt aus luvwärtigen Schritten, der Regenschatten folgt e^(−Δh/1,5 km).
  - Die Meeresströmung ist nur eine Lesart der Küstenseite (E §4).

### ENTSCHEID §6 — die Brücke (E Z. 322–363)

- Der Planet ersetzt drei Stellen:
  - die `grossform` (gelaende-core 565–575),
  - `waterLevel = baseHeight − 3` (2696),
  - `TEMPERATUR` (1301) samt der Spende 330 mm (1548).
- `planetOrt` liefert {anker, wildnis, meer, klima, wetter{windX, windZ, regenQuote, sturmQuote}, biom, leit{kanteM 8000, huelleM(81), landC(81)}, vulkan, rand, stauchung}.
- Die Verdrahtung hat drei Schritte: Pflichtfelder, dann der Kragen k(d) mit R₀, dann die Karte mit Band-Teilung (Planet ≥ 32 km, Gelände < 24 km).

### ENTSCHEID §7 — was draußen bleibt (offen benannt, E Z. 364–389)

- Spielkonsum 0 %.
- Keine Mantel-Konvektion, keine `kruste.bilanz`, kein anderes Regime, keine Krater.
- **Abtrag mit Transport, Becken > 1 000 km, Deltas, Sediment-Keile, Gesteinsfolge, Bohrsäule, Gestein je Ort.**
- **Kein Druckfeld, keine Fronten, kein Feld der Ozeanströmung.**
- `eis.spektrum`: CO₂, Schneeball, Milankovitch, Mond und Tageslänge über t.
- Zwei Zwillinge bleiben: die Sonne ohne Breite (`welt-licht.js`) und `ATMO_GESETZ.erdeM` 6 360 km (`foundry-core.js`).
- Die Erd-Saat ist nicht die Erdgeschichte.
- ≥ 100 Saaten und ein KS-Test sind ungemessen.

### befund-reise D1–D5 (BRe Z. 73–92)

ENTSCHEID-2 bestätigt D1, D3, D4 und D5 (E2 Z. 380–382):

- **D1 Ein Samen, zwei Lesarten:** `planet.samen` und die Ort-Saat `samen@ortKey`.
- **D3 Die Heimat ist der Nullpunkt:** Jede Ziel-Größe ist Heimat + Δ des Planeten.
- **D4 Der Kern rechnet im Faden,** nach dem ersten Weltbild.
- **D5 Ein gespeicherter Ort trägt den Kern-SHA.**

Zu D2 („der Körper ist das Ort-Gesetz“, jahrTage = TEMPERATUR.jahrTage) sagt E2 nichts. Der Code führt D2 als R5 (`pruefJahr`, `planet-core.js:2181–2183`).

### ENTSCHEID-2 (14.11., Kopf d660f478) — G1–G3

- **G1 — die Gestalt an fünf Stellen EINER Kette** (E2 Z. 14 und §G1 Z. 141–215). Die fünf Stellen sind G1.1–G1.5:
  - wer gruppiert,
  - die Lappen in zwei Bändern, mit **Amplitude ≈ 1 im groben Band** (E2 Z. 101),
  - das Becken-Feld B (Start c 5, E2 Z. 154),
  - die Küste als Höhenlinie und EINE `kont`,
  - die Ozean-Wertung.

  Pflicht-Bänder: `land.ellipse` ≤ 0,85, `stuecke4` 40–100, `formzahl` 0,70–0,88, `fern1000` 8–22 %, `meer.binnen` 1,5–6 %, `kont.naht` 0, `kont.kueste` ≤ 3 %, `grenze.bogen` ≥ 70°.
- **G2 — Inneres und Messer-Kanten als EINE Klasse** (§G2 Z. 216–288). Der Satz dazu: „an der Grenze entscheidet das Paar, nie die Seite“. Die Feuchte ist ein Integral. Die fünf Teile:
  - G2.1 `gedaechtnisHoehe` = e^(−a/120) + 0,15·e^(−a/1500),
  - G2.2 der Schild,
  - G2.3 Feuchte über 14 Knoten von 150 bis 2 100 km,
  - G2.4 die Grenz-Normale mit `paarC`,
  - G2.5 die zweiseitige Schablone.

  Bänder: `kante.flach` ≤ 1,0 %, `sprung20` p99 ≤ 40 mm, `relief.messer` ≤ 200, `grenze.stufe` ≤ 10 / ≤ 5 %, `innen.streuung` 0,40–0,65, `altguertel` 5–25 %, `innen.schild` ≤ −0,5, `land.median` 0,2–0,6 km.
- **G3 — Zeit und Kosten plus Teil R** (§G3 Z. 289–377):
  - R1 Karten-Streifen und `planetKarteAusschnitt`,
  - R2 `planetOrt().delta`,
  - R3 `planetOrtDerZeit`,
  - R4 `bytes.version`,
  - R5 `pruefJahr`,
  - R6: der Kopf nennt keinen Verdrahtungs-Stand.

  Bänder: `zeit.schritt` ≥ 0,90 in ≥ 27/30, `zeit.sprung.ref` ≤ 250 ms, `kosten.*.g0` ≤ 1,03×.
- **Teil 2, die Reise** (E2 Z. 378–465):
  - Das Ort-Gesetz liest aus EINER Quelle, `ortGesetz()`.
  - Die Stufen sind A Sterne, B Atlas, C Reise.
  - C1 nennt sieben Rückfall-Stellen.
  - Der Kragen aus §6 Schritt 2 gehört **nicht** in die nächste Welle.

### ENTSCHEID-REISE (15.11. 05:00) — DAS GESETZ der Reise (ER §1 Z. 44–76)

- **(1) Ein Ort ist eine Welt mit EINEM Gesetzesteil mehr,** `ort` (die Ort-Saat `<Samen>@<B>_<L>_<t>[~k]`). Die Heimat trägt `ort: null`.
- **(2) „Heimat plus Differenz“ steht in EINER Tafel,** `ortGesetz(ort)` in `gelaende-core.js`. Jede Lage trägt das Pflichtfeld `L.ort`. Die Summe entsteht nur an der Quelle der Heimat-Größe.
- **(3) Am Anker ist jede Summe x + 0 und jedes Produkt x · 1.** Die Heimat bleibt byte-gleich.
- **Die EINE Tür:** `_weltBetreten → _weltWechsel`. `worldMeta.gesetz.ort` trägt nur das Δ (ER §2).
- **Was gelesen wird:**
  - JA: Regler, Spiegel, Temperatur, Schnee, Spende, Wetter-Verteilung.
  - NEIN (benannt): `reise.wind.richtung`, `ort.leit.leser`, `reise.sonne.breite`, `reise.pol.hoehe`, `reise.biom`.
  - Die Konsum-Tiefe der Welle ist **17/23 = 74 %** (ER Z. 73, 229).
- **Annahme der Welle (ER §3, Z. 195–242):**
  - EIN Samen, die Heimat und vier Orte (heiß, kalt, Küste, −100 Ma).
  - Preis-Regel: Median(B) ≤ Median(A) + 0,7 s (§3.7).

### Was durch Bau bindet (BR3 h2-4)

- Der Wuchs ist ein Teil der EINEN Tafel, `ortGesetz(teil).wuchs`, gerechnet über `pflanzenDeckung` (`planet-core.js:2143`).
- `kahlGrund` heißt: der Grund folgt dem Klima.
- F4 ist geheilt: es gibt EIN Jahr, `jahrTage` 365 (`planet-core.js:264`).

---

## §2 GEMESSEN — jede Zahl mit Messname und Datei

### 2.1 Kosten je Punkt, Ort und Plan

**Punkt:**
- `planetPunktR` bei 8·16·24·48 Platten: 6,26 · 5,02 · 5,11 · 7,03 µs; im Kartenlauf 3,26–3,58 µs (E §0 E1, Spike PLATTEN).
- `kosten.punkt`: Median **8,10 µs**, p95 14,5 µs. Das Band ist ≤ 8 µs, also ROT (B Z. 76). Nach dem Gegner: Median 8,2–13,2 µs unter Last (B Z. 188).
- `--kosten g1`:
  - `planetPunkt` 22,40 → **28,50 µs** (×1,272, Deckel 1,10, ROT),
  - Hülle 17,90 → 21,00 µs (×1,173, ROT),
  - `planetPlan` 41,0 → 52,0 ms bei einem Deckel von 25 ms (B2 Z. 65–66).
- `kosten.punkt.g0` 13,6 → 10,3 µs, also ×0,757 (B2 Z. 229). Nach der Heilung ×0,733 · ×0,790 · ×0,708 (B2 Z. 377).
- Gegner 2 auf frischen Saaten:
  - Punkt ×0,70–0,73, Scheibe kalt ×0,42–0,44, erster Punkt 2,1–5,8 ms.
  - Das Band ≤ 1,03× hat eine falsche Herkunft: Klima schwankt ×0,917–1,083, Ort ×0,928–1,214 (G2Z Z. 6–7, 25).

**Klima:**
- `planetKlima` Land 80,5 → **100,9 µs** (+20,4 µs, ROT gegen +12), während E §5 bau2 ≤ 25 µs an Land setzt (B2 Z. 163).
- `kosten.klima.g0` ×0,951 · 0,922 · 0,943 (B2 Z. 378).

**Ort:**
- `ort.kosten`: `planetOrt` Median **1,133 ms** gegen das Band ≤ 1 ms, ROT; `planetAnker` kalt 7,6 ms (B Z. 51).
- 1,523 → **0,888 ms**, Anker 9,3 → 8,7 ms (B2 Z. 241).
- Unter Last **1,541 ms**, Anker 16,6 ms, ROT (B2 Z. 383).
- `ort.kosten.g0` ×0,913 · 1,005 · 0,886 (B2 Z. 379).
- `planetOrt` an 40 Orten: Median 1,31 ms, max 5,23 ms (BRe).
- Basis der Welle 1: 1,597 ms (E2 §0.2).

**Plan:**
- `kosten.plan` **20,0 ms und 45,3 KB** (B Z. 80).
- `planetPlan` mit Erd-Schlüssel: 41–58 ms (BRe Z. 54).
- Im Knoten: Plan 50 ms, Scheibe 285 ms, Anker 16 ms, zusammen 0,35 s; im Spiel 0,60 s Wanduhr (S1).
- Spike ZEIT: Plan 1,9–13,6 ms bei 7 760–9 528 B (E §0 E2).

**Scheibe und Sprung:**
- `kosten.scheibe` 5,94 ms (B Z. 152).
- Scheibe(0) kalt: 438–564 ms (BRe).
- Eine kalte Scheibe rechnet 28 672 Hüllen-Punkte in 314–568 ms (E2 §0.3).
- `zeit.sprung` bau3:
  - kalt bestes 248 ms, Median 359 ms, warm 5,76 ms (B Z. 44),
  - dann 101 ms / 3,52 ms (B2 Z. 233),
  - unter Last 162 ms / 5,48 ms, ROT (B2 Z. 382).
- `zeit.sprung.ref` 121 · 122 · 119 ms und `zeit.sprung.bild` 140 · 145 · 134 ms, beide GRÜN (B2 Z. 380–381).

**Karte, Vulkane, Maßstab, Mathe:**
- `kosten.karte` 3,60 s (B bau1).
- Karte 256 px: Relief 264 → 307 ms, Biom 974 → 1 056 ms (B2 Z. 384).
- Atlas Relief 37 · 81 · 302 ms und Biom 100–1 129 ms (BRe).
- `planetVulkane` bei R 1 737…63 710 km: 7,0 · 4,1 · 2,9 · 3,7 · 4,3 ms (B, „Nach dem Angriff“).
- Maßstab-Fehler 1,232·10⁻⁴ (B), Bindung ≤ 1,24·10⁻⁴ bis 100 km (E §0 E6). `planetMathe` 8,9·10⁻¹⁶ (B).

### 2.2 Stetigkeit und Sprünge an Plattengrenzen

**An den Grenzen (End-Tafel Welle 2):**

| Messname | Wert | Band | Quelle |
|---|---|---|---|
| `grenze.stufe` konv · div | 98,5 · 42,6 % → **16,6 · 8,8 %** | ≤ 10 · ≤ 5 %, ROT | B2 Z. 339 |
| `relief.messer` je Mio | 1 143 → **1 346** | ≤ 200, ROT | B2 Z. 340 |
| `klima.kante.flach` | 3,26 → **1,72 %** | ≤ 1,0 %, ROT | B2 Z. 341 |
| `klima.sprung20` p99 | 199,7 → **162,4 mm** | ≤ 40, ROT | B2 Z. 342 |
| `kont.naht` · `kont.kueste` | 35,5 · 5,9 % | ROT | B2 Z. 337 |
| `grenze.bogen` | **41,3°** | ≥ 70°, ROT | B2 Z. 338 |

- Vor dem Schnitt (BG): die Grenz-Stufe stand konvergent bei 98,7 % (2,5 km), transform 69,8 %, divergent 20,4 %. Die Lineal-Kante lag bei c +49,4 ↔ −49,4 km/Ma über 8,9 km.
- `kont` sprang > 100 km an 108 · 212 · 218 Naht-Paaren (E2 §0.3).

**In der Zeit:**
- `zeit.stetig`: 124 von 240 000 Material-Schritten > 1 km je 0,1 Ma, max 9,93 km; an Schlüsselbildern max 4,62 km (B Z. 42). Welle 2: 105 Sprünge, ROT (B2 Z. 352).
- `zeit.wechsel` 11 (max 641 m) → **0** (B2 Z. 362).
- Abschnitt-Wechsel: 3 von 20 400 Paaren springen, bis **273 m** (G2Z Z. 128). Der Täter ist `punktKern` (planet-core 1211–1212, Stand d660f478); er mischt im Nachklang nur hA.
- `zeit.schritt` 21/30, ROT (B2 Z. 353).

**Im Spiel-Fächer:** Der Abfluss springt je 20 km um Median 0,7 mm, p95 90 mm, max 281 mm (BRe).

### 2.3 Hypsometrie, Land und Gestalt

**Zwei Gipfel:**
- `hyps.bimodal` **28/30**, GRÜN (B2 Z. 319). Auf frischen Saaten erde-31…42 nur **8/12**, ROT (G2Z Z. 46).
- Spike FELDER: 5/5 mit zwei Gipfeln, Abstand 3,0–6,7 km. E4 hält 4/5 im 3–6-km-Band (E §0).

**Land und Ozean:**
- `land.anteil` **29,9 %** (Band 29 ± 4) · `schelf.anteil` 4,3 % · `hoch.anteil` 3,33 % (B2 Z. 320–322).
- Fläche unter −5 km: 5,4 % (Erde ~16 %). Schelf 0 bis −200 m: 1,5 % (B, „Nach dem Angriff“).
- `land.median` 0,767 km, ROT (B2 Z. 346).
- `ozean.alter` 65,4 Ma · `ozean.facette` 99,11 %, ROT · `kueste.dimension` 1,171 · `meer.volumen` 1,29 %, ROT (B2 Z. 328–332).
- Das Steady-State-Modell gab −6,0…−6,5 km bei 106 Ma mittlerem Alter (E §0 E5).

**Gestalt:**
- `land.ellipse` 0,837 · `land.stuecke4` 33, ROT · `land.fern1000` 8,3 % · `meer.binnen` 1,5 % (B2 Z. 333–336).
- `platten.zahl` 26/30 (größte 39,4 %), ROT (B2 Z. 325).
- Größte Gruppe 0,219 gegen Yule 0,558 (Erde 0,57) (BG). Mit EINER Gruppen-Funktion 0,426 (E2 Z. 100).

### 2.4 Gebirge an den Rändern

- `gebirge.vorn` **75 %**, ROT; in Welle 1 waren es 83 % (B2 Z. 327). Auf frischen Saaten 68 % (G2Z).
- `gebirge.guertel`: lang 6, auf Kontinent 74 %, ROT (B2 Z. 326).
- `gebirge.vorn.zeit` 84 / 83 %, GRÜN (B2 Z. 358).
- Spike PLATTEN: 90,4–94,1 % der Gipfel liegen an Konvergenz (E §0).
- `vulkan.zahl` Median 610,5 (min 247), ROT (B2 Z. 331).

### 2.5 Klima

**Köppen:**

| Klasse | Planet (B, „Nach dem Angriff“) | Erde (Peel 2007, E §5) | Band (E §5) |
|---|---|---|---|
| A | 16,0 % | 19,0 % | 9,5–28,5 |
| B | 33,1 % | 30,2 % | 15–45 |
| C | 9,8 % | 13,4 % | 6,7–20 |
| D | 17,7 % | 24,6 % | 12,3–37 |
| E | 21,8 % | 12,8 % | 6,4–19,2 |

- `klima.koeppen` E **22,4 %**, ROT (B2 Z. 347). Frische Saaten: B · C · E = 23,9 · 16,9 · 22,6 % (G2Z).

**Wüsten bei ±30°:**
- Es gibt KEINEN Messnamen für die Breite der Wüsten.
- `klima.global` prüft den Hadley-Rand mit 30 ± 4° (E Z. 277). B Z. 70 führt ihn GRÜN, nennt aber keine Zahl.
- `klima.wueste` BWh **9,4 %** (≥ 7 %), GRÜN (B2 Z. 348). Vorher 12,6 % gegen Peel 14,2 % (B Z. 194).

**Weitere Klima-Maße:**
- `klima.regenschatten` 38 %, ROT · `klima.gegenlauf` 66 %, ROT · `klima.eis` 8,8 % (B2 Z. 349–351) · `eis.kante` 9,25° (B2 Z. 366).
- Land-Niederschlag 567 → 578 mm (Erde ~750–800); Tropen 1 368 mm (B Z. 199).

### 2.6 Zeit und Drift

- `drift.cm_a`: p05 **0,65**, Median 2,85, p95 7,57 cm/a. ROT, weil p05 < 1 (B Z. 41).
- 0 → +50 Ma: 2,25 · 2,85 · 2,41 cm/a (BG).
- `superkontinent` 72 % (17/30), GRÜN (B2 Z. 356).
- `meer.zeit` −0,75 (B2 Z. 357); Spanne 478 m (B Z. 47).
- `zeit.statistik` 28 · 29 · 28 · 27 · 28 / 30 (B2 Z. 354).
- `zeit.rueckkehr` SHA cc2f8284 gleich (B2 Z. 355).
- `zeit.reise` hin und zurück **2 759/2 856**, ROT (B2 Z. 360).
- Spiegel am Ort: Δ ≡ 0 bei t = 0; +12,9 m bei −100 Ma; +21,8 m bei −200 Ma (ER Z. 16).
- Im Spiel vor 100 Ma: Meer +9,88 m (BR3 Z. 215).

### 2.7 Vielfalt über Saaten

- Es gibt keine eigene Linse. ≥ 100 Saaten und ein KS-Test sind ungemessen (E §7).
- Spannen aus den Blättern:
  - Platten 10–19 (E2 §0.3).
  - Land je Saat im Band 20–38 % (E §5).
  - Spike PLATTEN: Land 17,4 · 28,0 · 24,7 %.
  - Spike FAUL: Land 17,6–23,0 %.
- Vier GRÜN-Zeilen kippen auf frischen Saaten (G2Z Z. 4).

### 2.8 Die Reise im Spiel (BR3, h2-4)

- **Sprünge:** Heimat → heiß **7 243 ms**, dann 3 448 · 2 663 · 6 452 ms; heim 3 916 ms. Der Ladeschirm steht 2,3–5,6 s, die neue Scheibe kostet 258 ms (BR3 Z. 76–87).
- **Die vier Orte im Bild:**

  | | Heimat | heiß | kalt | Küste | −100 Ma |
  |---|---|---|---|---|---|
  | Bäume | 4 769 | 0 | 0 | 5 106 | 5 708 |
  | Grün | 56,5 % | 11,2 % | 0 % | 53,3 % | 1,0 % |

  - Kalt ist 100 % weiß mit 27,2 % Meer; die Küste hat 43,7 % Meer (BR3 Z. 61–65).
  - Der Heap am Ort liegt bei 354–2 004 MB (BR3 Z. 67). Über die Sprünge wächst er von 500 auf 1 975 MB (BR3 Z. 193).
- **Konsum:** 18/23 = **78 %** gelesen · 9/23 = 39 % im Mittagsbild sichtbar · 13 = 57 % über die Zeit (BR3 Z. 146–147).
- **Heimat byte-gleich:** 103/103 SHA (BR3 Z. 96).
- **Ankunft (S1):** t(Weltbild) 13,36 ↔ 13,15 s. Der Faden wird 2 174 ms nach dem Bild geboren.
- **Die vier Orte im Knoten (ER §3), Sommer/Winter und Küsten-Abstand:**

  | Ort | Sommer / Winter | Küste | Sonst |
  |---|---|---|---|
  | Heimat | 18,0 / −4,0 °C | 280 km | |
  | heiß | 38,5 / 17,0 °C | 965 km | Spende 0 |
  | kalt | −3,7 / −23,8 °C | 61 km | |
  | Küste | 29,1 / 21,9 °C | 46 km | |
  | −100 Ma | 20,1 / 1,0 °C | 155 km | |

---

## §3 GEFALLEN ODER EHRLICH OFFEN

### Wasser auf dem Planeten

- **Flüsse: keine.**
  - In `planet-core.js` trifft „Fluss“ nur den `sternFluss`.
  - Es gibt je Punkt nur die Zahl `abflussMm` (Turc-Pike, `planet-core.js:2077–2085`). Das Spiel liest sie als `spendeVerh` (`gelaende-core.js:5699`).
  - Das Flussnetz im Spiel stammt aus `gelaende-core` (< 24 km). Es ist headless belegt mit 293/293 Läufen, die in einem See oder im Meer enden (kapitel `planet.md` Z. 175).
  - Zur Großform schreibt E §7: kein Transport, keine Deltas, keine Becken > 1 000 km.
- **Seen: keine** (0 Treffer).
  - Das einzige stehende Wasser neben dem Ozean ist `meer.binnen` 1,5 % am 55-km-Gitter (B2 Z. 336).
  - Im Spiel folgt der See seit w28-reise-ort der Bilanz des Orts (`seeBilanz`, `gelaende-core.js:6382–6392`). `reise.see.spende` steht in BR3 Z. 198 noch offen; eine Messung des Schnitts steht in keinem gelesenen Blatt.
- **Grundwasser und Aquifer: keine** (0 Treffer). Die Leiter `planet.wasser.kreislauf` hat ab Sprosse 2 keinen Planeten-Bezug.

### Erosion

- Kein Prozess.
- `BEZUG_MA` 100 ist nur die „Erosionsbasis“, ein Bezugs-Spiegel (`planet-core.js:273`).
- `SEDIMENT_FUELLT` 0,3 ist gesetzt und füllt Kontinent-Becken pauschal (`planet-core.js:294, 1439`).
- Das Altern der Gebirge ist eine Zerfallsfunktion: `gedaechtnisHoehe` (`planet-core.js:1159`) mal (1−e^(−a/20)) (`planet-core.js:1190`).
- Die Linsen dazu sind ROT: `innen.altguertel` 4,6 % und `innen.streuung` 0,393 km (B2 Z. 343–344).

### Boden und Gesteinsart

- Keine.
- „Boden“ heißt in `planet-core.js` Ozean-Boden (`tBoden` Z. 1429, `bodenAlterMaxMa` Z. 324).
- `KRUSTE` kennt nur ozean/hang/schelf/kontinent (`planet-core.js:266`). `SCHICHT` ist eine Karten-Ebene, keine Gesteinsschicht (`planet-core.js:268`).
- E §7 nennt Gesteinsfolge, Bohrsäule und Gestein je Ort ungebaut.
- `planet.relief.boden` und `planet.geologie.lagerstaette` stehen auf HEUTE 0 (kapitel Z. 126, 207).
- Der Grund im Spiel folgt dem Klima (`kahlGrund`, heiß 167/133/92, BR3), nicht dem Gestein.

### Windfeld

- Wind kommt nur als Zell-Funktion der Breite.
  - Passat und Westwind nach Held-Hou kommen aus der Drehung (`planet-core.js:1910, 1958–1961`).
  - Je Punkt entstehen `windOst`/`windNord` (`planet-core.js:2082`).
- Es fehlen Druckfeld, Fronten und ein Feld der Ozeanströmung (E §7).
- `planetOrt` liefert `wetter.windX/windZ` (`planet-core.js:2336`) samt Δ (`planet-core.js:2278`).
  - `ORT_FELDER.wetter` trägt aber nur regenQuote/sturmQuote (`gelaende-core.js:5701`).
  - Die Windrichtung hat also **keinen Leser** (`reise.wind.richtung`, BR3 Z. 206).
- `klima.gegenlauf` 66 % und `klima.regenschatten` 38 % sind ROT.

### Tageslauf aus der Breite

- Keiner.
- `tagStunden` 24 liest nur die Zell-Breite und Coriolis (`planet-core.js:1910`).
- `neigungRad` liest nur das Planeten-Klima (`planet-core.js:1891, 2052`).
- Die Sonne des Spiels hat keine Breite: `sonnenRichtung` (`welt-licht.js:711–717`). Die Meeus-Bahn fiel an gate:tag-achse:echt (`welt-licht.js:702–710`).
- Die Tageslänge ist Spielzeit: `dayLengthMinutes` (`stamm/werkstatt-hud.js:1988–1997`).
- Gelesen wird nur die Δ-Amplitude `tagAmp` (`ORT_FELDER.klima`, `gelaende-core.js:5699`).
- Ungelesen bleiben `reise.sonne.breite` und `reise.pol.hoehe` (ER §1, BR3 Z. 206).

### ROT in der End-Tafel Welle 2 (B2 Z. 325–383)

- **Platten und Gebirge:** `platten.zahl` · `gebirge.guertel` · `gebirge.vorn`.
- **Ozean und Vulkane:** `ozean.facette` · `vulkan.zahl` · `meer.volumen`.
- **Gestalt und Grenzen:** `land.stuecke4` · `kont.naht/kueste` · `grenze.bogen` · `grenze.stufe` · `relief.messer`.
- **Klima-Kanten:** `klima.kante.flach` · `klima.sprung20`.
- **Inneres:** `innen.streuung` · `innen.altguertel` · `innen.schild` · `land.median`.
- **Klima:** `klima.koeppen` E · `klima.regenschatten` · `klima.gegenlauf`.
- **Zeit und Bytes:** `zeit.stetig` · `zeit.schritt` · `zeit.reise` · `bytes.streifen` 174 ms.
- **Unter Last:** `zeit.sprung` kalt und `ort.kosten`.
- **Dazu:** `drift.cm_a` p05 (B Z. 41) und `kosten.punkt` ≤ 8 µs (B Z. 76).

### Offen in der Reise (BR3 Z. 190–206)

- `reise.tuer`: der Sprung reißt ≤ 5 s an 2 von 4 Orten, und überall steht ein Ladeschirm.
- `reise.platz`: der Heap wächst.
- `reise.siedlung`.
- `reise.see.spende`.
- `reise.landung`: 23/400 = 5,8 %.
- `reise.arten`.
- `reise.sonne.breite`, `reise.wind.richtung`, `ort.leit.leser`.
- Der Süden wurde nie gesehen.
- Der Kragen (§6 Schritt 2) ist nicht in der Welle (E2 Teil 2).

### Draußen nach E §7

- Mantel-Konvektion · `kruste.bilanz` · andere Regime · Krater.
- `eis.spektrum` (CO₂, Schneeball, Milankovitch, Mond, Tageslänge über t).
- Erd-Saat ≠ Erdgeschichte · Sonnensysteme.
- ≥ 100 Saaten und KS.
- G1.5 ist zurückgenommen (B2).

---

## §4 SPROSSEN-TAFEL (aus `meisterkarte-2.json` per `f-sprossen.cjs --tafel`, nicht abgetippt)

**Was die Tafel trägt:**
- Leitern: **36**.
  - 26 sind `planet.geologie|relief|wasser|wetter|zeit|erde.*`.
  - 10 sind `same.*` mit „entfaltung“ oder „massstab“ in der id. Kein `same.*` trägt „funktion“; „sprung“ trifft `same.massstab.sprung`.
- Sprossen: **255** (180 Planet + 75 same). Alle stehen in `f-sprossen.json`.
- Die Karte steht auf 2026-11-14, die Preis-Fassung auf 2026-11-15.

**Spalten:**
- Kopf: id, die Zahl der Sprossen, heute/kern aus der JSON.
- Je Sprosse: Umfang — Tiefe, gekürzt auf ≤ 25 Wörter.
- Richter: gekürzt auf ≤ 25 Wörter.

**Neben dem Filter:**
- `same.kopplung.zeitreise` und `same.kopplung.erdsaat` passen nicht zum Filter und fehlen deshalb.
- Die Kapitel-Leitern `planet.zeit.reise`, `planet.relief.massstab`, `planet.zeit.fossil` und `planet.kosmos.reise` gibt es in meisterkarte-2 nicht mehr. `zusammengelegt` führt sie nach `erleben.spieler.zeit`, `same.massstab.*`, `leben.evolution.*` und `same.entfaltung.reise`/`same.massstab.sprung`.

| Leiter (Sprossen · heute/kern) | S | Sprosse (Umfang — Tiefe, ≤ 25 Wörter) | Richter (≤ 25 Wörter) |
|---|---:|---|---|
| `planet.geologie.platten` (9 · 0/0) | 1 | Region 10⁴ km² — Gebirge liegen in Gürteln, Gräben an Rissen — die Gestalt hat eine Ursache | 30 Saaten: Gebirgsfläche > 2 km liegt in Gürteln mit Achsen ≥ 4:1 in ≥ 70 %; Blindpaar Schummerung gegen reale Region |
|  | 2 | Kontinent 10⁶ km² — bimodale Hypsometrie, Schelf, Tiefseegraben | 100 Saaten: Höhenhistogramm mit zwei Gipfeln im Abstand 3–6 km in ≥ 90 % |
|  | 3 | Kugel von Mondgröße 4·10⁷ km², Orbit bis Boden ohne Ladebild — Horizont krümmt sich, Gürtel umspannen die Kugel | Horizont-Senkung im Bild = acos(R/(R+h)) ±0,1° bei 1, 10, 100 km; Blindpaar Orbitbild gegen Relief-Globus |
| `planet.geologie.vulkan` (7 · 0/0) | 1 | Lava als Decke einer Zelle — Newton-Abkühlung, Glut über dem Draper-Punkt, erstarrt zu Stein, Dampf am Wasser; fließt nicht | Kruste bildet sich und die Glut verlischt im Bild nach der Abkühlkurve gemessener Laven ±30 %; Blindpaar Glutbild gegen Lava-Foto (2AFC ≤ 85 %) |
|  | 2 | ein Strom 1 km, ein Ausbruch — Strom fließt, bildet Front und Kruste | Frontgeschwindigkeit auf 10°-Hang 0,01–10 km/h; Blindpaar Clip gegen Ausbruchsfilm |
|  | 3 | ein Vulkan 10 km wächst aus seinen Ausbrüchen — Schild, Strato, Caldera, Kegel ENTSTEHEN aus der Zähigkeit | 30 Saaten verschiedener Zähigkeit: Flankenneigung folgt ihr (Schild 2–10°, Strato 25–35°) in ≥ 90 %; Profil gegen reales Gegenstück ≤ 15 % |
| `planet.geologie.gebirge` (7 · 0/0) | 1 | jede Felswand trägt ihre Verformung — gefaltet, gekippt, versetzt nach der Geschichte des Orts | Blindpaar Felswand gegen Foto; in Kollisionszonen ≥ 80 % der Wände verformt, im alten Kraton ≤ 20 % |
|  | 2 | ein Orogen 10⁵ km² — Kammhöhe, Breite, Isostasie | Hypsometrie des Orogens gegen Alpen-/Himalaya-Profil ≤ 20 % |
|  | 3 | Beben einer Region über ein Spieljahr, fühlbar — Gutenberg-Richter, Herd an Verwerfungen | b-Wert 0,8–1,2; ≥ 90 % der Epizentren an Verwerfungen; Boden und Häuser bewegen sich mit der Magnitude |
| `planet.geologie.unterwelt` (6 · 0/0) | 1 | Höhlen-Feld bis ~28 m unter Basis, Mündung im Fels — Wurm, Kaverne, Halle; Mund nur an der Felsflanke | Mündungen je km² an 3 Saaten im Band; Mund im Bild an ≥ 90 % im Fels |
|  | 2 | Karsthöhle 1 km — nur in löslichem Gestein; Tropfstein, Quelle am Ausgang, Doline über dem Hohlraum | ≥ 90 % der Höhlen in Karbonat; ≥ 80 % entwässern zu einer Quelle; Dolinen- gegen Höhlendichte r ≥ 0,7; Blindpaar Karstfeld |
|  | 3 | System 10 km — unterirdischer Fluss, Siphon, Einsturzdoline | 10 km am Stück begehbar; Höhlenplan-Statistik (Verzweigung, Querschnitt) im Band realer Systeme |
| `planet.geologie.lagerstaette` (6 · 0/0) | 1 | Gestein je Ort aus seiner Genese — magmatisch, sedimentär, metamorph sichtbar verschieden und passend zum Ort | Jury trennt drei Genesen ≥ 80 %; Genese passt zur Geschichte des Orts ≥ 85 % |
|  | 2 | geologische Karte einer Region 10⁴ km² — Gestein folgt Tektonik und Alter | Blindpaar geologische Karte gegen reale |
|  | 3 | Lagerstätten eines Kontinents — Kohle, Salz, Kupfer, Seifengold, Öl, Bändereisen entstehen aus Becken- und Erzgeschichte | Prospektor-Probe an 30 Saaten: Fundquote nach Zeichen ≥ 5× blindes Bohren |
| `planet.geologie.inneres` (6 · 0/0) | 1 | Kompass auf einem Dipol-Planeten, 20 Orte — Deklination und Inklination nach Ort | Inklination ≤ 5° gegen Dipol an 20 Orten; Deklination ändert sich mit dem Ort |
|  | 2 | Umpolung über 10⁶ Jahre — Feldgeschichte im Gestein des Ozeanbodens | Magnetometer-Flug über den Rücken: Streifen spiegelsymmetrisch in ≥ 90 % der Saaten |
|  | 3 | Wärme an der Oberfläche, 10² Quellen — Geysire, heiße Quellen, Schwarze Raucher nur über Wärme-Anomalien | ≥ 95 % der Geysire über Anomalien; Intervalle Minuten bis Stunden |
| `planet.geologie.einschlag` (7 · 0/0) | 1 | ein Krater als Form — Napf ↔ komplexer Krater mit Zentralberg, Übergang nach der Schwere | einfache Krater Tiefe/Durchmesser 1:5 ±20 %; Profil gegen reale Krater ≤ 15 % |
|  | 2 | ein Einschlag als Ereignis — Feuerball, Druckwelle, Auswurf, Strahlen | Krater-Durchmesser gegen Energie nach Pi-Skalierung ±30 %; Blindpaar gegen Kraterfoto |
|  | 3 | Kraterfeld einer Region 10⁴ km² — Größen-Häufigkeit nach Potenzgesetz | N(> D) ∝ D^−2 ±0,5 |
| `planet.relief.grossform` (7 · 0/0) | 1 | 1 Saat, Flussnetz bis zum Horizont — jeder Lauf endet in See oder Meer | im Spiel an 20 Orten nachgefahren: 100 % der Läufe enden in See oder Meer |
|  | 2 | 10² km², 20 Saaten — Hack-Gesetz L ∝ A^0,5–0,6, Bifurkation 3–5 | ≥ 80 % der Saaten tragen beide Kennzahlen im sichtbaren Netz |
|  | 3 | 10⁴ km², 50 Saaten — Hangverteilung und Hypsometrie-Integral wie ein Erd-DEM gleichen Klimas | Wasserstein-Abstand der Hangverteilung ≤ 3° in ≥ 80 % |
| `planet.relief.formschatz` (8 · 0/0) | 1 | 3 Klassen — V-Tal/Trog, Aue, Schichtstufe aus dem Profil-Gesetz | Blind-Klassifikation von Ego-Bildern an 20 Saaten ≥ 80 % |
|  | 2 | 10 Klassen, Wasser voll; Region 2 km — Mäander mit Prall/Gleithang, Schwemmfächer, Talsee, Wasserfall, Terrasse; das Ufer liest als Ufer | Blind-Klassifikation ≥ 80 % je Klasse; plausible Ufer-Bilder an 50 Zufallsorten ≥ 70 % |
|  | 3 | 30 Klassen, 4 Agenzien, 10 km Küste und Binnenland — Delta, Lagune, Strand, Kliff, Kar, Moräne, Barchan, Badlands — wo Wellenenergie, Tidenhub, Sediment, Gefälle sie … | 200 Orte aus 20 Saaten: Bild-Klasse = Klasse, die die Prozessgrößen vorhersagen, ≥ 70 % |
| `planet.relief.boden` (6 · 0/0) | 1 | Fels und Erdboden eines Orts — Schutt, Flechte, Moos nach Steile und Feuchte; Erdboden in der Farbe seines Klimas | Blindpaar Ego-Bild gegen Foto gleichen Hangs und Klimas (2AFC ≤ 85 %); an 30 Zufallsposen liegt Schutt am Steilen und Moos im Feuchten wie im … |
|  | 2 | 1 Bodenart-Feld, Planet — Korngröße aus Herkunft (Hang, Aue, Wind) | Korngröße im Bild nimmt stromab ab: Rang ≥ 0,7 an 20 Läufen |
|  | 3 | Horizonte überall — O/A/B/C im Anschnitt, Mächtigkeit aus Bodenproduktion − Abtrag | Graben an 50 Zufallsorten: Horizonte sichtbar; Kuppe dünner als Unterhang in ≥ 90 % |
| `planet.relief.wandel` (7 · 0/0) | 1 | 1 Graben — Wasser im Spieler-Graben vertieft ihn, Sediment setzt sich am Fuß ab | Volumen-Bilanz Abtrag = Ablagerung ±10 %, sichtbar in ≤ 10 min Spielzeit |
|  | 2 | 1 ha, 1 Starkregen — Rinnen, Schwemmkegel, Hangrutsch an Übersteilung | Zahl neuer Rinnen wächst mit der Regenmenge, Rang ≥ 0,8 an 10 Läufen; Bildpaar vorher/nachher |
|  | 3 | 10 km Fluss, 10² Jahre — Mäander wandert, schnürt Altarm ab, Hochwasser legt Auenlehm ab | Migrationsrate 1–5 % Breite/Jahr; Abschnürung tritt ein; Bildfolge gegen Landsat-Zeitreihe |
| `planet.wasser.seegang` (8 · 0/0) | 1 | eine Wasserfläche, 12 Posen — spiegelt Ufer und Himmel | spiegelTreue ≥ 0,6 an 12 Posen (Uhr × Wetter) in Ausgabe-Größe |
|  | 2 | Meer, See, Fluss je eigene Bewegung — Weißkappen-Anteil wächst mit dem Wind | Weißkappen-Anteil im Bild bei 5/10/20 m/s gegen Monahan ±30 % |
|  | 3 | offene See bis 2 km Sicht — Seegang aus Wind × Fetch, Beaufort 0–12 | Blindtest 10 Bilder je Beaufort-Stufe, ≥ 70 % richtig zugeordnet |
| `planet.wasser.gezeiten` (7 · 0/0) | 1 | 1 Küste, 24 h — halbtägliche Mondgezeit 12 h 25 min | Watt fällt sichtbar trocken: benetzte Fläche Ebbe gegen Flut im Bild, Periode ±2 % |
|  | 2 | 30 Tage — Spring- und Nipptide aus Mond und Sonne | Pegel über 30 Tage: Spring-Nipp-Takt 14,8 d ±2 % |
|  | 3 | jede Küste einer Region 10³ km — Tidenhub aus Schelfbreite und Buchtform, amphidromische Punkte | 20 Küsten aus 5 Saaten: Hub gegen Resonanz-Vorhersage ±30 %; ≥ 1 Bucht > 8 m je 10⁴ km² Küste |
| `planet.wasser.stroemung` (7 · 1/0) | 1 | Flüsse einer Region — Strömung längs Gefälle trägt Schwimmer, Boot, Tier | Treibgut-Probe an 4 Fluss-Orten > 0,5 m in 90 Takten, im Spiel mit Bild |
|  | 2 | sichtbares Fließen — Strähnen, Wirbel hinter Steinen, Kehrwasser | optischer Fluss zweier Bilder 0,5 s auseinander: längs/quer ≥ 1,5, Richtung ±20° an 12 Posen |
|  | 3 | Küste und Mündung, 10 km — Brandungsrückstrom, Küstenlängsstrom, Gezeitenstrom, Salzkeil | Rip-Ströme ≥ 1 je 500 m brandender Küste; Treibrichtung gegen Welleneinfall ±20° |
| `planet.wasser.eis` (7 · 0/0) | 1 | Schnee einer Region — Decke kommt und geht mit Saison und Höhe, trägt und gibt nach | Schneegrenze gegen Nullgrad-Höhe ±150 m an 10 Posen × 4 Jahreszeiten; Fuß sinkt ≥ 5 cm |
|  | 2 | Seen frieren zu — Eis wächst mit Frost, Salz senkt den Gefrierpunkt, trägt erst ab tragender Dicke | Spieler geht bei Frost auf dem See, bricht bei Tauwetter ein; Einsetzen gegen Frostgrad-Summe ±20 % |
|  | 3 | Meereis 10⁶ km² — Packeis, Schollen, Rinnen; Fläche folgt der Saison | Verhältnis Winter/Sommer gegen Arktis ±30 %; Blindpaar Scholle |
| `planet.wasser.kreislauf` (6 · 1/0) | 1 | Region 2 km — Sturm hebt den Fluss mit Verzug, Dürre senkt ihn; Bilanz geht auf | Pegel nach Sturm im Bild; Scheitel-Verzug gegen Einzugsgebiet im Erd-Band; Regen × Fläche ↔ ΔVolumen ±10 % |
|  | 2 | Aquifer als Volumen — Quellen, Brunnen, Feuchtgebiet, wo der Spiegel das Gelände schneidet; Brunnen senkt den Spiegel | Grube unter dem Spiegel füllt sich bis zu ihm ±0,1 m; Quellen ≥ 90 % an Spiegel-Austritten; Entnahme: Absenkungstrichter, Quelle flussab versiegt |
|  | 3 | Monate — Bodenfeuchte als Gedächtnis | nach 60 Tagen ohne Regen: Wiese braun gegen Dürrefoto, Fluss ≥ 50 % Querschnitt verloren |
| `planet.wasser.tiefsee` (6 · 0/0) | 1 | See, Fluss 0–10 m — Licht verliert je Kanal, Sicht nach Trübung | Rot-Anteil fällt bis 5 m auf ≤ 30 %; Sicht gegen Secchi-Referenz ±30 % |
|  | 2 | Küstenmeer 0–40 m — Kaustik, Sandrippel, Dünung spürbar | Blindtest 50 Posen gegen Taucherfotos ≥ 60 %; Rippel-Abstand gegen Wellen-Orbital ±30 % |
|  | 3 | Schelf bis 200 m — Dämmerung, Sprungschicht, Kälte | Lichtrest bei 200 m ≤ 1 %; Sprungschicht im Temperaturprofil des Tauchgangs |
| `planet.wetter.lagen` (7 · 1/0) | 1 | 5 Wetter-Zeilen, Bänder ziehen über wenige km — Wetter wandert | Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 % |
|  | 2 | Region 10² km — Frontpassage in Erd-Abfolge | 50 Frontpassagen aus 50 Saaten: Abfolge Cirrus → Nimbostratus → Schauer, Druckfall, Winddrehung stimmt ≥ 80 % |
|  | 3 | Kontinent 10³ km — Tief mit Lebenslauf 3–7 Tage | Blindtest 20 Draufsichten gegen Satellitenbild: Trefferquote ≤ 60 % |
| `planet.wetter.wolken` (7 · 0/0) | 1 | EINE Wolkenschicht 800 m, Karte ≈ 8 km — Licht aus der Atmosphäre, Schatten ziehen | Zeitraffer der Schicht gegen Zeitraffer-Film realer Schichtwolken (2AFC ≤ 85 %); Zuggeschwindigkeit der Schatten am Boden im Band realer Wolkenzüge (2–20 m/s) und gleich der … |
|  | 2 | Himmel bis zum Horizont, drei Stockwerke — Silberrand, dunkle Basis, Gegenlicht | Blindtest 20 Himmelsbilder gegen Foto ≤ 70 %; Gattung vom Bildmodell erkannt ≥ 80 % |
|  | 3 | jede Wolke entsteht und vergeht — Gattung folgt aus Feuchte, Hebung, Stabilität | 200 Momente × 20 Saaten: sichtbare Gattung = verlangte ≥ 80 %; Cumulus-Gipfel 14–17 Uhr in ≥ 80 % |
| `planet.wetter.klimazonen` (7 · 1/0) | 1 | 1 Klima, Höhe gestaucht — Jahres- und Tagesgang, Schneegrenze | Temperatur am Meer 18/−4 °C, Schneegrenze folgt der Saison |
|  | 2 | 1 Gebirge in Erd-Höhe — Höhenstufen wie auf der Erde | Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 % |
|  | 3 | 3 Klimata in einer Welt — Kontinentalität: Jahresamplitude wächst mit der Meeresferne | Jahresamplitude gegen Meeresabstand Rang ≥ 0,7 an 30 Orten |
| `planet.wetter.extreme` (6 · 0/0) | 1 | Flut über Tage, ein Fluss — Fluss verlässt das Bett | nach 100 mm Starkregen: Überflutung ≥ Aue, Bildpaar |
|  | 2 | Hitze- und Kältewelle, eine Region — Welle aus Blockierlage | Dauer und Amplitude gegen Erd-Statistik gleichen Klimas ±50 % |
|  | 3 | Wiederkehr über 10² Jahre — Jahrhundertflut, Jahrhundert-Hitze | GEV-Anpassung der Jahresmaxima: 100-a-Wert innerhalb Faktor 2 der Erd-Erwartung |
| `planet.wetter.vorhersage` (6 · 0/0) | 1 | Stunden — Regen kommt aus der Windrichtung | 100 Regenbeginne: Bedeckung stieg in den 60 min davor aus der Windrichtung in ≥ 70 % |
|  | 2 | ein Tag — Zeichen der Front 6–24 h vorher | Bildmodell, das NUR den Himmel sieht: Regen in 12 h mit Skill ≥ 0,3 über Persistenz |
|  | 3 | Tage — Druck und Wind am Ort lesbar | Vorhersage aus Spiel-Beobachtung: Skill ≥ 0,2 über Klimatologie bei 3 Tagen |
| `planet.wetter.fremde-atmosphaeren` (7 · 0/0) | 1 | 1 Atmosphäre (Erde), parametrisch — Rayleigh, Aerosol, Ozon | Himmelsfarbe Mittag/Abend gegen Foto |
|  | 2 | Gas, Druck, Stern als Zufallsparameter — Himmelsfarbe folgt aus ihnen | Mars-Parameter: blaue Dämmerung, butterfarbener Tag gegen Rover-Fotos; Titan: oranger Dunst gegen Huygens, Farbton ±10° |
|  | 3 | 10³ Welten: was eine Welt hält — Atmosphäre aus Fluchtgeschwindigkeit und Einstrahlung | 1 000 Welten: Atmosphäre gegen die Zahnle-Catling-Grenze richtig eingeordnet ≥ 90 % |
| `planet.zeit.klimageschichte` (9 · 0/0) | 1 | 10² Jahre — Treibhaus-Drift verschiebt Schneegrenze und Küste | +100 a bei +2 °C: Schneegrenze +300 m ±30 %; Küste wandert um Δh/Strandneigung ±25 % |
|  | 2 | 10⁴ Jahre — Eiszeit: Meer −120 m, Landbrücken, Eisrand | Erd-Saat −21 ka: Meer −120 ±10 m, Landbrücke begehbar, Eisrand gegen LGM-Rekonstruktion, global −6 ±2 °C |
|  | 3 | 10⁶ Jahre — Glazialtakt 41/100 ka | Spektrum der im Spiel gemessenen Eisbedeckung über 3 Ma: Gipfel bei 41 ±5 und 100 ±15 ka; Eis gegen Meeresspiegel r ≤ −0,8 |
| `planet.zeit.archiv` (8 · 0/0) | 1 | Schicht als Form im Tafelland — harte und weiche Bank: Kliff, Schutthang am Ruhewinkel | Kliff 60–85° und Schutthang im Bild an Tafelland-Saaten |
|  | 2 | Schichten mit Gesteinsart, 1 Wand — Farbe und Korn je Lage aus dem Ablagerungsmilieu | Bildvergleich gegen Fotos des Colorado-Plateaus (Farbbänder, Rhythmus) |
|  | 3 | Schichten mit Alter, 10⁴ a am Ort — Absetzrate, Warven; Grenzen setzen sich stetig fort | Grabung 3 m: Lagen = Ablagerungs-Episoden der bereisten Geschichte ±10 %; Grenzen stetig über ≥ 100 m |
| `planet.erde.gestalt` (6 · 0/0) | 1 | EINE Region der Erde, 10⁴ km² (ein Golf mit Vulkan) — Küste, Hauptgipfel, Hauptfluss liegen, wo sie liegen | Küstenlinie gegen das Höhenmodell: mittlerer Lagefehler ≤ 5 km; Ortskundige wählen die Region aus 10 Kandidaten an 3 Ego-Bildern ≥ 70 % |
|  | 2 | ein Kontinent — Gebirgsgürtel, Ströme, Wüsten, Klimazonen an ihrem Ort | Lagefehler der 100 größten Formen ≤ 50 km; Köppen-Klasse an 1 000 Punkten richtig ≥ 80 % |
|  | 3 | die ganze Erde heute, Orbit bis Boden — Kontinente, Meere, Eis, Biome | Orbitbild gegen Satellitenmosaik: Panel-2AFC ≤ 70 %; Küstenlinie p90 ≤ 20 km |
| `same.entfaltung.gleichheit` (8 · 0/0) | 1 | Gelände am Spawn — Höhenform gleich | Bild G2 ↔ G3 gleiche Pose: Horizont-Linie ≤ 2 px Abweichung |
|  | 2 | Dorf: Häuser, Bäume, 10 Taten eines Spielers — Klassen gleich; Spieler B sieht die Taten von A, auch nach Reload | Klassen-Masken-Diff ≤ 1 % (A ↔ B, vor ↔ nach Reload, Radeon ↔ GTX) |
|  | 3 | Stadt mit Bewohnern in Bewegung, alle Teil-Simulationen, 20 min — Personen ≤ 0,5 m nach 10 min; Wetter, Leben, Pegel, Brand ohne Zustands-Nachricht | zwei Geräte in EINER Sitzung: Masken + Positionen; Netz-Log zeigt nur Akten |
| `same.entfaltung.schirm` (7 · 0/0) | 1 | Wiese und Genesis, Sicht 8 km — Wiese trägt bis ~20 m, Häuser als Kästen | Frame p95 je Gerät, Wiese und Genesis, Ego und Third |
|  | 2 | 10³ Häuser im Blick (heute 300 am Marktplatz) — ≥ 50 % der Häuser im Blindtest gegen Fotos echter Altstädte plausibel | p95(×10) ÷ p95(×1) ≤ 1,10; Blindtest Bildpaar Spiel ↔ Foto |
|  | 3 | 10⁴ Gebäude und 10⁴ Menschen im Bild (Kreuzung einer Großstadt) — jeder Mensch mit eigenem Leib und Gang | wie 2; Dichte-Histogramm gegen Foto einer Großstadt-Kreuzung |
| `same.entfaltung.reise` (8 · 0/0) | 1 | Gehen 1 km durch die Wiese — Bilder ganz, sichtbares Nachwachsen nur fern | Gang-Bahn: Anteil ganzer Bilder ≥ 98 % |
|  | 2 | Fahrt 30 km/h, 10 km durchs Dorf — ≥ 90 % der Bilder ganz | Fahrt-Bahn, Bild-Diff je Bild gegen Ruhe-Referenz |
|  | 3 | Fahrt 120 km/h, 100 km am Stück — ≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px | wie 2 über 100 km |
| `same.entfaltung.abwesenheit` (7 · 0/0) | 1 | 118 Bewohner einer Test-Stadt, ein Tag — nach der Abwesenheit steht jeder, wo er gestanden hätte | Ort sehen, gehen, nach N h zurück: Lage jedes Bewohners gegen den Lauf mit Zuschauer ≤ 1 m |
|  | 2 | 10⁴ Wesen (Menschen, Tiere, Wuchs), 1 Tag — Widersprüche = 0 (niemand an zwei Orten, gefällt bleibt gefällt) | Klassen-Statistik Rückkehr ↔ Zuschauer-Lauf ≤ 5 %; Widerspruchs-Zähler = 0 |
|  | 3 | 10⁶: eine Metropole, 1 Jahr — Ströme, Märkte und Bauten wachsen nach Gesetz | wie 2 an 100 Stichproben; Bildpaar Stadtteil vorher ↔ nachher zeigt die Veränderung |
| `same.entfaltung.vielfalt` (7 · 0/0) | 1 | 10 Orte EINER Welt — jeder Ort aus einem Bild erkannt; das Merkmal hat eine Ursache (Gestein, Klima, Kultur) | aus einem Zufallsbild den richtigen von 10 Orten ≥ 80 % (Panel); der Prüfer nennt das Merkmal, Gegenlauf: Ursache getauscht → Merkmal weg ≥ 80 … |
|  | 2 | 10² Orte: Stadtteile und Biome mit eigenem Charakter — ≥ 3 Gesetze tragen den Unterschied zugleich (Bau, Wuchs, Tracht) | richtiger von 10 Zufalls-Orten aus 10² ≥ 80 %; Unterschied in ≥ 3 Domänen benannt |
|  | 3 | 10³ Orte, 10 Regionen einer Welt — Region aus einem Bild; Nachbar-Regionen gehen ohne Naht ineinander über | Region ≥ 80 %; Übergangs-Bilder werden zwischen die Nachbarn eingeordnet, nie zu einer dritten |
| `same.entfaltung.akte` (8 · 1/0) | 1 | 10² Taten einer Sitzung — nach dem Reload steht jede Tat sichtbar an ihrem Ort | Bildpaar vor ↔ nach Reload ≤ 1 % Diff mit Pflicht-Inhalt, beide Geräte |
|  | 2 | 10³ Edits eines Spielers — Stand ≤ 100 kB, Ankunft unverändert | Bildpaar ≤ 1 %; Median ≤ 100 B je Tat; Ankunft mit ↔ ohne Taten |
|  | 3 | 10⁴ Edits, 2 Peers, jede alte Version — gleich ohne Zustands-Nachricht, alte Stände laden | Bild zweier Gäste ≤ 1 % Diff; Anteil ladender alter Stände = 100 % |
| `same.massstab.spanne` (9 · 0/0) | 1 | 3 Größenordnungen: Bildbreite ~1 m bis ~1 km — Wiese, Baum, Haus, Gelände wechseln Stufen unsichtbar | N = 20 Saaten × Steigflug 0,5 m → 700 m Auge in 30 s, hin und zurück: alle Bruch-Bedingungen gehalten |
|  | 2 | 5: 1 cm bis 1 km; Sicht bis ~20 km ohne Kante — Halm und Blatt mit Parallaxe und Eigenschatten; Landschaft ohne Farbsprung | wie 1, Spanne 1 cm → 1 km |
|  | 3 | 8: 1 mm bis 100 km; der Planet krümmt sich — Korn als Körper; Horizont sinkt wie auf einer Kugel | wie 1; Horizont-Absenkung aus 10 km gegen √(2h/R) ±10 % |
| `same.massstab.nahe` (7 · 0/0) | 1 | 2 m (Blick vor die Füße), N = 100 Orte — Boden mit Halmen und Steinen | Spektrum gegen Foto der Bodenklasse: Energie über 1/20 der Bildbreite ≥ 50 % der Referenz in ≥ 80 % |
|  | 2 | 50 cm — einzelne Halme, Kiesel, Laubstreu | wie 1 gegen Foto 50 cm; Gram-Statistik im Band |
|  | 3 | 10 cm — Blattadern, Rindenrisse, Bodenkrümel mit Eigenschatten | wie 1 gegen Makrofoto 10 cm |
| `same.massstab.sprung` (8 · 0/0) | 1 | Teleport 1 km — Bild ganz, die Welt steht | Spielgang-Station Sprung: p95, t(ganz), Lücke |
|  | 2 | Teleport 1 km — wie 1 | wie 1 an beiden Geräten |
|  | 3 | Zufallsort im Umkreis 10–100 km — volles Bild am Boden | N = 20 Sprünge: p95 t(ganz) |
| `same.massstab.physik` (6 · 0/0) | 1 | 1 Größenordnung (0,5–5 m: Mensch, Wagen, Kiste) — Fall, Stoß, Fahrt plausibel | Fallzeit aus 10 m gegen √(2h/g) ±5 %; Bremsweg gegen μ ±10 % |
|  | 2 | 3 (Ameise bis Haus) — die Ameise überlebt den Sturz, der Mensch nicht | Endgeschwindigkeit eines 5-mm-Körpers ±20 % gegen ~6 m/s; Sturzfolge passend zur Größe |
|  | 3 | Flüssigkeit über den Maßstab — Tropfen unter der Kapillarlänge kugelig, darüber flach | Tropfenform gegen Bond-Zahl ±15 % bei 0,5 / 2,7 / 10 mm |

---

## §5 WIDERSPRÜCHE — Blatt ≠ Code auf main (b7ed8419)

**W1 — die Karte bucht die Tektonik als nicht vorhanden. Die härteste Lücke.**
- **Was die Blätter sagen:**
  - `meisterkarte-2.json` (beleg `planet.geologie.platten`) und kapitel `planet.md` Z. 64: „Stand 0: ebene Welt, Großform aus drei glatten Rausch-Feldern (gelaende-core.js:361-391) … Grep 14.11. ohne Treffer für Tektonik“.
  - Ähnlich `planet.zeit.klimageschichte`: „Meeresspiegel fest bei Basis − 3 m“ (Z. 467).
  - Ähnlich `planet.wetter.klimazonen`: „EIN Klima 18/−4 °C“ (Z. 385).
  - Ähnlich `planet.erde.gestalt`: „es gibt keine Erd-Saat“.
- **Was main trägt:**
  - den Platten-Kern `planet-h2-4`, im Manifest (`cores.manifest.json:60–63`),
  - gelesen von `voxel-worker.js:1155–1180` (`planetAnker`, `planetOrt`),
  - mit dem Spiegel als Δ am Ort (`ORT_FELDER.meer` `waterLevelM`, `gelaende-core.js:5700`),
  - mit dem Klima als Δ (`gelaende-core.js:5699`),
  - und mit 18/23 Feldern im Spiel gelesen (BR3 Z. 146).
- **Die Folge:** Keine Leiter nennt `planet-core.js`. Die Vision misst den Planeten, den es gibt, nicht.

**W2 — ENTSCHEID trägt zwei überholte Sätze.**
- **Manifest:** E Z. 145 sagt „Kern NICHT in `cores.manifest.json` und nicht in `index.html`“. Main trägt den Eintrag `planet` (`cores.manifest.json:60–63`) und den späten Lader `spaet.planet` (`stamm/gelaende-chunks.js:3450`). `index.html` hat 0 Treffer, das stimmt.
- **Jahr:** E §2 Z. 137 sagt `jahrTage 365,25`. Der Code hat 365 (`planet-core.js:264`, R5 `pruefJahr` 2181–2183). Die Brückenzahl in B (Spende 328,7 mm „(365,25)“) steht deshalb auf dem alten Jahr. Geheilt ist das nur in BR3 (F4), nicht im Entscheid.

**W3 — K4 sagt a, der Code tut b.**
- E K4 Z. 76 und der Kopf von `planet-core.js:21` sagen: H0·(1−e^(−a/20))·e^(−a/120).
- `gedaechtnisHoehe` (`planet-core.js:1159`) rechnet aber nach G2.1: H0·(e^(−a/120) + 0,15·e^(−a/1500)), mal (1−e^(−a/20)) an den Nähten (Z. 1190).
- Die erloschenen Ränder (Z. 1168) haben den Anstieg nicht.
- Der Kopf des Kerns ist an dieser Regel stale.

**W4 — G1 entschied Lappen ≈ 1, der Code fährt 1,5.**
- E2 Z. 101: „Es gilt Amplitude ≈ 1 im groben Band“. G1.2 nennt Amplitude 0,6 (Z. 152).
- `planet-core.js:279`: `LAPPEN_GROB = 1.5`. Das ist protokolliert in B2 Z. 16, aber kein Entscheid hebt E2 auf.
- Ebenso das Becken-Feld: Start c 5 (E2 Z. 154) gegen `BECKEN_C = 3.0` (`planet-core.js:284`; B2 Z. 18 „c 3“).

**W5 — der Code ist weiter als BR3.**
- **Siedlung:** BR3 Z. 196 führt `reise.siedlung` offen („jeder Ort trägt den Prüfplatz und ein Dorf“). Main trägt `ortGesetz(teil).siedlung` mit `platz` 0 am fremden Ort und `bau` 0 im Dauer-Frost (`gelaende-core.js:5753–5758`, `voxel-worker.js:1135`).
- **See:** BR3 Z. 198 führt `reise.see.spende` offen. Main trägt `seeBilanz` (`gelaende-core.js:6382–6392`).
- Für beide Schnitte steht in keinem gelesenen Blatt eine Messung.

**W6 — die Zwillinge aus E §7 leben weiter.**
- **Erdradius:** `ATMO_GESETZ.erdeM` 6 360 km (`foundry-core.js:291`; E nannte noch Z. 284) gegen `PLANET_ERDE.radiusKm` 6371 (`planet-core.js:263`).
- **Sonne:** Sie hat keine Breite (`welt-licht.js:711–717`), obwohl der Körper `neigungRad` 0,4091 trägt.
- **Wind:** `windX/windZ` werden geliefert (`planet-core.js:2336`), aber nicht gelesen (`gelaende-core.js:5701`).

**W7 — Bänder gegen Messung.**
- `planetPunkt` ≤ 8 µs (E §5) gegen 8,10–28,50 µs (B Z. 76, B2 Z. 65).
- `planetKlima` ≤ 25 µs an Land (E §5 bau2) gegen 100,9 µs (B2 Z. 163).
- `planetPlan` ≤ 25 ms gegen 41–58 ms (B2 Z. 66, BRe Z. 54).
- `planetOrt` ≤ 1 ms gegen 1,541 ms unter Last (B2 Z. 383).
- Kein Blatt hat die Bänder angepasst oder als gefallen markiert.

**W8 — Blatt ≠ Blatt: die Zählung driftet.**

| Quelle | Leitern | Sprossen | HEUTE |
|---|---|---|---|
| kapitel `planet.md` Kopf | 44 (35 + 9 Kopplungen) | 297 | |
| kapitel `planet.json` | 35 | 241 | |
| `MEISTERKARTE-2.md` Z. 13 | 26 | 180 | 0 |
| `meisterkarte-2.json` (summe planet) | 26 | 180 | **4** |

- Die vier HEUTE-Punkte der JSON sind `wasser.stroemung`, `wasser.kreislauf`, `wetter.lagen` und `wetter.klimazonen`, je 1. Kapitel `planet.md` führt jede dieser Leitern mit „HEUTE: 0“.
- `planet.zeit.klimageschichte` hat im Kapitel 8 Sprossen, in der Karte 9.

**W9 — Anker, sommerPhase und Zeilen sind gewandert.**
- ER §0 Nr. 8 sagt: `sommerPhase` nur absolut (planet-core 2271, 2321). Main dreht sie im Süden um +0,5 (`planet-core.js:2333`).
- Die Zeilen-Zitate in E2 (Stand d660f478: `schollenFeld` 974–995, `punktKern` 1211–1212, `ortAnkerRoh` 2207–2212) treffen auf main andere Stellen:
  - `neuSchnitt` liegt bei 548,
  - `schollenFeld` bei 1021,
  - `krusteFeld` bei 1055,
  - die Gedächtnis-Tafel bei 1158–1190,
  - `punktKern` bei 1218,
  - `pruefJahr` bei 2182,
  - `ortAnkerRoh` bei 2284.
