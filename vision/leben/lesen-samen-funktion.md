# Lesen: der Weg des Samens und der Identität (Leben) — main 18058dba

Frage: Ist ein Lebewesen heute eine reine Funktion von (Same, Ort, Zeit)?
Kurzantwort: Der BESTAND (Zahl, Art, Größe je Tier im Verzeichnis) ist fast eine Funktion von (Same, Region, Welt-Uhr, Akte),
aber nur ab dem Zeitpunkt seines ersten Lesens. Der LEIB (netId, Name, Wander-Kurs, Ruhe-Pegel, Peer-Größe) hängt an einem
Sitzungs-Zähler. Die ART ist eine Tabelle mit 4 Zeilen, und das Individuum hat keine eigene Gestalt.

## (1) WAS TRÄGT — Gesetze, die im Spiel konsumiert werden, mit ihrem Leser

- Fauna-Strom je Zweck, an den Welt-Samen gebunden: `_faunaRng(zweck, frisch)` stamm/kreatur-leben.js:1760 →
  `_streamRng(seed+"-"+zweck)` stamm/netz-identitaet.js:532 (FNV-1a → `_samenStrom`, LCG). Leser: Seelen-Wahl :568,
  Geburt `_creatureNaturalBirth` :1949, Bestands-Takt `_bestandTakt` :2406 (`"bestand:"+key+"@"+R.t`, frisch je Takt),
  Gehege kreatur-gehege.js:145, Gefühl feld-leben.js:1750, Leib-Ort `_bestandLeiber` :2669.
- Bestand je Region als Gesetz der Welt-Uhr: `_bestandRegion` kreatur-leben.js:2284, `_bestandSchritt` :2389
  (Spiel-Uhr steht auf R.t, Raster taktS), `_feldTakt` :2751 (eine Folge über alle nahen Regionen, sortierte Schlüssel,
  Feld-Akte in derselben Reihe). Gesetz: tetrapoda-core.js BESTAND_GESETZ :2197 (logistisch, Verhulst), bestandRiss :2214
  (Holling III), bestandNahrung :2219, bestandBilanz :2224.
- Lebensraum wählt die Art: `_pickFaunaSoulAtPlayer` kreatur-leben.js:1687 → tetrapoda lebensraumWahl :2157; Boden-Klasse
  `_bodenKlasseAt` :1703 → bodenKlasse :2087 (Fluss-Abstand, Hang aus `_terrainSaatY`, Walddichte `_forestStandDensity`).
- Kapazität aus Feld: `_kreaturBestand` :2114 liest `_bestandFeld` :2318 (Klasse je Zelle, Äsung `_kreaturNahrung` :2101 →
  `auraAt().lebendig` feld-leben.js:1849 = Simplex-Substrat `worldFieldAt` :1793 (Same) + Leben-Overlay :2033 − Narbe).
- Masse aus Gestalt × Größe³ × ρ: `_bestandKg` kreatur-leben.js:2344 (`_gattungLeib(g).v × bs³ × _leibRho`), am Leib
  `_leibMasse`; Leser: Temperament (temperamentDerGattung tetrapoda :1959, Schwellen jagdKg 21,5 · wehrKg 200 ·
  kolossKg 600 :211–213), Jagd-Beute `_bestandJagd` :2165, Kampf-Größe KAMPF :3959 (Biss ∝ m^⅔, Haut ∝ m^⅓, Leben ∝ m^⅔).
- Ethogramm: `_kreaturTaetigkeit` kreatur-leben.js:2039 → ETHOGRAMM_GESETZ tetrapoda :2117 (ruhen/nahrung-Anteile, Licht-Phase).
- Gestalt aus fünf Dials (Gauß-Mischung zwischen 4 Ankern): artGewichte/artGestalt tetrapoda :4062/:4088, bauTier :4201;
  Leser: Ofen `_ofenKreaturTemplate` koerper-leib.js:1295 → BAKERS_BY_KIND.kreatur (foundry-core.js:8276 `kern.bauTier`).
