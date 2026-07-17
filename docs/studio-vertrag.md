# DER STUDIO-VERTRAG (Manifest v1) — NORMATIV

**EINE Pipeline für alle Schöpfer-Labore.** Dieses Dokument ist der eingefrorene
Vertrag zwischen einem Studio (einer Vorlagedatei des Schöpfers) und AnazhRealm
(dem Nervensystem). Es beschreibt exakt die Pipeline, die für die Pflanzen
GEBAUT und BEWIESEN ist (V18.411–.419, `gate:nervensystem` 17/17), und hebt sie
zur Norm für jede kommende Domäne: Fahrzeuge · Tore · Bauwerke/Dörfer ·
Kreaturen/Avatare.

**Der Leitsatz (das Ribosom):** das Nervensystem kennt keine Fahrzeuge, keine
Tore, keine Bäume — es kennt den CODE: `kind + rezepte + build + placement +
params + lehren + verhalten`. Eine Maschine, viele Bücher. Wer eine neue Domäne
integriert, schreibt KEINEN neuen Import-Pfad — er erfüllt diesen Vertrag und
dockt an den EINEN an.

Wächter: `npm run gate:studio-vertrag` (`scripts/diag-studio-vertrag.cjs`, im
`check`-Gate) — validiert jeden registrierten Kern GEGEN diesen Vertrag und
beweist sich selbst (injizierte Verletzung → rot).

---

## §1 Die Anatomie eines Studios (deskriptiv)

Jede Vorlagedatei des Schöpfers trägt dieselben fünf Organe — das ist die
gemessene Handschrift aller drei existierenden Vorlagen (phytogenesis v38 ·
garage.txt · Portal.txt):

1. **P-Vektor** — die Regler (Parameter mit Grenzen und Bedeutung).
2. **PRESETS** — benannte Gattungen (eingefrorene P-Punkte + Ausstattung).
3. **LEHREN** — Gesetze mit Toleranzbändern, die das Gebaute BEURTEILEN
   (der sichtbare Richter: da Vinci Δ · Radstand/Länge · Stich→Schub→Dicke).
4. **build(P)** — der deterministische Bau: derselbe Seed ⇒ dasselbe Werk.
5. **VERHALTEN** — die Verben der Domäne (wachsen/Wind · fahren · Türen öffnen).

Der Vertrag macht aus diesen Organen MASCHINENLESBARE Blöcke (§3).

## §2 Das Kern-Gesetz — EINE Quelle, zwei Leser

