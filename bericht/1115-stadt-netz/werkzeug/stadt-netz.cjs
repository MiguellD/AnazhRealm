// stadt-netz.cjs <baum> <aus-ordner> <modus> — die Abnahme IM SPIEL der Stadt als Netz (w28-stadt-netz): echte GPU, Werkbank, die Welt
// ab dem Boot in 1920 × 1080 (WERKBANK_FENSTER), der Spieler am Anlauf von stadt-voll, das Wort NETZ_WORT (Vorgabe „dorf 7 4750“ =
// 5 × 5 Kacheln) am Anker von stadt-voll gegründet. Modus:
//   gang   der Spieler geht (NETZ_V m/s, Vorgabe 4) von der Mitte EINE Hauptstraße nach Osten über drei Kacheln: je Bild sein
//          Abstand (rAF), Anteil > 33 ms, größtes Bild; je Kachel voraus die Zeiten (bereitet · Vorrat · erwacht · erstes Haus ·
//          Zug-Ende) mit dem Abstand des Spielers zu ihrer West-Kante
//   stand  3 × 3 Kacheln erwacht (der Spieler wartet in der Mitte), dann `/lauf` stehend: Bild p95, Befehle, Dreiecke, Heap, VRAM
//   bild   die vier Bilder: an der Kante auf der Hauptstraße · aus 90 m Höhe · die Kamera des Vorher-Bilds (476,5 / 140,7 / 446,1
//          → −133,3 / 69,9 / 456,8) · am Boden die Hauptstraße entlang über zwei Kanten; je Bild r._schirm() und r._laubRand()
// Alles Rohe nach <aus>/netz.json und lauf.log.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const { spawn, spawnSync } = require("child_process");
const [baumArg, ausArg, MODUS = "gang"] = process.argv.slice(2);
const BAUM = path.resolve(baumArg), AUS = path.resolve(ausArg), WORT = (process.env.NETZ_WORT || "dorf 7 4750").split(" ");
const [SAMEN, NH] = [Number(WORT[1]), Number(WORT[2])], V = Number(process.env.NETZ_V) || 4;
const ANLAUF = [400, 400], ANKER = [836.0867207453832, 438.24283067541955];
const S = 7946, W = 7956;
fs.mkdirSync(AUS, { recursive: true });
const { werkbankRuf } = require(path.join(BAUM, "scripts/lib/welt-boot.cjs"));
const t0 = Date.now();
const log = (s) => { const z = ((Date.now() - t0) / 1000).toFixed(0).padStart(4) + " s " + s; console.log(z); fs.appendFileSync(path.join(AUS, "lauf.log"), z + "\n"); };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false)));
const erg = { baum: BAUM, wort: WORT.join(" "), modus: MODUS, zeit: new Date().toISOString() };
const schreib = () => fs.writeFileSync(path.join(AUS, "netz.json"), JSON.stringify(erg, null, 1));
const ruf = async (weg, o) => {
    let uhr = null;
    const a = await Promise.race([werkbankRuf(W, weg, o), new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error(weg + " ohne Antwort nach 1500 s")), 1500000)))]).finally(() => clearTimeout(uhr));
    if (a && typeof a.fehler === "string") log(weg + " meldet: " + a.fehler.slice(0, 300));
    return a;
};
const ev = async (code) => { const a = await ruf("/eval", { code }); return a && a.ergebnis !== undefined ? a.ergebnis : a; };
const teil = (dts, T, von, bis) => {
    const d = dts.filter((_, i) => T[i] >= von && T[i] < bis), s = d.slice().sort((a, b) => a - b), n = s.length;
    if (!n) return null;
    const ue = d.filter((x) => x > 33).length;
    return { bilder: n, p50: +s[n >> 1].toFixed(1), p95: +s[Math.min(n - 1, Math.floor(0.95 * n))].toFixed(1), max: +s[n - 1].toFixed(1), anteil33: +((100 * ue) / n).toFixed(2), ueber100: d.filter((x) => x > 100).length };
};
// IN DER SEITE: der Gang (wie stadt-gang.cjs) — die Lage des Spielers je Takt längs der Kette, je Bild der Abstand der rAF-Zeiten,
// je Ziel-Zelle die Zeiten ihres Wegs zur Welt (der Abstand des Spielers zur West-Kante der Kachel: x0)
const SEITE = `window.__gang = (kette, v, sek, ziele) => new Promise((fertig) => {
    const st = r.state, rend = st.renderer, dts = [], zf = [], zeiten = [], gesehen = {}, tA = performance.now();
    const laenge = kette.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - kette[i][0], q[1] - kette[i][1]), 0);
    let tl = null, tW = null, weg = 0;
    // DIE ZERLEGUNG JE BILD: jeder Gang durch das Tor (_bauer, beim Namen), das Pflicht-Stück, die Phasen des Loops — ihre ms im
    // Takt; folgt dem Takt ein Bild-Abstand > 33 ms, zählen sie zu ueber (wer trug die Bilder über der Schwelle)
    const fr = (window.__fr = { alle: {}, ueber: {}, n: 0, nUeber: 0, cpuAlle: 0, cpuUeber: 0, top: [] });
    let cur = {}, vorCur = null, vorCpu = 0;
    const mess = (n, name) => { const alt = r[n]; if (typeof alt !== "function") return; r[n] = function (...a) { const t0 = performance.now(), o = alt.apply(this, a), k = name ? name(a, o) : n; cur[k] = (cur[k] || 0) + performance.now() - t0; return o; }; };
    mess("_bauer", (a) => "bauer " + a[0]);
    mess("_bauPflichtGang", (_a, o) => "pflicht " + o);
    for (const n of "_loopFixedStep _loopVoxelStreaming _loopFrustumCulling _loopShadowUpdate _loopRender _loopWeatherAndGrowth _loopNexusUpdate _loopGroundCheck _tickFoundryIngest _dispatchFrameJobs _tickWegeKarte _wegeRaeumen _tickCanopyStreaming _tickWorldWaterCA _stauFelder tickArchitectureCulling _tickAutoSettlement _dorfBereiten _autoSettlementSpawnCell _ortWahl _dorfErwachen _foundryIngestSiedlung _autoSettlementCellInfo _dorfVorbacken _dorfWasserSchritt".split(" ")) mess(n);
    const buche = (dt) => { if (!vorCur) return; fr.n++; fr.cpuAlle += vorCpu; const ue = dt > 33; if (ue) { fr.nUeber++; fr.cpuUeber += vorCpu; }
        for (const k in vorCur) { fr.alle[k] = (fr.alle[k] || 0) + vorCur[k]; if (ue) fr.ueber[k] = (fr.ueber[k] || 0) + vorCur[k]; }
        if (dt > 100) fr.top.push({ dt: Math.round(dt), cpu: Math.round(vorCpu), wer: Object.entries(vorCur).filter(([, v]) => v > 4).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + " " + Math.round(v)) }); };
    const tick = (t) => {
        if (tl != null) { dts.push(t - tl); zf.push(r._autoSettlementQueue && r._autoSettlementQueue.plan ? 1 : 0); buche(t - tl); }
        cur = {};
        tl = t;
        weg = Math.min(laenge, (v * (t - (tW ??= t))) / 1000);
        let s = weg;
        for (let i = 1; i < kette.length; i++) {
            const [ax, az] = kette[i - 1], [bx, bz] = kette[i], l = Math.hypot(bx - ax, bz - az);
            if (s > l && i < kette.length - 1) s -= l;
            else { st.playerMesh.position.set(ax + ((bx - ax) * s) / l, st.playerMesh.position.y, az + ((bz - az) * s) / l); break; }
        }
        const cells = (st.worldMeta || {}).settlementCells || {}, V = r._dorfVorraete, q = r._autoSettlementQueue, p = st.playerMesh.position;
        const marke = (name, z) => { if (!gesehen[name + z.key]) { gesehen[name + z.key] = 1;
            zeiten.push({ was: name, key: z.key, s: +((t - tA) / 1000).toFixed(2), weg: +weg.toFixed(1), vorKante: +(z.x0 - p.x).toFixed(1), haeuser: q && q.cellKey === z.key ? q.idx : null }); } };
        for (const z of ziele) {
            const w = V && V.get(z.key);
            if (w) marke("bereitet", z);
            if (w && w.da) marke("vorrat", z);
            if (cells[z.key]) marke("erwacht", z);
            if (q && q.cellKey === z.key && q.idx > 0) marke("erstesHaus", z);
            if (gesehen["erstesHaus" + z.key] && !(q && q.cellKey === z.key)) marke("zugEnde", z);
        }
        const c0 = performance.now();
        r._gameLoopTick(t);
        [vorCur, vorCpu] = [cur, performance.now() - c0];
        if (t - tA > sek * 1000 || (weg >= laenge && t - tA > (laenge / v) * 1000 + 3000 && ziele.every((z) => gesehen["zugEnde" + z.key]))) {
            rend.setAnimationLoop(null);
            fertig({ dts, zf, zeiten, laenge, sek: +((t - tA) / 1000).toFixed(1), ende: [p.x, p.z], offen: r._dorfOffen(), zellen: Object.keys(cells) });
        }
    };
    rend.setAnimationLoop(tick);
});
// die Hauptstraße Ost–West der Kachel-Reihe k über die Kacheln i0..i1 der Stadt s: ihre Punkte in der Welt, von West nach Ost
window.__haupt = (s, i0, i1, k) => { const FC = globalThis.__fachwerkCore, M = AnazhRealm._siedlungGesetz().cellM, aus = [];
    for (let i = i0; i <= i1; i++) { const N = FC.kachelNetz(s.seed, i, k), ox = s.x + i * M, oz = s.z + k * M;
        const E = N.edges.filter((e) => e.gen === 0 && Math.abs(e.pts[e.pts.length - 1].x - e.pts[0].x) > Math.abs(e.pts[e.pts.length - 1].z - e.pts[0].z)).sort((a, b) => a.pts[0].x - b.pts[0].x);
        for (const e of E) for (const q of e.pts) { const w = [ox + q.x, oz + q.z], v = aus[aus.length - 1]; if (!v || Math.hypot(w[0] - v[0], w[1] - v[1]) > 0.05) aus.push(w); } }
    return aus; };
return 1;`;
(async () => {
    let sv = null, wk = null;
    try {
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "vor-" + f));
        const sl = fs.openSync(path.join(AUS, "save.log"), "w");
        sv = spawn(process.execPath, ["save-server.js"], { cwd: BAUM, env: { ...process.env, PORT: String(S) }, stdio: ["ignore", sl, sl], windowsHide: true });
        for (let i = 0; !(await da(S)); i++) { if (i > 60) throw new Error("save-server steht nicht"); await warte(1000); }
        const wl = path.join(AUS, "werkbank.log"), wf = fs.openSync(wl, "w");
        wk = spawn(process.execPath, ["scripts/werkbank.cjs", "start", "--echt", "--port", String(W), "--seite", "http://localhost:" + S, "--ort", "wiese"], { cwd: BAUM, env: { ...process.env, WERKBANK_FENSTER: "1920x1080" }, stdio: ["ignore", wf, wf], windowsHide: true });
        for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++) {
            if (i > 600 || /FEHLER/.test(fs.readFileSync(wl, "utf8"))) throw new Error("Werkbank nicht bereit: " + fs.readFileSync(wl, "utf8").slice(-400));
            await warte(1000);
        }
        log("bereit");
        await ev(SEITE);
        const schirm0 = await ev(`return { schirm: r._schirm(), laubRand: typeof r._laubRand === "function" ? r._laubRand() : null, fenster: [innerWidth, innerHeight], version: (typeof AnazhRealm !== "undefined" && AnazhRealm.VERSION) || null };`);
        erg.boot = schirm0;
        log("Boot " + JSON.stringify(schirm0));
        const klein = (l) => l && Object.fromEntries(Object.entries(l).filter(([, v]) => typeof v !== "object" || v === null || JSON.stringify(v).length < 600));
        const messen = async () => {
            const l = await ruf("/lauf", { sek: 20, ein: 10, regler: "frei" }), pu = await ruf("/puffer", { top: 5 });
            fs.writeFileSync(path.join(AUS, "lauf.roh.json"), JSON.stringify({ lauf: l, puffer: pu }));
            return { lauf: klein(l), heapNachGc: pu && (pu.heap || pu.heapMB || null), vram: pu && pu.vram, pufferFelder: pu && Object.keys(pu) };
        };
        // Modus `voll`: stadt-voll von HEUTE (das Wort bis zur Wand ist byte-gleich) am Messort, derselbe Lauf wie `stand`
        if (MODUS === "voll") {
            const u = await ruf("/umstellen", { ort: "stadt-voll" });
            log("umstellen stadt-voll " + JSON.stringify(u && { takte: u.takte, steht: u.steht, spieler: u.spieler, fehler: u.fehler }).slice(0, 300));
            erg.voll = await messen();
            erg.voll.zensus = await ev(`const B = r._bewohnerSiedlungen || new Map(); return [...B.entries()].map(([k, S]) => ({ k, lose: S.plan.slots.length }));`);
            schreib();
            log("stadt-voll heute " + JSON.stringify(erg.voll).slice(0, 2000));
            return;
        }
        // die Gründung am Anker von stadt-voll; der Zug der Welt-Zellen ruht bis nach dem Akt
        await ev(`const st = r.state; window.__anazhAutoSettlement = false;
            st.playerMesh.position.set(${ANLAUF[0]}, r._voxelSurfaceY(${ANLAUF[0]}, ${ANLAUF[1]}) + 1.8, ${ANLAUF[1]});
            __loop(1);
            await __weltDa(() => AnazhRealm._siedlungGesetz());
            window.__aktT = performance.now(); window.__aktErg = null;
            r.spawnSettlement({ verlangt: "human", seed: ${SAMEN}, nH: ${NH}, position: { x: ${ANKER[0]}, y: 0, z: ${ANKER[1]} } }).then(
                (res) => (window.__aktErg = { placed: res && res.placed, skipped: res && res.skipped, name: res && res.name, ms: Math.round(performance.now() - window.__aktT) }),
                (e) => (window.__aktErg = { fehler: String((e && e.message) || e) }));
            return 1;`);
        for (let i = 0; i < 400; i++) {
            const s = await ev(`const q = r._autoSettlementQueue; return { erg: window.__aktErg, offen: r._dorfOffen(), s: Math.round((performance.now() - window.__aktT) / 1000) };`);
            if (i % 6 === 0 || s.erg) log("Akt " + JSON.stringify(s).slice(0, 300));
            if (s.erg && (s.erg.fehler || !s.offen)) break;
            await warte(5000);
        }
        const gr = await ev(`const st = r.state, res = window.__aktErg || {};
            __loop();
            const SG = AnazhRealm._siedlungGesetz(), s = r._staedte()[0] || null, kacheln = [];
            if (s) for (let k = -s.ringe; k <= s.ringe; k++) for (let i = -s.ringe; i <= s.ringe; i++) {
                const v = (i || k) && r._viertelInfo(s.cx + i, s.cz + k);
                if (v) kacheln.push({ i, k, key: v.key, seed: v.seed, nH: v.nH, x: +v.x.toFixed(1), z: +v.z.toFixed(1), fest: v.fest });
            }
            const c = s && st.worldMeta.settlementCells[s.key], B = r._bewohnerSiedlungen, P = s && B && B.get(s.key);
            return { res, zellM: SG.cellM, stadt: s && { key: s.key, seed: s.seed, nH: s.nH, ringe: s.ringe, x: s.x, z: s.z, cx: s.cx, cz: s.cz }, mitte: c && { nH: c.nH, stadt: c.stadt },
                plan: P && { lose: P.plan.slots.length, kachel: P.plan.kachel, mauer: P.plan.mauer ? P.plan.mauer.segs.length : 0, kernel: P.plan.kernel, region: P.plan.region, jahr: P.plan.jahr }, kacheln, summe: (c ? c.nH : 0) + kacheln.reduce((a, v) => a + v.nH, 0) };`);
        erg.gruendung = gr;
        schreib();
        log("Gründung " + JSON.stringify(gr).slice(0, 1500));
        if (!gr || !gr.stadt) throw new Error("keine Stadt: " + JSON.stringify(gr).slice(0, 300));
        const s = gr.stadt, M = gr.zellM;
        const hauptstr = async (i0, i1) => await ev(`return __haupt(${JSON.stringify(s)}, ${i0}, ${i1}, 0);`);
        const stell = async (x, z, lx, lz, sek, bis) => await ev(`const p = r.state.playerMesh.position; p.set(${x}, r._voxelSurfaceY(${x}, ${z}) + 1.8, ${z}); r.state.yaw = ${Math.atan2(lx - x, lz - z)};
            window.__anazhAutoSettlement = true; __loop(1);
            for (let i = 0; i < ${sek * 4} && (i < 24 || ${bis || "r._dorfOffen()"}); i++) await sleep(250);
            __loop();
            return { spieler: [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)], boden: +r._voxelSurfaceY(${x}, ${z}).toFixed(1), offen: r._dorfOffen(), zellen: Object.keys(r.state.worldMeta.settlementCells || {}).length, schirm: r._schirm(), laubRand: typeof r._laubRand === "function" ? r._laubRand() : null };`);
        if (MODUS === "gang") {
            // die Hauptstraße von der Mitte nach Osten über die Kacheln 0, 1, 2
            const H = await hauptstr(0, 2), mitte = H.findIndex((q) => q[0] >= s.x), kette = H.slice(Math.max(0, mitte));
            const ziele = [1, 2].map((i) => ({ key: s.cx + i + "," + s.cz, x0: s.x + i * M - M / 2 }));
            const lang = kette.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - kette[i][0], q[1] - kette[i][1]), 0);
            log("Gang " + V + " m/s: die Hauptstraße von der Mitte nach Osten, " + kette.length + " Punkte, " + lang.toFixed(0) + " m; Kacheln voraus " + ziele.map((z) => z.key).join(" · "));
            const g = await ev(`const p = r.state.playerMesh.position; p.set(${kette[0][0]}, r._voxelSurfaceY(${kette[0][0]}, ${kette[0][1]}) + 1.8, ${kette[0][1]}); r.state.yaw = ${Math.PI / 2};
                window.__anazhAutoSettlement = true;
                window.__uhr = {}; for (const n of ["_wegeStufeMalen", "_stlWegeBuild", "_erdbauSetzen", "_ortPlanSetzen", "_spawnSettlementSlot", "_dorfZugSchritt", "_erdbauWirkt", "_wegeSchichtHoch", "_stlMauerBuild", "_nahWieseNeuIn", "_grundrissFaellt", "_ortNeuPlanen", "_ortNeuRechnen", "_ortFremdPruefen", "_trittFlaecheLoesen", "_hausGrundSetzen", "_erdbauGrundFaellt"]) { const alt = r[n]; if (typeof alt !== "function") continue; const u = (window.__uhr[n] = { n: 0, ms: 0, max: 0, art: {} });
                    r[n] = function (...a) { const t = performance.now(), o = alt.apply(this, a), d = performance.now() - t; u.n++; u.ms += d; if (d > u.max) u.max = d; if (n === "_wegeStufeMalen" || n === "_ortNeuPlanen" || n === "_ortFremdPruefen") { const k = n === "_wegeStufeMalen" ? a[0].S.name + (a[1] ? " umzug" : a[2] ? " dazu" : " ganz") : String(a[0]), q = (u.art[k] = u.art[k] || { n: 0, ms: 0, max: 0 }); q.n++; q.ms += d; if (d > q.max) q.max = d; } return o; }; }
                return await __gang(${JSON.stringify(kette)}, ${V}, ${(lang / V + 420).toFixed(0)}, ${JSON.stringify(ziele)});`);
            fs.writeFileSync(path.join(AUS, "gang.roh.json"), JSON.stringify(g));
            let t = 0;
            const T = g.dts.map((d) => (t += d) / 1000), zt = (key, was) => (g.zeiten.find((x) => x.key === key && x.was === was) || {}).s;
            erg.gang = { v: V, laenge: +g.laenge.toFixed(0), sek: g.sek, offen: g.offen, zellen: g.zellen, ganz: teil(g.dts, T, 3, Infinity), bahn: teil(g.dts, T, 3, g.laenge / V + 3), zeiten: g.zeiten, je: ziele.map((z) => ({ key: z.key,
                bereiten: teil(g.dts, T, zt(z.key, "bereitet") ?? Infinity, zt(z.key, "erwacht") ?? Infinity), zug: teil(g.dts, T, zt(z.key, "erwacht") ?? Infinity, zt(z.key, "zugEnde") ?? Infinity) })) };
            schreib();
            log("Gang ganz " + JSON.stringify(erg.gang.ganz));
            log("Gang Bahn (nur unterwegs) " + JSON.stringify(erg.gang.bahn));
            log("Gang je Kachel " + JSON.stringify(erg.gang.je));
            log("Gang Zeiten " + JSON.stringify(g.zeiten));
            const uhr = await ev(`const o = {}; for (const n in window.__uhr || {}) { const u = window.__uhr[n]; o[n] = { n: u.n, ms: Math.round(u.ms), max: Math.round(u.max), art: Object.fromEntries(Object.entries(u.art).map(([k, q]) => [k, { n: q.n, ms: Math.round(q.ms), max: Math.round(q.max) }])) }; } return o;`);
            erg.uhr = uhr;
            // DIE LESEWERTE DES ZUGS: die Bilder, in denen ein Zug offen war — ihr p50, ihre Summe; Häuser je Sekunde im Zug; je Kachel
            // voraus der Abstand des Spielers zu ihrer West-Kante beim Zug-Ende (positiv: sie stand, ehe er die Kante querte)
            const zd = g.dts.filter((_d, i) => g.zf && g.zf[i]).sort((a, b) => a - b), zs = zd.reduce((a, d) => a + d, 0) / 1000, hs = uhr._spawnSettlementSlot ? uhr._spawnSettlementSlot.n : 0;
            erg.zug = { bilder: zd.length, sek: +zs.toFixed(1), p50: zd.length ? +zd[zd.length >> 1].toFixed(1) : null, p95: zd.length ? +zd[Math.floor(0.95 * (zd.length - 1))].toFixed(1) : null, max: zd.length ? +zd[zd.length - 1].toFixed(1) : null, anteil33: zd.length ? +((100 * zd.filter((d) => d > 33.4).length) / zd.length).toFixed(1) : null,
                haeuser: hs, haeuserJeS: zs ? +(hs / zs).toFixed(1) : null, haeuserJeBild: zd.length ? +(hs / zd.length).toFixed(2) : null,
                kante: ziele.map((z) => ({ key: z.key, erwachtVorKante: (g.zeiten.find((x) => x.key === z.key && x.was === "erwacht") || {}).vorKante ?? null, zugEndeVorKante: (g.zeiten.find((x) => x.key === z.key && x.was === "zugEnde") || {}).vorKante ?? null })) };
            // wer die Bilder über 33 ms trug: ms je Bild über der Schwelle (und je Bild überhaupt), die Größten zuerst
            const fr = await ev(`const f = window.__fr, r1 = (o, n) => Object.entries(o).map(([k, v]) => [k, +(v / Math.max(1, n)).toFixed(2)]).sort((a, b) => b[1] - a[1]).slice(0, 26); return { n: f.n, nUeber: f.nUeber, cpuJeBild: +(f.cpuAlle / Math.max(1, f.n)).toFixed(1), cpuJeBildUeber: +(f.cpuUeber / Math.max(1, f.nUeber)).toFixed(1), ueber: r1(f.ueber, f.nUeber), alle: r1(f.alle, f.n), top: f.top.sort((a, b) => b.dt - a.dt).slice(0, 12) };`);
            erg.zerlegung = fr;
            schreib();
            log("Zerlegung " + JSON.stringify(fr).slice(0, 4000));
            log("Zug " + JSON.stringify(erg.zug));
            log("Uhren " + JSON.stringify(uhr).slice(0, 2500));
            // warum eine Kachel voraus nicht erwachte: verworfen? ihre Zell-Info, die Stelle, die Wände der Stelle einzeln
            const diag = await ev(`const A = AnazhRealm.AUTO_SETTLEMENT, aus = { verworfen: [...(r._autoSettlementRejected || [])], vorraete: [...(r._dorfVorraete || new Map()).keys()], pending: r._autoSettlementPendingKey || null, tempo: r._bedarfTempo(), kacheln: [] };
                for (const k of ${JSON.stringify(ziele.map((z) => z.key))}) { const [cx, cz] = k.split(",").map(Number), i = r._autoSettlementCellInfo(cx, cz), g = r._genesisMitte();
                    aus.kacheln.push(i ? { k, nH: i.nH, x: +i.x.toFixed(1), z: +i.z.toFixed(1), mehrM: Math.round(i.mehrM), fest: i.fest, siteOk: r._autoSettlementSiteOk(i.x, i.z, false, i.mehrM), wildnis: r._wildnisTraegt(i.x, i.z), land: r._landAt(i.x, i.z, 0.2), hang: +r._slopeAt(i.x, i.z).toFixed(3), genesisM: g ? Math.round(Math.hypot(i.x - g.x, i.z - g.z)) : null, wort: r._wortOrtVerdraengt(i) } : { k, info: i }); }
                return aus;`);
            erg.diagnose = diag;
            schreib();
            log("Diagnose " + JSON.stringify(diag).slice(0, 1500));
        }
        // Modus `haenger`: die Hänger-Linse (`/haenger`, der echte Lauf mit Stichproben der Spur) auf der Bahn der Hauptstraße von der
        // Mitte nach Osten (4 m/s, hin und zurück) — je Bild über der Schwelle der Täter beim Namen, während die Kacheln erwachen
        if (MODUS === "haenger") {
            const H = await hauptstr(0, 2), mitte = H.findIndex((q) => q[0] >= s.x), kette = H.slice(Math.max(0, mitte));
            await ev(`const p = r.state.playerMesh.position; p.set(${kette[0][0]}, r._voxelSurfaceY(${kette[0][0]}, ${kette[0][1]}) + 1.8, ${kette[0][1]}); window.__ortBahn = ${JSON.stringify(kette)}; window.__anazhAutoSettlement = true; return 1;`);
            const a = await ruf("/haenger", { sek: Number(process.env.NETZ_SEK) || 150, ein: 2, wandern: "bahn", json: path.join(AUS, "haenger.json") });
            erg.haenger = { tabelle: a && a.tabelle, befunde: a && a.befunde, cpuMs: a && a.cpuMs, taeter: a && a.taeter, datei: a && a.datei };
            erg.haengerZellen = await ev(`return Object.keys(r.state.worldMeta.settlementCells || {});`);
            schreib();
            log("Hänger Befunde " + JSON.stringify(a && a.befunde).slice(0, 2500));
            log("Hänger Täter " + JSON.stringify(a && a.taeter).slice(0, 2500));
            log("Hänger Tabelle " + JSON.stringify(a && a.tabelle).slice(0, 1500));
        }
        if (MODUS === "stand" || MODUS === "bild") {
            // 3 × 3 Kacheln erwachen: der Spieler steht auf der Hauptstraße in der Mitte, bis die acht Nachbarn stehen
            const H = await hauptstr(-1, 1), mi = H.reduce((b, q, i) => (Math.abs(q[0] - s.x) < Math.abs(H[b][0] - s.x) ? i : b), 0), P0 = H[mi];
            const acht = []; for (let k = -1; k <= 1; k++) for (let i = -1; i <= 1; i++) if (i || k) acht.push(s.cx + i + "," + (s.cz + k));
            const tW = Date.now();
            const st1 = await stell(P0[0], P0[1], P0[0] + 50, P0[1], 1500, `!${JSON.stringify(acht)}.every((k) => r.state.worldMeta.settlementCells[k]) || r._dorfOffen()`);
            erg.neun = { sek: Math.round((Date.now() - tW) / 1000), ...st1 };
            schreib();
            log("3 × 3 erwacht nach " + erg.neun.sek + " s: " + JSON.stringify(st1).slice(0, 300));
            const haeuser = await ev(`const B = r._bewohnerSiedlungen || new Map(); return [...B.entries()].map(([k, S]) => ({ k, lose: S.plan.slots.length, haeuser: S.plan.slots.filter((q) => r._dorfHaus(S.ox + q.x, S.oz + q.z, q.seed >>> 0)).length, mauer: S.plan.mauer ? S.plan.mauer.segs.length : 0, rand: S.plan.kachel ? Object.keys(S.plan.kachel.rand).filter((e) => S.plan.kachel.rand[e]).join("") : null }));`);
            erg.haeuser = haeuser;
            log("Häuser " + JSON.stringify(haeuser).slice(0, 1400));
            if (MODUS === "stand") {
                erg.stand = await messen();
                schreib();
                log("Stand " + JSON.stringify(erg.stand).slice(0, 1800));
                // DIE FEGE-TAKTE DER STEHENDEN STADT: wer geht noch, worauf wartet die Streu — die Kapsel-Liste des Welt-March, die
                // Zellen, die warten (`wartet`: ihr Satz steht nicht; `halt` „wartet“: ihr Band-Partner lädt), je Schicht/Art/Form
                const fege = await ev(`const st = r.state, wm = st.weltMarch || null, aus = { geht: r._standGeht(), offen: JSON.parse(JSON.stringify(r._weltOffen())), kapselVoll: wm ? wm.kapselVoll : null, wm: {}, zellen: {}, n: 0 };
                    if (wm) for (const k of Object.keys(wm)) { const v = wm[k]; if (typeof v === "number" || typeof v === "boolean") aus.wm[k] = v; else if (v && typeof v.size === "number") aus.wm[k + ".size"] = v.size; else if (Array.isArray(v)) aus.wm[k + ".length"] = v.length; }
                    const p = st.playerMesh.position;
                    for (const reg of (st.scatterRegions || new Map()).values()) for (const c of (reg && reg.cells) || []) { if (!c) continue; aus.n++;
                        if (c.wartet === true || c.halt === "wartet") { const d = Math.hypot(c.x - p.x, c.z - p.z), k = [c.layer, c.species, c.form, "lod" + c.lod, c.wartet === true ? "wartet" : "", c.halt === "wartet" ? "halt" : ""].join(" ").trim(), q = (aus.zellen[k] = aus.zellen[k] || { n: 0, dMin: Infinity, dMax: 0 }); q.n++; q.dMin = Math.round(Math.min(q.dMin, d)); q.dMax = Math.round(Math.max(q.dMax, d)); } }
                    return aus;`);
                erg.fege = fege;
                schreib();
                log("Fege " + JSON.stringify(fege).slice(0, 3000));
            } else {
                const bild = async (name, e, kam) => {
                    // die Kamera von oben im LAUFENDEN Spiel (`/schirm`): `_loopCamera` hält sie für den Schuss an der Pose — die
                    // Bühnen-Aufnahme `/bild` wartet auf die Ruhe der Welt, und die Welt der Stadt ruht nie (Fege-Takt streuLod wartet)
                    if (kam) await ev(`window.__kamAlt = r._loopCamera; r._loopCamera = function () { const c = this.state.camera; c.position.set(${kam[0]}, ${kam[1]}, ${kam[2]}); c.lookAt(${kam[3]}, ${kam[4]}, ${kam[5]}); c.updateMatrixWorld(true); }; return 1;`);
                    const b = await ruf("/schirm", { datei: path.join(AUS, name + ".png") });
                    if (kam) await ev(`r._loopCamera = window.__kamAlt; return 1;`);
                    erg[name] = { ...e, kamera: kam || null, datei: b && b.datei };
                    schreib();
                    log("Bild " + name + ": " + JSON.stringify(erg[name]).slice(0, 400));
                };
                const kante = s.x + M / 2, an = H.reduce((b, q, i) => (Math.abs(q[0] - (kante - 14)) < Math.abs(H[b][0] - (kante - 14)) ? i : b), 0), vor = H.reduce((b, q, i) => (Math.abs(q[0] - (kante + 40)) < Math.abs(H[b][0] - (kante + 40)) ? i : b), 0);
                // (2) aus 90 m Höhe: über der Mitte, Blick nach Nordosten über drei Kacheln
                // der Spieler steht UNTER der Kamera (`/bild` stellt sonst um — die Welt der Stadt schwingt dabei nicht ein)
                const oben = async (name, kx, kz, lx, lz) => { const e = await stell(kx, kz, lx, lz, 30); await bild(name, e, [e.spieler[0], e.boden + 90, e.spieler[2], lx, e.boden, lz]); };
                await oben("bild2-aus-90m", P0[0] - 150, P0[1] + 150, P0[0] + 120, P0[1] - 120);
                await oben("bild2b-aus-90m-ost", P0[0] - 60, P0[1], P0[0] + 260, P0[1]);
                // (3) die Kamera des Vorher-Bilds
                await bild("bild3-kamera-vorher", await stell(476.5, 446.1, -133.3, 456.8, 30), [476.5, 140.7, 446.1, -133.31157298548928, 69.870082, 456.8177457424647]);
                // (1) an der Kante: auf der Hauptstraße 14 m vor der Kante Mitte ↔ Ost, Blick die Straße entlang über die Kante
                await bild("bild1-an-der-kante", await stell(H[an][0], H[an][1], H[vor][0], H[vor][1], 60));
                // (4) am Boden die Hauptstraße entlang über zwei Kanten: vom West-Ende der West-Kachel nach Osten
                const w0 = H.reduce((b, q, i) => (Math.abs(q[0] - (s.x - M - 60)) < Math.abs(H[b][0] - (s.x - M - 60)) ? i : b), 0), w1 = H.reduce((b, q, i) => (Math.abs(q[0] - (s.x - M + 20)) < Math.abs(H[b][0] - (s.x - M + 20)) ? i : b), 0);
                await bild("bild4-hauptstrasse", await stell(H[w0][0], H[w0][1], H[w1][0], H[w1][1], 60));
            }
        }
    } catch (e) {
        erg.fehler = String((e && e.stack) || e).slice(0, 800);
        log("FEHLER " + erg.fehler);
        process.exitCode = 1;
    } finally {
        schreib();
        try { spawnSync(process.execPath, ["scripts/werkbank.cjs", "stop"], { cwd: BAUM, timeout: 30000, env: { ...process.env, WERKBANK_PORT: String(W) } }); } catch (_e) { /* */ }
        await warte(1500);
        for (const p of [wk, sv]) if (p && p.pid) spawnSync("taskkill", ["/F", "/T", "/PID", String(p.pid)]);
        for (const f of ["anazhRealmState.json", "anazhRealmState.json.bak", "anazhRealmPerf.json"]) if (fs.existsSync(path.join(BAUM, f))) fs.renameSync(path.join(BAUM, f), path.join(AUS, "nach-" + f));
        log("ENDE");
    }
})();
