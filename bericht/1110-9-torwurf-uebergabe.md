# Übergabe 1110-9 Tor-Wurf (welle-m-e-torwurf), gesichert für 1110-12

- **Branch:** welle-m-e-torwurf, Kopf **9a85e2a6** (per ls-remote). Das ist der Merge von main a0a05614. Arbeitsbaum sauber,
  Puls-CI lief.
- **Was steht** (auf dem gemergten Stand alle Wände EXIT=0, `p3/tor/wurf/waende-E/summe.txt` auf dem OMEN):
  - format:check, lint, check, worker-dichte
  - tor-fern, haus-fern, porta-contract, asset-contract, regler-wirkt
  - nervensystem-porta, -schmiede, -fachwerk
  - portal-gestalt, portal-membran, blocker-netz, kollision-bild, studio-vertrag
  - playtest:fast und der volle Playtest („Alle Invarianten OK“, 99 s)
- **Geschnitten:**
  - Entscheidung A: Die Kosten-Regel des Wirts heißt `_wurfVonBilligerer`. Das Wurf-Recht je Teil (`_teilWirft`) ist EINE
    statische Methode. Der Flat trägt `wurfKosten`.
  - gate:regler-wirkt WURF:
    - Das Tor fährt die volle Regler-Hülle (385 Paare), das Haus läuft mit Abstand (≤ 0,2 %).
    - Der Täter „Zwilling immer“ ist rot.
    - An orders=9 wirft bei kathedrale (16 900 gegen 22 024) und bei geisttor die Stufe 0 selbst.
  - Studio-Vertrag N5: ein Satz zur Regel. tor-fern K prüft die Zeile nur am Rezept.
  - Die Hülle: Röhren-Ketten folgen dem Polygonzug ihrer Röhre (Sehne ≤ ¾ r). Die Geflecht-Enden laufen in 4 Stücken.
    Douglas-Peucker misst auf dem Raster 2^-20 m. W: min 0,864, geisttor 0,887.
  - 7 Stufe-3-Goldens neu geprägt, 16 alte byte-gleich. Stufe 0 und Fernform sind byte-gleich über 770 Bauten.
- **Nächster Schritt:**
  1. Bild-Beweis in EINER Welt mit `p3/tor/bild/bilder-C.sh`: 2,6/11/30 m vorher/nachher ×2, die Wurf-Kosten je Tor in der
     Welt, das Fernform-Paar 80 m (A = abab-b542).
  2. Genesis-ABAB mit `p3/tor/abab2/serie.sh`: A = abab-b542, B = welle-m-e-torwurf.
  3. Bericht aus `p3/bericht-1110-9-torwurf-entwurf.md`.
  4. Commit `[ci voll]`.
- **Offene Linse:** Die Regel zählt nur Dreiecke. Bei kathedrale und geisttor ist die L0 in Dreiecken billig
  (Rezept 7 380 gegen 7 488 bzw. 2 132 gegen 2 136). Sie werfen deshalb an 44 bzw. 41 von 55 Regler-Lagen aus Stufe 0,
  mit bis zu 13 Stoff-Zügen je Kaskade. Die Draws trägt Karte (2): 13 Stoff-Züge je Tor.
