# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der Entscheidungs-Kompass.** Vier Fragen vor dem nächsten Schritt: **Wohin?** (§0) · **Wurde das schon
> probiert?** (§2 Narben) · **Existiert das schon?** (§3 Teilsysteme) · **Schneide ich einen
> Samen?** (§4 Samen). Was offen ist, trägt allein `docs/PFLICHT-OFFEN.md` — dieser Kompass führt keine eigene
> Offen-Liste. Alles Erledigte lebt in der git-Historie (`git log` = die Chronik; die gefallenen Plan-Docs sind dort
> durchsuchbar: `git log --all --oneline -- docs/`).

## §0 · Die Ziellinie

### §0.v1 · Die v1.0-Ziellinie (gesetzt 30.09.2026)

v1.0 ist EIN gespielter Pfad, kein Feature-Katalog:

1. **Ankommen** — Boot bis Kontrolle ≤ 5 s, kein Fall, kein Freeze.
2. **Laufen + sehen** — die Welt trägt Wiese · Wald · Wasser · Ferne.
3. **Bauen** — in der Werkstatt einen Bauplan wählen/formen und platzieren (≤ 3 Klicks).
4. **Mit der KI erschaffen** — ein Satz wird über den Rezept-Katalog zu Foundry-Assets in der
   Welt. GEBAUT (V18.493: `spawn_studio` · `near_water` · Prompt mit den LIVE-Wörtern · Satz
   ohne Schlüssel; Band `checkBandV18493CoSchoepferStudio`); den Lauf mit echtem Schlüssel prüft
   Drehbuch-Schritt 18 (`docs/abnahme-drehbuch.md`).
5. **Benutzen / teilen** — betreten · fahren · halten · als Bauplan teilen.

**Der FPS-Boden:** p95 ≤ 33 ms in der Standard-Szene auf JEDEM Standardgerät — der Richter ist das
PROFI-BAND (60 fps · 208 DRW · ~680k TRI · 118 MB VRAM), nicht ein einzelner Rechner (Schöpfer-Wort 02.10.:
„richter ist nicht mein rechner … die werte sind bekannt"); gemessen hardware-unabhängig (`werkbank zaehlen` ·
`takt` · `fluss`) und mit dem Flugschreiber-Export (`anazhRealmPerf.json`). Der Richter-Befehl ist `werkbank band`:
jeder Befehl, jedes Dreieck, jedes MB beim Täter-Namen gegen den Haushalt und die Ratsche (`spec/profiband/`, Wand
`gate:profiband`; die volle Welt eingeschwungen, das Band ROT, solange ein Ist darüber liegt; die Ratsche ist die Hülle
einer Serie der echten GPU — `werkbank ratsche` —, eine Klasse darf nur fallen). **Feature-Stopp bis v1.0** — nur, was einen der fünf
Schritte oder den FPS-Boden trägt.

### §0.offen · Was offen ist

Die EINE Offen-Wahrheit ist `docs/PFLICHT-OFFEN.md` (Einträge setzt nur der Schöpfer, je Eintrag Status und Kriterium; der
Spiegel steht im Stand von `CLAUDE.md`). Eine Probe sinkt nur mit Konsum-Urteil, nie blind (die typeof-Ratsche in
`gate:apparat`).

## §1 · Das Fischer-Prinzip (über allem — „Regel #0" GESTRICHEN V18.356)

Ich MESSE (Gate · Diag · hardware-unabhängiger Proxy · `gpu-bank` auf echter GPU), ich SEHE (Beweisbilder aus dem Ausgabe-Pfad;
Bild-Urteile auf echter Hardware, swiftshader verbirgt Präzisionsfehler — CLAUDE.md Lehre 17), ich URTEILE, ich LIEFERE — das Neue
wird DER Pfad (default-an), kein Hedge. Der Schöpfer wertet das ERGEBNIS und setzt Scope und Ship; er ist kein Merge-Tor für Pixel
(BETRIEBSGESETZ 4) und NIE die Ausrede, etwas halb/AUS zu lassen. MECHANIK braucht eine ZAHL, LOOK braucht ein BILD (eine
headless-Zahl als Look-Beweis kann lügen).

## §2 · Die Narben — probiert & VERWORFEN (nicht wiederholen)

