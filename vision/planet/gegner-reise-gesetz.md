# GEGNER „ZWILLING UND SCHLÜSSEL“ — die Reise am Zweig w28-planet-kern (15.11.2026, 08:52) · ZWISCHENSTAND

Angegriffen wurde der Kopf **f186f9af** (Schnitt 1 a7e1b9ca + Merge main **4ee205bd**), Kern `planet-h2-2`, in einem eigenen Baum
(`.claude/worktrees/gegner-reise-gesetz`, detached), main daneben bei 4ee205bd (`gegner-reise-main`). Den Baum der Bauer
(`w28-planet-kern`) habe ich nicht angefasst: dort liegt um 08:32 ein **ungesicherter** Schnitt-2-Anfang in `gelaende-core.js`
(+39/−4, nicht committet, nicht gepusht; `erbgutNormal(roh, reglerDelta)` ruft die zwei NICHT definierten Namen `ORT_REGLER_OHNE`
und `ERBGUT_WILDNIS`, `meer(L)` und `ortDer(L)` haben 0 Rufer). Schnitt 2 und 3 haben keine Rückgabe — es gibt sie nicht. Alle
Läufe: CPU (node 24.15.0, Null-Renderer). GPU: 0 (das Schloss der Radeon war 08:42 belegt, 5 warten; kein Fund brauchte sie).
Proben samt Quelltext: `vision/planet/gegner-reise/` auf diesem Zweig.

**Drei Sätze.**
- **Geschnitten:** nichts — Angriff; zwölf Funde mit Beleg, davon drei hoch: (F1) der Haken `_planetAnker` hängt am Samen der
  WELT, an einem Reise-Ziel rechnet er also den Planeten der Ort-Saat (ein zweiter Planet: Anker 45,1° S statt 43,4° N), und die
  Linse K6 erzwingt genau diesen Schlüssel; (F2) der Planet-Faden rechnet jede Hydro-Kachel der Sitzung ein zweites Mal
  (134–282 ms je Kachel, die Heimat-Region 123–149 ms) und lebt über jeden Welt-Wechsel, also auch in jedem Sprung; (F3) ein Ziel
  mit dem Erbgut, das Schnitt 2 baut, LÖSCHT die Platte der Heimat (4 → 0 Schlüssel, Treffer nach der Heimkehr 0 von 4; mit
  gleichem Erbgut 4 von 4).
- **Gemessen:** Heimat byte-gleich hält in dem, was ich nachfahren konnte (Anker-Bits in 5 Prozessen und 4 Modi gleich, Richter
  `--selbsttest` 44/44, `ort.delta.null` 30/30, K6 samt Selbsttest GRÜN, gate:betriebsgesetz GRÜN); der Faden kostet im Spiel
  0,41–0,87 s Wanduhr je neuem Samen (K6: 799 ms) und hält danach 1,7–4,4 MB Heap nach zwei GC; `--bytes` steht unter Last
  **ROT** an einer Wanduhr-Schwelle (Streifen 497 ms > 150 ms).
- **Ehrlich offen:** Konsum-Tiefe am Kopf 0 von 23 Feldern — die Welt ändert sich nirgends beobachtbar, nur eine Zeile der
  Konsole; t(Weltbild) kalt und VRAM habe ich nicht neu gemessen (die Kosten-Zeile der Bauer löst den Schnitt bei 3 Boots je Seite
  nicht auf); zweite Node-Version und zweite Engine fehlen am Platz.

---

## 1 Funde (Schwere · Beleg · was es heißt)

