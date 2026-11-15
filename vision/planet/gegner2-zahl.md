# Gegner Statistik und Kosten gegen BERICHT-2 (15.11.2026 01:52–02:19, Kopf e33f1413 gegen d660f478) · ZWISCHENSTAND

**Drei Sätze.** Geschnitten ist nichts (nur gelesen und gemessen, Kern und Richter unberührt). Gemessen: auf 12 frischen Saaten
erde-31…42 (von keinem Macher je gerechnet) kippen vier Zeilen, die der Bericht GRÜN führt, auf ROT — `hyps.bimodal` 11/12 → **8/12**,
`gebirge.vorn` 90 → **68 %**, `land.fern1000` (Bericht 8,8 %) **7,6 %**, `gebirge.vorn.zeit` (Bericht 84/85 %) **75/90 %** —, die Kosten
halten (Punkt ×0,70–0,73, Scheibe kalt ×0,42–0,44, Sprung bis 2 048 Punkte ×0,44–0,46), aber das Band ≤ 1,03 × trägt eine falsche
Herkunft (dasselbe Werkzeug dreimal: Klima ×0,917–1,083, Ort ×0,928–1,214), und an den Abschnitt-Wechseln springt die Höhe bis 273 m
in 2·10⁻⁵ Ma, weil der Nachklang nur hA mischt, nicht hB. Ehrlich offen: die vier Kipp-Zeilen, der Nachklang-Rest, der Memo-Schlüssel
von `ortAnkerRoh` ohne `regler`, die Herkunft des Kosten-Bands — Konsum im Spiel 0 % (`ort.leser`).

Roh-Ausgaben und Sonden: `artifacts/profiband/auge/planet-kern/welle2/gegner2-zahl/` (`neu-*.txt` = Kopf, `alt-*.txt` = d660f478 über
`PLANET_KERN`, beide mit DEMSELBEN Richter des Kopfs; `diag-frisch.cjs` = `scripts/diag-planet.cjs` des Kopfs mit genau einer Zeile
geändert: `SAATEN` beginnt bei erde-31; `sonde-*.cjs` die eigenen Proben). Laptop unter fremder Last (Referenzfahrt 119–330 ms gegen
REF0 104,6 ms); Kosten nur als Paar direkt nacheinander.

## 1 Bänder gegen ihre Herkunft — kein Band bewegt, eines falsch begründet

- bau1 · bau2 · bau3: zwischen d660f478 und e33f1413 ist im Richter KEINE Schwelle geändert. Gelesen: alle entfernten Zeilen des Diffs
  (`git diff -U0 d660f478..HEAD -- scripts/diag-planet.cjs`): nur der Text von `zeit.stetig` (Täter-Liste angehängt, Bedingung
  `su === 0 && kmx <= 150` gleich), `planVon` (Jahr 365 aus dem Ort-Gesetz, R5) und der Rahmen. `sprung()`, `ortKosten()`,
  `saatStatistik`, `hypsBimodal` byte-gleich zu d660f478.
- `--richter gesicht`: die Bänder stehen wörtlich wie in ENTSCHEID-2 (`land.ellipse` ≤ 0,85 · `land.stuecke4` 40–100 · `land.fern1000`
  8–22 % · `meer.binnen` 1,5–6 % · `innen.altguertel` 5–25 % …). `grenze.bogen` hat in 0a3ea0aa das MASS gewechselt (Fenster ±2 000 km),
  das Vorher ist mit dem neuen Mass nachgemessen, das Band 70° blieb — sauber.
