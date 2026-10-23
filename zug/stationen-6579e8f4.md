# Stationen am Kandidaten Zug 6 — 6579e8f409c5234276210ace7e19798e63ad423c

Regel (Schöpfer 23.10.): gemessen wird am KANDIDATEN vor dem Landen, im selben Termin wie das ABAB; gebucht wird beim Landen netto.

## GTX

- **siedlung.K5 Das erste Haus steht sofort (M36 am Kandidaten)** (kippen, 0 → 1, Zweig stadt-erwachen-2 47b3be7a, ~18 min)
  - Befehl: OMEN, B-Baum sauber an 6579e8f4. m36.sh (koordination bericht/2310-abab-zug2/m36.sh + m36-erstes-haus.js, WT auf den Kandidaten-Baum). Je Boot: frisch, Stand weggeräumt, save-server :4312, `werkbank start --echt --port 4490 --ort dorf`, `fenster 1920 1080`, `umstellen --ort dorf --sicht ego`, `lauf 10 --ein 20 --ruhe 120 --regler frei --tiere frei`, dann `eval "window.__m36={zelle:[-4,-6],nH:N,start:450,maxBilder:15000}; <m36-erstes-haus.js>"`. Der Spieler geht mit 4 m/s durch den Vorlauf-Ring bis zum Erwachen. Uhr: Bühne Mittag. 4 frische Boots nH 12/300/12/300, je Boot Schloss, Vorfahrt Runner.Worker, Nachtruhe. Zahlen je Boot: Erwachen -> gesetzt -> im Sichtradius -> gezeichnet (Bild des Ausgabe-Pfads), Bau-Hash je nH über die Boots, längstes Bild in 300 Bildern nach dem Erwachen.
  - Soll: 1 = erstes Haus sichtbar ≤ 0,5 s nach dem Erwachen der Zelle, unabhängig von nH (12 gegen 300), als Studio-L-Kette (Bau-Hash im Bild), an einem Gerät
- **tiere.K1 Verband: Kohäsion (Gang jetzt mit Leib-Paar in Teil-Schritten)** (R6-halten, 1 → 1, Zweig kontakt-tempo-m dd94d0c4, ~5 min)
  - Befehl: OMEN, B-Baum 6579e8f4: `werkbank start --echt --port 4490 --ort wiese`, `fenster 1920 1080`, dann `node scripts/diag-kreatur-takt.cjs --proben herde --werkbank 4490`. Band herde mit echtem Wurf `_kreaturWurf` (scheue Hirsche 3–7), wandernd und fliehend, Bühne Mittag, 1 Boot.
  - Soll: 1 = (a) Kohäsion an einem Gerät — (a) Kohäsion beim Wandern ≥ 0,9, auf der Flucht ≥ 0,8
- **profiband.K4 Glätte (M39 an 452972 gemessen, 4/4, Buchung offen; kontakt-tempo legt Teil-Schritte in den Takt jedes gehenden Tiers)** (R6-halten, 0 → 1, Zweig kontakt-tempo-m dd94d0c4, ~16 min)
  - Befehl: OMEN: m39.sh (koordination bericht/2310-messschuld-gtx-452972/m39.sh, WT auf den B-Baum 6579e8f4). Je Boot: frisch, `werkbank start --echt --port 4490 --ort wiese`, `eval window.__anazhAutoSettlement=false`, `fenster 1920 1080`, `umstellen --ort wiese --sicht ego`, `lauf 30 --ein 20 --ruhe 300 --regler frei`, `haenger 60 --regler frei --tiere frei --wandern bahn --json`. 4 frische Boots, Regler FREI (R8), Schloss, Vorfahrt.
  - Soll: 1 = eine Bewegungsart an einem Gerät in ≥ 3 von 4 Sitzungen ohne Frame > 100 ms
