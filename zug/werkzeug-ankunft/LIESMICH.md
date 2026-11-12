# Die Rechnung der Ankunft — ein Befehl je Gerät

Aufruf: aus der Wurzel des Klons, am Stand, der gemessen wird (Dateien dieses Ordners außerhalb des Baums, z. B. `.git/werkzeug-ankunft/`):

```bash
git fetch origin koordination && mkdir -p .git/werkzeug-ankunft && git archive origin/koordination zug/werkzeug-ankunft zug/dienst/werkzeug/gpu-lauf.sh | tar -x -C .git/werkzeug-ankunft && GPU_LAUF=.git/werkzeug-ankunft/zug/dienst/werkzeug/gpu-lauf.sh bash .git/werkzeug-ankunft/zug/werkzeug-ankunft/ankunft-rechnung.sh 3
```

Was er fährt (je Runde ein frisches Profil, sechs Boots am echten Renderer, rund 4 min je Runde auf der GTX 1050):

| Boot | Foundry-Platte | Pipeline-Cache | liefert |
|---|---|---|---|
| k | leer | kalt | die Kalt-Zeile |
| g | voll | kalt | g − z = die Übersetzung der Pipelines |
| h | leer (gefegt) | warm | h − z = der Foundry-Bake |
| z | voll | warm | der BODEN (die Wiederkehr) |
| p | voll | warm | das V8-CPU-Profil des Haupt-Fadens Renderer → Bild |
| c | voll | warm | Zensus und Pixel je Programm (Okklusions-Abfrage) |

Gemessen wird „Bild minus Renderer" (die Zeit vor dem Renderer steht daneben); auf der GTX 1050 am Kopf 453babf6:
Boden 8,37 s · Übersetzung +4,0 s · Foundry-Bake +2,7 s · vor dem Renderer kalt 5,0 gegen 1,65 s warm.

Die Dateien:
- `ankunft-rechnung.sh` — der Treiber (Kopf: Aufruf, Schloss, was liegen bleibt).
- `frei-sonde.cjs`, `variante.cjs` — die Sonde ohne DevTools (Schalter: `zug/werkzeug-gtx1050/LIESMICH.md`).
- `eingriff/rechnung.js` — Messung ohne Eingriff: Bau im Gang, Züge je Pipeline, Knoten-Bau nach Stufen, erstes Bild.
- `eingriff/zensus.js` — Messung ohne Eingriff: Stand-Zensus, Szene-Gruppen, Pixel je Programm.
- `rechnung-lesen.cjs` — je Lauf eine Zeile, je Fall das Mittel.
- `spur-profil.cjs` — Domänen über den Stapel, die größten Funktionen, die größten Stamm-Glieder.
- `menge-lesen.cjs` — je Pipeline vor dem Bild: bestellt → bereit, Text, Züge, Urteil ZEICHNET / EINGANG / NIE.
- `zensus-lesen.cjs` — SICHTBAR / VERDECKT je Programm, Stand im Blick-Kegel, Szene nach Dreiecken.

Grenzen, ehrlich: die Pixel-Abfrage misst nur Dinge außerhalb eines Bündels und 0,25–1,5 s NACH dem Bild (dieselbe Pose);
der Profiler streckt das Fenster um rund ein Viertel (Anteile gelten, Millisekunden nicht); der Mess-Server liefert über
HTTP/1.1 ohne Kompression aus — die Zeit vor dem Renderer sagt über einen echten Host nichts.

## Nachtrag 12.11.: das Bild, das nicht ganz ist (der stumme Faden)

Ein Kalt-Boot kann mit offener Lücke ankommen: ein spät geborener Neben-Faden lädt sein Skript nie (seine Anfrage wartet in Chromes
HTTP-Cache auf den Eintrag, den die Anfrage eines anderen Fadens für DIESELBE URL gerade schrieb), die Pflanzung hängt, die Ruhe
gibt das Bild nach 15 s frei — kahler Boden ohne Wald. GTX 1050, kalt, je 21 Boots: heute 16 hängend · Neben-Fäden früh geboren 8 ·
der Mess-Server mit den Cache-Köpfen des echten Servers 1.
- `rechnung-lesen.cjs` nennt einen solchen Lauf „BILD NICHT GANZ — offen: …, erstes Bild <KB>“ und zählt ihn in keinem Mittel.
- `frei-sonde.cjs` mit `FREI_KOPF=echt`: ETag + `Cache-Control: no-cache` + 304 wie save-server.js `statischerKopf`.
- `eingriff/zeuge-faeden.js` (ohne eigenen Wecker — ein Zeuge mit Timer heilt den Fall): je Faden Geburt und erste Antwort, je
  Sekunde Rückrufe, Takte und Nachrichten, jeder Bruch; `zaehl-lesen.cjs <ordner>` zählt hängende von n.
- `netz-offen.cjs <netlog.json>`: die Anfragen des Faden-Skripts und jede Quelle, die bis zum Ende offen blieb.
