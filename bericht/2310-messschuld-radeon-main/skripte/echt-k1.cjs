// echt-k1.cjs — Scratch (nicht im Baum): speicher.K1/K2 am echten Spiel auf der Radeon (Fenster, rAF-Loop, CDP-Eingabe),
// Host ohne save-server. Kopie von 2210-messschuld-6cfce/skripte/echt-k1.cjs, am main-Kopf 452972a6 erweitert um:
//  (a) Tode im DORF-ERWACHEN (`_dorfErwachen`, der Gang `_autoSettlementQueue.gang`): der Spieler wird auf 180 m vor den Ort
//      einer freien Dorf-Zelle gesetzt (wie M36 die Bahn setzt), die Welt weckt sie im eigenen Takt (`_tickAutoSettlement`).
//      Art "erwachen-idb"/"erwachen-platz": ein Speichern, solange der Gang lebt (setTimeout → saveState, der Pfad des
//      Edit-Save-Timers), der Tod am Schreib-Haken DIESES Stands. Art "erwachen-mitten": der Tod im ersten Bild des Gangs.
//  (b) die halbe Welt des Dorfs: reservierte Zellen (settlementCells ohne d:) gegen Orte im Erdbau (erdbau ohne haus:).
//  (c) K2 sauber: die Zeit der Mess-Haken (JSON.parse im setItem/put) fällt aus der saveState-Zeit; die Leck-Probe des
//      Flugschreibers (`_flightRecorderMemProbe` im `_imLeerlauf`) als EIGENER Posten je Bild.
// Modus `erwachen`: EIN Boot ohne Tod, eine Zelle erwacht im Takt (Autosave frei, dazu EIN Stand im Gang), 90 s je Bild Speicher und Probe.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const WT = process.env.WT || "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/mess-main";
const puppeteer = require(WT + "/node_modules/puppeteer");
const { echteWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require(WT + "/scripts/lib/ausgabe-aufnahme.cjs");
const { statikServer } = require(WT + "/scripts/lib/welt-boot.cjs");
const png = require(path.join(__dirname, "png.cjs"));
const S = process.env.OUT_DIR || __dirname;
const PORT = Number(process.env.ECHT_PORT || 7974);
const MODUS_ERWACHEN = process.argv[2] === "erwachen";
const N = MODUS_ERWACHEN ? 0 : Number(process.argv[2] || 8);
const TAG = process.argv[3] || "kopf";
const OUT = path.join(S, `echt-k1-${TAG}.json`);
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function haken() {
    window.__save = []; // je saveState-Ruf: ms OHNE die Mess-Haken
    window.__saveGangMs = []; // je saveState-Ruf, der einen lebenden Gang schloss
    window.__ric = [];
    window.__jeBild = []; // je Bild mit Speicher-Arbeit: Σ ms
    window.__jeBildProbe = []; // je Bild mit Leck-Probe: Σ ms
    window.__jeBildErw = []; // die 300 Bilder ab dem ersten Bild des Gangs: Σ Speicher-ms je Bild (auch 0)
    window.__probe = [];
    window.__bilder = 0;
    window.__hakenMs = 0;
    window.__gangJson = new Set();
    let acc = 0, accP = 0, imRic = 0, saveImRic = 0, ricSave = false, inSave = 0, saveGang = false;
    let gangBild = -1, bildNr = 0;
    const zaehl = () => {
        window.__bilder++;
        bildNr++;
        if (acc > 0) window.__jeBild.push(acc);
        if (accP > 0) window.__jeBildProbe.push(accP);
        if (gangBild >= 0 && bildNr - gangBild <= 300) window.__jeBildErw.push(acc);
        acc = 0;
        accP = 0;
        const r = window.anazhRealm, q = r && r._autoSettlementQueue;
        if (q && q.gang && window.__erwArt && !window.__gangGesehen) {
            window.__gangGesehen = { t: Date.now(), bild: bildNr, schluessel: q.key || null };
            gangBild = bildNr;
            console.log("__GANG__ " + JSON.stringify(window.__gangGesehen));
            if (window.__erwArt === "mitten") {
                console.log("__TOD__");
                for (;;);
            }
            setTimeout(() => {
                const q2 = r._autoSettlementQueue;
                window.__gangSaveLebte = !!(q2 && q2.gang);
                // die Schritte des Gangs, die saveState synchron geht (je 500 ein Zeichen; ein Gang ohne Ende hängt die Seite)
                if (q2 && q2.gang) {
                    const g = q2.gang, nx = g.next.bind(g);
                    let n = 0;
                    g.next = (...x) => { n++; if (n % 500 === 0) console.log("__GANGSCHRITT__ " + n); const v = nx(...x); if (v.done) console.log("__GANGENDE__ " + n); return v; };
                }
                const t = performance.now();
                console.log("__SAVESTART__ lebt=" + window.__gangSaveLebte);
                r.saveState();
                console.log("__SAVEENDE__ ms=" + (performance.now() - t).toFixed(1));
            }, 0);
        }
        requestAnimationFrame(zaehl);
    };
    requestAnimationFrame(zaehl);
    const ric = window.requestIdleCallback;
    if (typeof ric === "function")
        window.requestIdleCallback = function (cb, opt) {
            return ric.call(window, function (dl) {
                const t = performance.now();
                imRic++; ricSave = false; saveImRic = 0;
                try { return cb.apply(this, arguments); } finally {
                    imRic--;
                    const d = performance.now() - t;
                    if (ricSave) { window.__ric.push([d, saveImRic]); acc += saveImRic; }
                }
            }, opt);
        };
    const iv = setInterval(() => {
        const r = window.anazhRealm;
        if (!r || typeof r.saveState !== "function" || r.__gehuellt) return;
        const P = Object.getPrototypeOf(r);
        const org = P.saveState;
        P.saveState = function () {
            const q = this._autoSettlementQueue;
            saveGang = !!(q && q.gang);
            const h0 = window.__hakenMs;
            const t = performance.now();
            inSave++;
            let v;
            try { v = org.apply(this, arguments); } finally { inSave--; }
            const d = performance.now() - t - (window.__hakenMs - h0);
            window.__save.push(d);
            if (saveGang) window.__saveGangMs.push(d);
            if (imRic) { ricSave = true; saveImRic += d; } else acc += d;
            return v;
        };
        const orgP = P._flightRecorderMemProbe;
        if (typeof orgP === "function")
            P._flightRecorderMemProbe = function () {
                const t = performance.now();
                try { return orgP.apply(this, arguments); } finally {
                    const d = performance.now() - t;
                    window.__probe.push(d);
                    accP += d;
                }
            };
        r.__gehuellt = true;
        clearInterval(iv);
    }, 5);
    const rec = (json) => {
        try {
            const s = JSON.parse(json);
            const wm = s.worldMeta || {};
            const sc = Object.keys(wm.settlementCells || {}).filter((k) => !k.startsWith("d:")).sort();
            const ok = Object.keys(wm.erdbau || {}).filter((k) => !k.startsWith("haus:")).sort();
            return { x: Math.round(s.playerPosition.x * 1e3), z: Math.round(s.playerPosition.z * 1e3), b: (s.architectures || []).filter((a) => a.type === "stein_block").length, e: (wm.voxelEdits || []).length, sc: sc.length, ok: ok.length, sck: sc.join(";") };
        } catch (_e) {
            return { kaputt: 1 };
        }
    };
    const melde = (art, json, gang) => {
        const h = performance.now();
        const e = { t: Date.now(), art, gang: !!gang, rec: json ? rec(json) : null };
        console.log("__W__ " + JSON.stringify(e));
        window.__hakenMs += performance.now() - h;
        if (window.__tod && window.__tod(e)) for (console.log("__TOD__"); ; );
    };
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
        set.call(this, k, v);
        if (/^anazhRealmState_[^.]*$/.test(k)) {
            const h = performance.now();
            const g = inSave > 0 && saveGang;
            if (g) window.__gangJson.add(v.length + ":" + v.slice(-64));
            window.__hakenMs += performance.now() - h;
            melde("platz", v, g);
        }
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        const req = put.apply(this, arguments);
        if (!String(k).endsWith(".bak") && v && typeof v.json === "string") {
            const g = window.__gangJson.has(v.json.length + ":" + v.json.slice(-64)) || (inSave > 0 && saveGang);
            this.transaction.addEventListener("complete", () => melde("fest", v.json, g));
            melde("idb", v.json, g);
        }
        return req;
    };
}

