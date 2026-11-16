# Vorrat 05-leben-wasser-oeko — Fehl-Zettel (gelesen, nicht gemessen)

**Zählung: A 2 · T 0 · F 3 · R 2 · B 4 (11 Leitern) — gelesen: 11 von 11 Leitern, Stationen an der Fundstelle ~85 %, Spiel-Code gezielt ~60 % der tragenden Stellen.**

## Die fünf billigsten Sprossen

1. **leben.oeko.vielfalt S1 (A, ~4 min je Gerät).** Die Tafel steht (tiere.K5#1); die GTX ist an 3e4f99cd grün, die Radeon reißt an
   3e4f99cd (Ego 2) und 105c9bd3 (Third 2). Es fehlt nur ein Radeon-Lauf mit ≥ 3 Sichtungen in beiden Sichten am Kopf der GTX oder ein frisches Paar.
2. **leben.oeko.partner S1 (A, ~4 min).** Die Tafel steht (luftwasser.K4#1), alle Akten (3 Köpfe, beide Geräte) sind ROT „keine Blumen-Klasse
   im Bild“ und zählen noch die Objekte der Maske; die Station zählt seither die Gäste im Kegel. Eine frische Fahrt am Kopf e4eeee08 zeigt, ob noch ein Spiel-Fehler bleibt (Blumen-Senken streuNah in der Maske).
3. **leben.oeko.zerfall S1 (B, Bau S).** Kadaver, Aas-Fraß und Versinken stehen; gedüngt wird nur der Tod von Spieler-Hand
   (stamm/kreatur-leben.js:918). Eine Tat ohne Narbe in `_kreaturFaellt` (kreatur-leben.js:926) plus eine Station nach tiere.K2#2 trägt die Sprosse.
4. **leben.wasser.bild S1 (R, Bau M, ~3 min).** Das Spiel hat Bach/See/Fluss mit eigenem kd und c (foundry-core.js:176), die Kamera liest
   sie unter Wasser (stamm/bild-himmel.js:2422). leib.K3#2 misst nur den See; Bach und Fluss (waagrecht, über den Leib-Kontrast) und zwei Bänder in der Soll-Tafel fehlen.
5. **leben.wasser.netz S1 (B, Bau S).** Flucht ≥ 3 m steht im Fenster; der Fisch steigt am Pegel nur mit 0,4 × Hub (FISCH_GESETZ.tiefe
   = Anteil über dem Bett, tetrapoda-core.js:2679; headless 0,39×), die Sprosse verlangt ≥ 0,8×. Der Koordinator entscheidet, ob Gesetz oder Karte irrt; danach braucht die Bach-Probe nur noch den Pegel-Teil.

## Funde über das Paket hinaus

- **EINE Sitzungs-Probe kaskade trägt zwei Leitern:** buehne('kaskade') (scripts/diag-kreatur-leben.cjs:290) urteilt headless
  oekologie.K1#1 (= leben.oeko.netz S1) und K1#2 (= leben.oeko.dynamik S1) im selben Lauf; als WP.sitzung-Probe gehoben (Bau M) fallen beide
  Fs. Achtung Deckel: 8 Saaten × 2880 Takte, braucht Teile wie tiere.K5#1.
- **Die Sukzession-Probe (diag-stand-takt.cjs --brand)** trägt leben.oeko.sukzession S1 und die Zahlen von leben.oeko.stoffe S1;
  dieselbe Hebung in die Sitzung nützt beiden (stoffe braucht zusätzlich das Bildpaar).
- **Beleg veraltet, lebensraeume S1:** heute = 1 laut Eingang, aber luftwasser.K3#1 ist kein Paar — GTX GRÜN an 105c9bd3 (Bett 0,2 %,
  18 386 px Fisch), Radeon ROT an 105c9bd3 (Kamera im Bett 29,1 %). Billigster Schritt des Pakets: Radeon an 105c9bd3 nachfahren (4 min).
- **Beleg veraltet, rhythmen S1:** GRÜN an Radeon 105c9bd3 und GTX 3e4f99cd/71839b1e — Paar am selben Kopf nur an 3e4f99cd, dort Radeon-Heap
  404,8 MB > 400. GTX an 105c9bd3 nachfahren schließt das Paar.
- **Fisch im Bild:** die Heimkehr-Akten zeigen „Bild tier:fisch — / 0 px“ — die Heimkehr-Fahrt schießt kein Bild unter dem Spiegel mit
  Fisch; der Richter „aus dem Bild“ (wasser.netz S1) braucht die Unter-Spiegel-Pose der Raum-Probe (die GTX zeigte dort 18 386 px).
- **See ohne Fisch:** fischStand verlangt Strömung ≥ 0,05 m/s (tetrapoda-core.js:2675); der Kreis „ohne Strömung“ ist beschrieben, aber
  nie erreichbar — See-Fauna (lebensraeume S2) ist Bau, kein Richter.
- **Soll-Tafel Wasser:** EIN Band sichtAbfall [0,17; 0,57] (spec/abnahme/soll-tafel.json:1350) gilt nur dem See; Bach und Fluss haben keine REF.
- **Plankton:** existiert nur als Kommentar (foundry-core.js:172-175) — rhythmen S2 und netz S2 hängen am selben fehlenden Feld (Bau L, gemeinsam planen).
