# Vorprüfung w2-gipfel-saaten — die Gipfel-Suche kostet, was sie fragt

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 117 von 1 718 (Stand-Datei der Karte 2 im Zweig
`punkte-maschine` 81164386f). Die Abgabe beansprucht `planet.kopplung.gegenwart#2`. Buchen kann sie nur die Station, und deren
Zeuge verlangt 100 Saaten. Sie fragt heute 12, deshalb liegt ein Kandidat bei (unten).

**Geschnitten:**
- `planetOrt` (planet-core.js) rechnete je Ort Leit-Stützen 9 × 9 über 64 km: 81 von 83 `planetPunktR` je Ort. Kein Leser las
  sie: der Faden gibt `delta.leit` nie zurück, gelaende-core und die Stationen lesen sie nie. Sie fallen ganz, mit Feld,
  Delta-Schleife und Kopie. Das ist ein Schritt weiter als der Getter aus c7e2b8e9, den der Zweig eingemergt trägt. Ein Getter
  ließe das Feld ohne Leser im Vertrag stehen und schriebe PK zur Lese-Zeit.
- `planetOrt` baut den Schlüssel des Ort-Gesetzes (2 378 Zeichen, 14 µs) EINMAL je Ort statt zweimal: `ankerAmSchluessel`.
  `ortRoh` liest den Anker, den sein Aufrufer fand.
- Die Linse `ort.frage` in `scripts/diag-planet.cjs --anker` (Familie K6, Tor gate:worker-dichte) nennt die Kosten je Saat beim
  Namen: Plan · Meer · Anker · Orte in ms sowie Relief-Punkte und Hüll-Punkte je Ort am gezählten Kern. Sie urteilt in Rufen
  (≤ 2 Relief-Punkte je Ort, Lehre 26) und bit-genau (SHA über 100 Saaten × 1 380 Orte).
- Selbsttest: 81 gepflanzte Punkte je Ort fallen ROT, und eine Relief-Höhe +10⁻⁶ m am Stichpunkt −66°/−180° fällt ROT.

**Gemessen (node, die Last des Fadens `planetOrtAuftrag`, Saaten wie die Station):**

| | main 2da17e2e7 | Kopf |
|---|---|---|
| je Saat | 863–924 ms | 179–193 ms (Plan 16 · Meer 92 · Anker 7 · Orte 73) |
| 100 Saaten | 86–92 s | 18–19 s |
| Relief-Punkte je Ort | 84 | 2,00 |

- Die SHA ist am main-Kern und am Kopf gleich: 22ec9a313b0ea9bf über alle 100 Saaten, b7ff79ae9e8b4621 für die erste Saat.
  Der Küsten-Kontrast aus main ist dabei eingerechnet. Vor dem Merge war es ebenso: 91edc616f37caa5f an 0ee3ed8c ↔ Kopf.
- Gipfel > 2 km: 2 804, davon 99,0 % an konvergenter Grenze (Land 68,2 %). Die Station misst ≥ 95 %.
- Die Linse ist ROT am main-Kern und GRÜN am Kopf.
- `--richter ort` ist GRÜN (ort.delta.null 30/30, ort.leser, ort.landung 400/400).
- `npm run check:statik` gibt Exit 0.

**Ehrlich offen:**
- (1) Der Zeuge der Station bleibt bei 12 Saaten, bis der Richter den Kandidaten nimmt:
  `cloud-post/w2-gipfel-saaten-station/` (Patch + BEGRUENDUNG.txt) mit `saaten: 100` und `budgetMs: 34000` unter der Kappe `sek: 40`. Der Rest der
  Station kostet in node 0,66 s für 9 183 Orte; der Speicher wächst um 0,08 MB je Saat.
- (2) Das Meer kostet je Saat 92–113 ms in node, auf der GTX 1050 271 ms. Messname `ort.frage.punkte`. Es besteht aus 9 216
  Hüll-Punkten an 5 Zeiten und 5,3 Scheiben (davon 24 ms grobe Nachbar-Suche, 20 ms kalte Zellen-Listen). Das ist das Gesetz
  des Spiegels selbst. Ein Schnitt an der Proben-Zahl bewegt jede Höhe des Planeten. Das Zellen-Gitter ZN 8 oder 12 ist
  byte-gleich, liegt aber im Rauschen.
- (3) Auf der GTX 1050 kostet eine Saat etwa 460 ms (Faktor 2,4 aus 2 119 ↔ 924 ms vor dem Schnitt). In 34 s passen dort also
  etwa 73 von 100 Saaten. Die Kappe hält dort nicht: die Wand dort ist auf etwa 46 s geschätzt, nicht gemessen (kein Gerät in dieser Bahn).
- (4) Das Band der Profis ist ohne Zahl. Bird (2003, G³ 4:1027) zieht 13 Orogen-Zonen über ETOPO5, nennt aber keinen Anteil
  der Gipfel über 2 km. Der Band-Wert für die 95 % bleibt offen.
- (5) Das Bild fehlt: kein Gerät mit GPU in dieser Bahn.
