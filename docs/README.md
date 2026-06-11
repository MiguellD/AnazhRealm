# docs/ — die Landkarte

**Vier lebende Texte tragen das JETZT, das WOHIN und den WEG.** Alles Detail — die volle Chronik, die
fertigen Pläne, die schlafenden Bau-Pläne, die Referenzen — lebt in der **Bibliothek** (`docs/archiv/`),
durchsuchbar. Das Prinzip: *der aktive Tisch trägt nur die nächste Tat; ein Bogen erwacht → sein Plan
kommt aus der Bibliothek auf den Tisch; er vollendet → zurück ins Archiv.* So wird der Hauptraum nie
wieder zur Halde.

---

## Die lebenden Säulen (immer aktuell gepflegt)

| Datei | Ebene | Was |
|---|---|---|
| **`CLAUDE.md`** (Wurzel) | **JETZT** | Stand · die quer-schneidenden Gotchas · Konventionen · Doc-Map. Auto-geladen bei jeder Session. |
| **`docs/state-of-realm.md`** | **WOHIN** | Die Vision — die Pfeiler aus den Testamenten, die Heilige Lektion, die Stand-vs-Vision-Matrix, das Welten-Ultiversum. |
| **`docs/das-lebendige-feld.md`** | **DER WAHRE NORDEN** | Der operative Vision-Anker: die Welt als EIN Feld, das alle lesen · schreiben · WERTEN — wie es GEMESSEN im Code lebt + der Vektor vorwärts. **ZUERST** vor Arbeit an lebendiger Welt / Emotion / Nexus / DSL / Kreaturen. |
| **`docs/roadmap.md`** | **DER WEG** | Der Plan vorwärts (3 Phasen) · die offene-Fäden-Karte (inkl. der GEMERKTEN FÄDEN) · die Vergangenheit stichwortmäßig · die Disziplin. |
| **`docs/taille-spec.md`** | **DER VERTRAG** | Die gefrorene Taille, NORMATIV (Ω1) — Draht-Formen · must-ignore/must-preserve · Empfänger-Gesetz · Versions-Semantik · Ledger-Gesetz · Namensraum. **ZUERST** vor Arbeit an Serialisierung/Import/p2p-Schema/Snapshot-Schema. Die ausführbare Form: `spec/golden/v1/` (EINGEFROREN, nie regenerieren). |
| **`README.md`** (Wurzel) | **DIE TÜR** | Die öffentliche Tür — Was/Schnellstart/Tests/Heilige Lektion. |

**Auf dem Tisch — der aktive Bau-Plan:** `docs/terrain-koharenz-plan.md` (DIE EINE GRENZE — kohärentes,
kantiges Terrain + leitbares Wasser; die Chunk-Naht-Wurzel, IPERKA, alle Schnittstellen). Wandert ins
Archiv, wenn der Bogen vollendet ist.

**Über dem Tisch — der Master-Blick:** `docs/gigant-plan.md` (DER GIGANT, 10.06.2026 — das
umfassende gemessene Bild + die neun Säulen G1–G9/Ω [der §5-Pfad ist GESCHLOSSEN seit V18.147] + die
Zwillinge + Stand-der-Technik-Karte + die Reihenfolge + **DIE GEMERKTEN FÄDEN** am §5-Ende).
Die Karte ÜBER den Detail-Plänen; pro vollendeter Säule wird sie kürzer.

---

## Die Bibliothek (`docs/archiv/`) — ZUERST lesen, wenn du an X arbeitest

**Schlafende aktive Pläne** — kommen auf den Tisch, wenn ihr Bogen dran ist:

