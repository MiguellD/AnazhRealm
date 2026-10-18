// diag-garage-labor.cjs — DIE LABOR-LINSE DER GARAGE (Welle L, Familie fahren), seit S1 ein MODUS DER WELT-ENGINE
// (`index.html?studio=garage`, worlds/garage/studio.js): die Werkstatt, wie der Schöpfer sie bedient — G1 maus+rad · G2 hud ·
// G3 tacho · G4 preset/regler · G5 kultur · G6 lehren · G7 kamera · G8 engine · G9 werk · G10 tor · G11 wort; je Täter eine Zeile
// der REGELN unten (mit ihrem Bruch für den Selbst-Test). Seiten- und Konsolenfehler richtet der EINE Sammler (welt-boot `melde`).
// Die Seite ist die Welt (Null-Renderer, Foundry an; die Bilder der Welt treibt die Probe), gezählt an der Seite selbst.
//   node scripts/diag-garage-labor.cjs [--selftest]          Port: GARAGE_LABOR_PORT (Standard 4414)
"use strict";
const { statikServer, starteBrowser, nullRenderer, warteAufWelt } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.GARAGE_LABOR_PORT || 4414);
const REGAL = /\/worlds\/[^/]+\/lib\//;
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── DAS LABOR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test): je Regel ihr Bruch (gegen GESUND nennt genau sie den Täter
// zuerst — der Selbst-Test fährt jede), ob sie rot ist, und der Täter beim Namen (je G das erste Wort) ──
const GESUND = { geladen: true, radSlot0: -1, radSlot1: -1, radZoom: true, hudDisplay: "flex", hudAbstand: 22, weltHud: [], tachoV: 10.5, tachoAnzeige: 38, presetLeck: [], reglerN: 30, reglerLeck: [] };
Object.assign(GESUND, { kulturAb: true, schilderFahrt: 0, schilderWerkstatt: 6, kamFuehrung: false, kamModus: "third", kamChase: true, regal: 0, revision: "184", iframes: 0, ebenenLeck: 0 });
Object.assign(GESUND, { werk: { typ: "fahrzeug_gt", marke: "garage" }, werkNeu: { radstand: 2.82, werke: 1, fahrGesetz: true, unikat: true, trisL1: 10512, deckelL1: 10600 }, tor: true, spiegel: "index.html?studio=garage", wort: true });
const neu = (o) => ({ werkNeu: Object.assign({}, GESUND.werkNeu, o) });
const REGELN = [
    [{ radSlot1: 6 }, (m) => m.radSlot1 !== m.radSlot0, (m) => `maus: das Rad schaltet die Hotbar der Welt (Platz ${m.radSlot0} → ${m.radSlot1})`],
    [{ radZoom: false }, (m) => m.radZoom !== true, (m) => `maus: das Rad zoomt die Werkstatt nicht (Abstand ${m.radAbstand})`],
    [{ hudDisplay: "block" }, (m) => m.hudDisplay !== "flex", (m) => `hud display ${m.hudDisplay}`],
    [{ hudAbstand: 0 }, (m) => !(m.hudAbstand >= 10), (m) => `hud Einheit klebt (${Math.round(m.hudAbstand)} px)`],
    [{ weltHud: ["hotbar", "fadenkreuz"] }, (m) => !!(m.weltHud && m.weltHud.length), (m) => `hud: das Spiel-HUD der Welt steht über der Werkstatt (${m.weltHud.join(", ")})`],
    [{ tachoV: 0 }, (m) => !(m.tachoV > 3), (m) => `tacho keine Fahrt (${(m.tachoV || 0).toFixed(1)} m/s)`],
    [{ tachoAnzeige: 126 }, (m) => m.tachoV > 3 && !(Math.abs(m.tachoAnzeige - m.tachoV * 3.6) <= 1), (m) => `tacho ${m.tachoAnzeige} bei ${(m.tachoV * 3.6).toFixed(1)} km/h`],
    [{ presetLeck: ["grip"] }, (m) => !!(m.presetLeck && m.presetLeck.length), (m) => `preset Leck ${m.presetLeck.join(",")}`],
    [[{ reglerLeck: ["springRate"] }, { reglerN: 0 }], (m) => !(m.reglerN > 0) || m.reglerLeck.length > 0, (m) => `regler ${m.reglerN || 0} Zeilen gelesen, Leck ${(m.reglerLeck || []).join(",")}`],
    [{ kulturAb: false }, (m) => m.kulturAb !== true, () => "kultur nicht abwählbar"],
    [{ schilderFahrt: 6 }, (m) => m.schilderFahrt !== 0, (m) => `lehren ${m.schilderFahrt} Schilder in der Probefahrt`],
    [{ schilderWerkstatt: 0 }, (m) => !(m.schilderWerkstatt > 0), () => "lehren fehlen in der Werkstatt (nach der Fahrt)"],
    [{ kamFuehrung: true }, (m) => m.kamFuehrung !== false, () => "kamera: in der Fahrt führt das Studio die Kamera (eine zweite Chase neben der Welt)"],
    [{ kamModus: "first" }, (m) => m.kamModus !== "third", (m) => `kamera: die Fahrt steht in ${m.kamModus} statt third`],
    [{ kamChase: false }, (m) => m.kamChase !== true, () => "kamera: am Werk lebt kein Zustand der EINEN chaseKamera"],
    [{ regal: 2, regalUrl: "/worlds/terrain/lib/three-r128.min.js" }, (m) => m.regal !== 0, (m) => `engine: ${m.regal} Anfragen auf worlds/*/lib/ (${m.regalUrl || ""})`],
    [{ revision: "128" }, (m) => m.revision !== "184", (m) => `engine: THREE.REVISION ${m.revision} statt 184`],
    [{ iframes: 1 }, (m) => m.iframes !== 0, (m) => `engine: ${m.iframes} iframe neben der Welt`],
    [{ werk: null }, (m) => !m.werk || m.werk.typ !== "fahrzeug_gt" || m.werk.marke !== "garage", (m) => `werk: kein Wagen der Welt (${JSON.stringify(m.werk)})`],
    [neu({ werke: 2 }), (m, w) => !(w.radstand > 0) || w.werke !== 1, (m, w) => `werk: der Regler-Zug baut kein neues Werk (${JSON.stringify(w)})`],
    [neu({ fahrGesetz: false }), (m, w) => w.fahrGesetz !== true, () => "werk: das Fahr-Gesetz der Welt liest die Prägung nicht (exportDrive ≠ exportDrive(P))"],
    [neu({ unikat: false }), (m, w) => w.unikat !== true, () => "werk: die Vorschau der Werkstatt trifft die Platte (kein Unikat je Regler-Stand)"],
    [neu({ trisL1: 10750 }), (m, w) => !(w.trisL1 <= w.deckelL1), (m, w) => `werk: die L1 des geprägten Werks reißt das Budget (${w.trisL1} > ${w.deckelL1})`],
    [{ ebenenLeck: 7 }, (m) => m.ebenenLeck !== 0, (m) => `werk: ${m.ebenenLeck} Stoffe der alten Ebenen bleiben nach dem Neubau liegen`],
    [{ tor: false, torGrund: "overlay true" }, (m) => m.tor !== true, (m) => `tor: das Garage-Tor öffnet den Modus nicht (${m.torGrund || "?"})`],
    [{ spiegel: "worlds/garage/index.html" }, (m) => m.spiegel !== "index.html?studio=garage", (m) => `tor: ein alter Spielstand zeigt auf ${m.spiegel} (die gefallene Shell, 404)`],
    [{ wort: false, wortGrund: "supersport → gt" }, (m) => m.wort !== true, (m) => `wort: die Wörter der Registry erreichen den Modus nicht (${m.wortGrund || "?"})`],
];
function laborVerdict(m) {
    if (!m || m.geladen !== true) return ["laden" + (m && m.grund ? ` (${m.grund})` : "")];
    const w = m.werkNeu || {};
    return REGELN.filter(([, rot]) => rot(m, w)).map(([, , t]) => t(m, w));
}

// ── DIE PROBE (Seiten-Kontext je Schritt; die Seite trägt index.html?studio=garage) ──
async function probe(page, anfragen) {
    const ev = (fn, ...a) => page.evaluate(fn, ...a);
    const warte = (fn, ms, ...a) => page.waitForFunction(fn, { timeout: ms, polling: 200 }, ...a).catch(() => {});
    const steht = () => { const z = window.__studioModi && window.__studioModi.garage && window.__studioModi.garage.zustand(); return z && z.aktiv && z.werk !== null && z.kommt === null && !!document.querySelector("#garage-studio"); };
    await warte(steht, 240000);
    if (!(await ev(steht))) return { geladen: false, grund: `der Modus steht nicht (${JSON.stringify(await ev(() => window.__studioModi && window.__studioModi.garage.zustand()))})` };
    const m = { geladen: true };
    // G4 (Teil): die Regler beim ersten Laden == das Modell; G8: Revision, iframes; G9: das Werk
    Object.assign(m, await ev(() => {
        const [g, zeilen] = [window.__studioModi.garage, [...document.querySelectorAll("#garage-sliders [data-regler]")]];
        const [P, e] = [g.zustand().P, g.werk()];
        const reglerLeck = zeilen.map((z) => [z.getAttribute("data-regler"), z.querySelector("input.h-eingabe")]).filter(([id, inp]) => inp && inp.type === "range" && Math.abs(parseFloat(inp.value) - P[id]) > Number(inp.step || 0.01) / 2).map(([id, inp]) => `${id} ${inp.value}≠${P[id]}`);
        return { reglerN: zeilen.length, reglerLeck, revision: String(window.THREE && window.THREE.REVISION), iframes: document.querySelectorAll("iframe").length, werk: e ? { typ: e.type, marke: e.studioOv && e.studioOv.__werk, id: e.id } : null };
    }));
    // G1: die Maus in der Werkstatt (Orbit-Zug über der Welt)
    const zug = async (dx) => {
        await page.mouse.move(640, 360);
        await page.mouse.down();
        for (let i = 0; i < 10; i++) await page.mouse.move(640 + i * dx, 360 + i * 2);
        await page.mouse.up();
    };
    await zug(8);
    // G1: das Rad über der Werkstatt zoomt den Orbit (ohne Zeit springt er auf sein Soll), die Hotbar der Welt bleibt; G2: kein Spiel-HUD
    const rad = () => ev(() => { const [r, cam] = [window.anazhRealm, new window.THREE.PerspectiveCamera()]; r._kameraFuehrung(cam, 0); const [p, bm] = [window.__studioModi.garage.werk().position, r.state.buildMode || {}]; return [+cam.position.distanceTo(new window.THREE.Vector3(p.x, p.y, p.z)).toFixed(2), typeof bm.slotIndex === "number" ? bm.slotIndex : -1]; });
    const [[d0, s0]] = [await rad(), await page.mouse.move(640, 360)];
    for (let i = 0; i < 3; i++) await page.mouse.wheel({ deltaY: 120 });
    const [d1, s1] = await new Promise((res) => setTimeout(res, 150)).then(rad);
    Object.assign(m, { radSlot0: s0, radSlot1: s1, radZoom: d1 > d0 + 0.05, radAbstand: `${d0} → ${d1} m`, weltHud: await ev(() => ["hotbar", "fadenkreuz", "stats-hud", "topbar"].filter((id) => { const e = document.getElementById(id); return !!e && getComputedStyle(e).display !== "none"; })) });
    // G9 (Teil): jeder eigene Stoff der Ebenen fällt mit dem Neubau (die geteilten des Kerns bleiben); die Dreiecke der L1 einer Prägung
    await ev(() => {
        const [VC, geteilt, st] = [window.__vehicleCore, new Set(Object.values(window.__vehicleCore.materials())), (window.__ebenenStoffe = [])];
        window.__l1 = (pid, ov) => { let n = 0; VC.buildInstance(pid, 1, 1, ov).traverse((o) => { const ge = o.isMesh && o.geometry; if (ge) n += (ge.index ? ge.index.count : ge.attributes.position.count) / 3; }); return Math.round(n); };
        window.__studioModi.garage.ebenen().traverse((o) => { const s = o.material; if (s && !geteilt.has(s) && !st.includes(s)) { st.push(s); s.addEventListener("dispose", () => (s.__weg = true)); } });
    });
    // G9: ein Regler-Zug (Radstand +0,12 m) baut ein neues Werk; das alte fällt, sobald das neue gezeichnet ist
    const soll = await ev(() => {
        const inp = document.querySelector('#garage-sliders [data-regler="radstand"] input.h-eingabe');
        inp.value = String(+(parseFloat(inp.value) + 0.12).toFixed(3));
        for (const art of ["input", "change"]) inp.dispatchEvent(new Event(art, { bubbles: true }));
        return +inp.value;
    });
    await warte((alt) => { const z = window.__studioModi.garage.zustand(); return z.werk !== null && z.werk !== alt && z.kommt === null; }, 120000, m.werk && m.werk.id);
    m.werkNeu = await ev((soll) => {
        const [r, VC, g] = [window.anazhRealm, window.__vehicleCore, window.__studioModi.garage];
        const e = g.werk();
        if (!e || !e.studioOv) return null;
        const fz = r._fahrzeugGesetzFor(e);
        const P = Object.assign({}, VC.PRESETS.gt.s, VC.PRESETS.gt.fx, e.studioOv);
        return {
            id: e.id,
            radstand: Math.abs(e.studioOv.radstand - soll) < 1e-6 ? e.studioOv.radstand : -1,
            werke: r.state.architectures.filter((a) => a.studioOv && a.studioOv.__werk === "garage").length,
            fahrGesetz: !!fz && JSON.stringify(fz.drive) === JSON.stringify(VC.exportDrive(P)),
            unikat: e._werkstatt === true,
            trisL1: window.__l1("gt", e.studioOv),
            deckelL1: VC.PORTAL_RENDER_CONFIG.lod.budget.vehicle[1].tris,
        };
    }, soll);
    m.ebenenLeck = await ev(() => (window.__ebenenStoffe || []).filter((s) => !s.__weg).length);
    // die Probefahrt (der Knopf → der Ritt der Welt); G1 die Maus in der Fahrt; G2 der HUD; G6 die Schilder der Ebenen
    await page.click("#garage-start");
    await warte(() => window.__studioModi.garage.zustand().modus === "fahren", 20000);
    await zug(-8);
    const schilder = () => ev(() => { let n = 0; const g = window.__studioModi.garage.ebenen(); if (g) g.traverseVisible((o) => (n += o.isSprite ? 1 : 0)); return n; });
    Object.assign(m, await ev(() => {
        const b = (s) => document.querySelector(`#garage-hud ${s}`).getBoundingClientRect();
        return { hudDisplay: getComputedStyle(document.getElementById("garage-hud")).display, hudAbstand: b(".keys").left - b(".u").right };
    }));
    m.schilderFahrt = await schilder();
    // G3: Gas (der Hörer der Welt), bis der Wagen fährt (> 3 m/s) — die Bilder der Welt sind die Uhr (der Null-Renderer treibt
    // keinen Loop: je Schritt EIN `_gameLoopTick`, höchstens 900); G7: wer die Kamera führt, im selben Bild
    const taste = (art) => ev((a) => window.dispatchEvent(new KeyboardEvent(a, { bubbles: true, key: "w", code: "KeyW" })), art);
    await taste("keydown");
    m.fahrBilder = await ev(() => {
        const [r, e] = [window.anazhRealm, window.__studioModi.garage.werk()];
        let [t, n] = [performance.now(), 0];
        for (; n < 900 && !(e && e._fahr && Math.abs(e._fahr.speed) > 3); n++) r._gameLoopTick((t += 1000 / 60));
        return n;
    });
    Object.assign(m, await ev(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const [r, e] = [window.anazhRealm, window.__studioModi.garage.werk()];
        const c = r.state._kamChase; // das Gedächtnis der Chase-Cam lebt mit ihrem Rig (F1 Wurzel 2)
        res({
            tachoAnzeige: parseInt(document.querySelector("#garage-spd").textContent, 10),
            tachoV: e && e._fahr ? Math.abs(e._fahr.speed) : 0,
            kamFuehrung: !!r._kameraFuehrung,
            kamModus: r.state.cameraMode,
            kamChase: !!c && Number.isFinite(c.az) && Number.isFinite(c.el),
        });
    })))));
    await taste("keyup");
    await page.keyboard.press("Escape"); // Esc gehört der Fahrt: zurück in die Werkstatt, die Lehren kehren zurück
    await warte(() => window.__studioModi.garage.zustand().modus === "werkstatt", 20000);
    m.schilderWerkstatt = await schilder();
    // G4/G5: Gattung und Kultur wechseln — P ist DEFAULT_P + Preset (+ die gewählte Kultur), ohne Rest
    Object.assign(m, await ev(() => {
        const VC = window.__vehicleCore;
        const knopf = (text) => [...document.querySelectorAll("#garage-ctl button")].find((b) => b.textContent === text);
        const soll = (pid, kid) => Object.assign({}, VC.DEFAULT_P, VC.presetPatch(pid), kid ? VC.CULTURES[kid].fx : {});
        const leck = (s) => {
            const ist = window.__studioModi.garage.zustand().P;
            return [...new Set([...Object.keys(s), ...Object.keys(ist)])].filter((k) => s[k] !== ist[k]);
        };
        const presetLeck = [];
        knopf(VC.PRESETS.supersport.lab).click();
        knopf(VC.PRESETS.gt.lab).click();
        presetLeck.push(...leck(soll("gt", null)));
        knopf(VC.CULTURES.toro.lab).click();
        knopf(VC.PRESETS.limousine.lab).click();
        presetLeck.push(...leck(soll("limousine", "toro")));
        const trisL1Kultur = window.__l1("limousine", window.__studioModi.garage.zustand().P); // die geprägte Gattung mit Kultur
        knopf(VC.CULTURES.toro.lab).click(); // zweiter Klick: ab
        return { presetLeck, trisL1Kultur, kulturAb: leck(soll("limousine", null)).length === 0 && !knopf(VC.CULTURES.toro.lab).classList.contains("on") };
    }));
    if (m.werkNeu) m.werkNeu.trisL1 = Math.max(m.werkNeu.trisL1, m.trisL1Kultur); // G9: das Budget der L1 gilt jeder Prägung
    // G11: die Wörter der Registry über den Chat der Welt (der EINE Weg des Spielers): Gattung, probefahrt, werkstatt
    Object.assign(m, await ev(async () => {
        const [r, z, ci] = [window.anazhRealm, () => window.__studioModi.garage.zustand(), document.getElementById("chat-input")], b = ci.getBoundingClientRect(), frei = b.width > 0 && document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) === ci; // das Eingabefeld sichtbar, nicht verdeckt
        const sag = async (w, fn) => { r.processChatCommand(w); for (const dl = performance.now() + 20000; !fn() && performance.now() < dl; ) await new Promise((res) => setTimeout(res, 50)); return fn(); };
        const gattung = (await sag("supersport", () => z().kommt === null)) && z().presetId;
        const [fahrt, zurueck] = [await sag("probefahrt", () => z().modus === "fahren"), await sag("werkstatt", () => z().modus === "werkstatt")];
        const ok = frei && gattung === "supersport" && fahrt && zurueck;
        return { wort: ok, wortGrund: ok ? null : `Eingabe ${frei ? "frei" : "verdeckt"} · supersport → ${gattung} · probefahrt ${fahrt} · werkstatt ${zurueck}` };
    }));
    // G10: Esc verlässt den Modus; das Garage-Tor der Welt öffnet ihn wieder — in der Welt, ohne iframe; ein alter Spielstand auch
    m.spiegel = await ev(() => window.anazhRealm._sanitizePortalMeta({ world: "worlds/garage/index.html" }, "Garage").world);
    await page.keyboard.press("Escape");
    Object.assign(m, await ev(async () => {
        const [r, g] = [window.anazhRealm, window.__studioModi.garage];
        if (g.zustand().aktiv) return { tor: false, torGrund: "Esc verlässt den Modus nicht" };
        // das Tor der Welt (am Genesis-Ring; steht der Spieler fern, setzt die Probe eines vor ihn — derselbe Bauplan welt_garage)
        const p = r.state.playerMesh.position;
        const tor = r.state.architectures.find((a) => a && a.type === "welt_garage") || r.spawnArchitecture("welt_garage", { x: p.x + 6, y: p.y, z: p.z }, { silent: true });
        if (!tor) return { tor: false, torGrund: "kein Garage-Tor in der Welt (der Bauplan welt_garage steht nicht)" };
        const ein = r.enterPortal(tor);
        for (const dl = performance.now() + 60000; !g.zustand().aktiv && performance.now() < dl; ) await new Promise((res) => setTimeout(res, 100));
        const ok = !!(ein && ein.ok) && g.zustand().aktiv && !document.getElementById("portal-overlay") && !r._portalOverlay;
        g.verlassen();
        return { tor: ok, torGrund: ok ? null : `enterPortal ${JSON.stringify(ein)} · aktiv ${g.zustand().aktiv} · overlay ${!!r._portalOverlay}` };
    }));
    const regal = anfragen.filter((u) => REGAL.test(u));
    return Object.assign(m, { regal: regal.length, regalUrl: (regal[0] || "").replace(/^https?:\/\/[^/]+/, ""), anfragen: anfragen.length });
}

