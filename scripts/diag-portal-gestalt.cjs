// diag-portal-gestalt.cjs — W-A3 DER PORTAL-GESTALT-WECHSEL (Katalysator-Bogen §6, das Baum-Muster).
// Die funktionalen Portal-Blueprints (welt_portal/strom/terrain/garage/portale + seit W-A4c
// welt_schmiede) behalten IDENTITAET + FUNKTION (Name · role portal · portalMeta · Tags ·
// blockerAABBs · E-Trigger), aber ihre RENDER-GESTALT kommt vom porta-Kern (studioGestalt-
// DATEN-Zeile, gelesen im EINEN Entry-Resolver `_foundryPresetForEntry`). W-A4c/V9.56-i: die
// LISTE zieht die Linse DYNAMISCH aus der Quelle (jede studioGestalt-Zeile + ihr Blueprint) —
// ein neues Gestalt-Portal waechst von selbst hinein; die ANKER bleiben hart (Drift laut).
// Die Linse prueft mit ehrlichen Zahlen:
//   S (statisch, Node): die studioGestalt-Traeger aus der Quelle abgeleitet (>= 6, Anker
//     welt_terrain -> verkalkt · welt_schmiede -> maurentor, jede Gestalt UNVERWECHSELBAR,
//     jeder Traeger ist ein portal-Blueprint) · der Resolver-Block ist GENERISCH (liest
//     `studioGestalt` + LIVE-Buch, KEIN welt_-Literal, foundry-gegated).
//   A (Browser, foundry-ON warm, Null-Renderer): alle abgeleiteten Blueprints tragen
//     studioGestalt LIVE (Set-Paritaet Quelle==Browser), jede Gestalt steht im LIVE-Buch
//     (f.recipes).
//   B: der Resolver loest welt_terrain -> verkalkt; Blueprints OHNE studioGestalt loesen
//     unveraendert (baum_eiche -> eiche · esse -> null · fahrzeug_wagen -> null = Regression 0).
//   C: ein gespawntes welt_-Portal materialisiert END-TO-END als Studio-Asset
//     (entry.instFoundry · instSlots > 100 Tor-Meshes · alle Slots im f:-Namensraum ·
//     KEIN sichtbares Part-Doppel-Bild: keine lebende welt_terrain-Gruppe ohne f:).
//   D: FUNKTION intakt — portalMeta byte-unveraendert · affordances.isPortal · blockerAABBs
//     vorhanden (Substanz-Wahrheit lebt) · der E-Trigger (PORTAL_REACH_M) ist von einem
//     freien Steh-Punkt VOR dem Tor erreichbar. Die Durchgangs-Zone wird GEMESSEN + geloggt
//     (die Alt-Substanz traegt dort die Quarz-Membran als Blocker — das ist die BYTE-ALTE
//     Wahrheit, kein W-A3-Regress; das Portal betritt man per E-Naeherung, nie physisch).
//   E: Groessen-Sanity — je Portal die Alt-BBox (Part-Bau) vs die porta-Asset-BBox in
//     Welt-Skala (`_foundryWorldScaleMatrix`); Hoehen-Verhaeltnis in [0.5, 3], geloggt.
//   F: Gate-Hook-Welt (__anazhGateNoFoundry, gesichert + wiederhergestellt): der Resolver
//     gibt null -> der Part-Pfad lebt byte-alt (welt_-Blueprints sind classic-intent, der
//     Spawn baut den klassischen Part-Group-Mesh: entry.mesh non-null, instFoundry false;
//     blockerAABBs relativ IDENTISCH zum Studio-Spawn = die Substanz ist regime-frei).
//   node scripts/diag-portal-gestalt.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORTAL_GESTALT_PORT || 4437);
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
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index);
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

