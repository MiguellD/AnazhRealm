#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-persistence.cjs — DIE PERSISTENZ-HÄRTUNG (npm run gate:persistence)
//
// (T) DER TAB-TOD urteilt den Browser-Pfad, der KORPUS den Lade-Pfad über die Versionen, (S) (C) den save-server.
//
// (V) DER KORPUS (speicher.K5): je Versions-Stufe der localStorage, den ihre Version nach Werken (zwei auf der Lichtung, ein
// Studio-Haus mit Zahlen-id), Grabe-Hieben und Inventar mit ihrem saveState schrieb (`spec/speicher-korpus/<version>.json.br`).
// Jeder lädt am Kopf durch den Boot des Spielers, und der Save des Kopfs trägt jeden Bau an seinem Ort in seiner Höhe über
// Grund, jede Grube am Boden, jeden Slot — daraus (U) der Boden-Umzug (K16), (W) die Lichtung, (K) das kalte Buch. Der Save
// des Kopfs aus dem jüngsten Stand lädt im selben Lauf, `--stufe` (bump-version.cjs) schreibt ihn als Stand der Stufe.
// `--selftest`: eine Migration lässt ein Feld fallen (`VERLUST`) oder der Räumer fragt den Stoff — ROT.
//
// (S) DER SERVER SCHREIBT GANZ (K23): der save-server läuft in einer Sandbox-Kopie, ein Stand (≈ 1 MB) geht an
// /api/save-state, und der Prozess stirbt (SIGKILL) an JEDEM Schreib-Punkt einmal — mitten in jedem Schreiben (die
// halbe Last liegt) und nach jedem Schreiber (ein Vorlade-Haken zählt writeFile · copyFile · rename). Danach liegt
// der alte ODER der neue Stand ganz da (JSON parst, Marker alt|neu), und nach dem vollen Save hält
// `anazhRealmState.json.bak` den Stand davor. Täter, wenn ROT: das direkte `fs.writeFile` aufs Ziel (save-server.js).
// `--selftest` setzt in der Kopie das direkte Schreiben wieder ein (`schreibeGanz` → fs.writeFile) und MUSS rot werden.
// Ports: PERSISTENCE_PORT (Seite, Standard 4326), PERSISTENCE_SERVER_PORT (Sandbox-Server, Standard 4327).
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser, nullRenderer, startProc, sleep, ROOT: root } = require("./lib/welt-boot.cjs");
const http = require("http");
const { spawnSync } = require("child_process");
const zlib = require("zlib");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Port über PERSISTENCE_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4326.
const PORT = Number(process.env.PERSISTENCE_PORT || 4326);
const SERVER_PORT = Number(process.env.PERSISTENCE_SERVER_PORT || 4327);
const SELBSTTEST = process.argv.includes("--selftest");
const NUR_STUFE = process.argv.includes("--stufe");

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
const o = { wfs: fs.writeFileSync };
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

