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

### B4 — PARAMS (SOLL; ab Domäne `vehicle` MUSS)

Die Regler-Definitionen als DATEN (die HDA-Lehre): ein Array
`PARAMS = [{ id, lab, min, max, step, grp?, law? }]`.

- Der Host (Werkstatt) baut die Regler-UI GENERISCH daraus — kein
  hartkodiertes Slider-Panel pro Domäne. garage.txt trägt dieses Array heute
  schon wörtlich (`SLIDERS`); der Vertrag friert die Feldnamen ein.
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
  (`topSpeedMul/kAcc/kBrake/mass/vmax/spring`), von der Brücke beim Buch-Bau
  aus der EINEN Kern-Formel `exportDrive(P)` (carPhys + FAHR + Federrate)
  gerechnet → `_vehicleProfile` liest DATEN statt zu raten (Abgeleitetes reist
  hier bewusst als Export der SELBEN Formel, nicht als zweite Wahrheit — M3)
  · `gate.tueren` · `creature.gang` (Phase 5).

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
  `.buildInstance`, `.PORTAL_RENDER_CONFIG`, `.PARAMS`, `.LEHREN`,
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
der ε-Beweis, `gate:nervensystem-porta`). `schmiede-core.js` (W-A4a, ε —
GEBAUT 10.07.: B1 21 Gattungen `kind:"weapon"` [Waffen UND Werkzeuge, die
tool:true-Marke reist in fx] · B2 `buildInstance` + `kindStages:{weapon:[0]}` +
Goldens `spec/asset-contract/v5/` (`gate:schmiede-contract`, seed-invariant
cv:5) · B4 PARAMS (PARAMS_BLADE+PARAMS_IMPACT, def aus dem Lab-Startzustand) ·
B5 LEHREN (pass = hieb-Band) + BANDS/`messen`/`evalLehren` · `fx.place
{mode:"hand"}` als Platzierungs-Daten (N5.5, streut nicht) · KEIN fx.wield
(Ω-PHYSIS bleibt der Wield-Richter, N6.6); Split-Parität 21/21 hash-bewiesen,
Andocken = reine Daten-Zeilen — der ε-Beweis, `gate:nervensystem-schmiede`).