// W-A4c/V9.56-i — DIE DYNAMISCHE WAHRHEIT: die Gestalt-Zuordnung kommt aus der QUELLE
// selbst (jede studioGestalt-Daten-Zeile + der Name des umschliessenden Blueprints via
// `NAME: { name: "NAME"`-Rueckwaerts-Anker), nicht aus einer hart gepflegten Liste — ein
// neues Gestalt-Portal (welt_schmiede) waechst von selbst in die Linse. Die ANKER unten
// (Mindest-Zahl · terrain/schmiede-Zuordnung · Einzigartigkeit) halten die Drift laut.
function deriveGestalt(srcNC) {
    const map = {};
    const re = /studioGestalt:\s*"([a-z_]+)"/g;
    let m;
    while ((m = re.exec(srcNC))) {
        const before = srcNC.slice(Math.max(0, m.index - 4000), m.index);
        const bpRe = /(\w+):\s*\{\s*name:\s*"\1"/g;
        let last = null;
        let b;
        while ((b = bpRe.exec(before))) last = b[1];
        if (last) map[last] = m[1];
    }
    return map;
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const anazhNC = stripComments(anazhSrc);
    const GESTALT = deriveGestalt(anazhNC);

    console.log("=== W-A3 PORTAL-GESTALT — TEIL S: die statischen Gesetze (Node) ===");
    console.log(
        `  ℹ️ abgeleitete Gestalt-Traeger (${Object.keys(GESTALT).length}): ${Object.entries(GESTALT)
            .map(([k, v]) => `${k}->${v}`)
            .join(" · ")}`
    );
    check(
        `S0: >= 6 Gestalt-Traeger aus der Quelle abgeleitet (${Object.keys(GESTALT).length})`,
        Object.keys(GESTALT).length >= 6
    );
    check(
        'S0: ANKER welt_terrain -> "verkalkt" (traegt B/C/D/F) + welt_schmiede -> "maurentor" (W-A4c)',
        GESTALT.welt_terrain === "verkalkt" && GESTALT.welt_schmiede === "maurentor",
        `terrain=${GESTALT.welt_terrain} schmiede=${GESTALT.welt_schmiede}`
    );
    check(
        "S0: jede Gestalt ist UNVERWECHSELBAR (keine zwei Portale teilen ein Preset)",
        new Set(Object.values(GESTALT)).size === Object.keys(GESTALT).length
    );
    for (const [bp, gestalt] of Object.entries(GESTALT)) {
        const idx = anazhNC.indexOf(`${bp}: {`);
        const block = idx >= 0 ? anazhNC.slice(idx, idx + 900) : "";
        check(
            `S1: ${bp} ("${gestalt}") ist ein portal-Blueprint (role portal + portalMeta am Traeger)`,
            /role:\s*"portal"/.test(block) && /portalMeta/.test(block)
        );
    }
    // Die DEFINITION ankern (newline + Einrueckung + oeffnende Klammer) — der nackte Name
    // matcht sonst die erste CALL-SITE (`this._foundryPresetForEntry(entry)`) und fnBody
    // extrahiert einen fremden Block.
    const resolver = fnBody(anazhNC, /\n\s+_foundryPresetForEntry\(entry\)\s*\{/);
    check(
        "S2: der Resolver-Block ist GENERISCH (liest studioGestalt + LIVE-Buch, foundry-gegated, KEIN welt_-Literal)",
        resolver !== null &&
            /studioGestalt/.test(resolver) &&
            /_foundryEnabled/.test(resolver) &&
            /recipes/.test(resolver) &&
            !/welt_/.test(resolver)
    );

    console.log("\n=== TEIL A-F: der lebende Draht (Browser, foundry-ON, Null-Renderer) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // ===== EVAL 1: Boot + Buch warm + (A) Daten-Zeilen + (B) Resolver =====
    const outAB = await page.evaluate(async (GESTALT) => {
        const res = { a: {}, b: {}, warm: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm ||
                typeof window.anazhRealm._ensureAssetFoundry !== "function" ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 60000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.geisttor && f.recipes.kathedrale) break;
            await new Promise((res2) => setTimeout(res2, 100));
        }
        res.warm = !!(f && f.ready && f.recipes && f.recipes.geisttor);
        // (A) alle 5 tragen studioGestalt; jede Gestalt steht im LIVE-Buch.
        for (const [name, gestalt] of Object.entries(GESTALT)) {
            const bp = r.state.blueprints && r.state.blueprints[name];
            res.a[name] = {
                has: !!bp && typeof bp.studioGestalt === "string",
                value: bp ? bp.studioGestalt : null,
                inBook: !!(f && f.recipes && bp && Object.prototype.hasOwnProperty.call(f.recipes, bp.studioGestalt)),
                kind: f && f.recipes && bp && f.recipes[bp.studioGestalt] ? f.recipes[bp.studioGestalt].kind : null,
            };
        }
        // (A2) Set-Paritaet: die LIVE-Blueprints mit studioGestalt == die Quelle-Ableitung.
        // V18.464 (Linsen-Heilung, Lehre 6): seit der ERFINDER-WELLE stempelt der
        // Auto-Register-Chokepoint studioGestalt auf JEDEN Klon (baum_/fahrzeug_/
        // haus_/klinge_/tor_<rezept>, Marke _foundryAutoSpecies) — die Quelle-
        // Ableitung (Literal-Zeilen im Stamm) kann nur die HANDGESCHRIEBENEN
        // Traeger sehen. Auto-Klone gehoeren nicht in diese Paritaet (ihre
        // Registrier-Wahrheit prueft gate:rezept-katalog).
        res.liveSet = Object.keys(r.state.blueprints || {})
            .filter((n) => {
                const bp = r.state.blueprints[n] || {};
                return typeof bp.studioGestalt === "string" && !bp._foundryAutoSpecies;
            })
            .sort();
        // (B) Resolver: Gestalt-Aufloesung + Regression-0-Proben.
        res.b.terrain = r._foundryPresetForEntry({ type: "welt_terrain" });
        res.b.eiche = r._foundryPresetForEntry({ type: "baum_eiche" });
        res.b.esse = r._foundryPresetForEntry({ type: "esse" });
        res.b.wagen = r._foundryPresetForEntry({ type: "fahrzeug_wagen" });
        return res;
    }, GESTALT);

    check("A: das LIVE-Buch ist warm (porta-Rezepte angekommen)", outAB.warm === true);
    check(
        "A: Set-Paritaet — die LIVE-Gestalt-Traeger sind exakt die Quelle-Ableitung (dynamische Wahrheit beidseitig)",
        JSON.stringify(outAB.liveSet) === JSON.stringify(Object.keys(GESTALT).sort()),
        `live=${(outAB.liveSet || []).join(",")}`
    );
    for (const [name, gestalt] of Object.entries(GESTALT)) {
        const a = outAB.a[name] || {};
        check(
            `A: ${name} -> "${gestalt}" steht im LIVE-Buch (kind ${a.kind})`,
            a.has === true && a.value === gestalt && a.inBook === true && a.kind === "gate",
            `value=${a.value} inBook=${a.inBook}`
        );
    }
    check(
        'B: der Resolver loest welt_terrain -> "verkalkt" (die Daten-Zeile traegt)',
        outAB.b.terrain === "verkalkt",
        String(outAB.b.terrain)
    );
    check(
        "B: Regression 0 — baum_eiche loest unveraendert auf eiche",
        outAB.b.eiche === "eiche",
        String(outAB.b.eiche)
    );
    check("B: Regression 0 — esse (ohne studioGestalt) loest auf null", outAB.b.esse === null, String(outAB.b.esse));
    check("B: Regression 0 — fahrzeug_wagen (Donor) loest auf null", outAB.b.wagen === null, String(outAB.b.wagen));

    // ===== EVAL 2: (C) End-to-End-Spawn + (D) Funktion =====
    const outCD = await page.evaluate(async () => {
        const res = { c: {}, d: {} };
        const r = window.anazhRealm;
        const bp = r.state.blueprints.welt_terrain;
        res.d.metaBefore = JSON.stringify(bp.portalMeta);
        const pm = r.state.playerMesh.position;
        const sx = pm.x + 12;
        const sz = pm.z;
        const sy = r.getTerrainHeightAt(sx, sz) + 0.5;
        const entry = r.spawnArchitecture("welt_terrain", { x: sx, y: sy, z: sz }, { silent: true, seed: 12345 });
        if (!entry) {
            res.c.err = "spawn null";
            return res;
        }
        // KALT-VERHALTEN GEMESSEN (Auftrag Punkt 6): Buch warm + Asset kalt -> der Eintrag
        // bleibt KALT (kein Mesh, kein Grammatik-/Part-Interim — die stehende Baum-Kalt-Regel);
        // die FUNKTION (E-Trigger liest affordances + position) lebt schon im Kalt-Fenster.
        res.c.coldAfterSpawn = !entry.instanced && !entry.mesh;
        // Materialisieren: der erste Rebuild stiess die Studio-Anfrage an (kalt); pollen,
        // bis das Asset andockt (der Rewarm-Weg, hier deterministisch von Hand gefahren).
        const t0 = performance.now();
        const dl = performance.now() + 90000;
        while (!entry.instanced && performance.now() < dl) {
            r._rebuildArchitectureMesh(entry);
            if (entry.instanced) break;
            await new Promise((res2) => setTimeout(res2, 300));
        }
        res.c.materializeMs = Math.round(performance.now() - t0);
        res.c.instanced = entry.instanced === true;
        res.c.instFoundry = entry.instFoundry === true;
        res.c.slotCount = Array.isArray(entry.instSlots) ? entry.instSlots.length : 0;
        res.c.allSlotsFoundry =
            Array.isArray(entry.instSlots) && entry.instSlots.every((s) => String(s.key).includes("#f:verkalkt|"));
        res.c.meshNull = entry.mesh === null || entry.mesh === undefined;
        // KEIN Doppel-Bild: keine LEBENDE welt_terrain-Gruppe ausserhalb des f:-Namensraums.
        res.c.partGroupsAlive = 0;
        if (r.state.archInstanceGroups) {
            for (const [key, g] of r.state.archInstanceGroups) {
                if (String(key).indexOf("welt_terrain#") === 0 && String(key).indexOf("#f:") < 0) {
                    if ((g.liveCount || 0) > 0 || (g.mesh && g.mesh.count > 0)) res.c.partGroupsAlive++;
                }
            }
        }
        // (D) FUNKTION intakt.
        res.d.metaAfter = JSON.stringify(r.state.blueprints.welt_terrain.portalMeta);
        res.d.role = r.state.blueprints.welt_terrain.role;
        res.d.affPortal = !!(entry.affordances && entry.affordances.isPortal === true);
        res.d.blockerCount = Array.isArray(entry.blockerAABBs) ? entry.blockerAABBs.length : 0;
        // Blocker relativ zur Entry-Position (fuer die Regime-Paritaet in EVAL 4).
        res.d.blockersRel = (entry.blockerAABBs || []).map((b) => [
            +(b.minX - entry.position.x).toFixed(6),
            +(b.maxX - entry.position.x).toFixed(6),
            +(b.minZ - entry.position.z).toFixed(6),
            +(b.maxZ - entry.position.z).toFixed(6),
            +(b.botY - entry.position.y).toFixed(6),
            +(b.topY - entry.position.y).toFixed(6),
        ]);
        // E-Trigger: ein freier Steh-Punkt VOR dem Tor (jenseits der Blocker-Kante) liegt
        // in PORTAL_REACH_M — das IST der Naeherungs-Trigger (enterPortal per E-Taste).
        const REACH = r.constructor.PORTAL_REACH_M;
        let maxZ = -1e9;
        for (const b of entry.blockerAABBs || []) maxZ = Math.max(maxZ, b.maxZ);
        const standX = entry.position.x;
        const standZ = maxZ + 0.75;
        const standY = entry.position.y;
        const inAnyAABB = (entry.blockerAABBs || []).some(
            (b) => standX >= b.minX && standX <= b.maxX && standZ >= b.minZ && standZ <= b.maxZ
        );
        const dist = Math.sqrt(
            (standX - entry.position.x) ** 2 + (standY - entry.position.y) ** 2 + (standZ - entry.position.z) ** 2
        );
        res.d.reach = REACH;
        res.d.standDist = +dist.toFixed(2);
        res.d.standFree = !inAnyAABB;
        res.d.triggerReachable = !inAnyAABB && dist <= REACH;
        // Die Durchgangs-Zone GEMESSEN (ehrlich geloggt, nicht gated): deckt ein Blocker die
        // zentrale Steh-Saeule (x +-0.5, z +-0.3, Fuss..2 m)? Die Alt-Substanz traegt dort die
        // Quarz-Membran (dichte 0.65 >= 0.3) — byte-alt, das Betreten ist der E-Trigger.
        const footY = entry.position.y - 0.5;
        res.d.doorwayBlocked = (entry.blockerAABBs || []).some(
            (b) =>
                b.minX < entry.position.x + 0.5 &&
                b.maxX > entry.position.x - 0.5 &&
                b.minZ < entry.position.z + 0.3 &&
                b.maxZ > entry.position.z - 0.3 &&
                b.botY < footY + 2.0 &&
                b.topY > footY + 0.2
        );
        window.__wa3Entry = entry;
        return res;
    });

    check(
        "C: das gespawnte welt_terrain materialisiert als Studio-Asset (instanced + instFoundry)",
        outCD.c.instanced === true && outCD.c.instFoundry === true,
        outCD.c.err || `instanced=${outCD.c.instanced} foundry=${outCD.c.instFoundry}`
    );
    check(
        `C: Tor-Geometrie angekommen (instSlots ${outCD.c.slotCount} > 100 Meshes)`,
        outCD.c.slotCount > 100,
        String(outCD.c.slotCount)
    );
    check("C: alle Slots leben im f:verkalkt-Namensraum", outCD.c.allSlotsFoundry === true);
    console.log(
        `  ℹ️ Kalt-Verhalten: nach dem Spawn (Buch warm, Asset kalt) ${outCD.c.coldAfterSpawn ? "KALT ohne Interim (Baum-Kalt-Regel; E-Trigger lebt schon)" : "sofort materialisiert/Interim"} · Materialisierung nach ${outCD.c.materializeMs} ms (headless swiftshader-Worker)`
    );
    check(
        "C: KEIN Doppel-Bild (kein entry.mesh, keine lebende Part-Gruppe)",
        outCD.c.meshNull === true && outCD.c.partGroupsAlive === 0,
        `partGroupsAlive=${outCD.c.partGroupsAlive}`
    );
    check(
        "D: portalMeta byte-unveraendert am Blueprint (role portal)",
        outCD.d.metaBefore === outCD.d.metaAfter && outCD.d.role === "portal"
    );
    check("D: der Entry traegt affordances.isPortal", outCD.d.affPortal === true);
    check(`D: blockerAABBs vorhanden (${outCD.d.blockerCount} — die Substanz-Wahrheit lebt)`, outCD.d.blockerCount > 0);
    check(
        `D: der E-Trigger ist von einem freien Steh-Punkt vor dem Tor erreichbar (Distanz ${outCD.d.standDist} m <= ${outCD.d.reach} m)`,
        outCD.d.triggerReachable === true,
        `standFree=${outCD.d.standFree}`
    );
    console.log(
        `  ℹ️ Durchgangs-Zone gemessen: ${outCD.d.doorwayBlocked ? "von der ALT-Substanz belegt (Quarz-Membran-Blocker — byte-alt, kein W-A3-Regress; Betreten = E-Naeherung)" : "frei"}`
    );

    // ===== EVAL 3: (E) Groessen-Sanity — Alt-BBox (Parts) vs porta-Asset in Welt-Skala =====
    const outE = await page.evaluate(async (GESTALT) => {
        const r = window.anazhRealm;
        const out = {};
        for (const [name, gestalt] of Object.entries(GESTALT)) {
            const bp = r.state.blueprints[name];
            // Alt-BBox aus den Parts (position +- size/2 — die Part-Bau-Huelle, scale 1).
            let mnx = 1e9,
                mxx = -1e9,
                mny = 1e9,
                mxy = -1e9,
                mnz = 1e9,
                mxz = -1e9;
            for (const p of bp.parts || []) {
                if (!p || !p.position || !p.size) continue;
                mnx = Math.min(mnx, p.position.x - p.size.x / 2);
                mxx = Math.max(mxx, p.position.x + p.size.x / 2);
                mny = Math.min(mny, p.position.y - p.size.y / 2);
                mxy = Math.max(mxy, p.position.y + p.size.y / 2);
                mnz = Math.min(mnz, p.position.z - p.size.z / 2);
                mxz = Math.max(mxz, p.position.z + p.size.z / 2);
            }
            const alt = { w: +(mxx - mnx).toFixed(2), h: +(mxy - mny).toFixed(2), d: +(mxz - mnz).toFixed(2) };
            const meshes = await Promise.race([
                r._foundryRequest(gestalt, 3, 0, r.state.season || "summer"),
                new Promise((res3) => setTimeout(() => res3(null), 45000)),
            ]);
            if (!Array.isArray(meshes) || !meshes.length) {
                out[name] = { alt, err: "asset null" };
                continue;
            }
            const g = r._foundryBuildGroup(meshes, { lod: 0, preset: gestalt });
            g.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(g);
            const k = r._foundryWorldScaleMatrix(gestalt).elements[0] || 1;
            const neu = {
                w: +((box.max.x - box.min.x) * k).toFixed(2),
                h: +((box.max.y - box.min.y) * k).toFixed(2),
                d: +((box.max.z - box.min.z) * k).toFixed(2),
                meshes: meshes.length,
                scaleK: k,
            };
            g.traverse((o) => {
                if (o.isMesh && o.geometry) o.geometry.dispose();
            });
            out[name] = { alt, neu, ratioH: +(neu.h / Math.max(0.01, alt.h)).toFixed(2) };
        }
        return out;
    }, GESTALT);

    for (const [name, gestalt] of Object.entries(GESTALT)) {
        const e = outE[name] || {};
        if (!e.neu) {
            check(`E: ${name} -> ${gestalt} Asset messbar`, false, e.err || "kein Ergebnis");
            continue;
        }
        console.log(
            `  ℹ️ ${name} -> ${gestalt}: ALT ${e.alt.w}×${e.alt.h}×${e.alt.d} m · NEU ${e.neu.w}×${e.neu.h}×${e.neu.d} m (Welt-Skala ×${e.neu.scaleK}, ${e.neu.meshes} Meshes) · Hoehen-Ratio ${e.ratioH}`
        );
        check(
            `E: ${name} Hoehen-Ratio ${e.ratioH} in [0.5, 3]`,
            Number.isFinite(e.ratioH) && e.ratioH >= 0.5 && e.ratioH <= 3
        );
    }

    // ===== EVAL 4: (F) Gate-Hook-Welt — Resolver null, Part-Pfad lebt, Substanz regime-frei =====
    const outF = await page.evaluate(async (blockersRelStudio) => {
        const res = {};
        const r = window.anazhRealm;
        const prev = window.__anazhGateNoFoundry;
        window.__anazhGateNoFoundry = true;
        try {
            res.resolver = r._foundryPresetForEntry({ type: "welt_terrain" });
            const pm = r.state.playerMesh.position;
            const sx = pm.x + 24;
            const sz = pm.z + 6;
            const sy = r.getTerrainHeightAt(sx, sz) + 0.5;
            const entry2 = r.spawnArchitecture("welt_terrain", { x: sx, y: sy, z: sz }, { silent: true, seed: 12345 });
            if (!entry2) {
                res.err = "spawn null";
                return res;
            }
            // welt_-Blueprints tragen KEIN `instanced: true` (classic-intent) -> der Part-
            // Pfad baut den klassischen Group-Mesh (entry.mesh), wie vor W-A3 (byte-alt).
            res.mesh = !!entry2.mesh;
            res.meshChildren = entry2.mesh && entry2.mesh.children ? entry2.mesh.children.length : 0;
            res.instFoundry = entry2.instFoundry === true;
            const rel = (entry2.blockerAABBs || []).map((b) => [
                +(b.minX - entry2.position.x).toFixed(6),
                +(b.maxX - entry2.position.x).toFixed(6),
                +(b.minZ - entry2.position.z).toFixed(6),
                +(b.maxZ - entry2.position.z).toFixed(6),
                +(b.botY - entry2.position.y).toFixed(6),
                +(b.topY - entry2.position.y).toFixed(6),
            ]);
            res.blockerParity = JSON.stringify(rel) === JSON.stringify(blockersRelStudio);
            r.removeArchitecture(entry2);
        } finally {
            // V18.423-Lehre: den Hook SICHERN + WIEDERHERSTELLEN, NIE nackt loeschen.
            if (prev) window.__anazhGateNoFoundry = prev;
            else delete window.__anazhGateNoFoundry;
        }
        return res;
    }, outCD.d.blockersRel);

    check(
        "F: unter dem Gate-Hook faellt der Resolver auf null (gate-treu)",
        outF.resolver === null,
        String(outF.resolver)
    );
    check(
        "F: der Part-Pfad lebt byte-alt (klassischer Part-Group-Mesh, kein Foundry-Merker)",
        outF.mesh === true && outF.instFoundry !== true && outF.meshChildren > 0,
        outF.err || `mesh=${outF.mesh} foundry=${outF.instFoundry} kinder=${outF.meshChildren}`
    );
    check(
        "F: die Substanz ist regime-frei (blockerAABBs relativ IDENTISCH Studio- vs Part-Spawn)",
        outF.blockerParity === true
    );

    await browser.close();
    server.close();

    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — W-A3 STEHT: die ${Object.keys(GESTALT).length} welt_-Portale (dynamisch aus der Quelle) tragen ihre porta-Gestalt als DATEN-Zeile, der EINE Entry-Resolver serviert sie generisch (fail-soft, foundry-gegated), das Studio-Asset materialisiert end-to-end ohne Doppel-Bild, die Substanz-Wahrheit (portalMeta · Tags · blockerAABBs · E-Trigger) lebt byte-alt in BEIDEN Regimen.`
    );
    process.exit(0);
})().catch((e) => {
    console.error("W-A3-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
