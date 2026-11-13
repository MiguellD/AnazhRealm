# 24 Klang: Symphonie, Takt, Klang im Bild

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Kein Bild trägt Klang. Gesehen: `scratchpad/genom-spiel/frontal.png` (Dorf der Ankunft, Mittag): kein Untertitel, keine
  Klang-Anzeige, ein Schornstein ohne hörbare Glut. Was der Spieler HÖRT, sagt die Quelle: **nichts**, bis er den Knopf
  „Klang" findet. Die Symphonie startet nur über `#anazh-symphony-toggle` (`stamm/speicher-laden.js:2430-2440`) oder das
  Chat-Verb „aktiviere anazh-symphonie" (`stamm/feld-leben.js:1544-1553`); sonst ruft niemand `initSymphony`
  (`stamm/klang.js:8`, Grep über `stamm/`: 2 Aufrufer). Der erste Klick in die Welt (`stamm/dirigent-ankunft.js:1384-1396`)
  fängt nur den Zeiger — die Geste, die der Browser für Audio verlangt, verfällt ungenutzt.
- Die Domäne steht mit 9 von 10 Punkten auf der Karte; im gespielten Pfad ist ihre Konsum-Tiefe 0.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- KANN (klang-core.js, gemessen, gehalten in `pm/punkte/stand.json:1394-1561`): Ort-Klang aus der Lage am Ohr
  (Wiese wind −36,3 · vogel −38,6 dB aus 20 Leibern), Wind gesehen=gehört r 0,79–0,81 (GTX/Radeon), Raum RT60 Feld 0,283 ·
  Wald 0,649 · Gasse 1,522 · Höhle 3,195 s, Verdeckung Haus −11,2 dB, Schritt je Stoff, Motor r 1,0, Doppler, Landung.
  Punkte: K1 2 · K2 2 · K3 2 · K4 2 · **K5 1** = 9/10.
- Die Werkstatt rechnet Umwelt-Stimmen und Tier-Rufe als Puffer im eigenen Worker, zero-copy (`stamm/klang.js:166-234`,
  `klang-core.js:1230-1256` `tierRufPuffer` mit dem reinen Biquad `bq`). Schritt und Trommeln tun das NICHT.
- **Der Schritt** baut je Tritt im Haupt-Faden zwei Stimmen aus je BufferSource → Biquad → Gain (`klang-core.js:1537-1553`);
  auf losem Boden setzen die Körner (`SCHRITT.koerner: 28`, `klang-core.js:1485`) je Korn zwei Automationen
  (`:1568-1577`): ≈ 58 Automations-Rufe + 6 Knoten + 6 connect + start/stop je Schritt (gezählt am Code, nicht profiliert).
- **Die Trommeln** (`_lofiKick/_lofiSnare/_lofiHihat`, `stamm/klang.js:1462-1533`) bauen je Schlag 2–4 Knoten mit
  3–5 Automationen; `_lofiPlayGroove` (`:1655-1685`) plant je Takt-Hälfte 4 Schritte davon.
- **Der Takt** (klang.K5#2, Soll `TAKT_SOLL_MS = 0.2`, `scripts/diag-klang-zensus.cjs:1013`; Station
  `pm/punkte/stationen/g6.js:473-580`). Radeon p95 gehen / fahrt / nacht in ms (Roh `pm/punkte/messung/roh/<sha>-radeon/klang.K5_2.out`):
  | Kopf | gehen | fahrt | nacht | Träger über dem Soll |
  |---|---|---|---|---|
  | ec281422 (main, heute) | 0,40 | 0,34 | 0,33 | `_playSchrittOneShot` 0,12 · `_lofiPlayGroove` 0,07 · `_raumStrahlen`/`_fahrtKlangTick` je 0,07 |
  | dc9eacb0 | 0,21 | 0,35 | 0,22 | Schritt 0,10 · `_fahrtKlangTick` 0,08 · `_raumStrahlen` 0,07 |
  | 1cd1c408 | 0,28 | 0,77 | 0,32 | Fahrt 0,09 · Raum 0,08 |
  | 900c28e6 | 0,26 | 0,43 | 0,43 | Schritt 0,11 · Raum 0,10 |
  | e475c6b4 · 6aa7a5a6 · dcc33615 · 507beba6 · 350e6b11 | 0,15–0,17 | 0,21–0,28 | 0,18–0,21 | Fahrt: Raum + `_fahrtKlangTick` |
  Die Fahrt reißt an der Radeon in **9 von 9** gelesenen Läufen; gehen reißt heute neu (0,40, 9 Tiere statt 0–3).
  GTX hält (2d5f4146: 0,14 / 0,20 / 0,18; Träger auch dort zuerst `_playSchrittOneShot` 0,12–0,17, `_lofiPlayGroove` 0,09–0,19).
  Aussetzer 0 in allen gelesenen Läufen.
