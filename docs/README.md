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
| **`docs/roadmap.md`** | **DER WEG** | Der Plan vorwärts (3 Phasen) · die offene-Fäden-Karte · die Vergangenheit stichwortmäßig · die Disziplin. |
| **`README.md`** (Wurzel) | **DIE TÜR** | Die öffentliche Tür — Was/Schnellstart/Tests/Heilige Lektion. |

**Auf dem Tisch — der aktive Bau-Plan:** `docs/terrain-koharenz-plan.md` (DIE EINE GRENZE — kohärentes,
kantiges Terrain + leitbares Wasser; die Chunk-Naht-Wurzel, IPERKA, alle Schnittstellen). Wandert ins
Archiv, wenn der Bogen vollendet ist.

---

## Die Bibliothek (`docs/archiv/`) — ZUERST lesen, wenn du an X arbeitest

**Schlafende aktive Pläne** — kommen auf den Tisch, wenn ihr Bogen dran ist:

| Datei | Was | Trigger |
|---|---|---|
| `archiv/wasser-render-architektur-plan.md` | Wasser — die EINE Wahrheit (6 Schichten, das statische `L`, der Fluid-Plan) | Wasser · Fluss · See · Wasserfall · Naht · Render · Dynamik |
| `archiv/lod-kaskade-plan.md` | Die Detail-Kaskade (U1–U6, eine Distanz, sechs Gesichter) | LOD · Streaming · Sicht-Ring · Schatten-CSM · Deko-Distanz · Draw-Calls |
| `archiv/kampf-plan.md` | Crafting/Kampf §11 (Schöpfungs-Fluss, Resonanz, S6-B/S9/S11/Phase E) | Kampf · Waffe · Werkzeug · Rüstung · Trank · Avatar · Werkstatt · Crafting |
| `archiv/world-portal-w18-plan.md` | W18 — in fremden Welten leben (Ko-Präsenz) | Portal-Ko-Präsenz · fremde Welten |

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
