# Die Richter-Fabrik `mensch` — das Blatt

ZWISCHENSTAND 19.11. · Zweig `richter-mensch` · Code-Stand 2f026bed · Karte `vision/meisterkarte-2.json`, Kapitel `mensch`. Erzeugt aus dem
Code der Stationen (`meisterkarte-quelle/punkte/stationen/k2-mensch.js`, Register der Perspektiven `k2-mensch-<perspektive>.js`), keine
abgetippte Zahl. Am Gerät lief noch keine Station: jede steht **ungefahren am Gerät**.

## Die Zahlen

| | Zahl | von |
|---|---:|---:|
| Leitern mit Station (je Leiter EINE Probe) | 84 | 84 |
| Sprossen mit Urteil (544 in den 84 neuen Stationen + 23 bestehende Stationen) | 567 | 569 |
| davon headless gefahren am Spiel | 0 | 567 |
| davon `auge` (Bild an fester Pose, Urteil erst durch das Blindpaar am Gerät) | 28 | |
| davon „Umfang nicht erzeugbar“ (ROT mit gemessenem n) | 395 | |
| … darin Augen-Richter, deren Umfang die Welt nicht stellt | 168 | |
| davon „fehlender Leser“ (mit datei:zeile im Spiel-Baum) | 90 | |
| davon gemessen als Zahl gegen das Soll der Karte | 31 | |
| davon bestehende Station (keine zweite) | 23 | |
| „Richter unklar“ (ohne Urteil, mit Vorschlag) | 2 | |

Headless lief nur der Selbsttest der Fabrik: 544 Stationen, 5 339 Mutanten, 0 falsch (je Station der GRÜN-Fall,
Umfang 0, jedes Maß jenseits, Adapter swiftshader, die eigenen Mutanten der Leiter; dazu die Linse SOLL AUS DER KARTE). Die Stationen
selbst urteilen nur an der Welt: die lokale Welt fährt nicht (swiftshader, der GPU-Prozess stürzt reproduzierbar ab), darum 0 am Spiel.
Summe der Deckel: 3 850 s für 84 Proben (45–60 s je Leiter, warme Welt).

## Je Perspektive

- **leib** · `k2-mensch-leib.js` · 6 Leitern · 38 Sprossen: zahl 4 · nicht 27 (Augen-Richter 24) · leser 0 · auge 7 · bestehend 0 · unklar 0 · Messorte stadt-voll, dorf, wiese · Deckel Σ 300 s (2 mutieren) · Selbsttest GRÜN 38 Stationen / 273 Mutanten, 0 falsch · ungefahren am Gerät
- **sport** · `k2-mensch-sport.js` · 8 Leitern · 54 Sprossen: zahl 3 · nicht 20 (Augen-Richter 12) · leser 31 · auge 0 · bestehend 0 · unklar 0 · Messorte genesis, wiese, stadt-voll, stadt · Deckel Σ 270 s (1 mutieren) · Selbsttest GRÜN 54 Stationen / 555 Mutanten, 0 falsch · ungefahren am Gerät
- **geist** · `k2-mensch-geist.js` · 6 Leitern · 42 Sprossen: zahl 2 · nicht 27 (Augen-Richter 4) · leser 7 · auge 4 · bestehend 2 · unklar 0 · Messorte stadt-voll · Deckel Σ 290 s (3 mutieren) · Selbsttest GRÜN 40 Stationen / 436 Mutanten, 0 falsch · ungefahren am Gerät
- **menge** · `k2-mensch-menge.js` · 6 Leitern · 43 Sprossen: zahl 6 · nicht 29 (Augen-Richter 2) · leser 2 · auge 1 · bestehend 5 · unklar 0 · Messorte stadt-voll · Deckel Σ 285 s (5 mutieren) · Selbsttest GRÜN 38 Stationen / 446 Mutanten, 0 falsch · ungefahren am Gerät
- **stadt** · `k2-mensch-stadt.js` · 7 Leitern · 50 Sprossen: zahl 0 · nicht 40 (Augen-Richter 26) · leser 0 · auge 6 · bestehend 4 · unklar 0 · Messorte stadt-voll, dorf, hochhaus-dach · Deckel Σ 345 s (4 mutieren) · Selbsttest GRÜN 46 Stationen / 360 Mutanten, 0 falsch · ungefahren am Gerät
- **netz** · `k2-mensch-netz.js` · 4 Leitern · 29 Sprossen: zahl 1 · nicht 17 (Augen-Richter 7) · leser 9 · auge 0 · bestehend 2 · unklar 0 · Messorte stadt-voll · Deckel Σ 180 s (0 mutieren) · Selbsttest GRÜN 27 Stationen / 283 Mutanten, 0 falsch · ungefahren am Gerät
- **bau** · `k2-mensch-bau.js` · 4 Leitern · 25 Sprossen: zahl 1 · nicht 15 (Augen-Richter 12) · leser 1 · auge 4 · bestehend 3 · unklar 1 · Messorte stadt-voll, dorf · Deckel Σ 225 s (1 mutieren) · Selbsttest GRÜN 21 Stationen / 161 Mutanten, 0 falsch · ungefahren am Gerät
- **fahrzeug** · `k2-mensch-fahrzeug.js` · 5 Leitern · 32 Sprossen: zahl 2 · nicht 26 (Augen-Richter 7) · leser 2 · auge 1 · bestehend 1 · unklar 0 · Messorte stadt-voll, wiese, dorf · Deckel Σ 270 s (3 mutieren) · Selbsttest GRÜN 31 Stationen / 332 Mutanten, 0 falsch · ungefahren am Gerät
- **nahrung** · `k2-mensch-nahrung.js` · 7 Leitern · 45 Sprossen: zahl 3 · nicht 39 (Augen-Richter 13) · leser 2 · auge 0 · bestehend 1 · unklar 0 · Messorte dorf · Deckel Σ 310 s (4 mutieren) · Selbsttest GRÜN 44 Stationen / 443 Mutanten, 0 falsch · ungefahren am Gerät
- **wirtschaft** · `k2-mensch-wirtschaft.js` · 6 Leitern · 40 Sprossen: zahl 0 · nicht 33 (Augen-Richter 7) · leser 6 · auge 0 · bestehend 1 · unklar 0 · Messorte stadt-voll · Deckel Σ 255 s (3 mutieren) · Selbsttest GRÜN 39 Stationen / 423 Mutanten, 0 falsch · ungefahren am Gerät
- **macht** · `k2-mensch-macht.js` · 6 Leitern · 45 Sprossen: zahl 3 · nicht 31 (Augen-Richter 6) · leser 6 · auge 3 · bestehend 1 · unklar 1 · Messorte stadt-voll, hochhaus-dach · Deckel Σ 265 s (1 mutieren) · Selbsttest GRÜN 43 Stationen / 446 Mutanten, 0 falsch · ungefahren am Gerät
- **kultur** · `k2-mensch-kultur.js` · 10 Leitern · 65 Sprossen: zahl 2 · nicht 43 (Augen-Richter 22) · leser 20 · auge 0 · bestehend 0 · unklar 0 · Messorte stadt-voll · Deckel Σ 435 s (2 mutieren) · Selbsttest GRÜN 65 Stationen / 645 Mutanten, 0 falsch · ungefahren am Gerät
- **zeit** · `k2-mensch-zeit.js` · 5 Leitern · 33 Sprossen: zahl 4 · nicht 20 (Augen-Richter 12) · leser 4 · auge 2 · bestehend 3 · unklar 0 · Messorte genesis, wiese, dorf · Deckel Σ 240 s (2 mutieren) · Selbsttest GRÜN 30 Stationen / 280 Mutanten, 0 falsch · ungefahren am Gerät
- **zukunft** · `k2-mensch-zukunft.js` · 4 Leitern · 28 Sprossen: zahl 0 · nicht 28 (Augen-Richter 14) · leser 0 · auge 0 · bestehend 0 · unklar 0 · Messorte stadt-voll · Deckel Σ 180 s (0 mutieren) · Selbsttest GRÜN 28 Stationen / 256 Mutanten, 0 falsch · ungefahren am Gerät

## Wie sie fahren

- Jede Leiter ist EINE Probe (die Station der niedrigsten gemessenen Sprosse), die übrigen Sprossen sind ihre Zwillinge: dieselbe Messung,
  `umfang` als Argument (`K.SPEC.sprossen[n].umfang`), das Soll je Sprosse als Zahl aus der Karte. Alle 84 Proben stehen in der
  Sitzungs-Zeile von `node meisterkarte-quelle/punkte/punkte.cjs gruppen --geraet radeon` (EINE Welt) und fahren mit
  `node meisterkarte-quelle/punkte/punkte.cjs run --sha <sha> --geraet radeon|gtx --nur <diese Zeile>`.
- Der Preis (R8) kommt aus dem Strom wie bei jeder Probe der Tafel (`vision/richter-akte.cjs`, Preis-Lauf der Sitzung an der Pose
  der Probe) — keine Station misst einen eigenen Preis.
