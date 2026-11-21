# Stufe-Zensus 21.11. — „in welcher Feinheit zeigt die Welt dem Auge etwas“ (nur gelesen)

Quelle: main c445936d (`git show`/`git grep origin/main`), Mess-Datei koordination `meisterkarte-quelle/punkte/messung/31ea3847-gtx.json`
(851 geurteilt: 817 rot, 34 grün · 579 ungemessen), der Pixel-Zensus `spike/einheit-sicht/BLATT.md` (Radeon, 986eff04). „Nenn.“ = Nennungen
des Symbols in stamm/ + voxel-worker.js ohne Kommentarzeilen, Definition mitgezählt. ZWISCHENSTAND, kein Schnitt.

## 1 Die Liste — 29 Systeme wählen heute eine Stufe

| # | System | der EINE Entscheider (Datei:Zeile) | misst an | Stufen | Nenn. | was beim Wechsel springt |
|---|---|---|---|---|--:|---|
| 1 | Boden-Chunks | gelaende-boden.js:2778 `_voxelChunkLodFor`, Tafel :3211 `BODEN_STUFEN` | Meter, Chebyshev-Kasten am SPIELER | 4 (1,8·3,6·7,2·14,4 m) | 7 | nichts: CDLOD-Morph im Band (`_stufeGewicht` :2826) |
| 2 | Fern-Ring | gelaende-fern.js:456 `_fernRingEnsure`, :2397 `FERN_RING` | Meter, 3 Schalen 800/3000/8000, Snap 6/24/64 | 3 | 16 | Re-Anker 180 m |
| 3 | Feld-Pass + Panorama | bild-sicht.js:2959/:2967; voxel-worker.js:4994 `masche` | FUSSABDRUCK je Texel → gelaende-core `netzStufe` | stetig | 4+4 | Re-Bake nach 60 m |
| 4 | Fern-Wasser | gelaende-fern.js:2383 `FAR_WATER` | Meter (bis 720) | 1 | 5 | Rebuild nach 80 m |
| 5 | Baum | siedlung-bauten.js:450 `_archStufeUrteil` → vegetation-streu.js:2134 / :1873 | Pixel-Fehler `_wechselGesetz` (:3052) × Sichthöhe, Haushalt d0 12 / d1 26 | 3 (L0·L1·Karte) | 18 | Dither-Blende 8 m |
| 6 | Bau · Tor · Ausstattung · Wagen | dieselbe :450 + studio-bruecke.js:2326 `_archStufenGrenzen`; Wagen erbt (siedlung-bauten.js:1828) | Pixel-Fehler JE VORLAGE (`LOD_SCHIRM.fehler`, vegetation-streu.js:2961) | 3 | 4 | Gestalt; der Innenraum fällt mit der L0 (fachwerk-core.js:2448 `DESTNUR`) |
| 7 | Verdeckung | siedlung-bauten.js:117 `_occlusionOccludes`, :3408 | Kronen-Dichte der Sichtlinie, ab 30 m | hebt auf L2 | 6 | Karte voll |
| 8 | Karte (Impostor-Atlas) | stoff-karte.js:432 `_karteStufe` (backt aus L1), :1910 `KARTE_GITTER` | Bild-Höhe in Pixeln (64 / 128) | 2 (Quad · 2×2) | 3 | Gitter wächst |
| 9 | Streu-Fernbahn | studio-bruecke.js:2457 `_streuFernBahn` | Meter (`ANALOG_NAH_M` 64, kreatur-leben.js:3885) | Mesh · gesetz · boden | 4 | Bahnwechsel |
| 10 | Nah-Wiese | vegetation-wiese.js:343 (Kachel-Ring), :600 `_wieseFern`, Tafel daten.js:505 | Meter an der KAMERA (nah); Fußabdruck je Pixel (fern) | 3 (L1 5 m · L2 10 m · Ferne 200 m) | 26 | Saum 20 m, sinkt in den Boden |
| 11 | Nah-Streu | vegetation-wiese.js:1805, Tafel :1244 | Meter (3,5 / 24 m) | 2 + Boden | 14 | Rand-Band 5 m |
| 12 | GPU-Wahl je Instanz | bild-wahl.js:667 `_instanzWahlGpu`, :606 `_wahlFenster` | Fenster der Stufe am Auge der Blende | liest 1–4 | 2 | — |
| 13 | Gelenk-Gestalt (Mensch·Tier·Peer) | koerper-leib.js:408 `_gelenkStufe` | Haushalt `ab` m × Größe (keine Pixel-Zeile) | 2 | 9 | visible-Tausch |
| 14 | Feld der Leiber (Kapseln) | vegetation-streu.js:1922 `_feldGrenzen` | Meter 64 (Tier) · Pixel 64 px (Menge) | Leib · Kapsel | 11 | Kapsel-Satz |
| 15 | Tier-Satz (Leib ja/nein) | kreatur-leben.js:2960 `_tickTierSatz` | BUDGET 4 nach `_bedeutung` (px × Gang, vegetation-streu.js:1970) | Leib · Satz | 7 | Satz ↔ Leib |
| 16 | Bewohner Nah-Wahl | siedlung-bewohner.js:1441–1452 | Meter 8 + Budget 4 (Ring 6) nach `_bedeutung` | Leib · Satz | 40 | — |
| 17 | Anim-Raten | kreatur-verhalten.js:2603 `_creatureAnimDiv` | Meter relativ zu `ab` (0,5 · 0,75 · 1) | 4 | 5 | Gang-Takt |
| 18 | Verkörperung des Bestands | kreatur-leben.js:2647 | Budget `maxCreatures` 20 (dirigent-kern.js:280), Meter 2D am Spieler | Zahl · Leib | 9 | nur außer Blick |
| 19 | Tuch | koerper-core.js:8589 | Meter 14 + px 1 | rechnet · ruht | — | Pose |
| 20 | Bau-Cull | vegetation-baum.js:2744 | Meter 150 am Spieler | Mesh · Daten | 16 | Bau/Abbau |
| 21 | Licht-Pool | dirigent-kern.js:1697 `_leuchtWahl`, stoff-material.js:3789 | Budget 4 Plätze, 48 m an der Kamera, Rang | 4 | 7 | Blende 0,5 s |
| 22 | Licht-Wurf | bild-schatten.js:1951 | Budget 1 Platz, `wichtigAb` 0,25 | 1 | 3 | — |
| 23 | Schatten-Kaskaden | bild-schatten.js:848 `_kaskadenPassen`, :1982, Takt :1905 | Meter (Kontakt 15, Reichweite 170 × 1,8) + Texel m | 3, Takt 1/2/3 | 15 | Saum |
| 24 | Kontakt-AO | bild-schatten.js:1921 | Pixel (`minPx` 2) | an · aus | — | — |
| 25 | Sterne | bild-himmel.js:3434 `HIMMEL` | Grenzgröße + Pixel (`minPx` 1) | stetig | 2 | — |
| 26 | Klang | klang-core.js:417 (`stimmenMax` 7), :452–498, :1754; klang.js:793 | Meter je Stimme 26–160 am SPIELER + Budget | hörbar · still | 14 | lauteste gewinnen |
| 27 | Verkehr-Sim | siedlung-verkehr.js:2312 `leiter` | Meter 0/40/100/200 → Teiler 1/2/4/8 | 4 | — | — |
| 28 | Ankunfts-Ferne | dirigent-ankunft.js:912, :1756 | streckt jeden Abstand bis zum ersten Bild | — | 10 | — |
| 29 | Physik | dirigent-takt.js:1180 `_stepFixedSim`, koerper-bewegung.js:2623 | fest 1/60 s | 1 | 26 | — |

