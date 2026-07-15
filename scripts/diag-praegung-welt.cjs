// diag-praegung-welt.cjs — PRÄGUNG-WELT (Auftrag A): DIE PRÄGUNG REIST MIT DEM ARTEFAKT.
// Der verifizierte Naht-Riss: das präge-Verb (V18.466) schrieb state.workshop.studioOv,
// aber NUR die Werkstatt-VORSCHAU konsumierte das ov — die Welt-Pfade (_foundryFlattenFor ·
// _heldFoundryGroup) riefen _foundryRequest OHNE 5. Arg → Prägung war Vorschau-Theater.
// Jetzt wird die Prägung beim GUSS als `studioOv` aufs Artefakt GESTEMPELT (Bauplan/Entry)
// und die Welt-Chokepoints lesen NUR den Stempel. Diese Linse hält die Naht:
//
//   (S) SELBST-TEST (nicht vakuös): ein GESTRIPPTER Stempel (Entry ohne studioOv — die
//       alte Welt) liefert EXAKT den ungeprägten Fingerabdruck — d. h. der Vergleicher
//       der Linse ERKENNT den alten Riss (geprägt == ungeprägt ⇒ rot erkennbar).
//   (N) NAHT: ein geprägtes weapon (klinge_langschwert, __tradition "Nihon") liefert im
//       HAND-Guss (_heldFoundryGroup) einen ANDEREN Geometrie-Fingerabdruck als ungeprägt;
//       ein geprägtes Fahrzeug-Entry (fahrzeug_gt, Kultur-fx via KIND_CHARAKTER) formt im
//       WELT-Flatten (_foundryFlattenFor) anders — zwei Kulturen (toro/stern) unterscheidbar.
//   (G) GUSS-SEMANTIK: wieldBlueprint (schöpfer, ungeschmiedet) stempelt bp.studioOv als
//       TIEFE KOPIE; nachträgliches präge ändert das bestehende Artefakt NICHT.
//   (R) ROUNDTRIP: der Stempel überlebt spawnArchitecture → buildStateSnapshot →
//       _loadStateRestoreArchitectures; den Bauplan-Zwilling (_serializeBlueprint/
//       _deserializeBlueprint); UND das place-DSL (spawn_blueprint Slot 6 — die P2P-Naht).
//   (B) BYTE-IDENTITÄT des ungeprägten Pfads: Schlüssel OHNE "|ov:"-Suffix, Fingerabdruck
//       == direkter ov-loser _foundryRequest-Bau; ein geprägter Bau legt NUR "|ov:"-Keys
//       an und der ungeprägte Cache-Eintrag bleibt UNVERGIFTET (Reinheit beide Richtungen).
//
//   node scripts/diag-praegung-welt.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PRAEGUNG_WELT_PORT || 4439);
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
    // ── Quell-Proben (Konsum-Tripwires: die Naht-Zeilen leben im Stamm) ──
    console.log("=== PRÄGUNG-WELT — Quell-Proben (die Naht lebt im Stamm) ===");
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    check(
        "Q: _foundryFlattenFor liest den Entry-Stempel + reicht ihn als 5. Arg",
        /const entryOv = this\._artifactStudioOv\(entry\);/.test(stamm) &&
            /_foundryRequest\(preset, variant, lod, season, entryOv \|\| undefined\)/.test(stamm)
    );
    check(
        "Q: _heldFoundryGroup liest den Bauplan-Stempel + reicht ihn als 5. Arg",
        /const heldOv = this\._artifactStudioOv\(bp\);/.test(stamm) &&
            /_foundryRequest\(preset, variant, 0, season, heldOv \|\| undefined\)/.test(stamm)
    );
    check(
        "Q: der Guss stempelt (_forgeMaterialAndFreeze + schöpfer-wield rufen _stampStudioOv)",
        (stamm.match(/this\._stampStudioOv\(bp, name\)/g) || []).length >= 2
    );
    check(
        "Q: confirmBuild stempelt Entry + place-DSL (spawn_blueprint Slot 6)",
        /studioOv: bmStamp \|\| undefined/.test(stamm) &&
            /spawn_blueprint: \(\[name, positionNode, seed, archId, studioOv\], ctx\)/.test(stamm)
    );
    check("Q: studioOv ist deklariertes BLUEPRINT_KNOWN_KEYS-Feld (Taille)", /"studioOv",\n\]\);/.test(stamm));

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
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

    const out = await page.evaluate(async () => {
        const res = { warm: {}, s: {}, n: {}, g: {}, r: {}, b: {} };
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        // FNV-1a-Fingerabdruck über die Positions-Arrays einer Gruppe/Leaf-Liste —
        // stark genug für „gleiche vs. andere Geometrie", deterministisch, schnell.
        const fnv = (h, f32) => {
            const u8 = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
            for (let i = 0; i < u8.length; i++) {
                h ^= u8[i];
                h = Math.imul(h, 0x01000193);
            }
            return h;
        };
        const fpGroup = (g) => {
            let h = 0x811c9dc5;
            let n = 0;
            g.traverse((o) => {
                const a = o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                if (!a || !a.array) return;
                n++;
                h = fnv(h, a.array);
            });
            return (h >>> 0).toString(16) + "/" + n;
        };
        const fpFlat = (flat) => {
            let h = 0x811c9dc5;
            let n = 0;
            for (const lf of flat.leaves || []) {
                const a = lf.geom && lf.geom.attributes && lf.geom.attributes.position;
                if (!a || !a.array) continue;
                n++;
                h = fnv(h, a.array);
            }
            return (h >>> 0).toString(16) + "/" + n;
        };

        // ===== WARM-ANKER: Boot → f.ready → Buch (langschwert + gt) → !_prefetching =====
        const dl0 = performance.now() + 150000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const f = r._ensureAssetFoundry();
        while (performance.now() < dl0) {
            if (
                f &&
                f.ready &&
                f.recipes &&
                f.recipes.langschwert &&
                f.recipes.gt &&
                r.state.blueprints &&
                r.state.blueprints.klinge_langschwert &&
                r.state.blueprints.fahrzeug_gt &&
                !f._prefetching
            )
                break;
            await sleep(120);
        }
        res.warm.ready = !!(f && f.ready);
        res.warm.langschwert = !!(f && f.recipes && f.recipes.langschwert);
        res.warm.gt = !!(f && f.recipes && f.recipes.gt);
        res.warm.bps = !!(
            r.state.blueprints &&
            r.state.blueprints.klinge_langschwert &&
            r.state.blueprints.fahrzeug_gt
        );
        if (!res.warm.ready || !res.warm.langschwert || !res.warm.gt || !res.warm.bps) return res;
        const season = r.state.season || "summer";
        const KC = r.constructor.KIND_CHARAKTER;
        const VC = globalThis.__vehicleCore;
        res.warm.charakter = !!(KC && KC.weapon && KC.vehicle && VC && VC.CULTURES);

        // ===== (N-WELT) geprägtes Fahrzeug-Entry formt im Welt-Flatten anders =====
        const flatFor = async (entry) => {
            let flat = r._foundryFlattenFor(entry, "gt", 0);
            const dl = performance.now() + 60000;
            while (!(flat && flat.leaves) && performance.now() < dl) {
                await sleep(200);
                flat = r._foundryFlattenFor(entry, "gt", 0);
            }
            return flat && flat.leaves ? flat : null;
        };
        try {
            const keysBefore = new Set(f.cache.keys());
            const entryU = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 } };
            const flatU = await flatFor(entryU);
            res.n.fpU = flatU ? fpFlat(flatU) : null;
            const ovToro = KC.vehicle.ov("toro", VC.CULTURES);
            const ovStern = KC.vehicle.ov("stern", VC.CULTURES);
            res.n.ovToro = ovToro;
            const entryT = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 }, studioOv: ovToro };
            const entryS = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 }, studioOv: ovStern };
            const flatT = await flatFor(entryT);
            const flatS = await flatFor(entryS);
            res.n.fpToro = flatT ? fpFlat(flatT) : null;
            res.n.fpStern = flatS ? fpFlat(flatS) : null;
            // ===== (S) SELBST-TEST: gestrippter Stempel == ungeprägt (der alte Riss ist erkennbar) =====
            const entryStripped = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 } };
            const flatX = await flatFor(entryStripped);
            res.s.fpStripped = flatX ? fpFlat(flatX) : null;
            res.s.rissErkennbar = !!(res.s.fpStripped && res.n.fpU && res.s.fpStripped === res.n.fpU);
            // ===== (B) Cache-Reinheit + Schlüssel-Disziplin =====
            const added = Array.from(f.cache.keys()).filter((k) => !keysBefore.has(k) && k.indexOf("gt|") === 0);
            res.b.addedKeys = added;
            res.b.plainKeys = added.filter((k) => k.indexOf("|ov:") < 0);
            res.b.ovKeys = added.filter((k) => k.indexOf("|ov:") >= 0);
            res.b.noJsonKeys = added.every((k) => k.indexOf("{") < 0);
            // Reinheit RÜCKrichtung: der ungeprägte Eintrag liefert NACH den geprägten
            // Bauten denselben Fingerabdruck (kein geprägtes Entry vergiftete ihn).
            const flatU2 = await flatFor({ type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 } });
            res.b.fpU2 = flatU2 ? fpFlat(flatU2) : null;
            // Byte-Identität: der direkte ov-lose Request baut dieselbe Geometrie wie
            // der ungeprägte Flatten-Pfad (der Schlüssel trägt keinen ov-Hash).
            const variant = r._foundryVariantFor(7);
            res.b.plainKeyExact = f.cache.has("gt|" + variant + "|0|" + season);
            const mU = await Promise.race([r._foundryRequest("gt", variant, 0, season), sleep(45000)]);
            if (Array.isArray(mU) && mU.length) {
                const gTmp = r._foundryBuildGroup(mU, { lod: 0, preset: "gt" });
                res.b.fpDirect = gTmp ? fpGroup(gTmp) : null;
            }
        } catch (e) {
            res.n.err = (e && e.message) || String(e);
        }

        // ===== (N-HAND) geprägtes weapon formt im Hand-Guss anders =====
        try {
            const bp = r.state.blueprints.klinge_langschwert;
            delete bp.studioOv;
            const heldFor = async (name) => {
                let g = r._heldFoundryGroup(name);
                const dl = performance.now() + 60000;
                while ((g === "pending" || !g) && performance.now() < dl) {
                    await sleep(200);
                    g = r._heldFoundryGroup(name);
                }
                return g && g !== "pending" ? g : null;
            };
            const gU = await heldFor("klinge_langschwert");
            res.n.handU = gU ? fpGroup(gU) : null;
            bp.studioOv = KC.weapon.ov("Nihon");
            const gS = await heldFor("klinge_langschwert");
            res.n.handNihon = gS ? fpGroup(gS) : null;
            // SELBST-TEST Hand: Stempel strippen → wieder der ungeprägte Fingerabdruck.
            delete bp.studioOv;
            const gX = await heldFor("klinge_langschwert");
            res.s.handStripped = gX ? fpGroup(gX) : null;
        } catch (e) {
            res.n.errHand = (e && e.message) || String(e);
        }

        // ===== (G) GUSS-SEMANTIK: wieldBlueprint stempelt (schöpfer, ungeschmiedet); präge danach ändert nichts =====
        try {
            const bp = r.state.blueprints.klinge_langschwert;
            delete bp.studioOv;
            delete bp.forgedPrecision;
            const ws = r._ensureWorkshopState();
            ws.studioOv["langschwert"] = { __tradition: "Nihon" };
            // Die EINE Mode-Quelle ist worldMeta.gameMode (getGameMode kanonisiert daraus).
            const wm = r.state.worldMeta || (r.state.worldMeta = {});
            const oldMode = wm.gameMode;
            wm.gameMode = "schöpfer";
            try {
                r.wieldBlueprint("klinge_langschwert");
            } catch (_e) {
                /* headless-Equip-Nebenwege dürfen scheitern — der Stempel sitzt VOR equipHeld */
            }
            res.g.stamped = bp.studioOv && bp.studioOv.__tradition === "Nihon";
            res.g.deepCopy = bp.studioOv !== ws.studioOv["langschwert"];
            // nachträgliches präge (Kanal-Wechsel) ändert das bestehende Artefakt NICHT:
            ws.studioOv["langschwert"] = { __tradition: "Pars" };
            res.g.frozen = bp.studioOv && bp.studioOv.__tradition === "Nihon";
            // Neu-Guss OHNE Prägung räumt den Stempel (ehrliche Guss-Semantik):
            delete ws.studioOv["langschwert"];
            r._stampStudioOv(bp, "klinge_langschwert");
            res.g.cleared = bp.studioOv === undefined;
            if (oldMode === undefined) delete wm.gameMode;
            else wm.gameMode = oldMode;
            r.getGameMode(); // die Spiegelung (state.gameMode) sauber zurücksetzen
            delete bp.forgedPrecision;
        } catch (e) {
            res.g.err = (e && e.message) || String(e);
        }

        // ===== (R) ROUNDTRIP: Entry-Snapshot · Bauplan-Zwilling · place-DSL =====
        try {
            const KCv = KC.vehicle.ov("toro", VC.CULTURES);
            const spawned = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: 40, y: 3, z: 40 },
                { seed: 7, precise: true, id: "praeg-roundtrip-1", studioOv: KCv }
            );
            res.r.entryStamp = !!(spawned && spawned.studioOv && spawned.studioOv.cEdge === KCv.cEdge);
            res.r.entryDeepCopy = !!(spawned && spawned.studioOv !== KCv);
            const snap = r.buildStateSnapshot();
            const snapE = (snap.architectures || []).find((a) => a && a.id === "praeg-roundtrip-1");
            res.r.snapCarries = !!(snapE && snapE.studioOv && snapE.studioOv.cEdge === KCv.cEdge);
            // Restore-Hälfte: der Stempel kehrt an den lebenden Eintrag zurück.
            r._loadStateRestoreArchitectures({ architectures: snap.architectures });
            const back = (r.state.architectures || []).find((a) => a && a.id === "praeg-roundtrip-1");
            res.r.restoreCarries = !!(back && back.studioOv && back.studioOv.cEdge === KCv.cEdge);
            // Bauplan-Zwilling:
            const bp = r.state.blueprints.klinge_langschwert;
            bp.studioOv = { __tradition: "Nihon" };
            const ser = r._serializeBlueprint(bp);
            res.r.bpSer = !!(ser.studioOv && ser.studioOv.__tradition === "Nihon");
            const des = r._deserializeBlueprint(JSON.parse(JSON.stringify(ser)));
            res.r.bpDes = !!(des && des.studioOv && des.studioOv.__tradition === "Nihon");
            delete bp.studioOv;
            // place-DSL (die P2P-Naht: Slot 6 reist durch den Op in den Entry):
            const ovStern = KC.vehicle.ov("stern", VC.CULTURES);
            r.dslRun(["spawn_blueprint", "fahrzeug_gt", ["at", 60, 3, 60], 7, "praeg-dsl-1", ovStern], {
                source: "remote:praegung-test",
            });
            const dslE = (r.state.architectures || []).find((a) => a && a.id === "praeg-dsl-1");
            res.r.dslCarries = !!(dslE && dslE.studioOv && dslE.studioOv.cEdge === ovStern.cEdge);
            // Taille-Wand: ein Riesen-Stempel (>8 KiB) fällt am EINEN Chokepoint.
            const fat = { blob: "x".repeat(9000) };
            const fatE = r.spawnArchitecture(
                "fahrzeug_gt",
                { x: 80, y: 3, z: 80 },
                { seed: 7, precise: true, id: "praeg-fat-1", studioOv: fat }
            );
            res.r.fatRejected = !!(fatE && fatE.studioOv === undefined);
        } catch (e) {
            res.r.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error("FATAL:", out.fatal);
        process.exit(2);
    }
    console.log("\n=== WARM-ANKER ===");
    check(
        "Foundry warm (Buch trägt langschwert + gt, Auto-Blueprints da, KIND_CHARAKTER + CULTURES geladen)",
        out.warm.ready && out.warm.langschwert && out.warm.gt && out.warm.bps && out.warm.charakter,
        JSON.stringify(out.warm)
    );

    console.log("\n=== (S) SELBST-TEST — der alte Riss ist ERKENNBAR (nicht vakuös) ===");
    check(
        "gestrippter Entry-Stempel ⇒ EXAKT der ungeprägte Fingerabdruck (geprägt==ungeprägt wäre rot)",
        out.s.rissErkennbar === true,
        `stripped=${out.s.fpStripped} vs U=${out.n.fpU}`
    );
    check(
        "gestrippter Hand-Stempel ⇒ EXAKT der ungeprägte Hand-Fingerabdruck",
        !!out.s.handStripped && out.s.handStripped === out.n.handU,
        `stripped=${out.s.handStripped} vs U=${out.n.handU}`
    );

    console.log("\n=== (N) NAHT — die Prägung formt in Hand UND Welt ===");
    check(
        "HAND-Guss: klinge_langschwert geprägt (Nihon) ≠ ungeprägt",
        !!out.n.handU && !!out.n.handNihon && out.n.handU !== out.n.handNihon,
        out.n.errHand || `U=${out.n.handU} Nihon=${out.n.handNihon}`
    );
    check(
        "WELT-Flatten: fahrzeug_gt-Entry geprägt (toro ≠ stern, mind. eine ≠ ungeprägt)",
        !!out.n.fpToro &&
            !!out.n.fpStern &&
            out.n.fpToro !== out.n.fpStern &&
            (out.n.fpToro !== out.n.fpU || out.n.fpStern !== out.n.fpU),
        out.n.err || `U=${out.n.fpU} toro=${out.n.fpToro} stern=${out.n.fpStern}`
    );

    console.log("\n=== (G) GUSS-SEMANTIK — Stempel beim Guss, gefroren danach ===");
    check(
        "wieldBlueprint (schöpfer, ungeschmiedet) stempelt bp.studioOv als TIEFE Kopie",
        out.g.stamped === true && out.g.deepCopy === true,
        out.g.err
    );
    check("nachträgliches präge ändert das bestehende Artefakt NICHT", out.g.frozen === true);
    check("Neu-Guss OHNE Prägung räumt den Alt-Stempel", out.g.cleared === true);

    console.log("\n=== (R) ROUNDTRIP — Snapshot · Bauplan-Zwilling · place-DSL · Taille ===");
    check(
        "spawnArchitecture stempelt den Entry (tiefe Kopie)",
        out.r.entryStamp === true && out.r.entryDeepCopy === true,
        out.r.err
    );
    check(
        "Snapshot trägt den Entry-Stempel + Restore bringt ihn zurück",
        out.r.snapCarries === true && out.r.restoreCarries === true
    );
    check(
        "Bauplan-Zwilling: _serializeBlueprint/_deserializeBlueprint tragen studioOv",
        out.r.bpSer === true && out.r.bpDes === true
    );
    check("place-DSL: spawn_blueprint Slot 6 reist in den Entry (P2P-Naht)", out.r.dslCarries === true);
    check("Taille-Wand: >8-KiB-Stempel fällt am Chokepoint", out.r.fatRejected === true);

    console.log("\n=== (B) BYTE-IDENTITÄT + CACHE-REINHEIT des ungeprägten Pfads ===");
    check(
        "der ungeprägte Bau legt NUR den alten Schlüssel (ohne |ov:) an, geprägte NUR |ov:-Schlüssel",
        Array.isArray(out.b.plainKeys) &&
            out.b.plainKeys.length >= 1 &&
            Array.isArray(out.b.ovKeys) &&
            out.b.ovKeys.length >= 2,
        `plain=${JSON.stringify(out.b.plainKeys)} ov=${(out.b.ovKeys || []).length}`
    );
    check("der exakte Alt-Schlüssel (preset|variant|lod|season) lebt unverändert", out.b.plainKeyExact === true);
    check("kein JSON-Schlüssel im Welt-Cache (die Rezept-Linsen-Reinheit hält)", out.b.noJsonKeys === true);
    check(
        "REINHEIT beide Richtungen: der ungeprägte Fingerabdruck bleibt NACH geprägten Bauten gleich",
        !!out.b.fpU2 && out.b.fpU2 === out.n.fpU,
        `vorher=${out.n.fpU} nachher=${out.b.fpU2}`
    );
    check(
        "BYTE-IDENTITÄT: ungeprägter Flatten == direkter ov-loser _foundryRequest-Bau",
        !!out.b.fpDirect && out.b.fpDirect === out.n.fpU,
        `direkt=${out.b.fpDirect} flatten=${out.n.fpU}`
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    else console.log("  ✅ keine Seiten-Fehler");

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DIE PRÄGUNG REIST MIT DEM ARTEFAKT: der Guss stempelt (Bauplan + Entry), Hand- und Welt-Chokepoint konsumieren den Stempel (messbar andere Gestalt), der Stempel überlebt Snapshot + place-DSL, und der ungeprägte Pfad ist byte-identisch mit reinem Cache."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Prägung-Welt-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
