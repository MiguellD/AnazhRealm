# DER PRÜFPLATZ — Plan des Vertical Slice am Genesis-Ort (Fassung 2, nach der Gegenprüfung)

Stand: main c5ee9059 (seit b4bcf19c kein Laufzeit-Byte), koordination 74cc4a86. Alle Datei:Zeile-Angaben gelten für origin/main c5ee9059.
Die Geometrie-Probe dieser Fassung liegt neben dem Plan in `geo2/stationen2.cjs` (`node geo2/stationen2.cjs`, Exit 0): 17 Stationen,
32 Prüfungen Ego/Third, alle GRÜN (Fassung 1: 4 Stationen sahen fremde Sektoren ≤ 150 m, 3 Kameras standen im Gürtel oder auf der Laterne).

**Chokepoint und was stirbt:** EIN Ort-Plan des Genesis-Orts (fachwerk `GENESIS_ORT` → `ortPlan` → `_ortPlaene` → EIN Wirt-Leser
`_genesisOrt`); es stirbt die Plattform samt Spirale, `GENESIS_PLATZ`, der Ring aus der Bauplan-Reihenfolge und die eingebaute
Vorschau-Tafel — in 29 Dateien mit 104 Treffern, in EINER Welle.

## 0 · Der beste Hebel in Zahlen

- **Grundlinie** (a-spawn-gtx3, GTX, main b4bcf19c, 31.10.): 22 von 114 Zellen im Bild sind GRÜN; 54 von 168 Zellen haben kein Bild
  (wasser, fels, fell je 12; mensch-kopf, haar je 9).
- **Von den 92 ROT-Zellen sind 68 Apparat oder Tafel:** 48 Rauschen (zwei gleiche Schüsse weichen in 0,23–0,57 % der Pixel ab, Wand
  0,2 %), 12 haus gegen eine veraltete Albedo-Tafel (seit 1dcb844f), 8 himmel-licht ohne Soll (Uhr 0,3 und 0). Nur 24 sind Bildbefunde.
- **Darum diese Reihenfolge:**
  1. mess zuerst, ohne Laufzeit-Byte (68 ROT).
  2. Der Minimal-Platz hebt die 54 Zellen ohne Bild: Teich, Fels, 3 Wölfe, eine Gesichts-Pose, dazu die L1-Station der Tore und der
     Arten-Saum mit Fichte.
  3. Die Tafel am Platz messen.
  4. Erst dann die Breite (Vorlage F, §1).
- **Die Besten gehen so vor:** alle Systeme verbunden in schlichter Fassung (Pfeifer), EIN Ort auf Versand-Niveau (Cerny, Volition),
  dann die Breite; der Ort steht unter voller Last in der echten Welt (Witcher 3).

## 1 · Scope: Teil I trägt A, B und E — die Breite legt der Schöpfer als F vor

**Teil I startet jetzt.** Jede Zone senkt eine benannte Zahl eines gesetzten Eintrags:

| Zone | Eintrag | was fällt (Zahl) |
|---|---|---|
| ort-name, ort-gesetz, ort-wirt | A, B, E | jede der 14 Klassen bekommt ihre Station (54 Zellen ohne Bild → 0); der Plan läuft im ersten Faden-Auftrag; an S2 Δ ≤ 0 |
| mess | A | 48 Rauschen + 12 haus + 8 himmel-licht = 68 ROT ohne Laufzeit-Byte; 168 Zellen werden gemessen |
| grund | A, E | wasser 12 Zellen (Teich); der Belag kostet 0 Befehle und 0 MB |
| tore | A | tor-bunt/-fern/-ziel an zehn Toren in L1 und L2 (heute ROT in L1: 18,64 Mittag, 10,61 Nacht, Soll ≥ 20) |
| gehege | A | fell 12 Zellen (3 Wölfe) |
| bewohner | A | mensch-kopf 9 und haar 9 Zellen (Gesichts-Pose 1 m, fern-Zeile, die Wache zu jeder Uhr) |

**C bleibt bei w4-verkehr-c.** C misst die Stadt nH 300 am Wort; der Platz fasst weder die Messorte stadt/stadt-voll noch ihr Wort an.

**Vorlage F für den Schöpfer** (Platz 5 der Liste ist frei; NUR der Schöpfer setzt sie in `docs/PFLICHT-OFFEN.md`):

> F) DER PRÜFPLATZ — die Ankunft jeder Welt ist eine kleine Prüfwelt, EIN Plan im Ort-Gesetz, jedes Element aus dem Gesetzbuch seines
> Studios: das Kopfstein-Rondell mit zehn Toren, Park und Teich, der Zoo, der Spielplatz mit Familien, die Arena in der Welt, die
> Rennstrecke mit Kurven und Sprüngen und darum die Stadt. KRITERIUM: F fällt, wenn jede Zone im Spielpfad benutzt wird — das Kind
> schaukelt nach dem Pendel des EINEN Leib-Lösers, die Arena antwortet dem Treffer mit allen Geräten der Schmiede über den EINEN Stoß,
> ein Wagen fährt die Runde in 55–65 s mit 18–22 m Kicker-Flug, vier Wagen mit Bewohnern am Steuer fahren 10 Runden ohne Berührung,
> die Silhouette der Stadt steht vom Platz aus —, jede Zone an ihrer Station das Profi-Band an beiden Messplätzen hält und die
> Kalt-Zeile (B) dabei nicht langsamer wird.

Die F-Briefe (spielplatz, arena, strecke, stadt) sind geschrieben und tragen oben „startet erst mit F“. Setzt der Schöpfer F nicht,
fallen sie FINAL: Briefe gelöscht, Flächen nie gelegt, kein Parken.

## 2 · EINE Quelle: Architektur und Besitz

**Der Plan.** fachwerk-core bekommt den Abschnitt `GENESIS_ORT` (die Maße aus §3 als Daten, dazu die Stationen §5 als Daten der
Elemente) und `genesisLayout(seed, welten)` → Plan v1 `{art:'genesis', platz, tore[], wege[], baeume[], ausstattung[], haeuser[],
formationen[], becken, gehege[], wache, viertel, stationen[]}`. `ortPlan` macht daraus Plan v2 mit `erdbau` wie für jedes Dorf:

- der Kern als 4 um 22,5° gedrehte Platten, Speichen, Ring-Weg, Mall und Terrasse als Trassen bzw. Platten;
- das Teich-Becken als Platte auf Bett-Höhe, der Graben des Geheges als 4 Trassen 2 m unter Grund (ERDBAU kennt `platte`, `trasse`,
  `frei`, `grund`, gelaende-core.js:1630-1660 — kein neuer Erdbau-Typ);
- `belag` je Fläche (Kern, Speichen, Ring, Mall, Terrasse). Das ist dasselbe Feld wie `platz.typ` (fachwerk-core.js:4321, heute
  `gras`/`weg`); jeder Dorf-Plan bleibt byte-gleich. In der Grau-Fassung steht dort `weg`, die Art, die der Boden heute kennt. Auf
  `pflaster` stellt ort-wirt die Zeilen, sobald grund den Term liefert. Der Boden-Stoff wirft laut auf eine Art, die er nicht kennt
  (fail-closed, kein stiller Rückfall auf Erde).

**Der Ort ist eine Funktion von Saat und Gesetz** (Lehre 7). Der Voxel-Faden rechnet den Plan als ersten Auftrag nach der
Heimat-Hydrosphäre (gelaende-chunks.js:960-962), `fest` an 0/0, ohne Ring-Suche und ohne Ort-Faden. Trägt das Gesetz an 0/0 den Kern
nicht (nass, Kaverne, Hang über der Böschung), rückt der Ort nach der Regel von heute (`_findOpenSpawnSpot`, gelaende-boden.js:402),
nun als reine Funktion im Faden. In der Standard-Welt bleibt 0/0 (Anker-Wand werkbank.cjs:944-953).

**Der Wirt liest nur.** `_genesisOrt(pos)` setzt Ort, Tore, Vorschauen, Ausstattung, Häuser, Formationen, Bäume und Zonen-Flächen und
ersetzt `_genesisPortalRing`, `_ensureGenesisPlatform` und die Vorschau-Tafel. `_genesisMitte()` liest `worldMeta.genesisOrt`.
Bestehende Welten ziehen EINMAL um (Scheibe und Ring-Tore ≤ 20 m fallen); Spieler-Bauten im Fußabdruck nimmt der Plan nicht, die
betroffene Fläche fällt laut mit Zähler.

