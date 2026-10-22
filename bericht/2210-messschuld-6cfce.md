# Bericht 2210 Messschuld 6cfce: Radeon 890M am Kopf 6cfce28a (V18.546.68), Fenster 1920×1080

**Status: ZWISCHENSTAND.** Nur gemessen, nichts am Code geschnitten. Mess-Baum `.claude/worktrees/mess-6cfce` (detached 6cfce28a, node_modules als Junction, Lock-Datei bis auf die Versionszeile gleich).
Jeder bediente Baum meldete `VERSION = "18.546.68"` (Werkbank-Eval, save-server-Abruf, Konsole), das Gerät `[linse-gpu] amd/rdna-3`.
Jeder echte Lauf lief als EIN Befehl unter `gpu-lauf.sh messbahn` (`skripte/reihe.sh`), die Ports lagen auf 7970–7979.
Die Last vor jedem Lauf steht in `last.txt`. Die Rohdaten liegen in `bericht/2210-messschuld-6cfce/`, die Mess-Skripte in `…/skripte/`; sie sind Kopien aus `2110-messschuld-radeon-2/skripte` und `2210-radeon-beweise/skripte`, nur Pfade und Ports sind neu.

## M31 Gelände K2: Graben-Bild. Soll 1 erfüllt, **Urteil 1** (vorher 0 nach R6)
- **Befehl:** `reihe.sh m31` = `srv.sh` (save-server :7970) + `node skripte/m2-graben.cjs`.
  - Spiel-Loop, Third, Fluss nächst Genesis, 5 Saaten.
  - Je Saat ein Graben 1 m und einer 3 m jenseits der Krone (3,34–3,68 m), gegraben per CDP-Klick mit dem Verb `graben`.
  - Je präsentiertem Bild die wasserGraben-Zählung über ±4,5 m.
- **Zahl:**
  - 9 von 10 Gräben gegraben; den ersten nahm `abbau`, wie an 816f26b4.
  - In allen 2 204 Bildern: `doppelt` 0, `über dem Spiegel` 0.
  - Gefüllt nach 98–216 ms (1 m, 4 Saaten) und nach 176 ms (3 m, Saat 11).
  - Bei 4 Saaten überlappt der 3-m-Graben den 1-m-Graben (nass vorher 213–257), dort ist er nicht getrennt urteilbar. Das war schon bei M2 so.
- **Last:** 5 % CPU.
- **Bild (selbst angesehen):**
  - `m31-s11-a3-vor.png`: Gras-Ufer, oben der Fluss.
  - `m31-s11-a3-2s.png`, 2 s nach dem Hieb: EINE glatte, dunkle Wasserfläche schneidet in das Ufer und schließt oben an den Fluss an. Das Gras ist aus der Grube verschwunden, am unteren Rand liegt ein heller Saum.
- **Roh:** `m31-graben.json`, `m31-*.png`, `m31.out`.

## M32 Menschen K1 · K2 · K3: **K1 Urteil 1** (vorher 0 nach R6), K2 und K3 bestätigt
- **Befehl im Fenster:** zwei Sitzungen `reihe.sh m32b`, `sitzung.sh` (Werkbank :7972 `--echt`, Seite über save-server :7973).
  - Je Sitzung `diag-kreatur-takt --werkbank 7972 --proben bewohner`.
  - Danach `skripte/platz-8.js` / `platz-10.js` als `werkbank eval`: Stand am Rand des Dorfplatzes wie die Linse, Third, Uhr als Spieler-Wort `processChatCommand("setze uhrzeit 0.3333|0.4167")`, Loop 12 s.
  - Gezählt: im Frustum der Spiel-Kamera, gezeichnet, Sichtlinie frei, in 8 s ≥ 0,5 m gegangen.
  - Bild aus dem Ausgabe-Pfad (`b64png.cjs`).
- **Werkzeug-Bruch:** `werkbank schirm` bricht am Kopf mit „--tiere undefined" (`m32-4.txt`). Der Schirm ruft `lauf` ohne `tiere`. Ersatz war das Ausgabe-Bild.
- **K1:**
  - Quote 81/81 = 1,0 im Fenster (2×) und headless.
  - Linse im Fenster: 41 Ego / 37 Third gegangene Menschen im Blick um 10 Uhr.
  - Eigene Zählung an der Spiel-Kamera, Third:
    - 8 Uhr: 37/36 im Bild, davon **12/12 gehend**;
    - 10 Uhr: 35/34 im Bild, davon 10/9 gehend.
  - fps 60.
