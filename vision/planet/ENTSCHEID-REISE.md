# ENTSCHEID REISE — der erste Leser des Planeten im Spiel (15.11.2026, 05:00)

Blatt, kein Schnitt, keine GPU. Gelesen: `befund-reise.md`, Teil R von `ENTSCHEID-2.md`, „Heilung und Stand“ in `BERICHT-2.md`, die
Brücke im Kern (`planet-core.js` am Zweig `w28-planet-kern`, Kopf 932749bc, `planet-h2-1`, 177 904 B), `REGELN.md`, die Leitern der
Meisterkarte 2, der Skill `anazh-lehren` — und jede Leser-Zeile dieses Blatts am Spiel von **main 01a6714a** (V18.546.291).
Gemessen nur mit node 24 auf dem Laptop unter fremder Last; die Proben samt Ausgaben liegen in `vision/planet/spike-reise/`
(`mess-landung`, `mess-vier` und `mess-kueste` schreiben die Ort-Saat noch mit `,` und `#`; `mess-tafel` und `mess-saatreihe` in
der Schreibweise des Gesetzes mit `_` und `~`).

**Drei Sätze.**
- **Entschieden:** Ein Reise-Ort ist eine Welt des Ultiversums, geboren durch die EINE Tür, die es schon gibt (`_weltBetreten` →
  `_weltWechsel`, wie das Welt-Tor `_weltTorBetreten`), mit einer Ort-Saat und EINEM neuen Teil `ort` im Gesetz der Welt, der nur
  das Δ des Planeten trägt; „Heimat plus Differenz“ steht in EINER Tafel des Gelände-Kerns (`ortGesetz`), die jede Lage als
  Pflichtfeld trägt; der Weg des Spielers ist ein Satz der System-Tafel der Konsole, keine DSL-Op.
- **Gemessen:** Anker der Heimat-Saat 43,432° N · 12,076° O; Stufe A im Faden 0,38–0,45 s CPU; gelesen werden 17 von 23
  gelieferten Größen (74 %); der Meeresspiegel ist bei t = 0 an jedem Ort gleich (Δ ≡ 0) und bewegt sich nur mit der Zeit
  (+12,9 m bei −100 Ma, +21,8 m bei −200 Ma); ohne Regel landen 26 % der Küsten-Ziele ohne tragenden Boden im Umkreis 240 m, mit
  der Reihe der Ort-Saaten 928 von 928 auf Land; die stillen Rückfälle des Meeresspiegels sind 32 Stellen mit drei Werten.
- **Offen:** der Preis des Sprungs (`reise.tuer`, die Welt-Tür von heute ist ungemessen), die Sonne und der Sternpol ohne Breite,
  die Windrichtung, die Leit-Stützen und der Bewuchs nach Klima (der heiße Ort bleibt grün); jede Zahl hier ist node, kein Spiel.

---

## 0 Was die Quelle anders sagt als der Befund (nachgelesen an main 01a6714a)

| # | Aussage des Befunds | Die Quelle | Folge |
|---|---|---|---|
| 1 | Der Weg ist ein Tipp im Atlas bzw. eine DSL-Op | „System-Akte (Welt-Wechsel, Datei-IO …) laufen NIE durch dslRun — der manipulierbare Pfad (Nexus/LLM/Regeln) berührt das System-IO nie“ (`stamm/feld-leben.js` 1122–1125). Jeder Welt-Wechsel der Konsole ist eine Zeile der Tafel `chatSystemPatterns` (1154 ff.: „erschaffe welt“ 1319–1340, „wechsle zu“ 1343–1360) | Die Reise ist eine Zeile DIESER Tafel. Eine Op `reise` risse die Wand: KI, Regel und Mitspieler könnten den Spieler aus seiner Welt tragen |
| 2 | Ein Reise-Ort braucht `worldMeta.planet`, `worldMeta.ort`, eine Landung | Die Welt trägt ihr Gesetz schon an EINER Stelle: `worldMeta.gesetz` hinter der Wand `_weltGesetz` (`stamm/speicher-welten.js` 88–120: Schwere, Himmel, Wetter-Tafel, Erbgut). Das Welt-Tor gebiert eine Welt mit Gesetz und Heimtor und wechselt beim zweiten Schritt in dieselbe (`_weltTorBetreten`, `stamm/netz-portal.js` 604–643; `_heimTorSetzen` 648–669) | Die Reise ist ein Welt-Tor, dessen Gesetz der Planet rechnet. Kein neues Feld neben dem Gesetz |
| 3 | Ein Kern im Manifest kostet die Ankunft 0 Bytes | `cores.manifest.json` ist die Lade-Liste der Studio-Fäden: die Quelle holt JEDES `scripts` zum Studio-Start (`stamm/studio-bruecke.js` 325–338), Buch und jedes Werk laden jedes (803–839) | Die Zeile `planet` lädt 178 KB in jeden Studio-Faden vor dem ersten Weltbild. Die Kosten-Zeile richtet |
| 4 | `spaet` lädt erst, wenn gebraucht | Der Faden der Quelle holt jede Datei aus `spaet` synchron, BEVOR er die Adresse der Fäden des Gesetzes antwortet (`stamm/gelaende-chunks.js` 309–316) | +1 Abruf vor der Geburt des Voxel-Fadens (`quelle.spaet.planet`) |
| 5 | Sechs (ENTSCHEID-2: sieben) stille Rückfälle des Meeresspiegels | 32 Stellen, drei verschiedene Ersatz-Werte: Basis + 4 · Basis − 3 · 0 (Liste in Schnitt 2) | Die Klasse fällt in Schnitt 2 |
| 6 | Anker `anazh-realm-seed` 48,42° N · 160,50° (d660f478) | Am Kopf 932749bc: 43,432° N · 12,076° O, Küste etwa 280 km | D5 ist kein Rand-Fall: der Anker wandert mit jeder Kern-Welle |
| 7 | Stern-Achse `dirigent-takt.js` 2202, Sonne `welt-licht.js` 696–715 | 2402 und 708–718; `dirigent-takt.js` ist gesperrt | Sternpol und Sonne: NEIN in dieser Welle |
| 8 | `planetOrt().delta` trägt jede Größe als Differenz | `sommerPhase` kommt nur absolut (`planet-core.js` 2271, 2321): ein Süd-Anker läse 0,875 statt 0,375 | Ein Feld im Kern (Schnitt 1, K) |
| 9 | Der Meeresspiegel des Ziels ist −3 + Δmeer | `o.meer` hängt nur an der Zeit der Scheibe (2319): bei t = 0 ist Δ an JEDEM Ort 0 | Ohne die Zeit ist der Leser des Meeres unbewiesen: die Zeit fährt mit |
| 10 | `schnee` liest den Versatz der Welt | Die Waldgrenze liest `schnee(…, 0)`, das Band der Sommer-Mitte (`phyto-core.js` 3465 über `voxel-worker.js` 1289 und `stamm/vegetation-wiese.js` 2767) | Das BAND wandert mit dem Ort, nicht nur der Versatz |
| 11 | Am Ziel trägt eine Spirale die Landung | Jede frische Welt bekommt den Genesis-Ort; trägt im Umkreis 240 m nichts, bleibt er still an 0/0 (`voxel-worker.js` 1067–1075, „keiner: 0/0“) | Gemessen 26 % der Küsten-Ziele. Schnitt 3 setzt die Reihe der Ort-Saaten |
| 12 | Stufe A 0,50–0,62 s | 0,38–0,45 s (vier frische Prozesse: Laden 6–10, Plan 53–72, Scheibe kalt 295–338, Anker 18–24, erster Ort 6–10 ms) | Band der Annahme ≤ 0,45 s |
| 13 | „Was nicht mitreist“ ungelesen | Die Geburt mit Person trägt Seele, Werkzeuge, eigene Stoffe und Baupläne; Hotbar, Gefühle, Tagebuch, Wesen bleiben welt-eigen (`stamm/speicher-welten.js` 514–533) | So reist der Spieler |

