# REFERENZ-ATLAS — die Architektur der Besten gegen unsere

Stand: main 53b2fc7a (V18.546.226), Meisterkarte 6fc7d524 (08.11.). `Datei:Zeile` gilt für 53b2fc7a, gelesen, nicht geraten; der Vendor
`vendor/three.webgpu.min.js` (r184) ist als Zeile:Spalte zitiert. Zahlen mit Commit oder Station sind gemessen, „Schätzung“ ist gerechnet.
Je Domäne: (a) Quellen · (b) Kern-Gesetz — die Invariante, die die Referenz garantiert · (c) unser Code · (d) die gemessene Lücke · (e) der
EINE Schnitt mit Machbarkeit in r184 und erwarteter Zahl · (f) der Brief-Baustein, den Arbeiter-Briefe wörtlich übernehmen.

**Befund:** Die Zweige setzen die *Ergebnisse* der Besten einzeln nach (≤ 1 px, Material-Instanz, Pipeline-Vorbau, „die Wahl hält über den
Weg“), nicht ihre *Architektur*. Darum kehren dieselben Klassen wieder: wo die Referenz je Zustandsänderung zahlt, zahlt unser Takt je
Instanz und Bild (Domäne 2), je erstem Zug (Domäne 3), je Person (Domäne 4) oder je Ort mit eigener Regel (Domäne 5).

| # | Klasse (gemessen) | Invariante der Besten | Der EINE Schnitt | erwartet | Richter |
|---|---|---|---|---|---|
| 1 | Pop am Wechsel: Haus 2,30 px, Tor 7,8 px | Fehler ≤ 1 px am Schirm, Kosten ∝ Pixel (Nanite) | Die Kette folgt dem Fehler | lod.K5 ≤ 1 px je Klasse | lod.K5 · profiband.K3 |
| 2 | `_passSicht` 10–12,5 ms im Gang | CPU zahlt je Änderung, die GPU wählt (Haar/Aaltonen) | EINE GPU-Wahl für jede Instanz | `_passSicht` ≤ 2 ms (Schätzung) | profiband.K2 · gate:geh-zerlegung |
| 3 | Knoten-Bau 2,9–4,2 s vor dem Bild, 92 ms im Bild | Kein Programm entsteht am Zug (UE PSO-Precache) | Der Programm-Katalog | Bau im Bild 92 → 0 ms | ankunft.K5 · leib.K1 |
| 4 | Leib = ein Guss je Person, 8 Gestalten je Siedlung | Körper = Punkt in EINEM Raum (SMPL) | EIN Leib-Raum | Güsse je Person → 0 | mensch.K4 · ankunft.K1 |
| 5 | Verkehr: je Ort eine Regel, 400 s Stau, 0,08 m | Vorfahrt = Raum-Zeit-Reservierung (Dresner & Stone) | EINE Reservierung je geteiltem Raum | Berührungen 0 | pflicht.C |

---

## 1 · LOD · Ferne · Vegetation

