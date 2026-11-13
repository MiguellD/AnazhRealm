# 61 Aussenblick: wie führende Echtzeit-Renderer es lösen, woran wir scheitern

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
BILD = C:/Users/micha/AppData/Local/Temp/claude/fa3ae9100e9cef81/d8d2df10-ebf6-4cbd-9974-a3e064fbe5d4/scratchpad/
- `genom-spiel/gruppe.png` (= `dorf-main-0.5.png`, Dorf der Ankunft, Mittag): der Hang hinter dem Platz ist ein Teppich aus großen,
  flachen, gelbgrünen Zacken in vielen Lagen übereinander. Das Haus rechts ist ein glatter, heller Kasten. Der Himmel ist dunkles
  Marineblau bis an den Grat. Fast die Hälfte des Bilds sind gestapelte Flächen mit Ausschnitt (Zacken, Laub oben links und rechts).
- `wiese-mitte/heute-wiese.png` (Mess-Wiese, Augenhöhe): oben Kronen über Kronen, unten Halme über Halmen. Hier liegt fast jedes
  Pixel hinter mehreren ausgeschnittenen Schichten. Wie viele Schichten das sind, zeigt kein Bild (es gibt kein Überzeichnungs-Bild).
- Was es kostet: Radeon 890M Ego an der Wiese 37,5 ms GPU, Dorf Ego 22,05 ms (Rumpf origin/w28-wiese-fern 476a3ed9;
  `stamm/bild-kosten.js:1306`). Das Soll ist ≤ 12 ms (profiband.K3). Der Spieler bekommt die halbe Bildrate.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = .claude/worktrees/leib-kanon-urteil (main ec281422). Die fünf Anker-Themen, abgebildet auf SPIEL. Vier davon trägt schon ein Blatt:
