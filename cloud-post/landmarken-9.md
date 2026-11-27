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

## Geschnitten (Vorprüf-Kopf landmarken-9 1 auf main 42a14279)

0. **Gemischt mit buendel-a** (main bed6256c → 42a14279): `voxel-worker.js` — stadt-am-schirm hält das Wald-Gedächtnis gepackt und strich
   `kammGeboren`; die Ankunft liest jetzt dasselbe gepackte Gedächtnis über EINEN Helfer (`waldGedaechtnis` · `waldGeborene`, auch
   `waldDarts` ruft ihn), fern je Auftrag wie `kammKrone`. Die Goldens `recipes.json` / `manifest.json` als Vereinigung (die Bahn:
   felsturm · felsbogen; main: Laterne 2 000 lm). Gleichheit nach der Mischung: 12 von 12 Saaten derselbe Stand, dieselbe Gier,
   dasselbe Ziel; Haupt-Faden je Ankunft 36–107 ms.

1. **Preis an der Wurzel — die Ankunft rechnet im Wald-Faden.** Wahl und Sicht sind Kern-Gesetz (phyto-core `landmarkeSicht`:4457,
   `landmarkeAnkunft`:4517); der Wirt reicht Stände, Marken und Kegel (`_ankunft`, stamm/gelaende-chunks.js:1415), der Wald-Faden rechnet
   über DEMSELBEN Bestand, den er für das Bild plant (voxel-worker `ankunftRechnen`:1682, `fernWaldCtx`:4917), Rang −1 in der
   Wald-Schlange. `_landmarkeSicht` (stamm/vegetation-baum.js:2721) ist ein dünner Leser desselben Kern-Gesetzes. Die Antwort merkt der
   Wirt je Wald-Stand, Hydrosphäre und Heimat: die Rückkehr nach dem Tod fragt nicht neu.
2. **Verdeckung an der Wurzel — EIN Auge.** `_genesisAnkunft` (stamm/gelaende-boden.js:644) setzte den Leib auf Grund + 1,2 m: die Kamera
   stand 0,70 m über dem Auge des Gesetzes (Grund + 0,5 + `EGO_AUGE_M`). Jetzt steht der Leib dort, wo das Gesetz sah; die Marke des
   ersten Blicks reist in der Antwort mit (`marke`) — der Leser der Station liest sie, statt selbst zu wählen.
3. **Stations-Kandidat** `cloud-post/landmarken-9-station/` (kandidat.diff gegen punkte-maschine Blob e71c1770, BEGRUENDUNG.txt): S1
   wartet auf das Versprechen der Ankunft, nennt FREI über `r._landmarkeSicht` (kein zweiter Sichttest) und misst zuerst die Marke der
   Ankunft. Gesetzt wird mit der Landung: die Station der GTX liest `_genesisAnkunft` synchron und bräche am Kopf.

## Gemessen (Werkbank in der Wolke, swiftshader — die Bilder-p95 der GTX sind hier nicht messbar)

| Größe | vorher | nachher |
|---|---|---|
| Haupt-Faden je Ankunft (kalt) | 147 – 8 380 ms an 12 Saaten (Kopf 6) | p50 49,3 · p95 74,6 · max 82,4 ms an 50 Saaten |
| Wald-Faden je Ankunft | — (lief im Haupt-Faden) | p50 1 263 · p95 4 061 · max 7 703 ms (Summe 87,5 s an 50) |
| Welt bis Ankunft | — | p50 1,73 s · p95 4,68 s |
| Rückkehr nach dem Tod | — | 1,15 ms synchron, derselbe Stand aus dem Gedächtnis |
| Wahl gleich dem Haupt-Faden-Gesetz | — | 12 von 12 Saaten |
| frei nach dem Gesetz | — | 43 von 50 Saaten tragen eine freie Marke (keine: s1-9 · 16 · 17 · 24 · 25 · 40 · 47) |
| Kamera − Auge des Gesetzes | 0,70 m (s1-1, s1-2) | 0,00 m |
| Blickziel frei nach dem Kandidaten-S1 | s1-2 verdeckt_baum_tanne 81,6 m | frei an 7 von 7 (s1-1 … s1-7), trägt den Wert an 7 von 7 |
| frei im Bild von 51 Saaten | ROT 3 von 3 (GTX f07abc1a) | ungemessen — braucht die GTX (der Zeuge mit dem Kandidaten) |
| Bilder-p95 GTX 1060 | 41,72 ms (ohne den Kopf 25,02) | ungemessen in der Wolke |

## Ehrlich offen (mit Datei und Zeile)

- Die Gesamt-Arbeit im Faden: p95 4 061 ms Wald-Faden je Ankunft (die Spirale × Wald, phyto-core `landmarkeAnkunft`:4517, voxel-worker
  `ankunftRechnen`:1682); die 7 Saaten ohne Marke kosten zusammen ~30,7 s Faden-Zeit, ehe „keine“ steht.
- Die Aufzählung der Marken im Haupt-Faden ~45 ms je Ankunft (`_landmarkenDesChunks` stamm/vegetation-baum.js:2642, je Zelle
  `_rollGenome`, 18 132 Zellen) — der größte Rest der 74,6 ms.
- Die Station rechnet den Kronen-Leser im Haupt-Faden (`_landmarkeSicht` → `_sichtWald` stamm/vegetation-baum.js:2744), auch für die
  Erde-Decke im 200-m-Gitter: S1 0,6 – 8,4 s je Saat in der Werkbank.
- Mutant M2 des Kandidaten (S1 wählt die nächste freie) fällt an s1-3/4/7 nicht (die Marke der Ankunft ist dort auch die nächste).
- Bilder-p95 und „frei im Bild“: erst die GTX misst sie.

