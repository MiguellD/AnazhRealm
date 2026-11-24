# Vorprüfung nerv-bewegung — `leben.tiere.bewegung#1` · `mensch.sport.koerper#1`

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 77 von 1 718. Die beiden Sprossen bucht erst der GPU-Lauf ihrer
Stationen (`punkte.cjs` fährt nur auf den GPU-Läufern), bis dahin stehen sie.

**Geschnitten:** Die Bewegung ist ein Gesetz an der Gestalt. Der Gangwechsel des Tiers liegt an der Froude-Zahl der Natur. Gehen,
Sprint und Sprung des Menschen kommen aus Bein, Masse und Kraft. Elf Verben sind Zeilen der EINEN Verb-Tafel. Das Spiel liest
dieselbe Funktion wie der Richter (`leibVerben`, koerper-core.js:6180). Der Schwebebalken trägt den Fuß, den sein Verb führt.
**Gemessen:** froudeAbw 26 % → 0 %; Verb-Umfang 3 → 11 von 11; Gehen 1,15 → 1,576 · Sprint 5,175 → 6,281 m/s · Sprung 0,395 →
0,543 m; Balancieren in der Welt 0 → 1 (Linse K4d: main 4 von 5 Trittflächen tragen, der Zweig 5 von 5).
**Ehrlich offen:** Die Ziele und die Kontakt-Folge der Verb-Tafel steuern noch nichts. Sie beschreiben 11 von 11 Verben, gelesen
als Steuer-Gesetz von 0 von 11. Dieser Teil ist zu 0 % gebaut, die Sprosse `mensch.sport.koerper#1` ist damit halb (≈ 50 %). Das BILD
fahren die GPU-Proben des Kopf-Commits.

## Die Commits (Zweig `nerv-bewegung`, über main 8544438)

| Commit | Schnitt | Band |
| --- | --- | --- |
| 374e1c6 | Gangwechsel an Fr 0,5 / 2,5, die Hysterese als Halte-Band darunter; `gangBand` ist die EINE Quelle der Schwellen | Alexander 1989, Alexander & Jayes 1983, Heglund & Taylor 1988, Hoyt & Taylor 1981 |
| a69cac3 | Fersen-Wippe im Abroll-Gesetz (tetrapoda `gangRolle`/`gangRollWinkel`/`gangVersatz`/`gangBecken`); die Tiere lesen sie nicht, byte-gleich | Perry 1992 |
| ff04948 | `leibVerben`: Gehen an Fr 0,25, Sprint im Impuls-Gleichgewicht, Sprung h = d·(Φ − 1); `VERB_TAFEL` mit 11 Zeilen | Alexander 1989, Leurs 2011, Weyand 2000, Samozino 2008 |
| 18965cd | `_blockerFugen`: eine Trittfläche (`tritt`) ist nie Stab — der Balken 0,10 m trägt | FIG-Gerätenorm 10 cm |

Die Station steht im Zweig `pm-nerv-bewegung` (28e7cbc über punkte-maschine eea0f13): `k2-mensch-sport.js` setzt alle 11 Verben
in der EINEN warmen Welt ein (`VERBEN`), sek 60, lokal emuliert 17,5–19,3 s.

## Gemessen je Sprosse (vorher ↔ nachher, gleiche Bedingungen)

### `leben.tiere.bewegung#1` — Gangwechsel an Froude ± 10 %

| Größe | main | Zweig |
| --- | --- | --- |
| froudeAbw (Stations-Gitter) | 26 % | 0 % |
| Schwellen Fr hinauf (wolf · fuchs · baer · wesen) | 0,63 / 3,15 | 0,50 / 2,50 |
| Linse `gate:tier-gang` Wechsel-Leiter (Fr 0,46/0,54/2,30/2,70) | ROT am Vor-Wechsel (Mutant hinauf × 1,2: Fr 0,54 Soll Trab, Täter `gangArt`/`gangBand`) | GRÜN |

### `mensch.sport.koerper#1` — 1 Leib, 5 Verben + 6 Geräte-Verben, Tempo und Sprung ± 10 %

Der Leib in der Welt: Bein 0,835 m, 80,9 kg, Φ = LEIB.kraft 2,0 × Können 1,213.

| Verb | main | Zweig | Gesetz (Band) |
| --- | --- | --- | --- |
| Gehen (m/s) | 1,15 | 1,576 | 1,35–1,65 (Fr 0,25) |
| Sprint (m/s) | 5,175 | 6,281 | 6,12–7,48 |
| Sprung (m) | 0,395 | 0,543 | 0,477–0,583 |
| Wand (m/s) | — | 0,6 | 0,54–0,66 |
| Schwimmen im See (m/s) | — | 1,339 | 1,205–1,473 (Gehen × speedMul) |
| Schaukeln (Periode s) | — | 2,517–2,533 | 2,396–2,648 |
| Rutschen (m/s, Austritt) | — | 3,277 (2,756) | 2–4 (1,5–4) |
| Wippen (φ rad) | — | 0,23 | φmax 0,230 |
| Klettern (m/s) | — | 0,379–0,386 | 0,3–0,6 |
| Hangeln (m/s) | — | 0,263 | 0,2–0,6 |
| Balancieren (m/s) | 0 von 1 erreichbar | 0,5 | 0,1–0,5 |
| **Umfang S1** | **3 von 11** | **11 von 11** | |

