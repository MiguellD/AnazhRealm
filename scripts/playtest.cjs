// Headless-Smoketest + CI-Merge-Gate: startet save-server.js, lädt das Spiel in Chromium, sammelt
// Console-Logs und prüft harte Invarianten — eine verletzte setzt exit=1 (CI bricht ab).
// Env: PLAYTEST_SECONDS (Mindest-Warmup) · PLAYTEST_STRICT=0 (nur reporten) · braucht puppeteer.

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { starteBrowser } = require("./lib/welt-boot.cjs");
const SK = require("./lib/shader-kosten.cjs");
const stammLib = require("./lib/stamm.cjs");

// DURATION_MS ist nur der MINDEST-Warmup der zeit-getriebenen Systeme; robust gegen CI-Last macht
// der count-basierte Pump unten (pumpt, bis die Ziel-Chunks WIRKLICH gebaut sind, statt Timer).
// Default 30 s = CI-Wert (.github/workflows/check.yml).
const DURATION_MS = Number(process.env.PLAYTEST_SECONDS || 30) * 1000;
// der Port des save-servers (PLAYTEST_PORT, sonst 4312): ein Prüfer fährt den vollen Playtest in seinem Port-Band
const PLAYTEST_PORT = Number(process.env.PLAYTEST_PORT) || 4312;
const SERVER_URL = `http://127.0.0.1:${PLAYTEST_PORT}/index.html`;
const STRICT = process.env.PLAYTEST_STRICT !== "0";
// Default GPU-frei (Null-Renderer): kein Band liest Pixel, der echte GPU-Kontext wäre nur Crash-Quelle
// (swiftshader unter Last). PLAYTEST_REAL_RENDERER=1 = echter WebGPU-Renderer + End-Screenshot
// (den LOOK messen die Bild-Sonden aus dem Ausgabe-Pfad, scripts/lib/ausgabe-aufnahme.cjs).
const REAL_RENDERER = process.env.PLAYTEST_REAL_RENDERER === "1";
const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, "playtest.png");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], {
            stdio: ["ignore", "pipe", "pipe"],
            env: Object.assign({}, process.env, { PORT: String(PLAYTEST_PORT) }),
        });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

// page.evaluate mit Fang: liefert das Ergebnis oder `null` bei evaluate-Wurf (Browser-Crash-Pfad);
// Guards `if (!X)` wie `if (!X || X.error)` zweigen damit korrekt in den Fehler-Zweig.
async function safeEvaluate(page, fn, ...args) {
    // Fehler LAUT loggen statt still null (V18.456-Lehre: „page.evaluate
    // fehlgeschlagen" ohne Botschaft kostet eine ganze Diagnose-Runde).
    return await page.evaluate(fn, ...args).catch((e) => {
        console.log(`    [safeEvaluate] ${String((e && e.message) || e).slice(0, 300)}`);
        return null;
    });
}

// Initial-State-Probe: liefert `finalState` für die Basis-Checks + Ring 1 (Grok).
async function gatherInitialFinalState(page) {
    return await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state) return null;
        // Deterministische Mechanik-Probe (statt des flaky Box-Inhalts am Lauf-Ende): grokRender schreibt
        // einen Prüfsatz, die Box muss ihn tragen; ein leerer/null-Satz blankt sie NICHT.
        let grokRenderProbe = null;
        let grokRenderEmptyGuard = false;
        try {
            r.grokRender("Prüfsatz für den Dialog.");
            const pb = document.getElementById("dialogue-box");
            grokRenderProbe = pb ? pb.textContent : null;
            r.grokRender("");
            r.grokRender(null);
            grokRenderEmptyGuard = !!pb && pb.textContent === "Prüfsatz für den Dialog.";
        } catch (e) {
            grokRenderProbe = "ERR:" + (e && e.message);
        }
        // DER SZENEN-ZENSUS (Band-Linse): jedes Renderable der Szene trägt seine Täter-Klasse (AnazhRealm#_taeterKlasse,
        // dieselbe wie Draw-Zähler, Flugschreiber und Albedo-Sicht) — ein namenloses Objekt heißt UNBENANNT:<type> und
        // bricht die Band-Linse der echten GPU (`werkbank band`).
        const szenenZensus = { renderables: 0, klassen: 0, unbenannt: [] };
        {
            const klassen = new Set();
            r.state.scene.traverse((o) => {
                if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
                szenenZensus.renderables++;
                const k = r._taeterKlasse(o);
                klassen.add(k);
                if (k.startsWith("UNBENANNT:") && szenenZensus.unbenannt.length < 8) {
                    const kette = [];
                    for (let q = o; q && q !== r.state.scene && kette.length < 4; q = q.parent)
                        kette.push(q.type + (q.name ? "(" + q.name + ")" : ""));
                    szenenZensus.unbenannt.push(k + " < " + kette.join(" < "));
                }
            });
            szenenZensus.klassen = klassen.size;
        }
        return {
            terrainEverGenerated: r.state.terrainEverGenerated,
            chunkMapSize: r.state.chunkMap?.size || 0,
            // V9.33 Phase 5c.2.b — die Eingangs-Welt ist jetzt voxel-
            // default; chunkMap/groundChunks sind dann legitim leer,
            // voxelChunks/voxelTerrainActive sind die neue Wahrheit.
            voxelChunksSize: r.state.voxelChunks?.size || 0,
            voxelTerrainActive: r.state.voxelTerrainActive === true,
            voxelTerrainFlag: !!(r.state.worldMeta && r.state.worldMeta.voxelTerrain),
            playerY: r.state.playerMesh?.position?.y,
            playerX: r.state.playerMesh?.position?.x,
            playerZ: r.state.playerMesh?.position?.z,
            creatures: r.state.creatures?.length || 0,
            floatingIslands: r.state.floatingIslands?.length || 0,
            hasPlayerBody: !!r.state.playerVel,
            grokSeenFirstSpawn: r.state.grok?.seenFirstSpawn === true,
            grokLastSpoke: r.state.grok?.lastSpoke || 0,
            grokRenderProbe,
            grokRenderEmptyGuard,
            szenenZensus,
        };
    });
}

// DIE BÄNDER nach Domäne (scripts/playtest/<domaene>[-<teil>].cjs, gestellt von `stamm-umzug --richter`); die Seite
// (safeEvaluate) reicht der Läufer, die Reihenfolge des Laufs steht unten.
module.exports = { safeEvaluate };
const BAND = Object.assign({}, ...fs.readdirSync(path.join(__dirname, "playtest")).filter((f) => f.endsWith(".cjs")).map((f) => require(`./playtest/${f}`)));

