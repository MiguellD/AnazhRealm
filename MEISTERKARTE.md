# MEISTERKARTE des Ultiversums — Stand 18.10.2026, Kopf integ-probe = main ff88b82d (V18.546.19)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Für jeden Bereich steht hier die 10/10 (AAAA): was die Besten liefern und wie, und wo wir sie schlagen. Dazu kommen fünf Kriterien mit
Messung, je 0/1/2 Punkte: 0 = fehlt oder ROT, 1 = trägt an einer Pose, an einem Gerät oder zum Teil, 2 = Soll gemessen gehalten.
Unser Stand steht mit Beleg (`Datei:Zeile` am Kopf ff88b82d), danach die Hebel mit Punkten, Aufwand und Schnitt. Es zählt nur, was am Kopf
im Code steht und gemessen ist; ein Zweig zählt erst nach seinem Merge (W0). Der Punktestand liegt in `meisterkarte.json` und wird nach jedem
Bündel nachgezogen, den Verlauf zeigt `git log -p meisterkarte.json`, die Ansicht `meisterkarte.html`.
Der Scope bleibt `docs/PFLICHT-OFFEN.md`: **A** AAAA je Klasse · **B** Ankunft ≤ 5 s · **E** Profi-Band. Die Karte setzt keinen Eintrag; sie
ordnet die Hebel und nennt, welche Pflicht jeder trägt.

---

## Punktestand: 27 / 90

| Bereich | Punkte | K1 | K2 | K3 | K4 | K5 | nächster Hebel |
|---|---|---|---|---|---|---|---|
| 1 Gelände, Boden, Wasser | **5**/10 | 1 | 1 | 1 | 1 | 1 | Wasser-Bild aus dem Gesetz (+1 · 1 d · A) |
| 2 Vegetation: Wiese und Wald | **3**/10 | 1 | 1 | 0 | 1 | 0 | Die Wiese wogt bis zum Saum (+2 · 1–1½ d) |
| 3 Siedlung und Bauen | **3**/10 | 1 | 0 | 1 | 1 | 0 | Stadt-Tor + Export mit Rang (+3 · 1¾ d) |
| 4 Tiere, Herden, Rudel | **2**/10 | 0 | 1 | 1 | 0 | 0 | Der Verband ins Gesetzbuch (+2 · ¾ d; gebaut auf rudel-verband) |
| 5 Menschen und NPC | **2**/10 | 0 | 0 | 0 | 1 | 1 | Bewohner = Kreatur mit Menschen-Leib (+2 · 1 d) |
| 6 Fahrzeug, Fahrgefühl, Kamera | **3**/10 | 1 | 0 | 1 | 0 | 1 | EIN Kamera-Rig (+2 · ½ d; gebaut auf spielgang) |
| 7 Licht, Atmosphäre, Ferne | **3**/10 | 1 | 0 | 1 | 1 | 0 | EINE Tag-Achse S7 (+3 · 1½ d · A) |
| 8 Studios und Werkzeug-UI | **4**/10 | 0 | 1 | 1 | 1 | 1 | Sitzung mit A/B + Griff→Bild-Linse (+1 · 1½ d) |
| 9 Ankunft, Streaming, Leistung | **2**/10 | 0 | 1 | 1 | 0 | 0 | S3 EIN Rang + freier Haupt-Faden (+1 · 2½ d · B) |

Vorn steht das Gelände, denn seine 2D-Form ist schon EINE Quelle. Hinten stehen die Bereiche, deren Verhalten noch im Wirt statt im
Gesetzbuch lebt (Tiere, Menschen: W4), und die Ankunft (W5 + W6). Der „nächste Hebel" ist je Bereich der mit den meisten Punkten je
Tag, dessen Vorbedingung schon steht (Ankunft H2 liest den Rang aus H1, Siedlung H1 zahlt ohne H2 die Ankunft).

**Was offen liegt:** alle 27 Hebel zusammen bringen **+48 → 75/90** in ≈ 45 Arbeitstagen (Schätzungen der Bewertungen, mit den
Überlappungen der geteilten Schnitte). Die letzten 15 Punkte verlangen die harten Grenzen an beiden Geräten: ≤ 5 s kalt, Profi-Band
und Hänger an Radeon UND GTX, 250 km/h ohne Lücke, 12/12 Studios auf der Welt-Engine (terrain, klang) und Wolken mit Volumen.

---

## TOP-5-Hebel über alle Bereiche (Punkte je Aufwand)

Rang = Punkte ÷ Mitte des Aufwands. Bei Gleichstand gewinnt zuerst, was eine Pflicht trägt, dann, was B und E nicht belastet, dann, was
weitere Hebel öffnet.

| # | Hebel | Bereich, Kriterium | Punkte | Aufwand | P/d | Schnitt (SYSTEMKARTE) | Pflicht | Stand am 18.10. |
|---|---|---|---|---|---|---|---|---|
| 1 | **EIN Kamera-Rig für jeden Übergang** | Fahrzeug K4 0→2 | +2 | ½ d | **4,0** | S6 (vehicle-core `chaseKamera` + EIN `_kamRig`), dazu F1a aus S8 | — | gebaut auf spielgang 7348d7db + 757d1b0f, Rebase auf integ |
| 2 | **Der Verband ins Gesetzbuch** | Tiere K1 0→2 | +2 | ¾ d | **2,7** | S6, erster Schritt | — | rudel-verband 0716fa0a merge-reif (Kohäsion 0,19 → 0,98); GTX-ABAB beauftragt (`auftrag/1810-omen-s6-abab.md`) |
| 3 | **EINE Tag-Achse, Belichtungs-Kompensation, Uhr-Linse** | Licht K2 0→2, K1 1→2 | +3 | 1½ d | **2,0** | S7 | **A** (himmel-licht: 8 Spawn-Zellen ROT) | offen; e2485995 einfädeln |
| 4 | **Bewohner = Kreatur mit Menschen-Leib** | Mensch K1 0→1, K4 1→2 | +2 | 1 d | **2,0** | S6 (Mensch) | — | offen; öffnet Mensch H2 + H3 (+6 in 3 d, gleiche Rate) |
| 5 | **Jagd-Kreislauf schließen, Gangart aus dem Tempo** | Tiere K2 1→2, K3 1→2 | +2 | 1 d | **2,0** | S6 (Rudel); der Gang ist ein Vertrags-Akt (Lehre 11) | — | offen |

Ebenfalls bei 2,0 P/d, aber mit Vorbedingung oder Last: Siedlung H1 Stadt-Tor zahlt ohne Siedlung H2 die Ankunft (B), darum zählt
es als Paar (+3 in 1¾ d = 1,7). Tiere H2 hebt die Dichte von 20 auf 150 Tiere und belastet E, wo der CPU-Takt heute schon reißt; das geht
nur mit OMEN-ABAB. Mensch H2 und H3 bauen auf Mensch H1 auf. Dahinter folgen Vegetation H2 (1,6) und das S4-Paar (1,6).

**Die Pflicht-Sicht.** Die Top-5 sind Punkte-Hebel; die Pflicht tragen andere Schnitte: **S3** für B und E (Ankunft H1 → H2 → H3,
Siedlung H2, Gelände H2: +6 in ≈ 7 d), **S7** für A (Top-5 #3), **S8** für A (laub und laub-kante; Vegetation H1 und Licht H2 sind derselbe
Schnitt, +3 in ≈ 2½ d) und Gelände H1 für A (wasser, +1 in 1 d). Am Spawn hält A heute vorläufig 37 von 136 K5-Zellen (27 %), weil S2 noch
in Nachbesserung ist (Übergabe 18.10. 15:20, ef09770b).

### Die Wurzel-Bündel: ein Schnitt, mehrere Bereiche

| Schnitt | Wurzel | Hebel (Bereich) | Σ Punkte | Aufwand | P/d | Pflicht |
|---|---|---|---|---|---|---|
| S6 Die Funktion ins Gesetzbuch | W4 | Fahrzeug H1 H2 · Tiere H1 H2 H3 · Mensch H1 H2 H3 · Siedlung H1 | +19 | ≈ 9½ d | 2,0 | — (Dichte belastet E) |
| S7 EINE Tag-Achse, EIN Licht-Baustein | W7 | Licht H1 | +3 | 1½ d | 2,0 | A |
| S4 EIN Grund-Datum aus dem Körper-Satz | W2 | Vegetation H3 · Siedlung H3 | +4 | ≈ 2½ d (geteilt) | 1,6 | — |
| S8 Die Stufe folgt der Gestalt | W8 | Vegetation H1 = Licht H2 | +3 | ≈ 2½ d | 1,2 | A |
| S3 EIN Rang, freier Haupt-Faden | W5 W6 | Ankunft H1 H2 H3 · Siedlung H2 · Gelände H2 | +6 | ≈ 7 d | 0,9 | B E |
| S5 Das 3D-Gesetz im Kern | W1 | Gelände H3 | +2 | ≈ 5½ d | 0,4 | B (Hydrosphäre ≈ 0,5 s) |
| S1 Studio = Modus der Welt-Engine | W3 | Studios H3 | +2 | ≈ 5 d | 0,4 | A (haus Labor ≠ Welt) |
| am Ort, ohne Wurzel-Schnitt | — | Gelände H1 · Vegetation H2 · Fahrzeug H3 · Licht H3 · Studios H1 H2 | +9 | ≈ 11 d | 0,8 | A (wasser) |

**S6 ist der Punkte-Hebel**: 19 der 48 offenen Punkte, und jede Funktion ist ein eigener Schnitt von ½ bis 1½ Tagen. Der Pflicht-Hebel ist S3.

---

## 1 Gelände, Boden und Wasser — 5/10

D1: `gelaende-core.js` · `stamm/gelaende-*.js` · `stamm/wasser-*.js` · `voxel-worker.js`

**10/10.** Jeder Hügel, jede Klamm, jeder Fluss, jeder See und jeder Spatenstich ist EINE Funktion des Kerns (`gelaende-core`: hoehe +
dichte + editForm + Wasser-Spiegel). Sie wird von 0,3 m bis 8 km ohne Naht gezeichnet, auch in voller Fahrt. Graben und Bauen tragen auf
jeder Höhe; Fluss, Fern-Ring und Natur sehen jeden Edit binnen 1 s. Das Wasser spiegelt wie ein realer See (r ≥ 0,6) und fließt mit dem
Detail eines realen Bachs (≥ 0,2). Das alles bei ≤ 12 Befehlen und ≤ 120k Dreiecken im Profi-Band.
**Wo wir sie schlagen.** Die Besten malen ihre Flüsse (UE5-Splines, Horizon backt, Far Cry setzt sie von Hand) oder liefern
Editierbarkeit ohne Hydrologie (Teardown, Enshrouded). Bei uns entsteht das Flussnetz zuerst aus dem Gesetz (Génevaux, Stream-Power,
garantierte Entwässerung, unendlich). Leben Edit und Wasser im selben Gesetz, wird jeder Graben ein Fluss-Ereignis und jeder Damm ein
See — das kann keiner der vier.

**Die Besten**
- **Far Cry 5** (Ubisoft, Dunia; GDC 2018, Jeremy Moore): eine 10 × 10 km große Welt, deren Höhenfeld in jeder Entfernung gezeichnet wird,
  dazu prozedurale Klippen und Verschiebungs-Geometrie; Far Cry 4 hatte schon 10 Texel/cm Boden (Adaptive Virtual Texture, GDC 2015).
  Weg: LOD, Culling, Nähte und Zeichnen laufen in EINER GPU-Compute-Kette über einen Quadtree; Biome, Boden und Klippen kommen aus
  prozeduralen Werkzeugen (Etienne Carrier). Grenze: das Gelände ist nicht editierbar, die Flüsse sind von Hand gesetzt.
  gdcvault.com/play/1025261 · gdcvault.com/play/1021760 · gamedeveloper.com (World-Generation-Tech von Far Cry 5)
- **UE5 Water + Landscape** (Epic): Flüsse, Seen und Meer sind Splines auf dem Landscape. Das Wasser-Mesh ist ein Quadtree (Kachel
  24 m, 64 Kacheln, jeder Ring nach außen mit halb so vielen Vertices, Morph 4 Quads → 1, ein Fern-Mesh bis zum Horizont). Single Layer
  Water rechnet Streuung, Absorption, Spiegelung, Brechung und Schatten in EINER Tiefen-Schicht, billiger als Transparenz; das
  Fluss-Material trägt Tempo, Steuerung und Dichte, eine Fluid-Sim liefert Kräusel und Kielwasser, dazu Auftrieb.
  dev.epicgames.com (water-system · water-meshing-system-and-surface-rendering)
- **Horizon Forbidden West** (Guerrilla, Decima; Hugh Malan, SIGGRAPH 2022 Advances, Real-Time Live! Best in Show): Wasser vom
  reißenden Fluss über den Wasserfall bis zum brechenden Meer. Weg: Künstler formen die Wellen im Editor, gebacken je Welt-Kachel und zur
  Laufzeit gestreamt; die Gestalt geht vor der Simulation. Zu Flüssen und Wasserfällen gibt es keinen Vortrag.
  advances.realtimerendering.com/s2022/SIGGRAPH2022-Advances-Water-Malan.pdf
- **Teardown** (Tuxedo Labs) und **Enshrouded** (Keen Games, Holistic Engine): editierbare Voxel-Welten, große Teardown-Level mit
  ≈ 0,5 Mrd. Voxeln; die Physik-Gitter werden zur Laufzeit aus dem Anzeige-Gitter abgeleitet, die Level-Daten sind RLE-komprimiert.
  Enshrouded gräbt und baut einen Kontinent ohne Ladezeit (fünf Jahre Voxel-Kern), der Voxel-Boden ist auch fern sichtbar. Grenze: das
  Wasser entsteht nicht hydrologisch. pcgameshardware.de (Teardown-Technik · Enshrouded 1.0 Technik-Test)
- **RDR2 und Sea of Thieves** (Referenzen der Soll-Tafel wasser): Flüsse spiegeln Ufer, Wolke und Mond, die Strömung folgt dem Gelände.
  Sea of Thieves: Fresnel-Spiegel mit SSR, Rückfall auf eine planare Spiegelung, Wasser-Farbe aus Streuung im Volumen. Unser Maß daraus:
  ein realer See hat spiegelTreue 0,743, ein realer Bach Detail 0,24 (`auftrag/durchbruch-1510.md:525`). Zu RDR2 gibt es keinen
  Technik-Vortrag. notebookcheck.net (Crimson Desert gegen RDR2)

**Kriterien**
1. **EIN 3D-Gesetz: Höhe, Dichte, Edit und Wasser im Kern — 1/2.** *Messung:* Zwillings-Marken in `voxel-worker.js` → 0 (heute 13
   explizite, 166 Treffer auf Spiegel|mirror|Abschrift); `gate:worker-dichte` prüft Stamm = Kern und Worker = Kern statt Abschrift gegen
   Abschrift; `diag-worker-watersheet` maxDiff 0; Seen ×1, Hydro-Zahlen ×1; Studio-Plan = Welt byte-gleich. *Beleg:* die 2D-Form ist EINE
   Quelle auf Weltklasse-Niveau (`gelaende-core.js:1577` hoehe, `:1177` flussLaeufe, `:3337` planNormal, Studio = Welt byte-gleich). 3D und
   Wasser liegen zu 0 % im Kern: der Dichte- und Edit-Kegel lebt in `stamm/gelaende-boden.js:1128-1145`, als Hand-Abschrift in
   `voxel-worker.js:462-795`; erklärter Zwilling LICHEN (`gelaende-boden.js:2957`: „der Worker hardkodiert diese Schwellen
   spiegelbildlich"); Seen ×2 (`gelaende-core.js:1146` ⇄ `wasser-hydro.js:760`), Hydro-Zahlen ×2 (`daten.js:166` ⇄
   `voxel-worker.js:72-78`), ≈ 40 gespiegelte Funktionen (SYSTEMKARTE W1).
2. **Wasser lebt aus dem Gelände: Fluss, See, Ufer, Spiegel, Ruhe — 1/2.** *Messung:* Soll-Tafel wasser (`abnahme-urteil.cjs`):
   spiegelTreue r ≥ 0,6 · fließend detail ≥ 0,2 · uferWeiss ≤ 1 %; Automat-Takte in 60 s Ruhe = 0; jeder Lauf endet in See oder Meer; ein
   Graben am Fluss füllt sich ohne Spiegel-Funktion. *Beleg:* das Flussnetz entsteht ZUERST, Stream-Power S = ks·A^−θ, streng fallende
   Sohle, die Welt entwässert (`gelaende-core.js:202-209`); die Strömung ist EIN Gesetz für Körper, Bild und Studio-Bach
   (`wasser-hydro.js:300-302`; `bild-sicht.js:1058` uFlowSpeed = WG.wellen.adv), EIN Blick-Baustein nah und fern (`wasser-hydro.js:1538`, aus
   `bild-sicht.js:1330` und `gelaende-fern.js:935`). Das Bild verfehlt das Soll: spiegelTreue 0,43–0,56 (integ a9e21f17, D10, 15.10.),
   fließend detail 0,029–0,051 bei Soll 0,2; die Ruhe ist nur ein Fixpunkt (`wasser-zellen.js:2141`), Linse G4 zählt Sheet-Bauten statt
   Takte, 8 Wasser-Schreiber (SYSTEMKARTE W1).
