// diag-vehicle-drive.cjs — DAS LAB-FAHRPROFIL FÜHRT: die drive-Reise Lab-Formel → Buch → Host-Profil, ohne zweiten
// Wahrheits-Satz und ohne zweiten Fahr-Pfad; A statisch und numerisch (Node), B im lebenden Draht (Browser, Foundry an,
// Null-Renderer). Jede Zeile trägt ihr Soll im Namen ihres Checks, der Selbst-Test je Verdikt einen Täter.
//   node scripts/diag-vehicle-drive.cjs [--selftest]
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde, studioKern } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

const server = statikServer();

const { errs, check } = pruefer();

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
    if (!d || !Number.isFinite(d.blockerMax) || d.blockerMax > 8) out.push("blocker");
    if (!d || d.riderSkip !== true) out.push("riderSkip"); // nie gegen den eigenen Reiter
    if (!d || d.flatFoundry !== true || d.flatBauplan !== true) out.push("flat"); // die EINE Flat-Quelle der Instanz
    if (!d || !(d.snapDist > 1)) out.push("persist"); // der Snapshot traegt die Fahrt
    // DONOR-ABSCHIED: Sitz == exportDrive.sitz-Formel UND != Wagen-Donor-
    // Anker; Blocker-Huelle == exportDrive.huelle-Laenge (> 3 m — die 2.1-m-Donor-
    // Box KANN das nicht liefern). Beide beweisen KONSUM des Kerns + ABSENZ des Donors.
    if (!d || d.sitzKern !== true) out.push("sitzKern");
    if (!d || d.huelleKern !== true) out.push("huelleKern");
    return out;
}

// ── B-e (W5) — DAS FAHR-GEFÜHL-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test), je Täter des Welt-Ritts eine Zahl:
//   achse ≤ 10° der Wagen fährt in seine Bug-Richtung · kontakt ≤ 0,12 m die Räder stehen auf dem Boden · lenk ≤ 1,8 g
//   die Quer-Kinematik v·ω bleibt in der Reifen-Grenze · schwimm ≤ 40° im vollen Einschlag läuft er nicht quer.
const FAHR_GEFUEHL = { achseGrad: 10, kontaktM: 0.12, lenkSpitzeG: 1.8, schwimmGrad: 40 };
function fahrGefuehlVerdict(g) {
    const out = [];
    if (!g || g.spawned !== true) return ["spawn"];
    if (!(g.achseGrad <= FAHR_GEFUEHL.achseGrad)) out.push(`achse ${(g.achseGrad || 0).toFixed(1)}°`);
    if (!(g.kontaktM <= FAHR_GEFUEHL.kontaktM)) out.push(`kontakt ${(g.kontaktM || 0).toFixed(3)} m`);
    if (!(g.lenkSpitzeG <= FAHR_GEFUEHL.lenkSpitzeG)) out.push(`lenk ${(g.lenkSpitzeG || 0).toFixed(2)} g`);
    if (!(g.schwimmGrad <= FAHR_GEFUEHL.schwimmGrad)) out.push(`schwimm ${(g.schwimmGrad || 0).toFixed(1)}°`);
    return out;
}

// ── B-f (W5) — DAS STAND-VERDIKT: ein geparkter Wagen steht auf der Ebene seiner vier Räder (`_fahrzeugStand`), gemessen
// an der GERENDERTEN Matrix (`_archEntryWorldMatrix`) gegen das Boden-Gesetz: spalt ≤ 0,12 m (der größte |Rad-Spalt|
// über alle Hang-Proben), proben ≥ 4 (längs UND quer geparkt, sonst leer).
const STAND = { spaltM: 0.12, probenMin: 4 };
function standVerdict(s) {
    const out = [];
    if (!s || !(s.proben >= STAND.probenMin)) return [`proben ${(s && s.proben) || 0}`];
    if (!(s.spaltM <= STAND.spaltM)) out.push(`spalt ${(s.spaltM || 0).toFixed(3)} m`);
    return out;
}

// ── Kern in Node laden (die diag-vehicle-contract-Klasse: r128-UMD + require) ──
const VC = studioKern("vehicle-core.js", "__vehicleCore");
function expectedFor(presetId) {
    const p = VC.PRESETS[presetId];
    return VC.exportDrive(Object.assign({}, p.s, p.fx));
}

