# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.476 — DIE ORAKEL-UMSETZUNG: acht Tier-1-Wellen, je EINE Linse)

**Das Profi-Orakel („wie machen es die Besten?" als stehende Schärfung von Lehre 4;
Audit + Reihung in roadmap §0.5) ist UMGESETZT — acht Wellen in einem Zug, alle
render-seitig (die fixe Sim blieb unberührt, gate-bewiesen), je Welle eine Linse:**
KOPPLUNG (`gate:kopplung`: Strömung advektiert Schwimmer · Quake-ClipVelocity-Gleiten ·
EIN Wind-Richtungs-Vektor für alles Sway · Gras-Interaktions-Sphären) · KÖRPER
(`gate:koerper-bewegung`: weg-getriebene Gang-Phase + Posen-Blend + Two-Bone-Fuß-IK/
Foot-Lock/Becken/Rumpf-Hang + Tier-Bodenanker — der 0,5-m-Schwebe-Sinus fiel) · KAMPF
(`gate:kampf-gefuehl`: 3-Phasen-Schwung ∝ √I aus _swingDynamics · Klingen-Kapsel-Sweep ·
Hit-Stop nur auf der Anzeige-Uhr · Tod-Kippen entlang _fieldGradient) · SCHRITT-KLANG
(`gate:schritt-klang`: Material-Timbres über die EINE Klang-Maschine) · RENDER-DIÄT
(`gate:render-diaet`: EIN Material je Tag-Signatur, Farbe als Instanz-Kanal via
_archSlotColor — der 1733-dc-Treiber; **Review-Ernte CONFIRMED: der Batch-Key trägt die
r184-INDEX-KONSISTENZ #i/#x am EINEN Chokepoint**, gemischte Fixture wacht in der Linse) ·
GPU-ZEIT (`gate:gpu-zeit`: timestamp-query im vendored r184, gpuMs + Quelle echt|proxy in
Panel/worst/Trace) · KREATUR-KOSTEN (`gate:kreatur-kosten`: Anim-Raten-Leiter fern
1/2·1/4·0 · Standbild-Freeze neutral · mensch-Fern-Guss lod≥1 — Matrix-Zelle mensch.lods
VOLL) · RECONNECT (`gate:reconnect`: Exponential-Backoff+restartIce [Perfect Negotiation] ·
Snap-Interpolationspuffer nur im Nicht-Lockstep-Pfad).

Der Bogen darüber bleibt der **Schöpfer-Browser-Befund (14.07., roadmap §0.1):** beide
gemessenen Steady-Hebel (DC-Diät V18.474 · Render-Diät V18.476) sind gebaut — **der
nächste echte Trace urteilt** (der Flugschreiber misst die GPU jetzt ECHT und trägt den
Tri-Zensus; er POSTet beim Spielen automatisch → committen). Davor: V18.475 Wasser-
Wahrheit · V18.474 Vollende-Welle (Fahrzeug ganz · Tier-Separation · Zweit-Kern-Bäckerei ·
DC-Diät) · V18.473 Existenz-Boden/Tri-Attribution/Nacht-Karten · V18.472 Panel+Export ·
V18.471 Bäcker-Vereinigung · V18.470 Konsum-Matrix (`gate:konsum-matrix`, nur-wachsend) ·
V18.469 Erstarren-CPU-Hälfte · V18.468 Informations-Diät (Detail = git log). OFFEN
daneben: Kommentar-Diät des Stamms (roadmap §0) · typeof-Ratchet (nur-sinkend) · das
formale Abnahme-Drehbuch (look-golden --mint · DoD 5) · Avatar-Kleider ≠ Studio ·
Bogen-1-Rest (RenderBundles · Kreatur-GPU-Skinning, roadmap §0.5).

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
