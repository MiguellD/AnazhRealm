// reib.cjs <baum> <aus-ordner> — die Reibellipse am GT (Genesis, Mittag) im Takt der Welt: Lenken · Handbremse im Bogen ·
// Handbremse geradeaus · S geradeaus · S im Bogen · Wasserschlag am Ufer-Hang. Rohes nach <aus>/reib.json.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { spawn, spawnSync } = require("child_process");
const [BAUM, AUS] = process.argv.slice(2).map((p) => path.resolve(p));
const S = 7947, W = 7957, SEITE = require("./seite.js");
fs.mkdirSync(AUS, { recursive: true });
const { werkbankRuf } = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const t0 = Date.now();
const log = (s) => { const z = ((Date.now() - t0) / 1000).toFixed(0).padStart(4) + " s " + s; console.log(z); fs.appendFileSync(path.join(AUS, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
const ruf = async (weg, o) => {
    let uhr = null;
    const a = await Promise.race([werkbankRuf(W, weg, o), new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error(weg + " ohne Antwort nach 600 s")), 600000)))]).finally(() => clearTimeout(uhr));
    if (a && typeof a.fehler === "string") log(weg + " meldet: " + a.fehler.slice(0, 400));
    return a;
};
const ev = async (code) => { const a = await ruf("/eval", { code }); return a && a.ergebnis !== undefined ? a.ergebnis : a; };
(async () => {
    let sv = null, wk = null;
    const erg = { baum: BAUM, kopf: spawnSync("git", ["-C", BAUM, "rev-parse", "--short=9", "HEAD"]).stdout.toString().trim(), zeit: new Date().toISOString(), fahrten: {} };
    const sichern = () => fs.writeFileSync(path.join(AUS, "reib.json"), JSON.stringify(erg, null, 1));
    try {
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "vor-" + f));
        const sl = fs.openSync(path.join(AUS, "save.log"), "w");
        sv = spawn(process.execPath, ["save-server.js"], { cwd: BAUM, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
        for (let i = 0; !(await da(S)); i++) { if (i > 60) throw new Error("save-server steht nicht"); await warte(1000); }
        const wl = path.join(AUS, "werkbank.log"), wf = fs.openSync(wl, "w");
        wk = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "genesis"], { cwd: BAUM, env: { ...process.env, WERKBANK_FENSTER: "1920x1080" }, stdio: ["ignore", wf, wf], windowsHide: true });
        for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++) {
            if (i > 600 || /FEHLER/.test(fs.readFileSync(wl, "utf8"))) throw new Error("Werkbank nicht bereit: " + fs.readFileSync(wl, "utf8").slice(-400));
            await warte(1000);
        }
        log("bereit " + erg.kopf);
        erg.vor = await ev(SEITE.vor);
        log("vor " + JSON.stringify(erg.vor).slice(0, 900));
        const st = erg.vor && erg.vor.strecke;
        if (!st) throw new Error("keine Strecke");
        const F = Math.PI / 2, ort = [st.x, st.z];
        const L = [
            ["lenken", { links: true }, 2, false],
            ["hand-bogen", { links: true, sprint: true }, 2.5, false],
            ["hand-bogen-gas", { vor: true, links: true, sprint: true }, 2.5, false],
            ["hand-gerade", { sprint: true }, 6, true],
            ["s-gerade", { zurueck: true }, 6, true],
            ["s-bogen", { zurueck: true, links: true }, 2.5, false],
            ["rollen", {}, 3, false],
        ];
        if (process.env.REIB_NUR === "wasser") {
            L.length = 0;
            erg.ufer2 = await ev(SEITE.ufer2);
            log("ufer2 " + JSON.stringify(erg.ufer2).slice(0, 900));
            const u2 = erg.ufer2 && erg.ufer2.ufer && erg.ufer2.ufer[0];
            if (u2) {
                const ob = [u2.x - 14 * Math.sin(u2.bergab), u2.z - 14 * Math.cos(u2.bergab)];
                for (const [name, o] of [
                    ["ws-steht", { ort: [u2.x, u2.z], v: 0, tasten: {}, sek: 6, ruhe: 2 }],
                    ["ws-gas", { ort: [u2.x, u2.z], v: 0, tasten: { vor: true }, sek: 6, ruhe: 2 }],
                    ["ws-rollt-ein", { ort: ob, v: 6, tasten: {}, sek: 8, ruhe: 2 }],
                    ["ws-faehrt-ein", { ort: ob, v: 6, tasten: { vor: true }, sek: 8, ruhe: 2 }],
                ]) {
                    erg.fahrten[name] = await ev(SEITE.fahrt({ name, fahrt: u2.bergab, ...o }));
                    log(name + " " + JSON.stringify(erg.fahrten[name]).slice(0, 600));
                    sichern();
                }
            }
            erg.vor.ufer = null;
        }
        for (const [name, tasten, sek, stoppBei] of L) {
            erg.fahrten[name] = await ev(SEITE.fahrt({ name, ort, fahrt: F, v: 15, tasten, sek, stoppBei }));
            log(name + " " + JSON.stringify(erg.fahrten[name]).slice(0, 1400));
            sichern();
        }
        const u = erg.vor.ufer;
        if (u) {
            for (const [name, tasten] of [["wasser", {}], ["wasser-gas", { vor: true }]]) {
                erg.fahrten[name] = await ev(SEITE.fahrt({ name, ort: [u.x, u.z], fahrt: u.bergab, v: 0, tasten, sek: 6, ruhe: 2 }));
                log(name + " " + JSON.stringify(erg.fahrten[name]).slice(0, 1400));
                sichern();
            }
        } else log("kein Ufer am Hang gefunden — Wasserschlag nicht gefahren");
    } catch (e) {
        erg.fehler = String((e && e.stack) || e);
        log("FEHLER " + erg.fehler.slice(0, 600));
    } finally {
        sichern();
        try { spawnSync(process.execPath, ["scripts/werkbank.cjs", "stop"], { cwd: BAUM, timeout: 30000, env: { ...process.env, WERKBANK_PORT: String(W) } }); } catch (_e) { /* */ }
        await warte(1500);
        for (const p of [wk, sv]) if (p && p.pid) try { spawnSync("taskkill", ["/PID", String(p.pid), "/T", "/F"], { windowsHide: true }); } catch (_e) { /* */ }
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "nach-" + f));
        log("ENDE");
        process.exit(erg.fehler ? 1 : 0);
    }
})();
