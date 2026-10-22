// diag-praegung-welt.cjs — PRÄGUNG-WELT (Auftrag A): DIE PRÄGUNG REIST MIT DEM ARTEFAKT.
// Die Prägung wird beim GUSS als `studioOv` aufs Artefakt GESTEMPELT (Bauplan/Entry), die Welt-Chokepoints
// (_foundryFlattenFor · _heldFoundryGroup) lesen NUR den Stempel. Diese Linse hält die Naht:
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
//   (K) KI-REGLER (ki.K2): spawn_studio trägt ov im fünften Argument durch den EINEN Stempel (am Vertrag geklemmt) in den
//       Welt-Flatten — je Zeile von PARAMS_BY_KIND das Welt-Werk ≠ ohne ov und = das Studio-Werk mit demselben ov, tot nur
//       die Ratsche reglerTot; Klemme benannt, Fremdes fail-closed, der Prompt aus derselben Quelle. Selbsttest: ein ov,
//       das nicht ankommt (Stempel oder Bau verliert es), ist rot.
//
//   node scripts/diag-praegung-welt.cjs
"use strict";
const { statikServer, starteBrowser, nullRenderer, ROOT } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.PRAEGUNG_WELT_PORT || 4439);
const server = statikServer();
// die toten Regler der Werkstatt (art:id, gate:regler-wirkt hält die Ratsche frisch)
const TOT = Object.keys(require(`${ROOT}/spec/vertraege/ratsche.json`).reglerTot.tot).map((n) => n.replace(/^[^:]+:/, ""));
const kiUrteil = (m) => [
    ...m.zwilling.map((n) => `${n}: Welt-Werk ≠ Studio-Werk`),
    ...m.ohneWerk.map((n) => `${n}: kein Welt-Werk`),
    ...m.unbewegt.filter((n) => !TOT.includes(n)).map((n) => `${n}: das ov bewegt den Bau nie`),
];

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    const page = await browser.newPage();
    await nullRenderer(page, { foundry: true });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async (TOT) => {
        const res = { warm: {}, s: {}, n: {}, g: {}, r: {}, b: {} };
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        const fp = window.__abdruck; // der EINE Abdruck (welt-boot)

        // ===== WARM-ANKER: Boot → f.ready → Buch (langschwert + gt) → !_vorrat =====
        await window.__weltDa();
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f &&
                f.ready &&
                f.recipes &&
                f.recipes.langschwert &&
                f.recipes.gt &&
                r.state.blueprints &&
                r.state.blueprints.klinge_langschwert &&
                r.state.blueprints.fahrzeug_gt &&
                !f._vorrat);
        res.warm.ready = !!(f && f.ready);
        res.warm.langschwert = !!(f && f.recipes && f.recipes.langschwert);
        res.warm.gt = !!(f && f.recipes && f.recipes.gt);
        res.warm.bps = !!(
            r.state.blueprints &&
            r.state.blueprints.klinge_langschwert &&
            r.state.blueprints.fahrzeug_gt
        );
        if (!res.warm.ready || !res.warm.langschwert || !res.warm.gt || !res.warm.bps) return res;
        const KC = r.constructor.KIND_CHARAKTER;
        const VC = globalThis.__vehicleCore;
        res.warm.charakter = !!(KC && KC.weapon && KC.vehicle && VC && VC.CULTURES);

        // ===== (N-WELT) geprägtes Fahrzeug-Entry formt im Welt-Flatten anders =====
        const flatFor = async (entry, preset = "gt") => {
            let flat = r._foundryFlattenFor(entry, preset, 0);
            for (const weiter = window.__deckel("das Flat der Gestalt", 300); !(flat && flat.leaves) && weiter(); ) {
                await sleep(50);
                flat = r._foundryFlattenFor(entry, preset, 0);
            }
            return flat && flat.leaves ? flat : null;
        };
        // DAS STUDIO-WERK: derselbe Körper direkt aus der Foundry (der Regler-Kanal der Werkstatt, Rang 0), durch DIESELBE
        // Verschmelzung wie der Flatten — seit V18.510 verschmilzt er die Teile EINES Materials (`_foundryFlatVerschmelzen`),
        // sonst vergliche die Probe 328 Teile mit 23.
        const studioFp = async (preset, variant, lod, ov) => {
            const m = await Promise.race([r._foundryRequest(preset, variant, lod, ov || undefined, 0), sleep(45000)]);
            const g = Array.isArray(m) && m.length ? r._foundryBuildGroup(m, { lod, preset }) : null;
            if (!g) return null;
            const leaves = [];
            for (const c of g.children)
                if (c.geometry && c.material)
                    leaves.push({ geom: c.geometry, mat: c.material, tuer: c.userData.__tuer, castShadow: true });
            r._foundryFlatVerschmelzen(g, leaves);
            return fp({ leaves });
        };
        try {
            const keysBefore = new Set(f.cache.keys());
            const entryU = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 } };
            const flatU = await flatFor(entryU);
            res.n.fpU = flatU ? fp(flatU) : null;
            const ovToro = KC.vehicle.ov("toro", VC.CULTURES);
            const ovStern = KC.vehicle.ov("stern", VC.CULTURES);
            res.n.ovToro = ovToro;
            const entryT = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 }, studioOv: ovToro };
            const entryS = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 }, studioOv: ovStern };
            const flatT = await flatFor(entryT);
            const flatS = await flatFor(entryS);
            res.n.fpToro = flatT ? fp(flatT) : null;
            res.n.fpStern = flatS ? fp(flatS) : null;
            // ===== (S) SELBST-TEST: gestrippter Stempel == ungeprägt (der alte Riss ist erkennbar) =====
            const entryStripped = { type: "fahrzeug_gt", seed: 7, position: { x: 0, y: 0, z: 0 } };
            const flatX = await flatFor(entryStripped);
            res.s.fpStripped = flatX ? fp(flatX) : null;
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
            res.b.fpU2 = flatU2 ? fp(flatU2) : null;
            // Byte-Identität: der direkte ov-lose Request baut dieselbe Geometrie wie
            // der ungeprägte Flatten-Pfad (der Schlüssel trägt keinen ov-Hash).
            const variant = r._foundryVariantFor(7, "gt");
            res.b.plainKeyExact = f.cache.has("gt|" + variant + "|0");
            res.b.fpDirect = await studioFp("gt", variant, 0);
        } catch (e) {
            res.n.err = (e && e.message) || String(e);
        }

        // ===== (N-HAND) geprägtes weapon formt im Hand-Guss anders =====
        try {
            const bp = r.state.blueprints.klinge_langschwert;
            delete bp.studioOv;
            const heldFor = async (name) => {
                let g = r._heldFoundryGroup(name);
                for (const weiter = window.__deckel(`die Hand ${name}`, 300); (g === "pending" || !g) && weiter(); ) {
                    await sleep(200);
                    g = r._heldFoundryGroup(name);
                }
                return g && g !== "pending" ? g : null;
            };
            const gU = await heldFor("klinge_langschwert");
            res.n.handU = gU ? fp(gU) : null;
            bp.studioOv = KC.weapon.ov("Nihon");
            const gS = await heldFor("klinge_langschwert");
            res.n.handNihon = gS ? fp(gS) : null;
            // SELBST-TEST Hand: Stempel strippen → wieder der ungeprägte Fingerabdruck.
            delete bp.studioOv;
            const gX = await heldFor("klinge_langschwert");
            res.s.handStripped = gX ? fp(gX) : null;
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
            // KONSUM: auch der Schmiede-Guss stempelt (Spion an _stampStudioOv, Station und Kosten freigestellt).
            {
                const st0 = r._stampStudioOv;
                let n = 0;
                r._stampStudioOv = (...a) => (n++, st0.apply(r, a));
                r._makeStationGate = () => ({ ok: true });
                r._makeCostGate = () => ({ ok: true, free: true });
                try {
                    r._forgeMaterialAndFreeze("klinge_langschwert");
                } finally {
                    for (const k of ["_stampStudioOv", "_makeStationGate", "_makeCostGate"]) delete r[k];
                    delete bp.wear;
                }
                res.g.schmiedeStempelt = n > 0;
            }
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
            // studioOv ist ein deklariertes Bauplan-Feld: ein kaputter Stempel fällt im eigenen Zweig, nie als Unbekanntes vorbei
            bp.studioOv = [1, 2];
            const kaputt = JSON.parse(JSON.stringify(Object.assign({}, ser, { studioOv: [1, 2] })));
            res.r.bpKaputt = r._serializeBlueprint(bp).studioOv === undefined && r._deserializeBlueprint(kaputt).studioOv === undefined;
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

        // ===== (K) KI-REGLER: je Zeile von PARAMS_BY_KIND ein spawn_studio mit dem Rand-Wert im fünften Argument =====
        const k = (res.k = { zeilen: 0, erreicht: [], unbewegt: [], zwilling: [], ohneWerk: [], ohneWort: [], je: {}, zu: {} });
        try {
            const [P, PBK, archs, pm, gM] = [Object.getPrototypeOf(r), f.paramsByKind, r.state.architectures, r.state.playerMesh.position, r._genesisMitte()];
            let spot = null; // trockener Grund abseits der Genesis-Lichtung (ein Werk mit Grundriss sucht seinen Ort selbst)
            for (let i = 0; i < 64 && !spot; i++) {
                const [a, d] = [i * 0.618 * Math.PI * 2, 20 + (i % 8) * 8];
                const [x, z] = [pm.x + Math.cos(a) * d, pm.z + Math.sin(a) * d];
                if (Math.hypot(x - gM.x, z - gM.z) >= 50 && r._landAt(x, z, 2)) spot = { x, z };
            }
            const setze = (wort, ov) => {
                const vor = archs.length;
                const lg = r.dslRun(["spawn_studio", wort, ["at", spot.x, pm.y, spot.z], 1, 7, ov], { source: "test" }).log;
                return { e: archs[vor], lg, neu: archs.slice(vor) };
            };
            // ein Werk durch den Welt-Flatten bauen und abbauen: sein Abdruck über jedes Attribut
            const bau = async (e) => {
                const flat = e && (await flatFor(e, r._foundryPresetForEntry(e)));
                if (e) r.removeArchitecture(e);
                return flat && fp(flat, true);
            };
            const fp0 = {};
            // das Welt-Werk des Programms ≠ ohne ov UND = das Studio-Werk mit DEMSELBEN ov `soll` über die Naht des Spieler-Baus
            // (spawnArchitecture mit Stempel, frisch: der Körper fällt vorher aus dem Cache)
            const amWerk = async (wort, ov, soll = ov) => {
                const { e, lg } = setze(wort, ov);
                if (!e) return { st: "ohneWerk", lg };
                const [p, aus, pos] = [r._foundryPresetForEntry(e), { ov: e.studioOv, lg }, { ...e.position }];
                const key = r._foundryKoerperKey(p, r._foundryGestaltFor(e, p), r._foundryServierStufe(p, 0), soll);
                const w = await bau(e);
                if (w === (fp0[wort] = fp0[wort] || (await bau(setze(wort).e)))) return { ...aus, st: "unbewegt" };
                r._foundryCacheEvict(key);
                const s = await bau(r.spawnArchitecture(e.type, pos, { seed: 7, precise: true, studioOv: soll }));
                return { ...aus, st: w && w === s ? "erreicht" : "zwilling" };
            };
            // je sagbares Rezept der Art, bis eines sich bewegt (der Rand fern vom Rezept-Wert) — eine tote Zeile der Werkstatt an einem
            const zeile = async (art, d) => {
                const rez = Object.keys(f.recipes).filter((id) => {
                    const bp = f.recipes[id].kind === art && r._studioBlueprintForWord(id);
                    return bp && r._foundryPresetForEntry({ type: bp }) === id;
                });
                let st = rez.length ? "unbewegt" : "ohneWort";
                for (const id of TOT.includes(art + ":" + d.id) ? rez.slice(0, 1) : rez) {
                    const v0 = (f.recipes[id].s || {})[d.id] ?? d.def;
                    if ((st = (await amWerk(id, { [d.id]: d.max - v0 >= v0 - d.min ? d.max : d.min })).st) !== "unbewegt") break;
                }
                return st;
            };
            for (const art of Object.keys(PBK))
                for (const d of PBK[art]) {
                    const st = await zeile(art, d);
                    k[st].push(art + ":" + d.id);
                    (k.je[art] = k.je[art] || [0, 0])[1]++;
                    k.je[art][0] += st === "erreicht";
                    k.zeilen++;
                }
            // SELBST-TEST: ein ov, das nicht ankommt — der Stempel verliert es (die alte Op) oder der Bau (angenommen, nie verbaut)
            k.taeter = {};
            for (const [nm, glied, falsch] of [
                ["Stempel", "_studioStampFor", function (n) { return P._studioStampFor.call(this, n); }],
                ["Bau", "_artifactStudioOv", () => null],
            ]) {
                r[glied] = falsch;
                k.taeter[nm] = await zeile("vehicle", PBK.vehicle[0]).finally(() => delete r[glied]);
            }
            // DIE KLEMME: ein Wert jenseits des Vertrags steht auf dem Rand (ganze Schritte gerundet), beim Namen im Log
            const soll = { W: 6, pitchDeg: 60, annexN: 2 };
            const kl = await amWerk("haus", { W: -3, pitchDeg: 75, annexN: 1.6 }, soll);
            const klLog = kl.lg.find((l) => l.event === "studio_regler_geklemmt") || { geklemmt: [] };
            k.klemme = { st: kl.st, ov: kl.ov, genannt: klLog.geklemmt.map((g) => `${g.id} ${g.von}→${g.auf}`) };
            k.klemme.ok = kl.st === "erreicht" && JSON.stringify(kl.ov) === JSON.stringify(soll) && k.klemme.genannt.length === 3;
            // FAIL-CLOSED: ein Regler ohne Zeile seiner Art, ein Wert ohne Zahl, ein ov ohne Objekt — nichts steht, der Name im Log
            for (const [nm, wort, ov, wer] of [
                ["fremd", "haus", { W: 9, quassel: 1 }, "quassel"],
                ["text", "haus", { W: "breit" }, "W"],
                ["liste", "haus", [1, 2], "[1,2]"],
                ["baum", "eiche", { height: 3 }, "height"],
            ]) {
                const { lg, neu } = setze(wort, ov);
                for (const e of neu) r.removeArchitecture(e);
                const ab = lg.find((l) => l.event === "studio_regler_abgelehnt");
                const erg = lg.find((l) => l.event === "ergebnis") || {};
                k.zu[nm] = !neu.length && !!ab && ab.regler.includes(wer) && (erg.gruende || {}).regler === 1;
            }
            // DER PROMPT liest DIESELBEN Zeilen (Mutation gewinnt): jede Zeile jeder sagbaren Art mit Bereich, eine eingespielte
            // Zeile erscheint im Prompt und trägt am Stempel
            const zeigt = (d) => `${d.id} ${d.lab} ${d.min}–${d.max}`;
            const sagbar = Object.keys(k.je).filter((art) => !k.ohneWort.some((n) => n.startsWith(art + ":")));
            k.prompt = sagbar.filter((art) => !PBK[art].every((d) => r.llmBuildSystemPrompt().includes(zeigt(d))));
            const probe = { id: "probeRegler", lab: "Probe", min: 0, max: 1, step: 0.1 };
            PBK.haus.push(probe);
            try {
                const { e } = setze("haus", { probeRegler: 0.5 });
                k.mutation = r.llmBuildSystemPrompt().includes(zeigt(probe)) && !!e && e.studioOv.probeRegler === 0.5;
                if (e) r.removeArchitecture(e);
            } finally {
                PBK.haus.pop();
            }
        } catch (e) {
            k.err = (e && e.stack) || String(e);
        }
        return res;
    }, TOT);

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
    check("auch der Schmiede-Guss stempelt (Konsum _forgeMaterialAndFreeze → _stampStudioOv)", out.g.schmiedeStempelt === true);

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
    check("Taille des eigenen Zweigs: ein kaputter Stempel fällt in Serialisierung und Laden", out.r.bpKaputt === true);
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
    check("der exakte Körper-Schlüssel (preset|gestalt|lod, ohne ov) lebt unverändert", out.b.plainKeyExact === true);
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

    console.log("\n=== (K) KI-REGLER — spawn_studio prägt ===");
    const K = out.k;
    const T = K.taeter || {};
    check(
        "SELBST-TEST: ein ov, das nicht ankommt (Stempel · Bau), ist ROT",
        ["Stempel", "Bau"].every((n) => T[n] && T[n] !== "erreicht"), // die Probe-Zeile (vehicle radstand) lebt
        K.err || JSON.stringify(T)
    );
    const anteil = K.zeilen ? (100 * K.erreicht.length) / K.zeilen : 0;
    check(
        `ERREICHT: ${K.erreicht.length} von ${K.zeilen} Zeilen von PARAMS_BY_KIND (${anteil.toFixed(1)} %) erreicht`,
        !K.err && !kiUrteil(K).length && anteil >= 50,
        `je Art ${Object.entries(K.je).map(([a, [e, n]]) => `${a} ${e}/${n}`).join(" · ")} (tot ${K.unbewegt.length}, ohne Wort ${K.ohneWort.length})` +
            (kiUrteil(K).length ? ` — ${kiUrteil(K).slice(0, 6).join(" · ")}` : "")
    );
    check("KLEMME: W -3 · pitchDeg 75 · annexN 1,6 → 6 · 60 · 2, benannt, gebaut wie das Studio-Werk", K.klemme && K.klemme.ok, JSON.stringify(K.klemme));
    check("FAIL-CLOSED: fremder Regler · Text · Liste · Art ohne Zeilen setzen nichts, benannt", ["fremd", "text", "liste", "baum"].every((n) => K.zu[n]), JSON.stringify(K.zu));
    check("PROMPT: jede Zeile jeder sagbaren Art mit Bereich, aus DERSELBEN Quelle (Mutation gewinnt)", K.prompt && !K.prompt.length && K.mutation === true, `fehlt: ${K.prompt} · Mutation ${K.mutation}`);

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