| # | Schwere | Fund | Beleg |
|---|---|---|---|
| F1 | **hoch** (Schnitt 3) | **Der Planet hängt am Samen der Welt, nicht am Samen des Planeten.** `_planetAnker()` liest `this._gelaende().seed` = `worldMeta.seed` (`stamm/gelaende-chunks.js` 627, über `stamm/gelaende-boden.js` 738–739), der Faden rechnet `planetPlan(msg.samen, PLANET_ERDE…)` (`voxel-worker.js` 1089). An einem Reise-Ziel ist `worldMeta.seed` die Ort-Saat `<Heimat>@<B>_<L>_<t>` (ENTSCHEID-REISE §1.1) — der Faden rechnet dort einen ANDEREN Planeten, und `_planetAnker` wird bei JEDER Weltgeburt bestellt (`generateTerrainWithParameters`, 1262–1266), also an jedem Ziel. Die Linse K6 urteilt `spiel.samen !== spiel.weltSamen` als ROT (`scripts/diag-worker-dichte.cjs` 2011): sie verbietet den richtigen Schlüssel (Teil `ort.samen`). | node (`gegner-reise/anker.cjs`): `anazh-realm-seed` → 43,432° N · 12,076° O, Küste 288,6 km; `…@17.09_61.93_0` → **45,134° S · 63,084° W**, Küste 76,9 km; `…@79.07_0.56_0` → 45,241° S · 79,274° W; `…@5.00_-28.00_0` → 44,173° S · 148,057° W. Der Satz „reise“ sagte am Ziel „diese Welt liegt bei 45° S“ — auf einem Planeten, den es nicht gibt. |
| F2 | **hoch** (Preis des Sprungs, Gebot 7) | **Der Planet-Faden trägt die ganze Welt.** Er ist ein `_nebenFaden` mit vollem Stand (`stamm/gelaende-chunks.js` 567–611): `_voxelZustandPost` (440–446) schickt ihm jede Zustands-Nachricht, und `msg.type === "hydro"` RECHNET die Region in jedem Faden (`voxel-worker.js` 131–142 → `hydroRegion` 1585). `_nebenFaeden` steht in `WELT_GRENZE.wirt` (`stamm/speicher-welten.js` 3492) und überlebt jeden Welt-Wechsel: an jedem Ziel rechnet er die Heimat-Region des Ziels in der Ankunft mit, parallel zum Voxel-Faden. | Null-Renderer (`gegner-reise/gegner-faden.cjs`): eine ferne Kachel im Planet-Faden 282 · 182 · 134 ms gegen 205 · 171 · 162 ms im Voxel-Faden; die Heimat-Region im Planet-Faden 149 · 123 ms. Heap nach zwei GC (`gegner-heap.cjs`, A B B A): der Planet-Faden 1,71 und 4,37 MB, Summe aller Ziele main 44,85 · 41,25 MB ↔ Kopf 44,15 · 48,94 MB. Der Bauer nannte den Zustand (`planet.faden.zustand`), die Rechenzeit stand ungemessen. |
| F3 | **hoch** (Schlüssel) | **Ein Ort mit Δ der Landform löscht die Platte der Heimat.** Schlüssel `seed|cx,cz|lod|s…|p…` (`stamm/gelaende-chunks.js` 821–826) trennt die Welten, aber der Stempel `VERSION|genV|landform|<Erbgut-Hash>|FORM` (812–815) ist EINER für den ganzen Speicher: ein fremder Hash leert ALLES (`voxel-worker.js` 785–788). Schnitt 2 summiert das Δ in `erbgutNormal` (WIP) → anderer Hash an jedem Ziel. Ein Ziel kann Heimat-Schlüssel nicht ÜBERschreiben (Samen im Schlüssel), aber auslöschen. | Lauf Heimat → Ziel → Heimat über die EINE Tür (`_weltBetreten` → `_weltWechsel`), Ziel mit der Ort-Saat und dem Wildnis-Term „heiß-trocken“ aus ENTSCHEID-REISE §3 (`gegner-reise/gegner-platte.cjs`): **delta** — Heimat-Schlüssel 4 → 0, Stempel `…|1289f948|…` → `…|847120cb|…`, nach der Heimkehr Treffer 0 von 4; **gleich** (dieselbe Ort-Saat, Erbgut der Heimat) — 4 → 4, Treffer 4 von 4. Der Deckel `CHUNK_IDB_MAX` 600 leert ebenfalls alles (`voxel-worker.js` 829–833). Das Blatt plant den Schnitt (Schnitt 2, „Platte“); die Zahl heute: 0 %. |
| F4 | mittel (Zwilling Jahr) | **Das Jahr steht dreimal.** `PLANET_ERDE.jahrTage: 365.25` (`planet-core.js` 262) — ein Körper, den der Kern selbst unter R5 ablehnt; jeder Rufer flickt ihn per `Object.assign(…, { jahrTage: 365 })`: der Faden (`voxel-worker.js` 1089), der Richter (`scripts/diag-planet.cjs` 54), die Linse (`scripts/diag-worker-dichte.cjs` 1995). Dazu die Erd-Normierung `fJ = (jahrTage / (jahrTage + 60)) * (425.25 / 365.25)` (`planet-core.js` 2060). Die Absenz des Bauern („365,25 tot, 0 Treffer“) grepte Stamm und Skripte, nicht den Kern. Die Kosten- und `--bytes`-Proben des Richters bauen weiter mit 365,25 (`diag-planet.cjs` 692, 706, 716–725, 759, 821–824, 1183). | node: `planetAnker(planetPlan('anazh-realm-seed', PLANET_ERDE), 0, ortGesetz())` → „koerper.jahrTage 365.25 ist nicht das Jahr des Ort-Gesetzes 365 (R5, K10)“. Der Anker selbst hängt nicht am Jahr (Bits bei 365 und 365,25 gleich); `fJ` ist bei 365 nicht 1 (0,99991) und skaliert die Jahres-Spanne an jedem Ort. |
| F5 | mittel (Zwilling Schnee/Phase, Schnitt 2) | **Stamm-Leser, die am Ziel den Heimat-Wert läsen und in keiner Sterbe-Liste stehen.** `_schneeTafel` nimmt `K.TEMPERATUR.sommerPhase` als Phase (`stamm/bild-himmel.js` 2815) — an einem Süd-Ort ist sie +0,5; `_schneeTakt` rechnet das Neubau-Band aus `K.SCHNEE.start/voll` (2869–2871) — wandert das Band am Ort (Blatt: „das BAND wandert mit dem Ort“), baut es die falschen Chunks neu. Die Jahres-Leser `K.TEMPERATUR.jahrTage` (2813, 2842, 2920; `stamm/wasser-hydro.js` 83; Kern 1402, 1459) halten nur, solange R5 den Körper auf 365 zwingt. | `grep -n "TEMPERATUR\.\|SCHNEE\." stamm/*.js` am Kopf; ENTSCHEID-REISE Schnitt 2 „Stirbt“ nennt keine dieser Zeilen. |
| F6 | mittel (Zwilling Gelände, Mitspieler) | **Fünf Rufer der Normalform, einer bekommt das Δ.** `erbgutNormal` rufen `stamm/gelaende-boden.js` 1305 (`_erbgut`, der geplante Leser), `stamm/netz-p2p.js` 3351 (die Stufe des Gesetzes im Netz), `stamm/speicher-welten.js` 109 (die Wand), `gelaende-core.js` 2691 (Lage ohne Wirt) und 5707 (`planAbbild`). Ohne Δ rechnet jeder dieser Rufer am Ziel das Gelände der Heimat — der Mitspieler (3351) zeichnet ein zweites Gelände. | `grep -rn "erbgutNormal("`; das Blatt nennt `reise.mitspieler` offen, den Rufer 3351 als Leser des Δ nicht. |
| F7 | mittel (Konsum, G1) | **Konsum-Tiefe 0 von 23.** Vom Planeten liest das Spiel den Anker (Lage, Küste, VERSION) und sagt ihn als Zeile; keine Größe ändert ein Bild, eine Zahl der Welt oder ein Gesetz. `ort.leser` (≥ 1, GRÜN) zählt die Datei, die den Kern lädt — Existenz, nicht Konsum. | `node scripts/diag-planet.cjs --richter ort`: „Leser des Kerns im Spiel 1 (voxel-worker.js); den Ort als Differenz (planetOrt) lesen 0 … von den 23 gelieferten Feldern des Orts 0“ — GRÜN. Der Bauer schreibt dasselbe ehrlich (§7). |
| F8 | mittel (Gebot 7) | **Jede Welt zahlt den Planeten, auch ohne Satz.** Bestellt in `generateTerrainWithParameters` für jede Welt (Boot, Wechsel, jedes Ziel), gelesen nur vom Satz „reise“. Nach jedem Welt-Wechsel fällt `_planetAnkerJe` (nicht in `WELT_GRENZE.wirt`): auch die Heimkehr rechnet den Anker der Heimat neu. | Null-Renderer: ein neuer Samen 420 · 873 · 410 ms Wanduhr im Faden; K6: 799 ms; node am Kopf 12 frische Saaten CPU 125 / 220 / 313 ms (warm), die erste kalt 671 ms. Annahme des Blatts ≤ 0,45 s: reißt im Spiel. |
| F9 | niedrig (Linse) | **Zwei der fünf Täter des K6-Selbsttests sind ins Ergebnis geschrieben, nicht in die Welt gepflanzt:** „Faden vor dem Bild“ ist `nachBildMs: mutant ? -1` und „kein Satz“ ist das Überspringen des Satzes (`scripts/diag-worker-dichte.cjs` 1959–1990, 1964, 1985). Der Selbsttest beweist dort den Richter, nicht den Leser. „Kern im Haupt-Faden“ setzt und liest `globalThis.__planetCore` in derselben Funktion. | Quelle gelesen; `--faden --planet --selftest` GRÜN (14 s, „fallen ROT beim Namen“). |
| F10 | niedrig (Tor) | **`--bytes` urteilt eine Wanduhr.** `bytes.streifen` verlangt „Streifen 256 px ≤ 150 ms“ — unter der Last dieses Morgens ROT bei 497 ms, alle SHA gleich. Der Bauer meldete `--bytes` GRÜN; der Bericht der Bauer ist an dieser Zeile nicht wiederholbar. | `node scripts/diag-planet.cjs --bytes` 08:4x: „ROT bytes.streifen relief cc2f82842589 = cc2f82842589 · biom e7da6037d390 = e7da6037d390; Streifen max 497 ms“. |
| F11 | niedrig (Falle Schnitt 3) | **Die Tür nimmt eine Welt ohne `genVersion` still als Genese 1.** `_genVersion()` → `worldMeta.genVersion || 1` (`stamm/gelaende-boden.js` 1491–1493). Meine erste Probe gebar das Ziel mit einem nackten Abbild: Stempel `…|1|…` statt `…|9|…` — das Ziel lief unter einer älteren Genese, ohne Wort. `_buildEmptyWorldSnapshot` setzt 9 (`stamm/speicher-welten.js` 166, 443); wer die Reise-Welt anders baut, fällt hinein. | `gegner-platte.cjs` erster Lauf (ohne `genVersion` im Abbild): Ziel-Stempel `18.546.292|1|landform|847120cb|…`. |
| F12 | niedrig (Version) | **Der Anker wandert mit dem Kern, das Spiel sagt es nicht.** Am Kopf ist nichts gespeichert (der Anker entsteht je Boot neu); eine neue VERSION versetzt die Heimat still auf einen anderen Ort, der Satz nennt ihn mit der Version. Für Schnitt 3 trägt das Blatt die Gegenwehr (Δ in der Welt, VERSION in der Welt-Id). | `bytes.version` GRÜN (h2-2 → cc2f8284 = Tafel); Blatt §4.4: 48,42° N (d660f478) → 43,43° N (932749bc). |

