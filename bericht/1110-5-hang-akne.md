# Bericht 1110-5 — die Hang-Akne (Schatten-Domäne)

1. **Geschnitten:** Der Boden trägt am Terminator die Zuwendung seiner wahren Normale selbst. Sein empfangener Schatten wird mit `smoothstep(0, 0,08, N·L)` multipliziert (`receivedShadowNode`, `SCHATTEN_KASKADE.zuwendungSaum`). Ob ein abgewandter Hang im Licht liegt, entscheidet damit nicht mehr allein der Schatten-Test. Zweig `welle-m-hang-akne` 2c402d28.
2. **Gemessen** an der 30°-Rampe im Software-Holz mit Schatten, Sonne am Terminator (N·L −0,002):
   - main: 11,7 % der Rampe fleckig gegen 0,2 % ohne Schatten.
   - Kopf: 0 %.
   - `gate:schatten-terminator` ist auf main ROT beim Namen, auf dem Kopf GRÜN, lokal 78–119 s.
3. **Ehrlich offen:** Auf der GTX zeigt dieselbe Rampe im Bühnen-Mittag keine Schatten-Akne. Die Streifen der Stations-Kamera A sind Stoff, kein Schatten (Übergabe an K17). Die Kontrast-Zahlen des Integrators (0,56 / 0,37 / 0,36) habe ich unter keiner Sonne nachgestellt.

Befund: Nachtrag zu `auftrag/1110-3-omen-abab-v18540.md` (Hang-Akne an s2-hang30, Integrator V18.540, swiftshader) und K17 („Dorfhang −62/−9: helle Flecken auf dunklem Grund“). Basis main 2c8deda9. Rohdaten: `bericht/1110-5/`.

## Die Wurzel

- **Die 2,5D-Lichtung des Bodens:**
  - Der Boden-Stoff flacht seine Schattierungs-Normale ganz zur Senkrechten (`TERRAIN_NORMAL_FLATTEN` 1,0), dazu kommt ein Bump.
  - Jeder Hang wird damit so schattiert, als sähe er senkrecht zum Himmel.
- **Der Schatten-Test:**
  - r184 schiebt den Lookup um `normalWorld × normalBias`, also entlang dieser geflatteten Normale, nicht entlang der Fläche.
  - Ob die Sonne einen Hang trifft, entschied am Terminator (N·L der wahren Normale ≈ 0) darum allein der Schatten-Test. Der rauscht dort.
- **Gemessen:**
  - Software-Holz `holz=voll`: `software/sw-rampe-az.txt`, 8 Azimute × 20°/40°.
  - Akne nur am Terminator: bei Azimut 45°/315°, Sonne 20° (N·L −0,03) 2,2 % / 2,9 % Flecken.
  - Bei N·L −0,002 (Sonne 22°): 11,6–11,7 % (`software/sw-zuwendung.txt`, `software/gate-main.txt`).
  - Sonst sauber.

## Schnitt (`anazhRealm.js`)

- **`_buildPbrNodeMaterial` (Boden-Zweig der 2,5D-Lichtung):** `mat.receivedShadowNode = s × smoothstep(0, zuwendungSaum, N_wahr · uSunDir)`.
  - `N_wahr` ist dieselbe wahre Normale, aus der die Lichtung mischt: unter dem Himmel `normalWorldGeometry`, sonst mit Flächen-Vorzeichen.
  - `uSunDir` ist die Richtung des aktiven Körpers, gesetzt mit dem Richtlicht.
- **`SCHATTEN_KASKADE.zuwendungSaum` 0,08:**
  - Gemessen gegen 0,15 im Software-Holz: Beide nehmen die Akne. 0,08 ändert den Blick nur bei N·L 0 … 0,08, also etwa 5° Sonne.
  - Bei N·L 0,03 liegt der Median bei 60 statt 91. Ab N·L 0,10 ist er gleich main (`software/sw-zuwendung.txt`).
- **`_windUniformsEnsure`:** EINE Stelle legt den geteilten Wind-Satz samt `uSunDir` an (bisher inline im Gras).
- Der Stamm nennt die Bühne nicht, `gate:worker-dichte` EXIT=0.

## Linse (Familie der Bias-Wand)

`scripts/diag-schatten-terminator.cjs` (`gate:schatten-terminator`, CI Gruppe 5; der Selbsttest fährt mit `gate:schatten-bias`):
- **Lauf:** Werkbank im Software-Holz mit Schatten, Prüfbühne, Rampe s2-hang30, Sonne 22° aus Azimut 45°.
- **Schüsse:** von oben mit und ohne Schatten, je eine Aufnahme nach einem ungezählten Vorlauf.
- **Messung:** nur auf der Rampe, 40 × 40 Weltpunkte.
- **Urteil:** ROT beim Namen, wenn der Schatten die Fleckigkeit um mehr als 1 % hebt. ROT auch, wenn die Sonne fehlt oder die Probe blind ist.
- **Selbsttest:** 4 Fälle.
- **Die zweite Sonne** (20°, N·L −0,034) fährt der Werkplatz mit `SONNEN=2`.

