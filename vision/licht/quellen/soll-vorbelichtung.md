# SOLL „Vor-Belichtung" — EIN Maßstab im Puffer, committed VOR jeder Rechnung und jedem Bild (GTX 1050, 19.11.)

**Entscheid des Koordinators nach Spike 5 (724256d3):** EIN physikalischer Maßstab in den Lichtwerten der Welt (cd/m², lx); die
Belichtung k wird VOR dem Schreiben in den Puffer angewandt — der Puffer trägt belichtete Werte, seine Auflösung liegt immer am
angepassten Niveau. Der benannte Wechsel (Mittag 16 090 ↔ Nacht 1,1607 cd/m² je Einheit, `NACHT_AUGE.luxJeEinheit`) fällt.

**Was der Spike ist.** Welt-Werte in EINER Einheit E₀ = 16 090 cd/m² (der Mittag-Maßstab; die Nacht-Quellen des Ort-Paars stehen
dafür auf ihrem physikalischen Wert ÷ E₀). Der Puffer trägt L ÷ E₀ × k_vor, k_vor = die Belichtung, die VOR dem Bild feststeht
(das k des letzten Bilds); der Ausgabe-Knoten multipliziert nur noch mit k ÷ k_vor (im stehenden Bild 1). Das Gesetz, das k
liefert, bleibt in diesem Spike das von main (`_belichtungAusLicht`) — der Spike prüft den MASSSTAB, nicht das Auge. Die
Vor-Belichtung sitzt an EINER Stelle; findet sich im Lichtweg kein EINER Chokepoint (jeder Schreiber bräuchte seinen eigenen
Faktor), ist das der Befund, mit Zahl der Stellen — dann kein Bild.

**EIN Ort-Paar:** Mess-Wiese am Mittag · freie Vollmond-Wiese (Pose `mond-frei` aus Spike 5) bei physikalischen 0,1 lx.

| # | Zeile | Messung | FÄLLT, wenn |
|---|---|---|---|
| 1 | Mittag bleibt bildgleich | Mess-Wiese Mittag, main ↔ Spike, dieselbe Kamera, 1 920 × 1 080, Luma am Boden (Ausschnitt 200,800–1700,1050), am Himmel und über das ganze Bild | ΔLuma am Boden > 1 ODER an Himmel/ganzem Bild > 1 ODER k ≠ k von main (±0,5 %) |
| 2 | Die Nacht ist darstellbar | freie Vollmond-Wiese 0,1 lx: Zeilen-Mittel der Luma über den Boden-Ausschnitt (je Bildzeile ein Wert, 250 Zeilen); gezählt: verschiedene Werte (auf 0,5 Code gerundet) und der größte Sprung zwischen Nachbar-Zeilen; dazu die Zahl verschiedener Puffer-Werte (R, G) im selben Ausschnitt, gelesen am Szenen-Ziel | weniger als 20 verschiedene Zeilen-Werte ODER ein Sprung > 2 Code ODER weniger als 16 verschiedene Puffer-Werte je Kanal |
| 2v | dieselbe Szene VORHER | dieselben drei Zahlen im Mittag-Maßstab OHNE Vor-Belichtung (physikalische 0,1 lx ÷ E₀ direkt in den rg11b10) — Erwartung des Koordinators: 0 unterscheidbare Stufen | — (die Vergleichs-Zahl; liegt sie nicht nahe 0–2, ist meine Rechnung der Auflösung falsch und das Blatt sagt es) |
| 3 | Preis | GPU-Zeit des ganzen Bilds im selben Boot, AN ↔ AUS im Wechsel, ≥ 4 Boote, Mess-Wiese Mittag | Mittel > 0,05 ms |

## Die Falsifikation — wo Vor-Belichtung brechen kann (je Zeile ein Versuch, sie zu brechen; „hält" nur mit Zahl)

| # | Kandidat | Versuch | FÄLLT, wenn |
|---|---|---|---|
| F1 | Sprung von k zwischen zwei Bildern | k um 1 EV stellen (Schwenk-Wert aus Spike 5), die ersten drei Bilder danach lesen: die Geschichte der zeitlichen Auflösung (TRAA) trägt Werte im ALTEN k | die Luma des Bodens weicht in Bild 1–3 um > 2 Code vom eingeschwungenen Bild ab (Geister-Helligkeit), ohne dass die Geschichte umgerechnet wird |
| F2 | Rücklese der Mess-Kette | Z der Kette am Mittag mit und ohne Vor-Belichtung; die Kette liest dann belichtete Werte und muss durch k_vor teilen | Z_phys weicht um > 1 % vom Wert aus Spike 5 (0,2046 Einheiten) ab ODER der Deckel (S ÷ k) wirkt doppelt |
| F3 | Schatten-Karte | Schatten-Verhältnis besonnt ÷ beschattet am Boden der Mess-Wiese, main ↔ Spike | das Verhältnis weicht um > 1 % ab (die Tiefe selbst trägt kein Licht — erwartet: hält) |
| F4 | Luft / Nebel | Luma des fernen Hangs und des Horizonts am Mittag, main ↔ Spike: mischt die Luft eine ABSOLUTE Farbe ein, bleibt sie unbelichtet | ΔLuma > 1 in der Ferne |
| F5 | Streulicht-Schwelle, Godrays, lokaler Kontrast | jede feste Schwelle der Post-Kette liest jetzt belichtete Werte: Bild mit Sonne im Blick (Mittag) und Herd bei Nacht, main ↔ Spike | der Schein um Sonne/Flamme ändert seine Fläche oder Stärke um > 2 Code im Ring um die Quelle |
| F6 | Leuchtflächen, die k schon lesen | Schreiber, die heute durch k teilen („Ton × 1,6 ÷ k", Brand-Flammen) oder k im Stoff lesen (`_nachtAuge`): unter Vor-Belichtung zählt k doppelt oder gar nicht | eine solche Fläche ändert ihre Ausgabe-Luma gegen main um > 2 Code |
| F7 | Das obere Ende des Formats | Sonnenscheibe und hellste Wolke × k am Mittag; Flamme (physikalisch) × k_Nacht bei Nacht — rg11b10 endet bei ≈ 65 000 | ein Wert erreicht das Format-Ende (weißer Block statt Verlauf) |
| F8 | Gebackenes Licht | was Licht in eine Karte backt (Impostor-Atlas, Panorama/Fern-Ring, Rückstrahl-Messung, Umgebung/PMREM): bei k_Nacht gebacken, bei k_Tag gelesen | eine gebackene Fläche trägt nach dem Wechsel Tag ↔ Nacht eine um > 2 Code andere Luma als frisch gebacken |
| F9 | Zwei Lichtwege | Feld/Panorama, Wasser und die Karten-Sonne rechnen eigen (Lehre 21, W7): nimmt der EINE Chokepoint sie mit? | ein Lichtweg bleibt unbelichtet (sichtbar als Naht oder Helligkeits-Sprung zwischen Mesh und Feld/Ferne) |

**Reihenfolge:** erst der Zensus A (er nennt die Schreiber und Leser, also die Kandidaten F5–F9 beim Namen), dann Zeile 2v (die
Rechnung der Auflösung am Bild), dann der Spike. Findet der Zensus einen Leser, der hier fehlt, wächst die Tafel VOR dem Spike um
seine Zeile (Nachtrag mit Datum, keine Zeile fällt still).

**Nicht in diesem Spike:** das Gesetz des Auges (Bereich, m), die Dämmerung als Bild-Folge, die physikalischen Werte ALLER Quellen
(nur die des Ort-Paars), ein Bau am Spiel. Kein Stempel.
