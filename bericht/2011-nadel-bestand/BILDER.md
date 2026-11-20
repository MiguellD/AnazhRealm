# w28-nadel-bestand — die Bildpaare (Abgabe 3d180ada)

GTX 1050, WebGPU, 1920 × 1080, Bühne summer sunny 0,50, je Paar dieselbe Kamera (derselbe `werkbank bild`-Befehl). main = e0d37353 (mit den Linsen-Dateien des Kopfs, nur scripts/), Kopf = 3d180ada (Laufzeit-Bytes; das Höhen-Bild lief an 2b29736f, danach nur scripts/lib/ausgabe-aufnahme.cjs).

- `tafel-main-e0d37353.png` — main e0d37353, Tafel-Pose lod.K1#1: Auge −284 +1,7 −1042 → Ziel −269 34 −1036; Same im Blick 14 von 32 Chunks, Wald im Blick 131, dc 114, Tris 384 284, GPU 34,21 ms.
- `tafel-kopf-3d180ada.png` — Kopf 3d180ada, dieselbe Pose; Same 32 von 32, Wald im Blick 221, 0 ohne Stufe, 24 unterm Dach, dc 114, Tris 401 510, GPU 34,48 ms. Bild 0,78 % Pixel anders (Mantel und Gras verdecken den Bestand).
- `hoch40-main-e0d37353.png` — main e0d37353, aus 40 m: Auge −284 +40 −1042 → Ziel −130 30 −980; Laub-Rand 130 m, Same 14 von 32, Wald im Blick 148, GPU 31,72 ms.
- `hoch40-kopf-3d180ada.png` — Kopf 3d180ada, dieselbe Pose; Laub-Rand 216 m, Same 32 von 32, Wald im Blick 242, 0 ohne Stufe, 24 unterm Dach (ab 184 m), GPU 30,99 ms; 5,1 % Pixel anders.

Die Abnahme der Höhen-Bilder steht ROT nur am Blickziel (verdeckt von einer Buche in 72 m), das Bild ist gültig.

Befund (3), kein Schnitt jetzt: aus 40 m endet der Bestand am Laub-Rand 216 m auf dem flachen Kronendach des Bodens; bis zur Kamm-Krone ab 384 m steht keine Krone (`hoch40-kopf-3d180ada.png`, Mitte rechts bis zum Kamm).