> Die Meta-Narbe: 30 Wellen drehten am Render-Mesh, während die Wurzel (kein Fluid) unberührt
> blieb — pixel-blind tweaken statt die Wurzel benennen ist die Spirale selbst.

- **Wasser:** Fläche auf Zell-Maske klippen → Sägezahn (Uferlinie gehört in den Tiefenpuffer,
  nie in die Geometrie) · flacher Fluss-Querschnitt ZWEIMAL gebaut, ZWEIMAL revertiert — nicht
  ein drittes Mal · Fluss-Anheben → Bank-Sägezahn · Auslauf-Regler/Dichte-skirt → Pflaster ·
  Boundary-Face-Mesh statt Surface-Nets → flach/gappy; der Render ist ein Oberflächen-SHEET,
  kein geteilter Volumen-Mesher · 3D-GPU-Fluid-Sim = falsches Werkzeug (der Weg ist ein CA).
- **GPU/Render:** GPU-Density-WGSL → geschnitten (Roundtrip teurer als Worker-CPU; KEIN
  GPU-Compute-Rewrite der load-bearing Pipeline) · Cel/Schatten für WebGPU opfern → Rollback ·
  Geometrie-eps gegen Trapeze → falscher Hebel (Wurzel war die Facetten-Lichtung, `normalNode`) ·
  „GPU-driven-Culling-Gigant" zur Wand geprobt (Juni): verworfen; der gezielte Hebel (Feld-Cull
  V18.488: Compute-Kompaktierung + indirekte Draws für die @s:-Fernstufen der Streu) fiel 05.10.
  mit seinem Ziel — die Fernstufe ist seit dem EINEN Atlas eine Karte; gemessen griff er nur noch
  beim Wandern an Geröll-L0 und verwarf dort vor allem freie Slots, im Hauptbild allein, für die
  Band-Linse unsichtbar (indirekter Draw). Die Narbe: kein GPU-Cull für Familien unter ~100 Instanzen.
- **Hydro/Spawn:** Submarine-Biom-Dämpfung → Symptom-Pflaster · Perzentil-waterLevel-Magie →
  Sample-Region ≪ Wellenlänge · Architektur-Optik-Aufwertung entfesselte die Material-Resonanz
  (Optik-Anreicherung MUSS tag-neutral sein, 4 Achsen vorher/nachher messen).
- **Off-Thread:** `_buildArchMeshMerged` off-thread GEMESSEN VERWORFEN (3–4 ms, schon gecacht);
  schwere RECHNUNG an einer echten Grenze trennen JA — den Stamm in gekoppelte Module zerteilen NEIN
  (die 2025-Falle; die Zonen-Dateien unter `stamm/` tragen EINE Klasse). Transvoxel = falsches Werkzeug für Streaming (Nachbar-LOD-Rebuild-Churn);
  cross-LOD-Normalen für-nichts (Shading liest `up+bump`) — vor Naht-Arbeit dieses Urteil zuerst.

## §3 · Die Teilsysteme — was EXISTIERT (nicht parallel bauen)

- **Welt-Substanz:** Terrain-Density (`_terrainBaseDensityAt`, main+Worker bit-identisch) ·
  Hydrosphäre (`_computeHydrosphere`, frozen) · Wasser-Pipeline (CA `waterCells` → Sheet →
  Shader; Fern-Wasser-Atlas) · Voxel-Streaming (`_tickVoxelChunkStreaming`, Ring+LOD+BVH+Worker).
- **Lebendiges:** das Feld (`auraAt` lesen · `_deposit*` schreiben · δ werten) · Emotion-Kern ·
  Kreaturen (bauTier-Baum + CPG-Gang + Fern-Guss) · der Nexus (Gesten `dsl.history` + Gesetze
  `worldRules`; `_crystallizeGestureRule` live) · DSL/Weltregeln (`dslRun`-Sandbox).
