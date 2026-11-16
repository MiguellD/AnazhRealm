# Leser 1 — alte Stationen → Sprossen der Karte 2 (nur gelesen, Baum koord-dienst)

## Aufteilung (die Rechnung zum Nachprüfen)
Station = `kriterium#staffel` aus `meisterkarte-quelle/punkte/stationen/g1–g6.js` (exportierte Liste, nicht `fehlt`). Gezählt
werden nur Kriterien der alten Karte (`meisterkarte-quelle/src/g1–g6.js`, 165 Kriterien × 2 Staffeln = 330). Damit fallen
`karte2.*` (5), `breite.*` (3) und `pflicht.C/E` heraus. Ergebnis: N = 271 eindeutige Stationen, das sind genau die 271 Kennungen
in `stand.json`. 33 Familien, alphabetisch sortiert, an der Stelle geschnitten, an der die kumulierte Summe N/3 bzw. 2N/3 am nächsten kommt:
- **Stück 1 (90):** affekt 8 · ankunft 6 · bauen 10 · fahrzeug 8 · feld 9 · ferne 7 · gelaende 9 · haar 6 · halten 10 · ki 7 · klang 10
- **Stück 2 (91):** leib 10 · licht 7 · lod 6 · luftwasser 10 · material 7 · mensch 8 · oekologie 10 · physik 8 · pipeline 9 · profiband 10 · schatten 6
- **Stück 3 (90):** siedlung 10 · speicher 10 · spielgang 6 · stoffe 9 · streaming 7 · studios 10 · tiere 9 · tore 4 · ultiversum 9 · vegetation 7 · wetter 9

## Zahlen (Stück 1, 90 Stationen)
- **gleich (neu): 0.**
- **teil: 26 Stationen in 27 Zeilen** (`leser1.json`). 16 davon messen ihr Glied nur headless (15 Stationen ganz headless, dazu gelaende.K4#2 mit ROTer GPU-Probe); nach R2 heben sie nie.
- **schon in der Tafel: 4** (affekt.K1#2, gelaende.K2#1, klang.K4#2, gelaende.K4#2). Zwei davon tragen in einer zweiten Leiter ein „teil“.
- **Zwilling einer Tafel-Zeile: 6**, keine neue Zeile nach R9/G4: affekt.K1#1 (ziele S1 headless), ankunft.K1#1/#2 (preis.ankunft S1, EIN
  Kalt-Boot statt ≥ 4, die Sprosse trägt schon karte2.same.preis.ankunft#1), klang.K1#1 und klang.K2#1 (landschaft S1, karte2-Station),
  klang.K4#1 (ereignis S1, trägt klang.K4#2).
- **keine: 56.**

## Die „gleich“-Zeilen
| Station | Leiter · Sprosse | Satz der Sprosse | Station misst |
|---|---|---|---|
| — | — | In Stück 1 beweist keine Station außerhalb der Tafel einen Satz ganz. | — |

Gegenprobe der Tafel: Ich widerspreche keiner Zeile. `affekt.K1#2 → erleben.sinn.ziele S1` trägt die zehn Taten heute im GPU-Urteil
(`stationen/g2.js:4930–4937`, Zeile ZEHN-TATEN). Das GRÜN in `stand.json` (a996d0ae) nennt dieses Glied aber noch nicht: Es stammt aus
der Zeit vor der Erweiterung, also muss die Station neu gefahren werden.

## Die fünf lohnendsten „teil“ (GPU schon grün oder ein Glied entfernt)
1. **gelaende.K5#2 → erleben.spieler.praesenz S1** (GRÜN/GRÜN). Der Fuß p95 ≤ 3 cm steht an Wiese und 25°-Hang. Es fehlen im selben
   2-min-Gang „Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms“ und „0 Bilder mit Kamera im Fels“.
2. **fahrzeug.K2#1 → mensch.netz.verkehr S1** (GRÜN/GRÜN). Route 2 440 m und 0 Steckenbleiber stehen. Es fehlt „Bild p95 ≤ 33 ms während der
   Fahrt“: Das Urteil zählt keine Bildzeit, und der Preis-Lauf steht an der End-Pose (Beleg der Karte: GTX 35,4 ms bei 36 km/h).
3. **ferne.K1#1 → erleben.bild.ferne S1** (GRÜN/GRÜN). Koschmieder 0,87–1,06 hält das Band 0,8–1,2. Es fehlt „Ferne = Nähe ≥ 0,8 an
   12 Posen“, das schon in ERSTE-RICHTER als Grund stand.
4. **gelaende.K3#1 → planet.wasser.seegang S1** (ROT/GRÜN). spiegelTreue 0,73 gilt an EINER Pose. Es fehlen 11 Posen (Uhr × Wetter) und die Radeon.
5. **ki.K1#2 → erleben.schoepfen.satz S1** (headless). 41 Sätze sind gültig (100 %), die Absicht trifft zu 100 %, 0 Brüche. Es fehlen das echte Fenster
   am Ausgabebild und „0 Hänger > 100 ms“. Das ist der v1-Pfad (Drehbuch 18).

Weitere teil mit nur einem Glied Abstand: halten.K2#1 → spieler.hand S1 (Trefferpunkt ±1 Zelle, Radeon) · halten.K5#1 → sinn.tod S1
(das Gefährt bleibt, Radeon) · bauen.K5#2 → spieler.rolle S1 (Bildpaar je Verb-Gruppe) · feld.K4#2 → kopplung.zeitreise S1 (nur ins
Bild beider Geräte) · gelaende.K4#1 → kopplung.siedlungslage S1 (Bildpaar an 50 Punkten).

## Nicht gefunden
- Für ankunft.K3#1 (warm ≤ 5 s), ankunft.K5#1 (Haupt-Faden ≤ 250 ms), bauen.K4 (Turm 60 m), fahrzeug.K3/K5 (Kamera-Rig, Rumble),
  haar.K5#1 und klang.K5 (Kosten) trägt die Karte 2 keine Sprosse mit derselben Größe. Diese Größen sind dort Preis (R8) oder fehlen ganz.
- Bei fahrzeug.K2#1 lässt sich ohne Lauf nicht klären, ob `strom.ndjson` im Fenster der Probe Spieler-Bilder der Fahrt trägt (nicht geraten).
