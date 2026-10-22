#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-persistence.cjs — DIE PERSISTENZ-HÄRTUNG (npm run gate:persistence)
//
// Schöpfer-Audit-Befund (HOCH): die Welt lebt in localStorage (+ IndexedDB seit
// V18.151) — aber ein KORRUPTER/partieller Write überschrieb den letzten guten
// Stand UND der Load verlor die Welt bei einem Parse-Fehler (`return null`). FIX
// (V18.361): ein ROTIERENDER .bak-Backup (saveState rettet den bisherigen Stand,
// BEVOR es überschreibt) + ein KORRUPTIONS-SICHERER Load (`_loadStateLoadFromStorage`
// fällt bei korruptem Haupt-Stand auf den .bak-Backup zurück). Diese Linse beweist
// beide Hälften headless (GPU-frei).
//
// (K) DER RELOAD MIT KALTEM BUCH (06.10., V18.531): ein Studio-Haus der Welt (haus_*, Worldgen-id als ZAHL) muss
// den Restore überstehen, auch wenn das Studio-Buch noch nicht da ist. Die FOUNDRY-SPAWN-WAND nahm nur Text-ids als
// Restore-Heilung: echte GPU, Werkbank, zweiter Boot — 12 Häuser an der Mess-Wiese fielen, der nächste Save schrieb
// den Verlust fest. Gegenprobe (nicht vakuös): ein FRISCHER Spawn bei kaltem Buch bleibt blockiert.
// (U) DER BODEN-UMZUG (K16): ein Save eines alten Bodens (ohne Boden-Generation, ohne Höhe über Grund) lädt durch den
// ganzen Lade-Pfad (`loadState`) — jeder Bau steht danach auf dem Boden des Gesetzes in Fuß-Höhe, nicht in der alten Höhe
// (Prüfung 1: der Restore stellte jeden Bau `precise` in seiner alten Höhe auf, |Δh| p50 37,7 m). Gegenprobe: ein Save
// desselben Bodens bewegt nichts. Die Zahl: wie viele Bauten der Welt sich bewegen (`state.bodenUmzug`).
//
// (L) DIE LÖCHER NACH DEM RELOAD (K23, 12.10.): 300 Schnitz-Kugeln über den Spielpfad (`carveVoxelSphere`), Save,
// echter Reload — jedes Loch steht wieder (die Dichte am Kugel-Zentrum liegt genau 48 unter der Basis). Bis K23
// verdrängte der FIFO-Deckel in `_addVoxelEdit` still die ersten 44: 256/300.
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
const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Port über PERSISTENCE_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4326.
const PORT = Number(process.env.PERSISTENCE_PORT || 4326);
const SERVER_PORT = Number(process.env.PERSISTENCE_SERVER_PORT || 4327);
const SELBSTTEST = process.argv.includes("--selftest");
const N_LOECHER = 300;
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