Das Fuß-Gleiten der Station (S2, Soll < 2 cm) misst jetzt Ferse und Ballen statt des Knöchels. Der Knöchel ist unter der
Fersen-Wippe kein Drehpunkt mehr (Perry 1992). Gemessen: main 1,61 cm, a69cac3 1,11 cm, Zweig 1,05 cm. Der alte
Knöchel-Stellvertreter las 0,35 · 1,89 · 2,15 cm.

Die Linsen:
- `gate:koerper-kern` VERBEN war vorher ROT (V4; V1 1,150; V2 5,175), sein Selbsttest hat 5 Täter.
- `gate:koerper-stand` K4d war vorher ROT am Täter `_blockerFugen` (main 4 von 5, die Sohle des Balkens −40,6 cm). Auf dem Zweig
  steht sie bei 5 von 5, der Selbsttest `stab` fällt ROT.

## Offen (Sprosse · Datei:Zeile · Grund)

- `mensch.sport.koerper#1` · koerper-core.js:6154 — die Spalten `ziele` und `kontakt` der `VERB_TAFEL` beschreiben, steuern
  nicht. Das Gesetz „ein Verb sind Ziele im Raum + Kontakt-Folge" hat 0 von 11 Lesern als Steuerung; die Sprosse ist halb (≈ 50 %).
- `mensch.sport.koerper#1` · koerper-core.js:5285 — LEIB.kraft 2,0 ist gesetzt, nicht gegen Weyand gemessen. Der Sprint liegt
  mit 6,281 m/s −7,6 % unter dem Band-Mittel 6,8, im Band, aber am Rand.
- `mensch.sport.koerper#1` · stamm/koerper-bewegung.js:1320 — die Stütze der Kapsel greift mit dem Radius 0,35 m über die Kante.
  Auf dem Balken endet das Verb bei quer > 0,10 m (fussM 0,05), der Leib steht aber weiter auf ihm.
- `mensch.sport.koerper#1` · worlds/koerperstudio/koerperstudio.js:619 — der Kontakt im Labor (Rand R·0,55, keine Stab-Regel)
  ist nicht der Kontakt der Welt. Labor ≠ Welt.
- `mensch.sport.koerper#1` · stamm/koerper-leib.js:3384 — `GANG_FELDER` trägt die Fersen-Felder nicht. NICHT ANFASSEN
  (`stamm/koerper-leib.js`), der Bewegungs-Block reicht die Wippe darum nicht durch.
- `mensch.sport.koerper#1` · S2 Umfang 0 — Hang < 8°, Stufe und Gerät sind am Fuß ungemessen.
- `mensch.sport.koerper#1` · stamm/siedlung-bewohner.js:1535 — der Bewohner rechnet sein Tempo als Zwilling (`tempoEinheit` ×
  `TAGES_GESETZ.gang`), nicht aus `leibVerben`. Der Spieler liest das Gesetz, der Bewohner noch nicht. NICHT ANFASSEN
  (`stamm/siedlung-*.js`, `TAGES_GESETZ`).
- `leben.tiere.bewegung#1` · stamm/bau-buch.js:309 — `_applySizeMultipliersToStats` skaliert das Tempo der Kreatur mit 1/√Größe,
  gegen Froude (v ∝ √L).
- beide · scripts/diag-koerper-stand.cjs:1360 — K7 Aufbau (401/37) ist in diesem Container auch auf main ROT, ebenso ohne K4d.
  Dazu flackert K8 streu wiese 3,3 (stamm/vegetation-streu.js:785 `_streuFuss`). Beides ist nicht von diesem Zweig.
- beide · die Stationen fahren nur auf den GPU-Läufern (hier emuliert), das BILD (swiftshader) ist hier nicht geschossen: die
  GPU-Proben `gate:tier-gang`, `gate:kamera-leib` und `gate:koerper-stand` des Kopf-Commits tragen es.

## Quellen (Bänder)

- Weyand et al. 2000, „Faster top running speeds are achieved with greater ground forces not more rapid leg movements":
  https://pubmed.ncbi.nlm.nih.gov/11053354/
- Samozino et al. 2008, „A simple method for measuring force, velocity and power output during squat jump":
  https://pubmed.ncbi.nlm.nih.gov/18789803/
- Leurs et al. 2011, „Optimal walking speed following changes in limb geometry" (Fr ≈ 0,25 beim Gehen):
  https://pubmed.ncbi.nlm.nih.gov/21653821/
- Alexander 1989 (dynamische Ähnlichkeit, Fr ≈ 0,5), Hoyt & Taylor 1981 (Gangwahl nach Energie), Heglund & Taylor 1988
  (Schritt-Frequenz über 16 Arten), Perry 1992 (die drei Wippen des Fußes).
