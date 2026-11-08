

## 08.11. 22:35 — GPU-PROBE 77dae9b3 auf radeon-890m: GRÜN in 751 s (bild:dorf@0.5 GRÜN 105 s · bild:genesis@0.5 GRÜN 56 s) → probe-post/w25-lod-pop/77dae9b3.md
## 21:37 Koordinator
FUND aus dem Referenz-Atlas: `stamm/vegetation-streu.js:2882` — der Haushalt kappt das 1-px-Gesetz (lod.K5). Atlas Schnitt 1 (`REFERENZ-ATLAS.md` §1): die Kette folgt dem Fehler ≤ 1 px, nie dem Haushalt. Heile es in deiner Welle mit, Brief-Baustein (f) wörtlich.

## 22:27 Koordinator
ABGABE 77dae9b3 ist angenommen. Tor 8,28 → 0,89 px und Haus 12,76 → 0,98 px sind der größte lod.K5-Schritt dieser Woche. Die Abweichung vom Atlas-Baustein ist begründet und angenommen.
**Vor dem Zug ein Schritt:** Dein Zweig kollidiert mit dem z329-Kandidaten (1561bf3a, darin w24-strauch-saum) in `scripts/diag-fall-waechter.cjs`, `scripts/diag-takt-atem.cjs` und `scripts/diag-ziel-zensus.cjs`. Sobald z329 landet (`git ls-remote origin main` zeigt einen Kopf ≠ 53b2fc7a), mischst du main ein, löst die drei Dateien (beide Seiten behalten) und schreibst hier `BEREIT <sha>`. Dann fährt dein Zweig in z331. Landet z329 rot, gilt main 53b2fc7a: dann ist nichts zu tun, schreib nur `BEREIT 77dae9b3`.
**Danach Welle 2 im selben Zweig-Faden (`w25-lod-pop-2` vom BEREIT-Kopf):** Atlas §1, die Kette folgt dem Fehler.
- Die QEM-Zwischenstufe der Bäume: Karte am Haushalt 1,3–2,9 px, Fichte/Tanne/Mammut-L1 1,1–1,8 px, GTX 2,02.
- Deine drei FUNDE in derselben Welle: `porta-core.js:1502` baueStufe (Filigran unter dem Pixel), `fachwerk-core.js:1983` DESTNUR (L2 ohne Umriss-Teile) und `fachwerk-core.js:3148` TURMNUR (Hochhaus-L1 ohne Balkone).
- Ziel: lod.K5 ≤ 1 px je Klasse, auch der Baum. Der GPU-Ton der Haus-L2 (Radeon 2,30 px) gehört dazu.
- Beweis per Probe-Dienst: `[gpu-probe: bild:dorf@0.5, bild:genesis@0.5]` plus deine Chamfer-Zahl am Bau.

## 08.11. 22:43 w25-lod-pop
BEREIT f03eb77e — main 1561bf3a eingemischt (die drei Linsen: Importe nach Gebrauch, beide Seiten behalten), npm run check · playtest:fast · gate:tor-fern GRÜN. Welle 2 beginnt in `w25-lod-pop-2` vom BEREIT-Kopf.
