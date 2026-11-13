# C — Stadt und Verkehr: warum die Stadt gleich aussieht (Lese-Arbeiter, 13.11.)

Stand: Code an 1e00bfdb (leib-kanon-urteil), origin/main a41ce72d, koordination 323a5274. Nur gelesen.

## 1. Was die Welt an main für Dorf und Stadt wirklich baut

| Stück | Gesetz (Datei:Zeile) | Konsum in der Welt? | Beleg |
|---|---|---|---|
| Ankunft = Prüfplatz (Genesis-Ort) | fachwerk-core.js:9587–9680 `GENESIS_ORT` (Rondell, 10 Tore, Mall, Teich, Zoo, `viertel` = Start-Dorf r 190, hausR 60) | ja, Spielpfad | stamm/siedlung-ort.js:2072 `_tickGenesisOrt` |
| Stadt um den Platz | — keine Zeile in `GENESIS_ORT` | **fehlt ganz**; die Stadt steht nur am Messort per Wort („dorf 7 300“) | fachwerk-core.js:9648 nennt nur `viertel` (Dorf) |
| Verkehr im Dorf | fachwerk-core.js:4037 „ein Dorf fährt nicht“; :4065 `N = staedtisch ? ceil(Häuser/15) : 0` | im Dorf der Ankunft **0 Wagen** | dito |
| Straßen | Plan `plan.roads`; gemalt in die Wege-Karte stamm/siedlung-wege.js:1447–1471 (`strasse`, Kanal+Wert des Belags) | ja, als **Boden-Farbe**, kein Körper | Bilder unten |
| Belag Erde→Pflaster | fachwerk-core.js:8529 `gassenBelag` (BELAG_GESETZ nach Rang×Reife) | ja, seit w28-stadt-boden (11.11.) | stamm/siedlung-wege.js:1435–1440 |
| Bürgersteig | fachwerk-core.js:8533 `gassenBreite = w + 2·DORF_NORM.gehweg` (1,2 m, :3313); stamm/siedlung-wege.js:563–565 malt den `saum` **mit demselben Belag** | nur als breiterer gleicher Pflaster-Streifen — **kein Bordstein, keine Höhe, kein eigener Stoff** | Bordstein-Körper existiert nur im Labor: worlds/fachwerk/fachwerk.js:303–310 (BORDSTEIN-GLIEDER-GESETZ); im stamm kein Leser (Grep „Bordstein“: nur Kommentare) |
| Gehweg als Gang-Gesetz | stamm/siedlung-bewohner.js:2051–2058 (`gehwegM` 3, :3461), siedlung-verkehr.js:159–187 | ja, die Bewohner gehen am Rand der Trasse — unsichtbar als Fläche | — |
| Platz, Vorplätze, Äcker | stamm/siedlung-wege.js:1412–1415 (Kappe 900 fiel), 1478–1489 | ja, seit w28-stadt-grund (12.11.) | Bild grammatik 22872718 |
| Häuser/Fassade | fachwerk-core.js (RAHMEN, fensterAt …) am main-Stand | ja, alter Stand; Öffnungs-Gesetz liegt in w28-fassade | Bilder: glatte Wände, Fenster als dunkle Platten |
| Wagen mit Fahrer | fachwerk-core.js:4035–4067 `VERKEHR_GESETZ`/`verkehrVon`; stamm/siedlung-verkehr.js:329–421 (Tag-/Nachtfahrer je Wagen), siedlung-instanz.js:1214 | **ja**, in städtischer Siedlung (stadt-voll ≈ 21 Wagen) | Bild w28-verkehr-bild 71bb1587-stadt.png: gelber Wagen auf Pflaster |
| Station C | scripts/diag-fahr-leben.cjs:836–846, :2691 VK (10 und 23 Uhr, 10 min Spielzeit, 0 Berührung, Ziel, Sim-Takt) | an main GRÜN, aber knapp (FUND-REGISTER Z. 184: zwei Wagen mit 423/496 m Fußweg) | z397 rot am Zweig: Sim-Takt 2,52 > 1,9 |

