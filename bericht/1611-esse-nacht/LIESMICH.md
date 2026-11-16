# Esse bei Nacht (GTX 1050, 16.11. 22:35) — main 77e079ae (.311) ↔ dieselben drei Dateien ohne den Nachtbild-Schnitt

Am Werkbank-Dorf steht KEINE Esse (Verzeichnis „licht": 35 laterne_dorf, 32 wandlaterne_dorf, 92 glutbrunnen). Für das Paar steht eine Esse per `spawnArchitecture("esse")` auf dem Platz (−700 / −884), Uhr 0:00, gleiche Kamera; „vor" = fachwerk-core.js, stamm/bild-schatten.js, stamm/dirigent-kern.js mit dem Rück-Patch cf821525 → 77a9095f.

| | vor | nach |
|---|---|---|
| Quelle der Esse, Höhe über Boden | 37,44 (−0,15 m, IM Herd) | 38,51 (+0,92 m, über dem Bett) |
| Luma Bild Esse (Mittel · σ) | 31,3 · 20,9 | 35,8 · 27,6 |
| Luma Boden vor der Esse (fov 9°) | 24,7 · 5,1 | 27,6 · 11,9 |
| Luma Bild Laterne | 29,7 · 20,8 | 32,2 · 26,5 |
| Luma Boden bei der Laterne (fov 9°, 1,2 m neben dem Mast) | 56,4 · 18,6 | 57,7 · 17,0 |

Bild: nach dem Schnitt leuchten Herdplatte, Hang hinter der Esse und der Stand davor; vorher lag das Licht im Herd und der Platz blieb stumpf. Die Radeon-Zahl der Laterne (26,91 → 54,78) trifft mein enger Ausschnitt nicht: er liegt neben dem Mast, nicht unter ihm. Die Kamera steht hinter einem Marktstand (Abnahme „Sicht verdeckt", darum die Dateinamen -rot).
