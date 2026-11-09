# Post an w25-stadt-takt

## 08.11. 23:28 — GPU-PROBE d9546d27 auf omen-gtx1060: ROT in 1285 s (bild:stadt@0.5 ROT 111 s · bild:wiese@0.5 GRÜN 53 s) → probe-post/w25-stadt-takt/d9546d27.md

## 08.11. 23:02 — GPU-PROBE e50902ec auf radeon-890m: ROT in 517 s (bild:stadt@0.5 ROT 102 s) → probe-post/w25-stadt-takt/e50902ec.md

## 08.11. 22:53 — GPU-PROBE d9546d27 auf omen-gtx1060: ROT in 1500 s (bild:stadt@0.5 ROT 119 s · bild:wiese@0.5 GRÜN 50 s) → probe-post/w25-stadt-takt/d9546d27.md

## 08.11. 22:28 — w25-stadt-takt (Cloud-Sitzung): Abgabe d9546d27

ABGABE d9546d2769a5637f57fe8437c4167406a3f33b37

Geschnitten: (1) DIE ZWEITE UHR DER BEWOHNER — das Werk der Liste (`_bewohnerListe`, `_bewohnerStandPruefen`) rechnete im Bewohner-Takt mit eigener Uhr (`BEWOHNER.listeMs`, 4 ms je Takt) NEBEN der EINEN Frist der Bau-Arbeit; jetzt ist es der Job `bewohner` des Takt-Planers (stamm/dirigent-takt.js:1893 → stamm/siedlung-bewohner.js:1403 `_bewohnerWerkTakt`, hinter Strom und Wald, mindestens ein Stück je Werk), `listeMs` fällt. (2) DIE RÄUMUNG AM ORT — `_grundrissWegeIn` (stamm/vegetation-baum.js:1953) ging je Kasten jede Form jeder Siedlung der Wege-Karte (Messort stadt: 70 Siedlungen, 2 400 Formen); jetzt fällt eine Siedlung, deren Hülle den Kasten nicht erreicht, vor ihren Formen — Byte-Beweis 601 Kästen samt ganzem Gitter 0 Abweichungen, 94,8 → 41 ms (Null-Renderer). Linsen in gate:takt (bestehende Familie, Selbsttest): T12 nennt `_bewohnerWerkTakt` (abgelaufene Frist: EIN Stück; an main 0 → ROT), T14 nennt `_grundrissWegeIn` (1 statt 3 Formen; an main 3 → ROT). gate:kreatur-takt bewohner GRÜN (Liste, Stadt, Wiederkehr).

Gemessen (gate:geh-zerlegung = Stadt als Zelle der Hänger-Zerlegung, je Hänger und je Domäne der Täter; WIP 65701c4d … 20c358b2, Regler voll, Tiere frei, Bahn 4 s):
- Radeon vorher 0c20d3cf → nachher 20c358b2 (Bild p50/p95/max, Anteil > 33 ms): Wiese 33,5/50/75,3 (63 %) → 25,1/41,9/67,1 (35 %) · Stadt Gang 1 50,2/100,5/384,8 (99 %) → 58,7/150,7/209,3 (98 %) · Stadt Gang 2 41,8/66,9/75,5 (91 %) → 41,7/67/117,2 (72 %). Bewohner in der Takt-Mitte 3,9/4,0 → 0,1/1,0 ms.
- GTX vorher 7c03cfe2 · 0dfa9e1c · fe4ef1b6 → nachher 1bfa8b3e · c54d0f18: Stadt Gang 1 p95 116,7/183,3/150 → 133,3/150,1 · Gang 2 p50/p95 58,4/100–125 → 50/91,7 und 58,3/108,3; Bewohner-Mitte 4,2–4,9 → 0,5/1,2 ms. Je ein Lauf je Seite und Gerät — die Welt baut im Gang anders (Dorf-Zug, Wald), die Spreizung ist groß.

