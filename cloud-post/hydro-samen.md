# Vorprüfung hydro-samen — die Hydrosphäre ist eine Funktion JEDES Samens

ZWISCHENSTAND · Karte 2 gebucht 118 von 1 718 (Stand-Datei `vision/karte-2-stand.json` im Zweig `punkte-maschine`).
Beansprucht: `karte2.same.kopplung.kohaerenz#1` — Leiter „Die gewachsene Kohärenz“ (`same.kopplung.kohaerenz`), Sprosse 1
„2 Glieder, ein Ort · Wasser folgt dem Relief“, Richter „100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 %“.
Buchen kann sie nur die Station; ihr Maß lebt im Zweig `punkte-maschine` — der Vorschlag dafür liegt hier als Diff (§ 4).

## 1 · Die Täter-Zahl (vorher, main 2da17e2e, BEVOR geschnitten wurde)

| Maß | Wert | Ort |
| --- | --- | --- |
| Station kohaerenz#1 im Spiel (Radeon, 25.11., Akte `same.kopplung.kohaerenz.1.2da17e2e-radeon.json`) | **1 von 101 Saaten** gemessen, 100 „ohne Fähigkeit“; an der Welt-Saat 50 von 50 Punkten | `WASSER_AN` der Station: `a.saat !== st.worldMeta.seed → fehlt` |
| Das Gesetz des Kerns in node (`gelaende-core` `hydrosphaere`, Heim-Region, über dem echten Wirt der Klasse im vm, Boden `_voxelSurfaceY`), dasselbe Maß wörtlich (50 Paare je Saat, tol 0,05 m, Lauf endet in Senke oder Meer) | **101 von 101 Saaten** ≥ 95 %; 5 045 von 5 050 Paaren = **99,9 %**; schlechteste 49 von 50 (same-saat-38, -51, -61, -70, -96); kein Wurf, keine Saat ohne Fluss | Skript dieser Abgabe, 23,6 s für 101 Saaten (234 ms je Saat) |
| Gegenprobe an der Welt-Saat `anazh-realm-seed`: node ↔ Station | 21 Flüsse · 21 Enden · 50 von 50 ↔ 21 · 21 · 50 von 50 | dieselben Zahlen |

**Wo die Kette fiel:** nicht im Gesetz — das lebt an jeder Saat. Gebunden an die Standard-Welt war der **Zustand des
Fadens** (`state` in voxel-worker.js, seine Saat kommt allein aus dem Stand der Welt, `applyStateSnapshot` :1894):
- `hydroRegion(key, origin)` voxel-worker.js:2051–2057 rief `G.hydrosphaere(state, state.hydroGesetz, voxelGitterY, origin)` —
  die Lage war `state`, kein Argument;
- ihr Boden `voxelGitterY` → `voxelSurfaceY` :1679 → `terrainColumnContext` :1997 (`G.dichteSpalte(state, …)`) und
  `terrainDensityAtCol` :2004 lasen `state` — der Boden war der der Welt-Saat;
- der Planet-Faden (`_planetAuftrag`, stamm/gelaende-chunks.js:644 — „eine reine Funktion seines Samens“, ohne Stand) kannte nur
  `planet-anker` und `planet-ort` (voxel-worker.js:374–385): er antwortete für jeden Samen, aber ohne Flusslauf;
- der Leser der Welt `_hydroFor` (stamm/gelaende-boden.js:675) liest `hydroRegion(this._gelaende(), x, z)` — nur die Lage der
  Welt-Saat.
Kein Default-Seed, keine Konstante, kein Cache: die Bindung war die Lage als Modul-Zustand statt als Argument.

## 2 · Geschnitten (die EINE Wurzel: die Lage wird Argument)

