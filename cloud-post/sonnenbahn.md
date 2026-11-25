# sonnenbahn 4 — Vorprüfung (ZWISCHENSTAND)

Zweig `sonnenbahn`, Basis origin/main 967bd422 (V18.546.414). Die Wurzel ändert JEDES Nachtbild der Welt: der Fuß der Tonkurve
steht am Schlüssel der Belichtung, die Stufen der Tag-Achse kommen hinter ihm. Diese Abgabe bucht keine Sprosse; gebucht wird, was der
Richter grün misst. Karte 2 gebucht 103 von 1 718 (der Stand der Karte im Zweig punkte-maschine).

## Geschnitten

Der Chokepoint ist die EINE Tonkurve `welt-licht.js` `tonKurve` — derselbe Leser für Welt und Bühne.

- **Vorher.** Der Fuß der Kurve (Khronos PBR Neutral: x − 6,25·x² unter 0,08, sonst − 0,04) lag am ganzen k. In der Nacht (n −2,17)
  stand der Median des Bodens im Eingang 0,035, ganz im Fuß: jede Blende des Bodens wurde zwei. S0 an der GTX 1050 bei Mond 22°:
  Luma 4 lag 1,31 Blenden unter dem Median, abgesoffen im Licht 5,6 %.
- **Nachher.** Belichten auf den Schlüssel → FUSS (am kleinsten Kanal × 2^−n, sein Abzug × 2^n) → die Stufen n der Tag-Achse
  (`belichtungNachFuss`) → SCHULTER. Die Stufen trägt EINE Uniform je Seite (`tonStufen`), geschrieben nur von den Schreibern der
  Belichtung: die Welt in `_dayNightApplyBelichtung`, die Bühne in `buehne`. Am Tag ist n = 0 und die Kurve Zahl für Zahl dieselbe.
- **Was fällt.** Nichts Paralleles. Es gibt keinen zweiten Fuß, keinen Schalter, keine Kopie der Kurve in der Welt.

## Die drei Proben am Gesetz (Entscheid des Koordinators 25.11.)

1. **S0 BILD — der Feuerkreis netto.** Netto heißt: der Kreis mit Pool minus der Kreis ohne Pool, bei GEHALTENER Blende (das k des
   sauberen Schusses, über `_blendeBestellen`).
   - GTX 1050: brutto 0,3331 · ohne Pool 0,0193 bei k 26 054 · **netto 0,3138** (Soll ≥ 0,15).
   - Der Mutant „Pool leer" fährt denselben Weg: netto 0, getroffen. Selbsttests 18 von 18.
   - Täter auf dem Weg: die Zeile des Schusses las k erst nach der Rückgabe der Blende (150 415 statt 26 054). Sie liest jetzt das k
     des gezählten Bilds.
2. **RAUCH WAND — die Mitte aus dem Gesetz.** Die Eichung `eckeHell` [134, 144] fiel. Die Probe RUFT `tonKurve` und
   `_nachtAuge` auf einer Rechen-Form von TSL: den Rumpf des Auges und `NACHT_AUGE` aus dem Stamm-Text über `scripts/lib/stamm.cjs`.
   Keine Kopie einer Formel.
   - **Gesetz 150,70 · gemessen 150,77 · alter Fuß 143,39 (ROT).** Band ±5, `eckeSchwarz` bleibt.
   - Das Auge der Nacht hebt die helle Wand um +3,97 (ohne Auge gemessen 146,80, Gesetz der Kurve allein 146,85). Der Bloom trägt
     0,00. Mit der Kurve allein lag der alte Fuß im Band: die Probe war blind.
   - Mutant K0F (die Uniformen der Stufen auf 1) im Lauf. Die Selbsttests „Welt im Bild" (33,01) und „alter Fuß" treffen;
     Selbsttest der Post-Kette 160 von 160.
3. **GODRAY-LAGE — der Finder bleibt wie auf main.** Der Schnitt wirkt in diesem Bild nicht: Uhr 0,3, n 0, k 1,102. Mit den
   Uniformen auf 1 ist das Bild Byte für Byte gleich, 12 288 von 12 288.
   - Bei 64×48 zeigt das Bild keine Scheibe, nur das weiße Plateau des Hofs (250–252 Luma, Zeilen 15–24).
   - Der Finder von main misst 0,501/0,419, 0,001 vor seiner Blind-Wache.
   - EIN Lauf sah ein anderes Bild (41,5 % statt 86,49 % geänderter Pixel).
   - Beides ist ein Fund mit Adresse beim Koordinator, nicht diese Welle. Das Bild mit Fund liegt im Zweig koordination unter
     bericht/2511-sonnenbahn (godray-lage-kopf3, PNG).

