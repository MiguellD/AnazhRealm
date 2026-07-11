// diag-trias.cjs — DIE TRIAS-LINSE (V18.444, Trias-Welle): die Szenen-Dreiecke bleiben
// ueber die Wanderung GEDECKELT — platzierte Studio-Architektur (haus_ u. a.) lebt in
// der EINEN LOD-Geschichte statt fuer immer auf ihrer Bau-Stufe zu kleben.
//
// DER GEMESSENE BEFUND (Schoepfer „Trias steigen, ab ~1000k stockend, ~12000k Freeze"):
//   Fachwerk-Haus L0 ~88k / L1 ~75k / L2 ~2.8k Tris — und Haeuser gingen NIE durch
//   `_tickArchitectureLOD` (kein `_lodSpecies`) → nah gebaute Haeuser (L0/L1) blieben
//   im Cull-Radius (100-150 m) fuer immer schwer: 9 Haeuser nah gebaut = 434k Tris,
//   nach 120 m Zuruecktreten unveraendert 380k statt ehrlicher ~22k; ein durchlaufenes
//   16-Haus-Dorf konvergierte auf ~1.3M Tris und kam nie zurueck.
// DIE HEILUNG (an den Chokepoints, M8-treu — kein kind-Literal, kein Parallel-LOD):
//   (1) der Kalt-Stempel `entry._lodLevel` gilt JEDEM Foundry-Eintrag (Distanz-Autoritaet),
//   (2) `_tickArchitectureLOD` nimmt `instFoundry`-Eintraege in die EINE LOD-Geschichte,
//   (3) `_switchArchitectureLOD` serviert die neue Stufe aus der Foundry (kindStages-
//       Klammer bleibt die Stufen-Wahrheit) + Clamp-Kurzschluss via `_servedLod`
//       (Ein-Stufen-Arten re-allozieren nicht),
//   (4) W-A3.1: `cloneBlueprint` vererbt `studioGestalt` (donorOnly bewusst NICHT).
// TEILE:
//   N (Node, direkt): die fachwerk-Stufen-Wahrheit als Zahl (L2 ist die leichte Fernstufe).
//   S (statisch, kommentar-gestrippt): die vier Struktur-Gesetze am Stamm.
//   B (Browser, foundry-ON, Null-Renderer): das Sticky-Experiment als Invariante —
//     nah bauen → 120 m zuruecktreten → ALLE instanzierten Haeuser tragen die Fernstufe
//     (Zahl: Haus-Tris ≤ Deckel) · Promotion beim Wieder-Annaehern · +500 m → alles
//     gecullt, Ghost-Slots 0, Band-Bilanz 0, Gruppen entsorgt (der DECKEL ueber Churn) ·
//     Klon-Erbe (studioGestalt reist, donorOnly nicht).
//   --selftest: injizierte Verletzungen machen die Gesetze rot (Linse nicht vakuoes).
//   node scripts/diag-trias.cjs [--selftest]
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

// Der DECKEL (aus der Messung, mit Marge): 8-9 Haeuser auf der Fernstufe = ~28k Tris
// gemessen → Deckel 70k (×2.5 Marge). Die Fernstufe selbst: L2 ≤ 8k Tris je Haus.
const HAUS_FERN_DECKEL_TRIS = 70000;
const HAUS_L2_MAX_TRIS = 8000;

