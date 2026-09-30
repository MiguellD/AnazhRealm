#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kopplung.cjs — DIE KOPPLUNGS-LINSE (npm run gate:kopplung)
//
// KOPPLUNG: die Welt fasst den Körper an — vier Fäden, eine Linse:
//   F1 STRÖMUNG WIRKT: der Fluss-Flow (EINE Quelle `_waterFlowAt` aus
//      `_hydroRiverAt`) advektiert SCHWIMMENDE Körper am EINEN Bewegungs-
//      Chokepoint (`_stepCharacter` 4b, v += (flow−v)·k — TotK-Förderband).
//      Ruhender Schwimmer driftet > 0,5 m in 90 Ticks; Land-Läufer 0 m —
//      auch wenn die Bank-Rampe Flow trägt; das geritten-schwimmende Boot
//      (`_afloat`-Stempel) driftet mit.
//   F2 GLEITEN STATT VOLLSTOPP (PM_ClipVelocity, Quake/Source): 45°-Anlauf
//      auf eine Wand behält ~Tempo/2 entlang der Absicht (v −= n·(v·n) je
//      Kontaktebene, bis 3) statt 0; STEILHANG: Gravitation entlang der
//      Ebene → der Körper rutscht, statt magnetisch zu haften.
//   F3 WIND-RICHTUNG: EIN uWindDir (seeded, langsam wandernd) treibt die
//      Phase als dot(worldXZ, windDir) — zwei Punkte QUER zur Windrichtung
//      teilen die Phase exakt, LÄNGS verschieden; die Richtung dreht mit.
//   F4 GRAS-INTERAKTION: die uBend-Sphären biegen Halme RADIAL weg (GoT-
//      Interaktions-Sphären), render-rein; die CPU-Seite (`_tickGrasBend`)
//      füllt Spieler/Ritt/nahe Kreaturen.
//
// Jede Fixture läuft durch die ECHTEN Methoden (Shim = Object.create(realm)
// mit synthetischem Dichtefeld/Wasser-Kontext — die wasser-wahrheit-Disziplin)
// und trägt ihren SELBST-TEST: der Fix wird per Quell-Patch künstlich
// deaktiviert (new Function auf der echten Quelle) — die Fixture MUSS dann
// rot sehen. Exit 1 bei jedem Fail; alle Zahlen explizit.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4407;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function",
            { timeout: 120000 }
        );
        out = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const AR = r.constructor;
            const o = { fails: [], zahlen: {} };
            const fail = (msg) => o.fails.push(msg);
            const DT = 1 / 60;

            // Quell-Patch-Helfer (Selbst-Test-Disziplin): Methoden-Shorthand → Funktion;
            // split/join ersetzt ALLE Marker-Vorkommen (vx- UND vz-Zeile).
            const patchFn = (fn, name, from, to) => {
                const src = String(fn);
                if (!src.includes(from)) return null;
                const patched = src.split(from).join(to);
                return new Function("AnazhRealm", "THREE", `return ({ ${patched} }).${name};`)(AR, window.THREE);
            };

            // ── Der Bewegungs-Shim: ECHTE `_stepCharacter`/`_loopPlayerMovement` auf
            //    synthetischem Dichtefeld + Wasser-Kontext (reine Welt-Ersatzquelle,
            //    die KONSUM-Kette selbst bleibt die echte). ──
            const mkVel = () => ({
                _x: 0,
                _y: 0,
                _z: 0,
                x() {
                    return this._x;
                },
                y() {
                    return this._y;
                },
                z() {
                    return this._z;
                },
                setValue(a, b, c) {
                    this._x = a;
                    this._y = b;
                    this._z = c;
                },
            });
            const mkShim = (densityAt, waterCtxAt, riverAt) => {
                const shim = Object.create(r);
                shim.state = {
                    playerMesh: { position: new THREE.Vector3(0, 0.5, 0) },
                    playerVel: mkVel(),
                    player: { mountedArch: null },
                    keys: {},
                    yaw: 0,
                    speed: 6,
                    sprintSpeed: 12,
                    gravity: -14.715,
                    _fieldVy: 0,
                    waterLevel: -50,
                    terrainBaseHeight: 0,
                    // ZWILLINGS-ABSCHIED 19.07.: der Begehbarkeits-Winkel ist kein
                    // State-Feld mehr — _stepCharacter liest das Steilhang-Gesetz
                    // (hang.maxSlopeY) direkt aus dem Kern (fail-closed Memo-Leser).
                    worldMeta: { voxelTerrain: true },
                    forward: new THREE.Vector3(),
                    right: new THREE.Vector3(),
                    moveDirection: new THREE.Vector3(),
                    architectures: [],
                    floatingIslands: null,
                };
                shim._mountedEntry = null;
                shim._fieldDensityAt = (x, y, z) => densityAt(x, y, z);
                shim._terrainColumnContext = () => null;
                shim._playerWaterContext = (x, y, z) => waterCtxAt(x, y, z);
                shim._waterRunSurfaceAt = () => -Infinity;
                shim._hydroRiverAt = (x, z) => riverAt(x, z);
                return shim;
            };
            const runTicks = (shim, n, keys, yaw, stepFn) => {
                shim.state.keys = keys || {};
                shim.state.yaw = yaw || 0;
                let t = 0;
                for (let i = 0; i < n; i++) {
                    if (stepFn) stepFn.call(shim, DT, t);
                    else shim._stepCharacter(DT, t);
                    shim._loopPlayerMovement(t, DT);
                    t += DT;
                }
            };

            // ══ FIXTURE 1 (F1) — STRÖMUNG WIRKT ══
            // Tiefes Wasser (Spiegel +3, Grund −20), Fluss fließt +x mit centerness 1.
            const deepFloor = (x, y) => -20 - y;
            const riverX = () => ({ flowX: 1, flowZ: 0, depth: 2, surfaceY: 3, centerness: 1 });
            {
                // (a) ruhender Schwimmer driftet stromab.
                const sw = mkShim(
                    (x, y) => deepFloor(x, y),
                    (x, y) => ({ submerged: y < 3, surfaceY: 3 }),
                    riverX
                );
                runTicks(sw, 90, {}, 0);
                const p = sw.state.playerMesh.position;
                o.zahlen.schwimmerDrift = { x: p.x, z: p.z };
                if (!(p.x > 0.5)) fail(`F1a: ruhender Schwimmer driftete nur ${p.x.toFixed(3)} m in 90 Ticks (soll > 0,5 m)`);
                if (!(Math.abs(p.z) < 0.05)) fail(`F1a: Schwimmer driftete quer zur Strömung (z=${p.z.toFixed(3)} m)`);
                // (b) Land-Läufer: trockener Boden bei 0, DERSELBE Fluss unter den Füßen
                //     (Bank-Fall) — er wird NIE geschoben.
                const land = mkShim(
                    (x, y) => 0 - y,
                    () => ({ submerged: false, surfaceY: null }),
                    riverX
                );
                runTicks(land, 90, {}, 0);
                const lp = land.state.playerMesh.position;
                o.zahlen.landDrift = { x: lp.x, z: lp.z };
                if (!(Math.abs(lp.x) < 0.01 && Math.abs(lp.z) < 0.01))
                    fail(`F1b: Land-Läufer wurde geschoben (x=${lp.x.toFixed(4)}, z=${lp.z.toFixed(4)} — soll exakt stehen)`);
                // (c) das geritten-SCHWIMMENDE Boot (der Reiter ist nie submerged; das
                //     `_afloat`-Gate aus `_tickMountedMovement` trägt die Advektion).
                const boat = mkShim(
                    (x, y) => deepFloor(x, y),
                    () => ({ submerged: false, surfaceY: null }),
                    riverX
                );
                boat.state.player.mountedArch = 7;
                boat._mountedEntry = {
                    id: 7,
                    position: { x: 0, y: 2.75, z: 0 },
                    _afloat: true,
                    _vehicleProfile: {
                        topSpeedMul: 1,
                        kAcc: 5,
                        kBrake: 2,
                        radCount: 0,
                        beinCount: 0,
                        mass: 1,
                        floats: true,
                        roles: null,
                    },
                };
                runTicks(boat, 90, {}, 0);
                const bp = boat.state.playerMesh.position;
                o.zahlen.bootDrift = { x: bp.x, z: bp.z };
                if (!(bp.x > 0.5)) fail(`F1c: schwimmendes Boot driftete nur ${bp.x.toFixed(3)} m in 90 Ticks (soll > 0,5 m)`);
                // Selbst-Test F1: Advektion deaktiviert (k → 0) → der Schwimmer MUSS stehen.
                const deadStep = patchFn(r._stepCharacter, "_stepCharacter", "* AnazhRealm.FLOW_ADVECT_K", "* 0");
                if (!deadStep) fail("F1-Selbsttest: FLOW_ADVECT_K-Marker nicht in `_stepCharacter` (Fix fehlt?)");
                else {
                    const sw2 = mkShim(
                        (x, y) => deepFloor(x, y),
                        (x, y) => ({ submerged: y < 3, surfaceY: 3 }),
                        riverX
                    );
                    runTicks(sw2, 90, {}, 0, deadStep);
                    o.zahlen.schwimmerDriftTot = sw2.state.playerMesh.position.x;
                    if (!(Math.abs(sw2.state.playerMesh.position.x) < 0.05))
                        fail(`F1-Selbsttest: deaktivierte Advektion driftete trotzdem (${sw2.state.playerMesh.position.x.toFixed(3)} m)`);
                }
            }

            // ══ FIXTURE 2 (F2) — GLEITEN STATT VOLLSTOPP ══
            // (a) 45°-Anlauf auf die vertikale Wand x=8 (Normale −x). Der Anlauf (1,0,1)/√2
            //     trifft die Ebene mit 45° Einfall → PM_ClipVelocity behält die Tangente:
            //     Fortschritt entlang der ABSICHT ≈ Tempo/2 statt 0. Kugel-Auflösung im
            //     Shim aus (Isolation: HIER spricht allein der Velocity-Klip). Die Wand
            //     SCHWEBT ab y=0.25 (min-CSG) — ihr Fuß färbt sonst die Boden-Normale am
            //     Wandfuß steil (Gradient mischt Boden+Wand über e=0.6) und der
            //     PRE-EXISTENTE Slope-Penalty (Input × 0.2) verdünnte die Klip-Messung.
            const wallDens = (x, y) => Math.max(0 - y, Math.min((x - 8) * 2, (y - 0.25) * 4));
            const dryCtx = () => ({ submerged: false, surfaceY: null });
            const noRiver = () => null;
            const mkWallShim = () => {
                const s = mkShim(wallDens, dryCtx, noRiver);
                s._fieldResolveSphere = () => false; // Isolation: nur der Klip verteidigt
                return s;
            };
            const yaw45 = Math.PI / 4; // forward = (0.707, 0, 0.707) → 45° auf die Wand
            const intentProj = (p0, p1) => ((p1.x - p0.x) + (p1.z - p0.z)) / Math.SQRT2;
            const runWallWindow = (shim, stepFn) => {
                runTicks(shim, 180, { w: true }, yaw45, stepFn); // Anlauf: sicher an der Wand
                const p0 = shim.state.playerMesh.position.clone();
                runTicks(shim, 120, { w: true }, yaw45, stepFn); // Mess-Fenster: 2 s an der Wand
                const p1 = shim.state.playerMesh.position;
                return { proj: intentProj(p0, p1), x: p1.x, z: p1.z };
            };
            {
                const free = mkShim((x, y) => 0 - y, dryCtx, noRiver); // ohne Wand: Referenz-Tempo
                const fRes = runWallWindow(free);
                const wall = mkWallShim();
                const wRes = runWallWindow(wall);
                const ratio = fRes.proj > 0 ? wRes.proj / fRes.proj : NaN;
                o.zahlen.klip = { frei: fRes.proj, wand: wRes.proj, ratio, endX: wRes.x, endZ: wRes.z };
                if (!(ratio > 0.3 && ratio < 0.75))
                    fail(
                        `F2a: 45°-Wand-Gleiten aus dem Takt — Absichts-Tempo ${(ratio * 100).toFixed(0)} % der freien Fahrt (soll ~50 %, Band 30–75 %)`
                    );
                if (!(wRes.x < 8.01)) fail(`F2a: der Klip ließ die Wand durch (x=${wRes.x.toFixed(2)} ≥ 8)`);
                // Selbst-Test F2a: Klip-Schleife tot (SLIDE_CLIP_PLANES → 0 Ebenen) →
                // fail-closed Voll-Stopp → der Fortschritt MUSS kollabieren.
                const noClip = patchFn(
                    r._stepCharacter,
                    "_stepCharacter",
                    "pl < AnazhRealm.SLIDE_CLIP_PLANES",
                    "pl < 0"
                );
                if (!noClip) fail("F2a-Selbsttest: SLIDE_CLIP_PLANES-Marker nicht in `_stepCharacter` (Fix fehlt?)");
                else {
                    const stopped = runWallWindow(mkWallShim(), noClip);
                    const deadRatio = fRes.proj > 0 ? stopped.proj / fRes.proj : NaN;
                    o.zahlen.klipTot = { wand: stopped.proj, ratio: deadRatio };
                    if (!(deadRatio < 0.1))
                        fail(`F2a-Selbsttest: Voll-Stopp glitt trotzdem (${(deadRatio * 100).toFixed(0)} % — die Fixture sähe den alten Bug nicht)`);
                }
            }
            // (b) STEILHANG: Ebene fällt mit Gradient 2,5 (~68°, Normale ny≈0.37 <
            //     hang.maxSlopeY 0.5, Kern-Gesetz) in +x — ohne Input rutscht der Körper bergab
            //     (Gravitation entlang der Ebene), statt magnetisch zu haften. Kugel-
            //     Auflösung aus (Isolation: sie kriecht am 68°-Hang ~1 mm/Tick
            //     positional — pre-existent, hier spricht allein der Gravitations-Term).
            const mkSlopeShim = () => {
                const s = mkShim((x, y) => -2.5 * x - y, dryCtx, noRiver);
                s._fieldResolveSphere = () => false;
                return s;
            };
            {
                const slope = mkSlopeShim();
                runTicks(slope, 120, {}, 0);
                const sp = slope.state.playerMesh.position;
                o.zahlen.steilhang = { x: sp.x, y: sp.y };
                if (!(sp.x > 0.3)) fail(`F2b: Steilhang-Rutsch nur ${sp.x.toFixed(3)} m in 120 Ticks (soll > 0,3 m bergab)`);
                if (!(sp.y < 0.4)) fail(`F2b: der Rutsch folgte der Fläche nicht abwärts (y=${sp.y.toFixed(2)})`);
                // Tests wandern 19.07.: der Marker liest das Kern-Gesetz direkt
                // (hoisted Konstante hangMaxSlopeY statt State-Feld).
                const noSlide = patchFn(r._stepCharacter, "_stepCharacter", "gN.y < hangMaxSlopeY", "gN.y < -1");
                if (!noSlide) fail("F2b-Selbsttest: Steilhang-Marker nicht in `_stepCharacter` (Fix fehlt?)");
                else {
                    const stuck = mkSlopeShim();
                    runTicks(stuck, 120, {}, 0, noSlide);
                    o.zahlen.steilhangTot = stuck.state.playerMesh.position.x;
                    if (!(Math.abs(stuck.state.playerMesh.position.x) < 0.05))
                        fail(`F2b-Selbsttest: deaktivierter Rutsch rutschte trotzdem (${stuck.state.playerMesh.position.x.toFixed(3)} m)`);
                }
            }

            // ══ FIXTURE 3 (F3) — WIND-RICHTUNG (dot-getriebene Phase) ══
            // Skalar-Mock-TSL: derselbe Knoten-Baum, numerisch ausgewertet — die ECHTE
            // `_windSwayOffset`-Quelle rechnet, kein Nachbau.
            const val = (x) => (x && typeof x === "object" ? x.v : x);
            const N = (v) => ({
                v,
                mul: (oo) => N(v * val(oo)),
                add: (oo) => N(v + val(oo)),
                sub: (oo) => N(v - val(oo)),
                div: (oo) => N(v / val(oo)),
            });
            const mockTSL = {
                float: (x) => N(val(x)),
                sin: (x) => N(Math.sin(val(x))),
                cos: (x) => N(Math.cos(val(x))),
                max: (a, b) => N(Math.max(val(a), val(b))),
                min: (a, b) => N(Math.min(val(a), val(b))),
                sqrt: (x) => N(Math.sqrt(val(x))),
                vec3: (a, b, c) => ({ x: N(val(a)), y: N(val(b)), z: N(val(c)) }),
                positionWorld: null,
                positionLocal: null,
            };
            const bendOff = () => ({ x: N(0), y: N(-1e6), z: N(0), w: N(0) });
            const mkWindShim = (dirX, dirZ, bend0) => {
                const s = Object.create(r);
                s.state = {
                    windUniforms: {
                        uWindTime: N(3.7),
                        uWindStrength: N(0.4),
                        uWindDir: { x: N(dirX), y: N(dirZ) },
                        uBend: [bend0 || bendOff(), bendOff(), bendOff(), bendOff(), bendOff(), bendOff()],
                    },
                };
                return s;
            };
            const evalSway = (shim, wx, wz, localY, fn) => {
                mockTSL.positionWorld = { x: N(wx), y: N(0.5), z: N(wz) };
                mockTSL.positionLocal = { x: N(0), y: N(localY), z: N(0) };
                const res = (fn || r._windSwayOffset).call(shim, mockTSL, {});
                return { x: res.x.v, z: res.z.v };
            };
            {
                const L = 40;
                // Wind aus +x: quer (Δz) teilt die Phase EXAKT, längs (Δx) nicht.
                const sx = mkWindShim(1, 0);
                const aX = evalSway(sx, 0, 0, 0.8);
                const quX = evalSway(sx, 0, L, 0.8);
                const laX = evalSway(sx, L, 0, 0.8);
                // Wind aus +z: die ROLLEN TAUSCHEN (dieselben Punkte!) → richtungs-getrieben.
                const sz = mkWindShim(0, 1);
                const aZ = evalSway(sz, 0, 0, 0.8);
                const quZ = evalSway(sz, L, 0, 0.8);
                const laZ = evalSway(sz, 0, L, 0.8);
                const eq = (p, q) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.z - q.z) < 1e-9;
                const ne = (p, q) => Math.abs(p.x - q.x) > 1e-4 || Math.abs(p.z - q.z) > 1e-4;
                o.zahlen.wind = { aX, quX, laX, aZ, quZ, laZ };
                if (!eq(aX, quX)) fail("F3: Wind +x — zwei Punkte QUER zur Windrichtung teilen die Phase NICHT");
                if (!ne(aX, laX)) fail("F3: Wind +x — zwei Punkte LÄNGS der Windrichtung sind phasengleich (kein Orts-Term?)");
                if (!eq(aZ, quZ)) fail("F3: Wind +z — die Quer-Paarung folgt der GEDREHTEN Richtung nicht");
                if (!ne(aZ, laZ)) fail("F3: Wind +z — die Längs-Paarung folgt der GEDREHTEN Richtung nicht");
                // Selbst-Test F3: uWindDir-Konsum gekappt → Fallback-Konstanten (0.28, 0.21)
                // sind NICHT quer-invariant → die Quer-Paarung MUSS brechen.
                const noDir = patchFn(r._windSwayOffset, "_windSwayOffset", "const wd = wu.uWindDir || null;", "const wd = null;");
                if (!noDir) fail("F3-Selbsttest: uWindDir-Marker nicht in `_windSwayOffset` (Fix fehlt?)");
                else {
                    const bA = evalSway(sx, 0, 0, 0.8, noDir);
                    const bQ = evalSway(sx, 0, L, 0.8, noDir);
                    if (eq(bA, bQ)) fail("F3-Selbsttest: ohne uWindDir blieb die Quer-Paarung gleich (die Fixture sähe den alten Baum nicht)");
                }
                // Die CPU-Richtungs-Quelle: seeded (gleicher Seed = gleicher Wind, anderer
                // Seed = anderer), langsam (< 0.02 rad/s Drift) und einheitslang.
                const d10 = r._windDirAt(10);
                const d10b = r._windDirAt(10);
                const d11 = r._windDirAt(11);
                const other = Object.create(r);
                other.state = { worldMeta: { seed: "anderer-seed-xyz" } };
                const dOther = other._windDirAt(10);
                const ang = (a, b) => Math.abs(Math.atan2(a.x, a.z) - Math.atan2(b.x, b.z));
                o.zahlen.windDir = { d10, d11, dOther };
                if (!(d10.x === d10b.x && d10.z === d10b.z)) fail("F3: `_windDirAt` ist nicht deterministisch");
                if (!(Math.abs(Math.hypot(d10.x, d10.z) - 1) < 1e-9)) fail("F3: uWindDir ist kein Einheitsvektor");
                if (!(ang(d10, d11) < 0.02)) fail(`F3: der Wind dreht zu schnell (${ang(d10, d11).toFixed(4)} rad/s — soll langsam wandern)`);
                if (!(ang(d10, dOther) > 1e-3)) fail("F3: anderer worldSeed ergab dieselbe Wind-Grundrichtung (nicht seeded?)");
            }

            // ══ FIXTURE 4 (F4) — GRAS-INTERAKTION (radiales Wegbiegen) ══
            {
                const sphere = { x: N(2), y: N(0.5), z: N(0), w: N(2.0) }; // Sphäre bei x=2, r=2
                const on = mkWindShim(1, 0, sphere);
                const off = mkWindShim(1, 0); // Slot aus (w=0, y=−1e6)
                const nearL = evalSway(on, 1.2, 0, 0.8); // Halm links der Sphäre
                const nearL0 = evalSway(off, 1.2, 0, 0.8);
                const nearR = evalSway(on, 2.8, 0, 0.8); // Halm rechts der Sphäre
                const nearR0 = evalSway(off, 2.8, 0, 0.8);
                const root = evalSway(on, 1.2, 0, 0.0); // Wurzel (hf=0) biegt nie
                const root0 = evalSway(off, 1.2, 0, 0.0);
                const far = evalSway(on, 30, 0, 0.8); // außer Reichweite
                const far0 = evalSway(off, 30, 0, 0.8);
                o.zahlen.bend = { dLinks: nearL.x - nearL0.x, dRechts: nearR.x - nearR0.x };
                if (!(nearL.x < nearL0.x - 1e-3)) fail("F4: Halm links der Sphäre biegt nicht RADIAL WEG (−x)");
                if (!(nearR.x > nearR0.x + 1e-3)) fail("F4: Halm rechts der Sphäre biegt nicht RADIAL WEG (+x)");
                if (!(Math.abs(root.x - root0.x) < 1e-9)) fail("F4: die WURZEL biegt sich (hf-Gewichtung fehlt)");
                if (!(Math.abs(far.x - far0.x) < 1e-9)) fail("F4: die Sphäre wirkt außerhalb ihres Radius");
                // CPU-Seite: `_tickGrasBend` füllt Slot 0 mit dem Spieler; tote Slots ruhen.
                if (window.THREE && THREE.TSL && r.state.windUniforms) {
                    r._ensureWindCoupling(THREE.TSL);
                    const wu = r.state.windUniforms;
                    if (wu.uBend && r.state.playerMesh) {
                        const pp = r.state.playerMesh.position;
                        r._tickGrasBend();
                        const b0 = wu.uBend[0].value;
                        o.zahlen.tick = { x: b0.x, w: b0.w, px: pp.x };
                        if (!(Math.abs(b0.x - pp.x) < 1e-6 && b0.w > 0))
                            fail(`F4: \`_tickGrasBend\` trägt den Spieler nicht in Slot 0 (x=${b0.x}, w=${b0.w})`);
                        const bLast = wu.uBend[wu.uBend.length - 1].value;
                        if (!(bLast.w === 0)) fail("F4: ungenutzte Slots sind nicht aus (w≠0)");
                    } else {
                        fail("F4: windUniforms/uBend fehlen nach `_ensureWindCoupling` (TSL vorhanden)");
                    }
                } else {
                    o.zahlen.tick = "TSL fehlt headless — CPU-Seite unmessbar (Mock-Seite deckt die Mathematik)";
                }
            }

            // ══ KONSUM-PROBEN (Lehre 5/6: verifiziere KONSUM, nicht Existenz) ══
            {
                const src = await fetch("anazhRealm.js").then((x) => x.text());
                const count = (needle) => src.split(needle).length - 1;
                if (!String(r.updateCreatures).includes("_waterFlowAt"))
                    fail("KONSUM: `updateCreatures` liest `_waterFlowAt` nicht (Kreaturen ohne Strömung)");
                if (!String(r._tickMountedMovement).includes("_afloat"))
                    fail("KONSUM: `_tickMountedMovement` stempelt `_afloat` nicht (Boot ohne Strömungs-Gate)");
                if (!(count("._ensureWindCoupling(") >= 3))
                    fail(`KONSUM: uWindDir hat < 3 Leser (nur ${count("._ensureWindCoupling(")}× konsumiert — Gras/_windSwayOffset + Baum/_applyVegetationResponse + Impostor sollen DIESELBE Quelle lesen)`);
                if (!(count("_tickGrasBend()") >= 1) || !src.includes("_windDirAt(currentTime)"))
                    fail("KONSUM: der Frame-Tick speist uWindDir/uBend nicht (`_loopRender`)");
            }
            return o;
        });
    } catch (e) {
        console.error("LINSE-FEHLER:", e.message);
        out = { fails: [`Harness: ${e.message}`], zahlen: {} };
    }
    await browser.close();
    server.close();

    console.log("\n===== KOPPLUNGS-LINSE (Strömung · Gleiten · Wind · Gras) =====\n");
    const z = out.zahlen || {};
    if (z.schwimmerDrift)
        console.log(
            `  F1 Strömung: Schwimmer ${z.schwimmerDrift.x.toFixed(2)} m · Land ${z.landDrift.x.toFixed(4)} m · Boot ${z.bootDrift.x.toFixed(2)} m · k=0 → ${Number(z.schwimmerDriftTot).toFixed(4)} m`
        );
    if (z.klip)
        console.log(
            `  F2 Gleiten: 45°-Wand ${(z.klip.ratio * 100).toFixed(0)} % Absichts-Tempo (frei ${z.klip.frei.toFixed(2)} m → Wand ${z.klip.wand.toFixed(2)} m) · Voll-Stopp-Kontrolle ${(z.klipTot ? z.klipTot.ratio * 100 : NaN).toFixed(0)} % · Steilhang-Rutsch ${z.steilhang ? z.steilhang.x.toFixed(2) : "?"} m`
        );
    if (z.windDir)
        console.log(
            `  F3 Wind: quer-invariant + richtungs-getrieben · Drift ${z.windDir ? "seeded/langsam" : "?"}`
        );
    if (z.bend)
        console.log(
            `  F4 Gras: Biegung links ${z.bend.dLinks.toFixed(3)} / rechts +${z.bend.dRechts.toFixed(3)} · Tick ${typeof z.tick === "string" ? z.tick : "Slot 0 = Spieler"}`
        );
    console.log("");
    for (const f of out.fails) console.log(`  ❌ ${f}`);
    if (pageErr) {
        console.log(`  ❌ PAGE-ERROR: ${pageErr}`);
        out.fails.push(pageErr);
    }
    const ok = out.fails.length === 0;
    console.log(
        ok
            ? "  ✅ ALLE KOPPLUNGS-INVARIANTEN OK — Strömung advektiert Schwimmer (nie Land), Wände gleiten (PM_ClipVelocity), Steilhang rutscht, Wind hat EINE Richtung, Gras weicht aus\n"
            : `\n  ❌ ${out.fails.length} KOPPLUNGS-INVARIANTE(N) VERLETZT\n`
    );
    process.exit(ok ? 0 : 1);
})().catch((e) => {
    console.error("LINSE-FEHLER:", e.message);
    process.exit(1);
});
