# D — Stand der Studios und was fehlt, damit die Arbeit IM Studio geschieht (Lese-Arbeiter D, 13.11.)

Gelesen am Stand 1e00bfdb (V18.546.272, leib-kanon-urteil). Die rohen git-Zahlen je Studio (272–339 Commits in 30 Tagen) sind fast
nur Versions-Stempel `?v=`. Gezählt sind darum nur echte Commits ohne Merge und ohne Stempel, seit 14.10. (`git log --no-merges`).
Prozent „Einheit“ = Anteil von fünf Prüfpunkten aus studio-vollendung.md (Gedächtnis :22-23, :43-47): (1) eigene isolierte Bühne ·
(2) UI der Hülle · (3) das Werk vom EINEN Kern (dasselbe buildInstance/derselbe Bäcker wie der Foundry-Faden) · (4) die Engine der Welt (r184
WebGPU) + das Licht der Welt (`welt-licht.js buehne`) · (5) EIN Export in die Welt (`werk` → „In der Welt ansehen“). Die Asset-Güte
(AAAA) ist darin NICHT enthalten, sie ist je Studio ungemessen.

## 1 Die Studios

| Studio | Kern (Manifest) | Was man sieht / ändert (Code) | Echte Commits seit 14.10. · zuletzt | Liest die Welt dasselbe? Zwilling | Einheit |
|---|---|---|---|---|---|
| garage | vehicle (Regler 16) | Wagen; Ansichten Perspektive/Iso/Seite/Explosion/Animation/Drehteller (index.html:140), Ansicht-Regler Explosion+Animation (garage.js:464), Gattung·Epoche·Lack·Kultur, Probe- und Prüffahrt, „Leicht“ | 41 · 10.11. | ja: `buildInstance` (garage.js:243), Welt über `siedlung-verkehr.js:605`→`build-asset`, aber **ohne werk, ohne Epoche** (Samen-Befund Fahrzeug Fakt 21); Zwilling fern `_archBoxFit` (studio-bruecke.js:3204) | ~90 % |
| schmiede | schmiede (weapon 18 · arena 4) | Klinge/Kolben; Lehren, Rückgrat, Arena (schmiede.js:1-5, :323) | 21 · 10.11. | ja: `buildInstance` ×5, r184 + `buehne` (schmiede.js:1231), werk (:1301) | ~100 % |
| fachwerk | fachwerk (haus 21 + 12 Geräte-Arten) | Haus, Dorf, Stadt; Regler Form·Meta·LOD·Dorf·Explosion (fachwerk.js:834-938), Schnitt-Ebene (:940) | 19 · 09.11. | Werk ja (`buildInstance` fachwerk.js:735), Bild nein: r128, ACES 1,12 (fachwerk.js:633-636); eigener Dorf-Boden + Dorf ×2 (SYSTEMKARTE.md:91, :212, Stand 18.10.) | 80 % |
| koerperstudio | koerper (Regler 8) | Mensch; Regler Körper·Pose·Haar (koerperstudio.js:263), Matrix-Tafel, Emotion | 32 · 12.11. | Werk ja: derselbe Bäcker `BAKERS_BY_KIND.koerper` (koerperstudio.js:89-97); Bild r128 ACES (:83); Akt-Katalog nur im Studio (SYSTEMKARTE.md:109, 18.10.) | 80 % |
| tetrapoda | tetrapoda (Regler 5) | Tier; 5 Gestalt-Regler + Tempo (tetrapoda.js:179, :197), Matrix | 14 · 07.11. | Werk ja (`deriveTierParams`, Stufen :146-150); Bild r128 ACES 1,25 (:186); Labor-Gang-Zwilling (SYSTEMKARTE.md:100, 18.10.) | 80 % |
| portale | porta (Regler 29) | Tor; Regler, Presets (porta.js:190) | 17 · 06.11. | Werk ja (`PC.buildInstance` porta.js:194); Bild r128 ACES 1,1 (:172) | 80 % |
| terrain | phyto + foundry (keine PARAMS_BY_KIND) | Bäume/Sträucher/Gras/Fels, Wald begehbar, Tageszeit- und Jahr-Regler (phytogenesis.js:4386-4399), 50 Knöpfe | 26 · 09.11. | Welt baut über den Foundry-Faden aus phyto-core; das Labor ist eigenes r128-Programm (4 593 Z., ACES :531-536); Wuchs Rich ⇄ Legacy (SYSTEMKARTE.md:82) | 60 % |
| klang | klang (Regler 7) | Musik; DNA-, Tempo-, Mixer-, Lage-Regler (klang.js:3943-4567), 26 Knöpfe | 8 · 29.10. | Kern ja (klang-core), werk (:4629); kein Bild nötig | Ton: n/a |
| gelaende | gelaende (Funktion) | Panel über der LAUFENDEN Welt, Regler aus `LANDFORM_REGLER`, A/B, Export EIN Plan (studio.js:1-23) | 2 · 18.10. | ja, byte-gleich (`planNormal`, gate:worker-dichte --studio) — aber ohne Isolation: bootet die volle Welt | Einheit 100 %, Isolation 0 |
| fluid · skeleton · translated · begegnung · schwarm | keiner | Portal-Nebenwelten (fluid r183-Fluid, skeleton = leeres Tor, translated = Daten-Szene, begegnung/schwarm 2D ohne Hülle) | 4 · 1 · 0 · 1 · 1 | kein Gesetzbuch | n/a |
| neuntes-buch | stele-core.js, NICHT im Manifest | keine Seite (nur stele-core.js) | 2 · 30.10. | weiß ich nicht | — |
| huelle | — | das UI-Modul aller Studios (regler, sitzung, kosten, bruecke, kugel, zeiger, matrix) | 26 · 09.11. | — | — |

