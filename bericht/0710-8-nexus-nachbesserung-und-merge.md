# Bericht 0710-8 — Nachbesserung welle-m-nexus und Merge mit integ-probe (OMEN)

**Zwischenstand.**
- **Geschnitten:**
  - Beide roten Punkte der Gegenprüfung sind behoben, jeweils mit einer Linse, die vorher rot war.
  - Gelb: eine AST-Wand gegen Schreiber der Boxen und `gate:blocker-netz --selftest`.
  - Der Fernwald-Wackler ist benannt, die Linse geschärft.
  - Der Tier-Leib fragt dieselbe Nachbarschaft.
  - origin/integ-probe ist an allen 7 Stellen nach Semantik gemergt, der stille Zwilling in der Churn-Linse ist gefallen.
- **Gemessen:** Tier-Leib an der Wiese 1 589 → 8 angefasste Einträge je Neubau. Die Marken-Probe war vorher bei 17 von 20 Strahlen rot, jetzt bei 0. Die Werkzeuge des Spielers lagen vorher 0,33 rad neben ihrem Dorf, jetzt 0. Der gemergte Stand hat 0 Abweichungen in allen Orakel-Runden.
- **Offen:** Der volle Playtest ist auf integ-probe und damit auch auf dem gemergten Kopf rot. Grund ist ein Test-Stub, der seit dem integ-probe-Merge 74f3a2c0 nicht mehr trägt; er ist benannt, und mit einem Vorschlag in einer Zeile ist der Kopf lokal grün. Die CI von dc877d19 läuft.

| | |
|---|---|
| Branch / Kopf | `welle-m-nexus`, **`dc877d19`** |
| Merge | origin/integ-probe `af3ff253` |
| CI | a0d53ab2 grün (37746903637); dc877d19 läuft (37751427843) |
| Voller Playtest auf dem Kopf | ROT wie integ-probe af3ff253 selbst (22 Invarianten, dieselbe Liste) — Täter unten; mit dem Stub als echtem Object3D lokal „Alle Invarianten OK“ (153 s) |

| Commit | Inhalt |
|---|---|
| `e062eb8b` | Fernwald-Linse: der Tausch weckt, A zählt nach einem Gang des Culls |
| `cef16f72` | der Tier-Leib fragt seine Plätze |
| `969aaad6` | ROT 2: die Werkzeuge des Spielers verlangen |
| `4b97d1d4` | ROT 1: der Frage-Zähler läuft weiter |
| `a0d53ab2` | Box-Wand und `--selftest` |
| `dc877d19` | Merge integ-probe |

## ROT 1 — der Frage-Zähler (`4b97d1d4`)

**Befund:** `_blockerNetz` baute beim Neubau `frage: 0`, die Einträge behielten ihre alte Marke. Erreichte der neue Zähler eine alte Marke, übersprang die Frage den Eintrag.

**Schnitt:** `frage: alt ? alt.frage : 0`, wie bei `seq`.

**Linse:** die Marken-Probe in der Runde „Neues Array“, je alte Marke ein Eintrag (bis 24, entdoppelt).
1. Den Zähler bis vor die Marke vorzählen.
2. Senkrecht auf die oberste Box des Eintrags zielen.
3. Gegen das Orakel prüfen.

| | Abweichungen | Beispiel |
|---|---|---|
| Vorher (969aaad6) | 17 von 20 | `brunnen_dorf#31`, Marke 10 685: soll t = 0,5405, ist 1 |
| Nachher | 0 von 19 | 0 vorgezählt: der Zähler steht hinter jeder alten Marke |

## ROT 2 — die Werkzeuge des Spielers (`969aaad6`)

**Befund:** `_spielerVerlangt` kannte nur `human` und `llm:*`. Drei Wege des Spielers fehlten: Fähigkeit per Taste (`ability:`), Wirken (`capability:`) und Verzehr (`consume:`).

**Schnitt:** EINE Liste `AnazhRealm.SPIELER_QUELLEN` (`llm:`, `ability:`, `capability:`, `consume:`) neben `human`.

**Linse** gate:settlement C7, erweitert:
- je ein Dorf aus den drei Quellen muss auf sein Dorf schauen;
- ein Dorf eines Mitspielers muss den Blick stehen lassen.

| | Fähigkeit, Wirken, Verzehr | Nexus, Mitspieler |
|---|---|---|
| Vorher | 0,33 rad neben dem eigenen Dorf | Gier unverändert |
| Nachher | 0,000 rad | Gier unverändert |

## GELB — die Box-Wand (`a0d53ab2`)

`boxWand` arbeitet auf dem AST (acorn), je Methode.
- (a) Eine Zuweisung an `.blockerAABBs` ist nur erlaubt, wo die Methode `_blockerStampReach` ruft, und als `null` nur mit `_blockerAustritt`.
- (b) Kein Schreiben IN die Boxen: Feld, Index, `++`/`--`, `delete`, push, pop, shift, unshift, splice, sort, reverse, fill, copyWithin, Object.assign. Das gilt an `.blockerAABBs`, an einem Element davon oder an einem daran hängenden Namen (Bindung, for-of, Index, find/filter/slice).
- Grenze benannt: Ein Parameter, der eine Box empfängt, hängt für die Wand an nichts.
- `--selftest` läuft in `npm run check`: Der Stamm ist sauber (6 Zuweisungen, jede gestempelt). Fünf eingeschleuste Schreiber fallen rot beim Namen, ein gestempelter bleibt grün.

## GELB — der Fernwald-Wackler (`e062eb8b`, schon vor diesem Auftrag)