---

## 2 Die Jagd je Größe (am Kopf f186f9af): liest der Leser die EINE Stelle?

Die EINE Stelle ist die Tafel `ortGesetz()` (`gelaende-core.js` 5638–5647). Am Kopf liest sie im Spiel nur der Faden des Ankers;
jeder Leser der Welt liest die Konstanten der Heimat direkt — für die Heimat richtig, am Ziel (Schnitt 2/3) der Zwilling.

| Größe | Leser (Datei:Zeile) | liest die EINE Stelle |
|---|---|---|
| Jahr | `voxel-worker.js` 1089 (Plan des Faden) · `planet-core.js` 262 und 2060 · `stamm/bild-himmel.js` 2813, 2842, 2920 · `stamm/wasser-hydro.js` 83 · `gelaende-core.js` 1402, 1459 | ja (1089) · **nein** (Kern 365,25 · Normierung 365,25) · nein (TEMPERATUR direkt, gleich nur durch R5) |
| Phase der Saison | `stamm/bild-himmel.js` 2815 · `gelaende-core.js` 1317, 1488 | nein (TEMPERATUR.sommerPhase) |
| Temperatur / Kühlung | `gelaende-core.js` 1308–1320 (`temperaturFeld`, Kühlung aus dem Sommer) · Tafel 5640 (`kuehlungKJeM`, dieselbe Rechnung) | **zweimal gerechnet** (der Bauer nennt es, Schnitt 2 soll es schneiden) |
| Schnee-Band | `stamm/bild-himmel.js` 2869–2871 · Kern `schnee` 1277–1283 | nein (SCHNEE direkt) |
| Meeresspiegel | 32 stille Rückfälle mit drei Werten (Blatt §0.5); am Kopf unverändert, `meer(L)` im WIP ohne Rufer | nein |
| Spende | `gelaende-core.js` 1611, 1616, 1647 (`PEGEL.spende`) · Tafel 5644 | nein |
| Landform-Regler | `_erbgut` 1305 · `netz-p2p.js` 3351 · `speicher-welten.js` 109 · `gelaende-core.js` 2691, 5707 | nein (Δ noch nirgends; WIP plant es in `erbgutNormal`) |
| Wetter-Verteilung | `phyto-core.js` 4110–4187 (`wetterAt`) · Gesetz der Welt `gesetz.wetter` (`speicher-welten.js` 102–107) | nein; Gefahr: zwei Quellen des Wetters am Ziel (Wort-Tafel der Welt und Δ des Planeten) |

