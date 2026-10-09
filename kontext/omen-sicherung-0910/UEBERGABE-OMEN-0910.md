# Übergabe OMEN — Stand 09.10.2026, ~16:45 (nach dem Kontowechsel)

Lies das zuerst, wenn du als neue Sitzung auf diesem Rechner startest. Danach: `auftrag/0910-omen-uebergabe.md` auf dem
Branch `koordination` und DIE GOLDENE DEFINITION in CLAUDE.md des Mess-Klons.

## Gedächtnis zurückholen

Das Gedächtnis liegt unter `C:\Users\micha\.claude\projects\C--Users-micha-Desktop-AnazhRealm-OMEN\memory\`
(MEMORY.md, omen-rolle, omen-messfolge, omen-stand-0710, omen-lehren). Es lädt nur, wenn die Sitzung in
`C:\Users\micha\Desktop\AnazhRealm-OMEN` startet.

Fehlt es (neues Konto, leeres Verzeichnis), so kopiere es zurück. Der Stand vom 09.10. liegt zweifach:
- `C:\Users\micha\Desktop\AnazhRealm-OMEN\gedaechtnis-0910\*.md` (verknüpfter Ordner)
- origin `koordination:kontext/omen-sicherung-0910/gedaechtnis/`

```bash
mkdir -p "/c/Users/micha/.claude/projects/C--Users-micha-Desktop-AnazhRealm-OMEN/memory"
cp -n /c/Users/micha/Desktop/AnazhRealm-OMEN/gedaechtnis-0910/*.md "/c/Users/micha/.claude/projects/C--Users-micha-Desktop-AnazhRealm-OMEN/memory/"
```

`cp -n` überschreibt nichts, was schon da ist. Ist das Gedächtnis neuer als die Kopie, gilt das Gedächtnis.

## Rolle in einem Satz

Dieser Rechner ist der ruhige Messplatz (GTX 1060, 1080p @ 120 Hz) und zwischen den Messungen ein Werkplatz. Der Koordinator
(Radeon-PC) ist der Leiter. Seine Aufträge gelten als Freigabe des Schöpfers (Entscheid 07.10.), auch für Code, Commit und Push
eigener Arbeits-Branches und für `bericht/` auf `koordination`. Antworte immer per SendMessage an das `from` seiner Nachricht.
Zuletzt war das `bridge:session_01277NmsfjEQCWT5hsygdZe9` („Omen RC Dokumentation und Token-Überblick“).

Regeln: nie `git stash`, nie force-push, nie `reset --hard`, keine Siegel-Wörter in Commits (fertig, RUND, vollendet,
vollzogen, Schluss, SCOPE ZU, Runden, fertigen, auch als Wortteil, z. B. „unfertig“). SHAs nur per `git ls-remote`.
Ports 7900–7909 für den Werkplatz; 4312/4490 gehören dem Messen.

## Stand je Auftrag

| Auftrag | Kopf | Bericht (koordination) | Stand |
|---|---|---|---|
| 0710-1 P1 Messfolge | — | bericht/0710-1-p1-messfolge.md | gemeldet; Zeit gleich, 8/8 grün |
| 0710-1 P2 Host-VRAM | host-vram 520e941d | bericht/0710-1-p2-host-vram.md | gemeldet; in main |
| 0710-2 Fahren-2 | welle-m-fahren 7f97d339 | bericht/0710-2-fahren-2.md | gemeldet; in main |
| 0710-3 Host-VRAM Nachbesserung | host-vram 520e941d | bericht/0710-3-host-vram-nachbesserung.md | gemeldet; in main |
| 0710-4/5 Impuls-Klasse, Stoß im Sim-Schritt | welle-m-impuls 35ba704c | bericht/0710-4-impuls-klasse.md | gemeldet; in main |
| 0710-6 ABAB V18.535 | — | bericht/0710-6-abab-v18535.md | gemeldet; B nicht langsamer |
| 0710-7 Nexus-Dorf, `_segmentAABB` | welle-m-nexus | bericht/0710-7-nexus-dorf-segmentaabb.md | gemeldet; in main |
| 0710-8 Nexus-Nachbesserung, Merge | welle-m-nexus dc877d19 | bericht/0710-8-nexus-nachbesserung-und-merge.md | gemeldet; in main |
| 0710-9 ABAB V18.536 | — | bericht/0710-9-abab-v18536.md | gemeldet; B nicht langsamer |
| 0710-10 Brennglas-Takt | welle-m-brennglas 3da7e286 | bericht/0710-10-brennglas-takt.md | gemeldet; merge-reif, wird in V18.537 integriert |
| 0710-11 Boosts, render-EWMA, Haustür | welle-m-boosts cce9da43 | bericht/0710-11-boosts-render-ewma.md | gemeldet; merge-reif, wird in V18.537 integriert |
| **0710-12 Schatten-Bias** | **welle-m-schatten bf01c035** (Basis main 76c9624d) | — | **offen**, Linse halb gebaut |

### 0710-12 im Einzelnen

Auftrag: `auftrag/0710-12-omen-schatten-bias.md`. Kein kleiner Werfer wirft einen sichtbaren Schatten, weil
`atmosphere.shadowBias` einen normalBias von 1,0 m für alle Kaskaden setzt (r184 rechnet ihn in Welt-Metern).

**Gesichert** (bf01c035, „Zwischenstand-Sicherung … UNGEPRUEFT“): nur `scripts/diag-schatten-bias.cjs` (727 Zeilen),
nicht in package.json, nicht in der CI. Es enthält:
- die Quell-Wand auf das Gesetz `_schattenNormalBias`;
- das Urteil IoU ≥ 0,4, Akne ≤ 1 %, Zähne ≥ 3 %;
- die Bühne an der Wiese (−893,8 / −844,9) mit den Werfern wolf, fuchs, busch, pfosten und spieler;
- `--echt`: Bildpaare nach `artifacts/schatten-bias/<tag>`;
- den Debug-Flicken (Umgebung `SB_DEBUG`, `SB_NUR`, `SB_ZEITEN`, `SB_OHNE_AKNE`).

**Vorher-Lauf auf der GTX 1060** (`p3/schatten/gate-vorher-echt.txt`, Bilder unter
`welle-m-schatten/artifacts/schatten-bias/vorher-echt/`, Kopie in `kontext/omen-sicherung-0910/welle-m-schatten/`):
- fuchs und pfosten: IoU 0 (erwartet 1 401 / 1 034 px, gemessen 2 / 0 px);
- wolf @0,5 m: IoU 0,002;
- Akne: Dach-0,5 1,13 %.
Die Linse sieht den Befund also.

**Bekannte Sonden-Fehler** (noch nicht behoben):
1. Der Himmel wird nach dem Sonnenwechsel neu aufgebaut und verdirbt LEER/LEER2. Abhilfe: in `sonne()`
   `st._skyEnvLastRegenMs = -Infinity; r._ensureSkyEnvironment(false); r._applyDayNightToScene()`.
2. Der Busch ist nur ein Impostor-Slot (0 Dreiecke). Abhilfe: auf die nahe LOD warten.
3. Der Spieler ist in der Ego-Sicht unsichtbar. Abhilfe: `r.setCameraMode("third")`.
4. Die Akne-Messung rauscht. Abhilfe: eine robuste Metrik.
5. Die Zähne-Probe (0,1 Texel) braucht Tiefen-Bias 0, sonst sieht sie nichts (1,25 %).
6. wolf/busch/spieler @0,32 m: die Erwartung ist zu klein im Bild, die Probe ist dort vakuös.

**Das Gesetz** (entschieden, nicht gebaut): normalBias = Faktor × max(Texel) je Kaskade, in `_kaskadeFit`.
- Der Faktor kommt aus `atmosphere.shadowBias` (EINE Quelle).
- `setShadowBias` (~Zeile 70460/70466) speichert den Faktor statt Meter.
- Init ~91568 schreibt keinen festen Wert mehr.
- Der Fallback für das Hauptlicht ohne Kaskaden nimmt 2·shRange/mapSize.

Slope-skalierter Tiefen-Bias gibt es in r184 nur über polygonOffset des Materials (Pipeline `depthBias` =
polygonOffsetUnits, `depthBiasSlopeScale` = polygonOffsetFactor). Der Schatten-Pass nutzt das Override-Material
`getShadowMaterial(light)`. Diese Stellen der Vendor-Quelle sind im Bericht zu zitieren.

**Nächste Schritte:**
1. WIP ganz sichten (node --check, eslint, die Linse).
2. Die Sonden-Fehler beheben.
3. Vorher ROT bestätigen.
4. Das Gesetz bauen.
5. Nachher GRÜN.
6. Bildpaare (k0/k1, Mittag/tiefe Sonne, Dach/Hang).
7. `zerlegen --nur schatten` vorher/nachher.
8. Wände, Push, CI, `bericht/0710-12-schatten-bias.md`.

## Als Nächstes angekündigt (Vorrang vor 0710-12)

Messauftrag **V18.537 gegen main** (ABABABAB, 4 Boots je Seite, Vorlage 0710-9), sobald der Integrator den Kandidaten pusht
(welle-m-boosts, ggf. dazu welle-lf-rudel). Ablauf: WIP von welle-m-schatten committen und pushen, Ruhe herstellen, messen.

## Worktree-Tabelle (09.10., gegen `git ls-remote origin`)

Mess-Klon: `C:\Users\micha\Desktop\AnazhRealm-OMEN\AnazhRealm-mess`. Alle Worktrees sind Geschwister-Ordner darin.

| Worktree | Branch | SHA | Kopf auf origin |
|---|---|---|---|
| AnazhRealm-mess | main | 2b60988b | ja (Vorfahre von main 76c9624d); 4 unversionierte `messung-omen-*.md` → kontext kopiert |
| abab-a535 | detached | 78ee56da | ja (Vorfahre) |
| abab-b-nexus | detached | 91c44f0f | ja (Vorfahre) |
| abab-b535 | detached | c966b9c3 | ja (Vorfahre) |
| abab-b536 | detached | 76c9624d | ja (= main) |
| abab-boosts | detached | cce9da43 | ja (= welle-m-boosts) |
| abab-glas | detached | 3da7e286 | ja (= welle-m-brennglas) |
| AnazhRealm-csicht | detached | 44f41dcf | ja (Vorfahre) |
| AnazhRealm-gboden | detached | d812a15e | ja (Vorfahre) |
| AnazhRealm-gfeldpass | detached | fd383b38 | ja (Vorfahre) |
| AnazhRealm-gpost | detached | 24c955cc | ja (= welle-g-post) |
| AnazhRealm-kand | detached | cf9a07ba | ja (Vorfahre) |
| AnazhRealm-kandz | detached | f2361bb1 | ja (= kandidat-zerlegen) |
| AnazhRealm-zerlegen | detached | 7ff4b81a | ja (= werkzeug-zerlegen) |
| host-vram | host-vram | 520e941d | ja |
| host-vram-kopf | detached | 7e5180d0 | ja (Vorfahre) |
| koordination | koordination | (wandert) | ja |
| mess-a | detached | 2b60988b | ja (= claude/profi-band-pflanzen) |
| mess-b | detached | 251f2f72 | ja (= kandidat-v18532) |
| mess-c | detached | 516e704a | ja (Vorfahre) |
| mess-d | detached | 78d66a63 | ja (Vorfahre) |
| mess-haenger | detached | a20e1444 | ja (Vorfahre) |
| mess-kmw | detached | 9f50dc1d | ja (Vorfahre) |
| mess-v533 | detached | 2f237817 | ja (Vorfahre) |
| welle-m-boosts | welle-m-boosts | cce9da43 | ja |
| welle-m-brennglas | welle-m-brennglas | 3da7e286 | ja |
| welle-m-fahren | welle-m-fahren | 7f97d339 | ja |
| welle-m-impuls | welle-m-impuls | 35ba704c | ja |
| welle-m-nexus | welle-m-nexus | dc877d19 | ja |
| welle-m-schatten | welle-m-schatten | bf01c035 | ja |

Kein Detached-Worktree trug Änderungen, daher gibt es keinen `sicherung/omen-0910-*`-Branch.
Werkzeug für die Tabelle: `p3/sicherung-inventar.sh`.

## Wo die Instrumente liegen

- **Messfolge:** `scripts/omen-messfolge.cjs` + `scripts/werkbank.cjs` + `scripts/lib/` aus dem neuesten Stand, der sie trägt
  (EIN Instrument für beide Seiten; die gemessene Seite liefert nur die Welt über `PORT=4312 node save-server.js`).
- **Serien-Hüllen und Auswertungen** im Ordner `p3/`:
  - `serie-0710-9.sh` + `auswertung-0710-9.cjs`: Vorlage für die nächste ABAB mit Blind-Regel, Hänger, zerlegen und band genesis;
  - `serie-0710-10/11.sh`, `auswertung-0710-10/11.cjs`;
  - `ci-warte.sh` (CI über die GitHub-API per curl, gh fehlt hier);
  - die Zähler `raum-zaehler.js`, `render-*.js`, `seg-zaehler.js`, `kap-zaehler.js`;
  - Schatten-Erkundung `schatten-erkunden.*` und `schatten/`.
- **Ältere Werkzeuge:** `p2/` (Host-VRAM: boot.sh, bilder.sh, vergleich.cjs …), `abab535/serie.sh` (Hänger je Boot),
  `koordination/bericht/0710-1-p1/serie.sh` + `auswertung.cjs`.
- **Scratch alter Sitzungen** (lag nur in `%TEMP%`): `werkzeug-0910/scratch-7a635cf9/` und `werkzeug-0910/scratch-a67cd5fb/`.
- **Rohdaten** der Serien: `abab*`, `ab53*`, `messfolge0710`, `mess-*` … direkt im Ordner.

## Sicherung 0910-S

Bericht: `bericht/0910-omen-sicherung.md`. Kopien unter `koordination:kontext/omen-sicherung-0910/`:
- Werkbank-JSON und Perf-Spuren je Worktree;
- die Vorher-Bilder von 0710-12;
- die Mess-Berichte des Mess-Klons;
- `ordner/` (diese Übergabe, Logs, stdout);
- `werkzeug/` (p2, p3, Scratch);
- `gedaechtnis/`.
