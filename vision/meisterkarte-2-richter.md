# Meisterkarte 2 — warum leer, was buchbar wäre, der erste Schritt

Stand 15.11.2026 11:32 (Get-Date), koordination ef587494, main 4ee205bd. Nur gelesen und gerechnet; keine GPU, keine Welt.

**Drei Sätze.**
1. Die Karte ist nicht leer, weil kein Richter fuhr — 22 Gerät-Messungen in 20 Akten-Dateien auf 5 Sprossen stehen in `vision/richter/`, der Richter ist in 22 von 22 GRÜN —, sondern weil der Preis in 21 von 22 ROT ist und einmal ohne Urteil (VRAM 116–163 MB gegen 118, Heap 290–884 MB gegen 400), weil nie Radeon und GTX am selben SHA einen vollen Preis trugen (die Radeon-Karten-Sitzung wich seit 14.11. 16:21 in 27 von 33 Starts dem Schloss) und weil die Karte nur 10 von 1 718 Sprossen eine Preis-Klasse gibt — die übrigen 1 708 kann `buche-2.cjs` nie über Kern heben („KLASSE FEHLT“).
2. Heute buchbar sind 0 Punkte, über die Brücke ohne neue Fahrt ebenso 0 (Z2 verlangt die Fahrt am Kopf mit Preis); am nächsten steht `leben.pflanzen.kraft` S 1: Richter an beiden Geräten GRÜN, an der GTX 68d24688 die Zeit GRÜN (p95 25,5 ms, größtes Bild 58,5 ms, f 1,03), es fehlen nach GC 15 MB VRAM (133,2 → 118) und 12 MB Heap (412,3 → 400), an der Radeon 8ddf3de9 nach GC 7 MB VRAM (125,0 → 118).
3. Der erste Schritt ist EIN gepaarter Lauf ohne Weichen: Radeon und GTX am selben Kopf mit den 5 Stationen der Richter-Tafel (etwa 13 + 10 GPU-Minuten), davor `buche-2.cjs` auf den Speicher nach GC stellen, wie REGELN.md es sagt (heute urteilt der Code die Spitze OHNE GC) — dann trennt allein der VRAM der Mess-Wiese die ersten 6 Sprossen vom Punkt, und das ist Pflicht E.

Marken: [m] von mir gemessen/gerechnet · [q] gelesen · [s] geschätzt.

## 0 · Die stale Zeile

`vision/MEISTERKARTE-2.md` Zeile 3 (Stand 14.11. 16:27, 59f3b721) sagt „kein Richter dieser Karte ist je gefahren“ [q]. Seit 14.11. 17:22 (e97cfecd) gilt das nicht mehr: 20 Akten-Dateien, 22 Gerät-Messungen (Radeon 16, GTX 6), 9 SHAs, 5 Sprossen [m: Zählung `vision/richter/*.json`]. Die Zeile muss beim nächsten `buche-2`-Lauf mit dem echten Satz ersetzt werden (Seite aus `seite-bauen.cjs`).

`node vision/buche-2.cjs --akten vision/richter --karte vision/meisterkarte-2.json --trocken` (Kopie von koordination ef587494 im Scratch) [m]:

```
erleben.klang.ereignis S 1: KERN — kein Punkt, nur ein Gerät (GTX 1060) am 68d24688 — es fehlt Radeon 890M
erleben.klang.ereignis S 2: KERN — kein Punkt, nur ein Gerät (GTX 1060) am 68d24688 — es fehlt Radeon 890M
leben.pflanzen.jahreslauf S 1: KERN — kein Punkt, nur ein Gerät (GTX 1060) am 68d24688 — es fehlt Radeon 890M
leben.pflanzen.kraft S 1: KERN — kein Punkt, nur ein Gerät (Radeon 890M) am 8ddf3de9 — es fehlt GTX 1060
mensch.zeit.palimpsest S 1: KERN — kein Punkt, nur ein Gerät (GTX 1060) am 68d24688 — es fehlt Radeon 890M
KARTE 2: 0 von 1718 gebucht (0,0 %), 19 im Kern
```

