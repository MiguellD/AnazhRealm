# Lesen: Planet-Physik (planet-core.js ganz · gelaende-core.js Klima/Ort) — main 18058dba

Gelesen vollständig: planet-core.js 1–690, 1560–2397; gelaende-core.js 1–130, 1278–1622, 5674–6043.
Nur Gliederung (Funktionsköpfe): planet-core.js 690–1560 (Tektonik-Punkt), gelaende-core.js übrige Teile.

## (1) WAS TRÄGT — heute im Spiel konsumierte Gesetze, je mit Leser

- **Planet läuft im Spiel nur über zwei Aufträge** des Planet-Fadens: `planetAnker` (voxel-worker.js:1164) und `planetOrtAuftrag`
  (voxel-worker.js:1176). Der Plan entsteht mit `P.planetPlan(samen, P.PLANET_ERDE)` (voxel-worker.js:1159) — der KÖRPER ist
  für JEDEN Samen die Erde (R 6371, g 9,81, Tag 24 h, Jahr 365 d, Neigung 0,4091, Sternfluss 1, Alter 4 570 Ma; planet-core.js:263).
- `planetOrtAuftrag` liest nur auf den Satz „reise <Breite> <Länge> [<Zeit>]“ (voxel-worker.js:374; Stamm feld-leben.js:1282–1320).
  Die HEIMAT liest den Planeten NIE: `ortGesetz(null)` baut die Konstanten-Tafel (gelaende-core.js:5844–5872), Kommentar 5694.
- Klima-Gesetz des Planeten (Energiebilanz North 1975 + Gough + Walker + Held-Hou): `planetKlimaGlobal` planet-core.js:1883 →
  `planetKlimaR` :1950 (Zone, Höhe −6,5 K/km, Feuchte-Integral luvwärts 14×150 km, Regenschatten, Randströme, Monsun-Schub,
  Turc-Pike-Abfluss) → `planetBiom` :2098 → `pflanzenDeckung` :2143 → `ortRoh` :2304 → `planetOrt` :2290 (Δ zum Anker).
  Leser im Spiel: nur die fünf Δ-Gruppen, die voxel-worker.js:1194–1207 weiterreicht (klima sommer/winter/tagAmp/sommerPhase/
  spendeVerh, meer, wetter regen/sturm, wuchs decke/wald, wildnis).
- Ort-Tafel `ortGesetz(teil)` gelaende-core.js:5843 → `L.ort` jeder Lage (`lageAus` :5998). Ihre Leser im Leben:
  - `ortWuchs` :5735 (decke/oase/wald/gras/laub/nadel/sand/bilanz) → vegetation-baum.js:1354 (`wuchs.decke` × Strauch-Wahrscheinlichkeit),
    vegetation-wiese.js:2087 und :2513 (`decke`, `wald`), vegetation-streu.js:242 (`laub` als Schwelle gegen einen Hash),
    siedlung-ort.js:1700/:2558 (`ortBaum` :5779), siedlung-wege.js:2679 (`ortKraut` :5772), phyto-core.js:3225 (`wuchs.wald`),
    voxel-worker.js:4332 (`wuchs.wald`), Seen `seeBilanz` (gelaende-core.js:6041, `wuchs.bilanz`).
  - Klima `klimaHeute` → `temperaturFeld` :1321 → `temperaturAus` :1344; Leser Stamm `_temperaturFeld/_temperaturAt`
    (bild-himmel.js:2871), Schnee/Eis/Pegel (`schneePegel` :1467, `eisDicke` :1404, `abfluss` :1612; wasser-hydro.js:83–102),
    Lava/Hand (feld-leben.js:2484, :2509), Zündung (koerper-fahrt.js:2398).
- In der Heimat ist jeder Wuchs-Faktor genau 1 (Selbstprüfung gelaende-core.js:5865–5867) — die Pflanzen-Leser sind dort
  byte-gleich ohne Gesetz. **Kein Tier-Leser** (tetrapoda-core, stamm/kreatur-*, koerper-leib) liest Klima, Ort, Wuchs oder Planet.

## (2) WÜRFE UND TABELLEN

