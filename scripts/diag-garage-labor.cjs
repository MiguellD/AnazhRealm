// diag-garage-labor.cjs — DIE LABOR-LINSE DER GARAGE (Welle L, Familie fahren), seit S1 ein MODUS DER WELT-ENGINE
// (`index.html?studio=garage`, worlds/garage/studio.js): die Werkstatt, wie der Schöpfer sie bedient. Je G der Täter (F-D9, S1):
//   G1 maus — Seitenfehler je Mauszug · G2 hud — kein Flex-Band · G3 tacho — ×12 statt ×3,6 (FAHR.kmh) · G4 preset/regler — P ≠
//   DEFAULT_P + Preset + Kultur · G5 kultur — nicht abwählbar · G6 lehren — Schilder in der Fahrt · G7 kamera — eine zweite Chase
//   (der alten Shell) statt der EINEN chaseKamera der Welt · G8 engine — r128 aus worlds/*/lib/, eigener Renderer, iframe · G9 werk —
//   kein Wagen der Welt, der Regler baut nicht neu, das Fahr-Gesetz liest die Prägung nicht · G10 tor — das Tor öffnet ein iframe.
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

// ── DAS LABOR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test): die Täter beim Namen, je G das erste Wort ──
function laborVerdict(m) {
    if (!m || m.geladen !== true) return ["laden" + (m && m.grund ? ` (${m.grund})` : "")];
    const w = m.werkNeu || {};
    const regeln = [
        [m.mausFehler !== 0, `maus ${m.mausFehler} Seitenfehler`],
        [m.hudDisplay !== "flex", `hud display ${m.hudDisplay}`],
        [!(m.hudAbstand >= 10), `hud Einheit klebt (${Math.round(m.hudAbstand)} px)`],
        [!(m.tachoV > 3), `tacho keine Fahrt (${(m.tachoV || 0).toFixed(1)} m/s)`],
        [m.tachoV > 3 && !(Math.abs(m.tachoAnzeige - m.tachoV * 3.6) <= 1), `tacho ${m.tachoAnzeige} bei ${(m.tachoV * 3.6).toFixed(1)} km/h`],
        [!!(m.presetLeck && m.presetLeck.length), `preset Leck ${(m.presetLeck || []).join(",")}`],
        [!(m.reglerN > 0) || m.reglerLeck.length > 0, `regler ${m.reglerN || 0} Zeilen gelesen, Leck ${(m.reglerLeck || []).join(",")}`],
        [m.kulturAb !== true, "kultur nicht abwählbar"],
        [m.schilderFahrt !== 0, `lehren ${m.schilderFahrt} Schilder in der Probefahrt`],
        [!(m.schilderWerkstatt > 0), "lehren fehlen in der Werkstatt (nach der Fahrt)"],
        [m.kamFuehrung !== false, "kamera: in der Fahrt führt das Studio die Kamera (eine zweite Chase neben der Welt)"],
        [m.kamModus !== "third", `kamera: die Fahrt steht in ${m.kamModus} statt third`],
        [m.kamChase !== true, "kamera: am Werk lebt kein Zustand der EINEN chaseKamera"],
        [m.regal !== 0, `engine: ${m.regal} Anfragen auf worlds/*/lib/ (${m.regalUrl || ""})`],
        [m.revision !== "184", `engine: THREE.REVISION ${m.revision} statt 184`],
        [m.iframes !== 0, `engine: ${m.iframes} iframe neben der Welt`],
        [!m.werk || m.werk.typ !== "fahrzeug_gt" || m.werk.marke !== "garage", `werk: kein Wagen der Welt (${JSON.stringify(m.werk)})`],
        [!(w.radstand > 0) || w.werke !== 1, `werk: der Regler-Zug baut kein neues Werk (${JSON.stringify(w)})`],
        [w.fahrGesetz !== true, "werk: das Fahr-Gesetz der Welt liest die Prägung nicht (exportDrive ≠ exportDrive(P))"],
        [m.tor !== true, `tor: das Garage-Tor öffnet den Modus nicht (${m.torGrund || "?"})`],
    ];
    return regeln.filter(([rot]) => rot).map(([, t]) => t);
}