- **speicher.K1 Nichts geht verloren (M37 GTX-Seite an 452972 gehalten, Buchung offen; stadt-erwachen-2 ändert den Gang _dorfErwachen, den saveState synchron schließt)** (R6-halten, 0 → 2, Zweig stadt-erwachen-2 47b3be7a, ~10 min)
  - Befehl: OMEN: m37.sh (koordination bericht/2310-messschuld-gtx-452972/m37.sh + echt-k1.cjs, WT auf den B-Baum 6579e8f4), Host ohne save-server. `echt-k1.cjs 20 gtx` = 20 harte Tode: 9 am Schreib-Haken (idb/fest/platz), 9 zufällig, 2 im Dorf-Erwachen (K1_ERW Standard: Zyklus 1 hart im Gang, Zyklus 2 am IDB-Schreiben eines saveState im Gang). Dazu der Zusatzlauf K1_ERW={"1":"erwachen-fest"}. Die 2 zählt nur zusammen mit der Radeon-Zeile.
  - Soll: 2 = an beiden Geräten, auch mitten im IDB- oder localStorage-Schreiben (1 = der Browser-Pfad (ohne save-server) besteht den Tab-Tod an einem Gerät: Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten)

## Radeon

- **bauen.K4 Bauen in jeder Höhe und auf Gebautem (Turm aus Füll-Säulen über die echte RMB-Eingabe)** (kippen, 0 → 1, Zweig editform-kern-m 63af584c, ~8 min)
  - Befehl: Mess-Bahn (artifacts/profiband/werkzeug/gpu-lauf.sh messbahn), Mess-Baum detached an 6579e8f4 (VERSION 18.546.74 prüfen), save-server :7970 über srv.sh. NEUES Skript skripte/m-turm.cjs aus den vorhandenen Bausteinen spiel.cjs + zielen.js (M31-Familie): Mess-Wiese, Modus schöpfer, leere Hand, Ego, Bühne Mittag, `__zielen({hoch:-1})` (Blick senkrecht nach unten), 20× `klick(cdp,960,540,'right')` = tryMousePlace -> voxel_fill r 3,5 unter dem Fuß. Vor jedem Klick warten (Bild-Frist, nie Wanduhr), bis das Ausdauer-Tor offen ist, die Edit-Chunks gebaut sind (Dirty-Liste leer) und der Leib steht. Messen: Hub = Fuß minus Gelände-Höhe des Kerns am Turmfuß; Fuß minus `_bodenSichtAt(x,z)`; Ausgabe-Bild Third (`__ausgabeAufnahme`). Dann `saveState`, page.reload im selben Profil, dieselbe Pose: voxelEdits = 20, je Block-Ebene `_fieldSolid` im Säulen-Kern (0 Löcher), Fuß minus Mesh noch einmal. 1 frischer Boot.
  - Soll: 1 = ein Turm aus 20 Blöcken trägt ≥ 60 m über dem Gelände (Fuß ≤ 0,15 m über dem Mesh) und hält über den Reload (0 Löcher)
- **siedlung.K5 zweites Gerät (die 2 nur zusammen mit der GTX-Zeile)** (kippen, 0 → 2, Zweig stadt-erwachen-2 47b3be7a, ~18 min)
  - Befehl: Mess-Bahn, Mess-Baum 6579e8f4: dieselbe Station wie an der GTX. werkbank --echt --ort dorf, Regler frei, m36-erstes-haus.js mit zelle [-4,-6], start 450, nH 12/300/12/300, 4 frische Boots. Der Zweig maß am Zweig-Kopf nH 300 gezeichnet nach 0,40 s; die Zahl gilt erst am Kandidaten.
  - Soll: 2 = beide Geräte
