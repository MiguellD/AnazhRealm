// preis.cjs <etikett> <argv.json> <baum> <port> <ausdir> — EIN frischer Boot, die Probe der Sprosse, dann der Richter-Preis
// (/puffer · /lauf 20 s ein 30 ruhe 45 · /puffer) und die Halde nach Halter. Schreibt <ausdir>/<etikett>.json
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const [etikett, argvDatei, baum, portS, aus] = process.argv.slice(2);
const P = Number(portS);
fs.mkdirSync(aus, { recursive: true });
const ruf = (weg, b, ms = 600000) =>
    new Promise((ok, nein) => {
        const q = http.request({ host: "127.0.0.1", port: P, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (a) => {
            let d = "";
            a.on("data", (c) => (d += c));
            a.on("end", () => {
                try {
                    ok(JSON.parse(d));
                } catch (e) {
                    nein(new Error(weg + ": " + d.slice(0, 200)));
                }
            });
        });
        q.setTimeout(ms, () => q.destroy(new Error(weg + " Frist")));
        q.on("error", nein);
        q.end(JSON.stringify(b || {}));
    });
const t0 = Date.now();
const log = (...a) => console.log("[" + ((Date.now() - t0) / 1000).toFixed(0) + " s] " + etikett, ...a);
(async () => {
    const S = P - 20000;
    const sv = spawn("node", ["save-server.js"], { cwd: baum, windowsHide: true, env: { ...process.env, PORT: String(S) } });
    let sout = "";
    sv.stdout.on("data", (c) => (sout += c));
    sv.stderr.on("data", (c) => (sout += c));
    process.on("exit", () => { try { sv.kill(); } catch {} });
    await new Promise((r) => setTimeout(r, 2500));
    const wb = spawn("node", ["scripts/werkbank.cjs", "start", "--echt", "--port", String(P), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: baum, windowsHide: true });
    let wout = "";
    wb.stdout.on("data", (c) => (wout += c));
    wb.stderr.on("data", (c) => (wout += c));
    const ende = () => {
        try {
            wb.kill();
        } catch {}
    };
    process.on("exit", ende);
    while (!/WERKBANK bereit/.test(wout)) {
        if (wb.exitCode != null) throw new Error("werkbank starb: " + wout.slice(-800));
        if (Date.now() - t0 > 400000) throw new Error("werkbank nicht bereit: " + wout.slice(-800));
        await new Promise((r) => setTimeout(r, 1000));
    }
    log("bereit");
    const o = { etikett, baum, boot_s: (Date.now() - t0) / 1000 };
    const p0 = await ruf("/puffer", { top: 1 });
    o.heap_boot = p0.heapMB;
    // die Probe
    const argv = JSON.parse(fs.readFileSync(argvDatei, "utf8")).map((x) => (x === "{AUS}" ? path.join(aus, etikett + ".probe.json") : typeof x === "string" ? x.split("{PORT}").join(String(S)).split("{SEK}").join("600").split("{BAUM}").join(baum) : x));
    // ein langer -e-Text sprengt die Befehlszeile (ENAMETOOLONG): er reist als Datei, argv wie unter -e
    if (argv[1] === "-e" && argv[2].length > 20000) {
        const d = path.join(aus, etikett + ".probe.cjs");
        fs.writeFileSync(d, "process.argv.splice(1, 1);\n" + argv[2]);
        argv.splice(1, 2, d);
    }
    const tp = Date.now();
    const pr = await new Promise((ok) => {
        const c = spawn(argv[0], argv.slice(1), { cwd: baum, windowsHide: true, env: { ...process.env, WERKBANK_PORT: String(P), PUNKTE_PROBE_DECKEL_S: "600" } });
        let s = "";
        c.stdout.on("data", (x) => (s += x));
        c.stderr.on("data", (x) => (s += x));
        const k = setTimeout(() => c.kill(), 900000);
        c.on("exit", (code) => {
            clearTimeout(k);
            ok({ code, s });
        });
    });
    o.probe_s = (Date.now() - tp) / 1000;
    o.probe_exit = pr.code;
    o.probe_tail = pr.s.split(/\r?\n/).filter(Boolean).slice(-6).map((l) => l.slice(0, 300));
    fs.writeFileSync(path.join(aus, etikett + ".probe.out"), pr.s);
    log("Probe", pr.code, o.probe_s + " s");
    const vor = await ruf("/puffer", { top: 1 });
    o.heap_nach_probe = vor.heapMB;
    const l = await ruf("/lauf", { sek: 20, ein: 30, ruhe: 45 });
    o.lauf = { p95: l.frameMs && l.frameMs.p95, bilder: l.frames, ruhe: l.ruhe, fehler: l.fehler };
    const p = await ruf("/puffer", { top: 200 });
    o.heap_preis = p.heapMB;
    o.vram = p.vram && p.vram.mb;
    const h = await ruf("/eval", { code: "return __heapHalter(r, 3).filter(([, b]) => b >= 1048576).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]).sort((a,b)=>b[1]-a[1]);" });
    o.typed = h.ergebnis;
    o.typed_mb = Array.isArray(h.ergebnis) ? +h.ergebnis.reduce((a, [, b]) => a + b, 0).toFixed(1) : null;
    const st = await ruf("/eval", { code: "const ri=r.state.renderer.info; let a=0,n=0; for(const [k,v] of ri.memoryMap){ if(v&&(v.type==='attributes'||v.type==='indexAttributes')){n++; a+=(k.array&&k.array.byteLength)||(k.data&&k.data.array&&k.data.array.byteLength)||0;} } let nb=0; try{ nb=r.state.renderer._nodes.nodeBuilderCache.size }catch(e){} return { attrN:n, attrCpuMB:+(a/1048576).toFixed(1), geometries: ri.memory.geometries, nodeBuilderCache: nb, dc: ri.render.drawCalls, tris: ri.render.triangles, pos: r.state.playerMesh.position.toArray().map(x=>+x.toFixed(1)) };" });
    o.renderer = st.ergebnis;
    log("Preis", o.heap_preis, "MB typed", o.typed_mb);
    if (process.env.PREIS_EXTRA) { const x = await ruf("/eval", { code: fs.readFileSync(process.env.PREIS_EXTRA, "utf8") }).catch((e) => ({ fehler: String(e.message) })); o.extra = x.ergebnis || x; }
    if (process.env.PREIS_OHNE_HALDE) { fs.writeFileSync(path.join(aus, etikett + ".json"), JSON.stringify(o, null, 1)); await ruf("/stop", {}).catch(() => {}); ende(); process.exit(0); }
    const hd = await ruf("/halde", { datei: path.join(aus, etikett + ".heapsnapshot"), tiefe: 3, top: 50, tief: ["r.state.renderer", "r._foundry"] }, 900000).catch((e) => ({ fehler: String(e.message) }));
    o.halde = hd;
    try {
        fs.unlinkSync(path.join(aus, etikett + ".heapsnapshot"));
    } catch {}
    fs.writeFileSync(path.join(aus, etikett + ".json"), JSON.stringify(o, null, 1));
    log("Halde", hd.gesamt_mb, "ab r", hd.ab_r_mb);
    await ruf("/stop", {}).catch(() => {});
    ende();
    process.exit(0);
})().catch((e) => {
    console.log("FEHLER " + etikett + " " + (e.stack || e));
    process.exit(1);
});
