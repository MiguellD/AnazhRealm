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
| `code-hygiene.md` | V9.44-Stamm-Pflege-Plan — sechs verhaltensneutrale Refactoring-Sub-Wellen a–f (Persistenz-Schema, kanonische Setter, Mesh-Router-Dispatch, Konstanten, UI-Giganten, Game-Loop-Phasen) | der Bogen ist mit V9.44-a..f abgeschlossen. Die benannte Rest-Grenze (~7 Kontrollfluss-Funktionen >200 Z.) lebt als „zweiter Code-Hygiene-Bogen" in `roadmap.md` §1 weiter |
| `system-audit.md` | System-Audit V7.71 — Methoden-Inventar, Dead-Code, Vision-Alignment | Schnappschuss, durch `system-audit-v8.25.md` abgelöst |
| `system-audit-v8.25.md` | System-Audit V8.25 — vollständige Methoden-/Verbindungs-/Performance-Bilanz | Schnappschuss; ein frisches Audit erzeugt `/audit` jederzeit neu |

Ein Audit ist seinem Wesen nach ein Schnappschuss — sobald die nächste große
Welle ansteht, erzeugt der `/audit`-Slash-Befehl einen frischen Bericht. Der
liegt dann in `docs/` bis er selbst wieder hierher wandert.
