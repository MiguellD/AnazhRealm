# Vorarbeiter 13 (Radeon 890M, Punkte-Maschine) — Stand-Blatt 18.11. 02:40

## Gebucht
- Karte 2 35 → 35 von 1 718, Kern 9: +1 `erleben.spieler.rolle` S1 (Radeon am d3ddb51c: Richter GRÜN, Preis p95 33,71 ms, Heap 257,7 MB, VRAM 124,7 MB; GTX-Hälfte lag dort GRÜN/GRÜN) · −1 `same.kopplung.stoerung` S1 (GTX am 21f279f5 Richter ROT, nach w28-lava-nachlauf; die Radeon-Hälfte dort fährt im Stück 5).

## Was fehlt je Gerät (im Punkte-Baum `meisterkarte-quelle/punkte`)
- GTX, +1 Punkt: `node punkte.cjs run --sha d39e0d6e256ad44dbd8c338b1c870ef868ff2035 --geraet gtx --nur karte2.same.kopplung.ereignis#1`
- Radeon am c50e6b61 `wetter.K1#2`: gefahren, Preis unter Last ×1,37 → KERN; neu nur in Ruhe.
- Radeon am main 21f279f5 (fährt, 16 Stücke): `node punkte.cjs run --sha 21f279f5f5b87f86c0bea764dab99fb36670725e --geraet radeon --nur <Stück>` — Listen in S\v13\main-NN.
- GTX am main 21f279f5: die OMEN misst dort (51 Stationen, Zwischenstand in koordination); jede Station, die die Radeon dort grün fährt, braucht die GTX am SELBEN Kopf.
- Die Zahl: GTX-Hälften fehlen 57, davon bewegt 1 die Karte; Radeon-Hälften 86, davon 2 (Rechnung: Spiegel der vorhandenen grünen Hälfte + `buche-2 --trocken`).

## Stationen
- geheilt im Baum (nicht gemessen): `kopplung.bild#1` Deckel 90 → 240 s (40 Schritte × zwei Bilder + 30 Takte ≈ 2,5–3 s je Schritt), `ms` je Schritt und `gangS` in der Antwort · `bevoelkerung#1` Lesewert „draußen je Uhr“ (6–20 Uhr: draußen, am Wagen, drinnen, Ziele, die drei größten, Soll der fünf vollsten dieser Stunde, Regen) — Proben 20/0, 13/0.
- offen: `breite.siedlung#1` (wartet auf w28-stadt-netz) · `bevoelkerung#1` Fall 1/2 nach der Zahl · `tiere.masse#1` Soll-Frage · `ankunft.K1#1/#2` · `preis.ausdauer#1` blind.

## Werkzeuge (Befehl · Zweck · Falle)
- `punkte.cjs run --sha <voll> --geraet radeon --nur a,b` · misst in EINER Welt, schreibt messung/ und vision/richter/ · nimmt Baum- und GPU-Schloss selbst, nie in gpu-lauf.sh wickeln; Stücke ≤ 11 min Schätzung (Preis-Lauf je Karte-2-Station +73 s, nicht in `minuten`).
- `node vision/buche-2.cjs --trocken` · die Karte ohne Schreiben · vor dem Gedankenstrich steht der GEHALTENE Stand; Kandidat ist nur 0/KERN mit „es fehlt X“.
- `koord/haelften/spiegel.cjs <akten> <ziel> gtx-fehlt|radeon-fehlt` · rechnet die Hälften-Zahl ohne GPU · Spiegel nimmt den Preis des anderen Geräts an (Obergrenze, keine Messung).
- `punkte.cjs gruppen --geraet radeon --nur …` · Zwillinge · gab eine Zeile für alle 54 (die Sitzung ist ein Lauf) — Stücke selbst schneiden.
- `gpu-lauf.sh <name> <befehl>` · Schloss für fremde Proben · 900-s-Deckel tötet den Baum.
- `messplatz-blick.sh --kurz` · Lage · trägt die Zeile UNGELANDET NICHT; die steht nur über `zug/dienst/ungelandet.cjs --repo <Haupt-Klon>` (14 s).
- Die Wirt-Wache: gebaut 17.11., in 0 von 54 Preis-Stationen gelesen (alle Läufe am d39e0d6e, Werkbank ohne `/wirt`); am 21f279f5 zum ersten Mal wirksam — `kopf.wirtBlind` in jeder Mess-Datei prüfen.

## UNGELANDET (02:38, ganz)
UNGELANDET (≤ 7 Tage, Inhalt < 85 % in main 21f279f5): 36 — w28-stoff-stufe-null[Abgabe] +1 74/2% · w28-stadt-netz +22 889/6% · vorrat11-stadt-netz +23 861/3% · w28-stoff-fuge +44 678/1% · w28-studio-seiten +2 531/10% · w28-samen-lichtweg +1 495/4% · w28-baum-ganz +7 451/34% · w28-samen-live-tausch +1 451/3% · w28-samen-fahrzeug +1 443/4% · w28-samen-wiese +1 432/5% · w28-weg-koerper +1 415/4% · w28-samen-karten-stufe +1 399/11% · w28-heap-stichprobe +7 335/4% · w28-wiese-fern +2 297/6% · w28-haus-stoff +3 296/0% · vorrat9-mensch +5 281/1% · w28-reise-raeumt +9 266/3% · w28-wiese-mitte +5 259/1% · vorrat10-register +2 235/6% · w28-rasen-schnitt +15 224/7% · w28-baum-wechsel +4 222/3% · vorrat12-bau-rezept +3 173/0% · w28-beet-feuchte +8 172/6% · w28-heap-spiegel +4 171/6% · vorrat8-ankunft +6 164/3% · w28-strahler +5 149/3% · w28-fruehbild +3 129/7% · w28-baum-schirm +17 98/0% · w28-weltbild-kalt +1 78/84% · w28-heap-zensus +3 69/1% · w28-reibellipse +11 68/2% · w28-geister-wand +3 51/9% · w28-griff-ellbogen +1 45/4% · w28-seiten-stille +1 30/0% · w28-heap-haus +3 28/0% · w28-damm-ferne +2 20/5%

## Lehre (ehrlich)
1. Zeitverlust: die Hälften-Frage war 2 min Rechnung (Spiegel + Trockenbuchung) — sie stand zwei Vorarbeiter lang als Prosa-Liste „Fehlende Hälften“ in LAGE, nie als Zahl; 140 der 143 gelisteten Hälften bewegen nichts.
2. Übersehen: die geheilte kopplung.bild#1 verdoppelte die Bilder je Schritt und behielt den geschätzten Deckel 90 s — eine Heilung ohne Lauf am Gerät ist keine Heilung.
3. In einen Auftrag gehört: der Kopf (voll), die Stationen, das Soll in Zahlen und die EINE Messung, die Station ↔ Spiel trennt. Nie: Prosa-Listen fehlender Hälften ohne Gewinn-Zahl, drei Aufträge mit wechselndem Vorrang im selben Lauf.
4. Gegen mich: ich habe 16 Stücke geplant, ohne die Stationen zu streichen, deren Hälfte nichts bewegen kann (`gtx-nutzen`-Gegenstück für die Radeon fehlt).
5. Der Hebel, den niemand beauftragt hat: `punkte.cjs` als `radeon-nutzen --kopf <sha>` — dieselbe Spiegel-Rechnung je Kopf vor jeder Fahrt, und die Fahrt misst nur, was die Karte bewegen kann (heute 3 von 143).