| Element | Gesetzbuch heute | Erweiterung (additiv, Byte-Beweis) | Zone |
|---|---|---|---|
| Grundriss, Wege, Flächen, Stationen | fachwerk `ortPlan` / `dorfLayout` | `GENESIS_ORT` + `genesisLayout` | ort-gesetz |
| Belag-Art je Fläche | `platz.typ` gras/weg (fachwerk-core.js:4321) | `belag` je Fläche des Genesis-Plans (`weg`, mit grund `pflaster`) | ort-gesetz, ort-wirt |
| Kopfstein-Muster | Zellen-Stein `schuttKornO` (gelaende-core.js:3254) | `belagO` pflaster als reine Funktion CPU + WGSL, Term des Boden-Stoffs | grund |
| Teich mit gehaltenem Spiegel | Kern-Spiegel `wasserSpiegel`, `seeBecken` (gelaende-core.js:5197); eine trockene Mulde bleibt trocken (:5649-5665) | Becken-Term des Plans IM Kern-Spiegel; kein neuer Schreiber (heute 8, SKILL „Quelle je Domäne“) | grund |
| 7 porta-Tore | porta-Gestalten, Stufen porta-core.js:86-89 | Membran bunt in L1 und L2 zu jeder Uhr | tore |
| Lyra-, Vitruv-, Tier-Tor | Teile-Primitive ohne Membran | porta-Gestalten mit dem Motiv ihres Studios, L0–L3 | tore |
| Vorschauen | Wirt-Tafel `rows` (siedlung-ort.js:2357-2362) | Zeile `vorschau` je Tor im Plan | ort-gesetz, ort-wirt |
| Allee, Arten-Saum | Hof-Bäume fest Eiche/Birke, Kappe 12 (siedlung-ort.js:1669, :3558) | `art` je Baum-Zeile; die Kappe des Genesis-Plans aus dem Plan | ort-gesetz, ort-wirt |
| Laternen, Bänke, Brunnen | fachwerk Ausstattung / WERKE `bank` | – | ort-wirt setzt sie |
| Bootshaus | fachwerk-Haus `haus_alemannisch` | ein Haus-Slot des Plans | ort-wirt |
| Fels | Formationen (`formationenSatz`, Exemplar `felsbogen` der Albedo-Tafel) | – | ort-wirt |
| Wolfs-Gehege | tetrapoda-Bestand mit Geburt, Tod und Riss je Region | Term `gehege` IM Verzeichnis der Region (Raten 0, Riss nur im selben Gehege); der Rand ist Teil der EINEN Hülle (`_kreaturHuellenKontakt`, kreatur-verhalten.js:1206-1210); Hagenbeck-Graben statt Zaun | gehege |
| Wache | Rollen fahrer/nachtfahrer (koerper-core.js:1522-1523) | zwei Zeilen `waechter`/`nachtwaechter` im EINEN Rollen-Gesetz | bewohner |
| Köpfe der Bewohner | Teilung kennt nur `spieler:kopf/…` (koerper-leib.js:1671) | Kopf-Klasse `bewohner:kopf/…` | bewohner |
| Start-Viertel | Start-Dorf 110–170 m, Phase aus der Saat (siedlung-ort.js:2400-2431) | Wunsch-Ort aus dem Plan, `frei` = Fußabdruck des Platzes | ort-wirt |

**Nicht in Teil I** (Vorlage F): Spielgeräte, Kinder und Familien-Gang, Arena-Geräte, Strecke, Stadt-Silhouette und Sektoren, das
Belag-nach-Epoche-Gesetz (heute nur im Labor, worlds/fachwerk/fachwerk.js:279-280). Teil I legt keinen Zaun: das Gehege trägt den Graben.

## 3 · Grundriss (relativ zu M = `_genesisMitte`, Standard-Welt 0/0)

**Konvention:** +x Ost, +z Nord; Winkel mathematisch (0° Ost, 90° Nord). Slots a_k = 90° + k · 32,727° (k = 0 … 10; k = 0 ist die
Achse ohne Tor). Ein Tor steht bei (22 · cos a_k, 22 · sin a_k) und öffnet zur Mitte (Gier atan2(−cos a, −sin a), siedlung-ort.js:2211).
Sehne zwischen zwei Toren 12,4 m (heute 6,9 m). Der Ankunftskegel ist 21,2°–158,8° (±(53,8° + 15°) um Nord, `ERSTER_BLICK`,
dirigent-ankunft.js:1456).

| Element | Mitte (x/z) | Maß | Inhalt |
|---|---|---|---|
| Kern | 0/0 | r 10 | Kopfstein im Bogenverband, Windrose als Muster (0 Befehle); Erdbau auf dem Median des Grunds |
| Speichen | a_k | r 10–20, b 3 m (k 0: Mall 10 m) | Pflaster |
| Rasen-Keile | zwischen den Speichen | r 10–20 | Nah-Wiese |
| Ring-Weg | 0/0 | r 20–24 | Pflaster, die Tore stehen darauf |
| Tore | r 22 auf a_1 … a_10 | Slot-Tafel unten | Öffnung zur Mitte |
| Vorschauen | r 30 auf a_3, a_4, a_8, a_9 | die vier von heute | erst ≤ 14 m vor ihrem Tor |
| Kern-Laternen | r 9,5 bei 204,5°, 270°, 335,5°; Wache-Laterne r 23 bei 237,3° | 4 = `LICHT_POOL.plaetze` (stoff-material.js:3213) | alle außerhalb des Ankunftskegels |
| Bänke | r 8,5 bei 212°, 262°, 278°, 328° | 4 × fachwerk `bank` | Blick zur Mitte, außerhalb des Kegels |
| Wache | −11,35/−17,67 (r 21 auf 237,3°, Lücke T4–T5) | 2 Rollen | Tag 6–20 h, Nacht um 12 h versetzt |
| Freiraum | 0/0 | r ≤ 32 | keine Krone, kein Busch, kein Fels |
| Gürtel | 0/0 | r 32–55 | Wald (Feld-Wurf), 10 Wege und die Mall führen hindurch; Park-Gestalt, KEIN Budget-Mittel (§4) |
| Mall | x −10…10, z 24…100 | Pflaster b 10 m | Allee aus 2 × 8 Eichen bei x ±7,5, z 30, 40 … 100 (EINE Art, 2 Samen) |
| Terrasse | 0/106 | 30 × 12 m | Platte, Pflaster; `brunnen_dorf` 0/106; 2 Laternen bei ±12/106 |
| Teich | 0/140 | Ellipse, Halbachsen 40 (x) × 25 (z) | Spiegel 1,5 m unter der Terrasse |
| Ufer | 0/140 | Ellipse 50 × 35 | Rasen (erklärter Grund) |
| Bootshaus | −52/148 | `haus_alemannisch`, Hof r 10 | r 156,9: jenseits der Mesh-Zone von M |
| Wiese | x −110…−20, z 55…115 | 90 × 60 m | Rasen; Laterne −42/71 (hinter S5) |
| Fels | −95/70 | Formation ~12 × 8 × 5 m (`formationenSatz`) | Westende der Wiese |
| Arten-Saum | z 120, x −88 … −52 | 8 Bäume, 5 m Abstand | Fichte (−88, −83) · Tanne (−78, −73) · Birke (−67, −62) · Weide/`baum_erle` (−57, −52) |
| Zoo (Wolfs-Gehege) | 200,3/−173,5 (r 265 auf a_7 = 319,1°) | Fläche r 45; Gehege 16 × 12 m bei +5 … +17 m nördlich der Mitte; Graben 3 m davor | 3 Wölfe, Lager 9 m vor S8; 4 Laternen an der Schau-Terrasse; nächster Punkt 220 m von M |
| Start-Viertel | Wunsch −53,5/−182,3 (r 190 auf 253,6°) | Start-Dorf-Gesetz | außerhalb der Bildwinkel von S1 und S2 und des Ankunftskegels |
| Wege | T1 → Teich-Westufer · T2 → Wiese · T5 → Start-Viertel · T7 → Zoo (220 m) | Trassen | Wegenetz-Knoten `genesis` |

