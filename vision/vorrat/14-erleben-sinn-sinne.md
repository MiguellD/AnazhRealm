# Vorrat 14-erleben-sinn-sinne — Fehl-Zettel (Kopf e4eeee08, gelesen, nicht gemessen)

**Zählung: A 0 · T 0 · F 0 · R 6 · B 8** (14 Leitern) — gelesen: 14 von 14 Leitern mit Spiel-Belegen; Stationen gelesen an
halten.K5 (g5.js:5188-5255, Probe kampf-proben.cjs:3260-3294), tiere.K1#2 herde (g2.js:105-134, 4110-4160), oekologie.K4#1
(g2.js:5381-5414), spielgang.K2 (g5.js:6174); affekt.K1/K4, feld.K5, ki.K3 nur an ihren Kopfzeilen — ehrlich etwa 75 %.

## Die fünf billigsten Sprossen

1. **erleben.sinn.tod 1 (R, S, ~3 min/Gerät)** — Tod, Rückkehr am Genesis-Anker, derselbe Leib und das stehende Gefährt sind Spiel
   (koerper-seele.js:329-365, koerper-fahrt.js:1247). Die Probe HALTEN_K5 läuft schon in der Sitzung beider Geräte: Tod im Sattel,
   Gefährt-Abstand, drei Bilder und die Rückkehr-Zeit hinzufügen; die Radeon-Fahrt von halten.K5#1 ist noch nicht grün.
2. **erleben.sinne.signale 1 (R, S, ~6 min)** — Der Alarm des Verbands lässt Glieder vor eigener Wahrnehmung fliehen
   (kreatur-furcht.js:3-29, `_alarmEigen`). Die Probe herde (tiere.K1#2, beide Geräte) liest `_alarmEigen` schon; es fehlen der
   Anteil ≥ 0,7 und ein Gegenlauf Alarm aus mit Rudel und gezählten Rissen (der Deckel der Probe, 41 s, ist knapp).
3. **erleben.sinne.geruch 1 (B, S, ~5 min)** — Die Witterung WÄHLT nur unter Leibern in scentRangeM (harter Schnitt
   kreatur-verhalten.js:215), sie entdeckt nicht: gegen den Wind jagt der Wolf eine einzelne Beute genauso (windMod ≥ 0,2). Eine
   Entdeckungs-Schwelle aus dem Gesetz an kreatur-verhalten.js:227-233, dann ein Gegenlauf Wind zu/weg/aus als Probe.
4. **erleben.sinne.genom 1 (B, S, ~5 min, Zwilling von 3)** — Sicht- und Witter-Radien gelten für ALLE Gattungen gleich
   (tetrapoda-core.js:151/162/183). Radien je Gattung skalieren und den Gegenlauf in DERSELBEN Probe wie geruch 1 fahren (R9).
5. **erleben.sinn.legenden 1 (B, S, ~20 min)** — Das Tagebuch ist sichtbar (werkstatt-sozial.js:308), seine Zeilen tragen aber keinen
   Ort; den Ort trägt ein zweites Buch `worldMeta.taten` (feld-leben.js:3352) mit Bild-Spur (Stumpf, Asche, Riss). Die Tat-Zeile mit
   {x, z, h} verknüpfen, dann der Bildpaar-Richter über 20 gezogene Zeilen.

Teurer: takt 1 (R, M — Minuten-Zählung im Spielgang), sicht 1 (B, M — UV am Saftmal + Auge ‚biene‘ neben FARBSICHT),
hoeren 1 (B, M — Echo aus den Strahlen des Raums am Ohr), gesehen 1 (B, M), ziele 2 (B, M), entdeckung 1 (R, M), feld 1 (B, L),
sog 1 und staunen 1 (R, L — Menschen-Panel).

## Funde über das Paket hinaus

- **Ein Läufer trüge fünf Leitern:** ein Blind-Agent (Bild-Modell + Eingabe-Schleife in der Sitzung) fehlt an der Punkte-Maschine —
  spielgang.K2 steht deshalb als „unmessbar“ (stationen/g5.js:6174). Er ist der Richter von erleben.sinn.ziele 2, entdeckung 1,
  hoeren 1 (Blind-Lauf), Vorprüfung von sog 1 und staunen 1. EIN Bau, viele Sprossen.
- **Zwei Bücher derselben Tat:** `worldJournal` (dienst.js:385, ohne Ort) und `worldMeta.taten` (feld-leben.js:3352, mit Ort).
  Für legenden 1–3 und ziele 2 braucht es EINE Quelle; das ist Gebot 4 („eine kanonische Quelle je Domäne“).
- **Ein Farb-Auge steht schon:** FARBSICHT (bild-kosten.js:2869-2913) ist ein LMS-Rezeptor-Modell (Viénot 1999), heute nur als
  Zugang für Menschen. Es ist der Ansatz für sinne.sicht 1–2 (EIN Leser für Kurven) und sinne.gesehen 1 (dichromates Wild).
- **Belege, die am Kopf nicht stimmen:** genom („Radien je Gattung“) — die Radien sind global; geruch („Wolf findet Beute“) — er
  findet sie durch den Reichweiten-Schnitt, nicht durch die Witterung; signale („Grep Warnruf 0“) — als Wort ja, als Verhalten steht
  der Alarm des Verbands (kreatur-furcht.js:3); sicht („kein Spektrum“) — stimmt, aber ein Rezeptor-Raum (LMS) steht.
- **Preis-Risiko:** ziele 2, entdeckung 1, hoeren 1 und staunen 1 liegen im Dorf/Haus (Heap 417–549 MB > 400); sog 1 trägt die
  Ankunft (B rot: GTX kalt 16,6 s).
