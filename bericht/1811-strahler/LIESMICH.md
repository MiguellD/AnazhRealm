# w28-strahler — ZIELBILD vor dem ersten Schnitt (GTX 1050, 18.11., gemessen an main c50e6b61, V18.546.329)

**NICHT ABGEGEBEN — Entscheid des Koordinators 18.11. ≈ 05:00 nach eigenem Blick:** Stück 1 landet so nicht (das Herdfeuer am Kopf 3147ee40 beleuchtet nichts mehr); Stück 1 und DAS AUGE landen als EINE Abgabe. Stand, Zerlegung der Nacht und Zielbild im letzten Abschnitt unten; 3147ee40 bleibt WIP.

Dieses Blatt steht für sich: ein neuer Koordinator liest hier Auftrag, Stand und nächsten Schritt ohne die Sitzung, die es schrieb.

## Auftrag (Koordinator, 17.11. 23:05; ersetzt die Idee `w28-auge-quelle`)

EIN Strahler-Gesetz statt zwölf Wege: Licht und Wärme aus derselben Temperatur × Fläche. Befund-Blatt: `bericht/1711-glut-karte.md`
(13 Strahler, zehn Brüche B1–B10; gelesen an 08a8397b, nichts gemessen). Der Schnitt in fünf Punkten:

1. `strahler(T, A, n)` in fachwerk-core neben `lichtFarbe`/`lichtAbfall`: Farbe `lichtFarbe(T)`, Leuchtdichte aus EINEM Anker über
   `glutAus(T)`, Stärke = Leuchtdichte × A, Kern = √(A/π), mit Normale ein Lambert-Strahler, E(d) = L·A·cos / (d² + k²).
   Chokepoint `_flammenLicht` (dirigent-kern).
2. ALLE Leser ziehen um: jeder Zweig von `_leuchtQuellen`, `_lavaGlutNode`, die Zunge, Bett und Herd, Esse und Stahl, Funken; Fenster
   und Laterne treten ins Verzeichnis „licht“. Tor und Fahrzeug bleiben nicht-thermisch, tragen aber Leuchtdichte × Fläche.
3. Es fällt (Absenz-Grep): `LICHT_GESETZ.feuer.zeit`/`.staerke`, `LEUCHT_FEUER`, `FLAMME.ton`, `BRAND.bild.flamme.schein` und `ziel`
   samt Nachtauge-Umkehr, `BRAND.licht`, `FUNKEN.leucht`, die Glut-Palette der Vertex-Farben, das übersprungene `aGlut`.
4. Das Auge liest dieselbe Quelle: `_waagrechtIrradianz` nimmt Σ E am Auge aus dem Becken dazu.
5. Wärme, EIN Leser: die Lava zündet über E(d) gegen `tZuend`; ihre 8-Nachbarn-Regel fällt. Leib, Nässe, Schnee bleiben benannt offen.

Dazu aus der Annahme von `w28-lava-nachlauf` (18.11. kurz nach Mitternacht), in diesem Kopf:
- ERSTER Commit: `worldMeta.tag` fällt (einziger Leser ist der Playtest `sprungNimmtTag`, er zieht auf die Prozess-Uhr).
- Im ersten WIP EINE Zahl: das teuerste Bild, wenn eine Brand-Front in gemischten Grund läuft (Bett-Masken in EINEM Takt × ihr
  Preis). Über 4 ms in einem Takt laufen die Masken über das Budget des Brands (die Zelle brennt grob an fünf Punkten, bis ihre
  Maske dran ist) und das Soll BRAND-ZELLEN geht zurück auf 64 je Zelle; sonst bleibt es.

Beweis am Ende: Bildpaar je (a)–(e) main ↔ Kopf, Nacht und Mittag; Absenz-Grep = 0; Wege, die Stärke zu setzen 12 → 1; kaskade und
ereignis nicht schlechter als am Kopf von lava-nachlauf; Preis-Zeile an der Lava-Pose; Tore format:check, check:statik, playtest,
gate:pruefbuehne-licht, gate:hoehlen-sicht. WIP `[skip ci]` pusht der Arbeiter, die Abgabe erst nach dem Blick des Koordinators
auf die Bildpaare. EIN Bericht am Ende mit Prozent je Punkt 1–5.

## Stand (18.11. 00:17)

Zweig `w28-strahler` lokal auf main c50e6b61, KEIN Commit, nichts gebaut. Gemessen sind nur die Zielbilder unten.
`w28-lava-nachlauf` (1d835734) ist angenommen und wartet auf den Zug; der Strahler-Schnitt fasst Brand-Code an, der dort in
`stamm/feld-brand.js` liegt (auf main noch in feld-leben.js) — gebaut wird erst auf einem main, das lava-nachlauf trägt.

## Die Masken-Zahl (gemessen 18.11. 00:22 am Kopf 1d835734 von w28-lava-nachlauf, GTX 1050, Werkbank an der Mess-Wiese)

