# 37 Streaming, Chunks, LOD-Haushalt — der Rand des Walds ist EIN Maß

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/wiese-mitte/heute-wiese-fov20-rot.png` (Mess-Wiese, Fernglas 20°): hinter dem Gras steht der ferne Wald als
  Reihe dünner Stämme ohne Krone und kleiner dunkler Nadel-Spitzen vor grauem Grund; zwischen den Reihen offene graue Fläche,
  kein Kronendach. Vorn rechts zeigen die Kronen-Ränder Punkt-Raster (Dither). Das ist der Wald-Rand, den die Fahrt zählt.
- `scratchpad/wiese-mitte/oben-heute-huegel.png` (von oben, nah): Wald und Wiese stehen geschlossen — nah keine Lücke.
- Kein Bild unter Tempo gesehen (die Fahrt ist headless). Kein Bild der Weide am Wechsel-Abstand gesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; KANN gegen KONSUMIERT)
Streaming (streaming 5 Punkte, K1 und K2 je 0/2):
- Die Fahrt (pm `stationen/g6.js:2256–2455`): Sprint + GT-vmax je 60 s, Lücke = Ding im Kegel ohne Gestalt; Bedarf eines
  Baums/einer Karte beginnt, sobald die MITTE SEINES CHUNKS ≤ `PERF_FOLIAGE_RADIUS_MAX` = 240 m (`g6.js:2328–2339`,
  `dirigent-regler.js:1989`). Soll 0 Lücken-Bilder, ≥ 95 % fertig beim Eintritt je Klasse.
- Verlauf (pm `messung/*-headless.json`): w7-rang 03.11. GRÜN bei GT 16,0 m/s (0 von 3 587). w11-fahrzeug 04.11. (1ae8a8cf)
  macht die GT-vmax zu 63,82 m/s (`vehicle-core.js:3386–3428`) → ab 06.11. ROT 2 352–2 461 von ~2 400 GT-Bildern.
  w22-wald-geburt 08.11. (4d4ac53b) → am 6aa7a5a6 (10.11., letzte Probe, UNGEMESSEN wegen Fremd-Last) reißt auch der SPRINT
  5,2 m/s: 4 771 von 5 412 Bildern, Täter-Klasse `karte` 29 744, Zeugen bei 211 · 211 · 218 m. Vor w22 (25374f6f, 06.11.): Sprint 0.
- K2 am 6aa7a5a6: boden 97,7 % · baum 58,4 % · karte 49,8 % · bau 92,4 % (78d37554: 94,4 · 73,3 · 46,8 · 93,7). Der Boden ist
  seit w14-strom-tempo geheilt (07.11. 25,5 %); offen sind Baum und Karte.
- DREI Ränder des Walds im Spiel, keiner gleich dem der Probe:
  (1) Saat je Chunk: Mitte entlang der Bahn ≤ `_laubRand()` (`gelaende-chunks.js:1034–1047`);
  (2) Eintritt jeder Wald-Karte vom SPIELER bei `max(150, _laubRand() − 32·u)` (`studio-bruecke.js:3421–3428`, Leser
      `vegetation-baum.js:2814–2819`), also 208–240 m — INNEN vor dem Laub-Rand;
  (3) Kronendach des Bodens (Fern-Krone) erst AB `waldR = _laubRand()` mit Saum 30 m nach AUSSEN
      (`gelaende-fern.js:1653, 1704, 1763–1766`).
  Zwischen (2) und (3) trägt ein gesäter Baum weder Karte noch Dach: das Band 0–32 m je Baum ist die Lücke der Fahrt
  (Zeugen 211–218 m) und der graue Grund im Bild oben.
- `_laubRand()` selbst: headless 240 m (`dirigent-regler.js:328`), an der GPU gekappt auf (Ring+1)·43,2 = 216 m
  (`dirigent-regler.js:337–343`; lod.K2#1 Radeon „Laub 216–216 m").
- Ring und Vorlauf: Spanne 43,2 m (`gelaende-boden.js:2611–2621`), Ring 4 = 172,8 m; `BEDARF.vorlaufS` 3 s, Kommentar
  „die Bahn legt in 3 s 48 m zurück" (`studio-bruecke.js:3830–3839`) — gerechnet für 16 m/s; bei 63,8 m/s sind es 191 m.
  Der Strom baut darum den zweiten Ring am Ort des Vorlaufs (`gelaende-chunks.js:2734–2740, 2834–2839`), Boden-Fenster
  `BODEN_IM_FLUG` 4 (`gelaende-chunks.js:3388`), Kappe 6 Bauten / 4 ms je Takt (`:2749–2752`).
LOD (lod 3 Punkte, K1 und K5 je 0/2):
- Das Gesetz des Wechsels (`vegetation-streu.js:2969–2978`): eine Stufe gilt ab dem Abstand, an dem ihr Fehler 1 px trägt,
  frühestens am Haushalt. Tafel `LOD_SCHIRM.fehler` (`:2880–2954`): Tor, Haus, Ausstattung je Vorlage — `tree: je({})`
  (`:2892`) LEER: der Baum wechselt am Haushalt (`_stufenSchirm` `:1922–1945`), ohne Pixel-Term.
- lod.K5#1 Radeon am ec281422 (heute, pm `messung/roh/ec281422-radeon/lod.K5_1.json:70–204`): Weide L2 bei 26 m **3,128 px**,
  Geisttor L2 bei 133,85 m 1,401 px (244 Pixel), Haus 0,18, Wagen 0,03 → ROT an Baum und Tor (Soll ≤ 1 px, `g3.js:3092–3123`).
- Hinausschieben ist kein Weg (FUND-REGISTER Z. 158, Cloud w28-baum-wechsel): Mess-Wiese 328 283 → 1 247 485 Dreiecke bei
  Soll 680k; die Weide trägt bei 5 × Haushalt noch 1,46 px. Der Fehler sitzt in der KARTE (Tiefe nur an 3 × 3 Ecken,
  Zelle 128 × 256, `KARTE_GITTER` `stoff-karte.js:2030`) — dieselbe Wurzel wie Pflicht A laub-kante und lod.K1.

## Die EINE begrenzende Entscheidung
Der Rand des Walds ist EIN Maß: die Mitte des Chunks entlang der Bahn gegen `_laubRand()` — dort wird gesät UND dort ist
jeder Baum Bedarf. Der Saum jedes Baums (32·u aus seinem Samen) liegt AUSSEN (Laub-Rand … Laub-Rand + Saum), wo das
Kronendach der Fern-Krone ihn ohnehin übernimmt — nie innen. Kein Soll, keine Schwelle, kein Ring wird bewegt.

## Der Schnitt (die Klasse ganz)
Stufen des Rands (alle in EINER Welle): Saat → Pflanzung → Karten-Eintritt → Einblende (`KARTEN_EINTRITT_TAKTE`) →
Kronendach → Karten-Horizont außen (352–384 m, unverändert).
1. `studio-bruecke.js:3425–3427` `_archKartenHorizont(eintritt)`: der Eintritt eines Wurfs des Felds liest denselben Abstand wie
   die Saat (Mitte seines Chunks entlang der Bahn, `_bedarfAbstand`) gegen `_laubRand() + saum` statt Spieler-Abstand gegen
   `_laubRand() − saum`; die Mesh-Zonen-Klausel (`max(R, …)`) bleibt.
2. `gelaende-chunks.js:1046` `_foliageChunkInRadius`: die Saat reicht `KARTEN_HORIZONT_SAUM_M` weiter (`fr + 32`), damit jeder
   Baum, dessen Saum außen liegt, gesät ist, bevor er eintritt.
3. `gelaende-fern.js:1764`: das Dach blendet über denselben Saum (32 statt `saumM` 30) — eine Zahl, `KARTEN_HORIZONT_SAUM_M`.
Leser-Liste (wer liest, was sich ändert): `vegetation-baum.js:2814, 2829` (Eintritt/Räumen), die Probe
(pm `g6.js:2337` liest `_archKartenHorizont` ohne Eintritt — unverändert), `_weltbildFehlt` (Mesh-Zone, unverändert),
`gelaende-chunks.js:1060ff` `_tickFoliageGrowth`, Fern-Krone `_fernKroneOhneWald` (Boden-Stoff, `siedlung-wege.js:907`),
`gate:pop` / lod.K2#1 (`bericht/2910-lod-k5/pop.js`), Wach-Schlaf `vegetation-baum.js:2835`.
Kosten-Zeile: mehr Karten im Außen-Band 240–272 m (≈ +27 % Fläche des Laub-Kreises, nur instanzierte Karten, nur im Kegel) —
VOR der Abgabe an der Mess-Wiese zählen: Dreiecke/Draws gegen Soll 680k (lod.K2-Lauf), Frame p95 GTX ≤ heute 16,8 ms (Pflicht E).
Reißt es: der Saum außen wird schmaler, nie wieder innen.
Kriterien: streaming.K1#1 (headless) Ist Sprint 4 771/5 412 · GT ~1 754/1 794 Lücken-Bilder ↔ Soll 0 · streaming.K2#1 (headless)
karte 49,8 % · baum 58,4 % ↔ ≥ 95 % · lod.K2#1 (radeon/gtx) Ist 0,0474 %/s ↔ ≤ 0,05 % (darf nicht reißen). Erwartet nach dem
Schnitt: der Sprint grün, die Karte im GT ≥ 95 %; der Baum im GT (Mesh-Zone ≤ 150 m) bleibt offen.
Bildpaar: Mess-Wiese, Fernglas 20° und Auge 1,7 m Richtung Wald-Rand, vor/nach, Mittag; dazu von oben (Hügel, 60 m).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Für den Rand: nichts. w22-wald-geburt ist gelandet (4d4ac53b, 08.11.) und ist die Ursache des Sprint-Bruchs.
- lod.K5 Baum: `w28-baum-wechsel` 37526fb7 TOT (FUND Z. 245; Mechanismus „je Vorlage" in gate:scatter-lod W liegt WIP f54eba48);
  `w28-baum-wechsel-pm` f7bceb09 (Station: schlechteste Vorlage je Stufe) nicht gelandet; `w28-nadel-stufe` 7c51bdec in main
  (Totholz-L1 0,56 px, Nadel-Arten offen); `w28-karte-stamm` 9597ffb2 seit z427 in main (13.11. 20:51) — lod.K5 an diesem Kopf
  ungemessen.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- NICHT gemessen: dass der Schnitt die Karten-Lücke schließt — Schluss aus Zeugen-Abstand (211–218 m) und den Formeln. Die Fahrt
  läuft headless ohne GPU; zuerst sie am Kandidaten fahren (Fremd-Last-Wache beachten: 6aa7a5a6 war UNGEMESSEN).
- Widerspruch: lod.K2 (kein Pop am Rand, w22-Grund: 16 Bäume als EIN Ring) gegen streaming.K1. Außen trägt der Saum je Baum
  weiter seine eigene Zahl, die Einblende bleibt; ob der Pop am weiteren Abstand ≤ 0,05 % hält, misst erst lod.K2#1.
- Der Baum im GT (Mesh-Zone, 58–73 % fertig) — Durchsatz von Pflanzung und Foundry bei 63,8 m/s nicht gelesen
  (`INGEST_RATE_PER_S` 180, `studio-bruecke.js:3822`, Verdacht ohne Messung).
- GPU-Laub-Rand 216 m (Ring-Kappe) ≠ headless 240 m: die Probe misst headless; ob das Spiel an der GPU am Rand Lücken zeigt, nicht
  gesehen.
- Die Weide-Karte (lod.K5 3,13 px): Anteil Texel-Raster gegen Relief nicht getrennt (FUND 158: Modell mit Relief 3,16 px).
- Geisttor L2 1,40 px trotz Tafel-Zeile 0,1902 (`vegetation-streu.js:2899`): Tafel-Zeile vermutlich alt — nicht nachgemessen.
- `voxel-worker.js` nicht gelesen (nur seine Antworten in `gelaende-chunks.js:22–178`).

## Rang (Wirkung 1–5 · Aufwand S/M/L · Risiko)
- Rand als EIN Maß (oben): Wirkung 4 (zwei Kriterien 0 → 1, der graue Grund am Wald-Rand) · Aufwand S · Risiko: lod.K2 Pop am Rand
  und Dreiecke im Außen-Band — beides vor der Abgabe gezählt.
- Baum-Karte trägt 1 px am Haushalt (`KARTE_GITTER` + Relief, mit Pflicht A laub-kante als EINE Welle): Wirkung 4 · Aufwand L ·
  Risiko VRAM-Band der GTX (99,6–111,2 MB).
- Baum im GT (Mesh-Zone): Wirkung 2 · Aufwand M · Risiko: Wurzel unbenannt.
