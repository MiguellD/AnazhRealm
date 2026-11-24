# pm-faecher-erleben — ZWISCHENSTAND (M4 an den Fronten erleben.* und same.*)

Zweig `pm-faecher-erleben`, geschnitten von `origin/punkte-maschine` eea0f137e. Danach mit `origin/punkte-maschine` a58c32f29 zusammengeführt (81592fc17); das brachte pm-front-stoff an `same.gedaechtnis.alter`, ohne Überschneidung. Geändert sind nur `meisterkarte-quelle/punkte/stationen/k2-erleben.js` und `k2-same.js`. Nicht angefasst: `faecher.js`, `punkte.cjs`, `zug/dienst/*`, die anderen `k2-*.js`, die Kopplungs-Leitern, `erleben.sinne.*`, `same.preis.*`, `same.gedaechtnis.*`, wegfindung#1 und spanne#1.

## Was geschnitten ist

Zwölf Fronten urteilen über den Adress-Fächer (`FAECHER`, Bauart unverändert). Je Front gibt es:
- eine Gesetz-Funktion, die als Text in die Seite reist (`H.seite.NAME`, nur `r, T, a, mit`);
- den Export, den das Spiel liest, und seinen Leser mit Datei:Zeile;
- eine Kontrolle oder Mutante: trennt das Prädikat nicht, wirft die Sprosse beim Namen statt zu urteilen;
- die schlechteste Adresse als Pose des Bilds.

`L.gemessen` steht nur, wo schon das Gesetz das Soll reißt (die Obergrenze dessen, was die Sprosse verlangt). Sonst nennt `L.leser` die fehlende Fähigkeit. Keine Station wird durch ihre Bauart grün. Die eine Ausnahme ist massstab.physik#2: sein Soll (die Endgeschwindigkeit) ist eine Zahl des Gesetzes allein, die Station urteilt sie in beiden Richtungen. Die „Sturzfolge passend zur Größe“ trägt dort kein Soll-Wort; die Station vor mir trug nur `endtempo_abw_pct`, das steht unter Offen.

Die BUEHNE-Spieler-Fronten stellen keine Spieler auf. Die Adresse eines Spielers ist Saat × Ort × Zeit × Rolle: der erste Wunsch eines Neulings, seine Ankunfts-Saat, seine Tat, eine freie Lage der Kamera.

Gefahren ist jede Station hier, ohne GPU (google/swiftshader). Dafür lief eine eigene Werkbank im Spiel-Baum origin/main 8544438fb, headless. Vor sie war ein Vermittler geschaltet: `/eval` ging durch, `/umstellen` und `/bild` antworteten ohne Pose und ohne Bild, denn die Seite zeichnet ohne Gerät nie (WebGPU fps 0, 0 Chunks). Der argv der Probe war byte-gleich, `{PORT} {AUS} {SEK}` wie im Läufer. Headless steht vor jedem Urteil „ROT keine echte GPU (R2)“. Die Urteile unten zeigt die Station, wenn man ihr den Adapter einer echten Karte nennt: das ist nur Mechanik, kein Urteil am Gerät.

**Jede Bildpflicht bleibt ungemessen bis zum Gerät.** Das gilt für jede Zeile unten.

## Je Front (Urteil headless · Zahl · was fehlt mit Datei:Zeile)

### BUEHNE Spieler

