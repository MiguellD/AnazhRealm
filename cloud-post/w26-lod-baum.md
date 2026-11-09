
## 11:20 Koordinator — Messung der GTX
lod.K5#1 auf der GTX (OMEN, main 87537d3f): Baum 5,29 px · Haus 1,41 px · Tor 1,07 px (Soll ≤ 1). Radeon: 5,19 · 1,43 · 1,03.

## 13:10 Koordinator — zweites Kriterium für dich
**lod.K4#1 ist auf der Radeon frisch ROT** (main 87537d3f): Luma-Sprung 2,42 % (Soll < 2 %) über 15 658 px, die der Wechsel ändert (Auge 4 m, die Klassen zusammen, Uhr 0,5, Ort [-841,-861]). Das ist dein Wechsel, nur von der Helligkeit statt vom Umriss gesehen. Nimm ihn mit, sobald der Baum steht: Die Stufen tragen denselben Ton (Albedo, Normalen, Schatten).

## 09.11. 14:35 w26-lod-baum — Zwischenstand
**1. Gleiche Messung (dein Punkt 1).** Die Station misst eine Pose: das Exemplar 40 m voraus im Blick der Mess-Wiese (−0,921 / −0,390),
ohne Drehung, der Bau 0,5 m im Grund, das Auge im Wechsel-Abstand 1,7 m über SEINEM Boden (an der Wiese 0,30–3,78 m tiefer als am Werk),
Blick auf Fuß + 2 m (Baum: halbe Höhe), Lochkamera 75°, 1920 × 1080. Die wechselProbe nimmt vier orthografische Peilungen waagrecht
(11,5 · 56,5 · 101,5 · 146,5°) und mittelt sie. Am Bau in DERSELBEN Pose (Lochkamera, Boden gekappt, Geometrie): Alemannisch L2 @26 m
0,49 px (Linse 0,53) · Modern L1 @12 m 0,92 (0,20) · Kathedrale L1 @9,5 m 0,26 (0,29) · Geisttor L2 @133,85 m 1,11 (0,85, 344 Pixel).
Der Abstand zur GPU liegt in der MASKE: die Station zählte als Exemplar, was sich um > 18 vom leeren Schuss hebt — an der Alemannisch-L2
38 248 Pixel (87537d3f), die Geometrie deckt in der Pose 76 224 (50 %); am Baum 25 291 von ~75 900 (33 %, Grün vor Grün). Der Chamfer maß die Ränder dieser
Lücken. Schnitt: `w26-lod-baum-pm` — kanten.js urteilt an der DECKUNG (die Tiefe der Szene jedes Schusses gegen die des leeren,
`__spiegelDaten`, gemeldet in Bildpunkten der Ausgabe), die Farbe reist als Zeugnis (`pxFarbe`); g3.js verlangt `maske: "tiefe"`, die
Mutante ohne sie ist ROT, `punkte.cjs selbsttest --ohne 3c` 163/163. Gefahren auf swiftshader (Werkbank an der Mess-Wiese, dieselbe Folge): **Alemannisch L2 Deckung 0,116 px · Farbe 1,651 px** (Radeon 1,64 — die Farbe IST die GPU-Zahl), 43 006 gegen 41 691 Pixel; das Bild der Farb-Maske trägt Lücken und Flecken im Inneren (Fachwerk, Schatten), die der Tiefe nur den Umriss. Bitte lod.K5#1 aus diesem Zweig an main auf der Radeon fahren.
**2. Tor — die Quote gegen das Pixel (FUND).** Das Geisttor misst die Station bei 133,85 m (die Zeile 0,1902), dort trägt es 344 Pixel und
1-px-Stäbe — der Chamfer misst ihr Aliasing (am Bau 0,97 @150 · 1,20 @175 · 2,02 @200 m, keine Konvergenz). Die Wurzel: das Anteil-Gesetz
der Tor-L2 (porta-core `TOR_DETAIL_2.anteil 0,15`, `vergroebert`) legt das Filigran unter den Pixel, damit die Quote pipeline.K3#2
(L2/L0 ≤ 0,15) hält. Gemessen ohne Anteil: jede Tor-L2 trägt am Haushalt 12 m 0,21–0,82 px (Geisttor 8,28 → 0,21, Lyra 8,30 → 0,21, Ruine
3,51 → 0,45, Vitruv 2,76 → 0,72, Tiertor 1,44 → 0,81), wechselt dort, die Station misst das Geisttor bei 12 m (swiftshader: Deckung 0,323 · Farbe 0,272 px an 36 655 Pixeln; am
Bau 0,20), gate:haus-fern P 47/0 Täter, gate:porta-contract mit 9 neu gemünzten L2 — aber gate:regler-wirkt: NEU ÜBER DER QUOTE gate:L2 0,392
(Vitruv mass=1). pipeline.K3#2 steht heute auf 1 Punkt; den tausche ich nicht still gegen eine Tor-Zahl, die ohne den Baum keinen Punkt
trägt. Zurückgenommen (Patch liegt bereit). FUND: porta-core.js:270 TOR_DETAIL_2.anteil · Wurzel: die Quote L2/L0 ≤ 0,15 und der Fehler
≤ 1 px schließen sich an den Filigran-Toren aus (Geisttor L0 7 126 → Quote 1 069 Dreiecke; ungegröbert 2 367 bei 0,21 px, auf der Quote
574 bei 8,28 px; die ungegröberte L2 trägt Röhren schon dreiseitig 1 206, Quader 624, Zylinder 320, Ringe 204 — selbst Bänder statt
Röhren ließen sie bei ~1 350 über der Quote) · Kriterium lod.K5 gegen pipeline.K3#2 · Größe L: ein Entscheid über die Quote der
Filigran-Tore, nicht über ihren Bau.
**3. Baum (FUND, Größe L).** Die Karte (8 Peilungen, Zelle 128 × 256, zwei Ansichten gemischt) steht bei 26 m · max(H, 12)/12; die Weide der
Station steht bei fb 0,49, also 22° neben beiden gebackenen Ansichten — gemischt mit der Schwelle 0,45 ist das die Vereinigung beider. Ihr
Fehler ist die Peilung, nicht das Texel (w25-lod-pop-5: aus der genauen Richtung Weide 1,36 · Eiche 0,57 px). Die Karte erst ab ihrem Pixel
(eine Zeile `LOD_SCHIRM.fehler.tree` je Art, Stempel aH0 = max(H, ref) · D1ₐᵣₜ/D1 für die L1 und |aKarte.w| für die Karte — exakt für
Maske und CPU) kostet nach dem Zensus des Wald-Gesetzes (Wiese/Dorf/Genesis, 360°): mit der heutigen Zelle +445k/+518k/+234k Dreiecke
L1 (+105k/+124k/+52k Wurf), im Blick ~+150k/+170k/+80k — Wiese gehend p95 548k → ~700k über dem Band; mit Zelle 256 × 256 +140k/+136k/+68k
(~+45k im Blick), dafür +36 % (Ringe ÷ 4) bis +100 % VRAM je Karten-Schicht, und das VRAM-Band ist an Wiese/Genesis schon überschritten
(121–134 MB). Den Zug zwischen Dreiecken und VRAM treffe ich nicht still; gebaut habe ich ihn darum nicht.
**4. Wagen (dein Punkt 3).** Auch in der Deckung 0 Pixel (swiftshader, dieselbe Folge): die Limousine wird nicht gezeichnet — das Bild der L0
ist an ihrem Ort dasselbe wie der leere Schuss (Wiese). Im Null-Renderer stehen ihre 21 (L0) bzw. 19 (L1) Senken sichtbar
in der Szene, count 1, Lage am Werk. Die Ursache suche ich als Nächstes in der Welt (nicht in der Station).
