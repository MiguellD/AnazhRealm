// diag-fahr-leben.cjs — DIE FAHR-LINSE DES LEBENS (Welle L, Familie fahren): sie fährt den Ritt durch den ECHTEN
// Spiel-Takt (`_gameLoopTick` — Akkumulator, Sim-Schritte, Interpolation, Frame-Tick), nie an ihm vorbei. Befund
// 06.10. (artifacts/profiband/leben/befund-fahren-gelaende.md, sichtbar gespielt auf der Radeon): `gate:vehicle-drive`
// B-e integrierte den Ritt ohne Akkumulator und ohne Interpolation (Q0 F-L6) — die Defekte des echten Loops sah sie nie.
//
//   T (Q1 · F-D1 F-D2 F-D10) — DER RITT-TAKT. Der GT fährt mit W über eine trockene Gerade an der Mess-Wiese, die
//     Frame-Zeiten wechseln (8–33 ms: Frames ohne, mit einem und mit zwei Sim-Schritten). Gezählt wird je Frame:
//       teleport  — der Akkumulator fand das Spieler-Mesh NICHT dort, wo die Interpolation es hinlegte, und übernahm
//                   die nachhinkende Lage als Sim-Wahrheit (Befund: 114 von 114 Frames)        Soll 0
//       weg       — Sim-Weg (Σ der Sim-Schritte) gegen Fahr-Weg (Σ der Wagen-Lage je Frame)
//                   (Befund: 25,95 m simuliert, 10,27 m gefahren)                                Soll ±2 % (min 0,4 m)
//       luft      — Sim-Schritte, in denen der Reiter im Sattel „in der Luft" gilt
//                   (Befund: 421 von 421)                                                         Soll 0
//       gier      — Gier-Drift ohne Lenk-Taste: geradeaus mit W UND am Hang ohne Taste (rollt zurück)
//                   (Befund: 84° beim Zurückrollen am 21°-Hang)                                   Soll ≤ 0,5°
//     Dazu das Pferd (`reittier_holzross`, der richtungs-folgende Ritt ohne Lenk-Gesetz): teleport 0, weg ±2 %
//     (Befund: 131 von 135 Frames, 3,66 m simuliert, 1,81 m geritten).
//
//   node scripts/diag-fahr-leben.cjs [--selftest]          Port: FAHR_LEBEN_PORT (Standard 4413)
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");

const PORT = Number(process.env.FAHR_LEBEN_PORT || 4413);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── DAS TAKT-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
const TAKT = { gierGrad: 0.5, wegAnteil: 0.02, wegMinM: 0.4, wegFahrtMinM: 5 };
function taktVerdict(m, wegFahrtMinM) {
    const out = [];
    const minWeg = Number.isFinite(wegFahrtMinM) ? wegFahrtMinM : TAKT.wegFahrtMinM;
    if (!m || m.gestartet !== true) return ["start"];
    if (!(m.frames > 0)) return ["frames 0"];
    if (m.teleport !== 0) out.push(`teleport ${m.teleport}/${m.frames}`);
    if (!(m.simWeg >= minWeg)) out.push(`sim-weg ${(m.simWeg || 0).toFixed(2)} m (keine Fahrt)`);
    const tol = Math.max(TAKT.wegMinM, TAKT.wegAnteil * (m.simWeg || 0));
    if (!(Math.abs((m.simWeg || 0) - (m.fahrWeg || 0)) <= tol))
        out.push(`weg sim ${(m.simWeg || 0).toFixed(2)} ≠ fahrt ${(m.fahrWeg || 0).toFixed(2)} m`);
    if (Number.isFinite(m.luft) && m.luft !== 0) out.push(`luft ${m.luft}/${m.schritte}`);
    if (Number.isFinite(m.gierGrad) && !(m.gierGrad <= TAKT.gierGrad)) out.push(`gier ${m.gierGrad.toFixed(1)}°`);
    return out;
}