// ===== TEIL A: die statischen Absenzen (Node, kommentarfrei) — die Präsenzen (Kern-Export, Brücke, Steckplatz, die Bindung
// des Ritts an den Chokepoint, Kern-Sitz und Kern-Hülle) beweisen A2/A3 und der lebende Draht B-a … B-d =====
// Jede Absenz über den EINEN Helfer (stammLib.fehlt, der Täter beim Namen); `garage` wandelt die Shell (Selbsttest-Vor-Stand).
function staticLaws(garage) {
    const out = [];
    const fehlt = (name, ...a) => out.push([name, stammLib.fehlt(...a), stammLib.fehlt.wo]);
    fehlt(
        "A1: die Shell trägt kein eigenes FAHR-Literal und kein eigenes carPhys (sie liest VC.FAHR)",
        null,
        /maxSteer\s*:|function\s+carPhys/,
        { datei: "worlds/garage/garage.js", wandel: garage }
    );
    fehlt("A4: die Brücke kennt kein Namensraum-Literal self.__vehicleCore", null, /self\.__vehicleCore/, { datei: "foundry-bruecke.js" });
    // N6.4 — EIN Bewegungs-Pfad: die ride-Skalare liest NUR der Bewegungs-Schritt (_loopPlayerMovement).
    fehlt(
        "A5/N6.4: EIN Bewegungs-Pfad (ride.topSpeedMul/kAcc/kBrake nur in _loopPlayerMovement)",
        { ausser: "_loopPlayerMovement" },
        /\bride\.(?:topSpeedMul|kAcc|kBrake)\b/
    );
    return out;
}

