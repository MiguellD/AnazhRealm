# docs/archiv — Abgeschlossene Dokumente (nach Bögen gruppiert)

Hier liegen Dokumente, die ihren Zweck erfüllt haben: **fertige Designs**,
**vollendete Arc-Pläne** und **Audit-Schnappschüsse**. Sie werden **nicht mehr
gepflegt** — sie sind reine Referenz auf den Stand, an dem sie entstanden. (Sie
bleiben physisch getrennt, weil die Chronik in `docs/handover.md` sie je Welle
beim Namen nennt — ein historischer Link, den ein Merge brechen würde.)

Wer den *aktuellen* Stand sucht: die kanonische Landkarte in **`docs/README.md`** →
`CLAUDE.md` (JETZT-Stand + Gotchas), `docs/handover.md` (Chronik + Start),
`docs/state-of-realm.md` (Vision), `docs/roadmap.md` (Plan), `docs/das-lebendige-feld.md`
(der wahre Norden).

---

## Bogen: Das lebendige Feld + die Seele der Welt (V17.33–.50) — VOLLENDET

Die drei Arc-Pläne, die das DRITTE Verb des Feldes (lesen → schreiben → **WERTEN**)
und den Emotion-Kern bauten. Stand-vs-aktuell: alle drei sind umgesetzt; das
LEBENDE Verständnis lebt in `docs/das-lebendige-feld.md`.

| Datei | Was | Stand |
|---|---|---|
| `dsl-weltregeln-plan.md` | DSL-Weltregeln-Arc (Phasen A–E) — von der Gesten-Sprache zu stehenden `Bedingung→Effekt`-Welt-Regeln | **VOLLENDET** (V17.33–.40: Mensch · Nexus · KI schreiben am selben Regel-Satz) |
| `lebendige-wertung-plan.md` | Lebendige-Wertung-Arc (4 Phasen) — das WERTEN via Vorhersagefehler gegen eine gleitende Baseline | **KOMPLETT** (V17.42–.50: lokal-attribuierte Regel-Fitness · Emotion-Appraisal · die Klammer) |
| `emotion-kern-plan.md` | Emotion-Kern-Arc (W1–W5) — wie Gefühl WIRKLICH funktioniert (dimensional · Substanz-Brücke · Fast/Slow · sozial · Abenteuer) | **KOMPLETT in baubarer Tiefe** (V17.45–.49); der W5-Kampf-Affekt wird im `kampf-plan.md` konsumiert |

## Bogen: Der Körper der Welt — Render · Terrain · Tiefe (V14–V17) — VOLLENDET

Die Diagnosen + Pläne, die die Welt-OBERFLÄCHE malerisch machten.

| Datei | Was | Stand |
|---|---|---|
| `render-realismus-diagnose.md` | Die vier Realismus-Hebel (ACES · Post-FX · IBL · PBR), von denen nur ACES bestand | umgesetzt (V17.0–.4 Post-FX-Bogen) |
| `ghibli-tiefe-diagnose.md` | Die malerischen Befunde (Wolken · Bäume · Farbe · Fülle · Strukturen-Kontrast) | geheilt in den V17-Render-/Tiefe-Wellen |
| `tiefe-bogen-plan.md` | Vier Wurzeln (Wolken-Noise · Bäume · Terrain-Makrotextur · Strukturen-Kontrast) | abgeschlossen (V17.10–.13) |
| `lebende-umgebung.md` | GPU-instanzierte Vegetation + Gras-Riese | umgesetzt (V16.1 Gras-Riese · V17.1 Scatter-Vegetation) |

## Bögen: Code- + Test- + Performance-Hygiene — VOLLENDET

| Datei | Was | Stand |
|---|---|---|
| `code-hygiene.md` | V9.44-Stamm-Pflege — sechs verhaltensneutrale Refactoring-Sub-Wellen | abgeschlossen (V9.44-a..f + der V9.56-Bogen 11 Funktionen → 77 Helfer) |
| `playtest-hygiene.md` | V9.52-Playtest-Pflege — `playtest.cjs` 1 Monolith → 41 Band-Funktionen | abgeschlossen (V9.52-a..f) |
| `performance.md` | Performance-Welle-Design (V9.84+) — 3 Code-Audits + 14 Heilungen, geschnitten in Perf-1/2/3 | vollständig abgearbeitet (V9.84–V9.96); aktuelle Perf-Themen im `CLAUDE.md`-Stand |

## Frühe Designs + DSL-Entwurf

| Datei | Was | Stand |
|---|---|---|
| `wave-6-design.md` | Welle-6-Brainstorm (A–H: Interaktion · CAD · Inventar · Stats · Lesbarkeit · Crafting · Welt-Sinne · Kreaturen) | seit V8.23 vollständig umgesetzt |
| `nexus-dsl.md` | Ring-2-DSL-Design (v0.1-Entwurf) — AST-Format, V1-Primitive, Sicherheits-Budgets, Phasen 0–7 | Ring 2 vollständig live; der DSL ist seither auf 41 Ops gewachsen (das Doc ist ein historischer Stand) |

## System-Audits (Schnappschüsse)

| Datei | Was | Stand |
|---|---|---|
| `system-audit.md` | System-Audit V7.71 — Methoden-Inventar, Dead-Code, Vision-Alignment | abgelöst durch `system-audit-v8.25.md` |
| `system-audit-v8.25.md` | System-Audit V8.25 — Methoden-/Verbindungs-/Performance-Bilanz | Schnappschuss; `/audit` erzeugt jederzeit ein frisches |

## Das Lehren-Archiv

| Datei | Was | Stand |
|---|---|---|
| `learnings.md` | Die ungekürzte Sammlung der Session-Learnings der frühen Wellen | die quer-schneidenden Lehren leben kuratiert in `CLAUDE.md/Wichtige Gotchas` + `handover.md/Gotcha-Vollarchiv`; dies ist das volle historische Archiv |

---

Ein Audit ist seinem Wesen nach ein Schnappschuss — sobald die nächste große Welle
ansteht, erzeugt der `/audit`-Slash-Befehl einen frischen Bericht. Der liegt dann
in `docs/` bis er selbst wieder hierher wandert.
