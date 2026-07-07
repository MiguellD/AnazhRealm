# DIE VERFASSUNG DER PIPELINE — „Das Neue Kleid" (P0–P8, VOLLENDET)

> **Struktur ersetzt Ermahnung.** Diese Datei codifiziert die GESETZE der Studio↔AnazhRealm-Asset-
> Pipeline und — der entscheidende Punkt — WO jedes Gesetz strukturell erzwungen wird (Chokepoint ·
> Schnitt · Gate). Kein Gesetz lebt als bloße Bitte im Kommentar; jedes hat seine Linse, die es rot
> macht, wenn ein Refactor es still bricht. Die eine automatische Wächter-Linse ist
> `npm run gate:constitution` (`scripts/diag-pipeline-constitution.cjs`, im `check`-Gate, kein Browser).

## Der Weg (P0–P8)

Die Foundry (das Schöpfer-Werk `worlds/terrain/phytogenesis.js` als Geometrie-Orakel) wurde von einem
versteckten iframe zu einer sauberen In-Prozess-Pipeline, in der das Studio die EINE Quelle aller
Wald-/Vegetations-Assets ist — ohne Parallelcode. Acht Phasen, seriell im Haupt-Baum committet:

| Phase | Gesetz | Strukturelle Erzwingung |
| --- | --- | --- |
| **P0** | Worker == iframe byte-identisch | `scripts/diag-foundry-parity.cjs` (720/720 byte-genau) |
| **P1** | Asset-Vertrag v1 (Pflanzen) eingefroren | `spec/asset-contract/v1/` + `gate:asset-contract` (52 sha256-Goldens) |
| **P2** | Kern-Split `foundry-core.js` (Studio-Generator als geteilte Quelle) | `gate:portal-boot` (die Shell liest die Globals) |
| **P3a** | Foundry iframe → Worker (Geometrie off-thread) | `gate:foundry-warm` (der Worker bäckt echte Assets headless) |
| **P4** | Die Foundry ist die EINE aktive Baum-Quelle | der Chokepoint `_buildVariantLODs` (null bei lebender Foundry) + der Scatter-Gate + `gate:foundry-deadlock` |
| **P5** | Der Impostor backt auf dem EINEN Haupt-Renderer | `_bakeImpostorAtlasRTT` (foundry-Zweig) + `gate:foundry-impostor` (kein iframe) |
| **P6** | EIN Wuchs (der Studio-Generator liest den geteilten Kern) | `growTreeNodes` delegiert an `__phytoCore.growSkeleton`, Inline-Wuchs geschnitten + `gate:asset-contract` (output-neutral) |
| **P7** | Der Asset-Vertrag v2 (die erste Kreatur dockt an) | `spec/asset-contract/v2/` + `gate:creature-contract` (bake-core Skin byte-exakt in Node) |
| **P8** | Die Verfassung: Struktur ersetzt Ermahnung | `gate:constitution` (diese Gesetze als statische Linse im `check`) |

## Die fünf Gesetze (was `gate:constitution` prüft)

### Gesetz 1 — die Foundry ist die EINE Baum-Quelle