## 1 · Die drei Riegel, je mit Täter

| # | Riegel | Zahl | Täter (gelesen) |
|---|---|---|---|
| R-a | Preis ROT an Heap/VRAM | VRAM-Spitze 116,0–163,2 MB in 22 Messungen, über 118 in 21/22; nach GC (21 mit Posten) 113,0–136,0 MB, über 118 in 19/21 (unter 118 nur palimpsest 113,0 GTX und 113,1 Radeon 337846dc) [m] | Soll `preisTreppe` Ort „Heap ≤ 400 MB, VRAM ≤ 118 MB“ (`meisterkarte-2.json`, REGELN.md Z. 36) [q]; die Mess-Wiese hält nach GC 123–136 MB [m: `preis.posten.vram_mb`] |
| R-b | Code urteilt die Spitze, REGELN sagt nach GC | Beispiel kraft 72561da7: Spitze Heap 380,5 / nach GC 255,4 · jahreslauf GTX: 883,7 / 420,3 [m] | `buche-2.cjs:178` prüft `p.heap_mb`, `p.vram_mb` — laut `richter/LIESMICH.md:22` die Spitze OHNE GC; REGELN.md Z. 40: „nach zwei erzwungenen Aufräum-Läufen … der Wert ohne Aufräumen … urteilt nicht“ [q]. Sage a ≠ tue a |
| R-c | Keine gepaarte Fahrt | 9 SHAs, nur 337846dc trägt beide Geräte — dort die GTX ohne Referenz und ohne Urteil → Preis FEHLT [m]; GTX zuletzt 68d24688 (14.11. 21:39–21:47), Radeon an 68d24688 keine Karten-2-Station | `w4/radeon-nie-leer.log` Z. 611–735: 33× „offene Stationen am“, 27× „ABGEBROCHEN … wartete am Schloss“ [m]; 22:30–22:43 an 68d24688: „BEHALTEN 1 Station(en), 0 GRÜN“ (Z. 645–648) [q] |
| R-d | Preis-Klasse fehlt | 10 von 1 718 Sprossen tragen `klasse` (planet 0 · kosmos 0 · leben 2 · mensch 2 · erleben 3 · same 2 · zusammenspiel 1) [m]; 9 der 19 Kern-Sprossen ohne Klasse | `buche-2.cjs:170` `if (!klasse) return "OHNE-KLASSE"`, Z. 213 → höchstens KERN [q]. Die Umfangs-Klassen (R5) stehen in der Karte, die Zuordnung Sprosse → Klasse fehlt für 1 708 |
| R-e | Zeit an der Radeon nie in Ruhe | 16 Radeon-Messungen, Referenz f 1,136–8,866; im Ruhe-Band (≤ 1,2, `punkte.cjs:1053`) 1 von 16 (jahreslauf 337846dc f 1,136, dort p95 58,5 ms → ROT) [m] | Die Preis-Läufe der Wellen (Preis des Orts) fuhren unter Last; „UNGEMESSEN unter Last“ zählt wie fehlend (`buche-2.cjs:165`) [q] |

## 2 · Lauffähige Richter je Kapitel (Frage 1)

Stufe A = Richter ist Code, schreibt eine Akte (`richter-tafel.json` „gleich“). Stufe B = eine Station läuft auf der Sprosse, misst einen Teil (übrige Kern-Sprossen, Tafel „fehlt“). Stufe C = Leiter „gemessen“: eine alte Station liegt auf der Leiter, misst nicht ihren Richter. Rest = nur Text. [m: `meisterkarte-2.json` fuss + `BRUECKEN_KERN` + Tafel]

