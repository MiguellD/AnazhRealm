# kultur-aus-klima — Stand-Blatt (ZWISCHENSTAND)

Zweig `kultur-aus-klima`, Kopf auf origin/main eae94514 (V18.546.427; die Täter-Zahl gemessen an 4c9e6aab, V18.546.426). Sprossen: `karte2.mensch.kopplung.kultur#2` (Dach ↔ Niederschlag
r ≥ 0,5; Mutation ≥ 90 %) und `karte2.mensch.kultur.sprache#1` (100 Namen aus 2 Saaten richtig zugeordnet ≥ 90 %). Karte 2 gebucht
119 von 1 718. Status ZWISCHENSTAND.

## Geschnitten

EIN Gesetz: was der Mensch am Ort baut und wie er heißt, folgt dem Ort und dem Klima seiner Saat, gelesen an EINER Stelle.

- **Der Himmel des Orts** (`gelaende-core.js` `NIEDERSCHLAG`, `niederschlagAmOrt`, `schneeFall`, `ortKlima`): der Niederschlag ist
  der Schneefall eines Frosttags × Jahr. Die Heimat hat 547,5 mm, davon ist der Abfluss `spendeMm` 328,5 mm. Am Ziel der Reise gilt die
  Umkehrung der Regen-Quote des Planeten (planet-core `ortRoh`: q = N / (N + 900)). Der Schneefall des Pegels skaliert mit N / N_H;
  in der Heimat ist der Faktor × 1, bit-gleich. `ortKlima(O)` ist die EINE Tafel, die der Mensch liest: {winter, sommer, spendeVerh,
  niederschlagMm, schneeMmTag}. Der Wirt reicht sie in jeden Plan ohne Wort (`stamm/siedlung-ort.js` `_siedlungKlima`).
- **Das Dach folgt dem Himmel** (`fachwerk-core.js` `DACH_KLIMA`, `ariditaet`, `schneeNeigung`, `ortNeigung`, `ortDeckung`). Die
  Bänder:
  - die Trockenheit nach Kottek et al. 2006 (Köppen-Geiger, die Schwelle 10·(T + 7));
  - die Schneelast nach EN 1991-1-3 (μ₁ = 0,8 bis 30°, 0 ab 60°, also die Neigung, über der der Schnee abgleitet);
  - das flache Dach nach DIN 18531 (2 %);
  - die Neigung trocken ↔ nass nach Li et al. 2021 (Hang-Steilheit-Regel der Volksarchitektur).

  Wo es trocken ist, wird das Dach flach (Lehm, `DECKUNG_GESETZ.flach`). Wo Schnee fällt, wird es steiler bis zur Gleitgrenze. Wo es
  nass ist, wird es steil.
- **Die Sprache der Region** (`fachwerk-core.js` `SPRACHE_GESETZ`, `SPRACH_BAUM`, `LAUTWANDEL`, `spracheVon`, `sprachName`):
  - Jede der 6 Kultur-Regionen ist eine Familie mit einer Ursprache, gewürfelt aus ihrem Lautgesetz: Anlaut, Cluster nur am Wortanfang
    oder nach Vokal, Silbenkontakt nach Vennemann 1988, Koda nach WALS 12A, Vokale nach WALS 2A.
  - Die Ursprache hat 6 Grundwörter und das Wort für „Haus“.
  - Eine Saat wählt ein Blatt eines Binärbaums der Tiefe 5. Jeder Knoten erneuert EIN Lautgesetz aus der Drift der Familie (Sapir 1921).
    Das Gesetz greift ausnahmslos (Osthoff & Brugmann 1878; Campbell 2013; Kümmel 2007).
  - Der Rang-Wurf ist 1/r (Sigurd 1968; Tambovtsev & Martindale 2007).
  - Die Fuge folgt dem OCP (Leben 1973; McCarthy 1986): zwei gleiche Konsonanten nebeneinander verschmelzen, außer den
    Geminaten, die das Gesetz der Region trägt (mediterran ll · tt · nn …). Das Maß über 36 000 Namen: Doppel-Laut ohne Gesetz
    4,19 % → **0 %** („Betzzel“ → „Betzel“, „Gonggros“ → „Gongros“).
  - Ortsname = Wurzel + Grundwort, Familienname = Wurzel + „Haus“: Ort und Leute klingen verwandt. Es gibt keine Namensliste und
    kein kopiertes Wörterbuch. Die alten Silben-Listen `NAMEN` und `LEBENSLAUF.namen` sind gefallen.
  - Die Leute heißen aus demselben Gesetz: `stamm/siedlung-bewohner.js` `_bewohnerLauf` „name“ ruft `sprachName` mit der Sprache
    des Plans (`spracheVon(plan.region, plan.seed)`). Ohne Kern bricht der Lauf beim Namen (`_kernPflichtBruch`).

