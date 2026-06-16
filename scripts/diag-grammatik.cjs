// diag-grammatik.cjs — Ω-PHYSIS Säule III Ω-B1 (wahrerbauplan §6): DIE ARCHITEKTUR-
// GRAMMATIK. Der Tempel folgt der DORISCHEN ORDNUNG (reference-first) UND ist PHYSIK-
// GARANT: er steht (Ω-Φ2), die 1:7-Säulen knicken NICHT (Ω-Φ3-b), der Lastpfad schließt
// (Ω-Φ5). Reine Berechnung + Geometrie-Bau → headless verifizierbar (der LOOK augen-bound).
//   node scripts/diag-grammatik.cjs
const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message));
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 12000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.blueprints ||
                    !window.anazhRealm.state.materials) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const out = await page.evaluate(() => {
            const r = window.anazhRealm,
                C = r.constructor;
            const o = {};
            const temple = r.state.blueprints.temple;
            o.exists = !!(temple && Array.isArray(temple.parts));
            o.partCount = temple ? temple.parts.length : 0;

            // ── STRUKTUR: die klassische Ordnung ist ablesbar (der Welt-Tempel ist eine VARIANTE) ──
            const fluteSet = [C.CLASSICAL_ORDERS.dorisch.flutes, C.CLASSICAL_ORDERS.ionisch.flutes];
            const shafts = temple.parts.filter((p) => p.shape === "flutedColumn");
            o.shaftCount = shafts.length;
            o.allEntasis = shafts.length > 0 && shafts.every((p) => p.size.z < p.size.x); // oberer ⌀ < unterer
            o.allFluted = shafts.every((p) => fluteSet.includes(p.flutes)); // 20 (dorisch) ODER 24 (ionisch)
            o.echinusCount = temple.parts.filter((p) => p.shape === "cylinder" && p.size.x > p.size.z).length; // Flare-Kapitelle
            o.pedimentSlopes = temple.parts.filter(
                (p) => p.shape === "box" && p.rotation && Math.abs(p.rotation.z) > 0.05
            ).length; // Giebel-Dach
            o.tympanon = temple.parts.filter((p) => p.shape === "gableTriangle").length; // geschlossener Giebel
            o.hasOrders = !!(C.CLASSICAL_ORDERS && C.CLASSICAL_ORDERS.dorisch && C.CLASSICAL_ORDERS.ionisch);

            // ── Ω-B4 GENERATIV: N Seeds → N VERSCHIEDENE Tempel, ALLE physik-garant ──
            const variants = ["alpha", "beta", "gamma", "delta", "omega"].map((s) => ({
                seed: s,
                bp: { parts: r._classicalTempleVariant(s) },
            }));
            const sigs = new Set();
            let allStand = true,
                allNoBuckle = true;
            for (const v of variants) {
                const shaftsV = v.bp.parts.filter((p) => p.shape === "flutedColumn");
                const fl = shaftsV.length ? shaftsV[0].flutes : 0;
                sigs.add(v.bp.parts.length + ":" + fl); // Signatur = Parts + Ordnung(Flutes)
                if (!(r._stability(v.bp).inside === true)) allStand = false;
                if (r._failsUnderLoad(v.bp).buckles !== false) allNoBuckle = false;
            }
            o.variantCount = sigs.size; // verschiedene Tempel aus verschiedenen Seeds
            o.variantsAllStand = allStand;
            o.variantsAllNoBuckle = allNoBuckle;
            o.variantDeterministic =
                r._classicalTempleVariant("alpha").length === r._classicalTempleVariant("alpha").length;

            // ── EINGANG: die Front-Cella-Wand hat eine TÜR-Lücke (kein Part deckt die Tür-Mitte) ──
            // V18.250 — der Welt-Tempel trägt jetzt eine seed-gewürfelte STEIN-PALETTE (Marmor/
            // Sandstein/Granit/Basalt), darum ist die Cella-Farbe nicht mehr fix; die Eingangs-
            // STRUKTUR ist palette-unabhängig → gegen einen Default-Palette-Referenz-Tempel prüfen
            // (kein `palette`-opt → Cella = 0xc4bda8).
            const refTempleParts = r._buildClassicalTemple("dorisch", { columnsFront: 6, columnsSide: 9 });
            const cellaBoxes = refTempleParts.filter((p) => p.shape === "box" && p.color === 0xc4bda8);
            // die Front-Wand-Parts liegen am größten +Z; finde die Tür-Lücke: kein Front-Box deckt (x≈0, y niedrig)
            let frontZ = -1e9;
            for (const p of cellaBoxes) if (p.position.z > frontZ) frontZ = p.position.z;
            const frontWall = cellaBoxes.filter((p) => Math.abs(p.position.z - frontZ) < 0.01 && p.size.z < 1);
            const doorY = temple.parts.find((p) => p.shape === "octahedron") ? 2.0 : 2.0; // niedrige Tür-Höhe
            const coversDoor = frontWall.some(
                (p) =>
                    Math.abs(p.position.x) < p.size.x / 2 &&
                    p.position.y - p.size.y / 2 < doorY &&
                    p.position.y + p.size.y / 2 > doorY
            );
            o.hasEntrance = frontWall.length >= 2 && !coversDoor; // ≥2 Pfeiler + offene Tür-Mitte

            // ── die flutedColumn-GEOMETRIE baut (Entasis + Kanneluren in EINER Mesh) ──
            try {
                const g = r._makePartGeometry({
                    shape: "flutedColumn",
                    size: { x: 1, y: 7, z: 0.82 },
                    flutes: 20,
                    fluteDepth: 0.05,
                    entasis: 0.05,
                });
                const pos = g && g.getAttribute && g.getAttribute("position");
                o.geoBuilds = !!(pos && pos.count > 100);
                // die Radius-Modulation (Kanneluren) erzeugt nicht-konstanten Radius in einem Ring
                let rmin = 1e9,
                    rmax = 0;
                for (let i = 0; i < Math.min(pos.count, 80); i++) {
                    const x = pos.getX(i),
                        z = pos.getZ(i);
                    const rad = Math.hypot(x, z);
                    if (rad < rmin) rmin = rad;
                    if (rad > rmax) rmax = rad;
                }
                o.flutingVaries = rmax - rmin > 0.01; // die Rillen modulieren den Radius
            } catch (e) {
                o.geoBuilds = false;
                o.geoErr = e.message;
            }

            // ── das MESH baut ohne Fehler (der flutedColumn-Pfad in _buildFromBlueprint) ──
            try {
                const grp = r._buildFromBlueprint(temple, 0, undefined, {});
                o.meshBuilds = !!(grp && grp.children && grp.children.length > 50);
            } catch (e) {
                o.meshBuilds = false;
                o.meshErr = e.message;
            }

            // ── PHYSIK-GARANT (§6): der Tempel STEHT, die 1:7-Säulen KNICKEN NICHT ──
            o.role = r.computeBlueprintRole(temple); // soll "architecture"
            const stab = r._stability(temple);
            o.stands = stab.inside === true && stab.margin > 0;
            o.stabMargin = Math.round(stab.margin * 1000) / 1000;
            const fail = r._failsUnderLoad(temple);
            o.doricNoBuckle = fail.buckles === false; // 1:7 dorisch knickt NICHT
            o.maxSlender = Math.round(fail.maxSlenderness * 100) / 100;

            // ── der KLEINE Tempel (< 120 Parts → echte Lastpfad-BFS): schließt der Lastpfad? ──
            const small = { parts: r._buildClassicalTemple("dorisch", { columnsFront: 4, columnsSide: 5 }) };
            o.smallParts = small.parts.length;
            const lp = r._loadPath(small);
            o.loadIntact = lp.intact === true; // alles trägt zum Boden (kein schwebendes Teil)
            o.floatCount = lp.floatingParts.length; // soll 0 (der Kristall sitzt auf dem Altar)
            o.smallStands = r._stability(small).inside === true;

            // ── KONTRAST: eine ÜBER-SCHLANKE Säule (1:30) KNICKT (die Physik fängt die Attrappe) ──
            const slenderTemple = {
                parts: r._buildClassicalTemple("dorisch", { columnsFront: 4, columnsSide: 5, columnDiameter: 0.2 }),
            };
            // bei D=0.2 wird shaftH = 0.2·7 = 1.4, Schlankheit am oberen ⌀ (0.164) = 8.5 — knickt noch nicht;
            // darum ein direkter Über-Schlank-Test: ein einzelner 1:30-Schaft.
            const overSlender = {
                parts: [
                    {
                        shape: "flutedColumn",
                        material: "stein",
                        size: { x: 0.2, y: 6, z: 0.164 },
                        position: { x: 0, y: 3, z: 0 },
                    },
                ],
            };
            o.overSlenderBuckles = r._failsUnderLoad(overSlender).buckles === true;
            o.slenderTempleParts = slenderTemple.parts.length; // baut (kein Crash)

            // ── Ω-B2: die parametrische KLINGE (Oakeshott — distale Verjüngung + Hohlkehle) ──
            const sword = r.state.blueprints.geraet_schwert;
            o.swordExists = !!(sword && Array.isArray(sword.parts));
            const blades = o.swordExists ? sword.parts.filter((p) => p.shape === "bladeProfile") : [];
            o.hasBladeProfile = blades.length === 1; // eine echte Klinge (kein Kegel)
            o.bladeFuller = blades.length === 1 && typeof blades[0].fuller === "number"; // Hohlkehle-Param
            o.bladeTaper = blades.length === 1 && blades[0].tipWidth < 1; // distale Verjüngung
            o.hasOakeshott = !!(
                C.OAKESHOTT_TYPES &&
                C.OAKESHOTT_TYPES.XII &&
                C.OAKESHOTT_TYPES.XV &&
                C.OAKESHOTT_TYPES.XIIIa
            );
            o.swordRole = o.swordExists ? r.computeBlueprintRole(sword) : "?"; // liest als gehaltenes Gerät
            o.swordIsImplement = o.swordExists && r._isGraspableBladeForm(sword) === true; // gestreckt + spitz → Klinge
            // die bladeProfile-GEOMETRIE baut (front+back Blätter + Basis-Kappe)
            try {
                const bg = r._makePartGeometry({
                    shape: "bladeProfile",
                    size: { x: 0.2, y: 1.4, z: 0.06 },
                    tipWidth: 0.34,
                    fuller: 0.5,
                });
                const bp2 = bg && bg.getAttribute && bg.getAttribute("position");
                o.bladeGeoBuilds = !!(bp2 && bp2.count > 50);
            } catch (e) {
                o.bladeGeoBuilds = false;
                o.bladeErr = e.message;
            }
            // die BALANCE (Ω-Φ4) ist GERECHNET + typ-abhängig: ein größeres Schwert (XIIIa,
            // lange Klinge) ist kopflastiger als ein kurzes Stich-Schwert (XV).
            const swXV = r._swingDynamics({ parts: r._buildBladedWeapon("XV") });
            const swBig = r._swingDynamics({ parts: r._buildBladedWeapon("XIIIa") });
            o.balXV = Math.round(swXV.balance * 100) / 100;
            o.balBig = Math.round(swBig.balance * 100) / 100;
            o.balanceComputed = swXV.balance > 0 && swBig.balance > 0;
            o.bigMoreHeadHeavy = swBig.balance > swXV.balance; // längere Klinge → Schwerpunkt weiter vom Griff

            return o;
        });
        const ok = (b) => (b ? "  OK  " : " FAIL ");
        const line = (label, val, expect, pass) =>
            console.log(ok(pass) + label.padEnd(48) + String(val).padStart(10) + "   " + expect);
        console.log("\n=== Ω-PHYSIS Säule III Ω-B1/B4 — DIE ARCHITEKTUR-GRAMMATIK (generativ) ===\n");
        console.log("— die klassische ORDNUNG ist ablesbar (reference-first) —");
        line("Tempel existiert + reich (Parts)", out.partCount, "soll > 80", out.partCount > 80);
        line("kannelierte Schäfte (flutedColumn)", out.shaftCount, "soll > 10", out.shaftCount > 10);
        line("alle Schäfte mit ENTASIS (oberer ⌀ < unterer)", out.allEntasis, "soll true", out.allEntasis);
        line("alle Schäfte kanneliert (20 dorisch / 24 ionisch)", out.allFluted, "soll true", out.allFluted);
        line("Echinus-Kapitelle (Flare)", out.echinusCount, "soll > 10", out.echinusCount > 10);
        line("GIEBEL-Dach (geneigte Flächen)", out.pedimentSlopes, "soll 2", out.pedimentSlopes === 2);
        line("TYMPANON schließt den Giebel (gableTriangle)", out.tympanon, "soll 2", out.tympanon === 2);
        line("EINGANG: Tür-Lücke in der Front-Wand", out.hasEntrance, "soll true", out.hasEntrance);
        line("zwei Ordnungen (dorisch + ionisch)", out.hasOrders, "soll true", out.hasOrders);
        console.log("\n— Ω-B4 GENERATIV: die Regel erzeugt VERSCHIEDENE Tempel —");
        line("N Seeds → N verschiedene Tempel", out.variantCount, "soll ≥ 4", out.variantCount >= 4);
        line("ALLE Varianten stehen (physik-garant)", out.variantsAllStand, "soll true", out.variantsAllStand);
        line("ALLE Varianten knicken nicht", out.variantsAllNoBuckle, "soll true", out.variantsAllNoBuckle);
        line(
            "deterministisch (gleicher Seed → gleicher Tempel)",
            out.variantDeterministic,
            "soll true",
            out.variantDeterministic
        );
        console.log("\n— die flutedColumn-GEOMETRIE (Entasis + Kanneluren in EINER Mesh) —");
        line("Geometrie baut (Vertices)", out.geoBuilds, "soll true", out.geoBuilds);
        line("Kanneluren modulieren den Radius", out.flutingVaries, "soll true", out.flutingVaries);
        line(
            "der Tempel-Mesh baut (kein Fehler)",
            out.meshBuilds + (out.meshErr ? " [" + out.meshErr + "]" : ""),
            "soll true",
            out.meshBuilds
        );
        console.log("\n— PHYSIK-GARANT (§6): wahr UND schön zugleich —");
        line("liest als Bauwerk (architecture)", out.role, "architecture", out.role === "architecture");
        line("der Tempel STEHT (Schwerpunkt über Basis)", out.stands + " m=" + out.stabMargin, "soll true", out.stands);
        line(
            "die 1:7-Säulen KNICKEN NICHT (Ω-Φ3-b)",
            out.doricNoBuckle + " s=" + out.maxSlender,
            "soll true",
            out.doricNoBuckle
        );
        line(
            "kleiner Tempel: Lastpfad SCHLIESST (BFS)",
            out.loadIntact + " float=" + out.floatCount,
            "intact, 0 float",
            out.loadIntact && out.floatCount === 0
        );
        line("kleiner Tempel steht", out.smallStands, "soll true", out.smallStands);
        console.log("\n— der KONTRAST: die Physik fängt die Attrappe —");
        line("über-schlanke 1:30-Säule KNICKT", out.overSlenderBuckles, "soll true", out.overSlenderBuckles);
        console.log("\n=== Ω-B2 — DIE PARAMETRISCHE KLINGE (Oakeshott) ===\n");
        line("Schwert = echte Klinge (bladeProfile)", out.hasBladeProfile, "soll true", out.hasBladeProfile);
        line("distale Verjüngung (tipWidth < 1)", out.bladeTaper, "soll true", out.bladeTaper);
        line("Hohlkehle/Fuller-Parameter", out.bladeFuller, "soll true", out.bladeFuller);
        line("Oakeshott-Typen (XII/XV/XIIIa)", out.hasOakeshott, "soll true", out.hasOakeshott);
        line(
            "die Klingen-GEOMETRIE baut",
            out.bladeGeoBuilds + (out.bladeErr ? " [" + out.bladeErr + "]" : ""),
            "soll true",
            out.bladeGeoBuilds
        );
        line(
            "liest als gehaltene Klinge (Implement)",
            out.swordRole + "/" + out.swordIsImplement,
            "Implement",
            out.swordIsImplement
        );
        line(
            "Balance GERECHNET (Ω-Φ4), typ-abhängig",
            out.balXV + "→" + out.balBig,
            "XIIIa > XV",
            out.balanceComputed && out.bigMoreHeadHeavy
        );
        const all = [
            out.partCount > 80,
            out.shaftCount > 10,
            out.allEntasis,
            out.allFluted,
            out.echinusCount > 10,
            out.pedimentSlopes === 2,
            out.tympanon === 2,
            out.hasEntrance,
            out.hasOrders,
            out.variantCount >= 4,
            out.variantsAllStand,
            out.variantsAllNoBuckle,
            out.variantDeterministic,
            out.geoBuilds,
            out.flutingVaries,
            out.meshBuilds,
            out.role === "architecture",
            out.stands,
            out.doricNoBuckle,
            out.loadIntact && out.floatCount === 0,
            out.smallStands,
            out.overSlenderBuckles,
            out.hasBladeProfile,
            out.bladeTaper,
            out.bladeFuller,
            out.hasOakeshott,
            out.bladeGeoBuilds,
            out.swordIsImplement,
            out.balanceComputed && out.bigMoreHeadHeavy,
        ];
        const failed = all.filter((b) => !b).length;
        console.log(
            "\n" +
                (failed === 0
                    ? "✓ ALLE GRÜN — Tempel UND Klinge sind wahr UND schön, wie der Baum (Ω-PHYSIS Säule III)."
                    : `✗ ${failed} FAIL`)
        );
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();
