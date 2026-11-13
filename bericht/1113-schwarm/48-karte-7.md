# 48 Meisterkarte Scheibe 8/8 — haar · material · speicher · vegetation (Index mod 8 = 7)

Quellen: `PM/meisterkarte-quelle/punkte/stand.json` (zeit 2026-11-13T19:48, kopf ec281422) · `PM/meisterkarte.json` (summe 221) · `messung/*.json`
(letzte Urteile je Station × Gerät) · `stationen/g2.js`, `g3.js`, `g6.js` · Kurs-Blatt B. Scheibe gebucht **23/40** (haar 5 · material 5 · speicher 10 · vegetation 3).
Offen 17 Punkte: **7 mit Station**, **10 ohne Station** (Staffel 2 ohne `#2` oder in `fehlt`). speicher K1–K5 stehen 2/2, nichts offen.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
`BILD/dorf-main-0.5.png` (Dorfplatz der Ankunft, Mittag): der Platz ist ein brauner, gesprenkelter Teppich mit violetten Schlieren ohne Kante;
der Hang dahinter trägt große flache gelbgrüne Zacken (Halm-Wimpel), dazwischen grauer Fels mit Flecken; am Hang steht KEIN Baum, nur am
oberen Rand zwei Kronen; das Haus rechts ist ein glatter grauer Kasten; der Himmel dunkel-marine. Die Haare der Bewohner sind aus dieser Distanz
Kappen ohne Strähne (ein Pixel-Urteil traue ich mir an diesem Bild nicht zu). Kein Bild von Halm im Haus, Jahreszeit, Wald-Innerem gesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Regel (Kurs B, punkte.cjs:4063): #1 GRÜN an EINEM Gerät, #2 GRÜN an ALLEN und nur, wenn #1 hält. Die 7 Punkte mit Station:
| Id | Ist ↔ Soll (letzte Messung) | Art |
|---|---|---|
| vegetation.K5#2 | **GRÜN** Radeon ec281422 20:18: Winter 0,037 × Sommer, Wiese LAI 0,314 × (≤ 0,5), Frühling 1,94 (`messung/ec281422-radeon.json`); GTX gehalten 039509b2 | nur BUCHEN — stand.json (19:48) kennt die Messung noch nicht |
| material.K1#1 | 11/13 Zeilen; **fels 1,1056 · boden 1,2957/1,2969** ↔ 0,9–1,1, beide Geräte, ec281422 | frisch ROT |
| material.K1#2 | Karte 0,1799 ↔ 0,18 ± 0,003 hält; ROT nur über dieselben Zeilen fels/boden | Zwilling von #1 |
| vegetation.K1#1 | LAI 2–5 2,79 · 5–10 2,28 (−18,3 % Radeon) / 2,78 · 2,31 (−16,9 % GTX) ↔ Naht ≤ 15 % | frisch ROT |
| haar.K2#1 | strich arm 0,319 · third 0,3507 ↔ ≥ 0,3554 (Radeon ec281422); „albedo veraltet seit 66eb3576“ (koerper-core-Stempel) | frisch ROT |
| vegetation.K4#2 | „43 Häuser (1 gesetzt über die Werkstatt **false**) … **Gegenprobe 0 px**“, Wasser 0/0 GRÜN | frisch ROT, Linse blind |
| vegetation.K3#1 | Stämme/ha **24** ↔ REF 370–900, Deckung 0–2 m 0,029 ↔ 0,25–0,78 am Wald-Ort [−714,2; −880] (Radeon dc9eacb0) | frisch ROT |

**Boden (material.K1), die Wurzel mit Zahl:** Welt/Labor boden 1,1022–1,1418 bis c4010773 (11.11. 21:52) → **1,2957 ab f46b9e81** (12.11. 13:38),
seither konstant. Im Bereich c4010773..f46b9e81 ändert NUR `w28-stadt-grund` (b065ed91) den Boden-Stoff: `stamm/daten.js:708` mikroPx 1 → 3,
`:739` korn 2,0 → 0,6, `siedlung-wege.js:1387` Feld des Orts trägt Rasen (`git log c4010773..f46b9e81 -- stamm/daten.js stamm/stoff-material.js`).
Der fels-Rest 1,1056 ist älter: FUND-REGISTER Z. 119 — das Himmels-Bild des Mikro-Reliefs ist NICHT mittelfrei, sein Mittel steht bei
**1,13** (`daten.js:721`, `stoff-material.js:2743–2746` `ao = himmel / korn`), das Labor trägt es nicht → Welt ~6 % heller. Das Gesetz KANN
Korn mittelfrei (`stoff-material.js:2742`, 1 + korn·h), das Himmels-Bild konsumiert die Welt mit Versatz. Die Labor-Seite der Tafel: nicht gelesen.

