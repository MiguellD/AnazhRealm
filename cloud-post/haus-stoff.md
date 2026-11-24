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
- **Der Dachüberstand.** Das Maß ist unbelegt. die Quellen-Zuarbeit (Abschnitt B, Ursache je Merkmal) nennt keine Regel.
- **`alpin` auf Meereshöhe.** Wie unter (b).

## Heilung: das Klima trägt nur das Dorf ohne Wort

- **Ursache.** `_foundryRequestSettlement` (stamm/siedlung-ort.js) gab JEDEM Plan das Klima des Orts, auch dem Plan eines Worts. Das
  betraf den Satz „dorf 7 18“, sein Gedächtnis „d:…“ und die Kacheln seiner Stadt (`viertelWort` und `kachelMassen` mit Klima). Die Stadt
  „dorf 7 30/120/300“ der Messorte stand dadurch alpin statt mediterran: 34 statt 35 Lose, die Kirche #635014 gotisch bei 33,8/26,4 statt
  provenzalisch bei 14,5/37,1. Die Messorte und die Proben nennen aber Anker, Bahnen (`spec/profiband/haushalt.json`), Tore und Stände
  dieses Plans. Fünf CI-Schritte waren deshalb rot: gate:haus-welt (beide Teile, W7 „losstill“ und „bauwand“ blind), die Kreatur-Linse
  Teil 1 und Teil 3 („Los 0 kirche #635014 steht nicht: fiel still“, 54 von 520 Ständen jenseits der Wand) und die Fahr-Linse des Lebens
  (B-h 3 Gattungen, VK bahn[0] außer der Bahn).
- **Schnitt.** Der Plan eines Worts ist eine Funktion des Worts allein: derselbe an jedem Ort und für jeden, der ihn teilt. Am EINEN
  Kanal gilt `wort = dp.wort || dp.kachel`. Der Satz (`spawnSettlement`) und das Gedächtnis „d:“ (`_ortDp`) setzen `wort`, die Kachel nennt
  sich selbst. Das Dorf ohne Wort (die Zellen der Welt, der Messort `dorf`) trägt das Klima wie bisher.
- **Gemessen (lokal, gleicher Kopf).**
  - Kreatur-Linse Teil 3: 44 von 44 Tätern rot, Grund 12 von 12.
  - Kreatur-Linse Teil 1: 46 von 46 Tätern, Grund 8 von 8.
  - gate:haus-welt 1/2 und 2/2 grün, „losstill“ und „bauwand“ fallen rot beim Namen.
  - gate:fahr-leben grün (VK 10 und 23 Uhr, VK-V).
  - Labor-Hash c31204c7cdb89380 unverändert.
- **OFFEN.** Ein Wort an einem fremden Klima baut seine eigene Region (das teilbare Wort geht vor dem Ort). Der Ort spricht nur, wo kein
  Wort spricht · Messname gate:settlement R · Leser `_foundryRequestSettlement`.

## Heilung 2: drei Linsen der Batterie an c6cec836

- **Settlement-Kanal N5.7, O Akt („Plan-Hash Studio ≠ Welt“).**
  - Ursache: der Kanal entschied selbst über das Klima (`wort = dp.wort || dp.kachel`). Der Akt baute über `spawnSettlement` mit
    `wort: true` ohne Klima. Die Linse fragte denselben Plan ohne `wort` nach und bekam ihn mit Klima: zwei Eingänge für einen Plan.
  - Eingang: das Klima ist jetzt EIN Feld des Auftrags. `_foundryRequestSettlement` liest kein Klima mehr selbst. Die Zelle ohne Wort
    legt es in ihren Auftrag (`_zellEingang`: `_dorfBereiten` und das Gedächtnis `_ortDp`), der Akt eines Worts und die Kachel seiner
    Stadt tragen keins. Die Linse reicht im Auto-Dorf das Klima des Orts als Argument (gelaende-core `ortGesetz`: `klimaHeute`,
    `spendeVerh`), im Akt bleibt sie unverändert.
  - Stand: siehe die Plan-Hashes unten.
- **Haus-Fernkörper S3 („holzhuette/s1: Glas L2: Farbe 0,195 von der L0 entfernt“).**
  - Ursache: seit dem Stein-Sockel ist im Blockbau `stein` kein Blockholz mehr. Damit stehen auch Herd, Rauchsammler und Schornstein
    in Stein. Die L0 sieht ihn durch das Giebel-Fenster des Estrichs (je Giebel-Fenster rund die Hälfte der Pixel), die L2 sah Holz.
  - Gesetz: `herdKaesten` ist die EINE Quelle. Der Herd der L0 baut aus diesen Kästen, und das Fern-Fenster der L2 mischt den Stein
    zu dem Anteil in den Raum hinter der Scheibe, zu dem die Kästen die Scheibe decken (Blick senkrecht durch die Wand, wie der Strahl
    der Linse). Der EG-Boden des Blockbaus liegt in Bohlen.
  - Stand: holzhuette/s1 L2/L0 Farbe 0,195 → 0,105 (Soll ≤ 0,15). gate:haus-fern ist grün.
- **Haus-Asset-Vertrag v6 (Golden und Plattform-Probe).**
  - Ursache (Probe): der Herd-Stein kippte zwei Fälle mehr, holzhuette L2 an sin (fachwerk-core.js:321, three `rotation.set` je
    Balken) und alpenchalet L3 an atan (:264, die Neigung `th` der Eindeckung).
  - Gesetz: die Drehung liegt im Raster. Sinus und Kosinus jedes Balken-Winkels und `th` liegen auf 2^-30 (`sc`, `drehQ`), je Bau
    einmal je Winkel gerechnet. Der Balken setzt sein Quaternion selbst (XYZ wie three `setFromEuler`).
  - Stand: cos 26 → 15, sin 11 → 7, atan 18 → 0, tan 14 → 12 (Summe 69 → 34). Die Ratsche fällt auf diese Zahlen, gehoben wird nichts.
  - Golden haeuser.json neu geprägt: 221 von 258 Fällen, die Ecken-Zahl je Fall ist gleich. Darunter die 56 Hütten-Fälle (holzhuette,
    alpenchalet, skandinavisch, norwegisch, russisch, schwarzwald, japanisch je s7/s12345 × L0–L3). Golden siedlung.json neu geprägt
    (7/12 „Villaalto“ und 12345/6 „Grünbach“). Die Pläne weichen höchstens um 4·10^-9 m vom alten Stand ab, Slots und Namen sind gleich.
- **Stand beim Halt (24.11., 15:45).**
  - gate:settlement Lauf 2 am Kopf 2b13e5e9: Selbsttest grün, Golden siedlung.json gemintet. Danach exit 1 ohne rote Zeile in Teil O
    (nach „B/C Selbsttest“). Parallel lief haus-welt 2/2, deshalb vermutlich ein getöteter Prozess oder Speicher. Lauf 3 läuft allein
    (Log scratchpad/hd/st3.log). Die zwei planHash-Werte stehen noch aus. Kein Push ohne grünes gate:settlement.
  - schwarzwald L2 „7 852 / 7 392 gegen 7 000 Tris“ (welt-boot KOSTEN in Teil B, in Lauf 1 und Lauf 2): buildInstance schwarzwald L2
    zählt an main 499f8b57 und am Kopf gleich viel (s1 3 148 · s7 3 232 · s12345 2 766). Der Überschuss entsteht am Welt-Bau (mit `ov`
    des Plans) und ist am Preset nicht neu. Offen: derselbe Welt-Fall an main · Messname gate:asset-contract · Leser welt-boot KOSTEN.
  - haus-welt 2/2 am Kopf noch nicht zu Ende gelaufen (abgebrochen für den Alleinlauf).
  - Exit-Grund von Lauf 3 (15:50): `listen EADDRINUSE 127.0.0.1:4436`. Den Port hält ein fremder gate:settlement-Lauf (PID 26676,
    Log scratchpad/w/sechs/settlement-dbg.log, nicht meiner, nicht beendet). Lauf 2 starb sehr wahrscheinlich an derselben Kollision:
    ein zweiter fremder Lauf (PID 9904, settlement2.log) lief zur gleichen Zeit. gate:settlement braucht den Port allein. Nächster
    Handgriff: warten, bis 4436 frei ist, dann `npm run gate:settlement` allein am Kopf.
