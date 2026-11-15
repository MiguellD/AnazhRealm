#!/usr/bin/env node
// diag-heap-weg.cjs — DER WEG DES SPEICHERS (Preis des Orts, Schnitt 2; Heilung Gegner Gesetz F2, 15.11.): EINE Sitzung an der echten
// GPU fährt die Posen der Ratsche (spec/profiband/weg-wiese-radeon.json: Wiese · Wiese-Ost · Dorf · West · Wiese) und kehrt zur
// ersten zurück; je Pose eingeschwungen, 30 s der Preis-Lauf (`/lauf`), dann zwei GC (`/puffer`): Heap, VRAM, die Typed-Halter
// (`__heapHalter`). Die Fahrt geht als `weg.json` nach --aus und durch das Urteil H8 (`wegUrteil`, scripts/lib/draw-zaehler.cjs:
// Preis je Pose ≤ 400 MB, Ratsche je Pose, Zuwachs bis zur Rückkehr ≤ 5 MB/min, ROT beim Pfad des Halters). Bis hier lebte der
// Erzeuger als ignorierte Datei unter artifacts/ und H8 las nur, was ein Mensch ihm reichte (`diag-profiband --weg`).
// Zeit-Urteile nur an der echten GPU unter dem GPU-Schloss (artifacts/profiband/werkzeug/gpu-lauf.sh), ~18 min.
//
//   node scripts/diag-heap-weg.cjs [--aus <ordner>] [--ratsche weg-wiese-radeon.json]   (npm run gate:weg, nur am Gerät)
//   node scripts/diag-heap-weg.cjs --urteil <weg.json>                                  das Urteil H8 über eine gefahrene Fahrt
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn, spawnSync } = require("child_process");
const DZ = require("./lib/draw-zaehler.cjs");
require("./lib/urteil-zeile.cjs").wache();

const root = path.join(__dirname, "..");
const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const RATSCHE = path.join(root, "spec", "profiband", arg("--ratsche", "weg-wiese-radeon.json"));
const POSEN = [
    ["wiese", -280.4, -1045.6],
    ["wiese-ost", -101, -1070.5],
    ["dorf", 446.8, 457.4],
    ["west", -713, 617.5],
    ["wiese-zurueck", -280.4, -1045.6],
];
const [S, W] = [Number(process.env.WEG_SEITE || 7861), Number(process.env.WEG_PORT || 27861)];

// die Posen einer Fahrt (weg.json) in das Maß des Urteils: heapMB, halter, min seit der vorigen
function posenVon(weg) {
    return (weg.posen || weg).map((p) => ({
        pose: p.pose,
        heapMB: p.heapMB != null ? p.heapMB : p.heap_mb,
        halter: p.halter || [],
        min: p.min != null ? p.min : (p.sek || 0) / 60,
    }));
}
function urteil(weg) {
    const ratsche = JSON.parse(fs.readFileSync(RATSCHE, "utf8"));
    const f = DZ.wegUrteil(posenVon(weg), ratsche);
    const zeilen = posenVon(weg).map((p) => `${p.pose} ${p.heapMB.toFixed(1)} MB`);
    console.log(`H8 der Weg (${path.basename(RATSCHE)}): ${zeilen.join(" · ")}`);
    for (const z of f) console.log("  ❌ H8 " + z);
    console.log(f.length ? "\n❌ ROT" : "\n✅ GRÜN");
    return f.length ? 1 : 0;
}

if (process.argv.includes("--urteil")) process.exit(urteil(JSON.parse(fs.readFileSync(arg("--urteil"), "utf8"))));

