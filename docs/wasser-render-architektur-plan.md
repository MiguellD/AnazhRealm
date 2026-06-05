# Wasser-Render — die kohärente Schicht-Architektur (der Vollendungs-Plan)

> **Status:** PHASE 1–4 GEBAUT (V18.15, 05.06.2026) — Browser-Sign-off des Schöpfers offen;
> Phase 5 (Fluss-Volumen lateral↔flach) bewusst dem Auge überlassen. **GEBAUT:** Phase 1 (die
> Tiefen-Schicht liest die glatte Meter-`aDepth` statt der facetten-verratenden `waterThick`;
> `uShoreWidth`/`uDepthRange` in Metern) · Phase 2 (die Zell-Maske nachbar-lesend zurück, jetzt
> WEICH durch Phase 1) · Phase 3 (See-Wellen-Floor `uLakeRipple` + Foam-Zweige gemischt statt
> geschaltet) · Phase 4 (Wasserfall-Plane aus dem lokalen Terrain). + 3 Feinregler (Ufer-Schärfe/
> Wasser-Tiefe in Metern · See-Wellen). format/lint/Playtest grün; der LOOK = das Schöpfer-Auge.
>
> **(Ursprünglich) ANALYSE + PLAN (Stand V18.14).** Nach 15 Versionen Einzel-Tweak
> (V18.0–.14) der Schöpfer-Befund: _„die Regler, die du mir gegeben hast, ändern nichts —
> es muss das Fusionieren selbst sein, die Reihenfolge der Ebenen, wann der Shader, die
> Details, die Harmonie und Synergie."_ Dieser Plan ist die Antwort: **keine weitere Formel,
> sondern die kohärente Schicht-Architektur.** Gegründet auf einem Fremder-Blick-Audit der
> GANZEN Pipeline (gemessen, nicht geraten).
>
> **Vor jeder Wasser-Render-Arbeit ZUERST lesen.** (Ersetzt die Schicht-Sicht von
> `wasser-finale-form-plan.md` — das war die Geometrie-Wahrheit „Fläche auf `L`"; DIESER
> Plan ist die Schicht-FUSION darüber.)

---

## Die Wurzel-Erkenntnis (die Schöpfer-Wurzel, bestätigt)

Der Wasser-Render ist ein **STAPEL von Effekten**, über Jahre angesammelt — Gerstner-Wellen
(V8.33) · Schaum (V9.48) · Tiefenpuffer-Ufer (V13.5) · Fläche-auf-`L` (V18.6) · Makro-Kontext
(V18.14). **Jede Welle legte eine SCHICHT dazu, aber sie FUSIONIEREN nicht — sie kämpfen.**
Die Regler ändern nichts, weil das Problem die **Schicht-ORDNUNG + die QUELLE jeder Schicht**
ist, nicht der Parameter. 15 Versionen drehten EINE Variable (Spiegel-Formel · Maske · Flow ·
Flachheit · Schaum); jede heilte ein Symptom und gebar das nächste. Whack-a-mole. Das
DOMINANTE Problem (das Kaleidoskop-Chaos) blieb dabei **unberührt** — gedreht wurde die
Geometrie, krank war der Shader.

---

## Die gemessenen Wurzel-Probleme (gerankt — Fremder-Blick-Audit, headless gemessen wo möglich)

1. **DOMINANT — das KALEIDOSKOP = die Tiefen-Versöhnung legt die facettierte Sohle frei.**
   `waterThick = viewportLinearDepth − linearDepth(depth)` liest durch das Wasser auf die
   **Surface-Nets-Voxel-Sohle** (facettiert — V17.107 mass `dot(N,L)` STD 0.333, bimodal).
   `uShoreWidth=0.0045` / `uDepthRange=0.03` sind **razor-dünne VIEWPORT-Tiefe-Einheiten**
   (über near..far). GEMESSEN: die Sohle rippelt **~1–2 m pro 1.5 m** (p90 2 m, max 7.8 m)
   → `shoreLine`/`deepen` oszillieren in **Kontur-Bänder** = das Kaleidoskop, am schlimmsten
   im flachen Wasser (dort sitzt `waterThick` exakt im steilen Teil beider smoothsteps).
   **Der Schaum-Regler (uDepthFoam) berührte uShoreWidth/uDepthRange NIE → darum änderte er
   nichts.** Quelle: `deepen`(`:22400`)→`baseCol`(`:22409`); `shoreLine`(`:22399`)→`depthFoam`.

