# Bericht 0710-3: Nachbesserung host-vram — der Saum auf ungerader Leinwand fällt

**Urteil.**
- **Geschnitten:**
  - Das Tiefen-Abbild wird jetzt ganzzahlig gelesen, an der EINEN Stelle für beide Leser: Jedes Pixel liest den Block, der es enthält.
  - Der Zug der Vortiefe ist ein roher Pass statt eines eigenen `renderer.render`.
  - Der Haken an der Encoder-Kopie liegt einmal und ist nur für den einen Bruch scharf.
- **Gemessen:**
  - Der Saum auf ungerader Leinwand fällt von 11 von 31 Kanten-Pixeln (bis 45,5 Luma) auf 0 von 37.
  - CPU je Zug: Vortiefe 138 / 120 → 22 / 25 µs, Abbild 45 / 44 → 42 / 39 µs.
  - Der Verlauf der Vortiefe ist bit-gleich.
- **Ehrlich offen:** Von den +0,31 ms gpu-bank-CPU erklärt die Vortiefe etwa 0,1 ms. Der Rest liegt in der CPU-Streuung von gpu-bank (Basis 2,46–4,61 ms bei n = 4).

## Kopf

`host-vram` **520e941d** (gepusht), auf `884111fc`. CI siehe §Wände.

## ROT — der Saum (anazhRealm.js:32797)

- **Wurzel:** `T.texture(abbild, T.screenUV)` las die Textur der Breite ceil(W/2) mit Nearest bei uv = (x + 0,5)/W. Bei ungerader Breite traf jedes ungerade x der rechten Hälfte den Block (x+1, x+2), der das Pixel nicht enthält; bei ungerader Höhe gilt dasselbe für die untere Hälfte.
- **Folge:** Neben einem Gegenstand vor dem Wasser las das Wasser die Tiefe des Gegenstands, sein Weg wurde 0, es war durchsichtig.
- **Schnitt:** `T.texture(abbild).load(T.ivec2(T.screenCoordinate.xy).div(T.ivec2(2, 2)))`. Das ist der EINE Knoten `_szeneTiefe` für Wasser und March; der Kommentar dort nennt die Gegenprüfung.
- **Wand `gate:post-kette` (f):**
  - **Aufbau:** Die Seite wächst auf 321×241. Ein schräger schwarzer Pfahl steht im Wasser über hellem Grund, in der rechten Bildhälfte, und seine Kante wechselt Zeile für Zeile die Parität.
  - **Messung:** Je Zeile nimmt die Wand das Wasser-Pixel links an der Kante, einmal mit dem Abbild und einmal mit r184s Viewport-Tiefe, in voller Auflösung und bei festen Uhren.
  - **Vorher ROT:** 11 von 31 Kanten-Pixeln bis 45,5 Luma.
  - **Nachher:** 0 von 37, größte Abweichung 5,4.
  - **Selbsttest:** Saum, gerade Leinwand (blind) und kein Gegenstand (blind) fallen je beim Namen rot.
  - Die Wasser-A/B (e) bei 320×240 und die Kisten-Tiefe der Bild-Mitte sind unverändert.

## GELB 1 — der Zug der Vortiefe (+0,31 ms CPU)

**Muss die Vortiefe in einem eigenen Render entstehen, oder kann sie im bestehenden Pass entstehen?**

Im bestehenden Pass nicht. TRAA liest die Tiefe des VORIGEN Frames, und der Szenen-Pass überschreibt seine Tiefe in jedem Frame. Ohne Kopie bliebe nur ein Ping-Pong zweier Szenen-Tiefen (2 × depth24plus), das kostet 3,95 MB mehr als heute (depth24plus + depth16).

