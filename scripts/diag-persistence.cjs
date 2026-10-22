#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-persistence.cjs — DIE PERSISTENZ-HÄRTUNG (npm run gate:persistence)
//
// (T) DER TAB-TOD urteilt den Browser-Pfad, (K) (U) den Lade-Pfad, (S) (C) den save-server, (W) die Wiederkehr.
//
// (W) DIE WIEDERKEHR (speicher.K4): ein Werk des Spielers auf der Genesis-Lichtung steht nach dem Reload (Täter: `_weichtDemBau` nach Stoff).
//
// (K) DER RELOAD MIT KALTEM BUCH (06.10., V18.531): ein Studio-Haus der Welt (haus_*, Worldgen-id als ZAHL) muss
// den Restore überstehen, auch wenn das Studio-Buch noch nicht da ist. Gegenprobe (nicht vakuös): ein FRISCHER Spawn bei kaltem Buch bleibt blockiert.
// (U) DER BODEN-UMZUG (K16): ein Save eines alten Bodens (ohne Boden-Generation, ohne Höhe über Grund) lädt durch den
// ganzen Lade-Pfad (`loadState`) — jeder Bau steht danach auf dem Boden des Gesetzes in Fuß-Höhe. Gegenprobe: ein Save
// desselben Bodens bewegt nichts. Die Zahl: wie viele Bauten der Welt sich bewegen (`state.bodenUmzug`).
//
// (S) DER SERVER SCHREIBT GANZ (K23): der save-server läuft in einer Sandbox-Kopie, ein Stand (≈ 1 MB) geht an
// /api/save-state, und der Prozess stirbt (SIGKILL) an JEDEM Schreib-Punkt einmal — mitten in jedem Schreiben (die
// halbe Last liegt) und nach jedem Schreiber (ein Vorlade-Haken zählt writeFile · copyFile · rename). Danach liegt
// der alte ODER der neue Stand ganz da (JSON parst, Marker alt|neu), und nach dem vollen Save hält
// `anazhRealmState.json.bak` den Stand davor. Täter, wenn ROT: das direkte `fs.writeFile` aufs Ziel (save-server.js).
// `--selftest` setzt in der Kopie das direkte Schreiben wieder ein (`schreibeGanz` → fs.writeFile) und MUSS rot werden.
// Ports: PERSISTENCE_PORT (Seite, Standard 4326), PERSISTENCE_SERVER_PORT (Sandbox-Server, Standard 4327).
// ─────────────────────────────────────────────────────────────────────────
const {
    statikServer,
    starteBrowser,
    warteAufWelt,
    nullRenderer,
    startProc,
    ROOT: root,
} = require("./lib/welt-boot.cjs");
const http = require("http");
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Port über PERSISTENCE_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4326.
const PORT = Number(process.env.PERSISTENCE_PORT || 4326);
const SERVER_PORT = Number(process.env.PERSISTENCE_SERVER_PORT || 4327);
const SELBSTTEST = process.argv.includes("--selftest");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// (S) Der Tod an einem Schreib-Punkt: ein Vorlade-Haken (`node -r`) im Sandbox-Prozess zählt jeden Datei-Schreiber des
// Servers (writeFile · copyFile · rename, Rückruf-, Sync- und Promise-Form). Je Schreiber zwei Punkte: MITTEN (ein
// Schreiben legt die halbe Last ab, ein Kopieren/Umbenennen fällt aus) und DANACH (der Schreiber lief, dann der Tod).
// Am Punkt K23_TOD stirbt der Prozess mit SIGKILL — deterministisch, an JEDEM Punkt einmal.
const HAKEN = `"use strict";
const fs = require("fs");
const TOD = Number(process.env.K23_TOD || 0);
let n = 0;
const sterben = () => process.kill(process.pid, "SIGKILL");
const halb = (d) => (typeof d === "string" ? d.slice(0, d.length >> 1) : Buffer.from(d).subarray(0, d.length >> 1));
const o = { wfs: fs.writeFileSync, cfs: fs.copyFileSync, rns: fs.renameSync };
function punkt(mitten) {
    n++;
    if (n === TOD) { mitten(); sterben(); }
    n++;
    return n === TOD;
}
function haken(name, mitten) {
    const orig = fs[name];
    fs[name] = function (...a) {
        const danach = punkt(() => mitten(a));
        const cb = typeof a[a.length - 1] === "function" ? a.pop() : null;
        if (name.endsWith("Sync")) { const r = orig.apply(fs, a); if (danach) sterben(); return r; }
        return orig.call(fs, ...a, (...e) => { if (danach) sterben(); if (cb) cb(...e); });
    };
}
function hakenP(name, mitten) {
    const orig = fs.promises[name];
    fs.promises[name] = async function (...a) {
        const danach = punkt(() => mitten(a));
        const r = await orig.apply(fs.promises, a);
        if (danach) sterben();
        return r;
    };
}
const wMitte = (a) => { try { o.wfs.call(fs, a[0], halb(a[1])); } catch (_e) { /* */ } };
for (const nm of ["writeFile", "writeFileSync"]) haken(nm, wMitte);
for (const nm of ["copyFile", "copyFileSync", "rename", "renameSync"]) haken(nm, () => {});
hakenP("writeFile", wMitte);
hakenP("copyFile", () => {});
hakenP("rename", () => {});
`;