Brand ab −248/−1064, sonnig, 3 600 Takte zu je 1 s Brand-Uhr (130 Zellen im Feld, 57 Zellen mit Bett-Kante): der teuerste Takt
kostet **5,19 ms mit 2 Masken** (128 Zellen); nie mehr als 2 Masken in einem Takt. Takte mit Maske: Median 2,3 ms; Takte ohne:
Median 0,35 ms · p99 1,6 ms · max 3,0 ms. Eine Maske kostet im Spiel also rund 2 ms (die Probe eines einzelnen `_brandStoff`
nannte 0,6 ms). **5,19 > 4 ms: nach der Regel des Koordinators laufen die Masken über das Budget des Brands (die Zelle brennt
grob an fünf Punkten, bis ihre Maske dran ist), das Soll BRAND-ZELLEN geht zurück auf 64 je Zelle.** Gebaut ist das noch nicht;
es ist der zweite Schritt dieses Kopfs nach dem Fall von `worldMeta.tag`. Probe: `k-maskenzahl.js` (im Blatt unten beschrieben:
je Takt `spielZeit = _brandUhr + schrittS`, `_tickBrand()`, ms des Rufs, neue Einträge von `_brandBett` mit Anteil zwischen 0 und 1).

## Die Zielbilder an main (960 × 540, Sommer, sonnig, `--uhr 0.5` Mittag ↔ `--uhr 0.0` Mitternacht; Dateien `main-<name>-{tag,nacht}.png`)

Luma = Mittel der 8-Bit-Werte des Ausschnitts (Rec. 709 auf dem Bild, wie es der Spieler sieht), gelesen mit dem PNG-Leser der
Abnahme (`scripts/lib/abnahme-urteil.cjs` `pngLesen`).

| | Ort · Pose (Kamera → Blick) | an main gemessen | Ziel am Kopf |
| --- | --- | --- | --- |
| (a) Herd am Brunnen | Wiese, Glutbrunnen −270/27,4/−1056 · nah `-266.5 28.6 -1052.5 → -270 27.6 -1056` · fern `-252 33 -1042 → …` | Nacht: Scheibe am Bett Luma 178, RGB 227/169/132 (fast weiß), Gras dahinter 114, Gras vorn 44. Mittag: Scheibe 101 — nachts 1,8× heller als mittags | Flamme mit Form, Bett orange-rot (r/g ≥ 1,6 statt 1,34, kein Kanal am Anschlag), der Boden fällt in wenigen Metern ab: von 1 m auf 4 m um den Faktor 13,9, den E(d) für ein Bett von 0,5 m² nennt (k = 0,40 m) |
| (b) Lava | Wiese, Guss −248/−1064 · nah `-243.5 28.6 -1056 → -248 27.6 -1064` · fern `-226 36 -1040 → -248 28 -1064` · „allein“ = die Zündung in der Probe gesperrt | Nacht, allein: Decke 68 (RGB 110/58/42, Risse rosa-weiß), Saum-Gras 42,5 (warm), Baumreihe 22,2 (RGB 22/23/17, neutral) | Kruste dunkel, Risse orange/rot statt rosa-weiß, Saum-Gras warm, Baumreihe ohne Schein (siehe „Die Zahl“) |
| (c) Rauchfahne | Wiese, der Brand am Guss · `-228 30 -1068 → -248 36 -1064` | Nacht: Fahne unten 45,0 ↔ oben 48,8; zweite Fahne 31,0 ↔ 32,2 — oben so hell wie unten | von unten beleuchtet, nach oben dunkler (oben ≤ ½ unten) |
| (d) Tor | Genesis · nah `-13.5 92.6 -1.9 → -21.8 93.3 -3.1` · fern `-2 94 2 → …` | Stein des Tors: Nacht 91,6 / 83,3 ↔ Mittag 82,1 / 88,9 — nachts so hell wie am Tag, flächig; Nachbarbau Nacht 74. Hauswand ohne Quelle im Dorf bei Nacht: 38,5 → der Tor-Stein steht 2,3× darüber | Relief: Verlauf von den goldenen Bändern weg, der Stein fern der Bänder nahe der Wand ohne Quelle |
| (e) Dorfgasse | Dorf · nah `-697.5 45 -882 → -707 42.5 -872` · fern `-688 48 -892 → -707 44 -872` | Nacht: Fenster 130, Boden unter dem Fenster 4,2 (dunkler als der Boden fern jeder Quelle, 22), Boden an der Laterne 50 | die Fenster werfen Licht auf den Weg: Boden unter dem Fenster über dem fernen Boden |
| Mittag, alle | dieselben Posen | Herd-Scheibe 101 gegen Gras 105–112 | kein Strahler überstrahlt die Sonne |

