# Bericht 1310-11 — die Streu-Steine als Watte: der Täter ist die Albedo, der Schnitt ist K17

**Status: ZWISCHENSTAND.**

**Urteil:** Der Täter ist die **Albedo** (Lehre 21), nicht die Form und nicht das Licht.
- Der EINE Stein-Bäcker `buildBoulderGeometry` (phyto-core) liest die Paletten-Hex per `new THREE.Color(hex)`. Im
  Foundry-Worker (r128) landen sie roh in der Vertex-Farbe, im Stamm (r184, ColorManagement) linear. Derselbe Bäcker
  liefert also zwei Albedos.
- Das Geröll der Wiese liegt auf main bei **Y 0,449** (hellste Ecke 0,84), auf **grund-fels 87b4d2f6 (K17) bei 0,211**
  (hellste Ecke 0,284), im Fels-Gesetz ≤ 0,30.
- **Schnitt = K17-Merge (V18.546).** K17 schneidet genau diese Stelle: Die Vertex-Farben im Bäcker fallen,
  `felsStoffNetz` → gelaende-core `felsBasis`/`felsNetz` (Grundton ≤ 0,22, Fels ≤ 0,30), Säulen und Kristalle per FARB-GESETZ.
  Kein eigener Zweig ab main, denn er wäre Zwilling und Konflikt (phyto-core 1404–1470, foundry-core 3622–3800).
- **Nebenterm:** Die stehende Nah-Streu warf nie (`_streuSatzArt` `wurf: false` für jeden Stoff). Ein Commit auf
  grund-fels lässt Holz und Stein werfen (`wurf: !a.wiegt`). An der Wiese ist das klein: 2 Instanzen, 2 560 Dreiecke,
  gpu-bank gleich.

## Gemessen (OMEN, Wiese, Bühne Mittag · Sonne · Sommer, je Seite EINE Sitzung)

**Ecken-Farbe der Nah-Streu-Senke `geroell:1:L0:0`** (`stein.cjs`; Stoff MeshStandardNode, Farbe 1/1/1 → die Ecken-Farbe ist die
Albedo; `stein-main.json`, `stein-k17.json`):

| Seite | Ecken-Farbe (linear, Mittel) | Y | Ecke min–max |
|---|---|---|---|
| main 785cca46 | 0,478 / 0,446 / 0,396 = 0x7a7268 / 255 **roh** | **0,449** | 0,209–0,838 |
| K17 87b4d2f6 | 0,234 / 0,209 / 0,160 | **0,211** | 0,074–0,284 |

- Die Albedo-Tafel trägt dasselbe Bild. Ihre Zeile „fels“ steht auf main bei Welt 0,477 / Labor 0,504, auf K17 bei
  Welt 0,237 / Labor 0,243 (`spec/farbe/albedo-tafel.json` je Zweig).
- `werkbank albedo` findet den Streu-Satz nicht als Klasse, darum gilt die Ecken-Probe.

**Bild-Paar** am selben Haufen (x/z −903,11/−849,62; `geroell-main.jpg`, `geroell-k17.jpg`):
- main: der Haufen weiß, rund, ohne Kante — die Watte.
- K17: grau, mit Facetten-Schattierung, er liest sich als Stein.
- Das Gelände steht auf K17 82,3 m höher (Landform K16/K17), der Blick folgt dem Haufen (y 26,07 → 108,34).

## Der Nebenterm: die Streu-Steine werfen nicht

**Gezählt** (`wurf-k17/zaehle.json`): An der Wiese ist die stehende Nah-Streu EINE Senke (Geröll) mit 2 Instanzen und 2 560
Dreiecken in EINEM Satz. Die wiegende hat 132 Instanzen und 34 762 Dreiecke und bleibt schattenlos.

**Der Schnitt** auf grund-fels:
- `_streuSatzArt`: `wurf: !a.wiegt`. Der stehende Stoff (Holz und Stein: Geröll · Totstamm · Stumpf) wirft in die Kaskaden,
  der wiegende nie.
- Die Playtest-Invariante „je Stoff EIN Streu-Satz“ prüft jetzt `castShadow === stehend`, statt „keiner wirft“.

**Konsum** (`beweis/code.json`): Auf dem Schnitt trägt der Satz aus dem Code `schatten: true` und `castShadow: true`. Der
Live-Schalter aus/an wirkt (`schalter-*.json`).

**Preis** (EINE Sitzung K17, gpu-bank 12 × 3, aus · an · an · aus bei Takt-Median 1 721 MHz; `wurf-k17/bank-*.txt`):

| aus | an |
|---|---|
| 11,82 · 11,77 ms | 11,73 · 11,89 ms |

Das liegt im Band.

**Sichtbar:** An der Wiese nicht.
- Beide Haufen liegen mittags im Baumschatten (`wurf-oben1/2-an/aus.jpg`).
- Der Kasten um den Haufen weicht zwischen an und aus um 2 900 / 6 914 Pixel ab, zwischen zwei Aufnahmen desselben Schalters
  um 5 336 / 6 937 (Wind; `beweis/vergleich.txt`).

## Wände (Schnitt auf grund-fels)

lint 0 Fehler (8 Warnungen, alt), format:check, `node --check`, playtest:fast 22/0, **Puls ci-lokal 18/18**
(`p3/k11/waende/puls/ci-lokal.log`). Die geänderte Invariante lebt im vollen Playtest (CI-Gruppe 11).

## Pflicht-OFFEN Rest

- Der Kontakt-Schatten eines besonnten Streu-Steins im Bild: nicht gezeigt, denn beide Wiesen-Haufen liegen im Baumschatten.
- Die Albedo-Lösung lebt erst mit dem K17-Merge in main.

## Status ZWISCHENSTAND + Übergabe

- Kein Zweig ab main.
- Nebenterm-Commit **grund-fels ab39dad3** (auf K17 87b4d2f6), gepusht `[ci voll]`. **CI 38481361902: 11 von 13 grün,
  darunter der volle Playtest (Gruppe 11) mit der geänderten Invariante.**
  - Rot sind genau die zwei Schritte, die schon an der Basis 87b4d2f6 rot waren (CI 38463298081): voll 7/11 Schritt 74
    „Fahr-Linse des Lebens“ und voll 9/11 Schritt 92 „Kreatur-Linse“.
  - Keine neue Röte; die zwei gehören K17.
- Messbaum `k17-fels` (lokaler Zweig `k11-streu-wurf` = ab39dad3), sauber.
- Werkzeug `p3/k11`: `sitzung.sh` (Albedo + Bild), `stein.cjs`, `wurf.cjs` (zaehle · an · aus), `sitzung-wurf.sh`,
  `sitzung-beweis.sh`, `alle.cjs` + `sitzung-alle.sh`, `vergleich.cjs`.