---

## 1 DAS GESETZ der Reise

1. **Ein Ort ist eine Welt mit einem Gesetz-Teil mehr.** Der Satz gebiert durch die EINE Tür eine Welt mit der Ort-Saat
   `<Samen der Heimat>@<Breite>_<Länge>_<Zeit>[~k]` und dem Gesetz der Heimat plus dem Teil `ort` (`worldMeta.gesetz.ort` hinter
   `_weltGesetz`): Samen und Kern-Version des Planeten, Lage, Zeit und die skalaren Felder von `planetOrt().delta` — nie eine
   absolute Zahl des Planeten; die Heimat trägt `ort: null` und liest den Planeten gar nicht.
2. **„Heimat plus Differenz“ steht in EINER Tafel.** Der neue Export `ortGesetz(ort)` in `gelaende-core.js` ist ohne Argument das
   Gesetz der Heimat (dieselbe Tafel liest der Planet als sein Ort-Gesetz) und mit Δ dieselbe Tafel am Ziel; jede Lage trägt sie
   als Pflichtfeld `L.ort`. Die Summe steht dort für alles, dessen Heimat-Wert eine Konstante des Gelände-Kerns ist; für die zwei
   Größen, deren Heimat-Wert woanders wohnt (die Regler im Erbgut der Welt, die Front-Stufen in `phyto-core`), reicht die Tafel
   das Δ, und genau EIN Leser bildet die Summe an seiner Quelle (`erbgutNormal`, `wetterAt`).
3. **Am Anker ist jede Summe x + 0 und jedes Produkt x · 1.** Die Heimat bleibt byte-gleich durch Arithmetik, ohne Bedingung im
   Code; eine Lage ohne `ort` oder ohne endlichen Meeresspiegel bricht beim Namen.

**Je Größe: JA mit Leser oder NEIN mit Messname.** (Zeilen an main 01a6714a; „bildet“ = die EINE Stelle der Summe.)

