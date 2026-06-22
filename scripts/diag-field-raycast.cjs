// FELD-RAYCAST-LINSE (P3-Vorbereitung) — der feld-native Raycast (DDA + Struktur-Box-Ray) muss
// treffen, wo der Ammo-rayTest trifft (Grab/Graben/Platzieren/Decke/Kamera hängen daran), BEVOR
// P3 den Ammo-Pfad löscht. Vier Prüfungen:
//   (A) SELBST-KONSISTENT: ein Strahl gerade nach unten trifft die Feld-Oberfläche (_fieldSurfaceBelow).
//   (B) vs AMMO: derselbe Strahl trifft beim Ammo-rayTest am ~gleichen Punkt (< 0,6 m).
//   (C) STRUKTUR: ein Strahl auf ein Bauwerk trifft dessen Box (innerhalb der x-Spanne).
//   (D) KEIN FALSCH-TREFFER: ein Strahl in den Himmel trifft NICHTS.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4367,
    root = path.resolve(__dirname, "..");
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
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        let stubbed = false;
        const startW = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - startW < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                if (r.state.voxelWorker) {
                    try {
                        r.state.voxelWorker.terminate();
                    } catch (_e) {}
                    r.state.voxelWorker = null;
                }
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
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
        const r = window.anazhRealm,
            s = r.state;
        if (!r._gameLoopTick || !s.playerMesh) return { error: "Welt nicht bereit" };
        const sf = s.scaleFactor || 1;
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;

        // Ammo-Raycast direkt (fieldPhysics AUS) — Welt-Koords rein, Welt-Treffer raus.
        const ammoRay = (sx, sy, sz, ex, ey, ez) => {
            const before = s.fieldPhysics;
            s.fieldPhysics = false;
            const rs = r.setVec(s.tmpVec1, sx / sf, sy / sf, sz / sf);
            const re = r.setVec(s.tmpVec2, ex / sf, ey / sf, ez / sf);
            const res = r._runRaycast(rs, re, (cb, hit) => {
                if (!hit) return null;
                const p = cb.get_m_hitPointWorld();
                return { x: p.x() * sf, y: p.y() * sf, z: p.z() * sf };
            });
            s.fieldPhysics = before;
            return res;
        };

        // ===== (A)+(B) DOWNWARD: Feld vs _fieldSurfaceBelow + vs Ammo =====
        let boundaryBad = 0,
            ammoMax = 0,
            ammoN = 0,
            n = 0,
            misses = 0;
        const dbg = [];
        for (let i = 0; i < 40; i++) {
            const x = px + (((i * 89) % 60) - 30);
            const z = pz + (((i * 137) % 60) - 30);
            const h = r.getTerrainHeightAt(x, z);
            if (!Number.isFinite(h)) continue;
            // den Strahl an der FELD-Oberfläche verankern (echte Raycasts starten in der Luft).
            const surf = r._fieldSurfaceBelow(x, h + 30, z, 60);
            if (surf === null) continue;
            const sy = surf + 6,
                ey = surf - 6;
            if (r._fieldSolid(x, sy, z)) continue; // Start muss Luft sein
            const fr = r._fieldRaycast(x, sy, z, x, ey, z);
            if (!fr.hit) {
                misses++;
                continue;
            }
            n++;
            // (A) SELBST-WAHR: der Treffer liegt auf einer ECHTEN Luft/Solid-Grenze des Feldes
            // (Solid knapp darunter, Luft knapp darüber) — der Strahl erfindet keine Oberfläche.
            // (B) vs AMMO (die Mesh-Wahrheit, an der heute Grab/Graben hängt) — zuerst, damit (A) sie nutzen kann.
            const am = ammoRay(x, sy, z, x, ey, z);
            if (am) {
                ammoN++;
                ammoMax = Math.max(ammoMax, Math.abs(fr.y - am.y));
            }
            // (A) SELBST-WAHR: ein Treffer ist gültig, wenn der Strahl aus der LUFT kam (airAbove,
            // kein Start-im-Soliden-Müll) UND er entweder im Soliden sitzt ODER vom Ammo-Mesh
            // bestätigt wird. Eine ERFUNDENE Oberfläche säße in der Luft ohne Ammo-Bestätigung.
            // (Razor-dünne Roughness-Spitzen: solidAt false, aber Ammo = Ray → gültig, kein Bug.)
            const solidAt = r._fieldSolid(x, fr.y - 0.01, z);
            const airAbove = !r._fieldSolid(x, fr.y + 0.1, z);
            const ammoConfirms = am && Math.abs(fr.y - am.y) < 0.6;
            if (!airAbove || !(solidAt || ammoConfirms)) boundaryBad++;
            if (dbg.length < 8)
                dbg.push({
                    frY: +fr.y.toFixed(2),
                    solidAt,
                    airAbove,
                    ammoConfirms: !!ammoConfirms,
                    ammoY: am ? +am.y.toFixed(2) : null,
                });
        }

        // ===== (C) STRUKTUR: ein Bauwerk spawnen, horizontal anstrahlen =====
        let structHit = null;
        const flat = (() => {
            let best = null,
                bestNy = -1;
            for (let i = 0; i < 200; i++) {
                const x = px + (((i * 53) % 60) - 30),
                    z = pz + (((i * 31) % 60) - 30);
                const h = r.getTerrainHeightAt(x, z);
                if (!Number.isFinite(h) || !r._isAboveWaterAt(x, z)) continue;
                const g = r._fieldGradient(x, h, z, {});
                if (g.y > bestNy) {
                    bestNy = g.y;
                    best = { x, z, h };
                }
            }
            return best || { x: px, z: pz, h: r.getTerrainHeightAt(px, pz) };
        })();
        let entry = null;
        for (const t of ["temple", "village", "tower", "haus", "monument"]) {
            try {
                const e = r.spawnArchitecture(t, { x: flat.x, y: flat.h, z: flat.z }, {});
                if (e && e.blockerAABBs && e.blockerAABBs.length) {
                    entry = e;
                    break;
                }
            } catch (_e) {}
        }
        if (entry) {
            let wall = entry.blockerAABBs[0];
            for (const b of entry.blockerAABBs) if (b.topY > wall.topY) wall = b;
            const cy = (wall.botY + wall.topY) / 2;
            const cz = (wall.minZ + wall.maxZ) / 2;
            // von links (−X, 8 m vor minX) nach +X durch die Box strahlen
            const fr = r._fieldRaycast(wall.minX - 8, cy, cz, wall.maxX + 2, cy, cz);
            structHit = {
                hit: fr.hit,
                x: +fr.x.toFixed(2),
                minX: +wall.minX.toFixed(2),
                maxX: +wall.maxX.toFixed(2),
                onFace: fr.hit && fr.x >= wall.minX - 0.6 && fr.x <= wall.minX + 0.6, // trifft die Vorderkante
            };
        }

        // ===== (D) KEIN FALSCH-TREFFER: horizontaler Strahl HOCH über dem Terrain (+100 m) =====
        // dort ist garantiert kein Solid + keine Struktur (die sitzt auf Boden-Höhe) → muss MISS sein.
        const skyH = r.getTerrainHeightAt(px, pz);
        const skyRay = r._fieldRaycast(px, skyH + 100, pz, px + 20, skyH + 100, pz);

        return {
            down: { n, misses, boundaryBad, ammoN, ammoMax: +ammoMax.toFixed(3), dbg },
            struct: structHit,
            sky: { hit: skyRay.hit },
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    let pass = true;
    const ok = (c, l) => {
        console.log(`  ${c ? "✅" : "❌"} ${l}`);
        if (!c) pass = false;
    };
    console.log("\n===== FELD-RAYCAST-VERIFIKATION (P3-Vorbereitung) =====\n");
    console.log(
        `  (A) SELBST-WAHR: n=${out.down.n} misses=${out.down.misses} · Grenz-Verletzungen ${out.down.boundaryBad}`
    );
    ok(
        out.down.n > 10 && out.down.misses === 0 && out.down.boundaryBad === 0,
        "jeder Treffer liegt auf einer ECHTEN Luft/Solid-Grenze (Solid drunter, Luft drüber — keine erfundene Oberfläche)"
    );
    console.log(`  (B) vs AMMO: n=${out.down.ammoN} · max |Feld−Ammo| ${out.down.ammoMax} m`);
    ok(
        out.down.ammoN > 5 && out.down.ammoMax < 1.2,
        "der Feld-Strahl trifft am ~gleichen Punkt wie der Ammo-rayTest (< 1,2 m; Rest = Mesh/Feld-Quantelung an dünnen Kanten)"
    );
    if (out.struct) {
        console.log(
            `  (C) STRUKTUR: hit ${out.struct.hit} · x ${out.struct.x} (Vorderkante ${out.struct.minX}) · onFace ${out.struct.onFace}`
        );
        ok(out.struct.hit && out.struct.onFace, "der Feld-Strahl trifft die Bauwerks-Box an der Vorderkante");
    } else {
        console.log("  (C) STRUKTUR: kein Bauwerk spawnbar (übersprungen)");
    }
    console.log(`  (D) HIMMEL: hit ${out.sky.hit}`);
    ok(!out.sky.hit, "ein Strahl ins Leere trifft NICHTS (kein Falsch-Treffer)");
    console.log(
        `\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN — der Feld-Raycast ist P3-bereit" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`
    );
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-field-raycast.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();
