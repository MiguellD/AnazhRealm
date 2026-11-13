# B — die Meisterkarte am Kopf a41ce72d (219/330), nur gelesen

Quellen (alle nur gelesen): `w3/pm/meisterkarte.json` (summe 219, max 330, kopf a41ce72d, stand 2026-11-13) · `w3/pm/meisterkarte-quelle/punkte/stand.json`
(je, zeit 2026-11-13T15:38:47Z) · `…/punkte/messung/*.json` (434 Dateien, letzte Urteile je Station × Gerät) · `…/punkte/punkte.cjs:4063–4106`
(Regel) · `git log -- meisterkarte.json` im Baum w3/pm · `C:\Users\micha\AppData\Local\Temp\claude\w4\buche-je-scheibe.log` · `w3/pm/FUND-REGISTER.md`.
Regel (punkte.cjs:4063 `stufen`): je Kriterium 2 Punkte; Staffel 1 = Station `#1`, GRÜN an EINEM Gerät genügt (außer `beide`); Staffel 2 = Station `#2`,
GRÜN an ALLEN Geräten und nur, wenn Staffel 1 hält. Keine `#2`-Station → der zweite Punkt ist für die Maschine unerreichbar. Die Ratsche
(punkte.cjs:4076) hält ein gebuchtes GRÜN, solange keine frische Messung ROT sagt; R6 (Linse/Konsum/Station seit der Messung geändert) macht
eine Messung „ungemessen“.

## 1. Gebucht je Klasse (Gruppen der Karte, `meisterkarte.json` gruppen/bereiche; Punkte = `bereiche[].kriterien[].punkte`, je Kriterium max 2)

| Gruppe (Summe) | Bereich gebucht/10 |
|---|---|
| I physis 42/50 | gelaende 8 · wetter 9 · physik 7 · stoffe 9 · feld 9 |
| II leben 48/70 | vegetation 3 · tiere 8 · oekologie 10 · mensch 6 · affekt 6 · haar 5 · luftwasser 10 |
| III sicht 23/50 | licht 4 · ferne 6 · material 5 · schatten 5 · lod 3 |
| IV schoepfung 31/40 | studios 6 · pipeline 9 · ki 7 · bauen 9 |
| V wege 50/70 | tore 3 · fahrzeug 8 · siedlung 9 · leib 6 · halten 10 · spielgang 5 · ultiversum 9 |
| VI fundament 25/50 | ankunft 1 · streaming 5 · profiband 0 · klang 9 · speicher 10 |
| **Summe** | **219/330** — offen 111 Punkte in 83 Kriterien |

Was die 111 offenen Punkte sperrt (aus stand.json `je[].stationen` + `beleg`):
- **58 Punkte haben KEINE Station**, keine Messung kann sie buchen: 43 Staffel-2-Punkte ohne `#2`-Station (z. B. haar.K1, lod.K2, schatten.K2–K4,
  ankunft.K2), 9 Staffel-2 „kein Werkzeug (fehlt)“ (gelaende.K3, wetter.K4, stoffe.K1, mensch.K1, material.K2, lod.K3, pipeline.K5, ki.K5, tore.K5),
  6 aus drei Kriterien ganz ohne Maschine (tore.K2, tore.K4, spielgang.K2).
