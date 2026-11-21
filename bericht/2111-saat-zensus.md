# Saat-Zensus 21.11. — „die Sitzung hält mehr als EINE Saat / einen Planeten“ (OMEN, nur gelesen)

Quelle: main 44446d65 (gelesen über `git show origin/main:…`), Mess-Datei punkte-maschine `messung/31ea3847-gtx.json` mit der
ganzen Liste der Runde 2 (1 428: 851 geurteilt, 579 ungemessen), Sprossen `vision/meisterkarte-2.json`. ZWISCHENSTAND, kein Schnitt.

## 1 Die Liste — 36 Stationen, deren Grund „die Sitzung hält eine Saat / einen Planeten“ nennt

Wofür: **V** vergleichen (N Saaten, je eine Welt, nacheinander) · **W** wechseln im Lauf · **G** gleichzeitig halten.

| Station | verlangt (Richter) | wofür | was der Grund dazu als fehlend nennt |
|---|---|---|---|
| erleben.bild.kamera#7 | 20 Saaten | V | keine Kinofahrt |
| erleben.klang.ereignis#7 | 10⁶ Saaten (1 000 Ereignisse) | V | kein fremder Stoff, kein fremdes Medium |
| erleben.klang.landschaft#8 | 100 Saaten | V | Ruf ∝ Leib nur über f0 der vier Gattungen (klang-core.js:497) |
| erleben.klang.musik#7 | 1 000 Saaten (Zufallsreise) | W | keine Musik fremder Arten |
| erleben.klang.raum#7 | 100 Saaten | V | c und Dämpfung fest (klang-core.js:1757), keine Atmosphären-Zeile |
| erleben.klang.stimme#5 | 100 Saaten | V | kein fremdes Sprechorgan |
| erleben.sinn.entdeckung#4 | 100 Saaten | V | — |
| erleben.sinne.feld#6 | 20 Planeten | V | keiner trägt einen Dynamo |
| erleben.sinne.genom#4 | 20 Saaten | V | keine Evolution der Sinne (tetrapoda-core.js:62) |
| erleben.sinne.geruch#6 | 20 Saaten | V | kein Fluss trägt Duft |
| erleben.sinne.gesehen#4 | 20 Saaten | V | keine Färbung durch Selektion |
| erleben.sinne.gesehen#6 | 20 Planeten | V | kein fremder Stern |
| erleben.sinne.hoeren#6 | 100 Saaten | V | keine echo-ortende Art |
| erleben.sinne.sicht#6 | 20 Planeten | V | planetPlan trägt keinen Stern-Typ (planet-core.js:9) |
| erleben.sinne.signale#3 | 20 Saaten | V | kein Gesang je Population |
| erleben.spieler.nichtleib#6 | 10 Saaten der Sitzung | V | — |
| erleben.spieler.nichtleib#7 | 10 Saaten der Sitzung | W | eine Welt, eine Epoche |
| erleben.spieler.rolle#7 | 10 Saaten der Sitzung | W | kein Wechsel von Planet und Epoche im Lauf |
| erleben.spieler.wegfindung#7 | 100 Saaten der Sitzung | V+G | kein Nachbarplanet, keine Bahn |
| planet.kosmos.himmelsmechanik#8 | 1 000 Saaten | V+G | EINE Sonne, EIN Mond |
| same.gedaechtnis.schicht#6 | 20 Planeten | V | — |
| same.massstab.nahe#6 | 10 Planeten-Saaten | V | — |
| same.massstab.spanne#1–#4 | je 20 Saaten | V | — („ein Start je Saat braucht eine neue Welt“) |
| same.massstab.sprung#6 | 20 Planeten | W+G | — (Umfang: „ein anderer Planet des Systems“) |
| same.physik.feuer#8 | 100 Planeten-Saaten | V | — (Richter: Saat mit O₂ 30 %) |
| same.physik.flug#6 | 100 Planeten | V | — (Richter: Wurfweite ∝ 1/g, Fahrt ∝ 1/√ρ) |
| same.physik.fluid#8 | 100 Planeten | V | — (Richter: ω² = g·k) |
| same.physik.reaktion#5 | 100 Saaten | V | — |
| same.physik.reaktion#6 | 100 Planeten | V | — (Richter: fremde Chemie) |
| same.physik.tragen#4 | 1 000 Saaten | V | 0 von 400 Werken unter dem Gesetz (stamm/bau-teile.js:2493) |
| same.physik.tragen#7 | 100 Planeten-Saaten | V | — (Richter: Höhe ∝ σ/(ρ·g)) |
| same.preis.ankunft#8 | 20 (Same, Planet, Epoche) | W | kein Wechsel von Planet und Epoche (zeitMa 0) |
| same.preis.bytes#7 | 20 neue Planeten | W | kein Sprung zu einem neuen Planeten im Lauf |

