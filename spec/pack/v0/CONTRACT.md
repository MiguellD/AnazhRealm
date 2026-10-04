# Pack-Vertrag v0 / v1 (Pack-Kanon, Nervensystem N3)

> **NORMATIV für v0** — der HEUTIGE IDB-Asset-Cache als eingefrorener Kanon (reine Beschreibung
> des Ist, Stand V18.433; der Code ist die Wahrheit, dieses Dokument der Vertrag darüber).
> **SCHEMA für v1** — die Pack-Hülle mit `meta`/`components`/`cv` (Doc + Mint-Artefakte; der
> Live-Code SCHREIBT weiter v0 — der v0→v1-Umstieg ist ein bewusster Folge-Schritt, §v1.5).
>
> Linse: `npm run gate:pack-contract` (Pflicht-Abschnitte · Stempel-Grep · Ship-Hook · der
> Roundtrip-Beweis mint→zurücklesen→byte-gleich). Mint-Werkzeug: `scripts/mint-asset-packs.cjs`
> (kein CI-Gate — ein Werkzeug, mit `--verify`-Modus + Exit-Codes).
>
> Ort im Nervensystem (`docs/nervensystem-plan.md`): Phase γ · Verb **appear** · „Addressables"-
> Anker (Gestalt laden/cachen). Verwandt: `spec/asset-contract/v1/CONTRACT.md` (der Draht-Vertrag
> des Worker-Replies — das Pack persistiert GENAU diesen Reply).

---

## v0 — Schlüssel

Ein Eintrag je gebackenem Asset im IndexedDB-Store `anazhFoundryAssets/assets`:

```text
<preset>|<gestalt>|<lod>
```

Der EINE Schlüssel-Münzer ist `_foundryKoerperKey(preset, gestalt, lod, ov)` (anazhRealm.js) — derselbe String ist
Platten-, Cache- und leafKey-Stamm. Ein GEPRÄGTER Körper (Ofen-Mensch, Tier mit Reglern, gestempelter Eintrag) hängt
seinen ov-Hash an: `<preset>|<gestalt>|<lod>|ov:<hash>` (`_studioOvHash`, reihenfolgefest) — nur die Werkstatt-Vorschau
und die Hand (`wo === 0` mit ov) sind Unikate ohne Platte.

DIE KARTE (V18.527) liegt im selben Store:

```text
karte|<preset>|<gestalt>[|ov:<hash>]      →  { payload: { cw, ch, V, aspect, height, albedo, normal } }
```

(`_foundryKartenKey`; `albedo`/`normal` Uint8Array je cw·ch·V·4 — die Bake-Antwort des Studios, vor dem Transfer
geschrieben; ein leerer/fehlerhafter Bake wird nie persistiert).

- `preset` — ein Schlüssel aus dem Studio-Rezeptbuch (`get-recipes`; Bäume `eiche fichte tanne
birke weide mammut` · Boden `gras strauch blume` · Fels `findling basalt sediment zacken
geroell` · Kristall `kristalle` · Zweit-Kern z. B. `gt supersport …`).
- `gestalt` — der Same (Integer 1..V; V = `PORTAL_RENDER_CONFIG.lod.budget.gestalten[preset]`, sonst `'*'`;
  `_foundryVariantFor(seed, preset)` wählt sie aus den hohen Hash-Bits, die Bibliothek wärmt 1..V).
- `lod` — `0 | 1 | 2` (beim Gras trägt die Stufen-Position den `stage`-Wert desselben Formats).
- KEINE Saison (V18.527): jeder Körper ist Golden-Sommer gebacken — die Transport-Schale nagelt `season: "summer"`
  auf jeden `build-asset`/`bake-impostor`, bevor das Studio ihn sieht; das Jahr färbt der Host über die Uniform
  `uSeasonMul` (SAISON_GESETZ). Die 36 Sommer↔Winter-Golden-Paare (`spec/asset-contract`) unterscheiden sich nur in
  `foliage.color`/`foliageTex.color` — Position, Normale, UV, Index und Rinde sind byte-gleich.

Dazu EIN Meta-Schlüssel `__stamp` (der Stempel, s. u.). Schreiber UND Leser ist seit V18.511 die
**Transport-Schale** `_foundrySchale` (anazhRealm.js): der Host-Teil des Foundry-Kanals, der IM Worker vor dem
Studio läuft — der Haupt-Thread fasst den Store nie an (`gate:fluss`).

## v0 — Wert

```text
{ meshes: Mesh[] }
```

