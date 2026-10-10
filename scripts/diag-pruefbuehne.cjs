#!/usr/bin/env node
// gate:pruefbuehne — WO DIE WILDNIS NICHT TRÄGT, WIRFT DAS FELD NICHTS.
//
// Die Prüfbühne (spec/pruefbuehne/welt.json) trägt statt der Wildnis analytische Terme; auf ihr steht nur, was ihre Saat
// und die Linse setzen. Das Feld handelt dort nie: kein Wald, keine Streu, kein ungesetztes Tier — und kein Wurf des
// Nexus. Die Gegenprüfung 10.10. fand den Nexus als Wurf, den kein Prädikat hielt: sein Pool (`dslComposeAtomic`) baut
// alle 24 s an `far_player`, und auf der Bühne standen nach vier Würfen ein Tempel, ein Wasserfall und ein Dorf aus 33
// Objekten (12 Bäume) — nur `spawn_creature` fragte `_kreaturGeburtsOrt`. Diese Linse nennt jeden Wurf beim Namen.
//
// Je Welt (Standard = die Wildnis als FELD-KONTROLLE; Bühne, importiert wie im Spiel) misst sie:
//   (1) DIE WÜRFE: jede Ort-Op der Welt-Akte (Tier, Baum, Studio-Werk, Insel, UFO, Dorf, Tempel, Wasserfall, Bauplan,
//       Fraktal, Füll-Kugel) mit der Quelle des Feldes — `nexus` und `rule:nexus` — und ihr Zuwachs an Welt-Substanz
//       (Bauten, Tiere, Inseln, UFOs, Pflanz-Schlange, Dorf-Zellen, Edits). Bühne: 0 je Op; Wildnis: > 0 (die Linse sieht).
//   (2) DER AKT: dieselbe Op als Mensch (`human`) setzt auch auf der Bühne (das Prädikat hält das Feld, nie die Hand).
//   (3) DER NEXUS-TAKT, getrieben: N Evolutionen (`evolveNexus` + `_loopNexusUpdate`, Wirk-Kraft voll — im Spiel alle
//       24 s eine) und ein Takt, in dem seine Regeln feuern. Bühne: Zuwachs 0.
//   (4) DER ABSENZ-ZENSUS in 300 m nach dem Takt: fremde Bauten, Streu-Zellen, Nah-Streu, Tiere, Inseln, Dorf-Zellen,
//       Pflanz-Schlange, Flüsse — auf der Bühne 0.
//
//   node scripts/diag-pruefbuehne.cjs [--json datei] [--evolutionen 60] [--wurzel dir]
//                                                  (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-pruefbuehne.cjs --selftest   zusätzlich: auf der Bühne trägt die Wildnis zum Schein überall
//                                                  (`_wildnisTraegt` → true) — die Würfe MÜSSEN rot werden, beim Namen
// Port: PRUEFBUEHNE_PORT (Default 4394). Exit 1 bei einem Wurf auf der Bühne, einem gehaltenen Akt, einer blinden
// Kontrolle, einem Page-Error oder einem roten Selbsttest.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SELBSTTEST = argv.includes("--selftest");
const JSON_AUS = opt("--json", null);
const EVOLUTIONEN = Math.max(1, Number(opt("--evolutionen", 60)) || 60);
const PORT = Number(process.env.PRUEFBUEHNE_PORT) || 4394;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const BUEHNE_DATEI = path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
    });
});

// Die Würfe: jede Ort-Op der Welt-Akte in ihrer kanonischen Form (die Orte, die der Nexus selbst wählt).
const WUERFE = [
    ["spawn_creature", ["near_player", 20], 3, "happy"],
    ["spawn_tree", ["far_player", 40, 90], 3],
    ["spawn_studio", "eiche", ["far_player", 40, 90], 2],
    ["spawn_island", ["far_player", 60, 120]],
    ["spawn_ufo", ["near_player", 30]],
    ["spawn_village", ["far_player", 180, 380]],
    ["spawn_temple", ["far_player", 180, 380]],
    ["spawn_waterfall", ["far_player", 180, 380]],
    ["spawn_blueprint", "baum_eiche", ["near_player", 25]],
    ["spawn_fractal", ["far_player", 220, 400], "temple", 1, 0.5],
];

// Boot bis die Welt steht (der Null-Renderer wie im Playtest: Würfe sind Zustand, kein Bild).
async function boote(page) {
    return page.evaluate(async () => {
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
                if (s && s.voxelChunks && s.voxelChunks.size > 4 && s.voxelWorkerReady && s.voxelWorkerWorldgenSynced)
                    return { ok: true, ms: Math.round(performance.now() - start), seed: s.worldMeta.seed };
            }
            await new Promise((res) => setTimeout(res, 16));
        }
        return { ok: false };
    });
}

