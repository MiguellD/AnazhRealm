# ÜBERGABE 09.11. abends (Konto 9, NOTBREMSE bei 98 % um 17:52, Reset 12.11. 19:00)
**Zuerst neben dieser Datei lesen: `ZWEIG-INVENTAR-0911.md`.** Es führt jeden w25/w26-Zweig mit Stand, Zug und Einordnung. z348 ist um 18:07 gelandet, main ist da0e790f.

**main** da0e790f (z348 um 18:07: ankunft-block-3, ankunft-horizont, omen-sichtbar-2; davor z345 a7dc1874, nur Werkzeug: `zeit:gate:<npm>` für Zeit-Gates auf den Band-Geräten OMEN/Radeon).
**Gebucht** 222 an eff50c41. Ehrlich trocken an a7dc1874: **218**, 6 Rückfälle. 3 davon heilen Zweige in der Schlange:
- klang.K4#2 gtx → w26-klang-schritt (S13, siehe unten)
- vegetation.K5#2 radeon → w26-winter-fichte (z349)
- material.K2#1 gtx → w26-boden-nah (z349)

Ohne Heilung bleiben material.K4#1 gtx (lack-glas, siehe unten), material.K3#2 radeon (Fichten-Karte) und lod.K4#1 radeon (Luma-Sprung 2,42 %).
Buchen erst, wenn z347–z349 gelandet sind und die Rückfall-Stationen neu gemessen sind: `BUCHE_KOPF=<sha40> bash artifacts/profiband/werkzeug/buche.sh`. Danach die Meisterkarte (Artifact BJk5eWsqBiLnS6o3Cns6QK) neu veröffentlichen.

## Züge (Skripte in /tmp/claude/w3: zug-schlange6.sh + zug-weiter3.sh, Logs /tmp/claude/fahre-zNNN(w).log)
- **z347 ROT 17:04.** Die Triage (Champion, je Wand an main, an +stadt-takt-4b und an ferne-ton-2 allein) spricht **stadt-takt-4b frei**. **ferne-ton-2** bricht alle vier CPU-Wände (Wagen 1,23 m tief, K7 Wiesen-Rand, Graben leer, Fahr-Linse K8/S1): `PORTAL_GROUND.mead` 0x55632f → 0x3e5026 senkt das Grün des Bodens von 0,065 auf 0,046, und daraus rechnet `stamm/koerper-fahrt.js` die Haftung des Rads, ebenso die Nah-Wiese. Eine Farbe steuert dort Physik, das ist ein Zwilling von Stoff-Gesetz und Farbe. Heilung: Haftung und Wiese lesen den Stoff, nie das Grün der Farbe. ferne-ton-2 und ferne-ton-3 bleiben draußen, bis das geheilt ist.
- **z351** w26-stadt-takt-4b (5ab84a7a, frei gesprochen), wartet auf z350w.
- **z348** w26-ankunft-block-3 (Fern-Kachel-Rufe 1566 → 263) + w26-ankunft-horizont (Horizont Radeon kalt 9,3 → 6,1 s) + w26-omen-sichtbar-2 (Proben auf der OMEN im sichtbaren Fenster). Wartet auf z347w. Im CI seit 17:10 (da0e790f). ROT bisher: voll 8/18 Fahr-Linse VK „Wagen im Bau 1× haus_provenzalisch“ (Pflicht C). Der Zug-Wächter fährt sie noch einmal.
- **z349** w26-leib-raum (Guss der Menge 18,8 → 10,1 s) + w26-boden-nah + w26-winter-fichte + w26-haar-arm (haar.K2 Radeon 0,64 → 0,43). Wartet auf z348w.
- **z350** w26-klang-schritt (8d1d3bb1, S13 geheilt: −∞ dB kam als null aus dem Browser, `null > -90` ist wahr; jetzt über `__klangW.endlich`) + w26-probe-node (setup-node nur ohne Node 22 im PATH).  Dazu **w25-gpu-wahl** (a0a0b0d5: Bild GTX 1060 p95 41,8 → 33,3 ms, `_passSicht` 20,5 → 7,8 ms, scripts −8 870). Wartet auf z349w.
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
- **Drittes Gerät gtx1050-desktop:** Die CPU ist der Engpass. Umgestellt sind Energieplan Höchstleistung, G DATA entfernt (beides der Schöpfer) sowie Autostart und Hintergrund-Apps (die Sitzung, Liste in C:\actions-runner\umstellung-0911.txt). Leerlauf-CPU 14 → 7 %. Offen beim Schöpfer: Defender-Ausnahmen prüfen, HKLM-Autostart (ClassicStartMenu, Maustreiber, Logitech), RAM: EIN Riegel in einem Board mit drei Kanälen. Zeit-Urteile zählen dort nie, `zeit:gate:` funktioniert (Radeon „Band-Gerät“).
- **Achtung aufraeumen.ps1:** Es beendet auch die CI-Proben des Radeon-Läufers in C:\actions-runner (der Champion schoss so um ~17:40 einen ego-schatten-Job ab). Nur trocken fahren und gezielt beenden.
- **gate:tag-achse:echt** ist auf der Radeon auch an main ROT (w26-ferne-ton-3-vorher c398a5ff). Das ist kein Fehler der Zweige.
- **OFFENER FEHLER:** `bild:stadt*` reißt den Proben-Deckel auf ALLEN Läufern (Radeon 616 s, GTX 1050 552–616 s). Die Werkbank kommt am Stadt-Ort nie bis „Kamera des Spiels“. Damit gibt es kein GPU-Bild von Menge, Wagen und Verkehr (C).