## Gemessen (node, dasselbe Gesetz, vorher am Kern origin/main ↔ nachher)

### kultur#2 — Dach ↔ Niederschlag (gate:settlement Teil R8, 32 Saaten, der Auftrag über `ortGesetz` eines Teils)

| Maß | vorher | nachher |
|---|---|---|
| r (Niederschlag, mittlere Dachneigung) | 0 | **0,792** |
| Mutation (Plan trocken bzw. nass ≠ Heimat) | 0 % (0 von 64) | **100 %** (64 von 64) |
| Gegenlauf gleich | 32 von 32 | 32 von 32 |
| Dach trocken · Heimat · nass | 50,86° · 50,86° · 50,86° | **2,13° · 51,05° · 60,06°** |
| Niederschlag trocken · Heimat · nass | 76 · 548 · 1 895 mm/a | 76 · 548 · 1 897 mm/a |

### sprache#1 — Namen aus ≥ 2 Saaten (gate:settlement Teil R9, der Zweier-Laut-Leser der Station wörtlich)

| Maß | vorher | nachher |
|---|---|---|
| Fächer der Heimat (32 Zellen, 32 Ortsnamen + 640 Personennamen): Saaten | 3 | **3** (mitteleuropa · alpin · nordisch) |
| zugeordnet | 0,857 | **0,993** (128 Zellen: 0,995) |
| mit stadt-voll (mediterran) | 4 Saaten | 4 Saaten |
| Sprachen je Region (200 Saaten) | 1 (keine Familie) | 22–32 von 32 |
| Doppel-Laut ohne Gesetz an der Fuge (672 Namen des Fächers) | — | **0** (ohne OCP 26) |

### Die Linse (Familie Fachwerk: gate:settlement Teil R, 1,3 s)

- R8 „das Dach liest den Niederschlag“: r ≥ 0,5, Mutation ≥ 90 %, Gegenlauf = n, trocken < Heimat ≤ nass.
- R9 „die Namen tragen ihre Region“: Saaten ≥ 2, zugeordnet ≥ 0,9, Doppel-Laut ohne Gesetz an der Fuge = 0.
- Am alten Kern (fachwerk-core origin/main) ist R8 ROT mit r 0 und Mutation 0 %. R9 ist ROT beim Namen („der Kern trägt kein
  Sprachgesetz“).
- Selbsttest mit gepflanzten Tätern (`KLIMA_TAETER`): „das Dach liest den Niederschlag nicht“ (der alte Deck-Schritt) → ROT an R8;
  „die Sprache kennt keine Region“ (jede Region spricht mitteleuropa) → ROT an R9 (zugeordnet 0,51); „die Fuge kennt kein OCP“
  → ROT an R9 (Fuge 26: „Krorzatzzel“ …). Der Selbsttest gate:settlement ist GRÜN (103 s).
- Die Leser des alten Klimas (Teil R Sockel/Klima/Dach, Teil O Studio = Welt) wandern mit: sie rechnen das Klima über `ortKlima`,
  nie über einen Zwilling.

### Vertragsakt — wie weit sich die Welt bewegt (alter gegen neuen Kern, dieselben Saaten)