// (T) DER TAB-TOD IM BROWSER-PFAD (speicher.K1, 22.10.): kein save-server (dieser Port ist nicht :4312), EIN Profil über
// alle Boots. Je Zyklus wächst die Welt am Spielpfad, der Takt läuft (`_gameLoopTick`): gehen, schnitzen
// (`carveVoxelSphere`), bauen (`stein_block`); dann stirbt der GANZE Browser hart (taskkill /F /T · SIGKILL an die Gruppe)
// — an einem Schreib-Haken (der Faden steht IN dem Schreiber: IDB-put offen · IDB-Transaktion fest · Platz · Index ·
// Versionen) oder zur Zufalls-Zeit. Der nächste Boot urteilt: dieselbe Welt, kein Korrupt- und kein Rettungs-Befund, der
// geladene Stand ist GENAU ein geschriebener (Lage, Edits und Bauten aus EINEM Schreiben — sonst halbe Welt), sein Alter
// (Tod − sein Schreiben) ≤ 10 s. Das Log hört ab Dokument-Beginn (m16 hörte erst nach dem Weltbild: der Boot-Save fehlte,
// 30,77 s). `--tabtod a-b` fährt die Zyklen a..b (CI: zwei Teil-Läufe); der SELBSTTEST schreibt den Platz in zwei Zügen
// (erst die halbe Last, dann die ganze) und stirbt dazwischen — ROT beim Namen.
const TT_ALTER_S = 10;
const TT_HAKEN = ["idb", "fest", "platz", "index", "versionen"];
function ttHaken() {
    const lies = (json) => {
        try {
            const s = JSON.parse(json);
            const m = s.worldMeta || {};
            const p = s.playerPosition || {};
            const b = (s.architectures || []).filter((a) => a && a.type === "stein_block").length;
            return { w: m.worldId, x: +(+p.x).toFixed(3), z: +(+p.z).toFixed(3), e: (m.voxelEdits || []).length, b };
        } catch (_e) {
            return { kaputt: true };
        }
    };
    const melde = (e) => {
        console.log("__TT__ " + JSON.stringify(e));
        if (window.__ttTod && window.__ttTod(e)) {
            console.log("__TOD__ " + e.art);
            const ende = performance.now() + 8000;
            while (performance.now() < ende); // der Faden steht IN diesem Schreiber, bis der Prozess stirbt
        }
    };
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
        const r = set.call(this, k, v);
        const art = /^anazhRealmState_[^.]*$/.test(k)
            ? "platz"
            : { anazhRealmWorlds: "index", anazhRealmVersions: "versionen" }[k];
        if (art) melde({ t: Date.now(), art, rec: art === "platz" ? lies(v) : null });
        return r;
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        const req = put.apply(this, arguments);
        if (this.name === "worlds" && !/\.bak$/.test(String(k)) && v && typeof v.json === "string") {
            const rec = lies(v.json);
            this.transaction.addEventListener("complete", () => melde({ t: Date.now(), art: "fest", rec }));
            melde({ t: Date.now(), art: "idb", rec });
        }
        return req;
    };
}
// Der Treiber des Zyklus (in der Seite): W gehalten (der Spieler geht), je 25 Takte ein Loch, je 50 ein Block — die Welt
// ändert sich stetig. Beides 40 m neben dem Weg, außerhalb der Genesis-Lichtung (r 15 m): dort weicht ein Stein-Block beim
// Laden dem Platz (`_naturRaeumen`, basalt ist Natur) — ein Gesetz des Orts, keine Frage des Speichers.
function ttTreiber() {
    const r = window.anazhRealm;
    let n = 0;
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW", key: "w", bubbles: true }));
    setInterval(() => {
        const p = r.state.playerMesh.position;
        if (++n % 25 === 0) r.carveVoxelSphere(p.x + 40, r._terrainMacroSurfaceY(p.x + 40, p.z) - 1, p.z, 1.5);
        if (n % 50 === 0)
            r.spawnArchitecture(
                "stein_block",
                { x: p.x - 40, y: r._terrainMacroSurfaceY(p.x - 40, p.z), z: p.z },
                { silent: true }
            );
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {
            /* der Takt reift */
        }
    }, 16);
}
// SELBSTTEST: der Platz in zwei Zügen — erst die halbe Last (eigene Transaktion), dann die ganze; der Tod fällt dazwischen.
function ttNichtAtomar() {
    const r = window.anazhRealm;
    const ganz = r._idbPutWorld.bind(r);
    r._idbPutWorld = async (id, json, ...rest) => {
        const db = await r._idb();
        await new Promise((ok) => {
            const tx = db.transaction("worlds", "readwrite");
            tx.objectStore("worlds").put({ at: Date.now(), json: json.slice(0, json.length >> 1) }, id);
            tx.oncomplete = tx.onabort = ok;
        });
        return ganz(id, json, ...rest);
    };
}
function ttToeten(browser) {
    const pid = browser.process().pid;
    try {
        if (process.platform === "win32") execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
        else process.kill(-pid, "SIGKILL");
    } catch (_e) {
        try {
            process.kill(pid, "SIGKILL");
        } catch (_e2) {
            /* schon tot */
        }
    }
}
async function tabTodProbe({ von, bis, selbst = false }) {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), "k1-tabtod-"));
    const alle = []; // jedes Schreiben jedes Zyklus {t, art, rec}
    const zyklen = [];
    let vorher = null;
    for (let z = von; z <= bis + 1; z++) {
        const erwartet = /Browser getrennt ohne Abbau|Target closed|Page crashed/;
        const browser = await starteBrowser({ art: "null", profil, erwartet });
        const page = (await browser.pages())[0] || (await browser.newPage());
        const zeile = { z, befund: [] };
        let tot = null;
        page.on("console", (m) => {
            const t = m.text();
            if (t.startsWith("__TT__ ")) return void alle.push(JSON.parse(t.slice(7)));
            if (t.startsWith("__TOD__ ") && !tot) return void ((tot = Date.now()), ttToeten(browser));
            if (/ließ sich nicht laden|korrupt|unlesbar|Welt aus \S*\.bak|erwacht leer/i.test(t))
                zeile.befund.push(t.slice(0, 200));
        });
        await nullRenderer(page);
        const tGoto = Date.now();
        await page.evaluateOnNewDocument(ttHaken);
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        const g = (zeile.geladen = await page.evaluate(async () => {
            const r = await window.__weltDa(
                (x) => x.state.playerMesh && x.state.worldMeta && x.state.worldMeta.worldId
            );
            const p = r.state.playerMesh.position;
            const m = r.state.worldMeta;
            const b = (r.state.architectures || []).filter((a) => a && a.type === "stein_block").length;
            return { w: m.worldId, x: +p.x.toFixed(3), z: +p.z.toFixed(3), e: (m.voxelEdits || []).length, b };
        }));
        const tDa = Date.now();
        if (vorher) {
            const lage = alle.filter(
                (e) =>
                    e.t <= vorher.tot &&
                    e.rec &&
                    e.rec.w === g.w &&
                    Math.abs(e.rec.x - g.x) + Math.abs(e.rec.z - g.z) < 0.004
            );
            const ganz = lage.filter((e) => e.rec.e === g.e && e.rec.b === g.b);
            const tStand = ganz.length ? Math.max(...ganz.map((e) => e.t)) : null;
            Object.assign(zeile, { tod: vorher.art, gleicheWelt: g.w === vorher.w, halb: !ganz.length });
            zeile.alterS = tStand != null ? +((vorher.tot - tStand) / 1000).toFixed(2) : null;
        }
        // EIN HALBES SCHREIBEN: in dieser Sitzung wächst die Welt nur (der Treiber setzt, nie nimmt er) — trägt ein Schreiben
        // weniger, als der Boot geladen hat, legte es eine halbe Welt ab (ein Tod danach verlöre den Rest)
        const halbe = () => {
            const h = alle.find((e) => e.t >= tGoto && e.rec && e.rec.w === g.w && (e.rec.e < g.e || e.rec.b < g.b));
            if (h)
                zeile.befund.push(
                    `halbes Schreiben (${h.art}): ${h.rec.e} Edits/${h.rec.b} Bauten, geladen ${g.e}/${g.b}`
                );
        };
        if (z === bis + 1) {
            await sleep(1000);
            halbe();
            await browser.close();
            zyklen.push(zeile);
            break;
        }
        // der Zyklus: Selbsttest (der Platz in zwei Zügen, Tod zwischen den Zügen) · Haken · Zufall
        const art = selbst ? "selbst" : z % 2 === 0 ? TT_HAKEN[(z >> 1) % TT_HAKEN.length] : "zufall";
        if (selbst) await page.evaluate(ttNichtAtomar);
        await page.evaluate(ttTreiber);
        // ein Haken (und der erste Zyklus eines frischen Profils) wartet, bis der Takt dieses Boots einmal schrieb: der Tod
        // trifft dann ein Schreiben des laufenden Takts, nie den Boot; der Zufall fällt jederzeit, auch in den Boot
        const takt = () => alle.some((e) => e.art === "platz" && e.t > tDa && e.rec.w === g.w);
        for (let i = 0; (art !== "zufall" || z === von) && i < 400 && !takt(); i++) await sleep(50);
        await sleep(1000 + Math.random() * 5000);
        if (art === "zufall") ((tot = Date.now()), ttToeten(browser));
        else {
            // der Haken wird scharf: der NÄCHSTE Schreiber dieser Art hält den Faden an, die Linse tötet
            await page
                .evaluate((a) => {
                    let halb = false; // Selbsttest: die halbe Last ist fest (ihr Stand kaputt), der ganze Zug noch nicht
                    window.__ttTod = (e) =>
                        a === "selbst" ? ((halb = halb || (e.art === "fest" && e.rec.kaputt)), halb) : e.art === a;
                }, art)
                .catch(() => {});
            for (let i = 0; i < 300 && !tot; i++) await sleep(50);
            if (!tot) ((zeile.hakenVerfehlt = true), (tot = Date.now()), ttToeten(browser));
        }
        await new Promise((ok) => (browser.process().exitCode != null ? ok() : browser.process().once("exit", ok)));
        await sleep(300);
        halbe();
        vorher = { tot, art, w: g.w };
        zyklen.push(zeile);
        const z1 = zyklen[zyklen.length - 1];
        console.log(
            `  [T] ${z} Tod ${art} · geladen ${JSON.stringify(g)} · Alter ${z1.alterS} s${z1.halb ? " · HALB" : ""}${z1.befund.length ? ` · ${z1.befund.join(" | ")}` : ""}`
        );
    }
    fs.rmSync(profil, { recursive: true, force: true });
    if (process.env.PERSISTENCE_ROH)
        fs.writeFileSync(process.env.PERSISTENCE_ROH, JSON.stringify({ zyklen, alle }, null, 1));
    const urteil = zyklen.filter((x) => x.tod);
    const alter = urteil.map((x) => x.alterS).filter((a) => a != null);
    return {
        n: urteil.length,
        alt: urteil.filter((x) => !(x.alterS <= TT_ALTER_S)).length,
        maxAlter: alter.length ? Math.max(...alter) : null,
        korrupt: urteil.filter((x) => x.befund.some((b) => !b.startsWith("halbes"))).length,
        halb: urteil.filter((x) => x.halb || !x.gleicheWelt).length,
        halbeSchreiben: zyklen.filter((x) => x.befund.some((b) => b.startsWith("halbes"))).length,
        verfehlt: zyklen.filter((x) => x.hakenVerfehlt).length,
    };
}
const ttZeile = (t) =>
    `${t.n} Tode: Alter max ${t.maxAlter} s, ${t.alt} über ${TT_ALTER_S} s · ${t.korrupt} korrupt/gerettet · ${t.halb} halbe Welten geladen, ${t.halbeSchreiben} Boots mit halbem Schreiben · ${t.verfehlt} Haken verfehlt`;
