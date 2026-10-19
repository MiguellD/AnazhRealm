# Bericht 1910 B+E Wurzel auf der GTX (main 47c8b089 · Gegenprobe ffa8fac8), nur gemessen

**Status: ZWISCHENSTAND.** Die zwei größten Posten:
- **B:** die Bild-Takt-Jobs unter `_runFrameScheduler`, 3,82 s = 27 % der blockierten 13,91 s bis zum Bild.
  - Darin: `_ensureVoxelChunkAt` 0,86 · `_tickFernRing` 0,69 · `_naturSetzen` 0,59 · `_tickKarteWelt` 0,42 · `_forestPlantChunk` 0,36 · `_rebuildVoxelChunk` 0,33 · `_tickScatterLod` 0,26 s.
  - In keinem Posten der Kalt-Linse; gleichauf folgt der Erst-Bau mit 3,57 s = 26 %.
- **E:** der Stoff-Refresh `_diaetRefresh` mit 1,97 ms je Frame = 30,6 % des Takts (inklusiv).
  - Darin `_diaetGeteiltSchreiben` 1,09 ms, danach `_renderBundles` 1,36 ms.
  - Die 0,1–0,2 ms bis zum Soll 5,8 müssen aus diesem Render-Weg kommen; die periodischen Glieder bringen nur −0,05.

Gemessen von einem frischen Messer; sein Bericht wörtlich unten. Rohdaten-Auszug in `bericht/1910-b-e-gtx/`, alles auf der OMEN in `p3/n1910/be/` (769 MB, Profile).


**B größter Posten: die Bild-Takt-Jobs unter `_runFrameScheduler` (dirigent-takt.js) — 3,82 s = 27 % der blockierten 13,91 s bis zum Bild (PM1), in keinem Posten der Linse; gleichauf der Erst-Bau 3,57 s = 26 %.**
**E größter Posten: der Stoff-Refresh `o.needsRefresh` → `AnazhRealm._diaetRefresh` (bild-kosten.js) — 1,97 ms je Frame = 30,6 % des Takts inklusiv, Selbstzeit 0,27 ms = 4,2 % (Rang 1).**
Status: ZWISCHENSTAND, kein Schnitt. Instrument `p3/n1710/b4/profil-patch.cjs` nur um PM1/PG1 an M und G byte-gleich (sha 2291833b), danach zurück (`b/fortschritt.log`). Rohpfade relativ zu `p3/n1910/be/`; Läufe `b/roh/<lauf>.{json,log,png,cpuprofile}`, Sitzungen `e/welt/E1–E4/`.

## B — Kalt-Zeile (`diag-boot-stage --kalt --echt`, Port 7902, frisches Profil je Lauf; WM/WG Aufwärm-Läufe verworfen), s
| Lauf | t(Weltbild) | t(Leib) | blockiert bis Bild | benannt | unbenannt | Erst-Bau | letzte Terme | Bild |
|---|---|---|---|---|---|---|---|---|
| M1 | 15,45 | 5,59 | 13,07 | 6,39 | 6,67 | 3,46 | streu 15,45 · bauten/karten 15,28 | ganz |
| G1 | 16,31 | 11,92 | 13,53 | 5,61 | 7,92 | 3,51 | boden/streu 16,09 · horizont 15,81 | ganz |
| M2 | 16,11 | 6,22 | 13,17 | 6,93 | 6,24 | 3,66 | streu 16,09 · bauten/karten 15,69 | ganz |
| M3 | 16,23 | 5,95 | 13,74 | 6,64 | 7,10 | 3,60 | streu 16,23 · bauten/karten 15,89 | ganz |
| G2 | 15,97 | 9,26 | 13,07 | 5,79 | 7,28 | 2,95 | horizont 15,97 · streu 15,71 | ganz |
| M4 | 15,91 | 5,03 | 13,52 | 6,23 | 7,28 | 3,54 | bauten/streu 15,91 · karten 15,71 | ganz |

Mediane (`b/zerlegung.md`, `b/median.txt`): M Weltbild 16,01 (15,45–16,23) · Leib 5,77; G 16,14 · 10,59 — das Paket zieht den Leib −4,8 s vor, das Weltbild nicht. Benannt bis Bild (M): Erst-Bau 3,57 · Streu 1,22 · Boden 0,67 · Bauten 0,53 · Ort-Wahl 0,27 · Gruppen-Bau 0,25 · Dorf 0,08 · Buch 0,04 s.
Bilder M1–M4, G1, G2 angesehen: Tore, Wald, Himmel, Haus im Tor-Spalt ganz, `ohne` leer, 33 Befehle, 194–196 k Dreiecke.