**Befund an (b), gegen den Auftrag gelesen:** der ocker-gelbe Waldsaum und der weiß ausgebrannte Kern stehen an main c50e6b61 an
dieser Pose NICHT mehr im Bild. Sie stammen aus `glut-s-lava-nacht.png` (ein Kopf von w28-glut-nacht vor dessen Abgabe: Saum-Gras 61,
Baumreihe 44 ocker RGB 56/43/20, Decke 114); an main misst die Baumreihe 22 und neutral. Dazu zündet die Lava an main das Gras
(23 Zellen nach 240 Takten), das Bild der Lava bei Nacht ist im Spiel also das Bild MIT Brand (`main-b-lava-nah-nacht.png`); „allein“
gibt es nur, wo nichts brennt. Im Fern-Bild stehen zwei helle Scheiben mit weißem Kern im Gras vor der Lava — nach Lage und
Gestalt Glutbrunnen (Bruch a), an der Quelle nicht geprüft. Was an (b) bleibt: die Risse rosa-weiß statt orange, und das Licht der Lava als Punkt in 2000 K.

## Die Zahl aus dem Gesetz für (b) — und eine Lücke der Formel im Nahfeld

Decke einer Zelle: A = 256 m², k = √(A/π) = 9,03 m, waagrechter Lambert-Strahler. Empfänger: eine senkrechte Fläche zur Quelle
gedreht, in Höhe h über der Decke, im Abstand d von der Zell-Mitte. Faktor Saum (d 10 m, h 0,3 m) ÷ Stamm (h 2 m):

| Stamm bei | E(d) = L·A·cos/(d²+k²) | exaktes Flächen-Integral über 16 × 16 m | heute (isotroper Punkt, k 8 m, Saum bei 32 m) |
| --- | --- | --- | --- |
| 40 m | 5,6× dunkler | 22,6× | 10,2×, jenseits 32 m trägt der Pool 0 |
| 60 m | 18,3× | 78× | 0 |
| 80 m | 42,9× | 187× | 0 |

Fern stimmen Formel und Integral auf 5 % (60 m: 2,31 ↔ 2,42 · 10⁻³ L). Am Saum liegt die Formel um den Faktor 4,5 UNTER dem Integral
(10 m: 0,042 ↔ 0,189 L; 9 m: 0,052 ↔ 0,406 L): der Kosinus EINES Punkts in der Zell-Mitte sieht das Gras am Rand streifend, die
Fläche direkt vor dem Gras sieht es steil. Mit der Formel allein bliebe das Saum-Gras kalt — das Gegenteil des Zielbilds.
Entscheidung des Arbeiters für den Bau: Richter ist das Integral an drei Punkten (Saum 10 m, 40 m, 60 m; Abweichung ≤ 15 %); die
EINE Funktion `strahler` trägt den Nahfeld-Term der Fläche, kein zweiter Weg. Im Bild gemessen wird am Kopf Saum-Gras ÷ Baumreihe
(an main 42,5 ÷ 22,2 = 1,9 bei neutraler Baumreihe, also ohne Lava-Anteil dort).

## Nicht gedeckt

- (c) nah und zwei Dorf-Posen urteilte die Abnahme ROT (Blickziel nicht im Bild, Gelände verdeckt 5,2 %); sie sind nicht abgelegt.
- Die Zahlen des Befund-Blatts (3,1–3,6× Belichtung Nacht ÷ Tag, 385 gegen 24 am Bett, 0 Quellen „fenster“) sind noch nicht an der
  Quelle geprüft; das ist der erste Schritt vor dem Schnitt.
- Kein Bild an der Esse, am Stahl, an Funken und am Fahrzeug-Licht.

## Stand (18.11. 01:15) — zwei WIP-Schritte gebaut, lokal, nicht gepusht

Zweig `w28-strahler`, lokal gestapelt auf der angenommenen Abgabe w28-lava-nachlauf 1d835734 (main trägt sie um 01:13 noch
nicht; gepusht wird erst auf einem main, das sie trägt).

- **3001752a — `worldMeta.tag` fällt** (Zusatz 1 des Koordinators): `_uhrSetzen` zählt keinen Tag mehr, `_weltTagEichen`
  liest den Tag eines alten Stands einmal und löscht ihn, der Playtest `sprungNimmtTag` liest `_weltTag`,
  `gate:altlasten` trägt den Schreiber. Gefahren am Kopf: playtest EXIT 0, check EXIT 0 (0 „✗“), gate:stand-takt --narbe GRÜN.
- **df177c97 — die Maske des Betts geht im Budget des Brands** (Zusatz 2): die gemischte Zelle brennt sofort auf ihrer groben
  Maske (die fünf Punkte, je Gitter-Punkt der nächste) und stellt die feine in die Reihe; `_brandMasken` misst je Takt einen
  Punkt je `BRAND.maskeJe` (4) Zellen des Feuers, die Asche misst ihre Maske zu Ende.
  Gemessen wie die Masken-Zahl oben (Mess-Wiese, 3 600 Takte, dieselben 57 gemischten Zellen): teuerster Takt **5,19 → 2,81 ms**
  (ein Takt ohne Maske), Takte mit Maske in der Reihe Median 2,3 → 0,575 ms, höchstens 2,28 ms; die Reihe trägt höchstens 3.
  Linse: BRAND-ZELLEN wieder 64 je Zelle (der Masken-Zuschlag der Abgabe lava-nachlauf fällt), neu L3-MASKE (die feine Maske
  steht 2 bis 64 Takte in der Reihe; Probe-Zelle 28), Flammen und Asche auf dem Stein 0. Stand-Linse und Narben-Linse GRÜN
  auf der Karte, Selbsttest GRÜN, format:check EXIT 0.
  Offen: das Bild-Paar der Teil-Zelle ist nicht neu geschossen (es fällt mit den Bild-Paaren des Kopfs); in den ersten Takten
  einer gemischten Zelle steht die Flamme auf der groben Maske (in der Linse 28 Takte, im Spiel unter einer halben Sekunde).