Nicht gelesen: der Takt der Wolken-Karte (bild-himmel.js:162 `_wolkenKarteTakt`), der Spiegel des Wassers (bild-sicht.js, D10) — offen mit Namen.

## 2 Die Zwillinge — gleiche Frage, andere Antwort

| Frage | Antwort A | Antwort B (C) |
|---|---|---|
| WO steht das Auge? | `_lodAuge()` stoff-material.js:3286 (25 Rufer in 16 Dateien) | `camera.position`: Nah-Wiese vegetation-wiese.js:359, Licht-Pool dirigent-kern.js:1699 · `playerMesh.position`: Chunks gelaende-chunks.js:2888, Bau-Cull vegetation-baum.js:2748, Verkörperung kreatur-leben.js:2651, Klang klang.js:793, Tritt siedlung-wege.js:1642 |
| Abstand | Euklid 3D (`_stufeGemerkt raum`, siedlung-bauten.js:3288) | 2D hypot (Bau :461, Tier-Nah kreatur-leben.js:2945) · Chebyshev (Chunks) |
| Brennweite | Ruhe-FOV 75° × 1080 Zeilen (`_brennweite` vegetation-streu.js:3064) | live `cam.fov` × Puffer (`_schirm().pxJeM` bild-kosten.js:2858) · 1920 × 1080, 75° (fachwerk-core.js:12211) |
| Nähe des Leibs | `ANALOG_NAH_M` 64 m | Menge `mengePx` 64 px · Bewohner `nahM` 8 · Tuch 14 · Vogel 60 (tetrapoda-core.js:2485) · Fisch 48 (:2864) |
| Boden am Fuß des Baums | Chunk-L0 bis 36 m am Spieler | Baum-L0 bis Pixel-Fehler am Auge · Wiese-L1 5 m an der Kamera · Streu-L0 3,5 m · Labor d0 12 / d1 26 (foundry-core.js:432) |
| Höhe in der Ferne | Feld-Pass fragt MIT Fuß (masche 418–934 m) | Fern-Ring fragt OHNE Fuß bis 8 km; die Naht-Reihe fragt „wie der Ring“ (voxel-worker.js:4990) |
| Sichtweite | Kamera 1000 m bei Geburt (dirigent-ankunft.js:469) | `aussen + 500` (bild-sicht.js:2901); der Richter las 8 500 m |
| Cull-Radius | `architectureCullingRadius` 150 (dirigent-kern.js:776) | Fallback-Literal 150 zweimal (dirigent-ankunft.js:1228, siedlung-wege.js:222) |
| Nah-Grenze der Wiese | `_nahStufe` vegetation-streu.js:1950 — 0 Rufer | dieselbe Grenze im WGSL der Wahl (bild-wahl.js:983) |

