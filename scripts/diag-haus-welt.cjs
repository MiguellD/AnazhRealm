// diag-haus-welt.cjs — DAS HAUS DER WELT IST BEGEHBAR, WIE ES GEZEICHNET IST (gate:haus-welt, Welle L 06.10., Klasse Q5).
// Befund der Leben-Prüfung (N-D2 bis N-D5, S-W3, S-W4; gespielt im sichtbaren Fenster): die Haus-Kollision der Welt las
// an keiner Stelle das Gesetzbuch — vier EG-Riegel (3,1 m) als achsparallele Welt-AABB: gedrehte Häuser 18–35 %
// begehbar, der Spieler hing 4,76 m vor der Tür, die Riegel waren eine Kletterwand, die Treppe Luft; der Fuß stand
// 0,50 m unter der Studio-Diele; das Solo-Haus stieß an den `haus_basis`-Block (3,09 m in der sichtbaren Wand); Bäume
// wuchsen in 5 von 8 Häusern. Die Linse ruft die ECHTEN Pfade (headless, Null-Renderer): `spawnSettlement` (das
// Drehbuch-Dorf 7/18), die Foundry liefert die Stufen, der Spieler geht über den Sim-Schritt (`_stepFixedSim`, W-Taste):
//   W1  TÜR: vom Podest vor der Haustür geht der Körper 1 m hinter die Schwelle — je Haus, gedrehte eingeschlossen
//   W2  DIELE: drinnen steht der Fuß auf der Diele des Gesetzbuchs (± 3 cm; das Gesetzbuch rechnet die Probe selbst)
//   W3  TREPPE: der Lauf EG→OG (die Flights des Gesetzbuchs) trägt den Körper ins Obergeschoss
//   W4  GRUNDRISS: kein Gewächs (Baum, Strauch, Totholz) steht im Grundriss eines Hauses
//   W5  KOLLISION == OPTIK: an jedem Punkt eines 0,5-m-Rasters im Kern-Grundriss urteilt die Welt-Kapsel (der echte
//       Löser `_resolveCapsuleVsAABB` gegen die Boxen des Hauses) wie das Gesetzbuch (dieselbe Wand-Regel gegen die Solids des Hauses): frei
//       oder Wand — Übereinstimmung ≥ 97 % (vorher füllten gedrehte Riegel den Raum, Innenwände fehlten)
//   --selftest: je Defekt serviert der Server die Basis-Zeile von anazhRealm.js — GENAU die Probe dieses Defekts wird rot.
//   node scripts/diag-haus-welt.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.HAUS_WELT_PORT || 4486);
const ROOT = path.resolve(__dirname, "..");
const SELBST = process.argv.includes("--selftest");
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};

// DIE BASIS-ZEILEN je Defekt: [geheilte Form in anazhRealm.js, Basis-Form].
const BASIS = {
    // ohne die Studio-Hülle: der generische Parts-Pfad (haus_basis), wie vor der Welle
    huelle: [["const hausBoxes = this._hausBlockerBoxen(entry);", "const hausBoxes = null;"]],
    // die gedrehte Box als achsparallele Welt-AABB gelesen
    obb: [["        const ob = box.obb;\n        if (ob) {", "        const ob = null;\n        if (ob) {"]],
    // die Natur wirft in den Grundriss, und das Dorf räumt nicht
    grundriss: [
        ["if (position && this._imGrundriss(position.x, position.z)) return null;", ""],
        ["if (entry) this._grundrissRaeumen(entry);", ""],
    ],
};
let patch = null;
let patchFehler = [];

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        if (patch && p === "/anazhRealm.js") {
            let txt = data.toString("utf8");
            for (const [geheilt, basis] of patch) {
                if (!txt.includes(geheilt)) patchFehler.push(`geheilte Zeile fehlt („${geheilt.slice(0, 70)}…")`);
                else txt = txt.replace(geheilt, basis);
            }
            data = Buffer.from(txt, "utf8");
        }
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