| Front | Urteil headless | gemessene Zahl | was fehlt (Datei:Zeile) |
|---|---|---|---|
| `erleben.bild.kamera#1` | UNGEMESSEN beim Namen: die Kontrolle am Leib zeigt 100 % Lücke, ohne GPU ist kein Chunk gezeichnet. Am Gerät urteilt `luecke_pct` (gemessen über 2 %, sonst Leser) | 24 Adressen (20 freie Lagen 30–4 000 m × 4 Richtungen + 4 Kontrollen), 7 248 Proben in 7 ms | Keine freie Kamera: `setCameraMode` stamm/dirigent-kern.js:1237 nimmt nur Ego/Third. Die Welt lädt nur um den Leib: `_tickVoxelChunkStreaming` stamm/gelaende-chunks.js:2803, `_pruneDistantVoxelChunks` stamm/gelaende-fern.js:5. Gesetz `_chunkGezeichnet` stamm/gelaende-fern.js:1468, Leser `_fernRingMaske` :1497 |
| `erleben.sinn.staunen#1` | UNGEMESSEN beim Namen: die Welt steht nicht nach 10 s (`_weltSteht`). Ohne diese Wache urteilte die leere, ungeladene Welt „ROT dinge 0“; die Wache steht darum vor dem Urteil. Am Gerät: gemessen, wo die Welt unter 10 Dinge oder 5 statische trägt, sonst Leser (Panel R11). Die letzte Akte (31ea3847) zählte dort 12 Dinge, 10 davon statisch | Adressen: die Ankunft (150 m), der nahe Ort (50 m), die Mutante (3 m; sie muss unter 10 fallen) | Ding × Ort × Zeit hat kein Verzeichnis. Ein Wesen wird relativ zum Spieler geboren (`_kreaturGeburtsOrt` stamm/kreatur-leben.js:1785), ist also nicht wiederfindbar. Das Nennen ist ein Panel (R11). Das Urteil wartet auf `_weltSteht` stamm/dirigent-takt.js:795 |
| `erleben.sinn.sog#1` | ROT Leser fehlt | 12 Saaten + Kontrolle in 44 ms: der Gruß nennt an 12 von 12 Saaten keine Taste und keinen Satz der Hilfe. Die Kontrolle (die Hilfe als erstes Wort) trägt | Kein Gesetz der ersten Tat: „begleiter.erstes“ stamm/daten.js:2833 (Pool stamm/dirigent-kern.js:458), Hilfe nur auf „hilfe“ (`_hilfeZeilen` stamm/feld-leben.js:1664, :1009). Keine Uhr der ersten Tat je Spieler (state.player stamm/dirigent-kern.js:687). Gesetz `genesisLayout` fachwerk-core.js:13075 |
| `erleben.schoepfen.gespraech#1` | **ROT gemessen** `anteil_pct` 0 (Soll ≥ 80), Umfang 36 ≥ 20 | 36 Neulinge (die Schöpfungs-Sätze des Korpus spec/abnahme/ki-korpus.json, de + en): 2 erschaffen ein Werk, 2 teilen einen Code, 0 genau ihr Werk. KI aus (`llm.fehler.aus`). 37 Adressen in 5 ms | Der Code trägt den Samen der Werkstatt (`_werkReise` → `_werkSame` stamm/netz-identitaet.js:666), das gesetzte Werk den Samen des Satzes (stamm/feld-dsl.js:2078, baseSeed + i). Teilen kennt nur den Bauplan der Werkstatt (stamm/werkstatt-vorschau.js:2413). Keine Uhr Satz → geteiltes Werk (stamm/feld-leben.js:932) |
| `same.entfaltung.akte#2` | ROT Leser fehlt | 1 000 Tat-Adressen in der Form von `_addVoxelEdit`: 1 000 kippen den Boden an ihrer Mitte, 987 bleiben im Stand aller Taten. Die Ankunft trägt 916 Taten im Chunk samt Rand (ohne: 0). Die Mutante (Graben in der Luft) wirkt nicht. 1 002 Adressen in 31 ms | Kein Kodierer EINER Tat aus der Seite: der Packer ist eine Closure im Stand-Generator (stamm/speicher-welten.js:1966), das Format lebt im Faden (speicher-faden.js:96 `editsAnhaengen`). Kein Leser der Bytes je Tat. Gesetz `mitEdits` gelaende-core.js:2596 und `editKarte` :7348 |

### same.physik

