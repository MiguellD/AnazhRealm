# DER NERVENSYSTEM-PLAN — Fundament und Weg (kanonisch)

> **Status:** AKTIVER ARCHITEKTUR-BOGEN · Stand Basis **V18.432** · am Code verifiziert.  
> **ZUERST lesen** vor: Studio-Andock · Foundry · Fahrzeug/Tor/Stadt/Arena · „Pipeline“ · Pack.  
> **Verwandt:** `docs/taille-spec.md` (Substanz-Reise) · `docs/studio-vertrag.md` (Lab-Blöcke) ·
> `docs/paritaet-vollendung-plan.md` (Wald-Look-Abschluss, **untergeordnet** diesem Fundament) ·
> `docs/neues-kleid-plan.md` (Vegetations-Inhalt) · `docs/roadmap.md` (Tisch).

---

# TEIL I — DIE VISION (was wir versprechen)

## 1.1 Das Versprechen

AnazhRealm ist der **souveräne Host**. Schöpfer-Labore (Wald, Garage, Porta, Arena, Stadt, …)
sind die **Sender**. Zwischen beiden liegt eine **schmale Taille**:

```text
Labore senden GESTALT + GESETZ-ALS-DATEN.
Der Host besitzt WENIGE VERBEN und rechnet BEDEUTUNG.
Assets teilen Signaturen — sie rufen sich nicht an.
Unbekanntes interferiert nicht (must-ignore).
```

**Erfolg messbar:**

| Versprechen                         | Messgröße                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Kein 100-Versionen-Krieg pro Domäne | Neue Domäne = Manifest-Zeile + Policy-Zeile + Lab-Export; **0** neue `if (kind===` im Stamm |
| Assets erscheinen vollständig       | Inventur: angefragt ⊆ sichtbar/cached (H3)                                                  |
| Gesetze aus dem Lab leben           | `drive` aus `carPhys`, `place` aus Stadt-Policy — nicht nur Mesh                            |
| Performance hält                    | ein `perfSense`; studio-relativ Band (`gate:perf-parity`)                                   |
| Keine Interferenz                   | Unbekannte Komponenten crashen nicht; ein Verb = ein System                                 |

**Was wir nicht versprechen:**

- Pixel-Identität r128-Lab ↔ r184-Welt als Dauer-DONE (Look eicht im Lab; Host rendert nativ)
- Fremde Lab-Runtime (volle Garage-Sim, volle Arena-Engine) im Host-Tick
- Unendlich viele Host-Verben — die Menge ist **geschlossen und teuer erweiterbar**

## 1.2 Das Zielbild

```text
     ┌─────────────────────────────────────────┐
     │  LABORE (viele, reich, eichen, zeigen)  │
     │  phytogenesis · garage · porta · arena  │
     │  stadt · körper · …                     │
     └──────────────────┬──────────────────────┘
                        │  TAILLE-UMSCHLAG
                        │  substance + components + unknown
                        ▼
     ┌─────────────────────────────────────────┐
     │  HOST AnazhRealm (einer, souverän)      │
     │  Verben: appear · place · body · drive  │
     │          wield · portal · rule          │
     │  + Feld · Tags · Ω · Streaming · P2P    │
     │  + ein perfSense                        │
     └──────────────────┬──────────────────────┘
                        ▼
              begehbare Ultiversum-Welt
```

## 1.3 Industrie-Anker (warum das hält)

| Vorbild               | Übernahme                                                             |
| --------------------- | --------------------------------------------------------------------- |
| **Eure Taille**       | Substanz reist; Bedeutung rechnet der Empfänger; must-ignore/preserve |
| **ECS**               | Komponenten füttern Systeme; keine Asset↔Asset-APIs                   |
| **Houdini → Engine**  | Lab = Generator; Host ≠ Lab-Runtime                                   |
| **USD / glTF extras** | Unbekannte Schemas/Extensions harmlos                                 |
| **Addressables**      | Gestalt laden/cachen (IDB/Pack)                                       |

---

# TEIL II — DAS FUNDAMENT (was immer gilt)

## 2.1 Meta-Gesetze M0–M9

Jede Welle, jeder PR, jede Domäne muss diese neun erfüllen. Verletzung = Kurskorrektur, kein „weiter flicken“.

| #      | Gesetz                    | Prüfung                                                        |
| ------ | ------------------------- | -------------------------------------------------------------- |
| **M0** | Linse vor Hebel           | Gate/Diag existiert oder wird in derselben Welle gebaut        |
| **M1** | Sender/Empfänger klar     | Lab exportiert Daten; Host führt Verb aus                      |
| **M2** | Schmaler Draht            | Passt in Umschlag (Substanz + Komponenten-Wörterbuch v1)       |
| **M3** | Empfänger souverän        | Bedeutung/Tags/Stats rechnet Host; Claims sind Metadatum       |
| **M4** | Ein Verb, ein System      | Kein Parallel-Physik/Place/Kampf-Pfad                          |
| **M5** | Keine Pairwise-Diplomatie | Asset A kennt Asset B nicht im Code                            |
| **M6** | Unbekanntes harmlos       | must-ignore; kein Crash; must-preserve wo Taille gilt          |
| **M7** | Gestalt ≠ Gesetz          | Mesh-Pfad und Policy/Physik-Pfad getrennt                      |
| **M8** | Tabelle vor if            | Neue kind-Klasse = Policy-Zeile, nicht `if (rec.kind === …)`   |
| **M9** | Lab eicht, Host lebt      | Arena/Garage zeigen und eichen; Host simuliert mit Host-Verben |

## 2.2 Drei Schichten jedes Dings

```text
SUBSTANZ     Mesh-Attribute | Parts×Material | Material-Namen
KOMPONENTEN  place | drive | body | wield | portal | identity   (optional)
BEDEUTUNG    Tags · Rolle · Stats · Kosten · Ω-Urteil          (NUR Host)
```

Abgeleitetes reist **nie** als Wahrheit (Taille §1–§3).

## 2.3 Host-Verben (geschlossene Menge v1)

