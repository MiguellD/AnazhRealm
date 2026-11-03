# w5-stoffe-k5 — stoffe.K5#2 (Stubben → Sämling, Brand → Gras → Busch → Wald)

**Geschnitten:** Der Jungwuchs geht über DASSELBE Sukzessions-Gesetz: das Alter des Orts `_baumAlter` (stamm/vegetation-wiese.js:1706) setzt jeden Dart des Walds in `treeParams(…, alter)` (phyto-core, additiv, ohne `alter` byte-gleich). Pflanzen (`_waldDartSetzen`, stamm/vegetation-baum.js:1071) und Nachwuchs nach jeder Stufe (`_waldNachwuchs`, :1101) lesen es, aus w3v-brand-bild per 3-Wege-Patch auf main 5fba36ea gelegt. Dazu das Bett, das sich keinen ungebauten Boden merkt (stamm/feld-leben.js:2131), HALT steht am Fluss (scripts/diag-stand-takt.cjs:944) und die Linse UNGEBAUT mit Mutante (:921). Die Decke zahlt der Täter als Tafel im EINEN `taeterFaelle` (scripts/lib/welt-boot.cjs:1172: 267 Closures in 9 Wänden) plus `gemessen` über die EINE Leihe (:50).

**Gemessen:** Urteil der Station `stoffe.K5#2` (headless, LINSE_GPU=software, Cloud) an main 5fba36ea ROT „keine SUKZESSION-Zeile (Exit 1)“, auf der Farm „Sämling fehlt“. Am Kopf GRÜN in 3 von 3 Läufen: „Halme 477 → Asche 70 → Gras 464 · Kräuter 23 → Asche 3 → Gras 3 → Busch 20 · Ernte (15): Nährstoff 1 → 0.7, Wuchs 0.748 → 0.698 · Asche 1.4, Leichnam 1.2 · Sämling 0 → 0.06 → 0.18 → 0.7 → 1, Gestalt [[5,1461],[9,2933]] · Wald 80: Brand nimmt 80, Jungwuchs 78–80, heil 80“. UNGEBAUT: gemerkt false, Mutante true. Decke scripts +2654 → −81 Atome, `npm run check` EXIT 0.

**Ehrlich offen:** „Kräuter → Asche 0 → Gras 0“ ist kein zweiter Bruch: das Gesetz lässt die Kräuter erst ab Stufe 0,3 bis 0,6 wachsen (Gras ≤ 30 %, Busch 20/23), auf voller Asche 0 Kraut. Der Sämling ist nur headless gesehen, ein GPU-Bild fehlt (Cloud). BRAND (stoffe.K2#2) bleibt im selben Lauf ROT an DECKUNG 0,773–0,828 < 0,9 und schwankte an FELS (0 bzw. ≥ 1, je nach Herd).

## FUNDE

- scripts/diag-stand-takt.cjs `brandSeite` (leser/DECKUNG) · die Fahne `_brandRauch` deckt in der Cloud 0,77–0,83, FELS hängt am gewählten Herd · stoffe.K2#2 · mittel
- scripts/diag-stand-takt.cjs (Default-Lauf, auch auf main 5fba36ea ROT in der Cloud) · der Ring steht nach dem Boot bei 25 Chunks (±108 m): LEER Weck-Probe wuchs, STUFE stumpf, Ort-Phase ohne fernen Chunk · gate:stand-takt (Sim-Zeilen für feld.K3/stoffe.K2#1 unberührt) · mittel
- stamm/feld-leben.js:2127 `_brandStoff` · das Bett liest „gras“ aus dem GEBAUTEN Boden (`_kontaktStoffAt` → `_bodenSichtAt`), am Rand des Rings hält die Front, bis der Chunk steht — das Bett gehört ins Boden-Gesetz, nicht ins Mesh · stoffe.K2 · mittel
- origin/w3v-brand-bild · landet mit diesem Zweig (Brand-Bild + Jungwuchs), der alte Zweig ist überholt · Koordination · klein
