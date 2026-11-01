# Übergabe w4-stationen-schnell-a — ZWISCHENSTAND 31.10., 23:45

Auftrag (Koordinator „Messplatz und Meisterkarte“): die Läufe der Punkte-Maschine, die auf der GTX ≥ 90 s brauchen und jeden Deckel
reißen, schnell machen — Station ≤ 60 s in EINER warmen Welt, Ziel ≤ 15 s, Deckel 45 s; Warten im Bau-Ereignis, nie ein Ganz-Welt-Boot
je Probe, das Kriterium bleibt. Liste (Eich-Fahrt GTX b4bcf19c, 15 Läufe): vegetation.K5#2 · lod.K5#1 · ferne.K1#1+K2#1+K1#2+K2#2 ·
gelaende.K5#2 · material.K3 · material.K1 · mensch.K1#1+K2#2 · vegetation.K4 · tiere.K2#2 · studios.K2#2+K3#2 · bauen.K1#2 · studios.K4 ·
fahrzeug.K3#2+K4 · siedlung.K2 · siedlung.K1#2.

## Zweige (gepusht, integriert)

- Koord `w4-stationen-schnell-a-koord` (Basis origin/punkte-maschine 359ce394): lod.K5#1 (`94f8224e`), D (`d2b0556c` `b3f390f2`), die Serien
  von A, B, C, E (per `git am`, sauber) und diese Übergabe. `punkte.cjs liste` · `selbsttest --ohne 3c` · `scheiben` gtx/radeon: siehe unten.
- Spiel `w4-stationen-schnell-a` (Basis origin/main f0dab43d): `47022bfc` `70766788` (`bild --abstand` Marsch je Pose, Zählung) · D
  `e77de904` (Bild-Weg) · `4942fc5f` (Decke: JSON-Lesung) · A, B, C, E (per `git am`, sauber) · `f7c6b3df` nimmt Ds Studio-Hülle zurück
  (DECKE). `npm run check` Exit 0 (gate:betriebsgesetz GRÜN: scripts −25, Spiel +123 Atome) · `npm run lint` 0 Fehler · `format:check`
  GRÜN · `playtest:fast` 21 ✅ 0 ❌. Der volle Playtest (Merge-Gate) und die GPU-Gates stehen beim Integrator.

## Je Lauf — GTX vorher → nachher (hergeleitet, nicht gemessen: die Cloud hat keine GPU)

