# B-Blick — Befund (Finder, nur gelesen; Baum n1910-integ 80258f0e, V18.546.23)
[G] = gelesen (Datei:Zeile im Baum / Rohdaten-Pfad) · [V] = vermutet. Rohdaten relativ zu p3/n1910/.

## Kern in 5 Sätzen
- [G] Das Tor fragt den Blick nur je REGION. Eine Streu-Region (256 m, Radius 181 m) liegt für die 4 Regionen um den Spieler immer „im Blick“; ihre Lücke ist ein Bit `_deferredFoundry`, das JEDE aufschiebende Zelle rundum setzt, bis outerM 384 m.
- [G] Die EINE Sammelstelle `_streuWartetAuf` (studio-gestalt.js:45) nimmt jede Zusage ohne den Ort ihres Lesers, und der Wecker wartet auf ALLE (vegetation-streu.js:561-576). Der Rang fragt dagegen je Auftrag `_rangImErstenBlick(_foundryAuftragD2(wo))` (studio-bruecke.js:1039).
- [G] Die Karten weide|1 · karst|1 · eiche|3 sind in allen B-Läufen IM Blick („11“), nur buche|1/|2 ist in B2–B4 und K2 außer Blick („01“). Sie gehören also mit Recht zum Bild; sie kommen spät, weil die Streu-Kette sie spät entdeckt.
- [V] Das Prädikat allein spart nur ~0,1–0,35 s (bwald/wecker.txt:41-57: die letzte Zusage außer Blick 15,42–15,99 gegen die letzte im Blick 15,22–15,89). Das Ziel < 14 s fällt damit NICHT.
- [V] Der größere Term ist die Streu-Kette: Der Streu-Takt fällt 2–3 s aus, weil der Lade-Takt sein Budget vorher im Strom rundum verbraucht (F5). Das ist dieselbe Wurzel, liegt aber außerhalb des Datei-Besitzes.

## F1 Das Weltbild-Tor und seine Sammelstellen
- [G] Kontrolle: `_ankunftsBild` dirigent-ankunft.js:804-840 (je Bild aus dirigent-takt.js:1513; Ruhe und Deckel 820-836). Der EINE Schreiber `_weltbildSteht` 844-857 setzt `state._weltbildDa`, ruft `_ersterBlickAus` 958 und `_ladeschirmWeg` 1151.
- [G] diag-boot-stage: t(Weltbild) = `state._weltbildDa` ab Navigation (scripts/diag-boot-stage.cjs:9-10, 145-148, 196, 274-277). Je 200 ms liest es `_weltbildFehlt()` (97). Halbes Weltbild heißt die Log-Zeile „Das erste Weltbild steht ohne“ (200, 275).
- [G] Terme in `_weltbildLuecken` dirigent-ankunft.js:980-1114: boden 991 · horizont 1002 · leib 1017 · buch 1020 · bauten 1029-1037 (je Eintrag `imBlick`, 1028) · dorf 1042 · pflanzung 1059-1097 (Chunk im Blick) · karten 1105-1112 (`_rangImErstenBlick(z._bedarfD2)`).
- [G] Der Term streu 1098-1102 fragt den Blick nur je REGION (Mitte, r = regionM·√½ = 181 m). Bei d ≤ nah + 181 m gilt sie immer als im Blick (939).
- [G] Darunter: `_streuWartet` vegetation-streu.js:1447-1467 → `_streuRegionWartet` 1472-1479. Es antwortet nur „fehlt“, `_deferredFoundry` oder `_cont` und kennt weder Zelle noch Blick.
- [G] Sammler: `_scatterRegionWork` 544-555 setzt `_streuSammler = region._zusagen` (Set) für die Scheibe. Aufschub-Stellen sind 735 (Sichthöhe null), 854 (Gestalt null) und 927 (Asset fehlt). `_streuWeckerSpannen` 561-576 weckt erst bei `offen` = 0, danach baut der Refill 1536-1545 neu.
- [G] Erzeuger (alle über `_streuWartetAuf`, keiner gibt einen Ort mit): Zug hängt an studio-bruecke.js:790 · neuer Zug 809 · Karte `z.ende` 1691 · Buch studio-gestalt.js:581 · Wald-Plan vegetation-baum.js:914 → `_waldPlanZusage` vegetation-wiese.js:1689-1703.
- [G] Die Wecker hielten 20/11/8/4 Zusagen (kette/roh/K2-kette.txt:20, 43, 62, 75), in b-wald 468/305/75/25, meist waldplan# (bwald/roh/BX1-kette.txt:19, 40, 55, 68).

