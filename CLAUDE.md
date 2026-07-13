# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.462 — DIE VOLLENDUNGS-WELLE: W9 Himmel · W10 Wasser · Frisuren · fail-LAUT)

**W9+W10 GEBAUT:** `HIMMEL_GESETZ` + `WASSER_GESETZ` (foundry-core) — das Studio-GLSL
INJIZIERT die Zahlen in seinen Shader-Text (semantischer Beweis alt==neu), die Welt (TSL)
LIEST dieselben Tabellen: Wolken-Feld (Parallaxe+2·fbm+lit; uSunCol=Rayleigh-Quelle;
V18.369-Zenit-Kompensation fiel MIT dem alten Feld) · Wasser (Beer-Lambert · Schlick-
Fresnel · Himmel-Spiegelung [Planar-RT = Studio-Perf-Entscheid] · Licht/Spec; auditierte
Ufer/Schaum-Systeme blieben; Automat byte-unberührt maxDiff 0). **Fern-Wasser-Provisorium
zurück AN.** haarStreu trägt ALLE 10 Frisuren (Zeilen-Arten radial/quaste/knoten in
__streuGeo — Default-RNG eingefroren, Fell sha256-gleich). fail-LAUT: kalter-Buch-Pfad
spricht (Chokepoint-Warn · Timeout-Wort · Magenta-Platzhalter · Not-Körper). typeof-
RATCHET in gate:apparat (891, nur-sinkend; Voll-Wanderung offen). Doku-Wahrheit: Feld-Doc-
Kopf + Doc-Map nachgezogen, diag-genom (+ diag-atmosphere Fill-NACHT) als bewusste rote
Zustände BENANNT. `docs/abnahme-drehbuch.md` = deine EINE Runde (W8 · look-golden --mint ·
perf.json · E-C/E-E/E-F · DoD 5 · LOOK-Galerie). OFFEN danach: nur noch die Runde selbst ·
typeof-Voll-Wanderung · Rinden-Vereinigung · diag-genom-Bänder-Wanderung · Frisur/Schnitt-
Technik-Reichtum (Lab-Builder) als künftige Gesetz-Zeilen.

### Davor (V18.461 — LOOK ALS GESETZ vollständig: Fell · Haar · Kleid)

**FELL (V18.460) + HAAR/KLEID (V18.461):** der Look wohnt als ZEILEN-TABELLEN in den
Gesetzbüchern, die Deck-Technik ist Leser-Sache. tetrapoda-core `fellStreu(P,M,T)`
(Bein/Fuzz/Akzent-Zeilen verbatim + `art:"deck"`-DATEN-Zeile; Lab-Benchmark steht,
Gold-Mantel auge-geprüft; Pipe-Bäcker streut deterministisch, Wurzel→Spitze-Verlauf als
VERTEX-Farben, der Guss merged je Wirt×Klasse, der Gang trägt das Fell, fern kahl-billig).
koerper-core `CLOTH_COLORS` (Shell-Zwilling fiel, Wand=16) + `kleidZonen(d)` (Schnitt→
Teil-Listen+Hex+inflate; Ärmel = GANZE Oberarm-Muskelgruppe; Fuß anonym → Schuh-Zone nennt
das ankle-GELENK, Gruppen-Hüllen-Regel) + `haarStreu(d)` (Kalotten-Schale GEMESSEN auf dem
Schädel-Ellipsoid, Äquator über der Braue = Gesicht frei). Bäcker: Stoff-Hüllen = Teil-Klone
(Klasse `stoff_<hex>`, merged je Gelenk×Farbe), Haar via `__streuGeo` aufs head-Gelenk;
lod0 39 Meshes (29+10), lod1 14 (Stoff-Silhouette + gemaltes Haar). Der Default-Welt-Mensch
trägt die STUDIO-Garderobe (V18.457-Wardrobe-Entscheid GEDREHT — der Schöpfer will die
Vorlagen in der Welt). MERKE: die Kerne leben AUSSERHALB des format:check-Scopes — nie
`prettier --write` auf Gesetzbücher (verbatim-Blöcke!), neue Abschnitte rein additiv.

