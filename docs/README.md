# docs/ — die Landkarte aller Dokumente

**Dies ist die EINE kanonische Doc-Landkarte.** `README.md` (Projekt-Wurzel) und der
`CLAUDE.md`-Kopf zeigen hierher, statt die Liste zu duplizieren. Wer ein Dokument
sucht, findet hier die Route — nach Zeit-Ebene des Wissens geordnet.

Drei Heimaten für drei Zeit-Ebenen (die Doku-Disziplin):

- **JETZT** — was gilt: Stand, Gotchas, Konventionen → `CLAUDE.md` (auto-geladen).
- **DIE CHRONIK** — die volle Wellen-Historie → `docs/handover.md`.
- **DER PLAN** — was vorwärts kommt → `docs/roadmap.md`.

---

## Tier 0 — die Einstiege (hier anfangen)

| Datei | Was | Wann lesen |
|---|---|---|
| **`CLAUDE.md`** | Projektgedächtnis — kompakter JETZT-Stand + die quer-schneidenden Gotchas. Wird bei jeder Session auto-geladen. | Immer zuerst (passiert automatisch). |
| **`docs/handover.md`** | **Die Chronik + Erstorientierung** — der Start-Kopf (heilige Gesetze, Rhythmus, bewährte Muster) + die volle Wellen-Historie (jüngste oben) + das Gotcha-Vollarchiv. | Beim Erwachen den Start-Kopf; die Chronik bei Bedarf durchsuchen. |
| **`README.md`** (Wurzel) | Die öffentliche Tür — Was/Schnellstart/Tests/Heilige Lektion. | Für den ersten Blick aufs Projekt. |

## Tier 1 — die lebendigen Anker (immer aktuell gepflegt)

| Datei | Was | Wann lesen |
|---|---|---|
| **`docs/state-of-realm.md`** | **Die Vision** — die fünf Pfeiler aus den Testamenten, die Heilige Lektion, die Stand-vs-Vision-Matrix. | Bei „wohin will das Projekt?" / Zweifel an der Richtung (§2). |
| **`docs/roadmap.md`** | **Der Plan vorwärts** — oben der reconciled `OFFENE FÄDEN`-Backlog (A Crafting · B Kampf · C Fundament · D Vision), darunter die Ring-Struktur + Detail-Chronik. | Bei „was kommt als Nächstes?". |
| **`docs/das-lebendige-feld.md`** | **DER WAHRE NORDEN** — die Welt als EIN lebendiges Feld, das alle lesen · schreiben · WERTEN. Wo die Vision driftete, der geniale Twist, die dunklen Flecken. | **ZUERST** vor jeder Arbeit an „lebendiger Welt / Emotion / Nexus / DSL / Kreaturen". |

## Tier 2 — die aktiven Pläne (laufende Bögen)

| Datei | Was | Wann lesen |
|---|---|---|
| **`docs/kampf-plan.md`** | **DER AKTIVE BOGEN** — Kampf + Interaktion + der vereinte Schöpfungs-Fluss + die Resonanz-Vereinheitlichung (§11). Kern-Loop + W1–W3 + S1–S11 + R1–R3/S10 GEBAUT; offen: Browser-Audit · Phase E · S6-B · S9 · S11. | **ZUERST** vor jeder Arbeit an „Kampf / Waffen / Werkzeug / Rüstung / Trank / Avatar / Abbauen / Werkstatt / Schmieden / Crafting / Bauplan-Teilen". |
| **`docs/world-portal-w18-plan.md`** | **W18 — in fremden Welten LEBEN** (Ko-Präsenz-Injektion in Single-Player-Fremdwelten, die Input-Brücke, das Leben/Swappen). | **ZUERST** vor jeder W18-/Portal-Ko-Präsenz-Arbeit. |

## Tier 3 — die Referenz (stabil, zum Nachschlagen)

| Datei | Was | Wann lesen |
|---|---|---|
| **`docs/crafting-konzept.md`** | Das Hylomorphismus-Substrat — Bausteine, Operationen, Compounds, räumliche Prinzipien. Die Grundlage, auf der die Resonanz-Vereinheitlichung baut. | Bei Material/Form/Tag/Compound-Fragen. |
| **`docs/aktivierungsmatrix.md`** | Die Form-Tag-Aktivierungs-Matrix v2 (9 × 10) — der Quellcode für `AnazhRealm.FORM_TAG_ACTIVATION`. | Wenn eine Form × Material → Tag-Frage exakt sein muss. |
| **`docs/hydrosphere.md`** | **Wasser-Design** — das Drainage-Netz + das Voxel-Cell-Wasser (Algorithmus, Datenstrukturen, der V13-Wellen-Schnitt). Das Modell ist fertig (V13.14); V18 baut darauf. | Bei jeder Wasser-Arbeit (V18-Finish). |
| **`docs/world-portal.md`** | **W12-Vision-Anker** — AnazhRealm als Tor zu anderen Vibecode-Welten („Bibliothek von Alexandria"). | Vor einer Welle 12+ / Fremd-Engine-Arbeit. |

## Tier 4 — das Archiv (abgeschlossen, reine Referenz)

`docs/archiv/` — fertige Designs, vollendete Arc-Pläne, Audit-Schnappschüsse. **Wird
nicht mehr gepflegt** (der Stand, an dem das Dokument entstand). Eigener, nach Bögen
gruppierter Index in **`docs/archiv/README.md`** — dort liegen u.a. die VOLLENDETEN
Arc-Pläne (DSL-Weltregeln · lebendige Wertung · Emotion-Kern · der Render-/Tiefe-Bogen)
+ die Hygiene-Bögen + die System-Audits + die ungekürzte `learnings.md`.

---

## Begleit-Dateien (außerhalb docs/)

| Datei | Was |
|---|---|
| `vendor/README.md` | Vendor-Libs (Three.js r184 / Ammo / simplex-noise) — Versionen + Update-Befehl. |
| `.claude/commands/audit.md` | Der `/audit`-Slash-Befehl (umfassende Code-Prüfung). |
| `.github/workflows/check.yml` | CI — zwei Jobs (statische Checks + Playtest-Gate). |

## Doku-Disziplin (für den nächsten Agenten)

- Pro Welle → **ein Commit** + **ein `handover.md`-Eintrag oben**. Gilt eine Lehre
  DAUERHAFT → **eine kuratierte Zeile in `CLAUDE.md/Wichtige Gotchas`**.
- Der erzählerische Wellen-Bericht lebt NIE in der auto-geladenen `CLAUDE.md` (sonst
  wächst sie zur Halde — die Heilige Lektion eine Schicht höher).
- Fertige Designs + Audit-Snapshots wandern nach `docs/archiv/` (verschieben, nicht
  löschen) + werden in `docs/archiv/README.md` indexiert.
- **Diese Landkarte ist die EINE Quelle** — wer eine Doc hinzufügt/archiviert,
  pflegt sie hier (nicht eine zweite Liste in `README.md`/`CLAUDE.md` anlegen).
- Doc-Sync ist eine Grep-Aufgabe: vor jedem Commit
  `grep -rn "<alte-Version>" docs/*.md CLAUDE.md README.md` und jeden Treffer heilen.