- **voxel-worker.js** — der Boden und die Region sind Funktion ihrer LAGE: `flaecheY(L, x, z, gitter)` ist die EINE Probe der
  Fläche (`voxelSurfaceY` ruft sie mit `state`), `terrainColumnContext(x, z, L)`, `terrainDensityAtCol(x, y, z, ctx, L)`,
  `editsFillTop(L)`, `editKarteFrisch(L)` lesen die Lage, die man ihnen reicht (ohne Lage `state`: jeder bisherige Rufer
  unverändert). `hydroRegionAn(L, H, origin)` ist die EINE Rechnung der Region (`hydroComputing` an der Lage, Boden
  `flaecheY(L, …, true)`); `hydroRegion(key, origin)` der Welt ruft sie mit `state`, der neue Auftrag `hydro-saat` mit der Lage
  aus dem Abbild des Samens (`hydroSaat`: `G.lageAus(msg.lage, SimplexNoise)`, das Gesetz `msg.gesetz`; kein Abbild, keine Saat,
  kein Gesetz → Wurf beim Namen, nie still `state`). Die Antwort ist dieselbe wie die der Welt (`hydroAntwort`, Transfer).
  `voxelGitterY` fiel (die Region ruft `flaecheY` direkt).
- **stamm/gelaende-chunks.js** — der Leser `_hydroSaat(samen, origin = null)`: das Abbild der Lage dieser Welt
  (`lageAbbild(_gelaende())`), nur die Saat ist `samen`, gerechnet im Planet-Faden (`_planetAuftrag(…, "Hydro")`); kein Merker,
  jede Frage rechnet. Das Entpacken der Flüsse und Seen ist EIN Glied `AnazhRealm._hydroDaten` (der Empfang der Welt
  `hydro-result` und `_hydroSaat` rufen es — bis hier stand es inline im Empfang). `PLANET_LESER` trägt „Hydro“.
- **spec/stamm/modul-karte.json** — `_hydroDaten`, `_hydroSaat` im Modul `Gelaende/chunks`.
- **Die Linse K8** (`scripts/diag-worker-dichte.cjs`, Familie `--faden --planet`, also in `gate:worker-dichte`): je Saat die Region
  über `_hydroSaat` gegen das Gesetz des STAMMS in derselben Engine (eine frische Welt der Saat auf der Klasse im Haupt-Faden,
  `_gelaende()` + `_voxelSurfaceY` — der unabhängige Pfad zu `lageAus` + `flaecheY`; SHA-256 der Flüsse, Seen und des
  Wasser-Felds), das Maß der Station an der Region, die Welt-Saat gegen `st.hydrosphere`. ROT beim Namen: kein Leser je Samen ·
  die Region der Welt-Saat für eine fremde Saat (der Täter) · andere Bytes als das Stamm-Gesetz · Saat ohne Flusslauf · Maß
  unter 95 % · zwei Wahrheiten an der Welt-Saat. Selbsttest: der gepflanzte Täter geht durch denselben Leser (der Auftrag trägt
  die Saat der Welt statt der gefragten) und ein Wirt ohne Leser — beide ROT beim Namen. Konsum-Leser: die Station kohaerenz#1
  (Vorschlag § 4) · K8. Das Band steht im Kopf der Linse.

**Entscheide (mit Zahl):**
- Die Lage eines fremden Samens ist das Gesetz DIESER Welt mit getauschter Saat (`lageAbbild`). An der Welt der Station (die
  Eingangs-Welt, frisches Gesetz) ist sie die Lage einer frischen Welt des Samens — K8 hält das Abbild je Saat: 101 von 101 gleich.
- Der Soll der Bytes entsteht in DERSELBEN Engine, nie in node: node 22 und Chromium 158 rechnen in der letzten Stelle verschieden
  (20 000 Eingaben: `exp` 1 983, `pow` 1 979, `atan2` 2 376, `sin` 672 abweichend); der Lauf der Flüsse verstärkt das
  (same-saat-2: 42 Läufe im Faden ↔ 45 in node). Gemessen: node-Bytes 0 von 7 gleich, Stamm-in-der-Seite 7 von 7.
- Das Maß jeder Saat liest die Fläche, die der Kern am Punkt nahm (`voxelY`: der Boden DIESER Saat ohne Kanal) — die gekerbte
  Welt-Fläche `_voxelSurfaceY` gibt es nur für die geladene Saat. Es ist das strengere Maß: node gekerbt 99,9 %, `voxelY` 98,1 %.
