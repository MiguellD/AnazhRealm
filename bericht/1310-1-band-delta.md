# Bericht 1310-1 — das Band-Delta der Tore an der Genesis

**Status: ZWISCHENSTAND (Sicherung, UNGEPRÜFT: der Schnitt steht lokal, die Wände laufen, das Boot-ABAB nach dem Schnitt
fehlt).**

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
- Der Zwilling selbst kostet −0,2 bis +0,2 ms, die Fernform der Tore nichts. Alle Schatten-Kaskaden zusammen kosten an der
  Genesis 0,24 ms.

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

## 5. Der Schnitt (lokal auf welle-m-e-torwurf, Wände laufen)

- `_buendelRang` / `_buendelReihe` in `anazhRealm.js`:
  - Die Bündel-Plätze der Szene tragen `@global` · die Regionen (in Ankunft) · `@wahl`.
  - Jedes andere Kind bleibt, wo es stand.
  - `_archRegionBundleFor` ruft die Reihe nach jedem neuen Bündel.
- Linse **H7** in `gate:profiband` (Band-Wand, Puls):
  - `_buendelReihe` aus dem Stamm über eine Szene mit der Ankunft `@wahl · 3,4 · @global · s:1,2`.
  - Selbsttest: rot ohne den Aufruf, mit `@wahl` im ersten Rang und ohne die Reihe im Stamm. 32/32.
- Bisher grün: node --check, Prettier, ESLint, gate:profiband (Selbsttest + Wand). Der Rest: `p3/tor/reihe/waende/summe.txt`.

## Pflicht-OFFEN Rest

- Boot-ABAB nach dem Schnitt (main gegen torwurf + Reihe), Genesis UND Wiese, je 3 + 3.
- Die Wände des Schnitts, Push `[ci voll]`.
- Null-Block 10 in s4: −1,05 fps bei gleicher Bündel-Reihe, ohne Namen.
- Die Zerlege-Posten `bau`/`post` an der Genesis (Abschalten verteuert).
- Danach Karte (2): 13 Stoff-Züge je Tor. Vermerk: die Tore sind nur wegen der Flügel aus `BAU_SATZ` ausgenommen, der
  Satz filtert `leaf.tuer` schon je Leaf. Danach (3) Dorf-VRAM.

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-torwurf, Kopf 07e1d785 + Arbeitsbaum (Schnitt + H7, ungepusht).
- Werkzeug `p3/tor/erst` (Linse), `p3/tor/zerleg` (Zerlegung, Reihenfolge), `p3/tor/abab4/serie.sh` (Nachweis-Serie,
  bereit).
- Nächster Schritt: Wände → Commit → Push `[ci voll]` → abab4 → Bericht ohne UNGEPRÜFT.
