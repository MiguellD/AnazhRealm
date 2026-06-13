# Der Wellen-Synthese-Plan — VOLLENDET

**Status: ABGESCHLOSSEN am 13.06.2026.** Die zwei Schwestern (`clever-gauss-nuh9lq`
und `determined-tesla-oz2edw`) sind als ein Stamm zusammengeführt. **20 Commits
über 8 Wellen, alle Mess-Wände grün** (inkl. 31 spezifische Λ-Klassifikations-
Wände + 5 portierte Λ-Diag-Skripte als Browser-Audit-Brücke; zwei Reviewer-
Audits haben den Stand vertieft).

Die volle Plan-Datei mit allen Sub-Wellen, der Hunk-Karte, den Code-Synthesen, den
Risiken (9 dokumentiert, alle Mitigationen geprüft) und der permanenten Lehre lebt
jetzt im Archiv:

→ **[`docs/archiv/wellen-synthese-plan.md`](archiv/wellen-synthese-plan.md)**

## Schluss-Bilanz

| # | Welle | Commit | Substanz |
|---|-------|--------|----------|
| 0 | Plan-Verankerung + 4 Schöpfer-Deltas | `abd1891` | Lese-Anker, §14.8 + §14.9 |
| 1 | V18.180-FIX (5 Wunden) | `56763a9` | revokedKeys-Map · _streamRng · _hydroWaterLevelAt fort · Skip-Gate-Wand |
| 2 | V18.180-merge-W (tesla) | `332f9e7` | Auto-merged: W-E/W-F/W-G/W-H/W3/W6, +2360/-313 |
| 3a/b/g | Konstanten + Profil-Synthese | `2b2bb3f` | INSTANCE_TINT + AERIAL + 12-Feld _substanceResponseProfile |
| 3c+d | Λ.1 livingCenterY + Λ.2 Tint | `739ce4c` | _isBodyShaped vertieft, HISM instanceColor |
| 3g | AAA-Sonnen-Halos | `536f7d9` | 3 pow-Kaskaden + 4. Cumulus-Oktave |
| 3e | Λ.5 Mischwald-Synthese | `63e44e5` | 12 neue Baupläne + switch-case-TREE_VARIANTS |
| 3f | Λ.3 Wind-Sway | `d8aba10` | positionNode-Sway aus wiegen-Antenne |
| 3h | Γ1-Lesart-4 + Worker-Mirror | `332c144` | DER BODEN ATMET, bit-identisch |
| 3i | Γ4 + Γ4.2/4.4 + Γ4½ | `b77d9e6` | Massiv/Tal/Becken + Ridge-Noise + Slope/Rock-Feldern |
| 4 | V18.182-Painterly-Mischwald | `a458e31` | Birke/Erle/Buche 7-Layer-Krone (PFLICHT) |
| 5 | V18.183-Hygiene-Konsolidierung | `1fbd6d1` | CLAUDE.md + handover + Plan-§15 sync (Welle-0-4-Stand) |
| 6+9+10 | Test-Härtung + Atlas + Archivierung | `020570d` | Bilanz-Sicht + docs/archiv/ |
| **R1** | **V18.185-Reviewer-Heilung** | **`7b8c636`** | **AERIAL-Doppel-Define-Bug + 5-Wand-Regression-Schutz** |
| **R2** | **V18.186-Plan-Vollendung** | **`99d3d11`** | **Λ.6 Backlit + Λ.4 Per-Achsen-Scale + 6 eigenständige Λ-Bänder** |
| **R3** | **V18.187-Welle-11-Vertiefung** | **`e87a2f8`** | **12 echte Streu-Geometrien (V18.176) + Λ.4 instanceColor (V18.174) + Λ.1 Role-Cache-Migration (V18.176) + 5 Λ-Diag-Skripte portiert** |

### Reviewer-Audit (V18.185 + V18.186) — die drei stillen Lücken geheilt

Nach der "Welle-0-10"-Bilanz fand ein externer Review (V18.185-Befund) drei
Plan-Verluste, die mein "alles abgehakt" verdeckte:

| Reviewer-Befund | Heilung | Wand |
|---|---|---|
| AERIAL-Doppel-Define (static get vs Top-Level — Getter überdeckt LAUTLOS in non-strict mode) | static get gestrichen, eine Quelle | `checkBandV18177AAA` — 5 Live-Wände, Source-Probe mit Kommentar-Strip |
| Λ.6 Translucency komplett verlagert | subsurface back-lit als output-seitiger Glow für `responseProfile.detail > 0.4` | `checkBandLambda6Detail` — 4 Wände (laub/glas/stein/Source) |
| Λ.4 Streu-Varianz komplett verlagert | per-Achsen-Skalierung (sx/sy/sz statt uniform scale) für wind-Arten | `checkBandLambda4Streu` — 2 Wände (Build + Consumer) |
| 7 spezifische Λ-Bänder fehlen (Plan §7.1) | alle 7 als eigenständige async functions im Test-Runner | 27 Wände total über die 7 Bänder |

