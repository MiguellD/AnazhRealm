# DER KATALYSATOR-BOGEN — die grosse Auslagerung (Schöpfer-Auftrag 10.07.2026)

> **Das Schöpfer-Wort:** „wir müssen die dinge aus anazh realm endlich auslagern — kein eigener
> wagen mehr, kein eigener avatar, keine eigenen kreaturen, keine eigenen werkzeuge, keine
> eigenen dorf/tempel-baupläne oder portalkonstruktionen. wir haben alles in den vorlagedateien,
> und natürlich regelbar, alle assets. […] anazh fast nichts mehr selber trägt, sauber die dinge
> aus den portalen versteht, und sie wie ein katalysator verarbeitet."
>
> **Rang:** Dieser Plan FÜHRT die Ausführung; die VERFASSUNG bleibt `docs/nervensystem-plan.md`
> (M0–M9, Verben, Wörterbuch, ε-Checkliste) — hier steht nur, WIE der End-Zustand Welle für
> Welle erreicht wird. Der Lab-Fahrplan `docs/labs-andock-fahrplan.md` ist §7 untergeordnet.
> **Vor Arbeit an Auslagerung/Werkstatt-Katalog/Portal-Gestalt/Lab-Andock ZUERST lesen.**

## §0 Die Vision in einem Satz

**AnazhRealm ist Boden · Speicher · Spieler · ANSCHLUSS — der Katalysator:** die Labore sind die
Schöpfungs-Orte (GESTALT + GESETZ als Daten), der Host besitzt wenige Verben, rechnet BEDEUTUNG
(Tags · Resonanz · Ω-PHYSIS · Welt-Regeln) und trägt **keine eigenen Modelle** mehr.

## §1 IST-Inventur — was der Stamm heute noch SELBST trägt (gemessen 10.07.)

| Eigenes im Stamm                                                                                                            | Ablösendes Lab                    | Weg                       |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------- |
| `fahrzeug_wagen` (Donor-Parts, 17 Teile — erscheint als Katalog-Eintrag + Interim)                                           | garage (gedockt)                  | W-A1/W-A2                 |
| 5 Portal-Konstruktionen `welt_portal/strom/terrain/garage/portale` (Part-Bauten mit portalMeta)                               | porta (gedockt)                   | W-A3 Gestalt-Wechsel      |
| 2 Waffen/Werkzeuge `geraet_schwert/geraet_spitzhacke` + `ruestung_brustpanzer` + `trank_lebenssaft`                           | schmiede (gesichert)              | W-A4                      |
| 7 Crafting-Geräte `esse/esse_meister/brennkolben/webstuhl/seelenstein_altar/drehbank/glutbrunnen`                             | schmiede/fachwerk (Gestalt)       | W-A5 (nach A4)            |
| Bauten `start_plattform` + künftige Dorf/Tempel-Klasse                                                                        | fachwerk (gesichert)              | W-A5 + N5.7               |
| Avatar-Körperbau (`_humanoidSkeleton` + System B) · `avatar_waechter`                                                         | koerperstudio (gesichert)         | W-A6 (motion-Feld)        |
| Kreaturen-Körperbau (`_creatureSkeleton` + CREATURE_SOULS-Gestalten) · `reittier_holzross`                                    | tetrapoda (gesichert)             | W-A6                      |
| Musik/Klang (Lofi-Synth)                                                                                                      | klang (gesichert)                 | W-A7 (klang-Feld)         |
| Natur-Reste: `stamm_gefallen` (Totholz-SAAT, roadmap §4) · `stein_block/felsbrocken/kristall_geode` (Gestalt schon Studio)    | phyto (gedockt)                   | bleibt Saat / schon durch |