- **Heimholen (Auftrag 18.11. 00:25) war ein Fehlalarm**, vom Koordinator bestätigt: der Inhalt von w28-ankunft-faden,
  w28-feld-fuss und w28-licht-kern steht seit dem 16.11. 05:40 in main (Squash `2ac706fac` „Abgabe w28-ankunft-stapel“).
  Kein Zweig w28-heim-* gebaut. Die drei alten Zweig-Namen stehen noch auf origin; ihr Aufräumen liegt beim Schöpfer.

## Stand 18.11. 02:40 — Zweig w28-strahler, Kopf 68ca2ed7 (WIP, gepusht, NICHT abgegeben)

- **2064a187 — das Gesetz und sein Chokepoint:** fachwerk-core `strahler` + `STRAHLER {ankerK 2000, leucht 7,5, eMin 0,05}`,
  Wirt `_strahler(TK, A, flach, mit)` (ersetzt `_flammenLicht`). Brand und Lava lesen es; die Lava leuchtet aus IHRER
  Temperatur (frische Decke 1650 K, Leuchtdichte 3,37 statt fest 2000 K / 7,5). Entscheid des Koordinators (01:40): Körper mit
  Temperatur als Zustand lesen T; Lampen tragen EIN Datum `leucht` + `kelvin` in EINER Zeile, beide durch `strahler`.
- **68ca2ed7 — die Fläche strahlt als Fläche:** ein Platz mit Seite (`lichtSeite`, die Lava-Decke) ist ein waagrechtes
  Quadrat; `_lichtPlatz` rechnet EINEN Vektor der Bestrahlung (Punkt: Richtung × Abfall; Fläche: Lamberts Kantensumme ÷
  Seite², `_flaechenVektor`), EINE Bedingung, EINE BRDF. Gegen das numerische Integral außerhalb der Fläche 0 % (9/10/40/60 m,
  in JS gerechnet — die Linse im Shader steht aus); als Punkt lag das Rand-Gras beim 0,22-Fachen.
  Bild Lava allein, Nacht, main → Kopf (Luma): Decke 71 → 63 · Rand-Gras 46 → 36 · Baumreihe 20 → 17 · Stein 53 → 60;
  Mittag: Decke 89 → 85 · Rand-Gras 108 → 104. **Befund gegen das Zielbild (b):** das Rand-Gras wird DUNKLER, nicht wärmer —
  die Decke bei 1633 K trägt das 0,43-Fache der Anker-Leuchtdichte, und eine flache Fläche gibt flachem Boden und dem
  Halm-Dach (Normale 0,9 oben) streifendes Licht. Gegenprobe als Punkt: Rand-Gras 39,6. Das ist das Gesetz, kein Fehler;
  ob das Zielbild so bleibt, entscheidet der Koordinator am Paar.
  Preis: Boden-Programm S0 98 747 → 99 821 Zeichen (Ratsche 100 062). Dafür „die kurze Zahl“ am Knoten-Bauer
  (`_configureRenderer`: jede Shader-Konstante als kürzeste Dezimale desselben f32, −598 Zeichen je Boden-Programm, wirkt in
  jedem Programm; Vendor-Stellen gepinnt). ms an der Lava-Pose NICHT gemessen.
  Grün am Kopf: gate:pruefbuehne-licht, gate:hoehlen-sicht, stand-takt --narbe, gate:vendor-anker, format:check.
  Nicht gefahren am Kopf: npm run check, playtest, kaskade/ereignis, die Ankunft kalt (jeder Programm-Text hat sich geändert).
- **Bildpaar für den Blick:** `main-b-lava-allein-{nah,fern}-nacht.png`, `main-b-lava-allein-nah-tag.png` ↔
  `kopf-b-lava-allein-{nah,fern}-{nacht,tag}.png` (dieser Ordner). Paare (a), (c), (d), (e) am Kopf: NICHT geschossen —
  Herd, Rauch, Tor und Gasse liest der Kopf noch auf den alten Wegen.
- **Prozent je Punkt des Auftrags:** 1 Gesetz 70 % (Funktion, Chokepoint, Nahfeld; die Linse gegen das Integral fehlt) ·
  2 Leser 2 von 13 Strahlern (Brand, Lava) · 3 Fälle 1 von 9 (`_flammenLicht`) · 4 Auge 0 % · 5 Wärme/Zündung 0 %.

## Entscheid des Koordinators 18.11. ≈ 02:50 und Stand 03:00 — Kopf b5be3ff6 (WIP, UNGEPRÜFT, Gerät startet neu)