**Je Sekunde, Median (ms; unbenannt = blockiert − Σ benannt; negativ = benannte Arbeit in kurzen Aufgaben / verschachtelt doppelt):**
| s | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M blockiert | 586 | 320 | 416 | 1000 | 945 | 908 | 986 | 963 | 964 | 956 | 909 | 968 | 851 | 975 | 972 | 611 |
| M Erst-Bau | 0 | 0 | 0 | 0 | 666 | 681 | 119 | 246 | 270 | 78 | 398 | 120 | 492 | 186 | 173 | 0 |
| M unbenannt | 586 | 320 | 4 | 746 | 208 | −265 | 693 | 480 | 406 | 686 | 356 | 757 | 213 | 598 | 430 | 388 |
| G unbenannt | 580 | 449 | 22 | 512 | 293 | −50 | 496 | 517 | 472 | 535 | 497 | 570 | 816 | 684 | 835 | 171 |

Der unbenannte Rest auf der GTX: 6,89 s = 51 % des Blockierten, Mittel 448 ms/s von 3–14 s, Spitzen bei 3/6/9/11 s (690–760 ms); bei 4–5 s klein (208 / −265), weil dort der Erst-Bau den Faden füllt (Radeon dort ~700 ms/s).

**CPU-Profil PM1 0–8 s** (0,5 ms, Uhr über die LongTasks geeicht, Versatz −33 ms; bis zum Bild 15,97 von 16,42 s = 97 % belegt; `b/profil-PM1.md`):
| s | belegt / in LongTasks | Klassen in LongTasks | unbenannt beim Namen (Familie) |
|---|---|---|---|
| 0–1 | 830 / 625 | (program) 434 · unbenannt 166 | `_bootAnazhRealm` 163 |
| 1–2 | 999 / 403 | unbenannt 388 | `_bootAnazhRealm` 235 · `init > _chatEcho` 116 |
| 2–3 | 984 / 123 | Knoten-Bau 87 · unbenannt 20 | `_applyDayNightToScene` 32 |
| 3–4 | 1000 / 1000 | Boden 642 · unbenannt 257 | `_runFrameScheduler` 195 · `_applyDayNightToScene` 37 |
| 4–5 | 998 / 963 | Knoten-Bau 554 · unbenannt 129 · zeichne-Rest 121 | `_loopRender > render` 127 · `_runFrameScheduler` 36 |
| 5–6 | 941 / 907 | Knoten-Bau 366 · unbenannt 232 · zeichne-Rest 113 | render 113 · `_ofenVorlage` 63 · `_runFrameScheduler` 53 |
| 6–7 | 1000 / 992 | unbenannt 391 · Knoten-Bau 210 · Streu 153 | `_runFrameScheduler` 302 · `_tickChunkSatz` 54 |
| 7–8 | 1000 / 985 | unbenannt 738 · Knoten-Bau 110 | `_runFrameScheduler` 586 · `_foundryPlatzBereit` 103 |

Der ganze unbenannte Rest bis zum Bild (PM1, in LongTasks 7,69 s; `b/ganz-familie.txt`, `b/unter-PM1-scheduler.txt`, `b/unter-PM1-run.txt`):
`_runFrameScheduler` 3,82 s = `_ensureVoxelChunkAt` (außer `_buildVoxelChunkData`) 0,86 · `_tickFernRing` 0,69 · `_naturSetzen` 0,59 · `_tickKarteWelt` 0,42 · `_forestPlantChunk` 0,36 · `_rebuildVoxelChunk` 0,33 · `_tickScatterLod` 0,26;
daneben Render ohne Knoten-Bau 0,70 · (program) 0,63 · `_foundryRewarmColdTrees` 0,50 · `_bootAnazhRealm` 0,40 · GC 0,31 · `_foundryPlatzBereit` 0,25 · `_tickChunkSatz` 0,16 s. Gegenprobe PG1: Scheduler 4,16 s = 30 %, Zeichnen ohne Knoten-Bau 2,38 s (M 0,98).
**Urteil B:** Die Ankunft trägt auf der GTX der zu 97 % belegte Haupt-Faden; M spart gegen G 1,4 s Zeichen-Arbeit und zieht den Leib 4,8 s vor, aber das Weltbild kommt nicht früher — die letzten Terme (streu, bauten, karten) fallen an beiden Seiten bei 15,3–16,2 s.

