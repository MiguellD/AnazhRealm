# SOLL der Rechnung „Auge 2" — geschrieben VOR dem Rechnen (GTX 1050, 19.11.)

**Das Modell (Entscheid Koordinator 19.11.):** Brücke x = L·k aus echten cd/m² · EIN Zustand je Sicht (EIN Skalar) = Anpassungs-
Leuchtdichte der Sicht + Schleier-Leuchtdichte nach Stiles-Holladay · Kurve K1 (`rechnung2/kurve.js`) · KEINE Kappe.
Bedingungen: (a) jede Konstante mit Quelle (Autor, Jahr, Gleichung) — ohne Quelle steht sie als STELLWERT im Blatt; (b) die
Blend-Beleuchtungsstärke kommt aus den Strahlern der Welt (Candela, Abstand, Winkel zur Blickachse), nicht aus Pixeln; (c) die
Anpassung liest nur Nicht-Strahler (Strahler-Bit im r8-Ziel „glanz"); (d) das EINE gewählte Datum ist die untere
Anpassungs-Grenze mit ihrer Zeitkonstante — sonst nichts.

**Fünf Fälle. Fällt EINER in der Rechnung, kommt kein GPU-Spike und keine dritte Formel, sondern der Befund mit der Lücke.**

| # | Ort | Soll (folgt aus dem Modell, vor dem Rechnen benannt) | FÄLLT, wenn |
|---|---|---|---|
| 1 | Herd nah (3 m, Blick über das Bett) ↔ Herd fern (25 m) | zwei Zustände: der Faktor k_fern ÷ k_nah folgt aus Schleier (∝ E_Blend/θ²) und Sicht-Inhalt und TRENNT | k_fern ÷ k_nah < 2 (unter einer Stufe; ×1,1 des ersten Spikes trägt nicht) — ODER das Gras im Ring (0,75–1,75 m) liegt nah mit seinem hellsten Kanal über 4 × Schulter-Beginn (k·L > 3: dann ist es wieder der Weiß-Fleck der Runde 3, nur ohne Rosa) |
| 2 | Gasse Nacht (Docht 1 cd, Mond) | die Wand bleibt LESBAR: ihr Kontrast gegen ihren Schatten/Nachbarn liegt über der Unterschieds-Schwelle des modellierten Zustands (belegte TVI/Kontrast-Schwelle, mit Quelle), und ihr Code-Wert trägt diesen Kontrast als ≥ 2 Code Unterschied | Wand-Leuchtdichte unter der Schwelle des Zustands, ODER Wand unter Luma 8 am Schirm (der erste Spike: 3), ODER der Zustand der Gasse wird von EINEM Strahler (Laternen-Glas, Fenster) um mehr als 2 Stufen gezogen |
| 3 | Lava nah (3 m am Ufer), mit den SPIEL-Daten | das Ufer bleibt sichtbar (über dem Fuß), Ordnung Riss > Decke > Ufer-Saum > Ufer fern > Baumlinie in Y | Ufer-Saum unter Luma 8 ODER Decke und Saum ununterscheidbar (< 2 Code) ODER Ordnung in Y bricht |
| 4 | Mittag, Mess-Wiese, Sonne 74° | wie main: 18-%-Karte → sRGB 118 | Karte weicht um mehr als 2 Code ab — insbesondere: der Schleier der SONNE darf den Zustand nicht verschieben, wenn die Sonne nicht in der Sicht liegt, und mit Sonne in der Sicht nennt die Rechnung die Zahl |
| 5 | Vollmond-Wiese ohne Feuer (0,1–0,3 lx, belegte Spanne) | das dunkel angepasste Auge liest die Wiese klar: Boden deutlich über dem Fuß, Horizont/Baumlinie gegen Himmel unterscheidbar; entsättigt/kühl ist Sache des Stäbchen-Schritts und wird benannt, nicht geurteilt | Boden unter Luma 12 ODER Baumlinie gegen Himmel < 2 Code — bei der unteren Anpassungs-Grenze, die das Blatt als EIN Datum nennt und begründet |

Die Schwellen „Luma 8 / 12", „2 Code", „Faktor 2", „k·L > 3" sind **gewählt** (Lesbarkeit am 8-Bit-Schirm) und gelten NUR als
Falsifikation dieser Rechnung, nie als Tor einer Linse.

**Zusätzlich zu nennen (kein Fall-Grund, aber Pflicht im Blatt):** jede Konstante mit Quelle oder als Stellwert; wie stark der Zustand
springt, wenn ein Strahler die Sicht verlässt (Kamera-Schwenk um 10°/30°/60° vom Feuer weg) — ein Sprung ist physikalisch, aber die
Zahl gehört ins Blatt; die Zeitkonstanten hell/dunkel mit Quelle; die Lava mit Spiel-Daten; was nicht gerechnet ist.
