// diag-fern-ring.cjs — DER FERN-RING (STUFE 2, das-feld-zeichnet §2: DIE FERNE
// IST FELD). Browser-Linse (Null-Renderer + Hook, das diag-settlement-TEIL-B-
// Muster): jenseits des Voxel-Streaming-Rings zeichnet das EINE Höhen-Gesetz
// (`_terrainMacroSurfaceY(x,z,false)`) den Horizont als 3 Ring-Schalen.
// Gesetze:
//   (1) STRUKTUR — genau 3 Schalen-Meshes, Vertex-Zahlen wie deklariert
//       (FERN_RING.winkel × reihen je Schale), EIN geteiltes Material.
//   (2) HÖHEN == GESETZ — 60 deterministische Proben-Vertices: |mesh-Höhe −
//       _terrainMacroSurfaceY(snapX, snapZ, false)| < 0.01 (bzw. die flache
//       waterLevel-Klemme; Reihe 0 trägt die Saum-Tauchkante), XZ exakt gesnappt.
//   (3) RE-ZENTRIEREN — Spieler 400 m teleportieren + Ticks pumpen → der Anker
//       wandert QUANTISIERT, der Höhen-Refresh läuft BUDGETIERT durch
//       (≤ refreshVertsProTick je Tick, mehrere Ticks), die Proben stimmen am
//       neuen Ort.
//   (4) HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht).
//   (5) kein pageerror.
//   (6) SICHT-BESITZ (SELBST GESPIELT 16.07.) — mit bereitem Ring weitet die
//       Kamera (far = Schale-3-aussen + 500, alter Wert gemerkt); die HÖHEN-
//       ÖFFNUNG öffnet fog.far über der Umgebung (Spieler-Hub → > 1000) und
//       schließt am Boden wieder (Wald-Gesetz); _fernRingDispose stellt
//       camera.far wieder her (die Klippe war Ring-Besitz).
// Selbsttest (immer mitgeprüft): eine absichtlich verfälschte Erwartung
// (law + 0.5) MUSS rot fallen — die Linse ist nicht vakuös.
//   node scripts/diag-fern-ring.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.FERN_RING_PORT || 4464);

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
    console.log("=== FERN-RING (STUFE 2) — Browser, Null-Renderer + Hook ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            // DER FELD-ZEICHNER (Band 7): echtes WebGPU trotz Null-Renderer —
            // das dritter-spiegel-Rezept (swiftshader-Vulkan).
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = {};
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.scene ||
                !window.anazhRealm.state.playerMesh ||
                !window.anazhRealm.state.worldMeta) &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.scene) return { fatal: "anazhRealm/scene kam nie" };
        const F = r.constructor.FERN_RING;
        const p0 = { x: r.state.playerMesh.position.x, z: r.state.playerMesh.position.z };

        // ===== (4) HEADLESS-DEFAULT: ohne Hook entsteht KEIN Ring =====
        // (Hook sichern + wiederherstellen — die __anazhAutoSettlement-Disziplin.)
        const prevHook = window.__anazhFernRing;
        delete window.__anazhFernRing;
        for (let t = 0; t < 5; t++) r._tickFernRing(r.state.playerMesh.position);
        res.headlessQuiet = r.state.fernRing === null || r.state.fernRing === undefined;

        // ===== Hook AN: der Ring entsteht, der Refresh läuft budgetiert =====
        window.__anazhFernRing = true;
        // SYNCHRONER Pump-Block (kein await dazwischen — der RAF-Loop darf die
        // Budget-Zählung nicht verwischen): Tick 1 baut + erste Scheibe, dann
        // weiter bis der Cursor durch ist. Je Tick <= refreshVertsProTick.
        let ticks = 0;
        let maxDelta = 0;
        {
            let prevCursor = 0;
            r._tickFernRing(r.state.playerMesh.position);
            const fr0 = r.state.fernRing;
            if (!fr0) return { fatal: "Hook an, aber kein fernRing entstand" };
            prevCursor = fr0.cursor;
            maxDelta = prevCursor;
            ticks = 1;
            while (fr0.cursor < fr0.totalVerts && ticks < 100) {
                r._tickFernRing(r.state.playerMesh.position);
                const d = fr0.cursor - prevCursor;
                if (d > maxDelta) maxDelta = d;
                prevCursor = fr0.cursor;
                ticks++;
            }
        }
        const fr = r.state.fernRing;
        res.buildTicks = ticks;
        res.buildMaxDelta = maxDelta;
        res.buildBudgeted = maxDelta > 0 && maxDelta <= F.refreshVertsProTick && ticks >= 2;
        res.ready = fr.ready === true;

        // ===== (1) STRUKTUR: 3 Schalen, deklarierte Vertex-Zahlen, EIN Material =====
        const per = F.winkel * F.reihen;
        res.meshCount = fr.meshes.length;
        res.vertCounts = fr.meshes.map((m) => m.geometry.attributes.position.count);
        res.vertsDeclared = res.vertCounts.every((c) => c === per) && fr.totalVerts === per * 3;
        res.oneMaterial = fr.meshes.every((m) => m.material === fr.material);
        res.sceneMeshes = 0;
        r.state.scene.traverse((n) => {
            if (n.isMesh && n.userData && n.userData.inventar === "fern-ring") res.sceneMeshes++;
        });
        res.visible = fr.meshes.every((m) => m.visible === true);
        res.flags = fr.meshes.every((m) => m.frustumCulled === false && !m.castShadow && !m.receiveShadow);
        // Schale 1 beginnt AUSSERHALB des gebauten Rings (Ziel-Ring-Kante + randPad).
        const cfg = r._voxelChunkConfig();
        const targetRing = Math.max(1, Math.min(12, r.state.chunkRingRadius || 4));
        res.innerRandOk = fr.schalen[0].inner >= (targetRing + 0.5) * cfg.span + F.randPad - 1e-9;

        // ===== (2) HÖHEN == GESETZ: 60 deterministische Proben-Vertices =====
        // Die Erwartung UNABHÄNGIG nachgerechnet (Schalen-Layout + Snap + Klemme
        // + Saum) — das Gesetz selbst kommt aus _terrainMacroSurfaceY (EINE Quelle).
        const probeVertex = (gIdx, fudge) => {
            const s = (gIdx / per) | 0;
            const li = gIdx - s * per;
            const row = (li / F.winkel) | 0;
            const ai = li - row * F.winkel;
            const sh = fr.schalen[s];
            const rad = sh.inner + ((sh.aussen - sh.inner) * row) / (F.reihen - 1);
            const ang = (ai / F.winkel) * Math.PI * 2;
            const sx = Math.round((fr.anchorX + Math.cos(ang) * rad) / sh.snap) * sh.snap;
            const sz = Math.round((fr.anchorZ + Math.sin(ang) * rad) / sh.snap) * sh.snap;
            const wl = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            const law = r._terrainMacroSurfaceY(sx, sz, false);
            let expY = law < wl ? wl - F.wasserDrop : law;
            if (row === 0) expY -= F.saumDrop;
            // Selbsttest-Verfälschung NACH der Klemme (sonst bliebe eine wasser-
            // geklemmte Probe trotz Fudge grün — der Selbsttest wäre lückenhaft):
            expY += fudge || 0;
            const pos = fr.meshes[s].geometry.attributes.position;
            const okXZ = pos.getX(li) === sx && pos.getZ(li) === sz;
            const okY = Math.abs(pos.getY(li) - expY) < 0.01;
            return { ok: okXZ && okY, okXZ, okY, dy: Math.abs(pos.getY(li) - expY) };
        };
        // 60 Proben, deterministisch über alle Schalen/Reihen gestreut (149 ist
        // teilerfremd zu totalVerts) — inkl. Reihe-0-Saum und Wasser-Klemme.
        const probeAll = (fudge) => {
            let bad = 0;
            let worst = 0;
            for (let k = 0; k < 60; k++) {
                const p = probeVertex((k * 149) % fr.totalVerts, fudge);
                if (!p.ok) bad++;
                if (p.dy > worst) worst = p.dy;
            }
            return { bad, worst };
        };
        const p1 = probeAll(0);
        res.probesBad = p1.bad;
        res.probesWorst = p1.worst;
        // SELBSTTEST: die verfälschte Erwartung (law + 0.5) MUSS rot fallen.
        const pf = probeAll(0.5);
        res.selftestRed = pf.bad === 60;

        // ===== (3) RE-ZENTRIEREN: 400 m Teleport + Ticks pumpen =====
        const oldAnchorX = fr.anchorX;
        const p2 = { x: p0.x + 400, z: p0.z };
        // synchroner Block (Teleport + Pump ohne await — kein RAF-Interleave):
        let ticks2 = 0;
        let maxDelta2 = 0;
        {
            r.state.playerMesh.position.x = p2.x;
            r.state.playerMesh.position.z = p2.z;
            const refreshedBefore = fr.refreshed;
            let prevCursor2 = null;
            const pos2 = { x: p2.x, z: p2.z };
            r._tickFernRing(pos2); // Re-Anker: Cursor 0 + erste Scheibe
            res.anchorMoved = fr.anchorX !== oldAnchorX;
            res.anchorQuantized =
                fr.anchorX === Math.round(p2.x / F.anchorQuant) * F.anchorQuant &&
                fr.anchorZ === Math.round(p2.z / F.anchorQuant) * F.anchorQuant;
            prevCursor2 = fr.cursor;
            maxDelta2 = prevCursor2;
            ticks2 = 1;
            while (fr.cursor < fr.totalVerts && ticks2 < 100) {
                r._tickFernRing(pos2);
                const d = fr.cursor - prevCursor2;
                if (d > maxDelta2) maxDelta2 = d;
                prevCursor2 = fr.cursor;
                ticks2++;
            }
            res.refreshRan = fr.refreshed - refreshedBefore === fr.totalVerts;
            const p3 = probeAll(0);
            res.probes2Bad = p3.bad;
            res.probes2Worst = p3.worst;
        }
        res.reanchorTicks = ticks2;
        res.reanchorBudgeted = maxDelta2 > 0 && maxDelta2 <= F.refreshVertsProTick && ticks2 >= 2;

        // ===== (6) SICHT-BESITZ: Kamera-Weitung + Höhen-Öffnung + Rücknahme =====
        // Die Weitung geschah beim Pump (Ring wurde ready): far = Schale-3 + 500.
        const camFarWide = F.schalen[F.schalen.length - 1].aussen + 500;
        res.camFar = r.state.camera.far;
        res.camFarWide = camFarWide;
        res.camFarAlt = r._fernRingCamFarAlt;
        res.camWidened =
            r.state.camera.far === camFarWide &&
            Number.isFinite(r._fernRingCamFarAlt) &&
            r._fernRingCamFarAlt < camFarWide;
        // Die HÖHEN-ÖFFNUNG durch den ECHTEN Loop (der Spieler-Hub reist per
        // V18.356-Teleport-Adoption; die Kamera folgt in _loopCamera; die
        // Umgebungs-Proben sind takt-gecacht). `_gameLoopTick` wird erst bei
        // Renderer-Ready zugewiesen — erst darauf warten, dann DETERMINISTISCH
        // pumpen BIS die Bedingung steht (kein Ritt auf dem ~1-Hz-Headless-RAF).
        const dlLoop = performance.now() + 30000;
        while (typeof r._gameLoopTick !== "function" && performance.now() < dlLoop) await sleep(200);
        if (typeof r._gameLoopTick !== "function") res.loopFehler = "_gameLoopTick kam nie (Renderer-Ready)";
        const fogVal = () => (r.state.scene.fog ? +r.state.scene.fog.far.toFixed(1) : null);
        const pumpeBis = async (cond) => {
            for (let i = 0; i < 24; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    res.loopFehler = String(e && e.message);
                }
                if (cond(fogVal())) break;
                await sleep(Math.ceil(F.oeffnungTaktMs * 0.7));
            }
            return fogVal();
        };
        const px = r.state.playerMesh.position.x;
        const pz = r.state.playerMesh.position.z;
        const hy = r.getTerrainHeightAt(px, pz);
        r.state.playerMesh.position.y = (Number.isFinite(hy) ? hy : 0) + 1;
        res.fogBoden = await pumpeBis((f) => Number.isFinite(f) && f < 300);
        let umg = -Infinity;
        for (let k = 0; k < 4; k++) {
            const h = r.getTerrainHeightAt(
                px + (k & 1 ? F.oeffnungProbeM : -F.oeffnungProbeM) * (k & 2 ? 0 : 1),
                pz + (k & 1 ? F.oeffnungProbeM : -F.oeffnungProbeM) * (k & 2 ? 1 : 0)
            );
            if (Number.isFinite(h) && h > umg) umg = h;
        }
        r.state.playerMesh.position.y = umg + F.oeffnungVollM + 30;
        res.fogGipfel = await pumpeBis((f) => Number.isFinite(f) && f > 1000);
        r.state.playerMesh.position.y = (Number.isFinite(hy) ? hy : 0) + 1;
        res.fogZurueck = await pumpeBis((f) => Number.isFinite(f) && f < 300);
        res.oeffnungOk =
            !res.loopFehler &&
            Number.isFinite(res.fogBoden) &&
            res.fogBoden < 300 &&
            Number.isFinite(res.fogGipfel) &&
            res.fogGipfel > 1000 &&
            Number.isFinite(res.fogZurueck) &&
            res.fogZurueck < 300;
        // Die RÜCKNAHME: der Dispose stellt das alte far wieder her (Ring-Besitz).
        const altVorDispose = r._fernRingCamFarAlt;
        r._fernRingDispose();
        res.disposeRestored = r.state.camera.far === altVorDispose && r.state.fernRing === null;

        // ===== (7) DER FELD-ZEICHNER (Stufe-2-Vollausbau): das Feld malt =====
        // Neubau nach dem Dispose: Tick 1 baut den Ring, startet den EINEN
        // GPU-Feld-Flug (feld-wgsl durch _feldZeichnerHoehen) UND läuft die
        // erste CPU-Scheibe. Dann OHNE weitere Ticks auf den Flug warten:
        // malt das Feld, ist der Ring BEREIT obwohl der CPU-Cursor noch vorn
        // steht — der Horizont steht vor der CPU. Proben: |GPU-Höhe − f64-
        // Gesetz| ≤ 0.5 m (SEH-Band; die Linse gate:dritter-spiegel misst mm,
        // hier zählt der 8-km-Blick). Danach CPU zu Ende pumpen → Band 2 hat
        // bereits bewiesen, dass die Verfeinerung exakt ist.
        const sleep7 = (ms) => new Promise((rs) => setTimeout(rs, ms));
        r._tickFernRing(r.state.playerMesh.position);
        const fr7 = r.state.fernRing;
        res.fzStart = !!(fr7 && (fr7.gpuFlug === true || (fr7.gpuLaeufe || 0) >= 1));
        const dl7 = performance.now() + 90000;
        while (fr7 && (fr7.gpuLaeufe || 0) < 1 && fr7.gpuFlug === true && performance.now() < dl7) await sleep7(100);
        res.fzLaeufe = fr7 ? fr7.gpuLaeufe || 0 : 0;
        res.fzCursor = fr7 ? fr7.cursor : -1;
        res.fzTotal = fr7 ? fr7.totalVerts : -1;
        res.fzReadyVorCpu = !!(fr7 && fr7.ready === true && fr7.cursor < fr7.totalVerts);
        let fzWorst = -1;
        let fzProben = 0;
        if (fr7 && res.fzLaeufe >= 1) {
            fzWorst = 0;
            const wl7 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            for (let k = 0; k < 60; k++) {
                const g = (fr7.cursor + 1 + ((k * 47) % (fr7.totalVerts - fr7.cursor - 1))) | 0;
                const p7 = r._fernRingPunkt(fr7, g);
                const law7 = r._terrainMacroSurfaceY(p7.x, p7.z, false);
                let want = law7 < wl7 ? wl7 - F.wasserDrop : law7;
                if (p7.row === 0) want -= F.saumDrop;
                const y7 = fr7.meshes[p7.s].geometry.attributes.position.getY(p7.li);
                const d7 = Math.abs(y7 - want);
                if (d7 > fzWorst) fzWorst = d7;
                fzProben++;
            }
        }
        res.fzWorst = fzWorst;
        res.fzProben = fzProben;
        // CPU zu Ende (die Verfeinerung läuft über den GPU-Anstrich):
        for (let t = 0; t < 100 && fr7 && fr7.cursor < fr7.totalVerts; t++)
            r._tickFernRing(r.state.playerMesh.position);
        res.fzCpuFertig = !!(fr7 && fr7.cursor >= fr7.totalVerts);

        // ===== (8) DER FELD-PASS: die Ferne ganz ohne Schalen-Geometrie =====
        // Der Pass ist Ring-Besitz (_tickFeldPass aus _tickFernRing): warte auf
        // den EINEN Mal-Flug (Compute durch feld-wgsl), prüfe Struktur + Daten-
        // Parität (Texel-Höhe == f64-Gesetz im Seh-Band), dann die ECHTE
        // Render-Probe: ein WebGPURenderer zeichnet den Fullscreen-Raymarch —
        // der Horizont MUSS Pixel treffen (Kompilat + Lauf + Treffer bewiesen).
        const P8 = r.constructor.FELD_PASS;
        const dl8 = performance.now() + 90000;
        let fp8 = r.state.feldPass;
        while ((!fp8 || fp8.laeufe < 1) && performance.now() < dl8) {
            r._tickFernRing(r.state.playerMesh.position);
            fp8 = r.state.feldPass;
            await sleep7(100);
        }
        res.fpDa = !!fp8;
        res.fpLaeufe = fp8 ? fp8.laeufe : 0;
        res.fpTexOk = !!(fp8 && fp8.tex && fp8.tex.image.width === P8.az && fp8.tex.image.height === P8.rad);
        res.fpSichtbar = !!(fp8 && fp8.mesh.visible === true);
        let fpWorst = -1;
        if (fp8 && fp8.laeufe >= 1) {
            fpWorst = 0;
            const F8 = r.constructor.FERN_RING;
            const rMin8 = F8.schalen[F8.schalen.length - 1].aussen;
            const wl8 = Number.isFinite(r.state.waterLevel) ? r.state.waterLevel : 0;
            for (let k = 0; k < 40; k++) {
                const ix = (k * 37) % P8.az;
                const iy = (k * 11) % P8.rad;
                const rr = rMin8 + ((iy + 0.5) / P8.rad) * (P8.rMaxM - rMin8);
                const aa = ((ix + 0.5) / P8.az - 0.5) * 2 * Math.PI;
                const law8 = r._terrainMacroSurfaceY(
                    fp8.anchorX + Math.cos(aa) * rr,
                    fp8.anchorZ + Math.sin(aa) * rr,
                    false
                );
                const want8 = law8 < wl8 ? wl8 : law8;
                const d8 = Math.abs(fp8.daten[(iy * P8.az + ix) * 4] - want8);
                if (d8 > fpWorst) fpWorst = d8;
            }
        }
        res.fpWorst = fpWorst;
        // Die ECHTE Render-Probe (der Null-Renderer der Seite zeichnet nie):
        try {
            const szene8 = new THREE.Scene();
            const alterParent = fp8 ? fp8.mesh.parent : null;
            if (fp8) szene8.add(fp8.mesh);
            const cam8 = new THREE.PerspectiveCamera(60, 1.5, 1, 45000);
            const bodenY = r._terrainMacroSurfaceY(fp8.anchorX, fp8.anchorZ, false);
            cam8.position.set(fp8.anchorX, bodenY + 60, fp8.anchorZ);
            cam8.lookAt(fp8.anchorX + 1000, bodenY + 40, fp8.anchorZ);
            cam8.updateMatrixWorld(true);
            fp8.U.camPos.value.copy(cam8.position);
            fp8.U.invVP.value.multiplyMatrices(cam8.projectionMatrix, cam8.matrixWorldInverse).invert();
            const ren8 = new THREE.WebGPURenderer({ antialias: false });
            await ren8.init();
            ren8.setSize(96, 64, false);
            const rt8 = new THREE.RenderTarget(96, 64);
            ren8.setRenderTarget(rt8);
            // Diagnose-Stufe A: Konstant-Farbe (beweist das Fullscreen-Dreieck)
            const echterOut = fp8.mat.outputNode;
            fp8.mat.outputNode = THREE.TSL.vec4(1, 0, 0, 1);
            fp8.mat.needsUpdate = true;
            await ren8.renderAsync(szene8, cam8);
            const bufA = await ren8.readRenderTargetPixelsAsync(rt8, 0, 0, 96, 64);
            let trefferA = 0;
            for (let px = 0; px < 96 * 64; px++) if (bufA[px * 4] > 0) trefferA++;
            res.fpTrefferKonstant = trefferA;
            fp8.mat.outputNode = echterOut;
            fp8.mat.needsUpdate = true;
            await ren8.renderAsync(szene8, cam8);
            const buf8 = await ren8.readRenderTargetPixelsAsync(rt8, 0, 0, 96, 64);
            let treffer8 = 0;
            for (let px = 0; px < 96 * 64; px++) {
                if (buf8[px * 4 + 3] > 0 && buf8[px * 4] + buf8[px * 4 + 1] + buf8[px * 4 + 2] > 0) treffer8++;
            }
            res.fpTreffer = treffer8;
            ren8.dispose();
            if (fp8 && alterParent) alterParent.add(fp8.mesh);
        } catch (e8) {
            res.fpRenderErr = (e8 && e8.message) || String(e8);
        }
        r._fernRingDispose();
        res.fpDisposed = r.state.feldPass === null || r.state.feldPass === undefined;

        // Hook wiederherstellen (sichern + wiederherstellen, nie löschen):
        if (prevHook === undefined) delete window.__anazhFernRing;
        else window.__anazhFernRing = prevHook;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error(`❌ FATAL: ${out.fatal}`);
        process.exit(2);
    }
    check("4: HEADLESS-DEFAULT — ohne Hook entsteht KEIN Ring (Null-Renderer ruht)", out.headlessQuiet === true);
    check(
        "1: genau 3 Schalen-Meshes in der Szene (Draw-Calls gedeckelt)",
        out.meshCount === 3 && out.sceneMeshes === 3,
        `meshes=${out.meshCount} szene=${out.sceneMeshes}`
    );
    check(
        "1: Vertex-Zahlen wie deklariert (winkel×reihen je Schale)",
        out.vertsDeclared === true,
        `counts=${out.vertCounts && out.vertCounts.join("/")}`
    );
    check("1: EIN geteiltes Material für alle Schalen", out.oneMaterial === true);
    check("1: sichtbar erst nach vollem Refresh + frustumCulled/Schatten aus", out.ready && out.visible && out.flags);
    check("1: Schale 1 beginnt AUSSERHALB der Ziel-Ring-Kante (+randPad)", out.innerRandOk === true);
    check(
        "Bau BUDGETIERT über Ticks (je Tick <= refreshVertsProTick, mehrere Ticks — BOOT_PHASE3-Muster)",
        out.buildBudgeted === true,
        `ticks=${out.buildTicks} maxDelta=${out.buildMaxDelta}`
    );
    check(
        "2: HÖHEN == GESETZ — 60 Proben |mesh − _terrainMacroSurfaceY(snap,false)| < 0.01 (inkl. Wasser-Klemme/Saum)",
        out.probesBad === 0,
        `bad=${out.probesBad} worst=${out.probesWorst && out.probesWorst.toFixed(4)}`
    );
    check("SELBSTTEST: die verfälschte Erwartung (law + 0.5) fällt rot (60/60)", out.selftestRed === true);
    check(
        "3: RE-ZENTRIEREN — der Anker wandert QUANTISIERT nach 400-m-Teleport",
        out.anchorMoved === true && out.anchorQuantized === true
    );
    check(
        "3: der Höhen-Refresh läuft budgetiert durch (Budget-Zähler == totalVerts)",
        out.refreshRan === true && out.reanchorBudgeted === true,
        `ticks=${out.reanchorTicks}`
    );
    check(
        "3: die Proben stimmen am NEUEN Ort (Höhen schwimmen nicht)",
        out.probes2Bad === 0,
        `bad=${out.probes2Bad} worst=${out.probes2Worst && out.probes2Worst.toFixed(4)}`
    );
    check(
        "6: KAMERA-WEITUNG — far = Schale-3-aussen + 500, alter Wert gemerkt",
        out.camWidened === true,
        `far=${out.camFar} soll=${out.camFarWide} alt=${out.camFarAlt}`
    );
    check(
        "6: HÖHEN-ÖFFNUNG — Boden Wald-Gesetz, über der Umgebung offen (>1000), zurück geschlossen",
        out.oeffnungOk === true,
        `boden=${out.fogBoden} gipfel=${out.fogGipfel} zurueck=${out.fogZurueck}${out.loopFehler ? " loopFehler=" + out.loopFehler : ""}`
    );
    check("6: DISPOSE-RÜCKNAHME — camera.far kehrt zum alten Wert zurück, Ring entsorgt", out.disposeRestored === true);
    check(
        "7: DER FELD-ZEICHNER startet den GPU-Flug beim vollen Refresh (feld-wgsl im SPIEL konsumiert)",
        out.fzStart === true && out.fzLaeufe >= 1,
        `laeufe=${out.fzLaeufe}`
    );
    check(
        "7: das Feld malt den Horizont VOR der CPU (ready bei cursor < totalVerts)",
        out.fzReadyVorCpu === true,
        `cursor=${out.fzCursor}/${out.fzTotal}`
    );
    check(
        "7: GPU-Höhen im SEH-Band des dritten Spiegels (≤ 0.5 m auf 8 km, 60 Proben)",
        out.fzProben >= 40 && out.fzWorst >= 0 && out.fzWorst <= 0.5,
        `worst=${Number.isFinite(out.fzWorst) ? out.fzWorst.toFixed(4) : out.fzWorst} proben=${out.fzProben}`
    );
    check("7: die CPU verfeinert danach aufs f64-Gesetz durch (Cursor läuft voll)", out.fzCpuFertig === true);
    check(
        "8: DER FELD-PASS existiert und das Feld malte seine Textur (Compute durch feld-wgsl)",
        out.fpDa === true && out.fpLaeufe >= 1 && out.fpTexOk === true && out.fpSichtbar === true,
        `laeufe=${out.fpLaeufe}`
    );
    check(
        "8: Texel-Höhen == f64-Gesetz im Seh-Band (≤ 0.5 m bis 40 km, Wasser flach auf wl)",
        out.fpWorst >= 0 && out.fpWorst <= 0.5,
        `worst=${Number.isFinite(out.fpWorst) ? out.fpWorst.toFixed(4) : out.fpWorst}`
    );
    check(
        "8: die ECHTE Render-Probe trifft — der Fullscreen-Raymarch zeichnet Horizont-Pixel",
        Number.isFinite(out.fpTreffer) && out.fpTreffer > 50,
        `treffer=${out.fpTreffer}${out.fpRenderErr ? " err=" + out.fpRenderErr : ""}`
    );
    check("8: der Pass fällt mit dem Ring (Dispose)", out.fpDisposed === true);
    check("5: kein pageerror", pageErrors.length === 0, pageErrors[0] || "");

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER FERN-RING STEHT UND DAS FELD ZEICHNET: 3 Schalen aus dem EINEN Höhen-Gesetz " +
            "(Fern-Wahrheit includeDetail=false, XZ welt-gesnappt), der Feld-Zeichner malt den vollen " +
            "Refresh per GPU durch feld-wgsl (die CPU verfeinert aufs f64-Gesetz), budgetierter Refresh, " +
            "quantisiertes Re-Zentrieren, headless-default ruhig."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Fern-Ring-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