## E — Genesis Third stehend, 4 frische Boots an M (lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei; profil 20 --top 60)
| Boot | CPU-Takt p50 | p95 | p99 | Frame p95 | fps | Ruhe / Wetter | Tiere / Chunks |
|---|---|---|---|---|---|---|---|
| E1 / E2 | 4,3 / 4,5 | 5,6 / 5,9 | 6,6 / 6,9 | 16,8 | 80,5 / 80,1 | ruhig 3 s / GRÜN | 10 / 81 |
| E3 / E4 | 4,2 / 4,5 | 5,4 / 5,8 | 6,8 / 6,8 | 16,8 | 81,2 / 80,2 | ruhig 3 s / GRÜN | 10 / 81 |

Median p50 4,40 · **p95 5,70** · p99 6,80 ms; 3 von 4 Boots halten 5,8, E2 reißt mit 5,9 (`e/auswertung.md`).
**Top-15 Selbstzeit** (ms je Frame · Anteil am Takt, Median 4 Boots, nach Namen): 1 `_diaetRefresh` 0,273 · 4,2 % · 2 `update` 0,226 · 3,5 % · 3 `updateMatrixWorld` 0,163 · 2,5 % · 4 `loop` 0,155 · 2,4 % · 5 `equals` 0,153 · 2,5 %
· 6 `_projectObject` 0,147 · 2,3 % · 7 `get` 0,146 · 2,2 % · 8 `updateByType` 0,131 · 2,1 % · 9 `writeBuffer` 0,126 · 1,9 % · 10 `updateCreatures` 0,120 · 1,8 %
· 11 `_renderObjectDirect` 0,102 · 1,6 % · 12 `_update` 0,100 · 1,6 % · 13 `setVertexBuffer` 0,082 · 1,3 % · 14 `_tickScatterStreaming` 0,082 · 1,3 % · 15 `writeTexture` 0,082 · 1,2 %.
**Inklusiv** (Anteil an `loop` 6,53 ms je Frame im Profil): `_loopRender` 4,23 (65 %), darin `_diaetRefresh` 1,97 (30,6 %; `_diaetGeteiltSchreiben` 1,09 = 16,8 %, `_diaetObjektGang` 0,40 = 6,2 %), `_renderBundles` 1,36 (20,9 %), `renderShadow` 0,61 (9,3 %), `_passSicht` 0,54 (8,2 %), `scene.onBeforeRender` 0,50 (7,6 %); `_loopWeatherAndGrowth` 0,44 (6,7 %), darin `updateCreatures` 0,38 (5,9 %).
**In den Frames ≥ p95 wachsen** (haenger 30 s, 1 ms, schwer gegen leicht, ms je Takt; `e/frames.md`): `_loopRender > render` +1,04 (3,31 → 4,35), verteilt (`_spiegelFeldTakt` +0,08 · `_projectObject` +0,07 · `_hoehlenSichtLicht` +0,07 · `writeBuffer` +0,05 · `_diaetRefresh` +0,05 · `submit` +0,04);
periodisch `_loopAutoSave` +0,28 (`saveToProjectFolder` 0,17, `saveState` 0,12) · `_flightRecorderTick` +0,15 · `_updateEmotionFeedback` +0,12 (`getPropertyValue` +0,11) · `_runFrameScheduler` +0,08 · `_applyDayNightToScene` +0,07.
**Gegen 5,8 ms:** Ohne die vier periodischen Glieder (AutoSave, Flugschreiber, Status-Panel, Tag-Nacht) fällt p95 nur um 0 bis −0,2 ms, Median −0,05 (`e/ohne.md`) — sie treffen zu wenige Frames. Die 0,1–0,2 ms müssen aus dem Render-Weg kommen, den jeder Frame zahlt und der in den schweren Frames +31 % wächst: 5–10 % des Refresh-Gangs `_diaetRefresh` (1,97 ms) sind 0,1–0,2 ms, danach `_renderBundles` (1,36 ms).

## Offen
- B: Die Kette hinter streu ist nicht gemessen („4 Wald-Stücke warten auf ihre Gestalt" ab 2 s, letzter Term in 3 von 4 M-Läufen, in M4 gleichauf mit bauten). Sie liegt im Faden, nicht im Haupt-Faden-Profil — und weil M freie Haupt-Faden-Zeit nicht in ein früheres Bild umsetzt, ist sie der offene B-Posten.
- B: Der Liste `KOSTEN` der Linse fehlen die Scheduler-Jobs; (program) 1,74 s bleibt ohne JS-Namen; ein Profil je Seite, profilierte Läufe +0,4–0,5 s langsamer (16,42 / 16,66 s).
- E: Die Anteile sind relativ (das 200-µs-Profil bläht den Takt auf 6,53 ms je Frame, lauf p50 4,40); die Hänger-Linse verschiebt das absolute p95 (E2 7,2). E2 reißt mit 5,9 ms (zwischen Sitzungen ±0,25); die Radeon ist hier nicht gemessen.