- Gang aus Physik (Froude): gangSchritt tetrapoda :1410, GANG_FOLGE :1375; Tier-Satz `_tickTierSatz` kreatur-leben.js:2800.
- Kleintiere als reine Zell-Funktion (das beste Muster im Code): vogelWurf(saat, ix, iz, k) tetrapoda :2464; Saat
  `_fastHash(welt+"-vogel"|"-schwarm"|"-fisch")` kreatur-fauna.js:19/88/467; Bahn auf der Welt-Uhr (`spielZeit`).
- Wald als reine Zell-Funktion: planForestCell phyto-core.js:3631 mit forestCellRng(cx, cz, seedInt) :2716; je Baum
  `seed = imul(round(x·16) ^ round(z·16), 2654435761) ^ (seedInt+i)` :3727; Gestalt treeParams(dials, seedInt, …) :2446.
- Mensch: `_rollHumanoidGenome(seed)` koerper-leib.js:10 (ein Same → Körper-Genom), Bewohner
  `_rollGenome(plan.seed:si:k, "bewohner")` siedlung-bewohner.js:848.

## (2) WÜRFE UND TABELLEN

Identität am Sitzungs-Zähler (Kern-Fund):
- netId = Sitzungs-Zähler: `state._creatureNetSeq++`, `netId = "c"+seq` kreatur-leben.js:140–141. Jede Geburt, jede
  Wiederkehr aus Stand, jede Zeichnung eines Bestand-Tiers (`_bestandLeib` :2692 → spawnCreatureAt) zieht eine NEUE netId.
  Hängt an Lade-Reihenfolge, Zeichen-Reihenfolge (Kappe, Blick, Hysterese `_kreaturNah` :2782) und Sitzung.
  Leser der netId:
  - Name `_pickCreatureName(netId)` :594 (für Bestand-Tiere überschrieben durch `_bestandName("b"+t.id)` :2232/:2699).
  - Körpergröße `_creatureBodySize(netId)` :149 für jeden Leib ohne opts.bodySize (Boot-Wurf, Nexus, Ruf, Hof).
  - Erster Ruhe-Pegel `_verhaltenHash(idNum, 4099)` :2057–2058 → wann die Herde ruht.
  - Wander-Kurs `sin((idNum·131+slot)·12.9898)` kreatur-verhalten.js:1420–1424 und Wander-Ziel `wurf(j)` kreatur-leben.js
    :3258ff (`sin((idNum·131+n·977+j)·78.233)`) → WO das Tier geht.
  - Verband = netId des Erstgeborenen :1935; Leittier :2085; Wiederkehr mappt alte Kennung → neue netId :353–358.
  - Peer-Sicht: Sender schickt `id: netId` netz-p2p.js:1487; Empfänger würfelt `_creatureBodySize(e.id)` :1527.
    BRUCH: ein Bestand-Tier trägt `bs` aus dem Bestand (:1993), ein wiedergekehrtes `snap.bodySize` (:336) — die
    Sicht-Kopie beim Mitspieler würfelt aus der netId eine ANDERE Größe. Wirkung: dasselbe Tier steht beim Mitspieler
    bis ×4,5 länger/kürzer.
  - Abdruck hasht `n: u.netId` im Tier scripts/lib/abdruck.cjs:587 → „A gegen A“ ROT an tier:baer/fuchs/wolf.
- bornAt = Wanduhr: `group.userData.bornAt = Date.now()` kreatur-leben.js:156, als „Identitäts-Marker“ kommentiert.
- `_creatureBodySize(idStr)` koerper-leib.js:2545: `_rollGenome(idStr, "creature-size")` bau-teile.js:1479 — der Schlüssel
  trägt KEINEN Welt-Samen; Tier „c1“ hat in jeder Welt und jeder Sitzung dieselbe Größe.
