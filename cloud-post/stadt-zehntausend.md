# Stand-Blatt stadt-zehntausend (Cloud-Sitzung, Macher-Bahn der Welle vom 27.11.)

## 27.11. Start
- Brief gelesen (rohe Adresse, oberster Abschnitt „START-BRIEF“ 17:35), Regel-Blatt welle-2611 und das Blatt an alle gelesen.
- Zweig `stadt-zehntausend` auf origin/main 42a1427 (V18.546.455, trägt w28-buendel-a fdc417f mit stadt-am-schirm-2).
- Station gelesen (mensch.stadt im Zweig punkte-maschine): ein Haus „steht“, wenn ein Eintrag in `st.architectures` mit `seed === slot.seed`
  binnen 1 m an (ox + sl.x, oz + sl.z) liegt; Schritt 2 der Leiter mensch.stadt.form liest `W.steht` gegen 1e4.
- Sprosse: karte2.mensch.stadt.form#2 (Lücke), dazu mensch.stadt.groesse#3/#4.
- Als nächstes: Täter-Zahl je Phase (Plan · Geburt je Haus · Fäden · Gelände) headless an `dorf 7 9310`.

ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718.

## 27.11. erste Befunde (headless, Null-Welt, Loop von Hand)
- „dorf 7 9310“ ist eine Stadt aus Kacheln (`_dorfAkt`: nH > STADT_FUNKTION.voll 500 → der Kern trägt `viertelWort(…,0,0).nH`,
  6 Ringe von Kacheln à cellM 256 m, jede Kachel ein EIGENER Eintrag in `_bewohnerSiedlungen`). Der Kern steht nach 7,2–9,8 s mit 127
  Häusern; die übrigen Kacheln erwachen nur am Schirm (`_ortAmSchirm`, STADT_FERNE.nahM 300 m), fern tragen sie nur MASSEN im Pool
  (`_stadtFerneTakt`, Stufe 1 `kachelMassen` an eigenen Losen, Stufe 2 `planMassen` an den echten Losen) — keine Einträge in
  `st.architectures`, darum zählt die Station sie nicht.
- Zwei Lücken neben dem Bau: (a) die Station misst je EINEN Eintrag (`O` = größte Siedlung nahe dem Spieler) — eine Kachel-Stadt ist für
  sie höchstens eine Kachel; (b) der Messort stadt-voll gründet „dorf 7 300“ (EIN Plan, 307 Häuser) und „dorf 7 9310“ trägt 9 639 < 10⁴.
  Beides gehört in den Stations-Kandidaten (die Stadt = ihre Kacheln) und einen Messort der Großstadt — nie ein weicheres Soll.
- Weiter: Täter-Zahl je Phase einer Kachel (Export · Ort-Wahl · Grund · Zug je Haus).

ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718.

## 27.11. Täter-Zahl je Phase (headless, Null-Welt, Loop von Hand, „dorf 7 9310“ am Anker von stadt-voll, Spieler 260 m vor dem Kern)
- Zeitlinie: Kern 121–127 Häuser nach 8–17 s; erste Nachbar-Kachel wartet 35 s auf ihren Export; danach je Kachel 5–8 s;
  nach 82–106 s stehen 863–888 Häuser in 9 Kacheln — danach nichts mehr (nur Kacheln binnen `STADT_FERNE.nahM` 300 m + Vorlauf erwachen).
- Geburt je Haus (`_spawnSettlementSlot`, 737 Häuser): 4,6–6,7 ms Haupt-Faden; davon die Wasser-Wand `_fundamentLand` ≈ 2,7 ms
  (Raster 0,5 m ≈ 600 `_landAt` je Haus, ZWEIMAL: Slot und Wurzel `spawnArchitecture` → `_werkImWasser`), `spawnArchitecture`
  ≈ 1,0 ms je Bau (Haus + Wandlaternen + Stücke ≈ 3 Bauten je Haus), `_bauFrei` 0,02 ms.
- Plan je Kachel: Export 0,2–3,1 s (Foundry-Faden; 66 Exporte in 80 s, davon die meisten gemeldete Nachbarn), Ort-Wahl 0,3–0,7 s
  (Ort-Faden; die erste 55,7 s). 10⁴ in 60 s verlangt ≈ 1 Kachel/s Plan-Durchsatz und ≤ 0,7 ms Haupt-Faden je Haus.
- Fern geboren über die Wurzel kostete jedes Haus einen eigenen slot-plan-Auftrag (`_hausGrundSetzen`, stamm/gelaende-kollision.js:319),
  solange der Grund seines Orts nicht liegt — der Grund ist darum Teil des Erwachens am Schirm.

ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718.