**Slot-Tafel:** In den Bildwinkeln von S1 und S2 stehen nur porta-Tore mit Membran; die drei Teile-Tore stehen im Süden.

| k | Winkel | Tor (Welt · Gestalt) | Vorschau | Weg | im Bild |
|---|---|---|---|---|---|
| 1 | 122,7° | fluid · drachentor | – | Teich-Westufer | S1, S1M |
| 2 | 155,5° | terrain · verkalkt | – | Wiese, Fels | S2 (S1 Kegelrand) |
| 3 | 188,2° | portale · kathedrale | Drachentor | Ramble W | S2 |
| 4 | 220,9° | fachwerk · ruine | Haus | – | S2 |
| 5 | 253,6° | klang · Lyra-Tor | – | Start-Viertel | – |
| 6 | 286,4° | koerperstudio · Vitruv-Tor | – | (F: Spielplatz) | – |
| 7 | 319,1° | tetrapoda · Tier-Tor | – | Zoo | – |
| 8 | 351,8° | garage · maschine | GT | (F: Strecke) | – |
| 9 | 24,5° | schmiede · maurentor | Esse | (F: Arena) | S1 Kegelrand |
| 10 | 57,3° | skeleton · geisttor | – | Ramble NO | S1, S1L |

```
                                          N (+z)
                     ARTEN-SAUM z 120          .--------------.   [Bootshaus −52/148]
                     F T B W (x −88…−52)      (  TEICH 0/140   )  Ufer 50 × 35
     .------------------------------.          `-----.--.-----´
     | WIESE x −110…−20 · z 55…115  |     [TERRASSE 0/106 · Brunnen]
     | FELS −95/70        S5 −45/75 |          ♣ | MALL | ♣   Allee Eiche x ±7,5, z 30…100
     `------------------------------´          ♣ |      | ♣
    ~ ~ ~ ~ ~ GÜRTEL r 32–55 (Park-Gestalt, Wege hindurch) ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
                 T2 verkalkt   T1 drachentor  ║A║  T10 geisttor   T9 maurentor
       T3 kathedrale              .-----------.
  W ◄─                           (  KERN r 10  )   Ring-Weg r 20–24 · Tore r 22        T8 maschine
       T4 ruine     [Wache 237°]  `-----------´                                      
                 T5 Lyra      T6 Vitruv     T7 Tier-Tor ──────────► ZOO 200/−174 (r 265)
            │                                                        Wolfs-Gehege + Graben
     START-VIERTEL −54/−182 (r 190)                                  S (−z)
