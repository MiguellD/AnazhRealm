// diag-vehicle-drive.cjs — DAS LAB-FAHRPROFIL FÜHRT: die drive-Reise Lab-Formel → Buch → Host-Profil, ohne zweiten
// Wahrheits-Satz und ohne zweiten Fahr-Pfad; A statisch und numerisch (Node), B im lebenden Draht (Browser, Foundry an,
// Null-Renderer). Jede Zeile trägt ihr Soll im Namen ihres Checks, der Selbst-Test je Verdikt einen Täter.
// Gefallen in w12-fahrzeug-decke (Zwillinge, die Messung lebt weiter): A1 (kein FAHR-Literal, kein carPhys in der Shell) steht
// in der Rückkehr-Wand gate:altlasten · A3 und B-b/H7 (GT ≠ Supersport) richtet gate:garage-labor G9 an der Fahrt: jede Gattung
// ihr Tempo · B-c die Emergenz war ein Literal-Zwilling von FAHR.hostEmergent, das Profil aus der Substanz misst der Playtest
// (gelaende-boden V18150Ride), die Absenz des Alt-Wagens der Playtest (werkstatt Rezept-Katalog c) · B-e das Fahr-Gefühl:
// Achse, v·ω und Schwimmwinkel am Kern gate:fahr-leben K9 (die Welt fährt ihn, S1 Labor = Welt; das Bild folgt der Gier,
// V18150Ride), der Rad-Kontakt Station R (p75 ≤ 0,03 m statt 0,12).
//   node scripts/diag-vehicle-drive.cjs [--selftest]
const {
    statikServer,
    hauptLauf,
    nullWelt,
    pruefer,
    wandEnde,
    selbsttestEnde,
    studioKern,
    fehlerText,
    SELBSTTEST,
    stammLib,
} = require("./lib/welt-boot.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

const server = statikServer();

const { errs, check } = pruefer();

// ── DIE DIVERGENZ-LINSE: welche drive-Skalare weichen vom Soll ab? (===, byte) ──
const DRIVE_KEYS = ["topSpeedMul", "kAcc", "kBrake", "mass", "vmax"];
function driveDiverges(fp, expected) {
    const out = [];
    for (const k of DRIVE_KEYS) if (!fp || !Number.isFinite(fp[k]) || fp[k] !== expected[k]) out.push(k);
    if (!fp || !fp.spring || fp.spring.k !== expected.spring.k || fp.spring.c !== expected.spring.c) out.push("spring");
    return out;
}

// ── B2 — DAS FAHR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test lesen sie —
// die Linse ist beweisbar nicht-vakuoes). Rueckgabe: Liste der Verstoesse (leer = gruen).
function driveVerdict(d) {
    const out = [];
    if (!d || d.spawned !== true) out.push("spawn");
    if (!d || d.mounted !== true) out.push("mount");
    if (!d || !(d.dist > 1)) out.push("dist<=1m"); // die stehende Probe: > 1 m nach N Fahr-Ticks
    // der Reiter auf dem Sitz (jeder Sim-Schritt, ±0,05 m: gate:fahr-leben `inDerLuft`) und nie gegen sein eigenes Gefährt (der
    // riddenId-Skip: Playtest V18150Ride `collisionRests`) — beide standen hier bis w12-fahrzeug-decke ein zweites Mal
    if (!d || !Number.isFinite(d.blockerMax) || d.blockerMax > 8) out.push("blocker");
    if (!d || d.flatFoundry !== true || d.flatBauplan !== true) out.push("flat"); // die EINE Flat-Quelle der Instanz
    if (!d || !(d.snapDist > 1)) out.push("persist"); // der Snapshot traegt die Fahrt
    // DONOR-ABSCHIED: Sitz == exportDrive.sitz-Formel UND != Wagen-Donor-
    // Anker; Blocker-Huelle == exportDrive.huelle-Laenge (> 3 m — die 2.1-m-Donor-
    // Box KANN das nicht liefern). Beide beweisen KONSUM des Kerns + ABSENZ des Donors.
    if (!d || d.sitzKern !== true) out.push("sitzKern");
    if (!d || d.huelleKern !== true) out.push("huelleKern");
    return out;
}

// ── B-f (W5) — DAS STAND-VERDIKT: ein geparkter Wagen steht auf der Ebene seiner vier Räder (`_fahrzeugStand`), gemessen
// an der GERENDERTEN Matrix (`_archEntryWorldMatrix`) gegen das Boden-Gesetz: spalt ≤ 0,12 m (der größte |Rad-Spalt|
// über alle Hang-Proben), proben ≥ 4 (längs UND quer geparkt, sonst leer).
const STAND = { spaltM: 0.12, probenMin: 4 };
function standVerdict(s) {
    const out = [];
    if (!s || !(s.proben >= STAND.probenMin)) return [`proben ${(s?.proben) || 0}`];
    if (!(s.spaltM <= STAND.spaltM)) out.push(`spalt ${(s.spaltM || 0).toFixed(3)} m`);
    return out;
}

// ── A6 DIE REIBELLIPSE (fahrzeug.K1, w28-reibellipse): EIN μ·N-Budget je Achse, am Kern je Rezept. Im Bogen (20 m/s, Einschlag
// 0,25, 1,5 s ohne Gas) voll gebremst tragen die Reifen höchstens μ·g (Rollwiderstand und Schleppmoment liegen außerhalb des
// Reifens: abgezogen) — vorher 1,36–1,44 μ·g: die Seitenkraft griff voll neben dem vollen Längs-Deckel. Geradeaus 25 → 0 m/s
// bremst er wie vorher: der Weg am Mitschnitt vor dem Schnitt (main b1531071) ±1 %.
const ELLIPSE = { bogen: 1.02, weg: 0.01 };
const ELLIPSE_WEG_VORHER = { gt: 28.73, supersport: 33.29, limousine: 28.73, kompakt_fwd: 28.73, suv: 28.73 };
function ellipseMessung(VC) {
    const dt = 1 / 60;
    const m = {};
    for (const pid of Object.keys(VC.PRESETS)) {
        const G = VC.fahrGesetz(VC.exportDrive({ ...VC.DEFAULT_P, ...VC.presetPatch(pid) }));
        const mug = G.maxGrip * G.grip * G.g;
        let z = Object.assign(VC.fahrZustand(0, 0, 0), { vlong: 20 });
        for (let i = 0; i < 90; i++) VC.fahrKraefte(z, { steer: 0.25 }, G, dt);
        let bogen = 0;
        for (let i = 0; i < 60 && z.vlong > 3; i++) {
            VC.fahrKraefte(z, { steer: 0.25, brake: 1 }, G, dt);
            bogen = Math.max(bogen, Math.hypot(z.aLong + G.reibung + G.schlepp, z.aLat) / mug);
        }
        z = Object.assign(VC.fahrZustand(0, 0, 0), { vlong: 25 });
        for (let n = 0; z.vlong > 0.05 && n < 2000; n++) VC.fahrKraefte(z, { brake: 1 }, G, dt);
        m[pid] = { bogen: Math.round(bogen * 1000) / 1000, weg: Math.round(Math.hypot(z.x, z.z) * 100) / 100 };
    }
    return m;
}
function ellipseVerdict(m) {
    const out = [];
    for (const [pid, w] of Object.entries(ELLIPSE_WEG_VORHER)) {
        const e = m && m[pid];
        if (!e) out.push(`${pid} fehlt`);
        else if (!(e.bogen <= ELLIPSE.bogen)) out.push(`${pid} bogen ${e.bogen} μ·g`);
        else if (!(Math.abs(e.weg / w - 1) <= ELLIPSE.weg)) out.push(`${pid} weg ${e.weg} m gegen ${w}`);
    }
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
hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: ein verfaelschtes fahrprofil (Kriterium e) → die Divergenz-Linse MUSS feuern.
        const exp = expectedFor("gt");
        check("Selbst-Test 0: unverfaelscht == 0 Divergenzen", driveDiverges(expectedFor("gt"), exp).length === 0);
        const bad1 = Object.assign({}, exp, { topSpeedMul: exp.topSpeedMul * 1.07 });
        check("Selbst-Test 1: verfaelschtes topSpeedMul → Divergenz erkannt", driveDiverges(bad1, exp).length >= 1);
        const bad2 = Object.assign({}, exp, { kBrake: exp.kAcc }); // kBrake auf kAcc gefaelscht (die Formel-Verwechslung)
        check("Selbst-Test 2: verfaelschtes kBrake → Divergenz erkannt", driveDiverges(bad2, exp).length >= 1);
        // V3–V7: jedes Verdikt schweigt am gesunden Stand und nennt je gebrochenem Wert EINEN Täter — die Fahr-Probe (B2: der Eintrag
        // bleibt stehen; DONOR: der Rückfall auf Donor-Sitz/-Hülle) und der STAND (B-f, W5: waagrecht am Hang, Rad 0,49 m frei;
        // keine Probe). Die Shell mit eigenem FAHR-Literal macht der Selbsttest von gate:altlasten rot (ein Token wie jeder).
        const fahrt = {
                spawned: true,
                mounted: true,
                dist: 14.4,
                blockerMax: 2.1,
                flatFoundry: true,
                flatBauplan: true,
                snapDist: 14.4,
                sitzKern: true,
                huelleKern: true,
            },
            stand = { proben: 6, spaltM: 0.05 };
        for (const [V, basis, ...brueche] of [
            [driveVerdict, fahrt, { dist: 0, snapDist: 0 }, { sitzKern: false }, { huelleKern: false }],
            [standVerdict, stand, { spaltM: 0.49 }, { proben: 0 }],
        ])
            for (const b of [{}, ...brueche]) {
                const v = V({ ...basis, ...b });
                check(`Selbst-Test ${V.name} ${JSON.stringify(b)}`, v.length === Object.keys(b).length, v.join(" · "));
            }
        // A6: die Reibellipse am Mitschnitt — gesund schweigt sie, der Bogen von main (GT 1,415 μ·g, die Seitenkraft voll neben
        // dem Längs-Deckel) und ein Bremsweg 3 % länger nennen je ihren Täter
        const ellipse = Object.fromEntries(Object.entries(ELLIPSE_WEG_VORHER).map(([p, w]) => [p, { bogen: 1, weg: w }]));
        for (const [b, n] of [
            [{}, 0],
            [{ gt: { bogen: 1.415, weg: 28.73 } }, 1],
            [{ suv: { bogen: 1, weg: 29.6 } }, 1],
        ]) {
            const v = ellipseVerdict({ ...ellipse, ...b });
            check(`Selbst-Test ellipseVerdict ${JSON.stringify(b)}`, v.length === n, v.join(" · "));
        }
        selbsttestEnde(errs, "die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== N6/H7 — TEIL A: Formel + Paritaet + ein Pfad (Node) ===");
    // Die Absenz über den EINEN Helfer (stammLib.fehlt, der Täter beim Namen). A1 (die Shell ohne FAHR-Literal und carPhys) steht
    // in gate:altlasten; A4 (kein Namensraum-Literal in der Brücke) hält die Verfassung (gate:constitution N2) — EINE Wand, kein
    // Zwilling. N6.4 — EIN Bewegungs-Pfad: die ride-Skalare liest NUR der Bewegungs-Schritt (_loopPlayerMovement).
    check(
        "A5/N6.4: EIN Bewegungs-Pfad (ride.topSpeedMul/kAcc/kBrake nur in _loopPlayerMovement)",
        stammLib.fehlt({ ausser: "_loopPlayerMovement" }, /\bride\.(?:topSpeedMul|kAcc|kBrake)\b/),
        stammLib.fehlt.wo
    );

    const ell = ellipseMessung(VC);
    const ellV = ellipseVerdict(ell);
    check(
        `A6: die Reibellipse — im Bogen voll gebremst ≤ ${ELLIPSE.bogen} μ·g, geradeaus der Bremsweg ±${ELLIPSE.weg * 100} %`,
        ellV.length === 0,
        ellV.join(" · ") || Object.entries(ell).map(([p, e]) => `${p} ${e.bogen} μ·g ${e.weg} m`).join(" · ")
    );

    // A2 (die Hand-Ableitung exportDrive == carPhys-Primitive) fiel in w11-fahrzeug: sie war ein Zwilling der Formel im Skript —
    // die Probefahrt liest exportDrive selbst (Welle L), das Antriebs-Gesetz richtet gate:garage-labor G9 an der Fahrt; dort
    // steht seit w12-fahrzeug-decke auch A3/H7 (jede Gattung ihr eigenes Tempo, vorher: GT ≠ Supersport in zwei Skalaren).
    const gtExp = expectedFor("gt");

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    const { browser, page } = await nullWelt(server, { frist: 180000, vor: WELT_ORTE_INSTALL }); // die Orte aus der Welt (`__weltOrte`, scripts/lib/welt-orte.cjs)

    const out = await page.evaluate(async () => {
        const res = { book: {} };
        await __weltDa();
        const f = r._ensureAssetFoundry();
        // Buch + Auto-Blueprint abwarten (das fahrprofil reist im selben get-recipes-Reply).
        await __weltDa(
            () =>
                f &&
                f.ready &&
                f.recipes &&
                f.recipes.gt &&
                f.recipes.gt.fx &&
                f.recipes.gt.fx.fahrprofil &&
                r.state.blueprints &&
                r.state.blueprints.fahrzeug_gt
        );
        // ===== B-a: das LIVE-Buch je Fahrzeug-Preset =====
        try {
            for (const id in f.recipes) {
                const rec = f.recipes[id];
                if (rec?.kind === "vehicle")
                    res.book[id] = rec.fx && typeof rec.fx.fahrprofil === "object" ? rec.fx.fahrprofil : null;
            }
        } catch (e) {
            res.bookErr = fehlerText(e);
        }
        // ===== B-c: das Host-Profil — Lab fuehrt (fahrzeug_gt). Die Emergenz aus der Substanz misst der Playtest (gelaende-boden
        // V18150Ride; hier stand bis w12-fahrzeug-decke ein Literal-Zwilling der Formel von FAHR.hostEmergent), die Absenz des
        // Alt-Wagens der Playtest werkstatt (Rezept-Katalog c) =====
        try {
            const pGt = r._vehicleProfile({ type: "fahrzeug_gt" });
            res.gt = pGt && { topSpeedMul: pGt.topSpeedMul, kAcc: pGt.kAcc, kBrake: pGt.kBrake };
        } catch (e) {
            res.profErr = fehlerText(e);
        }
        // ===== B-d: DIE FAHR-PROBE — nach N Fahr-Ticks bewegt sich der EINTRAG =====
        try {
            const pm = r.state.playerMesh.position;
            const spawnAt = { x: pm.x + 5, y: pm.y, z: pm.z };
            const entry = r.spawnArchitecture("fahrzeug_gt", spawnAt, { silent: true, precise: true });
            res.drive = { spawned: !!entry };
            if (entry) {
                // Studio-Gestalt andocken lassen (der Bau ist async: Flat-Miss → Anfrage → Bau).
                await __gebautNach(entry);
                res.drive.visualKind = entry.instanced ? "instanced" : entry.mesh ? "mesh" : "kalt";
                // KONSUM: die Instanz zieht über die EINE Flat-Quelle mit — die Foundry-Gestalt, ohne Foundry der Bauplan
                const ruft = (k, n = 0, f0 = r[k]) => {
                    const zurueck = leihe(r, { [k]: (...a) => (n++, f0.apply(r, a)) }); // die EINE Leihe (welt-boot)
                    try {
                        r._archInstanceUpdate(entry);
                    } finally {
                        zurueck();
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
                res.drive.mounted = !!(mres?.ok) && r.state.player.mountedArch === entry.id;
                // DONOR-ABSCHIED — der lebende KONSUM/ABSENZ-Beweis am
                // frisch gespawnten Eintrag (Gier 0 — die Welt-AABB-Spanne ist die
                // Laengs-Achse): Sitz == Kern-Formel UND != Donor-Anker; Blocker-
                // Spanne == Kern-Huellen-Laenge (> 3 m — Donor-Box war 2.1 m).
                try {
                    const fzg = r._fahrzeugGesetzFor(entry);
                    const drv = fzg && fzg.drive;
                    const hip = r.constructor.SITZ_HIP_OFFSET;
                    const sc = Number.isFinite(entry.scale) ? entry.scale : 1;
                    const kernSitz =
                        drv?.sitz && Number.isFinite(drv.sitz.y) ? Math.max(0.45, drv.sitz.y * sc + hip) : null;
                    const donorSp = r._attachPointFor(r.state.blueprints.fahrzeug_gt, "sitz").point;
                    const donorSitz = Number.isFinite(donorSp.y) ? Math.max(0.45, donorSp.y * sc + hip) : null;
                    res.drive.sitzKern =
                        kernSitz !== null &&
                        Math.abs(entry._sitzHeight - kernSitz) < 1e-9 &&
                        (donorSitz === null || Math.abs(entry._sitzHeight - donorSitz) > 0.01);
                    if (entry.blockerAABBs?.length && drv?.huelle) {
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
                        // die Länge der gezeichneten Gestalt (das Maß des Kerns am Bau, physik.K2 Staffel 2), sonst der Kern-Hülle
                        const M = entry._gestaltMass;
                        const L = M ? M.bug - M.heck : drv.huelle.noseX - drv.huelle.tailX;
                        res.drive.huelleKern = span > 3 && Math.abs(span - L * sc) < 0.05;
                    }
                } catch (eD) {
                    res.drive.donorErr = fehlerText(eD);
                }
                // N Fahr-Ticks: der REITER ist die horizontale Autoritaet — pm faehrt,
                // playerVel traegt die Fahrt-Richtung (Gier-/Phasen-Quelle des Chokepoints).
                if (r.state.playerVel) r.state.playerVel.setValue(2.4, 0, 0);
                // der Ritt bewegt sich im Sim-Schritt (`_rittSchritt`: Lage, Gier, die Blocker), das Bild folgt im Frame-Takt
                for (let i = 0; i < 120; i++) {
                    pm.x += 0.12;
                    r._rittSchritt(0.05);
                    r._tickMountedMovement(0.05);
                }
                res.drive.dist = Math.hypot(entry.position.x - m0.x, entry.position.z - m0.z);
                // Blocker folgen (max. Zentrums-Abstand aller Boxen zur neuen Position).
                if (entry.blockerAABBs) {
                    let bMax = 0;
                    for (const b of entry.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2;
                        const cz = (b.minZ + b.maxZ) / 2;
                        bMax = Math.max(bMax, Math.hypot(cx - entry.position.x, cz - entry.position.z));
                    }
                    res.drive.blockerMax = bMax;
                }
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
            res.driveErr = fehlerText(e);
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
            res.standErr = fehlerText(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    // B-a/B-b: JEDES Fahrzeug-Rezept trägt im LIVE-Buch sein fahrprofil BIT-EXAKT == Node-exportDrive (durch Worker + Ingest;
    // bis w12-fahrzeug-decke zwei Zeilen: 5/5 finite, bit-exakt nur gt + supersport)
    const abw = Object.keys(VC.PRESETS).flatMap((id) => driveDiverges(out.book[id], expectedFor(id)).map((k) => `${id}.${k}`));
    check(
        "B-a/B-b: jedes Fahrzeug-Rezept reiste BIT-EXAKT durch Worker+Ingest (Buch == Node-exportDrive)",
        !abw.length,
        out.bookErr || abw.join(",") || Object.keys(out.book).join(",")
    );
    // B-c: das Host-Profil.
    const pg = out.gt;
    check(
        "B-c: _vehicleProfile(fahrzeug_gt) traegt die LAB-Werte (topSpeedMul/kAcc/kBrake === exportDrive)",
        !!pg && pg.topSpeedMul === gtExp.topSpeedMul && pg.kAcc === gtExp.kAcc && pg.kBrake === gtExp.kBrake,
        out.profErr || (pg ? `kAcc=${pg.kAcc}` : "kein Profil")
    );
    // B-d (B2): die stehende Fahr-Probe — EIN Verdikt (dieselbe pure Funktion wie der Selbst-Test).
    const dv = driveVerdict(out.drive);
    check(
        "B-d/B2: FAHR-PROBE — nach 120 Fahr-Ticks: Eintrag > 1 m bewegt · Blocker ziehen mit · Snapshot traegt es",
        dv.length === 0,
        out.driveErr ||
            (out.drive
                ? `kind=${out.drive.visualKind} dist=${(out.drive.dist || 0).toFixed(2)}m${dv.length ? " fehlt:" + dv.join(",") : ""}`
                : "keine Probe")
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

    wandEnde(
        errs,
        "DAS LAB-FAHRPROFIL FÜHRT (N6): die Bruecke rechnet exportDrive beim Buch-Bau bit-exakt, _vehicleProfile faehrt die Lab-Werte, der Bewegungs-Loop ist EIN Pfad."
    );
});