## 27.11. 17:05 UTC — Brief 17:58 gelesen
- Zweig auf main 948f68ee gehoben (Rebase, die alten WIP-Köpfe per Merge eingeholt, nie Zwang).
- Nächster Schritt: C-K5 als zweite Messstelle — zehn Läufe des Schritts „Der Settlement-Kanal N5.7“ lokal, Takte bis zum ersten Haus vorher; der Absturz `reading 'vorrat'` nach dem ROT wird geheilt (die Probe nennt den fehlenden Zug).

## 27.11. 17:22 UTC — Befund vor dem Schnitt (gemessen)
- Das Wort `dorf 7 9310` sind 145 Kacheln (Σ nH 9 310, im Plan 9 639), `dorf 7 10000` 161 Kacheln (Σ nH 10 000) — nicht 51 (fachwerk `viertelWort`, Node).
- Der Export rechnet je Haus einen Mass-Bau: Node, `exportSettlement` nH 120: 49 ms je Haus unter Last (GC 32 %, three-Geometrie 25 %); nH 60 0,9–1,7 s, nH 190 3,5–5,0 s. 161 Kacheln seriell im EINEN Foundry-Faden: über 60 s auf diesem Rechner.
- Die Station zählt EINEN Eintrag (`O` = die Siedlung mit den meisten stehenden Häusern binnen 600 m); in der Kachel-Stadt ist jeder Eintrag eine Kachel (≈ 64–200 Häuser). 10⁴ in EINEM Eintrag gibt das Kachel-Netz nicht her — das steht offen beim Namen, die Station ändere ich nicht.
- Schnitt (in Arbeit): jede Kachel mit Plan trägt ihre Häuser als Hülle an den echten Losen (Stufe 2 auch für gemeldete Kacheln, `_ortMelden` als EINE Meldung für Nachbar und Ferne, EIN Plan der Ferne im Flug im EINEN Rang am Ort der Kachel). Linse `--stadt` (stadt-proben `stadtStand`): die Kachel mit Plan, an deren Losen nichts steht.
- C-K5: das Urteil nennt den fehlenden Lauf samt Zug (`k5Luecke`, Selbsttest 11q) statt am `.vorrat` abzustürzen. Grundlinie an main läuft.

## 27.11. 17:47 UTC — gemessen nach dem Schnitt (headless, Null-Welt, `dorf 7 9310`, 60 s, Linse `diag-settlement --stadt`, ≤ 70 s)
- Stehende Häuser nach 60 s (Bau ODER Hülle ihres Plans an ihrem Los): main 948f68ee **156** → Zweig **1 664** (Kacheln mit Plan 22 von 145,
  alle 22 stehen ganz; main: 20 der 22 leer). Heap 324 → 312 MB. 10⁴ nicht erreicht: 1 664 von 9 310 (17,9 %).
- Der Rest beim Namen: der Plan je Kachel ist der Export (Mass-Bau je Haus, 2–6 s je Kachel im EINEN Werk-Faden dieses Rechners,
  4 Kerne); nach 60 s warten 139 Leiber der erwachten Kacheln vor dem Plan der Ferne (FIFO der Alten). 145 Kacheln brauchen hier > 300 s Export.
- Täter im eigenen Schnitt geheilt: Nachbar und Ferne bestellten dieselbe Kachel zweimal (627/419, nH 166) — `_ortMelden` trägt EINEN Export je Ort im Flug.
- C-K5 Grundlinie main (gate:settlement ohne Selbsttest, 10 min 50 s): GRÜN, das erste Haus im Takt 2 (vorlauf12, vorlauf300). Das Rennen
  (4299–4363 Takte) zeigte sich hier nicht. Läufe am Zweig folgen.
- Linse: RED an main (156 von 9 310, 20 Kacheln leer), am Zweig ROT nur noch am Umfang. Selbsttest grün (Mutanten: leere Kachel, kein Plan der Ferne, halbe Stadt, main).

ZWISCHENSTAND. Karte 2 gebucht 153 von 1 718.

## 27.11. 20:45 UTC — Brief 20:33 gelesen; die Zahl am Baum auf main b3740dd5 (headless, Null-Welt, `dorf 7 9310` am Messort stadt-voll, 60 s)
- Stehend nach 60 s (Bau ODER Hülle seines Plans an seinem Los): main b3740dd5 **211** (16 Kacheln mit Plan leer) → Zweig **1 664**
  (22 von 145 Kacheln mit Plan, alle stehen ganz; ab 28,8 s). Heap 293 → 295 MB. 10⁴ nicht erreicht: 17,9 %.
