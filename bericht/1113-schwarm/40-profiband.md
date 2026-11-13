# 40 Pflicht E — das Profi-Band: der Richter misst eine Welt im Bau, nie das Band

## Was es den Spieler kostet (kein Bild gesehen)
- Seit dem 18.10. gibt es für E **keine gültige Zahl**. Die letzte stammt aus dem ABAB der GTX an f45ee994: stehend Frame p95 16,8 ms, VRAM 99,6–111,2 MB, CPU p95 4,6–6,3 ms
  (KO `bericht/1810-f6-gtx.md:38-41`). Das ABAB fährt nicht mehr: `FAHRT_ABAB` ist aus, `zug/abab.txt` hat seit dem 11.11. keine Zeile (KO `bericht/1113-kurs-G-pruef-apparat.md:27-28`, KO `zug/werkzeug/fahre.sh:8,162`).
- Die Meisterkarte bucht **0 Punkte** für profiband.K1–K5 und für pflicht.E (0 von 8, Status „ohne Richter“; PM `stand.json:2868-3097, 5127-5141`). Alle 20 Stationen stehen UNGEMESSEN:
  Radeon an 36f9d45a (13.11. 18:15) „die Welt der Sitzung startet nicht … Exit 3221226505“, GTX zuletzt an dcc33615 (10.11.) „Fremd-Last: AppHelperCap.exe 90,5 CPU-s“.
- An der Ankunft (Genesis) misst die jüngste Rohdatei 13.11. 01:13 (Radeon 1cd1c408, unter Last, die Welt im Bau) Frame p95 41,9 ms stehend in Ego und Third, also etwa 24 Bilder/s.
  Ob der Spieler das sieht oder ob es nur das Einschwingen ist, sagt heute keine Messung — und genau das ist der Bruch.

## Was die Quelle sagt
**Das Gesetzbuch kann:** Der Haushalt (SPIEL `spec/profiband/haushalt.json:5-11`) setzt das Band: 208 Befehle · 680k Dreiecke · 118 MB · 16,7 ms GPU. Dazu kommen 13 Klassen mit Regeln (`:416-698`)
und die Ratsche je Ort × Gerät × Sicht (Radeon 14.10., GTX 22.10.). Das Werkzeug ist die Werkbank `/band` (SPIEL `scripts/werkbank.cjs:2495-2560`). Sie schwingt ein, bis der Bau ruht
(`bandEinschwingen` `:290-337`: 30 ruhige Takte, Deckel per Default 240 000 ms `:2515`), nimmt die Proben, dann den VRAM nach dem Collector und die gpu-bank.
Daraus richtet `bandUrteil` (SPIEL `scripts/lib/band-urteil.cjs:592-841`).

**Was die Welt davon konsumiert, also was der Richter wirklich fährt:** EINE Gang-Probe der Punkte-Maschine (PM `stationen/g6.js:1221-1249, 1364-1373`):
- Der Deckel steht fest bei 90 s (`PB_GANG_SEK`, Budget 84 s). In dieser Zeit laufen 10 Zellen plus 6 Bänder.
- Das Stand-Fenster dauert **2 s mit 0,3 s Einschwingen** (`PB_KONST.steht`).
- Das Band ruft `/band` mit **capMs 8000** (`:1366`). Die Werkbank-Vorgabe wäre 240 000.

Was dabei herauskommt:
1. **Kein einziges Band schwingt ein.** In jeder gelesenen Rohdatei steht `"eingeschwungen":false,"stempel":"ROT"` (PM `messung/roh/{78d37554,350e6b11,1cd1c408}-*/profiband.K3_1.out:264`). Damit ist das Band-Exit immer 1 (`g6.js:1369`).
2. **Das Stand-Fenster misst den Bau, nicht das Bild.** An 1cd1c408 (Genesis Ego/Third) ist die Belegung p95 32,3/32,0 ms, die Pflicht-Arbeit des Bilds aber nur 1,13/1,35 ms (`"fenster":{…"belegung":32.25,"pflicht":1.13…}`).
   Die Belegung ist zu 96 % Bau-Arbeit nach dem Umstellen. Das Soll von K2 (5,8 ms) misst also die Ankunft eines Orts und nicht den Takt.
3. **Die Wiese ist nie gemessen.** An 1cd1c408 und 350e6b11 steht `["wiese-ego","Uhr"]` und `["wiese-third","Uhr"]`, weil die Uhr nach Genesis (29,6 + 21,8 s) leer ist. E verlangt Wiese UND Genesis
   (SPIEL `docs/PFLICHT-OFFEN.md:19`).
4. **Vom 10.11. bis zum 12.11. brach jedes Band.** An dcc33615 und 900c28e6 (Radeon und GTX) endeten alle vier Bänder mit `"/band: Cannot read properties of undefined (reading 'size')"`.
   Ab 350e6b11 laufen die Bänder wieder (Ursache nicht gelesen).