Engine-Zählung heute: r184 + Welt-Licht = 2 (garage, schmiede); r128 mit eigenem Licht und ACES = 5 (fachwerk, koerperstudio, tetrapoda,
portale, terrain); SKILL.md:25-27 sagt dasselbe. Der STOFF der Welt (stamm/studio-stoff.js `_foundryMats` :201, NodeMaterial) läuft in
KEINEM Studio (grep worlds/: 1 Kommentar-Treffer). Die Bühne zeigt das Licht nur zu Mittag: `buehne(o)` Vorgabe `uhr 0,5`
(welt-licht.js:1073), garage ruft sie ohne Uhr (garage.js:785).

## 2 Das Fahrzeugstudio (garage)

| Datum | Zweig/Commit | Was | Stand |
|---|---|---|---|
| 18.10. | c8dcb979 → 876feb6f | S1 löste die Garage in die Welt auf, Revert „Garage zurück als isoliertes Studio“ | Gesetz 18.10.: nie löschen |
| 18.–20.10. | 5c355d20, garage-r184, d5bda142, 3b03c814 | r184 WebGPU, Wagen vom Welt-Bauer, Knopf „In der Welt ansehen“, Chase-Kamera als EIN Kern-Gesetz | gelandet |
| 01.11. | Gedächtnis fahrzeugstudio-zuerst.md | Schöpfer: Matrix + Antike, Iso/Seite/Explosion/Animation, swiftshader-tragbar, Zeit-Achse | Auftrag |
| 02.11. | w4-fahrzeug-ansicht 9e7ca81e · w4-fahrzeug-epoche 13b78f05 · w4-fahrzeug2-topo · -leicht 47932215 | Iso, Seite, Explosion, Animation, Drehteller; Epoche 0..5 als EIN Gesetz in vehicle-core; jede Epoche eigene Gestalt; Leicht-Modus | alle in 1e00bfdb |
| 04.–05.11. | w11-fahrzeug 1ae8a8cf, d2494681, 180d3a68 | Zeit-Achse als Antriebs-Gesetz, „der Schirm gehört dem Wagen“ (Leiste 51 % → ≤ 15 %, index.html:87-92), Prüfstrecke im Gelände-Gesetz | gelandet |
| 05.–10.11. | w12-studio-buehne, w13-buehne-lack, w16-studio-welt, w27-studio-mesh | Licht/Himmel/Umgebung der Welt auf der Bühne; asynchroner Pipeline-Vorbau nach 120-s-Hänger auf der Radeon (FUND-REGISTER.md:75, :83; 98078ce1) | gelandet |
| 12.11. | w28-samen-fahrzeug (NICHT gemergt) | Befund: Haut = 95 % Boxen (223 von 235 Meshes), Kandidat 20 578 statt 28 716 Dreiecke, Radlauf 225 → 4 mm | Lager, kein Schnitt |