**G2.1** Die generative Substanz eines Studios lebt in EINER reinen Kern-Datei
(`foundry-core.js`-Klasse: klassisches Skript, Top-Level-Globals, kein
Framework-Zwang im Manifest-Teil). Die Labor-Shell (das begehbare Portal) und
AnazhRealm (der Foundry-Worker) lesen DIESELBE Datei — ein Edit fließt in
beide, ein Nachbau ist verboten (Verfassungs-Gesetz #0, `gate:constitution`).

**G2.2** Die Naht ist das Float32-Attribut: `build` liefert Geometrie als
typisierte Arrays (Positionen/Normalen/Farben/Indizes) — kein Szenegraph, kein
Renderer-Objekt quert die Naht.

**G2.3** Der Kern ist DETERMINISTISCH: alle Zufälligkeit fließt aus dem
`seed`-Argument (mulberry32-Klasse); `Math.random`/`Date.now` sind im Bau-Pfad
verboten (Γ5-Stream-Gesetz der Hauptwelt, hier gespiegelt).

## §3 Die sechs Manifest-Blöcke

Ein Kern erfüllt den Vertrag, wenn er die MUSS-Blöcke trägt; SOLL-Blöcke sind
pro Domäne deklariert (§6-Matrix). Alle Blöcke sind DATEN (JSON-fähig), außer
B2 (die Bau-Funktion).

### B1 — REZEPTE (MUSS)

Ein Top-Level-Objekt `PRESETS`: `{ <rezeptId>: Rezept }`.

- `rezeptId` ∈ `[a-z0-9_-]+` (der Namensraum; die Welt leitet Blueprint-Namen
  daraus ab: `baum_<id>`, `fahrzeug_<id>`, `tor_<id>` …).
- Jedes Rezept trägt **`kind`** (MUSS, string) — der EINE Dispatch-Schlüssel.
  Registrierte kinds v1: `tree · shrub · flower · grass · rock` (gebaut);
  reserviert: `vehicle · gate · building · creature`.
- `s` (SOLL): der Dial-Vektor (P-Punkt des Presets) — Zahlen.
- `fx` (DARF): domänen-eigene Ausstattung (frei, must-ignore §4).

### B2 — BUILD (MUSS)

`buildInstance(rezeptId, seed, lod, ov?)` — die EINE Bau-Funktion.

- Deterministisch (G2.3), LOD-gestuft: **die LOD-Grade sind Studio-eigen**
  (0 fein · 1 mittel · 2 grob/Impostor) — AnazhRealm erfindet keine LODs, es
  RUFT sie.
- Byte-Beweis: die eingefrorenen Vertrags-Fixtures (`spec/asset-contract/`,
  sha256-Goldens, NIE regenerieren) — jede Domäne bekommt ihren Ordner
  (v1 Pflanzen · v2 Kreatur-Haut · v3 Fahrzeuge · v4 Tore …).

### B3 — PLACEMENT (SOLL)

Ein Block `PORTAL_RENDER_CONFIG.placement`: wie oft, wo, wie groß.

- v1-Felder (Pflanzen, gebaut): `scale` (Welt-Skala je Rezept, Zahl > 0),
  `rarity` (Spawn-Dämpfung je Rezept, 0 < r ≤ 1), `treeScaleMul`.
- Domänen erweitern ihn (must-ignore): Fahrzeuge/Bauwerke z. B.
  `sites: "settlement"`, Tore `sites: "shrine"`. Fehlt der Block, ist die
  Domäne „deliberate" (nur Katalog/Werkstatt, kein Worldgen-Streuen).
- **Schichten-Gesetz (USD-Lehre):** Welt-seitige Anpassungen leben ÜBER dem
  Template-Block (eigene Override-Schicht), sie mutieren ihn NIE — die Vorlage
  bleibt byte-heilig; der Live-Read gewinnt gegen jeden Spiegel (der
  Mutation-wins-Beweis, `gate:nervensystem` C).

### B4 — PARAMS_BY_KIND (SOLL; ab Domäne `vehicle` MUSS) · **v1.2: DIE EINE FORM**

Die Regler-Definitionen als DATEN (die HDA-Lehre) — **als MAP je kind**:
`PARAMS_BY_KIND = { <kind>: [{ id, lab, min, max, step, def?, grp?, law? }] }`.

- **v1.2 (SYNERGIE-WELLE, 11.07.2026):** das flache `PARAMS`-Array (kind implizit
  aus dem ersten Rezept des Kerns geraten) ist GEFALLEN — JEDER Kern (auch ein
  Ein-Kind-Kern) exportiert die Map. EIN Export-Dialekt, EINE Brücken-Assembly
  (`__mergeParamsMap`, first-wins je kind), Multi-Kind-Kerne (der Primär-Kern:
  tree/flower/grass/rock) tragen mehrere Einträge. Kein zweiter Dialekt.
- Der Host (Werkstatt) baut die Regler-UI GENERISCH daraus — kein
  hartkodiertes Slider-Panel pro Domäne.
- `law` ist der Ein-Satz-Lehrsatz am Regler (Anzeige, nicht Logik).

### B5 — LEHREN (SOLL)

Der mitreisende Richter: ein Array
`LEHREN = [{ id, lab, pass: [lo, hi], warn: [lo, hi], hint? }]` + eine
Mess-Funktion `messen(P) → { <lehrenId>: wert }`.

- Damit kann AnazhRealm Varianten BEURTEILEN (Score/Validierung in Werkstatt
  und Auto-Registrierung) — dieselbe Richter-Fläche wie Ω-PHYSIS, aber die
  Bänder kommen aus der Vorlage (der Richter ist sichtbar, Anti-Attrappe).

### B6 — VERHALTEN (SOLL)

Die Verben + Daten-Komponenten der Domäne (die ECS-Lehre: `kind` wählt
Komponenten-SÄTZE, keine Klassen):

- `dsl`: die Wörter, die die begehbare Welt versteht (W12-ready-Handshake —
  gebaut für alle fünf Portale).
- Daten-Komponenten je kind, von EXISTIERENDEN Systemen gelesen (kein
  Parallel-System): `vehicle.fahrprofil` — GEBAUT N6 (09.07.): NICHT die rohen
  Regler, sondern die ABGELEITETEN drive-Skalare des Wörterbuchs v1
  (`topSpeedMul/kAcc/kBrake/mass/vmax/spring`, Spiegel-Zensus 17.07. + `cgH`
  [Schwerpunkt-Höhe aus `cgHeightOf`]), von der Brücke beim Buch-Bau
  aus der EINEN Kern-Formel `exportDrive(P)` (carPhys + FAHR + Federrate)
  gerechnet → `_vehicleProfile` liest DATEN statt zu raten (Abgeleitetes reist
  hier bewusst als Export der SELBEN Formel, nicht als zweite Wahrheit — M3).
  Konsum-Stand (Zensus 17.07.): `vmax` = der Ritt-Tempo-Anker (Passthrough
  vollendet — vorher Existenz ohne Konsum), `cgH`+`lenkung.radstand` = der
  Beschleunigungs-Nick (die Host-Näherung Sitz/Halbspanne ist Fallback);
  `mass` bleibt BEWUSSTER must-ignore-Reisender (die Welt fährt ihre eigene
  Größen-Achse `_compoundSizeFactor`)
  · `gate.tueren` · `creature.gang` (Phase 5).
- **`FAHR.lenkung` (V18.483, vehicle-core → exportDrive → fahrprofil.lenkung):**
  die Lenk-Gesetze des fahrzeug-eigenen Ritts als Daten
  (`sfK · maxSteer · gripK · driftGripMul · handDecel · kehrV · radstand`) —
  der Wirt fährt damit FAHRZEUG-EIGEN (W/S entlang der Gier, Grip frisst
  Quer-Slip, Shift = Handbremse); ohne `lenkung` byte-alt richtungs-folgend.
- **`ARENA` (V18.483, schmiede-core, Namensraum-Export):** das Arena-Gefühl
  als Daten (`schwung { dauerProSqrtI min max hand } · gefuehl { freezeMin/Max
  dipMin/Max keRefJ } · bogen { mArrow zugJouleRef auszugSec fovZug fovRuhe
  minAuszugFrac }`) — Leser `AnazhRealm._arenaGesetz()`; Kern kalt →
  `ARENA_FALLBACK` = das byte-alte GEFÜHLLOSE Verhalten (bewusst KEIN
  Zahlen-Zwilling, anders als SCHWIMM). Spiegel-Zensus 17.07. (V18.486+,
  rein additiv): `schwung` trägt auch die Hieb-GEOMETRIE (`windupFrac
  strikeFrac arcHalfRad bladeRadiusM reachBaseM reachMaxM shoulderH`),
  `gefuehl` den Stoß + das Tod-Kippen (`stossCap stossProKb stossSkala
  kippDauerSec kippNachklangSec`), `bogen` den Pfeil-Flug (`maxFlugSec
  radiusM muendungM`), dazu `guete { faktorVoll faktorLeer }` +
  `gueteFaktor(rezeptId, ov?)` — das Lehren-Urteil der Schmiede als
  Schadens-Faktor (Leser `_heldGueteFaktor`, beide Angriffs-Pfade). Diese
  Geometrie-/Stoß-/Flug-Fallbacks SIND Zahlen-Zwillinge der Kern-Werte
  (SWING_/BOGEN_LAWS, byte-alt bei kaltem Kern); nur das GEFÜHL
  (freeze/dip/Auszug/Güte) bleibt bewusst gefühllos im Fallback.
- **`VERHALTEN` (V18.483, tetrapoda-core, Namensraum-Export):** die
  Verhaltens-Seele (`aktionen { <name>: { dauer profil dreh? kopfSweep?
  rollAmp/Rate? hop? tempo? } } · stimmung { <lage>: { aktionen[] alle[min,max] } }`)
  — der Wirt wählt/stempelt FNV-deterministisch, der Baum-Gang trägt den
  Overlay. Jede Stimmungs-Aktion MUSS in `aktionen` existieren (Validator).
  Spiegel-Zensus 17.07. (V18.486+, rein additiv): die KREATUR-SEELE reist —
  `jagd { radius speedBoost strikeRange strikeCooldownSec damageMul
  fearHpFrac triumphWindowSec scentRangeM scentProbeM }` · `furcht`
  (Wariness-Gewichte + Flucht-Radien/-Dauern) · `temperament { signaturen
  floor profile }` (Resonanz-Signaturen + Gegenwehr-Profile) · `wandern`
  (Leine/Schlendern/Emotions-Modulation). Leser
  `AnazhRealm._verhaltenGesetz()` (memoisiert, fail-soft); die
  Stamm-Blöcke `CREATURE_HUNT/CREATURE_NATURE/TEMPERAMENT_*/
  CREATURE_CHARAKTER` sind der Zahlen-Zwilling als Fallback — die
  KREATUR-SEELEN-PARITÄTS-WAND im Validator erzwingt die Gleichheit.
  Die Gegenwehr-Reichweite liest `jagd.strikeRange` (die EINE
  Reichweiten-Wahrheit; das nackte Stamm-`4` fiel bewusst auf 2.4).

## §4 Die Empfänger-Gesetze (Taille-Erbe)

Diese vier gelten für JEDEN Leser des Manifests (AnazhRealm heute, P2P-geteilte
Studios morgen) — sie sind die `docs/taille-spec.md`-Gesetze, auf Assets
angewandt:

- **G4.1 must-ignore:** unbekannte Felder und unbekannte `kind`-Werte werden
  IGNORIERT, nie zerstört und nie als Fehler behandelt (ein altes AnazhRealm
  überlebt ein neues Studio; `_foundryAutoRegisterSpecies` registriert heute
  nur bekannte kinds — genau diese Form).
- **G4.2 fail-closed:** ein Rezept, das einen MUSS-Block verletzt (kein `kind`,
  ungültige id), wird NICHT registriert und LAUT geloggt — nie halb-registriert.
- **G4.3 EINE Versions-Semantik:** der Kern deklariert `STUDIO_VERTRAG = 1`
  (Top-Level-Konstante). Erhöht wird nur bei einem Bruch der MUSS-Blöcke;
  SOLL/DARF wachsen unter v1 (must-ignore trägt sie).
- **G4.4 kein Spiegel:** Leser lesen die angekommenen Daten LIVE (Referenz),
  kein Hardcode-Duplikat in der Welt — bewiesen durch den Mutation-wins-Test.

## §4b Die Laufzeit-Übersetzung (r128-Studio → r184-Welt) — NORMATIV

Die Studios sind in Three.js r128 (Legacy) verfasst; die Hauptwelt rendert
r184 (physisch, farb-verwaltet). Wo AnazhRealm Studio-INHALT selbst rendert
(nicht das Portal — dort läuft das Original), gelten DREI dokumentierte
Übersetzungs-Regeln (three.js-Migrationspfad, KEINE Tuning-Knöpfe):

- **Ü1 — LICHT-INTENSITÄTEN × π** (r155, useLegacyLights→physisch: Legacy
  hatte keine 1/π-BRDF-Normierung). Jeder aus einem Studio übernommene
  Licht-Intensitätswert wird mit `AnazhRealm.LEGACY_LICHT` (= Math.PI)
  multipliziert. Gilt für JEDE Domäne (Wald-Rig heute; Fahrzeug-Scheinwerfer/
  Emissive morgen).
- **Ü2 — AUTOREN-FARBEN RAW-ALS-LINEAR.** r128 las Hex ohne Eingangs-
  Konvertierung; die treue Übersetzung setzt Studio-Farbwerte per
  `setRGB(raw)` (linear), NIE per `setHex` (das sRGB→linear wandeln und
  dunkler zeigen würde als die Vorlage). Vertex-Farb-ATTRIBUTE reisen roh
  und sind automatisch korrekt (beide Renderer lesen Attribute linear).
- **Ü3 — GESETZE STATT WERTE, wo das Studio ein Gesetz hat.** Trägt die
  Vorlage eine Formel (atmosphere(e) · Nebel-skyB · Rahmen), liest die Welt
  die FORMEL aus der geteilten Quelle (phyto-core/foundry-core), nicht
  einen Wert-Snapshot.

**Chokepoint-Pflicht:** eine neue Domäne wendet Ü1/Ü2 am IMPORT an (der
kind-Handler bzw. die Ingest-Funktion), nicht verstreut an Anwendungs-
Stellen — ein Wert quert die Naht GENAU EINMAL und ist danach r184-nativ.

## §5 Die Andock-Sequenz (wie eine neue Domäne andockt)

Fünf Schritte, immer dieselben — das ist „die gleiche Pipeline für alles":

1. **Kern-Split:** die generative Substanz der Vorlage wandert in
   `<domäne>-core.js` (G2.1); die Labor-Shell liest den Kern (Beweis:
   `diag:foundry-parity`-Klasse, byte-identisch vor/nach Split).
2. **Manifest:** der Kern trägt B1+B2 (+ deklarierte SOLL-Blöcke) +
   `STUDIO_VERTRAG = 1`.
3. **Andocken:** der EINE Foundry-Worker lädt den Kern zusätzlich
   (`importScripts`), die Rezepte fließen in das EINE Buch (`f.recipes`,
   kind-getaggt); die Brücken (`get-recipes`/`get-render-config`/`get-params`)
   exportieren die Blöcke.
4. **kind-Handler:** der EINE Auto-Register-Chokepoint bekommt den Zweig für
   den neuen kind (Blueprint-Namensraum + Komponenten-Anschluss an
   existierende Systeme) — kein zweiter Register-Pfad.
5. **Wächter:** ein `gate:nervensystem-<domäne>` (synthetisches Rezept
   injizieren → Auto-Blueprint → platziert/angeschlossen, ohne eine Zeile
   AnazhRealm-Edit) + eingefrorene Vertrags-Fixtures (`spec/asset-contract/
   v<n>/`) + dieser Validator (`gate:studio-vertrag` prüft den neuen Kern
   automatisch mit).

## §6 Konformanz-Matrix (Stand 08.07.2026)

| Block | Pflanzen (foundry-core) | Fahrzeuge (Phase 1) | Tore (Phase 2, ✅ 09.07.) |
| ----- | ----------------------- | ------------------- | -------------- |
| B1 REZEPTE | ✅ 15 Rezepte, 5 kinds | vehicle-core: PRESETS+CULTURES | ✅ porta-core: 7 Ordnungen `kind:"gate"` |
| B2 BUILD | ✅ buildInstance, LOD 0/1/2, Goldens v1 | buildVehicle → v3-Goldens | ✅ buildInstance → v4-Goldens (`gate:porta-contract`) |
| B3 PLACEMENT | ✅ scale/rarity/treeScaleMul | deliberate (Katalog), später settlement | ✅ als Rezept-Daten: `fx.place {mode:"site", siteTag:"tor"}` (N5.6 — streut heute nicht) |
| B4 PARAMS | ⏳ Dials leben in der Shell (benannte Schuld) | MUSS (SLIDERS existiert als Daten) | ✅ PARAMS aus SLIDERS abgeleitet (eine Quelle) |
| B5 LEHREN | ⏳ in der Shell | SOLL (Lehren-Tafel existiert als Daten) | ⏳ `messen` (Stich→Schub→Dicke) ✅, pass/warn-Bänder trägt das Lab nicht |
| B6 VERHALTEN | ✅ dsl (W12) | dsl ✅ + fahrprofil ✅ (N6, 09.07.: Brücke rechnet `exportDrive` beim Buch-Bau, `gate:vehicle-drive`) | dsl ✅ + tueren (Shell E/R; Host-`portal` = benannter Folge-Anschluss) |
| STUDIO_VERTRAG | wird mit diesem Vertrag gesetzt | ab Split | ✅ = 1 (`__portaCore`) |

**Benannte Schulden (kein Verstecken):** die Pflanzen-Dials/Lehren leben noch
in der phytogenesis-Shell statt als B4/B5-Datenblöcke — sie wandern bei der
nächsten Pflanzen-Welle in den Kern; die 5 Basis-Arten-Nischenformeln sind
noch Code statt Daten (V18.419-Restliste).

---

## §7 v1.1 — Die Namensraum-Regel für Zweit-Kerne (NORMATIV, Entscheid E-A, 09.07.2026)

Die wörtliche v1-Form (§2 G2.1: „Top-Level-Globals") ist an foundry-core.js
EINGEFROREN und trägt genau EINEN Kern pro Laufzeit — jeder weitere Kern im
selben Worker/Portal kollidierte an den const-Symbolen (`STUDIO_VERTRAG` ·
`PORTAL_RENDER_CONFIG` · `PRESETS`, foundry-core.js:94/96/2248). v1.1 normt
die Adressierung für alle kommenden Domänen, OHNE einen Block zu ändern:

- **N7.1 — Der ERSTE Kern einer Laufzeit bleibt Top-Level** (foundry-core,
  byte-heilig; ein Merge/Refactor dort nur unter Byte-Beweis — nie für einen
  Zweit-Kern).
- **N7.2 — Jeder WEITERE Kern ist eine namespaced IIFE:**
  `(function(root){ root.__<domäne>Core = { … } })(typeof self!=="undefined"?self:globalThis)`
  — erster Bau: `vehicle-core.js` → `__vehicleCore`. Die Manifest-Blöcke leben
  UNTER dem Namensraum, **namens- und formgleich** zu §3 (`__vehicleCore.PRESETS`,
  `.buildInstance`, `.PORTAL_RENDER_CONFIG`, `.PARAMS_BY_KIND` (v1.2), `.LEHREN`,
  `.STUDIO_VERTRAG`). Kein Block ändert seine Gestalt — nur seine Adresse.
- **N7.3 — Der Validator mappt pro Kern:** der CORES-Eintrag trägt `ns`
  (`diag-studio-vertrag.cjs`), die Prüfungen selbst sind identisch. Ein
  Namensraum-Kern ohne seinen Namensraum wird rot (B1/B2/G4.3 lesen null).
- **N7.4 — Die Versions-Konstante bleibt `STUDIO_VERTRAG = 1`:** v1.1 ist eine
  Adressierungs-Norm, kein Bruch eines MUSS-Block-INHALTS (G4.3). Ein
  Empfänger, der nur v1 kennt, liest Zweit-Kerne schlicht nicht (must-ignore
  G4.1) — nichts bricht.

**N7.5 — Der Empfänger-Merge disjunkter kind-Blöcke (NORM für W7b und alle
Folge-Domänen):** liest ein Wirt mehrere Kerne, mergt er ihre
`PORTAL_RENDER_CONFIG.lod.kindStages`-Blöcke am EINEN Ingest-Chokepoint
(AnazhRealm: `_foundryIngestRenderConfig`) — kind-weise disjunkt (jede Domäne
deklariert nur ihre eigenen kinds; ein Kern ÜBERSCHREIBT nie den Block eines
anderen), must-ignore-fest für unbekannte Felder, und **fail-closed: ein kind
ohne kindStages-Eintrag gilt als `[0]`** (nur die feine Stufe — der Wirt gradet
konstruktiv L1=L0/L2=Auto-Impostor, statt Stufen zu erfinden, die der Kern
nicht trägt). Kein zweiter Ingest-Pfad; die Mutation-wins-Probe (G4.4) gilt
je Kern.

**Stand der Zweit-Kerne:** `vehicle-core.js` (Phase 1, W7a — B1 5 Gattungen
`kind:"vehicle"` · B2 `buildInstance` + `kindStages:{vehicle:[0]}` + Goldens
`spec/asset-contract/v3/` (`gate:vehicle-contract`) · B4 PARAMS · B5
LEHREN+`messen` · CULTURES als Daten; Shell-Verhaltens-Parität beim Split
hash-bewiesen). `porta-core.js` (Phase 2, ε — GEBAUT 09.07.: B1 7 Ordnungen
`kind:"gate"` · B2 `buildInstance` + `kindStages:{gate:[0]}` + Goldens
`spec/asset-contract/v4/` (`gate:porta-contract`, seed-invariant cv:4) ·
B4 PARAMS (aus SLIDERS abgeleitet) · B5 als `messen`-Formel (Stich→Schub→Dicke;
pass/warn-Bänder trägt das Lab nicht — benannte Schuld) · B6 dsl (W12) +
`fx.place {mode:"site", siteTag:"tor"}` als Platzierungs-Daten (N5.6);
Split-Parität 14/14 hash-bewiesen, Andocken = reine Daten-Zeilen —
der ε-Beweis, `gate:nervensystem-porta`). Spiegel-Zensus 17.07. (V18.486+,
rein additiv): **`TUER_GESETZ { offen }`** = der Flügel-Öffnungswinkel (rad)
— Shell (`DOOR_OPEN`) UND Wirt (`AnazhRealm._tuerOffenRad()`, Fallback
`TOR_FLUEGEL_OFFEN`) lesen die EINE Quelle (der 1.95-Zahlen-Zwilling ist
geschlossen). `schmiede-core.js` (W-A4a, ε —
GEBAUT 10.07.: B1 21 Gattungen `kind:"weapon"` [Waffen UND Werkzeuge, die
tool:true-Marke reist in fx] · B2 `buildInstance` + `kindStages:{weapon:[0]}` +
Goldens `spec/asset-contract/v5/` (`gate:schmiede-contract`, seed-invariant
cv:5) · B4 PARAMS (PARAMS_BLADE+PARAMS_IMPACT, def aus dem Lab-Startzustand) ·
B5 LEHREN (pass = hieb-Band) + BANDS/`messen`/`evalLehren` · `fx.place
{mode:"hand"}` als Platzierungs-Daten (N5.5, streut nicht) · KEIN fx.wield
(Ω-PHYSIS bleibt der Wield-Richter, N6.6); Split-Parität 21/21 hash-bewiesen,
Andocken = reine Daten-Zeilen — der ε-Beweis, `gate:nervensystem-schmiede`).
`fachwerk-core.js` (W-A5a, ε — GEBAUT 10.07.: B1 32 Kultur-Archetypen
`kind:"haus"` [die klickbaren Haus-Typen des Fachwerk-Labs; `s` eingefroren am
Lab-Startzustand kulturParams(name, 3), Strings/Farben reisen in fx] · B2
`buildInstance` + **`kindStages:{haus:[0,1,2]}` — die erste Mehr-Stufen-Domäne
außerhalb der Bäume** (0 ≙ Ring-A-Vollbau-Bake · 1 ≙ Chunk-Stufe-1-Hülle ·
2 ≙ Chunk-Stufe-2-Destillat; Editor-live + Vogel bleiben Lab/Dorf → W-A5b) +
Goldens `spec/asset-contract/v6/` (`gate:fachwerk-contract`, **seed-GETRIEBEN**
cv:6 — der Haus-Bau würfelt Fenstertakt/OG-Material/Giebel-Verband/Gauben/
Fenster-Schlaf aus P.seed) · B4 PARAMS (21 Regler aus den Lab-HTML-Slidern,
def = Lab-Startzustand) · `fx.place {mode:"settlement", siteTag:"haus"}` als
Platzierungs-Daten (N5.7, W-A5b: exportSettlement [die DORF-QUELLE lebt im
Kern] → `spawnSettlement` — der deliberate Kanal; Worldgen streut nicht);
Split-Parität je Rezept × Stufe hash-bewiesen (buildInstance == die Shell-
Komposition der Kern-Primitive), Andocken = reine Daten-Zeilen — der
ε-Beweis, `gate:nervensystem-fachwerk`). Spiegel-Zensus 17.07. (V18.486+,
rein additiv): **`SIEDLUNG`** = das Siedlungs-Existenz-Gesetz (`cellM rarity
nHMin nHSpan slopeMax fundamentMaxDh` — WO/WIEVIEL/WIE STEIL Dörfer die Welt
trägt; Präzedenzfall Wald-Dichte in phyto-core). Es reist im Buch-Umschlag
(`get-book`-Reply, Feld `siedlung`, M8-generisch: der erste Kern mit
SIEDLUNG); der Wirt liest `AnazhRealm._siedlungGesetz()` (Ingest validiert
ganz-oder-gar-nicht, Fallback = byte-gleiches `AUTO_SETTLEMENT`). Die
Streaming-Regler (nearM/perTick/spawnClearM/siteProbeR/startRadiusM) bleiben
ehrlich Wirts-Infrastruktur.

---

## §8 v1.1 — Nicht-geometrische Domänen: MESHFREI + die Komponenten-Felder `motion` und `klang` (NORMATIV, W-A6/W-A7, 10.07.2026)

Die zwei im Labs-Fahrplan benannten v1.1-Erweiterungen sind KOMPONENTEN-Felder,
keine Verben (Nervensystem-Entscheidungsbaum: „Komponente erweitern, nicht Verb
erfinden"). Sie reisen je Rezept in `fx` durch das EINE Buch (`__replyRecipes`)
— must-ignore-billig per Design (ein v1-Leser ignoriert sie schlicht).

- **§8.1 MESHFREI (components-only-Kerne):** eine NICHT-GEOMETRISCHE Domäne
  (Klang; Körper-/Kreatur-GESTALT-Daten — der Host bleibt der OFEN) deklariert
  auf ihrem Namensraum `MESHFREI = 1`. Dann ist **B2 N/A** (kein
  `buildInstance` — der Kern liefert DATEN, keine Gestalt); ein MESHFREI-Kern,
  der trotzdem `buildInstance` trägt, ist eine Vertrags-Verletzung
  (Widerspruch, der Validator wird rot). Strukturell gedeckt: der
  build-asset-Dispatch der Brücke wählt Zweit-Kerne NUR mit
  `typeof buildInstance === "function"` — ODER, seit §8.4, über den
  Gattungs-Bäcker-Tisch der Pipe. Alle übrigen Blöcke (B1 REZEPTE
  MUSS · B4 PARAMS SOLL · G4.3 STUDIO_VERTRAG) gelten unverändert.
- **§8.4 v1.2 — DER GATTUNGS-BÄCKER (DIE EINE PIPE, V18.458, NORMATIV):** ein
  MESHFREI-Kern bleibt THREE-frei — seine GESTALT bäckt die PIPE: foundry-core
  trägt den Tisch `BAKERS_BY_KIND` (`{ kreatur: bakeTierInstance }`, M8:
  Tabelle vor if). Der build-asset-Dispatch der Brücke wählt einen Zweit-Kern
  auch DANN, wenn er kein `buildInstance` trägt, aber
  `BAKERS_BY_KIND[preset.kind]` eine Formel hat — der Bäcker erhält den KERN
  als Argument (`bakeTierInstance(kern, presetId, seed, lod, ov)`) und
  konsumiert dessen GESETZE (bauTier · deriveTierParams ·
  TIER_MATERIAL_KLASSEN). Der Reply ist der NORMALE Asset-Umschlag; additiv
  (must-ignore) reisen: `mesh.joint` (das animierte Gelenk des Meshes),
  `mat.emissive`/`mat.emissiveIntensity` (nur wenn nicht-schwarz) und EIN
  Pseudo-Eintrag `{ kind: "__skelett", skelett: { joints, tailSegs, masse } }`
  (Leser ohne position-Guard überspringen ihn; IDB trägt ihn gratis).
  DERSELBE Bäcker läuft im Worker UND auf dem Host-Main-Thread (foundry-core
  ist auf beiden geladen) — ein Gesetz, zwei Scheduler; der Host assembliert
  NUR (Gelenk-Gruppen aus dem Skelett + die EINE Reply-Konversion) und
  klont je Instanz aus dem Art-Memo. LOOK-GESETZE (V18.460/.461): trägt der
  Kern Zeilen-Tabellen (`fellStreu(P,M,T)` · `kleidZonen(d)` · `haarStreu(d)`),
  KONSUMIERT der Bäcker sie (Streu/Hüllen deterministisch, Verlauf als
  Vertex-Farben) — das Gesetz sagt WAS (Teile · Farben · Verteilung), die
  Deck-TECHNIK ist Leser-Sache (das Lab behält seine Builder, Benchmark
  unbewegt). Fehlt die Tabelle, bäckt der Bäcker kahl (DARF, fail-soft).
  WELT-LOOK-GESETZE (V18.462, dasselbe Muster eine Ebene höher): der Himmel
  (`HIMMEL_GESETZ`) und die Wasser-Oberfläche (`WASSER_GESETZ`) wohnen als
  Zahlen-Tabellen in foundry-core — das Studio-GLSL INJIZIERT sie in seinen
  Shader-Text (semantischer Beweis: alt==neu), der Welt-Renderer (TSL) LIEST
  dieselben Tabellen. Editiert der Schöpfer die Tabelle, folgen BEIDE Leser.
- **§8.2 `fx.motion` (Bewegungs-Daten, W-A6):** Gang-/Emotions-Profile als
  reine Daten. Schema (alle Felder DARF, must-ignore):
  `motion { presets: { <name>: { <achse>: zahl … } }, cpgCoupling?: zahl[][],
  standPose?: zahl[][] }` — die Achsen sind Lab-eigene Regler (freq · stride ·
  tension · kpMul · Gelenk-Ziele …); der Host interpretiert sie NIE als
  zweites Animations-System (M4): der EINE Konsument ist der bestehende
  `_animateCompoundMotion`-/Rig-Bogen (wahrerguss Säule II — der Andock-Punkt
  ist benannt, der Konsum der bewusste Folge-Schritt). Spender heute:
  `koerper-core.js` (`mensch`, 10 Profile) · `tetrapoda-core.js`
  (wolf/fox/bear/deer, 6 Profile + CPG + Stand-Pose).
- **§8.2+ `fx.bewegung` (Bewegungs-GESETZE des Körpers, V18.483/485):** die
  Verben des Ninja-Parks + das Wasser als reine Daten, Leser sind die EINEN
  Gesetz-Funktionen des Wirts (memoisiert, fail-soft):
  `bewegung { speed { base leicht mag } · jumpPower { base leicht mag } ·
  stamina { base traeger mag } · schwimmen { tauchV aufV lerp hubK tiefeK
  hubCap tiefeCap drag taktZug taktTreten lean { zug treten } pose { kopf
  armZug armTreten armAb armSpreiz beinZug beinTreten beinTakt }
  ausdauerProS } · parkour { doppelspruenge doppelsprungMul wandsprungMul
  wandAbstoss kletterV kletterAusdauerProS slideTempoMul slideDauerSec
  slideMinTempo kontaktFrischeSec slidePose { lehne beinVor knieKnick
  armStuetz armFrei kopf } } · luft { kAcc kAccLuft kBrake kBrakeLuft } ·
  sprung { coyoteSec bufferSec } · schritt { kalib } · aktionAusdauer }`.
  Spiegel-Zensus 17.07. (V18.486+, rein additiv): `luft` = die vier
  C5-Boden-/Luft-Hebel der Beschleunigungs-/Brems-Kurven, `sprung` =
  Coyote-/Jump-Buffer-Fenster, `schritt.kalib` = der Gang-Kalibrierfaktor,
  `aktionAusdauer` = die Kosten der Maus-Arm-Aktion (Hieb/Abbau),
  `parkour.kontaktFrischeSec` = das EINE Wandkontakt-Fenster (war der
  divergente Stamm-Zwilling 0.18/0.15). Leser `AnazhRealm._bewegungsBlock`
  (block-weise, ganz-oder-gar-nicht) + `_aktionAusdauer`, fail-soft
  byte-gleich. SCHWIMM-PARITÄT ist Vertrag: der Stamm-Fallback
  (`SCHWIMM_FALLBACK`) MUSS zahlen-gleich zum Kern sein (Validator-Wand);
  `parkour` hat BEWUSST keinen Fallback (Kern kalt → kein Parkour).
- **§8.3 `fx.klang` (Musik-Daten, W-A7):** ein Genre als reine Daten. Schema
  (bpm MUSS im Feld, Rest DARF): `klang { bpm, scaleName?, scale?: halbton[],
  dna?: { swing darkness color flow tension space }, form? harmony? rhythm?
  bass? melody?, inst?, tilt? }`. Die Skala ist VOR-ABGELEITET aus der EINEN
  Lab-Formel (`scaleFor(darkness)`, das exportDrive-Muster N6.2/M3 — Export
  der SELBEN Formel, keine zweite Wahrheit). Der EINE Host-Konsument ist das
  BESTEHENDE Lofi-System (kein Parallel-Audio, M4): `_klangStudioPreset()`
  liest das Rezept der DATEN-Zeile `AnazhRealm.KLANG_HOST_RECIPE` („lofi"),
  `_lofiChordDurationMs` fährt das Studio-Tempo, `_grooveSwing()` den
  Genre-Shuffle (Spiegel-Zensus 17.07.: `dna.swing` — die Doppel-Quelle
  GROOVE_SWING 0.58 vs Rezept 0.50 ist geschlossen, das Genre führt);
  kaltes Buch → die LOFI_*-/GROOVE_SWING-Konstanten byte-alt (fail-soft,
  G4.1). Spender heute: `klang-core.js` (22 Genesis-Genres, `kind:"klang"`).
- **§8.5 v1.2 — DIE OFEN-STUFEN-ZEILE (V18.478, NORMATIV, rein additiv):** ein
  MESHFREI-Kern mit Pipe-Bäcker (§8.4) DARF `PORTAL_RENDER_CONFIG.lod.
  kindStages` auf seinem Namensraum tragen. Die Zeile deklariert die
  LOD-STUFEN, die der GATTUNGS-BÄCKER seiner Gestalt bäckt (dieselbe Form wie
  B2-kindStages: nicht-leer, strikt aufsteigend, 0..2 — derselbe Validator);
  B2 bleibt N/A (kein buildInstance). Die Brücke sammelt sie GENERISCH wie
  jede Zweit-Kern-Zeile (`cfg.lod.zusatzKindStages`, W7b/N2), der Host mergt
  am EINEN Ingest-Chokepoint. Sie ist die VERTRAGS-Wahrheit der bereits
  gebauten Ofen-Leiter — der Wächter ist `gate:konsum-matrix` (Stufen müssen
  EHRLICH verschieden backen, sonst TEIL) + die Fern-Linsen (`gate:tier-fern`
  · `gate:kreatur-kosten`). Ohne die Zeile gilt fail-closed `[0]` (N7.5,
  unverändert). Spender heute: `tetrapoda-core.js` (`kreatur:[0,1]` — bauTier
  Gelenk-Baum/Fern-Standbild) · `koerper-core.js` (`koerper:[0,1]` —
  bakeMenschInstance fein/Fern-Guss).

**Stand der MESHFREI-Kerne:** `klang-core.js` (`__klangCore` — B1 22 Genres ·
B4 bpm+6 DNA-Dials · fx.klang) · `koerper-core.js` (`__koerperCore` — B1
`mensch` · B4 8 Morph-Dials · fx.gestalt + fx.motion + **fx.bewegung**
[schwimmen · parkour · slidePose · speed/jump/stamina, §8.2+]) ·
`tetrapoda-core.js` (`__tetrapodaCore` — B1 4 Gattungen · B4 5 allometrische
Dials · fx.motion + **VERHALTEN** [12 Aktionen · 6 Stimmungen, B6]).
Alle drei: keine KIND_POLICY-Zeile (keine Katalog-Blueprints — die Rezepte
erscheinen als Studio-Rezepte in der Werkstatt, W-A1-Straße), `fx.place
{mode:"none"}`, Daten-Goldens `spec/asset-contract/v7/` (`gate:daten-contract`).
