# leib-liest-satz — Stand-Blatt (ZWISCHENSTAND)

Zweig `leib-liest-satz`, Basis origin/main 4c9e6aab (V18.546.426). Auftrag: der Leib des Bewohners liest seinen ganzen Satz — vier
Sprossen aus EINEM Gesetz.

## Geschnitten — EIN Gesetz, EIN Ort

`koerper-core.js` LEIB_SATZ: `tagesHaltung(akt, rolle, satz)` liest den GANZEN Satz des Bewohners (Gesundheit `krank`, Können
`uebung`, Akt, Rolle) an EINER Stelle; derselbe Abschnitt trägt `leibSatzProfil(M, name)` (der zusammengesetzte Name „<h>/krank“,
„<h>/lehrling“ löst sich aus der eingefrorenen MOTION — kein Zwilling der Tafel), `leibSatzNamen()` (die Zeilen der Ferne) und
`trachtDesTags(T, grad, regen)` (Clo-Soll aus Luft und Regen → die Lagen der Epoche). Leser im Wirt, kein zweiter Pfad:

- `_bewohnerGemuet(b)` ruft `tagesHaltung(b.akt, b.rolle, b)` — der Kranke steht „<Haltung>/krank“ (Lasselin 2020: Kopf −2,5°,
  Knie, Arm), der Lehrling „<Haltung>/lehrling“ (halber Takt unter Können 0,5 der Kunst seines Akts: Werk → `haupt`, Zweikampf →
  `kampf`, Brett → `brett`).
- `_bewohnerStaende` backt die Zeile jedes Namens aus `leibSatzNamen()` (11 → 24 Zeilen), `_koerperMotionProfile` liest
  `leibSatzProfil` — nah und fern derselbe Leib.
- `_bestandAnlegen`: die Rate ist ein Getter `jeStunde · b.uebung.handwerk.koennen` — die Güte wächst mit jeder Übungsstunde;
  `LEBENSLAUF.uebung.alpha` ist das Band je Kunst aus Newell & Rosenbloom 1981 Tab. 1, Können = (h / guteH)^(α/(1−α)).
- `_bewohnerTracht(d, T, tuch, ort)`: Luft (`temperaturAus` am Gelände des Orts, Stunde `LEIB_SATZ.tracht.uhr` = 6 Uhr nach
  Schiavon & Lee) und Regen des Wetters wählen die Lagen; der Ort ist Pflicht und bricht laut (kein stiller Rückfall auf den
  Spieler-Ort); alle drei Rufer im Spiel geben den Ort ihrer Siedlung `{ x: S.ox, z: S.oz }`.

## Gemessen — vorher → nachher (dasselbe Messgerät: node, die Klasse im vm über `scripts/lib/stamm.cjs` grundWirt)

| Sprosse | vorher | nachher | Soll | Mess-Name |
|---|---|---|---|---|
| `karte2.mensch.menge.seuche#1` | 0 von 21 247 Kranken draußen um 10 Uhr stehen anders | 21 247 von 21 247 | ≥ 1 | Linse SATZ L1 (`gate:koerper-kern`) · Station KRANK |
| `karte2.mensch.sport.kunst#1` | 0 von 3 Künsten trennen Meister ↔ Lehrling | 3 von 3 (Werk pwalk ↔ pwalk/lehrling Takt 1,6 ↔ 0,8 · Zweikampf fight ↔ fight/lehrling 2,8 ↔ 1,4 · Brett pwalk ↔ pwalk/lehrling) | Blindtest ≥ 80 % (Panel) | Linse SATZ L2 · Station KUNST (Kandidat) |
| `karte2.mensch.sport.koennen#2` | R² 0,000 über 100 h | R² 1,000, Steigung 0,2658 = 0,21/0,79 | ≥ 0,8 | Linse SATZ L3 · Station UEBUNG (r2 1, Spanne 100) |
| `karte2.mensch.kopplung.leib#1` | Lagen-Anteil Sommer = Winter = Regen 0,889 → lagenDelta 0,000 | Dorf: Sommer 0,778 · Winter 1,000 · Regen 1,000 → 0,222; 16 Zellen (Station, Ort der Zelle): Sommer 0,500 · Winter 1,000 · Regen 0,813 · Sturm 0,813 · Gegenlauf 0,500 → **0,500** | > 0 | Linse SATZ L4 · Station TRACHT_AN (Kandidat) |