// (S) Ein Lauf: der save-server (Quelltext `quelle`) in einem frischen Sandbox-Ordner, der alte Stand liegt als Datei, ein
// neuer Stand (≈ 1 MB) geht an /api/save-state; `tod` = der Schreib-Punkt, an dem der Prozess stirbt (0 = nie).
async function serverLauf(quelle, tod) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "k23-save-"));
    const ziel = path.join(dir, "anazhRealmState.json");
    fs.writeFileSync(path.join(dir, "save-server.js"), quelle, "utf8");
    fs.writeFileSync(path.join(dir, "k23-haken.js"), HAKEN, "utf8");
    fs.writeFileSync(ziel, JSON.stringify({ marker: "alt", n: 1 }), "utf8");
    // der Start urteilt am Ereignis (welt-boot `startProc`: bereit oder beendet, nie eine Frist)
    const proc = await startProc(
        path.join(dir, "save-server.js"),
        /Save-Server/i,
        { PORT: String(SERVER_PORT), K23_TOD: String(tod) },
        { vor: ["-r", path.join(dir, "k23-haken.js")], cwd: dir }
    );
    let tot = false;
    const beendet = new Promise((r) => proc.on("exit", () => r((tot = true))));
    const blob = [];
    for (let i = 0; i < 9000; i++) blob.push(`zeile-${i}-` + "x".repeat(96));
    const body = JSON.stringify({ state: { marker: "neu", blob } });
    const status = await Promise.race([
        new Promise((resolve) => {
            const req = http.request(
                {
                    host: "127.0.0.1",
                    port: SERVER_PORT,
                    path: "/api/save-state",
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
                },
                (res) => {
                    res.resume();
                    res.on("end", () => resolve(res.statusCode));
                }
            );
            req.on("error", () => resolve("abgerissen"));
            req.end(body);
        }),
        sleep(30000).then(() => "zeitlos"),
    ]);
    if (!tot) proc.kill("SIGKILL");
    await Promise.race([beendet, sleep(5000)]);
    const lies = (f) => {
        try {
            const j = JSON.parse(fs.readFileSync(f, "utf8"));
            return j && (j.marker === "alt" || j.marker === "neu") ? j.marker : "fremd";
        } catch (_e) {
            return fs.existsSync(f) ? `zerrissen (${fs.statSync(f).size} B)` : "fehlt";
        }
    };
    const out = { tod, status, getoetet: status !== 200, ziel: lies(ziel), bak: lies(ziel + ".bak") };
    fs.rmSync(dir, { recursive: true, force: true });
    return out;
}