async function proben() {
    const r = window.anazhRealm;
    const s = r.state;
    const A = r.constructor;
    const FC = window.__fachwerkCore;
    const o = { haeuser: [] };
    if (!FC || typeof FC.HAUS !== "function") return { fehler: "__fachwerkCore fehlt" };
    const pm = s.playerMesh;
    const DT = A.FIXED_DT || 1 / 60;
    let t = 5000;
    const warte = (ms) => new Promise((rs) => setTimeout(rs, ms));
    const pumpe = async (n) => {
        for (let k = 0; k < n; k++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (k % 8 === 0) await warte(10);
        }
    };
    // ── das Drehbuch-Dorf 7/18 neben dem Spieler ──
    const start = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
    r.spawnSettlement({ seed: 7, nH: 18, x: start.x + 40, z: start.z + 40 });
    const dorfHaeuser = () => s.architectures.filter((e) => e.type && e.type.startsWith("haus_") && e.tuer && e.fundament);
    // der Export reist durch den Foundry-Worker: warten, bis die Slots stehen
    for (let k = 0; k < 120 && dorfHaeuser().length < 10; k++) {
        await pumpe(4);
        await warte(100);
    }
    const H = dorfHaeuser();
    o.gesamt = H.length;
    // die Probe des Gesetzbuchs je Haus (Rezept + Stempel + Same → HAUS): Diele und Flights
    const gesetz = (e) => {
        const kultur = e.type.slice(5);
        const pre = FC.PRESETS && FC.PRESETS[kultur];
        if (!pre) return null;
        const P = FC.hausParams(pre, e.studioOv || null);
        P.seed = e.seed;
        const Hh = FC.HAUS(window.THREE, FC.mat, P);
        Hh.build({ gelaende: false });
        return Hh;
    };
    const welt = (e, lx, lz) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        return { x: e.position.x + lx * c + lz * sn, z: e.position.z - lx * sn + lz * c };
    };
    const lokal = (e, x, z) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        const dx = x - e.position.x;
        const dz = z - e.position.z;
        return { x: dx * c - dz * sn, z: dx * sn + dz * c };
    };
    const geh = (n, zielX, zielZ) => {
        s.keys = s.keys || {};
        for (let k = 0; k < n; k++) {
            s.yaw = Math.atan2(zielX - pm.position.x, zielZ - pm.position.z);
            s.keys.w = true;
            r._stepFixedSim((t += DT), DT);
        }
        s.keys.w = false;
        for (let k = 0; k < 10; k++) r._stepFixedSim((t += DT), DT);
    };
    const stell = (x, y, z) => {
        pm.position.set(x, y, z);
        s._fieldVy = 0;
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
        for (let k = 0; k < 20; k++) r._stepFixedSim((t += DT), DT);
    };
    const FUSS = A.PLAYER_FOOT_OFFSET;
    for (const e of H.slice(0, 8)) {
        const h = { typ: e.type, gierGrad: Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360) };
        o.haeuser.push(h);
        // die Stufe 0 holen: der Spieler steht am Haus, bis die Foundry die Hülle der Stufe 0 liefert
        stell(e.position.x, e.position.y + 3, e.position.z);
        for (let k = 0; k < 40 && !(e._servedLod === 0); k++) await pumpe(10);
        h.stufe = e._servedLod;
        h.huelle = e._hausHuelle ? e._hausHuelle.stufe : null;
        const Hh = gesetz(e);
        if (!Hh) {
            h.fehler = "kein Gesetzbuch";
            continue;
        }
        const tu = e.tuer;
        const base = e.position.y - 0.5;
        // W1 TÜR: vom Podest-Rand vor der Tür 1,8 m nach innen
        const vor = welt(e, tu.x, tu.z - 0.25);
        const innen = welt(e, tu.x, tu.z + 1.8);
        stell(vor.x, base + 0.75 + FUSS, vor.z);
        geh(150, innen.x, innen.z);
        const l = lokal(e, pm.position.x, pm.position.z);
        h.tuerDrinM = Math.round((l.z - tu.z) * 100) / 100;
        // W2 DIELE: der Fuß steht auf einer Fläche des Gesetzbuchs — die nächste Solid-Oberkante, deren Grundfläche den
        // Kapsel-Kreis trifft (das Gesetzbuch rechnet sie selbst, nie die Blocker der Welt)
        const fussL = pm.position.y - FUSS - base;
        const rK = A.PLAYER_WALL_RADIUS || 0.35;
        let best = Infinity;
        for (const so of Hh.solids || []) {
            const qx = Math.max(so.min[0], Math.min(l.x, so.max[0]));
            const qz = Math.max(so.min[2], Math.min(l.z, so.max[2]));
            if ((qx - l.x) ** 2 + (qz - l.z) ** 2 > rK * rK) continue;
            const d = fussL - so.max[1];
            if (Math.abs(d) < Math.abs(best)) best = d;
        }
        h.dieleCm = Number.isFinite(best) ? Math.round(best * 1000) / 10 : null;
        // W5 KOLLISION == OPTIK auf der Diele-Ebene: die Welt-Kapsel gegen die Gesetzbuch-Wand-Regel je Rasterpunkt
        {
            const STEP = A.PLAYER_STEP_UP;
            const rW = A.PLAYER_WALL_RADIUS || 0.35;
            const fussY = 0.66; // haus-lokal knapp über der EG-Diele
            let gleich = 0;
            let n = 0;
            for (let gx = -tu.W / 2 + 0.25; gx < tu.W / 2; gx += 0.5)
                for (let gz = -tu.D / 2 + 0.25; gz < tu.D / 2; gz += 0.5) {
                    // das Gesetzbuch: eine Box, deren Oberkante über der Stufe-hoch-Linie liegt und die den Körper
                    // (Fuß … Fuß + 2·FUSS) schneidet, ist Wand, wenn der Kreis sie berührt — die Regel des Kapsel-Lösers
                    let gesetzWand = false;
                    for (const so of Hh.solids || []) {
                        if (!(so.max[1] > fussY + STEP && so.min[1] < fussY + 2 * FUSS)) continue;
                        const qx = Math.max(so.min[0], Math.min(gx, so.max[0]));
                        const qz = Math.max(so.min[2], Math.min(gz, so.max[2]));
                        if ((qx - gx) ** 2 + (qz - gz) ** 2 < rW * rW) {
                            gesetzWand = true;
                            break;
                        }
                    }
                    const w = welt(e, gx, gz);
                    // der Löser der Kapsel je Box (`_resolveCapsuleVsAABB`) gegen die Boxen DIESES Hauses (das Nachbarhaus in der
                    // Reihe ist nicht sein Gesetzbuch)
                    const pos = { x: w.x, z: w.z };
                    for (const bx of e.blockerAABBs || [])
                        r._resolveCapsuleVsAABB(bx, pos, base + fussY, base + fussY + 2 * FUSS, rW, -Infinity);
                    const weltWand = Math.hypot(pos.x - w.x, pos.z - w.z) > 1e-3;
                    n++;
                    if (weltWand === gesetzWand) gleich++;
                }
            h.optikProzent = n ? Math.round((gleich / n) * 1000) / 10 : null;
        }
        // W3 TREPPE: der Lauf EG→OG
        const fl = ((Hh.dims && Hh.dims.flights) || []).find((f) => f.atLevel === 1 && f.x1 - f.x0 > 0.3);
        if (fl) {
            const xm = (fl.x0 + fl.x1) / 2;
            const a = welt(e, xm, fl.zFoot - fl.dir * 0.5);
            const z2 = welt(e, xm, fl.zFoot + fl.dir * (fl.N * fl.go + 0.8));
            stell(a.x, base + fl.base + 0.1 + FUSS, a.z);
            const y0 = pm.position.y;
            geh(300, z2.x, z2.z);
            h.treppeSteigM = Math.round((pm.position.y - y0) * 100) / 100;
            h.treppeSollM = Math.round(fl.N * fl.rise * 100) / 100;
        }
    }
    // W4 GRUNDRISS: kein Gewächs im Grundriss — nach dem Pumpen der Natur-Schlange
    stell(start.x + 40, start.y + 3, start.z + 40);
    await pumpe(200);
    let imHaus = 0;
    let gewaechse = 0;
    const taeter = [];
    for (const e of s.architectures) {
        // ein Gewächs — am Eintrag erkannt (Wald-Art, Bauplan-Präfix, Totholz) oder an der Studio-Art (Impostor-Zeile)
        const pr = r._foundryPresetForEntry(e);
        const gew =
            !!e._lodSpecies ||
            e.type === "stamm_gefallen" ||
            /^(baum_|busch_|grown_)/.test(e.type) ||
            !!(pr && r._foundryPresetIsTree(pr));
        if (!gew) continue;
        gewaechse++;
        for (const hs of H) {
            const lx = lokal(hs, e.position.x, e.position.z);
            if (Math.abs(lx.x) <= hs.fundament.ex && Math.abs(lx.z) <= hs.fundament.ez) {
                imHaus++;
                if (taeter.length < 6) taeter.push(e.type + "@" + hs.type);
                break;
            }
        }
    }
    o.w4 = { gewaechse, imHaus, taeter };
    pm.position.set(start.x, start.y, start.z);
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    const hs = o.haeuser.filter((h) => !h.fehler);
    if (!(hs.length >= 6)) f.push(`Aufbau: ${hs.length} Häuser geprüft (Soll ≥ 6)`);
    const gedreht = hs.filter((h) => Math.abs(((h.gierGrad % 90) + 90) % 90) > 5 && Math.abs(((h.gierGrad % 90) + 90) % 90) < 85);
    if (!(gedreht.length >= 2)) f.push(`Aufbau: ${gedreht.length} gedrehte Häuser (Soll ≥ 2)`);
    const nichtL0 = hs.filter((h) => h.stufe !== 0 || h.huelle !== 0);
    if (nichtL0.length) f.push(`Aufbau: ${nichtL0.length} Häuser ohne Stufe 0 / Hülle 0 (${nichtL0.map((h) => h.typ).join(" ")})`);
    const zu = hs.filter((h) => !(h.tuerDrinM >= 1.0));
    if (zu.length) f.push(`W1 Tür: ${hs.length - zu.length} von ${hs.length} Häusern betreten (${zu.map((h) => h.typ + "@" + h.gierGrad + "°:" + h.tuerDrinM).join(" ")})`);
    const diele = hs.filter((h) => h.tuerDrinM >= 1.0 && !(Math.abs(h.dieleCm) <= 3));
    if (diele.length) f.push(`W2 Diele: ${diele.length} Häuser mit dem Fuß neben der Diele (${diele.map((h) => h.typ + ":" + h.dieleCm + " cm").join(" ")})`);
    const mitTreppe = hs.filter((h) => Number.isFinite(h.treppeSollM));
    if (!(mitTreppe.length >= 3)) f.push(`Aufbau: ${mitTreppe.length} Häuser mit EG→OG-Lauf (Soll ≥ 3)`);
    const unten = mitTreppe.filter((h) => !(h.treppeSteigM >= 0.9 * h.treppeSollM));
    if (unten.length) f.push(`W3 Treppe: ${mitTreppe.length - unten.length} von ${mitTreppe.length} Läufen tragen ins OG (${unten.map((h) => h.typ + ":" + h.treppeSteigM + "/" + h.treppeSollM).join(" ")})`);
    const optik = hs.filter((h) => !(h.optikProzent >= 97));
    if (optik.length) f.push(`W5 Kollision == Optik: ${optik.length} Häuser unter 97 % (${optik.map((h) => h.typ + "@" + h.gierGrad + "°:" + h.optikProzent + " %").join(" ")})`);
    if (o.w4 && o.w4.imHaus) f.push(`W4 Grundriss: ${o.w4.imHaus} Gewächse im Grundriss eines Hauses (${o.w4.taeter.join(" ")})`);
    return f;
}