- **gelaende.K2 Das Wasser folgt jedem Edit: Graben (a), M31 wiederholt (Graben ist jetzt Säule statt Kegel, Reichweite editReich)** (R6-halten, 1 → 1, Zweig editform-kern-m 63af584c, ~8 min)
  - Befehl: Mess-Bahn: `reihe.sh m31` (koordination bericht/2210-messschuld-6cfce/skripte, WT in spiel.cjs/srv.sh/reihe.sh auf den Mess-Baum 6579e8f4) = srv.sh :7970 + `node skripte/m2-graben.cjs`. Spiel-Loop, Third, Fluss nächst Genesis, Saaten 11/23/37/51/73, je Saat ein Graben 1 m und einer 3 m jenseits der Krone per CDP-Klick (Verb graben). Je präsentiertem Bild nass/doppelt/über dem Spiegel über ±4,5 m; Bild vor dem Hieb und 2 s danach. 1 Boot.
  - Soll: 1 = (a) im Ausgabe-Bild an einem Gerät — (a) Graben 1 m und 3 m jenseits der Krone: EINE Fläche, nie über dem Spiegel, ≤ 2 s gefüllt
- **ki.K1 Satz → Tat mit echtem Modell (Prompt-Bytes neu: Regler je Art, 5./6. Argument; Same null ist jetzt kein Same 0)** (R6-halten, 1 → 1, Zweig ki-regler-m c9d3b20e, ~8 min)
  - Befehl: Radeon-Laptop, ollama lokal (qwen3:4b-instruct auf der CPU, ohne Schlüssel), Mess-Baum 6579e8f4: `KI_MODELL=qwen3:4b-instruct KI_ENDPUNKT=http://127.0.0.1:11434/ node scripts/diag-v1-pfad.cjs --korpus --echt` mit Netz-Log des Anbieters (POST /api/chat). Eingefrorener Korpus spec/abnahme/ki-korpus.json, 40 Sätze, davon 8 negativ. Je Satz das Welt-Prädikat; zählen: positiv erfüllt, gültig, Absicht, Negativ ohne Tat, Brüche. Nicht parallel zu anderen Radeon-Stationen (CPU-Last).
  - Soll: 1 = Grundstufe ohne Schlüssel: ≥ 10 Positiv-Sätze mit Welt-Prädikat gemessen und gehalten
- **oekologie.K5 Bindung: ein gebundenes Tier folgt 10 min (M19 wiederholt; der Folger geht den neuen Weg samt Leib-Paar gegen den Spieler)** (R6-halten, 1 → 1, Zweig kontakt-tempo-m dd94d0c4, ~12 min)
  - Befehl: Mess-Bahn: `gpu-lauf.sh messbahn bash srv.sh m19-save.log node skripte/m19-weg.cjs` (koordination bericht/2210-messschuld-6cfce/skripte, WT auf 6579e8f4). Ab der Mess-Wiese ein Tier 4 m hinter dem Spieler; im Chat per CDP „folge mir“ (Enter, Text, Enter); 10 min gehen, W gehalten, alle 20 s ein Schwenk der Gier. Je Sekunde Abstand und Aufgabe follow_player, dazu Weg, Höhe, Hang und Wasser. 1 Boot, Bühne Mittag.
  - Soll: 1 = ein gebundenes Tier folgt ≥ 10 min über Hindernisse
- **speicher.K1 Radeon-Seite (M37)** (R6-halten, 0 → 1, Zweig stadt-erwachen-2 47b3be7a, ~10 min)
  - Befehl: Mess-Bahn, Host ohne save-server: die GTX-Fassung echt-k1.cjs mit K1_ERW (bericht/2310-messschuld-gtx-452972/echt-k1.cjs) auf die Radeon-Pfade kopieren. `GPU_LAUF_MAX_S=1800 gpu-lauf.sh messbahn env OUT_DIR=... ECHT_PORT=7974 node echt-k1.cjs 20 kandidat` am Mess-Baum 6579e8f4, davon ≥ 1 Tod mitten im Dorf-Erwachen.
  - Soll: 1 = der Browser-Pfad (ohne save-server) besteht den Tab-Tod an einem Gerät: Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten
