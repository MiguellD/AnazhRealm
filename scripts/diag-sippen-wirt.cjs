// diag-sippen-wirt.cjs — DAS GESETZ ZÄHLT, WAS DER WIRT ZEICHNET (gate:sippen-wirt).
// Das Budget-Gesetz (phyto-core `budgetSippen`) zählt die Draws einer gelieferten Stufe: je Sippe (Stoff × Attribut-
// Form, `budgetSippe`) EIN Draw, jedes Flügel-Teil und jede Haut einen eigenen, eine Sippe über `verschmelzVerts` ohne
// Gelenk je Teil. Die Budget-Wand (gate:asset-contract) prüft diese Zahl gegen die Zeile des Kerns — wahr ist sie
// nur, wenn der Wirt GENAU so viele Leaves zeichnet. Diese Linse bindet die Zahl an die echten Leaves, im echten Spiel
// (foundry-ON, Null-Renderer), für JEDE Art mit Gestalt:
//   F  der Flatten (`_foundryFlattenFor`) — Haus, Fahrzeug, Waffe, Tor und jede foundry-core-Art (Baum, Strauch,
//      Fels, Kristall, Blume, Gras, Boden-Streu) auf jeder deklarierten Geometrie-Stufe (die Baum-Karte ist ein
//      Billboard, keine Sippe): Gesetz-Draws == Instanz-Gruppen (leafKey) ohne Schatten-Zwilling, Gesetz-Dreiecke == Leaf-Dreiecke.
//   O  der Ofen (`_ofenKreaturTemplate` / `_ofenMenschTemplate`) — jede Gattung und der Mensch auf L0 und L1:
//      Gesetz-Draws == Meshes im gegossenen Körper (nach der Starr-Bindung), Dreiecke ebenso.
//   A  Abdeckung: jede Art mit Budget-Zeile ist vermessen (Haus, Fahrzeug, Waffe, Tor, Kreatur, Körper mindestens).
//   S  Selbst-Test im selben Lauf: ohne das Verschmelzen des Flattens (S1) und ohne die Starr-Bindung des Ofens (S2)
//      MUSS die Linse die Abweichung nennen — sonst ist sie vakuös. Beide Stubs werden zurückgesetzt.
//   node scripts/diag-sippen-wirt.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SIPPEN_PORT || 4413);
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { items: [], fehler: [], selbst: {}, kinds: [] };
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl) {
            const rc = A._studioRenderConfig;
            if (f && f.ready && f.recipes && f.recipeCount > 0 && rc && rc.lod && rc.lod.kindStages && rc.lod.budget)
                break;
            await sleep(80);
        }
        const PC = globalThis.__phytoCore;
        const L = A._studioRenderConfig.lod;
        res.kinds = Object.keys(L.budget).filter((k) => k !== "gestalten");
        const tris = (geo) => (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3);
        const ofenArten = { kreatur: true, koerper: true };

        // ===== F: der Flatten — Gesetz gegen die Leaves des Wirts =====
        const flatMessen = async (preset, lod) => {
            const entry = { seed: 1, position: { x: 0, y: 0, z: 0 } };
            const ende = performance.now() + 90000;
            let flat = null;
            while (performance.now() < ende) {
                flat = r._foundryFlattenFor(entry, preset, lod);
                if (flat !== null) break;
                await sleep(60);
            }
            if (!flat || !Array.isArray(flat.leaves)) return { fehler: "kein Flat (" + String(flat) + ")" };
            const eigen = flat.leaves.filter((lf) => !lf.shadowTwin);
            let wt = 0;
            for (const lf of eigen) wt += tris(lf.geom);
            const meshes = await r._foundryRequest(preset, r._foundryVariantFor(1, preset), lod);
            if (!Array.isArray(meshes)) return { fehler: "keine Antwort" };
            const g = PC.budgetSippen(meshes);
            const teile = meshes.filter((m) => m && m.position && m.position.array).length;
            // Ein Draw je INSTANZ-GRUPPE (leafKey): die vier Rad-Leaves eines Fahrzeugs (Welle L, Q13 F-D8) sind vier
            // Instanzen EINER Gruppe — ein Draw, vier Mal die Dreiecke. Jede andere Art trägt je Leaf ihren eigenen Schlüssel.
            const wd = new Set(eigen.map((lf) => lf.leafKey)).size;
            return { gd: g.draws, gt: g.tris, wd, wt, teile, stufe: flat.lod };
        };
        const rec = f.recipes;
        for (const preset of Object.keys(rec).sort()) {
            const kind = rec[preset] && rec[preset].kind;
            if (!kind || ofenArten[kind] || !L.budget[kind]) continue;
            const st = L.kindStages[kind];
            if (!Array.isArray(st)) continue;
            for (const lod of st) {
                if (lod >= 2 && r._foundryPresetIsTree(preset)) continue; // die Karte ist ein Billboard
                try {
                    const m = await flatMessen(preset, lod);
                    res.items.push(Object.assign({ weg: "F", kind, preset, lod }, m));
                } catch (e) {
                    res.items.push({ weg: "F", kind, preset, lod, fehler: (e && e.message) || String(e) });
                }
            }
        }

        // ===== O: der Ofen — Gesetz gegen die Meshes des gegossenen Körpers =====
        const ofenMessen = (bauen) => {
            const altMemo = A._tierOfenMemo;
            A._tierOfenMemo = new Map(); // frischer Guss, das Welt-Memo bleibt unberührt
            const orig = r._ofenAssembleAsset;
            let gefangen = null;
            r._ofenAssembleAsset = function (meshes) {
                gefangen = meshes;
                return orig.call(this, meshes);
            };
            let asm = null;
            try {
                asm = bauen();
            } finally {
                r._ofenAssembleAsset = orig;
                A._tierOfenMemo = altMemo;
            }
            if (!asm || !asm.root || !gefangen) return { fehler: "kein Guss" };
            let wd = 0,
                wt = 0;
            asm.root.traverse((n) => {
                if (n.isMesh && n.visible !== false && n.geometry) {
                    wd++;
                    wt += tris(n.geometry);
                }
            });
            const g = PC.budgetSippen(gefangen);
            return { gd: g.draws, gt: g.tris, wd, wt };
        };
        const tc = window.__tetrapodaCore;
        const gattungen = tc && tc.GATTUNGEN ? Object.keys(tc.GATTUNGEN).sort() : [];
        for (const recId of gattungen)
            for (const lod of L.kindStages.kreatur || [0]) {
                try {
                    const m = ofenMessen(() => r._ofenKreaturTemplate(recId, null, lod));
                    res.items.push(Object.assign({ weg: "O", kind: "kreatur", preset: recId, lod }, m));
                } catch (e) {
                    res.items.push({ weg: "O", kind: "kreatur", preset: recId, lod, fehler: e.message });
                }
            }
        const kc = window.__koerperCore;
        const anker = r._menschAnkerFarben();
        for (const lod of L.kindStages.koerper || [0]) {
            try {
                const dials = Object.assign({}, kc.START_PARAMS || {});
                const m = ofenMessen(() => r._ofenMenschTemplate(dials, anker.skin, anker.hair, lod));
                res.items.push(Object.assign({ weg: "O", kind: "koerper", preset: "mensch", lod }, m));
            } catch (e) {
                res.items.push({ weg: "O", kind: "koerper", preset: "mensch", lod, fehler: e.message });
            }
        }

        // ===== S: Selbst-Test — ohne Verschmelzen und ohne Starr-Bindung MUSS die Linse abweichen =====
        // das Ziel: die Stufe, an der das Verschmelzen am meisten trägt (die meisten Teile je Gesetz-Draw)
        let ziel = null;
        for (const it of res.items)
            if (it.weg === "F" && !it.fehler && it.teile > it.gd && (!ziel || it.teile - it.gd > ziel.teile - ziel.gd))
                ziel = it;
        res.selbst.ziel = ziel ? ziel.preset + " L" + ziel.lod : null;
        if (ziel) {
            const v = r._foundryVariantFor(1, ziel.preset);
            const key = r._foundryKoerperKey(ziel.preset, v, ziel.lod);
            const grp = r._foundryCacheGet(key);
            const orig = r._foundryFlatVerschmelzen;
            try {
                if (grp) {
                    delete grp._foundryFlat;
                    r._foundryFlatVerschmelzen = function () {};
                    const flat = r._foundryFlattenFor(
                        { seed: 1, position: { x: 0, y: 0, z: 0 } },
                        ziel.preset,
                        ziel.lod
                    );
                    res.selbst.s1 =
                        flat && flat.leaves
                            ? new Set(flat.leaves.filter((lf) => !lf.shadowTwin).map((lf) => lf.leafKey)).size
                            : -1;
                    res.selbst.s1Gesetz = ziel.gd;
                }
            } finally {
                r._foundryFlatVerschmelzen = orig;
                if (grp) {
                    delete grp._foundryFlat;
                    r._foundryFlattenFor({ seed: 1, position: { x: 0, y: 0, z: 0 } }, ziel.preset, ziel.lod);
                }
            }
        }
        const sb = A._ofenStarrBinden;
        try {
            A._ofenStarrBinden = function () {};
            const m = ofenMessen(() => r._ofenKreaturTemplate("wolf", null, 0));
            res.selbst.s2 = m;
        } finally {
            A._ofenStarrBinden = sb;
        }
        return res;
    });
    await browser.close();
    server.close();

    console.log(`=== DAS GESETZ ZÄHLT, WAS DER WIRT ZEICHNET (${((Date.now() - t0) / 1000).toFixed(0)} s) ===`);
    const fehlt = [];
    for (const it of out.items) {
        const name = `${it.weg} ${it.kind} ${it.preset} L${it.lod}`;
        if (it.fehler) {
            check(name, false, it.fehler);
            continue;
        }
        const ok = it.gd === it.wd && Math.round(it.gt) === Math.round(it.wt);
        const det = `Gesetz ${it.gd} Draws / ${Math.round(it.gt)} Dreiecke · Wirt ${it.wd} / ${Math.round(it.wt)}`;
        if (ok) console.log(`  ✅ ${name} — ${det}`);
        else {
            fehlt.push(name);
            check(name, false, det);
        }
    }
    const gemessen = new Set(out.items.filter((it) => !it.fehler).map((it) => it.kind));
    const ohne = out.kinds.filter((k) => !gemessen.has(k));
    check(
        `A: jede Art mit Budget-Zeile ist vermessen (${gemessen.size}/${out.kinds.length} Arten, ${out.items.length} Stufen)`,
        ohne.length === 0 && ["haus", "vehicle", "weapon", "gate", "kreatur", "koerper"].every((k) => gemessen.has(k)),
        ohne.length ? "ohne Messung: " + ohne.join(", ") : ""
    );
    check(
        "S1: ohne das Verschmelzen des Flattens weicht der Wirt vom Gesetz ab (die Linse ist nicht vakuös)",
        Number.isInteger(out.selbst.s1) && out.selbst.s1 > out.selbst.s1Gesetz,
        `${out.selbst.ziel}: Wirt ${out.selbst.s1} Leaves, Gesetz ${out.selbst.s1Gesetz}`
    );
    const s2 = out.selbst.s2 || {};
    check(
        "S2: ohne die Starr-Bindung des Ofens weicht der Körper vom Gesetz ab (wolf L0)",
        !s2.fehler && s2.wd > s2.gd,
        s2.fehler || `Wirt ${s2.wd} Meshes, Gesetz ${s2.gd}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    if (errs.length) {
        console.error(
            `\n❌ ROT — ${errs.length} Verletzung(en): das Budget-Gesetz zählt nicht, was der Wirt zeichnet.`
        );
        process.exit(1);
    }
    console.log(`\n✅ GRÜN — ${out.items.length} Stufen: das Gesetz zählt jede Leaf des Wirts.`);
    process.exit(0);
})().catch((e) => {
    console.error("❌ Linse abgestürzt:", e && e.stack ? e.stack : e);
    try {
        server.close();
    } catch (_e) {
        /* bereits zu */
    }
    process.exit(1);
});
