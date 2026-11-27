# Stand-Blatt tier-bewegung (dritte Sitzung der Bahn Wanderung/Tiere, 27.11.)

Sprosse: `karte2.leben.tiere.bewegung#2` · Basis main 52937c92 (V18.546.451) · Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## Die rote Zeile — wörtlich, beide Akten gleich (Zweig `punkte-maschine`, `vision/richter/leben.tiere.bewegung.2.486a6685-gtx.json` und `…2.b1f0de0e-radeon.json`)

„S2 Umfang nicht erzeugbar: kein Laufvogel, der Fisch ein starrer Leib ohne Körperwelle (gezeichnet 0); Massen des Bestands über 1.354 Dekaden · fussfallAbw 0 Takt gegen Soll ≤ 0,05 Takt ✓ · strouhal ungemessen gegen Soll 0,2–0,4 ✗ · Täter: tetrapoda-core.js FISCH_GESETZ (starrer Leib) / kein Laufvogel“ — GTX 1060 am 486a6685, Radeon 890M am b1f0de0e, beide ROT.

Karte (Zweig `punkte-maschine`, `vision/MEISTERKARTE-2.md:1238`), wörtlich: Umfang „3 Dekaden 1–10³ kg: Vierbeiner, Laufvogel, Fisch mit Körperwelle“ · Tiefe „Fußfall gegen Muybridge ±0,05; Strouhal 0,2–0,4“ · Preis „P · Schwarm von 300 im Bild“ · Richter „Fußfall-Diagramm und St = f·A/U aus dem Ausgabe-Bild“.

Die rote Zeile gilt am main 52937c92 weiter: `FISCH_GESETZ` ist unverändert.

## Der Täter mit Datei:Zeile und Zahl

- `tetrapoda-core.js:2954` `FISCH_GESETZ` — `schlagHz: 2.5` und `schlagRad: 0.1` sind freie Zahlen, die nur die GIER des ganzen starren Leibs wippen lassen (`fischSchritt` :3006, „die Gier des Bilds, nie die des Gesetzes“); keine Welle läuft den Leib entlang, Frequenz und Ausschlag hängen weder am Tempo noch an der Länge.
- Täter-Zahl (aus dem Kern gerechnet, L = 0,3 m): Schwanz-Ausschlag Spitze–Spitze A = 2 · 0,1 rad · L/2 = 0,030 m; St = f·A/U = 2,5 · 0,030 / 0,7 = **0,107** beim Ziehen (`tempoMs` 0,7), **0,161** auf der Flucht (7,5 Hz, 0,060 m, 2,8 m/s) — beide unter dem Band 0,2–0,4; die Station liest gar keinen Strouhal (die Station der Leiter leben, Zweig `punkte-maschine`, Zeile 2269 `nimm(2, { fussfallAbw, massDekaden }, …)`, Stations-Sache).
- „kein Laufvogel“: der Bestand der Gang-Linse sind vier Vierbeiner (wolf · fuchs · baer · wesen, dieselbe Station Zeile 2240) — Massen 1,354 Dekaden; das Gang-Gesetz `gangSchritt`/`gangFuss` (tetrapoda-core.js:1421) trägt laut eigenem Kopf schon Zweibeiner.
- „gezeichnet 0“: `s.fischPool.mesh.count` am Messort der Station (kein Wasser in Sicht des Spielers).

## Plan (EINE Wurzel)

Der Fisch schwimmt nach dem Gesetz der Körperwelle: Frequenz aus Tempo und Länge (Bainbridge 1958: U = L/4·(3f − 4)), Schwanz-Ausschlag ≈ 0,2 L (Bainbridge 1958), die Welle läuft mit Wellenlänge ≈ L den Leib entlang (karangiform) — St = f·A/U folgt daraus und landet im Band (Taylor, Nudds & Thomas 2003: 0,2–0,4). Gelesen an der EINEN Stelle `fischSchritt`, gezeichnet vom Leib im Pool. Laufvogel und Massen-Dekaden folgen im selben Kopf, sofern die Zeit trägt — sonst ehrlich offen mit Prozent.

Messort der Station: die Gang-Linse fährt an der Pose des Spielers (Preis-Pose der Station), kein `stadt-voll`.

## ZWISCHENSTAND (27.11., Zweig `tier-bewegung`)