- **Kein Stempel an 68ca2ed7.** Das Gesetz Leuchtdichte × Fläche bleibt, nichts wird zum Zielbild gebogen; falsch war der
  LESER am Gras (es las die Dach-Normale, 0,9 oben — am Code bestätigt, `_halmStoff`). Gras ist ein Volumen stehender Halme.
- **STÜCK 1 (diese Abgabe):** Gesetz + Lava als Fläche + Gras als Volumen-Leser + Masken im Budget; Paare (a), (c), (d), (e)
  nur als Rückfall-Probe gegen main; im Betreff offen: 11 Strahler lesen noch nicht. **STÜCK 2:** Lampen mit `leucht` (die
  Wand-Laterne bekommt `leucht` und ihre wahre Fläche, das K66-Wand-Gesetz ist Leser, nie zweite Quelle). **STÜCK 3:**
  Temperatur-Strahler, Zündung, Auge. w28-fruehbild fällt offen (nicht weiterbauen; löschen nur der Schöpfer).
- **Maß Stück 1:** Rand-Gras nah-nacht, gleiche Kamera: Luma Kopf ≥ main (46) UND R/G über main; Richter gegen das Integral:
  Halm in 0,4 m Höhe bei 0,5 · 2 · 5 m vom Rand ≤ 15 %. Budget: S0 Boden hat 241 Zeichen Luft, dort kommt nichts dazu; ms an
  der Lava-Pose Kopf ↔ main im selben Boot. Tore: check, playtest, kaskade/ereignis, Ankunft kalt + die grünen fünf.
- **Gebaut (b5be3ff6):** EINE Stelle `_lichtPlatz(…, volumen)`, volumen = das Dach der Wiese (`_halmDach`, EIN Knoten):
  Bestrahlung = Mittel über die Halm-Stellungen = 2/π × waagrechter Anteil × 0,89 + senkrechter × 0,34
  (`AnazhRealm.HALM_VOLUMEN`, an der Geometrie der Nah-Wiese gemessen: 0,892 / 0,338, 20 432 Dreiecke).
  Gemessen (Region Saum-Gras 200,400–560,470, nah-nacht): main 46,4 (R/G 1,17) → Kopf **69,8 (R/G 1,51)**; nackter Grund vorn
  43,3 → 32,3 (dunkel, wie das Gesetz ihn gibt).
- **NICHT getan an b5be3ff6:** kein Bild angesehen, keine Linse, kein Tor; Richter gegen das Integral, ms, Text des
  Gras-Programms, eine Linse für `HALM_VOLUMEN` gegen die Geometrie, die Bildpaare in koordination (die `kopf-b-*` hier
  sind noch die von 68ca2ed7). Das Blatt trägt deshalb NICHT „bereit zum Blick“.

## Nächster Schritt

1. Blick des Koordinators auf das Paar (b); davor keine Abgabe.
2. Linse: die Bestrahlung des Shaders an 10 / 40 / 60 m gegen das Integral ≤ 15 % (bestehende Familie stand-takt --narbe L5
   oder pruefbuehne-licht, mit Selbsttest; kein Zwilling auf der CPU).
3. Herd, Glut, Esse, Stahl, Funken über `_strahler`; Laterne, Fenster, Tor, Fahrzeug je EINE Zeile `leucht` + `kelvin`;
   Fenster und Laterne ins Verzeichnis „licht“. Dann die Fälle (Absenz-Grep), das Auge liest den Pool, die Lava zündet über E(d).
4. Am letzten Kopf EIN Gate-Satz: format:check, check:statik, playtest, pruefbuehne-licht, hoehlen-sicht, kaskade/ereignis,
   Preiszeile an der Lava-Pose, Ankunft kalt.

Werkzeug (lokal, GTX 1050): Befehls-Dateien `gtx1050-werkzeug/tmp/sz-main-{wiese,tor,dorf,dorf2,lava3}.bef` über
`werkbank-ort.sh` (ORT=wiese · genesis · dorf); für den Kopf dieselben Posen mit anderem Vorsatz der Datei-Namen.

## Stand 18.11. 04:50 — Kopf 3147ee40 (WIP, gepusht, NICHT abgegeben): Stück 1 bis an den Blick

**Was am Zielbild falsch war, und was davon fällt.** Das Maß „Saum-Gras nah-nacht ≥ main (46)" fällt offen: die 46 an main und
die 69,8 am Kopf b5be3ff6 waren das Licht ZWEIER GLUTBRUNNEN im Bild (je 144 in 1 m), nicht der Lava. Alle alten Bilder
`*-b-lava-allein-*` und `kopf-b-*` sind kein Beweis mehr; es gelten nur die herd-freien Paare `*-h-lava-*` unten.