Literal-Schwellen (gezählt in den Tafeln der Entscheider, ohne die gemessene Fehler-Tafel `LOD_SCHIRM.fehler`): **120**.

| Tafel (Datei:Zeile) | n | Tafel | n | Tafel | n |
|---|--:|---|--:|---|--:|
| BODEN_STUFEN gelaende-boden.js:3211 | 9 | NAH_WIESE daten.js:505 | 10 | Schatten bild-schatten.js:1900–1982 | 8 |
| LOD_SCHIRM vegetation-streu.js:2961 | 9 | NAH_STREU vegetation-wiese.js:1244 | 4 | FERN_RING + FAR_WATER gelaende-fern.js | 8 |
| lod d0·d1·fade·fade0·ref·hyst foundry-core.js:432 | 6 | BEWOHNER siedlung-bewohner.js:3602 | 6 | FELD_PASS + FELD_PANO bild-sicht.js | 5 |
| OCCLUSION siedlung-bauten.js:3408 | 6 | Streu countCap/leafBudget vegetation-streu.js:2357 | 6 | klang-core hoerweiteM ×7 + stimmenMax | 8 |
| VERKEHR armM·blickNahM·radFeinM·leiter | 6 | LICHT_POOL | 4 | Cull 150 ×3, Ring 4, maxCreatures 20, Totband 16 | 6 |
| Kamera far 1000 / +500 | 2 | KARTE_GITTER | 2 | Tuch 14·1, Vogel 60, Fisch 48 | 4 |
| Anim 0,5·0,75 | 2 | je 1: ANALOG_NAH_M · KREATUR_SATZ.nahLeiber · NETZ_TRAGT · ANKUNFT_FERNE · SPAWN_FAR 130 · minPx Stern · KAM_FOV · FIXED_DT · Epoche 60 m (siedlung-bauten.js:162) | 9 | | |