- **speicher.K2 Speichern kostet keinen Frame (M38, am Kandidaten statt 3528f2d0)** (R6-halten, 0 → 1, Zweig stadt-erwachen-2 47b3be7a, ~4 min)
  - Befehl: Im Lauf der Radeon-M37: Hülle um `saveState` und um jeden requestIdleCallback-Rückruf, Σ Speicher-ms je rAF-Bild p95. Die Leck-Probe des Flugschreibers (`_imLeerlauf` alle 4 s) als eigener Posten. Dazu ein Lauf mit erwachender Zelle (Spieler geht in eine Dorf-Zelle), ≤ 3 min.
  - Soll: 1 = ≤ 0,3 ms je Bild (p95) in einer frischen Welt, auf dem Pfad des Spielers
- **mensch.K1 Besiedlung und Skala (M40, am Kandidaten statt 3528f2d0)** (R6-halten, 0 → 1, Zweig stadt-erwachen-2 47b3be7a, ~5 min)
  - Befehl: Mess-Bahn, `werkbank start --echt`, Mess-Baum 6579e8f4: `node scripts/diag-kreatur-takt.cjs --werkbank <port> --proben bewohner` im Fenster. Dazu ein Third-Bild am Dorfplatz um 8 Uhr aus dem Ausgabe-Pfad (M32 wiederholt: skripte/sitzung.sh m32b + platz-8.js, Uhr über das Spieler-Wort). 1 Boot.
  - Soll: 1 = Start-Dorf voll: Körper mit Menschen-Leib je Siedlung ÷ Σ leute = 1,0 ±0,05, ≥ 10 Menschen im Bild am Dorfplatz an einem Gerät
- **vegetation.K4 Die Natur-Wand (M41, am Kandidaten statt 3528f2d0; das Start-Dorf erwacht in Raten)** (R6-halten, 0 → 1, Zweig stadt-erwachen-2 47b3be7a, ~5 min)
  - Befehl: Mess-Bahn, Mess-Baum 6579e8f4: `node scripts/diag-haus-welt.cjs --phasen=grund --bild` (echte GPU). Start-Dorf nach dem Erwachen und ein gesetztes Haus; Halm- und Büschel-Pixel je Haus-Box (Schuss ohne Haus-Klasse); Gegenprobe vor der Tür. Bühne Mittag.
  - Soll: 1 = Halm- und Büschel-Pixel 0 in jeder Haus-Box des Start-Dorfs an einem Gerät

## beide

- **physik.K2 Kontakt ohne Durchdringen, im festen Takt, beim Tempo des Spiels: Stufe 2** (kippen, 1 → 2, Zweig kontakt-tempo-m dd94d0c4, ~0 min)
  - Befehl: NICHT FAHREN, das Werkzeug fehlt: (1) gate:kollision-bild (V) fährt den GT bei `_vehicleProfile(e).vmax`, nicht bei vmax × 1,2 (≈ 19 m/s); (2) es gibt keine Bild-Probe Spalt Leib–Wand im Ausgabe-Bild. diag-kollision-bild läuft nur auf dem Null-Renderer, werkbank hat kein Spalt-Verb. Das Kriterium bleibt 1, das Halten steht in der R6-Zeile physik.K2.
  - Soll: 2 = auch der Wagen bei der vmax des Spiels × 1,2 und die Bild-Probe (Spalt Leib–Wand ≤ 5 cm) auf beiden Geräten

## headless

