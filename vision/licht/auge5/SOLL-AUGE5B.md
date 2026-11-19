# SOLL „Auge 5b" — Nachtrag zu SOLL-AUGE5 nach dem Quellen-Zensus (koordination 90657b80), VOR auge5b.cjs (GTX 1050, 19.11.)

**Stand davor (Auge 5 wie am 00:59 bestellt, k = a ÷ max(Z, L_min)):** 12 von 13 Zeilen; es fällt Zeile 1 Herd nah — Z 1,49 cd/m²
(erwartet 0,9–1,0), Ring k·L 0,70, aber Gras in 4 m Luma 18,0 gegen 30. Roh: `auge5.roh.out.txt`.

**Entscheid Koordinator 01:03 — drei Änderungen, sonst gilt SOLL-AUGE5 Zeile für Zeile:**

1. **Kompensation unvollständig, L_min fällt:** k(Z) = k_E · (Z ÷ Z_E)^(−m), geankert an der Eich-Sicht. Z_E = das Funktional an der
   Mess-Wiese am Mittag (Raumwinkel-Mittel 4 270 cd/m²; der Koordinator nannte das Pixel-Mittel 4 350 — der Anker muss das EIGENE
   Funktional lesen, sonst steht die Karte nicht auf 118), k_E 3,28e-5. `max(Z, L_min)` fällt überall.
   **m ist der EINE Stellwert**, belegtes Band 0,2–0,9 (Hood 1979 über Reinhard & Devlin 2005 Gl. 1). Bestimmt aus EINEM Nacht-Anker:
   Vollmond-Wiese 0,1 lx, Boden Luma 36,5. Liegt das m des Ankers über 0,9: m = 0,9, und das Blatt nennt die Boden-Luma, die
   dann herauskommt.
2. **Das Fixpunkt-Glied:** Z = Raumwinkel-Mittel von min(L, S ÷ k(Z)), S = 3. Von oben und von unten wie zuvor.
3. **Zeit:** τ = 0,1 s über 5 cd/m², 0,4 s unter 0,005 cd/m², dazwischen linear in log10 Z gemischt, in beide Richtungen
   (Durand & Dorsey 2000 § 3.3; Grenzen CIE 191). „5 s ungeprüft" und „Stäbchen 120 s" fallen. Der Bleich-Ast (Minuten) ist ein
   zweiter Zustand und nicht diese Welle.

**Geänderte Zeilen:**

| # | Zeile | FÄLLT, wenn |
|---|---|---|
| 8 | Vollmond-Wiese 0,1 lx (der Anker von m) | Boden < Luma 12 ODER Baumlinie ↔ Himmel < 2 Code — mit dem m, das gilt (am Band-Rand 0,9, falls der Anker mehr verlangt) |
| 10 | Schwenk 60° vom Feuer weg | länger als 1 s bis 0,3 EV (t = τ(Z_Ziel) · ln(Sprung ÷ 0,3)) |
| 14 | NEU — das Band von m | das m des Ankers liegt außerhalb 0,2–0,9 UND mit dem geklemmten m fällt eine andere Zeile |

Zeilen 1–7, 9, 11–13 unverändert (Herd nah: Ring ≤ 3 UND Gras 4 m ≥ Luma 30).

**Zusätzlich als Zahl:** die Tafel einmal mit dem m des Ankers (auch wenn es über 0,9 liegt) und einmal mit 0,9; für Zeile 1 das
m-Fenster, in dem sie hält (welches m bräuchte Herd nah); die Schritte bis zum Fixpunkt.

**Nicht in dieser Rechnung:** die Ablesung F (Feld, ≈ 1° je Zelle) — sie urteilt allein am Bild des Spikes. Fällt für G eine Zeile:
Blatt mit Zahl; Kette und F fahren trotzdem.
