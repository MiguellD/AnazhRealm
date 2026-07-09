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
| fahrprofil-Steckplatz        | `_vehicleProfile` liest `fx.fahrprofil`           | drive (fast leer)      |
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
| drive = Emergenz, nicht carPhys | Presets ohne fahrprofil; `carPhys` unverbunden | M1/M9                         |
| place nicht generisch           | forest/scatter pflanzen-gebunden               | M4 für Stadt                  |
| Porta 0 im Worker               | Labor nur W12-Portal                           | appear fehlt                  |
| Pack ohne components            | IDB nur meshes                                 | M2 unvollständig              |

## 3.3 Baseline-Zahlen (N0 — fortschreiben)

```text
_foundryEnabled()        = 34 → 27 (N7.2 Scheibe 1, 09.07.; Nennungen ohne Definitions-Zeile —
                           echte Call-Sites 29 → 22, Inventur: docs/analyse/dual-regime-inventur-n7.md)
AutoRegister kind-ifs    = 2
Worker-cores hardcoded   = vehicle (+ phyto/foundry stack)
porta im Foundry-Worker  = 0
IDB stamp scripts        = 3 (foundry, phyto, vehicle)
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

| Schritt | Spezifikation                                                                     |
| ------- | --------------------------------------------------------------------------------- |
| N4.1    | `_foundryBuildGroup` stabil als **einzige** Mesh→Group-Naht (Alias-Name optional) |
| N4.2    | Material aus `m.mat` generisch; weniger kind-Defaults                             |
| N4.3    | Gras: Studio-only-Pfad; Tuft-Fallback unter appear **schneiden** wenn H3 grün     |
| N4.4    | Impostor: policy über kind/tree                                                   | shrub + kindStages, nicht wachsende Preset-Liste |

**Akzeptanz N4:** `gate:no-second-treebuilder`, grass gates, vehicle contract.

### N7 — Dual-Regime senken (parallel zu N3/N4, in Teilschritten)

| Schritt | Spezifikation                                                                              |
| ------- | ------------------------------------------------------------------------------------------ |
| N7.1    | ✅ (09.07.) Inventur: alle Sites kategorisiert (Boot 4 / Policy 24 / Legacy 1) — `docs/analyse/dual-regime-inventur-n7.md` |
| N7.2    | Policy-Gabeln → Default appear-on; Legacy nur hinter explizitem Test-Hook — **Scheibe 1 ✅ (09.07.): 7 Sites gesenkt, 29 → 22 Call-Sites** (Dichte-Draht → `_effectiveFoliageDensity` ×3 · Methoden-Dedup ×2 · Boot-Chokepoint-Dedup ×2; jede byte-gleich, voller Playtest foundry-off grün) |
| N7.3    | Headless: Foundry-Fixtures/ON für Produktionsnähe; `__anazhGateNoFoundry` nur Unit-Richter |
| N7.4    | Zielzahl: ≤ 10 Aufrufe, dann ≤ 5 (Boot + Hook)                                             |

**Akzeptanz N7:** Zählung sinkt pro Teilwelle; playtest grün; no-second-treebuilder grün.

### DONE Phase γ

- [x] H3 Inventur-Gate spezifiziert und grün (`gate:asset-inventory`, 09.07. — die EINE Linse
      [Zensus + requested ⊆ visible|cached], per-push-CI; 222 Unbekannte an der Quelle
      klassifiziert via `userData.inventar`-Stempel; Selbst-Tests feuern)
- [ ] H4 `gate:perf-parity` im Band
- [ ] H6 Dual-Zähler gesunken

---

## Phase δ — Gesetze andocken

### N5 — Place-Policies

| Schritt | Spezifikation                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| N5.1    | Schema `components.place` lesen aus Rezept `fx.place` oder render-config                                                         |
| N5.2    | `_placeDispatch(chunk                                                                                                            | region, policy, rng)` Chokepoint |
| N5.3    | mode `forest` → bestehendes `_forestPlantChunk`                                                                                  |
| N5.4    | mode `scatter` → `_scatterPass` mit Policy-Parametern                                                                            |
| N5.5    | mode `hand` / `none` → kein Worldgen                                                                                             |
| N5.6    | mode `site` — minimal: Tag/Nische (Tor); Gate mit synthetischem Rezept                                                           |
| N5.7    | mode `settlement` — **nach** Stadt-Lab-Export; Seed-Suffix `:stadt`; Schwester-Logik zu Forest, nicht Kopie des Wald-Codes im if |

**Akzeptanz N5:**

- [ ] Rezept `place.mode:none` → Katalog ja, Worldgen nein
- [ ] Forest-Verhalten Regression grün
- [ ] Synthetisches site-Rezept registrierbar über Policy (β) und platziert unter N5.6

### N6 — Drive / Wield

| Schritt | Spezifikation                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------- |
| N6.1    | `vehicle-core`: `exportDrive(P)` oder Preset-`fx.drive` aus **`carPhys(P)` + springRate** (eine Formel) |
| N6.2    | `__replyRecipes` trägt drive-Felder im Buch (oder fx.drive)                                             |
| N6.3    | `_vehicleProfile`: Lab-drive **führt**, Emergenz = Fallback wenn fehlend                                |
| N6.4    | Movement bleibt **ein** Pfad (kAcc/kBrake/topSpeed/vmax mappen)                                         |
| N6.5    | Optional später: spring/pitch nur wenn Host-Verb erweitert (M4!)                                        |
| N6.6    | wield: **kein** Arena-Import; Arena eicht; Host Ω + optional wield-Hints; M9                            |

**Akzeptanz N6:**

- [ ] GT vs Supersport: messbar unterschiedliche drive-Skalare aus Lab-Formel
- [ ] `gate:nervensystem-vehicle` + walk/mount smoke
- [ ] Ohne drive-Felder: alter Emergenz-Pfad (0 Regress)

### DONE Phase δ

Gesetze aus Lab **kommunizieren** über Wörterbuch v1; Host-Verben fühlen den Unterschied.

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
| Garage | N6                  | drive + appear                 | Physik = carPhys→drive               |
| Porta  | ε nach β            | appear + place site + portal   | porta-core Split                     |
| Stadt  | ε nach N5.7         | appear Haus + place settlement | Lab liefert Policy+Haus-Assets       |
| Arena  | ε                   | appear + wield hints           | Ω-first                              |
| Körper | parallel wahrerguss | appear + motion                | eigener Bogen; Nervensystem = appear |

---

# TEIL V — HÄRTETESTS (Versprechen = messbar)

| ID     | Härtetest                                                      | Phase | Gate / Linse                           |
| ------ | -------------------------------------------------------------- | ----- | -------------------------------------- |
| **H1** | Neues Preset **bekannter** kind-Klasse: 0 Diff `anazhRealm.js` | β     | nervensystem D + Prozess               |
| **H2** | Neue kind-Klasse: nur Policy+Manifest+Donor, 0 kind-if         | β+ε   | Constitution + manuell                 |
| **H3** | Inventur appear: requested ⊆ visible\|cached                   | γ     | `gate:asset-inventory` ✅ (09.07., CI) |
| **H4** | Perf studio-relativ im Band                                    | γ     | `gate:perf-parity`                     |
| **H5** | Unbekannte component-keys: must-ignore, kein Crash             | β+δ   | Unit im Ingest                         |
| **H6** | `_foundryEnabled()`-Zähler sinkt                               | γ N7  | Baseline 29 Call-Sites → **22** (N7.2 Scheibe 1, 09.07.; Inventur `docs/analyse/dual-regime-inventur-n7.md`) |
| **H7** | drive aus Lab-Formel ≠ reiner Emergenz-Zufall                  | δ N6  | diag Mount-Profil                      |
| **H8** | place.mode none vs forest disjunkt                             | δ N5  | Gate                                   |

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
