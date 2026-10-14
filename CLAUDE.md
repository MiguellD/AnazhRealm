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
10. Nach jeder Fehler-Klasse baue die LINSE, die den Täter beim NAMEN nennt — vorher ROT am Täter,
    in einer bestehenden Familie, mit Selbsttest, ≤ 3 min CI und benanntem Konsum-Leser — baue nie auf
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

## Stand (V18.546.2 + das Bündel vom 14.10. + weiche Boden-Stufen — offen ist NUR, was `docs/PFLICHT-OFFEN.md` trägt; die Chronik ist `git log`)

**ZIELLINIE (docs/roadmap.md §0.v1):** v1.0 = EIN gespielter Pfad — ankommen · laufen+sehen · in der Werkstatt bauen · mit der KI erschaffen
(Satz → DSL-Op `spawn_studio` → EIN Stempel `_studioStampFor`; offen: der LLM-Lauf mit Schlüssel, Drehbuch-Schritt 18) · benutzen/teilen — bei
p95 ≤ 33 ms auf JEDEM Standardgerät (Richter: das Profi-Band, „richter ist nicht mein rechner"). Feature-Stopp bis dahin.

**PFLICHT-OFFEN (Spiegel — Wahrheit: docs/PFLICHT-OFFEN.md):** B Ankunft ≤ 5 s kalt (am Kopf Weltbild kalt 27,9–29,8 s) · E Profi-Band
(Radeon 890M + GTX 1060, Wiese + Genesis, Ego + Third):
an der GTX hält das Bündel Frame p95 16,7–16,8 ms · ≤ 191 Befehle · ≤ 587k Dreiecke · ≤ 104 MB VRAM und reißt den CPU-Takt p95 (6,0–7,8 > 5,8 ms);
das Radeon-ABAB am Kopf steht aus. Quelle: das letzte ABAB vom 14.10. (Zweig `koordination` 1ae7ef17) und `bericht/1410-1-instanz.md`.

**Das Bündel gegen V18.545** (das letzte ABAB, GTX, Regler voll): an allen vier Orten × Sichten schneller — fps Genesis Ego 52 → 100, Wiese Ego
79 → 99, VRAM −18 bis −28 MB, Dreiecke −0,10 bis −0,37 M; die Zahl jeder Welle steht in ihrer Merge-Message (`git log --first-parent 9fb869a5..`).

**WAS STEHT — je Domäne die EINE Quelle:**
- TERRAIN = Funktion: Höhe, Landform und Flussnetz = EIN Gelände-Kern `gelaende-core.js` (Stamm · Worker · Studio · Playtest), Chunks = Iso-CACHE
  mit EIGENER Stufen-Kette (`BODEN_STUFEN`; der Wechsel morpht deckungsgleich nach CDLOD, K51), Wildnis = EIN Term · WELT-MARCH EIN Pass · WASSER EINE Wahrheit
  (`_werkBoden`), die Ruhe ist der Fixpunkt des Automaten (`_ensureWaterCALevel`), sein Blick EIN Baustein (`_wasserBlick`) · Edits = EINE Karte je
  Chunk (`_voxelEditKarte`) · ORT: der Genesis-Platz (`GENESIS_PLATZ`), jedes Bauwerk und jeder Dorfweg sind Grundriss gegen Natur,
  das Dorf EIN Plan des Fachwerk-Studios auf dem Gelände-Kern (`_ortPlaene`), jeder Wurf des Felds weicht ihm (`FELD_WURF`, `_weichtDemBau`)
- GESTALT < 64 m Studio-Mesh + LOD-Kette, EIN Auge der Stufen (`_lodAuge`), jede Karte eine Schicht des EINEN Atlas, fern Glieder-Kapseln · jede Senke
  zeichnet über ihren Zeichner (`_instanzZeichner`: count 1 über einer InstancedBufferGeometry-Fassade, Matrizen im Storage-Puffer) · Baum = Studio-Karte
  bis 384 m, EINE Ableitung aus `treeParams`, der gefühlte Baum ihr Skelett (`skelettDerGestalt`), EIN Wind-Term über die Naht `_weltNaht`, Blende je
  Instanz, laut (`_blendeBruch`) · Haus und Tor fern NUR-WURF, das Fenster Glas in jeder Stufe, der Tor-Hinterflügel eine Instanz (`_foundryFluegelInstanz`)
- BODEN Rausch-Gesetz, Fels und Halm-Schichten als reine WGSL-Funktionen, EIN Leser `_bodenSichtAt`, Fels-Stoff im Worker (`_felsStoff`) · LICHT EIN
  Leuchtquellen-Gesetz (`kelvin`, EIN Pool) · EIN Himmel · EINE Koschmieder-Luft · Schatten 2 Kaskaden (`_schattenBias`), EIN Werfer je Gestalt · Sätze
  EIN Pool je Stoff, EIN Programm je Signatur · Bündel in EINER Reihe (`_buendelReihe`), ihre Kinder nach Stufe und Abstand (`_buendelKinderReihe`)
- KOSTEN die EINE Skala (TAAU: `SZENE_SKALA` 0,75, Spieler-Wahl `state.szeneSkala`, `_zeitAufloesung` auf volle Ausgabe) · `_passTrifft` + `_wahlHaelt`
  · `_schirm` · `TAKT_DECKEL_S` · Takt-Nähe `_blockerUmPlatz` · Boden-Satz `_satzPacke` · `_instanzAbschied` + `_gpuKehraus` · `_foundryAuftrag` ·
  `_foundrySchale` · BRUCH = EIN Melder (`_stoffBruch` → `_bruchMelden`) · ANKUNFT = EIN Schreiber des ersten Weltbilds (`_weltbildSteht`)
- STUDIOS auf der EINEN Hülle `worlds/huelle` (Regler · Sitzung · Kosten-Leiste · Portal-Brücke), Labor = Welt · LEBEN EIN Leib-Löser, Gang EIN Gesetz ·
  Kamera EINE Kugel · Tod `_kreaturFaellt` · Lebenswerte = Zustand (`recomputePlayerStats`) · Blocker-Netz · Klang-Gesetz · Uhr + Wetter = Spieler-Wort ·
  SPEICHER atomar (tmp + Rename + .bak)
- PRÜFEN 6 Golden-Sätze + Ofen · Messorte (`spec/profiband/haushalt.json`): Wiese −900/−850 (seit K16 ein Nadelwald-Hang; K55 `mess-wiese` setzt sie
  nach −278/−1038, ungemergt — das letzte ABAB maß dort per Patch), Genesis-Ring (`_genesisMitte`), Dorf, Prüfbühne `spec/pruefbuehne` · 12 Ratschen
  Ort × Gerät × Sicht · Linsen-Start `lib/software-gpu.cjs` (`linsenWebGpuArgs`: lokal die echte GPU, CI swiftshader) · das Beweisbild urteilt selbst
  (`lib/abnahme-urteil.cjs`) · CI: Puls je Push, volle Batterie in 18 Gruppen (1–8 CPU, 9–18 GPU; Playtest = Gruppe 1, Wand-Zeit ≤ 8 min) auf integ-probe, main und nachts

## Architektur (die Karte)

- **Stamm** `stamm/` (~110k Zeilen in 48 Dateien ≤ 4 000 Z., EINE Klasse, EIN Prototyp): der Kern `stamm/01.js` (Konstruktor + §01),
  die Zonen-Klassen `stamm/NN[x].js`, die Naht in `stamm/26a.js` trägt sie beim Laden auf `AnazhRealm` (VERSION allein dort); die Liste =
  die Stamm-Tags in index.html; `npm run atlas` die Karte live (+ `--find`), `diag-atlas --check` die Ratsche. Boden · Speicher · Spieler ·
  Anschluss + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10 Dateien, cores.manifest.json): Daten+Mathe, Vertrag v1.2 `PARAMS_BY_KIND` + must-ignore + fail-closed (`docs/studio-vertrag.md`); der
  Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi). **Studios** `worlds/`: die Gesetzbücher und Nebenwelten auf der EINEN Hülle `worlds/huelle`.
  **Worker:** Foundry lädt die EINE Brücke `foundry-bruecke.js` (`get-book` 1×Boot · `build-asset(id,seed,lod,ov)` · `export-settlement`; IDB
  disk-first, SHA-Stempel der Quellen) · voxel-worker. **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling
  (WS→WebRTC; pos · input-Lockstep · dsl · soul · vibe).

