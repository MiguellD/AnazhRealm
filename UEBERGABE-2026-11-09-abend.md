# ÜBERGABE 09.11. abends (Konto 9, Wochenbudget 96 % um 16:45, Reset 12.11. 19:00)

**main** a7dc1874 (z345, nur Werkzeug: `zeit:gate:<npm>` für Zeit-Gates auf den Band-Geräten OMEN/Radeon).
**Gebucht** 222 an eff50c41. Ehrlich trocken an a7dc1874: **218**, 6 Rückfälle. 3 davon heilen Zweige in der Schlange:
- klang.K4#2 gtx → w26-klang-schritt (S13, siehe unten)
- vegetation.K5#2 radeon → w26-winter-fichte (z349)
- material.K2#1 gtx → w26-boden-nah (z349)

Ohne Heilung bleiben material.K4#1 gtx (lack-glas, siehe unten), material.K3#2 radeon (Fichten-Karte) und lod.K4#1 radeon (Luma-Sprung 2,42 %).
Buchen erst, wenn z347–z349 gelandet sind und die Rückfall-Stationen neu gemessen sind: `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`. Danach die Meisterkarte (Artifact BJk5eWsqBiLnS6o3Cns6QK) neu veröffentlichen.

## Züge (Skripte in /tmp/claude/w3: zug-schlange6.sh + zug-weiter3.sh, Logs /tmp/claude/fahre-zNNN(w).log)
- **z347 ROT 17:04** (stadt-takt-4b + ferne-ton-2): echt S0-Feuerkreis-Luma, echt Tag-Achse, „Stall NATIV createRenderPipeline atmo-himmel“, CPU: Werk im Wasser (Wagen 1,23 m tief), K7 Wiesen-Dichte am Rand 1,257, Wasser-Wand (Graben leer), Fahr-Linse (T4, K8, S1). Wahrscheinlich bricht **stadt-takt-4b** die Welt-Bau-Linsen: Die Bau-Frist im Takt lässt die Prüf-Welten unfertig. Die Bau-Linsen müssen auf die Frist warten oder bauen, offen, keine Sitzung dran. **ferne-ton-2** fährt allein in **z351** hinter z350 und klärt die zwei echt-Wände.
- **z348** w26-ankunft-block-3 (Fern-Kachel-Rufe 1566 → 263) + w26-ankunft-horizont (Horizont Radeon kalt 9,3 → 6,1 s) + w26-omen-sichtbar-2 (Proben auf der OMEN im sichtbaren Fenster). Wartet auf z347w.
- **z349** w26-leib-raum (Guss der Menge 18,8 → 10,1 s) + w26-boden-nah + w26-winter-fichte + w26-haar-arm (haar.K2 Radeon 0,64 → 0,43). Wartet auf z348w.
- **z350** w26-klang-schritt (8d1d3bb1, S13 geheilt: −∞ dB kam als null aus dem Browser, `null > -90` ist wahr; jetzt über `__klangW.endlich`) + w26-probe-node (setup-node nur ohne Node 22 im PATH). Wartet auf z349w.
- z346 fiel an der Klang-Linse S13 (klang-schritt). ferne-ton fährt in ferne-ton-2 mit.

## Zurückgehalten (mit Grund in cloud-post/<zweig>.md)
- **w26-programm-katalog:** Gewinn nicht belegt (max ≤ main offen, GC 226 ms). Verlangt: Fahrt-ABAB ≥ 4 Boots, Ankunft kalt nicht langsamer, GC benannt.
- **w26-lack-glas:** material.K4#1 auf der Radeon UNGÜLTIG (2 Blöcke statt 54 unter swiftshader).
- **w26-fahrt-planer:** kollidiert mit block-3 und stadt-takt-4b. Nach z348 main einmischen und mit `_wieseFernBereit` zu EINER Quelle vereinen.

## Punkte-Maschine (punkte-maschine a8011ca5, Selbsttest 163/163 ohne 3c)
Neu eingemischt:
- Deckel-Klasse: 22 Paare mit `teile` oder `ausnahme`. Gemessen: tiere.K5, physik.K2#2, licht.K2#2, licht.K3#2 echt ROT. vegetation.K4#2 reißt auch 90 s.
- lod-baum-pm (lod.K5#1 misst den Umriss), lack-glas-pm (material.K4#1 stabil), haar-linse-pm (haar.K2 EINE Pose).
- lod.K1#1: Spielgang-Ziel ≤ 12 m. Ehrlich ROT an `f:eiche:L1` 0,3261, die L2-Karten halten alle 0,22. Für die Eiche liegt eine Karte bereit: Cloud-Sitzung „A: Eichen-Laub L1 im Gehen“.
- **Lehre:** Ein Push der Maschine nur auf ausdrückliches `SELBSTTEST GRÜN`. Der Selbsttest bricht manchmal still mit Exit 0 ab, und „kein ROT“ ist kein GRÜN.

## Geräte
- **OMEN:** Sweep nach D5 pausiert (87537d3f: 35 grün / 9 rot / 71 ungemessen). Seit 15:31 trägt sie gpu-probe + gpu-zeit. Fortsetzen mit `AB=6 VOR=71 bash sweep-reihe.sh 87537d3f…` (Sitzung „Koordinator Meldung“), wenn die Proben-Schlange leer ist. Der Läufer läuft interaktiv (Sitzung 1), sichtbare Fenster gehen, sobald z348 landet.
- **Drittes Gerät gtx1050-desktop:** Die CPU ist der Engpass. G DATA hat der Schöpfer entfernt. Energieplan und Autostart sind offen: Die Sitzung dort nimmt nur die Zustimmung des Schöpfers in ihrem eigenen Chat. Defender-Ausnahmen und Auto-Anmeldung liegen beim Schöpfer. Zeit-Urteile zählen dort nie.
- **OFFENER FEHLER:** `bild:stadt*` reißt den Proben-Deckel auf ALLEN Läufern (Radeon 616 s, GTX 1050 552–616 s). Die Werkbank kommt am Stadt-Ort nie bis „Kamera des Spiels“. Damit gibt es kein GPU-Bild von Menge, Wagen und Verkehr (C).

## Wachen
`bash /tmp/claude/w3/kombi-wache.sh` (run_in_background) endet bei der ersten neuen Abgabe (w24–w26, heim2) oder beim nächsten Zug-Ende.

- **Drittes Gerät, Hardware (16:45):** Es steckt EIN 8-GB-Riegel DDR3-1066 im Triple-Channel-Board X58, die CPU nutzt also 1 von 3 Speicherkanälen. Zwei gleiche Riegel dazu (~10–20 € gebraucht) sind der beste Hebel je Euro. setup-node kostet im Normalbetrieb ~10 s je Job (2–4 %), nach einem Neustart ~30 s. Schnitt: setup-node nur, wenn `node --version` nicht mit v22 beginnt. Das hilft nur, wenn Node 22 dort im PATH liegt. „Set up job“ schwankt 13–50 s, weil die Actions je Job neu geladen werden.