- Kein `?v=`-Sprung im Zweig: der Faden lädt mit `AnazhRealm.VERSION`, die Versions-Stufe setzt der Zug (die letzten drei
  Faden-Commits auf main trugen keinen).

## 3 · Gemessen (vorher → nachher, Container, Null-Renderer/swiftshader nur für die Mechanik, die Region rechnet die CPU)

| Maß | vorher (main 2da17e2e) | nachher (dieser Zweig) | Messname |
| --- | --- | --- | --- |
| Saaten mit Hydrosphäre im Spiel (der Leser je Samen) | **1 von 101** (Station, Radeon) — K8: ROT „`_hydroSaat` fehlt“ | **101 von 101** über `_hydroSaat`, je Saat die Bytes des Stamm-Gesetzes (101 von 101) | gate:worker-dichte K8 `--saaten 100` |
| Das Maß der Station mit dem Vorschlag (§ 4) im gebooteten Spiel, Fächer seriell | 1 Saat gemessen, 100 „ohne Fähigkeit“ | **101 von 101** gemessen, 0 an der Frist gerissen, **4 954 von 5 050 = 98,1 %** (Soll ≥ 95), 8,9 s; Welt-Saat 50 von 50 | Station kohaerenz#1 S1 (`WASSER_AN`) |
| Saaten je einzeln ≥ 95 % | — | 92 von 101 (schlechteste same-saat-29 43 von 50, -33 46, -8 47, -16 47, -42 47) | K8 „Wasser folgt dem Relief an … Saaten“ |
| Die Standard-Welt: Heim-Region (SHA-256 der Flüsse und Seen) | `58d407004212c027…` | `58d407004212c027…` — und `_hydroSaat(Welt-Saat)` trägt dieselben Bytes | K8 „die Saat der Welt = die Welt“ |
| Die Standard-Welt: Byte-Abdruck (Gitter je LOD Main UND Faden, beide Welten, Makro-Höhe) | 231 Abdrücke | **231 von 231 gleich** (abweichend nur das Feld `wurzel`, der Pfad) | `diag-worker-dichte --abdruck` |
| Kosten je Frage (EINE Region 2 048 m, 128² Zellen; nichts im Stand der Welt, kein Merker) | — | im Faden Median 70 ms, max 138 ms je Saat | K8 „je Saat im Faden“ |
| Mündungen der 3 279 Läufe (101 Saaten) | — | Rand der Region 1 848 (56 %) · Zufluss 1 213 (37 %) · See 151 (4,6 %) · Meer 67 (2,0 %) | K8 „Mündungen“ |

Tore an diesem Stand: `gate:worker-dichte` ganz grün (`--selftest` 32 s · `--kern --selftest` 94 s · `--faden --selftest` 119 s ·
`--faden --planet --selftest` 43 s mit K8, auf main ROT an K8 · `diag-planet --anker` 6 s) · `npm run check:statik` grün (die Wachstums-Wand braucht
`origin/integ-probe` im Klon) · `diag-atlas --check` · `npm run stamm:lint` · `npm run lint` 0 Fehler · Prettier.

**Das Bild** (`cloud-post/hydro-samen-bild/flussnetz-welt-und-drei-saaten.jpg`: die Heim-Region aus `_hydroSaat` im gebooteten
Spiel, Relief aus der Höhe der Lage je Saat, die Läufe nach Mündung gefärbt — Zufluss hellblau, Rand magenta): die Welt-Saat
21 Läufe (Zufluss 6 · Rand 15 — dieselben 21 wie `st.hydrosphere`), same-saat-0 54 (22 · 32), same-saat-29 41 (28 · 13),
same-saat-33 21 (4 · 17) — vier eigene Netze, keines ein Abzug der Welt. Rand 77 von 137 Läufen = 56 %, wie über 101 Saaten (§ 5);
Meer und See 0 in diesen vier (Binnen-Kacheln). Was das Auge außerdem liest: die Hauptläufe mäandern, die Zuflüsse laufen als
Geraden bis ≈ 600 m — Gesetz des Kerns (`MAEANDER`, gelaende-core :854: gerade ab 1,5 % Gefälle) —, und an Knoten des Netzes
münden 4 bis 8 Zuflüsse in EINEN Punkt (Welt-Saat 6, same-saat-29 8, im Bild gezählt). Die Sterne trägt schon die Standard-Welt;
sie sind das Netz `flussLaeufe`, nicht dieser Schnitt, und das Maß der Sprosse (bergab in Senke oder Meer) zählt sie nicht.