| Größe des Planeten | Felder | Urteil | bildet | Leser im Spiel (Datei:Zeile) |
|---|---|---|---|---|
| Landform-Regler | land · hoehe · rauhLambda · trog · ks · tafel · kontinentLambda · schichtDicke · hartAnteil (9; die drei letzten liefert der Kern heute fest, Δ ≡ 0) | JA | `erbgutNormal` (`gelaende-core.js` 87): Wildnis-Term der Heimat + Δ, geklemmt auf die Zeile | `landformRegler` (497–502) → `netzNeu` (531–559), `grossform` (565–602); Wirt `_erbgut` (`stamm/gelaende-boden.js` 1300–1313), Faden über den Stand (`stamm/gelaende-chunks.js` 373) |
| Meeresspiegel | waterLevelM (1) | JA | `ortGesetz`: `meerUnterBasisM` − Δ | `L.waterLevel` (Lage `stamm/gelaende-boden.js` 749–751); EIN Schreiber `_buildWaterPlane` (`stamm/bild-himmel.js` 473–483); 77 Vorkommen in 13 Dateien des Stamms, Netz (`gelaende-core.js` 520), Hydrosphäre (5847–5852), Spiegel (7333, 7392) |
| Temperatur | sommer · winter · tagAmp · sommerPhase (4) | JA | `ortGesetz`: `TEMPERATUR` + Δ, Phase modulo 1; die Kühlung bleibt die der Heimat | `temperaturFeld` (1306–1320); Naht `_temperaturFeld` (`stamm/bild-himmel.js` 2787–2798); Eis (1386–1424), Tritt, Grillen, Esse, Lava |
| Schnee-Grenze | folgt aus der Temperatur | JA | `ortGesetz`: Band-Versatz = Linie(Sommer-Mitte, Ort) − Linie(Sommer-Mitte, Heimat) aus `schneeLinie` (1473–1486) | `schnee` (1277–1283): Boden-Farbe (`stamm/gelaende-boden.js` 2532, `voxel-worker.js` 3196), Waldgrenze (`phyto-core.js` 3465), Tritt (1531–1538), `_schneeTakt` (`stamm/bild-himmel.js` 2860–2893) |
| Abflussspende | spendeVerh (1) | JA | `ortGesetz`: Verhältnis; der Abfluss am Ort ist Verhältnis × (Spende + q), `PEGEL.spende` bleibt der Nenner der Heimat | `pegelHubVon` (1609–1613), `pegelAbfluss` (1615–1617), `pegelLauf` (1640–1651); Wirt `_pegelGilt` (`stamm/wasser-hydro.js` 117), `_pegelMarke` (262), `_pegelTakt` (313) |
| Wetter-Verteilung | regenQuote · sturmQuote (2) | JA | `wetterAt` (`phyto-core.js` 4163–4187): Stufe der Heimat (4123) + Versatz aus der Verteilung der Front | `_wetterAmOrt` (`stamm/bild-himmel.js` 2766–2773) → Wetter-Zug (`stamm/dirigent-takt.js` 1742–1743, ungeändert), Regen-Weg und Klima-Mittel (`stamm/wasser-hydro.js` 208–209, 244) |
| Windrichtung | windX · windZ (2) | NEIN | — | `reise.wind.richtung`: die Summe gehörte in `windSaat` (`phyto-core.js` 4132–4151), ihr Leser `_windDirAt` steht in der gesperrten `stamm/stoff-material.js` 214–218; der Ort würfelt seine Richtung aus der Ort-Saat |
| Leit-Stützen | huelleM · landC (2 Felder zu 81) | NEIN | — | `ort.leit.leser`: der Leser wäre `grossform`; sie tragen „Küste dort, wo der Atlas sie zeigt“ — das richtet erst mit dem Atlas (Stufe B, außer Scope) |
| Sonnen-Breite, Sternpol | breite (1) | NEIN | — | `reise.sonne.breite`, `reise.pol.hoehe`: `sonnenRichtung` (`welt-licht.js` 708–718) steht mittags im Zenit; die Bahn bewegt Belichtung und Kaskaden (gesperrt), die Stern-Achse `stamm/dirigent-takt.js` 2402 ist gesperrt |
| Bewuchs nach Klima | biom (1) | NEIN | — | `reise.biom`: kein Gesetz der Heimat liest Trockenheit oder Wärme für die Deckung (`forestOrt` liest Boden, Feuchte des Bodens und die Schneegrenze): der heiße Ort trägt den Wald der Heimat |

**KONSUM-TIEFE der Welle: 17 von 23 Feldern = 74 %** (5 der 6 Größen, die der Auftrag nennt). Wahr gelesen heißt: der Wert am
Ziel ändert das Bild oder eine Zahl des Spiels; ein Feld, das der Kern fest liefert, zählt gelesen und ändert nichts.

---

## 2 DIE SCHNITTE (feste Reihenfolge; jeder allein landbar)

### Schnitt 1 — Der Planet im Faden: die Welt kennt ihren Ort

**Baut.**
- **K, der einzige Kern-Schnitt der Welle (vor dem Manifest), `planet-h2-2`:** `ORT_DELTA_KLIMA` (`planet-core.js` 2271) trägt
  `sommerPhase` (Ort − Anker: 0 oder ±0,5); der Kopf (38–58) und die Zeile 2166 nennen keinen Verdrahtungs-Stand mehr („NICHT
  verdrahtet“). Die Relief-Bytes ändern sich nicht (`bytes.version`: neue VERSION, SHA der Karte bleibt cc2f8284).
- **`gelaende-core.js`: der Export `ortGesetz()`** (hier ohne Argument, additiv): `{ kuehlungKJeM, meerUnterBasisM, regler,
  klimaHeute }` aus `TEMPERATUR` (1298–1305), `SCHNEE` (1269–1276), `LANDFORM_REGLER` (379–402), `PEGEL` (1582) und der
  Boden-Tafel (5630) — die Form, die der Kern prüft (`pruefOrtGesetz`, `planet-core.js` 2168–2175); `spendeMm` mit dem Jahr der
  Tafel (365).
- **`cores.manifest.json`:** `{ "id": "planet", "scripts": ["planet-core.js"], "vertrag": "planet-core.js", "ns":
  "__planetCore", "funktion": true }` (§9 Gesetz-Kern wie `gelaende`; der Kern erklärt `STUDIO_VERTRAG`, `FUNKTION`, `VERSION`).
  Kein Skript-Stempel in `index.html`: der Planet lebt nur im Faden.
- **`stamm/gelaende-chunks.js` 3381:** `spaet` bekommt `planet: "planet-core.js"` — derselbe Weg wie `fachwerk`.
- **`voxel-worker.js`:** der Auftrag `planet-anker` neben den Ort-Aufträgen (297–345), lädt wie Zeile 342 spät: Plan (Körper
  `PLANET_ERDE` mit `jahrTage` aus `ortGesetz()`), Scheibe(0), Anker → Lage, Küste, VERSION.
