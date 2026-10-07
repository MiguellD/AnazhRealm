# Ergebnis welle-g-post

```json
{
  "branch": "welle-g-post (ab f2361bb1, gepusht nach origin/welle-g-post, Kopf 24c955cc)",
  "commits": [
    {
      "sha": "5195754c",
      "titel": "Die Nachbild-Stufen tasten nur, wenn sie zeigen: Godrays und lokaler Kontrast rechnen im Zweig hinter ihrer Staerke, die Bloom-Mitte ist das Bild selbst - Ausgabe-Fragment 34 unbedingte Abtastungen -> 9 unbedingt + 24 im Zweig"
    },
    {
      "sha": "03e9226f",
      "titel": "Der Direktpfad zeichnet wieder: EIN Tiefen-Weg der Leinwand, die Weiche stellt ihn je Frame - auf der Basis stuerzte jeder Weg ohne Post-Kette (TypeError in copyFramebufferToTexture), jetzt 4 von 4 Wegen ohne Fehler, mit Tiefentest"
    },
    {
      "sha": "24c955cc",
      "titel": "werkbank shader: die Shader-Kosten-Linse je Programm eines echten Frames - an der Mess-Wiese (kienspan) 46 Programme, das Boden-Fragment ruft mx_perlin_noise 26x je Pixel, die Ausgabe der Post-Kette tastet 9x unbedingt + 24x im Zweig"
    }
  ],
  "diffStat": "f2361bb1..24c955cc: 7 Dateien, +917 / -29 — anazhRealm.js +63/-29 (netto; _leinwandTiefe neu, _loopRender-Weiche, _ensurePostProcessing: nurBeiStaerke, Bloom-Mitte, TRAA-Name, Bau stellt keine Tiefe mehr) · scripts/diag-post-kette.cjs +460 (neu, gate:post-kette) · scripts/lib/shader-kosten.cjs +308 (neu, Shader-Kosten-Linse mit Budget und Selbsttest) · scripts/werkbank.cjs +49 (rein additiv: Befehl shader) · scripts/diag-vendor-anker.cjs +23/-3 (11 Anker: Tiefen-Weg, Stufen-Zweig, TRAA-Vortiefe) · package.json gate:post-kette + Selbsttest in check · .github/workflows/check.yml Schritt Post-Kette",
  "struktur": "BERICHT (3 Sätze): Geschnitten: der Direktpfad ohne Post-Kette stürzt nicht mehr — EIN Tiefen-Weg (`_leinwandTiefe`, gestellt je Frame von der Weiche in `_loopRender`) gibt ihm die Tiefe und nimmt sie der Kette samt GPU-Textur; Godrays und lokaler Kontrast tasten nur noch im Zweig hinter ihrer Stärke, die Bloom-Mitte trägt zugleich das Bild, die namenlose Kopie ist die TRAA-Vortiefe (Leser: Disokklusion, bleibt, heißt jetzt TRAANode.history:tiefe). Gemessen: gate:post-kette Basis rot (TypeError „Invalid value used as weak map key\") → Kopf grün 4/4 Wege mit Tiefentest, Ausgabe-Fragment 34 unbedingte Abtastungen → 9 unbedingt + 24 im Zweig, 8 Bildpaare Basis↔Kopf auf echter GPU bit-gleich bzw. unter dem Rauschen Kopf↔Kopf. Offen: die ms auf dem OMEN, Bloom/Godrays in halber Auflösung nicht gebaut (Glitzer-Schwelle, VRAM), Pflicht-OFFEN Rest 4.\nGeschnitten: _leinwandTiefe (EIN Ort für renderer.depth, Weiche je Frame) · nurBeiStaerke (Godrays 20 + Kontrast 4 Abtastungen im Uniform-Zweig) · Bloom-Mitte = Bild (−1 Abtastung) · TRAA-Vortiefe benannt\nGemessen: Ausgabe 34 unbedingt → 9 unbedingt + 24 Zweig; post-Schalter CRASH → „post 24→0\"\nPflicht-OFFEN Rest: 4 (A, B, C, E — docs/PFLICHT-OFFEN.md)\nStatus: ZWISCHENSTAND\n\n(1) DEFEKT, WURZEL (Vendor gelesen): der Ketten-Bau setzte renderer.depth=false (V18.532), zurück nur im catch eines Render-Fehlers. Jeder andere Weg in den Direktpfad (Weiche der Zerleg-Linse post/leer) rendert die Szene in r184s Rahmen-Ziel (_getFrameBufferTarget, depthBuffer = renderer.depth) OHNE Tiefe → kein Tiefentest, und ViewportDepthTextureNode.updateBefore → copyFramebufferToTexture → backend.get(renderContext.depthTexture = null) → WeakMap.set(null). Danach ist der Renderer halb (Wurf mitten in _renderScene): die Aufnahme bricht („format of undefined\"), auch der Fang-Weg stürzt nach. LINSE gate:post-kette (echter Renderer swiftshader/kienspan, echter _loopRender, Bühne: nahe rote Kiste vor ferner grüner + Wasser mit dem echten Stoff als Leser von _szeneTiefe): Basis f2361bb1 EXIT 1 — Direktpfad TypeError, renderer.depth false, Folge-Schritte stürzen, Ausgabe 34/0; Kopf EXIT 0 — Post-Kette: Tiefe aus, keine GPU-Textur, Mitte [231,0,12]; Direktpfad: Tiefe an, Mitte [219,0,22] (nah deckt fern), 6 Tiefen-Kopien; zurück: Leinwand-Tiefe wieder frei; Render-Fehler der Kette: Loop fährt Direktpfad mit Tiefe; Godrays mit Sonne im Bild 3,35–3,65 % der Pixel gegen 0 % Rauschen. CI Linux (Schritt Post-Kette) grün.\n(2) „post: depth → ?\" 7,9 MB: Kopierer = vendor TRAANode.updateBefore copyTextureToTexture(currentDepth, _historyRenderTarget.depthTexture); Leser = Resolve samplePreviousDepth (Disokklusions-Test, ohne ihn Geister an jeder freigelegten Kante) → fällt NICHT, ist jetzt benannt. Anatomie echte GPU (Radeon 890M, 1920×1080, Mess-Wiese): vorher „post: Textur depth → ? 1,0× 7,91 MB\", nachher „post: Textur depth → TRAANode.history:tiefe 1,0× 7,91 MB\"; Pässe 4,7× (haupt clear, haupt-Neustart load, TRAA, post, k0 0,5, k1 0,2) und Kopien 3,0× / 31,64 MB unverändert; VRAM-Schlüssel unverändert (Band-Linse nannte sie schon über das Ziel).\n(3) Godrays: Abtastungen im Zweig `if (godrayStrength != 0)` (Stärke = Regler × Höhe × Wetter × Sonne im/nahe dem Bild); an der Mess-Wiese (Sonne nicht im Bild) fallen alle 20. Gleiches für den Kontrast (Regler 0 = aus). Zerleg-Linse findet die Stufen weiter (ketteKante über rawInputs): Belege Kopf godrays 36→16, bloom 36→28, kontrast 36→32, nachbild 36→3, post 24→0, leer schaltet; Zustand zurück.\n(4) Zusammengelegt: Bloom-Mitte und Bild = EINE Abtastung (34→33). Erzeugtes WGSL (Shader-Kosten-Linse, werkbank shader / __shaderKosten): post:ausgabe vorher 34 gesamt/34 unbedingt/0 Zweig, nachher 33/9/24; TRAA.resolve 21 unbedingt (vendor, unverändert); keine Schleifen, kein Rauschen in der Kette. Nicht gebaut: Bloom halbe Auflösung (Schwelle je Abtastung auf bilinear gemischten Halb-Texeln dimmt 1-px-Glitzer), Godrays halbe Auflösung (eigenes Ziel+Pass dauerhaft, +4 MB VRAM, Gewinn nur im Gegenlicht, nicht bit-gleich), TRAA-Ping-Pong (Vendor-Interna; Geschichts-Knoten des Resolve unerreichbar).\nBILD (echte GPU, eine Welt, Kette live getauscht: Kopf1 → Basis → Kopf2, je frisch gebaut; Bühne Sommer/Sonne, Uhren fest: Knoten-Zeit, Loop-Zeit, Dither-Phase, Halton-Index; Motiv −901/−850, Kamera 0,7/8/25/45 m östlich, Blick −x): Mittag+Abend, 8 Paare Basis↔Kopf1: Armlänge Mittag max 1 LSB (0,04 % Pixel), Armlänge Abend bit-gleich, 8 m Abend max 1, 25 m max 8 (Kopf2↔Kopf1 max 12), 45 m max 6/3 (Kopf2↔Kopf1 10/8) — in jedem Paar ≤ Rauschen Kopf↔Kopf (Weltdrift aus asynchronem Bau). Godrays am Abend sichtbar (Stärke 0,646, Lichtschäfte bei 8/25/45 m), gleich. Kontrollen: ohne Godrays ändern sich 17 % der Pixel (max 83), ohne Kontrast 61 % → Vergleich nicht blind; Kontrast aus (frisch gebaute Ketten): Basis↔Kopf bit-gleich. FARB-GESETZ/Licht-Kette nicht berührt (Grading/ACES-Graph identisch). ms von diesem Rechner: keine (4 fremde Welten auf der iGPU, 95–159 ms/Frame).",
  "gates": [
    {
      "name": "node --check anazhRealm.js",
      "exit": "0"
    },
    {
      "name": "npx eslint anazhRealm.js",
      "exit": "0",
      "notiz": "0 Fehler, 3 bestehende Warnungen"
    },
    {
      "name": "npx prettier --check anazhRealm.js",
      "exit": "0",
      "notiz": "auch der gestagte Stand von Commit 1 einzeln geprüft"
    },
    {
      "name": "gate:altlasten",
      "exit": "0",
      "notiz": "Selbsttest + Lauf"
    },
    {
      "name": "gate:apparat",
      "exit": "0",
      "notiz": "Selbsttest + Lauf + vendor-anker"
    },
    {
      "name": "gate:vendor-anker",
      "exit": "0",
      "notiz": "Selbsttest + Lauf, 115 Anker (11 neu/umgewidmet: Tiefen-Weg, Stufen-Zweig, TRAA-Vortiefe)"
    },
    {
      "name": "gate:source-probes",
      "exit": "0",
      "notiz": "179 Symbole"
    },
    {
      "name": "gate:start-rezept",
      "exit": "0"
    },
    {
      "name": "gate:freie-slots",
      "exit": "0",
      "notiz": "Port 7802; ein erster Lauf lief versehentlich auf dem Standard-Port 4527 parallel zur eigenen Werkbank, ebenfalls 0"
    },
    {
      "name": "gate:profiband",
      "exit": "0",
      "notiz": "Selbsttest 19/19 + Lauf"
    },
    {
      "name": "gate:kamera-treue",
      "exit": "0",
      "notiz": "Selbsttest + Lauf (Port 7803): 13/13 verfolgt, Replay 1"
    },
    {
      "name": "gate:look-golden (look-golden)",
      "exit": "0",
      "notiz": "MSSIM-Selbsttest; kein Golden gemintet"
    },
    {
      "name": "look-lens",
      "exit": "0",
      "notiz": "Port 7804"
    },
    {
      "name": "playtest:fast",
      "exit": "0",
      "notiz": "Port 7805, 20/20, Kern-Gesundheit OK"
    },
    {
      "name": "gate:post-kette (neu)",
      "exit": "0",
      "notiz": "Kopf: Selbsttest 13 Täter + Lauf (Port 7801) grün; Basis f2361bb1: EXIT 1 (Direktpfad TypeError weak map key)"
    },
    {
      "name": "gate:godray",
      "exit": "0",
      "notiz": "Port 7806 (Source-Probe .add(godray), gDelta, Regler)"
    },
    {
      "name": "gate:webgl-probe",
      "exit": "0",
      "notiz": "Port 7802: WebGL2-Rückfall mit Zweig im GLSL lebt"
    },
    {
      "name": "gate:betriebsgesetz",
      "exit": "0",
      "notiz": "HEAD-Message ohne Siegel"
    },
    {
      "name": "werkbank zerlegen --nur post,leer,godrays,bloom,kontrast,nachbild (echte GPU, Struktur)",
      "exit": "0",
      "notiz": "alle Schalter geschaltet, Zustand zurück; ms unbrauchbar (fremde Last)"
    },
    {
      "name": "CI Code-Check 37513372885 (03e9226f)",
      "exit": "success",
      "notiz": "check + playtest, Schritt Post-Kette success (Linux swiftshader)"
    },
    {
      "name": "CI Code-Check 37518422060 (24c955cc)",
      "exit": "success",
      "notiz": "check + playtest, Post-Kette success"
    }
  ],
  "omenBefehle": "Gleiche Bedingungen wie die Zerlegung (GTX 1060, 1920×1080, Mess-Wiese −900/−850, Blick gepinnt, Wetter fest, keine fremde Last, Port 3000 frei), ZWEI Stände nacheinander, nie parallel:\n  git fetch origin welle-g-post\n  git worktree add ../omen-basis f2361bb1\n  git worktree add ../omen-kopf 24c955cc\nJe Stand (erst ../omen-basis, dann ../omen-kopf), im Worktree:\n  npm start                                            (eigenes Fenster, :4312)\n  node scripts/werkbank.cjs start --echt               (wartet auf „WERKBANK bereit\")\n  node scripts/werkbank.cjs umstellen -900 -850\n  node scripts/werkbank.cjs lauf 10 --ein 30 --ruhe 300 --tiere frei\n  node scripts/werkbank.cjs zerlegen --selbsttest\n  node scripts/werkbank.cjs zerlegen --nur haupt,tiefenkopie,traa,traaKopien,nachbild,bloom,godrays,kontrast,feldPass,leer --runden 8 --json artifacts/werkbank/zerlegen-<basis|kopf>.json\n  node scripts/werkbank.cjs gpu-bank 200 --runden 12\nNUR auf dem Kopf zusätzlich (auf der Basis stürzt dieser Schalter — das ist der Defekt):\n  node scripts/werkbank.cjs zerlegen --nur post --runden 8 --json artifacts/werkbank/zerlegen-kopf-post.json\nOptional Struktur (beide Stände, kein ms): node scripts/werkbank.cjs shader --nur post   (nur Kopf hat den Befehl)\n  node scripts/werkbank.cjs stop   (+ save-server beenden)\nERWARTUNG Kopf gegen Basis: godrays 0,69 ± 0,1 → ≈ 0 (Sonne an der Mess-Wiese nicht im Bild, der Zweig fällt; Beleg bleibt „Abtastungen der Ausgabe 36→16\") · nachbild 1,27 → ≈ 0,55–0,6 · GPU gesamt 20,09 → ≈ 19,4 (−0,6…−0,7 ms) · bloom 0,38 ≈ gleich (eine Abtastung weniger, ≤ 0,04) · kontrast 0,08, traa 1,06, traaKopien 0,28, tiefenkopie 0,07, haupt/boden/feldPass/Schatten unverändert · post: Basis CRASH → Kopf messbar, erwartet ≈ 1,7–1,8 ms (V18.531: 2,45 minus Godrays) · leer ≈ 1,43, eventuell +0,05 (der Direktpfad trägt wieder Tiefe: Tiefen-Clear des Rahmen-Ziels) · Anatomie unverändert 4,6–4,7 Pässe, 3 Kopien 31,6 MB, die dritte heißt „post: depth → TRAANode.history:tiefe\" · VRAM unverändert. Ein Bildpaar zur Gegenprobe: node scripts/werkbank.cjs bild -893 +1.6 -850 -945 +3 -850 --datei artifacts/werkbank/bild-<stand>.png (gleich erwartet).",
  "konflikte": "anazhRealm.js: (a) _ensurePostProcessing — Ketten-Graph (nurBeiStaerke-Fn, Bloom-Mitte, TRAA-Name der Geschichts-Tiefe; die Zeile renderer.depth=false am Bau ist entfernt) — jede Familie, die die Post-Kette anfasst; (b) _loopRender, Weiche ~Zeile 90660–90690 (Direktpfad-Block neu geschrieben, _leinwandTiefe-Aufrufe) — welle-c-sicht (Pass-Sicht-Kette) und G-feldpass, falls sie _loopRender berühren; (c) neue Methode _leinwandTiefe direkt vor _ensurePostProcessing. Lesend berührt: _szeneTiefe (unverändert) — gate:post-kette nutzt den Wasser-Stoff (_ensureHydroSurfaceMaterial, Attribute aFlow/aShore/aWave) als Leser der Szenen-Tiefe: Welle L-wasser (vigorous-nash-l-wasser) und G-feldpass (Feld-Pass-Leser) ändern diese Leser — die Bühne der Wand muss ihre Attribute mitziehen. scripts/diag-vendor-anker.cjs: Anker-Liste (TRAA-Block +1, Leinwand-Block +7, ShaderCallNode +1) — textuelle Kollision mit parallelen Anker-Zusätzen. package.json: die EINE lange check-Zeile (diag-post-kette --selftest eingefügt) + gate:post-kette — jede Familie, die an check anhängt, kollidiert in derselben Zeile. .github/workflows/check.yml: neuer Schritt nach „Nah-Linse\". scripts/werkbank.cjs: +49 rein additiv (require SK + SHADER_INSTALL am Installations-Block, Route /shader vor /takt, CLI vor reload, Hilfe vor band) — G-boden/G-feldpass fügen dort ebenfalls Befehle ein. scripts/lib/zerlege-linse.cjs unberührt.",
  "offen": [
    "Die ms misst der OMEN (Befehlsfolge oben); dieser Rechner lieferte keine (4 fremde Welten auf derselben iGPU, 95–159 ms/Frame; einmal ging das Gerät verloren — 'external Instance reference' —, nach reload stabil).",
    "Godrays mit der Sonne im Bild tasten weiter 20× in voller Auflösung (~0,69 ms im Gegenlicht): halbe Auflösung nicht gebaut — eigenes Ziel+Pass dauerhaft (+4 MB VRAM bei 1080p) für einen Gewinn nur im Gegenlicht, Bild nicht bit-gleich.",
    "Bloom (9 Abtastungen, Stärke nie 0, daher kein Zweig) bleibt voll aufgelöst: die Schwelle wirkt je Abtastung, auf halber Auflösung mischt die bilineare Abtastung einen 1-px-Wasser-Glitzer unter die Schwelle — begründet aus dem Shader, nicht gemessen.",
    "TRAA (Vendor verbatim, Resolve 21 unbedingte Abtastungen) und ihre zwei Kopien je Frame (Geschichte 15,8 MB + Vortiefe 7,9 MB) bleiben: Ping-Pong statt Kopie verlangte den Eingriff in TRAANode-Interna, die Vortiefe ist der Leser der Disokklusion.",
    "Für die Familie boden (Fund der neuen Linse, werkbank shader, kienspan): das Boden-Fragment ruft mx_perlin_noise_float 26× je Pixel bei 12 Abtastungen (10 unbedingt).",
    "Bildpaare zeigen bei 25/45 m eine Weltdrift (max 8–12 Stufen, auch Kopf↔Kopf) aus asynchronem Bau zwischen den Läufen; Basis↔Kopf liegt in jedem Paar darunter.",
    "Pflicht-OFFEN Rest 4 (A, B, C, E — Profi-Band auf jedem Standardgerät) — Status ZWISCHENSTAND."
  ],
  "bilder": [
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-mittag-arm.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-mittag-arm.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-mittag-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-mittag-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-mittag-25m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-mittag-25m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-mittag-45m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-mittag-45m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-abend-arm.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-abend-arm.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-abend-25m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-abend-25m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-abend-45m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-abend-45m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf2-abend-25m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kontrolle-kopf-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kontrolle-ohneGodrays-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kontrolle-ohneKontrast-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\k0-kopf-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\k0-basis-abend-8m.png",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\bericht.json",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\kopf1-post_ausgabe.wgsl",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\bilder\\basis-post_ausgabe.wgsl",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\zerlegen-kopf.txt",
    "C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\vigorous-nash-g-post\\artifacts\\welle-g-post\\zerlegen-basis.txt"
  ]
}
```