| Front | Urteil headless | gemessene Zahl | was fehlt (Datei:Zeile) |
|---|---|---|---|
| `same.physik.fluid#1` | **nicht geschnitten** | — | Die Tafel trägt S1 als `gelaende.K2#1 gleich` (vision/richter-tafel.json). Eine k2-Station auf S1 wäre eine KOLLISION (punkte.cjs `tafelFalte`). Die g-Station liegt außerhalb meiner zwei Dateien. „KEINE STATION“ heißt hier: keine Akte unter `karte2.same.physik.fluid#1` |
| `same.physik.feuer#2` | ROT Leser fehlt | 625 Zellen (25 × 25 um den Leib, 400 × 400 m) in 179 ms. 339 tragen ein Tempo (R 0,04–4,49 m/s). Die Wiese 10⁴ m² trägt 11 brennbare Zellen. Headless liegt keine Zelle unter gezeichnetem Wasser, also keine Probe des Halts; am Gerät urteilt `halt_pct` gemessen, sobald ein Bett über Wasser brennt | Das Brand-Feld rastert 16 m (LIFE_FIELD.cell stamm/feld-leben.js:3184); 2 000 Zellen auf 10⁴ m² verlangen 2,24 m. Die Front-Ankunft je Probe ist eine Closure in `_brandZuenden` stamm/feld-brand.js:493. Gesetz `_brandStoff` :297 + `_brandTempo` :395 gegen `_wasserBildAt` stamm/wasser-zellen.js:809 |
| `same.physik.stoffe#1` | **nicht geschnitten** | — | Tafel `fehlt` (R11 Panel, Blind-Jury). Eine Zeile „fehlt“ schreibt keine Akte (vision/richter-akte.cjs:325), also bleibt die Front „KEINE STATION“, bis ein Panel urteilt. Die Klasse kommt aus auge-klasse.cjs, das nicht meine Datei ist |
| `same.physik.tragen#2` (neu in BUEHNE Umfang sonst) | ROT Leser fehlt | Trägt die Stadt kein Werk von ≈ 10 Gliedern: 8 Pläne des Gesetzbuchs (bis 40 Glieder) × 226 genommene Glieder. Die Statik nennt 9 Stürze und 14 Glieder ohne Lastpfad. Die Kontrolle (jeder Plan ganz) steht. 234 Adressen in 210 ms | Kein Gesetz nennt, was ein Werk ohne Glied fallen lässt, ohne es zu setzen (`_tickWerkGesetz` stamm/bau-teile.js:2563). Gesetz `_workshopPhysicsVerdict` stamm/werkstatt-vorschau.js:659 (`_loadPath` stamm/bau-buch.js:2001), Leser `_werkGesetzSetzen` stamm/bau-teile.js:2502 |

### same.massstab

| Front | Urteil headless | gemessene Zahl | was fehlt (Datei:Zeile) |
|---|---|---|---|
| `same.massstab.physik#2` | **ROT gemessen** `endtempo_abw_pct` 45,5 (Soll ≤ 20), Umfang 3 ≥ 3 Größenordnungen | Eine 5-mm-Kiste aus `leib` fällt nach dem Löser mit 8,73 m/s (Soll ~6 m/s); 0,5 m leib 87,5 m/s; 5 m Stein 454 m/s. 12 Adressen (Kante 5 mm–5 m × leib · holz · stein) in 17 ms | c_w der Kiste ist fest (FREI.luft stamm/koerper-frei.js:1478), ohne Reynolds-Abhängigkeit. Die Sturzfolge hat kein Gesetz am Aufprall (stamm/koerper-bewegung.js:716). Gesetz `_freiLuftPacken` stamm/koerper-frei.js:1117 + `_freiZiehen` :1266, eigener Puffer; Leser `_freiSchritt` :477 |
| `same.massstab.nahe#1` | **nicht geschnitten** | — | Tafel `fehlt` (Korpus: Fotos der Bodenklasse aus 2 m), daher keine Akte |
| `same.massstab.sprung#1` | **nicht geschnitten** | — | Eine Zeit-Sprosse (ganz ≤ 30 s, p95 ≤ 33 ms). Die Station misst sie schon am Gerät (Sprung, Wanduhr, Strom). Kein Gesetz, das ein Fächer rufen könnte, ersetzt die Wanduhr. Die Akte fehlt: Lauf am Gerät offen |