```

**Reserviert für F** (nur, wenn der Schöpfer F setzt; jede Fläche ≥ 210 m von M, die Probe läuft vor dem Bau neu):
Spielplatz r 260 auf 286,4° (73/−249) · Arena r 260 auf 24,5° (237/108) · Strecke im Rahmen x 355…675, z −184…36 (≥ 355 m von M,
≥ 364 m vom Anlauf 400/400 der Messorte stadt/stadt-voll, haushalt.json:278, :321) · Stadt: Silhouette und Sektoren bei 1,1–1,5 km.

## 4 · Budget: das EINE Buch ist haushalt.json

**Regel.** Der Plan führt keine eigene Hülle. Das Gesetz von E ist die Summe des Bands (`band`: 208 Befehle · 680k Dreiecke · 118 MB ·
Frame p95 ≤ 33 ms · CPU-Takt p95 ≤ 5,8 ms); die Klassen-Zeilen (`klassen`, Σ 208/680k) nennen den Täter. Was der Platz misst, schreibt
ort-wirt als `soll`-Zeile des Messorts genesis (wie heute „Tor-Hülle“, haushalt.json:94-101); die Linse `haushalt` liest sie.

**Die Grundlinie B0 an S2** (GTX, gemessen, nicht geschätzt):

| Quelle | Ego | Third |
|---|---|---|
| Ratsche genesis-gtx (22.10., 18.546.55) | 107 Befehle · 286k · 105 MB | 142 · 379k · 108 MB |
| K3#1 ec989990 (z106, 30./31.10.) | VRAM 116,8 MB | VRAM 122,2 MB · CPU-Takt 6,5 ms |
| Klasse bau darin (Ratsche) | 45 / 94k | 60 / 143k (Soll 40 / 60k, haushalt.json:567) |

Die Lücke zum Band an S2 Third (VRAM −4,2 MB, CPU −0,7 ms) besitzen **w4-e-vram** (der Satz wird an seinem Inhalt geboren) und
**w4-e-takt** (der Haupt-Faden). Der Platz bucht nichts auf E: an S2 gilt Δ ≤ 0.

**Zuerst der Spike S0** (Lehre 18; Koordinator, Radeon, ~3 min, vor ort-wirt): `ringR` 11 → 22 live in der Werkbank (Lehre 20), dann
`zaehlen` und `puffer` an S1 und S2 in Ego und Third. Er misst die Tore bei R 22: L2 im Bild plus je Tor der L3-Wurf in den Kaskaden
(porta-core.js:88-89: L2 ≤ 12 500 Dreiecke, Band 6 000, 6 Befehle; L3 ≤ 12 000 / 1 Befehl je Tor). Seine Zahlen ersetzen jeden Ansatz
unten und gehen als `soll` in haushalt.json.

**Residenz.** VRAM an einer Station ist die Summe ALLER Zonen ≤ 210 m: der Kehraus behält jeden Puffer, den der Szenen-Graph trägt
(bild-kosten.js:959-990), unabhängig vom Blick. Der Gürtel verdeckt nur Pixel; der Berg-Cull wirkt erst ab 140 m und nur auf
Siedlungs-Bündel (siedlung-instanz.js:1302-1303). Darum liegen alle Akteur-Zonen ≥ 210 m von M. Laut Probe sind an S2 resident:
Kern, Allee, Terrasse, Teich, Wiese, Fels, Saum, Bootshaus, Start-Viertel — der Zoo nie (nächster Punkt 220 m).

**Zonen-Budget je Station** (Δ gegen den Kopf vor der Zone; die Summe an jeder Station hält das Band):

| Zone | gilt an | Befehle / Dreiecke | VRAM | CPU-Takt | Bedingung |
|---|---|---|---|---|---|
| ort (Grau-Fassung) | S1, S2 (A = ort-name, B = ort-wirt; ABAB 4+4) | Δ ≤ 0 | Δ ≤ 0 | Δ ≤ 0 (unter 2σ = 0,8 ms) | es fallen Plattform, Ring R 11, 4 residente Vorschauen und der Wald im Freiraum; es kommen Tore R 22, 4 Laternen, 4 Bänke, die Allee als Karte und die residenten Park-Zonen |
| grund | S1 (Belag), S6 (Teich) | Belag 0 / 0; Teich ≤ 1 + Wasser-Satz | Belag 0; Teich-Spiegel +1,7 MB, an S2 im Δ ≤ 0 von ort | 0 auf dem Haupt-Faden | GPU-Zeit Belag ≤ +0,2 ms (gpu-bank S1), Teich ≤ 1,0 ms (S6) |
| tore | S1L, S1M (L1), S3 (L2) | je neue Gestalt in porta's eigenen Bändern (porta-core.js:86-89) | ≤ +0,5 MB | 0 | die sieben bleiben byte-gleich |
| gehege | S8, S8f | Summe an S8 ≤ Band; 3 Leiber L0 ≤ 3 × 62 000 / 8 (tetrapoda-core.js:45) | ≤ +4 MB | ≤ +0,8 ms | an S2 Δ 0 (nicht resident, nicht in der Kappe) |
| bewohner | S10, S2 | die Wache an S2 außer Blick im Satz: ≤ 2 Befehle / 3 400 | ≤ +1 MB | ≤ +0,2 ms | Leib nur ≤ 8 m (`BEWOHNER.nahM`, siedlung-bewohner.js:2579) |

**Die Klasse tier an S8:** 3 Wolf-Leiber in L0 kosten bis 186k Dreiecke gegen das Klassen-Soll 60k. Das Klassen-Soll gilt den Messorten;
an S8 hält der Plan die Summe (Ansatz: Wald und Boden wie an der Wiese, 105 / 386k, plus Wölfe ≈ 135 / 572k < 208 / 680k). Reißt die
Summe, ist der Täter der L0-Wolf über seinem Band (62 000 gegen 20 000, tetrapoda-core.js:45); gehege schneidet ihn.

**Messen:** `werkbank zaehlen` je Station nach Zonen-Marke, `werkbank takt` für den ms-Anteil je Takt-Glied, `werkbank puffer` für VRAM.
Die Radeon misst der Koordinator, die GTX die OMEN-Station.

**Das Licht der Nacht** (LICHT_POOL: 4 Plätze im Umkreis 48 m, gewählt nach Reichweite zum Auge — Laterne 12 m, Tor 14 m):

| Station | die 4 Plätze bei Uhr 0 |
|---|---|
| S1, S2 | 3 Kern-Laternen (9,5 − 12 = −2,5) und ein Tor (22 − 14 = 8); die Wache-Laterne (23 − 12 = 11) bekommt keinen Platz |
| S3 | T5, T6 (7,4 m), die Kern-Laterne bei 270° und die Wache-Laterne |
| S1L, S1M | das Tor in 10,6 m (−3,4) und die 3 nächsten Quellen |
| S10 | die Wache-Laterne (3 m), T4 und T5 (6,3 m) und eine Kern-Laterne |
| S10f | T1, T10, T2 und eine Kern-Laterne; die Wache steht dort ohne Punktlicht — das Maß der Nacht der fern-Zeile legt mess fest |
| S4 | T1 und T10 (43 m − 14) und die 2 Terrassen-Laternen |
| S6, S9f | die 2 Terrassen-Laternen |
| S5, S7, S7f, S11 | die Wiesen-Laterne −42/71 |
| S8, S8f | die 4 Zoo-Laternen |

## 5 · Prüf-Posen

**Regeln.** Ego = Grund + 1,6 m (`EGO_AUGE_M`, dirigent-kern.js:1864). Third = Arm 6 m / 2 m (dirigent-kern.js:216-217) hinter dem Spieler.
Uhr 0,5 (12 h) / 0,3 (7,2 h) / 0 (0 h) hält die Bühne. nah ≤ 30 m und fern > 30 m bestimmt die Tiefe je Pixel (zug/a-spawn.cjs:15).
Im Bild ab 0,1 % (2 074 px, zug/a-spawn.cjs:53). Ausnahme sind die fern-Zeilen unten.

**Die Stationen sind Daten des Plans** (§2 `stationen`, aus den Elementen gerechnet, nie eine zweite Koordinaten-Liste). Eine Station,
die ihre Klasse nicht zeigt, rückt im Plan. Die Posen-Linse (ort-gesetz) prüft headless, bevor ort-wirt landet:

- Kamera in keinem Grundriss, keinem Wasser, nicht im Gürtel abseits eines Wegs;
- Ziel im Bildwinkel;
- Abstand nah/fern wie verlangt;
- Anteil nach der Lochkamera (f = 704 px);
- Sichtlinie je Meter auf erklärtem Grund oder Wasser;
- fremde Zonen im Kegel und residente Zonen werden gelistet.

| Station | Ego-Ort → Blick | Third | Klassen × Zelle | Probe (Ego / Third) |
|---|---|---|---|---|
| S1 Ankunft | 0/0 → 0/50 | Kamera 0/−6 | laub fern (Allee 40 m) · das Ankunftsbild der Kalt-Zeile | 1,73 % / 1,32 % |
| S1L Tor L1 | 6,16/9,59 → T10 (10,6 m vor dem Tor) | Spieler 4,6 m vor dem Tor, Kamera ebenda | tor-* nah in L1 | 5,95 % |
| S1M Tor L1 | −6,16/9,59 → T1 | wie S1L | tor-* nah in L1 | 5,95 % |
| S2 Messort E | 0/0 → −10/0 (unverändert) | `--gesicht` am Spieler (wie heute) | mensch-kopf, haar Third nah · Band und ABAB | – |
| S3 Tor-Gegenblick | 0/−17 → 0/22 | Kamera 0/−23 (Lücke T5–T6) | tor-* fern in L2 (T1, T10 in 37,4 m) | 0,95 % / 0,72 % |
| S4 Allee | 0/60 → 7,5/72 | Kamera −3,2/54,9 | laub, laub-kante nah (Eiche 12,5 m, Krone gegen den Himmel) | 13,8 % / 6,3 % |
| S5 Wiese | −45/75 → −80/95 | Kamera −39,8/72,0 | boden-nah nah+fern · boden-nah-farbe nah+fern · laub-kante fern (Saum, Waldrand) | 5,9 % / 4,5 % |
| S6 Teich | 0/112 → 0/150 | Kamera 0/106 | wasser nah (8–30 m) und fern (30–38 m) · laub-kante fern (Ramble im Spiegel) | beide Bänder |
| S7 Fels | −77/72 → −95/70 | Kamera −71,0/72,7 | fels nah (18,1 / 24,1 m) | 3,64 % / 2,05 % |
| S7f Fels fern | −50/80 → −95/70 | Kamera −44,1/81,3 | fels fern (46 / 52 m) | 0,56 % / 0,44 % |
| S8 Zoo | Schau-Terrasse, 2 m südlich der Zoo-Mitte → Gehege | Spieler 1 m nördlich der Mitte | fell nah (3 Wölfe 10–15 m bzw. 13–18 m) | 0,29 % / 0,19 % |
| S8f Zoo fern | 24 m südlich der Mitte → Gehege | Spieler 18 m südlich | fell fern (32–37 m, fern-Zeile) | 253 px je Wolf |
| S9 Bootshaus | −44/130 → −52/148 (Ufer) | Kamera −41,6/124,5 | haus nah (19,7 / 25,7 m) | 3,69 % / 2,17 % |
| S9f Bootshaus fern | 0/112 → −52/148 (über das Wasser) | Kamera 4,9/108,6 | haus fern (63 / 69 m) | 0,36 % / 0,30 % |
| S10 Gesicht | −10,81/−16,83 → die Wache (1,0 m) | – (Third nah: S2) | mensch-kopf, haar Ego nah, Gesichts-Pose wie `--gesicht 0.7` | Kopf 0,96 % |
| S10f Mensch fern | −3,07/13,24 → die Wache (32 m) | Spieler 34 m, Kamera 40 m | mensch-kopf, haar fern (fern-Zeile) | 382 / 244 px |
| S11 Arten-Saum | −70/104 → −70/121 | Kamera −70/98 | laub, laub-kante nah je Art: Fichte, Tanne, Birke, Weide (16–24 / 22–28 m) | 23,6 % / 14,2 % |

**Jede Klasse in ihren 12 Zellen** (Ego/Third × nah/fern × 3 Uhren):

| Klasse | nah | fern | Licht der Nacht |
|---|---|---|---|
| boden-nah | S5 (Wiese, nie auf dem Pflaster) | S5 | Wiesen-Laterne |
| boden-nah-farbe | S5 (2–5 m) | S5 (neue fern-Zeile, mess) | Wiesen-Laterne |
| himmel-licht | `werkbank licht` zur Uhr der Bühne | dieselbe | – |
| laub | S4 (Eiche) · S11 (Fichte, Tanne, Birke, Weide) | S1 (Allee) · S5 (Saum) | Terrasse, Wiese |
| laub-kante | S4 · S11 | S5 · S6 | dieselben |
| haus | S9 | S9f | Terrasse |
| wasser | S6 | S6 | Terrasse |
| tor-fern, tor-bunt, tor-ziel | S1L, S1M (L1) | S3 (L2) | Tor bzw. Kern-Laternen |
| fels | S7 | S7f | Wiese |
| mensch-kopf, haar | Ego S10 (Gesicht 1 m) · Third S2 (`--gesicht` am Spieler) | S10f | Wache-Laterne |
| fell | S8 | S8f | Zoo-Laternen |

**Ziel nach Phase 2:** 168 Zellen mit Bild.

- **fern-Zeilen** (mess, mit Quelle): fell, mensch-kopf und haar sind jenseits 30 m kleiner, als 0,1 % trägt. Ein Kopf in 4 m bringt
  0,045 %, 3 Wölfe in 42 m 0,02 %. `gesicht` und `strich` messen bei 0,7 m und 4 m. Die fern-Zeile zählt darum ab 200 px je Instanz des
  Leibs (Lochkamera: ein Mensch 0,79 m² in 40 m = 245 px, ein Wolf 0,6 m² in 34 m = 253 px). Ihr Maß ist das Albedo-Verhältnis der
  Fern-Stufe gegen das Labor (neue Zeilen der Albedo-Tafel).
- **Tafel-Lücken** (mess, mit Quelle, nie ein gesenktes Soll): himmel-licht zu 0,3 und 0 (spec/farbe/tag-ref.json; `__lichtBilanz` misst
  zur Uhr der Bühne statt Mittag), boden-nah-farbe fern, die drei fern-Zeilen und die Tor-Ausdrücke der drei neuen Gestalten.
- **Gestrichen gegenüber Fassung 1:**
  - boden-nah an S1 (das Pflaster ist `bodenSatz` und zählt als Lücke im laiWirk, soll-tafel.json boden-nah `mass.rechnung.grund`).
  - Die Sichtschutz-Regel „Zählung je Zonen-Marke = 0“.
  - Die Stationen Arena, Strecke und Stadt (in Fassung 1 S10, S11, S12; jetzt Vorlage F). Die Namen S10 und S11 tragen jetzt
    Gesicht und Arten-Saum.

## 6 · Lade-Reihenfolge der Ankunft (B ≤ 5 s kalt)

- **S−1, im Faden vor dem ersten Chunk des Spawn-Rings:**
  - Der Genesis-Plan ist der erste Auftrag des Voxel-Fadens nach der Heimat-Hydrosphäre, `fest` an 0/0.
  - Er wartet auf keine Hydro-Kachel und gebiert keinen Ort-Faden; heute tun beides `_ortWahlImFaden` (gelaende-boden.js:901-911) und
    `_nebenFaden` mit vollem Schnappschuss (gelaende-chunks.js:363-392).
  - Der Erdbau steht im Faden-Zustand, bevor ein Chunk des Rings rechnet.
  - Soll: t(Plan) ≤ 50 ms im Faden, ≤ 2 ms Haupt-Faden beim Empfang (Transfer). t(Plan) steht als eigene Spalte in der Kalt-Zeile.
  - Der Spieler steht an M auf Grund + 1,2 m, Gier 0. Der Ruf sitzt in gelaende-chunks.js:966-975; das fail-soft `try/catch` mit
    „Genesis-Plattform fehlgeschlagen“ (:971-975) fällt, ein Wurf meldet laut über `_bruchMelden`.
- **S0, hält das erste Bild** (Kegel 21,2°–158,8°, Mesh-Zone 150 m, dirigent-ankunft.js:1129):
  - Boden mit Erdbau; der Belag ist ein Term des BESTEHENDEN Boden-Stoffs, 0 Befehle, kein neues Programm.
  - Licht, Leib, Horizont.
  - T1, T10 (T2, T9 am Rand) in ihrer billigsten ganzen Stufe wie heute.
  - Die Allee: EINE Art (Eiche), 2 Samen, als Karte.
  - NICHTS mit neuem Stoff: Brunnen, Laternen, Bänke, Teich-Wasser, Fels, Saum und Bootshaus fehlen im ersten Bild.
- **S1, rundum vor der Kontrolle:** T2–T9 wie heute der Ring, die 4 Kern-Laternen und 4 Bänke (außerhalb des Kegels). Grund: Der Rundblick
  (gate:ankunft L2a, `RUNDBLICK_BILDER` 120, dirigent-ankunft.js:1237-1240) dreht gleich nach der Kontrolle und nennt jedes Fehlen.
- **S2, nach der Kontrolle** (der Weg von `_bootDeferCreatures`, gelaende-chunks.js:966 → `_tickBootPhase3`, nah zuerst): Brunnen,
  Terrassen-Laternen, Fels, Saum, Bootshaus, der Teich-Spiegel. Vorschauen erst ≤ 14 m vor ihrem Tor (heute ≤ 22 m,
  siedlung-ort.js:2364).
- **S3, Dorf-Zug:** das Start-Viertel am Wunsch r 190 auf 253,6°, außerhalb des Kegels; mit ihm die Wache (ihr Heim).
  - **Übergabe an ankunft-5:** Die Terme „das Dorf wird geplant“ (dirigent-ankunft.js:1161) und „das Dorf wird gegründet“ (:1166)
    halten das erste Bild ohne Blick-Prüfung, auch für ein Dorf im Rücken. Liegt der Wunsch außer Blick, dürfen sie es nicht halten.
- **S4, Annäherung:** der Zoo (nächster Punkt 220 m) wird erst fällig, wenn der Spieler ≤ 210 m heran ist, nie vor dem ersten Bild.

**Regeln der Ankunft:**
1. Im Kegel bis 150 m steht kein Akteur, und nichts bewegt sich in 60 s (K2 ≤ 2 %, diag-boot-stage.cjs).
2. Programme vor dem Bild vorher = nachher. Die Kalt-Zeile zählt sie; ein neues Programm im Kegel ist ROT beim Namen.
3. Die Kalt-Zeile ist ein ABAB mit 4+4 Boots je Gerät (3+3 verdeckte ±0,5 s). t(Plan), t(Weltbild) und t(Kontrolle) werden einzeln
   ausgewiesen, K2-halb ≤ vorher. Das ist das Tor jeder Zone, die etwas in S0 oder S1 stellt.

## 7 · Mess-Kopplungen (neu geeicht in derselben Welle)

| # | Kopplung | was der Platz bricht | Besitz · Zeitpunkt |
|---|---|---|---|
| 1 | haushalt.json genesis: Titel „R 11 m“, `ortTakt` (:90-92), Täter-Regel bau mit `start_plattform` (:590) | Ort-Takt-Name, tote Art | ortTakt: ort-name; Titel, Regel und `soll` aus dem Spike: ort-wirt |
| 2 | Ort-Takt-Name als A-Seite des ABAB | die A-Seite kennt `_genesisOrt` nicht | ort-name (Vor-Commit) |
| 3 | Anker-Wand werkbank.cjs:944-953 | ein Ort neben 0/0 | hält: `fest` 0/0 in der Standard-Welt · ort-wirt prüft |
| 4 | werkbank.cjs:926 `__weltDa(() => st.worldMeta.genesisPortalRing)` | der Import der Prüfbühne wartet ohne Ende | ort-wirt, nach mess-1 (Datei-Folge §9) |
| 5 | die 29 Dateien mit 104 Treffern der sterbenden Namen (§9 ort-wirt) | jeder Leser liest Scheibe oder Ring 11 m | ort-wirt, EINE Welle |
| 6 | gate:pruefbuehne zählt 21 Werke (werkbank.cjs:908-913: 7 Prüfkörper + 10 Tore + 4 Vorschauen) | die Vorschauen stehen erst ≤ 14 m vor dem Tor | Zahl aus dem Plan: 7 + 10 + 8 Kern-Werke = 25 · ort-wirt |
| 7 | soll-tafel: Tor-Kameras absolut (−11,6/90,24/36,48 …) und der Tor-Ausdruck mit 7 Gestalten | R 22 trifft kein Tor; die 3 neuen Gestalten fehlen | Posen aus `stationen`; Ausdruck +3 (Namen liefert tore) · mess |
| 8 | zug/a-spawn.cjs: 8 Blicke ab M | Klassen stehen an Stationen | Stationen aus dem Plan · mess-2 |
| 9 | K2-Bild: `SCHUSS` (diag-boot-stage.cjs:76) hält nur Kreaturen (ausgabe-aufnahme.cjs:477-493) | Akteure und Membran-Zeit zählen als Lücke | mess baut den Halter in `__buehne`; Membran, Brunnen, Teich und Laternen hält er wie das Band-Instrument (bericht/0910-4); den Leser in diag-boot-stage.cjs zieht ankunft-5 nach oder mess nach dessen Landung |
| 10 | ABAB g-third, g-ego | der Platz ändert, was S2 sieht | A = ort-name, B = ort-wirt, je 4 Boots, nicht langsamer unter 2σ (gpu-bank 0,56 ms · Belegung 0,74 · CPU-Takt 0,4) · Koordinator, OMEN |
| 11 | 4 Ratschen genesis × {gtx, radeon} × {ego, third} | jeder Platz-Bau ist ROT | Re-Mint am Platz-SHA mit 4 Boots, NACH w4-gras-saum (re-mintet dieselben 12 Ratschen); `frei.tier` bleibt, der Zoo liegt außerhalb · Koordinator |
| 12 | Punkte genesis-* (Uhren 7/11/58 s) und die Punkte am Genesis-Ort (tore.K3, siedlung.K1#2, halten.K4, ferne.K1/K2, licht.K1#1, material.K2#1, vegetation.K3#2, bauen.K3#1, gelaende.K2#1) | Orte wandern mit | den Stau vorher buchen, dann die Reihen neu ab Platz-SHA · mess-3 + Koordinator |
| 13 | Albedo-Tafel, haus veraltet seit 1dcb844f | 12 Zellen ROT | `werkbank albedo --tafel` auf der Radeon · mess-1 sofort |
| 14 | Entscheid E-F „start_plattform = Welt-Substanz“ (diag-asset-inventory.cjs:19, :176, :183; docs/abnahme-drehbuch.md:37) | die Plattform fällt | das Schöpfer-Wort vom 31.10. („statt diese komische plattform“) hebt ihn für die Plattform auf, die fliegenden Inseln bleiben · ort-wirt |
| 15 | alter Spielstand (playtest/speicher.cjs:148: `genesisPortalRing: true`), Voxel-Edits unter dem neuen Erdbau | Doppelform, Edits gegen Erdbau | Migrations-Probe: alter Stand → EIN Plan, Edits bleiben, Ring und Scheibe fallen. Der Umzug nennt keinen alten Namen im Code: ein Eintrag ohne Bauplan fällt beim Laden laut mit Zähler, ein Tor neben seinem Slot rückt auf ihn, ein unbekannter worldMeta-Schlüssel fällt beim nächsten Speichern; die 9 Namen bekommen ihre Zeile in gate:altlasten · ort-wirt |
| 16 | Radeon-Ratschen vom 14.10. (Third 180 / 959k) | keine Basis für das Platz-ABAB | Radeon-Basis an S2 vor dem ABAB · Koordinator, Welle a |
| 17 | Messorte stadt/stadt-voll (Anlauf 400/400) | – | Teil I legt nichts in 210 m um den Anlauf; F hält ≥ 150 m (Strecke ≥ 364 m) |

## 8 · Phasen, Tore, Wellen

- **Phase 0 (Blockout und Apparat).** Der Platz steht als EIN Plan in der Grau-Fassung am echten Ort. Die Flächen tragen Belag `weg`
  (die Art, die der Boden kennt), bis grund das Pflaster bringt und ort-wirt die Zeilen umstellt. Jede Fläche ohne Inhalt bleibt Fläche, nie eine graue Ersatz-Box. Dazu kommen mess-1, der Spike S0 und
  die Radeon-Basis.
- **Tor 0** (vor jeder Zone im Plan):
  - ABAB 4+4 g-third und g-ego nicht langsamer.
  - Kalt-Zeile 4+4 an der GTX mit t(Plan), t(Weltbild), t(Kontrolle): Median nicht schlechter, K2-halb ≤ vorher, 0 neue Programme vor
    dem Bild.
  - Absenz `start_plattform|GENESIS_PLATZ|_genesisPlattform|_genesisScheibe|_genesisGrund|_findOpenSpawnSpot|_ensureGenesisPlatform|_genesisPortalRing|genesisPortalRing`
    = 0 über `window.__codeOf` (Kommentare dürfen sie zitieren) und in gate:altlasten (9 neue Zeilen); auch der Umzug alter Stände
    nennt sie nicht (§7 Nr. 15).
  - Posen-Linse GRÜN.
  - Jede Klasse, deren Inhalt es gibt (tor-* L1/L2, laub, laub-kante, boden-nah, boden-nah-farbe, himmel-licht, haus, fels,
    mensch/haar Third), steht an ihrer Station mit ≥ 0,1 %.
  - gate:pruefbuehne zählt die Werke aus dem Plan; die Migrations-Probe ist GRÜN; die 4 Ratschen sind re-mintet.
- **Phase 1:** tore, grund, gehege und bewohner auf Ziel-Niveau. Jede Zone schreibt ihr Gesetz additiv in den Kern (Byte-Beweis,
  Labor = Welt); ihren Haken in den Plan setzt ort-wirt. Tor je Zone:
  - Budget-Zeile §4 an ihrer Station (Radeon-Zählung);
  - ihre Klassen im Bild;
  - Kalt-Zeile, wenn sie etwas in S0/S1 stellt;
  - ABAB, wenn sie an S1/S2 baut.
- **Phase 2:**
  - A-Tafel 14 × 12 = 168 Zellen an S1–S11, Radeon (Koordinator) und GTX (Station), 0 Zellen ohne Bild.
  - ABAB g-third und g-ego; Kalt-Zeile an beiden Geräten.
  - Ratschen, Punkte-Reihen, Buchung.
- **Phase 3, schleifen:** Jede ROT-Zelle geht an ihren Täter beim Namen:

  | Klasse | Täter |
  |---|---|
  | boden-nah, boden-nah-farbe | vegetation-wiese |
  | laub, laub-kante | phyto/Foundry-Karten |
  | haus | fachwerk |
  | wasser | Wasser-Blick |
  | tor-* | porta |
  | fels | Formationen |
  | mensch-kopf, haar | koerper/Mensch-Ofen |
  | fell | tetrapoda |
  | himmel-licht | Licht-Kette |

**Wellen** (Datei-Besitz §9; die Wartelisten sind die Dateilisten der laufenden Zweige seit ihrer Abzweigung, gelesen am 31.10. 20:00):

- **Welle a, sofort** (ohne Konflikt):
  - mess-1: soll-tafel.json, albedo-tafel.json, ausgabe-aufnahme.cjs, zug/a-spawn.cjs.
  - Kern und Wirt von gehege: tetrapoda-core.js, kreatur-*.
  - Kern von bewohner: koerper-core.js, koerper-leib.js.
  - Kern von grund: gelaende-core.js.
  - Koordinator: Spike S0, Radeon-Basis S2, Versand-Vorbedingungen §13.
- **Welle b, nach w4-studios-heim im main** (148 Dateien; dazu fachwerk-core.js, porta-core.js, siedlung-ort.js, werkbank.cjs,
  omen-messfolge.cjs):
  - ort-gesetz (0b);
  - tore;
  - ort-name (0a), zusätzlich nach w4-gras-saum (haushalt.json).
- **Welle c, nach ort-gesetz im main und den Wartelisten von ort-wirt:** ort-wirt (0c), das Tor 0.
- **Welle d, nach ort-wirt im main:**
  - Haken der Zonen in den Plan (Besitz ort-wirt);
  - Wirt von grund: stoff-material.js, siedlung-wege.js nach gras-saum und ankunft-3/-5;
  - Wirt von bewohner: siedlung-bewohner.js nach w4-verkehr-c und w4-stadt-takt;
  - mess-2: Stationen aus dem Plan.
- **Phase 2:** mess-3 und der Koordinator.
- **F:** nur, wenn gesetzt.

## 9 · Zone → Arbeiter → Dateien (Besitz)

| Zone | Zweig | Dateien (nur diese) | wartet auf | Ort | Ports |
|---|---|---|---|---|---|
| ort-name (0a) | w4-genesis-ort-name | stamm/siedlung-ort.js (nur `_genesisOrt` neu und `_tickGenesisOrt`), spec/profiband/haushalt.json (nur genesis.ortTakt), scripts/omen-messfolge.cjs:1222 | w4-studios-heim, w4-gras-saum | Cloud | – |
| ort-gesetz (0b) | w4-genesis-ort-gesetz | fachwerk-core.js §GENESIS_ORT (neuer Abschnitt am Ende) und `ortPlan` art genesis; worlds/fachwerk/fachwerk.js (der Genesis-Plan im Labor); die Posen-Linse als Abschnitt von scripts/diag-fachwerk-contract.cjs mit Selbsttest | w4-studios-heim | Cloud | – |
| ort-wirt (0c) | w4-genesis-ort-wirt | stamm/siedlung-ort.js · stamm/gelaende-boden.js · stamm/gelaende-chunks.js (Spawn-Ruf) · voxel-worker.js (erster Auftrag) · stamm/bau-vorlagen.js (nur start_plattform, nach tore) · stamm/vegetation-baum.js (:1942, :2069) · stamm/koerper-seele.js (:348-359) · spec/profiband/haushalt.json · scripts/diag-altlasten.cjs (9 Zeilen `FORBIDDEN`) · scripts/werkbank.cjs (nur :926 und Anker, nach mess-1) · die 29 Dateien des Abschieds · ab Welle d §GENESIS_ORT (Daten-Zeilen) | ort-gesetz, w4-studios-heim, w4-ankunft-3, w4-ankunft-5, w4-verkehr-c, w4-stadt-takt, w4-gras-saum, mess-1, tore | Lokal: Grau-Fassung sehen, Stamm-Chirurgie | 4560–4569 · 8020 |
| mess | w4-mess-platz (main), w4-mess-platz-koord (koordination) | spec/abnahme/soll-tafel.json, spec/farbe/albedo-tafel.json, scripts/lib/ausgabe-aufnahme.cjs (Halter in `__buehne`), scripts/werkbank.cjs (nur `bild` und Bühne), scripts/lib/abnahme-urteil.cjs (nur falls nötig), zug/a-spawn.cjs, zug/a-spawn.sh | Tafel und Halter sofort; werkbank.cjs und abnahme-urteil.cjs nach w4-mensch-kopf und w4-studios-heim; diag-boot-stage.cjs gehört ankunft-5 | Lokal (Rauschen nur auf echter GPU) | 4660–4669 · 8040 |
| grund | w4-grund | gelaende-core.js (nur `belagO` und Becken-Term) · worlds/gelaende/* · stamm/stoff-material.js (Term im Boden-Stoff) · stamm/siedlung-wege.js (Belag „wo“) · stamm/wasser-zellen.js und stamm/wasser-hydro.js (nur die Leser des Becken-Terms; `_ensureWaterCALevel` wasser-zellen.js:2020) | Kern sofort; Wirt nach w4-gras-saum, w4-ankunft-3/-5 (stoff-material.js) und ort-wirt | Lokal (Look) | 4670–4679 · 8060 |
| tore | w4-tore-teile | porta-core.js · worlds/portale/porta.js · stamm/bau-vorlagen.js (welt_klang/-koerperstudio/-tetrapoda und ihre Teile) | w4-studios-heim | Cloud | – |
| gehege | w4-gehege | tetrapoda-core.js · stamm/kreatur-leben.js · stamm/kreatur-verhalten.js · worlds/tetrapoda/* | Kern und Wirt sofort; Haken nach ort-wirt | Cloud | – |
| bewohner | w4-bewohner-wache | koerper-core.js (2 Rollen-Zeilen) · stamm/koerper-leib.js (Kopf-Klasse) · stamm/siedlung-bewohner.js (Rollen-Vergabe) | Kern sofort; siedlung-bewohner.js nach w4-verkehr-c, w4-stadt-takt und ort-wirt | Cloud | – |

**Besitz in Folge statt doppelt:**
- **bau-vorlagen.js:** tore bis zur Landung, dann ort-wirt.
- **werkbank.cjs:** mess-1 bis zur Landung, dann ort-wirt (nur :926 und Anker).
- **fachwerk-core.js:** ort-gesetz bis zur Landung, dann ort-wirt (Daten-Zeilen §GENESIS_ORT).
- **haushalt.json:** ort-name (ortTakt), dann ort-wirt.

Kein Paar von Zonen hält dieselbe Datei zur selben Zeit. Höchstens 3 GPU-champions lokal: ort-wirt, mess, grund.

## 10 · Referenzen der Besten

| Zone | Vorbild | was es setzt |
|---|---|---|
| Kern, Tore | Alexander Pattern 61 (Platz ≤ 21 m), Gehl (< 25 m Details), Disneyland-Hub (EIN Wienie in der Achse), Peach's Castle in Mario 64 (die Bilder sind die Tore) | Kern r 10, Sehne 12,4 m, Achse auf den Brunnen; die Membran zeigt ihr Ziel |
| Park | Greensward-Plan 1858: Mall mit Allee → Bethesda Terrace → Lake; Sheep Meadow gegen Ramble | Achse, Terrasse, Teich, Wiese gegen Wald |
| Grund | Granit-Kleinpflaster 9–11 cm und Großpflaster 14–16 cm im Segmentbogen, Sandfuge 8–12 mm (Prager Altstadt, Grand-Place) | Steinmaß, Fuge, Kuppe, Glanz der Laufspur, Moos am Rand |
| Fels | Umpire Rock (Central Park) | eine Formation an der Wiese |
| Zoo | Hagenbeck (Gehege ohne Gitter im Blick: der Graben), Central Park Zoo (kleine Gehege), Horizon (deterministische Setzung) | Graben statt Zaun, feste Zahl, dieselben Tiere in jedem Boot |
| Mess | Unreal Functional Screenshot Test (verrauschte Merkmale aus, Toleranz, Soll-Bild im VCS), AC Origins (tägliche Welt-Tests), Epic AutomatedPerfTesting | ein Boot fährt alle Stationen, das Rauschen gehalten |
| F: Spielplatz, Strecke, Stadt, Arena | Heckscher Playground; SuperTuxKart, McMillan 2011, Forza Horizon; Matrix Awakens, GTA V, HLOD; Matterhorn als Neben-Wienie | in den F-Briefen |

## 11 · Risiken

1. **Haupt-Faden (E, CPU-Takt).**
   - Genesis Third steht schon vor jedem Akteur bei 6,5 ms > 5,8 (z106).
   - Gegenmittel: Den Schnitt besitzen w4-e-takt und w4-e-vram. Der Platz legt keinen Akteur in 210 m um M; die Wache steht 21 m weit im
     Satz außer Blick. Jeder Akteur jenseits 60 m oder außer Blick ruht als Zahl. Jede Zone misst ihren ms-Anteil vorher↔nachher.
2. **Ankunft (B).**
   - Der Plan liegt auf dem kritischen Pfad.
   - Ein neues Programm im Kegel kostet sofort.
   - Die Dorf-Terme halten das Bild ohne Blick-Prüfung (dirigent-ankunft.js:1161, :1166).
   - Gegenmittel: der Plan als erster Faden-Auftrag ≤ 50 ms, S0 ohne neuen Stoff, Teich-Wasser nach der Kontrolle, das Start-Viertel
     außer Blick, die Dorf-Terme an ankunft-5, Kalt-Zeile 4+4 mit t(Plan).
3. **Stau der Wartelisten.**
   - w4-studios-heim (148 Dateien) hält ort-name, ort-gesetz und tore.
   - ort-wirt wartet zusätzlich auf ankunft-3/-5, verkehr-c, stadt-takt, gras-saum, mess-1 und tore.
   - Gegenmittel: Welle a fährt die Kerne von mess, gehege, bewohner und grund sofort; ort-gesetz läuft in der Cloud parallel zum
     Warten; ort-wirt ist der einzige große lokale Zweig.

**Weitere Risiken:**
- **Vergleichbarkeit:** 4 Ratschen, die Punkte-Reihen genesis-* und die Tor-Posen brechen. Der Re-Mint läuft in derselben Welle nach
  gras-saum; den Stau bucht der Koordinator vorher.
- **Der Teich:** 8 Wasser-Schreiber, die Seen doppelt. Der Becken-Term ist Kern-Spiegel, kein neunter Schreiber; grund zählt die
  Schreiber vorher↔nachher.
- **Klasse tier an S8:** 3 L0-Wölfe bringen bis 186k gegen 60k. Die Summe hält im Ansatz; sonst schneidet gehege den L0-Wolf zum Band.
- **F wird nicht gesetzt:** die vier F-Briefe fallen FINAL, Teil I bleibt ganz.

## 12 · Lehren der letzten Abgaben (vorher↔nachher, in jedem Brief)

| Abgabe | was geschah | Regel |
|---|---|---|
| genesis-tore (Cloud, 4ec9f71d) | Bild vorher/nachher (Radeon), ABAB z106 nicht langsamer, Kern byte-gleich bis auf den Re-Mint 24/37 uv | das Muster |
| mensch-kopf (Cloud) | z107 riss nach 90 min (351× keine L2-Gestalt) | jede Laufzeit-Abgabe fährt `npm run playtest:fast` am Merge-Kandidaten |
| ankunft-3 | Kalt-Zeile schneller, aber K2 öfter halb (3/4 statt 1/3) | K2 zählt vor dem Landen |
| b-panorama | swiftshader 8,0 → 5,3 s, an der GTX kein früheres Weltbild | ein Gewinn zählt nur am echten Gerät |
| a-spawn-gtx | lief mit leerem Skript und meldete Exit 0 | jede Station prüft ihre Eingabe und bricht leer ROT ab |
| b-streu | Streu-Faden 1,0–1,4 → 0,23–0,30 s, Kontrolle 20,7 → 17,8/18,9 s (GTX) | ein Faden-Schnitt trägt, wenn er am echten Gerät gemessen ist |
| Plan Fassung 1 | Sichtschutz nur auf Pixel, 120 MB > 118 an S2, 3 Kameras im Gürtel | erst die Posen-Probe und der Spike, dann die Zahl im Plan |

## 13 · Vor dem Versand (Koordinator; harte Vorbedingung)

- **Kein Brief geht hinaus,** bevor `bericht/pruefplatz/` im Zweig koordination steht (per ls-remote geprüft). Das sind plan.md, die
  Briefe, die Posen-Probe `geo2/stationen2.cjs` und die Vorher-Bilder; Cloud-Sitzungen sehen kein %TEMP%.
- **Vorher-Bilder** nach `bericht/pruefplatz/vorher/`:
  - `inventur/gegenwart-genesis-ego-auge.png` → `genesis-ego-alt.png`
  - `inventur/spawn-third-0.5-laub-0.png` → `spawn-third-alt.png`
  - `inventur/spawn-third-wahl-fell-90.png` → `scheibe-third.png`
  - `inventur/spawn-third-wahl-wasser-225.png` → `teile-tore-third.png`
  - `../blick-tore-bild/genesis-ego-nach.png` → `genesis-ego-tore.png`
  - `inventur/gegenwart-stadt-wagen.png` → `stadt-wagen.png`
  - `inventur/gegenwart-stadt-platz.png` → `stadt-platz.png`
  - `inventur/gegenwart-wiese-ego.png` → `wiese-ego.png`
  - `inventur/gegenwart-waldrand-ego.png` → `waldrand-ego.png`
- **Port-Bänder** in `w3/port-baender.txt`: 4560–4569 ort-wirt, 4660–4669 mess, 4670–4679 grund (4680–4689 nur für stadt unter F).
- **Spike S0 und Radeon-Basis S2** vor ort-wirt; die Zahlen gehen in den Brief von ort-wirt.
- **Wache:** lokale Zweige in `WACHE_STILL`, Cloud-Zweige nicht.
- **Stau:** vor dem Platz-Zug buchen, denn die Reihen genesis-* beginnen neu.
- **Vorlage F** dem Schöpfer vorlegen (§1), als Satz in der Übergabe, nicht als Frage im Chat.

## 14 · Was die Gegenprüfung änderte · Widerlegt

| Pflicht | Änderung |
|---|---|
| 1 Scope | Teil I = ort-name/-gesetz/-wirt, mess, grund (Pflaster, Teich), tore, gehege (3 Wölfe), bewohner (Kopf-Klasse und Wache). arena, strecke, stadt, Spielgeräte, Kinder und Familien-Gang stehen als Vorlage F (§1) und fallen FINAL, wenn F nicht kommt |
| 2 Budget | keine erfundene Sockel-Hülle; B0 gemessen (§4); Akteur-Zonen ≥ 210 m (Zoo 220 m); Residenz als Summe; die E-Lücke besitzen w4-e-vram und w4-e-takt; Rennwagen gibt es in Teil I nicht, in F ruht jeder Akteur jenseits 60 m oder außer Blick |
| 3 Sichtschutz | die Regel „Zählung je Zonen-Marke = 0“ fällt; der Gürtel ist Park-Gestalt; Budget = Summe der residenten Zonen |
| 4 Posen | neu gesetzt und geprüft (Probe GRÜN, 32/32); Blickschneisen sind erklärter Grund (Ufer, Bootshaus-Hof, Wiese, Zoo-Fläche); Graben statt Zaun; die Posen-Linse besitzt ort-gesetz |
| 5 Pixel | Ego-nah als Gesichts-Pose 1 m vor der Wache; fern-Zeilen für fell, mensch-kopf und haar ab 200 px je Instanz mit Albedo-Maß; S8 3 Wölfe in 10–15 m (0,29 %) |
| 6 Klassen | jede der 14 Klassen hat nah und fern eine Station (Tafel §5); fahrzeug und esse haben keine Zeile der Soll-Tafel und keine Station |
| 7 Täter-Flucht | L1-Stationen S1L/S1M 10,6 m vor T10/T1 (das sichere L1-Band 10,45–10,8 m aus porta-core.js:87-88, hyst 0,1); Arten-Saum mit Fichte, Tanne, Birke, Weide |
| 8 boden-nah S1 | gestrichen; boden-nah nur an S5 |
| 9 Zwillinge | (a) kein Zaun in Teil I, der Graben ist Erdbau; in F EIN Zaun-Gesetz, der Streifen (siedlung-wege.js:1055-1083) fällt mit. (b) Gehege als Term im Verzeichnis. (c) die Stadt-Silhouette ist die Welt-March-Hülle des Hauses (fachwerk-core.js:101-103), F. (d) arena nimmt alle Arten der Shell in EINER Welle, F. (e) Belag-Art im Ort-Gesetz (`belag` wie `platz.typ`), das Epochen-Gesetz bleibt unberührt (F). (f) der Familien-Gang gehört dem Gang-Gesetz, F |
| 10 Haken | EIN Besitzer je Haken: ort-wirt hält ab Welle d siedlung-ort.js, §GENESIS_ORT und haushalt.json; die F-Briefe nennen ihn ebenso |
| 11 Abschied | 29 Dateien, 104 Treffer (eigener Grep über 9 Namen) im Brief ort-wirt; werkbank.cjs:926; 25 Werke aus dem Plan; Migrations-Probe |
| 12 Wartelisten | aus den Dateilisten aller laufenden Zweige neu (§8, §9); Doppelbesitz als Folge aufgelöst; tore übergibt die 3 Tor-Namen an mess |
| 13 Ankunft | (a) S2-Inhalt nach der Kontrolle; (b) Plan `fest` als erster Faden-Auftrag; (c) S0 ohne neuen Stoff; (d) Kalt-Zeile 4+4 mit t(Plan), t(Weltbild), t(Kontrolle) |
| 14 Budget-Buch | Spike S0 zuerst; haushalt.json ist das EINE Buch; tore rechnet mit porta's eigenen Bändern L1/L2/L3 |

Die Empfehlungen E1–E10 sind übernommen:
- E1: die Reihenfolge §0.
- E2: das Licht der Nacht §4.
- E3: der Zoo außerhalb von S2, tier getrennt.
- E4: `art` je Baum-Zeile.
- E5: die Strecke in F ≥ 364 m vom Anlauf.
- E6: die Migrations-Probe.
- E7: die Radeon-Basis.
- E8: der K2-Halter der Membran-Zeit.
- E9: §13 als harte Vorbedingung.
- E10: ort in 0a, 0b und 0c geteilt.

**Widerlegt (teilweise), Pflicht 1, „der Wächter hebt keine A-Zelle, die nicht schon ein einzelner Bewohner-Kopf hebt“:**
- Zur Uhr 0 schläft jeder Bewohner drinnen (koerper-core.js:1575, `h ≥ ruhe → schlaf, drinnen`).
- Draußen steht nachts nur eine Rolle mit `versatzH` wie nachtfahrer (koerper-core.js:1523).
- Ohne eine solche Zeile stehen die 3 Nacht-Zellen von mensch-kopf und von haar ohne Bild.
- Darum bleibt die Wache, aber nur als zwei Daten-Zeilen im EINEN Rollen-Gesetz. Sie ist kein Kind, kein Familien-Gang und kein Gerät.

**Präzisiert, Pflicht 13(b), „ohne Ring-Suche“:**
- In der Standard-Welt gilt `fest` 0/0.
- Für Welten, deren Gesetz an 0/0 keinen Kern trägt, bleibt die Regel von heute als reine Funktion im Faden: kein Ort-Faden, keine
  Hydro-Kachel.