- **Schöpfung:** Crafting-Resonanz (`_blueprintProductVector`) · Werkstatt (`_makeCostGate` +
  `fertigeBlueprint`) · Hylomorphismus (`FORM_TAG_ACTIVATION`, frozen Signaturen — emergent-
  korrekt, kein Ad-hoc-Tuning) · Totholz ist Studio (liegend die Nah-Streu, stehend der Labor-Wald; die Welt
  hat keinen Erzeuger für stehendes Totholz, kein Alias kehrt zurück) · die EINE Pipe (Foundry `build-asset` für ALLE Gattungen) · ihr Transport
  (`_foundrySchale` IM Worker: Platte · Konsum-Wand `FOUNDRY_LESEN` · Uint16-Index · Transfer — der Haupt-
  Thread fasst keinen Asset-Cache an, `gate:fluss`) · ihre Schlange (`_foundryAuftrag`: der Host hält sie, 12 je
  Studio-Faden, nah zuerst, ab 6 s Alter abwechselnd der Älteste — `gate:takt` T5/T6; die Karte bäckt im eigenen
  Bäcker-Faden `_foundryBaecker`, nie zwischen den Körpern — T7).
- **Render:** PBR (`_buildToonNodeMaterial` — Name ist Umbenennungs-Schuld, baut IMMER PBR) ·
  Frequenzband (`_applySubstanceResponse`) · Schatten (2 CSM-Kaskaden; jede LOD-Maske misst vom Auge
  `uLodAuge` zum Ursprung der Instanz wie das Studio (`_iw`, nie zum Fragment — 1110-11), ein L0-Baum wirft seine L1 —
  `gate:foundry-crossfade`) · LOD-Kaskade (`DETAIL_CASCADE`) ·
  Vegetation (Gras-HISM + Scatter + Impostor-Bäckerei + die Nah-Streu: die Studio-Bodenarten im Kachel-Ring
  um die Kamera, gesetzt nach dem Boden-Gesetz `placement.boden` / `bodenGewicht`).
- **Welt/Sozial:** Portal/Sub-Welten · Vibe-Pass (ed25519) · Bibliothek/Feed · Mesh (signaling +
  WebRTC + Compute-Sharing) · Fremd-Engine-Tor (Sandbox + Auto-Vendor).
- **Spieler/UI:** `computePlayerStats` (equip-Fold) · Inventar/Hotbar/Equip · die 6 Räume +
  Designsystem (`.spec-*` · Omnibox). **Gebaut-aber-UI-los (~19 Methoden, KEIN Sediment —
  verdient den UX-Bogen):** Archipel (`createPortalHall`/`signPortalHall`/…) · Robustheit
  (`setWorldVisibility`/`banPeer`/…) · Compute-Sharing (`signComputeContribution`/…) ·
  `pinCurrentWorld`/`setRegionsActive`/`_portalForwardDsl`.

## §4 · Die Samen (ruhen mit Begründung — schneide nur, was VERIFIZIERT durch Tieferes ersetzt wurde)

`_fieldWohlErlebt`/`_fieldWohlBaselineAt` (WERTEN-Infrastruktur) · `_archInstanceUpdate` +
Instancing-Gating (bewegliche Instanzen + GPU-Memory-Schloss) · Drain-Pools (Leak-Schutz,
test-verankert) · Chat-DSL-Skeleton (Vision-Faden) · Wetter-ambient-Array (`snow/embers/motes` —
deklariert, nie geschaltet → Wetter-Polyvalenz) · anazhSymphony-Emotion→Tonalität-Lücke
(das magieleitung-Shimmer ist das Vorbild) · `journal share/witness` (Typen ohne Schreiber —
der Sozial-Bogen schreibt sie).

## §5 · Die operative Disziplin

Die tragenden Lehren leben in `CLAUDE.md` (auto-geladen). Zusätzlich hier: **Read-as-stranger
vor jeder Präsentation** (wirklich gemessen oder behauptet?) · **Merge-Rhythmus** = ein
validierter Bogen = ein Merge, der Tisch bleibt schlank · **eine verworfene Architektur nicht
wieder anfassen** (ein Revert ist ein Signal, dass die Wurzel woanders liegt).

## §6 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (18.546 → 18.547). Pro Welle: ein
thematischer Commit — **die Commit-Message IST der Chronik-Eintrag** (git log = die Chronik).
PATCH ist ein Fix INNERHALB einer Welle — nie eine Konstante, nie ein Stempel (September 2026:
586 Patch-Versionen für Lab-Literal-Hebungen in 2 Sammel-Commits = die Narbe). Alle Träger
setzt EIN Befehl: `npm run bump -- x.y.z` (`--check` meldet Drift).
Eine dauerhafte Lehre → eine Zeile in `CLAUDE.md`, nie Epen.
