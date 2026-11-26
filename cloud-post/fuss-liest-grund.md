# fuss-liest-grund — Der Fuß liest den Untergrund aus der Welt (Stufe · Hang · Gerät)

ZWISCHENSTAND · beansprucht: `karte2.mensch.sport.koerper#2` · Kopf: Vorprüfung fuss-liest-grund 3 auf buendel-mittag 8d0a9ebe (main c814741e; gemessen an 52c07c4a, dazwischen keine Datei des Körpers, der Umschlag neu erzeugt =) — Post 12:29: Kopf 2 (f548c7b3, GPU-Probe GRÜN) fiel am Puls 2/2, Daten-Vertrag v7 GOLDEN koerper-core; Post 11:44/12:04: Kopf 1 (51d1bef2, GPU-Probe GRÜN) legte sich nicht glatt auf das Bündel (diag-koerper-kern, recipes)

## Geschnitten

Die Wurzel des Gleitens lag in EINEM Gang-Gesetz, nicht je Untergrund:

1. **Die Steigung des Gangs** — koerper-core `leibSteigung` (additiv, Zeile `hang`): Hang und Treppe ein Gesetz. Bis 10 % bleibt das
   Tempo (Leroux, Fung & Barbeau 2002); darüber reicht der Doppelschritt höchstens 2·hubSchritt/|g| (eine Stufe 0,17 m je Schritt),
   das Tempo höchstens Kadenz × Schritt (hinauf 1,40 Schritte/s, hinab 1,66 — Riener, Rabuffetti & Frigo 2002). Der Wirt liest sie
   einmal (`_steigung` aus `_gaitBodenY` 0,6 m voraus, geglättet; koerper-bewegung → `K.hang`, koerper-seele → `_gaitTick`).
   Vertrags-Akt am Umschlag (`MINT_NUR_DATEN=1`): recipes.json trägt die sieben neuen Schlüssel der Zeile, jede Geometrie-Golden
   bleibt byte-gleich (world-params, render-config =). Vertrags-Akt am Daten-Vertrag v7 (Golden gelöscht, vom Tor neu gemintet,
   Akt in `spec/asset-contract/v7/CONTRACT.md`): koerper-core 1827ac1f → 5829e10d, genau diese sieben Felder, klang- und
   tetrapoda-core byte-gleich (Byte-Beweis Blatt für Blatt gegen 8d0a9ebe).
2. **Der Fuß im Stand** — stamm/koerper-leib.js: das Becken sinkt auf der Steigung bis zu einer Stufe; der Schwung liest den Boden
   unter der Sohle (die Zehe frei vor der Setzstufe); der Auftritt wird EINMAL je Schwung gesucht, Abheben und Aufsetzen gehen
   stetig vom Lock zum Auftritt; **die Kette dreht im Rahmen des Beckens** (`_gaitRahmen`, neues Glied der Modul-Karte): die Neigung
   des Beckens drehte vorher das gelockte Bein mit, der Fuß kroch im Stand vor (Mess-Treppe 1,92 → 0,18 cm).
3. **Die Spur des Balkens** — koerper-core `leibStossPose`: im Verb `balancieren` rollt jedes Bein vor der Fuß-IK auf die Linie
   (Tandem-Gang); vorher rollte `leibLuftPose` die Hüften nach der IK, sie las das Gelände neben dem 0,10-m-Balken, die Sohle stand
   24 cm im Holz.

**Die Linse (Gebot 10):** gate:koerper-stand K8 misst das Gleiten im Stand auf der Mess-Treppe (Ferse und Ballen, |h| ≤ 1 cm über
`_gaitBodenY`, je Phase der Weg, Soll ≤ 0,75 cm), Täter beim Namen `_gaitRahmen`; Mutante „rahmen“ (`_gaitRahmen = () => 0`) → ROT an
der Wiese (1,16 cm am Bündel, 1,55 cm am main c3631992). gate:koerper-kern trägt die Steigung (G0–G4, 4 Täter-Mutanten; am alten main ROT an G0).

**Die Station:** Kandidat unter `cloud-post/fuss-liest-grund-station/` (kandidat.diff gegen punkte-maschine 404008d6 + BEGRUENDUNG.txt):
die LEIB-Probe stellt die drei Untergründe in der Welt (Mess-Treppe, Schwebebalken `_geraetAngebotWelt`, `__weltOrt("hang")`) und
misst gegen `_gaitBodenY` — die alte Probe stellte keinen, Umfang 0 war ihr Bau.