function zeile(o) {
    if (o.fehler) return o.fehler;
    const hs = o.haeuser.filter((h) => !h.fehler);
    return (
        `${hs.length} Häuser (${hs.map((h) => h.gierGrad + "°").join(" ")}) · W1 Tür ${hs.filter((h) => h.tuerDrinM >= 1).length}/${hs.length}` +
        ` · W2 Diele ${hs.map((h) => h.dieleCm).join("/")} cm · W3 Treppe ${hs.filter((h) => Number.isFinite(h.treppeSollM)).map((h) => h.treppeSteigM + "/" + h.treppeSollM).join(" ")} m` +
        ` · W4 Gewächse im Grundriss ${o.w4 ? o.w4.imHaus + "/" + o.w4.gewaechse : "?"} · W5 Optik ${hs.map((h) => h.optikProzent).join("/")} %`
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 900000, args: ["--no-sandbox", "--disable-gpu"] });
    let rot = 0;
    try {
        const lauf = async (inj) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
            // je Lauf ein eigener Browser-Kontext: kein Speicherstand (Save, IndexedDB) des Vorlaufs reist in die nächste
            // Welt (ein gespeichertes Dorf stünde sonst unter dem neu gegründeten)
            const kontext = await browser.createBrowserContext();
            const page = await kontext.newPage();
            page.setDefaultTimeout(880000);
            const errs = [];
            page.on("pageerror", (e) => errs.push((e.message || String(e)).split("\n")[0]));
            await page.evaluateOnNewDocument(() => {
                window.__anazhHeadlessNullRenderer = true;
            });
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 180000 });
            await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
                timeout: 180000,
            });
            await page.evaluate(async () => {
                const r = window.anazhRealm;
                let last = -1;
                let stable = 0;
                for (let t = 0; t < 3000; t++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 20 && stable > 40) break;
                    if (t % 10 === 0) await new Promise((res) => setTimeout(res, 0));
                }
            });
            const o = await page.evaluate(proben);
            await kontext.close();
            patch = null;
            return { o, errs, pf: patchFehler.slice() };
        };
        if (SELBST) {
            const soll = { huelle: ["W3 Treppe", "W5 Kollision"], obb: ["W5 Kollision"], grundriss: ["W4 Grundriss"] };
            for (const inj of Object.keys(soll)) {
                const { o, pf } = await lauf(inj);
                const f = urteil(o);
                const fehlt = soll[inj].filter((x) => !f.some((y) => y.startsWith(x)));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj].map((x) => f.find((y) => y.startsWith(x)) || `${x}: grün (blind!)`).join(" | ");
                console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`);
                if (!ok) rot++;
            }
        }
        const { o, errs } = await lauf(null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        if (errs.length) console.log("  ❌ Seiten-Fehler: " + errs[0]);
        rot += f.length + (errs.length ? 1 : 0);
        if (process.env.HAUS_WELT_JSON) fs.writeFileSync(process.env.HAUS_WELT_JSON, JSON.stringify(o, null, 1));
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:haus-welt ROT (${rot})` : "✅ gate:haus-welt grün");
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
