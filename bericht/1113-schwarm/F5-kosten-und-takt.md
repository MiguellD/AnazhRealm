# F5 kosten-und-takt

Aus 33–40; SPIEL = main ec281422. Datei:Zeile ist selbst gelesen, sonst „laut Blatt NN". Gesehen `BILD/wiese-mitte/heute-wiese-fov20-rot.png`:
unter dem Kronendach in der Mitte dünne Stämme ohne Krone und dunkle Nadelspitzen vor grauem Grund, kein geschlossenes Dach.

## Die Schnitte, gereiht

### 1 · Der Takt hat EINE Frist ab seinem Kopf (Blatt 35) — Aufwand M
- Mangel im Takt: im Gehen Takt p95 39–80 ms Radeon, 36–54 ms GTX (laut Blatt 35, PM `roh/1cd1c408-radeon/profiband.K2_2.out:264`,
  `roh/ec281422-radeon/profiband.K4_1.json`). Für den Spieler ruckt es mit 12–20 Bildern/s.
- Wurzel (gelesen): `stamm/dirigent-takt.js:1855` stellt die Frist `jetzt + BAU_FRIST_MS` beim ERSTEN Bauer, der fragt, nicht am Kopf
  des Takts. `BAU_FRIST_MS = 6` (:2455) liegt schon allein über dem Takt-Soll von 5,8. Die zweite Uhr ist `_deferrableBudgetMs` (:1736–1746)
  aus `PERF_TARGET_MS = 17` (`dirigent-regler.js:2010`). `_dispatchFrameJobs` nimmt das Minimum (:1723), und jeder Bauer bekommt
  „mindestens ein Stück" (:1720–1721). Eine dritte Uhr steht in `vegetation-wiese.js:528`: `deadline || now + BAU_FRIST_MS`.
  Ein Symbol `_taktKopf` gibt es im Stamm nicht (Grep: 0 Treffer).
- Entscheidung: Die Frist endet bei Takt-Kopf + Takt-Soll (5,8 stehend, 8 bewegt) − Render-EWMA. Nach Ablauf bekommt nur noch der EINE
  Vortritt-Bauer sein Pflicht-Stück.
- Schnitt (eine Welle): Kopf stempeln in `loop` (:6). `_bauFrist` liest den Kopf, `BAU_FRIST_MS` stirbt. `_makeFrameBudget` und
  `_deferrableBudgetMs` sterben als zweite Uhr, `_frameOverBudget` (:2143) heißt dann „Frist abgelaufen". Die Wiese verliert ihre eigene
  Uhr, ebenso Wasser-Kappe (:1924) und `SCATTER_SLICE_MS` (:1987). Die ungedeckelten Ticks (:2119–2140) fragen die Frist mit Namen.
  `_ladeFrist`/`LADE_TAKT_MS` bleiben byte-gleich (:1798–1813), B bleibt unberührt.
- Leser: die 17 Frist-Leser aus Blatt 35 (`bild-kosten.js:876`, `gelaende-chunks.js:2780`, `gelaende-fern.js:25/1979`,
  `siedlung-satz.js:137/1090`, `siedlung-bauten.js:195`, `stoff-karte.js:891/1207`, `studio-gestalt.js:106`, `vegetation-baum.js:2405/2924`,
  `vegetation-streu.js:1165`, `vegetation-wiese.js:528`), `_weltOffenAkte` :682, `_weltSteht` :685, gate:takt T12/T13
  (`scripts/diag-takt.cjs:304–332`), `scripts/playtest/siedlung.cjs:116–152`.
- Kosten-Zeile: Takt im Gang → ≤ 8 + Render. Die Welt füllt im Gang über mehr Takte. Lade-Takt und Programm-Zeile bleiben gleich.
- Kriterien: profiband.K2#1 Belegung steht Radeon 32,3/32,0 ↔ ≤ 5,8 · K2#2 bewegt 55,2/83,0/55,7 ↔ ≤ 8 · K1#1 58,3 ↔ ≤ 33 ·
  K4 Glätte max 100,1 ↔ < 100 (PM `g6.js:3266/3282`). Alle heute UNGEMESSEN.
