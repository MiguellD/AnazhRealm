# (e) SCHATTEN und VERDECKUNG je Quelle — Zensus-Blatt

Stand: Zweig `strahler-leuchte` = 2ce8a033d, nur gelesen. Kürzel: bs = stamm/bild-schatten.js · da = stamm/dirigent-ankunft.js ·
dk = stamm/dirigent-kern.js · sm = stamm/stoff-material.js · sd = stamm/stoff-dach.js · sk = stamm/stoff-karte.js ·
si = stamm/stoff-instanz.js · bh = stamm/bild-himmel.js · bsi = stamm/bild-sicht.js · bk = stamm/bild-kosten.js ·
gf = stamm/gelaende-fern.js · sw = stamm/speicher-welten.js · fw = fachwerk-core.js · gc = gelaende-core.js ·
pc = phyto-core.js · wl = welt-licht.js · bw = stamm/bild-wahl.js.

Vorbemerkung: Der Auftrag nennt „2 Kaskaden". Im Code sind es DREI (`cascades: 3`, da:410; Brüche bei 15 m, min(0,85, ~108 m/far), 1;
da:414). Der Log-Satz da:435 sagt weiter „2 Kaskaden" (Bruch B-12).

---

## 1. TAFEL DER GRÖSSEN

Spalten: Name · Wert · Einheit · Anker · Definition · Leser · FOLGT/GESETZT