Kosten: die Zeilen der Ferne 11 → 24 kosten einmal +0,6 ms je Gestalt und +1,0 ms je Satz (swiftshader-CPU, Werkbank); das Gerät
misst sie erst die Probe (Mess-Name: der Bake von `_bewohnerGangPose` im Trace, Radeon).

## Die Linse — Familie Bewohner (`scripts/diag-koerper-kern.cjs`, `gate:koerper-kern`)

`satzUrteil` liest den Satz über die Leser des Spiels (grundWirt, Ort dorf aus `spec/profiband/haushalt.json`) in fünf Lagen
L1–L5 und nennt den Täter beim Namen. Am alten Gesetz ROT; der Selbsttest mutiert fünf Täter, jeder feuert an seiner Lage:

- „alt“ (`tagesHaltung(akt, rolle)` ohne Satz) → ROT an L1 und L2
- „ohneStufe“ (Können nicht gelesen) → ROT an L2
- „einmalRate“ (die Rate einmal beim Anlegen) → ROT an L3
- „ohneWetter“ (der Schnitt der Epoche) → ROT an L4
- „ohneZeile“ (`leibSatzNamen` leer) → ROT an L5

`gate:koerper-kern` main GRÜN, Selbsttest GRÜN (alle siebenundfünfzig Täter); `gate:mensch-anatomie` GRÜN (4 m 58 s);
`gate:daten-contract` GRÜN.

## Der Kandidat der Stationen (`cloud-post/leib-liest-satz-station/`)

`kandidat.diff` gegen origin/punkte-maschine 75cfc1412 + `BEGRUENDUNG.txt`: TRACHT_AN gibt den Ort der Zelle; das α-Band druckt als
JSON; KUNST (Meister ↔ Anfänger je Kunst über den Leser des Spiels, Bildpaar an der Pose der Sprosse, Klasse P Panel, Leiter
45 s). Die drei Wände: die Liste der Punkte-Maschine (`meisterkarte-quelle/punkte/punkte.cjs liste` im Zweig `punkte-maschine`)
zählt an Basis und Kandidat dieselben 1976 Stationen, 15 fehlend und 2 Fehler — dieselben ROT gelaende.K2#1/#2 „Wand HAKEN“; jede
Leiter misst in ≤ 60 s; der Fächer fährt in der Seite durch den Leser des Spiels (kein Fächer im Kern).

## Der Probe-Ruf

Der Beitrag berührt `stamm/siedlung-bewohner.js` — die Pflicht des Zugs (PROBE_PFLICHT Bau + Haus) sind `gate:pruefbuehne-licht`,
`gate:weltbild-frost:echt`, `gate:studio-begehen`; der Einlass trägt höchstens vier. Kopf 1 ruft die drei Pflicht-Wände +
`bild:dorf@0.42`, ein Kopf n+1 bringt `bild:stadt-voll@0.55`.

## Die Wände hier (Endbaum auf main 3bbd1e8f, je Exit explizit, probeUrteil `scripts/lib/urteil-zeile.cjs`)

| Wand | Exit | probeUrteil | Zeit |
|---|---|---|---|
| `check:statik` | 0 | — | 8 m 26 s |
| `gate:koerper-kern` (die SATZ-Linse) | 0 | GRÜN | 15 s |
| `gate:pruefbuehne-licht` (S0 BILD Nacht luma 44,3, swiftshader) | 0 | GRÜN | 1 m 26 s |
| `gate:studio-begehen` | 0 | GRÜN | 5 m 7 s |
| `gate:weltbild-frost:echt` | — | nicht messbar hier | — |

Die Frost-Wand fährt das Rezept `echt` mit Kopf: ohne X-Server bricht der Start, unter xvfb stürzt der GPU-Prozess von swiftshader
beim Boot der Welt (Device Lost, Ausnahme 0xffffffff) — an der Basis origin/main derselbe Absturz an derselben Stelle, die Maschine,
nicht der Schnitt. Sie urteilt auf dem Gerät in der Probe.