## Gemessen: vorher ↔ nachher (GTX 1050, dieselbe Welt, dieselbe Kamera)

| Ort | vorher | nachher |
| --- | --- | --- |
| Mittag, zwei Wiesen-Blicke | — | 0 Pixel anders, k gleich |
| S0 Boden der Nacht 1–3 m, Luma am Gesetz | 23,3 | 44,3 |
| S0 abgesoffen im Licht der Nacht | 5,6 % | 0,0 % |
| S0 Feuerkreis aus 2 m (brutto) | 0,293 | 0,333 |
| S0 Farbton des Feuers netto | 33,3° | 28,1° (Soll 28–45°) |
| Start-Dorf Mitternacht, Bild-Luma | 91,7 | 102,7 (main 25,2) |
| Abend-Stadt Auge B, Uhr 0,85, k 24 310 | 68,2 | 80,6 |

**Die zwei bestellten Zahlen zur grauen Nacht.** Start-Dorf, Uhr 0, Sommer, dieselbe Kamera; „ohne Schnitt" ist dieselbe Welt mit
den Uniformen der Stufen auf 1.

| | main 486a6685 | Kopf | Kopf ohne Schnitt |
| --- | --- | --- | --- |
| Sättigung des mondbeschienenen Bodens (Median, Pflaster) | 0,111 | 0,185 | 0,326 |
| Luma des hellsten Himmels-Zehntels | 28,8 | 215,5 | 211,5 |

Der helle Himmel der Nacht kommt nicht vom Fuß (+4 Luma). Er steht schon in der Welt vor dem Schnitt (der Messer der Belichtung
liest den Pool im ganzen Bild, sonnenbahn 2).

## Tore

- GTX 1050 am Kopf: gate:pruefbuehne-licht GRÜN (S0 netto 0,3138, Farbton netto 28,1°).
- check:statik GRÜN an Kopf 3 (993 s). Kopf 4 ändert nur eine gedruckte Zeile; check:statik läuft dafür nach der Regel des
  Koordinators nicht neu.
- **Kopf 4 heilt den BLOCK von Kopf 3.** Die Radeon-Probe (Lauf 45571669607) las die Selbsttest-Zeile „S0 NACHT (die Sicht des
  Mondes)“ als ROT: dort stand „im Licht ROT“ ohne Melde-Wort.
  - Die Zeile druckt jetzt „im Licht → ROT“. Keine andere neue Zeile der Welle trägt ROT.
  - Lokal (GTX 1050): gate:pruefbuehne-licht Exit 0, der Leser des Probe-Kopfs (`scripts/lib/urteil-zeile.cjs`, `probeUrteil`) über
    das Log GRÜN, 0 rote Zeilen. Farbton netto 28,1°.
- gate:post-kette, RAUCH WAND: GRÜN auf beiden Geräten.
  - GTX 1050 und GTX 1060 messen gleich: hell 150,77 · 150,77 · 150,76 · 150,76 im Band 145,70–155,70.
  - Der Mutant K0F (alter Fuß) misst 143,38–143,41 und fällt ROT.
  - Der Beleg der 1060 ist der WIP-Lauf am Kopf e4b04dda (GPU-Probe 45564820647, omen-gtx1060).
- Station `erleben.spieler.zeit#1` am Kopf e4b04dda (GTX 1050): Richter GRÜN.
  - Sonnenbahn-Fehler 0° (Soll ≤ 1), 100 Sonnen-Proben.
  - Preis UNGEMESSEN unter Last ×1,60 (p95 66,69 ms).

## Offen

- **Farbton netto je Gerät.** Er kommt aus dem Probe-Ruf dieses Kopfs (1060 / Radeon); die Zahl steht im Bericht an den Koordinator.
- **RAUCH UNTERSEITE und RAUCH ZUG [rot auf main gtx1050 rauch].** Beide Zeilen sind schon an main rot, ohne Leser dieser Welle. Der
  Ruf dieses Kopfs nennt gate:post-kette deshalb nicht (Regel des Koordinators). Die Zahlen je Gerät:
  - UNTERSEITE, Soll 4,8–7,2: GTX 1050 main 2,84 · Kopf 3,09; GTX 1060 Kopf 3,09.
  - ZUG, Soll 1,7–2,3: GTX 1050 main 1,604 · Kopf 1,553; GTX 1060 Kopf 1,553.
  - Der Kopf rückt UNTERSEITE zum Soll hin, ZUG um 0,05 davon weg.