| Thema | Stand der Technik (Quelle) | SPIEL | Blatt |
|---|---|---|---|
| Ferne Vegetation | Ghost of Tsushima: in der Ferne halb so viele, doppelt so breite Halme ([GDC 2021](https://gdcvault.com/play/1027214/contactUs), Sekundärquelle [GodotGrass](https://github.com/2Retr0/GodotGrass)); Tiefen-Vorlauf für Ausgeschnittenes in UE, Frostbite, Decima: Überzeichnung 8–15× → 1–2× ([Übersicht](https://app.cinevva.com/blog/2026-05-11-foliage-overdraw)) | `stamm/vegetation-wiese.js:574-588` | 11, 36 |
| Himmel/Belichtung | Hillaire 2020: Sky-View-LUT 192×108 ([EG](https://diglib.eg.org/handle/10.1111/cgf14050)); Sonne 100 000 lx am Zenit ([Frostbite 2016](https://media.contentapi.ea.com/content/dam/eacom/frostbite/files/s2016_pbs_frostbite_sky_clouds.pdf)) | `welt-licht.js:193-628` (Tafel 192×108 gleich), `:667-686` | 15 |
| Schatten-Kaskaden | Insomniac: Kaskade scrollen statt neu zeichnen, ~70 % der statischen Geometrie gespart ([SIGGRAPH 2012](https://advances.realtimerendering.com/s2012/insomniac/Acton-CSM_Scrolling(Siggraph2012).pdf)); CRYENGINE zeichnet gecachte Kaskaden erst am Rand neu ([Doku](https://cryengine.com/docs/static/engines/cryengine-3/categories/1114113/pages/21267738)) | alle Schatten an der Wiese 0,21 ms (GTX, 36-gpu-frame.md:27) | 16 |
| Kleidung | nicht recherchiert (siehe Ehrlich offen) | `koerper-core.js:254` | 02 |
| Programme/Kompilieren | TSL baut den Graphen beim Lesen, teuer ist der Pipeline-Bau ([Forum](https://discourse.threejs.org/t/tsl-how-can-i-ensure-a-tsl-node-materials-shader-only-gets-compiled-once/86524)); Unity verdoppelt die Varianten je Schalter ([Doku](https://docs.unity3d.com/2021.1/Documentation/Manual/shader-variants.html)) | `bild-kosten.js:549` (compileAsync baute synchron) | 34 |
Daraus folgt: nur EIN Hebel aus dem Aussenblick ist in keinem Blatt benannt. Es ist der Tiefen-Vorlauf, also die Pixel-Kosten jeder Klasse:
1. **Die Radeon ist durch Füllung begrenzt.** Nur das Sortieren vorn → hinten (`_zeichenFolge`, `bild-kosten.js:1299-1323`) brachte
   Genesis Ego 28,25 → 23,38 ms und Dorf Ego 27,27 → 22,05 ms (:1305-1306). Das Sortieren wirkt nur über den frühen Tiefentest.
2. **Fast jeder Stoff der Welt verwirft Fragmente.** Jeder Foundry-Stoff mit LOD-Blende bekommt `alphaTest` (`studio-stoff.js:635-663`,
   Schwelle :658). Ausgenommen sind wiegend, Mensch und Stein (:185). Das betrifft Rinde, Laub und Bauteile, also auch die *opaken*.
   Dazu kommen Blatt-Atlas :344, Schatten-Stoff :359, Fell-Schale :461, Klinge und Laub (`stoff-material.js:1744`, :1756),
   Karte :1439, jeder Studio-Bau-Stoff (`siedlung-bauten.js:1165-1183`, :1302), Tor (`siedlung-tor.js:79`) und Fern-Karte (`gelaende-fern.js:853`).
   Der Ausschnitt lebt in `colorNode.a` (Lehre 26, `studio-stoff.js:339-345`), der Licht-Pass trägt also das `discard`.
3. **Was `discard` kostet, hängt vom Gerät ab.** Auf vielen GPUs schaltet ein `discard` den frühen Tiefentest für den ganzen Draw ab
   ([Khronos-Wiki](https://wikis.khronos.org/opengl/Early_Z), [Mesa panfrost](https://lists.freedesktop.org/archives/mesa-commit/2021-March/116037.html)).
   Mindestens fällt der frühe Tiefen-*Schreib* weg ([MJP](https://therealmjp.github.io/posts/to-earlyz-or-not-to-earlyz)). In WGSL gibt es
   kein Attribut, das frühe Tests erzwingt. Die Abhilfe der Branche: ein Tiefen-Vorlauf mit Ausschnitt, danach Licht mit Tiefe GLEICH ohne `discard`.
4. **Ein Tiefen-Vorlauf existiert nicht** (Grep `Vorpass|depthPrepass|prepass` in stamm/: 0 Treffer). Dafür bricht der Hauptpass zweimal je
   Bild für das Tiefen-Abbild von Wasser und Feld-Pass (`copyFramebufferToTexture`, `bild-kosten.js:410`; `bild-sicht.js:172`, :2143). Das sind
   2,0 Neustarts mit 11,1 MB Neu-Laden je Bild (KO bericht/2110-profiband-k3/zerlegen.txt:41, zitiert nach 36-gpu-frame.md:118).
5. **Die Kosten liegen in den Fragmenten.** GTX-Zerlegung Wiese: Baum 3,53 ms (30 %), Karten 1,14 ms mit 1 Befehl, Boden 0,77 ms bei
   77k Dreiecken (36-gpu-frame.md:25-29). Am Kandidaten wiese-fern sanken die Dreiecke, die Ego-Zeit stieg 37,5 → 45,3 ms (476a3ed9).
KANN gegen KONSUMIERT: das Gesetzbuch kann den Ausschnitt schon als reine Tiefen-Variante. Der r184-Schattenpass baut je Objekt
einen Tiefen-Stoff aus `colorNode.a`, `alphaTest` und Knoten des Originals (`bild-kosten.js:293-301`, :478-511). Das Bild nutzt
diese Fähigkeit nicht: es beleuchtet jedes verdeckte Fragment voll und verwirft es erst danach.

## Die EINE begrenzende Entscheidung
**Jedes Pixel wird genau EINMAL beleuchtet.** Opakes und Ausgeschnittenes (Laub, Halm, Fell, Karte, LOD-Blende) legt seine Tiefe in
EINEM Tiefen-Vorlauf vor dem Licht. Dafür trägt der Vorlauf den Tiefen-Stoff je Objekt, wie ihn der Schattenpass schon baut.
Der Licht-Pass testet GLEICH und verwirft nie. Derselbe Vorlauf IST das Tiefen-Abbild für Wasser und Feld-Pass, deshalb fallen die zwei
Brüche im Hauptpass. Kein Soll und keine Schwelle wird bewegt, die LOD-Blende bleibt Gesetz des Stoffs (lod.K5).

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
**Vor dem Schnitt der Spike mit drei Fällen** in EINER warmen Welt, Dorf Ego und Wiese Ego, Radeon und GTX, `gpu-bank`, ohne neues Werkzeug:
(a) heute · (b) ein Test-Bau ohne LOD-Verwurf an opaken Stoffen (`xfade` für Rinde und Bau aus, `studio-stoff.js:185`) · (c) der Vorlauf.
Liegt (b) − (a) unter dem Rauschen und (c) − (a) über 1 ms, trägt die Entscheidung. Liegt beides unter dem Rauschen, ist der Hebel tot.
Er fällt dann offen mit der Zahl.
**Stufen (eine Welle):**
1. Der Vorlauf: die Bündel und die losen Opaken in der Reihe `_zeichenFolge`, nur Tiefe. Den Stoff baut das Gesetz des
   Schatten-Stoffs, das Objekt bleibt dasselbe. Es läuft KEIN `scene.overrideMaterial`, denn unter einem Override sammelt r184 keine Bündel
   (`bild-kosten.js:293-301`).
2. Der Licht-Pass: `depthFunc` GLEICH und `depthWrite` aus für jeden Stoff mit Vorlauf. Das `alphaTest` des Licht-Programms fällt, weil die Tiefe
   den Ausschnitt schon trägt.
3. Das Tiefen-Abbild: `_szeneTiefe` liest die Vorlauf-Tiefe. `copyFramebufferToTexture` (`bild-kosten.js:410`) fällt im Hauptpass
   und mit ihm die Abfrage-Wunde (1) (:404-426).
4. Alle Augen: Ego 1,7 m · Third 2,43 m · Hügel 12 m · Dach 25 m am Dorf, damit jede Höhe der Wiese denselben Vorlauf hat.
**Leser-Liste (wer liest, was geändert wird):**
- Reihe und Bündel: `bild-kosten.js:1299-1323`, :286-330.
- Verwurf: `studio-stoff.js:344`, :359, :461, :635-663; `stoff-material.js:1439`, :1744, :1756, :583-601 (Werfer mit Ausschnitt);
  `siedlung-bauten.js:1165-1183`, :1302; `siedlung-tor.js:79`; `gelaende-fern.js:853`.
- Tiefe als Eingang: TRAA-Bewegung aus der Szenen-Tiefe `bild-kosten.js:2134-2143`; Himmels-Maske der Farbsicht :2320-2326;
  Wasser und Spiegel `bild-sicht.js:755`, :935, :2143; Durchsicht der Kamera `studio-stoff.js:664-669` (maskNode nur im Bild-Pass).
  Sie gehört in den Vorlauf, sonst deckt ihre Tiefe.
- Durchsichtiges (Wasser `bild-sicht.js:1563`, Scheiben mit Deckkraft < 1 `studio-stoff.js:654-658`) bleibt ausserhalb des Vorlaufs.
**Kosten-Zeile:**
- Vertex-Arbeit des Opaken ×2 (heute 351k–366k Dreiecke).
- Befehle: heute 93–94 → bis ~188. Das ist unter dem K3-Soll 208, aber knapp.
- Programme: + die Tiefen-Varianten. Sie folgen den Signaturen des Schatten-Stoffs, also keine neue Familie. Die Zahl je Ankunft ist eine
  Pflicht-Zeile, weil B (Ankunft kalt 16,6 s GTX) sie zahlt.
- Gewinn: die Beleuchtung jedes verdeckten Fragments und zwei Pass-Brüche je Bild.
- Gebunden an den Schirm, nie an die Weltgrösse. Abgabe nur, wenn Ego/Third an Wiese und Dorf ≤ heute sind.
**Kriterien der Meisterkarte:**
- profiband.K3 (0 P): Ist GTX Wiese 12,99 ms, Radeon Ego Wiese 37,5 ms ↔ Soll GPU p95 ≤ 12 ms, Befehle ≤ 208. Station `werkbank band --ort`.
- profiband.K1 (0 P): p95 ≤ 33 ms je Zelle. Pflicht **E**: Genesis Third CPU 6,3 > 5,8 ms. Den Vorlauf zahlt die CPU als zweite Liste, er gehört in dieselbe Zeile.
- Bildpaar Dorf und Wiese an fester Kamera: das Bild muss gleich bleiben (byte-nah). Die Tiefe GLEICH darf kein z-Flimmern zeigen.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- Auf main ec281422 liegen die Bausteine: Zeichen-Reihe T3, Tiefen-Stoff je Objekt im Schattenpass, die Zerlegung je Klasse
  (`werkbank zerlegen`, 36-gpu-frame.md:96).
- Kein Zweig trägt einen Vorlauf. `foliageOpaqueCore: false` (dirigent-kern.js:833-836, zitiert nach 36-gpu-frame.md:116) ist ein
  geparkter Zwilling gegen die Laub-Überzeichnung. Er fällt im selben Schnitt.
- Bis zur Landung fehlen: der Spike (a)/(b)/(c) an zwei Geräten, der Vorlauf, das Bildpaar und eine Zerlegung vorher ↔ nachher an der GTX.
- Der Vorlauf hilft dem roten Kandidaten w28-wiese-fern (+7,3 ms Ego) direkt, weil der breitere Halm dann nur noch Tiefe kostet.
  Er ist aber keine Voraussetzung für 11-wiese.md.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- **Nichts davon ist gemessen.** Ob RDNA-3 und Pascal unter `discard` den frühen Test ganz verlieren oder nur den frühen Schreib, sagen
  die Quellen uneinheitlich (MJP gegen Khronos-Wiki). Das entscheidet erst Fall (b).
- Ob r184 WebGPU `depthFunc` GLEICH je Stoff und `@invariant` für die Lage trägt, habe ich nicht gelesen. Ohne `@invariant` können Licht- und
  Tiefen-Programm mit Wind (`positionNode`) um ein ULP auseinanderlaufen. Dann wird LESS_EQUAL nötig, oder die Lage muss byte-gleich gebaut sein.
- Nicht gelesen: `_szeneTiefe`, die Bündel-Aufnahme des Schattenpasses ganz, `dirigent-kern.js:833`, zerlegen.txt selbst (die Zahlen
  zitiere ich aus 36-gpu-frame.md).
- Kleidung in Stufen und Belichtungs-Wurzel: nicht recherchiert bzw. an 02 und 15 übergeben. Die Studie zu 4 404 cd/m² Zenit bei 38°
  ([Patch](https://gitlab.uliege.be/deal-public/pase/-/merge_requests/33.patch)) ist ein Konfig-Wert, keine Messung.
- Die Zahlen „8–15× → 1–2×" stammen aus einem Übersichts-Blog, nicht aus einer Primärquelle.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 4 im Takt (füllbegrenzte Radeon an Wiese und Dorf, jede künftige Bild-Abgabe bekommt Luft; im Bild 1) · Aufwand L (Spike S,
Vorlauf und Tiefen-Abbild M–L) · Risiko: die doppelte Vertex- und Befehls-Last und neue Programme können den Gewinn auf Pascal auffressen,
und z-Flimmern bei GLEICH. Fall (b) des Spikes entscheidet das, bevor ein Leser angefasst wird.
