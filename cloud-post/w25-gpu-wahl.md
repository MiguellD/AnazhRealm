# Post an w25-gpu-wahl

## 09.11. 04:12 — Abgabe w25-gpu-wahl (Arbeiter)
ABGABE 757f9f439c4f6f47f9c0a36c2171d71e53602da8

Atlas Schnitt 2 · EINE GPU-Wahl für jede Instanz, main V18.546.233 gemischt.
- Geschnitten: `_instanzWahlArt` gibt "gpu" für jede globale Gruppe ohne Schalter; die CPU-Wahl (`_instanzWahlPass`, `_instanzWahlWeg`, das Bündel @wahl), `_nahWieseSicht` und `_nahWieseFernSatz` fallen; `PASS_WAHL_WGSL` verdichtet per Präfixsumme (A↔A byte-gleich), liest das Fenster der Stufe (`haelt`, Rand `haltBlende`), die Nähe hält ihre Stufe als Zustand mit Hysterese, Ferne und Schale rechnen `_wieseFern`/`_wieseSchale` als WGSL aus derselben Algebra; der Bestand der Nah-Wiese schreibt je Kachel einen Block nur bei Geburt und Tod.
- Gemessen (GTX 1060, Mess-Wiese Ego im Gang, derselbe Messplatz gate:geh-zerlegung, Takt-Spitze p95/Mitte, Gang 2; main 3fcecab7 gegen c856a2a6): `_passSicht` 20,5/6,7 → 7,8/3,0 ms (CPU-Wahl 9,5/2,7 + Sicht-Satz der Wiese 4,8/2,0 → `_instanzWahlGpu` 2,3/1,3); Bild p50/p95/max 33,3/41,8/83,3 → 24,9/33,3/41,7 ms; Bilder über 33 ms 76/129 → 11/180; bild:wiese@0.5 GRÜN (Luma 57,2, Farben natürlich nach dem Schritt-Schnitt). Pop swiftshader frische Welt: Treue 0, 0,1296 %/s (main 0,1265); auf der GTX brach an c856a2a6 die Treue (Glied der Wahl fiel aus seiner Arena) — behoben, die Probe von 757f9f43 richtet. check, playtest:fast 21/0, welt-boot und 11 voll-Linsen GRÜN.
- Ehrlich offen: `_passSicht` Mitte 3,0 ms über dem Ziel 2 (`_chunkSatzPass` 0,9, Aufträge je Glied und Pass 1,3); die Nah-Streu wählt weiter je Pflanze im Satz der CPU; WebGL2 ohne Arena wählt nichts; „used in submit while destroyed“ (renderContext_2) in 2 von 8 frischen Boots lokal, Täter unbenannt; die Ferne (12 709) rechnet in EINER Arbeitsgruppe.

## 09.11. 03:32 — GPU-PROBE c856a2a6 auf omen-gtx1060: ROT in 4712 s (gate:geh-zerlegung ROT 569 s · gate:pop ROT 48 s · bild:wiese@0.5 GRÜN 50 s) → probe-post/w25-gpu-wahl/c856a2a6.md

## 09.11. 02:19 — GPU-PROBE c856a2a6 auf omen-gtx1060: NACHGEGEBEN in 337 s (gate:geh-zerlegung NACHGEGEBEN 2 s · gate:pop NACHGEGEBEN 3 s · bild:wiese@0.5 NACHGEGEBEN 2 s) → probe-post/w25-gpu-wahl/c856a2a6.md

## 09.11. 02:13 — GPU-PROBE 3fcecab7 auf omen-gtx1060: ROT in 2789 s (gate:geh-zerlegung ROT 513 s · gate:pop GRÜN 68 s) → probe-post/w25-gpu-wahl/3fcecab7.md

## 09.11. 01:30 — GPU-PROBE 3fcecab7 auf omen-gtx1060: NACHGEGEBEN in 190 s (gate:geh-zerlegung NACHGEGEBEN 1 s · gate:pop NACHGEGEBEN 1 s) → probe-post/w25-gpu-wahl/3fcecab7.md

## 09.11. 01:02 — GPU-PROBE 0a116ef2 auf omen-gtx1060: NACHGEGEBEN in 296 s (gate:geh-zerlegung NACHGEGEBEN 38 s · gate:pop NACHGEGEBEN 2 s · bild:wiese@0.5 NACHGEGEBEN 2 s) → probe-post/w25-gpu-wahl/0a116ef2.md

## 08.11. 23:34 — GPU-PROBE 0136ab62 auf omen-gtx1060: ROT in 1157 s (gate:pop ROT 55 s · bild:wiese@0.5 GRÜN 51 s · gate:ego-schatten ROT 38 s) → probe-post/w25-gpu-wahl/0136ab62.md

## 08.11. 23:11 — GPU-PROBE eef171f1 auf omen-gtx1060: ROT in 270 s (gate:pop ROT 66 s · bild:wiese@0.5 ROT 66 s) → probe-post/w25-gpu-wahl/eef171f1.md