- **Geschnitten (Wurzel `FISCH_GESETZ`, EIN Leser `fischSchritt` → `fischLeib` → Pool `tier:fisch`):** `schlagHz`/`schlagRad` fallen; das Gesetz der Körperwelle `welle { huelle [0,02 −0,0825 0,1625], wellenL 1, schlupf 0,7 }` — Hülle nach Videler 1993 (A(0) 0,02 · A(0,2) 0,01 · A(1) 0,10 L), Schlupf U/c 0,7 (Videler 1993: 0,6–0,8), λ = L (karangiform); f = U/(schlupf·λ) folgt aus dem Tempo durch das Wasser (|v − Strömung|). Der Leib ist eine Kette von 4 Gliedern auf der Welle, jedes in ihre Tangente gedreht, Kopf bis Schwanz L.
- **Gemessen (am GEZEICHNETEN Leib, Instanz-Matrizen, Bach −162/257, 12 s):** St Median 0,107 (Gesetz-Zahl starr) → **0,325** [0,316 … 0,335], 22 von 22 steten Fischen im Band 0,2–0,4 (Taylor, Nudds & Thomas 2003, Nature 425:707); Biegung Kopf↔Schwanz 0 → 0,42 rad. Kosten `_fischTakt` an 40 Fischen: 0,046–0,062 → 0,106–0,118 ms je Takt (Median aus 5×600 Takten, Null-Renderer), Instanzen 40 → 160.
- **Linse:** `gate:tier-gang` (Familie Gang) trägt die Probe FISCH — Selbsttest ROT am starren Leib (Biegung 0 rad, „Täter: tetrapoda FISCH_GESETZ / fischLeib“), echter Lauf GRÜN, EXIT 0 in 118 s.
- **GPU-Ruf von Hand:** `zug.sh probe-tag` liegt in keinem Zweig (artifacts/profiband ist nicht verfolgt, roh 404) — die Tore folgen den Lesern der Dateien: `gate:tier-gang` (141 s, liest Fisch-Gesetz und Pool) · `gate:tier-anatomie` (171 s, `tetrapoda-core.js`) · `gate:webgl-probe` (79 s); `probeUrteil` über die lokalen Logs. Die Probe führt die Welt-Uhr über den EINEN Schreiber `_weltUhrNimm` (Ein-Schreiber-Wand).
- **Vorprüf-Kopf 1:** `tier-bewegung-kopf1` = 484a8c99, EIN glatter Commit auf main 7e73426e (V18.546.453). Der Zweig `tier-bewegung` trug schon WIP-Schübe; ein glatter Kopf darauf ginge nur mit force — darum der Kopf im Zweig `-kopf1` (wie `gezeiten-2-kopf2`, `wander-spieltag-kopf2`), `tier-bewegung` rückt vor (962923e5, gleicher Baum). Lokal: `check:statik` GRÜN (578 s) · gate:tier-gang GRÜN (128 s) · gate:tier-anatomie GRÜN (132 s) · gate:webgl-probe GRÜN (277 s; der erste Lauf brach im swiftshader am GPU-Prozess ab, `Runtime.callFunctionOn timed out`, an der Basis 52937c92 und im zweiten Lauf GRÜN) — `probeUrteil` je Log GRÜN.
- **Vorprüf-Kopf 2:** `tier-bewegung-kopf2` = bdc74fb5, Baum gleich Kopf 1, auf main 7e73426e — Kopf 1 wies die GPU-Probe ab (`probe-post/tier-bewegung-kopf1/484a8c99.md`: die Tore standen ohne Komma im Ruf). Ruf jetzt `[gpu-probe: gate:tier-gang, gate:tier-anatomie]`; gate:webgl-probe fährt jedes Bein mit. **GPU-Probe GRÜN** an der Radeon 890M (`probe-post/tier-bewegung-kopf2/bdc74fb5.md`, Lauf 46009737660): gate:tier-gang 107 s · gate:tier-anatomie 202 s · gate:webgl-probe 82 s. Der Code-Check des Kopfs (Lauf 46009737592, `[ci voll]`) stand bis 14:35 UTC in der Schlange und brach ab („cancelled“, kein Urteil; nicht von mir neu gestoßen).
- **Station:** Kandidat `cloud-post/tier-bewegung-station/` — die Station liest Strouhal und Biegung über dieselbe Probe (`H.quelle`).
- **Offen (ehrlich, die Sprosse bleibt ROT):** „kein Laufvogel“ — das Spiel trägt keinen Zweibeiner-Vogel (neues Tier in PRESETS, Ofen, Anatomie; nicht in diesem Kopf); „Massen des Bestands über 1,354 Dekaden“ — Soll 3 Dekaden (der Fisch trägt kein Massen-Gesetz). Umfang 2 von 3 Leibern (Vierbeiner, Fisch mit Körperwelle). Messname `karte2.leben.tiere.bewegung#2`.
- **Wartezimmer:** 13:20–17:20 UTC (4 h), Briefkasten alle 8 min gelesen; kein Urteil, kein GELANDET, kein ENDE. Letzter Stand: Kopf 2 `tier-bewegung-kopf2` bdc74fb5 auf main 7e73426e, GPU-Probe GRÜN (Radeon 890M), Code-Check abgebrochen ohne Urteil; die Sprosse bleibt ROT (kein Laufvogel; Massen über 1,354 Dekaden). Karte 2 gebucht 149 von 1 718.
