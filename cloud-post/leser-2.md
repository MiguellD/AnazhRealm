# Stand-Blatt Leser 2 (Zweig `leser-2`, Basis origin/leser-2611 66488a26; Stationen gegen punkte-maschine 179fab68)

Je Kandidat eine Zeile: Sprosse · Fehler · Schnitt · Zahl. Ordner `bericht/2611-stationen/<sprosse>/` (Diff · Hand-Skript · betreff.txt · BEGRUENDUNG.txt).

| Sprosse | Fehler | Schnitt | Zahl |
|---|---|---|---|
| `same.kopplung.aufwaerts#1` | Station: liest vor dem Bild-Lauf (k2-zusammenspiel.js:7020) und sofort nach dem Bau (:7045), kein Zeuge der Tat — zählt Drift. **SPIEL:** stamm/feld-leben.js:1899–1900 `_werkAkt` fragt `_grundrissVon(e)` OHNE die Art → vor der Hülle null, der Akt fällt still (Ruf feld-dsl.js:2134); mit der Art trägt das Gesetz ihn beim Bau (ex 3,96 · ez 5,15) | `vor` nach dem Bild; warten (Uhr steht) auf die Zeile `bauen`, Frist 3 s; Zeuge `akt` + Gegenlauf `zurueck`; 2 Attrappen | Spiel heute 0 von 10 Orten, Zeile 0 (3/3; Radeon 2da17e2e 1, f63a69ef 0) ↔ Akt an der Hülle 10 von 10 · Kandidat: heute ROT „keine Tat“ (aktMs 3 018), Mutante „geheilt“ 10 · zurueck 0 · Leiter 7,5–9,8 s (Basis 42,6 kalt) · Proben 2 004/0 falsch · liste Fehler 0 — **kein Buchungs-Kandidat, bis das Spiel heilt** |
| `same.kopplung.gewalt#1` | Station: :8006 fragt `{ koerper: "mars", … }` — seit 23e944ef3 (23.11.) wirft voxel-worker.js:1444 `planetKoerper` „koerper ist kein Objekt (string)“, die Leiter wirft nach 1,2 s (Radeon 1,665 s), 0 von 6 gemessen; vorher maß die Mars-Hälfte still die Erde zweimal. **SPIEL:** kein Blitz — stamm/feld-brand.js:449 `_brandEntfachen` rufen nur kampf.js:2471/2472 und koerper-fahrt.js:2363 | Körper Mars als Objekt in KOERPER_FELDER (NASA: 3 389,5 km · 3,71 m/s² · 24,6597 h · 25,19°; Jahr bleibt 365, pruefJahr); S6-Zeuge `koerperWirkt` + Attrappe „die Erde zweimal“ | 0 → 6 von 6 Sprossen gemessen · koerperWirkt 100/100 · Leiter 1,2–1,4 s warm · 100 Mars ≈ 15–19 s im EINEN Faden (Gerät: nach aufwaerts, Erde warm) · S1 ROT „kein Blitz“ (249 Sturm-Züge, 0 Zündungen) · Proben 2 003/0 falsch · liste Fehler 0 — **kein Buchungs-Kandidat, heilt den Wurf** |
| `erleben.klang.stimme#1` | Station: k2-erleben.js:4867/:4873 der Zensus /sprech\|formant\|murmel\|vokal/ wirft jede Sprosse am neuen Leser — seit 5dcaf8cc7 (24.11.) reicht klang-core.js `stimmFormanten`: S1–S4 werfen, S1 kannte nur „fehlt“ (:4876). **SPIEL:** stamm/klang.js:1004 `_bewohnerLaut` reicht der Stimme `b.genom.sex`, der Leib zeigt das Geschlecht der Gestalt (siedlung-bewohner.js:580/:469), das Gesetz ist an der Gestalt geeicht (klang-core.js:1529) | S1 misst am Abgriff mit `stimmSeite` + PB_BAND/PB_LEIB, zur Laufzeit aus diag-klang-zensus.cjs gelesen: die Leiber der Tafel + jeder Erwachsene mit dem Leib seines Rufs; Zeuge der Weg des Spiels (`_bewohnerLaut` → `rufPuffer` → `rufSpielen`, bit-gleich, gespielt); `mutiert`; S2–S4 werfen nicht an `stimmFormanten`; 2 Attrappen (stumm, zwilling) | 1 → 5 von 5 geurteilt · Leiter 0,1 → 3,0–3,2 s (Deckel 20) · Tafel max 9,0 % (= 5dcaf8cc7) · Spiel 31/31 bit-gleich, 31 gespielt · Erwachsene 7 von 13, max 62,2 % → ROT ↔ Mutante „heil“ 13 von 13, 13,7 % → GRÜN · pubertaet 77,3 ROT (`stimmLeib`) · Proben 2 137/0 falsch · liste Fehler 0, = Basis außerhalb der Stimme-Blöcke — **kein Buchungs-Kandidat, bis das Spiel heilt** |

