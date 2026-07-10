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
| 2 Waffen/Werkzeuge `geraet_schwert/geraet_spitzhacke` + `ruestung_brustpanzer` + `trank_lebenssaft`                           | schmiede (GEDOCKT + Portal)       | W-A4 ✅                   |
| 7 Crafting-Geräte `esse/esse_meister/brennkolben/webstuhl/seelenstein_altar/drehbank/glutbrunnen`                             | schmiede/fachwerk (Gestalt)       | W-A5 (nach A4)            |
| Bauten `start_plattform` + künftige Dorf/Tempel-Klasse                                                                        | fachwerk (gesichert)              | W-A5 + N5.7               |
| Avatar-Körperbau (`_humanoidSkeleton` + System B) · `avatar_waechter`                                                         | koerperstudio (GEDOCKT + Portal)  | W-A6 ✅ (Daten+Erstleser) |
| Kreaturen-Körperbau (`_creatureSkeleton` + CREATURE_SOULS-Gestalten) · `reittier_holzross`                                    | tetrapoda (GEDOCKT + Portal)      | W-A6 ✅ (Daten+Erstleser) |
| Musik/Klang (Lofi-Synth)                                                                                                      | klang (GEDOCKT + Portal)          | W-A7 ✅ (Tempo+Skala)     |
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

**GERÄTE-GESTALTEN-URTEIL (Nachlese-Welle 10.07. — je Gerät geprüft; §6 nur, wo ein
Lab-Preset die Gestalt EHRLICH trifft):** die Lab-Paletten sind schmiede (21 Klingen/
Werkzeuge in der HAND — nicht die Station selbst) · fachwerk (32 HÄUSER) · porta (7
Tor-Ordnungen — ALLE an welt\_-Portale vergeben, jede Gestalt bleibt unverwechselbar) ·
garage (5 Fahrzeuge) · phyto (Pflanzen/Fels) · klang/koerper/tetrapoda (MESHFREI —
keine Gestalt per Vertrag §8.1). KEIN Lab exportiert eine Werkstatt-STATION.

| Gerät               | geprüfter Kandidat                                                                | Urteil                   |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| `esse`/`esse_meister` | schmiede baut KLINGEN, nie die Schmiede-Station                                  | OFFEN — keine Lab-Quelle |
| `brennkolben`       | kein Alchemie-/Glas-Lab                                                            | OFFEN — keine Lab-Quelle |
| `webstuhl`          | kein Textil-Lab                                                                    | OFFEN — keine Lab-Quelle |
| `seelenstein_altar` | porta baut DURCHGÄNGE, keinen Altar (+ 7 Ordnungen vergeben)                       | OFFEN — keine Lab-Quelle |
| `drehbank`          | kein Werkbank-Lab                                                                  | OFFEN — keine Lab-Quelle |
| `glutbrunnen`       | die fachwerk-`brunnen`-Schicht ist ein LAYOUT-Punkt (x/z), kein Modell             | OFFEN — keine Lab-Quelle |

Ergebnis: **0 von 7 ehrlich mappbar — bewusst KEIN Code** (ein Haus auf einem Webstuhl
wäre die Gestalt-Lüge). Der generische W-A3-Resolver trägt jeden künftigen Träger von
selbst: sobald ein Lab eine Stations-Gestalt exportiert, ist der Anschluss EINE
`studioGestalt`-Daten-Zeile; bis dahin bleibt die Part-Gestalt die Wahrheit.

## §7 Die Wellen (Reihenfolge; je Welle: Alt-Modell fällt per Saat-Regel, Bänder wandern, volle Batterie)

