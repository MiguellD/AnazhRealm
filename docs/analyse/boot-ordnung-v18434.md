# Boot-Ordnung V18.434+ — P0 Bühnen-Ordnung + P1 Bewegungs-Garantie

**Anlass (Schöpfer-Boot, 09.07.2026):** ab Sekunde 1 nur ~3–13 FPS, nach 4 Minuten keine
Bewegung möglich. Das Konsolen-Log zeigte: „Galaxy-Skybox erstellt" ×2 · „Seele gewechselt:
Mensch (human)" ×2 · Planeten + 2800-Sterne-Feld beim Boot · Nexus-Evolutionen evo_1..evo_14
liefen/registrierten · Grok-Chatter · Wetter-Zug (stormy) · „Sonnen-Brennglas entzündete
baum_kiefer" · zwei Impostor-Bake-Watchdog-Verwürfe (die GPU-Queue stand) — **alles, während
der Boden noch streamte und der Boot unspielbar war.**

Das Prinzip (V18.308, eine Stufe weiter): _minimum zum HANDELN, dann progressiv_ — jetzt mit
einer **kanonischen Bühnen-Wahrheit**, hinter der alles Spielfremde wartet.

## 1. Die gemessenen Doppel-Start-Wurzeln (P0.1)

| Symptom | Wurzel (exakte Sites) | Heilung |
| --- | --- | --- |
| „Galaxy-Skybox erstellt" ×2 | EIN Bau, ZWEI Log-Zeilen: der Builder loggt am Ende (`createGalaxySkybox`, vormals Z.14807) UND `init()` loggte direkt nach dem Aufruf nochmal (vormals Z.80027). Kein Doppel-Bau. | Call-Site-Log entfernt (der Builder loggt sich selbst). Plus Idempotenz-Wand am Builder-Anfang: ein zweiter Bau ERSETZT (Szene-Remove + Dispose), stapelt nie (V18.423-Canopy-Shell-Muster). |
| „Seele gewechselt: Mensch (human)" ×2 | `init()` deferiert den Avatar-Bau (V18.304, `_deferredAvatarSoul`, vormals Z.80233) — aber `loadState()` → `_loadStateRestoreSoulAndAtmosphere` (vormals Z.41262) baute die gespeicherte Seele SOFORT; der Loop-Defer baute sie 6 Frames später NOCHMAL = zwei volle Körper-Builds + Dispose auf dem 3-FPS-Boot. | (a) Der Restore respektiert den Boot-Defer: läuft er, aktualisiert der Restore nur die WAHL (`_deferredAvatarSoul = playerSoul`), der EINE Loop-Defer baut. (b) Chokepoint-Wand in `applyPlayerSoul`: JEDER erfolgreiche Bau löscht den Defer — kein Pfad kann doppelt bauen. Headless unberührt (Defer wird dort nie gesetzt). |

## 2. Die EINE Bühnen-Wahrheit (P0.2): `_buehneSteht()` + `state._buehneStand`

Das W2-Prädikat (`scripts/diag-boot-stage.cjs`) als LIVE-Methode — die BILLIGE Teilmenge:

- **RING** `_activeRingRadius ≥ min(12, chunkRingRadius)` (der Boden ist da)
- **GRAS** `pendingGrass` leer · **WASSER** `pendingWaterIso` leer
- **STREU** keine `region._deferredFoundry` (der stille Saug ist durch)
- bewusst **KEIN** Impostor-/Nebel-Term (die Bake-Queue wartet ihrerseits auf die Bühne —
  ein Impostor-Term wäre ein Deadlock by construction; der Nebel folgt dem Ring ohnehin)

Eigenschaften: **Latch** (`state._buehneStand` — einmal true, bleibt true; danach ist der
Read EIN Boolean) · **gate-treu** (headless/Null-Renderer → sofort true, der V18.275/.301-
Kurzschluss → alle Playtest-Bänder byte-gleich) · **Sicherheits-Deckel**
`AnazhRealm.BUEHNE_SETTLE_CAP_MS = 90 s` (der Ring wächst nur mit Frame-Kopfraum — eine
dauerhaft über Budget laufende Maschine erreichte das Ziel NIE; ohne Deckel verlöre der
Schöpfer Wetter/Nexus/Begleiter/Bakes für die GANZE Session und der netto last-SENKENDE
Impostor-Bake bliebe ausgesperrt = das S4-Henne-Ei eine Ebene höher; V18.276-Klasse:
ein reiner Deckel, der Schnellfall zahlt nichts).