- Prüfen ohne Welt: `node meisterkarte-quelle/punkte/stationen/k2-mensch.js --selbsttest [--perspektive p]` · `--abdeckung` ·
  `--zeilen` (die Tafel-Zeilen) · `--herkunft` (die Maße, deren Zahl nicht wörtlich im Richter steht) · `node meisterkarte-quelle/punkte/punkte.cjs liste`
  (880 Stationen, Fehler 2: die beiden der Basis, gelaende.K2#1/#2 HAKEN `window.__zielen`).

## Dateien

- `meisterkarte-quelle/punkte/stationen/k2-mensch.js` — die Fabrik: `leiter()`, das Urteil je Sprosse, Selbsttest, Linse SOLL AUS DER
  KARTE, `--zeilen`, `--abdeckung`, `--herkunft`.
- `meisterkarte-quelle/punkte/stationen/k2-mensch-<perspektive>.js` — 14 Dateien: leib, sport, geist, menge, stadt, netz, bau, fahrzeug, nahrung, wirtschaft, macht, kultur, zeit, zukunft.
- `vision/richter/zeilen-mensch.json` — 550 Tafel-Zeilen im Format von `vision/richter-tafel.json` (521 gleich, 29 fehlt): 544 für die neuen Stationen (die 28 `auge`-Sprossen „fehlt“ mit Pose und Vorbild bis zum Blindpaar, jede andere
  „gleich“), 6 für bestehende Stationen, die die Tafel noch nicht für diese Sprosse trägt. Die Tafel selbst ist unberührt; der
  Koordinator faltet ein. Erst danach fährt der Preis-Lauf für diese Proben (`brauchtPreisLauf` liest die Tafel).
- Haken außerhalb der Stationen, im bestehenden Muster: `meisterkarte-quelle/punkte/punkte.cjs` (Register `k2-[a-z]+.js`, Staffel der Karte 2 =
  Sprosse, `FAHRT_TEILE_MAX` 6 → 9) und `vision/buche-2.cjs` (`TAFEL_ZEILEN`: `zeilen-<kapitel>.json` ist keine Akte, mit Selbsttest).

## Befunde

- **Die Fahrt.** Gemessen mit allen 84 Proben: Radeon 196 Läufe Σ 13 974 s = 8 Teile (6 s unter 8 × 1 740 s), GTX 195 Läufe
  Σ 13 767 s = 8 Teile; vorher Radeon 10 124 s in 112 Läufen. `FAHRT_TEILE_MAX` 9: der neunte Teil trägt die Deckel, die noch kein Gerät
  geeicht hat (`eichtafel`).
- **Der Preis-Lauf steht nicht in der Fahrt-Summe.** `fahrtSumme` (`punkte.cjs:418`) zählt Deckel + Boot; `preisLauf` (`punkte.cjs:3201`)
  fährt je Probe-Gruppe mit einer „gleich“-Zeile GC, Referenzfahrt, `/lauf` (ein 30 s + PREIS_S 20 s + Ruhe ≤ 45 s) und Referenzfahrt.
  Nach dem Einfalten tragen alle 84 Proben „gleich“-Zeilen: 84 × 50–95 s = 4 200–7 980 s Wand-Uhr, die die Fahrt-Wand nicht
  sieht. Das gilt für jede Probe der Tafel, nicht erst für diese; die Zahl gehört in die Fahrt-Summe, bevor die Tafel einfaltet.
- **Die Akten.** `richter-akte.cjs` schreibt Akten nur für Proben der Sitzung; die bestehende headless Station `pflicht.C#1`
  (netz.verkehr S2) trägt darum die Zeile „fehlt“ mit Grund (kein Richter ≤ 60 s für 10 min Tag + Nacht).
- **Die Linse SOLL AUS DER KARTE** (im Selbsttest der Fabrik): jedes Soll, jede Grenze und jeder Umfang steht als Zahl im Wortlaut
  von Richter + Umfang der Sprosse oder trägt eine Herleitung (`herkunft`); 44 Herleitungen, alle unten. Strikte Vergleiche
  („> 0“) messen strikt (`<`, `>`), ohne erfundenen Abstand.

## Offen, mit Grund

- **Alle 84 Proben ungefahren am Gerät.** Grund: die lokale Welt fährt nicht (swiftshader). Fällt mit dem ersten Lauf an Radeon und GTX.
- **Laufzeit im Deckel unbewiesen** (nur die Uhr am Gerät entscheidet, ob der Umfang im Deckel steht): fahrzeug.lenker S1 (eine
  Spielstunde = 150 s Welt-Uhr, `stamm/daten.js:159`, ohne Pause getaktet; nicht erreicht → UNGEMESSEN beim Namen) · kultur.glaube S1
  (Ritus ≤ 7 Tage) · zeit.spanne S1 (vier Orte und vier Bilder) · leib.gesicht und leib.stoff (je 10 Prägungen an zwei Messorten) ·
  macht.wehrbau (32 Saaten; nicht erreicht → ROT am Umfang mit dem erreichten n) · zeit.erleben S2 (braucht trockenes Gras am Dorf).
- **Ehrlich halb gemessen:** sport.koerper S1 misst 3 von 11 Verben (27 %: Gehen, Sprint, Sprung; Klettern, Schwimmen und die 6
  Geräte-Verben stellt die Wiese nicht) und S2 1 von 3 Untergründen (33 %: Hang; Stufe und Gerät nicht) — beide ROT am Umfang mit diesem
  Täter, nie GRÜN. Grund: der Eintritt des Leibs in die Geräte des Spielplatzes (genesis) ist nicht gelesen; mit ihm fällt der zweite Messort.
- **Näherungen, im Beleg benannt:** leib.verschieden S2 (Gestalt-Distanz aus Genom, Bau und Maßen in px, kein Silhouetten-Pixelvergleich) ·
  netz.gestalt S1 (liest die Klassen des Netzes in der Szene, fährt sie nicht) · sport.arena S7 (liest die Akte des Tages-Gesetzes für
  15 Uhr, nicht die gelebte Stunde).
- **Am Kern vorausgerechnet ROT** (node mit dem echten fachwerk-Kern, nicht die Station): macht.wehrbau S2 Form 0,5 < 0,7 · S3 Ring als
  Straße 0,00–0,09 < 0,7 · zeit.palimpsest S2 Überdeckung 0,75 < 0,9 · S3 Trasse 0 (1560 steht keine Mauer) · S4 Sprung 0,25 > 0,05;
  zeit.kausal S2 Varianz 0,25 > 0 bei 0 Brüchen (GRÜN erwartet).
- **Die Referenzen fehlen in beiden Bäumen** (die Sprossen stehen darum „nicht“ mit dem Grund): kein OSM-Band realer Städte (stadt.form S4,
  netz.gestalt S2), kein Vergleichstitel-Satz für stadt.messlatte (Blindpaar am Gerät).

## Richter unklar (2)

- **bau.bedarf S2** — Richter „Rangkorrelation gegen Zensus ≥ 0,7“. Vorschlag: Die Koordination legt einen Zensus-Korpus der Bau-Funktionen realer Städte der Epoche als Tafel ab (Häuserbuch einer Stadt um 1500, z. B. Nürnberg), dann misst die Station die Häufigkeit je Rolle an stadt-voll (≥ 20 Funktionen) und urteilt Spearman ≥ 0,7 gegen ihn.
- **macht.stand S3** — Richter „64 Saaten × 4 Epochen: Gini im Band ≥ 80 %“. Vorschlag: Das Gini-Band als Zahl setzen (Gini der Hausflächen je Epoche nach Kohler et al. 2017, von–bis) und dann je Saat × Epoche den Export der Welt (`_foundryRequestSettlement`) rechnen: ≥ 80 % der 256 Paare im Band, der Gini steigt mit dem Überschuss (`wohl`).

## Fehlender Leser (90) — der Haken, den das Spiel nicht trägt (nicht geschrieben)

| Leiter | S | was fehlt | datei:zeile |
|---|---:|---|---|
| sport.regeln | 1 | kein Wettkampf-Akt im Tages-Gesetz: kein Lauf, kein Wurf, kein Sieger | `koerper-core.js:5126` |
| sport.regeln | 2 | kein Ballspiel, keine Rolle Schiedsrichter | `koerper-core.js:5135` |
| sport.regeln | 5 | keine Regel-Grammatik: die Arena bleibt Fläche | `fachwerk-core.js:11423` |
| sport.koerper | 3 | keine Kraft-Geschwindigkeit, keine Ermüdung, kein Wurf | `koerper-core.js:5455` |
| sport.koennen | 2 | keine Übung | `koerper-core.js:5455` |
| sport.koennen | 3 | kein Wettkampf, kein Bestwert | `koerper-core.js:5126` |
| sport.koennen | 4 | keine Altersklassen, Vereine, Meister | `koerper-core.js:5135` |
| sport.koennen | 5 | keine Weltmeisterschaft, kein Rekord | `koerper-core.js:5455` |
| sport.koennen | 6 | keine Rekorde über Jahrhunderte | `koerper-core.js:5455` |
| sport.mannschaft | 1 | kein Kampf 1 gegen 1 zweier Leiber | `stamm/kampf.js:92` |
| sport.mannschaft | 2 | kein 5 gegen 5 | `koerper-core.js:5135` |
| sport.mannschaft | 3 | kein 11 gegen 11 | `fachwerk-core.js:11423` |
| sport.mannschaft | 4 | keine Vereine, keine Stile | `koerper-core.js:5135` |
| sport.arena | 1 | kein Geschehen auf dem Feld: die Arena bleibt Fläche | `fachwerk-core.js:11423` |
| sport.arena | 2 | kein Jubel, kein Spielstand | `stamm/siedlung-bewohner.js:2283` |
| sport.arena | 4 | keine Liga | `koerper-core.js:5135` |
| sport.arena | 6 | keine Ligen über Epochen | `fachwerk-core.js:11423` |
| sport.kunst | 2 | die Güte liest nie die Hand | `schmiede-core.js:4064` |
| sport.kunst | 3 | kein Tanz | `koerper-core.js:5126` |
| sport.kunst | 5 | keine Lehrer-Kette | `koerper-core.js:5135` |
| sport.geistspiel | 1 | kein Brettspiel am Tisch | `koerper-core.js:5182` |
| sport.geistspiel | 2 | keine Spielstärke, kein Elo | `koerper-core.js:5182` |
| sport.geistspiel | 3 | keine Grammatik der Spiele | `koerper-core.js:5126` |
| sport.geistspiel | 4 | keine neuen Spiele | `koerper-core.js:5126` |
| sport.geistspiel | 5 | keine wandernden Spiele | `koerper-core.js:5126` |
| sport.geistspiel | 6 | keine Spiele je Kultur | `koerper-core.js:5126` |
| sport.medium | 1 | kein Ski, keine Kante | `koerper-core.js:5789` |
| sport.medium | 2 | keine Kufe, kein Brett | `koerper-core.js:5789` |
| sport.medium | 3 | kein Flug des Leibs | `koerper-core.js:5789` |
| sport.medium | 5 | kein Reiter | `stamm/koerper-bewegung.js:2379` |
| sport.medium | 6 | kein Rollstuhl, keine Prothese | `koerper-core.js:1599` |
| geist.gespraech | 2 | kein Bewohner ist ansprechbar: der Name des Gesprächs sucht nur state.creatures | `stamm/feld-nexus.js:1281` |
| geist.gespraech | 3 | kein Gedächtnis über Sitzungen: der Satz des Bewohners trägt keinen Namen und keine Erinnerung | `stamm/siedlung-bewohner.js:887` |
| geist.netz | 1 | keine Verwandtschaft und keine Freundschaft: der Besuch wählt ein Haus fern von Heim und Platz nach Same und Angebot | `koerper-core.js:5316` |
| geist.generationen | 3 | keine Geburt und kein Tod: jede Person ist f(Plan-Same, Haus, Index), ohne Lebensjahr | `stamm/siedlung-bewohner.js:848` |
| geist.absicht | 1 | kein Charakterzug: der Plan der Stunde liest Same, Rolle, Stunde, Orte und Regen | `koerper-core.js:5326` |
| geist.absicht | 2 | kein Ziel über Monate: der Satz des Bewohners trägt kein Ziel, keinen Vorrat, keinen Fortschritt | `stamm/siedlung-bewohner.js:887` |
| geist.innenleben | 2 | kein Tod eines Bewohners und keine Trauer: das Soll der Stunde liest Plan und Weichen, nie einen Verlust | `stamm/siedlung-bewohner.js:2219` |
| menge.seuche | 2 | kein Erreger und keine Ansteckung: der Satz des Bewohners trägt keine Gesundheit | `stamm/siedlung-bewohner.js:887` |
| menge.kollektiv | 3 | kein Zug mit Ziel, Ruf und Kordon: der Plan der Stunde kennt sechs Akte, keinen gemeinsamen | `koerper-core.js:5326` |
| netz.massenverkehr | 1 | keine Linie, kein Halt | `stamm/siedlung-verkehr.js:27` |
| netz.massenverkehr | 2 | keine Korridore, kein Modus | `stamm/siedlung-verkehr.js:27` |
| netz.massenverkehr | 3 | keine Tiefen- und Hochebene | `stamm/gelaende-boden.js:851` |
| netz.massenverkehr | 4 | kein Liniennetz | `stamm/siedlung-verkehr.js:27` |
| netz.massenverkehr | 6 | keine Fernbahn | `stamm/siedlung-ort.js:3285` |
| netz.stoffwechsel | 1 | keine Leitung hinter der Laterne | `stamm/siedlung-ort.js:562` |
| netz.stoffwechsel | 2 | kein Netz hinter dem Brunnen | `stamm/siedlung-ort.js:663` |
| netz.stoffwechsel | 4 | kein Strom, keine Pumpe, keine Ampel | `stamm/siedlung-verkehr.js:27` |
| netz.stoffwechsel | 6 | keine Fernleitung | `stamm/siedlung-ort.js:3285` |
| bau.bauen | 2 | keine Baustelle: der Zug setzt jedes Haus ganz | `stamm/siedlung-ort.js:517` |
| fahrzeug.medium | 7 | kein Planet trägt sein g: der Fahr-Kern liest die Konstante FAHR.G 9,8 | `vehicle-core.js:3080` |
| fahrzeug.maschine | 1 | die Haspel ist Gestalt: kein Verb dreht die Kurbel, der Eimer hängt an der Fülle | `fachwerk-core.js:7462` |
| nahrung.strom | 1 | kein Vorrat, keine Ernte | `stamm/siedlung-bewohner.js:2299` |
| nahrung.hand | 2 | kein Verb bestellt den Acker | `stamm/kampf.js:2308` |
| wirtschaft.stoffstrom | 1 | keine Schmelze, kein Barren | `stamm/feld-leben.js:2499` |
| wirtschaft.markt | 1 | kein Bestand der Bewohner | `stamm/siedlung-bewohner.js:887` |
| wirtschaft.markt | 2 | kein Preis am Stand | `stamm/bau-vorlagen.js:1128` |
| wirtschaft.handel | 1 | der Wagen trägt keine Ware | `stamm/siedlung-verkehr.js:384` |
| wirtschaft.technik | 1 | keine Technik | `fachwerk-core.js:3622` |
| wirtschaft.energie | 1 | kein Brennstoff | `stamm/feld-leben.js:3121` |
| macht.grenze | 1 | keine Grenze im Land: das Reich eines Orts hält nur Gründungen und Herden fern, nichts zeigt es | `stamm/siedlung-ort.js:1609` |
| macht.grenze | 2 | keine Grenze aus der Kostenfläche: kein Reich trägt eine Grenze, die Fluss oder Kamm folgen könnte | `stamm/siedlung-ort.js:1609` |
| macht.recht | 1 | keine Wache: kein Bewohner trägt die Rolle waechter/nachtwaechter, der Wirt gibt sie nie | `stamm/siedlung-bewohner.js:933` |
| macht.recht | 3 | kein Bewohner begeht eine Tat: kein Verbrechen, keine Rate | `stamm/siedlung-bewohner.js:2223` |
| macht.recht | 4 | keine Steuer: kein Zehnt, kein Zoll, keine Fron, kein Wagen trägt Abgaben zum Sitz | `stamm/siedlung-verkehr.js:431` |
| macht.megastadt | 1 | keine Wache, keine Streife: kein Bau trägt die Rolle Wache, kein Wagen fährt Streife | `stamm/siedlung-verkehr.js:431` |
| kultur.sprache | 1 | Personennamen: kein Bewohner trägt einen Namen | `stamm/siedlung-bewohner.js:887` |
| kultur.sprache | 2 | kein Bewohner spricht einen Satz | `stamm/siedlung-bewohner.js:2109` |
| kultur.schrift | 1 | kein Sonderbau trägt ein Schild | `fachwerk-core.js:2182` |
| kultur.schrift | 3 | keine Hauswand trägt Schrift | `fachwerk-core.js:4320` |
| kultur.schrift | 6 | kein lesbarer Text | `fachwerk-core.js:4509` |
| kultur.glaube | 6 | kein Heiliges, kein Gott | `fachwerk-core.js:4462` |
| kultur.diffusion | 5 | keine Wanderung | `fachwerk-core.js:3609` |
| kultur.wissen | 1 | kein Technikstand je Ort | `fachwerk-core.js:4168` |
| kultur.wissen | 3 | kein Buch, kein Medium | `stamm/siedlung-bewohner.js:2169` |
| kultur.wissen | 4 | kein Stand, der fällt oder steigt | `fachwerk-core.js:4168` |
| kultur.verstaendigung | 3 | keine Inschrift | `fachwerk-core.js:6506` |
| kultur.verstaendigung | 4 | keine Sitte, kein Tabu | `stamm/siedlung-bewohner.js:2154` |
| kultur.verstaendigung | 5 | keine Verkehrssprache | `fachwerk-core.js:3634` |
| kultur.verstaendigung | 6 | keine nicht-menschliche Sprache | `stamm/kreatur-verhalten.js:2190` |
| kultur.bildkunst | 1 | kein Werk | `fachwerk-core.js:6495` |
| kultur.bildkunst | 4 | kein Werkstoff der Kunst | `fachwerk-core.js:6495` |
| kultur.erzaehlkunst | 1 | keine Bühne, kein Erzähler | `koerper-core.js:5182` |
| kultur.erzaehlkunst | 2 | kein Werk | `stamm/siedlung-bewohner.js:2169` |
| kultur.strassenleben | 2 | keine Küche | `koerper-core.js:5182` |
| kultur.strassenleben | 3 | keine Mode | `fachwerk-core.js:3622` |
| zeit.kausal | 3 | keine Kette: die Akte eines Orts trägt Zeit und Art, kein Glied, keinen Vorgänger | `stamm/siedlung-bewohner.js:2169` |
| zeit.kausal | 4 | keine Kette über die Saaten: kein Glied mit Vorgänger | `stamm/siedlung-bewohner.js:2169` |
| zeit.kausal | 5 | keine Zeitreise: kein Stand der Vergangenheit ist anspringbar, keine Gabelung | `stamm/siedlung-ort.js:2899` |
| zeit.erleben | 4 | kein Ereignis ist anspringbar: die Akte trägt Zeit und Art, kein Stand des Tags | `stamm/siedlung-bewohner.js:2169` |

## auge (28) — das Bild an fester Pose gegen das Vorbild; GRÜN nie durch die Station

| Leiter | S | Pose | Vorbild |
|---|---:|---|---|
| leib.verschieden | 1 | stadt-voll am Markt, 2 m hinter dem nächsten Bewohner, Blick auf die Mitte der zehn nächsten | Foto von 10 Passanten auf einem Marktplatz aus 2 m: keine zwei gleich (Prüfer findet 0 gleiche Paare) |
| leib.verschieden | 3 | stadt-voll: Markt aus 20 m (10 m hoch, 17,3 m südlich der Mitte der 100 nächsten) | Wiedererkennung einer gezeigten Person unter 100 auf einem realen Platz-Foto (Prüfer ≥ 90 %) |
| leib.gesicht | 2 | dorf Third: 2 m vor dem Gesicht des nächsten Bewohners, auf Kopfhöhe | Porträtfoto gleicher Beleuchtung aus 2 m (Prüfer „lebt“ ≥ 50 %) |
| leib.tracht | 1 | stadt-voll am Markt, 2 m hinter dem nächsten Bewohner | historische Platz-Bilder je Epoche (20 Saaten: Prüfer ordnet Epoche ± 1 Jh. ≥ 0,7) |
| leib.tracht | 3 | stadt-voll: Markt aus 20 m (10 m hoch, 17,3 m südlich) | Marktszene mit Bauer, Händler, Adel, Soldat, Priester (Stand-Rateaufgabe ≥ 70 %) |
| leib.stoff | 4 | dorf Third: 3 m vor dem nächsten Bewohner, 1,5 m hoch | Fotopaar trocken/nass derselben Kleidung; Verschleiß Bauer ↔ Adel (≥ 80 %) |
| leib.ausdruck | 1 | stadt-voll am Markt, 2 m hinter dem nächsten Bewohner | Silhouetten realer Menschen bei Arbeit, Müdigkeit, Furcht (Prüfer errät Akt/Gemüt ≥ 60 %) |
| geist.netz | 2 | stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 17:36 | Gesten zwischen Freund, Feind und Fremdem (Prüfer sagt die Beziehung ≥ 0,7) |
| geist.generationen | 2 | stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m | Familien über Lebensphasen (Prüfer ordnet Kinder den Eltern ≥ 0,7; Gang je Altersgruppe ≤ 15 %) |
| geist.innenleben | 1 | stadt-voll Markt, 3 m vor dem Gesicht des nächsten stehenden Bewohners, nach der Tat 2 m neben ihm, 10 Uhr | Film von Menschen in 4 Gefühlen mit Anlass (Panel nennt das Gefühl ≥ 70 %; Gegenlauf ohne Anlass neutral) |
| geist.innenleben | 3 | stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 8 Uhr | spielende Kinder (Fangen, Ball, Verstecken: Panel ≥ 70 %) und Gangtempo-Normtafeln je Alter (±15 %) |
| menge.bild | 3 | stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 8 Uhr | Foto eines vollen Bahnsteigs (Dichte ± 20 %, Zwillinge 0) |
| stadt.groesse | 1 | dorf (Zelle −4,−4): Ortsrand in der Richtung mit den meisten freien Häusern (von 8), 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte, Mittag | Foto eines realen Weilers (~10 Gebäude) vom Ortsrand: Panel-2AFC ≤ 90 %, Zwillinge im Bild 0 |
| stadt.groesse | 2 | stadt-voll: die Kamera des Spiels an der ortPose platz (Markt im Gedränge), Mittag | Straßen- und Luftbild einer realen Marktstadt (10² Gebäude: Platz, Kirche, Markt, Mauer): 2AFC ≤ 85 % |
| stadt.form | 6 | stadt-voll: der Straßenpunkt des Plans nächst dem Spieler, Auge 1,7 m über Grund, Blick längs der Straße, Mittag | Street-View einer realen Stadt gleicher Klasse (Pflaster, Schilder, Abnutzung, Leben): Verwechslung ≥ 40 % |
| stadt.breite | 1 | stadt-voll: die Kamera des Spiels an der ortPose platz (Markt), Mittag | Fotos realer Altstädte der 6 Regionen der Familie (Mitteleuropa, Alpen, Mittelmeer, Norden, Fernost, Antike): Region erkannt ≥ 50 % |
| stadt.messlatte | 1 | stadt-voll: 100 m der Straße nächst dem Spieler, Auge 1,7 m über Grund am Anfang, Blick längs der Straße, Mittag | dieselbe Kameralage im Vergleichstitel (100 m Straße, Tag): das Panel wählt unser Bild ≥ 20 %, die vier Zählungen an beiden |
| stadt.messlatte | 2 | stadt-voll: der Block am Haus nächst dem Spieler, vom nächsten Straßenpunkt, Mittag und Mitternacht | derselbe Block im Vergleichstitel bei Tag und Nacht: Blindpaar ≥ 30 %, betretbare Innenräume ≥ Vergleichstitel |
| bau.bedarf | 1 | Messort dorf: die Mitte des nächsten Orts aus 30 m schräg oben (18 m), Blick auf die Mitte 2 m über Grund | Luftbild eines realen Haufendorfs gleicher Kultur mit Kirche, Gasthaus, Schmiede und Wohnhäusern (Schwarzwald, Freilichtmuseum Vogtsbauernhof): 50 Bauten blind nach Funktion |
| bau.huelle | 1 | Messort dorf: 10 m vor der Tür des ersten Wohnhauses des nächsten Orts, Auge 1,7 m über Grund, Blick auf die Hausmitte 2,5 m hoch | Foto eines Hauses derselben Kultur bei 10 m (alemannisches Fachwerkhaus, Freilichtmuseum Vogtsbauernhof): Paarvergleich, „Foto“ ≥ 5 % |
| bau.huelle | 2 | Messort dorf: 100 m von der Ortsmitte in Richtung des Spielers, 12 m über Grund, Blick auf die Mitte | Fotos eines realen Fachwerkdorfs bei 10 m und 100 m (Freudenberg, Siegerland): „Foto“ ≥ 15 %, kein Pop im Gang |
| bau.innen | 3 | Messort stadt-voll: in der Tür des ersten Werk-Baus (Gasthaus, Werkstatt, Laden), Auge 1,4 m über seinem Grund, Blick 7 m ins Haus | Fotos realer Innenräume einer Werkstatt, eines Ladens, einer Schenke (Freilichtmuseum Hessenpark): 200 Räume blind klassifiziert |
| fahrzeug.gestalt | 2 | Messort stadt-voll: 2 m hinter dem Spieler, 2,2 m hoch, Blick auf die Reihe der sechs Epochen 12 m vor ihm (5,5 m Abstand) | Museumsfotos je Epoche: Schleife, Ochsenkarren, Kutsche, Motorwagen, Limousine, Zukunftsstudie (Silhouette IoU ≥ 0,7, Epoche ± 1 Jh.) |
| macht.wehrbau | 7 | stadt-voll: Vogelschau 170 m über dem Platz (25 m südlich), Blick senkrecht | Luftbilder von Residenzstädten mit dem Sitz der Macht über der Stadt (Prag mit dem Hradschin, Carcassonne mit der Cité) |
| macht.stand | 1 | stadt-voll: das reichste und das ärmste Wohnhaus nebeneinander, die Kamera 30 m quer über ihrer Mitte, 18 m hoch | archäologische Hausflächen einer mittelalterlichen Stadt (Kohler et al. 2017, Gini der Hausflächen) und ein reales Paar Patrizierhaus/Kleinhaus (Lübeck, Mengstraße) |
| macht.stand | 2 | stadt-voll: Nah-Bild des nächsten Bewohners draußen, 3,5 m vor ihm in Augenhöhe | ständische Kleidung und Viertel einer spätmittelalterlichen Stadt (Kleiderordnungen, Nürnberg um 1500) |
| zeit.spanne | 1 | genesis: vier Orte (Same 7, 12 Häuser) der Jahre 1300/1600/1800/1950, je die Kamera 70 m vor ihrer Mitte, 22 m über dem Grund | datierte Ansichten derselben Stadt zu vier Zeiten (Merian-Stich um 1640, Ansichten um 1800, Fotos um 1900 und 1950) — die Folge der vier Bilder |
| zeit.erleben | 2 | dorf: 22 m hinter dem Herd (von der Dorfmitte aus), 8 m hoch, Blick über den Brand zum Dorf | Fluchtwege bei Orts- und Flächenbränden (Berichte und Karten großer Stadtbrände, Lübeck 1251, Hamburg 1842): wer flieht wohin, das Feuer nach Bauart und Wind |

## Bestehende Stationen (23)

| Leiter | S | Station | Tafel |
|---|---:|---|---|
| geist.tag | 1 | `mensch.K2#2` | trägt sie (gleich) |
| geist.gespraech | 1 | `mensch.K5#1` | trägt sie (gleich) |
| menge.bevoelkerung | 1 | `karte2.mensch.menge.bevoelkerung#1` | trägt sie (gleich) |
| menge.bild | 1 | `karte2.mensch.menge.bild#1` | trägt sie (gleich) |
| menge.dichte | 1 | `mensch.K5#1` | trägt sie (gleich) |
| menge.rhythmus | 1 | `mensch.K2#2` | trägt sie (gleich) |
| menge.kollektiv | 1 | `karte2.mensch.menge.kollektiv#1` | trägt sie (gleich) |
| stadt.form | 1 | `breite.siedlung#1` | trägt sie (gleich) |
| stadt.form | 3 | `breite.siedlung#1` | neu in zeilen-mensch.json (gleich) |
| stadt.vertikal | 1 | `karte2.mensch.stadt.vertikal#1` | neu in zeilen-mensch.json (gleich) |
| stadt.siedlungsnetz | 1 | `karte2.mensch.stadt.siedlungsnetz#1` | trägt sie (gleich) |
| netz.verkehr | 1 | `karte2.mensch.netz.verkehr#1` | neu in zeilen-mensch.json (gleich) |
| netz.verkehr | 2 | `pflicht.C#1` | neu in zeilen-mensch.json (fehlt) — die Mechanik (Wagen am Steuer, Tag + Nacht, 10 min, 0 Berührung, 100 % am Ziel) misst pflicht.C#1 nur headless, „Wagen im Bild“ misst pflicht.C#2 an stadt-voll — keine Probe ≤ 60 s trägt 10 min |
| bau.innen | 1 | `karte2.mensch.bau.innen#1` | trägt sie (gleich) |
| bau.innen | 2 | `siedlung.K1#2` | trägt sie (gleich) |
| bau.bauen | 1 | `karte2.mensch.bau.bauen#1` | neu in zeilen-mensch.json (gleich) |
| fahrzeug.medium | 1 | `karte2.mensch.fahrzeug.medium#1` | trägt sie (gleich) |
| nahrung.erdbau | 1 | `gelaende.K2#1` | trägt sie (gleich) |
| wirtschaft.beruf | 1 | `mensch.K2#2` | trägt sie (gleich) |
| macht.wehrbau | 1 | `karte2.mensch.macht.wehrbau#1` | trägt sie (gleich) |
| zeit.palimpsest | 1 | `siedlung.K4#2` | trägt sie (gleich) |
| zeit.kausal | 1 | `karte2.mensch.zeit.kausal#1` | neu in zeilen-mensch.json (gleich) |
| zeit.erleben | 1 | `karte2.mensch.zeit.erleben#1` | trägt sie (gleich) |

## Umfang nicht erzeugbar (395) — je Leiter, was der Welt fehlt (A = Augen-Richter)

- **leib.verschieden** — S4: die Welt trägt höchstens 1092 Bewohner (stadt-voll), 10⁴ Silhouetten nicht · S5 (A): keine Megastadt mit 10⁵–10⁶ Bewohnern · S6 (A): kein Kontinent mit 10⁷ Bewohnern, N = 200 Orte · S7: kein Planet mit 10⁹–10¹⁰ Leibern über Generationen
- **leib.gesicht** — S3 (A): Alter der Bewohner nur ~21–49 J., 0–100 J. nicht · S4 (A): 10³ Gesichter im Gespräch und unter Last · S5 (A): 10⁴ Gesichter in jedem Licht · S6 (A): jeder Mensch und jedes denkende Wesen
- **leib.tracht** — S2 (A): je Siedlung EIN Schnitt, keine 10 Silhouetten-Familien · S4 (A): 10³ Gesellschaften · S5: die Welt trägt höchstens 1092 Bewohner, 10⁴ nicht; keine Mode über Handelswege · S6 (A): jede Epoche × Kultur der Erde · S7 (A): Zukünfte und fremde Völker
- **leib.stoff** — S3 (A): 10 Nahe mit Lagen (Nah-Wahl 4 Leiber, eine Lage je Zone) · S5 (A): 10³–10⁴ Stoffe im Bild · S6 (A): 10⁵ im Stadion
- **leib.ausdruck** — S2 (A): kein Gang unter Last oder Verletzung · S3 (A): 10³ Gesten im Gespräch · S4 (A): 10⁴ mit Gestik je Kultur · S5 (A): 10⁵ mit eigenem Gang und Gestus · S6 (A): fremde Leiber und Kulturen
- **leib.spur** — S1 (A): die Bewohner tragen nur ~21–49 J. der Achse 18–80 · S2 (A): keine 10 Berufe mit Spur am Leib · S3 (A): keine Verletzung live · S4 (A): 10² Kulturen mit Zeichen · S5 (A): Biografie im Leib bis zur Kybernetik · S6 (A): jeder Mensch eines Planeten
- **sport.regeln** — S3 (A): 0 Sportarten in der Welt · S4 (A): 10² Saaten, die ihre Art wählen · S6 (A): 10³–10⁴ Spiele im Raum der Grammatik · S7: eine Welt, eine Schwere · S8: keine Bevölkerung mit Sportkultur, ein Planet
- **sport.koerper** — S4: die Welt trägt 5 + 6 Verben, keine 10² Bewegungsaufgaben · S5 (A): 10³ Kontakte zweier Leiber bei Spieltempo · S6 (A): 10² Baupläne, die Sport treiben · S7 (A): Weltklasse jeder Disziplin und Schwere
- **sport.mannschaft** — S5: kein Marathon, kein Volksfußball · S6 (A): Taktik der Epochen · S7 (A): Weltklasse-Taktik
- **sport.arena** — S3 (A): kein Stadion mit 10⁴ Zuschauern · S5: keine 10⁵ Zuschauer · S7: 10⁵–10⁷ Partien an einem Nachmittag: die Welt trägt keinen Spiel-Akt
- **sport.kunst** — S1 (A): kein Können-Profil: Meister und Anfänger gleich · S4 (A): 10² Stile je Kultur · S6 (A): neue Künste fremder Kulturen und Körper
- **sport.medium** — S4: keine Rennstrecke · S7: eine Welt, eine Schwere
- **geist.tag** — S3: 10⁴ Bewohner: die Welt trägt höchstens die Stadt des Messorts · S4 (A): 10⁵ Bewohner: die Welt trägt höchstens die Stadt des Messorts · S5: 10⁶ Bewohner in 1 000 Saaten · S6: 10⁷ Bewohner einer Megastadt · S7: 10⁹ Menschen über Epochen und Kulturen · S8: eine Welt in der Sitzung — keine fremde Welt, keine 100 Saaten (die Fremdwelt-Probe R10)
- **geist.gespraech** — S4: 10⁴ Bewohner, 100 Befragte · S5: 10⁵ Bewohner, die Kunde einer Tat über 1 km · S6 (A): 10⁶ Bewohner, und kein Bewohner spricht · S7: 10⁹ Menschen über Epochen, die Zeitreise 1300 ↔ 2020
- **geist.netz** — S3: 10⁴ Bewohner mit Bekannten · S4: 10⁶ Bewohner, 1 000 befragte Paare · S5: 10⁹ Menschen über Kulturen · S6: eine Welt in der Sitzung — keine fremde Welt, keine 100 Saaten (die Fremdwelt-Probe R10)
- **geist.generationen** — S4: 10⁴ Bewohner über einen Sprung von 10 J · S5: 10⁵ Bewohner über 50 J Erbe · S6: 10⁶–10⁷ Bewohner über 1 000 J · S7: 10⁹ Menschen über die Menschenzeit · S8: eine Welt in der Sitzung — keine fremde Welt, keine 100 Saaten (die Fremdwelt-Probe R10)
- **geist.absicht** — S3: 10⁴ Bewohner über einen Sprung von 10 J · S4 (A): 10⁶ Bewohner in 100 Saaten · S5: 10⁹ Menschen über Epochen · S6: eine Welt in der Sitzung — keine fremde Welt, keine 100 Saaten (die Fremdwelt-Probe R10)
- **geist.innenleben** — S4: 10⁴ Bewohner, 100 Paare über 1 Spieljahr · S5: 10⁵ Bewohner mit Humor, Traum und Not · S6 (A): keine Rolle für den Spieler: kein Bewohner ist als Spieler-Leib zu tragen · S7: jede Art jeder Welt: eine Welt in der Sitzung, keine fremde Art (die Fremdwelt-Probe R10)
- **menge.bevoelkerung** — S3: 10⁴ Bewohner in 20 Saaten · S4: 10⁵ Bewohner einer Großstadt, 100 Teleports · S5: 10⁶ Bewohner einer Metropole · S6: 10⁷–4·10⁷ Bewohner einer Megastadt · S7: 4·10⁸ Bewohner in einer Bebauung · S8: 10⁹–10¹⁰ Menschen eines Planeten · S9: 10¹⁰ Menschen je Planet über die Jahre
- **menge.bild** — S4: 10⁴ Menschen auf einem Platz · S5: 10⁵ Menschen in einem Stadion · S6: 10⁶ Menschen eines Pilgerfests · S7 (A): 10⁷–10⁸ Menschen einer Megastadt
- **menge.dichte** — S4: 10³–10⁴ Drängende an einem Engpass · S5: 10⁴ Menschen in einem dichten Strom · S6: 10⁵ Menschen eines Fests · S7: 10⁷ Menschen eines Badefests am Fluss
- **menge.rhythmus** — S3: 10⁴ Wege je Stunde · S4: 10⁵ Wege je Tag an einem Knoten · S5: 10⁶ Wege je Tag · S6: 10⁷ Wege je Tag einer Megaregion · S7: 10⁸–10⁹ Wege je Tag eines Planeten
- **menge.seuche** — S1 (A): keine Krankheit: kein Bewohner kann erkranken · S3: 10⁴ Bewohner einer Stadt im Ausbruch · S4: 10⁶ Bewohner einer Region · S5: 10⁸ Menschen über Epochen · S6: 10¹⁰ Menschen eines Planeten
- **menge.kollektiv** — S4: 10⁵ Bewohner einer Stadt in der Räumung · S5: 10⁶ Menschen auf der Flucht über Land · S6: 10⁷ Menschen über Jahrzehnte · S7: 10⁸–10⁹ Menschen über Jahrtausende
- **stadt.groesse** — S3 (A): Kleinstadt 10³ Häuser in der warmen Welt · S4 (A): Großstadt 10⁴ Häuser in der warmen Welt · S5 (A): Metropole 10⁵ Häuser, 10⁶ Bewohner · S6 (A): Megastadt 10⁶ Häuser · S7 (A): Tokio-Maß 10⁷ Häuser · S8: ≥ 10⁸ Häuser in einer Bebauung
- **stadt.form** — S2 (A): Großstadt 10⁴ Häuser in der warmen Welt · S4: 100 Saaten in einer Sitzung und das OSM-Band · S5 (A): 10² Saaten je Größenklasse · S7 (A): 10² Saaten
- **stadt.vertikal** — S2: Türme mit 30 Geschossen · S3: ein Gebäude ≥ 400 m · S4: eine zweite begehbare Ebene · S5 (A): ≥ 5 Schichten, 10 000 Bewohner je ha · S6: eine Struktur ≥ 1 km · S7: 10 Schichten · S8: Bewohner auf 5 Höhen-Dekaden
- **stadt.breite** — S2 (A): 10 Netzformen aus Ursache · S3 (A): Kulturräume aller Kontinente · S4 (A): 10² Kultur × Epoche · S5 (A): Städte der Jahre 2100–3000 · S6 (A): fremde Bauende · S7 (A): 10⁴ Stadtformen
- **stadt.siedlungsnetz** — S2 (A): ein Land von 10³ km · S3: 10⁴ Städte über 4 Dekaden · S4 (A): 10⁶ Siedlungen, 8·10⁹ Bewohner · S5: 10¹¹ Bewohner · S6 (A): 10² Planeten
- **stadt.habitat** — S1: eine Siedlung unter der Erde · S2: eine Stadt unter Wasser · S3 (A): eine Kolonie bei 1/6 oder 1/3 g · S4 (A): eine Station ohne Schwere · S5 (A): ein Zylinder-Habitat · S6: ein Netz von Habitaten · S7 (A): fremde Welten mit Bewohnern
- **stadt.messlatte** — S3 (A): ein Viertel von 1 km² · S4 (A): die Nachtstraße einer Megastadt · S5: eine Stadt von 10 km² · S6 (A): zehnmal Tokio · S7 (A): jede Stadt jeder Epoche
- **netz.gestalt** — S2: 10³ Häuser und das OSM-Band · S3 (A): 10⁴ Häuser · S4 (A): 10⁵ Häuser · S5 (A): 10⁶ Häuser · S6: 10⁷ Häuser · S7: 3 Welten
- **netz.verkehr** — S3: Ampel und Übergang · S4: 10⁴ Wagen · S5: 10⁵ Wege am Tag · S6: 10⁷ Fahrzeuge · S7 (A): 10⁹ Wege am Tag · S8: 10¹⁰ Reisende
- **netz.massenverkehr** — S5 (A): 10⁶ Fahrgäste am Tag · S7 (A): Bahnhöfe über Saaten und Epochen
- **netz.stoffwechsel** — S3 (A): aufschneidbare Leitungen · S5: 10⁶ Häuser · S7: 3 Welten mit fremden Stoffen
- **bau.bedarf** — S3 (A): 10² Saaten in einer Probe: die Sitzung trägt eine Welt-Saat · S4 (A): 32 Städte mit Großbau: die Welt trägt eine Stadt und keinen Stadion-, Bahnhof- oder Fabrik-Bau · S5: keine Megastruktur steht in der Welt · S6 (A): fremde Planeten: die Welt trägt keinen fremden Großbau
- **bau.huelle** — S3 (A): 10³ Bauten: die vollste Stadt trägt 295 Häuser · S4 (A): 10⁴ Bauten im Blick: die vollste Stadt trägt 295 Häuser · S5 (A): 10⁷ Bauten bis zum Horizont: die Welt trägt einige hundert · S6 (A): jedes Bauwerk jedes Planeten: die Welt trägt einen Planeten
- **bau.innen** — S4: 10⁴ Bauten: die vollste Stadt trägt 295 Häuser · S5 (A): 10⁶ Bauten mit 100 Etagen: die Welt trägt einige hundert Häuser · S6 (A): ≥ 10⁹ Bauten: die Welt trägt einige hundert Häuser · S7 (A): Bauten fremder Leiber: jeder Bau ist für den Menschen gebaut
- **bau.bauen** — S4 (A): Umbau über 50 Jahre: die Stadt baut sich nicht um · S5 (A): 50 Sätze → Bau: der Parser trägt vier Bau-Sätze · S6: fremde Leiber auf fremden Welten: keine fremde Baustelle
- **fahrzeug.medium** — S2: 20 Saaten mit eigener Physik: die Welt trägt sechs Fahr-Rezepte · S3: kein Wasserfahrzeug in der Welt · S4: kein Schienen- und kein Luft-Werk in der Welt · S5: kein Tauch-Werk, keine Verformung aus der Stoff-Zeile · S6: kein Raum-Werk in der Welt · S8: kein Raum-Werk, keine Bord-Uhr
- **fahrzeug.form** — S2: 50 Baupläne an Land: der Kern trägt sechs Rezepte · S3: kein Floß und kein Gleiter aus Teilen · S4: der Parser baut aus keinem Satz ein Fahrzeug · S5: 10³ Kultur-Saaten: der Kern trägt eine Handvoll Marken · S6 (A): Technik-Evolution über 500 Jahre: die Epochen sind eine feste Tafel
- **fahrzeug.gestalt** — S1 (A): 5 Gattungen: die Welt trägt weniger Fahrzeug-Typen · S3 (A): 10³ Saaten in Land, Wasser, Schiene: die Welt trägt ein Medium · S4 (A): 10² Wagen einer Straße: die Stadt trägt 20 · S5 (A): fremde Evolutionen: kein fremder Leib baut Fahrzeuge · S6 (A): 10⁴ Planeten-Saaten: ein Planet
- **fahrzeug.lenker** — S2: 10² Fahrer mit Charakter: die Stadt trägt 20 Wagen mit EINEM Stil · S3: keine Rennstrecke in der Welt · S4: kein Wasser- und kein Luftfahrzeug · S5: kein Wettkampf mit Gefährt · S6: kein fremder Lenker
- **fahrzeug.maschine** — S2: keine Mühle und kein Wasserrad in der Welt · S3: kein Werk trägt eine Fertigung · S4 (A): Fabrik, Industriestadt: kein Fabrik-Bau · S5: keine Werft, kein Raumhafen · S6: ein Sonnensystem ohne Industrie
- **nahrung.flur** — S2 (A): die Flur am Messort deckt ≪ 1 km² (1–2 Äcker je Feldweg-Ende) · S3 (A): 10³ Parzellen: die Welt am Messort trägt eine Handvoll Äcker · S4: 16 Saaten und Weide als Nutzung · S5: ein Kontinent mit Nutzflächen je Klimazone · S6 (A): 10⁹ Parzellen eines Planeten · S7 (A): 64 Welten mit fremden Agrarformen
- **nahrung.frucht** — S1 (A): keine Kulturpflanze auf dem Acker · S2: keine Kulturart · S3 (A): 32 Saaten und Kulturpflanzen je Zone · S4: 10³ Felder mit Ertrag · S5: keine Ähre, keine Domestikation · S6 (A): 64 Welten mit Kulturformen
- **nahrung.tier** — S2: kein Bewohner jagt oder fischt · S3: keine Herde, kein Hirte · S4: keine Haustiere · S5: keine Fischerei · S6: keine Wanderhirten · S7: 64 Welten
- **nahrung.erdbau** — S2: kein Bewohner bewässert · S3 (A): kein Erdbau der Bewohner · S4: kein Polder · S5: keine Talsperre · S6 (A): 1000 Jahre Umformung · S7: 64 Welten
- **nahrung.strom** — S2 (A): 10² Bewohner beim Mahl und eine Speise · S3: 10 Orte mit Markt und Preis · S4: 10⁴ Bewohner, Hunger · S5: eine Stadt ≥ 10⁸ · S6: 16 Saaten × 100 Jahre
- **nahrung.hand** — S3 (A): 50 Bewohner bei der Feldarbeit · S4: die Arbeit ändert den Acker nicht · S5: kein Fest, keine Erntezeit · S6: eine Rolle der Nahrung statt 20
- **nahrung.jenseits** — S1 (A): kein Garten, kein Gewächshaus im Ort · S2 (A): kein Gewächshausmeer · S3: kein Nahrungsturm · S4: keine Ozeanfarm · S5: 64 Saaten mit Habitat · S6: 16 Saaten über Sonnensysteme
- **wirtschaft.stoffstrom** — S2: keine Ware fließt · S3: 10² Waren · S4 (A): 10³ Waren · S5: 10⁴ Waren · S6 (A): 10⁷ Warenformen · S7: 10⁹ Waren
- **wirtschaft.beruf** — S2 (A): 10 Berufe mit eigener Handlung · S3: 10² Berufe mit Kette · S4: 10³ Berufe · S5: 10⁴ Berufe · S6: 10⁷ Arbeitende · S7: 10⁸ Arbeitende
- **wirtschaft.markt** — S3: 10 Märkte · S4: 10³ Märkte · S5 (A): 10⁵ Märkte mit Börse · S6: 10⁷ Märkte
- **wirtschaft.handel** — S2: keine Route zwischen Orten · S3: kein Hafen · S4: 10³ Knoten · S5: 10⁵ Routen · S6: kein Welthandel · S7: kein Raumflug
- **wirtschaft.technik** — S2: 10² Techniken · S3: 10³ Techniken · S4: 10⁴ Techniken · S5: kein Halbleiter · S6 (A): 10 Epochen eines Orts · S7 (A): fremde Chemie
- **wirtschaft.energie** — S2: keine Mühle im Ort · S3: keine Kohle, kein Dampf · S4: kein Kraftwerk · S5 (A): kein Planet bei Nacht · S6: 20 Saaten
- **macht.grenze** — S3: keine zweite Ebene: kein Bund über den Orten · S4: keine Herrschaft über die Zeit: kein Aufstieg, kein Fall, der Hauptort wandert nie · S5 (A): kein Reich über den Ort hinaus: keine Grenze, deren Seite man erkennt · S6: keine Menschenzeit und kein Übersee: keine Kolonie, keine Hochseeschifffahrt · S7: keine Stufenfolge der Ordnung: die Welt trägt den Ort, nichts darüber · S8: keine fremde Art mit Ordnung
- **macht.wehrbau** — S4: keine Burgen in der Fläche, keine Festung an Hügel oder Furt · S5: keine Grenzbefestigung: jede Mauer ist ein Ring um einen Ort · S6: keine Familien von Wehrbauten: eine Form für jede Epoche · S8: keine fremde Welt mit eigener Waffe
- **macht.stand** — S4: die Welt trägt ≤ 1092 Bewohner, keinen Lebenslauf · S5: keine Epochen der Bewohner, keine Revolution, keine Reform · S6 (A): keine fremde Art mit Rängen
- **macht.recht** — S5: keine Rechtsordnung: keine Tat hat in einem Gemeinwesen eine Folge · S6: keine Verwaltung, ≤ 1092 Bewohner · S7: kein Recht in keiner Epoche
- **macht.krieg** — S1: nur der Spieler trägt eine Klinge, kein Bewohner ist bewaffnet · S2 (A): keine zehn Kämpfer, keine Moral, keine Flucht · S3: kein Scharmützel, keine Formation · S4: keine Feldschlacht · S5: keine Belagerung, keine Bresche · S6: keine Schlacht, keine Versorgung · S7: kein Krieg, kein Bündnis, kein Tribut · S8 (A): keine Front, kein Graben, keine Ruine des Kriegs · S9: keine interplanetaren Konflikte
- **macht.megastadt** — S2 (A): keine Banden, keine Reviere, kein Graffiti · S3: eine Metropole, kein Bodenpreis, keine Macht, der die Höhe folgt · S4: kein Protest, keine Masse mit Ursache · S5: keine Überwachung, ≤ 1092 Bewohner · S6 (A): keine vertikale Schichtung der Bewohner · S7: keine fremde Megastadt
- **kultur.sprache** — S3: Sprachen: eine Silben-Tafel je Region, keine Wortliste · S4: Dialekt-Kontinua: keine · S5 (A): hörbare Sprachen: kein Laut einer Sprache · S6: Sprachstufen: die Silben-Tafel ist zeitlos · S7: Sprachen über Planeten: eine Welt
- **kultur.schrift** — S2: Grabsteine: ≤ 36 Lose des Kirchhofs, keine Schrift · S4 (A): leuchtende Schilder: keines · S5 (A): Schrift-Funde: kein Text-Träger
- **kultur.glaube** — S2 (A): Glauben: eine Rolle Kirche, kein Bekenntnis · S3: Gräber: ≤ 36 Lose des Kirchhofs · S4: Glauben mit heiliger Landschaft: keine · S5: Glaubens-Richtungen: keine Spaltung
- **kultur.gestalt** — S1 (A): Kulturen der Stadt: 4 < 10 · S2 (A): Kulturen aus dem Samen: < 100 · S3 (A): Kulturen auf einem Kontinent: < 1 000 · S4 (A): Kulturen mit Fest und Alltag: < 10⁴ · S5 (A): Kulturen über alle Epochen: < 10⁵ · S6 (A): Kulturen über Planeten und Arten: eine Welt · S7 (A): irdische Stichproben: < 1 000 Häuser
- **kultur.diffusion** — S1: kein Ort einer anderen Region binnen 2 km · S2: zehn Kulturen mit Wegen: < 10 · S3 (A): Herkünfte in der Stadt: < 10 · S4: Herkünfte: < 100 · S6: Bewohner: 1092 < 10⁸
- **kultur.wissen** — S2: Schule und Bibliothek: keine Rolle · S5: Städte: eine · S6: Arten mit Wissenschaft: keine
- **kultur.verstaendigung** — S2 (A): Wörter der Welt: < 20
- **kultur.bildkunst** — S2 (A): Kulturen mit Werken: keine · S3 (A): Jahre der Werke: kein Werk · S5 (A): Werke der Stadt: < 10⁴ · S6: Bewohner: 1092 < 10⁶ · S7 (A): fremde Arten mit Kunst: keine
- **kultur.erzaehlkunst** — S3 (A): Werke: keines · S4: Theater, Kino, Verlag: keines · S5: Filme: keiner · S6: Werke über Jahrhunderte: keines · S7 (A): Kulturen mit Erzählkunst: keine
- **kultur.strassenleben** — S1: Lokale: ein Gasthaus je Ort · S4 (A): unterwegs: 1092 < 10⁴ · S5: Läden: < 10⁵ · S6 (A): Szenen: eine Tracht je Ort · S7 (A): Kulturen mit Straßenleben: < 32
- **zeit.spanne** — S2 (A): das Jahr wählt nur die Epoche: 60 Halte geben ≤ 5 verschiedene Orte, kein Regler · S3 (A): kein Lager, kein Dorf ohne Metall, kein Tell: vor 1560 derselbe Ort des Mittelalters · S4 (A): kein Zeitraffer, keine Zukunft über einen Halt · S5 (A): keine Kultur vor dem Mittelalter, keine 300 000 J · S6 (A): kein Ort des Planeten je Jahr: die Kultur folgt Region und Epoche · S7 (A): eine Welt, eine Art, keine 10⁶ J
- **zeit.palimpsest** — S5: keine Schichten im Boden, keine Grabung · S6: der Name erbt nicht, die Chronik reicht keine 1 000 Jahre · S7 (A): kein Niedergang, keine Ruine, kein Wald über ihr · S8: keine Metropole über 10⁴ J, keine Spur früherer Epochen
- **zeit.kausal** — S6: eine Welt, keine Kette über 10⁶ J
- **zeit.erleben** — S3: die Welt trägt den Brand im Feld und die Gewalt als Akte, keine Flut, keine Belagerung · S5: eine Perspektive: der Spieler · S6 (A): kein Ereignis einer realen Zivilisation
- **zeit.erde** — S1 (A): kein Schlüssel der Erde: das Jahr 100 gibt die Epoche mittelalter, keine römische Stadt nach dem Befund · S2: kein Schlüssel der Erde: keine 10 Orte × 3 Epochen · S3 (A): kein Schlüssel der Erde: keine Stadt, die wächst, brennt und überbaut wird, wie sie es tat · S4: kein Schlüssel der Erde: keine bewohnte Erde je Jahrhundert · S5 (A): kein Schlüssel der Erde: kein Alltag eines realen Orts · S6 (A): kein Schlüssel der Erde: keine eigene Stadt im Jahr der Großeltern
- **zukunft.technik** — S1 (A): EINE Stadt +50 Jahre: die Stadt trägt keine Zeit-Achse nach vorn · S2 (A): +200 Jahre: kein Energie-Bau der Zukunft · S3: kein Bau eines Stoffs nach heute · S4 (A): 10 Saaten mit eigener Zukunft: die Sitzung trägt eine Saat ohne Zukunft · S5: kein Megabau, keine planetare Energie · S6 (A): kein Schwarm um den Stern · S7 (A): keine Technik-Epoche nach heute
- **zukunft.medien** — S1: keine Bildfläche in der Stadt · S2 (A): keine bewegte Fläche · S3: keine Fläche, keine Meldung · S4: kein Bewohner trägt ein Gerät · S5 (A): kein Hologramm, kein Raum-Bild · S6: kein Rechner in der Welt · S7 (A): keine fremde Art
- **zukunft.maschinenwesen** — S1 (A): kein Roboter in der Welt · S2 (A): keine Maschine in der Stadt · S3: keine Maschine im Stoffwechsel · S4: keine Maschinen-Person · S5: keine Gesellschaft aus Menschen und Maschinen · S6 (A): keine Maschinen-Person · S7 (A): keine Maschinen-Zivilisation
- **zukunft.leib** — S1: kein Bewohner mit Ersatzglied · S2: kein Bewohner mit Eingriff · S3: keine Klinik, kein Eingriff, die Stadt bleibt unter 10⁴ Bewohnern · S4: kein Eingriff am Leib des Spielers · S5: kein Erbgang über Generationen · S6 (A): kein veränderter Leib · S7 (A): kein Leib jenseits des Menschen

## Herleitungen (44) — Soll oder Umfang, deren Zahl nicht wörtlich im Richter steht

| Leiter | S | Maß | Herleitung |
|---|---:|---|---|
| leib.stoff | 1 | Umfang 160 Posen × Samen gemessen, je eigener Guss (8 Gehen + 8 Lauf je Same, 10 Samen) | der Richter „16 Posen × 10 Samen“: 16 · 10 = 160 Posen, jeder Same ein eigener Guss |
| sport.koerper | 1 | Umfang 11 Verben im Spiel gegen Eichwert (5 des Leibs + 6 Geräte-Verben) | der Umfang „5 Verben + 6 Geräte-Verben“ eines Leibs: 5 + 6 = 11 Verben |
| sport.koerper | 1 | Tempo Gehen (m/s) 1.5 | der Eichwert des Gehens ~1,5 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,15 |
| sport.koerper | 1 | Tempo Sprint (m/s) 6.8 | der Eichwert des Sprints ~6,8 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,68 |
| sport.koerper | 1 | Sprunghöhe (m) 0.53 | der Eichwert des Sprungs ~0,53 m bei g = 9,81 (koerper-core.js:502), ± 10 % des Richters = ± 0,053 |
| sport.koerper | 2 | Umfang 3 Untergründe gemessen (Stufe · Hang · Gerät) | die Aufzählung des Umfangs „Stufe, Hang, Gerät“: 3 Untergründe |
| sport.koennen | 5 | Sieger 100 m (s) 9.4–9.9 | das Band der Sprosse in der Karte (vision/meisterkarte-2.json, tiefe: „100 m 9,4–9,9 s“); WM-Sieger 1983–2023 (World Athletics) 9,58–10,07 s |
| sport.koennen | 5 | Sieger Hochsprung (m) 2.3–2.5 | das Band der Sprosse in der Karte (tiefe: „Hochsprung 2,30–2,50 m“); WM-Sieger 1983–2023 (World Athletics) 2,32–2,41 m |
| sport.koennen | 5 | Sieger Marathon (s) 7200–7560 | das Band der Sprosse in der Karte (tiefe: „Marathon 2:00–2:06 h“ = 7200–7560 s); schärfer als die WM-Sieger 1983–2023 (2:05–2:16 h) |
| sport.koennen | 6 | Umfang 11 Jahrzehnte der Rekordkurve (1900–2009) | der Richter misst „gegen 1900–2009 … je Jahrzehnt“: die Kurve über alle 11 Jahrzehnte 1900–2009 |
| sport.mannschaft | 2 | Umfang 10 Leiber in 5 gegen 5 | „5 gegen 5“: zwei Seiten zu je 5 = 10 Leiber |
| sport.mannschaft | 3 | Umfang 23 Leiber in 11 gegen 11 mit Schiedsrichter | „11 gegen 11 mit Schiedsrichter“: 2 × 11 Spieler + 1 Schiedsrichter = 23 Leiber |
| sport.arena | 6 | Glieder anders 100 J. zurück (Sieger · Arten · Bauten) ≥ 3 | die Aufzählung „andere Sieger, Arten, Bauten“: alle 3 Glieder anders |
| sport.medium | 2 | Umfang 2 Medien (Eis, Brandung) | die Aufzählung „Eis und Brandung“: 2 Medien |
| sport.medium | 3 | Umfang 3 Fluggeräte (Gleitschirm, Fallschirm, Segelflug) | die Aufzählung „Gleitschirm, Fallschirm, Segelflug“: 3 Fluggeräte |
| sport.medium | 5 | Umfang 3 Tier-Sportarten (Rennen, Springen, Schlitten) | die Aufzählung „Rennen, Springen, Schlitten“: 3 Tier-Sportarten |
| sport.medium | 6 | Umfang 2 anderer Leib und Bildschirm-Spiel | „mit anderem Leib und am Bildschirm“: 2 Formen des Sports |
| geist.generationen | 5 | Beruf Vater → Kind ÷ Erwartung ≥ 1 | „Beruf Vater → Kind ≥ Erwartung“: die Quote der Vererbung geteilt durch die erwartete, mindestens 1 |
| geist.generationen | 6 | Pyramiden im Band der Referenz (1300, 1800, 2000) ≥ 3 | die drei im Wortlaut genannten Stichjahre 1300/1800/2000: jede ihrer Pyramiden gegen die Referenz, 3 von 3 |
| geist.innenleben | 2 | Tage der Änderung > 1 | der Plural „über Tage“: länger als ein Tag, strikt über 1 |
| geist.innenleben | 5 | Wochen, über die Zeugen den Ort meiden > 1 | der Plural „über Wochen“: länger als eine Woche, strikt über 1 |
| menge.bevoelkerung | 5 | Anteil Angetroffener am Plan-Ort ≥ 0.95 | „wie 4“: das Soll von S4, ≥ 0,95 der Angetroffenen am Plan-Ort aus 100 Teleports, im größeren Umfang |
| menge.bevoelkerung | 6 | Anteil Angetroffener am Plan-Ort ≥ 0.95 | „wie 4“: das Soll von S4, ≥ 0,95 der Angetroffenen am Plan-Ort aus 100 Teleports, im größeren Umfang |
| menge.rhythmus | 6 | Paare im Band realer Zählungen (Sonntag/Werktag, Ferien/Schule) ≥ 2 | die zwei im Wortlaut genannten Paare Sonntag/Werktag und Ferien/Schule: beide im Band, 2 von 2 |
| netz.verkehr | 6 | Moden im Modal Split > 1 | „Modal Split“ über „alle Moden“: ein Split trägt mehr als eine Mode — das Band selbst nennt die Karte ohne Zahl |
| bau.bedarf | 5 | Umfang 3 Megastruktur-Typen (Arkologie, Raumhafen, Liftfuß) | die Aufzählung „Arkologie, Raumhafen, Liftfuß“ zählt drei Typen der Megastruktur |
| bau.bauen | 3 | Spielstunden seit dem Bau ≥ 1 | „nach 1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422) |
| fahrzeug.medium | 2 | Anteil der Saaten mit Bremsweg 50 → 0 in 7,5–12,5 m ≥ 1 | „∝ v²“: das Band 30–50 m bei 100 km/h mal (50/100)² = 0,25 ergibt 7,5–12,5 m bei 50 km/h |
| fahrzeug.medium | 5 | Anteil der Untergänge mit Sinkdauer in der Spanne der Quellen des dokumentierten Falls ≥ 1 | „gegen dokumentierten Fall“: die Spanne seiner Quellen ist das Band, wie dem Crash „im Band realer Tests“ |
| fahrzeug.form | 3 | Umfang 2 Werke mit gebauter Hülle (Floß, Gleiter) | der Richter nennt zwei Werke aus Teilen: das Floß (sinkt/schwimmt) und den Gleiter (fällt/fliegt) |
| fahrzeug.lenker | 1 | Spielstunden Verkehr der Messung ≥ 1 | „1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422) |
| fahrzeug.lenker | 2 | Tempo vorsichtig ↔ eilig trennbar (AUC) > 0.5 | „trennbar“: besser als der Zufall — AUC 0,5 heißt ununterscheidbar (wie 50 % im Zwei-Wege-Zwang, R11) |
| fahrzeug.lenker | 4 | Umfang 2 Kapitän und Pilot (Wasser- und Luftfahrzeug mit Lenker) | die Aufzählung „Kapitän und Pilot“ zählt zwei Lenker: einen zu Wasser, einen in der Luft |
| fahrzeug.maschine | 6 | Umfang 2 Sonnensysteme mit Industrie | „über Sonnensysteme“: die Industrie reicht über mehr als ein System, der Plural verlangt mindestens zwei |
| nahrung.frucht | 4 | Ertrag bei Dürre (relativ) -0.7–-0.3 | „Ertrag −30…−70 %“: das Band als Anteil, −0,7 bis −0,3 |
| macht.grenze | 8 | Abstand der Ordnungstypen zur Erde ÷ Abstand Erde–Erde > 1 | „Abstand zur Erde > Erde–Erde“ ist der Quotient beider Abstände über 1 |
| macht.wehrbau | 2 | Umfang 4 Stichjahre 900/1350/1650/1900 | die Stichjahre, die der Richter aufzählt (900/1350/1650/1900), gezählt: vier |
| macht.wehrbau | 8 | Umfang 2 fremde Welten mit eigener Waffe | „fremde Welten“ in der Mehrzahl: mindestens zwei Welten, deren Waffe der Wehrbau folgt |
| macht.krieg | 9 | Umfang 2 Planeten im Konflikt | „interplanetar“ heißt zwischen Planeten: ein Konflikt dieser Art braucht mindestens zwei Planeten |
| kultur.glaube | 3 | Schichten der Epochen (1320/1860) ≥ 2 | „Schichtung 1320/1860“ nennt zwei Epochen: zwei Schichten im Kirchhof |
| kultur.wissen | 2 | Umfang 3 Arten (Schule, Bibliothek, Werkstatt) | „Schule, Bibliothek, Werkstatt“: drei Arten aufgezählt, jede muss stehen |
| kultur.erzaehlkunst | 1 | Akte im Bild (Anfang, Wende, Ende) ≥ 3 | „Anfang, Wende, Ende im Bild“: drei Stellen des Stücks aufgezählt |
| zeit.erde | 2 | Umfang 30 Orte der Erde × Epochen (10 × 3) | „10 Orte × 3 Epochen“ des Umfangs ausmultipliziert: 30 Paare (Ort, Epoche) |
| zeit.erde | 4 | Umfang 51 Jahrhunderte der bewohnten Erde seit −3000 | „jedes Jahrhundert seit −3000“ bis 2000: (2000 − (−3000)) / 100 + 1 = 51 Jahrhunderte |