| Lauf | Täter | Schnitt | GTX | unter dem Gesetz? |
|---|---|---|---|---|
| lod.K5#1 | kanten.js: die Höhen-Schleife (`F.kind !== "tree" \|\| …`) wartete an Haus, Haus, Tor, Tor, Wagen je 400 × 50 ms | `__gebautNach` je Wartestelle (Null-Welt ohne Aufnahmen 108,5 → 4,2 s, 7/7 Fälle) | ≥ 90 → ~13–17 | ja |
| material.K3 + material.K1 (A) | jede maß dieselbe Albedo-Tafel; das Labor in eigenem Browser; Tafel-Takte 50 ms Schlaf (34 s) | EINE Probe für vier Stationen (Zwillinge), Labor im Fenster der Sitzung, Bild-Takt, `lies` 46 → 6 ms | 2 × ≥ 90 → ~23–26 (ein Lauf) | ja |
| tiere.K2#2 (B) | das Mahl als ganzer `jagdkreis` in eigener Null-Welt + `wait` | Probe `mahl` in der Welt der Sitzung (Kette 7 200 Takte) | ≥ 90 → ~17–28 | ja |
| siedlung.K2 (C) | `--ort wiese` legt den Dorf-Zug still: die Stadt wuchs nie; 60 × 1 s Fragen | Stand auf dem Hügel, Dorf-Zug und Decke geliehen, Bau-Ereignis | ≥ 90 → ~21–27 | ja |
| bauen.K1#2 (D) | Neuladen der Welt je Lauf; 1-km-Sprung zur Genesis-Lichtung | kalt per `_foundryCacheEvict`, Platz beim Spieler | ≥ 90 → ~20–45 | ja (knapp) |
| gelaende.K5#2 (E) | `gezeichnet` schnitt je Strahl jedes Dreieck der vier Netze; GT-Uhr 100 ms | Lot-Gitter je Netz (byte-gleich, 0 Abweichungen in 20 557 Rufen), GT im Takt, je Ort beide Sichten | ≥ 90 → ~28–44 | ja (knapp) |
| siedlung.K1#2 (C) | 59 359 Sim-Schritte, Gesetzbuch je Haus doppelt, Einschwingen mit 10 ms Schlaf, 1080p-Innenbilder | Ort genesis, Fenster 800 × 600 wie die Linse (benannt), Takt statt Schlaf | ≥ 90 → ~45–55 | an der Grenze |
| mensch.K1#1+K2#2 (B) | 1 km vom Start-Dorf gemessen; die Stadt mitgefahren; Wanduhr in platz-8.js | am Genesis-Ort ohne Stadt, `platzAcht` im Takt, Wege-Messer 25,3 → 5,5 s, `_bewohnerWand` 1,52 → 1,04 s (Spiel-Code, bit-gleich) | ≥ 90 → ~50–60 | nein |
| fahrzeug.K3#2+K4 (E) | gate:fahr-leben ganz in eigener Null-Welt + `wait` (lief nach „EXIT 0“ bis zum Deckel) | `fahrWelt`: T4/T5 in der EINEN Welt | ≥ 90 → ~50–56 | nein |
| vegetation.K4 (C) | Start-Dorf 1,1 km fern nie fällig; ≈ 3 ungelesene Schüsse je Box-Blick | Ort genesis, W9 schießt nur, was eine Zahl liest: 404 → 112 Aufnahmen (scripts −733 Atome) | ≥ 130 → ~57–86 | nein |
| ferne (A) | ruhender Dorf-Plan hielt das Band offen (bis +240 s); Band-Takte 50 ms; doppelter Luft-Marsch | `_dorfTaktLebt`, Bild-Takt, Luft je Strahl einmal (18,2 → 10,4 Mio. Rufe) | ≥ 90 → ~57–87 | nein |
| studios.K4 (D) | 30 s Wanduhr je Studio, eigener Browser, das Werk stand nie | Browser der Sitzung, Spieler am Fuß der Vorschau, `__gebautNach` | ≥ 90 → ~60–65 | nein |
| vegetation.K5#2 | `/bild --abstand`: 20,8 Mio. Rufe `_bodenSichtAt` (≈ 1 µs) je Wiesen-Schuss — GTX Wiese 30 s, Krone 6–8 s | Marsch je Pose einmal (byte-gleich, 10,4 → 0,08 s) | ~115 → ~71 | nein |
| studios.K2#2+K3#2 (D) | Schlaf 1,5 s je Studio, Polling 150 ms, Neuladen über neuen Tab | (Studio-Hülle am Ereignis — zurückgehalten, siehe DECKE) | ~134 → ~134 (mit der Serie ~118) | nein |

