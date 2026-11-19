# SOLL Tafel C — der Bereich des Auges an neun Orten, committed VOR der Rechnung (GTX 1050, 19.11.)

**Was gerechnet wird (kein k, kein Bild, keine Formel für das Auge).** An neun Orten nebeneinander, alles in cd/m² im EINEN
Maßstab (16 090 je Einheit; Nacht-Quellen wie in Spike 5 gefahren: Mond 0,1 lx, Herd/Laterne/Lava auf heutigem Wert im
Nacht-Maßstab — dieselben Welt-Zustände, an denen Z_Kegel gemessen ist):

1. **Z_Kegel** — das gesättigte Raumwinkel-Mittel der Mess-Kette (Spike 5; die zwei neuen Mittags-Blicke über die Kette gelesen).
2. **Z_Ort = E_Ort ÷ (5π)** — die Beleuchtungsstärke am Ort des Betrachters aus ALLEN Quellen: Sonne/Mond × Durchlass von Krone
   und Dach, Himmels-Halbkugel × offener Anteil, Pool-Lichter nach Abstand (Formel des Pools, Zensus Teil 2); einmal waagrecht,
   einmal auf eine Fläche zum Blick. Selbstleuchter gehen nur als ihr Licht am Ort ein (die Ausnahme „als Leuchtdichte über einer
   Schwelle" wird benannt, nicht gerechnet).
3. **Z_Zentrum** — das Mittel der Leuchtdichte im Bild-Zentrum, Durchmesser 6°, aus den Spike-5-Bildern von main zurückgerechnet
   (Ausgabe-Luma → k·L über die Kurve → ÷ k) bzw. aus der Welt gerechnet, wo kein Bild liegt.

Orte: Mess-Wiese Mittag (Blick flach) · Mittag 50° hoch · Mittag zum Boden · Herd nah · Herd fern · Mond-Wiese frei · Mond-Wiese
mit Herd im Bild · Lava nah · Gasse.

| # | Was die Bilder verlangen | FÄLLT für eine Spalte, wenn |
|---|---|---|
| C1 | Mittag hoch = Mittag zum Boden = Mittag flach (derselbe Ort, dasselbe Licht) | die drei Werte der Spalte liegen > 0,3 EV auseinander |
| C2 | Herd nah liegt zwischen Mond-Wiese frei und Gasse (die Nacht am Feuer ist heller als die Mond-Wiese, dunkler als die Gasse unter der Laterne — Spike 5: Gras 4 m muss lesbar bleiben) | Herd nah liegt außerhalb [Mond frei, Gasse] ODER mehr als 3 EV über Mond frei |
| C3 | Herd fern ≈ Mond-Wiese frei (das Feuer in 19 m ändert den Ort nicht) | > 0,5 EV Abstand |
| C4 | Mond-Wiese mit Herd im Bild ≈ Mond-Wiese frei (derselbe Ort, anderer Blick) | > 0,5 EV Abstand |
| C5 | Lava nah: heller als Herd nah, weit unter dem Mittag | Lava ≤ Herd nah ODER Lava > Mittag ÷ 100 |
| C6 | die Reihenfolge der neun Orte ist dieselbe wie die der Bild-Urteile aus Spike 5 (Mittag > Lava > Herd nah ≥ Gasse > Mond-Orte) | eine Vertauschung über 0,5 EV |

**Die Falsifikation des Ankers (Rechnung an EINEM Bild):** Mittag, Himmel im Kegel, 18-%-Graukarte im Vordergrund als Fixation.
L_a an der Fixation nach Vangorp 2015 Gl. 10 (zwei Gauß-Glieder σ 0,428° und 0,0824°, α 0,654). Die Nichtlinearitäten n1, n2 und
die OTF liegen mir nicht am Text vor: gerechnet wird der Grenzfall „Karte ≥ 2° groß" (beide Kerne liegen in der Karte, L_a = L der
Karte) und die Schranke mit Streulicht des Himmels (Schleier-Leuchtdichte nach der CIE-Blendformel L_v = 10·E_Blend ÷ θ², benannt
als Ersatz, nicht als Vangorp). **FÄLLT** (der Anker fällt für den Mittag, der Kegel-Spike hatte recht), wenn L_a mehr als 1 EV
über E_W ÷ π · 0,2 liegt.

Kein Bild, kein k. Was aus der Welt nicht zu rechnen ist (Durchlass einer Krone ohne Messung), steht als „offen" in der Zelle.
