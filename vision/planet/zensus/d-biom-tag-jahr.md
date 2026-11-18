# Zensus PLANET · Leser d — Biom · Bewuchs · Tageslauf · Jahreslauf

Baum: `/home/user/AnazhRealm` = main, Kopf `b7ed8419`. Nur gelesen und gerechnet, kein Spiel-Code geändert. Jede Zeile der Tafel wurde am Baum
geprüft (Start- und Endzeile jedes Bereichs). Die Zahlen in §2 stammen aus der Mess-Probe `d-mess.cjs` (liegt neben diesem Blatt; Aufruf
`node d-mess.cjs`, sie lädt gelaende-, phyto-, tetrapoda-, koerper-, klang- und planet-core in Node; foundry-core und welt-licht als Quelltext-Ausschnitt,
weil sie THREE bzw. foundry brauchen). Die Tafel als Daten: `d-biom-tag-jahr.json`.

## §0 Kernantwort

1. **Der Sonnenstand ist GESETZT:** eine Kurve der Uhr, w = t·2π − π/2, Richtung (cos w, sin w, 0,4·sin(w/2)) normiert (welt-licht.js:699-717),
   ohne Breite, Deklination, Achsneigung oder Länge — die Meeus-Bahn steht OFFEN im Kommentar (welt-licht.js:702-710).
2. Darum steht die Sonne an jedem Tag des Jahres mittags auf 74,2°, geht um 06:00 auf und um 18:00 unter, und der Mond ist −Sonne, also immer voll
   (welt-licht.js:720-722).
3. **Das Biom ist GESETZT:** Es gibt keine Biom-Tafel (stamm/feld-leben.js:1788-1792); Boden (Erde ↔ Stein), Wald-Stand, Bestandsdichte und
   Artenwahl sind Rauschen des Samens, und was am Ort folgt, folgt der Höhe (Trockenheit, Schnee- und Waldgrenze), dem Hang und der Feuchte aus
   der Hydrosphäre.
4. Das Klima geht als EINE Zahl je Welt ein und ist in der Heimat gesättigt — Wuchs in allen sieben Kanälen 1, mit einer Wand dagegen
   (gelaende-core.js:5857, :5865-5867); nur Reise-Orte setzen das Biom über das Δ aus planet-core (gelaende-core.js:5898-5921).
5. Gemessen ±2 km um die Heimat nimmt das Lichtungs-Rauschen 41,7 % des Lands jede Baum-Geburt, die Artenwahl bewegt das Rauschen um TV 0,412
   gegen 0,116 für den Standort, und die Waldgrenze wirkt an 0,1 % des Lands.
6. Im Tageslauf gibt es im Licht EINE Tag-Achse (welt-licht.js:728), daneben fünf Zwillinge auf derselben Sonnenhöhe mit eigenen Schwellen
   (Tiere, Morgenchor, Schwarm, Bestäuber, Grille) und vier Achsen auf der Uhr statt auf der Sonne.
7. Im Jahreslauf sind Laub, Blüte, Halm und Tönung eine Tafel über der Phase eines 2400-s-Jahrs (foundry-core.js:253-261,
   stamm/dirigent-kern.js:311); sie lesen weder Temperatur noch Tageslänge.
8. In dasselbe Jahr zählt die Temperatur 365 Tage (gelaende-core.js:1319): Ein Temperatur-Tag dauert 6,58 s, der Uhr-Tag (Standard 3600 s)
   547,5-mal so lang — das Jahr ist kürzer als ein Tag der Uhr.

96 Größen: folgt 15 · gesetzt_anker 9 · gesetzt 72 · technik 7 · ohne_leser 4 · mit Zwilling 32

## §1 Tafel

Die Spalten:

- **Leser** sind nur Stellen, die die Welt ändern: Licht, Geometrie, Platzierung, Verhalten, Klang. Eine reine HUD-Anzeige zählt nicht.
- Leser und Zwillinge im Planet-Kern (planet-core.js) gehören Leser e. Sie stehen hier nur als Zwilling oder Verweis.
- **Urteil**:
  - `folgt` — gerechnet aus anderen Größen, die Spalte nennt woraus.
  - `gesetzt_anker` — eine Literatur oder Norm ist zitiert.
  - `gesetzt` — eine Eichung oder ein Bild-Anker.
- **Marken**:
  - `technik` — Raster, Schwelle oder Version ohne Welt-Bedeutung.
  - `ohne_leser` — kein Leser im Spielpfad (stamm/, voxel-worker.js, Kerne, index.html).
  - `zwilling` — eine zweite Quelle derselben Größe.

Ein Wert „fehlt“ heißt: Die Größe gibt es im Code nicht. Die Zeile steht, weil Biom, Tag oder Jahr aus ihr entstehen müssten.


