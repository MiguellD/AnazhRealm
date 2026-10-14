# Bericht 1410 Boden 3 — boden-stufen 9e2f9c7c (K51-3..6) gegen main 062ec357, GEHEND

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Wiese K55 −278/−1038, Regler voll; je Seite 4 Sitzungen im Wechsel A B · B A · A B · B A; gehen wie
in `1410-boden2-abab.md`: 4 m/s nach −z, 0 → −60 m und zurück):**
- **Beim Einströmen gehend („gehen 1“) ist boden-stufen nicht langsamer, sondern hält besser als main.**
  - Frame p95 B 33,3 / 25,1 / 33,2 / 33,3 ms gegen A 50,1 / 25,1 / 33,4 / 41,6. Gepaart je Sitzung B − A: −16,8 / 0 /
    −0,2 / −8,3; B ist in keiner Sitzung langsamer.
  - CPU-Takt p95 B 28,0 / 22,1 / 26,1 / 30,2 gegen A 47,8 / 22,2 / 31,6 / 35,4. Gepaart: −19,8 / −0,1 / −5,5 / −5,2.
  - **Band 33:** B liegt viermal auf oder unter der 4-Takt-Stufe des 120-Hz-Rasters (33,3 = 4 × 8,33 ms; einmal 33,2).
    Rechnerisch reißt das 33 um 0,3; main-naechst lag in 1410-boden2 auf derselben Stufe (25,2–33,3). main liegt in 3 von 4
    Sitzungen darüber.
  - **K51-6 heilt den Einström-Riss:** K51-3 lag hier bei 41,6 / 41,5, K51-4 bei 41,6 / 41,6.
- **Eingeschwungen gehend („gehen 2“) hält der Frame:** B 25,0 in allen 4 gegen A 25,0 / 24,9 / 17,1 / 24,9 (17,1 ist ein
  einzelner A-Lauf zwei Raster-Stufen tiefer).
- **Rest, benannt:** CPU-Takt p95 eingeschwungen +1,0 ms (A 20,0 / 15,1 / 15,9 / 16,6 → B 19,6 / 16,2 / 18,1 / 17,8).
  - Gepaart −0,4 / +1,1 / +2,2 / +1,2, also 2σ des Mittels 1,07: knapp am Rauschen.
  - Dieselbe Richtung wie K51-3 (+1,5) und K51-4 (+0,95).
  - CPU p50 ist gleich (gepaart −0,1).
  - Der Frame bleibt bei 25,0, VSync-gebunden.
- **Damit erfüllt boden-stufen die FF-Regel „nicht langsamer“ gehend.** Der Einström-Gang ist besser als main, der
  eingeschwungene Frame gleich. Offen bleibt der CPU-p95-Rest eingeschwungen.

| Lauf | A main 062ec357: fps / Frame p95 / CPU p50 / CPU p95 | B boden-stufen 9e2f9c7c |
|---|---|---|
| gehen 1, s1 (A zuerst) | 51,8 / 50,1 / 13,6 / 47,8 | 59,5 / 33,3 / 12,5 / 28,0 |
| gehen 1, s2 (B zuerst) | 62,0 / 25,1 / 11,5 / 22,2 | 65,8 / 25,1 / 11,5 / 22,1 |
| gehen 1, s3 (A zuerst) | 56,8 / 33,4 / 12,3 / 31,6 | 59,4 / 33,2 / 12,7 / 26,1 |
| gehen 1, s4 (B zuerst) | 57,9 / 41,6 / 12,3 / 35,4 | 57,9 / 33,3 / 13,2 / 30,2 |
| gehen 2, s1 | 60,4 / 25,0 / 13,8 / 20,0 | 64,9 / 25,0 / 12,2 / 19,6 |
| gehen 2, s2 | 71,4 / 24,9 / 11,1 / 15,1 | 68,7 / 25,0 / 11,4 / 16,2 |
| gehen 2, s3 | 70,1 / 17,1 / 11,8 / 15,9 | 65,8 / 25,0 / 12,3 / 18,1 |
| gehen 2, s4 | 68,4 / 24,9 / 12,1 / 16,6 | 65,2 / 25,0 / 12,5 / 17,8 |

- **Die Reihenfolge erklärt das Δ nicht.**
  - A zuerst: 50,1 und 33,4. A zuletzt: 25,1 und 41,6.
  - B zuerst: 25,1 und 33,3. B zuletzt: 33,3 und 33,2.
  - Sitzung 1 begann mit dem ersten Boot nach Stunden Leerlauf (A 50,1). Deshalb wurden die Sitzungen 3 und 4
    nachgelegt. Sie bestätigen das Bild aus 1 und 2.
- **Der Steh-Lauf direkt nach dem Umstellen** (Einströmen im Stand) zählt wie in 1410-boden2 nicht ins Urteil. Er zeigt
  dieselbe Richtung: Frame p95 A 50 / 33,3 / 58,3 / 66,6 gegen B 33,4 / 16,9 / 41,6 / 33,4.
- **Szene:** Befehle gehend 74–75 auf beiden Seiten. Dreiecke gehend B −5k (A 379–395k, B 375–387k), das ist der
  Boden-Schnitt von K51.
- **Wachen:**
  - Wetter in allen 24 Läufen sunny → sunny, die Uhr gehalten.
  - Stempel gültig.
  - Ort −278/−1038 in allen 8 Umstellungen.
  - Geher: 4 Wege je Sitzung.
  - Keine FEHLER-Zeile in den Werkbank-Logs.
  - Seiten-Köpfe: `abab-m062` = 062ec357, `abab-p9e2` = 9e2f9c7c, beide sauber.
- **CI am B-Kopf** 9e2f9c7c: 38620736919 GRÜN 13/13 (puls 2/2, voll 11/11).
- **Instrument:** `abab-im062` (062ec357, Wiese K55 lokal gepatcht: nur `spec/profiband/haushalt.json`, Eintrag aus
  mess-wiese 54c78ff3).
- **Rohdaten** `bericht/1410-boden3/`: s1–s4, `serie.sh`, `gehen.sh`, `auswertung.cjs`, `auswertung.json`,
  `fortschritt.log`.

## Pflicht-OFFEN Rest

- Eingeschwungen gehend kostet B CPU-Takt p95 +1,0 ms (2σ 1,07). Ein Profil der Phase „gehen 2“ je Seite (ca. 8 min)
  würde den Täter benennen; auf Ruf.
- Nebenbefund ohne Urteil: main 062ec357 strömt gehend unruhiger ein (Frame p95 bis 50,1) als main-naechst f09398e6 in
  1410-boden2 (25,2–33,3). Die Serien liegen an verschiedenen Tagen, also nicht vergleichbar gemessen.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- Messbäume `abab-m062`, `abab-p9e2`, `abab-im062` bleiben stehen (node_modules als Junction auf `abab-b542`; vor dem
  Löschen `cmd /c rmdir`).
- Werkzeug `p3/k1410k`.
- Nächster Schritt der OMEN: der Runner (bericht/1410-runner.md), dann K59 takt-kreatur.