- **Stamm:** ein Neben-Faden der Rolle „planet“ (`_nebenFaden`, `stamm/gelaende-chunks.js` 567–611), bestellt als Wartender des
  ersten Weltbilds (`_weltbildKommt`, `stamm/koerper-bewegung.js` 2282; Muster `stamm/gelaende-boden.js` 244–251) — nie davor.
- **Der Leser:** die Zeile `reise` (ohne Ziel) in `chatSystemPatterns` sagt den Ort der Welt: „43,43° N · 12,08° O · Küste
  280 km“.

**Stirbt.** `ortGesetzAusGelaende` im Richter (`scripts/diag-planet.cjs` 388–393) samt seiner zweiten Jahreslänge 365,25 (392) —
der Richter liest den Export; die zwei Sätze „NICHT verdrahtet“ im Kern; `ort.leser` 0.

**Leser-Liste.** `_quelleFaden` (`stamm/gelaende-chunks.js` 309–316) · `_fadenQuelle` (269–279) · `voxel-worker.js` Kopf 39–42 ·
`_nebenFaden` · `_weltbildKommt` · `chatSystemPatterns` (`stamm/feld-leben.js` 1154 ff.) · ungefragt: die Lade-Liste der
Studio-Fäden (`stamm/studio-bruecke.js` 325–338, 833–839), `diag-studio-vertrag.cjs` (204, 256–257), `diag-atlas.cjs` (287),
`diag-fluss.cjs` (46).

**Annahme als Zahl.**
1. Heimat byte-gleich: Golden-Sätze gleich · gate:worker-dichte (`--studio`, `--kern`) maxDiff 0 · Bildpaar Mittag main ↔ Kopf an
   Genesis-Ort und Mess-Wiese bei ruhendem Loop: 0 Pixel Differenz.
2. Kern: `diag-planet --bytes` GRÜN, `--selbsttest` ≥ 43/43 (neu: ein gepflanzter Süd-Anker hat am Anker Phase-Δ 0),
   `ort.delta.null` über das neue Feld 30/30, `npm run check` am Zweig GRÜN (dort bis heute nie gelaufen).
3. Faden: Plan + Scheibe(0) + Anker ≤ 0,45 s CPU; der Anker im Faden ist der Anker in node (43,432° N · 12,076° O), Bytes gleich.
4. **Kosten-Zeile B:** t(Weltbild) kalt, A B B A im Wechsel, je Seite ≥ 3 Boots, relativ: Median(nachher) − Median(vorher) ≤
   Spannweite(vorher); zwischen Navigation und Weltbild 0 Aufträge an den Planet-Faden; kein Bild im Haupt-Faden über 100 ms durch
   den Schnitt. Reißt sie, ist die Ursache benannt (§0 Zeile 3 und 4), und die Lade-Liste der Studio-Fäden liest nur noch Kerne,
   die ein Rezept trägt oder liest — der Planet verlässt das Manifest nie.
5. `ort.leser` 0 → 1, beim Namen.

**Bild.** Das Bildpaar der Heimat (Differenz 0) und ein Schirm-Bild der Konsole mit der Ort-Zeile.

### Schnitt 2 — Das Ort-Gesetz: Heimat plus Differenz, byte-gleich (ohne Planeten beweisbar)

**Baut.**
- **`ortGesetz(ort)` mit Δ** und das Pflichtfeld `L.ort` jeder Lage: die Lage ohne Wirt (`gelaende-core.js` 2688–2701),
  `lageAbbild` / `lageAus` (5664–5682), `planAbbild` (5684–5693), die Lage des Wirts (`_gelaende`, `stamm/gelaende-boden.js` 734–779), der Stand
  des Fadens (`stamm/gelaende-chunks.js` 354–412 → `voxel-worker.js` 1426 ff.). Der Teil `ort` geht durch die Wand `_weltGesetz`
  (`stamm/speicher-welten.js` 88–120): null ist die Heimat, alles andere prüft `ortGesetz` und wirft beim Namen.
- **Meer:** `L.waterLevel` ist Pflicht und endlich; sein EINER Schreiber im Stamm liest die Tafel.
- **Temperatur und Schnee:** `temperaturFeld` liest `L.ort`; die Kühlung je Meter wird die benannte Konstante der Tafel (heute
  in 1316 aus dem Sommer gerechnet — am Ziel wanderte die Null-Grad-Linie sonst nie); `schnee` liest den Band-Versatz der Tafel,
  `schneeVersatz` (1487–1490) bleibt der Weg seit der Sommer-Mitte DES ORTS.
- **Spende:** die drei Pegel-Leser rechnen mit dem Verhältnis der Tafel.
- **Wetter:** `wetterAt` nimmt die zwei Δ-Anteile; Stufe am Ort = Stufe der Heimat + (Quantil(1 − Anteil − Δ) − Quantil(1 −
  Anteil)) aus der Verteilung der Front, am Anker +0.
- **Landform:** `erbgutNormal` nimmt das Δ der Regler; `_erbgut` reicht es.
- **Platte des Bodens:** was der WELT gehört, zieht aus dem Stempel in den Schlüssel — Erbgut-Hash, Genese-Version, Hash des
  Ort-Teils (`stamm/gelaende-chunks.js` 793–794 → 801–806); der Stempel trägt nur, was der SEITE gehört (Version, Form).

