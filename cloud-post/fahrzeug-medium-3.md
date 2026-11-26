# fahrzeug-medium-3 — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.fahrzeug.medium#3` (Karte: „+ Wasser: Floß bis Segler · Auftrieb, Krängung, Segel aus dem Wetter · Wende
80–100°, Höhe gegen den Wind > 0; Rollperiode ± 15 %“). Die nächste rote Sprosse derselben Leiter aus demselben Gesetz (der
Fahr-Kern, Koordinator 11:22). Gemessen auf `fahrzeug-medium-2` 9525886 (= fahrzeug-stapel 445b4549 + medium#2 + form#2); der Kopf
folgt dem Kopf fahrzeug-medium-2 auf dem main, der den Stapel trägt.

## Täter (vorher)

- **Am Kern** (`vehicle-core.js`, Linse A12 am Baum 9525886): das Boot fuhr das Gesetz des Wagens. `exportDrive` gab dem Rumpf kein
  Wasser-Gesetz: kein Auftrieb, kein Rollen, kein Segel. Gerudert **0,01 m/s** in 60 s (der Wagen ohne Rad im Wasser, der Ruder-
  Schub ging in den Wasser-Widerstand des Wagens). Rollperiode **1,333 s** (die Wank-Feder des Autos) gegen IMO 2,612 s am Kahn.
  Höhe gegen den Wind **0** (kein Segel im Gesetz), keine Wende.
- **In der Welt** (`stamm/koerper-fahrt.js` `_vehicleProfile`): jedes Studio-Fahrzeug wog als `blech` (3000 kg/m³), `floats` false.
  Der hölzerne Kahn am Anleger (Hs 0,12 m, Streichlänge 881 m) lag **0,37 m unter dem Spiegel** und ruderte in 40 s **0,4 m**.

## Geschnitten

- **`vehicle-core.js` `schwimmForm`** (das EINE Wasser-Gesetz des Rumpfs, aus `bootRumpf` und dem Muskel des Antriebs):
  Verdrängung, Tiefgang leer und beladen, KB (Morrish), IT (Normand) und Cwp (Schneekluth). KG kommt aus Rumpf, Ducht-Sitzenden
  (DIN 33402, 0,9 × 0,45 m Quader) und Mast. GM und GML, Trägheiten Ixx/Iz und die Zusatzmassen. Der Widerstand: ITTC 1957 mit
  Formfaktor plus Wellenterm Fn⁶. Querkraft des Rumpfs aus Helmbold, Querströmung an 5 Gauss-Punkten. Ruder mit Strömungsabriss,
  Riemen aus Zug × Leistung (min(F, P/v)). Schwert, und das Sprietsegel aus dem Wetter: der scheinbare Wind und die beste von drei
  Stellungen (Auftrieb auf die Krängung krenSoll gefiert, Platte, killend), jede begrenzt durch das aufrichtende Moment Δg·GZ
  plus den Gewichtstrimm: die Besatzung (`last`) sitzt im Wind auf dem Dollbord (`trimm` = last·B/2) und hebt das krängende
  Moment auf, bis ihr Hebel ausgeschöpft ist. Am Spitzboot trägt die Besatzung 1 536 N·m, der Rumpf bei 20° nur 135 N·m (GM 0,065 m).
  Wie an jeder Jolle hält die Besatzung das Boot aufrecht. Ohne sie lag das Boot auf krenSoll gefiert (cl 0,27 von 1,4), und die
  Wende lag bei 99,4° statt 91,8° (die Linse fand 94,7° nur, weil ihr 5°-Gitter am flachen Optimum vorbeigriff).
- **`vehicle-core.js` `fahrSchwimm`** (in `fahrTakt` statt Rad und Luft, wenn der Körper schwimmt): u, v, r mit den Zusatzmassen.
  **`fahrStand`**: das Krängen nach der Wall-sided-Formel GZ = sinφ(GM + ½BM tan²φ), Nicken und Tauchen aus GML und der Wasserlinie.
  Kein zweiter Pfad: der Wagen ohne `schwimm` fährt byte-gleich (A1–A11 und B grün).
- **`vehicle-core.js` `bauBoot`**: das Rigg (Mast, Spriet und Segel aus `segeltuch`) aus demselben `schwimmForm`, das fährt.
- **`stamm/koerper-fahrt.js`**: `_vehicleProfile` trägt `schwimm` und `floats` aus dem Kern (T < D) statt der Blech-Dichte.
  `_fahrzeugGestalt` legt die Wasserlinie auf den Tiefgang des Kerns: leer oder beladen, wenn der Spieler sitzt.
  `_fahrSchwimmt` (der EINE Leser „schwimmt“ aus `_koerperWasser`) speist `_wagenSchritt` und `_fahrPlan`
  (`stamm/koerper-bewegung.js`).
- **Linse A12** (`scripts/diag-vehicle-drive.cjs`, gate:vehicle-drive, Familie Fahrzeug): Kahn und Spitzboot gerudert ≥ 1 m/s,
  Rollperiode ± 15 % an der IMO-Formel, Höhe gegen den Wind > 0, Wende 80–100°, die Wende kommt durch den Wind. ROT beim Namen am
  alten Kern („vehicle-core.js exportDrive — der Rumpf trägt kein Wasser-Gesetz (schwimm fehlt)“), Selbsttest 8 Fälle, ≈ 0,5 s.
- **Stations-Kandidat** `cloud-post/fahrzeug-medium-3-station/`: S3 misst die Welt (WASSER_AN, am Messort dorf) statt `nicht`.

## Gemessen

| | vorher | nachher |
|---|---|---|
| Kahn gerudert (Kern, 60 s) | 0,01 m/s | 1,782 m/s |
| Kahn Rollperiode ÷ IMO | 1,333 ÷ 2,612 s (0,51) | 2,255 ÷ 2,612 s (0,863) |
| Spitzboot Rollperiode ÷ IMO | — | 6,739 ÷ 7,221 s (0,933) |
| Spitzboot am Wind 5 m/s | VMG 0 | VMG 1,593 m/s bei 40° (2,29 m/s Fahrt), Krängung 0° (die Besatzung im Wind) |
| Spitzboot am Wind 12 / 18 m/s | — | VMG 2,10 / 2,02 m/s, Segel gefiert auf cl 0,46 / 0,24, Krängung 0° / 3,8° |
| Wende (2 × Kurs über Grund, Polare je 2,5°) | — | 91,8° (Soll 80–100°), durch den Wind in 8,8 s |
| Kahn in der Welt am Anleger | 0,37 m unter dem Spiegel, 0,4 m in 40 s | schwimmt (Kiel 8 cm unter dem Spiegel), 65,5 m in 40 s, Spitze 1,84 m/s |
| Station S3 in der Welt (WASSER_AN, Null-Welt am Start-Ort) | `nicht` (gezählt) | Kahn am Anleger (−436/410, Hs 0,03 m) schwimmt, Roll 2,213 ÷ 2,576 s (**0,859**); Spitzboot im nächsten benannten See schwimmt, Roll 6,722 ÷ 7,221 s (0,931), Wende **91,8°**, Höhe **95,5 m** in 60 s — dieselben Zahlen wie der Kern (VMG 1,592 gegen 1,593) |

Gates am Baum: gate:vehicle-drive GRÜN (111 s, A12 ≈ 1 s), gate:gegenstand-stoff GRÜN (36 s), check:statik GRÜN (der
Vertrags-Akt `MINT_NUR_DATEN=1`: `fahrprofil.schwimm` am Boot, null an den Rad-Rezepten), Stations-Selbsttest GRÜN (544 Stationen,
5 411 Mutanten, 0 falsch). gate:wasser-leben ROT an genau `K10 LEER` (8 Höhlen-Proben, Soll ≥ 20) — byte-gleich am alten Baum
9525886 (`--nur hoehle`, dieselben 8 Proben): geerbt, nicht dieser Schnitt; K11 (BOOT SINKT) und N1 (ANLEGER) GRÜN.

## Offen (ehrlich)

- **Spitzboot bei Hs ≥ 0,8 m**: GM ≤ 0. Das Boot liegt auf seinem Loll-Winkel und segelt nicht, weil Ballast nicht modelliert ist
  (`bootRumpf` trägt keinen Ballast-Kiel). Das Gesetz sagt das ehrlich. Messname: A12 an welle 0,8.
- **Das Segel im Bild** steht mittschiffs: die Schot dreht das gezeichnete Segel nicht (die Stellung `z.segel` ist gerechnet, nicht
  gezeichnet). Messname: das Bild (blick-boot). Der Software-GPU des Containers stürzte beim ersten Weltbild ab, an diesem Baum wie
  am alten 9525886 (Umgebung, nicht der Schnitt). Das Bild steht aus.
- **Der Anleger-Takt** (`_anlegerTakt`) setzt das y eines gerittenen Boots an seinem Steg weiter. Der Tiefgang des Stegs liest
  `R.Tleer` ohne die Masse des Masts (5 mm).
- **Der Spieler im Boot** (`_fahrPlan`) ist verdrahtet, aber in der Welt nicht gefahren. Die Besatzung des Trimms ist die Last
  des Stempels (`last`), nicht der Leib des Spielers.
- **Krängung im Sturm** misst der Kern (3,8° bei 18 m/s). Der Welt-Lauf im Sturm (`boot-welt`) setzte das Spitzboot neben den Steg
  ins Flache: dort liegt es auf Grund. Der Sturm-Lauf im See steht aus.