| Verb       | System im Code (Anker)                                   | Input                           |
| ---------- | -------------------------------------------------------- | ------------------------------- |
| **appear** | `_foundryRequest` · `_foundryBuildGroup` · HISM/Instance | Mesh-Reply / Pack               |
| **place**  | `_forestPlantChunk` · `_scatterPass` → generische Policy | `components.place`              |
| **body**   | `blockerAABBs` · `_stepCharacter*` · Feld                | Substanz / AABB                 |
| **drive**  | `_vehicleProfile` · Mount-Zweig in Movement              | `components.drive` / fahrprofil |
| **wield**  | `_blueprintUseKind` · Ω-PHYSIS · Hand/Kampf              | Substanz (+ optionale Hints)    |
| **portal** | Portal-Systeme §14 · `affordances.isPortal`              | portal-Komponente / Meta        |
| **rule**   | `dslRun` · Welt-Regeln                                   | DSL-AST (Sandbox)               |

**Neues Verb** = Taille-minor-Ereignis: Spec + ein System + Gate + must-ignore-Beweis.  
Default: **Komponente erweitern**, nicht Verb erfinden.

## 2.4 Komponenten-Wörterbuch v1 (eingefroren klein)

Nur diese Keys sind „bekannt“. Alles andere: must-ignore + must-preserve.

```text
identity  { ns, prefix?, donor? }           // Catalog: baum_/fahrzeug_/tor_/…
render    { lods?, kindStages?, materialModel? }
place     { mode, layer?, step?, density?, affinity?, siteTag?, seedSuffix? }
          mode ∈ { none | hand | scatter | forest | site | settlement }
drive     { topSpeedMul?, kAcc?, kBrake?, mass?, vmax?, spring?, floats? }
body      { solid? }                        // meist aus Substanz abgeleitet
wield     { reachMul?, swingMul? }          // optional; Ω bleibt Herr
portal    { worldRef?, … }                  // an bestehende Portal-Meta
```

**Ableitungs-Pflicht (M3):** wo möglich aus Substanz rechnen (`carPhys(P)` → `drive`, Parts → Tags).  
Lab-Felder = Vorschlag oder Export der **selben** Formel, nicht zweite Wahrheit.

## 2.5 place.mode — Semantik

| mode         | Bedeutung                     | Heutiger Code-Keim                     |
| ------------ | ----------------------------- | -------------------------------------- |
| `none`       | nur Katalog/Werkstatt         | vehicle de facto                       |
| `hand`       | Spawn/Befehl/Mount            | `spawnArchitecture` / Mount            |
| `scatter`    | Region-Streu                  | `_scatterPass`                         |
| `forest`     | Ökologie-Poisson/Nische       | `_forestPlantChunk`                    |
| `site`       | Welt-Nische (Schrein, Tor)    | **fehlt** (Policy neu)                 |
| `settlement` | Stadt-Seed, logische Bebauung | **fehlt** (Policy neu, Wald-Schwester) |

## 2.6 Kommunikation ohne Interferenz

```text
Asset ──substance/components──► Host-Verben ──► Welt
         (keine Asset→Asset-Calls)

Schwert und Wagen „verstehen“ sich nur über:
  Tags · Rollen · Affordances · body/drive/wield-Systeme
```

## 2.7 Rollen

| Rolle                                | Lab                     | Host                  |
| ------------------------------------ | ----------------------- | --------------------- |
| Gestalt erzeugen                     | ja                      | nein (nur rendern)    |
| Gesetz eichen                        | ja (UI, carPhys, Arena) | misst mit Host-Linsen |
| Tick / Streaming / Kollision / Kampf | nein                    | ja                    |
| Bedeutung (Tags, Ω, Stats)           | claim optional          | **souverän**          |

---

# TEIL III — IST-ZUSTAND (ehrliche Baseline V18.432)

## 3.1 Was schon trägt

| Baustein                     | Ort                                               | Fundament-Bezug        |
| ---------------------------- | ------------------------------------------------- | ---------------------- |
| Mesh-Kanal                   | phytogenesis `build-asset` → `_foundryBuildGroup` | appear                 |
| Rezept-Buch                  | `get-recipes` → `_foundryIngestRecipes`           | Catalog                |
| IDB Mesh-Cache               | `_foundryIdb*` Disk-first                         | appear-Cache (Pack v0) |
| kindStages-Merge             | `_foundryIngestRenderConfig` N7.5                 | render                 |
| placement-Daten              | `PORTAL_RENDER_CONFIG.placement`                  | place (scale/rarity)   |
| tree Auto-BP ohne Stamm-Edit | `gate:nervensystem` D                             | appear+place forest    |
| vehicle Kern + BP            | vehicle-core, W7, `gate:nervensystem-vehicle`     | appear + identity      |
| fahrprofil-Steckplatz        | `_vehicleProfile` liest `fx.fahrprofil`           | drive (seit N6 GEFÜLLT: Brücke rechnet exportDrive) |
| Feld-Physik, Tags, Ω, DSL    | Stamm                                             | body · wield · rule    |
| Validator CORES              | `diag-studio-vertrag.cjs`                         | Draft Registry         |

## 3.2 Was bricht das Versprechen (Schuld)

| Schuld                          | Messung                                        | Meta-Bruch                    |
| ------------------------------- | ---------------------------------------------- | ----------------------------- |
| AutoRegister if-Kette           | nur `tree` + `vehicle`                         | M8                            |
| Worker `rel[]` hardcoded        | vehicle-core Zeile                             | M8                            |
| Zweit-Kern nur `VC` if          | phytogenesis recipes/build                     | M8                            |
| Preset-Map historisch groß      | `_foundryPresetFor`                            | M8 (Legacy ok, nicht wachsen) |
| Dual-Regime                     | **34**× `_foundryEnabled()`                    | M4/M7                         |
| ~~drive = Emergenz, nicht carPhys~~ | GETILGT N6 (09.07.): Brücke rechnet `fx.fahrprofil = exportDrive(s+fx)`, `_vehicleProfile` fährt Lab-Werte | M1/M9 erfüllt (`gate:vehicle-drive`) |
| place nicht generisch           | forest/scatter pflanzen-gebunden               | M4 für Stadt                  |
| ~~Porta 0 im Worker~~           | GETILGT ε (09.07.): porta-core im Manifest, 7 gate-Rezepte im Buch, Asset end-to-end (`gate:nervensystem-porta`) | appear erfüllt |
| Pack ohne components            | IDB nur meshes                                 | M2 unvollständig              |

## 3.3 Baseline-Zahlen (N0 — fortschreiben)

