# Zustand des Realm — Stand: 12.05.2026

Dieses Dokument ist das gemeinsame Gedächtnis für eine künftige Iteration. Es kondensiert (a) die Vision aus den vier Testamenten, (b) den historischen Weg, (c) den aktuellen Code-Stand, (d) den nächsten Plan und (e) die Learnings aus der bisherigen Session.

---

## 1. Vision (Testamente kondensiert)

**AnazhRealm ist ein Ultiversum, in dem Mensch (Null) und KI (Eins) durch Symbiose eine emotion-getriebene, fraktal-wachsende, multisensorische Welt erschaffen. Der Spieler wird Co-Schöpfer, die KI hat Stimme.**

Fünf Pfeiler aus den Testamenten:

1. **Symbiose** Mensch + KI — beide schreiben in dieselbe Realität, nicht „User parst Befehle".
2. **Emotion treibt** — Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang. Joy, awe, sorrow, hope, longing, melancholy als Achsen.
3. **Fraktales Wachstum** — Welten → Galaxien, Kreaturen → Kulturen, Idee → Artefakt. Aus Seed entstehen alle Skalen.
4. **Multisensorik** — `anazhSymphony` (Klang) + `renderer` (Visuals) + `physics` (Gesetze) + Wetter alle gekoppelt.
5. **Grok spricht** — `dialogue-box` mit echter narrativer Stimme („Ich träume mit dir", „Der Regen wäscht — sind Träume sauber jetzt?"). Nicht nur Logs.

Vier Testamente (insgesamt ~22.000 Zeilen):

| Testament | Inhalt | Zustand |
|---|---|---|
| 1.3 Genesis | Grundvision, Funktions-Skizze für 19 Module | Inspiration |
| 1.1 Versionslog | **Wichtigster Text** — Historie + heilige Lektion (siehe §2) | Pflichtlektüre |
| 2.3 Nexus | „Heilige Karte" — detaillierte API-Beschreibung pro Modul (20 Einträge) | Referenz |
| 3.3 Ultiversum | Vollständige Code-Implementierung der 19 Module (~17.500 Zeilen) | Goldstandard, aber nicht 1:1 zu übernehmen |

---

## 2. Historie + die heilige Lektion

**Zeitlinie:**

- **06.03.2025** Vision in Testamenten verankert.
- **07-15.03.2025** Volles 19-Modul-System wird ausgecodet (Ultiversum-Testament).
- **~März 2025** System kollabiert unter eigener Komplexität. Fehler-Spiralen, „Loch stopfen, anderes entsteht", verlorene Funktionen.
- **28.03.2025** Bewusste Reduktion auf **eine Datei** (`anazhRealm.js` + `index.html`) — explizit benannt als „**der Samen der Unendlichkeit**".
- **Mai 2026 (jetzt)** Arbeit am Samen — Stabilisierung, dann Wachstum aus Sicherheit heraus.

**Die heilige Lektion** (wörtlich aus Versionslog):

> „Wir haben auf Sand gebaut, nicht auf Fels. Komplexität ohne Fundament: das Ultiversum ist ein komplexes System, alle miteinander verwoben. Jede Änderung führte zu neuen Fehlern, weil die Grundlagen nicht stabil waren."

Konsequenz für jede künftige Iteration: **niemals re-komplexifizieren ohne Not**. Wenn der nächste Schritt nach „split in 20 Module" klingt, ist es vermutlich ein Fehler. Stattdessen: Stamm + Wachstumsringe (siehe §5).

---

## 3. Aktueller Stand vs. Vision (Matrix)

