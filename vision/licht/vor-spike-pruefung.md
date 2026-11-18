# Prüfung des Vor-Spikes (`vor-spike-auge.md`) — was trägt, was nicht (GTX 1050, 18.11., nur gerechnet)

**TRÄGT (unabhängig nachgerechnet, `vor-spike-pruefung.cjs`, eigene PBR-Neutral-Implementierung nach Khronos):**
Licht von 2 000 K (linear R : G : B ≈ 1 : 0,28 : 0,008) auf drei Albedos, Belichtung über 16 Stufen gefahren:

| Stoff | Sättigung im Band Luma 90–150 | Sättigung ≤ 0,75 zuerst bei |
|---|---|---|
| Gras grün (0,10/0,16/0,04) | 1,00 … 1,00 | Luma 184 (247/177/64) |
| Gras fahl (0,18/0,20/0,10) | 0,97 … 1,00 | Luma 167 (247/153/64) |
| weiße Karte | 0,89 … 1,00 | Luma 161 (246/146/62) |

Also: unter reinem Feuerlicht gibt es für KEINEN Stoff, nicht einmal Weiß, ein k mit Luma 90–150 und Sättigung ≤ 0,75; die Sättigung
fällt erst in der Schulter (Peak ≥ 0,76). Der Grund ist die Lichtfarbe selbst: B/R 0,008 ergibt im sRGB-Bild 1 − (B/R)^(1/2,4) ≈ 0,87
vor jeder Kurve, der Versatz der Kurve (min − 6,25·min²) hebt sie weiter. Die 0,81–0,84 des Vor-Spikes am echten Pixel sind niedriger als
meine 0,97–1,00, weil dort die Umgebung A (Mond/Himmel, bläulich) mitleuchtet — die Richtung des Urteils ist dieselbe.
Folge für die 0,75 des Tors `gate:pruefbuehne-licht`: sie misst, wie weit der Fleck IN der Schulter liegt (bzw. wie viel Umgebung
mitleuchtet), nicht die Farbe des Feuers.

**TRÄGT NICHT / NICHT NACHPRÜFBAR ohne GPU-Lauf (darauf baut kein Urteil):**
- **k 0,315 der fernen Kamera in Runde 3** ist geschätzt (aus dem Quellen-Fit Σ E 5,58 lx), nicht geloggt. Gemessen sind nur: nahe
  Kamera Runde 3 k 0,199, Lava k 0,003, Gasse k 1,245. Der „0,6-Stufen-Widerspruch nah ↔ fern" hängt an dieser Schätzung UND an den
  gefallenen Bändern — er ist mit SOLL.md (d) kein Befund mehr.
- **Die Flecke** des Vor-Spikes sind eigene Ausschnitte; seine Runde-3-Werte weichen von meinen Messflecken ab (Wand 28,4 gegen 35,1;
  Saum 151,6/127,9 gegen 179,3; Kreis 188,4 gegen 191,5). Die Luma-Tafeln je Messer (a)–(e) gelten darum nur als Größenordnung.
- **E aus der Geometrie** trifft 3 von 11 Flecken auf ±20 % — die absoluten Lux des Vor-Spikes sind UNSICHER.

**Was der Richter daraus nehmen darf:** nur die Aussage über Kurve und Lichtfarbe (oben, nachgerechnet) und die gemessenen k/Luma der
Runden aus meinen Berichten. Nichts aus den Messer-Tafeln des Vor-Spikes als Zahl.
