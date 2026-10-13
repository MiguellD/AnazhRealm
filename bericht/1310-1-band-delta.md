# Bericht 1310-1 — das Band-Delta der Tore an der Genesis

**Status: ZWISCHENSTAND.** Schnitt **welle-m-e-torwurf 198e80f3** `[ci voll]`. Nach dem Schnitt liegt torwurf an der
Genesis bei 50,1 fps statt 47,4 (main 49,7), die Wiese ist gleich. Die CI ist rot in einem Gate, das lokal vor und nach
dem Schnitt gleich grün läuft (§5).

**Urteil:** Der Täter hat einen Namen, und er heißt nicht Tor. Es ist **die Reihe der Region-Bündel**. r184 zeichnet die
BundleGroups in der Reihenfolge der Szene, vor jedem losen Objekt. `_archRegionBundleFor` legt `@global` und `@wahl` beim
ersten Gebrauch an, also entschied bisher die Ankunft beim Boot.
- Am Genesis-Ring legt der Tor-Zwilling (Wahl „schatten“) `@wahl` vor `@global` an. Dann zeichnen Pflanzen-Stufen und
  Atlas-Karten (Ausschnitt je Fragment) vor den Verdeckern.
- In EINER Sitzung kostet das bei gleichen Befehlen:
  - Band +0,9 bis +1,7 ms je Frame,
  - lange Bank +1,0 bis +1,7 ms,
  - unter Regler voll 2,9 bis 4,6 fps.
- Es wirkt in beiden Welten und in beiden Richtungen.
- Der Zwilling selbst kostet 0,2–0,4 ms („Zwilling weg“: Band −0,20 / −0,21, lange Bank −0,38, beide im Rauschband), die
  Fernform der Tore nichts. Alle Schatten-Kaskaden zusammen kosten an der Genesis 0,24 ms.

Auftrag: Nachricht des Koordinators 13.10. (1310-1).
- Kopf vorher: welle-m-e-torwurf 52ac16d8.
- Main = integ-probe = bb554abf.
- Gerät: GTX 1060, 1920 × 1080, Instrument abab-i543 (bb554abf + Genesis-Variante aus 1110-10).

## 0. Vorab: die CI von 52ac16d8 war rot — geheilt

- CI 38245061535 (52ac16d8 `[ci voll]`) war rot in Gruppe 4, Schritt 100 `gate:foundry-crossfade`. Lokal nachgestellt:
  EXIT=1. Zwei Gründe, beide meine:
  - Der Selbst-Test „zwei Werfer je Gestalt“ suchte die castsShadow-Zeile wörtlich. Die Kosten-Regel `_wurfVonBilligerer`
    hatte sie erweitert, also: „ANKER FEHLT“.
  - KETTE OHNE PARTNER zählte die deklarierten Stufen. Das Tor deklariert [0,3], und die 3 ist NUR-WURF.
- Der Schnitt **0fc1fe3d** `[ci voll]`:
  - Die Linse liest die Zeile mit dem Kosten-Term.
  - Neue Klasse „Kosten-Regel wirft doppelt“.
  - KETTE OHNE PARTNER zählt die gezeigten Stufen (`_foundryNurWurf`).
- Ergebnis: lokal EXIT=0 in 45 s, ci-lokal Puls + Gruppe 4 31/31. **CI 38369194216: 13/13 grün.**
- Meine Lehre: Nach der Kosten-Regel lief vor dem letzten Push kein volles ci-lokal. `p3/es/ci-lokal.cjs` hat jetzt einen
  Gruppen-Filter `NUR=`.

## 1. Die Linse: Erst- gegen Dauer-Zeichnung (`omen-messfolge --schalter`, WIP 07e1d785)

- **Die Linse:**
  - Je Block ein Aufwärm-Band (verworfen), dann 3 Bänder, eine lange Bank (100 × 3) und ab s2 ein Lauf von 12 s unter
    Regler voll.
  - Jeder Schalter-Block steht gegen das Mittel seiner Grund-Nachbarn davor und danach. So fällt Drift heraus; der Takt
    fiel in s1 mit der Wärme von 1796 auf 1765 MHz.
  - Das Rauschen ist dieselbe Rechnung ohne Schalter: innere Grund-Blöcke gegen ihre Nachbarn, Band 2σ_d/√k.
  - Ein **Null-Schalter** (derselbe Griff ohne Änderung) muss im Band liegen, sonst ROT mit dem Täter „Methode“.
  - Ein Block bei anderem Takt als seine Nachbarn (±0,5 %) fällt beim Namen aus dem Urteil.
