# Richter-Akten der Meisterkarte 2

Gelesen von `node vision/buche-2.cjs`; die Form steht verbindlich im Kopf von `vision/buche-2.cjs`.

Zwei Namen:
- `<leiter-id>.<sprosse>.<sha8>-<gerät>.json` schreibt die Mess-Sitzung selbst (`punkte.cjs` → `vision/richter-akte.cjs`, die Zuordnung Station → Sprosse in `vision/richter-tafel.json`): je Gerät und Kopf eine Datei, gepusht mit der Mess-Datei nach punkte-maschine (Radeon: `zug/dienst/radeon-dienst.sh`, GTX: `zug/dienst-omen/ort/n0611/gtx-dauer.cjs`), von dort nach koordination.
- `<leiter-id>.<sprosse>.json` ist eine Akte von Hand.

Alle Dateien einer Sprosse werden zusammen gelesen. Die Fahrten DESSELBEN SHA vereinen ihre Geräte zu einer Fahrt, so werden die Radeon- und die GTX-Akte eines Kopfs zusammen gerichtet.

| Feld | Inhalt |
|---|---|
| `leiter`, `sprosse` | gleich dem Dateinamen; die Sprosse muss in `meisterkarte-2.json` stehen |
| `sha` | SHA am Kopf (main), auf dem gefahren wurde |
| `datum` | ISO-Zeit, das Ende der Probe; ordnet die Fahrten (Ratsche Z4) |
| `soll` | wörtlich der `richter` der Sprosse aus der Karte |
| `station` | die Station der Punkte-Maschine (nur in Akten der Sitzung) |
| `geraete[]` | je Standardgerät (Z7, 2026: `Radeon 890M` und `GTX 1060`) eine Messung |
| `geraete[].richter` | `{ "wert", "urteil": "GRÜN" \| "ROT", "mass"? }`: Zahl und Urteil der Station |
| `geraete[].preis` | `{ "bild_p95_ms", "bild_max_ms", "heap_mb", "vram_mb", "bilder", "fenster": { "von", "bis" }, "referenz", "posten", "urteil" }`: der Schnitt des Sitzungs-Stroms über das Fenster der Probe. Die Zeile der Preis-Treppe nennt die Karte (`klasse` der Sprosse) |
| `preis.referenz` | die Referenzfahrt der Punkte-Maschine vor und nach dem Preis-Lauf, dieselbe Sitzung (`f`, `fEin`, `fAlle`, `vor`, `nach`, `ruhe`) oder `{ "fehler" }`. Bild p95 und größtes Bild über dem Soll sind nur ROT, wenn `f` im Band der Ruhe liegt (punkte.cjs `REFERENZ_RUHE_BAND`), sonst „UNGEMESSEN unter Last ×f“ — wie ein fehlender Preis: kein Punkt, kein Kern-Verlust. Heap und VRAM urteilen wie gemessen |
| `preis.posten` | nach dem Preis-Lauf an derselben Pose, nach erzwungenem GC (werkbank `/puffer`, der Zensus der Band-Wand): `vram_mb`, `heap_mb`, `vram` und `heap_typed` als `[Erzeuger, MB, %]` absteigend bis 90 % der Summe. `heap_mb`/`vram_mb` des Preises selbst sind die Spitze des Stroms OHNE GC |
| `preis.urteil` | `GRÜN` · `ROT` · `UNGEMESSEN …`, geschrieben von der Sitzung, nachgerechnet von buche-2 |

Wirkung:
- Ein ROT am Richter nimmt die Sprosse zurück, auch den Kern der Brücke.
- Ein Gerät allein hebt nichts („kein Punkt, nur ein Gerät“).
- Beide GRÜN ohne vollen, grünen Preis an beiden ergibt Kern; ebenso eine Sprosse ohne `klasse` in der Karte („KLASSE FEHLT“).
- Beide GRÜN mit grünem Preis an beiden ergibt einen Punkt.

Hier liegen nur echte Fahrten.
