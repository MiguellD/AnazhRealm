# Zensus klima-front (24.11., GTX 1050 Meister, node an den Kernen von origin/main c9da3a64 = Kerne 07693cc8, keine GPU)

**Drei Sätze.** Entscheid 1 fällt am Zensus: echte Ketten (≥ 800 m Abfall auf BEIDEN Flanken, längs des Winds des Orts im 10-km-Takt, Luv/Lee bei ¾ des Abfalls) geben an 12 Saaten und 2 239 Kämmen Luv/Lee **1,36** (der nasse Anteil des Wetters) und schon im Kern **1,50** (Niederschlag mm/a, Luv nur 325 mm/a) — die 2,92 des Vorgängers stehen nicht; der Kontrast lebt im **Regenschatten** (`schattenKm`: Mutante → 1,05), NICHT im Sperr-Band (`sperreKm` → ∞: 1,32, die benannte Mutante fällt nicht rot) → STOPP an #1 als Stations-Schnitt, es ist ein Macher-Schnitt in `planetKlimaR` (Hang-Aufwind, Smith & Barstad 2004). Entscheid 2 fällt ebenso: der Rang je 10°-Gürtel steigt nur auf 0,18–0,31 (Prädiktor der Station) bzw. 0,25–0,44 (Meer und Schatten längs des Winds), Gegenlauf ≈ 0 (−0,03 … 0,02) — die Gürtel tragen es nicht allein. Entscheid 3 steht: die Zeit-Achse hebt an 494 konvergenten Land-Punkten **30 m je 10⁶ a** (|Δh| 267 m ist Platten-Versatz, Δh(−0,1 → 0) = 0), die Reife der Scheibe ist 0,996 (1 − e^(−Alter/20 Ma), je Scheibe fest, Abschnitte ~173 Ma), Spearman Δh ↔ Rate **0,03**; 1 Ma nach einem Abschnitt-Beginn (junges Gebirge) 42 m je Ma. **gegenwart#2** steht an diesem main bei **98,6 %** (351 von 356 Gipfeln > 2 km auf Konvergenz, 12 Saaten; Soll ≥ 95) — die 46,3 % der Akten sind stale, kein eigener Schnitt.

Werkzeug: `C:/Users/User/AppData/Local/Temp/e10w/knoten/kf/zensus.cjs` (Teile s1 s2 s5 g2) · `mutanten.cjs` · `pmm.cjs` · `jung.cjs`, der Ort wie im Planet-Faden (`planetOrtAuftrag`: planetPunkt Fuß 16 km, planetOrt gegen die Heimat, wetterAt über 400 Zeiten mit dem vollen Δ regen/sturm/nebel). Saaten `anazh-realm-seed`, `zsp-0 … zsp-10`.

## #1 welche Mutante trägt den Kontrast (dieselben 747 Kämme, jeder dritte)

| Kern | Kämme | v¾ Median (Q1 … Q3) | Anteil ≥ 2 | Luv nass | Lee nass |
| --- | --- | --- | --- | --- | --- |
| heute | 747 | 1.371 (1.01 … 2.472) | 0.327 | 0.268 | 0.198 |
| sperre | 747 | 1.315 (1 … 2.223) | 0.28 | 0.295 | 0.2 |
| schatten | 747 | 1.05 (0.932 … 1.426) | 0.114 | 0.27 | 0.24 |
| beide | 747 | 1.022 (0.921 … 1.218) | 0.032 | 0.303 | 0.308 |

## #1 der Niederschlag des Kerns an denselben 2 239 Kämmen (planetKlima, mm/a)

- P Luv/Lee ¾ an 2239 Kämmen: 1.504 (1.009 … 3.09) · ≥ 2: 0.387 · Mutante Sperre aus 1.396 (0.992 … 2.619) (≥ 2: 0.326)
- P Luv 324.659 (213.731 … 469.081) mm/a · Lee 202.114 (103.2 … 296.75) mm/a · regenQuote-Verhältnis P/(P+900) 1.358 (1.007 … 2.443)
- Abfall 800-1500: 580 Kämme P-Verhältnis 1.256 (0.972 … 2.078)
- Abfall 1500-3000: 690 Kämme P-Verhältnis 1.417 (1 … 2.469)
- Abfall ≥3000: 969 Kämme P-Verhältnis 1.946 (1.072 … 5.524)

## #1 Luv/Lee an Ketten (≥ 800 m Abfall beidseits, längs des Winds)

