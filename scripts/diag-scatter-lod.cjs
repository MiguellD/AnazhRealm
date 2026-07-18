// diag-scatter-lod.cjs — V18.464 DER FERNWALD FOLGT DER LIVE-DISTANZ (baum-D1/D2).
// Beweist im echten Boot (foundry-ON, Null-Renderer), dass die Scatter-Stufen
// NICHT mehr auf der Bau-Zeit-Distanz eingefroren sind:
//
//   L (LOD-Tick): nach einem Spieler-Sprung wandern die Zellen-Stufen — eine
//     vormals nahe Zelle (lod 0/1) wird nach dem Weg-Sprung per _tickScatterLod
//     auf die Fernstufe re-alloziert (cell.lod folgt, Slots getauscht, Bilanz
//     dicht: alte Slots frei, neue leben).
//   H (Hysterese): ein zweiter Tick OHNE Bewegung realloziert NICHTS mehr
//     (der Chooser ist zustands-stabil — kein Flacker-Churn).
//   P (Promotion über Region-Grenzen): der Promotions-Kreis (promoteM) liest
//     jetzt ALLE geschnittenen Regionen — der 2×2-Fächer um den Spieler wird
//     abgedeckt (Quell-Probe: der Block walkt rx0..rx1/rz0..rz1, nicht nur
//     die Home-Region).
//   F (V18.474 — DIE DRAW-CALL-DIÄT DER FERN-GRUPPEN): platzierte Fern-Leaves
//     (Impostor-Quads) über ein 4×4-Region-Raster, A/B durch DIESELBE Pipe:
//     S=1 (per-Region-Keying, die V18.300/V18.303-Welt) vs S=SCATTER_FERN_
//     SUPERREGION (Super-Region). Erwartung ≥4× weniger lod2-Gruppen, Slot-
//     Bilanz dicht (Empty-Dispose räumt beide Welten restlos), und die EINE
//     Key-Funktion (_archFernRegionKey) ist der einzige Konstanten-Leser.
//
//   node scripts/diag-scatter-lod.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SCATTER_LOD_PORT || 4441);
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
    // ── P: die Quell-Probe (der Promotions-Block walkt den Region-Fächer) ──
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const promoIdx = src.indexOf("baum-D2-Heilung");
    const promoBlock = promoIdx >= 0 ? src.slice(promoIdx, promoIdx + 1800) : "";
    check(
        "P: der Promotions-Block walkt ALLE geschnittenen Regionen (rx0..rx1 × rz0..rz1)",
        /rx0/.test(promoBlock) && /rz1/.test(promoBlock) && /_promoteScatterCell/.test(promoBlock)
    );
    // ── F (Quelle): EIN Keying-Chokepoint, kein zweiter Ableitungs-Ort ──
    // Die Konstante hat GENAU fünf Code-Vorkommen: Definition + der eine ABLEITUNGS-
    // Leser in _archFernRegionKey + drei RADIUS-Leser in _archRegionBundleFor (T3 —
    // die analytische Bundle-Cull-Kugel einer Super-Region skaliert mit S; sie LIEST
    // die Konstante, LEITET aber keinen Key ab). Die Ableitungs-Einzigkeit prüft die
    // eigene Probe darunter: der `s:`-Super-Key wird an GENAU EINER Stelle gebaut.
    // (Probe gewandert in DAS FELD URTEILT [das-feld-zeichnet §2 Stufe 1]: vorkommen
    // war schon VOR der Welle 5 — der T3-Kugel-Konsum fehlte der Zählung.)
    const fernConstUses = (src.match(/AnazhRealm\.SCATTER_FERN_SUPERREGION/g) || []).length;
    const fernDeriveSites = (src.match(/\+ "s:" \+/g) || []).length;
    const gfIdx = src.indexOf("_archInstanceGroupFor(name, leafIdx, leaf, regionKey) {");
    // 8000 Zeichen: der Granularitäts-Kollaps-Block (V18.491.7) sitzt zwischen
    // Keying und Batch-Zweig — das Fenster muss BEIDE Anker tragen.
    const gfHead = gfIdx >= 0 ? src.slice(gfIdx, gfIdx + 8000) : "";
    check(
        "F(Quelle): SCATTER_FERN_SUPERREGION hat genau 5 Code-Vorkommen (Definition + _archFernRegionKey + 3 T3-Kugel-Radius-Leser)",
        fernConstUses === 5 && src.includes("_archFernRegionKey(name, leaf, regionKey) {"),
        `vorkommen=${fernConstUses}`
    );
    check(
        "F(Quelle): der `s:`-Super-Key wird an GENAU EINER Stelle abgeleitet (_archFernRegionKey)",
        fernDeriveSites === 1,
        `ableitungen=${fernDeriveSites}`
    );
    check(
        "F(Quelle): der Keying-Chokepoint mappt VOR dem Batch-Zweig (_archFernRegionKey zuerst)",
        gfHead.indexOf("this._archFernRegionKey(") >= 0 &&
            gfHead.indexOf("this._archFernRegionKey(") < gfHead.indexOf("_archBatchGroupFor")
    );

    await new Promise((r) => server.listen(PORT, r));
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

    const out = await page.evaluate(async () => {
        const res = { boot: false };
        const dl0 = performance.now() + 90000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._tickScatterLod !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        if (!r) return res;
        res.boot = true;
        const f = r._ensureAssetFoundry();
        const dl1 = performance.now() + 60000;
        while (performance.now() < dl1) {
            if (f && f.ready) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        // Scatter-Regionen um den Spieler bauen lassen (der Streaming-Tick baut 1/Frame).
        const pm = r.state.playerMesh.position;
        const dl2 = performance.now() + 45000;
        let cells = 0;
        while (performance.now() < dl2) {
            r._tickScatterStreaming(pm);
            const map = r.state.scatterRegions;
            cells = 0;
            if (map) for (const reg of map.values()) cells += reg.cells ? reg.cells.length : 0;
            if (cells > 40) break;
            await new Promise((r2) => setTimeout(r2, 30));
        }
        res.cells = cells;
        if (!cells) return res;
        // Eine lebende Zelle suchen (Schicht-agnostisch — der Tick trägt alle
        // Schichten; im Null-Renderer deferrieren Baum-Fernstufen [kein RTT] →
        // meist proben wir eine Grammatik-Schicht, derselbe Chokepoint).
        // DAS FELD URTEILT (das-feld-zeichnet §2 Stufe 1): die Probe MUSS eine
        // Zelle wählen, die der B2-Guard des Ticks WANDERN LÄSST — Zellen mit
        // region-PRIVATEN Slots (`@regX,regZ`, nicht `@s:`-Super-Region) gehören
        // BY DESIGN dem Region-Lifecycle (V18.464-B2; seit der Keying-Welle trägt
        // JEDE Stufe der Boden-Schichten den Region-Key). Vorher war die Wahl
        // flake-abhängig: je nach Foundry-Timing probte sie eine geschützte
        // Boden-Zelle und maß den Guard statt des Wanderns.
        const map = r.state.scatterRegions;
        const b2Privat = (c) =>
            Array.isArray(c.slots) &&
            c.slots.some((s) => {
                if (!s || typeof s.key !== "string") return false;
                const at = s.key.indexOf("@");
                return at >= 0 && !(s.key.startsWith("@s:", at) || s.key.startsWith("@p:s:", at));
            });
        const sucheProbe = (nurNah) => {
            for (const reg of map.values()) {
                for (const c of reg.cells || []) {
                    if (c.slots && c.bpName && !b2Privat(c) && (!nurNah || c.lod < 2)) return c;
                }
            }
            return null;
        };
        // BEVORZUGT eine NAHE Zelle (lod<2 → Weg-Sprung auf die vorgewärmte
        // Fernstufe); IM FOUNDRY-REGIME ist diese Population fast leer (innerM 64:
        // dn = raw·min(12/visH,1) < 15.4 verlangte visH ≥ ~50 m — die alten
        // „lod 0"-Funde waren STUFEN-GEKLEMMTE Arten [Blume/Fels: requested 2,
        // serviert ff.lod=0], deren „Wandern" nur der bpName-identische
        // Hysterese-Quittieren-Pfad war; seit DAS FELD URTEILT sind sie region-
        // privat + B2-geschützt). Kurz warten, dann die NAH-Richtung an einer
        // echten Fern-Baum-Zelle proben — der STÄRKERE Beweis (echter Slot-Tausch).
        let probe = null;
        const dlP = performance.now() + 10000;
        while (!probe && performance.now() < dlP) {
            probe = sucheProbe(true);
            if (probe) break;
            r._tickScatterStreaming(pm);
            await new Promise((r2) => setTimeout(r2, 60));
        }
        if (!probe) probe = sucheProbe(false);
        res.probeGefunden = !!probe;
        if (!probe) return res;
        const lodVorher = probe.lod;
        const bpVorher = probe.bpName;
        const slotsVorher = JSON.stringify(probe.slots);
        // ── L: der Spieler springt — nahe Zelle: WEIT weg (Stufe steigt);
        //       ferne Zelle: NAH heran (Stufe sinkt). Nah-Ziel 20 m: die
        //       Wahrnehmungs-Distanz dn ≤ raw (min(12/visH,1) ≤ 1) ⇒ raw 20 <
        //       thresh12 − hysteresis = 22.6 ⇒ der Abstieg 2→1 ist für JEDE
        //       Sichthöhe garantiert (das alte Ziel 30 lag für visH ≤ 12-
        //       Subjekte AUSSERHALB des Abstiegs-Bandes — nie abgedeckt, weil
        //       die Nah-Richtung vor der Keying-Welle nie gewählt wurde). ──
        const dx = probe.x - pm.x;
        const dz = probe.z - pm.z;
        const d0 = Math.hypot(dx, dz);
        const naeher = lodVorher >= 2;
        const ziel = naeher ? 20 : 340;
        pm.x = probe.x - (dx / (d0 || 1)) * ziel;
        pm.z = probe.z - (dz / (d0 || 1)) * ziel;
        // Der Wander-Loop YIELDET deadline-basiert: der Zellen-Chokepoint lässt
        // bei ladendem Ziel-Asset die alte Stufe stehen (ctxNoDefer — „Retry in
        // der nächsten Runde"); ein rein synchroner Loop könnte den async
        // Foundry-Stufen-Bau nie ankommen sehen (die Nah-Richtung 2→1/0 wäre
        // strukturell unmöglich). Dieselbe 30-s-Warte-Disziplin wie der
        // F-Block (Flat lädt async, 100-ms-Polls).
        let wandel = 0;
        const dlW = performance.now() + 45000;
        while (!wandel && performance.now() < dlW) {
            for (let i = 0; i < 40 && !wandel; i++) {
                r._tickScatterLod(pm, 8, 400);
                if (probe.lod !== lodVorher) wandel = 1;
            }
            if (!wandel) await new Promise((r2) => setTimeout(r2, 150));
        }
        res.l = {
            lodVorher,
            lodNachher: probe.lod,
            gewandert: wandel === 1 && (naeher ? probe.lod < lodVorher : probe.lod > lodVorher),
            // Stufen-GEKLEMMTE Arten (bpName über die Stufen identisch) tauschen
            // BEWUSST keine Slots (Review-Fix B2 — kein Churn); nur ein echter
            // Gestalt-Wechsel (bpName anders) muss die Slots re-allozieren.
            bpGewechselt: probe.bpName !== bpVorher,
            slotsGetauscht: JSON.stringify(probe.slots) !== slotsVorher,
            slotsLeben: Array.isArray(probe.slots) && probe.slots.length > 0,
        };
        // ── H: erst die Sprung-Adaption DRÄNIEREN (alle Zellen wandern auf die
        //       neue Distanz), dann: ohne Bewegung realloziert der Tick NICHTS
        //       mehr (Hysterese stabil, kein Flacker-Churn) ──
        let leer = 0;
        for (let i = 0; i < 600 && leer < 3; i++) {
            leer = r._tickScatterLod(pm, 16, 800) === 0 ? leer + 1 : 0;
        }
        let re = 0;
        for (let i = 0; i < 40; i++) re += r._tickScatterLod(pm, 16, 800);
        res.h = { nachlauf: re, drainiert: leer >= 3 };
        // ── D (V18.485 — DIE RÜCK-WANDERUNG, der B2-Einweg-Freeze fällt): eine
        //     private Boden-Zelle (@reg-Slots, lod<2) demotet auf die Fern-Stufe,
        //     sobald der Spieler geht — Slots wandern nach @s:, die private Hülle
        //     leert sich und wird ge-reapt (die EINE Reap-Frage); der Ursprungs-
        //     Sphere-Hazard fiel mit der positions-erbenden Null-Skala. Probe
        //     NUR an ZWEI-stufigen Arten (strauch/eiche) — geklemmte Arten
        //     (Blume/Fels) quittieren bewusst ohne Slot-Tausch. ──
        const dblk = {};
        try {
            const zweiStufig = (c) =>
                typeof c.bpName === "string" &&
                (c.bpName.startsWith("fscatter:strauch:") || c.bpName.startsWith("fscatter:eiche:"));
            let dz2 = null;
            const dlD = performance.now() + 30000;
            while (!dz2 && performance.now() < dlD) {
                for (const reg of map.values()) {
                    for (const c of reg.cells || []) {
                        if (c.slots && c.bpName && c.lod < 2 && b2Privat(c) && zweiStufig(c)) {
                            dz2 = c;
                            break;
                        }
                    }
                    if (dz2) break;
                }
                if (!dz2) {
                    r._tickScatterStreaming(pm);
                    r._tickScatterLod(pm, 8, 800);
                    await new Promise((r2) => setTimeout(r2, 60));
                }
            }
            dblk.zelleGefunden = !!dz2;
            if (dz2) {
                dblk.lodVor = dz2.lod;
                dblk.bpVor = dz2.bpName;
                const privat = (k) => {
                    const at = k.indexOf("@");
                    return at >= 0 && !(k.startsWith("@s:", at) || k.startsWith("@p:s:", at));
                };
                const privKeysVor = dz2.slots.map((s) => s.key).filter(privat);
                dblk.privateSlotsVor = privKeysVor.length;
                // Spieler geht: weit weg von der Zelle, aber unter der 480-m-
                // Tick-Grenze (outerM + 96) — die Rück-Wanderung muss greifen.
                pm.x = dz2.x + 420;
                pm.z = dz2.z;
                let dWandel = 0;
                const dlW2 = performance.now() + 45000;
                while (!dWandel && performance.now() < dlW2) {
                    for (let i = 0; i < 40 && !dWandel; i++) {
                        r._tickScatterLod(pm, 8, 800);
                        if (dz2.lod === 2) dWandel = 1;
                    }
                    if (!dWandel) await new Promise((r2) => setTimeout(r2, 150));
                }
                dblk.demotet = dz2.lod === 2;
                dblk.slotsFern =
                    Array.isArray(dz2.slots) &&
                    dz2.slots.length > 0 &&
                    dz2.slots.every((s) => {
                        const at = s.key.indexOf("@");
                        return at >= 0 && (s.key.startsWith("@s:", at) || s.key.startsWith("@p:s:", at));
                    });
                // die private Hülle: ge-reapt (weg) oder restlos leer
                dblk.huelleWeg = privKeysVor.every((k) => {
                    const g = r.state.archInstanceGroups && r.state.archInstanceGroups.get(k);
                    return !g || (g.liveCount | 0) === 0;
                });
                // Null-Skala erbt die Position: kein Slot einer lebenden privaten
                // Gruppe darf eine Ursprungs-Translation tragen (Sphere-Hazard).
                let ursprungsHazard = 0;
                if (r.state.archInstanceGroups) {
                    for (const [k, g] of r.state.archInstanceGroups) {
                        if (!privat(k) || !g.mesh || g.kind === "batch" || !g.mesh.instanceMatrix) continue;
                        const arr = g.mesh.instanceMatrix.array;
                        for (let sl = 0; sl < g.next; sl++) {
                            const o = sl * 16;
                            const skala0 = arr[o] === 0 && arr[o + 5] === 0 && arr[o + 10] === 0;
                            const amUrsprung = arr[o + 12] === 0 && arr[o + 13] === 0 && arr[o + 14] === 0;
                            if (skala0 && amUrsprung) ursprungsHazard++;
                        }
                    }
                }
                dblk.ursprungsHazard = ursprungsHazard;
            }
        } catch (e) {
            dblk.err = String(e && e.message);
        }
        res.d = dblk;
        // ── F (V18.474 — DIE DRAW-CALL-DIÄT DER FERN-GRUPPEN): A/B durch DIESELBE Pipe ──
        // Platzierte Impostor-Quads (strauch-Fernstufe, headless = Silhouetten-Fallback,
        // derselbe Chokepoint) über ein 4×4-Region-Raster: S=1 reproduziert das alte
        // per-Region-Keying (VORHER), die Produktions-Konstante keyt SUPER-REGIONEN
        // (NACHHER). Zählung = region-gekeyte Fern-Wrapper (+ Batches); danach Remove →
        // die Empty-Dispose muss BEIDE Welten restlos räumen (Slot-Bilanz dicht).
        const fern = {};
        try {
            const AR = r.constructor; // die Klasse (Statics) — window trägt nur die Instanz
            const S0 = AR.SCATTER_FERN_SUPERREGION;
            fern.s0 = S0;
            // Unit: die EINE Key-Funktion — fern+Region → Super-Region; nicht-fern/null/gemappt unberührt.
            fern.unit =
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, "p:7,9") ===
                    "p:s:" + Math.floor(7 / S0) + "," + Math.floor(9 / S0) &&
                r._archFernRegionKey("fscatter:eiche:3:2", {}, "5,5") ===
                    "s:" + Math.floor(5 / S0) + "," + Math.floor(5 / S0) &&
                r._archFernRegionKey("busch_hazel", { leafKey: "f:strauch|1|1|summer:0" }, "p:7,9") === "p:7,9" &&
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, null) === null &&
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, "p:s:1,2") === "p:s:1,2";
            // Das strauch-Impostor-Flat über die ECHTE Pipe ziehen (LOD1-Subjekt lädt async).
            let flat = null;
            const dlF = performance.now() + 30000;
            while (performance.now() < dlF) {
                flat = r._foundryFlattenFor({ seed: 7 }, "strauch", 2);
                if (flat && flat.instanceable) break;
                await new Promise((r2) => setTimeout(r2, 100));
            }
            fern.flat = !!(flat && flat.instanceable && flat.lod === 2);
            if (fern.flat) {
                const R = AR.ARCH_REGION_M;
                const zaehle = () => {
                    let w = 0,
                        b = 0;
                    for (const k of r.state.archInstanceGroups.keys()) if (k.includes("@") && k.includes("#fimp:")) w++;
                    if (r.state.archBatches) for (const k of r.state.archBatches.keys()) if (k.includes("@")) b++;
                    return { w, b };
                };
                const welt = (S) => {
                    AR.SCATTER_FERN_SUPERREGION = S;
                    const vor = zaehle();
                    const entries = [];
                    for (let gx = 0; gx < 4; gx++)
                        for (let gz = 0; gz < 4; gz++) {
                            const e = {
                                type: "busch_hazel",
                                seed: 7,
                                scale: 1,
                                position: { x: (900 + gx) * R + 8, y: 0, z: (900 + gz) * R + 8 },
                            };
                            r._archInstanceAdd(e, flat);
                            entries.push(e);
                        }
                    const mit = zaehle();
                    for (const e of entries) r._archInstanceRemove(e);
                    const nach = zaehle();
                    return { gruppen: mit.w - vor.w, batches: mit.b - vor.b, leck: nach.w - vor.w };
                };
                const a = welt(1); // VORHER: per-Region (die V18.300/V18.303-Welt)
                const b = welt(S0); // NACHHER: Super-Region (Produktions-Konstante)
                AR.SCATTER_FERN_SUPERREGION = S0;
                fern.vorher = a.gruppen;
                fern.nachher = b.gruppen;
                fern.batchesVorher = a.batches;
                fern.batchesNachher = b.batches;
                fern.leckA = a.leck;
                fern.leckB = b.leck;
            }
        } catch (e) {
            fern.err = String((e && e.message) || e);
        }
        res.f = fern;
        return res;
    });

    console.log("=== V18.464 SCATTER-LOD — der Fernwald folgt der LIVE-Distanz ===");
    check("Boot + Scatter-Zellen gebaut", out.boot && out.cells > 40, `zellen=${out.cells}`);
    check("Probe-Zelle gefunden", out.probeGefunden === true);
    if (out.l) {
        check(
            `L: die Stufe WANDERT nach dem Weg-Sprung (${out.l.lodVorher} → ${out.l.lodNachher})`,
            out.l.gewandert === true
        );
        check(
            "L: Slots re-alloziert bei Gestalt-Wechsel (bzw. bewusst behalten bei geklemmter Art)",
            out.l.slotsLeben && (out.l.bpGewechselt ? out.l.slotsGetauscht : !out.l.slotsGetauscht),
            `bpGewechselt=${out.l.bpGewechselt} getauscht=${out.l.slotsGetauscht}`
        );
    } else check("L: LOD-Block erreicht", false);
    if (out.h)
        check(
            "H: nach der Sprung-Adaption kein Realloc-Churn (Hysterese stabil)",
            out.h.drainiert === true && out.h.nachlauf === 0,
            `nachlauf=${out.h.nachlauf} drainiert=${out.h.drainiert}`
        );
    else check("H: Hysterese-Block erreicht", false);
    if (out.d) {
        check(
            "D: private Boden-Zelle GEFUNDEN (B2-Population, zwei-stufig)",
            out.d.zelleGefunden === true,
            out.d.err || `bp=${out.d.bpVor || "—"} lodVor=${out.d.lodVor}`
        );
        if (out.d.zelleGefunden) {
            check(
                "D: DIE RÜCK-WANDERUNG — die Zelle demotet auf die Fern-Stufe, sobald der Spieler geht",
                out.d.demotet === true,
                `lod ${out.d.lodVor} → ${out.d.demotet ? 2 : "blieb"}`
            );
            check(
                "D: die Slots wandern nach @s: (Super-Region), die private Hülle leert/reapt",
                out.d.slotsFern === true && out.d.huelleWeg === true,
                `slotsFern=${out.d.slotsFern} hülleWeg=${out.d.huelleWeg} (private Slots vor: ${out.d.privateSlotsVor})`
            );
            check(
                "D: kein Ursprungs-Sphere-Hazard (Null-Skala erbt die Position)",
                out.d.ursprungsHazard === 0,
                `hazard-Slots=${out.d.ursprungsHazard}`
            );
        }
    } else check("D: Rück-Wanderungs-Block erreicht", false);
    if (out.f) {
        check(
            "F: die EINE Fern-Key-Funktion (Unit: fern→Super-Region, nicht-fern/null/gemappt unberührt)",
            out.f.unit === true,
            out.f.err || ""
        );
        check("F: strauch-Impostor-Flat über die echte Pipe (lod=2)", out.f.flat === true, out.f.err || "");
        check(
            `F: DIE DIÄT — 4×4 Regionen: per-Region ${out.f.vorher} → Super-Region ${out.f.nachher} Fern-Gruppen (≥4× weniger)`,
            Number.isFinite(out.f.vorher) &&
                Number.isFinite(out.f.nachher) &&
                out.f.vorher >= 16 &&
                out.f.nachher >= 1 &&
                out.f.vorher >= 4 * out.f.nachher,
            `batches ${out.f.batchesVorher}→${out.f.batchesNachher} · S=${out.f.s0}`
        );
        check(
            "F: Slot-Bilanz dicht — die Empty-Dispose räumt BEIDE Welten restlos",
            out.f.leckA === 0 && out.f.leckB === 0,
            `leckA=${out.f.leckA} leckB=${out.f.leckB}`
        );
    } else check("F: Fern-Diät-Block erreicht", false);
    check("keine Page-Errors während der Probe", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));

    await browser.close();
    server.close();
    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Scatter-Stufen folgen der LIVE-Distanz (Re-Allokation über den EINEN Zellen-Chokepoint, Hysterese churn-frei), die Promotion liest den ganzen Region-Fächer, und die Fern-Gruppen tragen die Super-Region-Diät (EIN Keying-Chokepoint, Bilanz dicht)."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    server.close();
    process.exit(1);
});
