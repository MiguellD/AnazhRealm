// diag-vehicle-drive.cjs — N6 / H7: DAS LAB-FAHRPROFIL FÜHRT (Nervensystem Phase δ).
// Beweist die drive-Reise Lab-Formel → Buch → Host-Profil, OHNE dass ein zweiter
// Wahrheits-Satz oder ein zweiter Fahr-Pfad entsteht (M1/M9 · N6.4):
//   A (statisch + numerisch, Node):
//     A1 exportDrive + FAHR leben im KERN (vehicle-core), die Shell traegt KEIN
//        eigenes FAHR-Literal/carPhys mehr (sie LIEST VC.FAHR — der N6.1-Umzug).
//     A2 (Formel-Paritaet, Kriterium d): exportDrive == die Hand-Ableitung aus den
//        Primitiven carPhys/FAHR/DEFAULT_P an 3 Presets, byte-exakt (===) — die
//        Shell faehrt ihre Probefahrt mit EXAKT diesen Primitiven, also Kern==Shell.
//     A3 (H7, Kriterium b numerisch): GT vs Supersport — mindestens zwei drive-
//        Skalare messbar verschieden (Lab-Formel != Emergenz-Zufall).
//     A4 die Bruecke rechnet fahrprofil GENERISCH beim Buch-Bau (zk.kern.exportDrive,
//        kein ns-Literal — Gesetz #0: kein eingefrorenes Preset-Duplikat).
//     A5 (N6.3/N6.4): _vehicleProfile liest den B6-Steckplatz (fx.fahrprofil), und
//        der Bewegungs-Loop bleibt EIN Pfad (ride.kAcc/kBrake/topSpeedMul leben je
//        GENAU EINMAL, alle in _loopPlayerMovement — kein zweiter Fahr-Code).
//   B (Browser, foundry-ON, Null-Renderer — der lebende Draht):
//     B-a das LIVE-Buch traegt fahrprofil je Fahrzeug-Preset (5/5, finite Skalare).
//     B-b GT vs Supersport im LIVE-Buch verschieden UND bit-exakt == den Node-
//         Werten (die Formel reiste unverfaelscht durch Worker + Ingest).
//     B-c _vehicleProfile(fahrzeug_gt) traegt die LAB-Werte (=== exportDrive);
//         die EMERGENZ (AUSLÖSCHUNGS-WELLE: der Alt-Blueprint fahrzeug_wagen ist
//         gefallen) wird an einem Test-Blueprint aus KIND_SUBSTANCE.fahrzeug_wagen
//         bewiesen (parts+connections JSON-geklont, registriert, aufgeraeumt) —
//         byte-gleich gegen die emergente Formel nachgerechnet; floats bleibt in
//         BEIDEN die Substanz-Entscheidung (das Lab kennt kein Wasser).
//   B-d (B2, Schoepfer-Browser-Befund 14.07. „Fahren bewegt das Fahrzeug nicht"): DIE
//     FAHR-PROBE — fahrzeug_gt wird gespawnt (Studio-instanziert), bestiegen, N Fahr-Ticks
//     gefahren; danach MUSS entry.position > 1 m bewegt sein, der Spieler darauf sitzen,
//     die Instanz-Matrix (der EINE _archInstanceUpdate-Weg) + die Blocker (_populate-
//     BlockerAABBs) mitgezogen sein und der Snapshot (buildStateSnapshot) die neue
//     Position tragen. Statisch dazu A6: _tickMountedMovement ist an den Chokepoint
//     gebunden (pos folgt pm · _archInstanceUpdate · Blocker), _archInstanceUpdate ist
//     foundry-bewusst (EINE Flat-Quelle wie _rebuildArchitectureMesh).
//   SELBST-TEST (--selftest): (1) ein verfaelschtes fahrprofil → die Divergenz-
//     Linse feuert; (2) eine Shell mit eigenem FAHR-Literal → die Umzugs-Wand feuert;
//     (3) B2: „Eintrag bleibt stehen"/„Instanz-Matrix klebt am Spawn" → die Fahr-
//     Verdikt-Linse feuert; ein Stamm ohne _archInstanceUpdate-Bindung → A6 feuert.
//   node scripts/diag-vehicle-drive.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.DRIVE_PORT || 4411);
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
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren Muster woertlich).
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
function countOcc(src, needle) {
    let n = 0,
        i = 0;
    for (;;) {
        i = src.indexOf(needle, i);
        if (i < 0) return n;
        n++;
        i += needle.length;
    }
}

