# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.483 — DIE GEFÜHLS-NAHT: die Erlebnisräume der Studios erreichen die Welt)

**Die Reflexion (16.07.) fand die EINE Schicht, die nicht reiste: jedes Studio trägt
einen ERLEBNISRAUM (Arena · Probestrecke · Ninja-Park · Verhaltens-Seele), dessen
Gefühls-Gesetze Shell-only waren. V18.483 lässt sie in sechs Wellen reisen (alles
additiv, Kerne rein additiv, fail-soft byte-alt):**
DORF-IN-TERRAIN (Footprint-Höhe statt Punkt [4 obb-Ecken, Basis=MAX], Klippen-Wand
`AUTO_SETTLEMENT.fundamentMaxDh` 9 m [GEMESSEN: legale Berg-Slots tragen Δh 4.8–13 m],
`entry.fundament` reist, `_archFundamentBox` = EINE Wahrheit für Blocker UND Render-
Podest [EIN InstancedMesh-Pool, 1 DC]; gate:settlement +2 Bänder) · SCHWIMM-HEIMAT
(koerper-core `fx.bewegung.schwimmen` trägt Physik/Takt/Lehne/Kraul-Pose/Ausdauer,
`_schwimmGesetz` fail-soft; Regen ruht unter Wasser; tetrapoda MOTION.schwimmen =
Paddel-Gang) · KREATUR-LEBEN (gate:kreatur-leben, Klasse „tote reisende Daten": der
KÖRPER-ZUSTAND führt in der EINEN Motion-Brücke [MOTION_ZUSTAND_PROFILES: jagd/flucht/
schwimmen — das hunt-Preset reiste seit V18.476 ungewählt!]; tetrapoda `fx.verhalten`
= 12 Aktionen + 6 Stimmungen inkl. Bedürfnisse [Pflanzenfresser weiden am Tag, nachts
Ruhe], deterministisch [FNV, kein Math.random], Baum-Gang trägt Overlay + bodyX-Konsum,
hop zündet den Feld-Hüpfer) · ARENA-GEFÜHL (schmiede-core `ARENA`: Schwung-Konstanten
[N6.6-Revision — EIN Regler für Arena+Welt, Formel bleibt Ω-Φ4 √I], Hit-Stop/Dip
skalieren mit TREFFER-ENERGIE [114-J-Eichung, KE=½Iω²·Zielgröße; Pfeil reicht ½mv²],
Bogen-VEREINIGUNG v0=√(2E/mArrow) ≡ 34·√(zug·aus) + der AUSZUG [Halten spannt,
FOV-Zug, Lösen skaliert v0]) · FAHR-GEFÜHL (vehicle-core `FAHR.lenkung` → exportDrive
→ fahrprofil.lenkung: der Ritt fährt FAHRZEUG-EIGEN [W/S entlang der Gier, sf=1/(1+
v·sfK), Gier-Rate v·tan(δ)/Radstand, Grip frisst Quer-Slip, Shift=Handbremse→Drift];
nervensystem-vehicle-F-Band migriert [war seit V18.477 stale-rot]) · PARKOUR
(koerper-core `fx.bewegung.parkour`: Wand-/Doppelsprung [Wand-Wahrheit fällt am EINEN
Kapsel-Chokepoint gratis ab], Klettern [W an der Wand, Ausdauer], Rutsch [Taste C];
Kern kalt → KEIN Parkour). OFFEN benannt: Slide-Pose des Rigs (Physik da, Pose fehlt) ·
Fahrzeug-Billboard-LOOK + P2P-Kreatur-Gestalt · klang ohne Stufen-Zeile (meshfrei).

Davor V18.482 DIE VERBINDUNGEN (Dörfer 0.1→7/km² + Start-Dorf · Submit-Wal: CPU
4.28→1.23 ms, dc 1566→0 in der Sonde · Physik byte-paritätisch + Bogen-Verb komplett) ·
V18.481 ERLEBNIS-VOLLENDUNG (T2 Kaskaden 32→30M · T3 Bundles · T4 Fell×Fläche · T6
Körper-UI · T7 Boden) · V18.480 KANON (35 Alt-Doppel→0, Werkstatt-LOD-Knöpfe daten-
getrieben) · V18.479 ERLEBNIS-ZIEL (roadmap §0.0 normativ + T0 AUGEN [`npm run blick`:
echtes WebGPU headless via swiftshader-Vulkan] + T1 Blob-Tod + T2 Messung) · V18.478
NAHT-VOLLENDUNG (P2P-Gestalt · Reload-Treue · §8.5-Stufenzeile · Bäcker-ov) · V18.477
NIVEAU-VOLLENDUNG (Prägung-Welt · Fahrzeug-Fernstufe · Tier-Hysterese · Studio-
Übergabe) · V18.476 ORAKEL-UMSETZUNG (acht Tier-1-Linsen; Detail = git log). Der Bogen
darüber: **der Schöpfer spielt V18.483, der Flugschreiber-Trace urteilt** (GPU echt +
Tri-Zensus, POSTet automatisch → committen; V18.481-Trace maß noch 96.9 ms CPU-Render
VOR dem Submit-Wal-Fix). OFFEN daneben: Kommentar-Diät des Stamms (roadmap §0) ·
typeof-Ratchet (nur-sinkend) · Abnahme-Drehbuch (look-golden --mint · DoD 5) ·
Bogen-1-Rest (Kreatur-GPU-Skinning, roadmap §0.5).