### erleben.bild

| Front | Urteil headless | gemessene Zahl | was fehlt (Datei:Zeile) |
|---|---|---|---|
| `erleben.bild.ferne#1` | ROT Leser fehlt | 5 Wetter + Mutante in 1 ms, je die Sicht V = K/β: sunny 20 km, cloudy 5,5, foggy 3,16 (WMO: Nebel < 1 km), rainy 2,53, stormy 1,5. Die Extinktion je Kanal steht daneben. Die Mutante (ohne Dunst) sieht weiter | T(d) je Kanal rechnet nur der TSL-Knoten `faktor` stamm/bild-himmel.js:2543; es gibt keinen CPU-Export (Auge, Punkt, Wetter) → T. Gesetz `_luftBeta` :2473 + `_luftSpektrum` :2492, Leser `_dayNightApplyLuft` :2665. Ferne = Nähe an 12 Posen: am Gerät |
| `erleben.bild.flaeche#1` | **nicht geschnitten** | — | Tafel `fehlt` (Hälfte: Albedo im Bild), daher keine Akte. Adressen für die Welle: Erde `dirt` Y_lin 0,074 gegen 0,17; der Halbschatten-Deckel 2 × 0,25 m greift ab 54 m (stamm/bild-schatten.js:1348); eine CPU-Funktion `halbschattenM` fehlt |

### Der Rest