### Davor (V18.459 — DIE EINE PIPE VOLLENDET: alle Gattungen fahren)

**DIE EINE PIPE (V18.458–.459, Vertrag §8.4):** die Foundry ist DER Übersetzer für ALLES.
FAHRT-BEWEIS durch DENSELBEN build-asset-Kanal: Pflanze · Kreatur (61 Meshes statt 235) ·
Mensch (29 statt 227) · Fahrzeug (gt 328) · Waffe (langschwert 18); Fachwerk fährt seinen
Daten-Kanal (export-settlement). Der Gattungs-Bäcker-Tisch `BAKERS_BY_KIND` (foundry-core,
auch Stamm-seitig geladen) bäckt MESHFREI-Kerne generisch über den EINEN Gelenk-Guss
`__bakeGelenkBaum` (Wurzel-Pose reist mit — morphAufs Größen-Dial lebt dort); `__skelett`-
Beipack im normalen Umschlag, lod1-Fern-Standbild, IDB/Prefetch gratis. Der Stamm assembliert
nur (`_ofenAssembleAsset` + EINE Reply-Konversion `_foundryBuildMesh`) + memoisiert je
Art+Dials: **Kreatur UND Mensch sind Template-Clones (1–2 ms, 100 % Geo-Teilung) — die
Spawn-Freeze-Klasse ist strukturell tot**; kalt bäckt derselbe Bäcker sync (ein Gesetz, zwei
Scheduler). `_buildHumanoidRig` = Pipe-Konsument (Signatur/Rückgabe identisch; Hautton reist
als ZAHL `userData.hautTon`). Look: die STUDIO-Zahlen führen (mp; Farb-Gesetz: Hexe
selbst→linear, r128 roh vs r184 auto; Körper-Ton = `P.cB`, `P.base` ist ein CSS-String!).
Gefallen: `_buildTierBaum`- UND Mensch-Inline-Tunnel, `_tierFernTeile`,
`_buildCreatureHideMaterial`, `_skinMat`, tote werk-render-Modi. Holzkarren-Wahrheit:
reittier_holzross = das BESTAND-Pferd neben den Garage-Autos; bei kaltem Buch das einzig
Sichtbare.

### Davor (V18.457 — KONVERGENZ GESCHLOSSEN: EIN MENSCH, EIN TIER)

