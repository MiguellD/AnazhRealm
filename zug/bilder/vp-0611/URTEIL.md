# Radeon-Vorprüfung 06.11. (vp-0611)

Basis main 3f1d4a5b. Kandidat je Zweig = main + `git merge --no-edit origin/<zweig>`. Gerät Radeon 890M, `werkbank start --echt`
(Port 7750/7751), je Seite EINE warme Welt, alle Blicke des Zweigs darin; je Zelle EIN Lauf (keine Serie, kein ABAB). Jedes Bild-Paar:
links main, rechts Kandidat, je Seite 637 px. Die Bilder habe ich selbst angesehen.

| Zweig | Urteil | Zahl | Bild |
|---|---|---|---|
| w12-verkehr | NICHT LANDEFÄHIG | 20 Wagen, 0 Karosserie-Überdeckung, 0 Fahrer auf dem Dach — aber nur 8–9 von 20 fahren ≥ 30 m in Minute 1 (60–90 s: 7 und 5), CPU-Takt 23 Uhr p50 16,5 → 37,3 ms | `verkehr-10-wagen-paar.png`, `verkehr-23-wagen-paar.png` |
| w12-menue | NICHT LANDEFÄHIG (knapp) | Texte < 16 px 40 → 0, Knöpfe ganz; `ueber` am Gerät 0 · 1 · 1 (Werkstatt · Hof · Bibliothek), erstes Ich 92 → 100 ms (Ziel 75) | `menue-werkstatt-material-1280-zoom.png`, `menue-*-paar.png` |
| w12-studio-buehne | NICHT LANDEFÄHIG | Welt deckungsgleich (Luma 87,5/87,5 und 31,4/31,4), Garage-Lack p95/p50 1,13 (main 2,11): kein Himmels-Reflex | `buehne-garage-iso-zoom.png`, `buehne-welt-*-paar.png` |
| w11-fahrzeug | OFFEN | Wiese bei 10 m/s wie main (Ruck p95 0,30/0,28 m, Höhe 0,50 m, Räder 30,6 rad/s), Hang nicht gemessen | `fahrzeug-garage-iso-paar.png`, `fahrzeug-fahrt-third-paar.png` |

## 1. w12-verkehr (11e7041d, Kandidat 96c1011d) — NICHT LANDEFÄHIG

stadt-voll (`umstellen --ort stadt-voll`, 1089 Bewohner), je Stunde: `_uhrSetzen`, `lauf 20 --regler voll`, dann 40 Proben im Sekunden-Takt
im echten Loop (15–55 s nach dem Uhr-Sprung).

| Zelle | Wagen | fuhren ≥ 30 m in 40 s | standen (< 2 m) | Karosserie in Karosserie (Paar-Proben, tiefste) | Sitz-Knochen außer der Kabine | Frame p50 / p95 / max | CPU-Takt p50 / p95 |
|---|---|---|---|---|---|---|---|
| main 10 Uhr | 7 | 4 | 1 | 81, 0,97 m (Wagen 0/4 bei 818/442) | 0 / 224 | 25,5 / 50,2 / 100,4 ms | 24,2 / 44,7 ms |
| Kandidat 10 Uhr | 20 | 9 | 11 | 0 | 0 / 215 | 25,1 / 41,9 / 100,6 ms | 17,2 / 37,4 ms |
| main 23 Uhr | 7 | 4 | 0 | 178, 1,16 m (Wagen 0/4) | 116 / 227 (Hüfte 1,91–1,96 m, Dach 1,42–1,44 m: AUF dem Dach) | 25,2 / 41,8 / 50,3 ms | 16,5 / 30,2 ms |
| Kandidat 23 Uhr | 20 | 8 | 10 | 0 | 0 / 239 | 41,7 / 58,5 / 133,9 ms | 37,3 / 55,9 ms |

