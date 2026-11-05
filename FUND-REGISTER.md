# FUND-REGISTER — was Arbeiter fanden und nicht in ihrem Zug heilen konnten (der Koordinator besitzt es)

Eine Zeile je Fund: Datei:Zeile · Wurzel · was es bewegt · Größe. Wer eine Zeile heilt, löscht sie im selben Commit. Stand 02.11. (main 10770eb5).

## Werkzeug (macht jede Welle billiger)
- `punkte.cjs` / deckel.json · ~20 Proben fallen an der 10-s-Grenze (u. a. tiere.K5#1), studios.K2#2/K3#2 reißen 4 s trotz Tafel 10 s · Messung blind · S
- volle Radeon-Fahrt ≤ 30 min unbewiesen (Lauf 2: 63 Proben in 1462 s) · alle Radeon-Punkte · M
- `_standRueckspielen` räumt tools/materials nach `name` statt Schlüssel; `haengerAn` gibt seine Haken nicht je Lauf zurück · Grundstellung · S
- `package.json:20` check:statik (Puls 1, lokal `npm run check`) · eine `&&`-Kette aus 74 Befehlen: die erste rote Linse verbirgt jede dahinter — dieselbe Klasse wie die voll-Kette (w4-ci-alle-schritte), dort nicht geheilt, weil npm unter Windows cmd fährt und gate:ci-deckung die Kette befehlsweise liest ((S)-Logik) · ein Läufer, der jede Linse fährt und alle Roten nennt · S–M
- `meisterkarte-quelle/punkte/stationen/g6.js:1023` ANKUNFT_KALT ohne `ausnahme` (Deckel ≤ 45 s, Radeon-Frist 39 s) + `stationen/sitzung-seite.js` probeAnkunft: die Kalt-Ruhe hält 40 s für Warm und Kern frei (`(H.rest() - 40) * 1000` ≤ 0) → `fristRiss` an JEDEM Radeon-Lauf, FRIST_MARKE macht alle sechs Zwillinge UNGEMESSEN, auch ankunft.K5#1, dessen Spur an der Kontrolle (dem Ereignis) schon „gemessen“ stand (2674ff9a: 1075 ms · 9,28 s gesehen, nie gebucht) — die Frist hängt an der Wanduhr, nie am Ereignis der Station · Heilung: die Marke nennt ihre Phase, `keinUrteil` (punkte.cjs:374) urteilt sie gegen die Phase der Station (K5 Kontrolle · K1/K2 Kalt-Ruhe · K3/K4 warm/Kern); eine Ausnahme 90 s trägt die Fahrt nicht (1798/1800 s) · ankunft.K1/K2/K3/K5, pipeline.K4 · S (w12-ankunft-faden)
- `scripts/diag-takt.cjs` T9 Nah-Gang ROT an main ac85ccab (tickArchitectureCulling: „Bau hinter 30 Wartenden“ false, die Stufe hinter der Kappe true) · gate:takt (volle Batterie) · S (w12-ankunft-faden)

## Spiel
- `meisterkarte-quelle/punkte/stationen/g2.js` mensch.K4#1 · an der Kamera des Spiels (`_loopCamera`, 6,1 m, FOV 75°, 1920 × 1080) trägt der Kopf 17 × 22 Bildpunkte, die Iris 1,3: Lippe 0 und Höhle ≤ 1 reine Bildpunkte — KOPF_SOLL lippe/hoehle sind dort UNAUFGELÖST (Linse w12-gesicht, Radeon ab1b1ee6), die Staffel 1 hält an dieser Pose an keinem Gesicht · die Pose der Staffel (Schöpfer) · S
- `koerper-core.js` KOPF_TON.lippe / foundry-core Mund-Linie + Verdeckung · die Lippe liest unter dem Licht des Gesichts nicht rot: 0,7 m lippeA 1,5–2,5 < 4 (Albedo +13), im Bild ein dunkles Mund-Loch; die A4-Lider zeigen Sklera rings um die Iris (Starr-Blick) · mensch.K4, A · S–M (w12-gesicht)
- Licht am Gesicht im Schatten · die Mahagoni-Wange liest an der Kamera des Spiels sRGB (28,12,2), L* 4,5 — ohne Boden-Rückstrahl, und der Fuß von NeutralToneMapping zieht Blau auf 0 · licht, A · M (w12-gesicht)
- `scripts/diag-studio-uebergabe.cjs:207` (K) KANAL · tree: eiche Same 3 baut im Studio 6a4d96f608, in der Welt 5f941b09d3 (3 Teile je) — `--saat 2838944195` ROT am main ba87b158, die Saat zieht je Lauf neu (Date.now), `npm run check` flackert · studios, A · S (w12-menue)
- `stamm/wasser-zellen.js:574` `_stampArchitectureSolidCellsInto` · die Wasser-Zellen des Genesis-Chunks −1,−1 veralten gegen seine Werke: main ba87b158 mit 4 × 32 Hand-Takten an der Stelle von Welle 6.C3 → beim Band C.1 V9.71 12 statt 2 Wasser-Chunks, das Band nimmt den ersten der Karte (−1,−1, nicht seinen See-Chunk), der Neubau stempelt 429 SOLID-Zellen mehr (drift 489, Playtest ROT) · Wasser, A · S–M (w12-menue)
- Heap-Leck `nodeBuilderCache` +30,6 MB/min · profiband.K5, E · in Arbeit (funde-6a57 heil:leck)
- Wege-Karte: erstes Zentrieren am Genesis-Ort 112 ms Haupt-Faden, Flächen ohne Band je 48-m-Umzug neu · B, E · M
- Metropole `platzVoll: 87` — 87 Marktstände ohne Platz neben der Trasse (alle Punkte in Hausgrundrissen) · siedlung, C · Plan der Stadt · M
- Orte stellen keine Wagen ihrer Epoche: Leser `ov.epoche = epocheAusJahr(EPOCHEN[ort.epoche].jahr)` an `stamm/siedlung-ort.js:1136` · C, fahrzeug · M
- Fahr-Gesetz kennt kein Zugtier (Kutsche fährt mit Motor-Kraft), Zugtier-Leib nicht an der Deichsel · fahrzeug, C · L
- Kalesche: Verdeck liest sich als Fächer, Landau-Eisen + Tür fehlen; Zukunft: Explosion 0,5 ≈ 1,0, Schilder ferne Seite · Fahrzeugstudio · S
- `tore.K3`: `r._genesisPortalRing is not a function` · tore.K3 · S
- `bild-sicht.js` `_hoehlenRiss` reicht nur einen Nachbar-Chunk, kein eigener Mutant · A · S
- haar.K2 Radeon: Albedo-Zeile veraltet seit baf9d828 · haar.K2 (gebucht!) · S, braucht Radeon
- fahrzeug.K3#1 Anker in `diag-garage-labor.cjs` veraltet → UNGEMESSEN · fahrzeug.K3 (gebucht 2) · in Arbeit (heil:proben)
- studios.K4 Probe liest `gruen` von undefined · studios.K4 (0!) · in Arbeit (heil:proben)
- physik.K2#2 „DER BAU STEHT NICHT: haus_alemannisch#429“, siedlung.K4#2 ROT · in Arbeit (heil:urteile)
- B Ankunft ≤ 5 s: 55 strukturelle Programm-Varianten vor Kontrolle (bauSatz, arena, streuSatz, fern-ring) → Stoff-Foundry (Messen zuerst) · B · L
- stamm/stoff-instanz.js `_renderObjekteLoesen`/`_renderObjektRegister` · eine gelöste Sampler-Bindung wird danach noch gelesen (Bündel-Wiedergabe oder lebendes Objekt nach dem Lösen; `texture = null` traf so die Leinwand, z161 3/3 ROT) — den Leser benennen, dann das Lösen erst nach seinem letzten Zug · gate:kamera-leib (CI-swiftshader) · S
- `stamm/stoff-karte.js:881` Karten-Sonne der Nadel-Karte L2 · die Karte (fimp) leuchtet heller als die L0 am Wechsel-Abstand (Radeon 2d6439c1, 1920 × 1080, gemittelte Luma der Masken L0 gegen L2: Tanne +6,2 % bei 52,7 m, Fichte +4,7 % bei 61,5 m; Birke +5,7 %, Eiche +3,4 %, Buche −21,6 %), und ihr Umriss weicht 5,9–7,5 px ab (Weide 2,5) — mit w10-lod (Laub-L1 = L0-Krone) trägt sie allein lod.K4#1: 2,27 % über 18 958 px → 6,16 % über 9 821 px · lod.K4, lod.K5 Baum, A · M (nächste lod.K4-Karte)
- `stamm/siedlung-ort.js:2469` `wachs.uhr` · ein Ort mit Chronik reist mit seinem Gedächtnis, und `wachs.uhr` ist der Zeitpunkt des Besuchs: das Wachstum (siedlung.K4#2) hängt am Weg, nicht an der Uhr der Welt (5,1 km in 30 min: 3 von 20 Orten, 445 B); ein Ort ohne Änderung reist seit w12-tritt nicht mehr (`_ortReistNicht`), ein Ort, der aus dem Stand wiederkam, reist weiter (seine Wahl lief nicht in der Sitzung) · Heilung: der Ort wächst ab der Uhr der Welt, sein erster Export trägt das Jahr der Uhr · speicher.K3, siedlung.K4 · M
- `scripts/diag-persistence.cjs:416` (D) und `stamm/vegetation-baum.js:3024` MAX_NEXUS_STRUCTURES · die Linse urteilt die Bauten des Nexus (Tempel, Wasserfall, Fraktal; gedeckelt von seinem Gesetz, nie vom Weg) als „ohne Leben“, dazu je Haus ~430 B Erdbau `haus:` (eine Funktion des Hauses, `_hausGrundSetzen`) — an w12-tritt (49d4c3a8) 2 von 7 Gängen (`evo_18` des Nexus: repeat 5 × spawn_fractal village → 31 Häuser; die Folge ist deterministisch, ob sie in 30 min läuft, hängt am Takt): Δ 25,3–27,0 kB (erdbau 13,4–13,5 kB, architectures 10,4 kB), sonst 4,3 kB · speicher.K3 kippt mit dem Würfel des Nexus · Heilung: die Linse zählt die Akte des Nexus zum Leben, oder der Grund eines Hauses reist nicht · speicher.K3 · S–M
- `stamm/siedlung-wege.js:920` `_trittSchwach` · das flüchtige Gedächtnis unter dem Pfad wächst im RAM mit dem Weg (8 762 Zellen je km, Map mit String-Schlüssel; eine Zelle mit einem Tritt lebt, bis n · e^(−Δt/20 d) < 0,5: ~14 Spieltage = ~14 h Spiel); der Stand trägt es nie · Heap, E · S

## Welle w5 (03.11.)
- `meisterkarte-quelle/punkte/punkte.cjs` fahrtSumme · die GPU-Fahrt steht Radeon 1798 / GTX 1799 von 1800 s — jede weitere GPU-Station (leib.K3#2, spielgang.K4#2, tore.K5#2, physik.K3#2, wetter.K3#2/K4#2, stoffe.K1#2) wartet auf schnellere Proben (Prüfbühne: Ortswechsel/Grundstellung 5–23 s je Probe) · ~30 Staffel-2-Punkte · L
- lod.K4 (GTX-Blick w5-stufen) · Täter `f:birke`: 63 % der Wechsel-Pixel, die Krone kippt −24…−30 % in der Luma mit Schatten aus · lod.K4 · M
- haar.K5 · an der GTX steht kein Wolf der Herde im Bild (0 Befehle tier:wolf) — die Grenze „tier ≤ 30 Befehle“ urteilt blind · haar.K5#1 (Linse) · S
- scripts/diag-takt-atem.cjs (Zweig w5-affekt-linse cdcf338f) · die Leinen-Linse (GPU-Arbeit neben der Leine beim Namen) kostet +1135 Atome der Decke · Werkzeug · M
- stamm/feld-nexus.js:332 `_composeNexusRule` · nur `source === "nexus"` sind Eltern, eine bewährte LLM-Regel vererbt nie (zweites Gesetz) · ki.K4, Gebot 4 · S
- spec/abnahme/ki-korpus.json:78 · der Bezug `gefuettert` enthält das nackte „gegeben“ und wertet „den Schlag … gegeben“ als Gabe · ki.K3 (Linse) · S
- stamm/koerper-bewegung.js (freier Körper des Werks) · Steinplatte 4×4 m auf vier Pfosten kippt binnen 2 s, steigt 4 m und verschwindet aus state.architectures · physik.K3 · M
- messort("dorf") baut in der Welt-Probe (Null-Renderer) 0 Häuser nach 9000 Takten · jede Probe „am Dorf“ · M
