// diag-reload-treue.cjs — RELOAD-TREUE (V18.478): DIE KREATUR KEHRT WIE GEGOSSEN WIEDER.
// Der benannte V18.477-Richter-Befund [mittel]: Kreatur-Snapshots trugen soul/bodySize, aber
// KEINE Guss-Dials — nach dem Reload goss spawnCreatureAt ALLE Kreaturen aus der AKTUELLEN
// Studio-Übergabe: eine vormals klein gegossene Gattung wurde groß, sobald der Schöpfer die
// Übergabe später änderte. Jetzt friert der GUSS die wirksame Übergabe je Wesen ein
// (group.userData.gussDials — nur wenn eine aktiv war, sonst feld-los + byte-alt), der Snapshot
// trägt sie, und der Restore pinnt sie durch DENSELBEN Validator (Kreatur-PARAMS-Clamps) als
// dialsOv in den Neu-Guss. Diese Linse hält die Naht:
//
//   (R) GUSS-TREUE: Wolf unter Übergabe size 3.5 gegossen → Snapshot → Übergabe auf 1.5 GEÄNDERT
//       → Restore ⇒ der Wolf trägt WEITER 3.5 (Guss-Treue), ein FRISCHER Wolf trägt 1.5.
//   (S) SELBST-TEST (nicht vakuös): OHNE den Guss-Pin (gussDials aus dem Snap gestrippt) liest
//       der Restore die aktuelle Übergabe (1.5) — d. h. der alte Fehler wird sichtbar.
//   (D) DEFAULT-TREUE: eine Kreatur OHNE Übergabe reist feld-los (kein gussDials) + byte-alt.
//   (W) WAND: ein hand-editierter Riesen-Dial im Snapshot wird am Restore-Validator geclampt.
//
//   node scripts/diag-reload-treue.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.RELOAD_TREUE_PORT || 4459);
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
    console.log("=== RELOAD-TREUE — Quell-Proben (der Guss-Pin lebt im Stamm) ===");
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    check(
        "Q: spawnCreatureAt reicht opts.dialsOv in den Guss (Restore-Pin)",
        /const gussOv = opts\.dialsOv && typeof opts\.dialsOv === "object" \? opts\.dialsOv : null;/.test(stamm) &&
            /this\._buildCreatureGroup\(chosenSoul, gussOv \? \{ dialsOv: gussOv \} : undefined\)/.test(stamm)
    );
    check(
        "Q: der Guss friert die wirksame Übergabe ein (group.userData.gussDials, nur wenn aktiv)",
        /group\.userData\.gussDials = JSON\.parse\(JSON\.stringify\(eff\)\);/.test(stamm)
    );
    check(
        "Q: _serializeCreature trägt gussDials (plain object oder undefined)",
        /gussDials:\s*\n\s*ud\.gussDials && typeof ud\.gussDials === "object"/.test(stamm)
    );
    check(
        "Q: der Restore validiert die Guss-Dials durch DENSELBEN Kreatur-Validator",
        /this\._studioUebergabeValidate\("kreatur", \{ gattung: recIdR, s: snap\.gussDials \}\)/.test(stamm)
    );

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
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const res = { r: {}, s: {}, d: {}, w: {} };
        const dl0 = performance.now() + 150000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._restoreCreatureFromSnapshot !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        while (performance.now() < dl0) {
            if (f && f.ready && f.recipes && f.recipes.wolf && !f._prefetching) break;
            await sleep(120);
        }
        if (!(f && f.ready && f.recipes && f.recipes.wolf)) return { fatal: "wolf-Rezept kam nie" };

        // Leere Bühne + genug Kapazität.
        for (const c of r.state.creatures.slice()) r.removeCreature(c);
        r.state.maxCreatures = 12;
        // Geometrie-Fingerabdruck (position-Attribute des NAH-Templates).
        const fnv = (h, arr) => {
            const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
            for (let i = 0; i < u8.length; i++) {
                h ^= u8[i];
                h = Math.imul(h, 0x01000193);
            }
            return h >>> 0;
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
        const setUe = (size) => {
            r._studioUebergabeEmpfang({ kind: "kreatur", gattung: "wolf", s: { size } });
        };
        const spawnWolf = (opts) =>
            r.spawnCreatureAt(0, 40, 0, "happy", "wolf", Object.assign({ precise: true, bodySize: 1 }, opts || {}));

        // ── Übergabe size 3.5 → Wolf A gegossen ──
        setUe(3.5);
        const wolfA = spawnWolf();
        res.r.aGussDials = wolfA && wolfA.userData.gussDials ? wolfA.userData.gussDials.size : null;
        const fpA = wolfA ? fpGroup(wolfA) : null;
        const snapA = r._serializeCreature(wolfA);
        res.r.snapTraegt = !!(snapA && snapA.gussDials && snapA.gussDials.size === 3.5);
        r.removeCreature(wolfA);

        // ── Übergabe auf 1.5 ÄNDERN ──
        setUe(1.5);
        // ein FRISCHER Wolf trägt jetzt 1.5
        const wolfNeu = spawnWolf();
        res.r.neuGussDials = wolfNeu && wolfNeu.userData.gussDials ? wolfNeu.userData.gussDials.size : null;
        const fpNeu = wolfNeu ? fpGroup(wolfNeu) : null;
        r.removeCreature(wolfNeu);

        // ── Restore aus snapA ⇒ MUSS 3.5 tragen (Guss-Treue), NICHT 1.5 ──
        const wolfR = r._restoreCreatureFromSnapshot(snapA, "happy");
        res.r.restoreGussDials = wolfR && wolfR.userData.gussDials ? wolfR.userData.gussDials.size : null;
        const fpR = wolfR ? fpGroup(wolfR) : null;
        res.r.treu = res.r.restoreGussDials === 3.5;
        res.r.geomTreu = fpR && fpA && fpR === fpA && fpA !== fpNeu; // die Geometrie folgt der GUSS-Größe
        res.r.fpA = fpA;
        res.r.fpNeu = fpNeu;
        res.r.fpR = fpR;
        r.removeCreature(wolfR);

        // ── (S) SELBST-TEST: OHNE den Pin liest der Restore die aktuelle Übergabe (1.5) ──
        const snapOhne = Object.assign({}, snapA);
        delete snapOhne.gussDials;
        const wolfS = r._restoreCreatureFromSnapshot(snapOhne, "happy");
        res.s.ohnePin = wolfS && wolfS.userData.gussDials ? wolfS.userData.gussDials.size : null;
        // ohne Pin: gussDials wird aus der AKTUELLEN Übergabe (1.5) eingefroren ⇒ der alte Fehler
        res.s.altFehlerSichtbar = res.s.ohnePin === 1.5;
        if (wolfS) r.removeCreature(wolfS);

        // ── (D) DEFAULT-TREUE: keine Übergabe ⇒ feld-los + byte-alt ──
        r.state.studioUebergabe = { koerper: null, kreatur: {} };
        const wolfD = spawnWolf();
        res.d.feldLos = !(wolfD && wolfD.userData.gussDials);
        const snapD = r._serializeCreature(wolfD);
        res.d.snapFeldLos = !!(snapD && snapD.gussDials === undefined);
        r.removeCreature(wolfD);

        // ── (W) WAND: ein Riesen-Dial im Snapshot wird am Restore geclampt ──
        const rows = window.__tetrapodaCore && window.__tetrapodaCore.PARAMS_BY_KIND.kreatur;
        const sizeRow = rows && rows.find((x) => x.id === "size");
        const snapBoese = Object.assign({}, snapA, { gussDials: { size: 9999 } });
        const wolfW = r._restoreCreatureFromSnapshot(snapBoese, "happy");
        res.w.geclampt = !!(
            wolfW &&
            wolfW.userData.gussDials &&
            sizeRow &&
            wolfW.userData.gussDials.size <= sizeRow.max &&
            wolfW.userData.gussDials.size >= sizeRow.min
        );
        res.w.maxSoll = sizeRow ? sizeRow.max : null;
        res.w.istWert = wolfW && wolfW.userData.gussDials ? wolfW.userData.gussDials.size : null;
        if (wolfW) r.removeCreature(wolfW);

        return res;
    });

    await browser.close();
    server.close();

    console.log("\n===== RELOAD-TREUE — die Kreatur kehrt wie gegossen wieder =====\n");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?");
        process.exit(1);
    }
    check(`(R) Wolf A unter Übergabe 3.5 gegossen (gussDials=${out.r.aGussDials})`, out.r.aGussDials === 3.5);
    check("(R) der Snapshot trägt die Guss-Dials (3.5)", out.r.snapTraegt === true);
    check(
        `(R) ein FRISCHER Wolf nach der Änderung trägt 1.5 (gussDials=${out.r.neuGussDials})`,
        out.r.neuGussDials === 1.5
    );
    check(
        `(R) GUSS-TREUE: der restaurierte Wolf trägt WEITER 3.5, nicht 1.5 (${out.r.restoreGussDials})`,
        out.r.treu === true
    );
    check(
        `(R) und die GEOMETRIE folgt der Guss-Größe (fpR==fpA≠fpNeu: ${out.r.fpR} == ${out.r.fpA} ≠ ${out.r.fpNeu})`,
        out.r.geomTreu === true
    );
    check(
        `(S) SELBST-TEST: OHNE den Pin läse der Restore die aktuelle Übergabe (1.5) — der alte Fehler ist sichtbar (${out.s.ohnePin})`,
        out.s.altFehlerSichtbar === true
    );
    check("(D) DEFAULT-TREUE: eine Kreatur ohne Übergabe ist feld-los (kein gussDials)", out.d.feldLos === true);
    check("(D) und ihr Snapshot trägt das Feld nicht (byte-alt)", out.d.snapFeldLos === true);
    check(
        `(W) ein Riesen-Dial (9999) im Snapshot wird am Restore geclampt (≤ ${out.w.maxSoll}, ist ${out.w.istWert})`,
        out.w.geclampt === true
    );
    check("kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Reload-Treue steht: der Guss friert die wirksame Übergabe je Wesen ein, der Snapshot trägt sie, der Restore pinnt sie durch DENSELBEN Validator — die Kreatur kehrt wie gegossen wieder (auch wenn die Übergabe sich änderte), Default-Kreaturen bleiben byte-alt, und ein Riesen-Dial wird geclampt."
    );
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
