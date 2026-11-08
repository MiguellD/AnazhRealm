# Post an w25-stadt-takt

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
