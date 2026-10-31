# Übergabe w4-stationen-schnell-a — ZWISCHENSTAND 31.10., 23:15

Auftrag (Koordinator „Messplatz und Meisterkarte“): die Läufe der Punkte-Maschine, die auf der GTX ≥ 90 s brauchen und jeden Deckel
reißen, schnell machen — Station ≤ 60 s in EINER warmen Welt, Ziel ≤ 15 s, Deckel 45 s; Warten im Bau-Ereignis, nie ein Ganz-Welt-Boot
je Probe, das Kriterium bleibt. Liste (Eich-Fahrt GTX b4bcf19c): vegetation.K5#2 · lod.K5#1 · ferne.K1#1+K2#1+K1#2+K2#2 · gelaende.K5#2 ·
material.K3 · material.K1 · mensch.K1#1+K2#2 · vegetation.K4 · tiere.K2#2 · studios.K2#2+K3#2 · bauen.K1#2 · studios.K4 ·
fahrzeug.K3#2+K4 · siedlung.K2 · siedlung.K1#2 (15 Läufe).

## Zweige (gepusht)

- Koord `w4-stationen-schnell-a-koord` (Basis origin/punkte-maschine 359ce394): `94f8224e` lod.K5#1 · `d2b0556c` + `b3f390f2` (D) studios.K4
  im Browser der Sitzung, bauen.K1#2 ohne Neuladen · dazu diese Übergabe mit `3110-stationen-schnell-a/` (Patches, Prüfstand).
- Spiel `w4-stationen-schnell-a` (Basis origin/main f0dab43d): `47022bfc` + `70766788` `bild --abstand` marschiert je Pose einmal, Zählung
  im Gang der Maske · `7411e2dc` `91b94f56` `e77de904` (D) Studio-Hülle am Ereignis, Zeit-Zeile, Bild-Weg räumt sein Kalt und baut beim
  Spieler · `4942fc5f` Decke: JSON-Lesung/-Schreibung in vier Linsen.
  **NICHT MERGEN:** `npm run check` ist ROT an der DECKE (gate:betriebsgesetz): scripts/ +431 Atome (werkbank.cjs +287,
  diag-studio-huelle.cjs +166, diag-werkstatt-weg.cjs +110, JSON-Pool −132). Alles andere in `check` GRÜN.

## Je Lauf — Täter, Schnitt, Dauer GTX vorher → nachher

| Lauf | Täter (Beleg) | Schnitt | GTX | Stand |
|---|---|---|---|---|
| lod.K5#1 | kanten.js: die Höhen-Schleife des Baums mit verkehrter Bedingung `F.kind !== "tree" \|\| …` wartete an Haus, Haus, Tor, Tor, Wagen je 400 × 50 ms (Null-Welt ohne Aufnahmen 108,5 s, davon 104 s) | `__gebautNach` je Wartestelle, Höhe nur am Baum, ein Fall ohne Stufe steht nach 120 leeren Takten beim Namen | ≥ 90 → ~13–17 s (22 Aufnahmen × 0,43 s + Lieferungen; Null-Welt 4,2 s ohne Aufnahmen, 7/7 Fälle, Treue 0 B) | Koord committet |
| vegetation.K5#2 | `/bild --abstand`: 20,8 Mio. Rufe `_bodenSichtAt` (≈ 1 µs) je Wiesen-Schuss — GTX Wiese 30,3–30,8 s, Krone 5,9–8,1 s | Marsch je Pose einmal (byte-gleich zu main, 10,4 → 0,08 s), `nurPixel` 145 → 5 ms | ~115 → ~71 s — über dem Gesetz | offen: der erste Marsch (~20 s) braucht einen schnelleren EINEN Boden-Leser (Vorschlags-Karte „Make the ground reader _bodenSichtAt faster“; Falle: `_finalizeVoxelChunkBuild` liest zwischen `set` und `_weltRegt`) |
| bauen.K1#2 (D) | Neuladen der Welt je Lauf; der erste Lauf sprang 1 082 m zur Genesis-Lichtung | kalt per `_foundryCacheEvict`, Platz beim Spieler (> 160 m von der Lichtung) | ≥ 90 → ~20–45 s (hergeleitet) | Koord + Spiel committet |
| studios.K4 (D) | 30 s Wanduhr je Studio, eigener Browser, das Werk stand nie (ruhender Loop bestellt nichts; 22,6 m nur Karte) | Browser der Sitzung, Spieler am Fuß der Vorschau, `__gebautNach` | ≥ 90 → ~60–65 s — über 45 | committet; Rest: Weltbilder 3,6–8,8 s je Studio |
| studios.K2#2+K3#2 (D) | Schlaf 1,5 s je Studio, Polling 150 ms, Neuladen über neuen Tab | Leiste am Ereignis, Bild je Griff in der Seite, Neuladen im selben Tab | ~134 → ~118 s — über 45 | committet; Rest: Neubauten der Studios (fachwerk bis 4,1 s) |
| ferne.K1/K2 (A) | in Arbeit | Band schwingt im Bild-Takt; Luft marschiert neben ihren Schüssen, je Blick einmal | Bericht A ausstehend | `stand/spiel-A.patch`, `stand/koord-A.patch` |
| material.K3, material.K1 (A) | in Arbeit (Labor = eigener Browser) | Albedo-Tafel taktet im Bild, Halb-Floats über eine Tafel, eicht nur im Gang, der die Karte liest | ausstehend | dito |
| mensch.K1#1+K2#2, tiere.K2#2 (B) | in Arbeit (tiere.K2#2: eigene Null-Welt `jagdkreis` + `wait`) | `scripts/lib/kreatur-proben.cjs`, `stamm/siedlung-bewohner.js` (!) | ausstehend | `stand/spiel-B.patch`, `stand/koord-B.patch` |
| vegetation.K4, siedlung.K1#2, siedlung.K2 (C) | in Arbeit | gate:haus-welt W9 schießt nur, was eine Zahl liest (scripts −733 Atome) | ausstehend | `stand/spiel-C.patch`, `stand/koord-C.patch` |
| fahrzeug.K3#2+K4, gelaende.K5#2 (E) | gelaende: `gezeichnet` schnitt je Strahl 21 352 Dreiecke | EIN Gitter je Netz, je Strahl nur das Lot — byte-gleich, 1,1–1,5 → 0,012–0,015 ms je Strahl, lokal Rad 25,3 → 11,4 s | ausstehend | `stand/spiel-E.patch`, `stand/koord-E.patch` |

