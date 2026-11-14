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
| `geraete[].preis` | `{ "bild_p95_ms", "bild_max_ms", "heap_mb", "vram_mb", "bilder", "fenster": { "von", "bis" } }`: der Schnitt des Sitzungs-Stroms über das Fenster der Probe. Die Zeile der Preis-Treppe nennt die Karte (`klasse` der Sprosse) |

Wirkung:
- Ein ROT am Richter nimmt die Sprosse zurück, auch den Kern der Brücke.
- Ein Gerät allein hebt nichts („kein Punkt, nur ein Gerät“).
- Beide GRÜN ohne vollen, grünen Preis an beiden ergibt Kern; ebenso eine Sprosse ohne `klasse` in der Karte („KLASSE FEHLT“).
- Beide GRÜN mit grünem Preis an beiden ergibt einen Punkt.

Hier liegen nur echte Fahrten.