### Die Bühnen-Gate-Liste (Chokepoint-Gates an den TICK-Quellen, nicht an N Aufrufern)

| System | Gate-Ort | Verhalten vor der Bühne |
| --- | --- | --- |
| Nexus-Evolution (Ausführung) | `_loopNexusUpdate` (top) | Queue steht, kein dslRun/Regel-Registrieren; drained danach |
| Nexus-Evolution (Registrierung) | `_loopSelfAnalysis` (`if (this.nexus && this._buehneSteht())`) | keine neue Evolution, Autonomie tickt nicht; Takt beginnt faktisch nach der Bühne |
| Grok-Proaktiv-Chatter | `grokTick` (top) | kein idle/jumpBurst/rainLong/Journal-Kommentar/emotionShift/aiTend; der Erst-Spawn-Gruß (`grokMarkFirstSpawn`, eigener Pfad) bleibt |
| Wetter-AUTO-Zug | `_loopWeatherAndGrowth` (die `weatherEffectTime ≥ 120`-Bedingung) | geladenes Wetter + Böen-Drift + Transitions laufen unverändert; nur der ZUG wartet — steht die Bühne, zieht es EINMAL weich (45-s-Transition) |
| Sonnen-Brennglas | `_tickFocusingAffordances` (top) | keine Zündung/Hitze-Akkumulation, bis der Schöpfer handeln kann |
| Saison-DRIFT | `_tickSeason` (die `autoSeason`-Advance-Bedingung) | geladene Saison + `uSeasonMul`-Tönung laufen; nur der Drift (der `_foundrySeasonChanged`-Re-Bakes triggern kann) wartet; `_lastSeasonTime` startet mit dt=0 (kein Sprung) |
| Impostor-Bake-Queue (P0.4) | `_tickImpostorBake` (nach dem Queue-Leer-Check) | kein RTT-Bake stiehlt die GPU vom Boden-Streaming (die zwei Watchdog-Hänger des Schöpfer-Logs); der Canvas-Silhouetten-Fallback trägt — nichts ist unsichtbar; danach drained sie wie heute (S4-Eager bleibt) |
| Fern-Deko (P0.3) | `_tickBootFernDeko` (Loop, neben `_tickBootPhase3`) | Planeten + 2800-Sterne-Feld bauen NACH der Bühne (`_buildSkyPlanets` + `_buildStarField`, aus `createGalaxySkybox` deferiert); Skybox/Sonne/Mond bleiben Boot (sichtbarer Himmel ab Frame 1); headless baut sofort |

**Proben-Wanderung:** `diag-idle-gpu-churn.cjs` (gpu-lens) und `diag-parity.cjs` latchen
`state._buehneStand = true` vor ihrer Messung/ihrem Bake-Drain — beide messen Steady-State,
nicht die Boot-Ordnung (sonst könnte das Prädikat mitten im Mess-Fenster schließen und
Fern-Deko-/Bake-Pipelines als falschen Churn zählen).

## 3. Die Boot-Reihenfolge (vorher → nachher, Log-Ordnung)