Die Patches sind `git diff --binary <Basis>` des Arbeitsbaums (committet + offen) — Basis in `stand/BASIS.txt`.

## DECKE — der offene Schritt vor jedem Merge

Bilanz 22:50 (je Spiel-Baum `node scripts/diag-betriebsgesetz.cjs`): A +789 · B +209 · C −733 · E +330 · Zweig a +431 → Σ ≈ +1 026 Atome.
Regel: Spiel-Schnitte gehen nach Rang ins Budget — zuerst, was seinen Lauf unter das Gesetz bringt (Punkte); dann der Rest, solange
Σ ≤ 0. Kandidaten zum Zurückhalten (bringen keinen Punkt): der Marsch-Speicher (+287, vegetation.K5#2 bleibt ~71 s), die Studio-Hülle
(+166, studios.K2#2 bleibt ~118 s). Zentraler Zahler ohne Arbeiter-Datei: der Null-Welt-Boot-Zwilling (`server.lausche(0)` +
`nullSeite({ frist: 300000 })` + `server.zeige(page, …)` in ~12 Linsen, u. a. diag-blocker-netz, diag-raum-tags, diag-scatter-lod).
Klone ≥ 9 Zeilen gibt es kaum (einer: diag-werk-im-wasser 414/1711), tote Glieder keine.

## Fahrt-Budget

Deckel unverändert gelassen: Σ Radeon 1740/1740 s, GTX 1735 s — `scheiben` gtx und radeon Exit 0. Die GTX-Eich-Fahrt (90 s je Probe)
setzt jeden Deckel aus der Zahl (⌈1,5 × s⌉); lod.K5#1 wird dann ~20–26 s brauchen (heute 10 s).

## Der lokale Prüfstand (Cloud-Container ohne GPU) — `3110-stationen-schnell-a/werkzeug/`

- Welt wie die Sitzung: `PORT=<S> node save-server.js &` und
  `PUPPETEER_EXECUTABLE_PATH=…/chrome-ohne-wachhund.sh xvfb-run -a -s "-screen 0 1940x1200x24" node scripts/werkbank.cjs start --echt --holz kienspan --port <S+20000> --seite http://localhost:<S> --ort wiese`
  — ohne den Wrapper (`--disable-gpu-watchdog`) tötet Chromes GPU-Wachhund den swiftshader-Prozess bei 1080p („A valid external Instance
  reference no longer exists“); ohne `--holz kienspan` dauert `umstellen --ort wiese` > 25 min. Nie mehr als zwei Welten auf 4 Kernen.
- `probe-lokal.cjs --koord <Koord-Baum> --baum <Spiel-Baum> --port <S> --nur <id> --sek 90 --log <werkbank.log>` fährt eine Station über
  `fahreStation` der Maschine gegen diese Welt.
- Null-Welt (ohne GPU, Sekunden): `null-marsch.cjs <Spiel-Baum> <port> <seitencode.js> 1` — CPU-Messungen (`marsch-mess.js`,
  `leser-mess.js`), Warte-Mechanik (`kanten-mess.js` alt / `kanten-neu-mess.js` neu), `abstand-treue.cjs` (Byte-Beweis des Marsch-Speichers
  gegen main).
- Swiftshader-Wanduhr ist nie GTX-Zeit: GTX = Aufnahmen × 0,43 s + gemessene Seiten-CPU + Einschwingen.

## Prüfungen am Stand

Koord: `punkte.cjs liste` Fehler 0 · `selbsttest --ohne 3c` GRÜN 121/121 · `scheiben --sha b4bcf19c` gtx und radeon Exit 0.
Spiel: `npm run check` ROT nur an der DECKE · gate:altlasten GRÜN · diag-v1-pfad `--selftest` `--korpus` `--feind` GRÜN.

## Nächste Schritte

1. Die Berichte von A, B, C, E einsammeln (Patches hier), in die beiden Zweige übernehmen — Konflikte erwartbar in g2.js (B + C) und g5.js
   (C + E); jede übernommene Station: `liste`, `selbsttest`, `scheiben`.
2. Die DECKE nach der Regel oben auf Σ ≤ 0 bringen, `npm run check` GRÜN, dann Push beider Zweige; der Koordinator merget und eicht.
