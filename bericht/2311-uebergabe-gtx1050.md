# Übergabe GTX 1050 — 23.11. 22:05 (an den neuen Koordinator)

**Hand: keine.** Schloss `%TEMP%\claude\gpu-schloss` frei seit 20:10:56; keine Werkbank, kein save-server, keine Hand-Leiter.

## Dienste (laufen, nicht angehalten)
- **Läufer `gtx1050-desktop`** (agentId 23, v2.338.2): start-runner.ps1 PID 8780 · run.cmd PID 6372 · Runner.Listener PID 6688, seit 21.11. 23:23 (Neustart 23:16). Hooks per `.env`: job-start.sh → job-start.ps1 (Blob ac200780), job-ende.sh → job-ende.ps1 (62f4e803), Stand 09.11. 12:37; keiner gleicht einer Kopie unter `bericht/*-runner/`.
- **Puls `refs/puls/gtx1050`**: puls-dienst.sh PID 532/3596 · node schloss-puls.cjs --schleife PID 11192, seit 21.11. 23:31. Dateien in `C:\AnazhRealm\.git\gtx1050-werkzeug\puls\` byte-gleich zu koordination 12fbe100d `zug/dienst/`: puls-dienst.sh 65f21467 · schloss-puls.cjs de3418c8 · gemein.sh eb9410e0 · schloss-ort.cjs ce7cf7cd. Heute 09:44–09:51 sechs PULS-FEHLER (spawnSync powershell/git ETIMEDOUT), danach ohne Fehler.

## Zweige
- In main: fahrzeug-gattungen bc5bbebdd · eine-huelle fe0f7b1f4 · march-warter 539cad7d9 · front-druckwelle 43da326fb · druckwelle-bild dba1870d9 · palette-stoff-spaet 1dea0abb8 · mensch-zahlen. In punkte-maschine: pm-reaktion 6cd473f28 · pm-fahrer-soll bdfc726fb · pm-reaktion-v2 d56e2957e.
- **Abgenommen, nicht gelandet:** pm-nacht-front 66ed1391b (erleben.bild.nacht#1/#2 live, 20:17).
- **WIP, ungestempelt:** w28-nacht-laterne 6246d6238 (gestoppt 20:17) · w28-knoten-rate cb9a5b38b (heute gepusht; Auftrag (4) neubauN, Median 178 → 61 Takte, 5,5 → 2,0 s; Wände und Abgabe offen) · bau-je-schreiber c798f33ad (heute gepusht; geparkt 22.11. 16:04, ohne Schnitt).
- **Archiv** sicherung-gtx1050-2311 3bc472bc5: 28 alte lokale Zweige und ein Stash als Eltern, die Liste in `SICHERUNG.txt`. Siegel-Wort im Rumpf bei w27-wald-saum und w28-programm-vor-bild: nie in einen Zug mischen.
- **Lokal nach Regel 16.11.:** w28-ankunft-faden · w28-feld-fuss · w28-licht-kern. Rumpf mit Siegel-Wort; der Inhalt ist laut Befund 18.11. per Squash w28-ankunft-stapel in main.

## Offen, mit Adresse
- **nacht-laterne Preis-Rot:** Karten-Takt 10,8 / 17,4 / 10,7 ms gegen ≤ 9,43 (GTX, main .385, 19:10). Die Adresse ist gelesen, nicht gemessen: `stamm/dirigent-kern.js` `_lichtKarteTakt` ~1845. Die Frist `bauMs` 2 ms prüft nur zwischen Einheiten, der erste Fleck läuft immer, und `_lichtKarteHalb` über das ganze Rechteck (≤ `zellenJeBild` 6 000 Zellen × 10 Halb-Floats) läuft nach der Schleife ohne Frist.
- **erleben.bild.nacht#1 Pfosten-Kontrast 2,36:1 rot:** Purkinje-Zwilling `foundry-core.js:311` ATMO_GESETZ.nacht.mond ↔ `stamm/bild-kosten.js:3063` NACHT_AUGE (FUND-REGISTER). Kern-Schnitt nur als Bau-Brief.
- **Leiter-Preis an der GTX:** L.ort kalt 254–267 s gegen den 60-s-Deckel (bericht/2311-pm-nacht-front).
- **Karte 2:** 58 von 1 718 gebucht.

## Warum der Blick die GTX 1050 seit 12:48 „still“ zeigt — ehrlich
- **Sie war nicht still.** Laut `puls.out` war das Schloss von 12:48 bis 21:50 394 von 542 min gehalten: 253 min Hand (fahrzeug-gattungen 2, pm-nacht-front, nacht-laterne) und 141 min CI. `hook.log` zeigt 14 Jobs von 12:46 bis 21:20. Frei war es 148 min, davon ~68 min nach dem Hand-Stopp um 20:10.
- **Der blinde Fleck liegt in der Uhr, nicht in einem Dienst.** `zug/dienst/messplatz-uhr.cjs:46` führt GTX1050 mit `lauf: null, mp: null`, also nährt keine Runde und keine Mess-Datei ihre Uhr. Hand-Arbeit sieht die Uhr nur als Sitzung aus `zug/sitzung.txt` (`:298` `for (const s of sitz)`). Die Aufträge vom 23.11. kamen per Nachricht, ohne START-Zeile; die letzte gtx1050-Zeile ist vom 15.11. 12:41. Zwischen zwei Schloss-Halten zählt die Uhr deshalb Leerlauf, auch während Quelle gelesen und gebaut wird.
- **Die Halter-Uhr war gesund:** in 6 von 273 gehaltenen Puls-Zeilen ≥ 10 min (max 11 min Hand 15:54, 12 min CI-Probe 14:44).
- **Seit 20:17 fährt die GTX nur den Zug:** drei Jobs 20:19–21:20. Die Runde läuft nicht auf ihr (`lauf: null`).