## Quellen (an der Quelle gelesen — jede Zahl ein Band im Gesetz)

- Lasselin et al. 2020, Brain Behav Immun 84:147–153, Tab. 1 (LPS 2 ng/kg gegen Placebo, PMC7010549): Gang −0,185 m/s, Kopf −2,5°,
  Arm-Streckung −1,5°, Knie +1,9°, Schritt −0,093 m, Schrittzeit +27,9 ms, Spur +5 mm; Rumpf und Schulter ohne Befund. Im Gesetz:
  Kopf 0,0436 rad, Knie −0,0325, Arm −0,0262.
- Newell & Rosenbloom 1981 (Cognitive Skills and their Acquisition, S. 1–55), Tab. 1: α je Datensatz 0,06–0,51 — Crossman 1959
  (Zigarren, das Handwerk) 0,21 · Snoddy 1926 (Spiegelzeichnen) 0,26 · Seibel 1963 / Hirsch (Wahl-Reaktion, der Kampf) 0,32 · Stair
  (Kartenspiel) 0,21; Gl. 22–27: ein Potenzgesetz in Versuchen ist eines in der Zeit mit dem Exponenten α/(1−α). Der Code setzte
  α = 0,4 ohne Quelle.
- Schiavon & Lee 2013, Building and Environment 59:250–260, Gl. 10: Clo aus der Außenluft um 6 Uhr (< −5 °C 1,00 · −5…5 °C
  0,818 − 0,0364 t · 5…26 °C 10^(−0,1635 − 0,0066 t) · ≥ 26 °C 0,46).
- ASHRAE 55 Kleidungs-Tafel (pythermalcomfort 2.10.0 `clo_individual_garments`): T-Shirt 0,08 · Herren-Unterwäsche 0,04 · dicke Hose
  0,24 · Walking-Shorts 0,08 · Langarm-Sweatshirt 0,34 · Einreiher dick 0,44 · Stiefel 0,10 · Schuhe 0,02 · Wadensocken 0,03 ·
  Knöchelsocken 0,02.
- Bröde et al. 2008 (Eur J Appl Physiol): die nasse Mittel-Lage nimmt der Isolation 9 % im Stand (im Gesetz ×0,91).

## Offen (ehrlich, mit Grund und Mess-Name)

- **Der Gang des Kranken:** der Kranke STEHT anders, er GEHT noch wie der Gesunde — der Gang liest keine Haltung, `b.tempo` (Lasselin
  −0,185 m/s) liegt außerhalb der Bahn dieses Auftrags (`_bewohnerGemuet` · `tagesHaltung` · `_bewohnerTracht` · `_bestandAnlegen`).
  Mess-Name: Gang-Tempo krank ↔ gesund in `diag-mensch-anatomie`.
- **Die Werk-Geste des Lehrlings:** der Lehrling zeigt den halben Takt des Atems, keine eigene Hand-Geste. Mess-Name: Blindtest
  Anfänger ↔ Meister (Panel).
- **Umkleiden im Verweilen:** die Tracht wird bei der Geburt der Liste bzw. des Satzes gelesen; ein Wetterumschwung während des
  Verweilens zieht niemanden um, bis die Siedlung neu geboren wird. Mess-Name: lagenDelta über einen Wetter-Zug am selben Ort.
- **kunst#1 ist Klasse P (R11 Panel):** die Maschine bucht sie nie; die Zahl des Lesers steht (3 von 3), das Urteil gibt das Panel.
- **Das Memo von `_bewohnerGemuet`** ist je Tag: eine Schwelle des Könnens, die mitten am Tag fällt, zeigt sich höchstens einen Tag
  später.
- **Nur auf dem Gerät:** das Bildpaar (steht ein Kranker anders, trägt einer im Regen eine Lage mehr) und die Kosten der Zeilen —
  die swiftshader-Welt der Werkbank steht hier nicht („DIE WELT STEHT NICHT“), die Bilder kommen von der Radeon-Probe.

## Status

ZWISCHENSTAND · Karte 2 gebucht 119 von 1 718 · Kopf und Probe folgen.