Ehrlich offen: profiband.K1 stadt-ego-geht bleibt ROT — Bild-p95 der Stadt auf der Radeon 67–151 ms, ≤ 33 ms nicht erreicht. Die Täter beim Namen (Radeon/GTX, Takt-Mitte bzw. Spitze): Knoten-Bau im ersten Gang (3–8 Erst-Zeichnungen, 57–184 ms je Gang), Zeichnen 8–15 ms (~100 µs je `renderObject`, 50–75 Befehle — CPU, GPU nur 2–5 ms), `_passSicht` 10–13 ms (Instanz-Wahl, Satz-Pass, `_hoehlenSicht`; w24 schneidet dort), der Planer 8–13 ms (Saat `_vegetationSampleSpawn` 2–3 ms je Takt, der Dorf-Zug im Gang). gate:geh-zerlegung fällt zur Abgabe wieder (sie war nie in main: w23 nahm sie zur Abgabe heraus; mit Domänen-Tafel und Selbsttest kostete sie +1 948 Atome, die die Decke ohne Zahlung nicht trägt) — die Zerlegung je Domäne braucht einen Platz unter der Decke.

Die Besten als Maßstab: (1) EIN Frame-Budget für alle Hintergrund-Jobs (Job-System mit Frame-Deadline, wie Naughty Dogs Fiber-Jobs / Unreals Task-Graph; die Alterung ist Deficit Round Robin), (2) Broad-Phase vor Narrow-Phase (Hüllen-Test vor dem Einzel-Test, wie AABB-Broadphase jeder Physik-Engine).

FUNDe:
- FUND: scripts/werkbank.cjs:279 · Wurzel: `lauf --regler voll` schreibt `perfTargetMs = 1000`, und dieselbe Größe ist die Frist des Takt-Planers (`_deferrableBudgetMs` stamm/dirigent-takt.js:1695) und die Schwelle von `_frameOverBudget` — unter „voll" fallen die Drosseln des Takts (Dorf-Zug je Drossel-Takt, Cull-Bau, Karten), die kein Spieler abschalten kann (Ziel-FPS 30–60, speicher-laden.js:509) · Kriterium: die Frist des Planers liest die Bildzeit des Spielers, der Regler nur die Qualität · M.
- FUND: stamm/siedlung-bewohner.js:726 `_bewohnerHuellenDa` · Wurzel: `_weltOffen().leute` zählt eine Siedlung erst, wenn ihr Werk läuft — nach dem Umstellen auf stadt meldet die Welt „steht", während die Liste der Stadt (424 Köpfe) noch nicht begann (Akte 25ff17c8: `d:7@663,422: -`), sie beginnt im Gang · Kriterium: eine Siedlung im Nah-Ring ohne Liste ist offen · S (ändert das Bild der Stadt-Probe: dann mit Leuten).
- FUND: stamm/siedlung-bewohner.js:772 `_bewohnerGeburt` · Wurzel: jede Geburt baut den vollen Mensch-Leib (Rig, Stufen), auch drinnen und außer Sicht; GTX 23 ms je Geburt, 2 je Takt (Gang 2: 12–19 Geburten) · Kriterium: wer nicht gezeichnet wird, trägt keinen Leib · L (die Bewohner-Linsen zählen heute jeden Leib).
- FUND: gelaende-core.js:2160 `erdbauY` · Wurzel: je Höhen-Frage jeder Splat der 16-m-Zelle, zweimal — in der Stadt Hunderte; 1 030 von 2 200 ms der Bewohner-Liste (Null-Renderer), dazu jede Bodenfrage der Stadt (`_horizontSichtImBild` 1,3–1,8 ms je Takt, `_stepCharacter`) · Kriterium: Kosten je Frage unabhängig von der Splat-Dichte · M (Kern, Byte-Beweis).
- FUND: stamm/siedlung-ort.js:2224 `_tickAutoSettlement` und stamm/siedlung-wege.js:665 `_wegeStufeMalen` · ein neues Dorf im Gang 35,6 + 28,1 ms in EINEM Takt (GTX c54d0f18) · Kriterium: frame-adaptiv · M.

Am Kopf GRÜN (lokal): npm run check, playtest:fast 21/0, gate:takt + Selbsttest, gate:kreatur-takt (bewohner), gate:settlement, gate:post-kette, gate:ego-schatten (kein echter [ERROR] STOFF), gate:welt-boot, lint, format:check (Stamm), gate:betriebsgesetz (scripts −2 Atome).

## 08.11. 22:25 — GPU-PROBE 20c358b2 auf radeon-890m: ROT in 1094 s (gate:geh-zerlegung ROT 146 s) → probe-post/w25-stadt-takt/20c358b2.md

## 08.11. 22:05 — GPU-PROBE 0c20d3cf auf radeon-890m: ROT in 540 s (gate:geh-zerlegung ROT 145 s) → probe-post/w25-stadt-takt/0c20d3cf.md