hauptLauf(async () => {
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
        const brokenShell = (t) =>
            t.replace(
                /const FAHR\s*=\s*VC\.FAHR[^\n]*/,
                "const FAHR={maxSteer:0.52,brakeDecel:14,rollDecel:1.0,handDecel:9,G:9.8,CA_F:5.0,CA_R:5.6,maxGrip:1.0,izzK:1.4};"
            );
        const a1 = staticLaws(brokenShell).filter((l) => l[0].startsWith("A1"));
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
            blockerMax: 2.1,
            riderSkip: true,
            flatFoundry: true,
            flatBauplan: true,
            snapDist: 14.4,
            sitzKern: true,
            huelleKern: true,
        };
        check("Selbst-Test 4 (B2): gesunde Fahr-Probe == 0 Verstoesse", driveVerdict(healthy).length === 0);
        // V5 (DONOR-ABSCHIED): der Rueckfall auf Donor-Sitz/Donor-Huelle MUSS feuern.
        check(
            "Selbst-Test 8 (DONOR): Donor-Sitz/Donor-Huelle → die Abschieds-Linse feuert",
            driveVerdict(Object.assign({}, healthy, { sitzKern: false })).length >= 1 &&
                driveVerdict(Object.assign({}, healthy, { huelleKern: false })).length >= 1
        );
        check(
            "Selbst-Test 5 (B2): ‚der Eintrag bleibt stehen' → die Fahr-Linse feuert",
            driveVerdict(Object.assign({}, healthy, { dist: 0.0, snapDist: 0.0 })).length >= 1
        );
        // V6 (B-e, W5): das FAHR-GEFÜHL-Verdikt feuert auf jeden der vier gemessenen Täter des Vor-Stands.
        const gesund = { spawned: true, achseGrad: 2.1, kontaktM: 0.03, lenkSpitzeG: 1.45, schwimmGrad: 6 };
        check("Selbst-Test 9 (B-e): gesunde Fahrt == 0 Verstoesse", fahrGefuehlVerdict(gesund).length === 0);
        for (const [name, bruch] of [
            ["der Wagen faehrt quer (90°)", { achseGrad: 90 }],
            ["die Raeder 0,48 m im Boden", { kontaktM: 0.48 }],
            ["der Wagen dreht sich auf (4,2 rad/s · 8 m/s)", { lenkSpitzeG: 3.4 }],
            ["der Wagen laeuft im Einschlag quer (Schwimmwinkel 70°)", { schwimmGrad: 70 }],
        ])
            check(
                `Selbst-Test 10 (B-e): ‚${name}' → die Fahr-Gefühl-Linse feuert`,
                fahrGefuehlVerdict(Object.assign({}, gesund, bruch)).length === 1
            );
        // V7 (B-f, W5): das STAND-Verdikt feuert auf den waagrecht geparkten Wagen und auf eine leere Probe.
        check("Selbst-Test 11 (B-f): gesunder Stand == 0 Verstoesse", standVerdict({ proben: 6, spaltM: 0.05 }).length === 0);
        check(
            "Selbst-Test 12 (B-f): ‚der Wagen parkt waagrecht am Hang (Rad 0,49 m frei)' → die Stand-Linse feuert",
            standVerdict({ proben: 6, spaltM: 0.49 }).length === 1
        );
        check(
            "Selbst-Test 13 (B-f): ‚keine Hang-Probe gefunden' → die Stand-Linse feuert",
            standVerdict({ proben: 0, spaltM: 0 }).length === 1
        );
        selbsttestEnde(errs, "die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== N6/H7 — TEIL A: Formel + Paritaet + ein Pfad (Node) ===");
    for (const [name, ok, detail] of staticLaws()) check(name, ok, detail);

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
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 180000 });
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // die Orte aus der Welt (`__weltOrte`, scripts/lib/welt-orte.cjs)
    await server.zeige(page, 30000);

    // B-e fährt an der MESS-WIESE (spec/profiband/haushalt.json, Messort `wiese`) — der Spawn liegt im Gebirge (Stufen
    // bis 24 m).
    const messort = require("./lib/band-urteil.cjs").ladeSpec("wiese").ort.spieler;
    const nodeExpected = { gt: gtExp, supersport: ssExp, messort };
    const out = await page.evaluate(async (expected) => {
        const res = { book: {}, prof: {}, emerg: {} };
        await window.__weltDa();
        const st = r.state;
        const f = r._ensureAssetFoundry();
        // Buch + Auto-Blueprint abwarten (das fahrprofil reist im selben get-recipes-Reply).
        await window.__weltDa(() => f &&
                f.ready &&
                f.recipes &&
                f.recipes.gt &&
                f.recipes.gt.fx &&
                f.recipes.gt.fx.fahrprofil &&
                st.blueprints &&
                st.blueprints.fahrzeug_gt);
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
                ? { topSpeedMul: pGt.topSpeedMul, kAcc: pGt.kAcc, kBrake: pGt.kBrake }
                : null;
            // AUSLÖSCHUNGS-WELLE: der Alt-Blueprint fahrzeug_wagen ist gefallen — die
            // EMERGENZ wird an einem Test-Blueprint aus der Substanz-Tabelle bewiesen
            // (parts+connections JSON-geklont, registriert, danach aufgeraeumt).
            const KS = AnazhRealm.KIND_SUBSTANCE || {};
            const sub = KS.fahrzeug_wagen;
            res.prof.wagenAbsent = !(st.blueprints && st.blueprints.fahrzeug_wagen);
            res.prof.substanzParts = sub && Array.isArray(sub.parts) ? sub.parts.length : 0;
            delete st.blueprints._drive_probe_wagen;
            st.blueprints._drive_probe_wagen = {
                name: "_drive_probe_wagen",
                parts: JSON.parse(JSON.stringify(sub.parts)),
                connections: JSON.parse(JSON.stringify(sub.connections || [])),
            };
            const pWg = r._vehicleProfile({ type: "_drive_probe_wagen" });
            res.prof.wagen = pWg
                ? { topSpeedMul: pWg.topSpeedMul, kAcc: pWg.kAcc, kBrake: pWg.kBrake }
                : null;
            // fahrzeug_wagen loest auf KEIN Buch-Preset ("wagen" steht in keinem Buch -> null,
            // der dokumentierte Substanz-Pfad) — die 0-Regress-Praemisse: kein Override moeglich.
            res.prof.wagenPreset = r._foundryPresetFor("fahrzeug_wagen");
            res.prof.wagenHasRecipe = !!(f.recipes && res.prof.wagenPreset && f.recipes[res.prof.wagenPreset]);
            // Die EMERGENTE Formel NACHGERECHNET (byte-gleich zur _vehicleProfile-Emergenz):
            const bp = st.blueprints._drive_probe_wagen;
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
            delete st.blueprints._drive_probe_wagen; // Aufraeumen (die Probe hinterlaesst nichts)
        } catch (e) {
            res.profErr = (e && e.message) || String(e);
        }
        // ===== B-d: DIE FAHR-PROBE — nach N Fahr-Ticks bewegt sich der EINTRAG =====
        try {
            const pm = st.playerMesh.position;
            const spawnAt = { x: pm.x + 5, y: pm.y, z: pm.z };
            const entry = r.spawnArchitecture("fahrzeug_gt", spawnAt, { silent: true, precise: true });
            res.drive = { spawned: !!entry };
            if (entry) {
                // Studio-Gestalt andocken lassen (der Bau ist async: Flat-Miss → Anfrage → Bau).
                await window.__gebautNach(entry);
                res.drive.visualKind = entry.instanced ? "instanced" : entry.mesh ? "mesh" : "kalt";
                // KONSUM: die Instanz zieht über die EINE Flat-Quelle mit — die Foundry-Gestalt, ohne Foundry der Bauplan
                const ruft = (k) => {
                    const f0 = r[k];
                    let n = 0;
                    r[k] = (...a) => (n++, f0.apply(r, a));
                    try {
                        r._archInstanceUpdate(entry);
                    } finally {
                        delete r[k];
                    }
                    return n > 0;
                };
                const instF = entry.instFoundry;
                res.drive.flatFoundry = !!entry.instanced && ruft("_foundryFlattenFor");
                entry.instFoundry = false;
                res.drive.flatBauplan = !!entry.instanced && ruft("_archFlattenBlueprint");
                entry.instFoundry = instF;
                r._archInstanceUpdate(entry);
                const m0 = { x: entry.position.x, z: entry.position.z };
                const mres = r.mountArchitecture(entry);
                res.drive.mounted = !!(mres && mres.ok) && st.player.mountedArch === entry.id;
                // DONOR-ABSCHIED — der lebende KONSUM/ABSENZ-Beweis am
                // frisch gespawnten Eintrag (Gier 0 — die Welt-AABB-Spanne ist die
                // Laengs-Achse): Sitz == Kern-Formel UND != Donor-Anker; Blocker-
                // Spanne == Kern-Huellen-Laenge (> 3 m — Donor-Box war 2.1 m).
                try {
                    const fzg = r._fahrzeugGesetzFor(entry);
                    const drv = fzg && fzg.drive;
                    const hip = AnazhRealm.SITZ_HIP_OFFSET;
                    const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
                    const kernSitz =
                        drv && drv.sitz && Number.isFinite(drv.sitz.y)
                            ? Math.max(0.45, drv.sitz.y * sc + hip)
                            : null;
                    const donorSp = r._attachPointFor(st.blueprints.fahrzeug_gt, "sitz").point;
                    const donorSitz = Number.isFinite(donorSp.y) ? Math.max(0.45, donorSp.y * sc + hip) : null;
                    res.drive.sitzKern =
                        kernSitz !== null &&
                        Math.abs(entry._sitzHeight - kernSitz) < 1e-9 &&
                        (donorSitz === null || Math.abs(entry._sitzHeight - donorSitz) > 0.01);
                    if (entry.blockerAABBs && entry.blockerAABBs.length && drv && drv.huelle) {
                        let mnX = Infinity;
                        let mxX = -Infinity;
                        let mnZ = Infinity;
                        let mxZ = -Infinity;
                        for (const b of entry.blockerAABBs) {
                            mnX = Math.min(mnX, b.minX);
                            mxX = Math.max(mxX, b.maxX);
                            mnZ = Math.min(mnZ, b.minZ);
                            mxZ = Math.max(mxZ, b.maxZ);
                        }
                        const span = Math.max(mxX - mnX, mxZ - mnZ);
                        const soll = (drv.huelle.noseX - drv.huelle.tailX) * sc;
                        res.drive.blockerSpan = span;
                        res.drive.huelleSoll = soll;
                        res.drive.huelleKern = span > 3 && Math.abs(span - soll) < 0.05;
                    }
                } catch (eD) {
                    res.drive.donorErr = (eD && eD.message) || String(eD);
                }
                // N Fahr-Ticks: der REITER ist die horizontale Autoritaet — pm faehrt,
                // playerVel traegt die Fahrt-Richtung (Gier-/Phasen-Quelle des Chokepoints).
                if (st.playerVel) st.playerVel.setValue(2.4, 0, 0);
                for (let i = 0; i < 120; i++) {
                    pm.x += 0.12;
                    r._tickMountedMovement(0.05);
                }
                res.drive.dist = Math.hypot(entry.position.x - m0.x, entry.position.z - m0.z);
                // Der Sitz misst von der BASIS (position.y − 0.5 — die Platzierungs-Konvention der Instanz-Matrix).
                res.drive.seated =
                    st.player.mountedArch === entry.id &&
                    Number.isFinite(entry._sitzHeight) &&
                    Math.abs(pm.y - (entry.position.y - 0.5 + entry._sitzHeight)) < 0.06;
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
                // der Reiter stößt nie an sein eigenes Gefährt: mit und ohne dessen Boxen dasselbe, ungeritten wirkt es
                const fy = entry.position.y;
                const kapsel = () => {
                    const p = { x: entry.position.x, z: entry.position.z };
                    return [p.x, p.z, r._stepCharacterStructures(p, fy, fy + 1.7, 0.35, null, null)].join();
                };
                const mit = kapsel();
                const bx = entry.blockerAABBs;
                entry.blockerAABBs = null;
                const ohne = kapsel();
                entry.blockerAABBs = bx;
                st.player.mountedArch = null;
                const fremd = kapsel();
                st.player.mountedArch = entry.id;
                res.drive.riderSkip = mit === ohne && fremd !== mit;
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
                if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                st._fieldVy = 0;
            }
        } catch (e) {
            res.driveErr = (e && e.message) || String(e);
        }
        // ===== B-e (W5 Gegenstände): DAS FAHR-GEFÜHL IM ECHTEN BEWEGUNGS-PFAD =====
        // Der GT fährt durch den echten Sim-Schritt `_stepFixedSim` (Kapsel · Bewegung · Ritt-Sitz, 60 Hz) + den Frame-Tick:
        // 90 Ticks Gas geradeaus, dann 120 Ticks voller Lenk-Einschlag. Gemessen an der GERENDERTEN Matrix
        // (`_archEntryWorldMatrix`) und am Gesetz (exportDrive.huelle):
        //   achse  — der Winkel zwischen der Bug-Achse des Templates (+x) und der Fahrt (Grad, Geradeaus-Ticks v > 3)
        //   kontakt — die vier Aufstandspunkte (fAx/rAx × ±Spur/2, y = 0) gegen den Boden (m, |max| über alle Ticks)
        //   lenk   — Spitze der Quer-Kinematik v·ω (in g) und der Tempo-Rest nach 2 s Einschlag (Anteil)
        try {
            const pm = st.playerMesh.position;
            const keys = st.keys;
            // Die Strecke (ein Fels im Weg wäre kein Boden-Befund, und der GT
            // schwimmt: über Wasser trägt die Lauf-Fläche): je Kandidat um die Mess-Wiese Proben alle 2 m auf 72 m in
            // Fahrt-Richtung (+x: Template-Gier 0 = Bug +x) und ±3 m daneben — trocken; unter den trockenen die mit
            // der kleinsten Stufe (die Welt ist hügelig: 30 % Steigung findet sich auf jeder 72-m-Geraden).
            const start = window.__strecke(expected.messort, 4);
            res.gefuehl = { spawned: false, start };
            if (!start) throw new Error("keine trockene Strecke um die Mess-Wiese");
            pm.set(start.x, r.getTerrainHeightAt(start.x, start.z) + 1, start.z);
            const e2 = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: start.x, y: r.getTerrainHeightAt(start.x, start.z) + 0.5, z: start.z },
                { silent: true, precise: true, rotationY: 0 }
            );
            res.gefuehl.spawned = !!e2;
            if (e2) {
                await window.__gebautNach(e2);
                r.mountArchitecture(e2);
                const fzg = r._fahrzeugGesetzFor(e2);
                const h = fzg.drive.huelle;
                const G = fzg.drive.zweispur.G * fzg.drive.zweispur.maxGrip * fzg.drive.zweispur.grip;
                const M = new THREE.Matrix4();
                const v3 = new THREE.Vector3();
                const dt = 1 / 60;
                let t = 1000;
                let achse = 0;
                let kontakt = 0;
                const spalte = [];
                let schwimm = 0;
                let lenkSpitze = 0;
                let vStart = null;
                let vEnde = 0;
                const tick = (lenk) => {
                    t += dt;
                    // der ECHTE Sim-Schritt (Kapsel + Bewegung + Ritt-Sitz), dann der Frame-Tick (Sicht)
                    // — vorher integrierte die Probe pm += v·dt an Akkumulator, Kollision und Sitz vorbei.
                    r._stepFixedSim(t, dt);
                    const v = st.playerVel;
                    r._tickMountedMovement(dt);
                    r._archEntryWorldMatrix(e2, M);
                    const sp = Math.hypot(v.x(), v.z());
                    let spaltTick = 0;
                    for (const ax of [h.fAx, h.rAx])
                        for (const sz of [-1, 1]) {
                            v3.set(ax, 0, (sz * h.spur) / 2).applyMatrix4(M);
                            const spalt = Math.abs(v3.y - r.getTerrainHeightAt(v3.x, v3.z));
                            spaltTick = Math.max(spaltTick, spalt);
                            if (spalt > kontakt) {
                                kontakt = spalt;
                                // der Tick des größten Spalts beim Namen (Phase · schwimmend · Nick/Wank)
                                res.gefuehl.kontaktBei = {
                                    tick: Math.round((t - 1000) / dt),
                                    lenk,
                                    schwimmt: !!e2._afloat,
                                    nick: +(e2._rideTerrainPitch || 0).toFixed(3),
                                    wank: +(e2._rideRoll || 0).toFixed(3),
                                    weg: +Math.hypot(pm.x - start.x, pm.z - start.z).toFixed(1),
                                    boden: [-4, 0, 4].map((d) => +r.getTerrainHeightAt(pm.x + d, pm.z).toFixed(2)),
                                };
                            }
                        }
                    spalte.push(spaltTick);
                    // Der Winkel zwischen Bug-Achse und Fahrt: geradeaus die ACHSE, im Einschlag der SCHWIMMWINKEL
                    // (ein haftender Wagen bleibt unter 10°, ein aufdrehender läuft quer).
                    let winkel = null;
                    if (sp > 3) {
                        v3.set(1, 0, 0).transformDirection(M);
                        const c = (v3.x * v.x() + v3.z * v.z()) / Math.max(1e-6, Math.hypot(v3.x, v3.z) * sp);
                        winkel = (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
                    }
                    if (!lenk && winkel !== null) achse = Math.max(achse, winkel);
                    if (lenk) {
                        if (vStart === null) vStart = sp;
                        const f = e2._fahr || {};
                        lenkSpitze = Math.max(lenkSpitze, Math.abs((f.yawRate || 0) * sp) / G);
                        if (winkel !== null) schwimm = Math.max(schwimm, winkel);
                        vEnde = sp;
                    }
                };
                for (const k of ["w", "a", "s", "d", "shift"]) keys[k] = false;
                keys.w = true;
                for (let i = 0; i < 150; i++) tick(false);
                keys.a = true;
                for (let i = 0; i < 120; i++) tick(true);
                for (const k of ["w", "a", "s", "d", "shift"]) keys[k] = false;
                res.gefuehl.schwamm = !!e2._afloat;
                res.gefuehl.achseGrad = achse;
                // Der Kontakt ist das 75-%-Quantil des größten Rad-Spalts je Tick — ein starrer Wagen auf einer
                // 2-m-Stufe des Hügels hebt kurz ein Rad (das Maximum reist als Befund mit), das Versinken der alten
                // Basis (0,48 m) und das Schweben aus max() + Nick lagen auf JEDEM Tick.
                spalte.sort((a, b) => a - b);
                res.gefuehl.kontaktM = spalte.length ? spalte[Math.floor(spalte.length * 0.75)] : Infinity;
                res.gefuehl.kontaktMax = kontakt;
                res.gefuehl.lenkSpitzeG = lenkSpitze;
                res.gefuehl.schwimmGrad = schwimm;
                res.gefuehl.tempoRest = vStart > 0 ? vEnde / vStart : 0;
                res.gefuehl.vStart = vStart;
                r.dismountArchitecture();
                r.removeArchitecture(e2);
                if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                st._fieldVy = 0;
            }
        } catch (e) {
            res.gefuehlErr = (e && e.message) || String(e);
        }
        // ===== B-f (W5 Gegenstände): DER STAND AM HANG =====
        // Je Hang-Probe (Steigung 12–35 % über ±2 m, trocken) parkt der GT längs und quer zum Hang (der Spawn-Pfad wie
        // Hotbar/DSL: Basis auf dem Boden unter dem Ursprung); gemessen werden die vier Aufstandspunkte der GERENDERTEN
        // Matrix gegen das Boden-Gesetz. Die Hänge kommen aus der Welt (welt-orte `hang`, K55-5 — bis dahin ±40 m um die
        // Mess-Wiese: die Wiese ist nach ihrem Gesetz flach, `hangMax` 5°, und fand in der Aue 1 Hang statt 6).
        try {
            const M = new THREE.Matrix4();
            const v3 = new THREE.Vector3();
            const grad = (t) => (Math.atan(t) * 180) / Math.PI;
            const hang = window
                .__weltOrte("hang", { min: grad(0.12), max: grad(0.35), basis: 2, anzahl: 6, abstand: 24, rMax: 800 })
                .map((o, i) => ({
                    x: o.x,
                    z: o.z,
                    g: Math.tan((o.neigung * Math.PI) / 180),
                    rot: i % 2 ? Math.PI / 2 : 0,
                }));
            let spaltM = 0;
            const je = [];
            for (const p of hang) {
                const e3 = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: p.x, y: r.getTerrainHeightAt(p.x, p.z) + 0.5, z: p.z },
                    { silent: true, precise: true, rotationY: p.rot, seed: 11 }
                );
                if (!e3) continue;
                const h = r._fahrzeugGesetzFor(e3).drive.huelle;
                r._archEntryWorldMatrix(e3, M);
                let maxS = 0;
                for (const ax of [h.fAx, h.rAx])
                    for (const sz of [-1, 1]) {
                        v3.set(ax, 0, (sz * h.spur) / 2).applyMatrix4(M);
                        maxS = Math.max(maxS, Math.abs(v3.y - r.getTerrainHeightAt(v3.x, v3.z)));
                    }
                spaltM = Math.max(spaltM, maxS);
                je.push(+maxS.toFixed(3));
                r.removeArchitecture(e3);
            }
            res.stand = { proben: je.length, spaltM, je, steigung: hang.map((p) => +p.g.toFixed(2)) };
        } catch (e) {
            res.standErr = (e && e.message) || String(e);
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
    // B-d (B2): die stehende Fahr-Probe — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const dv = driveVerdict(out.drive);
    check(
        "B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Spieler sitzt darauf · Blocker ziehen mit · Snapshot traegt es",
        dv.length === 0,
        out.driveErr ||
            (out.drive
                ? `kind=${out.drive.visualKind} dist=${(out.drive.dist || 0).toFixed(2)}m${dv.length ? " fehlt:" + dv.join(",") : ""}`
                : "keine Probe")
    );
    // B-e (W5): das Fahr-Gefühl im echten Bewegungs-Pfad — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const gv = fahrGefuehlVerdict(out.gefuehl);
    const g = out.gefuehl || {};
    check(
        "B-e/W5: FAHR-GEFÜHL — der GT fährt in seine Bug-Richtung, die Räder stehen auf dem Boden, der volle Einschlag bleibt in der Reifen-Grenze",
        gv.length === 0,
        out.gefuehlErr ||
            `achse ${(g.achseGrad || 0).toFixed(1)}° · kontakt ${(g.kontaktM || 0).toFixed(3)} m (p75, max ${(g.kontaktMax || 0).toFixed(2)}) · lenk ${(g.lenkSpitzeG || 0).toFixed(2)} g · schwimm ${(g.schwimmGrad || 0).toFixed(1)}° · tempo ${((g.tempoRest || 0) * 100).toFixed(0)} % von ${(g.vStart || 0).toFixed(1)} m/s${gv.length ? " — Täter: " + gv.join(", ") + " · größter Spalt " + JSON.stringify(g.kontaktBei || null) : ""}`
    );
    // B-f (W5): der Stand am Hang — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const sv = standVerdict(out.stand);
    const st = out.stand || {};
    check(
        "B-f/W5: STAND — ein geparkter GT steht am Hang auf seinen vier Rädern (längs und quer)",
        sv.length === 0,
        out.standErr ||
            `größter Rad-Spalt ${(st.spaltM || 0).toFixed(3)} m über ${st.proben || 0} Hang-Proben (Steigung ${JSON.stringify(st.steigung || [])}, je ${JSON.stringify(st.je || [])})${sv.length ? " — Täter: " + sv.join(", ") : ""}`
    );

    wandEnde(errs, "DAS LAB-FAHRPROFIL FÜHRT (N6/H7): EINE Formel (exportDrive aus carPhys+FAHR+Federrate, dieselben Primitive wie die Probefahrt), die Bruecke rechnet sie beim Buch-Bau (kein Duplikat), _vehicleProfile faehrt die Lab-Werte, ohne Buch bleibt die Emergenz byte-gleich — der Bewegungs-Loop ist EIN Pfad.");
});