3. **Edits überall: graben und bauen auf jeder Höhe, sichtbar nah, fern, im Wasser und in der Natur, gespeichert — 1/2.** *Messung:*
   ein Fill 60 m über dem Gelände trägt (heute ist der Kegel ab ≈ 48 m tot); Fern-Ring und Hydro-Raster lesen dieselbe editForm (byte-Diff am
   Ring nach einem Edit); Edit → sichtbares Mesh ≤ 1 s; ein Graben am Fluss füllt sich über den Kern; Speicher-Rundlauf byte-gleich.
   *Beleg:* nah trägt der Edit (EINE Karte je Chunk `_voxelEditKarte`, atomar gespeichert, Edit-Wache des Fern-Rings an der Naht
   `gelaende-fern.js:1259`, K16). Aber der Edit ist ein Dichte-Kegel fester Stärke, `const amt = fall * (ed.strength || 48)`
   (`gelaende-boden.js:1139`): über 48 m trägt kein Fill (F2a), und derselbe Kegel steckt noch einmal im Worker (`:591-595`, `:695`). Das
   Hydro-Raster sieht keine Edits (`voxel-worker.js:3616`); F3 ist nur über einen weiteren Spiegel gemergt (`wasser-zellen.js:136` ⇄
   `voxel-worker.js:1120`).
4. **Fernsicht und Stufen: 0–8 km ohne Naht, auch in Fahrt — 1/2.** *Messung:* Reichweite des Fern-Rings in m; Sprung beim Stufenwechsel
   (gate:nah-fern, Pixel-Diff beim Morph); Leer-Kacheln und trockene Quellen bei 30 m/s (F5-Linse: LEER/KACHELN/TROCKEN) → 0;
   Fern-Ring-Abweichung auf der Radeon < 0,5 m auf 8 km; eine Soll-Tafel-Klasse für das ferne Gelände im Bild. *Beleg:* der Fern-Ring
   reicht bis 8 000 m (`gelaende-fern.js:1348`); `BODEN_STUFEN` 36/100/388,8/∞ mit Bändern 12/12/40, der Wechsel morpht nach CDLOD
   (`gelaende-boden.js:2944-2952`, K51); die Naht liegt auf dem vollen Gesetz (`gelaende-fern.js:874-886`); die Nacht-Fernfarbe ist mit F6
   geheilt (Luma Karte/Gestalt 2,18 → 1,11, `bericht/1810-f6-gtx.md`). In Fahrt bricht es: die Boden-Reihe ist Chebyshev
   (`gelaende-chunks.js:2838`), das Tempo dreht nur die Voraus-Richtung (`:2541`), der Worker braucht ≈ 150 ms je Chunk, eingebaut wird
   höchstens EINER je Takt (`:2936`) — daher die Leer-Kacheln von F5. Keine Klasse misst das ferne Gelände im Bild.
5. **Boden nah: Feinform, Stoff und Kontakt, im Budget — 1/2.** *Messung:* Soll-Tafel boden-nah laiWirk ≥ 1,7 · boden-nah-farbe
   farbtonStreuung ≥ 10,7° · fels-Albedo 0,1–0,3; Schweben und Einsinken 0 cm, weil EINE Boden-Höhe je Rolle gilt (Sichtbares →
   `_bodenSichtAt`, Leib → Feld, Ferne → Gesetz); Feinform-Fehler gegen das Gesetz ≤ 5 cm; Boden-Klasse ≤ 12 Befehle / ≤ 120k Dreiecke
   (`spec/profiband/haushalt.json` boden). *Beleg:* die Nah-Wiese ist geheilt (laiWirk 0,671 → 1,855, soll-tafel boden-nah
   wirkung.geheilt); die Boden-Klasse liegt an Genesis Ego bei 8 Befehlen und 74 084 Dreiecken (`bericht/1610-buendel6/g-ego-A1.json:1133-1141`).
   Offen: Surface-Nets auf 1,8 m trägt die Feinform nicht (±0,2 m, Lehre 22); drei Boden-Höhen ohne Rolle (`_bodenSichtAt` mit 7 Aufrufern,
   `_terrainMacroSurfaceY` mit 16, dazu der Dichte-Scan); der Spieler-Boden hat eine eigene Probe (`koerper-bewegung.js:857-887` ⇄
   `kreatur-leben.js:1357`).

**Hebel**
1. **Wasser-Bild aus dem Gesetz** · +1 (K2: fließend detail 0,04 → ≥ 0,2, spiegelTreue 0,5 → ≥ 0,6) · ≈ 1 d + Spike am See 1816/−6168 ·
   Pflicht A (wasser). Schnitt im EINEN Baustein `_wasserBlick` (`stamm/wasser-hydro.js:1538`, nah aus `bild-sicht.js:1330`, fern aus
   `gelaende-fern.js:935`): Strömungs-Normalen aus der Fluss-Bahn (`bahnPunkte` von `flussLaeufe`, `gelaende-core.js:1177`) als zwei
   phasenversetzte Lagen; Schaum und Weiß wachsen mit Gefälle × Einzugsgebiet A (Stream-Power) statt mit einem Uferband; die SSR-Treffer
   werden schärfer. Kein neuer Befehl, nah und fern ziehen zugleich mit.
2. **Boden-Reihe nach Ankunftszeit statt Chebyshev** · +1 (K4) · ≈ 1 d · S3, derselbe Schnitt wie Ankunft H2. In
   `stamm/gelaende-chunks.js:2838` ordnet die Zeit bis zum Eintreffen (Abstand ÷ Tempo entlang der Fahrt, `:2541`) die Reihe; die Stufe
   folgt aus derselben Zeit (`_voxelChunkLodFor`, `gelaende-boden.js:2587`): in Fahrt wird erst grob gebaut, dann verfeinert, statt nah ein
   Loch zu füllen. Richter: F5-Linse LEER/KACHELN/TROCKEN → 0.
3. **S5 — das 3D-Gesetz in den Kern** · +2 (K1 +1, K3 +1; nebenbei Ruhe-Takte für K2 und ≈ 0,5 s Haupt-Faden für B, denn
   `_computeHydrosphere` läuft heute synchron in dom-fertig, `bericht/1710-s2b/ankunft/analyse-A.txt`) · 4–7 d · S5. `spalte`, `dichte`
   (Höhle, `gewaesserForm`) und `editForm` werden reine Funktionen in `gelaende-core.js`; der Edit wird eine Hülle mit Mindest-Dichte statt
   eines additiven 48er-Kegels (F2a fällt an EINER Stelle). Danach `waterLevelAt`, `carveAt`, `lakeAt`, `schnittSpiegel` mit Seen aus
   `benannteSeen`; `stamm/gelaende-boden.js:914/955/1122-1145`, `stamm/wasser-hydro.js:54/760`, `stamm/wasser-zellen.js:136/2141` und
   `voxel-worker.js:462-795/1120/3616` rufen nur noch den Kern, die Abschrift fällt im selben Commit; `gate:worker-dichte` prüft gegen den Kern.

---

## 2 Vegetation: Wiese und Wald — 3/10

Nah-Wiese, Wind, Fernwald, LOD-Übergänge, Natur-Wand.

**10/10.** Vom Halm am Stiefel bis zum Kamm am Horizont ist jede Pflanze EINE Funktion des Ortes. Die Wiese wurzelt dicht und bunt und
wogt ohne Naht bis in den Mittelgrund; jede Böe sieht man über Gras, Kronen und Wasser wandern und hört sie zugleich (EIN `WIND_BOE`).
Bewaldete Kämme behalten ihren Sägezahn-Umriss bis 4 km. Unter Gehen, Fahren und Sicht-Wechsel ploppt nichts, die Natur weicht jedem
Grundriss — im Profi-Band (GTX 1060 und Radeon 890M, p95 ≤ 16,7 ms, Haushalt nahWiese 4 Befehle / 80k Dreiecke, baum 40 / 150k).
**Wo wir sie schlagen.** Horizon malt Dichte-Karten, Tsushima pflegt Kunst-Daten, Nanite und SpeedTree bauen Assets mit einer
LOD-Kette. Bei uns liest jede Stufe dieselbe Ableitung (`treeParams` · `planForestCell` · `wiesenTint`): der Fernwald am Kamm und der
Baum vor der Nase sind dieselbe Zahl, nicht zwei Assets (Labor = Welt). Der Wind ist schon heute physikalisch aus Höhe und Schlankheit
hergeleitet (f0 = kF·δ/H) und hörbar derselbe, und das läuft im Browser auf einer iGPU.