// (C) DER CACHE-KOPF AM ECHTEN SERVER (1310-16): der save-server (Quelltext `quelle`) in einem Sandbox-Ordner mit einer
// gestempelten Skript-Datei. Jede statische Antwort trägt einen ETag des Inhalts und `Cache-Control: no-cache`; die Frage mit
// `If-None-Match` bekommt 304 ohne Körper; ändert sich der Inhalt bei GLEICHEM Stempel, ändert sich der ETag (kein alter Code
// unter derselben Version). Bis 1310-16 sandte der Server keinen Validator — jeder Zweit-Boot lud 8,84 MB neu.
async function cacheProbe(quelle) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "k16-cache-"));
    fs.writeFileSync(path.join(dir, "save-server.js"), quelle, "utf8");
    fs.writeFileSync(path.join(dir, "probe.js"), "window.__probe = 1;\n", "utf8");
    // der Start urteilt am Ereignis (welt-boot `startProc`: bereit oder beendet, nie eine Frist)
    const proc = await startProc(
        path.join(dir, "save-server.js"),
        /Save-Server/i,
        { PORT: String(SERVER_PORT) },
        { cwd: dir }
    );
    const hole = (weg, kopf) =>
        new Promise((resolve) => {
            const req = http.request(
                { host: "127.0.0.1", port: SERVER_PORT, path: weg, method: "GET", headers: kopf || {} },
                (res) => {
                    let n = 0;
                    res.on("data", (c) => (n += c.length));
                    res.on("end", () =>
                        resolve({
                            status: res.statusCode,
                            etag: res.headers.etag || null,
                            cc: res.headers["cache-control"] || null,
                            n,
                        })
                    );
                }
            );
            req.on("error", () => resolve({ status: "abgerissen" }));
            req.end();
        });
    try {
        const a = await hole("/probe.js?v=1");
        const b = a.etag ? await hole("/probe.js?v=1", { "If-None-Match": a.etag }) : { status: null };
        fs.writeFileSync(path.join(dir, "probe.js"), "window.__probe = 2;\n", "utf8");
        const c = await hole("/probe.js?v=1", a.etag ? { "If-None-Match": a.etag } : {});
        return {
            erst: a,
            frisch: b,
            geaendert: c,
            ok:
                a.status === 200 &&
                !!a.etag &&
                /no-cache/.test(a.cc || "") &&
                !/immutable/.test(a.cc || "") &&
                b.status === 304 &&
                b.n === 0 &&
                c.status === 200 &&
                !!c.etag &&
                c.etag !== a.etag,
        };
    } finally {
        proc.kill("SIGKILL");
        await sleep(300);
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

// (S) Die Probe: der Tod an jedem Schreib-Punkt der Reihe nach, bis ein Lauf durchkommt (der volle Save; sein .bak hält
// den Stand davor). Ganz heißt: das Ziel parst und trägt alt oder neu — nie ein Bruchstück.
async function serverProbe(quelle) {
    const kills = [];
    let voll = null;
    for (let tod = 1; tod <= 24 && !voll; tod++) {
        const l = await serverLauf(quelle, tod);
        if (l.getoetet) kills.push(l);
        else voll = l;
    }
    const ganz = kills.filter((k) => k.ziel === "alt" || k.ziel === "neu").length;
    return {
        voll: voll || { ziel: "nie durch", bak: "-" },
        kills,
        ganz,
        vollOk: !!voll && voll.ziel === "neu" && voll.bak === "alt",
        killsOk: kills.length > 0 && ganz === kills.length,
    };
}

// (T) DER TAB-TOD (speicher.K1): kein save-server, EIN Profil; je Zyklus geht, schnitzt und baut der Spieler, dann stirbt der
// GANZE Browser hart — im Schreiber (Haken) oder zufällig. Der nächste Boot: dieselbe Welt, kein Korrupt-/Rettungs-Befund,
// der Stand ist EIN Schreiben, ≤ 10 s alt, kein halbes. PERSISTENCE_TABTOD=a-b (Standard 0-7). SELBSTTEST: der Platz in
// zwei Zügen, der Tod dazwischen.
const TT_HAKEN = ["idb", "fest", "platz", "zeiger"];
function ttHaken() {
    const rec = (window.__ttRec = (s) => ({
        w: (s.worldMeta || {}).worldId,
        x: Math.round(s.playerPosition.x * 1e3),
        z: Math.round(s.playerPosition.z * 1e3),
        e: (s.worldMeta.voxelEdits || []).length,
        b: (s.architectures || []).filter((a) => a.type === "stein_block").length,
    }));
    const n = (window.__ttN = [0, 0]); // Löcher, Blöcke des Treibers
    const melde = (art, json, nJetzt = n.slice()) => {
        let r = null;
        try {
            r = json && rec(JSON.parse(json));
        } catch (_e) {
            r = { kaputt: 1 };
        }
        const e = { t: Date.now(), art, rec: r, n: nJetzt };
        console.log("__TT__ " + JSON.stringify(e));
        if (window.__ttTod && window.__ttTod(e)) for (console.log("__TOD__"); ;); // der Faden steht IN diesem Schreiber, bis der Prozess stirbt
    };
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
        set.call(this, k, v);
        if (/^anazhRealmState_[^.]*$/.test(k)) melde("platz", v);
        else if (k === "anazhRealmWorlds" || k === "anazhRealmVersions") melde("zeiger");
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        const req = put.apply(this, arguments);
        if (!String(k).endsWith(".bak") && v && typeof v.json === "string") {
            const nPut = n.slice();
            this.transaction.addEventListener("complete", () => melde("fest", v.json, nPut));
            melde("idb", v.json);
        }
        return req;
    };
}
// Der Treiber: W gehalten, je 16 ms ein Takt, je zweiter ein Loch auf dem Raster (die Linie wächst über den FIFO-Deckel 256
// von K23, jedes Loch steht nach dem Laden), je 50. ein Block 40 m neben dem Weg (die Genesis-Lichtung räumt Basalt).
function ttTreiber(e0) {
    const r = window.anazhRealm;
    const n = window.__ttN;
    let t = 0;
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW", key: "w", bubbles: true }));
    setInterval(() => {
        const { x, z } = r.state.playerMesh.position;
        const [lx, lz] = [200 + ((e0 + n[0]) % 20) * 10, 200 + Math.floor((e0 + n[0]) / 20) * 10];
        if (++t % 2 === 0) (n[0]++, r.carveVoxelSphere(lx, r._terrainMacroSurfaceY(lx, lz) - 2, lz, 3));
        const ort = { x: x - 40, y: r._terrainMacroSurfaceY(x - 40, z), z };
        if (t % 50 === 0 && r.spawnArchitecture("stein_block", ort, { silent: true })) n[1]++;
        r._gameLoopTick(performance.now());
    }, 16);
}
function ttNichtAtomar() {
    const r = window.anazhRealm;
    const ganz = r._idbPutWorld.bind(r);
    r._idbPutWorld = async (id, json, at) => {
        const tx = (await r._idb()).transaction("worlds", "readwrite");
        tx.objectStore("worlds").put({ at, json: json.slice(0, json.length >> 1) }, id);
        await new Promise((ok) => (tx.oncomplete = ok));
        return ganz(id, json, at);
    };
}
function ttToeten(b) {
    try {
        if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(b.process().pid)]);
        else process.kill(-b.process().pid, "SIGKILL");
    } catch (_e) {}
}
async function tabTodProbe({ von, bis, selbst = false }) {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), "k1-tabtod-"));
    const alle = [];
    const zyklen = [];
    let vorher = null;
    for (let z = von; z <= bis + 1; z++) {
        const browser = await starteBrowser({
            art: "null",
            profil,
            erwartet: /Browser getrennt ohne Abbau|Target closed/,
        });
        const page = (await browser.pages())[0];
        const zeile = { z, befund: [] };
        let tot = null;
        const toeten = () => tot || ((tot = Date.now()), ttToeten(browser));
        page.on("console", (m) => {
            const t = m.text();
            if (t.startsWith("__TT__ ")) alle.push(JSON.parse(t.slice(7)));
            else if (t === "__TOD__") toeten();
            else if (/ließ sich nicht laden|korrupt|unlesbar|Welt aus \.bak/i.test(t))
                zeile.befund.push(t.slice(0, 200));
        });
        await nullRenderer(page);
        await page.evaluateOnNewDocument(ttHaken);
        const tGoto = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        const g = (zeile.geladen = await page.evaluate(async () => {
            const r = await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId);
            const loch = (o) =>
                Math.abs(r._terrainBaseDensityAt(o.x, o.y, o.z) - r._terrainDensityAt(o.x, o.y, o.z) - 48);
            const g0 = window.__ttRec({ ...r.state, playerPosition: r.state.playerMesh.position });
            return { ...g0, l: (r.state.worldMeta.voxelEdits || []).filter((o) => loch(o) < 0.01).length };
        }));
        if (g.l !== g.e) zeile.befund.push(`Löcher: ${g.l}/${g.e}`);
        const tDa = Date.now();
        if (vorher) {
            const ganz = alle.filter(
                (e) => e.t <= vorher.tot && e.rec && "wxzeb".split("").every((k) => e.rec[k] === g[k])
            );
            zeile.alterS = ganz.length ? (vorher.tot - Math.max(...ganz.map((e) => e.t))) / 1000 : null;
            Object.assign(zeile, { tod: vorher.art, halb: !ganz.length || g.w !== vorher.w });
        }
        // HALB: jeder Platz (synchron mit seinem Stand) trägt GENAU den Boot plus den Treiber
        const halbe = () => {
            const h = alle.find(
                (e) => e.art === "platz" && e.t >= tGoto && (e.rec.e !== g.e + e.n[0] || e.rec.b !== g.b + e.n[1])
            );
            if (h) zeile.befund.push(`halbes Schreiben: ${h.rec.e}/${h.rec.b} Edits/Bauten, geladen ${g.e}/${g.b}`);
        };
        zyklen.push(zeile);
        if (z > bis) {
            await sleep(1000);
            halbe();
            await browser.close();
            break;
        }
        const art = selbst ? "selbst" : z % 2 ? "zufall" : TT_HAKEN[(z >> 1) % TT_HAKEN.length];
        if (selbst) await page.evaluate(ttNichtAtomar);
        await page.evaluate(ttTreiber, g.e);
        // ein Haken wartet auf den ersten Takt-Platz; der Zufall fällt jederzeit
        const takt = () => alle.some((e) => e.art === "platz" && e.t > tDa);
        for (let i = 0; (art !== "zufall" || z === von) && i < 400 && !takt(); i++) await sleep(50);
        await sleep(1000 + Math.random() * 5000);
        if (art === "zufall") toeten();
        // scharf: der nächste Schreiber dieser Art hält den Faden an
        else
            await page.evaluate(
                (a) =>
                    (window.__ttTod = (e) =>
                        e.art === (a === "selbst" ? "fest" : a) && (a !== "selbst" || !!e.rec.kaputt)),
                art
            );
        for (let i = 0; i < 300 && !tot; i++) await sleep(50);
        if (!tot) ((zeile.hakenVerfehlt = true), toeten());
        const p = browser.process();
        await new Promise((ok) => ((p.exitCode ?? p.signalCode) != null ? ok() : p.once("exit", ok)));
        halbe();
        vorher = { tot, art, w: g.w };
        console.log(
            `  [T] ${z} Tod ${art} · geladen ${JSON.stringify(g)} · Alter ${zeile.alterS} s · ${zeile.befund.join(" | ")}`
        );
    }
    fs.rmSync(profil, { recursive: true, force: true });
    const urteil = zyklen.filter((x) => x.tod);
    const zahl = (f) => zyklen.filter(f).length;
    return {
        n: urteil.length,
        alt: urteil.filter((x) => !(x.alterS <= 10)).length,
        maxAlter: Math.max(...urteil.map((x) => x.alterS)),
        korrupt: zahl((x) => x.befund.some((b) => !b.startsWith("halbes"))),
        halb: zahl((x) => x.halb || x.befund.some((b) => b.startsWith("halbes"))),
        verfehlt: zahl((x) => x.hakenVerfehlt),
        linie: zyklen[zyklen.length - 1].geladen.e,
    };
}
const ttZeile = (t) =>
    `${t.n} Tode: Alter max ${t.maxAlter} s, ${t.alt} über 10 s · ${t.korrupt} korrupt · ${t.halb} halbe Welten · ${t.verfehlt} Haken verfehlt · Linie ${t.linie} Löcher`;