const aus = path.resolve(arg("--aus", path.join(root, "artifacts", "profiband", "weg")));
fs.mkdirSync(aus, { recursive: true });
const log = (...a) => {
    const z = new Date().toISOString().slice(11, 19) + " " + a.join(" ");
    console.log(z);
    fs.appendFileSync(path.join(aus, "lauf.log"), z + "\n");
};
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const ruf = (weg, last, ms = 600000) =>
    new Promise((ja, nein) => {
        const q = http.request({ host: "127.0.0.1", port: W, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => {
                try {
                    ja(JSON.parse(d));
                } catch {
                    ja({ roh: d });
                }
            });
        }); // prettier-ignore
        q.setTimeout(ms, () => q.destroy(new Error(weg + " Frist")));
        q.on("error", nein);
        q.end(JSON.stringify(last || {}));
    });
const da = (port) => new Promise((r) => http.get("http://127.0.0.1:" + port + "/", (x) => (x.resume(), r(true))).on("error", () => r(false))); // prettier-ignore
const baumTot = (pid) => spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { windowsHide: true });
let sv = null;
let wb = null;
async function ab(code) {
    try {
        if (wb && wb.exitCode == null) {
            await ruf("/stop", {}, 30000).catch(() => null);
            for (let i = 0; i < 20 && wb.exitCode == null; i++) await warte(500);
        }
    } catch {}
    if (wb && wb.exitCode == null) baumTot(wb.pid);
    if (sv && sv.exitCode == null) baumTot(sv.pid);
    process.exit(code);
}
process.on("SIGINT", () => ab(130));

(async () => {
    sv = spawn(process.execPath, ["save-server.js"], { cwd: root, env: { ...process.env, PORT: String(S) }, stdio: "ignore", windowsHide: true }); // prettier-ignore
    for (let i = 0; !(await da(S)); i++)
        if (i > 60) return (log("save-server steht nicht"), ab(1));
        else await warte(1000);
    const wl = path.join(aus, "werkbank.log");
    const env = { ...process.env, WERKBANK_PORT: String(W) };
    delete env.NODE_OPTIONS;
    const a = [
        "scripts/werkbank.cjs",
        "start",
        "--echt",
        "--port",
        String(W),
        "--seite",
        "http://localhost:" + S,
        "--ort",
        "wiese",
    ];
    wb = spawn(process.execPath, a, { cwd: root, env, stdio: ["ignore", fs.openSync(wl, "w"), fs.openSync(wl + ".err", "w")], windowsHide: true }); // prettier-ignore
    for (let i = 0; !/WERKBANK bereit/.test(fs.readFileSync(wl, "utf8")); i++)
        if (wb.exitCode != null || i > 1200) return (log("Werkbank startet nicht", wb.exitCode), ab(1));
        else await warte(500);
    const weg = [];
    for (const [pose, x, z] of POSEN) {
        const t = Date.now();
        await ruf("/umstellen", { x, z });
        for (let i = 0; i < 90; i++) {
            const e = await ruf("/eval", { code: "return typeof __einschwingOffen === 'function' ? __einschwingOffen(r) : null;" }).catch(() => null); // prettier-ignore
            const offen = e && e.ergebnis;
            if (!offen || !Object.keys(offen).length) break;
            await warte(2000);
        }
        await ruf("/lauf", { sek: 30, ein: 30 }).catch(() => null);
        const puf = await ruf("/puffer", { top: 12 });
        const h = await ruf("/eval", { code: "return __heapHalter(r, 3).filter(([, b]) => b >= 131072).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]);" }); // prettier-ignore
        weg.push({ pose, x, z, sek: Math.round((Date.now() - t) / 1000), heap_mb: puf.heapMB, vram_mb: puf.vram && puf.vram.mb, halter: h.ergebnis || [] }); // prettier-ignore
        log(pose, "nach GC Heap", puf.heapMB, "MB · VRAM", puf.vram && puf.vram.mb, "MB");
    }
    fs.writeFileSync(path.join(aus, "weg.json"), JSON.stringify(weg, null, 1));
    const code = urteil(weg);
    await ab(code);
})().catch((e) => (log("FEHLER", e.stack), ab(1)));