**VORHER (Schöpfer-Log):** Renderer → Szene → Skybox (+Log ×2) → **Planeten ×3 + 2800
Sterne** → Sonne/Mond → Avatar-Defer → loadState (**Seelen-Bau #1**) → Worldgen → Loop:
Frame 6 **Seelen-Bau #2** · Nexus-Evolutionen + Grok + Wetter-Zug + Brennglas ab dem
ersten 5-s-/Takt-Fenster · Impostor-RTT-Bakes sofort (2× Watchdog-Hänger) — alles
KONKURRIERT mit dem Boden-Streaming um die 3-FPS-Frames.

**NACHHER:** Renderer → Szene → Skybox (EIN Log) → Sonne/Mond → Avatar-Defer → loadState
(merkt nur die Seelen-WAHL) → Worldgen → Loop: Frame ~6 der EINE Seelen-Bau · der Boot
gehört exklusiv Kontrolle + Boden-Streaming + Kreaturen-P3 → **„Die Bühne steht"-Log**
(Ring am Ziel + Gras/Wasser/Streu aufgeholt, spätestens nach 90 s) → Planeten + Sterne
erscheinen · Impostor-Bakes drainen · Nexus/Grok/Wetter-Zug/Brennglas/Saison-Drift starten.
Kein System ist verloren — nur die Reihenfolge dient jetzt der Spielbarkeit.

## 4. P1 — die Bewegungs-Garantie unter Last (Linse VOR Hebel)

`scripts/diag-move-under-load.cjs` (`npm run gate:move-under-load`, CI in check.yml):
headless, Null-Renderer, foundry-ON; treibt `_gameLoopTick` mit 330-ms-Zeitsprüngen
(3 FPS) bei gehaltenem W; der Fixed-Akkumulator klemmt korrekt (0,1 s/Frame → Sim ~0,3×
Echtzeit).

**Messergebnis (Erstlauf, 09.07.2026): ALLE DREI GARANTIEN GRÜN —**

- (a) gebaute Welt: **29,60 m** horizontal über 60 schwere Ticks (`_frameOverBudget` stand)
- (b) OHNE gebauten Spieler-Chunk (gestallter Worker, Mesh kommt nie; Prämisse gehalten):
  **26,17 m** — die feld-native Kollision (V18.331) trägt die Bewegung mesh-frei
- (c) Boden-Garantie: **0 Clip-Ticks** (Körper nie im Soliden, `_fieldSolid`-Messung),
  kein Void — der Feld-Controller IST der Nachfolger des entfallenen 1-s-BVH-Ankers
  (`_ensurePlayerChunkBVH`/`PLAYER_CHUNK_STALL_MS` sind seit V18.331 raus)
- Selbst-Test: eine künstlich gepinnte Position liest als 0,000 m → die Linse feuert

**Diagnose-Konsequenz:** die Bewegungs-SIM klemmt unter Last NICHT — „nach 4 Minuten keine
Bewegung" ist kein Sim-Logik-Stau, sondern die GPU-/Render-Seite, die den Browser erstickt
(RTT-Bakes auf stehender GPU-Queue · Doppel-Avatar-Bau · Nexus-dslRuns · Fern-Deko —
genau die Arbeit, die P0 vom Boot nimmt). Die Linse steht ab jetzt als CI-Wand: jede
künftige Kopplung der Bewegung an Last/Chunk-Bau wird rot.

Hinweis zur Task-Formulierung: „Soft-Floor" und „`_ensurePlayerChunkBVH`-Anker" stammen
aus der V18.271/.274-Architektur — beide sind seit V18.331 (feld-native Kollision)
entfallen; die Linse prüft die MODERNEN Äquivalente (Feld trägt mesh-frei · nie im
Soliden · nie Void) und dokumentiert die Substitution im Kopf.

## 5. P2-Kandidaten (benannte Folge-Schritte, NICHT gebaut)

1. **Schatten-/Post-FX-Minimal-Start:** der Schatten-Pass (2. Voll-Render) + Post-FX
   könnten bis zur Bühne auf Minimal fahren (Schatten-Range am Floor, Godrays aus) und
   danach zum Regler-Ziel öffnen — heute regelt der PID sie erst REAKTIV. Achtung:
   nur Optik drosseln, nie Streaming (V18.282); der eine Regler bleibt der Aktuator.
2. **Bake-Timeout adaptiv:** `IMPOSTOR_BAKE_TIMEOUT_MS` (15 s fix) könnte mit der
   gemessenen Frame-Zeit atmen (bei 3 FPS resolvt ein Readback legitim langsamer →
   weniger falsche Watchdog-Verwürfe; bei 60 FPS früher aufgeben).
3. **Wetter-/Nexus-Sanft-Start:** nach der Bühne startet der Wetter-Zug ggf. sofort
   (weatherEffectTime ist saturiert) und die erste Nexus-Evolution folgt im ersten
   Intervall — ein optionaler „Anlauf-Versatz" (z. B. +30 s nach Bühne) wäre noch
   sanfter; bewusst NICHT gebaut (mehr Zustand für wenig Gewinn).
4. **`_buehneSteht` in `diag-boot-stage` spiegeln:** die Linse könnte zusätzlich das
   LIVE-Prädikat (`r._buehneSteht()`) gegen ihr eigenes Skript-Prädikat kreuzen
   (Drift-Wand Methode↔Linse).