Selbsttest 1 tauschte `_archKartenPreset` ohne Weckruf. Ruhte die Stand-Wache in den 30 festen Takten, ging der Cull nie, und A blieb grün.

Der Selbsttest ist ein Schreiber und trägt jetzt seinen Weckruf (`_weltRegt` nach Tausch und Rücktausch). A zählt erst nach einem gezählten Gang des Culls, höchstens 120 Takte; geht er nie, wird das beim Namen rot.

Der Rerun deines CI-Laufs ging grün, lokal 4 von 4.

## Der Tier-Leib (`cef16f72`)

**Schnitt:**
- Der Platz (Position ± Reichweite) ist der zweite Schlüssel derselben Nachbarschaft, für jeden Eintrag, auch ohne Boxen.
- Beweger melden sich (`_blockerBewegt`): der Reiter-Schritt an zwei Stellen und nach dem Merge der rutschende Wagen.
- Der Tier-Leib fragt `_blockerUmPlatz` und stellt dieselbe Probe je Eintrag.

**Linse (N):** 3 600 Nähe-Listen gleich dem Orakel, auch mit einem Beweger. Vorher ROT: die Frage fasste den ganzen Bestand an, der Beweger war nicht gemeldet.

**ABBA an der Wiese:** angefasste Einträge je Neubau 1 589 → 8, `_kreaturHuellenKontakt` 0,10 → 0,08 ms je Takt; der CPU-Takt bleibt im Rauschen.

## MERGE mit integ-probe (`dc877d19`)

| Stelle | Auflösung |
|---|---|
| Absicht | Der Flag-Zwilling `orientieren: !/^remote/` und `eigen` fallen. Es gilt NUR `verlangt` + `_spielerVerlangt`, auch für „… steht vor dir“. `blick` (Anker des Sprechers) bleibt: das ist Platzierung. |
| Dorf-Mitte | `_spawnSettlementSlot` gibt das gesetzte Haus zurück. `res.mitte`/`res.haeuser` summieren, wo jedes Haus steht, Ersatz-Orte eingeschlossen. `_nachDorfOrientieren(res, verlangt)` liest nur sie. Der Kreis um `anchor.mitte` fällt (er fing Nachbar-Häuser); ohne gesetztes Haus dreht kein Blick. |
| `_fieldRaycast` | Die Netz-Schleife trägt `durchPflanzen && bx.pflanze`. |
| `_baumWeltSkala` | Bleibt (integ-probe), vor der Beschreibung des Box-Schreibers. |
| `_stepCharacterStructures` | Vereint `huelle.eigen`, `huelle.quelle`, `quellen.push` und die Netz-Nachfrage, EIN Paar `vorX/vorZ`. `quelle` liest nur der Schub selbst, die Lösung ist byte-gleich. |
| rutschender Wagen | `_fahrNachlauf` schreibt x/z und meldet sich als Beweger. |
| stiller Zwilling | `diag-idle-gpu-churn.cjs` überschrieb `r.dslEval` unter der Bühne. Er fällt zugunsten von `_messHalt` und `__weltaktSpion`: gehalten beim Namen, durchgelaufen kippt die Bühne, der Selbsttest liest dasselbe Buch. |

Die Orakel der Linse ziehen nach: Pflanzen-Strahlen, `eigen`/`quelle`/`quellen`, verglichen auch `schubQuelle` und die Sammlung. Auf dem gemergten Stand: 7 200 Strahlen, 4 800 Körper, 3 600 Listen, 13 Marken-Proben, 0 Abweichungen.

**Wände des Merges:** check (mit ci-deckung), lint, format:check, blocker-netz (mit `--selftest`), weltakt-wache, wetter-wache, settlement (C7), fernwald, fahr-leben, vehicle-drive, kampf-gefuehl, ankunft, werkstatt-weg, gpu-lens (und `--selbsttest-programm`: der Welt-Halt hielt das Dorf), tier-separation, v1-pfad, playtest:fast, haus-welt — alle grün.

## Offen

- **Der volle Playtest auf integ-probe ist rot.** Auf af3ff253 allein sind es 22 Invarianten, auf cda4a67a dieselben.
  - Bisect von c966b9c3 (gut) bis cda4a67a: der erste schlechte Commit ist **74f3a2c0** („welle-lf-werkstatt in integ-probe“). Beide Eltern (ac39a2b7 welle-m-impuls, e4e9cc66 welle-lf-werkstatt) sind gut, der Fehler entsteht erst im Zusammenspiel.
  - Täter: Der Test „Multi-User-Bau-Sync“ in `scripts/playtest.cjs` (~:14045 und ~:14068) stellt `buildMode.phantomMesh` als bloßes Objekt `{ position: {…} }` hin. `_clearBuildMode` entsorgt das Phantom über `_disposeSoulGroup` → `TypeError: group.traverse is not a function`, ausgelöst vom Escape-Handler. Die Seite wirft, 21 folgende Tests scheitern am selben Fehler.
  - Vorschlag (Test, nicht Spiel): Der Stub wird ein echter `THREE.Group` mit Position. `_disposeSoulGroup` bleibt fail-closed.
  - Lokal auf dc877d19 mit diesem Stub: „Alle Invarianten OK“. Ich habe die Änderung nicht committet, weil die Zeile integ-probe gehört; sonst entsteht beim nächsten Merge ein Konflikt.
- **CI dc877d19** (37751427843) läuft; Reruns bei apt- oder Deckel-Abbrüchen gehen über dich.