5. **Fünf Täter ohne Haushalt-Klasse machen jedes Band deterministisch ROT, unabhängig von der Last.** Gefunden in den Rohdateien 78d37554, 350e6b11 und 1cd1c408:
   - `nahWiese:Lf:schale` (1 Befehl, SPIEL `stamm/vegetation-wiese.js:1208`; die Regel `^nahWiese:Lf$` in `haushalt.json:504` trifft ihn nicht)
   - `kamm-krone` (1 Befehl, `stamm/gelaende-fern.js:747`)
   - `f:sitzbank:L0` (4–6 Befehle)
   - `vorbau:tor_drachentor` / `vorbau:haus_alemannisch` (13–17 Befehle, `stamm/siedlung-bauten.js:1425`)
   - `vorwaermen:human` (18 Befehle, `stamm/koerper-leib.js:316`)

   Die Probe zeigt nur die ersten 3 roten Zeilen (`g6.js:1372`); die volle Liste ist nicht gelesen. Ein ROT ohne reißendes Maß bleibt unter Last UNGEMESSEN (PM `punkte.cjs:1019-1020`).
   Deshalb kann die GTX mit dem HP-Dienst als Dauer-Last (AppHelperCap 86–95 CPU-s) K3 nie urteilen.
6. **Zahlen, die die Last nicht erklärt** (Band nach dem Collector, Radeon 1cd1c408): VRAM Genesis Ego/Third 139,3/129,0 MB gegen 118. Dasselbe Bild an 78d37554: GTX 148,7/130,5, Radeon 151,1/134,7.
   Das sind +20–40 MB gegen den 18.10. Befehle 120/133 und Dreiecke 368k/408k liegen im Band. Die gpu-bank liegt bei 19,9/26,7 ms gegen 12; ob das am Einschwingen liegt, ist nicht getrennt.

## Die EINE begrenzende Entscheidung
**E wird nur am eingeschwungenen Band geurteilt, dort, wo der Spieler ankommt und steht.** Die vier Stand-Zellen von E (Wiese und Genesis × Ego und Third) messen erst, wenn `/band` `eingeschwungen: true` meldet,
und zwar in derselben Welt direkt danach. Sie laufen vor jeder Bewegungs-, Dorf- und Stadt-Zelle. Jeder Täter im Bild trägt eine Haushalt-Klasse.
Was davor gemessen wird, ist Ankunft (Pflicht B) und kein Band.

## Der Schnitt (die Klasse „E misst nicht E“ ganz, in einer Welle)
**Stufen:**
1. **Reihenfolge und Einschwingen in der Gang-Probe** (PM `stationen/g6.js`):
   - Die vier E-Zellen laufen zuerst.
   - `/band` läuft ohne `capMs: 8000` (`:1366`), also mit der Werkbank-Vorgabe 240 s / 30 ruhige Takte.
   - Das Stand-Fenster `steht` folgt direkt auf das eingeschwungene Band, ohne neues Umstellen.
   - Bewegungs-, Dorf- und Stadt-Zellen trägt die Uhr danach (`pbSchrittTraegt`, schon vorhanden). Eine E-Zelle läuft immer, auch über die Uhr (`:1226-1233` sagt das schon, `:1239` deckelt es doch).
2. **Die Regeln für die fünf Täter im Haushalt** (SPIEL `spec/profiband/haushalt.json`), mit bestehenden Klassen. Kein Soll bewegt sich.
   - `^nahWiese:Lf(:schale)?$` → nahWieseFern
   - `^kamm-krone$` → boden (Fern-Gelände wie fern-ring)
   - `^f:sitzbank:L[01]$` → bau
   - `vorbau:*`/`vorwaermen:*` bekommen KEINE Regel. Ein Gast mit Maßstab 0 zeichnet laut `stamm/siedlung-bauten.js:1431-1464` nie. Zählt der Zensus ihn trotzdem als Befehl,
     ist das der Täter im Zensus (`__drawZensus`) oder ein Bruch `_gastOhneRaum`. Zuerst lesen, dann schneiden; der Täter wird nie in eine Klasse versteckt.
3. **Der VRAM ist fest unter Last.** In `pbMass` (PM `g6.js:4259`) wandert „VRAM MB“ zu `PB_FEST`. Last bläht den Speicher nicht: Heute würde roh 139 ÷ f „entlastet“ und als UNGEMESSEN entschuldigt.

**Leser-Liste (vor dem Schnitt):**
- `g6.js:1364-1373` B (das Band der Probe) und `:1398-1400` schritt/Uhr
- `pbRichter` + `pbMass` `:4270-4286`
- `punkte.cjs:1013-1022` fremdUrteil
- `band-urteil.cjs:354-358` zuordnen, `:639-658` ROT haushalt
- `werkbank.cjs:2495-2560` `/band`
- `gate:profiband` (`package.json:152`, `scripts/diag-profiband.cjs`, Schema und verankerte Muster; nicht gelesen, ob es Muster gegen den Code verankert)
- `zerlege-linse` (ordnet über dasselbe `zuordnen`, `band-urteil.cjs:349-350`)

