# GEGENLESE DER TAFEL DES LICHTS

Stand: Arbeitsbaum `strahler-leuchte` = 2ce8a033d (`git rev-parse` geprüft). Ich habe nur gelesen und gerechnet. Im Baum ist
nichts geändert, es lief keine GPU und kein Browser. Die berichtigte Tafel steht in `tafel.md`, gebaut aus `tafel-daten.cjs` über
`zaehle.cjs`. Den Stand vor der Gegenlese habe ich gesichert: `tafel.vor-gegenlese.md`, `tafel-daten.vor-gegenlese.cjs`,
`zaehle.vor-gegenlese.out.txt`. Die Abdeckung der Blätter prüft `gegen-abdeckung.cjs`.

## 1. Was an der Quelle hält (geprüft, unverändert)

Vierzehn Aussagen, auf denen ein Gesetz bauen würde. Jede habe ich selbst an `datei:zeile` gelesen oder nachgerechnet.

| # | Aussage der Tafel | Befund an der Quelle |
|---|---|---|
| 1 | KEY_BASE 2,6, r128-Rig, GESETZT ohne Anker (S1) | hält: welt-licht.js:47-49, Kommentar „Mittag ≈ 2.6·0.913“. Leser welt-licht.js:783, :789 und stamm/bild-himmel.js:1889, sonst keiner (`git grep`). |
| 2 | MOND_STAERKE 0,65, Anker ist ein Bild-Maß (N1) | hält: welt-licht.js:169. Der Anker ist „Boden Luma ≥ 22“, Radeon (welt-licht.js:197-202). |
| 3 | MOND_E 0,462 aus dem Ton roh als linear (N2) | hält: welt-licht.js:172 liest foundry-core.js:312 `mond: [0x9f/255, …]`, ohne sRGB-Entschlüsselung. Gerechnet: Luma 0,711 × 0,65 = 0,462. Entschlüsselt wäre die Luma 0,468, MOND_E also 0,304. |
| 4 | Skala S: p 0,2 aus ln 13,1 / ln 385 000, welt 7,83, lux 115 000 (A1–A3) | hält: welt-licht.js:54-94. Gerechnet: p = 0,2001; S⁻¹(0,598) = 0,2988 lx. |
| 5 | augeLux mit zwei Gliedern, Tag linear und Nacht über S⁻¹ | hält: welt-licht.js:102-106. Am Tag gilt 1 Einheit = 14 687 lx. |
| 6 | NACHT_AUGE.luxJeEinheit = 0,26/0,224 = 1,161, Anker nicht auffindbar (A10) | hält: stamm/bild-kosten.js:3011, Anker-Text :2996. `grep 0.224\|0,224` in fachwerk-core.js und worlds/fachwerk/*.js findet nichts. |
| 7 | Klemme 1 667 K in `lichtFarbe` | hält: fachwerk-core.js:6488 `Math.max(1667, +kelvin)`. Der Ausbruch der Lava (1 650 K) liegt selbst schon unter der Klemme. |
| 8 | EINE werfende Pool-Quelle | hält: stamm/bild-schatten.js:488-513 wählt `best` mit Halte-Faktor, eine Karte. Das Licht des Auges (`ersatz`) ist ausgenommen (:492). |
| 9 | Belichtung als Fahrplan der Sonnenhöhe | hält: welt-licht.js:743-774. `belichtungStufen(h, q)` mischt über die Gleitung 12°/8° die Tag-Steigung mit den Knoten; der Boden `nachtKnotenE` wächst bis −6° ein. |
| 10 | Pool ohne Luft | hält: im Rumpf von `_lichtPoolTerm`/`_lichtPlatz` (stamm/stoff-material.js:2290-2520) kommt weder luft, beta, exp, fog noch nebel vor. Der Abfall steht in :2434-2437. |
| 11 | Neutral 0,76 / 0,15 / 0,08 / 6,25 / 0,04 und Kurve in DA:167 | hält: vendor/three.webgpu.min.js `mT` (`yn(.76)`, `yn(.15)`, `lessThan(.08)`, `6.25`, `.04`). Die Kurve steht in stamm/dirigent-ankunft.js:167, die Belichtung 1,0 in :168. |
| 12 | Feuer: Pool 548 cd/m² gegen das gemalte Bett 10 000 cd/m² | hält: fachwerk-core.js:6527 und :6529, `leuchtdichte` :6532-6540. Gerechnet: 4,57e5 × 0,0012 = 548, × 0,4536 m² = 249 cd. |
| 13 | Ambient-Gefühl additiv, auch am Tag | hält: stamm/bild-himmel.js:2251-2252 und stamm/dirigent-kern.js:1582 `result += m * eVal`. |
| 14 | Wasser-Boden `max(0,22, dl.intensity)` | hält: stamm/bild-himmel.js:2566. |

Dazu habe ich nachgelesen, ohne Befund gegen die Tafel: `lichtGlut` nur für Daten mit `cdM2 > 0` (stamm/stoff-material.js:740-744).
Die Wandlaterne glüht mit dem Datum der Laterne (fachwerk-core.js:2097), damit ist L16 ohne Leser bestätigt. `STRAHLER` trägt kein
`ankerK` (fachwerk-core.js:6527). `BRAND.licht` und `schein` haben keinen Leser; der Treffer `B.licht` in stamm/stoff-karte.js:1332
ist ein anderes Objekt. `nacht.lum` liest nur der Zweig unter dem Horizont (foundry-core.js:397); die Bühne rechnet bei 15°
(welt-licht.js:1304). `zielKarte` 0,22 folgt, denn Neutral(0,22) = 0,18 linear = sRGB 118. `tag-ref.json` sagt bei 74,2° 117 168 lx,
bei −6° 3,01 lx (7,59 × 0,3965).

## 2. Was falsch stand (berichtigt in der Tafel)

| Zeile | Was stand | Was gilt | datei:zeile |
|---|---|---|---|
| A21 | `stufen` (10°, −0,87) · (−20°, −2,17): beide Knoten GESETZT, Anker eigenes Bild, n 2 | Der Knoten bei 10° FOLGT aus `steigung` 0,75 und der REF: 0,25 · log2(11 080 / 123 790) = −0,870 (gerechnet). Nur der Knoten bei −20° ist ein Bild-Maß (Nacht, Luma 44). Die Zeile ist geteilt in A21 (GB, n 1) und A27 (FOLGT, n 1). | welt-licht.js:179; stamm/bild-himmel.js:3401-3404; spec/farbe/tag-ref.json Zeilen 10° und 90° |
| N32 | `tag-ref.json`: „die Welt liest sie nicht“ | Die Welt liest die Datei nicht, trägt aber Handkopien: −0,87 und −2,17 in welt-licht.js:179, 0,0005 und 0,3965 in :225. Die Spalte `stufen` der Datei ist selbst die Kamera der Welt; die REF ist an dieser Stelle zirkulär. | spec/farbe/tag-ref.json (Kopf „quelle“); welt-licht.js:179, :225 |
| L8 | `laterne.cdM2` 960: GESETZT mit Anker | FOLGT aus L7 (100 cd) und der Bau-Fläche L17 (0,26 × 0,40 m), als Literal gesetzt (961,5 → 960). Einen fremden Anker gibt es nicht. Die Zeile ist ein Zwilling von L20, das dasselbe je Brenner rechnet und keinen Leser hat. | fachwerk-core.js:6458, Kommentar :6423-6424; :7641 |
| L11 | `laterne.hoeheM` 3,6: GESETZT mit Anker („Lichthöhe des Labors“) | Anker eigenes Bild bzw. Labor („Nordstern Fachwerk-Soll“, Straße 3,7 m), kein fremdes Maß: GB | fachwerk-core.js:6422-6423, :6458 |
| Q2 | Leser „nur Labor FW:655,675 (Welt liest Q9)“ | Die Welt liest Q7 `STRAHLER.abfall`. Q9 ist die Emissivität von Lava und Stahl. | fachwerk-core.js:6527, :6545 |
| S2 | Leser von LEGACY_LICHT ohne den Stamm-Kern | Dazu kommt stamm/dirigent-kern.js:2012 `_laborLichtStaerke`. Das Augen-Licht teilt durch π (stamm/bild-himmel.js:2092), DK:2012 multipliziert zurück: die „EINE Übersetzung Labor → Welt“ hat an dieser Stelle keine Wirkung. | stamm/bild-himmel.js:2092; stamm/dirigent-kern.js:1836, :1848, :2011-2013 |
| X11 | Panorama-Backen: Leser „Tor-Membran der Welt (panorama.f16)“ | Zehn Studios tragen ein `panorama.f16`: fachwerk, fluid, garage, klang, koerperstudio, portale, schmiede, skeleton, terrain und tetrapoda. Darunter sind drei ohne Licht-Rig (fluid, klang, skeleton), deren Bild ebenso in die Membran geht. | worlds/tor-ziele.json; `ls worlds/*/panorama.f16` |
| §3.1 | Vorbehalt: „S0_TON misst den Farbton netto am beleuchteten Boden“; das Fenster sei für 1 667–2 000 K leer | S0_TON misst ZWEI Größen. Der Farbton ist NETTO (mit minus ohne Feuer, linear), die Sättigung BRUTTO (das Bild mit der Nacht). Netto trägt jedes Licht volle Sättigung (Kommentar: 0,96). Die Rechnung prüfte beide an derselben reinen Quellfarbe; „leer“ ist darum kein Urteil über die Linse. | scripts/diag-pruefbuehne.cjs:955-962 |

## 3. Was fehlte (Größen, die kein Blatt las oder die Tafel nicht übernahm)

| neu | Größe | Wert | Status | datei:zeile |
|---|---|---|---|---|
| S40 | DSL-Himmelstönung `skybox_color`: SKY_TINT_MAX, Farb-Lerp, Stärke-Rampe, Abklang. Ein Lichtweg, den kein Blatt las: die Farbe eines DSL-Satzes tönt Kuppel, Umgebung und E0. Eine ungültige Farbe wird still verworfen (fail-soft). | 0,6 · 0,08 · 0,12 · 0,001 je Bild | G0, n 4 | stamm/feld-dsl.js:996-1009, :2481; stamm/bild-himmel.js:1739-1756 |
| N33 | Aura-Tönung des Hemi-Bodens: lebendig, glut, magie | 0,15/0,25 · 0,35/0,1 · 0,15/0,3 | G0, n 6 | stamm/bild-himmel.js:2474-2486 → :2489 |
| E22 | Tier-Augen-Glut `tierauge` glut · ei (Tag und Nacht gleich hell, roher Emissiv-Stellwert) | 0,29 · 0,3 | G0, n 2 | tetrapoda-core.js:3692 → foundry-core.js:8211-8240 |
| E23 | Seifenfilm der Tor-Membran, Look-Zahlen: kugel, brechung, dicke (6), rand, basis, gewichtMax, act, glanz, tiefe, spiegel, farbe, F0 | 4 · 0,12 · … · 0,24 · 0,55 · … · 2,6 · 0,04 | G0, n 12 | porta-core.js:1662-1680 → stamm/siedlung-tor.js:249-300 |
| E24 | Seifenfilm, Physik: n, welle | 1,33 · [1 1,22 1,44] (650/532/450 nm) | GA, n 2 | porta-core.js:1664, :1678 → stamm/siedlung-tor.js:293-297 |
| E25 | `membranPalette` warm · cold · dWarm · dCool · dCryst · sat (Werte über 1) | [1,95 1,45 0,85] · [0,4 0,6 1,5] · … | G0, n 6 | porta-core.js:1602-1616 → stamm/siedlung-tor.js:70, :163, :297 |
| A28 | `lichtGlut[datum]`, die Höhe der Glut je Datum (Blatt f 22, von der Tafel nicht übernommen) | augeGlut(cdM2) · augeMass | F, n 1 | stamm/dirigent-kern.js:1626-1631 → stamm/stoff-material.js:2142, stamm/studio-stoff.js:399 |
| A29 | `lavaGlut` (Blatt f 23, nicht übernommen) | augeGlut(L Ausbruch) · augeMass | F, n 1 | stamm/dirigent-kern.js:1622 → stamm/siedlung-wege.js:546-560 |
| Q30 | Platz-Stärke des Pools, Candela ÷ Luma der Farbe (Blatt f 13, nicht übernommen) | I ÷ luma(lichtFarbe) | F, n 1 | stamm/dirigent-kern.js:1711-1713 |
| A27 | Knoten 10° von `stufen` (aus der Teilung von A21) | −0,87 | F, n 1 | welt-licht.js:179 |

Blatt c Zeile 5 („Kelvin je Brenner — nicht gefunden“) ist eine Leerstelle und keine Größe. Sie steht schon in §4.1 der Tafel.

## 4. Brüche, die in §3 der Tafel fehlten (eingetragen)

- **Brand: eine Flamme, zwei Temperaturen.** Das Licht brennt in `feuer.kelvin` 2000 K (stamm/dirigent-kern.js:1922, :1930). Das Bild der Flamme läuft von 3000 K bis 1700 K (stamm/feld-brand.js:994). Blatt b nennt es (b:124), die Tafel nicht.
- **Zwei Quellen derselben Himmelsbestrahlung** (Blatt a Z14): `_himmelsBestrahlung` (stamm/bild-himmel.js:1715, Messer und Kamera :2211, :2221) gegen `_himmelsIrradianz` (stamm/bild-himmel.js:2526, Unterwasser).
- **Derselbe `tint.auraK` mit zwei Rückfällen:** 1 an der Himmelstönung (stamm/bild-himmel.js:1745), 0 am Hemi-Boden (:2474).
- **Membran: F0 0,04 bei n 1,33.** Zu n 1,33 gehört F0 = ((n − 1)/(n + 1))² = 0,020 (gerechnet). Der Wasser-Stoff trägt richtig 0,02 (foundry-core.js:157); die Membran trägt 0,04 (porta-core.js:1667).
- **Veralteter Kommentar:** stamm/feld-brand.js:975 sagt „der Mond trägt 0,224“; heute ist MOND_E 0,462 (welt-licht.js:172).
- **Augen-Licht ÷ π × π:** stamm/bild-himmel.js:2092 gegen stamm/dirigent-kern.js:2012 (siehe S2).

## 5. Grenzfälle, nicht umgestuft (benannt)

- S21 Sichtweiten 20 km / 1,5 km, S24 Grenzschicht 1 km: GA nach der Zählweise der Tafel, obwohl die Quelle kein Zitat trägt (foundry-core.js:303-305). Ich habe sie stehen lassen, weil es meteorologische Größenordnungen sind. Strenger gelesen wären es G0 (+3 Felder G0).
- S19 `mieAlbedo` 0,9: G0 in der Tafel. Die Zahl entspricht der Vorgabe in Bruneton 2017; im Code steht dazu kein Zitat. Ich habe sie nicht umgestuft.
- L13 Fenster 20 cd/m² aus „80 lx · 0,8 ÷ π“: GA in der Tafel. Die 80 lx und die 0,8 tragen keine Quelle (fachwerk-core.js:6421-6422). Ich habe nicht umgestuft.

## 6. Die Zahlen, neu gezählt (`node zaehle.cjs`)

| | vorher | nachher |
|---|---|---|
| Zeilen · Felder, alle | 211 · 548 | 221 · 583 |
| FOLGT | 36 · 52 | 41 · 57 |
| GESETZT mit Anker | 42 · 66 | 41 · 66 |
| GESETZT, Anker eigenes Bild | 17 · 28 | 18 · 28 |
| GESETZT ohne Anker | 105 · 385 | 110 · 415 |
| ohne Leser | 11 · 17 | 11 · 17 |
| Licht-Kette (ohne Technik, Kosmetik, Studios) | 182 · 372 | 192 · 407 |
| … davon ohne Anker | 81 · 222 (60 %) | 86 · 252 (62 %) |
| … ohne Anker oder nur Bild-Anker | 242 von 372 (65 %) | 272 von 407 (67 %) |
| … photometrischer Anker oder FOLGT | 75 · 113 | 79 · 118 (29 %) |
| Zeilen aus mehreren Blättern | 100 von 211 | 101 von 221 |
| Systeme | 56 (30 · 10 · 9 · 7) | 57 (31 · 10 · 9 · 7) |
| an der Quelle gelesen | 82 Zeilen | 92 Zeilen |

## 7. Nicht gelesen, nicht gerechnet

- Die Blatt-Abdeckung habe ich für b, c, d, f und g mechanisch geprüft (`gegen-abdeckung.cjs`). Die Blätter a, e und h habe ich nur von Hand gegen die Tafel gehalten (a ganz; e Abschnitte 1a–1h stichprobenartig; h über die Kennungen B, F, P, K, T, R, X und Y).
- Wie die Panoramen von fluid, klang und skeleton gebacken werden (ohne THREE-Rig) und mit welcher Helligkeit die Membran sie zeigt, habe ich nicht gelesen.
- Ob die Tier-Augen-Glut nach dem Backen über `kreatur-leben.js:2972` („glimm“) noch in einen anderen Weg geht, habe ich nicht bis ans Pixel verfolgt.
- Die Zeilen ohne Marke (Schatten V1–V4/V7–V13, Stoff-Looks E5–E9, Wolken, Lava/Esse Q21–Q26, Studios X1–X10) habe ich nicht nachgelesen. Ihre Bündel-Feldzahlen sind aus den Blättern übernommen.
- Die Netto/Brutto-Rechnung von S0_TON am beleuchteten Boden ist ungerechnet, ebenso jede Zahl am Gerät.