`meshes` ist der Worker-Reply von `build-asset` → `asset` (`spec/asset-contract/v1/CONTRACT.md` §1)
**nach der Transport-Schale** (Format 2, V18.511): die KONSUM-WAND streicht jedes Vertex-Attribut außerhalb
`AnazhRealm.FOUNDRY_LESEN` (genau die Leser von `_foundryBuildMesh` — aWind/aCenter/aType reisten 32 % der Bytes
ohne Leser), die VERENGUNG macht den Index eines Teils mit ≤ 65 536 Vertices zum `Uint16Array`. Die übrigen
Puffer sind byte-gleich zum Studio-Reply; der Treffer IST die verschlankte Antwort eines früheren Boots und
reist wie jede Antwort per Transfer (zero-copy) zum Haupt-Thread. Der Studio-Draht selbst (die Asset-Goldens)
bleibt unberührt — die Schale sitzt hinter ihm.

```text
Mesh {
  kind:  string,          // bark | barkBirch | stem | foliage | foliageTex | grass | … | unknown
  mat:   { roughness, metalness, flatShading, envMapIntensity, side, alphaTest, hasNormalMap,
           color? },      // color: [r,g,b] r128-LINEAR, nur Zweit-Kern-Meshes (must-ignore für Alt-Leser)
  <attr>:{ array:Float32Array, itemSize:int },  // position PFLICHT; nur Namen aus FOUNDRY_LESEN
  index?: Uint16Array | Uint32Array             // Uint16 bei ≤ 65 536 Vertices
}
```

## v0 — Stempel (die Drift-Wand)

Ein persistierter Bake IST eine Kopie → sein Stempel MUSS der Hash der GENERATOR-QUELLEN sein
(kein Versions-Ritual). Symbol: die Transport-Schale `_foundrySchale` (der Boot `_ensureAssetFoundry` reicht
ihr den Manifest-Text und die Skript-URLs):

```text
stamp = SHA-256( manifestText + "\n" + script_1 + … + script_n + "\n" + shell_1 + … + shell_m ) + "|f" + FOUNDRY_PLATTE_FORMAT
```

- `manifestText` — der ROHE Text von `cores.manifest.json` (ein Manifest-Edit = neuer Kern-Satz = Bust).
- `script_i` — der Text JEDES `scripts[]`-Eintrags ALLER Manifest-Kerne, in Manifest-Reihenfolge
  (heute: `phyto-core.js`, `foundry-core.js`, `vehicle-core.js`) — jeder Kern ist Generator-Quelle.
- `shell_j` — der Text JEDER `shell` der Manifest-Kerne (heute `worlds/terrain/phytogenesis.js`; V18.527): die Shell
  trägt `__extractAssetMesh` (backt matrixWorld in die Vertices) und `bakeImpostorAtlas` (die Karte) — ein Shell-Edit
  leert die Platte.
- Jeder Fetch trägt den `?v=<VERSION>`-Cache-Buster (Gesetz: jede separat geladene versionierte Datei).
- `|f<n>` — das Transport-Format (heute 3: saisonfreie Schlüssel + Karten, V18.527; 2 = Konsum-Wand + Uint16-Index):
  eine geänderte Konsum-Wand, Verengung oder Schlüssel-Form leert den Cache von selbst.
- Beim DB-Open wird `__stamp` gelesen: Mismatch → `store.clear()` + neuen Stempel schreiben
  (der GANZE Cache ist potenziell Drift). Match → der Cache lebt weiter.

## v0 — Miss/Bust/Fail-stumm-Regeln

| Fall                           | Verhalten (heute, normativ)                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Cache-Treffer                  | die Schale antwortet von der Platte (`platte: true` am Reply), das Studio baut nicht            |
| Cache-Miss                     | die Schale reicht den Auftrag an das Studio; dessen Antwort → Wand · Verengung · Put · Transfer |
| Worker noch nicht ready        | ehrliches `null` (`FOUNDRY KALT`) — der Aufrufer deferriert + fragt später (gate-treu)          |
| Stempel-Mismatch               | Store leeren + neuen Stempel schreiben (Bust VON SELBST bei Generator- und Format-Edit)         |
| Headless/Null-Renderer         | Platte AUS (`cfg.platte` false, gate-deterministisch); der Schlüssel reist, die Schale entscheidet |
| Vorrat (`vorrat: true`)        | liegt der Körper auf der Platte oder gibt es keine: leere Antwort ohne Bau; sonst Bau → Put → leer |
| Karte (`bake-impostor`)        | Treffer: `impostor`-Antwort von der Platte (`platte: true`), kein Bake; Miss: Bake → Put → Transfer |
| Jeder IDB-/Quota-/Parse-Fehler | die Schale schreibt nicht mehr und fragt nur noch das Studio (nie ein Nutzer-sichtbarer Fehler) |
| Leerer/`null`-Reply            | wird NIE persistiert (der Put verlangt `meshes.length`; die Art bleibt nachfragbar)             |

## Der Request-Pfad + der Ship-Hook (N3.4)

