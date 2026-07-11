# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.451 — ALTLASTEN-NULL + HERZ + ULTRAGUSS I)

Die Fantasie-Altlasten sind physisch gefallen (Phönix·Drache·Glutwesen·Sprite·Geist·Wächter·Avatar-
Aura); der Tod ist feld-nativ (`_playerDeathRespawn`: Anker-Rückkehr + Wunde + `_depositLife`);
Körper→Eigenschaften ist ZAHL (Bär>Wolf>Fuchs HP · invers im Tempo, EINE Größen-Fold-Quelle);
Bestand = **Mensch + Hirsch·Wolf·Fuchs·Bär (+ Pferd)**, `werde wolf` verkörpert per Chat.
`gate:altlasten` (im check) hält Gefallenes strukturell draußen. **DAS HERZ:** die Anatomie-GESETZE
wohnen in den Gesetzbüchern (tetrapoda-core `buildSkeleton`+`ARCHETYPES`+`DIAL_MAP` · koerper-core
`landmarks`+`DIAL_MAP`; der Stamm DELEGIERT fail-closed, index.html lädt die Kerne vor dem Stamm);
`werde wolf` trägt die ECHTE Kreatur (Metaball-Haut, 1st-Person-Regel); Mensch-Dials tragen Stats
(dieselbe Größen-Achse, Default exakt 1.0). **ULTRAGUSS I (V18.451):** die Labs LESEN ihre
Gesetzbücher (Phänotyp-Zwilling tot [foundry→phyto-core] · Tier-Allometrie+CPG in tetrapoda-core ·
Progression+Terzschichtung in klang-core · Feder-Koeffizienten in vehicle-core.FAHR · Membran-
Palette in porta-core; die Stamm-Lofi-Improvisation ist BEWUSST ein eigener Komponist [Emotion+
Feld], gleiche Skalen); die Buster-Linse + Zwillings-Wand wachsen in gate:altlasten.
OFFEN aus `docs/ultraguss-plan.md`: U3-Kern (koerperstudio-morph, XL) · U6c/d (fachwerk-Snap ·
schmiede-Profil) · U7 · U8 (W9 Himmel · W10 Wasser · Look-Goldens — braucht Render/Auge).
Davor: SYNERGIE (V18.448 — EINE
Export-Form `PARAMS_BY_KIND`, EIN Umschlag `get-book`, EIN Ingest) · Nervensystem/Katalysator/Trias
(V18.434–.447). **OFFEN:** die eine Schöpfer-Browser-Runde (W8-Abnahme + LOOK-Stau) · W9 Himmel 1:1 ·
W10 Wasser-Oberfläche 1:1 (`docs/roadmap.md` §0).

## Architektur (die Karte — voll: docs/archiv/claude-md-v18448-snapshot.md)

- **Stamm** `anazhRealm.js` (~88k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
  Genese/Ökologie) · Speicher (Snapshot/Taille) · Spieler (Seelen/Bewegung/Werkstatt/Ökonomie) ·
  Anschluss (P2P/Portale) + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10, cores.manifest.json): reine Daten+Mathe; Vertrag v1.2 = `PARAMS_BY_KIND` + must-ignore
  + fail-closed (`docs/studio-vertrag.md`). Der Host ist der OFEN (bake-core/Rig/Lofi).
- **Worker:** Foundry (= terrain-Brücke; Kanäle `get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; IDB disk-first, SHA-Stempel der Quellen) · voxel-worker (bit-identischer
  Spiegel) · bake-worker (Haut).
- **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC;
  Kanäle pos·input-Lockstep·dsl·soul·vibe).

## Die tragenden Lehren (voll: Gotcha-Vollarchiv in docs/archiv/handover.md + Snapshot)

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die
   LINSE bauen (Gate/Verdikt), nie auf Wachsamkeit bauen.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch.
   must-ignore gilt FREMDEN Artefakten (Taille), nie dem eigenen System. `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes** — der Schöpfer wertet Ergebnisse, nie Optionslisten;
   Bericht = drei Sätze, kein Theater. Ein benannter Fehler → die ganze KLASSE in derselben Welle.
5. **Miss zuerst, die Zahl führt;** verifiziere KONSUM, nicht Existenz; SPIELEN/sehen vor behaupten
   (headless beweist Mechanik, nie das Erlebnis; swiftshader-Screenshots sind farbtreu).
6. **Tests wandern mit dem Code** (V9.56-i); Absenz-Greps über `window.__codeOf` (Kommentare zitieren).
7. **Worker-Spiegel bit-identisch** (Main ↔ voxel-worker; jede Sheet-/Density-Änderung in BEIDE +
   `diag-worker-watersheet` maxDiff 0). Welt-Substanz zieht aus Γ5-Seed-Streams, nie Math.random.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; die Tiere sind bewusst tag-identisch —
   Differenzierung über die Größen-/Gattungs-Achse, nie über Tags).
9. **`gate | tail` maskiert Exit-Codes** — Exits IMMER explizit (`echo EXIT=$?`).
10. **Jede versionierte Datei braucht den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS anfassen** — die Benchmark bewegt sich nie; Goldens sind
    eingefroren, ein Re-Mint ist ein begründeter Vertrags-Akt.
12. **Monolith-Chirurgie:** `cut-method` (AST-sicher) · sofort `node --check` + eslint ·
    seriell committen, nie Batch; worktree-Agenten zweigen von main ab (falsche Naht bei Feature-Branch).
13. **Der Loop/Regler:** Streaming ist heilig (prio 0), Bewegung hängt nie am Render-Signal;
    EIN PID, Totband 59–77 fps; NaN-Wände vor jedem EWMA-Gedächtnis.
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron
    auf dem Interaktions-Pfad.

## Workflows

Dev-Loop: `npm run playtest:fast` (~25 s, 16 Checks) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten) · `npm run lint` / `format:check` · Navigation:
`npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in package.json. Commits klein +
thematisch, emoji-frei, deutsch; Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/archiv/handover.md` = Chronik + Gotcha-Vollarchiv + Session-Start · `docs/roadmap.md` §0 =
was offen ist · `docs/state-of-realm.md` = Vision · `docs/das-lebendige-feld.md` = der wahre Norden
(vor Arbeit an Feld/Emotion/Nexus/DSL zuerst) · `docs/studio-vertrag.md` = die Naht (normativ) ·
`docs/archiv/claude-md-v18448-snapshot.md` = der volle Gotcha-/Stand-Snapshot vor der Schlankung ·
Pro Welle: ein Commit + ein Chronik-Eintrag; dauerhafte Lehren als EINE Zeile hier hinein, nie Epen.
