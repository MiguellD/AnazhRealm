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
const { statikServer, starteBrowser, nullRenderer, startProc, sleep, ROOT: root, nullSeite, urteilEnde } = require("./lib/welt-boot.cjs");
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
const NUR_WEG = process.argv.includes("--weg");
const [WEG_KM, WEG_MIN] = (process.env.PERSISTENCE_WEG || "1-6").split("-").map(Number);
const EDITS = Number(process.env.PERSISTENCE_EDITS || 0);

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
const wMitte = (a) => { try { o.wfs.call(fs, a[0], halb(a[1])); } catch { /* */ } };
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
    const { status } = await Promise.race([
        frage(
            "/api/save-state",
            { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
            body
        ),
        sleep(30000).then(() => ({ status: "zeitlos" })),
    ]);
    const lies = (f) => {
        try {
            const j = JSON.parse(fs.readFileSync(f, "utf8"));
            return j && (j.marker === "alt" || j.marker === "neu") ? j.marker : "fremd";
        } catch {
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
// GANZE Browser hart — im Schreiber des Speicher-Fadens (Haken im Faden: der Put des Stands, das Ende seiner Transaktion) oder
// zufällig. Der nächste Boot: dieselbe Welt, kein Korrupt-/Rettungs-Befund, der Stand ist EIN Schreiben, ≤ 10 s alt, kein halbes.
// PERSISTENCE_TABTOD=a-b (Standard 0-7). SELBSTTEST: der Faden schreibt den halben Stand, der Tod nach seiner Transaktion.
const TT_HAKEN = ["idb", "fest"];
function ttHaken() {
    const rec = (window.__ttRec = (s) => ({
        w: (s.worldMeta || {}).worldId,
        x: Math.round(s.playerPosition.x * 1e3),
        z: Math.round(s.playerPosition.z * 1e3),
        e: s.voxelEdits ? s.voxelEdits.n : (s.worldMeta.voxelEdits || []).length,
        b: (s.architectures || []).filter((a) => a.type === "stein_block").length,
    }));
    window.__ttN = [0, 0]; // Löcher, Blöcke des Treibers
    // je Takt des Treibers [Zeit, Löcher, Blöcke]: ein Stand trägt die zu seinem Stempel (in derselben ms: davor oder danach)
    const reihe = (window.__ttReihe = [[0, 0, 0]]);
    const melde = (art, json, nJetzt) => {
        let r = null;
        try {
            r = json && rec(JSON.parse(json));
        } catch {
            r = { kaputt: 1 };
        }
        const e = { t: Date.now(), art, rec: r, n: nJetzt };
        console.log("__TT__ " + JSON.stringify(e));
        if (window.__ttTod && window.__ttTod(e)) for (console.log("__TOD__"); ;); // die Seite steht, bis der Prozess stirbt
    };
    new BroadcastChannel("tt").onmessage = ({ data: d }) =>
        melde(d.art, d.json, [reihe.findLast((x) => x[0] < d.at) || reihe[0], reihe.findLast((x) => x[0] <= d.at)]);
    // der Speicher-Faden („speicher") mit dem Vorspann `faden`: jeder Put eines Stands (idb) und das Ende seiner Transaktion
    // (fest) gehen an die Seite; eine scharfe Art (`tt`-Kanal der Seite) hält ihn IN diesem Schreiber, „selbst" schreibt die halbe Last.
    // DER ZEUGE IM FADEN: jeder Put meldet seinen Stand („put") selbst auf der Konsole des Workers, BEVOR er die Platte erreicht —
    // der Umweg über den Kanal und den Takt der Seite kam bei einem Tod mitten in der Nachricht nie an (CI 40249944696 z10: ein
    // ganzer Stand geladen, ungesehen, „halb" mit Alter null)
    function faden(rec) {
        const kanal = new BroadcastChannel("tt");
        let scharf = null;
        kanal.onmessage = (e) => (scharf = e.data);
        const put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (v, k) {
            if (String(k).endsWith(".bak") || !v || typeof v.json !== "string") return put.apply(this, arguments);
            if (scharf === "selbst") v = { at: v.at, json: v.json.slice(0, v.json.length >> 1) };
            let r = { kaputt: 1 };
            try {
                r = rec(JSON.parse(v.json));
            } catch {
                /* der halbe Stand des Selbsttests */
            }
            console.log("__TT__ " + JSON.stringify({ t: Date.now(), art: "put", rec: r }));
            const req = put.call(this, v, k);
            this.transaction.addEventListener("complete", () => {
                kanal.postMessage({ art: "fest", json: v.json, at: v.at });
                if (scharf === "fest" || scharf === "selbst") for (;;);
            });
            kanal.postMessage({ art: "idb", json: v.json, at: v.at });
            if (scharf === "idb") for (;;);
            return req;
        };
    }
    const Roh = window.Worker;
    window.Worker = function (url, o) {
        if (!o || o.name !== "speicher") return new Roh(url, o);
        return new Roh(
            URL.createObjectURL(new Blob([`(${faden})(${rec}); importScripts("${new URL(url, location.href)}");`])),
            o
        );
    };
}
// Der Treiber: W gehalten, je 16 ms ein Takt, je zweiter ein Loch auf dem Raster (die Linie wächst über den FIFO-Deckel 256
// von K23, jedes Loch steht nach dem Laden), je 50. ein Block 40 m neben dem Weg (die Genesis-Lichtung räumt Basalt).
function ttTreiber(e0) {
    const n = window.__ttN;
    let t = 0;
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW", key: "w", bubbles: true }));
    setInterval(() => {
        const { x, z } = st.playerMesh.position;
        const [lx, lz] = [200 + ((e0 + n[0]) % 20) * 10, 200 + Math.floor((e0 + n[0]) / 20) * 10];
        if (++t % 2 === 0) (n[0]++, r.carveVoxel(lx, r._terrainMacroSurfaceY(lx, lz) - 2, lz, 3));
        const ort = { x: x - 40, y: r._terrainMacroSurfaceY(x - 40, z), z };
        if (t % 50 === 0 && r.spawnArchitecture("stein_block", ort, { silent: true })) n[1]++;
        window.__ttReihe.push([Date.now(), ...n]);
        r._gameLoopTick(performance.now());
    }, 16);
}
function ttToeten(b) {
    try {
        if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(b.process().pid)]);
        else process.kill(-b.process().pid, "SIGKILL");
    } catch {}
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
        // der Tod ist, wenn der Prozess fort ist: bis taskkill zurückkehrt, schreibt der Faden weiter (lokal z4: ein ganzer Stand nach dem Stempel, „halb")
        const toeten = () => tot || (ttToeten(browser), (tot = Date.now()));
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
        await server.zeige(page, 120000);
        const g = (zeile.geladen = await page.evaluate(async () => {
            await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId);
            const loch = (o) => r._terrainDensityAt(o.x, o.y, o.z) + o.r; // das Zentrum liegt r m in der Luft (die Säule)
            const g0 = window.__ttRec({
                ...st,
                playerPosition: st.playerMesh.position,
            });
            return {
                ...g0,
                l: (st.worldMeta.voxelEdits || []).filter((o) => loch(o) < 0.01).length,
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
            if (zeile.halb) zeile.befund.push("halbes ohne Zeugen: kein Stand vor dem Tod trägt den geladenen");
        }
        // HALB: jeder Stand trägt GENAU den Boot plus den Treiber, als die Seite ihn reichte
        const halbe = () => {
            const h = alle.find(
                (e) =>
                    e.art === "idb" &&
                    e.t >= tGoto &&
                    e.n.every(([, l, b]) => e.rec.e !== g.e + l || e.rec.b !== g.b + b)
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
        await page.evaluate(ttTreiber, g.e);
        // ein Haken wartet auf den ersten Stand des Takts; der Zufall fällt jederzeit
        const takt = () => alle.some((e) => e.art === "idb" && e.t > tDa);
        for (let i = 0; (art !== "zufall" || z === von) && i < 400 && !takt(); i++) await sleep(50);
        // die Linie wächst je Zyklus in Löchern, nie in Wanduhr (Lehre 26)
        const soll = Math.ceil((300 * (z - von + 1)) / (bis - von + 1));
        for (let i = 0; i < 1200 && g.e + (await page.evaluate(() => window.__ttN[0])) < soll; i++) await sleep(50);
        await sleep(1000 + Math.random() * 5000);
        if (art === "zufall") toeten();
        // scharf: der nächste Schreiber dieser Art hält den Faden an
        else
            await page.evaluate((a) => {
                window.__ttTod = (e) => e.art === (a === "selbst" ? "fest" : a) && (a !== "selbst" || !!e.rec.kaputt);
                new BroadcastChannel("tt").postMessage(a);
            }, art);
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

// (D) DIE DATEI WÄCHST MIT DEN ÄNDERUNGEN, NIE MIT DEM WEG (speicher.K3): eine frische Welt (der Takt der Orte lebt wie im
// Spiel) speichert, der Spieler geht ohne Edit `km` in `min` Spielminuten (Teleport-Schritte auf dem Boden des Gesetzes, 100 ms
// je Takt), sie speichert wieder. Je Schlüssel des Stands (oben und `worldMeta.*`) das Δ roh (UTF-8 des JSON) und auf der
// Platte (der Stand in IndexedDB und sein .bak, beide vom Speicher-Faden). Das Urteil gilt dem Stand ohne das Leben
// (`LEBEN`: das Tagebuch, das Gedächtnis des Nexus, die Kreaturen — die Änderungen von KI und Welt, gedeckelt von ihrem
// Gesetz); es steht je Schlüssel in der Zahl. Mit PERSISTENCE_EDITS=n schlägt der Spieler danach n Gruben (2-m-Raster um ihn):
// Δ roh und Platte dieser Edits (Staffel 2, ≤ 100 kB je 1000). PERSISTENCE_WEG=km-min (Standard 1-6, 0-0 ohne (D)), `--weg` nur (D).
// DER KONSUM: jeder Stand des Fadens ist die volle Serialisierung (`buildStateSnapshot`) — die Marken der Stand-Tafel verlieren
// nichts; die Zahl nennt je Stand die abweichenden Schlüssel. SELBSTTEST im selben Gang: ein Weg-Zähler im Stand (`wegSpur`, je
// Takt die Lage, eine Zeile der Tafel) ist ROT an seinem Namen.
const LEBEN = ["worldJournal", "dslHistory", "dslAbilities", "knowledgeBase", "dslPatternMemory", "creatures"];
async function wegSeite(km, min, edits) {
    await window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId);
    const [st, spur, S] = [r.state, [], []];
    let t = performance.now();
    const takt = async (n, f) => {
        for (let i = 1; i <= n; i++) {
            if (f) f(i);
            r._gameLoopTick((t += 100));
            if (i % 5 === 0) await sleep(0);
        }
    };
    const sortiert = (o) =>
        JSON.stringify(o, (k, v) => (v && v.constructor === Object ? Object.fromEntries(Object.entries(v).sort()) : v));
    const abw = [];
    const stand = async () => {
        r.saveState();
        r.saveState(); // der .bak trägt denselben Stand
        const json = await window.__stand();
        const [voll, s] = [r.buildStateSnapshot(), r._standNormal(JSON.parse(json))];
        abw.push(Object.keys({ ...voll, ...s }).filter((k) => sortiert(voll[k]) !== sortiert(s[k])));
        S.push([json, (await r._idbGetWorld(st.worldMeta.worldId + ".bak")).json]);
    };
    await takt(200);
    await stand();
    const [p, n] = [st.playerMesh.position.clone(), min * 600];
    await takt(n, (i) => {
        const x = p.x + (i * km * 1000) / n;
        const z = p.z + 0.15 * (x - p.x);
        st.playerMesh.position.set(x, r._terrainMacroSurfaceY(x, z) + AnazhRealm.PLAYER_FOOT_OFFSET + 0.05, z);
        spur.push({ x, z, t });
    });
    await stand();
    p.copy(st.playerMesh.position);
    for (let i = 0; i < edits; i++) {
        const [x, z] = [p.x + (i % 40) * 2 - 40, p.z + Math.floor(i / 40) * 2 - 25];
        r.carveVoxel(x, r._terrainMacroSurfaceY(x, z) - 1, z, 1.5);
        if (i % 10 === 9) await takt(5);
    }
    await stand();
    r._standTafel().push(["wegSpur", () => spur]);
    await stand();
    return { S, abw };
}
// Δ je Schlüssel zweier Stände [JSON, .bak]; `ohne` und `ohnePlatte` ohne das Leben, `taeter` der stärkste Schlüssel außer ihm
function wegDelta([a, aBak], [b, bBak]) {
    const je = (j) => {
        const s = JSON.parse(j);
        for (const k in s.worldMeta) s["worldMeta." + k] = s.worldMeta[k];
        delete s.worldMeta;
        for (const k in s) s[k] = Buffer.byteLength(JSON.stringify(s[k] ?? null));
        return s;
    };
    const [A, B, L] = [je(a), je(b), Buffer.byteLength];
    const d = { roh: L(b) - L(a), platte: L(b) - L(a) + L(bBak) - L(aBak) };
    const je2 = Object.keys({ ...A, ...B }).map((k) => [k, (B[k] || 0) - (A[k] || 0)]);
    je2.sort((x, y) => y[1] - x[1]);
    const leben = je2.filter(([k]) => LEBEN.includes(k));
    const summe = leben.reduce((s2, [, v]) => s2 + v, 0);
    [d.ohne, d.ohnePlatte] = [d.roh - summe, d.platte - 2 * summe];
    d.taeter = je2.find(([k]) => !LEBEN.includes(k));
    d.zeile =
        `ohne Leben Δ roh ${kB(d.ohne)}, Platte ${kB(d.ohnePlatte)}, am stärksten ${d.taeter[0]} ${kB(d.taeter[1])} · ` +
        `gesamt roh ${kB(d.roh)}, Platte ${kB(d.platte)} · Leben ${leben.map(([k, v]) => k + " " + kB(v)).join(", ")}`;
    return d;
}
const kB = (b) => (b / 1000).toFixed(1) + " kB";
async function wegLauf(km, min, edits) {
    const { browser, page } = await nullSeite({ frist: 3600000 });
    await page.evaluateOnNewDocument(() => (window.__anazhAutoSettlement = true));
    await server.zeige(page);
    const { S, abw } = await page.evaluate(wegSeite, km, min, edits);
    await browser.close();
    return {
        km: km * Math.hypot(1, 0.15),
        weg: wegDelta(S[0], S[1]),
        edits: wegDelta(S[1], S[2]),
        spur: wegDelta(S[2], S[3]),
        abw,
    };
}
const [KORPUS, STUFE] = [path.join(root, "spec", "speicher-korpus"), require("../package.json").version];

// Was ein Save trägt (die Bauten des Stands nach Id), wie seine Version ihn schrieb — ein Slot ohne Art fiel schon dort.
const korpusSlot = (x) => (x.material || x.blueprintName) + "×" + x.count;
const korpusSave = (ls) => JSON.parse(ls["anazhRealmState_" + ls.anazhRealmActiveWorld]);
// die Edits eines Stands: die Liste (vor dem Speicher-Faden) oder kompakt {n, xyzr} (je Edit x, y, z, r Float64 little-endian)
const korpusEdits = (s) => {
    const k = s.voxelEdits;
    if (!k) return s.worldMeta.voxelEdits.map((e) => [e.x, e.z]);
    const b = Buffer.from(k.xyzr, "base64");
    return Array.from({ length: k.n }, (_, i) => [b.readDoubleLE(i * 32), b.readDoubleLE(i * 32 + 16)]);
};
function korpusSoll(k) {
    const s = korpusSave(k.ls);
    return {
        welt: s.worldMeta.worldId,
        boden: s.bodenGeneration,
        bauten: k.bauten
            .map((id) => s.architectures.find((a) => a.id === id))
            .map((a) => [a.type, a.position.x, a.position.z, a.ueberGrund]),
        edits: korpusEdits(s),
        inventar: s.playerInventory.filter((x) => x && (x.material || x.blueprintName)).map(korpusSlot),
    };
}
// Am Kopf: liegt die Grube je Edit am Boden (die Oberfläche unter dem Gesetz)? Dann der Save des Kopfs (Material dazu, fehlt es).
async function korpusIst(s) {
    await window.__weltDa((x) => x.state.worldMeta.worldId === s.welt);
    if (!st.player.inventory.some((x) => x && x.kind === "material")) r.addMaterialToInventory("stein", 5);
    r.saveState();
    const ls = { ...localStorage, [r.worldStorageKey(s.welt)]: await window.__stand() };
    return {
        alt: s.boden !== globalThis.__gelaendeCore.BODEN_GENERATION,
        umzug: !!st.bodenUmzug,
        kalt: window.__korpusKalt,
        fuss: AnazhRealm.PLAYER_FOOT_OFFSET,
        gruben: s.edits.map(([x, z]) => r._voxelSurfaceY(x, z) < r._terrainMacroSurfaceY(x, z) - 1),
        neu: { version: AnazhRealm.VERSION, ls },
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
// Je Stand eine Seite in seinem Kontext, sein localStorage hinein (IndexedDB trug denselben Stand), der Boot des Spielers.
async function korpusLauf(selbst) {
    const alle = fs
        .readdirSync(KORPUS)
        .map((f) => JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(KORPUS, f)))));
    const [browser, zeilen] = [await starteBrowser({ art: "null" }), []];
    alle.sort((a, b) => a.version.localeCompare(b.version, "en", { numeric: true }));
    const liste = selbst ? alle.slice(0, VERLUST.length) : NUR_STUFE ? alle.slice(-1) : alle;
    // DREI STÄNDE ZUGLEICH, je in seinem Kontext (localStorage, IndexedDB): 46 Boots je 4,5 s trugen 60 % von Teil 2 der CI, je
    // Versions-Stufe einer mehr (27.10., Karte lange-stationen); der Kopf (aus dem jüngsten Stand) bootet danach in dessen Bahn
    const stand = async (k, i) => {
        const kontext = await browser.createBrowserContext();
        const [page, s] = [await kontext.newPage(), korpusSoll(k)];
        await nullRenderer(page);
        await page.evaluateOnNewDocument(korpusHaken, selbst ? VERLUST[i] : null);
        await server.zeige(page, undefined, "cores.manifest.json", "load");
        await page.evaluate((ls) => Object.assign((localStorage.clear(), localStorage), ls), k.ls);
        await server.zeige(page);
        const ist = await page.evaluate(korpusIst, s);
        await kontext.close();
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
        zeilen[i] = z;
    };
    let n = 0;
    await Promise.all([0, 1, 2].map(async () => { while (n < liste.length) await stand(liste[n], n++); }));
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
    await server.lausche(PORT);
    if (NUR_STUFE) process.exit((await korpusLauf(false))[0].ganz ? 0 : 1);
    // PERSISTENCE_WEG=0-0: kein Gang — ein Lauf, der (D) nie urteilt (speicher.K4/K5; den Gang misst speicher.K3 mit 5 km)
    const w = WEG_KM && (await wegLauf(WEG_KM, WEG_MIN, EDITS));
    const wegChecks = !w
        ? []
        : [
              {
                  name: `(D) ${w.km.toFixed(1)} km in ${WEG_MIN} min ohne Edit, Soll ≤ 10 kB: ${w.weg.zeile}`,
                  pass: w.weg.ohne <= 1e4 && w.weg.ohnePlatte <= 1e4,
              },
              {
                  name: `(D) SELBSTTEST: ein Weg-Zähler im Stand ist ROT an seinem Namen: ${w.spur.zeile}`,
                  pass: w.spur.ohne > 1e4 && w.spur.taeter[0] === "wegSpur",
              },
              {
                  name: `(D) jeder Stand des Speicher-Fadens ist die volle Serialisierung: ${w.abw.map((x) => x.join(" ") || "gleich").join(" · ")}`,
                  pass: w.abw.every((x) => !x.length),
              },
          ];
    if (w && EDITS)
        wegChecks.push({
            name: `(D) ${EDITS} Edits, Soll ≤ ${EDITS / 10} kB: ${w.edits.zeile}`,
            pass: Math.max(w.edits.ohne, w.edits.ohnePlatte) <= EDITS * 100,
        });
    if (NUR_WEG) urteile(wegChecks);
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
            name: `(T) Tab-Tod ohne save-server, Zyklen ${TT_VON}-${TT_BIS}: ${ttZeile(tLauf)}${ttOk(tLauf) ? "" : " — Täter: der Speicher-Faden (speicher-faden.js) oder saveState (stamm/dienst.js)"}`,
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
                name: `(T) SELBSTTEST: der halbe Stand im Faden (Tod nach seiner Transaktion) wird ROT (${ttZeile(tSelbst)})`,
                pass: tSelbst.korrupt > 0,
            }
        );
    urteile([...checks, ...wegChecks]);
})();
function urteile(checks) {
    console.log("\n=== Persistenz-Härtung (Tab-Tod, Lade-Pfad, save-server, Weg) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Persistenz-Invarianten OK.`);
    urteilEnde(fails, "⛔ Die Persistenz-Härtung greift nicht — die Welt ist bei Korruption noch verlierbar.", "✅ Die Welt überlebt Tod und korrupten Write — kein stiller Datenverlust.");
}