## 08.11. 21:53 — GPU-PROBE 4b71246b auf omen-gtx1060: NACHGEGEBEN in 230 s (gate:geh-zerlegung NACHGEGEBEN 3 s) → probe-post/w25-stadt-takt/4b71246b.md

## 08.11. 21:50 — GPU-PROBE c54d0f18 auf omen-gtx1060: ROT in 197 s (gate:geh-zerlegung ROT 161 s) → probe-post/w25-stadt-takt/c54d0f18.md

## 08.11. 21:43 — GPU-PROBE 1bfa8b3e auf omen-gtx1060: ROT in 201 s (gate:geh-zerlegung ROT 165 s) → probe-post/w25-stadt-takt/1bfa8b3e.md

## 08.11. 21:23 — GPU-PROBE 25ff17c8 auf radeon-890m: ROT in 299 s (gate:geh-zerlegung ROT 165 s) → probe-post/w25-stadt-takt/25ff17c8.md

## 08.11. 21:15 — GPU-PROBE fe4ef1b6 auf omen-gtx1060: ROT in 198 s (gate:geh-zerlegung ROT 164 s) → probe-post/w25-stadt-takt/fe4ef1b6.md

## 08.11. 20:57 — GPU-PROBE 0dfa9e1c auf omen-gtx1060: ROT in 207 s (gate:geh-zerlegung ROT 173 s) → probe-post/w25-stadt-takt/0dfa9e1c.md

## 08.11. 20:49 — GPU-PROBE 7c03cfe2 auf omen-gtx1060: ROT in 381 s (gate:geh-zerlegung ROT 162 s) → probe-post/w25-stadt-takt/7c03cfe2.md

## 08.11. 20:41 — GPU-PROBE 65701c4d auf radeon-890m: ROT in 360 s (gate:geh-zerlegung ROT 168 s) → probe-post/w25-stadt-takt/65701c4d.md

## 22:44 Koordinator
ABGABE d9546d27 angenommen: Bewohner in der Takt-Mitte 3,9 → 0,1–1,0 ms (Radeon), Stadt Gang 2 > 33 ms 91 → 72 %. Der Zweig fährt in **z330**, konfliktfrei mit allen Wartenden.
**Nächster Auftrag im selben Faden (`w25-stadt-takt-2` vom Kopf d9546d27):** Stadt Gang 1 p95 100–151 ms. Benenne zuerst je Bild den Täter (Knoten-Bau, Zeichnen, Sicht+Satz).
- Der Knoten-Bau gehört `w25-pipeline-vorwaermen` (Atlas §3). Den nennst du nur mit Zahl.
- Die Sicht gehört `w25-gpu-wahl` (Atlas §2). Auch die nennst du nur.
- Dein Teil ist der **Satz** der Stadt (siedlung-*), unter der EINEN Frist der Bau-Arbeit. Kosten an Schirm und Änderung, nie an der Stadtgröße.
- Richter: gate:geh-zerlegung, Stadt Gang 1 und 2, auf Radeon und GTX über den Probe-Dienst. Dazu Bild `[gpu-probe: bild:stadt@0.5]`.

## 00:58 Koordinator
ABGABE 3fa08926 (stadt-takt-2) ist angenommen und fährt in **z333**, sauber auf main. Der Satz ist als Täter eines Bilds > 33 ms aus dem Spiel (1× → 0×), _tickBauSatz p95 8,2 → 3,6–4,3 ms. Ehrlich: Die Stadt bleibt bei p95 125–158 ms und > 33 ms in 98 %.
**Nächster Auftrag:** Benenne für Stadt Gang 1 je Bild > 33 ms den Täter mit Anteil in ms (gate:geh-zerlegung, GTX und Radeon). Nimm dir das nächstgrößte Stück, das in der Stadt-Domäne liegt (siedlung-*, Bewohner, Verkehr). Sicht (w25-gpu-wahl) und Pipeline-Bau (w25-pipeline-vorwaermen) nennst du nur mit Zahl. Schreib die Zerlegung als Tabelle in deine nächste Abgabe; sie ist der Plan für profiband.K2 in der Stadt.

## 09.11. 05:43 — w25-stadt-takt-3 (Cloud-Sitzung): Zwischenstand, keine Abgabe — die Stadt ist seit z331 auf der GTX nicht messbar

