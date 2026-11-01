// diag-garage-labor.cjs — DIE LABOR-LINSE DER GARAGE (Welle L, Familie fahren): die Probefahrt-Werkstatt so, wie der
// Schöpfer sie bedient — Maus ziehen, Probefahrt starten, Gas geben, Gattung und Kultur wechseln.
//   G1 Maus (ein Seitenfehler beim Ziehen: der EINE Sammler, welt-boot) · G2 HUD · G3 Tacho · G4 Preset · G5 Kultur · G6 Lehren · G7 Tempo — je Zeile das Soll im Namen ihres Checks.
// Die Seite läuft in ihrem echten Renderer (r184 WebGPU, die Engine der Welt) im Kopflos-Browser; gezählt wird an der Seite selbst.
//   node scripts/diag-garage-labor.cjs [--selftest]          Port: GARAGE_LABOR_PORT (Standard 4414)
"use strict";
const { statikServer, starteBrowser, pruefer, hauptLauf, sleep, urteilEnde, selbsttestEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");
const { tempoVerdict, tempoSpion } = require("./lib/fahr-proben.cjs");

const PORT = Number(process.env.GARAGE_LABOR_PORT || 4414);
const { errs, check } = pruefer();

// ── DAS LABOR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test): die Täter beim Namen. ──
function laborVerdict(m) {
    const out = [];
    if (!m || m.geladen !== true) return ["laden"];
    if (m.hudDisplay !== "flex") out.push(`hud display ${m.hudDisplay}`);
    if (!(m.hudAbstand >= 10)) out.push(`hud Einheit klebt (${Math.round(m.hudAbstand)} px)`);
    if (!(m.tachoV > 3)) out.push(`tacho keine Fahrt (${(m.tachoV || 0).toFixed(1)} m/s)`);
    else if (!(Math.abs(m.tachoAnzeige - m.tachoV * 3.6) <= 1))
        out.push(
            `tacho ${m.tachoAnzeige} bei ${(m.tachoV * 3.6).toFixed(1)} km/h (×${(m.tachoAnzeige / m.tachoV).toFixed(2)})`
        );
    if (m.presetLeck && m.presetLeck.length) out.push(`preset Leck ${m.presetLeck.join(",")}`);
    if (m.reglerLeck && m.reglerLeck.length) out.push(`regler ${m.reglerLeck.join(",")}`);
    if (m.kulturAb !== true) out.push("kultur nicht abwählbar");
    if (m.schilderFahrt !== 0)
        out.push(`lehren ${m.schilderFahrt} Schilder in der Probefahrt (${m.schilderNamen || ""})`);
    else if (!(m.schilderWerkstatt > 0)) out.push("lehren fehlen in der Werkstatt (nach der Fahrt)");
    return out;
}

const server = statikServer({ start: "/worlds/garage/index.html" });

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Labor-Linse nennt jeden Täter des Befunds ===");
        const gesund = {
            geladen: true,
            hudDisplay: "flex",
            hudAbstand: 22,
            tachoV: 10.5,
            tachoAnzeige: 38,
            presetLeck: [],
            reglerLeck: [],
            kulturAb: true,
            schilderFahrt: 0,
            schilderWerkstatt: 6,
        };
        check("Selbst-Test 0: gesundes Labor == 0 Täter", laborVerdict(gesund).length === 0);
        for (const [name, bruch, soll] of [
            ["HUD display:block", { hudDisplay: "block", hudAbstand: 0 }, "hud display"],
            ["126 km/h angezeigt bei 10,5 m/s (×12)", { tachoAnzeige: 126 }, "tacho"],
            ["Supersport → GT lässt grip 0,85", { presetLeck: ["grip"] }, "preset"],
            ["Federrate-Regler 95 bei Zustand 100", { reglerLeck: ["springRate"] }, "regler"],
            ["Kultur nicht abwählbar", { kulturAb: false }, "kultur"],
            ["RADSTAND, ÜH-H … über dem fahrenden Wagen", { schilderFahrt: 6 }, "lehren"],
            ["die Lehren kommen nach der Fahrt nicht zurück", { schilderWerkstatt: 0 }, "lehren"],
        ]) {
            const v = laborVerdict(Object.assign({}, gesund, bruch));
            check(
                `Selbst-Test: ‚${name}' → die Linse nennt ${soll}`,
                v.length >= 1 && v[0].startsWith(soll),
                v.join(" · ")
            );
        }
        selbsttestEnde(errs, "die Labor-Linse nennt Maus, HUD, Tacho, Preset, Kultur und Lehren beim Namen.");
        process.exit(0);
    }

    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 120000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await server.zeige(page, 60000, "worlds/garage/index.html", "load");
    await page.waitForFunction(() => typeof window.__vehicleCore === "object" && document.querySelector("canvas"), {
        timeout: 30000,
    });
    await sleep(500);
    const m = { geladen: true };
    // G4 (Teil): der Regler-Zustand beim ersten Laden == das Modell (vor jedem Klick).
    m.reglerLeck = await page.evaluate(() => {
        const out = [];
        for (const pp of window.__vehicleCore.PARAMS_BY_KIND.vehicle) {
            const el = document.querySelector(`#v_${pp.id}`);
            const inp = el && el.closest(".sl") ? el.closest(".sl").querySelector("input") : null;
            // eslint-disable-next-line no-undef
            if (inp && Math.abs(parseFloat(inp.value) - P[pp.id]) > 1e-6) out.push(`${pp.id} ${inp.value}≠${P[pp.id]}`);
        }
        return out;
    });
    // G1: die Maus in der Werkstatt (Orbit-Zug) und in der Probefahrt (Umsehen).
    await page.mouse.move(640, 360);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) await page.mouse.move(640 + i * 8, 360 + i * 2);
    await page.mouse.up();
    await page.click("#start");
    await sleep(300);
    await page.evaluate(
        `window.__m7 = (${tempoSpion})(window.__vehicleCore, cam, (z, vm) => z === car && vm === fahrGesetzLab().vmax)`
    );
    await page.mouse.move(640, 360);
    await page.mouse.down();
    for (let i = 0; i < 10; i++) await page.mouse.move(640 - i * 8, 360);
    await page.mouse.up();
    await page.waitForFunction(() => window.__m7.rueck !== null, { timeout: 30000, polling: 100 }).catch(() => {});
    // G2: der HUD im Fahr-Modus.
    Object.assign(
        m,
        await page.evaluate(() => {
            const hud = document.getElementById("hud");
            const u = hud.querySelector(".u").getBoundingClientRect();
            const k = hud.querySelector(".keys").getBoundingClientRect();
            return { hudDisplay: getComputedStyle(hud).display, hudAbstand: k.left - u.right };
        })
    );
    // G6: die Schilder (Sprites) am Wagen, die der Renderer zeichnet — in der Probefahrt keines.
    const schilder = () =>
        page.evaluate(() => {
            const namen = [];
            // eslint-disable-next-line no-undef
            vehicle.traverseVisible((o) => {
                if (o.isSprite) namen.push(o.name || "Schild");
            });
            return namen;
        });
    const sf = await schilder();
    m.schilderFahrt = sf.length;
    m.schilderNamen = sf.slice(0, 4).join(", ");
    // G3: Gas geben, dann Anzeige gegen das echte Tempo desselben Frames.
    await page.keyboard.down("KeyW");
    // bis der Wagen fährt (> 3 m/s) — nie eine feste Uhr: auf dem CPU-Raster der CI kommen in 1,8 s nur wenige Frames
    // (gemessen 1,1 m/s), der Tacho ist aber eine Frage der Umrechnung, nicht der Bildrate
    await page
        // eslint-disable-next-line no-undef
        .waitForFunction(() => Math.abs(car.speed) > 3, { timeout: 90000, polling: 100 })
        .catch(() => {});
    Object.assign(
        m,
        await page.evaluate(
            () =>
                new Promise((res) =>
                    requestAnimationFrame(() =>
                        res({
                            tachoAnzeige: parseInt(document.querySelector("#hud #spd").textContent, 10),
                            // eslint-disable-next-line no-undef
                            tachoV: Math.abs(car.speed),
                        })
                    )
                )
        )
    );
    await page.keyboard.up("KeyW");
    m.tempo = await page.evaluate(() => (window.__m7.ende(), Object.assign(window.__m7, { fov: undefined })));
    await page.keyboard.press("Escape");
    await sleep(200);
    m.schilderWerkstatt = (await schilder()).length;
    // G4/G5: Gattung und Kultur wechseln — P ist DEFAULT_P + Preset (+ die gewählte Kultur), ohne Rest.
    Object.assign(
        m,
        await page.evaluate(() => {
            const VC = window.__vehicleCore;
            const knopf = (text) => [...document.querySelectorAll("#ctl button")].find((b) => b.textContent === text);
            const soll = (pid, kid) =>
                Object.assign({}, VC.DEFAULT_P, VC.presetPatch(pid), kid ? VC.CULTURES[kid].fx : {});
            const leck = (s) => {
                const out = [];
                // eslint-disable-next-line no-undef
                const ist = P;
                for (const k of new Set([...Object.keys(s), ...Object.keys(ist)]))
                    if (s[k] !== ist[k]) out.push(`${k} ${JSON.stringify(ist[k])}≠${JSON.stringify(s[k])}`);
                return out;
            };
            const presetLeck = [];
            knopf(VC.PRESETS.supersport.lab).click();
            knopf(VC.PRESETS.gt.lab).click();
            presetLeck.push(...leck(soll("gt", null)));
            knopf(VC.CULTURES.toro.lab).click();
            knopf(VC.PRESETS.limousine.lab).click();
            presetLeck.push(...leck(soll("limousine", "toro")));
            knopf(VC.CULTURES.toro.lab).click(); // zweiter Klick: ab
            const kulturAb =
                leck(soll("limousine", null)).length === 0 && !knopf(VC.CULTURES.toro.lab).classList.contains("on");
            return { presetLeck, kulturAb };
        })
    );
    await browser.close();
    server.close();

    console.log("=== G — DIE GARAGE IM KOPFLOS-BROWSER (r184 WebGPU, echte Seite) ===");
    const v = laborVerdict(m);
    check(
        "G2 der Fahr-HUD ist ein Flex-Band (Einheit getrennt von der Tastenhilfe)",
        m.hudDisplay === "flex" && m.hudAbstand >= 10,
        `display ${m.hudDisplay} · Abstand ${Math.round(m.hudAbstand)} px`
    );
    check(
        "G3 der Tacho zeigt km/h (×3,6 aus FAHR.kmh)",
        !v.some((t) => t.startsWith("tacho")),
        `Anzeige ${m.tachoAnzeige} bei ${(m.tachoV || 0).toFixed(2)} m/s = ${((m.tachoV || 0) * 3.6).toFixed(1)} km/h`
    );
    check(
        "G4 Preset-Wechsel und erstes Laden: P == DEFAULT_P + Preset + Kultur, Regler == Modell",
        !m.presetLeck.length && !m.reglerLeck.length,
        [...m.presetLeck, ...m.reglerLeck].slice(0, 4).join(" · ") || "kein Leck"
    );
    check("G5 die Kultur lässt sich abwählen (zweiter Klick)", m.kulturAb === true);
    const v7 = tempoVerdict(m.tempo);
    check(
        "G7 die Probefahrt atmet das Tempo wie der Ritt: camera.fov = Ruhe + Tempo aus Fahr-Zustand und vmax, Orbit zurück in 1–1,25 s",
        v7.length === 0,
        `${JSON.stringify(m.tempo)}${v7.length ? " — Täter: " + v7.join(" · ") : ""}`
    );
    check(
        "G6 die Probefahrt fährt den gebauten Wagen: kein Lehren-Schild über dem Wagen, in der Werkstatt sind sie zurück",
        m.schilderFahrt === 0 && m.schilderWerkstatt > 0,
        `Fahrt ${m.schilderFahrt} Schilder · Werkstatt ${m.schilderWerkstatt}`
    );
    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): ${v.join(" · ")}`, "\n✅ GRÜN — die Garage: Maus ohne Fehler, HUD als Band, Tacho in km/h, Preset und Kultur ohne Leck, die Probefahrt ohne Lehren.");
});