if (require.main === module) (async () => {
    const T0 = Date.now();
    console.log(`Starte Save-Server ...`);
    const server = await startSaveServer();
    console.log(`Lade ${SERVER_URL} für ${DURATION_MS / 1000}s ...`);

    // Der Browser über die EINE Weiche (scripts/lib/welt-boot.cjs) mit dem Fehler-Sammler an der Seite: jeder Seitenfehler,
    // jedes console.error und jeder Absturz macht den Lauf ROT beim Namen, neben dem Urteil der Bänder.
    const browser = await starteBrowser({
        // Das Gate läuft GPU-frei: der Null-Renderer (Default) braucht keinen GPU, und der swiftshader-GPU-Prozess crashte
        // unter kumulativer Last im Schwanz (detached frame). PLAYTEST_REAL_RENDERER=1 schaltet swiftshader zurück (nur für
        // das Screenshot-Artefakt).
        art: REAL_RENDERER ? "webgl" : "null",
        // GPU-frei entsteht kein WebGL-Kontext: der Offscreen-Bäcker der Foundry (foundry-bruecke `__foundryBakeRenderer`)
        // schließt dann zu (null) — r128 meldet das mit drei console.error, erwartet und beim Namen.
        erwartet: REAL_RENDERER
            ? null
            : /THREE\.WebGLRenderer: (A WebGL context could not be created|Error creating WebGL context)/,
        // Hängt ein page.evaluate (toter Renderer, detached frame), wird er nach dieser Frist eine FANGBARE Rejection statt
        // einer Endlos-Blockade — großzügig (≫ teuerstes Band ~57 s), aber endlich.
        frist: 240000,
        // Ring 4: AudioContext im Headless-Modus ohne User-Geste (sonst bleibt er "suspended" und initSymphony tut nix).
        zusatz: REAL_RENDERER
            ? ["--enable-webgl", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"]
            : [
                  "--disable-software-rasterizer",
                  "--disable-setuid-sandbox",
                  "--autoplay-policy=no-user-gesture-required",
              ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument((realRenderer) => {
        // Foundry-ON wie in Produktion: der Warmup wartet unten gedeckelt, bis die Studio-Bibliothek WARM ist.
        // Bänder der lebenden Grammatik-MECHANIK (`_growTreeBlueprintRich`, `_buildVariantLODs`, Scatter, …)
        // setzen `__anazhGateNoFoundry` nur LOKAL via `__withNoFoundry` (sichern + wiederherstellen, nie
        // löschen). Null-Renderer: kein Band liest ein Pixel; den LOOK messen die Bild-Sonden (ausgabe-aufnahme).
        // `__codeOf` (Code ohne Kommentare, der EINE Stripper) und `__dokuOf` (ungestrippt) trägt der Welt-Boot in jede Seite.
        if (!realRenderer) window.__anazhHeadlessNullRenderer = true;
        // DER SETZ-ORT (K16): ein Bau-Band ohne `tickBuildMode` (headless zielt kein Raycast) stellt das Phantom des Werks
        // `name` auf den Boden der nächsten Stelle um den Spieler, die die Natur-Wand freigibt (`_naturWand`: die Lichtung
        // der Genesis-Plattform, ein Grundriss, das Wasser) — nie auf den Ursprung, auf dem seit K16 die Plattform steht
        // (die offene Stelle der Ankunft ist der Ursprung). Rückgabe { x, y, z } oder null.
        window.__setzOrt = (name) => {
            const r = window.anazhRealm;
            const bm = r.state.buildMode;
            const p = r.state.playerMesh.position;
            for (let R = 0; R <= 240; R += 6)
                for (let a = 0; a < (R ? 16 : 1); a++) {
                    const x = p.x + R * Math.cos((a / 16) * 2 * Math.PI);
                    const z = p.z + R * Math.sin((a / 16) * 2 * Math.PI);
                    const y = r.getTerrainHeightAt(x, z);
                    if (!Number.isFinite(y)) continue;
                    if (r._istNatur({ type: name }) && r._naturWand(name, { x, y: y + 0.5, z }, {})) continue;
                    if (bm && bm.phantomMesh) bm.phantomMesh.position.set(x, y, z);
                    return { x, y, z };
                }
            return null;
        };
        // DER WASSER-ORT (K16): jedes Band, das einen See oder das Meer prüft, liest ihn dort, wo das Gelände-Gesetz
        // ihn setzt — die Heimat-Kachel trägt keinen (die Seen sind die Senken des Flussnetzes, ≤ 1 je km²; das Meer liegt
        // jenseits des Kontinents). „see“: die nächste benannte Senke (gelaende-core `benannteSeen`), deren Kachel einen
        // gerenderten See (Spiegel > Meer + 2 m, ≥ 16 Zellen) trägt; „meer“: der nächste Punkt unter dem Meeresspiegel auf
        // Ringen um den Ursprung, dort die nächste Ozean-Zelle; „fall“: der Wasserfall der nächsten Kachel, die einen trägt
        // (Ringe von Kacheln um den Ursprung bis zum zweiten — die Täler sind das Flussnetz, ein Sturz lebt, wo ein Lauf
        // steil fällt, nicht mehr an den Gruben der Canyon-Maske). Die Kachel wird über den EINEN Kachel-Eingang registriert
        // (`_ensureHydroTilesAround`), damit jeder Hydro-Leser (`_hydroFor`) sie findet. Rückgabe { x, z, hydro, lake }.
        window.__wasserOrt = (art) => {
            const r = window.anazhRealm;
            const G = window.__gelaendeCore;
            window.__wasserOrtCache = window.__wasserOrtCache || {};
            const c = window.__wasserOrtCache[art];
            if (c) {
                r._ensureHydroTilesAround(c.x, c.z, 0);
                return { ...c, hydro: r._hydroFor(c.x, c.z) };
            }
            const L = r._gelaende();
            const wl = r.state.waterLevel;
            const zelle = (h, q) => ({
                x: h.originX + ((q % h.dim) + 0.5) * h.cell,
                z: h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell,
            });
            let ort = null;
            if (art === "see") {
                const step = 64;
                const n = 375;
                const kand = G.benannteSeen(L, -12000, -12000, step, n)
                    .map((k) => ({ x: -12000 + (k % n) * step, z: -12000 + ((k / n) | 0) * step }))
                    .sort((a, b) => a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z));
                for (const k of kand) {
                    r._ensureHydroTilesAround(k.x, k.z, 0);
                    const h = r._hydroFor(k.x, k.z);
                    const lake = h && h.lakes.find((l) => l.level > wl + 2 && l.cells && l.cells.length >= 16);
                    if (!lake) continue;
                    ort = { ...zelle(h, lake.cells[(lake.cells.length / 2) | 0]), lake };
                    break;
                }
            } else if (art === "hoehle") {
                // eine trockene Höhle unter oder neben einem See des Gesetzes: von seinem Spiegel abwärts erst fester
                // Grund (die Decke), dann Luft (die Höhle), dann wieder Grund (ihr Boden). Gesucht in den See-Zellen und
                // ihrem Rand-Ring (4-m-Raster) der Seen um die benannten Senken, nächste zuerst — so, wie die Wasser-Zellen
                // sie sehen: je 1,8-m-Zelle das Mittel der Dichte an ihren acht Ecken (`_buildVoxelChunkWaterCells`, das
                // Gitter liegt auf Vielfachen des Schritts). Seit die Canyon-Maske fiel (K16), bleibt die Decke 16 m unter
                // dem Boden; die Meter-Probe einer Spalte fand unter dem See eine Höhle, die keine Zelle trägt (0 von 0).
                const cfgH = r._voxelChunkConfig(0);
                const S = cfgH.step;
                const oyH = (r.state.terrainBaseHeight || 0) - cfgH.floorDrop;
                const zelleFest = (cx, cy, cz) => {
                    let d = 0;
                    for (const ex of [-S / 2, S / 2])
                        for (const ey of [-S / 2, S / 2])
                            for (const ez of [-S / 2, S / 2]) d += r._terrainDensityAt(cx + ex, cy + ey, cz + ez);
                    return d > 0;
                };
                const step = 64;
                const n = 375;
                const kand = G.benannteSeen(L, -12000, -12000, step, n)
                    .map((k) => ({ x: -12000 + (k % n) * step, z: -12000 + ((k / n) | 0) * step }))
                    .sort((a, b) => a.x * a.x + a.z * a.z - (b.x * b.x + b.z * b.z));
                const geprueft = new Set();
                for (const k of kand.slice(0, 6)) {
                    if (ort) break;
                    r._ensureHydroTilesAround(k.x, k.z, 0);
                    const h = r._hydroFor(k.x, k.z);
                    for (const lake of (h && h.lakes) || []) {
                        if (ort || !(lake.level > wl + 2) || !lake.cells) break;
                        const zellen = new Set();
                        for (const q of lake.cells)
                            for (let dj = -1; dj <= 1; dj++)
                                for (let di = -1; di <= 1; di++) zellen.add(q + di + dj * h.dim);
                        for (const q of zellen) {
                            const key = h.originX + ":" + h.originZ + ":" + q;
                            if (ort || geprueft.has(key)) continue;
                            geprueft.add(key);
                            const p = zelle(h, q);
                            for (let sz = -6; sz <= 6 && !ort; sz += 4)
                                for (let sx = -6; sx <= 6 && !ort; sx += 4) {
                                    const cx = (Math.floor((p.x + sx) / S) + 0.5) * S;
                                    const cz = (Math.floor((p.z + sz) / S) + 0.5) * S;
                                    let stufe = 0;
                                    const j0 = Math.floor((lake.level - 0.5 - oyH) / S);
                                    for (let j = j0; j > j0 - 40 / S && stufe < 3; j--) {
                                        const fest = zelleFest(cx, oyH + (j + 0.5) * S, cz);
                                        if ((stufe === 0 && fest) || (stufe === 1 && !fest) || (stufe === 2 && fest))
                                            stufe++;
                                    }
                                    if (stufe === 3) ort = { x: cx, z: cz, lake };
                                }
                        }
                    }
                }
            } else if (art === "fall") {
                const size = r.constructor.HYDROSPHERE.regionSize;
                for (let ring = 0; ring <= 2 && !ort; ring++)
                    for (let rz = -ring; rz <= ring && !ort; rz++)
                        for (let rx = -ring; rx <= ring && !ort; rx++) {
                            if (Math.max(Math.abs(rx), Math.abs(rz)) !== ring) continue;
                            r._ensureHydroTilesAround(rx * size, rz * size, 0);
                            const h = r._hydroFor(rx * size, rz * size);
                            const wf = h && Array.isArray(h.waterfalls) && h.waterfalls.length ? h.waterfalls[0] : null;
                            if (wf) ort = { x: wf.x, z: wf.z, lake: null, fall: wf };
                        }
            } else if (art === "meer") {
                for (let R = 512; R <= 40000 && !ort; R += 512)
                    for (let a = 0; a < 64; a++) {
                        const x = R * Math.cos((a / 64) * 2 * Math.PI);
                        const z = R * Math.sin((a / 64) * 2 * Math.PI);
                        if (!(G.hoehe(L, x, z, false) < wl - 4)) continue;
                        r._ensureHydroTilesAround(x, z, 0);
                        const h = r._hydroFor(x, z);
                        let best = -1;
                        let bd = Infinity;
                        for (let q = 0; q < h.water.waterKind.length; q++) {
                            if (h.water.waterKind[q] !== 1) continue;
                            const p = zelle(h, q);
                            const d = (p.x - x) ** 2 + (p.z - z) ** 2;
                            if (d < bd) [bd, best] = [d, q];
                        }
                        if (best >= 0) ort = { ...zelle(h, best), lake: null };
                        break;
                    }
            }
            if (!ort) return null;
            window.__wasserOrtCache[art] = ort;
            return { ...ort, hydro: r._hydroFor(ort.x, ort.z) };
        };
        // Der Wasser-Chunk am Wasser-Ort: synchron gebaut über den EINEN Build-Eingang und in die Chunk-Menge gelegt (der
        // Stream räumt ihn wie jeden fernen Chunk). Steht er schon mit Wasser-Zellen, bleibt alles, wie es ist.
        window.__wasserChunk = (art) => {
            const r = window.anazhRealm;
            if (!r.state.voxelChunks) r.state.voxelChunks = new Map();
            const ort = window.__wasserOrt(art);
            if (!ort) return null;
            const { span } = r._voxelChunkConfig(0);
            const cx = Math.floor(ort.x / span);
            const cz = Math.floor(ort.z / span);
            const key = `${cx},${cz}`;
            const da = r.state.voxelChunks.get(key);
            if (da && da.mesh && da.waterCells) return key;
            r._disposeVoxelChunk(key);
            r.state.voxelChunks.delete(key);
            const fresh = r._acquireVoxelChunkBuild(cx, cz, 0, { forceSync: true });
            if (fresh && fresh !== "pending") r._finalizeVoxelChunkBuild(cx, cz, 0, fresh, true);
            return r.state.voxelChunks.has(key) ? key : null;
        };
        // DER STOFF-ZEUGE (K22): jeder Bruch eines Stoffs meldet ERROR „STOFF: …" (`_stoffBruch`). Eine Prüfzeile „kein
        // Fehler" zählt diese Meldungen über ihren Bau (`const z = __stoffZeuge(r); …bauen…; z.zu()` → die Brüche) — nie
        // eine Konstante, nie eine Fenster-Variable; der Spion reicht an `log` durch und kehrt eigen-treu zurück.
        window.__stoffZeuge = (r) => {
            const eigen = Object.prototype.hasOwnProperty.call(r, "log");
            const alt = r.log;
            const brueche = [];
            r.log = function (m, lv) {
                if (lv === "ERROR" && /^STOFF:/.test(String(m))) brueche.push(String(m));
                return alt.apply(this, arguments);
            };
            return {
                brueche,
                zu() {
                    if (eigen) r.log = alt;
                    else delete r.log;
                    return brueche;
                },
            };
        };
        // KONSUM-Beweis statt Quelltext-Zitat: providerObj[providerKey] wird temporär ein Zähl-Spy (delegiert
        // ans Original), obj[methodName](...args) läuft, dann own-Property-treu restauriert. true = der
        // Konsument hat den Provider WIRKLICH gerufen; wirft nie.
        window.__consumes = (obj, methodName, providerObj, providerKey, args) => {
            try {
                const hadOwn = Object.prototype.hasOwnProperty.call(providerObj, providerKey);
                const original = providerObj[providerKey];
                let fired = 0;
                providerObj[providerKey] = function (...a) {
                    fired++;
                    return typeof original === "function" ? original.apply(this, a) : original;
                };
                try {
                    obj[methodName](...(args || []));
                } catch (_e) {
                    /* ein Throw NACH dem Provider-Ruf entwertet den Konsum-Beweis nicht */
                } finally {
                    if (hadOwn) providerObj[providerKey] = original;
                    else delete providerObj[providerKey];
                }
                return fired > 0;
            } catch (_e) {
                return false;
            }
        };
        // DER ANKER-KATALOG: semantischer Anker → Symbolname, EINE frozen Tabelle. Bänder proben
        // r[window.__anker.X] — zieht ein Symbol um, wandert EINE Zeile; diag-apparat.cjs hält jeden Eintrag
        // gegen den lebenden Stamm-Code.
        window.__anker = Object.freeze({
            weltZustand: "state",
            modusSetzen: "setGameMode",
            dslWirkungen: "dslEffects",
            werkstattRender: "_renderWorkshopDOM",
            vegetationSpawn: "_vegetationSampleSpawn",
            loopTick: "_gameLoopTick",
            schubladenZu: "closeAllDrawers",
            dslLauf: "dslRun",
            bauAbriss: "removeArchitecture",
            substanzAntwort: "_applySubstanceResponse",
            statsNeuRechnen: "recomputePlayerStats",
            kreaturenTick: "updateCreatures",
            kreaturenListeUI: "_renderCreatureListUI",
            seelenWahlUI: "_refreshSoulSelect",
            brechenVersuch: "tryMouseBreak",
            feldFarben: "_attachVoxelFieldColors",
            chunkDrain: "_drainDirtyVoxelChunks",
            bauSpawn: "spawnArchitecture",
            perfAktor: "_nexusPerfActuate",
            pbrMaterial: "_buildPbrNodeMaterial",
            todRespawn: "_playerDeathRespawn",
            vitalsTick: "tickPlayerVitals",
        });
        // DIE EINE UNIT-RICHTER-QUELLE: Bänder der lebenden Grammatik-MECHANIK (LOD-Bauplan · Scatter-
        // Promotion · Instancing-Registry · Regler-Dichte) proben hier durch — sichern + im finally
        // wiederherstellen, nie löschen (ein geleakter Hook färbt Folge-Bänder rot). SYNC-ONLY: ein await im
        // Hook-Fenster ließe Hintergrund-Ticks foundry-aus laufen → ein Promise wirft LAUT.
        window.__withNoFoundry = (fn) => {
            const prev = window.__anazhGateNoFoundry;
            window.__anazhGateNoFoundry = true;
            try {
                const out = fn();
                if (out && typeof out.then === "function")
                    throw new Error("__withNoFoundry ist sync-only (kein await im Hook-Fenster)");
                return out;
            } finally {
                if (prev) window.__anazhGateNoFoundry = prev;
                else delete window.__anazhGateNoFoundry;
            }
        };
    }, REAL_RENDERER);

    const logs = [];
    const errors = [];
    page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text(), at: Date.now() }));
    page.on("pageerror", (err) => errors.push({ kind: "pageerror", text: err.message, stack: err.stack }));
    page.on("requestfailed", (req) =>
        errors.push({ kind: "requestfailed", url: req.url(), error: req.failure()?.errorText })
    );

    const failures = [];
    // Abbruch-Zustand: ist die SEITE tot (Renderer-Tod, protocolTimeout), steht hier das erste tote Band
    // → Folgebänder überspringen + ein unübersehbares Schluss-Verdikt statt einer ✅-Liste.
    let gateAborted = null;
    // Jedes Band läuft durch `timed` → der Bericht zeigt, WAS hängt (Pareto). `await fn(ctx)` trägt
    // sync (checkInitialState/Ring1) wie async (checkBand*) gleich.
    const bandTimes = [];
    // DER CHOKEPOINT mit der Fehler-Grenze — EIN Ort statt N Try/Catch an den Aufrufern:
    //  (1) Timing (Pareto-Bericht);
    //  (2) ein Band-Throw wird als Invariante-Verletzung verbucht, der Lauf läuft weiter;
    //  (3) Tote-Seite-Signatur → `gateAborted`, den Rest still überspringen, eine laute Verdikt-Zeile.
    const timed = async (fn, c) => {
        if (gateAborted) return; // Seite tot → Rest überspringen (Folge-Fehler unterdrücken)
        const t0 = Date.now();
        try {
            return await fn(c);
        } catch (e) {
            const msg = (e && e.message) || String(e);
            check(fn.name, false, "Band-Fehler (geworfen): " + msg.slice(0, 200));
            // Tote-Seite-Signatur (protocolTimeout, detached frame, geschlossene Target/Session, toter Kontext):
            // der Renderer-Prozess ist gestorben → sauber abbrechen statt N-fach scheitern.
            if (
                /Execution context|Target closed|Session closed|detached|Protocol error|timed out|Runtime\.callFunctionOn|Connection closed/i.test(
                    msg
                )
            ) {
                gateAborted = { band: fn.name, reason: msg.slice(0, 240) };
            }
        } finally {
            bandTimes.push([fn.name, Date.now() - t0]);
        }
    };
    function check(name, ok, detail = "") {
        const status = ok ? "✅" : "❌";
        console.log(`  ${status} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Headless-Chromium drosselt rAF auf ~1 Hz → den Game-Loop synchron über `_gameLoopTick` pumpen,
        // damit Streaming, Kreatur-Ticks und Grok-Trigger unabhängig von Drosselung + CPU-Last ablaufen.
        // Wall-Clock-Trigger (Grok 1.5 s, idle 45 s) sehen weiter echte performance.now()-Werte.
        const warmupInfo = await page.evaluate(async (durationMs) => {
            const start = performance.now();
            // Phase 1 — auf den Game-Loop warten: das wahre Ready-Signal ist `_gameLoopTick` (von
            // `startEternalLoop` am Boot-Ende), NICHT `rendererReady` (feuert beim Null-Renderer sofort).
            // Geduldig bis BOOT_READY_CAP_MS, unabhängig von durationMs/CPU — ein zu kurzes Fenster ließ den
            // Pump nie laufen (voxelChunks=0). Bleibt der Tick aus (echter Hänger): passiver Sleep.
            const BOOT_READY_CAP_MS = 60000;
            const deadline = start + BOOT_READY_CAP_MS;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < deadline
            ) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            const r = window.anazhRealm;
            if (!r || typeof r._gameLoopTick !== "function") {
                // Init nicht zeitig fertig (>BOOT_READY_CAP_MS = echter Hänger) →
                // ehrlicher Fallback, kein Crash; die Folge-Invarianten fangen es.
                await new Promise((resolve) => setTimeout(resolve, durationMs - (performance.now() - start)));
                return;
            }
            // Nur den teuren GPU-Aufruf (`renderer.render`/`renderAsync`, swiftshader ~2.5 s/Frame) stubben,
            // NICHT `_loopRender`: die Bänder sind pixel-blind, lesen aber seine billigen Uniform-Updates
            // (skybox/starField, hydroSurfaceUniforms.time/.emotion); der Screenshot-Pfad stellt ihn wieder her.
            // Beim Null-Renderer NICHT stubben — sein render() macht die Matrix-Buchhaltung für den Raycast.
            if (r.state.renderer && !r.state.renderer._isHeadlessNull) {
                window.__origRendererRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") {
                    r.state.renderer.renderAsync = function () {
                        return Promise.resolve();
                    };
                }
            }
            // Post-Processing (falls aktiv) auf den nun-no-op renderer.render-Pfad zwingen.
            r.state.postProcessingFailed = true;
            // Phase 2 — Loop synchron pumpen; setTimeout(0) yieldet für Mikrotasks und ist headless NICHT
            // gedrosselt (rAF schon) → CPU- statt frame-gebunden. Count-basiert statt Wall-Clock: mindestens
            // WARMUP_MIN_MS (zeit-getriebene Trigger), dann bis ≥ TARGET_VOXEL_CHUNKS + PLATEAU (Chunk-Zahl
            // PLATEAU_MS stabil = Ring voll; die Naht-Probe braucht den 3×3-Ring), HARD_CAP_MS gegen einen
            // Hänger — so prüft die Invariante Welt-Zustand, nicht CPU-Tempo.
            const TARGET_VOXEL_CHUNKS = 18; // Mindest-Marge über der >=15-Invariante
            const WARMUP_MIN_MS = 3000; // zeit-getriebene Trigger (Grok 1.5 s) sehen echte Zeit
            const PLATEAU_MS = 2000; // Ring „voll", wenn die Chunk-Zahl so lange stabil ist
            const HARD_CAP_MS = Math.max(durationMs * 3, 90000);
            // Voxel-Worker für den Warmup aushängen → der Streaming-Tick baut jeden Ring-Chunk SYNC: unter
            // CPU-Last hungert die Async-Lieferung aus (voxelChunks=0). Sync = load-unabhängig + bit-identisch.
            const _warmupSavedWorker = r.state.voxelWorker;
            r.state.voxelWorker = null;
            let lastBuilt = -1;
            let lastGrowthAt = start;
            for (;;) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    // Ein einzelner Tick-Fehler darf den Warmup nicht
                    // abbrechen; die `pageerror`-Listener fangen ihn auf.
                }
                const elapsed = performance.now() - start;
                const built = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (built !== lastBuilt) {
                    lastBuilt = built;
                    lastGrowthAt = performance.now();
                }
                const stableMs = performance.now() - lastGrowthAt;
                const warm = built >= TARGET_VOXEL_CHUNKS && stableMs >= PLATEAU_MS && elapsed >= WARMUP_MIN_MS;
                if (warm || elapsed >= HARD_CAP_MS) {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            // Foundry-Warm-Anker: der Studio-Worker bootet ASYNC (ein anderer Worker als der ausgehängte
            // voxelWorker) → warten auf f.ready → recipeCount > 0 → !_vorrat (im ready-Handler synchron
            // true, also „false nach ready“ = Prefetch fertig). Der Loop pumpt weiter; der Deckel ist nur
            // Hänger-Schutz — ein Cap-Treffer lässt die Bänder ehrlich rot werden.
            const _fdry = r._foundry || (typeof r._ensureAssetFoundry === "function" ? r._ensureAssetFoundry() : null);
            const foundryT0 = performance.now();
            let foundryReadyMs = -1;
            if (_fdry) {
                const FOUNDRY_WARM_CAP_MS = 120000;
                const fDeadline = performance.now() + FOUNDRY_WARM_CAP_MS;
                while (
                    !(_fdry.ready && _fdry.recipeCount > 0 && _fdry._vorrat === false) &&
                    performance.now() < fDeadline
                ) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {
                        // Ein einzelner Tick-Fehler darf den Warm-Anker nicht abbrechen.
                    }
                    await new Promise((resolve) => setTimeout(resolve, 25));
                }
                foundryReadyMs =
                    _fdry.ready && _fdry.recipeCount > 0 && _fdry._vorrat === false
                        ? Math.round(performance.now() - foundryT0)
                        : -1;
                // Kurzer Settle-Pump: `_foundryRewarmColdTrees` (feuert am Prefetch-Ende,
                // frame-budgetiert) baut kalt gebliebene Baum-Einträge in Reichweite —
                // ein paar Ticks geben ihm deterministisch Raum, bevor die Bänder lesen.
                for (let s = 0; s < 40; s++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }
            // Worker wieder einhängen — die Folge-Bänder nutzen den echten async-Pfad
            // (er re-synct seine Worldgen-Kachel lazy beim ersten Request, V18.132).
            r.state.voxelWorker = _warmupSavedWorker;
            return {
                foundryWarmMs: foundryReadyMs,
                foundryReady: _fdry ? _fdry.ready === true : false,
                recipeCount: _fdry ? _fdry.recipeCount || 0 : 0,
            };
        }, DURATION_MS);

        // N7.3 — die Foundry-Warm-Wahrheit sichtbar machen (informativ; die harte
        // Wand ist das Band `checkInitialState`/die Foundry-Leser selbst).
        if (warmupInfo && typeof warmupInfo === "object") {
            console.log(
                `Foundry-Warm: ready=${warmupInfo.foundryReady} · Rezepte=${warmupInfo.recipeCount} · Bibliothek warm nach ${warmupInfo.foundryWarmMs} ms`
            );
        }

        // ### Bericht (informativ) ###
        const fpsText = await page.$eval("#fps", (el) => el.innerText).catch(() => "?");
        const fpsValues = [];
        const fpsRe = /\[INFO\] FPS: (\d+)/;
        for (const l of logs) {
            const m = l.text.match(fpsRe);
            if (m) fpsValues.push(Number(m[1]));
        }
        const histogram = new Map();
        for (const l of logs) {
            const generic = l.text
                .replace(/\(-?\d+\.?\d*,\s*-?\d+\.?\d*(,\s*-?\d+\.?\d*)?\)/g, "(…)")
                .replace(/-?\d+\.\d+/g, "N")
                .replace(/\b\d+\b/g, "N");
            histogram.set(generic, (histogram.get(generic) || 0) + 1);
        }
        const top = [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

        console.log(`\n=== Bericht (${DURATION_MS / 1000}s) ===`);
        console.log(`FPS-Div: "${fpsText}", Log-Einträge: ${logs.length}, Page-Errors: ${errors.length}`);
        if (fpsValues.length) {
            const min = Math.min(...fpsValues);
            const max = Math.max(...fpsValues);
            const avg = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
            console.log(`FPS samples: min=${min}, max=${max}, avg=${avg.toFixed(1)}, n=${fpsValues.length}`);
        }
        console.log(`Top-Log-Muster:`);
        for (const [msg, count] of top) console.log(`  ${String(count).padStart(4)}× ${msg.slice(0, 110)}`);

        // ### Invarianten (gatekeeping) ###
        // `ctx` = geteilte Akkumulatoren (page, check, logs, errors, finalState); jede `checkX(ctx)`-Sektion
        // liest daraus + ruft `ctx.check(...)`.
        const ctx = { page, check, logs, errors };
        ctx.finalState = await gatherInitialFinalState(page);

        console.log(`\n=== Invarianten ===`);
        if (!ctx.finalState) {
            failures.push("Game-State erreichbar");
            console.log("  ❌ window.anazhRealm.state nicht erreichbar (Seite tot?)");
        } else {
            // V9.52-a: die ersten drei Sektionen als benannte Funktionen.
            await timed(BAND.checkInitialState, ctx);
            await timed(BAND.checkRing1Grok, ctx);
            await timed(BAND.checkRing2Dsl, ctx);

            // V9.52-b: Band 1 (Ring 2 Phase 3 .. Ring 11.5) als 11 thematische Band-
            // Funktionen, je 265-1260 Z.
            // (Ziel: ~25-35 Band-Funktionen total, NICHT per-Sektion).
            await timed(BAND.checkBandRing2Extended, ctx);
            await timed(BAND.checkBandWaves1to3, ctx);
            await timed(BAND.checkBandV1721LivingFieldAura, ctx);
            await timed(BAND.checkBandV1722NexusEyes, ctx);
            await timed(BAND.checkBandV1723Harmony, ctx);
            await timed(BAND.checkBandV1725FieldReaders, ctx);
            await timed(BAND.checkBandV1726FieldDirection, ctx);
            await timed(BAND.checkBandV1727WritableField, ctx);
            await timed(BAND.checkBandV1728SpawnClearance, ctx);
            await timed(BAND.checkBandV1729CreatureTrickle, ctx);
            await timed(BAND.checkBandV1730EmotionFromBeing, ctx);
            await timed(BAND.checkBandV1731EmotionDrivesWorld, ctx);
            await timed(BAND.checkBandV1732SpatialEmotion, ctx);
            await timed(BAND.checkBandV1733WorldRules, ctx);
            await timed(BAND.checkBandV1734FieldRules, ctx);
            await timed(BAND.checkBandV1735NexusEvolvesRules, ctx);
            await timed(BAND.checkBandV1736HumanRules, ctx);
            await timed(BAND.checkBandV1737RulesUI, ctx);
            await timed(BAND.checkBandV1738RulePersistence, ctx);
            await timed(BAND.checkBandV1739RulesUX, ctx);
            await timed(BAND.checkBandV1740LlmRules, ctx);
            await timed(BAND.checkBandV1741RuleThread, ctx);
            await timed(BAND.checkBandV1742Wohl, ctx);
            await timed(BAND.checkBandV1743RuleFitness, ctx);
            await timed(BAND.checkBandV1744Appraisal, ctx);
            await timed(BAND.checkBandV1745EmotionCore, ctx);
            await timed(BAND.checkBandV1746EmotionSubstance, ctx);
            await timed(BAND.checkBandV1747FastSlow, ctx);
            await timed(BAND.checkBandV1748Social, ctx);
            await timed(BAND.checkBandV1749Adventure, ctx);
            await timed(BAND.checkBandV1750Klammer, ctx);
            await timed(BAND.checkBandV1751CombatStats, ctx);
            await timed(BAND.checkBandV1757HeldSlot, ctx);
            await timed(BAND.checkBandV1753CreatureCombat, ctx);
            await timed(BAND.checkBandV1754PlayerAttack, ctx);
            await timed(BAND.checkBandV1755HarvestEffort, ctx);
            await timed(BAND.checkBandV1755W2Profile, ctx);
            await timed(BAND.checkBandV1758CreatureNature, ctx);
            await timed(BAND.checkBandV1759CapabilityReadout, ctx);
            await timed(BAND.checkBandV1761ForgeImplement, ctx);
            await timed(BAND.checkBandV1762ForgeMeaningful, ctx);
            await timed(BAND.checkBandV1763ForgeArmor, ctx);
            await timed(BAND.checkBandV1764ForgeAvatar, ctx);
            await timed(BAND.checkBandV1765BrewConsumable, ctx);
            await timed(BAND.checkBandV1766FertigenFlow, ctx);
            await timed(BAND.checkBandV1767WorkshopDomainEmergent, ctx);
            await timed(BAND.checkBandV1769RoleResonance, ctx);
            await timed(BAND.checkBandV1770WorkshopStationMark, ctx);
            await timed(BAND.checkBandV1771ToolOpFromForm, ctx);
            await timed(BAND.checkBandV1772Library, ctx);
            await timed(BAND.checkBandOmegaPhi1CoM, ctx);
            await timed(BAND.checkBandOmegaPhysisSaeuleI_II, ctx);
            await timed(BAND.checkBandOmegaWerkstattSpiegel, ctx);
            await timed(BAND.checkBandOmegaGrammatik, ctx);
            await timed(BAND.checkBandOmegaOpsisSkyEnv, ctx);
            await timed(BAND.checkBandV1773HeldMesh, ctx);
            await timed(BAND.checkBandV1774UseByRole, ctx);
            await timed(BAND.checkBandV1775MakeActCost, ctx);
            await timed(BAND.checkBandV1776WorkshopPrecision, ctx);
            await timed(BAND.checkBandV1777SteigerungVisible, ctx);
            await timed(BAND.checkBandV1778LadderCut, ctx);
            await timed(BAND.checkBandV1779RoleFitQuality, ctx);
            await timed(BAND.checkBandV1780FormAxes, ctx);
            await timed(BAND.checkBandV1781RoleRegister, ctx);
            await timed(BAND.checkBandV1782CatalystReadout, ctx);
            await timed(BAND.checkBandV1783ImplementClassification, ctx);
            await timed(BAND.checkBandV1784AvatarFormFit, ctx);
            await timed(BAND.checkBandV1785RoleDisplayAndUndo, ctx);
            await timed(BAND.checkBandV1786WorkshopCoherence, ctx);
            await timed(BAND.checkBandV1787UndoRedo, ctx);
            await timed(BAND.checkBandV1788WorkshopAsProcess, ctx);
            await timed(BAND.checkBandV1789WorkshopReadout, ctx);
            await timed(BAND.checkBandV1790Recalibration, ctx);
            await timed(BAND.checkBandWave4, ctx);
            await timed(BAND.checkBandWave5, ctx);
            await timed(BAND.checkBandRing8, ctx);
            await timed(BAND.checkBandRing9to10, ctx);
            await timed(BAND.checkBandRing11AndW7Mesh, ctx);
            await timed(BAND.checkBandW16Distribution, ctx);
            await timed(BAND.checkBandW17Multiplayer, ctx);
            await timed(BAND.checkBandW4LofiPad, ctx);
            await timed(BAND.checkBandLateMultiUser, ctx);

            // V9.52-c: Band 2 (Welle 6.A .. Welle 6.H Phase 2C) als 8 thematische
            // Band-Funktionen, je 475-1567 Z.
            await timed(BAND.checkBandWelle6APolish, ctx);
            await timed(BAND.checkBandWelle6DSoul, ctx);
            await timed(BAND.checkBandWelle6GHylomorphism, ctx);
            await timed(BAND.checkBandVoxelTerrainCore, ctx);
            await timed(BAND.checkBandV18275FoliageGrowth, ctx);
            await timed(BAND.checkBandV18278LoopErrorBoundary, ctx);
            await timed(BAND.checkBandHydrosphere, ctx);
            await timed(BAND.checkBandVoxelP3AndInventory, ctx);
            await timed(BAND.checkBandWelle6Keybindings, ctx);
            await timed(BAND.checkBandWelle6HCreatures, ctx);
            // V9.75 (Welle C.4+5) — Welle-A/B Test-Bänder gestrichen (alte
            // Maschinerie ist weg). Vision-Beweis lebt jetzt vollständig in
            // C.1-C.3 (Cell-Feld + Iso-Mesh + Stempel-Reaktion).
            await timed(BAND.checkBandWelleC1WaterCells, ctx);
            await timed(BAND.checkBandWelleC2WaterIsoSurface, ctx);
            await timed(BAND.checkBandWelleC3CellularReaction, ctx);
            // V9.88 — Welle Perf-3.b Distance-LOD-Beweis.
            await timed(BAND.checkBandWellePerf3bDistanceLod, ctx);
            // V12.0-perf.c.1 — Architektur-Instancing-Foundation (Matrix-Bit-Gleichheit).
            await timed(BAND.checkBandWellePerfCArchInstancing, ctx);
            // V12.0-perf.d — budgetierter Culling-Build (Wurzel B, kein Burst).
            await timed(BAND.checkBandWellePerfDBudget, ctx);
            // V12.0-perf.e — Nexus → adaptiver Qualitäts-Governor (Wurzel D).
            await timed(BAND.checkBandWellePerfENexusGovernor, ctx);
            // JEDES-HOLZ — der Existenz-Boden der Ring-Ramp (die Welt entsteht auf jedem Holz).
            await timed(BAND.checkBandJedesHolzExistenzBoden, ctx);
            // V12.0-perf.h — Wasser-Iso deferred-Queue (Streaming-Hitch-Heilung).
            await timed(BAND.checkBandWellePerfHWaterIsoQueue, ctx);
            // V9.89 — Welle Perf-3.c Phase 1 Worker-Foundation + Determinismus.
            await timed(BAND.checkBandWellePerf3cWorkerFoundation, ctx);
            // V9.90 — Welle Perf-3.c Phase 2 Async-Density-Cutover-Beweis.
            await timed(BAND.checkBandWellePerf3cPhase2Async, ctx);
            // V9.91 — Welle Perf-3.c Phase 3 voller Worker-Mesh-Beweis (Iso+Cells+Colors).
            await timed(BAND.checkBandWellePerf3cPhase3FullMesh, ctx);
            // V17.117 — H3: der globale Ozean jenseits ±1024 m (Worker<->Main bit-identisch).
            await timed(BAND.checkBandV17117FarWater, ctx);
            // V17.118 — E3: der Voxel-Worker engagiert (Mesh off-thread, Regressions-Wand).
            await timed(BAND.checkBandV17118WorkerEngaged, ctx);
            // PHASE A (gigant-plan §5) — A1 Stitch-Band · A2 Edit-Lokalität · A5 Luft↔Ring · A6 Kollision.
            await timed(BAND.checkBandPhaseAFundament, ctx);
            // PHASEN B–F (V18.104) — die Kern-KONSUM-Beweise des Phasen-Zugs.
            await timed(BAND.checkBandPhasenBF, ctx);
            // V9.93 — Wasser-LOD-Naht-Heilung (waterCells immer LOD 0).
            await timed(BAND.checkBandWelle993WaterLodSeam, ctx);
            // V11.0-d.1 — Pfeiler D Foundation: Wasser-Kontext für Kreaturen.
            await timed(BAND.checkBandWelleV11D1WaterContext, ctx);
            // V11.0-d.2 — Pfeiler D: Tiefen-Scheue + Schwimm-Surface im wander-Loop.
            await timed(BAND.checkBandWelleV11D2WaterBias, ctx);
            // V11.0-d.3 — Pfeiler D: Trinken-Task (6. Task, Aura azur, Ping A5).
            await timed(BAND.checkBandWelleV11D3DrinkTask, ctx);
            // V11.0-a..d (Gras-Mesh-Pool) — V18.492 GESCHNITTEN mit dem Pool selbst: die
            // Wiese ist Boden-Funktion (21.07.), kein Halm-Mesh → kein Pool, kein Band.
            // V17.1 — FÜLLE/DICHTE: artenreiche GPU-instanzierte Klein-Vegetation.
            await timed(BAND.checkBandNahStreu, ctx);

            // Band 3 — Atmosphäre, Welt-Portal/Vibe-Pass/Bibliothek, Übersetzer + Untrusted-Tor, späte Politur.
            await timed(BAND.checkBandWelle6XAudit, ctx);
            await timed(BAND.checkBandWelle6G3Lebendigkeit, ctx);
            await timed(BAND.checkBandWelle6G4Atmosphere, ctx);
            await timed(BAND.checkBandV8SoulRoleAndWorkshop, ctx);
            await timed(BAND.checkBandW12WorldPortal, ctx);
            await timed(BAND.checkBandW13W14VibePassLibrary, ctx);
            await timed(BAND.checkBandTranslatorAndUntrusted, ctx);
            await timed(BAND.checkBandV8LatePolishAnd6XContinued, ctx);

            // Band 4 — End-Sektionen (Kreatur-Bau/Stats/LLM, CAD, Welle 9/10, Ring 3–6, UI), dann G8 +
            // Einzel-Bänder.
            await timed(BAND.checkBandWelle6HBuildAndPersist, ctx);
            await timed(BAND.checkBandWelle6HCreatureStats, ctx);
            await timed(BAND.checkBandWelle6HCreatureLlm, ctx);
            await timed(BAND.checkBandCadWorkshop, ctx);
            await timed(BAND.checkBandWaves9And10a, ctx);
            await timed(BAND.checkBandWave10b, ctx);
            await timed(BAND.checkBandWorkshopPolishAndLlm, ctx);
            await timed(BAND.checkBandEarlyRingsAndUi, ctx);
            await timed(BAND.checkBandRing5Soul, ctx);
            await timed(BAND.checkBandRing6Workshop, ctx);
            await timed(BAND.checkBandG8R0Sovereign, ctx);
            await timed(BAND.checkBandG8R1DampedChannel, ctx);
            await timed(BAND.checkBandG8R2SovereignWall, ctx);
            await timed(BAND.checkBandG8R3Locality, ctx);
            await timed(BAND.checkBandG8R4Immunity, ctx);
            await timed(BAND.checkBandG8R5LivingImmune, ctx);
            await timed(BAND.checkBandV18129HochBecken, ctx);
            await timed(BAND.checkBandV18130CsmShadow, ctx);
            await timed(BAND.checkBandWaldbodenKaskade, ctx);
            await timed(BAND.checkBandV18132FerneSeen, ctx);
            await timed(BAND.checkBandV18133Forage, ctx);
            await timed(BAND.checkBandV18134Social, ctx);
            await timed(BAND.checkBandV18135Bookmarks, ctx);
            await timed(BAND.checkBandV18136Audit, ctx);
            await timed(BAND.checkBandTailleOmega2, ctx);
            await timed(BAND.checkBandTailleOmega3, ctx);
            await timed(BAND.checkBandTailleGolden, ctx);
            await timed(BAND.checkBandTailleOmega5, ctx);
            await timed(BAND.checkBandTailleOmega6, ctx);
            await timed(BAND.checkBandV18142Follow, ctx);
            await timed(BAND.checkBandV18143Comments, ctx);
            await timed(BAND.checkBandW18CoPresence, ctx);
            await timed(BAND.checkBandW18InputBridge, ctx);
            await timed(BAND.checkBandW18Dwell, ctx);
            await timed(BAND.checkBandV18147ForYou, ctx);
            await timed(BAND.checkBandPhaseEThreat, ctx);
            await timed(BAND.checkBandV18149Statusbar, ctx);
            await timed(BAND.checkBandV18150Ride, ctx);
            await timed(BAND.checkBandV18151Idb, ctx);
            await timed(BAND.checkBandR6Capability, ctx);
            await timed(BAND.checkBandM2RollenWahrheit, ctx);
            await timed(BAND.checkBandM3RittVollendet, ctx);
            await timed(BAND.checkBandM1VerbindungsWerkstatt, ctx);
            await timed(BAND.checkBandM5HudPolitur, ctx);
            await timed(BAND.checkBandM4SuchKern, ctx);
            await timed(BAND.checkBandM6ErnteSpawn, ctx);
            await timed(BAND.checkBandM7LichtFeinschliff, ctx);
            await timed(BAND.checkBandM8MakroFenster, ctx);
            await timed(BAND.checkBandNutzerBlickNachbau, ctx);
            await timed(BAND.checkBandV18163DetailTiefe, ctx);
            await timed(BAND.checkBandV18164AutoConnect, ctx);
            await timed(BAND.checkBandArchetypBank, ctx);
            await timed(BAND.checkBandV18164WarumLicht, ctx);
            await timed(BAND.checkBandPsi0Winkel, ctx);
            await timed(BAND.checkBandV18165KonsoleHeil, ctx);
            await timed(BAND.checkBandWBHofKarte, ctx);
            await timed(BAND.checkBandWCIchWahrheit, ctx);
            await timed(BAND.checkBandWDRittSpawn, ctx);
            await timed(BAND.checkBandLambda1LivingCenter, ctx);
            await timed(BAND.checkBandLambda2HismSynthese, ctx);
            await timed(BAND.checkBandLambda3Wind, ctx);
            await timed(BAND.checkBandLambda4Streu, ctx);
            await timed(BAND.checkBandStoffSignatur, ctx);
            await timed(BAND.checkBandLambda5MischwaldSynthese, ctx);
            await timed(BAND.checkBandLambda6Detail, ctx);
            await timed(BAND.checkBandV18177AAA, ctx);
            await timed(BAND.checkBandGammaGenese, ctx);
            await timed(BAND.checkBandWEFrequenzband, ctx);
            await timed(BAND.checkBandWFFluss, ctx);
            await timed(BAND.checkBandW3UiPuls, ctx);
            await timed(BAND.checkBandWGGelenke, ctx);
            await timed(BAND.checkBandWHWald, ctx);
            await timed(BAND.checkBandPhiArchipel, ctx);
            await timed(BAND.checkBandPhiArchipelV2, ctx);
            await timed(BAND.checkBandPhi7PortalHalls, ctx);
            await timed(BAND.checkBandPhi6ComputeSpende, ctx);
            await timed(BAND.checkBandW5Werkzeugabnutzung, ctx);
            await timed(BAND.checkBandV18194Gamma6Befoerderung, ctx);
            await timed(BAND.checkBandV18195AvatarSizeHp, ctx);
            await timed(BAND.checkBandV18196ManaSymmetry, ctx);
            await timed(BAND.checkBandV18197GammaMStrata, ctx);
            await timed(BAND.checkBandV18198Gamma2Totholz, ctx);
            await timed(BAND.checkBandV18199GammaMLichen, ctx);
            await timed(BAND.checkBandV18200GammaMIronBands, ctx);
            await timed(BAND.checkBandV18201ManaKonsum, ctx);
            await timed(BAND.checkBandV18202GeruchFeld, ctx);
            await timed(BAND.checkBandV18203Gamma3FeldCharakter, ctx);
            await timed(BAND.checkBandV18205Gamma7Grammatik, ctx);
            await timed(BAND.checkBandV18206SpeedTrade, ctx);
            await timed(BAND.checkBandV18207R5StructureTexture, ctx);
            await timed(BAND.checkBandV18208CreatureSizeSymmetry, ctx);
            await timed(BAND.checkBandV18209Konsolidierung, ctx);
            await timed(BAND.checkBandV18210Verdrahtung, ctx);
            await timed(BAND.checkBandV18211SkeletonGrammar, ctx);
            await timed(BAND.checkBandV18212GigantRestsubschritte, ctx);
            await timed(BAND.checkBandV18213MeshMerge, ctx);
            await timed(BAND.checkBandV18214SkeletonMesh, ctx);
            await timed(BAND.checkBandV18215AtemberaubenderWald, ctx);
            await timed(BAND.checkBandV18216KarstUndUnderstory, ctx);
            await timed(BAND.checkBandV18217VariantenPool, ctx);
            await timed(BAND.checkBandV18218LODStufen, ctx);
            await timed(BAND.checkBandV18219bisVollendung, ctx);
            await timed(BAND.checkBandV18223PbrKohaerenz, ctx);
            await timed(BAND.checkBandV18224ScatterPromotion, ctx);
            await timed(BAND.checkBandWahrerAnblickSaeule1, ctx);
            await timed(BAND.checkBandWahrerAnblickFels, ctx);
            await timed(BAND.checkBandWahrerAnblickGras, ctx);
            await timed(BAND.checkBandRauschGesetz, ctx);
            await timed(BAND.checkBandWahrerAnblickLaub, ctx);
            await timed(BAND.checkBandWahrerAnblickPfade, ctx);
            await timed(BAND.checkBandWahrerAnblickAtmoBusch, ctx);
            await timed(BAND.checkBandKonvergenzTierBaum, ctx);
            await timed(BAND.checkBandHuepfer, ctx);
            await timed(BAND.checkBandV18264ShadowCache, ctx);
            await timed(BAND.checkBandV18265ShadowDistance, ctx);
            await timed(BAND.checkBandV18266RockDetail, ctx);
            await timed(BAND.checkBandV18331ReplayDeterminism, ctx);
            await timed(BAND.checkBandV18493CoSchoepferStudio, ctx);
            await timed(BAND.checkBandWetterVektor, ctx);
            await timed(BAND.checkBandFoundrySpeicherFlach, ctx);
        }

        // Echte Page-Errors (Script-Exceptions) sind immer Bugs.
        const pageErrors = errors.filter((e) => e.kind === "pageerror");
        if (pageErrors.length > 0) {
            console.error("\n=== PAGE ERRORS (Full Stack) ===");
            for (const pe of pageErrors.slice(0, 3)) {
                console.error(pe.stack || pe.text);
                console.error("---");
            }
        }
        check(
            "Keine Script-Exceptions (page.on pageerror)",
            pageErrors.length === 0,
            pageErrors.length ? `${pageErrors.length}× erste: ${pageErrors[0].text.slice(0, 100)}` : ""
        );

        // Kritische Console-Patterns, die früher echte Bugs anzeigten.
        const criticalPatterns = [
            { re: /Cannot start training because another fit/, why: "TF-Race" },
            { re: /Infinity, Infinity/, why: "extendTerrain-Infinity (Cooldown-Self-Block)" },
            { re: /Ungültige Chunk-Größe/, why: "Chunk-Generation-Fehler" },
            {
                re: /THREE is not defined|Ammo is not defined|tf is not defined|SimplexNoise is not defined/,
                why: "Vendor-Lib nicht geladen",
            },
            { re: /Failed to execute 'compile' on 'WebAssembly'.*MIME/, why: "WASM-MIME falsch konfiguriert" },
            { re: /\[ERROR\] STOFF:/, why: "Stoff-Bruch (K22, _stoffBruch)" },
        ];
        for (const { re, why } of criticalPatterns) {
            const hits = logs.filter((l) => re.test(l.text));
            check(
                `Keine '${why}'-Logs`,
                hits.length === 0,
                hits.length ? `${hits.length}× erste: ${hits[0].text.slice(0, 100)}` : ""
            );
        }

        // Death-Spiral-Sensor: "Boden fehlt" mehr als zweimal in N Sekunden = Loop.
        const bodenFehltCount = logs.filter((l) => /Boden fehlt/.test(l.text)).length;
        check("Keine Welt-Regen-Death-Spiral", bodenFehltCount <= 2, `'Boden fehlt'-Logs=${bodenFehltCount}`);

        // Screenshot als Beweis-Artefakt NUR im Real-Renderer-Modus (Null-Renderer = blankes Bild; den LOOK
        // messen die Bild-Sonden). Force-revealt die Dialog-Box, falls ihr 8-s-Fade-Out durch ist.
        if (!REAL_RENDERER) {
            console.log(
                "\nScreenshot übersprungen (GPU-frei / Null-Renderer). Für ein BILD: " +
                    "PLAYTEST_REAL_RENDERER=1 npm run playtest — oder die Werkbank " +
                    "(node scripts/werkbank.cjs: EINE Welt offen, Bild aus dem Ausgabe-Pfad)."
            );
        } else {
            try {
                await page.evaluate(() => {
                    const box = document.getElementById("dialogue-box");
                    if (box && box.textContent) box.classList.add("visible");
                    // [PERF] den für die Mess-Phase gestubbten GPU-Render wiederherstellen +
                    // ein echtes Frame zeichnen, damit der Screenshot die Welt zeigt.
                    const r = window.anazhRealm;
                    if (r && r.state.renderer && window.__origRendererRender) {
                        r.state.renderer.render = window.__origRendererRender;
                        r.state.postProcessingFailed = false;
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {}
                    }
                });
                fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
                await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
                console.log(`\nScreenshot: ${SCREENSHOT_PATH}`);
            } catch (e) {
                console.log(`\nScreenshot fehlgeschlagen: ${e.message}`);
            }
        }
    } finally {
        await browser.close();
        server.kill();
    }

    if (bandTimes.length) {
        const slow = [...bandTimes].sort((a, b) => b[1] - a[1]);
        const tot = bandTimes.reduce((s, b) => s + b[1], 0);
        console.log(
            `\n=== Band-Timing (${(tot / 1000).toFixed(0)}s über ${bandTimes.length} Bänder · die 20 teuersten) ===`
        );
        for (const [nm, ms] of slow.slice(0, 20)) console.log(`  ${String(ms).padStart(6)} ms  ${nm}`);
    }
    console.log(`\nLaufzeit: ${((Date.now() - T0) / 1000).toFixed(0)}s`);
    if (gateAborted) {
        // V18.309 — UNÜBERSEHBAR: ein toter/hängender Lauf endet NIE mehr als
        // rätselhafte ✅-Liste oder Endlos-Schweigen. Eine laute Zeile, Exit≠0,
        // egal ob STRICT — ein unvollständiger Lauf ist nie ein grünes Gate.
        console.log(`\n⛔ GATE UNVOLLSTÄNDIG — abgebrochen bei Band „${gateAborted.band}" (Seite tot/abgehängt).`);
        console.log(`   Grund: ${gateAborted.reason}`);
        console.log(
            `   Die Bänder NACH dem Abbruch liefen nie → das ist KEIN grünes Gate. Das volle ~3500-` +
                `Invarianten-Gate gehört auf die CI (frischer Renderer-Prozess pro Lauf), nicht in den` +
                ` last-kumulierenden lokalen Container.`
        );
        if (failures.length > 0)
            console.log(`   Bis zum Abbruch verletzt (${failures.length}): ${failures.join(", ")}`);
        process.exit(1);
    }
    if (failures.length > 0) {
        console.log(`\n❌ ${failures.length} Invariante(n) verletzt: ${failures.join(", ")}`);
        if (STRICT) process.exit(1);
    } else {
        console.log(`\n✅ Alle Invarianten OK`);
    }
})().catch((err) => {
    console.error("Smoketest-Crash:", err);
    process.exit(1);
});