| Saat | Kandidaten | Wind < 0,2 | Kämme | Median v¾ | Mutante Sperre aus v¾ |
| --- | --- | --- | --- | --- | --- |
| anazh-realm-seed | 1219 | 0 | 298 | 1.351 | 1.318 |
| zsp-0 | 447 | 0 | 91 | 1.896 | 1.966 |
| zsp-1 | 639 | 0 | 109 | 1.815 | 1.615 |
| zsp-2 | 905 | 0 | 116 | 1.52 | 1.523 |
| zsp-3 | 331 | 0 | 55 | 1.405 | 1.238 |
| zsp-4 | 607 | 0 | 260 | 1.35 | 1.189 |
| zsp-5 | 369 | 0 | 106 | 1.236 | 1.158 |
| zsp-6 | 981 | 0 | 268 | 1.506 | 1.397 |
| zsp-7 | 863 | 0 | 394 | 1.299 | 1.253 |
| zsp-8 | 448 | 0 | 105 | 1.352 | 1.28 |
| zsp-9 | 718 | 0 | 235 | 1.38 | 1.346 |
| zsp-10 | 832 | 0 | 202 | 1.204 | 1.233 |

alle 2239 Kämme: v½ 1.208 (1 … 1.817) · v¾ 1.359 (1 … 2.382) · v1 1.229 (0.931 … 2.033)
Mutante (sperreKm → ∞) an denselben Kämmen: v¾ 1.296 (1 … 2.128)
Anteil v¾ ≥ 2: 0.307 · Mutante ≥ 2: 0.276
Luv ¾ 0.268 (0.2 … 0.363) · Lee ¾ 0.198 (0.103 … 0.255) · Lee am Boden (< 0,03): 0.059
Abstand Luv/Lee-Punkt ¾ vom Kamm: Luv 160 (90 … 260) km, Lee 160 (90 … 260) km
Abfall 800 … 1500 m: 580 Kämme, v¾ 1.176 (0.985 … 1.714), Mutante 1.155 (0.979 … 1.529)
Abfall 1500 … 3000 m: 690 Kämme, v¾ 1.309 (1 … 1.944), Mutante 1.262 (1 … 1.864)
Abfall 3000 … ∞ m: 969 Kämme, v¾ 1.643 (1.056 … 3.969), Mutante 1.571 (1.006 … 3.659)
|Breite| 25 … 35°: 545 Kämme, v¾ 1.204 (1 … 1.656)
|Breite| 35 … 50°: 980 Kämme, v¾ 1.857 (1.134 … 4.441)
|Breite| 50 … 65°: 700 Kämme, v¾ 1.153 (0.969 … 1.691)
Erholung der Feuchte windab (Lee/Luv): 200 km 0.746 (0.44 … 1) · 400 km 0.783 (0.464 … 1.061) · 800 km 0.896 (0.6 … 1.2)
flacher Gegenlauf längs des Winds (±50 km): 1 (0.985 … 1.043) (130 Paare)
die Station heute (±42/52°, 3°-Takt, ein Schritt) an denselben Saaten: 1.22 (1 … 2.266) (146 Kämme)

## #2 Rang der Trockenheit (Spearman gegen −nass)

| Saat | Land | roh Station | roh Wind | Gürtel Station | Gürtel Wind | Gürtel Wind perm. | Gürtel nur Meer | Gürtel nur Schatten |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| anazh-realm-seed | 2270 | 0.234 | 0.365 | 0.212 | 0.385 | -0.025 | 0.228 | 0.433 |
| zsp-0 | 2039 | 0.061 | 0.113 | 0.201 | 0.247 | 0.005 | 0.217 | 0.202 |
| zsp-1 | 2474 | 0.291 | 0.318 | 0.308 | 0.344 | 0.013 | 0.269 | 0.322 |
| zsp-2 | 2131 | 0.204 | 0.318 | 0.215 | 0.346 | -0.023 | 0.231 | 0.351 |
| zsp-3 | 2227 | -0.002 | 0.228 | 0.178 | 0.391 | -0.006 | 0.382 | 0.269 |
| zsp-4 | 2341 | 0.225 | 0.259 | 0.299 | 0.44 | 0.006 | 0.358 | 0.364 |
| zsp-5 | 2127 | 0.051 | 0.244 | 0.295 | 0.402 | 0.024 | 0.406 | 0.247 |
| zsp-6 | 2342 | 0.226 | 0.369 | 0.247 | 0.394 | -0.015 | 0.301 | 0.361 |

## #5 Hebung an der konvergenten Grenze (Land, Rand < 120 km)