- Größen-Bänder ohne Gesetz: VERHALTEN.groessen tetrapoda :253–260 (klein 0,6–0,82 p 0,18 · normal 0,85–1,18 p 0,64 ·
  gross 1,25–1,75 p 0,145 · gigant 1,9–2,7 p 0,035), gleich für alle Gattungen, uniform skaliert (:153 `scale.setScalar`).
  Wirkung: Länge ×4,5, Masse ×91 ((2,7/0,6)³) innerhalb einer Art, ohne Alter, Erbe oder Nahrung dahinter; die Masse
  schaltet Temperament (wild/scheu/wehrhaft) und Jagd-Beute.
- Bestand-Größe: `_creatureBodySize("b"+key+"."+floor(rng()·1e9))` kreatur-leben.js:1993 — samen-gebunden über rng,
  aber derselbe Bänder-Wurf; Wurfgeschwister sind unkorreliert (keine Eltern).
- Kopfzahl des Wurfs: herde.wurf {wolf [3,6], deer [3,7], fox [1,1], bear [1,1]} tetrapoda :289, gleichverteilt :1988.
- Name: CREATURE_NAME_POOL, 30 feste Namen kreatur-leben.js:3624–3655; Bestand-Name aus "b"+t.id ohne Welt-Samen :2235.

Art-Tabellen (geschlossen, 4 Arten):
- GATTUNGEN {wolf, fox, bear, deer} je 5 Dials tetrapoda :62 (byte-treu aus dem Lab).
- ART_GESTALT je Art Rumpf-Profil, Bein, Kopf, Schwanz, Fell, Muster (RGB-Tafeln) :3973–4036; ANATOMIE_SOLL :4045.
- LEBENSRAUM_GESETZ.gattung + haeufigkeit {deer 1, fox 0,4, wolf 0,35, bear 0,25} :2077–2083 (Häufigkeit gesetzt, nicht
  aus Masse/Trophie abgeleitet).
- ETHOGRAMM_GESETZ.gattung :2125–2130; herde.wurf :289.
- Stamm: TETRAPODA_SOUL_MAP {wesen→deer, wolf, fuchs→fox, baer→bear} koerper-leib.js:3484; CREATURE_SKELETON_G
  kreatur-leben.js:3518 (Farben, archetypeName); CREATURE_SOULS :3567; CREATURE_SOUL_NAMES :3622.
- GESTALTEN_JE_REZEPT = 1 tetrapoda :39: „der Guss ist seed-invariant … 16 Gestalten waren 16 byte-gleiche Zwillinge“.
  Jedes Individuum einer Art hat dieselbe Geometrie; Unterschied nur uniform `bodySize`.
- Pflanzen: FOREST_SPECIES 6 Arten phyto-core.js:3299, die Wahl als feste if-Kette :3692–3696 (+ extras aus dem Rezeptbuch,
  Nische aus Namens-Hash :3678–3680); Gestalten je Art 1–2 foundry-core.js:639–658 → jeder Baum einer Art ist eine von
  1–2 Gestalten (+ Drehung/Skala); `"*": 16` für den Rest.
- Vogel: EIN Leib für alle Vögel VOGEL_GESETZ.leib tetrapoda :2385 (3 Teile, feste Farben).

Stellwerte ohne Anker:
- FAUNA_MAX_AGE_MS = 35 min für JEDE Art stamm/daten.js:176 (Fuchs = Bär); Tod des Ältesten, sobald überschritten
  kreatur-leben.js:2422.
- BESTAND_REGION.aufholS 3600 s kreatur-leben.js:3734 (die Geschichte einer Region beginnt 1 h vor dem Lesen).
- MASSSTAB.dichteKgM3 1000 für alle Arten tetrapoda :3943.
- UI-Wurf ohne Welt: Math.random in proactiveSuggestions feld-leben.js:1741 (Chat, kein Lebewesen).

## (3) GRÖSSEN — mit Einheit, lesbar für ein Erbe-/Evolutions-Gesetz