// ── DIE DIVERGENZ-LINSE: welche drive-Skalare weichen vom Soll ab? (===, byte) ──
const DRIVE_KEYS = ["topSpeedMul", "kAcc", "kBrake", "mass", "vmax"];
function driveDiverges(fp, expected) {
    const out = [];
    for (const k of DRIVE_KEYS) {
        if (!fp || !Number.isFinite(fp[k]) || fp[k] !== expected[k]) out.push(k);
    }
    if (!fp || !fp.spring || fp.spring.k !== expected.spring.k || fp.spring.c !== expected.spring.c) out.push("spring");
    return out;
}
// H7-Zaehlung: wie viele Skalare unterscheiden zwei Profile? (bewusst OHNE spring)
function scalarDiffs(a, b) {
    return DRIVE_KEYS.filter((k) => a && b && Number.isFinite(a[k]) && Number.isFinite(b[k]) && a[k] !== b[k]);
}

// ── B2 — DAS FAHR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test lesen sie —
// die Linse ist beweisbar nicht-vakuoes). Rueckgabe: Liste der Verstoesse (leer = gruen).
function driveVerdict(d) {
    const out = [];
    if (!d || d.spawned !== true) out.push("spawn");
    if (!d || d.mounted !== true) out.push("mount");
    if (!d || !(d.dist > 1)) out.push("dist<=1m"); // die stehende Probe: > 1 m nach N Fahr-Ticks
    if (!d || d.seated !== true) out.push("seat"); // der Spieler sitzt darauf
    if (!d || !Number.isFinite(d.visDX) || !Number.isFinite(d.visDZ) || d.visDX > 0.05 || d.visDZ > 0.05)
        out.push("visual"); // Instanz-Matrix/Mesh zieht mit (die B2-Wurzel)
    if (!d || !Number.isFinite(d.blockerMax) || d.blockerMax > 8) out.push("blocker");
    if (!d || d.riderSkip !== true) out.push("riderSkip"); // nie gegen den eigenen Reiter
    if (!d || !(d.snapDist > 1)) out.push("persist"); // der Snapshot traegt die Fahrt
    return out;
}

// ── Kern in Node laden (die diag-vehicle-contract-Klasse: r128-UMD + require) ──
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "vehicle-core.js"));
const VC = globalThis.__vehicleCore;
function expectedFor(presetId) {
    const p = VC.PRESETS[presetId];
    return VC.exportDrive(Object.assign({}, p.s, p.fx));
}