| Kapitel | Leitern | Sprossen | A Code mit Akte (Sprossen) | B Teil-Code (Sprossen) | C alte Station auf der Leiter (Leitern) | ungemessen (Leitern) | Sprossen nur Text |
|---|---:|---:|---:|---:|---:|---:|---:|
| planet | 26 | 180 | 0 | 1 | 11 | 14 | 179 |
| kosmos | 9 | 61 | 0 | 0 | 2 | 7 | 61 |
| leben | 33 | 223 | 2 | 0 | 19 | 12 | 221 |
| mensch | 84 | 569 | 2 | 3 | 34 | 45 | 564 |
| erleben | 40 | 274 | 2 | 5 | 20 | 15 | 267 |
| same | 28 | 198 | 0 | 2 | 23 | 3 | 196 |
| zusammenspiel | 33 | 213 | 0 | 2 | 15 | 17 | 211 |
| **Summe** | **253** | **1 718** | **6** | **13** | **124** | **113** | **1 699** |

Die 6 der Stufe A, Befehl, Gerät, Minuten:
- Befehl Radeon (Laptop): `node meisterkarte-quelle/punkte/punkte.cjs run --sha <kopf40> --geraet radeon --nur vegetation.K2#1,vegetation.K5#2,klang.K4#2,siedlung.K4#2,gelaende.K2#1` [q: ERSTE-RICHTER.md Z. 11]. GTX (OMEN): Zeile `<id> 2 punkte sha=<kopf40> geraet=gtx nur=<ids>` in `zug/warteschlange.txt` [q].
- Minuten je Station aus den Akten-Fenstern [m]: Radeon 337846dc kraft 132 s · jahreslauf 224 s · klang 106 s · palimpsest 169 s = 11,1 min (16:42:54–16:54:02); GTX 68d24688 kraft 87 s · jahreslauf 149 s · klang 102 s · palimpsest 129 s = 8,0 min (21:39:08–21:47:08). gelaende.K2#1 nie gefahren: Probe 10 s + Preis-Lauf 20 s + Referenz [s] ≈ 2 min je Gerät.

| Sprosse | Station | Probe [q] | Akten | Richter | Preis |
|---|---|---|---:|---|---|
| `leben.pflanzen.kraft` S 1 | vegetation.K2#1 | 16 s | 12 Messungen, 9 SHAs | GRÜN 12/12 | ROT 11/12, 1 FEHLT |
| `leben.pflanzen.jahreslauf` S 1 | vegetation.K5#2 | 90 s | 3 | GRÜN 3/3 | ROT 3/3 |
| `erleben.klang.ereignis` S 1 | klang.K4#2 | 10 s | 2 | GRÜN 2/2 | ROT 2/2 |
| `erleben.klang.ereignis` S 2 | klang.K4#2 (dieselbe Fahrt) | 10 s | 2 | GRÜN 2/2 | ROT 2/2 |
| `mensch.zeit.palimpsest` S 1 | siedlung.K4#2 | 33 s | 3 | GRÜN 3/3 | ROT 3/3 |
| `mensch.nahrung.erdbau` S 1 | gelaende.K2#1 | 10 s | **0** — in keiner `--nur`-Liste gefahren | — | — |

## 3 · Die 19 Kern-Sprossen: was je Sprosse zur Buchung fehlt (Frage 2)

Klasse = `klasse` der Sprosse in der Karte; ohne sie bucht `buche-2` nie (R-d). [q: ERSTE-RICHTER.md, richter-tafel.json, BRUECKE.md Z. 400–417; m: Akten]

