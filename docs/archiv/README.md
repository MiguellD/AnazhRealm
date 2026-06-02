# docs/archiv — Abgeschlossene Dokumente

Hier liegen Dokumente, die ihren Zweck erfüllt haben: **fertige Designs** und
**Audit-Schnappschüsse**. Sie werden **nicht mehr gepflegt** — sie sind reine
Referenz auf den Stand, an dem sie entstanden.

Wer den *aktuellen* Stand sucht: `CLAUDE.md` (Projektgedächtnis, kanonische
Versions-Historie), `docs/handover.md` (Erstorientierung), `docs/state-of-realm.md`
(Tiefe), `docs/roadmap.md` (Vorwärts-Plan).

| Datei | Was | Warum archiviert |
|---|---|---|
| `wave-6-design.md` | Welle-6-Brainstorm (A–H: Interaktion, CAD, Inventar, Stats, Lesbarkeit, Crafting, Welt-Sinne, Kreaturen) | Welle 6 ist seit V8.23 vollständig umgesetzt |
| `nexus-dsl.md` | Ring-2-DSL-Design (v0.1-Diskussionsentwurf) — AST-Format, V1-Primitive, Control-Flow, Sicherheits-Budgets, Phasen-Plan 0–7 | Ring 2 ist mit Phase 1–7 vollständig live (`roadmap.md` §3 „Akzeptanz Ring 2 vollständig"); der Entwurf hat seinen Zweck erfüllt. Hinweis: der DSL ist seither auf 41 Ops gewachsen — das Doc ist ein historischer Stand, kein lebender Index |
| `code-hygiene.md` | V9.44-Stamm-Pflege-Plan — sechs verhaltensneutrale Refactoring-Sub-Wellen a–f (Persistenz-Schema, kanonische Setter, Mesh-Router-Dispatch, Konstanten, UI-Giganten, Game-Loop-Phasen) | der Bogen ist mit V9.44-a..f abgeschlossen; der zweite Bogen (V9.56-a..k, 11 Funktionen → 77 Helfer) ist ebenfalls durch (`roadmap.md` §1) |
| `playtest-hygiene.md` | V9.52-Playtest-Pflege-Plan + Akzeptanz — `playtest.cjs` 31 k → 29.5 k Z., 1 Monolith → 41 Band-Funktionen + 5 Helfer, Median-Einrückung 20 → 8 | der Bogen ist mit V9.52-a..f abgeschlossen (§6/§7-Akzeptanz erfüllt) |
| `performance.md` | Performance-Welle-Design (V9.84+) — drei Code-Audits (Game-Loop-Allokationen, Voxel-Chunk-Build, Renderer) + 14 priorisierte Heilungen, geschnitten in Perf-1/2/3 | vollständig abgearbeitet (Perf-1 V9.84 + Perf-2 V9.85 + Perf-3 V9.87–V9.92 + V9.96 Spawn-Budget; das Doc trägt das Postscript „vollständig abgearbeitet"). Aktuelle Perf-Themen leben im `CLAUDE.md`-Stand + `roadmap.md` |
| `learnings.md` | Gesammelte Session-Learnings — das volle historische Lehren-Archiv der frühen Wellen | die quer-schneidenden Lehren leben kuratiert in `CLAUDE.md/Wichtige Gotchas` + `docs/handover.md/Gotcha-Vollarchiv`; dieses Doc ist die ungekürzte Sammlung |
| `system-audit.md` | System-Audit V7.71 — Methoden-Inventar, Dead-Code, Vision-Alignment | Schnappschuss, durch `system-audit-v8.25.md` abgelöst |
| `system-audit-v8.25.md` | System-Audit V8.25 — vollständige Methoden-/Verbindungs-/Performance-Bilanz | Schnappschuss; ein frisches Audit erzeugt `/audit` jederzeit neu |
| `render-realismus-diagnose.md` | Render-Realismus-Diagnose — die vier Hebel (ACES-Tone-Mapping · Post-FX · IBL · PBR), von denen nur ACES bestand | der Render-Realismus-Bogen (V17.0 Post-FX · V17.1 Fülle · V17.2 Wolken · V17.3 Farbe · V17.4 Bewegung) ist umgesetzt |
| `ghibli-tiefe-diagnose.md` | Ghibli-Tiefe-Diagnose — die malerischen Befunde (Wolken · Bäume · Farbe · Fülle · Strukturen-Kontrast) | die Befunde sind in den V17-Render-/Tiefe-Wellen geheilt |
| `lebende-umgebung.md` | Lebende-Umgebung-Bogen-Design — GPU-instanzierte Vegetation + Gras-Riese | umgesetzt (V16.1 Gras-Riese · V17.1 artenreiche Scatter-Vegetation) |
| `tiefe-bogen-plan.md` | Tiefe-Bogen-Plan — vier Wurzeln (Wolken-Noise · Bäume · Terrain-Makrotextur · Strukturen-Kontrast) | abgeschlossen (V17.10 Wolken · V17.11 Bäume · V17.12 Triplanar · V17.13 Unsharp-Mask) |
| `dsl-weltregeln-plan.md` | DSL-Weltregeln-Arc-Plan — von der Gesten-Sprache zu stehenden `Bedingung→Effekt`-Welt-Regeln (Phasen A–E) | **VOLLENDET** (V17.33–.40: Mensch · Nexus · KI schreiben am selben Regel-Satz; das `rule`-Primitiv, Feld-Kopplung, Nexus-Evolution, Mensch-Regeln, Persistenz/Merge). Der lebende Regel-Satz steht; aktuelle DSL-Themen leben im `CLAUDE.md`-Stand + den Gotchas |
| `lebendige-wertung-plan.md` | Lebendige-Wertung-Arc-Plan — das DRITTE Verb (WERTEN) via Vorhersagefehler gegen eine gleitende Baseline (4 Phasen) | **KOMPLETT** (V17.42 Wohl-Maß · V17.43 lokal-attribuierte Regel-Fitness · V17.44 Emotion-Appraisal · V17.50 die Klammer: die Welt lernt ökologisch, was den Spieler freut). Die Anti-Gaming-Lehre lebt in den Gotchas |
| `emotion-kern-plan.md` | Emotion-Kern-Arc-Plan — wie Gefühl WIRKLICH funktioniert (W1 dimensional/Fusion · W2 Appraisal-Brücke/Hylomorphismus · W3 Fast/Slow-Stimmung · W4 Sozial · W5 Abenteuer) | **KOMPLETT in baubarer Tiefe** (V17.45–.49). Der W5-Kampf-Affekt-Hook wird im aktiven Kampf-Bogen konsumiert (`docs/kampf-plan.md` §F, V17.54) |

Ein Audit ist seinem Wesen nach ein Schnappschuss — sobald die nächste große
Welle ansteht, erzeugt der `/audit`-Slash-Befehl einen frischen Bericht. Der
liegt dann in `docs/` bis er selbst wieder hierher wandert.
