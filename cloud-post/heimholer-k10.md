# Post an heimholer-k10

## 09.11. 21:46 — Cloud-Sitzung heimholer-k10: zwei überholt, einer geholt bis zur Decke (keine Abgabe)

**w24-wiese-ferne-z — überholt** (Zeile in `zug/abgeloest.txt`, dazu w24-wiese-ferne 3fe3aafb, derselbe Baum). Sein Nachfolger
w24-wiese-ferne-y 9e53ecc7 ist seit z339 in main (d61a37e3) und trägt 96 von 98 Zeilen des Zweigs wortgleich; die 2 übrigen sind
der Täter von z336 (die Ferne baute ohne Frist, Ruf bis 391 ms, VK Wagen an Wagen 226×). Die Lücke der Ferne ist nach gpu-wahl
nicht wieder offen: w25-gpu-wahl-2 c396a989 und w26-winter-fichte-2 829014ec tragen `_nahWieseFernTakt` mit der Frist der
Bau-Arbeit (`BAU_FRIST_MS`) unverändert. Kein Bild nötig: kein Pixel ändert sich.

**heim2-w21-laub-jahr-fern — überholt** (Zeile in `zug/abgeloest.txt`). Gelandet in z330 als f5dde626 (V18.546.228); der
Merge-Baum gegen main da0e790f ist außerhalb von diag-ankunft und diag-fahr-leben gleich main. Der Rest 03db07b9 + 51bf7065 sind
7 Zeilen Schreibweise (`?.` statt `&&`), 0 Verhalten.

**w23-pruef-welt-heim — geholt bis zur Decke, KEINE Abgabe.** Kopf `w23-pruef-welt-heim-k10` 09687c3f (main da0e790f +
b895824a, alle Konflikte mit beiden Absichten). Der Nutzen gilt: main trägt weder die Prüf-Last (`__anazhPruefLast`, der Regler
steht bei Last 1) noch das Feld in Welt-Zeit (`_taktUhr` war der rAF-Stempel); anders gelöst ist nur das Booten (`nullWelt`
aus z329 nimmt `fenster`, der Zweig reicht ihm `FENSTER.bild/klein`). Am Kopf GRÜN: gate:takt (am ungeheilten Merge hing es
240 s), gate:welt-boot, gate:wetter-wache, (N) Nexus 24,1 · 48,1 · 72,1 · 96,1 s, schnell = langsam (main: 0 ≠ 9 Läufe),
gate:takt-atem (Last frei, loadScale 0,45), gate:ci-deckung, gate:haus-fern, playtest:fast 22/0, `npm run check` bis auf EINE
Wand: DECKE scripts/ +511 Atome, WACHSTUMS-WAND scripts/ + spec/ +425 bei Spiel +54 (erlaubt 27).

FUNDE, geheilt im Kopf:
- `stamm/dirigent-takt.js:1815`, `stamm/bild-kosten.js:743`, `stamm/studio-gestalt.js:46` · der alte Kopf strich den Stempel
  `_taktZeit` samt Schreiber, seine drei Leser blieben (der Hunger der Frist, das Pflicht-Stück des Knoten-Baus, das EINE Skelett
  je Takt) und sahen `undefined` als EINEN ewigen Takt: nach dem ersten Skelett wartete jedes weitere, nach der Frist bekam der
  Knoten-Bau nie wieder sein Stück · jetzt lesen alle drei `state.weltTakt` (EINE Takt-Identität, die der Loop zählt), `_taktZeit`
  fällt · Linse playtest:fast BAU-TAKT: 4 von 4, Mutante (Leser auf dem toten Feld) 1 → ROT · M.
- `scripts/diag-takt.cjs:359`, `diag-asset-inventory.cjs:61`, `diag-freie-slots.cjs:59` · die Decke-Kürzung des alten Zweigs
  schrieb `!(f && !f.X)` als `!f && !f.X` (De Morgan verkehrt), jede Warte-Bedingung hielt für immer · jetzt `!f || f.X`; alle 223
  Stücke des Zweigs in fremden Dateien gelesen, die übrigen sind gleichwertig · die Stall-Akte nannte die Bedingung schon beim
  Namen · S.
- `.github/workflows/check.yml` · der alte Kopf trug „Kamera-Leib auf der Karte“ zweimal (ein Schritt ohne `run`) · gefallen · S.
- Takt-Atem bleibt in voll auf swiftshader (320×180, Regler frei): die Fahrt-Wand (1798/1800 s) trägt keinen neuen
  Karten-Schritt, `gate:takt-atem:echt` fällt. Ego-Schatten, Post-Kette und Verdeckung fuhren schon auf der Karte, bei ihnen
  fällt nur der swiftshader-Doppellauf.

Ehrlich offen, die Decke: gegen seinen Grund 1561bf3a stand der Zweig bei −3, gegen main da0e790f bei +294, weil main die
Schreibweisen-Ersparnis inzwischen selbst trägt (wie 08.11. 23:05 gemessen); dazu kommen +216 für die Linse BAU-TAKT. Gerechnet,
nicht gebaut: die 15 Hand-Boots auf `nullSeite`/`nullWelt` (~225) und die 20 sicheren `x == null ? d : x` → `x ?? d` (~100),
zusammen ~330 < 511. Den Rest gibt nur der Umfang des Zweigs her, die (N)-Probe (+669) und die Zeile der Prüf-Welt (+507). Euer
Entscheid: Umfang oder Decke. Eine GPU-Probe der drei Karten-Linsen am Kopf setze ich, sobald ihr den Zweig wollt. Ich warte im
Wartezimmer.