## Die tragenden Lehren (die Nummern sind Anker — der Code zitiert sie)

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die LINSE (Gebot 10) in einer bestehenden Familie.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch; must-ignore gilt FREMDEN Artefakten (Taille),
   nie dem eigenen System; `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes;** der Schöpfer wertet Ergebnisse, nie Optionslisten oder Fragen; ein benannter Fehler → die ganze
   KLASSE; fast Gebautes wird zu Ende gebaut und gemergt, bevor Neues beginnt (Maß: gemergter, sichtbarer Fortschritt je Token).
5. **Miss zuerst, KONSUM statt Existenz, SPIELE vor behaupten** (headless beweist Mechanik, nie das Erlebnis; schauen schlägt greppen);
   Beweisbilder aus dem AUSGABE-Pfad (`scripts/lib/ausgabe-aufnahme.cjs`) — ein eigenes Render-Target ist linear und ungetont (r184).
6. **Tests wandern mit dem Code;** Absenz-Greps über `window.__codeOf` (Kommentare dürfen Gefallene zitieren); eine Linse, die Code am Rumpf-TEXT
   einordnet, fällt mit dem Schnitt, den sie bewacht — Zugehörigkeit gehört an eine Liste oder Laufzeit-Marke; eine Sonde ohne Messung ist ROT.
   Eine Linse, die abstürzt und Exit 0 meldet, ist still grün (`gate:nah-fern` seit K16, b0df2d93): jedes Werkbank-Tor bricht bei Linsen-Fehler ROT.
7. **Gesetz statt Spiegel:** die Höhe ruft EIN Gesetzbuch (`gelaende-core.js`, Lage = Worker-`state` bzw. `_gelaende()`); ein Worker-Spiegel ist
   bit-identisch (Sheet/Density in BEIDE, `diag-worker-watersheet` maxDiff 0, `gate:worker-dichte` auch über dem Band); Substanz aus
   Γ5-Seed-Streams, nie `Math.random`; ein Zwillings-Abdruck ist ein MUSTER über jede Datei und jedes Skript, nie ein Variablen-Name.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; Tiere bewusst tag-identisch, Differenzierung über Größe/Gattung, nie über Tags).
9. **Exit-Codes IMMER explizit** (`echo EXIT=$?`) — `gate | tail` maskiert sie; Backslash-Ersetzungen (Regex, WGSL) nur per Edit-Werkzeug.
10. **Jede versionierte Datei trägt den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS:** die Benchmark bewegt sich nie, Goldens eingefroren (Re-Mint = Vertrags-Akt); Kerne außerhalb von
    format:check, nie `prettier --write` auf Gesetzbücher (verbatim-Blöcke), neue Abschnitte additiv; `__`-Schlüssel in ov sind Steuer-Passagiere.
12. **Stamm-Chirurgie:** Werkzeug liest den Stamm NUR über `scripts/lib/stamm.cjs` (`text()` = der virtuelle Stamm, `ort()`, `dateiVon()`;
    die alte Datei `anazhRealm.js` ist tot, ein Leser auf ihren Namen ist ROT); über der Decke `node scripts/stamm-umzug.cjs --teile §NN
    <methode>`, ein Zweig von vor dem Schnitt zieht per `stamm-rehome` um; `cut-method` (AST-sicher) · sofort `diag-atlas --check` +
    `npm run stamm:lint` · seriell committen, nie Batch; Arbeiter zweigen vom Kopf von integ-probe ab, nie von einem ungemergten R3-Zweig
    (gestapelte Zweige erben jede Röte).
13. **Der Loop:** Streaming prio 0, Bewegung nie am Render-Signal; EIN PID, Totband 59–77 fps; NaN-Wand vor jedem EWMA; Existenz vor Framerate
    (der Ring wächst bis `RING_EXIST_FLOOR` ohne fps-Gate, der PID atmet nur darüber).
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron auf dem Interaktions-Pfad (der Chunk-Stoff
    entsteht im Worker, nie im Haupt-Thread).
15. **git ist das Archiv:** kein Doppel-Archiv im Baum; Chronik = Commit-Message (Rumpf ≤ 600 Zeichen), vollendete Pläne fallen, Lehre = EINE
    Zeile hier, Offenes = PFLICHT-OFFEN; vor jedem Schnitt KONSUM prüfen (transitiv).
    Siegel-Wörter meiden auch Auftrags-, Zweig- und Bericht-Namen: der Name wandert in die Merge-Message, und die liest `gate:betriebsgesetz` am HEAD.
16. **Der Null-Renderer ist blind** für Feld-Fit, Slots, March — Analog-Befunde nur mit echtem Renderer (`diag-arch-feld`, `diag-beweis-e`); ein Fit
    liest eine FERTIGE Quelle (Foundry-Flat), nie ein Async-Mesh (leer → ausgebrannt → für immer unsichtbar); Budgets: Lehre 25.
17. **Sonden mit echtem Renderer:** je Schuss ruht der Loop, `__buehne` hält Mittag · Sonne · Sommer (Wetter-Zug 120 s, Saison-Drift 2400 s),
    die Schatten-Map wird neu markiert, die Blick-Wahl sucht freie Sicht; `Number(null) === 0` — Default-Helfer prüfen `v == null` zuerst;
    swiftshader (CI) verbirgt Präzisionsfehler echter GPUs (Fern-Ring 3,5 m auf 8 km nur auf der Radeon) — Bild-Urteile auf echter Hardware.
18. **Erst das Soll-Bild, dann die Welle:** Referenz + Budget (Tris/dc je LOD) + EIN Spike mit echtem Renderer an der Mess-Wiese, nah UND fern.
19. **Kosten gehören ins Asset:** ein LOD, das nicht reduziert, heilt am Studio, nie im Host; was die Lab-Karte trägt, trägt kartenlos der Vertex
    (die Welt liest nur Vertex-Farben); Labor = Welt: das Labor zeigt den Körper, den der Ofen der Welt baut (K45: Labor-Wolf L0 1 299 852 → 54 894,
    d7559531). Nach Push die CI lesen; Zeitfrist-Läufe nie parallel; kein Warter trifft sich (`pgrep -f "[x]yz"`).
20. **Eine Frage, kein Neustart:** Look-Fragen an die Werkbank (`scripts/werkbank.cjs`: EINE Welt offen, Methode live tauschen, Bild ~45 s), nur
    bei eingefrorener Welt; Richter je Commit bleiben die Beweis-Sonden.
21. **Die Licht-Kette ist EINE Eichung:** Paletten-Hex = sRGB, Albedo linear (FARB-GESETZ: foundry-core, fachwerk · porta · vehicle · schmiede); die
    Welt fügt nur den echten Himmel als EINE Umgebung hinzu, Fill · Rim · Back leben im Labor; Belichtung aus dem Licht (Karte Mittelgrau +1 EV,
    Nacht-Deckel 1,0); Albedo `werkbank albedo` / `diag-albedo-zensus` (Karte 0,180), Verhältnisse `werkbank licht` — nie das Auge.
22. **Der sichtbare Boden ist das Mesh:** Surface-Nets auf 1,8 m trägt die Feinform nicht (±0,2 m); was AUF dem Boden steht, liest `_bodenSichtAt`
    (gebautes Mesh, je Ecke die oberste Fläche aus Eigner und Nachbarn), Körper stehen auf dem Gesetz; r184 rechnet den positionNode VOR der
    Instanz-Matrix (am Vendor entschieden, integ-547 08b57ed8; `gate:foundry-impostor` C4): dort sind `positionLocal`, `normalLocal` und `positionWorld` Vorlage — wer die Welt
    braucht (Wind, Blick der Karte, Blende), liest die EINE Naht `_weltNaht`; Höhen-Gewichte lesen `positionGeometry`.
23. **WebGPU zieht jeden Draw einzeln:** BatchedMesh = `drawIndexed` je Instanz, ein Puffer ohne Namen heißt `NodeBuffer_<id>` (je Geometrie ein
    Programm), der Bundle-Replay bucht nichts ins Info (`werkbank zaehlen`). Ein Bundle trägt nur, was sein Replay refresht: `_renderScene` stapelt
    `_currentRenderBundle`, nimmt unter overrideMaterial nie auf; die Diät geht jeden Knoten EINMAL je Render-Abschnitt, Stempel = (Render-Id,
    `info.calls`), gewechselt beim Betreten UND Verlassen jedes Renders (`gate:kamera-treue`); BundleGroups zeichnen in Szenen-Reihenfolge vor losen
    Objekten — ihre Reihe ist ein Gesetz (`_buendelReihe`), nie die Ankunft beim Boot. Die GPU-Zeit trägt die Pixel-Arbeit, nicht die Befehls-Zahl:
    die Szene rendert in der EINEN Skala (TAAU, `SZENE_SKALA` 0,75, kein zweiter Auflösungs-Regler; gpu-bank Genesis 33,9 → 18,3 ms, 8a00348e).
24. **Der Haupt-Thread trägt keine Bytes:** Worker-Antworten per Transfer (ein Klon kostet den Empfänger je MB), die Platte im Worker (ein IDB-Put
    serialisiert synchron im Aufrufer), über den Kanal nur `FOUNDRY_LESEN` (`_foundrySchale`, `werkbank fluss`).
25. **Der Takt kostet, was ihn betrifft:** billige Filter zuerst, teure Rechnung nur für Betroffene; geteilte Budgets NAH zuerst über ALLE
    (`_weltBakeErlaubt(d2)`), nie verhungert (Nah-Schwelle die erste Fenster-Hälfte, eine Zähl-Hülle reicht die Argumente durch); die Foundry-
    Schlange `_foundryAuftrag` (12 im Flug, nah zuerst, nie FIFO) — `werkbank takt` zerlegt.
26. **Der Schatten liest, was das Auge sieht:** der r184-Schattenpass (Kaskaden-Kamera) liest nur colorNode.a · map.a · maskShadowNode, nie
    opacityNode — LOD-Masken vom Auge (`uLodAuge`), Ausschnitte in colorNode.a (`gate:foundry-crossfade`); Bundles nach jedem castShadow-Wechsel
    neu. Ein normalNode liest nie `normalWorld` (EINE Variable je Programm), sondern `normalWorldGeometry` × `faceDirection`. CPU-Raster-Linsen
    fahren `?holz=kienspan` (swiftshader kompiliert synchron, 42–292 s je Pipeline); `_gameLoopTick` rendert selbst, darum trägt jeder benannte
    Linsen-Aufruf höchstens EINEN kalten Programm-Schlüssel (`gpu-lens`); Wände urteilen in Bau-Ereignissen, nie in Wanduhr-Sekunden.
27. **Die GPU hält, was das Bild zeichnet:** r184 hält jedes Attribut (`info.memoryMap`) bis `_attributes.delete` — `InstancedMesh.dispose()` gibt
    nichts frei, `geometry.dispose()` nur das erste Render-Objekt, dessen Geometrie-Hörer fällt (`_renderObjektRegister`), jede Textur hält die
    Bindegruppen ihrer Leser; Senken fallen über `_instanzAbschied`, Ungezeichnetes nimmt `_gpuKehraus`, ein Attribut unter der Observer-Diät nie
    (ohne Versions-Sprung lädt sie nichts neu); `werkbank puffer` nennt jeden Halter, `buf:ruhend` / `buf:verwaist` sind Lecks (`gate:profiband`).

## Workflows und Karte

`playtest:fast` (~20 s) · Merge-Gate `npm run playtest` („Alle Invarianten OK" zählt, nie der Zähler) · `npm run check` (source-probes ·
constitution · studio-vertrag · altlasten · apparat · betriebsgesetz) · `lint` / `format:check` · `npm run atlas` (+ `--find`). Lokal der Puls der
berührten Methoden + playtest:fast; der Integrator fährt den VOLLEN Playtest je Merge, die volle Batterie einmal je Version; gemergt bei grüner
Zweig-CI. GPU-Zeit nur `gpu-bank` (OMEN = GTX 1060; die Radeon 890M lokal per `werkbank --echt`), A/B bei gleicher Szene oder ≥ 4 Boots je Seite;
Aufträge und Berichte der Messplätze leben im Zweig `koordination`, nie in main. Commits klein, deutsch, emoji-frei, die Message ist der
Chronik-Eintrag; PR nur auf Wunsch. Docs: `docs/README.md` ist die EINE Karte (Norm · Vision · Tisch · die Offen-Wahrheit `docs/PFLICHT-OFFEN.md`).
