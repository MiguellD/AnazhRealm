# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.478 — DIE NAHT-VOLLENDUNG: die vier benannten Reste sind geschlossen)

**Die V18.477-Niveau-Vollendung ließ vier Punkte benannt-offen — V18.478 schließt alle
vier, je mit Linse (alles additiv/render-seitig, die fixe Sim byte-unberührt):**
P2P-GESTALT (`gate:p2p-gestalt`: der soul-Kanal trägt die Avatar-Übergabe additiv, der
Empfänger validiert am SELBEN `_studioUebergabeValidate`, der Peer-Guss führt sie
transient über `_activePeerUebergabe` [try/finally, kein Leck]; zwei Peers bleiben über
distinkte Ofen-Keys eigenständig, der eigene Avatar byte-identisch) · RELOAD-TREUE
(`gate:reload-treue`: der Guss friert die wirksame Übergabe je Wesen ein [`gussDials`,
nur wenn aktiv — sonst byte-alt], der Snapshot trägt sie, der Restore pinnt sie durch
DENSELBEN Validator als dialsOv — die Kreatur kehrt wie gegossen wieder, auch wenn die
Übergabe sich änderte; der Richter-Befund [mittel] ist tot) · VERTRAGS-STUFEN-ZEILE
(tetrapoda/koerper-core tragen additiv `PORTAL_RENDER_CONFIG.lod.kindStages`
[kreatur:[0,1] · koerper:[0,1]], §8.5 normativ — die längst gebaute Ofen-Leiter ist
jetzt VERTRAGS-Wahrheit; tier.lods bleibt Matrix-TEIL, weil 2 < das 3-Stufen-Soll) ·
BÄCKER-OV (der fimp-Key trägt jetzt den ov-Hash, geprägte Entries ziehen IHRE Impostor-
Karte statt fern als L0-Geometrie zu fallen; die V18.477-Stempel-Wand fiel, der
Bake-Request trägt msg.ov [die Brücke las es schon], ungeprägter Baum-Pfad byte-alt;
`gate:fahrzeug-fern` erweitert). OFFEN benannt: klang ohne Stufen-Zeile (meshfrei, kein
Ofen) · Fahrzeug-Billboard-LOOK + P2P-Kreatur-Gestalt (Schöpfer-Auge/Kreatur-Sync-Pfad).

Davor V18.477 DIE NIVEAU-VOLLENDUNG — der Studio-Vergleich (Vertrag · Welt · Editor,
drei Leser + frische Matrix) fand vier echte Risse, alle in EINER Welle geschlossen:
PRÄGUNG-WELT (`gate:praegung-welt`: die Prägung reist als Guss-Stempel `studioOv` MIT
dem Artefakt in Hand/Welt/Snapshot/place-DSL, ov-Hash trennt Cache+Batch, die EINE
Räumungs-Naht `_foundryCacheEvict` heilt den präge-Flush [Verify-CONFIRMED]) ·
FAHRZEUG-FERNSTUFE (`gate:fahrzeug-fern`, impostor:true, geritten = L0) ·
TIER-FERN-HYSTERESE (`gate:tier-fern`, TIER_FERN_HYST = die EINE Fern-Bande, auch am
mensch-Toggle) · STUDIO-ÜBERGABE (`gate:studio-uebergabe`, der W12-Kanal `uebergabe`
trägt Gestalt+Dials fail-closed in den Welt-Guss). Davor V18.476 DIE ORAKEL-UMSETZUNG
(acht Tier-1-Wellen, je EINE Linse: kopplung ·
koerper-bewegung · kampf-gefuehl · schritt-klang · render-diaet [EIN Material je
Tag-Signatur + r184-INDEX-KONSISTENZ #i/#x am Batch-Key] · gpu-zeit [timestamp-query,
gpuMs echt|proxy] · kreatur-kosten · reconnect — alles render-seitig, fixe Sim
unberührt). Der Bogen darüber bleibt der **Schöpfer-Browser-Befund (14.07., roadmap
§0.1):** beide Steady-Hebel (DC-Diät V18.474 · Render-Diät V18.476) sind gebaut —
**der nächste echte Trace urteilt** (Flugschreiber misst GPU ECHT + Tri-Zensus; er
POSTet beim Spielen automatisch → committen). Davor: V18.475 Wasser-Wahrheit ·
V18.474 Vollende-Welle · V18.473 Existenz-Boden · V18.472 Panel+Export · V18.471
Bäcker-Vereinigung · V18.470 Konsum-Matrix · V18.469 Erstarren-CPU-Hälfte · V18.468
Informations-Diät (Detail = git log). OFFEN daneben: Kommentar-Diät des Stamms
(roadmap §0) · typeof-Ratchet (nur-sinkend) · das formale Abnahme-Drehbuch
(look-golden --mint · DoD 5) · Bogen-1-Rest (RenderBundles · Kreatur-GPU-Skinning,
roadmap §0.5).

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
