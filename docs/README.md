# docs/ — die Landkarte

**Wenige fundamentale Texte tragen alles.** Der Rest — die Chronik, die vollendeten Bögen, die
schlafenden Pläne, die Referenzen — lebt im Archiv (`docs/archiv/`), durchsuchbar. Das Prinzip:
_`CLAUDE.md` trägt das JETZT (Stand + Gotchas + Konventionen); ein Plan vollendet → er wandert ins
Archiv (`git mv`)._ So bleibt der Hauptraum **eine Wahrheit, keine Halde.** Die vier ewigen Heimaten
sind schlank: **Stand+Lehren** (`CLAUDE.md`) · **Chronik** (`archiv/handover.md`) · **Plan**
(`roadmap.md`) · **Vision** (`state-of-realm.md` + `das-lebendige-feld.md`) — kein Prozess-Doc daneben.

---

## Die fundamentalen Texte (die EINE Wahrheit, immer aktuell)

| Datei                               | Ebene                       | Was                                                                                                                                                                                                                                                                                 |
| ----------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`CLAUDE.md`** (Wurzel)            | **JETZT · DER TISCH**       | Stand (Live + die Reflexion: erledigt · offen · wo nicht mehr synergetisch) · die quer-schneidenden Gotchas · Konventionen · Doc-Map. Auto-geladen bei jeder Session.                                                                                                                |
| **`docs/state-of-realm.md`**        | **DIE VISION**              | Die Pfeiler aus den Testamenten · die Heilige Lektion · die Stand-vs-Vision-Matrix · das Welten-Ultiversum.                                                                                                                                                                         |
| **`docs/das-lebendige-feld.md`**    | **DER WAHRE NORDEN**        | Die Welt als EIN Feld, das alle lesen · schreiben · WERTEN — wie es GEMESSEN im Code lebt + der Vektor vorwärts. **ZUERST** vor lebendiger Welt / Emotion / Nexus / DSL / Kreaturen.                                                                                                |
| **`docs/wahrerwuchs.md`**           | **AKTIVER BOGEN · FORM (LEAD)** | Ω-GENESIS der Form — das Bauplan-GENOM: aus EINEM Seed × wenige Achsen die volle Palette (Moos → Mammutbaum). T1–T6 GEBAUT (Varianz); **§11 = DIE FIDELITÄT (die PRIORITÄT)** — der Katalog zeigte „kaum ein Upgrade": rohe Primitiv-Blobs, nur Tempel/Schwert haben Detail. Schöpfer-Korrektur §11.7: das Detail EMERGIERT aus einem scharfen Domänen-GESETZ (Grammatik/Skelett/Sim — Profi-Weg), NICHT aus Hand-Meshes; das Gesetz ist auch das TOR (ein Blob fällt durch). F1–F6 schärft das Gesetz je System. §10 = Vertikal-Bogen, hinter §11. **ZUERST** vor Genom / Werk-Fidelität / Bäume / Fels / Kristall / Gerät / Kreatur / Bauwerk / Variation. |
| **`docs/archiv/wahrerbauplan.md`**  | **ARCHIVIERT · SEIN (RUND)**| Ω-PHYSIS — der Physik-Schiedsrichter (Schwerpunkt → Stabilität → Steifigkeit/Versagen → Hebel → Lastpfad → Leser → Grammatik → Werkstatt). Säule I–IV + Ω-B5 RUND; der Richter lebt im Code (`_stability`/`_failsUnderLoad`/`_swingDynamics`/`_loadPath`). **ZUERST** vor Physik / Stabilität / Kreatur-Körper — die NORMATIVE Physik-Referenz. |
| **`docs/wahreranblick.md`**         | **AKTIVER BOGEN · ANBLICK** | Ω-OPSIS — jede Oberfläche ein Auslesewert der Welt (Boden · Bewuchs · Materialien · Form · Atmosphäre · Geometrie-Feinheit) + die fünf Wände gegen den Drift. **ZUERST** vor Anblick / Render / Material / Terrain-Look / Vegetation-Look / Atmosphäre.                             |
| **`docs/roadmap.md`**               | **DIE KARTE**               | Der Backlog vorwärts + **DIE GEMERKTEN FÄDEN** (Phase E · R6 · Mana · KI-Symbiose · Wasser-Nachfliessen · VR · IndexedDB · …).                                                                                                                                                      |
| **`docs/taille-spec.md`** (+ `.en`) | **DER VERTRAG**             | Die gefrorene Taille, NORMATIV (Ω1) — Serialisierung · Import · p2p-Schema · Snapshot · §7 Broker-Protokoll. **ZUERST** vor Serialisierung/Import/Broker. `spec/golden/v1/` EINGEFROREN.                                                                                            |
| **`README.md`** (Wurzel)            | **DIE TÜR**                 | Die öffentliche Tür — Was/Schnellstart/Tests/Heilige Lektion.                                                                                                                                                                                                                       |

