// ankunft.cjs <baum> <aus-ordner> [sek] — die Ankunft OHNE Werkbank im echten Spiel-Pfad: save-server + Fenster am Hardware-Adapter,
// die Seite frisch geladen (kein Stand auf der Platte, kein Werkzeug in der Seite), 1×/s gelesen: worldMeta.genesisOrt.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { spawn, spawnSync } = require("child_process");
const [BAUM, AUS] = process.argv.slice(2, 4).map((p) => path.resolve(p));
const SEK = Number(process.argv[4] || 240), S = 7948;
fs.mkdirSync(AUS, { recursive: true });
const { startePuppeteer } = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const { echteWebGpuArgs } = require(path.join(BAUM, "scripts/lib/software-gpu.cjs"));
const t0 = Date.now();
const log = (s) => { const z = ((Date.now() - t0) / 1000).toFixed(1).padStart(6) + " s " + s; console.log(z); fs.appendFileSync(path.join(AUS, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const da = () => new Promise((r) => http.get("http://127.0.0.1:" + S + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
(async () => {
    let sv = null, browser = null;
    const erg = { baum: BAUM, kopf: spawnSync("git", ["-C", BAUM, "rev-parse", "--short=9", "HEAD"]).stdout.toString().trim(), zeit: new Date().toISOString(), proben: [] };
    try {
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "vor-" + f));
        const sl = fs.openSync(path.join(AUS, "save.log"), "w");
        sv = spawn(process.execPath, ["save-server.js"], { cwd: BAUM, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
        for (let i = 0; !(await da()); i++) { if (i > 60) throw new Error("save-server steht nicht"); await warte(1000); }
        browser = await startePuppeteer({ __rezept: "echt", headless: false, protocolTimeout: 600000, defaultViewport: { width: 1920, height: 1080 }, args: [...echteWebGpuArgs(), "--window-size=1940,1200"] });
        const page = (await browser.pages())[0] || (await browser.newPage());
        page.on("pageerror", (e) => log("pageerror " + String(e).slice(0, 200)));
        const tLade = Date.now();
        await page.goto("http://localhost:" + S + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
        log("Seite geladen");
        let stehtBei = null, weltBei = null;
        for (let i = 0; (Date.now() - tLade) / 1000 < SEK; i++) {
            const p = await page.evaluate(() => {
                const r = window.anazhRealm, st = r && r.state;
                if (!st) return { welt: false };
                const wm = st.worldMeta || {}, g = wm.genesisOrt || null, pm = st.playerMesh;
                let werke = null, absagen = null, wild = null;
                try { werke = (st.architecture || []).length; } catch (_e) { /* */ }
                try { const o = r._genesisVorschauStand ? r._genesisVorschauStand() : null; if (o) absagen = o; } catch (_e) { /* */ }
                return { welt: true, slug: wm.slug || null, g: g ? { key: g.key, x: g.x, z: g.z, steht: g.steht } : null, auto: window.__anazhAutoSettlement, weltbild: st._weltbildDa || 0, werke, absagen, wild,
                    pos: pm ? [Math.round(pm.position.x), Math.round(pm.position.y), Math.round(pm.position.z)] : null, schirm: document.querySelector("#loading, .loading, #ladeschirm") ? "lade" : null, sicht: document.visibilityState, takt: r._genesisOrtT === undefined ? null : Math.round(r._genesisOrtT) };
            }).catch((e) => ({ fehler: String(e).slice(0, 160) }));
            const t = +((Date.now() - tLade) / 1000).toFixed(1);
            erg.proben.push({ t, ...p });
            if (p.welt && weltBei === null) { weltBei = t; log("Welt da " + JSON.stringify(p)); }
            if (p.g && p.g.steht && stehtBei === null) { stehtBei = t; log("genesisOrt.steht TRUE " + JSON.stringify(p)); }
            if (i % 15 === 0) log("probe " + JSON.stringify(p));
            if (stehtBei !== null && t > stehtBei + 5) break;
            await warte(1000);
        }
        erg.weltBei = weltBei; erg.stehtBei = stehtBei;
        await page.screenshot({ path: path.join(AUS, "ende.png") }).catch(() => {});
        log("URTEIL steht=" + (stehtBei !== null) + " nach " + stehtBei + " s (Welt da " + weltBei + " s)");
    } catch (e) {
        erg.fehler = String((e && e.stack) || e);
        log("FEHLER " + erg.fehler.slice(0, 600));
    } finally {
        fs.writeFileSync(path.join(AUS, "ankunft.json"), JSON.stringify(erg, null, 1));
        if (browser) await browser.close().catch(() => {});
        if (sv && sv.pid) try { spawnSync("taskkill", ["/PID", String(sv.pid), "/T", "/F"], { windowsHide: true }); } catch (_e) { /* */ }
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "nach-" + f));
        log("ENDE");
        process.exit(erg.fehler ? 1 : 0);
    }
})();
