# Zensus PLANET · e — der Kern `planet-core.js` (VERSION planet-h2-4)

Baum `/home/user/AnazhRealm` (main b7ed8419), gelesen 18.11.; jede Zeilennummer am Baum geprüft. Zeilen: `e-planet-kern.json` (236 Größen, gültig; Prüfung `pruef-json.cjs`: jede datei:zeile existiert). Messung: `e-mess.cjs` im selben Ordner.

## §0 Kern-Antwort

1. `planet-core.js` trägt **236 Größen**: 33 folgen aus Samen oder Physik, 22 sind an Literatur oder Norm verankert (Erd-Schlüssel, North & Coakley, North 1975, Gough, Held & Hou, Stein & Stein, Peel 2007, Turc-Pike, Standard-Atmosphäre), 181 sind gesetzt; 37 davon sind Technik (Proben, Gitter, Schranken). Unter den 199 Welt-Maßen sind 149 gesetzt (75 %): fast die ganze Tektonik, das Relief der Ränder, die Niederschlags-Gürtel und die Brücke sind gestimmte Zahlen ohne Anker.
2. Der Körper der Erde ist ein fester Schlüssel (`PLANET_ERDE` :263, zehn Werte), doch **freibordKm, shelfKm und bodenAlterMaxMa wählt auch für die „Erde" der Samen** (:317, :324, :325), ebenso nS 20–40, nO 3–6 und jede Platten-, Naht-, Hotspot- und Trapp-Zahl.
3. Das Spiel liest den Planeten an **genau einer Tür: dem Konsolen-Satz „reise"** (stamm/feld-leben.js:1227/1284 → stamm/gelaende-chunks.js:643/680 → voxel-worker.js:1164/1175). Die Heimat liest ihn nie: `ortGesetz(null)` gibt die Konstanten `TEMPERATUR`, `PEGEL`, `GRUND` zurück (gelaende-core.js:5843 ff.).
4. Durch die Tür gehen `land`, `kuesteKm`, der Anker (breite, laenge, kuesteKm) und 19 Δ-Felder (klima 5, meer 1, wetter 2, wuchs 2, wildnis 9); `hoeheM` wird gereicht und nirgends gelesen, und drei Wildnis-Felder (kontinentLambda, schichtDicke, hartAnteil) sind per Bau immer 0.
5. **Kein absoluter Planeten-Wert erreicht das Spiel.** Temperatur, Tagesgang, Phase, Spende, Wetter, Wuchs, Meer und Landform kommen als Heimat + Δ oder Heimat × Verhältnis. Köppen und Whittaker, die Windrichtung, die Vulkane samt Förderung, die Ränder, die Leit-Stützen und die Stauchung haben keinen Leser im Spiel (36 Zeilen `ohne_leser`).
6. Zwillinge: Die Sonne des Spiels läuft ohne Breite und ohne Achsneigung (welt-licht.js:711), die Schwere ist eine eigene Konstante (stamm/daten.js:72), der Wind kommt aus der Welt-Saat (phyto-core.js:4334), die Tageslänge ist eine Spieler-Einstellung, und die Zeitgrenzen sowie fuss 16 stehen als Literale im Spiel.
7. Die Kosten hängen an der Abfrage, nicht an R: Plan 8–15 ms und 36–77 KB über R 3 186–12 742, Scheibe kalt 49–110 ms (größter Posten `planetMeer`, einzeln 71–145 ms), Punkt 6–8 µs, Ort 0,6–1,1 ms, Anker 6–10 ms. Das Klima auf Land kostet 45–62 µs, die Schwelle in ENTSCHEID ist ≤ 25 µs.
8. Zwei Brüche sind gemessen. Erstens wird der Anker bei fuss 40 gesucht, aber bei fuss 16 gelesen: bei erde-29 liegt er im Meer, und 135 von 200 Land-Zielen dieser Saat lehnt `ortGesetz` ab. Zweitens trägt der Anker in 8 von 30 Saaten den Wald 0, und dann ist das Wald-Verhältnis an jedem Ort 1.
9. Linse `--richter bau3`: **Exit 1**, 5 Zeilen ROT (drift.cm_a, zeit.stetig, zeit.schritt, zeit.sprung, zeit.reise); ort.kosten und ort.leser sind GRÜN. `ort.leser` zählt allerdings gelaende-core.js als Leser von `planetOrt`, und der Treffer ist ein Kommentar (gelaende-core.js:5689).

## §1 Die Zeilen

Spalten: **U** Urteil (f = folgt · a = gesetzt_anker · g = gesetzt) · **T** Technik · **OL** ohne Spiel-Leser. „Spiel" nennt die Kette ins Spiel; jede läuft nur über den Satz „reise":

