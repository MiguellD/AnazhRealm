// diag-studio-begehen.cjs — DAS STUDIO-DORF IN DER WELT (gate:studio-begehen; seit S1-b ein MODUS DER WELT-ENGINE,
// `index.html?studio=fachwerk`, worlds/fachwerk/studio.js). Bis S1-b prüfte die Linse die Pfade des eigenen Labors (buildDorf ·
// promoteB · demoteB · walkUpdate: Hülle je Haus, Tür, Treppe, Keller-Decke, Weltgrund, Antike) — diese Täter fielen mit ihm: das
// Dorf des Studios IST der Siedlungs-Akt der Welt, sein Gang der Gang der Welt. Geprüft wird, wie der Schöpfer das Studio
// bedient — F1 steht · F2 engine · F3 wort · F4 stadt · F5 abbau · F6 tor · F7 heim; je Täter eine Zeile der REGELN (mit ihrem
// Bruch für den Selbst-Test). Die Seite ist die Welt (Null-Renderer, Foundry an).
//   node scripts/diag-studio-begehen.cjs [--selftest]          Port: STUDIO_BEGEHEN_PORT (Standard 4473)
"use strict";
const { statikServer, starteBrowser, nullRenderer, warteAufWelt } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.STUDIO_BEGEHEN_PORT || 4473);
const REGAL = /\/worlds\/[^/]+\/lib\//;
const STADT = { seed: 3, nH: 18, epoche: "mittelalter" }; // die Stadt mit Mauer (städtisch vor 1750, schon mit 18 Häusern)
const DORF = { seed: 3, nH: 18, epoche: "gruenderzeit" }; // das Dorf ohne Mauer (Gründerzeit, 1836)
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── DAS VERDIKT (pure Funktion; Probe UND Selbst-Test): je Regel ihr Bruch, ob sie rot ist, der Täter beim Namen ──
const GESUND = { geladen: true, werk: { typ: "haus_fraenkisch", marke: "fachwerk" }, regal: 0, revision: "184", iframes: 0, tor: true, spiegel: "index.html?studio=fachwerk" };
Object.assign(GESUND, { wort: { kultur: "tudor", typ: "haus_tudor", modus: "dorf" }, stadt: { placed: 80, mauer: 22, streifen: 52, wirft: true }, heim: { weg: 0.2, sichtbar: true } });
Object.assign(GESUND, { abbau: { rest: 0, erdbau: false, zelle: false, mauerN: 0, wirft: false, placed: 15 } });
const J = (o) => JSON.stringify(o);
const REGELN = [
    [{ werk: { typ: "fahrzeug_gt", marke: "garage" } }, (m) => !/^haus_/.test((m.werk || {}).typ) || m.werk.marke !== "fachwerk", (m) => `steht: das Werk ist kein Haus des Fachwerks (${J(m.werk)})`],
    [{ regal: 1, regalUrl: "/worlds/terrain/lib/three-r128.min.js" }, (m) => m.regal !== 0, (m) => `engine: ${m.regal} Anfragen auf worlds/*/lib/ (${m.regalUrl || ""})`],
    [[{ revision: "128" }, { iframes: 1 }], (m) => m.revision !== "184" || m.iframes !== 0, (m) => `engine: three r${m.revision}, ${m.iframes} iframe`],
    [{ wort: { kultur: "fraenkisch", typ: "haus_fraenkisch", modus: "haus" } }, ({ wort: w = {} }) => w.kultur !== "tudor" || w.typ !== "haus_tudor" || w.modus !== "dorf", (m) => `wort: tudor · dorf erreichen den Modus nicht (${J(m.wort)})`],
    [{ stadt: { placed: 0, mauer: 22, streifen: 52, wirft: true } }, ({ stadt: s = {} }) => !(s.placed > 0), (m) => `stadt: die Welt stellt keine Stadt (${J(m.stadt)})`],
    [[{ stadt: { placed: 80, mauer: 0, streifen: 0, wirft: false } }, { stadt: { placed: 80, mauer: 22, streifen: 0, wirft: false } }], ({ stadt: s = {} }) => !(s.mauer > 0 && s.streifen > 0 && s.wirft), (m) => `stadt: die Welt zeichnet keine Stadtmauer (${J(m.stadt)})`],
    [[{ abbau: { rest: 7, erdbau: false, zelle: false, mauerN: 0, wirft: false, placed: 15 } }, { abbau: { rest: 0, erdbau: true, zelle: true, mauerN: 52, wirft: true, placed: 15 } }], ({ abbau: a = {} }) => a.rest !== 0 || a.erdbau || a.zelle || a.mauerN !== 0 || a.wirft || !(a.placed > 0), (m) => `abbau: das Dorf ersetzt die Stadt nicht ganz (${J(m.abbau)})`],
    [[{ tor: false, torGrund: "kein Tor" }, { spiegel: "worlds/skeleton/index.html" }], (m) => m.tor !== true || m.spiegel !== "index.html?studio=fachwerk", (m) => `tor: ${m.torGrund || "Spiegel → " + m.spiegel}`],
    [[{ heim: { weg: 1600, sichtbar: true } }, { heim: { weg: 0.2, sichtbar: false } }], ({ heim: h = {} }) => !(h.weg < 1) || h.sichtbar !== true, (m) => `heim: nach dem Studio steht der Spieler nicht am Tor (${J(m.heim)})`],
];
const verdikt = (m) => (!m || m.geladen !== true ? ["laden" + (m && m.grund ? ` (${m.grund})` : "")] : REGELN.filter(([, rot]) => rot(m)).map(([, , t]) => t(m)));

