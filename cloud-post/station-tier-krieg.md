# Stations-Kandidat tier#2 + krieg#1 — „die Station liest den Kern von rollen-des-tages“ (OMEN, 26.11.)

**Kopf:** punkte-maschine Zweig `pm-station-liest-rollen` = **db9b54e64645f2471ed19975f007adc36ef2cd6d** (Nachtrag 20:37, fast-forward) — davor a65555138b18a4a3a33f6f0cf1e7512d1c4d71a8 (geschoben 20:17, neuer Zweig, kein Force; der Lauf „nachher“ fuhr seinen Vorgänger 43aacf5f — einziger Unterschied: die Stelle vor der Wache, s. unten) (EIN Commit auf punkte-maschine a35231cd, nur
`meisterkarte-quelle/punkte/stationen/k2-mensch-nahrung.js` und `…/k2-mensch-macht.js`). Diff daneben: `station-tier-krieg.diff`.
**Spiel:** main 4a188bf2d08cd6263e74d21d40d3ec220e789e9d (V18.546.439), GTX 1060, Hand-Lauf `punkte.cjs run --sha 4a188bf2 --geraet gtx
--nur karte2.mensch.nahrung.tier#2,karte2.mensch.macht.krieg#1` zweimal im selben Slot: vorher = Stationen von a35231cd, nachher = Kopf.
Roh: daneben `station-tier-krieg-sk1.txt` (= OMEN p3/n2411/wechsel/sk-1.txt, Slot 19:54:38–20:13:28, 1130 s); die Mess-Dateien beider Läufe `station-tier-krieg-vorher.json`, `station-tier-krieg-nachher.json` — nichts gebucht.

## Urteile wörtlich

