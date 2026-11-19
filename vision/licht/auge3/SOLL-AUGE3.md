# SOLL der Rechnung „Auge 3" — geschrieben und gepusht VOR auge3.cjs (GTX 1050, 19.11.)

**Das Modell (Entscheid Koordinator 19.11. 00:35):** Brücke x = L·k aus echten cd/m² · EIN Zustand L_a = log-Mittel der Sicht
(Nicht-Strahler) · k = a ÷ max(L_a, L_min), a FOLGT aus der Eichung (18-%-Karte an der Mess-Wiese am Mittag auf k·L 0,22) · Kurve K1 ·
KEIN Schleier (Stiles-Holladay fällt aus dem Auge, mit ihm Klemme 1°, „nur Strahler blenden", Blick = Bildmitte, ε) · KEINE Kappe.
ZEIT: EIN Zustand, τ folgt dem Ast — über L_min der Zapfen-Ast, unter L_min der Stäbchen-Ast (τ 120 s).

**Stellwerte, die bleiben:** L_min 0,005 cd/m² · τ Stäbchen-Ast 120 s. **Ungeprüft beim Namen:** τ Zapfen-Ast — ich habe keinen
Text einer Quelle vor mir; Band 0,2–5 s (neurale Anpassung nach nicht bleichendem Licht), NICHTS baut darauf, die Rechnung nennt
das τ, ab dem der Schwenk-Fall kippt. „k ∝ 1/Zustand" (volle Kompensation) steht ohne Quelle: ungeprüft.

| # | Fall | Soll | FÄLLT, wenn |
|---|---|---|---|
| 1 | Herd nah (3 m) ↔ fern (25 m) | das Auge trennt über den Sicht-Inhalt, L_a allein | k_fern ÷ k_nah < 2 (unter einer Stufe) — ODER das Ring-Gras (0,75–1,75 m) steht nah mit dem hellsten Kanal bei k·L > 3 |
| 2 | Gasse Nacht (Docht 1 cd, Mond) | die Wand bleibt lesbar | Wand-Leuchtdichte unter der Schwelle des Zustands ODER Wand unter Luma 8 ODER EIN Strahler zieht den Zustand um mehr als 2 Stufen (gilt jetzt für L_a: Laternen-Glas/Fenster sind Strahler und zählen nicht ins Mittel — geprüft wird der Zug ihres beleuchteten Umfelds) |
| 3 | Lava nah (3 m), Spiel-Daten | Ufer sichtbar; die Ordnung der WELT bleibt im Bild erhalten (Y_ein-Ordnung = Y_aus-Ordnung für alle Flecke der Sicht) | Ufer-Saum unter Luma 8 ODER Decke ↔ Saum < 2 Code ODER ein Fleckpaar kehrt seine Ordnung um |
| 4 | Mittag, Mess-Wiese (Eich-Sicht) | Karte sRGB ≈ 118 | Karte weicht um mehr als 2 Code ab. Die zwei anderen Kompositionen (Sonne bei 25,6° im Bild · sonnige Wand auf 30 %) stehen als ZAHL im Befund, ohne Soll |
| 5 | Vollmond-Wiese ohne Feuer (0,1–0,3 lx) | Boden klar lesbar, Baumlinie gegen Himmel unterscheidbar | Boden unter Luma 12 ODER Baumlinie ↔ Himmel < 2 Code |
| 6 | Schwenk 10° / 30° / 60° vom Feuer weg | liegt das Ziel (L_a der neuen Sicht) über L_min: das Bild steht in ≤ 10 s wieder auf 0,3 EV; Minuten nur, wenn das Ziel unter L_min liegt | über L_min länger als 10 s bei τ Zapfen am Band-Rand, an dem es noch als belegt gelten könnte — weil τ Zapfen UNGEPRÜFT ist, urteilt Fall 6 nur bedingt: die Rechnung nennt das τ, ab dem er kippt, und ob das Ziel der drei Schwenks über oder unter L_min liegt |

Die Schwellen (Luma 8/12, 2 Code, Faktor 2, k·L 3, 10 s, 0,3 EV) sind **gewählt** (Lesbarkeit am 8-Bit-Schirm bzw. Entscheid des
Koordinators) und gelten nur als Falsifikation dieser Rechnung, nie als Tor einer Linse.

Fällt ein Fall: Befund mit Zahl, kein Bau, kein viertes Modell. Tragen alle: der GPU-Spike am Zweig `w28-licht-spike` (K1 + L_a),
Paare main ↔ Kopf an Herd nah, Herd fern, Gasse, Mess-Wiese Mittag, Vollmond-Wiese, Lava, je mit Preis (ms des Post-Schritts).
