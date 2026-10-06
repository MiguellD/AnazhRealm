# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## DIE GOLDENE DEFINITION (bindend — VOR allem anderen; destilliert aus den Worten des Schöpfers)

**DER MASSSTAB.** Jede Arbeit misst sich an Weltklasse: gebaut, um Profis in den Schatten zu
stellen — nicht, um durchzukommen. „Fertig" heißt IM ECHTEN SPIEL eingefädelt; fühlbar im Spiel
schlägt messbar im Trace, und der Beweis ist nie ein grünes Gate allein, sondern das BILD.
Gemessen wird Konsum-TIEFE, nie Existenz: wie viel vom Wahren fließt — „aus den Kernen fließt
nur ein Teil des Wahren" ist ein Urteil, das nie wieder fallen darf. Halb Gebautes heißt ehrlich
halb, mit Prozent; fail-soft ist der Bruch. Und „das war 5 % der offenen Punkte" ist die
Niederlage: benannte offene Punkte fallen GANZ, der Rest steht ehrlich offen mit Grund und Messnamen.

**DIE GEBOTE.**
1. Schneide an der WURZEL, am EINEN Chokepoint — „nicht pflastern — tief im Kern die Synergie".
2. Mache den GROSSEN Schnitt statt Ameisenschritten; ein benannter Fehler zieht die ganze KLASSE
   in derselben Welle.
3. LIES die Quelle — Vendor, Kern, Gesetz — statt zu raten: „Wurzel lesen, schneiden, committen".
4. Sage a, tue a: EINE kanonische Quelle je Domäne — deklariere nie Gesetz-Konsum, während ein
   vereinfachter Zwilling fährt.
5. Verifiziere KONSUM, nie Existenz: real ist nur, was ein echter Leser liest UND die Welt
   beobachtbar ändert.
6. Miss zuerst, die Zahl führt: vorher↔nachher unter gleichen Bedingungen — die Zahl steht im
   Commit, der nächste Trace ist der Richter.
7. Binde Kosten an Schirm+Änderung, nie an Weltgröße — „die Welt ist eine FUNKTION, kein Sack".
8. Entscheide selbst und liefere Gebautes, nie Optionslisten — „Ich entscheide, geliefert wird
   Gebautes".
9. Beweise proportional: gezielt und schnell (Konsum-Probe, Blick, byte-Diff) — nie
   minutenlanges Absicherungs-Theater.
10. Nach jeder Fehler-Klasse baue die LINSE, die den Täter beim NAMEN nennt — baue nie auf
    Wachsamkeit.