| Messort / Golden | Bewegung |
|---|---|
| **dorf** (Zelle −4,−4, Same 4291161376, die Heimat) | 17 von 17 Dächern byte-gleich (Reet 45°/47°); nur der Ortsname: Skogberg → Huvisnid |
| DORF Heimat, 64 Saaten | 15 von 1 105 Häusern neigen steiler (1,4 %, +10° … +14,5°, Mittel +11,4°: der Schnee der Heimat hebt flache Dächer an die Last-Regel); Deckung 0 geändert; Ortsnamen 64 von 64 neu |
| **stadt** („dorf 7 120“) · **stadt-voll** („dorf 7 300“) | Geometrie byte-gleich: der Plan eines Worts trägt per Gesetz kein Klima (`stamm/siedlung-ort.js:273`); nur der Name (stadt-voll: Villaalto → Mamilsi, mediterran) |
| Bewohner aller Messorte | jeder Name neu (Vorname, Familie aus der Sprache des Plans) |
| Golden siedlung (`spec/asset-contract/v6/golden/siedlung.json`) | neu gestempelt, nur der Name bewegt sich (1 Pfad je Plan): {seed 7, nH 12} „Villaalto“ → „Mamilsi“ (e874ebee → 8f9c90ef), {seed 12345, nH 6} „Grünbach“ → „Beldwert“ (dee40ec6 → f6432b76); Slots 16 und 7, Größe gleich |
| Goldens asset-contract (Häuser) | 128 von 128 byte-gleich |
| Ziele der Reise | der Schneefall skaliert mit N / N_H; diag-planet `ort.jahreszeit` 1 820 Land-Ziele GRÜN (Schnee zur Sommer-Mitte bei > 10 °C: 0) |

Kein Flag hält die alte Welt; der alte Silben-Zwilling ist gelöscht.

## Zehn Beispiel-Namen je Region (fünf Orte · fünf Leute, Heimat-Fächer und Saaten der Regionen)

| Region (Sprachen gesehen) | Orte | Leute |
|---|---|---|
| mitteleuropa (29) | Suhesgros · Bonmeschon · Bedusgrin · Bebegrin · Gundschon | Bogebrir Ditbelf · Bronbel Debelf · Debetzel Debelf · Zobahen Brebelf · Raschwer Senbelf |
| nordisch (22) | Tanbi · Sunglidald · Svæga · Flødtald · Glabi | Skifjikharn Hihud · Draldud Skahud · Fjedbasar Hæhud · Ryskannun Huhud · Hjydsillud Fanhud |
| alpin (27) | Krorzatzel · Bobog · Libu · Betzel · Tuchgonbag | Tinik Sinack · Gruchmig Hanack · Zrigsich Flinack · Gebri Gronack · Bagich Runack |
| mediterran (32) | Serari · Mitapa · Macilva · Mallava · Tirpa | Mibapro Cobo · Limi Cibu · Callagia Cabu · Dematta Sebo · Fulla Sanbu |
| antik (29) | Lamus · Pixqunspis · Polnistas · Cigas · Trygas | Tiplincat Cacras · Muvis Pucras · Gransos Pracras · Primses Facras · Plibabam Cycras |
| fernost (32) | Susagu · Yabi · Chibanka · Kuhagya · Kadungi | Komayi Chino · Shiminka Kanu · Nujin Tunu · Kyonkun Tsuno · Taganban Tano |

Die Ursprachen (6 Grundwörter · Haus, vor Lautwandel und OCP): mitteleuropa wat schon graus grin wert mon · belf — alpin bua sitz goag bagg zeil bog · nack —
mediterran ma pa si va pe mi · bo — nordisch bi tald sned snuk halm ga · hud — fernost pi kya ku gi ka mi · no — antik mos stas gan bre
paes gas · cras. Der Ort trägt das Grundwort seiner Ursprache, die Leute tragen das Haus ihrer Ursprache: „Tanbi“ und „Hihud“ sind
nordisch, „Mitapa“ und „Cobo“ mediterran.

## Die nächsten Sprossen aus demselben Gesetz (Mechanik gelegt, nicht gebucht)

- **sprache#2** (U_eff ≥ 10; Sprachen an 20 Sätzen getrennt ≥ 85 %): U_eff je Familie **31,4–31,7** über 1 000 Saaten (32 Blätter).
  Die Trennung ist ungemessen. Die Schwestern einer Familie unterscheiden sich an derselben Saat in 27–53 % der Vornamen und in
  0–75 % der Grundwörter. In mitteleuropa sind es 0 %: seine vier Lautgesetze treffen die Grundwörter nicht. Die Schwestern stehen
  also nah, wie Schwestern stehen; ob 85 % am Satz trennen, misst erst #2.
- **sprache#3** (U_eff ≥ 10²; ≥ 5 Familien; Kognaten; Robinson-Foulds ≤ 0,3 in ≥ 70 %): 6 Familien mit 192 Sprachen, U_eff **189,3**.
  Die Kognaten sind die Grundwörter der Ursprache durch die Lautgesetze der Knoten. Der Baum ist der Binärbaum der Tiefe 5, also
  wahr und rekonstruierbar. Robinson-Foulds ist ungemessen.