- Die Linse nennt nur 12 Teile (`diag-klang-zensus.cjs:1015-1016`); `_umweltRingProbe`, `umweltGraph.anwenden`,
  `_umweltKlangTick` selbst und `_lofiTick` stehen nicht darin. Fahrt ec281422: drei Träger 0,17 ms gegen p95 0,34 ms.
- Zwilling am Master: der Knopf setzt beim Wieder-An `0.35` hart (`stamm/speicher-laden.js:2443`, ebenso
  `stamm/feld-leben.js:1555`), das Gesetz ist `UMWELT.masterBasis × masterVolume` (`stamm/klang.js:24`,
  `stamm/werkstatt-hud.js:1792`): nach Aus→An ist der Lautstärke-Regler vergessen.

## Die EINE begrenzende Entscheidung
Der Klang gehört in den gespielten Pfad: er startet mit der ersten Geste in die Welt — und weil er dann JEDEN Spieler im
Haupt-Faden kostet, rechnet der Haupt-Faden keinen Einmal-Klang mehr selbst: Schritt und Trommeln kommen als Puffer aus der
Klang-Werkstatt, auf demselben Weg wie der Tier-Ruf (rechnen in der Werkstatt, spielen = 1 Quelle + 1 Gain).

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse: „Klang-Arbeit je Ereignis im Haupt-Faden" — alle Stufen in einer Welle:
1. **An mit der Geste:** im Klick-Hörer `stamm/dirigent-ankunft.js:1384` vor dem Zeiger-Fang `initSymphony()`, wenn die
   Symphonie nicht läuft und der Spieler sie nicht ausgeschaltet hat; der Knopf wird Stumm-Schalter.
2. **Ein Master-Gesetz:** `speicher-laden.js:2443` und `feld-leben.js:1555` setzen `UMWELT.masterBasis × masterVolume`
   statt `0.35` — die 0,35 stirbt als Literal.
3. **Schritt als Puffer:** `schrittKlang` (`klang-core.js:1532`) teilt sich wie der Ruf in `schrittPuffer(boden, lage, saat)`
   (reine Rechnung mit `bq`, Ferse + Körner + Hülle) und `einmalSpielen(ctx, ausgang, tex, pegel)`; die Werkstatt
   (`_klangWerkstattSchale`, `stamm/klang.js:220`) erhält die Nachricht `schritt`. Vorrat je Stoff am Fuß und je Landungs-Stufe
   (4 Saaten, die Streuung des Schwerpunkts bleibt), bestellt beim ersten Kontakt mit dem Stoff, wie eine Umwelt-Stimme
   ohne Paket (`:142-145`). `_playSchrittOneShot` (`:978`) spielt nur noch.
4. **Trommeln als Puffer:** Kick/Snare/Hihat je Timbre (`_lofiDrumTimbre`) und Filter einmal gerechnet; `_lofiPlayGroove`
   (`:1655`) spielt je Schlag 1 Quelle + 1 Gain.
5. **Die Linse nennt den Rest:** `TAKT_TEILE` (`diag-klang-zensus.cjs:1015`) um `_umweltRingProbe _umweltKlangTick _lofiTick`
   — kein Soll bewegt, nur der Name des Trägers der Fahrt.
