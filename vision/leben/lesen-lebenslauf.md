# Lesen: Lebenslauf (Geburt · Wachstum · Alter · Tod · Fortpflanzung · Population)

Stand: main 18058dba. Ganz gelesen: stamm/kreatur-leben.js (1–3836), stamm/kreatur-fauna.js (1–854), stamm/kreatur-gehege.js (1–258).
Gezielt nachgelesen: tetrapoda-core.js:39–52, 62, 253–259, 289, 2190–2250, 3959; stamm/koerper-leib.js:2469–2557; stamm/bau-teile.js:1479–1500;
stamm/daten.js:173–178; stamm/feld-leben.js:2173–2200.

Kurzbefund: Es gibt eine POPULATION als Zustand (Verzeichnis je Region, logistisches Gesetz, Tod am Hunger/Riss/Alter), aber
KEINE FORTPFLANZUNG: keine Eltern, kein Geschlecht, keine Paarung, kein Erbe, kein Wachstum. „Geburt“ ist das Eintreten einer
Gruppe erwachsener Tiere (Alter 0, Größe gewürfelt) an einem Kandidaten-Ort. Die Art ist ein Schlüssel aus 4 (wolf/fox/bear/deer).

## (1) WAS TRÄGT — konsumierte Gesetze mit Leser