// ===== TEIL A: die statischen + numerischen Gesetze =====
function staticLaws(vcSrc, garageSrc, anazhSrc, phytoSrc) {
    const vcNC = stripComments(vcSrc);
    const garNC = stripComments(garageSrc);
    const anazhNC = stripComments(anazhSrc);
    const phytoNC = stripComments(phytoSrc);
    const out = [];
    out.push([
        "A1: exportDrive + FAHR leben im Kern (definiert + im Namensraum exportiert)",
        /function exportDrive\(/.test(vcNC) &&
            /exportDrive:\s*exportDrive/.test(vcNC) &&
            /FAHR:\s*FAHR/.test(vcNC) &&
            /const FAHR\s*=/.test(vcNC),
    ]);
    out.push([
        "A1: die Shell liest FAHR aus dem Kern (kein eigenes Literal, kein eigenes carPhys)",
        /FAHR\s*=\s*VC\.FAHR/.test(garNC) && !/maxSteer\s*:/.test(garNC) && !/function\s+carPhys/.test(garNC),
    ]);
    out.push([
        "A4: die Bruecke rechnet fahrprofil generisch beim Buch-Bau (zk.kern.exportDrive, kein ns-Literal)",
        /zk\.kern\.exportDrive/.test(phytoNC) &&
            /fx\.fahrprofil\s*=\s*fp/.test(phytoNC) &&
            !/self\.__vehicleCore/.test(phytoNC),
    ]);
    const vp = fnBody(anazhNC, /_vehicleProfile\(entry\)\s*/);
    out.push([
        "A5: _vehicleProfile liest den B6-Steckplatz (fx.fahrprofil fuehrt, Emergenz = Fallback)",
        vp !== null && /fx\.fahrprofil/.test(vp) && /Number\.isFinite\(_fp\.topSpeedMul\)/.test(vp),
    ]);
    // N6.4 — EIN Bewegungs-Pfad: jeder ride-Skalar lebt GENAU EINMAL, alle im EINEN Loop.
    const move = fnBody(anazhNC, /_loopPlayerMovement\(currentTime, dtOverride\)\s*/);
    const rides = ["ride.topSpeedMul", "ride.kAcc", "ride.kBrake"];
    out.push([
        "A5/N6.4: EIN Bewegungs-Pfad (ride.topSpeedMul/kAcc/kBrake je genau 1x, alle in _loopPlayerMovement)",
        move !== null && rides.every((n) => countOcc(anazhNC, n) === 1 && countOcc(move, n) === 1),
        rides.map((n) => `${n}=${countOcc(anazhNC, n)}`).join(" "),
    ]);
    // B2 (14.07.) — der GERITTENE Eintrag haengt am EINEN Bewegungs-Chokepoint: Position
    // folgt dem Reiter, die Instanz-Matrix zieht ueber den EINEN Update-Weg mit, die
    // Blocker folgen. [^.] vor dem Namen = die DEFINITION, nie der this.-Aufruf.
    const tmm = fnBody(anazhNC, /[^.]_tickMountedMovement\(dt\)\s*\{/);
    out.push([
        "A6/B2: _tickMountedMovement bindet den Eintrag an den Chokepoint (pos folgt pm + _archInstanceUpdate + Blocker)",
        tmm !== null &&
            /entry\.position\.x = pm\.x/.test(tmm) &&
            /_archInstanceUpdate\(entry\)/.test(tmm) &&
            /_populateBlockerAABBs\(entry\)/.test(tmm),
    ]);
    const aiu = fnBody(anazhNC, /[^.]_archInstanceUpdate\(entry\)\s*\{/);
    out.push([
        "A6/B2: _archInstanceUpdate liest die EINE Flat-Quelle (foundry-bewusst: _foundryFlattenFor ODER _archFlattenBlueprint)",
        aiu !== null && /_foundryFlattenFor/.test(aiu) && /_archFlattenBlueprint/.test(aiu),
    ]);
    return out;
}

(async () => {
    const vcSrc = fs.readFileSync(path.join(root, "vehicle-core.js"), "utf8");
    const garageSrc = fs.readFileSync(path.join(root, "worlds/garage/garage.js"), "utf8");
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const phytoSrc = fs.readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: ein verfaelschtes fahrprofil (Kriterium e) → die Divergenz-Linse MUSS feuern.
        const exp = expectedFor("gt");
        check("Selbst-Test 0: unverfaelscht == 0 Divergenzen", driveDiverges(expectedFor("gt"), exp).length === 0);
        const bad1 = Object.assign({}, exp, { topSpeedMul: exp.topSpeedMul * 1.07 });
        check("Selbst-Test 1: verfaelschtes topSpeedMul → Divergenz erkannt", driveDiverges(bad1, exp).length >= 1);
        const bad2 = Object.assign({}, exp, { kBrake: exp.kAcc }); // kBrake auf kAcc gefaelscht (die Formel-Verwechslung)
        check("Selbst-Test 2: verfaelschtes kBrake → Divergenz erkannt", driveDiverges(bad2, exp).length >= 1);
        // V2: eine Shell mit EIGENEM FAHR-Literal (der Rueckfall vor den N6.1-Umzug) → A1 feuert.
        const brokenShell = garageSrc.replace(
            /const FAHR\s*=\s*VC\.FAHR[^\n]*/,
            "const FAHR={maxSteer:0.52,brakeDecel:14,rollDecel:1.0,handDecel:9,G:9.8,CA_F:5.0,CA_R:5.6,maxGrip:1.0,izzK:1.4};"
        );
        const a1 = staticLaws(vcSrc, brokenShell, anazhSrc, phytoSrc).filter((l) => l[0].startsWith("A1"));
        check(
            "Selbst-Test 3: Shell mit eigenem FAHR-Literal → die Umzugs-Wand feuert",
            a1.some((l) => l[1] === false)
        );
        // V3 (B2): die FAHR-VERDIKT-Linse feuert auf beide Verletzungs-Klassen des Befunds.
        const healthy = {
            spawned: true,
            mounted: true,
            dist: 14.4,
            seated: true,
            visDX: 0.001,
            visDZ: 0.001,
            blockerMax: 2.1,
            riderSkip: true,
            snapDist: 14.4,
        };
        check("Selbst-Test 4 (B2): gesunde Fahr-Probe == 0 Verstoesse", driveVerdict(healthy).length === 0);
        check(
            "Selbst-Test 5 (B2): ‚der Eintrag bleibt stehen' → die Fahr-Linse feuert",
            driveVerdict(Object.assign({}, healthy, { dist: 0.0, snapDist: 0.0 })).length >= 1
        );
        check(
            "Selbst-Test 6 (B2): ‚die Instanz-Matrix klebt am Spawn' → die Fahr-Linse feuert",
            driveVerdict(Object.assign({}, healthy, { visDX: 14.4 })).length >= 1
        );
        // V4 (B2): ein Stamm OHNE die Chokepoint-Bindung → die A6-Wand feuert.
        const brokenAnazh = anazhSrc.replace("this._archInstanceUpdate(entry);", "");
        const a6 = staticLaws(vcSrc, garageSrc, brokenAnazh, phytoSrc).filter((l) => l[0].startsWith("A6"));
        check(
            "Selbst-Test 7 (B2): _tickMountedMovement ohne _archInstanceUpdate → die A6-Wand feuert",
            a6.some((l) => l[1] === false)
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== N6/H7 — TEIL A: Formel + Paritaet + ein Pfad (Node) ===");
    for (const [name, ok, detail] of staticLaws(vcSrc, garageSrc, anazhSrc, phytoSrc)) check(name, ok, detail);

    // A2 (Kriterium d) — FORMEL-PARITAET an 3 Presets: exportDrive == Hand-Ableitung aus den
    // Primitiven, mit denen die Shell ihre Probefahrt faehrt (carPhys + FAHR + DEFAULT_P/BASE_P).
    for (const id of ["gt", "supersport", "suv"]) {
        const pre = VC.PRESETS[id];
        const P = Object.assign({}, VC.DEFAULT_P, VC.BASE_P, pre.s, pre.fx);
        const ph = VC.carPhys(P);
        const hand = {
            topSpeedMul: ph.vmax / 10,
            kAcc: ph.aEngine / ph.vmax,
            kBrake: (ph.aEngine + VC.FAHR.rollDecel) / ph.vmax,
            mass: ph.mass,
            vmax: ph.vmax,
            spring: { k: P.springRate, c: P.damping },
        };
        const div = driveDiverges(expectedFor(id), hand);
        check(`A2: Formel-Paritaet Kern==Probefahrt-Primitive @ ${id} (byte)`, div.length === 0, div.join(","));
    }
    // A3 (H7 numerisch) — GT vs Supersport: mindestens zwei drive-Skalare verschieden.
    const gtExp = expectedFor("gt");
    const ssExp = expectedFor("supersport");
    const diffs = scalarDiffs(gtExp, ssExp);
    check(
        "A3/H7: GT vs Supersport — >=2 drive-Skalare messbar verschieden (Lab-Formel, kein Emergenz-Zufall)",
        diffs.length >= 2,
        `${diffs.join(",")} | GT kAcc=${gtExp.kAcc.toFixed(4)} SS kAcc=${ssExp.kAcc.toFixed(4)}`
    );

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const nodeExpected = { gt: gtExp, supersport: ssExp };
    const out = await page.evaluate(async (expected) => {
        const res = { book: {}, prof: {}, emerg: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        // Buch + Auto-Blueprint abwarten (das fahrprofil reist im selben get-recipes-Reply).
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            if (
                f &&
                f.ready &&
                f.recipes &&
                f.recipes.gt &&
                f.recipes.gt.fx &&
                f.recipes.gt.fx.fahrprofil &&
                r.state.blueprints &&
                r.state.blueprints.fahrzeug_gt
            )
                break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        // ===== B-a: das LIVE-Buch je Fahrzeug-Preset =====
        try {
            for (const id in f.recipes) {
                const rec = f.recipes[id];
                if (rec && rec.kind === "vehicle")
                    res.book[id] = rec.fx && typeof rec.fx.fahrprofil === "object" ? rec.fx.fahrprofil : null;
            }
        } catch (e) {
            res.bookErr = (e && e.message) || String(e);
        }
        // ===== B-c: das Host-Profil — Lab fuehrt (fahrzeug_gt) · Emergenz bleibt (fahrzeug_wagen) =====
        try {
            const pGt = r._vehicleProfile({ type: "fahrzeug_gt" });
            res.prof.gt = pGt
                ? { topSpeedMul: pGt.topSpeedMul, kAcc: pGt.kAcc, kBrake: pGt.kBrake, floats: pGt.floats }
                : null;
            // AUSLÖSCHUNGS-WELLE: der Alt-Blueprint fahrzeug_wagen ist gefallen — die
            // EMERGENZ wird an einem Test-Blueprint aus der Substanz-Tabelle bewiesen
            // (parts+connections JSON-geklont, registriert, danach aufgeraeumt).
            const KS = r.constructor.KIND_SUBSTANCE || {};
            const sub = KS.fahrzeug_wagen;
            res.prof.wagenAbsent = !(r.state.blueprints && r.state.blueprints.fahrzeug_wagen);
            res.prof.substanzParts = sub && Array.isArray(sub.parts) ? sub.parts.length : 0;
            delete r.state.blueprints._drive_probe_wagen;
            r.state.blueprints._drive_probe_wagen = {
                name: "_drive_probe_wagen",
                parts: JSON.parse(JSON.stringify(sub.parts)),
                connections: JSON.parse(JSON.stringify(sub.connections || [])),
            };
            const pWg = r._vehicleProfile({ type: "_drive_probe_wagen" });
            res.prof.wagen = pWg
                ? { topSpeedMul: pWg.topSpeedMul, kAcc: pWg.kAcc, kBrake: pWg.kBrake, floats: pWg.floats }
                : null;
            // fahrzeug_wagen loest auf KEIN Buch-Preset ("wagen" steht in keinem Buch -> null,
            // der dokumentierte Substanz-Pfad) — die 0-Regress-Praemisse: kein Override moeglich.
            res.prof.wagenPreset = r._foundryPresetFor("fahrzeug_wagen");
            res.prof.wagenHasRecipe = !!(f.recipes && res.prof.wagenPreset && f.recipes[res.prof.wagenPreset]);
            // Die EMERGENTE Formel NACHGERECHNET (byte-gleich zur _vehicleProfile-Emergenz):
            const bp = r.state.blueprints._drive_probe_wagen;
            const roles =
                bp && Array.isArray(bp.parts) && bp.parts.length >= 2
                    ? r.computeMotionRoles(bp.parts, bp.connections)
                    : null;
            let rad = 0,
                bein = 0;
            if (roles)
                for (const ro of roles) {
                    if (ro && ro.role === "rad") rad++;
                    else if (ro && ro.role === "bein") bein++;
                }
            const mass = bp ? Math.max(0.6, Math.min(2.5, r._compoundSizeFactor(bp))) : 1;
            res.emerg = {
                topSpeedMul: 1 + Math.min(0.6, rad * 0.12) + (rad === 0 && bein >= 2 ? 0.15 : 0),
                kAcc: Math.max(2.5, Math.min(10, 7 / mass)),
                kBrake: rad > 0 ? Math.max(1.5, Math.min(6, 3.5 / mass)) : Math.max(4, Math.min(10, 8 / mass)),
            };
            res.emerg.radCount = rad;
            delete r.state.blueprints._drive_probe_wagen; // Aufraeumen (die Probe hinterlaesst nichts)
        } catch (e) {
            res.profErr = (e && e.message) || String(e);
        }
        // ===== B-d (B2 14.07.): DIE FAHR-PROBE — nach N Fahr-Ticks bewegt sich der EINTRAG =====
        try {
            const pm = r.state.playerMesh.position;
            const spawnAt = { x: pm.x + 5, y: pm.y, z: pm.z };
            const entry = r.spawnArchitecture("fahrzeug_gt", spawnAt, { silent: true, precise: true });
            res.drive = { spawned: !!entry };
            if (entry) {
                // Studio-Gestalt andocken lassen (der Bau ist async: Flat-Miss → Anfrage → Bau).
                const dl2 = performance.now() + 45000;
                while (!entry.instanced && !entry.mesh && performance.now() < dl2) {
                    r._rebuildArchitectureMesh(entry);
                    if (entry.instanced || entry.mesh) break;
                    await new Promise((res3) => setTimeout(res3, 200));
                }
                res.drive.visualKind = entry.instanced ? "instanced" : entry.mesh ? "mesh" : "kalt";
                const m0 = { x: entry.position.x, z: entry.position.z };
                const mres = r.mountArchitecture(entry);
                res.drive.mounted = !!(mres && mres.ok) && r.state.player.mountedArch === entry.id;
                // N Fahr-Ticks: der REITER ist die horizontale Autoritaet (V18.150) — pm faehrt,
                // playerVel traegt die Fahrt-Richtung (Gier-/Phasen-Quelle des Chokepoints).
                if (r.state.playerVel) r.state.playerVel.setValue(2.4, 0, 0);
                for (let i = 0; i < 120; i++) {
                    pm.x += 0.12;
                    r._tickMountedMovement(0.05);
                }
                res.drive.dist = Math.hypot(entry.position.x - m0.x, entry.position.z - m0.z);
                res.drive.seated =
                    r.state.player.mountedArch === entry.id &&
                    Number.isFinite(entry._sitzHeight) &&
                    Math.abs(pm.y - (entry.position.y + entry._sitzHeight)) < 0.06;
                // Das VISUAL zieht mit (die B2-Wurzel: die Instanz-Matrix blieb am Spawn stehen).
                if (entry.instanced && entry.instSlots && entry.instSlots.length) {
                    const sl = entry.instSlots[0];
                    const g = r.state.archInstanceGroups && r.state.archInstanceGroups.get(sl.key);
                    if (g && g.mesh && typeof g.mesh.getMatrixAt === "function") {
                        const mm = new THREE.Matrix4();
                        g.mesh.getMatrixAt(sl.slot, mm);
                        res.drive.visDX = Math.abs(mm.elements[12] - entry.position.x);
                        res.drive.visDZ = Math.abs(mm.elements[14] - entry.position.z);
                    }
                } else if (entry.mesh) {
                    res.drive.visDX = Math.abs(entry.mesh.position.x - entry.position.x);
                    res.drive.visDZ = Math.abs(entry.mesh.position.z - entry.position.z);
                }
                // Blocker folgen (max. Zentrums-Abstand aller Boxen zur neuen Position) +
                // blocken den eigenen Reiter nie (der riddenId-Skip im Kapsel-Chokepoint).
                if (entry.blockerAABBs) {
                    let bMax = 0;
                    for (const b of entry.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2;
                        const cz = (b.minZ + b.maxZ) / 2;
                        bMax = Math.max(bMax, Math.hypot(cx - entry.position.x, cz - entry.position.z));
                    }
                    res.drive.blockerMax = bMax;
                }
                res.drive.riderSkip = /riddenId/.test(String(r._stepCharacterStructures));
                // Persistenz: der Snapshot traegt die GEFAHRENE Position (wie jede Architektur-Bewegung).
                const snap = r.buildStateSnapshot();
                const se =
                    snap && Array.isArray(snap.architectures)
                        ? snap.architectures.find((a) => a.id === entry.id)
                        : null;
                res.drive.snapDist = se ? Math.hypot(se.position.x - m0.x, se.position.z - m0.z) : null;
                // Aufraeumen (die Probe hinterlaesst nichts).
                r.dismountArchitecture();
                r.removeArchitecture(entry);
                if (r.state.playerVel) r.state.playerVel.setValue(0, 0, 0);
                r.state._fieldVy = 0;
            }
        } catch (e) {
            res.driveErr = (e && e.message) || String(e);
        }
        void expected;
        return res;
    }, nodeExpected);

    await browser.close();
    server.close();

    // B-a: 5/5 Fahrzeug-Presets tragen ein finites fahrprofil.
    const bookIds = Object.keys(out.book || {});
    const withFp = bookIds.filter(
        (id) =>
            out.book[id] &&
            Number.isFinite(out.book[id].topSpeedMul) &&
            Number.isFinite(out.book[id].kAcc) &&
            Number.isFinite(out.book[id].kBrake)
    );
    check(
        "B-a: das LIVE-Buch traegt fahrprofil je Fahrzeug-Preset (5/5, finite Skalare)",
        bookIds.length === 5 && withFp.length === 5,
        out.bookErr || `${withFp.length}/${bookIds.length}`
    );
    // B-b: GT vs Supersport im LIVE-Buch — verschieden UND bit-exakt == der Node-Formel.
    const liveGt = out.book.gt;
    const liveSs = out.book.supersport;
    const liveDiffs = liveGt && liveSs ? scalarDiffs(liveGt, liveSs) : [];
    check(
        "B-b/H7: GT vs Supersport im LIVE-Buch — >=2 drive-Skalare verschieden",
        liveDiffs.length >= 2,
        liveDiffs.join(",")
    );
    check(
        "B-b: die Lab-Werte reisten BIT-EXAKT durch Worker+Ingest (Buch == Node-exportDrive, gt+supersport)",
        !!liveGt && !!liveSs && driveDiverges(liveGt, gtExp).length === 0 && driveDiverges(liveSs, ssExp).length === 0,
        liveGt ? driveDiverges(liveGt, gtExp).join(",") : "kein gt im Buch"
    );
    // B-c: das Host-Profil.
    const pg = out.prof.gt;
    check(
        "B-c: _vehicleProfile(fahrzeug_gt) traegt die LAB-Werte (topSpeedMul/kAcc/kBrake === exportDrive)",
        !!pg && pg.topSpeedMul === gtExp.topSpeedMul && pg.kAcc === gtExp.kAcc && pg.kBrake === gtExp.kBrake,
        out.profErr || (pg ? `kAcc=${pg.kAcc}` : "kein Profil")
    );
    const pw = out.prof.wagen;
    check(
        "B-c: der Alt-Blueprint fahrzeug_wagen ist ABWESEND — die Substanz-Tabelle traegt 17 Parts (AUSLÖSCHUNGS-WELLE)",
        out.prof.wagenAbsent === true && out.prof.substanzParts === 17,
        `absent=${out.prof.wagenAbsent} substanzParts=${out.prof.substanzParts}`
    );
    check(
        "B-c: fahrzeug_wagen loest auf KEIN Buch-Rezept (null — der Substanz-Pfad, 0-Regress-Praemisse)",
        out.prof.wagenPreset === null && out.prof.wagenHasRecipe === false,
        `${out.prof.wagenPreset} · imBuch=${out.prof.wagenHasRecipe}`
    );
    check(
        "B-c: _vehicleProfile(Test-Blueprint aus KIND_SUBSTANCE.fahrzeug_wagen) traegt die EMERGENZ byte-gleich (nachgerechnet, 4 Raeder leben in der Substanz)",
        !!pw &&
            !!out.emerg &&
            pw.topSpeedMul === out.emerg.topSpeedMul &&
            pw.kAcc === out.emerg.kAcc &&
            pw.kBrake === out.emerg.kBrake &&
            out.emerg.radCount === 4,
        pw
            ? `kAcc=${pw.kAcc} soll=${out.emerg && out.emerg.kAcc} rad=${out.emerg && out.emerg.radCount}`
            : "kein Profil"
    );
    check(
        "B-c: floats bleibt SUBSTANZ-Entscheidung (Lab exportiert kein floats — gt == wagen, derselbe Donor)",
        !!pg && !!pw && typeof pg.floats === "boolean" && pg.floats === pw.floats,
        pg && pw ? `gt=${pg.floats} wagen=${pw.floats}` : ""
    );
    // B-d (B2): die stehende Fahr-Probe — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const dv = driveVerdict(out.drive);
    check(
        "B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Spieler sitzt darauf · Instanz-Matrix + Blocker ziehen mit · Snapshot traegt es",
        dv.length === 0,
        out.driveErr ||
            (out.drive
                ? `kind=${out.drive.visualKind} dist=${(out.drive.dist || 0).toFixed(2)}m vis=${out.drive.visDX}${dv.length ? " fehlt:" + dv.join(",") : ""}`
                : "keine Probe")
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DAS LAB-FAHRPROFIL FÜHRT (N6/H7): EINE Formel (exportDrive aus carPhys+FAHR+Federrate, dieselben Primitive wie die Probefahrt), die Bruecke rechnet sie beim Buch-Bau (kein Duplikat), _vehicleProfile faehrt die Lab-Werte, ohne Buch bleibt die Emergenz byte-gleich — der Bewegungs-Loop ist EIN Pfad."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Vehicle-Drive-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
