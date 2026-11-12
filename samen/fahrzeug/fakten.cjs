// WEGWERF: Zähl-Fakten am Bau von heute (Teile, Geometrie-Arten, Unterkante des Lacks, Stufe 1), alle fünf Rezepte.
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..", "..");
const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": { ".html": "text/html", ".js": "text/javascript" }[path.extname(p)] || "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
});
(async () => {
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/samen/fahrzeug/spike.html`);
    await page.waitForFunction("window.__bereit === true", null, { timeout: 120000 });
    const out = await page.evaluate(() => {
        const VC = window.spike.VC, THREE = window.THREE, r = {};
        for (const id of Object.keys(VC.PRESETS)) {
            const z = {};
            for (const lod of [0, 1]) {
                const g = VC.buildInstance(id, 5, lod);
                let tris = 0, meshes = 0, box = 0, boxTris = 0, minLack = Infinity, mats = new Set();
                const arten = {};
                const v = new THREE.Vector3();
                g.traverse((o) => {
                    if (!o.isMesh) return;
                    meshes++; mats.add(o.material);
                    const n = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
                    tris += n;
                    arten[o.geometry.type] = (arten[o.geometry.type] || 0) + 1;
                    if (o.geometry.type === "BoxGeometry") { box++; boxTris += n; }
                    if (o.material.userData.__lack) { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < minLack) minLack = v.y; } }
                });
                const haut = g.children[1]; let hm = 0, hbox = 0; haut.traverse((o) => { if (o.isMesh) { hm++; if (o.geometry.type === "BoxGeometry") hbox++; } });
                z["L" + lod] = { tris, meshes, box, boxTris, stoffe: mats.size, arten, hautMeshes: hm, hautBox: hbox, teile: g.children.map((c) => { let n = 0; c.traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return n; }), lackUnterkante: +minLack.toFixed(3) };
            }
            const P = Object.assign({}, VC.DEFAULT_P, VC.BASE_P, VC.PRESETS[id].s, VC.PRESETS[id].fx), D = VC.derive(P);
            z.mass = { L: +(D.Ltot).toFixed(2), radstand: P.radstand, spur: P.spur, uV: P.ueberhangV, uH: P.ueberhangH, dach: P.dach, guertel: P.guertel, fahrhoehe: P.fahrhoehe, radR: P.radR, rake: P.windshieldRake, scheibeGrad: +(Math.atan2(1, P.windshieldRake) * 180 / Math.PI).toFixed(1), freigang: +VC.wheelClearance(P, D.fAx, true).gap.toFixed(3), archHalf: +(P.radR * 1.18).toFixed(3), radlaufOben: +Math.max(P.guertel + 0.015, 2 * P.radR + VC.wheelClearance(P, D.fAx, true).gap).toFixed(3) };
            z.lehren = VC.evalLehren(P).map((e) => e.L.id + ":" + e.v.toFixed(3) + ":" + e.st).join(" ");
            r[id] = z;
        }
        return r;
    });
    fs.writeFileSync(path.join(__dirname, "fakten.json"), JSON.stringify(out, null, 1));
    for (const k in out) console.log(k, JSON.stringify(out[k]));
    await browser.close(); server.close();
})();