const ttOk = (t) => t.n > 0 && !t.alt && !t.korrupt && !t.halb && !t.verfehlt && t.linie > 256;
const [TT_VON, TT_BIS] = (process.env.PERSISTENCE_TABTOD || "0-7").split("-").map(Number);
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null" });
    const page = await browser.newPage();
    await nullRenderer(page, { foundry: true });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await warteAufWelt(page, 60000);
        out = {};
        // (W) zwei Werke auf der Lichtung (der Satz, der Bau-Modus), Save, echter Reload; Selbsttest: der Räumer nach Stoff lädt neu
        const w = (art) =>
            page.evaluate(async (art) => {
                const r = await window.__weltDa((x) => x._genesisPlattform());
                const G = r._genesisMitte();
                if (art === "setzen") {
                    r.dslRun(["spawn_blueprint", "stein_block", ["at", G.x + 15, r._voxelSurfaceY(G.x + 15, G.z), G.z]], { source: "human" });
                    r.spawnArchitecture("stein_block", { x: G.x, y: r._voxelSurfaceY(G.x, G.z + 15), z: G.z + 15 }, { id: r._newArchId() });
                    r.saveState();
                }
                if (art === "stoff") {
                    r._weichtDemBau = (e) => r._istNatur(e);
                    r._loadStateRestoreArchitectures(r.buildStateSnapshot());
                    delete r._weichtDemBau;
                }
                return r.state.architectures.filter((a) => a.type === "stein_block" && Math.hypot(a.position.x - G.x, a.position.z - G.z) < 16).length;
            }, art);
        out.w = { gesetzt: await w("setzen") };
        await sleep(1500); // der IDB-Put des Saves landet (ein Reload schneidet sonst den Schreiber ab)
        await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
        out.w.stehen = await w("laden");
        if (SELBSTTEST) out.w.selbst = await w("stoff");
        // (K) DER RELOAD MIT KALTEM BUCH: warten, bis das Studio-Buch die Häuser registriert hat, dann ein Haus mit
        // Zahlen-id setzen, den Snapshot bei kaltem Buch zurückspielen (der Zweit-Boot) und zählen.
        await page.waitForFunction(
            () => {
                const r = window.anazhRealm;
                return !!(r._foundry && r._foundry.ready && r.state.blueprints && r.state.blueprints.haus_griechisch);
            },
            { timeout: 120000 }
        );
        Object.assign(
            out,
            await page.evaluate(() => {
                const r = window.anazhRealm;
                const k = {};
                const id = 990001; // eine Zahlen-id (wie Worldgen) — der Spawn vergibt sie neu, gezählt wird die Stelle
                const istHaus = (a) =>
                    a &&
                    a.type === "haus_griechisch" &&
                    Math.abs(a.position.x - 52) < 0.01 &&
                    Math.abs(a.position.z - 52) < 0.01;
                const pos = { x: 52, y: r._voxelSurfaceY(52, 52), z: 52 };
                const haus = r.spawnArchitecture("haus_griechisch", pos, { seed: 9, precise: true, id });
                k.kGesetzt = !!haus;
                const snap = r.buildStateSnapshot();
                k.kImSnapshot = (snap.architectures || []).some(istHaus);
                const f = r._foundry;
                const warm = f.ready;
                f.ready = false; // der Zweit-Boot: der Stand lädt, bevor das Buch kommt
                try {
                    k.kFrischBlockiert =
                        r.spawnArchitecture("haus_griechisch", { x: 60, y: pos.y, z: 60 }, { seed: 9 }) === null;
                    r._loadStateRestoreArchitectures({ architectures: snap.architectures });
                } finally {
                    f.ready = warm;
                }
                k.kZurueck = (r.state.architectures || []).some(istHaus);
                k.kVorher = (snap.architectures || []).length;
                k.kNachher = (r.state.architectures || []).length;
                // (U) der alte Boden: jede Höhe 37,7 m daneben (die gemessene Verschiebung p50), ohne Generation und Höhe über Grund
                const alt = JSON.parse(JSON.stringify(r.buildStateSnapshot()));
                const gleich = JSON.parse(JSON.stringify(alt));
                delete alt.bodenGeneration;
                delete alt.spielerUeberGrund;
                for (const a of alt.architectures || []) {
                    delete a.ueberGrund;
                    if (a.position) a.position.y += 37.7;
                }
                const fehl = (liste) => {
                    let n = 0,
                        max = 0;
                    for (const a of liste || []) {
                        if (!a || !a.position) continue;
                        const g = r._voxelSurfaceY(a.position.x, a.position.z);
                        if (!Number.isFinite(g)) continue;
                        const d = Math.abs(a.position.y - (g + 0.5));
                        n++;
                        if (d > max) max = d;
                    }
                    return { n, max: Math.round(max * 100) / 100 };
                };
                r.state.bodenUmzug = null;
                r.loadState(alt);
                k.uAlt = fehl(r.state.architectures);
                k.uBericht = r.state.bodenUmzug || null;
                r.state.bodenUmzug = null;
                const vorGleich = (r.state.architectures || []).map((a) => a.position.y);
                r.loadState(gleich);
                k.uGleichBericht = r.state.bodenUmzug || null;
                k.uGleichN = vorGleich.length;
                return k;
            })
        );
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    const tLauf = await tabTodProbe({ von: TT_VON, bis: TT_BIS });
    const tSelbst = SELBSTTEST ? await tabTodProbe({ von: 0, bis: 0, selbst: true }) : null;
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Persistenz-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // (S) Der save-server schreibt ganz — und im Selbsttest die alte Schreib-Art in der Kopie, die rot werden MUSS.
    const quelle = fs.readFileSync(path.join(root, "save-server.js"), "utf8");
    let s = null;
    try {
        s = await serverProbe(quelle);
    } catch (e) {
        console.log(`⛔ (S) Server-Probe fehlgeschlagen: ${(e && e.message) || e}`);
        process.exit(2);
    }
    const sZeile = (p) =>
        `voll: Ziel ${p.voll.ziel}, .bak ${p.voll.bak} · Tod an Punkt ${p.kills.map((k) => `${k.tod} → ${k.ziel}`).join(", ")}`;
    let selbst = null;
    if (SELBSTTEST) {
        const KOPF = "function schreibeGanz(ziel, text, mitBak) {";
        if (!quelle.includes(KOPF)) {
            console.log(`⛔ SELBSTTEST: save-server.js trägt den Kopf „${KOPF}" nicht — die Verfälschung greift nicht`);
            process.exit(1);
        }
        const alt = quelle.replace(KOPF, `${KOPF}\n    return fs.promises.writeFile(ziel, text, "utf8");`);
        selbst = await serverProbe(alt);
    }
    // (C) Der Cache-Kopf am echten Server — und im Selbsttest der Kopf ohne Validator (der Stand vor 1310-16), der rot werden MUSS.
    let cache = null,
        cacheSelbst = null;
    try {
        cache = await cacheProbe(quelle);
        if (SELBSTTEST) {
            const CK = "const kopf = statischerKopf(body, contentType);";
            if (!quelle.includes(CK)) {
                console.log(`⛔ SELBSTTEST: save-server.js trägt „${CK}" nicht — die Verfälschung greift nicht`);
                process.exit(1);
            }
            cacheSelbst = await cacheProbe(
                quelle.replace(CK, `const kopf = { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" };`)
            );
        }
    } catch (e) {
        console.log(`⛔ (C) Cache-Probe fehlgeschlagen: ${(e && e.message) || e}`);
        process.exit(2);
    }
    const cZeile = (p) =>
        `erst ${p.erst.status} ETag ${p.erst.etag ? "ja" : "nein"} „${p.erst.cc || "—"}" · nachgefragt ${p.frisch.status} (${p.frisch.n || 0} B) · Inhalt geändert ${p.geaendert.status}${p.geaendert.etag && p.geaendert.etag !== p.erst.etag ? " neuer ETag" : ""}`;

    const checks = [
        {
            name: "(K) Gegenprobe: ein FRISCHER Studio-Spawn bei kaltem Buch bleibt blockiert (die Kalt-Probe wirkt)",
            pass: out.kGesetzt === true && out.kFrischBlockiert === true,
        },
        {
            name: `(K) Reload mit kaltem Buch: das Haus mit Zahlen-id kehrt zurück (Einträge ${out.kVorher} → ${out.kNachher})`,
            pass: out.kImSnapshot === true && out.kZurueck === true && out.kNachher === out.kVorher,
        },
        {
            name:
                `(U) Boden-Umzug: ein Save des alten Bodens steht auf dem neuen (${out.uAlt ? out.uAlt.n : "?"} Bauten, ` +
                `größte Abweichung von der Fuß-Höhe ${out.uAlt ? out.uAlt.max : "?"} m; Bericht ${JSON.stringify(out.uBericht)})`,
            pass:
                !!out.uAlt &&
                out.uAlt.n > 0 &&
                out.uAlt.max <= 0.05 &&
                !!out.uBericht &&
                out.uBericht.bewegt === out.uAlt.n,
        },
        {
            name: `(U) Gegenprobe: ein Save desselben Bodens zieht nicht um (Bericht ${JSON.stringify(out.uGleichBericht)})`,
            pass: out.uGleichBericht === null,
        },
        {
            name: `(W) Wiederkehr: die Werke des Spielers auf der Lichtung stehen nach dem Reload ${out.w.stehen}/${out.w.gesetzt} (Satz + Bau-Modus, r 15 m)${out.w.stehen < 2 ? " — Täter _weichtDemBau: Stoff statt Herkunft" : ""}`,
            pass: out.w.gesetzt === 2 && out.w.stehen === 2,
        },
        {
            name: `(S) save-server: ein voller Save hält den Stand davor im .bak (${sZeile(s)})`,
            pass: s.vollOk,
        },
        {
            name: `(S) save-server: ein Kill mitten im Schreiben lässt den alten oder neuen Stand GANZ (${s.ganz}/${s.kills.length})${s.killsOk ? "" : " — Täter: save-server.js schreibt direkt aufs Ziel (kein tmp + rename)"}`,
            pass: s.killsOk,
        },
        {
            name: `(T) Tab-Tod ohne save-server, Zyklen ${TT_VON}-${TT_BIS}: ${ttZeile(tLauf)}${ttOk(tLauf) ? "" : " — Täter: saveState (stamm/dienst.js)"}`,
            pass: ttOk(tLauf),
        },
        {
            name: `(C) save-server: jede statische Datei trägt ETag + no-cache, die Nachfrage bekommt 304, neuer Inhalt neuen ETag (${cZeile(cache)})${cache.ok ? "" : " — Täter: save-server.js sendStaticFile (statischerKopf)"}`,
            pass: cache.ok,
        },
    ];
    if (SELBSTTEST)
        checks.push(
            {
                name: `(W) SELBSTTEST: der Räumer nach Stoff (_weichtDemBau = die Art) nimmt die Werke beim Laden (${out.w.selbst}/${out.w.gesetzt})`,
                pass: out.w.selbst === 0,
            },
            {
                name: `(S) SELBSTTEST: die alte Schreib-Art (fs.writeFile aufs Ziel) wird ROT (${sZeile(selbst)})`,
                pass: !selbst.killsOk,
            },
            {
                name: `(C) SELBSTTEST: der Kopf ohne Validator wird ROT (${cZeile(cacheSelbst)})`,
                pass: !cacheSelbst.ok,
            },
            {
                name: `(T) SELBSTTEST: der Platz in zwei Zügen (Tod nach der halben Last) wird ROT (${ttZeile(tSelbst)})`,
                pass: tSelbst.korrupt > 0,
            }
        );
    console.log("\n=== Persistenz-Härtung (Tab-Tod, Lade-Pfad, save-server) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Persistenz-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die Persistenz-Härtung greift nicht — die Welt ist bei Korruption noch verlierbar.");
        process.exit(1);
    }
    console.log("✅ Die Welt überlebt Tod und korrupten Write — kein stiller Datenverlust.");
    process.exit(0);
})();