// ── AUSLÖSCHUNGS-WELLE — DIE SUBSTANZ-PARITAET (stehende Linse, Teil N4) ──
// Die Judge-Substanz der fuenf gefallenen Donor-Blueprints lebt EINGEFROREN in
// AnazhRealm.KIND_SUBSTANCE (je EINE Zeile `    <name>: {...json...},`). Die Muenzen
// (sha256 ueber JSON.stringify der geparsten Zeile, Mint 10.07.2026) machen jede
// Drift der Substanz laut.
const KIND_SUBSTANCE_MINT = {
    geraet_schwert: "fbd9f91fa5f8e26c9dd99959ce99f0c8906cbe82662ee1f82035003529e4ff9b",
    geraet_spitzhacke: "f9465bb4d29ee17d0145c2fec6eebad0581f05c17c6c54af675fa19cb326c7f6",
    fahrzeug_wagen: "5b642cc51995ef9bf31bb05135d38dd16d8d9ea51ba12ee52a2fb1ed9ff84a8a",
    tor_basis: "3192e75d2f5e82ab941f1b2356de608d45824819d704779750163797732ecfb3",
    haus_basis: "56b2a5e79068d1e21df40e1b77299e11b683f441d47c9bd427c9f7f69f6bc628",
};
// ERFINDER-WELLE (Linsen-Heilung) — der Zeilen-Parser war auf EINZEILEN-JSON geeicht
// (`    name: {...json...},`); ein Prettier-Lauf formatierte die Substanz-Zeilen in
// MEHRZEILIGE JS-Literale (unquoted keys) → die Regex griff ins Leere → Selbst-Test 5
// stand rot / 5b vakuoes-gruen (die dokumentierte `gate | tail`-Maskierung verbarg es).
// Jetzt: klammer-bewusste Extraktion (quote-sicher) + vm-Eval des Literals; die MUENZEN
// bleiben UNANGETASTET — JSON.stringify(vm-Objekt) reproduziert byte-genau die gemintete
// Kanonik (Key-Reihenfolge = Quelle, Zahlen exakt), sonst waere es ECHTE Drift.
function kindSubstanceRowSpan(src, name) {
    const start = src.indexOf("AnazhRealm.KIND_SUBSTANCE = Object.freeze({");
    if (start < 0) return null;
    const end = src.indexOf("\n});", start);
    const key = "\n    " + name + ": ";
    const k = src.indexOf(key, start);
    if (k < 0 || k > end) return null;
    let i = src.indexOf("{", k);
    if (i < 0 || i > end) return null;
    let depth = 0;
    let inStr = null;
    for (let j = i; j <= end; j++) {
        const c = src[j];
        if (inStr) {
            if (c === "\\") j++;
            else if (c === inStr) inStr = null;
            continue;
        }
        if (c === '"' || c === "'") inStr = c;
        else if (c === "{") depth++;
        else if (c === "}") {
            depth--;
            if (depth === 0) return { rowStart: k + 1, objStart: i, objEnd: j + 1 };
        }
    }
    return null;
}
function kindSubstanceRows(src) {
    if (src.indexOf("AnazhRealm.KIND_SUBSTANCE = Object.freeze({") < 0) return null;
    const vm = require("vm");
    const rows = {};
    for (const name of Object.keys(KIND_SUBSTANCE_MINT)) {
        const span = kindSubstanceRowSpan(src, name);
        if (!span) {
            rows[name] = null;
            continue;
        }
        try {
            rows[name] = vm.runInNewContext("(" + src.slice(span.objStart, span.objEnd) + ")");
        } catch (_e) {
            rows[name] = null;
        }
    }
    return rows;
}
function kindSubstanceHash(row) {
    return crypto.createHash("sha256").update(JSON.stringify(row)).digest("hex");
}