```
@@SK vorher Stationen von a35231cd (git 0) 19:54:39
  ROT  karte2.mensch.macht.krieg#1 · S1 ROT an Umfang 0 < 2 Bewaffnete im Zweikampf — Täter: stamm/siedlung-bewohner.js _bewohnerNahen — die Wache tritt mit der Waffe 1,5 m vor die Tat und hält: kein Hieb, keine Deckung, kein Gegenhieb; den Schwung führt nur der Spieler gegen Wesen (stamm/kampf.js _playerAttackCreature) · der Treffer sitzt, wo die Klinge den Leib kreuzt (Anteil von 20) — (Soll ≥ 1) · der Getroffene antwortet (Anteil) — (Soll ≥ 1) · Treffer durch die Deckung — (Soll ≤ 0) · Umfang 0 (Soll ≥ 2 Bewaffnete im Zweikampf) · 7 Bewaffnete (6 von 1356 Bewohnern mit Waffe {"langschwert":6} und der Spieler, die leere Hand), 0 im Zweikampf · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 0.18 min
  KARTE2 Akte mensch.macht.krieg.1.4a188bf2-gtx.json: Richter ROT · Preis GRÜN: p95 33.4 ms · max 49.92 ms · Heap 506.2 MB gehalten (Spitze 610.7) · VRAM 206.1 MB gehalten (Spitze 206.2) · 505 Bilder · Referenz f 1.115 · Einlauf 41.7 s (Lesewert): p95 41.61 ms, max 74.97 ms · der Lauf selbst p95 33.4 ms (882 Bilder)
  ROT  karte2.mensch.nahrung.tier#2 · S2 ROT: Umfang nicht erzeugbar: Bewohner, die jagen und fischen (8 Saaten): 0 Jäger je Saat, 0 Jagden je Tag; die Taten des Tags schlaf/morgen/arbeit/mittag/abend/besuch — koerper-core.js:5300 TAGES_GESETZ trägt keine Rolle, die jagt oder fischt · Fächer 192/192 Adressen (8 Saaten × 24 Zeiten) in 35769 ms · Leser stamm/siedlung-be (gemessen 0, Soll 1 jagende oder fischende Bewohner (je Saat, 8 Saaten)) · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 1.06 min
  KARTE2 Akte mensch.nahrung.tier.2.4a188bf2-gtx.json: Richter ROT · Preis GRÜN: p95 33.29 ms · max 34.34 ms · Heap 497.1 MB gehalten (Spitze 534.9) · VRAM 162 MB gehalten (Spitze 162) · 558 Bilder · Referenz f 1.294 · Einlauf 57.6 s (Lesewert): p95 33.42 ms, max 9241.64 ms · der Lauf selbst p95 33.37 ms (918 Bilder)
@@SK vorher EXIT=0 nach 549 s
@@SK nachher Stationen von HEAD (git 0) 20:03:48
  ROT  karte2.mensch.macht.krieg#1 · S1 ROT an Umfang 0 < 2 Bewaffnete im Zweikampf — Täter: die Station: keine freie Stelle 4 m vor einer der 3 Wachen draußen · der Treffer sitzt, wo die Klinge den Leib kreuzt (Anteil von 20) — (Soll ≥ 1) · der Getroffene antwortet (Anteil) — (Soll ≥ 1) · Treffer durch die Deckung — (Soll ≤ 0) · Umfang 0 (Soll ≥ 2 Bewaffnete im Zweikampf) · kein Zweikampf gestellt: keine freie Stelle 4 m vor einer der 3 Wachen draußen · 7 Bewaffnete (6 von 1356 Bewohnern mit Waffe {"langschwert":6}) · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 0.19 min
  KARTE2 Akte mensch.macht.krieg.1.4a188bf2-gtx.json: Richter ROT · Preis GRÜN: p95 33.39 ms · max 41.73 ms · Heap 513.7 MB gehalten (Spitze 575.1) · VRAM 207.2 MB gehalten (Spitze 207.2) · 512 Bilder · Referenz f 1.053 · Einlauf 41 s (Lesewert): p95 41.65 ms, max 74.92 ms · der Lauf selbst p95 33.39 ms (851 Bilder)
  ROT  karte2.mensch.nahrung.tier#2 · S2 ROT an Änderung des Wildbestands — verfehlt < 0 — Täter: stamm/siedlung-bewohner.js:2895 _bewohnerBeute — keine Beute in 6 Tagen · Jagden je Tag 4 (Soll ≥ 1) · Änderung des Wildbestands — (Soll < 0) · Umfang 4 (Soll ≥ 1 jagende oder fischende Bewohner (je Saat, 8 Saaten)) · 4 Jäger je Saat (kleinste der 8 Saaten), 4 Jagden je Tag; die Taten des Tags schlaf/morgen/jagd/arbeit/mittag/abend/besuch · 1 Jäger in Huvisnid über 6 geraffte Tage: 6 Jagden, 0 Beute, 2 leer, 4 ohne Antwort des Gaus · Bestand deer am Revier null → null · Fächer 192/192 Adressen (8 Saaten × 24 Zeit · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 1.08 min
  KARTE2 Akte mensch.nahrung.tier.2.4a188bf2-gtx.json: Richter ROT · Preis GRÜN: p95 25.05 ms · max 41.67 ms · Heap 413.5 MB gehalten (Spitze 452.1) · VRAM 150.8 MB gehalten (Spitze 150.8) · 518 Bilder · Referenz f 1.542 · Einlauf 78.5 s (Lesewert): p95 33.32 ms, max 9458.23 ms · der Lauf selbst p95 25.04 ms (928 Bilder)
@@SK nachher EXIT=0 nach 579 s
@@SK ENDE · Baum sauber
```

## Was der Schnitt tut

**tier#2 (NAHRUNG)**
- `JAGD_AN` (Fächer, 8 Saaten × 24 Stunden): die Jäger wählt die Station wie der Wirt (`_bewohnerListe` DER JÄGER UND DER FISCHER,
  stamm/siedlung-bewohner.js:1373) — je Rolle mit Tat und Ort des Werks (`TAGES_GESETZ.rollen.jaeger` kc:5482, `werkAm` revier)
  `KC.tagesJagdWahl(kand, nHaus, ort)` (kc:5880) über die Wohnhaus-Slots zum Revier aus `tagesOrte` (kc:5831), dann `tagesPlan`
  (kc:6384) mit der Rolle `jaeger`. Gezählt wird nur die Tat des Plans (/jag|fisch/ an `p.akt`), nicht mehr die Rolle des Hauses.
  Bis hier rief die Probe `tagesPlan` mit der Rolle des HAUSES und nie die Wahl → 0 Jäger je Saat, während der Wirt sie stellt.