- **ki.K2 Die KI spricht das ganze Gesetz: Regler-Wörter (Erreichbarkeit + Bau-Hash, Mechanik am Bau wie pipeline.K3, R3)** (kippen, 0 → 1, Zweig ki-regler-m c9d3b20e, ~4 min)
  - Befehl: Am Mess-Baum 6579e8f4: `node scripts/diag-praegung-welt.cjs` (gate:praegung-welt, Null-Renderer + echte Foundry, Teil K). Ersatzweise grün in der integ-CI [ci voll] an 6579e8f4. Urteil aus der Ausgabe: `ERREICHT: n von 112 Zeilen ... ≥ 50 %` (Zweig meldet 73/112 = 65,2 %), dazu SELBST-TEST, KLEMME, FAIL-CLOSED und PROMPT grün; Welt-Werk = Studio-Werk mit demselben ov.
  - Soll: 1 = ≥ 50 % der Zeilen von PARAMS_BY_KIND sind aus einem KI-Programm erreichbar (ov als fünftes Argument von spawn_studio, am Kern geklemmt, fail-closed), und der Bau-Hash des Welt-Werks folgt
- **gelaende.K1 EIN 3D-Gesetz (Edit-Form jetzt im Kern; 2D-Form unberührt)** (R6-halten, 1 → 1, Zweig editform-kern-m 63af584c, ~2 min)
  - Befehl: `npm run gate:worker-dichte` am Mess-Baum 6579e8f4 oder grün in der integ-CI an 6579e8f4: maxDiff 0 Stamm/Worker/Kern ohne Edits und mit Edits, HÜLLE (Turm Hub 3,47–3,50 je Edit), Selbsttest rot beim Namen.
  - Soll: 1 = die 2D-Form (hoehe, flussLaeufe) ist EINE Quelle, Studio-Plan = Welt byte-gleich
- **feld.K2 Gleich für alle: Edits über Peers und Reload (Edit-Satz ohne strength, Form aus dem Kern)** (R6-halten, 1 → 1, Zweig editform-kern-m 63af584c, ~6 min)
  - Befehl: `npm run gate:mp-sync && npm run gate:reload-treue` am Mess-Baum 6579e8f4 oder beide grün in der integ-CI an 6579e8f4 (Graben reist, Ursprung 0, Rejoin ≤ 31 s).
  - Soll: 1 = Edits und Bauten aus Schreib-Akten byte-gleich über Peers und Reload, gemessen
- **speicher.K4 Die Wiederkehr zeigt dieselbe Welt: Zahlen-Rundlauf (300 Schnitz-Säulen statt Kegel)** (R6-halten, 1 → 1, Zweig editform-kern-m 63af584c, ~4 min)
  - Befehl: `npm run gate:persistence` am Mess-Baum 6579e8f4 oder grün in der integ-CI an 6579e8f4: (L) 300/300 vor und nach dem echten Reload, (K) Studio-Haus mit kaltem Buch, (U) Boden-Umzug.
  - Soll: 1 = der Zahlen-Rundlauf (Dichte, Bauten) über einen echten Reload ist bewiesen
- **speicher.K5 Über Versionen hinweg (alte Edits tragen strength 48, der Kern liest es nicht mehr)** (R6-halten, 1 → 1, Zweig editform-kern-m 63af584c, ~0 min)
  - Befehl: Läuft in derselben `npm run gate:persistence`-Runde: (U) lädt alte Böden durch loadState, 25 Bauten, Abweichung 0 m.
  - Soll: 1 = eine Migrations-Klasse bewiesen
- **physik.K1 EIN Körper-Gesetz: Stoß nach Masse (_kreaturStossSchritt geht jetzt über _kreaturWeg)** (R6-halten, 1 → 1, Zweig kontakt-tempo-m dd94d0c4, ~6 min)
  - Befehl: `npm run gate:fahr-leben` am Mess-Baum 6579e8f4 oder grün in der integ-CI an 6579e8f4. Die Zeilen L3–L6 tragen das Urteil: Stoß gegen Fels, GT und Bären, Impuls nach Masse, Spieler gegen Wagen in beide Richtungen.
  - Soll: 1 = die Leiber (Spieler, Tier, Wagen) gemessen