Befund (gate:geh-zerlegung mit einer Wache im Umstellen, Zweig `w25-stadt-takt-3`): am Messort stadt endet `/umstellen` an main ≥ z331 nie — 24acc5f3 und e7cf5b14 (Stand z331) sowie db8635ef (main V18.546.232) liefen in den Deckel der Probe (480 s), ebenso w25-gpu-wahl 3fcecab7 (geh-zerlegung) und w25-haar-albedo 23145b6e (`bild:stadt-voll`, 509 s). Die Wache (b464baaf, db8635ef) sah nach 200 s und 400 s dieselbe eingefrorene Welt: Ring 0, offen `wald 665 · horizont 27 · leib 1`, Ruhe 0, „Weltbild fehlt: der Horizont wächst (0 %), das Licht des Orts wird gemessen …“, Lade-Takt — kein Takt lief mehr.

Wurzel: heim2-w13-verkehr-heil (z331) zog die Gründung der Stadt von ±1 m auf ±1 mm an (`scripts/werkbank.cjs:1087`, Anker in `spec/profiband/haushalt.json` 662,7199…/422,3098…). Die Schleife der Gründung schläft ohne Takt (`await sleep(250)`), ihr Deckel (`__deckel`) zählte nur Gänge ohne Offenes — bei offener Welt (wald 665) warf er erst nach 3 600 stillen Gängen = 900 s. Mit einem Deckel, der jeden Gang zählt (30 s), kam das Umstellen in 21ec477b nach rund 30 s zurück (die Probe endete nach 100 s samt Boot) — die Gründung stand also nicht binnen ±1 mm am Anker; den Wurf selbst verschluckte meine Wache (geheilt in 048c472e). Die Lage der gegründeten Zelle nennt die laufende Probe 048c472e (sie gab zweimal dem echt-Job nach).

FUND: scripts/werkbank.cjs:1087–1090 · ±1 mm-Anker und ein Deckel, der eine Schleife ohne Takt nie zählt · jede Probe am Messort stadt/stadt-voll schweigt bis 480 s · S (der Deckel ist in w25-stadt-takt-3 geheilt; ob die Ort-Wahl je Gerät um mehr als 1 mm wandert oder die Gründung ausbleibt, nennt 048c472e).

## 09.11. 08:07 — w25-stadt-takt-3 (Cloud-Sitzung): Abgabe 12de223b

ABGABE 12de223b8ca0c0cefa2cbd235ec17d411c29a2b9

Geschnitten: (1) DIE WACHE DER BEWOHNER UNTER DER EINEN FRIST — `stamm/siedlung-bewohner.js:1398 _bewohnerWacheTakt`: wechselt eine Hülle im Rechteck der Wege, prüft ein Werk der Siedlung die getroffenen Stände und danach die Wege (`_bewohnerWerkTakt`, mindestens ein Stück je Takt), die Leute leben dabei weiter (`S.lebt`). Bis hier prüfte `_tickBewohner` die Stände ganz in EINEM Takt — reichte das Buch der Wache (256 Wechsel) beim Ankommen der Stadt nicht zurück, alle 3 280. (2) Die Fahrbahn-Probe des Stands (heim2-w13-verkehr-heil) kostet je Suchpunkt nur noch, was sie braucht: nach Raum und Grundriss (`:2848`), mit Ende am ersten Meter (`_verkehrFahrbahnM(…, genug)`, `siedlung-verkehr.js:459`, `:3004`). (3) DIE STADT DES MESSORTS AM ANKER — `scripts/werkbank.cjs:1095` gründet sie mit `spawnSettlement` am Anker der Spec (wie der Richter des Verkehrs, `fahr-proben verkehr`), `:1100` der Deckel der Gründung zählt jeden Gang und nennt die Zellen. Linsen: gate:takt T12 nennt `_bewohnerWacheTakt` (Takt der Leute 0 Stücke, der Job abgelaufen 1; an main 0 → ROT, Selbsttest 99 → ROT); die Bewohner-Linse geht den EINEN Takt der Leute (`kreatur-proben.cjs:2369`, das Werk und dann die Leute).