- Zwischen 1 664 und 10⁴, je ms: **Export** (der Plan je Kachel, Mass-Bau je Haus im Werk-Faden) 70,7 ms je Haus vom Auftrag bis zur
  Antwort, p50 3,4 s · p90 11,1 s je Kachel (30 Exporte in 60 s) — 9 310 Häuser brauchen ≈ 460–660 s Faden-Zeit, dieser Rechner hat
  EINEN Werk-Faden (4 Kerne); **Guss** der Hülle (Haupt-Faden) 0,024 ms je Haus (planMassen 0,005 ms) — 10⁴ ≈ 0,24 s, keine Grenze;
  **Stempel** (der volle Bau am Schirm) p50 2,5 ms · p90 4,2 ms je Haus, nur die erwachten Kacheln.
- Warum flach ab 28,8 s: der Plan der Ferne (Kachel nH 106 bei 883/−93) steht 40 s in der Schlange hinter 100 Leib-Aufträgen der zwei
  erwachten Kacheln (12 im Flug) — das Rang-Gesetz (nah zuerst, der Älteste jedes zweite Mal) hält ihn dort; die Grenze ist der Durchsatz
  des Werk-Fadens, nicht der Speicher.
- Stoff-Wand am eigenen Schnitt geheilt (`_ortMelden`: der Fang bricht laut wie der des Nachbarn, kein stilles `false`).
- C-K5: am Zweig 0 von 3 Läufen rot (erstes Haus Takt 2), main 0 von 1 — das Rennen zeigt sich hier nicht. Die Meldung „DER ZUG“
  nennt jetzt, worauf der Export im Flug wartet (`flug`: bestellte Hydro-Kacheln ohne Kachel, Schlange und Arbeit der Foundry) — der
  nächste rote Lauf in der CI nennt den Täter beim Namen; der Export der Zelle wartet auf JEDE bestellte Hydro-Kachel der Welt
  (`Promise.all` über `_hydroBestellt`), das ist mein Verdacht, nicht gemessen.

ZWISCHENSTAND. Karte 2 gebucht 155 von 1 718.

## 27.11. 22:20 UTC — die Batterie am Vorprüf-Baum (main b3740dd5 + Schnitt), seriell, lokal (4 Kerne, swiftshader unter xvfb)
- GRÜN: format · lint · `stamm-umzug --nach-karte` · check:statik · gate:welt-boot · gate:fachwerk-contract · diag-stand-takt
  (Selbsttest, Lauf, --narbe) · diag-kreatur-takt --selftest Teil 1/3 978 s · 2/3 1 035 s · 3/3 731 s · gate:studio-begehen ·
  gate:webgl-probe · `git merge-tree` gegen main, sprache-dialekt, werk-am-ort-2 und kopf3 (mit dem Register-Treiber) ohne Konflikt.
- ROT und an main b3740dd5 / 9a75d61c hier gleich ROT (geerbt, kein Diff von mir): gate:pruefbuehne-licht („S0 Himmel … das
  1.08-Fache“, wörtlich gleich), gate:tag-achse:echt („BLIND genesis … DIE WELT STEHT NICHT nach 3601 Takten“, gleich),
  gate:weltbild-frost:echt (das erste Weltbild nach 83,6 s main ↔ 81,4 s Zweig, „DER BAU STEHT NICHT“). Der Richter ist die GPU-Probe.
- C-K5 am Vorprüf-Baum: 0 von 4 Läufen rot (das erste Haus im Takt 2; main 0 von 1) — ob der Schnitt das Rennen schließt, kann ich
  nicht sagen: es zeigt sich hier nicht; die Meldung DER ZUG nennt beim nächsten Rot den Export im Flug.
- Probe-Tag gegen `.github/workflows/gpu-probe.yml` (EINLASS_JS) geprüft — das Probe-Werkzeug des Zugs liegt nicht im Baum; der Einlass
  nimmt den Betreff an (vier Tore, dazu gate:webgl-probe).

ZWISCHENSTAND. Karte 2 gebucht 156 von 1 718.

## 27.11. 23:02 UTC — Wartezimmer: Vorprüf-Kopf a7282983 (auf main b3740dd5)
- GPU-Probe omen-gtx1060 GRÜN in 1 946 s: pruefbuehne-licht 65 s · weltbild-frost:echt 181 s · studio-begehen 264 s · tag-achse:echt
  132 s · webgl-probe 62 s — das lokale Rot der drei Tore war swiftshader dieses Containers (an main gleich), nicht der Schnitt.
