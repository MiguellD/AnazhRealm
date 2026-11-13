# 32 v1-Pfad Schritt 5 und Rahmen: Tor-Durchgang, Teilen, HUD, Kampf, das lebendige Feld

Kürzel: SPIEL = `.claude/worktrees/leib-kanon-urteil` (main ec281422) · PM = `C:/Users/micha/AppData/Local/Temp/claude/w3/pm/meisterkarte-quelle/punkte` · KO = `.claude/worktrees/koord-hebel` · BILD = Scratchpad der Sitzung.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Vom Tor-Durchgang habe ich KEIN Bild gesehen. Was der Spieler erlebt, sagen die Rohdaten der Station tore.K1#1 vom 13.11. (PM/messung/roh/1e00bfdb-gtx/tore.K1_1.out, Zeile `TOR_K1`; PM/messung/roh/1cd1c408-radeon/tore.K1_1.out):
  er geht durchs Welt-Tor und sieht 2,9–9,7 s lang eine dunkle Tafel (Luma 0,002–0,043; 88–351 dunkle Bilder je Lauf), und in JEDEM Third-Lauf (Lauf 2 und 4, beide Geräte)
  wechselt die Welt dreimal (A→B→A→B), d. h. das Tor wirft ihn zurück und wieder hinein. Ego-Läufe 1/3/5 wechseln einmal.
- BILD/genom-spiel/gruppe.png (Dorf, Mittag): kein HUD-Element im Bild, kein Tor im Blick, Bewohner, Laterne, Marktstand, dunkel-mariner Himmel.
- BILD/main-1/probe/spielgang.png (Wiese am Waldrand): kein HUD, kein Fadenkreuz sichtbar — die HUD-Deckung 2,84 % (spielgang.K3) habe ich nicht im Bild gesehen.
- Teilen, Kampf (Bogen), Stimme des Felds: kein Bild gesehen.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; KANN gegen KONSUMIERT)
**Tor-Durchgang (tore.K1, 0/2).** stand.json:4215–4239: beide Geräte ungemessen (Radeon: Werkbank-Absturz Exit 3221226505; GTX: GPU-Schloss 600 s). Letzte Werte 13.11.:
| Lauf | Sicht | GTX t / Ankunft / Schirm ms | GTX Wechsel, Frame max | Radeon t / Ankunft / Schirm ms | Radeon Wechsel, Frame max |
|---|---|---|---|---|---|
| 0 geboren | ego | 9747 / 2391 / 9720 | 1, 951 | 6097 / 1631 / 6059 | 1, 1111 |
| 1 | ego | 5119 / 1045 / 5112 | 1, 404 | 3460 / 687 / 3468 | 1, 245 |
| 2 | third | 8190 / 1156 / 8223 | **3**, 486 | 6157 / 886 / 6151 | **3**, 322 |
| 4 | third | 7580 / 1006 / 7555 | **3**, 485 | 5579 / 973 / 5558 | **3**, 452 |
| 5 | ego | — (kein Wert) | 1, 537 | 2907 / 574 / 2908 | 1, 199 |
Soll (PM/stationen/g5.js:5746): t ≤ 2000 ms, Luma 0,05–0,95, Frame ≤ 100 ms, ≥ 4 Läufe. Der Tausch selbst steht nach 0,6–2,4 s (Spalte Ankunft); den Rest hält der
Ladeschirm, bis das kalte Weltbild steht — die Lücken-Zeilen nennen bei JEDER Rückkehr in eine besuchte Welt neu „Boden wächst (17 Stücke)", „Horizont wächst (0 %)",
„Licht des Orts wird gemessen", „6 Programme des Bilds entstehen" (GTX Lauf 2, 7139 ms). Das ist Pflicht B, nicht das Tor.
- Die Tür: `_weltTorBetreten` SPIEL/stamm/netz-portal.js:604–643 (saveState :615, `_weltWechsel` :617); Heimtor 6 m hinter dem Ankommenden :648–670.
- Der Tausch am Ort: SPIEL/stamm/speicher-laden.js:1232–1263 (Schirm auf :1240–1245, Bruch → `location.reload()` :1257), `_weltAmOrt` :1268–1288 (alle Glieder wie beim Boot),
  `_weltAbschied` :1300–1383 — jedes Instanzfeld außerhalb `WELT_GRENZE` fällt (:1380), also auch `_portalMembranes`: jede Ankunft baut die Tor-Register frisch.