**(a)** Karis, Stubbe, Wihlidal: [A Deep Dive into Nanite Virtualized Geometry](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf)
(SIGGRAPH 2021) · Epic: [Nanite Foliage](https://dev.epicgames.com/documentation/unreal-engine/nanite-foliage) (UE 5.7, experimentell: Assemblies,
Skinning für Wind, Voxel für die Ferne) · van Muijden: [GPU-Based Run-Time Procedural Placement in Horizon Zero Dawn](https://www.guerrilla-games.com/media/News/Files/GDC2017_VanMuijden_GPUBasedProceduralPlacementInHorizonZeroDawn.pdf) (GDC 2017).

**(b)** Nanite: jede gezeichnete Geometrie weicht höchstens 1 Pixel von der Quelle ab, und die Dreiecke folgen den Pixeln, nicht der Zahl der
Objekte — es gibt keinen Wechsel, den das Auge sieht, und kein Hand-Budget je Stufe. Horizon: Platzierung ist eine reine, lokal stabile
Funktion von Dichte-Feldern, auf der GPU ausgewertet.

**(c)** Das Gesetz des Wechsels steht schon am Schirm: `_wechselGesetz` (`stamm/vegetation-streu.js:2882`) rechnet den Abstand, an dem der
Fehler der Stufe `LOD_SCHIRM.px` = 1 Bildpunkt trägt (Fehler-Tafel `:2860`, Brennweite 704 px bei 1080 Zeilen und 75°) — und kappt ihn mit
`Math.min(…, h)` am Haushalt des Buchs. Die Kette hat feste Stufen: Haus L0 132 000 · L1 44 000 · L2 7 250 · L3 96 Dreiecke
(`fachwerk-core.js:97-100`), Baum L0/L1/Karte (`phyto-core.js:2067 stufenRezept`), Leib L0–L3 (`koerper-core.js:48`). Der Sprung wird
verdeckt, nicht vermieden: Dither-Blende `lodCrossfadeMask` (`phyto-core.js:3201`), Hysterese `_stufeNachGrenzen` (`stamm/siedlung-bauten.js:3149`).
Die Werkzeuge für mehr liegen da: QEM-Kollaps nach Garland-Heckbert im Ofen (`foundry-core.js:6482 __huelleKollaps`, dasselbe Maß, mit dem
Nanite vereinfacht), die Karte mit Hebungs-Ringen −20/0/40/80° (`foundry-core.js:773`, Brucks' [oktaedrische Impostoren](https://shaderbits.com/blog/octahedral-impostors/)
als Ringe) und Tiefe je Texel (`phyto-core karteTiefe`).
**Gleichauf mit der Referenz:** der Boden morpht nach CDLOD ([Strugar 2010](https://github.com/CarsF/CDLOD)) im Band vor jeder Grenze
(`stamm/gelaende-boden.js:2980 BODEN_STUFEN`); die Ferne hat keine Kante (ferne.K2: Restkontrast 1,0–1,3 % bei 17–22 km, GTX b3f9ae95) und
trägt Koschmieder je Kanal (ferne.K1 GTX T/T_soll 0,86–1,08); die Karte hält jede Hebung (lod.K3 GTX: Deckung 0,97–1,00 von −20° bis 80°).

**(d)** lod.K5 (Fehler ≤ 1 px am Wechsel) 0 Punkte: Haus 4,45 → 2,30 px (Radeon, 8412c007), Tor 7,8 px (Befund 08.11.). Die Wurzel ist
rechnerisch: die L2 des Tors trägt laut Tafel einen Fehler ≥ 0,34 bei Welt-Skala 1 (`:2860`, „nie ≤ 1 px: untere Schranke“), 1 px verlangte
den Wechsel erst ab 0,34 · 704 ≈ 239 m — der Haushalt des Buchs wechselt früher, weil der Kette zwischen L1 und L2 eine Stufe fehlt.
lod.K1 (Umriss, laub-kante 0,2635 > 0,22) 0 Punkte; vegetation.K3 (Wald von innen) 0. Feststeck der Meisterkarte: 174 Commits
laub/krone/impostor polierten die Karte an einer Pose.

**(e) Schnitt: Die Kette folgt dem Fehler.** Der Ofen baut je Art die Stufen per QEM so lange, bis jede ihren Vorgänger bei ≤ 1 px ablöst —
die Zahl der Stufen folgt der Gestalt (2 bis 6), nicht der Tafel L0/L1/L2; jede Stufe trägt ihren gemessenen Fehler im Rezept. Der Wechsel
fällt am Abstand `e · f / px`, ohne Kappung; das Budget hält die Kette selbst, weil die Dreiecke je Stufe mit der Bildfläche fallen (Lehre 19,
Gebot 7). Gewählt wird je Instanz im Compute von Schnitt 2. **Warum nicht der Cluster-DAG:** unsere Gestalten sind < 64 m (die Quelle der
Domäne GESTALT), innerhalb eines Objekts schwankt der Abstand kaum; WebGPU kennt keine 64-Bit-Atome, ohne Software-Raster trägt Nanites
Mikro-Dreieck-Vorteil nicht ([nanite-webgpu](https://github.com/Scthe/nanite-webgpu) zeigt den DAG in WebGPU, ohne Streaming); der Boden
hat seinen DAG schon als CDLOD. Der Voxel-Ferne von Nanite Foliage entspricht bei uns die Karte mit Hebung — sie bleibt die letzte Stufe.
**r184:** beliebig viele Stufen kosten keine Programme — jede Stufe ist ein Bereich im Lager der Arena und ein weiterer indirekter Zug
(`geometry.setIndirect` three.core 6:100085, `indirectOffset` als Liste → N × `drawIndexedIndirect` 6:610918). **Erwartet:** lod.K5 jede Klasse
≤ 1 px; Kosten je Lücke eine Zwischenstufe, am Start-Dorf ≤ +80k Dreiecke (Schätzung: 42 Häuser × ≤ 2k im Ring 81–280 m) gegen das Band 680k.

**(f) Brief-Baustein:**
> REFERENZ LOD (Nanite-Invariante): Ein Stufenwechsel trägt höchstens 1 px Fehler am Schirm (`_wechselGesetz`, `LOD_SCHIRM.px`). Fehlt der
> Kette eine Stufe, baut der Ofen sie aus dem QEM-Kollaps (Lehre 19) — nie kappt ein Haushalt den Abstand, nie verdeckt ein breiteres Blend-Band
> den Sprung. Die Stufe wählt die GPU je Instanz (Schnitt 2), nie der CPU-Takt. Richter in derselben Sitzung: lod.K5 (Chamfer am Wechsel)
> UND profiband.K3 (≤ 680k Dreiecke).

---

## 2 · CPU-Takt · GPU-getriebenes Rendern

**(a)** Haar & Aaltonen: [GPU-Driven Rendering Pipelines](https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf)
(SIGGRAPH 2015) · Wihlidal: [Optimizing the Graphics Pipeline with Compute](https://gdcvault.com/play/1023109/Optimizing-the-Graphics-Pipeline-With)
(GDC 2016) · Burns & Hunt: [The Visibility Buffer](https://jcgt.org/published/0002/02/04/paper.pdf) (JCGT 2013).

**(b)** Die CPU zahlt je Zustandsänderung, nie je Instanz und Bild: die Instanzen liegen auf der GPU, ein Compute je Ansicht prüft
Sichtbarkeit und Stufe, verdichtet die Treffer und schreibt die Zug-Argumente — ein Bild kostet die CPU O(Pässe × Züge), nicht O(Instanzen).

**(c)** Die Architektur steht zur Hälfte, und das ist der Kern dieses Atlas: die **Arena** (`stamm/stoff-instanz.js:545-601`) hält je Stoff
EIN Lager für Vertex und Index und zieht alle Gestalten aus EINEM Render-Objekt als N `drawIndexedIndirect` — Wihlidals Mega-Puffer, mit
Prüfung von `indirect-first-instance` (`:698 _arenaKann`). Die **GPU-Wahl** (`stamm/bild-kosten.js:3340 _instanzWahlGpu` → `:3360
_wahlRechnen` → `:3746 PASS_WAHL_WGSL`) prüft je Kamera jede Instanz gegen das Frustum und im Kaskaden-Pass ihre Licht-Kapsel, verdichtet per
`atomicAdd` und liest `matrizen[liste[instance_index]]` — Haar/Aaltonen samt Werfer-Cull. Aber sie gilt nur für den Gang-Satz:
`_instanzWahlArt` (`:3233`) gibt „gpu“ allein bei `aGang`. Pflanzen-Stufen und Karte wählt die CPU je Instanz und tauscht Slots
(`:2932 _instanzWahlPass`, `_archGroupTausch`), die Stufe wechselt der CPU-Takt mit höchstens 4 Umzügen je Takt (`stamm/vegetation-streu.js:1097
_tickScatterLod`), und die Nah-Wiese schreibt je Büschel 16 Zahlen und den Ton aus der CPU in ihre Senken (`stamm/vegetation-wiese.js:1256-1285`
in `_nahWieseSicht :1216`). **Gleichauf:** Mega-Puffer, indirekter Zug und Werfer-Cull je Kaskade wie bei Haar/Aaltonen; FrameGraph
([O'Donnell 2017](https://gdcvault.com/play/1024612/FrameGraph-Extensible-Rendering-Architecture-in)) brauchen wir nicht — der Frame zieht
112 Befehle (f33c71c2, Band 208), der Takt hängt an der Arbeit je Instanz, nicht an der Ordnung der Pässe.

**(d)** profiband.K1/K2 0 Punkte; Radeon gehend 70 % der Bilder > 33 ms, in Fahrt 100 % (profiband.K4, e475c6b4); GTX CPU-Takt stehend
p95 4,7–6,3 ms gegen 5,8 (PFLICHT E), gehend 19–21 ms, in Fahrt 31 ms. Im Gang trägt `_passSicht` Mitte 10–12,5 ms, darin `_nahWieseSicht`
6,4–6,6 ms GTX, nach w23-geh-takt 1,5 ms Radeon, die Instanz-Wahl 1,8 → 0,9 ms (w20-leib-takt), dazu der Planer `_tickNahWiese` 2–5 ms
(cf51c30c). Vier Wellen (Welle C, K71/K72, w20-leib-takt, w23-geh-takt) setzten Hysteresen auf O(N)-Arbeit; die eine, die sie auf die GPU legte, nahm der
Klasse Bewohner 55 %: 436 760 → 197 857 Dreiecke, der Frame 885k → 644k (gpu-wahl-bau f33c71c2, Radeon stadt-voll).

**(e) Schnitt: EINE GPU-Wahl für jede Instanz.** `_instanzWahlArt` gibt „gpu“ für jede globale Instanz-Gruppe — Pflanzen-Stufen, Karte,
Streu, Nah-Wiese. Die Instanz-Daten (Matrix, `aH0`/`aKarte`, Ton) stehen im Speicher-Puffer der Arena und werden nur bei Geburt, Tod und
Bewegung geschrieben; die Familie einer Art (Stufen und Karte) teilt EINEN Instanz-Puffer. `PASS_WAHL_WGSL` lernt das Fenster der Stufe — die
EINE Blende `lodCrossfadeMask` als WGSL, bitgleich gegen phyto-core geprüft wie die Karten-Ablage `KARTE_RECHNER_WGSL` — und schreibt jede
Instanz in die Liste ihrer Stufe. Die Nah-Wiese wird Daten: eine Kachel legt ihre Büschel EINMAL in die Arena, der Compute wählt L1, L2 und
Ferne je Büschel nach `_nahStufe` (Tsushima: die Kachel ist Daten, die GPU wählt). Es fallen `_instanzWahlPass`, `_instanzWahlWeg`, der
Stufen-Umzug in `_tickScatterLod`, `_nahWieseSicht` und `_nahWieseFernSatz`; der Bau einer Kachel bleibt CPU-Arbeit bei ihrer Geburt.
**r184:** der Weg ist gebaut und ausgeliefert (roher WebGPU-Compute in `_wahlRechnen`, Liste je Kamera, Instanz-Knoten `_senkenKnoten`
`stamm/stoff-instanz.js:444`); WebGL2 zeichnet weiter über den Zeichner. Der Vendor trägt dazu `IndirectStorageBufferAttribute` (6:113089) und
TSL-`compute` mit `atomicAdd` (6:279004) — wir brauchen sie nicht, der rohe Compute schreibt in den Auftrags-Puffer der Arena.
**Erwartet:** `_passSicht` 10–12,5 → ≤ 2 ms im Gang (Schätzung: übrig bleiben Lage und Aufträge je Arena wie heute beim Gang-Satz),
`_tickNahWiese` 2–5 → ≤ 0,5 ms, GTX CPU-Takt stehend ≤ 5,8 ms (E).

**(f) Brief-Baustein:**
> REFERENZ CPU-TAKT (Haar/Aaltonen, Wihlidal): Die CPU zahlt je Zustandsänderung, nie je Instanz und Bild. Sichtbarkeit, Stufe und Zug-Argumente
> entstehen im EINEN Compute der Pass-Wahl (`PASS_WAHL_WGSL`, `_instanzWahlGpu`); eine neue Schleife über Instanzen im Takt, eine neue
> Hysterese „hält über den Weg“ ist ROT. Instanz-Daten schreibt nur Geburt, Tod oder Bewegung. Richter: profiband.K2 (Belegung je Bild) und
> gate:geh-zerlegung, vorher ↔ nachher an derselben Pose, Bild byte-gleich.

---

## 3 · Ankunft · Streaming · Pipeline-Bau

**(a)** Epic: [PSO Precaching](https://dev.epicgames.com/documentation/en-us/unreal-engine/pso-precaching-for-unreal-engine) (UE 5) ·
Epic: [World Partition](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine) · van Waveren:
[id Tech 5 Challenges](https://www.quaddicted.com/webarchive/mrelusive.com_20170131/publications/presentations/2009_siggraph/05-JP_id_Tech_5_Challenges.pdf)
(SIGGRAPH 2009, Virtual Texturing und Jobs).

**(b)** Kein Bild wartet auf Übersetzung: der Shader entsteht beim Kochen, die Pipeline beim Laden des Inhalts auf Hintergrund-Fäden; fehlt
sie beim Zug, wird der Zug übersprungen (UE `r.PSOPrecache.ProxyCreationWhenPSOReady`). Der Arbeitssatz ist, was der Schirm braucht
(id Tech: die Rückmeldung des Bilds bestellt die Seiten; World Partition: Abstand zur Streaming-Quelle), und Laden schreitet nur voran.

**(c)** Die Laufzeit-Hälfte von UE steht: die Erst-Zeichnung (`stamm/bild-kosten.js:499`, das ersetzte `_renderObjectDirect`) baut jede
Pipeline asynchron (`zeichne` `:463`, r184 `createRenderPipelineAsync` 6:590400) und überspringt den Zug, bis sie steht (`_erstWartet`);
`_erstAbsageWache` (`:885`) macht eine abgesagte Pipeline laut, die r184 verschluckt — besser als der Vendor; `_graphTeilen`
(`stamm/studio-stoff.js:27`) ist Unreals Material-Instanz (EIN Programm je Signatur). Die Koch-Hälfte fehlt: die Übersetzung TSL → WGSL
läuft beim ersten Zug im Haupt-Faden (`:614-623` → `_knotenRate :722`), in Raten je Fluss-Knoten (`:773-788`) — genau die Körnung von r184
`buildAsync` (6:368940, `await` nur zwischen Fluss-Knoten). `compileAsync` (6:410083) baut die Knoten synchron (`:450`), es bringt nichts.
Ein Worker kann TSL nicht übersetzen: die Graphen sind Closures des Stamms, die Bindungen zeigen auf lebende Knoten.

**(d)** ankunft.K1/K3/K4/K5 0 Punkte. Radeon t(Kontrolle) kalt 12,95 s, Haupt-Faden belegt 10,58 s (Soll ≤ 4), GTX in derselben Probe
22,68 / 19,84 s (19190c25). Vor dem Weltbild: Knoten-Bau 2,9–4,2 s für 39 Programme, Jobs 3,6–5,4 s, Bild 3,5–4,9 s, V8 0,7–1,4 s (9c275ca8); die
Programme sind riesig — Boden-Satz 140 000 Zeichen WGSL, Laub 95 818, Karte 69 129. Nach dem Weltbild: Leib und Tiere bauen beim ersten Zug in
der Latenz-Reihe Σ 1,4–2,9 s (af6f1703), ein Schritt hält bis 90 ms (`:716`), `_knotenRate` bis 92 ms im Bild. Gegen „Laden schreitet nur
voran“: die Ferne der Wiese fiel bei verstrichener Frist auf null und begann neu — 11 von 860 Kacheln nach 3 000 Takten (w24-rueckfall-ruhe,
nachher 860/860). Feststeck: ≥ 8 Ankunfts-Wellen, je 0,3–1 s.

**(e) Schnitt: Der Programm-Katalog.** Die Menge der Programme ist eine Funktion des Gesetzes — Bau-Schlüssel = Signatur × Vertex-Form × Pass
(`getForRenderCacheKey`, `:843`), heute 39 bis zum Weltbild. EIN Katalog dieser Schlüssel wird vom kalten Boot aufgezeichnet (UEs gebündelter
PSO-Cache) und als Datei mit `?v=` versioniert; der Bau eines Eintrags startet, wenn sein Inhalt sich anmeldet (Lieferung der Foundry, Stoff),
in der Reihenfolge des EINEN Rangs — nie am Zug. Nach dem Weltbild ruft `_renderObjectDirect` `_knotenRate` nie mehr: ein ungebautes Programm
heißt Zug überspringen und „KATALOG-LÜCKE <Signatur>“ ROT. Jeder Eintrag trägt seinen längsten Bau-Schritt; über 16 ms ist ROT beim Namen
— der Graph wird geteilt, bis jede Stufe trägt (die Kandidaten nennt (d)). **r184:** der Mechanismus steht — der Vorbau baut ohne Zug
(`:523-550`, `_vorbauWahl :698`), der Katalog weitet ihn von Arena und Gast auf jeden Schlüssel. **Erwartet:** Knoten-Bau im Bild nach dem
Weltbild 92 → 0 ms aus Konstruktion; leib.K1 ohne die 1,4–2,9 s der Leib- und Tier-Bauten. B fällt damit allein nicht: es braucht dazu die
Schritt-Grenze (Schätzung: 39 × ≤ 35 ms ≈ 1,4 s statt 2,9–4,2 s) und Schnitt 2 für die 3,5–4,9 s Bild unter dem Ladeschirm.

**(f) Brief-Baustein:**
> REFERENZ PIPELINE (UE PSO-Precache): Kein Programm entsteht am Zug. Ein neuer Stoff, eine neue Vertex-Form oder ein neuer Pass ist ein Eintrag
> im Programm-Katalog, gebaut, wenn sein Inhalt sich anmeldet, in der Reihenfolge des EINEN Rangs; fehlt er, wird der Zug übersprungen und
> die Lücke ROT beim Namen. Kein Bau-Schritt über 16 ms. `compileAsync` ist kein Werkzeug (r184 baut die Knoten synchron). Ein Bau unter
> Frist behält seinen Fortschritt — wer bei verstrichener Frist auf null fällt, ist ROT. Richter: ankunft.K5 (belegt, längste Aufgabe) und leib.K1.

---

## 4 · Körper

**(a)** Loper, Mahmood, Romero, Pons-Moll, Black: [SMPL: A Skinned Multi-Person Linear Model](https://smpl.is.tue.mpg.de/) (SIGGRAPH Asia
2015) · Epic: [MetaHuman DNA — Rig-Definition](https://dev.epicgames.com/documentation/metahuman/metahuman-dna-rig-definition-and-rig-operation) ·
Epic: [MetaHuman LOD-Spezifikation](https://dev.epicgames.com/documentation/en-us/metahuman/platform-support-and-lod-specifications-for-metahumans).

**(b)** SMPL: ein Körper ist ein Punkt in EINEM Raum — feste Topologie, Form = Vorlage + Σ β·Formziel, Gelenke = lineare Funktion von β,
Pose per Linear-Blend-Skinning mit festen Gewichten; eine neue Person kostet zehn Zahlen, keine Geometrie. MetaHuman: EINE Rig-Definition für
jede Figur, 8 Stufen fester Topologie mit gekappten Einflüssen (12 / 8 / 4 Gelenke je Ecke).

**(c)** Jede Person ist ein eigener Guss: Genom (`stamm/koerper-leib.js:10`) → Dials (`:65`) → Teile-Baum aus Kugeln und Zylindern
(`koerper-core.js:1681 bauMensch`, nichtlinear `:1457 labMorph`) → der Ofen gießt eine SDF-Haut per Surface-Nets (`foundry-core.js:8474
bakeMenschInstance`, `:6877 __leibHaut`), rechnet Gewichte 1/d⁴ über 15 Knochen (`:6050`, `:8616`) und kollabiert per QEM (`:6482`) auf
L0 40 000 · L1 14 000 · L2 1 700 · L3 360 Dreiecke (`koerper-core.js:48`). Formziele gibt es keine (Morph abgewiesen
`stamm/koerper-leib.js:1042`, die Arena nimmt keinen `stamm/stoff-instanz.js:726`); die Menge trägt 8 Gestalten je Siedlung
(`stamm/siedlung-bewohner.js:3209`), jede ein eigener Guss. **Besser als die Referenz:** der Gang ist ein Gesetz nach Froude für jede Größe und Gattung
(`tetrapoda-core.js:1410 gangSchritt`, IK `koerper-core.js:4440`) statt einer Clip-Datenbank; die Menge skinnt auf der GPU aus einer
gebackenen Pose-Tafel (`stamm/stoff-gang.js:15/:348`, 16 Phasen) — 1 094 Köpfe im Takt 0,748 ms (mensch.K4#2); Haut und Gewichte rechnet der
Ofen ohne Künstler.

**(d)** mensch.K4 an beiden GPUs ungemessen (headless GRÜN: 50 aus 50 Samen, 0 Paare unter 1 px, aber 8 Typen); leib.K1 (Latenz) 0, gehend
51–72 ms mit Leib- und Tier-Bau in der Reihe (af6f1703); der Leib liegt auf dem Ankunftspfad (kalt 10,92 → 6,12 s nach b5-lieferung,
Leib-L0 4,4 s Worker-Detail, SYSTEMKARTE W5); der Stadt-Gipfel trägt nach der GPU-Wahl 197 857 Bewohner-Dreiecke (f33c71c2).

**(e) Schnitt: EIN Leib-Raum.** Der Ofen gießt je Stufe EINE Vorlage an den Mittel-Dials, dazu je Dial ihr Formziel (die Differenz des Gusses bei
+1, auf die Ecken der Vorlage übertragen) und ihr Gelenk-Delta (J(β) linear) — derselbe Ofen, dieselbe QEM-Kette, einmal je Gesetz-SHA, auf der
Platte. Jede Person ist ihr β im Speicher-Puffer der Arena; der Vertex rechnet Vorlage + Σ β·Formziel, ein Compute je Bild die Knochen-Matrizen
aus Pose und J(β) (15 × N). Kleid und Haar sind Vorlagen auf demselben β (MetaHuman: Groom und Kleidung auf dem geteilten Rig); die Tiere
erhalten je Gattung denselben Raum (SMAL, Zuffi et al. 2017, das Tier-SMPL). **r184:** keine three-Morphs (die Arena weist sie ab) — die
Formziele liegen als Speicher-Puffer und werden im positionNode gelesen wie `_senkenKnoten().gang` heute; der Knochen-Compute läuft wie
`_wahlRechnen`. Speicher: L2 ≈ 900 Ecken × 10 Dials × 12 B ≈ 108 KB, L0 ≈ 2,4 MB, einmal. **Erwartet:** Güsse je Person 1 → 0 (4 Vorlagen
je Gesetz-SHA), jede Person eigen statt 8 Gestalten je Siedlung, der Leib-Guss verlässt den Ankunftspfad (die Vorlage kommt von der Platte).

**(f) Brief-Baustein:**
> REFERENZ KÖRPER (SMPL, MetaHuman): Ein Körper ist ein Punkt im EINEN Leib-Raum — Vorlage je Stufe, Formziele und Gelenk-Deltas je Dial aus dem
> Ofen, die Person ist ihr β. Ein neuer Guss je Person, eine neue „Gestalt“ als Geometrie oder ein Morph-Attribut neben der Arena ist ROT.
> Gang bleibt das Froude-Gesetz (`gangSchritt`). Richter: mensch.K4 (Gestalt-Distanz je Samen-Paar, Kosten je 50) und ankunft.K1.

---

## 5 · Stadt · Verkehr

**(a)** Parish & Müller: [Procedural Modeling of Cities](https://dl.acm.org/doi/10.1145/383259.383292) (SIGGRAPH 2001) · Müller, Wonka et al.:
[Procedural Modeling of Buildings](https://www.doi.org/10.1145/1141911.1141931) (SIGGRAPH 2006, CGA) · Dresner & Stone:
[A Multiagent Approach to Autonomous Intersection Management](https://cs.utexas.edu/~aim/papers/JAIR08-dresner.pdf) (JAIR 2008).

**(b)** Stadt: ein Netz wächst aus globalen Zielen unter lokalen Bedingungen, dann teilt eine Grammatik Block → Parzelle → Masse → Fassade, jede
Ebene liest die über ihr. Verkehr: eine Kreuzung ist eine Raum-Zeit-Tafel — ein Wagen fährt nur ein, wenn seine ganze Durchfahrt reserviert
ist; die Kollisionsfreiheit folgt aus der Reservierung, nicht aus einer Regel je Ort. Folgefahrt nach dem
[Intelligent Driver Model](https://arxiv.org/abs/cond-mat/0002177) (Treiber 2000).

**(c)** Die Stadt wächst: `strassengraph` (`fachwerk-core.js:4309`) treibt Triebe in 3-m-Schritten mit Krümmung, rastet ein, schließt Zyklen;
`trasseLenk` (`:3723`) hält jede Gasse ≤ 9 % Steigung; die Häuser reihen sich an der Straßenfront mit OBB-Trennung (`:4489-4530`), das Haus ist
ein Parameter-Vektor über 32 Teilsysteme (`:155 HAUS`), keine Split-Grammatik — anders, nicht schlechter gemessen; die Wege sind eine
RG8-Karte in zwei Stufen (`stamm/siedlung-wege.js:460`). **Besser als die Referenz:** CityEngine braucht Eingabe-Karten von Hand, unser
Netz kommt aus dem Gesetz mit Plan-Hash Studio = Welt; siedlung.K2–K5 GRÜN (Zipf ζ 1,022 über 8 Saaten, Gassen-Gefälle p95 ≤ 9,5 %, das
erste Haus nach 62–305 ms). Der Verkehr hat Spuren (`fachwerk-core.js:3987 verkehrsNetz`, zwei je Strecke, Abbiege-Bögen 5,5 m,
`konflikt`-Paare `:4115`), echte Fahr-Physik und Bewohner am Steuer (`stamm/siedlung-verkehr.js:308`). Vorfahrt aber ist eine Sammlung
von Orts-Regeln: Zonen-Kette mit Warteschlange (`:1404 _verkehrZonen`), Richtungs-Schlüssel der Enge, Kapazität der Schleife (`:306`),
Abstand als Bremsdeckel √(v₀² + 2b(gap − s₀)) (`:1198 _verkehrFolge`).

**(d)** pflicht.C 0 (keine Station misst Bewohner am Steuer). w23-verkehr (e723c7a4): das knappste Paar je Stunde 0,08–0,19 m → 0,26–0,35 m
an der Wende — durch eine neue Regel für die Wende; ohne die Schleifen-Regel Gridlock 7 Halter / 671 s; offen ein Wagen 400 s in der
Kreuzung am Markt, weil ein Bewohner keinen Platz machte, und eine Fahrt 501 s an einer West-Wende. Jede neue Geometrie bekam ihre Regel —
das ist die Klasse. E an der Stadt: der Frame stadt-voll 644k Dreiecke (Band 680k, f33c71c2), w25-stadt-takt am 08.11. ROT in
gate:geh-zerlegung — das trägt Schnitt 2, nicht die Stadt.

**(e) Schnitt: EINE Raum-Zeit-Reservierung für jeden geteilten Raum.** Jede Fläche, die zwei Bahnen teilen — Kreuzung, Wende, Enge, Schleife,
Querung, Tür-Vorplatz —, ist eine Tafel aus Zellen (≈ 1 m) × Zeit-Scheiben (≈ 0,25 s), erzeugt aus dem Spuren-Graphen (die `konflikt`-Paare
werden die Zellen, die sie teilen). Ein Wagen reserviert seine ganze Durchfahrt samt Ausfahrt aus seiner Bahn unter dem IDM-Profil, ein
Bewohner, der quert, reserviert dieselben Zellen; die Tafel ist die einzige Vorfahrt. Zonen-Kette, Richtungs-Schlüssel, Schleifen-Kapazität
und die Ausnahme `_bewohnerPlatz` gehen in ihr auf; Stau-Freiheit, weil nur reserviert, wer bis hinter die Fläche frei hat (die Bedingung der
Zonen-Kette, als Gesetz), Reihenfolge nach Ankunft mit Alterung. Die Tafel ist eine reine Funktion im Kern (`fachwerk-core` oder `vehicle-core`),
Labor und Welt rufen sie. **Machbarkeit:** reine CPU, 20 Wagen × wenige Flächen, im heutigen Sim-Takt 0,62–0,75 ms. **Erwartet:**
Berührungen 0 aus Konstruktion, Gridlock 0, jede Fahrt erreicht ihr Ziel — der Richter ist pflicht.C (nH 300, Tag und Nacht, ≥ 20 Wagen,
10 min).

**(f) Brief-Baustein:**
> REFERENZ VERKEHR (Dresner & Stone, IDM): Vorfahrt ist EINE Raum-Zeit-Reservierung je geteiltem Raum — ein Wagen oder Bewohner betritt eine
> Fläche nur mit reservierter Durchfahrt bis hinter sie. Eine neue Orts-Regel (Wende, Enge, Kreuzung, Fußgänger) neben der Tafel ist ROT; die
> Folgefahrt ist das IDM. Die Tafel wohnt im Kern, Labor und Welt rufen sie. Richter: pflicht.C (0 Berührungen, Ziel erreicht) und die Linse
> „Wagen an Wagen“.

---

**Ehrlich offen:** gemessen sind die Lücken (d) und die Vorbilder im eigenen Code (Gang-Satz −55 % Dreiecke; `_nahWieseSicht` 6,5 ms GTX
vorher, 1,5 ms Radeon nachher — zwei Geräte, die GTX nachher ungemessen);
die erwarteten Zahlen in (e) sind Schätzungen bis zum ersten A/B. Die These, dass die großen WGSL-Programme aus eingebetteten TSL-Funktionen
wachsen (56 `Fn` gegen 5 `setLayout` im Stamm), ist ungeprüft — der erste Schritt von Schnitt 3 misst die Bau-Zeit je Stufe und Signatur.
Wo das Tor seine 7,8 px trägt (welcher Stufen-Übergang), steht im Befund, nicht im Code; der Schnitt 1 gilt jeder Lücke der Kette.