Vorhanden:
- Gestalt: size (Lab-Einheit, × MASSSTAB.meterJeEinheit 1/3 m) · neck · leg (Anteil Körperlänge) · diet [0,1] · build
  [0,1] — GATTUNGEN :62, Spannen PARAMS :302–353 (size 1–4, neck 0,15–0,4, leg 0,15–0,35); ART_SPANNE :4061. Das ist ein
  stetiger 5-D-Genotyp-Raum mit Gauß-Mischung — der einzige Ort, an dem „Art“ schon eine Koordinate ist.
- Widerrist m, Rumpf, Brusttiefe (× W) ANATOMIE_SOLL :4045; Fell-Muster als RGB je Zone ART_GESTALT.muster.
- Masse kg = leibV (m³, `_leibVolumen` koerper-leib.js:2524) × bs³ × 1000 kg/m³; Referenz Fuchs 15 · Wolf 64 · Hirsch 94 ·
  Bär 335 kg bei Größe 1 (tetrapoda :3941).
- Hüfthöhe beinL m (koerper-leib.js:2513) → Gang-Tempo über Froude.
- Physiologie: verdauSec 600 s, hungerAnteil 0,5 (:179–180); durstS 1200 s, suchPauseS 300 s (:2099); ruheTaktS 360 s,
  ruhen/nahrung-Anteile je Art (:2126–2129); jagdKg/wehrKg/kolossKg (:211–213).
- Ökologie: taktS 10 s, revierM 113 m, rasterM 50 m, kopfJeHa 25, geburt 0,1, tod 0,2, fress 0,016, riss 0,6, rissHalb 0,1
  je Takt (:2197–2208); Wurfgröße Köpfe (:289).
- Pflanze: Dials api, slim, trop, delta, leaf + ph.hoeheM (m), hd (H/D), Gestalt-Würfe mulberry32 je seedInt (phyto :2454–2511).

Fehlt (für Erbe/Evolution gebraucht, nirgends gelesen):
- Generationszeit, Alter bei Reife, Wurf je Jahr, Lebensspanne je Art (nur 35 min global); Stoffwechselrate (Kleiber m^¾),
  Energie-Budget in J; Temperatur-Toleranz; Fortpflanzungsmodus.
- Eltern-Bezug: kein Tier kennt Mutter/Vater; Geburt würfelt bs unabhängig (:1993). Keine Ahnen-ID, keine Art-ID jenseits
  der 4 Schlüssel, keine Mutationsrate, kein Selektionsdruck auf ein Merkmal (die Bilanz zählt Köpfe, nie Merkmale).
- Kalender: alterS läuft in Spiel-Sekunden; keine Abbildung Spiel-Zeit → Generationen/Jahre.

## (4) NAHT — die EINE Stelle

`_ofenKreaturDials(recId, ovOpt)` stamm/koerper-leib.js:1022–1032.
Heute: `basis = core.GATTUNGEN[recId]` (Tabelle, 4 Zeilen), darüber Buch/Prägung (`_tetrapodaStudioDials` :1005) und ein
optionales Override; ohne Tabellenzeile → null (fail-closed). Die Funktion kennt nur die Gattung, kein Individuum, keinen
Samen, keinen Ort.
Leser (alle Dials einer Art laufen hier durch):
- Gestalt/Ofen: `_ofenKreaturTemplate` koerper-leib.js:1297 (Memo-Schlüssel `recId|lod|JSON(dials)` :1033–1040, :1299).
- Prefetch/Vorlagen: koerper-leib.js:2173, :2247–2248.
- Temperament `_creatureTemperament`-Weg kreatur-leben.js:632; Kost des Bestands `_bestandDiet` :2155; Wildheit
  `_bestandWild` :2350.
