# Ernte-Liste Meisterkarte 2 — Gruppe mensch (84 Leitern)

Nur gelesen: kein Code, keine GPU, kein Lauf. Quellen: `quelle/gruppe-mensch.json`, `quelle/stationen/g1.js g2.js g5.js`, `quelle/stand.json`,
der Klon `C:\Users\micha\AnazhRealm-profiband` (Arbeitsbaum 2b826a89). Zeilen der Stationen beziehen sich auf `quelle/stationen/`.

## 1) Zählung (103 geprüfte Sprossen: 84 × S1, dazu 18 × S2 und 1 × S3, wo die Sprosse davor heute wahr ist oder T trägt)

| T | N(S) | N(M) | N(L) | F | P | unklar |
|---|---|---|---|---|---|---|
| 6 (2 bestehend, 4 neu) | 4 | 10 | 0 | 55 | 20 | 8 |

Lesart: **T** = eine Station misst die Größe mit gleicher oder strengerer Schwelle im echten Fenster; **N(S)** = die Zahl steht schon in der
Ausgabe einer bestehenden GPU-Probe oder es fehlt nur die Schwelle, das Urteil braucht ≤ 40 Zeilen; **N(M)** = die Zahl druckt heute nur ein
headless-diag oder eine Stichprobe, es braucht eine neue Probe an einem Ort; **unklar** = es fehlt ein Beleg, ob das Spiel den Richter heute
erfüllt. „Stichprobe" heißt: belegt an 1 Same, 1 Bewohner oder 1 Gang, der Umfang der Sprosse ist nie gezählt.

## 2) Tabelle

