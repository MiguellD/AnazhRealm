# Bericht 0910-1 Teil A: die Genesis-Linse — Rahmen-Ziel des Direktpfads und Genesis im eigenen Boot

Auftrag: `auftrag/0910-1-omen-linse-genesis-und-host-vram-2.md`, Teil A. Stand 09.10.2026.
Kopf: **welle-m-genesis-linse 2983c6a7** (Basis main 76c9624d, per `git ls-remote`). CI: Lauf 37950704605 (läuft beim Bericht; Ergebnis folgt als Nachtrag).

## In drei Sätzen

Geschnitten wurde an der EINEN Weiche in `_loopRender` (`_leinwandTiefe` → `_leinwandWeg`). Sobald die Post-Kette zeichnet,
verlässt jedes Rahmen-Ziel des Direktpfads die GPU über r184s eigenen Abschied. Die Messfolge misst Genesis im eigenen
Boot, und die Band nennt `tex:r184-ausgabe` und „NICHT GESTELLT“ als ROT.

Gemessen auf der GTX 1060, 1080p, Wiese, mit EINEM Instrument: Die Band nach `zerlegen` trägt bei main **+23,7 MB**
`tex:r184-ausgabe` (126,4 → 145,6 MB), beim Schnitt **0** (126,5 → 122,0 MB; `buf:szene` −4,6 MB auf beiden Seiten ist
Weltzustand). Genesis im eigenen Boot ist GESTELLT und auf beiden Seiten gleich: **156,9 MB · 266 Befehle · 2,49 M Dreiecke ·
GPU 23,7 / 23,1 ms**.

Offen: Die Serien-Hülle für V18.537 ruft `omen-messfolge --ort genesis` je Seite in einem eigenen Boot. Das baue ich mit dem
Messauftrag; die Folge selbst steht.

## Befund (bestätigt)

| | main 76c9624d | Schnitt |
|---|---|---|
| Band an der Wiese vor `zerlegen` | 126,4 MB, Rahmen-Ziele 0 | 126,5 MB, Rahmen-Ziele 0 |
| nach `zerlegen` (2 Durchgänge) | **145,6 MB**, 1 Rahmen-Ziel, 2 Texturen, **23,73 MB** | **122,0 MB**, 0 |
| Unterschied je Erzeuger | `tex:r184-ausgabe` +23,7 · `buf:szene` −4,6 | `buf:szene` −4,6 |
| Band-Linse nach `zerlegen` | LINSE ROT `[leck] tex:r184-ausgabe 23.7 MB in 2 Texturen — Rahmen-Ziel des Direktpfads` | ohne diesen Befund |

Die übrige LINSE-ROT-Zeile an der Wiese (Ratsche `nahWiese`/`bau`) steht vor und nach `zerlegen` gleich. Sie ist der
Ratschen-Stand der Wiese auf main und hat mit dem Rahmen-Ziel nichts zu tun.

Rohdaten: `Desktop\AnazhRealm-OMEN\p3\genesis\zahl` (band-vor/nach-A/B.json, zerlegen-A/B.json, genesis-A/B.json,
fortschritt.log). Hülle: `p3/genesis/zahl.sh`.

## Schnitt

1. **`_leinwandWeg(direkt)`** (vorher `_leinwandTiefe`): die Weiche stellt beide Ressourcen des Direktpfads.
   - Die Leinwand-Tiefe bleibt wie gehabt.
   - Neu ist das Rahmen-Ziel: Zeichnet die Kette und trägt `renderer._frameBufferTargets` einen Eintrag, ruft
     `_rahmenZielAbschied` r184s dispose-Hörer am Ziel. Der nimmt den Hörer ab, entsorgt das Ziel (Farbe und Tiefe verlassen
     die GPU) und löscht den Eintrag.
   - Der Hörer ist am Text erkennbar (`_frameBufferTargets.delete(`). gate:vendor-anker pinnt die r184-Stelle. Fehlt er,
     fällt das Ziel trotzdem, mit einem ERROR-Log.
   - Das gilt für jeden Erzeuger: die Weiche, `zerlegen` und jede Linse mit eigenem Leinwand-Render. Die Ausgabe-Aufnahme
     setzt ein eigenes Ausgabe-Ziel; r184 schlüsselt ihr Rahmen-Ziel an diesem Ziel und entsorgt es mit ihm.
2. **`omen-messfolge --ort genesis`**: `FOLGEN.genesis` = boot · dorf-aus · fenster · umstellen --ort genesis · buehne · band.
   - Jeder Aufruf ist ein eigener Boot.
   - `bandBefunde` urteilt die Aufzeichnung der Band: `ortGestellt` nicht leer heißt „ORT band: NICHT GESTELLT“ (ROT, der Lauf
     zählt nie). Ein Rahmen-Ziel im VRAM heißt „RAHMEN-ZIEL band: …“.
   - Die Wiesen-Folge ist unverändert.
3. **band-urteil `rahmenZielBefunde`**: `tex:r184-ausgabe` im VRAM-Abgriff (sonst in den Textur-Objekten) ist LINSE ROT (`leck`)
   mit Zahl und Grund.

## Linse vorher ROT → nachher GRÜN

gate:post-kette (g) läuft am echten Renderer (swiftshader) und zählt je Schritt der Weiche die Rahmen-Ziele.

| Schritt | vorher (main) | nachher |
|---|---|---|
| Post-Kette (vor dem ersten Ausflug) | 0 | 0 |
| Direktpfad | 1 (2 Texturen, 0,88 MB) | 1 (die Band-Regel nennt es) |
| Post-Kette zurück | **1 → ROT** | 0 |
| Render-Fehler (Rückfall bleibt im Direktpfad) | 1 | 1 |
| am Ende (nach Wasser und Godrays) | **1 → ROT** | 0 |

Selbsttests:
- profiband S17c: `tex:r184-ausgabe` → LINSE rot, auch aus den Textur-Objekten.
- omen-messfolge: die Genesis-Folge, der 0710-9-Fall (Wiese statt Genesis und 23,7 MB), ein gestellter Ring ohne Rahmen-Ziel.
- post-kette: das bleibende Ziel, das Ziel am Ende, der blinde Direktpfad, ein ungemessener Schritt.

## Wände

`npm run check`, lint, format:check, gate:post-kette, gate:ziel-zensus, gate:kamera-treue, playtest:fast, voller Playtest (165 s, „Alle Invarianten OK“) — alle grün, lokal am Kopf 2983c6a7.

## Für V18.537

Je Seite ein eigener Boot: `node <instr>/scripts/omen-messfolge.cjs --ort genesis --seite http://localhost:4312 --datei
genesis-<X>.json`. Die Genesis-Zahl einer Seite zählt nur bei MESS-FOLGE GRÜN. Das Instrument muss diesen Kopf tragen, also
B = Integrator-Kopf mit welle-m-genesis-linse, sonst dieser Zweig als Instrument.