- **`kosten.punkt.g0` / `kosten.klima.g0` / `ort.kosten.g0` ≤ 1,03 × — Herkunft falsch.** ENTSCHEID-2 §G3: „3 % ist die Streuung des
  ABAB“. Dasselbe Werkzeug (`--kosten g3 <d660f478>`) dreimal direkt nacheinander, gleicher Kern:

  | Zeile | Lauf 1 | Lauf 2 | Lauf 3 | Bericht |
  |---|---|---|---|---|
  | `kosten.punkt.g0` | ×0,696 | ×0,726 | ×0,729 | ×0,757 |
  | `kosten.klima.g0` | **×1,083 ROT** | ×0,950 | ×0,917 | ×0,951 GRÜN |
  | `ort.kosten.g0` | ×0,928 GRÜN | **×1,175** | **×1,214** | ×1,101 ROT |
  | `zeit.sprung.ref` | 111 ms | 138 ms | 112 ms | 112 ms |

  Die Streuung von Klima und Ort ist ±8 % bzw. ±14 %, nicht 3 %: die Zeilen `kosten.klima.g0` und `ort.kosten.g0` urteilen am Rauschen,
  ihr GRÜN wie ihr ROT im Bericht ist kein Urteil. Das Band ist nicht bewegt worden, um grün zu werden; seine Begründung trägt nicht.
  Neu zu begründen (Koordinator): entweder das Band an die gemessene Streuung oder die Messung länger (der Punkt mit 8 000 Proben
  streut ±2 %, Klima mit 3 000 und Ort mit 40 Orten nicht).

## 2 Zwölf frische Saaten (erde-31…42), derselbe Richter des Kopfs

„Bericht“ = Kopf an erde-01…12 (Roh `g3-nachher/richter-*.txt` des Machers). Fett = das Urteil wechselt gegen den Bericht.

| Messname | d660f478 frisch | Kopf frisch | Bericht (erde-01…12) | Band |
|---|---|---|---|---|
| `hyps.bimodal` | 11/12 GRÜN | **8/12 ROT** | 12/12 GRÜN | ≥ 0,9 |
| `zeit.statistik` 0 · −50 Ma | — | **8/12 · 10/12** | 12/12 · 12/12 | ≥ 0,9 je Zeit |
| `gebirge.vorn` | 90 % GRÜN | **68 % ROT** | 72 % ROT | ≥ 80 % |
| `gebirge.vorn.zeit` | — | **75 % / 90 % ROT** | 84 / 85 % GRÜN | ≥ 80 % je Seite |
| `land.fern1000` | 7,4 % | **7,6 % ROT** | 8,8 % GRÜN | 8–22 % |
| `schelf.anteil` | 4,5 % GRÜN | 3,0 % ROT | 3,3 % ROT | 4–12 % |
| `vulkan.zahl` | 741 (322–1 040) GRÜN | 618 (**180**–1 066) ROT | 656 (250–1 011) ROT | 300–3 000 je Saat |
| `kueste.dimension` | 1,179 | 1,155 (Kante) | 1,162 | 1,15–1,35 |
| `meer.volumen` | 1,15 % ROT | **0,87 % GRÜN** | 1,26 % ROT | ≤ 1 % |
| `platten.zahl` | 11/12 ROT | 12/12 GRÜN | 12/12 GRÜN | jede Saat |
| `superkontinent` | — | **75 %, GRÜN** | 68 % ROT | ≥ 70 % |
| `innen.streuung` | 0,315 | **0,474 GRÜN** | 0,382 ROT | 0,40–0,65 km |
| `land.median` | 0,743 km | 0,937 km | 0,704 km | 0,2–0,6 km |
| `land.ellipse` | 0,901 ROT | 0,840 GRÜN (max 0,897) | 0,832 GRÜN | ≤ 0,85 |
| `land.stuecke4` | 28 | 33,5 ROT | 33,5 ROT | 40–100 |
| `meer.binnen` | 0,9 % | 1,8 % GRÜN | 2,1 % GRÜN | 1,5–6 % |
| `kont.naht` | 176 | 38,5 | 41 | 0 |
| `klima.kante.flach` | 4,22 % | 1,97 % | 1,38 % | Median ≤ 1,0 % |
| `relief.messer` | 1 883 | 939 | 1 231 | ≤ 200 |
| `grenze.stufe` konv · div | 98,9 · 39,9 % | 16,9 · 9,8 % | 17,5 · 10,4 % | ≤ 10 · ≤ 5 % |
| `innen.altguertel` | 1,7 % | 6,1 % GRÜN | 6,0 % GRÜN | 5–25 % |
| `innen.schild` | −0,02 | −0,30 | −0,21 | ≤ −0,5 |
| `klima.regenschatten` | 51 % | **33 %** | 40 % | ≥ 80 % |
| `klima.koeppen` B · C · E | 36,1 · 9,3 · 22,7 % | 23,9 · 16,9 · 22,6 % | 26,9 · 13,8 · 24,6 % | — |
| `klima.wueste` BWh | 12,6 % | 8,1 % (5,5–13,1) GRÜN | 9,4 % | ≥ 7 % |
| `zeit.schritt` | — | 7/12 | 9/12 | ≥ 0,9 |
| `zeit.reise` hin und zurück | — | 1 074/1 120 | 1 159/1 204 | 100 % |
| `ort.anker` · `ort.delta.null` · `zeit.rueckkehr` | — | 12/12 · 12/12 · gleich | dieselben | — |