**Kosten-Zeile:**
- Im Spiel 0 ms und 0 MB (nur Instrument und Spec).
- Messzeit: Das Einschwingen kostet je E-Zelle zusätzlich etwa 10–40 s (geschätzt aus Genesis 21,8–31,5 s bei 8-s-Deckel, nicht gemessen). Getragen wird das von den Bewegungszellen, die dafür unter die Uhr fallen, nie von E.

**Kriterien der Meisterkarte** (alle mit 0 Punkten; Ist aus Radeon 1cd1c408, nicht eingeschwungen):

| Id | Ist | Soll | Station |
|---|---|---|---|
| pflicht.E#1 Frame p95 steht | Genesis 41,9/41,8 · Wiese ungemessen | ≤ 33 | `g6.js:3247-3264` |
| profiband.K1#1 bewegt | wiese-ego-geht 58,3 · genesis-third-geht 58,3 | ≤ 33 | `:3217-3232` |
| profiband.K1#2 | wie K1#1 | ≤ 16,7 je Zelle | `:3233-3246` |
| profiband.K2#1 Belegung steht | 32,3/32,0 (Pflicht-Anteil 1,1/1,4) | ≤ 5,8 | `:3265-3280` |
| profiband.K3#1 Band | ROT: haushalt, Stempel, VRAM 139/129, gpu-bank 19,9/26,7 | ≤ 118 MB, ≤ 12 ms | `:3301-3317` |
| profiband.K3#2 | wie K3#1 | Befehle/Dreiecke/VRAM/GPU p95 | `:3318-3342` |
| K4 (Glätte), K5 (Dauer) | Rohdaten nicht gelesen | Soll unberührt | `:3185-3216` / `:3343-3372` |

## Was schon liegt
- **Das ABAB-Instrument der OMEN:** `n1710-g8` (9b3acc1d), Läufe unter `p3/n1810/f6/`; es maß am 18.10. acht Zellen „nicht langsamer“ (KO `bericht/1810-f6-gtx.md:18-41`). Es ist der einzige Richter, der E je im ABAB urteilte, liegt aber nicht in main und nicht in der PM.
- **Das Gesetz der Fremd-Last mit Referenzfahrt** (PM `punkte.cjs:999-1028`) trägt GRÜN unter Last schon. Nach Stufe 2 und 3 hat K3 an der GTX ein Maß, statt ewig UNGEMESSEN zu bleiben.
- **Kein Zweig trägt den Schnitt.** `origin/w28-richter-hand{,2,3}-pm` (13.11.) heilen bauen.K5 und nicht das Band (git log 8afcd41a).
- **Bis zur Landung fehlt:** Die Radeon-Welt startet an 36f9d45a nicht (Exit 3221226505). Das ist ein Blocker für jede Radeon-Station, nicht nur E. Gelesen nur als Zeile in `stand.json:2878`, Täter nicht gelesen.

## Ehrlich offen
- **Nicht gelesen:**
  - die Ursache von „reading 'size'“ (10.–12.11.) und warum sie verschwand
  - `__drawZensus` (zählt er Gäste mit Maßstab 0?)
  - die volle `rot`-Liste der Bänder
  - die VRAM-Liste je Erzeuger (welcher Erzeuger die +20–40 MB trägt)
  - die K4/K5-Rohdaten
  - `diag-profiband.cjs`
- **Nicht gemessen:** Eine eingeschwungene E-Zahl seit dem 18.10. fehlt an beiden Geräten. Das Radeon-ABAB fehlt seit jeher (PFLICHT-OFFEN E).
- **Widerspruch:** E verlangt „im ABAB unter Regler voll“ (PFLICHT-OFFEN:19). Der Richter der Karte ist ein einzelner Gang ohne ABAB, und das ABAB läuft nicht.
  Die Entscheidung oben nimmt den Gang als Richter. Das ABAB bleibt der Revert-Richter nach der Landung (Kurs G Nr. 5); ob der Schöpfer den Gang als „ABAB“ gelten lässt, ist sein Scope.
- **Widerspruch:** Das K2-Soll 5,8 ms stammt aus Trace-Zahlen von 5,9–7,3 ms (`g6.js:3270`). Das waren damals auch Fenster mit 0,3 s Einschwingen. Ob das alte Grün je ein eingeschwungenes Grün war, ist nicht geprüft.

## Rang
**Wirkung:** 4 im Takt. Ohne den Schnitt kann E nie fallen, und A und C hängen an „E hält“. Er bringt die erste echte E-Zahl seit dem 18.10. und macht die 0 Punkte von K1–K3 urteilbar.
Im Bild wirkt er 0, solange der VRAM-Täter nicht geschnitten ist.

**Aufwand:** M (eine Probe in g6.js, drei Regeln, eine Zeile `PB_FEST`, ein Lesegang im Zensus für vorbau).

**Risiko:** Die eingeschwungene Zahl kann über dem Band liegen (VRAM +20–40 MB deutet darauf). Dann wird aus „ungemessen“ ein ehrliches ROT mit Täter-Namen, und der nächste Schnitt ist der VRAM-Erzeuger, nicht ein weiteres Instrument.