// Der save-server (Quelltext `quelle`) in einem frischen Sandbox-Ordner mit `dateien`; der Start urteilt am Ereignis (welt-boot
// `startProc`: bereit oder beendet, nie eine Frist). `frage(weg, kopf, körper)` → {status, etag, cc, n}, abgerissen ohne Antwort.
async function sandbox(quelle, dateien, env = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "k23-save-"));
    for (const [n, t] of Object.entries({ "save-server.js": quelle, ...dateien }))
        fs.writeFileSync(path.join(dir, n), t, "utf8");
    const vor = dateien["k23-haken.js"] ? ["-r", path.join(dir, "k23-haken.js")] : [];
    const proc = await startProc(
        path.join(dir, "save-server.js"),
        /Save-Server/i,
        { PORT: String(SERVER_PORT), ...env },
        { vor, cwd: dir }
    );
    const frage = (weg, headers = {}, body) =>
        new Promise((ok) => {
            const req = http.request(
                {
                    host: "127.0.0.1",
                    port: SERVER_PORT,
                    path: weg,
                    method: body ? "POST" : "GET",
                    headers,
                },
                (res) => {
                    let n = 0;
                    res.on("data", (c) => (n += c.length));
                    res.on("end", () =>
                        ok({
                            status: res.statusCode,
                            etag: res.headers.etag || null,
                            cc: res.headers["cache-control"] || null,
                            n,
                        })
                    );
                }
            );
            req.on("error", () => ok({ status: "abgerissen" }));
            req.end(body);
        });
    const beendet = new Promise((ok) => proc.on("exit", ok));
    // das Ende: der Prozess stirbt, `lesen` liest den Ordner, dann fällt er
    const zu = async (lesen = () => null) => {
        proc.kill("SIGKILL");
        await Promise.race([beendet, sleep(5000)]);
        const aus = lesen();
        fs.rmSync(dir, { recursive: true, force: true });
        return aus;
    };
    return { dir, frage, zu };
}
// (S) Ein Lauf: der save-server (Quelltext `quelle`) in einem frischen Sandbox-Ordner, der alte Stand liegt als Datei, ein
// neuer Stand (≈ 1 MB) geht an /api/save-state; `tod` = der Schreib-Punkt, an dem der Prozess stirbt (0 = nie).
async function serverLauf(quelle, tod) {
    const alt = JSON.stringify({ marker: "alt", n: 1 });
    const { dir, frage, zu } = await sandbox(
        quelle,
        { "k23-haken.js": HAKEN, "anazhRealmState.json": alt },
        { K23_TOD: String(tod) }
    );
    const ziel = path.join(dir, "anazhRealmState.json");
    const blob = [];
    for (let i = 0; i < 9000; i++) blob.push(`zeile-${i}-` + "x".repeat(96));
    const body = JSON.stringify({ state: { marker: "neu", blob } });
    const kopf = {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
    };
    const { status } = await Promise.race([
        frage("/api/save-state", kopf, body),
        sleep(30000).then(() => ({ status: "zeitlos" })),
    ]);
    const lies = (f) => {
        try {
            const j = JSON.parse(fs.readFileSync(f, "utf8"));
            return j && (j.marker === "alt" || j.marker === "neu") ? j.marker : "fremd";
        } catch (_e) {
            return fs.existsSync(f) ? `zerrissen (${fs.statSync(f).size} B)` : "fehlt";
        }
    };
    return zu(() => ({ tod, status, getoetet: status !== 200, ziel: lies(ziel), bak: lies(ziel + ".bak") }));
}