Was daraus folgt:
1. **Das Gesicht hält auf frischen Saaten** (`land.ellipse`, `meer.binnen`, `kont.naht`, `grenze.stufe`, `relief.messer`,
   `klima.kante.flach`, `innen.altguertel` bewegen sich gegen d660f478 so weit wie im Bericht). Diese Gewinne sind keine Saat-Kunst.
2. **Vier GRÜN des Berichts fallen auf frischen Saaten**: `hyps.bimodal` (dazu `zeit.statistik` 0 Ma), `gebirge.vorn`, `land.fern1000`,
   `gebirge.vorn.zeit`. Der Bericht meldet `land.fern1000` (G2) und `gebirge.vorn.zeit` (G2) als „ROT → GRÜN“ — auf frischen Saaten sind
   beide ROT. `gebirge.vorn` ist auf frischen Saaten ein Kipp GRÜN → ROT (90 → 68 %), nicht „entfernt sich“ wie im Bericht.
3. **`hyps.bimodal` ist ein neuer Kipp, den der Bericht nicht nennt** (an erde-01…12 12/12). Die vier fallenden Saaten erde-31, -33,
   -38, -42 haben Abstand 5,0 km und Tal 0,04–0,08 (im Band): es fehlt das lokale Maximum eines Gipfels; zugleich steigt `land.median`
   0,743 → 0,937 km — die Wurzel G2.1 hebt altes Land über 1 km (der Bericht nennt den Hub an `land.median`, nicht an der Hypsometrie).
4. Drei ROT des Berichts sind auf frischen Saaten GRÜN (`meer.volumen`, `superkontinent`, `innen.streuung`): **die Urteile an 12 Saaten
   kippen in beide Richtungen; Zeilen in Kanten-Nähe sind an 12 Saaten nicht entscheidbar.** Der Bericht nennt „Nur 12 Saaten“ selbst;
   gemessen ist jetzt, dass es sieben Zeilen kippt.

## 3 Kosten — ABAB im selben Prozess, frische Saaten erde-31 · -35 · -39, Referenzfahrt vor und nach jedem Block

`sonde-kosten.cjs`, drei Läufe; Faktor = Kopf ÷ d660f478 (Median der 21 Paare, normiert mit der Referenzfahrt des Blocks).

| Maß | d660f478 | Kopf | Faktor Lauf 1 · 2 · 3 |
|---|---|---|---|
| `planetPunkt` fuss 40 | 10,2–25,1 µs | 7,1–18,2 µs | ×0,725 · 0,702 · 0,726 |
| `planetPunkt` fuss 16 | 10,8–25,0 µs | 7,3–19,6 µs | ×0,784 · 0,751 · 0,712 |
| `planetScheibe` kalt (Plan warm bei 0, t = −137…−381 Ma) | 275–735 ms | 121–309 ms | ×0,420 · 0,427 · 0,438 |
| **erster Punkt nach der kalten Scheibe** | 0,04–0,10 ms | **2,1–5,8 ms** | **×61 · 45 · 45** |
| Sprung = Scheibe + erster Punkt + 2 048 Punkte | 298–783 ms | 137–354 ms | ×0,452 · 0,444 · 0,457 |
| `planetScheibe` warm (t + 0,37) | 4,7–13,4 ms | 4,3–11,3 ms | ×0,844 · 0,722 · 0,786 |
| erster Punkt nach der warmen Scheibe | 0,03–0,07 ms | 0,29–0,66 ms | ×9,7 · 7,4 · 12,9 |
| `planetOrt` warm (40 Orte um den Anker) | 0,85–2,29 ms | 0,68–1,70 ms | ×0,743 · 0,694 · 0,810 |
| `planetAnker` kalt | 5,4–13,6 ms | 4,7–14,1 ms | ×1,035 · 0,715 · 0,868 (je Saat einmal, ohne Normierung) |