## F2 Der Rang und das Blick-Prädikat
- [G] Rang: Datensatz `_foundryRang` studio-bruecke.js:772-774; `_foundryNaeher` 1087-1089 hebt ihn auf den nächsten Leser.
- [G] `_foundryAuftragD2` 998-1010 = d² + `_blickRang`; eine Zahl trägt den Blick-Schlüssel, ohne Ort gilt ∞.
- [G] `_foundryWahl` 831-846 wählt nah zuerst, mit Hunger-Wechsel (FOUNDRY_ALTER_MS 6000, 3176). In der Pumpe (`darf` 1035-1039) geht ein Auftrag außer Blick vor dem Bild nur in eine LEERE Bahn.
- [G] Blick: `_ersterBlick` dirigent-ankunft.js:890-930 ist ein waagrechter Kegel vom Auge der Stufen (`_lodAuge`): yaw, Bildwinkel fov×aspect + 15°, dazu die Kugel |p−Auge| + 6 m. Kein Pitch, keine Verdeckung.
- [G] Dazu `_imErstenBlick` 932-942 und `_blickRang` 945-949 (dingM 12, ausserD2 1e12, 1356). `_rangImErstenBlick` 953-955 ist nach dem Bild immer wahr.
- [G] Die Stufe wählt nicht der Rang, sondern der Leser. Vor dem Bild gilt `_ankunftsFerne` 875-882 (Baum = Karte, Bau = Grobstufe).
- [G] Die Streu-Zelle wählt nach der Sichthöhe (vegetation-streu.js:732-739). Die Karte braucht dieselbe L1 als Quelle und Höhe (stoff-instanz.js:605-613, studio-bruecke.js:1698).
- [G] Ein teilbares Prädikat gibt es schon: `_rangImErstenBlick(_foundryAuftragD2(rang.wo))` in der Pumpe (1039). In Zahl-Form lesen es der Karten-Term (1108) und der Karten-Takt (stoff-instanz.js:438-442).

## F3 Warum die Region auf Dinge außer Blick wartet
- [G] Sichthöhe `zug:buche|1|1`: Zelle tf (vegetation-streu.js:681) → `_scatterSichtHoehe` 732/815 → `_foundryBaumHoehe` 1739/1748 → `_foundryFlattenFor` (studio-gestalt.js:812, wo = tf) → `_foundryZug` → 809 `_streuWartetAuf(zug)`. Die Zelle schiebt die Region auf (735).
- [G] Beleg: K2-kette.txt:89-90, 99-100 „Zug neu 11.10 (d 66/68 m, außer, Streu-Sammler 1)“, gesendet erst 14,41/14,59.
- [G] Gesetz-Fit `zug:blume|*|0`: Zelle jenseits ANALOG_NAH_M 64 m (kreatur-leben.js:1962) → Fernbahn „gesetz“ (vegetation-streu.js:868-887) → dienst.js:706-714/696-697 → L0 (studio-gestalt.js:771-777) → `_foundryZug` → 809.
- [G] Diese Zelle schiebt NICHT auf (`wartet: true`, vegetation-streu.js:898, der LOD-Tick wiederholt). Ihr Zug verlängert nur den Wecker einer aus anderem Grund aufgeschobenen Region (K2-kette.txt:94-95: d 329 m, außer; BX1-kette.txt:82-89: gesendet 15,12).
- [G] Karten: vegetation-streu.js:909/918 → studio-gestalt.js:796 → Stempel `_bedarfD2` (studio-bruecke.js:1681-1684) → 1691 `_streuWartetAuf(z.ende)`.
- [G] „buche erst nach dem Neubau“: Die Zelle schiebt auf die Sichthöhe auf (735), BEVOR sie eine Stufe wählt; die Karte entsteht erst beim Neubau. Das ergibt einen zweiten Wecker und zweiten Abriss (K2-kette.txt:21-27, 14,93 → 15,11; bwald/wecker.txt:6-8, 41-42, 55-57).
- [G] Im-Blick-Flags der späten Bakes: weide|1, karst|1, eiche|3 „11“ in B1–B4/BX1; buche „01“ in B2–B4 (bwald/roh/B*-kette.txt „Karten-Bakes“, K2-kette.txt:194).