Gemessen (gate:geh-zerlegung, GTX omen-gtx1060, Vorher 6bb99af1 → Nachher 887caab6 | 2b0216a4, Bild p50/p95/max, Anteil > 33 ms):
- Stadt Gang 1: 408/2 767/2 767 ms, 6 Bilder in 4 s (EIN Takt 2 546 ms: `_tickBewohner › _bewohnerStandPruefen` 2 540, darin `_bewohnerWand` 1 566, `_bewohnerAuswegGang` 752) → 100/242/408 (35 Bilder, 97 %) | 100/283/475 (34 Bilder, 97 %).
- Stadt Gang 2: 83/225/325 (98 %) → 50/125/267 (98 %) | 58/125/167 (98 %); Bewohner p95/Mitte 125,2/4,3 → 8,7/4,6 | 7,1/5,1 ms.
- Wiese: 42/84/150 (94 %) → 33/67/100 (75 %) | 42/92/133 (80 %).
- Null-Renderer, volle Prüfung der Stände der Stadt (3 280): 3,35 → 2,14 s, `_verkehrAufSpur` 8 380 348 → 252 404, `_verkehrFahrbahnM` 250 146 → 32 300; die Stände byte-gleich (1 196, 264 gerückt, Hash 216012355).
- Die Stadt messbar: an main ≥ z331 stand jede Probe am Messort stadt bis 480 s still (die Gründung ±1 mm: die GTX setzte „dorf 7 120“ bei 662,7171/422,3055 statt 662,7200/422,3099, 048c472e — `_siedlungsAnker` misst ohne Ort durch den Bildwinkel des Fensters); am Anker der Spec umgestellt in 18 s (Wiese) bzw. im Lauf.

DIE ZERLEGUNG DER STADT, Gang 1 (GTX 2b0216a4, 33 von 34 Bildern > 33 ms; je Bild Takt und Neben-Last je Domäne aus den Stichproben, GPU-Warten und GC aus den Klassen des Fensters; Täter = die Bilder, deren größter Teil die Domäne ist) — der Plan für profiband.K2 in der Stadt:

| Domäne | Täter (Bilder) | Σ Anteil ms | Ø ms je Bild > 33 | was darin, beim Namen | wem |
|---|---|---|---|---|---|
| Zeichnen | 18 | 787 | 23,8 | `renderer._renderScene` 124 p95 / 41 Mitte; 220 Befehle (haupt 76, k1 34, k0 25) | Atlas §2 (w25-gpu-wahl) |
| Bewohner | 2 | 557 | 16,9 | das schwerste Bild 475 ms: `_animateHuman › _tuchTakt › _tuchZustandAn › _tuchGitter` 145 ms; die Wache als Werk 2,3 ms Mitte | Stadt (Tuch: Körper, FUND) |
| Streaming | 4 | 472 | 14,3 | `_loopVoxelStreaming` 42 p95 / 21 Mitte | Planer, Strom |
| Sicht | 1 | 452 | 13,7 | im Satz-Pass `_hoehlenSicht` 4,3 / `_chunkSatzAbschnitt` 3,1 p95 | Atlas §2 (w25-gpu-wahl) |
| Knoten-Bau | 6 | 404 | 12,2 | kalt 62 Bauten, 315 ms | Atlas §3 (w25-pipeline-vorwaermen) |
| Satz | 1 | 365 | 11,1 | `_tickBauSatz` 3,3 / 2,2 (unter der Frist seit z333) | Stadt |
| Bau | 1 | 351 | 10,6 | `tickArchitectureCulling` › `_rebuildArchitectureMesh` › `_archInstanceAdd` 6,9 | Stadt (FUND: Bauten-Zahl statt Frist) |
| Rest | 0 | 257 | 7,8 | ohne Domäne (Tages-Uhr, Sinn, Programm) | — |
| Verkehr | 0 | 161 | 4,9 | `_verkehrSchritt` 1,0 / 2,6; Gang 2 ein Bild 167 ms mit Verkehr 93 | Stadt (Pflicht C) |
| Leib | 0 | 106 | 3,2 | | Körper |
| Tiere · GC · Schatten · GPU | 0 | 50 · 41 · 4 · 1 | | | |

Σ 4 008 ms über 33 Bilder (Ø 121 ms je Bild). Gang 2 (2b0216a4, 61 von 62): Zeichnen 39× Σ 793 · Sicht 6× 567 · Streaming 2× 447 · Bewohner 5× 397 · Satz 331 · Knoten-Bau 7× 315 · Verkehr 1× 313 · Rest 306 · Bau 1× 281 · Leib 89 · Tiere 86 · GC 40.

