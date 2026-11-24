# klima-hebung — Vorprüfung (ZWISCHENSTAND)

Zweig `klima-hebung` von origin/main c9da3a64 (V18.546.396; die Kerne gleich 07693cc8), EIN Schreiber: `planet-core.js`.
Karte 2 gebucht 82 von 1 718. Diese Abgabe bucht keine Sprosse — gebucht wird erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst.

**Geschnitten:** die Hebung eines Gebirges ist EINE Funktion der Konvergenz (`hebungReife`, planet-core.js:280–284): Endhöhe wie bisher
h∞ = 5 km · min(1,6; konv/25), das Tempo am Anfang u0 = konv/40 (konv in mm/a = km/Ma), Reife 1 − e^(−Alter·u0/h∞) — für den lebenden
Bogen (`raender`, :1512) und das Rand-Gedächtnis des vorigen Abschnitts (:778) dieselbe; die Reife je Scheibe (1 − e^(−Alter/20 Ma)
für JEDE Rate) fiel, die Scheibe trägt ihr Alter (`alterMa`). **Gemessen:** am Kamm junger Gebirge (oberstes Fünftel des Orogens,
1 → 2 Ma nach dem Beginn eines Abschnitts, 4 Saaten) 173 → 362 m je 10⁶ a; heute (−1 → 0 Ma) bleibt es 30 m, denn die Abschnitte
des Plans sind ~173 Ma alt und jedes Gebirge von heute ist reif. **Ehrlich offen:** #5 (Lee −50 %) erreicht der Schnitt nicht — die
jungen Ränder des Plans konvergieren mit 2,8 cm/a (Median), −50 % braucht ≥ 1,04 km in 10⁶ a (Schatten-Gesetz, 1,5 km · ln 2);
#1 und #2 fielen am Zensus als reine Stations-Schnitte (Tafel `bericht/2411-klima-front-zensus.md` auf koordination).

## Der Schnitt

| Stück | Datei:Zeile | Quelle (Band) |
| --- | --- | --- |
| u0 = konv/40: Verkürzung verdickt die Kruste (35 km auf ~300 km Breite → konv · 0,12), die Isostasie hebt die Oberfläche um ~1/6 der Verdickung | planet-core.js:280–284 | Garzione et al. 2007 (Erwiderung: ΔT/6); Nord-Altiplano 2,5 ± 1 km in ~4 Ma (Garzione et al. 2008); Anden ~1 mm/a bei ~70 mm/a, Taiwan 5–10 mm/a bei 82 mm/a |
| der lebende Bogen liest die Reife seines Rands (konv je Paar) | planet-core.js:1512 | — |
| das Rand-Gedächtnis: dieselbe Reife an Rate und Dauer des vorigen Abschnitts | planet-core.js:778 | — |

## Die Sprossen (vorher → nachher, Export, gleiche Bedingungen)

| Sprosse | vorher | nachher | Soll | Stand |
| --- | --- | --- | --- | --- |
| `planet.kopplung.land-meer-luft#5` Hebung am Kamm junger Gebirge | 173 m/Ma | 362 m/Ma | ≥ 1 040 m/Ma (Lee −50 %) | offen: `leeProzent`, Leser die Station s5 |
| dasselbe, das Tempo am Anfang | 1/20 Ma · h∞ für jede Rate | konv/40 (25 mm/a → 0,63 mm/a, 80 mm/a → 2 mm/a) | 0,5–2 mm/a (Band) | im Band |
| dasselbe, heute −1 → 0 Ma an 494 konvergenten Punkten | 30 m | 29 m | — | reif (Abschnitte ~173 Ma) |
| `planet.kopplung.gegenwart#2` Gipfel auf Konvergenz | 98,6 % (main) | 98,6 % (356 von 361) | ≥ 95 % | an main grün gemessen; die Akten (46,3 %) sind stale |

## Die Wände (am Kopf des Zweigs)

- `node scripts/diag-planet.cjs` (welle1) GRÜN 104 s · `--selftest` GRÜN 63 s · `--anker` GRÜN 5 s · `--bytes` GRÜN 273 s (VERSION planet-h2-14 → 112f7c97… = Tafel; die Relief-Karte erde-09 bewegt sich, weil ihr Abschnitt jung ist)
- `node scripts/diag-betriebsgesetz.cjs` GRÜN · `node scripts/stamm-umzug.cjs --lint` GRÜN (keine Stamm-Datei geändert)
- `node scripts/diag-kopplung.cjs` GRÜN 13 s unter dem GPU-Schloss (F2 Gleiten · F3 Wind und Feld · F4–F6 Gras und Böe · F7 Gasse: alle Kopplungs-Invarianten OK)
- Das Bildpaar (Pflicht #5, am Export statt im Spiel — die Sprosse ist nicht erreicht): im Zweig `koordination` unter probe-post/klima-hebung/hebung-zsp8-relief.png, `diag-planet --bildpaar` oben der Kern von main, unten der Schnitt, Saat zsp-8, t = +26,15 Ma (2 Ma nach dem Beginn eines Abschnitts), Relief 512 px. Was ich sehe: die Kontinente sind auf der ganzen Kugel gleich; der Inselbogen im West-Becken trägt unten einen dunkleren Graben und eine dichtere Kette roter Bogen-Kegel — der junge Bogen wächst schneller über die Schwelle der Kegel (s > 0,08).

## Ehrlich offen (Sprosse · Grund · Messname · Leser)

- **#5 Lee −50 %** · die jungen Ränder des Plans sind langsam (2,8 cm/a), ein Kamm hebt sich in 10⁶ a um ≤ 0,4 km; −50 % am Schatten
  braucht 1,04 km · `leeProzent` · Station s5 im Zweig `punkte-maschine`, sie muss das Lee am jungen Gebirge messen (Zweig `pm-klima-front`).
- **#1 Luv/Lee ≥ 2** · echte Ketten geben 1,36 (Wetter) / 1,50 (Kern mm/a), Luv nur 325 mm/a: dem Gesetz fehlt der Hang-Aufwind (Smith &
  Barstad 2004, Quelle ∝ Feuchte · U·∇h, Verzögerung τ ≈ 1 000 s) · `luvLee` · `planetKlimaR` (planet-core.js:2212).
- **#2 Rang ≥ 0,7** · je 10°-Gürtel 0,18–0,44 · `rang` · `planetKlimaR` und die Station s2.
- Das Gedächtnis der Nähte (`gedaechtnisHoehe` · (1 − e^(−a/20 Ma)), planet-core.js:1372) wächst noch mit der festen Zeit — die Naht
  trägt keine Rate.

## Kopf

Basis origin/main `c9da3a64777a0e13ee4bbcd1a40c274a2ea9d4f0` · der Kern-Schnitt `8fab5847e4dfd4ec32b297a791a0b3e205297b19` (WIP) · dieser Bericht und das Bildpaar reisen im Vorprüf-Commit darüber (ein Commit, ein Push).