`_foundryRequest(presetId, seed, lod, ov, wo)` — die EINE Lese-Reihenfolge:

```text
1. Hook             window.__anazhLiveBake === false  →  nurPlatte      (ohne Platte: return null)
2. Auftrag          _foundryWorkerRequest(…, platte = "<preset>|<gestalt>|<lod>", nurPlatte)
3. Schale (Worker)  Platte zuerst → Treffer; Miss + nurPlatte → leere Antwort (Host: null);
                    Miss → Studio → Wand · Verengung · Put · Transfer
```

Der dokumentierte Test-Hook `window.__anazhLiveBake === false` überspringt den Live-Worker-
Fallback — der KÜNFTIGE Ship-Pfad (nur gemintete Packs/Platte, kein Live-Bake beim Nutzer).
**Default (Hook `undefined`) = heutiges Verhalten, byte-gleich.** Jeder andere Wert als das
strikte `false` ist wirkungslos (kein truthy-Raten). Linse: `gate:pack-contract` (Source-Probe
im kommentar-gestrippten `_foundryRequest`-Body + Verhaltens-Beweis Hook-an → `null` trotz
ready-Worker, Hook-weg → Meshes).

---

## Pack v1 — Schema (Doc + Mint-Artefakte; der Live-Code schreibt weiter v0)

Die v1-Hülle macht das Pack zum SELBSTTRAGENDEN Artefakt (Datei statt IDB-Eintrag): `meta`
identifiziert die Domäne daten-getrieben, `components` trägt das Wörterbuch v1, `cv` versioniert
den Vertrag. Artefakt-Form (`scripts/mint-asset-packs.cjs` → `artifacts/packs/`):

```text
Datei   <preset>-s<gestalt>-L<lod>.json
Inhalt  {
  cv: 1,                                  // Vertrags-Version des Pack-Kanons
  key: "<preset>|<gestalt>|<lod>",        // der v0-Schlüssel, unverändert
  presetId, seed, lod,                    // der Schlüssel aufgefaltet (Lesbarkeit; seed = die Gestalt)
  meta: { kind, coreId },                 // kind aus dem Rezeptbuch; coreId daten-getrieben (s. u.)
  components: {},                         // OPTIONAL: das Wörterbuch v1 (nervensystem-plan §2.4:
                                          // identity/render/place/drive/body/wield/portal) — heute
                                          // leer; ein Lab-Export füllt es in Phase δ (N5/N6)
  meshes: [ {                             // der Worker-Reply, verlustfrei serialisiert:
    kind, mat,
    attrs: { <name>: { itemSize, type, b64 } },  // type z. B. "Float32Array"; b64 = die ROHEN
    index?: { type, b64 }                        // little-endian-Puffer-Bytes (byte-verlustfrei —
  } ]                                            // JSON-Zahlen wären verlustbehaftet/aufgebläht)
}
Index   index.json { cv, stamp, minted, files: { <datei>: sha256 } }
        // stamp = der v0-Generator-Quellen-Stempel (die Hash-Formel der Transport-Schale, ohne |f) —
        // ein späterer Lade-Pfad kann Pack↔Generator-Drift GENAU wie die IDB erkennen.
```

**Serialisierungs-Entscheid:** base64 der rohen Puffer-Bytes (wie `spec/asset-contract`-Harness) —
ein späterer Lade-Pfad liest verlustfrei zurück (`Buffer/atob → <type>-Array`); der Roundtrip ist
BEWIESEN (Mint: minten → zurücklesen → sha256 je Puffer byte-gleich zum Live-Reply; Gate: dasselbe
für 1 Preset).

**`meta.coreId` — daten-getrieben (M8, kein kind-if):** die Zweit-Kern-Rezepte reisen im gemergten
Buch mit `panel = <manifest-core.id>` (`__replyRecipes`, first-wins). Der Mint liest
`cores.manifest.json`: ist `rec.panel` die id eines Manifest-Kerns mit `ns` → `coreId = rec.panel`;
sonst `coreId = <erster Manifest-Kern>.id` (der Erst-Kern führt, heute `phyto`).

### v1 — must-ignore / must-preserve

- **must-ignore:** unbekannte Felder (auf Pack-, meta-, components- und Mesh-Ebene) werden vom
  Leser IGNORIERT, nie ein Crash (M6). Ein v0-Leser, der ein v1-Pack sieht, liest `meshes` und
  ignoriert den Rest.
- **must-preserve:** ein Werkzeug, das ein Pack liest und WIEDER SCHREIBT, erhält unbekannte
  Felder byte-treu (der Taille-Geist, `docs/taille-spec.md`).
- **cv-Regel:** `cv` erhöht sich NUR bei einem inkompatiblen Schnitt; additive Felder sind
  minor-frei (must-ignore trägt sie).