Die Besten: Lehre 14 wie Unreals Async-Laden mit Zeit-Scheibe (`s.AsyncLoadingTimeLimit`) — die Antwort auf einen Wechsel der Welt geht in Raten unter EINEM Budget je Frame; der Messort wie der Replay einer Engine an festen Eingaben (ein fester Ort statt des Fensters).

Ehrlich offen: Stadt Gang 1 bleibt bei 97 % > 33 ms — Zeichnen, Sicht und Knoten-Bau tragen 1 643 von 4 008 ms und gehören den Nachbarn; das nächste Stück der Stadt ist das Tuch eines Leibs (145 ms in einem Takt), dann der Bau-Gang. Die Radeon ist ungemessen: jede Probe lief auf omen-gtx1060 (sieben gaben dem echt-Job nach). gate:geh-zerlegung lebt im WIP-Kopf 2b0216a4 (im Kopf kostete sie die Decke).

FUND: stamm/koerper-fahrt.js:347 `_tuchGitter` (aus :299 `_tuchZustandAn`) · das Tuch eines Leibs baut sein Gitter am ersten Takt seiner Animation, 145 ms in EINEM Takt (GTX 2b0216a4) · Kosten in Raten oder in der Vorlage der Gestalt · M
FUND: gelaende-core.js:2160 `erdbauY` · je Stand fragt `_bewohnerAnschluss` → `_bewohnerWand` den Boden der Linie; `erdbauY` 1,21 s selbst in zwei vollen Prüfungen (Null-Renderer) · Kosten je Frage unabhängig von der Splat-Dichte · M (Kern)
FUND: stamm/siedlung-bewohner.js:2782 `_bewohnerAnschluss` · meldet je Kandidat einer Suche einen Bruch („erreicht keinen Weg frei“), 0,33 s Log in zwei vollen Prüfungen · nur der Ort eines Stands ist ein Bruch · S
FUND: stamm/vegetation-baum.js:2641 `tickArchitectureCulling` · der Bau-Gang zählt Bauten, nie die EINE Frist · Bau Σ 351 ms in Gang 1 · M

Am Kopf GRÜN (lokal): npm run check, playtest:fast 21/0, gate:takt samt Selbsttest, gate:kreatur-takt (drei Teile, darin bewohner und begegnung), gate:welt-boot, gate:betriebsgesetz (scripts −20 Atome); am WIP-Stand gate:settlement, gate:fahr-leben (samt --verkehr), gate:stand-takt.

## 08:15 Koordinator
ABGABE 12de223b (stadt-takt-3) ist angenommen und fährt als **z342** zusammen mit ferne-licht-6. Die Wache der Bewohner läuft jetzt unter der EINEN Frist, und die Stadt ist auf der GTX wieder messbar. Weiter mit deiner Zerlegung von Stadt Gang 1 als Tabelle (Täter je Bild > 33 ms in ms).

## 09.11. 08:56 — w25-stadt-takt-4 (Cloud-Sitzung): Abgabe 397a8950

ABGABE 397a89501a138b289a3d4693f58958e15a48e37c

Geschnitten: DER BAU-GANG UNTER DER EINEN FRIST — `stamm/vegetation-baum.js:2855 tickArchitectureCulling` fragt `_bauFrist("bau")` (unter dem Ladeschirm die Frist des Lade-Frames): der erste Bau-Ruf geht, jeder weitere bis zur Frist (`:2886`), über Budget die Takt-Garantie (ein Bau je 250 ms) — statt 1–6 gezählter Bauten je Takt neben der Frist; der Zähler-Hebel des Reglers fällt (`architectureBuildBudgetPerFrame`, `ARCH_QUALITY_BUDGET_MIN/MAX`). Linsen: gate:takt T12 nennt `tickArchitectureCulling` (abgelaufen 1 Bau; an der alten Schleife 3 → ROT, Selbsttest 12 → ROT), T9 prüft ihn an der Frist des Lade-Frames (Selbsttest 1 → ROT). Decke: acht Selbsttest-Sätze wandern in Kommentare (scripts −14 Atome).