- **physik.K2 Kontakt ohne Durchdringen: Stufe 1 am Kandidaten halten** (R6-halten, 1 → 1, Zweig kontakt-tempo-m dd94d0c4, ~5 min)
  - Befehl: `npm run gate:kollision-bild` am Mess-Baum 6579e8f4 oder grün in der integ-CI an 6579e8f4. (V) 114 Zeilen Körper × Tempo × Hindernis × Kadenz (144/60/30 fps + Takt-Deckel): 0 Durchtritte, Eindringen ≤ 0,01 m, Spalt ≤ 0,05 m; der Schmuggel (T) geht durch die Mauer.
  - Soll: 1 = die Leiber (Mechanik, als solche benannt)
- **tiere.K3 Gang und Leib: Schlupf des Stand-Fußes (Gang-Weg in Teil-Schritten)** (R6-halten, 1 → 1, Zweig kontakt-tempo-m dd94d0c4, ~6 min)
  - Befehl: `npm run gate:tier-gang && node scripts/diag-kreatur-takt.cjs --proben tiersatz` am Mess-Baum 6579e8f4 oder beide grün in der integ-CI an 6579e8f4: Schlupf ≤ 0,05 für Leib-Tiere und Satz-Tiere.
  - Soll: 1 = der Fuß steht (Schlupf ≤ 0,05)
- **mensch.K2 Tagesablauf (Start-Dorf erwacht in anderer Reihenfolge: Häuser vor den Schichten)** (R6-halten, 1 → 1, Zweig stadt-erwachen-2 47b3be7a, ~3 min)
  - Befehl: `node scripts/diag-kreatur-takt.cjs --proben bewohner` am Mess-Baum 6579e8f4 oder gate:kreatur-takt grün in der integ-CI an 6579e8f4: trefferMin ≥ 0,9 über 24 Spielstunden, planGleich, Schmiede 10 Uhr > 0 und 2 Uhr = 0, Sprünge 0.
  - Soll: 1 = ein Bewohner trifft ≥ 0,9 seiner Soll-Orte über 24 Spielstunden
- **mensch.K3 Wege und Raum (gleicher Lauf wie mensch.K2)** (R6-halten, 1 → 1, Zweig stadt-erwachen-2 47b3be7a, ~0 min)
  - Befehl: Derselbe Lauf `diag-kreatur-takt --proben bewohner`: wandN = 0, Tür = durch, Wege und Strecke je Bewohner.
  - Soll: 1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf
- **siedlung.K1 Das Haus von innen (siedlung-ort.js mit Welt-Byte)** (R6-halten, 1 → 1, Zweig stadt-erwachen-2 47b3be7a, ~6 min)
  - Befehl: `npm run gate:haus-welt` (Teil 1/2 + 2/2, W10 der Spielgang) am Mess-Baum 6579e8f4 oder grün in der integ-CI an 6579e8f4: 8 Gänge, Hub ≤ 0,20 m, 0 Kletter-Schritte, Keller und Dachboden erreicht.
  - Soll: 1 = der Spieler geht durch die Tür bis Keller und Dachboden ohne Vertikal-Sprung > 0,3 m in einem Frame (Anti-Clip-Hub = ROT), an einem Haus

## Hinweise

Diese Werkzeuge fehlen, beim Namen:
(1) physik.K2 Stufe 2. Die (V)-Zeile von gate:kollision-bild fährt den GT bei vmax, nicht bei vmax × 1,2 (≈ 19 m/s). Eine Bild-Probe für den Spalt Leib–Wand im Ausgabe-Bild beider Geräte gibt es nicht: diag-kollision-bild läuft nur auf dem Null-Renderer, werkbank hat kein Spalt-Verb. Das Kriterium bleibt 1.
(2) M42 tiere.K3 Stufe 2: diag-tier-gang kennt `_satz` nicht. Der Tastgrad der Satz-Tiere (`_tierSatzGang`) ist ungemessen.
(3) bauen.K4: Kein werkbank-Verb für „bauen in der Höhe“. Das Skript skripte/m-turm.cjs ist neu zu schreiben, die Bausteine sind da (spiel.cjs mit klick(...,'right'), zielen.js mit __zielen({hoch:-1}), `_bodenSichtAt`, `_fieldSolid`).
(4) siedlung.K5, Definitions-Frage: Wörtlich gelesen („≤ 0,5 s nach dem Erwachen“) ist nH 12 aus Geometrie ROT. Die Zelle erwacht bei 260 m, das nächste Haus steht 237 m vor dem Spieler hinter dem Bauten-Radius 107–120 m: 32,9 s ab dem Erwachen, 128–172 ms ab dem Sichtradius. Der Koordinator entscheidet vor der Buchung; die Station liefert beide Zeiten und den Bau-Hash je nH. Am 22.10. war der Hash bei nH 300 zwischen Boots ungleich, an Zug 2 gleich.