2. **Die Fläche SCHWEBT ~16 m über die echte Uferlinie (45 % der Vertices über KEINEM Wasser).**
   Die V18.8-Zell-Maske ist REVERTED (V18.10) → die Maske ist nur `L > -Infinity` (Rim-Domäne,
   `_buildVoxelChunkWaterSurfaceMesh:19556`). 45 % der Fläche liegt über **trockener
   facettierter Sohle**, wo `waterThick` winzig + maximal chaotisch ist → das **vergrössert die
   Kaleidoskop-Zone massiv** UND ist das „abgeschnittene Ufer / trockener Nachbar-Chunk".

3. **Seen haben aWave=0 → KEINE Wellen (gemessen: aWave min=max=0 auf dem nassesten Chunk).**
   Das `aWave`-Tor nullt über dem Meeresspiegel (`:19499`) → Seen perfekt flach. Der „See hatte
   mal Wellen"-Rückschritt: Seen hatten NIE echte Wellen — der Ozean-Gerstner ist see-aus.

4. **Der Fluss-Spiegel KIPPT lateral (V18.7 reverted).** `surfaceY = _terrainMacroSurfaceY(x,z)
   − depth·0.4` am LATERALEN Punkt (`:21194`, Worker `:500`) → der Spiegel rollt quer mit dem
   Makro-Terrain (Sacken in der Mitte / Kippen). **Umstritten:** V18.12 (flach, nur Längs-`t`)
   nahm das VOLUMEN (Schöpfer: „das Leben aus dem Fluss"). Eine Querschnitt-Frage fürs Auge.

5. **NAHT Fluss↔See↔Ozean = harter `cond`-Foam-Branch-Schalter + binäres aWave.** Die zwei
   Foam-Zweige (Fluss-Strähnen `riverFoam` vs See-Schimmer `lakeFoam`) schalten HART via `cond`
   (`:22459`) am Mündung; `aWave` ist trotz „Ramp" effektiv binär (11 % der Fluss-Punkte tragen
   fälschlich Ozean-Wellen). → der Shader „hebt die Naht hervor, statt über das Mesh zu wirken".

6. **Wasserfall-Plane FEHLPOSITIONIERT.** Höhe/Orientierung aus dem 16-m-Drainage-Raster
   (`wf.voxelY`, `_waterLevelAt`), nicht dem lokalen Surface-Nets-Terrain (`:22128-22146`); der
   `atan2(flowX,flowZ)`-Winkel folgt dem Fluss-Segment, nicht dem lokalen Hang. Das V18.14-Steil-
   Tor cullt die gemessenen **85 % Hang-Fälle** (gut); die echten Wände nehmen noch Raster-Geometrie.