Schon AUSGELAGERT: Bäume/Fels/Kristall/Blume/Strauch/**Wiese** (phyto) · 5 Fahrzeug-Presets
(garage) · 7 Tor-Ordnungen (porta). Die Spezies-Namen bleiben Host-IDENTITÄT (V18.259-Lehre) —
nur die GESTALT reist.

## §2 DER EINHEITLICHE LAB-EXPORT — was JEDES Vorlagefile exportiert (die eine Checkliste)

Ein Lab ist angedockt, wenn sein Kern (`<id>-core.js`, IIFE `__<id>Core`, THREE-frei) exportiert:

1. **B1 REZEPTE** — `PRESETS` (id im Namensraum `[a-z0-9_-]+`, Dial-Vektor `s`), `kind` je Rezept.
2. **B2 BUILD** — `buildInstance(id, seed, lod, ov)` + `kindStages` (NUR ehrlich getragene
   Stufen!) — `ov` ist der Regler-Kanal (P-Overrides), `seed` darf invariant sein (Fahrzeug).
3. **B3 PLACE** — `fx.place { mode, … }` als Daten (none/hand/scatter/forest/site/settlement/**layer** §5).
4. **B4 PARAMS** — die Regler-Tabelle `{ id, lab, min, max, step, def, law?, grp }` je Dial
   (die porta-core-Form ist das VORBILD — sie existiert dort bereits) — **das ist „regelbar,
   alle Assets“:** die Werkstatt rendert ihre Slider AUS diesen Daten, kein UI-Hardcode je Domäne.
5. **B5 LEHREN** + **B6 VERHALTEN** (fahrprofil …) — optional, must-ignore.
6. **components v1(+v1.1)** — `identity/place/drive/body/wield/portal` + `motion`/`klang`;
   **body-Blocker als DATEN** (`body.blockers: AABBs im Template-Raum`) für begehbare
   Konstruktionen (Tor-Durchgang, Haus-Türen) — der Host skaliert + stempelt sie (§6).
7. **STUDIO_VERTRAG-Stempel** + eine Zeile in `cores.manifest.json` + eine `KIND_POLICY`-Zeile
   (prefix + donor NUR falls Katalog-Blueprints entstehen sollen).

Härtung wie gehabt: Parität Shell↔Kern (sha256), cv-Goldens (`spec/asset-contract/`),
`gate:<id>-contract` Node-direkt, ε-Checkliste (Stamm-Diff = DATEN-Zeilen, 0 Kontrollfluss).

## §3 Die Pipeline dazwischen (steht — der Katalysator-Fluss)

`cores.manifest.json` → EIN Worker (importScripts alle Kerne) → Brücke merged **Buch**
(Rezepte first-wins + kindStages je Kern, N7.5 nur in `_foundryIngestRenderConfig`) →
`_foundryAutoRegisterSpecies` (KIND_POLICY-Tabelle, M8) → die Verb-Chokepoints
(appear `_buildVariantLODs`/flatten · place `_placeDispatch` · drive `_vehicleProfile` ·
wield/body/portal) → LOD-Grade (§4) → IDB-Cache (Quellen-Hash-Stempel) → Werkstatt-Katalog (§5).
**Hier fehlt NICHTS Strukturelles — die restlichen Wellen sind Daten + je ein Konsument.**

## §4 DAS LOD-GRADE-GESETZ — „wenn in den Vorlagen die LODs fehlen“ (modular, steht seit V18.419)

**Ein Lab fälscht NIE Stufen; der HOST gradet konstruktiv — domänen-agnostisch:**
`kindStages` deklariert nur, was der Kern ehrlich baut (Fahrzeug `[0]`, Tor `[0]`, Baum `[0,1,2]`).
Fehlende Stufen ersetzt der Wirt: **L1 = L0-Geometrie · L2 = Auto-Impostor durch DENSELBEN
RTT-Bäcker** (Meshes rein, Atlas raus — er kennt keine Domäne). Fail-closed: bekanntes Rezept
ohne Stufen-Eintrag = `[0]` (N7.5). Implementations-Ort bleibt der EINE Flatten-Chokepoint +
`_bakeImpostorAtlasRTT` — ein neues Lab bekommt Fern-Stufen GESCHENKT, ohne eine Zeile Lab-Code.
(Benannter Ausbau: der Auto-Impostor ist heute nur für `impostor: true`-Policy-Zeilen aktiv —
W-A2 schaltet ihn generisch für jede Domäne mit gemessen-teurem L0.)

## §5 DER REZEPT-KATALOG — der „nicht ausgedachte Fleck“ (Wiese anschauen/regeln)

**Die Profi-Trennung: KATALOG-EINTRAG ≠ WELT-PLATZIERUNG.** Heute hängen Vorschau + Regler am
BLUEPRINT — darum ist die Wiese unsichtbar (sie ist eine Schicht, kein Bauplan). Die Heilung:

- Die Werkstatt-Bibliothek bekommt die Sektion **„Studio-Rezepte“ = das LIVE-Buch** (`f.recipes`).
  JEDES Rezept ist anschaubar (Vorschau via `buildInstance`) und regelbar (B4-Slider → `ov`) —
  unabhängig vom place.mode. **Ein Katalog-Blick = EIN Asset = kein Leistungskiller.**
- `place.mode` entscheidet NUR das Welt-Verhalten. Die Wiese: mode **`layer`** — die Welt
  konsumiert sie als instanziertes Boden-Raster (wie heute, 0 Perf-Änderung); ein Regler-Wert
  aus der Werkstatt reist als P-Override an den SCHICHT-Bauer (welt-weit, nicht pro Halm).
  „Platzierbar als Ding“ bleibt bewusst AUS — tausend einzeln platzierte Gras-Dinger wären der
  echte Leistungskiller; die Schicht IST die Welt-Form, das Rezept die Betrachtungs-/Regel-Form.
- Donoren (`fahrzeug_wagen`, `tor_basis`) werden REINE DATEN: kein Katalog-Auftritt, kein
  Interim-Auftritt (Vorschau zeigt ehrlich „lädt…“ statt Wagen-Gestalt).

## §6 GESTALT-WECHSEL bestehender Konstruktionen (Identität bleibt, Gestalt reist)

Muster (V18.259-Gesetz: der NAME ist load-bearing): `welt_portal` & Co. behalten id · Rolle ·
`portalMeta` · Spawn-Orte — ihre RENDER-GESTALT kommt vom porta-Kern (Rezept-Zuordnung als
DATEN-Zeile je welt_-Blueprint: `studioGestalt: "maurentor"`, gelesen im EINEN Preset-Resolver).
**Kollision/Tags/Funktion: DAS BAUM-MUSTER (Korrektur 10.07. — schärfer als das erst benannte
body.blockers):** die Parts BLEIBEN als unsichtbare SUBSTANZ-WAHRHEIT (Tags · blockerAABBs ·
Portal-Trigger — exakt wie der gewachsene Baum-Bauplan unter dem Studio-Render lebt); NUR die
Render-Schicht wechselt. `body.blockers` vom Lab wird erst nötig, wenn ein Lab-Ding OHNE
Part-Bauplan begehbar sein muss. Dasselbe Muster löst später die Crafting-Geräte
(esse → schmiede-Gestalt) und Bauten (fachwerk) ab.

## §7 Die Wellen (Reihenfolge; je Welle: Alt-Modell fällt per Saat-Regel, Bänder wandern, volle Batterie)

| Welle    | Inhalt                                                                                                                                              | entsperrt                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------- |
| **W-A1** | ✅ (10.07., V18.437) REZEPT-KATALOG + generische B4-Regler (`ov`-Roundtrip cache-frei) + Donor-Abschied + ehrliches Interim — `gate:rezept-katalog` (CI) | „regelbar, alle Assets“ ✅      |
| **W-A2** | LOD-Grade generisch — **GEMESSEN VERTAGT (10.07.):** Fahrzeuge/Tore haben heute 0 Worldgen-Fern-Instanzen (place hand/none/site-ohne-Kanal; Hand-Platzierung = einzelne), der Auto-Impostor je Domäne lohnt erst mit Site-/Settlement-Platzierung → nach W-A5 neu messen | §4 wartet ehrlich               |
| **W-A3** | ✅ (10.07., V18.438) PORTAL-GESTALT-WECHSEL: 5 studioGestalt-Daten-Zeilen + EIN generischer Entry-Resolver (Baum-Muster: Parts = unsichtbare Substanz-Wahrheit); `gate:portal-gestalt` (CI). Offen als W-A3.1: portal_<id>-Klone erben die Gestalt (Snapshot-Feld) | „keine eigenen Portale“ ✅ (Render) |
| **W-A4** | **a ✅ (10.07., V18.439)** schmiede gedockt (ε: 21 klinge_-Rezepte, 0 Stamm-Kontrollfluss, `gate:schmiede-contract`+`gate:nervensystem-schmiede`); offen: **b** Hand-Render-Gestalt (buildHand, anazhRealm.js:43659) · **c** Portal-CSP-Umzug · Donor-Abschied geraet_schwert nach Schöpfer-Abnahme · Rüstung/Trank als Rezepte | „keine eigenen Werkzeuge“ (Dock ✅) |
| **W-A5** | fachwerk dockt + N5.7 settlement: haus_* + Dorf-Seeds; die Geräte-Gestalten (esse …) wechseln per §6                                                 | „keine eigenen Bauten“          |
| **W-A6** | motion-Feld (v1.1) → tetrapoda + koerperstudio: Körper-GESETZE (Proportionen/Landmarken/P-Vektoren) als Daten; **der Host bleibt der OFEN** (bake-core/Isosurface + Feld-Physik + Rig) | „kein eigener Avatar/Kreatur“   |
| **W-A7** | klang-Feld (v1.1) → Genesis: Synth-/Sequenz-PRESETS als Daten, EIN Host-Audio-Konsument (Lofi wird Leser, kein Parallel-Audio)                       | „kein eigener Klang“            |

Danach trägt der Stamm an Modellen: NICHTS (Totholz-Saat + start_plattform als benannte
Ausnahmen, bis fachwerk sie deckt).

## §8 Was der Stamm BEHÄLT (der Katalysator, präzise)

Voxel-Boden + Streaming · Feld-Physik + Determinismus/Replay · Persistenz + P2P ·
**der RICHTER** (computeCompoundTags · Resonanz · Ω-PHYSIS · Spawn-Affinität — die BEDEUTUNG) ·
die Verben/Chokepoints + LOD-Grade + Bäcker-ÖFEN (bake-core-Isosurface, RTT-Impostor) ·
Werkstatt/Hof/UI als KONSUMENTEN der Daten. Genau das ist „fast nichts mehr selber tragen":
kein MODELL, aber jede BEDEUTUNG.