- Indirekt `_tetrapodaStudioDials` (Diät am Leib koerper-leib.js:2877, Skelett-Teile :2429).
Was eintreten müsste: `artGenom(saat, artId)` → Dials (5 Zahlen + Lebensspanne, Reife, Wurf …) statt `GATTUNGEN[recId]`;
`recId` würde zur Art-ID (Zahl aus dem Stammbaum), die 4 Tabellenzeilen zu Ankern/Wurzeln des Stammbaums.
Zweite, nachgeordnete Naht für das INDIVIDUUM: `_creatureBodySize` koerper-leib.js:2545 (vier Aufrufer:
kreatur-leben.js:149, :1993; kreatur-gehege.js:64; netz-p2p.js:1527) — hier müsste `ind(saat, artId, indId)` die Größe aus
Erbe statt aus Bändern liefern; der Schlüssel muss die Individuum-ID sein, nie die netId.
Grenze der Naht: die Art-Liste selbst ist an 6 weiteren Stellen geschlossen (LEBENSRAUM_GESETZ.gattung, ETHOGRAMM.gattung,
herde.wurf, ART_GESTALT, TETRAPODA_SOUL_MAP, CREATURE_SOULS) — sie alle iterieren `for g in L.gattung` bzw. schlagen nach
Schlüssel nach (kreatur-leben.js:2154, tetrapoda :2164, :2168). Für 10⁶ Arten müssen sie Funktionen der Art-Dials werden.

Adress-Schema (Vorschlag aus dem Gelesenen, speicherfrei):
- Art-ID: Pfad im Stammbaum, als Zahl `art = H(saat, "art", ahnArt, k)`; Dials(art) = Dials(ahnArt) + Mutation(H(art)).
  Rekursion über die Tiefe d → 10⁶ Arten bei Verzweigung ~16 und d = 5; jede Art in O(d) Hashes rechenbar, nichts gespeichert.
- Wo lebt eine Art: Region-Schlüssel wie `_bestandKey` :2224 (Kachel 200 m) + Lebensraum aus Dials statt aus Tabelle.
- Individuum-ID: `ind = H(saat, regionKey, R.t_geburt, wurfNr, k)` — so wie heute `key+"."+seq` :1992, aber ohne
  `seq`-Zähler (Zähler hängt an der Geschichte ab dem ersten Lesen). Ahnen-ID: die Ind-ID der Mutter steht im Wurf
  (Eltern im Verzeichnis derselben Region zur Zeit R.t).
- Leib-Kennung = Ind-ID (nie netId): Name, Größe, Kurs, Ruhe, Verband, Peer-Größe lesen sie.

Warum „dasselbe Tier morgen am selben Ort“ heute nicht gilt:
- Eine Region beginnt `fern = floor((jetzt − aufholS)/taktS)·taktS` VOR DEM ERSTEN LESEN (kreatur-leben.js:2289–2290), in
  einer Welt < 1 h bei −aufholS (fest). Für ältere Welten hängt der Bestand am Lese-Zeitpunkt.
- Der Stand trägt nur die nahen Regionen und die mit gezeichneten Leibern (`_bestandReist` :2262, `_lebenImStand`
  feld-leben.js:2173); `_lebenAusStand` setzt `faunaBestand = undefined` (feld-leben.js:2222). Nach dem Laden liest eine ferne
  Region neu ab leer → andere Tiere, andere Kennungen.
- Kapazität liest das Leben-Overlay (Akte, Fraß) — gewollt (Akte sind Eingaben), aber das Overlay ist nicht im
  Funktions-Sinn rekonstruierbar ohne die Akte.

## (5) PREIS

Je Art (genauer: je Dial-Satz):
- Ofen-Vorlage L0 + L1, Memo je `recId|lod|JSON(dials)` koerper-leib.js:1299. „~9,6 MB JS“ je zwei Vorlagen (Mitspieler-
  Erscheinung) :1326; Werkstatt 20 Regler-Werte: 2,4 → 50,1 MB GPU, Geometrien 11 → 171 (:1323–1324) ⇒ grob 2,4 MB je
  neuem Dial-Satz. Haupt-Faden-Guss kalt 17–36 ms Rohguss + 13–24 ms Gelenk-Gestalt (:2137, Mensch-Leib, gleicher Ofen).
  Warm: Klon ~1 ms (:1966, :2474).