// ── DIE PROBE (Seiten-Kontext je Schritt; die Seite trägt index.html?studio=garage) ──
async function probe(page, pageErrors, anfragen) {
    const ev = (fn, ...a) => page.evaluate(fn, ...a);
    const warte = (fn, ms, ...a) => page.waitForFunction(fn, { timeout: ms, polling: 200 }, ...a).catch(() => {});
    const steht = () => {
        const z = window.__studioModi && window.__studioModi.garage && window.__studioModi.garage.zustand();
        return z && z.aktiv && z.werk !== null && z.kommt === null && !!document.querySelector("#garage-studio");
    };
    await warte(steht, 240000);
    if (!(await ev(steht))) return { geladen: false, grund: `der Modus steht nicht (${JSON.stringify(await ev(() => window.__studioModi && window.__studioModi.garage.zustand()))})` };
    const m = { geladen: true };
    const fehler0 = pageErrors.length;
    // G4 (Teil): die Regler beim ersten Laden == das Modell; G8: Revision, iframes; G9: das Werk
    Object.assign(m, await ev(() => {
        const g = window.__studioModi.garage;
        const P = g.zustand().P;
        const zeilen = [...document.querySelectorAll("#garage-sliders [data-regler]")];
        const reglerLeck = [];
        for (const z of zeilen) {
            const inp = z.querySelector("input.h-eingabe");
            const id = z.getAttribute("data-regler");
            if (inp && inp.type === "range" && Math.abs(parseFloat(inp.value) - P[id]) > Number(inp.step || 0.01) / 2) reglerLeck.push(`${id} ${inp.value}≠${P[id]}`);
        }
        const e = g.werk();
        return {
            reglerN: zeilen.length,
            reglerLeck,
            revision: String(window.THREE && window.THREE.REVISION),
            iframes: document.querySelectorAll("iframe").length,
            werk: e ? { typ: e.type, marke: e.studioOv && e.studioOv.__werk, id: e.id } : null,
        };
    }));
    // G1: die Maus in der Werkstatt (Orbit-Zug über der Welt)
    const zug = async (dx) => {
        await page.mouse.move(640, 360);
        await page.mouse.down();
        for (let i = 0; i < 10; i++) await page.mouse.move(640 + i * dx, 360 + i * 2);
        await page.mouse.up();
    };
    await zug(8);
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
        };
    }, soll);
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
        const c = e && e._kamChase;
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
    m.mausFehler = pageErrors.length - fehler0;
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
        knopf(VC.CULTURES.toro.lab).click(); // zweiter Klick: ab
        return { presetLeck, kulturAb: leck(soll("limousine", null)).length === 0 && !knopf(VC.CULTURES.toro.lab).classList.contains("on") };
    }));
    // G10: Esc verlässt den Modus; das Garage-Tor der Welt öffnet ihn wieder — in der Welt, ohne iframe
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
    return Object.assign(m, { regal: regal.length, regalUrl: (regal[0] || "").replace(/^https?:\/\/[^/]+/, ""), anfragen: anfragen.length, seitenFehler: pageErrors.slice(0, 3) });
}

