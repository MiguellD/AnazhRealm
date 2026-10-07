# Auftrag 0710-3 an den OMEN — Nachbesserung host-vram (Gegenprüfung: merge-reif NEIN, ein roter Punkt)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Klein und dringend: vor dem Weiterbau an fahren-2 (dort
WIP-Commit + Push, dann hier, dann zurück).

Die unabhängige Gegenprüfung von `host-vram` 884111fc (hier am Radeon-PC, echte GPU + swiftshader) urteilt: alles grün bis auf
EINEN Punkt — TRAA-Vortiefe depth16 trägt (vendor/TRAANode.js:675, Stufe 1,53e-5 gegen Schwelle 5e-4, kein reverse-Z/log),
Schatten ohne Farbe identisch (65536/65536 Texel, alle drei Alpha-Klassen werfen ihre Löcher; r184 behält die Fragment-Stufe
mit `targets: []`), gate:ziel-zensus scharf (12/12 Täter), Zahlen gehen auf (8,0 + 3,955 + 5,93 = 17,9 MiB).

**ROT — anazhRealm.js:32797:** `T.texture(abbild, T.screenUV)` liest die Textur der Größe ceil(W/2) per Nearest bei
uv = (x+0,5)/W. Bei UNGERADER Leinwand-Breite liest jedes ungerade x in der rechten Bildhälfte den Block (x+1, x+2), der das Pixel
nicht enthält (ungerade Höhe: untere Hälfte) → neben einem Gegenstand vor dem Wasser ist das Wasser voll durchsichtig: ein heller
Saum von 1 px links am Gegenstand. Gemessen: swiftshader 961×541 37/561 Kanten-Pixel > 8 Luma (bis +25), 960×540 0; echte GPU
(Radeon, Holz voll, TRAA) 1921×1081 57–85 von ~290 Kanten-Pixeln > +8 Luma, 1920×1080 0. Ungerade Größen sind im Spiel häufig
(Fenster-Modus, Render-Skala mit floor). Der Feld-Pass-March (:35825) hat dieselbe Fehlzuordnung (1 px eines fernen Körpers fehlt).
Bilder: `kontext/pruefung/crop-echt-1921.png` (Saum) und `crop-echt-1921-fix.png` (Korrektur).
**Korrektur (gemessen 6–9/290 = Rauschen):** derselbe Knoten mit `texture(abbild).load(ivec2(screenCoordinate.xy).div(2))` —
für BEIDE Leser (Wasser :33156, March :35825), an der EINEN Stelle, wo das Abbild gelesen wird.
**Wand:** gate:post-kette (e) prüft nur 320×240 (scripts/diag-post-kette.cjs:543) und ist für diese Klasse blind — dazu eine
UNGERADE Leinwand mit einem Gegenstand vor dem Wasser; vorher ROT (Saum beim Namen), nachher grün.

**Gelb, im Bericht benennen:** CPU je Frame laut gpu-bank 2,73 → 3,04 ms (+0,31 ms) — passt zum zusätzlichen `renderer.render`
der Vortiefe (anazhRealm.js:89823); ist er nötig, oder kann die Vortiefe im bestehenden Pass entstehen? Zahl oder Grund.
`_tiefenAbbild` hakt je Frame `GPUCommandEncoder.prototype` ein (:32880, try/finally) — benennen, ob ein einmaliger Haken trägt.
Konflikte, die im Bericht fehlten: welle-k-mess-wahrheit und welle-k-streaming kollidieren in der `check`-Zeile von package.json
(beide behalten). Alle drei liegen inzwischen auf integ-probe (7df27bef) — prüfe den Merge gegen integ-probe.

**Bericht:** `bericht/0710-3-host-vram-nachbesserung.md` + Kopf; danach zurück zu fahren-2.
