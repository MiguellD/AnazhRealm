# haus-stoff — Abgabe (ZWISCHENSTAND)

Zweig `haus-stoff`, gestapelt auf `haus-gestalt` 5e497a9f. Sprosse `karte2.mensch.bau.bauen#1`. Diese Abgabe bucht keine Sprosse:
gebucht wird erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst. Karte 2 gebucht 83 von 1 718
(`vision/karte-2-stand.json` im Zweig `punkte-maschine`).

## Der Schnitt: der Sockel folgt dem Wasser des Orts und bleibt Stein am Holzhaus

Es ist EIN Merkmal, ganz geschnitten. Gefach und Dach dieser Klasse bleiben OFFEN (siehe unten).

- **Stoff.** Die Stile `huette` und `stroh` malten die Rolle `stein` in Blockholz. Unter jedem Holzhaus stand deshalb ein Sockel aus
  Holz, also Holz im Spritzwasser. Jetzt bleibt der Sockel Stein (fachwerk-core STILMODE, die Zeilen `huette` und `stroh`).
  - Quellen: Marx 1891 (die Schwelle „gegen das Spritzwasser zu schützen“) und das Foto Molfsee (Feldstein unter Reet).
- **Höhe.** `foundH` war die Konstante 0,55 m. Jetzt liefert `sockelImWasser(klima)` die Höhe: 0,30 m (Spritzwasserzone, ÖNORM B 2320)
  + 0,25 m · `spendeVerh`, gedeckelt bei 0,95 m (die böhmische Ordnung, Marx 1891). Die Heimat trägt 1, also Marx' 0,55 m.
- **Eingang.** Das bestehende Gesetz gelaende-core `ortGesetz(teil).spendeVerh` liefert die Spende des Orts relativ zur Heimat; am
  Reiseziel ist das planet-core `abflussMm`. Die Welt reicht sie über `_siedlungKlima` → `_foundryRequestSettlement` → `DORF`.
  `DORF` setzt jedem Bau und jeder seiner Fassungen `foundH`. Fehlt dem Klima die Spende, wirft der Kern beim Namen.
- **Labor ohne Klima.** Der Plan bleibt byte-gleich: Prüf-Hash c31204c7cdb89380 über 6 Exporte und 3 Stadt-Kacheln. Die Geometrie der
  Holzhäuser ändert sich auch im Labor, denn ihr Sockel ist jetzt Stein.

## Die Gegenprobe (gate:settlement R5, mit Selbsttest)

Dasselbe Dorf (Saat 7, 18 Häuser, Klima der Heimat) steht trocken (Spende 0), in der Heimat (1) und nass (2):

| | Sockel | Hülle `ext.y1` |
|---|---|---|
| trocken | 0,30 m | — |
| Heimat | 0,55 m | — |
| nass | 0,80 m | trocken → nass +0,50 m an 22 von 22 Bauten |

- Die Mutante „der Sockel liest das Wasser nicht“ fällt ROT in R5: der Sockel bleibt überall 0,55 m, der Hub ist 0.
- R1 bis R4 aus `haus-gestalt` bleiben grün.

## Das Bild (Radeon 890M, WebGPU, Uhr 0,5)

- Vorher ist Kopf 5e497a9f, nachher dieser Kopf, mit denselben Kameras.
- Die Dorf-Kamera schaut auf das Dorf: −718,22 48,24 −877,12 → −720,95 46,24 −936,24.
- Die Nah-Kamera steht bei −693,12 48,40 −872,83 → −705,50 47,00 −881,30. Die Abnahme ist ROT, weil eine Birke 45 % des Vordergrunds
  verdeckt. Die Wand des Hauses ist trotzdem frei.

| | vorher | nachher |
|---|---|---|
| Dorf ms | 225 | 143 |
| Dorf Draw-Calls | 80 | 80 |
| Dorf Dreiecke | 331 289 | 328 798 |

Je Merkmal im Bild, gegen die Fotos:

- **Sockel: ja.** Nah und am nahen Haus der Dorf-Kamera steht ein grauer Stein-Sockel statt Holz. Gegen f3 (Molfsee, Feldstein) stimmt
  das. An den fernen Häusern (L1/L2) ist er nicht lesbar.
- **Schornstein-Kopf: ja.** Er steht jetzt in Stein.
- **Gefach: nein.** Gegen f1 (Lehmstaken) fehlt es: das nordische Dorf ist Blockbau, das Raster liegt als Holz auf Holz.
- **Wetterseite: nein.** Gegen f2 (Schiefer) fehlt sie.
- **Reet: nein.** Gegen f3 fehlt es.
- **Vorkragung: nein.** Gegen f5 fehlt sie.

## Abschluss aus haus-gestalt

- **(a) Der Abdruck f18576b6 → 5e497a9f.** Er nennt 452 Abweichungen und zeigt davon 200 Zeilen. Alle 200 liegen am Ort `dorf`, keine an
  genesis oder wiese. Je Domäne:
  - D3 Plan 134 (die Bäume und Bauten des neu gelegten Plans) und D2 Instanzen 46 (die Vegetation um die neuen Grundrisse).
  - D2, D3, D5, D8 und D9 je 2–3 Halter-Zeilen, D1 Boden 1 und Halter 1, D4 Tiere 2, D7 Licht 2, D5 Mensch 1.
  - Das ist der Ort, an dem das Dorf neu liegt. Die übrigen 252 Zeilen kürzt das Werkzeug weg; sie sind nicht einzeln geprüft.
- **(b) `alpin` auf Meereshöhe.** `ortGesetz` trägt die Höhe des Orts nicht. Es trägt `kuehlungKJeM` und `meerUnterBasisM`, die Höhe ist
  `getTerrainHeightAt` des Platzes. Das Band von `alpin` braucht dazu eine Höhengrenze, die keine Quelle belegt. Das bleibt OFFEN.

## OFFEN (je Punkt: Eingang · Messname · Leser)

- **Gefach = f(Boden, Bestand).** Lehm-Staken, Ziegel oder Brett. Die Gefach-Farbe steht heute je Kultur in der KULTUR-Tafel (`col.gefach`).
  - Eingang: gelaende-core Boden und phyto-core Bestand. Messname: gate:settlement R6. Leser: `HAUS` (RM.gefach).
  - In L2 verliert `lod2Koerper` den Backstein. Messname: studios.K4 Albedo. Leser: `lod2Koerper`.
- **Deckung = f(Klima, Bestand) und Neigung = f(Deckung, Schnee).** Die Zahlen sind belegt: Reet ≥ 45°, Mönch-Nonne 40°, Schiefer 26,5°,
  μ1 = 0,8·(60°−α)/30°.
  - Heute ist `KULTUR.pitch` eine Konstante je Kultur, und `STIL_GRENZNEIGUNG.stroh` steht bei 38° unter der Reet-Regel von 45°.
  - Eingang: `klimaHeute.winter`. Messname: gate:settlement R3/R7. Leser: `bauRezept`, `grenzNeigung`.
- **Sockel am Hang gestuft.** Der Sockel wird am höchsten Geländepunkt gemessen (Marx), talseitig wächst er um Δh.
  - Eingang: `getTerrainHeightAt` unter dem Grundriss. Leser: die Platte des Erdbaus (`ortPlan`).
- **Die Form des Sockels im Wasser.** Sie ist linear und damit eine Annahme. Belegt sind nur die drei Höhen 0,30, 0,50–0,60 und 0,95 m.
- **Der Dachüberstand.** Das Maß ist unbelegt. Abschnitt B von quellen/fachwerk.md nennt keine Regel.
- **`alpin` auf Meereshöhe.** Wie unter (b).