- Liegt: nichts. Vorher-Zahl: EIN `werkbank haenger` Wiese Ego geht, GTX. Abgabe: Bildpaar am Dorf im Gang.
### 2 · Der Feld-Akt wirkt nie vor einem früheren Takt (Blatt 39) — Aufwand S, zuerst Spike
- Mangel im Takt: gate:mp-sync (f) „leben VERSCHIEDEN" an vier Zweigen mit main-Code (FUND-REGISTER:231). Jede Abgabe jeder Kette
  hängt an dieser Wand.
- Wurzel (gelesen): `stamm/feld-leben.js:2138` wirkt sofort bei `akt.w <= _feldHorizont()`, ohne zu fragen, ob die Takte bis w
  gerechnet sind. `_feldAktWirkt` setzt `st.spielZeit = akt.w` (:2321), und `_depositLife` stempelt die Zelle auf diese Uhr
  (:2079, :2094). Ein später gewirkter früher Akt setzt den Stempel also zurück. Die Folge selbst reiht korrekt: `kreatur-leben.js:2691`.
  `tickFaunaLifecycle` rechnet nichts ohne `_kreaturenBereit()` (:2645).
- Entscheidung: EIN Schreiber, die Folge `_feldTakt`. Schnitt: sofort nur bei Bereitschaft UND ohne ausstehenden Takt T ≤ w der nahen
  Regionen, sonst `feldAkte`; w < `feldLetzt` → `_bruchMelden` + Reihe; Linse in diag-mp-sync (f), Selbsttest mit gestautem B.
- Leser: `_feldAktFremd` :2148, `_lebenAusStand` :2274, `_lebenGabe` :2347, `_brandEntfachen` :2570 mit seinen Lesern
  (`koerper-fahrt.js:2256`, `diag-stand-takt.cjs:954/988/1093/1115/2159`), `moment` in `diag-mp-sync.cjs:834–842`.
- Kosten-Zeile: je Akt ein Minimum über ≤ 4 Regionen. Kein Zeichen-Aufwand, keine Programm-Zeile.
- Kriterium: feld.K2#2 gehalten „1189/1189, Reload 1223/1223" ↔ GRÜN in jedem Lauf. An derselben Wand hängen feld.K2#1 und
  ultiversum.K4#1 (PM `stand.json:621–638, 4375`).
- Liegt: `w28-mp-boden` steht jetzt auf **77c31f1a** (Merge main 21:30; Blatt 39 nennt f97fe692). Er trägt `gelaende-boden.js` +15,
  `kreatur-leben.js` +10/−3 und Linse +75. Er erklärt nur den Stadt-Zweig (OMEN: 0 von 64 Zell-Mitten an main). Für den Eingang liegt nichts.
- Zuerst gefahren wird an der OMEN: 3 Läufe parallel auf 2 Kernen, main ↔ Schnitt. Kippt main nicht, bleibt der Schnitt liegen.

### 3 · Der Waldrand ist EIN Maß (Blatt 37) — Aufwand S
- Mangel im Bild: das Bild oben zeigt den grauen Grund mit kronenlosen Stämmen. Im Takt reißt der Sprint 4 771 von 5 412 Bildern,
  die Zeugen liegen bei 211–218 m (laut Blatt 37, PM 6aa7a5a6, UNGEMESSEN wegen Fremd-Last).
- Wurzel (gelesen): Es gibt drei Ränder. Die Saat liegt bei `_bedarfAbstand(Mitte) ≤ _laubRand()` (`gelaende-chunks.js:1046`). Der Eintritt
  liegt bei `max(R, _laubRand() − saum)`, INNEN (`studio-bruecke.js:3427`, saum = 32·u :3423). Das Dach beginnt erst ab `waldR`, mit
  Saum nach AUSSEN (`gelaende-fern.js:1764`). Dazwischen trägt ein gesäter Baum weder Karte noch Dach. An der GPU ist der Laub-Rand auf
  (Ring+1)·43,2 gekappt (`dirigent-regler.js:338–343`), headless liegt er am Schirm-Rand (:327–328).