// ── DIE STATISCHE WAND (Node, kommentarfrei): der Ritt sitzt im Sim-Schritt, der Frame-Tick schreibt nie den Reiter,
// das Lenk-Frame-Flag ist tot. Liefert [name, ok, detail]. ──
function ohneKommentare(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index + m[0].length - 1);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}
function taktWand(src) {
    const nc = ohneKommentare(src);
    const sim = fnBody(nc, /\n {4}_stepFixedSim\(simTime, dt\) \{/);
    const frame = fnBody(nc, /\n {4}_tickMountedMovement\(_?dt\) \{/);
    const ritt = fnBody(nc, /\n {4}_rittSchritt\(dt\) \{/);
    const flag = (nc.match(/_rideSteer(?!Yaw)\b/g) || []).length;
    return [
        [
            "W1 der Sim-Schritt trägt den Ritt (`_stepFixedSim` ruft `_rittSchritt` nach der Bewegung)",
            !!sim && /_loopPlayerMovement\(simTime, dt\);[\s\S]*this\._rittSchritt\(dt\)/.test(sim) && !!ritt,
        ],
        [
            "W2 der Frame-Tick schreibt nie den Reiter (`_tickMountedMovement` ohne pm.y-Zuweisung), der Sim-Schritt setzt den Sitz",
            !!frame && !/\bpm\.y\s*=[^=]/.test(frame) && !!ritt && /\bpm\.y\s*=\s*riderY/.test(ritt),
        ],
        ["W3 das Lenk-Frame-Flag `_rideSteer` ist tot (0 im Code)", flag === 0, `${flag}×`],
    ];
}

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

// ── DIE PROBE IN DER SEITE (Funktionsrumpf; r = die Welt). Fährt den echten Frame. ──
async function probeTakt(expected) {
    const res = {};
    const dl0 = performance.now() + 60000;
    while (
        (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
        performance.now() < dl0
    )
        await new Promise((r) => setTimeout(r, 100));
    const r = window.anazhRealm;
    const st = r.state;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 50000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await new Promise((r2) => setTimeout(r2, 80));
    }
    const P = AnazhRealmProto();
    function AnazhRealmProto() {
        return Object.getPrototypeOf(r);
    }
    // Frame-Zeiten (ms): Frames ohne (8,3), mit einem (16,7 · 20 · 11,1) und mit zwei Sim-Schritten (25 · 33,3).
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    const frame = (i) => {
        tMs += MUSTER[i % MUSTER.length];
        r._gameLoopTick(tMs);
    };
    // DIE ZÄHLER am echten Takt: der Teleport-Zweig des Akkumulators (exakt seine Bedingung) und der Weg je Sim-Schritt.
    const z = { teleport: 0, schritte: 0, luft: 0, simWeg: 0, an: false };
    r._loopFixedStep = function (realDt, ct) {
        const m = st.playerMesh;
        if (z.an && st._fixedSimPos && !(st._fixedRenderPos && m.position.equals(st._fixedRenderPos))) z.teleport++;
        return P._loopFixedStep.call(this, realDt, ct);
    };
    r._stepFixedSim = function (simTime, dt) {
        const m = st.playerMesh.position;
        const x0 = m.x;
        const z0 = m.z;
        P._stepFixedSim.call(this, simTime, dt);
        if (z.an) {
            z.simWeg += Math.hypot(m.x - x0, m.z - z0);
            z.schritte++;
            if (st.isInAir) z.luft++;
        }
    };
    const aufraeumen = () => {
        delete r._loopFixedStep;
        delete r._stepFixedSim;
    };
    const tasten = (w) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
    };
    // Die Strecke: trocken, die kleinste Stufe (dieselbe Suche wie gate:vehicle-drive B-e), Fahrt in +x.
    const mo = expected.messort;
    let start = null;
    for (let ring = 0; ring <= 4; ring++)
        for (let k = 0; k < (ring ? 8 : 1); k++) {
            const cx = mo[0] + Math.cos((k * Math.PI) / 4) * ring * 32;
            const cz = mo[1] + Math.sin((k * Math.PI) / 4) * ring * 32;
            let trocken = true;
            let stufe = 0;
            for (const dz of [-3, 0, 3]) {
                let vor = null;
                for (let s = 0; s <= 36 && trocken; s++) {
                    const hx = r.getTerrainHeightAt(cx + s * 2, cz + dz);
                    const ws = r._waterRunSurfaceAt(cx + s * 2, cz + dz);
                    if (!Number.isFinite(hx) || (Number.isFinite(ws) && ws > hx - 0.3)) trocken = false;
                    if (vor !== null) stufe = Math.max(stufe, Math.abs(hx - vor));
                    vor = hx;
                }
            }
            if (trocken && (!start || stufe < start.stufe)) start = { x: cx, z: cz, stufe };
        }
    res.start = start;
    if (!start) {
        aufraeumen();
        return res;
    }
    const setzen = async (typ, x, zz, rotY) => {
        st.playerMesh.position.set(x, r.getTerrainHeightAt(x, zz) + 1.2, zz);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const e = r.spawnArchitecture(
            typ,
            { x, y: r.getTerrainHeightAt(x, zz) + 0.5, z: zz },
            { silent: true, precise: true, rotationY: rotY }
        );
        if (!e) return null;
        const dlB = performance.now() + 45000;
        while (!e.instanced && !e.mesh && performance.now() < dlB) {
            r._rebuildArchitectureMesh(e);
            if (e.instanced || e.mesh) break;
            await new Promise((r3) => setTimeout(r3, 200));
        }
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) return null;
        tasten(false);
        for (let i = 0; i < 12; i++) frame(i); // einschwingen (Sitz, Ebene, Interpolation)
        return e;
    };
    const gierUnwrap = (e) => (Number.isFinite(e._rideYaw) ? e._rideYaw : 0);
    // Eine Fahrt: n Frames mit/ohne W; zählt Teleport · Sim-Weg · Fahr-Weg · Luft · Gier-Drift (ohne Lenk-Taste).
    const fahrt = (e, n, w) => {
        tasten(w);
        z.teleport = 0;
        z.schritte = 0;
        z.luft = 0;
        z.simWeg = 0;
        z.an = true;
        let fahrWeg = 0;
        let px = e.position.x;
        let pz = e.position.z;
        let g0 = gierUnwrap(e);
        let gier = 0;
        for (let i = 0; i < n; i++) {
            frame(i);
            fahrWeg += Math.hypot(e.position.x - px, e.position.z - pz);
            px = e.position.x;
            pz = e.position.z;
            const g = gierUnwrap(e);
            let d = g - g0;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            gier += Math.abs(d);
            g0 = g;
        }
        z.an = false;
        tasten(false);
        return {
            gestartet: true,
            frames: n,
            teleport: z.teleport,
            schritte: z.schritte,
            luft: z.luft,
            simWeg: z.simWeg,
            fahrWeg,
            gierGrad: (gier * 180) / Math.PI,
            v: st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0,
        };
    };
    try {
        // (1) Der GT geradeaus, W gehalten (Template-Gier 0 = Bug +x = Fahrt +x).
        const gt = await setzen("fahrzeug_gt", start.x, start.z, 0);
        res.gt = gt ? fahrt(gt, 240, true) : { gestartet: false };
        if (gt) {
            r.dismountArchitecture();
            r.removeArchitecture(gt);
        }
        // (2) Am Hang ohne Taste: der GT steht bergauf und rollt zurück (der Befund: 84° Gier ohne Lenkung).
        let hang = null;
        for (let dx = -48; dx <= 48 && !hang; dx += 6)
            for (let dz = -48; dz <= 48 && !hang; dz += 6) {
                const x = mo[0] + dx;
                const zz = mo[1] + dz;
                const hh = (a, b) => r.getTerrainHeightAt(a, b);
                const gx = (hh(x + 3, zz) - hh(x - 3, zz)) / 6;
                const gz = (hh(x, zz + 3) - hh(x, zz - 3)) / 6;
                const g = Math.hypot(gx, gz);
                const ws = r._waterRunSurfaceAt(x, zz);
                if (!(g >= 0.2 && g <= 0.45) || (Number.isFinite(ws) && ws > hh(x, zz) - 0.3)) continue;
                // gleichmäßig: dieselbe Steigung 6 m bergab
                const ux = gx / g;
                const uz = gz / g;
                const g2 = Math.hypot(
                    (hh(x - ux * 6 + 3, zz - uz * 6) - hh(x - ux * 6 - 3, zz - uz * 6)) / 6,
                    (hh(x - ux * 6, zz - uz * 6 + 3) - hh(x - ux * 6, zz - uz * 6 - 3)) / 6
                );
                if (!(g2 >= 0.15)) continue;
                hang = { x, z: zz, g, fahrt: Math.atan2(ux, uz) };
            }
        res.hang = hang;
        if (hang) {
            const gh = await setzen("fahrzeug_gt", hang.x, hang.z, hang.fahrt - Math.PI / 2);
            res.gtHang = gh ? fahrt(gh, 180, false) : { gestartet: false };
            if (gh) {
                r.dismountArchitecture();
                r.removeArchitecture(gh);
            }
        }
        // (3) Das Pferd: der richtungs-folgende Ritt ohne Lenk-Gesetz (W in Blick-Richtung +x).
        st.yaw = Math.PI / 2;
        const ross = await setzen("reittier_holzross", start.x, start.z, Math.PI / 2);
        res.ross = ross ? fahrt(ross, 180, true) : { gestartet: false };
        if (ross) {
            r.dismountArchitecture();
            r.removeArchitecture(ross);
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}

(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Takt-Linse nennt jeden Täter des Befunds ===");
        const gesund = {
            gestartet: true,
            frames: 240,
            teleport: 0,
            schritte: 270,
            luft: 0,
            simWeg: 30.1,
            fahrWeg: 29.9,
            gierGrad: 0.0,
        };
        check("Selbst-Test 0: gesunder Ritt == 0 Täter", taktVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["114 von 114 Frames Teleport (F-D1)", { teleport: 114 }, "teleport"],
            ["25,95 m simuliert, 10,27 m gefahren (F-D1)", { simWeg: 25.95, fahrWeg: 10.27 }, "weg"],
            ["Reiter in der Luft 421/421 (F-D10)", { luft: 270 }, "luft"],
            ["84° Gier ohne Lenkung (F-D2)", { gierGrad: 84 }, "gier"],
            ["keine Fahrt (0 m)", { simWeg: 0, fahrWeg: 0 }, "sim-weg"],
        ]) {
            const v = taktVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test: ‚${name}' → die Linse nennt ${soll}`, v.length >= 1 && v[0].startsWith(soll), v.join(" · "));
        }
        check("Selbst-Test: nicht gestartet → die Linse feuert", taktVerdict({ gestartet: false }).length === 1);
        // Die statische Wand feuert auf den Vor-Stand: der Sitz im Frame-Tick, das Frame-Flag lebt.
        const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const gruen = taktWand(quelle);
        check("Selbst-Test W: der Arbeitsbaum ist grün", gruen.every((w) => w[1]), gruen.filter((w) => !w[1]).map((w) => w[0]).join(" | "));
        const vorStand = quelle
            .replace("        this._rittSchritt(dt);\n", "")
            .replace(
                /(\n {4}_tickMountedMovement\(_?dt\) \{)/,
                "$1\n        const pm = this.state.playerMesh.position;\n        pm.y = 0;\n        entry._rideSteer = false;"
            );
        const rot = taktWand(vorStand);
        check(
            "Selbst-Test W: der Vor-Stand (Sitz im Frame, Flag lebt, kein Sim-Ritt) → W1 W2 W3 feuern",
            rot.filter((w) => !w[1]).length === 3,
            rot.map((w) => `${w[1] ? "✓" : "✗"} ${w[0].slice(0, 2)}`).join(" ")
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN — die Takt-Linse nennt Teleport, Weg, Luft und Gier beim Namen.");
        process.exit(0);
    }

    console.log("=== W — DIE STATISCHE WAND (Node, kommentarfrei) ===");
    for (const [name, ok, detail] of taktWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")))
        check(name, ok, detail);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const messort = JSON.parse(fs.readFileSync(path.join(root, "spec/profiband/haushalt.json"), "utf8")).messort.spieler;
    const out = await page.evaluate(probeTakt, { messort });
    await browser.close();
    server.close();

    console.log("=== T — DER RITT-TAKT (Q1 · F-D1 F-D2 F-D10), echter Frame (_gameLoopTick) ===");
    if (out.err) check("Probe ohne Ausnahme", false, out.err.split("\n")[0]);
    const zeile = (m) =>
        m && m.gestartet
            ? `teleport ${m.teleport}/${m.frames} · sim ${m.simWeg.toFixed(2)} m · fahrt ${m.fahrWeg.toFixed(2)} m · luft ${m.luft}/${m.schritte} · gier ${m.gierGrad.toFixed(1)}° · v ${m.v.toFixed(1)} m/s`
            : "nicht gestartet";
    const vGt = taktVerdict(out.gt);
    check(
        "T1 GT geradeaus (W, wechselnde Frame-Zeiten): kein Teleport, Sim-Weg = Fahr-Weg, Reiter sitzt, keine Gier ohne Lenkung",
        vGt.length === 0,
        `${zeile(out.gt)}${vGt.length ? " — Täter: " + vGt.join(", ") : ""}`
    );
    // Am Hang rollt der Wagen nur ein Stück: 1 m Weg ist Fahrt.
    const vHang = taktVerdict(out.gtHang, 1);
    check(
        "T2 GT am Hang ohne Taste (rollt zurück): kein Teleport, keine Gier ohne Lenkung",
        !!out.hang && vHang.length === 0,
        out.hang
            ? `Hang ${(out.hang.g * 100).toFixed(0)} % · ${zeile(out.gtHang)}${vHang.length ? " — Täter: " + vHang.join(", ") : ""}`
            : "kein Hang gefunden"
    );
    // Das Pferd geht Schritt (≈ 1,3 m/s): 2 m Weg in 180 Frames sind Fahrt; seine Gier folgt der Fahrt (kein Maß).
    const vRoss = taktVerdict(Object.assign({}, out.ross, { gierGrad: undefined }), 2);
    check(
        "T3 Pferd (richtungs-folgender Ritt): kein Teleport, Sim-Weg = Fahr-Weg, Reiter sitzt",
        vRoss.length === 0,
        `${zeile(out.ross)}${vRoss.length ? " — Täter: " + vRoss.join(", ") : ""}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Ritt fährt im Sim-Schritt: kein Teleport, der Weg der Sim ist der Weg des Wagens.");
    process.exit(0);
})().catch((e) => {
    console.error("Fahr-Leben-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