(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Labor-Linse nennt jeden Täter des Befunds ===");
        const gesund = { geladen: true, mausFehler: 0, hudDisplay: "flex", hudAbstand: 22, tachoV: 10.5, tachoAnzeige: 38, presetLeck: [], reglerN: 30, reglerLeck: [] };
        Object.assign(gesund, { kulturAb: true, schilderFahrt: 0, schilderWerkstatt: 6, kamFuehrung: false, kamModus: "third", kamChase: true, regal: 0, revision: "184", iframes: 0 });
        Object.assign(gesund, { werk: { typ: "fahrzeug_gt", marke: "garage" }, werkNeu: { radstand: 2.82, werke: 1, fahrGesetz: true }, tor: true });
        check("Selbst-Test 0: gesundes Labor == 0 Täter", laborVerdict(gesund).length === 0, laborVerdict(gesund).join(" · "));
        for (const [name, bruch, soll] of [
            ["10 Seitenfehler je Orbit-Zug", { mausFehler: 10 }, "maus"],
            ["HUD display:block", { hudDisplay: "block", hudAbstand: 0 }, "hud display"],
            ["126 km/h angezeigt bei 10,5 m/s (×12)", { tachoAnzeige: 126 }, "tacho 126"],
            ["Supersport → GT lässt grip 0,85", { presetLeck: ["grip"] }, "preset"],
            ["Federrate-Regler 95 bei Zustand 100", { reglerLeck: ["springRate"] }, "regler"],
            ["kein Regler gelesen (vakuös)", { reglerN: 0 }, "regler 0 Zeilen"],
            ["Kultur nicht abwählbar", { kulturAb: false }, "kultur"],
            ["RADSTAND, ÜH-H … über dem fahrenden Wagen", { schilderFahrt: 6 }, "lehren 6"],
            ["die Lehren kommen nach der Fahrt nicht zurück", { schilderWerkstatt: 0 }, "lehren fehlen"],
            ["die Probefahrt führt ihre eigene Chase (die alte Shell)", { kamFuehrung: true }, "kamera: in der Fahrt führt das Studio"],
            ["die Fahrt in Ego", { kamModus: "first" }, "kamera: die Fahrt steht in first"],
            ["am Werk kein Zustand der chaseKamera", { kamChase: false }, "kamera: am Werk lebt kein Zustand"],
            ["three r128 aus dem terrain-Regal (2 Anfragen)", { regal: 2, regalUrl: "/worlds/terrain/lib/three-r128.min.js" }, "engine: 2 Anfragen"],
            ["THREE.REVISION 128", { revision: "128" }, "engine: THREE.REVISION 128"],
            ["die Garage als iframe neben der Welt", { iframes: 1 }, "engine: 1 iframe"],
            ["ein eigener Mesh-Bau statt eines Werks der Welt", { werk: null }, "werk: kein Wagen der Welt"],
            ["der Regler-Zug lässt das alte Werk stehen (2 Werke)", { werkNeu: { radstand: 2.82, werke: 2, fahrGesetz: true } }, "werk: der Regler-Zug"],
            ["das Fahr-Gesetz liest nur die Gattung", { werkNeu: { radstand: 2.82, werke: 1, fahrGesetz: false } }, "werk: das Fahr-Gesetz"],
            ["das Tor öffnet ein iframe", { tor: false, torGrund: "overlay true" }, "tor"],
        ]) {
            const v = laborVerdict(Object.assign({}, gesund, bruch));
            check(`Selbst-Test: ‚${name}' → die Linse nennt ${soll}`, v.length >= 1 && v[0].startsWith(soll), v.join(" · "));
        }
        console.log(errs.length ? "\n❌ SELBST-TEST ROT — die Linse ist vakuös." : "\n✅ SELBST-TEST GRÜN — die Labor-Linse nennt jeden Täter G1–G10 beim Namen.");
        process.exit(errs.length ? 1 : 0);
    }
    const server = statikServer({ start: "/index.html" });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await nullRenderer(page, { foundry: true });
    const [pageErrors, anfragen] = [[], []];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    // die Anfragen der SEITE (ein Worker hat keinen Rahmen: der Foundry-Worker der Welt zieht r128 über cores.manifest.json lib —
    // der letzte Schritt von S1, gezählt und benannt, nicht der Garage zugerechnet)
    const worker = [];
    page.on("request", (q) => (q.frame() ? anfragen : worker).push(q.url()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html?studio=garage`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await warteAufWelt(page, 180000);
    const m = await probe(page, pageErrors, anfragen);
    m.workerRegal = worker.filter((u) => REGAL.test(u)).length;
    await browser.close();
    server.close();
    console.log("=== G — DIE GARAGE ALS MODUS DER WELT-ENGINE (index.html?studio=garage, Null-Renderer, Foundry an) ===");
    const v = laborVerdict(m);
    const hat = (w) => !v.some((t) => t.startsWith(w));
    if (!m.geladen) check("der Modus steht", false, m.grund);
    else {
        check("G1 Maus ziehen in Werkstatt und Probefahrt ohne Seitenfehler", hat("maus"), `${m.mausFehler} Fehler${m.seitenFehler.length ? " — " + m.seitenFehler[0] : ""}`);
        check("G2 der Fahr-HUD ist ein Flex-Band", hat("hud"), `display ${m.hudDisplay} · Abstand ${Math.round(m.hudAbstand)} px`);
        check("G3 der Tacho zeigt km/h (×3,6 aus FAHR.kmh)", hat("tacho"), `Anzeige ${m.tachoAnzeige} bei ${((m.tachoV || 0) * 3.6).toFixed(1)} km/h nach ${m.fahrBilder} Bildern`);
        check("G4 P == DEFAULT_P + Preset + Kultur, Regler == Modell", hat("preset") && hat("regler"), `${m.reglerN} Regler · ${[...m.presetLeck, ...m.reglerLeck].slice(0, 4).join(" · ") || "kein Leck"}`);
        check("G5 die Kultur lässt sich abwählen (zweiter Klick)", hat("kultur"));
        check("G6 kein Lehren-Schild in der Fahrt, in der Werkstatt sind sie zurück", hat("lehren"), `Fahrt ${m.schilderFahrt} · Werkstatt ${m.schilderWerkstatt}`);
        check("G7 die Probefahrt fährt die Kamera der Welt (Third, die EINE chaseKamera am Werk)", hat("kamera"), `Führung ${m.kamFuehrung ? "Studio" : "Welt"} · ${m.kamModus} · chaseKamera ${m.kamChase ? "lebt" : "fehlt"}`);
        check("G8 EINE Engine: 0 Anfragen auf worlds/*/lib/, THREE r184, kein iframe", hat("engine"), `${m.regal} von ${m.anfragen} Anfragen der Seite im Regal (Foundry-Worker der Welt: ${m.workerRegal}) · REVISION ${m.revision} · ${m.iframes} iframe`);
        check("G9 das Werk ist ein Wagen der Welt, der Regler baut es neu, das Fahr-Gesetz liest die Prägung", hat("werk"), `${m.werk && m.werk.typ} #${m.werk && m.werk.id} → #${m.werkNeu && m.werkNeu.id} (${m.werkNeu && m.werkNeu.werke} Werk)`);
        check("G10 das Garage-Tor öffnet den Modus in der Welt (kein iframe)", hat("tor"), m.torGrund || "");
    }
    console.log(errs.length ? `\n❌ ROT — ${v.join(" · ")}` : "\n✅ GRÜN — die Garage als Modus der Welt-Engine: G1–G10.");
    process.exit(errs.length ? 1 : 0);
})().catch((e) => {
    console.error("Garage-Labor-Linse-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