- **Der Kosten-Schnitt G3 hält, auch ehrlich gezählt.** G3.6 hat die Ketten aus der Scheibe in den ersten Leser verlegt: der erste Punkt
  kostet jetzt 2–6 ms statt 0,05 ms, und `zeit.sprung`/`zeit.sprung.ref` messen nur die Scheibe. Gezählt bis zum ersten Bild (Scheibe +
  erster Punkt + 2 048 Punkte) bleibt der Sprung bei ×0,44–0,46 — die Verlegung versteckt 2–6 ms von 137–354 ms, kein Täuschen.
- `ort.kosten.g0`: an erde-31/35/39 ×0,69–0,81, an erde-01/05/09 (Werkzeug des Machers) ×0,93–1,21. Das ROT des Berichts hängt an Saat
  und Last, nicht am Kern (s. §1).
- Absolut unter der Last: `zeit.sprung` kalt (bau3, frische Saaten-Lauf) bestes 211 ms, `ort.kosten` 2,3 ms — die absoluten Bänder
  (≤ 120 ms, ≤ 1 ms) sind an diesem Laptop heute nicht richtbar; normiert (`zeit.sprung.ref`) 111–138 ms ≤ 250 GRÜN.

## 4 Bytes — gleich

`sonde-bytes.cjs`, Saat erde-37, Zeiten −1 000,05 · −137,3 · −0,4 · 0 · +23,7 Ma, je 2 048 Punkte Höhe (fuss 16) + `planetKlimaR`
(tJahrC, niederschlagMm), an t = 0 dazu Anker + `planetOrt` als JSON: zwei Prozesse vorwärts, ein Prozess rückwärts, `--jitless`, und
rückwärts nach einem fremden Plan (erde-38, zwei Zeiten, Ort) im selben Prozess — **5/5 SHA gleich** je Zeit. Der Diff liest
im Kern nur `Math.sqrt · floor · abs · min · max · imul` neu (Zählung der `+`-Zeilen: max 19 · sqrt 12 · min 9 · imul 7 · abs 4 · floor 2),
kein `Math.random`, keine Wanduhr, kein `process`, kein `try`, kein Rückgriff auf die Umgebung.

## 5 Stetigkeit in t an jedem Abschnitt-Wechsel — 3 Sprünge, Täter benannt

`sonde-stetig.cjs`: 4 frische Saaten, JEDER Wechsel `plan.bilder[b]` (102 im Kopf, 105 in d660f478), je 200 Punkte fest in der
Geographie, h(t_b − ε) ↔ h(t_b + ε), ε = 10⁻⁵ Ma (eine Platte mit 15 cm/a fährt in 2ε 3 m). Sprung = |Δ| > 5 m UND größer als die
Änderung über die 0,01 Ma davor. Kontrolle: Meer-Fächer (10 Ma), Kegel-Takt (3,5 Ma), Zufalls-Zeiten.

| Klasse | Paare | Sprünge Kopf | max Kopf | Sprünge d660f478 | max d660f478 |
|---|---|---|---|---|---|
| Abschnitt-Wechsel | 20 400 / 21 000 | **3** | **273 m** | 1 | 366 m |
| Meer-Fach 10 Ma | 4 800 | 0 | 0,4 m | 0 | 0,7 m |
| Kegel-Takt 3,5 Ma | 4 800 | 0 | 0,2 m | 0 | 0,3 m |
| Zufall | 4 800 | 0 | 0,2 m | 0 | 0,4 m |