| Front | Urteil headless | gemessene Zahl | was fehlt (Datei:Zeile) |
|---|---|---|---|
| `erleben.spieler.hand#1` | ROT Leser fehlt; headless 21 Ziele ohne Fähigkeit (keine Chunks). Am Gerät urteilt `treffer_zellen` (gemessen über 1 Zelle) | 20 Ziele (−10° … −60° × 4) + der streifende Strahl (−4°) | Wirkung je Bild: die Latenz-Linse kennt kein Verb setzen (scripts/werkbank.cjs:1894). Kein Raycast gegen das Gelände-Mesh im Spiel; der Fächer misst das Ziel mit THREE an den gezeichneten Meshes. Gesetz `_fieldRaycast` stamm/gelaende-chunks.js:2339, Leser `tryMouseBreak` stamm/kampf.js:2371 |
| `erleben.schoepfen.satz#1` | **ROT gemessen** `gueltig_pct` 26,8 (Soll ≥ 95); 0 Brüche, 0 Hänger, Umfang 41 ≥ 40 | 41 Korpus-Sätze auf dem Weg des Spiels (Regel, dann Parser), KI aus, längster Ruf 1,16 ms. Kontrolle und Mutante trennen. 43 Adressen in 3 ms | Ohne KI trägt nur der Parser ein Programm (stamm/feld-sprache.js:497–568). Absicht am Ausgabebild: die Linse scripts/diag-v1-pfad.cjs:1009 `korpusSatzUrteil`. Satz → Bild ≤ 6 s: Wanduhr am Gerät |
| `erleben.klang.landschaft#2` | ROT Leser fehlt | 20 Wagen 4–320 m + Kante in 5 ms: 16 hörbar, −20 dB/Dekade (Punktquelle), an der Hörweite ein Sprung −31,99 dB → still; von 20 Wagen klingen nur die 4 nächsten | Die Lage am Ohr trägt kein Biom (`umweltMischung` klang-core.js:876, `_umweltLageEins` stamm/klang.js:414 nur am Spieler). `FAHRT_VERKEHR_K` stamm/klang.js:2366. Gesetz `fahrtAmOhr` klang-core.js:1892, Leser `_fahrtKlangTick` stamm/klang.js:1034 |
| `erleben.spieler.gemeinsam#1` | **nicht geschnitten** | — | Kein rufbarer Kodierer der Leib-Nachricht: sie steht inline in `p2pTick` stamm/netz-p2p.js:2672. Eine Latenz-Untergrenze aus `_p2pSnapInterpolate` :2320 hinge an einer Zeitleiste, die ich nachbauen müsste. Ein zweites Gerät fehlt |
| `erleben.schoepfen.teilen#2` | **nicht geschnitten** | — | Fremdes Gerät mit frischem Profil. `empfangeWerk` stamm/netz-identitaet.js:677 setzt beim Empfänger, das wäre eine Bühne |
| `erleben.schoepfen.schutz#2` | **nicht geschnitten** | — | Der Korpus trägt 7 Injektionen (spec/abnahme/ki-feind-korpus.json), verlangt sind ≥ 100. Der Weg zum Modell lebt in der Linse scripts/diag-v1-pfad.cjs:2218 |
| `erleben.sinn.legenden#1` | **nicht geschnitten** | — | 200 Zeilen des Tagebuchs entstehen nur aus Ereignissen der Welt (`journalAppend` stamm/dienst.js:385). Die Spur der Tat steht im Bildpaar |
| `erleben.sinn.takt#2` | **nicht geschnitten** | — | „Anspruch je Minute“ hat kein Gesetz der Zeit, das ein Fächer über 60 Minuten rufen könnte (Welt-Uhr stamm/dirigent-takt.js:21) |
| `erleben.klang.raum#2` | **nicht geschnitten** | — | Der Raum am Ohr (`_raumStrahlen` stamm/klang.js:638) trägt den Zustand des EINEN Ohrs (Kredit, Regung). `umweltRaumNachhall` klang-core.js:1254 ist rein, seine Lage misst aber nur der Wirt am Spieler (`_raumAmOhr` stamm/klang.js:734) |
| `erleben.sinn.entdeckung#1`, `erleben.klang.musik#1`, `same.entfaltung.vielfalt#1` | **nicht geschnitten** | — | Tafel `fehlt` (R11 Panel), daher keine Akte. musik#1 für die Welle: Techno-Zyklus 15 s gegen die Sperre 600 s (klang-core.js:377 `MUSIK.phrase`) |

## Anspruch (für `zug/anspruch.txt`)

```
# Station pm-faecher-erleben (Zweig pm-faecher-erleben): zwölf Fronten urteilen über den Adress-Fächer (M4), je Front Gesetz + Leser mit Datei:Zeile, Kontrolle oder Mutante; headless gefahren, jede Bildpflicht ungemessen bis zum Gerät (cloud-post/pm-faecher-erleben.md)
pm-faecher-erleben karte2.erleben.bild.kamera#1,karte2.erleben.sinn.staunen#1,karte2.erleben.sinn.sog#1,karte2.erleben.schoepfen.gespraech#1,karte2.same.entfaltung.akte#2,karte2.same.physik.feuer#2,karte2.same.physik.tragen#2,karte2.same.massstab.physik#2,karte2.erleben.bild.ferne#1,karte2.erleben.schoepfen.satz#1,karte2.erleben.spieler.hand#1,karte2.erleben.klang.landschaft#2
```

## Selbsttest