- Entscheidung: Eintritt und Saat lesen denselben Abstand (Chunk-Mitte entlang der Bahn). Der Saum liegt außen, nie innen.
- Schnitt: Eintritt gegen `_laubRand() + saum` (Mesh-Klausel bleibt), Saat bis `fr + KARTEN_HORIZONT_SAUM_M`, Dach-Saum 32 statt 30 als
  EINE Zahl.
- Leser: `vegetation-baum.js:2814/2829/2835`, `_tickFoliageGrowth` (`gelaende-chunks.js:1060ff`), `_fernKroneOhneWald`
  (`gelaende-fern.js:1755`), PM `g6.js:2337`, gate:pop/lod.K2#1.
- Kosten-Zeile: mehr Karten im Band 240–272 m (≈ +27 % Laub-Kreis, nur im Kegel). Vor der Abgabe zählen: Dreiecke ↔ 680k und
  Frame p95 GTX ≤ 16,8 ms.
- Kriterien: streaming.K1#1 Sprint 4 771/5 412 ↔ 0 · streaming.K2#1 karte 49,8 % · baum 58,4 % ↔ ≥ 95 % · lod.K2#1 0,0474 %/s ↔ ≤ 0,05
  (darf nicht reißen).
- Liegt: nichts. w22-wald-geburt (4d4ac53b) hat den Eintritt nach innen gelegt.
### 4 · E urteilt nur am eingeschwungenen Band (Blatt 40) — Aufwand M (nur PM + Spec, 0 ms im Spiel)
- Mangel im Takt: Seit 18.10. gibt es keine gültige E-Zahl. 0/8 Punkte profiband + pflicht.E.
- Wurzel (gelesen): PM `stationen/g6.js:1366` ruft `/band` mit `capMs: 8000`, die Werkbank-Vorgabe ist 240 000
  (`scripts/werkbank.cjs:301, 2515`). Bei `eingeschwungen: false` verweigert die Ratsche (:288–289). `PB_GANG_SEK = 90` (:1234).
  `PB_FEST` trägt nur Befehle und Dreiecke (:4259). Die Haushalt-Regel `^nahWiese:Lf$` (`spec/profiband/haushalt.json:504`) trifft
  `nahWiese:Lf:schale` nicht.
- Entscheidung: Die vier E-Zellen laufen zuerst, ohne capMs. Das Stand-Fenster folgt direkt auf das eingeschwungene Band.
- Schnitt: Reihenfolge und Deckel in g6.js. Regeln `kamm-krone` → boden, `f:sitzbank:L[01]` → bau. Die Schale-Regel nur, wenn
  `w28-wiese-fern` nicht vorher landet (dort fällt die Schale). `vorbau:*`/`vorwaermen:*` bekommen keine Regel, bis `__drawZensus`
  gelesen ist. „VRAM MB" kommt nach `PB_FEST`.
- Leser: `g6.js:1364–1373, 1398–1400, 4270–4286`, `punkte.cjs:1013–1022`, `band-urteil.cjs:354–358, 639–658`, gate:profiband, zerlege-linse.
- Kosten-Zeile: im Spiel 0; Messzeit +10–40 s je E-Zelle (geschätzt), getragen von den Bewegungs-Zellen. Kriterien: pflicht.E#1 Genesis 41,9/41,8 ↔ ≤ 33, Wiese nie gemessen · profiband.K3#1 VRAM 139/129 ↔ ≤ 118, gpu-bank 19,9/26,7 ↔ ≤ 12
  (PM `g6.js:3247–3342`).
- Liegt: nichts. Das ABAB-Instrument `n1710-g8` 9b3acc1d steht nicht in main und nicht in der PM.
### 5 · Der Regler liest die gemessene GPU-Zeit (Blatt 36) — Aufwand S
- Mangel: GPU-Last = `renderCalls × 0,011 ms` (`dirigent-regler.js:292, 2024`): bei 78–94 Befehlen ~1 ms, die Radeon misst 37,5 ms.
  Die echte Zeit liegt im selben Objekt (`sense.phase.gpuMs` :138), gelesen nur von der Laub-Ruhe-Wand (:353) — ein Zwilling (G4).
