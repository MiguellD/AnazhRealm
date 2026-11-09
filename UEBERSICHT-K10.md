# ÜBERSICHT Konto 10 — jeder offene Zweig mit Ziel (Stand 09.11. 21:00, main da0e790f, gebucht 224)

Erhoben: 782 Zweige der letzten 14 Tage. 325 tragen Inhalt, der nicht in main ist (`merge-tree` gegen main). Davon:
- 40 `-pm`: Stationen, sie landen auf punkte-maschine, nie auf main.
- 8 vorher/nach-Proben.
- Rest gruppiert nach Familie: 300 Familien.
Die Schicksale älterer Zweige stehen in `zug/abgeloest.txt` (Heimholer 08.11.). Alte w4-Zweige (Ende Oktober) wirken „nicht drin“, weil main ihre Zeilen umgeschrieben hat. Für sie zählt abgeloest.txt, nicht die Zeilen-Quote.

## In der Schlange (Skripte, ohne Token)
| Zug | Zweige | Ziel |
|---|---|---|
| z351 | w26-stadt-takt-4b | C, E (Verkehr, Stadt-Takt) |
| z352 | w26-boden-nah · w26-haar-arm · w26-leib-raum · w26-klang-schritt · w26-probe-node | material.K2#1 gtx, haar.K2 (Radeon 0,5638 > 0,533), Guss der Menge, klang.K4#2, CI |
| z353 | heim2-w20-wald-kosten (trägt w16-wald-innen) | C (Vorrang, Stauraum), vegetation.K3 |

## In Heilung (Cloud)
| Zweig | Sitzung | Grund |
|---|---|---|
| w25-gpu-wahl-2 | takt-streu | z350 ROT: Werfer-Wand S11/S12, Upload 56,9 KB/Bild, S0-Schale ohne Licht-Pool |
| w26-winter-fichte(-2) | winter-aehre | z349 ROT: „Ähre ohne Stängel“ (halmAehrenFuss) |
| w26-ferne-ton-3/-4 | stoff-statt-farbe | z347 ROT: Haftung/Wiese aus der Bodenfarbe |
| w26-eiche-kante | eiche-l1 | lod.K1 f:eiche:L1 |
| w27-ankunft-erstbild | ankunft-erstbild | ankunft.K5 (abgegeben 70197657, Klasse der langen Aufgaben folgt) |
| w24-wiese-ferne-z · heim2-w21-laub-jahr-fern · w23-pruef-welt-heim | heimholer-k10 | Konflikte mit main |
| w27-stadt-bild → w27-karte-nadel | GTX 1050 | bild:stadt geschnitten (werkbank.cjs:1090), karteNadel-Redeklaration |

## Zurückgehalten mit Grund (cloud-post/<zweig>.md)
- **w26-programm-katalog:** Gewinn unbelegt.
- **w26-lack-glas:** Radeon UNGÜLTIG.
- **w26-fahrt-planer:** mit `_wieseFernBereit` vereinen.
- Keiner dieser drei hat eine laufende Sitzung. Sie warten auf einen Besitzer mit Zahl.

## Nicht zu landen
- **w26-laub-kante:** byte-gleich main. Es ist ein Mess-Befund: Die Laub-Kante steht an der Tafel-Pose auf GTX und Radeon unter 0,22 (Strauch 0,212/0,213). Das A-ROT 0,2635 kommt aus einer veralteten Tafel-Zeile.
- **w17-bild-kollision:** fiel offen (VK 142 → 56 Ankünfte, Pflicht C).
- **w26-ferne-ton / -2, w25-stadt-takt-*, w25-ankunft-block-2, w25-omen-sichtbar, w25-pipeline-vorwaermen, w25-spike-gpu-vegetation:** überholt (ZWEIG-INVENTAR-0911.md).

## Messung am main da0e790f (gtx-da0e OMEN Scheibe 1, radeon-bild)
- **GRÜN:** mensch.K4#1 radeon → mensch.K4 0 → 2, gebucht 224.
- **ROT mit Zahl:**
  - haar.K2#1 (beide, z352 zielt)
  - lod.K5#1 (Baum-Pop 5,16 px)
  - studios.K4 (0/7)
  - tiere.K5#1 (Ego 1 Sichtung)
  - ferne.K1#2 (8 km 13,77°)
  - physik.K2#2 (Bild ≠ Kollision, Wagen 81 m/s Spalt 0,218 m)
  - licht.K2#2 (UNGÜLTIG)
  - affekt.K4#2 (ohne Modell)
  - tiere.K3#2 (in der Sache GRÜN, ROT nur am Pointer-Lock des sichtbaren Fensters → OMEN sucht den Stapel)
- **Ungemessen:** vegetation.K3#1, ankunft.K4#1, gelaende.K2#2, tiere.K1#2, vegetation.K4#2 (Deckel/Budget).