## Wo die SUBSTANZ jetzt lebt

- **CLAUDE.md "Aktueller Stand"** trägt die Kurzform der Synthese + die 9 permanenten Lehren (inkl. die 3 Reviewer-Lehren).
- **`docs/archiv/handover.md` Versions-Chronik** hat den vollen Welle-für-Welle-Eintrag.
- **`docs/archiv/wellen-synthese-plan.md`** ist die volle Plan-Datei (Hunk-Karte, Konflikt-Analyse, Code-Synthesen) — die nächste Session, die eine Branch-Synthese braucht, liest sie als Vorbild.

## Was offen bleibt

Alle offenen Wellen + Schöpfer-Entscheide + die Reihenfolge leben jetzt in **`docs/aktiv.md`**
(DER EINE PLAN). Hier nur die zwei Reste, die direkt aus der Synthese folgen:

- **Schöpfer-Browser-Sign-off** — das ganze Werk im Browser anschauen: der Wald-Wow nach Welle 4, die AAA-Atmosphäre mit den korrekten Werten 0.75/0.14, der Boden atmet bei genVersion ≥ 2, das Massiv ~700 m vom Spawn, die Wiese mit 12 echten Vegetations-Varianten + pro-Halm-HSL-Tint. Die 5 portierten Λ-Diag-Skripte (`diag-fischer-wand` · `diag-lambda-volltiefe` · `diag-lambda4` · `diag-lambda4-tag` · `diag-lebendige-welt`) sind die Werkzeuge.
- **Welle 7 (Worker-Mirror-Breitung)** — V9.89-Test um 32 Sample-Chunks erweitern (~1.6 s Playtest-Kost, vertretbar). Aktuell prüft der Test 1 Sample-Punkt; eine Breitung würde Drift an unbekannten Worldgen-Positionen fangen.

## Die 9 permanenten Lehren

1. `if (api.exists)`-Skip-Gates können eine kritische Wand 50+ Versionen still durchführen — strukturelle audit:strict-Wand verhindert neue Gates.
2. `Object.assign({}, map)` liefert `{}` (Properties nicht enumerable) — `new Map(map)` ist die Wahrheit.
3. `cherry-pick --theirs` für playtest.cjs überschreibt Heilungen — HEAD wiederherstellen + nur NEUE Test-Blöcke einfügen.
4. tesla-Rename `_applyAerialOutput` → `_applySubstanceResponse` war nicht mit-gewandert — silent failure via safeEvaluate → null.
5. Zwei Heilungen auf der gleichen Funktion (Λ.1 + V17.69 für stein-tempel) brauchen ODER-verknüpften Test-Mechanism.
6. Saat behält man bei Begründung im EIGENEN Kommentar (Plan §6.3 vs CLAUDE.md `_archInstanceUpdate`).
7. **(Reviewer-Lehre)** Ein `static get X()` ohne Setter ÜBERDECKT JEDES Top-Level-`Klasse.X = ...`-Assignment LAUTLOS in non-strict mode (Node-verifiziert). Source-Probe-Wand MUSS Kommentare strippen (sonst fängt sie sich selbst).
8. **(Reviewer-Lehre)** Test-Seeds für Bit-Band-Patterns brauchen volle Bit-Breite — kleine Seeds (i × 7919 < 2²¹) treffen das obere Band nie → konstante σ=0. Hash-Spreizung (Knuth-Multiplikation 2654435761) ist die saubere Form.
9. **(Reviewer-Lehre)** Ein Audit mit fremden Augen fängt stille Bugs, die der Bauende per Konstruktion nicht sieht. Mess-Wand auf LIVE-Werten (nicht Source-Strings) ist die strukturelle Antwort.
10. **(Reviewer-Lehre 2 — V18.187)** Ein ZU SCHMALES Test-Band gibt FALSCHE Sicherheit. V18.186's `checkBandLambda4Streu` prüfte nur die V18.175-Skalierung, der Commit sagte aber „Λ.4 drin" — eine von drei V18.174-V18.176-Stufen, das Reflexions-Lauf-Wort log durch Reduktion. Plan-Wortlaut nennt N Stufen → Test-Band MUSS N Wand-Klassen tragen, nicht nur die zuletzt gebaute Stufe. Eine „abgehakt"-Aussage VOR dem Commit gegen ALLE Plan-Stufen abgleichen.

---

_Die zwei wurden eins, weil die Synthese eine STRUKTUR trägt, nicht beides. Tesla = Knochen, clever-gauss = Sehnen. Die Sehnen an die Knochen — nicht die Knochen an die Sehnen._

_Vollendet 13.06.2026 — und vom Reviewer-Audit zwei Stunden später vertieft._
