// echt-k1.cjs — Scratch (nicht im Baum, OMEN-Kopie für M37 an der GTX, 23.10.: dazu der TOD IM DORF-ERWACHEN — Zyklus 1 hart,
// solange der Gang des Erwachens läuft (`_autoSettlementQueue.gang`), Zyklus 2 am IDB-Schreiben eines saveState mitten im Gang;
// die nächste Zelle mit Dorf um den Spieler erwacht über `_autoSettlementSpawnCell`, nach dem Laden zählt die Zeile Reservierung
// und Häuser der Zelle. Vorher M30): speicher.K1 am echten Spiel (Fenster, rAF-Loop, CDP-Eingabe),
// Host ohne save-server. Je Zyklus: W gehalten, alle 1,5 s ein stein_block 6 m rechts vom Spieler; Tod hart (taskkill /F /T)
// an einem Schreib-Haken (idb · fest · platz) oder zufällig. Gemessen: Alter des geladenen Stands, halbe Welt (Blöcke),
// je saveState-Ruf die Haupt-Faden-ms (K2). Am Ende: Beweisbild aus dem Ausgabe-Pfad nach dem letzten Tod.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const WT = process.env.WT || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n2010-b2b";
const puppeteer = require(WT + "/node_modules/puppeteer");
const { echteWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const { AUSGABE_INSTALL } = require(WT + "/scripts/lib/ausgabe-aufnahme.cjs");
const { statikServer } = require(WT + "/scripts/lib/welt-boot.cjs");
const png = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/koordination/bericht/2110-messschuld-radeon-2/skripte/png.cjs");
const S = process.env.OUT_DIR || __dirname;
const PORT = Number(process.env.ECHT_PORT || 7987);
const N = Number(process.argv[2] || 8);
const TAG = process.argv[3] || "kopf";
const OUT = path.join(S, `echt-k1-${TAG}.json`);
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function haken() {
    window.__save = [];
    window.__bilder = 0;
    const zaehl = () => { window.__bilder++; requestAnimationFrame(zaehl); };
    requestAnimationFrame(zaehl);
    const iv = setInterval(() => {
        const r = window.anazhRealm;
        if (!r || typeof r.saveState !== "function" || r.__gehuellt) return;
        const P = Object.getPrototypeOf(r);
        const org = P.saveState;
        P.saveState = function () {
            const t = performance.now();
            const v = org.apply(this, arguments);
            window.__save.push(performance.now() - t);
            return v;
        };
        r.__gehuellt = true;
        clearInterval(iv);
    }, 5);
    const rec = (json) => {
        try {
            const s = JSON.parse(json);
            return { x: Math.round(s.playerPosition.x * 1e3), z: Math.round(s.playerPosition.z * 1e3), b: (s.architectures || []).filter((a) => a.type === "stein_block").length, e: ((s.worldMeta && s.worldMeta.voxelEdits) || []).length };
        } catch (_e) {
            return { kaputt: 1 };
        }
    };
    const melde = (art, json) => {
        const e = { t: Date.now(), art, rec: json ? rec(json) : null };
        console.log("__W__ " + JSON.stringify(e));
        if (window.__tod && window.__tod(e)) for (console.log("__TOD__"); ; );
    };
    // DIE LESE-HAKEN (23.10.): welcher Stand den Boot trägt — jedes Lesen des Welt-Stands (localStorage-Abbild, IndexedDB) legt
    // sein rec in window.__gelesen; die Zeile vergleicht es mit den Schreib-Haken (die lebende Lage kann das Laden versetzen)
    window.__gelesen = [];
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
        const v = get.call(this, k);
        if (/^anazhRealmState_[^.]*$/.test(k) && typeof v === "string") window.__gelesen.push({ quelle: "platz", rec: rec(v) });
        return v;
    };
    const iget = IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get = function (k) {
        const req = iget.apply(this, arguments);
        if (!String(k).endsWith(".bak")) req.addEventListener("success", () => { const v = req.result; if (v && typeof v.json === "string") window.__gelesen.push({ quelle: "idb", at: v.at, rec: rec(v.json) }); });
        return req;
    };
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
        set.call(this, k, v);
        if (/^anazhRealmState_[^.]*$/.test(k)) melde("platz", v);
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        const req = put.apply(this, arguments);
        if (!String(k).endsWith(".bak") && v && typeof v.json === "string") {
            this.transaction.addEventListener("complete", () => melde("fest", v.json));
            melde("idb", v.json);
        }
        return req;
    };
}

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
    const page = (await browser.pages())[0];
    const log = [];
    page.on("console", (m) => log.push(m.text()));
    await page.evaluateOnNewDocument(haken);
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate(async () => {
        while (!(window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa)) await new Promise((r) => setTimeout(r, 250));
    });
    await page.bringToFront();
    const cdp = await page.target().createCDPSession();
    return { browser, page, cdp, log, bootMs: Date.now() - t0 };
}
const taste = (cdp, typ) => cdp.send("Input.dispatchKeyEvent", { type: typ, code: "KeyW", key: "w", windowsVirtualKeyCode: 87, text: typ === "keyDown" ? "w" : undefined });
async function klick(cdp) {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await cdp.send("Input.dispatchMouseEvent", { type, x: 960, y: 540, button: "left", clickCount: 1 });
}
const toeten = (b) => spawnSync("taskkill", ["/F", "/T", "/PID", String(b.process().pid)]);
const geladen = (page) =>
    page.evaluate(() => {
        const r = window.anazhRealm, st = r.state, p = st.playerMesh.position;
        return { x: Math.round(p.x * 1e3), z: Math.round(p.z * 1e3), b: (st.architectures || []).filter((a) => a.type === "stein_block").length, e: (st.worldMeta.voxelEdits || []).length, w: st.worldMeta.worldId };
    });