Summe 36: V 30 · W 6 · G 3 (alle drei zugleich mit V oder W). Verlangt: 10 bis 10⁶ Saaten; 9-mal „Planeten“ (7 davon ein anderer Körper, Stern oder System, §4), 3-mal „Planeten-Saaten“.

## 2 Die Grundgröße — wo die Sitzung ihre Saat bindet

| Rolle | Ort (main 44446d65) | Befund |
|---|---|---|
| der EINE Schreiber einer neuen Saat | stamm/speicher-welten.js:416 `_generateFreshWorldMeta(slug, saat)` | `saat ?? "w-<id>-<Zufall>"`; das Argument `saat` gibt es schon |
| die Vorgabe | stamm/speicher-welten.js:64 `_weltMetaHeil` | ohne Saat → "anazh-realm-seed" |
| zwei Überschreiber neben dem Argument | speicher-laden.js:1972 (`_weltAusPlan`) · netz-portal.js:697 (Reise-Ort) | setzen `meta.seed` NACH dem Schreiber statt über sein `saat` |
| die Bindung | `state.worldMeta.seed` — EIN Feld je Seite | der Wechsel nur ganz: `_weltWechsel` speicher-laden.js:1447 → `_weltAbschied` :1515 |
| die Gelände-Lage | gelaende-boden.js:766 `_gelaende()` | EINE lebende Lage je Seite (Saat :771, Rausch `_voxelNoise` :775), 65 Leser in 14 Stamm-Dateien |
| der Voxel-Faden | voxel-worker.js:1802 `state.seed` / `state.noise` | EINE Saat je Faden, neu gebaut, wenn der Stand eine andere bringt |
| der Planet-Faden | voxel-worker.js:1401 `planetPlaene` (Map je Samen) · gelaende-chunks.js:682 `_planetAnkerJe` | schon je Saat |

Leser der Sitzungs-Saat (`worldMeta.seed`, ohne Kommentare): **56 Stellen, 48 in 21 Stamm-Dateien + 8 im Voxel-Faden, 0 in den Kernen** —
A 24 (beim Aufruf gelesen) · C 21 (gemerkt, Saat im Schlüssel) · **B 11 (gemerkt ohne Saat im Schlüssel)**. Je Domäne: Vegetation 15 ·
Siedlung 8 · Kreatur 7 · Himmel/Stoff 5 · Gelände 4 · Feld 3 · Klang 2 · Bau 2 · Netz/Speicher 2 · Voxel-Faden 8.
Zwillinge der EINEN Vorgabe: **43 × `|| "anazh-realm-seed"`** (41 Stamm, 2 Faden) + gelaende-core.js:2736 `LAGE_GRUND.seed` — sie feuern nur
vor dem Heil, also im Konstruktor; klang.js:143 hasht die Saat mit einem eigenen ×31-Hash statt `samenHash`.

Die 11 B-Stellen, nach Schwere:

