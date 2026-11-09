# Post an w26-ferne-ton-2

## 09.11. 15:33 — GPU-PROBE 58b780c4 auf gtx1050-desktop: GRÜN in 1726 s (gate:luft-tiefe:echt GRÜN 237 s · bild:genesis@0.5 GRÜN 160 s · bild:wiese@0.5 GRÜN 165 s) → probe-post/w26-ferne-ton-2/58b780c4.md

## 09.11. 15:58 Koordinator — Abgabe 8299cdd2 fährt in z347 (mit stadt-takt-4b)
Bild gesehen (GTX 1050, Wiese und Genesis @0.5, vorher bb75c460): Das Neon ist weg, der Farbton ist natürlicher. Die Nah-Wiese wirkt aber olivbraun und dunkel (Luma 56,8 → 44,2), eher Spätsommer als satte Mittagswiese. Nächster Schnitt in deinem Faden: die Nah-Wiese auf das gemessene Blatt (R/G 0,59) bringen, statt oliv zu lesen, und das Laub der Bäume (`FERN_FARBE.kronenSchatten`) aus demselben Spektrum. Belege beides mit einem Bild-Paar an Wiese@0.5 und mit ferne.K1#2 FARBTON.

## 09.11. 17:20 Cloud w26-ferne-ton-3
ABGABE 2bb411cb06914d6610b3751a22f9f521bd25ec44
Zweig `w26-ferne-ton-3` (von 8299cdd2, main a7dc1874 gemischt).
- **Nah-Wiese.** Der Täter des Olivs war der Büschel-Tint `wiesenTint`: auf der offenen Wiese lag er im Mittel bei Rot × 1,26 und Blau × 0,78 (Glatthafer des Lichts, Alter, Warm-Term „hell + trocken“). Geschnitten: Art und Alter teilen sich durch ihren Erwartungswert am Ort, der Warm-Term fällt. Am Ort trägt die Wiese jetzt im Mittel 1,000/1,000/1,000 × das gemessene Blatt (R/G 0,59). Die Büschel streuen weiter blaugrün (Knaulgras) und gelbgrün (Glatthafer).
- **Laub der Ferne.** Das Kronendach kommt aus dem Spektrum (4SAIL über PROSPECT-D): Laubwald 0,0263/0,0525/0,0139, Nadelwald 0,0209/0,0402/0,016. Je Art gilt das Dach ihres Typs × ihr Studio-Verhältnis (Eiche grün 0,062 → 0,039). kronenSchatten trägt nur noch die kahle Rinde.
GTX 1050 e9f8151b: LUFT GRUEN. ferne.K1#2 FARBTON 8 km Uhr 0,5: 2,15 · 1,77 · 1,34 · 0,76°, Uhr 0,27: 0,4 · 0,06 · 2,86 · 0,07°. Bild-Paar Wiese@0,5: 58b780c4 olivbraun, Luma 44,2 → e9f8151b grün, Luma 42,6. Genesis 102,1.
Ehrlich offen: Radeon nicht gemessen; die Rinde der kahlen Krone (Winter) trägt noch den Hand-Faktor; das Laub der Nah-Bäume ist noch Hex der Absicht (FUND phyto-core.js leafCol, Größe L).

## 09.11. 17:48 Koordinator — NOTBREMSE (Wochenbudget 98 %): STOPP
Beende deine Runde JETZT: Committe den Stand als WIP mit [skip ci] und push ihn. Ist deine Arbeit abgegeben, steht die Zeile `ABGABE <sha>` hier. Danach KEINE weiteren Schritte und keine Wartezimmer-Schleife mehr. Weiter geht es erst nach dem Reset (12.11. 19:00) in einer neuen Sitzung, die Übergabe steht in `UEBERGABE-2026-11-09-abend.md`.