Planet-Körper (planetPlan, planet-core.js:311–327) — jede Körper-Größe ist ein gleichverteilter Wurf ohne Gesetz dahinter:
| Größe | Zeile | Wurf | Wirkung heute |
|---|---|---|---|
| radiusKm | :311 | 2500 + 9500·Z | keine im Spiel (PLANET_ERDE überschreibt) |
| g | :314 | 9,81·R/6371·(0,8+0,4·Z) — Dichte als Wurf ±20 % | keine (Erde); Klima liest g in Held-Hou :1910 |
| tagStunden / jahrTage / neigungRad | :319/:320/:318 | 10+40Z / 100+700Z / 0,7Z | keine (Erde); R5 bricht sonst beim Namen (:2182) |
| sternFluss / alterMa | :322/:323 | 0,8+0,4Z / 3000+3000Z | keine (Erde) |
| freibordKm, shelfKm, bodenAlterMaxMa | :317/:325/:324 | Würfe, NICHT in PLANET_ERDE | wirken je Samen auf Küste/Meer |
| wasserKm, krustenAnteil | :315/:316 | Würfe (Erde: 2,62 / 0,41 gesetzt) | — |
Tektonik-Würfe (ausreichend als Zufallsquelle eines Gesetzes, nicht als Gesetz): Schollen-Zahl 20–40 :331, Ozean-Platten 3–6 :332,
Schollen-Alter 1500–4000 Ma :344, Raten 35–95 / 45–85 km/Ma :514/:580, Abschnitts-Dauern :584, 300 Hotspots :608–613,
**28 Trapp-Ereignisse mit Zeit, Ort, Radius 250–750 km, Stärke** :615–625, Naht-Höhen :544.
Klima-Stellwerte „gesetzt“ ohne Anker (KLIMA :1857–1877): walker 0,9, tropoKm 10, Gürtel-Amplituden itcz 2600 / sturm 1100 /
grund 250 mm, absinken 0,85, trockenK 6, feuchteLand 0,35/0,5, Wind-Wellen-Feld 0,9·fbm :1965, Gürtel-Versatz 0,035·fbm :2055,
Jahres-Amplitude 5+28·cL K :2067, tagAmp 4+10·c :2080, Wetter-Quoten regen N/(N+900), sturm 0,03+0,25·… :2337.
Art-/Klassen-Tabellen:
- `KOEPPEN` 30 Klassen :1878 und `WHITTAKER` 11 Biome :1880, Schwellen-Treppe in `planetBiom` :2108–2129 (Literatur-Tafel, keine
  Physik der Pflanze). Leser im Spiel: nur `planetOrt().biom` — wird von voxel-worker.js:1194ff NICHT weitergereicht (tot im Spiel).
- Biom-Farben `F_WUESTE_H … F_SCHNEE` :2136–2137, `KOEPPEN_FARBE`, `TEMP_RAMPE`, `NIED_RAMPE` :2164–2169 — nur Atlas/Karte.
- **`ORT_WUCHS` gelaende-core.js:5722–5730: der ERD-KALENDER als Tafel** — Landpflanzen −470…−420 Ma, Wald −390…−360,
  Laub(Bedecktsamer) −110…−66, Gras −66…−23 (Strömberg 2011), Frost −3…3 °C, Nadel 24…16 °C, Sand 0…24 °C. Jeder Planet, jeder
  Samen, jede Tektonik bekommt dieselbe Erd-Evolution — die Pflanzen-Geschichte ist kein Ergebnis der Welt, sondern ein Datum.
  Wirkung: auf Reise mit Zeit ≠ 0 schalten Wald/Gras/Laub an diesen Daten (ortWuchs :5745–5747).
- `ORT_SIEDLUNG.mensch` −0,3…−0,012 Ma :5762 — der Mensch als Erd-Datum.
- Heimat-Klima `TEMPERATUR` :1313 (18 / −4 °C, ±5 K, Gipfel 15 Uhr, 365 d) — EIN Klima für die ganze Heimat-Welt, unabhängig
  von Samen und Planet; Höhen-Stauchung 0,11 K/m (`kuehlungKJeM` :5850).