- Der Tor-Takt: SPIEL/stamm/siedlung-tor.js:604–611 legt jedes Tor mit `armed: true, lastLz: null` an; :706 Re-Arm beim Verlassen; :721–731 `enterPortal` beim Vorzeichenwechsel
  von lz in der Apertur. Das Gesetz „ein Tor nimmt nur, wer seine Zone von außen betritt" steht NUR in der Probe (PM/stationen/g5.js:941–942), nicht im Spiel.
- Der Ladeschirm: SPIEL/index.html:281 (Stil), :8288–8293 (DOM); weicht nur über `_weltbildSteht` → `_ladeschirmWeg` (SPIEL/stamm/dirigent-ankunft.js:882–892, :1356–1364).
- Das Studio-Tor ist ein Vollbild-iframe mit eigener Seite und eigenem Renderer (`_buildPortalOverlay` SPIEL/stamm/netz-portal.js:135–300); die Station misst diese Zeile nicht (g5.js:5069–5070).
- FAIL-SOFT im Tor: SPIEL/stamm/netz-portal.js:677–688 — eine ungültige Welt-Adresse „fällt auf den Sub-Welt-Pfad zurück" und öffnet trotzdem ein Fenster; :10–11 ein ungültiges
  `world` wird still zur Skelett-Welt.
**Teilen (tore.K5 1/2, v1-Schritt 5).** Die Mechanik steht und ist im Spielpfad: `teileWerk`/`teileWelt`/`empfangeWerk` SPIEL/stamm/netz-identitaet.js:641–761 (fail-closed, jede
Wand beim Namen), Knopf SPIEL/stamm/werkstatt-vorschau.js:2367 und werkstatt-sozial.js:14–16, Empfang im Chat SPIEL/stamm/feld-leben.js:1167–1170. #1 headless gehalten:
153 ms, Bau-Hash A = B 9c183437 (stand.json:4283–4297); #2 „kein Werkzeug" (PM/stationen/g5.js:5816). Die Spielgang-Station kennt keinen Schritt teilen: sie endet bei
„benutzen" (PM/stationen/g5.js:430, :495) — spielgang.K1 1/2, 5/5 nur headless am Null-Renderer (stand.json:3567–3581).
**HUD/Menü (spielgang.K3 1/2).** GTX gehalten: HUD deckt 2,84 % bei 1920×1080, INP HUD 96 ms, Menü 80 ms (stand.json:3583–3607); Radeon ungemessen; Staffel 2 (Text ≥ 16 px,
Tastenbelegung) ohne Station.
**Kampf Q12.** Der Pfeil fliegt `_pfeilBahn` als Funktion der Flugzeit (SPIEL/stamm/kampf.js:1236–1244), der Schuss liest die Wanduhr (`performance.now()` :1145), der Flug die
Anzeige-Uhr (dirigent-takt.js:214). Die Probe stellt die Wand und schießt im selben Takt (SPIEL/scripts/lib/kampf-proben.cjs:2717–2736), das Zielen liest
`_raycastWorldHit` (koerper-bewegung.js:1724–1736). FUND-REGISTER.md:229: an der GTX 1050 ROT „treffer-ort", Pfeil trifft den Boden 4–11 m vor der Wand, in der CI grün.
**Das lebendige Feld.** feld.K1–K4 je 2, K5 1; affekt.K1 2, K2 1, K3 1, K4 0, K5 2 — ALLES headless (stand.json:4–131, 590–709). affekt.K4#1 (Stimme des Felds) fiel am 10.11.:
55 Zeilen, 6 falsch, alle sechs genau um eins daneben — die Stimme sagt „dazu 5 weitere Taten", die Linse erwartet 4 (PM/messung/roh/6aa7a5a6-headless/affekt.K4_1.out:195);
der Zähler im Spiel SPIEL/stamm/feld-sprache.js:1305–1327 (`S.weitere++` je wartender Tat im Blick).