Die drei Sprünge des Kopfs (`sonde-taeter.cjs`): erde-32 bei −875,9 Ma +273 m (Rate davor 11 m je 0,01 Ma), erde-33 bei −1,446 Ma
**+175 m, −149 → +26 m: Land taucht in 2·10⁻⁵ Ma auf, 1,4 Ma vor der Heimat**, erde-33 bei −3 636 Ma +9,5 m. In allen dreien wechselt
am Punkt die Platte (0→2, 0→3, 6→5) und die Rand-Art (0→1). Die Terme von hA summieren sich über den Wechsel auf **0,0 m** (Schablone
−828/−442/−795 m, Nachklang +621/+254/+714 m, Boden, Profil, Gedächtnis gleichen den Rest) — der ganze Sprung liegt in `hB·refKm`
(refKm −1 153…−1 299 m, Spiegel gleich). **Täter: `punktKern` (planet-core.js 1211–1212) mischt im Nachklang nur `PK.hA`
(`PK.hA = h + w·(hAlt − hNeu)`), `PK.hB` kommt ungemischt aus dem neuen Abschnitt.** Die Linse `zeit.stetig` sieht es nicht: sie zählt
erst über 1 km und tastet ±0,05 Ma ab. Klasse in beiden Kernen (d660f478: 1 Sprung, 366 m); die Welle hat sie weder geöffnet noch
geschlossen.

## 6 Der Diff d660f478…e33f1413 gegen die GOLDENE DEFINITION

- Zwilling / Flag: keiner im Kern. `PLANET_KERN` ist ein Schalter des Richters (Vergleichs-Kern), kein Pfad im Kern. Die zwei Bänder
  des Krusten-Felds (grob für Wertung und Rand-Gedächtnis, voll für Profil und Rückgabe, G1.3) sind eine Funktion mit zwei Lesern —
  geprüft, ob sie K1 brechen (Punkt auf Kruste ⇒ Platte seiner Gruppe; `sonde-k1.cjs`, 12 frische Saaten × 2 Zeiten × 8 192): Kopf 4 von
  71 437 Krusten-Punkten auf fremder Platte, d660f478 3 von 72 834 — **kein Fund**.
- Rückfall: keiner gefunden (kein `try`, kein `|| 0` an neuen Pflicht-Feldern; `pruefJahr` bricht beim Namen, R5).
- **Memo ohne vollen Schlüssel (neu in R2):** `ortAnkerRoh` (planet-core.js 2207–2212) merkt den Anker-Ort unter
  `sommer|winter|kuehlungKJeM|meerUnterBasisM` — `og.regler` fehlt, obwohl `ortRoh` die Regler liest. Gemessen (`sonde-memo.cjs`,
  erde-36): `planetOrt` mit einem Ort-Gesetz, dessen Regler ×1,2 stehen, liefert nach einem Ruf mit dem alten Gesetz andere Bytes als
  am frischen Plan (7 944 ↔ 7 907 Zeichen JSON); mit geänderter `spendeMm` gleich. Heute ist das Ort-Gesetz je Plan fest, der
  Fehler schläft; mit dem Live-Tausch eines Gesetzes liefert `delta` still den Anker des alten Gesetzes — die Klasse „byte-alt spielt
  weiter“.
- Memos sonst gebunden: Scheiben 24, Hüll-Proben 48, leichte Takt-Scheiben 64; `kegelPl` wächst je (Hotspot, Takt) — beschränkt durch
  die Zeitachse, Zahlen statt Puffer.
- Die Kosten-Verlegung G3.6 (Ketten am ersten Leser) ist kein Rückfall, aber sie verschiebt Kosten aus der gemessenen Scheibe in den
  ungemessenen ersten Punkt (§3); kein Band misst den ersten Punkt.

## Ehrlich offen (mit Messnamen)

- `hyps.bimodal` 8/12, `gebirge.vorn` 68 %, `land.fern1000` 7,6 %, `gebirge.vorn.zeit` 75 % auf frischen Saaten ROT, im Bericht GRÜN
  oder ohne Kipp-Nennung; das Urteil braucht die 30 Saaten des Richters (heute an keinem Kern der Welle gelaufen).
- Nachklang ohne hB (`zeit.stetig` sieht es nicht): 3 von 20 400 Paaren, bis 273 m — eine Linse unter 1 km am Abschnitt-Wechsel fehlt.
- `ortAnkerRoh`-Schlüssel ohne `regler`.
- Herkunft des Bands ≤ 1,03 × (Klima, Ort) trägt nicht; die Zeilen urteilen am Rauschen.
- Nicht gemessen: Karten (GPU und Werkbank verboten in dieser Welle), Bildpaare, 30 Saaten, `zeit.stetig` auf d660f478 mit der neuen
  Linse an frischen Saaten. Konsum im Spiel 0 % (`ort.leser`).