// ── DIE PROBE (Seiten-Kontext; die Seite trägt index.html?studio=fachwerk) ──
async function probe(page, anfragen) {
    const ev = (fn, ...a) => page.evaluate(fn, ...a);
    const steht = () => { const z = window.__studioModi && window.__studioModi.fachwerk && window.__studioModi.fachwerk.zustand(); return z && z.aktiv && z.werk !== null && z.kommt === null; };
    await page.waitForFunction(steht, { timeout: 240000, polling: 200 }).catch(() => {});
    if (!(await ev(steht))) return { geladen: false, grund: `der Modus steht nicht (${J(await ev(() => window.__studioModi && window.__studioModi.fachwerk && window.__studioModi.fachwerk.zustand())).slice(0, 200)})` };
    // F1 · F2: das Werk ist ein Haus der Welt mit der Marke des Studios; Revision und iframes
    const m = Object.assign({ geladen: true }, await ev(() => { const e = window.__studioModi.fachwerk.werk(); return { werk: { typ: e.type, marke: e.studioOv && e.studioOv.__werk }, revision: String(window.THREE && window.THREE.REVISION), iframes: document.querySelectorAll("iframe").length, heim0: window.anazhRealm.state.playerMesh.position.toArray() }; }));
    // F3: die Wörter über den Chat der Welt (der EINE Weg des Spielers) · F4: die Stadt mit Mauer · F5: das Dorf ersetzt sie ganz
    Object.assign(m, await ev(async (STADT, DORF) => {
        const [r, g] = [window.anazhRealm, window.__studioModi.fachwerk];
        const z = () => g.zustand();
        const bis = async (fn, ms) => { for (const dl = performance.now() + ms; !fn() && performance.now() < dl; ) await new Promise((res) => setTimeout(res, 50)); return fn(); };
        const vorWerk = g.werk();
        r.processChatCommand("tudor");
        await bis(() => z().kommt === null && z().kultur === "tudor" && g.werk() !== vorWerk, 60000);
        const [kultur, typ] = [z().kultur, (g.werk() || {}).type];
        r.processChatCommand("dorf");
        await bis(() => z().modus === "dorf", 20000);
        const wort = { kultur, typ, modus: z().modus };
        const wm = () => r.state.worldMeta || {};
        const marken = () => [new Set(r.state.architectures), Object.values(wm().erdbau || {}), Object.values(wm().settlementCells || {})]; // je Wert (derselbe Same am selben Ort trägt denselben Schlüssel)
        await bis(() => z().kommt === null, 240000); // das Dorf, das der Modus-Wechsel baute
        const [w0, e0, c0] = marken();
        await g.dorf(STADT);
        const P = r.state.stlZaun;
        const s0 = z().dorf || {};
        const stadt = { placed: s0.placed || 0, mauer: s0.mauer || 0, streifen: (P && P.mauerN) || 0, wirft: !!(P && P.mesh.castShadow) };
        const [w1, e1, c1] = marken(); // was die Stadt stellte — nach dem Dorf steht davon nichts mehr
        await g.dorf(DORF);
        const [w2, e2, c2] = marken();
        const neu = (a, b) => a.filter((k) => !b.includes(k));
        const abbau = { rest: [...w1].filter((e) => !w0.has(e) && w2.has(e) && e !== g.werk()).length, erdbau: neu(e1, e0).some((k) => e2.includes(k)), zelle: neu(c1, c0).some((k) => c2.includes(k)), mauerN: (P && P.mauerN) || 0, wirft: !!(P && P.mesh.castShadow), placed: z().dorf ? z().dorf.placed : 0 };
        return { wort, stadt, abbau };
    }, STADT, DORF));
    // F6 · F7: Esc verlässt den Modus (der Spieler zurück am Tor, sichtbar); das Fachwerk-Tor öffnet ihn wieder, ein alter Spielstand auch
    m.spiegel = await ev(() => window.anazhRealm._sanitizePortalMeta({ world: "worlds/fachwerk/index.html" }, "Fachwerk").world);
    await page.keyboard.press("Escape");
    Object.assign(m, await ev(async (h0) => {
        const [r, g] = [window.anazhRealm, window.__studioModi.fachwerk];
        const [pm, tor0] = [r.state.playerMesh, r.state.architectures.find((a) => a && a.type === "welt_fachwerk")];
        const p = pm.position;
        const heim = { weg: g.zustand().aktiv ? -1 : +Math.hypot(p.x - h0[0], p.z - h0[2]).toFixed(2), sichtbar: pm.visible };
        if (g.zustand().aktiv) return { heim, tor: false, torGrund: "Esc verlässt den Modus nicht" };
        const tor = tor0 || r.spawnArchitecture("welt_fachwerk", { x: p.x + 6, y: p.y, z: p.z }, { silent: true });
        if (!tor) return { heim, tor: false, torGrund: "kein Fachwerk-Tor in der Welt (der Bauplan welt_fachwerk steht nicht)" };
        const ein = r.enterPortal(tor);
        for (const dl = performance.now() + 60000; !g.zustand().aktiv && performance.now() < dl; ) await new Promise((res) => setTimeout(res, 100));
        const ok = !!(ein && ein.ok) && g.zustand().aktiv && !document.getElementById("portal-overlay") && !r._portalOverlay;
        g.verlassen();
        return { heim, tor: ok, torGrund: ok ? null : `enterPortal ${JSON.stringify(ein)} · aktiv ${g.zustand().aktiv} · overlay ${!!r._portalOverlay}` };
    }, m.heim0));
    const regal = anfragen.filter((u) => REGAL.test(u));
    return Object.assign(m, { regal: regal.length, regalUrl: (regal[0] || "").replace(/^https?:\/\/[^/]+/, ""), anfragen: anfragen.length });
}

