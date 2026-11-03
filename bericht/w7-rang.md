# w7-rang — streaming.K1#1 und K2#1: die Fahrt, EIN Rang Zeit bis Bedarf

**Stationen** (`meisterkarte-quelle/punkte/stationen/g6.js`, EIN Lauf `fahrt`, Zwillinge, headless am Null-Renderer — Bedarfe
und Ereignisse sind Buchführung, kein Bild): feste Bahn Mess-Wiese → Dorf −4,−4 → hinaus (1 270 m), 60 s Sprint des Leibs
(5,2 m/s) und 60 s GT-vmax (16,0 m/s, vehicle-core `exportDrive`), Takt mit der Wanduhr, Profil „voll" (Ring 4 — der
Null-Renderer wählt sonst „kienspan", Ring 2). Der Bedarf kommt aus dem Gesetz: Sichtkegel des Schirms bis 384 m; der Boden
im Ring mit der Stufe aus `BODEN_STUFEN`; jeder Eintrag mit der Stufe der Wahrnehmung samt ihrer Hysterese
(`_stufeNachGrenzen`), ein Baum, sobald sein Chunk im Ring und diesseits des Laub-Rands (`PERF_FOLIAGE_RADIUS_MAX`) liegt, die
Karte bis zu ihrem Horizont; die Pflanz-Schlange und das Dorf in der Schlange sind Bedarf wie ihr Eintrag; die Streu-Region
in Reichweite; der Horizont.

| | main 0e3eadad | w7-rang |
|---|---|---|
| K1 Lücken-Bilder Sprint | 549 / 4 376 | **0** / 4 236 |
| K1 Lücken-Bilder GT | 1 077 / 3 875 | **0** / 3 796 |
| K2 Boden (je Stufe) | 208 / 484 (43,0 %) | 484 / 484 (100 %) |
| K2 Bäume (Mesh-Stufe) | 66 / 646 (10,2 %) | 700 / 710 (98,6 %) |
| K2 Karten | 307 / 3 866 (7,9 %) | 3 530 / 3 530 (100 %) |
| K2 Bauten | 240 / 318 (75,5 %) | 318 / 318 (100 %) |
| Streu (genannt) | 0 / 15 | 15 / 15 |
| CPU-Takt p95 (Null-Renderer) | 14,0 ms | 14,1 ms |

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

**Offen:** Staffel 2 (Tempo-Decke ≥ vmax × 1,2 am Boden und 30 m darüber, beide Geräte; ≥ 99 % bei GT-Vollgas an beiden
Geräten) misst diese Station nicht; die Vorausschau liest den Tempo-Vektor der Bahn, das Wegenetz trägt sie nicht.