### v1.5 — Der v0→v1-Live-Umstieg (bewusster Folge-Schritt, NICHT diese Welle)

Der Live-Code (die Transport-Schale `_foundrySchale`) schreibt heute v0 (`{ meshes }`). Der Umstieg braucht:

1. Die Schale schreibt die v1-Hülle (`cv`/`key`/`meta`) und liest BEIDE
   Formen (v0-Wert `{meshes}` = must-ignore-kompatibler Alt-Bestand; kein Zwangs-Bust nötig —
   der Stempel bustet ohnehin bei jedem Generator-Edit).
2. Ein Pack-Lade-Pfad neben der IDB: `artifacts/packs/*.json` (oder ausgelieferte Pack-Dateien)
   → b64-Dekodierung → typed arrays → derselbe `{meshes}`-Reply-Pfad der Schale
   (VOR dem Studio-Bau; der Ship-Hook `__anazhLiveBake === false` schaltet dann den
   Worker ganz ab).
3. Stempel-Prüfung des Pack-Index (`index.json.stamp`) gegen die live gerechnete Formel —
   Mismatch = Pack stale → Worker (Dev) bzw. ehrliches null (Ship).
4. `meta.kind`/`components` speisen den Ingest (Auto-Blueprint/KIND_POLICY liest `meta.kind`
   statt eines Buch-Lookups, `components` → die Verben in Phase δ).
5. Linse: `gate:pack-contract` erweitert um den v1-Rundlauf (IDB-Wert trägt cv/meta; Alt-Bestand
   lesbar).

---

## r128→r184-Übersetzung am Chokepoint (Ü1/Ü2)

Das Pack trägt die ROHEN r128-Daten (Vertex-Farben/Material-Regler, wie sie das Studio bäckt) —
die Übersetzung in die r184-Welt lebt NUR am Empfangs-/Anwendungs-Chokepoint des Hosts, NIE im
Pack und NIE verstreut (die zwei DOKUMENTIERTEN Migrations-Regeln, keine Tuning-Knöpfe):

**Ü1 — LICHT (`AnazhRealm.LEGACY_LICHT = Math.PI`):** die three.js-r155-Regel
(useLegacyLights→physisch: Legacy hatte keine 1/π-BRDF-Normierung — physikalische Lichter sind
bei GLEICHER Zahl ~π-dunkler). Die numerisch aus dem r128-Studio kopierten Intensitäten werden
an den Licht-ANWENDUNGEN mit der EINEN Konstante multipliziert:

| Anker (anazhRealm.js)                   | Anwendung                                                        |
| --------------------------------------- | ---------------------------------------------------------------- |
| `AnazhRealm.LEGACY_LICHT` (§26-Statics) | die EINE Konstante (Math.PI), kein Tuning-Knopf                  |
| `_dayNightApplyDirectionalLight`        | Sonne/KEY · FILL · RIM · BACK (je `base × LEGACY_LICHT × a.lum`) |
| `_dayNightApplyAmbient`                 | der Hemi-Tag-Term (`0.45 × LEGACY_LICHT × sunHeight`)            |
| (Bäcker-Vereinigung)                    | der Impostor-Atlas backt seit der Vereinigung im r128-STUDIO-Bäcker (`bake-impostor`) — dort gilt die Legacy-Lichtwelt nativ, kein Welt-Bake-Rig mehr |

**Ü2 — FARBE (raw-als-linear):** r128 las Hex-Farben ALS LINEAR — treue Studio-Werte reisen
deshalb als ROHE lineare Zahlen und werden roh=linear gelesen (nie als sRGB-Hex re-interpretiert):

| Anker (anazhRealm.js)       | Anwendung                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_foundryTreeMaterial`      | `colorNode = attribute("color")` — die r128-Vertex-Farben im Reply/Pack sind LINEAR und werden ROH gelesen (kein sRGB-Decode)                     |
| `_foundryBuildGroup`        | `m.mat.color` (Zweit-Kern-Meshes) ist r128-LINEAR → füllt das color-Attribut roh; die kind-Default-Füllfarben sind lineare Literale               |
| `_foundryIngestWorldParams` | die Studio-HEX-Anker (ground/sky) werden EINMAL am Ingest via `THREE.Color` nach linear gewandelt (sRGB-Hex → linear), nie per Hex weitergereicht |

**Regel:** eine NEUE r128-Quelle (weiterer Kern, weiteres Lab) erbt Ü1/Ü2 automatisch, solange
sie durch DIESELBEN Chokepoints fließt (`_foundryBuildGroup`/`_foundryTreeMaterial` für Gestalt,
die Licht-Anwendungen für das Rig) — ein eigener Übersetzungs-Pfad daneben ist die Drift-Klasse.