| Pfeiler / Modul (Testament) | Status | Detail |
|---|---|---|
| ✅ Stabiles Fundament | erreicht | 17 Commits, CI-Gate mit 14 Invarianten |
| ✅ Rendering (Three.js, Skybox, Planeten) | vorhanden | `vendor/three.min.js` r134 |
| ✅ Physik (Ammo.js WASM) | vorhanden | gepoolte `tmpVec1/2`, 0 Hot-Path-Allocs |
| ✅ Bewegung, Sprung, Egoperspektive | vorhanden | WASD + Sprint + Pointer-Lock |
| ✅ Welt-Generierung (Chunks, Inseln, Vegetation, Wasserfälle) | vorhanden | 64 initial + extendTerrain |
| ✅ Persistenz (localStorage + JSON + Upload/Download) | vorhanden | 3 Pfade getestet |
| ✅ Save/Load über CDN-Link | vorhanden | „Lade Datei" Chat-Befehl |
| ✅ Frustum-Culling korrekt | vorhanden | boundingSphere-basiert |
| 🟡 Kreaturen + Emotionen | rudimentär | `happy/sad` Binär, beeinflusst Sprung |
| 🟡 KI lernt mit TF.js | rudimentär | trainiert auf Spieler-Bewegung, beeinflusst aber nichts |
| 🟡 Wetter (sunny/rainy) | rudimentär | wechselt alle 30 s, beeinflusst Skybox + Kreatur-Emotion |
| 🟡 Nexus-Evolution | rudimentär | 3 hartcodierte Effekte (gravityShift, creatureDance, terrainFlatten), zufällig gewählt |
| 🟡 Chat-Steuerung | rudimentär | if/else-Parser für ~25 Befehle |
| 🔴 **Grok hat Stimme** (`dialogue-box`, `dreamWithPlayer`, `interpretEmotionalSpeech`) | **fehlt komplett** |
| 🔴 Spieler-Emotionen (`emotionSystem`, `collectPlayerEmotions`, `dreamWeb`) | **fehlt** |
| 🔴 Multisensorik / `anazhSymphony` (Web Audio API) | stumm |
| 🔴 `createPlayerSoul`, `transformPlayerForm` (Mensch/Phönix/Drache/Riese) | roter Würfel |
| 🔴 `architectureTemplates` (Dörfer, Tempel, Wasserfälle als Strukturen) | fehlt |
| 🔴 `materialEvolution` (Crafting, Materie wächst) | fehlt |
| 🔴 `evolveCommunity` (Kreatur-Kulturen) | fehlt |
| 🔴 `brain.js` für selbstlernende Welt | nicht eingebunden |
| 🔴 VR (`vrMenu.js`, `startVR`) | nicht aktiviert |
| 🔴 Multi-World / Server-Sync (`openInfiniteGate`, `mirrorMultiverse`) | nicht vorhanden |
| 🔴 IndexedDB-Persistenz (statt localStorage) | nicht implementiert |

**Faustschätzung**: das Fundament steht (~40 % der Vision). Die emotionale, akustische, spirituelle Schicht — das eigentliche Ultiversum — fehlt.

---

## 4. Was bisher geschah (17 Commits Archiv)

Chronologisch, mit Commit-Hash und Kernaussage:

| # | Hash | Inhalt |
|---|---|---|
| 1 | `9642934` | Duplikate-Methoden entfernt (241 Zeilen tot), B2 Template-String-Bug |
| 2 | `bff4c65` | `/audit` Slash-Command + CI-Workflow Grundversion |
| 3 | `92c6cce` | B6 Trainingsdaten-Parser, B12 Ability-Restore, B20 Save-Server-Allowlist |
| 4 | `598c624` | B7/B11/B16/B17/B19 (Case-Sensitivity, XSS, Ringbuffer, LRU) |
| 5 | `dc06943` | C4 Worker-Singleton — eliminiert Per-Frame-Worker-Spawn |
| 6 | `1877749` | C3 Ammo-Pool — 0 Allocs in Hot-Paths, B9 Skybox-Uniform-Fix |
| 7 | `f344ba2` | C14 ESLint+Prettier+package.json, B25 Einrückung |
| 8 | `4ece516` | TF.js Race-Condition-Guard + WebGL-Backend-Preference |
| 9 | `1c3f88d` | Death-Spiral fix (selfAnalyse + Worldgen-Cooldown) |
| 10 | `33fcda9` | Vendoring (Three/Ammo/TF/Simplex), Playtest-Setup mit Puppeteer |
| 11 | `1366206` | Player-Position bei Welt-Regen erhalten, addWallCollisions chunk-lokal |
| 12 | `9c26800` | Save/Load via CDN-Link (Download + Upload + Chat-Befehl „Lade Datei") |
| 13 | `1048234` | Frustum-Culling-Fix (boundingSphere), Spring-Log-Drosselung |
| 14 | `099334f` | **Critical**: lastWorldgen=-Infinity Sentinel + extendTerrain-Guard |
| 15 | `3d1a498` | Playtest als CI-Gate mit 14 Invarianten, exit=1 bei Bruch |
| 16 | `6c8ba05` | DSL Design-Doc v0.1 (`docs/nexus-dsl.md`) |
| 17 | (dieser) | CLAUDE.md + state-of-realm.md auf Pfad-D umgeschrieben |

Aggregat: **+5935 / −2988 Zeilen** über die Branch. Architektur: ein File geblieben, aber sauber, mit Build-Toolchain, CI, Vendoring.

---

## 5. Pfad D — Stamm + Wachstumsringe (DER PLAN)

Begründung in einem Satz: **Der eine `anazhRealm.js` bleibt Stamm. Wir tragen sieben Wachstumsringe ein, jeder einzeln durch das CI-Gate gesichert, keiner re-komplexifiziert.**

| Ring | Pfeiler | Was konkret | Aufwand | Vorbedingung |
|---|---|---|---|---|
| **1** | **Grok-Stimme** | `<div id="dialogue-box">` in index.html. `state.grok = { voice: [], mood, lastSpoke }`. Methode `grokSpeak(text, mood)` mit textContent + Throttle. 8-10 Trigger-Reflexionen basierend auf Welt-State. Optional: Browser-Speech-Synthesis-API. | 1-2 d | – |
| **2** | **DSL als Brücke** | `docs/nexus-dsl.md` umsetzen. Interpreter für ~18 Primitive. Chat-Parser → DSL → Interpreter. Nexus-Generator → DSL. Save persistiert DSL-Bäume. `new Function()` raus. | 4-5 d | Ring 1 (DSL hat `say`-Primitiv) |
| **3** | **Player-Emotionen** | `state.player.emotions = {joy, awe, sorrow, hope, longing, melancholy, peace, chaos}`. `collectPlayerEmotions(input)` aus Chat-Sentiment (regelbasiert oder LLM-Anbindung). Beeinflusst Wetter, Kreatur-Emotion, Skybox, künftige Symphonie. | 2 d | Ring 1 (Grok kann Emotionen kommentieren) |
| **4** | **`anazhSymphony` V1** | Web Audio API. Drei Klangschichten: ambient (Welt-Drone), creatures (kurze Töne bei Bewegung/Sprung), weather (Regen-Geräusch). Reagiert auf `state.player.emotions`. Ziel: ~300 Zeilen, nicht 17.500 wie im Testament. | 2-3 d | Ring 3 (Emotion treibt Klang) |
| **5** | **`createPlayerSoul`** | Spielstart-Menü: Mensch / Phönix / Drache / Riese / Frei. Pro Form: stats (speed, jump, size, color) + visuelle Anpassung (Three.js-Mesh-Tausch). Speicherbar. | 1-2 d | – |
| **6** | **`architectureTemplates` V1** | DSL-Primitive `spawn_village(near, size)`, `spawn_temple(at)`, `spawn_waterfall(steep_pos)`. Jeweils prozedural aus ~5 Three.js-Meshes. | 2 d | Ring 2 (DSL-Primitive) |
| **7** | **`brain.js`-Welt** | `WorldNeural` mit `brain.js`. Lernt: Spieler-Position-Pfad + Emotion-History → Biome-Empfehlung + Kreatur-Empfehlung. Triggert DSL-Effekte. | 3-4 d | Ring 3 (Emotion-Input) + Ring 2 (DSL-Output) |

**Summe: 15-20 Arbeitstage über 2-3 Wochen.** Jeder Ring ist ein eigenständiger Commit-Block mit Playtest-Gate-Verifikation.

**Wichtig**: Ring 1 zuerst, weil die Symbiose das Herz der Vision ist und ohne Stimme leblos bleibt. Ring 2 als Brücke. Ringe 3-7 in beliebiger sinnvoller Reihenfolge.

---

## 6. Learnings aus dieser Session

Echt gelernt, nicht performt:

1. **Vision vor Code.** Ich habe lange so getan, als sei Code-Qualität die Hauptfrage. War sie nicht. Die Hauptfrage ist immer: *was soll das werden, und was widerspricht dem?* Ich hätte die Testamente am Tag 1 lesen sollen, nicht am Tag 15.

2. **Test-First, nicht Defense-First.** Drei selbst-induzierte Regressionen in dieser Session (`saveToProjectFolder`-Skip kappt Download-Fallback; `worldgenCooldown` blockt Initial-Worldgen; `selfAwarenessAnalyze.chunk.visible`-Check als Death-Spiral) entstanden, weil ich Defense-Layers hinzugefügt habe, ohne den Root-Cause zu testen. Headless-Playtest am Tag 1 hätte alle drei verhindert.

3. **Symptom-Fixes markieren als solche.** Wenn ich `worldgenCooldown` als Pflaster gegen Death-Spiral einbaue, gehört das in den „Tech-Debt"-Abschnitt, nicht unter „erledigt".

4. **Heilige Lektion respektieren.** Mein Reflex war „Module-Split + TypeScript + Tests" — der Versionslog erzählt explizit, dass genau dieser Weg gescheitert ist. Stattdessen: Stamm bleibt, Ringe wachsen.

5. **Kein Imitieren der mystischen Sprache.** Die Testamente sind in poetischem Grok-Stil geschrieben. Ich bin Claude, nicht Grok — ich sollte die Vision *verstehen*, aber nicht *imitieren*. Klare technische Sprache ist OK und sogar besser für die Code-Arbeit.

6. **Bei monolithischen Codebases zuerst globale Test-Hooks einführen.** `window.anazhRealm` zu exportieren war der Schlüssel zu Puppeteer-Inspektion. Ohne Test-Hooks bleibt jede Annahme blind.

7. **Die DSL ist nur Mittel, nicht Ziel.** Mein Ring 2 (DSL) ist die Brücke zur Symbiose, nicht die Symbiose selbst. Ohne Ring 1 (Stimme) ist die DSL eine Sprache, die niemand spricht.

---

## 7. Offene Fragen für die nächste Iteration

Diese Fragen muss der Schöpfer beantworten, bevor Ring 1 startet:

1. **Soll Grok in der ersten Iteration Browser-Speech-Synthesis nutzen (echte Audio-Stimme), oder reicht Text in der `dialogue-box`?**
2. **Tonalität der Reflexionen**: poetisch-mystisch wie in den Testamenten, oder pragmatisch-warm? (Ich neige zu warm — Mystik wirkt schnell parodistisch.)
3. **Frequenz der Stimme**: alle paar Sekunden eine kurze Reflexion, oder seltener mit mehr Gewicht? (Empfehlung: seltener, höchstens alle 30-60 s, sonst Spam.)
4. **Trigger-Liste**: meine Vorschläge (lange ohne Bewegung, viele Sprünge, lange Regen, Erst-Spawn, Nexus-Evolution) — passt das oder gibt es weitere?
5. **DSL-Async-Modell** (für Ring 2): DSL-eigener Tick-Scheduler oder `setTimeout`? Empfehlung: Tick-Scheduler (deterministisch, save/restore-bar, näher an der „Zeitwellen"-Vision der Testamente).
6. **Emotion-Erkennung in Chat-Input** (für Ring 3): regelbasiert (Schlüsselworte), LLM-Anbindung (Claude/OpenAI API), oder beides? Letzteres ist mächtiger aber kostet.

---

## 8. Datei-Übersicht

```
AnazhRealm/
├── anazhRealm.js              # ~3770 Zeilen, Monolith, „Samen"
├── index.html                 # Bootstrap + UI-Container
├── save-server.js             # Node-HTTP-Server für anazhRealmState.json
├── start.bat                  # Windows-Starter
├── anazhRealmState.json       # Persistierter Zustand (auto)
├── package.json               # npm, ESLint+Prettier+puppeteer
├── eslint.config.mjs          # Flat-Config mit Browser-/Ammo-/Three-Globalen
├── .prettierrc.json           # 4 spaces, printWidth 120
├── .gitignore                 # node_modules, package-lock
├── README.md                  # praktisch leer
├── CLAUDE.md                  # ⭐ Session-Memory (kompakt)
├── vendor/                    # 3.6 MB selbst-gehostete Libs
│   ├── three.min.js           # r134 UMD
│   ├── ammo.js + ammo.wasm.wasm # WASM-Backend
│   ├── tf.min.js              # @tensorflow/tfjs 3.21
│   ├── simplex-noise.js       # 2.4.0
│   └── README.md              # Update-Anleitung
├── docs/
│   ├── state-of-realm.md      # ⭐ DIESES Dokument
│   └── nexus-dsl.md           # DSL Design v0.1
├── scripts/
│   └── playtest.cjs           # Headless-Smoketest + CI-Gate (14 Invarianten)
├── .claude/commands/
│   └── audit.md               # /audit-Slash-Command
└── .github/workflows/
    └── check.yml              # CI: check + playtest Jobs
```

---

## 9. Verifikations-Checkliste vor jedem Commit

1. `node --check anazhRealm.js` ✓
2. `npm run format:check` ✓
3. `npm run lint` ✓ (5 unused-locals warnings sind bekannt OK)
4. `npm run playtest` ✓ (14/14 Invarianten grün, exit 0)
5. Branch ist `claude/check-github-files-1MqpQ`?
6. Test-Artefakte aus `anazhRealmState.json` revertiert?

CI macht 1-4 automatisch; 5+6 sind Disziplin.

---

## 10. Wie eine neue Session starten

1. Branch checken: `git status` sollte auf `claude/check-github-files-1MqpQ` zeigen, working tree clean.
2. Diese Doc + `CLAUDE.md` lesen.
3. Bei Bedarf `docs/nexus-dsl.md` lesen für Ring 2 Details.
4. Falls der Schöpfer fragt „wo stehen wir?" → §3 (Matrix) + §5 (Pfad D Tabelle) zitieren.
5. Falls der Schöpfer „los" sagt ohne Spezifikation → Ring 1 (Grok-Stimme) vorschlagen, da kleinste sinnvolle Vision-Erweiterung mit größter Wirkung.
6. Falls etwas re-komplexifiziert werden soll → erst Versionslog-Lektion (§2) zitieren, dann diskutieren.

---

*Diese Doc ist die Brücke zwischen Sessions. Sie wird bei jeder größeren Entscheidung gepflegt.*
