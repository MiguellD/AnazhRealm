# Stations-Kandidat unter-wasser — `karte2.leben.wasser.bild` (k2-leben)

Die Station bleibt unberührt. Der Kandidat ist ein Patch gegen
`meisterkarte-quelle/punkte/stationen/k2-leben.js` im Zweig `punkte-maschine` (a309cf90):

```bash
git show origin/punkte-maschine:meisterkarte-quelle/punkte/stationen/k2-leben.js > /tmp/k2-leben.js
```

```bash
patch /tmp/k2-leben.js cloud-post/unter-wasser-station/k2-leben.patch
```

## Was der Kandidat ändert (nur Leser, kein Soll- und kein Richter-Text)

| Stelle | heute | Kandidat |
|---|---|---|
| `bild`-Rumpf, `aus.koerper` (Sprosse `farbe`) | `WASSER_GESETZ.koerper` je Art über `A._wasserKoerper({ wK: kd, koerperStreu })`, also die Hand-Tafel mit drei Körpern, die seit unter-wasser kein Welt-Leser mehr liest | `r._wasserKoerperArt(k)` je Typ aus `__gelaendeCore.GEWAESSER_OPTIK.arten` — der EINE Leser, mit dem der Wasser-Stoff über dem Spiegel zeichnet (vier Typen: bach, see, fluss, meer) |
| Wasser-Leben-Rumpf, `koerper` (Lebensräume im Gesetz) | `Object.keys(WASSER_GESETZ.koerper)` (drei) | `Object.keys(GEWAESSER_OPTIK.arten)` (vier) |
| Sprosse 1, `taeter` | `stamm/bild-himmel.js _applyDayNightToScene (WASSER_GESETZ.koerper je Art)` | `stamm/wasser-hydro.js _wasserMedium (gelaende-core gewaesserOptik je Gewässer-Typ)` |
| Sprosse `farbe`, `nicht` | „feste Wasser-Körper … keine Farbe aus Plankton und Schwebstoff“ | „Wasser-Körper aus dem Gesetz der Gewässer … Schwebstoff je Typ und Abfluss, kein Plankton (Chlorophyll)“ |
| Sprosse `tiefe`, `nicht` | „(Grün vor Blau, das Meer liest den See-Körper)“ | der Zusatz fällt: das Meer liest seinen eigenen Körper (`amOrt[2]` = „meer“) |

Die Sprosse 1 (Sicht) liest unverändert `r._luftSichtM(y)` an ihren Posen. Mit dem Gesetz trifft jeder Typ sein Band:
Bach 9,03 m (5–20), See 3,69 m (2–16), Fluss 1,11 m (1–1,5). Sie bleibt trotzdem ROT mit „kein Fluss am Messort“: Im Umkreis
von ±12 km um die Mess-Wiese trägt die Welt keinen Lauf ≥ 27,83 m (breitester Lauf 18,7 m bei 2804/−4521). Das liegt an der
Landform, nicht an dieser Bahn.
