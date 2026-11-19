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

## Nachtrag 19.11. 02:40 — nach dem Zensus (e49829453) und dem Entscheid des Koordinators 02:31, VOR dem Spike (keine Zeile oben fällt)

**Die Quellen des Spikes stehen physikalisch, in E₀ = 16 090:** Mond 0,26 lx waagrecht bei Vollmond im Zenit-Durchlass (statt 0,51;
Zeile 2 und 2v zusätzlich bei den bestellten 0,1 lx), Herd 2–5 lx in 2 m (gesetzt: 3,5 lx, statt 22), Ambient, Hemisphäre und
Sternen-Leuchten × 7,21·10⁻⁵ × (0,26 ÷ 0,51) bzw. ihr Quell-Wert (Sternen-Leuchten 0,0005 lx), Mondscheibe 2 500 cd/m². Die
Leuchtflächen (Flamme, Glut) bleiben bis zur Tafel des Quellen-Lesers auf ihrem heutigen Wert, im Maßstab M gelesen (0,27–0,86
Einheiten = 4 300–13 800 cd/m²) — im Blatt so benannt. Fällt der physikalische Herd nachts unter die Schwelle des Bilds, ist das
ein Befund (m, Ort-Term), kein Grund zurückzudrehen.

**Die Scheiben-Ausnahme (S):** die Sonnenscheibe (1,6·10⁹ cd/m²) ist am Puffer gedeckelt, an EINER Stelle, der Deckel eine
Funktion des Formats; die Beleuchtungsstärke der Sonne nie. FÄLLT, wenn die gedeckelte Scheibe am Mittag das Format-Ende trifft
(weißer Block, NaN/Inf im Puffer), wenn die Karte der Mess-Wiese sich durch den Deckel um > 0,5 Code ändert, oder wenn der Deckel
an mehr als einer Stelle stehen muss.

**Die elf brechenden Leser, je eine Zeile (erwartetes Verhalten; „hält" nur mit Zahl):**

| # | Leser | erwartet | FÄLLT, wenn |
|---|---|---|---|
| L1 | Mess-Kette `_augeKetteZeichnen` | liest ÷ k_vor; Z am Mittag 0,2046 Einheiten | Z weicht > 1 % ab (= F2) |
| L2 | `AnazhRealm.AUGE` (kE, zE, 16 090) | bleibt, weil M der EINE Maßstab ist | eine Zahl muss sich ändern |
| L3 | τ in `_dayNightApplyBelichtung` | liest Zustand × 16 090 als cd/m², jetzt auch nachts wahr | τ der Mond-Wiese liegt nicht am Stäbchen-Ende (0,4 s) |
| L4 | Feld-Faktor F | fällt mit F (kein Leser mehr) | er bleibt im Bild-Pfad |
| L5 | `_nachtAuge` sVon | liest P ÷ k_vor × 16 090 cd/m²; `luxJeEinheit` und 0,224 fallen (Absenz-Grep) | der Stäbchen-Anteil der Mond-Wiese ≠ der von main bei gleicher Leuchtdichte (± 0,02) |
| L6 | Brand-Flamme, Umkehr über `_nachtAuge` | folgt L5 | Flammen-Luma gegen main > 2 Code (= F6) |
| L7 | Bloom-Schwelle 0,86 | steht im BELICHTETEN Raum, die Zahl bleibt | Vermerk statt Fall: der Schein ändert sich gegen main (heute belichtet 0,44 mittags / 1,08 nachts) — gemessen als ΔLuma im Ring um die Sonne |
| L8 | Godray-Schwelle 0,8 | belichteter Raum, die Zahl bleibt | wie L7 |
| L9 | lokaler Kontrast | belichteter Raum (Wahl steht auf 0) | bei Wahl 0 ändert sich ein Pixel |
| L10 | TRAA Flimmer-Dämpfung 1 ÷ (L + 1) | belichteter Raum; die Geschichte rechnet mit k_jetzt ÷ k_davor um | Geister-Helligkeit > 2 Code in Bild 1–3 nach einem k-Sprung von 1 EV (= F1) |
| L11 | Albedo-Eichung der Werkbank · post-kette DUNKEL_NACHT_LICHT | Albedo misst im Szenen-Raum (÷ k_vor), die Karte liest 0,180; die Injektion 0,02 steht im belichteten Raum | die Karte liest unter Vor-Belichtung ≠ 0,180 ± 0,002 |

**Rückleser der Strahldichte (R):** Spiegel-Pass, Rückstrahl, Wasser teilen durch das k_vor des Bilds, das sie schrieb. FÄLLT,
wenn eine gespiegelte oder rückgestrahlte Fläche der Mess-Wiese gegen main um > 1 Code abweicht.

**Bilder des Spikes (fünf, je main ↔ Spike):** Mittag mit Himmel im Blick · Herd nah (physikalischer Herd, physikalischer Mond) ·
Mond frei · Innenraum · unter dem Kronendach. Zeile 1 (Mess-Wiese, Blick zum Boden) bleibt die Gleichheits-Messung.