**Geschnitten seit b5be3ff6 (vier Commits, 1c40614e · eb1e550e · 3147ee40):**
- Die Quelle im Pool ist die Quelle im Bild: die Lava strahlt als waagrechte SCHEIBE (geschlossene Sichtfaktoren im Stoff,
  `_lichtPlatz`), an Mitte und Fläche IHRER GEMALTEN DECKE (`_lavaScheibe` liest das Rand-Gesetz `_brandNarbeFn`), mit der
  MITTLEREN Leuchtdichte des Bildes der Decke (`_lavaLeucht`: dieselben Zahlen `_lavaGlutZahlen`, die `_lavaGlutNode` malt) über
  `_strahler` mit `leucht`. Vorher: ein Quadrat der Zelle am Ort des Gusses mit der Leuchtdichte des Risses — Gras stand IN der
  Strahler-Fläche.
- Das Herdfeuer (Glutbrunnen, Esse, Feuerstelle) leuchtet durch `_strahler` aus Temperatur × Bett-Fläche: 144 → 2,97 in 1 m,
  bei Tag und Nacht dasselbe.
- Die Linse des Feuerkreises (Entscheid 04:02, Weg A): ZWEI Urteile am Bild. (1) Gesetz: Licht des Feuers im Kreis (linear, mit
  minus ohne Feuer) gegen den Eich-Schuss, dessen Stärke die Linse aus fachwerk `strahler` rechnet (7,5 × 0,454 m² = 2,97 in
  1 m) — ≤ 15 %, gemessen 0 %. Ein absolutes E(2 m) → Luma hätte einen Zwilling der Foto-Kette in der Linse verlangt; am
  Eich-Schuss kürzen sich Boden, Belichtung und Tonkurve. Die Linse fing beim Bau sofort zwei eigene Fehler (falsches Bett
  0,385 statt 0,454 m², fehlender Labor-Faktor π). (2) Kontrast mit ÷ ohne Feuer ≥ 1,5: gemessen **1,539 und 1,562** in zwei
  Läufen — Abstand 0,04–0,06, DÜNN. Mutanten, beide ROT beim Namen: Feuer aus (Gesetz −100 %, Kontrast 1,0), alte Stärke 144
  (Gesetz +4465 %). Zwei alte Selbsttests standen am schwachen Feuer blind (Glut-Palette, Auge des Tages) und sehen wieder.

**Gemessen (GTX 1050, Mess-Wiese, Sommer sonnig, 960 × 540, herd-frei = `_leuchtQuellen` ohne `glutbrunnen`, gleiche Kamera,
main = 21f279f5, der Stand, den der Zweig trägt):**

| Bild | Region | main Luma · R/G | Kopf Luma · R/G |
|---|---|---|---|
| nah-nacht | Saum-Gras (200,400–560,470) | 40,7 · 1,10 | 31,7 · 0,94 |
| nah-nacht | nackter Grund am Rand (420,395–520,420) | 47,5 · 1,38 | 29,8 · 1,24 |
| nah-nacht | Decke (300,280–800,380) | 64,2 | 63,5 |
| nah-tag | Saum-Gras | 107,1 · 0,947 | 104,3 · 0,911 |
| nah-tag | Wiese links (0,290–190,370) | 119,0 · 0,976 | 118,1 · 0,968 |
| fern-nacht | Saum | 35,3 · 0,87 | 34,0 · 0,83 |
| fern-tag | Saum | 114,6 · 0,911 | 114,3 · 0,911 |

Ohne jedes Licht trägt derselbe Saum nachts 29,4 (R/G 0,84): die Lava hebt ihn am Kopf um 2,3 Luma und färbt ihn warm. Der
Pool trägt an main 22,3 in 1 m (Kern 8 m), am Kopf 1,06–1,30 (Kern 7,5 m; die Decke kühlt im Lauf).

Die vier Zahlen des Entscheids:
1. **Halm gegen das Integral** über die gemalte Decke (CPU-Richter, Halm 0,4 m hoch): 0,5 m vor dem Rand ≤ 17 % (Soll 15 %
   — REISST um 2 Punkte), 2 m ≤ 5 %, 5 m ≤ 1 %. Als Quadrat der Zelle: −64 % … +938 %.
2. **Farbdrift am Mittag** R/G Saum-Gras: main 0,947 → Kopf 0,911 (das Orange am Rand fällt); abseits 0,976 → 0,968.
3. **ms an der Lava-Pose** (`gpu-bank` 60 × 3, Ego, Blick auf die Decke, gleicher Ablauf, je EIN Lauf): Nacht main 8,92 →
   Kopf 6,65 ms · Mittag 7,63 → 7,09 ms. Kein Aufpreis; die Zahl ist CPU-nah (CPU je Frame 8,77 → 6,47), kein reines GPU-Maß.
4. **S0-Boden-Text**: 99 821 → 99 593 Zeichen (Ratsche 100 062). Der Text des Gras-Programms ist UNGEMESSEN.

Rückfall-Proben am Kopf gegen die main-Bilder (c50e6b61): Tor nah/fern nacht und nah tag, Gasse nah2 nacht/tag — Luma des
ganzen Bildes je ≤ 0,4 Stufen von 255 auseinander (Dateien `kopf-d-tor-*`, `kopf-e-gasse-nah2-*`). (c) Rauch am Kopf nicht
aufgenommen. Paar (a) Herd: `kopf-a-herd-*` (die weiße Scheibe um den Glutbrunnen ist weg, die Flamme hat Gestalt).