**Messbar (vor dem Bau): Sohle-Rippel (#1), Float-% (#2), aWave=0 (#3), Steilheit (#6).
Pixel-only (Browser): die finalen Konturen, die Naht-Hervorhebung, die Plane-Winkel.**

---

## Die kohärente Architektur (von den Riesen)

Sea of Thieves · Unreal Single-Layer-Water · GDC-2023-„Photon Water" · BotW/Genshin:
**EINE flache Top-Fläche**; die Tiefen-Versöhnung in **WELT-METERN** mit **WEITEM, tiefpass-
geglättetem** Abfall (die facettierte Sohle wird NIE Konturen); der Schaum aus einer
**flow-gescrollten Textur**, gegated durch eine **GLATTE Meter-Tiefe** (NICHT view-space
`waterThick` auf Facetten-Skala); ein **konstantes sanftes See-Kräuseln** (entkoppelt vom
Ozean-Tor); die Foam-Zweige **GEMISCHT**, nicht geschaltet; die Ausdehnung **MASKIERT** auf
echtes Wasser (zell-bewusst, nachbar-lesend).

---

## DER PLAN — die Reihenfolge IST der Punkt

> **Die Schlüssel-Einsicht, die alles verbindet (und meinen V18.10-Revert korrigiert):**
> V18.8 (Maske) + razor-dünner Tiefen-Shader = harter **Sägezahn** (darum revertete ich die
> Maske). V18.8 (Maske) + **WEITER Meter-Tiefen-Shader = WEICHES Ufer.** Ich revertete das
> FALSCHE — die Maske war halb-richtig, sie brauchte nur den weiten Tiefen-Shader, um weich zu
> werden. Darum: **zuerst der Tiefen-Shader (Phase 1), DANN die Maske (Phase 2) — zusammen.**

### Phase 1 — DIE TIEFEN-SCHICHT NEU GRÜNDEN (Wurzel #1, das Kaleidoskop) — der Schlussstein
Die **Tiefen-Farbe + der Schaum lesen die GLATTE Meter-Tiefe** (`aDepth` = echte Wassersäule
aus den Zellen, ggf. tiefpass), NICHT die facetten-verratende view-space `waterThick`. Die
`waterThick` macht NUR noch den finalen, pixel-präzisen Ufer-Alpha-Saum — und der wird **WEIT**
(in Welt-Metern umgerechnet, mehrere Meter), tiefpass, damit die ±1–2-m-Sohle-Rippel nie bandet.
- `aDepth` (Meter, glatt) → `deepen` (Tiefen-Farbe) + die Schaum-Tiefe, mehrere-Meter-Abfall.
- `waterThick` → NUR der finale Alpha-Edge (weit, nicht 0.0045).
- Messbar: die Tiefen-Term-Eingabe ist nicht mehr die rippelnde Sohle; die Bänder verschwinden.

### Phase 2 — DIE AUSDEHNUNG BINDEN (Wurzel #2 + #6-Schnitt-Ufer)
Die Zell-Maske (V18.8 `colWetAt`, **nachbar-lesend** V18.9) zurück — ABER jetzt WEICH, weil
Phase 1 den Rand mit dem weiten Tiefen-Fade auflöst (kein Sägezahn mehr). Die Fläche sitzt auf
echtem Wasser (Float 45 %→0), das Schnitt-Ufer + der trockene Nachbar heilen mit (die
8-Nachbar-Lesung + Re-Enqueue). **Die Maske + der weite Tiefen-Shader sind EIN Schritt-Paar.**

### Phase 3 — DIE WASSER-PERSÖNLICHKEITEN (Wurzeln #3, #5)
- **See:** ein konstantes sanftes Kräuseln, entkoppelt vom Ozean-`aWave` (ein `aRipple`-Floor /
  eine niedrig-amplitudige Gerstner-Schicht), damit Seen leben.
- **Foam-Zweige GEMISCHT** (lerp nach einem glatten Fluss-Faktor `smoothstep(length(aFlow))`),
  nicht `cond`-geschaltet → keine Naht am Mündung.
- **aWave** ein echt glatter, WEITER Ramp (oder ein Distanz-zum-Ozean-Feld) → die Mündung fadet.

### Phase 4 — DER WASSERFALL (Wurzel #6-Rest)
Höhe/Orientierung aus dem LOKALEN Terrain (Lippe/Basis via `_voxelSurfaceY`, Gradient-Richtung),
nicht dem Drainage-Raster. Das V18.14-Steil-Tor bleibt (cullt die 85 % Hänge).

### Phase 5 — DAS FLUSS-VOLUMEN (Wurzel #4, mit dem Auge)
Lateral (Volumen, V18.11) vs flach (kein Kippen, V18.7) ist eine **Querschnitt-Frage, die der
Schöpfer am Bild entscheidet — NACHDEM das Kaleidoskop weg ist** (jetzt überlagert es alles).
Vermutlich ein **sanftes Quer-Glätten** (Mischung lateral↔flach), nicht 100 % flach.

---

## Die Disziplin (was die 15 Versionen lehren — für die Zukunft fixiert)
1. **KEIN Einzel-Variable-Tweak mehr.** Die Architektur (Schicht-QUELLE + ORDNUNG) ist das Ding.
2. **Jede Schicht liest die RICHTIGE Quelle:** Tiefen-Farbe/Schaum ← glatte Meter-Tiefe; Alpha-
   Edge ← weite `waterThick`; Ausdehnung ← Zellen (nachbar-lesend); Persönlichkeit ← Makro-Kontext.
3. **Messbar (die Eingaben) vor dem Bau**, der finale Look ist der Browser + die Regler.
4. **Ein Revert kann das FALSCHE treffen** (die Maske war halb-richtig; der Tiefen-Shader war die
   Wurzel). Bei einem Symptom mit zwei Verdächtigen: beide messen, bevor man einen revertet.
5. **CLAUDE.md-Gotchas waren stale** (V18.6-Maske + V18.7-Fluss als live beschrieben, beide
   reverted) — IMMER gegen `git HEAD` prüfen, nicht den Doc.

## Quellen (die Riesen)
Sea of Thieves · Unreal Single-Layer-Water · GDC 2023 „Photon Water" (unified sim+render, CDLOD)
· BotW/Genshin (Tiefen-Fade mehrere Meter + flow-Schaum + dedizierte Wasserfall-Geometrie) ·
Distant Horizons #424/#503/#606 (das Profi-LOD-Voxel-Wasser mit unseren exakten Bugs).