Geheilt: 20 Wagen stehen (main 7), keine Karosserie steckt in einer anderen, kein Fahrer sitzt auf dem Dach — im Bild sitzen die Fahrer in
der Kabine (`verkehr-23-wagen-paar.png` rechts: grüner und blauer Wagen mit Fahrer am Steuer; links main: der Wagen ist aus dem Bild
gefahren, die Zahl trägt das Dach). `verkehr-10-wagen-paar.png`: links main der silberne Wagen im Heck des blauen, rechts der Kandidat frei.

Warum NICHT: (a) Von 20 Wagen fahren 15–55 s nach dem Uhr-Sprung nur 9 (10 Uhr) und 8 (23 Uhr) mindestens 30 m, 11 und 10 stehen
unter 2 m, obwohl ihr Zustand `faehrt` heißt (10 Uhr 17–18, 23 Uhr 20 von 20). Der Stau löst sich nicht: in einer zweiten warmen Welt
des Kandidaten, 60–90 s nach dem Sprung, fahren in 30 s nur 7 (10 Uhr) und 5 (23 Uhr) von 20 mindestens 30 m, 12 und 15 stehen
(Wagen 17 steht in beiden Welten um 10 Uhr auf 831,5/440,6, 5 m neben dem Spieler am Anker 836,2/438,5 — ob der stehende Spieler die
Kreuzung sperrt, trennt diese Sonde nicht; die Stadt muss um ihn herum fließen; im 23-Uhr-Fenster der zweiten Welt lief in den letzten
Sekunden ein swiftshader-Schuss, das 10-Uhr-Fenster war frei). (b) Die Nacht kostet doppelt: CPU-Takt p50 16,5 → 37,3 ms, Frame p95
41,8 → 58,5 ms, längstes Bild 50 → 134 ms (gleiche Welt, gleicher Ort, gleiche Sonde). (c) Der Übersichtsblick 28 m über dem Markt
(`bild 858.1 +28 460.2 …`) bricht am Kandidaten 2 von 2 ab: „DIE WELT STEHT NICHT nach 1865/1814 Takten — Fege-Takt nahWiese wartet,
nahStreu wartet"; an main entstand derselbe Blick 2 von 2. Verdacht: der Sim-Takt des Verkehrs je Bild mit 20 Wagen in
`stamm/siedlung-verkehr.js` (die Reihen-/Kopf-Suche mit `gesperrt` in der Warte-Liste je Wagen und Ort, `_verkehrSchritt`/`_tickVerkehr`)
frisst den Takt, die Fege-Takte der Nah-Wiese verhungern. Heilen: Kosten des Verkehrs-Takts an die Wagen im Schirm binden (ferne Wagen in
Stufen), die Warte-Kette ohne Quadrat-Suche; Beweis: CPU-Takt 23 Uhr ≤ main + 2 ms und ≥ 18 von 20 fahren in Minute 1, an der Radeon.

Hinweis: der Zweig verschiebt den Anker von stadt-voll in `spec/profiband/haushalt.json` (836,2/438,5 → 836,09/438,24); `umstellen` stellt
den Spieler an beiden Seiten auf 836,2/438,5.

Bild-Grenze: der Zoom um 23 Uhr links (main) zeigt keinen Wagen — er fuhr zwischen Sonde und Schuss aus dem Bild; ein zweiter Versuch mit angehaltenem `_tickVerkehr` blendete die Wagen ganz aus und ist verworfen.

## 2. w12-menue (c442981b, Kandidat bd9d730d) — NICHT LANDEFÄHIG (knapp: die Schrift ist geheilt, zwei Reste offen)

Wiese, eine warme Welt je Seite; zuerst das erste Öffnen (Tab ×4, B ×4, je 1,5 s rAF-Fenster), dann `werkbank bedienung --runden 3`,
dann je Fenster 1280×720 und 1920×1080 Werkstatt (B), Hof (K), Bibliothek (Reiter) mit `_schriftZensus()` und `schirm`.