Die Fantasie-Altlasten sind physisch gefallen (Phönix·Drache·Glutwesen·Sprite·Geist·Wächter·Avatar-
Aura); der Tod ist feld-nativ (`_playerDeathRespawn`: Anker-Rückkehr + Wunde + `_depositLife`);
Körper→Eigenschaften ist ZAHL (Bär>Wolf>Fuchs HP · invers im Tempo, EINE Größen-Fold-Quelle);
Bestand = **Mensch + Hirsch·Wolf·Fuchs·Bär (+ Pferd)**, `werde wolf` verkörpert per Chat.
`gate:altlasten` (im check) hält Gefallenes strukturell draußen. **DIE KONVERGENZ (V18.454–.456):
EIN MENSCH, EIN TIER.** Der Da-Vinci-Teile-Baum ist das eine Mensch-Gesetz — koerper-core
`bauMensch(F)` (288 Knoten verbatim, fabrik-gehakt) + `morphAuf(B,dials)`; der Lab-Baum ist das
eine Tier-Gesetz — tetrapoda-core `bauTier(F,dials)` (verbatim, MESHFREI; deriveTierParams =
NaN-Wand-Chokepoint, versteht Buch-KURZ `neck/leg` UND Lab-LANG `neckLen/legLen`). Lab-Shell UND
Stamm bauen NUR daraus (Stamm: geteilte Geometrien + PBR-Klassen + Hide-Fell; Mensch-Rig =
Gelenk-Gruppen, Tier-Gang = `_animateTierBaum` im EINEN Chokepoint `_animateCompoundMotion`;
Baum-Skala = Parts-Mechanik-Kalibrierung f2, Tags/Stats lesen unverändert `_soulParts`/bodyParts).
Die Stamm-Körper-Pipeline (V18.454: 8-KH-Atlas, Avatar-Metaball/Bäcker, Relief-Gesicht) UND die
Metaball-KREATUR-Klasse (V18.456: bake-core/bake-worker, spec v2+Goldens, Skin-Isosurface,
Gesichts-LOD, gate:creature-contract) sind GEFALLEN — Rückkehr-Wand 26 Namen, KONVERGENZ-Band
trägt die NaN-LINSE (finite Welt-BBox je Gattung). **SCHLUSS (V18.457):** der Stamm GEHT das
Gang-Gesetz (cpgStep+STAND_POSE+MOTION via Emotions-Brücke; Knie/Pfote falten) · Fell im
Baum-Modus des Hide-Gesetzes (Lab-Ton; Metaball-Terme nur noch auf Haut) · Rute trägt gemergte
Seed-Strähnen (1 Draw/Segment) · DER FERN-GUSS (`TIER_FERN_DIST` 60 m·L: art-gecachtes Standbild
~10 Meshes statt ~235; Baum-Fabriken tragen sharedGeom) · P2E-Bänder cap-isoliert + Null→LAUT-rot
(4 nie-gelaufene Checks entlarvt+gewandert). ENTSCHIEDEN: Outfit/Haar-Wardrobe = Studio-Erlebnis
(Shell-Look-Klasse), der Welt-Mensch trägt Baum-Haar + gemalte Shorts. **ULTRAGUSS I (V18.451):** die Labs LESEN ihre
Gesetzbücher (Phänotyp-Zwilling tot [foundry→phyto-core] · Tier-Allometrie+CPG in tetrapoda-core ·
Progression+Terzschichtung in klang-core · Feder-Koeffizienten in vehicle-core.FAHR · Membran-
Palette in porta-core; die Stamm-Lofi-Improvisation ist BEWUSST ein eigener Komponist [Emotion+
Feld], gleiche Skalen); die Buster-Linse + Zwillings-Wand wachsen in gate:altlasten.
**ULTRAGUSS II (V18.452, seriell-agentisch):** U3-Kern (Lab-Anatomie in koerper-core, 396k Werte
identisch, 6↔8-KH-Delta-Tabelle liegt) · U7 (Muskel-Atlas 595 Z. → koerper-core, parts-sha256
byte-gleich) · U6c (Snap/Brandwand/metaParams in fachwerk-core, Goldens byte-treu) · U6d
(Klingenprofil + OAKESHOTT in schmiede-core, 98k Werte identisch) · U1 (Apparat: toString-Zitate
434→4 + gate:apparat-Ratchet + __consumes/__anker; 5 stumm-grüne Bänder geheilt); Zwillings-Wand
= 13 Fingerabdrücke. OFFEN (`docs/ultraguss-plan.md`): U8 (W9 Himmel · W10 Wasser · Look-Goldens —
braucht die Schöpfer-Runde; die Rig-Konvergenz FIEL mit V18.454) · typeof-Voll-Wanderung.
Davor: SYNERGIE (V18.448 — EINE
Export-Form `PARAMS_BY_KIND`, EIN Umschlag `get-book`, EIN Ingest) · Nervensystem/Katalysator/Trias
(V18.434–.447). **JEDES-HOLZ (V18.453):** die HOLZ-LEITER (`HOLZ_PROFILE` voll·nah·kienspan =
Ferne-Deckel, Nähe IMMER voll; `?holz=` > localStorage > AUTO-Adapter-Probe) · der EXISTENZ-BODEN
(`RING_EXIST_FLOOR=2`: der Ring wächst bis dorthin OHNE Kopfraum-Gate, Schrumpf endet dort — die
Welt ENTSTEHT auf jedem Holz) · Device-Loss-Wächter (LAUT + Gate + Render-Stopp statt Weißwelt-
Lüge) · das HOLZ-AUGE (`scripts/diag-holz-auge.cjs`: RTT statt Swap-Chain + manueller Dawn-
Readback — echte Augen auf Present-losem Holz). **OFFEN:** die eine Schöpfer-Browser-Runde
(W8-Abnahme + LOOK-Stau) · W9 Himmel 1:1 · W10 Wasser-Oberfläche 1:1 (`docs/roadmap.md` §0).

