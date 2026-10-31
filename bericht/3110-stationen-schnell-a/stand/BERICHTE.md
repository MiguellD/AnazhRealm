# Die Berichte der Arbeiter (verdichtet, 31.10.) — GTX-Zahlen hergeleitet, nicht gemessen

## A — ferne.K1/K2 (FERNE_SITZUNG), material.K3 + material.K1

- FERNE: Täter `einschwingOffen` zählte einen ruhenden Dorf-Plan als wachsend (Radeon a03b7b06: „dorfWaechst 0/18“, 4 007 Takte, 240 s);
  Band-Takte schliefen je 50 ms (40 + 5 × 20 Takte, 7 s); die Nachsicht mit Blende 1/4 marschierte denselben Blick noch einmal (bis 2,6 Mio.
  Rufe je Sicht). Schnitt: `_dorfTaktLebt`; `__werkTakt` gibt sein Bild als Versprechen zurück (Band, Ort, Tafel takten darin, der Ort-Takt
  als Zwilling fällt); die Luft je Strahl-Richtung einmal (bitgenauer Schlüssel). Null-Welt Genesis, Uhr 0,5: 18,24 → 10,42 Mio. Rufe,
  45,6 → 24,2 s, gleich. GTX ≥ 90 → ~57–87 s (44 Schüsse ~17 s, 12 Märsche 12–30 s, Band ~4,5 s, Teleporte 23–35 s). Offen: über 45 s; der
  Marsch neben den Schüssen (−12–17 s, +81 Atome) wurde der Decke wegen gestrichen.
- ALBEDO: K3 und K1 maßen dieselbe Tafel, das Labor lief mit eigenem Browser; Tafel-Takte 50 ms (~680 Takte, 34 s); `lies` 46 ms je Pass
  (~385 Pässe); `albedoAuswerten` 491 ms je Zeile; 20 von 21 Eich-Schüssen las niemand. Schnitt: EINE Probe für vier Stationen
  (Zwillinge), das Labor in einem eigenen Fenster der Sitzung, Bild-Takt, `lies` 6 ms, Auswertung 214 ms, `eichen` nur im Gang der Karte.
  GTX 2 × ≥ 90 → ~23–26 s. Offen: über dem Ziel 15 s — die festen Takt-Zahlen der Tafel und die `sleep(600)`-Kette des Labors
  (diag-albedo-tafel.cjs, nicht angefasst).
- Bewusst: die Takte gehen im Bild-Takt (17–33 ms Spielzeit je Takt statt 50–100 ms) — derselbe Schritt wie beim Ort seit 4f098fa6.
- DECKE: licht-linsen +2, werkbank −47, band-urteil +7, diag-profiband +32 → scripts −6. Prüfungen: liste 0, selbsttest 121/121,
  scheiben Exit 0; profiband 38/38, `licht --luft --selbsttest` GRÜN.

## B — mensch.K1#1 + K2#2 (BEWOHNER_SITZUNG), tiere.K2#2

- Bewohner: am falschen Ort (Mess-Wiese, 1 km vom Start-Dorf, `_startDorfFaellig` 260 m um Genesis); die Stadt mitgefahren (8f1802b1 ohne
  Stadt 69 s, mit 237–249 s); Wanduhr (je Bild 4 ms Arbeit + 16 ms Schlaf, platz-8.js 20 + 4 + 8 s); Wege-Messer 25,3 s je Spieltag, die
  Bewohner-Liste 1,52 s × 17. Schnitt: `umstellen --ort genesis`, `--ort genesis` (nur das Start-Dorf), `platzAcht` wartet auf `__gebautNach`
  und läuft 80 Spiel-Takte; `leuteTakt` ohne Spielzeit; Wege-Messer an der Kapsel-Nachbarschaft (`_blockerNahe`) 25,3 → 5,5 s, bit-gleich
  über 36 000 Takte; `_bewohnerWand` (Spiel-Code `stamm/siedlung-bewohner.js`) Vorfilter am Rahmen der Strecke 1,52 → 1,04 s, alle Stände
  bit-gleich. GTX ≥ 90 → ~50–60 s. Offen: die 16 Neuberechnungen der Liste in der Wiederkehr (das Kriterium „die Liste neu“), das Wachsen
  des Dorfs im Deckel; der headless-Lauf `bewohner` am Endstand nicht mehr gefahren.
- tiere.K2#2: das Mahl als ganzer `jagdkreis` (100 Jagden) in eigener Null-Welt; der Grund „Sprinter am Spieler des Fensters“ fiel mit
  a1fed083. Schnitt: Probe `mahl` in der Welt der Sitzung (rudel bis zum ersten Riss, Kette 7 200 Takte). GTX ≥ 90 → ~17–28 s; lokal im
  Fenster 3 s GRÜN (Riss 40,1 s, Fressen 102,3 s, Fuchs 21,2 s, Bär 16,5 s). Selbsttest: 8 Täter ROT beim Namen.
- DECKE: kreatur-proben +167, diag-kreatur-takt +4 (`mahl: 89` in DAUER_S); Spiel +123. Prüfungen: liste 0, selbsttest 121/121, scheiben 0.

## C — vegetation.K4, siedlung.K1#2, siedlung.K2

