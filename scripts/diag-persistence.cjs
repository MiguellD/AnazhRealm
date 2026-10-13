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
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
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
    const proc = spawn(process.execPath, ["-r", path.join(dir, "k23-haken.js"), path.join(dir, "save-server.js")], {
        cwd: dir,
        stdio: ["ignore", "pipe", "pipe"],
        env: Object.assign({}, process.env, { PORT: String(SERVER_PORT), K23_TOD: String(tod) }),
    });
    let tot = false;
    const beendet = new Promise((r) => proc.on("exit", () => r((tot = true))));
    await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("save-server-Kopie startete nicht in 8 s")), 8000);
        proc.stdout.on("data", (c) => {
            if (/Save-Server/i.test(String(c))) {
                clearTimeout(t);
                resolve();
            }
        });
        proc.on("exit", () => reject(new Error("save-server-Kopie endete beim Start")));
    });
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
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        // (L) DIE LÖCHER NACH DEM RELOAD: 300 Kugeln über den Spielpfad, Save, echter Reload, zählen.
        // Die Welt steht (der Null-Renderer treibt den Takt nicht selbst: die Probe tickt ihn wie gate:worker-dichte).
        const weltSteht = async () => {
            const ok = await page.evaluate(async () => {
                const start = performance.now();
                while (performance.now() - start < 120000) {
                    const r = window.anazhRealm;
                    if (r && typeof r._gameLoopTick === "function") {
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {
                            /* der Boot reift */
                        }
                        const s = r.state;
                        if (s && s.worldMeta && s.voxelChunks && s.voxelChunks.size > 4) return true;
                    }
                    await new Promise((res) => setTimeout(res, 16));
                }
                return false;
            });
            if (!ok) throw new Error("(L) die Welt stand nach 120 s nicht");
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
            const loch = (o) => Math.abs(r._terrainBaseDensityAt(o.x, o.y, o.z) - r._terrainDensityAt(o.x, o.y, o.z) - 48) < 0.01;
            r.saveState();
            return { orte, loecher: orte.filter(loch).length, imMain: r.state.worldMeta.voxelEdits.length };
        }, N_LOECHER);
        await sleep(1500); // der IDB-Put des Saves landet (ein Reload schneidet sonst den Schreiber ab)
        await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        await weltSteht();
        const lNachher = await page.evaluate((orte) => {
            const r = window.anazhRealm;
            const loch = (o) => Math.abs(r._terrainBaseDensityAt(o.x, o.y, o.z) - r._terrainDensityAt(o.x, o.y, o.z) - 48) < 0.01;
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
                const istHaus = (a) => a && a.type === "haus_griechisch" && Math.abs(a.position.x - 52) < 0.01 && Math.abs(a.position.z - 52) < 0.01;
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
    ];
    if (SELBSTTEST)
        checks.push({
            name: `(S) SELBSTTEST: die alte Schreib-Art (fs.writeFile aufs Ziel) wird ROT (${sZeile(selbst)})`,
            pass: !selbst.killsOk,
        });
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