## Je Leiter: die Probe, ihr Ort, ihr Deckel und die Klasse jeder Sprosse

| Leiter | Probe | Messort | Deckel | Sprossen |
|---|---|---|---:|---|
| leib.verschieden | `karte2.mensch.leib.verschieden#1` | stadt-voll | 45 s | S1 auge · S2 zahl · S3 auge · S4 nicht · S5 nicht·A · S6 nicht·A · S7 nicht |
| leib.gesicht | `karte2.mensch.leib.gesicht#1` | dorf, wiese | 60 s · mutiert | S1 zahl · S2 auge · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A |
| leib.tracht | `karte2.mensch.leib.tracht#1` | stadt-voll | 45 s | S1 auge · S2 nicht·A · S3 auge · S4 nicht·A · S5 nicht · S6 nicht·A · S7 nicht·A |
| leib.stoff | `karte2.mensch.leib.stoff#1` | dorf, wiese | 60 s · mutiert | S1 zahl · S2 zahl · S3 nicht·A · S4 auge · S5 nicht·A · S6 nicht·A |
| leib.ausdruck | `karte2.mensch.leib.ausdruck#1` | stadt-voll | 45 s | S1 auge · S2 nicht·A · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A |
| leib.spur | `karte2.mensch.leib.spur#1` | stadt-voll | 45 s | S1 nicht·A · S2 nicht·A · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A |
| sport.regeln | `karte2.mensch.sport.regeln#1` | genesis | 30 s | S1 leser · S2 leser · S3 nicht·A · S4 nicht·A · S5 leser · S6 nicht·A · S7 nicht · S8 nicht |
| sport.koerper | `karte2.mensch.sport.koerper#1` | wiese | 45 s · mutiert | S1 zahl · S2 zahl · S3 leser · S4 nicht · S5 nicht·A · S6 nicht·A · S7 nicht·A |
| sport.koennen | `karte2.mensch.sport.koennen#1` | stadt-voll | 30 s | S1 zahl · S2 leser · S3 leser · S4 leser · S5 leser · S6 leser |
| sport.mannschaft | `karte2.mensch.sport.mannschaft#1` | genesis | 30 s | S1 leser · S2 leser · S3 leser · S4 leser · S5 nicht · S6 nicht·A · S7 nicht·A |
| sport.arena | `karte2.mensch.sport.arena#1` | stadt-voll, genesis | 45 s | S1 leser · S2 leser · S3 nicht·A · S4 leser · S5 nicht · S6 leser · S7 nicht |
| sport.kunst | `karte2.mensch.sport.kunst#1` | stadt-voll | 30 s | S1 nicht·A · S2 leser · S3 leser · S4 nicht·A · S5 leser · S6 nicht·A |
| sport.geistspiel | `karte2.mensch.sport.geistspiel#1` | stadt-voll | 30 s | S1 leser · S2 leser · S3 leser · S4 leser · S5 leser · S6 leser |
| sport.medium | `karte2.mensch.sport.medium#1` | stadt | 30 s | S1 leser · S2 leser · S3 leser · S4 nicht · S5 leser · S6 leser · S7 nicht |
| geist.tag | `karte2.mensch.geist.tag#2` | stadt-voll | 60 s · mutiert | S1 best. · S2 zahl · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht · S7 nicht · S8 nicht |
| geist.gespraech | `karte2.mensch.geist.gespraech#2` | stadt-voll | 45 s | S1 best. · S2 leser · S3 leser · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht |
| geist.netz | `karte2.mensch.geist.netz#1` | stadt-voll | 45 s · mutiert | S1 leser · S2 auge · S3 nicht · S4 nicht · S5 nicht · S6 nicht |
| geist.generationen | `karte2.mensch.geist.generationen#1` | stadt-voll | 45 s | S1 zahl · S2 auge · S3 leser · S4 nicht · S5 nicht · S6 nicht · S7 nicht · S8 nicht |
| geist.absicht | `karte2.mensch.geist.absicht#1` | stadt-voll | 45 s | S1 leser · S2 leser · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht |
| geist.innenleben | `karte2.mensch.geist.innenleben#1` | stadt-voll | 50 s · mutiert | S1 auge · S2 leser · S3 auge · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht |
| menge.bevoelkerung | `karte2.mensch.menge.bevoelkerung#2` | stadt-voll | 45 s · mutiert | S1 best. · S2 zahl · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht · S8 nicht · S9 nicht |
| menge.bild | `karte2.mensch.menge.bild#2` | stadt-voll | 50 s · mutiert | S1 best. · S2 zahl · S3 auge · S4 nicht · S5 nicht · S6 nicht · S7 nicht·A |
| menge.dichte | `karte2.mensch.menge.dichte#2` | stadt-voll | 50 s · mutiert | S1 best. · S2 zahl · S3 zahl · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| menge.rhythmus | `karte2.mensch.menge.rhythmus#2` | stadt-voll | 50 s · mutiert | S1 best. · S2 zahl · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| menge.seuche | `karte2.mensch.menge.seuche#1` | stadt-voll | 45 s | S1 nicht·A · S2 leser · S3 nicht · S4 nicht · S5 nicht · S6 nicht |
| menge.kollektiv | `karte2.mensch.menge.kollektiv#2` | stadt-voll | 45 s · mutiert | S1 best. · S2 zahl · S3 leser · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| stadt.groesse | `karte2.mensch.stadt.groesse#1` | stadt-voll, dorf | 60 s · mutiert | S1 auge · S2 auge · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A · S7 nicht·A · S8 nicht |
| stadt.form | `karte2.mensch.stadt.form#2` | stadt-voll | 45 s · mutiert | S1 best. · S2 nicht·A · S3 best. · S4 nicht · S5 nicht·A · S6 auge · S7 nicht·A |
| stadt.vertikal | `karte2.mensch.stadt.vertikal#2` | hochhaus-dach | 45 s | S1 best. · S2 nicht · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht · S7 nicht · S8 nicht |
| stadt.breite | `karte2.mensch.stadt.breite#1` | stadt-voll | 45 s · mutiert | S1 auge · S2 nicht·A · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A · S7 nicht·A |
| stadt.siedlungsnetz | `karte2.mensch.stadt.siedlungsnetz#2` | stadt-voll | 45 s | S1 best. · S2 nicht·A · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht·A |
| stadt.habitat | `karte2.mensch.stadt.habitat#1` | stadt-voll | 45 s | S1 nicht · S2 nicht · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht · S7 nicht·A |
| stadt.messlatte | `karte2.mensch.stadt.messlatte#1` | stadt-voll | 60 s · mutiert | S1 auge · S2 auge · S3 nicht·A · S4 nicht·A · S5 nicht · S6 nicht·A · S7 nicht·A |
| netz.gestalt | `karte2.mensch.netz.gestalt#1` | stadt-voll | 45 s | S1 zahl · S2 nicht · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht · S7 nicht |
| netz.verkehr | `karte2.mensch.netz.verkehr#3` | stadt-voll | 45 s | S1 best. · S2 best. · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht·A · S8 nicht |
| netz.massenverkehr | `karte2.mensch.netz.massenverkehr#1` | stadt-voll | 45 s | S1 leser · S2 leser · S3 leser · S4 leser · S5 nicht·A · S6 leser · S7 nicht·A |
| netz.stoffwechsel | `karte2.mensch.netz.stoffwechsel#1` | stadt-voll | 45 s | S1 leser · S2 leser · S3 nicht·A · S4 leser · S5 nicht · S6 leser · S7 nicht |
| bau.bedarf | `karte2.mensch.bau.bedarf#1` | stadt-voll, dorf | 60 s | S1 auge · S2 unklar · S3 nicht·A · S4 nicht·A · S5 nicht · S6 nicht·A |
| bau.huelle | `karte2.mensch.bau.huelle#1` | stadt-voll, dorf | 60 s | S1 auge · S2 auge · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A |
| bau.innen | `karte2.mensch.bau.innen#3` | stadt-voll | 45 s | S1 best. · S2 best. · S3 auge · S4 nicht · S5 nicht·A · S6 nicht·A · S7 nicht·A |
| bau.bauen | `karte2.mensch.bau.bauen#2` | dorf | 60 s · mutiert | S1 best. · S2 leser · S3 zahl · S4 nicht·A · S5 nicht·A · S6 nicht |
| fahrzeug.medium | `karte2.mensch.fahrzeug.medium#2` | stadt-voll | 45 s | S1 best. · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 leser · S8 nicht |
| fahrzeug.form | `karte2.mensch.fahrzeug.form#1` | wiese | 60 s · mutiert | S1 zahl · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht·A |
| fahrzeug.gestalt | `karte2.mensch.fahrzeug.gestalt#1` | stadt-voll | 60 s · mutiert | S1 nicht·A · S2 auge · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A |
| fahrzeug.lenker | `karte2.mensch.fahrzeug.lenker#1` | stadt-voll | 60 s · mutiert | S1 zahl · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht |
| fahrzeug.maschine | `karte2.mensch.fahrzeug.maschine#1` | dorf | 45 s | S1 leser · S2 nicht · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht |
| nahrung.flur | `karte2.mensch.nahrung.flur#1` | dorf | 45 s · mutiert | S1 zahl · S2 nicht·A · S3 nicht·A · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht·A |
| nahrung.frucht | `karte2.mensch.nahrung.frucht#1` | dorf | 45 s · mutiert | S1 nicht·A · S2 nicht · S3 nicht·A · S4 nicht · S5 nicht · S6 nicht·A |
| nahrung.tier | `karte2.mensch.nahrung.tier#1` | dorf | 50 s · mutiert | S1 zahl · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| nahrung.erdbau | `karte2.mensch.nahrung.erdbau#2` | dorf | 45 s | S1 best. · S2 nicht · S3 nicht·A · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht |
| nahrung.strom | `karte2.mensch.nahrung.strom#1` | dorf | 40 s | S1 leser · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht |
| nahrung.hand | `karte2.mensch.nahrung.hand#1` | dorf | 50 s · mutiert | S1 zahl · S2 leser · S3 nicht·A · S4 nicht · S5 nicht · S6 nicht |
| nahrung.jenseits | `karte2.mensch.nahrung.jenseits#1` | dorf | 35 s | S1 nicht·A · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht |
| wirtschaft.stoffstrom | `karte2.mensch.wirtschaft.stoffstrom#1` | stadt-voll | 45 s · mutiert | S1 leser · S2 nicht · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht·A · S7 nicht |
| wirtschaft.beruf | `karte2.mensch.wirtschaft.beruf#2` | stadt-voll | 60 s · mutiert | S1 best. · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| wirtschaft.markt | `karte2.mensch.wirtschaft.markt#1` | stadt-voll | 35 s | S1 leser · S2 leser · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht |
| wirtschaft.handel | `karte2.mensch.wirtschaft.handel#1` | stadt-voll | 35 s | S1 leser · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht |
| wirtschaft.technik | `karte2.mensch.wirtschaft.technik#1` | stadt-voll | 35 s | S1 leser · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht·A |
| wirtschaft.energie | `karte2.mensch.wirtschaft.energie#1` | stadt-voll | 45 s · mutiert | S1 leser · S2 nicht · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht |
| macht.grenze | `karte2.mensch.macht.grenze#1` | stadt-voll | 45 s | S1 leser · S2 leser · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht · S7 nicht · S8 nicht |
| macht.wehrbau | `karte2.mensch.macht.wehrbau#2` | stadt-voll | 55 s | S1 best. · S2 zahl · S3 zahl · S4 nicht · S5 nicht · S6 nicht · S7 auge · S8 nicht |
| macht.stand | `karte2.mensch.macht.stand#1` | stadt-voll | 50 s | S1 auge · S2 auge · S3 unklar · S4 nicht · S5 nicht · S6 nicht·A |
| macht.recht | `karte2.mensch.macht.recht#1` | stadt-voll | 55 s · mutiert | S1 leser · S2 zahl · S3 leser · S4 leser · S5 nicht · S6 nicht · S7 nicht |
| macht.krieg | `karte2.mensch.macht.krieg#1` | stadt-voll | 30 s | S1 nicht · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht · S7 nicht · S8 nicht·A · S9 nicht |
| macht.megastadt | `karte2.mensch.macht.megastadt#1` | hochhaus-dach | 30 s | S1 leser · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht |
| kultur.sprache | `karte2.mensch.kultur.sprache#1` | stadt-voll | 30 s | S1 leser · S2 leser · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht · S7 nicht |
| kultur.schrift | `karte2.mensch.kultur.schrift#1` | stadt-voll | 45 s | S1 leser · S2 nicht · S3 leser · S4 nicht·A · S5 nicht·A · S6 leser |
| kultur.glaube | `karte2.mensch.kultur.glaube#1` | stadt-voll | 60 s · mutiert | S1 zahl · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 leser |
| kultur.gestalt | `karte2.mensch.kultur.gestalt#1` | stadt-voll | 45 s | S1 nicht·A · S2 nicht·A · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A · S7 nicht·A |
| kultur.diffusion | `karte2.mensch.kultur.diffusion#1` | stadt-voll | 45 s | S1 nicht · S2 nicht · S3 nicht·A · S4 nicht · S5 leser · S6 nicht |
| kultur.wissen | `karte2.mensch.kultur.wissen#1` | stadt-voll | 30 s | S1 leser · S2 nicht · S3 leser · S4 leser · S5 nicht · S6 nicht |
| kultur.verstaendigung | `karte2.mensch.kultur.verstaendigung#1` | stadt-voll | 45 s · mutiert | S1 zahl · S2 nicht·A · S3 leser · S4 leser · S5 leser · S6 leser |
| kultur.bildkunst | `karte2.mensch.kultur.bildkunst#1` | stadt-voll | 45 s | S1 leser · S2 nicht·A · S3 nicht·A · S4 leser · S5 nicht·A · S6 nicht · S7 nicht·A |
| kultur.erzaehlkunst | `karte2.mensch.kultur.erzaehlkunst#1` | stadt-voll | 45 s | S1 leser · S2 leser · S3 nicht·A · S4 nicht · S5 nicht · S6 nicht · S7 nicht·A |
| kultur.strassenleben | `karte2.mensch.kultur.strassenleben#1` | stadt-voll | 45 s | S1 nicht · S2 leser · S3 leser · S4 nicht·A · S5 nicht · S6 nicht·A · S7 nicht·A |
| zeit.spanne | `karte2.mensch.zeit.spanne#1` | genesis | 60 s · mutiert | S1 auge · S2 nicht·A · S3 nicht·A · S4 nicht·A · S5 nicht·A · S6 nicht·A · S7 nicht·A |
| zeit.palimpsest | `karte2.mensch.zeit.palimpsest#2` | wiese | 45 s | S1 best. · S2 zahl · S3 zahl · S4 zahl · S5 nicht · S6 nicht · S7 nicht·A · S8 nicht |
| zeit.kausal | `karte2.mensch.zeit.kausal#2` | wiese | 60 s | S1 best. · S2 zahl · S3 leser · S4 leser · S5 leser · S6 nicht |
| zeit.erleben | `karte2.mensch.zeit.erleben#2` | dorf | 45 s · mutiert | S1 best. · S2 auge · S3 nicht · S4 leser · S5 nicht · S6 nicht·A |
| zeit.erde | `karte2.mensch.zeit.erde#1` | wiese | 30 s | S1 nicht·A · S2 nicht · S3 nicht·A · S4 nicht · S5 nicht·A · S6 nicht·A |
| zukunft.technik | `karte2.mensch.zukunft.technik#1` | stadt-voll | 45 s | S1 nicht·A · S2 nicht·A · S3 nicht · S4 nicht·A · S5 nicht · S6 nicht·A · S7 nicht·A |
| zukunft.medien | `karte2.mensch.zukunft.medien#1` | stadt-voll | 45 s | S1 nicht · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht·A · S6 nicht · S7 nicht·A |
| zukunft.maschinenwesen | `karte2.mensch.zukunft.maschinenwesen#1` | stadt-voll | 45 s | S1 nicht·A · S2 nicht·A · S3 nicht · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht·A |
| zukunft.leib | `karte2.mensch.zukunft.leib#1` | stadt-voll | 45 s | S1 nicht · S2 nicht · S3 nicht · S4 nicht · S5 nicht · S6 nicht·A · S7 nicht·A |