(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse nennt jeden Täter des Fachwerk-Modus — je Regel ihr Bruch ===");
        check("Selbst-Test 0: gesunder Modus == 0 Täter", verdikt(GESUND).length === 0, verdikt(GESUND).join(" · "));
        for (const [bruch, , text] of REGELN)
            for (const b of [].concat(bruch)) {
                const [f, v] = [Object.assign({}, GESUND, b), verdikt(Object.assign({}, GESUND, b))];
                check(`Selbst-Test: ${J(b).slice(0, 70)} → ${v[0]}`, v[0] === text(f), v.join(" · "));
            }
        console.log(errs.length ? "\n❌ SELBST-TEST ROT — die Linse ist vakuös." : "\n✅ SELBST-TEST GRÜN — die Linse nennt jeden Täter F1–F7 beim Namen.");
        process.exit(errs.length ? 1 : 0);
    }
    const server = statikServer({ start: "/index.html" });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await nullRenderer(page, { foundry: true });
    const [anfragen, worker] = [[], []]; // die Anfragen der SEITE; der Foundry-Worker zieht r128 (S1 letzter Schritt, nicht dieses Studio)
    page.on("request", (q) => (q.frame() ? anfragen : worker).push(q.url()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html?studio=fachwerk`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await warteAufWelt(page, 180000);
    const m = await probe(page, anfragen);
    m.workerRegal = worker.filter((u) => REGAL.test(u)).length;
    await browser.close();
    server.close();
    console.log("=== F — DAS FACHWERK ALS MODUS DER WELT-ENGINE (index.html?studio=fachwerk, Null-Renderer, Foundry an) ===");
    const v = verdikt(m);
    const hat = (w) => !v.some((t) => t.startsWith(w));
    if (!m.geladen) check("der Modus steht", false, m.grund);
    else {
        check("F1 das Werk ist ein Haus der Welt mit der Marke des Studios", hat("steht"), `${m.werk.typ} · ${m.werk.marke}`);
        check("F2 EINE Engine: 0 Anfragen auf worlds/*/lib/, THREE r184, kein iframe", hat("engine"), `${m.regal} von ${m.anfragen} Anfragen der Seite im Regal (Foundry-Worker: ${m.workerRegal}) · REVISION ${m.revision} · ${m.iframes} iframe`);
        check("F3 die Wörter der Registry erreichen den Modus über den Chat (tudor · dorf)", hat("wort"), J(m.wort));
        check("F4 die Stadt mit Mauer steht in der Welt (der Plan trägt sie, der Bau-Pool zeichnet sie und wirft)", hat("stadt"), J(m.stadt));
        check("F5 ein neuer Stand ersetzt die Stadt ganz (Werke, Erdbau, Gedächtnis, Mauer-Streifen)", hat("abbau"), J(m.abbau));
        check("F6 das Fachwerk-Tor öffnet den Modus in der Welt (kein iframe), ein alter Spielstand auch", hat("tor"), m.torGrund || `Spiegel → ${m.spiegel}`);
        check("F7 nach dem Studio steht der Spieler wieder am Tor, sichtbar", hat("heim"), J(m.heim));
    }
    console.log(errs.length ? `\n❌ ROT — ${v.join(" · ")}` : "\n✅ GRÜN — das Fachwerk als Modus der Welt-Engine: F1–F7.");
    process.exit(errs.length ? 1 : 0);
})().catch((e) => {
    console.error("Fachwerk-Modus-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