// die nächste freie Dorf-Zelle (Zell-Info, nicht reserviert, Site tauglich) und der Stand 180 m vor ihr auf Land
function erwachenVorbereiten() {
    const r = window.anazhRealm, st = r.state, pm = st.playerMesh.position;
    const SG = r.constructor._siedlungGesetz(), A = r.constructor.AUTO_SETTLEMENT;
    const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
    const rej = r._autoSettlementRejected || new Set();
    const pcx = Math.floor(pm.x / SG.cellM), pcz = Math.floor(pm.z / SG.cellM);
    const kand = [];
    for (let dz = -4; dz <= 4; dz++)
        for (let dx = -4; dx <= 4; dx++) {
            const cx = pcx + dx, cz = pcz + dz, key = cx + "," + cz;
            if (cells[key] || rej.has(key)) continue;
            const info = r._autoSettlementCellInfo(cx, cz);
            if (!info) continue;
            const site = r._autoSettlementFindSite(info);
            if (!site) continue;
            kand.push({ key, info, site, d: Math.hypot(site.x - pm.x, site.z - pm.z) });
        }
    kand.sort((a, b) => a.d - b.d);
    for (const k of kand) {
        for (let i = 0; i < 16; i++) {
            const a = Math.atan2(pm.x - k.site.x, pm.z - k.site.z) + (i * Math.PI) / 8;
            const x = k.site.x + Math.sin(a) * 180, z = k.site.z + Math.cos(a) * 180;
            if (!r._landAt(x, z, 0.2) || (r._nassAt && r._nassAt(x, z))) continue;
            pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            st.yaw = Math.atan2(k.site.x - x, k.site.z - z);
            return { zelle: k.key, nH: k.info.nH, site: [+k.site.x.toFixed(1), +k.site.z.toFixed(1)], stand: [+x.toFixed(1), +z.toFixed(1)], nearM: A.nearM, kandidaten: kand.length };
        }
    }
    return { fehler: "keine freie Dorf-Zelle mit Land-Stand", kandidaten: kand.length };
}