// (C) DER CACHE-KOPF AM ECHTEN SERVER (1310-16): der save-server (Quelltext `quelle`) in einem Sandbox-Ordner mit einer
// gestempelten Skript-Datei. Jede statische Antwort trägt einen ETag des Inhalts und `Cache-Control: no-cache`; die Frage mit
// `If-None-Match` bekommt 304 ohne Körper; ändert sich der Inhalt bei GLEICHEM Stempel, ändert sich der ETag (kein alter Code
// unter derselben Version).
async function cacheProbe(quelle) {
    const { dir, frage: hole, zu } = await sandbox(quelle, { "probe.js": "window.__probe = 1;\n" });
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
        await zu();
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
        if (++t % 2 === 0) (n[0]++, r.carveVoxel(lx, r._terrainMacroSurfaceY(lx, lz) - 2, lz, 3));
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
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, {
            waitUntil: "domcontentloaded",
            timeout: 120000,
        });
        const g = (zeile.geladen = await page.evaluate(async () => {
            const r = await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId);
            const loch = (o) => r._terrainDensityAt(o.x, o.y, o.z) + o.r; // das Zentrum liegt r m in der Luft (die Säule)
            const g0 = window.__ttRec({
                ...r.state,
                playerPosition: r.state.playerMesh.position,
            });
            return {
                ...g0,
                l: (r.state.worldMeta.voxelEdits || []).filter((o) => loch(o) < 0.01).length,
            };
        }));
        if (g.l !== g.e) zeile.befund.push(`Löcher: ${g.l}/${g.e}`);
        const tDa = Date.now();
        if (vorher) {
            const ganz = alle.filter(
                (e) => e.t <= vorher.tot && e.rec && "wxzeb".split("").every((k) => e.rec[k] === g[k])
            );
            zeile.alterS = ganz.length ? (vorher.tot - Math.max(...ganz.map((e) => e.t))) / 1000 : null;
            Object.assign(zeile, {
                tod: vorher.art,
                halb: !ganz.length || g.w !== vorher.w,
            });
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
        // die Linie wächst je Zyklus in Löchern, nie in Wanduhr (Lehre 26)
        const soll = Math.ceil((300 * (z - von + 1)) / (bis - von + 1));
        for (let i = 0; i < 1200 && g.e + (await page.evaluate(() => window.__ttN[0])) < soll; i++) await sleep(50);
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
const [KORPUS, STUFE] = [path.join(root, "spec", "speicher-korpus"), require("../package.json").version];

// Was ein Save trägt (die Bauten des Stands nach Id), wie seine Version ihn schrieb — ein Slot ohne Art fiel schon dort.
const korpusSlot = (x) => (x.material || x.blueprintName) + "×" + x.count;
const korpusSave = (ls) => JSON.parse(ls["anazhRealmState_" + ls.anazhRealmActiveWorld]);
function korpusSoll(k) {
    const s = korpusSave(k.ls);
    return {
        welt: s.worldMeta.worldId,
        boden: s.bodenGeneration,
        bauten: k.bauten
            .map((id) => s.architectures.find((a) => a.id === id))
            .map((a) => [a.type, a.position.x, a.position.z, a.ueberGrund]),
        edits: s.worldMeta.voxelEdits.map((e) => [e.x, e.z]),
        inventar: s.playerInventory.filter((x) => x && (x.material || x.blueprintName)).map(korpusSlot),
    };
}
// Am Kopf: liegt die Grube je Edit am Boden (die Oberfläche unter dem Gesetz)? Dann der Save des Kopfs (Material dazu, fehlt es).
async function korpusIst(s) {
    const r = await window.__weltDa((x) => x.state.worldMeta.worldId === s.welt);
    if (!r.state.player.inventory.some((x) => x && x.kind === "material")) r.addMaterialToInventory("stein", 5);
    r.saveState();
    return {
        alt: s.boden !== globalThis.__gelaendeCore.BODEN_GENERATION,
        umzug: !!r.state.bodenUmzug,
        kalt: window.__korpusKalt,
        fuss: r.constructor.PLAYER_FOOT_OFFSET,
        gruben: s.edits.map(([x, z]) => r._voxelSurfaceY(x, z) < r._terrainMacroSurfaceY(x, z) - 1),
        neu: { version: r.constructor.VERSION, ls: { ...localStorage } },
    };
}
// Der Haken am Laden aus dem Speicher, gleich vor dem Bau-Restore: blockiert das kalte Buch? Im Selbsttest die Pflanze.
const VERLUST = ["architectures", "worldMeta.voxelEdits", "playerInventory", "_weichtDemBau"];
function korpusHaken(feld) {
    Object.defineProperty(window, "anazhRealm", {
        configurable: true,
        set(r) {
            const lies = r._loadStateLoadFromStorage;
            r._loadStateLoadFromStorage = function () {
                window.__korpusKalt = !r.spawnArchitecture("haus_griechisch", { x: 1e4, y: 0, z: 1e4 }, { seed: 9 });
                const [s, [a, b]] = [lies.call(this), String(feld).split(".")];
                if (a === "_weichtDemBau") r[a] = (e) => r._istNatur(e);
                else if (feld) delete (b ? s[a] : s)[b || a];
                return s;
            };
            Object.defineProperty(window, "anazhRealm", { value: r, writable: true });
        },
    });
}
// Je Stand eine Seite, sein localStorage hinein (IndexedDB trug denselben Stand), der Boot des Spielers.
async function korpusLauf(selbst) {
    const alle = fs
        .readdirSync(KORPUS)
        .map((f) => JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(KORPUS, f)))));
    const [browser, zeilen] = [await starteBrowser({ art: "null" }), []];
    alle.sort((a, b) => a.version.localeCompare(b.version, "en", { numeric: true }));
    const port = server.address().port;
    for (const [i, k] of (selbst ? alle.slice(0, VERLUST.length) : NUR_STUFE ? alle.slice(-1) : alle).entries()) {
        const [page, s] = [await browser.newPage(), korpusSoll(k)];
        await nullRenderer(page);
        await page.evaluateOnNewDocument(korpusHaken, selbst ? VERLUST[i] : null);
        await page.goto(`http://127.0.0.1:${port}/cores.manifest.json`);
        await page.evaluate((ls) => Object.assign((localStorage.clear(), localStorage), ls), k.ls);
        await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
        const ist = await page.evaluate(korpusIst, s);
        await page.close();
        const kopf = korpusSave(ist.neu.ls);
        const inv = kopf.playerInventory.filter(Boolean).map(korpusSlot);
        const bauten = s.bauten.map(([t, x, z, ue]) =>
            kopf.architectures.find(
                (a) =>
                    a.type === t &&
                    a.position.x === x &&
                    a.position.z === z &&
                    Math.abs(a.ueberGrund - (ue ?? ist.fuss)) <= 0.05
            )
        );
        const z = { ...ist, version: k.version + (k.kopf ? " Kopf" : ""), kopf: k.kopf, da: bauten.map(Boolean) };
        // eine Grube steht nur, wo ihr Edit steht; ein Schreiber, der Edits verliert, fällt am Stand des Kopfs im selben Lauf
        z.n = [
            bauten.filter(Boolean).length,
            ist.gruben.filter(Boolean).length,
            s.inventar.filter((x) => inv.includes(x)).length,
        ];
        z.soll = [s.bauten.length, s.edits.length, s.inventar.length];
        z.ganz = z.soll.every((x, j) => x > 0 && z.n[j] === x);
        if (!k.kopf && z.ganz && k === alle.at(-1)) {
            const datei = path.join(KORPUS, ist.neu.version + ".json.br");
            const neu = { ...ist.neu, bauten: bauten.map((a) => a.id) };
            if (NUR_STUFE && !fs.existsSync(datei))
                fs.writeFileSync(datei, zlib.brotliCompressSync(JSON.stringify(neu)));
            alle.push({ ...neu, kopf: true });
        }
        console.log(`  [V] ${z.version}${selbst ? " ohne " + VERLUST[i] : ""}: ${korpusZahl([z])}`);
        zeilen.push(z);
    }
    await browser.close();
    return zeilen;
}
const korpusZahl = (l) =>
    ["Bauten", "Gruben", "Inventar"]
        .map((w, j) => `${w} ${l.reduce((s, x) => s + x.n[j], 0)}/${l.reduce((s, x) => s + x.soll[j], 0)}`)
        .join(" · ");
