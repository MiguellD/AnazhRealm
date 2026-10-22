# Bericht 2210 Leib K1 Staffel 2 GTX: das Verb hieb gemessen; springen und einsteigen am Kopf nicht messbar (Werkzeug-Bruch beim Namen)

Kopf main f3865c80 (V18.546.61), Wiese, EIN Boot, `werkbank latenz --proben 50` je Verb × Sicht als eigener Aufruf unter `timeout 600`.

- **hieb** (am Kopf, halten-latenz), LATENZ GRÜN:
  - **Ego** p50 12,8 · **p95 35,2** · max 37,4 ms (eingabe 0,3 · Hörer 1,3 · Kette 4,9 · Kurve 7,9 · 2 Takte · Hit-Stop 12 Bilder).
  - **Third** p50 18,5 · **p95 31,2** · max 37,5 ms (eingabe 3,6 · Hörer 2,0 · Kette 13,0 · Hit-Stop 9).
  - 50/50 Proben in beiden Sichten, keine fehlt.
- **springen, einsteigen — WERKZEUG-BRUCH, am Kopf nicht gemessen:**
  - `latenz` kennt am Kopf nur gehen, wechsel und hieb. Mein Mess-Patch vom 21.10. (`latenz-patch2.cjs`: Space bzw. KeyE, Rücksprung an den Start, Absitzen) läuft durch die Proben, aber die Auswertung bricht.
  - Die Stelle: `scripts/lib/haenger-linse.cjs` `latenzUrteil` → `med("imHoerer")`. Die Proben dieser Verben tragen das Feld `imHoerer` der halten-latenz-Kette nicht, `rang` ruft `.toFixed` auf `undefined`.
  - Ausgabe: „LATENZ undefined … Cannot read properties of undefined (reading 'toFixed')“, je Verb × Sicht EXIT=1.
  - Letzte gültige GTX-Werte, gemessen 21.10. an 2160be58 mit dem alten Ablauf (bericht/2110-gtx-messschuld-3.md): springen p95 40,0 / 34,2, einsteigen 26,9 / 21,5 ms (Ego/Third).
  - Beim einsteigen ist der GT wieder ungezeichnet (`gezeichnet false`, `mesh false`), aufsitzen und absitzen gehen.
- **Zwei weitere Brüche, beim Namen:**
  - **Der Sammel-Lauf** `latenz --proben 50 --verb gehen,wechsel,hieb` (Ego und Third in einem Aufruf) hing an e5003509 25 min ohne jede Ausgabe (06:48–07:12) und wurde abgebrochen. Als Einzelaufrufe laufen hieb Ego/Third in je ~1 min (3 Proben an e5003509: p95 35,4). Die Hängestelle im Sammel-Lauf ist nicht gejagt.
  - **`werkbank latenz --selbsttest`** bricht an e5003509 mit „WERKBANK-FEHLER: Cannot read properties of undefined (reading 'ego/gehen')“.

Roh: OMEN `p3/n2210/hieb/` (staffel2/, probe/, Sammel-Lauf); hier `bericht/2210-leib-k1-staffel2/`.

Status ZWISCHENSTAND + Übergabe:
- Leib K1 St. 2 an der GTX: hieb ist gemessen. springen und einsteigen brauchen die Verben in der Linse selbst (der Patch reicht nicht mehr); das ist eine Werkzeug-Karte.

## Nachtrag 22.10. 12:56: gehen am Kopf e3dd2b67 (nach 60b26c9b, Erdungs-Cache auf der Schritt-Uhr)
`werkbank latenz --verb gehen --sicht ego,third --proben 50` an der GTX, frischer Boot (n2010-b2a an e3dd2b67, sauber), Wiese, 1920×1080, Einschwingen `lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei`. Ego und Third liefen in einem Aufruf ohne Hänger (EXIT 0, 2 min). LATENZ GRÜN (Bild 15,9 ms).

Werte in ms:

| gehen | p50 | p95 | max | Kette | Kurve | Takte | n |
|---|---|---|---|---|---|---|---|
| Ego | 29,7 | **38,7** | 46,8 | 13,0 | 16,6 | 4 | 50/50 |
| Third | 30,5 | **43,1** | 45,9 | 11,3 | 17,0 | 4 | 50/50 |

- Das Eingabe-Glied ist 0,3 ms, Hörer 0 ms.
- Gegen 2160be58 (21.10., ebenfalls EIN Boot): Ego p95 41,0 → 38,7, Third p95 40,9 → 43,1, p50 29,6/32,2 → 29,7/30,5.
- Je Sicht ist das ein Boot gegen einen Boot. Die Verschiebung von ±2 ms in entgegengesetzter Richtung liegt im Streu-Rahmen, der Pfad wird nicht schneller oder langsamer gesprochen.
- Der Weg vom Tastendruck zum Bild bleibt vier Takte. Die Kurve (Schritt-Hochlauf ~17 ms) trägt den größten Teil, die Kette 11–13 ms.

Roh: OMEN `p3/n2210/lg/`, hier `bericht/2210-leib-k1-staffel2/gehen-e3dd/`.