```text
_foundryEnabled()        = 34 → 27 (N7.2 Scheibe 1, 09.07.; Nennungen ohne Definitions-Zeile —
                           echte Call-Sites 29 → 22, Inventur: docs/analyse/dual-regime-inventur-n7.md)
AutoRegister kind-ifs    = 2
Worker-cores hardcoded   = vehicle (+ phyto/foundry stack)
porta im Foundry-Worker  = 0 → 7 gate-Rezepte (ε, 09.07. — Manifest-Zeile porta-core)
IDB stamp scripts        = 3 (foundry, phyto, vehicle) → 4 (+ porta; Stempel = Manifest-getrieben)
```

---

# TEIL IV — DER WEG (alle Schritte spezifiziert)

## 4.0 Phasen-Übersicht

```text
α  FUNDAMENT NAGELN     Doc + Baseline + Moratorium          [dieser Stand]
β  DRAHT GENERISCH      N1 Catalog · N2 Core-Registry
γ  GESTALT STABIL       N3 Pack · N4 Instance · N7 Dual↓
δ  GESETZE ANDOCKEN     N5 Place · N6 Drive/Wield
ε  LABS SKALIEREN       Porta · Stadt · Arena · Körper …
```

**Stop-Regeln:**

- Keine neue Domäne vor **Ende β** (N1+N2 grün).
- Kein „Pixel-Parität als Pipeline“ — Parität ist **γ/Look im Lab**, untergeordnet.
- Jede Welle: M0–M9 Checkliste im Commit/Plan-Tick.

---

## Phase α — Fundament nageln

### α.1 (diese Datei)

- [x] Vision, Meta-Gesetze, Verben, Wörterbuch, Weg
- [x] In `docs/README.md` als tragender Text verlinken (09.07.)
- [x] Eine Zeile im `CLAUDE.md`-Stand (09.07.): „Architekturbogen: nervensystem-plan“

### α.2 Moratorium

**Verboten bis β grün:**

- porta-core Andock-Hardcode
- Stadt-Host-Sonderweg
- neue `if (rec.kind ===` in AutoRegister
- neuer Zweit-Kern nur als `rel[]`-Kommentar

**Erlaubt:** Lab-Arbeit _innerhalb_ Lab-Files; Wald-Bugfixes die H3/H4 heilen; N1/N2-Implementierung.

### α.3 DONE Phase α

- Plan kanonisch · Baseline dokumentiert · Moratorium verstanden

---

## Phase β — Draht generisch

### N1 — KIND_POLICY (Catalog)

**Ziel:** Auto-Register und Preset-Prefix aus **einer Tabelle**.

**Code:**

| Schritt | Datei / Symbol                 | Spezifikation                                                       |
| ------- | ------------------------------ | ------------------------------------------------------------------- |
| N1.1    | `AnazhRealm.KIND_POLICY` (§26) | `{ tree, vehicle, … }` mit `prefix`, `donor`, `grown`, `placeExtra` |
| N1.2    | `_foundryAutoRegisterSpecies`  | Schleife Policy; fail-closed wenn donor fehlt; **0** kind-ifs       |
| N1.3    | `_foundryPresetFor`            | bare-strip aller `prefix` aus Policy (nicht nur baum_/fahrzeug_)    |
| N1.4    | `_forestExtraSpecies`          | `placeExtra === "forest"` statt `kind === "tree"`                   |
| N1.5    | Constitution optional          | Grep: AutoRegister-Körper enthält kein `kind ===`                   |

**KIND_POLICY v1 (Start):**

```js
tree:    { prefix: "baum_",     donor: "baum_eiche",     grown: true,  placeExtra: "forest" }
vehicle: { prefix: "fahrzeug_", donor: "fahrzeug_wagen", grown: false, placeExtra: null }
// später ohne Stamm-Logik-Zweig:
// gate: { prefix: "tor_", donor: "tor_basis", grown: false, placeExtra: "site" }
```

**Akzeptanz N1:**

- [x] `npm run gate:nervensystem` grün (N1, 09.07.)
- [x] `npm run gate:nervensystem-vehicle` grün (A9/A10 auf Policy migriert)
- [x] `npm run check` grün (G4.1-Probe migriert)
- [x] Diff AutoRegister: 0 kind-String-Vergleiche (Constitution-Gesetz N1/M8, 35 Gesetze)
- [x] Byte-Verhalten tree/vehicle unverändert (beide Gates D-Serien + voller Playtest)

### N2 — Core-Manifest (Runtime = Validator)

**Ziel:** Eine Quelle für Worker-Cores.

| Schritt | Spezifikation                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------- |
| N2.1    | `cores.manifest.json` (Wurzel): `{ id, scripts[], shell?, ns? }[]`                              |
| N2.2    | `_ensureAssetFoundry`: `rel` = shared three-libs + manifest scripts + shell                     |
| N2.3    | `_foundryIdbInit` stamp: hash **aller** manifest scripts                                        |
| N2.4    | phytogenesis: `resolveBuilder(presetId)` / recipe-merge **Schleife** über Kerne, nicht nur `VC` |
| N2.5    | `diag-studio-vertrag.cjs` liest Manifest (= CORES)                                              |
| N2.6    | kindStages-Zusatz: jeder Kern mit `ns` exportiert `zusatzKindStages[coreId]` generisch          |

**Manifest Start:**

```json
[
    {
        "id": "phyto",
        "scripts": ["phyto-core.js", "foundry-core.js"],
        "shell": "worlds/terrain/phytogenesis.js",
        "ns": null
    },
    { "id": "vehicle", "scripts": ["vehicle-core.js"], "ns": "__vehicleCore" }
]
```

**Akzeptanz N2:**

- [x] `gate:studio-vertrag` + nervensystem + nervensystem-vehicle + asset-contract grün (N2, 09.07.)
- [x] Neuer Core **kann** als JSON-Zeile eingetragen werden ohne `if VC` (Dritter-Kern-Beweis 12/12: synthetischer tor-Kern, 0 Stamm-Diff)
- [x] IDB bustet bei vehicle-core-Edit weiterhin (Stempel = Manifest-Text + alle manifest-scripts)

### DONE Phase β

H1 gilt: **neues Preset bekannter kind-Klasse ohne `anazhRealm.js`-Diff** (nur Lab/Buch).  
H2 vorbereitet: neue kind-Klasse = Policy-Zeile + optional Manifest + Donor-BP.

---

## Phase γ — Gestalt stabil

### N3 — Pack-Kanon