### 1a Sonnen-/Mond-Kaskaden (SCHATTEN_KASKADE, bs:1729–1746)
| Name | Wert | Einheit | Anker | Def | Leser | |
|---|---|---|---|---|---|---|
| kontaktM | 15 | m | gesetzt | bs:1730 | da:408/414; si:30 | GESETZT |
| texelM | [0,045; 0,17; 0,47] | m/Texel | Regel „nie gröber als Addon-Quadrat V18.529" (k0 339 m/2048, k1 961 m/2048), bs:1710 | bs:1731 | bs:1126 (Kartengröße); si:30 (nur [0]) | GESETZT (Anker = alter Stand) |
| filterTexel | [0,25; 1; 1] | Texel | gesetzt | bs:1732 | bs:1065, bs:1091 | GESETZT |
| rampeTexel | 0,6 | Texel | hergeleitet (bilinearer Vergleich, 10–90 % = 0,8 Texel), bs:1039 | bs:1733 | bs:1091, bs:1095 | FOLGT |
| sonneTan | 0,00925 | rad (tan 0,53°) | Physik: Sonnen-Scheibe | bs:1734 | bs:1073, bs:1090; da:1558, da:1760, da:1800 | FOLGT |
| sucheM | [0,25; 0; 0] | m | gesetzt | bs:1735 | bs:1058/1074/1090 | GESETZT |
| bezugAspekt | 16/9 | – | Norm Bildformat | bs:1736 | bs:1119 | FOLGT (Norm) |
| karteMax | 2048 | Texel | gesetzt | bs:1737 | bs:1128 | GESETZT |
| karteRaster | 16 | Texel | gesetzt | bs:1738 | bs:1128 | GESETZT |
| rasterTeiler | 8 | – | Messung 04.10. (Drehung schimmert nicht), bs:586–590 | bs:1739 | bs:807 | Messung |
| randM | 2 | m | gesetzt („Wind, Morph") | bs:1740 | siedlung-bauten.js:2537, :2655; siedlung-instanz.js:39 | GESETZT |
| luftM | 4 | m | gesetzt | bs:1741 | bs:882–883, bs:1071 | GESETZT |
| normalTexel | 0,5 | Texel | Messung 09.10. gate:schatten-bias --echt, bs:11–14 | bs:1742 | sm:3879 (`_schattenNormalBias`) | Messung |
| tiefeTexel | 0,75 | Texel | Messung 09.10. (dieselbe) | bs:1743 | bs:30; sk:1339 | Messung |
| laubTexel | 2 | Texel | gesetzt | bs:1744 | si:30 | GESETZT |
| zuwendungSaum | 0,08 | N·L (≈5° Sonne) | Messung gate:schatten-terminator, sm:1960–1965 | bs:1745 | sm:1968 | Messung |
| cascades | 3 | Stellwert | gesetzt | da:410 | r184 CSMShadowNode | GESETZT |
| Bruch k1/k2 Deckel | 0,85 | Anteil maxFar | gesetzt | da:414 | r184 Splits | GESETZT |
| Fade-Saum | 0,125·a² | – | Vendor `_setupFade` (0,25·Kante²) | bs:678–679 | bs:1123, bs:806 | FOLGT (Vendor) |
| SCHATTEN_FERN_FAKTOR | 1,8 | m maxFar je m Reichweite | gesetzt | bs:1649 | da:411; bs:1116; sm:3836 | GESETZT |
| PERF_SHADOW_RANGE_MAX | 170 | m | gesetzt | bs:1647 | bs:1116 | GESETZT |
| atmosphere.shadowRange | 170 (dk:357) / 300 (sw:1384, sm setShadowRange-Rückfall) | m | gesetzt | dk:357 | sm:3843–3850; da:369; regler:539–540; speicher-laden.js:613–614 | GESETZT (drei Vorgaben) |
| HOLZ shadowRange | voll 170 · nah 110 · kienspan 0 | m | gesetzt | dirigent-regler.js:2197–2199 | dirigent-regler.js:539–540 | GESETZT |
| atmosphere.shadowBias | 1,0 (Klemme 0..3) | Stellwert | gesetzt | dk:358 | sm:3877–3879 | GESETZT |
| Rückfall-Karte mapSize | 2048 | Texel | gesetzt | da:361–362 | sm:3883–3886; bh:1831 | GESETZT |
| Rückfall near/far | 0,5 / 500 | m | gesetzt | da:363–364 | sm:3886 | GESETZT |
| lightDist | 200 | m | gesetzt | bh:1816 | bh:1869–1872 | GESETZT |
| Vogel-Punkte des Filters | 5 | Stellwert | gesetzt | bs:1064, bs:1077, bs:1099 | dieselben | GESETZT |
| PASS_WAHL.lichtRandTexel | 32 | Texel | gesetzt | bw:909 | bs:880 | GESETZT |
| SCHATTEN_TAKT | nahMax 2 · fernFaktor 3 | Bilder | Messung CPU-p95 (bs:1287–1291) | bs:1652 | bs:1312–1344 | Messung |
| SCHATTEN_RUHE_EPS | 1e-4 | m bzw. rad | gesetzt | bs:1655 | bs:1327 | GESETZT |
| sunMoved-Schwelle | 4,0 | m² | gesetzt | bs:1306 | bs:1346 | GESETZT |
| BLENDE_RASTER | 256 | Texel | gesetzt | bs:1659 | bs:915 | GESETZT |
| SHADOW_TWIN_LAYER | 2 | Stellwert (Ebene) | gesetzt | bs:1646 | da:388; bs:428, bs:1241; bsi:2864; koerper-leib.js:424 u. a. | GESETZT |

### 1b Wurf der Pool-Quelle (LICHT_WURF, bs:1698–1708)
| kartePx | 256 | Texel/Seite | gesetzt (2,3 cm in 3 m) | bs:1699 | bs:422 | GESETZT |
|---|---|---|---|---|---|---|
| nahM | 0,05 | m | gesetzt | bs:1700 | bs:427, bs:539 | GESETZT |
| kernAnteil | 1 | – | Messung Radeon (Keile am Glutbrunnen), bs:396–397 | bs:1701 | bs:539 | Messung |
| leibSaum | 0,02 | m | gesetzt | bs:1702 | bs:539 | GESETZT |
| weichPx | 2 | Texel (PCF) | gesetzt | bs:1703 | bs:424 | GESETZT |
| bezugM | 2 | m | gesetzt | bs:1704 | bs:496, bs:499 | GESETZT |
| wichtigAb | 0,25 | Anteil E_Welt | gesetzt | bs:1705 | bs:505 | GESETZT |
| halten | 1,25 | – | gesetzt | bs:1706 | bs:511 | GESETZT |
| takt | 3 | Bilder | gesetzt | bs:1707 | bs:527–528 | GESETZT |
| Würfel-Kamera Start | 90°, near 0,5, far 500 | °, m | gesetzt (überschrieben je Zeichnung) | bs:410 | bs:541–545 | GESETZT |
| leibM (Laterne G=1) | max(yL−yK0, yK1−yL, kb/2) = 0,2 | m | FOLGT aus AUS_MASS | fw:7974–7980 | dk:1914 → bs:539 | FOLGT |

### 1c Kopf der Leuchte (analytisch)
| KOPF_BODEN.ueber / dick | 0,04 / 0,03 | m | Gestalt-Maß | fw:7615 | fw:7644, fw:7657 | GESETZT |
|---|---|---|---|---|---|---|
| kopf [hb/s, (yK1−yL)/s, (kb+ueber)/2/s, (yK0+dick−yL)/s] | Laterne: hb 0,2, kh 0,4, kb 0,26, yT = yL+0,4 (fw:8013); Wandlaterne hb 0,17, kh 0,34 (fw:8031) | halbe Flammen-Höhen | FOLGT aus Gestalt + Brenner `flammeM` | fw:7644 | dk:1716 (Uniform `lichtKopf`); sm:2423–2432 (GPU); dk:1819 (CPU Becken) | FOLGT |

### 1d Horizont-Karte (HORIZONT_KARTE, da:1953–1968) — Gelände wirft Sonne/Mond, Grat nimmt Himmel
| gitter | 768 | Punkte | Messung (Grat 0,77° Fehler bei 32 m), da:1940–1943 | da:1955 | da:1469, da:1713; bk:2923 | Messung |
|---|---|---|---|---|---|---|
| karte | 320 | Texel | gesetzt (gemessen nur 256/220/192/128, da:1948–1949) | da:1956 | da:1483, da:1742 | GESETZT |
| zelleM | 32 | m | Messung (dieselbe) | da:1957 | da:1499, 1503, 1669; bk:2923 | Messung |
| schrittM × schritte | 60 × 50 | m | gesetzt („Bahn der Station") | da:1958–1959 | da:1515–1516, 1615–1616, 1749–1750 | GESETZT |
| nachM | 1000 | m | gesetzt | da:1960 | bk:2922 | GESETZT |
| zeilenJeAuftrag | 16 | Zeilen | gesetzt | da:1961 | bk:2944 | GESETZT |
| lichtRad | 0,05° | rad | gesetzt (2,6 m in 3 km) | da:1962 | bk:2897; sk:745 | GESETZT |
| bandM | 1,5 | m | gesetzt | da:1963 | da:1558, da:1760 | GESETZT |
| leerM | 10000 | m (Stellwert „kein Gelände") | gesetzt | da:1964 | da:1471, 1507, 1520, 1733 | GESETZT |
| luftProben | 8 | Proben | gesetzt | da:1965 | bh:2380 | GESETZT |
| gratRad | 30° | rad | gesetzt (Bezug Hillaire-Band ±30°, da:1943) | da:1966 | da:1628, da:1645 | GESETZT |
| treffer | 8 Schritte / 4 Halbierungen | – | gesetzt | da:1967 | da:1666 | GESETZT |
| messer | 4 × 8 Strahlen, weitM 3000 | –, m | gesetzt | da:1954 | da:1815–1826 | GESETZT |

### 1e Wolken-Wurf (WOLKEN_SCHICHT, wl:962–973; Stamm-Spiegel bh:3327)
| hoeheM | 800 | m | Physik (Kumulus-Basis 0,6–1,5 km), wl:956 | wl:963 | bh:138, bh:175; wl:1050, 1111 | FOLGT (Spanne, Wert gesetzt) |
|---|---|---|---|---|---|---|
| steilMin | 0,05 | sin h | gesetzt | wl:964 | bh:176, bh:209 | GESETZT |
| karte | 512 | Texel | gesetzt | wl:965 | bh:117, 177, 210 | GESETZT |
| zelleM | 16 | m | gesetzt | wl:966 | bh:137, 177–179, 210 | GESETZT |
| zugS | 0,1 | s | gesetzt | wl:967 | bh:183 | GESETZT |
| rand | 0,8 | Anteil | gesetzt | wl:968 | bh:213 | GESETZT |
| mittelMin | 0,05 | Durchlass | gesetzt (Boden) | wl:969 | bh:219 | GESETZT |
| deckung | [0,12; 0,9] | Deckung | gesetzt (Wetter-Achse) | wl:970 | bh:151; wl:1268, 1330 | GESETZT |

### 1f Himmels-Sicht / Decken
| HIMMELS_SICHT.m (aHimmel, Höhle) | 3 | m | gesetzt | gc:4309 | gc:4315 → Attribut aHimmel → sm:2003 (aoNode Boden), sm:2037 (Pool-Gewicht des Auges), Nässe | GESETZT |
|---|---|---|---|---|---|---|
| Schritte-Deckel | 120 / 1 % | –, Anteil | gesetzt | gc:4320 | gc:4321 | GESETZT |
| NAESSE.dachPlaetze | 8 | Plätze | gesetzt | sm:3922 | sm:728, 731; sd:209–239 | GESETZT |
| NAESSE.dachUmkreisM | 64 | m | gesetzt | sm:3923 | sd:176 | GESETZT |
| NAESSE.dachSchrittM | 4 | m | gesetzt | sm:3924 | sd:170 | GESETZT |
| NAESSE.dachArten | marktstand, brunnen, gate | Liste | gesetzt | sm:3925 | sd:270 | GESETZT |
| RAUM.kanteM | 0,3 | m | gesetzt | sd:300 | sd:55 | GESETZT |
| raumLicht (Tageslichtquotient je Decke) | je Haus | Anteil | Formel fachwerk `raumLicht` (fw:6071) | fw:5998–6071 | sd:192 → `dachMass.w` → sd:51–79, bsi:718 | FOLGT (nicht im Einzelnen gelesen) |

### 1g Umgebungs-Verdeckung
| KONTAKT.radiusM | 1,5 | m | Messung (Leib 0,79 vs 0,76), bs:1661–1662 | bs:1669 | bs:1476, 1519–1521 | Messung |
|---|---|---|---|---|---|---|
| KONTAKT.saum | 0,4 | Anteil | gesetzt | bs:1670 | bs:1521 | GESETZT |
| KONTAKT.scheiben / schritte | 2 / 4 | – | gesetzt | bs:1671–1672 | bs:1493–1494, 1507–1508 | GESETZT |
| KONTAKT.duenn | 0,7 | – | gesetzt (XeGTAO-Anlehnung) | bs:1673 | bs:1517 | GESETZT |
| KONTAKT.nahM | 0,08 | m | gesetzt | bs:1674 | bs:1524 | GESETZT |
| KONTAKT.minPx | 2 | px | gesetzt | bs:1675 | bs:1478 | GESETZT |
| KONTAKT.potenz | 2,5 | – | gesetzt (Kommentar nennt XeGTAO 2,2) | bs:1676 | bs:1550 | GESETZT |
| KONTAKT.tiefeRand | 0,04 | Anteil | gesetzt | bs:1677 | bs:1420, bs:1574 | GESETZT |
| Kontakt-Auflösung | ½ Szenen-Ziel | – | gesetzt | bs:1608–1609 | – | GESETZT |
| HALM narbe.x | 0,7 | – | Literatur Campbell 1986 (Ellipsoid) | pc:6855 | pc:6941–6947 | FOLGT (Literatur) |
| HALM narbe.kHimmel | 0,7 | 1/Λ | FOLGT (Integral über bedeckten Himmel), pc:6823 | pc:6855 | pc:6947 | FOLGT |
| NAH_WIESE.fussNarbe | 1,86 | Λ | FOLGT (foundry `__halmNarbe`) | stamm/daten.js:516 | sm:1990 | FOLGT |
| AERIAL.aoStrength | 0,38 | – | gesetzt | sm:3945 | sm:837 | GESETZT |
| AERIAL.aoCap | 0,18 | – | gesetzt | sm:3946 | sm:840 | GESETZT |
| atmosphere.cavityAO | 0,35 (dk:344) / 1,0 (sw:1380) / 1,0 (sm:648 Rückfall) | Stellwert | „Schöpfer-Sign-off 04.06." | dk:344 | sm:645–648 → aoScale → sm:837 | GESETZT (drei Vorgaben) |

### 1h Karten / Impostoren (Selbst-Sicht im Atlas)
| KARTE_SONNEN_SICHT.richtungen | 9 Richtungen (90°; 45°×4; 15°×4) | °, ° | gesetzt | sk:2073–2083 | sk:1020 ff. (B.dirs, Fit) | GESETZT |
|---|---|---|---|---|---|---|
| KARTE_SONNEN_SICHT.spanne | [−0,5;1,5] [−1;1] [−2;2] [−1;1] | Beiwerte | FOLGT (Fit-Grenzen), sk:2071–2072 | sk:2084–2089 | sk:1065, sk:2766; sm:1557–1559 | FOLGT |
| KARTE_SONNEN_SICHT.karte | 256 | px | gesetzt | sk:2090 | sk:1306 | GESETZT |
| Kachel-Box R | 1,15 · max(halfW, halfH) | m | gesetzt | sk:1324 | sk:1327, 1335 | GESETZT |

Zählung Tafel: 102 Größen (Zeilen mit mehreren Zahlen je Zahl gezählt: SCHATTEN_TAKT 2, schrittM×schritte 2, treffer 2,
messer 3, KOPF_BODEN 2).

---

## 2. RECHENWEGE

**W1 Sonne/Mond über die Kaskaden.** Richtlicht = Sonne für sunDir.y ≥ 0, sonst Mond (bh:1822–1824), Stärke aus Atmosphäre
bzw. MOONLIGHT (bh:1889, bh:1897). Box je Kaskade `_kaskadeFit` (bs:848–945) → Bias `_schattenBias` bs:23–31 in Welt-Metern
(normalBias = 0,5·Hebel·Texel) bzw. 0..1-Tiefe → Filter `_schattenFilter` bs:1054–1101 (Halbschatten = Abstand · sonneTan/2,
gedeckelt `sucheM`, nur k0 auf WebGPU) → Faktor 0..1 × `_sonnenSicht` (csm.anazhSicht, da:424) × Zuwendung des Bodens (sm:1966–1971)
bzw. Karten-A7 (sm:1563) auf dem direkten Licht. Einheit: Meter → Texel → dimensionsloser Faktor. Unter Holz kienspan
(shadowMap aus) entfallen alle Wege W1–W6 und W7 (bs:357–381).

**W2 Gelände-Horizont (Sonne und Mond).** Gitter r16f (da:1470) → Pass: H = max(h(x+â s) − s tan h☉), s* (da:1500–1528) →
`_horizontSicht` = smoothstep(H ± max(bandM, s*·sonneTan/2), y) (da:1552–1561) → multipliziert in W1 (jeder Kaskaden-Empfänger),
Feld/Panorama `_weltLicht` (bsi:2700), Wasser (bsi:1442), Fern-Wasser (gf:1713). Takt nur bei L.y > 0 des AKTIVEN Körpers (bk:2891–2893),
also auch für den Mond.

**W3 Wolken-Wurf.** `_wolkenFeld` × `_wolkenGewicht` (bh:139, bh:150–153) in Karte r8 512² à 16 m → `_wolkenSchatten`:
durch = min((1−Menge)/max(1−Mittel, mittelMin), sonneKlar) (bh:216–221), über der Schicht 1. Licht l0d = Sonne oder Mond (bh:196–197).
Leser wie W2 (über `_sonnenSicht`, da:1867). Einheit: dimensionsloser Durchlass; das Wetter-Mittel trägt bereits `tint.direkt` im Richtlicht.

**W4 Grat-Himmel (Himmelsverdeckung durch Gelände).** tan α aus Kanal r,g,a der Horizont-Karte (da:1613–1619) → Gewicht
sin α · 2·gratRad/(3π) (da:1626–1631) → 3 Abtastungen der Himmels-Tafel × max(n·ω,0) (da:1642–1656) → abgezogen von der
Bestrahlung in `_spiegelUmgebung` (bsi:715). Einheit: Strahldichte der Himmels-Tafel.

**W5 Luftschatten.** In der Luft je Probe `_horizontSicht(p)` × Durchlass (bh:2402). Nur Gelände-Horizont; Wolken und Kaskaden
nicht im Strahl (Bruch B-9).

**W6 Wurf der Pool-Quelle (Würfel).** Wahl je Bild: eBezug = augeZeig(Luma·(bezugM² + k²)^(−abfall/2)·Saum, augeLux) (bs:496–504),
nur ≥ wichtigAb·E_Welt (bs:505), Gewicht eBezug·(R/Abstand)² (bs:507), Hysterese halten (bs:511) → EINE Quelle; near = leibM + leibSaum
oder max(nahM, kern) (bs:539), far = Reichweite; Bias aus W1-Gesetz mit Texel 2R/256 (bs:547); r184 PointShadowNode PCF radius
weichPx. Im Stoff: Pool-Summe je Platz × mix(1, wurf, platz==k) (sm:2353). Einheit: Lux → „gezeigt" (augeZeig) → Faktor.

**W7 Kopf der Leuchte (analytisch).** sicht = clamp((min(1, K.y − K.x·steig) − max(−1, K.w − K.z·steig))/2) mit steig = h/a
(sm:2423–2432; CPU-Zwilling fw:7649–7653, gelesen dk:1819). Multipliziert den Bestrahlungs-Vektor des Punktstrahlers (sm:2436),
NICHT den der flachen Scheibe (sm:2437–2440).

**W8 Höhlen-Himmelssicht aHimmel.** Höhlen-Graph je Dreieck (voxel-worker.js:2889) → `himmelsSicht` exp(−step/3)^hop (gc:4310–4336)
→ Vertex-Attribut → aoNode des Bodens (sm:2003), Gewicht des Auge-Lichts im Pool (sm:2396), Nässe (sm:2156). Nur der Boden trägt es;
jeder andere Stoff „gilt als offen" (sm:2100–2101).

**W9 Decken (Dach-Pool).** `_dachTakt` wählt 8 Decken im 64-m-Umkreis (sd:164–260) → `_offenerHimmel` 0/1 (sd:12–40): Regen, Nässe,
Rückstrahl (bs:182, bh:1033, sm:2287) — und `_raumHimmel` = Tageslichtquotient (sd:51–79) × Bestrahlung und Spiegel der Umgebung
(bsi:718–721); CPU-Spiegel `_raumAmAuge` (sd:86–107) für die Blende, `_augeUnterDach` (sd:139–151) für den Rückstrahl.

**W10 Kontakt-Verdeckung (GTAO).** Tiefe des Szenen-Passes, ½ Auflösung, 2×2×4 Proben (bs:1432–1595) → reprojiziert gelesen
(bs:1409–1428) → einzig im aoNode des Bodens (sm:1986–2003), mit Narben-Untergrenze der Wiese. Wirkt nur aufs indirekte Licht (bs:1367).

**W11 Halm-Narbe.** direkt exp(−K(θ)·Λ), Himmel exp(−0,7·Λ) (pc:6940–6949); Halm: aoNode = Himmel-Term (sm:39), direktes Licht über
`_laubLichtStoff` (si:61 ff.); Wiesen-Grund: max(Kontakt, Narbe(1,86)) (sm:1988–2001). Λ = uv.y der Studio-Geometrie.

**W12 Kavitäts-AO.** Krümmung |fwidth(n)|/|fwidth(p)| × aoStrength × aoScale × mikro, gedeckelt aoCap → multipliziert die FERTIGE
beleuchtete Farbe (`outputNode`, sm:822–841): Sonne, Pool, Himmel gemeinsam.

**W13 Karten-Selbst-Sicht (A7).** Bühne: 9 Tiefen-Kacheln der eigenen Krone, Bias nach W1-Gesetz (sk:1335–1340) → lineares Feld
c0 + c·d in rgba8 (sk:1007–1030) → im Stoff an uSunDir (Sonne oder Mond) gelesen, auf `receivedShadowNode` (sm:1551–1563). Zugleich
wirft die Karte als Zwilling in die Kaskaden (sk:616–633) und empfängt mit Versatz laubTexel·texelM[0]/kontaktM je m Blickabstand
(si:20–33), damit sie ihren eigenen Wurf nicht empfängt.

**W14 CPU-Lichtmesser (Zwilling von W1–W2).** `_horizontSichtAm` rechnet den GPU-Pass von W2 auf der CPU nach (da:1706–1763),
`_kartenWurfSicht` ersetzt den Kaskaden-Wurf der Karten durch Ellipsen mit Dichte-Profil (sk:647–678); Summe × N·L über 32 Strahlen
(da:1812–1857). Kaskaden-Würfe von Bauten, Leibern, nahen Bäumen (L0/L1) kennt er nicht.

**W15 CPU-Becken am Auge.** Σ I/(d²+k²) · kopfSicht · Saum (dk:1799–1832) — ohne Würfel-Wurf (W6) und ohne jede Geometrie.

---

## 3. ZWILLINGE UND BRÜCHE

- **B-1 Pool-Quellen ohne Wurf (Klasse).** Nur EINE Quelle im Bild wirft (bs:488–513, sm:2353). Jede andere Quelle der bis zu 4 Plätze
  (sm:3906) — Laterne, Wandlaterne, Glut, Brand-Zelle, Lava-Decke, Stahl, Tor — leuchtet durch Wände, Dächer, Gelände und Leiber. Die
  Wandlaterne ohne Wurf strahlt durch ihre eigene Wand ins Haus (W7 kennt die Wand nicht). Das Pool-Licht steht im `emissiveNode`
  (sm:2146): weder aoNode (W8/W10/W11) noch raumHimmel noch Höhle verdecken es; einzig das Licht des Auges trägt die Himmels-Sicht
  als Gewicht (sm:2396). Mittags wirft keine Quelle (wichtigAb 0,25, bs:505) — Schwelle statt Gesetz.
- **B-2 Haube doppelt.** Der Kopf wird analytisch verdeckt (W7, sm:2420–2432) UND, wenn die Laterne die werfende Quelle ist, in der
  Würfel-Karte: near = leibM + leibSaum = 0,22 m (bs:539, fw:7979), die Haube reicht bis yT = yL + 0,4 m (fw:8013), ihre Bodenplatte liegt
  bei yL + 0,225 m (fw:7666–7667) — jenseits der nahen Ebene, also in der +y-Seite gezeichnet (Steigung ≥ ~48°). Dieselbe Geometrie,
  dasselbe Licht, zwei Systeme (Rechnung aus den Maßen, kein Bild gemessen). Der Boden des Kopfs (yL − 0,17 m) liegt innerhalb near:
  nur analytisch.
- **B-3 Drei Rechnungen derselben Bestrahlung E einer Quelle.** Wurf-Wahl: Punktformel ohne Kopf, ohne Scheibe (bs:497–504); Becken:
  Punkt oder Scheibe, mit Kopf (dk:1819–1828); GPU: Punkt oder Scheibe, mit Kopf, mit Wurf (sm:2433–2450). Die Lava-Scheibe wird in der
  Wahl als Punkt gewogen; W7 gilt im Stoff nur für den Punktanteil (sm:2436).
- **B-4 Umgebungs-Verdeckung in sechs Systemen mit verschiedenen Lesern.** aHimmel (nur Boden), GTAO (nur Boden, sm:1986 einziger
  Leser), Narbe (Halm + Wiesen-Grund), raumHimmel (nur PMREM-Umgebung, bsi:718), Grat-Himmel (nur PMREM-Umgebung, bsi:715), Kavitäts-AO
  (Ausgabe-Farbe, sm:841). Auf dem Boden im Raum multiplizieren raumHimmel (der die Wände schon enthält) und GTAO (sieht dieselben
  Wände in 1,5 m) — doppelte Verdeckung derselben Wand. In der Höhle aHimmel × GTAO an der Höhlenwand ebenso. Bauten, Bäume, Leiber
  tragen keinen aoNode: keine Kontakt-Verdeckung.
- **B-5 AmbientLight und HemisphereLight unverdeckt.** Ambient 0,04·nacht (bh:2251), Hemi-Boden (bh:2461 ff., „0.1") sind Szenen-Lichter;
  raumHimmel und Grat-Himmel greifen nur in der Umgebungs-Sonde (bsi:715–721) — im Haus und hinter dem Grat bleiben sie voll (außer
  Boden/Halm über aoNode).
- **B-6 Kavitäts-AO verdunkelt direktes Licht.** sm:841 multipliziert `output` (post-lighting): Sonne und Pool werden mit abgedunkelt —
  AO wirkt auf direktes Licht. Drei Vorgaben für cavityAO: 0,35 (dk:344), 1,0 (sw:1380), 1,0 (sm:648); Kommentar sm:642 „J4-DEBUG".
- **B-7 Halbschatten der Pool-Quelle fest.** Sonne: Halbschatten aus sonneTan × Werfer-Abstand (bs:1086–1096). Pool-Wurf: PCF fest
  weichPx = 2 Texel (bs:424), unabhängig von Größe der Quelle (Kern, Fläche der Lava-Scheibe). Die flache Lava-Decke wirft aus ihrem
  Mittelpunkt wie ein Punkt.
- **B-8 Lichtmesser-Zwilling (CPU).** `_horizontSichtAm` ist der W2-Pass in JS (da:1706–1763, eigener Marsch, eigene Bilinear-Regel);
  `_kartenWurfSicht` (sk:647–678) nähert den Kaskaden-Wurf der Karten mit Ellipse und linearem Dichte-Profil („⅝", sk:663–668) statt der
  Karte, die gezeichnet wird. Nahe Werfer (Bauten, L0-Bäume) fehlen dem Messer ganz.
- **B-9 Luftschatten nur aus Gelände.** bh:2402: kein Wolken-Wurf (W3), keine Kaskade im Lichtstrahl der Luft.
- **B-10 Laub-Versatz aus k0-Konstanten.** si:30: luft = Abstand · laubTexel · texelM[0] / kontaktM (0,006 m je m) für jede Kaskade —
  nicht die Texel-Kante der Kaskade, in der das Fragment liegt (k1/k2 sind 3,8–10× gröber).
- **B-11 Schatten-Reichweite: drei Vorgaben.** 170 (dk:357, bs:1647, da:369 als Literal statt Konstante), 300 (sw:1384, sm:3844
  Rückfall), Klemme 80–400 (sm:3843, da:369, speicher-laden.js:614); HOLZ kienspan 0 (dirigent-regler.js:2199) unter der Klemme 80.
- **B-12 Veraltete Kommentare/Log.** da:435 „2 Kaskaden" bei cascades: 3 (da:410); bh:1830–1833 „typisch 600 (±300)" / „~0.293 m bei
  600/2048" — der Texel-Snap rechnet auf der Rückfall-Karte, nicht auf den Kaskaden (die Kaskaden rasten selbst, bs:874).
- **B-13 Klammern/Böden im Verdeckungsweg.** Wolke: min(…, sonneKlar), max(1−Mittel, mittelMin 0,05), steilMin 0,05 (bh:209, 216–221);
  Horizont: max(bandM 1,5 m, …) (da:1558); GTAO: clamp(vis/vis0, 0, 1)^2,5 (bs:1550), minPx (bs:1478); Kavität: clamp(0, aoCap 0,18)
  (sm:840); Bias-Hebel 0..3 (sm:3878); Kopf clamp 0..1 (sm:2431); Becken/Pool-Saum smoothstep (sm:2446).
- **B-14 Konstanten mit Literatur, aber abweichendem Wert.** KONTAKT.potenz 2,5 bei zitiertem XeGTAO-Wert 2,2 (bs:1666/1676) ohne Messung.
- **B-15 Was NICHT verdeckt wird (Befund je Quelle).** Sonne/Mond: verdeckt von allem auf der Wurf-Ebene (W1), Gelände fern (W2),
  Wolke (W3); NICHT von Wolken in der Luft (B-9). Pool-Quellen: nur die gewählte (W6) + Kopf analytisch (W7); alle anderen NICHT (B-1).
  Glut/Leucht-Stoffe (`seh: glut`) lesen den Pool nicht (sm:2122–2124) — als Quelle unverdeckt wie B-1. Himmel: Gelände-Grat (W4),
  Höhle (W8, nur Boden), Decke (W9, nur PMREM), GTAO (nur Boden), Narbe (Halm); NICHT durch Bäume/Kronen (kein Kronen-Dach-Term
  gefunden, gesucht: aoNode in vegetation-baum.js/si — nur Halm sm:39 und Boden sm:2003), NICHT für Ambient/Hemi (B-5).
  Licht des Auges: kein Wurf (bs:492), nur Himmels-Gewicht am Boden.

---

## 4. ZAHLEN DER DOMÄNE

- Getrennte Lichtwege / Verdeckungs-Systeme: **15** (W1–W15; davon 2 reine CPU-Zwillinge W14, W15).
- Größen in der Tafel: **102**.
- davon mit Anker (Physik/Norm/Messung/Literatur) oder hergeleitet (FOLGT): **23**
  (texelM (Regel), rampeTexel, sonneTan, bezugAspekt, rasterTeiler, normalTexel, tiefeTexel, zuwendungSaum, Fade-Saum, SCHATTEN_TAKT ×2,
  kernAnteil, leibM, kopf-Vektor, gitter, zelleM(H), hoeheM, raumLicht, KONTAKT.radiusM, narbe.x, kHimmel, fussNarbe, spanne).
- davon GESETZT ohne Anker: **79**.
- Ungelesen (Größe ohne Leser): keine gefunden in dieser Domäne (gesucht je Konstante mit git grep).
- Systeme, die dieselbe Geometrie für dasselbe Licht doppelt verdecken: **3** (Haube W6+W7; Raumwand raumHimmel+GTAO; Höhlenwand aHimmel+GTAO).

---

## 5. NICHT GELESEN / ÜBERGABEN

Nicht gelesen: der Rumpf des GTAO-Passes bs:1432–1595 nur über die Konstanten-Leser; `_kaskadenWerferOben`/`_werferKugel` (bs:946–1013);
`_passSicht`/`_passTrifft` (Werfer-Wahl je Kaskade, bild-wahl.js); `_laubLichtModell`/`_laubLichtStoff` Rumpf (si:61–140, Durchlass der
Krone); fachwerk `raumLicht`/`raumSonne` (fw:5985–6071) im Einzelnen; voxel-worker `hoehlenGraph` (voxel-worker.js:2889); der Feld-Pass
und das Panorama jenseits `_weltLicht.at` (bsi:2681–2700); `_horizontGitterTakt` (bk:2911–2966); WebGL2-Rückfall des Filters; die
Schatten-Zwillinge je Gestalt (vegetation-baum.js:638–872, siedlung-bauten.js:2014, koerper-leib.js:400); foundry-core GLSL-Narbe
(foundry-core.js:972, 1001, 3440) als Labor-Zwilling nicht verglichen.

Übergaben:
- Quellen-Domäne: Wahl der 4 Pool-Plätze `_leuchtQuellen` dk:1874–1963, LICHT_POOL sm:3906; `_strahler` dk:1756.
- Auge/Belichtung: `augeZeig` in der Wurf-Wahl bs:497; `_beckenAmAuge` dk:1799; Lichtmesser da:1779–1857.
- Himmel/Atmosphäre: Richtlicht Sonne↔Mond bh:1813–1898, MOONLIGHT bh:3370, Ambient bh:2248–2255, Hemi bh:2461; Wolken-Licht wl:1106–1128.
- Umgebung/Rückstrahl: `_rueckstrahlHalbraum` bs:101, `_spiegelUmgebung` bsi:690–725.
- Vegetation: Laub-Durchlass si:105 ff., Karten-Bake sk:1290–1360.
- Stoff: Kavitäts-AO-Zweig sm:815–841 (Substanz-Antwort).