- Entscheidung: Eine Bild-Klasse kostet GPU-ms; der Draw-Call-Proxy fällt. Schnitt: `renderLoadMs = sense.phase.gpuMs`,
  `PERF_RENDER_CALL_MS` stirbt; jede sichtbare Abgabe nennt `werkbank zerlegen --nur <Klassen>` GTX vorher ↔ nachher (main,
  `werkbank.cjs:2649–2763`). Nicht gebaut: gpuMs in Ratschen und `band-urteil.cjs:876–880` (neuer Richter, Kurs §2.5).
- Leser: `dirigent-regler.js:288–310`, HUD :614/:662/:828, `werkstatt-hud.js:1336`, Flugschreiber :1266/:1540,
  `scripts/playtest/dirigent.cjs:222–227, 1334, 1398`, `scripts/diag-render-tap.cjs:114`.
- Kosten-Zeile: −1 Multiplikation je Takt. Unter Last sinkt `effArch` an der Radeon; Dichte und Godrays geben nach.
- Kriterien: profiband.K1#1 58,3 ↔ ≤ 33 · K3 GTX 12,99 / Radeon 37,5 ↔ ≤ 12 GPU. Bildpaar unter `--regler voll` Radeon.

### 6 · Speicher wächst mit dem Schirm, nie mit dem Weg (Blatt 38) — Aufwand M
- Mangel im Takt: Heap +6,8…+49,7 MB/min ↔ ≤ 5. VRAM zurück am Start +15,7 ↔ ≤ 2. Ankerbild p95 58,7 → 83,7 ms (laut Blatt 38, Radeon K5).
- Wurzel (gelesen): `FOUNDRY_CACHE_BYTES` 512 MB und `FOUNDRY_RUHE_BYTES` 64 MB sind feste Säcke (`studio-gestalt.js:1465, 1467, 1024–1030`).
  Der Atlas wächst nur (`stoff-karte.js:306–307`, `at.cap >= soll` oder wachsen). `saveState` ohne worldId schreibt synchron nach
  localStorage (`dienst.js:1514–1516`). `pagehide`/`hidden` sichern nur den Flugschreiber (`dirigent-regler.js:1033–1036`), nicht die Welt.
- Entscheidung: Ohne Senke am Schirm lebt nichts länger als das Fenster seiner Stufe. Schnitt (eine Welle): `heapHalter` wiegt
  Einträge (Mutante `_trittSchwach`), Foundry-Ruhe nach Ring-Fenster über `_foundryCacheEvict`, Atlas-Frei-Liste, `_trittSchwach` an
  `stufen[0]`, `hidden`/`pagehide` → `saveState()`, der localStorage-Zweig wirft laut.
- Leser: Liste Blatt 38 (`_foundryFlattenFor`-Rufer in 7 Dateien, `foundryCacheN` `dirigent-regler.js:1746`, `gangUrteil`
  `draw-zaehler.cjs:560`, Legacy-Key-Leser bleiben).
- Kosten-Zeile: Rebake nach Räumung kostet Bau-Stücke im Takt (→ Schnitt 1) und darf B nicht heben.
- Kriterien: profiband.K5#1/#2 0/2 ↔ 2 (PM `g6.js:3343–3372`) · speicher.K1#1/#2 2/2 halten · speicher.K2#2 halten.

### 7 · Kaskaden k1+k2 als EIN Zweig, die Programm-Zeile in jeder Abgabe (Blätter 34 + 33 Stufe 1) — Aufwand M
- Mangel im Takt: Kalt bis zum Bild 22,1 s GTX 1050, 43 Pipelines, 1,99 MB (laut 33/34, `KO/bericht/1113-bild-wartet.md:8–9`).
- Wurzel (gelesen): Das Addon schreibt je Kaskade einen Zweig in JS-Schleifen (`vendor/CSMShadowNode.js:399, 438, 473–479`), `setup` :491–495.
  Die Instanz hat `cascades: 3, fade = true` (`dirigent-ankunft.js:409, 416`). k1 und k2 tragen dasselbe Filter-Gesetz:
  `filterTexel [0.25,1,1]`, `sucheM [0.25,0,0]` (`bild-schatten.js:1717, 1720`). Die Suche läuft nur bei `sucheM > 0` (:1053).
  Der Host ersetzt Addon-Methoden je Instanz schon heute (`dirigent-ankunft.js:417, 430–431`).