## 3 Was Kerne und Studios heute schon können

| Kern | Antwort mit Feinheit? | Beleg |
|---|---|---|
| gelaende | **ja, f(Lage, x, z, fuss)**: `hoehe(L,x,z,mitDetail,aus,fuss)` → `netzStufe(N,fuss)` (NETZ_TRAGT 2,5), `felsFarbe(…,fuss)`, `traegtSatz(fuss)`, `stufeZiel`, `morphCode` | gelaende-core.js:2819 · :1860 · :3853 · :3788 · :4100 · :4547; Leser MIT fuss: 1 von 18 `hoehe`-Rufen (voxel-worker.js:4996) |
| planet | **ja, fussKm**: `planetPunktR(S,x,y,z,fussKm)` | planet-core.js:1865; alle Rufer fest 16/40/400 km (:1911, :2699, voxel-worker.js:1430) |
| koerper | Pixel-Zeile nur am Tuch (`px` 1); der Leib in Stufen über die Ofen-Zeile `ab` | koerper-core.js:8589 · koerper-leib.js:387 |
| phyto + foundry | diskrete Stufen: `kindStages` (Baum 0·1·2, Gras 1·2 …), Budget Dreiecke je Stufe, `fernform`, Karte (`karteTiefe`, `karteSaumRinge`, `kroneImJahr` fern) | foundry-core.js:445 · :456–600 |
| porta · vehicle · schmiede · fachwerk | diskret `buildInstance(rezept, seed, lod, ov)`; porta `fein(m)` lässt Teile unter einer Größe fallen; fachwerk `bakeLOD`, `DESTNUR` | porta-core.js:1579 · :332 · vehicle-core.js:4892 · schmiede-core.js:3514, :4907 · fachwerk-core.js:2596, :2448 |
| tetrapoda | eine Feinheit + Meter-Zeilen `nahM` (Vogel, Fisch) | tetrapoda-core.js:2485, :2864 |
| klang | Abstand je Stimme + Budget, kein Auge | klang-core.js:417–498, :1754 |
| samen · leben | keine Stufe (Saat bzw. Masse über die Zeit) | samen-core.js (0 Treffer) · leben-core.js:173 |

Kein Kern braucht Welt-Zustand für die Stufe; alle nehmen sie als ARGUMENT. Der Sack ist die Wahl im Stamm (§1), nicht der Kern.
Studios: Stufen als Knopf oder Kette, nie als Fußabdruck — fachwerk (Stufen-Quelle + Blende, worlds/fachwerk/fachwerk.js:30, :80), terrain
(LOD-Band, worlds/terrain/phytogenesis.js:2737), koerperstudio (L0/L1 ab ± hyst, koerperstudio.js:92), tetrapoda (Stufen-Knöpfe), huelle
(Kosten-Leiste je Stufe, huelle.js:15), garage (kindStages.vehicle, garage.js:373), neuntes-buch (stele-core.js:25); `worlds/gelaende`
`STUFEN` ist eine Farb-Rampe der Höhe, keine Feinheit (makro-worker.js:71); begegnung · fluid · klang · portale · schmiede · schwarm · skeleton · translated tragen keine.

## 4 „Was geschah“ — Zustand, der nicht aus Saat und Ort folgt

| Klasse | Halter (Datei:Zeile) | hängt an |
|---|---|---|
| Grab- und Bau-Edits | `worldMeta.voxelEdits` → `_voxelEditKarte` (Kern `editKarte`) gelaende-boden.js:1455 | Welt, persistiert, ohne Deckel |
| Erdbau | `worldMeta.erdbau` (8 Nenn.) | Welt |
| gebaute Werke | `state.architectures`, reist im Stand (speicher-welten.js:1438) | Welt; ihr Mesh am Blick (Cull 150 m) |
| Fällen · Ernte · Narbe | `worldMeta.taten`, `_tatSchreiben` feld-leben.js:2723, heilt in Spielzeit | Welt |
| Trampelpfad | `worldMeta.tritt`, `_trittDerLeiber` siedlung-wege.js:1640 | Welt — aber geschrieben nur in `_trittReichweite` um den Spieler (gelaende-fern.js:2634): ferne Tiere treten nicht |
| Leben · Gefühl | `lifeField` · `emotionField` · `_lebenStand` (Register `bestand`, gelaende-fern.js:2604–2618), Zerfall `_feldTod` feld-leben.js:1966 | Welt |
| Tote | Leichnam `_tickLeichname` kreatur-leben.js:3342 (am Leib bis Frist); Tier-Tod als Zahl `_bestandTode` :2526 | Leib am Blick · Bestand an der Welt |
| Promotion · alter Feld-Stand · Ankunft der Orte | `worldMeta.scatterPromoted` · `feldStand` (gelaende-fern.js:75) · `settlementCells` (siedlung-ort.js:1631) | Welt |