| Welle    | Inhalt                                                                                                                                              | entsperrt                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------- |
| **W-A1** | ✅ (10.07., V18.437) REZEPT-KATALOG + generische B4-Regler (`ov`-Roundtrip cache-frei) + Donor-Abschied + ehrliches Interim — `gate:rezept-katalog` (CI) | „regelbar, alle Assets“ ✅      |
| **W-A2** | LOD-Grade generisch — **GEMESSEN VERTAGT (10.07.):** Fahrzeuge/Tore haben heute 0 Worldgen-Fern-Instanzen (place hand/none/site-ohne-Kanal; Hand-Platzierung = einzelne), der Auto-Impostor je Domäne lohnt erst mit Site-/Settlement-Platzierung → nach W-A5 neu messen. **POST-SETTLEMENT NACHGEMESSEN (Nachlese-Welle):** die Auto-Dörfer platzieren haus\_-Instanzen massenhaft (14/Zelle im Gate), aber `haus` trägt EHRLICHE `kindStages [0,1,2]` selbst (fachwerk-core B2 — kein Grading nötig); Fahrzeuge/Tore weiterhin 0 Worldgen-Instanzen (Dispatch: hand/none/site→null, strukturell) → **§4-Auto-Impostor bleibt ehrlich vertagt** (Auslöser wäre eine Worldgen-Massen-Domäne OHNE Fern-Stufen). **TRIAS-WELLE (V18.444) — die STUFEN-NUTZUNG war der echte Riss (GEMESSEN):** die Dörfer SIND die Worldgen-Massen-Domäne, ihre Stufen EXISTIERTEN ([0,1,2]) — aber platzierte Studio-Architektur ging NIE durch `_tickArchitectureLOD` (kein `_lodSpecies`) → ein nah gebautes Haus (L1 = 75k Tris, nur L2 [2.8k] ist leicht) klebte im Cull-Radius für immer auf seiner Bau-Stufe (9 Häuser: 380k statt ~22k nach 120 m Zurücktreten). GEHEILT an den Chokepoints (Kalt-Stempel `_lodLevel` für JEDEN Foundry-Eintrag · `instFoundry`-Eligibility im EINEN LOD-Tick · Clamp-Kurzschluss `_servedLod` gegen Ein-Stufen-Churn) — kein neues Grading, die EINE LOD-Geschichte trägt jetzt jede Domäne mit echten Stufen; `gate:trias` (CI, Zahl-Deckel 70k, gemessen 380k→~28k) | §4 wartet ehrlich · Stufen-KONSUM ✅ (V18.444) |
| **W-A3** | ✅ (10.07., V18.438) PORTAL-GESTALT-WECHSEL: 5 studioGestalt-Daten-Zeilen + EIN generischer Entry-Resolver (Baum-Muster: Parts = unsichtbare Substanz-Wahrheit); `gate:portal-gestalt` (CI). **W-A3.1 ✅ (Trias-Welle, V18.444):** der EINE Klon-Chokepoint `cloneBlueprint` vererbt `studioGestalt` (donorOnly bewusst NICHT — ein Klon soll sichtbar sein); Probe in `gate:trias` | „keine eigenen Portale“ ✅ (Render+Klon) |
| **W-A4** | **a ✅ (10.07., V18.439)** schmiede gedockt (ε: 21 klinge_-Rezepte, 0 Stamm-Kontrollfluss, `gate:schmiede-contract`+`gate:nervensystem-schmiede`); **b ✅ (V18.440)** Hand-Render-Gestalt (fx.held.gripX als Vertrags-Daten) · **c ✅ (V18.441)** Portal-Umzug (welt_schmiede, 3. Lab-Portal, smoke:labs) · **Donor-Abschied geraet_schwert ✅ (Abschieds-Welle, Schöpfer-Segen 10.07.):** donorOnly (reiner Daten-Spender; die 21 klinge_-Gattungen sind die sichtbaren Klingen) + die EINE Klon-Sichtbarkeits-Regel am Auto-Register-Chokepoint (`delete clone.donorOnly` + Heilung persistierter Alt-Klone — vorher erbte JEDER Auto-Blueprint das Versteck-Flag seines Donors und fiel still aus den Pickern, die latente W-A1-Lücke) · Rüstung/Trank als Rezepte bleiben OFFEN (warten auf Lab-Presets — nichts erfinden) | „keine eigenen Werkzeuge“ ✅ |
| **W-A5** | **a ✅ (10.07., HEAD 354ab18)** fachwerk gedockt (32 haus_-Rezepte, kindStages [0,1,2], `gate:fachwerk-contract`+`gate:nervensystem-fachwerk`); **b ✅ (V18.442)** N5.7 settlement (DORF-QUELLE→Kern · `exportSettlement` [exportDrive-Muster] · Worker-Kanal · `spawnSettlement` [Γ5 „:stadt" · Wasser-Wand · fail-closed · KIND_POLICY-Tabelle] · Chat „dorf" · fx.place→settlement · `gate:settlement`) + FACHWERK-PORTAL (W-A4c-Muster: fachwerk.js, strikte CSP, W12-Brücke, welt_fachwerk→ruine, smoke:labs 4 Portale); **c ✅ (Nachlese-Welle)** WORLDGEN-AUTO-DÖRFER am „settlement"-Dispatch-Kanal: `_tickAutoSettlement` (Idle-Pass) — Zellen Γ5 „:dorf" (768 m, 1/5, `AUTO_SETTLEMENT`), Site-Wände (`_slopeAt`·`_isAboveWaterAt`·Spawn-Klar 320 m), Export durch den EINEN Worker, budgetierte Materialisierung (perTick 2, `_frameOverBudget`) durch DIE EINE Slot-Quelle `_spawnSettlementSlot`, Reload-Idempotenz `worldMeta.settlementCells` (worldMeta-Spread, V8.59), headless-default RUHE + Hook `__anazhAutoSettlement` (`gate:settlement` TEIL C). **SCHICHTEN-URTEIL v1 (ehrlich):** roads bleiben benannt-unkonsumiert (`_pathFieldAt` ist READ-ONLY aus dem Hydro-Netz abgeleitet — eine Schreib-Seite wäre ein neues Parallel-Feld) · brunnen/laternen bleiben benannt-unkonsumiert (KEIN Built-in-Baustein: kein brunnen/laterne/fackel-Blueprint; `glutbrunnen` ist ein Crafting-Gerät, kein Dorfbrunnen — nichts erfinden) · slot.ov bleibt BEWUSST unkonsumiert (W-A1-Gesetz: der Welt-Pfad bleibt ov-frei/byte-rein) | „keine eigenen Bauten" (Dock+Kanal+Worldgen ✅) |
| **W-A6** | ✅ Daten-Dock (V18.442): motion-Feld (v1.1 §8.2) NORMATIV; koerper-core (`mensch`, 8 Morph-Dials, fx.gestalt+fx.motion) + tetrapoda-core (4 Gattungen, 5 allometrische Dials, fx.motion+CPG+Stand-Pose) als MESHFREI-Kerne (§8.1, KEINE KIND_POLICY-Zeile); **der Host bleibt der OFEN** (bake-core/Isosurface + Feld-Physik + Rig); `gate:daten-contract` + `gate:nervensystem-labs`. **MOTION-ERSTKONSUMENT ✅ (Nachlese-Welle):** die Schwanz-Rolle des EINEN Animators (`_animateCompoundMotion`) liest tailRate/tailAmp aus dem tetrapoda-Studio-Profil (`_motionStudioProfile` — Daten-Zeilen `MOTION_HOST_RECIPE`/`MOTION_PROFILE_MAP`, fail-soft byte-alt 2.2/0.28; KONSUM als Zahl in `gate:nervensystem-labs` M). **KOERPER-DOCK + MOTION-VOLLENDUNG ✅ (Abschieds-Welle):** (a) die 8 Morph-Dials formen den AVATAR (`_koerperStudioDials` liest f.recipes[mensch].s LIVE; `KOERPER_DIAL_MAP` als Daten: height→kh · mass→build · tone→muscle · gender→sex; ehrlich unmapped: age/hairLen/hairVol/arms — kein Host-Proportions-Konsument; der Ingest-Chokepoint gießt den Boot-Avatar EINMAL nach; KONSUM als Zahl: height 1.15 → Rig ×1.15, `gate:nervensystem-labs` D); (b) die 5 tetrapoda-Dials formen `wesen` (↔deer, die EINZIG ehrliche Gattungs-Paarung; `TETRAPODA_SOUL_MAP`/`TETRAPODA_DIAL_MAP` + `CREATURE_SKELETON_G`; tag-neutral per Zahl bewiesen; size bleibt stats-tragende Tarierung); (c) DIE EINE EMOTIONS→PROFIL-BRÜCKE (`MOTION_EMOTION_PROFILES`, Vorrang-Zeilen chaos/sorrow/joy — genau die benannte Brücke): BEIDE Leser fließen durch `_motionProfileName` — der Compound-Kern (Schwanz flee 11.0 unter Furcht + Kopf-Haltungs-Delta) UND der RIG ALS LESER (`_animateHumanoidRig` liest Atem breath/freq lab-idle-normalisiert [neutral byte-alt 0.02/1.6] + die MOTION_RIG_MAP-Pose-Deltas [sad: Kopf −0.18]; die SkinnedMesh-Wand steht — der Rig bleibt der Animator) + die walkPhase↔Profil-Brücke (stepHz × freq/run-freq, sorrow→pwalk 0.8×) | „kein eigener Avatar/Kreatur" ✅ (Gestalt+Bewegung) |
| **W-A7** | ✅ (V18.442): klang-Feld (v1.1 §8.3) NORMATIV; klang-core (22 Genesis-Genres, MESHFREI; Skala aus der EINEN Formel scaleFor(darkness); Label-Kollisions-Lehre: modern-klang/barock-klang) — der EINE Host-Audio-Konsument LEBT: `_klangStudioPreset`→`_lofiChordDurationMs` fährt das Genesis-lofi-Tempo (78 bpm bewiesen, fail-soft byte-alt auf LOFI_BPM); `gate:daten-contract` + `gate:nervensystem-labs`. **SKALA/HARMONIK ✅ (Nachlese-Welle):** `_lofiActiveScale` liest fx.klang.scale (Blues [0,3,5,6,7,10] beim lofi-Genre), der EINE skalen-bewusste Ton-Mapper `_lofiScaleSemitone` faltet Grad→Skalenton mod Skalenlänge + Oktave (6-Ton-Regel: d+6 = Oktav-Wurzel; die 7-stufige LOFI_HARMONY-Wanderung bleibt Host-Mechanik) — ALLE Ton-Leser (Akkord/Melodie/Bass) fließen durch ihn; fail-soft byte-alt auf LOFI_SCALE (`gate:nervensystem-labs` K2, Frequenzen als Zahlen) | „kein eigener Klang" ✅ (Tempo+Skala) |

Danach trägt der Stamm an Modellen: NICHTS (Totholz-Saat + start_plattform als benannte
Ausnahmen, bis fachwerk sie deckt).

## §8 Was der Stamm BEHÄLT (der Katalysator, präzise)

Voxel-Boden + Streaming · Feld-Physik + Determinismus/Replay · Persistenz + P2P ·
**der RICHTER** (computeCompoundTags · Resonanz · Ω-PHYSIS · Spawn-Affinität — die BEDEUTUNG) ·
die Verben/Chokepoints + LOD-Grade + Bäcker-ÖFEN (bake-core-Isosurface, RTT-Impostor) ·
Werkstatt/Hof/UI als KONSUMENTEN der Daten. Genau das ist „fast nichts mehr selber tragen":
kein MODELL, aber jede BEDEUTUNG.