- `SCHNEE.zungen` :1282 Rausch-Zungen; `vegetation-streu.js:242` Laub-Anteil gegen `hash>>>7` — Wurf mit Gesetz-Schwelle.
- Nicht in meinem Feld, aber im Auftrag benannt (gelesen): `_creatureBodySize` koerper-leib.js:2545 `_rollGenome(id,"creature-size")`
  → `VERHALTEN.groessen` tetrapoda-core.js:253 (vier Bänder 0,6–2,7); tetrapoda-core.js:1332 `g: 9.81` konstant.

## (3) GRÖSSEN MIT EINHEIT (lesbar für ein Erbe-/Evolutionsgesetz)

Vorhanden, je Same (über die Tektonik) und je Ort/Zeit verschieden — alles reine Funktion f(samen, φ, λ, t):
- Zeit: `zeitMa` ∈ [−4000; +1000] Ma (planet-core.js:30–32, :271), Schlüsselbilder verstreut/versammelt/gelöst :393–598
  (Superkontinent-Zyklen = Isolation/Kontakt von Landmassen), `planetOrtDerZeit` :2364 (wo lag dieses Stück Kruste zur Zeit t1).
- Global je t (`planetKlimaGlobal` :1914): sternFluss (rel.), tMittelC/tAequatorC/tPolC °C, eisBreite rad, zellBreite rad,
  zellen (Zahl der Hadley-Zellen). Meer je t (`planetMeer` :1628): meerKm, landAnteil, ozeanAlterMa, eisKm, eisFlaeche.
- Ort je t und Saison (`planetKlimaR` :2080–2091): tJahrC, tSommerC, tWinterC, tJetztC (°C), niederschlagMm, pJetztMm, abflussMm
  (mm/a), sommerAnteil, kontinental [0,1], windOst/windNord, luv/lee, stromK (K), feuchte, schneeKm (km), hoeheKm.
- Ort (`planetPunktR` :1650–1653): hoeheM, kont (km zur Küste), kruste, scholle, platte, randArt, randAbstandKm, randRateCmA,
  ozeanAlterMa, orogenStaerke/AlterMa/Aktiv, vulkanArt/AbstandKm/AlterMa/Aktiv; `planetVulkane` foerderKm3Ma :1710.
- Ereignisse mit Zeit: 28 Trapps (Zeit Ma, Radius km, Stärke km) :615–625; 300 Hotspots (Beginn, Ende Ma) :608–613.
- Pflanzen-Deckung: veg/decke/wald [0,1] aus N/PET, PET = 400+45·T mm :2143–2147.
- Heimat-Seite (gelaende-core): saison [0,1), uhr [0,1), Tagesmittel °C an Höhe y :1344, Eis-Dicke m :1404, Schnee-Wasser m
  :1467, Abfluss m/d :1612, Stoff-Tafel ρ/c/L/k in SI (vom Wirt).
Körper (nur im Plan, im Spiel = Erde): g m/s², radiusKm, tagStunden h, jahrTage d, neigungRad, sternFluss, alterMa.

FEHLT (keine Zahl, keine Funktion im Feld):
- Luftdichte, Luftdruck, Skalenhöhe (nur `H` der Tropopause :1910, intern) — nötig für Flug, Atmung, Größe.
- Atmosphären-Chemie: O₂, CO₂ in ppm (Walker nur als Faktor γ :1894), Salzgehalt der Ozeane (nur EIS.salzMeer 35 g/kg Heimat :1377).
- Einstrahlung am Ort W/m² und Tageslänge je Breite/Saison (nur globales Q :1890, Jahres-s2 :1891).
- Boden/Nährstoffe/Gestein am Ort (Kruste-Klasse ja, Chemie nein).
- Ein Ort-Rauschen der Biomasse/Produktivität in g C/m²/a (nur Deckung [0,1]).
- Eine Jahres-/Generationen-Achse im Spiel: die Heimat hat Saison und Uhr, keine Zeit in Ma (immer t = 0); `zeitMa` gibt nur die Reise.
- Tier-seitig: keine einzige Größe des Planeten wird gelesen; g, Temperatur, Nahrung fehlen im Tier-Pfad.

## (4) NAHT

