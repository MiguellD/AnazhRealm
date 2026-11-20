# krone-umriss — Befund (20.11., Radeon 890M, Zweig krone-umriss = main 94e4c615 + w28-laub-kante-5, ohne Schnitt)

## Die drei Messnamen (lod.K1#1 laub-kante, Tafel-Pose, Weg der Linse `werkbank kante --eigen`)

| Messname | Zahl | ausgeschlossen |
|---|---|---|
| kante fimp:birke:L2 | 0,2647 | Streuung zwischen Boots (0,0000), Wind/Zeit-Phase, Aufnahme vor dem Einschwingen |
| kante fimp:buche:L2 | 0,2707 | dieselben drei; der frühere Lappen-Einsatz (Stufe 2 statt 3) bewegt sie nicht (0,2738) |
| kante fimp:eiche:L2 | 0,2598 | dieselben drei; der Lappen-Einsatz ab Stufe 2 macht sie gerader (0,2849); die Nachbarn tragen sie nicht (ohne sie 0,2544 statt 0,2241, fensterloser Weg) |

## Die Streuung gibt es nicht — es waren zwei Wege

- Gleicher Weg, gleicher Code: Linsen-Weg (mit `/fenster 1920 1080`) liest 0,2598 · 0,2598 (zwei Sitzungen, früher und 25 s später
  im selben Boot byte-gleich: die Welt steht ohne Takt der Werkbank, `spielZeit` 40,856 → 40,856). Der Weg ohne `/fenster`
  (`werkbank start` + `bild --w 1920 --h 1080`) liest 0,2241 · 0,2241 (zwei Boots, je Klasse ±2 Pixel).
- Der Unterschied ist die Welt, nicht das Maß: dieselben 215 Streu-Zellen im Frustum (2 verschieden), aber 535 Karten-Slots des
  Atlas mit Fenster gegen 1 261 ohne — 726 Karten weniger. Im Bild: der Nadel-Bestand hinter der Eichen-Reihe links (x 0–760,
  y 560–820) steht ohne Fenster da und fehlt mit Fenster (scratch `pa.png` / `pb.png`). Das Fenster der Seite bestimmt, welche
  Fern-Karten die Welt hält; das Bild bei 1 920 × 1 080 ohne passendes Fenster ist eine Welt für einen anderen Schirm.
- Damit stand mein Spike-Urteil auf stabilem Grund: Tafel eiche 0,2598 → 0,2849 und Spielgang f:eiche:L1 0,1751 → 0,2429 sind
  echte Verschlechterungen, kein Rauschen; der Lappen-Schnitt bleibt gefallen.

## Woher die gerade Kante der Eiche kommt (Zensus, Tafel-Pose)

- Die Eichen-Klasse an der Tafel ist die niedrige Reihe des Waldmantels (40–200 px hoch), nicht ein Baum bei 200–400 px;
  98 % ihres Rands grenzt an Ungemessenes (ferner Hang, Boden), 2 % an Himmel.
- (b) Verdeckung/Linse: ausgeschlossen an der Quelle — `klassenMasse` zählt nur Rand gegen `aussen` (kein gemessener Teil),
  Instanzen derselben Klasse vereinen sich; ohne Nachbarn liest die Eiche gerader (0,2544), nicht glatter.
- (c) Mip gröber als der Schirm: ausgeschlossen an der Quelle — Karten-Zelle 128 × 256 (foundry-core `impostor`), die Krone steht
  mit 40–200 px, also ≤ 1 Texel je Pixel.
- (a) Kartengrenze: keine Seite trägt ≥ 0,03 — Rand oben / unten / Flanke 0,326 / 0,269 / 0,263 (Linsen-Weg), ohne die stärkste
  Seite 0,265 statt 0,282.
- Fall „EIN Baum allein“ und „Bestand als L1“ lieferten im fensterlosen Weg kein Urteil (halbes Überblend-Paar; die gedeckelte
  Stufen-Wahl griff nicht, die Welt steht ohne Takt) — sie zählen nicht.

## Ergebnis

Keine Ursache trägt ≥ 0,03 der Kante — die Familie krone-umriss endet hier, ohne Schnitt. Benannt und offen: die Fern-Karten
hängen am Fenster der Seite (726 Karten an der Tafel-Pose); jede Bild-Messung ohne `/fenster` misst eine andere Welt als die Linse.