Leser-Liste (vor dem Schnitt): `stamm/klang.js:925-937` `_schrittKlangEreignis` (Zähler bleiben) ·
`scripts/playtest/klang.cjs:209-212,285-306` (fail-closed ohne Symphonie, Hook auf `_playSchrittOneShot`) ·
`pm/punkte/stationen/g6.js:285-470` klang.K4 (Analyser am Schritt-Gain, „gefunden an der Erzeugung" — der Gain bleibt) ·
`scripts/diag-gegenstand-stoff.cjs:336` (Streuung je Tritt) · `scripts/lib/wasser-linse.cjs:249-263`,
`scripts/diag-tier-gang.cjs:286` (Zähler) · `scripts/diag-regler-wirkt.cjs:356` (`_lofiPlayGroove`) ·
`stamm/werkstatt-hud.js:3031` Untertitel (unverändert) · g6.js `taktLauf` (`TAKT_TEILE` als Ausdruck gelesen, `:575`).
Kosten-Zeile: Haupt-Faden je Schritt von ≈ 70 Bindungs-Rufen auf ≈ 6; einmalig im Klick-Bild `initSymphony` samt
`fahrtWelle` (1024 Teiltöne, Radeon 6,3 ms laut `klang-core.js:1652-1653`) — nach der Ankunft, nie in B; Speicher
≈ 6 Stoffe × 2 Stufen × 4 Saaten × ~58 KB (0,3 s, 48 kHz) ≈ 2,8 MB, an den Fuß gebunden, nie an die Welt.
Kriterien: **klang.K5#2 radeon** Ist 0,40/0,34/0,33 ms (ec281422) ↔ Soll ≤ 0,2 ms je Phase, 0 Aussetzer → +1 (10/10);
klang.K4#1/#2 muss halten (Radeon 1cd1c408: gras 6334 · laub 8942 · stein 4790 Hz, Abstand ≥ 300 Hz); K1 Lab = Welt.
Station: klang.K5#2 `g6.js:473` (Radeon + GTX), klang.K4 `g6.js:285`. Hörprobe: Wiese gehen + Dorf, vorher/nachher am
Abgriff derselben Station (Schwerpunkt je Stoff gleich, Pegel ±0,5 dB).

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Auf main: Werkstatt-Weg für Ruf und Stimmen (`stamm/klang.js:161-234`), der reine Biquad `bq`, die Takt-Station.
- Klang-Zweige auf origin, alle älter als 06.11. (w13-klang-fahrt 8f7cd476, w12-klang-takt d957c4d9, w12-klang-lage
  1031bdad, w26-klang-schritt 8d1d3bb1 vom 09.11.) — keiner trägt diesen Schnitt; ob sie gemergt sind, nicht geprüft.
- Es fehlt alles von Stufe 1–5: kein Zweig, kein Arbeiter.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht profiliert: dass die Automationen der Körner den Schritt tragen, ist am Code gezählt; die Linse misst nur
  `_playSchrittOneShot` als Ganzes (0,10–0,17 ms je Bild über dem Soll).
- Die Fahrt (Raum + `_fahrtKlangTick` ≈ 0,14 ms) fällt mit diesem Schnitt NICHT sicher: dort trägt Stufe 4 nur ~0,03 ms
  (`_lofiPlayGroove`). Der ungenannte Rest (p95 0,34 gegen 0,17 benannt) wird erst mit Stufe 5 sichtbar.
- `stand.json:1541-1548` führt klang.K5#2 radeon als UNGEMESSEN (Absturz 36f9d45a), die Roh-Datei ec281422-radeon trägt
  eine echte ROT-Messung (0,40/0,34/0,33) — ob gebucht, nicht gelesen.
- klang.K2#2 headless trägt „Selbsttest (eingefroren) ROT" in der grünen Zahl (`stand.json:1448`); FUND-REGISTER.md:102
  nennt die Bild-Seite von K2 r 0,39–0,65 — Kopplung gesehen=gehört wackelt an der Bild-Seite, nicht am Ohr.
- Nicht gelesen: ob ein Tor den Start ohne Klang voraussetzt (Playtests mit `aria-pressed`), ob die Wahl „Klang aus"
  gespeichert wird, `worlds/klang/klang.js` (Lab) und `scripts/playtest/klang.cjs` ganz.
- Das erste Betreten eines neuen Stoffs schweigt einen Tritt, bis der Puffer der Werkstatt da ist (wie heute jede
  Umwelt-Stimme) — gehört, nicht gemessen.
- Klang steht nicht in `docs/PFLICHT-OFFEN.md`; er berührt E nur über den Haupt-Faden.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Wirkung 4 (die Welt der Ankunft klingt statt zu schweigen; Takt gehen/nacht unter das Soll, +1 klang.K5) · Aufwand M ·
  Risiko: der Schwerpunkt je Stoff (klang.K4, 2 Punkte) kippt, wenn der gerechnete Biquad vom Browser-Biquad abweicht —
  darum dieselbe Station vor/nach am Abgriff vor der Abgabe.