| Stelle | Feld | beim Wechsel |
|---|---|---|
| klang.js:141 · :1207 | `symphony.umwelt.rufSaat` · `symphony.lofi.rngState` | **reist mit** (`symphony` steht in `WELT_GRENZE.seite`, speicher-welten.js:2704) — die Welt danach klingt mit der alten Saat |
| bau-vorlagen.js:854 · :913 | `state.blueprints` fels_var/kristall_var · `_growTreeNoise` | im Konstruktor gebaut, die Saat ist dort `null` → **immer das Literal**, jede Welt dieselben Felsen (:913 gewollt, :908) |
| vegetation-streu.js:2463 · :2763 | `_growTreeNoise` | nur durch das Laden beim Namen geräumt — eine Ziel-Welt ohne Stand behält den alten |
| gelaende-boden.js:775 · vegetation-wiese.js:2419/2435/2449/2508 | `_voxelNoise`, `_ironBandsNoise`, `_clumpNoise`, `_placementNoise`, `_forestNoise` | fallen heute nur durch das allgemeine Löschen (speicher-laden.js:1595); Wache ohne Saat |

## 3 Funktion der Saat oder Welt-Zustand

| Teil | f(Saat, Ort) ohne Welt-Zustand? | Beleg |
|---|---|---|
| samen-core `samenBaum` / `samenHash` | ja | samen-core.js:84, keine Memos; Spike Fall 1 |
| gelaende-core `lageGrund` · `hoehe` · `lageRausch` · `ortSaatWahl` | ja — die Memos hängen an der Lage (`NETZE` je Saat :506, `LAGE_NETZ` WeakMap :510), die übrigen (Rausch-Gitter, Fels-Mittel) an keiner Saat | Spike Fall 2 |
| planet-core `planetPlan` · `Scheibe` · `Punkt` · `Anker` · `Ort` | ja — `MEMO` WeakMap je Plan (:648); der Körper der Saat entsteht schon im Kern (Radius 2 500–12 000 km, g, Jahr, :316) | Spike Fall 3 |
| die übrigen 10 Kerne mit Saat-Argument (fachwerk, schmiede, foundry, phyto, leben, koerper, tetrapoda, vehicle, porta, klang) | Saat als Argument, keiner liest eine Sitzungs-Saat | grep `function …(samen\|seed\|saat…)` |
| Brücke Planet → Welt | **nein**: die Welt nimmt den Körper der Erde (voxel-worker.js:1407 `PLANET_ERDE`), ein anderes Jahr bricht beim Namen (planet-core.js:2553, R5) | „Planeten“ = andere Körper gibt es im Kern, nicht in der Welt |
| `_gelaende()`, Voxel-Faden, die 48 Stamm-Leser | **nein**: EINE Saat der Seite, eine zweite nur über den ganzen Wechsel | §2 |

## 4 Das Gesetz (Vorschlag)

**Die Saat ist das Argument der Welt, nie ein Feld der Seite: EINE Sitzung trägt N Saaten über den EINEN Wechsel `_weltWechsel`
(speicher-laden.js:1447), dessen Saat allein `_generateFreshWorldMeta(slug, saat)` schreibt — und an der Grenze `WELT_GRENZE` fällt
jedes gemerkte Ding der alten Saat (die 11 B-Stellen, die 43 Zwillinge der Vorgabe fallen in das EINE Heil).**
Chokepoint: `_weltWechsel` mit `WELT_GRENZE` (speicher-welten.js:2632). Die Fragen über 10³–10⁶ Saaten, die nur der Kern
beantwortet, gehen ohne Wechsel über dieselben reinen Funktionen (§3, Spike) — der Wechsel bleibt der Weg für alles am Welt-Zustand.