**Stirbt.**
- Die Klasse „stiller Rückfall des Meeresspiegels“, 28 von 32 Stellen: `gelaende-core.js` 520 und 6826 (Basis + 4) · 1279 · 1309 ·
  1377 · 1474 · 1519 · 1745 · 5850 (Basis − 3) · 7333 · 7392 (0); `voxel-worker.js` 1592 · 2074 · 3303 · 3623 (0) und der bedingte
  Setzer 1426; `stamm/bild-himmel.js` 174 · 1476 · 1483 · 2403 · 2922, `stamm/bild-sicht.js` 284, `stamm/bild-kosten.js` 3629,
  `stamm/gelaende-chunks.js` 359 · 644, `stamm/gelaende-boden.js` 417, `stamm/wasser-zellen.js` 12 · 206 · 963. Die vier in
  `stamm/gelaende-fern.js` (99 · 1516 · 1965 · 2062) stehen in einer gesperrten Datei: ihr Ersatz-Zweig ist nach dem Schnitt tot
  und fällt, sobald die Datei frei ist.
- Der Erbgut-Hash im Stempel der Platte samt dem Leeren des GANZEN Speichers bei fremdem Erbgut (`voxel-worker.js` 779–783).
- Die aus dem Sommer gerechnete Kühlung (1316).

**Annahme als Zahl.**
1. Heimat byte-gleich: Golden gleich · gate:worker-dichte maxDiff 0 (Höhe, Dichte, Spiegel) · Temperatur an 1 000 Höhen × 24
   Uhrzeiten × 12 Saison-Punkten Bit für Bit · `schneeVersatz` über 8 760 Stunden gleich · `wetterAt` über 300 Saaten × 400 Orte
   dieselbe Zeilen-Folge · Pegel-Tafel an 365 Tagen gleich · die Bytes von 9 Chunks gleich · Bildpaar Mittag 0 Pixel.
2. Absenz: 0 Treffer des Rückfall-Musters außerhalb `stamm/gelaende-fern.js` (heute 32); im Selbsttest der Familie
   gate:worker-dichte bricht eine Lage ohne `ort` und eine ohne endliches Meer beim Namen.
3. Das Δ wirkt, ohne Planeten: aus der Werkbank durch die bestehende Tür (`_weltBetreten` mit einem Abbild, dessen `gesetz.ort`
   das Δ des kalten Orts aus §3 trägt): Band-Versatz −195,5 m, Weiß auf ≥ 95 % der Land-Pixel, 0 Bäume, Tagesmittel am Meer zur
   Sommer-Mitte −3,7 °C. Mit dem Δ des heißen Orts: Weiß 0 %, Pegel-Hub −1 × Bett-Tiefe (die Betten leer), Regen-Anteil über 2 000
   Wetter-Züge 8,5 % ± 3 Punkte nass (Heimat 38 %: Regen 25 % + Sturm 13 %, `phyto-core.js` 4110).
4. Platte: Heimat → Δ-Welt → Heimat, Treffer der Platte der Heimat ≥ 95 % (heute 0 %: der Stempel leert).
5. Kosten: die Kosten-Zeile B wie in Schnitt 1; `temperaturFeld` und `schnee` je Ruf ≤ 1,03 × (ABAB im selben Prozess, 7
   Durchgänge) — sie laufen je Vertex im Faden, `L.ort` ist dort ein Feld-Lesen, nie eine Rechnung.

**Bild.** Das Bildpaar der Heimat (Differenz 0) und das Paar „Heimat ↔ kaltes Δ“ mit den zwei Kameras aus §3.

### Schnitt 3 — Die Reise: der Satz

**Baut.**
- **Drei Zeilen in `chatSystemPatterns`:** `reise <Breite> <Länge> [<Zeit>]` (Grad mit zwei Stellen, Zeit in ganzen Ma von −4 000
  bis +1 000; die Lage zur Zeit) · `reise zeit <Ma>` (derselbe Boden zu anderer Zeit: `planetOrtDerZeit` vom Ort der Welt, in
  der Heimat vom Anker) · `reise heim` (`switchToWorld` auf die Welt des Heimtors, `stamm/speicher-welten.js` 574).
- **EIN Auftrag `planet-ort` im Planet-Faden** für Ort UND Zeit: Scheibe(t) → `planetOrt().delta` → Urteil Land oder Meer. Die
  Zeit ist der dritte Parameter derselben Funktion; `planetOrtDerZeit` ist EIN Ruf davor im selben Auftrag, kein eigener Pfad.
- **Die Geburt wie das Welt-Tor** (`stamm/netz-portal.js` 620–642): Welt-Id als Funktion von (Samen, Kern-VERSION, Lage, Zeit) —
  wie die Fusion ihre Id aus den Eltern rechnet —, `_buildEmptyWorldSnapshot(meta, true)`, Gesetz der Heimat + Teil `ort`,
  `heimTor` (628), dann `_weltBetreten`. Liegt die Welt schon, wechselt der Satz in sie (608–618).
- **Die Reihe der Ort-Saaten:** der Planet sagt am Zielpunkt Land, also ist die Ort-Saat die erste der Reihe `~k`, an deren
  Ursprung das EINE Höhen-Gesetz Land rechnet (`hoehe(L, 0, 0)` über dem Meer der Lage). Sagt der Planet Meer, antwortet der
  Satz „dort liegt Meer, … km vor der Küste“ und gebiert nichts.
- **Die Landung wird laut:** `genesisPlan` antwortet `traegt` (`voxel-worker.js` 1067–1081); trägt am Ziel einer Reise nichts,
  bricht die Ankunft beim Namen (`_genesisPlanAn`, `stamm/gelaende-boden.js` 471 ff.) und die Tür führt heim.
- **An der Lage des Ankers gibt es nur die Heimat:** der Satz mit der Lage des Ankers (auf zwei Stellen gleich, t = 0) führt heim.

**Stirbt.** Konsum 0 % (`ort.leser`); der stille Ort 0/0 ohne tragenden Boden für jede Reise-Welt; „`reise.tuer` ungemessen“.

