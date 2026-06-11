// V18.150 — FADEN #7 (Fahrzeug-Fahr-Tiefe): DER NUTZER-BLICK (Schöpfer-
// Auflage: „selbst prüfen, wie die Ergebnisse aussehen — die Nutzer-
// perspektive"). Settled-Welt → Wagen spawnen → AUFSTEIGEN → fahren →
// Drohnen-Shots aus der dritten Person: sitzt der Reiter auf dem SITZ?
// richtet sich der Wagen in die Fahrt aus? bewegt er sich mit Tempo-
// Profil? Plus die Mess-Wahrheit (Profil · Weg · Yaw) im Log.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4378;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // PHASE 1 — settled (Render gestubbt für Tempo; das diag-settled-view-Muster).
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* Warmup-Wurf egal */
                }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {
            /* drain optional */
        }
    });

    // PHASE 2 — auf FLACHEN Boden (V13.0: den BODY teleportieren, nicht den
    // Mesh), Wagen spawnen + AUFSTEIGEN + Profil ablesen.
    const mounted = await page.evaluate(() => {
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        // Flachen Punkt suchen: 16 Sonden im Umkreis, geringste Höhen-Spanne.
        let best = null;
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const x = pm.x + Math.cos(a) * (18 + (i % 4) * 8);
            const z = pm.z + Math.sin(a) * (18 + (i % 4) * 8);
            const h0 = r.getTerrainHeightAt(x, z);
            const h1 = r.getTerrainHeightAt(x + 4, z);
            const h2 = r.getTerrainHeightAt(x, z + 4);
            const h3 = r.getTerrainHeightAt(x - 4, z);
            const h4 = r.getTerrainHeightAt(x, z - 4);
            if (![h0, h1, h2, h3, h4].every(Number.isFinite)) continue;
            // V9.59 — die Wasser-Wahrheit fragen: ein See ist flach, aber nass.
            if (typeof r._isAboveWaterAt === "function" && !r._isAboveWaterAt(x, z, 0.4)) continue;
            const span = Math.max(h0, h1, h2, h3, h4) - Math.min(h0, h1, h2, h3, h4);
            if (!best || span < best.span) best = { x, z, y: h0, span };
        }
        if (best) {
            const t = r.state.tmpTransform;
            t.setIdentity();
            t.setOrigin(r.setVec(r.state.tmpVec1, best.x, best.y + 1.6, best.z));
            r.state.playerBody.setWorldTransform(t);
            r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
            r.state.playerBody.activate(true);
            pm.set(best.x, best.y + 1.6, best.z);
        }
        // Auf der STAND-Fläche des Spielers spawnen (die Genesis-Plattform ist
        // ARCHITEKTUR — getTerrainHeightAt sähe das Terrain DARUNTER): der
        // Wagen steht, wo der Reiter steht.
        const entry = r.spawnArchitecture("fahrzeug_wagen", { x: pm.x + 2, y: pm.y - 0.9, z: pm.z }, { silent: true });
        if (!entry) return { err: "spawn failed" };
        const res = r.mountArchitecture(entry);
        // FAHNDUNG: wer ENTFERNT? (Falle ab JETZT — der Kill kam in der Shot-Phase.)
        window.__removals = [];
        const origRem = r.removeArchitecture.bind(r);
        r.removeArchitecture = function (e) {
            window.__removals.push({
                type: e && e.type,
                id: e && String(e.id),
                stack: new Error().stack.split("\n").slice(2, 7).join(" | "),
            });
            return origRem(e);
        };
        // FAHNDUNG: wer schreibt mountedArch? Setter-Falle mit Stack.
        window.__mountWrites = [];
        let _ma = r.state.player.mountedArch;
        Object.defineProperty(r.state.player, "mountedArch", {
            configurable: true,
            get() {
                return _ma;
            },
            set(v) {
                const arr = window.anazhRealm.state.architectures || [];
                window.__mountWrites.push({
                    v: String(v),
                    stack: new Error().stack.split("\n").slice(2, 6).join(" | "),
                    archN: arr.length,
                    has434: arr.some((e) => String(e.id) === String(_ma)),
                    idType: typeof _ma,
                    sample: arr.slice(-3).map((e) => typeof e.id + ":" + e.id),
                });
                _ma = v;
            },
        });
        const prof = r._vehicleProfile(entry);
        return {
            ok: res.ok,
            sitz: entry._sitzHeight,
            prof: prof && {
                rad: prof.radCount,
                bein: prof.beinCount,
                mass: +prof.mass.toFixed(2),
                topSpeedMul: +prof.topSpeedMul.toFixed(2),
                kAcc: +prof.kAcc.toFixed(2),
                kBrake: +prof.kBrake.toFixed(2),
            },
            pos: { x: +pm.x.toFixed(1), y: +pm.y.toFixed(1), z: +pm.z.toFixed(1) },
            entryId: String(entry.id),
            mountedNow: String(r.state.player.mountedArch),
            inArrayNow: !!(r.state.architectures || []).find((e) => e.id === entry.id),
        };
    });
    console.log("MOUNT:", JSON.stringify(mounted));

    // Drohnen-Shot-Helfer: Kamera seitlich-hinter dem Reiter, Blick auf ihn.
    const shoot = async (file, offX, offY, offZ, info) => {
        const meta = await page.evaluate(
            (offX, offY, offZ) => {
                const r = window.anazhRealm;
                const s = r.state;
                const pm = s.playerMesh.position;
                const cam = s.camera;
                // Der Ego-Auge-Clip der Fahr-Ticks kann den Avatar versteckt
                // zurücklassen — für den Dritte-Person-Shot sichtbar machen.
                s.playerMesh.visible = true;
                s.playerMesh.traverse((n) => {
                    n.visible = true;
                });
                cam.position.set(pm.x + offX, pm.y + offY, pm.z + offZ);
                cam.lookAt(pm.x, pm.y, pm.z);
                cam.updateMatrixWorld(true);
                if (window.__origRender) {
                    s.renderer.render = window.__origRender;
                    s.postProcessingFailed = true;
                    try {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } catch (_e) {
                        /* Render-Wurf sichtbar im Shot */
                    }
                    s.renderer.render = function () {};
                }
                return { px: +pm.x.toFixed(1), py: +pm.y.toFixed(1), pz: +pm.z.toFixed(1) };
            },
            offX,
            offY,
            offZ
        );
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file) });
        console.log(`${file.padEnd(28)} reiter=(${meta.px},${meta.py},${meta.pz}) ${info || ""}`);
    };

    // HUD aus für die Shots.
    await page.evaluate(() => {
        for (const el of document.querySelectorAll(".drawer, #chat-console, #statusbar, #topbar, header"))
            el.style.display = "none";
    });

    await shoot("ride-1-mounted.png", 5.5, 2.4, 5.5, "— aufgestiegen, stehend (Sitz-Check)");

    // PHASE 3 — FAHREN: W halten + Loop pumpen (~1.2 s — auf dem Plateau
    // bleiben), dann Mess-Wahrheit.
    const drive = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        const x0 = pm.x,
            z0 = pm.z;
        r.state.keys["w"] = true;
        const t0 = performance.now();
        const trace = [];
        let n = 0;
        while (performance.now() - t0 < 1200) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* egal */
            }
            if (n++ % 30 === 0) {
                const aid = r.state.player.mountedArch;
                trace.push({
                    t: Math.round(performance.now() - t0),
                    aid: aid === null || aid === undefined ? null : String(aid).slice(0, 10),
                    found: aid != null ? !!(r.state.architectures || []).find((e) => e.id === aid) : null,
                    archN: (r.state.architectures || []).length,
                    py: +pm.y.toFixed(1),
                });
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        window.__trace = trace;
        r.state.keys["w"] = false;
        // Ausrollen (Trägheit sichtbar): noch ~1 s ohne Input.
        const t1 = performance.now();
        let coastStart = null;
        const v = r.state.playerBody.getLinearVelocity();
        coastStart = Math.hypot(v.x(), v.z());
        while (performance.now() - t1 < 1000) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* egal */
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const v2 = r.state.playerBody.getLinearVelocity();
        const dbg = {
            speed: r.state.speed,
            sprint: r.state.sprintSpeed,
            steep: r.state.onSteepSlope,
            wet: r.state.playerUnderwater,
            air: r.state.isInAir,
        };
        window.__dbg = dbg;
        const archId = r.state.player.mountedArch;
        const entry = (r.state.architectures || []).find((e) => e.id === archId) || r._mountedEntry;
        return {
            dist: +Math.hypot(pm.x - x0, pm.z - z0).toFixed(1),
            py: +pm.y.toFixed(1),
            coastFrom: +coastStart.toFixed(2),
            coastTo: +Math.hypot(v2.x(), v2.z()).toFixed(2),
            stillMounted: archId !== null && archId !== undefined,
            entryFound: !!entry,
            rideYaw: entry && Number.isFinite(entry._rideYaw) ? +entry._rideYaw.toFixed(2) : null,
            ridePhase: entry ? +(entry._ridePhase || 0).toFixed(1) : null,
            meshYaw: entry && entry.mesh ? +entry.mesh.rotation.y.toFixed(2) : null,
            removals: window.__removals || [],
            trace: window.__trace || [],
            dbg: window.__dbg,
            writes: (window.__mountWrites || []).slice(0, 4),
        };
    });
    console.log("FAHRT:", JSON.stringify(drive));

    await shoot("ride-2-driven.png", -6.5, 2.6, 2.5, "— nach der Fahrt (Ausrichtungs-Check)");
    await shoot("ride-3-front.png", 0.5, 2.0, 7.0, "— frontal (Sitz/Räder-Check)");

    await browser.close();
    server.close();
})();