| Sprosse | Klasse | Richter-Code | fehlt zur Buchung | Gerät · Minuten |
|---|---|---|---|---|
| `leben.pflanzen.kraft` S 1 | Ort | A | gepaarte Fahrt + Preis: nach GC GTX Heap 412,3 (−12) VRAM 133,2 (−15), Radeon VRAM 125,0 (−7), Radeon-Zeit in Ruhe (p95 58,7 bei f 1,24) | beide · 2,2 + 1,5 |
| `leben.pflanzen.jahreslauf` S 1 | Ort | A | gepaarte Fahrt + Preis: Heap nach GC 420–661, VRAM 133, größtes Bild 184–209 ms | beide · 3,7 + 2,5 |
| `erleben.klang.ereignis` S 1 | Ort | A | gepaarte Fahrt + Preis: Heap nach GC 461–491, VRAM 134–136, größtes Bild 433–569 ms; Stoff-Wahl beider Geräte gleich (stein ↔ quarz, ERSTE-RICHTER Z. 20) | beide · 1,8 + 1,7 |
| `erleben.klang.ereignis` S 2 | Ort | A | wie S 1 (dieselbe Fahrt) | 0 dazu |
| `mensch.zeit.palimpsest` S 1 | Ort | A | gepaarte Fahrt + Preis: VRAM nach GC 113 hält, Heap nach GC 493,6–628,2 (94–228 MB über 400), größtes Bild GTX 1 166,7 ms; Anteil alter Häuser als eigene Zahl im Wert | beide · 2,8 + 2,2 |
| `mensch.nahrung.erdbau` S 1 | Ort | A | erste Fahrt überhaupt (gelaende.K2#1 nie in `--nur`), Preis am Spatenstich | beide · ≈ 2 + 2 [s] |
| `same.entfaltung.akte` S 1 | Ort | B | Probe setzt 3 Taten, Sprosse verlangt 10² (Tafel „fehlt“) — Code an speicher.K4#2, dann Fahrt + Preis | beide · ≈ 3 + 3 [s] |
| `erleben.sinn.ziele` S 1 | Ort | B | Zehn-Taten-Folge mit dB am Ort und Nachbarzelle in die GPU-Probe affekt.K1#2 (heute headless affekt.K1#1) | beide · ≈ 2 + 2 [s] |
| `planet.kopplung.wetter-welt` S 3 | Ort | B | Pfützen r ≥ 0,5 in die GPU-Probe wetter.K2#2 + Gegenlauf (R7) | beide · ≈ 3 + 3 [s] |
| `same.preis.ankunft` S 1 | Ort | B | 4. Kalt-Boot je Gerät am Kopf (Skript fährt 3) + Preis der ersten Sekunden; Werte GTX 16,6 s (18.10.), Radeon ≈ 11 s (17.10.), nie am Kopf | beide · ≈ 6 + 6 [s] |
| `planet.wasser.kreislauf` S 1 | — | B | Klasse; Scheitel-Verzug gegen Erd-Band fehlt ganz; Bilanz nur headless | Code + beide |
| `planet.kopplung.wetter-welt` S 1 | — | B | Klasse; „Himmel grau“ als Zahl; Gegenlauf | Code + beide |
| `mensch.sport.koerper` S 1 | — | B | Klasse; Preis in Bewegung Radeon ROT (gehend 66 % > 33 ms) = Pflicht E | Pflicht E |
| `mensch.geist.tag` S 1 | — | B | Klasse; Preis am Dorfplatz Radeon ≈ 37 ms = Pflicht E | Pflicht E |
| `erleben.spieler.rolle` S 1 | — | B | Klasse; Preis in Bewegung Radeon ROT = Pflicht E | Pflicht E |
| `mensch.stadt.siedlungsnetz` S 1 | — | B | Klasse (Umfang „bis Kleinstadt“ = Stadt → Ankunft ≤ 5 s) = Pflicht B | Pflicht B |
| `erleben.klang.raum` S 1 | — | B | Klasse; ILD/ITD am Abgriff beider Geräte (heute headless klang.K3) | Code + beide |
| `erleben.klang.raum` S 2 | — | B | Klasse; RT60 am Abgriff beider Geräte | Code + beide |
| `erleben.klang.landschaft` S 1 | — | B | Klasse; Klang-Zensus am Abgriff (heute headless) | Code + beide |

## 4 · Brücke: alte Station misst schon den neuen Richter (Frage 3)

Paare, bei denen die Station wörtlich den Richter misst [q: richter-tafel.json „gleich“]:

| alte Station | Sprosse | ohne neue Fahrt buchbar? |
|---|---|---|
| vegetation.K2#1 | `leben.pflanzen.kraft` S 1 | nein |
| vegetation.K5#2 | `leben.pflanzen.jahreslauf` S 1 | nein |
| klang.K4#2 | `erleben.klang.ereignis` S 1 und S 2 | nein |
| gelaende.K2#1 | `mensch.nahrung.erdbau` S 1 | nein |
| siedlung.K4#2 | `mensch.zeit.palimpsest` S 1 | nein |

Ohne neue Fahrt buchbar: **0 Punkte** [m]. Ursache: Z2 bucht nur die Fahrt am Kopf mit Preis beider Geräte; die grünen Hälften in `stand.json` stammen aus verschiedenen SHAs und tragen keinen Preis (ERSTE-RICHTER.md Z. 8). Neuer Kern über die Brücke: **0** — die drei geprüften Anwärter (`erleben.bild.himmel` S 3, `erleben.spieler.praesenz` S 1, `erleben.bild.ferne` S 1) verlangen mehr als die Station (ERSTE-RICHTER.md Z. 36) [q]. Die Brücke hat ihr Werk getan: 19 Kern; jeder weitere Schritt ist eine Fahrt.

## 5 · Die kleinste Menge Fahrten, gereiht nach Sprossen je GPU-Minute (Frage 4)

| # | Fahrt | Sprossen | Radeon min | GTX min | Sprossen/GPU-min Radeon · GTX | bucht heute |
|---:|---|---:|---:|---:|---|---|
| 1 | Karten-Sitzung `--nur vegetation.K2#1,vegetation.K5#2,klang.K4#2,siedlung.K4#2,gelaende.K2#1` am selben Kopf, ohne Weichen | 6 | 11,1 [m] + 2 [s] = 13 | 8,0 [m] + 2 [s] = 10 | 0,46 · 0,60 | 0 Punkte (Preis R-a), Wert: erste gepaarte Fahrt, misst den Rest-Abstand am selben SHA |
| 2 | dieselbe mit `buche-2` nach GC (R-b, Code, keine GPU) | 6 | 0 | 0 | — | 0 (VRAM nach GC 123–136 > 118) |
| 3 | `same.preis.ankunft` S 1: 4 Kalt-Boots je Gerät | 1 | ≈ 6 [s] | ≈ 6 [s] | 0,17 · 0,17 | Kern bleibt Kern bis Preis |
| 4 | speicher.K4#2 mit 100 Taten, affekt.K1#2 mit Zehn-Taten-Folge, wetter.K2#2 mit Pfützen + Gegenlauf (je erst Code) | 3 | ≈ 8 [s] | ≈ 8 [s] | 0,38 · 0,38 | 0 bis Preis |

Die Reihenfolge entscheide ich: **Fahrt 1 vor allem anderen**, weil sie mit 23 GPU-Minuten 6 Sprossen auf einen SHA stellt und den Preis-Abstand beider Geräte gleichzeitig misst. Der Punkt selbst hängt am VRAM der Mess-Wiese (−7 bis −15 MB nach GC) — das ist Pflicht E, kein Karten-Werk.

## 6 · Die FRONT: 29 Leitern, nach denen das nächste Konto steuert (Frage 5)

253 Leitern steuern nicht: 1 699 Sprossen sind Text, 1 708 haben keine Klasse. Die Front nimmt jedes Kapitel, jede Station der Ziellinie v1.0 (docs/roadmap.md §0.v1: Ankommen · Laufen+Sehen · Bauen · KI erschaffen · Benutzen/Teilen · FPS-Boden 33 ms / 118 MB VRAM) und jeden Pflicht-OFFEN-Eintrag (BRUECKE.md Z. 388–394). Je Leiter die nächste Sprosse (heute 0 → S 1, bei Glieder-Leiter die genannte) und ihr Richter wörtlich gekürzt [q: `meisterkarte-2.json`].

| # | Kapitel | Leiter | Sprosse | Richter (Karte) | Klasse | Stufe | Anker |
|---:|---|---|---|---|---|---|---|
| 1 | leben | `leben.pflanzen.kraft` | S 1 | zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit | Ort | A | v1 Laufen+Sehen (Wiese) · E |
| 2 | leben | `leben.pflanzen.jahreslauf` | S 1 | Pixelanteil der Krone im Zeitraffer (Klassen-Maske) | Ort | A | v1 Sehen (Wald) |
| 3 | leben | `leben.pflanzen.dichte` | S 1 | Ring-Bildanteil gegen Foto; Bildpaar gegen REF real-mischwald | — | C | Pflicht A |
| 4 | mensch | `mensch.nahrung.erdbau` | S 1 | Graben gefüllt ≤ 2 s | Ort | A | v1 Bauen (Wasser folgt) |
| 5 | mensch | `mensch.zeit.palimpsest` | S 1 | Häuserzahl über 1 500 s steigt, alte ≥ 0,9 erhalten | Ort | A | v1 Sehen (Ort lebt) |
| 6 | mensch | `mensch.bau.bauen` | S 1 | Bildpaar Labor ↔ Welt gleiche Kamera: kein Unterschied | — | C | v1 Bauen |
| 7 | mensch | `mensch.bau.huelle` | S 1 | Paarvergleich Spiel ↔ Foto bei 10 m: „Foto“ ≥ 5 % | — | C | Pflicht A |
| 8 | mensch | `mensch.netz.verkehr` | S 1 (Pflicht auf S 2) | 2-km-Route 0 Steckenbleiber, Bild p95 ≤ 33 ms während der Fahrt | — | C | Pflicht C |
| 9 | mensch | `mensch.sport.arena` | S 1 | Blickrichtungen folgen dem Geschehen ≥ 80 % | — | C | Pflicht F |
| 10 | mensch | `mensch.sport.koerper` | S 1 | Tempo und Sprunghöhe im Spiel gegen Eichwert ± 10 % | — | B | v1 Laufen · E |
| 11 | mensch | `mensch.geist.tag` | S 1 | Zeitraffer 24 h: Soll-Orte ≥ 0,9; Schmiede 10 Uhr besetzt / 2 Uhr leer | — | B | E |
| 12 | mensch | `mensch.stadt.siedlungsnetz` | S 1 | Stadt binnen 2 km in ≥ 6/8 Spawns; Zipf ζ ∈ [0,8; 1,2] | — | B | Pflicht B (Klasse Stadt) |
| 13 | erleben | `erleben.klang.ereignis` | S 1, S 2 | Spektralschwerpunkt je Stoff ≥ 300 Hz getrennt · Motor/Landung/Doppler r | Ort | A | v1 Benutzen (fahren) |
| 14 | erleben | `erleben.sinn.ziele` | S 1 | dieselbe Tat 10×: Antwort am Ort fällt auf ≤ 30 %, Nachbarzelle 0 | Ort | B | v1 Benutzen |
| 15 | erleben | `erleben.spieler.rolle` | S 1 | 15 min je Verb-Gruppe ≥ 1 sichtbare Weltänderung, Bildpaar | — | B | v1 Benutzen · E |
| 16 | erleben | `erleben.schoepfen.satz` | S 1 | Korpus ≥ 40 Sätze im echten Fenster: gültig ≥ 95 %, Absicht ≥ 85 %, 0 Hänger > 100 ms | — | C | v1 KI erschaffen (Drehbuch 18) |
| 17 | erleben | `erleben.schoepfen.teilen` | S 1 | Export/Import: Bildpaar an gleicher Pose gleich | — | C | v1 Teilen |
| 18 | erleben | `erleben.bild.ferne` | S 1 | Restkontrast je Kanal gegen Koschmieder 0,8–1,2; Ferne = Nähe ≥ 0,8 an 12 Posen | — | C | v1 Sehen (Ferne) · A |
| 19 | erleben | `erleben.klang.raum` | S 1 | Pegel- und Laufzeitunterschied am Abgriff an 24 Quellenlagen (100 %) | — | B | v1 Laufen |
| 20 | same | `same.preis.ankunft` | S 1 (Pflicht auf S 4) | t(Kontrolle) von außen, ≥ 4 Kalt-Boots je Gerät | Ort | B | v1 Ankommen · Pflicht B |
| 21 | same | `same.preis.takt` | S 1 | werkbank lauf, 4 Boots je Gerät | — | C | FPS-Boden · Pflicht E |
| 22 | same | `same.preis.speicher` | S 1 | Heap- und VRAM-Kurve über 5 min Spielgang | — | C | 118 MB VRAM · Pflicht E (R-a) |
| 23 | same | `same.entfaltung.akte` | S 1 | Bildpaar vor ↔ nach Reload ≤ 1 % Diff mit Pflicht-Inhalt | Ort | B | v1 Teilen (Speicher) |
| 24 | planet | `planet.wasser.kreislauf` | S 1 | Pegel nach Sturm im Bild; Scheitel-Verzug im Erd-Band; Regen × Fläche ↔ ΔVolumen ±10 % | — | B | v1 Sehen (Wasser) |
| 25 | planet | `planet.wasser.seegang` | S 1 | spiegelTreue ≥ 0,6 an 12 Posen (Uhr × Wetter) | — | C | Pflicht A · v1 Wasser |
| 26 | planet | `planet.relief.grossform` | S 1 | an 20 Orten nachgefahren: 100 % der Läufe enden in See oder Meer | — | C | v1 Laufen+Sehen |
| 27 | kosmos | `planet.kosmos.himmelsmechanik` | S 1 | Sprung ≤ 0,1 EV je Uhrschritt über die ganze Bahn, Ego und Third, beide Geräte | — | C | v1 Sehen (Himmel) · A Uhr |
| 28 | kosmos | `planet.kosmos.welten` | S 1 | Licht-Bilanz an der Kugel 5–12,5 an beiden Welten; Fremdwelt-Mittag: Zenit nicht blau | — | C | Planet-Welle (w28-planet-kern) |
| 29 | zusammenspiel | `planet.kopplung.wetter-welt` | S 3, S 1 | Luma porös nass/trocken 0,5–0,8; Pfützen r ≥ 0,5 · Bildpaar klar/Sturm | Ort (S 3) | B | v1 Sehen (Wetter) |

Kapitel vertreten [m]: planet 3 · kosmos 2 · leben 3 · mensch 9 · erleben 7 · same 4 · zusammenspiel 1. Davon tragen heute 9 Leitern eine Klasse an der nächsten Sprosse; die übrigen 20 brauchen die Klasse aus R5 (ein Daten-Schnitt in `meisterkarte-2.json`, keine GPU), bevor eine Fahrt je buchen kann.

## Rechenweg

- Akten: `git archive origin/koordination vision` (ef587494) in den Scratch, node über `vision/richter/*.json` (Felder `sha`, `datum`, `geraete[].richter.urteil`, `preis.{bild_p95_ms,bild_max_ms,heap_mb,vram_mb,referenz.f,posten.heap_mb,posten.vram_mb,fenster}`).
- Karte: node über `meisterkarte-2.json` (`gruppen[].kriterien[].fuss`, `sprossen[].klasse`), `BRUECKEN_KERN` aus `buche-2.cjs:68–85`.
- Radeon-Sitzungen: `C:/Users/micha/AppData/Local/Temp/claude/w4/radeon-nie-leer.log` Z. 611–735 (grep „offene Stationen am “ 33, „ABGEBROCHEN“ 27).
- Die Messungen der Radeon an a6555b12 … 8ddf3de9 (15.11.) stammen aus den Preis-Läufen der Welle „Preis des Orts“ (a648be7d, af097591), nicht aus der Karten-Sitzung.

Geschnitten: nichts am Code — Befund: drei Riegel mit Täter (Preis VRAM/Heap, Code urteilt Spitze statt nach GC `buche-2.cjs:178`, keine gepaarte Fahrt), dazu Klasse an nur 10 von 1 718 Sprossen; Front mit 29 Leitern.
Gemessen: 22 Gerät-Messungen, Richter GRÜN 22/22, Preis ROT 21/22 (1 ohne Urteil); VRAM nach GC 113–136 MB gegen 118; Radeon-Karten-Sitzung 27 von 33 Starts abgebrochen; Richter als Code 6 · Teil-Code 13 · nur Text 1 699 Sprossen; über die Brücke buchbar 0.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