**Was man sieht** (selbst angesehen):
- `probe-post/w28-stadt-grammatik/22872718-dorf-0.5.png` (13.11.): Dorf, ein Erd-Weg als braune Boden-Textur ohne Kante; dazu weiße Putzhäuser und Gras am Rand. Keine Wagen.
- `…/22872718-stadt-voll-0.5-rot.png` (13.11., Zweig): ein Kopfstein-Platz von Wand zu Wand, Marktstände, viele Bewohner, eine Laterne. Keine Fahrbahn, kein Bordstein, keine Wagen im Bild.
- `probe-post/w28-stadt-boden/65655605-stadt-voll-0.5.png` (11.11., gelandet): Erde und kniehohes Gras zwischen den Häusern. Erst w28-stadt-grund (12.11.) hat das geschlossen.
- `probe-post/w28-verkehr-bild/71bb1587-stadt.png` (12.11., gelandet): eine Pflaster-Gasse als gemalter Boden, Gras bis an den Rand, ein gelber Wagen. Kein Gehweg, keine Markierung.

## 2. Geschichte seit 25.10. (gelandet = „Merge X in integ-probe“ auf main first-parent)

| Zweig | begonnen | gelandet / liegt | woran |
|---|---|---|---|
| pflicht-verkehr (Eintrag C) | 25.10. | gelandet 25.10. 20:24 (8da18e00) | nur Doku |
| e-stadt-gipfel | 26.10. 00:09 | liegt, 5 Commits vorn, Kopf edfa23cd 26.10. | Messbühne; `gipfel-blick` steht in spec/profiband/haushalt.json |
| stadt-takt, siedlung-k3-trasse (26.10.), w3u-stadt-leben, stadt-takt-bewohner (29.10.) | — | gelandet | CPU-Takt, Trasse am Hang, Leben |
| spike-stadt-koerper | 28.10. 23:13 | liegt (3 vorn, 593c3bbd) | Spike, nie abgegeben zum Zug |
| **w4-stadt-orte** | **30.10. 03:40** | **liegt, 4 vorn, Kopf 4b958d88 30.10. 08:24** | 2 Abgaben (f9922b87, 4b958d88): Straßen-Rang, Quartiere, Rundkurs. „Rundkurs“ steht 0× in main, 22× im Zweig. Warum er nie fuhr, weiß ich nicht. |
| w3w-verkehr, w4-verkehr-kosten (30.10.), w4-stadt-takt2 (31.10.), w4-verkehr-c3 (01.11.), w4-genesis-ort-wirt11, w4-stadt-gehen (02.11.) | — | gelandet | erster Verkehr, Kosten, Takt, Prüfplatz-Wirt, Gehen |
| w12-verkehr, w13-verkehr-heil, w23-verkehr | 05.–08.11. | gelandet 08.11. (7b594f78, 4ba7130d über heim2) | Richter VK, Enge der Wende |
| w25-stadt-takt(-2), w26-stadt-takt-4b | 08.–09.11. | gelandet 08./09.11. | CPU-Takt der Stadt |
| w27-stadt-bild | 09.11. 21:15 | liegt, 1 vorn (e9ac6f9b) | nur Probe (werkbank, haushalt), 1 Abgabe |
| w27-ort-pose / -voll | 10.11. | gelandet 10.11. 19:54 / 11.11. 14:05 | Messort-Pose |
| w28-verkehr-takt, w28-stadt-boden | — | gelandet 11.11. 20:31 / 21:09 | Stunde ohne Vorgeschichte; Belag-Gesetz: Pflaster statt Erde |
| w27-verkehr-leib | — | gelandet 11.11. 23:16 (z395) | EIN Verkehrs-Gesetz, Leib-Halt |
| w28-stadt-grund | — | gelandet 12.11. 05:33 | jede Form des Plans gemalt |
| w28-verkehr-graph | — | gelandet 12.11. 10:23 | Zahlen aus EINER Quelle |
| w28-verkehr-bild (e57d9b19 → 71bb1587) | — | gelandet 12.11. 12:32 | Pose „trasse“ zeigt den Wagen |
| **w28-stadt-grammatik** | **10.11. 23:48** (6f4116ea) | **liegt, 61 vorn / 7 hinten, Kopf 22872718 13.11. 15:32** | siehe nächste Tabelle |
| **w28-fassade** | 10.11. 23:48 (Basis grammatik) | liegt, Kopf b038852b 12.11. 14:19, **kein Abgabe-Commit** | Koordinator-Entscheid 12.11.: steht auf grammatik 204b9c8e und wartet, bis grammatik landet; geerbt ROT: O-Akt Gassen-Licht 2 < 4, Datei-Decke kreatur-proben 4003 |