Mechanik vor dem Lauf:
- Die Radeon-Skripte tragen WT=mess-6cfce hart (spiel.cjs, srv.sh, reihe.sh). Sie müssen auf einen detached Mess-Baum an 6579e8f4 zeigen; VERSION 18.546.74 je Baum prüfen und den md5-Wächter gegen einen verwaisten save-server setzen.
- echt-k1.cjs mit K1_ERW gibt es nur in bericht/2310-messschuld-gtx-452972; für die Radeon kopieren.
- Die CI-Ratsche spec/profiband/ratsche-ki-korpus.json spielt den alten Mitschnitt ab (Schlüssel ist der Satz). Nach dem Prompt-Wechsel ist sie für ki.K1 blind; nur der --echt-Lauf zählt, --aufnahme schreibt den Mitschnitt neu.
- Die headless-Zeilen deckt die integ-CI [ci voll] an 6579e8f4 ab (persistence, worker-dichte, kollision-bild, fahr-leben, settlement, haus-welt, tier-gang, kreatur-takt, reload-treue, praegung-welt, mp-sync). Lokal laufen sie nur, wenn die CI rot ist.
- Über der 3-min-Grenze von R5, benannt: M36 (4 Boots), M37 (20 Tode, 6–8 min), M19 (die Staffel verlangt 10 min), M39 (4 Boots).
- R8: M36 und M39 fahren mit Regler frei. Das ABAB mit Regler voll zählt nicht für profiband.K4.
- ollama belastet die CPU: ki.K1 nie parallel zu einer anderen Radeon-Station.

Am Diff gelesen gehalten, ohne Station (kein Welt-Byte am gemessenen Zweig):
- gelaende.K3: See ohne Edit; bandOben und bandUnten sind die alte Formel, die neue Edit-Form wirkt nur mit Edit.
- gelaende.K4: Die Mutation ist kein Edit; gate:wasser-leben samt G5 läuft in der CI.
- gelaende.K5: Die Stufe 1 tragen Rad und Streu an der Wiese, kein Huf.
- feld.K3: Keine der sechs Sims ist berührt.
- bauen.K1: `_studioStampFor` gibt mit ov == null byte-gleich zurück.
- bauen.K3: Statik und Affordanzen unberührt.
- pipeline.K3 und K4: studio-bruecke ändert nur den Prompt, `_foundrySchale` ist unberührt.
- studios.K2: worlds/* tragen nur den ?v=.
- halten.K1 und K2: kampf.js ändert nur Kommentare und den Namen carveVoxel.
- leib.K1 und K4: koerper-bewegung unberührt; `_leibPaar` hält den Spieler fest, nur `_spielerStoss` wirkt auf ihn.
- fahrzeug.K3 und K4: koerper-fahrt unberührt, fahr-proben ist nur Werkzeug.
- Ebenfalls unberührt: klang.K2/K4/K5, wetter.K1/K2/K5, licht.K2, ferne.K1/K2, tiere-fremde Pfade.
- M43 material.K3: Der Pfad ist unberührt; Kandidat oder 3528f2d0 messen gleich.
