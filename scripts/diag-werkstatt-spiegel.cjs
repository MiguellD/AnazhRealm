// diag-werkstatt-spiegel.cjs — Ω-PHYSIS Säule IV (wahrerbauplan §7): DER WAHRHEITS-
// SPIEGEL. DIE ZWEI SEELEN VEREINT — die in Säule I gerechnete Physik (das SEIN) wird
// Ω-W2 physik-wahre Optimierung + Ω-W3 sichtbares Bau-Feedback (der ANBLICK). Reine
// Berechnung + CONSUM-Source-Probe → headless VOLL verifizierbar (kein GPU-Flake; der
// finale LOOK des Wankens ist augen-bound, Wand 1).
//   node scripts/diag-werkstatt-spiegel.cjs
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
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.materials) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm,
                C = r.constructor;
            const mats = r.state.materials || {};
            let dense = mats.eisen ? "eisen" : null,
                light = mats.holz ? "holz" : null;
            if (!dense || !light) {
                let dd = -1,
                    ld = 2;
                for (const m in mats) {
                    const d = mats[m] && mats[m].tags && mats[m].tags.dichte;
                    if (typeof d !== "number") continue;
                    if (d > dd) ((dd = d), (dense = m));
                    if (d < ld) ((ld = d), (light = m));
                }
            }
            const pt = (x, y, z, sx, sy, sz, m) => ({
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
                material: m || dense,
            });
            const P = (parts, role) => ({ parts, role, roleManual: !!role });
            const r3 = (x) => Math.round(x * 1e3) / 1e3;
            const o = { dense, light };

            // ── Ω-W2: physik-wahre Optimierungs-Verben + die VERSPRECHEN-WAHRHEIT ──
            const hints = C.AXIS_ACTION_HINTS || {};
            o.w2HintStability = typeof hints.stability === "string" && /Basis|Standfläche/.test(hints.stability);
            o.w2HintLoad = typeof hints.loadSound === "string" && /Lastpfad/.test(hints.loadSound);
            o.w2HintRollable = typeof hints.rollable === "string" && /Räder|Achse/.test(hints.rollable);
            // BEWEIS: die Tat „verbreitere die Basis" verschiebt die GERECHNETE Größe messbar
            // in die versprochene Richtung — eine breite Basis liest stabiler als eine schmale.
            const narrowBase = P([pt(0, 0, 0, 1, 0.5, 1), pt(0, 2, 0, 2, 2, 2)], "architecture");
            const wideBase = P([pt(0, 0, 0, 4, 0.5, 4), pt(0, 2, 0, 2, 2, 2)], "architecture");
            o.narrowMargin = r3(r._stability(narrowBase).margin);
            o.wideMargin = r3(r._stability(wideBase).margin);
            o.w2PromiseTrue = o.wideMargin > o.narrowMargin;

            // ── Ω-Φ5: _loadPath legt die schwebenden Teil-Indizes offen (EINE Quelle) ──
            const floatTower = P([pt(0, 0, 0, 1, 1, 1), pt(0, 1, 0, 1, 1, 1), pt(0, 5, 0, 1, 1, 1)], "architecture");
            const lp = r._loadPath(floatTower);
            o.loadPathFloatingParts = Array.isArray(lp.floatingParts) ? lp.floatingParts.slice() : null;
            o.floatExposesIndex = Array.isArray(lp.floatingParts) && lp.floatingParts.includes(2);

            // ── Ω-W3: das Verdikt — kippt/wackelig/steht/schwebt/knickt/kopflastig ──
            o.verdictExists = typeof r._workshopPhysicsVerdict === "function";
            const lineHas = (v, re) => v.lines.some((l) => re.test(l.text));
            // (a) ein STEHENDES, verbundenes, aber kippliges Bauwerk → wankt sichtbar
            const leaner = P([pt(0, 0, 0, 1, 1, 1), pt(0, 1, 0, 1, 1, 1), pt(1.5, 2, 0, 3, 1, 3)], "architecture");
            const vLean = r._workshopPhysicsVerdict(leaner);
            o.leanHigh = vLean.lean > 0.5;
            o.leanTips = lineHas(vLean, /kippt|wackelig/);
            o.leanNotFloating = vLean.floatingParts.length === 0; // verbunden → kein Schwebe-Confound
            o.leanDirSet = Math.abs(vLean.leanDir.x) + Math.abs(vLean.leanDir.z) > 0.1;
            // (b) ein schwebendes Teil → markiert + Lastpfad-Warnung
            const vFloat = r._workshopPhysicsVerdict(floatTower);
            o.floatFlagged = vFloat.floatingParts.length > 0 && lineHas(vFloat, /schwebend|Lastpfad/);
            // (c) eine zu schlanke Säule → knickt
            const slender = P([pt(0, 0, 0, 0.2, 5, 0.2)], "architecture");
            const vSlender = r._workshopPhysicsVerdict(slender);
            o.slenderBuckles = vSlender.buckles === true && lineHas(vSlender, /schlank|knickt/);
            // (d) ein STABILES, verbundenes Bauwerk → ruht (lean 0, „steht", keine Warnung)
            const stableTable = P(
                [
                    pt(-2, 0, -2, 0.4, 1.6, 0.4),
                    pt(2, 0, -2, 0.4, 1.6, 0.4),
                    pt(-2, 0, 2, 0.4, 1.6, 0.4),
                    pt(2, 0, 2, 0.4, 1.6, 0.4),
                    pt(0, 0.9, 0, 4, 0.3, 4, light),
                ],
                "architecture"
            );
            const vStable = r._workshopPhysicsVerdict(stableTable);
            o.stableRests = vStable.lean === 0 && vStable.floatingParts.length === 0;
            o.stableSaysSteht = lineHas(vStable, /steht/) && !lineHas(vStable, /kippt|wackelig/);
            // (e) ROLLEN-bewusst: ein kopflastiges, GEHALTENES Werk → träger Schwung (nicht „kippt")
            const headHeavy = P([pt(0, 0.5, 0, 0.3, 1, 0.3, light), pt(0, 3, 0, 0.4, 4, 0.4, dense)], "weapon");
            const vWeapon = r._workshopPhysicsVerdict(headHeavy);
            o.weaponSwingDrag = r3(vWeapon.swingDrag);
            o.weaponHeadHeavy = vWeapon.swingDrag > 0.5 && lineHas(vWeapon, /kopflastig/);
            o.weaponNotTipped = !lineHas(vWeapon, /kippt|wackelig/); // eine Waffe „kippt" nicht
            o.weaponNoLean = vWeapon.lean === 0;

            // ── Ω-W3 CONSUM (Source-Probe, kein GPU): die Vorschau LIEST das Verdikt ──
            o.consumRebuildCaches = /_workshopPhysicsVerdict/.test(r._workshopRebuildPreviewMesh.toString());
            o.consumTickLeans =
                /physicsVerdict/.test(r._workshopStartRAF.toString()) &&
                /rotation/.test(r._workshopStartRAF.toString());
            o.consumRenderMarks = /floatingParts/.test(r._workshopRender.toString());
            return o;
        });
        const ok = (b) => (b ? "  OK  " : " FAIL ");
        const line = (label, val, expect, pass) =>
            console.log(ok(pass) + label.padEnd(50) + String(val).padStart(10) + "   " + expect);
        console.log("\n=== Ω-PHYSIS Säule IV — DER WAHRHEITS-SPIEGEL (die zwei Seelen vereint) ===");
        console.log("Materialien: dense=" + out.dense + " light=" + out.light + "\n");
        console.log("— Ω-W2: Optimierung an ECHTEN Größen —");
        line("Ω-W2 physik-wahres Verb (Standfestigkeit)", out.w2HintStability, "soll true", out.w2HintStability);
        line("Ω-W2 physik-wahres Verb (Lastpfad)", out.w2HintLoad, "soll true", out.w2HintLoad);
        line("Ω-W2 physik-wahres Verb (Rollfähigkeit)", out.w2HintRollable, "soll true", out.w2HintRollable);
        line(
            "Ω-W2 die Tat verschiebt die Größe (Basis breit)",
            out.narrowMargin + "→" + out.wideMargin,
            "wide > narrow",
            out.w2PromiseTrue
        );
        console.log("\n— Ω-Φ5: der Lastpfad legt die schwebenden Teile offen —");
        line(
            "Ω-Φ5 floatingParts-Index offengelegt",
            JSON.stringify(out.loadPathFloatingParts),
            "enthält 2",
            out.floatExposesIndex
        );
        console.log("\n— Ω-W3: das gerechnete Bau-Verdikt (rollen-bewusst) —");
        line("Ω-W3 Verdikt-Funktion existiert", out.verdictExists, "soll true", out.verdictExists);
        line("Ω-W3 (a) kippliges Bauwerk → wankt (lean>0.5)", out.leanHigh, "soll true", out.leanHigh);
        line(
            "Ω-W3 (a) Wort kippt/wackelig + Kipp-Richtung",
            out.leanTips + "/" + out.leanDirSet,
            "true/true",
            out.leanTips && out.leanDirSet && out.leanNotFloating
        );
        line("Ω-W3 (b) schwebendes Teil markiert + Warnung", out.floatFlagged, "soll true", out.floatFlagged);
        line("Ω-W3 (c) zu schlank → knickt", out.slenderBuckles, "soll true", out.slenderBuckles);
        line(
            "Ω-W3 (d) stabiles Bauwerk ruht (lean 0)",
            out.stableRests + "/" + out.stableSaysSteht,
            "true/true",
            out.stableRests && out.stableSaysSteht
        );
        line(
            "Ω-W3 (e) kopflastige WAFFE → träge (nicht kippt)",
            out.weaponSwingDrag + "/" + out.weaponHeadHeavy,
            "drag>0.5",
            out.weaponHeadHeavy && out.weaponNotTipped && out.weaponNoLean
        );
        console.log("\n— Ω-W3 CONSUM (kein Passagier): die Vorschau LIEST das Verdikt —");
        line("CONSUM Rebuild cacht das Verdikt", out.consumRebuildCaches, "soll true", out.consumRebuildCaches);
        line("CONSUM RAF-Tick wankt (liest lean → rotation)", out.consumTickLeans, "soll true", out.consumTickLeans);
        line("CONSUM Render markiert (liest floatingParts)", out.consumRenderMarks, "soll true", out.consumRenderMarks);
        const all = [
            out.w2HintStability,
            out.w2HintLoad,
            out.w2HintRollable,
            out.w2PromiseTrue,
            out.floatExposesIndex,
            out.verdictExists,
            out.leanHigh,
            out.leanTips,
            out.leanDirSet,
            out.leanNotFloating,
            out.floatFlagged,
            out.slenderBuckles,
            out.stableRests,
            out.stableSaysSteht,
            out.weaponHeadHeavy,
            out.weaponNotTipped,
            out.weaponNoLean,
            out.consumRebuildCaches,
            out.consumTickLeans,
            out.consumRenderMarks,
        ];
        const failed = all.filter((b) => !b).length;
        console.log(
            "\n" + (failed === 0 ? "✓ ALLE GRÜN — die zwei Seelen vereint (SEIN → ANBLICK)." : `✗ ${failed} FAIL`)
        );
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
