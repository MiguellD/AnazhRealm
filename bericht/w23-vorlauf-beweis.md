# w23-vorlauf — der Beweis an der Geschichte (Züge 60e60d09 … ef667956)

ZWISCHENSTAND. Der Vorlauf hält den Zug, der Nachlauf tilgt den Rest nach der Landung, das Hauptbuch hält die Schuld (Zweig `w23-vorlauf`, `scripts/lib/zug-auswahl.cjs`; Werkzeug hier `zug/zug-werkzeug.cjs`).

## Datenbasis

- GitHub-API: 1 986 Läufe von check.yml ab 24.10. (31 524 Jobs, alle Versuche), die Git-Geschichte von main ab 15.10., jeder rote Zug-SHA einzeln geholt.
- 35 Züge auf integ-probe, 07.11. 02:07 bis 08.11. 09:13: SHA-Folge 60e60d09 … ef667956 (in der Zählung des Koordinators z280 … z317). z318 lief bei der Messung noch nicht.
- Die Wirkungs-Karte ist `zug/wirkung-karte.json` (Kopf 185e99bb, 113 von 121 Schritten grün gemessen).
- Die Zeiten kommen aus `spec/ci/ci-zeiten.json` (p90 je Schritt). Gemessen wird jeder Zug am eigenen Lauf, Versuch 1: was heute lief, gegen das, was der Vorlauf fahren würde.

## Die Fänger (a): die Methode der Regel-Inventur als Werkzeug

Je rotem Schritt und SHA:

- **wackler:** derselbe SHA wurde im Schritt grün.
- **gpu:** der echt-Zwilling stand am SHA grün.
- **abbruch:** der Schritt brach ohne Urteil ab.
- **Heilung:** sonst gilt die Heilung. Im Zug ist das jeder Zweig, der danach anders landete (seine eigenen Commits bis zur Landung). Auf einem Zweig sind es seine eigenen Commits bis zum nächsten Grün des Schritts.
- **echt:** die Heilung änderte Spiel, das der Schritt nach seiner Karte ausführt.
- **reibung:** sie änderte keins.
- **offen:** keine Heilung landete.

Ergebnis ab 24.10.: wackler 397 · gpu 21 · abbruch 848 · reibung 303 · offen 192 · echt 178.

Die 178 echten Ereignisse ergeben je 14-Tage-Fenster 65–75 echte Fehler (je Täter und Heilung einer), davon 20–21 im Zug. Gefangen haben sie 52–56 Schritte.

Eine Deckung (je Fehler EIN Fänger, die wenigsten Minuten) braucht 28–32 Schritte, das sind 95–127 p90-min. Darum ist der Vorlauf ein BUDGET und kein Filter.

## Die Wahl

- **Budget:** 23 % der Tafel (p90). Gemessen trug 0,25 der Tafel 27,1 % der Rechenzeit, 0,23 trägt das Viertel.
- **Füllung:** nach erwarteten echten Fehlern je Sekunde. Der Puls, der Kopf und die Vorbereitung jeder geöffneten Gruppe zahlen mit.
- **(a) Fänger:** zählen die Fehler, die sie als erste decken.
- **(b) Karte:** die E Fehler des Fensters verteilen sich gleich auf die Wirkungen des Diffs außer der Takt-Wirkung (≥ die Hälfte der gemessenen Schritte), jede gleich auf ihre Schritte.
- **Zug-Stelle:** eine Wand mit echt-Zwilling fährt im Zug auf der GTX.

## Ergebnis

    BEWEIS 35 Züge: heute Median 272.3 min · Vorlauf Median 68.2 min = 25.1 % (min 22.2, p90 26.4, max 47.6) · Wand heute Median 19.3 → Vorlauf 11.1 min · Nachlauf tilgt nach Median 43.7 (max 51.6) min · Zug-Abstand Median 47.1 min · rot heute 29 Züge, im Vorlauf 17 · echte Fehler 2: Vorlauf 2, Nachlauf 0

| Größe | heute | Vorlauf |
|---|---|---|
| Rechenzeit je Zug (Median, Versuch 1) | 272,3 CI-min | 68,2 CI-min = **25,1 %** (min 22,2 %, p90 26,4 %; max 47,6 % am abgebrochenen Lauf d1ee37d2) |
| Wanduhr je Zug (Median) | 19,3 min | 11,1 min |
| Züge mit rotem Schritt | 29 von 35 | 17 von 35 (12 fielen nur an Schritten außerhalb des Vorlaufs: 24 bewiesene Reibung, 4 offen, der Täter landete noch nicht) |
| echte Fehler im Zug | 2 | 2 im Vorlauf, 0 erst im Nachlauf |

- **60e60d09 (w18-pegel-peers):** Die Ankunfts-Linse fängt den Fehler im Vorlauf nach 15,7 min, wie heute.
- **5590f52d (w22-wiese-nachzug):** Stand-Takt fängt den Fehler im Vorlauf nach 17,4 min. Heute fing ihn Asset-Inventur nach 4,6 min, und Asset-Inventur fährt im Vorlauf nicht.
- **Nachlauf:** Er fährt nach der Landung auf höchstens 8 Plätzen und tilgt die ganze Schuld nach Median 43,7 min (max 51,6) ab Zug-Start. Der Zug-Abstand liegt bei Median 47,1 min, also bleibt die Schuld ≤ 2 Züge.
- **Fang im Nachlauf:** Ein Schritt außerhalb des Vorlaufs fällt dort spätestens nach 51,6 min. Die Bisektion nennt den Täter-Zweig nach ⌈log2(Merges + 1)⌉ Proben, je Probe die Dauer des Schritts. Echte Fälle dafür gab es in diesen 35 Zügen keinen: die Zahl ist simuliert.

## Ehrlich offen

- **DECKE:** Die Decke steht bei +9 844 Atomen (Merge-Basis integ-probe). Dieser Zweig senkt sie gegenüber w22-zug-auswahl um 4 974; seine eigenen Atome zahlt er ganz. Er streicht ci-kopf, R6, das (L)-Orakel und den Richter mit seiner Hand-Liste. Messplatz und Beweis wandern hierher, neben die Karte. Was offen bleibt, ist der Kern der w22-Karte (Glieder, Wirkungen, Auswahl, 5,4k) und der Nachlauf in der CI. Der Puls ist rot nur an DECKE und Wachstums-Wand.
- **Methode:** Die Methode ist eine Näherung der Inventur. Das Quetschen im Spiel-Code (S0-WGSL) zählt hier als echt, die Inventur nannte es Reibung.
- **Echt-Job:** Er läuft jetzt unter der Zug-Shell (node, dann Git-Bash). Auf dem Windows-Läufer ist das ungeprüft.
- **Kopf-Zeit:** Die Zeit des Zug-Kopfs ist geschätzt (40 s); ci-zeiten misst sie nach dem ersten Zug.
