# docs/ — die EINE Karte

> **Das Prinzip (V18.468, die Informations-Diät): git ist das Archiv.** Es gibt kein
> `docs/archiv/` mehr — jede Chronik, jeder vollendete Plan, jede historische Analyse lebt in
> der git-Historie und ist dort durchsuchbar (`git log --all --oneline -- docs/` · ein Doc
> wiederholen: `git show <sha>:docs/<name>.md`). Hier liegt NUR, was JETZT trägt: Norm, Vision,
> Tisch, die eine ausstehende Runde. Ein neues Doc braucht ein Urteil: ist es Norm (bleibt),
> Tisch (roadmap) oder Welle (Commit-Message)?

| Doc                                             | Rolle                                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md` (Repo-Wurzel)                       | **AUTO-GELADEN** — Stand · die tragenden Lehren · Architektur-Karte · Workflows. Die EINE Seite.                                               |
| `docs/roadmap.md`                               | **DER TISCH** — was offen ist (§0) · Narben (§2) · Teilsysteme (§3) · Samen/gemerkte Fäden (§4). Vor jedem neuen Vorhaben ZUERST.              |
| `docs/studio-vertrag.md`                        | **NORMATIV** — die Naht Studio↔Welt (Vertrag v1.2: `PARAMS_BY_KIND` · must-ignore · fail-closed). Gate-gelesen (`gate:studio-vertrag`).        |
| `docs/taille-spec.md`                           | **NORMATIV** — die gefrorene Taille (Serialisierungs-Norm; Goldens in `spec/golden/v1/`).                                                      |
| `docs/neues-kleid-verfassung.md`                | **NORMATIV** — die Pipeline-Verfassung (die Gesetze der EINEN Pipe; die Maschine dazu ist `gate:pipeline-constitution`).                       |
| `docs/das-lebendige-feld.md`                    | **DER WAHRE NORDEN** — die Welt als EIN Feld, das alle lesen · schreiben · WERTEN. Vor Arbeit an Feld/Emotion/Nexus/DSL/Kreaturen ZUERST.      |
| `docs/state-of-realm.md`                        | **DIE VISION** — die Pfeiler · die Heilige Lektion · die Stand-vs-Vision-Matrix · das Welten-Ultiversum.                                       |
| `docs/abnahme-drehbuch.md`                      | **DIE EINE SCHÖPFER-RUNDE** — das ausstehende Browser-Sign-off-Drehbuch (W8 · look-golden --mint · perf.json · DoD 5 · E-C/E-E/E-F · Galerie). |
| `docs/analyse/perf-paritaet-baseline-v18432.md` | Perf-Paritäts-Baseline — von `gate:perf-parity` konsumiert.                                                                                    |

**Chronik:** `git log` (Commits sind klein, thematisch, deutsch — die Message IST der Eintrag).
**Gefallene Namen** (wo einst mehr lag, alles in git): `archiv/handover.md` (Chronik + Gotcha-
Vollarchiv → git + CLAUDE.md-Lehren) · `wahrerguss`/`archiv/wahrerbauplan`/`archiv/wahreranblick`
(die Guss-Bögen — ihr Offenes ist in roadmap §0 gefaltet) · `nervensystem-plan`/
`paritaet-vollendung-plan`/`lebendiger-koerper-plan`/`neues-kleid-plan`/`ultraguss-plan` u. a.
(vollendete Bögen) · `referenz/` (Anatomie-Referenzbilder).