Population (oekologie.K2#2, „fern als Zahl, nah als Körper“):
- Verzeichnis `state.faunaBestand.regionen[key] = {t, seq, tiere[]}`, je Tier `{id, soul, g, bs, alterS, x, z, v, name, gehege}`
  — `_bestandRegionen` kreatur-leben.js:2216, angelegt `_bestandRegion` :2284–2299. Region = Kachel revierM·√π ≈ 200 m (:2221, :3731).
- Takt je `BESTAND_GESETZ.taktS` = 10 s Spielzeit (tetrapoda-core.js:2198): `_bestandTakt` kreatur-leben.js:2401–2424 —
  Alter += 10 s (:2405), Bilanz (:2408), Fraß (:2409), Hungertod/Riss (:2410–2418), Geburt (:2419), Alterstod (:2422).
- Kapazität K je Gattung = Σ Zellen Lebensraum × ha × Nahrung(diet, Äsung, Beute) × kopfJeHa — `_kreaturBestand` :2114–2149,
  Kern `bestandNahrung` tetrapoda-core.js:2219, Bilanz logistisch `bestandBilanz` :2224 (geburt 0,1·(1−n/K), tod 0,2·min(1,n/K−1)).
- Riss (Räuber-Beute): `_bestandJagd` :2165 (wild × Masse ≤ beuteMasse × Jägermasse), `bestandRiss` tetrapoda-core.js:2213 (Holling Typ III).
- Fraß schreibt negativ ins Lebensfeld `_kreaturFrass` :2191 → `_depositLife`; Tod nährt das Feld `_bestandStirbt` :2436–2437,
  `_creatureNaturalDeath` :1730 — der Stoffkreislauf ist geschlossen und beobachtbar (Äsung des Orts).
- Lockstep: Takt auf Raster der Welt-Uhr, Strom je `bestand:<Region>@<Zeit>` (:2406), Akte `_feldAkt` (:2505, :2549), `_feldTakt` :2751.
- Zeichnung (Kappe wählt WER gezeichnet wird, nie wer lebt): `_bestandVerkoerpern` :2557–2604, Leser `tickFaunaLifecycle` :2715.
- Annahme fremder Leiber (Boot, DSL, Hof, Nexus) in den Bestand: `_bestandAdoptieren` :2482.
- Persistenz: `_lebenImStand` feld-leben.js:2173 (nahe Regionen + Regionen gezeichneter Tiere), Leib-Snapshot `_serializeCreature` :227–288.

Tod (EIN Weg `_kreaturFaellt` :927–1016):
- Kampf `damageCreature` :779 → `_creatureCombatDeath` :877 (Loot aus Soul-bodyParts-Volumen :857, Schuld, Furcht-Abdruck :916).
- Hunger/Alter `_creatureNaturalDeath` :1714 (Trauer ∝ Bindung, Journal mit Ursache).
- Kadaver: Fleisch kg = aas.fleischAnteil × `_leibMasse` (:1001–1002), Fraß leert ihn, leerer Kadaver sinkt (`_tickLeichname` :3202).
- Tod-Lage (Kipp-Tafel gegen Boden) im Leerlauf/Takt-Frist :1028–1257.

Leib-Gesetze, die je Individuum gelesen werden (Gattung × bs):
- Masse `_leibMasse` (Volumen der Gestalt × ρ, außerhalb dieser Dateien) → Kampf: damage×(m/64)^(2/3), defense×(m/64)^(1/3),
  hpMax×(m/64)^(2/3) `computeCreatureStats` :746–753, KAMPF tetrapoda-core.js:3959.
- Temperament aus diet × Masse `_creatureTemperament` :622 → Mut :647, Gegenwehr :803–833, Beute/Wild :2347.
- Magen kg = magenAnteil × Masse `_kreaturMagenVoll` :3155, Verdauung :3159, Satt :3170.
- Tagesablauf (Ethogramm, Ruhe-Pegel, Lichtphase, Äsung) `_kreaturTaetigkeit` :2039. Durst `_kreaturDurstig` :2017.
- Lebensraum/Bodenklasse `_bodenKlasseAt` :1703, Artwahl am Ort `_pickFaunaSoulAtPlayer` :1687 (lebensraumWahl), Revier :3228.
- Größe skaliert uniform `group.scale.setScalar(bodySize)` :153.

Kleintiere (kreatur-fauna.js): Vogel `_vogelTakt` :12, Schwarm :81 (verbandZug, Leittier, Krone), Fisch `_fischTakt` :461
(Rheotaxis an `_waterFlowAt`, Flucht), Bestäuber `_bestaeuberTakt` :613 (Blüten der Nah-Streu, Wind, Nektar aus Feuchte+Leben).
Alle sind reine Funktionen von Saat × Zelle × Welt-Uhr — kein Zustand, kein Leben, kein Tod.

Gehege (kreatur-gehege.js): fester Bestand aus der Plan-Zeile `_gehegeEinsetzen` :41, Raten 0 (tetrapoda-core.js:2245–2247),
Riss nur intern `_gehegeSchritt` :137, Rand in der Hülle :210.

## (2) WÜRFE UND TABELLEN

Ungebundene Würfe (Hash/Strom ohne Gesetz dahinter):
- Körpergröße: `_creatureBodySize` koerper-leib.js:2545 — FNV-Hash der Kennung → 4 Bänder (tetrapoda-core.js:253–259: klein
  0,6–0,82 · normal 0,85–1,18 · gross 1,25–1,75 · gigant 1,9–2,7). Im Bestand doppelt gewürfelt: Schlüssel
  `"b"+key+"."+floor(rng()*1e9)` kreatur-leben.js:1993; im Gehege `"g"+id` gehege.js:64; frei `netId` kreatur-leben.js:149.
  Wirkung: Länge ×4,5, Masse (∝bs³) bis ×91 → hp, Biss, Haut, Temperament (ein „gigant“-Fuchs kann wild werden), Magen,
  Kadaver, Beute-Grenze, Blick-Kugel. Band „klein“ heißt im Kommentar „Jungtier“ — hat mit Alter nichts zu tun.
- Name: `_pickCreatureName` :594 — Hash → `CREATURE_NAME_POOL` 30 Namen (:3624–3655).
- Seele ohne Wunsch: gleichverteilt über 4 Seelen `_pickCreatureSoulName` :581 (kein Lebensraum; DSL/Boot-Pfad).
- Kopfzahl der „Geburt“: `herde.wurf` tetrapoda-core.js:289 (wolf 3–6, deer 3–7, fox 1, bear 1), Wurf :1873, :1988 — als
  Gruppengröße erwachsener Tiere, nicht als Wurfgröße einer Mutter.
- Geburtsort: 6 Kandidaten `(ix+rng())*S` :1955–1957, Score = Σ Feld × Soul-Tags :1969 — die Seelen sind tag-gleich
  (:3531–3533), also wählt allein das Feld; Geburts-Ring um den Spieler 8 Würfe :1785–1793.
- Erster Ruhe-Pegel aus netId-Hash `_verhaltenHash(id,4099)` :2058; Wander-Ziel sin-Hash `sin(...)*43758.5453` :3280.
- Gegenwehr-Wurf `_faunaRng()() < strikeChance` :825.
- Vogel/Schwarm/Fisch/Bestäuber: Zellen-Würfe `VG.wurf(saat, ix, iz, k)` fauna.js:125, :362, :514–519, :565; Fischzahl
  `glieder[0]+floor(w(15)*…)` :586; Gast je Blüte Hash :638.

Tabellen/Presets ohne Herkunftsgesetz:
- `GATTUNGEN` tetrapoda-core.js:62 — 4 Zeilen {size, neck, leg, diet, build}: DIE Art. Keine Ableitung, keine Erweiterbarkeit.
- `CREATURE_SKELETON_G` kreatur-leben.js:3518–3565 (size 0,6/0,58/0,45/0,72 „Tarierung ins Tie-Band“, Archetyp-Name,
  Hex-Farben, Materialien stein/holz für alle gleich), `CREATURE_SOULS` :3567–3621, `TETRAPODA_SOUL_MAP` koerper-leib.js:3484.
- `CREATURE_ARCHETYPES` = tetrapoda-core ARCHETYPES (:3507) — Baupläne deer/wolf/weasel/bear.
- `GESTALTEN_JE_REZEPT = 1` tetrapoda-core.js:39: der Guss ist seed-invariant — alle Tiere einer Gattung haben DIESELBE Gestalt,
  Unterschied nur uniforme Skala und gussDials (Studio-Prägung, nicht Individuum).
- `FAUNA_MAX_AGE_MS` = 35 min für JEDE Art (daten.js:176, „~35 min Echtzeit“): Fuchs = Bär = Hirsch. Stellwert ohne Anker.
- `BESTAND_GESETZ` (taktS 10, revierM 113, kopfJeHa 25, beuteVoll 30, geburt 0,1, tod 0,2, fress 0,016, riss 0,6, rissHalb 0,1)
  tetrapoda-core.js:2197 — für alle Gattungen gleich; die Geburtsrate kennt keine Art (Wolf = Hirsch = Bär).
- Startgefühl `{joy 0,2 …}` :213–216; `ERINNERUNG_GEWICHT` :3687; Gehege-Raten 0.
- Vögel/Fische/Bestäuber: je Klasse EIN Leib (`V.leib`, `F.leib`, `B.leib`, Oktaeder, eine Farbe) fauna.js:390, :735.

## (3) GRÖSSEN MIT EINHEIT (lesbar für ein Erbe-/Evolutionsgesetz)

Vorhanden:
- Alter `alterS` [s Spielzeit] je Tier (Bestand :1996, Leib :242, gesynct :2603). Lebensende 2100 s (35 min).
- Masse [kg] = leibV [m³] × ρ × bs³ (`_bestandKg` :2345, `_gattungLeib` :2358 misst leibV und beinL [m] einmal je Gattung).
- Hüfthöhe beinL [m] (Blick-Kugel :1819, Froude-Tempo des Satzes :3019, Gang :3138).
- Magen [kg], Verdauzeit verdauSec [s], Kadaver-Fleisch [kg], Durst durstS/suchPauseS [s].
- Kost diet ∈ [0,1] (`_bestandDiet` :2152), Bezugsmasse KAMPF.refKg 64 kg mit Allometrie-Exponenten 2/3, 1/3, 2/3.
- Revier revierM [m], Raster rasterM 50 m, Dichte kopfJeHa [1/ha], Takt taktS [s], Sprunghöhe hopM [m], Schwere g.
- Bestand n, Kapazität K, Riss-/Geburts-/Todes-Chance je Takt [1/10 s].

Fehlt (nirgends in den drei Dateien):
- Genom/Erbe, Eltern-Kennung, Generation, Mutation, Selektion, Fitness, Stammbaum, Artbildung.
- Geschlecht, Paarung, Geschlechtsreife, Tragzeit, Wurfgröße einer Mutter, Brutpflege, Jungtier-Zustand.
- Wachstum: Größe als Funktion des Alters (bs ist lebenslang fest; nichts liest alterS außer Tod und „Ältester stirbt“).
- Lebensspanne je Art (allometrisch, z. B. ∝ m^0,25), Stoffwechsel (Kleiber ∝ m^0,75), Generationszeit.
- Art-Merkmale jenseits der 5 GATTUNGEN-Zahlen; Fische/Vögel/Bestäuber haben gar keine Merkmale je Individuum.

## (4) NAHT

stamm/kreatur-leben.js:1990–1996 in `_creatureNaturalBirth` — hier entsteht JEDES Tier des Bestands als Datensatz
`{id: key+"."+(++R.seq), soul, g, bs: _creatureBodySize(hash(rng)), alterS: 0, x, z, v}`. Heute steht dort: Art = `best.soul`
aus dem Lebensraum-Wurf (eine von 4), Individuum = ein Größen-Wurf, keine Eltern (v ist der Erstgeborene der Gruppe, :1995),
Alter 0, Ort = Kandidat. Ein Art-/Genom-Gesetz müsste hier aus ELTERN (Tiere derselben Region, `R.tiere`) ein Genom bilden.
Leser dieses Datensatzes: `_bestandKg` :2345 (Masse) → `_bestandWild` :2347 → `_bestandJagd` :2165 → Riss; `_kreaturBestand`
:2124 (n je g); `_bestandAeltester` :2372 (alterS); `_bestandLeib` :2692 → `spawnCreatureAt` opts.bodySize :147 →
`computeCreatureStats`, `_creatureTemperament`, Magen, Kadaver, Satz-Skala; `_kreaturLeibImBlick` :1810; `_lebenImStand`
feld-leben.js:2185; `_bestandName` :2232. Die GESTALT liest den Datensatz NICHT: `_bestandLeib` ruft
`spawnCreatureAt(…, t.soul, {bodySize})` → `_buildCreatureGroup(soul, dialsOv)` koerper-leib.js:2469 → Ofen-Template je
recId × dialsOv. Für ein Genom, das die Gestalt formt, braucht der Datensatz ein Feld, das als `dialsOv` in
`_buildCreatureGroup` reist (wie heute `gussDials` :160–174, :1116 via snap). Zweiter Eintritt ohne Bestand:
`spawnCreatureAt` :147–149 (bs aus netId) — Boot/DSL/Hof, später per `_bestandAdoptieren` :2482 übernommen.
Die Art selbst (Schlüssel `g`) lesen zusätzlich: `LG.L.gattung[g]`, `herde.wurf[g]`, `E.gattung[g]`, `_ofenKreaturDials(g)`
(diet), `_gattungLeib(g)` — alle als Zeile einer festen 4er-Tafel.

## (5) PREIS

- Ein Leib entsteht: „~0,6 ms“ (BESTAND_REGION-Kommentar :3730), Klon des Ofen-Templates „~1 ms“ (koerper-leib.js:2474);
  höchstens leiberJeTakt = 3 je Takt (:3736). Kappe maxCreatures 20 (dirigent-kern.js:280).
- Feine Stufe L0: 62 000 tris, Band 20 000, 8 Draws je Tier; Grobstufe L1: 7 000 tris, 5 Draws, ab 35 m × Größe
  (tetrapoda-core.js:45–46). Ohne Satz bei 50 Tieren an der GTX +42/+25 Befehle, Render 6,0 → 11,4–13,0 ms (:2791).
- Tier-Satz: nur 4 nahe Leiber (`nahLeiber`), der Rest instanziert je GESTALT (`_tierSatzFuer` keyt auf
  `meshes[0].geometry` :2948): cap 256, 3 Bänder × 32 Phasen, 150 Einschwing-Schritte, 40 Schritte je Takt; Senken fell/glimm/
  rest/wurf → bis 4 Draws je Satz. Kosten: Draws ∝ Zahl der GESTALTEN, nicht der Tiere.
- Aufholen einer Region: „~0,25 ms je Takt“, bis 20 Takte je Spieltakt (:3728, :3735); Takt O(Zellen 16 × Gattungen) +
  `_bestandJagd` O(n²) je Region (:2171–2182).
- Tod: Tod-Lage 0,3–0,6 ms im Takt (vorher 28–84 ms), 180/206 Feldproben je Tod (:3760–3769).
- Snapshot ~1 KB je Kreatur (:225); Bestandstier ~10 Felder.
- Vogel/Fisch/Bestäuber: je Tier eine Instanz (Oktaeder 8 tris, Vogel Teile+2 Flügel), EIN Draw je Klasse.
- Was mit der Zahl der Arten wächst: je Art ein Ofen-Template (Bake-ms in diesen Dateien NICHT genannt), `_gattungLeib`-Messguss
  (ein voller Build je Gattung :2362), ein Tier-Satz mit eigener Pose-Textur und bis 4 Draws, `_seelenTags` je Seele, die
  Schleifen `for g in diet` je Zelle und Takt. Gäbe es eine Gestalt je INDIVIDUUM (Genom → dialsOv), würde jedes Tier ein eigenes
  Template und ein eigener Satz: Instanzierung fällt, Draws ∝ Tiere — die Naht muss Gestalt-Klassen (quantisiertes Genom) liefern
  oder die Variation in Instanz-Attribute (Skala je Achse, Farbe) legen.

## Beständigkeit (dasselbe Tier morgen am selben Ort?)

- Im Gesetz: Tier = Datensatz mit Kennung, Anker (x, z) = Wurf-Ort lebenslang; der Leib wird je Zeichnung neu gesetzt auf
  einer Spirale 25 m·√k um den Anker (`_bestandLeibOrt` :2673–2689), also nicht am selben Fleck, aber im selben Revier.
- Im Speicherstand reist nur die Nähe (`_bestandReist` :2262). Eine ferne Region, die neu gelesen wird, beginnt LEER bei
  `floor((jetzt−3600)/10)·10` (:2289) — der Start hängt an der LESEZEIT, nicht nur an Saat und Ort: eine nach dem Laden erstmals
  gelesene Region trägt andere Tiere als vorher. Die Welt ist hier keine reine Funktion.
- Kein Tier wird alt UND bleibt: spätestens 35 min Spielzeit, dann stirbt der Älteste (nur wenn > 2 Freie in der Region, :2421).
- Gehege-Tiere: feste Kennung, Größe aus Kennung — immer dieselben (Raten 0). Vögel/Fische/Bestäuber: immer dieselben, weil
  sie keine Geschichte haben (reine Funktion der Uhr).

## (6) OFFEN

- `_leibMasse`, `_leibRho`, `_ofenKreaturTemplate` (Bake-Kosten je Art), `_kreaturGattung`, `_verhaltenGesetz().herde/aas/
  temperament` vollständig: außerhalb meines Felds, nicht gelesen.
- Ob `_feldAkt`/`_feldAktWirkt` (Annahme/aus) weitere Lebenslauf-Zustände tragen: nicht gelesen.
- Ob irgendein anderer Leser `alterS` liest (UI, Hof, LLM-Persona): nicht gegrept über das Feld hinaus.
- Ob `faunaBestand` ferner Regionen anderswo gespeichert wird als in `_lebenImStand` (feld-leben.js nur :2173–2200 gelesen).
- Tetrapoda-core Lebensraum-/Ethogramm-Tafeln (L.gattung, E.gattung) nicht gelesen — vermutlich ebenfalls 4-Zeilen-Tafeln.