**w28-stadt-grammatik, jede Abgabe** (cloud-post/w28-stadt-grammatik.md, Zug-Log):

| Kopf | Zeit | Urteil |
|---|---|---|
| 5c02b421 / b61450be (WIP-Proben) | 11.11. 05:44 / 06:18 | GPU ROT stadt-voll |
| adeeb1c3 | 11.11. 19:55 | GPU ROT bild:stadt (OMEN) |
| 3733677a | 11.11. 20:31 | GPU ROT bild:stadt (Radeon) |
| 66a4c85b | 11.11. 20:43 | GPU ROT stadt + stadt-voll |
| 4073fb2f | 11.11. 20:59 | GPU GRÜN (Radeon, 23:04); z395 23:09 „BÜNDEL KONFLIKT“ |
| 0698fb92 | 12.11. 00:50 | GPU GRÜN → **z397 fährt 01:26, ROT 02:13**: K6 Kamera-Leib am Prüfplatz; VK Sim-Takt 2,52 > 1,9; VK-V Stunde mit Vorgeschichte |
| 8bd897de | 13.11. 03:42 | Code-Check ROT: Tab-Tod, K13 Hieb, VK Wagen an Wagen, D9 Dorf |
| 22872718 | 13.11. 15:32 | GPU GRÜN (bekannt-rot stadt-voll.leib), Code-Check ROT voll 14/18 Mehrspieler-Wand. FUND Z. 236: Täter am Zweig (Kopf 3/3 ROT, main 2/2 GRÜN), Bisektion ab 16:35 |

Dazu 3 Linsen-Funde aus dem Zweig (FUND Z. 188–190, 213, 230): W9 Plan kippt 2 von 6 Läufen; Exit 139 der OMEN siebenmal; die Wende am Torplatz bekommt eine Enge.

## 3. PFLICHT-OFFEN C und F (wörtlich: docs/PFLICHT-OFFEN.md, Zeilen „C)“ und „F)“)

**C)** „DER VERKEHR — Wagen mit Bewohnern am Steuer fahren auf den Trassen der Stadt (das Fahr-Gesetz der Welt und das Bewohner-Netz, EIN Leib am Steuer), weichen einander, Fußgängern und Bauten aus und tragen die Last der belebten Stadt; begonnen wird nach der Messbühne Stadt-Gipfel (…). KRITERIUM: C fällt, wenn in der Stadt nH 300 bei Tag und bei Nacht mindestens 20 Wagen mit Bewohnern am Steuer 10 min lang auf den Trassen fahren — 0 Berührungen mit Leibern, Bauten und anderen Wagen, jeder Wagen erreicht sein Ziel — und dabei das Profi-Band (E) an beiden Messplätzen in Ego und Third hält.“
- Im Spiel: der mechanische Teil fährt an main (VK GRÜN, diag-fahr-leben.cjs:836; ≈ 21 Wagen bei 309 Häusern). Grob 70 % — das ist meine Schätzung, kein Messwert. Die Statuszeile in PFLICHT-OFFEN („heute misst keine Station einen Wagen …“) ist **veraltet**.
- Offen:
  - das E-Band mit fahrendem Verkehr an Radeon und GTX in Ego und Third: einen Beleg dafür habe ich nicht gefunden (weiß ich nicht);
  - VK ist knapp grün: zwei Fahrer haben 423 bzw. 496 m Fußweg (FUND Z. 184).
  - Den Verkehr sieht der Spieler nur in einer Stadt, und am Spawn steht keine.