- **Selbsttest:** 13 Fälle in der Familie der Messfolge, 0,7 s im Puls (check:statik).
- **s1** (torwurf-Welt, 25 Blöcke; `1310-1/erst/s1-urteil.txt`):

  | Schalter | Band Δ ms | Rauschband | Urteil |
  |---|---|---|---|
  | null | −0,15 | ±0,21 | im Rauschen |
  | Zwilling-Stoff schlicht | +0,21 | ±0,26 | im Rauschen |
  | Zwilling weg (Befehle 172 → 167) | −0,20 | ±0,21 | im Rauschen |
  | Fernform-March aus | +0,25 | ±0,21 | knapp drüber, falsches Vorzeichen, lange Bank +0,08 → Rauschen |

- **Erst-Zeichnung:** Grund-Blöcke +0,14 ms. Das +1 ms vom 12.10. (jeder Eingriff verteuerte das folgende Band) kehrte
  nicht wieder, auch nicht im Aufwärm-Band. Der Toggle von gestern alternierte einzelne Bänder; ein Band streut je Messung
  ±0,6 ms.

## 2. Boot-ABAB, vier Seiten (je 3 Boots, Genesis; `1310-1/abab3/auswertung.md`)

Die Seiten:
- **M** = main bb554abf.
- **T** = torwurf.
- **Z** = torwurf mit `schatten: 0` in Zeile 0 (Stufe 0 wirft selbst).
- **G** = torwurf mit `fernform: "gesetz"`.

12/12 grün, Seiten-Wache per porta-core-Hash.

| Median | M | T | Z | G |
|---|---|---|---|---|
| fps Regler voll | 50,3 (50,3 · 50,3 · 49,9) | 47,4 (47,4 · 48,2 · 47,2) | 49,3 (49,6 · 45,9 · 49,3) | 47,5 (47,5 · 47,1 · 47,9) |
| Band GPU ms | 19,06 | 20,57 | 19,37 | 19,68 |
| gpu-bank ms | 16,56 | 17,45 | 18,27 | 17,90 |
| Befehle / Dreiecke (Band) | 212 / 924k | 172 / 695k | 212 / 924k | 172 / 695k |

- G ≈ T: die Fernform ist es nicht.
- Z ≈ M (bis auf Z2): der Unterschied folgt dem Zwilling.
- Bank und Band streuen über Boots je Seite 1–2,4 ms und widersprechen sich, deshalb in EINER Sitzung weiter.

## 3. Der Zustand von Z in der torwurf-Welt (s2, 19 Blöcke; `1310-1/erst/s2-urteil.txt`)

- **Schalter „l0-wirft“:** Die Tor-L0 werfen selbst, die Zwillinge zeichnen nicht (269 Befehle, mehr als Z).
  - fps −0,08 (σ 0,20), Band +0,30 ±0,47.
- **Zwilling weg:** fps +0,20, Band −0,21.
- **Folgerung:** Der Wurf entscheidet es nicht. Die Boot-Differenz T − Z entsteht beim Boot.
- Das Null-Urteil von s2 ist blind: Zwei Null-Blöcke fielen an der Takt-Wache. s1 trägt es.

## 4. Zerlegt und beim Namen

**Zerlegung, M T T M** (`1310-1/zerleg/*-zerlegen.txt`):
- Gesamt T − M **+1,64 ms**, das Hauptbild +1,95, bei gleich vielen Hauptbild-Draws (79).
- Täter-Posten: **karten +0,63** (0,50/0,46 → 0,98/1,23) und **einzelstuecke +0,53**.
- Der Schatten (k0 + k1) kostet in M nur 0,24 ms, T − M +0,07.
- Die Klassen-Posten `bau` und `post` sind an der Genesis unbrauchbar (Abschalten verteuert um 26 ms). Das ist eine offene
  Linse.

**Reihenfolge des Hauptbilds** (`reihenfolge.cjs`, `1310-1/zerleg/M1-reihe.txt` · `T1-reihe.txt`):
- Die 69 losen Objekte stehen in M und T identisch.
- Die Bündel sind vertauscht: M zeichnet `@global` (28) vor `@wahl` (57), T zeichnet `@wahl` (74) vor `@global` (16).

**Der Beweis in EINER Sitzung**: Schalter „Reihe der zwei Bündel“, je 3 Blöcke gegen Null-Schalter.

| Welt | Schalter | Band Δ | lange Bank Δ | fps Δ | Null |
|---|---|---|---|---|---|
| torwurf (s3) | @global zuerst | **−0,93** ±0,39 | **−1,01** ±0,48 | **+2,85** ±1,06 (→ 50,1 · 51,0 · 50,9) | grün (+0,13) |
| main (s4) | @wahl zuerst | **+1,68** ±0,39 | **+1,67** ±0,57 | **−4,57** ±0,28 (→ 46,0 · 46,0 · 44,8) | rot/blind: 2 von 3 Null-Blöcken an der Takt-Wache, Null-Block 10 −1,05 fps bei gleicher Reihe (offen) |