Das Register `ZELL_GEDAECHTNISSE` (gelaende-fern.js:2436) trennt schon: 29 Einträge, 3 `bestand` (Taten), 3 `schranke`, der Rest wächst aus Saat und
Zelle neu und räumt am Blick (`_zellGedaechtnisGeht` :147). Die Spur-Schicht steht also schon dünn neben dem Gesetz — nur ihr Schreiber hängt am Spieler.

## 5 Das Gesetz (Vorschlag)

**Jede Feinheit ist die Antwort des Gesetzbuchs auf die EINE Frage des Auges — (Saat, Ort, Fußabdruck φ = Abstand ÷ Brennweite vom EINEN Auge
`_lodAuge`, Zeit) —, gewählt an EINEM Chokepoint `_stufeNachGrenzen` (siedlung-bauten.js:3271) mit dem Maß aus `_wechselGesetz`
(vegetation-streu.js:3052), gemerkt nach (Zelle, Stufe) im Register, die Spuren als dünne Schicht `worldMeta` darüber.**
Begründung aus dem Code: `_wechselGesetz` wechselt bei d = e·f/px ⇔ φ = d/f ≤ e/px — das ist schon die Frage nach dem Fußabdruck; gelaende-core
`fuss` und planet-core `fussKm` nehmen ihn schon als Argument. Es fehlt EIN Auge, EIN φ, und dass jeder Wähler aus §1 ihn liest. Offen, nicht gelesen: ob die Register-Caches die Stufe im Schlüssel tragen.

| Fall | Systeme aus §1 | was fehlt |
|---|---|---|
| fallen allein hinein (hängen schon an `_stufeNachGrenzen`/`_wechselGesetz` am `_lodAuge`, 7 und 12 über `_archStufeUrteil` bzw. das Fenster der Stufe) | 5 · 6 · 7 · 9 · 12 · 13 · 14 = **7** | — |
| brauchen mehr | 1 Chunks (Auge statt Spieler, Kasten → φ; der Morph bleibt Kern `stufeZiel`) · 2 Fern-Ring (φ an `hoehe` wie der Feld-Pass) · 3 · 4 (nur das Auge) · 8 Karte (Quelle-Stufe aus dem Fehler) · 10 Wiese (Ring → Fächer, Kamera → Auge; die Ferne trägt φ schon) · 11 Streu (Fehler-Zeile je Art fehlt in `LOD_SCHIRM.fehler`) · 19 Tuch · 20 Bau-Cull (Mesh-Existenz am Pixel statt 150 m) · 23 Schatten (Texel = φ am Kaskaden-Rand) · 24 · 25 · 28 (streckt φ) = **13** | φ als Argument, Auge vereint |
| Budget bleibt, sein Maß fällt hinein | 15 Tier-Satz · 16 Bewohner · 18 Verkörperung · 21 Licht-Pool · 22 Licht-Wurf = **5** | Rang = `_bedeutung` am φ (bei 15/16 schon Pixel) |
| bewusst eigen | 29 Physik (Kontakt braucht den Körper, Lockstep den festen Schritt) · 26 Klang (das Ohr, nicht das Auge; die Hörweite ist Kern) · 17 Anim-Raten · 27 Verkehr-Sim (Grundgröße ZEIT, nicht STUFE) · Kollision `blockerAABBs` (feld-nativ ab Spawn) = **4** + Kollision | — |