---

## 3 Byte-gleich und Preis — nachgefahren

| Annahme | Zahl | Urteil |
|---|---|---|
| Anker deterministisch | `anazh-realm-seed` → `1b7eeb89da41e83f4480211445faca3f39b2a7fa370a7240` (Breite · Länge · Küste) in 2 × node, `--jitless`, `--max-opt=0`, `--no-opt` | hält (eine Node-Version, 24.15.0) |
| Anker im Faden = node | K6: „der Kern in node trägt dieselben Bytes“ | hält |
| Kern-Richter | `--selbsttest` 44 GRÜN von 44 · `--richter ort` `ort.delta.null` 30/30 (14 Süd-Anker) · `--bytes` 7 Zeilen GRÜN, `bytes.streifen` ROT (Wanduhr, F10), `planet.bytes.engines` OFFEN | hält bis auf F10 |
| 12 frische Saaten | 0 Würfe; CPU warm 125 / 220 / 313 ms (min/med/max) | hält |
| Plan + Scheibe + Anker ≤ 0,45 s | Spiel (Null-Renderer) 410–873 ms, K6 799 ms | **reißt** (wie beim Bauer: 0,60 s) |
| Heap nach 2 GC an der Heimat | main 44,85 · 41,25 MB ↔ Kopf 44,15 · 48,94 MB (Null-Renderer, A B B A); der Planet-Faden allein 1,71 · 4,37 MB | der Faden ist ein Dauer-Posten; die Summe streut mehr als er |
| t(Weltbild) kalt, VRAM | nicht gemessen (Radeon belegt) | offen; die Zahl der Bauer (Δ −0,21 s bei Spannweite 2,49 s, 3 je Seite) löst nicht auf |
| Heimat byte-gleich (Golden, Abdruck) | nicht wiederholt; die Laufzeit-Bytes der Heimat ändert der Schnitt nur additiv (`ortGesetz` ohne Rufer in der Heimat, ein Auftrag mehr im Faden, ein Satz) | die Lese-Probe stützt die 103/103 der Bauer; das Bildpaar (19 % in 1 von 4 Boots) bleibt ungeklärt |

