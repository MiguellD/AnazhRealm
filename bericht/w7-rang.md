# w7-rang — streaming.K1#1 und K2#1: die Fahrt, EIN Rang Zeit bis Bedarf

**Stationen** (`meisterkarte-quelle/punkte/stationen/g6.js`, EIN Lauf `fahrt`, Zwillinge, headless am Null-Renderer — Bedarfe
und Ereignisse sind Buchführung, kein Bild): feste Bahn Mess-Wiese → Dorf −4,−4 → hinaus (1 270 m), 60 s Sprint des Leibs
(5,2 m/s) und 60 s GT-vmax (16,0 m/s, vehicle-core `exportDrive`), Takt mit der Wanduhr, Profil „voll" (Ring 4 — der
Null-Renderer wählt sonst „kienspan", Ring 2). Der Bedarf kommt aus dem Gesetz: Sichtkegel des Schirms bis 384 m; der Boden
im Ring mit der Stufe aus `BODEN_STUFEN`; jeder Eintrag mit der Stufe der Wahrnehmung samt ihrer Hysterese
(`_stufeNachGrenzen`), ein Baum, sobald sein Chunk im Ring und diesseits des Laub-Rands (`PERF_FOLIAGE_RADIUS_MAX`) liegt, die
Karte bis zu ihrem Horizont; die Pflanz-Schlange und das Dorf in der Schlange sind Bedarf wie ihr Eintrag; die Streu-Region
in Reichweite; der Horizont.

| | main 6eeeb856 | w7-rang (mit main d880c8e8) |
|---|---|---|
| K1 Lücken-Bilder Sprint | 543 / 4 232 | **0** / 4 143 |
| K1 Lücken-Bilder GT | 1 084 / 4 141 | **0** / 3 587 |
| K2 Boden (je Stufe) | 206 / 484 (42,6 %) | 484 / 484 (100 %) |
| K2 Bäume (Mesh-Stufe) | 72 / 646 (11,1 %) | 700 / 709 (98,7 %) |
| K2 Karten | 298 / 3 872 (7,7 %) | 3 529 / 3 529 (100 %) |
| K2 Bauten | 250 / 318 (78,6 %) | 318 / 318 (100 %) |
| Streu (genannt) | 0 / 15 | 15 / 15 |
| CPU-Takt p95 (Null-Renderer, Median aus 6 · 7 Läufen) | 15,2 ms | 15,3 ms |

An main 0e3eadad dieselbe Klasse (549 + 1 077 Lücken-Bilder; Boden 43,0 %, Bäume 10,2 %, Karten 7,9 %, Bauten 75,5 %).

Mutanten (Schlupflöcher der Soll-Tafel): langsam fahren, Ring 2 per Regler, Schleife im Ring, Diashow, ein Lücken-Bild, Abbruch,
der Boden 80 % im Mittel versteckt, eine fehlende Klasse, die Bäume ohne Vorlauf (93,5 %) — jede ROT. `punkte.cjs selbsttest
--ohne 3c` 130/130, `liste` 260 Stationen, Fehler 0.

**Der Schnitt im Spiel** (Zweig `w7-rang`): EIN Rang `_bedarfWeg` — Zeit bis Bedarf entlang der Bahn ÷ Tempo,
T = (a + b·√(s² − v0²)/v0)/s, in Metern zu Fuß (im Stand der Abstand selbst, jeder Leser der alten Zahl d² liest dasselbe),
der Tempo-Vektor aus der Spiel-Uhr (`_bedarfTakt`), der Ort der Bahn nach 3 s (`_bedarfVoraus`, `_bedarfAbstand`). Ihn lesen
der Boden (der Ring der Bahn, seine Pflege, die Stufe, der Neubau), der Wuchs (Saat am Laub-Rand der Bahn, der Kasten der
Gestalt ±4 Zellen mit dem Pflanz-Gang, die Schlange des Walds), die Streu-Reihe, die Bauten und Karten (Cull, Stufen-Wahl,
Kalt-Schätzer) und die Foundry (`_foundryAuftragD2`).

**FUND:** jeder Wald-Baum am Rand des Rings wurde im Sichtkegel geboren und wartete 1–2 Bilder auf die Gestalt seines Orts —
den Plan der ±4 Zellen um ihn bestellte erst der geborene Baum (`_ortGestaltSame` → `_waldPlanSteht`, `var` null in 186–246 m).

**Linsen am Kopf** (gemergt mit main d880c8e8): `npm run check`, voller Playtest („Alle Invarianten OK"), gate:takt,
gate:ankunft, gate:worker-dichte, gate:streu-fern, gate:fernwald, gate:scatter-lod, gate:welt-boot, gate:trias, gate:hoehlen-sicht,
gate:schatten-terminator, gate:asset-contract, gate:pflanzen-nah, gate:nervensystem-schmiede, gate:fachwerk-contract GRÜN;
gate:stand-takt, gate:chunk-satz, gate:arch-feld und gate:klang-zensus ROT — mit demselben Befund am sauberen main 6eeeb856
in dieser Umgebung (Cloud, swiftshader): „keine Weck-Probe für wuchs …", „DIE WELT HÄNGT … wald 5", „Eiche ab Takt null",
„S wald: laub ≥ Wiese.laub + 8".

**Offen:** Staffel 2 (Tempo-Decke ≥ vmax × 1,2 am Boden und 30 m darüber, beide Geräte; ≥ 99 % bei GT-Vollgas an beiden
Geräten) misst diese Station nicht; die Vorausschau liest den Tempo-Vektor der Bahn, das Wegenetz trägt sie nicht.
