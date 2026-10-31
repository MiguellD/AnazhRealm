// Gruppe IV — Schöpfung (Meisterkarte 2.0, Stand main dc6702ab)
module.exports = {
  gruppe: {
    key: "schoepfung",
    titel: "IV · SCHÖPFUNG — die Studios, die Pipeline, die KI im System, Spieler-Bauen",
    intro: "AnazhRealm erzeugt nichts, was ein Studio kann: die acht Gesetzbücher sind die Werkstatt, die Welt ist Boden, Speicher, Spieler, Anschluss. AAAA heißt hier: ein Griff im Studio, ein Satz an die KI oder drei Klicks des Spielers stehen binnen einer Sekunde als dasselbe Werk in der Welt — aus Kilobytes Gesetz, ohne Asset."
  },
  bereiche: [
    {
      key: "studios",
      titel: "Die acht Studios — Gesetzbücher auf der EINEN Hülle",
      dom: "`worlds/huelle` · `worlds/*` (terrain, garage, portale, schmiede, fachwerk, klang, koerperstudio, tetrapoda) · `docs/studio-vertrag.md` · `scripts/diag-studio-huelle.cjs`",
      v1: "v1 (in der Werkstatt bauen) · A (haus: Labor ≠ Welt)",
      aaaa: "Acht Gesetzbücher — Bäume, Wagen, Tore, Waffen, Häuser, Klang, Mensch, Tier — auf EINER Hülle: jeder Regler des Vertrags (heute 112 Zeilen, dazu die Baum-Regler) verändert das Werk sichtbar bzw. hörbar; ein Griff zeigt das Werk in ≤ 200 ms (Gesetz-Wert) bzw. ≤ 1 s (Neubau) auf Radeon 890M und GTX 1060. Daneben steht das Thermometer mit GEMESSENEN Dreiecken, Befehlen, VRAM und GPU-ms (±5 %), A/B gegen den gebauten Stand und eine Sitzung, die das Neuladen übersteht. Die Bühne rendert mit der Welt-Engine (r184, Welt-Stoffe, Licht-Gesetz, Welt-Bauer): dasselbe Werk zeigt in Studio und Welt ≤ 2,1 % Bild-Differenz. Ein neuntes Gesetzbuch dockt über den Vertrag an, ohne dass der Wirt eine Zeile lernt. **Wo wir die Besten schlagen:** UE und Unity trennen Editor und Spiel durch Import und Cook, Houdini braucht ein zweites Programm, Dreams kennt Hand-Skulptur statt Gesetz; bei uns ist das Studio dieselbe Engine und derselbe Bauer wie die Welt, das Werk ein Plan aus Bytes (Saat + ov).",
      beste: [
        "**Unreal Static Mesh Editor** (Epic): das Vorschaufenster zeigt die Zahlen der Spiel-Engine (LOD, ScreenSize, Dreiecke, Kollision); die LOD-Kette entsteht aus Regeln im selben Renderer wie das Spiel.",
        "**Unity Prefab Mode**: ein Asset isoliert oder im Kontext seiner Instanz in der echten Szene bearbeitet, Show Overrides zeigt die Abweichung, Auto Save schreibt jede Änderung sofort.",
        "**SideFX Houdini Engine + Performance Monitor**: HDA-Parameter im UE-Editor, live neu gerechnet; der Monitor zeigt je Knoten die Rechenzeit; Far Cry 5 baute so ≈ 100 km² Wildnis im Dunia-Editor.",
        "**Media Molecule Dreams** (PS4 2020): das Schöpfer-Werkzeug IST die Spiel-Engine, jede Schöpfung spielt sofort, das Thermometer zeigt die Kosten der Szene gegen eine feste Decke."
      ],
      kriterien: [
        {
          name: "Jeder Griff wirkt sichtbar oder hörbar — das ganze Gesetz in der Hand",
          punkte: 0,
          staffel: "1 = ≥ 80 % der Zeilen von PARAMS_BY_KIND wirken am Bild bzw. Ohr · 2 = 100 % — der Nenner ist die Zeilen-Zahl bei der Messung (eine Ratsche, die nur wächst, mit den Baum-Zeilen)",
          messung: "gate:regler-wirkt (`scripts/diag-regler-wirkt.cjs`) baut je Zeile L0 bei min und max über den echten Bauer; Wirkung = ≥ 1 % der Gestalt-Pixel mit ΔLuma > 18 im Ausgabe-Bild (ausgabe-aufnahme, Radeon 890M), beim Klang der Spektral-Abstand des Klang-Gesetzes, beim Grip die Seitenkraft im fahrSchritt.",
          beleg: "Am Bild ungemessen. Vorwert am Bau-Hash: 95 von 112 (spec/vertraege/ratsche.json reglerTot 17: klang 7/7, porta energy·fractal·reflect·swirl·temp·tunnel·twist·wave, schmiede schaftR, vehicle grip). Der Baum, das meistgesehene Werk, hat in PARAMS_BY_KIND keine Zeile (`foundry-core.js:5039-5053` trägt nur flower und grass).",
          schlupfloch: "Ein Regler verschiebt Bytes, aber nicht das Bild (0,1 mm), und zählte am Hash: die Bild- bzw. Ohr-Schwelle. Ein toter Regler wird gestrichen statt geheilt: die Zeilen-Zahl ist eine Ratsche, ein Streichen ist ROT, außer der Schöpfer nimmt das Gesetz zurück. swiftshader-Bilder zählen nicht (Lehre 17).",
          aenderung: "Der Nenner war „fest 112“ und schloss die Baum-Zeilen aus (B42)."
        },
        {
          name: "Griff → Bild ohne Warten, eine Sitzung, die bleibt",
          punkte: 1,
          staffel: "1 = Undo/Redo wirkt in 8/8 Studios · 2 = p95 Griff → erstes Bild mit neuem Bau-Hash ≤ 200 ms (Zeilen mit `uniform: true` im Vertrag) bzw. ≤ 1 s (Neubau) auf beiden Geräten, dazu A/B und Persistenz über das Neuladen in 8/8",
          messung: "Gang-Probe in diag-studio-huelle --engine: je Studio 20 zufällige Griffe, nie zweimal derselbe Wert; Zeit vom Eingabe-Ereignis bis zum ersten Ausgabe-Bild mit neuem Bau-Hash. Ob eine Zeile die 200-ms-Schranke trägt, steht je Zeile im Vertrag (`uniform: true`, Byte-Beweis), nie in der Messung.",
          beleg: "H3 im CI-Gang: „8 Sitzungen wirken“ (1972da18, Schieber → Strg+Z → der Wert kehrt zurück). A/B nur im Gelände-Studio und als Klang-Blindtest; Persistenz 0 Treffer für localStorage/sessionStorage/indexedDB in `worlds/huelle/huelle.js`; die Entprellung frisst das Soll allein: ruheMs 180 (`huelle.js:137`), Kosten-Leiste 500 ms (`:608`).",
          schlupfloch: "Den JS-Rückruf stoppen statt des Bilds, einen gecachten Wert wiederholen, oder jeden Regler „Neubau“ nennen, um die weiche Schranke zu bekommen: das erste Bild mit NEUEM Bau-Hash, nie wiederholte Werte, die Klasse je Zeile im Vertrag (B43).",
          aenderung: "Die Schranken-Klasse je Zeile steht im Vertrag (B43)."
        },
        {
          name: "Kosten-Wahrheit am Griff — das Thermometer",
          punkte: 0,
          staffel: "1 = Dreiecke ±5 % gegen renderer.info in ≥ 4/7 Mesh-Studios · 2 = Dreiecke, Befehle, VRAM und GPU-ms ±5 % in 7/7, beim Klang die Audio-Graph-ms",
          messung: "Kosten-Leiste je LOD-Stufe gegen unabhängige Zähler: renderer.info in einem eigenen Render-Abschnitt (Stempel nach Lehre 23), info.memoryMap je Werk-Attribut, gpu-bank.",
          beleg: "`zaehle` (`worlds/huelle/huelle.js:488`) zählt Dreiecke, Stoffe, Meshes, Werfer am gebauten Objekt — ohne Gegenzahl; unter „Befehle“ steht b.draws, die Budget-Zeile des Kerns (`huelle.js:571`); VRAM und ms fehlen.",
          schlupfloch: "Budget-Zahlen als Messung ausgeben (heute b.draws): eine Leisten-Zahl ohne Gegenzahl zählt 0.",
          aenderung: "Die 1 der Synthese war die Existenz von zaehle() ohne Gegenzahl (B44) → 0."
        },
        {
          name: "Studio = Welt im Bild — EINE Engine, EIN Licht, EIN Bauer",
          punkte: 0,
          staffel: "1 = ≥ 3/7 Mesh-Studios mit Bild-Differenz ≤ 2,1 % und Albedo Labor/Welt im Rand 0,10 · 2 = 7/7 auf beiden Geräten",
          messung: "Dasselbe Werk (Saat + ov) in Studio-Bühne und Welt bei gleicher Pose (Standard-Kamera der Bühne = Vorschau-Kamera der Welt) und Uhr, aus dem Ausgabe-Pfad (bild-diff.cjs-Rezept), Radeon UND GTX; die 18-%-Karte der Bühne bei Luma 110–130.",
          beleg: "Am main ist keine Bild-Differenz Studio gegen Welt gemessen (die 0,28 % gehörten zur zurückgenommenen S1-Garage, 8a00562e → Revert 876feb6f). Sechs Studios zeichnen mit eigener r128-WebGL und ACES (`fachwerk.js:560`, `koerperstudio.js:78`, `porta.js:134`, `schmiede.js:11`, `tetrapoda.js:225`, `terrain/phytogenesis.js:531`); im Tetrapoda-Studio brennt die 18-%-Karte auf 255/255/255 (albedo-tafel.json karten.tetrapoda).",
          schlupfloch: "r184 laden und eigenes Licht oder eine Bau-Kopie behalten: H6 wäre grün, Labor ≠ Welt bliebe — darum urteilt das Bild, nie die Netz-Anfrage; eine Pose, die niemand sieht, zählt nicht.",
          aenderung: "EIN Heim von Labor = Welt im Bild (vorher auch Material K2, Tore K3(b), Siedlung K1; B39, V16)."
        },
        {
          name: "Ein neuntes Gesetzbuch dockt an, ohne dass der Wirt eine Zeile lernt",
          punkte: 0,
          staffel: "1 = ein Probe-Gesetzbuch (Fixture-Kern in spec/ mit PARAMS_BY_KIND und Bauer) steht über die Werkstatt in der Welt mit LOD-Kette, Kosten-Leiste und Speicher-Rundlauf, `git diff stamm/` = 0 · 2 = auf allen Wegen (Werkstatt, KI-Satz, Foundry, P2P), und der Atlas nennt seine EINE Quelle",
          messung: "Probe-Gesetzbuch aus spec/ über alle Wege; der Diff am Stamm ist die Zahl.",
          beleg: "Vertrag v1.2 (`docs/studio-vertrag.md`: PARAMS_BY_KIND, KIND_POLICY, must-ignore, fail-closed); die Übergabe kennt eine Positivliste (`stamm/netz-portal.js:1276`: koerper, kreatur), der Wirt kennt Arten beim Namen (Werkstatt-Wege, `_studioBlueprintForWord`). Ungemessen.",
          schlupfloch: "Eine Art, die über einen Sonderweg im Wirt andockt, bestünde den Weg und bricht das Wesen („AnazhRealm erzeugt nichts, was ein Studio kann“): die Probe verlangt 0 Zeilen im Stamm.",
          aenderung: "Neu (V11) — das Tor des Studios zählt im Bereich Tore (V15)."
        }
      ],
      hebel: [
        { name: "Die Bühne als EIN Baustein der Hülle (Garagen-Muster): Welt-Renderer, Welt-Bauer, Licht-Gesetz, Kosten aus renderer.info — die Shells werden aufgelöst", k: ["studios.K4+1", "studios.K3+1"], t: [5, 6], wurzel: "`worlds/huelle/huelle.js`: neu buehne(kind) neben kosten (`:515`), aus `worlds/garage/garage.js:16` (WebGPURenderer + buildInstance-Werk); es fallen die Shell-Renderer fachwerk.js:560, schmiede.js:11, porta.js:134, tetrapoda.js:225, koerperstudio.js:78 — die isolierte Studio-Seite bleibt (Schöpfer 18.10.).", pflicht: "A (haus: Labor ≠ Welt)", v1: true },
        { name: "Regler-Wirkung am Bild und Ohr; die 17 toten Regler heilen am Kern, die Baum-Regler kommen in den Vertrag", k: ["studios.K1+2"], t: [2, 3], wurzel: "`scripts/diag-regler-wirkt.cjs` (Kanal Bild/Klang/Fahr statt Bau-Hash); porta-core.js (8), klang-core.js (7), schmiede-core.js schaftR, vehicle-core.js grip; `foundry-core.js:5039` PARAMS_BY_KIND bekommt tree aus treeParams, unter Byte-Beweis (Lehre 11).", pflicht: "A", v1: true },
        { name: "Griff → Bild-Probe zuerst ROT, dann die Sitzung am EINEN Chokepoint", k: ["studios.K2+1"], t: [1.5, 2], wurzel: "`worlds/huelle/huelle.js:315` sitzung (A/B nach `worlds/gelaende/studio.js`, Persistenz) und `:137` ruheMs (Gesetz-Werte ohne Ruhe); Probe in `scripts/diag-studio-huelle.cjs --engine`.", pflicht: "—", v1: true },
        { name: "terrain auf die Bühne: das Studio des meistgesehenen Werks zeigt den Welt-Baum", k: ["studios.K4+1"], t: [3, 3], wurzel: "`worlds/terrain/phytogenesis.js:531` (eigene WebGL) → huelle.buehne('tree'); der Baum aus dem Welt-Bauer (K4 → 7/7).", pflicht: "A (laub)", v1: true }
      ],
      feststeck: {
        versucht: "Die EINE Engine der Studios hatte drei Anläufe: S1 8a00562e (Garage als Modus der offenen Welt) fiel per Revert 876feb6f; dann garage-r184 isoliert (f27b04f0), H6 stieg von 2 auf 3 von 11 Seiten; Studios K1 blieb über vier Karten-Stände bei 0. Das Kriterium belohnte das Portieren („lädt kein r128“), der Weg war ein Studio nach dem anderen (1–3 d je Shell, ≈ 9 000 Zeilen).",
        anders: "Die Shells werden aufgelöst statt gehoben: die Hülle bringt die Bühne als EINEN Baustein (Welt-Renderer, Welt-Bauer über die Foundry-Brücke, Licht-Gesetz, Kosten aus renderer.info); ein Studio ist danach Deklaration (Regler, Kamera, Lehren), das Werk IST das Welt-Werk — Labor = Welt durch Konstruktion, EIN bild-diff richtet."
      }
    },
    {
      key: "pipeline",
      titel: "Die Pipeline — Studio → Kern → Foundry/Ofen → Welt",
      dom: "`foundry-bruecke.js` · `stamm/studio-bruecke.js` (`_foundryAuftrag`, `_foundrySchale`) · `cores.manifest.json` · `stamm/netz-portal.js` (Übergabe) · `spec/vertraege/ratsche.json`",
      v1: "v1 (bauen) · B · E",
      aaaa: "Ein Griff in einem der acht Studios steht spätestens 1 s später als dasselbe Werk in der Welt: derselbe Bau-Hash aus Saat + ov, an seinem Ort, in jeder Stufe, für 8/8 Arten. EIN Foundry-Worker auf der Engine der Welt (r184-Kern, 0 KB fremdes three, kein synchrones XHR) baut jede Mesh-Art, der Ofen gießt Mensch und Tier, die Karte kommt aus EINEM Bäcker. Jede Stufe reduziert nach Gesetz (L1 ≤ 50 %, L2 ≤ 15 % der L0-Dreiecke) und hält ihr Budget an jedem Regler-Rand. Die Platte unter dem Gesetz-SHA trägt jede Lieferung: ein Zweit-Boot baut 0, eine Gesetz-Änderung baut nur ihre Art neu. **Wo wir die Besten schlagen:** UE kocht Assets in einen GB-Cache, Nanite zeichnet ein Asset billig, das Asset bleibt Handarbeit; No Man's Sky erzeugt 2^64 Planeten ohne Werkbank, an der der Spieler das Gesetz greift. Bei uns ist das Asset die Funktion (Kilobytes Gesetz), der Cache-Schlüssel der SHA des Gesetzes, und der Spieler hält das Gesetz in der Hand.",
      beste: [
        "**No Man's Sky** (Hello Games, GDC 2017 McKendrick „Continuous World Generation“): 2^64 Planeten aus einem Seed; EINE fortlaufende Kette Voxel → Polygon → Textur → Population → Simulation, kein Asset je Planet.",
        "**Unreal Engine 5 Nanite** („Lumen in the Land of Nanite“, 2020): Quell-Geometrie über 1 Mrd. Dreiecke je Bild, auf ≈ 20 Mio. gezeichnete reduziert — Kosten am Schirm, das Asset Handarbeit und GB-schwer.",
        "**Guerrilla Decima** (Horizon Zero Dawn, GDC 2017 van Muijden): Platzierung aus Dichte-Graphen zur Laufzeit; den Offline-Bake schaffte Guerrilla ab, weil Bake-Zeiten die Iteration bremsten.",
        "**SpeedTree**: EIN Asset trägt seine LOD-Kette (gemorpht mit dem Abstand, am Ende eine Karte mit Lichtzustand), typisch 3–4 Draw-Calls je Baum."
      ],
      kriterien: [
        {
          name: "Der Griff steht in der Welt: alle 8 Arten, byte-gleich",
          punkte: 0,
          staffel: "1 = ≥ 4/8 Studio-Seiten, deren Werk mit gleichem Bau-Hash in der Welt steht · 2 = 8/8, mit zufälligem ov je Lauf und jeder Zeile von PARAMS_BY_KIND",
          messung: "diag-studio-uebergabe für alle 8 Studios: im echten Studio ein zufälliges ov, „In der Welt ansehen“; in der Welt trägt das nächste gesetzte Werk derselben Art denselben Bau-Hash wie die Bühne. Reload zählt Speicher K4, Mitspieler Tore K4, Teilen Tore K5.",
          beleg: "Studio-Seiten 2/8: nur koerper und kreatur reisen (`_studioUebergabeEmpfang`, `stamm/netz-portal.js:1276`, Positivliste — am Code gelesen); die Garage schickt nur exit (`garage.js:483`), fachwerk, schmiede, portale, klang und terrain nur Wort und Panorama (`huelle.js:850-929`). Der Werkstatt-Weg der Welt trägt ws.studioOv über `_studioStampFor` (`werkstatt-vorschau.js:768`) in confirmBuild (`werkstatt-bauen.js:392`) — ohne Übergabe vom Studio.",
          schlupfloch: "Die 1-Stufe „alle Mesh-Arten über die Werkstatt der Welt“ erfüllte der Werkstatt-Weg ohne jede Übergabe (B46): die 1 verlangt Studio-Seiten. Den Empfang zu loggen, ohne dass ein Werk ihn liest: gemessen wird der Bau-Hash des Welt-Werks.",
          aenderung: "Staffel geschärft; Restore und Peer haben eigene Heime (B46, V17)."
        },
        {
          name: "EIN Karten-Bäcker: die Karte entsteht aus derselben Rechnung wie L0",
          punkte: 0,
          staffel: "1 = die Karte eines Baums aus Studio und Welt byte-gleich (EIN Bäcker) · 2 = jede Art mit Karte, aus derselben Bake-Rechnung wie L0 (der Ton L2/L0 misst Material K3, der Umriss LOD K1)",
          messung: "Byte-Vergleich des Karten-Atlas je Art aus Studio-Bake und Welt-Bake bei gleicher Saat und gleichem Gesetz-SHA.",
          beleg: "Zwei Bäcker: `foundry-bruecke.js:246` bakeImpostorAtlas ⇄ der RTT-Bäcker des Stamms (`foundry-bruecke.js:562` „liest DIESELBEN Zahlen“); Haus-Ton L2/L0 0,788 (`fachwerk-core.js:1999/:2612`).",
          schlupfloch: "Zwei Bäcker, die „dieselben Zahlen lesen“, sind ein Zwilling: die Probe verlangt Byte-Gleichheit der Ausgabe.",
          aenderung: "Ersetzt „Stufen-Treue“: deren Ton zählt Material K3, deren Umriss LOD K1 (B47, V22)."
        },
        {
          name: "Kosten am Asset: jede Stufe reduziert nach Gesetz und hält ihr Budget an jedem Regler-Rand",
          punkte: 2,
          staffel: "1 = reglerBudget ≤ 3 ohne geschrumpften Wertebereich · 2 = 0, und je Art L1/L0 ≤ 0,5, L2/L0 ≤ 0,15 Dreiecke",
          messung: "gate:regler-wirkt, Teil Budget, über die echte Foundry-Brücke: je Art × Stufe × Regler-Rand Dreiecke und Befehle ≤ PORTAL_RENDER_CONFIG.lod.budget; der Wertebereich steht in der Ratsche.",
          beleg: "SCHNITT pipeline-k3-s2 (a5b5e664 Haus, af33b531 Tor, Merge 23f2bc86, integ 6cfce28a), mit Welt-Byte im Rezept: porta-core `baueStufe` (das Anteil-Gesetz der Stufen) und fachwerk-core (doppel, storeys=12, turm); Vertrags-Akt v4 (14 Tore L1/L2) und v6 (62 L1, 2 L2, hochhaus-L0 160 960 → 123 628). Am Kopf 6cfce28a `spec/vertraege/ratsche.json` reglerBudget staffel 3 → 0, bruch {} und quote {}; PORTAL_RENDER_CONFIG-Budget und PARAMS-Wertebereiche im Diff unverändert. gate:regler-wirkt (stufenMessen über die echte Foundry-Brücke, jede Quote über L1 0,5 / L2 0,15 außerhalb der Ratsche ist NEU ÜBER DER QUOTE ROT): Tor L1/L0 0,810 → 0,489, L2/L0 0,385 → 0,150; Haus L1/L0 0,544 → 0,490, L2 0,13; über Budget 3 → 0 → Staffel 2 (Mechanik am Bau, R3; die Dreiecke rechnet der Foundry-Worker in JS, geräteunabhängig). Frisch: integ-CI Run 39820208133 an 6cfce28a, Regler wirkt Teil 1/2/3 (voll 16/13/10 von 18) grün. Benannt offen (LOD K1): Geisttor und Maschine zeigen in L2 ihre 4-cm-Gitterstäbe nicht mehr. Davor: SCHNITT pipeline-k3, auf main e5003509 (V18.546.59), mit Welt-Byte: die Stufen-Probe von gate:regler-wirkt (scripts/diag-regler-wirkt.cjs, drei CI-Teile 71/110/85 s) baut jede Stufe × Rezept × Regler-Rand (6 527 Bauten) über die echte Foundry-Brücke und richtet Dreiecke und Befehle gegen die Budget-Zeile — an der Basis 24 Regler über Budget (die alte Linse sah 7), am Kopf 3 = Ratsche 3 (Staffel 3), Quote 3, WURF 1 324 Paare; die Heilung im Rezept (fachwerk-core Biege-Achse, Sehnen-Toleranz, Kuppel-Meridiane, Ziegel-Band, Großformat; schmiede-core Wicklung; foundry-core Blüte; vehicle-core teil-Gesetz; phyto-core Leucht-Linien), 412 Rezept-Stufen ohne Regler byte-gleich, hochhaus-s12345-L0 per Vertrags-Akt (173 416 > 132 000 schon ohne Regler); Werkstatt-Bild alemannisch bend=1 in L1 26 668 statt 89 146 Dreiecke (Radeon, angesehen). Die Linse fährt in jeder vollen CI am Kopf: integ-CI an e5003509 (Run 39719773531) 22/22 grün inkl. echt → Staffel 1 (Mechanik am Bau, R3). Für die 2 fehlen reglerBudget 0 (haus doppel 12 Fälle, storeys=12 18 Rezepte, turm marokkanisch L2) und die Quoten gate L1/L0 0,81, L2/L0 0,39, haus L1/L0 0,54. Davor: reglerBudget 7 (spec/vertraege/ratsche.json bruch: fachwerk haus bend·doppel·storeys, porta ruin·wMason·wMono, schmiede griff). Dass Reduktion am Studio heilt, zeigt der Labor-Wolf L0 1 299 852 → 54 894 (K45, d7559531).",
          schlupfloch: "Den Regler-Rand enger klemmen statt im Rezept zu reduzieren: der Wertebereich steht in der Ratsche; ein Budget anheben ist ein Vertrags-Akt des Schöpfers.",
          aenderung: "EIN Heim der Reduktion je Stufe (vorher auch LOD K5; B38); Staffel neu (B48); Schnitt pipeline-k3-s2 22.10. 1 → 2."
        },
        {
          name: "Wärme: Platte und Gesetz-SHA tragen jede Lieferung",
          punkte: 0,
          staffel: "1 = build-asset kommt beim Zweit-Boot zu ≥ 95 % von der Platte · 2 = jede Lieferung (Blatt-Atlas, Dorf-Export, Karten) 100 %, ein geänderter Kern-SHA baut nur seine Art neu (0 fremde Neubauten), beide Geräte",
          messung: "diag-boot-stage --echt, Zweit-Boot, ≥ 4 Läufe je Gerät, mit dem Bau-Instrument: Bau-Ereignisse im Worker UND im Haupt-Faden, nie die Treffer-Zahl der Platte. Die Sekunden zählt Ankunft K3.",
          beleg: "FIEL 24.10. AUF 0 (R10, Prüfung der Buchung 61 → 80): keine Station misst am Kopf — beide Staffeln stehen in `punkte/stationen/g4.js` fehlt (diag-boot-stage --kalt --echt --profil zählt keine Lieferung und kein Bau-Ereignis); der Punkt stützte sich nur auf ein Instrument-Patch der GTX vom 18.10. (bericht/1810-b5/befund/lieferung-patch.cjs über die OMEN-Serie serie2.sh), das Platten-Treffer zählte, wo die Messung Bau-Ereignisse in Worker UND Haupt-Faden verlangt. Davor: 107–109 von 108–110 build-asset-Lieferungen kommen von der Platte (GTX, `bericht/1810-b5-befund.md`, integ f45ee994); der gemessene Pfad (`_foundrySchale`, `stamm/studio-bruecke.js:480-487`) ist seither unberührt — K22 f645a8bf änderte zwei andere Zeilen der Datei: frisch nach dem Abdruck des Pfads. Blatt-Atlas, Dorf-Export und Karten laufen jedes Boot live.",
          schlupfloch: "Treffer zählen, obwohl der Haupt-Faden danach neu rechnet: gezählt werden Bau-Ereignisse in Worker UND Haupt-Faden.",
          aenderung: "24.10. R10: der Hand-Punkt ohne Station am Kopf fällt 1 → 0."
        },
        {
          name: "EIN Bauer auf der Engine der Welt",
          punkte: 0,
          staffel: "1 = Netz- und Parse-Log des Foundry-Workers zeigt 0 Bytes auf worlds/*/lib/three* UND kein synchrones XHR · 2 = dazu kalt bereit ≤ 300 ms an beiden Geräten",
          messung: "Netz- und Parse-Log des Foundry-Workers, Kalt-Boot je Gerät.",
          beleg: "cores.manifest.json, phyto lib: `worlds/terrain/lib/three-r128.min.js`; `stamm/studio-bruecke.js:451` XMLHttpRequest (Manifest synchron), `:468` importScripts; LEGACY_LICHT = Math.PI (`stamm/bild-himmel.js:2863`).",
          schlupfloch: "Das Wort r128 aus dem Manifest streichen und eine Kopie inline laden (Text-Absenz): gemessen werden Netz- und Parse-Log, nie der Quelltext."
        }
      ],
      hebel: [
        { name: "Foundry-Worker als Modul auf vendor/three.core (r184), EIN Karten-Bäcker; r128, synchrones XHR und LEGACY_LICHT fallen in derselben Welle", k: ["pipeline.K5+2", "pipeline.K2+1"], t: [3, 4], wurzel: "`stamm/studio-bruecke.js:445-469` (Worker-Start), cores.manifest.json lib, `foundry-bruecke.js:246` bakeImpostorAtlas; Byte-Beweis gegen die eingefrorenen Goldens (Lehre 11).", pflicht: "B", v1: true },
      ],
      feststeck: {
        versucht: "Labor = Welt: seit dem 01.10. nennen 148 Commits Labor = Welt oder Albedo, es gab drei Linsen-Generationen (der Albedo-Zensus fiel mit be24f5d9, dann Albedo-Tafel und H4/H6). Trotzdem steht der Haus-Ton L2/L0 bei 0,788, und sechs Studios zeichnen mit eigenem Licht: Gleichheit wurde gemessen, nicht gebaut.",
        anders: "Gleichheit durch Konstruktion: die Bühne zeigt das Welt-Werk aus dem Welt-Bauer (Garagen-Muster), die Übergabe schreibt in den Speicher, den die Welt schon liest (ws.studioOv), die Karte entsteht aus derselben Bake-Rechnung wie L0. Richter bleibt EIN bild-diff, keine neue Linse."
      }
    },
    {
      key: "ki",
      titel: "Die KI im System — Satz → Tat, Regler-Sprache, Gedächtnis, Modell-Regeln",
      dom: "`stamm/feld-nexus.js` (maybeAnswerWithLlm, Prompt, ollama) · `stamm/feld-dsl.js` (70 Ops, spawn_studio) · `stamm/dienst.js` llmCall · `save-server.js` (/api/proxy/llm)",
      v1: "v1 (mit der KI erschaffen, Drehbuch-Schritt 18)",
      aaaa: "Ein Satz wird Tat: aus einem eingefrorenen Korpus von 40 Schöpfer-Sätzen ergeben ≥ 95 % ein gültiges Programm und ≥ 85 % die gemeinte Welt-Änderung (Prädikat am Welt-Zustand und im Bild), 0 brechen die feste Welt, p95 bis zur ersten sichtbaren Änderung ≤ 3 s — mit Anthropic oder einem lokalen Modell; ohne Schlüssel trägt der Satz-Parser die Grundstufe. Die KI spricht das ganze Gesetz: alle Regler der acht Studios, am Kern geklemmt — „eine knorrige alte Eiche“ setzt die Regler der Eiche. Wesen erinnern sich im Gespräch, und die Regeln, die das Modell schreibt, laufen durch dieselbe Wertung wie die des Nexus. **Wo wir die Besten schlagen:** Generative Agents lebt im Text, Voyager spielt allein, Genie 3 träumt Pixel für Minuten; bei uns schreiben Mensch, Nexus und KI dieselbe DSL in EIN Gesetz — deterministisch, gespeichert, teilbar —, und jedes KI-Wort löst auf dieselben Rezepte auf wie die Werkstatt: kein halluziniertes Asset.",
      beste: [
        "**Generative Agents** (Park et al., UIST 2023): 25 Agenten in Smallville mit Gedächtnis-Strom, Reflexion und Planung; eine gesäte Absicht verbreitet sich ungeskriptet von 1 auf 13 Agenten. Grenze: Textwelt ohne physisches Gesetz.",
        "**Voyager** (Wang et al., NVIDIA/Caltech 2023): GPT-4 schreibt ausführbare Fähigkeiten in eine wachsende Bibliothek in Minecraft und prüft sich selbst; 3,3× mehr einzigartige Gegenstände. Grenze: der Agent spielt allein.",
        "**Genie 3** (Google DeepMind, August 2025): aus Text eine begehbare Welt mit 720p und 24 fps, einige Minuten konsistent. Grenze: Pixel ohne bleibendes Gesetz."
      ],
      kriterien: [
        {
          name: "Satz → Tat mit echtem Modell: EIN eingefrorener Korpus, Welt-Prädikate",
          punkte: 1,
          staffel: "1 = Grundstufe ohne Schlüssel: ≥ 10 Positiv-Sätze mit Welt-Prädikat gemessen und gehalten · 2 = das Soll mit Modell (gültig ≥ 95 %, Absicht ≥ 85 %, 0 Brüche, Negativ-Sätze scheitern benannt)",
          messung: "EIN Korpus (spec/abnahme/ki-korpus.json, 40 Sätze, eingefroren, Nenner je Version fest; neue Sätze nur aus Funden des Schöpfers oder des Blind-Spielers; darunter Negativ-Sätze) über den echten Chat-Pfad (maybeAnswerWithLlm) gegen einen echten Anbieter (Anthropic oder lokal ollama; Anbieter-Host im Netz-Log, Antwort-Id), Temperatur fest; Prädikat auf state UND Ausgabe-Bild nach 10 s (≥ 0,5 % Pixel). Die Station wort des Spielgangs fährt denselben Korpus.",
          beleg: "Seit ki-korpus (Merge dce8570e, main 57a9f2ab) fährt die Station WORT (`scripts/diag-v1-pfad.cjs --korpus`, EIN Läufer auf welt-boot) den eingefrorenen Korpus spec/abnahme/ki-korpus.json (40 Sätze, davon 8 Negativ) über maybeAnswerWithLlm gegen den echten Anbieter; die CI spielt den Mitschnitt Satz → Programm ab (spec/profiband/ratsche-ki-korpus.json, nur monoton: das Halten). Gemessen am Kopf 57a9f2ab auf dem Radeon-Laptop (ollama 0.32.9, qwen3:4b-instruct auf der CPU, ohne Schlüssel; Netz-Log des Anbieters 127.0.0.1:11434 mit 41 POST /api/chat in 04:32–04:38): 23 von 32 Positiv-Sätzen mit Welt-Prädikat erfüllt (Wetter, Uhr, Saison, Himmel, sieben Studio-Werke, Tiere, Leib-Regler), gültig 33/40 = 82,5 %, Absicht 31/40 = 77,5 %, Negativ 8/8 ohne Tat, 0 Brüche. Täter der 2: „mach es nacht“ → 0,8, „bau mir ein haus“ at_player, holzhütte/wagen/auto/tempel/wesen/schwerkraft ungültig, die Regel null. Das Bild-Prädikat je Satz fiel offen als blind (10–17 % Ruhe-Rauschen ohne Tat, ki-korpus). Roh: koordination `bericht/2110-mk-kopf/ki-korpus-echt.log`, `ollama-netz.log`.",
          schlupfloch: "Ein Stub statt Modell, handverlesene oder für den Parser geschriebene Sätze, ein Prädikat auf das Log („spawned_studio“) statt auf die Welt: Anbieter-Host und Antwort-Id im Netz-Log, eingefrorener Korpus, Prädikat auf state und Bild.",
          aenderung: "Zwei Korpora (KI 40, Spielgang 20) waren ein Zwilling (V29); die 1 der Synthese stand auf einer Negativ-Probe (B49) → 0. Am Kopf 57a9f2ab mit lokalem Modell ohne Schlüssel gemessen (23 Positiv-Sätze mit Welt-Prädikat, Ratsche hält) → 1; die 2 verlangt das Soll mit Modell und ein sehendes Bild-Prädikat (Bild-Diff gegen dieselbe Ruhe statt Pixel-Anteil)."
        },
        {
          name: "Die KI spricht das ganze Gesetz: Regler-Wörter",
          punkte: 0,
          staffel: "1 = ≥ 50 % der Zeilen von PARAMS_BY_KIND sind aus einem KI-Programm erreichbar (ov als fünftes Argument von spawn_studio, am Kern geklemmt, fail-closed), und der Bau-Hash des Welt-Werks folgt · 2 = ≥ 95 % und der Korpus-Teil Regler-Wörter („knorrig“, „schmal und hoch“) ≥ 80 % mit Modell",
          messung: "Zählung über alle Zeilen; Bau-Hash des gesetzten Welt-Werks gleich dem Studio-Werk mit demselben ov; die Bild-Wirkung jeder Zeile erbt das Kriterium aus Studios K1, ohne sie erneut zu zählen.",
          beleg: "spawn_studio nimmt [what, pos, count, seed] (`stamm/feld-dsl.js:1020`); ov setzt nur `_studioStampFor` aus der Werkstatt-Prägung (`feld-dsl.js:1946`, `werkstatt-vorschau.js:768`): die KI erreicht 0 Regler. Der Wort-Katalog ist der Rezept-Katalog (L-WORTSCHATZ), der Prompt nennt die Live-Wörter (`feld-nexus.js:1041`).",
          schlupfloch: "Ein fünftes Argument, das angenommen, aber nicht verbaut wird: gemessen wird der Bau-Hash; Regler nur für eine Art freischalten hilft nicht, der Nenner sind alle Zeilen.",
          aenderung: "Die 1 der Synthese war der Wort-Katalog (B50) → 0; die Regler-Wirkung zählte viermal (Studios K1, Pipeline K1, Spielgang K5, KI K2) — hier nur die Erreichbarkeit."
        },
        {
          name: "Die Seele erinnert sich im Gespräch",
          punkte: 0,
          staffel: "1 = mit lokalem Modell nennen ≥ 70 % der Antworten aus dem Gesprächs-Korpus eine der letzten 8 Erinnerungen, an einem Gerät · 2 = auch Menschen-Bewohner, beide Geräte",
          messung: "Gesprächs-Korpus mit vorbereiteten Erinnerungen (geschlagen, gefüttert, gefolgt), echter Anbieter; Prädikat: die Antwort nennt eine Erinnerung des Wesens. Die Erinnerung als Verhalten (Abstand, Weg) zählt Ökologie K3.",
          beleg: "`_creatureRemember` (`stamm/kreatur-leben.js:1088`) — der Prompt liest die Erinnerung (`stamm/feld-nexus.js:1116`); mit Modell nie gelaufen; Menschen-Bewohner 0 %.",
          schlupfloch: "Ein Modell, das das Wort der Erinnerung nachplappert: das Prädikat verlangt den Bezug auf die konkrete Erinnerung des Wesens.",
          aenderung: "Die 1 der Synthese galt Schreiben und UI-Lesen; das Verhalten wanderte zu Ökologie K3 (V32) → 0."
        },
        {
          name: "Die Regeln des Modells laufen durch dieselbe Wertung",
          punkte: 0,
          staffel: "1 = im Selbstlauf mit Modell registrierte LLM-Regeln (source llm) werden von derselben Fitness gewertet und verdrängt wie Nexus-Regeln, gegen den Gegenlauf mit gemischtem δ · 2 = ihr Anteil an überlebenden Regeln mit δ > 0 gemessen, 0 verbotene Ops, Takt ≤ 0,2 ms, beide Geräte",
          messung: "10 min Selbstlauf an Genesis mit Modell (wie Affekt K3, derselbe Lauf), Zählung der LLM-Regeln je Drittel.",
          beleg: "Das Band LlmRules (`scripts/playtest/feld.cjs`) läuft headless mit Stub; mit Modell nie gelaufen.",
          schlupfloch: "LLM-Regeln, die die reaktive Schicht nur kosmetisch tönen, zählen erst mit positivem δ; Regeln zu zählen statt ihrer Wirkung zählt 0.",
          aenderung: "Heim des Nexus ist Affekt K3 (B01, B51); hier bleibt der Anteil des Modells."
        },
        {
          name: "Antwort und Kosten: die KI hält den Takt",
          punkte: 0,
          staffel: "1 = p95 Satz → erstes sichtbares Ergebnis gemessen mit Anbieter-Host im Netz-Log, an einem Gerät, im Soll (Haiku-Klasse ≤ 3 s, lokal ≤ 6 s) · 2 = dazu Prompt ≤ 4 000 Tokens, 0 Hänger > 100 ms, während die KI-Werke bauen (werkbank haenger), ≤ 0,002 $ je Satz, beide Geräte",
          messung: "Über den Korpus aus K1 in derselben Sitzung.",
          beleg: "Gemessen am Kopf 57a9f2ab (derselbe Korpus-Lauf wie K1, Radeon-Laptop, qwen3:4b-instruct lokal auf der CPU, Anbieter-Host 127.0.0.1:11434 im Netz-Log): p95 Satz → Welt 11,68 s (ki-korpus am Zweig 10,0 s; der erste Satz 28,5 s mit Modell-Laden) — ROT gegen lokal ≤ 6 s, das Vorher von KI H5. Der Prompt trägt 70 Ops, 9 Orte, 14 Bedingungen und die Live-Wörter (32412cb6, `feld-nexus.js:983-1053`), seine Größe ist nie gezählt; das Selbst-Wissen (Journal, Tendenz) wechselt je Tat → ~200 Token je Satz neu (befund ki-korpus). Roh: koordination `bericht/2110-mk-kopf/ki-korpus-echt.log`.",
          schlupfloch: "Die Latenz am Stub messen; den Prompt kürzen, indem Vokabular fällt — der Korpus aus K1 muss halten."
        }
      ],
      hebel: [
        { name: "Der Korpus hält das Soll (der Rest von KI H1): die Täter-Sätze beim Namen, ein sehendes Bild-Prädikat, ein Modell, das 95/85 trägt", k: ["ki.K5+1"], t: [1.5, 2], wurzel: "Station WORT steht (`scripts/diag-v1-pfad.cjs --korpus --echt`, Mitschnitt-Ratsche); Täter: Uhr-Wörter (nacht → 0,8), Grundriss at_player, Form-Wörter ohne Rezept (holzhütte, wagen, auto, tempel), Wesen-Argumente, Regeln null — im Vokabular des Prompts (`stamm/feld-nexus.js:983`) und in DSL_WERTE; das Bild-Prädikat als Diff gegen dieselbe Ruhe; ein Modell mit Anbieter-Host (Anthropic über /api/proxy/llm `save-server.js:1082`, oder ollama auf der iGPU).", pflicht: "— (v1-Ziellinie Schritt 4)", v1: true, oeffnet: 3 },
        { name: "Das Gedächtnis im Gespräch (nach H1)", k: ["ki.K3+1"], t: [1, 1], wurzel: "`stamm/feld-nexus.js:1116` Prompt mit den letzten 8 Erinnerungen; Gesprächs-Korpus in spec.", pflicht: "—", v1: false },
        { name: "Die Modell-Regeln durch die Wertung (nach H1 und Affekt H3)", k: ["ki.K4+1"], t: [1, 1], wurzel: "`stamm/feld-nexus.js` (Fitness, Pattern-Memory `:469-660`) und `_tickWorldRules` mit source llm.", pflicht: "—", v1: false },
        { name: "Takt und Kosten: Prompt nach Absicht in zwei Stufen, KI-Werke im EINEN Foundry-Rang", k: ["ki.K5+1"], t: [1.5, 1.5], wurzel: "`stamm/feld-nexus.js:983` llmBuildSystemPrompt (Vokabular je Absicht), `stamm/studio-bruecke.js` `_foundryAuftrag` (nah zuerst); werkbank haenger über den Korpus.", pflicht: "— (Last: E)", v1: true }
      ],
      feststeck: {
        versucht: "Drehbuch-Schritt 18 („KI an, eigener Schlüssel“) ist seit V18.493 offen; seither bauten 12 Commits Vokabular und Verben (KI1 32412cb6, KI2 0814b980), und jedes Verb wirkt — der Lauf mit Modell blieb aus, weil er als Akt des Schöpfers gerahmt ist: eine erfundene Schöpfer-Abhängigkeit (BETRIEBSGESETZ). Gelöst mit ki-korpus (dce8570e): der Korpus läuft ohne Schlüssel lokal (am Kopf 57a9f2ab gültig 82,5 %, Absicht 77,5 %, p95 11,68 s); fest sitzt jetzt das Soll mit einem 4B-Modell auf der CPU.",
        anders: "Der Richter braucht den Schlüssel des Schöpfers nicht: der Anbieter ollama steht schon (`feld-nexus.js:824`) und läuft lokal auf dem Radeon-Laptop, der Proxy des save-servers auch; EIN eingefrorener Korpus mit Welt-Prädikaten richtet jede Nacht. Den Schöpfer-Lauf braucht es danach als Erlebnis, nicht als Tor."
      }
    },
    {
      key: "bauen",
      titel: "Spieler-Bauen — Teil, Haus, Ort, Höhe, Gebrauch",
      dom: "`stamm/werkstatt-*.js` (confirmBuild, `_setzUrteil`, Vorschau) · `stamm/bau-buch.js` · `stamm/bau-teile.js` · `gelaende-core.js` (ERDBAU) · `fachwerk-core.js` (ortPlan)",
      v1: "v1 (in der Werkstatt bauen, benutzen)",
      aaaa: "Mit ≤ 3 Eingaben und in ≤ 1 s steht, was der Spieler will: Eiche, Haus, Wagen oder ein eigenes Teil aus bis zu 32 Grundformen. Alles gehorcht dem Gesetz: die Statik (Schwerpunkt, Stützpolygon, Lastpfad, Knicken) gilt beim Setzen in der Welt, und ein Brennglas zündet mittags, weil seine Form das Licht bündelt. Ein gesetztes Haus gehört dem Ort wie ein Dorfhaus: Erdbau, Vorplatz, Gasse, ein begehbarer Keller, und im Ortsradius wird es Slot des Plans. Gebaut wird in jeder Höhe — ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände —, und jedes gesetzte Werk trägt seine Verben: die Tür öffnet, der Wagen fährt, die Leiter trägt. **Wo wir die Besten schlagen:** Valheim und Enshrouded setzen statische Assets, TotK verklebt handgemachte Objekte, Townscaper kennt einen Stil; bei uns ist das Haus das Fachwerk-Gesetz (6 Regionen × 9 Epochen, 21 Regler), der Ort ist ortPlan, die Funktion eines Teils folgt aus seiner Form, und alles reist als Funktion (Saat + ov).",
      beste: [
        "**Zelda: Tears of the Kingdom** (Nintendo 2023): Ultrahand verklebt bis zu 21 Objekte, die physikalisch simuliert werden; Zonai-Bauteile geben dem Werk die Funktion je Teil.",
        "**Valheim** (Iron Gate 2021): der Halt jedes Teils fällt mit dem Abstand zum Bodenkontakt, gezeigt in 4 Farben, dann stürzt es ein; der Stoff setzt die Reichweite.",
        "**Townscaper** (Oskar Stålberg 2020): 1 Klick je Zelle; Bögen, Treppen, Gärten und Dächer folgen aus den Nachbarn per Wave Function Collapse — die Form aus dem Gesetz.",
        "**Manor Lords** (Slavic Magic 2024): Parzellen frei an die Straße gezogen, mit Hinterhof und 3 Ausbaustufen; Straßen folgen den Hügeln."
      ],
      kriterien: [
        {
          name: "Vom Willen zum stehenden Werk: ≤ 3 Eingaben, ≤ 1 s, auf jedem Weg",
          punkte: 1,
          staffel: "1 = jeder Weg (Werkstatt, Rezeptbuch, Hotbar) stellt das Werk über echte DOM-Ereignisse, gezählt am Ereignis-Strom · 2 = ≤ 3 Eingaben und p95 ≤ 1 s bis zum ersten Ausgabe-Bild in L0, kalt und warm, beide Geräte",
          messung: "Spielgang-Station bauen über die echte UI: Eiche, Haus, GT und ein eigener Teil-Bauplan, je über Werkstatt, Rezeptbuch und Hotbar, in schöpfer, frieden und pfad, Ego und Third. Die Klick-Zahl zählt nur hier (Spielgang K1 verweist).",
          beleg: "SCHNITT bauen-k1, auf main 7670a4a1 (V18.546.56), mit Welt-Byte und Linse. Linse 64e153f2 L-WERKSTATT (`scripts/diag-werkstatt-weg.cjs`): Eiche, Haus, GT und eigene Hütte × Werkstatt, Rezeptbuch, Hotbar × schöpfer, frieden mit und ohne Material, pfad × Ego, Third über page.keyboard/page.mouse, gezählt pointerdown, keydown und wheel mit isTrusted am Ereignis-Strom; der Selbsttest (ein Bestätigungs-Klick zu viel) ist ROT beim Namen. An der Basis b9537781 standen 72/72 über echte Ereignisse, aber mit Eingaben Werkstatt 5–16, Rezeptbuch 3–24 (Mausrad), Hotbar 2 — 36 Täter über 3. Schnitt b0c842a9 „die Wahl stellt das Werk“: `fertigeBlueprint` (`stamm/koerper-seele.js`) setzt für Werkstatt-FERTIGEN und Rezeptbuch im selben Akt (`tickBuildMode` + `confirmBuild`), wohin der Spieler blickt, lehnt der Ort ab, bleibt das Phantom; die Reihe des Katalogs `_katalogRang`/`_katalogReihe` (`stamm/siedlung-satz.js`) legt eigene Werke, dann die Hotbar nach oben. Am Schnitt 72/72 über echte Ereignisse, Täter 36 → 0, Eingaben Werkstatt 3, Rezeptbuch 2, Hotbar 2 → Staffel 1; Zweig-CI 39693723217 21/21. Zeit an der Radeon: Werkstatt kalt 1 052/1 519 ms, Rezeptbuch GT kalt 518/2 346 ms, Hotbar warm 321/452 ms (Roh: `artifacts/werkstatt-weg/weg.json` am Radeon-Platz, nicht im Baum). Frisch: `git log b0c842a9..7670a4a1` über `stamm/koerper-seele.js`, `stamm/werkstatt-*.js` und die Linse ist leer; naesse berührt `stamm/siedlung-satz.js` nur am Stoff des Zauns und am Platz eines Foundry-Baus ohne Haus-Hülle (`_dachKastenSetzen`, ein Bau ohne Dach-Art merkt sein Nein) — nicht die Eingabe. Offen für die 2: kalt über 1 s (1 519 und 2 346 ms), das erste Bild in L0 ist ungeprüft, die GTX ungemessen.",
          schlupfloch: "Schritte per Methoden-Aufruf statt per Klick: gezählt werden echte Eingabe-Ereignisse (isTrusted); ein vorgewärmter Cache täuscht Tempo vor: je Lauf eine Kalt-Variante.",
          aenderung: "Die 1 der Synthese stand auf Chokepoint-Aufrufen (B52) → 0; mit echten Eingaben gemessen und geschnitten 0 → 1 (bauen-k1, 7670a4a1)."
        },
        {
          name: "Das gesetzte Haus gehört dem Ort: EIN Grund-Datum, Slot im Plan",
          punkte: 0,
          staffel: "1 = Erdbau und Vorplatz wie ein Dorf-Slot derselben Gestalt (Byte-Vergleich der ortPlan-Ausgabe), am Hang mit Gefälle ≥ 15 % · 2 = im Ortsradius Slot des Plans mit umgelegter Gasse, Keller über die Treppe ohne Anti-Clip-Hub",
          messung: "Setzen am Hang über die echte UI; Byte-Vergleich Grund-Datum; Dichte über der Diele 0 Zellen; Gang des Leibs in den Keller (kellerY −2,40 m). Halm-Pixel im Grundriss zählen Vegetation K4.",
          beleg: "Seit main f2904a72 (S4 grund-datum, Merge 10ac79b0) legt jedes gesetzte Haus beim Setzen seinen Erdbau `grund` aus dem Plan seines Gesetzbuchs — derselbe Erdbau wie ein Haus im Ort, mit hohlem Keller (`stamm/gelaende-kollision.js:284` `_hausGrundSetzen`, fachwerk `grundPlan` 640/640 byte-gleich dem Mass-Bau, 7e95bfd4; gate:haus-welt W9 headless: Keller-Fuß −2,28 m 6/6, der Abbau nimmt den Grund mit). Die 1 trägt das nicht: der Vorplatz entsteht nur im ortPlan der Orte (`fachwerk-core.js:5382-5401` vorplatzFlaeche), kein Byte-Vergleich gegen einen Dorf-Slot, Setzen am Hang ≥ 15 % über die echte UI ungemessen (W9 setzt per Methode auf der Wiese).",
          schlupfloch: "Erdbau als Bild-Kosmetik (Boden-Tint): gemessen werden die Dichte über der Diele und der Gang des Leibs; eine flache Pose zählt nicht.",
          aenderung: "EIN Heim (vorher auch Siedlung K4; B53, V18)."
        },
        {
          name: "Das Teil gehorcht dem Gesetz: Statik und Wirkung aus der Form, in der Welt",
          punkte: 1,
          staffel: "1 = die Wirkung aus der Form ist gemessen, die Statik gilt nur in der Werkstatt · 2 = ein Prüf-Satz aus 10 Konstruktionen (5 stabil, 5 instabil) wird in der Welt 10/10 richtig geurteilt mit sichtbarer Folge, und 5 Wirkungs-Konstruktionen halten 100 %",
          messung: "Prüf-Satz in der Welt gesetzt: Turm, Kragarm, Brücke, Bogen; Wirkung: das Brennglas zündet mittags und nachts nie, das Rad rollt, die Schale hält Wasser.",
          beleg: "Das Statik-Urteil fällt nur beim Fertigen (`_workshopPhysicsVerdict` `werkstatt-vorschau.js:548`, gerufen `werkstatt-bauen.js:1599`); beim Setzen zählt nur „Phantom auf dem Boden“ und nur in pfad (`_setzUrteil` `werkstatt-bauen.js:143-144`). Die Wirkung aus der Form ist gemessen: BRENNGLAS (diag-werkstatt-weg; Affordanzen aus der Geometrie `bau-teile.js:202-450`).",
          schlupfloch: "Das Urteil anzeigen, ohne dass es gilt: gemessen wird, ob das instabile Werk steht; ein Tag statt der Form („ist_linse“) zählt nicht, die Probe baut die Form neu."
        },
        {
          name: "Bauen in jeder Höhe und auf Gebautem",
          punkte: 0,
          staffel: "1 = ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände (Fuß ≤ 0,15 m über dem Mesh) und hält über den Reload (0 Löcher) · 2 = auch auf Dach, Fels und Brücke (oberste Fläche, `_bodenSichtAt`), der Fern-Ring zeigt den Edit ≤ 1 s (byte-Diff), Ego und Third, beide Geräte",
          messung: "Spielgang-Station bauen in der Höhe; gemessen wird, wo der Fuß steht. Die Wasser-Folge des Edits zählt Gelände K2.",
          beleg: "Der Edit ist ein Kegel fester Stärke `fall * (ed.strength || 48)` (`stamm/gelaende-boden.js:1139`, `voxel-worker.js:734`); am Vorfahren 25f53923 gemessen (098f8f96): Turm aus 10 Blöcken mit Hub 24,1 m (3,20 → 1,73 m je Block), Sohle bis 2,50 m im Boden. Die Heilung liegt ungemergt auf origin/hoch-bauen 9d987a93 (Säule statt Kegel: 20 Blöcke 69,5 m an der Radeon, 300/300 vor und nach dem Reload).",
          schlupfloch: "Hohe Türme nur nah an der flachen Mess-Wiese: Fern-Ring und Third; ein Fill, der das Mesh hebt, ohne den Leib zu tragen, zählt nicht. Ein höherer Kegel-Wert (48 → 96) bestünde eine Höhe: die Probe fährt 20, 60 und 120 m.",
          aenderung: "EIN Heim von F2a (vorher auch Gelände K2(c), Siedlung K4, Spielgang K4; V18)."
        },
        {
          name: "Das Werk wird benutzt: jedes gesetzte Werk trägt seine Verben",
          punkte: 0,
          staffel: "1 = von 6 gesetzten Werken (Haus, Wagen, Tor, Brücke, Leiter, Bank) ist jedes Verb aus KIND_POLICY (betreten, drive, portal, sitzen, klettern) über die echte Eingabe nutzbar, an einem Gerät · 2 = auch für KI-gesetzte und geteilte Werke, Ego und Third, beide Geräte",
          messung: "Spielgang-Station benutzen: gesetzt über die Werkstatt, benutzt über die Taste.",
          beleg: "KIND_POLICY und die Verben (appear · place · body · drive · wield · portal · rule) stehen im Stamm; ob jedes gesetzte Werk sein Verb trägt, misst keine Station. Ungemessen.",
          schlupfloch: "Ein Verb, das nur am Studio-Werk greift, nicht am Spieler-Werk: gesetzt wird über die Werkstatt, benutzt über die Taste.",
          aenderung: "Neu (v1-Schritt 5 „benutzen“): der Rundlauf der Synthese-K5 zählte sechsmal (V17) — Heime Speicher K4, Tore K4, Tore K5."
        }
      ],
      hebel: [
        { name: "Das Werk in ≤ 1 s im ersten Bild in L0, kalt und warm, beide Geräte (die Eingaben stehen seit bauen-k1)", k: ["bauen.K1+1"], t: [1, 1.5], wurzel: "L-WERKSTATT (`scripts/diag-werkstatt-weg.cjs`) zählt Eingaben und ms je Lauf; der Rest ist die Zeit kalt (Radeon: Werkstatt 1 052/1 519 ms, Rezeptbuch GT 518/2 346 ms) bis zum ersten Ausgabe-Bild in L0 — gemessen am Ausgabe-Pfad statt an `confirmBuild` —, dann der Schnitt am Täter des kalten Baus und die GTX.", pflicht: "—", v1: true },
        { name: "Die Verben je gesetztem Werk", k: ["bauen.K5+1"], t: [1.5, 1.5], wurzel: "KIND_POLICY je Art am gesetzten Werk (`stamm/werkstatt-bauen.js` confirmBuild → Verb-Registrierung), Station benutzen.", pflicht: "—", v1: true }
      ],
      feststeck: {
        versucht: "Bauen stand in jeder Karte bei ≈ 55 %. Die zwei Heilungen, die Punkte tragen, liegen gemessen auf Zweigen — hoch-bauen 9d987a93 (69,5-m-Turm) und wiese-im-haus 69498f91 (24/25 → 0) — und warteten auf die „richtige“ Wurzel, den Kern-Schnitt S5/S4 mit 4–7 Tagen. S4 kam am 20.10. als Grund-Datum nach main (f2904a72); hoch-bauen wartet weiter auf S5.",
        anders: "Lehre 4: erst einfädeln, was gemessen hält — aber als EINE Funktion im Kern, nicht als zweiter Weg: editForm wandert nach gelaende-core, der Zweig ist die Byte-Referenz (maxDiff 0). Danach trägt dieselbe Bahn S5."
      }
    }
  ]
};