(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Labor-Linse nennt jeden Täter des Befunds — je Regel ihr Bruch ===");
        check("Selbst-Test 0: gesundes Labor == 0 Täter", laborVerdict(GESUND).length === 0, laborVerdict(GESUND).join(" · "));
        for (const [bruch, , text] of REGELN)
            for (const b of [].concat(bruch)) {
                const [f, v] = [Object.assign({}, GESUND, b), laborVerdict(Object.assign({}, GESUND, b))];
                check(`Selbst-Test: ${JSON.stringify(b).slice(0, 70)} → ${v[0]}`, v[0] === text(f, f.werkNeu || {}), v.join(" · "));
            }
        console.log(errs.length ? "\n❌ SELBST-TEST ROT — die Linse ist vakuös." : "\n✅ SELBST-TEST GRÜN — die Labor-Linse nennt jeden Täter G1–G11 beim Namen.");
        process.exit(errs.length ? 1 : 0);
    }
    const server = statikServer({ start: "/index.html" });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await nullRenderer(page, { foundry: true });
    const anfragen = [];
    // die Anfragen der SEITE (ein Worker hat keinen Rahmen: der Foundry-Worker der Welt zieht r128 über cores.manifest.json lib —
    // der letzte Schritt von S1, gezählt und benannt, nicht der Garage zugerechnet)
    const worker = [];
    page.on("request", (q) => (q.frame() ? anfragen : worker).push(q.url()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html?studio=garage`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await warteAufWelt(page, 180000);
    const m = await probe(page, anfragen);
    m.workerRegal = worker.filter((u) => REGAL.test(u)).length;
    await browser.close();
    server.close();
    console.log("=== G — DIE GARAGE ALS MODUS DER WELT-ENGINE (index.html?studio=garage, Null-Renderer, Foundry an) ===");
    const v = laborVerdict(m);
    const hat = (w) => !v.some((t) => t.startsWith(w));
    if (!m.geladen) check("der Modus steht", false, m.grund);
    else {
        check("G1 Maus ziehen und Rad in Werkstatt und Probefahrt: das Rad zoomt, die Hotbar der Welt steht", hat("maus"), `Rad ${m.radAbstand}, Hotbar ${m.radSlot0} → ${m.radSlot1}`);
        check("G2 der Fahr-HUD ist ein Flex-Band, das Spiel-HUD der Welt weicht der Werkstatt", hat("hud"), `display ${m.hudDisplay} · Abstand ${Math.round(m.hudAbstand)} px · Welt-HUD sichtbar: ${(m.weltHud || []).join(", ") || "keins"}`);
        check("G3 der Tacho zeigt km/h (×3,6 aus FAHR.kmh)", hat("tacho"), `Anzeige ${m.tachoAnzeige} bei ${((m.tachoV || 0) * 3.6).toFixed(1)} km/h nach ${m.fahrBilder} Bildern`);
        check("G4 P == DEFAULT_P + Preset + Kultur, Regler == Modell", hat("preset") && hat("regler"), `${m.reglerN} Regler · ${[...m.presetLeck, ...m.reglerLeck].slice(0, 4).join(" · ") || "kein Leck"}`);
        check("G5 die Kultur lässt sich abwählen (zweiter Klick)", hat("kultur"));
        check("G6 kein Lehren-Schild in der Fahrt, in der Werkstatt sind sie zurück", hat("lehren"), `Fahrt ${m.schilderFahrt} · Werkstatt ${m.schilderWerkstatt}`);
        check("G7 die Probefahrt fährt die Kamera der Welt (Third, die EINE chaseKamera am Werk)", hat("kamera"), `Führung ${m.kamFuehrung ? "Studio" : "Welt"} · ${m.kamModus} · chaseKamera ${m.kamChase ? "lebt" : "fehlt"}`);
        check("G8 EINE Engine: 0 Anfragen auf worlds/*/lib/, THREE r184, kein iframe", hat("engine"), `${m.regal} von ${m.anfragen} Anfragen der Seite im Regal (Foundry-Worker der Welt: ${m.workerRegal}) · REVISION ${m.revision} · ${m.iframes} iframe`);
        const wn = m.werkNeu || {};
        check("G9 das Werk ist ein Wagen der Welt, der Regler baut es neu (Unikat, im Budget, ohne Stoff-Rest), das Fahr-Gesetz liest die Prägung", hat("werk"), `${m.werk && m.werk.typ} #${m.werk && m.werk.id} → #${wn.id} (${wn.werke} Werk) · L1 ${wn.trisL1} ≤ ${wn.deckelL1} · Unikat ${wn.unikat} · ${m.ebenenLeck} Stoff-Rest`);
        check("G10 das Garage-Tor öffnet den Modus in der Welt (kein iframe), ein alter Spielstand auch", hat("tor"), m.torGrund || `Spiegel → ${m.spiegel}`);
        check("G11 die Wörter der Registry erreichen den Modus über den Chat (Gattung, probefahrt, werkstatt)", hat("wort"), m.wortGrund || "");
    }
    console.log(errs.length ? `\n❌ ROT — ${v.join(" · ")}` : "\n✅ GRÜN — die Garage als Modus der Welt-Engine: G1–G11.");
    process.exit(errs.length ? 1 : 0);
})().catch((e) => {
    console.error("Garage-Labor-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
