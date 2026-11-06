# Radeon-Vorprüfung 06.11. (vp-0611c) — w13-verkehr-heil

Basis main ff79cba4. Kandidat = main + `git merge --no-edit origin/w13-verkehr-heil` (0475c204, Kandidat 889aa488). Gerät Radeon 890M,
`werkbank start --echt` (Port 7750/7751), Verfahren wie vp-0611 §1: stadt-voll (`umstellen --ort stadt-voll`, 1089 Bewohner, Spieler
836,2/438,5), je Stunde `_uhrSetzen`, `lauf 20 --regler voll`, dann 40 Proben im Sekunden-Takt im echten Loop (15–55 s nach dem
Uhr-Sprung), Wagen-Bild und Übersichtsblick `bild 858.1 +28 460.2 836.1 +0 438.2`. Je Seite EINE warme Welt für die Tafel; dazu je
Seite drei weitere warme Welten nur für den CPU-Takt um 23 Uhr (Reihenfolge main·Kand | Kand·main | main·Kand | Kand·main, je Welt 2–3 `lauf 20` direkt nach dem Sprung auf 23 Uhr). Bild-Paare: links main,
rechts Kandidat, je Seite 637 px. Die Bilder habe ich selbst angesehen.

## Urteil: LANDEFÄHIG

(1) 20 von 20 fahren in Minute 1 um 10 und 23 Uhr (Soll ≥ 18). (2) CPU-Takt 23 Uhr p50 über vier warme Welten je Seite: Kandidat Mittel 18,40 / Median 17,76 ms gegen main 17,09 / 16,21 ms = +1,31 / +1,55 ms (Soll ≤ +2 ms). (3) Der Übersichtsblick steht 2 von 2 und ist bildgleich mit main, dazu fahren Wagen darin.

| Zelle | Wagen | fuhren ≥ 30 m in 40 s | standen (< 2 m) | Karosserie in Karosserie (Paar-Proben, tiefste) | Sitz-Knochen außer der Kabine | Frame p50 / p95 / max | CPU-Takt p50 / p95 |
|---|---|---|---|---|---|---|---|
| main 10 Uhr | 7 | 4 | 1 | 124, 1,82 m (Wagen 1/3 bei 823/441) | 0 / 229 | 25,1 / 41,8 / 75,3 ms | 22,0 / 37,4 ms |
| Kandidat 10 Uhr | 20 | **20** (76–264 m) | 0 | 0 | 0 / 234 | 24,7 / 34,0 / 75,1 ms | 17,1 / 32,0 ms |
| main 23 Uhr | 7 | 3 | 0 | 167, 1,83 m (Wagen 2/4 bei 822/441) | 117 / 231 (Hüfte 1,91–1,96 m, Dach 1,42–1,44 m: AUF dem Dach) | 24,9 / 33,5 / 108,7 ms | 15,1 / 27,6 ms |
| Kandidat 23 Uhr | 20 | **20** (53–236 m) | 0 | 0 | 0 / 236 | 25,0 / 41,7 / 159,0 ms | 20,2 / 34,5 ms |

Übersichtsblick 28 m über dem Markt: main 2 von 2 (423 / 392 ms), Kandidat **2 von 2** (424 / 398 ms) — kein „DIE WELT STEHT NICHT“ mehr
(w12-verkehr: 0 von 2). Bild-Luma main/Kandidat 67,3/67,7 (10 Uhr) und 20,9/21,0 (23 Uhr).

## CPU-Takt 23 Uhr — die Zahl, die entscheidet

Die eine Zelle des Verfahrens (Welt 1) sagt main 15,11 → Kandidat 20,23 ms (+5,1 ms). Dieselbe Zelle streut aber am SELBEN Stand
zwischen warmen Welten um mehr als das: main 15,1–20,8 ms, Kandidat 14,5–23,3 ms. Darum je Seite vier warme Welten (Hauslehre: A/B nur
bei gleicher Szene oder ≥ 4 Boots je Seite), abwechselnd, 9 Läufe je Seite:

| Seite | CPU-Takt p50 je Lauf (ms) | Mittel | Median | Frame p50 | Frame p95 auf 41,7 ms (5 Vsync) |
|---|---|---|---|---|---|
| main | 15,11 · 20,83 · 15,79 · 17,51 · 16,21 · 15,49 · 19,17 · 18,26 · 15,40 | 17,09 | 16,21 | 24,3–25,1 ms | 4 von 9 |
| Kandidat | 20,23 · 16,65 · 19,24 · 17,76 · 23,29 · 15,04 · 16,18 · 22,66 · 14,53 | 18,40 | 17,76 | 17,0–25,2 ms | 5 von 9 |