**Die Besten**
- **Ghost of Tsushima** (Sucker Punch; GDC 2021 Wohllaib „Procedural Grass in Ghost of Tsushima", zum Wind Rockenbeck „Blowing from the
  West"): Felder aus Einzelhalmen bis weit in den Mittelgrund, Böen wandern über „Millionen Halme". Weg: Halme je Kachel im
  Compute-Pass, ohne Vertex-Ströme, allein aus Index und Instanz-ID; ein Halm hat nah 15, fern 7 Vertices, vor dem Wechsel morpht die
  Form; ferne Kacheln sind doppelt so groß bei gleicher Halmzahl, beim Übergang fallen 3 von 4 Halmen; kurze Halme falten zwei Halme in
  dieselben Vertices; Bezier-Halm, Voronoi-Klumpen steuern Höhe, Farbe und Neigung, im Blickraum werden Halme verdickt. Wind =
  gescrolltes 2D-Perlin-Feld + Sinus je Halm; ein Verdrängungs-Puffer biegt das Gras um jede Figur; Schatten gedithert aus gehobenen
  Boden-Vertices + Screen-Space. Kosten ≈ 2,5 ms laut Sekundärquelle, unbestätigt. gdcvault.com/play/1027214 ·
  tigerabrodi.blog/grass-in-ghost-of-tsushima
- **Horizon Zero Dawn / Forbidden West** (Guerrilla; GDC 2017 van Muijden „GPU-Based Run-Time Procedural Placement", GDC 2018 „Between
  Tech and Art: The Vegetation of Horizon Zero Dawn"): eine dichte Welt, die die GPU zur Laufzeit um den Spieler baut, mit Klang,
  Effekten und Tieren; aus Augenhöhe ist der Boden unter der Wiese nie frei, die Kronen bestehen aus vielen kleinen Blatt-Karten an
  Ast-Clustern, ohne Raster und Karten-Kante. Weg: Dichte-Funktionen aus einem Graph-Editor, deterministisch und lokal stabil — ein Berg
  oder Fluss lässt sich verschieben, ohne neu zu dekorieren. ms-Budgets stehen nur in den Folien (nicht lesbar), daher keine Zahl.
  guerrilla-games.com (gpu-based-procedural-placement-in-horizon-zero-dawn) · gdcvault.com/play/1024120
- **Unreal Engine 5.6/5.7 Nanite Foliage** (Witcher-4-Demo, 60 fps auf der Basis-PS5 mit Raytracing, Zahl aus Epics Marketing): Wälder
  und Felder aus Geometrie statt Karten, bis in die Ferne ohne Überblendung, ohne Pop, ohne Hand-LOD. Weg: Nanite Assemblies für
  Varianten aus Bausteinen, Nanite Skinning für Wind, Nanite Voxels zeichnen Kronen und Nadeln fern als eine Masse. Experimentell,
  unabhängige Wald-Benchmarks fehlen. digitalproduction.com (UE 5.7 Foliage, PCG) · blog.playstation.com/?p=405351
- **SpeedTree** (Industrie-Standard): Wind in Stufen je Qualität (globaler Schwung, dann Ast-Bewegung und Blatt-Ripple, oben
  Blatt-Taumeln); die LOD-Kette bleibt nah 3D, verliert mit der Distanz Geometrie bei gleicher Gestalt und blendet dann in ein Billboard mit
  Lichtzustand (reduzierter Wind, keine Light-Probes); Leaf-Cards drehen sich zur Kamera. docs.unity3d.com (speedtree-runtime-sdk
  level-of-detail · SpeedTreeImporter-Model)

**Kriterien**
1. **Nah-Wiese wurzelt dicht und bunt (0–18 m) — 1/2.** *Messung:* boden-nah laiWirk ≥ 1,7 in jedem Ring (2–5 / 5–10 / 10–14 m),
   boden-nah-farbe farbtonStreuung ≥ 10,7° (`werkbank bild … --ist boden-nah`), in Ego UND Third, an Mess-Wiese UND Genesis, auf Radeon UND
   GTX, im Haushalt nahWiese (≤ 4 Befehle, ≤ 80k Dreiecke); 2 = jede Pose grün, 1 = eine Pose grün. *Beleg:* grün nur an EINER Pose
   (Radeon, Ego, Mess-Wiese): laiWirk 1,855 (2,05 · 1,54 · 1,66), farbtonStreuung 11,06 (`spec/abnahme/soll-tafel.json`); am Spawn ist
   boden-nah 12/12 ROT (LAI 0 am Platz, Übergabe 18.10. 15:20, ef09770b). Kosten GTX Wiese Ego: nahWiese 4 Befehle / 77 440 Dreiecke
   (`spec/profiband/ratsche-wiese-gtx-ego.json`). Die Büschel enden bei `NAH_WIESE` radius 14 + rand 4 m (`stamm/daten.js:447`), dahinter
   liegt nur die Parallax-Halm-Funktion (`stamm/stoff-material.js:1856ff`, 8 Schichten, 0,32 m Halm-Schicht).
2. **Wind als EIN sichtbares Feld bis zum Saum — 1/2.** *Messung:* NEUE Linse `werkbank bild --zeit` (zwei Frames mit Δt): zeitliche
   Luma-Varianz der Halm- und Kronen-Pixel je Ring (0–15 / 15–60 / 60–300 m) und die Kreuzkorrelation Gras ↔ Krone entlang `uWindDir`;
   2 = Varianz > 0 in jedem Ring und r ≥ 0,6. *Beleg:* die Quelle ist EIN Term `_windSwayOffset` (`stamm/stoff-material.js:87`) mit Phase
   und wandernder Böe aus `WIND_BOE`, dieselben Zahlen hört das Ohr (`_windBoeAt`); der Baum schwingt mit Stamm-, Ast- und Blatt-Frequenz aus
   f0 = kF·δ/H, sein Schatten mit (`stamm/stoff-instanz.js:1205-1223`); 6 Biege-Sphären (`GRAS_BEND_SLOTS`, `stoff-material.js:2715`).
   Aber die Parallax-Halm-Schicht jenseits von 18 m liest keinen Wind (`stoff-material.js:1850-2000`), die Karte hat einen eigenen Term
   (`:2368`), und keine Linse misst Bewegung.
3. **Wald-Silhouette bis zum Horizont — 0/2.** *Messung:* laub-kante kante ≤ 0,22 an L0, L1 und L2; NEU der Sägezahn-Anteil am
   Himmels-Rand bewaldeter Kämme in 0,4–4 km (Struktur-Tensor-Kohärenz < 0,3 gegen REF real-mischwald.jpg), im Haushalt boden + karten.
   *Beleg:* echte Bäume stehen nur bis foliageRadius max 240 m, zur Laufzeit geregelt (`stamm/dirigent-regler.js:1965-1966`); die Karte
   reicht bis 384 m (`FERN_KRONE_NAH` sichtM 384, `stamm/gelaende-fern.js:1031`); dahinter ist der Wald nur Albedo (`_fernKroneNahMisch`
   `:1123-1135`), der Ring trägt „kein Geomorph" (`:218`), der Kamm bleibt glatt. Das Kronendach-Mesh ist ein Flag-Zwilling, Default aus
   (`stamm/bild-himmel.js:416-418/:544`, `stamm/dirigent-kern.js:338`). laub-kante fimp:atlas:L2 0,2635 > 0,22 ROT.
4. **LOD-Übergänge unsichtbar unter Bewegung — 1/2.** *Messung:* NEUE Bewegungs-Linse: Gang, Ritt und Sicht-Wechsel über einen festen
   Pfad an der Mess-Wiese, gezählt werden Pixel mit ΔLuma > 18, die keine Bewegung erklärt, je Stufen-Wechsel und je Rand des
   foliageRadius; dazu laub zweiton = 0. 1 = in Ruhe sauber. *Beleg:* in Ruhe sauber, zweiton 0 an f:fichte:L1, f:tanne:L0/L1,
   fimp:atlas:L2 (Radeon, V18.546.16); Hysterese in `_chooseLODForDistance` (`stamm/vegetation-streu.js:1790`), EIN Auge `_lodAuge`
   (`stamm/stoff-material.js:2031`). Unter Bewegung misst niemand: der Regler lässt den Wald-Rand zwischen 70 und 240 m wandern
   (`dirigent-regler.js:1965-1967`), die Linsen prüfen Ruhe und Mittag (Schöpfer-Befund F1–F6, 17.10.).
5. **Die Natur gehorcht dem Ort (EINE Wand, EINE Ableitung) — 0/2.** *Messung:* NEUE Linse aus dem Ausgabe-Bild: Halm- und
   Büschel-Pixel in jeder Haus-Box des Körper-Satzes im Dorf = 0; Zwillings-Zähler D2 = 0 (Wuchs Rich ⇄ Legacy, Stamm-Baumgeometrie,
   Wasser-Urteile ×3, Grundriss-Leser ×3). *Beleg:* die Schicht-Wand gegen Häuser hält zu 0 %: 24 von 25 Häusern innen grün, 119 Büschel im
   Anbau (SYSTEMKARTE D2). Halm (`stoff-material.js:1981`) und Nah-Wiese (`vegetation-wiese.js:33-93`) lesen keinen Grundriss;
   `_grundSchnitt` fehlt am Kopf, die Vorlage wiese-im-haus 69498f91 ist ungemergt. Zwillinge `vegetation-streu.js:1959` (Rich ⇄
   Legacy), `vegetation-baum.js:753` (eigene Baum-Geometrie), Wasser-Urteile `vegetation-baum.js:1633` ⇄ `vegetation-wiese.js:75`.

**Hebel**
1. **Fernwald als Gestalt des EINEN Gesetzes** · +2 (K3 0 → 2: Silhouette + L2-Kante) · 2 Wellen, ≈ 2–3 d, ≈ 0 Befehle extra, Dreiecke im
   Ring-Haushalt boden (12 / 120k) · S8, derselbe Schnitt wie Licht H2 · Pflicht A (laub-kante). Der Fern-Ring hebt jeden Vertex um
   Kronen-Höhe × Deckung aus derselben `aKrone` (`stamm/gelaende-fern.js:238`, `_fernKroneNahMisch :1123`); den Sägezahn liefert ein Hash je
   `planForestCell`-Zelle (phyto-core `:2652`) im WGSL, eine Wurf-Ebene in Kaskade 1. Im selben Commit fallen der Flag-Zwilling
   `canopyStreaming` und `_canopy*` (`stamm/bild-himmel.js:416-571`, `stamm/dirigent-kern.js:338`). Die Karte L2 bekommt einen Bake mit
   Hebung (Hemi-Oktaeder 8×4, Spike ab86edc0; `foundry-core.js` impostor `:719`), damit laub-kante ≤ 0,22 hält.
2. **Die Wiese wogt bis zum Saum** · +2 (K2 1 → 2, K4 1 → 2, sobald die Linse an den Stufen-Rändern 0 meldet) · 1 Welle, ≈ 1–1½ d,
   Kosten-Probe gegen die Ratsche nahWiese. Das Tsushima-Gesetz in unsere Ringe: ferne Kacheln mit doppelter Kante bei gleicher
   Büschelzahl (L2 trägt schon 2,4× gerade Halme), so wächst der Radius von 14 auf ≈ 40 m bei denselben ≤ 80k Dreiecken
   (`stamm/daten.js:447`). Die Parallax-Funktion (`stamm/stoff-material.js:1856-1910`) liest Phase und Böe der EINEN Wind-Größe
   (`_windSwayOffset :87`) als Scherung des Relief-Marches. Die Bewegungs-Linse (Luma-Varianz je Ring, Pop-Zählung auf dem Pfad) steht
   vorher ROT am Täter.
3. **Die Natur-Wand aus dem EINEN Grundriss** · +2 (K5 0 → 2; nur +1, wenn die Zwillinge stehen bleiben) · ≈ 2–3 d · S4, geteilt mit
   Siedlung H3. `_grundSchnitt` aus der Vorlage 69498f91 in `gelaende-core.js` + `voxel-worker.js` heben (Lehre 14); Halm
   (`stoff-material.js:1981`), Nah-Wiese (`vegetation-wiese.js:33-93`) und Räumer (`vegetation-baum.js:1983` `_naturRaeumen`) lesen EINEN
   Grundriss aus fachwerk `ortPlan`. Die Linse aus dem Ausgabe-Bild (Halm-Pixel in den Haus-Boxen) ist vorher ROT mit 119 Büscheln im
   Anbau; Rich ⇄ Legacy (`vegetation-streu.js:1959`) und die Stamm-Baumgeometrie (`vegetation-baum.js:753`) fallen in derselben Welle.

---

## 3 Siedlung: Dorf bis Stadt, Bauen — 3/10

D3: `fachwerk-core.js` · `worlds/fachwerk` · `stamm/siedlung-*.js` · `stamm/werkstatt-bauen.js`

**10/10.** Jede Welt-Zelle trägt die Siedlung, die ihr Boden, ihr Wasser und ihre Epoche verlangen. Vom Weiler am Bach bis zur ummauerten
Großstadt am Fluss laufen die Gassen auf den Höhenlinien; jedes Haus ist begehbar bis in den Keller, Bewohner haben Rolle und Tagesgang,
das Haus des Spielers wird Teil desselben Plans wie das Dorfhaus — bei p95 ≤ 33 ms auf GTX 1060 und Radeon 890M.
**Wo wir sie schlagen.** AC Unity baut EIN Paris von Hand, in einer Epoche, mit jedem vierten Haus innen; wir bauen jede Stadt jeder
Region und Epoche mit Innenraum in 4 von 4 Häusern aus dem Gesetz (Treppe nach Norm, Herd, Möbel), und die Jahresringe zeigen, wie die Stadt
gewachsen ist. CityEngine und Houdini rechnen offline und liefern Gigabytes; unser Plan ist eine Funktion (Seed, Ort, Epoche) im Browser,
deren Kosten am Schirm hängen und nicht an der Stadtgröße. Manor Lords lässt den Spieler Parzellen ziehen; bei uns übernimmt das
Ort-Gesetz, was Spieler und KI bauen, und lässt die Siedlung daraus weiterwachsen.

**Die Besten**
- **Esri CityEngine / CGA** (Parish & Müller, SIGGRAPH 2001; Müller, Wonka, Haegler, Ulmer, Van Gool, SIGGRAPH 2006): ganze Städte aus
  Eingabekarten (Land-Wasser-Grenze, Bevölkerungsdichte); die Kette läuft Hauptstraße → Straßennetz → Parzelle → Baumasse → Fassade →
  Fenster und Türen → Ornament, vorgeführt u. a. an Pompeji. Weg: L-Systeme mit globalen Zielen und lokalen Zwängen — die Straße weicht
  Gelände und Wasser, nicht umgekehrt; eine kontextsensitive Formgrammatik, in der Fenster und Türen fragen, ob sie verdeckt sind.
  history.siggraph.org/?p=116923 · doi.org/10.1145/1141911.1141931
- **Assassin's Creed Unity, Paris 1789** (Ubisoft 2014): laut Ubisoft über 5 000 NPC im Bild, in einer Szene 10 000; jedes vierte Gebäude
  eingerichtet, kein Ladeschirm zwischen Straße, Haus und Untergrund. Weg: Fassaden von Hand mit kalibrierten PBR-Stoffen; Menge durch „AI
  Recycling" (40 echte KI, 120 hochaufgelöste Modelle, ein Pool tauscht Low- gegen High-Res unbemerkt; GDC 2015 Cournoyer).
  gdcvault.com/play/1022141 · techradar.com (Inside AC Unity)
- **The Matrix Awakens / City Sample** (Epic, UE5, 2021; Zahlen aus einer Sekundärquelle): ≈ 7 000 Gebäude, 45 073 geparkte Autos (38 146
  fahrbar), über 260 km Straße, 512 km Gehweg, ≈ 7 Mio. Instanzen. Weg: prozedurale Houdini-Regeln für Straßenbreite, Gebäudehöhe,
  Gehweg-Unrat — ein kleines Kernteam baut die Stadt neu, indem es Regeln ändert; Nanite, Lumen, World Partition, Mass-KI für Menge und
  Verkehr. Offline gebacken, Daten im GB-Bereich. unrealengine.com/wakeup · provideocoalition.com (The Matrix Awakens: UE5)
- **Manor Lords, Valheim, Enshrouded** (Bauen als Spieler): in Manor Lords zieht der Spieler Burgage-Parzellen frei an die Straße, jede
  mit Hinterhof (Garten, Obstgarten, später Werkstatt) und drei Ausbaustufen, die Straßen folgen den Hügeln statt einem 90°-Raster.
  Valheim baut aus Teilen mit Statik, der Halt fällt mit dem Abstand zum Boden (blau bis rot). Enshrouded: Voxel-Terraforming, dauerhaft
  gespeichert, Bauklötze von 4, 2 und 1 m, nach den meisten Quellen ohne strenge Statik. wiki.hoodedhorse.com/Manor_Lords/Buildings ·
  nyra.nyc/articles/serf-city · gamespot.com (Manor Lords upgrade guide) · supercraft.host/wiki/enshrouded

**Kriterien**
1. **Haus = Gesetz, Labor = Welt (Form, Stoff, Innenraum) — 1/2.** *Messung:* Soll-Tafel haus, albedoVerhaeltnis Labor/Welt im Rand 0,10
   (`diag-albedo-tafel --labor --echt`); Haus-Ton L2/L0 ≥ 0,95 (`werkbank albedo`); Türen begehbar 16/16 (`diag-settlement`); jedes Haus in
   L0 begehbar mit Innenraum und Keller (neue Probe: Gang Tür → Keller → Dachboden ohne Anti-Clip-Hub). *Beleg:* das Gesetz trägt ≈ 90 %:
   Treppen-Norm `fachwerk-core.js:207` (Auftritt 0,26, Steigung 0,19, Kopf 2,00), Herd `:505/:804`, Möbel `:961`, Türen 16/16, Sockel 0 m
   (K10). Die Klasse haus ist ROT, weil das Labor die Bau-Stoffe anders zeigt als die Welt (K5: 7 von 8 Klassen ROT); Haus L2/L0 0,788
   (`fachwerk-core.js:1999/:2612`); der Keller hat keinen Hohlraum (`gelaende-core.js:1338`), der Anti-Clip hebt den Spieler heraus
   (`koerper-bewegung.js:862-877`).
2. **Stadt-Genese in der Welt (Weiler bis Metropole, Mauer, Epoche) — 0/2.** *Messung:* neue Linse in `diag-settlement` Teil C: Zensus
   der Auto-Zellen in einem 8 × 8-km-Fenster mit Größen-Histogramm weiler…metropole und Rang-Größe-Gesetz (Zipf-Exponent 0,8–1,2); der
   Export trägt `mauer` und `graph`; Epoche moderne ergibt stadt; ein Beweisbild einer ummauerten Stadt aus dem Ausgabe-Pfad. *Beleg*
   (selbst gemessen in Node am Kopf): der Kern liefert die Hierarchie (nH 40 → 43 Slots stadt 102 m; nH 120 → 127 Slots grossstadt 240 m;
   nH 300 → 307 Slots metropole 418 m; nH 500 → 406 Slots). In KEINEM Export stehen `mauer` oder `graph` (`fachwerk-core.js:5460-5467`);
   Epoche moderne mit nH 18 ergibt markt, nicht stadt, weil `EPOCHEN.groesse` tot ist (`:2806-2814`; DORF liest nur DP.nH, `:2848`). Die Welt
   würfelt je Zelle nH 8..17 (`siedlung-ort.js:1935`, SIEDLUNG `:2844`), die DSL ist bei 120 abgeklemmt (`siedlung-ort.js:1786`). In der
   Welt gibt es nur Dörfer.
3. **Gelände-Treue (der Grundriss liest den Boden) — 1/2.** *Messung:* Gassen-Gefälle p95 ≤ 12 % VOR der Erdbau-Glättung; Erdbau je Haus
   als Median in m³; Halm- und Büschel-Pixel in jeder Grundriss-Box = 0 (F4); Hangdörfer über slopeMax 0,35 hinaus. *Beleg:* `ortPlan`
   hat Erdbau-Klassen (Platte ≤ 1,5 m, Hanghaus ≤ 4 m, darüber Stelzen; Fuß-Gefälle 12 %, Brücken, `fachwerk-core.js:5505-5514`). Aber
   `dorfLayout(plan, ext, seed)` ist geländeblind (`:3043`): das Gelände wird dem flachen Plan angeglichen; die Ortwahl nimmt nur flache Orte
   (slopeMax 0,35, `:2844`). F4 offen: 119 Büschel im Anbau, drei Grundriss-Leser (`vegetation-baum.js:1828`, `siedlung-ort.js:1384`,
   `feld-leben.js:2101`).
4. **Spieler-Bauen (Teil, Haus, Ort) — 1/2.** *Messung:* ein gesetztes Haus bekommt dasselbe Grund-Datum wie ein Dorfhaus (Erdbau,
   Vorplatz, Gasse; Byte-Vergleich der `ortPlan`-Ausgabe von Dorf-Slot und gesetztem Bau gleicher Gestalt); das Statik-Urteil der Werkstatt
   gilt beim Setzen; Hoch-Bauen über 48 m trägt; Häuser im Ortsradius werden Slots seines Plans. *Beleg:* die Werkstatt rechnet
   Schwerpunkt, Stützpolygon, Lastpfad, Knicken und Schwung (`werkstatt-bauen.js:1596-1609`, `bau-teile.js`); das Setzen in der Welt prüft
   nur die Treffer-Normale (Normal-Y > 0,5, `:517`) und „ebenen Boden" (`:377`); `confirmBuild` (`:364`) läuft ohne `ortPlan`, Erdbau und
   Vorplatz; der Edit-Kegel endet bei 48 m (`gelaende-boden.js:1138-1143`, F2a). Bauen gesamt ≈ 55 %.
5. **Leben und Last (Bewohner, Stadt im Profi-Band) — 0/2.** *Messung:* Bewohner mit Rolle je Haus aus dem Export (leute, rolle, tuer),
   Zähl-Linse ≥ 1 Körper je Haus, Tagesgang Haus → Werk → Platz; Ratsche stadt × gtx/radeon × ego/third mit p95 ≤ 33 ms; Zeit bis zum ersten
   Haus ≤ 0,5 s unabhängig von nH (Gebot 7). *Beleg:* Menschen-NPC 0 % (`.rolle` hat in `siedlung-*.js` 0 Treffer; rolle, leute, wohl
   formen nur Häuser, `fachwerk-core.js:2794/:5310`; Tiere halten Abstand, `kreatur-leben.js:1555-1561`). Das Dorf ist billig (GTX Ego
   gesamt 100 Befehle, 363k Dreiecke, 100 MB; Klasse bau 6 Befehle, 38k Dreiecke, `spec/profiband/ratsche-dorf-gtx-ego.json`), eine
   Stadt-Ratsche fehlt. Selbst gemessen: der Export wächst linear mit ≈ 49 ms je Haus, ohne Rang (nH 12 0,8 s; nH 120 6,2 s; nH 300 16,1 s;
   nH 500 26,5 s; Node, ein Lauf, Radeon-890M-Laptop), weil `massBau` je Haus vor dem Layout läuft (`fachwerk-core.js:5388-5392`).

**Hebel**
1. **Das Stadt-Tor in EINEM Schnitt** · +2 (K2 0 → 2) · ≈ 1 d · S6 (Teil Stadt); nur zusammen mit H2, sonst zahlt B. In `fachwerk-core.js`
   wird `EPOCHEN.groesse` zu nZiel (`:2848`, `:2806-2814`); SIEDLUNG bekommt eine Größen-Verteilung nach dem Rang-Größe-Gesetz statt
   nHMin/nHSpan (`:2844`); `mauer` und `graph` reisen im Export (`:5460-5467`), die Mauer wird Trasse in `ortPlan` (`:5551`). In
   `siedlung-ort.js` werden vier Klemmen zur EINEN des Kerns (`:1786`, `:1814`, `:1935`, `:2232`); die Kommentare zum Feature-Stopp fallen
   mit. Golden-Re-Mint `siedlung.json` als Vertrags-Akt.
2. **Export mit Rang, damit die Kosten am Schirm hängen** · +1 (K5, Last-Hälfte; die Bewohner-Hälfte trägt Mensch H1) · ½–1 d · S3.
   `exportSettlement` (`fachwerk-core.js:5377-5395`): Plan und Grund-Datum kommen sofort (ext aus FOOTPRINT `:443/:455/:1192` statt aus
   vollem `massBau`), `massBau` je Haus läuft über `_foundryAuftrag` nah zuerst (`siedlung-ort.js:1779` `spawnSettlement`). Gemessen wird
   erstes Haus ≤ 0,5 s unabhängig von nH (vorher Metropole 16 s CPU vor dem ersten Haus), danach die neue Ratsche stadt × gtx/radeon.
3. **EIN Grund-Datum je Bauwerk plus geländelesende Trasse** · +2 (K3 1 → 2, K4 1 → 2) · 1½–2 d · S4, geteilt mit Vegetation H3.
   `fachwerk-core.js` exportiert Box-Liste und Keller (`:172/:443/:455/:1192`); `gelaende-core.js` liest sie als Erdbau-Art mit
   Keller-Hohlraum (`:1319/:1338/:1462`); die drei Grundriss-Leser werden einer; `confirmBuild` (`werkstatt-bauen.js:364`) geht durch
   `ortPlan`, `_setzUrteil` (`:143`) liest `_workshopPhysicsVerdict`; `dorfLayout` (`:3043`) bekommt das `ctx.hoeheAt`, das `ortPlan` schon
   trägt, und gewichtet das Ast-Wachstum nach Gefälle. Der Abschnitt gehört zur Fachwerk-Hälfte von K1.

---

## 4 Tiere, Herden und Rudel — 2/10

D4: `tetrapoda-core.js` · `stamm/kreatur-*.js` · `worlds/tetrapoda`

**10/10.** Die Herde ist ein DATUM des Gesetzbuchs, keine zufällige Folge des Takts: ein Verband mit ID, Leittier, Revier und Lebensraum
aus dem Gelände-Kern. 30 Hirsche ziehen ausgerichtet über den Hang; der erste, der den Wolf wittert, hebt den Kopf, und binnen 1 s flieht
der ganze Verband in eine Richtung (Ausrichtung Φ ≥ 0,8; 1 = alle laufen gleich) und sammelt sich hinter der Kuppe. Das Rudel aus vier
Wölfen umstellt, reißt und frisst, der Fuchs kommt ans Aas. Die Fußfolge wechselt mit dem Tempo von Schritt über Trab zu Galopp. Das alles
kommt aus Zahlen in `tetrapoda-core` und hält im Profi-Band mit ≤ 1 ms KI je 150 Tiere.
**Wo wir sie schlagen.** RDR2 braucht 6 300 Motions und handgesetzte Tags, Horizon handvergebene Rollen. Bei uns folgt die Gangart aus
der Froude-Zahl (Alexander), die Rudelgröße aus der Ökologie (MacNulty), der Lebensraum aus dem Boden und der Zusammenhalt aus den
Couzin-Zonen: jede neue Gattung aus dem Studio trägt Gang, Verband und Jagd ohne eine Zeile Animation. Labor = Welt: das
Verhaltens-Studio zeigt mit den Couzin-Zonen als Reglern dieselbe Herde, die der Ofen der Welt gibt.

**Die Besten**
- **Red Dead Redemption 2** (Rockstar 2018): ≈ 200 Arten; Herden von Hirsch, Bison und Gabelbock; Wölfe jagen im Rudel; Hirsche reagieren
  auf einen ungesehenen Puma (der Alarm wird zum Hinweis); Pferde scheuen vor Bär und Klapperschlange; ≈ 6 300 Motions in EINEM
  Fortbewegungs-System für Mensch, Tier und Pferd. Weg: automatisches Blending über kleinstes, ideales und größtes Tempo je Animation,
  sechs 3D-Blend-Räume (Längs-, Dreh-, Seiten-Tempo, Neigung, Führ-Fuß), Gangwechsel auf den Fußfall synchronisiert, Neigungs-Cluster
  bergauf/bergab/flach, Navmesh-Prüfung der kommenden Fläche, tiefer Grund erkannt; Utility-Motivationen (Unruhe, Müdigkeit, Verletzung)
  wählen den Animations-Satz. GDC 2021 Kleanthous · gamedeveloper.com (Rockstar's quest for the ultimate video game horse) ·
  gamepressure.com/S013-amp.asp?ID=1462 · gameinformer.com (A glimpse into RDR2's wilderness, 2018)
- **Horizon Zero Dawn** (Guerrilla 2017): Herden mit ROLLEN (Watcher wachen; Strider, Grazer, Lancehorn weiden), über 25 Charakter-Typen;
  eine einzelne Maschine bittet von sich aus um Aufnahme in eine passende Herde. Weg: „The Collective" hält das Ökosystem und vergibt Rollen
  je Herde; jede Maschine plant per HTN; Sensoren (Sicht, Radar, Gehör, Kollision) mit eigener Empfindlichkeit; sechs Navmeshes nach
  Körpergröße, zur Laufzeit um den Spieler gebaut; Animation-Warping auf Distanz und Zeit. Beij, Game AI North 2017 · Berteling, GDC 2018 ·
  gamedeveloper.com (Behind the AI of Horizon Zero Dawn, Teil 1 und 2) · pushsquare.com (2019, Maschinen bitten um Aufnahme)
- **Far Cry 4 und Primal** (Ubisoft): Tiere ziehen in Gruppen, schützen einander und fliehen GEMEINSAM, sobald sich im Busch etwas rührt;
  Kadaver locken größere Raubtiere; nachts mehr Raubtiere, die Aufenthaltsorte wechseln; für das Elder-Mammut wurden Navigation und
  Flora-Layout auf seine Größe umgebaut. Weg (Vierbeiner auf Fels): additive Animation, Umgebungs-Erkennung, IK, Charakter-Physik. GDC 2015
  „Grounding Wildlife in the Mountains" (Konieczny/Pelletier), gdcvault.com/play/1022027 · digitallydownloaded.net/?p=46082
- **theHunter: Call of the Wild** (Expansive Worlds): persistente Herden mit Bedürfnis-Orten je Herde (Fressen, Trinken, Ruhen) zu festen
  Tageszeiten, manche Orte nur alle paar Tage; Jagddruck verschiebt einen Ort, löscht ihn oder treibt die Herde in einen anderen
  Kartenteil; der Ort hängt an den Tieren, die ihn nutzen. Nur Spieler-Beobachtung, nicht offiziell:
  steamcommunity.com/app/518790/discussions/0/3832042807509290882
- **Forschungs-Stand** (Maßstab der Gesetze): Couzin et al. 2002 (J. theor. Biol. 218, 1–11): drei Zonen (Abstoßung, Ausrichtung,
  Anziehung) plus Blickwinkel, größte Drehrate und Rauschen ergeben Schwarm, Torus oder ausgerichtete Gruppe, ohne Skript
  (cs.princeton.edu/courses/archive/fall24/cos597C/bib/couzinKJRF.pdf). MANN, SIGGRAPH 2018 (Zhang, Starke, Komura, Saito): Schritt, Pass,
  Trab, Galopp aus unbeschriftetem Hunde-Mocap über eine Gating-Mischung von Experten-Netzen, die Gangart folgt dem Tempo, ≈ 2 ms je Frame
  laut Autor (unbestätigt) (80.lv/articles/mode-adaptive-neural-networks-for-quadruped-motion-control).

**Kriterien**
1. **Verband: Herde und Rudel als Datum (Zusammenhalt, Ausrichtung, Leittier, Flucht auf Alarm) — 0/2.** *Messung:* Band herde an scheuen
   Hirschen (Wurf 3–7), wandernd UND fliehend: (a) Anteil der Glieder nach 60 s im Fenster fensterRaum × Paar-Raum um die Verbands-Mitte ≥
   0,9; (b) Ausrichtung in der Flucht Φ = |Σ v̂_i| / N ≥ 0,8; (c) der letzte Flüchter läuft ≤ 1,0 s nach dem ersten; (d) die Verband-ID hält
   600 s, fremde Rudel verschmelzen nie. Linse: Bühne herde in `scripts/lib/kreatur-proben.cjs`, heute nur Existenz (n > 0) am neugierigen
   Bären. *Beleg:* `herdeZug` läuft NUR im Neugier-Zweig (`stamm/kreatur-verhalten.js:2941-2989`); die Flucht rechnet je Tier einzeln vom
   eigenen Abstand zur Bedrohung (`:2922-2936`); `herdeZug` ist reine Kohäsion ohne Ausrichtung (`tetrapoda-core.js:1591-1614`), der Kern
   sagt selbst: „Das Herden-VERHALTEN (Verband, Anker, Ausrichtung) ist nach v1.0" (`:1585`); grep rudelId|leader|Leittier|_verband = 0;
   das Band herde prüft Existenz am Bären (`kreatur-proben.cjs:977-1007`). Was steht: Würfe von 3–6 Wölfen und 3–7 Hirschen mit geteiltem
   Leinen-Anker (`kreatur-leben.js:1572-1602`; Zahlen `tetrapoda-core.js:271`). Auf Zweig rudel-verband 0716fa0a: Kohäsion 0,19 → 0,98 —
   zählt nach dem Merge.
2. **Der Jagd-Kreislauf (Pirsch, Umstellen, Hetze, Riss, Fressen, Aas) — 1/2.** *Messung:* Jagd-Band mit echter HP statt hp = 1e6;
   Riss-Quote je Jagd: 4 Wölfe gegen einen erwachsenen Hirsch 20–40 %, ein Wolf < 10 %, gegen ein Kitz > 60 % (MacNulty 2014); nach dem
   Riss Zustand fressen ≥ 60 s am Kadaver; der Kadaver lockt als Geruchs-Quelle Fuchs oder Bär binnen 120 s (scentRangeM 50). *Beleg:*
   Pirsch, Ring-Platz (hetzM 6 m), „umstellt" (Lücke ≤ 1,5 · 2π/n) und Hetze im Sprint stehen (`stamm/kreatur-verhalten.js:296-391`; Zahlen
   `tetrapoda-core.js:140-163`); Band (C): 3 Wölfe beißen einen Hirsch in 60 s (`kreatur-proben.cjs:2095-2131`). Aber die Beute hat
   hp = 1e6 (`:2106`), ein Riss ist nie gemessen; grep kadaver|aas|fressen in `stamm/kreatur-*.js` = 0; das Rudel sind nur Jäger mit
   gleichem `_jagdZiel`, je Takt neu gezählt (`:301-319`): keine Rollen, kein Teilen der Beute.
3. **Gang und Leib (der Fuß steht, die Gangart folgt dem Tempo, Gelände, Labor = Welt) — 1/2.** *Messung:* gate:tier-gang Schlupf des
   Stand-Fußes ≤ 0,05 (steht); neu: die Fußfolge wechselt mit Fr = v̂² (Schritt → Trab bei Fr ≈ 0,5, Trab → Galopp bei Fr ≈ 2–3,
   Alexander & Jayes 1983) für alle 4 Gattungen; Tastgrad Schritt 0,6–0,7, Galopp ≈ 0,3; Querhang 20°: Schlupf ≤ 0,05; Absenz: kein
   CPG-Sinus in `worlds/tetrapoda`, das Labor ruft `gangSchritt`. *Beleg:* das Gang-Gesetz steht (Schrittlänge aus Froude, Zwei-Knochen-IK,
   Hub-Form, `tetrapoda-core.js:1304-1361`; Ratsche 0,05 in gate:tier-gang, `package.json:113`, `diag-tier-gang.cjs:28`). Aber die
   Fußfolge hängt an der Stimmung, nicht am Tempo: `MOTION.flee` phases [0,π,π,0] ist ein Diagonal-Trab auch im Galopp-Tempo
   (`tetrapoda-core.js:71-81`; Seed in `stamm/koerper-leib.js:1522-1531`); Tastgrad der Tiere fest 0,5, `tastgradLauf` trägt nur die
   Mensch-Zeile (`:1328-1356`); der Labor-Gang ist ein PD-Sinus-Zwilling (`worlds/tetrapoda/tetrapoda.js:239-262`, cpgPhase/legPDs).
4. **Lebensraum und Tagesrhythmus (Art × Ort × Uhr) — 0/2.** *Messung:* Anteil der Geburten in der Boden-Klasse ihrer Gattung (Hirsch:
   Wiese und Waldrand; Wolf: Wald; Bär: Fluss und Hang) ≥ 0,9 über 200 Würfe; Tages-Budget je Gattung (Äsen, Ruhen, Wandern, Trinken) über
   24 Spielstunden ±20 % eines Ethogramms (der Hirsch äst ≈ 50 %); Bedürfnis-Orte (Äsung, Tränke, Lager) je Verband, die unter Jagddruck
   wandern; Linse neu in der Familie diag-kreatur-leben. *Beleg:* die Art wird gleichverteilt gewürfelt (`souls[floor(rng · n)]` in
   `_pickCreatureSoulName`, `stamm/kreatur-leben.js:485-486`); `VERHALTEN.lebensraum` fehlt; Tag und Nacht nur als Gesten-Stimmung
   grasen/ruhen (`tetrapoda-core.js:120-128`); Trinken ist ein Auftrag (`aufgaben.trink*`, `:260-263`; `kreatur-verhalten.js:1593-1622`),
   kein Bedürfnis; grep hunger|durst = 0.
5. **Dichte und Kosten am Schirm — 0/2.** *Messung:* lebende Tiere im 500-m-Ring im Profi-Band (Wiese und Genesis, GTX und Radeon) ≥ 150,
   davon eine Herde ≥ 20 im Bild; KI-Takt (`werkbank takt`) ≤ 1,0 ms p95 bei 150 Tieren; Klasse tier im Haushalt ≤ 30 Befehle und
   eingerastet statt null; Nachbarschaft über das Gitter, O(n). *Beleg:* Deckel `maxCreatures` 20 (`stamm/dirigent-kern.js:254`),
   `FAUNA_TARGET` 8 und `FAUNA_MAX` 20 (`stamm/daten.js:125-130`), Geburt ≥ 130 m fern (`kreatur-leben.js:1928`): der Spieler sieht meist
   eine Gruppe. Die Separation ist O(n²), ausgelegt auf 20 (`kreatur-verhalten.js:394-395`); die Ratsche tier ist in allen 12 Ratschen
   null (`spec/profiband/ratsche-*.json`); Haushalt tier 30 Befehle, 60k Dreiecke (`haushalt.json:411-414`). Es trägt: KI-Bänder aiDiv
   1/1/3/6 bis 518 m (`dirigent-ankunft.js:1308-1311`), Gitter `FLOCK_CELL` 5 m (`kreatur-verhalten.js:2808`), Kosten je Art statt je Tier.

**Hebel**
1. **Der Verband ins Gesetzbuch** · +2 (K1 0 → 2) · ½–1 d · S6, erster Schritt · Stand: gebaut auf rudel-verband 0716fa0a, merge-reif,
   GTX-ABAB beauftragt. `verbandZug` neben `herdeZug` (`tetrapoda-core.js:1591`), Couzin-Zonen aus den vorhandenen Zahlen (Abstoßung =
   Paar-Raum, Ausrichtung = Mittel der Laufrichtungen, Anziehung = fensterRaum), das Leittier ist das erste Tier des Wurfs. Der Wurf stempelt
   Verband-ID und Leittier (`stamm/kreatur-leben.js:1602`); der Zug läuft im Wander-, Flucht- und Neugier-Zweig
   (`stamm/kreatur-verhalten.js:2922-2989`); Flucht-Alarm über den Verband (wer flieht, setzt `_bedrohtVon` für alle Glieder in
   Sichtweite); das Rudel ist der Verband statt der Jäger mit gleichem `_jagdZiel` (`:301-319`). Vorher ROT: Band herde an scheuen Hirschen
   wandernd und fliehend.
2. **Lebensraum und Dichte** · +2 bis 3 (K4 0 → 1, K5 0 → 1–2) · 1–1½ d plus Messplatz · S6 (lebensraum) · belastet E: der CPU-Takt reißt
   heute schon. `VERHALTEN.lebensraum` (Gattung × Boden-Klasse aus der Landform des Gelände-Kerns) in `tetrapoda-core.js`;
   `_pickCreatureSoulName` wählt nach Ort statt gleichverteilt (`stamm/kreatur-leben.js:474-486`), die Tags bleiben neutral (Lehre 8).
   Dichte: `maxCreatures` und `FAUNA_MAX` 20 → 150 (`stamm/dirigent-kern.js:254`, `stamm/daten.js:125-130`), Herden-Würfe 8–30 Hirsche
   (`tetrapoda-core.js:271`), Separation über das `FLOCK_CELL`-Gitter statt O(n²) (`kreatur-verhalten.js:394`); ferne Verbände rechnen als
   EIN Agent (das Leittier rechnet, die Glieder folgen in Formation, aiDiv-Band 3/6). Richter: OMEN-ABAB, die Ratsche tier rastet ein.
3. **Den Kreislauf schließen, die Gangart aus dem Tempo** · +2 (K2 1 → 2, K3 1 → 2) · ≈ 1 d · S6 (Rudel); der Gang ist ein Vertrags-Akt
   (Goldens neu prägen, Studio-Code nur unter Byte-Beweis, Lehre 11). Jagd: Riss → Kadaver mit Zustand fressen, der Kadaver wird
   Geruchs-Quelle für Fuchs und Bär (`_scentAt`); das Jagd-Band läuft mit echter HP und misst die Riss-Quote
   (`kreatur-proben.cjs:2095-2131`). Gang: die Fußfolge wählt nach Fr = v̂² (Schritt lateral → Trab diagonal → Galopp) statt nach Stimmung
   (`stamm/koerper-leib.js:1522-1531`, `tetrapoda-core.js:71-81`), `tastgradLauf` in die Tier-Zeile (`:1350-1356`); das Labor ruft
   `gangSchritt`, der CPG-Sinus in `worlds/tetrapoda/tetrapoda.js:239-262` fällt.

---

## 5 Menschen und NPC — 2/10

D5: Bewohner, Tagesablauf, Wege, Körper, Begegnung. Gemessen an integ-probe ff88b82d.

**10/10.** Jede Siedlung, die das Fachwerk-Gesetz plant, ist von genau den Menschen bewohnt, die ihr Gesetz zählt (leute, wohl, rolle).
Jeder Bewohner ist ein Seed mit eigenem Leib aus dem Genom, mit Heim, Werk und Weg über die Gassen und mit einem Tag, der eine reine Funktion
der Uhr ist. Nah ist er zu sehen, er grüßt und weicht aus, er spricht mit Gedächtnis — im Profi-Band: mindestens 200 Bewohner in einer
Stadt, davon mindestens 40 nah voll animiert, GTX 1060 p95 ≤ 33 ms.
**Wo wir sie schlagen.** Rockstar schreibt Routinen von Hand (1 200 Darsteller, 500 000 Zeilen) und schaltet sie außerhalb der Blase ab;
Warhorse braucht eine KI-LOD, damit 2 400 NPCs fern weiterleben. Bei uns IST der Tag f(seed, t): ein ferner Bewohner wird nicht simuliert,
sondern dort ausgerechnet, wo er zu dieser Stunde sein muss — fern kostet er 0, und wer ankommt, findet ihn am richtigen Ort (Gebot 7).
Census-Tiefe wie Watch Dogs: Legion, aber aus dem Gesetz statt aus der Kleidung: Rolle, Wohlstand und Epoche des Hauses bestimmen den
Menschen, durch jedes Jahrhundert, unbegrenzt viele, keine zwei gleich. Labor = Welt: das Körperstudio zeigt den Schmied, dem man im Dorf
begegnet, und das LLM spricht aus seinem Datensatz.

**Die Besten**
- **Kingdom Come: Deliverance II** (Warhorse): knapp 2 400 NPCs, viermal so viele wie in KCD1, etwa die Hälfte in EINER Stadt
  (Kuttenberg); jeder hat einen Tagesablauf, der weiterläuft, auch wenn der Spieler fort ist, bei 60 fps. Weg: ein LOD-System für die
  KI-Simulation (Frame-Zeit und Speicher klein, Skript-Schnittstelle unabhängig von den LOD-Stufen), Standard-Logik vom Skript in Code,
  Arbeit auf Threads verteilt, Unnötiges gestrichen; Verhalten aus GOAP + Modular Behavior Trees (Designer geben Ziele, keine Schritte).
  GDC 2026 Petr Smrcek (schedule.gdconf.com/session/…/915120) · GDC Vault Matej Marko (gdcvault.com/play/1035576)
- **Red Dead Redemption 2** (Rockstar): 1 200 Darsteller im Motion-Capture, davon 700 Sprecher, 500 000 Dialogzeilen, 300 000 Animationen,
  2 200 Capture-Tage; Stadtbewohner mit festen Tagesplänen (aufstehen, arbeiten, Saloon, schlafen), die bei der zweiten Begegnung anders
  grüßen, je nachdem wie die erste lief; der Körper reagiert physikalisch (an die Wunde greifen, ducken, vom Pferd gerissen). Weg: Routinen
  von Hand, aktiv nur in einer Blase um den Spieler; Euphoria (NaturalMotion) verbindet Physik, KI und Hand-Animation, für RDR2 laut Rockstar
  radikal überarbeitet. Houser-Interview (Vulture 2018, wiedergegeben bei gamespot.com/articles/…/1100-6462531/) ·
  wccftech.com/rockstar-euphoria-evolved-rdr2 · mein-mmo.de (3 NPCs in RDR2 einen Tag, 286499)
- **The Sims** (Maxis) und **Skyrim Radiant AI** (Bethesda): Sims wählen über ein Bedürfnis-System (Utility-KI): jedes Objekt wirbt mit
  seinem Gewinn je Bedürfnis, gewichtet mit den Motiv-Pegeln (−100 bis 100), gewählt wird zufällig unter den besten, damit niemand
  roboterhaft wirkt; das Wissen steckt im Objekt (Smart Objects). Skyrim: Pakete nach Uhrzeit und Dauer (arbeiten, essen, schlafen) und ein
  Sandbox-Paket, das Möbel, Essen, Idle-Marker und andere Figuren selbst benutzt und wiederholte Aktionen abwertet.
  gameindustrylibrary.com (GMTK The Genius AI Behind The Sims) · wiki.beyondskyrim.org (NPC Packages) · geck.uesp.net (Wander Package)
- **Prozedurale Spitze, unsere eigene Liga:** Shadows of Doubt (ColePowered) erzeugt je Spielstand Hunderte Bürger mit Name, Job, Wohnung
  und Stammlokal, jeder macht 4–10 Wege am Tag, der Tag wird vorab in 10–15 s durchgeplant, Abweichungen live nachgerechnet, das Gedächtnis
  verblasst nach Vertrautheit, Auffälligkeit und Alter (colepowered.com/?p=34142). Watch Dogs: Legion (Ubisoft) „Census": eine
  relationale Datenbank, aus Kleidung und Uhrzeit folgen Job, Arbeitszeit, Einkommen, daraus Viertel, Hobbys, Bildung; eine
  Simulationsschicht erzeugt Zeitpläne über die ganze Welt mit Treffen von Freunden und Feinden (gamingbolt.com · gdcvault.com/play/1027018).
  AC Unity: mit höchstens 40 vollen KIs und 120 hochaufgelösten Modellen ≈ 10 000 Menschen im Bild, „AI Recycling" tauscht unsichtbar
  (gdcvault.com/play/1022141).

**Kriterien**
1. **Besiedlung und Skala (Plan wird Körper) — 0/2.** *Messung:* neue Linse Bewohner-Zensus (Familie `scripts/lib/kreatur-proben.cjs`):
   Körper mit Menschen-Leib je Siedlung ÷ Σ leute im `ortPlan` (Soll 1,0), am Start-Dorf und an einer Stadt mit nH ≥ 27; ABAB an der GTX
   mit ≥ 4 Boots je Seite: Frame p95 ≤ 16,8 ms, CPU-Takt nicht schlechter als ohne Bewohner; 1 = Start-Dorf voll bewohnt, 2 = ≥ 200
   Bewohner in der Stadt, ≥ 40 nah voll animiert; Selbsttest: ein Haus ohne Bewohner macht die Linse ROT beim Namen. *Beleg:* keine Siedlung
   trägt einen Menschen; `.rolle` in `stamm/siedlung-*.js` 0 Treffer; `CREATURE_SOULS` (`stamm/kreatur-leben.js:1834`) kennt nur Tiere;
   `maxCreatures: 20` (`stamm/dirigent-kern.js:254`) deckelt alle Körper; `_kreaturGrundFrei` (`kreatur-leben.js:1558-1562`) verbietet jede
   Geburt in der Hülle eines Dorfs; die Rollen wohnhaus, schmiede, scheune, burg (`fachwerk-core.js:2872/2898/2911/2901`) und `wohl`
   (`:2874`) formen nur Häuser.
2. **Tagesablauf (Rolle × Uhr × Ort) — 0/2.** *Messung:* neue Zeitraffer-Linse: 24 Spielstunden über die Uhr des Spieler-Worts; je
   Bewohner Anteil der Stunden am Soll-Ort ≥ 0,9; 4–10 Wege je Tag (Band von Shadows of Doubt); der Plan ist bei gleichem Seed bit-gleich;
   nach 1 h Abwesenheit liegt der Bewohner auf ±2 m dort, wo f(seed, t) ihn hinsetzt; Selbsttest: ein um 6 h verschobener Plan ist ROT.
   *Beleg:* einen Tagesplan gibt es nicht (grep tagesablauf|zeitplan|schedule findet nur Fremdes wie `_scheduleEditSave`,
   `siedlung-ort.js:2303`); `koerper-core.js` hat kein Kapitel VERHALTEN. Das Vorbild steht: `tetrapoda-core.js:100-121` VERHALTEN.stimmung
   kennt tag und nacht. Die Akte der Menschen (MOTION, `koerper-core.js:69`) wählt nur das Studio-Skript (`koerperstudio.js` emo.set), nie die
   Welt.
3. **Wege und Raum (Gassen, Türen, keine Durchdringung) — 0/2.** *Messung:* neue Wege-Linse: Anteil der Gangzeit auf roads, feldwege und
   Plätzen ≥ 0,85; Eintritt ins Haus nur über `dims.tuer` (100 %); 0 Durchdringungen von Grundriss oder Wasser; 0 Steckenbleiber (> 5 s ohne
   Fortschritt) in 24 h; Selbsttest: ein Haus quer über den Weg macht die Linse ROT am Täter. *Beleg:* keine Wegsuche (grep
   astar|navmesh|findPath = 0); die Wege-Karte ist eine Zeichen-Schicht aus Array-Texturen (`stamm/siedlung-satz.js:1071-1147`), kein Graph;
   den `graph` streicht der Export (`fachwerk-core.js:5460-5466`); `roads` und `feldwege` reisen (`:5469-5470`), die Tür steht in
   `B.dims.tuer` (`:5250`), aber kein Körper liest sie: die Daten sind da, Leser 0.
4. **Körper und Ausdruck (Leib, Gang, Gesicht, Vielfalt, Kosten) — 1/2.** *Messung:* gate:mensch-anatomie (`scripts/diag-mensch-anatomie.cjs`,
   Selbsttest S1–S3) grün, Soll-Tafel mensch-kopf GRÜN; Vielfalt: 50 Bewohner aus 50 Seeds, keine zwei gleich, Körperhöhe streut ≥ ±8 %,
   Gesichtsmaße in MENSCH_SOLL; Kosten: 50 Bewohner im Dorf an der GTX ≤ 150 000 Dreiecke und ≤ 1 ms CPU (LOD-Kette wie beim Tier, fern
   Glieder-Kapseln), gelesen über `werkbank zaehlen`, ABAB. *Beleg:* der EINE Mensch steht (`bauMensch`, `koerper-core.js:1203`; Preset mensch
   `:449`; 10 Stimmungen in MOTION `:69`; der Labor-Gang liest dasselbe `_TC.gangSchritt`, `koerperstudio.js:24`); mensch-kopf an der Radeon
   geheilt (Gesicht 0,5 → 1, Kopf L0 11 880 → 11 354 Dreiecke, V18.546.9; am Spawn 8 Zellen ROT, weil der Rechner die Pose nicht liest).
   Es fehlt: `_rollHumanoidGenome` (`stamm/koerper-leib.js:5`) hat keinen Aufrufer, jeder Mensch gliche dem anderen; keine physische
   Treffer- oder Sturz-Reaktion wie Euphoria; die Kosten einer Menge sind ungemessen.
5. **Begegnung (Reaktion, Gespräch, Gedächtnis) — 1/2.** *Messung:* neue Begegnungs-Probe: auf 3 m wendet sich der Kopf des NPC in
   ≤ 0,5 s zu, er weicht ohne Berührung aus; im Gespräch zitiert die Antwort ≥ 2 Fakten aus dem Bewohner-Datensatz (Rolle, Haus, Stunde;
   headless mit Stimmen-Attrappe, echt mit LLM-Schlüssel); bei der zweiten Begegnung bezieht er sich auf die erste; Gewalt in der Nähe lässt
   Umstehende fliehen; 1 = NPC reagieren im Spiel auf den Spieler. *Beleg:* Tiere reagieren im echten Spiel (Jagd-Hetze am Lauf des Spielers,
   `stamm/kreatur-verhalten.js:2793ff` `_kreaturJagdZug`; Scheu, Neugier, Biss, Tod). Gespräch nur, wenn man eine Kreatur beim Namen anspricht,
   und nur mit LLM (`stamm/feld-nexus.js:1404-1420` `maybeAnswerCreature`), ohne Schlüssel ein Hinweistext; kein Gedächtnis, keine Menschen;
   der LLM-Lauf mit Schlüssel (Drehbuch-Schritt 18) ist offen.

**Hebel**
1. **Bewohner = Kreatur mit Menschen-Leib** · +2 (K1 0 → 1: Start-Dorf bewohnt; K4 1 → 2: Vielfalt aus dem Genom) · ≈ 1 d · S6 (Mensch).
   `stamm/kreatur-leben.js:1834` (`CREATURE_SOULS` bekommt mensch) und `:1558` (`_kreaturGrundFrei`: Geburt AM Haus statt Sperre für den
   Bewohner-Wurf); `stamm/koerper-leib.js:5` (`_rollHumanoidGenome` wird vom Wurf getragen, Hash-Seed statt Math.random);
   `fachwerk-core.js` `exportSettlement :5440-5470` exportiert je Haus rolle, leute und tuer (steht schon in `B.p.rolle` und `B.dims.tuer`
   `:5250`; additiv mit Byte-Beweis, Lehre 11). Linse: Bewohner-Zensus, vorher ROT bei 0 von Σ leute.
2. **Tagesablauf als reine Funktion der Uhr** · +3 (K2 0 → 2, K1 1 → 2: die Skala kostet fern nichts) · ≈ 1½ d · S6 (koerper-core VERHALTEN) ·
   auf H1. `koerper-core.js` bekommt ein Kapitel VERHALTEN in der Form von `tetrapoda-core.js:100-121`: `tagesPlan(seed, rolle, heim, werk,
   stunde)` → {ort, akt}, deterministisch, Rollen aus dem Fachwerk (wohnhaus, schmiede, gasthaus, scheune, burg). Der Kreatur-Takt liest den
   Plan nah, fern setzt der Plan nur die Lage; damit wird der ruhende Leib aus K59 (`stamm/kreatur-verhalten.js:2787`) zur KI-LOD, und der
   Deckel `maxCreatures` 20 (`dirigent-kern.js:254`) gilt nicht mehr für ruhende Bewohner. Linse: Zeitraffer 24 h, Anteil am Soll-Ort ≥ 0,9.
3. **Wege über den Gassen-Graphen, Gespräch aus dem Datensatz** · +3 (K3 0 → 2, K5 1 → 2; der volle LLM-Lauf braucht den Schlüssel aus
   Drehbuch-Schritt 18) · ≈ 1½ d · S6 · auf H1 + H2. Aus roads und feldwege (`fachwerk-core.js:5469-5470`) plus den Tür-Knoten `dims.tuer`
   entsteht EIN Graph je Siedlung; der A*-Weg je (heim, werk) wird einmal gerechnet und im Idle gecacht (Lehre 14), der Leib folgt der
   Polylinie, die Separation (`stamm/kreatur-verhalten.js:397`) hält Abstand. `maybeAnswerCreature` (`stamm/feld-nexus.js:1404`) reicht den
   Bewohner-Datensatz (Name, Rolle, Haus, Stunde, letzte Begegnung) als Kontext weiter, eine Gedächtnis-Liste je Bewohner merkt die
   Begegnungen. Linse: Gangzeit auf Wegen ≥ 0,85, 0 Wand-Durchdringungen.

---

## 6 Fahrzeuge, Fahrgefühl und Kamera — 3/10

D6: `vehicle-core.js` · `stamm/koerper-fahrt.js` · `stamm/koerper-bewegung.js` · `worlds/garage`

**10/10.** Ein Wagen aus dem Gesetz (`vehicle-core`) fährt mit 250+ km/h über die Gesetzes-Welt, ohne Loch im Boden und mit p95 ≤ 33 ms
im Profi-Band. Seine Reifen haben eine Kurve mit Spitze und Abfall und greifen auf jedem Boden des Gelände-Gesetzes anders (Weg, Gras,
Schotter, nass, Schnee); Labor = Welt gilt auf den Millimeter. EINE Rig-Kamera aus dem Kern atmet das Tempo (FOV, Arm, Fahrtvektor),
erlaubt Maus-Orbit mit Rückkehr und trägt jeden Übergang ohne Sprung: Ego ↔ Third in voller Fahrt, Auf- und Absteigen, Hang.
**Wo wir sie schlagen.** Forza und BeamNG tunen jede Kamera und jede Strecke einzeln; bei uns folgt die Kamera aus den Maßen des Wagens
(Länge, Dach) und der Grip aus derselben Boden-Klasse, die den Boden malt. Staub, Spuren, Spritzwasser und Klang lesen denselben
Fahr-Zustand, und weil die Welt eine Funktion ist, weiß das Streaming, wo der Wagen in 2 s steht. Jedes prozedurale Fahrzeug ist ab dem
ersten Bild AAAA-getunt; das kann eine kuratierte Welt nicht.

**Die Besten**
- **Forza Motorsport 2023** (Turn 10) / **Forza Horizon 5** (Playground): Reifen-Kontakt mit 8 Punkten bei 360 Hz statt 1 Punkt bei 60 Hz,
  laut Turn 10 ≈ 48-fache Reifentreue; Kerbs und Fahrbahn fühlbar; FH5 als offene Welt in 4K/60 auf Series X, Wetter und Jahreszeiten
  ändern die Strecke. Weg: eigenes Reifenmodell mit Kontaktfläche, Physik vom Bild entkoppelt (Chris Esaki, Forza Monthly 2021).
  gtplanet.net/forza-motorsport-new-tire-model-20210528 · racedepartment.com (Forza tire physics)
- **BeamNG.drive**: Soft-Body-Physik mit ≈ 400 Knoten und 4 000 Balken je Wagen bei 2 000 Hz, getrennt vom Bild-Takt, 4–6 Wagen auf einem
  Quad-Core; jeder Crash, jede Feder und jede Verwindung aus EINEM Gesetz. Weg: Knoten sind Massepunkte, Balken Federn mit Dämpfern, alles in
  einem Integrator. documentation.beamng.com/beamng_tech/architecture · beamng.com/game/about/physics
- **Kamera-Handwerk: John Nesky** (Journey, GDC 2014 „50 Camera Mistakes") und **God of War 2018** (Arazi, Wilkins, Oksuz, GDC 2019): Nesky
  nennt als Fehler Richtungsgefühl untergraben, Distanzurteil stören, Sichtlinie brechen, Simulator-Übelkeit, FOV zu eng, zu viel Wackeln,
  lineare Empfindlichkeit. God of War zeigt das ganze Spiel als EINE ungeschnittene Einstellung, jeder Übergang ohne Schnitt unter
  Spieler-Kontrolle. Weg: Regeln statt physikalischer Feder, Kamera als eigenes System mit Kollisionsstrahl. gdcvault.com/play/1020460 ·
  gdconf.com (God of War combat and camera)
- **GTA V** (Rockstar) und die **Tempo-Studie 2017**: Chase-Cam mit Maus-Orbit, die nach ≈ 1 s Ruhe hinter den Wagen zurückkehrt (Zahl aus
  der Community); die Studie (EUDL 10.1007/978-3-319-55834-9_14) zeigt: größeres FOV und bei hohem Tempo eine höhere Kamera steigern das
  gefühlte Tempo, starke Bewegungsunschärfe senkt es; iRacing richtet die Chase-Cam nach der Fahrtrichtung aus, nicht nach dem Chassis.
  Weg: Auto-Recenter mit Verzögerung, FOV und Höhe abhängig vom Tempo, Azimut auf dem Geschwindigkeitsvektor.
  steamcommunity.com/app/271590/discussions/0/611703999972682423 · eudl.eu/doi/10.1007/978-3-319-55834-9_14 ·
  support.iracing.com/support/solutions/articles/31000157467

**Kriterien**
1. **Das Fahr-Gesetz: Reifen · Boden · Takt — 1/2.** *Messung:* (a) die Reifenkurve hat eine Spitze bei 6–10° Schlupf und fällt danach um
   ≥ 15 %, dazu kombinierter Schlupf; (b) μ je Boden aus dem Welt-Gesetz: Bremsweg 50 → 0 km/h auf Gras gegen Weg ≥ 1,5×, nass ≥ 1,3×; (c)
   Sim-Takt im Fahr-Schritt ≥ 240 Hz; Labor = Welt S1 ≤ 0,01 m hält. Linse: gate:fahr-leben mit neuem Teil K6. *Beleg:* EIN Gesetz für Labor
   und Welt (`fahrSchritt`, `vehicle-core.js:3000`; S1, K1–K5 in `scripts/diag-fahr-leben.cjs`); Zweispur-Modell mit Schlupfwinkel
   (`:2900`), Lastverlagerung längs (`:2905-2908`), Reibkreis längs. Aber die Seitenkraft ist eine gesättigte Gerade ohne Spitze und Abfall
   (`Math.min(cap, G.CA_F * slipF)`, `:2911-2912`); der Grip ist je Rezept fest (`cap = G.maxGrip * G.grip`, `:2910`), liest weder Boden noch
   Wetter, nur Wassertiefe; der Takt ist FIXED_DT 1/60 (`stamm/koerper-bewegung.js:2037`); die Eingabe ist digital 0/1 (`:1317-1320`),
   getGamepads 0 Treffer.
2. **Tempo mit Welt — 0/2.** *Messung:* Höchsttempo GT ≥ 250 km/h, Supersport ≥ 300 km/h (exportDrive.vmax × FAHR.kmh); bei diesem Tempo
   gate:scatter-lod ≤ 1 Lücke je Bild, 0 fehlende Chunks im Blick-Kegel, Frame p95 ≤ 33 ms auf Radeon 890M und GTX 1060 (ABAB in Fahrt).
   *Beleg* (aus dem Kern gemessen, exportDrive je Preset): GT vmax 16,0 m/s = 58 km/h, Supersport 59, Limousine 53, Kompakt 54, SUV 49 km/h;
   Eichung `VMAX_REF = 10` (`vehicle-core.js:2478`), die Welt übernimmt sie 1:1 (`_fahrSatz`, `stamm/koerper-fahrt.js:987-990`). Selbst
   90 km/h hält die Welt nicht: auf fahrt-vorausschau 1bb06b4e (nicht in integ) misst die Radeon p95 17,0/25,2/33,5 ms bei 30/60/90 km/h,
   Lücken 1,0/1,6/4,4 je Bild, auf der integ-Basis 34/46/51 ms; der Boden lädt im Chebyshev-Abstand ohne Tempo-Term
   (`gelaende-chunks.js:2839`, SYSTEMKARTE W5).
3. **Die Chase-Kamera als Rig — 1/2.** *Messung:* EINE Kamera-Funktion im Kern; von 0 bis vmax wächst das FOV um ≥ 8° und der Arm um ≥ 15 %;
   im Drift zeigt der Azimut auf den Fahrtvektor (Fehler ≤ 15°); Maus-Orbit im Ritt mit Rückkehr nach 1–1,5 s; seitlicher Kamera-Ruck bei
   konstanter Lenkung p95 unter Soll; Kugel-Kollision ohne Sprung > 2 m. Linsen: Garage G7 + eine Welt-Linse in der Familie kamera.
   *Beleg:* `chaseKamera` im Kern (`vehicle-core.js:3051`, d882bbb4), gelesen von Garage und Welt (`koerper-bewegung.js:1633`), G7
   Fahrbahn-Elevation 14,8° grün; Kugel-Wurf und gleitender Arm (`:1730-1745`), Pflanzen werden durchsichtig. Es fehlt: Distanz und FOV
   sind fest (FAHR.kamera dist 9,6, `vehicle-core.js:2290-2297`; kein v-Term, `:3071`); der Azimut folgt der Gier des Bugs, nicht dem
   Fahrtvektor; die Welt übergibt die Gier immer finit, Maus-Orbit im Ritt gibt es nicht; das FOV hat 4 Schreiber (`kampf.js:857/869/908`,
   `koerper-fahrt.js:1416`), ein Tempo-FOV wäre ein fünfter.
4. **Übergänge unter Bewegung — 0/2.** *Messung:* SG1-Linse am Spielgang: nach Ego → Third in voller Fahrt steht der Azimut binnen 10
   Bildern ≤ 10° an der Gier; jede zeichnende Stufe des Wagens liegt ≤ 2 m an der Physik-Lage, Bild-Deckung des Wagens in Third > 0; Auf-
   und Absteigen in Fahrt und am Hang bergab ohne Kamera-Sprung > 0,5 m je Bild. *Beleg:* Schöpfer-Befund 17.10.: wechselt man in der Fahrt
   die Sicht, ist der Wagen in Third unsichtbar oder steht an alter Stelle, und Third ruckelt. Ursache: `_kamChase` wird nur beim Aufstieg
   genullt (`stamm/koerper-fahrt.js:756`), der Ego-Zweig setzt nur `_kamArm = undefined` (`koerper-bewegung.js:1815`); Third startet aus der
   Richtung vor der Ego-Fahrt, bei 180° Altwinkel bleiben nach 10 Bildern ≈ 36° (azEase 0,0016, kDt-Klemme 0,1); `setCameraMode` setzt kein
   Rig zurück (`dirigent-kern.js:1193`). Die Schnitte 7348d7db (Band-Partner) und 757d1b0f (Rig) liegen auf spielgang, NICHT in integ.
5. **Rückmeldung: der Körper fühlt die Fahrt — 1/2.** *Messung:* Zahl der Kanäle, die den Fahr-Zustand (speed, slipF/slipR, aLat, fHub,
   Boden-Klasse) außerhalb des Kerns lesen: Motor-Klang, sichtbare Federung, Reifenspur aus dem Schlupf, Staub und Spritzwasser je Boden,
   Kamera-Rauheit je Boden, Gamepad analog + Rumble; Soll 6/6, Leser-Grep über `window.__codeOf` + je Kanal ein Bild-Paar. *Beleg:* 2 von 6:
   Motor-Klang aus dem Gesetzbuch (klang:FAHRT, `stamm/klang.js:619`; Motor-Gesetz `klang-core.js:1193-1219`) und Federung Nick/Wank/Hub plus
   Rad-Winkel sichtbar (`stamm/koerper-fahrt.js:1146-1156`). Reifenspur, Bremsspur, Staub, Quietschen: 0 Treffer; Gamepad 0; Kamera-Rauheit
   keine. Ein Cockpit mit Brett, Säule und Lenkrad existiert (`vehicle-core.js:2152-2155`), aber der Aufstieg zwingt Third
   (`koerper-fahrt.js:808-809`).

**Hebel**
1. **Übergänge: das EINE Rig** · +2 (K4 0 → 2) · ½ d (der Code liegt gebaut auf spielgang) · S6 (Kamera) + F1a aus S8. 7348d7db und
   757d1b0f auf integ rebasen (`chaseKamera` steht dort, d882bbb4); EIN `_kamRig`-Reset in `setCameraMode` (`stamm/dirigent-kern.js:1193`)
   trägt `_kamChase`, `_kamT` und `_kamArm` zusammen statt einzelner Resets je Zweig (`koerper-bewegung.js:1815`, `koerper-fahrt.js:756`).
   Vorher die SG1-Linse ROT (Azimut ≤ 10° binnen 10 Bildern nach Ego → Third in Fahrt, Wagen-Stufe ≤ 2 m an der Physik-Lage).
2. **Die Kamera atmet das Tempo** · +1 (K3 1 → 2) · ≈ 1 d · S6 (Kamera). `chaseKamera` (`vehicle-core.js:3051`; FAHR.kamera `:2290`
   additiv, Byte-Beweis vehicle-contract) bekommt v und vlat: Azimut-Ziel = Gier + driftFolge·atan2(vlat, |vlong|), Arm = dist·(1 + distV·v/vmax),
   fov = fov0 + fovV·v/vmax. Die Maus setzt die Gier auf NaN (den Pfad hat die Garage), Rückkehr nach rueckS 1,2 s. Das FOV läuft über EINEN
   Schreiber `_kamFov` als Summe aus Kampf-Zoom, Fernglas und Tempo (statt `kampf.js:857/869/908` + `koerper-fahrt.js:1416`); Garage und
   Welt lesen dieselbe Funktion (`koerper-bewegung.js:1633`).
3. **Reifen mit Spitze, Grip je Boden, 240 Hz** · +1 (K1 1 → 2) · 1–1½ d · Studio-Code unter Byte-Beweis, Re-Mint ist ein Vertrags-Akt.
   In `fahrKraefte` (`vehicle-core.js:2910-2912`) weicht die gesättigte Gerade einer vereinfachten Pacejka-Kurve D·sin(C·atan(B·α)) mit
   Spitze bei 7–9° und 20 % Abfall; μ je Boden kommt als Eingabe e.mu (`stamm/koerper-bewegung.js:1315`, aus der Boden-Klasse von
   `_bodenSichtAt` und der Nässe des Wetters); der Kern-Schritt teilt dt in 4 Unter-Schritte (240 Hz), FIXED_DT bleibt 1/60. Linse:
   gate:fahr-leben K6 (Bremsweg Gras/Weg ≥ 1,5, Abriss nach der Spitze), S1 Welt = Labor ≤ 0,01 m hält.
   Danach als größter Brocken K2 (0 → 2, groß): F5 fahrt-vorausschau mergen, Vorausschau aus der Fahr-Lage in 2 s statt Chebyshev
   (`gelaende-chunks.js:2839`, S3), dann `VMAX_REF` (`vehicle-core.js:2478`) stufenweise hinter gate:scatter-lod anheben, GT 58 → 250 km/h.

---

## 7 Licht, Atmosphäre und Ferne — 3/10

D7: `stamm/bild-himmel.js` · `stamm/bild-sicht.js` · `stamm/gelaende-fern.js` · `foundry-core.js` (Impostor)

**10/10.** Jede Stunde, jedes Wetter und jede Distanz bis zum Horizont kommen aus EINEM Medium. Der Spieler sieht über den Tag eine stetige,
monotone Lichtkurve: die goldene Stunde 0,5–1 EV dunkler und wärmer als der Mittag, die Nacht lesbar statt schwarz oder gebleicht. Ferne
Grate tragen bis 20 km Wald-Silhouetten unter blauem, zur Sonne hin hellerem Dunst; Grate werfen Abendschatten in ferne Täler, Wolken ziehen
Schatten über die Wiese — für ≤ 1,5 ms auf der GTX 1060 (Himmel + Luft + Ferne).
**Wo wir sie schlagen.** Tsushima backt 3D-LUTs und Himmels-Sichtbarkeit, RDR2 und Horizon tunen über Künstler-Regler, Fortnite backt
HLOD- und Impostor-Atlanten. Unser Atmosphären-Gesetz teilen Studio und Welt (Labor = Welt); Horizont-Schatten und Wald-Saum fallen ohne
Bake aus dem Gelände-Kern und `treeParams` für JEDEN Ort einer endlosen Welt, und jede Stunde wird je Commit als Bildkurve bewiesen.

**Die Besten**
- **Ghost of Tsushima** (Sucker Punch, PS4; Jasmin Patry, SIGGRAPH 2021 Advances): durchgehende Tageszeit mit dynamischem Wetter;
  Dunst-Froxel 128 × 64 × 64 von 10 cm bis 100 km in ≈ 0,5 ms (Basis-PS4, async compute); bis zu 128 Reflexions-Proben (256² × 6) reihum
  neu belichtet, 700 µs; SH-Proben 16 × 16 × 3 je 200-m-Kachel aus dem Himmel neu belichtet (60 µs Himmel → SH, 123 µs Gitter); lokales
  Tonemapping 250 µs. Weg: vorberechnete 3D-LUTs Rayleigh/Mie mit Mehrfachstreuung und analytischem Erdschatten, je Frame kubisch auf
  2D für Sonnen- und Mondwinkel umgetastet; Belichtung aus der Beleuchtungsstärke statt aus der Bild-Luma; nachts Purkinje-Verschiebung;
  Reinhard je Kanal in einem eigenen ACEScg-Raum. advances.realtimerendering.com/s2021/jpatry_advances2021
- **Red Dead Redemption 2** (Rockstar North; Fabian Bauer, SIGGRAPH 2019 Advances): Himmel, Wolken, Nebel, Volumetrik und
  Himmels-Umgebungslicht als EINE integrierte Streu-Lösung über Tageszeit, Wetter und Story-Stimmung; ms und Auflösungen nicht öffentlich.
  Weg: Voxelisierung und Raymarching für Streuung und Durchlass, dieselben Daten speisen Hauptbild, Spiegel-Karten und ein Proben-Gitter
  für die Himmels-Irradianz; physikalischer Lichttransport mit Künstler-Reglern, für PS4/XB1 optimiert. advances.realtimerendering.com/s2019
- **Unreal Engine 5 / Fortnite** (SkyAtmosphere + Lumen + HLOD + Impostoren): Himmel und Luftperspektive skalieren vom iPhone 6s bis zum
  High-End-PC; Lumen-Budget auf Konsole 4 ms bei 60 fps bzw. 8 ms bei 30 fps (1080p intern) für GI, Reflexion und Volumen-Nebel; fern ein
  Proxy-Mesh je World-Partition-Zelle, Bäume als oktaedrische Impostoren. Weg: Hillaire-LUTs (Durchlass 256 × 64, Mehrfachstreuung 32 × 32,
  Himmels-Sicht 192 × 108, Luftperspektive als Froxel 32 × 32 × 32, entkoppelt von der Bildauflösung); HLOD fasst viele Meshes zu einem Proxy;
  Hemi-Oktaeder-Impostoren holen laut Pixyz-Doku die doppelte Güte je Ansichtszahl. diglib.eg.org/handle/10.1111/cgf14050 ·
  dev.epicgames.com (Lumen performance guide · World Partition HLOD) · docs.unity3d.com (Pixyz create-impostors)
- **Horizon Zero Dawn / Nubis** (Guerrilla, Decima, PS4; Schneider, SIGGRAPH 2015): volumetrische Wolkenlandschaften von Cirrus bis Cumulus
  über die Tageszeit, < 2 ms GPU auf PS4. Weg: Raymarching durch prozedurale Rausch-Volumen; Nubis (2017/2023) bringt regionale Autorenschaft,
  Animation und Übergänge, durch weitere Optimierung bezahlt. advances.realtimerendering.com/s2015 (Real-time Volumetric Cloudscapes of
  Horizon Zero Dawn) · guerrilla-games.com (nubis-authoring-real-time-volumetric-cloudscapes-with-the-decima-engine)

**Kriterien**
1. **Eine Atmosphäre trägt jedes Licht — 1/2.** *Messung:* die 18-%-Karte über `werkbank licht --ist himmel-licht`: lichtVerhaeltnis in
   [5; 12,5], schattenAnteil 0,08–0,20, umgebungAzimut ≥ 1,2, an der Mess-Wiese UND am Spawn × Uhr 0/0,25/0,5/0,75 × Ego/Third/oben
   (`werkbank spawn --urteil`, 12 Zellen); Absenz-Grep über `window.__codeOf`: kein eigener Licht-Term in Feld-, Panorama- oder
   Wasser-WGSL; 1 = Mittag GRÜN. *Beleg:* die Hillaire-Tafeln 256 × 64 / 32 × 32 / 192 × 108 kommen aus EINEM Medium `ATMO_GESETZ`
   (`stamm/bild-himmel.js:1245-1334`); Mittag auf der Radeon: E_alle 7,99 / E_umgebung 1,54 = 5,19 · Schatten 0,193 · Azimut 1,17/0,92 = 1,27
   (`spec/abnahme/soll-tafel.json:221-224`), alles GRÜN. Am Spawn × Uhr sind 8 himmel-licht-Zellen ROT, weil der Rechner die Pose nicht liest
   (Übergabe 18.10. 15:20, ef09770b); der Feld-Pass rechnet sein Licht weiter von Hand, `0.3 + 0.7·N·L/max(sun.y, 0.2)` (`stamm/bild-sicht.js:916-921`),
   ein zweiter Lichtweg.
2. **Tag und Nacht sind EINE Kurve der Sonnenhöhe — 0/2.** *Messung:* neue Linse `werkbank licht --uhr`: Luma des Ausgabe-Bilds
   (`scripts/lib/ausgabe-aufnahme.cjs`) am Spawn, Ego und Third, Uhr 0…1 in 0,01-Schritten, klar: (a) monoton in der Sonnenhöhe, Sonne 10°
   0,5–1,0 EV unter Mittag, Nacht ≥ 3 EV unter Mittag und nie schwarz; (b) kein Sprung > 0,1 EV je Uhr-Schritt; (c) EIN Belichtungs-Schreiber,
   EINE Tag-Achse; Selbsttest: ROT am heutigen Kopf. *Beleg:* die einzige Probe ist invertiert: 6 Uhr Luma Ego 158 > Mittag 114, linear
   ≈ +1 EV (Übergabe 18.10. 15:20, ef09770b). Ursache: die Belichtung adaptiert im Tag VOLL auf Mittelgrau +1 (`k` hoch Dämmerung × Tag-Anteil,
   `stamm/bild-himmel.js:2051-2056`), so wird die goldene Stunde auf Mittagsgrau gezogen. Tag-Achsen dreifach (`_daemmerung :1308`,
   `_celestialHorizonFade :1813`, `_nachtAnteil` linear sin/0,25 `:2017`), Belichtungs-Schreiber zweifach (`:2056` und
   `stamm/dirigent-ankunft.js:210`); die Umgebung erneuert sich frühestens alle 6 s (`SKY_ENV_REGEN_MIN_MS :2875`), das gibt Drift. Gut:
   Nacht Karte/Gestalt 2,18 → 1,11 (F6, 70bca133).
3. **Die Luft macht die Ferne lesbar — 1/2.** *Messung:* Fern-Kontrast im Ausgabe-Bild (Grat gegen Himmel bei 1/2/5/8 km) gegen
   Koschmieder C = e^(−β·d) (±15 %); der Farbton der Ferne rückt mit d zum Himmel; die Sonnenseite ist heller als die Gegenseite (Mie-Keule);
   bei tiefer Sonne rötet fernes Weiß (Rayleigh je Kanal); am Welt-Ende ≤ 2 % Restkontrast (= LUFT.kontrast); die Luft kostet ≤ 0,3 ms auf
   der GTX (gpu-bank). *Beleg:* Höhen-Nebel mit geschlossenem Integral, die In-Streuung ist die Himmels-Sicht der EINEN Atmosphäre in
   Blickrichtung (`stamm/bild-himmel.js:2245-2294`): blauer Dunst und Mie-Hof stimmen. Aber β ist EIN grauer Skalar (`_luftBeta :2221-2229`),
   keine Extinktion je Kanal, kein Volumen-Schatten im Dunst; der Fern-Ring endet bei 8 km (`stamm/gelaende-fern.js:1346-1348`), die Luft sieht
   20 km (`foundry-core.js:252`); am Rand bleiben e^(−3,91·0,4) = 21 % Kontrast, bei klarem Wetter steht die Welt-Kante als Linie. Keine Linse
   misst den Fern-Kontrast im Bild.
4. **Die Ferne hat Gestalt — 1/2.** *Messung:* Höhenprofil der Grat-Linie mit Wald gegen ohne (Kronen-Relief in m) bei 0,5/1/3/8 km im
   Ausgabe-Bild; Karten-Fehler gegen L1 unter Blick-Hebung 0/40/80° ≤ 0,22 (laub-kante, `werkbank licht --karte`, Vorlage Spike ab86edc0);
   Luma-Sprung beim Stufenwechsel < 2 %; Karte/Gestalt je Stunde 0,9–1,1 (F6-Linse). *Beleg:* die Baum-Karte reicht bis 384 m, dahinter trägt
   der Wald nur Farbe auf dem Boden (FERN_FARBE `stamm/gelaende-chunks.js:2924-2934`, Kronendach als Vertex-Attribut
   `stamm/gelaende-fern.js:216-222/:999`): kein Relief, kein Wald-Saum auf fernen Graten. Der Impostor hat `{views: 8}` nur im Azimut
   (`foundry-core.js:719`), die Bake-Kamera steht waagrecht (`stoff-instanz.js:633`); von oben bricht die Karte (F2b), laub-kante über 0,22
   ROT. Toter Zwilling: Canopy-Streaming hinter `atmosphere.canopyStreaming`, Default false (`stamm/bild-himmel.js:415-417/:544`,
   `stamm/dirigent-kern.js:338`). Gut: Nacht Karte/Gestalt 1,11.
5. **Der Himmel hat Körper und wirft Schatten bis zum Horizont — 0/2.** *Messung:* (a) Wolken-Schatten: Luma-Varianz des besonnten Bodens
   bei Deckung 0,4 gegen 0 ist > 0 und folgt dem Wolkenfeld; (b) Fern-Schatten: bei Sonne 5° liegt der Hang hinter einem 2 km fernen Grat im
   Schatten (Luma Schatten-/Lichthang ≤ 0,4); (c) die Wolke ist ein Volumen mit Licht-Durchlass, keine Schwelle; a + b + c ≤ 1,0 ms auf der GTX
   (Maß Horizon: 2 ms auf PS4). *Beleg:* zwei Kaskaden, maxFar 180–306 m (`stamm/bild-kosten.js:3433`, `stamm/dirigent-ankunft.js:433`),
   jenseits davon nur N·L, kein Grat wirft Abendschatten ins Tal. Die Wolken sind EINE 2D-FBM-Schicht der Kuppel mit einer Schwelle aus der
   Deckung (`stamm/bild-himmel.js:78-160/:1852`); ihr Licht ist korrekt aus den Tafeln (`:148-159`), aber sie werfen keinen Schatten und haben
   kein Volumen.

**Hebel**
1. **S7 — EINE Tag-Achse, Belichtungs-Kompensation, Uhr-Linse** · +3 (K2 0 → 2, K1 1 → 2) · 1–2 d · S7 · Pflicht A (himmel-licht). In
   `stamm/bild-himmel.js` werden `_nachtAnteil :2017` und `_celestialHorizonFade :1813` Leser von `_daemmerung :1308`;
   `_dayNightApplyBelichtung :2038-2056` adaptiert im Tag mit Steigung < 1 über EV (die Kompensations-Kurve der Profi-Engines) statt voll,
   damit Sonne 10° 0,5–1 EV unter Mittag bleibt; der Schreiber in `stamm/dirigent-ankunft.js:210` fällt; der Feld-Pass liest den EINEN
   Licht-Baustein statt `0.3 + 0.7·N·L` (`stamm/bild-sicht.js:918`); der Spawn-Richter liest die Pose für himmel-licht. Die neue Linse
   `werkbank licht --uhr` steht zuerst ROT am Kopf (6 Uhr 158 > Mittag 114). e2485995 (Rim + Nacht-Füll) zuerst einfädeln (SYSTEMKARTE S7).
2. **Ferne Gestalt aus dem Gesetz** · +1 (K4 1 → 2), dazu laub-kante GRÜN für Pflicht A · 2–3 d · S8, derselbe Schnitt wie Vegetation H1.
   `stamm/gelaende-fern.js`: der Fern-Ring hebt seine Vertices um Kronenhöhe (aus `treeParams` der Arten) × Deckung — `aKrone` trägt die
   Deckung schon (`:999`); so steht auf jedem Grat bis 8 km ein Wald-Saum ohne Asset. Im Rezept (`foundry-core.js:719`) werden die
   Impostor-Ansichten ein Hemi-Oktaeder 8 × 4 mit Hebungen (Bake `stoff-instanz.js:633`, Wahl nach der Hebung aus `_lodAuge`); das
   Canopy-Streaming-Flag fällt ganz (`stamm/bild-himmel.js:415-585`, `stamm/dirigent-kern.js:338`).
3. **Luft und Fern-Schatten als Funktion** · +2 (K3 1 → 2, K5 0 → 1) · 2–3 d. `stamm/bild-himmel.js:2267-2281`: β je Kanal (betaR des
   `ATMO_GESETZ` als vec3 in `faktor`); die letzte Fern-Schale wächst von 8 auf 20 km (= LUFT.sichtKlarM; grobe Masche, Kosten am Schirm,
   `stamm/gelaende-fern.js:1348`); der Fern-Faden rechnet eine Horizont-Karte aus dem Gelände-Kern (Horizontwinkel je Texel für den
   Sonnen-Azimut — das Gelände ist eine Funktion, kein Bake); Wolken-Schatten aus demselben FBM-Feld der Kuppel, längs der Sonne auf den Boden
   projiziert (ein Lookup im Boden-Stoff).

---

## 8 Studios und Werkzeug-UI — 4/10

Die Hülle `worlds/huelle`, die 12 Studios unter `worlds/`, die Werkstatt in der Welt.

**10/10.** Jedes Studio ist eine ISOLIERTE Bühne (eigene Szene, Panorama, Bodenplatte, Orbit) auf der Welt-Engine: ihr r184-Renderer, ihre Stoffe,
ihre Foundry-Stufenkette, ihr Licht-Gesetz. Ein Griff am Regler zeigt das Werk in höchstens 200 ms (Gesetz-Wert) bzw. 1 s (Neubau); daneben
stehen die gemessenen Kosten je Stufe gegen das Profi-Band, A/B gegen den gebauten Stand und ein Undo, das ein Neuladen übersteht; ein Knopf
„in der Welt ansehen“ öffnet das Werk an seinem Ort. GESETZ des Schöpfers (18.10.): ein Studio wird NIE gelöscht und NIE in die offene Welt
verlegt — sonst ist es nur ein Spawn in die Welt.
**Wo wir sie schlagen.** Bei den Besten trennt der Import Editor und Spiel; bei uns baut die Bühne mit DEMSELBEN Bauer und Renderer wie die
Welt — Labor = Welt ohne Export-Datei, und der Plan (Saat + Regler) reist als Bytes.

**Die Besten**
- **Unreal Engine, Static Mesh Editor**: im Vorschaufenster die Zahlen der Spiel-Engine (Zahl der LODs, aktuelle Schirmgröße, Dreiecke,
  Vertices, UV-Kanäle, Distance-Field-Speicher, Kollisions-Primitive, Ausmaß); die LOD-Kette aus Regeln (PercentTriangles 0–1, ScreenSize 0–1,
  quadratischer Kantenkollaps bis zur Ziel-Dreieckszahl); Undo/Redo mit Verlaufsfenster, Licht drehen mit L + Maus, Belichtung Auto oder
  EV100; derselbe Renderer wie das Spiel. dev.epicgames.com (static-mesh-editor-ui · static-mesh-automatic-lod-generation)
- **Unity Prefab Mode**: ein Asset wird isoliert oder im Kontext bearbeitet, an der Stelle seiner Instanz in der echten Szene (sichtbar, aber
  gesperrt); Show Overrides zeigt die Abweichungen der Instanz; Auto Save schreibt jede Änderung sofort ins Asset (ab 2022.3 Standard).
  Prinzip: im Spielkontext bearbeiten statt in einer fremden Bühne. docs.unity3d.com/Manual/EditingInPrefabMode.html
- **SideFX Houdini** (Engine, Session Sync, Performance Monitor): die Parameter eines HDA stehen im Unreal-Editor, Houdini rechnet live neu,
  ohne Bake; mit Session Sync bearbeiten beide Programme dieselbe Sitzung; der Performance Monitor zeigt je Knoten eigene und kumulierte
  Rechenzeit und die Zahl der Neuberechnungen, auch per HAPI. Far Cry 5 hat so ≈ 100 km² Wildnis aus Houdini-Werkzeugen direkt im
  Dunia-Editor gebaut (Biome, Süßwasser-Netz, Klippen, Nebeldichte). sidefx.com/docs/houdini/unreal/sessionsync.html ·
  sidefx.com/docs/houdini/ref/panes/perfmon.html · 80.lv/articles/houdini-procedural-world-generation-of-far-cry-5
- **Guerrilla Decima** (Horizon Zero Dawn, GDC 2017, Jaap van Muijden): Platzierungsregeln im Graph-Editor, die GPU baut daraus die Welt um
  den Spieler zur Laufzeit; den Offline-Bake hat Guerrilla abgeschafft, weil Bake-Zeiten die Iteration bremsten. Ziele: schnelle Iteration,
  künstlerisch steuerbar, deterministisch, lokal stabil; eine Baumreihe malen oder Wüste zu Sumpf machen so leicht wie Berge versetzen.
  ms-Zahlen nicht öffentlich. guerrilla-games.com (gpu-based-procedural-placement-in-horizon-zero-dawn)
- **Blender Geometry Nodes** und **SpeedTree Modeler**: Blender zeigt seit 2021 ein Timings-Overlay mit ms je Knoten, Gruppen und Frames
  zeigen die Summe; SpeedTree erzeugt dynamisches LOD, das stufenlos mit dem Abstand morpht, die Stufe ist im Tree Window einstellbar; ein
  Baum trägt typisch 3–4 Materialien, also 3–4 Draw-Calls. projects.blender.org (Commit e4986f92) ·
  docs.unity3d.com/speedtree-modeler/manual/level-of-detail.html

**Kriterien**
1. **EINE Engine unter jeder isolierten Studio-Seite — 0/2.** *Messung:* H6 in `scripts/diag-studio-huelle.cjs` als Netz-Prüfung der
   Studio-SEITE (lädt sie r128? — nie „läuft als ?studio=“); 2 = 12/12 plus Bild-Differenz Studio gegen Welt bei
   gleicher Pose ≤ 2,1 % (`bild-diff.cjs` über `ausgabe-aufnahme.cjs`) und 0 Netz-Anfragen auf `worlds/*/lib/three*`; 1 ab 6/12. *Beleg:* H6
   heute 2 von 12 (gelaende, garage; Garage seit S1 auf der Welt-Engine, Bild-Diff 0,04 %), Ratsche `diag-studio-huelle.cjs:48`. Die anderen
   10 laufen in einer eigenen iframe-Shell mit eigenem Renderer (r128 siebenmal, r130, r183) und eigenem Licht (SYSTEMKARTE W3); H5: 7
   Tor-Panoramen sind veraltet (Stempel passt nicht zu den Quellen).
2. **Kosten-Wahrheit am Griff — 1/2.** *Messung:* die Kosten-Leiste zeigt je LOD-Stufe GEMESSENE Werte der Welt-Gestalt (Dreiecke,
   Befehle, VRAM, GPU-ms); neue Probe in gate:studio-huelle --bild: Leiste gegen `werkbank zaehlen` bzw. gpu-bank ≤ 5 %; 2 = alle vier in jedem
   Studio mit Mesh. *Beleg:* `worlds/huelle/huelle.js:487-512` (zaehle) zählt nur Dreiecke, Stoffe, Meshes und Schattenwerfer; bei `:570`
   steht hinter „Befehle" `b.draws`, die Budget-Zeile des Kerns, keine gezählten Befehle; weder ms noch VRAM. Die Leiste läuft in 9 von 12
   Studios, die Garage misst an der echten Welt-Gestalt (`garage/studio.js:787`).
3. **Jeder Regler wirkt und hält das Budget — 1/2.** *Messung:* gate:regler-wirkt (`scripts/diag-regler-wirkt.cjs`) über die echte
   Foundry-Brücke mit den Ratschen reglerTot und reglerBudget (`spec/vertraege/ratsche.json`), Soll 0 und 0; H1: 0 von Hand gebaute Regler.
   *Beleg:* 112 Regler-Zeilen, 95 wirken, 17 tot (klang 7 von 7; porta 8 von 26: energy, fractal, reflect, swirl, temp, tunnel, twist, wave;
   schmiede schaftR; vehicle grip); 7 Regler treiben am Rand ihre Stufe über das Budget (fachwerk haus bend, doppel, storeys; porta ruin,
   wMason, wMono; schmiede griff); von Hand gebaute Regler 0, Studio-Vertrag grün. Ehrlich offen: Klang-, Membran- und Grip-Werte könnten
   außerhalb des Bau-Hash wirken; die Linse sieht diese Kanäle nicht, darum zählen sie als tot.
4. **Iteration und Sitzung — 1/2.** *Messung:* neue Linse Griff → Bild: ms vom Regler-Eingang bis zum ersten Ausgabe-Bild mit neuem
   Bau-Hash, Soll ≤ 200 ms (Gesetz-Wert) bzw. ≤ 1 s (Neubau); je Studio Undo/Redo, Seed, Sperre je Achse, A/B und eine Sitzung, die ein
   Neuladen übersteht. *Beleg:* `worlds/huelle/huelle.js:314-348` liefert Sitzung mit Seed, Sperre und Undo/Redo (Stapel 200, `:347`) in 9 von
   12 Studios; A/B nur im Gelände-Studio (`worlds/gelaende/studio.js:13`, `:128`) und als blinder Hörtest im Klang-Studio (`klang.js:3990`);
   die Sitzung wird nirgends gespeichert (0 Treffer für localStorage, sessionStorage, IndexedDB in `huelle.js`); Entprellung 180 bzw. 500 ms
   (`:136`, `:607`); die Zeit vom Griff zum Bild misst keine Linse.
5. **Der Weg in die Welt und die Sprache der KI — 1/2.** *Messung:* je Studio wird der Stand des Schöpfers in der Welt KONSUMIERT,
   byte-gleich (gate:worker-dichte --studio, diag-studio-uebergabe, Plan-Hash Studio = Welt) und übersteht Speichern; die KI-Op
   `spawn_studio` setzt dieselben Regler (ov, am Kern geklemmt, fail-closed); 2 = 12/12 und KI-Regler. *Beleg:* 4 von 12 tragen den Stand in die
   Welt: gelaende (EIN Plan, byte-gleich, `gelaende/studio.js:10-11`), garage (das Werk bleibt in der Welt, `garage/studio.js:9-10`),
   koerperstudio und tetrapoda (type uebergabe, Leser `_studioUebergabeEmpfang`). fachwerk, schmiede, portale, klang und terrain senden über
   `AnazhHuelle.bruecke` nur Wort und Panorama (`fachwerk.js:1013-1029`), die Welt liest weiter die eingefrorenen Kern-Presets; `spawn_studio`
   nimmt nur [what, pos, count, seed] (`stamm/feld-dsl.js:1020`), die KI setzt keinen Regler.

**Hebel**
1. **Die Sitzung am EINEN Chokepoint ausbauen und die Griff → Bild-Linse bauen** · +1 (K4 1 → 2) · 1–2 d. A/B (A = gebauter Stand, B =
   Entwurf; das Muster aus `gelaende/studio.js:128-199` verallgemeinert) und Persistenz (Undo-Stapel und Werte in sessionStorage plus
   Speicher-Schreiber) wandern in `AnazhHuelle.sitzung` (`worlds/huelle/huelle.js:314-480`), damit haben alle 9 Studios mit Sitzung beides in
   einer Welle. Dazu die Linse Griff → Bild als Regel G4 in `scripts/diag-garage-labor.cjs`: ms vom Eingang bis zum ersten Ausgabe-Bild mit
   neuem Bau-Hash, ROT über 1 s.
2. **Die Hülle misst, was die Welt zahlt und liest** · +2 (K2 1 → 2 mit H3, K3 1 → 2) · 3–4 d. `kosten()` liest im Welt-Modus die echten
   Zahlen des Werks — Befehle und Dreiecke aus `renderer.info` in einem eigenen Render-Abschnitt (Stempel nach Lehre 23), VRAM aus
   `info.memoryMap` je Werk-Attribut, GPU-ms aus dem Zeitstempel des Passes — statt `b.draws` (`worlds/huelle/huelle.js:487-570`,
   `worlds/garage/studio.js:787`); Probe Leiste gegen `werkbank zaehlen` ≤ 5 %. In derselben Welle misst gate:regler-wirkt Klang, Membran und
   Grip in ihrem echten Kanal (Ausgabe-Hash des Klang-Gesetzes, Uniform-Hash der Membran, Fahr-Gesetz); was danach tot bleibt, fällt als
   Zeile. Die 7 Rand-Brüche heilen am Kern (Lehre 19, Klemme oder Reduktion im Rezept, unter Byte-Beweis: `porta-core.js`,
   `fachwerk-core.js`, `schmiede-core.js`, `spec/vertraege/ratsche.json`).
3. **Der Werk-Modus als EIN Baustein der Hülle, die KI spricht Regler** · +2 (K1 0 → 1, K5 1 → 2) · 4–6 d mit dem Baustein statt 1–3 d je
   Studio · S1 · Pflicht A (haus Labor ≠ Welt). Das Garage-Muster (`spawnArchitecture(kind)` + Prägung studioOv + kameraFuehren +
   Regler/Sitzung/Kosten der Hülle, `worlds/garage/studio.js`) wird `AnazhHuelle.werkModus(kind)`. Damit wechseln schmiede, portale,
   tetrapoda, koerperstudio und fachwerk (Haus) in einer Welle auf `index.html?studio=<x>`; ihre iframe-Shells, r128 und eigenen Renderer
   fallen physisch, die Ratsche EINE_ENGINE geht von 2 auf 7 von 12 (`scripts/diag-studio-huelle.cjs:48`). Das Werk bleibt in der Welt — die
   Übergabe ohne Kanal. `spawn_studio` bekommt ein fünftes Argument ov, an `PARAMS_BY_KIND` geklemmt, fail-closed, gelegt als studioOv in
   `_dslSpawnStudioItems` (`stamm/feld-dsl.js:1020`, `:1945`). Offen bleiben terrain (4 530 Zeilen) und klang für Bühne = 2.

---

## 9 Ankunft, Streaming und Leistung — 2/10

D9: Tor `_weltbildSteht` (`stamm/dirigent-ankunft.js:844`) · Schlange `_foundryAuftrag` (`stamm/studio-bruecke.js:952`) · Takt
`_gameLoopTick` (`stamm/dirigent-takt.js:46`); gemessen an integ ff88b82d und den OMEN-Berichten bis 18.10.

**10/10.** Ein Klick auf den Link, und nach höchstens 5 s kalt (1,5 s warm, Portal 1 s) hält der Spieler die Kontrolle in einem GANZEN
Bild, auf der Radeon 890M wie auf der GTX 1060. Danach sieht er beim Gehen, Sprinten und Fahren mit dem GT auf vmax nie eine Lücke, nie einen
Stufen-Sprung und keinen Hänger über 100 ms, bei Frame p95 ≤ 16,7 ms und CPU-Takt p95 ≤ 5,8 ms.
**Wo wir sie schlagen.** Die Besten kaufen das mit Gigabytes und Bandbreite: 5,5 GB/s SSD für 0,83 s Schnellreise, 10 000 vorkompilierte
PSOs, und laut Poki kostet jedes MB über 10 Spieler. Unsere Welt ist eine Funktion: wir liefern Kilobytes Gesetz statt Gigabytes Asset.
Das erste Weltbild folgt aus Seed und Gesetz-SHA, ist also vorhersagbar und vorab backbar; der Rang „Zeit bis Bedarf" schaut entlang der
Gesetze selbst voraus (Wegenetz, Flussnetz, Gelände-Kern), weiter als jeder Prefetch, der nur das Tempo kennt.

**Die Besten**
- **Insomniac** (Marvel's Spider-Man PS4/PS5, Spider-Man 2, Ratchet & Clank: Rift Apart): Schnellreise über Manhattan PS4 Pro 8,10 s, am
  PS5-Devkit 0,83 s (Cerny/Wired 2019); Spider-Man 2 Schnellreise von der Karte 1,33 s (IGN), die Halte-Taste ist nur Bedienung, hinter ihr
  wird nichts geladen; Rift Apart springt durch Risse in Bruchteilen einer Sekunde (der PC-Port stockt auf einer Platte und stürzt ab,
  Digital Foundry). Weg: Streaming an das Bewegungstempo gebunden (auf PS4 bremste die Platte das Schwing-Tempo), PS5-SSD 5,5 GB/s roh, die
  Kamera verdeckt den Tausch im Speicher (Fisk Tower). GDC 2019 Ruskin, gdcvault.com/play/1026496 · t3.com (PS5 vs PS4 video) · psu.com
  (Spider-Man 2 load times) · mp1st.com (hold to confirm hides no loading) · gamespot.com (Rift Apart could not run on PS4, PC port)
- **Epic** (Fortnite / UE5): Skalierung von alter Hardware bis zur Spitze, die GTX 1060 6 GB kommt in 1080p auf ≈ 118 fps (Low) bzw. 54 fps
  (Ultra), min 103/47 (Schätzwerte von CheckFPS); ein Battle-Royale-Match kennt ≈ 30 000 PSOs und nutzt ≈ 10 000. Weg: PSO-Precaching
  (UE 5.2) schätzt beim Laden eines Objekts dessen Pipelines und kompiliert vor; ist eine nicht bereit, wird das Objekt übersprungen statt den
  Frame anzuhalten; Fortnite verlängert dafür den Ladeschirm, die Skalierung läuft über feste Stufen. unrealengine.com/en-US/tech-blog (shader
  stuttering) · dsogaming.com (PSO precaching UE 5.1) · checkfps.io (Fortnite GTX 1060 6GB)
- **Hello Games** (No Man's Sky): der nächste Verwandte unserer Gesetz-Welt — der Planet entsteht ohne Unterbrechung vom Orbit bis zum belebten
  Boden, nichts vorgefertigt. Weg: eine fortlaufende Pipeline Voxel-Generierung → Polygonisierung → Texturierung → Population → Simulation, die
  neben dem Spieler arbeitet; öffentliche Zahlen gibt es keine. GDC 2017 McKendrick, gdcvault.com/play/1024265
- **PC- und Web-Maßstab** (Luminous Forspoken / DirectStorage, Poki): Forspoken lädt eine Szene auf NVMe in 1,9 s, auf SATA in 3,7 s, auf einer
  Platte in 21,5 s (GDC 2022), das Speichermedium zählt viel mehr als die API (Win32 → DirectStorage nur 2,1 → 1,9 s). Poki über 174 Web-Spiele:
  bei 10 MB Erst-Download spielen in den USA ≈ 80 % der Besucher los, in Ägypten < 60 %. Weg: kleiner Erst-Download, Assets kurz vor Bedarf.
  wepc.com (DirectStorage in Forspoken) · hardware.slashdot.org (DirectStorage minor improvements) · w3.org/2018/12/games-workshop/papers/size-matters.html

**Kriterien**
1. **Ankunft kalt: Klick bis Kontrolle — 0/2.** *Messung:* `node scripts/diag-boot-stage.cjs --kalt --echt --bild`, ≥ 4 Boots je Gerät mit
   leerer Platte; t = erste angenommene Eingabe + erstes Ausgabe-Bild (S2b, nie die Eigenmeldung `_weltbildDa`), das Bild ganz (gate:ankunft
   L2a); 2 = ≤ 5 s an Radeon UND GTX, 1 = ≤ 10 s an einem Gerät. *Beleg:* GTX an integ f829df97: 16,0 · 17,3 · 17,7 · 17,1 s, Median 17,2
   (`bericht/1710-ankunft-gtx.md`); B5-Befund 16,58 s (16,08–17,04, 11 Kalt-Läufe, `bericht/1810-b5-befund.md`). Der Haupt-Faden ist bis zum
   Bild zu 96–99 % belegt (39–48 lange Aufgaben, zusammen 13,3–14,3 s). Die Radeon lag am 13.10. bei 44,8–77,5 s, am Kopf ungemessen. Der
   Richter liest die Eigenmeldung `_weltbildDa` (`scripts/diag-boot-stage.cjs:297`, W9; gefälscht → 0,00 s statt 9,02 s).
2. **Takt in Ruhe: das Profi-Band an beiden Messplätzen — 1/2.** *Messung:* ABAB unter Regler voll, je Gerät × Ort (Wiese, Genesis) × Sicht
   (Ego, Third), `werkbank band` + Lauf: Frame p95 ≤ 16,7 ms, CPU-Takt p95 ≤ 5,8 ms, ≤ 208 Befehle, ≤ 680k Dreiecke, ≤ 118 MB VRAM
   (`spec/profiband/haushalt.json` band); 1 = die GPU-Seite hält an einem Gerät, die CPU nur knapp. *Beleg:* GTX E2 (`bericht/1710-e2.md`):
   Frame p95 überall 16,8 ms (60-Hz-Raster), Befehle 38–79, VRAM 98,3–110,4 MB — die GPU-Seite hält. CPU-Takt p95 an Genesis Third
   5,8 · 5,9 · 5,8 · 5,8 (ein Boot über dem Soll), an der Wiese mit Regler frei 6,8 → 7,5 ms; am 14.10. 6,0–7,8 ms. Das Radeon-ABAB am Kopf steht
   aus (PFLICHT-OFFEN E).
3. **Glätte in Bewegung: keine Hänger — 1/2.** *Messung:* `node scripts/werkbank.cjs haenger 60 --wandern kreis` (`scripts/lib/haenger-linse.cjs`:
   jeder Frame > 100 ms mit Ursache beim Namen) + eine neue Fahrt-Bahn mit dem GT auf vmax, je 4 Sitzungen je Gerät: 0 Frames > 100 ms, ≤ 1 %
   Frames > 33 ms; 1 = die Pipeline-Hänger-Klasse ist gefallen und eine Bewegungsart hält an einem Gerät in ≥ 3/4 Sitzungen. *Beleg:* die
   Shader- und Pipeline-Hänger-Klasse, mit der UE5 noch kämpft, ist gefallen (die Erst-Zeichnung kompiliert asynchron, gate:hitch-telemetrie
   prüft das mit einem Gegen-Lauf, der rot sein muss, `scripts/diag-hitch-telemetrie.cjs:1-20`). GTX gehend an der Wiese, 210fe8a7: ein Hänger
   von 258 ms nur noch in 1 von 4 Sitzungen (vorher 4/4); im Einlauf 15,5 % der Frames über 17 ms; stehend erreicht die CPU-Spitze 41–46 ms
   (`bericht/1610-nachmessen-210fe8a7.md:62-66`). Fahrt und Radeon ungemessen, keine Ratsche im CI.
4. **Kein Pop-in unter Tempo — 0/2.** *Messung:* NEUE Linse (Familie diag-v1-pfad, Station fahrt, bzw. werkbank): je Bild bei Höchsttempo
   (GT vmax, Sprint, Kamera 30 m oben) die offenen Terme von `_weltbildLuecken` im Sichtkegel bis 384 m (Boden, Wuchs, Bauten, Karten), auch
   im Spiel und nicht nur bis zum ersten Bild; dazu der Stufen-Sprung per bild-diff zwischen Folgebildern an der Stufen-Grenze. *Beleg:* keine
   Linse misst Lücken in Fahrt, F5 hat der Schöpfer beim Spielen gefunden (17.10.). Der Boden-Voraus ist fest 1–2 Chunks (43,2–86,4 m),
   unabhängig vom Tempo (`stamm/gelaende-chunks.js:2534-2558`); die Stufe wählt der Chebyshev-Abstand ohne Tempo
   (`stamm/gelaende-boden.js:2587`); die Wuchs-Schlange arbeitet 4 je Frame FIFO, ohne Bild-Rang (`stamm/vegetation-baum.js:1594/:2040`);
   der Schnitt `_ankunftD2` liegt ungemergt auf fahrt-vorausschau 1bb06b4e. Gut: der Boden morpht nach CDLOD (K51).
5. **Wiederkehr und Reise: warm und Portal — 0/2.** *Messung:* `diag-boot-stage --echt` Zweit-Zeile (Platte warm) bis zur Kontrolle, dazu
   eine NEUE Portal-Zeile vom Tor-Durchgang bis zur Kontrolle in der Ziel-Welt, ≥ 4 je Gerät; 2 = warm ≤ 1,5 s UND Portal ≤ 1 s an beiden
   Geräten (Maß: Spider-Man 2 mit 1,33 s), 1 = warm ≤ 5 s an einem Gerät. *Beleg:* Zweit-Boot 11,98 s, Leib 6,49 s, obwohl 107–109 von
   108–110 Lieferungen von der Platte kommen; nach einer Versions-Stufe 12,81 s (`bericht/1810-b5-befund.md`). Die Platte trägt nur
   build-asset; Blatt-Atlas, Dorf-Export und Karten laufen jedes Boot live (`stamm/studio-bruecke.js:488`, SYSTEMKARTE W6). Der Erst-Bau der
   Stoffe kostet 2,4–3,3 s, darin `_diaetGang` 1,0–1,5 s mit for…in (`stamm/bild-kosten.js:3575`). Der Portal-Sprung ist ungemessen.

**Hebel**
1. **S3 — EIN Rang, freier Haupt-Faden** (B4 ae9687d1 + B5 5c2a0247 als EIN Paket auf integ ff88b82d) · +1 (K1 0 → 1, Ziel kalt ≤ 10 s an der
   GTX; Erwartung aus den Teil-Zahlen: Leib 10,9 → 6,1 s, Streu-Warten 7,91 → 0, Diät −1,5 s) und der halbe Weg zu K5 · 2–3 d · S3 · Pflicht B.
   `_foundryAuftragD2` (`stamm/studio-bruecke.js:959`): EIN Rang für Pumpe UND Freigabe (`:826`); ortlose Aufträge erben den Ort ihres Lesers
   statt auf ∞ zu warten (7 Aufträge, 8,5 s); der Leib wartet auf die Grobstufe (`koerper-leib.js:1392`). Dazu `stamm/bild-kosten.js:3575`
   for…in → Object.keys (B4 maß 1 482 → 9 ms), `stamm/stoff-instanz.js:413` Karten bis zur Frist über `_kappeOffen`,
   `stamm/dirigent-regler.js:415-480` der Ring unter dem Ladeschirm sofort am Existenz-Boden, die 15 direkten `_ladeTakt()`-Stellen über die
   EINE Kappe (`stamm/dirigent-takt.js:1092`). Richter `diag-boot-stage --kalt --echt` ≥ 4 je Seite.
2. **Pop-in-Linse zuerst, dann der Tempo-Rang (F5 einfädeln)** · +2 (K4 0 → 1, K3 1 → 2, sobald Fahrt und Gehen an beiden Geräten halten) ·
   1–2 d · S3 · auf H1. Die Linse steht erst ROT am Täter (diag-v1-pfad Station fahrt: Lücken je Bild bei GT-vmax und Kamera 30 m oben).
   Danach fahrt-vorausschau 1bb06b4e als Leser des EINEN Rangs aus H1, „Zeit bis Bedarf = Abstand entlang der Fahrt ÷ Tempo", für den
   Boden-Voraus (`stamm/gelaende-chunks.js:2534-2558` statt fest 1–2 Chunks; derselbe Schnitt wie Gelände H2), die Stufen-Wahl
   (`stamm/gelaende-boden.js:2587`) und die Wuchs-Schlange (`stamm/vegetation-baum.js:1594/:2040`, `_tickPendingGrass(1)`
   `vegetation-wiese.js:967`). Die Hänger-Linse (`werkbank haenger`) bekommt dieselbe Fahrt-Bahn als Ratsche.
3. **Die Platte trägt das erste Weltbild, die Radeon-Zeile am Kopf** · +1 (K5 0 → 1 zusammen mit H1: warm ≤ 5 s); zugleich Voraussetzung für
   die 2 Punkte in K1, K2 und K3, die beide Geräte verlangen · 2 d · Pflicht B und E. `stamm/studio-bruecke.js:488`: Blatt-Atlas, Dorf-Export
   (`fachwerk-core.js:5388-5392`, 0,30–0,39 s je Haus) und Karten disk-first unter dem Gesetz-SHA — gleicher Seed und gleiches Gesetz ergeben
   dieselben Bytes, kein Cache-Rätsel. Dazu stehen Kalt- und Warm-Zeile der Radeon 890M (`werkbank --echt`) als Ratsche neben der GTX.

---

## Nachziehen nach jedem Bündel

1. Am neuen Kopf je berührtem Kriterium die Messung fahren; ein Punkt wechselt nur mit Beleg (Zahl, `Datei:Zeile`, Bericht) im selben Commit.
2. `meisterkarte.json` und die Tabellen hier nachziehen; die Commit-Message nennt Σ vorher → nachher und die Kriterien (z. B. „Meisterkarte
   27 → 29: Tiere K1 0 → 2, rudel-verband gemergt").
3. Ein gemergter Hebel fällt aus seiner Liste; ein neuer Hebel braucht +Punkte, Aufwand und Schnitt. Neue Pflicht-Einträge setzt nur der Schöpfer.

## Was die Karte nicht weiß

- Die Punkte sind Lese-Urteile von neun Bewertungen am Kopf ff88b82d; wo ein Kriterium eine NEUE Linse verlangt, ist die 2 erst vergebbar,
  wenn die Linse steht und vorher ROT war.
- Die Radeon-Zeilen fehlen am Kopf für Ankunft, Profi-Band und Hänger; jedes „2 an beiden Geräten" wartet auf diese Messung.
- Der Aufwand ist die Schätzung der Bewertungen; Richter ist der gemergte Stand mit seiner Zahl, nicht die Schätzung.
