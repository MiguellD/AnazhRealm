# w28-march-schirm — Abgabe a16016c4 (OMEN, GTX 1060, 15.11.2026) — ZWISCHENSTAND

Messort: die Netz-Stadt „dorf 7 4750“, 3 × 3 Kacheln wach, 1920 × 1080, 12 Uhr. Vorher = Netz-Kopf c5f725ab ohne den Schnitt,
nachher = derselbe Baum mit dem Schnitt (lokal gemergt, nie gepusht). Treiber `p3/n1411/netz/stadt-netz.cjs … stand` auf OMEN.

## Die Bilder (vorher ↔ nachher, dieselbe Kamera)

| Kamera | vorher | nachher |
|---|---|---|
| aus 260 m | `vorher-ueber-260m.png` — die äußeren Kacheln sind leere Straßenraster | `nachher-ueber-260m.png` — jede wache Kachel trägt ihre Häuser |
| aus 90 m nach Osten | `vorher-ost-90m.png` — rechts eine Kachel ohne ein Haus | `nachher-ost-90m.png` — Dächer bis zum Rand |
| vom Boden die Hauptstraße | `vorher-boden-ost.png` — ein Mensch auf der Straße | `nachher-boden-ost.png` — die Straße voller Leute, fern je EIN Feld |

## Die Zahlen

- Häuser der wachen Kacheln: 1641, davon 1442 im Satz, 199 als Mesh, 1 ohne Bild (wartet, 501 m; in Lauf 6 keins) — vorher 990 von 1829
  ohne Bild, 989 davon für immer aufgegeben. Kein Haus gibt mehr auf.
- Leiber: 701 leben, 642 im Feld — 126 mit Gliedern (bis ~75 m), 516 mit EINEM Feld (bis ~170–195 m), 3 geparkt dahinter.
- Ruhe im Stand (eingeschwungen, 30 s): 0 Wechsel der Bauten, 0 Stufen-Wechsel, 0 gewichene Leiber; die Feld-Liste hält 128 frei.
- An main nicht schlechter (stadt-voll, je zwei Läufe, `roh/gang-*.json`): Gehen > 33 ms 2,78 / 2,49 % (main 3,39 / 2,83 %), größtes
  Bild 233 / 200 ms (main 358 / 442); Fahren 11,91 / 12,86 % (main 12,69 / 13,28 %), größtes Bild 217 / 317 ms (main 250 / 292);
  VRAM 188,2 MB (main 189,3), Heap nach GC 915 MB (main 929).
- Stand der Netz-Stadt, Bild p95: 33,3 ms vorher und nachher in zwei ruhigen Läufen; zwei Läufe neben meinen Toren lasen 41,6 ms.
- Tore am Kopf: `npm run check`, format:check, lint, gate:betriebsgesetz Exit 0; gate:arch-feld grün am Kopf davor (42e1d029).

## Offen, beim Namen

- Die KAPSEL-Liste hängt nicht am Schirm: ein Satz je Haus (3,3 Slots mit ganzem Dach). 3 × 3 Kacheln: 6779 von 8192; in der
  größeren Stadt (14 Kacheln, 2438 Häuser, `roh/lauf7-weite-netz.json`, Kopf vor der Dach-Heilung) 6689 mit halbem Dach — mit
  ganzem füllt sie sich, dann wartet das fernste Haus. Die Feld-Liste wuchs dabei nicht (3968 → 3961). Das gehört der Ferne.
- Selbst gefunden und im Zweig geheilt: die Fern-Hülle trug das halbe Dach (das Satteldach sind zwei gleiche Keile) — Linse
  gate:haus-fern (H); Nah-Leiber ohne Vorback-Platz zählten auf Dauer als offen.
- Außerhalb der Datei-Liste des Auftrags angefasst: stamm/siedlung-bewohner.js (`_bewohnerFeldLage` liest die Lage je Name),
  stamm/kreatur-verhalten.js (`darf()`), stamm/dirigent-takt.js (`_weltOffen`), spec/uhr/geraetezeit.json (zwei Leser).
- Die Station mensch.K1#1 liest weiter rot, das Bild stimmt (76 von 77 Leibern gezeichnet): ihr Third-Auge steht im Hausgrundriss.