## 5. Der Schnitt — welle-m-e-torwurf **198e80f3** `[ci voll]`

- `_buendelRang` / `_buendelReihe` in `anazhRealm.js`:
  - Die Bündel-Plätze der Szene tragen `@global` · die Regionen (in Ankunft) · `@wahl`.
  - Jedes andere Kind bleibt, wo es stand.
  - `_archRegionBundleFor` ruft die Reihe nach jedem neuen Bündel.
- Linse **H7** in `gate:profiband` (Band-Wand, Puls):
  - `_buendelReihe` aus dem Stamm über eine Szene mit der Ankunft `@wahl · 3,4 · @global · s:1,2`.
  - Selbsttest 32/32: rot ohne den Aufruf, mit `@wahl` im ersten Rang und ohne die Reihe im Stamm.
- **Wände** (`1310-1/waende/summe.txt`), je EXIT=0:
  - Puls ci-lokal 18/18;
  - gate:profiband, gate:tor-fern, gate:worker-dichte;
  - gate:schatten-werfer, gate:chunk-satz, gate:kamera-treue, gate:verdeckungs-abfrage, gate:scatter-lod,
    gate:foundry-crossfade;
  - **voller Playtest „Alle Invarianten OK“** (97 s).
- **CI 38386835509: 12 von 13 grün, voll 3/11 Schritt 8 `gate:hitch-telemetrie` ROT** nach 14 min. Sonst läuft der
  Schritt 3–6 min: 38369194216 5:51, 38245061535 5:28, 38238777403 3:11.
  - Lokal ist das Gate grün auf 198e80f3 (516 s) UND auf 07e1d785 vor dem Schnitt (480 s).
  - Die Phasen sind gleich lang: Bundle-Neubau 136 / 134 s, ohne Anmeldung 94 / 91 s.
  - Rohdaten: `1310-1/waende/hitch-*.txt`.
  - Die Probe des Gates baut eigene BundleGroups ohne `regionKey`; `_buendelReihe` fasst nur Region-Bündel an.
  - **Bitte:** das Job-Log lesen (Admin-Rechte) und Gruppe 3 neu starten. Ich nenne es nicht „nicht meins“, bevor das Log
    gelesen ist.

## 6. Nach dem Schnitt: Boot-ABAB, A = main bb554abf · B = torwurf 198e80f3 (je 3 + 3; `1310-1/abab4/`)

12/12 grün, Seiten-Wache per anazhRealm.js-Hash (A 6922c974, B 714da48a).

| Genesis (Median, je Boot) | A main | B torwurf + Reihe | Δ B − A |
|---|---|---|---|
| fps Regler voll | 49,7 (50,8 · 49,7 · 49,7) | **50,1** (50,2 · 50,0 · 50,1) | +0,4 (vor dem Schnitt T − M −2,9) |
| gpu-bank ms (Gier des Orts) | 17,48 | 16,88 | −0,60 |
| Band GPU ms je Frame | 18,97 | 19,20 | +0,23 (vor dem Schnitt +1,24) |
| CPU-Takt p95 voll / frei | 7,6 / 6,2 | 7,2 / 6,0 | −0,4 / −0,2 |
| Befehle / Dreiecke (Band) | 212 / 924k | 172 / 695k | −40 / −230k |
| VRAM MB | 121,6 | 122,7 | +1,1 (die Stufe 3) |

| Wiese (Median) | A main | B torwurf + Reihe | Δ B − A |
|---|---|---|---|
| fps Regler voll | 68,6 | 68,8 | +0,2 |
| gpu-bank Blick 0 / −0,88 ms | 12,47 / 10,49 | 12,48 / 10,52 | +0,01 / +0,03 |
| Band GPU ms | 15,62 | 15,70 | +0,08 |
| CPU-Takt p95 voll / frei | 5,8 / 5,5 | 5,7 / 5,3 | −0,1 / −0,2 |

- **Urteil:** torwurf ist an der Genesis nicht mehr langsamer als main und an der Wiese gleich.
- Die Tor-Ersparnis (Befehle −40, Dreiecke −230k, CPU-Takt p95 −0,4) bleibt.
- Main trägt dieselbe Lotterie. An dieser Genesis stand main zufällig richtig (`@global` vorn). Ein main-Boot mit `@wahl` vorn
  kostet 4,6 fps (s4). Mit dem Schnitt gilt EINE Reihe für jeden Boot und jeden Ort.