## Notbremse bei 98 %
`bash /tmp/claude/w3/notbremse-cloud.sh` schreibt in EINEM Commit einen STOPP in brief-gemein und in den Briefkasten jedes w25/w26-Zweigs, der seit 09.11. 10:00 aktiv war. Laufende Sitzungen lesen ihn im Wartezimmer. Direktnachrichten erreichen Cloud-Sitzungen nicht, und stoppen kann sie nur der Schöpfer in der App. Die Zug-Skripte (z348–z351) kosten kein Budget und fahren weiter.

## Wachen
`bash /tmp/claude/w3/kombi-wache.sh` (run_in_background) endet bei der ersten neuen Abgabe (w24–w26, heim2) oder beim nächsten Zug-Ende.

- **Drittes Gerät, Hardware (16:45):** Es steckt EIN 8-GB-Riegel DDR3-1066 im Triple-Channel-Board X58, die CPU nutzt also 1 von 3 Speicherkanälen. Zwei gleiche Riegel dazu (~10–20 € gebraucht) sind der beste Hebel je Euro. setup-node kostet im Normalbetrieb ~10 s je Job (2–4 %), nach einem Neustart ~30 s. Schnitt: setup-node nur, wenn `node --version` nicht mit v22 beginnt. Das hilft nur, wenn Node 22 dort im PATH liegt. „Set up job“ schwankt 13–50 s, weil die Actions je Job neu geladen werden.

- **Notbremse-Skript 17:48:** Es legte im Haupt-Klon auf dem lokalen `main` den WIP-Commit d6c81526 an (die alte lokale Änderung an scripts/werkbank.cjs). Der Push wurde abgewiesen, origin/main steht unverändert auf a7dc1874. Den lokalen main nach dem Reset mit `git reset --hard origin/main` auf origin stellen, aber erst nachdem jemand den WIP angesehen hat. Dazu WIP auf w4-z140-rueckfall-koord (alter Zweig).

## Wiederanlauf der Züge (falls ein Neustart die Skripte beendet hat)
Prüfen: `ps -ef | grep -E "zug-schlange6|zug-weiter3"`. Fehlt ein Zug, der noch nicht in main ist (Nachweis mit `git merge-base --is-ancestor origin/<zweig> origin/main`), starte ihn aus `/tmp/claude/w3` neu. Die Schlange wartet jeweils auf den Vorgänger:
- `nohup bash zug-schlange6.sh z348w "z349:w26-leib-raum w26-boden-nah w26-winter-fichte w26-haar-arm" > schlange-z349.out 2>&1 < /dev/null & disown; nohup bash zug-weiter3.sh z349 > zug-weiter-z349.out 2>&1 < /dev/null & disown`
- `… z349w "z350:w26-klang-schritt w26-probe-node w25-gpu-wahl"`, dann `… z350w "z351:w26-stadt-takt-4b"`, je mit `zug-weiter3.sh z350` bzw. `z351`.
Läuft z349 schon (`/tmp/claude/fahre-z349.log`), wird nur der fehlende Rest neu gestartet. Eine zweite Schlange darf nie neben einer lebenden laufen (Gedächtnis `schlange-einmal`).