- **53 Punkte haben eine Station.** Von 101 nicht-grünen Paaren Station × Gerät sind nur 4 frisch ROT; der Rest steht „ungemessen“: R6 Konsum 57,
  Station geändert 25, R6 Linse 13 — mit dem Begleit-Grund „die Fahrt riss 1800 s (vor ankunft.K4#1)“ 24, Fremd-Last 19, GPU-Schloss nie bekommen 11,
  Deckel gerissen 11, Welt der Sitzung trägt/startet nicht 5 (Zählung über `grund`, Mehrfachnennung möglich).
- Die GTX misst profiband.K1–K3 zuletzt am 07.11. (messung `185e99bb-gtx.json`), profiband.K5 am 05.11.

## 3. Die 15 billigsten Punkte (Ist aus der jeweils letzten Messung in messung/*.json; Reihenfolge = meine Lesart des Abstands)

1. vegetation.K4 +1 (#2): alle Maße 0 px (Halm im Haus/Wasser), einziges ROT „1 gesetzt über die Werkstatt false“ (beide Geräte, 13.11.).
2. licht.K3 +1 (#2): 27 von 33 Werten 0,917–1,056 im Soll 0,9–1,1; nur fichte/tanne „Karte und Gestalt teilen kein Pixel“ (GTX a41ce72d, 13.11.).
3. klang.K5 +1 (#2): GTX gehalten GRÜN; Radeon gehen 0,21 / nacht 0,22 / fahrt 0,35 gegen ≤ 0,2 ms (dc9eacb0, unter Last f 1,277).
4. mensch.K4 +2 (#1, #2 headless gehalten): GTX GRÜN 12.11. (4d52c7bc), Radeon GRÜN 12.11. 21:18 (507beba6), ROT 13.11. gesicht 0,833 < 1 — ein GRÜN an einem Gerät am Kopf bucht 2.
5. material.K1 +1 (#1): 11/13; fels 1,1056 gegen ≤ 1,1 (+0,5 %), boden 1,296 (+18 %) (beide, 13.11.).
6. vegetation.K5 +1 (#2): GTX gehalten; Radeon nur Abnahme-ROT „Blickziel verdeckt von baum_tanne in 46 m“ (Pose, 13.11.).
7. leib.K3 +1 (#2): GTX gehalten; Radeon nur „Höhle: Abfall 0,01 außerhalb [0,06; 0,25] (Himmel am Auge 0)“ (1cd1c408, 13.11.).
8. tiere.K1 +1 (#2): Karte (a)–(d) GRÜN; Bild-Serie „Herde am Hang“ ROT (4 sichtbar, 2 Flecken) 13.11., mit denselben Karten-Zahlen GRÜN am 12.11. (350e6b11).
9. physik.K2 +1 (#2): 20/20 ohne Durchtritt; 2 Verstöße „Bild ≠ Kollision“, Bär Spalt 0,033 m (beide, 13.11.).
10. vegetation.K1 +1 (#1): Saum-Sprung 5–10 m −16,9 % (GTX fd5df4bf) / −18,3 % (Radeon) gegen ≤ 15 %; GRÜN zuletzt 12.11. (GTX, 4d52c7bc).
11. schatten.K5 +1 (#1): 0,60:1 gegen ≥ 3:1 am 13.11. (Spieler 3,9 m), GRÜN 5,28:1 am 12.11. (Spieler 9,4 m, 350e6b11) — die Pose wandert.
12. ankunft.K3 +1 (#1): Radeon warm Median 5,88 s gegen ≤ 5 s (2d5f4146, 10.11.); GTX „Werkbank startet nicht“ (13.11.).
13. haar.K2 +1 (#1): strich 0,318 / 0,311 gegen ≥ 0,3554 (−10 %), „albedo veraltet seit 66eb3576“ (beide, 13.11.).
14. ferne.K3 +1 (#1): Kohärenz 0,367 gegen < 0,3 (Radeon 13.11.); GRÜN 0,202 am 10.11. (067bd771).
15. affekt.K4 +1 (#1): 6 falsch gegen 0 (headless 6aa7a5a6, 10.11.); GRÜN mit 0 falsch am 06.11. (d3708675).

## 4. Gefallen seit 05.11. (Punkte jetzt < Höchststand seit 05.11. 00:49; aus den Buchungs-Commits von meisterkarte.json, 13 Punkte)

| Kriterium | fiel | Commit · Kopf | Täter (Quelle) |
|---|---|---|---|
| vegetation.K1 1→0 | 13.11. 07:32 (zuvor 4× hin und her seit 08.11.) | 8e6bfcb41 · dc9eacb0 | w28-halm-trieb (Landung b560adaf): −14,1 % → −18,3 % (FUND-REGISTER Z. 193, 224) |
| mensch.K4 2→0 | 13.11. 07:32 (auch 10.11., 11.11. zurück) | 8e6bfcb41 · dc9eacb0 | Radeon gesicht 0,833 < 1; Täter weiß ich nicht (FUND Z. 28/120: das Gesicht an der Spiel-Kamera ist an der Auflösungsgrenze) |
| affekt.K4 1→0 | 10.11. 13:45 | 701f1cd53 · 6aa7a5a6 | 6 falsch; FUND Z. 24 (feld-nexus `invalid_position`) ist ein älterer Befund — Täter des 10.11. weiß ich nicht |
| vegetation.K5 2→1 | 10.11. 17:55 | 6135f7674 · 2d5f4146 | Radeon: Blickziel von baum_tanne verdeckt; Täter weiß ich nicht |
| material.K1 1→0 | 10.11. 17:55 | 6135f7674 · 2d5f4146 | FUND Z. 119: TERRAIN_BUMP aus w27-boden-nah-2 (z358) hebt fels/boden > 1,1; Z. 118 Albedo-Stempel veraltet |
| ferne.K3 1→0 | 10.11. 17:55 | 6135f7674 · 2d5f4146 | FUND Z. 131: die Station misst am Ort des Auto-Dorfs; den Täter des Falls nennt sie nicht |
| schatten.K5 1→0 | 10.11. 17:55 | 6135f7674 · 2d5f4146 | weiß ich nicht |
| streaming.K1, K2 je 1→0 | 06.11. 00:53 | 89ca20c96 · 3f1d4a5b | FUND Z. 69: Station w12-dorf-probe (834b272a) fährt mit wachsenden Orten |
| haar.K2 1→0 | 07.11. 00:35 | fdbe413ff · 94d9c5a6 | FUND Z. 41: Albedo-Zeile veraltet seit baf9d828 |
| leib.K1 1→0 | 07.11. 15:48 | 9e49c6637 · 95ba6fd6 | weiß ich nicht (ego/gehen p95 67,8 ms gegen ≤ 50) |
| profiband.K4 1→0 | 11.11. 19:25 | 7c7123ebb · b0112f7b | weiß ich nicht (GTX zuletzt 07.11. 449,9 ms > 100) |

**221 → 219:** Veröffentlicht stand 221 zuletzt um 13.11. 06:22 (Commit 8a510baf3, Log „GEBUCHT 221/330 am Kopf dc9eacb0“). Um 07:32 kam 219 (Commit
8e6bfcb41, Log Z. 183 „GEBUCHT 219/330“): **mensch.K4 2→0 und vegetation.K1 1→0** (−3), dazu spielgang.K3 0→1 (+1, das war um 06:09 gefallen).
Die Log-Zeilen 06:35–07:30 davor sagen „nicht gebucht (BUCHE_FALL=1 bucht einen echten Fall)“; wie 07:42 dann doch gebucht wurde, weiß ich nicht.
Verlauf: 195 (05.11. 00:49) → 218 (07.11. 09:17) → **224 Höchststand** (09.11. 20:28, Kopf da0e790f) → 212 (10.11. 17:55, 11 Kriterien auf einmal)
→ 221 (12.11. 01:22) → 219. Seit dem 07.11. 09:17: +1.

## 5. Liegende Zweige (`ls-remote 'refs/heads/w28-*'`: 92 Köpfe; nicht in main a41ce72d bzw. nicht in punkte-maschine 22edc0e5), nur wo Name/Betreff es sagt

| Zweig · Kopf | Art | offenes Kriterium |
|---|---|---|
| w28-richter-hand3-pm 8afcd41a | pm, liegt | bauen.K5 (der Mess-Halt `wetterHalten` verweigert Werke); nennt bauen.K1#2 — dass er auch vegetation.K4#2 („gesetzt über die Werkstatt false“) heilt, ist meine Vermutung |
| w28-dorf-innen-leicht-pm 6c090fc8 | pm, WIP | siedlung.K1#2 |
| w28-baum-wechsel 37526fb7 + -pm f7bceb09 | WIP + Station | lod.K5#1 |
| w28-wiese-mitte c87c33e5 · w28-samen-wiese 21b1e6ec | WIP | vegetation.K1 (FUND Z. 224 nennt wiese-mitte für vegetation.K1#1) |
| w28-karte-gestalt 8e308c2b · w28-karte-stamm d95fe9b4 · w28-samen-karten-stufe 5d6f899e · w28-laub-luma 8f62f28f | WIP | lod.K1 / Pflicht A laub-kante (Betreff „Kante“, „Karte“) |
| w28-samen-lichtweg d8887125 | WIP, Befund | licht.K3 (Lichtweg) |
| w28-stadt-grammatik 22872718 | Abgabe, liegt | Pflicht C / fahrzeug.K2#2 (Verkehr hält an 10 und 23 Uhr) |
| w28-platte-fein 02c27132 · w28-weltbild-kalt bdb060ad | Abgabe / WIP | Pflicht B / ankunft.K1 (Probe zeit:gate:ankunft, Boot-Platte) |
| w28-pm-zeuge-pm 2634387c | pm, liegt | kein Kriterium, die Klasse „Welt der Sitzung trägt nicht“ (5 Paare) |
| w28-reibellipse 92879eab | WIP geparkt | leib.K5 — schon 2/2 gebucht |
Körper-Zweige (w28-leib-genom, -griff-ellbogen, -mensch-stufe, -bevoelkerung-gesetz) und Stoff-Zweige (-fassade, -stoff-fuge, -stoff-stufe-null): welches Kriterium, sagt der Betreff nicht.

## 6. Pflicht-OFFEN in der Karte (`meisterkarte.json` pflicht.eintraege, `punkte/pflicht.json`)

| Eintrag | Kriterien der Karte | Kartenpunkte | Paare grün | ohne Richter |
|---|---|---|---|---|
| A AAAA je Klasse | haar.K1 (1/2), haar.K2, lod.K1, mensch.K4 | 1/8 | 2/8 | Uhr × Sicht; ankunft.K4 ohne Werkzeug |
| B Ankunft | ankunft.K1 | 0/2 | 0/4 | — |
| C Verkehr | pflicht.C (ohne Kartenpunkte); fahrzeug.K2#2 misst C mit | 0 (+1 über fahrzeug.K2) | 0/1 | E im Verkehr |
| E Profi-Band | profiband.K1–K3 + pflicht.E | 0/6 | 0/8 | das ABAB |
| F Prüfplatz | keine | 0/0 | 0/0 | jede Zone |
An Pflicht-Einträgen hängen 16 Kartenpunkte (+1 über fahrzeug.K2), gebucht 1.

## Der kürzeste Weg — MEINE LESART, nicht gemessen

1. 58 der 111 Punkte kann keine Messung buchen; sie fallen nur durch gebaute Stationen. Mehr Messen bewegt höchstens die 53.
2. Von den 53 Punkten fehlt bei 5 Punkten in vier Kriterien nur ein frisches GRÜN an EINEM Gerät (mensch.K4 +2, vegetation.K5, leib.K3, klang.K5 je +1). Dafür braucht es eine ganze frische Fahrt am Kopf auf Radeon UND GTX.
3. Diese Fahrt stirbt heute an ankunft.K4#1 (24 Paare „Fahrt riss 1800 s“) und am GPU-Schloss (11 Paare): die Station umsetzen oder ans Ende stellen, sonst wird nichts frisch.
4. Am Abstand billig: vegetation.K4#2 (eine Werkstatt-Setzung, Halt-Zweig liegt), licht.K3#2 (fichte/tanne-Pose), material.K1 fels +0,5 %.

---

## 2. ALLE offenen Kriterien (83 Kriterien, 111 Punkte), nach Nähe zu GRÜN

Zustand = stand.json (ungemessen = R6/Deckel); Ist = letzte Messung der nächsten Staffel in messung/*.json (Gerät, Datum, Kopf). Station = `<id>#<Staffel>`
in `meisterkarte-quelle/punkte/stationen/g1–g6.js`.

| # | Id | Wortlaut kurz | geb. | Zustand (nächste Staffel) | Ist ↔ Soll (Gerät, Datum, Kopf) |
|---|---|---|---|---|---|
| 1 | vegetation.K4 | Natur-Wand: kein Halm im Haus/Wasser | 1/2 | #2: gtx ROT frisch, radeon ungemessen | beide: Maße 0 px, „1 gesetzt über die Werkstatt false“ ↔ 0 Fehler (13.11., 1e00bfdb/dc9eacb0) |
| 2 | licht.K3 | EIN Lichtweg, gleich hell | 1/2 | #2: gtx ROT frisch (a41ce72d) | 27/33 in 0,9–1,1; fichte/tanne „teilen kein Pixel“ |
| 3 | klang.K5 | Kosten am Hörbaren | 1/2 | #2: gtx GRÜN gehalten, radeon ungemessen | radeon 0,21/0,35/0,22 ↔ ≤ 0,2 ms (13.11., dc9eacb0) |
| 4 | mensch.K4 | Körper, Vielfalt, Ausdruck | 0/2 | #1: beide ungemessen (#2 headless gehalten) | radeon gesicht 0,833 ↔ 1 (13.11.); gtx GRÜN (12.11., 4d52c7bc) |
| 5 | material.K1 | Albedo im realen Band | 0/2 | #1: beide ungemessen | 11/13; fels 1,1056, boden 1,296 ↔ 0,9–1,1 (13.11.) |
| 6 | vegetation.K5 | Jahreszeit als Gestalt | 1/2 | #2: gtx GRÜN gehalten, radeon ungemessen | radeon Abnahme ROT: Blickziel verdeckt (baum_tanne 46 m) (13.11.) |
| 7 | leib.K3 | Wasser und Höhle | 1/2 | #2: gtx GRÜN gehalten, radeon ungemessen | radeon Höhle-Abfall 0,01 ↔ [0,06; 0,25] (13.11., 1cd1c408) |
| 8 | tiere.K1 | Verband, Alarm-Kette | 1/2 | #2: beide ungemessen | Bild-Serie Hang ROT 4 sichtbar/2 Flecken (13.11.); GRÜN 12.11. (350e6b11) |
| 9 | physik.K2 | Kontakt ohne Durchdringen | 1/2 | #2: beide ungemessen | 2 Verstöße Bild ≠ Kollision, Bär Spalt 0,033 m (13.11.) |
| 10 | vegetation.K1 | Wiese dicht bis zum Saum | 0/2 | #1: beide ungemessen | Saum 5–10 m −16,9 % (gtx) / −18,3 % (radeon) ↔ ≤ 15 % (13.11.) |
| 11 | schatten.K5 | Nachts wirft das Feuer | 0/2 | #1: radeon ungemessen | 0,60:1 ↔ ≥ 3:1 (13.11.); 5,28:1 GRÜN (12.11.) |
| 12 | ankunft.K3 | Wiederkehr warm | 0/2 | #1: beide ungemessen | radeon 5,88 s ↔ ≤ 5 s (10.11.); gtx Werkbank startet nicht (13.11.) |
| 13 | haar.K2 | Haar aus dem Gesetz | 0/2 | #1: beide ungemessen | strich 0,318/0,311 ↔ ≥ 0,3554, albedo veraltet (13.11.) |
| 14 | ferne.K3 | Grate tragen einen Saum | 0/2 | #1: radeon ungemessen | Kohärenz 0,367 ↔ < 0,3 (13.11.); GRÜN 0,202 (10.11.) |
| 15 | affekt.K4 | Die Stimme des Felds | 0/2 | #1: headless ungemessen | 6 falsch ↔ 0 (10.11., 6aa7a5a6) |
| 16 | studios.K2 | Griff → Bild ohne Warten | 1/2 | #2: beide ungemessen | 7/8 (radeon), 6/8 (gtx); Neubau koerperstudio 4253–6468 ↔ ≤ 1000 ms (13.11.) |
| 17 | profiband.K4 | Glätte: keine Hänger | 0/2 | #1: beide ungemessen | radeon GRÜN max 58,8 ↔ < 100 ms (13.11., dc9eacb0); gtx ROT 449,9 ms (07.11.) |
| 18 | leib.K4 | Kamera zu Fuß | 1/2 | #2: beide ungemessen | Ruck p95 0,038 ↔ ≤ 0,02 m; Nah-Pixel in 1 Probe (13.11.) |
| 19 | siedlung.K1 | Haus von innen | 1/2 | #2: beide ungemessen | Innen-Bild 5/18, Median 0,083 ↔ ≥ 0,15 (13.11.) |
| 20 | lod.K1 | Umriss hält in jeder Stufe (A) | 0/2 | #1: gtx ROT frisch, radeon ungemessen | Tafel-Pose „tanne fehlt“; Spielgang strauch 0,2757 ↔ ≤ 0,22 (13.11., a41ce72d) |
| 21 | leib.K1 | Eingabe-Latenz | 0/2 | #1: beide ungemessen (#2 gtx ROT 169 ms) | ego/gehen 67,8 ↔ ≤ 50 ms (13.11.) |
| 22 | tore.K1 | Durchgang Studio-/Welt-Tor | 0/2 | #1: beide ungemessen | t 2907–8190 ↔ ≤ 2000 ms, Frame max 452–691 ↔ 100 (13.11.) |
| 23 | bauen.K1 | Wille → Werk ≤ 1 s | 1/2 | #2: beide ungemessen | werkstatt kalt 3383–3451 ↔ ≤ 1000 ms, 6/8 Werke (12./13.11.) |
| 24 | licht.K2 | Licht-Bilanz an der Kugel | 1/2 | #2: beide ungemessen | Uhr 0,27/0,73: 0,95/1,04 ↔ ≥ 2,5, mehrere UNGÜLTIG (13.11.) |
| 25 | licht.K1 | Tag-Kurve über die ganze Bahn | 0/2 | #1: gtx ungemessen | TAG-ACHSE ~1 Stufe neben REF (13.11., fd5df4bf) |
| 26 | lod.K5 | Fehler ≤ 1 px am Wechsel | 0/2 | #1: beide ungemessen | Baum 3,12 px ↔ ≤ 1 px (13.11.) |
| 27 | ankunft.K1 | Kalt bis zur Kontrolle (B) | 0/2 | #1: beide ungemessen | gtx 12,03 s ↔ 10 (11.11.); radeon 12,95 s ↔ 5, Bild nicht ganz (13.11.) |
| 28 | ankunft.K5 | Lade-Bild lebt | 0/2 | #1: radeon ungemessen | längste Aufgabe 494 ↔ ≤ 250 ms; Faden belegt 11,95 ↔ ≤ 4 s (13.11.) |
| 29 | streaming.K1 | Keine Lücke unter Tempo | 0/2 | #1: headless ungemessen | 1263/1780 Bilder mit Lücke bei 63,8 m/s ↔ 0 (07.11.) |
| 30 | streaming.K2 | Fertig vor Bedarf | 0/2 | #1: headless ungemessen | karte 71,2 % / baum 82,2 % ↔ ≥ 95 % (07.11.) |
| 31 | profiband.K1 | Flüssig in Bewegung (E) | 0/2 | #1: beide ungemessen | radeon 58,3/83,7 ↔ ≤ 33 ms (13.11.); gtx 50,0 (07.11.) |
| 32 | profiband.K2 | CPU-Takt als Belegung (E) | 0/2 | #1: beide ungemessen | radeon 32,0–32,3 ↔ ≤ 5,8 ms (13.11.); gtx 9,1–14,8 (07.11.) |
| 33 | profiband.K3 | GPU-Haushalt (E) | 0/2 | #1: beide ungemessen | gpu-bank 19,9/26,7 ↔ ≤ 12 ms, VRAM 129–139 ↔ 118 MB (13.11.) |
| 34 | profiband.K5 | Ausdauer 20 min | 0/2 | #1: beide ungemessen | am Stück 14,08 ↔ 20 min (radeon 13.11.); gtx Bild-p95 91,7 (05.11.) |
| 35 | vegetation.K3 | Wald von innen | 0/2 | #1: radeon ungemessen | Stämme/ha 24 ↔ 370–900 (13.11.) |
| 36 | studios.K3 | Kosten-Wahrheit am Griff | 1/2 | #2: beide ungemessen | 0/7 Mesh-Studios ±5 % (radeon 08.11., gtx 30.10.) |
| 37 | studios.K4 | Studio = Welt im Bild | 0/2 | #1: beide ungemessen | 0/7, Bild-Differenz 23,9–46,1 % ↔ ≤ 2,1 % (13.11.) |
| 38 | fahrzeug.K2 | Wegenetz trägt das Rad (C) | 1/2 | #2: beide ungemessen | Verkehr: 0 Ankünfte, Fenster 12 s < Frist 30 (13.11.) |
| 39 | spielgang.K5 | Sprache des Spielers | 1/2 | #2: headless ungemessen | Selbsttest 3/3 ROT (10.11., 6aa7a5a6) |
| 40 | gelaende.K2 | Wasser folgt jedem Edit | 1/2 | #2: beide ungemessen | letztes Urteil ROT 29.10. (98ef98bb), seitdem Deckel gerissen |
| 41 | ankunft.K4 | Erster Blick AAAA am Spawn (A) | 0/2 | #1: beide ungemessen (R10) | nie gemessen; Deckel reißt bei POSE ego-0 |
| 42 | gelaende.K3 | Wasser-Bild an jeder Pose | 1/2 | #2 kein Werkzeug (fehlt) | — |
| 43 | wetter.K4 | Schnee-Decke mit Tiefe | 1/2 | #2 kein Werkzeug | — |
| 44 | stoffe.K1 | EINE Stoff-Tafel in SI | 1/2 | #2 kein Werkzeug | — |
| 45 | mensch.K1 | Besiedlung und Skala | 1/2 | #2 kein Werkzeug | — |
| 46 | material.K2 | Mikro-Detail bis Armlänge | 1/2 | #2 kein Werkzeug | — |
| 47 | lod.K3 | Aus jeder Blick-Hebung | 1/2 | #2 kein Werkzeug | — |
| 48 | pipeline.K5 | EIN Bauer auf der Engine | 1/2 | #2 kein Werkzeug | — |
| 49 | ki.K5 | KI hält den Takt | 1/2 | #2 kein Werkzeug | — |
| 50 | tore.K5 | Teilen in EINER Geste | 1/2 | #2 kein Werkzeug | — |
| 51 | physik.K4 | Seile, Tuch, Weiches | 1/2 | #2 ohne Station | — |
| 52 | physik.K5 | Der aktive Leib | 1/2 | #2 ohne Station | — |
| 53 | feld.K5 | Feld am Ort der Tat | 1/2 | #2 ohne Station | — |
| 54 | vegetation.K2 | Die sichtbare Böe | 1/2 | #2 ohne Station | — |
| 55 | tiere.K5 | Begegnung im Bild | 1/2 | #2 ohne Station | — |
| 56 | mensch.K5 | Begegnung, Gespräch | 1/2 | #2 ohne Station | — |
| 57 | affekt.K2 | Emotion formt die Welt | 1/2 | #2 ohne Station | — |
| 58 | affekt.K3 | Nexus schreibt, wertet, lernt | 1/2 | #2 ohne Station | — |
| 59 | haar.K1 | Fell im Bild (A) | 1/2 | #2 ohne Station | — |
| 60 | haar.K3 | Bewegung im Wind | 1/2 | #2 ohne Station | — |
| 61 | haar.K5 | Haar zahlt am Schirm | 1/2 | #2 ohne Station | — |
| 62 | licht.K4 | Wolken mit Körper | 1/2 | #2 ohne Station | — |
| 63 | licht.K5 | Wetter und Nacht ohne Bruch | 1/2 | #2 ohne Station | — |
| 64 | ferne.K4 | Abendschatten ferner Täler | 1/2 | #2 ohne Station | — |
| 65 | ferne.K5 | Ferne im Wetter | 1/2 | #2 ohne Station | — |
| 66 | material.K4 | Spiegelung aus EINER Quelle | 1/2 | #2 ohne Station | — |
| 67 | material.K5 | Rauheit und Glanz | 1/2 | #2 ohne Station | — |
| 68 | schatten.K2 | Ruhige Schatten | 1/2 | #2 ohne Station | — |
| 69 | schatten.K3 | Kontakt-Verdeckung | 1/2 | #2 ohne Station | — |
| 70 | schatten.K4 | Rückstrahlung, Innenraum | 1/2 | #2 ohne Station | — |
| 71 | lod.K2 | Kein Pop unter Bewegung | 1/2 | #2 ohne Station | — |
| 72 | lod.K4 | Stufenwechsel in Ruhe | 1/2 | #2 ohne Station | — |
| 73 | ki.K3 | Seele erinnert sich | 1/2 | #2 ohne Station | — |
| 74 | ki.K4 | Regeln des Modells | 1/2 | #2 ohne Station | — |
| 75 | fahrzeug.K5 | Körper fühlt die Fahrt | 1/2 | #2 ohne Station | — |
| 76 | spielgang.K1 | Fünf Schritte in EINER Sitzung | 1/2 | #2 ohne Station | — |
| 77 | spielgang.K3 | HUD und Menü | 1/2 | #2 ohne Station | — |
| 78 | ultiversum.K1 | Welt-Gesetz, Konstanten | 1/2 | #2 ohne Station | — |
| 79 | ankunft.K2 | Bild bei der Kontrolle ganz | 1/2 | #2 ohne Station | — |
| 80 | streaming.K3 | Sprung hält die Kadenz | 1/2 | #2 ohne Station | — |
| 81 | tore.K2 | Membran zeigt, wohin | 0/2 | keine Maschine | — |
| 82 | tore.K4 | Mitspieler, zwei Geräte | 0/2 | keine Maschine | — |
| 83 | spielgang.K2 | Erster Eindruck erklärt sich | 0/2 | keine Maschine (Schöpfer-Runde) | — |

13 Kriterien mit 0/2 oben (vegetation.K1, K3, haar.K2, licht.K1, ferne.K3, schatten.K5, lod.K1, tore.K1, ankunft.K3–K5, streaming.K1–K2) haben
für ihren ZWEITEN Punkt ebenfalls keine Station — sie zählen in die 58 unerreichbaren. Hilfsskripte (nur lesend): `scratchpad/kurs/dump.cjs`, `offen2.cjs`,
`letzte.cjs`, `tabelle.cjs`, `verlauf.cjs`.