**F)** „DER PRÜFPLATZ — … EIN Plan im Ort-Gesetz des Fachwerks, jedes Element aus dem Gesetzbuch seines Studios — das Kopfstein-Rondell mit zehn Toren …, Park und Teich, Wald, der Zoo mit fester Zahl, der Spielplatz mit Familien, die Arena in der Welt, die Rennstrecke mit Kurven und Sprüngen und darum die Stadt. … KRITERIUM: F fällt, wenn jede Zone im Spielpfad benutzt wird — das Kind schaukelt …, die Arena antwortet dem Treffer …, ein Wagen fährt die Runde in 55–65 s mit 18–22 m Flug am Kicker, vier Wagen mit Bewohnern am Steuer fahren 10 Runden ohne Berührung, die Silhouette der Stadt steht vom Platz aus —, jede Zone an ihrer Station das Profi-Band (E) … hält und die Kalt-Zeile (B) dabei nicht langsamer wird.“
- Im Spiel (fachwerk-core.js:9587–9680): Rondell, 10 Tore, Mall, Teich, Wald-Gürtel, Zoo (Wolf n 3) und Spielplatz-Fläche mit Geräten (:6539–6556).
- Nur als leere Fläche: die Arena (:9653–9655 „bleibt Fläche“).
- **Fehlt ganz**: Rennstrecke und Kicker (keine Zeile; Tor k 8 garage ohne Weg-Ziel, :9677), die Stadt um den Platz und die vier Wagen auf der Runde.
- Ob das Kind schaukelt, weiß ich nicht. Grob 45 % der Zonen stehen (Schätzung nach Zonen: 4,5 von 10), gemessen ist davon nichts.

## 4. Die Kette bis „Stadt mit Straßen, Bürgersteigen, Wagen mit Bewohnern, im Spiel“

| # | Stück | Lage |
|---|---|---|
| 1 | Täter der Mehrspieler-Wand am Zweig finden | w28-stadt-grammatik 22872718, Bisektion seit 13.11. 16:35 (FUND Z. 236) |
| 2 | Stadt-Grammatik landen (Viertel, 19 Bau-Typen, Gehweg-Raum 1,8 m `gehwegFahrM`, Torplatz) | gebaut in w28-stadt-grammatik; hängt an 1, danach VK Sim-Takt ≤ 1,9 und K6 (z397) |
| 3 | Fassade landen (Öffnung, Gliederung, Ton) | gebaut in w28-fassade b038852b, ~70–85 % laut eigener Zeile; hängt an 2, braucht main-Mischung und einen Abgabe-Commit |
| 4 | Bürgersteig als Körper: Bordstein, Stufe, eigener Belag, Fahrbahn-Markierung im Welt-Boden | **fehlt ganz** in der Welt und in jedem Zweig. Die Welt malt Gehweg = Fahrbahn-Pflaster (siedlung-wege.js:565). Ein Bordstein steht nur im Labor (fachwerk.js:303–310): Studio ≠ Welt |
| 5 | Die Stadt dahin, wo der Spieler ist (F: „darum die Stadt“, Silhouette vom Platz) | **fehlt ganz**: `GENESIS_ORT` trägt nur das Start-Dorf, und ein Dorf fährt nicht (fachwerk-core.js:4037) |
| 6 | E-Band mit Verkehr an beiden Geräten, Ego und Third → C fällt | ungemessen (weiß ich nicht); hängt an 2 |
| 7 | Strecke mit Kicker plus 4 Wagen auf der Runde (F) | fehlt ganz |
| — | w4-stadt-orte (Straßen-Rang, Quartiere, Rundkurs) | liegt seit 30.10., Kopf 4b958d88, 2804 Commits hinter main; ob 2 ihn ersetzt, weiß ich nicht |

## 5. Die Zahl

- Ältestes nicht gelandetes Stadt-Stück: **w4-stadt-orte**, begonnen 30.10. 03:40, liegt also **14 Tage**, hinter sich **2 Abgaben**, keine Zugfahrt im Log.
- Ältestes Stück in der laufenden Linie: **w28-stadt-grammatik**, begonnen 10.11. 23:48, liegt **2,7 Tage**, hinter sich **6 Abgabe-Commits**, 13 geprobte Köpfe und **1 Zugfahrt** (z397, ROT). w28-fassade hängt seit 12.11. 14:19 daran.

## Der kürzeste Weg (meine Lesart, keine Messung)
1. Die Stadt, die der Schöpfer sieht, ist die Ankunft, und die Ankunft ist ein Dorf ohne Wagen. Was seit dem 10.11. gelandet ist (Belag, Grund, Verkehrs-Pose), zeigt sich nur am Messort per Wort.
2. Den Bürgersteig baut keiner: das Gesetz malt ihn als gleiche Farbe wie die Fahrbahn. Das braucht einen Schnitt am EINEN Maler (siedlung-wege.js:563–565) samt Körper aus dem Labor-Gesetz (fachwerk.js:310).
3. Reihenfolge: grammatik heilen und landen, dann fassade, dann Bordstein und Stoff, dann die Stadt an den Platz (F).
