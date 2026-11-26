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
  Stellungen (Auftrieb auf die Krängung krenSoll gefiert, Platte, killend), jede begrenzt durch das aufrichtende Moment Δg·GZ.
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
| Spitzboot am Wind 5 m/s | VMG 0 | VMG 0,79 m/s bei 45°, Krängung 19,8° |
| Wende (2 × Kurs über Grund) | — | 94,7° (Soll 80–100°), durch den Wind in 10,6 s |
| Kahn in der Welt am Anleger | 0,37 m unter dem Spiegel, 0,4 m in 40 s | schwimmt (Kiel 8 cm unter dem Spiegel), 65,5 m in 40 s, Spitze 1,84 m/s |
| Station S3 in der Welt | `nicht` (gezählt) | WELT_ZAHLEN |

Gates am Baum: gate:vehicle-drive GRÜN (118 s), gate:gegenstand-stoff GRÜN (36 s), check:statik GRÜN (der Vertrags-Akt
`MINT_NUR_DATEN=1`: `fahrprofil.schwimm` null an den Rad-Rezepten), gate:wasser-leben WASSERLEBEN.

## Offen (ehrlich)

- **Spitzboot bei Hs ≥ 0,8 m**: GM ≤ 0. Das Boot liegt auf seinem Loll-Winkel und segelt nicht, weil Ballast nicht modelliert ist
  (`bootRumpf` trägt keinen Ballast-Kiel). Das Gesetz sagt das ehrlich. Messname: A12 an welle 0,8.
- **Das Segel im Bild** steht mittschiffs: die Schot dreht das gezeichnete Segel nicht (die Stellung `z.segel` ist gerechnet, nicht
  gezeichnet). Messname: das Bild (blick-boot). Der Software-GPU des Containers stürzte beim ersten Weltbild ab, an diesem Baum wie
  am alten 9525886 (Umgebung, nicht der Schnitt). Das Bild steht aus.
- **Der Anleger-Takt** (`_anlegerTakt`) setzt das y eines gerittenen Boots an seinem Steg weiter. Der Tiefgang des Stegs liest
  `R.Tleer` ohne die Masse des Masts (5 mm).
- **Der Spieler im Boot** (`_fahrPlan`) ist verdrahtet, aber in der Welt nicht gefahren.