**Leser-Liste.** Satz → `chatSystemPatterns` → Planet-Faden (`planet-ort`) → Geburt → `_weltBetreten` (`stamm/speicher-laden.js`
1152–1186) → `_weltAblegen` (1192–1219) → `_weltWechsel` (1232–1263) → `_weltAmOrt` (1268–1288) → `_weltGesetz` (Teil `ort`) →
die Leser aus §1 → `genesisPlan` → das Heimtor (`_heimTorSetzen`).

**Annahme:** §3.

---

## 3 DIE ANNAHME DER WELLE — EIN Samen, die Heimat und vier Orte

Samen `anazh-realm-seed`. Jede Welt lebt ab dem Boot in 1920 × 1080; je Bild `r._schirm()` und `r._laubRand()` im Bericht. Zwei
Kameras relativ zur Ankunft (`_genesisMitte()`), dieselben an jedem Ort: **(a)** Augenhöhe am Ankunftspunkt, Blick in die
Ankunfts-Richtung; **(b)** 80 m darüber, 25° abwärts, dieselbe Richtung. Uhr Mittag, Sommer-Mitte, klar (`__buehne`).

Die Werte sind „Gesetz der Heimat + Δ“, gerechnet in node am Kern 932749bc mit dem Gesetz von main 01a6714a
(`spike-reise/mess-tafel.txt`); der Macher liest sie am Kern `planet-h2-2` neu und nennt jede Abweichung.

| | Heimat | heiß-trocken | kalt | nass-warme Küste | die Heimat vor 100 Ma |
|---|---|---|---|---|---|
| Satz | `reise heim` | `reise 17.09 61.93` | `reise 79.07 0.56` | `reise 5 -28` | `reise zeit -100` (aus der Heimat) |
| Lage | 43,43° N · 12,08° O | 17,09° N · 61,93° O | 79,07° N · 0,56° O | 5,00° N · 28,00° W | 38,40° N · 2,18° W |
| Küste des Planeten | 280 km | 965 km | 61 km | 46 km | 155 km |
| Sommer / Winter am Meer | 18,0 / −4,0 °C | 38,5 / 17,0 °C | −3,7 / −23,8 °C | 29,1 / 21,9 °C | 20,1 / 1,0 °C |
| Tagesgang ± | 5,00 K | 7,64 K | 4,97 K | 4,95 K | 4,97 K |
| Schnee-Linie über dem Meer, Sommer- / Winter-Mitte | 140,6 / −20,2 m | 325,7 / 169,3 m | −54,9 / −200 m | 248,7 / 202,5 m | 160,9 / 22,8 m |
| Meeresspiegel (Δ) | −3,00 m (0) | −3,00 m (0) | −3,00 m (0) | −3,00 m (0) | **+9,88 m (+12,88)** |
| Spende (Verhältnis) | 329 mm (1) | 0 mm (0) | 0 mm (0) | 369 mm (1,122) | 285 mm (0,866) |
| Pegel-Hub im Mittel × Bett-Tiefe | 0 | −1 | −1 | +0,07 | −0,08 |
| Nass-Anteil der Zeit (Regen oder Sturm) / davon Sturm | 38 / 13 % | 8,5 / 0 % | 0 / 0 % | 53,5 / 0 % | 37,1 / 4,7 % |
| Regler land · hoehe · rauhLambda · trog · ks · tafel | 0,35 · 1 · 3 200 · 0,7 · 6 · 0,5 | 0,544 · 0,899 · 2 650 · 0,355 · 6 · 0,195 | −0,133 · 0,91 · 2 650 · 1 · 6 · 0 | −0,157 · 0,992 · 2 513 · 0,355 · 6 · 0,136 | 0,098 · 1,067 · 3 837 · 0,46 · 6 · 0,32 |
| Ort-Saat (k = 0 trägt) | `anazh-realm-seed` | `…@17.09_61.93_0` | `…@79.07_0.56_0` | `…@5.00_-28.00_0` | `…@38.40_-2.18_-100` |
| Was die Welt zeigt | main, Bit für Bit | Hochland ohne Meer, kein Schnee, Betten leer, fast nie Regen; der Bewuchs bleibt der der Heimat (`reise.biom`) | Weiß bis ans Wasser auch im Sommer, kein Baum, Küste mit Trog-Tälern | viel Meer, kein Schnee, Regen in mehr als der halben Zeit, die Betten voller | das Meer steht 12,9 m höher: Buchten in den Tälern; wärmer, trockener |

**Was richtet (alles im echten Spiel, beide Kameras je Ort):**
1. **Die Heimat:** Bildpaar main ↔ Kopf 0 Pixel Differenz; Golden gleich.
2. **Je Ort die Tafel** „Größe → Leser Datei:Zeile → was die Welt zeigt“ mit den im Spiel GELESENEN Werten: Temperatur am Meer
   (`_temperaturAt`) auf ±0,1 K der Tafel · Schnee-Linie (`schneeLinie` über die Naht) auf ±2 m · Meeresspiegel (`state.waterLevel`)
   exakt · Pegel-Hub · Regen-Anteil über 2 000 Wetter-Züge auf ±3 Punkte · die sechs Regler exakt (`_erbgut().terme[0]`).
3. **Im Bild:** kalt — Weiß ≥ 95 % der Land-Pixel in (b), Bäume 0; heiß — Weiß 0 %, die Fluss-Betten in Sicht führen kein Wasser
   (Spiegel an der Sohle); Küste — Meer-Anteil der Fläche im Umkreis 2 km um die Ankunft ≥ 20 % (gezählt aus der Höhe gegen den
   Spiegel, die Heimat daneben), und (b) zeigt Meer — zeigt (b) keines, steht das Bild der Gegen-Richtung dabei; vor 100 Ma — der
   Spiegel steht 12,88 m über dem der Heimat (`state.waterLevel`), im Bild als Wasser in den Tälern.
