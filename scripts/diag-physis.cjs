// diag-physis.cjs — Ω-PHYSIS Säule I (wahrerbauplan §4): der Schiedsrichter gegen
// die Handrechnung. Reine Berechnung → headless VOLL verifizierbar (kein Flake).
// Prüft Ω-Φ2 Stabilität · Ω-Φ3 Steifigkeit+Knicken · Ω-Φ4 Schwung · Ω-Φ5 Lastpfad.
//   node scripts/diag-physis.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 10000;
            while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.materials) && performance.now() < deadline)
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const mats = r.state.materials || {};
            // dichtes + leichtes Material wählen
            let dense = "eisen",
                light = "holz";
            if (!mats[dense]) {
                let dd = -1;
                for (const m in mats) {
                    const d = mats[m] && mats[m].tags && mats[m].tags.dichte;
                    if (typeof d === "number" && d > dd) ((dd = d), (dense = m));
                }
            }
            if (!mats[light]) {
                let ld = 2;
                for (const m in mats) {
                    const d = mats[m] && mats[m].tags && mats[m].tags.dichte;
                    if (typeof d === "number" && d < ld) ((ld = d), (light = m));
                }
            }
            const P = (parts) => ({ parts });
            const part = (x, y, z, sx, sy, sz, m) => ({ position: { x, y, z }, size: { x: sx, y: sy, z: sz }, material: m || dense });
            const r3 = (x) => Math.round(x * 1e3) / 1e3;
            const o = { dense, light };

            // ── Ω-Φ2 STABILITÄT ──
            // (a) breite 4-Bein-Basis, symmetrisch → margin hoch
            const table = P([
                part(-2, 0, -2, 0.4, 1, 0.4),
                part(2, 0, -2, 0.4, 1, 0.4),
                part(-2, 0, 2, 0.4, 1, 0.4),
                part(2, 0, 2, 0.4, 1, 0.4),
                part(0, 1, 0, 4, 0.3, 4, light),
            ]);
            o.tableStab = r3(r._stability(table).margin);
            // (b) Last weit außerhalb der Basis → CoM kippt aus dem Polygon → margin 0
            const tippy = P([part(0, 0, 0, 1, 1, 1), part(6, 4, 0, 2, 2, 2, dense)]);
            const tp = r._stability(tippy);
            o.tippyStab = r3(tp.margin);
            o.tippyInside = tp.inside;
            // (c) einbeiniger Mast → entartete Basis → margin 0
            o.mastStab = r3(r._stability(P([part(0, 0, 0, 0.3, 6, 0.3)])).margin);

            // ── Ω-Φ3a STEIFIGKEIT (Anisotropie + hohl vs voll) ──
            const board = P([part(0, 0, 0, 6, 0.3, 0.6)]); // breit in x, dünn in z
            const bs = r._bendingStiffness(board);
            o.boardAniso = r3(bs.anisotropy); // >> 1 (steif um eine Achse, weich um die andere)
            // hohler Ring (4 Ecken, leer in der Mitte) vs Vollblock gleicher Außenmaße
            const ring = P([part(-1.5, 0, -1.5, 1, 1, 1), part(1.5, 0, -1.5, 1, 1, 1), part(-1.5, 0, 1.5, 1, 1, 1), part(1.5, 0, 1.5, 1, 1, 1)]);
            const solid = P([part(0, 0, 0, 4, 1, 4)]);
            const ri = r._bendingStiffness(ring),
                so = r._bendingStiffness(solid);
            const massOf = (bp) => r._compoundCenterOfMass(bp).mass;
            o.ringSpecific = r3(ri.Imin / Math.max(1e-6, massOf(ring)));
            o.solidSpecific = r3(so.Imin / Math.max(1e-6, massOf(solid)));

            // ── Ω-Φ3b KNICKEN ──
            o.slenderBuckles = r._failsUnderLoad(P([part(0, 0, 0, 0.2, 5, 0.2)])).buckles; // 1:25 → knickt
            o.stockyBuckles = r._failsUnderLoad(P([part(0, 0, 0, 1, 5, 1)])).buckles; // 1:5 → trägt

            // ── Ω-Φ4 SCHWUNG ──
            // kopflastiges Schwert (leichter Griff unten, schwerer Kopf oben)
            const headHeavy = P([part(0, 0.3, 0, 0.2, 0.6, 0.2, light), part(0, 3, 0, 0.4, 4, 0.4, dense)]);
            // griffnah balanciert (schwerer Knauf unten)
            const balanced = P([part(0, 0.3, 0, 0.5, 0.6, 0.5, dense), part(0, 3, 0, 0.2, 4, 0.2, light)]);
            const sh = r._swingDynamics(headHeavy),
                sb = r._swingDynamics(balanced);
            o.headHeavyBalance = r3(sh.balance);
            o.balancedBalance = r3(sb.balance);
            o.headHeavySpeed = r3(sh.swingSpeed);
            o.balancedSpeed = r3(sb.swingSpeed);

            // ── Ω-Φ5 LASTPFAD + SCHNEIDE ──
            const stack = P([part(0, 0, 0, 1, 1, 1), part(0, 1, 0, 1, 1, 1), part(0, 2, 0, 1, 1, 1)]);
            const floatTower = P([part(0, 0, 0, 1, 1, 1), part(0, 1, 0, 1, 1, 1), part(0, 5, 0, 1, 1, 1)]); // oberstes schwebt
            o.stackIntact = r._loadPath(stack).intact;
            const ft = r._loadPath(floatTower);
            o.floatIntact = ft.intact;
            o.floatFrac = r3(ft.floatingFrac);
            // Schneide: durchgehend vs Lücke (entlang x)
            const blade = P([part(0, 0, 0, 1, 0.3, 0.1), part(1, 0, 0, 1, 0.3, 0.1), part(2, 0, 0, 1, 0.3, 0.1)]);
            const gapped = P([part(0, 0, 0, 1, 0.3, 0.1), part(3, 0, 0, 1, 0.3, 0.1)]); // Lücke
            o.bladeEdge = r3(r._edgeContinuity(blade));
            o.gappedEdge = r3(r._edgeContinuity(gapped));
            return o;
        });
        console.log("\n=== Ω-PHYSIS Säule I — der Schiedsrichter (gegen Handrechnung) ===");
        console.log("Materialien: dense=" + out.dense + " light=" + out.light + "\n");
        const line = (label, val, expect, ok) => console.log((ok ? "  OK  " : " FAIL ") + label.padEnd(46) + String(val).padStart(8) + "   " + expect);
        line("Ω-Φ2 breite Basis margin", out.tableStab, "soll hoch (>0.5)", out.tableStab > 0.5);
        line("Ω-Φ2 Last außerhalb → kippt", out.tippyStab + "/in=" + out.tippyInside, "soll 0 + inside=false", out.tippyStab === 0 && out.tippyInside === false);
        line("Ω-Φ2 einbeiniger Mast margin", out.mastStab, "soll ~0 (<0.15)", out.mastStab < 0.15);
        line("Ω-Φ3a Brett Anisotropie", out.boardAniso, "soll >> 1", out.boardAniso > 3);
        line("Ω-Φ3a hohl I/Masse", out.ringSpecific, "> voll I/Masse", out.ringSpecific > out.solidSpecific);
        line("Ω-Φ3a voll I/Masse", out.solidSpecific, "(Vergleich)", true);
        line("Ω-Φ3b schlank 1:25 knickt", out.slenderBuckles, "soll true", out.slenderBuckles === true);
        line("Ω-Φ3b stämmig 1:5 trägt", out.stockyBuckles, "soll false", out.stockyBuckles === false);
        line("Ω-Φ4 kopflastig Balance", out.headHeavyBalance, "> balanciert", out.headHeavyBalance > out.balancedBalance);
        line("Ω-Φ4 balanciert Balance", out.balancedBalance, "(Vergleich)", true);
        line("Ω-Φ4 balanciert schneller", out.balancedSpeed, "> kopflastig", out.balancedSpeed > out.headHeavySpeed);
        line("Ω-Φ5 verbundener Stapel intakt", out.stackIntact, "soll true", out.stackIntact === true);
        line("Ω-Φ5 schwebendes Teil → Bruch", out.floatIntact + "/frac=" + out.floatFrac, "intact=false", out.floatIntact === false && out.floatFrac > 0);
        line("Ω-Φ5 durchgehende Schneide", out.bladeEdge, "soll 1", out.bladeEdge === 1);
        line("Ω-Φ5 Schneide mit Lücke", out.gappedEdge, "soll < 1", out.gappedEdge < 1);
    } finally {
        await browser.close();
        server.kill();
    }
})();