## Konsum-Beweis der Heilung (Auftrag 04:05) — main eae94514 ↔ buendel-jagd 5551bf64, Wolke, warme Welt, je eigene Welt aus dem Kopf

`grundrissBeimBau · tatBeimBau · tat · orteGeaendert n von 10 · zurueck · orteNachAbbau · aktMs` (s1-hand.cjs spiel ×3, s1-kandidat.cjs ×3):

| Kopf | grundrissBeimBau | tatBeimBau | tat | orteGeaendert | zurueck | orteNachAbbau | aktMs |
|---|---|---|---|---|---|---|---|
| main eae94514 | false (3/3) | 0 | 0 | 0 von 10 (3/3 s1-hand, 3/3 Kandidat) | — (kein Akt) | 0 | 3 010 · 3 002 · 3 006 (Frist, ROT „der Bau wurde keine Tat“) |
| 5551bf64 | true (3/3) | 1 | 1 | **10 von 10** (3/3 s1-hand, 2/2 warme Kandidat-Läufe) | **0** | 0 | 0 · 0 (der Akt steht beim Bau, vor der Hülle) |

**Ausgang 1: 10 von 10, zurueck 0** → aufwaerts1 trägt an 5551bf64. lebendig Δ −0,073 (60 m) … −0,011 (1 000 m), nach dem Abbau 0 von 10.
Kalt (die Folge steht nicht, `_feldFolgeSteht` false): der Akt wartet in der Folge des Felds — s1-hand ohne Takte liest dann tat 0
(3/3), der Kandidat nennt es UNGEMESSEN beim Namen („der Akt des Baus in der Folge des Felds …“, `__rafferKurz`), nie ROT, nie grün.
Kein Wurf des neuen `_werkAkt`-Bruchs (feld-leben.js:1900–1903) in 30 Bauten per Satz an 5551bf64 (s1-hand 6, Kandidat 3, Abriss 2 × 10, Zerlegung 1).

**Abriss** (abriss-hand.cjs 10: Satz `spawn_studio haus`, Hülle, Satz `remove_architecture`, feld-dsl.js:1307):

| Kopf | Zeilen `bauen` | Zeilen `abriss` | Würfe |
|---|---|---|---|
| main eae94514 | 0 von 10 | 9 von 10 (1 ohne Hülle bei Fristende → kein Grundriss → kein Akt) | 0 |
| 5551bf64 | 10 von 10 (je 25 ms) | 10 von 10 (sofort) | 0 |

Nebenbefund an main: 9 Zeilen `abriss` zu 0 Zeilen `bauen` — der Abriss liest den Grundriss nach der Hülle, der Bau davor; an 5551bf64
paarweise. Probe-Fehler unterwegs, benannt: der erste Abriss-Lauf zählte 0 von 10 an beiden Köpfen, weil meine Probe den Mess-Halt
(`_messHalt`, weatherEffectTime < 0) um `remove_architecture` nicht löste — das DSL hielt den Welt-Akt („weltakt_gehalten“); berichtigt.

Status ZWISCHENSTAND. Karte 2 gebucht 120 von 1 718.