4. **KONSUM-TIEFE 17 / 23 = 74 %**, als Tafel mit den sechs ungelesenen Feldern beim Namen.
5. **Heim:** vor der ersten Reise setzt der Spieler EIN Werk am Ankunftspunkt der Heimat; nach Heimat → Ort → `reise heim`: Werk-
   Pixel in (a) ≥ 95 % des Bilds davor, Zahl der Werke und der Voxel-Edits gleich, Treffer der Platte der Heimat ≥ 95 %; am Ort
   steht das Heimtor, und der Gang durch es führt in dieselbe Welt wie der Satz.
6. **Derselbe Satz zweimal:** in zwei frischen Profilen SHA gleich über `worldMeta.seed`, das Gesetz als JSON, die Höhe an 1 024
   Punkten und das Temperatur-Feld; im selben Profil führt der zweite Satz in dieselbe Welt (der Welt-Index wächst um genau 1).
7. **Der Preis des Sprungs:** A = „erschaffe welt p mit person“ (die Tür von heute, `stamm/feld-leben.js` 1319–1340), B = der
   Reise-Satz an ein nie besuchtes Ziel, beide vom Satz bis `_weltbildDa`; A B B A in derselben Sitzung, je Seite ≥ 3:
   **Median(B) ≤ Median(A) + 0,7 s**. Die absoluten Sekunden beider Geräte stehen als Lesewert `reise.tuer`, die Rückkehr heim als
   dritte Zeile. Der Anteil der Reise daran ist gerechnet: Ort 1–10 ms, eine neue Zeit 40–254 ms kalt, die Reihe der Saaten 3 ms.
8. **Meer statt Land:** `reise 5 -28 -100` (der Planet sagt dort −3 588 m) antwortet beim Namen und gebiert keine Welt.

---

## 4 DIE GEFAHREN beim Namen

1. **Der Zwilling des Ort-Gesetzes.** Eine absolute Zahl des Planeten in einem Leser (`planetOrt().klima`, `.wildnis`), ein
   nachgerechnetes Δ im Aufrufer, ein zweiter Bau des Ort-Gesetzes (Richter und Faden), eine Kühlung aus dem Sommer des Ziels.
   Gegenwehr: der Faden reicht NUR `delta` an den Wirt; Absenz-Grep über Stamm und Faden; der Export `ortGesetz` ist der einzige
   Bau; K liefert die Phase als Δ.
2. **Schlüssel der Platten und des Speichers.** Die Ort-Saat trägt Lage, Zeit und `~k` — aus ihr folgen Rausch-Strom, Chunk-
   Schlüssel, Genesis-Schlüssel (`stamm/gelaende-boden.js` 487), Fronten-Phase, Fauna und Feld von selbst ortseigen. Der Samen der
   Heimat trägt den Plan des Planeten und steht im Teil `ort`. Drei Fallen: der Stempel der Platte leert heute bei jedem fremden
   Erbgut (Schnitt 2); der Deckel der Platte leert alles, auch die Heimat (`voxel-worker.js` 829–833); jede besuchte Welt ist ein
   Platz im Speicher — er wächst mit dem Weg (`reise.platz`, gegen die Preis-Treppe „der Speicher wächst nicht mit der Welt“).
   Der Sternhimmel liest die Saat der Welt: nach einem Reload in einer Reise-Welt steht ein anderer Himmel (`reise.sterne.samen`).
3. **Die Siedlungs-Gründung am Ziel.** Jede frische Welt bekommt Genesis-Ort und Start-Dorf (`_startDorfAmBuch`,
   `stamm/siedlung-ort.js` 2476) — auch die Eis-Küste. Der Siedlungs-Wirt und `fachwerk-core` sind gesperrt, also bleibt das so.
   Gemessen an 928 Land-Zielen (`spike-reise/mess-landung.json`, `mess-saatreihe.txt`): ohne Regel trägt der Boden im Umkreis
   240 m an 74 % der Küsten-Ziele (Küste < 100 km) und 98,8 % der Binnen-Ziele; mit der Reihe der Ort-Saaten an 928 von 928
   (Mittel k 0,8 an der Küste, größtes k 6). Die Probe kennt nur die Makro-Höhe; See, Fluss und Kaverne richtet erst das Spiel
   (`reise.landung`).
4. **Der Anker wandert mit der Kern-Version.** 48,42° N · 160,50° (d660f478) → 43,43° N · 12,08° O (932749bc) für dieselbe Saat:
   jedes Δ jedes Orts ändert sich mit. Darum trägt eine Reise-Welt ihr Δ selbst (sie braucht den Kern nach der Geburt nie wieder),
   dazu Samen, VERSION und SHA des Kerns; die Welt-Id trägt die VERSION, ein neuer Kern gebiert neue Orte, die alten bleiben über
   die Welt-Liste erreichbar; `bytes.version` ist ROT, wenn sich der SHA unter derselben VERSION bewegt. Die Heimat hängt nie am
   Anker: ihr Δ ist null, weil sie die Heimat ist, nicht weil der Kern es rechnet.
5. **Die Ankunft B.** Das Manifest lädt den Kern in jeden Studio-Faden; `spaet` holt ihn vor der Geburt der Fäden; der neue
   Neben-Faden holt beim Voxel-Faden Regionen, die er nie liest (`stamm/gelaende-chunks.js` 603–608), mitten im Nachlauf; ein
   neues Feld der Lage steht im Heiß-Pfad von `schnee` und `temperaturFeld`. Richter ist allein die Kosten-Zeile je Schnitt.