Der Chokepoint `_buildVariantLODs` gibt bei lebender + bereiter Foundry, die die Art kennt, **null**
zurück → kein Aufrufer (Scatter · LOD-Switch · Platzierung) KANN einen Grammatik-Nachbau setzen, egal
welcher Pfad. Der Scatter (`_scatterPass`) unterdrückt den Grammatik-Render für BAUM-Schichten, wenn
die Foundry lebt (`layer.kind === "tree" && this._foundryEnabled()) continue`) — lädt das Studio-Asset
noch, wird die Zelle deferriert (`region._deferredFoundry`) + neu gestreamt, NIE ein Grammatik-Ersatz
(„wenn kein Baum spawnt, ist es so"). Fels/Kiesel/Understory haben KEINEN Foundry-Zwilling → ihre
Grammatik ist dort die EINZIGE Quelle (kein Nachbau) und bleibt. Der RICHTER (`_growTreeBlueprintRich`
→ Tags/Physik) + die Understory (`_growTreeBlueprintForSpawn`) bleiben load-bearing.

### Gesetz 2 — EIN Wuchs

Die gesetz-wahre Wuchs-Mathematik (McMahon · da Vinci · Phyllotaxis · Apikaldominanz) lebt in EINER
geteilten Quelle `phyto-core.js` (`growSkeleton`). BEIDE Wuchs-Leser lesen sie: AnazhRealms Richter
(`_phytoGrowSkeleton`, reiner Delegator) UND die Studio-Seite (`foundry-core.js:growTreeNodes`,
delegiert an `__core.growSkeleton`). Der alte ~275-Zeilen-Inline-Parallel-Wuchs in `growTreeNodes` ist
GESCHNITTEN — es gibt keine driftende Kopie mehr (Gesetz #0). Fehlt der Kern, gibt es ein
graceful-leeres Ergebnis (die Gates fangen einen fehlenden Kern sofort).

### Gesetz 3 — der Impostor backt auf dem EINEN Haupt-Renderer

Der 8-Winkel-Impostor-Atlas backt über den Haupt-Renderer-RTT (`_bakeImpostorAtlasRTT`, der bei der
`foundry`-Flagge die worker-produzierte LOD1-Geometrie als `_foundryBakeLeaves` liest) — KEIN
GL-Bake-iframe mehr. Die drei iframe-Impostor-Methoden (`_foundryRequestImpostor` ·
`_foundryEnsureBakeIframe` · `_foundryBuildImpostorRecord`) sind geschnitten; kein null-origin-iframe
wird erzeugt. Headless/Null-Renderer → der Silhouetten-Fallback trägt (RTT no-op, gate-treu); der
Atlas-LOOK ist das Schöpfer-Auge auf echter GPU.

### Gesetz 4 — die Asset-Verträge sind eingefroren + gate-bewacht

Zwei Verträge frieren die Asset-Nähte byte-genau ein: **v1** (`spec/asset-contract/v1/`) = die
Pflanzen (Studio-Generator, `gate:asset-contract`, 52 sha256-Goldens über einen Worker); **v2**
(`spec/asset-contract/v2/`) = die Kreatur-Haut (bake-core Skin-Isosurface, `gate:creature-contract`,
byte-exakt DIREKT in Node, weil die Skin-Mathematik THREE-frei ist). Die Goldens sind EINGEFROREN
(Taille-Disziplin) — ein bewusster Re-Mint ist `MINT_FORCE=1` mit Begründung.

### Gesetz 5 — jede Regel hat ihre Linse

Jede Pipeline-Regel trägt ihr eigenes Gate: `gate:foundry-warm` (Worker bäckt) · `gate:foundry-deadlock`
(die Nähe konvergiert unter Last) · `gate:portal-boot` (die Shell liest foundry-core) ·
`gate:foundry-impostor` (kein iframe) · `gate:asset-contract` / `gate:creature-contract` (die Verträge)
· `gate:constitution` (diese Verfassung). Der `check`-Gate fährt die statischen (kein Browser); die
foundry-ON-Gates laufen im per-push-CI.

## Was OFFEN bleibt (nach P8, eigene Bögen)

- **Der LOOK** des dichten Foundry-Waldes (nah = fern = Studio) + der RTT-Impostor-Atlas — das
  Schöpfer-Auge auf echter GPU (headless swiftshader ist für den Sub-Pixel-LOOK untreu).
- **v2-Folge-Kanäle**: `sockets` (Attachment) · `judge` (Ω-PHYSIS-Verdikt) · Fahrzeug-Assets —
  dieselbe Naht, andere Spec-Quelle.
- **phyto-core ↔ foundry-core-Merge** (die zwei geteilten Kerne zu EINEM), 8-Winkel-Multi-View-Impostor.

Diese docken als eigene Wellen an, wenn ihr Thema dran ist. Die Pipeline selbst — eine Quelle · ein
Wuchs · ein Bake-Pfad · zwei Verträge — steht und ist strukturell bewacht.