## 4 · Der Vorschlag für die Station (Zweig `punkte-maschine`, setzt der Koordinator)

`cloud-post/hydro-samen-station.diff` gegen `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js:8865`
im Zweig `punkte-maschine`: `WASSER_AN` liest
JEDE Adresse über `_hydroSaat(a.saat)` (die Saat der Welt eingeschlossen — EIN Leser, kein Zweig je Saat), bergab auf `voxelY`,
Ende über `mouth`/`inLake`; die Zeugen tragen die Mündungs-Klassen (`meer` · `see` · `zufluss` · `rand`); die Frist des Fächers
10 → 20 s (gemessen 8,9 s für 101 Saaten auf dieser CPU — der Rest ist Rand für langsamere Geräte); `export`/`leser` nennen
`_hydroSaat`. Konsum-Probe des Diffs im gebooteten Spiel: Zeile „Das Maß der Station“ in § 3.

## 5 · Offen (mit Grund und Messnamen)

- **Die Buchung:** die Station lebt in `punkte-maschine`; bis der Diff (§ 4) dort steht, zählt sie weiter 1 von 101 (Messname:
  Station `same.kopplung.kohaerenz` S1). Der Lauf an der Radeon ist ungemessen (kein Gerät im Container).
- **9 von 101 Saaten unter 95 % je Saat:** 96 der 5 050 Paare steigen über 5 cm auf dem ungekerbten Boden — der Lauf wird auf der
  glatten Makro-Fläche geroutet und erst danach auf die echte gesetzt (gelaende-core `hydroSampleRiverSurfaces` :6757, das Bett
  schneidet der Spiegel, `hydroRiverSpiegel` :6784). Messname: K8 „Wasser folgt dem Relief an … Saaten ≥ 95 %“.
- **56 % der Läufe enden am Rand der Region** (2 048 m; ihr Ende liegt in der Nachbar-Kachel, ungemessen) — das Band verlangt
  JEDEN Lauf in Meer oder Senke; die Station zählt `border` als Ende (`v.mouth` ist gesetzt). Messname: K8 „Mündungen“, Zeuge
  `rand` der Station (§ 4).
- **Ferne Kacheln eines fremden Samens:** `_hydroSaat(samen, origin)` nimmt die Ecke, K8 misst nur die Heimat (`origin` null) —
  ungemessen.

## 6 · Kopf

Schnitt: `cb3e2520c0882c5425327e64affd79253e1027f9` (WIP `Schnitt hydro-samen`). Der Vorprüf-Kopf ist der Commit, der dieses
Blatt trägt (Betreff „Vorprüfung hydro-samen 1 (auf main 2da17e2e)“), auf main `2da17e2e72e57ee227b2f393f4a9eff074c23813`;
`git merge-tree --write-tree origin/main HEAD` konfliktfrei (Baum `8957e664`, vor dem Blatt-Commit gerechnet).

## Äußere Quelle (Band)

Wang et al. 2018, Nature Geoscience 11, 926 („Recent global decline in endorheic basin water storage“): die Binnen-Senken
entwässern rund ein Fünftel des Lands (≈ 20 %), das Meer den Rest (≈ 80–83 %, Wikipedia „List of drainage basins by area“: 17 %
endorheisch). Band: JEDER Lauf endet in Meer oder Senke (100 %); auf der Erde ≈ 4 von 5 im Meer. Zitiert im Kopf der Linse K8.

Status: ZWISCHENSTAND · Karte 2 gebucht 118 von 1 718.