+1,31 ms im Mittel, +1,55 ms im Median: unter der Grenze +2 ms, bei fast dreifacher Zahl fahrender Wagen (20 gegen 7). Die Verdopplung
von w12-verkehr (37,3 ms) ist weg: kein Kandidaten-Lauf liegt über 23,3 ms.

Wohin die Zeit geht (`werkbank takt 20 --wandern aus`, 23 Uhr, die Takte ab p95, Welt 2): `_verkehrSchritt` Mitte 1,24 ms (main 1,92 —
die gestauten Wagen von main suchen teurer), `renderer._renderScene` Mitte 9,1 ms (main 8,4: 13 Wagen samt Fahrer mehr im Bild),
`_tickBewohner` Spitze 8,3 ms (main 12,2). Rest: das längste Bild 159 ms in Welt 1 des Kandidaten (main 109 ms) blieb einmalig, in
den Welten 2–4 höchstens 67 ms an beiden Seiten.

## Bilder

- `verkehr-10-ueber-paar.png`, `verkehr-23-ueber-paar.png` — der Übersichtsblick, beide Seiten stehen; dieselbe Stadt, dieselben Häuser,
  Bäume und Lichter, nichts fehlt und nichts bricht. Ausschnitt `verkehr-10-ueber-zoom.png`: links main ein blauer Wagen am Markt,
  rechts der Kandidat mit einem gelben Wagen auf der Gasse unten links, einem orangen und einem dunklen am Markt — die Stadt fährt.
  `verkehr-23-ueber-zoom.png`: rechts ein heller Wagen in der Gasse links der Häuser.
- `verkehr-10-wagen-paar.png`: links main der silberne Wagen mit der Haube im Heck des blauen (Karosserie in Karosserie, beide mit
  Fahrer), rechts der Kandidat: die Gasse ist leer, der nächste fahrende Wagen ist zwischen Sonde und Schuss davongefahren.
- `verkehr-23-wagen-paar.png`: links main ohne Wagen (er fuhr aus dem Bild, wie in vp-0611), rechts ein heller Wagen fährt die
  beleuchtete Gasse hinunter.

Bild-Grenze: das Wagen-Bild zielt auf die Lage aus der Sonde; der Schuss kommt Sekunden später, ein fahrender Wagen ist dann weg. Die
Fahrer-Lage trägt darum die Zahl (Sitz-Knochen 0 von 234/236 außer der Kabine), nicht ein Nahbild.

## Was der Zweig heilt (gegen vp-0611 §1)

- (a) Fluss: w12-verkehr 9 und 8 von 20 ≥ 30 m in Minute 1, 11 und 10 standen → jetzt 20 und 20, 0 stehen, der kürzeste Weg 76 m
  (10 Uhr) und 53 m (23 Uhr) in 40 s. Zustand `faehrt` 20 von 20 in jeder Probe (main 7 von 7, davon fahren 4 und 3).
- (b) Nacht: w12-verkehr CPU-Takt 23 Uhr p50 37,3 ms, Frame p95 58,5 ms → jetzt 15,0–23,3 ms, Frame p95 33,4–41,8 ms — im Band von main.
- (c) Übersichtsblick: w12-verkehr 0 von 2 („Fege-Takt nahWiese wartet“) → jetzt 2 von 2, bildgleich mit main bis auf die fahrenden
  Wagen.
- Weiter geheilt (wie w12-verkehr): 0 Karosserie in Karosserie (main 124 und 167 Paar-Proben, bis 1,83 m tief), 0 Fahrer außer der
  Kabine (main um 23 Uhr 117 von 231 Proben auf dem Dach).

Hinweis: der Zweig setzt den Anker von stadt-voll auf den Millimeter (`spec/profiband/haushalt.json`, `werkbank.cjs` ±1 mm statt ±1 m);
`umstellen` stellt den Spieler an beiden Seiten auf 836,2/438,5, beide Städte tragen 1089 Bewohner. main fährt 7 Wagen, der Kandidat 20 —
der CPU-Takt des Kandidaten trägt fast dreimal so viele fahrende Wagen samt Fahrer.