## F4 Der EINE Chokepoint (Vorschlag)
- Ort: der Region-Sammler, also `_streuWartetAuf` (studio-gestalt.js:45) mit `_streuWeckerSpannen` und `_streuRegionWartet` (vegetation-streu.js:561, 1472).
- Leser-Ort: `_scatterPass` setzt je Zelle `this._streuZelleOrt = tf` (681). Die 5 Erzeuger brauchen keinen neuen Parameter.
- Sammler: `Map<Zusage, Rang>` mit `_foundryRang(ort)` und bei Wiederholung `_foundryNaeher` — derselbe Datensatz wie in der Pumpe.
- Prädikat: EINES in studio-bruecke.js, `_rangImBild(rang)` = `_rangImErstenBlick(_foundryAuftragD2(rang.wo))`. Die Pumpe `darf` (1039) und der Wecker rufen es.
- Wecker: Vor dem Bild weckt er, sobald keine Bild-Zusage mehr offen ist; der Neubau füllt die Zellen im Blick. Sonst wie heute bei `offen` = 0.
- Zusagen außer Blick hängen sich beim Neubau wieder an (die Züge stehen noch in `f.zuege`, 790) und bilden einen zweiten Wecker.
- `_streuRegionWartet` meldet „wartet“ nur, wenn eins davon gilt: geweckt mit ausstehendem Neubau · eine Bild-Zusage offen · eine Zelle im Blick schob ohne Zusage auf · kein Satz. Sonst steht die Region fürs Bild.
- Nach dem Bild: Jede Zusage zählt als „im Bild“, und der Nachlauf `_weltbildLuecken(true)` holt den Rest rundum (dirigent-ankunft.js:1121-1134).
- Danach strömt nach Rang: Die Pumpe gibt nach `_weltbildDa` rundum nah zuerst (1002, 1039). Die Karten verlieren ihren Blick-Schlüssel (958-962). Die Regionen baut der zweite Wecker neu, ohne Drossel im Nachlauf (dirigent-takt.js:1288).
- Darf NICHT fehlen (L2a): Zellen im Blick ohne benannte Zusage zählen weiter (Gesetz nicht wahr, 735/854); die Marke gilt nur der Bild-Frage, nie `offen`. Das Buch (581) zählt ohne Ort immer. „fehlt“ und `_cont` (1475, 1477) bleiben. Der L2a-Fall streuWartet (diag-ankunft.cjs:545, ohne Satz) bleibt rot-fähig.
- [V] Kosten: je Region höchstens ein Neubau mehr, in K2 ~0,02–0,2 s (K2-kette.txt:21-27, 44-50).
- [V] Mitschneiden (vegetation-streu.js): Neue Regionen werden in Raster-Reihe gewählt (1507-1523); 0,0 kam zuletzt (K2-kette.txt:72-73, neu 14,42). Das ist ein zweiter Rang → nach `_foundryAuftragD2` der Mitte. Die Zellen-Reihe bleibt byte-gebunden (486-488).

## F5 Der Streu-Takt-Aussetzer
- [G] K2-Ticks: 8,15 → 11,10 (kette/roh/K2-ticks.txt). Dazwischen liegen die Lade-Bilder 9,36 · 10,34 · 10,93 (K2-kette.txt:214), also 3 Frames ohne Tick.
- [G] BX1: 8,51 → 11,34, Frames 9,90 · 10,54 · 11,18 (bwald/roh/BX1.json:21579, BX1-kette.txt:212). Das ist die Regel `_schedFrameNo % 4` bei leerem Budget (dirigent-takt.js:1029-1033): prio 2 bekommt nur jeden 4. Frame 2,5 ms (1578).
- [G] Der Tick wird beim Eintritt gezählt (kette/kette-patch.cjs:291-296). Finish-first (vegetation-streu.js:1488-1500) und Karten/Wald sperren ihn NICHT; der Job lief gar nicht.
- [G] Das Budget im Lade-Takt ist 100 ms (dirigent-takt.js:1050, 1581). Prio 0 „stream“ ist unbegrenzt (1111-1117, 1036) und baut mit `_kappeOffen` bis zur EINEN Lade-Frist (1087-1104).
- [G] Gebaut wird der Ring rundum (gelaende-chunks.js:2582-2615) und `_tickFoliageGrowth` (2622 → 899-912): alle wartenden Chunks in Set-Reihe, ohne Blick, dazu das Bepflanzen beim Einbau (1387-1388).
- [V] Kandidat 1, der stärkste: Strom und Laub verbrauchen die Frist. Das letzte `_forestPlantChunk<_populateVoxelChunkVegetation` liegt in 5 von 6 Läufen 1 Frame vor dem Ende der Lücke: 10,43→11,10 · 10,67→11,34 · 10,57→11,02 · 9,59→10,93 · 8,83→9,17. B4 passt nicht (7,41 → 10,15). Belege: K2-kette.txt:178 und bwald/roh/B*-kette.txt „Wer die Wald-Schlange füllt“ mit den B*.json-Ticks.
- [V] Kandidat 2: `_tickWaldPlan` (prio 1, bekommt den Rest). Seine Pflanz-Warten-Schleife hat kein Budget (vegetation-wiese.js:1633-1639); BX1 Pflanz-Warten 5 bei 8,50 und 4 bei 10,56 (BX1-kette.txt:105-107).
- [V] Kandidat 3: LongTasks außerhalb des Dispatchers (Erst-Bau 236–432 ms/s, Bauten 109 ms, ~50 % ohne Namen; bwald/roh/BX1.log s 9–10). Sie strecken die Frames auf 0,6–1,0 s, sperren den Job aber nicht.
- Gleiche Wurzel: ja. Die Job-Reihe prio 0/1/2 ist ein zweiter Rang ohne die Bild-Frage: Strom rundum und Laub außer Blick gehen vor die Streu im Blick. Das widerspricht K60 „im Lade-Takt greift keine Drossel“ (dirigent-takt.js:1068-1075 gegen 1032).
- Besitz: dirigent-takt.js und gelaende-chunks.js (Grund) gehören NICHT zur Karte. Vor einem Schnitt den Koordinator fragen und zuerst messen.

