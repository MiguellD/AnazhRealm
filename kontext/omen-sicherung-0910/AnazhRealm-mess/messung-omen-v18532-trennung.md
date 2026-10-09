# Messung OMEN — Trennung cf9a07ba (A) gegen 251f2f72 (B)

Gemessen 07.10.2026, 00:25–00:34, OMEN (GTX 1060, 1920×1080 @ 120 Hz).

**Frage:** Kostet der Gelände-normalNode (`normalWorldGeometry × faceDirection`, einziger Commit zwischen A und B) die +2,5 ms gpu-bank aus der Serie V18.531 gegen 251f2f72?

**Aufbau:** ABAB, vier frische Boots. A = Worktree `AnazhRealm-kand`, B = `mess-b`. Je Boot:

- save-server `PORT=4312` und werkbank aus dem Stand
- `__anazhAutoSettlement = false`, `fenster 1920 1080`, `umstellen -900 -850`
- Bühne: `__buehne()` + `weatherEffectTime = -1e7`
- yaw 0: `band`, `gpu-bank 12 --runden 3`
- yaw −0,88: `band`, `gpu-bank 12 --runden 3`

Am Ende jedes Boots: sunny, Tag 0,5, Auto-Dorf aus. Die Zerleg-Linse fehlt in beiden Ständen; zerlegen wurde übersprungen.

## Zahlen

| Boot | Blick | band Befehle / Dreiecke / VRAM | band GPU ms | gpu-bank GPU / CPU ms | Tiere | boden (Befehle / Dreiecke) |
|---|---|---|---|---|---|---|
| 1A | yaw 0 | 102 / 882k / 151,2 | 24,78 | **24,82** / 9,53 | Wesen 12 | 8 / 201k |
| 1A | −0,88 | 88 / 713k / 146,8 | 23,17 | **23,26** / 7,85 | Wesen 11 | 8 / 149k |
| 2B | yaw 0 | 105 / 882k / 151,2 | 24,72 | **24,74** / 8,20 | Wesen 15 | 8 / 201k |
| 2B | −0,88 | 96 / 766k / 146,7 | 23,14 | **23,61** / 8,00 | Wesen 19 | 8 / 149k |
| 3A | yaw 0 | 84 / 683k / 152,1 | 21,06 | **21,24** / 8,57 | Wesen 5 | 8 / 142k |
| 3A | −0,88 | 83 / 660k / 149,9 | 21,54 | **21,43** / 8,52 | Wesen 5 | 8 / 146k |
| 4B | yaw 0 | 106 / 883k / 151,7 | 26,68 | **27,32** / 7,83 | Wesen 15 | 8 / 201k |
| 4B | −0,88 | 91 / 713k / 147,3 | 25,10 | **25,78** / 8,22 | Wesen 14 | 8 / 149k |

Mediane (je 2 Boots): gpu-bank yaw 0 A 23,03 / B 26,03 · yaw −0,88 A 22,34 / B 24,70 · Bank-CPU A 9,05 / 8,18 · B 8,02 / 8,11.

## Urteil

**Der Gelände-normalNode kostet keine messbaren 2,5 ms.**

- Bei gleicher Szene (1A, 2B, 4B: identisch 882k Dreiecke, boden 201k) liegen A 24,82 und B 24,74 ms gleichauf. Der zweite B-Boot misst 27,32. Die Streuung zwischen Boots desselben Stands (bis 2,6 ms) ist größer als jeder A/B-Abstand.
- Der Median-Abstand (+2,4 bis +3,0) entsteht durch 3A, das in einer kleineren Welt einschwang (683k Dreiecke, boden 142k), und durch den hohen 4B. Er ist kein Effekt des Commits.
- Bank-CPU: A und B sind gleich (~8 ms). Die Mehr-CPU gegenüber V18.531 (dort ~5 ms) liegt also in cf9a07ba selbst (Sicht-Kette), nicht im normalNode-Commit. Bei gpuGebunden = true und GPU ~22–27 ms hebt sie die Bank-GPU nicht nachweisbar.
- Die +2,5 ms aus der Serie V18.531 gegen 251f2f72 sind darum Welt- und Boot-Streuung bzw. ein Effekt von cf9a07ba gegen 2b60988b. Gestützt auf je 2 Boots ist das nicht belastbar: Am 06.10. waren 2b60988b und cf9a07ba in der Bank gleich (27,3 / 27,3). Für eine belastbare Aussage braucht es mehr Boots oder eine Bank auf eingefrorener, identischer Szene (gleiche Befehls- und Dreiecks-Zahl prüfen).

## Die Warnung „WebGPUTimestampQueryPool [render]: Maximum number of queries exceeded"

- **Stand:** in ALLEN drei Ständen — 2b60988b und cf9a07ba (Serie `abab`, 06.10.), 2b60988b und 251f2f72 (Serie `ab532`), cf9a07ba und 251f2f72 (diese Serie). Kein Stand ist „zuerst"; sie ist stand-unabhängig.
- **Auslöser:** `werkbank band`. Mit `werkbank status` nach jedem Schritt in allen vier Boots: nach dem Boot 0, nach `umstellen` 0 (Leinen-Zähler `gerendert` = 3), nach `band` 1 (`gerendert` = 471–491). Sie entsteht also innerhalb von band, zwischen dem 3. und dem ~480. gerenderten Frame nach dem Boot. Eine genauere Frame-Nummer liefert das Konsolen-Protokoll nicht.
- **Gegenprobe:** In allen Serien OHNE band vor dem lauf (`abba`, `aufloesung`, `profilBA`, `csicht`, `welle-g2`, `zerlegen`, `zerlegen-kand`) kommt sie in keiner lauf-Datei vor; in den Serien mit band davor (`abab`, `ab532`) in jeder.
- **Lesart:** ein Linsen-Artefakt. band (bzw. seine gpu-bank-Frames ohne rAF) rendert Frames mit trackTimestamp, ohne `resolveTimestampsAsync` aufzurufen. Der Pool läuft voll.
- **Folge:** Die Pass-Stempel (gpuMs, gpuJePassMs) jedes lauf NACH band im selben Boot sind verdächtig. Das betrifft die gpuMs-Spalten der Serien `abab` und `ab532`, nicht deren Frame-Zeit, CPU-Takt oder gpu-bank.

Rohdaten: `C:\Users\micha\Desktop\AnazhRealm-OMEN\trenn532\` — band, gpu-bank, Status- und Frame-Schnappschüsse je Schritt (`N-st-*.json`, `N-fr-*.json`).