Wo es abbrach: seit 05.11. galt jeder Garage-Commit dem LICHT der Bühne (w12–w27), keiner mehr der Form; die Form-Frage kam erst am
12.11. als Befund und liegt ungemergt. Offen aus dem Auftrag vom 01.11.: die Welt liest Epoche und Werk nicht (Fakt 21), die Haut ist ein
Kasten (Befund Fakt 1-3), „swiftshader-tragbar“ hat einen Leicht-Knopf, ein Bild-Beweis darunter ist mir nicht bekannt (weiß ich nicht).

## 3 Kernfrage: EIN Ding in Sekunden nackt, im Streiflicht, aus vier Seiten — ohne die Welt?

| Weg | Datei:Zeile | Kann | Grenze | Welt-Stoff / Welt-Licht |
|---|---|---|---|---|
| Studio-Seite garage/schmiede | garage/index.html:147-157 | Ding allein, Orbit, Iso/Seite/Explosion (nur garage), Regler am Kern | Licht nur Mittag (welt-licht.js:1073, garage.js:785); kein „nackt/grau“-Knopf außer „Clay/Lack“ (garage index.html:125); kein Kommando-Zugang für Arbeiter (nur Browser) | Licht ja, Stoff nein |
| Studio-Seite fachwerk/koerper/tetrapoda/portale/terrain | jeweils `new THREE.WebGLRenderer` r128 | Ding allein, Regler | eigenes Licht + ACES ≠ Welt; nur fachwerk hat Explosion/Schnitt | nein / nein |
| werkbank | scripts/werkbank.cjs:4-74 | `bild` mit freier Kamera, `--uhr`, `--saison`, `--klasse`; `methode` tauscht eine Stamm-Methode live (:16) | `start` bootet IMMER die volle Welt (Welt-Seite allein 81 s GTX 1060, FUND-REGISTER.md:71; Dorf 60–100 s laut Auftrag); kein Isolations-Modus; `--ort buehne` ist die Prüfbühne IN der Welt (:3218); Kerne tauscht `methode` nicht (Live-Tausch-Befund F, Lesart 3) | ja / ja |
| asset-worker-harness | scripts/lib/asset-worker-harness.cjs:1-35, `bauBild` :76-130 | echter Foundry-Faden + Kerne aus dem Manifest, ohne Welt, swiftshader; Bau-Hash, Raster | Bild = 160×160 Luma, 2 Blicke (Gier 0,6 und +π, Neigung 0,32), EIN festes Licht, nur Neutral-Kurve; für Wände gebaut (regler-wirkt, asset-contract), nicht zum Ansehen | Stoff nein, Licht nur Belichtungs-Gesetz |
| Samen-Vergleichs-Bühnen | origin/w28-samen-wiese `samen/wiese/buehne.cjs`, w28-samen-fahrzeug `spike.cjs`, -karten-stufe `buehne.cjs`, -lichtweg `platz.html` | GENAU das Gesuchte: nackt grau, Streiflicht 12–22°, 5+ Blicke, swiftshader, Sekunden | je Befund neu geschrieben, keiner gemergt; eigene r184-WebGLRenderer-Seite; „Stoff, Narbe, Dach-Normale, Wind und TAA fehlen in der Bühne“ (Befund Wiese) | nein / nein |

Antwort: Es gibt heute KEINEN gemergten Weg, der alle vier Bedingungen erfüllt. Der Harness hat den Bau ohne Welt, die Samen-Bühnen
haben den Blick (nackt, Streiflicht, viele Seiten), garage/schmiede haben das Licht der Welt. Den Stoff der Welt hat nur die volle Welt.

## 4 Was fehlt konkret