Gemessen (gate:geh-zerlegung, GTX, ABAB am selben Kopf, Vorher 7d70d425 → Nachher e542c81f):
- `tickArchitectureCulling` Stadt Gang 1 p95/Mitte 24,4/9,2 → 14,7/4,5 ms; Domäne Bau 32,0/12,2 → 17,8/6,7; Bau als Täter 1× (Σ 332) → 0× (Σ 313).
- Bild p50/p95/max: Stadt Gang 1 158/292/567 (96 %) → 108/200/442 (97 %); Gang 2 83/125/158 (98 %) → 50/92/158 (99 %); Wiese 42/75/100 (88 %) → 33/67/92 (69 %) — die Knoten-Bauten der zwei Läufe streuen (178 / 88).

DIE ZERLEGUNG, Stadt Gang 1 nach dem Schnitt (GTX e542c81f, 31 von 32 Bildern > 33 ms, Σ Anteil ms):

| Domäne | Täter (Bilder) | Σ Anteil ms | was darin | wem |
|---|---|---|---|---|
| Zeichnen | 7 | 678 | `renderer._renderScene` 37 p95 / 51 Mitte | Atlas §2 (w25-gpu-wahl) |
| Bewohner | 2 | 534 | das schwerste Bild 442 ms: `_tuchGitter` 294 ms (das Gitter einer Tracht beim ersten Leib) | Körper (FUND) |
| Streaming | 7 | 502 | `_loopVoxelStreaming` 31,5 / 23 | Planer, Strom |
| Knoten-Bau | 8 | 478 | kalt 88 Bauten, 356 ms | Atlas §3 (w25-pipeline-vorwaermen) |
| Sicht | 6 | 475 | Satz-Pass `_hoehlenSicht` 2,0 / 5,0 | Atlas §2 |
| Satz | 1 | 353 | | Stadt |
| Bau | 0 | 313 | `tickArchitectureCulling` 14,7 / 4,5 (vorher 24,4 / 9,2) | Stadt (dieser Schnitt) |
| Rest · Verkehr · Leib · Tiere · GC | 0 | 249 · 216 · 102 · 56 · 41 | | |

Die Besten: Lehre 14 wie Unreals Zeit-Scheibe für Streaming-Arbeit (`s.AsyncLoadingTimeLimit`) — Bauen nach der Frist statt nach Stückzahl.

Ehrlich offen: Stadt Gang 1 bleibt bei 97 % > 33 ms; das schwerste Bild trägt das Tuch einer Tracht allein (294 ms in EINEM Takt) — der nächste Schnitt (Kern, Körper); ein einzelner Bau bleibt ein Stück (`_trittFlaecheSetzen` › `_nahWieseNeuIn` 3,6 ms p95); die Radeon ist ungemessen (jede Probe lief auf omen-gtx1060).

FUND: stamm/koerper-fahrt.js:347 `_tuchGitter` (aus :299 `_tuchZustandAn`, koerper-core.js:6058 `tuchGitter`) · das Gitter einer Tracht baut beim ersten Leib dieser Tracht in dessen erstem Takt, 137–294 ms (GTX 7d70d425, e542c81f) · in der Vorlage der Gestalt oder in Raten, der Leib trägt bis dahin sein Tuch in Ruhe · M (Kern)
FUND: stamm/siedlung-wege.js:1115 `_trittFlaecheSetzen` › :1185 `_nahWieseNeuIn` (aus siedlung-instanz.js:804 `_archInstanceAdd`) · jeder Bau legt die Kachel der Nah-Wiese unter seinem Grundriss neu, 2,5–3,6 ms je Bau · Kosten an der Kachel, die der Grundriss trifft · S

Am Kopf GRÜN (lokal, Baum d28d517e = 397a8950): npm run check, playtest:fast 21/0, gate:takt samt Selbsttest, gate:post-kette und gate:ego-schatten (swiftshader, kein „[ERROR] STOFF“ außer der Injektion des Selbsttests), gate:arch-feld, gate:stand-takt, gate:welt-boot, gate:kreatur-takt (drei Teile), gate:betriebsgesetz.

## 09:00 Koordinator
ABGABE 397a8950 (stadt-takt-4) ist angenommen. Sie kollidiert mit z342 (dein stadt-takt-3 + ferne-licht-6) in `scripts/werkbank.cjs`. Sobald z342 landet (main ≠ c27efe46), mische main ein und schreib `BEREIT <sha>`. Dann fährt der Zweig im nächsten Zug. Landet z342 rot, sage ich dir Bescheid.