- Entscheidung: Was je Fragment einmal läuft, steht im Text einmal. Schnitt: Host übernimmt `csm.setup`; k1+k2 = eine Tiefen-Reihe,
  ein Zweig, ein Filter, Saum gewürfelt (`_ditherIGN`), k0 bleibt. `diag-boot-stage.cjs:204` nennt kalt nur die Anzahl, künftig Σ KB
  daneben (Länge steht in der Kennung :175) — Berichtszeile, keine Schwelle.
- Leser: `bild-schatten.js:1006–1016, 1041, 1100–1121`, `_kaskadenSaum`, `csm.anazhSicht` :423, Boden-Zuwendung `stoff-material.js:1904–1909`,
  WebGL2-Rückfall (W5), schatten.K1/K2, gate:weltbild-frost:echt, gate:vendor-anker.
- Kosten-Zeile: −~6,6 KB je Pool-Programm × 20 ≈ −0,13 MB, ≈ −70 ms Übersetzung (Schätzung). GPU im Saum −1 Filter.
- Kriterien: ankunft.K1#1 GTX 12,03 ↔ ≤ 10, Radeon 12,95 ↔ ≤ 5 (UNGEMESSEN) · schatten.K1#1/#2, K2#1 halten (max 0,03 % ↔ ≤ 0,5 %).
- Liegt: Werkzeug `mess-welt.cjs` in `w28-samen-lichtweg` d8887125. Frage 1 des Spikes ist ungelesen: zeichnet r184 in eine Schicht
  eines Tiefen-Arrays?

### 8 · Die Fern-Ring-Naht wird mit dem freien Stoff bestellt (Blatt 33 Stufe 4) — Aufwand S
- Mangel: Die Naht wird bei 19,22 s bestellt, steht als letzte 0,42 s vor dem Bild und deckt 0,03 %. Wurzel laut 33, nicht selbst
  gelesen: `gelaende-fern.js:452–453`, `bild-kosten.js:650–652`. Schnitt: Bestellung bei der Geburt des freien Stoffs; zwei Programme
  bleiben zwei. Kosten ≤ −0,5 s; Risiko Schlangen-Vorrang (`bild-kosten.js:638–640`). ankunft.K1#1, Bildpaar byte-gleich ≤ 0,24 %.

## Kopplungen (Reihenfolge ohne Kreis)
- **2 zuerst, ohne Kopplung:** die Wand sperrt jede Landung; der OMEN-Spike läuft parallel zu allem.
- **1 vor 3 an der GPU, nicht headless:** `_bauFrist` gibt am Null-Renderer `Infinity` (`dirigent-takt.js:1848, 1887–1889`), die
  headless-Fahrt streaming.K1 bleibt unberührt; das GPU-Bildpaar von 3 wird nach 1 geschossen (die Welt füllt über mehr Takte).
- **4 vor 5 und vor jedem Takt-/Speicher-Urteil:** ohne eingeschwungenes Band kein E-vorher; 1 rückt `_weltSteht` später, der 240-s-Deckel trägt es.
- **w28-wiese-fern ↔ 4/5:** landet die Wiese, stirbt die Regel `nahWiese:Lf:schale`; die Wiese wartet auf die `zerlegen`-Zeile aus 5.
- **5 nach 4:** `effArch` und Laub-Dichte sinken unter Last; „Regler voll" im selben Band messen. **6 nach 1:** Rebake ist Bau-Stück unter der EINEN Frist.
- **7 vor Licht-Pass:** beide schreiben den Licht-Kern (`stoff-material.js:2037–2069, 2414ff`), nie in derselben Welle. **8 nach 7:** die Zeile misst die Schlange.