**Mein Blick auf die Paare.** nah-nacht main: orange gesprenkelter Grund am Rand, der Stein vorn glüht. Kopf: der Rand ist
ruhig, Gras und Stein tragen einen schwachen warmen Hauch. Gesetzestreu (die Decke trägt im Mittel 0,5, der Riss 2,2–2,5), aber
EHRLICH: dem Auge leuchten helle Risse, die ihre Umgebung fast nicht erhellen — die Nacht ohne Lava ist schon 29 Luma hell.
nah-tag: main und Kopf sind am Auge gleich, bis auf den orangen Stich am Rand, der fällt.

**FUND für das nächste Glied der Licht-Kette (nicht dieses Stück): die gehobene Nacht.** Der Boden ohne Feuer trägt um
Mitternacht 0,083 in der Ausgabe; ein gesetzestreues Herdfeuer hebt seinen Kreis nur auf das 1,54–1,56-Fache, die Lava ihren
Saum um 8 %. Das Maß, das dort fallen muss: **Feuerkreis in 2 m gegen die Nacht NACH der Tonkurve** (heute die Unterkante
1,5 der Linse, kein Ziel). Täter-Kandidaten: Belichtung der Nacht (`_belichtungStufen`), Auge der Nacht, Tonkurve.

**Rest der Strahler auf alten Wegen (Stück 2 und 3), 7 beim Namen:** Stahl (`feld-leben` LICHT_GESETZ.feuer), Laterne,
Wandlaterne, Fenster, Tor, Fahrzeug, Funken. Durch `_strahler` laufen: Brand, Lava, Herd/Glutbrunnen/Esse/Feuerstelle.
Absenz-Grep ≠ 0: `LICHT_GESETZ.feuer.zeit/.staerke` und `LEUCHT_FEUER` leben noch in fachwerk-core, dirigent-kern,
siedlung-wege und diag-stand-takt.

**Offen an diesem Kopf:** die Shader-Linse der Scheibe gegen das Integral (heute CPU-Richter + narbe L5 an Ort, Kern,
Leuchtdichte); eine Linse `HALM_VOLUMEN` gegen die Geometrie; Text des Gras-Programms; (c) Rauch; kaskade/ereignis; Ankunft
kalt; Planck je Kanal für die FLAMME mit Emissivität als EINEM Datum (Entscheid 03:55, Stück 3).

**Tore am Kopf 3147ee40 (GTX 1050):** format:check GRÜN · check:statik GRÜN (war ROT an zwei Stellen dieses Zweigs: Modul-Karte
nicht kanonisch, `_brandMasken` ohne Zeile in der Wanduhr-Liste — beide geschnitten) · gate:pruefbuehne-licht auf der Karte
GRÜN (63 s) · am Schnitt 1c40614e (derselbe Stamm): stand-takt --narbe auf der Karte GRÜN (L5 Leuchtdichte 0,51, Kern 8 gegen
7,64, neben 0,035 m), gate:hoehlen-sicht GRÜN, gate:post-kette GRÜN. Der ganze Satz (check, welt-boot, playtest, stand-takt,
post-kette) läuft am Kopf; sein Ergebnis steht in der nächsten Zeile dieses Blatts, sobald er durch ist.

## Entscheid 18.11. ≈ 05:00 und die Zerlegung der gehobenen Nacht (gelesen und gemessen, KEIN Schnitt)

**Entscheid (Koordinator, eigener Blick auf h-lava und a-herd nah-nacht):** Halm 0,5 m mit 17 % reicht (Zusatz-Punkt, steht als
Zahl in der offen-Zeile; das stehende Soll ist das Flächen-Integral 10/40/60 m ≤ 15 %). Aber: main zeigt ein Feuer in der Nacht
(Gras-Ring, Bäume, Stein warm) mit EINEM Fehler, dem weißen Teller; der Kopf eine Kerzenflamme in dunkler Wiese. Gesetzestreu
und für den Spieler schlechter landet nicht. Die Wurzel ist das AUGE: der Zeitplan nacht 45 war ein Pflaster je Lampe, trug aber
das dunkel-adaptierte Auge. EIN Gewinn des Auges an EINER Stelle auf JEDEM Licht (Umgebung, Strahler im Becken, gemalte Glut).

**Zielbild (sein Auge):** Nacht, Herd nah — Feuerkreis 2 m Kontrast ≥ 3 gegen die Nacht (heute 1,55), Bäume und Stein in 6–8 m
sichtbar warm wie an main, das Bett nicht weiß (ausgebrannte Pixel im Herd-Ausschnitt ≤ 2 %); Lava nah-nacht — Saum-Gras und
Stein sichtbar warm (Kontrast ≥ 1,3 gegen ohne Lava, an main 1,38), ohne Sprenkel; Mittag wie der Kopf (R/G 0,91). Die
Feuerkreis-Linse behält zwei Urteile, das zweite steigt von 1,5 auf das neue Maß.

**Die Zerlegung** (`werkbank licht --uhr 0.5 | 0.0`, Mess-Wiese, Kopf 3147ee40; Quelle welt-licht.js):

