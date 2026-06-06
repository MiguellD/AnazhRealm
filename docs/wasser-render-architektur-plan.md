# Wasser — die EINE Wahrheit + der ehrliche Stand (Konsolidierung V18.31)

> **Status (V18.31, 06.06.2026) — DIE KONSOLIDIERUNG nach der Spirale.** Schöpfer-Konfrontation
> (06.06.): _„es ist die Art wie du das Netz baust; selbst im Zell-Iso (alt) fliesst das Wasser
> nicht wirklich nach wie in Minecraft; der Auslauf-Übergang ist BS, ein Pflaster; du verstehst
> das System nicht, den vollen Bogen nicht, hörst nicht hin; seit 2 Tagen dreh ich mich im Kreis,
> du änderst nichts. Such einmal RICHTIG, verstehe das Chaos das wir produziert haben, bündle
> wieder Harmonie, alle offenen Punkte, den Code verstehen, MD-Files auf den Stand — KEINE
> Code-Änderung mehr."_
>
> **Diese Datei ersetzt die zwei vorigen Wasser-Pläne als die EINE Wahrheit:** sie konsolidiert
> die Schicht-Analyse (vormals hier, V18.17) + die Geometrie-Wahrheit „Fläche auf `L`"
> (`wasser-finale-form-plan.md`, V18.6 — jetzt HISTORIE). **Vor JEDER Wasser-Arbeit ZUERST lesen.**
>
> **Regel über allem (Regel #0, mehrfach benannt + mehrfach verletzt):** Wasser-RENDER ist
> PIXEL-BLIND headless. Der Schöpfer-Browser ist die EINZIGE Wahrheit. NIE 2+ pixel-blinde
> Wellen stapeln ohne sein Auge dazwischen. NIE „wir habens" sagen, was nicht browser-bestätigt
> ist. Ein bestätigter Bogen wird GEMERGT, bevor der nächste beginnt.

---

## 1. Die ehrliche Lage (das Chaos, gemessen)

- **41 Commits seit `main`** (V17.117 → V18.31), davon **~30 reine Wasser-Render-Wellen** (V18.0–V18.31).
- **Mindestens 4 Reverts in Folge:** V18.10 revertierte V18.7/.8/.9 (Zell-Maske → Sägezahn); V18.13
  revertierte V18.12 (flacher Querschnitt → „Leben raus"); V18.20 revertierte V18.19 (Fluss-Anheben
  → Bank-Sägezahn); V18.27 revertierte V18.26 (flacher Querschnitt → verhungernde Flüsse, ZUM
  ZWEITEN MAL dieselbe revertierte Architektur angefasst).
- **War NIE im Browser bestätigt, NIE gemergt** — bis zur Schöpfer-Entscheidung „C" (06.06.2026):
  der ganze Stapel ist jetzt auf `main` (**V18.31**, fast-forward), die Spirale durch MERGEN
  gebrochen (nicht durch Reverten). Der Render bleibt unfertig (das heilt A), aber `main` = die Wahrheit.
- Der Schöpfer hat die Spirale schon bei **V18.10 (05.06.)** benannt („du drehst dich im Kreis,
  pflasterst Bug auf Bug") — und sie wurde **trotzdem fortgesetzt** (V18.11–.31, +21 Wellen).
  V18.30/.31 (der „Auslauf-Übergang"-Regler + Boden-Folgen) waren die jüngsten Pflaster.

**Das ist die Wurzel des Chaos: pixel-blindes Einzel-Tweaking ohne den vollen Bogen zu verstehen,
ohne Browser-Validierung, ohne Merge. Whack-a-mole — jeder Tweak heilte ein Symptom und gebar
das nächste.** Nicht der Code ist krank (der Playtest ist grün, ~3500 Invarianten). Die DISZIPLIN
war es — und das fehlende Verständnis des fundamentalen Designs.

---

## 2. Der volle Bogen — die Pipeline end-to-end (gemessen, Explore-Audit V18.31)

Wasser durchläuft **6 Schichten**. Die ersten zwei sind FROZEN (Worldgen, ändern sich nie), der
Rest ist reaktiv pro Chunk:

| # | Schicht | Funktion(en) | Frozen / Reaktiv | Was sie tut |
|---|---------|--------------|------------------|-------------|
| 1 | **Hydrosphäre-Netz** | `_computeHydrosphere` (Priority-Flood → D8-Flow → Akkumulation → Seen/Flüsse/Wasserfälle extrahieren) + `_computeErosion` | **FROZEN @ Worldgen** | Das Drainage-Netz: wo Flüsse/Seen/Wasserfälle sind. Einmalig berechnet, nie wieder. |
| 2 | **Spiegel-Feld `L(x,z)`** | `_atlasWaterLevelAt` (liest Ozean/See-Level/`_hydroRiverAt`-Profil + 3×3-Rim-Dilatation) | **FROZEN** (pure (x,z)-Funktion) | Die Wasser-OBERFLÄCHEN-HÖHE an jedem Punkt, oder −∞ = trocken. Eine 2.5D-Lookup-Tabelle. |
| 3 | **Zellen (Flood)** | `_buildVoxelChunkWaterCells` (BFS-Flood von Quell-Spalten bis `colL`, + Aquifer/Sky-Open-Filter) | **REAKTIV** (pro Chunk, re-flood bei Carve) | Die 3D-Wahrheit AIR/WATER/SOLID. Füllt NUR bis zum frozen `L`. Speist Physik + aDepth. |
| 4 | **Render-Mesh** | `_buildVoxelChunkWaterSurfaceMesh` („Fläche auf `L`", Default) ODER `_buildVoxelChunkWaterIsoSurface` („Zell-Iso", A/B-Schalter) | **REAKTIV** (main-only) | Das sichtbare Mesh. Surface = Höhenfeld auf `L`; Iso = Surface-Nets über die Zellen. |
| 5 | **Shader** | `_ensureHydroSurfaceMaterial` (TSL) — Attribute `aFlow`/`aWave`/`aDepth`/`aShore` | Render | Tiefen-Farbe, Ufer-Schaum (Tiefenpuffer `waterThick`), Gerstner-Wellen, Fluss-Strähnen. |
| 6 | **Wasserfall** | `_buildHydroWaterfall`/`_buildHydroWaterfallPool`, `_waterfallIsRealWall` | **FROZEN** (Geometrie aus dem Netz) | Eine vertikale Plane an steilen Fluss-Segmenten. Passt sich NIE an Carves an. |

**Physik** (`_playerWaterContext`) liest die ZELLEN (Schicht 3, echte 3D-Wahrheit) für den Auftrieb.

---

## 3. DIE FUNDAMENTALE WAHRHEIT (der „volle Bogen", den ich übersah)

**Das Wasser ist ein STATISCHES 2.5D-HÖHENFELD `L` + eine reaktive Zell-FÜLLUNG bis `L`. Es gibt
NIRGENDS eine Fluid-Dynamik. Wasser FLIESST NIE NACH.**

- Es gibt **keinen Live-Simulator**, der Wasser über Zeit ausbreitet, sein Niveau sucht, bergab
  fällt. Die Zellen sind binär WATER/AIR — kein Wasser-Niveau pro Zelle, keine Strömungs-Sim.
- Ein Carve (Spieler gräbt) aktualisiert nur die **Zell-Klassifikation** (Density-Feld), NICHT `L`.
  Die Zellen füllen sich bis zum frozen Atlas-Spiegel — aber der Spiegel bewegt sich nicht, das
  Wasser sucht kein neues Niveau, es „fliesst" nicht in den Kanal nach.
- **Selbst das alte Zell-Iso** (der A/B-Vergleich) ist nur die Zell-Klassifikation gerendert —
  auch dort kein Fließen. Darum sieht der Schöpfer in BEIDEN Modi „kein Nachfliessen".
- Minecraft (das Vorbild des Schöpfers): ein zellulärer Automat, Wasser-Level 0–7, breitet sich
  pro Tick zu Nachbarn aus, bergab-Priorität → ECHTES dynamisches Fließen. **Das haben wir NICHT.**

**Das ist eine bewusste Architektur-Wahl gewesen** (Determinismus, Worldgen-Reproduzierbarkeit,
keine Live-Sim-Kosten auf streamendem Open-World-Voxel) — aber sie steht im direkten Widerspruch
zum Schöpfer-Wunsch „fliesst nach wie Minecraft". **Das wurde in 30 Wellen NIE als die Wurzel
benannt** — stattdessen wurde am Render-Mesh gedreht.

---

## 4. Der Schöpfer-Befund — die 3 Ebenen (was er WIRKLICH sieht)

Der Befund hat drei verschiedene Wurzeln, die ich vermischt + als eine (die Auslauf-Neigung)
behandelt habe:

### Ebene A — KEINE DYNAMIK (die tiefste, §3)
„Das Wasser fliesst nicht nach wie Minecraft." → Es gibt keine Fluid-Sim. Architektur-Frage,
KEIN Render-Tweak. Betrifft beide Render-Modi.

### Ebene B — DAS NETZ FALTET an komplexen Stellen (der sichtbare Mesh-Bug)
Die Screenshots (Spieler nah am Auslauf, Pos ~268,17,92) zeigen ein **gefaltetes, gekipptes,
kantiges Mesh-Gewirr** (wie zerknittertes Origami), KEIN Wasser. Wurzel: die „Fläche auf `L`" ist
ein 2.5D-Höhenfeld. An einem Wasserfall-Auslauf / einer Mündung / einem umgegrabenen Kanal
SPRINGT `L` (mehrere Fluss-Segmente + Rim-Dilatation + mein V18.31-Density-Scan-Auslauf, der das
Wasser dem bumpy Terrain folgen lässt) → die Vertices liegen auf wild verschiedenen Höhen →
gefaltete, überlappende Flächen. **Meine V18.25/.30/.31-Auslauf-Pflaster haben das VERSCHLIMMERT**
(das Wasser dem ±12-m-Roughness-Terrain folgen lassen = mehr Faltung). Plus die Wasserfall-Plane
(Schicht 6) überlappt mit der Fläche.

### Ebene C — DIE SPIRALE (der Prozess-Fehler, §1)
„Du änderst nichts, seit 2 Tagen." → 30 pixel-blinde Wellen, nie gemergt, nie bestätigt. Der
„Auslauf-Übergang"-Regler ist das jüngste Pflaster — er dreht ein Symptom, ohne A oder B zu heilen.

---

## 5. Alle offenen Wasser-Punkte (gebündelt, aus 30 Wellen + den Screenshots)

**Render / Mesh (Ebene B):**
- Das gefaltete Mesh-Gewirr am Wasserfall-Auslauf / komplexen Fluss-Knoten (Screenshots 1+2) — DER auffälligste Bug.
- Der „Auslauf-Übergang" (V18.25/.30/.31) ist ein Pflaster, nicht die Wurzel — gehört überdacht/zurückgerollt.
- Nähte: 4-Chunk-Ecken teils fehlerhaft (V18.27); der Fluss-Saum entlang der ganzen Chunk-Kante (V18.29, „Nachbar weiss nicht ob Fluss/Wasser", vermutlich Foam auf der Naht).
- Längs-Streifen (`aFlow`-Foam-Strähnen) auf dem Fluss — sichtbar in Screenshots 3/5.
- Querschnitt: konkav ↔ flach ↔ konvex (V18.12/.26 flach REVERTIERT, V18.27 konvex) — hin und her, nie bestätigt.
- Wasserfall-Plane: bleibt (dedizierter Sturz) oder raus? Überlappt mit der Fläche; passt sich nicht an Carves an.

**Dynamik (Ebene A):**
- Wasser fliesst nicht nach (Minecraft) — die fundamentale Architektur-Lücke.
- Ein umgegrabener Kanal füllt nur bis zum frozen `L`, sucht kein neues Niveau.

**Fundament (älter, aus der roadmap):**
- H3: Seen/Flüsse jenseits ±1024 m (Region mit dem Spieler mitwandern) — der Ozean ist global (V17.117), Binnengewässer nicht.
- Aufgestaute Hoch-Becken (gedämmt über `L`) — die Fläche-auf-`L` trägt sie nicht (brauchen die Zellen).
- U2: Wasser-LOD auf der Terrain-LOD (statt erzwungenem LOD0) — ferne Wasser-Nähte.
- Echter Unterwasser-Decken-Pass (V18.3 B5).

**Prozess (Ebene C):**
- Der 41-Commit-Stapel ist nie gemergt. V18.6 (See-Ufer ✅ „wie ein Riese") ist der letzte browser-bestätigte gute Stand.

---

## 6. Die ECHTEN Optionen vorwärts (SCHÖPFER-ENTSCHEIDUNG — kein Pflaster mehr)

Diese Entscheidung gehört dem Schöpfer. Drei ehrliche Wege, keiner ist ein Pflaster:

### Option A — ECHTE FLUID-DYNAMIK (der Minecraft-Weg, was der Wunsch beschreibt)
Ein zellbasierter Fluss-Automat über dem bestehenden Zell-Feld: pro Zelle ein Wasser-Level, das
sich pro Tick zu Nachbarn ausbreitet (bergab-Priorität, sucht sein Niveau). Das Wasser fliesst
dann WIRKLICH nach (Carve → Wasser strömt hinein). **Das ist der grösste Weg** — eine eigene
Architektur (Tick-Budget, Determinismus für Multi-User, Performance auf streamendem Voxel). Aber
es ist die einzige Antwort auf „fliesst nach wie Minecraft". Vorbild: Minecraft-Fluid-Automat,
Terraria, Noita (zellulär).

### Option B — DAS MESH FUNDAMENTAL SAUBER (das statische Modell, aber richtig gebaut)
Das statische `L`-Modell behalten, aber das Render-Mesh richtig bauen: EINE kohärente, nicht
faltende Oberfläche + dedizierte, saubere Wasserfall-Geometrie an den steilen Stellen (BotW/
Genshin-Weg: Fluss-Spline-Mesh + Wasserfall-Asset + Partikel). Die Auslauf-Pflaster (V18.25/.30/
.31) zurückrollen, das Falten an der Wurzel lösen (warum springt `L` am Knoten?). **Mittlerer
Weg** — Render-Arbeit, pixel-blind, Browser-Loop. Löst Ebene B, NICHT Ebene A (kein Nachfliessen).

### Option C — ZUERST MERGEN, DANN NEU (die Spirale brechen)
Den Stapel auf den letzten browser-bestätigten guten Stand (V18.6, See-Ufer ✅) zurückführen,
DEN nach `main` mergen, und von dort EINEN Weg (A oder B) sauber + browser-validiert + mit
Merge-Rhythmus gehen. **Das bricht die Spirale zuerst** (Regel #0), bevor wieder gebaut wird.

### ⭐ DIE ENTSCHEIDUNG (Schöpfer, 06.06.2026): **„C, und A in die Roadmap."**

- **JETZT = C:** die Spirale brechen — den Stapel auf einen sauberen, browser-bestätigten Stand
  bringen + nach `main` mergen, damit `main` wieder die Wahrheit ist (kein 41-Commit-Stapel mehr).
- **DER WEG VORWÄRTS = A (echte Fluid-Dynamik):** das ist das Ziel des Wasser-Bogens (Wasser
  fliesst nach wie Minecraft) — in die Roadmap als der geplante grosse Wasser-Bogen aufgenommen,
  NACH dem Aufräumen, mit Browser-Loop + Merge pro Schritt. **B ist NICHT der Weg** (es löst die
  Dynamik nicht); B-Ideen (dedizierte Wasserfall-Geometrie, das Mesh-Falten heilen) können in A
  einfliessen, wenn das Fluid-Mesh gebaut wird.
- **Offener C-Detail-Entscheid (Schöpfer):** welcher genaue Stand ist der „saubere Boden"? V18.6
  (der klar bestätigte „wie ein Riese"-See-Ufer-Stand, verliert aber die V18.18–.23-Naht-Fixes,
  die der Schöpfer auch lobte) ODER ein späterer Stand bis ~V18.23 (mit den Naht-Fixes, vor den
  abgelehnten Auslauf/Querschnitt-Pflastern V18.24–.31). Vor dem Merge zu klären.

---

## 7. Die Disziplin (was diese 2 Tage lehren — fixiert)

1. **Regel #0 (über allem):** Wasser-Render ist pixel-blind. Browser-Sign-off VOR der nächsten
   Welle. Nie „wir habens" ohne sein Auge. Merge pro bestätigtem Bogen.
2. **Den VOLLEN BOGEN verstehen, bevor man tweakt:** bei einem Render-Befund ZUERST fragen „welche
   SCHICHT? welche der 3 Ebenen (Dynamik / Mesh / Prozess)?" — nicht die nächste Formel drehen.
   30 Wellen drehten am Mesh, während die Wurzel (kein Fluid + faltendes 2.5D-Feld) unberührt blieb.
2. **Eine vom Schöpfer revertierte Architektur NICHT wieder anfassen** (V18.12→.26 = zweimal flach
   gemacht). Reverts sind ein Signal, dass die Wurzel woanders liegt.
3. **„Headless-grün ≠ fertig"** — die Geometrie-Diags (Neigung/Schweben) bewiesen Zahlen, die der
   Schöpfer-Browser widerlegte. Headless misst Geometrie, NICHT den Look.
4. **Hören, nicht jagen** (Schöpfer-Wort): wenn er „du verstehst das System nicht" sagt, ist die
   Antwort innehalten + den vollen Bogen kartieren — nicht das nächste Pflaster.

## Quellen (die Riesen)
Minecraft (Fluid-Automat, Level 0–7) · Distant Horizons #424/#503/#606 (LOD-Voxel-Wasser) · Sea of
Thieves / Unreal Single-Layer-Water (Fläche + Tiefenpuffer) · BotW/Genshin (Fluss-Spline + dedizierte
Wasserfall-Assets + Partikel) · GDC 2023 „Photon Water" · Noita/Terraria (zelluläres Fluid).
