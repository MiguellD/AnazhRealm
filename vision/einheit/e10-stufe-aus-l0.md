# E10 — Die Stufe aus der L0: der Preis, und die Übergabe an `einheit-sicht`

*19.11.2026, GTX 1050, Zweig `einheit-stufe-aus-l0`. Die Spike-Funktion und ihre Werkzeuge liegen neben diesem Blatt in `spike-stufe-aus-l0/`. Sie verlassen damit den Spiel-Baum: die Vorprüfung trägt sie nicht.*

Die Spike-Funktion `muster(netze, s, opt)` (`spike-stufe-aus-l0/muster.js`) baut eine Stufe aus den Netzen der L0, im Format des Foundry-Fadens. Sie arbeitet in drei Schritten:

1. `sichtbar(netze, s, glas)` entscheidet je Dreieck, ob es an einer Pixel-Mitte vorn liegt. Dazu rastert sie die Tiefe orthografisch in der Zelle `s = d ÷ 703,7 px/m`, aus 12 Azimuten × 3 Höhen und von oben.
2. Muster-Teile (Ecken mit einer Verband-Zeile ≠ 0) werden je Ebene und Zone zu einer Fläche. Die Fläche trägt die flächengewichtete Farbe und dieselbe Verband-Zeile; der Stoff webt das Muster.
3. Jede andere Fläche fällt, wenn ihre schmale Seite an der Grenze unter einem Bildpunkt liegt.

**Das Bild trägt.** B1 (Anteil der Maske über 8/255 Luma) gegen heute:

| Fall | aus der L0 | heute |
|---|---|---|
| alemannisch L2 an 26 m, vorn | 4,81 % | 65,11 % |
| alemannisch L2 an 26 m, hinten | 2,98 % | 45,31 % |
| suv L1 | 6,72 % | 11,76 % |
| limousine L1 | 5,33 % | 8,52 % |
| gt L1 | 13,84 % | 16,83 % |

Die Zahlen stehen in `zahlen/b1-muster.json` und `zahlen/kurve-alemannisch-L2-26m.json`, die Bildpaare L0 | aus der L0 | heute in `bilder/`.

**Der Preis trägt nicht.** Gemessen in Node am Stein-Kopf, alemannisch/s7, je Haus und Samen:

- L1 an 12 m kostet 34,3 s, L2 an 26 m kostet 8,8 s — zusammen 43 s Faden-Zeit.
- `sichtbar()` trägt davon 95 %. Die vierfache Zelle drückt den Preis nur auf 3,2 s und 1,6 s.
- Dreiecke: L2 7 864 gegen das Soll 6 412; L1 10 159 gegen heute 27 346.

Darum sitzt die Ableitung nicht hinter `_foundryWorkerRequest` (Pflicht B). „Stufe aus L0" fällt aus der Vorprüfung `w28-stein-ein-gesetz` und bleibt OFFEN.

**Übergabe an den Schneider von `einheit-sicht` (E7).** Die Stufe wird ein LESER der EINEN Sicht: kein CPU-Raster je Anfrage, kein zweiter Sicht-Durchgang im Faden. `sichtbar()` ist genau das, was die Sicht schon weiß. Der Rest von `muster()` bleibt ein eigener Preis, den der Schneider an derselben Stelle neu misst, sobald die Sicht ihn speist: das Verschweißen, die Zonen und die Hüllen, rechnerisch etwa 5 % ≈ 2,2 s für L1 und L2.

**Messweg** im Spiel-Baum: `node <Mappe>/muster-preis.cjs alemannisch 7 12,26` (`FC_DATEI` wählt den Kern).