| Größe | Mittag | Mitternacht |
|---|---|---|
| E waagrecht gesamt | 7,83 | 0,598 |
| Richtlicht (Sonne / Mond) | 6,39 | 0,465 (78 %) |
| Umgebung (Himmel) | 1,44 | 0,083 |
| Ambient · Hemi | 0 · 0 | 0,040 · 0,010 |
| Belichtung k | 0,524 | 1,495 |

Licht Tag : Nacht = 13,1 : 1; ehrlich Sonne : Vollmond ≈ 385 000 : 1 (100 000 : 0,26 lx — dieselben 0,26 lx trägt
`NACHT_AUGE.luxJeEinheit`). Die Nacht-WERTE sind ×29 000 gehoben (14,8 Blenden), die Belichtung trägt ×2,85 (1,5 Blenden;
Knoten −2,17 Stufen, Messer-Boden `nachtKnotenE` = `MOND_E` 0,462). Tonkurve und Auge der Nacht heben nicht.
Das Feuer: sein Kreis trägt E ≈ 0,49 = 0,82 × Nacht; ehrlich 100–200 × Nacht. Gegen den Tag steht es ~200× zu stark. Der
Anker 7,5 liegt zwischen beiden Welten; der Zeitplan nacht 45 ÷ mittag 1,6 (×28) war die Brücke.

**Folgen, vor jedem Schnitt:** (a) Ehrliche Mond-Werte im Szenen-Ziel gehen nicht: 0,465 ÷ 29 000 = 1,6e-5 liegt unter der
Normal-Grenze von Half-Float (6e-5) — der EINE Gewinn liegt VOR dem Rendern auf den Licht-Werten, nicht in der Post-Kette.
(b) Mit demselben Gewinn steht das Feuer 100–200× über dem Mond-Boden: das Auge muss das Becken am Auge mitmessen (Punkt 4
des Auftrags), sonst brennt es aus; dann wird die Wiese am Feuer dunkler als heute — eine Bild-Entscheidung.
**Größe:** geschätzt 3 Tage für den ganzen Umzug (Mond, Nacht-Tafeln, Ambient/Hemi, alle Lampen, BELICHTUNG, AUGEN_LICHT,
Linsen tag-achse · S0 · licht.K1/K5 · hoehlen-sicht · post-kette). Vorschlag an den Koordinator (Antwort steht aus): erstes
Stück ≈ 1 Tag — der Gewinn bekommt EINEN Namen und EINE Stelle, die Mond-Zahlen bleiben numerisch als „ehrlich × Gewinn",
Strahler und gemalte Glut gehen am Chokepoint `_leuchtTakt` durch ihn, der Lichtmesser liest das Becken am Auge mit.

## Spike 18.11. ≈ 05:15 — das Auge der Nacht als Potenz auf der Becken-Summe (uncommittet, Kopf bleibt 3147ee40)

Entscheid des Koordinators: p = ln 13,1 ÷ ln 385 000 = 0,200 an EINER Stelle auf der SUMME des Beckens,
`E_zeig = A × ((1 + E_ehrlich ÷ A_ehrlich)^p − 1)`. Der Spike (`spike/spike-auge.diff`): `_lichtPlatz` gibt die Bestrahlung
als Luma je Platz mit, `_lichtPoolTerm` (stamm/stoff-material.js, die EINE Schleife) staucht die Summe einmal; A aus dem
Lichtmesser in `_leuchtTakt`, A_lux = 115 000 × (A ÷ 7,83)^(1/p).

| Fall (Herd-Pose a) | gerechnet | im Bild (Ausgabe-Luma) |
|---|---|---|
| Mitternacht 2 m (A 0,567 ↔ 0,257 lx) | 3,9–4,2 | Kreis 36,4 → 100,5 (×2,76) |
| Mitternacht 7 m | 2,4–2,5 | 1,00 — ROT, die Reichweite schneidet hart bei ~4 m |
| Mittag 2 m (A 7,40 ↔ 87 140 lx) | 1,001 | an ↔ aus identisch (118,5 = 118,5) |

Bilder `spike/sp-{nah,fern}-nacht-{mit,ohne}.png`, `spike/sp-nah-tag-{mit,ohne}.png`. Mein Blick: nah leuchtet das Feuer warm
in die Wiese, das Bett brennt nicht aus (Luma 82); fern steht eine Scheibe mit harter Kante — die Reichweite des Gesetzes
(eMin 0,05 linear) endet, wo das gestauchte Licht noch ×2,4 trägt; sie muss aus derselben Stauchung folgen.
Offen am Spike: K = 850 lx je Luma-Einheit ist eine Spike-Zahl (das Datum sind Candela je Strahler); der Messer liest das
Becken noch nicht; der Augen-Ersatz-Platz läuft mit durch die Stauchung; der Preis in ms ist nicht gemessen.
Tor-Satz von 04:39: format, check, welt-boot am Kopf GRÜN; die Läufe danach fuhren mit dem Spike im Baum und sind kein Beleg
für den Kopf.