## Architektur (die Karte)

- **Stamm** `anazhRealm.js` (~91k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
  Genese/Ökologie) · Speicher (Snapshot/Taille) · Spieler (Seelen/Bewegung/Werkstatt/Ökonomie) ·
  Anschluss (P2P/Portale) + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10, cores.manifest.json): reine Daten+Mathe; Vertrag v1.2 = `PARAMS_BY_KIND` + must-ignore
  + fail-closed (`docs/studio-vertrag.md`). Der Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi).
- **Worker:** Foundry (= terrain-Brücke; Kanäle `get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; IDB disk-first, SHA-Stempel der Quellen) · voxel-worker (bit-identischer
  Spiegel).
- **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC;
  Kanäle pos·input-Lockstep·dsl·soul·vibe).

## Die tragenden Lehren

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die
   LINSE bauen (Gate/Verdikt), nie auf Wachsamkeit bauen.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch.
   must-ignore gilt FREMDEN Artefakten (Taille), nie dem eigenen System. `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes** — der Schöpfer wertet Ergebnisse, nie Optionslisten;
   Bericht = drei Sätze, kein Theater. Ein benannter Fehler → die ganze KLASSE in derselben Welle.
5. **Miss zuerst, die Zahl führt;** verifiziere KONSUM, nicht Existenz; SPIELEN/sehen vor behaupten
   (headless beweist Mechanik, nie das Erlebnis; swiftshader-Screenshots sind farbtreu —
   schauen schlägt greppen).
6. **Tests wandern mit dem Code;** Absenz-Greps über `window.__codeOf` (Kommentare zitieren).
7. **Worker-Spiegel bit-identisch** (Main ↔ voxel-worker; jede Sheet-/Density-Änderung in BEIDE +
   `diag-worker-watersheet` maxDiff 0). Welt-Substanz zieht aus Γ5-Seed-Streams, nie Math.random.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; die Tiere sind bewusst tag-identisch —
   Differenzierung über die Größen-/Gattungs-Achse, nie über Tags).
9. **`gate | tail` maskiert Exit-Codes** — Exits IMMER explizit (`echo EXIT=$?`).
10. **Jede versionierte Datei braucht den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS anfassen** — die Benchmark bewegt sich nie; Goldens sind
    eingefroren, ein Re-Mint ist ein begründeter Vertrags-Akt. Kerne leben AUSSERHALB des
    format:check-Scopes — nie `prettier --write` auf Gesetzbücher (verbatim-Blöcke!), neue
    Abschnitte rein additiv. `__`-Schlüssel in ov sind STEUER-Passagiere (nie in Bau-Parameter).
12. **Monolith-Chirurgie:** `cut-method` (AST-sicher) · sofort `node --check` + eslint ·
    seriell committen, nie Batch; worktree-Agenten zweigen von main ab.
13. **Der Loop/Regler:** Streaming ist heilig (prio 0), Bewegung hängt nie am Render-Signal;
    EIN PID, Totband 59–77 fps; NaN-Wände vor jedem EWMA-Gedächtnis; Existenz vor Framerate —
    der Ring wächst bis `RING_EXIST_FLOOR` OHNE fps-Gate, der PID atmet nur darüber.
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron
    auf dem Interaktions-Pfad.
15. **git ist das Archiv:** kein Doppel-Archiv im Baum — Chronik = Commit-Messages, vollendete
    Pläne fallen (git trägt sie), dauerhafte Lehren = EINE Zeile hier, Offenes = roadmap §0.
    Vor jedem Datei-Schnitt: KONSUM prüfen (Gates/CI/Docs, transitiv), nicht Existenz raten.

## Workflows

Dev-Loop: `npm run playtest:fast` (~20 s) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten · apparat) · `npm run lint` / `format:check` ·
Navigation: `npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in package.json.
Commits klein + thematisch, emoji-frei, deutsch — **die Message ist der Chronik-Eintrag**;
Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/roadmap.md` §0 = was offen ist (+ Narben · Teilsysteme · Samen/gemerkte Fäden) ·
`docs/studio-vertrag.md` = die Naht (normativ) · `docs/taille-spec.md` = die Taille (normativ) ·
`docs/neues-kleid-verfassung.md` = die Pipeline-Verfassung (normativ) ·
`docs/das-lebendige-feld.md` = der wahre Norden (vor Feld/Emotion/Nexus/DSL zuerst) ·
`docs/state-of-realm.md` = Vision · `docs/abnahme-drehbuch.md` = die EINE Schöpfer-Runde ·
Chronik + alles Gefallene: `git log`.