`node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c`
- **vorher** (eea0f137e): 269 GRÜN von 273, Exit 1. Die vier ROT: BEFEHL TRÄGT, WACHE der Läufer nennt seinen Tod, WACHE DER TOD KOSTET NUR DIE LAUFENDE PROBE, LEBENSZEICHEN DES ZEUGEN.
- **nachher**: Zwei Läufe:
  - an meinen Stationen vor dem Merge (25d33e581): 269 GRÜN von 273, Exit 1, dieselben vier ROT. Darin zählte BEFEHL TRÄGT „jetzt ROT 7“: das waren die 7 Sprossen von sog#1, denn das `\p{L}` / `\p{N}` der Regex in `SOG_AN` las die Linse als unersetzte Platzhalter `{L}` `{N}`. Behoben in 989a18166.
  - **am Endstand** (81592fc17, nach dem Merge): **271 GRÜN von 275, Exit 1**. Dieselben vier ROT wie vorher; BEFEHL TRÄGT „jetzt ROT 0“. Der Merge brachte zwei neue Fälle, beide GRÜN. Die Zahl der grünen Fälle sank nicht (269 → 271).

## Offen (mit Adresse)

- **Die Tafel**: die geänderten Sprossen tragen weiter `{ richter: "gleich" }`. Es kam keine neue Station und keine neue Sprosse dazu, also braucht `punkte.cjs tafel --schreibe` nichts.
- **Am Gerät**: kamera#1, hand#1 und feuer#2 (Halt) urteilen ihre Zahl erst, wo die Welt zeichnet und Wasser steht. Hier blieben sie beim Namen (Kontrolle bzw. Fähigkeit).
- **Nicht geschnitten**: 14 Fronten, je Zeile oben mit Grund und Datei:Zeile.
  - fluid#1: Station `gelaende.K2#1`, eine KOLLISION.
  - Tafel „fehlt“ (Panel oder Korpus): stoffe#1, nahe#1, flaeche#1, entdeckung#1, musik#1, vielfalt#1.
  - sprung#1: Wanduhr am Gerät.
  - gemeinsam#1, teilen#2, schutz#2, legenden#1, takt#2, raum#2: es fehlt ein rufbares Gesetz oder ein zweites Gerät.
- **massstab.physik#2**: die Sturzfolge („die Ameise überlebt den Sturz, der Mensch nicht“) hat kein Gesetz am Aufprall (stamm/koerper-bewegung.js:716–760 meldet nur ein Ereignis). Sie braucht ein Soll-Wort, sobald ein Gesetz sie trägt; bis dahin urteilt die Sprosse nur die Endgeschwindigkeit.
- **Bauart**: keine Lücke an `faecher.js` gefunden. `masse.feld` liest nur Pfad oder `a.`-Feld; eine Funktion als Feld nimmt sie nicht (ich habe darum ein Maß gestrichen, nichts geändert).

## ZWISCHENSTAND

Geschnitten: Zwölf Fronten von erleben und same urteilen über den Adress-Fächer, je mit dem Export, den das Spiel liest, seinem Leser mit Datei:Zeile und einer Kontrolle oder Mutante; die fünf BUEHNE-Spieler-Fronten lesen das Gesetz an Spieler-Adressen, statt Spieler aufzustellen.
Gemessen: Headless urteilen drei gemessen ROT (gespraech#1 0 % eigene geteilte Werke, satz#1 26,8 % gültige Sätze, massstab.physik#2 45,5 % über ~6 m/s), sieben nennen „Leser fehlt“ beim Namen, und kamera#1 und staunen#1 bleiben ohne Gerät beim Namen ungemessen; der Selbsttest steht vorher bei 269 von 273, am Endstand bei 271 von 275 grün, und jede Bildpflicht bleibt ungemessen bis zum Gerät.
Offen: 14 Fronten tragen ihre Adresse oben (fluid#1 ist eine KOLLISION mit gelaende.K2#1, sechs warten mit Tafel „fehlt“ auf Panel oder Korpus, sprung#1 auf die Wanduhr am Gerät, sechs auf ein rufbares Gesetz oder ein zweites Gerät); kamera#1, hand#1 und der Halt von feuer#2 tragen ihre Zahl erst am Gerät.

Karte 2 gebucht 82 von 1 718 (vision/karte-2-stand.json am Endstand des Zweigs).
