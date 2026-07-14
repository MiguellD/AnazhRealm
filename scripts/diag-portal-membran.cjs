// diag-portal-membran.cjs — V18.464 DIE PORTAL-VOLLENDUNG (Konsum-Beweis).
// Beweist im ECHTEN Boot (foundry-ON, warmes Buch, Null-Renderer), dass ein
// Tor-Gestalt-Portal in der Welt VOLLSTÄNDIG integriert ist:
//
//   K (Kollision): das gespawnte Welt-Portal trägt die GESETZ-Hülle
//     (5 Pseudo-Part-Boxen aus deriveGate) — die APERTUR ist körperlich FREI
//     (Probe-Punkte in der Öffnung treffen keine Box), die PFOSTEN sind
//     SOLIDE (Probe-Punkte im Rahmen treffen), und der alte Quarz-Riegel
//     (Alt-Substanz-AABB mitten in der Öffnung) ist GEFALLEN.
//   M (Membran): der Membran-Tick baut für das Portal EIN Passage-Mesh
//     (Registry je entry.id, Material-Marker portalMembran bzw. fail-LAUT-
//     Fallback), und die Uniforms atmen (time/act ändern sich mit Tick+Nähe).
//   W (Hindurchgehen): kreuzt der Spieler die Membran-Ebene INNERHALB der
//     Apertur, feuert enterPortal (derselbe Chokepoint wie die E-Taste) —
//     seitlich am Pfosten vorbei feuert NICHT.
//
//   node scripts/diag-portal-membran.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORTAL_MEMBRAN_PORT || 4439);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { boot: false, warm: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.geisttor) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        res.warm = !!(f && f.ready && f.recipes && f.recipes.geisttor);

        // ── Bühne: ein Welt-Portal (geisttor-Gestalt) direkt vor dem Spieler ──
        const p = r.state.playerMesh.position;
        const entry = r.spawnArchitecture("welt_portal", { x: p.x + 10, y: p.y, z: p.z }, { precise: true });
        res.spawned = !!entry;
        if (!entry) return res;
        const tor = r._torGesetzFor(entry);
        res.torGesetz = !!tor;
        if (!tor) return res;
        const mu = tor.mu;
        res.gestalt = tor.gestalt;

        // ── K: Kollisions-Hülle aus dem Gesetz ──
        const boxes = entry.blockerAABBs || [];
        res.k = { boxCount: boxes.length };
        const hit = (wx, wy, wz) =>
            boxes.some(
                (b) => wx >= b.minX && wx <= b.maxX && wz >= b.minZ && wz <= b.maxZ && wy >= b.botY && wy <= b.topY
            );
        const ex = entry.position.x,
            ey = entry.position.y - 0.5,
            ez = entry.position.z;
        // Apertur-Probe: Torso-Höhe, Mitte + halbe Öffnung, über die Tiefe.
        res.k.aperturFrei =
            !hit(ex, ey + 1.2, ez) &&
            !hit(ex + mu.rimAx * 0.6, ey + 1.2, ez) &&
            !hit(ex - mu.rimAx * 0.6, ey + 1.2, ez) &&
            !hit(ex, ey + 1.2, ez + mu.zFace * 0.8) &&
            !hit(ex, ey + 1.2, ez - mu.zFace * 0.8);
        // Pfosten-Probe: mitten im Rahmen, beidseitig.
        const jambX = mu.rimAx + Math.max(0.3, mu.jambW * (mu.orders + 0.5)) / 2;
        res.k.pfostenSolide = hit(ex + jambX, ey + 1.2, ez) && hit(ex - jambX, ey + 1.2, ez);
        // Krone-Probe: über dem Scheitel.
        res.k.kroneSolide = hit(ex, ey + mu.apexY + 0.15, ez);

        // ── M: Membran-Bau + Atem ──
        r._tickPortalMembranes(1.0);
        // 1-Hz-Scan-Throttle überspringen: zweiter Tick nach Scan-Fenster.
        r._tickPortalMembranes(2.5);
        const reg = r._portalMembranes;
        const rec = reg ? reg.get(entry.id) : null;
        res.m = { built: !!(rec && rec.mesh), inScene: !!(rec && rec.mesh && rec.mesh.parent === r.state.scene) };
        if (rec) {
            const t0 = rec.u.time.value;
            r._tickPortalMembranes(3.7);
            res.m.atmet = rec.u.time.value !== t0;
            res.m.echt = !!(
                rec.mesh.material &&
                rec.mesh.material.userData &&
                rec.mesh.material.userData.portalMembran
            );
            res.m.marker = res.m.echt || !!rec.mesh.material.isMeshBasicMaterial;
        }

        // ── F: Tür-Flügel öffnen sich dem Reisenden (V18.465) ──
        // Erst MATERIALISIEREN (das Asset ist async — der Rewarm-Weg von Hand,
        // das Gestalt-Gate-C-Muster), dann Nähe + Ticks.
        const dlF = performance.now() + 90000;
        while (!entry.instanced && performance.now() < dlF) {
            r._rebuildArchitectureMesh(entry);
            if (entry.instanced) break;
            await new Promise((r2) => setTimeout(r2, 300));
        }
        res.fInstanced = entry.instanced === true;
        p.x = ex;
        p.z = ez + 2.0;
        p.y = ey + 1.0;
        for (let i = 0; i < 40; i++) r._tickPortalMembranes(3.8 + i * 0.016);
        const recF = r._portalMembranes.get(entry.id);
        res.f = {
            fluegelGefunden: !!(recF && recF._fluegel && recF._fluegel.length > 0),
            anzahl: recF && recF._fluegel ? recF._fluegel.length : 0,
            geoeffnet: !!(recF && recF._fluegelWinkel > 0.2),
            winkel: recF ? +(recF._fluegelWinkel || 0).toFixed(3) : 0,
        };

        // ── W: Hindurchgehen (Ebenen-Kreuzung in der Apertur → enterPortal) ──
        let entered = 0;
        const origEnter = r.enterPortal.bind(r);
        r.enterPortal = (e2) => {
            entered++;
            return { ok: true, reason: "diag-abgefangen", type: e2 && e2.type };
        };
        // Vor dem Tor stehen (lz > 0), dann über die Ebene (lz < 0) — in der Apertur.
        p.x = ex;
        p.z = ez + 1.5;
        p.y = ey + 1.0;
        r._tickPortalMembranes(4.2);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.3);
        res.w = { feuert: entered === 1 };
        // Re-Arm-Wand: OHNE die Zone zu verlassen feuert das Rueck-Kreuzen NICHT;
        // nach dem Verlassen (lz jenseits zFace+1.2) feuert der naechste Durchgang wieder.
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.4);
        res.w.keinDoppel = entered === 1;
        p.z = ez + mu.zFace + 4.0;
        r._tickPortalMembranes(4.5);
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.55);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.6);
        res.w.rearmWand = entered === 2;
        // Seitlich am Pfosten vorbei (außerhalb der Apertur) feuert NICHT.
        entered = 0;
        p.x = ex + mu.rimAx + 2.0;
        p.z = ez + 1.5;
        r._tickPortalMembranes(4.7);
        p.z = ez - 1.5;
        r._tickPortalMembranes(4.8);
        res.w.seitlichStumm = entered === 0;
        r.enterPortal = origEnter;
        return res;
    });

    console.log("=== V18.464 PORTAL-MEMBRAN — Kollision · Passage · Hindurchgehen ===");
    check("Boot + warmes Buch (geisttor im LIVE-Buch)", out.boot && out.warm);
    check("welt_portal gespawnt + Tor-Gesetz aufgelöst", out.spawned && out.torGesetz, `gestalt=${out.gestalt}`);
    if (out.k) {
        check(
            "K: Gesetz-Hülle trägt 5 Boxen (Pfosten×2 · Schultern×2 · Krone)",
            out.k.boxCount === 5,
            `boxen=${out.k.boxCount}`
        );
        check("K: die APERTUR ist körperlich FREI (5 Probe-Punkte, Torso-Höhe)", out.k.aperturFrei === true);
        check("K: die PFOSTEN sind solide (beidseitig)", out.k.pfostenSolide === true);
        check("K: die KRONE über dem Scheitel ist solide", out.k.kroneSolide === true);
    } else check("K: Kollisions-Block erreicht", false);
    if (out.m) {
        check("M: der Membran-Tick baut das Passage-Mesh (Registry je entry.id)", out.m.built === true);
        check("M: die Membran hängt in der Szene", out.m.inScene === true);
        check("M: die Uniforms atmen (time folgt dem Tick)", out.m.atmet === true);
        check("M: Material trägt den portalMembran-Marker (oder fail-LAUT-Fallback)", out.m.marker === true);
        check("M: der ECHTE TSL-Gesetz-Graph baute (kein Fallback noetig)", out.m.echt === true);
    } else check("M: Membran-Block erreicht", false);
    if (out.f) {
        check(
            `F: Flügel-Meshes durch die Pipe gefunden (${out.f.anzahl})`,
            out.f.fluegelGefunden === true,
            `anzahl=${out.f.anzahl}`
        );
        check(`F: die Flügel ÖFFNEN sich dem Reisenden (Winkel ${out.f.winkel})`, out.f.geoeffnet === true);
    } else check("F: Flügel-Block erreicht", false);
    if (out.w) {
        check("W: Hindurchgehen durch die Apertur feuert enterPortal (genau 1×)", out.w.feuert === true);
        check("W: kein Doppelfeuer im selben Pass (Rueck-Kreuzen in der Zone stumm)", out.w.keinDoppel === true);
        check("W: nach Verlassen der Zone feuert der naechste Durchgang wieder", out.w.rearmWand === true);
        check("W: seitlich am Pfosten vorbei feuert NICHT", out.w.seitlichStumm === true);
    } else check("W: Hindurchgeh-Block erreicht", false);
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — das Welt-Portal ist VOLL integriert: die Kollision folgt der sichtbaren Studio-Form (Öffnung frei, Rahmen solide), die Passage-Membran baut + atmet aus dem EINEN Gesetz, und Hindurchgehen IST Betreten."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
