# Post an w26-klang-schritt

## 09.11. 14:38 — ABGABE 3401f697 (Cloud-Sitzung w26-klang-schritt)

ABGABE 3401f6971982fa5270cd17ed46343399723c52b3

- Geschnitten: `klang-core.js` `SCHRITT` · `schrittBand` · `schrittKlang` — der Schritt klingt aus dem Gesetz seiner Stoff-Zeile:
  die Ferse ein Hertz-Kontakt im Band von TREFFER_PAAR ((E/1 GPa)^(2/5), Pegel (E/eVoll)^(2/5)), der Nachklang mit τ = 1/(π·η·f), das
  Knistern loser Böden (PhISEM) im Band (E/ρ)^(2/5)/d, die Lastübernahme ⅙ des Stands aus dem Gang (Tastgrad × 2π/ω). SCHRITT_TIMBRE
  (21 Hand-Filter) fällt ganz. `stamm/bau-vorlagen.js` `_defaultMaterials`: η (Cremer/Heckl/Petersson) und d (Halm 4/σ, Blatt 2/σ der
  Brennstoff-Modelle, Krume, Glut, Tropfen) je Zeile, E schreibbar wie ρ; `stamm/klang.js` `_schrittKlangParams` und
  `_playSchrittOneShot` lesen die Zeile über `_schrittGesetz`.
- Der Täter beim Namen: der Stoff unter dem Fuß WIRD gelesen und die Probe läuft über drei Stoffe (gras, stein, laub). Stein klang
  aber 60 ms aus der Hand-Tafel, am Abgriff der Station 0–38 ms (Radeon 87537d3f roh: 7 Bursts zu 0–38 ms) — auf der GTX fiel er
  zwischen die Abfragen (n 4 < 5). Der Abstand blieb „—", weil das Urteil ihn erst ab drei Stoffen mit n ≥ 5 rechnet.
- Gemessen (die Station wörtlich: `schrittSeite` aus g6.js in der Null-Welt, ihr Urteil per require aus punkte-maschine; an den
  GTX-Orten von 87537d3f, 60 s Vorlauf, CPU ×4 wie die langen Bilder der GTX — main zeigt dort Stein n 3 wie die GTX n 4):
  main K4#1 ROT „2 Stoffe mit ≥ 5 Schritten", K4#2 ROT „gras 5340 (n 10) · laub 6145 (n 13), kleinster Abstand —" →
  Zweig K4#1 GRÜN „gras 6071 (n 16) · stein 4647 (n 14) · laub 8613 (n 23), kleinster Abstand 1424 Hz", K4#2 GRÜN (Motor r 1,0000 ·
  Landung 0,42 dB je m/s, r 0,9975 · Doppler 1,0001). Ungedrosselt GRÜN (stein n 9, 1427 Hz).
- Die Linse: `gate:gegenstand-stoff --tafel` SCHRITT — jeder Schritt klingt länger als seine Lastübernahme (105 ms; Stein +35 ms),
  der Täter (ein Klick der Hand-Tafel für jeden Stoff, im Lauf der Sabotage über `leihe`) ROT an 7 von 7; die Wirkung heißt nach
  ihrer Spalte E (Härte × 2^(5/2) → beide Bänder × 2, an 7 von 7 Stoffen grün). Decke: der tote Rückfall von bau-buch und werkstatt
  auf die dichteste Zeile nach Tags fällt, scripts −1 Atom.
- Grün am Kopf: `npm run check` · lint · format · `playtest:fast` 21/21 · `npm run playtest` „Alle Invarianten OK" (Schritt-Band
  A/B 6/6 · 5/5, C, E 3/3) · `gate:welt-boot` · `gate:gegenstand-stoff`. GPU-Probe im Kopf: gate:gegenstand-stoff, gate:klang-zensus.
- Ehrlich offen: die Station auf GTX und Radeon misst der Koordinator; die Landung liegt am Bus 3,0–4,0 dB leiser (1 m −55,8 statt
  −52,8 dB, je Stufe +0,9 bis +1,5 dB); Glut↔Holz und Eis↔Holz liegen 120–220 Hz auseinander (Gesetz, nie nebeneinander auf der
  Wiese); Leib und Fleisch (E 1 MPa) schreiten unhörbar; `gate:klang-zensus` steht im Cloud-Container nicht ein (DIE WELT STEHT
  NICHT, an main ebenso).
- FUND (punkte-maschine `stationen/g6.js` `schrittSeite`, Größe S): der Abgriff zählt Bursts an einer Abfrage im Haupt-Faden
  (setInterval 8 ms, Lücke > 30 ms = neuer Schritt) — 4-fach gedrosselt zerfallen 5 Laub-Tritte in 9 Bursts, 6 Stein-Tritte fallen
  auf 4 (an main). Kriterium: n = Tritte ± 1 bei Drossel 1 und 4 (Abgriff im Audio-Faden oder an `_schrittKlang.schritte`).
- FUND (dieselbe Probe, Größe S): `suche` liest den Stoff, bevor der Wald steht (`karteDa` wartet nur auf `_bodenSichtAt`) — lokal
  direkt nach dem Boot fand sie quarz −221,3/−1064,7 und glut −281,7/−1009,6, wo der Fuß danach Laub las (Kronen-Streu 0,6).
  Kriterium: das Etikett der Tritte ist an ≥ 80 % der Stoff der Suche.
- Beste Praxis: physikalisch gestützte Schritt-Synthese nach Turchet, Serafin, Nordahl et al. 2010 (fester Boden: Stoß mit Steifigkeit
  und Dämpfung, loser Boden: PhISEM nach Cook 1997), die Ferse→Ballen-Hülle nach Cook 2002 („Modeling Bill's Gait") und Farnell
  („Designing Sound", Footsteps).

## 14:45 Koordinator
ABGABE 3401f697 ist angenommen und fährt als **z347**. Der Schritt aus dem Gesetz der Stoff-Zeile statt 21 Hand-Filtern ist genau der Schnitt an der Wurzel. Nach der Landung misst die OMEN klang.K4 auf der GTX. Weiter, falls du Kraft hast: Die übrigen Kriterien der Klang-Domäne stehen in punkte-maschine `stationen/` (klang.K1–K5). Nimm das nächste, das an main ROT oder UNGEMESSEN ist, mit Zahl.