Ein eigenes `renderer.render` war dafür aber nicht nötig, es baute Szene, Orthogonal-Kamera, Render-Liste, Material-Weg und Pass-Deskriptor für EIN Vollbild-Dreieck. Jetzt läuft `_traaVortiefeZug` als roher Pass auf eigenem Encoder, an derselben Stelle der Queue wie r184s eigene Kopie: `copyTextureToTexture` erzeugt einen Encoder und reicht ihn sofort ein. `textureLoad` der Szenen-Tiefe wird als `frag_depth` geschrieben, Test immer, kein Farb-Anhang. Szene, Kamera, Stoff und der Tiefen-Anhang des Geschichts-Ziels fallen weg.

- **gate:ziel-zensus (d):** Der Verlauf ist bit-gleich (0,9842 / 0,9323 / 0,8805), die Farbe der Geschichte bleibt unberührt.
- **Zahl:** GTX 1060, Werkbank an der Mess-Wiese, ABAB mit je 2 Boots, CPU je Aufruf (JS + Kodierung + Einreichen) über 300 echte Frames. Der Timer der Seite löst nur 0,1 ms auf, deshalb Mittel über je 270 Aufrufe. Ergebnis: **138 / 120 µs → 22 / 25 µs**, also rund −0,1 ms je Frame.
- Die übrigen ~0,2 ms des gpu-bank-Abstands lassen sich keinem Zug zuordnen. Die Spannen der gpu-bank-CPU überlappen (Basis 2,46–4,61 ms, Kopf 2,81–3,43 ms bei n = 4).

## GELB 2 — der Haken am Encoder-Prototyp

**Trägt ein einmaliger Haken?** Ja, er liegt jetzt. `_tiefenAbbild` hängt die Encoder-Kopie einmal ein (`A.haken`) und macht sie nur für den EINEN Bruch scharf (`A.scharf`, try/finally). Jede andere Kopie fährt r184 unverändert.

Vorher wurde `GPUCommandEncoder.prototype.copyTextureToTexture` je Frame zweimal zugewiesen. Jede Zuweisung verwirft, was der Motor über diese Methode bei allen Aufrufern angenommen hat.

CPU des Abbild-Zugs, gemessen wie oben: **45 / 44 → 42 / 39 µs**.

## Konflikte — Probe-Merge gegen integ-probe `7df27bef`

Den Probe-Merge habe ich in einem Wegwerf-Worktree gefahren, `merge --no-commit`, danach verworfen.

- **`anazhRealm.js`:** führt konfliktfrei zusammen.
- **`.github/workflows/check.yml`:** 1 Textstelle. Mein Schritt „Ziel-Zensus“ und der Schritt „Kamera-Treue und Stand-Wand“ von integ-probe hängen an derselben Stelle an. Auflösung: beide behalten.
- **`package.json`, Zeile `check`:** 1 Textstelle. Auflösung: die Zeile von integ-probe (mit `diag-wetter-wache --selftest`, `omen-messfolge --selbsttest`, `diag-stand-takt --selftest`) plus `diag-ziel-zensus.cjs --selftest` hinter `diag-post-kette.cjs --selftest`. Die Kollision welle-k-mess-wahrheit / welle-k-streaming steckt schon in dieser Zeile von integ-probe.
- **Am aufgelösten Merge grün:** `npm run check`, eslint, gate:post-kette (samt Saum auf 321×241), gate:ziel-zensus, gate:kamera-treue, gate:schatten-werfer, gate:fenster-wechsel.

## Wände (lokal am Kopf)

Grün sind:
- post-kette (mit (f)), ziel-zensus, fenster-wechsel, vendor-anker
- page-error, kamera-treue, gpu-lens, analog-nah
- check, lint (0 Fehler), format:check, playtest:fast, voller playtest („Alle Invarianten OK“)

**CI** Lauf 37664758294 am Kopf: der check-Job ist grün, der playtest-Job läuft noch. Das Ergebnis meldet die nächste Nachricht; die CI-Lage aus 0710-1 gilt weiter (Schritt 32 flackert, auch an der Basis).