## Gemessen (vorher → nachher, gleiche Bedingungen: Null-Renderer-Welt, Mess-Wiese, der Kandidaten-LEIB wortgleich)

| | buendel-mittag 52c07c4a | fuss-liest-grund 2 |
|---|---|---|
| Umfang (S2) | 2 [stufe, hang] | **3** [stufe, hang, geraet] |
| Stufe | 22 Phasen, Gleiten 22,72 cm, Fuß −30,5 cm | 12 Phasen, **0,14 cm**, 0,45 m/s |
| Hang 10,1° | 0,13 cm | 0,16 cm (9,8°) |
| Gerät | 0 Phasen, Sohle −24,8 cm im Balken | 7 Phasen, **0,54 cm** |
| Fläche gehen · laufen | 1,72 · 2,54 cm | 0,04 · 0,03 cm |
| Gleiten max | 22,72 cm (S2 ROT) | **0,54 cm** (S2 GRÜN) |

Kopf 1 am main c3631992 maß dasselbe Vorher und nachher 0,51 cm max (Stufe 0,19 · Gerät 0,51 · Hang 0,16). Kopf 3 trägt den Code
von Kopf 2 byte-gleich, dazu nur das v7-Golden und seinen Akt.

- Die alte Station selbst (vor dem Kandidaten): Umfang 0, Hang 3,4°, Gleiten 2,46 cm.
- Kern (gate:koerper-kern): 30°-Treppe hinauf 0,412 m/s, 84,0 Schritte/min, hinab 99,6/min (Riener 2002: 81,6–85,7 · 98,4–100,8);
  bis 10 % Tempo und Doppelschritt gleich der Fläche (1,576 m/s, 1,413 m).
- gate:koerper-stand K8: Stufe p95 Wiese 1,1 / Hang 1,3 cm (Bündel 1,4 / 1,7), Gleiten 0,36 / 0,23 cm.
- Station-Wände: die Liste der Punkte-Maschine: Basis = Kandidat (1976 · 420 · fehlt 15 · Fehler 0); k2-mensch Selbsttest sport GRÜN
  (54 / 557 / 0); Leiter Null-Welt 34,0 → 46,0 s.
- GPU-Probe Kopf 1 (radeon-890m): gate:kampf-gefuehl GRÜN 128 s · gate:webgl-probe GRÜN 56 s; Kopf 2 f548c7b3 (omen-gtx1060):
  gate:kampf-gefuehl GRÜN 92 s · gate:webgl-probe GRÜN 47 s (411 s).
- Lokal GRÜN am Bündel: gate:kampf-gefuehl (79 s), gate:webgl-probe (94 s), gate:koerper-kern (73 Täter), diag-atlas --check,
  stamm:lint; an Kopf 1 auch kreatur-takt bewohner (89 von 89 Leibern) · querhang · gestalt · todlage.

## Offen (Grund · Messname)

- Stufe: die Spitze reicht unter die Setzstufe (tief −9,8 cm am Bündel, −4,4 cm am main) — der Auftritt sucht die Sohle, nicht die Kappe der Zehe · Station LEIB
  `stufe.tiefCm`.
- Treppab-Kadenz in der Welt ungemessen (nur im Kern, 99,6/min) · diag-koerper-kern STEIGUNG.
- Laufen auf der Treppe deckelt an der Geh-Kadenz — kein Band für Treppen-Sprint gelesen · keiner (offen).
- Bergauf wachsende Schrittlänge (Leroux 2002) nicht modelliert: bis 10 % bleibt der Schritt gleich · diag-koerper-kern G0.
- Leiter-Zeit an der GTX geschätzt (≈ 42 s ≤ 60) · richter akte mensch.sport.koerper.2 preis/fenster.
- Die Mutante „rahmen“ macht nur die Treppe der Wiese ROT, an der Hang-Treppe nennt der Selbsttest sie nicht · gate:koerper-stand Selbsttest „rahmen“.
- Lokal am main ebenso ROT (geerbt, nicht dieses Zweigs): gate:koerper-stand Selbsttest „wiese“, „ring“, K7 Aufbau (403 Büschel,
  35 Pflanzen) — die Null-Welt dieser Sitzung; am Bündel 52c07c4a dazu K8 streu wiese p95 3,3 cm (die nackte Basis ebenso).
- leib-liest-satz-2 Schritt 2 (Umkleiden im Verweilen) und 3 (Werk-Geste, Fitts): nicht weiter gebaut auf Post 08:54 (der Zweig
  steht im Bündel `buendel-volk`).

Karte 2 gebucht 126 von 1 718 · ZWISCHENSTAND