const ERW = process.env.K1_ERW ? JSON.parse(process.env.K1_ERW) : { 1: "erwachen-hart", 2: "erwachen-idb" }; // K1_ERW={"1":"erwachen-fest"}: der Tod nach dem festen Stand mit geschlossenem Gang
const erwecke = (page) =>
    page.evaluate(() => {
        const r = window.anazhRealm, st = r.state, p = st.playerMesh.position, A = r.constructor._siedlungGesetz();
        const cx0 = Math.floor(p.x / A.cellM), cz0 = Math.floor(p.z / A.cellM), res = (st.worldMeta && st.worldMeta.settlementCells) || {};
        let best = null;
        for (let dx = -3; dx <= 3; dx++)
            for (let dz = -3; dz <= 3; dz++) {
                const i = r._autoSettlementCellInfo(cx0 + dx, cz0 + dz);
                if (!i || res[i.key]) continue;
                const d = Math.hypot(i.x - p.x, i.z - p.z);
                if (!best || d < best.d) best = { i, d, cx: cx0 + dx, cz: cz0 + dz };
            }
        if (!best) return { fehler: "keine freie Dorf-Zelle im Umkreis" };
        window.__erw = { key: best.i.key, nH: best.i.nH, x: best.i.x, z: best.i.z };
        r._autoSettlementSpawnCell(best.cx, best.cz, best.i);
        return { key: best.i.key, nH: best.i.nH, d: Math.round(best.d) };
    });
const gangLebt = (page) => page.evaluate(() => { const q = window.anazhRealm._autoSettlementQueue; return !!(q && q.gang); }).catch(() => false);
const dorfStand = (page, e) =>
    page.evaluate((e) => {
        const st = window.anazhRealm.state, res = (st.worldMeta.settlementCells || {})[e.key];
        return { reserviert: !!res, haeuser: (st.architectures || []).filter((a) => /^haus_/.test(a.type) && Math.hypot(a.position.x - e.x, a.position.z - e.z) < 260).length };
    }, e);