## F6 Die Linse (gate:ankunft L2a)
- [G] Ort: scripts/diag-ankunft.cjs (L2a 6-10, 427-855) und package.json:132 (`--selftest && Lauf`). Das Fall-Gerät `fall()` 483-499 setzt `_weltbildDa = 0` und fragt `_ankunftsBild`.
- [G] Vorbild b-wald (12): Die Probe 834-847 baut echte Kästen und liest die Zusage `r._waldPlanZusage(o.x, o.z)` per `.then` in `m.wald`. Urteil 198-201; Selbsttest grün 1707, rot 1727-1728; Druckzeile 1960.
- Fall (13) „Bild-Zusagen“: Region des Spielers wie Fall 3 (541-545), `st._weltbildDa = 0`. zV hat den Leser `vorn(80)`, zH den Leser `vorn(-80)`. Beide gehen über den echten Weg ein (`_streuZelleOrt` setzen, `_streuWartetAuf`, `_deferredFoundry`, `_streuWeckerSpannen`).
- Wertung (13): zV lösen und ticken. ROT „das Weltbild wartete auf N Zusagen außer Blick (Region rx,rz: …)“, wenn danach mit nur zH offen `_geweckt` falsch bleibt oder `_streuRegionWartet` ≠ null ist. An 80258f0e ist das rot, denn das Ort-Argument wird ignoriert.
- Gegenproben: Nur zV offen und die Region steht → ROT „halbes Weltbild“. zH offen mit gesetztem `_weltbildDa` und die Region wartet nicht → ROT „der Rundblick vergisst“.
- Selbsttest: grün `blick: {ausser: 1, wartetVor: false, imBlickHaelt: true, nachBild: true}`. Rot `{wartetVor: true}` (80258f0e), `{imBlickHaelt: false}`, `{nachBild: false}` und ohne Probe (Vorbedingung). Laufzeit Sekunden, ≪ 3 min.

## Schnitt-Plan
1. studio-bruecke.js: `_rangImBild(rang)` als EIN Prädikat; die Pumpe `darf` 1039 ruft es (byte-gleich, gate:takt T5–T8).
2. studio-gestalt.js:45 `_streuWartetAuf`: Map Zusage → Rang des Lesers (`_streuZelleOrt`, `_foundryNaeher`); ohne Ort gilt Bild (Buch).
3. vegetation-streu.js 681: `_streuZelleOrt = tf`. 735/854/927: Zelle im Bild ohne Zusage → Marke. 544-555: der Sammler wird eine Map.
4. vegetation-streu.js 561-576: der Wecker weckt vor dem Bild, sobald 0 Bild-Zusagen offen sind; 1472-1479: `_streuRegionWartet` fragt `_rangImBild` und die Marke.
5. vegetation-streu.js 1507-1523: die neue Region nach dem Rang ihrer Mitte statt nach Raster-Reihe.
6. Linse: diag-ankunft.cjs Fall (13) mit Selbsttest. ROT an 80258f0e, GRÜN am Kopf. Dazu check, playtest:fast, gate:ankunft (alle L2a-Fälle, Rundblick 0 Löcher).
7. Messung: `diag-boot-stage --kalt --echt` GTX 4+4 (A 80258f0e, B Kopf) mit kette-patch, ergänzt um das Bild-Flag je Zusage. Ehrlich erwartet: −0,1…−0,35 s (1–2 %).
8. Bild: Blick vorn und Blick nach 180° 2 s nach der Kontrolle (buche bei 66 m und blume bei 329 m fehlen dort, benannt). Lauf-Zelle Genesis Third stehend 4+4.
9. F5 vor dem Schnitt messen: Instrument-Patch für diag-boot-stage.cjs:54-63 — KOSTEN += `_tickVoxelChunkStreaming` · `_tickFoliageGrowth` · `_tickWaldPlan` · `_tickScatterStreaming`, dazu `remainingMs` am Deko-Job.
10. Bestätigt sich Kandidat 1: Schnitt „die Lade-Frist nach Bild-Rang, Deko-Boden ohne %4 im Lade-Takt“ an den Koordinator (Besitz). Erst dieser Schnitt macht < 14 s realistisch.
