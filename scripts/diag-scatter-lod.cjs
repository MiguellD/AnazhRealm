// diag-scatter-lod.cjs — V18.464 DER FERNWALD FOLGT DER LIVE-DISTANZ (baum-D1/D2).
// Beweist im echten Boot (foundry-ON, Null-Renderer), dass die Scatter-Stufen
// NICHT mehr auf der Bau-Zeit-Distanz eingefroren sind:
//
//   L (LOD-Tick): nach einem Spieler-Sprung wandern die Zellen-Stufen — eine
//     vormals nahe Zelle (lod 0/1) wird nach dem Weg-Sprung per _tickScatterLod
//     auf die Fernstufe re-alloziert (cell.lod folgt, Slots getauscht, Bilanz
//     dicht: alte Slots frei, neue leben).
//   H (Hysterese): ein zweiter Tick OHNE Bewegung realloziert NICHTS mehr
//     (der Chooser ist zustands-stabil — kein Flacker-Churn).
//   P (Promotion über Region-Grenzen): der Promotions-Kreis (promoteM) liest
//     jetzt ALLE geschnittenen Regionen — der 2×2-Fächer um den Spieler wird
//     abgedeckt (Quell-Probe: der Block walkt rx0..rx1/rz0..rz1, nicht nur
//     die Home-Region).
//
//   node scripts/diag-scatter-lod.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SCATTER_LOD_PORT || 4441);
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
    // ── P: die Quell-Probe (der Promotions-Block walkt den Region-Fächer) ──
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const promoIdx = src.indexOf("baum-D2-Heilung");
    const promoBlock = promoIdx >= 0 ? src.slice(promoIdx, promoIdx + 1800) : "";
    check(
        "P: der Promotions-Block walkt ALLE geschnittenen Regionen (rx0..rx1 × rz0..rz1)",
        /rx0/.test(promoBlock) && /rz1/.test(promoBlock) && /_promoteScatterCell/.test(promoBlock)
    );

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
        const res = { boot: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._tickScatterLod !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 60000;
        while (performance.now() < dl1) {
            if (f && f.ready) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        // Scatter-Regionen um den Spieler bauen lassen (der Streaming-Tick baut 1/Frame).
        const pm = r.state.playerMesh.position;
        const dl2 = performance.now() + 45000;
        let cells = 0;
        while (performance.now() < dl2) {
            r._tickScatterStreaming(pm);
            const map = r.state.scatterRegions;
            cells = 0;
            if (map) for (const reg of map.values()) cells += reg.cells ? reg.cells.length : 0;
            if (cells > 40) break;
            await new Promise((r2) => setTimeout(r2, 30));
        }
        res.cells = cells;
        if (!cells) return res;
        // Eine lebende Zelle suchen (Schicht-agnostisch — der Tick trägt alle
        // Schichten; im Null-Renderer deferrieren Baum-Fernstufen [kein RTT] →
        // meist proben wir eine Grammatik-Schicht, derselbe Chokepoint).
        const map = r.state.scatterRegions;
        let probe = null;
        for (const c0 of [(c) => c.lod < 2, () => true]) {
            for (const reg of map.values()) {
                for (const c of reg.cells || []) {
                    if (c.slots && c.bpName && c0(c)) {
                        probe = c;
                        break;
                    }
                }
                if (probe) break;
            }
            if (probe) break;
        }
        res.probeGefunden = !!probe;
        if (!probe) return res;
        const lodVorher = probe.lod;
        const bpVorher = probe.bpName;
        const slotsVorher = JSON.stringify(probe.slots);
        // ── L: der Spieler springt — nahe Zelle: WEIT weg (Stufe steigt);
        //       ferne Zelle: NAH heran (Stufe sinkt, Ziel ~innerM+8) ──
        const dx = probe.x - pm.x;
        const dz = probe.z - pm.z;
        const d0 = Math.hypot(dx, dz);
        const naeher = lodVorher >= 2;
        const ziel = naeher ? 30 : 340;
        pm.x = probe.x - (dx / (d0 || 1)) * ziel;
        pm.z = probe.z - (dz / (d0 || 1)) * ziel;
        let wandel = 0;
        for (let i = 0; i < 400 && !wandel; i++) {
            r._tickScatterLod(pm, 8, 400);
            if (probe.lod !== lodVorher) wandel = 1;
        }
        res.l = {
            lodVorher,
            lodNachher: probe.lod,
            gewandert: wandel === 1 && (naeher ? probe.lod < lodVorher : probe.lod > lodVorher),
            // Stufen-GEKLEMMTE Arten (bpName über die Stufen identisch) tauschen
            // BEWUSST keine Slots (Review-Fix B2 — kein Churn); nur ein echter
            // Gestalt-Wechsel (bpName anders) muss die Slots re-allozieren.
            bpGewechselt: probe.bpName !== bpVorher,
            slotsGetauscht: JSON.stringify(probe.slots) !== slotsVorher,
            slotsLeben: Array.isArray(probe.slots) && probe.slots.length > 0,
        };
        // ── H: erst die Sprung-Adaption DRÄNIEREN (alle Zellen wandern auf die
        //       neue Distanz), dann: ohne Bewegung realloziert der Tick NICHTS
        //       mehr (Hysterese stabil, kein Flacker-Churn) ──
        let leer = 0;
        for (let i = 0; i < 600 && leer < 3; i++) {
            leer = r._tickScatterLod(pm, 16, 800) === 0 ? leer + 1 : 0;
        }
        let re = 0;
        for (let i = 0; i < 40; i++) re += r._tickScatterLod(pm, 16, 800);
        res.h = { nachlauf: re, drainiert: leer >= 3 };
        return res;
    });

    console.log("=== V18.464 SCATTER-LOD — der Fernwald folgt der LIVE-Distanz ===");
    check("Boot + Scatter-Zellen gebaut", out.boot && out.cells > 40, `zellen=${out.cells}`);
    check("Probe-Zelle gefunden", out.probeGefunden === true);
    if (out.l) {
        check(
            `L: die Stufe WANDERT nach dem Weg-Sprung (${out.l.lodVorher} → ${out.l.lodNachher})`,
            out.l.gewandert === true
        );
        check(
            "L: Slots re-alloziert bei Gestalt-Wechsel (bzw. bewusst behalten bei geklemmter Art)",
            out.l.slotsLeben && (out.l.bpGewechselt ? out.l.slotsGetauscht : !out.l.slotsGetauscht),
            `bpGewechselt=${out.l.bpGewechselt} getauscht=${out.l.slotsGetauscht}`
        );
    } else check("L: LOD-Block erreicht", false);
    if (out.h)
        check(
            "H: nach der Sprung-Adaption kein Realloc-Churn (Hysterese stabil)",
            out.h.drainiert === true && out.h.nachlauf === 0,
            `nachlauf=${out.h.nachlauf} drainiert=${out.h.drainiert}`
        );
    else check("H: Hysterese-Block erreicht", false);
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Scatter-Stufen folgen der LIVE-Distanz (Re-Allokation über den EINEN Zellen-Chokepoint, Hysterese churn-frei) und die Promotion liest den ganzen Region-Fächer."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