Reife der Scheibe (1 − e^(−Alter/20 Ma)): t 0 0.996 (0.912 … 0.999) · t −1 Ma 0.996 (0.907 … 0.999) · t −10 Ma 0.993 (0.855 … 0.998)
494 Punkte an 12 Saaten: h 1997 (648 … 5087) m · Δh(−1 Ma → 0) 30 (-150 … 453) m · Δh(−0,1 → 0) 0 (-31 … 26) m
Rate am Rand 5.021 (3.884 … 7.263) cm/a · Orogen-Term t 0 4.249 (1.298 … 5.811) km, t −1 4.281 (1.306 … 5.822) km
Spearman Δh(1 Ma) ↔ Rate: 0.034 · Orogen ↔ Rate: 0.399
Anteil Δh(1 Ma) ≥ 500 m: 0.239 · ≥ 1 730 m: 0.13 · Betrag |Δh| 267 (82 … 961)
Lee der 60 höchsten Kämme (¾-Punkt, t −1 Ma ↔ 0): Δh Kamm 786 (158 … 1554) m · Lee vorher 0.175 (0.088 … 0.235) · nachher 0.178 (0.063 … 0.23) · Änderung 0 (-16.327 … 3.846) %
davon Lee vorher ≥ 0,05 (nicht am Boden): 47, Änderung 0 (-10 … 3.846) %

## gegenwart #2 Gipfel > 2 km (Raster ±66°/6°)

356 Gipfel an 12 Saaten, auf Konvergenz (ks > ksMin + 0,05) 351 = 98.596 %
tragender Term der Gipfel ohne Konvergenz (5): profil 4 · mantel 1
tragender Term der Gipfel mit Konvergenz (351): gebirge 334 · profil 11 · mantel 6
Rand-Art der Gipfel ohne Konvergenz: innen 3 · transform 1 · divergent 1 · Abstand zum Rand 1146 (756 … 1153) km · orogenStaerke 0 (0 … 0)
Terme (km) der Gipfel ohne Konvergenz: profil 1.522 (1.207 … 1.753) · schablone 0 (0 … 0) · trapp 0 (0 … 0) · gebirge 0 (0 … 0) · kegel 0 (0 … 0) · mantel 0.459 (0.043 … 1.018) · boden 0 (0 … 0)

## #5 junges Gebirge (1 Ma nach dem Beginn des jüngsten Abschnitts ≤ 400 Ma, konvergentes Land < 150 km)

Abschnitte dauern ~173 Ma (162 … 210); der letzte Beginn ≤ 0 liegt bei −24 … −232 Ma, der nächste bei +24 … +342 Ma. 1 Ma nach dem Beginn hebt der Kern **42 m je Ma** (−19 … 180, 12 Saaten, Rate 2,2 cm/a) — das Gesetz s = min(1,6; konv/25)·reife·gS mit reife = 1 − e^(−(t − t0 + 1)/20 Ma) liest die Rate nur für die Endhöhe, nie für das Tempo.

## Urteil je Entscheid

| Entscheid | Zensus | Folge |
| --- | --- | --- |
| 1 Stations-Schnitt Kamm einer Kette | Kämme gefunden an 12 von 12 Saaten (55 … 394 je Saat); Luv/Lee 1,36 (nass), 1,50 (Kern-mm/a); ≥ 3 000 m Abfall 1,64 / 1,95 | WIDERLEGT als reiner Stations-Schnitt → Macher-Schnitt `planetKlimaR`; die Mutante der Station muss `schattenKm` sein (Sperr-Band trägt 0,06 von 0,37) |
| 2 Rang je Gürtel | 0,18 … 0,31 (Station), 0,25 … 0,44 (längs des Winds), perm. ≈ 0 | WIDERLEGT als reiner Stations-Schnitt (Soll 0,7) — offen mit Messname `rang` |
| 3 Hebung = Funktion der Konvergenz | 30 m/Ma, Spearman 0,03, Reife 0,996 | BESTÄTIGT → Macher-Schnitt im Kern (Zweig `klima-hebung`) |
| Nachtrag gegenwart#2 | 98,6 % an main | grün an main, kein Schnitt; der nächste Lauf der Station ist der Richter |

Profi-Quelle Hebung (WebSearch): Nord-Altiplano 2,5 ± 1 km Oberflächen-Hebung zwischen ~10 und 6 Ma (Garzione et al. 2008; ≈ 0,5 km/Ma); Isostasie: Krusten-Verdickung ΔT hebt die Oberfläche um ~ΔT/6 (Garzione et al. 2007, Erwiderung).
