# Ergebnis welle7-vram-post

```json
{
  "branch": "welle7-vram-post",
  "commits": [
    {
      "sha": "e9f308c1",
      "titel": "Der Satz folgt seinem Inhalt: eine Kapazitaet, die ruheTakte Takte lang ueber 1,5 x Ziel liegt, schrumpft dicht auf Inhalt x 1,25 - in Ruhe 151,2 -> 147,2 MB VRAM, nach drei Wander-Schleifen buf:szene 64,2 -> 41,4 MB"
    },
    {
      "sha": "6cc24c50",
      "titel": "Der schmale Index und das schmale Haut-Gewicht: r184 weitete jeden 16-bit-Index auf 32 bit, die Foundry lieferte Uint32-Indizes und float32-Gewichte - der Spieler 7,99 -> 6,37 MB, die Gestalten im Bild 18,64 -> 16,17 MB"
    },
    {
      "sha": "8339b327",
      "titel": "Ein Satz, der fuellt, schrumpft nie: waechst sein Inhalt waehrend der Frist um mehr als 10 %, beginnt sie neu - der Boden-Satz schrumpfte in der Werkbank vor dem vollen Ring auf 100 450 Vertices und wuchs danach zweimal"
    },
    {
      "sha": "38bd74ad",
      "titel": "Die Post- und Schatten-Kette traegt ihr Format: rg11b10ufloat posterisierte die Wolken und halbierte die Ruhe der zeitlichen Aufloesung, eine geteilte Kaskaden-Farbe zerstoerte die Schatten - am Code benannt, damit keiner sie wieder probiert"
    }
  ],
  "diffStat": "git diff --stat f9eec2f3..38bd74ad: anazhRealm.js | 151 (+/-) · scripts/diag-altlasten.cjs | 5 + · scripts/diag-chunk-satz.cjs | 161 (+/-) · scripts/diag-kreatur-kosten.cjs | 45 + · scripts/diag-vendor-anker.cjs | 7 + — 5 files changed, 297 insertions(+), 72 deletions(-)",
  "gates": [
    {
      "name": "node --check anazhRealm.js + die 4 geaenderten Gate-Skripte (HEAD 38bd74ad)",
      "exit": "0"
    },
    {
      "name": "npx eslint anazhRealm.js",
      "exit": "0",
      "notiz": "0 Fehler, 4 vorbestehende Warnungen; jeder Teil-Commit vorab als gestagte Datei geprueft"
    },
    {
      "name": "npx prettier --check anazhRealm.js",
      "exit": "0",
      "notiz": "auch je gestagtem Teil-Commit; diag-kreatur-kosten.cjs war an der Basis prettier-sauber und ist es wieder (die anderen Gate-Skripte liegen ausserhalb des format:check-Scopes und waren es an der Basis nicht)"
    },
    {
      "name": "gate:altlasten --selftest / Lauf",
      "exit": "0 / 0",
      "notiz": "244 gefallene Namen, neu: _chunkSatzLeert, s.leerSeit"
    },
    {
      "name": "gate:apparat --selftest / Lauf",
      "exit": "0 / 0"
    },
    {
      "name": "gate:vendor-anker --selftest / Lauf",
      "exit": "0 / 0",
      "notiz": "104 Anker, neu 4: das r184-Weiten (normalized), createIndexAttribute, Index-Format am Draw, unorm16-Vertex-Format"
    },
    {
      "name": "gate:source-probes",
      "exit": "0"
    },
    {
      "name": "gate:start-rezept --selftest / Lauf",
      "exit": "0 / 0"
    },
    {
      "name": "gate:profiband --selftest / Lauf",
      "exit": "0 / 0"
    },
    {
      "name": "gate:betriebsgesetz (HEAD je Commit)",
      "exit": "0"
    },
    {
      "name": "gate:chunk-satz (CHUNK_SATZ_PORT 7624 und CI-Schritt 36)",
      "exit": "0",
      "notiz": "(k) LEER 32768/65536 -> 1024/3072 am selben Mesh; BELEGT Boden-Satz mit Loechern x3 gewachsen 688128 -> 207415 Vertices = Inhalt x 1,25, jeder Bereich treu, Hauptbild-Abschnitt neu und treu; Selbsttest alte Regel haelt 622245 Vertices fuer 167619 Inhalt; (f)/(i)/(j) gruen"
    },
    {
      "name": "gate:kreatur-kosten (KREATUR_KOSTEN_PORT 7625)",
      "exit": "0",
      "notiz": "(T) SCHMAL sauber (Wolf, Mensch); (S4) alte Formen -> 10 breite Puffer benannt"
    },
    {
      "name": "gate:foundry-crossfade --selftest / Lauf (CROSSFADE_PORT 7632)",
      "exit": "0 / 0"
    },
    {
      "name": "gate:webgl-probe (WGLP_PORT 7631)",
      "exit": "0",
      "notiz": "WebGL2-Rueckfall: normierte Uint16-Gewichte und Uint16-Index tragen dort nativ"
    },
    {
      "name": "gate:freie-slots --selftest (CI-Schritt 49)",
      "exit": "0"
    },
    {
      "name": "gate:schatten-werfer --selftest (CI-Schritt 17)",
      "exit": "0"
    },
    {
      "name": "gate:asset-contract (CI-Schritt 30)",
      "exit": "0",
      "notiz": "Goldens byte-gleich, kein Re-Mint"
    },
    {
      "name": "playtest:fast (CI-Schritt 70)",
      "exit": "0",
      "notiz": "20/0"
    },
    {
      "name": "lokale check.yml-Serie, 74 Schritte (Generator scratchpad\\w7vp\\ci-lokal.cjs, Ports 7626-7630, absolute Pfade, seriell)",
      "exit": "0 (74/74)",
      "notiz": "auf HEAD 38bd74ad"
    },
    {
      "name": "GitHub-CI Code-Check",
      "exit": "success",
      "notiz": "Run 37424048559 auf 38bd74ad success; 37422784296 (8339b327) und 37421007277 (6cc24c50) success; e9f308c1 durch den naechsten Push abgebrochen"
    },
    {
      "name": "werkbank band Ruhe, nachher (n7, frische Welt, yaw 0)",
      "exit": "1",
      "notiz": "Band rot (Dreiecke, VRAM), LINSE SAUBER"
    },
    {
      "name": "werkbank band nach drei Wander-Schleifen, nachher (n7)",
      "exit": "1",
      "notiz": "LINSE ROT nur boden-Dreiecke haupt/k0/k1 und nahWiese haupt (nicht diese Welle); vorher (v2) zusaetzlich VRAM buf:szene 63,9 > 40,6 und gebunden 172,6 > 148,7 ueber der Ratsche"
    },
    {
      "name": "npm run playtest (voll) und diag-taille",
      "exit": "nicht gefahren",
      "notiz": "fest an Port 4312 (verboten)"
    }
  ],
  "gemessen": "Geschnitten: die Klasse „der Satz hält sein Hochwasser“ fällt ganz: `_chunkSatzVerdichten` ersetzt den Leer-Sonderfall für Boden, Wasser, Bau und Formationen, ein Satz, der noch füllt, schrumpft nie. Dazu der schmale Index (r184 weitet am EINEN Index-Weg nicht mehr) und das schmale Haut-Gewicht (unorm16). Die Formate der Post- und Schatten-Kette sind gemessen und begründet geblieben. Gemessen: in Ruhe VRAM 151,2 → 146,9 MB (ohne Tiere 148,0 → 142,9), nach drei Wander-Schleifen 182,7 → 157,6 MB (ohne Tiere 172,6 → 149,4, buf:szene 63,9 → 40,5); Befehle und Dreiecke je Klasse unverändert, die Bilder gleich. Pflicht-OFFEN Rest: A, B, C, E (docs/PFLICHT-OFFEN.md) — Status: ZWISCHENSTAND.\n\nZAHLEN (echte GPU Radeon 890M, Mess-Wiese −900/−850, eine Sitzung, Ausgabe-Pfad 1920×1080; vorher = Basis f9eec2f3 im selben Worktree (Stamm per git checkout getauscht), nachher = HEAD; Sequenz: start --echt (Erst-Boot, save-server 7635, Werkbank 7634) · umstellen · 300 Frames · umstellen · st.yaw 0 · band · puffer · zaehlen yaw 0 / −0,88 · bilder · fs-wandern.js (3000 Takte) · 700 Frames · umstellen · yaw 0 · band · puffer · bilder):\n- RUHE: VRAM 151,2 → 146,9 MB (buf:tier 3,2 → 4,0: ohne Tiere 148,0 → 142,9, −5,1 MB). Puffer-Linse: Wasser-Satz 3,25 → 0,54 MB (65 536 → 12 264 Vertices für 9 808 Inhalt), Bau-Sätze 1,31 → 0 MB (verdichtet, ohne Zeichnen kein GPU-Puffer), Spieler 7,99 → 6,37 MB, f:tanne:L0 1,90 → 1,71, f:eiche:L0 1,67 → 1,50; alle Gestalten ohne Sätze und Tiere 18,64 → 16,17 MB. Für 16 bit taugliche 32-bit-Indizes 2,83 → 0,26 MB (nur noch die Sätze). Bodensatz 16,38 → 17,63 MB (nur der Index, gewachsen mit dem Blick des vorigen Bands bei yaw −0,52 — keine Wirkung dieser Welle).\n- BAND-KLASSEN (yaw 0), vorher ↔ nachher gleich: boden 8/377k · streu 15/46k · karten 1/4k · baum 58 (591k ↔ 562k, Blick-Rauschen) · busch 6/32k · nahWiese 4/57k · bau 38/66k · formationen 3/12k · einzelstuecke 7/12k; nur tier* weicht ab (Weltzustand: 13 ↔ 32 Befehle).\n- NACH DREI WANDER-SCHLEIFEN: VRAM 182,7 → 157,6 MB (Tiere 10,1 ↔ 8,2: ohne Tiere 172,6 → 149,4, −23,2 MB). buf:szene 63,9 → 40,5; Boden-Satz 26,83 → 20,71 (Vertices 344 064 → 220 709, Index bleibt 2,56 M), Bau-Sätze 12,41 → 0,45, Wasser 3,25 → 1,49, Formationen 1,48 → 0,55, Spieler 7,99 → 6,37. Die VRAM-Zeilen der Wander-Ratsche sind nicht mehr rot.\n- BOOT: nach umstellen + band trägt der Boden-Satz seine Start-Kapazität (229 376, 0 Verdichtungen). Unter der Regel aus e9f308c1 schrumpfte er in der Werkbank vor dem vollen Ring auf 100 450 Vertices — 8339b327 schneidet das.\n- POST-KETTE, gemessen und verworfen: rg11b10ufloat für Szene, Auflösung und Geschichte gab 151,6 → 125,0 MB (−23,7 MB, Linse sauber). Es posterisierte die Wolken zu Höhenlinien (rg11-himmel-nord.png); die Radeon rundet beim Schreiben gegen null (Sonde 1,0117 → 1,0; Helligkeit Armlänge 76,6 → 74,8); die Frame-zu-Frame-Differenz in Ruhe verdoppelte sich (Armlänge 0,29 → 0,58, 25 m 1,11 → 1,57 Luma) — ROT. Die geteilte r8-Farbe beider Kaskaden (−4 MB): r184 legt sie für das zweite Ziel neu an („Destroyed texture [kaskaden:farbe] used in a submit“), die Schatten fielen (8 m Helligkeit 65,6 → 86,8) — ROT. Was bleibt: die Post-Kette mit 71,1 MB (3 × 15,8 Farbe rgba16float + 3 × 7,9 Tiefe: Szene, Wasser-/Feld-Kopie, TRAA-Vortiefe) und die Kaskaden mit 24 MB (2 × depth16 2048² + r8). Für diese TRAA-Form unter r184 ist das das Minimum. Die Wahrheit über den Spieler: 8 MB kamen aus der koerper-L0-Haut (56 440 Vertices, 89 600 Dreiecke) und 13 Teilen; je Vertex Position, Normale und Farbe in float32, Bone-Index (von r184 auf 16 B geweitet) und Gewicht, dazu ein Uint32-Index.\n- BILD (selbst gelesen, gleiche Bühne): Armlänge, 8 m, 25 m, 45 m mittags und abends sowie Dorf, Dorf nah und Wasser — vorher ↔ nachher deckungsgleich. Helligkeit 76,8/77,8 · 65,6/66,3 · 77,6/78,3 · 92,0/92,7 · abends 43,6/45,4 · 57,4/59,0 · Dorf 90,4/92,4 · Wasser 111,8/112,4. Ruhe zwischen zwei Frames 0,33/0,28 · 0,51/0,41 · 0,77/0,94 · 0,66/0,49. Schatten, Häuser und Wasser sind auch nach dem Wandern (verdichtete Sätze) da; der Fuchs trägt die unorm16-Gewichte ohne Fehlstellung. Keine WebGPU-Validierung im Werkbank-Log.",
  "bilder": [
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-arm-birke.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-arm-birke.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-8m-tanne.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-8m-tanne.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-25m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-25m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-45m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-45m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-abend-8m-tanne.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-abend-8m-tanne.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-abend-45m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-abend-45m-hain.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-dorf.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-dorf.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-dorf-nah.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-dorf-nah.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-wasser.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-wasser.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-wandern-dorf.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-wandern-dorf.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-wandern-wasser.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-wandern-wasser.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher2-wandern-arm-birke.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\nachher-wandern-arm-birke.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher-himmel-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\rg11-himmel-nord.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\vorher-arm-birke.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-w7-vram-post\\artifacts\\w7-vram-post\\rg11-arm-birke.png"
  ],
  "integrationPruefen": "RUHIG MESSEN (echte GPU, Mess-Wiese −900/−850, ohne parallele Gates, Tiere frei, st.yaw 0 vor jedem band — die Band-Linse pinnt keinen Blick):\n1) Upload-Spitze des Verdichtens: werkbank start --echt · umstellen −900 −850 · band · `werkbank takt 600` und `lauf 30 --ein 20 --ruhe 300 --tiere frei` (über die Frist hinaus: die Wasser- und Bau-Sätze verdichten etwa 600 Render-Takte nach dem Boot) · eval fs-wandern.js (C:\\Users\\micha\\AnazhRealm-profiband\\artifacts\\profiband\\freie-slots\\fs-wandern.js) · lauf 30 (≥ 700 Frames) · umstellen · band · puffer. Erwartet wird je Verdichten EIN voller Upload des Satzes (Boden ~11–20 MB, Wasser und Bau < 3 MB). Nach dem Boot verdichtet der Boden-Satz nie (eval: s.verdichtet 0, ueberSeit −1); nach drei Schleifen höchstens 1–2 Verdichtungen je Satz, kein Pendeln aus Wachsen und Verdichten. Zielwerte nach dem Wandern: buf:szene ~40 statt 64 MB, VRAM ohne Tiere ~149 statt 173.\n2) Ein Bau-Satz, der verdichtet und nicht gezeichnet ist, trägt keinen GPU-Puffer. Er lädt beim ersten Blick zum Dorf neu hoch (~2,6 MB): das zeigt die takt-Linse beim Drehen zum Dorf (Häuser bei −860/−831). Ein leerer Satz wächst ab 1 024 statt 8 192 Vertices (mehr kleine Wachs-Schritte beim Betreten eines Dorfs).\n3) Index 16 bit und unorm16-Gewichte: gpu-bank 120 --runden 3 vorher und nachher. Erwartet wird gleich oder besser (halbe Index- und Gewichts-Bandbreite der Foundry-Gestalten und Häute).\n4) Ratsche: eine Serie mit ≥ 4 Läufen (Erst- und Zweit-Boot) am vereinten Stand, `werkbank ratsche … --nur vram`. Hinweis: das Standard-band misst bei etwa 555 Render-Takten, also VOR dem Verdichten des Wassers (~660) — ~148 MB statt ~143 MB nach dem Einschwingen. Senken nur aus Läufen derselben Sequenz.\n5) Die Kennzahl-Sonde der Bildpaare: C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\C--Users-micha-AnazhRealm-profiband\\1d8df756-4c3b-4b06-bda2-d7de4eebfeaf\\scratchpad\\w7vp\\bilder.cjs <port> <ordner> <tag> [regex]. Sie liefert je Schuss Helligkeit, Kontrast, Banding-Histogramm des Himmels und die Frame-zu-Frame-Ruhe.\nKONFLIKT-ZONEN: boden-hoehle — _chunkSatz* (Satz-Felder vInhalt/ueberSeit/ueberHoch/ueberStart, s.vInhalt in _chunkSatzEin/_chunkSatzAus, _tickChunkSatz, CHUNK_SATZ_VERDICHTEN neben CHUNK_SATZ), gate:chunk-satz ((f) nutzt jetzt den Helfer bereichTreu, (k) neu). Das ist Synergie: ihr Schnitt der Höhlen-Schicht senkt vInhalt, Verdichten schrumpft den Boden-Satz dann von selbst, sobald die Kapazität > 1,5 × Ziel liegt; die Boot-Kapazität CHUNK_SATZ.boden bleibt ihre Entscheidung. baum-mittel — _foundryBuildMesh (Index jetzt Uint16 bei ≤ 65 535 Vertices). Jeder neue Leser darf keinen Uint32-Index annehmen (z. B. new Uint32Array(index.array.buffer)); die Wurf-/Bahn-Pfade lesen index.array per Index (geprüft). streu-karten — die Senken der Nah-Streu zeichnen Foundry-Gestalten, dort gilt der schmale Index; kein Code-Überlapp erwartet. Welle 5 architektur (Glut ins Studio, Trittfläche) — neue Bau-Sätze laufen durch Verdichten und gate:chunk-satz (h)/(k); gegenstaende (Glas/Klarlack) — Transmission braucht in r184 eine Vollbild-Kopie der Szene (rgba16float +15,8 MB); nach dem Merge die tex:-Liste im band prüfen; koerper — der Haut-Pfad (_foundryBuildMesh, _ofenStarrBinden: _hautGewicht unorm16, skinIndex weiter geweitet), gate:kreatur-kosten (T)/(S4) hält ihn; klang — keine.",
  "offen": [
    "Pflicht-OFFEN E (docs/PFLICHT-OFFEN.md; Rest A, B, C, E) — das Profi-Band auf jedem Standardgerät: Ruhe VRAM 146,9/118 MB (ohne Tiere 142,9), Dreiecke 1 329k/680k (yaw 0). Status: ZWISCHENSTAND.",
    "Benannter VRAM-Rest der Post- und Schatten-Kette: 95,1 MB (TRAA-Kette 71,1 = drei rgba16float-Farbziele + drei Tiefen, Kaskaden 24 = 2 × depth16 2048² + r8-Farbe). rg11b10ufloat ist gemessen und verworfen (Wolken posterisiert, Rundung gegen null, Ruhe halbiert); die geteilte Kaskaden-Farbe ebenso (r184 legt sie für das zweite Ziel neu an, die Schatten fallen). Für diese TRAA-Form unter r184 ist das das Minimum.",
    "Spieler 6,37 MB: die koerper-L0-Haut (56 440 Vertices) bleibt das Asset (Welle-5-Familie koerper). Normale und Farbe reisen float32, weil r184 keine x3-Form in 16 bit kennt; der Bone-Index bleibt von r184 auf 16 B je Vertex geweitet.",
    "Boden-Index nach dem Wandern 2,05–2,56 M Indizes (Schwelle 1,5 über dem Hochwasser der Abschnitte): Boden-Satz 20,7 statt 16,4 MB in frischer Welt; die Höhlen-Schicht (boden-hoehle) senkt ihn.",
    "Die Ratsche ist nicht gesenkt: sie braucht eine Serie mit ≥ 4 Läufen in der Standard-Sequenz, und das Standard-band misst vor dem Verdichten des Wassers. Für die Integration.",
    "Die Upload- und CPU-Spitze eines Verdichtens (der Boden-Satz einmal ganz) und der Erst-Upload eines verdichteten Bau-Satzes beim ersten Zeichnen sind ungemessen (Zeit misst die Integration).",
    "Nicht lokal gefahren: npm run playtest (voll) und diag-taille — fest an Port 4312.",
    "Wander-Ratsche weiter rot in boden-Dreiecke haupt/k0/k1 und nahWiese haupt (nicht diese Welle; die VRAM-Zeilen sind sauber). Die Band-Linse pinnt keinen Blick: jede Band-Messung dieser Welle setzt st.yaw 0 von Hand.",
    "Prozesse: alle eigenen (Werkbank 7634, save-server 7635) sind beendet; der save-server lief bis an die Hintergrund-Frist (2 h) und wurde dort gestoppt."
  ]
}
```