## 7. Karte (2), Versuch 1: die Tore in den Bau-Satz — verworfen (`1310-1/karte2/`)

- **Der Versuch:** `BAU_SATZ.gate = "bauSatz"` auf dem Zweig welle-m-e-torsatz ab 198e80f3. Die Tor-Leaves teilen über alle
  Tore wenige Host-Stoffe (ids 171/172/178); die Flügel (`leaf.tuer`) bleiben Instanz-Gruppen.
- **Erster Bruch, laut:** `_satzBlock(f:verkalkt|1|3:0#S): kein Index`. Die Stufe-3-Hülle (porta-core `huelleGeometrie`)
  war eine Dreiecks-Suppe mit 60 Ecken je Sechskant-Kapsel statt 12. Indiziert gebaut (gleiche Dreiecke, gleiche
  Reihenfolge) läuft der Satz.
- **Ergebnis an der Genesis** (B2 gegen A1 torwurf, je ein Boot):
  - Befehle 172 → 161 (bauSatz 28; drachentor/maurentor/verkalkt tragen je noch 8 Flügel-Züge);
  - **GPU 44,4 ms/Frame statt 18,8, 22,4 fps statt 51.**
- **Im Bild** (`A1-torwurf-ring.png` gegen `B2-torsatz-ring.png`) erscheinen die steinernen Rahmen weiß durchscheinend,
  die Portal-Nebel scheinen durch.
  - Vermutete Klasse: Der Satz trägt den Stempel „einzige Nah-Stufe“ der Tore nicht (KETTE OHNE PARTNER, aLodLevel 3), und
    die L0 blendet ab 8 m × Perf aus.
  - Nicht bewiesen, nicht weiter vermessen (Budget).
- **Urteil:** Der Satz-Weg zahlt sich für die Tore nicht aus. 8 der 13 Züge je Tor sind Flügel (4 Flügel × 2 Stoffe), die
  wandern und im Satz nie liegen.
  - An der Genesis liegen die Befehle mit 172 schon unter dem Soll 208. Der offene E-Punkt dort ist CPU-Takt p95 (7,2 > 5,8).
  - Der Hebel der 13 Züge ist der Flügel: EIN Zug je Stoff für alle Flügel eines Tors, mit der Drehung je Flügel als
    Vertex-Index statt als Instanz-Matrix. Das ist ein Wirts-Schnitt, kein Satz-Eintrag.
- Der Versuch liegt als Patch vor (`versuch-1.diff`). Der Zweig welle-m-e-torsatz steht unverändert auf 198e80f3.

## Pflicht-OFFEN Rest

- CI-Gruppe 3: `gate:hitch-telemetrie` rot nach 14 min, lokal grün vor und nach dem Schnitt — Job-Log lesen, neu starten.
- Null-Block 10 in s4 (main): −1,05 fps bei gleicher Bündel-Reihe, ohne Namen.
- Die Zerlege-Posten `bau`/`post` an der Genesis: Abschalten verteuert um 26 ms, die Linse ist dort blind.
- Weitere Session-Lotterien derselben Klasse? Die Lehre aus 1110-6 („bimodal je Sitzung“, S6 hoch in 9 von 10) gehört mit
  `reihenfolge.cjs` noch einmal angesehen.
- Karte (2): 13 Stoff-Züge je Tor. Vermerk: die Tore sind nur wegen der Flügel aus `BAU_SATZ` ausgenommen, der Satz filtert
  `leaf.tuer` schon je Leaf. Danach (3) Dorf-VRAM.

## Status ZWISCHENSTAND + Übergabe

- **Branch** welle-m-e-torwurf, Kopf **198e80f3**, Arbeitsbaum sauber.
  - 0fc1fe3d: Linsen-Fix foundry-crossfade, CI 13/13.
  - 07e1d785: WIP Schalter-Urteil.
  - 198e80f3: die Reihe der Bündel + H7.
- **Werkzeug auf dem OMEN:**
  - `p3/tor/erst`: Schalter-Sitzungen s1–s4, `schalter.cjs` mit null · zwilling-* · fern-march · l0-wirft ·
    global-zuerst / wahl-zuerst / reihe-null.
  - `p3/tor/zerleg`: Zerlegung, `reihenfolge.cjs`.
  - `p3/tor/abab3`, `p3/tor/abab4`.
  - Varianten-Worktrees tw-ohne-zwilling und tw-gesetz (52ac16d8 + eine Zeile, bleiben bis zur Annahme).
- **Nächster Schritt:** Karte (2), die 13 Stoff-Züge je Tor über den Bau-Satz, sobald der Koordinator die CI-Gruppe 3 gelesen
  hat.
