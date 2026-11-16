# Vorrat 08-mensch-geist-menge — gelesen am Kopf e4eeee08

**Zählung: A 0 · T 1 · F 0 · R 5 · B 6 (12 Leitern) — gelesen ≈ 70 %** (alle 12 Ziel-Sprossen an Kern/Stamm/Station belegt; nicht
gelesen: der Code von `_bewohnerAusweichen` (dichte S2), die stadt-voll-Läufe im Ganzen (rhythmus S2), die Stationen mensch.K3/K4).
Alles hier ist GELESEN, nichts gemessen.

## Die fünf billigsten Sprossen

1. **mensch.geist.gespraech S1 (T, S, 8 min je Gerät)** — „Zuwendung ≤ 0,5 s, Berührung 0“ urteilt mensch.K5#1 schon wörtlich (probe beider
   Geräte, stationen/g2.js:5784-5839). Es fehlen nur die Tafel-Zeile und eine Paar-Fahrt am SELBEN Kopf (Radeon 105c9bd3, GTX 3e4f99cd).
2. **mensch.menge.bild S1 (R, S, 3 min)** — platzAcht zählt imBild und gehendImBild am Dorfplatz 8 Uhr schon (g2.js:1709-1722), das Urteil
   prüft nur imBild ≥ 10 (g2.js:4361-4370); dazu `gehendImBild >= 3` und den Stand-Filter am Kopf (siehe Fund 1). Preis-Risiko: der Dorfplatz
   ist die rote Pose (Radeon ≈ 37 ms, Beleg 14.11.).
3. **mensch.menge.kollektiv S1 (R, M, 3 min)** — `_bewohnerZeuge` macht JEDEN Bewohner draußen auf 25 m zum Zeugen und weitet seinen Raum
   (stamm/siedlung-bewohner.js:2093-2120). Die Probe begegnung muss nur alle Umstehenden statt EINEN messen (kreatur-mensch.cjs:778 `allein`).
4. **mensch.menge.bevoelkerung S1 (R, M, 4 min)** — `_bewohnerSoll` (siedlung-bewohner.js:2125) nennt je (Ort × Uhr) die Soll-Zahl. Gebaut
   wird platzAcht als Schleife über 20 Stichproben im selben Lauf BEWOHNER_SITZUNG (g2.js:1740), Ist gegen Soll ±10 %, Doppelte 0.
5. **mensch.menge.rhythmus S2 (R, M, 6 min)** — das Wege-Messer sammelt die Wende-Stunde jedes Wegs schon (`sp.n`, kreatur-mensch.cjs:179).
   Ein Stunden-Histogramm an stadt-voll über 24 h trägt den Richter, aber stadt-voll riss den Fahrt-Deckel (g2.js:6423).

Danach der billigste Bau: **mensch.geist.innenleben S1 (B, M, ohne Preis-Risiko)** — der Leib kann angry, fear, sad und joy schon im Gang
(stamm/koerper-leib.js:3387-3416). Der Bewohner erreicht davon nur fear (siedlung-bewohner.js:2188), also fehlen nur die Anlässe im Gemüt.

## Funde über das Paket hinaus

1. **platzAcht zählt am Kopf zu wenige (Station veraltet):** der Filter `o.userData.rig && heim != null` (stationen/g2.js:1694) sieht seit
   w28-leib-im-ring nur Bewohner, die einen Leib tragen (`_bewohnerLeibAn` setzt rig erst beim Anziehen, siedlung-bewohner.js:1036-1056).
   Das sind die Nah-Wahl 4, der Ring 6 und der Erste je Gestalt. Alle übrigen Hüllen tragen `userData._feldLageVon` (:982), und so zählt sie
   die Probe bewohner (kreatur-mensch.cjs:386). Das trifft mensch.K1#1 (Urteil imBild ≥ 10), menge.bild S1 und bevoelkerung S1. Der Beleg
   „18 im Bild, 0 gehend“ (14.11.) passt zu genau dieser Leib-Teilmenge (die Ersten je Gestalt stehen) — gelesen, nicht gemessen.
2. **Eine Fahrt hebt zwei Sprossen:** mensch.K5#1 trägt schon dichte S1 (Tafel) und trüge gespraech S1. Grün ist sie bisher an zwei
   verschiedenen Köpfen, also bucht EINE Paar-Fahrt am selben Kopf beide. Ebenso nähme der Lauf BEWOHNER_SITZUNG (heute K1#1 + K2#2) die
   Urteile von menge.bild S1 und bevoelkerung S1 ohne neuen Boot mit.
3. **Haltung ohne Anlass:** TAGES_GESETZ.haltung legt jeden Abend „sad“ an (koerper-core.js:5174, gemeint als „müde“). Damit reißt der
   Gegenlauf von innenleben S1 („ohne Anlass → neutral“), und jeder Bild-Richter der Gefühle liest abends Trauer.
4. **Beleg gegen Code:** kollektiv-Beleg „1,335 → 1,952 m“ gegen die Station „1,44 → 1,834 m“ (105c9bd3). Der netz-Beleg „Haus ohne
   Bindung“ stimmt weiter: der Besuch wählt jedes Wohnhaus nach Güte × Nähe (koerper-core.js:5272), kein Netz.
5. **Ein Kern-Schnitt hebt drei Leitern:** Kinder im Leib (koerper-core.js:120, heute 18–80 J.) sind die Wurzel von generationen S1, tag S2
   (Kind und Alter anders) und innenleben S3. Ein Charakterzug aus `_tagZahl` im tagesPlan (koerper-core.js:5183/5280) trüge absicht S1
   und den Anlass-Teil von tag S2.