## Architektur (die Karte — voll: docs/archiv/claude-md-v18448-snapshot.md)

- **Stamm** `anazhRealm.js` (~88k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
  Genese/Ökologie) · Speicher (Snapshot/Taille) · Spieler (Seelen/Bewegung/Werkstatt/Ökonomie) ·
  Anschluss (P2P/Portale) + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10, cores.manifest.json): reine Daten+Mathe; Vertrag v1.2 = `PARAMS_BY_KIND` + must-ignore
  + fail-closed (`docs/studio-vertrag.md`). Der Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi).
- **Worker:** Foundry (= terrain-Brücke; Kanäle `get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; IDB disk-first, SHA-Stempel der Quellen) · voxel-worker (bit-identischer
  Spiegel).
- **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC;
  Kanäle pos·input-Lockstep·dsl·soul·vibe).

## Die tragenden Lehren (voll: Gotcha-Vollarchiv in docs/archiv/handover.md + Snapshot)

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die
   LINSE bauen (Gate/Verdikt), nie auf Wachsamkeit bauen.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch.
   must-ignore gilt FREMDEN Artefakten (Taille), nie dem eigenen System. `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes** — der Schöpfer wertet Ergebnisse, nie Optionslisten;
   Bericht = drei Sätze, kein Theater. Ein benannter Fehler → die ganze KLASSE in derselben Welle.
5. **Miss zuerst, die Zahl führt;** verifiziere KONSUM, nicht Existenz; SPIELEN/sehen vor behaupten
   (headless beweist Mechanik, nie das Erlebnis; swiftshader-Screenshots sind farbtreu).
6. **Tests wandern mit dem Code** (V9.56-i); Absenz-Greps über `window.__codeOf` (Kommentare zitieren).
7. **Worker-Spiegel bit-identisch** (Main ↔ voxel-worker; jede Sheet-/Density-Änderung in BEIDE +
   `diag-worker-watersheet` maxDiff 0). Welt-Substanz zieht aus Γ5-Seed-Streams, nie Math.random.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; die Tiere sind bewusst tag-identisch —
   Differenzierung über die Größen-/Gattungs-Achse, nie über Tags).
9. **`gate | tail` maskiert Exit-Codes** — Exits IMMER explizit (`echo EXIT=$?`).
10. **Jede versionierte Datei braucht den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS anfassen** — die Benchmark bewegt sich nie; Goldens sind
    eingefroren, ein Re-Mint ist ein begründeter Vertrags-Akt.
12. **Monolith-Chirurgie:** `cut-method` (AST-sicher) · sofort `node --check` + eslint ·
    seriell committen, nie Batch; worktree-Agenten zweigen von main ab (falsche Naht bei Feature-Branch).
13. **Der Loop/Regler:** Streaming ist heilig (prio 0), Bewegung hängt nie am Render-Signal;
    EIN PID, Totband 59–77 fps; NaN-Wände vor jedem EWMA-Gedächtnis; Existenz vor Framerate —
    der Ring wächst bis `RING_EXIST_FLOOR` OHNE fps-Gate (sonst entsteht die Welt auf schwachem
    Holz NIE), der PID atmet nur darüber.
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron
    auf dem Interaktions-Pfad.

## Workflows

Dev-Loop: `npm run playtest:fast` (~20 s, 18 Checks) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten) · `npm run lint` / `format:check` · Navigation:
`npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in package.json. Commits klein +
thematisch, emoji-frei, deutsch; Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/archiv/handover.md` = Chronik + Gotcha-Vollarchiv + Session-Start · `docs/roadmap.md` §0 =
was offen ist · `docs/state-of-realm.md` = Vision · `docs/das-lebendige-feld.md` = der wahre Norden
(vor Arbeit an Feld/Emotion/Nexus/DSL zuerst) · `docs/studio-vertrag.md` = die Naht (normativ) ·
`docs/archiv/claude-md-v18448-snapshot.md` = der volle Gotcha-/Stand-Snapshot vor der Schlankung ·
Pro Welle: ein Commit + ein Chronik-Eintrag; dauerhafte Lehren als EINE Zeile hier hinein, nie Epen.