| | main 2c8deda9 | Kopf |
|---|---|---|
| Sonne 22° / 45°, N·L −0,002 | ROT: 11,7 % fleckig, ohne Schatten 0,2 % | GRÜN: 0,0 % / 0,0 % |
| Sonne 20° / 45°, N·L −0,034 | ROT: 2,2 % / 0,2 % | GRÜN: 0,0 % / 0,0 % |
| Laufzeit lokal | 119 s (zwei Sonnen) | 78–119 s |

Rohdaten: `software/gate-main.txt`, `software/gate-kopf.txt`.

Bild (`bilder/main-an.png` gegen `bilder/kopf-an.png`, Ausgabe-Pfad):
- main: Die abgewandte Rampe liegt halb im Licht, mit grauen Mustern.
- Kopf: Sie liegt gleichmäßig im Schatten.

## An der echten GPU (GTX 1060)

**s2-hang30, Bühnen-Mittag** (Sonne 74°, N·L 0,70):
- Kamera A mit gegen ohne Schatten: 0 Pixel abgedunkelt (`gtx/kamA.json`). Gemessen im Kopf-Stand, die Zuwendung ist dort 1, also derselbe Schatten wie main.
- Die Streifen auf der Rampe sind in `bilder/a-main.png`, `a-main-hebel3.png` und `a-kopf.png` gleich: Stoff (die Reihen des Netzes), kein Schatten. Das ist die Übergabe an K17 (das Aussehen der Boden-Fläche).

**Rampe von oben, Sonne aus +z** 15°–60° (`gtx/rampe-reihe.txt`): Auch main ist auf der GTX an jeder Sonne ohne Flecken. Die Akne hängt an der Tiefen-Genauigkeit des Geräts; der Schnitt nimmt die Klasse geräte-unabhängig.

**Dorfhang** (Welt weite-hain, −62/−9, 42°, N·L 0,90, Mittag; `gtx/dorfhang.json`, `bilder/dorf-*`):
- Die hellen Flecken auf dunklem Grund sind Sonnenlicht durch die Kronen. Die welligen Bänder im Licht wirft der Nadelbaum darüber: Ohne Boden-Wurf bleiben sie.
- Der Boden auf sich selbst dunkelt sonnige Pixel um 0,52 % ab (Hebel 1), bei Hebel 2 um 0,65 %, bei Hebel 3 um 0,45 %, bei Hebel 0 um 2,9 % (`gtx/dorf-selbst.txt`).

## Prüfungen (`ende/status.txt`)

| Prüfung | Ergebnis |
|---|---|
| prettier, lint | je EXIT=0 |
| gate:worker-dichte, gate:schatten-bias | je EXIT=0 |
| check | EXIT=0 (die CI-Waage verlangte Gruppe 5 statt 3; Gruppe 5 jetzt 10,3 min, Deckel 11) |
| playtest:fast | EXIT=0 |
| playtest voll | „Alle Invarianten OK“, EXIT=0 |

CI auf 2c402d28 `[ci voll]` war beim Bericht noch nicht gelesen.

## Offen (mit Zahl)

1. **Die Kontrast-Zahlen des Integrators** (s2-hang30, swiftshader, Hebel 1 0,56 / Hebel 3 0,37 / ohne Schatten 0,36) habe ich nicht nachgestellt.
   - Im Bühnen-Mittag zeigt die Rampe weder auf der GTX noch im Software-Holz `holz=voll` Schatten-Akne: Kamera A 0 Pixel abgedunkelt (`gtx/kamA.json`, `software/sw-kamA.json`).
   - Die Akne fand ich nur am Terminator. Die Bedingung seiner Messung (Sonne, Kamera, Holz) bräuchte ich, um sie nachzufahren.
2. **Die Streifen der Stations-Kamera A** liegen im Stoff (gleich mit und ohne Schatten): Übergabe an K17.
3. **Der sonnige 42°-Hang am Dorfhang** trägt ~0,5 % Selbstschatten im Licht, mit dem Hebel nicht monoton (0,45–0,65 %). Kein Schnitt, benannt.
4. **Ein steilheits-abhängiger `normalBias`** im Sinn von Hebel × tan(θ) ist nicht gebaut. r184 hält `normalBias` je Kaskade als Uniform entlang der Schattierungs-Normale, der Stoff kennt die Kaskade seines Fragments nicht. Der Terminator brauchte ihn nicht.

## Status: ZWISCHENSTAND · Übergabe

- **Pflicht-OFFEN Rest:** A · B · C · E stehen unverändert.
- **Zweig:** `welle-m-hang-akne` 2c402d28 (per `git ls-remote`), CI läuft.
- **Werkzeuge:** `p3/ak/` (Skripte in `bericht/1110-5/skripte`).
- **Als Nächstes laut Warteschlange:** Teil C von 1110-2 nach dem K16-Merge.