**EIN PRINZIP, DREI GESICHTER:** `wahrerwuchs` (Ω-GENESIS · die FORM), `archiv/wahrerbauplan`
(Ω-PHYSIS · das SEIN, RUND — der Richter lebt im Code), `wahreranblick` (Ω-OPSIS · der ANBLICK)
sind **dasselbe Gesetz** — _jede Eigenschaft ist ein Auslesewert der Wahrheit, gerechnet/gelesen,
nie geraten/gemalt._ Das GENOM (wahrerwuchs) reicht durch DREI von ihnen als VERTIKALE Kette:
MICRO → ASSEMBLY → GESTALT → PLATZIERUNG, je × FORM/PHYSIK/ANBLICK (wahrerwuchs §10). Ω-PHYSIS
ist headless verifizierbar (kein Flake), Ω-OPSIS ist augen-bound (das Schöpfer-Browser-Bild ist
der Richter). Die Vision verankern `state-of-realm` + `das-lebendige-feld`.

**Frisch archiviert (16.06.2026):** `wahrerbauplan.md` → `archiv/` (der Ω-PHYSIS-Bogen ist RUND —
Säule I–IV + Ω-B5; der Richter lebt im Code + wird fortlaufend konsumiert; bleibt die NORMATIVE
Physik-Referenz). Der aktive Lead ist jetzt `wahrerwuchs.md` (FORM, §10 = der Vertikal-Bogen),
flankiert von `wahreranblick.md` (ANBLICK · Wand 1).
**Frisch archiviert (15.06.2026 — Doc-Ordnung):** `gigant-fortsetzung-plan.md` (VOLLENDET V18.225),
`abschluss-plan.md` (Vorgänger, vom aktiven Bogen abgelöst), `wahreranblick-antidrift-plan.md`
(die Drift-Geschichte; die fünf Wände leben jetzt im Kopf von `wahreranblick.md`), **`aktiv.md` +
`rueckmeldung.md`** (die zwei Prozess-Docs — der Tisch faltete in den `CLAUDE.md`-Stand zurück, der
Rückmeldungs-Korpus in die Gotchas/handover; die zwei Snapshots bleiben als Beleg im Archiv).
**Über den Detail-Plänen — der Master-Blick:** `docs/archiv/gigant-plan.md` (das umfassende
gemessene Bild der neun Säulen; der §5-Pfad GESCHLOSSEN seit V18.147).

---

## Die Bibliothek (`docs/archiv/`) — ZUERST lesen, wenn du an X arbeitest

**Schlafende aktive Pläne** — kommen auf den Tisch, wenn ihr Bogen dran ist:

| Datei                                      | Was                                                                                                                             | Trigger                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `archiv/wasser-render-architektur-plan.md` | Wasser — die EINE Wahrheit (6 Schichten, die Drei-Schichten-Architektur)                                                        | Wasser · Fluss · See · Wasserfall · Naht · Render · Dynamik                |
| `archiv/terrain-t4-wasser-ca-plan.md`      | Der Wasser-CA-Bogen (VOLLENDET V18.84–.94) — die Chronik der Fluid-Entscheidungen (Quellen-Pin · Receiver-Support · Flow-Regel) | Wasser-CA · Nachfliessen · Quellen · Flow-Regel                            |
| `archiv/lod-kaskade-plan.md`               | Die Detail-Kaskade (U1–U6, eine Distanz, sechs Gesichter)                                                                       | LOD · Streaming · Sicht-Ring · Schatten-CSM · Deko-Distanz · Draw-Calls    |
| `archiv/kampf-plan.md`                     | Crafting/Kampf §11 (Schöpfungs-Fluss, Resonanz, S6-B/S9/S11/Phase E)                                                            | Kampf · Waffe · Werkzeug · Rüstung · Trank · Avatar · Werkstatt · Crafting |
| `archiv/world-portal-w18-plan.md`          | W18 — in fremden Welten leben (Ko-Präsenz)                                                                                      | Portal-Ko-Präsenz · fremde Welten                                          |
| `archiv/taille-plan.md`                    | Ω — der Ewigkeits-Bogen (VOLLENDET V18.137–.141) — die Risse + der Weg; die NORM lebt in `docs/taille-spec.md`                  | Taille · Serialisierung · Import · Versions-Felder · Perpetuum             |
| `archiv/robustheit-plan.md`                | G8 — die drei Ringe + Immunsystem (R0–R5 ✓); **R6 Selbst-Erweiterung = GEMERKTER FADEN #1**                                     | Sicherheit · Sandbox · Rückruf · Souverän · R6                             |

**Referenz** — Nachschlagewerke:

| Datei                          | Was                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `archiv/hydrosphere.md`        | Wasser-Daten-Modell — die frozen Schichten (Drainage-Netz + Zell-Wasser, der V13-Schnitt). |
| `archiv/crafting-konzept.md`   | Das Hylomorphismus-Substrat — Bausteine · Operationen · Compounds · räumliche Prinzipien.  |
| `archiv/aktivierungsmatrix.md` | Die Form-Tag-Aktivierungs-Matrix (9×10) — Quellcode für `FORM_TAG_ACTIVATION`.             |
| `archiv/world-portal.md`       | W12-Vision-Anker — das Tor zu anderen Vibecode-Welten.                                     |

**Die Chronik + die vollendeten Bögen** — die Vergangenheit:

- `archiv/handover.md` — die volle **Wellen-Chronik** (jüngste oben) + das **Gotcha-Vollarchiv** (~290 Stolperdrähte; CLAUDE.md trägt die kuratierte Teilmenge).
- `archiv/roadmap-chronik-bis-v18.83.md` — der alte Detail-Backlog (Ringe, Wellen A–X), als Snapshot bewahrt.
- `archiv/README.md` — der nach Bögen gruppierte Index: **UI-Putz-Bogen** · Resonanz-Vereinheitlichung · DSL-Weltregeln · lebendige Wertung · Emotion-Kern · Tiefe-Fundament · Render/Tiefe · Wasser-finale-Form · Hygiene-Bögen · System-Audits · die ungekürzte `learnings.md`.

---

## Begleit-Dateien (außerhalb docs/)

| Datei                         | Was                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `spec/golden/v1/`             | Die vier goldenen Draht-Artefakte der Taille (Ω0) — **EINGEFROREN, NIE regenerieren**; `scripts/diag-taille.cjs` prüft Konformanz. |
| `vendor/README.md`            | Vendor-Libs (Three.js r184 / Ammo / simplex-noise) — Versionen + Update-Befehl.                                                    |
| `.claude/commands/audit.md`   | Der `/audit`-Slash-Befehl.                                                                                                         |
| `.github/workflows/check.yml` | CI — zwei Jobs (statische Checks + Playtest-Gate).                                                                                 |

## Doku-Disziplin (für den nächsten Agenten)

- **Der Tisch bleibt schlank:** ein fertiger Plan wandert sofort in die Bibliothek (`git mv` nach
  `archiv/`, verschieben nicht löschen) + bekommt eine Zeile in `archiv/README.md`.
- Pro Welle → **ein Commit** + **ein `archiv/handover.md`-Eintrag oben**. Gilt eine Lehre DAUERHAFT
  → **eine kuratierte Zeile in `CLAUDE.md / Wichtige Gotchas`**.
- Der erzählerische Wellen-Bericht lebt NIE in der auto-geladenen `CLAUDE.md` (sonst Halde).
- **Diese Landkarte ist die EINE Quelle** — wer eine Doc verschiebt, pflegt sie hier + leitet die
  Verweise in `CLAUDE.md` mit um (Doc-Sync ist eine Grep-Aufgabe:
  `grep -rn "<name>\.md" CLAUDE.md docs/*.md`).
