// AnazhRealm — Strict-Audit-Suite
//
// Generische Audit-Tests die Bug-Klassen abdecken, die in V8.13-V8.22 mehrfach
// durchgerutscht sind. Drei Schichten (die vierte ist entfernt):
//
//   1. State-Field-Audit: scan source für this.state.X.Y.Z reads, prüft gegen
//      live state-Initialisierung nach Init(). Fängt typos wie
//      state.workshopPreview vs state.workshop.preview.
//
//   2. CSS-Variable-Audit: alle `var(--X)` Verwendungen müssen via `--X:` im
//      :root (oder body) definiert sein. Fängt undefinierten Variablen wie
//      --parch-paper.
//
//   3. Soft-Default-Audit: bekannte Default-Strings (Grok, Schöpfer) sollten
//      nur in DEFAULT_*-Konstanten oder state-init existieren, nicht hardcoded
//      in mehreren Pfaden. Fängt Hardcoded-Refs.
//
//   (entfernt) Public-Method-Smoke-Test — „jede public Methode blind
//      ohne Args aufrufen": Prämisse unsound für diesen Codebase (Worldgen/
//      Avatar/Worker-Methoden exekutieren beim Blind-Call schwere async-Arbeit →
//      Event-Loop-Hunger/Page-Overload, in JEDER Variante flacky) + fand nur
//      False-Positives (args-brauchende Methoden), NULL echte Bugs. Die echte
//      Methoden-Wahrheit trägt der Playtest (5081 Invarianten).
//
// Lauf via `npm run audit:strict`. Strikter als playtest (auch warnings
// werden zu exits).

const { starteBrowser, nullRenderer, ROOT, startProc, eigenePorte, warteAufWelt, hauptLauf } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const INDEX_HTML = path.join(ROOT, "index.html");

let failures = [];
let warnings = [];

function fail(category, msg, detail) {
    failures.push({ category, msg, detail });
    console.log(`  ❌ [${category}] ${msg}${detail ? ` — ${detail}` : ""}`);
}
function warn(category, msg, detail) {
    warnings.push({ category, msg, detail });
    console.log(`  ⚠️  [${category}] ${msg}${detail ? ` — ${detail}` : ""}`);
}
function pass(category, msg) {
    console.log(`  ✅ [${category}] ${msg}`);
}