- **Bild (selbst angesehen):**
  - `m32-platz-8uhr-third.png`: eine Gasse zwischen Fachwerkhäusern, ein Marktstand mit grün-weißer Markise, Laternen, Morgenlicht mit langen Schatten. Der Spieler (blaue Jacke) steht links vorn. Drei Bewohner sind auf 5–15 m in Schrittstellung, eine Gruppe steht am Stand, am Ende der Gasse eine Menge von ≈ 15.
  - `m32-platz-10uhr-third.png`: dieselbe Gasse; die Nähe ist leer, ≈ 20 Bewohner stehen auf 15–60 m um den Stand und die Gasse hinab.
- **K2:**
  - headless trefferMin **1,0** (81/81), planGleich, Schmiede 10/2 Uhr **2/0**, Sprünge 0, Blick 0,97, ohne Platz 0.
  - **Im Fenster in beiden Sitzungen ROT an der Linse:** trefferMin **0,825**, drei Feld-Bewohner unter 0,9 (wohnhaus/feld #724672 87–88 %, #45665 82–83 % zweimal).
  - Staffel 1 („ein Bewohner ≥ 0,9“) hält auch dort mit 78 von 81. Am echten Renderer bricht der Teil „alle Bewohner“, also Staffel 2.
- **K3:**
  - headless: Durchdringung **0**, Tür 247/247, Wege 4–7, Strecke min 46 m, Gangzeit auf Wegen 0,946;
  - im Fenster: 0 Durchdringung, Tür 251/251, Gangzeit 0,942.
- **Last:** 23–24 % CPU. Die Messung ist eine Zählung, kein Zeit-Kriterium.
- **Roh:** `m32-headless-bewohner.log`, `m32-2.txt`, `m32b-2.txt`, `m32-3.txt`, `m32-5.txt`, `m32b-3.txt.json`, `m32b-5.txt.json`, `m32*-werkbank.log`.

## M33 Klang K2: Wind Bild ↔ Ohr. Soll 1 erfüllt, **Urteil 1** (vorher 0 nach R6)
- **Befehl:** `reihe.sh m33` = `srv.sh` + `node skripte/m15-wind.cjs 60`.
  - Mess-Wiese (weite-halde), Ego, Böen frei, Tiere gehalten, Klang per CDP-Klick.
  - 60 s CDP-Screencast (1 156 Bilder); Analyser am Gain der Wind-Stimme (EIN Bandpass-Kandidat, 247 Hz).
- **Zahl:**
  - **r = 0,87** bei Lag 0 (n 119 Fenster).
  - Mindest-Varianz: CV Bild 0,23, Ohr 0,55.
  - Spitze 0,89 bei −0,5 bis −1 s; über ±2 s fällt r auf 0,46–0,79, bei ±3 s auf 0,13–0,55.
- **Antwort auf die offene Frage:** Viertel-Takt und 0,3-%-Schwelle glätten die Böe nicht unter die Schwelle.
- **Last:** 6 % CPU, 60,3 fps.
- **Bild:** `m33-wind-bild.png` (Ego, Gras vorn, Birken, Klang an).
- **Roh:** `m33-wind.json`, `m33.out`.

## M35 Speicher K1 · K2: Tab-Tod auf dem Pfad des Spielers. **K1 Urteil 1 · K2 Urteil 1** (vorher 0 nach R6)
- **Befehl:** `reihe.sh m35` = `node skripte/echt-k1.cjs 20 kopf3`.
  - Statik-Host :7974 ohne save-server; `GPU_LAUF_MAX_S=1800`.
  - Neu im Haken: eine Hülle um jeden `requestIdleCallback`-Rückruf (gezählt, wenn darin `saveState` lief) und Σ Speicher-ms je rAF-Bild (`jeBildEcht`).
- **K1:**
  - 20 harte Tode: idb 4, fest 3, platz 3, zufall 10; 0 Haken verfehlt.
  - Alter max **1,47 s**: idb 0,17–1,47 · platz 0,20–1,44 · fest 0,002–0,004 · zufall 0–1,09.
  - **0 über 10 s, 0 korrupt, 0 halbe Welten**, Welt-ID 20/20.
  - Am Ende stehen 71 Blöcke und 138 Edits.
- **K2:**
  - je Bild p95 **0 ms**, p99 8,3, max 19,1, Mittel 0,15 ms. Das sind 15 197 Bilder, 221 davon mit Speicher-Arbeit.
  - je saveState-Ruf p50 6,8 / p95 14,6 / max 18,8 ms (402 Rufe).
  - je Leerlauf-Rückruf mit Save p50 10,2 / p95 15,7 / max 18,9 ms (70 Rufe; die übrigen Rufe kommen aus dem Bau-Pfad).
- **Last:** 6 % CPU.
- **Bild (selbst angesehen):** `m35-echt-k1-kopf3.png` (Third). Der Spieler steht im neu geladenen Stand auf einem Weg im Laubwald.
- **CI (T) am Kopf, Run 39820208133:**
  - Teil 1 (Job 119969290721): 8 Tode, Alter max 4,97 s, 0 korrupt, 0 halb, Linie 409.
  - Teil 2 (Job 119969291035): 12 Tode, Alter max 4,91 s, 0 halb, Linie 785.
  - Logs: `m35-ci-persistence-teil1.log`, `-teil2.log`.
- **Die lokale halbe Welt (T) ist ein Rennen der Linse, keine halbe Welt:**
  - Wiederholt am Kopf mit einer Mess-Kopie (`skripte/diag-persistence-mess.cjs`, die nur die Zeitstempel ausgibt).
  - Lauf 1: 1 halb (`m35-lokal-persistence-mess-1.log`). Der geladene Stand ist identisch mit den Schreibern `platz` und `idb`, die **160 und 235 ms NACH** dem Tod-Stempel des Treibers lagen.
  - Die Linse nimmt nur Schreiber mit `e.t <= vorher.tot` (`scripts/diag-persistence.cjs:331–333`), also fehlt `ganz`, und das Urteil lautet halb, Alter null.
  - Unter Windows läuft die Seite nach dem Stempel weiter, bis `taskkill /F /T` den Baum erreicht. Unter Linux tötet `SIGKILL` die Gruppe sofort.
  - Die Läufe 2 und 3 waren grün (`m35-lokal-persistence-0-7.log`, `-mess-2.log`).
  - Beide Befund-Läufe von fahrt-takt (`ft-persist*.log`: „Alter null“ an einem Zufall-Tod) tragen dieselbe Signatur.
  - `echt-k1.cjs` duldet dafür 1 s.
- **Roh:** `m35-echt-k1-kopf3.json`, `m35.out`.

## M15 Klang K5, Radeon-Seite: **Staffel 2 an der Radeon im Soll, Urteil bleibt 1** (die GTX fehlt)
- **Befehl:** `reihe.sh m15takt` = `diag-klang-zensus --takt --echt` (:7975), dreimal.
- **Zahl, p95 gehen / Fahrt / nachts:**
  - ruhig (9 % CPU): **0,20 / 0,20 / 0,20 ms**, GRÜN (`m15takt.out`, `m15-klang-takt.json`).
  - unter Last (36 % / 46 %): 0,21 / 0,20 / 0,22 und 0,22 / 0,21 / 0,23, ROT. Unter Last ist das kein Beweis.
  - Träger über dem Soll ist jedes Mal die Musik: `_lofiPlayGroove` 0,08–0,13, dann `_playSchrittOneShot`, `_lofiPlayChord`.
  - Die Radeon steht ohne Marge an der Kante.
- **Aussetzer:** `reihe.sh m15aus` = `m14-spielgang.cjs` mit 4 min gehen, 3 min Fahrt und 3 min nachts gehen.
  - **0 underrunEvents in 671 s Wiedergabe.**
  - Klang-ms je Bild (Hülle, 100-µs-Raster) gehen 0,2 · Fahrt 0,2 · nachts 0,3.
  - Frame p95 17,5 → 17,5 ms; VRAM +1,7 MB, Heap +107 MB (11 min).
  - Den GT nahm wieder nur `mountArchitecture`, nicht E.
- **Last:** 9 % CPU.
- **Roh:** `m15takt-1.out`, `m15takt-2.out`, `m15takt.out`, `m15-klang-takt*.json`, `m15-aussetzer.out`, `m15-aussetzer-spielgang.json`.

---
**Punkte an 6cfce28a:** Gelände K2 0 → 1, Menschen K1 0 → 1, Klang K2 0 → 1, Speicher K1 0 → 1, Speicher K2 0 → 1, macht **+5**. Damit sind fünf der sechs R6-Verluste zurück; die sechste, Profiband K4, ist M34 an der OMEN.
Bestätigt: Menschen K2 1, K3 1, Klang K5 1. Offen benannt: Menschen K2 im Fenster trefferMin 0,825, `werkbank schirm` bricht am Kopf, die (T)-Linse rennt unter Windows.

Geschnitten: nichts (nur Messung).
Gemessen: Graben 0 doppelt / 0 über / gefüllt ≤ 216 ms · Menschen 81/81, 12 gehend im Third-Bild um 8 Uhr · Wind r 0,87 · Tab-Tod 20/20, Alter max 1,47 s, 0 halb, je Bild p95 0 ms · Klang-Takt 0,20/0,20/0,20 ms ruhig, 0 Aussetzer in 671 s.
Pflicht-OFFEN Rest: A · B · E (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
