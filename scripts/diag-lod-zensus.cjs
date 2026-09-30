// diag-lod-zensus.cjs — DER STUDIO-LOD-ZENSUS (Schöpfer 30.09.: „falls nicht optimal, messen wir die
// Studios einheitlich — shit in, shit out"). EINE Messung über ALLE Studios: jedes Foundry-Rezept
// über seine deklarierten Stufen (kindStages, dieselbe Auflösung wie `_foundryFlattenFor`), je Stufe
// Dreiecke + Vertices + Teile, dazu der Reduktions-Faktor zur Vorstufe. Das Soll steht schon im
// Repo: das Profi-Band (Referenz-Spiel des Schöpfers, 09.07.: 680k Dreiecke · 208 Draw-Calls je
// Frame bei 60 fps, `diag-perf-parity`). Eine LOD-Stufe, die nicht mindestens halbiert, ist keine
// Stufe (Lehre 19) — die Linse nennt sie beim Namen.
//   node scripts/diag-lod-zensus.cjs [--nur tree,haus] [--json out.json]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.ZENSUS_PORT || 4561);
const root = path.resolve(__dirname, "..");
const argOf = (k, d) => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : d;
};
const NUR = argOf("--nur", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const JSON_OUT = argOf("--json", "");
// Eine Stufe reduziert, wenn sie höchstens die Hälfte der Vorstufe trägt.
const REDUKTION_MAX = 0.5;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
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
const fmt = (n) =>
    !Number.isFinite(n)
        ? "—"
        : n >= 1e6
          ? (n / 1e6).toFixed(2) + "M"
          : n >= 1e3
            ? (n / 1e3).toFixed(1) + "k"
            : String(n);

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhForceFoundry = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const Z = await page.evaluate(async (NUR) => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        const dl = performance.now() + 90000;
        while (
            (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await sleep(100);
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        if (!f) return { err: "kein Foundry-Objekt" };
        const dlF = performance.now() + 90000;
        while (!(f.ready && f.recipeCount > 0) && performance.now() < dlF) await sleep(100);
        if (!f.ready) return { err: "Worker nicht ready" };
        const A = r.constructor;
        const cfg = (A._studioRenderConfig && A._studioRenderConfig.lod) || {};
        const stufenFuer = (rec) => {
            let st = cfg.kindStages ? cfg.kindStages[rec.kind] : null;
            if (!Array.isArray(st) && cfg.zusatzKindStages)
                for (const dom in cfg.zusatzKindStages) {
                    const z = cfg.zusatzKindStages[dom];
                    if (z && Array.isArray(z[rec.kind])) st = z[rec.kind];
                }
            if (!Array.isArray(st) || !st.length) {
                const kl = A.FOUNDRY_KIND_LOD ? A.FOUNDRY_KIND_LOD[rec.kind] : null;
                st = Number.isFinite(kl) ? [kl] : [0];
            }
            return st;
        };
        const zaehle = (meshes) => {
            let tris = 0,
                verts = 0,
                teile = 0;
            for (const m of meshes || []) {
                if (!m || m.kind === "__baumGrammatik" || m.kind === "__skelett") continue;
                const pos = m.position || (m.attributes && m.attributes.position);
                const pa = pos && (pos.array || pos);
                const idx = m.index || m.indices || (m.attributes && m.attributes.index);
                const ia = idx && (idx.array || idx);
                const v = pa && pa.length ? (pa.length / 3) | 0 : 0;
                verts += v;
                tris += ia && ia.length ? (ia.length / 3) | 0 : (v / 3) | 0;
                teile++;
            }
            return { tris, verts, teile };
        };
        const out = [];
        const ids = Object.keys(f.recipes || {}).sort();
        for (const id of ids) {
            const rec = f.recipes[id];
            if (!rec || !rec.kind) continue;
            if (NUR.length && !NUR.includes(rec.kind)) continue;
            const stufen = stufenFuer(rec);
            const zeile = { id, kind: rec.kind, stufen: {} };
            for (const lod of stufen) {
                let meshes = null;
                try {
                    meshes = await Promise.race([
                        r._foundryRequest(id, 0, lod, "summer"),
                        sleep(60000).then(() => "zeit"),
                    ]);
                } catch (e) {
                    meshes = null;
                }
                zeile.stufen[lod] = meshes === "zeit" ? { zeit: true } : meshes ? zaehle(meshes) : { leer: true };
            }
            out.push(zeile);
        }
        return { zeilen: out, rezepte: ids.length };
    }, NUR);
    await browser.close();
    server.close();
    if (Z.err) {
        console.error("⛔ ZENSUS NICHT LAUFFÄHIG:", Z.err);
        process.exit(1);
    }
    // Je Art: Zeilen + Verdikt „reduziert nicht" (Stufe n+1 trägt mehr als die Hälfte von n).
    const nachArt = {};
    for (const z of Z.zeilen) (nachArt[z.kind] = nachArt[z.kind] || []).push(z);
    const taeter = [];
    console.log(`===== DER STUDIO-LOD-ZENSUS — ${Z.zeilen.length} Rezepte (von ${Z.rezepte}) =====`);
    console.log("Soll (Profi-Band, Referenz-Spiel 09.07.): 680k Dreiecke · 208 Draw-Calls je FRAME bei 60 fps\n");
    for (const kind of Object.keys(nachArt).sort()) {
        const zs = nachArt[kind];
        const stufen = Object.keys(zs[0].stufen).map(Number);
        const summe = stufen.map((s) => zs.reduce((a, z) => a + ((z.stufen[s] && z.stufen[s].tris) || 0), 0));
        const n = zs.length;
        console.log(
            `${kind} (${n}×): ` +
                stufen.map((s, i) => `L${s} Ø ${fmt(Math.round(summe[i] / n))} Tris`).join(" · ") +
                `  | max L${stufen[0]}: ${fmt(Math.max(...zs.map((z) => (z.stufen[stufen[0]] && z.stufen[stufen[0]].tris) || 0)))}`
        );
        for (const z of zs) {
            for (let i = 1; i < stufen.length; i++) {
                const a = z.stufen[stufen[i - 1]],
                    b = z.stufen[stufen[i]];
                if (a && b && a.tris > 0 && b.tris > 0 && b.tris / a.tris > REDUKTION_MAX)
                    taeter.push(
                        `${z.id} (${kind}): L${stufen[i]} ${fmt(b.tris)} = ${Math.round((100 * b.tris) / a.tris)} % von L${stufen[i - 1]} ${fmt(a.tris)}`
                    );
            }
        }
    }
    const offen = Z.zeilen.flatMap((z) =>
        Object.entries(z.stufen)
            .filter(([, s]) => s.zeit || s.leer)
            .map(([l, s]) => `${z.id} L${l} ${s.zeit ? "Zeit" : "leer"}`)
    );
    console.log(`\nStufen, die nicht halbieren (${taeter.length}):`);
    for (const t of taeter.slice(0, 60)) console.log("  ❌ " + t);
    if (offen.length) console.log(`\nOhne Messung (${offen.length}): ${offen.slice(0, 20).join(" · ")}`);
    if (JSON_OUT) fs.writeFileSync(path.resolve(JSON_OUT), JSON.stringify({ zeilen: Z.zeilen, taeter }, null, 2));
    console.log(pageErrors.length ? "\nPage-Errors: " + pageErrors.slice(0, 3).join(" | ") : "\nPage-Errors: 0");
    // Messende Linse (Baseline zuerst, Gebot 6): Exit 0, solange sie misst; die Täter-Liste ist der Befund.
    process.exit(Z.zeilen.length ? 0 : 1);
})().catch((e) => {
    console.error("ZENSUS-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
