# wind-boee-haus — Stand-Blatt (Macher-Bahn, Welle 27.11.)

## Stand 26.11. spät — ZWISCHENSTAND (oben steht immer der neueste)

**Gemessen in der Welt** (Werkbank kienspan, Wiese −280,4/−1045,6, nach dem Gang über das Dorf; alt = der virtuelle Stamm von main 4a188bf2, live getauscht, gleiche Pose):

| | main | wind-boee-haus |
|---|---|---|
| kraft#2 S2 laufzeitAbw (Soll ≤ 20 %) | 23,741 % | 6,117 % (ein zweiter Wetter-Stand: 11,71 %) |
| stadtklima#1 Zeuge der Station (Pool um das Auge) | 0 | 0 (die Station fragt den Pool: bleibt ROT) |
| stadtklima#1 Zeuge des Kandidaten (Häuser der Welt) | — | 2,616 (1 635 s ÷ 625 s, Haus 433 m vom Auge) |
| Hüllen der Stufe 3 mit Decken an der Wiese | 0 von 25 (40 Häuser geladen) | 16 von 16 (17 Häuser geladen) |
| `_windAt` je Ruf | 4,7 µs | 5,6 µs |
| `_hausSchatten` je Ruf (2 000 Orte im Dorf) | 1,3–2,9 µs, 0 im Schatten | 3,4–4,1 µs, 155 im Schatten |

ms je Bild an derselben Pose: nicht gemessen. Der GPU-Prozess der Werkbank (swiftshader) stürzte beim Boot, `werkbank lauf` fand keine Instanz. Die Kosten stehen je Ruf, den Richter macht die GPU-Probe am Kopf.

Linsen: gate:kopplung F8 neu (ein Haus der Welt, das Auge 700 m weg, Pool leer): ×2,630, die Täter „ohne Schatten“ und „Pool um das Auge“ fallen auf ×1. diag-wetter-wache --selftest grün, (Ö) am Wirt ±6,117 %. Atlas-Ratsche und stamm:lint grün.

Station-Kandidat: `cloud-post/wind-boee-haus-station/` (Diff gegen origin/punkte-maschine ae1e2b87 und BEGRUENDUNG.txt; Wand tafel grün, liste an der Basis schon ROT bei planet.wasser.stroemung S1).

## Stand 26.11. abends — ZWISCHENSTAND (oben steht immer der neueste)

**Täter mit Zahl, beide Sprossen.**

- `karte2.leben.pflanzen.kraft#2` (S2 laufzeitAbw 23,741 % gegen Soll ≤ 20 %). Täter: `stamm/stoff-material.js _boePhase`.
  Die Böe lief mit `boeTempo(U)` des freien Felds über die ganze Strecke, an jedem Ort gleich. Lee, Düse und Gasse
  (`_windForm`, `_gassenWind`) formen am Ort den Wind, aber nicht das Tempo der Böe. Schnitt: der Weg der Böe ist das Integral
  des Tempos am Auge, `c = boeTempo(U · form · gasse)` (Taylor 1938, Proc. R. Soc. A 164: die Böe zieht mit 0,8–1,0 × dem
  mittleren Wind am Ort). Er läuft als Anker-Reihe in fünf Float64Array mit höchstens 256 Ankern, ohne Allokation je Bild.
  Station nachgebaut in node (derselbe Harness wie der Selbsttest, 12 Orte): Wiese 23,74 → 6,12 %, alle 12 Orte ≤ 7,35 %
  (vorher bis 222 % bei 2000/−800). Die Bestätigung in der Welt läuft.
- `karte2.planet.kopplung.stadtklima#1` (der Zeuge fehlt: Schatten ÷ Sonne 0). Täter ist NICHT `_windAt`, sondern zwei Stellen:
  1. `stamm/stoff-dach.js _hausSchatten` las den Dach-Pool um das Auge (64 m, 8 Plätze). An der Wiese steht das nächste Haus
     351 m weg, der Pool ist leer, also ist die Nässe am Ort eine Funktion des Auges, nicht des Orts. Das trifft auch den
     Reifen des Verkehrs (`_fahrHaft` → `_naesseAm`).
  2. `fachwerk-core.js buildStufe`, Stufe 3: die Hülle trägt keine Decken (25 von 40 Häusern der Wiese).
  Schnitt: EINE Quelle der Decken (`_deckenVon`, gelesen von Pool und Schatten am Ort). Der Schatten am Ort fragt das
  Blocker-Netz den Sonnenstrahl entlang bis `NAESSE.wurfM`. Stufe 3 trägt die Decken: 64 von 64 Häusern byte-gleich zu Stufe 2,
  das Gitter der Stufe 3 byte-gleich (Hash 3c1a8f6d vorher = nachher), 5,83 ↔ 5,84 s für 110 Bauten.
  Die Station wählt ihr Haus aus dem Pool um das Auge, sie bleibt an der Wiese also ROT. Ein Kandidat folgt unter
  `cloud-post/wind-boee-haus-station/`.
- Die Leiter 12,019 s gegen den Deckel 12 s (kraft): das ist Sache der Station. Der Richter bleibt unverändert.

Karte 2 gebucht: 131 von 1 718.