Unter dem Gesetz (hergeleitet): 6 Läufe sicher (lod.K5#1, material.K3+K1 als EIN Lauf, tiere.K2#2, siedlung.K2, bauen.K1#2,
gelaende.K5#2), siedlung.K1#2 an der Grenze; 7 Läufe darüber (von 14 — material.K3 und K1 sind jetzt einer). Die GTX-Eich-Fahrt des Koordinators (90 s je Probe) misst jede Zahl und setzt jeden Deckel (⌈1,5 × s⌉).

## DECKE (gate:betriebsgesetz) — so ausgeglichen

Einzeln: A −6 · B +171 (dazu Spiel +123, `stamm/siedlung-bewohner.js`) · C −733 · E +278 · Zweig a +287 Marsch-Speicher, +110 Bild-Weg,
−132 JSON-Pool · D Studio-Hülle +166. Integriert +141 → ROT. Regel: Spiel-Schnitte nach Rang ins Budget, zuerst, was einen Lauf unter
das Gesetz bringt. Zurückgehalten: Ds Studio-Hülle (studios.K2#2 bliebe ~118 s) — `f7c6b3df`, die Serie unter `stand/spiel-D-studio/`.
Ergebnis: scripts −25, Spiel +123 → GRÜN. Nächster Kandidat, falls Atome fehlen: der Marsch-Speicher (+287, vegetation.K5#2 bleibt ~71 s).

## Fahrt-Budget

A legt material.K3 und material.K1 zu EINEM Lauf zusammen: GTX 72 → 71 Läufe (Σ Deckel 1735 → 1725 s), Radeon 71 → 70 (1740 → 1730 s).
Sonst blieben alle Deckel stehen; die Eichung setzt sie neu.

## Befunde für den Koordinator

- `jagdkreis` am Kopf ist auf der Cloud-Maschine headless ROT („die Jagd hat kein Ende: 2 von 36“): die 7 200 Takte der Kette zwischen den
  Jagden stören die folgenden; ohne Kette GRÜN (B). Die Rudel-Quote 24/60 = 0,40 am Bandrand (OMEN historisch 18/60).
- `tempo4.js` (fahrzeug.K3#1, nicht auf der Liste) räumt mit `delete r._gameLoopTick` ein Feld der Welt — danach hängt jedes Einschwingen
  („DIE WELT HÄNGT … ohne Bau-Ereignis“). `blick.js` ist geheilt, `tempo4.js` nicht angefasst (E).
- Eine Probe ohne eigenes Dorf nach einer Dorf-Probe auf derselben Seite ist ROT (Wache `__dorfVon`), B.
- Der erste Wiesen-Marsch von vegetation.K5#2 braucht einen schnelleren EINEN Boden-Leser (`_bodenSichtAt`, Schlüssel-Strings ⅓ je Ruf;
  Falle: `_finalizeVoxelChunkBuild` liest zwischen `voxelChunks.set` und `_weltRegt`) — als Vorschlag gestellt.

## Der lokale Prüfstand (Cloud-Container ohne GPU) — `3110-stationen-schnell-a/werkzeug/`

- Welt wie die Sitzung: `PORT=<S> node save-server.js &` und `PUPPETEER_EXECUTABLE_PATH=…/chrome-ohne-wachhund.sh xvfb-run -a -s
  "-screen 0 1940x1200x24" node scripts/werkbank.cjs start --echt --holz kienspan --port <S+20000> --seite http://localhost:<S> --ort wiese`.
  Ohne den Wrapper (`--disable-gpu-watchdog`) tötet Chromes GPU-Wachhund den swiftshader-Prozess bei 1080p; ohne `--holz kienspan` dauert
  `umstellen --ort wiese` > 25 min. Höchstens zwei Welten auf 4 Kernen.
- `probe-lokal.cjs --koord <Koord-Baum> --baum <Spiel-Baum> --port <S> --nur <id> --sek 90 --log <werkbank.log>`: eine Station über
  `fahreStation` der Maschine gegen diese Welt. Null-Welt (ohne GPU): `null-marsch.cjs <Spiel-Baum> <port> <seitencode.js> 1`.
- Swiftshader-Wanduhr ist nie GTX-Zeit: GTX = Aufnahmen × 0,43 s + gemessene Seiten-CPU + Einschwingen.

## Stand der Arbeiter

`stand/spiel-<X>/`, `stand/koord-<X>/`: die Commits der Arbeiter A, B, C, E als `git format-patch` (in beide Zweige übernommen);
`stand/spiel-D-studio/`: die zurückgehaltene Studio-Hülle; `stand/BERICHTE.md`: die Berichte der Arbeiter verdichtet.

## Nächste Schritte

1. Koordinator: GTX-Eich-Fahrt am Kopf mit beiden Zweigen (die Deckel aus den Zahlen), voller Playtest und GPU-Gates beim Merge.
2. Die sieben Läufe über dem Gesetz: je Lauf der benannte Rest in der Tabelle und in `stand/BERICHTE.md` (dort der Beleg je Posten).