- `git merge-tree` gegen den neuen main 23b593ac und gegen z811/z812 (frist-puls-1, kunst-am-leib-4, sprache-dialekt-2b,
  wurf-mit-luft-3): ohne Konflikt. Der Kopf fasst weder check.yml noch die Zeit-Tafel an.
- Offen beim Namen: 10⁴ (1 664 von 9 310 nach 60 s), der Export je Kachel im Werk-Faden; die Station zählt EINE Kachel.

ZWISCHENSTAND. Karte 2 gebucht 156 von 1 718.

## 28.11. 00:03 UTC — Stand im Wartezimmer (es endet 01:27 UTC, kein GELANDET für a7282983)
- Vorprüf-Kopf a7282983 auf b3740dd5; GPU-Probe GRÜN (23:59 hiesige Zeit); mischt ohne Konflikt mit main b56b51f0 (z812). WIP darüber 81631036
  (nur dieses Blatt). Kein neuer Kopf von mir — er wird erst auf Zuruf auf b56b51f0 gehoben.
- Brief 00:57 (Fächer R11) gelesen, zugeteilt: mensch.stadt.groesse#1 · breite#1 · messlatte#1. Gelesen am Zweig punkte-maschine:
  groesse#1 hat ein Fach (vision/pruefer/faecher.cjs, Ort dorf, 16 Richtungen × Tageszeit); breite#1 und messlatte#1 haben KEIN Fach
  (11 Fächer im Ganzen). Alle drei tragen schon ihre Zeile der Klasse P (auge-klasse); die Station mensch.stadt liest bei keinem der
  drei ein Prüfer-Urteil (kein afc/Treffer in der Station); die Richter-Tafel nennt alle drei „fehlt“.
- Offen beim Namen, für die nächste Sitzung dieser Bahn: (1) groesse#1: die Station liest das Urteil des Prüfers (Vorlage kunst#1,
  pm 403ad6b3); (2) breite#1: das Fach „Region einer Stadt aus 6“ (Posen aus dem Gesetz: je Region die Stadt des Worts) samt
  Station; (3) messlatte#1: das Fach „Blindpaar“ samt Korpus realer Fotos mit Quelle und freier Lizenz. Als Nächstes im Wartezimmer: groesse#1 —
  der Stations-Kandidat, der das Urteil des Prüfers liest.

ZWISCHENSTAND. Karte 2 gebucht 156 von 1 718.

## 28.11. 00:35 UTC — Sicherung (Zuruf: sichern, nichts Neues)
- Geschnitten (Stand des Zweigs): der Export der Großstadt am EINEN Werk-Faden — stehende Häuser nach 60 s 211 → 1 664 (dorf 7 9310 am
  Messort stadt-voll), Vorprüf-Kopf a7282983 auf b3740dd5, GPU-Probe GRÜN; WIP darüber nur Blatt und Stations-Ordner.
- Neu im Wartezimmer: der Stations-Kandidat der drei Prüfer-Sprossen im Ordner `cloud-post/stadt-zehntausend-station/` (Diff +
  Begründung). breite#1: Fach gebaut (Klasse = Region des Plans, Wahl über alle sechs), Selbsttest 16 GRÜN · 0 ROT, Mutant ROT;
  Korpus 14 Sätze Commons, gesichtet: Mitteleuropa 38 · Alpen 49 · Mittelmeer 70 · Norden 28 · Fernost 33 · Antike 46.
- Letzte Zahl: das Fach am Messort stadt-voll — 156 Häuser mit Tür in 2 Orten, im Wechsel 37 Posen (Mitteleuropa 15 · Mittelmeer 22),
  Regionen 2 von 6.
- Rote Zeilen wörtlich: „Umfang nicht erzeugbar: 37 von 40“ (breite#1 am Messort) · „S2 ROT: Umfang nicht erzeugbar … 307 stehende
  Häuser in 7 Vierteln; dorf 7 9310 steht erst nach ~154 s, über dem Deckel von 60 s“ (form#2 am main, offen: 1 664 von 9 310 nach 60 s)
  · messlatte#1: „Korpus fehlt“ (Schirmbilder kommerzieller Titel bleiben draußen, Entscheid 26.11.).
- Nächster Schritt: breite#1 — der Fächer reist an Orte der vier fehlenden Klimabänder (Alpen, Norden, Fernost, Antike); dann der Lauf
  am Gerät. groesse#1: nur der Fächer-Lauf am Gerät. form#2: der Export je Kachel (70,7 ms je Haus) aus dem EINEN Werk-Faden.

ZWISCHENSTAND. Karte 2 gebucht 156 von 1 718.