- Tris-Budget je Tier tetrapoda :45–46: L0 62 000 (Band 20 000), L1 7 000 (Band 3 000); Draws L0 8, L1 5.
- Tier-Satz je Gestalt: 32 Phasen × 3 Bänder, backJeTakt 40, cap 256 Instanzen (kreatur-leben.js:3743–3752); einer je
  Gestalt-Geometrie (Schlüssel `_gelenk.meshes[0].geometry` :2948). Leerer Satz geht nach 1 800 Takten.
- Kapsel-Ferne / Gehege-Ziegel nicht gelesen (OFFEN).
Je Individuum:
- Leib: ~0,6 ms je Zeichnung (kreatur-leben.js:3730), höchstens 3 je Takt (`leiberJeTakt`); Snapshot ~1 KB (:225).
- Bestand-Eintrag: ein Objekt {id, soul, g, bs, alterS, x, z, v} — Takt einer Region ~0,25 ms (:3728), aufholJeTakt 20.
- Im Satz: 1 Instanz-Platz; Befehle hängen nicht an der Kopfzahl (:2799). 50 Leiber ohne Satz: Render 6,0 → 11,4–13,0 ms
  GTX (:2792).
Was mit der Zahl der Arten wächst (heute linear):
- Vorlagen im Memo (MB), Tier-Sätze (Bake-Takte), Prefetch-Aufträge, Draws (Senken je Satz), `_gattungLeibMemo` (ein Guss je
  Art nur für Volumen :2358–2369), `_bestandKlassen`-Schleifen `for g in n` je Zelle :2131–2139 (O(Arten × Zellen) je Takt),
  `_bestandJagd` O(Tiere²) :2171–2182.
- Mit individueller Gestalt (statt GESTALTEN_JE_REZEPT 1) wüchse alles oben je INDIVIDUUM: jede neue Dial-Kombination ist
  ein neuer Memo-Schlüssel und ein neuer Satz. Individuelle Varianz muss darum als Instanz-Attribut (Skala je Achse, Farbe,
  Muster-Parameter) in den Satz, nie als Geometrie — das ist die Kosten-Bedingung jedes Erbe-Gesetzes.

## (6) OFFEN — nicht geklärt

- Nicht ganz gelesen: kreatur-verhalten.js (3 986 Z., nur 1250–1432, 2363, 2623, 2806, 2951, 3353 gesichtet), koerper-leib.js
  außer 1–20, 995–1075, 1285–1345, 2420–2610, 2870–2910, 3470–3510; kreatur-leben.js 420–540, 620–1680, 2960–3500 nur
  stellenweise; phyto-core.js nur 1–30, 468–487, 2420–2560, 2710–2790, 3290–3330, 3631–3740; planet-core.js gar nicht
  (Stichwort-Zählung 0 laut Auftrag).
- `_samenStrom` (die LCG hinter `_streamRng`) nicht gelesen; ob `worldMeta.seed` (String) und `state.worldSeed` (Zahl,
  koerper-leib.js:1489) immer dieselbe Welt nennen, nicht geprüft.
- Ob `state.faunaBestand.regionen` je Sitzung unbegrenzt wächst (kein Evict gesehen) — nicht geprüft.
- Die vier Spiel-Wurzeln der w28-funktion-welt (Rauch, Welt-Uhr-Sprung, Streu-Fuß, Karten-Wind) betreffen kein Lebewesen außer
  den Bewohnern; das Werkzeug `abdruck` nur Kopf und Bestand-Hasher (abdruck.cjs:1–60, :575–600) gelesen.
- Ob der Gehege-Schlüssel `"g"+p.id` (kreatur-gehege.js:64) samen-gebunden ist, hängt am Plan des Orts — nicht verfolgt.
- Keine Messung gefahren (Auftrag: nur lesen); alle Kosten oben sind Zitate aus Kommentaren mit ihrem Messdatum.