**Wiese (vegetation.K1#1):** vor dem Trieb −14,1 % GRÜN, seit `w28-halm-trieb` (b560adaf) −18,3 % (FUND Z. 193). `w28-wiese-fern` 476a3ed9
(Rumpf) misst: die L2-/Ferne-Schnitte bewegen die Naht NICHT (−16,7 ↔ −16,9 %), sie „hängt an der Nah-Streu“ (15 000 Grund-Pixel weniger bei
gleichen L1-Pixeln). Die Wimpel im Bild sind L2 (FUND Z. 224) — ein anderes Ding als der Punkt.

**Natur-Wand (vegetation.K4):** Gegenprobe 56–59 Tsd. px an allen Messungen bis 29.10. (98ef98bb), **0 px seit der ersten Messung danach**
(11.11., e6f0cf7e) an jedem Kopf; zugleich `werkstatt false`. In der Linse (SPIEL `scripts/diag-haus-welt.cjs`): `o.werkstatt = r.confirmBuild()`
(:349) wird von JEDEM `setze`-Aufruf überschrieben — Spieler-Haus :815, W9-Slot :829, W11-fremd :399 — das Urteil (g2.js:4241) liest also den
Ausgang des letzten Setzens, nicht den des Spieler-Hauses. Die Gegenprobe (:976–977) blickt vor die Tür des Spieler-Hauses; `blick` (:753–759)
gibt 0 ohne Schuss, wenn keine geladene Kachel `s.nahWiese.kacheln` ein Büschel trägt — `stell` (:307) setzt den Spieler beim späteren
Setzen an den Slot/Fremd-Ort, die Nah-Wiese folgt ihm. Dass DAS die 0 ist: Vermutung, nicht gemessen. Box-Halm 0 px ist dann ebenso blind.
Auch K4#1 Radeon fällt nur an `gegen > 0` (g2.js:4173); GTX hält K4#1 gebucht aus b3f9ae95.

**Wald (vegetation.K3#1):** der Wald-Ort [−714,2; −880] liegt am Dorf-Hang (Kamera „Dorf-Hang −705 / −877“ im Rumpf von 476a3ed9) — der
Hang im Bild ohne Baum IST das ROT: 24 Stämme/ha. Licht-Flecken CV 0,69 halten das Soll ≥ 0,3, verlangen aber ≥ 2 × offen (0,84): ROT.

## Die EINE begrenzende Entscheidung
**Der Boden der Ankunft ist EIN Stoff, Welt = Labor:** beide Bilder des Mikro-Stoffs (Korn UND Himmels-Bild) sind mittelfrei, und der
Sprung +15 % aus w28-stadt-grund wird an seiner Zeile benannt und geschnitten — nie das Band (0,9–1,1) bewegt. Das ist der Teppich im Bild.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Stufen des Dings „Boden“: Korn (nah, `daten.js:739`) · Himmels-Bild (`stoff-material.js:2743`, Mittel 1,13 → 1,00 über `krume`/Teiler) ·
Oktaven am Schirm (`daten.js:708`) · Fels-Gestalt (`stoff-material.js:2758`, `studio-stoff.js:628/727`) · Stein der Gassen (`_steinStoff` :2779)
· fern (lodNear 14 → lodFar, `daten.js:747`). Ansehen aus Auge, Hügel (12 m), Dach (25 m) an den vier Kameras aus dem Rumpf von 476a3ed9.
Schritt 0: Bisektion fels/boden in EINER Welt an c4010773 ↔ b065ed91 (nur `material.K1#1`, 1,2 min je Lauf laut messung) — nennt die Zeile.
Leser-Liste VOR dem Schnitt: `stoff-material.js:1935` (Boden-Chunk ruft `_mikroStoff`) · `:900` (`_mikroGestalt` der Gestalt) · `:2828`
(`_steinStoff`) · `studio-stoff.js:628, :727` (Studio-Fels) · `stamm/siedlung-wege.js:1387` (Feld-Rasen) · Linsen: `g3.js:216/376` ALBEDO_K1
(material.K1#1/#2, K3#1/#2 Zwillinge) · `g3.js:2617` material.K2#1 Arm-Linse (glatt/nyquist; `daten.js:722–730`: krume 0,025 hält S0-Nacht
Luma — Nachbar-Stufe, darf nicht schlechter werden) · `gate:pruefbuehne-licht` S0 Nacht.
Kosten-Zeile: nur ALU im Boden-Fragment, 0 Befehle, 0 Dreiecke, kein neuer Pass; Ankunft (B) unberührt — ms-Paar Ego/Third gegen heute.
| Kriterium | Ist ↔ Soll | Station |
|---|---|---|
| material.K1#1 | fels 1,1056 · boden 1,296 ↔ ≤ 1,1 | g3.js:2808 (ALBEDO_K1) |
| material.K1#2 | dieselben Zeilen, Karte 0,1799 hält | g3.js:2846 |
| material.K3#1/#2 (2/2, Nachbar) | L1/L0 0,98–1,013 ↔ 0,95–1,05 | g3.js:2693/2748 — darf nicht fallen |
| material.K2#1 (1/2, Nachbar) | nyquist 0,07–0,18, glatt ≤ 0,08 | g3.js:2617 — darf nicht fallen |

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-weg-koerper` b1ffbea3 (WIP): Gehsteig/Bord/Platte, „Kante im Boden-Stoff“, `daten.js` +2, `gelaende-boden.js` — derselbe Boden;
  der Albedo-Schnitt fährt IN dieser Welle mit (sonst zwei Hände am Teppich). Fehlt: Abgabe, Bildpaar am Dorf.
- `w28-wiese-fern` 476a3ed9 (WIP): Ego +7,3 ms reißt; kippt vegetation.K1#1 NICHT (Rumpf). `w28-wiese-mitte` 0bfb8da9: landet nicht (Rumpf).
- `w28-leib-nah` ace30e73 (GTX 1050): foundry-core/koerper-core — ob das Haar (haar.K2) mitgeht: nicht gelesen.
- `w28-richter-hand3-pm` 8afcd41a: Kurs B vermutet Heilung von K4#2 — ich fand den Überschreib-Fehler in der SPIEL-Linse, nicht in pm.
- FUND Z. 118: Albedo-Zeilen der Menschen veraltet → `diag-albedo-tafel --nachziehen` auf echter GPU (S) — Vorbedingung haar.K2#1.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Welche Zeile von w28-stadt-grund den Boden +15 % hebt: nicht bisektiert; die Labor-Seite der Albedo-Tafel (`diag-albedo-tafel.cjs`) nicht gelesen.
- vegetation.K4 Gegenprobe 0: Mechanismus (Nah-Wiese folgt dem verstellten Spieler) vermutet; Täter-Commit zwischen 98ef98bb und e6f0cf7e
  unbenannt (Kandidaten im Log: 61000dae7 „die Plattform fällt ganz“, 80c254b83 w21-wiese-fern).
- vegetation.K5#2: GRÜN 20:18 nach der Stations-Änderung von g2.js (20:17); die Buchung 21:02 wurde wegen schatten.K3/K4 verweigert — ob sie
  K5 trug, nicht gelesen. Kurs B nennt für K5#2 „Blickziel verdeckt“; am Kopf ec281422 ist das geheilt.
- 10 Punkte ohne Station: haar.K1#2, K2#2, K3#2, K5#2 · material.K2#2 (kein Werkzeug), K4#2, K5#2 · vegetation.K1#2 (Plan > 90 s, g2.js:6075),
  K2#2, K3#2 (REF real-mischwald fehlt, g2.js:6066). Keine Messung bucht sie.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Die fünf Punkte, die ein Bild-Schnitt nebenbei kippt:
1. vegetation.K5#2 +1 — kippt schon ohne Schnitt mit der nächsten angenommenen Buchung (GRÜN am Kopf). Wirkung Takt 2 · S · Risiko: die Ratsche hält, solange niemand die Station wieder ändert.
2. material.K1#1 +1 — Boden-Schnitt (Teppich). Bild 4 · M · Risiko: mittelfreies Himmels-Bild dunkelt Schatten/Nacht; S0 und material.K2#1 mitmessen.
3. material.K1#2 +1 — derselbe Lauf, beide Geräte. Bild 4 · S nach 2 · Risiko: GTX und Radeon lesen boden 1,2969/1,2957 — beide müssen unter 1,1.
4. vegetation.K1#1 +1 — Wiesen-Schnitt an der Nah-Streu-Naht 5 m (5–10-m-Ring +4 % LAI). Bild 3 · M · Risiko: der Ring jenseits 5 m kostet Ego-ms (wiese-fern riss +7,3 ms).
5. haar.K2#1 +1 — Mensch-Schnitt am Kopf (w28-leib-nah): third fehlt 1,3 %, arm 10 %, Albedo-Zeile nachziehen. Bild 3 · M · Risiko: Strähnen-Kohärenz misst eine Pose; Feder in Ruhe halten.
Daneben (kein Bild-Schnitt, Linse): vegetation.K4#2 +1 — `o.werkstatt` je Setzen getrennt (Spieler-Haus allein), Gegenprobe vor dem Umstellen. Takt 2 · S · Risiko: Linse schärfen heißt nicht Soll bewegen — die Gegenprobe muss echtes Gras sehen.
