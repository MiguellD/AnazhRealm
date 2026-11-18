# Fehlende Hälften der Karte 2 — gerechnet 18.11. aus vision/richter (koordination 0bad9bac, 543 Akten), ohne GPU

Methode: je (Sprosse, Kopf) mit genau EINER Hälfte, deren Richter GRÜN ist, die fehlende Hälfte als Spiegel derselben Akte
(Richter + Preis gleich) eingesetzt, dann `node vision/buche-2.cjs --akten <spiegel> --karte vision/meisterkarte-2.json --trocken`
(Kopf-Folge und Ratsche wie echt). Werkzeug: `koord/haelften/spiegel.cjs`. Basis 35 von 1 718, Kern 9.

## DIE ZAHL

| fehlt | gespiegelt | Karte 2 danach | Gewinn |
|---|---|---|---|
| GTX-Hälfte | 57 | 36, Kern 10 | **+1 Punkt** (`same.kopplung.ereignis` S1), `erleben.spieler.rolle` S1 0 → KERN (Radeon-Preis unter Last ×2,79) |
| Radeon-Hälfte | 86 | 37, Kern 8 | **+2 Punkte** (`erleben.spieler.rolle` S1, `planet.wetter.lagen` S1 KERN → PUNKT) |

Die übrigen 140 Spiegel bewegen nichts: die Sprosse steht schon PUNKT (die Ratsche hält) oder ein jüngerer main-Kopf trägt ein Urteil (überholt).
Ein GTX-Gerät schließt also höchstens EINE Sprosse — ihr Abzug vom Schnitt kostet die Karte 1.

## Die Befehlszeilen (im Punkte-Baum, nimmt Baum- und GPU-Schloss selbst)

GTX (eine Zeile, eine Station, ~2 min):
    node punkte.cjs run --sha d39e0d6e256ad44dbd8c338b1c870ef868ff2035 --geraet gtx --nur karte2.same.kopplung.ereignis#1
(GTX-Hälfte von rolle#1 am 31d156e8 hebt nur bis KERN — nicht fahren.)

Radeon (fährt dieser Vorarbeiter selbst):
    node punkte.cjs run --sha d3ddb51c3c2cf097ccfd248872ca02e8266d0094 --geraet radeon --nur karte2.erleben.spieler.rolle#1
    node punkte.cjs run --sha c50e6b61b445196a2316565e29a8e4989a939eef --geraet radeon --nur wetter.K1#2

## Je Kopf die Stationen mit genau einer Hälfte (nur die jüngsten Köpfe der main-Linie; der Rest in haelften/*-spiegel.txt)

- 21f279f5 (main): Radeon fehlt — karte2.leben.tiere.mensch#1 (GTX-Preis unter Last ×1,69)
- c50e6b61: Radeon fehlt — wetter.K1#2 · vegetation.K2#1 · luftwasser.K3#1 · karte2.same.preis.ankunft#1 · karte2.same.preis.bytes#1
- d3ddb51c: Radeon fehlt — karte2.erleben.spieler.rolle#1 · karte2.leben.kopplung.leben-formt-planet#1 · tiere.K5#1 · karte2.planet.kopplung.wetter-welt#1
- d39e0d6e: GTX fehlt — karte2.same.kopplung.ereignis#1 · karte2.same.kopplung.stoerung#1 · Radeon fehlt — gelaende.K4#2
- 31d156e8: GTX fehlt — karte2.erleben.spieler.rolle#1 · Radeon fehlt — karte2.planet.wasser.kreislauf#1
- 7de938ab: GTX fehlt — vegetation.K4#1 · mensch.K5#1 · karte2.mensch.zeit.erleben#1 · gelaende.K4#2 · Radeon fehlt — karte2.erleben.kopplung.wahrnehmung#1 · karte2.mensch.menge.bild#1 · karte2.mensch.stadt.siedlungsnetz#1
- 602607bb: Radeon fehlt — luftwasser.K3#1