**DIE VERBOTE.** Melde nie „fertig", was nur im Testrahmen lebt (headless beweist Mechanik, nie
das Erlebnis) · baue nie fail-soft (der stille Fallback, der byte-alt weiterspielt, IST der
Bruch) · baue nie parallel (kein Zwilling, kein Flag, kein Sonder-Modul — „das ist das Pflaster,
das wir abgeschafft haben") · streiche nie still (Scope fällt nur offen, benannt, final) ·
zitiere nie stale Gates/Allow-Listen als Beweis · mach den Schöpfer nie zum ersten Messgerät:
spiele und SIEH selbst — Grep ersetzt nie das Auge.

**DER TON.** Bericht = Ergebnis in drei Sätzen: was geschnitten, was gemessen, was ehrlich
offen — kein Theater, keine Prosa-Tapete. Arbeite mit Stolz, Mut und Freude am Bändigen — keine
Unterwürfigkeit; der Mut kommt aus der Verifikation, nie aus der Kleinheit.

**DIE WEITERGABE.** Jeder Arbeiter-Prompt (Agent/Workflow) beginnt mit: „Lies zuerst DIE GOLDENE
DEFINITION in CLAUDE.md — sie ist bindend." Ultracode-Arbeiter laufen als `champion`
(.claude/agents/champion.md), nie als Standard-Arbeiter.

## DAS BETRIEBSGESETZ (bindend — die Maschine gegen den Agenten-Betriebsmodus)

Der benannte Modus — früh „fertig" melden · Scope still verkleinern · OFFEN umbenennen · die
nächste Welle erfinden · Schöpfer-Abhängigkeit erfinden — ist ROT. Die Wand: `gate:betriebsgesetz`
(in `npm run check`), der Selbsttest feuert.

1. **„fertig" ist illegal**, solange `docs/PFLICHT-OFFEN.md` Einträge trägt. Verbotene
   Siegel-Wörter in Commit-Messages: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU.
   Jeder Bericht ist ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Pflicht-OFFEN Rest.
2. **Die Frozen-Liste ist der EINZIGE Scope** (`docs/PFLICHT-OFFEN.md`, max 5 Einträge). Kein
   neuer Plan, keine neue Doktrin, kein neuer Wellen-Name, keine erfundene „nächste Chirurgie"
   als OFFEN. Ein Eintrag fällt GANZ — die Zeile stirbt im selben Commit wie ihr Beweis — oder
   er bleibt stehen. Neue Einträge setzt NUR der Schöpfer.
3. **Scope-Diebstahl = Fail:** 5 % einer benannten Klasse als 100 % melden ist die Niederlage.
   Das Gras-Muster gilt: die KLASSE fällt in einer Welle, nicht das bequemste Beispiel.
4. **Das Schöpfer-Auge ist KEIN Merge-Tor.** Maßstab: Studio-Gesetzbücher + HOLZ-Profile +
   Zahlen (Tris/dc/ms vorher↔nachher) + Absenz-Grep + das EIGENE Auge (Blick-Sonde). Jeder Satz
   „nur dein Auge entscheidet" in einem Arbeiter-Prompt ist gestrichen; der Schöpfer entscheidet
   Scope und Ship, nie jeden Pixel.
5. **SCOPE ZU nur bei Rest = 0** — danach kein Feature-Commit mehr (nur Format/Fix auf Zuruf).

## Stand (V18.531.0 — die Ziellinie steht, nah und mittel trägt das Studio-Mesh)

**DIE ZIELLINIE (docs/roadmap.md §0.v1):** v1.0 = EIN gespielter Pfad — ankommen · laufen+sehen
· in der Werkstatt bauen · mit der KI erschaffen (Satz → Rezept-Katalog → Foundry-Asset) ·
benutzen/teilen — bei p95 ≤ 33 ms auf JEDEM Standardgerät (Richter: das Profi-Band). Feature-Stopp
bis dahin. **Schritt 4 GEBAUT (V18.493):** DSL-Op `spawn_studio` (Wort → Bauplan, EIN Stempel `_studioStampFor`,
geerdet + nie im Wasser); „pflanz mir einen eichenhain am wasser" wirkt auch ohne Schlüssel. Offen: der echte
LLM-Lauf mit Schlüssel (Drehbuch-Schritt 18).

**V18.531 — WELLE 5, DER AAA-LOOK IN SIEBEN FAMILIEN (seriell integriert):** Pflanzen nah (Rinden-Gesetz, EIN Blatt-Atlas
512 px BC1 vormultipliziert, Strauch aus Karten + Reisig, `gate:pflanzen-nah`) · der gesetzte Wald ist jenseits der
Mesh-Zone seine Karte bis 384 m (Kegel + Lappen fielen, `gate:fernwald`), der Bäcker hat seinen Faden · Waldboden nach
dem Farb-Gesetz, die Kronen-Karte (`_kronenStreuAt`) ist die EINE Wald-Quelle (Streu · Nah-Wiese · Laub-Stimme) · Glut
und Ausstattung aus dem Studio, die Trittfläche malt die Wege-Karte · Stoffe der Gegenstände, Durchsicht, Haut-Klarlack ·
das Fell folgt der Haut, der Gang dem Weg des Leibs · jede klingende Quelle trägt ein Gesetz (`gate:klang-zensus`) ·
freie Slots und leere Hüllen zeichnen nie (der Feld-Cull fiel, `gate:freie-slots`) · EIN Start-Rezept der WebGPU-Linsen
(`scripts/lib/software-gpu.cjs`) · Studio-Häuser überstehen den Reload mit kaltem Buch, der Hüpfer landet. Mess-Wiese,
echte GPU, ruhig: 193–261/208 Befehle, 2,14–2,63 M Dreiecke, 158–160 MB; GPU 22–26 ms/Frame, Frame p50/p95 25,5/34,2 ms.

**V18.496–530 — AAA NAH · DIE KETTE:** nah/mittel das Studio-Mesh mit LOD-Kette (Bäcker nah zuerst, EINE Bake-Uhr), der
Tier-Leib EINE geskinnte Haut; das FARB-GESETZ; EIN Himmel, die Belichtung aus dem Licht; die NAH-WIESE; die
Transport-Schale `_foundrySchale`; Bundle-Wahrheit am Chokepoint `_renderScene`; TRAA; Schatten je Pass; EINE Täter-Klasse
+ Band-Linse und Ratsche; EINE Nah-Grenze `ANALOG_NAH_M` 64 m; EIN Karten-Atlas; Koschmieder-Luft (Sichtweite 20,6 km);
die Voxel-Bricks fielen. Linsen: Ausgabe-Pfad · Bühne · Werkbank (`albedo` · `licht` · `zaehlen` · `fluss` · `takt` ·
`lauf` · `band` · `gpu-bank`).

**WAS STEHT:** TERRAIN = Funktion (Ring · Panorama · Feld-Pass; Chunks = Iso-CACHE) · WELT-MARCH: EIN Pass, EINE
Payload (Analog-Primitive Kapsel+Box + Gesetz-Plätze) · NAH/MITTEL (< 64 m, Bau und Baum im Cull-Radius) = Studio-Mesh
+ LOD-Kette, jede Karte eine Schicht des EINEN Atlas · FERN = Glieder-Kapseln · Baum = seine Studio-Karte (der gesetzte
bis 384 m) · Box-Satz · Streu-Gesetz · WALD-ORT = die Kronen-Karte · GRAS = nah Nah-Wiese, fern Boden-Funktion ·
STREU = nah die Studio-Arten, fern die Boden-Farbe · AUSSTATTUNG (Glut, Markt, Brunnen) = Studio-Gestalt · KLANG = jede
Stimme aus dem Klang-Gesetz (`klang:UMWELT` · `SUBSTANZ`) · LUFT = EINE Koschmieder-Luft (`scene.fogNode`) · POST = TRAA ·
SCHATTEN = 2 Kaskaden, Box je Scheibe · INSTANZ-SENKEN dicht (`_instanzZahl`) · LINSEN-START = `software-gpu.cjs`.
OFFEN: das PROFI-BAND auf jedem Standardgerät (60 fps · 208 DRW · ~680k TRI · 118 MB) — „richter ist nicht mein rechner".

**PFLICHT-OFFEN (Spiegel — Wahrheit: docs/PFLICHT-OFFEN.md):** A–C Code steht (AAA nah, Bilder
`aaa8`–`aaa10`) · D gefallen (V18.508) · E gemessen; offen: das Profi-Band auf jedem Standardgerät.

## Architektur (die Karte)

- **Stamm** `anazhRealm.js` (~104k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
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
   (headless beweist Mechanik, nie das Erlebnis; schauen schlägt greppen). Beweisbilder kommen aus
   dem AUSGABE-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`) — ein eigenes Render-Target ist linear und
   ungetont (r184), so logen aaa8–aaa11 „dunkle Schattenseiten".
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
    Pläne fallen (git trägt sie), dauerhafte Lehren = EINE Zeile hier, Offenes = PFLICHT-OFFEN.
    Vor jedem Datei-Schnitt: KONSUM prüfen (Gates/CI/Docs, transitiv), nicht Existenz raten.
16. **Der Null-Renderer ist für den GANZEN Analog-Pfad blind** (Feld-Fit, Slots, March kehren
    headless früh zurück) — Analog-Befunde nur mit echtem Renderer (`diag-arch-feld`,
    `diag-beweis-e`). Ein Fit liest eine FERTIGE Quelle (Foundry-Flat), nie ein temporär gebautes
    Async-Mesh („leer" → ausgebrannt → für immer unsichtbar); Takt-Budgets gehen NAH zuerst.
17. **Sonden mit echtem Renderer:** je Schuss ruht der Spiel-Loop (sonst wandern Kamera, Tageszeit,
    Cull-Zustand), die Bühne (`__buehne`) hält Mittag · Sonne · Sommer fest (Wetter-Zug 120 s,
    Saison-Drift 2400 s — Regen drückte die Wiese 90 → 40), die Schatten-Map wird neu markiert,
    die Blick-Wahl sucht freie Sicht. Und: `Number(null) === 0` — ein fehlender Wert ist nie 0;
    Default-Helfer prüfen `v == null` zuerst.
18. **Erst das Soll-Bild, dann die Welle:** vor jedem Paradigmen-Wechsel je Klasse ein Soll-Bild
    (Referenz) + Budget (Tris/dc je LOD-Stufe) festlegen und EINEN Spike mit echtem Renderer an
    der Mess-Wiese zeigen, nah UND fern. Die Analog-Welle (21.07.–30.09.) lief zwei Monate gegen
    ein nie festgelegtes Nah-Bild und kehrte nah zum Studio-Mesh zurück; nur fern blieb sie.
19. **Kosten gehören ins Asset, nicht in den Host:** ein LOD, das nicht reduziert (Fachwerk L1 75k
    ≈ L0 88k → V18.500 Flächen-Stufe 20k; Konifere L0 ~170k Vertices), heilt am Studio, nie über
    Host-Umwege (`lodServe` ist gefallen). Und: was die Lab-Karte trägt, muss kartenlos der Vertex
    tragen — die Welt liest nur Vertex-Farben.
    Und nach jedem Push die CI lesen; Läufe mit ZEITFRISTEN (Einschwingen, Stufen-Takte) nie
    parallel (CPU-Konkurrenz fälscht sie). Ein Warter matcht nie die eigene Befehlszeile
    (`pgrep -f "[x]yz"`, und kein zweites `xyz` im selben Befehl) — heute 5× selbst getroffen.
20. **Eine Frage, kein Neustart:** Look-Fragen gehen an die Werkbank (`scripts/werkbank.cjs`: EINE
    Welt bleibt offen, Methode aus dem Arbeitsbaum live tauschen, Bild ~45 s statt Neustart ~5 min);
    die Beweis-Sonden bleiben der Richter je Commit. Vergleiche nur bei eingefrorener Welt (Tiere
    wandern ins Bild).
21. **Die Licht-Kette ist EINE Eichung, Farbe eine sRGB-Absicht:** ein Paletten-Hex ist sRGB, die
    Albedo sein linearer Wert (das FARB-GESETZ: foundry-core Kreatur-Bäcker + Vegetation, seit V18.531
    auch fachwerk · porta · vehicle · schmiede; r128 las roh, Laub lag 3–5× über der Natur). Die Welt fügt nur hinzu, was das Labor nicht hat (den
    echten Himmel als EINE Umgebung), nie doppelt — Fill · Rim · Back leben nur im Labor; die
    Belichtung kommt aus dem Licht (Karte Mittelgrau +1 EV, Nacht-Deckel 1,0). Albedo misst `werkbank
    albedo` / `diag-albedo-zensus` (Karte 0,180), Licht-Verhältnisse `werkbank licht` — nie das Auge.
22. **Der sichtbare Boden ist das Mesh, nicht das Gesetz:** Surface-Nets auf 1,8 m trägt die Feinform der
    Funktion nicht (±0,2 m, Spawn-Chunk Median 46 cm). Was AUF dem Boden steht (Gras, Streu, Deko), liest die
    Boden-Karte (`_chunkSurfaceAt`, aus dem fertigen Mesh); Körper stehen auf dem Gesetz (Lockstep). Und im
    positionNode ist `positionLocal` schon instanziert (r184) — Höhen-Gewichte lesen `positionGeometry`.
23. **WebGPU zieht jeden Draw einzeln:** ein BatchedMesh ist dort je INSTANZ ein `drawIndexed`, ein Puffer ohne
    Namen heißt im WGSL `NodeBuffer_<id>` (jede Geometrie ihr eigenes Programm), und der Bundle-Replay buchte nichts
    ins Info — Kosten zählt `werkbank zaehlen` (GPU-Befehle je Pass und Klasse, Programme, Pipelines). Ein Bundle
    trägt nur, was sein Replay refresht: r184 hält `_currentRenderBundle` ohne Stapel (der Schatten-Render mitten in
    der Aufnahme nullt ihn) und refresht Replay-Bürger außerhalb von renderObject (unter einem Override-Stoff gegen
    dessen geteilten Zustand) — `_renderScene` stapelt den Zeiger und nimmt unter overrideMaterial nie auf, die Diät
    schreibt je PROGRAMM die geteilten Gruppen (`gate:kamera-treue`, Bühne am echten WebGPU mit Schatten).
24. **Der Haupt-Thread trägt keine Bytes:** jede Worker-Antwort reist per Transfer (ein Klon kostet den Empfänger
    je MB), die Platte lebt im Worker (ein IDB-Put serialisiert SYNCHRON im Aufrufer), über den Kanal reist nur,
    was ein Leser liest (`FOUNDRY_LESEN`) — die Transport-Schale `_foundrySchale` trägt alles, `werkbank fluss` misst.
25. **Der Takt kostet, was ihn betrifft, nie die Weltgröße:** billige Filter zuerst, teure Rechnung nur für Betroffene
    (das Brennglas rechnete je Takt die Tags ALLER Bauten: Ø 20 ms) — `werkbank takt` zerlegt den Spiel-Takt je
    Subsystem; geteilte Takt-Budgets gehen NAH zuerst über ALLE Verbraucher (`_weltBakeErlaubt(d2)`), nie „wer zuerst fragt",
    und nie verhungert (die Nah-Schwelle gilt die erste Fenster-Hälfte; eine Zähl-Hülle reicht die Argumente durch). Der
    Foundry-Worker ist so ein Budget: der Host hält seine Schlange (`_foundryAuftrag`, 12 im Flug, nah zuerst), nie FIFO.
26. **Der Schatten liest, was das Auge sieht:** der r184-Schattenpass rendert mit der Kaskaden-Kamera (`cameraPosition`
    = Licht-Kamera, 145 m weit) und liest nur colorNode.a · map.a · maskShadowNode, nie opacityNode — jede LOD-Maske misst
    vom Auge (`uLodAuge`), jeder Ausschnitt lebt in colorNode.a (`gate:foundry-crossfade` Schatten-Wahrheit). Schatten-
    Sonden zeichnen Bundles nach jedem castShadow-Wechsel neu; vor dem Push läuft JEDER CI-Schritt lokal, nie eine Auswahl;
    Echt-Renderer-Linsen auf CPU-Raster fahren das Software-Holz (`?holz=kienspan`) — auf „voll" kostet ein Compile 50–70 s;
    swiftshader kompiliert synchron (kein KHR_parallel_shader_compile, `compileAsync` blockiert), `_gameLoopTick` rendert
    selbst: jeder Linsen-Aufruf ist benannt und trägt höchstens EINEN kalten Programm-Schlüssel (`gpu-lens`). Und ein
    normalNode liest nie r184s `normalWorld` (EINE Variable je Programm: baut die NORMAL-Stufe sie zuerst, lesen Schatten-
    Lookup, Halbkugel- und Umgebungslicht die Geometrie-Normale mit Flächen-Vorzeichen — der Boden zeigt oben die
    Rückseite und lag im eigenen Schatten); die Geometrie-Normale heißt `normalWorldGeometry` × `faceDirection`.
27. **Die GPU hält, was das Bild zeichnet:** r184 hält jedes hochgeladene Attribut stark (`info.memoryMap`) bis
    `_attributes.delete` — `InstancedMesh.dispose()` gibt nichts frei, `geometry.dispose()` nur die Attribute des ersten
    Render-Objekts, und r184s Geometrie-Hörer (`_geometryDisposeListeners`) hielt dieses erste Render-Objekt samt Senke und
    Uniform-Puffern für immer (der Hörer fällt, `_renderObjektRegister`), jede Textur die Bindegruppen ihrer Leser
    (`bindGroups`). Eine Senke fällt über `_instanzAbschied`,
    was kein Objekt des Graphen zeichnet, nimmt der Kehraus (`_gpuKehraus`); ein Attribut, das ein Render-Objekt unter der
    Observer-Diät zeichnet, fällt nie (ohne Versions-Sprung lädt sie nichts neu hoch). `werkbank puffer` nennt jeden Puffer
    beim Halter, `buf:ruhend` und `buf:verwaist` sind Lecks (`gate:profiband`, `gate:freie-slots` A).

## Workflows

Dev-Loop: `npm run playtest:fast` (~20 s) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten · apparat · betriebsgesetz) · `npm run lint` /
`format:check` · Navigation: `npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in
package.json. Commits klein + thematisch, emoji-frei, deutsch — **die Message ist der
Chronik-Eintrag**; Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/PFLICHT-OFFEN.md` = die Frozen-Liste (die EINE Offen-Wahrheit, max 5) ·
`docs/roadmap.md` = der Kompass (§0 spiegelt die Frozen-Liste + Narben · Teilsysteme · Samen) ·
`docs/studio-vertrag.md` = die Naht (normativ) · `docs/taille-spec.md` = die Taille (normativ) ·
`docs/neues-kleid-verfassung.md` = die Pipeline-Verfassung (normativ) ·
`docs/das-lebendige-feld.md` = der wahre Norden (vor Feld/Emotion/Nexus/DSL zuerst) ·
`docs/state-of-realm.md` = Vision · `docs/abnahme-drehbuch.md` = die EINE Schöpfer-Runde ·
Chronik + alles Gefallene: `git log`.