- `jagdJeTag` = je Saat die Jäger, die am Tag jagen (verschieden über 24 Stunden), Mittel der 8 Saaten (bis hier: Summe der Jagd-Stunden ÷ 8).
- `wildDelta` (neu, Seite `WILD`, Welt am Messort dorf): die Jäger der nächsten Siedlung (`b.rolle` jaeger), der Bestand der Beute-Art
  am Stand ihres Werks über den EINEN Leser `_bestandArt(_bestandKey(werk), AnazhRealm.GAU.beute)` vor ↔ nach geraffter Welt-Uhr; je
  Stunde `_bewohnerZiel(b, h)` (der Leser des Wirts — verlässt der Jäger die Jagd, bucht `_bewohnerBeute` bew:2895 die Beute und zählt
  `S.jagd`), ganze Tage bis zur ersten Beute, höchstens 6; danach 20 Takte der Welt, bis der Gau neu antwortet. Die Uhr steht danach
  auf derselben Stunde (ganze Tage). wildDelta gilt nur mit ≥ 1 Beute; sonst bleibt es leer, beim Namen.
- S2 ist jetzt `K.zahl` (vorher fest `K.nicht` → nie grün, FABRIK:203–204); `erwartet: "nicht"` fällt.
- Nebenbefund geheilt: der Zensus-Block `let Z … const wer` stand hinter dem `return` im Rückruf von S2 (NAHRUNG:802–810) → S3–S7
  warfen „z is not defined“; er steht jetzt vor S3.

**krieg#1 (MACHT)**
- Neue Seite `ZWEIKAMPF` (S1): der Spieler hält eine Klinge (`equipHeld("langschwert")`, der EINE Griff), steht 4 m vor der nächsten
  Wache draußen (`b.waffe`, nicht drinnen, nicht am Steuer; Stelle: Land, kein Haus, kein Bau) und schlägt einen Fuchs neben sich
  (`damageCreature` source player → `_bewohnerZeuge` bew:2768 → `_bewohnerNahen` bew:2821); die Welt läuft ≤ 30 s Welt-Uhr (Takt der
  Werkbank), bis jeder begonnene Gang geschlagen ist (`_bewohnerHiebTakt` bew:2848 → `S.hiebe`). Danach steht der Spieler am Start und
  hält, was er vorher hielt.
- Gelesen aus `S.hiebe`: antwortet = Σ antwort ÷ Σ vorLetztem, durchDeckung = Σ durchDeckung. **Umfang** = Wachen, deren Gang begann,
  + der Spieler NUR mit Klinge — der Wortlaut des Solls ist „Zweikampf: 2 Bewaffnete“ (Karte 2, mensch.macht.krieg#1); die leere Hand
  ist nicht bewaffnet. (Der Zähler von S2–S9 zählt den Spieler weiter wie bisher unter „Bewaffnete“.)
- `sitzt` bleibt leer, beim Namen: der Zug des Kerns `spielKampf` (kc:6559) ist `{an, finte, gelesen, treffer}` — keine Lage des
  Treffers; der Schaden fällt fest auf den Rumpf (bew:2871 `_kampfRohSchaden(null, "rumpf", …)`).
- `sek` 30 → 60 (die Liste erlaubt 10…60), `mutiert: true`, `pfad` + koerper-seele.js, kreatur-leben.js, koerper-core.js.

## Beim Namen offen

**tier#2 — ROT, ehrlich, am Spiel (das ist die Zeile wörtlich, oben).** Die Station sieht jetzt die Jäger (Umfang 4 je Saat, 4 Jagden
je Tag; vorher 0) — S2 fällt an `wildDelta`: 1 Jäger in Huvisnid, 6 geraffte Tage, 6 Jagden, **0 Beute, 2 leer, 4 ohne Antwort des
Gaus**, Bestand deer am Revier null → null (auch nach 40 Takten Warten). Gelesen, nicht geschnitten: der Gau bestellt sein Bild nur für
die nahen Reviere (`_gauTakt` kreatur-erbe.js:579 → `_bestandNah` kreatur-leben.js:2317, der Kreis der halben Seite um den Spieler)
und für das Revier jedes Tiers, das ein Leib zeichnet. Das Revier am Werk des Jägers bestellt niemand → `_bestandArt`
(kreatur-erbe.js:527) antwortet null → `_bewohnerBeute` (bew:2895) geht „ohne Antwort“ heim. Macher-Brief-Kandidat (wartet auf das
Wort des Koordinators): `_gauTakt` hält auch das Revier jedes Jägers, der jagt (der Leser, den `_bewohnerBeute` fragt).