| Datei | Was | Trigger |
|---|---|---|
| `archiv/wasser-render-architektur-plan.md` | Wasser — die EINE Wahrheit (6 Schichten, die Drei-Schichten-Architektur) | Wasser · Fluss · See · Wasserfall · Naht · Render · Dynamik |
| `archiv/terrain-t4-wasser-ca-plan.md` | Der Wasser-CA-Bogen (VOLLENDET V18.84–.94) — die Chronik der Fluid-Entscheidungen (Quellen-Pin · Receiver-Support · Flow-Regel) | Wasser-CA · Nachfliessen · Quellen · Flow-Regel |
| `archiv/lod-kaskade-plan.md` | Die Detail-Kaskade (U1–U6, eine Distanz, sechs Gesichter) | LOD · Streaming · Sicht-Ring · Schatten-CSM · Deko-Distanz · Draw-Calls |
| `archiv/kampf-plan.md` | Crafting/Kampf §11 (Schöpfungs-Fluss, Resonanz, S6-B/S9/S11/Phase E) | Kampf · Waffe · Werkzeug · Rüstung · Trank · Avatar · Werkstatt · Crafting |
| `archiv/world-portal-w18-plan.md` | W18 — in fremden Welten leben (Ko-Präsenz) | Portal-Ko-Präsenz · fremde Welten |
| `archiv/taille-plan.md` | Ω — der Ewigkeits-Bogen (VOLLENDET V18.137–.141) — die Risse + der Weg; die NORM lebt in `docs/taille-spec.md` | Taille · Serialisierung · Import · Versions-Felder · Perpetuum |
| `archiv/robustheit-plan.md` | G8 — die drei Ringe + Immunsystem (R0–R5 ✓); **R6 Selbst-Erweiterung = GEMERKTER FADEN #1** | Sicherheit · Sandbox · Rückruf · Souverän · R6 |

**Referenz** — Nachschlagewerke:

| Datei | Was |
|---|---|
| `archiv/hydrosphere.md` | Wasser-Daten-Modell — die frozen Schichten (Drainage-Netz + Zell-Wasser, der V13-Schnitt). |
| `archiv/crafting-konzept.md` | Das Hylomorphismus-Substrat — Bausteine · Operationen · Compounds · räumliche Prinzipien. |
| `archiv/aktivierungsmatrix.md` | Die Form-Tag-Aktivierungs-Matrix (9×10) — Quellcode für `FORM_TAG_ACTIVATION`. |
| `archiv/world-portal.md` | W12-Vision-Anker — das Tor zu anderen Vibecode-Welten. |

**Die Chronik + die vollendeten Bögen** — die Vergangenheit:

- `archiv/handover.md` — die volle **Wellen-Chronik** (jüngste oben) + das **Gotcha-Vollarchiv** (~290 Stolperdrähte; CLAUDE.md trägt die kuratierte Teilmenge).
- `archiv/roadmap-chronik-bis-v18.83.md` — der alte Detail-Backlog (Ringe, Wellen A–X), als Snapshot bewahrt.
- `archiv/README.md` — der nach Bögen gruppierte Index: **UI-Putz-Bogen** · Resonanz-Vereinheitlichung · DSL-Weltregeln · lebendige Wertung · Emotion-Kern · Tiefe-Fundament · Render/Tiefe · Wasser-finale-Form · Hygiene-Bögen · System-Audits · die ungekürzte `learnings.md`.

---

## Begleit-Dateien (außerhalb docs/)

| Datei | Was |
|---|---|
| `spec/golden/v1/` | Die vier goldenen Draht-Artefakte der Taille (Ω0) — **EINGEFROREN, NIE regenerieren**; `scripts/diag-taille.cjs` prüft Konformanz. |
| `vendor/README.md` | Vendor-Libs (Three.js r184 / Ammo / simplex-noise) — Versionen + Update-Befehl. |
| `.claude/commands/audit.md` | Der `/audit`-Slash-Befehl. |
| `.github/workflows/check.yml` | CI — zwei Jobs (statische Checks + Playtest-Gate). |

## Doku-Disziplin (für den nächsten Agenten)

- **Der Tisch bleibt schlank:** ein fertiger Plan wandert sofort in die Bibliothek (`git mv` nach
  `archiv/`, verschieben nicht löschen) + bekommt eine Zeile in `archiv/README.md`.
- Pro Welle → **ein Commit** + **ein `archiv/handover.md`-Eintrag oben**. Gilt eine Lehre DAUERHAFT
  → **eine kuratierte Zeile in `CLAUDE.md / Wichtige Gotchas`**.
- Der erzählerische Wellen-Bericht lebt NIE in der auto-geladenen `CLAUDE.md` (sonst Halde).
- **Diese Landkarte ist die EINE Quelle** — wer eine Doc verschiebt, pflegt sie hier + leitet die
  Verweise in `CLAUDE.md` mit um (Doc-Sync ist eine Grep-Aufgabe:
  `grep -rn "<name>\.md" CLAUDE.md docs/*.md`).