// Die Probe in der Seite: (1)–(4) einer Welt.
async function probe(page, welt, wuerfe, evolutionen, schein) {
    return page.evaluate(
        async (welt, wuerfe, evolutionen, schein) => {
            const r = window.anazhRealm;
            const s = r.state;
            const out = { welt, wuerfe: [], akt: null, nexus: null, zensus: null, befunde: [] };
            const takt = async (ms) => {
                const t0 = performance.now();
                while (performance.now() - t0 < ms) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {
                        /* ein Takt-Fehler zählt der Page-Error */
                    }
                    await new Promise((res) => setTimeout(res, 16));
                }
            };
            // Die Welt reift aus (Genesis-Ring, Vorschauen, Start-Dorf der Wildnis): erst wenn ihr Bestand 4 s steht, misst
            // die Linse — was danach wächst, ist ein Wurf.
            {
                let n = -1;
                let still = 0;
                const t0 = performance.now();
                while (performance.now() - t0 < 40000 && still < 4) {
                    await takt(1000);
                    const m = (s.architectures || []).length + (s.creatures || []).length;
                    still = m === n ? still + 1 : 0;
                    n = m;
                }
            }
            const wm = () => s.worldMeta || {};
            // Die Welt-Substanz als Mengen (Identität, nie Länge): der Hort-Deckel des Nexus (MAX_NEXUS_STRUCTURES) lässt
            // für jeden neuen Bau den fernsten verblassen — eine Länge sähe den Wurf dann nicht.
            const substanz = () => ({
                bauten: new Set(s.architectures || []),
                tiere: new Set(s.creatures || []),
                inseln: new Set(s.floatingIslands || []),
                ufos: new Set(s.ufos || []),
                pflanzSchlange: new Set(s.pendingVegSpawns || []),
                dorfZellen: new Set(Object.keys(wm().settlementCells || {})),
                edits: new Set(wm().voxelEdits || []),
            });
            const zuwachs = (a, b) => {
                const d = {};
                let summe = 0;
                for (const k of Object.keys(a)) {
                    let x = 0;
                    for (const e of b[k]) if (!a[k].has(e)) x++;
                    if (x > 0) {
                        d[k] = x;
                        summe += x;
                    }
                }
                return { summe, d };
            };
            const lauf = async (prog, quelle) => {
                const vor = substanz();
                let res = null;
                try {
                    res = r.dslRun(prog, { source: quelle });
                } catch (e) {
                    res = { wurf: String((e && e.message) || e).slice(0, 160) };
                }
                // das Dorf (und das Fraktal) reist über den Worker, die Pflanz-Schlange leert sich im Takt
                await takt(prog[0] === "spawn_village" || prog[0] === "spawn_fractal" ? 3000 : 700);
                const z = zuwachs(vor, substanz());
                const log = res && Array.isArray(res.log) ? res.log : [];
                const halt = log.find((l) => l && l.event === "invalid_position");
                return {
                    op: prog[0],
                    quelle,
                    zuwachs: z.summe,
                    was: z.d,
                    ereignisse: log
                        .map((l) => l && l.event)
                        .filter(Boolean)
                        .slice(0, 4),
                    grund: halt ? halt.grund : null,
                };
            };
            if (schein) r._wildnisTraegt = () => true; // der Selbsttest: das Prädikat trägt zum Schein überall
            const basis = Object.fromEntries(Object.entries(substanz()).map(([k, v]) => [k, v.size]));
            const bestand = new Set(s.architectures || []); // der Bestand der Welt und, nach (2), das Gesetzte
            // (1) DIE WÜRFE des Feldes
            for (const prog of wuerfe)
                for (const quelle of ["nexus", "rule:nexus"]) out.wuerfe.push(await lauf(prog, quelle));
            // (2) DER AKT: der Mensch setzt überall
            out.akt = await lauf(["spawn_blueprint", "baum_eiche", ["near_player", 25]], "human");
            if (schein) return Object.assign(out, { basis, erbgut: r._erbgut().terme.map((t) => t.art) });
            for (const e of s.architectures || []) bestand.add(e);
            // (3) DER NEXUS-TAKT, getrieben (im Spiel eine Evolution alle 24 s)
            {
                const vor = substanz();
                const zaehl = {};
                let laeufe = 0;
                for (let i = 0; i < evolutionen; i++) {
                    s.nexusWirk = 1e9; // die Wirk-Kraft hält den Takt nicht an
                    if (r.nexus && r.nexus.knightOfTime) r.nexus.knightOfTime.autonomyLevel = 0;
                    r.evolveNexus(performance.now() / 1000);
                    const evo = s.nexusEvolutionQueue[s.nexusEvolutionQueue.length - 1];
                    const kopf = evo && Array.isArray(evo.program) ? String(evo.program[0]) : "?";
                    const innen = JSON.stringify((evo && evo.program) || []).match(/"spawn_[a-z_]+"/g) || [];
                    for (const w of innen) zaehl[w.replace(/"/g, "")] = (zaehl[w.replace(/"/g, "")] || 0) + 1;
                    if (kopf) laeufe++;
                    r._loopNexusUpdate();
                    if (i % 10 === 9) await takt(400);
                }
                await takt(6000); // die Regeln des Nexus feuern, das Dorf landet
                const z = zuwachs(vor, substanz());
                out.nexus = { evolutionen: laeufe, wuerfeImPool: zaehl, zuwachs: z.summe, was: z.d };
            }
            // (4) DER ABSENZ-ZENSUS in 300 m um den Ursprung der Welt (die Genesis-Plattform)
            {
                const pl = typeof r._genesisPlattform === "function" ? r._genesisPlattform() : null;
                const M = pl && pl.position ? { x: pl.position.x, z: pl.position.z } : { x: 0, z: 0 };
                const R = 300;
                const d = (p) => Math.hypot(p.x - M.x, p.z - M.z);
                const fremd = {};
                for (const e of s.architectures || [])
                    if (e && e.position && d(e.position) <= R && !bestand.has(e))
                        fremd[e.type] = (fremd[e.type] || 0) + 1;
                let streu = 0;
                const SC = r.constructor.SCATTER;
                if (s.scatterRegions && SC)
                    for (const [key, reg] of s.scatterRegions) {
                        const [rx, rz] = key.split(",").map(Number);
                        const c = { x: (rx + 0.5) * SC.regionM, z: (rz + 0.5) * SC.regionM };
                        if (d(c) <= R + SC.regionM * 0.71) streu += (reg && reg.instanceCount) || 0;
                    }
                let nahStreu = 0;
                if (s.nahStreu && s.nahStreu.kacheln)
                    for (const k of s.nahStreu.kacheln.values()) nahStreu += (k.items || []).length;
                const h = s.hydrosphere;
                out.zensus = {
                    R,
                    fremdeBauten: fremd,
                    streuZellen: streu,
                    nahStreu,
                    tiere: (s.creatures || []).filter((c) => c && c.position && d(c.position) <= R).length,
                    inseln: (s.floatingIslands || []).length,
                    dorfZellen: Object.keys(wm().settlementCells || {}).length,
                    pflanzSchlange: (s.pendingVegSpawns || []).length,
                    fluesse: h && Array.isArray(h.rivers) ? h.rivers.length : null,
                };
            }
            out.basis = basis;
            out.erbgut = typeof r._erbgut === "function" ? r._erbgut().terme.map((t) => t.art) : ["wildnis(alt)"];
            return out;
        },
        welt,
        wuerfe,
        evolutionen,
        !!schein
    );
}

