#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-leistungs-vertrag.cjs — DER LEISTUNGS-VERTRAG (gate:leistungs-vertrag, 18.07.)
//
// Die Profi-Doktrin, Welle 5: die erkämpften Leistungs-Invarianten stehen als
// VERTRAG — keine künftige Welle kann sie still zurückstehlen (die gate:altlasten-
// Idee für die Laufzeit-Ökonomie). Vier Sätze + Selbsttest:
//   V1 STAND-CHURN NULL: Welt gesettelt, Spieler steht → 0 Gruppen-Mints über
//      das Fenster (der Grenzzyklus/Reap-Kreis bleibt tot).
//   V2 INGEST-TAKT: echte (nicht-headless) Request-Ergebnisse resolven NIE
//      synchron — der Loop-Tick gibt ≤3/Frame frei, in Ankunfts-Reihenfolge;
//      headless resolvt sofort (byte-schnelle Gates).
//   V3 GRUPPEN-STABILITÄT: im Stand wächst archInstanceGroups nicht monoton
//      (Reaper darf schrumpfen, nichts darf klettern).
//   V4 LINSEN-KONSUM: der gebaute Trace trägt bundleDeckung + ingestTakt +
//      gruppenChurn (die Mess-Flächen der Doktrin sind verdrahtet, nicht Deko).
//   SELBSTTEST: ein absichtlicher Mint+Dispose im Fenster MUSS die Churn-Zähler
//      bewegen — die Linse ist nicht blind.
//   node scripts/diag-leistungs-vertrag.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.LV_PORT || 4697);
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

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        const o = { err: null };
        try {
            const dl = performance.now() + 90000;
            while (
                (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < dl
            )
                await sleep(100);
            const r = window.anazhRealm,
                st = r.state;
            // Kurzes Boot-Settle, dann PRODUKTIONS-TREUES Regime: headless streamt
            // mit Radius=MAX endlos Welt (Boot-Mints ≠ Churn) — das Stand-Fenster
            // misst darum im GELÜFTETEN Regler-Regime (das regler-sim-Muster:
            // _isHeadlessNull ab, GPU-Anwender gestubbt, Über-Budget-Folds fahren
            // den Radius auf den Boden 70 m → die kleine Welt wird schnell FERTIG).
            for (let i = 0; i < 200; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (i % 15 === 0) await sleep(15);
            }
            const _oH0 = st.renderer._isHeadlessNull;
            const _oRS = r._applyRenderScale,
                _oSR = r._applyEffectiveShadowRange;
            st.renderer._isHeadlessNull = false;
            r._applyRenderScale = () => {};
            r._applyEffectiveShadowRange = () => {};
            const feed = (ms) => {
                st._perfFrame = {
                    render: 90,
                    streaming: 2,
                    waterIso: 1,
                    archCulling: 0.1,
                    creatures: 1,
                    physics: 1,
                    renderCalls: 1000,
                    renderTris: 12e6,
                };
                st._perfMarks = {};
                r._perfSenseFoldFrame(ms, ms / 1000);
            };
            for (let i = 0; i < 200; i++) feed(150); // Regler auf den Boden (Radius → 70)
            // Settle bis QUIESZENZ in DIESEM Regime (Batches à 100 Ticks, 2 ruhige in Folge):
            {
                const dlQ = performance.now() + 90000;
                let ruhigeBatches = 0;
                while (ruhigeBatches < 2 && performance.now() < dlQ) {
                    const mv = r._archGruppenMints || 0;
                    for (let i = 0; i < 100; i++) {
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {}
                        feed(150);
                        if (i % 20 === 0) await sleep(15);
                    }
                    ruhigeBatches = (r._archGruppenMints || 0) === mv ? ruhigeBatches + 1 : 0;
                }
                o.quieszent = ruhigeBatches >= 2;
            }
            // ── V1 + V3: STAND-FENSTER (Spieler steht, 400 Ticks im Regime) ──
            const mints0 = r._archGruppenMints || 0;
            const groups0 = st.archInstanceGroups ? st.archInstanceGroups.size : 0;
            let groupsMax = groups0;
            for (let i = 0; i < 400; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                feed(150);
                if (st.archInstanceGroups && st.archInstanceGroups.size > groupsMax)
                    groupsMax = st.archInstanceGroups.size;
                if (i % 25 === 0) await sleep(15);
            }
            o.standMints = (r._archGruppenMints || 0) - mints0;
            o.groups0 = groups0;
            o.groupsMax = groupsMax;
            o.groupsEnde = st.archInstanceGroups ? st.archInstanceGroups.size : 0;
            o.v1ChurnNull = o.standMints === 0;
            o.v3Stabil = groupsMax <= groups0; // stehen: nichts klettert (Reaper darf senken)
            // Regime zurück (die Gate-Hook-Lehre: sichern + wiederherstellen):
            st.renderer._isHeadlessNull = _oH0;
            r._applyRenderScale = _oRS;
            r._applyEffectiveShadowRange = _oSR;
            st._perfFrame = {};
            st._perfMarks = {};
            st.perfSense = null;
            r._perfSenseFoldFrame(8, 0.0167);
            // ── SELBSTTEST: die Churn-Linse ist nicht blind ──
            let bpName = null;
            for (const n in st.blueprints) {
                const fl = r._archFlattenBlueprint(n);
                if (fl && fl.instanceable && fl.leaves && fl.leaves.length) {
                    bpName = n;
                    break;
                }
            }
            if (bpName) {
                const mintsVor = r._archGruppenMints || 0;
                const slots = r._scatterInstanceAdd(bpName, 7000, 10, 7000, 0, 1, null, "888,888");
                if (slots) r._scatterFreeSlots(slots);
                o.selbsttestChurn = (r._archGruppenMints || 0) > mintsVor;
            } else o.selbsttestChurn = false;
            // ── V2: DER INGEST-TAKT (headless gelüftet = echte Takt-Semantik) ──
            const _oH = st.renderer._isHeadlessNull;
            st.renderer._isHeadlessNull = false;
            const reihenfolge = [];
            const fertig = [];
            for (let i = 0; i < 8; i++) {
                fertig.push(false);
                r._foundryIngestTakt(["payload" + i]).then(((idx) => () => {
                    fertig[idx] = true;
                    reihenfolge.push(idx);
                })(i));
            }
            await sleep(0); // Microtasks leeren — NICHTS darf schon durch sein
            o.v2KeineSofort = fertig.every((x) => x === false);
            st._frameOverBudget = false; // 3 Freigaben je Tick
            r._tickFoundryIngest();
            await sleep(0);
            o.v2NachTick1 = fertig.filter(Boolean).length; // erwartet 3
            r._tickFoundryIngest();
            r._tickFoundryIngest();
            await sleep(0);
            o.v2Alle = fertig.every(Boolean);
            o.v2Reihenfolge = reihenfolge.join(",") === "0,1,2,3,4,5,6,7";
            // Über-Budget-Frame: nur 1 Freigabe.
            r._foundryIngestTakt(["extra0"]).then(() => reihenfolge.push("e0"));
            r._foundryIngestTakt(["extra1"]).then(() => reihenfolge.push("e1"));
            await sleep(0);
            st._frameOverBudget = true;
            r._tickFoundryIngest();
            await sleep(0);
            o.v2UeberBudgetEins = reihenfolge.filter((x) => x === "e0" || x === "e1").length === 1;
            st._frameOverBudget = false;
            r._tickFoundryIngest();
            await sleep(0);
            // headless byte-schnell: sofort resolven.
            st.renderer._isHeadlessNull = true;
            let hlSofort = false;
            r._foundryIngestTakt(["hl"]).then(() => (hlSofort = true));
            await sleep(0);
            o.v2HeadlessSofort = hlSofort;
            st.renderer._isHeadlessNull = _oH;
            // ── V4: LINSEN-KONSUM im gebauten Trace ──
            const trace = r._flightRecorderBuildTrace ? r._flightRecorderBuildTrace() : null;
            const ss = trace && trace.steadyState;
            o.v4Linsen = !!(
                ss &&
                ss.bundleDeckung &&
                Number.isFinite(ss.bundleDeckung.deckungPct) &&
                ss.ingestTakt &&
                Number.isFinite(ss.ingestTakt.frei) &&
                ss.gruppenChurn &&
                Number.isFinite(ss.gruppenChurn.mints)
            );
            o.deckungPct = ss && ss.bundleDeckung ? ss.bundleDeckung.deckungPct : null;
        } catch (e) {
            o.err = (e && e.message) || String(e);
        }
        return o;
    });
    await browser.close();
    server.close();

    console.log("=== DER LEISTUNGS-VERTRAG — die Laufzeit-Ökonomie als Gate ===");
    console.log(`  V1 STAND-CHURN: Mints im Stand-Fenster = ${out.standMints} (erwartet 0)`);
    console.log(`  V3 GRUPPEN-STABILITÄT: ${out.groups0} → max ${out.groupsMax} → ${out.groupsEnde}`);
    console.log(
        `  V2 INGEST-TAKT: keineSofort=${out.v2KeineSofort} nachTick1=${out.v2NachTick1}/3 alle=${out.v2Alle} reihenfolge=${out.v2Reihenfolge} überBudget1=${out.v2UeberBudgetEins} headlessSofort=${out.v2HeadlessSofort}`
    );
    console.log(`  V4 LINSEN: verdrahtet=${out.v4Linsen} (bundleDeckung ${out.deckungPct}%)`);
    console.log(`  SELBSTTEST Churn-Linse feuert: ${out.selbsttestChurn}`);
    if (out.err) console.log(`  Fehler: ${out.err}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    const errs = [];
    if (out.err) errs.push("Vertrag brach ab: " + out.err);
    if (!out.v1ChurnNull) errs.push(`V1: ${out.standMints} Gruppen-Mints im Stand (Vertrag: 0)`);
    if (!out.v3Stabil) errs.push(`V3: archInstanceGroups kletterte im Stand (${out.groups0} → ${out.groupsMax})`);
    if (!out.v2KeineSofort) errs.push("V2: ein Takt-Ergebnis resolvte SYNCHRON (der Burst-Schutz ist tot)");
    if (out.v2NachTick1 !== 3) errs.push(`V2: Tick 1 gab ${out.v2NachTick1} frei (Vertrag: 3 unter Budget)`);
    if (!out.v2Alle) errs.push("V2: nicht alle Takt-Ergebnisse kamen durch (Verhungern)");
    if (!out.v2Reihenfolge) errs.push("V2: Freigaben NICHT in Ankunfts-Reihenfolge");
    if (!out.v2UeberBudgetEins) errs.push("V2: über Budget gab der Tick nicht exakt 1 frei");
    if (!out.v2HeadlessSofort) errs.push("V2: headless resolvte NICHT sofort (Gates würden kriechen)");
    if (!out.v4Linsen) errs.push("V4: die Mess-Flächen (bundleDeckung/ingestTakt/gruppenChurn) fehlen im Trace");
    if (!out.selbsttestChurn) errs.push("SELBSTTEST: die Churn-Linse zählte einen echten Mint NICHT (blind)");
    if (pageErrors.length) errs.push(`${pageErrors.length} Seiten-Fehler`);

    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER LEISTUNGS-VERTRAG STEHT: 0 Stand-Churn, der Ingest-Takt bündelt nie und verhungert nie (3/1 je Frame, Reihenfolge, headless sofort), die Gruppen klettern im Stand nicht, und die Mess-Flächen der Doktrin sind KONSUMIERT."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Leistungs-Vertrag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
