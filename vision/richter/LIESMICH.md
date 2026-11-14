# Richter-Akten der Meisterkarte 2

Eine Datei je Sprosse: `<leiter-id>.<sprosse>.json` (z. B. `leben.pflanzen.kraft.1.json`). Gelesen von `node vision/buche-2.cjs`; die Form steht verbindlich im Kopf von `vision/buche-2.cjs`.

Eine Akte ist EINE Fahrt (Objekt) oder die Folge der Fahrten derselben Sprosse (Array). Eine Fahrt trägt:

| Feld | Inhalt |
|---|---|
| `leiter`, `sprosse` | gleich dem Dateinamen; die Sprosse muss in `meisterkarte-2.json` stehen |
| `sha` | SHA am Kopf (main), auf dem gefahren wurde |
| `datum` | ISO-Zeit; ordnet die Fahrten (Ratsche Z4) |
| `soll` | wörtlich der `richter` der Sprosse aus der Karte |
| `geraete[]` | je Standardgerät (Z7, 2026: `Radeon 890M` und `GTX 1060`) eine Messung derselben Fahrt |
| `geraete[].richter` | `{ "wert": Zahl oder Text, "urteil": "GRÜN" \| "ROT" }` |
| `geraete[].preis` | `{ "stufe", "bild_p95_ms", "bild_max_ms", "heap_mb", "vram_mb", "ankunft_kalt_s" (ab Stadt), "wachstum_mb_min"?, "ton_aussetzer"?, "urteil" }` — die Stufe ist eine Zeile der Preis-Treppe; die Maschine rechnet das Urteil aus den Zahlen nach |

Wirkung: ein ROT am Richter nimmt die Sprosse zurück (auch den Kern der Brücke) · ein Gerät allein hebt nichts · beide GRÜN ohne vollen, grünen Preis an beiden = Kern · beide GRÜN mit Preis GRÜN an beiden = Punkt. Hier liegen nur echte Fahrten — keine Probe, keine Schein-Akte.