const BROWSER = [];
async function oeffne(profil, neu) {
    if (neu && fs.existsSync(profil)) fs.rmSync(profil, { recursive: true, force: true });
    fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: profil,
        protocolTimeout: 600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        args: [...echteWebGpuArgs(), "--window-size=1940,1200", "--autoplay-policy=no-user-gesture-required"],
    });
    BROWSER.push(browser);
    const page = (await browser.pages())[0];
    const log = [];
    page.on("console", (m) => { const t = m.text(); log.push(t); if (/^__(GANG|SAVE)/.test(t)) console.log(new Date().toISOString().slice(11, 23) + " " + t.slice(0, 200)); });
    await page.evaluateOnNewDocument(haken);
    const t0 = Date.now();
    const cdp = await page.target().createCDPSession();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    // DIE WACHE DES BOOTS: kurze Abfragen von Node aus; antwortet die Seite 150 s nicht oder steht das Weltbild nach 300 s nicht,
    // hält der Debugger den Haupt-Faden an und nennt den Stapel (wo die Seite hängt)
    for (;;) {
        const da = await Promise.race([page.evaluate(() => !!(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa)).catch(() => false), warte(150000).then(() => "STUMM")]);
        if (da === true) break;
        if (da === "STUMM" || Date.now() - t0 > 300000) {
            const stapel = await new Promise(async (ok) => {
                cdp.once("Debugger.paused", (e) => ok(e.callFrames.slice(0, 25).map((f) => `${f.functionName || "(anonym)"} ${(f.url || "").split("/").pop()}:${f.location.lineNumber + 1}`)));
                await cdp.send("Debugger.enable").catch(() => {});
                await cdp.send("Debugger.pause").catch((e) => ok(["pause: " + e.message]));
                setTimeout(() => ok(["kein Halt in 20 s"]), 20000);
            });
            console.log("BOOT HAENGT", da, Date.now() - t0, "ms | " + stapel.join(" | "));
            console.log("LOG-ENDE | " + log.filter((t) => !t.startsWith("__W__")).slice(-30).join(" | "));
            throw new Error("BOOT HAENGT");
        }
        await warte(500);
    }
    await page.bringToFront();
    const version = await page.evaluate(() => window.anazhRealm.constructor.VERSION || null);
    return { browser, page, cdp, log, bootMs: Date.now() - t0, version };
}
const taste = (cdp, typ) => cdp.send("Input.dispatchKeyEvent", { type: typ, code: "KeyW", key: "w", windowsVirtualKeyCode: 87, text: typ === "keyDown" ? "w" : undefined });
async function klick(cdp) {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: 960, y: 540, button: "left", clickCount: 1 });
}
const toeten = (b) => spawnSync("taskkill", ["/F", "/T", "/PID", String(b.process().pid)]);
const geladen = (page) =>
    page.evaluate(() => {
        const r = window.anazhRealm, st = r.state, p = st.playerMesh.position, wm = st.worldMeta || {};
        const sc = Object.keys(wm.settlementCells || {}).filter((k) => !k.startsWith("d:")).sort();
        const ok = Object.keys(wm.erdbau || {}).filter((k) => !k.startsWith("haus:")).sort();
        return { x: Math.round(p.x * 1e3), z: Math.round(p.z * 1e3), b: (st.architectures || []).filter((a) => a.type === "stein_block").length, e: (wm.voxelEdits || []).length, sc: sc.length, ok: ok.length, sck: sc.join(";"), w: wm.worldId, haeuser: (st.architectures || []).filter((a) => a && /^haus_/.test(a.type)).length };
    });
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)].toFixed(3) : null; };
const verteilung = (werte, bilder) => { const a = werte.concat(new Array(Math.max(0, bilder - werte.length)).fill(0)); return { bilderMit: werte.length, p95: q(a, 0.95), p99: q(a, 0.99), max: q(a, 1), mittel: a.length ? +(werte.reduce((x, y) => x + y, 0) / a.length).toFixed(4) : null }; };
const ernte = (page) => page.evaluate(() => { const b = window.__bilder; window.__bilder = 0; return { s: window.__save.splice(0), sg: window.__saveGangMs.splice(0), b, ric: window.__ric.splice(0), jb: window.__jeBild.splice(0), jp: window.__jeBildProbe.splice(0), je: window.__jeBildErw.splice(0), pr: window.__probe.splice(0), gl: window.__gangSaveLebte }; });