function korpusUrteil(z, selbst) {
    const zeile = (name, f, l = z) => ({
        name: `${name} ${l.filter(f).length}/${l.length}`,
        pass: l.length > 0 && l.every(f),
    });
    const [alt, gleich, licht] = [z.filter((x) => x.alt), z.filter((x) => !x.alt), (x) => x.da[0] && x.da[1]];
    const alte = z.filter((x) => !x.kopf).map((x) => x.version);
    return [
        zeile(
            `(V) Korpus: ${alte.length} Stände ${alte[0]} … ${alte.at(-1)} und ${z.length - alte.length} Kopf laden am Kopf — ${korpusZahl(z)} · ganz`,
            (x) => x.ganz
        ),
        {
            name: `(V) Versions-Stufe ${STUFE}: ihr Stand steht im Korpus (bump-version.cjs)`,
            pass: alte.includes(STUFE),
        },
        zeile("(U) Boden-Umzug: Stände eines alten Bodens stehen auf dem neuen", (x) => x.ganz && x.umzug, alt),
        zeile("(U) Gegenprobe: Stände desselben Bodens ziehen nicht um", (x) => !x.umzug, gleich),
        zeile("(W) Werke auf der Lichtung nach dem Reload, Stände", licht),
        zeile("(K) Gegenprobe: das kalte Buch blockiert beim Restore den frischen Studio-Spawn", (x) => x.kalt),
        zeile("(K) Reload mit kaltem Buch: das Haus mit Zahlen-id kehrt zurück", (x) => x.da[4]),
        ...(selbst
            ? [
                  zeile(
                      `(V) SELBSTTEST: eine Migration ohne ${VERLUST.slice(0, 3).join(" · ")} wird ROT`,
                      (x) => !x.ganz,
                      selbst.slice(0, 3)
                  ),
                  zeile(
                      "(W) SELBSTTEST: der Räumer nach Stoff nimmt sie, Stände ohne die Werke",
                      (x) => !licht(x),
                      selbst.slice(3)
                  ),
              ]
            : []),
    ];
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    if (NUR_STUFE) process.exit((await korpusLauf(false))[0].ganz ? 0 : 1);
    const tLauf = await tabTodProbe({ von: TT_VON, bis: TT_BIS });
    const tSelbst = SELBSTTEST ? await tabTodProbe({ von: 0, bis: 0, selbst: true }) : null;
    const korpus = korpusUrteil(await korpusLauf(false), SELBSTTEST ? await korpusLauf(true) : null);
    server.close();

    // (S) Der save-server schreibt ganz, (C) sein Cache-Kopf — im Selbsttest je die alte Art in der Kopie, die rot werden MUSS:
    // das direkte Schreiben aufs Ziel, der Kopf ohne Validator. Fehlt der Anker einer Verfälschung, greift sie nicht (ROT).
    const quelle = fs.readFileSync(path.join(root, "save-server.js"), "utf8");
    const verfaelscht = (anker, neu) => {
        if (quelle.includes(anker)) return quelle.replace(anker, neu);
        console.log(`⛔ SELBSTTEST: save-server.js trägt „${anker}" nicht — die Verfälschung greift nicht`);
        process.exit(1);
    };
    const [KOPF, CK] = [
        "function schreibeGanz(ziel, text, mitBak) {",
        "const kopf = statischerKopf(body, contentType);",
    ];
    let s, selbst, cache, cacheSelbst;
    try {
        s = await serverProbe(quelle);
        selbst =
            SELBSTTEST &&
            (await serverProbe(verfaelscht(KOPF, `${KOPF}\n    return fs.promises.writeFile(ziel, text, "utf8");`)));
        cache = await cacheProbe(quelle);
        cacheSelbst =
            SELBSTTEST &&
            (await cacheProbe(
                verfaelscht(CK, `const kopf = { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" };`)
            ));
    } catch (e) {
        console.log(`⛔ (S)/(C) save-server-Probe fehlgeschlagen: ${(e && e.message) || e}`);
        process.exit(2);
    }
    const sZeile = (p) =>
        `voll: Ziel ${p.voll.ziel}, .bak ${p.voll.bak} · Tod an Punkt ${p.kills.map((k) => `${k.tod} → ${k.ziel}`).join(", ")}`;
    const cZeile = (p) =>
        `erst ${p.erst.status} ETag ${p.erst.etag ? "ja" : "nein"} „${p.erst.cc || "—"}" · nachgefragt ${p.frisch.status} (${p.frisch.n || 0} B) · Inhalt geändert ${p.geaendert.status}${p.geaendert.etag && p.geaendert.etag !== p.erst.etag ? " neuer ETag" : ""}`;

    const checks = [
        ...korpus,
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