**krieg#1 — ROT im Lauf „nachher“ an der STATION, geheilt in a6555513.** „keine freie Stelle 4 m vor einer der 3 Wachen“: die Seite
verwarf jede Stelle, an der `_imGrundriss` (vegetation-baum.js:1880) etwas nennt — er nennt aber auch „weg“ und „lichtung“, und jede
Wache steht auf dem Weg. Jetzt sperren nur „haus“ und „bau“ (wie `_bewohnerAuswegGang`). Der Lauf der geheilten Station am main
4a188bf2 und am Spiel-Kopf krieg-lage fährt Slot sk-2 (Erwartung am main: ROT an „sitzt —“, der Zug des Kerns trägt keine Lage).

**Preis** in allen vier Läufen GRÜN (p95 25–33,4 ms).

## megastadt#1 (Frage des Koordinators)

Die Station liest den Umfang aus dem Spiel (Bewohner im Wache-Slot mit `b.waffe || b.amSteuer`, MACHT:1048–1063), setzt aber ρ und
imSicht FEST `{ rho: null, imSicht: null }` (MACHT:1016). Ein Spiel-Schnitt an `_bewohnerListe` DIE WACHE hebt höchstens den Umfang auf
1; S1 bleibt ROT an „Antwortzeit ∝ Weg zur Wache ρ —“, bis die Station ρ/imSicht an einem Ausrücken aus der Wache misst — das Spiel
kennt keins (heute naht nur, wer zufällig Zeuge ist, bew:2768). Gemeldet an die GTX 1050 und den Koordinator; nicht geschnitten.

## Nachtrag 20:50 — Slot sk-2 (krieg#1 mit geheilter Stelle, am main und am Spiel-Kopf krieg-lage)

Zweiter Stations-Fehler, geheilt in **db9b54e6** (fast-forward über a6555513, kein Force): der Spieler hielt die leere Hand —
`equipHeld("langschwert")` kennt keinen Bauplan dieses Namens; die Welt nennt die Gattung der Schmiede mit dem Präfix ihrer Domäne
(`KIND_POLICY.weapon.prefix` = `klinge_`, wie `_stoffstromBauplan`). Die Station nimmt jetzt `klinge_<Waffe der Wache>`, sonst das
Langschwert, und nennt ohne Griff den Grund. Der Lauf am main fuhr noch a6555513 (leere Hand), der am Kopf schon db9b54e6.

