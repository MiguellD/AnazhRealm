// diag-garage-labor.cjs — DIE LABOR-LINSE DER GARAGE (Welle L, Familie fahren): die Probefahrt-Werkstatt so, wie der
// Schöpfer sie bedient — Maus ziehen, Probefahrt starten, Gas geben, Gattung und Kultur wechseln, die Ansicht wählen.
//   G1 Maus: Orbit-Zug und Umsehen ohne Seitenfehler (der EINE Sammler, welt-boot; vorher ReferenceError je Mausbewegung).
//   G2 HUD: im Fahr-Modus ein Flex-Band, die Einheit ≥ 10 px von der Tastenhilfe (display:block klebte sie an).
//   G3 Tacho: die Anzeige ist |v| · 3,6 (FAHR.kmh, ± 1 km/h) im selben Bild (vorher × 12).
//   G4 Preset: nach Gattungs- und Kultur-Wechsel ist P == DEFAULT_P + Preset (+ Kultur) + die Epoche des Reglers, keine Zeile
//      der Hülle zeigt NaN (Supersport → GT ließ grip 0,85; die Epoche fiel beim Wechsel).
//   G5 Kultur: der zweite Klick wählt sie ab.  G6 Lehren: in der Probefahrt kein Maß-Schild, in der Werkstatt sind sie zurück.
//   G7 Tempo: camera.fov = Ruhe + Tempo aus Fahr-Zustand und vmax wie im Ritt, der Orbit kehrt in 1–1,25 s zurück.
//   G8 die Ansicht (02.11.): je Modus (Isometrie · Seite · Explosion 1,0 · Animation) zeigt das Bild den Wagen (sein Anteil an den
//      Farbwerten: das Bild mit gegen ohne Wagen, ≥ 1,5 %) und zeichnet höchstens 120 Befehle (die Faltung der Ansicht, vorher
//      294–806) — ein gebrochener Modus steht beim Namen. Gemessen am Wagen der Zukunft (der schwerste Bau).
// Die Seite läuft in ihrem echten Renderer (r184 WebGPU, die Engine der Welt) im Kopflos-Browser; gezählt wird an der Seite selbst.
// Die Prüfungen G2–G6 und G8 lesen das EINE Verdikt (`laborVerdict`, je Täter ein Präfix) — Browser-Probe und Selbst-Test.
//   node scripts/diag-garage-labor.cjs [--selftest]          Port: GARAGE_LABOR_PORT (Standard 4414)
/* eslint-disable no-undef */
"use strict";
const { statikServer, starteBrowser, pruefer, hauptLauf, sleep, urteilEnde, selbsttestEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");
const { tempoVerdict, tempoSpion } = require("./lib/fahr-proben.cjs");

const PORT = Number(process.env.GARAGE_LABOR_PORT || 4414);
const { errs, check } = pruefer();
const ANSICHTEN = ["iso", "seite", "explosion", "animation"];

// ── DAS LABOR-VERDIKT (pure Funktion; Browser-Probe UND Selbst-Test): die Täter beim Namen. ──
function laborVerdict(m) {
    if (m?.geladen !== true) return ["laden"];
    const out = [];
    if (m.hudDisplay !== "flex" || !(m.hudAbstand >= 10)) out.push(`hud ${m.hudDisplay} ${Math.round(m.hudAbstand)} px`);
    if (!(Math.abs(m.tachoAnzeige - m.tachoV * 3.6) <= 1 && m.tachoV > 3)) out.push(`tacho ${m.tachoAnzeige} bei ${m.tachoV} m/s`);
    if (m.presetLeck?.length) out.push(`preset ${m.presetLeck}`);
    if (m.reglerLeck?.length) out.push(`regler ${m.reglerLeck}`);
    if (m.kulturAb !== true) out.push("kultur bleibt");
    if (m.schilderFahrt !== 0 || !(m.schilderWerkstatt > 0)) out.push(`lehren ${m.schilderFahrt} in der Fahrt, ${m.schilderWerkstatt} danach`);
    for (const n of ANSICHTEN) {
        const [b, a] = m.ansicht?.[n] || [];
        if (!(b <= 120 && a >= 0.015)) out.push(`${n} ${b} Befehle, Wagen ${a} des Bildes`);
    }
    return out;
}

const server = statikServer({ start: "/worlds/garage/index.html" });

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Labor-Linse nennt jeden Täter des Befunds ===");
        const ansicht = Object.fromEntries(ANSICHTEN.map((n) => [n, [60, 0.2]]));
        const gesund = { geladen: true, hudDisplay: "flex", hudAbstand: 22, tachoV: 10.5, tachoAnzeige: 38, kulturAb: true, schilderFahrt: 0, schilderWerkstatt: 6, ansicht };
        check("Selbst-Test 0: gesundes Labor == 0 Täter", !laborVerdict(gesund).length);
        for (const [soll, bruch] of [
            ["hud", { hudDisplay: "block" }],
            ["tacho", { tachoAnzeige: 126 }],
            ["preset", { presetLeck: ["grip"] }],
            ["regler", { reglerLeck: ["springRate"] }],
            ["kultur", { kulturAb: false }],
            ["lehren", { schilderFahrt: 6 }],
            ["lehren", { schilderWerkstatt: 0 }],
            ["seite", { ansicht: { ...ansicht, seite: [40, 0] } }],
            ["explosion", { ansicht: { ...ansicht, explosion: [806, 0.2] } }],
        ]) {
            const v = laborVerdict({ ...gesund, ...bruch });
            check(`Selbst-Test ${JSON.stringify(bruch).slice(0, 60)} → ${soll}`, v[0]?.startsWith(soll), v.join(" · "));
        }
        selbsttestEnde(errs, "die Labor-Linse nennt Maus, HUD, Tacho, Preset, Kultur, Lehren und jeden Modus der Ansicht beim Namen.");
        process.exit(0);
    }

    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 120000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await server.zeige(page, 60000, "worlds/garage/index.html", "load");
    await page.waitForFunction(() => typeof window.__vehicleCore === "object" && document.querySelector("canvas"), { timeout: 30000 });
    await sleep(500);
    const m = { geladen: true };
    // G1: die Maus in der Werkstatt (Orbit-Zug) und in der Probefahrt (Umsehen).
    const zug = async (dx, dy) => {
        await page.mouse.move(640, 360);
        await page.mouse.down();
        for (let i = 0; i < 10; i++) await page.mouse.move(640 + i * dx, 360 + i * dy);
        await page.mouse.up();
    };
    await zug(8, 2);
    await page.click("#start");
    await sleep(300);
    await page.evaluate(`window.__m7 = (${tempoSpion})(window.__vehicleCore, cam, (z, vm) => z === car && vm === fahrGesetzLab().vmax)`);
    await zug(-8, 0);
    await page.waitForFunction(() => window.__m7.rueck !== null, { timeout: 30000, polling: 100 }).catch(() => {});
    // G2 der HUD im Fahr-Modus · G6 die Schilder (Sprites) am Wagen, die der Renderer zeichnet
    const blick = () =>
        page.evaluate(() => {
            const hud = document.getElementById("hud"),
                r = (s) => hud.querySelector(s).getBoundingClientRect(),
                namen = [];
            vehicle.traverseVisible((o) => o.isSprite && namen.push(o.name));
            return { hudDisplay: getComputedStyle(hud).display, hudAbstand: r(".keys").left - r(".u").right, namen };
        });
    const b = await blick();
    Object.assign(m, b, { schilderFahrt: b.namen.length });
    // G3: Gas geben, dann Anzeige gegen das echte Tempo desselben Frames — bis der Wagen fährt (> 3 m/s), nie eine feste Uhr:
    // auf dem CPU-Raster der CI kommen in 1,8 s nur wenige Frames (gemessen 1,1 m/s), der Tacho ist eine Frage der Umrechnung.
    await page.keyboard.down("KeyW");
    await page.waitForFunction(() => Math.abs(car.speed) > 3, { timeout: 90000, polling: 100 }).catch(() => {});
    Object.assign(
        m,
        await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => res({ tachoAnzeige: +document.querySelector("#hud #spd").textContent, tachoV: Math.abs(car.speed) }))))
    );
    await page.keyboard.up("KeyW");
    m.tempo = await page.evaluate(() => (window.__m7.ende(), Object.assign(window.__m7, { fov: undefined })));
    await page.keyboard.press("Escape");
    await sleep(200);
    m.schilderWerkstatt = (await blick()).namen.length;
    // G4/G5: Gattung und Kultur wechseln — P ist DEFAULT_P + Preset (+ die gewählte Kultur) + die Epoche des Reglers, ohne Rest;
    // Regler == Modell: was der Schöpfer an der Zeile liest (bis 02.11. suchte hier eine Abfrage #v_-Ids, die die Hülle nie baut)
    Object.assign(
        m,
        await page.evaluate(() => {
            const VC = window.__vehicleCore,
                knopf = (z) => [...document.querySelectorAll("#ctl button")].find((b) => b.textContent === z.lab),
                leck = (pid, kid) => {
                    const s = { ...VC.DEFAULT_P, ...VC.presetPatch(pid), ...(kid && VC.CULTURES[kid].fx), epoche: 2 };
                    return Object.keys({ ...s, ...P }).filter((k) => s[k] !== P[k]).map((k) => `${k} ${P[k]}≠${s[k]}`);
                };
            P.epoche = 2;
            knopf(VC.PRESETS.supersport).click();
            knopf(VC.PRESETS.gt).click();
            const presetLeck = leck("gt");
            knopf(VC.CULTURES.toro).click();
            knopf(VC.PRESETS.limousine).click();
            presetLeck.push(...leck("limousine", "toro"));
            knopf(VC.CULTURES.toro).click(); // zweiter Klick: ab
            const reglerLeck = [...document.querySelectorAll("#ctl .h-wert")].filter((w) => /NaN/.test(w.textContent)).map((w) => w.closest("[data-regler]").dataset.regler);
            return { presetLeck, reglerLeck, kulturAb: !leck("limousine").length && !knopf(VC.CULTURES.toro).classList.contains("on") };
        })
    );
    // G8: die Ansicht je Modus am Wagen der Zukunft — das Bild mit gegen ohne Wagen (160×90, gelesen im selben Takt wie der
    // Render: danach ist das Bild der WebGPU-Leinwand verbraucht), die Befehle des Bilds
    m.ansicht = await page.evaluate(() => {
        R.setAnimationLoop(null);
        P.epoche = 5;
        rebuild();
        const c = Object.assign(document.createElement("canvas"), { width: 160, height: 90 }).getContext("2d"),
            a = {};
        const bild = (an) => {
            vehicle.visible = an;
            R.info.reset();
            R.render(scene, kamera());
            c.drawImage(R.domElement, 0, 0, 160, 90);
            return [R.info.render.drawCalls, c.getImageData(0, 0, 160, 90).data];
        };
        for (const n of ["iso", "seite", "explosion", "animation"]) {
            projSetzen(n === "seite" ? "seite" : "iso");
            // die Explosion über ihren Regler (die erste legt Rahmen und Baukörper frei, wie der Schöpfer sie sieht)
            if (n === "explosion") Object.assign(ansichtRegler.eingabe("explode"), { value: 1 }).dispatchEvent(new Event("input", { bubbles: true }));
            explosionAnwenden((eZeig = +(n === "explosion")));
            for (let i = 0; i < 40; i++) werkOrbit(0.1), n === "animation" && animSchritt(1 / 30, i / 30);
            const ohne = bild(false)[1],
                [befehle, mit] = bild(true);
            a[n] = [befehle, mit.filter((w, i) => i % 4 < 3 && Math.abs(w - ohne[i]) > 20).length / 43200];
        }
        return a;
    });
    await browser.close();
    server.close();

    console.log("=== G — DIE GARAGE IM KOPFLOS-BROWSER (r184 WebGPU, echte Seite) ===");
    const v = laborVerdict(m),
        v7 = tempoVerdict(m.tempo);
    for (const [name, frei, detail] of [
        ["G2 der Fahr-HUD ist ein Flex-Band", "hud", `${m.hudDisplay} · ${m.hudAbstand} px`],
        ["G3 der Tacho zeigt km/h", "tacho", `${m.tachoAnzeige} bei ${m.tachoV} m/s`],
        ["G4 P == DEFAULT_P + Preset + Kultur, Regler == Modell", "preset regler", [...m.presetLeck, ...m.reglerLeck].slice(0, 4).join(" · ")],
        ["G5 die Kultur lässt sich abwählen", "kultur"],
        ["G6 keine Lehren in der Probefahrt, zurück in der Werkstatt", "lehren", `${m.schilderFahrt} · ${m.schilderWerkstatt}`],
        ["G8 die Ansicht zeigt den Wagen je Modus (≥ 1,5 % des Bildes) in ≤ 120 Befehlen", ANSICHTEN.join(" "), m.ansicht],
    ])
        check(name, !v.some((t) => frei.split(" ").includes(t.split(" ")[0])), detail);
    check("G7 die Probefahrt atmet das Tempo wie der Ritt", !v7.length, `${JSON.stringify(m.tempo)} ${v7}`);
    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): ${[...v, ...v7].join(" · ")}`, "\n✅ GRÜN — die Garage: Maus, HUD, Tacho, Preset, Kultur, Lehren, Tempo und die Ansicht in jedem Modus.");
});
