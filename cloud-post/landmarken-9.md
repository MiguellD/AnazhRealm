# landmarken-9 — dritte Sitzung der Bahn Landmarken (Stand-Blatt)

Sprosse: `karte2.erleben.spieler.wegfindung#1`. Status ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718.

## Heimgeholt

- `landmarken-geologie-8-wip` 637bd2c4 auf main bed6256c: `git merge-tree` EIN Konflikt, `spec/stamm/modul-karte.json` (main ↔ Kopf 6:
  `Gelaende/chunks` trägt `AnazhRealm.ANKUNFT_SICHT`). Gelöst durch Neu-Erzeugung aus dem Stamm (`node scripts/stamm-umzug.cjs --nach-karte`:
  5 355 Glieder, Abweichungen 0), keine Hand-Zeile.

## Urteil der Bahn (Koordinator 27.11. 12:42, GTX 1060 am f07abc1a)

Zeuge 3 ohne Lesung · Richter ROT an drei Saaten („Blickziel verdeckt“ von Laub, Kamm-Krone, Natur) · Preis ROT p95 41,72 ms (ohne den Kopf 25,02 ms).

## Täter-Zahl (Werkbank in der Wolke, swiftshader, Kopf 6 auf main bed6256c)

1. **Verdeckung — das Gesetz sieht die Verdecker des Bilds.** Die drei Zeugen-Ziele vom Kopf 5 (b32c6773, Bild der GTX: s1-1 Kiefer
   74,5 m · s1-2 Kamm-Krone 389,6 m · s1-3 Tanne 100,0 m) liest `_landmarkeSicht` (stamm/vegetation-baum.js:2725) am selben Auge als
   verdeckt: s1-1 Tanne 76,4 m · s1-2 Birke 369,0 m (¼° über dem Gipfel: Tanne 84,2 m) · s1-3 Kiefer 100,1 m — 3 von 3. Die Ankunft
   des Kopfs 6 wählt dort andere Marken (s1-1 blick 1 325 m · s1-2 ort 25/−25 1 278 m · s1-3 blick 1 847 m), alle frei nach dem Gesetz.
2. **Preis — die Ankunft plant den Wald im Haupt-Faden.** `_ankunft` (stamm/gelaende-chunks.js:1410) kalt je Ankunft, 12 Saaten:
   147 · 589 · 656 · 673 · 725 · 1 140 · 1 385 · 2 815 · 3 148 · 3 766 · 5 335 · 8 380 ms (Kopf 5: 25–28 ms). Zerlegung Saat 6 (7 522 ms):
   1 378 Sicht-Prüfungen an 114 Ständen der Spirale, 4 459 Wald-Zellen geplant (`_forestGeborene` 5 240 ms, davon `_voxelSurfaceY`
   3 304 ms in 424 762 Rufen), 4 459 Stapel-Texte `_fadenUmgangen` 897 ms. Glieder an 12 Saaten: heimat 2 · blick 3 · ort 6 · keine 1.