| leiter | sprosse | urteil | klasse | station oder probe | beleg (Datei:Zeile) | aufwand |
|---|---|---|---|---|---|---|
| leib.verschieden | 1 | P | — | „Prüfer findet 0 gleiche Paare" | Karte | — |
| leib.gesicht | 1 | N | Ort | mensch.K4#1 (Soll-Tafel mensch-kopf an der Third-Kamera des Spiels) an 10 Welt-Samen statt an 1 fahren; Stichprobe 1/10 GRÜN (Radeon 63655917), GTX ungemessen | g2.js:5635–5675; stand.json mensch.K4#1; Gesicht aus dem Genom koerper-core.js:4935 | M |
| leib.gesicht | 2 | P | — | „Prüfer ‚lebt' ≥ 50 %" | Karte | — |
| leib.tracht | 1 | P | — | „Prüfer ordnet Epoche" | Karte | — |
| leib.stoff | 1 | N | Ort | Tuch-Durchdringung der Probe haar.K4#2 (headless, Durchdringung 0 im Gang) in einer GPU-Probe an 16 Posen × 10 Samen zählen; Stichprobe 1 Same im Gang | g2.js:3034, 5885; Leser im Spiel stamm/koerper-fahrt.js:137–153; stand.json haar.K4#2 | M |
| leib.stoff | 2 | unklar | — | der Verzug des Saums ist nie gemessen, nur Durchdringung 0 im Gang | g2.js:3310 | — |
| leib.ausdruck | 1 | P | — | „Prüfer errät Akt/Gemüt" | Karte | — |
| leib.spur | 1 | P | — | „Prüfer-Altersschätzung" | Karte | — |
| sport.regeln | 1 | F | — | es gibt kein Wettkampf-Spiel mit Sieger, der Ball hängt nur am Seil im Prüfstand | Karte: schmiede-core.js:4627 | — |
| sport.koerper | 1 | unklar | — | leib.K2#2 misst den Sprung-Hub unter Masse und Kraft ×1,25, aber kein Tempo und keinen Eichwert ±10 %; gegen die Eichung 0,53 m liegt der Hub 0,323–0,369 m 30–39 % darunter (F), gegen das Band sprungHoehe [0,25; 0,6] wäre er wahr | g5.js:4254–4262; koerper-core.js:503, 7750; stand.json leib.K2#2 | — |
| sport.koennen | 1 | F | — | das Tempo folgt nur der Größe, der Sprint hat einen festen Faktor 4,5, also streut die 100-m-Zeit nicht 10–20 % | koerper-core.js:510; Karte | — |
| sport.mannschaft | 1 | F | — | es gibt keinen Zweikampf zweier Bewohner | Karte | — |
| sport.arena | 1 | F | — | es gibt 0 Zuschauer | Karte | — |
| sport.kunst | 1 | P | — | „Blindtest Anfänger ↔ Meister" | Karte | — |
| sport.geistspiel | 1 | F | — | es gibt kein Brettspiel (Grep leer) | Karte | — |
| sport.medium | 1 | F | — | es gibt keine Abfahrt auf Schnee, Schnee sinkt nur headless ein | Karte | — |
| geist.tag | 1 | N | Ort | mensch.K2#2 misst Soll-Orte ≥ 0,9 über 24 h im echten Fenster. Die Zeile derselben Probe trägt `schmiede10`/`schmiede2`, das Urteil liest sie nicht: 2 Zeilen dazu | g2.js:5226–5233; scripts/lib/kreatur-mensch.cjs:561, 814; Preis am Dorfplatz Radeon ≈ 37 ms ROT | S |
| geist.tag | 2 | F | — | TAGES_GESETZ trägt 6 Akte, die Sprosse verlangt ≥ 12 Akte und Wochentage | Karte: koerper-core.js:4919 | — |
| geist.gespraech | 1 | N | Ort | die Probe begegnung (mensch.K5#1: Zuwendung ≤ 0,5 s, Berührung 0) über ≥ 100 Bewohner statt über einen; Stichprobe 1 Bewohner GRÜN (Radeon) | g2.js:5506–5553; stand.json mensch.K5#1 | M |
| geist.gespraech | 2 | F | — | die Bewohner sprechen nicht, das lokale Modell lädt nicht | Karte: stamm/feld-nexus.js:1281 | — |
| geist.netz | 1 | F | — | die Bewohner eines Hauses haben keine Bindung | Karte | — |
| geist.generationen | 1 | F | — | der Leib kennt nur 18–80 Jahre, es gibt keine Kinder | Karte: koerper-core.js:120 | — |
| geist.absicht | 1 | F | — | es gibt keine Charakterzüge, die das Handeln ändern | Karte | — |
| geist.innenleben | 1 | P | — | „Panel nennt das Gefühl" | Karte | — |
| menge.bevoelkerung | 1 | N | Ort | 20 Stichproben Ort × Uhr: die Körper im Frustum (Zähler `platzAcht`) gegen den Soll-Plan (Treffer aus der Probe bewohner); heute misst mensch.K1#1 nur die Quote 1 ±0,05 und EIN Bild | g2.js:1616–1640, 4100–4110; g2.js:5231 | M |
| menge.bevoelkerung | 2 | unklar | — | die Stadt-Probe (mensch.K1 Staffel 2) riss den Deckel bei jeder GPU-Fahrt, „Wohnort ≠ Arbeitsort" ist an 20 Personen nie gezählt | g2.js:4140 | — |
| menge.bild | 1 | F | — | am Dorfplatz um 8 Uhr sind 18 Menschen im Bild, aber 0 gehen; mensch.K1#1 druckt `gehendImBild`, das Urteil liest es nicht | g2.js:4116; Karte | — |
| menge.dichte | 1 | **T** | Ort | mensch.K5#1: Berührung 0 Takte und kleinster Abstand > 0,7 m (zwei Kapseln, Radius 0,35 m), Spieler und Bewohner als Paar, dreimal durch seinen Stand, im echten Fenster. Die Pose ist das Start-Dorf, nicht die Gasse | g2.js:5553; Radius koerper-core.js:5024 (LEIB.kapsel radiusM 0,35); stand.json Radeon GRÜN 4ee205bd, GTX ungemessen | — |
| menge.dichte | 2 | F | — | es gibt keinen Gegenstrom-Korridor mit 10² Leibern, höchstens `nahLeiber` leben als Leib | stamm/siedlung-bewohner.js:1628–1631 | — |
| menge.rhythmus | 1 | **T** | Ort | mensch.K2#2: Wege je Bewohner und Tag in [4; 10] (außer 0), Wiederkehr nach 1 h maxM ≤ 2 m, im echten Fenster, beide Geräte GRÜN. Strenger: dazu Soll-Orte und Plan bit-gleich | g2.js:5232–5233; stand.json mensch.K2#2 (Radeon 4–8, max 1,826 m; GTX 5–8, max 1,204 m) | — |
| menge.rhythmus | 2 | unklar | — | die Ganglinie je Stunde ist nie gezählt, und 10³ Wege/h verlangen Stadt-Bewohner, deren Probe den Deckel riss | g2.js:4140 | — |
| menge.seuche | 1 | F | — | es gibt kein Krankheits-Gesetz (Grep leer) | Karte | — |
| menge.kollektiv | 1 | **T** | Ort | mensch.K5#1: der kleinste Abstand im vierten Gang (nach der Gewalt) liegt ≥ 0,3 m über dem zweiten, die Gegenprobe ±0,15 m, im echten Fenster. Strenger als „> vorher". Der Umfang ist 1 Umstehender, die Karte sagt „Umstehende" | g2.js:5554; stand.json 1,44 → 1,834 m Radeon | — |
| menge.kollektiv | 2 | F | — | die Furcht weitet nur den Raum des Einzelnen um den Spieler, es gibt keine Schreck-Front | stamm/siedlung-bewohner.js:1894–1900 | — |
| stadt.groesse | 1 | P | — | „Panel-2AFC ≤ 90 %" | Karte | — |
| stadt.form | 1 | unklar | — | die Kern-Verdichtung steht im Code, aber das Wand-Verhältnis Kern ↔ Rand ist nie gezählt | Karte: fachwerk-core.js:4632 | — |
| stadt.vertikal | 1 | N | Ort | eine Stadt der Epoche moderne setzen (Chat-Akt „dorf 7 300 moderne", Markbau hochhaus 7 Geschosse), das höchste Gebäude im Bild messen, begehbare Ebenen = 1 | fachwerk-core.js:1987, 3303; stamm/feld-leben.js:1177; stand.json siedlung.K4#1 („1935 stadt mit Turm") | M |
| stadt.vertikal | 2 | F | — | der höchste Typ hat 7 Geschosse, weit unter 100 m | fachwerk-core.js:1987 | — |
| stadt.breite | 1 | P | — | „Region erkannt ≥ 50 %" | Karte | — |
| stadt.siedlungsnetz | 1 | N | **Stadt** | siedlung.K2#1 urteilt „binnen 2 km in ≥ 6/8 Saaten", siedlung.K2#2 urteilt das Zipf-KI ⊂ [0,8; 1,2], beides in EINEM Lauf (SIEDLUNG_SITZUNG). Keine Station trägt beide Hälften: das Urteil von #2 liest den Z1-Regex von #1 mit (2 Zeilen). Der Preis Stadt verlangt Ankunft kalt ≤ 5 s (PFLICHT B, GTX 16,6 s) | g5.js:1231–1246, 3636, 3695; stand.json siedlung.K2 7/8, ζ 1,022 [0,956; 1,158] beide Geräte | S |
| stadt.siedlungsnetz | 2 | P | — | „Nachtbild gegen Satellitenbild: Verwechslung" | Karte | — |
| stadt.habitat | 1 | F | — | jede Siedlung steht auf der Oberfläche | Karte | — |
| stadt.messlatte | 1 | P | — | „Blindpaar gegen Vergleichstitel" | Karte | — |
| netz.gestalt | 1 | unklar | — | das Gefälle p95 ≤ 9,5 % ist nur headless (siedlung.K3#1), fahrzeug.K2#1 fährt 2,4 km auf dem Weg, aber nicht jede der 4 Klassen | stand.json siedlung.K3#1, fahrzeug.K2#1 | — |
| netz.verkehr | 1 | F | — | 0 Steckenbleiber stimmt (fahrzeug.K2#1), aber das Bild p95 in der Fahrt reißt: Radeon 92 % > 33 ms, GTX 35,4 ms bei 36 km/h | stand.json profiband.K4#1, fahrzeug.K2#1 | — |
| netz.massenverkehr | 1 | F | — | es gibt keine Schiene (Grep 0) | Karte | — |
| netz.stoffwechsel | 1 | F | — | hinter Laternen und Brunnen fließt nichts | Karte | — |
| bau.bedarf | 1 | P | — | „blind nach Funktion" | Karte | — |
| bau.huelle | 1 | P | — | „Paarvergleich ‚Foto' ≥ 5 %" | Karte | — |
| bau.innen | 1 | N | Ort | die Probe von siedlung.K1#2 geht schon jedes Haus des Start-Dorfs per Sim-Schritt bis Keller und Dachboden. Ein eigenes Urteil „≥ 1 Haus ganz, Hub ≤ 0,3 m" ohne die Innen-Licht-Quote; headless 1 von 8 Gängen ganz, Hub max 0,20 m | g5.js:3807; g5.js:3736–3760 (siedlung.K1#1); stand.json siedlung.K1#1 | S |
| bau.innen | 2 | **T** | Ort | siedlung.K1#2: jedes Haus des Start-Dorfs ganz (Hub ≤ 0,3 m) UND innen lesbar (Luma ≥ 0,15 des Außen-Schattens), beide Geräte, im echten Fenster. Heute vermutlich ROT: Median der Quote 0,098 nach dem Kommentar der Station | g5.js:3777–3823 (Kommentar g5.js:3790 ff.) | — |
| bau.bauen | 1 | F | — | Labor ↔ Welt 0,788 (studios.K4), es gibt also einen Unterschied | Karte; stand.json studios.K4 ROT | — |
| fahrzeug.medium | 1 | F | — | der Bremsweg stimmt headless (1,63× / nass 1,48–1,72×), aber das Bild in der Fahrt liegt über 33 ms | stand.json fahrzeug.K1#2, profiband.K4#1 | — |
| fahrzeug.form | 1 | unklar | — | ob das Tempo des Werkstatt-Wagens aus seiner Masse folgt, ist nie gemessen | Karte: stamm/koerper-fahrt.js:550 | — |
| fahrzeug.gestalt | 1 | P | — | „≥ 90 % erkannt" | Karte | — |
| fahrzeug.lenker | 1 | F | — | kein Bewohner fährt (PFLICHT C offen) | Karte | — |
| fahrzeug.maschine | 1 | F | — | die Haspel ist eine Gestalt ohne Wirkung | Karte: fachwerk-core.js:5314 | — |
| nahrung.flur | 1 | N | Ort | Acker-Pixel (Kanal G der verankerten Boden-Karte, dieselben Bytes sind GPU-Textur) im Ausgabe-Bild vom Dorfrand zählen, ≥ 1 Fläche | stamm/siedlung-wege.js:4–10, 1621 | M |
| nahrung.flur | 2 | P | — | „Blindurteil ≤ 65 %" | Karte | — |
| nahrung.frucht | 1 | F | — | in der Welt gibt es keine Kulturpflanze | Karte | — |
| nahrung.tier | 1 | N | Ort | oekologie.K5#1 (headless: gebunden 600 s, Abstand p95 4,91 m, Hang > 15° 300 s) als GPU-Probe in der Sitzung | g2.js:5016; stand.json oekologie.K5#1 | M |
| nahrung.tier | 2 | F | — | die Bewohner jagen und fischen nicht, die Herde ist wild | Karte | — |
| nahrung.erdbau | 1 | **T** (bestehend) | Ort | gelaende.K2#1, gefüllt ≤ 2000 ms, beide Geräte GRÜN | g1.js:1693, 3821–3824 | — |
| nahrung.erdbau | 2 | F | — | die Bewohner bauen keine Gräben | Karte | — |
| nahrung.strom | 1 | F | — | nichts wird geerntet, niemand isst | Karte | — |
| nahrung.hand | 1 | N | Ort | stoffe.K5#1 (headless: jede Pflanze der Nah-Streu gepflückt, 1 Spieljahr, 138 von 138 wieder gezeichnet) als GPU-Probe; diag-stand-takt hat keinen Werkbank-Modus | g1.js:3416–3440; stand.json stoffe.K5#1 | M |
| nahrung.hand | 2 | F | — | es gibt kein Pflug-Verb, nur das Studio zeichnet Furchen | Karte: worlds/fachwerk/fachwerk.js:361 | — |
| nahrung.jenseits | 1 | F | — | nichts | Karte | — |
| wirtschaft.stoffstrom | 1 | F | — | in der Welt hat keine Ware eine Herkunft | Karte | — |
| wirtschaft.beruf | 1 | N | Ort | dieselbe Zeile `schmiede10/2` der Probe bewohner (mensch.K2#2), eigenes Urteil. R9-Konflikt: die Größe steht auch im Richter von geist.tag S1, eine von beiden braucht einen eigenen Lauf | scripts/lib/kreatur-mensch.cjs:561, 814; g2.js:5209 | S |
| wirtschaft.beruf | 2 | P | — | „Beruf aus 1 Bild benannt" | Karte | — |
| wirtschaft.markt | 1 | F | — | es gibt kein Geld, keinen Preis, keinen Tausch | Karte | — |
| wirtschaft.handel | 1 | F | — | die Wagen fahren ohne Ladung | Karte | — |
| wirtschaft.technik | 1 | F | — | die Epochen-Tafel ist eine Liste ohne Voraussetzungen | Karte: fachwerk-core.js:3294 | — |
| wirtschaft.energie | 1 | F | — | es gibt keine Energie-Größe | Karte | — |
| macht.grenze | 1 | F | — | es gibt kein Gemeinwesen und keine Grenze | Karte | — |
| macht.wehrbau | 1 | unklar | — | siedlung.K2#2 schießt die Mauer mittags und in der Dämmerung, aber „geschlossen" und „kein Schwebe-Spalt" sind nie gerichtet | g5.js:3675–3700 | — |
| macht.stand | 1 | P | — | „arm/reich erkannt" (dazu F: die Rollen haben keinen Stand) | Karte | — |
| macht.recht | 1 | F | — | die Wächter reagieren auf nichts | Karte | — |
| macht.krieg | 1 | F | — | der Hieb trifft den Leib (halten.K1#2), aber es kämpfen keine zwei Bewaffneten | Karte; stand.json halten.K1#2 | — |
| macht.megastadt | 1 | F | — | nichts | Karte | — |
| kultur.sprache | 1 | P | — | die Zuordnung von Namen zu Saaten urteilt ein Prüfer (R11) | Karte | — |
| kultur.schrift | 1 | F | — | lesbar ist nur das Namensschild der Mitspieler | Karte | — |
| kultur.glaube | 1 | F | — | es gibt keinen Ritus und keinen Kalender | Karte | — |
| kultur.gestalt | 1 | P | — | „blind getrennt" | Karte | — |
| kultur.diffusion | 1 | F | — | Stile wandern nicht im Raum | Karte | — |
| kultur.wissen | 1 | F | — | der Technikstand ist nur eine Funktion des Jahrs | Karte | — |
| kultur.verstaendigung | 1 | F | — | es gibt keinen Gruß und keine Antwort | Karte | — |
| kultur.bildkunst | 1 | F | — | es gibt keine Werke | Karte | — |
| kultur.erzaehlkunst | 1 | F | — | die Bewohner sprechen nicht | Karte | — |
| kultur.strassenleben | 1 | F | — | es gibt kein Lokal und kein Gericht | Karte | — |
| zeit.spanne | 1 | P | — | „Blind-Datierung" | Karte | — |
| zeit.palimpsest | 1 | **T** (bestehend) | Ort | siedlung.K4#2, Häuser steigen, die alten ≥ 0,9, beide Geräte GRÜN | g5.js:4093, 4110 | — |
| zeit.palimpsest | 2 | N | Ort | dieselbe Zelle per Chat-Akt „dorf 7 300 jahr 1320 … 1935" im Spiel gründen, die Überdeckung je Slot zählen; headless (siedlung.K4#1) 0,915 bei Soll ≥ 0,8, die Sprosse verlangt ≥ 0,9 | g5.js:3995–4020; stamm/feld-leben.js:1173–1196; stand.json siedlung.K4#1 | M |
| zeit.palimpsest | 3 | F | — | kein Gesetz macht die alte Mauertrasse zur Straße (Grep Ringstraße/Trasse leer) | fachwerk-core.js (Grep) | — |
| zeit.kausal | 1 | N | Ort | W2 „Gewalt bremst" rechnet heute nur in Node neben der Welt (im Urteil von siedlung.K4#2); im Spiel zwei Orte, einer nach `damageCreature`, 1 500 s Welt-Uhr, Wachstum vergleichen | g5.js:4091, 4110; scripts/diag-settlement.cjs:1133 | M |
| zeit.kausal | 2 | F | — | jede Saat hat dieselbe Epochenfolge, die Varianz ist 0 | Karte: fachwerk-core.js:3294 | — |
| zeit.erleben | 1 | F | — | es gibt keine Ereignisse am Ort | Karte | — |
| zeit.erde | 1 | F | — | es gibt keine Erd-Saat | Karte | — |
| zukunft.technik | 1 | F | — | es gibt keine Technik-Folge | Karte | — |
| zukunft.medien | 1 | F | — | 0 Treffer (Grep) | Karte | — |
| zukunft.maschinenwesen | 1 | F | — | 0 Treffer (Grep) | Karte | — |
| zukunft.leib | 1 | F | — | 0 Treffer (Grep) | Karte | — |

„Karte" in der Beleg-Spalte heißt: das F oder P folgt aus dem Richter-Wortlaut oder aus dem `beleg` der Leiter in gruppe-mensch.json; nicht einzeln im Code nachgelesen, außer dort, wo eine Datei steht.

## 3) Blöcke

```json tafel
[
  { "station": "gelaende.K2#1", "leiter": "mensch.nahrung.erdbau", "sprosse": 1, "richter": "gleich" },
  { "station": "siedlung.K4#2", "leiter": "mensch.zeit.palimpsest", "sprosse": 1, "richter": "gleich" },
  { "station": "mensch.K2#2", "leiter": "mensch.menge.rhythmus", "sprosse": 1, "richter": "gleich" },
  { "station": "mensch.K5#1", "leiter": "mensch.menge.dichte", "sprosse": 1, "richter": "gleich" },
  { "station": "mensch.K5#1", "leiter": "mensch.menge.kollektiv", "sprosse": 1, "richter": "gleich" },
  { "station": "siedlung.K1#2", "leiter": "mensch.bau.innen", "sprosse": 2, "richter": "gleich" }
]
```

```json klassen
[
  { "leiter": "mensch.nahrung.erdbau", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.zeit.palimpsest", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.menge.rhythmus", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.menge.dichte", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.menge.kollektiv", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.bau.innen", "sprosse": 2, "klasse": "Ort" },
  { "leiter": "mensch.geist.tag", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.stadt.siedlungsnetz", "sprosse": 1, "klasse": "Stadt" },
  { "leiter": "mensch.bau.innen", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.wirtschaft.beruf", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.leib.gesicht", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.leib.stoff", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.geist.gespraech", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.menge.bevoelkerung", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.stadt.vertikal", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.nahrung.flur", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.nahrung.tier", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.nahrung.hand", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "mensch.zeit.palimpsest", "sprosse": 2, "klasse": "Ort" },
  { "leiter": "mensch.zeit.kausal", "sprosse": 1, "klasse": "Ort" }
]
```

## 4) Die billigsten N(S) — es gibt nur vier, der fünfte Platz ist das billigste N(M)

1. **mensch.stadt.siedlungsnetz S1** (Stadt). Die Station ist siedlung.K2#2. Ihr Urteil (g5.js:3695) liest zusätzlich den Z1-Regex aus siedlung.K2#1 (g5.js:3636), denn beide Hälften liegen schon im Stdout desselben SIEDLUNG_SITZUNG-Laufs; der Diff ist 2 Zeilen. Der Richter ist an beiden Geräten GRÜN (7/8, ζ 1,022 [0,956; 1,158]), aber den Punkt sperrt der Preis Stadt: Ankunft kalt ≤ 5 s ist PFLICHT B, an der GTX heute 16,6 s.
2. **mensch.geist.tag S1** (Ort). Das Urteil von mensch.K2#2 (g2.js:5226–5233) bekommt `z.stationen > 0 && z.schmiede10 > 0 && z.schmiede2 === 0` dazu, denn die Probe bewohner zählt die gezeichneten Schmiede-Leiber ≤ 1,5 m vom Werk um 10 und um 2 Uhr schon (kreatur-mensch.cjs:561, Soll :814). Danach misst die Station den ganzen Richter, und die Tafel bekommt die Zeile `{mensch.K2#2, mensch.geist.tag, 1}`. Der Preis am Dorfplatz ist an der Radeon heute ROT (≈ 37 ms), PFLICHT E.
3. **mensch.bau.innen S1** (Ort). Eine Zwillings-Station siedlung.K1#3 nimmt die Probe von siedlung.K1#2 (startDorfInnen), urteilt aber nur `ganz.length >= 1 && kein Hub > 0,3 m` (das Muster von g5.js:3807 ohne die Licht-Quote). So hängt die Sprosse 1 nicht an der Innen-Helligkeit, die nach dem Kommentar der Station heute bei einem Median von 0,098 liegt. Headless ist der Gang an 1 von 8 Häusern ganz, Hub max 0,20 m.
4. **mensch.wirtschaft.beruf S1** (Ort). Dieselbe Zahl `schmiede10/schmiede2` aus der Probe bewohner, als eigenes Urteil einer Station mensch.K2#3 auf derselben Probe (BEWOHNER_SITZUNG, kein neuer Lauf in der Sitzung). Vorher entscheidet der Koordinator den R9-Konflikt: die Schmiede-Zahl steht wörtlich in den Richtern von geist.tag S1 und beruf S1, nach `misst` gehört sie zu beruf („eine Person ihr Werk tun sehen").
5. (N(M)) **mensch.leib.gesicht S1** (Ort). mensch.K4#1 läuft unverändert, nur in einer Schleife über 10 Welt-Samen (die Gesichts-Achsen kommen aus dem Genom, koerper-core.js:4935), GRÜN heißt 10 von 10. Heute ist sie GRÜN an der Radeon am Kopf 63655917, an der GTX ungemessen. Kosten: 10 × 28 s Probe in einer warmen Sitzung.

Außer der Reihe, nach der Regel nicht geprüft (die Sprosse davor ist P oder unklar), aber billig: **leib.verschieden S2** („Zensus 100 Bewohner, 0 Paare unter 1 px") misst mensch.K4#2 headless schon an 50 von 50 Samen (min 99 px), die GPU-Fassung wäre M. **sport.koerper S2** („Fuß-Gleiten ≤ 2 cm"): leib.K2#1 misst 1,2–1,4 cm p95 an beiden Geräten bei der Schwelle 3 cm, die Schwelle 2 cm wäre 1 Zeile. Der Beleg der Karte („Fuß 3,4/3,1 cm ROT") ist veraltet.