const ttOk = (t) => t.n > 0 && !t.alt && !t.korrupt && !t.halb && !t.halbeSchreiben && !t.verfehlt;
const TT_TEIL = process.argv.includes("--tabtod") ? process.argv[process.argv.indexOf("--tabtod") + 1] : null;
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    if (TT_TEIL) {
        const [von, bis] = TT_TEIL.split("-").map(Number);
        const t = await tabTodProbe({ von, bis });
        const ok = ttOk(t);
        console.log(`\n${ok ? "✅" : "❌"} (T) Tab-Tod im Browser-Pfad, Zyklen ${TT_TEIL}: ${ttZeile(t)}`);
        if (!ok)
            console.log(
                "⛔ Täter: saveState (stamm/dienst.js) — der Tod nimmt mehr als 10 s oder trifft einen halben Stand."
            );
        server.close();
        process.exit(ok ? 0 : 1);
    }
    const browser = await starteBrowser({ art: "null" });
    const page = await browser.newPage();
    await nullRenderer(page, { foundry: true });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await warteAufWelt(page, 60000);
        // (L) DIE LÖCHER NACH DEM RELOAD: 300 Kugeln über den Spielpfad, Save, echter Reload, zählen.
        // Die Welt steht (der Null-Renderer treibt den Takt nicht selbst: die Probe tickt ihn wie gate:worker-dichte).
        const weltSteht = async () => {
            // das EINE Warten (welt-boot `__gebautNach`): Takt um Takt, Deckel nur in Takten ohne Offenes; steht sie nicht, wirft es beim Namen
            await page.evaluate(async () => {
                const r = await window.__weltDa();
                await window.__gebautNach("die Welt mit 5 Chunks", {
                    fertig: () => !!(r.state.worldMeta && r.state.voxelChunks && r.state.voxelChunks.size > 4),
                    takt: async () => {
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {
                            /* der Boot reift */
                        }
                        await new Promise((res) => setTimeout(res, 16));
                    },
                    max: 2000,
                });
            });
        };
        await weltSteht();
        const lVorher = await page.evaluate((n) => {
            const r = window.anazhRealm;
            r.state.worldMeta.voxelEdits = [];
            const orte = [];
            for (let i = 0; i < n; i++) {
                const x = 200 + (i % 20) * 10;
                const z = 200 + Math.floor(i / 20) * 10;
                const y = r._terrainMacroSurfaceY(x, z) - 2;
                orte.push({ x, y, z });
                r.carveVoxelSphere(x, y, z, 3);
            }
            const loch = (o) =>
                Math.abs(r._terrainBaseDensityAt(o.x, o.y, o.z) - r._terrainDensityAt(o.x, o.y, o.z) - 48) < 0.01;
            r.saveState();
            return { orte, loecher: orte.filter(loch).length, imMain: r.state.worldMeta.voxelEdits.length };
        }, N_LOECHER);
        await sleep(1500); // der IDB-Put des Saves landet (ein Reload schneidet sonst den Schreiber ab)
        await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
        await warteAufWelt(page, 60000);
        await weltSteht();
        const lNachher = await page.evaluate((orte) => {
            const r = window.anazhRealm;
            const loch = (o) =>
                Math.abs(r._terrainBaseDensityAt(o.x, o.y, o.z) - r._terrainDensityAt(o.x, o.y, o.z) - 48) < 0.01;
            const n = orte.filter(loch).length;
            const edits = (r.state.worldMeta.voxelEdits || []).length;
            r.state.worldMeta.voxelEdits = [];
            r.saveState();
            return { loecher: n, edits };
        }, lVorher.orte);
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const o = {};
            const activeId = r.activeWorldGet ? r.activeWorldGet() : null;
            const wid = r.state.worldMeta && r.state.worldMeta.worldId;
            o.idsMatch = !!activeId && activeId === wid;
            const key = r.worldStorageKey(activeId || wid);
            const bakKey = key + ".bak";
            // zwei Saves → der .bak wird mit dem ersten guten Stand gefüllt (Rotation)
            r.saveState();
            r.saveState();
            o.mainExists = !!localStorage.getItem(key);
            o.bakExists = !!localStorage.getItem(bakKey);
            o.bakValid = (() => {
                try {
                    return !!JSON.parse(localStorage.getItem(bakKey));
                } catch (_e) {
                    return false;
                }
            })();
            // den IDB-Preload-Pfad ausschalten, damit der LS-Pfad gemessen wird
            r._idbPreloadedState = null;
            // (1) Haupt-Stand KORRUMPIEREN (truncated write) → muss aus dem .bak retten
            localStorage.setItem(key, '{"worldMeta":{trunc');
            const recovered = r._loadStateLoadFromStorage();
            o.recoveredFromBackup = !!(recovered && typeof recovered === "object");
            // (2) AUCH den Backup korrumpieren → ehrliches null (kein stiller Müll)
            r._idbPreloadedState = null;
            localStorage.setItem(bakKey, "]]also broken{{");
            const both = r._loadStateLoadFromStorage();
            o.honestNullWhenBothCorrupt = both === null;
            return o;
        });
        out.lVorher = lVorher.loecher;
        out.lImMain = lVorher.imMain;
        out.lNachher = lNachher.loecher;
        out.lEdits = lNachher.edits;
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
        { name: "World-Key == Active-Key (kein Key-Drift)", pass: out.idsMatch },
        { name: "Haupt-Stand geschrieben", pass: out.mainExists },
        { name: "Rotierender .bak-Backup geschrieben", pass: out.bakExists },
        { name: ".bak ist gültiges JSON (der letzte gute Stand)", pass: out.bakValid },
        {
            name: "Korrupter Haupt-Stand → aus dem Backup WIEDERHERGESTELLT (Welt nicht verloren)",
            pass: out.recoveredFromBackup,
        },
        { name: "Haupt + Backup korrupt → ehrliches null (kein stiller Müll)", pass: out.honestNullWhenBothCorrupt },
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
            name: `(L) Löcher nach Reload ${out.lNachher}/${N_LOECHER} (vor dem Reload ${out.lVorher}/${N_LOECHER}, der Main hielt ${out.lImMain}, geladen ${out.lEdits} Edits)${out.lImMain < N_LOECHER ? " — Täter _addVoxelEdit: der FIFO-Deckel verdrängt still" : ""}`,
            pass: out.lVorher === N_LOECHER && out.lNachher === N_LOECHER,
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
            }
        );
    console.log("\n=== Persistenz-Härtung (rotierender Backup + korruptions-sicherer Load) ===");
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
    console.log("✅ Die Welt überlebt einen korrupten Write (ein Stand zurück) — kein stiller Datenverlust.");
    process.exit(0);
})();