---

## 4 Was der Spieler heute erlebt

Er tippt „reise“ und liest „43,43° N · 12,08° O, Küste 289 km“. Sonst nichts: kein zweiter Ort, kein anderes Klima, keine Reise —
dafür in jeder Sitzung ein Faden mehr, der jede Wasser-Kachel mitrechnet.

## 5 Sprossen

Keine bewegt: `same.massstab.sprung` 4 (jeder Ort, volles Bild ≤ 2 s) und 5 (andere Zeit) brauchen den Sprung, den es nicht
gibt; `same.kopplung.zeitreise` 4 braucht Rückkehr mit Werk; `same.entfaltung.reise` ist ein Weg am Stück, kein Sprung. F1 und
F2 stehen VOR jeder dieser Sprossen: ohne den Samen des Planeten im Teil `ort` liegt jedes Ziel auf einem fremden Planeten, und
mit dem Planet-Faden als vollem Neben-Faden zahlt jeder Sprung eine zweite Hydrosphäre.

## 6 Gesperrte Stellen

Keine berührt. F5 nennt `stamm/bild-himmel.js` 2815, 2869–2871 (frei); `stamm/gelaende-fern.js` (gesperrt) trägt vier der 32
Meer-Rückfälle (Blatt), ich habe dort nichts gelesen außer dem Namen.

## 7 Wie nachfahren

```
node vision/planet/gegner-reise/anker.cjs <Baum>                 # F1, F4, 12 Saaten, Heap des Plans
node <Baum>/scripts/gegner-platte.cjs delta|gleich               # F3 (Datei nach scripts/ legen; Null-Renderer)
node <Baum>/scripts/gegner-faden.cjs                             # F2, F8
node <Baum>/scripts/gegner-heap.cjs                              # Heap nach zwei GC je Faden
node scripts/diag-planet.cjs --selbsttest | --bytes | --richter ort
node scripts/diag-worker-dichte.cjs --faden --planet --selftest
```