| # | Fehlt | Stand |
|---|---|---|
| 1 | EINE gemergte Nackt-Streiflicht-Bühne für jedes Werk aus dem Manifest (Kommando + Bilder, 4 Seiten + Iso) | halb: Bau in asset-worker-harness.cjs, Blick in 4 ungemergten samen/*-Bühnen (vier Fassungen derselben Idee) |
| 2 | Uhr/Sonnenwinkel als Regler der Bühne (Streiflicht, Gegenlicht, Dämmerung) | halb: `buehne(o.uhr)` kann es (welt-licht.js:1073), kein Studio reicht es durch; Nacht bricht laut (:1059-1060) |
| 3 | Der Stoff der Welt (studio-stoff `_foundryMats`, Saison, Narbe, Wind) im Studio | fehlt ganz (lebt nur als Methode der Stamm-Klasse) |
| 4 | Engine + Licht der Welt in fachwerk, koerperstudio, tetrapoda, portale, terrain | fehlt (5 von 7 Bild-Studios r128); Vorlage: garage/index.html:143-157 |
| 5 | Die Welt liest, was das Studio ändert (Fahrzeug: Epoche, Werk) | halb: Übergabe-Kanal `werk` da (huelle.js:1711), Verkehr baut ohne werk/Epoche (Befund Fahrzeug 21) |
| 6 | Kern-Fassung live tauschen (Gesetz ändern, Bild in Sekunden) | fehlt für Kerne; `werkbank methode` nur Stamm; Live-Tausch-Befund: 46 von 49 Lese-Stellen vorbei am Chokepoint; Stufe 1 „Platte fein“ freigegeben 13.11. |
| 7 | Arbeiter-Zugang zur Studio-Seite ohne Welt (Kommando wie `werkbank bild`) | fehlt: Arbeiter-Werkzeug ist werkbank = Welt-Boot; Studios nur im Browser bzw. in Gates (diag-garage-labor.cjs) |

## 5 Das UI

Heute (garage, die UI-Norm laut studio-vollendung.md:25): Bild zuerst; rechts eine Leiste ≤ 15 % (Probefahrt · Prüffahrt · Ansicht ·
Gattung · Epoche · Lack · Werkzeug · Lehren · Leicht, index.html:111-129); hinter „Werkzeug“ Sitzung, Kultur, Ebenen, 2 Ansicht-Regler,
Türen/Clay/Ergebnis, 16 Kern-Regler, Kosten-Leiste; hinter „Lehren“ Tafel + Legende; Tasten 1–9/0/X/N/T/K/P (:140). Die anderen Studios:
eigene Seiten mit eigenem Stil, gemeinsam nur die Hüllen-Bausteine (Regler-Zeilen, Sitzung, Kosten). Knöpfe je Seite (Zählung im Code):
terrain 50, koerperstudio 35, klang 26, garage 13, tetrapoda 13, schmiede 7, fachwerk 6 + 10 Auswahlen, portale 2. Eine Studio-Übersicht/
-Wahl in EINER Oberfläche gibt es nicht; der Zugang ist das Tor in der Welt oder die URL je Studio.
Ziel laut Gedächtnis: „Studio = MODUS der Welt-Engine … Profi-Muster UE Asset-Editor / Unity Prefab Mode; ‚in der Welt ansehen‘ ist ein
Knopf“ und die isolierte Bühne bleibt (studio-vollendung.md:22, :44-47); „UIs vereinheitlichen“ (:37); UI-Norm = garage (:25). docs/README.md
und docs/roadmap.md nennen kein UI-Ziel der Studios (grep). SYSTEMKARTE.md:207-210 (W3): „Das Studio kann die Brüche der Welt nicht
zeigen, darum werden sie in der Welt gefeilt“ — das ist der Befund hinter dem Wort des Schöpfers.

## Der kürzeste Weg (MEINE Lesart, kein Befund)
1. EINE gemergte Studio-Bühne als Kommando: Harness-Bau (asset-worker-harness) + das Licht `welt-licht buehne` mit Uhr + garage-Seite als Hülle; die vier samen-Bühnen fallen hinein.
2. Uhr-Regler + „nackt“ in die Hülle (huelle.js), damit JEDES Studio Streiflicht und Grau hat, nicht nur eines.
3. Die fünf r128-Studios auf die garage-Vorlage heben (index.html:143-157) — erst dann zeigt das Studio die Brüche der Welt.
4. Stoff der Welt als Baustein neben welt-licht.js, den Stamm und Bühne rufen; bis dahin bleibt die Welt nur für das Schluss-Bild.