**gelaende-core.js:5843 `ortGesetz(teil)` — genauer ihr Wuchs-Teil `ortWuchs` gelaende-core.js:5735.**
- Warum hier: es ist die EINE Tafel, die jede Lage als `L.ort` trägt (`lageAus` :6001, Pflicht `ortDer` :5932) und die Wirt,
  Faden (voxel-worker.js:1562), Studio und Richter gleich lesen; jeder heutige Pflanzen-Leser (Liste in (1)) liest bereits
  `L.ort.wuchs`. Ein Art-Gesetz, das hier als Feld der Tafel eintritt (f(samen, Ort, zeitMa) aus `planetOrt`/`planetOrtDerZeit`),
  erreicht alle diese Leser ohne Zwilling.
- Was heute dort steht: `ORT_WUCHS` (Erd-Kalender-Tafel :5722) × zwei Verhältnisse des Planeten (decke, wald) → sieben skalare
  Faktoren; in der Heimat konstant 1 (ohne Planet-Lesung, :5857).
- Die Lücke an der Naht: (a) die Heimat ruft den Planeten nie — sie müsste `planetOrt` am Anker lesen (dort ist Δ ≡ 0, die
  Klima-Bytes blieben gleich), (b) die Tier-Pfade lesen `L.ort` gar nicht (kein Treffer in tetrapoda-core / kreatur / koerper-leib),
  (c) `voxel-worker.js:1194–1207` reicht nur fünf Δ-Gruppen; `biom`, `klima.niederschlagMm`, `tJahrC`, Vulkan, Rand bleiben im Faden.
- Quelle der Umwelt für Evolution (ohne Speicher): `planetOrtDerZeit` planet-core.js:2364 + `planetKlimaR` :1950 an der Lage zur
  Zeit t — die Paläo-Umwelt eines Orts ist rechenbar; Trapp-Ereignisse :615 als Aussterbe-Pulse, versammelt/gelöst als Vikarianz.

## (5) PREIS

- Keine Kosten-Zahl in planet-core.js oder gelaende-core.js (Grep nach ms/µs/KB/MB leer). Kopf nennt nur Größenordnungen:
  planetPlan „eifrig, ms, KB“, planetPunktR „µs“ (planet-core.js:9–13). Bytes zählbar über `planBytes` :637 / `scheibeBytes` :2382.
- Arbeit je Ort (aus dem Code gezählt, nicht gemessen): `planetKlimaR` = 1 Punkt + 1 Hülle + 4 Hüllen-Schritte + 14 `kontGrob`
  + 2 `krusteFeld` + 2 fbm (6 Oktaven-Kappe) ≈ 24 Krusten-/Hüllen-Abfragen (:1954–2055). `planetAnker` = bis 512 + 24 solcher
  Orte (:2210–2232), Memo je Plan. `ortRoh` = 1 Klima + 1 Anker-Punkt + 81 Leit-Punkte (:2345–2349). `planetOrt` rechnet den
  Anker-Ort einmal je Plan (Memo :2285).
- Je Art / je Individuum: heute 0 — es gibt keine Art und kein Individuum im Feld. Die Wuchs-Tafel ist O(1) je Lage (sieben
  Zahlen, eingefroren); jeder Pflanzen-Leser multipliziert einen Faktor. Mit der Zahl der Arten wüchse an der Naht nichts, solange
  die Art eine Funktion von (samen, Ort, t) ist und je Lage nur die am Ort tragenden ausgewertet werden; ein Ort-Feld je Art wüchse
  linear (Tafel-Bytes, `ortGesetz`-Memo `ORT_JE` :5841).
- Kreatur-Preis (Tris/dc/ms) liegt außerhalb meines Felds.

## (6) OFFEN

- planet-core.js 690–1560 (Abschnitt, Scheibe, Platten-Wertung, punktRoh, Ränder) nur über Funktionsköpfe gelesen; mögliche
  weitere Würfe dort ungezählt.
- Ob die Heimat-Welt-Uhr eine Jahres-Zählung (Jahr n) trägt, die eine Generationen-Achse sein könnte — nicht im Feld gelesen.
- Gemessene Kosten von planetPlan / planetOrt (ms, MB) — keine Quelle gefunden; die Linse `scripts/diag-planet.cjs` nicht gelesen.
- phyto-core.js:3225 und voxel-worker.js:4332 nur als Treffer gesehen, nicht im Zusammenhang gelesen.
- Ob `planetOrt().biom` / Köppen irgendwo außer dem Richter gelesen wird — im Spiel-Code kein Treffer, Skripte nicht durchsucht.