## Die EINE begrenzende Entscheidung
Das Tor jagt KEINE eigene Zeit: seine 2,9–9,7 s sind der Ladeschirm des kalten Weltbilds (Pflicht B, Kosten-Zeile). Das Tor schneidet nur, was NUR das Tor bricht — der
Durchgang ist genau EIN Welt-Wechsel und zeigt kein Schwarzbild. Kein Vorwärmen, kein Umbau des Studio-iframes, kein Welt-Gedächtnis je besuchter Welt in dieser Welle.

## Der Schnitt (die Klasse ganz)
**Klasse 1 — „eine Grenze feuert nur von außen".** Chokepoint SPIEL/stamm/siedlung-tor.js:610: ein frisch angelegtes Tor ist unbewaffnet (`armed: null`), beim ersten Bild-Takt
`armed = !inApertur` (vor :706), und :722 feuert nur bei `armed === true`. Weil `_weltAbschied` das Register fallen lässt (speicher-laden.js:1380), trägt EIN Schnitt jede Stufe:
Welt-Tor (geboren und Rückkehr), Heimtor (netz-portal.js:648–670), Beitritt per Code/Einladung (`_weltBeitritt` → `_weltBetreten`), Rückkehr aus dem Studio-Tor (dort hält der
Linger schon `armed = false`, siedlung-tor.js:674–683, netz-portal.js:768–771).
**Klasse 2 — „kein Schwarzbild an einem Welt-Wechsel".** Chokepoint SPIEL/stamm/speicher-laden.js:1240–1245: der Schirm hält das zuletzt gezeichnete Bild der alten Welt
(eine Kopie der Leinwand im Takt des Kreuzens) statt der Tafel Luma 0,043; er weicht wie heute an `_weltbildSteht`. Stufen = jeder Rufer von `_weltWechsel`:
speicher-laden.js:1184, :2215 · speicher-welten.js:567, :596 · netz-portal.js:617.
**Leser-Liste (vor dem Schnitt):** `rec.armed` — siedlung-tor.js:610, :682, :706, :722, :730, netz-portal.js:771. Der Schirm — dirigent-ankunft.js:510, :1356–1371 ·
dirigent-takt.js:1350, :1403, :1481, :1767 · koerper-bewegung.js:2419 · index.html:281, :8288 · die Probe liest das gehaltene Bild schon (PM/stationen/g5.js:877–888, `schirmL`).
**Kosten-Zeile:** Klasse 1: 0 Draw-Calls, 0 Bytes, ein Vergleich je wachem Tor je Bild; je zurückwerfendem Third-Durchgang zwei Tausche weniger (je 0,9–1,2 s Ankunft plus
Schirm). Klasse 2: eine Leinwand-Kopie je Welt-Wechsel, lebt nur unter dem Schirm, an den Schirm gebunden, nie an die Weltgröße.
**Kriterien:** tore.K1 (#1 radeon + gtx, Station PM/stationen/g5.js:5072, Messung g5.js:841–1079): Ist 13.11. Third 3 Wechsel, Luma min 0,002–0,043, t 2907–9747 ms, Frame max
199–1111 ms ↔ Soll 1 Wechsel, Luma 0,05–0,95, t ≤ 2000, Frame ≤ 100. Erwartet nach dem Schnitt: Wechsel und Luma im Soll, t und Frame bleiben ROT → **0 Punkte** — dieser Schnitt
ist Erlebnis, keine Buchung. Bildpaar: Third-Durchgang durch ein Welt-Tor am Genesis-Ring des Prüfplatzes, Bild beim Kreuzen und 1 s danach, vorher/nachher an derselben Pose.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `origin/w16-tor-durchgang` **d4aef5b5** (06.11.) trägt GENAU beide Klassen, gemessen an der Radeon: Rückwurf b40aa15c (main 8efb6318 „bis drei Welt-Wechsel" → „ein Wechsel",
  t Median 9,2 → 6,1 s) und `_ladeschirmHalt` (Luma min 0,043 → 0,382, kein schwarzes Bild, t Median 6,1 → 4,0 s) — Rumpf der Commits. Vorprüfung GRÜN (KO/zug/vorpruefung.txt:74),
  fiel aus z267 am Konflikt `stamm/gelaende-chunks.js:3214` (:77), danach geparkt (:80). 1600 Commits hinter main; der Tor-Takt zog seitdem von siedlung-ort.js:754 nach
  siedlung-tor.js um. Fehlt: Neu-Schnitt beider Klassen auf ec281422 aus dem Commit-Rumpf (nicht mergen), Bildpaar, Zug.
- Derselbe Zweig trägt ein Fern-Gedächtnis je Welt (`_fernGedaechtnis` am Wirt, t Median 4,0 → 2,3 s) — NICHT nehmen: VRAM wächst mit der Zahl besuchter Welten (Kurs: Kosten nie an
  die Weltgröße), und es ist B.
- `origin/w16-tor-durchgang-pm` 8a006201: die Station liest das gehaltene Bild — im PM-Code vorhanden (g5.js:880–888).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Warum der Rückwurf nur auf dem Weg in die geborene Welt fällt (Läufe 2/4 = Third UND Richtung A→B; die Probe trennt Sicht und Richtung nicht) — nicht gelesen; der Rumpf
  b40aa15c nennt die Ursache „der Wechsel setzt ihn mitten in das Tor, das zurückführt".
- tore.K1 t ≤ 2 s und Frame ≤ 100 ms hängen an B (kaltes Weltbild, Programme je Rückkehr) — anderer Bereich. Studio-Tor (iframe, eigener Renderer) ungemessen, gehört den Studios.
- Teilen: v1-Schritt 5 hat in der Spielgang-Spur keinen Schritt; tore.K5#2 (beide Flüsse, zwei Geräte) ohne Werkzeug — kein neuer Apparat in dieser Welle.
- affekt.K4: ob Spiel (feld-sprache.js:1309) oder Linse um eins falsch zählt, nicht entschieden; Täter des 10.11. unbenannt (kurs-B Zeile 56).
- Q12: Verdacht, dass die Wand im selben Takt noch nicht im Strahl `_raycastWorldHit` steht (Zielen auf den Boden) — nicht gemessen; nur an der GTX 1050.
- das-lebendige-feld.md:264 sagt „der Spieler schreibt Leben nicht als Pflege" — affekt.K1 misst „pflegen 0.25 9 dB" (stand.json:6): Doc oder Messung veraltet, nicht geprüft.
- Kein Bild von Tor, HUD, Teilen, Bogen gesehen; HUD 2,84 % nur als Zahl.

## Rang
- Tor: Rückwurf + kein Schwarzbild — Wirkung **4** (jeder Torgang: kein Hin-und-her, 3–9 s Bild statt Schwarz) · Aufwand **S** (Neu-Schnitt aus gemessenem Rumpf) · Risiko: ein
  Spieler, der IN einer Apertur ankommt, muss erst heraustreten, bevor das Tor wieder nimmt.
- affekt.K4 Zähler um eins — Wirkung **2** (+1 Punkt headless, Fakten-Treue der Stimme) · Aufwand **S** · Risiko: den Zähler der Linse anzupassen statt des Spiels wäre ein bewegtes Soll.
- Fail-soft Adress-Portal laut abweisen — Wirkung **1** · Aufwand **S** · Risiko: ein Bauplan mit kaputter Adresse zeigt künftig kein Fenster mehr, sondern eine Absage beim Namen.