## 6 Die Sprossen der Karte 2, die daran hängen (rote Gründe in 31ea3847-gtx, Muster über `grund`)

| Wort im roten Grund | Gründe | | Kapitel (ohne „Planet“) | Gründe |
|---|--:|---|---|--:|
| Megastadt | 14 | | erleben | 18 |
| Speicher / MB | 9 | | same | 12 |
| Stufe | 7 | | mensch | 11 |
| „reicht n m“ | 6 | | planet | 4 |
| Ferne / Horizont | 6 | | leben | 1 |
| Kontinent | 4 | | **Summe** | **46 in 34 Leitern** |
| Maßstab · Preis | 0 · 0 | | mit „Planet“ dazu | 167 in 83 Leitern |

Je Leiter (ohne „Planet“): same.massstab.spanne 5 · erleben.bild.ferne 5 · mensch.leib.verschieden 2 · erleben.schoepfen.teilen 2 · same.preis.speicher 2 ·
erleben.sinn.sog 2 (falsch-positiv: „Speicher“ = Spielstand, #3/#7) · 28 Leitern je 1. Die Reichweite des Auges allein (camera.far · FELD_PASS · „Ebene“ ·
Kuppel · LOD): 22 Gründe in 10 Leitern — same.massstab.spanne#5–#9 „die Welt-Kamera reicht 8 500 m“, erleben.bild.ferne#5–#7 „zeichnet bis 40,0 km“.
Das Wort „Planet“ (127 allein) nennt meist planet-core oder „eine Planeten-Saat“ — die Klasse des Saat-Zensus, nicht der Stufe. Ungemessen: nicht gezählt.

## 7 Spike als Rechnung — die Nah-Wiese (26 Nennungen, das System mit den meisten Lesern)

Zahlen: Brennweite f = 1080 / (2·tan 37,5°) = 703,8 px je m (`LOD_SCHIRM.zeilen`, `KAM_FOV_GRAD`); Raster 0,72 m (foundry-core.js:674) → 1,93 Büschel/m²;
Gras L1 1 000, L2 130 Dreiecke (foundry-core.js:595–596); Bodenfläche je Pixel wie `_wieseFuss` (flach, h = 1,5 m): A(d) = d³ / (f²·h) = d³ / 743 000 m².

| Frage | je Welt-Meter (heute nah) | je Schirm-Pixel |
|---|---|---|
| Plätze im Nah-Kreis r 12,5 m (radius + vorlauf) | 491 m² → 947 Büschel, ≤ 151 k (L1, r 5) + 59 k (L2, 5–10 m) = 210 k Dreiecke, blind für den Blick | im Fächer 107,5° (16:9) 29,9 % = 63 k; **70 % des Bestands stehen hinter dem Auge** |
| Dreiecke je Bodenpixel am Rand der Stufe | — | L1 an 5 m: 1 000 × 1,68·10⁻⁴ × 1,93 = **0,32**; L2 an 10 m: 130 × 1,35·10⁻³ × 1,93 = **0,34** |
| Ferne 13,8–200 m | ohne Kappe an 200 m: 20,8 Büschel = 2 700 Dreiecke je Pixel | mit Kappe (fuss/Q)³: 0,0068 Büschel = **0,89 Dreiecke je Pixel**, konstant |
| wo der Meter teurer wird als der Pixel | 1 Büschel je Pixel bei A = 0,518 m² → **d = 72,7 m** | darüber kostet jede Frage je Meter mehr als eine je Pixel |

Gemessen am selben System (BLATT.md, Wiese Third 1080 × 1080): Vegetation 311 501 Dreiecke gezeichnet, 80,3 % ohne Pixel, 10,1 % unter dem Bildpunkt.
Urteil: die zwei Meter-Grenzen der Nähe landen schon bei ⅓ Dreieck je Pixel und die Ferne IST das Pixel-Gesetz — der Schnitt an der Wiese ist
Ring → Fächer am EINEN Auge (−70 % Bestand), nicht ein neues Maß. Bytes je Büschel: nicht gelesen, offen.