| Schritt | Spezifikation                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------- |
| N3.1    | IDB-Schema v0 dokumentieren als Pack-v0: Key `preset                                               | seed | lod | season`, Val `{ meshes }` |
| N3.2    | Pack-v1 Schema (Doc + optional JSON): + `meta.kind`, `components` optional, `cv`                   |
| N3.3    | `scripts/mint-asset-packs.cjs` (Node): build wie Worker → schreibe Artefakte; r128 nur im Mint     |
| N3.4    | `_foundryRequest`: Pack/IDB first; Live-Worker default an, Flag `?liveBake=0` für ship-path später |
| N3.5    | Ü1/Ü2 (r128→r184) **nur** an Mint/Ingest-Chokepoint, dokumentiert                                  |

**Akzeptanz N3:**

- [ ] Warmer Boot: Library aus IDB ohne auf Worker-ready zu warten (teilweise da — absichern)
- [ ] Generator-Edit → Stempel-Bust (Regression; die STATISCHE Hälfte wacht seit 09.07. in
      `gate:pack-contract` [der Stempel-Code hasht Manifest+Skripte, kommentar-gestrippter Grep])
- [x] Goldens `gate:asset-contract` ungebrochen (09.07., 52/52 nach N3-Welle)

**N3 Teil-DONE (09.07. — „Pack-Kanon", Linse `gate:pack-contract` per-push-CI):**

- [x] N3.1 Pack-v0 dokumentiert: `spec/pack/v0/CONTRACT.md` — der HEUTIGE IDB-Kanon eingefroren
      (Key `preset|seed|lod|season` · Val `{meshes}` = der structured-clone-sichere Worker-Reply ·
      Stempel = SHA-256(Manifest-Text + alle Manifest-Skripte) · Miss/Bust/Fail-stumm-Regeln)
- [x] N3.2 Pack-v1 Schema (Doc-only, derselbe CONTRACT): + `meta {kind, coreId}` (coreId
      DATEN-getrieben aus panel×Manifest, M8) + `components` (Wörterbuch v1 §2.4, heute leer) +
      `cv` + must-ignore/must-preserve; der Live-Code schreibt weiter v0 (§v1.5 = der bewusste
      Umstiegs-Folge-Schritt, 5 Punkte spezifiziert)
- [x] N3.3 Mint-Werkzeug `scripts/mint-asset-packs.cjs` (`npm run mint:asset-packs`, KEIN CI-Gate;
      `--verify`-Modus mit Exit-Codes 0/1/2): bootet foundry-ON headless, wartet die Bibliothek
      warm, mintet die `f.cache`-Schlüssel als `artifacts/packs/*.json` + `index.json` (mit
      Generator-Stempel); Puffer als base64 der rohen Bytes; Roundtrip JE Artefakt BEWIESEN
      (mint → zurücklesen → sha256 je Puffer byte-gleich zum Live-Reply)
- [x] N3.4 Ship-Hook im Request-Pfad: `window.__anazhLiveBake === false` überspringt den
      Worker-Fallback (Pack/IDB-only, der künftige Ship-Pfad); Default byte-gleich; Source- +
      Verhaltens-Probe in `gate:pack-contract` (Plan sagte `?liveBake=0` — als window-Hook
      gebaut, die dokumentierte Test-Hook-Konvention des Hauses)
- [x] N3.5 Ü1/Ü2 dokumentiert am Chokepoint: CONTRACT.md §„r128→r184-Übersetzung" mit
      Datei/Symbol-Ankern (Ü1 `LEGACY_LICHT`=π in `_dayNightApplyDirectionalLight`/
      `_dayNightApplyAmbient`/`_bakeImpostorAtlasRTT` · Ü2 raw-als-linear in
      `_foundryTreeMaterial`/`_foundryBuildGroup`/`_foundryIngestWorldParams`); keine Code-Änderung
- [x] Linse `gate:pack-contract` (package.json + check.yml playtest-Job): Pflicht-Abschnitte ·
      Stempel-Grep · Hook-Source+Verhalten · Roundtrip-Beweis (1 Preset, lod 2); `--selftest`
      beweist: ein korruptes Pack-Artefakt → rot

### N4 — Instance-Straße

| Schritt | Spezifikation                                                                      |
| ------- | ---------------------------------------------------------------------------------- |
| N4.1    | `_foundryBuildGroup` stabil als **einzige** Mesh→Group-Naht (Alias-Name optional)  |
| N4.2    | Material aus `m.mat` generisch; weniger kind-Defaults                              |
| N4.3    | Gras: Studio-only-Pfad; Tuft-Fallback unter appear **schneiden** wenn H3 grün      |
| N4.4    | Impostor: policy über kind (tree/shrub) + kindStages, nicht wachsende Preset-Liste |

**N4 DONE (09.07. — „Instance-Straße"; Verfassungs-Gesetz N4, 9 neue Zeilen in `gate:constitution`):**

- [x] N4.1 VERIFIZIERT + GEPINNT: `_foundryBuildGroup` ist die EINZIGE Mesh-Reply→THREE-Group-Naht.
      Die fünf Leser (alle `_foundryRequest(...).then((meshes)`-Sites): Gras
      (`_grassStudioGeometry`) · Impostor-LOD1 (`_foundryEnsureImpostorRecord`) · Prefetch
      (`_foundryPrefetchLibrary`-Fächer) · Flatten (`_foundryFlattenFor`) · Werkstatt-Vorschau
      (`_workshopFoundryPreviewGroup`) — jeder routet durch die Naht. KEIN zweiter Bau-Pfad
      (die Vorschau-Gruppen WRAPPEN gecachte, naht-gebaute Gruppen/Impostor-Leaves — Konsumenten,
      keine Nähte; die IDB-Persistenz speichert den Reply UNVERÄNDERT). Verfassung: die
      Reply→Geometrie-Konversion (`new T.BufferAttribute(m.position.array`) existiert genau
      EINMAL + jede Site routet (kommentar-gestrippter Fenster-Grep, Sites ≥ 5 gezählt).
- [x] N4.2 BEFUND: `m.mat` FÜHRT HEUTE SCHON (seit V18.418) — jeder Reply trägt `mat`
      (rough/metal/flat/env/side/alphaTest, Serialisierung `__extractAssetMesh`), die
      kind-Literale (Rinde 0.93 · Laub 0.62 · Gras 0.7/0.18) sind reiner Fallback für mat-lose
      Alt-Pfade → KEINE Code-Änderung (byte-gleich), nur Verfassungs-Pins + Doc. GEMESSEN am
      echten Reply (Einmal-Probe, headless foundry-ON): basalt-L0-Reply mat.roughness 0.8 →
      gebautes Material 0.8/0.04/flat/env 0.5/DoubleSide (mp, NICHT der 0.62-kind-Default);
      ohne mp bark 0.93 · grass 0.7+env 0.18; mp überstimmt auch bark (0.41 geprüft).
- [x] N4.3 GEMESSEN + WAND GEBAUT · **SCHNITT VOLLZOGEN (N7.4b, V18.436 — das Tuft-Paket:
      Tuft-Bauer + Gras-Thin geschnitten, die Wiese ist Studio-definiert; die Zensus-Wand
      + die Verfassungs-Pins wanderten mit [55 Gesetze]). Historie des Vertagens:** (a) foundry-ON
      erreicht der Tuft-Fallback NIE — die W6-Leer-Wand (`_foundryEnabled() ? "leer" : false`)
      macht jede Studio-Antwort zu geo|null|„leer", der Bauer returnt VOR dem Tuft-Zweig;
      GEMESSEN (Einmal-Probe): 76/76 Gras-Meshes tragen `foundryGras`, 0 Tuft. (b) foundry-OFF
      ist der GATE-MODUS (der volle Playtest + `gate:grass-thin` setzen `__anazhGateNoFoundry`
      und ÜBEN den Tuft-Pfad) → der Schnitt fällt ERST mit N7.3 (Gate auf foundry-ON heben;
      Anker: `docs/analyse/dual-regime-inventur-n7.md` §1 Sites #2–#5 + §4). DIE STEHENDE WAND
      bis dahin: die Zensus-Klasse „Gras ohne foundryGras-Stempel" in `gate:asset-inventory`
      (foundry-ON, per-push-CI) — seit N4 mit SELBST-TEST (injiziertes Tuft-Gras → Verletzung
      feuert, sonst wäre die Wand vakuös) + Verfassungs-Pins (Leer-Wand · `sg === "leer"` ·
      genau EIN Tuft-Aufrufer).
- [x] N4.4 DIE IMPOSTOR-POLITIK IST DATEN (M8): `KIND_POLICY` trägt je Zeile ein optionales
      `impostor: true` (tree + NEUE render-only-Zeile shrub [ohne prefix/donor — Auto-Register
      überspringt sie fail-closed, placeExtra fehlt → keine Wald-Nische]); `_foundryPresetIsTree`
      liest NUR die Policy (kein tree|shrub-kind-Literal mehr). Wahrheitstafel EXAKT wie vorher
      (live gemessen: eiche/strauch → Impostor · findling/blume/gras/gt → Geometrie); die
      Preset-Namen-Fallback-Liste bleibt (Buch-lose Frühphase, wächst nicht). Eine neue Domäne
      steuert ihre Fernstufe per Daten-Zeile.

**Akzeptanz N4:** `gate:no-second-treebuilder`, grass gates, vehicle contract — ✅ (09.07.),
plus `gate:constitution` Gesetz N4 (9 Zeilen) · `gate:asset-inventory` Tuft-Selbst-Test ·
voller Playtest foundry-off byte-gleich (kein off-Zweig fiel).

### N7 — Dual-Regime senken (parallel zu N3/N4, in Teilschritten)

| Schritt | Spezifikation                                                                                                                                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N7.1    | ✅ (09.07.) Inventur: alle Sites kategorisiert (Boot 4 / Policy 24 / Legacy 1) — `docs/analyse/dual-regime-inventur-n7.md`                                                                                                                                                                   |
| N7.2    | Policy-Gabeln → Default appear-on; Legacy nur hinter explizitem Test-Hook — **Scheibe 1 ✅ (09.07.): 7 Sites gesenkt, 29 → 22 Call-Sites** (Dichte-Draht → `_effectiveFoliageDensity` ×3 · Methoden-Dedup ×2 · Boot-Chokepoint-Dedup ×2; jede byte-gleich, voller Playtest foundry-off grün) |
| N7.3    | ✅ (09.07., V18.435) der VOLLE Playtest fährt foundry-ON; `__anazhGateNoFoundry` nur noch Unit-Richter (`__withNoFoundry`, sync-only); 26 Rote reconciled ohne Aufweichen                                                                                                                     |
| N7.4    | ✅ (09.07., V18.436) DER ABSCHIED: Kulissen + Tuft-Paket geschnitten, 4 Daten-Wahrheits-Kollapse — **29 → 14 Call-Sites = die GEMESSENE strukturelle Ziel-Menge** (die „≤10/≤5" waren vor der N7.3-Endgestalt aspirational: die Erschein-Familie trägt die Hook-Fixturen; Urteile in `dual-regime-inventur-n7.md` §5) |

**Akzeptanz N7:** Zählung sinkt pro Teilwelle; playtest grün; no-second-treebuilder grün.

### DONE Phase γ

- [x] H3 Inventur-Gate spezifiziert und grün (`gate:asset-inventory`, 09.07. — die EINE Linse
      [Zensus + requested ⊆ visible|cached], per-push-CI; 222 Unbekannte an der Quelle
      klassifiziert via `userData.inventar`-Stempel; Selbst-Tests feuern)
- [x] H4 `gate:perf-parity` im Band (09.07.: 4 Drift-Bänder aus der V18.432-Baseline [TRI ≤1,5× · DRW ≤3× · VIS ≥50 % · VRAM ≤2×] + Asset-Budget ±2 % gatend; nightly in playtest-full.yml — per-push zu schwer)
- [ ] H6 Dual-Zähler gesunken

---

## Phase δ — Gesetze andocken

### N5 — Place-Policies

| Schritt | Spezifikation                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| N5.1    | ✅ (09.07.) Schema `components.place` lesen aus Rezept `fx.place` — `_placePolicyFor(rec, kindPolicy)`                           |
| N5.2    | ✅ (09.07.) `_placeDispatch(policy, ctx)` Chokepoint — die Wald-Nischen-Quelle ruft ihn (Verfassung N5)                          |
| N5.3    | ✅ (09.07.) mode `forest` → bestehende `_forestExtraSpecies`-Nische → `_forestPlantChunk` (byte-gleich, kein Wald-Code dupliziert) |
| N5.4    | ⏳ mode `scatter` → BENANNT-VORBEREITET: Kanal steht im Dispatch, Anschluss an `_scatterPass` dokumentiert, NICHT verdrahtet (heute kein Konsument — Verdrahtung = bewusster Folge-Schritt) |
| N5.5    | ✅ (09.07.) mode `hand` / `none` → kein Worldgen (Dispatch null — das vehicle-Verhalten)                                         |
| N5.6    | ✅ (09.07.) mode `site` — minimal: Semantik-Weiche steht, siteTag reist als Daten, streut NICHT (Welt-Nische = ε-Anschluss/Porta); Gate mit synthetischem Rezept (injizierte tor-Policy-Zeile, 0 Stamm-Diff) |
| N5.7    | mode `settlement` — **nach** Stadt-Lab-Export; Seed-Suffix `:stadt`; Schwester-Logik zu Forest, nicht Kopie des Wald-Codes im if |

**Akzeptanz N5:**

- [x] Rezept `place.mode:none` → Katalog ja, Worldgen nein (`gate:place-policy` c — H8-Kern, none vs forest disjunkt)
- [x] Forest-Verhalten Regression grün (Nischen-Liste BYTE-GLEICH zur alten placeExtra-Regel, `gate:place-policy` a + `gate:nervensystem` D unverändert grün)
- [x] Synthetisches site-Rezept registrierbar über Policy (β) — `gate:place-policy` d; die PLATZIERUNG (Welt-Nische) ist bewusst der benannte ε-Anschluss (N5.6 minimal: site verhält sich heute wie none + trägt siteTag als Daten)

**N5 Teil-DONE (09.07. — „Place-Policies", Linse `gate:place-policy` per-push-CI, inkl. Selbst-Test):**

- [x] N5.1 `_placePolicyFor(rec, kindPolicy)`: Rezept-`fx.place` FÜHRT wenn vorhanden (nur die
      bekannten Felder mode/layer/step/density/affinity/siteTag/seedSuffix tragen Semantik;
      unbekannte Felder reisen unangetastet mit [must-ignore + must-preserve], unbekannter mode
      fällt GESCHLOSSEN auf "none" via `PLACE_MODES`-Tabelle); sonst die KIND_POLICY-Ableitung
      (placeExtra "forest" → forest, alles andere → none). Heute trägt KEIN Rezept den Block → 0 Regress.
- [x] N5.2 `_placeDispatch(policy, ctx)` = die EINE Weiche zum Welt-Kanal ("forest" | "scatter"
      [benannt, ohne Konsument] | null); `_forestExtraSpecies` liest die Auflösung statt
      placeExtra direkt (Umleitung, byte-gleich; der `.placeExtra`-READ lebt genau EINMAL in
      `_placePolicyFor` — Verfassungs-Gesetz N5, 5 Zeilen).
- [x] N5.6 site minimal: Registrierung über Policy-Zeile (N2-Mechanik) + siteTag als Daten +
      streut nicht — die SEMANTIK-Weiche steht, die Nischen-Platzierung ist der ε-Anschluss.
- [ ] N5.4 scatter-Verdrahtung (policy-getriebene Schicht in `_scatterRegion`/`_scatterPass` aus
      policy.layer/step/density) — der bewusste Folge-Schritt, sobald ein Rezept scatter trägt.
- [ ] N5.7 settlement — **Anker: nach dem Stadt-Lab-Export** (Phase ε, §Lab-Tabelle „Stadt");
      Schwester-Logik zu forest (Seed-Suffix `:stadt`), keine Kopie des Wald-Codes im if.

### N6 — Drive / Wield

| Schritt | Spezifikation                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------- |
| N6.1    | ✅ (09.07.) `vehicle-core`: `exportDrive(P)` aus **`carPhys(P)` + FAHR + springRate** (eine Formel)     |
| N6.2    | ✅ (09.07.) `__replyRecipes` rechnet `fx.fahrprofil = kern.exportDrive(s+fx)` beim Buch-Bau             |
| N6.3    | ✅ (09.07.) `_vehicleProfile`: Lab-drive **führt** (W7b-Steckplatz), Emergenz = Fallback wenn fehlend   |
| N6.4    | ✅ (09.07.) Movement bleibt **ein** Pfad (ride.kAcc/kBrake/topSpeedMul je genau 1×, gate-bewacht)       |
| N6.5    | Optional später: spring/pitch nur wenn Host-Verb erweitert (M4!) — `spring {k,c}` reist schon als Daten |
| N6.6    | ✅ (09.07., geprüft) wield: **kein** Arena-Import; Arena eicht; Host Ω + optional wield-Hints; M9       |

**Akzeptanz N6:**

- [x] GT vs Supersport: messbar unterschiedliche drive-Skalare aus Lab-Formel (H7 — topSpeedMul
      1.5998 vs 1.6359 · kAcc 0.5627 vs 0.6617 · kBrake 0.6252 vs 0.7228 · mass 8.94 vs 7.44 ·
      spring.k 100 vs 135; `gate:vehicle-drive` A3/B-b)
- [x] `gate:nervensystem-vehicle` grün + `smoke:labs` mit Probefahrt-Liveness (Tacho steigt mit Kern-FAHR)
- [x] Ohne drive-Felder: alter Emergenz-Pfad byte-gleich (`fahrzeug_wagen` → kein Buch-Rezept →
      Emergenz nachgerechnet ===, `gate:vehicle-drive` B-c; der volle Playtest läuft foundry-off =
      Emergenz überall, 0 Regress)

**N6 GEBAUT (09.07. — „Das Lab-Fahrprofil führt", Linse `gate:vehicle-drive` per-push-CI, inkl. Selbst-Test):**

- [x] N6.1 DIE EINE FORMEL: `exportDrive(P)` lebt in vehicle-core NEBEN `carPhys` und leitet die
      Host-Skalare aus DENSELBEN Primitiven ab, die die Probefahrt fährt — `topSpeedMul = vmax/10`
      (GT-Eich-Anker: carPhys ist auf den GT geeicht [vmax≈16], der GT fährt am emergenten
      Vier-Rad-Cap 1.6 → REF 10) · `kAcc = aEngine/vmax` [1/s, linearisierte Antriebs-Zeitkonstante]
      · `kBrake = (aEngine + FAHR.rollDecel)/vmax` [Roll-aus bei vmax: Drag + Rollwiderstand] ·
      `mass/vmax` als Daten-Reisende · `spring {k,c}` = der benannte N6.5-Anschluss. `floats` FEHLT
      BEWUSST (Schwimmen bleibt Substanz-Entscheid des Hosts, W-F V18.175). Ein partieller
      Regler-Vektor mergt über DIESELBE Basis wie buildInstance (DEFAULT_P+BASE_P — eine
      Merge-Ordnung). Dazu der FORMEL-UMZUG: die `FAHR`-Konstanten (Antrieb/Reifen, kein
      Geometrie-Bezug) zogen byte-gleich aus der Shell in den Kern, die Shell liest `VC.FAHR`
      (Paritäts-Beweis: Werte identisch + Probefahrt-Liveness in `smoke:labs` + `gate:vehicle-contract`
      cv:3 byte-grün — wheelClearance sah vorher wie nachher maxSteer 0.52).
- [x] N6.2 DIE REISE ALS BRÜCKEN-RECHNUNG (nicht statisch in PRESETS): `__replyRecipes` rechnet in
      der generischen Zweit-Kern-Schleife `fx.fahrprofil = zk.kern.exportDrive({...s, ...fx})` beim
      Buch-Bau — Gesetz #0: KEIN eingefrorenes Duplikat, ein Schöpfer-Edit an carPhys/FAHR fließt
      beim nächsten Buch-Bau automatisch mit; must-ignore für Alt-Leser; `buildInstance` byte-unberührt.
- [x] N6.3 LAB FÜHRT: der W7b-Steckplatz in `_vehicleProfile` trägt jetzt WERTE — bewiesen
      end-to-end BIT-EXAKT (Node-exportDrive == LIVE-Buch == gemountetes Profil, `gate:vehicle-drive` B).
- [x] N6.4 EIN PFAD: ride.topSpeedMul/kAcc/kBrake leben je GENAU EINMAL, alle in
      `_loopPlayerMovement` (statisch gate-bewacht — ein zweiter Fahr-Code wird rot).
- [ ] N6.5 spring/pitch als Host-Verb — BENANNT, NICHT gebaut (M4); die Daten (`spring {k,c}`)
      reisen schon im fahrprofil, der Konsument ist der bewusste Folge-Schritt.
- [x] N6.6 WIELD GEPRÜFT: kein Arena-Import gebaut — Ω-PHYSIS bleibt der Wield-Richter
      (`_blueprintUseKind` + wahrerbauplan, souverän im Host), der wield-Hints-Steckplatz ist im
      Wörterbuch v1 benannt (`wield { reachMul?, swingMul? }`, §2.4) und wartet auf die
      Arena-Eichung (Phase ε, „Ω-first").

### DONE Phase δ

Gesetze aus Lab **kommunizieren** über Wörterbuch v1; Host-Verben fühlen den Unterschied.

- [x] N5 Teil-DONE (place none/forest/site disjunkt, H8 grün; offen: N5.4 scatter-Verdrahtung
      [wartet auf das erste scatter-Rezept] + N5.7 settlement [wartet auf den Stadt-Lab-Export, ε])
- [x] N6 GEBAUT (drive aus der EINEN Lab-Formel, H7 grün; offen: N6.5 spring/pitch [M4-benannt])
- [x] H7 + H8 grün → **Phase δ steht** (die ε-Anschlüsse N5.4/N5.7/N6.5 sind benannte Folge-Schritte,
      keine offenen Gesetze — „Fahrzeug fühlt Lab-drive; place.mode disjunkt" ist messbar erfüllt).

---

## Phase ε — Labs skalieren (erst nach β; ideal nach δ)

Pro Lab **Checkliste** (immer gleich):

```text
1. Kern: buildInstance + PRESETS + STUDIO_VERTRAG (+ ns wenn Zweit-Kern)
2. cores.manifest.json Zeile
3. KIND_POLICY Zeile + Donor-Blueprint falls nötig
4. components füllen (place/drive/…)
5. gate:studio-vertrag grün
6. gate:nervensystem-<domäne> oder generisches Injektions-Gate
7. Kein neuer if (kind===) im Stamm
```

| Lab    | Phase               | components                     | Notiz                                |
| ------ | ------------------- | ------------------------------ | ------------------------------------ |
| Wald   | Inhalt läuft        | place forest/scatter           | γ aufräumen, nicht neu erfinden      |
| Garage | N6 ✅ (09.07.)      | drive + appear                 | Physik = carPhys→exportDrive→drive   |
| Porta  | ✅ ε (09.07.)       | appear ✅ + place site (Daten, N5.6) + portal (benannter Folge-Anschluss) | porta-core Split ✅ (14/14 Paritäts-Hashes · Goldens cv:4 `gate:porta-contract` · Linse `gate:nervensystem-porta`; Stamm-Diff = NUR KIND_POLICY-gate-Zeile + tor_basis-Donor-DATENBLOCK) |
| Stadt  | ε nach N5.7         | appear Haus + place settlement | Lab liefert Policy+Haus-Assets       |
| Arena  | ε                   | appear + wield hints           | Ω-first                              |
| Körper | parallel wahrerguss | appear + motion                | eigener Bogen; Nervensystem = appear |

---

# TEIL V — HÄRTETESTS (Versprechen = messbar)

| ID     | Härtetest                                                      | Phase | Gate / Linse                                                                                                 |
| ------ | -------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------ |
| **H1** | Neues Preset **bekannter** kind-Klasse: 0 Diff `anazhRealm.js` | β     | nervensystem D + Prozess                                                                                     |
| **H2** | Neue kind-Klasse: nur Policy+Manifest+Donor, 0 kind-if         | β+ε   | Constitution + manuell                                                                                       |
| **H3** | Inventur appear: requested ⊆ visible\|cached                   | γ     | `gate:asset-inventory` ✅ (09.07., CI)                                                                       |
| **H4** | Perf studio-relativ im Band                                    | γ     | `gate:perf-parity` ✅ (Band, nightly)                                                                        |
| **H5** | Unbekannte component-keys: must-ignore, kein Crash             | β+δ   | Unit im Ingest                                                                                               |
| **H6** | `_foundryEnabled()`-Zähler sinkt                               | γ N7  | Baseline 29 Call-Sites → **22** (N7.2 Scheibe 1, 09.07.; Inventur `docs/analyse/dual-regime-inventur-n7.md`) |
| **H7** | drive aus Lab-Formel ≠ reiner Emergenz-Zufall                  | δ N6  | `gate:vehicle-drive` ✅ (09.07., per-push-CI — GT vs Supersport ≥2 Skalare verschieden [kAcc +17,6 % · kBrake +15,6 % · topSpeedMul/mass/vmax], bit-exakt Formel→Buch→Mount-Profil; ohne Buch Emergenz byte-gleich; Selbst-Test feuert) |
| **H8** | place.mode none vs forest disjunkt                             | δ N5  | `gate:place-policy` ✅ (09.07., per-push-CI — none: Katalog ja/Nische nein · forest byte-gleich · site trägt siteTag ohne Streu · must-ignore/must-preserve; Selbst-Test: Verletzungs-Injektion feuert) |

Bestehende Pflicht-Gates pro Merge: `check` · relevant nervensystem* · studio-vertrag · page-error wo Render.

---

# TEIL VI — ENTSCHEIDUNGSBAUM (Alltag)

```text
Neuer Wunsch
  │
  ├─ Nur aussehen / Mesh?     → appear (Lab + Bake/Pack)     [γ]
  ├─ Wo in der Welt?          → place-Komponente             [δ N5]
  ├─ Wie fahren / bewegen?    → drive aus Lab-Formel         [δ N6]
  ├─ Wie greifen / kämpfen?   → Substanz + Ω (+ wield hint)  [δ N6.6]
  ├─ Kollision / fest?        → body / Parts                 [Host]
  ├─ Welt-Tor?                → portal                       [ε]
  └─ Neues Host-Verb nötig?
         NEIN → Wörterbuch-Feld (must-ignore für Alt-Builds)
         JA   → Spec + System + Gate (teuer, bewusst)
```

---

# TEIL VII — VERHÄLTNIS ZU ANDEREN PLÄNEN

| Plan                       | Rolle                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| **dieser**                 | Architektur-Fundament Host↔Lab                                                    |
| `paritaet-vollendung-plan` | Wald-Look-Abschluss; DONE = H3/H4 + Sign-off, **nicht** endlos Pixel; unter M7    |
| `neues-kleid-plan`         | Vegetations-Inhalt im Lab                                                         |
| `studio-vertrag`           | Lab-Manifest B1–B6; wird von β/N2 operationalisiert                               |
| `taille-spec`              | Substanz-Reise P2P/Blueprint; Nervensystem **erweitert** den Geist auf components |
| `wahrerguss` / Körper      | Bauplan-Qualität; appear+wield/body füttern, ersetzen nicht                       |

Konfliktregel: **Meta-Gesetze dieses Plans schlagen** lokale „noch ein Foundry-if“-Shortcuts.

---

# TEIL VIII — DEFINITION OF DONE (gesamter Bogen)

Der Nervensystem-Bogen ist **fertig**, wenn:

1. **β grün:** KIND_POLICY + cores.manifest; H1 stabil.
2. **γ grün:** H3 + H4 + H6 (Dual klar gesunken).
3. **δ grün:** H7 + H8; Fahrzeug fühlt Lab-drive; place.mode disjunkt.
4. **ε bewiesen:** mindestens **eine** neue Domäne (Porta **oder** Stadt-Policy) nur über Checkliste §ε, ohne kind-if im Stamm.
   ✅ **(09.07., Porta):** der `git diff anazhRealm.js` des Andockens trägt AUSSCHLIESSLICH
   die KIND_POLICY-`gate`-Zeile + den `tor_basis`-Donor-DATENBLOCK (0 Logik, kein if,
   kein neuer Pfad — der Diff-Beweis lebt im ε-Commit); alles andere sind Daten/Lab-Dateien
   (cores.manifest-Zeile · porta-core.js · Lab-Shell liest den Kern, Split-Parität 14/14
   hash-bewiesen). Linsen: `gate:nervensystem-porta` (statisch + foundry-ON end-to-end,
   Selbst-Test) · `gate:porta-contract` (Goldens cv:4, seed-invariant) · `gate:studio-vertrag`
   validiert den dritten Kern automatisch übers Manifest.
5. Schöpfer-Sign-off: „Lab ändern → Welt folgt; neue Domäne fühlt sich nicht wie 100 Versionen an.“

Bis dahin: jeder Merge kann **Teil-DONE** einer Phase sein — nie „Pipeline fertig“ ohne H-Zeile.

---

# TEIL IX — ERSTE IMPLEMENTIERUNG (konkret, jetzt)

Wenn Implementierung startet — **nur N1**, in dieser Reihenfolge:

1. `AnazhRealm.KIND_POLICY` in §26 (tree + vehicle äquivalent zu heute).
2. `_foundryAutoRegisterSpecies` → Tabellen-Schleife.
3. `_foundryPresetFor` prefixes aus Policy.
4. `_forestExtraSpecies` placeExtra.
5. Gates: nervensystem, nervensystem-vehicle, check.
6. Plan-Tick: N1 Checkboxen; Baseline-Zähler unverändert lassen außer wo spezifiziert.

Dann N2, nicht Porta.

---

# TEIL X — EIN SATZ

> **Fundament:** Taille-Geist — Labore senden Substanz und schmale Komponenten; der Host besitzt wenige Verben und rechnet Bedeutung; Meta-Gesetze verbieten Interferenz und Hardcode-Diplomatie.  
> **Weg:** α nageln → β Draht (N1–N2) → γ Gestalt (N3–N4–N7) → δ Gesetze (N5–N6) → ε Labs skalieren.  
> **Hält das Versprechen:** wenn jede Domäne die Checkliste ε erfüllt und H1–H8 grün sind — nicht wenn die Prosa „Nervensystem“ sagt.

---

_Verifikation Code-Anker (V18.432): `_ensureAssetFoundry`, `_foundryAutoRegisterSpecies`, `_foundryPresetFor`, `_foundryRequest`/`_foundryIdb*`, `_foundryBuildGroup`, `_vehicleProfile`, `_forestPlantChunk`/`_scatterPass`, phytogenesis Portal `build-asset`/`get-recipes`/`get-render-config`, `diag-nervensystem*`, `diag-studio-vertrag` CORES, Zählung `_foundryEnabled()` = 34 (→ 27 nach N7.2 Scheibe 1, 09.07.)._