### Biom (21)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d1 | Welt-Stimme lebendig (Wellenlänge) · `biom` | 200 m | stamm/feld-leben.js:2972 | stamm/gelaende-boden.js:2567 (Boden Erde↔Stein); stamm/vegetation-wiese.js:1325; stamm/vegetation-wiese.js:2335; stamm/vegetation-wiese.js:2363; stamm/vegetation-baum.js:1487; stamm/kreatur-leben.js:1963 | **gesetzt** — Simplex-Rauschen des Samens (seed + "-veg-lebendig", stamm/feld-leben.js:1800); „Erst-Wurf aus genese-plan §Γ3“ (:2971) — keine Biom-Tafel (:1788-1792) | zwilling: voxel-worker.js:2018 FC_LAMBDA_LEBENDIG = 200 (hart) | Das Feld, das „Wald“ heißt (lebendig → Wald), ist Rauschen; es färbt den Boden Erde statt Stein und damit die Wiesen-Wache. |
| d2 | Welt-Stimmen dichte · glut · magieleitung (Wellenlängen) · `biom` | 340 · 520 · 160 m | stamm/feld-leben.js:2973-2975 | stamm/gelaende-boden.js:2592 (Flechte × dichte); stamm/gelaende-boden.js:2596 (Basalt × glut); stamm/gelaende-boden.js:2599 (Violett × magie) | **gesetzt** — Simplex-Rauschen des Samens, je Stimme eigener Strom (stamm/feld-leben.js:1801-1803) | zwilling: voxel-worker.js:2019-2021 FC_LAMBDA_* (hart) | Der „Boden-Typ“ der Welt ist das argmax von vier Rauschen, kein Gestein und kein Klima. |
| d3 | Domain-Warp der Welt-Stimmen · `biom` | 40 · 1/600 m · 1/m | stamm/feld-leben.js:2979-2980 | stamm/feld-leben.js:1823-1826 | **gesetzt** — Rauschen (seed + "-veg-warp") verschiebt die Koordinate vor den Stimmen | zwilling: voxel-worker.js:2023-2024 FC_WARP_* (hart) | — |
| d4 | Samen der Welt (Vorgabe) · `samen` | "anazh-realm-seed" Text | stamm/feld-leben.js:1794 | stamm/feld-leben.js:1800-1806 (Stimmen); stamm/vegetation-wiese.js:2433 (Stand :forest/:meadow); stamm/vegetation-wiese.js:2530 (Wald-fbm :forest) | **gesetzt** — worldMeta.seed, sonst die Vorgabe | zwilling: voxel-worker.js:1405 (Wald-Rausch seed + ":forest") | Jede Größe des Bioms außer Höhe und Feuchte ist eine Funktion dieses Samens. |
| d5 | GEN_VERSION (Schleuse der Felder) · `gen_version` | 9 | stamm/speicher-laden.js:2706 | stamm/feld-leben.js:1815 (≥ 3: Wellen-Fächer); stamm/gelaende-boden.js:1539 (≥ 2: Feuchte) | **gesetzt** — Versions-Schleuse alter Welten | technik | — |
| d6 | Feuchte des Bodens (Feld) · `feuchte_boden` | 0…1 | stamm/gelaende-boden.js:1538-1563 | phyto-core.js:3055 (forestNische feu); stamm/vegetation-wiese.js:164 (Wiese m); stamm/gelaende-boden.js:2571-2572 (dampEarth); stamm/vegetation-baum.js:1342 (Strauch) | **folgt** — max(Fluss-Nähe ss über Segment-Abstand, Höhe über Wasser-Band) aus der Hydrosphäre (_hydroDistAt, _waterLevelAt) — nie aus Niederschlag | zwilling: voxel-worker.js:2097 feuchteAt (Faden-Spiegel) | „die fünfte Welt-Stimme (aus der Hydrosphäre abgeleitet, nicht Noise)“ (stamm/gelaende-boden.js:3219). |
| d7 | FEUCHTE flussReichweite · hoeheNah · hoeheFern · hoeheGewicht · `feuchte_boden` | 26 · 1,5 · 7 · 0,85 m · m · m · — | stamm/gelaende-boden.js:3221-3224 | stamm/gelaende-boden.js:1546-1559 | **gesetzt** — Eichung am Bild („V6 Look-Finale: 0.6→0.85 — breitere, sattere Niederungen“, :3224) | zwilling: voxel-worker.js:2090-2093 FEUCHTE_* (hart, „bei Änderung hier mit-ziehen“) | Anker eigenes Bild. |
| d8 | FEUCHTE sichtbarLo · sichtbarHi · `feuchte_boden` | 0,3 · 0,85 | stamm/gelaende-boden.js:3231-3232 | stamm/gelaende-boden.js:2571; stamm/gelaende-boden.js:1582-1586 (_ortNass → ortKraut/ortBaum) | **gesetzt** — Sichtbarkeits-Kurve der nassen Erde | zwilling: voxel-worker.js:3322 ss(0.3, 0.85, feuchte) (hart) | — |
| d9 | FEUCHTE affinitaetGewicht · erdeGewicht · `feuchte_boden` | 0,8 · 0,35 | stamm/gelaende-boden.js:3225-3226 | stamm/vegetation-wiese.js:2355 (Spawn-Affinität); stamm/vegetation-wiese.js:2370 (Erde beim Graben) | **gesetzt** | — | — |
| d10 | Abflussspende der Heimat (Niederschlag-Ersatz) · `niederschlag_jahr` | 0,0009 m/Tag → 328,5 mm/a | gelaende-core.js:1600 · :5847 | gelaende-core.js:1629 (Pegel-Hub); planet-core.js:2298 (spendeVerh, Leser e) | **gesetzt** — „330 mm im Jahr, gemäßigt-kontinental“ (gelaende-core.js:1566); spendeMm = spende·1000·jahrTage | — | Erreicht den Bewuchs der Heimat nicht: ihr Wuchs nimmt verh {decke 1, wald 1} (gelaende-core.js:5857), nie den Niederschlag. |
| d11 | Temperatur Sommer · Winter (Tagesmittel am Meer) · `temperatur_jahresmittel` | 18 · −4 (Mittel 7) °C | gelaende-core.js:1314-1315 | gelaende-core.js:1321-1338 (temperaturFeld); gelaende-core.js:5736 (ortWuchs tJ, frost); stamm/bild-himmel.js:2874 (Grillen, Esse, Lava, Zünd-Wärme); stamm/bild-himmel.js:2905 (Schnee-Tafel) | **gesetzt** — „Das Klima ist gemäßigt-kontinental“ (gelaende-core.js:1302) — ohne Quelle | zwilling: planet-core.js:2333 (Ort-Klima der Reise, Leser e) | Wirkt auf den Bewuchs der Heimat nur gesättigt (Wuchs 1). |
| d12 | Höhen-Kühlung · `temperatur_jahresmittel` | 0,11077 K/m | gelaende-core.js:5850 | gelaende-core.js:1334 (kuehlung im temperaturFeld) | **folgt** — sommer / Mitte des Schneebands = 18 / ((140 + 185)/2) = 18/162,5 (gelaende-core.js:5850) | — | 17× steiler als die Normatmosphäre 0,0065 K/m (planet-core.js:48 nennt s_v = 0,0065 / kuehlungKJeM) — „die Welt staucht die Höhe“ (gelaende-core.js:1304-1305). |
| d13 | Schneegrenze start · voll (über dem Meer) · `schnee_grenze` | 140 · 185 m | gelaende-core.js:1283-1284 | gelaende-core.js:1290 schnee → stamm/gelaende-boden.js:2600 (Weiß); phyto-core.js:3660 (Waldgrenze); gelaende-core.js:5850 (Kühlung) | **gesetzt** — Band K16 (Form der Grenze zur Sommer-Mitte), Eichung am Bild | — | Anker eigenes Bild. |
| d14 | Schnee-Zungen (Rauschen der Grenze) · `schnee_grenze` | f 0,003 / 0,022 · a 18 / 7 1/m · m | gelaende-core.js:1285-1288 | gelaende-core.js:1296 | **gesetzt** — Rauschen des Gelände-Samens | — | — |
| d15 | ORT_WUCHS frost (Dauer-Frost) · `frost` | [−3, 3] °C (Sommer am Meer) | gelaende-core.js:5727 | gelaende-core.js:5740 (oase, wald) | **gesetzt** — „die Schwelle des Dauer-Schnees im Atlas des Planeten“ (:5738-5739) | — | Heimat Sommer 18 °C → 1. |
| d16 | ORT_WUCHS nadel (Nadelholz meidet die Tropen) · `baum_art` | [24, 16] °C (Jahresmittel) | gelaende-core.js:5728 | gelaende-core.js:5748 → phyto-core.js:3081-3082 (wF, wT × nadel); stamm/vegetation-streu.js:224 | **gesetzt** | — | Heimat tJ 7 °C → 1. |
| d17 | ORT_WUCHS sand (Wärme-Achse des kahlen Grunds) · `biom` | [0, 24] → Heimat 0,2056 °C · — | gelaende-core.js:5729 | gelaende-core.js:5835-5837 kahlGrund ← stamm/gelaende-boden.js:2589 | **folgt** — glatt(0, 24, tJ = 7) = 0,2056 (Messung d-mess #5) | zwilling: voxel-worker.js:3331 (bodenFarbe liest state.ort.wuchs) | In der Heimat ohne Wirkung: kahl = 1 − decke = 0, der Leser ruft kahlGrund nur bei kahl > 0 (stamm/gelaende-boden.js:2588-2589). |
| d18 | ORT_WUCHS Zeiten decke · wald · laub · gras · `biom` | [−470,−420] · [−390,−360] · [−110,−66] · [−66,−23] Ma | gelaende-core.js:5723-5726 | gelaende-core.js:5737-5746 | **gesetzt_anker** — Landpflanzen Ordovizium/Silur, Wälder Devon, Bedecktsamer späte Kreide, Gräser K-Pg/Miozän (Strömberg 2011, gelaende-core.js:5717-5718) | — | Heimat zeitMa 0 → 1. |
| d19 | Wuchs der Heimat (decke, oase, wald, gras, laub, nadel, bilanz) · `biom` | 1 (alle sieben) | gelaende-core.js:5857 · Wand :5865-5867 | phyto-core.js:3227 forestWaldgrenze (wald); phyto-core.js:3081-3085 (nadel, laub); stamm/vegetation-wiese.js:2476 · :2513; stamm/gelaende-boden.js:2586-2588; stamm/vegetation-baum.js:1354; stamm/vegetation-streu.js:32 · :224 · :242; stamm/siedlung-ort.js:1699 · :2550; stamm/siedlung-wege.js:2525 · :2670; voxel-worker.js:1469 · :3331 · :4332 | **folgt** — ortWuchs(TEMPERATUR, zeitMa 0, verh {1, 1}) — gesättigt: Sommer 18 ≫ frost 3, tJ 7 < nadel 16, Zeit 0 ≫ alle Schwellen; die Wand bricht, wäre einer ≠ 1 | — | Klima geht ein, aber als EINE Zahl je Welt (am Meer), nie als Feld über die Höhe — innerhalb der Heimat bewegt das Klima den Bewuchs nicht. |
| d20 | Wuchs eines Reise-Orts · `biom` | ortWuchs(klima + Δ, zeitMa, Δ.wuchs) | gelaende-core.js:5921 | dieselben Leser wie „Wuchs der Heimat“ (state.ort.wuchs) | **folgt** — Δ.wuchs.decke/wald = Niederschlag gegen Verdunstung des Planeten (planet-core pflanzenDeckung, Leser e), klimaHeute + Δ (gelaende-core.js:5898-5906) | zwilling: voxel-worker.js:1203 (Δ.wuchs im Faden) | Der einzige Weg, auf dem Klima das Biom setzt — eine Konstante je Reise-Welt. |
| d21 | Boden Erde ↔ Stein · `biom` | ss(0,25, 0,85, lebendig) | stamm/gelaende-boden.js:2567 | stamm/gelaende-boden.js:2641-2652 (Wiesen-Grund liest das Grün); stamm/vegetation-wiese.js:162 (_wieseGrund) | **gesetzt** — Rauschen lebendig (Zeile d1), Schwellen gesetzt | zwilling: voxel-worker.js:3300-3322 bodenFarbe (Faden-Spiegel) | — |

### Wald (19)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d22 | Wald-Stand st (Wald ↔ Lichtung), Frequenz · `wald_deckung` | 0,006 (λ ≈ 167) 1/m (m) | stamm/vegetation-wiese.js:3220 | phyto-core.js:3653 · :3655 (forestLichtung); stamm/vegetation-wiese.js:2461 · :2501 (clump); voxel-worker.js:1515 (Faden-Spiegel) | **gesetzt** — Simplex seed + ":forest" (stamm/vegetation-wiese.js:2431-2441) | — | Messung: 41,7 % des Lands ±2 km ohne jede Geburt (Lichtung 0) — der größte Faktor des Walds ist dieses Rauschen. |
| d23 | Lichtung · Schluss · min des Bestands · `wald_deckung` | [−0,1, 0,15] · [0,15, 0,6] · 0,6 Stand · Stand · — | phyto-core.js:3202 | phyto-core.js:3204-3215 → :3655 · :3736 (schluss) | **gesetzt_anker** — Stammzahl wie die Ertragstafel (BWI 4, phyto-core.js:3190), REF spec/abnahme/real-mischwald.json 370–900 Stämme/ha (phyto-core.js:3175) | — | — |
| d24 | Bestandsdichte sd (zwei fbm-Oktaven, host contrast · mid) · `baum_dichte` | f 0,014 / 0,038 · 0,55/0,45 · 1,35 · 0,72 1/m · — · — · — | phyto-core.js:2728-2731 · :2788-2810 | phyto-core.js:3652 → forestGeburt :3655; phyto-core.js:3058 · :2856 (open = 1 − sd → Birke) | **gesetzt** — Rauschen _forestFbm (stamm/vegetation-wiese.js:2528-2537) | zwilling: phyto-core.js:2729 FOREST_STAND.lab 1,9 · 0,5 (Labor) | — |
| d25 | Geburt aus der Dichte · `baum_dichte` | 0,3 + 0,7·ss(0,18, 0,8, sd) | phyto-core.js:2814-2818 | phyto-core.js:3655; phyto-core.js:2912 (forestBestand, Ferne) | **gesetzt** — Lichtungs-Boden 0,04 → 0,30 | — | — |
| d26 | „Klima“ clim (Arten-Gradient) · `baum_art` | fbm(x·0,012) (λ ≈ 83) 1/m (m) | phyto-core.js:3059 | phyto-core.js:2837-2839 (sF, sT, aC); phyto-core.js:3716 (Mammut-Wurf) | **gesetzt** — Rauschen des Samens (+ ":forest"); der Name sagt Klima, es liest keine Temperatur | — | Messung: clim und patch bewegen die Arten-Verteilung um TV 0,412 (dominante Art wechselt an 66 % der Orte). |
| d27 | Bestands-Mosaik patch · Zentren · Breite · `baum_art` | fbm(x·0,05) · 0,15/0,36/0,58/0,82 · 0,14 1/m · — · — | phyto-core.js:3060 · :2833-2836 | phyto-core.js:2853-2856 | **gesetzt** — Rauschen (λ 20 m), Reinbestände je Patch-Zentrum | — | — |
| d28 | Trockenheit dry aus der Höhe · `baum_art` | (relH + 6) / 40 m / m | phyto-core.js:3056 · stamm/vegetation-wiese.js:3267 | phyto-core.js:2853-2857 (wF, wT, wE, wW) | **gesetzt** — Höhe über der Basis als Trockenheit, Skala „Vorlage e/18 → AnazhRealm-Höhen-Skala“ (stamm/vegetation-wiese.js:3267) | — | Messung: Standort (dry, feu) bewegt die Arten um TV 0,116 (Wechsel 10,5 %). |
| d29 | Nischen-Gewichte wF · wT · wE · wB · wW · `baum_art` | (sF·0,45 + dry·0,5 + 0,04)·(0,18 + 4,8·pF) … (s. Ort) | phyto-core.js:2853-2858 | phyto-core.js:3047-3090 forestNische → :3689-3706 planForestCell; voxel-worker.js:1295 (Faden) | **gesetzt** — Vorlage phytogenesis (Labor), EINE Formel für Labor und Wirt | — | Mittel ±2 km: Kiefer 0,206 · Tanne 0,377 · Eiche 0,26 · Birke 0,143 · Erle 0,014. |
| d30 | Nass-Nische: Erle feu²·6, andere Arten ≥ 1,2 m über Wasser · `baum_art` | 6 · 1,2 — · m | phyto-core.js:3085 · :3708 | phyto-core.js:3693 · :3708 | **gesetzt** | — | — |
| d31 | Kein Baum im Wasser · `baum_dichte` | 0,4 m über Wasser | phyto-core.js:3663 | phyto-core.js:3663 | **gesetzt** — „Vorlage _de<-0.2“ | — | — |
| d32 | Hang-Grenze des Walds slopeLo · slopeHi · `hang` | 0,35 · 1,25 /∇h/ | stamm/vegetation-wiese.js:3265-3266 | phyto-core.js:3666 | **gesetzt** — „die AnazhRealm-Boden-Tauglichkeit“ | — | Messung: Überleben < 0,5 an 1,6 % des Lands. |
| d33 | Waldgrenze (Schnee-Anteil des Sommers) · `schnee_grenze` | 0,1 | phyto-core.js:3202 · :3227-3235 | phyto-core.js:3660 | **gesetzt_anker** — Körner 2012, Alpine Treelines: die Baumgrenze liegt unter der Schneegrenze (phyto-core.js:3193-3197) | — | Die einzige Höhen-Klima-Kopplung des Walds; wirkt (< 0,5) an 0,1 % des Lands ±2 km. |
| d34 | Saum am Siedlungsrand · `wald_rand` | 40 m | phyto-core.js:3202 | phyto-core.js:3243-3249 → :3735; stamm/vegetation-baum.js:1113 (_saumRaeumen) | **gesetzt_anker** — Krautsaum 5–10 m, Strauchgürtel ≥ 5 m, Waldmantel 15–20 m: WWF Schweiz 2012, Naturschutzbund AT 2017, Bio Austria 2023 (phyto-core.js:3198-3201) | — | — |
| d35 | Reichweite eines Orts (Rand des Saums) · `wald_rand` | 30 + 22·√nH m | fachwerk-core.js:3678 · :3713-3715 | stamm/gelaende-boden.js:880 (_ortRandSetzen) → :886 _ortRaender → phyto-core.js:3252 forestOrtAbstand | **gesetzt** — Ort-Gesetz der Siedlung | — | — |
| d36 | Kronen-Radien je Art (Größe 1) · `baum_art` | Eiche 4,0 · Birke 3,45 · Buche 4,05 · Karst 4,2 · Weide 5,65 · Tanne 2,95 · Fichte 2,75 · Mammut 9,2 m | phyto-core.js:3159-3168 | stamm/vegetation-wiese.js:3271-3279 (FOREST.crown) → phyto-core.js:3720 | **gesetzt** — gemessen an der gewachsenen Gestalt (Atlas-Alpha ≥ 0,5, 8 Azimute, phyto-core.js:3151-3154) | — | Anker eigenes Bild. |
| d37 | Darts je Zelle · Zelle · Packung · `baum_dichte` | 36 · 12 · 1,16 — · m · — | stamm/vegetation-wiese.js:3264 · phyto-core.js:3156-3158 | phyto-core.js:3643-3645 | **gesetzt** — Poisson-Sättigung im dichten Kern | technik | — |
| d38 | dartsPerM2 des Labors · `baum_dichte` | 1,2 1/m² | phyto-core.js:3157 | — | **gesetzt** — Labor PORTAL_RENDER_CONFIG.density (phyto-core.js:3146) | technik · ohne_leser | Kein Leser im Spielpfad (grep: nur der Kommentar :3146). |
| d39 | Auto-Arten: Nische aus dem Namens-Hash · `baum_art` | w0·(0,2 + 3,6·pf(center)) | phyto-core.js:3678-3684 | phyto-core.js:3700-3706; stamm/vegetation-wiese.js:2568-2594 (_forestExtraSpecies) | **gesetzt** — Hash des Namens, nicht der Standort | — | Eine neue Art wächst in Hainen nach ihrem Namen. |
| d40 | Platzierungs-Dichte clump · wet · high · `baum_dichte` | 0,25–2,6 · 0,7 + 0,9·wet · 12–45 m — · — · m | stamm/vegetation-wiese.js:3219-3232 | stamm/vegetation-baum.js:1609 · :1622 (_placementDensityFactor); stamm/vegetation-baum.js:1343 (_canopyLightAt) | **gesetzt** — „die Verteilung wird Ökologie“ (:3217) — Feuchte, Hang, Höhe und das Stand-Rauschen | zwilling: stamm/vegetation-wiese.js:2461-2472 ↔ :2501-2511 (dieselben drei Faktoren zweimal gerechnet) | — |

### Wiese (8)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d41 | Wiesen-Deckung grass · `wiese` | clamp(1,12·clamp(1,08·L − 0,85·rk + 0,22·m)) | foundry-core.js:3146-3148 | stamm/vegetation-wiese.js:172 (Wurf der Nah-Wiese) | **folgt** — Licht der stehenden Kronen L (_bodenLichtFeld) × Feuchte m (Hydrosphäre) × Hang rk; Beiwerte gesetzt (Labor FIX v27) | — | Folgt dem Ort — aber nur × Wiesen-Grund (Grün des Bodens), und das Grün erbt das Rauschen lebendig. |
| d42 | Strauch-Glocke des Kerns · `kraut_deckung` | exp(−(L − 0,4)²/(2·0,16²))·(1 − rk)·0,42 | foundry-core.js:3150 | — | **gesetzt** — Halbschatten-Glocke (Labor) | ohne_leser · zwilling: stamm/vegetation-baum.js:1346 · :1354 (der Wirt tippt Glocke und 0,42 neu) | Kein Spielpfad-Leser des Kern-Felds shrub (grep .shrub: nur Kommentar stamm/vegetation-baum.js:1310) — der Zwilling fährt. |
| d43 | Gras-Hang lo · hi · `hang` | 0,7 · 1,3 /∇h/ (≈ 35° · 52°) | stamm/vegetation-wiese.js:3284 | stamm/vegetation-wiese.js:171; stamm/vegetation-baum.js:1352 | **gesetzt** | — | — |
| d44 | Wiesen-Grund: die Grün-Wache des Bodens · `wiese` | ss(0, gruenSchwelle, g − (r+b)/2) | stamm/gelaende-boden.js:2641-2652 · stamm/daten.js:571-590 | stamm/vegetation-wiese.js:162 (_wieseGrund); voxel-worker.js:679 · :3968 (Boden-Karte) | **folgt** — aus der Bodenfarbe (Erde aus Rauschen lebendig, Feuchte, Schnee, Pfad) | — | — |
| d45 | Wiesenarten nach Zeigerwerten L · F · `wiese` | Glatthafer L8 F5 · Knaulgras L7 F5 · Honiggras L7 F6 · Rotschwingel L8 F4 · Rispengras L6 F7 Ellenberg-Stufen | foundry-core.js:3069-3078 | foundry-core.js:3085 wiesenTint ← stamm/vegetation-wiese.js:181; stamm/daten.js:575-579 (WIESEN_GRUND.tint) | **gesetzt_anker** — Ellenberg et al. 2001; der Ort liest L = 1 + 8·Licht, F = 5 + 4·Feuchte (gesetzt, foundry-core.js:3064) | — | — |
| d46 | Wiesen-Fleck · `wiese` | 1/0,13 = 7,7 m | stamm/daten.js:587 · stamm/gelaende-boden.js:2644 | stamm/gelaende-boden.js:2652 | **gesetzt** — Rauschen | — | — |
| d47 | Unterwuchs-Frequenz meadowFreq · `kraut_deckung` | 0,025 (λ 40) 1/m (m) | stamm/vegetation-wiese.js:3221 | stamm/vegetation-baum.js:1622 | **gesetzt** — Simplex seed + ":meadow" | — | — |
| d48 | Dach-Dämpfung des Bodenlichts canopyK · `kraut_deckung` | 0,85 | stamm/vegetation-wiese.js:3240 | stamm/vegetation-wiese.js:2515 (_canopyLightAt) | **gesetzt** — Labor phytogenesis canopyLight: L = exp(−canopyK·Deckung) | — | — |

### Uhr (10)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d49 | Uhr beim Start (timeOfDay) · `uhr_start` | 0,5 Tag (Mittag) | stamm/dirigent-kern.js:300 | stamm/bild-himmel.js:2648 (tickDayNight); stamm/bild-himmel.js:1141 | **gesetzt** — „eine frische Welt beginnt am Mittag“ (stamm/daten.js:152) | — | Anker eigenes Bild (Leben-Schau 2). |
| d50 | Tag-Länge Standard · `tageslaenge` | 60 min Echtzeit | stamm/daten.js:159-161 | stamm/bild-himmel.js:2639-2640; stamm/siedlung-bewohner.js:2423 | **gesetzt** — 4 × Szene 15 min; Szenen der Leben-Schau 2 dauerten 9–12,3 min (stamm/daten.js:152-158) | — | Anker eigenes Bild. |
| d51 | Tag-Länge Regler · Boden · `uhr_tempo` | 1–60 · 60 s min · s | stamm/daten.js:146-151 · stamm/bild-himmel.js:2640 | stamm/bild-himmel.js:2774-2786 setDayLength; stamm/werkstatt-hud.js:1988-2007 | **gesetzt** — Wahl des Spielers (localStorage), nie im Stand (stamm/speicher-laden.js:555-556) | — | Zwei Seiten einer Welt können verschieden lange Tage sehen. |
| d52 | Tag der Prozesse (PEGEL_TAG_S) · `prozess_tag` | 3600 s Welt-Uhr | stamm/daten.js:165-167 | stamm/feld-leben.js:2604-2607 (_weltTag); stamm/feld-leben.js:2619 (_weltStunde: Lava, Taten, Nachwuchs, Sukzession); stamm/wasser-hydro.js:93 · :140 · :211 · :239 (pegelLauf/pegelZustand: Pegel, Regen, Dürre); stamm/bild-himmel.js:3076 (nassTage) | **folgt** — DAY_LENGTH_DEFAULT · 60 | zwilling: stamm/bild-himmel.js:2640 (Tag der Uhr, Spielerwahl) | Zweiter Tag neben dem der Uhr. |
| d53 | Tag der Welt (Mitternachts-Zähler) · `welt_tag` | worldMeta.tag + ganze Tage Tage | stamm/bild-himmel.js:2738-2742 | stamm/feld-leben.js:2614 (_weltTagEichen, alte Stände) | **folgt** — zählt jede Mitternacht der Uhr | — | — |
| d54 | Etikett der Uhr Nacht · Morgen · Tag · Abend · `tag_achse` | 0,22 · 0,35 · 0,65 · 0,85 Tag | stamm/bild-himmel.js:2762-2768 | — | **gesetzt** | ohne_leser · zwilling: welt-licht.js:728 tagAchse | Einzige Leser stamm/bild-himmel.js:2666 · :2671 schreiben nur die Anzeige (HUD); „Nacht“ bis 05:17 (Sonne −10,8°), ab 20:24 (−33,3°). |
| d55 | Tagesplan der Bewohner wach · werk · ruhe · `tag_achse` | 6,5 · 8–17 · 22 h der Uhr | koerper-core.js:5126-5130 | stamm/siedlung-bewohner.js:2157 · :2223 (tagesPlan) | **gesetzt** — Stunde = timeOfDay·24 (Uhr, nicht Sonne) | zwilling: welt-licht.js:728 tagAchse | Wach bei Sonne +7,5°; hält nur, weil der Aufgang fest 06:00 ist. |
| d56 | Sternfeld-Drehung · `tag_achse` | Euler (0,4, tod·2π, 0,15) rad | stamm/dirigent-takt.js:2422 | stamm/dirigent-takt.js:2422 | **gesetzt** — Uhr × 2π um eine fest geneigte Achse | zwilling: welt-licht.js:711-717 (die Sonne dreht um eine andere Achse) | Der Himmelspol ist nicht der der Sonnenbahn. |
| d57 | Temperatur-Tagesgang tagAmp · tagGipfel · `temperatur_tag` | 5 · 0,625 K · Tag (15:00) | gelaende-core.js:1317-1318 | gelaende-core.js:1336 · :1346; stamm/bild-himmel.js:2874-2880 | **gesetzt** — gemäßigt-kontinental (gelaende-core.js:1302); liest die Uhr, nicht die Sonnenhöhe | zwilling: welt-licht.js:728 tagAchse; planet-core.js:2333 (tagGipfel der Reise) | — |
| d58 | Wolke dämpft den Tagesgang · Regen kühlt · `temperatur_tag` | 0,5 · 3 — · K | gelaende-core.js:1343 | gelaende-core.js:1350-1351 | **gesetzt_anker** — bedeckt schrumpft die Tagesspanne um 25–50 % (Dai 1999, gelaende-core.js:1340) | — | — |

### Sonne (18)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d59 | Winkel der Sonne zur Uhr · `sonnenstand` | w = t·2π − π/2 rad | welt-licht.js:699-701 | stamm/bild-himmel.js:1328 (_sonnenWinkel → Licht, Schatten, Himmelskörper); welt-licht.js:1117-1120 (Bühne der Studios) | **gesetzt** — Kurve der Uhr — ohne Breite, Deklination, Jahr | — | — |
| d60 | Neigung der Bahn · `sonnenstand` | z = 0,4·sin(w/2) | welt-licht.js:714 | welt-licht.js:711-717 | **gesetzt** | zwilling: planet-core.js:263 neigungRad 0,4091 (Erde, Leser e — die Bahn liest sie nicht) | 4π-periodisch in w, die Uhr 2π: Sprung 31,6° um Mitternacht; Untergang 21,8° neben dem Gegenpunkt des Aufgangs. |
| d61 | Mittagshöhe der Sonne · `sonnenstand` | 74,21 ° | welt-licht.js:711-717 (gerechnet, d-mess #1) | dieselben Leser wie „Winkel der Sonne zur Uhr“ | **folgt** — asin(1/√1,08) aus der gesetzten Bahn; Gipfel 74,35° um 11:52 | — | Jeden Tag des Jahres gleich; äquivalente Breite 15,8° zur Tag-und-Nacht-Gleiche. |
| d62 | Aufgang · Untergang · Lichtdauer · `tageslaenge` | 06:00 · 18:00 · 12 Uhr · Uhr · h | welt-licht.js:713 (y = sin w) | stamm/dirigent-kern.js:1885-1886 (Leuchtquellen morgen/abend: t < 0,5) | **folgt** — y > 0 genau für t ∈ (0,25, 0,75) | — | Keine veränderliche Tageslänge; Meeus bei 47°: 8,3–15,7 h. |
| d63 | Breite der Heimat · `breite_ort` | fehlt (implizit 15,8) ° | welt-licht.js:697-717 · gelaende-core.js:5882 (nur der Reise-Teil) | — | **gesetzt** — die Kurve trägt keine Breite; 90° − 74,2° gerechnet | zwilling: planet-core.js:1664 planetRichtung(breite, laenge) (Ort des Planeten, Leser e) | Die Sonne liest teil.breite nie. |
| d64 | Deklination · Tag des Jahres in der Sonne · `sonnen_deklination` | fehlt (immer 0) ° | welt-licht.js:702-710 (OFFEN) | — | **gesetzt** — Die Meeus-Bahn (Jahr × Breite) stand gebaut, Mittag 74,2° → 74,6°, und fiel an gate:tag-achse:echt | — | Die Saison erreicht die Sonne nicht. |
| d65 | Achsneigung in der Sonne · `achsneigung` | fehlt rad | welt-licht.js:711-717 | — | **gesetzt** | zwilling: planet-core.js:263 neigungRad 0,4091 (23,44°); welt-licht.js:714 (0,4 als Bahn-Neigung, ohne Bezug) | — |
| d66 | Länge · Ortszeit · `laenge_ort` | fehlt (Mittag = 12:00 der Uhr) ° | welt-licht.js:699-701 | — | **gesetzt** | — | Gipfel der Bahn 8 min vor 12:00 aus der Neigung, nicht aus einer Länge. |
| d67 | Stufe der Sonne (Schattierung) · `sonnenstand` | 1/255 rad | stamm/bild-himmel.js:3404 | stamm/bild-himmel.js:1353-1373 → :1331-1333 | **gesetzt** — 8-bit-Stufe von N·L; Schirm-Pixel und Kaskaden-Texel kappen | technik | — |
| d68 | DIE EINE Tag-Achse: Anker der Grenzgröße · `tag_achse` | [10,−5] [2,−4,5] [0,−3] [−6,1,5] [−12,4] [−18,6] ° · mag | welt-licht.js:92-101 · :728-761 | stamm/bild-himmel.js:1130 (_tagAchse) ← :1153 · :1396 · :1515 · :1901 · :2605 (Licht, Godrays, Nachthimmel, Mond); stamm/dirigent-kern.js:1885; stamm/klang.js:2066 | **gesetzt_anker** — Grenzgröße an bürgerlicher/nautischer/astronomischer Dämmerung (welt-licht.js:89-91) | — | — |
| d69 | Kanal nacht der Tag-Achse · `tag_achse` | 0° → −6° ° | welt-licht.js:749 · :758 | stamm/bild-himmel.js:1396 (Godrays); stamm/dirigent-kern.js:1885 (Leuchtquellen); stamm/klang.js:2066 | **gesetzt_anker** — bürgerliche Dämmerung 0° … −6° | — | — |
| d70 | Kanal tag (Nacht-Auge) nachtGrad · `tag_achse` | -32 ° | welt-licht.js:87 | welt-licht.js:756 | **gesetzt** — Belichtung, Eichung am Bild | — | Anker eigenes Bild. |
| d71 | Kanal hell (Leuchtdichte des Tageshimmels) · `tag_achse` | 0,045 + 0,955·ss((s + 0,18)/0,6) | welt-licht.js:743 · :759 | stamm/bild-himmel.js:2605 (Mondblässe) | **gesetzt** | — | — |
| d72 | Tiere: Lichtphase nacht · dämmerung · `tag_achse` | sin −0,15 · 0,25 (−8,63° · 14,48°) sin der Höhe | tetrapoda-core.js:131 · :2118 · :2133-2135 | stamm/kreatur-leben.js:2065 | **gesetzt** | zwilling: welt-licht.js:728 tagAchse (nacht 0° … −6°) | Zwilling: eigene Schwellen auf derselben Sonnenhöhe (05:25 · 06:58). |
| d73 | Vögel: Morgenchor-Stützen · `tag_achse` | [−0,15,0] [0,0,7] [0,12,1] [0,4,0,6] [1,0,55] sin → Anteil | tetrapoda-core.js:2381 | stamm/kreatur-fauna.js:42 (vogelLied) | **gesetzt** — „das Maximum kurz nach Sonnenaufgang, mittags gut die Hälfte“ (tetrapoda-core.js:2366) | zwilling: welt-licht.js:728 tagAchse | Zwilling. |
| d74 | Vogel-Schwarm sonneMin · `tag_achse` | 0,05 sin (2,87°) | tetrapoda-core.js:2458 | stamm/kreatur-fauna.js:69 → tetrapoda-core.js:2528 | **gesetzt** | zwilling: welt-licht.js:728 tagAchse | Zwilling. |
| d75 | Bestäuber: Sonnen-Stützen · `tag_achse` | [−0,1,0] [0,05,0,25] [0,3,1] [1,1] sin → Aktivität | tetrapoda-core.js:2916 | stamm/kreatur-fauna.js:624 (bestaeuberAktiv) | **gesetzt** | zwilling: welt-licht.js:728 tagAchse | Zwilling. |
| d76 | Grille: nachtAb · nachtVoll · `tag_achse` | 0,05 · −0,15 (2,87° · −8,63°) sin der Höhe | klang-core.js:492 · :932 | stamm/klang.js:488 (Sonnenhöhe → klang-core) | **gesetzt** | zwilling: welt-licht.js:728 tagAchse; stamm/klang.js:2066 (dieselbe Datei liest nacht der EINEN Achse) | Zwilling. |

### Jahr (17)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d77 | Länge des Jahrs · `jahr_laenge` | 2400 s Welt-Uhr | stamm/dirigent-kern.js:311 | stamm/bild-himmel.js:933 (_saisonAnkerGilt) → :955-960 _saisonPhaseZu; stamm/bild-himmel.js:970 (setSeason); stamm/speicher-laden.js:543 | **gesetzt** — „ein Jahr ueber 40 min Echtzeit (10 min/Saison)“ | zwilling: stamm/bild-himmel.js:933 · :970 · stamm/speicher-laden.js:543 (Rückfall 2400 als Literal ×3) | Messung: 0,667 Tage der Uhr (Standard) … 40 Tage (1-min-Tag); 0,667 Prozess-Tage. |
| d78 | Tage im Jahr der Temperatur (jahrTage) · `jahr_laenge` | 365 Tage | gelaende-core.js:1319 | gelaende-core.js:1336 (Trägheit der Jahres-Welle); stamm/bild-himmel.js:2897 (Schnee-Tafel je Tag); stamm/bild-himmel.js:2926 · :3006 (Welt-Stunde der Saison, Eis); gelaende-core.js:5847 (spendeMm) | **gesetzt_anker** — das Erdjahr | zwilling: planet-core.js:264 PLANET_ERDE.jahrTage 365 (Wand R5 planet-core.js:2183) | Ein Tag dieses Jahrs = 2400/365 = 6,58 s; der Tag der Uhr ist 547,5× länger. |
| d79 | Phase beim Start (Sommer-Mitte) · `saison_phase` | 0,375 Jahr | stamm/dirigent-kern.js:305 | stamm/bild-himmel.js:898-924 (_tickSeason) | **gesetzt** | zwilling: stamm/bild-himmel.js:900 · :966; stamm/gelaende-fern.js:1187 · :1193; stamm/stoff-karte.js:2066; gelaende-core.js:1316 (0,375 als Literal ×7) | — |
| d80 | Jahr läuft (autoSeason) · `saison_tempo` | true | stamm/dirigent-kern.js:306 | stamm/bild-himmel.js:906-909 | **gesetzt** | — | — |
| d81 | Anker des Jahrs (Phase + Welt-Uhr) · `saison_phase` | Phase = Anker + (t − t₀)/2400 Jahr | stamm/bild-himmel.js:931-960 | stamm/bild-himmel.js:908 (Phase je Takt); stamm/speicher-laden.js:533-545 (Stand) | **folgt** — Funktion der Welt-Uhr spielZeit | — | — |
| d82 | Lage zwischen den Stützen (Mitten-Versatz) · `saison_phase` | Studio-t = Phase − 0,125 Jahr | stamm/bild-himmel.js:3307-3312 | stamm/bild-himmel.js:859 · :882 | **folgt** — die Welt zählt Saison-Mitten, das Studio Stützen | — | — |
| d83 | Saison-Mitten des Worts (setSeason) · `saison_phase` | 0,125 · 0,375 · 0,625 · 0,875 Jahr | stamm/bild-himmel.js:966 | stamm/bild-himmel.js:963-974 | **folgt** — k/4 + 1/8 | — | — |
| d84 | Laub-Präsenz pr (Frühling · Sommer · Herbst · Winter) · `laub_praesenz` | 0,72 · 1 · 0,55 · 0,06 | foundry-core.js:255-258 | stamm/bild-himmel.js:885 (uLaubPraesenz.x); stamm/stoff-karte.js:1973 (Karte); stamm/gelaende-fern.js:2032 · :1053; voxel-worker.js:4785 | **gesetzt** — Tafel des Studios über der Phase — liest weder Temperatur noch Tageslänge | — | — |
| d85 | Blüte bl · `bluete_praesenz` | 0,85 · 0,12 · 0 · 0 | foundry-core.js:255-258 | stamm/bild-himmel.js:886 (uLaubPraesenz.y) | **gesetzt** — Tafel über der Phase | — | — |
| d86 | Halm-Länge ha · `halm_jahr` | 0,7 · 1 · 0,8 · 0,35 × Sommer | foundry-core.js:255-258 | stamm/bild-himmel.js:887 (uLaubPraesenz.z); phyto-core.js:6748 halmImJahr | **gesetzt** — Eichung LAI (Radeon 8ef49bef, foundry-core.js:270-273) | — | Anker eigenes Bild. |
| d87 | Tönung ti · bau · mulMin · mulMax · `saison_toenung` | 4 Farben · 0x4f7a30 · 0,25 · 4,0 sRGB · — | foundry-core.js:255-261 | stamm/bild-himmel.js:859-872 (uSeasonMul); stamm/daten.js:605-611 (GRAS_SPITZE aus ac des Sommers) | **gesetzt** | — | — |
| d88 | kartenGewicht · karteSchwelle · `saison_toenung` | 0,8 · 0,5 | foundry-core.js:262 · :279 | — | **gesetzt** — Impostor des Labors (worlds/terrain) | ohne_leser | „liest die Welt seit w21 nicht mehr“ (stamm/bild-himmel.js:3284-3285). |
| d89 | Stufen der Karte im Jahr · `saison_phase` | 32 (je 75 s) Stufen | stamm/stoff-karte.js:2066 | stamm/stoff-karte.js:1973-1985 | **gesetzt** — Bake-Raster | technik · zwilling: sommer 0,375 (Literal, s. Phase beim Start) | — |
| d90 | Saison-Drift der Ferne · `saison_phase` | 0,05 je Kanal | stamm/gelaende-chunks.js:3442 | stamm/bild-sicht.js:2368 | **gesetzt** — Neu-Mal-Schwelle | technik | — |
| d91 | Gipfel der Jahres-Welle (sommerPhase) · `saison_phase` | 0,375 Jahr | gelaende-core.js:1316 | gelaende-core.js:1335; stamm/bild-himmel.js:2899 (Rückfall) | **gesetzt** — gleich der Sommer-Mitte der Phänologie | zwilling: planet-core.js:2333 (Süd-Halbkugel +0,5, Leser e) | — |
| d92 | Raster der Schnee-Tafel und des Schnee-Versatzes · `jahr_laenge` | je Tag 6,58 · je Stunde 0,274 s | stamm/bild-himmel.js:2897-2899 · :2926-2927 | stamm/bild-himmel.js:2891 (_schneeTrittAt); stamm/gelaende-boden.js:2600 (_schneeGilt) | **folgt** — 2400 s / 365 bzw. / (365·24) | technik | Die „Welt-STUNDE der Saison“ (stamm/bild-himmel.js:2919) ist 0,274 s, die Stunde der Uhr 150 s. |
| d93 | Holz der kahlen Krone (KRONE_JAHR) · `laub_praesenz` | 0,05 | phyto-core.js:6728 | phyto-core.js:6729-6735 ← stamm/gelaende-fern.js:1053 · :2032; stamm/stoff-karte.js:718; voxel-worker.js:4785 | **gesetzt** — gemessen an der Gestalt: Eiche 0,061 · Birke 0,048 · Weide 0,047 (phyto-core.js:6720-6722) | — | Anker eigenes Bild. |

### Mond (3)

| id | Name · `größe` | Wert | Ort | Leser | Urteil — woraus | Marken | Anmerkung |
|---|---|---|---|---|---|---|---|
| d94 | Richtung des Monds (immer Vollmond) · `mond_phase` | −Sonne | welt-licht.js:720-722 | stamm/bild-himmel.js:1150 (Licht der Nacht); stamm/bild-himmel.js:2599-2602 (Körper); welt-licht.js:1119 (Bühne) | **gesetzt** — Vollmond als Gesetz | — | Keine Mondphase im Spielpfad; der Mond springt mit der Sonne um Mitternacht 31,6° — in 74,2° Höhe (gerechnet). |
| d95 | Stärke des Mondlichts · `mond_licht` | 0,65 | welt-licht.js:74 | welt-licht.js:108-113 (MOONLIGHT); welt-licht.js:77 (MOND_E → Belichtung) | **gesetzt** — Luma ≥ 22 am Boden (Radeon, welt-licht.js:106-107) | — | Anker eigenes Bild. |
| d96 | Mondblässe gegen den Himmel · `mond_licht` | 0,5 | stamm/bild-himmel.js:3338 | stamm/bild-himmel.js:2606 | **gesetzt** — Deckung 0,98/(1 + hell/0,5) | — | — |


## §2 Gerechnet und gemessen

Alle Zahlen stammen aus `d-mess.cjs` am Baum b7ed8419. Die Abschnitte entsprechen seinen Teilen #1–#6.

### #1 Die Sonnenbahn (welt-licht.js:699-717)

| Größe | Wert |
|---|---|
| Mittag (t 0,5) | Höhe 74,21°, Richtung (0, 0,9623, 0,2722) |
| Gipfel der Bahn | 74,35° um 11:52 (t 0,4941) — die Neigung z verschiebt ihn, keine Länge |
| Auf- / Untergang · Lichtdauer | 06:00 / 18:00 · 12,000 h, an jedem Tag des Jahres |
| Azimut Auf- / Untergang | 0° / 158,2° — der Untergang liegt 21,8° neben dem Gegenpunkt des Aufgangs |
| Höhe je Uhr | 00:00 −74,21° · 03:00 −44,34° · 06:00 0° · 07:12 17,96° · 09:00 44,34° · 12:00 74,21° · 15:00 41,55° · 16:48 16,7° · 18:00 0° · 21:00 −41,55° |
| Sprung um Mitternacht | 31,59°: z = 0,4·sin(w/2) ist 4π-periodisch, die Uhr 2π. Sonne (0, −0,962, ±0,272), der Mond in 74,21° Höhe zwischen (0, 0,962, −0,272) und (0, 0,962, 0,272). Gerechnet, nicht im Bild gesehen. |
| äquivalente Breite | 15,79° (90° − 74,21°, zur Tag-und-Nacht-Gleiche) |
| Meeus bei 15,8° | Mittag Sommer / Gleiche / Winter 82,4° / 74,2° / 50,8°, Licht 12,94 / 12 / 11,06 h |
| Meeus bei 47° | 66,4° / 43,0° / 19,6°, Licht 15,69 / 12 / 8,31 h (Aufgang 04:09 … 07:51) |

### #2 Die Tag-Achsen auf der gesetzten Bahn

Jede Schwelle steht als Sonnenhöhe und als Uhr am Morgen.

| Achse | Ort | Schwelle → Morgen |
|---|---|---|
| tagAchse.nacht (die EINE) | welt-licht.js:749 · :758 | 0° → 06:00 (Beginn), −6° → 05:36 (voll) |
| tagAchse.tag (Nacht-Auge) | welt-licht.js:87 · :756 | 0 bei −32° → 03:51 |
| Tiere lichtPhase | tetrapoda-core.js:131 · :2118 | −8,63° → 05:25 (Nacht→Dämmerung), 14,48° → 06:58 (Tag) |
| Vogel-Morgenchor | tetrapoda-core.js:2381 | −8,63° 05:25 → 0 · 0° 06:00 → 0,7 · 6,89° 06:28 → 1 · 23,58° 07:35 → 0,6 · 90° → 0,55 |
| Vogel-Schwarm | tetrapoda-core.js:2458 | 2,87° → 06:11 |
| Bestäuber | tetrapoda-core.js:2916 | −5,74° 05:37 → 0 · 2,87° 06:11 → 0,25 · 17,46° 07:10 → 1 |
| Grille | klang-core.js:492 | nachtAb 2,87° (06:11) · nachtVoll −8,63° (05:25) |
| Uhr-Etikett (nur HUD) | stamm/bild-himmel.js:2762-2768 | 0,22 = 05:17 (−10,79°) · 0,35 = 08:24 (35,69°) · 0,65 = 15:36 (33,32°) · 0,85 = 20:24 (−33,32°) |
| Bewohner TAGES_GESETZ | koerper-core.js:5126-5130 | wach 6,5 h (+7,5°) · werk 8 h (29,82°) – 17 h (13,92°) · ruhe 22 h (−54,92°) |
| Temperatur-Tagesgipfel | gelaende-core.js:1318 | 0,625 = 15:00 (41,55°) |

„Nacht“ beginnt also je nach Leser bei +2,87°, 0°, −6° oder −8,63°. Am Morgen liegen 46 min zwischen den Schwellen (05:25 bis 06:11).

### #3 Uhr, Tag und Jahr (Sekunden der Welt-Uhr)

| Größe | Wert |
|---|---|
| Jahr · Saison · Kartenstufe | 2400 s · 600 s · 75 s |
| Tag der Uhr (Regler) | 60 … 3600 s, Standard 3600 s |
| Jahr in Tagen der Uhr | 40 (1-min-Tag) … 0,6667 (Standard) |
| Tag der Prozesse (PEGEL_TAG_S) | 3600 s → ein Jahr sind 0,6667 Prozess-Tage |
| Tag der Temperatur (jahrTage 365) | 6,5753 s je Tag; die „Welt-Stunde der Saison“ 0,274 s; Verhältnis Uhr-Tag : Temperatur-Tag 547,5 |
| Trägheit der Grille τ 0,17 Tage | Tag-Welle gedämpft auf 0,6834, Verspätung 46,89° (612 s); Jahres-Welle 1,0 und 0,17° (1,118 s) |

### #4 Die Saison je Welt-Phase

Gerechnet aus SAISON_GESETZ über _saisonLage. Laub = uLaubPraesenz.x, Blüte = .y, Halm = .z. Die Tönung ist uSeasonMul (r, g, b).
T ist die Temperatur am Meer mittags.

| Phase | Name | Laub | Blüte | Halm | Tönung | T °C |
|---|---|---|---|---|---|---|
| 0 | spring | 0,39 | 0,425 | 0,525 | 1,367 · 1,049 · 1,479 | 2,76 |
| 0,125 | spring | 0,72 | 0,85 | 0,7 | 1,342 · 1,262 · 1,292 | 10,54 |
| 0,25 | summer | 0,86 | 0,485 | 0,85 | 1,171 · 1,131 · 1,146 | 18,31 |
| 0,375 | summer | 1 | 0,12 | 1 | 1 · 1 · 1 | 21,54 |
| 0,5 | autumn | 0,775 | 0,06 | 0,9 | 1,614 · 0,959 · 0,937 | 18,31 |
| 0,625 | autumn | 0,55 | 0 | 0,8 | 2,228 · 0,918 · 0,875 | 10,54 |
| 0,75 | winter | 0,305 | 0 | 0,575 | 1,81 · 0,877 · 1,271 | 2,76 |
| 0,875 | winter | 0,06 | 0 | 0,35 | 1,392 · 0,836 · 1,667 | −0,46 |

Laub und Temperatur sind nicht gekoppelt, sie teilen nur die Phase. Bei 2,76 °C trägt der Wald im Frühling (Phase 0) Laub 0,39, im Winter
(Phase 0,75) 0,305.

### #5 Das Klima der Heimat und der Wuchs des Orts

- **klimaHeute:** Sommer 18 °C, Winter −4 °C, Mittel 7 °C. spendeMm 328,5. Höhen-Kühlung 0,11077 K/m, das 17-Fache der Normatmosphäre (0,0065 K/m).
- **Die 0-°C-Linie** des Sommer-Mittels liegt auf 162,5 m. Das ist genau die Mitte des Schneebands 140–185 m: Die Kühlung ist aus der Schneegrenze
  gerechnet (gelaende-core.js:5850).
- **Wuchs der Heimat:** decke, oase, wald, gras, laub, nadel und bilanz sind 1. sand ist 0,2056 und wirkt nicht, weil kahl = 0
  (stamm/gelaende-boden.js:2588-2589).

### #6 Der Wald an 1681 Orten der Heimat

Gemessen auf einem 100-m-Raster über ±2 km mit dem Samen `anazh-realm-seed`. Alle 1681 Orte sind Land (über Wasser + 0,4 m), Höhe 7,2–145,1 m.

| Größe | Wert |
|---|---|
| Lichtung = 0 (keine Geburt) | 41,7 % des Lands; < 0,5 an 49,4 % |
| Waldgrenze < 0,5 | 0,1 % |
| Hang-Überleben < 0,5 | 1,6 % |
| Geburt im Mittel | 0,461 aus dem Rauschen allein, 0,451 mit Waldgrenze und Hang |
| Artenwahl im Mittel | Kiefer 0,206 · Tanne 0,377 · Eiche 0,26 · Birke 0,143 · Erle 0,014 |
| Wer bewegt die Arten | Rauschen (clim, patch) TV 0,412, dominante Art wechselt an 66,1 % der Orte; Standort (dry, feu) TV 0,116, Wechsel an 10,5 % |

Vorbehalt: Die Probe rechnet die Feuchte ohne den Fluss-Term, daher ist feu überall 0. Die Nass-Nische (Erle/Weide) ist also nicht gemessen;
der Standort-Anteil gilt hier nur für dry.

## §3 Funde

**F1 — Drei Tage, und das Jahr ist kürzer als der Tag.**

| Tag | Länge | Ort |
|---|---|---|
| Uhr-Tag (Spielerwahl) | 60–3600 s, im localStorage, nie im Stand | stamm/daten.js:146-161, stamm/bild-himmel.js:2640, stamm/speicher-laden.js:555-556 |
| Prozess-Tag (Pegel, Regen, Dürre, Lava, Taten) | 3600 s | stamm/daten.js:165-167, stamm/feld-leben.js:2606 |
| Temperatur-Tag | 6,58 s (2400 s / 365) | gelaende-core.js:1319, stamm/bild-himmel.js:2897, :2926 |

- Das Jahr dauert 2400 s (stamm/dirigent-kern.js:311), also 0,667 Uhr-Tage im Standard: Alle vier Jahreszeiten laufen in zwei Dritteln eines
  Uhr-Tags durch.
- Die Schnee-Tafel rechnet „je Tag“ des Temperatur-Jahrs (stamm/bild-himmel.js:2897-2899). Die „Welt-STUNDE der Saison“ (stamm/bild-himmel.js:2919)
  dauert 0,274 s.

**F2 — Die Sonne ist eine gesetzte Kurve und springt um Mitternacht um 31,6°.**

- Die Neigung z = 0,4·sin(w/2) (welt-licht.js:714) hat die doppelte Periode der Uhr.
- Um 00:00 springt die Sonne unter dem Horizont von (0, −0,962, 0,272) nach (0, −0,962, −0,272).
- Der Mond ist −Sonne (welt-licht.js:720-722) und springt mit, in 74,2° Höhe. Gezeichnet wird er an stamm/bild-himmel.js:2599-2602.
- Der Untergang liegt 21,8° neben dem Gegenpunkt des Aufgangs.
- Die Achsneigung der Erde liegt als neigungRad 0,4091 in planet-core.js:263; die Sonne liest sie nicht. Die 0,4 der Bahn hat keinen Bezug zu ihr.
- Mittag 74,2° entspricht 15,8° Breite. Die Temperatur der Heimat heißt dagegen „gemäßigt-kontinental“ (gelaende-core.js:1302), und dort stünde die
  Sonne nach Meeus bei 47° zwischen 19,6° und 66,4°.

**F3 — Das Biom ist Rauschen, und das Rauschen heißt „Klima“.**

- clim = fbm(x·0,012) (phyto-core.js:3059, Kommentar „breiter Klima-/Trockengradient“) liest keine Temperatur, ist aber der stärkste Arten-Treiber
  (TV 0,412 zusammen mit patch, phyto-core.js:3060).
- Der Wald-Stand ist Simplex seed + ":forest" (stamm/vegetation-wiese.js:2431-2441). Über forestLichtung (phyto-core.js:3204, :3655) nimmt er 41,7 %
  des Lands den Wald.
- Der Boden „Erde ↔ Stein“ ist das Rauschen lebendig (stamm/gelaende-boden.js:2567, stamm/feld-leben.js:1800). Er setzt den Wiesen-Grund und damit
  die Wiese (stamm/gelaende-boden.js:2641-2652, stamm/vegetation-wiese.js:162).
- Die Abflussspende 328,5 mm/a (gelaende-core.js:1600, :5847) erreicht den Bewuchs der Heimat nicht; ihr Wuchs nimmt verh {1, 1}
  (gelaende-core.js:5857).

**F4 — Tag-Achsen: im Licht EINE, daneben fünf Sonnenhöhen-Zwillinge und vier Uhr-Achsen.**

- **Die EINE:** tagAchse (welt-licht.js:728-761). Sie wird gelesen über stamm/bild-himmel.js:1130 (Rufe :1153 · :1396 · :1515 · :1901 · :2605), über
  stamm/dirigent-kern.js:1885, stamm/klang.js:2066 und auf der Bühne der Studios (welt-licht.js:1120).
- **Die fünf Zwillinge auf sin(Sonnenhöhe)**, jeder mit eigener Schwelle:
  1. Tiere-lichtPhase: tetrapoda-core.js:131 · :2118 · :2133 ← stamm/kreatur-leben.js:2065
  2. Vogel-Morgenchor: tetrapoda-core.js:2381 ← stamm/kreatur-fauna.js:42
  3. Vogel-Schwarm sonneMin: tetrapoda-core.js:2458 ← stamm/kreatur-fauna.js:69
  4. Bestäuber: tetrapoda-core.js:2916 ← stamm/kreatur-fauna.js:624
  5. Grille: klang-core.js:492 · :932 ← stamm/klang.js:488. Dieselbe Datei liest an :2066 die EINE Achse.
- **Die vier Uhr-Achsen**, die nicht die Sonne lesen:
  - Bewohner-TAGES_GESETZ: koerper-core.js:5126-5130 ← stamm/siedlung-bewohner.js:2157
  - Uhr-Etikett: stamm/bild-himmel.js:2762-2768, nur HUD
  - Temperatur-tagGipfel 0,625: gelaende-core.js:1318
  - Sternfeld tod·2π: stamm/dirigent-takt.js:2422. Es dreht um eine andere Achse als die Sonnenbahn.
- **Karte ≠ Code:** Die Karte nennt „Tag-Achsen ×5 (`:1308/:1813/:1895/:1994/:2017`)“ (origin/koordination SYSTEMKARTE.md:127; SKILL.md:85
  „Heute doppelt: Tag-Achsen ×5“). An diesen Zeilen von stamm/bild-himmel.js steht keine Tag-Achse mehr: :1308 ist `}`, :1813 das Richtlicht,
  :1895 Mond-Durchlass, :1994 `);`, :2017 leer. Die fünf Zwillinge von heute stehen in tetrapoda-core und klang-core.

**F5 — Zwillinge als Literale, harte Spiegel und Doppel-Rechnung.**

- 0,375 als Sommer-Mitte ×7: stamm/dirigent-kern.js:305, stamm/bild-himmel.js:900, :966, stamm/gelaende-fern.js:1187, :1193,
  stamm/stoff-karte.js:2066, gelaende-core.js:1316.
- 2400 ×4: stamm/dirigent-kern.js:311, stamm/bild-himmel.js:933, :970, stamm/speicher-laden.js:543.
- jahrTage 365 ×2: gelaende-core.js:1319 und planet-core.js:264; die Wand R5 steht an planet-core.js:2183.
- Im Faden hart gespiegelt:
  - die Welt-Stimmen FC_*: voxel-worker.js:2018-2024
  - FEUCHTE: voxel-worker.js:2090-2093
  - die Sichtbarkeits-Kurve ss(0,3, 0,85): voxel-worker.js:3322
- Die Strauch-Glocke des Kerns (foundry-core.js:3150) tippt der Wirt neu (stamm/vegetation-baum.js:1346, :1354).
- Die Platzierungs-Dichte clump × wet × high wird zweimal gerechnet: stamm/vegetation-wiese.js:2461-2472 und :2501-2511.

**F6 — Ohne Leser.**

- kartenGewicht 0,8 und karteSchwelle 0,5 (foundry-core.js:262, :279) — laut stamm/bild-himmel.js:3284-3285 „liest die Welt seit w21 nicht mehr“.
- Das Kern-Feld shrub (foundry-core.js:3150); sein Zwilling fährt.
- dartsPerM2 1,2 (phyto-core.js:3157), nur im Kommentar :3146.
- Das Uhr-Etikett: Seine Leser stamm/bild-himmel.js:2666 und :2671 schreiben nur das HUD.

**F7 — Karte ≠ Code in den Kommentaren.**

- stamm/dirigent-kern.js:303 nennt „seasonPhase 0=Fruehling .25=Sommer“ (Saison-Beginn). foundry-core.js:250 nennt dieselben Zahlen für die
  Stützen-Mitten des Studios. Die Welt zählt deshalb mit dem Versatz 0,125 (stamm/bild-himmel.js:3307, :966).
- stamm/dirigent-kern.js:301-302 sagt „die Foundry backt die Assets in dieser Jahreszeit (Herbst golden, Winter kahl)“. Dagegen steht „Jeder
  Foundry-Körper ist Golden-Sommer gebaut“ (stamm/bild-himmel.js:891) und „Welt-Koerper ist Sommer gebacken“ (foundry-core.js:249).
- Der Name clim (phyto-core.js:3059) verspricht ein Klima, das nicht gelesen wird.
- SYSTEMKARTE „Tag-Achsen ×5“: siehe F4.

**F8 — Der Bewohner-Tag hängt an der Uhr, nicht am Licht.**

- TAGES_GESETZ wach 6,5 · werk 8–17 · ruhe 22 (koerper-core.js:5126-5130) liest die Stunde = timeOfDay·24 (stamm/siedlung-bewohner.js:2157).
- Das stimmt nur, weil der Aufgang fest um 06:00 liegt. Mit einer Meeus-Bahn bei 47° (Aufgang 04:09–07:51) stünden die Bewohner im Winter 1 h 21 min
  vor der Sonne auf.
- Für den Temperatur-Gipfel um 15:00 (gelaende-core.js:1318) gilt dasselbe.
