// Sonde SITZ 2 (0710-4 Klasse 4): der Reiter in der Sitz-Pose je Wagen-Art, gemessen an der HAUT (jede Ecke über ihre
// Knochen, im Rahmen des Spieler-Ursprungs): je Knochen die tiefste/höchste Ecke, die Oberkante aller Meshes (Haar
// inklusive), Sitzfläche und Dach des Kerns relativ zum Ursprung, die Gier von Avatar und Wagen.
//   SONDE_WT=<worktree> node sonde-sitz2.cjs [port]
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-impuls");
const puppeteer = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren/node_modules/puppeteer");
const http = require("http"),
    fs = require("fs"),
    path = require("path");
const { softwareWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const PORT = Number(process.argv[2] || 7905);
const root = path.resolve(WT);
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((q) => setTimeout(q, ms));
        const t0 = performance.now();
        while (!(window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") && performance.now() - t0 < 60000) await sleep(100);
        const r = window.anazhRealm,
            st = r.state,
            f = r._ensureAssetFoundry();
        while (performance.now() - t0 < 90000 && !(f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt)) await sleep(80);
        let tMs = performance.now();
        const frame = () => {
            tMs += 1000 / 60;
            r._gameLoopTick(tMs);
        };
        const hh = (a, b) => r.getTerrainHeightAt(a, b);
        const O = [-900, -850];
        st.playerMesh.position.set(O[0], hh(O[0], O[1]) + 2, O[1]);
        for (let i = 0; i < 300; i++) {
            frame();
            if (i % 40 === 39) await sleep(30);
        }
        const namen = Object.keys(st.blueprints).filter((n) => /^fahrzeug_|karren/.test(n));
        const zeilen = [];
        const V = new THREE.Vector3();
        const inv = new THREE.Matrix4();
        const messen = () => {
            const pm = st.playerMesh;
            pm.updateMatrixWorld(true);
            inv.copy(pm.matrixWorld).invert();
            const nah = (pm.userData._menschFern && pm.userData._menschFern.nah) || pm;
            const jeKnochen = {};
            let oben = -Infinity,
                obenWer = null;
            nah.traverse((o) => {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                if (!o.visible) return;
                const pos = o.geometry.attributes.position;
                const sk = o.isSkinnedMesh ? o : null;
                const sw = sk && o.geometry.attributes.skinWeight;
                const si = sk && o.geometry.attributes.skinIndex;
                const art = (o.material && o.material.userData && o.material.userData.foundryKind) || o.name || "?";
                for (let i = 0; i < pos.count; i++) {
                    V.fromBufferAttribute(pos, i);
                    let kn = art;
                    if (sk) {
                        sk.applyBoneTransform(i, V);
                        let bw = -1;
                        for (let k = 0; k < 4; k++) {
                            const w = sw.getComponent(i, k);
                            if (w > bw) {
                                bw = w;
                                const b = sk.skeleton.bones[si.getComponent(i, k)];
                                kn = (b && b.name) || "#" + si.getComponent(i, k);
                            }
                        }
                    }
                    V.applyMatrix4(o.matrixWorld).applyMatrix4(inv);
                    const e = jeKnochen[kn] || (jeKnochen[kn] = { n: 0, min: Infinity, max: -Infinity, minZ: Infinity, maxZ: -Infinity });
                    e.n++;
                    if (V.y < e.min) e.min = V.y;
                    if (V.y > e.max) e.max = V.y;
                    if (V.z < e.minZ) e.minZ = V.z;
                    if (V.z > e.maxZ) e.maxZ = V.z;
                    if (V.y > oben) {
                        oben = V.y;
                        obenWer = kn;
                    }
                }
            });
            for (const k in jeKnochen) {
                const e = jeKnochen[k];
                for (const q of ["min", "max", "minZ", "maxZ"]) e[q] = +e[q].toFixed(3);
            }
            const rig = pm.userData.rig;
            const hp = new THREE.Vector3();
            if (rig && rig.legL && rig.legL.hip) rig.legL.hip.getWorldPosition(hp).applyMatrix4(inv);
            return { jeKnochen, oben: +oben.toFixed(3), obenWer, huefte: { y: +hp.y.toFixed(3), z: +hp.z.toFixed(3), x: +hp.x.toFixed(3) } };
        };
        for (const name of namen) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (const w of (st.architectures || []).slice()) if (w && (/^fahrzeug_/.test(w.type) || /karren/.test(w.type))) r.removeArchitecture(w);
            const x = O[0] + 4,
                z = O[1];
            st.playerMesh.position.set(x, hh(x, z) + 1.2, z);
            const e = r.spawnArchitecture(name, { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true });
            if (!e) {
                zeilen.push({ name, fehler: "spawn" });
                continue;
            }
            const dl = performance.now() + 30000;
            while (!e.instanced && !e.mesh && performance.now() < dl) {
                r._rebuildArchitectureMesh(e);
                if (e.instanced || e.mesh) break;
                for (let i = 0; i < 6; i++) frame();
                await sleep(80);
            }
            const mr = r.mountArchitecture(e);
            if (!mr || !mr.ok) {
                zeilen.push({ name, fehler: "aufsitzen" });
                continue;
            }
            for (let i = 0; i < 30; i++) frame();
            r._applySeatPose(st.playerMesh, tMs / 1000);
            const m = messen();
            const fzg = r._fahrzeugGesetzFor(e);
            const drive = fzg && fzg.drive;
            const sc = Number.isFinite(e.scale) ? e.scale : 1;
            const basis = e.position.y - 0.5;
            const pmY = st.playerMesh.position.y;
            zeilen.push({
                name,
                scale: sc,
                sitzHoehe: e._sitzHeight,
                sitzRel: drive && drive.sitz ? +(basis + drive.sitz.y * sc - pmY).toFixed(3) : null,
                sitzXZ: drive && drive.sitz ? [drive.sitz.x * sc, drive.sitz.z * sc] : null,
                dachRel: drive && drive.huelle ? +(basis + drive.huelle.yRoof * sc - pmY).toFixed(3) : null,
                avatarGier: +st.playerMesh.rotation.y.toFixed(3),
                wagenGier: Number.isFinite(e._rideYaw) ? +e._rideYaw.toFixed(3) : null,
                sichtbar: st.playerMesh.visible,
                ...m,
            });
        }
        return zeilen;
    });
    await browser.close();
    server.close();
    console.log(JSON.stringify(out, null, 1));
})();