| Maß | main | Kandidat |
|---|---|---|
| erstes Ich (Tab #1): längstes Bild / Bilder > 50 ms / Hörer | 92,1 ms / 2 / 49,8 ms | 100,4 ms / 4 / 2,2 ms |
| zweites Ich (Tab #2): längstes Bild | 75,3 ms | 67,0 ms |
| erste Werkstatt (B #1): längstes Bild / Hörer | 276,2 ms / 83,8 ms | 243,1 ms / 0,6 ms |
| INP Menü / HUD (`bedienung --runden 3`) | 88 / 72 ms | 64 / 88 ms |
| sichtbare Texte < 16 px (alle drei Tafeln) | 40 | 0 |
| `_schriftZensus().ueber` Werkstatt · Hof · Bibliothek (beide Fenster gleich) | (Linse fehlt) | 0 · 1 · 1 |

Im Bild geheilt: die Material-Knöpfe tragen jeden Namen ganz (`menue-werkstatt-material-1280-zoom.png`: links „Knochen/Schuppen" in
Kleinschrift, rechts zweispaltig KNOCHEN · SCHUPPEN · BRONZE ganz); „Verschmelzen" und „Empfangen" liegen getrennt
(`menue-bibliothek-schoepfen-1280-zoom.png`, Empfangen in eigener Zeile); der Hof zeigt „⚒ AUFTRAG…" mit Auslassung statt „AUFTRAC"
(`menue-hof-1920-paar.png`). Volle Tafeln: `menue-{werkstatt,hof,bibliothek}-{1280,1920}-paar.png`.

Offen (heilen): (1) `ueber` ist am Gerät nicht 0: Hof `#creature-list > div.creature-row > div.creature-row-main > span.creature-focus-caret`
„▸" ragt 13 px in 9 px (7 Zeilen), Bibliothek `div.feed-curate.feed-schoepfen > details.feed-tool > summary.feed-tool-head >
span.feed-tool-glyph` „⚓" 22 px in 20 — beide Kästen aus der Schrift-Größe (em) statt px; Datei-Verdacht `stamm/werkstatt-hud.js` /
das Tafel-CSS in `index.html`. (2) Die Bild-Spitze des ersten Ich ist nicht geheilt (100,4 ms, main 92,1, Ziel 75): der Hörer kostet nur
noch 2,2 ms, die Spitze liegt im ersten Bild nach dem Öffnen (GPU-Programme der Ich-Vorschau beim ersten Zeichnen) — vorbauen beim Boot
(`compileAsync` der Vorschau-Szene), Beweis `werkbank bedienung --echt` + dieses rAF-Fenster am Radeon ≤ 75 ms.

## 3. w12-studio-buehne (4ee6b341, Kandidat 7fec917a) — NICHT LANDEFÄHIG (Welt hält, Garage-Lack spiegelt nicht)

`diag-blick.cjs` je Seite: Welt 10 Uhr und 22 Uhr auf der Radeon (headless, echte GPU), Garage iso unter swiftshader (`LINSE_GPU=software`,
an beiden Seiten gleich — die Garage auf der echten GPU blieb an main 120 s im Warten stehen: „URTEIL AWAIT … gpu.createRenderPipeline").

| Blick | main | Kandidat |
|---|---|---|
| Welt 10 Uhr, Luma / σ | 87,5 / 48,9 | 87,5 / 48,8 |
| Welt 22 Uhr, Luma / σ | 31,4 / 32,2 | 31,4 / 32,2 |
| Garage iso, Bild-Luma | 9,6 | 92,1 |
| Garage iso, Lack-Pixel (blau) Luma Mittel / p50 / p95 | 92,5 / 83,7 / 176,6 | 46,6 / 47,5 / 53,9 |

Welt: deckungsgleich (`buehne-welt-10-paar.png`, `buehne-welt-22-paar.png`) — der Umzug nach `welt-licht.js` hält das Spiel.
Garage (`buehne-garage-iso-paar.png`, Ausschnitt `buehne-garage-iso-zoom.png`): der Wagen steht mit Schatten auf dem Grund der Welt, aber
der Lack bleibt matt-dunkel — p95 liegt nur 6 Luma über p50 (main: Faktor 2,1), auf Dach und Haube kein Himmels-Reflex, nur ein
schwacher Verlauf. Der benannte Mangel („der Lack muss den Himmel spiegeln") ist im Bild nicht geheilt; die 33 % „Himmels-Spiegel" der
Abgabe sieht das Auge nicht. Verdacht: die Umgebung der Bühne in `worlds/garage/garage.js` (Umgebungs-Stärke bzw. Rauheit des Lacks gegen
`umgebungLicht`/`himmelDerStoffe` aus `welt-licht.js`) — in der Isometrie sehen Dach und Haube den Himmel; dort muss der hellste
Lack-Pixel den Himmel tragen (Maß: Lack p95/p50 ≥ 1,6 am selben Blick, Bild-Paar dazu).

## 4. w11-fahrzeug (550ae013, Kandidat aa65a520) — OFFEN (Wiese und Labor ohne Befund, Hang nicht gemessen)

Wiese (Messort −280,4/−1045,6), Third, GT neben dem Spieler gesetzt, aufgestiegen, W gehalten und bei 9,5/10,5 m/s geschaltet; je Richtung
bis der Wagen steht; Statistik über die Proben bei 8–12 m/s (100 ms Takt). Labor: `diag-blick --studio garage --ansicht iso` (swiftshader,
an beiden Seiten gleich).

| Maß (8–12 m/s) | main | Kandidat |
|---|---|---|
| Tempo p50 | 9,73 m/s | 10,11 m/s |
| Höhe über dem Gesetz min–max | 0,495–0,506 m | 0,497–0,504 m |
| Kamera-Abstand min–max | 10,72–11,43 m | 10,77–11,36 m |
| Kamera-Ruck je 100 ms p50 / p95 / max | 0,029 / 0,283 / 0,412 m | 0,018 / 0,302 / 0,316 m |
| Raddrehung p50 | 28,9 rad/s | 30,6 rad/s |
| FOV p50 | 81,1° | 81,6° |
| Weg auf der Linie +x bis zum Halt | 115,9 m | 43,2 m (zwei Welten gleich) |
| Garage iso: Wagen-Anteil / Lack-Luma Mittel / p95 | 0,053 / 92,5 / 176,6 | 0,092 / 99,2 / 184,7 |

Ohne Befund: Kamera ruhig (Ruck wie main, Spitze kleiner), der Wagen liegt auf dem Boden, die Räder drehen mit dem Tempo, FOV wie main;
das Labor zeigt denselben Lack, den Wagen größer im Bild (`fahrzeug-garage-iso-paar.png`). Auf der Linie +x hält der Kandidat nach 43,2 m,
main fährt 115,9 m — die Werkbank nennt auf +x vom Messort die Natur-Wand bei ~39 m; ob main durch einen Stamm fährt oder der Kandidat
früher hängt, zeigt kein Bild dieser Prüfung (`fahrzeug-fahrt-third-paar.png`: beide nach der Fahrt an einem Stamm, 0 km/h).
Offen: der Hang — `__weltOrt("hang", …)` (Suchradius 800 m) führte weg vom warmen Ring, der GT wurde dort an main nicht gebaut („DIE WELT HÄNGT …
fahrzeug_gt nach 3601 Takten"); kein Bild in Fahrt (der Schirm-Schuss kam nach dem Halt). Hinweis: der Zweig ändert die eingefrorenen
Goldens (`spec/asset-contract/v1/golden/recipes.json` + Manifest-Hash) — nach Lehre 11 ein Vertrags-Akt.