(async () => {
    const server = statikServer(process.env.ROOT ? { root: process.env.ROOT } : {});
    await new Promise((r) => server.listen(PORT, r));
    const profil = path.join(S, "profil-echt-k1-" + TAG);
    const alle = [];
    const zyklen = [];
    const saveMs = [];
    let bilder = 0;
    let vorher = null;
    const vorherListe = [];
    for (let z = 0; z <= N; z++) {
        const o = await oeffne(profil, z === 0);
        const g = await geladen(o.page);
        if (process.env.K1_LOG) fs.writeFileSync(path.join(S, `k1-log-${TAG}-z${z}.txt`), o.log.filter((t) => !t.startsWith("__W__")).join(String.fromCharCode(10)));
        const zeile = { z, bootMs: o.bootMs, g, befund: o.log.filter((t) => /ließ sich nicht laden|korrupt|unlesbar|Welt aus \.bak/i.test(t)).map((t) => t.slice(0, 160)) };
        for (const t of o.log) if (t.startsWith("__W__ ")) alle.push(JSON.parse(t.slice(6)));
        o.page.on("console", (m) => {
            const t = m.text();
            if (t.startsWith("__W__ ")) alle.push(JSON.parse(t.slice(6)));
            if (t === "__TOD__" && !tot) (tot = Date.now()), toeten(o.browser);
        });
        let tot = null;
        if (vorher) {
            const ganz = alle.filter((e) => e.t <= vorher.tot + 1000 && e.rec && e.rec.x === g.x && e.rec.z === g.z && e.rec.b === g.b && e.rec.e === g.e);
            zeile.alterS = ganz.length ? Math.max(0, vorher.tot - Math.max(...ganz.map((e) => e.t))) / 1000 : null; // der Haken-Tod kommt in Node bis 0,3 s nach dem Schreiber an
            zeile.verlorenBloecke = vorher.bMax - g.b; zeile.verlorenEdits = vorher.eMax - g.e; // Blöcke, die vor dem Tod in einem FESTEN Schreiben lagen, aber nicht kamen
            zeile.gelesen = await o.page.evaluate(() => window.__gelesen || []).catch(() => []);
            // der gelesene Stand gegen die Schreib-Haken: trägt er ein festes Schreiben, ist die Abweichung der lebenden Lage eine
            // Versetzung NACH dem Laden (Lage in mm), nie ein ungesehener Schreiber
            const passt = (r) => alle.filter((e) => e.t <= vorher.tot + 1000 && e.rec && r && e.rec.x === r.x && e.rec.z === r.z && e.rec.b === r.b && e.rec.e === r.e);
            for (const l of zeile.gelesen) {
                const m = passt(l.rec);
                l.geschrieben = m.length ? m[m.length - 1].art : null;
                l.alterS = m.length ? Math.max(0, vorher.tot - Math.max(...m.map((e) => e.t))) / 1000 : null;
                l.versetztMm = l.rec ? Math.round(Math.hypot(l.rec.x - g.x, l.rec.z - g.z)) : null;
            }
            // DAS ALTER AM GELESENEN STAND: das erste Lesen, das ein Schreiben trug (IndexedDB vor dem Abbild), misst das Alter; die lebende
            // Lage nach dem Laden darf davon abweichen (kontakt-tempo schiebt Leiber auseinander) — die Versetzung ist eine eigene Zahl
            const traeger = zeile.gelesen.find((l) => l.geschrieben && l.quelle === "idb") || zeile.gelesen.find((l) => l.geschrieben);
            if (traeger) {
                zeile.versetztMm = traeger.versetztMm;
                if (zeile.alterS == null) (zeile.alterS = traeger.alterS), (zeile.alterAm = "gelesen");
            }
            zeile.eGeladen = g.e; // die Station urteilt: entstand in keinem Zyklus ein Edit, ist die Sonde blind (ROT)
            zeile.tod = vorher.art;
            if (vorher.erw && vorher.erw.key) {
                zeile.dorfGeladen = await dorfStand(o.page, vorher.erw);
                await warte(10000);
                zeile.dorfNach10s = await dorfStand(o.page, vorher.erw);
            }
        }
        if (z === N) {
            // DAS BEWEISBILD: der Spieler steht, wo der letzte feste Stand ihn ließ, Blick nach rechts auf die Blöcke
            try {
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
            } catch (e) { zeile.bildFehler = String((e && e.message) || e).slice(0, 200); console.log("BILD-FEHLER " + zeile.bildFehler); } // das Beweisbild zählt nicht in das Urteil: Alter und Dorf stehen schon
            { const w = await o.page.evaluate(() => ({ s: window.__save, b: window.__bilder })); saveMs.push(...w.s); bilder += w.b; }
            zyklen.push(zeile);
            await o.browser.close();
            break;
        }
        await klick(o.cdp);
        await warte(500);
        await taste(o.cdp, "keyDown");
        const bauFehler = (zeile.bauFehler = []); // was der Bauer wirft, ausser dem Tod selbst (Target closed beim Kill)
        const bauer = setInterval(() => {
            o.page
                .evaluate(() => {
                    const r = window.anazhRealm, p = r.state.playerMesh.position;
                    // der Bau des Spielers: dasselbe Urteil wie das Setzen im Bau-Modus (`_setzUrteil`: Natur-Wand im Grundriss, Werkstatt,
                    // Material zählt nicht, es ist Wirtschaft, nie Speicher) — der Fels-Block steht nie auf der Lichtung oder in einem Haus (das Laden räumte ihn dort, Grundriss)
                    const ziel = { x: p.x + 6, y: r._terrainMacroSurfaceY(p.x + 6, p.z), z: p.z }, u = r._setzUrteil("stein_block", ziel, true);
                    if (u.ok || u.grund === "material") r.spawnArchitecture("stein_block", ziel, { silent: true });
                    else (window.__absage = window.__absage || {})[u.grund] = ((window.__absage || {})[u.grund] || 0) + 1;
                    // editform-kern benannte carveVoxelSphere in carveVoxel um: beide Namen, damit die Sonde an jedem Baum gräbt
                    (r.carveVoxel || r.carveVoxelSphere).call(r, p.x - 5, r._terrainMacroSurfaceY(p.x - 5, p.z), p.z, 1.5);
                })
                .catch((e) => {
                    // der Catch laeuft in Node, nicht in der Seite; der Kill selbst ist kein Baufehler
                    const t = String(e);
                    if (!/closed|Target|Session|detached|Execution context/i.test(t)) bauFehler.push(t.slice(0, 160));
                });
        }, 1500);
        const art = ERW[z] || (z % 2 === 0 ? ["idb", "fest", "platz"][(z >> 1) % 3] : "zufall");
        await warte(6000 + Math.random() * 12000);
        let erw = null;
        if (ERW[z]) {
            erw = await erwecke(o.page);
            const e0 = await o.page.evaluate(() => window.__erw || null);
            if (e0) Object.assign(erw, e0);
            let lebt = false;
            for (let i = 0; i < 600 && !(lebt = await gangLebt(o.page)); i++) await warte(50);
            erw.gangAktiv = lebt;
            zeile.erwachen = erw;
        }
        { const w = await o.page.evaluate(() => { const b = window.__bilder; window.__bilder = 0; return { s: window.__save.splice(0), b }; }); saveMs.push(...w.s); bilder += w.b; }
        if (art === "zufall" || art === "erwachen-hart") (tot = Date.now()), toeten(o.browser);
        else if (art === "erwachen-idb" || art === "erwachen-fest") {
            await o.page.evaluate((a) => { window.__tod = (e) => e.art === a; window.anazhRealm.saveState(); }, art.slice(9)).catch(() => {});
            for (let i = 0; i < 400 && !tot; i++) await warte(50);
            if (!tot) (zeile.verfehlt = true), (tot = Date.now()), toeten(o.browser);
        }
        else {
            await o.page.evaluate((a) => (window.__tod = (e) => e.art === a), art).catch(() => {});
            for (let i = 0; i < 400 && !tot; i++) await warte(50);
            if (!tot) (zeile.verfehlt = true), (tot = Date.now()), toeten(o.browser);
        }
        clearInterval(bauer);
        await new Promise((ok) => (o.browser.process().exitCode != null ? ok() : o.browser.process().once("exit", ok)));
        // was vor dem Tod FEST lag (IDB-Transaktion fertig): die meisten Blöcke
        const fest = alle.filter((e) => e.art === "fest" && e.t <= tot && e.t >= tot - 60000);
        vorherListe.push(tot);
        vorher = { tot, art, erw, bMax: fest.length ? Math.max(g.b, ...fest.map((e) => e.rec.b)) : g.b, eMax: fest.length ? Math.max(g.e, ...fest.map((e) => e.rec.e)) : g.e };
        zyklen.push(zeile);
        console.log(`z${z} ${art} boot=${o.bootMs} geladen=${JSON.stringify(g)} alter=${zeile.alterS} verloren=${zeile.verlorenBloecke} ${zeile.dorfGeladen ? "dorf=" + JSON.stringify(zeile.dorfGeladen) + "/" + JSON.stringify(zeile.dorfNach10s) : ""} ${zeile.erwachen ? "erw=" + JSON.stringify(zeile.erwachen) : ""} ${zeile.befund.join("|")}`);
        await warte(1500);
    }
    // saveMs der getöteten Seiten fehlen (die Seite starb); die letzte Sitzung trägt sie nicht — darum je Zyklus vor dem Tod?
    const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)].toFixed(2) : null; };
    const urteil = zyklen.filter((x) => x.tod);
    const erg = {
        tode: urteil.length,
        alterMax: Math.max(...urteil.map((x) => x.alterS == null ? 999 : x.alterS)),
        ueber10: urteil.filter((x) => x.alterS == null || !(x.alterS <= 10)).length,
        halbe: urteil.filter((x) => x.alterS == null || x.verlorenBloecke > 0 || x.verlorenEdits > 0).length,
        korrupt: zyklen.filter((x) => x.befund.length).length,
        ohneAlter: zyklen.filter((x) => x.tod && x.alterS == null).map((x) => ({ z: x.z, tod: x.tod, g: x.g, gelesen: x.gelesen })),
        versetztMaxMm: Math.max(0, ...zyklen.map((x) => x.versetztMm || 0)),
        alterAmGelesen: zyklen.filter((x) => x.alterAm === "gelesen").map((x) => ({ z: x.z, alterS: x.alterS, versetztMm: x.versetztMm })),
        bauFehler: zyklen.reduce((n, x) => n + (x.bauFehler || []).length, 0),
        erwachen: zyklen.filter((x) => x.erwachen || x.dorfGeladen).map((x) => ({ z: x.z, erwachen: x.erwachen, tod: x.tod, alterS: x.alterS, dorfGeladen: x.dorfGeladen, dorfNach10s: x.dorfNach10s })),
        saveRufe: saveMs.length,
        saveMs: { p50: q(saveMs, 0.5), p95: q(saveMs, 0.95), max: q(saveMs, 1) },
        bilder,
        jeBild: (() => { const a = saveMs.concat(new Array(Math.max(0, bilder - saveMs.length)).fill(0)); return { p95: q(a, 0.95), p99: q(a, 0.99), mittel: a.length ? +(saveMs.reduce((x, y) => x + y, 0) / a.length).toFixed(4) : null }; })(),
        zyklen,
        alle,
        todZeiten: vorherListe,
    };
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    console.log("ERGEBNIS", JSON.stringify({ ...erg, zyklen: undefined }));
    server.close();
    process.exit(0);
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