(async () => {
    const server = statikServer(process.env.ROOT ? { root: process.env.ROOT } : {});
    await new Promise((r) => server.listen(PORT, r));
    const profil = path.join(S, "profil-echt-k1-" + TAG);
    const alle = [], zyklen = [], saveMs = [], saveGangMs = [], ricMs = [], jeBild = [], jeBildProbe = [], jeBildErw = [], probeMs = [];
    let bilder = 0;
    const sammle = (w) => { saveMs.push(...w.s); saveGangMs.push(...w.sg); bilder += w.b; ricMs.push(...w.ric); jeBild.push(...w.jb); jeBildProbe.push(...w.jp); jeBildErw.push(...w.je); probeMs.push(...w.pr); };
    if (MODUS_ERWACHEN) {
        const o = await oeffne(profil, true);
        const zeile = { modus: "erwachen", bootMs: o.bootMs, version: o.version };
        console.log("boot", o.bootMs, "ms, Version", o.version);
        await klick(o.cdp);
        await warte(20000); // die Ankunft ruht (Start-Dorf, Ring)
        sammle(await ernte(o.page));
        bilder = 0; saveMs.length = 0; jeBild.length = 0; jeBildProbe.length = 0; probeMs.length = 0; ricMs.length = 0;
        // der Gang wird gesehen, ein Stand im Gang gespeichert (setTimeout → saveState, kein Tod); sonst läuft der Autosave frei
        await o.page.evaluate(() => { window.__erwArt = "messe"; });
        zeile.vorbereitung = await o.page.evaluate(erwachenVorbereiten);
        console.log("vorbereitung", JSON.stringify(zeile.vorbereitung));
        const t0 = Date.now();
        while (Date.now() - t0 < 90000) {
            await warte(1000);
            const g = await Promise.race([o.page.evaluate(() => window.__gangGesehen || null), warte(60000).then(() => "HAENGT")]);
            if (g === "HAENGT") { zeile.haengt = { nachMs: Date.now() - t0 }; console.log("SEITE HAENGT", JSON.stringify(zeile)); fs.writeFileSync(OUT, JSON.stringify({ modus: "erwachen", zeile, log: o.log.filter((t) => !t.startsWith("__W__")).slice(-80) }, null, 1)); toeten(o.browser); server.close(); process.exit(3); }
            if (g && !zeile.gang) zeile.gang = g;
        }
        zeile.reserviert = await o.page.evaluate(() => Object.keys((window.anazhRealm.state.worldMeta || {}).settlementCells || {}));
        sammle(await ernte(o.page));
        zeile.zustand = await geladen(o.page);
        await o.browser.close();
        const erg = { modus: "erwachen", zeile, bilder, saveRufe: saveMs.length, saveMs: { p50: q(saveMs, 0.5), p95: q(saveMs, 0.95), max: q(saveMs, 1) }, saveGangMs, jeBildSpeicher: verteilung(jeBild, bilder), jeBildProbe: verteilung(jeBildProbe, bilder), probeRufe: probeMs.length, probeMs: { p50: q(probeMs, 0.5), p95: q(probeMs, 0.95), max: q(probeMs, 1) }, jeBildErwachen: jeBildErw.length ? { bilder: jeBildErw.length, p95: q(jeBildErw, 0.95), max: q(jeBildErw, 1) } : null };
        fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
        console.log("ERGEBNIS", JSON.stringify(erg));
        server.close();
        process.exit(0);
    }
    let vorher = null;
    const vorherListe = [];
    // die Arten: gerade z am Haken (idb · fest · platz; z 6 und 14 am Haken eines Stands im Gang), ungerade zufällig (z 3 und 11 im ersten Bild des Gangs)
    const ARTEN = process.env.K1_ARTEN ? process.env.K1_ARTEN.split(",") : null; // eine eigene Folge (z. B. erwachen-fest,zufall)
    const artVon = (z) => ARTEN ? ARTEN[z % ARTEN.length] : (z === 6 ? "erwachen-idb" : z === 14 ? "erwachen-platz" : z === 3 || z === 11 ? "erwachen-mitten" : z % 2 === 0 ? ["idb", "fest", "platz"][(z >> 1) % 3] : "zufall");
    for (let z = 0; z <= N; z++) {
        const o = await oeffne(profil, z === 0);
        const g = await geladen(o.page);
        const zeile = { z, bootMs: o.bootMs, version: o.version, g, befund: o.log.filter((t) => /ließ sich nicht laden|korrupt|unlesbar|Welt aus \.bak/i.test(t)).map((t) => t.slice(0, 160)) };
        zeile.dorfHalb = g.sc !== g.ok;
        for (const t of o.log) if (t.startsWith("__W__ ")) alle.push(JSON.parse(t.slice(6)));
        let tot = null, gang = null;
        o.page.on("console", (m) => {
            const t = m.text();
            if (t.startsWith("__W__ ")) alle.push(JSON.parse(t.slice(6)));
            if (t.startsWith("__GANG__ ")) gang = Object.assign(JSON.parse(t.slice(9)), { node: Date.now() });
            if (t === "__TOD__" && !tot) (tot = Date.now()), toeten(o.browser);
        });
        if (vorher) {
            const gl = (e) => e.rec && e.rec.x === g.x && e.rec.z === g.z && e.rec.b === g.b && e.rec.e === g.e && e.rec.sck === g.sck && e.rec.ok === g.ok;
            const ganz = alle.filter((e) => e.t <= vorher.tot + 1000 && gl(e));
            zeile.alterS = ganz.length ? Math.max(0, vorher.tot - Math.max(...ganz.map((e) => e.t))) / 1000 : null;
            zeile.verlorenBloecke = vorher.bMax - g.b;
            zeile.verlorenEdits = vorher.eMax - g.e;
            zeile.tod = vorher.art;
            if (vorher.erwachen) zeile.erwachenVorher = vorher.erwachen;
        }
        if (z === N) {
            await o.page.evaluate(AUSGABE_INSTALL);
            await o.page.evaluate(async () => {
                const r = window.anazhRealm, st = r.state;
                if (st.cameraMode !== "third") r.setCameraMode("third");
                st.yaw = -Math.PI / 2;
                for (let i = 0; i < 180; i++) await new Promise((f) => requestAnimationFrame(f));
            });
            await warte(4000);
            const roh = await o.page.evaluate(async () => {
                window.__buehne();
                const { u8 } = await window.__ausgabeAufnahme(1920, 1080);
                let s = "";
                for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
                return btoa(s);
            });
            fs.writeFileSync(path.join(S, `echt-k1-${TAG}.png`), png(new Uint8Array(Buffer.from(roh, "base64")), 1920, 1080));
            sammle(await ernte(o.page));
            zyklen.push(zeile);
            await o.browser.close();
            break;
        }
        const art = artVon(z);
        await klick(o.cdp);
        await warte(500);
        let erw = null;
        if (art.startsWith("erwachen")) {
            erw = await o.page.evaluate(erwachenVorbereiten);
            await o.page.evaluate((a) => { window.__erwArt = a; }, art.slice(9));
            if (art !== "erwachen-mitten") await o.page.evaluate((a) => (window.__tod = (e) => e.gang && e.art === a), art.slice(9));
        }
        await taste(o.cdp, "keyDown");
        const bauer = setInterval(() => {
            o.page
                .evaluate(() => {
                    const r = window.anazhRealm, p = r.state.playerMesh.position;
                    const ziel = { x: p.x + 6, y: r._terrainMacroSurfaceY(p.x + 6, p.z), z: p.z }, u = r._setzUrteil("stein_block", ziel, true);
                    if (u.ok || u.grund === "material") r.spawnArchitecture("stein_block", ziel, { silent: true });
                    else (window.__absage = window.__absage || {})[u.grund] = ((window.__absage || {})[u.grund] || 0) + 1;
                    r.carveVoxelSphere(p.x - 5, r._terrainMacroSurfaceY(p.x - 5, p.z), p.z, 1.5);
                })
                .catch(() => {});
        }, 1500);
        if (art.startsWith("erwachen")) {
            for (let i = 0; i < 1800 && !tot; i++) await warte(50); // bis 90 s auf das Erwachen und seinen Tod
            if (!tot) {
                const w = await ernte(o.page).catch(() => null);
                if (w) sammle(w);
                (zeile.verfehlt = gang ? "Gang ohne Tod" : "kein Erwachen in 90 s"), (tot = Date.now()), toeten(o.browser);
            }
            zeile.erwachen = Object.assign({}, erw, { gang, art });
        } else {
            await warte(6000 + Math.random() * 12000);
            sammle(await ernte(o.page));
            if (art === "zufall") (tot = Date.now()), toeten(o.browser);
            else {
                await o.page.evaluate((a) => (window.__tod = (e) => e.art === a), art).catch(() => {});
                for (let i = 0; i < 400 && !tot; i++) await warte(50);
                if (!tot) (zeile.verfehlt = true), (tot = Date.now()), toeten(o.browser);
            }
        }
        clearInterval(bauer);
        await new Promise((ok) => (o.browser.process().exitCode != null ? ok() : o.browser.process().once("exit", ok)));
        const fest = alle.filter((e) => e.art === "fest" && e.t <= tot && e.t >= tot - 120000);
        vorherListe.push(tot);
        const gangWrites = alle.filter((e) => e.gang && e.t <= tot && e.t >= tot - 120000).map((e) => ({ art: e.art, vorTod: tot - e.t, rec: e.rec }));
        vorher = { tot, art, erwachen: art.startsWith("erwachen") ? { zelle: erw && erw.zelle, gangGesehen: !!gang, gangWrites } : null, bMax: fest.length ? Math.max(g.b, ...fest.map((e) => e.rec.b)) : g.b, eMax: fest.length ? Math.max(g.e, ...fest.map((e) => e.rec.e)) : g.e };
        zyklen.push(zeile);
        console.log(`z${z} ${art} v=${o.version} boot=${o.bootMs} geladen=${JSON.stringify(g)} alter=${zeile.alterS} verloren=${zeile.verlorenBloecke} dorfHalb=${zeile.dorfHalb} ${erw ? "erw=" + JSON.stringify(erw) + " gang=" + JSON.stringify(gang) : ""} ${zeile.verfehlt || ""} ${zeile.befund.join("|")}`);
        await warte(1500);
    }
    const urteil = zyklen.filter((x) => x.tod);
    const erg = {
        tode: urteil.length,
        todArten: urteil.reduce((m, x) => ((m[x.tod] = (m[x.tod] || 0) + 1), m), {}),
        verfehlt: zyklen.filter((x) => x.verfehlt).map((x) => [x.z, x.verfehlt]),
        alterMax: Math.max(...urteil.map((x) => (x.alterS == null ? 999 : x.alterS))),
        ueber10: urteil.filter((x) => x.alterS == null || !(x.alterS <= 10)).length,
        halbe: urteil.filter((x) => x.alterS == null || x.verlorenBloecke > 0 || x.verlorenEdits > 0 || x.dorfHalb).length,
        dorfHalb: zyklen.filter((x) => x.dorfHalb).map((x) => x.z),
        korrupt: zyklen.filter((x) => x.befund.length).length,
        saveRufe: saveMs.length,
        saveMs: { p50: q(saveMs, 0.5), p95: q(saveMs, 0.95), max: q(saveMs, 1) },
        saveGangMs,
        bilder,
        ricRufe: ricMs.length,
        ricMs: { p50: q(ricMs.map((x) => x[0]), 0.5), p95: q(ricMs.map((x) => x[0]), 0.95), max: q(ricMs.map((x) => x[0]), 1) },
        jeBildSpeicher: verteilung(jeBild, bilder),
        jeBildProbe: verteilung(jeBildProbe, bilder),
        probeRufe: probeMs.length,
        probeMs: { p50: q(probeMs, 0.5), p95: q(probeMs, 0.95), max: q(probeMs, 1) },
        jeBildErwachen: jeBildErw.length ? { bilder: jeBildErw.length, p95: q(jeBildErw, 0.95), max: q(jeBildErw, 1) } : null,
        zyklen,
        alle,
        todZeiten: vorherListe,
    };
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log("ERGEBNIS", JSON.stringify({ ...erg, zyklen: undefined, alle: undefined }));
    server.close();
    process.exit(0);
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    for (const b of BROWSER) try { toeten(b); } catch (_e) {}
    process.exit(1);
});