- vegetation.K4: die Sitzung stand 1,1 km vom Genesis-Ort — das Start-Dorf wurde nie fällig, start wartete seinen Deckel (≥ 1 200 Gänge),
  W9 Waise noch einmal (1 800); ≈ 3 ungelesene Schüsse je Box-Blick. Schnitt: Ort genesis; W9 schießt nur, was eine Zahl liest (Boden-Maske
  je Box-Blick; G/O nur, wenn Büschel weggenommen würden; Third und Gegenprobe ohne Maske); die W10-Innen-Bild-Kopie fiel aus der Linse;
  das Feld `spieler` je Haus ist zurück (K4#2 liest es, seit 41f18376 fehlte es); Schlaf weg, Gesetzbuch je Haus einmal. Aufnahmen
  404 → 112. GTX ≥ 130 → ~57–86 s. Offen: die 112 Aufnahmen und das Einschwingen nach zwei Dörfern (Inhalt der Messung) — vermutlich
  braucht K4 eine `ausnahme`.
- siedlung.K1#2: 59 359 Sim-Schritte (`_stepCharacter` 98 %), Gesetzbuch je Haus doppelt, Einschwingen 9 786 Takte mit 10 ms Schlaf, die
  Innen-Bilder im geerbten 1920 × 1080. Schnitt: Ort genesis, Fenster 800 × 600 wie die Linse (eine geänderte Messbedingung, benannt),
  Takt statt Schlaf, Gesetzbuch einmal. GTX ≥ 90 → ~45–55 s. Offen: die Sim-Schritte sind die Messung; die neue Fassung lief lokal nicht
  durch.
- siedlung.K2: `--ort wiese` setzt `__anazhAutoSettlement = false` — die Stadt wuchs nie; der Stand fragte 60 × 1 s. Schnitt: Spieler direkt
  auf den Hügel, Dorf-Zug und Decke geliehen (`leihe`), Bau-Ereignis statt Uhr. GTX ≥ 90 → ~21–27 s (Zipf-Teil 20,8 s CPU, davon 13 s ein
  Metropolen-Export). Lokal baute der Zug bis Haus 4 von 36, das Ende unbewiesen.
- DECKE: diag-haus-welt −733. Prüfungen: liste 0, selbsttest 121/121, scheiben 0 (vor 9cdbd7fe; danach nur Probe-Text in g5.js, liste +
  Parse-Test).

## D — studios.K2#2 + K3#2, studios.K4, bauen.K1#2

- studios.K2#2/K3#2: fester Schlaf 1,5 s je Studio (`diag-studio-huelle.cjs:382`), Griff-Polling 150 ms, Neuladen über neuen Tab bis `load`.
  Schnitt: Leiste am Ereignis vor H3, Bild je Griff in der Seite, Neuladen im selben Tab. Lokal 95,6 → 81,8 s (garage, schmiede, klang).
  GTX ~134 → ~118 s — ZURÜCKGEHALTEN der Decke wegen (`stand/spiel-D-studio/`). Rest: die Bauzeit der Studios (fachwerk bis 4,1 s je Neubau).
- studios.K4: im ruhenden Loop bestellt kein Takt die Stufe des Werks (0 Aufträge über 30 Abfragen); 22,6 m vom Spieler steht ein kleines
  Werk nur als Karte (`fimp:atlas:L2`); eigener Browser + Labor-Browser. Schnitt (`k4-bild.cjs`): Browser der Sitzung, Bühne als zweite
  Seite derselben Herkunft, Spieler am Fuß der Vorschau-Kamera, `__gebautNach`; Albedo nur für Studios mit Differenz im Soll; PNG/Maske
  2 282 → 740 ms. GTX ≥ 90 → ~60–65 s. Bewusst: der Spieler steht beim Warten am Fuß der Vorschau.
- bauen.K1#2: `H.lade` je Lauf; der erste Lauf sprang 1 082 m zur Lichtung. Schnitt: kalt per `_foundryCacheEvict`, Platz beim Spieler.
  GTX ≥ 90 → ~20–45 s.

## E — fahrzeug.K3#2 + K4#1 + K4#2, gelaende.K5#2

- fahrzeug: FAHR_SITZUNG ließ gate:fahr-leben ganz in eigener Null-Welt laufen (T0–F7, das Urteil liest nur T4, T5); `wait` hielt den Prozess
  nach „EXIT 0“ bis zum Deckel; die Grundstellung ging zwischen Ritt und Blick durch die Tür. Zweiter Täter: tempo4.js und blick.js räumen
  `delete r._gameLoopTick`. Schnitt: `fahrWelt` (WELT → T5 → BLICK → T4 in der EINEN Welt, T4/T5 per Anker aus `probeLeben`), Frist je Ruf,
  der Takt nach dem Ritt neu gelegt, blick.js gibt seinen Takt zurück. Lokal alle drei GRÜN in 162,5 s. GTX ≥ 90 → ~50–56 s. Offen:
  tempo4.js (Einschwingen nach dem Weg ~15 s, der Ritt in Echtzeit) gehört auch fahrzeug.K3#1 — nicht angefasst.
- gelaende.K5#2: `gezeichnet` 1,05–1,08 ms je Strahl (~5 000 Strahlen je Ort und Sicht), GT-Uhr 100 ms, Sicht vor Ort (zweimal schwer
  eingeschwungen). Schnitt: 1-m-Gitter der Dreiecke je Netz, neu am Stand des Boden-Satzes; GT im Takt; Ort für Ort; der tote Modus `--bild`
  gestrichen. Byte-Beweis: 20 557 Rufe alt ↔ neu 0 Abweichungen, Endstand 4 440 Strahlen 0 Abweichungen; Lesezeit 24,3 → 4,5 s. Lokal
  GRÜN in 68,1 s. GTX ≥ 90 → ~28–44 s.
- DECKE: diag-koerper-stand +278. Prüfungen: liste 0 am Endstand; selbsttest und scheiben zuletzt vor 2f065970 (121/121, Exit 0);
  gate:koerper-stand auf a5fa2037 nicht gefahren.