| Fall | Sprossen | Zahl |
|---|---|---|
| **allein erzeugbar** (der Grund nennt nur die Saat, Körper der Erde genügt) | sinn.entdeckung#4 · spieler.nichtleib#6 · massstab.spanne#1–#4 · massstab.nahe#6 · physik.reaktion#5 · gedaechtnis.schicht#6 · preis.bytes#7 | **10** |
| + der Körper der Saat (das Ort-Gesetz je Körper: Jahr, g, ρ, Luft — R5 fällt) | physik.flug#6 · physik.fluid#8 · physik.tragen#7 · physik.feuer#8 · physik.reaktion#6 · klang.raum#7 | 6 |
| + Stern-Typ und Dynamo im Plan | sinne.sicht#6 · sinne.gesehen#6 · sinne.feld#6 | 3 |
| + ein System (mehrere Körper zugleich, Bahnen) | massstab.sprung#6 · spieler.wegfindung#7 · kosmos.himmelsmechanik#8 | 3 |
| + die Epoche im Lauf (zeitMa ≠ 0) | spieler.nichtleib#7 · spieler.rolle#7 · preis.ankunft#8 | 3 |
| + Evolution / ein Arten-Gesetz über Saaten | sinne.genom#4 · sinne.gesehen#4 · sinne.signale#3 · sinne.hoeren#6 · sinne.geruch#6 · klang.landschaft#8 · klang.musik#7 · klang.stimme#5 | 8 |
| + je eine eigene Fähigkeit | bild.kamera#7 (Kinofahrt) · klang.ereignis#7 (fremder Stoff, Medium) · physik.tragen#4 (Statik der Werke) | 3 |

Preis: ein Wechsel ist eine ganze Ankunft je Saat — am Wechsel UNGEMESSEN (keine GPU neben der Runde); der Boot der Mess-Sitzung kostet
bootS 6,4 s (Mess-Datei `sitzung`). Für 20–100 Saaten trägt das, für 10³–10⁶ nur der Kern.

## 5 Spike — zwei Saaten in EINEM Prozess über die reinen Kerne (p3/n2111/saat/spike.cjs, über gpu-lauf)

A = "anazh-realm-seed", B = "w-sweepalpha0001-aaaaaa"; je Kern A allein, B allein, dann A und B verschränkt je Frage; Exit 0, Log `spike.log`.

| Fall | trägt | bricht | Zahl |
|---|---|---|---|
| 1 samen-core `samenBaum(s).saat(pfad)`, 20 000 Pfade | verschränkt A' = A und B' = B Bit für Bit; A ≠ B an 20 000 / 20 000 | — | 11,6 / 7,3 ms je 20 000 |
| 2 gelaende-core `lageGrund` + `hoehe`, 64 × 64 Punkte | verschränkt Bit für Bit gleich, eine neue Lage A = A; A ≠ B an 4 096 / 4 096, mittl. \|Δh\| 20,8 m | — | 47 / 24 ms je 4 096 Höhen, verschränkt 12 ms je 8 192; Heap +2,8 / +2,5 MB je Lage |
| 3a planet-core, Körper der Erde: Plan, Scheibe t = 0, 4 000 Punkte, Anker | verschränkt Bit für Bit gleich, ein neuer Plan A = A; A ≠ B an 4 000 / 4 000; Anker A −0,79 / −1,87 rad, B 0,80 / −1,66 rad | — | 419 / 432 ms je Plan; Heap +1,5 / +0,6 MB |
| 3b planet-core, Körper der Saat | der Plan trägt zwei fremde Körper: A R 4 780 km, g 8,47, Jahr 570 d · B R 10 315 km, g 16,49, Jahr 136 d | `planetOrt` bricht an BEIDEN beim Namen: „Jahr 570 / 136 ist nicht das Jahr des Ort-Gesetzes 365 (R5, K10)“ | 283 / 194 ms |

Urteil: die Kerne halten zwei Saaten nebeneinander ohne Übersprechen, zu Kosten in Millisekunden. Es bricht nicht der Kern, sondern
(a) die Seite — EINE Lage, EIN Faden-Rausch, 11 B-Stellen, zwei Klang-Ströme reisen über den Wechsel — und (b) die Brücke zum
Ort-Gesetz mit EINEM Jahr (R5): sie hält die 6 + 3 Sprossen der fremden Körper aus §4 an.