- kultur#3 (Kalender/Fest) ist ein anderes Gesetz und fällt nicht hieraus.

## Station (Kandidat, `cloud-post/kultur-aus-klima-station/`)

`stationen.diff` gegen origin/punkte-maschine 55313a8b und `BEGRUENDUNG.txt`:

- KULTUR misst das Klima des Orts statt des Wetters der Stunde. Der Plan kommt aus dem Auftrag des Spiels (`_ortDp`).
- SPRACHE misst dazu den Fächer von 32 Zellen über den Leser des Spiels (`_bewohnerLauf`).
- Wand 1 hält: die Liste der Punkte-Maschine (`liste`, Zweig punkte-maschine) zeigt genau zwei ROT (gelaende.K2#1/#2, Wand HAKEN), an der Basis wie am Kandidaten.
- Wand 3 hält: die Zeugen `klimaGleich`, `spielGleich` und der Namen-Zeuge.
- Wand 2 ist offen (siehe unten).
- Der Selbsttest der Punkte-Maschine (`selbsttest`) am Kandidaten: 286 GRÜN, 5 ROT. An der Basis 55313a8b stehen dieselben 286 GRÜN und dieselben 5 ROT
  (BEFEHL TRÄGT · zweimal WACHE · LEBENSZEICHEN DES ZEUGEN · RICHTER-AKTE). Der Kandidat fügt kein ROT hinzu.

## Probe

Der Ruf: `[gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, bild:dorf@0.42]`.

- Die drei Tore nennt `probe-tag` als Pflicht: Bau und Haus, weil der Beitrag `stamm/siedlung-*` und `fachwerk-core.js` anfasst.
  Am WIP-Kopf ohne Tag antwortet `probe-tag` „FEHLT: ohne gate:pruefbuehne-licht, gate:weltbild-frost:echt und gate:studio-begehen“.
- gate:settlement ganz am Baum auf main eae94514: GRÜN (537 s), die Goldens siedlung byte-treu (8f9c90ef „Mamilsi“, f6432b76 „Beldwert“).
- `npm run check:statik` am Baum auf main eae94514: GRÜN, alle 53 Schritte. Zwei Wände fielen zuerst ROT und stehen geheilt: die
  Ratsche Samen (fachwerk-core 9 → 8 Zwillinge, `--schrumpfen`) und der Studio-Vertrag §9 (`ortKlima` steht in der Erklärung).
- Der Einlass trägt höchstens 4 Proben (gpu-probe.yml und der Zug-Dienst in koordination, `PROBE_EINLASS_MAX`). Deshalb fällt `bild:stadt@0.5` offen: am
  Messort stadt ist die Geometrie byte-gleich (Wort-Plan ohne Klima), das Bild wäre das Bild von main.
- `bild:dorf@0.42` zeigt den Gegenlauf: in der Heimat bleiben die Dächer stehen.
- Lokal mit `probeUrteil` am Baum auf main eae94514: gate:pruefbuehne-licht GRÜN (70 s), gate:studio-begehen GRÜN (279 s). gate:weltbild-frost:echt fährt nur
  auf der Karte (`scripts/diag-weltbild-frost.cjs:47` „nur --echt“). In der Wolke ohne Karte startet kein Browser; unter xvfb meldet
  der GPU-Prozess „WebGPU Device Lost“. Das Urteil fällt in der Probe am Gerät.

## Offen (Grund, Messname)

- **Wand 2 der Station** (Leiter ≤ 60 s): sie misst nur das Gerät. KULTUR rechnet 182 statt 116 Pläne, SPRACHE 32 Pläne dazu.
  Messname `karte2.mensch.kopplung.kultur#2` und `karte2.mensch.kultur.sprache#1` am ersten Lauf.
- **Das Dach im Bild**: alle Messorte stehen in der Heimat. Das Bild zeigt den Gegenlauf, nicht die Mutation; das flache Lehm-Dach
  ist an keinem Messort sichtbar. Der Beweis der Mutation ist R8 (node) und am Gerät die Station KULTUR (der Fächer der Orte).
- **sprache#2/#3**: wie oben, ungemessen (Trennung an 20 Sätzen, Robinson-Foulds).
