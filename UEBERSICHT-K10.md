# ÜBERSICHT Konto 10 — jeder offene Zweig mit Ziel (Stand 09.11. 23:35, main 78d37554, gebucht 224, Woche 17 %)

Erhoben am 09.11. 21:00: 782 Zweige der letzten 14 Tage, 325 mit Inhalt außerhalb main (`merge-tree`), davon 40 `-pm` (Stationen, landen
auf punkte-maschine) und 8 vorher/nach-Proben. Schicksale älterer Zweige: `zug/abgeloest.txt`.

## In der Schlange (Skripte, ohne Token; je Zug ~45 min)
| Zug | Zweige | Ziel |
|---|---|---|
| z353 (fährt, Code-Check seit 23:24) | heim2-w20-wald-kosten | C, vegetation.K3 |
| z354 | w26-winter-fichte-2 · w27-karte-nadel · w27-zeiger · w27-ankunft-erstbild · w26-klang-schritt · w26-probe-node | vegetation.K5#2, tiere.K3#2, ankunft.K5, klang.K4#2, CI |
| z355 | w25-gpu-wahl-2 (563ac9c0) | E (Profi-Band), werkbank.cjs danach 3998/4000 |
| z356 (noch nicht gestartet) | w26-eiche-kante (d57566f9, werkbank 3965; mit gpu-wahl-2 gemischt 3988) · w26-leib-raum, wenn der CI-Befund frei gibt | lod.K1#1, Guss der Menge |

## z352 zugeordnet (Proben je Zweig, 09.11. 22:30–23:10)
- **w26-boden-nah** = Täter S0 Nacht auf der Radeon (24,6 / 10,0 %; main GRÜN) → Heilung `w27-boden-nah-2`.
- **w26-haar-arm** = Täter K6 auf echter GPU (GTX 1050: main max 3,5 %, Zweig 5,1–13,4 % in 8/8) → Heilung `w27-haar-arm-2`.
- **w26-leib-raum**: GPU-Probe Radeon GRÜN, Code-Check K06 (swiftshader) ROT — Urteil steht aus (lokaler champion liest die roten Zeilen).
- **Geräte-Befund pascal:** `gate:pruefbuehne-licht` S0 Nacht ist auf der GTX 1050 schon an main ROT (23,2 / 6,4 %) → FUND-REGISTER 09.11. 23:10.

## Cloud-Welle 09.11. 23:00 (neun Sitzungen, Post je `cloud-post/<zweig>.md`)
| Zweig | Kriterium | Ziel-Zahl |
|---|---|---|
| w27-boden-nah-2 | material.K2#1 | Boden nah ohne S0-Nacht-Riss, Abstand an der Wand auf beiden Läufern |
| w27-haar-arm-2 | haar.K2#1 | arm-Strich in [0,3554; 0,533], K6 Kopf dicht |
| w27-ferne-ton-5 | ferne.K1#2 | 8 km Ton (13,77° heute) |
| w27-lod-baum | lod.K5#1 | Baum-Pop 5,16 px → ≤ 1 px |
| w27-studio-mesh | studios.K4#1/#2 | 0/7 → 7/7 |
| w27-tiere-sicht | tiere.K5#1 | Ego-Sichtungen in 600 Spiel-s |
| w27-wagen-spalt | physik.K2#2 | Spalt 0,218 m bei 81,67 m/s |
| w27-werkbank-teil | DECKE | scripts/werkbank.cjs ≤ 3575 Zeilen, byte-gleich |
| w27-verkehr-station-pm | fahrzeug.K2#2, C | Station sieht Ankünfte (heute 12 s Spielzeit → immer ROT) + Proben Hang, Furt, Ego/Third |

Weiter per Post (Sitzungen von vorher): takt-streu (w25-gpu-wahl-2), winter-ähre (w26-winter-fichte-2), eiche-l1 (w26-eiche-kante).

## Punkte-Stau (stand.json am 78d37554: 81 Kriterien unter 2 Punkten, 19 bei 0, 62 bei 1)
- **Radeon:** 46 Stationen UNGEMESSEN, die meisten R6-veraltet (nie am jüngsten Kopf gemessen). Vier Scheiben à ≤ 6 Stationen laufen seit
  23:25 am 78d37554 (`/tmp/claude/w4/radeon-stau.sh`); eine volle `--offen`-Sitzung hielte das Schloss 73 min und sperrte den echt-Job.
- **GTX:** 47 Stationen UNGEMESSEN — die OMEN fährt bis zum Ende der gpu-bank-Bisektion (185e99bb ↔ 78d37554) keine Stationen und ist für
  Zeit-Stationen blind, solange `AppHelperCap.exe` ~1 Kern hält (Entscheid des Schöpfers am Gerät).
- **Blinde Stationen (Maschine, nicht Spiel):** `fahrzeug.K2#1` und die Wechsel-Station — `tor.dekl` zieht ein Urteil ohne den Helfer
  `urteil` (seit heim2-w13-verkehr-heil) → Wurzel-Schnitt in `tor.dekl` läuft (lokaler champion). `fahrzeug.K2#2` siehe Cloud-Welle.
  `vegetation.K3#1` (Urteils-Zeile fehlt) und `ankunft.K4#1` (Deckel 90 s zu eng: POSE ego-45 39 s) warten auf einen Besitzer.

## Geräte
- **Radeon 890M (Laptop):** Zug-echt-Job, gpu-probe, Stau-Scheiben. Wache: `zug/werkzeug-w3/wache-k10.sh` (LEERLAUF nach 16 min).
- **OMEN GTX 1060:** gpu-bank ABAB/Bisektion, Bericht `bericht/0911-gpu-bank-stufe.md`; Läufer-Labels gpu-probe/gpu-zeit bis dahin ab.
- **GTX 1050:** gpu-probe-Läufer; Sitzung fährt w27-ort-pose, danach mensch.K4#1. Kein GitHub-Login — Berichte schreibe ich.

## Zurückgehalten mit Grund (cloud-post/<zweig>.md)
- **w26-programm-katalog:** Gewinn unbelegt.
- **w26-lack-glas:** Radeon UNGÜLTIG.
- **w26-fahrt-planer:** mit `_wieseFernBereit` vereinen.
- Keiner dieser drei hat eine laufende Sitzung. Sie warten auf einen Besitzer mit Zahl.

## Nicht zu landen
- **w26-laub-kante:** byte-gleich main. Es ist ein Mess-Befund: Die Laub-Kante steht an der Tafel-Pose auf GTX und Radeon unter 0,22 (Strauch 0,212/0,213). Das A-ROT 0,2635 kommt aus einer veralteten Tafel-Zeile.
- **w17-bild-kollision:** fiel offen (VK 142 → 56 Ankünfte, Pflicht C).
- **w26-ferne-ton / -2, w25-stadt-takt-*, w25-ankunft-block-2, w25-omen-sichtbar, w25-pipeline-vorwaermen, w25-spike-gpu-vegetation:** überholt (ZWEIG-INVENTAR-0911.md).