## Widersprüche zwischen den Blättern und was die Quelle sagt
1. **„pflicht" in der Belegung:** 40 liest `pflicht 1,13` als Bild-Arbeit („96 % Bau"), 35 als Arbeit außer Takt über dem Boden. Die
   Quelle gibt 35 recht: `pflicht = spiel − boden`, `spiel` nur Klassen `k < TAKT`, `belegt` enthält den Takt (`zerlege-linse.cjs:244,
   278–281, 296`). Die 32 ms sind der Takt selbst; ob Bau oder Render-CPU, sagt die Zahl nicht.
2. **k2:** 34 sagt „k1 und k2 laut Kommentar 2048²". Der Kommentar `bild-schatten.js:1098` nennt k0 308×113 und k1 835×203 aus der
   Zeit vor der Kontakt-Kaskade; heute drei Brüche (`dirigent-ankunft.js:409–413`), die Log-Zeile :434 sagt noch „2 Kaskaden". k2 ungelesen.
3. **Licht-Pass:** 33 rechnet −160 KB für B. Der Kopf `w28-samen-lichtweg` d8887125 sagt „der Pool im Stoff begrenzt die Nacht, nicht die
   Ankunft"; laut 34 ist der Pool 8,8 KB des Licht-Kerns (37,9), der Kaskaden-Empfang 19,8.
4. **Zählweise:** 59 Module/2,16 MB (swiftshader, 34) gegen 43 Pipelines/1,99 MB (GTX 1050, 33). Es gilt die Zeile aus Schnitt 7.
5. **E-Maß:** CLAUDE.md „CPU-Takt 4,7–6,3 ms" (18.10.); die Station urteilt Belegung (PM `g6.js:3266`), 2- bis 10-fach darüber.
6. **w28-mp-boden:** 39 nennt f97fe692, origin trägt 77c31f1a (Merge main 21:30). Haushalt-Klassen: 36 zählt 14, 40 zählt 13 — nicht nachgezählt.

## Gestrichen
- 40: „Belegung zu 96 % Bau-Arbeit" — widerlegt (Widerspruch 1); die Entscheidung bleibt, die Begründung fällt.
- 34: „Speicher gleich, weil k1 und k2 laut Kommentar 2048²" — widerlegt (Widerspruch 2).
- 33 Stufe 3: Licht-Pass als Posten der B-Zeile — nicht byte-gleich (Nacht, +9,3 MB VRAM laut 33), sein Samen nennt die Nacht; Licht-Familie.
- 38: „+15,7 MB am Start ist genau der Ruhe-Sack" — setzt Heap-Halter Foundry (+15,7 MB) und VRAM zurück (`buf:?` +15,7) gleich, ohne Messung.
- 36: gpuMs-Feld in Ratsche und Richter — nicht widerlegt, nach Kurs §2.5 nicht gebaut.
- 35: „Strom L0 81 · L1 27 ms" als Takt-Täter — die Zahl gilt dem Faden (`gelaende-chunks.js:2797`).

## Ehrlich offen
- Kein Schnitt gemessen; jede Wirkungszahl ist Ableitung oder Schätzung. Radeon-Welt startet an 36f9d45a nicht (Exit 3221226505,
  unbenannt) und sperrt die Radeon-Stationen von 1, 4, 5, 6.
- 2 ist Hypothese aus der Quelle (CI-Logs der Kipper, `pos` gegen `dsl` beim Mesh-Wechsel nicht gelesen). 3 schließt nur nach Formel;
  der Baum der Mesh-Zone (GT 58–73 %) ohne Wurzel; lod.K5 Weide 3,13 px liegt in `KARTE_GITTER` (Pflicht A, andere Familie).
- 5: ob timestamp-query an der Radeon „echt" liefert, nicht gelesen (Proxy enthält VSync). 7: Array-Schicht in r184 und Saum unter TRAA ungelesen.
- B ≤ 5 s hält auf der GTX 1050 auch mit 0 Programmen nicht (4,2–5,9 s vor dem Renderer, laut 33); dieser Boot ist von keinem Blatt zerlegt.
- `w28-wiese-fern` 476a3ed9: Ego +7,3 ms, Gegenprobe steht aus.