function zeige(rep) {
    console.log(`\n  ── ${rep.welt.toUpperCase()} · Erbgut [${rep.erbgut.join(", ")}]${rep.schein ? " · SCHEIN" : ""}`);
    for (const w of rep.wuerfe)
        console.log(
            `    ${w.zuwachs > 0 ? "WURF " : "—    "} ${w.op.padEnd(16)} ${w.quelle.padEnd(11)} +${w.zuwachs} ${
                w.zuwachs > 0 ? JSON.stringify(w.was) : ""
            }${w.grund ? "  (" + w.grund + ")" : ""}`
        );
    console.log(
        `    Akt (human) spawn_blueprint: +${rep.akt.zuwachs} ${JSON.stringify(rep.akt.was)}${rep.akt.grund ? "  (" + rep.akt.grund + ")" : ""}`
    );
    if (!rep.nexus) return;
    console.log(
        `    Nexus-Takt: ${rep.nexus.evolutionen} Evolutionen, Würfe im Pool ${JSON.stringify(rep.nexus.wuerfeImPool)} → Zuwachs +${rep.nexus.zuwachs} ${JSON.stringify(rep.nexus.was)}`
    );
    console.log(`    Zensus ${rep.zensus.R} m: ${JSON.stringify(rep.zensus)}`);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const url = `http://127.0.0.1:${PORT}/index.html`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
        try {
            localStorage.clear();
        } catch (_e) {
            /* */
        }
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("\n========= DIE PRÜFBÜHNE — wo die Wildnis nicht trägt, wirft das Feld nichts =========");
    let rot = false;
    const berichte = {};
    const laeufe = [
        ["standard", false],
        ["buehne", false],
    ];
    if (SELBSTTEST) laeufe.push(["buehne", true]);
    let importiert = false;
    for (const [welt, schein] of laeufe) {
        if (welt === "buehne" && !importiert) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            // Geboren wie im Spiel: importWorldBeside (Welt-Tor) + aktiv + Reload.
            const id = await page.evaluate((json) => {
                const r = window.anazhRealm;
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r.activeWorldSet(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            importiert = id;
        }
        if (welt === "buehne") {
            // jeder Bühnen-Lauf auf frischer Bühne (der Schein-Lauf erbt nichts vom sauberen)
            await page.evaluate((id) => {
                const r = window.anazhRealm;
                r.activeWorldSet(id);
            }, importiert);
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        }
        const b = await boote(page);
        if (!b.ok) {
            console.log(`  ⛔ Welt ${welt}: Boot nicht bereit nach 120 s`);
            rot = true;
            continue;
        }
        const rep = await probe(page, welt, WUERFE, EVOLUTIONEN, schein);
        rep.schein = schein;
        rep.bootMs = b.ms;
        zeige(rep);
        berichte[welt + (schein ? "-schein" : "")] = rep;
        const wurfe = rep.wuerfe.filter((w) => w.zuwachs > 0);
        if (welt === "standard") {
            // DIE FELD-KONTROLLE: in der Wildnis wirft das Feld — sonst ist die Linse blind
            const bau = wurfe.some((w) => (w.was.bauten || 0) > 0);
            const tier = wurfe.some((w) => (w.was.tiere || 0) > 0);
            if (!bau || !tier) {
                rep.befunde.push(
                    `Kontrolle blind: in der Wildnis warf das Feld ${bau ? "" : "keinen Bau "}${tier ? "" : "kein Tier"}`
                );
            }
            if (rep.akt.zuwachs < 1) rep.befunde.push("der Akt (human) setzte in der Wildnis nichts");
        } else if (!schein) {
            for (const w of wurfe)
                rep.befunde.push(`WURF auf der Bühne: ${w.op} (${w.quelle}) +${w.zuwachs} ${JSON.stringify(w.was)}`);
            if (rep.nexus.zuwachs > 0)
                rep.befunde.push(
                    `der Nexus-Takt warf auf der Bühne +${rep.nexus.zuwachs} ${JSON.stringify(rep.nexus.was)}`
                );
            if (rep.akt.zuwachs < 1)
                rep.befunde.push("der Akt (human) setzte auf der Bühne nichts — das Prädikat hält die Hand");
            const z = rep.zensus;
            const fremd = Object.keys(z.fremdeBauten);
            if (fremd.length) rep.befunde.push(`Zensus: fremde Bauten ${JSON.stringify(z.fremdeBauten)}`);
            for (const k of ["streuZellen", "nahStreu", "inseln", "dorfZellen", "pflanzSchlange", "fluesse"])
                if (z[k]) rep.befunde.push(`Zensus: ${k} ${z[k]}`);
            // die Tiere: nur das gesetzte (der Akt pflanzt einen Baum, kein Tier) — jedes Tier ist ein Wurf
            if (z.tiere) rep.befunde.push(`Zensus: ${z.tiere} Tiere, die niemand setzte`);
        }
        if (!schein) {
            for (const f of rep.befunde) console.log(`    ⛔ ${f}`);
            if (rep.befunde.length) rot = true;
        }
    }
    let selbst = null;
    if (SELBSTTEST && berichte["buehne-schein"]) {
        const s = berichte["buehne-schein"];
        const namen = s.wuerfe.filter((w) => w.zuwachs > 0).map((w) => `${w.op}/${w.quelle}`);
        selbst = { benannt: namen };
        console.log(
            `\n  SELBSTTEST (die Wildnis trägt zum Schein überall): ${namen.length} Würfe beim Namen — ${namen.join(", ")}`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ berichte, selbst }, null, 1));
    if (pageErr) rot = true;
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.benannt.length > 0;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: auf der Bühne wirft das Feld nichts, der Akt setzt, die Wildnis wirft — und der Schein fällt rot beim Namen" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "der Schein blieb unentdeckt (die Linse ist blind)")}\n`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? "Auf der Bühne wirft das Feld nichts (Würfe 0, Nexus 0, Zensus 0); der Akt setzt, die Wildnis wirft" : "DAS FELD WIRFT AUF DER BÜHNE"}\n`
        );
    }
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("⛔", e && e.stack ? e.stack : e);
    process.exit(1);
});