// ── Teil S: die Struktur-Gesetze (Definitions-Form, kommentar-gestrippt) ──
function triasStaticLaws(anazhSrc) {
    const nc = stripComments(anazhSrc);
    const fnBody = (name) => {
        const i = nc.indexOf(`    ${name}(`);
        if (i < 0) return "";
        const j = nc.indexOf("\n    }", i);
        return j > i ? nc.slice(i, j) : "";
    };
    const tick = fnBody("_tickArchitectureLOD");
    const sw = fnBody("_switchArchitectureLOD");
    const clone = fnBody("cloneBlueprint");
    return [
        [
            "T-S1: _tickArchitectureLOD nimmt instFoundry-Eintraege in die EINE LOD-Geschichte",
            /treeLike && entry\.instFoundry !== true\) continue;/.test(tick),
        ],
        [
            "T-S2: _switchArchitectureLOD traegt den Clamp-Kurzschluss (_servedLod) + die Grammatik-Wand (!treeLike)",
            /fFlat\.lod === entry\._servedLod/.test(sw) && /if \(!treeLike\) return false;/.test(sw),
        ],
        [
            "T-S3: der Kalt-Stempel gilt JEDEM Foundry-Eintrag (kein _lodVariantIndex-Gate) + _archInstanceAdd stempelt _servedLod",
            /if \(!entry\.instanced && !entry\.mesh\) \{\s*const dlod = this\._foundryLodForEntry\(entry\);/.test(nc) &&
                /entry\._servedLod =/.test(nc),
        ],
        [
            "T-S4: cloneBlueprint vererbt studioGestalt (W-A3.1) und donorOnly NICHT",
            /studioGestalt = source\.studioGestalt/.test(clone) &&
                !/donorOnly/.test(clone.replace(/donorOnly` reist BEWUSST NICHT/g, "")),
        ],
        // ABSCHIEDS-WELLE (F) — der HOST-Stufen-Wunsch als DATEN: die haus-Policy traegt
        // lodServe {1:2} (der Mittel-Ring spart gemessen kaum: L1 75k ~ L0 88k) und der
        // EINE Flatten-Chokepoint liest die Tabelle (kein kind-Literal).
        [
            "T-S5: KIND_POLICY.haus traegt lodServe {1:2} + _foundryFlattenFor liest lodServe (Daten, kein if-Baum)",
            /lodServe:\s*Object\.freeze\(\{\s*1:\s*2\s*\}\)/.test(nc) &&
                /lodServe\[lod\]/.test(fnBody("_foundryFlattenFor")),
        ],
        // ABSCHIEDS-WELLE (E) — der GEWICHTS-DECKEL des fCache: die Byte-Budget-Wand
        // (FOUNDRY_CACHE_BYTES) + die Bilanz am EINEN Chokepoint (_foundryCacheSet).
        [
            "T-S6: _foundryCacheSet bilanziert Bytes (cacheBytes) und raeumt am Byte-Budget (FOUNDRY_CACHE_BYTES)",
            /FOUNDRY_CACHE_BYTES\s*=/.test(nc) &&
                /f\.cacheBytes > BYTES/.test(fnBody("_foundryCacheSet")) &&
                /_foundryGroupBytes/.test(fnBody("_foundryCacheSet")),
        ],
    ];
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

    // ===== SELBST-TEST =====
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Trias-Linse feuert ===");
        check(
            "Selbst-Test 0: die Gesetze sind am HEAD gruen (Vorbedingung)",
            triasStaticLaws(anazhSrc).every((l) => l[1] === true)
        );
        const b1 = anazhSrc.replace(/treeLike && entry\.instFoundry !== true\) continue;/, "treeLike) continue;");
        const l1 = triasStaticLaws(b1).find((l) => l[0].startsWith("T-S1"));
        check("Selbst-Test 1: Eligibility zurueckgebaut -> T-S1 feuert", l1 && l1[1] === false);
        const b2 = anazhSrc.replace(/fFlat\.lod === entry\._servedLod/, "false");
        const l2 = triasStaticLaws(b2).find((l) => l[0].startsWith("T-S2"));
        check("Selbst-Test 2: Clamp-Kurzschluss entfernt -> T-S2 feuert", l2 && l2[1] === false);
        const b4 = anazhSrc.replace(/studioGestalt = source\.studioGestalt/, "nixGestalt = source.nixGestalt");
        const l4 = triasStaticLaws(b4).find((l) => l[0].startsWith("T-S4"));
        check("Selbst-Test 3: Klon-Erbe entfernt -> T-S4 feuert", l4 && l4[1] === false);
        const b5 = anazhSrc.replace(/lodServe\[lod\]/g, "nixServe[lod]");
        const l5 = triasStaticLaws(b5).find((l) => l[0].startsWith("T-S5"));
        check("Selbst-Test 3b: lodServe-Konsum entfernt -> T-S5 feuert", l5 && l5[1] === false);
        const b6 = anazhSrc.replace(/f\.cacheBytes > BYTES/g, "false");
        const l6 = triasStaticLaws(b6).find((l) => l[0].startsWith("T-S6"));
        check("Selbst-Test 3c: Byte-Budget-Wand entfernt -> T-S6 feuert", l6 && l6[1] === false);
        // Die ZAHLEN-Linse ist nicht vakuoes: die schwere L1-Stufe (gemessen ~75k) liegt
        // WEIT ueber dem Fern-Deckel je Haus — klebte L1 fern, risse der Deckel.
        global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
        require(path.join(root, "fachwerk-core.js"));
        const FCst = globalThis.__fachwerkCore;
        const g1 = FCst.buildInstance("alemannisch", 7, 1);
        let t1 = 0;
        g1.traverse((o) => {
            if (o.isMesh && o.geometry)
                t1 += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        check(
            "Selbst-Test 4: EIN L1-Haus (~75k) risse den Fern-Deckel fuer 3 Haeuser (Zahl nicht vakuoes)",
            t1 * 3 > HAUS_FERN_DECKEL_TRIS,
            `L1=${Math.round(t1)} tris`
        );
        // AUSLÖSCHUNGS-WELLE — N4 ist nicht vakuoes: eine gedriftete Substanz-Zeile
        // verfehlt die Muenze, eine fehlende Zeile wird null.
        // Die Injektionen zielen auf die ECHTE (prettier-formatierte) Form der Zeilen —
        // eine Injektion, die ins Leere greift, macht den Vergleich vakuoes (genau der
        // Zustand, den diese Heilung beendet; darum prueft 5 auch die PRAEMISSE laut).
        const schwertSpan = kindSubstanceRowSpan(anazhSrc, "geraet_schwert");
        const schwertText = schwertSpan ? anazhSrc.slice(schwertSpan.objStart, schwertSpan.objEnd) : "";
        const bKS =
            schwertSpan && /label: "Schwert"/.test(schwertText)
                ? anazhSrc.slice(0, schwertSpan.objStart) +
                  schwertText.replace('label: "Schwert"', 'label: "Schwertx"') +
                  anazhSrc.slice(schwertSpan.objEnd)
                : anazhSrc;
        const rowsB = kindSubstanceRows(bKS);
        check(
            "Selbst-Test 5: eine gedriftete Substanz-Zeile verfehlt die Muenze (N4 feuert)",
            !!(schwertSpan && rowsB && rowsB.geraet_schwert) &&
                kindSubstanceHash(rowsB.geraet_schwert) !== KIND_SUBSTANCE_MINT.geraet_schwert,
            schwertSpan ? undefined : "geraet_schwert-Zeile nicht gefunden (Parser-Praemisse verletzt)"
        );
        const torSpan = kindSubstanceRowSpan(anazhSrc, "tor_basis");
        const bKS2 = torSpan ? anazhSrc.slice(0, torSpan.rowStart) + anazhSrc.slice(torSpan.objEnd + 1) : anazhSrc;
        const rowsB2 = kindSubstanceRows(bKS2);
        check(
            "Selbst-Test 5b: eine ENTFERNTE Substanz-Zeile wird null (N4 feuert)",
            !!(torSpan && rowsB2) && rowsB2.tor_basis === null,
            torSpan ? undefined : "tor_basis-Zeile nicht gefunden (Parser-Praemisse verletzt)"
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN.");
        process.exit(0);
    }

    // ===== Teil N: die fachwerk-Stufen-Wahrheit als Zahl =====
    console.log("=== TEIL N: die Stufen-Wahrheit (fachwerk-core, Node-direkt) ===");
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;
    const trisOf = (g) => {
        let t = 0;
        g.traverse((o) => {
            if (o.isMesh && o.geometry)
                t += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
        });
        return Math.round(t);
    };
    const t0 = trisOf(FC.buildInstance("alemannisch", 7, 0));
    const t1 = trisOf(FC.buildInstance("alemannisch", 7, 1));
    const t2 = trisOf(FC.buildInstance("alemannisch", 7, 2));
    check(
        `N1: L2 ist die LEICHTE Fernstufe (≤ ${HAUS_L2_MAX_TRIS} Tris)`,
        t2 > 0 && t2 <= HAUS_L2_MAX_TRIS,
        `L2=${t2}`
    );
    check("N2: die Stufen sind REAL differenziert (L0 ≥ 5×L2)", t0 >= 5 * t2, `L0=${t0} L1=${t1} L2=${t2}`);
    check(
        "N3: kindStages.haus deklariert [0,1,2] (die Mehr-Stufen-Domaene)",
        JSON.stringify(
            FC.PORTAL_RENDER_CONFIG && FC.PORTAL_RENDER_CONFIG.lod && FC.PORTAL_RENDER_CONFIG.lod.kindStages
                ? FC.PORTAL_RENDER_CONFIG.lod.kindStages.haus
                : null
        ) === "[0,1,2]"
    );
    // AUSLÖSCHUNGS-WELLE — N4: die Substanz-Paritaet als stehende Linse (alle 5
    // KIND_SUBSTANCE-Zeilen existieren mit nicht-leeren parts, sha256 == Muenze).
    {
        const rows = kindSubstanceRows(anazhSrc);
        for (const [name, mint] of Object.entries(KIND_SUBSTANCE_MINT)) {
            const row = rows && rows[name];
            const okParts = !!row && Array.isArray(row.parts) && row.parts.length > 0;
            const hash = okParts ? kindSubstanceHash(row) : "fehlt";
            check(
                `N4: KIND_SUBSTANCE.${name} steht (parts > 0) + sha256 == Muenze`,
                okParts && hash === mint,
                hash === mint ? `parts=${row.parts.length}` : hash
            );
        }
    }

    // ===== Teil S =====
    console.log("\n=== TEIL S: die Struktur-Gesetze am Stamm ===");
    for (const [name, ok] of triasStaticLaws(anazhSrc)) check(name, ok);

    // ===== Teil B: das Sticky-Experiment als Invariante (Browser) =====
    console.log("\n=== TEIL B: die LOD-Geschichte lebt (Browser, foundry-ON, Null-Renderer) ===");
    const puppeteer = require("puppeteer");
    const http = require("http");
    const PORT = Number(process.env.TRIAS_PORT || 4443);
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".json": "application/json",
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 480000,
        args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const res = { errors: [] };
        let dl = performance.now() + 90000;
        while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl)
            await sleep(150);
        const r = window.anazhRealm;
        if (!r) return { fatal: "kein anazhRealm" };
        const f = r._ensureAssetFoundry();
        dl = performance.now() + 60000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.alemannisch) break;
            await sleep(100);
        }
        res.bookReady = !!(f && f.ready && f.recipes && f.recipes.alemannisch);
        if (!res.bookReady) return res;

        const pm = r.state.playerMesh;
        const tp = (x, z) => {
            pm.position.set(x, r.getTerrainHeightAt(x, z) + 2, z);
        };
        async function pumpRender(nTicks) {
            for (let i = 0; i < nTicks; i++) {
                r.state._frameOverBudget = false;
                try {
                    r.tickArchitectureCulling();
                    r._tickArchitectureLOD(8);
                } catch (e) {
                    res.errors.push("render: " + e.message);
                    break;
                }
                if (i % 4 === 3) await sleep(35);
            }
        }
        function hausStats() {
            const s = { lods: {}, tris: 0, instanced: 0, entries: 0, lodLevelFinite: 0 };
            for (const e of r.state.architectures) {
                if (!e || typeof e.type !== "string" || e.type.indexOf("haus_") !== 0) continue;
                s.entries++;
                if (Number.isFinite(e._lodLevel)) s.lodLevelFinite++;
                if (!e.instanced || !e.instSlots) continue;
                s.instanced++;
                const m = e.instSlots[0] && e.instSlots[0].key.match(/#f:[^|]+\|\d+\|(\d)\|/);
                const lod = m ? m[1] : "?";
                s.lods[lod] = (s.lods[lod] || 0) + 1;
                for (const { key } of e.instSlots) {
                    const g = r.state.archInstanceGroups.get(key);
                    if (g && g.geom)
                        s.tris += g.geom.index ? g.geom.index.count / 3 : g.geom.attributes.position.count / 3;
                }
            }
            s.tris = Math.round(s.tris);
            return s;
        }
        function ghostAndBand() {
            const o = { ghost: 0, band: 0, hausGroups: 0 };
            if (r.state.archInstanceGroups)
                for (const [key, g] of r.state.archInstanceGroups) {
                    if (!g || g.kind === "batch" || !g.geom) continue;
                    const tris = g.geom.index ? g.geom.index.count / 3 : g.geom.attributes.position.count / 3;
                    o.ghost += Math.max(0, (g.mesh ? g.mesh.count : 0) - (g.liveCount || 0)) * tris;
                    if (key.indexOf("haus_") === 0) o.hausGroups++;
                }
            for (const e of r.state.architectures) if (e && e.instSlotsBand) o.band++;
            o.ghost = Math.round(o.ghost);
            return o;
        }

        // (1) Dorf deliberat heben (die EINE Slot-Quelle; kein Auto-Hook noetig).
        const anchor = { x: 900, z: 900 };
        const plan = await Promise.race([
            r._foundryRequestSettlement({ seed: 7, nH: 6 }),
            new Promise((rs) => setTimeout(() => rs(null), 90000)),
        ]);
        if (!plan || !plan.slots) return Object.assign(res, { fatal: "kein Settlement-Export" });
        tp(anchor.x, anchor.z);
        res.placed = r._spawnSettlementFromExport(plan, anchor).placed;

        // (2) An die 3 naechsten Haeuser herantreten -> sie bauen NAH (schwere Stufe).
        const haeuser = r.state.architectures.filter(
            (e) => e && typeof e.type === "string" && e.type.indexOf("haus_") === 0
        );
        const near3 = haeuser
            .slice()
            .sort(
                (a, b) =>
                    Math.hypot(a.position.x - anchor.x, a.position.z - anchor.z) -
                    Math.hypot(b.position.x - anchor.x, b.position.z - anchor.z)
            )
            .slice(0, 3);
        for (const h of near3) {
            tp(h.position.x + 6, h.position.z);
            const d2 = performance.now() + 25000;
            while (!h.instanced && performance.now() < d2) await pumpRender(8);
        }
        res.nearBuilt = hausStats();
        res.nearHeavy = near3.every((h) => h.instanced); // die 3 stehen (Voraussetzung)

        // (2b) ABSCHIEDS-WELLE (F) — lodServe: im L1-RING serviert die Foundry die
        // FERNSTUFE (2), waehrend die Distanz-Autoritaet 1 stempelt (KIND_POLICY.haus
        // lodServe {1:2} — der Mittel-Ring spart gemessen kaum). Ring visH-echt
        // via _chooseLODForDistance gescannt, Konvergenz gepumpt.
        const h0b = near3[0];
        const visH0 = r._lodTreeVisHeight(h0b);
        let dRing = -1;
        for (let d = 10; d < 400; d += 2) {
            if (r._chooseLODForDistance(d, 0, visH0) === 1) {
                dRing = d + 6;
                break;
            }
        }
        res.l1RingDist = dRing;
        if (dRing > 0) {
            tp(h0b.position.x + dRing, h0b.position.z);
            const dlServe = performance.now() + 90000;
            while (performance.now() < dlServe) {
                await pumpRender(24);
                if (h0b._lodLevel === 1 && h0b._servedLod === 2) break;
            }
            res.lodServeLevel = h0b._lodLevel;
            res.lodServeServed = h0b._servedLod;
            const mS = h0b.instanced && h0b.instSlots[0] && h0b.instSlots[0].key.match(/#f:[^|]+\|\d+\|(\d)\|/);
            res.lodServeSlot = mS ? Number(mS[1]) : null;
        }

        // (3) 120 m zuruecktreten (IM Cull-Radius) -> die EINE LOD-Geschichte demotet.
        // KONVERGENZ-PUMPE: die Hysterese-Leiter (0 -> 1 -> 2) braucht je Stufe einen
        // Switch UND die Ziel-Stufe muss ggf. erst im Worker backen (L1 einer frischen
        // Kultur|Variante = Sekunden) -> pumpen bis konvergiert, Deadline 150 s.
        tp(anchor.x + 120, anchor.z);
        const dlConv = performance.now() + 150000;
        while (performance.now() < dlConv) {
            await pumpRender(24);
            const s = hausStats();
            if (s.instanced >= 3 && Object.keys(s.lods).every((k) => k === "2")) break;
        }
        res.after120m = hausStats();
        const distsNow = haeuser.map((h) =>
            Math.round(Math.hypot(h.position.x - (anchor.x + 120), h.position.z - anchor.z))
        );
        res.minDistAt120 = Math.min.apply(null, distsNow);

        // (4) Promotion: wieder an das naechste Haus heran -> nahe Stufe (≤1) kehrt zurueck.
        const h0 = near3[0];
        tp(h0.position.x + 6, h0.position.z);
        await pumpRender(120);
        const m0 = h0.instanced && h0.instSlots[0] && h0.instSlots[0].key.match(/#f:[^|]+\|\d+\|(\d)\|/);
        res.promotedLod = m0 ? Number(m0[1]) : null;

        // (5) +500 m -> alles gecullt: der DECKEL ueber Churn.
        tp(anchor.x + 500, anchor.z + 500);
        await pumpRender(120);
        res.afterLeave = hausStats();
        res.leaveBalance = ghostAndBand();

        // (6) W-A3.1 — das Klon-Erbe am EINEN Chokepoint.
        const cloneName = "trias_probe_klon";
        const cloneName2 = "trias_probe_klon2";
        delete r.state.blueprints[cloneName];
        delete r.state.blueprints[cloneName2];
        const ok1 = r.cloneBlueprint("welt_portal", cloneName);
        const c1 = r.state.blueprints[cloneName];
        res.kloneGestalt = !!(ok1 && c1 && c1.studioGestalt === (r.state.blueprints.welt_portal || {}).studioGestalt);
        // AUSLÖSCHUNGS-WELLE: der Alt-Donor tor_basis ist gefallen — die Klon-
        // Sichtbarkeits-Regel wird an einem SYNTHETISCHEN donorOnly-Blueprint bewiesen
        // (registrieren → klonen → aufraeumen; kein vakuoeses skip mehr).
        delete r.state.blueprints._t_donor;
        r.state.blueprints._t_donor = {
            name: "_t_donor",
            donorOnly: true,
            parts: [{ shape: "box", material: "stein", position: { x: 0, y: 0.5, z: 0 }, size: { x: 1, y: 1, z: 1 } }],
        };
        const ok2 = r.cloneBlueprint("_t_donor", cloneName2);
        const c2 = r.state.blueprints[cloneName2];
        res.kloneSichtbar = !!(ok2 && c2 && c2.donorOnly !== true && r.state.blueprints._t_donor.donorOnly === true);
        delete r.state.blueprints._t_donor;
        delete r.state.blueprints[cloneName];
        delete r.state.blueprints[cloneName2];
        // ERFINDER-WELLE — DIE KLON-IDENTITAET eines Auto-Blueprints (der Schoepfer-Befund
        // „ich klone einen reiterbogen, und er wird zum alten schwert"): jeder Auto-
        // Blueprint traegt seine Rezept-Identitaet als DATEN (`studioGestalt`), der Klon
        // erbt sie, und der EINE Resolver loest den Klon aufs REZEPT — nie auf die
        // Donor-Substanz. Gemessen an einem echten klinge_-Auto-Blueprint des LIVE-Buchs.
        const autoBp = Object.keys(r.state.blueprints).find(
            (n) => r.state.blueprints[n] && r.state.blueprints[n]._foundryAutoSpecies && /^klinge_/.test(n)
        );
        res.autoBpName = autoBp || null;
        if (autoBp) {
            const recId = r.state.blueprints[autoBp]._foundryAutoSpecies;
            res.autoGestaltStamp = r.state.blueprints[autoBp].studioGestalt === recId;
            const cloneName3 = "trias_probe_bogen_klon";
            delete r.state.blueprints[cloneName3];
            const ok3 = r.cloneBlueprint(autoBp, cloneName3);
            const resolved = ok3 ? r._foundryPresetForEntry({ type: cloneName3 }) : null;
            res.kloneRezept = !!(ok3 && resolved === recId);
            delete r.state.blueprints[cloneName3];
        } else {
            res.autoGestaltStamp = false;
            res.kloneRezept = false;
        }

        // (7) ABSCHIEDS-WELLE (E) — DER GEWICHTS-DECKEL des fCache: die warme Bibliothek
        // MESSEN (die Budget-Begruendungs-Zahl: 189-255 MB Arbeits-Menge gemessen ->
        // Budget 512 MB = ~2x Kopfraum, KEIN Arbeits-Mengen-Churn [der Crossfade-Sweep
        // fing ein zu enges Budget]), dann synthetisch beweisen (Scratch-Swap, Sicherung
        // + Wiederherstellung — die Gate-Hook-Disziplin): 80 x 8-MB-Eintraege deckeln am
        // BYTE-Budget (512/8 = 64, weit vor CAP 256); 300 leichte deckeln an der
        // Entries-Zweitwand (256).
        const f2 = r._ensureAssetFoundry();
        res.warmCacheMB = Math.round(((f2.cacheBytes || 0) / 1048576) * 10) / 10;
        res.warmCacheSize = f2.cache.size;
        const savedC = { cache: f2.cache, bytes: f2.cacheBytes, req: f2.requested, lru: f2.lruEvicted };
        const BYTES = r.constructor.FOUNDRY_CACHE_BYTES;
        const mkFake = (mb) => ({
            children: [
                {
                    geometry: {
                        attributes: {
                            position: { array: new Float32Array(Math.max(1, Math.round((mb * 1048576) / 4))) },
                        },
                    },
                },
            ],
        });
        f2.cache = new Map();
        f2.cacheBytes = 0;
        f2.requested = new Set();
        f2.lruEvicted = new Set();
        for (let i = 0; i < 80; i++) r._foundryCacheSet("gewicht8|" + i, mkFake(8));
        res.heavySize = f2.cache.size;
        res.heavyBytesOk = f2.cacheBytes <= BYTES;
        f2.cache = new Map();
        f2.cacheBytes = 0;
        f2.requested = new Set();
        for (let i = 0; i < 300; i++) r._foundryCacheSet("leicht|" + i, mkFake(0.001));
        res.lightSize = f2.cache.size;
        f2.cache = savedC.cache;
        f2.cacheBytes = savedC.bytes;
        f2.requested = savedC.req;
        f2.lruEvicted = savedC.lru;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        check("B: Aufbau", false, out.fatal);
    } else {
        check("B0: das LIVE-Buch ist warm (Voraussetzung)", out.bookReady === true);
        check("B1: das Dorf steht (deliberate Slot-Quelle)", out.placed >= 4, `placed=${out.placed}`);
        check(
            "B2: nah gebaut = die schweren Stufen leben (≥1 Haus L0/L1, alle 3 instanziert)",
            out.nearHeavy === true && (out.nearBuilt.lods["0"] || 0) + (out.nearBuilt.lods["1"] || 0) >= 1,
            JSON.stringify(out.nearBuilt && out.nearBuilt.lods)
        );
        check(
            "B3: JEDES Haus traegt die Distanz-Autoritaet (_lodLevel finit — die LOD-Geschichte kennt es)",
            out.after120m && out.after120m.lodLevelFinite === out.after120m.entries,
            out.after120m ? `${out.after120m.lodLevelFinite}/${out.after120m.entries}` : ""
        );
        check(
            "B4: 120 m zurueck -> ALLE instanzierten Haeuser tragen die FERNSTUFE (2) — nichts klebt",
            out.after120m &&
                out.after120m.instanced >= 3 &&
                Object.keys(out.after120m.lods).every((k) => k === "2") &&
                out.minDistAt120 > 43,
            `lods=${JSON.stringify(out.after120m && out.after120m.lods)} minDist=${out.minDistAt120}`
        );
        check(
            `B5: der TRIAS-DECKEL haelt (Haus-Tris ≤ ${HAUS_FERN_DECKEL_TRIS} auf der Fernstufe; vor der Heilung: 380k)`,
            out.after120m && out.after120m.tris > 0 && out.after120m.tris <= HAUS_FERN_DECKEL_TRIS,
            `tris=${out.after120m && out.after120m.tris}`
        );
        check(
            "B6: PROMOTION lebt (wieder nah -> Stufe ≤ 1 kehrt zurueck)",
            Number.isFinite(out.promotedLod) && out.promotedLod <= 1,
            `lod=${out.promotedLod}`
        );
        check(
            "B7: +500 m -> das Dorf ist GECULLT (0 instanziert, 0 Haus-Gruppen — der Deckel ueber Churn)",
            out.afterLeave && out.afterLeave.instanced === 0 && out.leaveBalance.hausGroups === 0,
            JSON.stringify(out.leaveBalance)
        );
        check(
            "B8: die SLOT-BILANZ ist ausgeglichen (Ghost-Tris 0, keine Band-Reste)",
            out.leaveBalance && out.leaveBalance.ghost === 0 && out.leaveBalance.band === 0
        );
        check("B9: W-A3.1 — der Klon erbt die studioGestalt (welt_portal -> geisttor)", out.kloneGestalt === true);
        check(
            "B9b: ERFINDER — jeder Auto-Blueprint traegt studioGestalt=Rezept (Daten-Identitaet statt Name)",
            out.autoGestaltStamp === true,
            `bp=${out.autoBpName}`
        );
        check(
            "B9c: ERFINDER — der Klon eines Auto-Blueprints loest aufs REZEPT (nie Donor-Substanz)",
            out.kloneRezept === true,
            `bp=${out.autoBpName}`
        );
        check(
            "B10: donorOnly reist NICHT mit (der Klon eines synthetischen donorOnly-Blueprints ist sichtbar — nie skip)",
            out.kloneSichtbar === true,
            String(out.kloneSichtbar)
        );
        check(
            "B11 (F/lodServe): im L1-Ring stempelt die Distanz-Autoritaet 1, die Foundry SERVIERT die Fernstufe 2 (Slot-Key-Beweis)",
            out.lodServeLevel === 1 && out.lodServeServed === 2 && out.lodServeSlot === 2,
            `ring=${out.l1RingDist}m level=${out.lodServeLevel} served=${out.lodServeServed} slot=${out.lodServeSlot}`
        );
        check(
            "B12 (E/Gewicht): 80x8-MB-Eintraege deckeln am BYTE-Budget (64 = 512MB/8MB, weit vor CAP 256)",
            out.heavySize === 64 && out.heavyBytesOk === true,
            `size=${out.heavySize} warmeBibliothek=${out.warmCacheMB}MB/${out.warmCacheSize} Eintraege`
        );
        check("B13 (E/Zweitwand): 300 leichte Eintraege deckeln an der Entries-Wand (256)", out.lightSize === 256);
        if (out.errors && out.errors.length) check("B: keine Tick-Fehler", false, out.errors[0]);
    }
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE TRIAS BLEIBT GEDECKELT: platzierte Studio-Architektur lebt in der EINEN LOD-Geschichte (Fernstufe fern, Promotion nah, Cull + Slot-Bilanz sauber ueber Churn) und der Klon erbt die Studio-Gestalt."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Trias-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