- **land**: voxel-worker.js:1190 `land = hoeheM > 0` → stamm/feld-leben.js:1299. Bei Meer folgt der Satz statt der Geburt der Reise-Welt.
- **küste**: voxel-worker.js:1192 → stamm/feld-leben.js:1302, der Satz „Meer, Küste x km".
- **anker**: planet-core.js:2238 → voxel-worker.js:1168 → stamm/feld-leben.js:1230 (der Satz „reise") und :1292 (Heim-Erkennung).
- **klima**: voxel-worker.js:1195–1196 → gelaende-core.js:5900–5901 `klimaHeute` → temperaturFeld :1321, Schneeband :1294 und der Satz stamm/feld-leben.js:1315.
- **tagAmp**: voxel-worker.js:1197 → gelaende-core.js:5902 → :1321.
- **phase**: voxel-worker.js:1198 → gelaende-core.js:5903 → stamm/bild-himmel.js:2899 und gelaende-core.js:1506.
- **spende**: voxel-worker.js:1199 → gelaende-core.js:5904/5918 → pegelTafel :1778.
- **meer**: voxel-worker.js:1201 → gelaende-core.js:5910 `meerUnterBasisM` → stamm/bild-himmel.js:485 und gelaende-core.js:5816.
- **wetter**: voxel-worker.js:1202 → gelaende-core.js:5920 → phyto-core.js:4407 wetterVersatz.
- **wuchs**: voxel-worker.js:1203 → gelaende-core.js:5921 ortWuchs → stamm/vegetation-wiese.js:2087/2513, stamm/vegetation-baum.js:1354, voxel-worker.js:4332 und seeBilanz gelaende-core.js:6041.
- **wildnis**: voxel-worker.js:1204 → stamm/netz-portal.js:704 ortErbgut → gelaende-core.js:5951, geklemmt auf LANDFORM_REGLER :379.

Die vollen Lese-Ketten je Größe stehen in der JSON (`leser`).

### Körper (23 · f 4 · a 10 · g 9 · OL 4)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e1 | PLANET_ERDE.radiusKm | 6371 | km | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 2500 + 9500·Z :311 | land · wetter |  |  | Spiel liest nur PLANET_ERDE (voxel-worker.js:1159). Kosten unabhängig von R gemessen (§2). |
| e2 | PLANET_ERDE.g | 9.81 | m/s² | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 9,81·R/6371·(0,8 + 0,4Z) :314 | land · wetter |  |  | Zwilling: stamm/daten.js:72 WELT_GESETZ_ERDE.schwere −9,81 (Schwere des Spiels, nie aus dem Planeten) · Zwilling: stamm/netz-portal.js:701 schwere der Reise-Welt = schwere der Heimat |
| e3 | PLANET_ERDE.wasserKm | 2.62 | km Wassersäule | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 1,9 + 1,2Z :315 | land · meer |  |  | flüssiges Wasser = wasserKm − eisKm (:1612) |
| e4 | PLANET_ERDE.krustenAnteil | 0.41 | 1 (Flächenanteil) | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 0,33 + 0,15Z :316 | land · küste |  |  |  |
| e5 | freibordKm | 0,25 + 0,5·Z (erde-01 0,324 · erde-05 0,417 · erde-09 0,381) | km | :317 | g | Samen: fehlt im Erd-Schlüssel PLANET_ERDE :263 und in ENTSCHEID §2 :136 — die Saat wählt ihn auch für die „Erde" | land · küste |  |  | ENTSCHEID §2 :109 nennt freibordKm im koerper, der Erd-Schlüssel nicht. |
| e6 | PLANET_ERDE.neigungRad | 0.4091 | rad (23,44°) | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 0,7Z :318 | klima · spende |  |  | Zwilling: welt-licht.js:711 sonnenRichtung — Bahn ohne Breite und ohne Achsneigung (Meeus-Bahn gebaut und gefallen :702–710): die Neigung erreicht die Sonne des Spiels nie |
| e7 | PLANET_ERDE.tagStunden | 24 | h | :263 | a | Erd-Schlüssel (Literatur), ENTSCHEID §2 :136; Saat-Weg 10 + 40Z :319 | spende · wetter |  |  | Zwilling: stamm/werkstatt-hud.js:1988–2003 dayLengthMinutes (Einstellung des Spielers, nie aus dem Planeten) |
| e8 | PLANET_ERDE.jahrTage | 365 | d | :263 | a | Erd-Schlüssel ENTSCHEID §2 :136 sagt 365,25; Code 365 = Jahr des Ort-Gesetzes (R5, Kommentar :264); Saat-Weg 100 + 700Z :320 | klima |  |  | Zwilling: gelaende-core.js:1319 TEMPERATUR.jahrTage 365 (das Jahr des Spiels; R5 erzwingt Gleichheit) · ENTSCHEID ≠ Code (365,25 ↔ 365). |
| e9 | PLANET_ERDE.drehsinn | 1 | ±1 | :263 | a | Erd-Schlüssel ENTSCHEID §2 :136; Saat-Weg Z < 0,5 ? −1 : 1 :321 | klima · spende |  |  |  |
| e10 | PLANET_ERDE.sternFluss | 1 | × Erde | :263 | a | Erd-Schlüssel ENTSCHEID §2 :136 (Erde = 1 per Definition); Saat-Weg 0,8 + 0,4Z :322 | klima |  |  |  |
| e11 | PLANET_ERDE.alterMa | 4570 | Ma | :263 | a | Erd-Schlüssel ENTSCHEID §2 :136; Saat-Weg 3000 + 3000Z :323 | klima |  |  | wirkt nur bei zeitMa ≠ 0 (bei t = 0 kürzt es sich) |
| e12 | bodenAlterMaxMa | 180 + 20·Z (195,7 · 182,5 · 186,7) | Ma | :324 | g | Samen: fehlt im Erd-Schlüssel :263 (ENTSCHEID §2 :109 nennt ihn im koerper, :136 nicht) | meer |  |  |  |
| e13 | shelfKm | 0,12 + 0,18·Z (0,236 · 0,236 · 0,161) | km | :325 | g | Samen: weder im Erd-Schlüssel :263 noch in ENTSCHEID §2 :109/:136 | küste |  |  | ENTSCHEID kennt shelfKm nicht. |
| e14 | regime | "platten" | – | :326 | g | Code: nur „platten" gebaut | — (planet-core.js:328) |  | OL | Prüfung, kein Wert-Leser; Kern-Ausgang keiner |
| e15 | nS Schollen-Zahl | 20 + ⌊21·Z⌋ (21 · 24 · 21) | Schollen | :331 | g | Samen | land · küste |  |  |  |
| e16 | nO Ozean-Platten | 3 + ⌊4·Z⌋ (6 · 6 · 6) | Platten | :332 | g | Samen | wildnis |  |  |  |
| e17 | Gesetzes-Band nS 4–48, nO 2–16 | 4…48 / 2…16 | Stück | :333 | g | Code | — (planet-core.js:333) | T | OL |  |
| e18 | gS = 9,81/g | 1 (Erde) | 1 | :330 | f | aus g: gS = 9,81/g | Kern: planet-core.js:1273/1306/1438/1497/1518 |  |  |  |
| e19 | MAX_P | 64 | Platten | :275 | g | Code | — (planet-core.js:812) | T | OL | ENTSCHEID §4 :208: „ab nP > 40 ein Kandidaten-Index je Scheibe"; der Code bricht bei 64 und hat keinen Index. |
| e20 | nachbarKm(R) | 1300 + 650 + 2·√(4π/4096)·R | km | :302 | f | aus PLATTEN_VERZUG_KM und der Proben-Dichte 4096 | — (planet-core.js:855) | T | OL |  |
| e21 | VERSION | "planet-h2-4" | – | :57 | g | Code | anker · version | T |  |  |
| e22 | planetHash FNV-1a + mix32 | Samen-String → 32 bit | – | :149 | f | aus dem Samen | land | T |  |  |
| e23 | Samen des Planeten im Spiel | "anazh-realm-seed" (Heim-Saat) | – | :149 | f | aus der Welt-Saat | samen |  |  | Heim-Anker gemessen: 43,43° N 12,08° O, Küste 289 km, Dfc auf 1 197 m (e-mess.cjs §H). |

### Platten (46 · f 1 · a 0 · g 45 · OL 2)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e24 | T_START / T_ENDE | −4000 / +1000 | Ma | :271 | g | Code (ENTSCHEID §0) | satz-grenze |  |  | Zwilling: stamm/feld-leben.js:1278 Literal −4000 … 1000 (Zwilling der Grenzen, nicht gelesen) |
| e25 | Schollen-Gewicht Pareto α 4/3 | v^(−3/4) | 1 | :339 | g | Code :338 („gestutzt Pareto α 4/3"), keine Quelle | land |  |  |  |
| e26 | SCHOLLE_DECKEL | 6 | × Median-Gewicht | :277 | g | Code | Kern: planet-core.js:339 |  |  |  |
| e27 | Flächen-Faktor 1,22 | 1.22 | 1 | :342 | g | Code | Kern: planet-core.js:342 |  |  |  |
| e28 | Schollen-Alter | 1500 + 2500·Z | Ma | :344 | g | Samen | wildnis |  |  |  |
| e29 | schildFaktor | 1,9 − 1,8·(Alter − 1500)/2500 | 1 | :289 | g | Code | Kern: planet-core.js:1425/1540 |  |  |  |
| e30 | Lappen-Gewicht | 0,8 + 0,4·Z | 1 | :346 | g | Samen | küste |  |  |  |
| e31 | GRUPPE_NEU | 0.25 | p | :277 | g | Code | Kern: planet-core.js:359 |  |  |  |
| e32 | GRUPPE_DOM | 0.4 | × nS | :277 | g | Code | Kern: planet-core.js:357 |  |  | ENTSCHEID §4 :57/:206: Kontinent = 2–6 Schollen; Code deckelt bei ⌊0,4·nS⌋ (8–16). |
| e33 | Gruppen höchstens 19 − nO | 19 − nO | Gruppen | :357 | g | Code | Kern: planet-core.js:359 |  |  |  |
| e34 | Start-Baum Abstand | (r_a + r_b)·(0,72 + 0,25·Z) | rad | :377 | g | Samen | Kern: planet-core.js:377 |  |  |  |
| e35 | verstreuen: 28 Kandidaten, Wertung min(l, 0,35) − 0,12·w | 28 / 0,35 / 0,12 | – | :438 | g | Code | Kern: planet-core.js:442 |  |  |  |
| e36 | versammeln: Lichte 0,86 | 0.86 | × Radien | :466 | g | Code | Kern: planet-core.js:466 |  |  |  |
| e37 | Ozean-Zug | 25 | km/Ma | :509 | g | Code | wildnis |  |  |  |
| e38 | Ozean-Richtung Streuung | 1.75 | rad | :513 | g | Samen | Kern: planet-core.js:513 |  |  |  |
| e39 | Ozean-Platten-Rate | 35 + 60·Z (3,5–9,5 cm/a) | km/Ma | :514 | g | Samen | wildnis |  |  | ENTSCHEID §4 :207: „Rate aus dem Samen im Band 2–8 cm/a". |
| e40 | Drehung je Schlüsselbild ≤ 0,9π | 0,9π | rad | :518 | g | Code | Kern: planet-core.js:518 | T |  |  |
| e41 | Naht-Kontakt-Lücke | 0.02 | rad | :528 | g | Code | Kern: planet-core.js:528 |  |  |  |
| e42 | Naht-Höhe H0 | 3,2 + 2,0·Z | km | :544 | g | Samen | land · wildnis |  |  |  |
| e43 | Naht-Breite | 80 + 50·Z (wächst ≤ 2× bis 300 Ma :1461) | km | :544 | g | Samen | wildnis |  |  |  |
| e44 | Naht-Zeit t − 30 | -30 | Ma vor dem versammelten Bild | :596 | g | Code | Kern: planet-core.js:596 |  |  |  |
| e45 | Kontinent-Rate | 45 + 40·Z (4,5–8,5 cm/a) | km/Ma | :580 | g | Samen | land · wildnis |  |  | ENTSCHEID §4 :207: 2–8 cm/a. Linse drift.cm_a ROT: p05 0,57 · Median 2,77 · p95 7,62 cm/a (Schwelle p05 ≥ 1). |
| e46 | Mindest-Dauer eines Abschnitts | 40 | Ma | :581 | g | Code | Kern: planet-core.js:581 |  |  |  |
| e47 | Verweildauer versammelt | 50 + 100·Z | Ma | :584 | g | ENTSCHEID §4 :207 (50–150 Ma) | Kern: planet-core.js:584 |  |  |  |
| e48 | Drift des Superkontinents | 15 + 15·Z | km/Ma | :586 | g | Samen | Kern: planet-core.js:586 |  |  |  |
| e49 | Schlüsselbilder höchstens 80 | 80 | Bilder | :576 | g | Code | — (planet-core.js:600) | T | OL |  |
| e50 | tempo(u) | 0,4u + 0,6·u²(3 − 2u) | 1 | :683 | g | ENTSCHEID §4 :207 | land |  |  |  |
| e51 | TAU_W (Reife) | 20 | Ma | :271 | g | ENTSCHEID K4 :77 (τw) | wildnis |  |  |  |
| e52 | TAU_A (Abbau) | 120 | Ma | :271 | g | ENTSCHEID K4 :77 (τa) | wildnis |  |  |  |
| e53 | WURZEL_ANTEIL / WURZEL_TAU | 0,15 / 1500 | 1 / Ma | :1158 | g | Code | wildnis |  |  | ENTSCHEID K4 :77 und Kopf :21 kennen den Wurzel-Term nicht. |
| e54 | Schürze | 150 + 300·Z | km | :711 | g | Samen | wildnis |  |  |  |
| e55 | hinten | 2200 + 1600·Z | km | :711 | g | Samen | Kern: planet-core.js:711 |  |  |  |
| e56 | tOffen 1,05 | 1.05 | × Radien | :722 | g | Code | Kern: planet-core.js:722 | T |  |  |
| e57 | Rand-Gedächtnis 32 Fächer | 32 | Fächer | :740 | g | Code | Kern: planet-core.js:1473 | T |  |  |
| e58 | Rand-Gedächtnis H0 | 4,4·s0·reife·gS·glatt(0,35; 0,7; Front) | km | :762 | g | Code | wildnis |  |  |  |
| e59 | Q Krusten-Schwelle | 0,1177 · 0,0882 · 0,1314 | Feldwert | :787 | f | aus krustenAnteil: Quantil über 4096 Fibonacci-Proben (:795–:799) | küste |  |  |  |
| e60 | Nachbar-Liste 4096 Proben | 4096 | Proben | :853 | g | Code | — (planet-core.js:853) | T | OL |  |
| e61 | Paar-Konvergenz aus Proben < 250 km | 250 | km | :861 | g | Code | Kern: planet-core.js:861 | T |  |  |
| e62 | Schollen-Ellipse Achsen | 1 + 0,6·Z | 1 | :1016 | g | Samen | Kern: planet-core.js:1016 |  |  |  |
| e63 | Platten-Verzug λ / A / Schranke | [2600, 800, 260] / [900, 280, 80] / 650 | km | :299 | g | Code (Gegner 3) | wildnis |  |  |  |
| e64 | K1 Krusten-Vorrang ×12 | 12 | 1 | :999 | g | Code | Kern: planet-core.js:999 | T |  |  |
| e65 | paarRelativC Fenster | glatt(0,3; 0,8) | 1 | :1110 | g | Code | Kern: planet-core.js:1110 | T |  |  |
| e66 | Rand-Art Schwellen | konv/offen > 0,35·Rate und > 2 km/Ma | km/Ma | :1266 | g | Code | wildnis |  |  |  |
| e67 | Rand-Reichweite der Schablonen | 1300 | km | :1268 | g | Code | Kern: planet-core.js:1268 |  |  |  |
| e68 | Kontinent-Gewicht wkI/wkJ | glatt(500, 900) | km | :1271 | g | Code | Kern: planet-core.js:1271 |  |  |  |
| e69 | NACHKLANG_MA | 10 | Ma | :1209 | g | Code | Kern: planet-core.js:1212–1214 |  |  |  |

### Relief (38 · f 2 · a 1 · g 35 · OL 3)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e70 | lamCut = max(32, 2·fuss) | 32 (fuss 16) | km | :1057 | g | K8 (Kopf :1–53) | land |  |  |  |
| e71 | fuss der Brücke | 16 | km | :2309 | g | K8: Band ≥ 32 km | Kern: planet-core.js:2309 |  |  | Zwilling: voxel-worker.js:1182 fuss 16 (dieselbe Zahl im Faden, als Literal) |
| e72 | rausch ×0,7 · fbm 2,03/Oktave, ≤ 12 Oktaven, ×1,6 | 0,7 / 2,03 / 12 / 1,6 | 1 | :175 | g | Code | Kern: planet-core.js:191–201 | T |  |  |
| e73 | gratKm (1 − \|n\|)², zwei Oktaven | 2 Oktaven | 1 | :202 | g | Code | Kern: planet-core.js:1278/1315 | T |  |  |
| e74 | Schollen-Wellen lam0 / lamG / lamF | min(3000, rs·R) / min(6000, 2rs·R) / 0,45·lam0 | km | :1032 | g | Code | land · küste |  |  |  |
| e75 | Schollen-Warp | 0,45·lam0 | km | :1040 | g | Code | Kern: planet-core.js:1040 |  |  |  |
| e76 | LAPPEN_GROB / LAPPEN_FEIN | 1,5 / 0,45 | Feld | :279 | g | Code | küste |  |  |  |
| e77 | KUESTE_GEWINN | 0.75 | je Oktave | :295 | g | Anker eigenes Bild (gemessen D 1,18, kueste.dimension) | küste |  |  |  |
| e78 | RAMPE0 / RAMPE1 | 0,04 / 0,25 | Feld | :272 | g | Code | land · küste |  |  |  |
| e79 | Hang glatt(Q − 0,05; Q) | 0.05 | Feld | :1413 | g | Code | Kern: planet-core.js:1413 |  |  |  |
| e80 | BECKEN_C / BECKEN_GEWINN / BECKEN_TIEF | 3,0 × Freibord / 0,62 / 2 | 1 | :284 | g | Code | küste |  |  | ENTSCHEID §4 :210: „träge Tafel-Welle ±0,3 km"; der Code hat das Becken-Feld 3·Freibord. |
| e81 | Becken-Spektrum | 4000 … max(32, 2·fuss) (Hülle 800) | km | :1421 | g | Code | Kern: planet-core.js:1425 |  |  |  |
| e82 | DYN_KM dynamische Topographie | 2,0 × fbm (λ 5000–1200, Gewinn 0,55) | km | :293 | g | Code „gesetzt (Erde ±0,5…1 km, Flament et al. 2013, ungeprüft)" :1434 | Kern: planet-core.js:1438–1439 |  |  |  |
| e83 | Mantel-Drehung | 10 | km/Ma (1 cm/a) | :1436 | g | Code | Kern: planet-core.js:1436 |  |  |  |
| e84 | SEDIMENT_FUELLT | 0.3 | 1 | :294 | g | Code (gesetzt) | Kern: planet-core.js:1439 |  |  |  |
| e85 | GDH1 Ozean-Tiefe | 2,6 + 0,365√a (a < 20) · 5,651 − 2,473e^(−0,0278a) | km | :1152 | a | Stein & Stein 1992 (GDH1), ENTSCHEID §1 :83 | meer |  |  |  |
| e86 | Tiefsee-Hügel | 0,08 km, λ 130 | km | :1411 | g | Code | — (planet-core.js:1411) |  | OL | nur Meeresboden: ändert weder land noch kont (Hülle ohne Hügel) |
| e87 | alterAusSumme p = 4, weicher Deckel | p = 4 | 1 | :1145 | g | Code | Kern: planet-core.js:1399 |  |  |  |
| e88 | graben | −3,0·s·gauss(ξ−40, 45) + 0,25·s·gauss(ξ−170, 70) | km | :1151 | g | Code | Kern: planet-core.js:1285–1288 |  |  |  |
| e89 | Orogen-Stärke s | min(1,6; konv/25)·reife·gS | 1 | :1273 | g | Code | land · wildnis |  |  |  |
| e90 | Grat-Faktor | 1 + 0,38·(grat − 1), λ 210 km, Fenster 700 km | 1 | :1278 | g | Code | wildnis |  |  | ENTSCHEID §4 :210: „0,45 + 0,55·Grat"; Code 0,62–1. |
| e91 | Kontinent-Kollision | 5,0·gauss(x−110, 200) − 0,35·gauss(x−440, 120) | km | :1282 | g | Code | land · wildnis |  |  |  |
| e92 | Anden-Profil | 4,4·gauss(x − xAnden, 85), xAnden = Schürze·R + 300 | km | :1285 | g | Code | land · wildnis |  |  |  |
| e93 | Insel-Bogen | 3,2·gauss(x−190, 55) | km | :1288 | g | Code | land · wildnis |  |  |  |
| e94 | Rift | −1,2·dv·e^(−x/130), dv = min(1, offen/20) | km | :1314 | g | Code | land |  |  |  |
| e95 | Rücken | −0,35e^(−x/14) + 0,35e^(−x/60)(grat−0,45), λ 90, < 250 km | km | :1315 | g | Code | — (planet-core.js:1315) |  | OL | nur Ozean-Rücken, nur Punkt: ändert land/kont nicht |
| e96 | Transform | −0,6·tr·e^(−x/45), tr ∝ scher/30 | km | :1334 | g | Code | land |  |  |  |
| e97 | Versatz-Treppe | L 260 + 300·Z km, ≤ 80 km | km | :1384 | g | Code | Kern: planet-core.js:1388 |  |  |  |
| e98 | NAHT_KM | 100 | km | :1341 | g | Code | Kern: planet-core.js:1404–1407 | T |  |  |
| e99 | randTafel Breite | 85·(1 + min(a, 400)/200) | km | :1168 | g | Code | wildnis |  |  |  |
| e100 | randForm Lage und Erhalt | 150 + 450·u km (+0,6 km/Ma, ≤ 0,5·r) · glatt(0,1; 0,3)·(0,75–1) | km | :1184 | g | Code | wildnis |  |  |  |
| e101 | nahtTafel | gedaechtnisHoehe·(1 − e^(−a/20))·gS | km | :1190 | f | aus TAU_W, TAU_A, WURZEL (K4) | wildnis |  |  |  |
| e102 | Trapp-Höhe | st·e^(−a/150)·glatt(0, 1, a), a ≤ 400 | km | :1497 | g | Code (gesetzt) | land |  |  |  |
| e103 | orogenStaerke | min(1, hGeb/5) | 1 | :1553 | g | Code | wildnis |  |  |  |
| e104 | orogenAktiv | hOro ≥ hMem und hOro > 0,2 km | km | :1554 | g | Code | anker |  |  |  |
| e105 | kont an Becken-Küsten | d0 60 km, glatt(0,5; 0,9) | km | :1533 | g | Code | küste · klima · wildnis |  |  |  |
| e106 | Höhe h = hA + hB·refKm − sigmaKm | K7 | km | :1649 | f | K7: Kontinent relativ zum Bezugs-Spiegel | land · klima · wuchs |  |  |  |
| e107 | Krusten-Klasse | S2 > 0,5 Kontinent · S1 > 0,5 Schelf · Hang · Ozean | – | :1550 | g | Code | — (planet-core.js:1650) | T | OL |  |

### Vulkan (23 · f 1 · a 0 · g 22 · OL 4)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e108 | Hotspots nH | 300 | Stück | :608 | g | Code | Kern: planet-core.js:880 |  |  |  |
| e109 | Hotspot-Beginn | −4300 … +1100 | Ma | :611 | g | Samen | Kern: planet-core.js:886 |  |  |  |
| e110 | Hotspot-Leben | 120 + 480·Z | Ma | :611 | g | Samen | Kern: planet-core.js:886 |  |  |  |
| e111 | Hotspot-Stärke | 0,6 + 0,6·Z | 1 | :612 | g | Samen | Kern: planet-core.js:1518 |  |  |  |
| e112 | Ketten-Takt | 3.5 | Ma | :883 | g | Code | Kern: planet-core.js:890 |  |  |  |
| e113 | Ketten-Stützen | 24 | Stützen | :881 | g | Code | Kern: planet-core.js:889 | T |  |  |
| e114 | Ketten-Ausblenden | glatt(80,5; 84) | Ma | :904 | g | Code | Kern: planet-core.js:904 |  |  |  |
| e115 | Ausbruchs-Versatz | 0 … 3 | Ma | :895 | g | Samen | Kern: planet-core.js:895 |  |  |  |
| e116 | Ausbruchs-Stärke, Ausfall | 0,35–1,25, jeder 8. fällt aus | 1 | :896 | g | Samen | Kern: planet-core.js:904 |  |  |  |
| e117 | Ketten-Breite | 0,7 + 0,55·Z | × σ | :906 | g | Samen | Kern: planet-core.js:1515 |  |  |  |
| e118 | Ketten-Abklingen Ozean / Kontinent | e^(−τ/32) / e^(−τ/4) | Ma | :905 | g | Code | Kern: planet-core.js:1518 |  |  |  |
| e119 | Ketten-Kappe Rand | 320 / 300 | km | :918 | g | Code | Kern: planet-core.js:1509/1513 | T |  |  |
| e120 | Hotspot-Kegel | σ = (30 + 90·S1)·Breite; 4,2·Ozean + 0,6·Kontinent | km | :1506 | g | Code | land |  |  |  |
| e121 | Bogen-Kegel | Takt 70 km, 1,2–3,0 km, r 26 km, 10 % Lücke | km | :1299 | g | Samen | land |  |  |  |
| e122 | Rift-Kegel | 0,8–2,4 km, r 20 km, 30 % Lücke | km | :1318 | g | Samen | land |  |  |  |
| e123 | Trapps nE | 28 | Ereignisse | :615 | g | Code | Kern: planet-core.js:1490–1499 |  |  |  |
| e124 | Trapp-Radius | 250 + 500·Z | km | :624 | g | Samen | Kern: planet-core.js:1496 |  |  |  |
| e125 | Trapp-Stärke | 0,3 + 0,4·Z | km | :624 | g | Samen | Kern: planet-core.js:1497 |  |  |  |
| e126 | Trapp-Zeit | T_START … T_ENDE gleichverteilt | Ma | :623 | g | Samen | Kern: planet-core.js:1493 |  |  |  |
| e127 | vulkanAktiv Schwellen | s·wBogen > 0,12 · dv·wRift > 0,15 · τ < 3,5 Ma · Trapp a < 2 Ma | 1 | :1307 | g | Code | — (planet-core.js:2352) |  | OL | kein Spiel-Leser: voxel-worker.js:1184–1206 reicht vulkan nicht weiter |
| e128 | Förderung | 8 (Hotspot) / 0,6 (sonst) | km³/Ma | :2352 | g | Code („dieselbe Regel wie planetVulkane") | — (planet-core.js:2351) |  | OL | kein Spiel-Leser |
| e129 | planetVulkane Gitter | 22 km, Treffer ≤ 0,75·22 | km | :1680 | g | Code | — (planet-core.js:1676–1712) | T | OL |  |
| e130 | ortRoh.vulkan (Art, Abstand, Alter) | Art · km · Ma | – | :2351 | f | aus dem Punkt | — (planet-core.js:2351) |  | OL | kein Spiel-Leser |

### Meer/Eis (14 · f 4 · a 1 · g 9 · OL 2)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e131 | meerLoesen | ±15 km, 64 Halbierungen | km | :1561 | f | Volumen-Gleichung Σ max(0, σ − h)/n = Wasser (K7) | land · meer | T |  | ENTSCHEID §4 :213 „einmal sortiert, Volumen-Kurve"; Code halbiert 64-mal. |
| e132 | PROBEN_SPIEGEL | 4096 | Proben | :1574 | g | Code | Kern: planet-core.js:1604 | T |  |  |
| e133 | PROBEN_BEZUG | 1024 | Proben | :1574 | g | Code (gemessen Entscheid-2 §0.3, Kommentar :1572) | Kern: planet-core.js:1590 | T |  |  |
| e134 | Hüll-Proben fuss | 400 | km | :1580 | g | Code | Kern: planet-core.js:1580 | T |  |  |
| e135 | BEZUG_MA | 100 | Ma | :273 | g | Code | — (nie gelesen) |  | OL | toter Name: nie gelesen; sigmaRef rechnet 5 Stützen × 20 Ma als Literal (:1596–1597) |
| e136 | sigmaRef Erosionsbasis | 5 Stützen × 20 Ma | Ma | :1595 | g | K7 | land |  |  |  |
| e137 | EIS_DICKE_KM | 2 | km | :274 | g | Code „gesetzt (Antarktis ~2,1 km, Literatur, ungeprüft)" | meer |  |  |  |
| e138 | EIS_RHO | 0.917 | ρEis/ρWasser | :274 | a | Physik: Dichte Eis/Wasser | Kern: planet-core.js:1611 |  |  |  |
| e139 | Land-Eis polwärts der Eis-Linie | G.eisBreite | rad | :1608 | f | aus der Energiebilanz (planetKlimaGlobal) | Kern: planet-core.js:1610 |  |  |  |
| e140 | planetMeer Fach | 10 | Ma | :1622 | g | ENTSCHEID §4 :169 | Kern: planet-core.js:1625–1626 | T |  |  |
| e141 | kuesteF Halbierung | 40 | Schritte | :1641 | g | Code | küste | T |  |  |
| e142 | meerKm | 0,033 · −0,176 · 0,227 (t = 0) | km | :1628 | f | σ − σRef (K7) | meer |  |  |  |
| e143 | waterLevelM | −3 + s_v·(meerKm(t) − meerKm(0))·1000; Δ bei −100 Ma +5,51 · +23,18 · −18,32 | m | :2331 | f | aus meerKm und der Stauchung s_v | meer |  |  | Zwilling: gelaende-core.js:5679 GRUND.meerUnterBasis 3 (Heimat) · eine Zahl je Zeit, nie je Ort: über 150 Land-Orte genau 1 Wert (§2 D) |
| e144 | MEEREIS_WINTER_C | -12 | °C | :292 | g | Code (Gegner 3) | — (planet-core.js:2104) |  | OL | kein Spiel-Leser; Ausgang: Atlas-Schicht biom/koeppen |

### Klima (51 · f 10 · a 8 · g 33 · OL 4)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e145 | KLIMA.q0 | 334.4 | W/m² | :1858 | a | North & Coakley 1979 (S0 = 1337,6/4) | klima |  |  |  |
| e146 | KLIMA.olrA / olrB | 203,3 / 2,09 | W/m², W/m²K | :1859 | a | North & Coakley 1979 | klima |  |  |  |
| e147 | KLIMA.diffD | 0.5 | W/m²K | :1859 | g | Code: Literatur 0,649 verworfen („trägt keine Eis-Kappe") | klima |  |  |  |
| e148 | KLIMA.coA0 / coA2 | 0,697 / −0,0779 | 1 | :1860 | a | North 1975 | klima |  |  |  |
| e149 | KLIMA.coEis | 0.38 | 1 | :1860 | a | North 1975 | klima |  |  |  |
| e150 | KLIMA.tEisC | -10 | °C | :1861 | a | North 1975 | meer |  |  |  |
| e151 | KLIMA.walker | 0.9 | 1 | :1862 | g | Code „γ gesetzt" (Mechanismus Walker et al. 1981) | Kern: planet-core.js:1894 |  |  | wirkt nur bei zeitMa ≠ 0 |
| e152 | Gough-Faktor | 0.4 | 1 | :1889 | a | Gough 1981 | klima |  |  |  |
| e153 | Einstrahlung s2 | −0,625·P2(cos β) (Erde −0,482) | 1 | :1891 | f | Jahresmittel der Einstrahlung, 2. Legendre-Mode aus β (North 1975) | klima |  |  |  |
| e154 | Energiebilanz-Gitter | N 256, 80 Iterationen, Relaxation 0,5 | – | :1894 | g | Code | Kern: planet-core.js:1896–1907 | T |  |  |
| e155 | T0 / T2 | Zonen-Temperatur T0 + T2·P2 | °C | :1904 | f | Energiebilanz (North 1975) | klima |  |  |  |
| e156 | Held-Hou ΔH | max(0,01; −1,5·T2r/T0K) | 1 | :1909 | f | Held & Hou 1980 | Kern: planet-core.js:1911 |  |  |  |
| e157 | KLIMA.tropoKm | 10 (× 9,81/g × T/288) | km | :1863 | g | Code „gesetzt" | Kern: planet-core.js:1910 |  |  |  |
| e158 | Hadley-Rand φH (zellBreite) | 29,6° (Erde) · 59,3° (R/2) · 14,8° (2R) | ° | :1911 | f | Held & Hou 1980: √(5/3·gHΔ/(Ω²a²)) | spende · wetter |  |  |  |
| e159 | Zellen je Halbkugel | 3 (Erde) · 2 · 6 | Zellen | :1913 | f | ⌊π/2/φH + 0,5⌋ | Kern: planet-core.js:1930 |  |  |  |
| e160 | KLIMA.lapse | 6.5 | K/km | :1864 | a | Standard-Atmosphäre | klima |  |  | Zwilling: gelaende-core.js:5850 kuehlungKJeM = 18/162,5 = 0,1108 K/m (17× steiler; s_v = 0,0587 übersetzt die Höhen) |
| e161 | Gürtel: grund / itcz, Breite 0,4w | 250 / 2600 | mm/a | :1872 | g | Code „gegen Köppen gerichtet" | spende · wetter · wuchs |  |  |  |
| e162 | Sturmbahn sturm, Lage 0,75·k·w, Breite 0,55w | 1100 | mm/a | :1872 | g | Code | spende · wetter · wuchs |  |  |  |
| e163 | Absinken Hadley-Rand | 0,85 bei 0,85w, Breite 0,3w | 1 | :1873 | g | Code | spende · wetter · wuchs |  |  |  |
| e164 | Meridional-Wind | 0.3 | × zonal | :1960 | g | Code | klima · spende |  |  |  |
| e165 | stehende Wellen der Zirkulation | 0,9 rad × fbm λ 6000–2500 | rad | :1965 | g | Code | spende |  |  |  |
| e166 | Clausius-Clapeyron kalt-seitig | e^(0,05·(tZ − 15)), ≥ 0,08 | 1/K | :1970 | g | Code | spende · wetter · wuchs |  |  |  |
| e167 | feuchteLand0 / feuchteLand1 | 0,35 / 0,5, glatt(5, 25) | 1 | :1870 | g | Code | spende · wetter · wuchs |  |  |  |
| e168 | mNeutral Küstenferne | e^(−kont/1000) | km | :1977 | g | Code | spende · wetter · wuchs |  |  |  |
| e169 | Wind-Gewicht om | wl/1,044 | 1 | :1979 | g | Code | spende · wetter · wuchs | T |  |  |
| e170 | KLIMA.schritte | [75, 150, 225, 300] | km | :1865 | g | Code | spende |  |  | ENTSCHEID §4 :214 und Kopf :1853/:1973: „sechs Schritte"; Code 4 + 14. |
| e171 | FEUCHTE_KM / FEUCHTE_N | 150 / 14 (bis 2100 km) | km | :1941 | g | Code (G2.3) | spende · wetter · wuchs |  |  |  |
| e172 | kontGrob fuss, Rückfall-Radius | 400 km / 0,2 | – | :1945 | g | Code | Kern: planet-core.js:1997 | T |  |  |
| e173 | KLIMA.meerKm | 300 | km | :1868 | g | Code | spende · wetter · wuchs |  |  |  |
| e174 | KLIMA.recycleKm | 6000 | km | :1869 | g | Code | spende · wetter · wuchs |  |  |  |
| e175 | maritim | e^(−sk/600) | km | :2000 | g | Code | klima · tagAmp |  |  |  |
| e176 | KLIMA.leeKm | 800 | km | :1867 | g | Code | spende · wetter · wuchs |  |  |  |
| e177 | KLIMA.schattenKm | 1.5 | km | :1866 | g | ENTSCHEID §4 :214 | spende · wetter · wuchs |  |  |  |
| e178 | Luv-Hub | 0,9·min(1,5; Anstieg) | 1 | :2014 | g | Code | spende · wetter · wuchs |  |  |  |
| e179 | Kontinentalität c | glatt(0, 1500, kont)·(1 − 0,6·maritim) | 1 | :2021 | g | Code | klima · tagAmp |  |  |  |
| e180 | Randströme | Subtropen 0,8w/0,3w (−4/+1,5 K) · Westwind 1,6w/0,35w (+5/−4, −1,5/+1 K) · Abklingen 350/500/1500/700 km | K | :2040 | g | Code | klima · spende |  |  |  |
| e181 | Monsun-Schub | (0,3 + 0,4c)·(1 − 0,5·\|φ\|/(π/2)) | × β | :2052 | g | Code | spende |  |  |  |
| e182 | Gürtel-Versatz φG | 0,035 rad × fbm | rad | :2055 | g | Code | spende · wetter · wuchs |  |  |  |
| e183 | fJ Jahres-Normierung | 1 (Erde) | 1 | :2063 | f | aus jahrTage und PLANET_ERDE.jahrTage | Kern: planet-core.js:2067 |  |  |  |
| e184 | Land-/Meer-Schwingung cL, kontiMeerKm | 0,3 + 0,7c, Schnee −0,85 · Meer 0,3·e^(−/600) | 1 | :2066 | g | Code | klima |  |  |  |
| e185 | Jahres-Amplitude amp | (5 + 28cL)·(sin β/0,39782)·\|sin φ\|·fJ | K | :2067 | g | Code | klima |  |  | Zwilling: gelaende-core.js:1314–1315 TEMPERATUR sommer 18 / winter −4 (Heimat; reist als Δ) |
| e186 | PET | 400 + 45·T | mm/a | :2069 | g | Code | wuchs |  |  | Zwilling im Kern: :2069 (petZ) und :2144 (pet) dieselbe Formel zweimal geschrieben |
| e187 | KLIMA.trockenK | 6, glatt(0,6; 0,2; P/PET) | K | :1874 | g | Code „Literatur aus dem Gedächtnis, ungeprüft" | klima |  |  |  |
| e188 | advW Winter-Advektion | −12 je Einheit | K | :2075 | g | Code | klima |  |  |  |
| e189 | Turc-Pike | L = 300 + 25T + 0,05T³ (≥ 50, T ≥ −10); ET = P/√(0,9 + (P/L)²) | mm/a | :2078 | a | Turc 1954 / Pike 1964 (im Code benannt :2077) | spende |  |  | Zwilling: gelaende-core.js:1600 PEGEL.spende 0,0009 m/d = 328,5 mm/a (Heimat; reist als Verhältnis) |
| e190 | tagAmpC | 4 + 10c·(1 − min(1, P/1500)) | K | :2080 | g | Code | tagAmp |  |  | Zwilling: gelaende-core.js:1317 TEMPERATUR.tagAmp 5 K |
| e191 | abflussMm | max(0, P − ET) | mm/a | :2085 | f | Turc-Pike | spende |  |  |  |
| e192 | schneeKm | h + tS/lapse | km | :2084 | f | Null-Grad-Höhe des Sommers | — (planet-core.js:2084) |  | OL | Zwilling: gelaende-core.js:1282–1284 SCHNEE start 140 / voll 185 · :5919 schneeBandM (rechnet die Linie selbst) · kein Spiel-Leser |
| e193 | Phasen-Verzug lag | 0,04 + 0,04·(1 − c) | Jahr | :2088 | g | Code | — (planet-core.js:2089) |  | OL | Zwilling: gelaende-core.js:1316 TEMPERATUR.sommerPhase 0,375 · kein Spiel-Leser: ortRoh ruft saison −1 (:2310) |
| e194 | windOst / windNord → windX / windZ | Einheitsvektor | 1 | :2082 | f | aus Wind-Modell | — (planet-core.js:2336) |  | OL | Zwilling: phyto-core.js:4334 windSaat (Wind des Spiels aus der Welt-Saat) · kein Spiel-Leser: voxel-worker.js:1202 reicht nur regenQuote/sturmQuote weiter |
| e195 | luv / lee / stromK / meerWest / meerLuv / feuchte / kontinental / tJetztC / pJetztMm | Lese-Ausgänge | – | :2083 | f | Zwischenwerte des Klimas | — (planet-core.js:1819) | T | OL | kein Spiel-Leser |

### Biom (8 · f 0 · a 2 · g 6 · OL 5)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e196 | KOEPPEN Tafel | 30 Klassen Af … EF | – | :1878 | a | Peel et al. 2007 (:2097) | — (planet-core.js:2338) |  | OL | kein Spiel-Leser |
| e197 | Köppen-Schwellen | tS 10 · pth = 20tJ + 280/140/0 · tW 18 · pDry 60, 100 − P/25, 40, pWet/3, /10 · 22 °C · 4 Monate · −38 °C | °C, mm | :2108 | a | Peel et al. 2007 | — (planet-core.js:2122) |  | OL | kein Spiel-Leser. Am Anker 3/30 Saaten ET (Tundra), 1/30 Meer (Köppen −1, erde-29). |
| e198 | WHITTAKER Tafel und Schwellen | 11 Klassen; tJ 3/10/15/20, P 250/300/500/700/2200/2400 | °C, mm | :1880 | g | Code „Whittaker als reine Tafel", Schwellen ohne Quelle | — (planet-core.js:2130) |  | OL | kein Spiel-Leser |
| e199 | pflanzenDeckung veg | glatt(0,1; 0,85; P/PET) | 1 | :2145 | g | Code | wuchs |  |  |  |
| e200 | decke | glatt(0; 0,55; veg) | 1 | :2146 | g | Code | wuchs |  |  | Zwilling: gelaende-core.js:5723 ORT_WUCHS.decke (Zeit-Schwelle) · :5743 min(1, Verhältnis) |
| e201 | wald | glatt(0,45; 1; veg) | 1 | :2146 | g | Code | wuchs |  |  | Zwilling: gelaende-core.js:5745 min(1, Verhältnis)·Zeit·Frost |
| e202 | Biom-Farben, KOEPPEN_FARBE, Karten-Rampen | RGB | – | :2136 | g | Anker eigenes Bild | — (planet-core.js:2149) | T | OL | kein Spiel-Leser |
| e203 | Eis-Codes (Meereis 2, EF 1) | 0/1/2 | – | :2104 | g | Code | — (planet-core.js:2123) | T | OL | kein Spiel-Leser |

### Brücke (33 · f 11 · a 0 · g 22 · OL 12)

| id | Name | Wert | Einheit | Ort | U | woraus | Spiel | T | OL | Zwilling · Anmerkung |
|---|---|---|---|---|---|---|---|---|---|---|
| e204 | ORT_KLIMA Pflichtfelder | 7 Felder | – | :2172 | g | Code | — (planet-core.js:2172) | T | OL |  |
| e205 | pruefJahr R5 | Körper-Jahr = Ort-Gesetz-Jahr | d | :2182 | g | R5 | — (planet-core.js:2206/2291) | T | OL |  |
| e206 | Anker-Zone | \|tZ − (18 + −4)/2\| ≤ 14 | K | :2213 | g | Code | anker |  |  |  |
| e207 | Anker-Bedingungen | Land, Küste 0–300 km, kein konvergenter Rand < 500 km, kein aktives Orogen | km | :2215 | g | ENTSCHEID §6 | anker |  |  |  |
| e208 | Anker-Wertung | ((ΔS/4)² + (ΔW/6)²) gegen 18 / −4 °C | K | :2217 | g | Code | anker |  |  | Zwilling: gelaende-core.js:1314–1315 TEMPERATUR 18 / −4 (die Konstanten, die der Anker wahr macht) |
| e209 | Anker-Suche | 512 Fibonacci-Proben + 3 Runden 240/120/60 km, fuss 40 | km | :2210 | g | Code | anker | T |  | Suche bei fuss 40 (:2214), Ort bei fuss 16 (:2309): erde-29 Anker +74 m (fuss 40) / −84 m (fuss 16) → Köppen −1, Spende 0 → 135/200 Land-Ziele mit spendeVerh ∞, ortGesetz lehnt ab (e-mess.cjs §H). |
| e210 | Anker-Lage breite / laenge / kuesteKm | −45,4°/−129,6° · 49,4°/−55,5° · −47,1°/43,5° (Küste 199/291/102 km) | rad, km | :2237 | f | aus der Suche | anker |  |  |  |
| e211 | Anker sommerC / winterC / randKm / randArt / wertung | 17,66/−3,85 · 16,41/−6,61 · 16,85/−4,17 °C | °C, km | :2238 | f | aus dem Klima am Anker | — (planet-core.js:2238) |  | OL | kein Spiel-Leser: voxel-worker.js:1168 reicht nur breite/laenge/kuesteKm |
| e212 | Würfel-Karte um den Anker | 6 Flächen, ξ = R·atan | m | :2244 | f | winkeltreue Würfel-Abbildung | — (planet-core.js:2343–2346) | T | OL | kein Spiel-Leser |
| e213 | landAus(kont) | −0,2 + 0,4·max(−1, kont/300) · −0,2 + 0,55 glatt(0, 300) + 0,55 glatt(300, 2000) | 1 | :2200 | g | ENTSCHEID §6 | wildnis |  |  |  |
| e214 | Stauchung s_v | 0.0586806 | 1 | :2307 | f | 0,0065/ortGesetz().kuehlungKJeM (0,110769) | meer |  |  | Feld o.stauchung :2354 selbst ohne Spiel-Leser |
| e215 | wildnis.land | klemm(landAus(kont)); Δ −0,95 … +0,88 | 1 | :2321 | g | ENTSCHEID §6 | wildnis |  |  | Zwilling: gelaende-core.js:381 LANDFORM_REGLER land def 0,35 |
| e216 | wildnis.hoehe | 0,6 + 1,0·orogenStaerke; Δ −0,09 … +1,0 | 1 | :2322 | g | Code | wildnis |  |  | Zwilling: gelaende-core.js:383 hoehe def 1 |
| e217 | wildnis.kontinentLambda | def → Δ ≡ 0 | m | :2323 | g | Code | — (planet-core.js:2320) |  | OL | Zwilling: gelaende-core.js:382 · gelesen von ortErbgut, Δ immer 0 (150 Orte × 3 Saaten × 2 Zeiten): ändert nichts |
| e218 | wildnis.rauhLambda | def + (lam − def)·glatt(0,05; 0,3; st), lam = min…max·glatt(0, 400, Orogen-Alter); Δ −1680 … +3771 | m | :2324 | g | Code | wildnis |  |  | Zwilling: gelaende-core.js:384 rauhLambda def 3200 |
| e219 | wildnis.trog | glatt(16, −2, tJ auf Meeres-Niveau); Δ −0,68 … +0,54 | 1 | :2325 | g | Code | wildnis |  |  | Zwilling: gelaende-core.js:388 trog def 0,7 |
| e220 | wildnis.ks | 3 + 12·konv, konv = glatt(0, 8, Rate)·e^(−d/600); Δ −1,4 … +12 | m^0,9 | :2326 | g | Code | wildnis |  |  | Zwilling: gelaende-core.js:390 ks def 6 |
| e221 | wildnis.tafel | glatt(400, 1500, Rand-Abstand)·glatt(1500, 3500, Schollen-Alter); Δ −0,77 … +0,85 | 1 | :2327 | g | Code | wildnis |  |  | Zwilling: gelaende-core.js:393 tafel def 0,5 |
| e222 | wildnis.schichtDicke | def → Δ ≡ 0 | m | :2328 | g | Code | — (planet-core.js:2320) |  | OL | Zwilling: gelaende-core.js:397 · Δ immer 0: ändert nichts |
| e223 | wildnis.hartAnteil | def → Δ ≡ 0 | 1 | :2329 | g | Code | — (planet-core.js:2320) |  | OL | Zwilling: gelaende-core.js:398 · Δ immer 0: ändert nichts |
| e224 | klima.sommer / winter (Meeres-Niveau) | tS/tW + lapse·h; Δ −21,8 … +24,3 / −33,5 … +40,4 | °C | :2332 | f | aus planetKlimaR, auf Meeres-Niveau reduziert | klima |  |  | Zwilling: gelaende-core.js:1314–1315 TEMPERATUR 18 / −4 |
| e225 | klima.sommerPhase (Süd + 0,5) | 0,375 (+0,5 südlich); Δ 0 / ±0,5 | Jahr | :2333 | f | Halbkugel | phase |  |  | Zwilling: gelaende-core.js:1316 TEMPERATUR.sommerPhase 0,375 (kopiert aus dem Ort-Gesetz, nicht gerechnet) |
| e226 | klima.tagGipfel / jahrTage (Kopie) | 0,625 / 365 | – | :2333 | g | Kopie von ortGesetz().klimaHeute | — (planet-core.js:2333) |  | OL | Zwilling: gelaende-core.js:1318–1319 TEMPERATUR tagGipfel 0,625 / jahrTage 365 · kein Spiel-Leser: nicht in ORT_DELTA_KLIMA :2278 |
| e227 | klima.spendeMm → spendeVerh | Abfluss_Ort/Abfluss_Anker; Δ 0 … 51,5; Anker 0 → ∞ | 1 | :2298 | f | Turc-Pike-Abfluss als Verhältnis | spende |  |  | Zwilling: gelaende-core.js:1600 PEGEL.spende (328,5 mm/a) · ∞ bricht ortGesetz :5887 (Number.isFinite): erde-29 |
| e228 | wetter.regenQuote | P/(P + 900); Δ −0,39 … +0,57 | 1 | :2337 | g | Code „gesetzt" | wetter |  |  |  |
| e229 | wetter.sturmQuote | 0,03 + 0,25·e^(−v²), v = (\|φ\| − 1,7w)/(0,4w); Δ −0,25 … +0,04 | 1 | :2337 | g | Code „gesetzt" | wetter |  |  |  |
| e230 | Wuchs-Verhältnis (Anker 0 → 1) | o/a, bei a = 0 genau 1 | 1 | :2300 | g | Code | wuchs |  |  | 8/30 Erd-Anker haben wald = 0: dort trägt jeder Ort den Wald der Heimat (Feld tot). |
| e231 | leit 9×9 Stützen | 81 × 8000 m (huelleM, landC) | m | :2342 | g | Code | — (planet-core.js:2350) |  | OL | kein Spiel-Leser (voxel-worker.js:1184–1206 ohne leit) |
| e232 | o.rand (Art, Abstand, Rate) | Art · km · cm/a | – | :2353 | f | aus dem Punkt | — (planet-core.js:2353) |  | OL | kein Spiel-Leser |
| e233 | o.biom (Köppen, Hauptklasse, Whittaker) | Codes | – | :2338 | f | planetBiom | — (planet-core.js:2338) |  | OL | kein Spiel-Leser |
| e234 | Δ-Listen ORT_DELTA_KLIMA / ORT_DELTA_WETTER / ORT_WUCHS | 4 + 4 + 2 Felder | – | :2278 | g | Code | Kern: planet-core.js:2297–2300 | T |  |  |
| e235 | hoeheM im Auftrag | m | m | :1650 | f | aus dem Punkt | — (voxel-worker.js:1191) |  | OL | weitergereicht, kein Leser in stamm/ (grep hoeheM) |
| e236 | land / kuesteKm im Auftrag | hoeheM > 0 · kont | bool, km | :1650 | f | aus dem Punkt, fuss 16 | land · küste |  |  |  |

## §2 Gerechnet und gemessen

Node v22.23.5, 4 Kerne, ruhige Maschine. Zwei volle Läufe von `node /home/user/zensus-planet/vision/planet/zensus/e-mess.cjs` (9,6 s und 14,3 s); angegeben ist das Band über beide Läufe für erde-01 · 05 · 09 mit `PLANET_ERDE`. Die Zeiten sind je Aufruf mit hrtime gemessen, 10 000 Zufallsrichtungen je Saat (Punkt) bzw. 2 000 (Klima).

| Stufe | ms / µs | Bytes | Schwelle (ENTSCHEID) |
|---|---|---|---|
| `fib(4096)` Proben-Memo (global, je Prozess) | 0,017–0,03 ms kalt | 4096×3 Float64 | — |
| `planetPlan` (eifrig) | erster 8,2–10,3 ms, Median 8,3–11,6 ms | 52 672 · 53 340 · 53 824 B | ≤ 25 ms, ≤ 96 KB: GRÜN |
| Abschnitte 0…b0 (Rand-Gedächtnis rekursiv, 21–24 Abschnitte) | 6,9–19,9 ms zusammen | im Memo | ≤ 25 ms je Abschnitt: GRÜN |
| Nachbar-Liste der Scheibe (4096 Proben) | 3,8–4,5 ms (JIT-kalt 22,6–26,6) | — | — |
| `planetKlimaGlobal` | 0,07–0,12 ms (JIT-kalt 1,31–1,44) | — | ≤ 1 ms: GRÜN warm, kalt darüber |
| `planetMeer(0)`: 1 Spiegel-Fach mit 4096 Proben + 5 Bezug-Fächer (sigmaRef) mit je 1024 Proben und eigener Scheibe | 70,7–144,7 ms | — | ≤ 40 ms je Fach: nicht je Fach getrennt messbar (6 Fächer zusammen) |
| `planetScheibe(plan, 0)` am Stück kalt | 79,6–96,5 ms; warm 0,003–0,010 ms | 21,6–24,7 KB, nach erstem Punkt 39–45 KB | warm ≤ 5 ms, ≤ 64 KB: GRÜN |
| erster Punkt baut die Hotspot-Ketten (`kettenBauen`) | 1,9–7,3 ms | +17–21 KB | — |
| `planetScheibe(−137,3)` / `(−3000)` kalt, Plan warm | 110–240 ms / 56–74 ms | — | Linse zeit.sprung: bestes 94, Median 129 ms (≤ 120) |
| `planetPunktR` fuss 40 | Median 6,0–7,9 µs, p95 9,6–19,1 µs | — | ≤ 8 µs / ≤ 20 µs: GRÜN |
| `planetPunktR` fuss 16 (Brücke) | Median 5,8–8,3 µs | — | — |
| `planetHuelle` | 4,7–5,3 µs | — | — |
| `planetKlimaR` Land (Punkt gegeben / rechnet Punkt) | 45,4–56,8 µs / 49,2–61,9 µs, p95 70–96 | — | ≤ 25 µs: **ROT** (2×) |
| `planetKlimaR` Meer (Punkt gegeben / rechnet Punkt) | 3,0–3,7 µs / 7,4–8,6 µs | — | ≤ 4 µs: GRÜN nur mit gegebenem Punkt |
| `planetBiom` | 0,12–0,37 µs | — | — |
| `planetAnker` kalt / Memo | 5,9–9,7 ms / 0,04–0,06 ms | — | ≤ 10 ms: GRÜN (Linse Median 9,6, max 19,7) |
| `planetOrt` erster (mit ortAnkerRoh) / warm / bei −100 Ma | 1,3–3,2 ms / 0,64–1,11 ms / 0,48–1,52 ms | — | ≤ 1 ms: Linse 0,960 GRÜN; hier 3 von 6 Läufen über 1 ms |

**Vorläufe (global oder je Plan, mit Kosten):**

- `fib(N)` als Memo je Prozess (:254): 0,02–0,09 ms.
- Je Plan, eifrig, `planetPlan`: 8–15 ms. Darin `krustenSchwelle` (4096 Proben), 300 Hotspots und 28 Trapps.
- Je Scheibe: Abschnitte 0…b rekursiv (7–20 ms), die Nachbar-Liste (4–27 ms), `planetKlimaGlobal` (0,07–1,4 ms) und `planetMeer` mit 6 Fächern (71–145 ms, das ist der größte Posten).
- Beim ersten Punkt der Scheibe `kettenBauen`: 2–7 ms.
- Je Plan der Anker: 6–10 ms (512 Proben + 27 Verfeinerungen, jede mit Punkt und Klima).
- Je Plan `ortAnkerRoh`: 1–3 ms (ein ortRoh am Anker, 82 Punkte).

**Radius (gleicher Samen, `PLANET_ERDE` mit ersetztem radiusKm, g 9,81 gehalten):**

| R km | planetPlan | Plan-Bytes | Schlüsselbilder nB | Scheibe(0) kalt | Punkt Median | Anker | Ort warm | Hadley-Rand |
|---|---|---|---|---|---|---|---|---|
| 3 186 | 9,8–11,1 ms | 74,8–77,0 KB | 45–52 | 91–110 ms | 6,5–10,8 µs | 3,6–4,3 ms | 0,57–0,72 ms | 59,3° (2 Zellen) |
| 6 371 | 8,7–15,4 ms | 51,4–52,6 KB | 28–32 | 76–83 ms | 5,9–6,4 µs | 3,3–4,9 ms | 0,67–1,01 ms | 29,6° (3 Zellen) |
| 12 742 | 7,8–9,3 ms | 35,7–37,3 KB | 16–17 | 48–70 ms | 3,8–5,4 µs | 2,1–3,1 ms | 0,51–0,68 ms | 14,8° (6 Zellen) |

Die Kosten wachsen nicht mit R. Der Plan schrumpft mit R, weil die Dauer eines Abschnitts Winkel·R/Rate ist und ein großer Planet so weniger Schlüsselbilder braucht. Die Spanne des Punkts (max/min je Saat 1,97 · 1,32 · 1,71, Median 1,71) liegt über der Schwelle ≤ 1,35 aus ENTSCHEID :256; die Schwelle ist an R 1 737 statt 3 186 gesetzt, und hier wurde einmal je R gemessen. Nichts bricht. Hadley-Rand und Zellen folgen Held & Hou (φH ∝ 1/a).

**Körper — was der Samen wählt, was fest ist** (e-mess.cjs §A):

- Fest unter `PLANET_ERDE` (:263–264, zehn Werte): radiusKm 6371, g 9,81, wasserKm 2,62, krustenAnteil 0,41, neigungRad 0,4091, tagStunden 24, jahrTage 365, drehsinn 1, sternFluss 1, alterMa 4570. Dazu kommt regime platten als Vorgabe ohne Samen (:326).
- Vom Samen gewählt, auch für die „Erde":

| Saat | freibordKm | bodenAlterMaxMa | shelfKm | nS | nO | nB | Nähte | Q |
|---|---|---|---|---|---|---|---|---|
| erde-01 | 0,324 | 195,7 | 0,236 | 21 | 6 | 32 | 120 | 0,1177 |
| erde-05 | 0,417 | 182,5 | 0,236 | 24 | 6 | 28 | 122 | 0,0882 |
| erde-09 | 0,381 | 186,7 | 0,161 | 21 | 6 | 32 | 102 | 0,1314 |

Alle drei Saaten haben nH 300 und nE 28. Ohne Schlüssel (`planetPlan(s)`) wählt der Samen alle 13 Körper-Werte, zum Beispiel erde-09 mit R 2 545 km, g 4,0 und drehsinn −1.

**Brücke — Δ über 150 Land-Orte je Saat und Zeit** (e-mess.cjs §D):

- `meer.waterLevelM` hat genau **einen Wert je Zeit**: 0 bei t 0, und bei −100 Ma +5,51 · +23,18 · −18,32 m. Das ist der eustatische Spiegel × s_v 0,0587, nie ein Ort.
- kontinentLambda, schichtDicke und hartAnteil sind 0 an jedem Ort.
- `wuchs.wald` ist bei erde-09 1,000 an jedem Ort, weil der Anker den Wald 0 hat.
- `wuchs.decke` reicht bis 1,389 und `wuchs.wald` bis 1,373; gelaende-core.js:5743/5745 klemmt beides auf 1.
- `wildnis.ks` reicht bis −1,4 bei einem Anker mit konvergentem Rand (erde-09).
- `spendeVerh` reicht bis 51,5.

**Anker** (e-mess.cjs §G/§H, 30 Erd-Saaten + Heim-Saat):

- Anker mit wald = 0: **8/30**, mit decke = 0: 0, mit Spende 0: **1/30** (erde-29).
- Anker bei fuss 16 im Meer: **1/30**.
- Anker in Köppen ET: **3/30** (erde-17 1 834 m · erde-23 1 291 m · erde-26 1 530 m). Der Anker sucht 18/−4 °C auf Meeres-Niveau, liest das Biom aber auf der wahren Höhe.
- erde-29 als Welt-Saat: 200 Land-Ziele, 135 mit `spendeVerh = ∞`, und `ortGesetz` lehnt alle 135 ab („Δ klima.spendeVerh fehlt", gelaende-core.js:5887).
- Heim-Saat `anazh-realm-seed`: Anker 43,43° N 12,08° O, Küste 289 km, 1 197 m (fuss 16), Dfc, Spende 933 mm, wald 1.

**Linse** `cd /home/user/AnazhRealm && node scripts/diag-planet.cjs --richter bau3; echo EXIT=$?`:

- Der erste Lauf mit `timeout 600` wurde nach 600 s abgebrochen (EXIT=124). Grund: auf 4 Kernen läuft nur ein Arbeiter, `max(1, cpus − 4)` in scripts/diag-planet.cjs:1387.
- Der zweite Lauf mit `timeout 3000` brauchte 757 s (749 s Saaten + 8 s Haupt) und endete mit **EXIT=1** durch die URTEILS-WACHE: 5 Zeilen ROT bei Exit 0 werden zu Exit 1.

```
── Richter bau3 · 30 Saaten · 749 s (Saaten) + 8 s (Haupt)
ROT    drift.cm_a             p05 0.57 · Median 2.77 · p95 7.62 cm/a (4980 Kontinent × Zeit)   [Schwelle p05 ≥ 1, p95 ≤ 15, Median 2–8]
ROT    zeit.stetig            Höhe: 105/240000 Material-Schritte > 1 km je 0,1 Ma (99.956 % ≤ 1 km), max 8.35 km, an Schlüsselbildern max 3.61 km; Küsten-Versatz 1 Ma (Hausdorff): 603/582167 Küsten-Pixel ohne Partner im ±470-km-Fenster (an Stücken ≥ 10⁴ km² 216 · darunter 387), max gepaart 663 km, p99 Median 78 km (60 Kartenpaare); Täter der Höhen-Sprünge: fremd·boden 42 · fremd·orogen 25 · orogen …
ROT    zeit.schritt           kleinster ÷ Median der Land-IoU je 5 Ma über −200 … +50 Ma: Median 0.920 (min 0.657), ≥ 0,90 in 21/30; IoU je Schritt Median 0.848, schlechtester 0.562   [Schwelle ≥ 0,90 in ≥ 27/30]
ROT    zeit.sprung            kalt (neuer Abschnitt + Meer-Fächer, Plan warm bei 0) bestes 94 ms, Median 129 ms; warm 3.27 ms; Punkt 0 · −200 · −3 000: 6.07 · 5.85 · 4.39 µs (-4 %, -28 %; -/-/-)   [Schwelle kalt ≤ 120 ms, warm ≤ 5 ms, −200/−3 000 ±20 %]
ROT    zeit.reise             Kruste bei 0 Ma ist Kruste bei −100 Ma: 2856/2856; hin und zurück ≤ 10⁻⁹ rad 2759/2856 (davon 97 mit anderer Scholle auf dem Rückweg: Überdeckung zweier Krusten; größte Sehne der übrigen 1.0e-15); Ozean-Boden, den es bei −100 Ma nicht gab: 3443/7680   [Schwelle Kruste 100 %; hin und zurück ≤ 10⁻⁹ rad]
GRÜN   ort.kosten             planetOrt Median 0.960 ms (5 Pläne × 40 Orte, warm) · planetAnker kalt Median 9.6 ms (max 19.7) · zweimal gerufen gleiche Bytes: ja   [Schwelle planetOrt ≤ 1 ms, planetAnker ≤ 10 ms, gleiche Bytes]
GRÜN   ort.leser              Leser des Kerns im Spiel 1 (voxel-worker.js); den Ort als Differenz (planetOrt) lesen 2 (gelaende-core.js, voxel-worker.js)   [Schwelle ≥ 1, beim Namen]
❌ URTEILS-WACHE: 5 ROTE Zeile(n) bei Exit 0 — die erste: ROT    drift.cm_a             p05 0.57 · Median 2.77 · p95 7.62 cm/a (4980 Kontinent × Zeit)   [Schwelle p05 ≥ 1, p95 ≤ 15, Median 2–8] (Exit wird 1; ein Vermerk heißt nie ROT/❌)
EXIT=1
```

Die übrigen 10 Zeilen sind GRÜN: zeit.rueckkehr, zeit.statistik, superkontinent, meer.zeit, gebirge.vorn.zeit, ort.anker (29/30), ort.bereich, ort.delta.null, ort.kosten und ort.leser.

## §3 Befunde

### 3.1 Zwillinge mit dem Spiel

1. **Sonne.** `welt-licht.js:711` `sonnenRichtung(winkel)` hat weder Breite noch Achsneigung. Die Meeus-Bahn war gebaut und fiel wieder (:702–710). Damit erreichen `neigungRad` und die Anker-Breite das Licht nie, und auch eine Reise nach 70° S ändert den Sonnenstand nicht.
2. **Schwere.** `stamm/daten.js:72` setzt `schwere −9,81` selbst. Die Reise-Welt erbt die Schwere der Heimat (stamm/netz-portal.js:701), nie `koerper.g`.
3. **Wind.** `phyto-core.js:4334` `windSaat` leitet den Wind aus der Welt-Saat ab. `windX` und `windZ` des Planeten rechnet planet-core.js:2336, aber voxel-worker.js:1202 reicht sie nicht weiter.
4. **Tag und Jahr.** Die Tageslänge ist eine Spieler-Einstellung (stamm/werkstatt-hud.js:1988). Das Jahr ist `TEMPERATUR.jahrTage 365` (gelaende-core.js:1319); R5 erzwingt die Gleichheit mit dem Körper, statt dass das Spiel den Körper liest. `sommerPhase 0,375` und `tagGipfel 0,625` sind Konstanten der Heimat, der Planet kopiert sie nur (:2333).
5. **Höhengradient.** Der Kern rechnet mit `lapse 6,5 K/km` (:1864), die Welt des Spiels mit `kuehlungKJeM 0,1108 K/m` (gelaende-core.js:5850, also 17× steiler). Die Stauchung s_v 0,0587 (:2307) übersetzt Meer und Leit-Stützen zwischen beiden.
6. **Literale.** fuss 16 steht in voxel-worker.js:1182 und planet-core.js:2309. Die Zeitgrenzen −4000…1000 stehen in stamm/feld-leben.js:1278 und planet-core.js:271.
7. **Im Kern selbst.** Die PET-Formel `400 + 45·T` steht zweimal (:2069 `petZ`, :2144 `pet`). Die Förder-Regel 8/0,6 km³/Ma steht zweimal (:1710, :2352; der Kommentar sagt „dieselbe Regel").

### 3.2 Ohne Leser im Spiel (Kern-Ausgang genannt)

- **Biom:** Köppen (30 Klassen, alle Schwellen) und Whittaker (11 Klassen). Sie erreichen nur `planetBiom`, `ortRoh.biom` (:2338) und die Atlas-Schichten (`planetKarte` :1819). Der Wuchs reist dagegen über die stetige `pflanzenDeckung` (:2143).
- **Vulkan:** Art, Abstand, Alter, `vulkanAktiv` und die Förderung 8/0,6 km³/Ma erreichen nur `ortRoh.vulkan` (:2351) und `planetVulkane` (:1676). Die Kegel-Höhen wirken dagegen über `hoeheM`.
- **Wetter:** `windX`/`windZ` (:2336), `schneeKm` (:2084), `lag` (:2088) und luv/lee/stromK/meerWest/feuchte (:2083).
- **Brücke:** `leit` mit 81 Stützen (:2342), `rand` (:2353), `stauchung` (:2354), Anker-sommerC/winterC/randKm/wertung (:2238) und `hoeheM` im Auftrag (voxel-worker.js:1191; in stamm/ liest es niemand).
- **Gelesen, aber Δ ≡ 0:** wildnis.kontinentLambda, schichtDicke und hartAnteil (:2323/:2328/:2329). ortErbgut liest sie, ändert damit aber nichts.
- **Toter Name:** `BEZUG_MA = 100` (:273) wird nie gelesen. sigmaRef rechnet stattdessen mit den Literalen 5 × 20 Ma (:1596–1597).
- **Nur Meeresboden:** Tiefsee-Hügel (:1411) und das Rücken-Profil (:1315) ändern weder `land` noch `kont`.
- **Die Heimat:** Jeder Planeten-Wert ist dort ohne Leser, denn `ortGesetz(null)` liest den Planeten nie. Die Konsum-Tiefe des Kerns im gespielten Pfad ohne „reise" ist **0**.

### 3.3 Kopf und ENTSCHEID gegen den Code

| Stelle | sagt | Code | Ort |
|---|---|---|---|
| ENTSCHEID §4 :207 | Rate 2–8 cm/a | Kontinent 4,5–8,5, Ozean 3,5–9,5 cm/a; Linse drift.cm_a ROT (p05 0,57) | :514, :580/:590 |
| ENTSCHEID §4 :214, Kopf :1853, Kommentar :1973 | Feuchte durch 6 Schritte luvwärts | 4 Hüllen-Schritte + 14 Integral-Knoten × 150 km | :1865, :1941 |
| ENTSCHEID §4 :213 | Meer: einmal sortiert, Volumen-Kurve | Halbierung 64× je Lösung, dreimal je Fach (s0, Eis, Bezug) | :1561–1570 |
| ENTSCHEID §4 :210 | Ketten-Faktor 0,45 + 0,55·Grat | 1 + 0,38·(grat − 1) | :1278 |
| ENTSCHEID §4 :57/:206 | Kontinent = 2–6 Schollen | größte Gruppe ≤ ⌊0,4·nS⌋ (8–16) | :277, :357 |
| ENTSCHEID §4 :210 | träge Tafel-Welle ±0,3 km | Becken-Feld BECKEN_C·Freibord (0,75–2,25 km) | :284, :1427 |
| ENTSCHEID K4 :77, Kopf :21 | H0·(1 − e^(−a/20))·e^(−a/120) | + 0,15·e^(−a/1500) (Wurzel) | :1158–1159 |
| ENTSCHEID §2 :136 | jahrTage 365,25 | 365 (R5) | :264 |
| ENTSCHEID §2 :109/:136 | koerper mit freibordKm, bodenAlterMaxMa; Erd-Schlüssel ohne beide | auch shelfKm fehlt; alle drei wählt der Samen | :317, :324, :325 |
| ENTSCHEID §3 :175–176 | planetKlimaGlobal → { …, eisKm } | G ohne eisKm (eisKm in planetMeer) | :1914–1918 |
| ENTSCHEID §4 :208 | ab nP > 40 ein Kandidaten-Index | kein Index; Bruch bei MAX_P 64 | :275, :812 |
| ENTSCHEID :286 | planetKlima Land ≤ 25 µs | 45–62 µs | §2 |
| Kommentar :2280 | Wuchs-Verhältnis „immer endlich — der Ort reist als JSON" | spendeVerh wird ∞, wenn die Anker-Spende 0 ist | :2298 |
| Kommentar :273 | Bezugs-Spiegel über BEZUG_MA = 100 Ma | 5 Stützen × 20 Ma als Literal, BEZUG_MA tot | :1596–1597 |

### 3.4 Gemessene Brüche der Brücke

1. **Anker-Band.** `planetAnker` sucht bei fuss 40 (:2214), `ortRoh` und der Faden lesen bei fuss 16 (:2309, voxel-worker.js:1182). Bei erde-29 liegt der Anker bei fuss 40 auf +74 m und bei fuss 16 auf −84 m. Dort ist Köppen −1, die Spende 0 und damit `spendeVerh = ∞`, und 135 von 200 Land-Zielen brechen in `ortGesetz` (gelaende-core.js:5887). Die Reise bricht beim Namen und nicht still, ist aber für diesen Samen zu 67 % unbegehbar.
2. **Totes Wald-Verhältnis.** Bei 8 von 30 Erd-Saaten hat der Anker wald = 0. :2300 setzt dann das Verhältnis auf 1, und jeder Ort des Planeten trägt den Wald der Heimat (erde-09: wald 1,000 an allen 150 Orten).
3. **Anker im Hochland.** 3 von 30 Anker liegen in Köppen ET auf 1,3–1,8 km. Die Heimat ist dort Tundra, und jedes Δ misst gegen ein Tundra-Klima, während das Spiel die Heimat als Wiese mit Wald zeigt. Die Heim-Saat selbst liegt in Dfc auf 1 197 m.
4. **Meer ohne Ort.** `waterLevelM` ist eine Funktion der Zeit allein (ein Wert je Zeit über alle Orte), bei t 0 also immer 0. Das Meer einer Reise-Welt ist heute stets das der Heimat.
5. **Δ jenseits der Heimat.** decke und wald erreichen das Verhältnis 1,39 bzw. 1,37, und gelaende-core.js:5743/5745 klemmt beides auf 1. Ein Ort, der mehr wächst als die Heimat, wächst deshalb nicht mehr als sie.

### 3.5 Linse

- `ort.leser` ist GRÜN mit „planetOrt lesen 2 (gelaende-core.js, voxel-worker.js)". Der Treffer in gelaende-core.js ist der Kommentar :5689 (`planetOrt().delta`), denn der Grep in scripts/diag-planet.cjs:643–645 zählt Existenz, nicht Konsum. Echter Leser ist allein voxel-worker.js:1180.
- Die Linse prüft nicht, ob die gelieferten Felder gelesen werden: `hoeheM`, `windX`/`windZ`, `biom`, `vulkan`, `leit` und `rand` sind gelieferte Felder ohne Leser. Ebenso fehlt eine Zeile zum Anker-Band fuss 40 ↔ 16.
- Mit einem einzigen Arbeiter auf 4 Kernen (scripts/diag-planet.cjs:1387) braucht der Richter 12,6 min. Die ≤ 3 min aus Gebot 10 hält er auf dieser Maschine nicht.