6. **Heimat byte-gleich gegen einen frühen Leser.** Fragt heute ein Leser die Höhe, BEVOR `_buildWaterPlane` den Spiegel setzt,
   rechnet das Netz mit Basis + 4 (`gelaende-core.js` 520). Nach Schnitt 2 gibt es dieses Fenster nicht mehr; hält ein Ergebnis
   von dort bis ins Bild, zeigt es der Byte-Beweis — dann ist der Fund ein Bruch von heute, kein Preis der Reise.
7. **Spende 0.** Wüste und Eis liefern das Verhältnis 0; die Umkehr `pegelAbfluss` (1615–1617) teilt. Der Schnitt rechnet den Hub
   aus dem Abfluss am Ort, nie den Abfluss aus dem Hub durch das Verhältnis.
8. **Die Zeit.** Die Lage zur Zeit liegt meist im Meer (das Ziel `5 -28` von −5 bis −100 Ma); der Satz `reise zeit` trägt darum
   den Boden mit. `zeit.reise` hin und zurück ist im Kern ROT (2 759 von 2 856): zwei Zeit-Sätze hintereinander treffen nicht
   immer denselben Boden; heim führt die Welt-Id, nicht die Umkehr.
9. **Mitspieler.** Ein älterer Build liest ein Gesetz ohne den Teil `ort` und zeichnet still das Klima der Heimat; die Stufe des
   Gesetzes im Netz (`stamm/netz-p2p.js` 3333–3408) ist für `ort` ungelesen (`reise.mitspieler`). Eine Reise-Welt wird solo geboren.

---

## 5 Außer Scope · gesperrte Stellen · Sprossen · ehrlich offen

**Außer Scope beim Namen.** Stufe B (der Atlas als Bild, „du bist hier“, Zoom) · die Leit-Stützen in `grossform` · die Sonnenbahn
aus Breite und Jahr · der Sternpol · die Windrichtung · der Bewuchs nach Klima · das Reisen am Stück (`same.entfaltung.reise`:
kein wandernder Nullpunkt im Stamm) · die Gesichts-Welle des Kerns (Kranz, Ketten-Schattierung, Flüsse, Flachmeere) · freie
Körper aus dem Samen (Tag, Jahr). Dieses Blatt setzt keinen Eintrag in `docs/PFLICHT-OFFEN.md`.

**Gesperrte Stellen, die diese Welle bräuchte und NICHT schneidet.** `stamm/dirigent-takt.js` 2402 (Stern-Achse) ·
`stamm/stoff-material.js` 214–218 (`_windDirAt`) · `stamm/gelaende-fern.js` 99 · 1516 · 1965 · 2062 (vier Rückfälle des Meeres) ·
der Siedlungs-Wirt und `fachwerk-core` (Gründung am Ziel) · die Schatten-Kaskaden (Sonnenbahn). Der Wetter-Zug in
`stamm/dirigent-takt.js` 1742–1743 ruft `_wetterAmOrt` unverändert und braucht keinen Schnitt.

**Sprossen (Z2, Z8: diese Welle bucht keine).** Sie macht richtbar: `planet.wetter.klimazonen` 3 (30 Orte über den Satz:
Jahres-Amplitude gegen Meeres-Abstand) und 5 (50 Orte: Klasse aus Spieldaten = Klasse aus Lage); `same.massstab.sprung` 4 und 5
(der Sprung an jeden Ort und in eine andere Zeit existiert ab ihr; ihr Preis ≤ 2 s und ≤ 3 s hält nicht, der Sprung kostet einen
Welt-Wechsel); `same.kopplung.zeitreise` 4 nur in der Mechanik (das Werk steht bei der Rückkehr; ≤ 5 s hängt an PFLICHT-OFFEN B).
`planet.wetter.klimazonen` 4 braucht die Sonnenbahn. `same.entfaltung.reise` bewegt sie nicht: ein Sprung ist kein Weg.

**Ehrlich offen (mit Messnamen).**
- `reise.tuer`: Sekunden der Welt-Tür von heute an beiden Geräten — ungemessen; an ihr hängt, was der Spieler fühlt.
- `reise.biom`: der heiße Ort trägt den Wald und die Wiese der Heimat; im Bild unterscheiden ihn Landform, leere Betten, Wetter
  und fehlender Schnee, nicht die Farbe des Landes.
- `reise.sonne.breite`, `reise.pol.hoehe`: an 79° N steht die Sonne mittags im Zenit.
- `reise.wind.richtung`, `ort.leit.leser`: geliefert, ungelesen.
- `reise.landung`: im Spiel ungemessen (node, nur Makro-Höhe: 928 von 928).
- `reise.platz`: Bytes je besuchtem Ort im Speicher und in der Platte — ungemessen; ein Ort ohne Tat sollte kein Platz bleiben.
- `reise.sterne.samen`, `reise.mitspieler`: ungelesen bis auf die genannten Zeilen.
- `quelle.spaet.planet`: der zusätzliche Abruf vor der Geburt der Fäden und die Auswertung in den Studio-Fäden — ungemessen.
- Süd-Halbkugel: alle vier Orte liegen im Norden; die Phase aus K ist nur im Kern-Richter bewiesen, im Spiel ungesehen.
- Der Preis ≤ 5 s ohne Ladebild (Preis-Treppe, Klasse Planet) hängt an PFLICHT-OFFEN B; diese Welle misst relativ zur Tür.
- Alle Zeiten und Werte dieses Blatts: node 24, EIN Laptop unter fremder Last, je ein bis vier Läufe. GTX, Radeon, Browser: 0.
