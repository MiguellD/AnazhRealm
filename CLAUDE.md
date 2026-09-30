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

## Stand (V18.495.0 — die Ziellinie steht, das Analog-Bild ist nachgeschärft)

**DIE ZIELLINIE (docs/roadmap.md §0.v1):** v1.0 = EIN gespielter Pfad — ankommen · laufen+sehen
· in der Werkstatt bauen · mit der KI erschaffen (Satz → Rezept-Katalog → Foundry-Asset) ·
benutzen/teilen — bei p95 ≤ 33 ms auf dem Schöpfer-Holz (Flugschreiber-Trace). Feature-Stopp
bis dahin. V18.492 hat den Boden wieder fest gemacht (Grok-Literal-Welle zurück, Gras-Abschied
ganz, alle Gates grün — Details im Commit). **Schritt 4 GEBAUT (V18.493):** DSL-Op
`spawn_studio` (Wort → Bauplan über `_studioBlueprintForWord`, EIN Stempel `_studioStampFor`,
geerdet + nie im Wasser, Position `near_water`); das KI-Prompt lehrt die LIVE-Wörter aller
Studios; der Satz „pflanz mir einen eichenhain am wasser" wirkt auch ohne Schlüssel; Claude-
Modelle auf der 5er-Generation. Offen: der echte LLM-Lauf mit Schlüssel (Drehbuch-Schritt 18).

**V18.494/495 — die Analog-Wette GEMESSEN und NACHGESCHÄRFT (echter Renderer, `diag-beweis-e`,
Mesh-Stand 19.07. vs. HEAD an denselben Bühnen der Mess-Wiese −900/−850):** 7–46× weniger
Dreiecke (Median ~15×), 2,6–8× weniger Draw-Calls je Bild. V18.495 heilte die Bild-Fehler an der
Wurzel: das Feld las nur 2 von 5 Lichtquellen (jetzt `_feldLichtSync`, Linse Feld/Mesh 0,67 →
0,98); jedes Welt-Haus war eine schwarze 3×3-m-Flachdach-Hütte (`Number(null) === 0` im
Fachwerk-Fit, Holz fraß Wand + Dach, Hex roh als linear); in der Hand-Blase zeichneten Mesh UND
Feld, über Budget baute sie nie (jetzt Stufe 0 = echtes Mesh, Takt-Garantie); Kronen-Noise ∝
Kronengröße. Frühjahrsputz: Doku + tote Skripte −3 371, Kommentar-Diät −15 847 Zeilen
(Token-Strom byte-gleich). Ehrlich offen: nah bleiben Kapsel-Tiere und Lappen-Kronen grob, das
Feld hat keinen Schatten, D (Wiese) und ein sauberer Haus-Schuss — `docs/abnahme-analog.md`.

**WAS STEHT:** TERRAIN = Funktion (Ring · Panorama · Feld-Pass; Chunks = Iso-CACHE) · WELT-MARCH:
EIN Pass, zwei Payloads (Analog-Primitive Kapsel+Box · Voxel-Brick nur als Region-Fern-Cache) ·
KREATUREN/BÄUME/ARCHITEKTUR/STREU ≥ Stufe 1 = Analog-Sätze (Baum = Stamm + Hauptäste als Kegel +
Kronen-Lappen) · GRAS = Boden-Funktion · Stufe 0 = echte Geometrie (Anfassen). HYBRID (ehrlich):
Band-0-Klein-Streu · Deko-Impostor-Ringe · der Avatar. OFFEN: ein echter GPU-Trace der
Analog-Wende auf dem Schöpfer-Holz (letzter: 14.07., 4–12 FPS, vor der Wende).

**PFLICHT-OFFEN (Spiegel — Wahrheit: docs/PFLICHT-OFFEN.md):** A–D Code steht (A/B/C mit Bild,
D ohne besonnte Gras-Zone) · E gemessen; offen: Haus-Schuss, Wiese, echter GPU-Trace.

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
    Pläne fallen (git trägt sie), dauerhafte Lehren = EINE Zeile hier, Offenes = PFLICHT-OFFEN.
    Vor jedem Datei-Schnitt: KONSUM prüfen (Gates/CI/Docs, transitiv), nicht Existenz raten.
16. **Der Null-Renderer ist für den GANZEN Analog-Pfad blind** (Feld-Fit, Slots, March kehren
    headless früh zurück) — Analog-Befunde nur mit echtem Renderer (`diag-arch-feld`,
    `diag-beweis-e`). Ein Fit liest eine FERTIGE Quelle (Foundry-Flat), nie ein temporär gebautes
    Async-Mesh („leer" → ausgebrannt → für immer unsichtbar); Takt-Budgets gehen NAH zuerst.
17. **Sonden mit echtem Renderer:** je Schuss ruht der Spiel-Loop (sonst wandern Kamera, Tageszeit,
    Cull-Zustand), die Schatten-Map wird neu markiert, die Blick-Wahl sucht freie Sicht. Und:
    `Number(null) === 0` — ein fehlender Wert ist nie 0; Default-Helfer prüfen `v == null` zuerst.

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