// ============================================================
// 2. CSS-Variable-Audit — statische Source-Analyse
// ============================================================
function auditCssVariables() {
    console.log("\n=== CSS-Variable-Audit ===");
    const html = fs.readFileSync(INDEX_HTML, "utf8");
    // Definitionen: `--name:` innerhalb von Style-Block
    const defRe = /--([a-zA-Z][\w-]*)\s*:/g;
    const defs = new Set();
    let m;
    while ((m = defRe.exec(html))) defs.add(m[1]);
    // Verwendungen OHNE Fallback: `var(--name)` ohne Komma
    // (Mit Fallback `var(--name, x)` ist OK — Browser nimmt den Fallback.)
    const useNoFallbackRe = /var\(\s*--([a-zA-Z][\w-]*)\s*\)/g;
    const useWithFallbackRe = /var\(\s*--([a-zA-Z][\w-]*)\s*,/g;
    const usesNoFallback = new Set();
    const usesWithFallback = new Set();
    while ((m = useNoFallbackRe.exec(html))) usesNoFallback.add(m[1]);
    while ((m = useWithFallbackRe.exec(html))) usesWithFallback.add(m[1]);
    let undefinedCount = 0;
    for (const u of usesNoFallback) {
        if (!defs.has(u)) {
            fail("CSS-VAR", `--${u} wird in var() OHNE Fallback verwendet aber nicht definiert`, "");
            undefinedCount++;
        }
    }
    // Mit-Fallback-Refs auf nicht-definierte Vars als Warning (akzeptabel,
    // Browser nimmt Fallback — aber Hinweis dass die Variable evtl. gewollt war)
    for (const u of usesWithFallback) {
        if (!defs.has(u) && !usesNoFallback.has(u)) {
            warn(
                "CSS-VAR",
                `--${u} nur mit Fallback verwendet, nicht im :root definiert`,
                "Fallback greift, aber Var sollte ergänzt werden für Konsistenz"
            );
        }
    }
    if (undefinedCount === 0) {
        const totalUses = usesNoFallback.size + usesWithFallback.size;
        pass("CSS-VAR", `${totalUses} verwendete CSS-Variablen, alle ohne-Fallback definiert (${defs.size} defs)`);
    }
}

// ============================================================
// 3. Soft-Default-Audit — Hardcoded-Strings
// ============================================================
function auditSoftDefaults() {
    console.log("\n=== Soft-Default-Audit ===");
    const src = stammLib.text(ROOT);
    const checks = [
        {
            literal: "Grok",
            max: 12,
            note: "Begleiter-Name sollte über state.grok.companionName referenziert werden",
        },
        {
            literal: "Schöpfer",
            max: 14,
            note: "Avatar-Name sollte über state.player.name referenziert werden",
        },
    ];
    for (const c of checks) {
        const re = new RegExp(`"${c.literal}"|'${c.literal}'|\`${c.literal}\``, "g");
        const matches = src.match(re) || [];
        const count = matches.length;
        if (count > c.max) {
            warn("SOFT-DEFAULT", `"${c.literal}" hardcoded ${count}× (Limit ${c.max})`, c.note);
        } else {
            pass("SOFT-DEFAULT", `"${c.literal}" hardcoded ${count}× (Limit ${c.max} OK)`);
        }
    }
}

// ============================================================
// 1. State-Field-Audit (browser-basiert)
// der frühere 4. „Public-Method-Smoke" (jede public Methode blind ohne Args
// aufrufen) ist ENTFERNT: seine Prämisse ist für diesen Codebase unsound — ~20 Methoden
// (Worldgen/Avatar/Skybox/Worker) EXEKUTIEREN beim Blind-Call massive async-Arbeit →
// Event-Loop-Hunger + Page-Overload („Target closed"), in JEDER Variante (await=Hang,
// fire-and-forget=Overload, Isolation=last-empfindlich, Zeitbudget=Loop bricht nicht).
// Und er fand über 8 Läufe NUR False-Positives (Methoden, die legitim Args brauchen:
// logError/setVec/spawnCreatureAt …) — NULL echte Bugs. Ein nicht-CI-gated Passagier,
// der Flakiness ZÜCHTETE. Die echte Methoden-Wahrheit trägt der Playtest (5081
// Invarianten, der die Welt bootet + die Methoden in echten Szenarien übt).
// ============================================================
async function auditStateAndMethods() {
    console.log("\n=== State-Field-Audit (Headless) ===");
    // der eigene save-server auf dem eigenen Port (AUDIT_PORT, sonst ein freier des Systems — nie 4312), bereit am Ereignis
    const [port] = await eigenePorte("AUDIT_PORT");
    const server = await startProc("save-server.js", /läuft/, { PORT: String(port) });

    const browser = await starteBrowser({ art: "standard", zusatz: ["--autoplay-policy=no-user-gesture-required"] });
    try {
        const page = await browser.newPage();
        // GPU-FREI booten (Null-Renderer), wie das Mechanik-Gate: der State-Audit
        // liest nie ein Pixel (nur State-Pfade) → der echte swiftshader-Renderer ist reine
        // Crash-Quelle. Die No-op-Hülle bootet schneller + ohne GPU-Tod-Risiko.
        await nullRenderer(page);
        await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
        // die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`) — bis K-WANDUHR 12 s Wanduhr
        await warteAufWelt(page);
        await page.evaluate(() => window.__weltStehtNach());

        // (a) State-Pfade live sammeln
        const liveState = await page.evaluate(() => {
            if (!r) return null;
            const visited = new Set();
            const paths = [];
            const walk = (obj, prefix) => {
                if (!obj || typeof obj !== "object") return;
                if (visited.has(obj)) return; // Zyklus-Schutz
                if (Array.isArray(obj)) return; // Arrays nicht traversieren
                visited.add(obj);
                for (const key of Object.keys(obj)) {
                    const childPath = prefix ? `${prefix}.${key}` : key;
                    paths.push(childPath);
                    // Nur eine Ebene tiefer — verhindert exponentielles Wachstum
                    if (prefix.split(".").length < 3 && obj[key] && typeof obj[key] === "object") {
                        walk(obj[key], childPath);
                    }
                }
            };
            walk(st, "");
            return paths;
        });

        if (!liveState) {
            fail("STATE", "window.anazhRealm.state nicht erreichbar");
        } else {
            // Source-Code scannen für this.state.X.Y.Z reads
            const src = stammLib.text(ROOT);
            // Regex für `this.state.X.Y.Z` (max 3 Ebenen, nur einfache Identifier)
            const re = /this\.state\.([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*){0,2})/g;
            const usedPaths = new Set();
            let m;
            while ((m = re.exec(src))) {
                usedPaths.add(m[1]);
            }

            // Bekannt-fehlerhafte / dynamische Pfade die wir whitelisten
            const whitelist = new Set([
                // Lazy-init Pfade (werden erst nach User-Geste gesetzt)
                "workshop.preview",
                // Lazy game-loop-Feld: die pitch-gesteuerte Wunsch-
                // Kamera-Höhe, vom Render-Loop pro Frame gespiegelt (nie in
                // init() gesetzt — der Playtest liest sie umgebungs-unabhängig).
                "_cameraDesiredY",
                // ABSCHIEDS-WELLE (Drift-Nachlese, Disziplin — jedes Feld am
                // Lese-Ort geprüft): drei pre-existierende, undefined-SICHERE Felder:
                // foliageBlades = Opt-out-Toggle, der eine Leser prüft `!== false`
                // (undefined == an, wie die Schwestern-Toggles).
                "foliageBlades",
                // worldField = lazy-init Noise-Feld-Cache (worldFieldAt: `if (!state.
                // worldField || seed-Wechsel) neu` — jeder Leser läuft durch den Init).
                "worldField",
                "worldField.seed",
                "worldField.rngNoise",
                // _frameChunksBuilt = transienter Frame-Scheduler-Zustand:
                // der Scheduler setzt ihn am Frame-Anfang auf false, Leser truthy-only.
                "_frameChunksBuilt",
                // Lazy-set State-Felder (werden bei Bedarf gesetzt, default
                // via `state.X || fallback`-Pattern als undefined akzeptiert).
                // Echte Bugs wären HIER nicht — Schöpfer-Reflexion:
                // diese Felder sind alle defensiv gelesen.
                "lastCreatureProactiveSpeech",
                "inventoryHoverLast",
                "lastCreatureLlmRareEvent",
                "_pendingCreatureSnapshots",
                "pendingImport",
                "_zoomActive",
                "inventorySelected",
                "inventoryOpen",
                "drag",
                "_groundedCache",
                "_groundedCachedAt",
                "_statsHudLastTick",
                "_statsHudTooltipLastTick",
                "logbookVisible",
                "creatureProactiveSpeechEnabled",
                "keybindRebind",
                "uiActiveDrawer",
                "customSouls",
                "consumables",
                "vegetation",
                "tools",
                "materials",
                "workshop",
                // Lazy-init Maps/Sets/Caches (alle: if (!state.X) state.X = new Map(); ?? -Infinity)
                "worldId", // `|| "realm"` Fallback in fingerprint
                "nexusWirk", // `=== undefined`-Gate vor Init in §Nexus
                "visitedRegions", // Set lazy-init im Explore-Tick
                "lastExploreFelt", // Map lazy-init im Explore-Tick
                "voxelChunkGrassLod", // Map lazy-init im LOD-Build
                "grantedCapabilities", // Set lazy-init bei Capability-Grant
                // Library/Feed-State (alle: `state.X || fallback` / `if (X)`-Gates)
                "feedSort",
                "feedKind",
                "feedFocusId",
                "feedPreview",
                "feedFollows",
                "_libraryAuthorFilter",
                "hofFocusId",
                "hofGestenExpanded",
                "hofNexusExpanded",
                "hofStage",
                "ichStage",
                "capabilityProposals",
                "blueprintEditHistory",
                // Lebendiges Feld (Overlays — alle lazy-init mit `if (!state.X)`)
                "lifeField",
                "emotionField",
                "wohlBaseline",
                // Tick-Memoization (-Infinity Sentinel)
                "_lastDayNightApply",
                "_jumpPressedAt",
                // Versöhnung der Whitelist mit den lazy-Feldern, die
                // die Wasser-CA-, Perf-, Scatter- und
                // Worldgen-Bögen einführten. JEDES Feld unten ist VERIFIZIERT
                // entweder `if (!state.X) state.X = …`-guarded ODER undefined-
                // sicher (Flag/Sentinel/Scratch) — kein echter read-before-init.
                // Wasser-CA (alle `if (!state.X) … = new Map()/Set()`):
                "waterLevelCells",
                "waterStau",
                "waterCAActive",
                "waterSourceCols",
                "waterCABand",
                "waterCapJ",
                "waterCAScratch", // Float64Array, prev-if-realloc
                "_caFpScratch", // Float32Array, `if (!fp || fp.length<…)`-realloc
                "_caTickCount", // V18.292 — Fluss-Re-Mesh-Throttle-Zähler, `(x||0)+1` lazy-init
                // Worldgen-gesetzt (in generateTerrainWithParameters, vor jedem Tick-Read):
                "hydroTiles",
                "canopyChunks",
                "scatterRegions",
                "scatterPromoted",
                "scatterCounters",
                "scatterLookup",
                "pendingVegSpawns",
                "lastPlayerVoxelChunk", // `state.X ? state.X.cx : cx`-guarded
                // Render-Lazy-Caches (`if (state.X) return state.X` Singleton-Getter):
                "voxelChunkMaterial",
                "postProcessingUniforms", // `if (state.X && state.X.localContrast)`-guarded
                "godrayUniforms", // V8 (Kür) — lazy in `_ensurePostProcessing` gesetzt (wie postProcessingUniforms), NICHT im Snapshot; `if (state.X && …)`-guarded im _loopRender
                "_godrayScale", // V8 (Kür) — Perf-Faktor, im `_nexusPerfActuate` gesetzt, `state.X ?? 1`-sicher gelesen
                // Perf-Sense/Regelkreis:
                "_perfFrame", // `state._perfFrame || (state._perfFrame = {})`
                "_perfMarks",
                "_lastMoveT", // Zeitstempel, `state._lastMoveT || …`-sicher
                "_spaceWasDown", // Flag, undefined ist falsy
                "perfOverlay", // Toggle, `!state.perfOverlay`-sicher
                // Kreatur/Netz + Sky (Zähler/Flag, undefined-sicher):
                "_creatureNetSeq", // `(state.X || 0) + 1`
                "_herdContagionAcc", // `(state.X || 0) + delta`
                "_skyEnvFailed", // gesetzt via `st._skyEnvFailed = true` im Fehlerpfad
                // Kapazitäts-gewachsene Welt (beide undefined-sicher):
                "foliageRadius", // `state.X != null ? state.X : MAX`
                "pendingFoliageChunks", // `if (!state.X) … new Set()` / `if (state.X)`
                "_frameOverBudget", // V18.282 — Frame-über-Budget-Flag (steuert nur Optik), undefined ist falsy
                "_foliageDensityScale", // V18.277 — Dichte-Faktor, `state.X != null ? : 1`
                "_foliageMatCache", // V18.288 — geteilte Bewuchs-Materialien, `if (!state.X) state.X = new Map()`
                "_bootPhase3", // V18.308 — deferierte Boot-Arbeit (Kreaturen), `if (!state.X) return` (in _bootDeferCreatures gesetzt, im Loop gedraint, dann null)
                "_deferredAvatarSoul", // V18.304 — deferierter Avatar-Bau, am Boot gesetzt, im Loop `if (state.X)` gedraint, dann null
                "_bpEditTick", // V18.358 — Bauplan-Part-Edit-Zähler für die Recipe-Book-Signatur, `(state.X || 0) + 1`
                "treeImpostors", // Subsystem S2 (V18.387) — Impostor-Toggle, `state.X !== false` (undefined = an), lazy/undefined-sicher
                "lodUniforms", // Subsystem A (V18.387) — lazy TSL-LOD-Uniforms via `_ensureLodUniforms()`, wie windUniforms (nicht in init())
                "seasonUniforms", // V6 (Look-Finale) — Saison-Tönungs-Uniform via `_ensureSeasonUniforms()` (in init() erzeugt); abgeleitet aus seasonPhase, NICHT im Snapshot
            ]);

            // Filter: nur Top-Level oder zwei-Ebenen-Pfade prüfen (Drei-Ebenen
            // sind oft Browser-API-Wrapper wie playerMesh.position.set)
            const liveSet = new Set(liveState);
            let missingCount = 0;
            for (const used of usedPaths) {
                if (whitelist.has(used)) continue;
                // Top-Level erlauben wenn im liveSet
                const topLevel = used.split(".")[0];
                if (!liveSet.has(topLevel) && !whitelist.has(topLevel)) {
                    // Hier scheinen wir einen nicht-existenten Top-Level zu lesen
                    fail("STATE", `Lese state.${used} aber Top-Level "state.${topLevel}" nicht in init()`, "");
                    missingCount++;
                }
            }
            if (missingCount === 0) {
                pass("STATE", `${usedPaths.size} state-Pfade gescannt, alle Top-Levels in init() vorhanden`);
            }
        }
    } finally {
        await browser.close();
        server.kill();
    }
}

// ============================================================
// 5. Atmosphäre-Hardcode-Audit
// ============================================================
// Heilt eine Lehre: Atmosphäre-Schichten (Tag-Nacht, Wetter, Fauna,
// Klang) sind durchsetzt von Hardcode-Wunden wenn der Schreiber Werte aus
// dem Kopf nimmt statt aus state.beobachten. Dieser Audit pattern-matcht
// gegen drei Hardcode-Klassen INNERHALB einer Methode die mit `[ATMOSPHERE]`-
// Marker versehen ist. Andere Methoden bleiben unberührt — die Markierung
// ist die Vertrauens-Wand: wer eine Methode atmosphärisch nennt, akzeptiert
// die Disziplin.
//
// Hardcode-Klassen:
//   A) Soul-Type-Map: mehrere `if (x === "soul-name")` oder ternary mit
//      mehr als 2 Soul/Type-Strings in einer Methode → if-Map. Vision-treu
//      wäre Affinity-Pick.
//   B) Hex-Color-Arrays: mehr als 3 wörtliche `0xXXXXXX` in einer Methode →
//      hardcoded Farb-Tabelle. Vision-treu wäre Modulation aus Tags/Welt.
//      (Class-Konstanten sind ausgenommen — die sind Saat.)
//   C) Magic-Number-Frequencies: ternary mit Hz-Zahlen (60..2000) → wahr-
//      scheinlich Frequenz-Map. Vision-treu ist das klang-Gesetzbuch
//      (klang:UMWELT — die Stimme folgt dem Körper, tierRuf).
function auditAtmosphereHardcode() {
    console.log("\n=== Atmosphäre-Hardcode-Audit ===");
    const src = stammLib.text(ROOT);
    // Methode-Block extrahieren: von `[ATMOSPHERE]`-Kommentar bis zur
    // nächsten Methode (Zeile beginnt mit 4-Space + identifier(args).
    const lines = src.split("\n");
    const atmosphereMethods = [];
    // Die Methode unter dem Marker am AST (stammLib.glieder, K38-N2): ein Kopf-Muster übersah umbrochene Köpfe und Getter,
    // das Klammer-Zählen las Klammern in Zeichenketten mit.
    const gl = stammLib.glieder(src);
    for (let i = 0; i < lines.length; i++) {
        if (!/\[ATMOSPHERE\]/.test(lines[i])) continue;
        // Suche die Methode darunter (überspringe Comment-Lines)
        let j = i + 1;
        while (j < lines.length && /^\s*\/\//.test(lines[j])) j++;
        // j sollte jetzt auf der Methoden-Signatur sein
        const g = gl.find((x) => x.zeile === j + 1);
        if (!g) continue;
        atmosphereMethods.push({ name: g.name, body: src.slice(g.start, g.ende), startLine: g.zeile });
    }
    if (atmosphereMethods.length === 0) {
        warn("ATMOSPHERE", "Keine `[ATMOSPHERE]`-Marker gefunden", "Marker fehlen oder Audit-Regex passt nicht");
        return;
    }
    let cleanCount = 0;
    let warnCount = 0;
    for (const m of atmosphereMethods) {
        const { name, body } = m;
        // A) Soul-Type-Maps: zähle `=== "..."`-Vergleiche mit "soul", "sprite",
        //    "wesen", "geist", "human", "phoenix", "dragon" als Vergleichs-Wert
        const soulCompares = body.match(/=== ?["'](sprite|wesen|geist|human|phoenix|dragon|sunny|rainy)["']/g);
        if (soulCompares && soulCompares.length >= 3) {
            warn(
                "ATMOSPHERE",
                `${name}: ${soulCompares.length} Soul/Type-Vergleiche — verdacht auf if-Map`,
                "nutze _affinityPickFromCandidates oder Tag-basiertes Routing"
            );
            warnCount++;
            continue;
        }
        // B) Hex-Color-Arrays in Methode (Class-Konstanten haben eigene
        //    `static get`-Blöcke, sind nicht hier)
        const hexColors = body.match(/0x[0-9a-fA-F]{6}/g);
        if (hexColors && hexColors.length >= 4) {
            warn(
                "ATMOSPHERE",
                `${name}: ${hexColors.length} Hex-Farben in einer Methode — verdacht auf Farb-Tabelle`,
                "vermeide hardcoded Color-Map, moduliere aus Tags/Welt-Feld"
            );
            warnCount++;
            continue;
        }
        // C) Hz-Frequenz-ternary (60..2000 Hz)
        const ternaryFreq =
            body.match(/[?:]\s*\d{2,4}(?:\.\d+)?\s*:/g) || body.match(/\d{2,4}\s*:\s*\d{2,4}\s*:\s*\d{2,4}/g);
        if (ternaryFreq && ternaryFreq.length >= 2) {
            // Tiefere Prüfung: liegen die Zahlen im Hz-Range UND in derselben
            // Zeile wie "freq" oder "Hz"?
            const freqCtx = /freq\s*=\s*[\w.[\]'"]*\s*===?\s*["']/.test(body);
            if (freqCtx) {
                warn(
                    "ATMOSPHERE",
                    `${name}: Frequenz-Map aus Soul-Vergleichen erkannt`,
                    "lies das klang-Gesetzbuch (klang:UMWELT, tierRuf) — die Stimme folgt dem Körper"
                );
                warnCount++;
                continue;
            }
        }
        cleanCount++;
    }
    if (warnCount === 0) {
        pass("ATMOSPHERE", `${cleanCount}/${atmosphereMethods.length} [ATMOSPHERE]-Methoden frei von Hardcode-Mustern`);
    }
}

// ============================================================
// 5. Playtest-Skip-Gate-Audit — das `if (api.exists)`-
//    Anti-Pattern. Ein Test, der seine eigene Erwartung gegen die LIVE-API
//    pruft (`if (revokedKeys.add)`, `if (revokeKey)`), läuft still durch,
//    wenn die API anders heißt — er meldet PASS, ohne zu pruefen. Genau
//    das ließ die `revokedKeys`-Set/Object-Wunde (§6.1) durch. Die Wand
//    erzwingt: keine NEUEN Skip-Gates dieser Form in `scripts/playtest.cjs`.
//
//    Erlaubte Patterns (Zulassungs-Liste): Optional-Feature-Checks gegen
//    LAUFZEIT-Umgebungen (typeof indexedDB, typeof crypto, typeof
//    localStorage). Die Wand fängt nur den Set/Map/Array-Method-Sniff.
function auditPlaytestSkipGates() {
    console.log("\n=== Playtest-Skip-Gate-Audit (§6.5) ===");
    // der Richter: der Läufer und seine Domänen-Dateien (scripts/playtest/*.cjs, D3b) — je Zeile mit ihrer Datei
    const orte = ["playtest.cjs", ...fs.readdirSync(path.join(ROOT, "scripts", "playtest")).map((f) => "playtest/" + f)]
        .flatMap((f) => fs.readFileSync(path.join(ROOT, "scripts", f), "utf8").split("\n").map((z, i) => [z, `${f}:${i + 1}`]));
    const lines = orte.map((o) => o[0]);
    // Pattern: `if (X && X.add)`, `if (X.has)`, `if (X.delete)` — Set/Map-API-
    // Existenz-Sniff. `set` und `size` ausgenommen: `set` matcht zu viele
    // Vector3/Color/Matrix-Aufrufe (false positives), `size` ist semantisch
    // selten ein Skip-Trigger. Die drei verbleibenden Verben tragen die
    // §6.1-Bug-Klasse zuverlässig (`revokedKeys.add/has/delete`).
    const sniffRe = /if\s*\([^)]*\.(add|has|delete)\s*\)/;
    // Zulassungs-Liste: bewusste Optional-Feature-Checks (kommentar-markiert
    // mit `// audit-allow-skip-gate`).
    const allowMarker = /audit-allow-skip-gate/;
    let bad = 0;
    for (let i = 0; i < lines.length; i++) {
        const here = lines[i];
        // Kommentar-Zeilen (// am Anfang nach Whitespace, oder // vor dem if)
        // ausschließen — die Wand prüft Code, nicht Erklär-Text.
        if (/^\s*\/\//.test(here)) continue;
        if (!sniffRe.test(here)) continue;
        // Allow-Marker am Zeilen-Ende oder in der Zeile davor.
        const prev = i > 0 ? lines[i - 1] : "";
        if (allowMarker.test(here) || allowMarker.test(prev)) continue;
        fail(
            "SKIP-GATE",
            `${orte[i][1]} — verbotenes \`if (api.method)\`-Sniff-Gate`,
            here.trim().slice(0, 100)
        );
        bad++;
    }
    if (bad === 0) {
        pass("SKIP-GATE", `playtest.cjs frei von api-existence-Skip-Gates (oder explizit allow-markiert)`);
    }
}

// ============================================================
// Main
// ============================================================
hauptLauf(async () => {
    console.log("AnazhRealm Strict-Audit-Suite\n");
    auditCssVariables();
    auditSoftDefaults();
    auditAtmosphereHardcode();
    auditPlaytestSkipGates();
    await auditStateAndMethods();

    console.log("\n=== Zusammenfassung ===");
    console.log(`  Failures: ${failures.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    if (failures.length > 0) {
        console.log("\n❌ Audit nicht clean — siehe oben.");
        process.exit(1);
    } else if (warnings.length > 0) {
        console.log("\n⚠️  Warnings vorhanden, aber kein Fail. Audit pass.");
        process.exit(0);
    } else {
        console.log("\n✅ Audit komplett clean.");
        process.exit(0);
    }
});