```
@@SK2 20:28:10 Baum n2611-k4 HEAD dee4417cba26c84d69b2ffe78af60c9af60791a5 (Soll dee4417cba26c84d69b2ffe78af60c9af60791a5)
  ROT  karte2.mensch.macht.krieg#1 · S1 ROT an Umfang 1 < 2 Bewaffnete im Zweikampf — Täter: stamm/siedlung-bewohner.js:2848 _bewohnerHiebTakt — die Wache naht, der Gang beginnt nicht · der Treffer sitzt, wo die Klinge den Leib kreuzt (Anteil von 20) — (Soll ≥ 1) · der Getroffene antwortet (Anteil) 1 (Soll ≥ 1) · Treffer durch die Deckung 0 (Soll ≤ 0) · Umfang 1 (Soll ≥ 2 Bewaffnete im Zweikampf) · 1 Bewaffnete im Zweikampf (1 Wache(n) im Gang, der Spieler mit der leeren Hand) · 1 Gänge geschlagen in 23.44 s Welt-Uhr, Treffer Wache/Spieler 1/2, Züge 8, 2 von 2 Treffern beantwortet, 0 durch die Deckung, Lagen ohne Feld · 1 von 3 Wachen draußen nahten (Wache 7:72:4, 4 m vor dem Spieler) · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 1.02 min
  KARTE2 Akte mensch.macht.krieg.1.4a188bf2-gtx.json: Richter ROT · Preis GRÜN: p95 33.44 ms · max 41.77 ms · Heap 502 MB gehalten (Spitze 546.8) · VRAM 200.8 MB gehalten (Spitze 202.7) · 563 Bilder · Referenz f 1.097 · Einlauf 41.2 s (Lesewert): p95 33.42 ms, max 83.45 ms · der Lauf selbst p95 33.44 ms (946 Bilder)
@@SK2 20:34:47 krieg am 4a188bf2 EXIT=0 nach 397 s
  GRÜN karte2.mensch.macht.krieg#1 · S1 GRÜN · der Treffer sitzt, wo die Klinge den Leib kreuzt (Anteil von 20) 1 (Soll ≥ 1) · der Getroffene antwortet (Anteil) 1 (Soll ≥ 1) · Treffer durch die Deckung 0 (Soll ≤ 0) · Umfang 2 (Soll ≥ 2 Bewaffnete im Zweikampf) · 2 Bewaffnete im Zweikampf (1 Wache(n) im Gang, der Spieler mit klinge_langschwert) · 1 Gänge geschlagen in 23.72 s Welt-Uhr, Treffer Wache/Spieler 1/2, Züge 8, 2 von 2 Treffern beantwortet, 0 durch die Deckung, Lagen bauch/bein/bein · 1 von 3 Wachen draußen nahten (Wache 7:72:4, 4 m vor dem Spieler) · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 1.03 min
  KARTE2 Akte mensch.macht.krieg.1.dee4417c-gtx.json: Richter GRÜN · Preis GRÜN: p95 25.23 ms · max 41.68 ms · Heap 511 MB gehalten (Spitze 550.9) · VRAM 188.8 MB gehalten (Spitze 188.8) · 662 Bilder · Referenz f 1.041 · Einlauf 42.2 s (Lesewert): p95 25.18 ms, max 91.71 ms · der Lauf selbst p95 25.2 ms (1204 Bilder)
@@SK2 20:41:29 krieg am dee4417c EXIT=0 nach 402 s
@@SK2 20:41:33 kern EXIT=0 nach 3 s
@@SK2 20:41:54 kern --selftest EXIT=0 nach 22 s
@@SK2 20:41:54 Spiel-Dateien von main 4a188bf2 (git 0): M  koerper-core.js · M  stamm/siedlung-bewohner.js
@@SK2 20:47:15 linse vorher-4a188bf2 (bewohner) EXIT=0 nach 321 s
@@SK2 20:47:15 zurück am Kopf (git 0) · Baum sauber
@@SK2 ENDE 20:47:15
```

- **krieg#1 GRÜN am Spiel-Kopf krieg-lage dee4417c** (auf main 4a188bf2; Lage im Zug von `spielKampf`, Franklin 2019 Longpoint):
  sitzt 1 · antwortet 1 · durch die Deckung 0 · Umfang 2 · Lagen bauch/bein/bein · Preis GRÜN p95 25,23 ms. Am main: „Lagen ohne Feld“, sitzt —.
- Kern-Linse am Kopf (diag-koerper-kern): EXIT 0; Selbsttest 69 von 69 (Täter ohneLage → H5). Die Lagen über 2 000 Zweikämpfe
  (5 209 Treffer): bein 0,534 · kopf 0,204 · bauch 0,138 · brust 0,123 — Tafel 0,54 · 0,20 · 0,13 · 0,13 ± 0,03.
- Roh: `station-tier-krieg-sk2.txt` (= OMEN p3/n2411/wechsel/sk-2.txt, Slot 20:28:10–20:47:15).
