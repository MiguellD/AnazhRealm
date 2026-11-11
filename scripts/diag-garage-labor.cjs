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
//      294–806) — ein gebrochener Modus steht beim Namen, ein Bild ohne Spannweite mit dem Anteil „leer“ (der blinde Leser).
//      Gemessen am Wagen der Zukunft (der schwerste Bau).
// Die Seite läuft in ihrem echten Renderer (r184 WebGPU, die Engine der Welt) im Kopflos-Browser; gezählt wird an der Seite selbst.
// Die Prüfungen G2–G6 und G8 lesen das EINE Verdikt (`laborVerdict`, je Täter ein Präfix) — Browser-Probe und Selbst-Test.
//   G10 der Schirm (04.11.): im Standard belegt die Leiste ≤ 15 % des Schirms (vorher 51 %), am Wagen steht kein Schild; „Lehren"
//      bringt Tafel und Maß-Schilder, „Leicht" (`?leicht`) halbe Auflösung, der Schatten-Pass ruht, das Bild auf der Leinwand; die
//      Bildzeit voll gegen leicht nennt die Linse. (Ihr Band „≥ 40 % weniger Bildzeit" war auf swiftshader geeicht, wo das Bild am
//      Pixel hängt; auf der Karte zeichnet die Garage voll und leicht in 6 ms — Radeon 890M, 10.11., kein GPU-gebundenes Bild, die
//      Zeit urteilt dort nichts. Mit w27-swift-raus fiel die Klausel, die Linse urteilt auf der Karte, was Leicht tut.)
//   G9 die Zeit-Achse (04.11., Node am Kern): vmax folgt der Technik der Stufe (Schlitten · Ochsenkarren < Kutsche < Motorwagen
//      < heute < Zukunft je Gattung, Bänder km/h), der Lack der Leiste färbt den Körper jeder Stufe, jeder Regler wirkt in jeder,
//      jede Gattung fährt heute ihr eigenes Tempo (H7, vorher gate:vehicle-drive A3).
//   node scripts/diag-garage-labor.cjs [--selftest | --epoche]          Port: GARAGE_LABOR_PORT (Standard 4414)
/* eslint-disable no-undef */
"use strict";
const { statikServer, pruefer, hauptLauf, sleep, urteilEnde, selbsttestEnde, SELBSTTEST, studioKern, ausDatei, jsonLesen, nullWelt } = require("./lib/welt-boot.cjs");
const { tempoVerdict, tempoSpion } = require("./lib/fahr-proben.cjs");
const { kernAusText } = require("./lib/asset-worker-harness.cjs");

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
    // G10 der Schirm gehört dem Wagen: im Standard ≤ 15 % Leiste und kein Schild am Wagen; der Knopf „Lehren" bringt Tafel und
    // Schilder; „Leicht" halbiert die Auflösung und lässt den Schatten-Pass ruhen (die Bildzeit steht als Zahl im Befund)
    const s = m.schirm || {};
    if (!(s.anteil <= 15 && s.schilder === 0)) out.push(`schirm ${s.anteil} % Leiste, ${s.schilder} Schilder im Standard`);
    if (!(s.lehrenSchilder > 0 && s.lehrenTafel === true)) out.push(`lehren-knopf ${s.lehrenSchilder} Schilder, Tafel ${s.lehrenTafel}`);
    const l = m.leicht || {};
    // die Bildzeit gilt nur auf der Leinwand: ein Ziel abseits (das Ausgabe-Ziel von G8, 160×90) halbiert keine Auflösung
    if (!(l.pr <= 0.5 && l.schatten === false && l.leinwand)) out.push(`leicht ${l.leicht} ms gegen ${l.voll} ms, Auflösung ×${l.pr}, Schatten ${l.schatten}, Leinwand ${l.leinwand}`);
    for (const n of ANSICHTEN) {
        // ein Bild ohne Spannweite trägt den Anteil „leer“: der blinde Leser (der 2D-Abzug der CI, z152), nie ein Wagen
        const [b, a] = m.ansicht?.[n] || [];
        if (!(b <= 120 && a >= 0.015)) out.push(`${n} ${b} Befehle, Wagen ${a} des Bildes`);
    }
    return out;
}

// ── G9 DIE ZEIT-ACHSE (w11-fahrzeug, 04.11.; Node — der Kern, den die Garage liest): je Stufe × Gattung das Tempo des EINEN
// Fahr-Schritts (VC.fahrLeistung: 90 s Vollgas auf der Ebene — dieselbe Zahl zeigt die Lehren-Tafel), der Lack der Leiste färbt
// den Körper (Δ der Farbe zweier Lacke, Signalrot ↔ Azurblau, an jedem Mesh, das einen Lack trägt), jeder Regler der Zeile
// wirkt (min ↔ max ändert den Bau — Σ |Koordinate|, die Flanke ist symmetrisch — oder das Fahr-Gesetz). Befund 04.11.: Schlitten
// 79 km/h > GT heute 54, alle 40–80, die Farbe nur heute änderbar, Taille und Tumblehome in Kutsche, Motorwagen, Zukunft tot.
// Ordnung je Gattung: Schlitten und Ochsenkarren < Kutsche < Motorwagen < heute < Zukunft; die Bänder in km/h.
const ZEIT_ORDNUNG = ["schlitten kutsche", "ochsenkarren kutsche", "kutsche motorwagen", "motorwagen heute", "heute zukunft"];
const ZEIT_BAND = { ochsenkarren: [5, 12], kutsche: [18, 32], motorwagen: [30, 110], heute: [120, 250] };
function epocheMessen(VC) {
    const e = { kmh: {}, farbe: {}, tot: {} };
    const spur = (pid, ov, w) => {
        let s = 0;
        VC.buildInstance(pid, 1, 0, ov, w).traverse((o) => {
            const a = o.isMesh && o.geometry.attributes.position, c = o.isMesh && o.material.color;
            if (w && c && o.material.userData.__lack != null) s += c.r + 3 * c.g + 9 * c.b;
            if (a && !w) for (let i = 0; i < a.count; i++) s += Math.abs(a.getX(i)) + 2 * Math.abs(a.getY(i)) + 3 * Math.abs(a.getZ(i));
        });
        return w ? s : s.toFixed(4) + JSON.stringify(VC.fahrGesetz(VC.exportDrive({ ...VC.presetPatch(pid), ...ov })));
    };
    VC.EPOCHE_GESETZ.forEach(({ id }, epoche) => {
        e.kmh[id] = {};
        e.farbe[id] = {};
        for (const g in VC.PRESETS) {
            e.kmh[id][g] = VC.fahrLeistung({ ...VC.presetPatch(g), epoche }).kmh;
            e.farbe[id][g] = Math.abs(spur(g, { epoche }, { bodyMat: VC.lackStoff(1) }) - spur(g, { epoche }, { bodyMat: VC.lackStoff(5) }));
        }
        e.tot[id] = VC.PARAMS_BY_KIND.vehicle.filter((z) => z.id !== "epoche" && spur("gt", { epoche, [z.id]: z.min }) === spur("gt", { epoche, [z.id]: z.max })).map((z) => z.id);
    });
    return e;
}
function epocheVerdict(e) {
    const out = [];
    for (const g in e.kmh.heute) {
        for (const [a, b] of ZEIT_ORDNUNG.map((p) => p.split(" "))) if (!(e.kmh[a][g] < e.kmh[b][g])) out.push(`ordnung ${g}: ${a} ${e.kmh[a][g]} ≥ ${b} ${e.kmh[b][g]} km/h`);
        for (const [id, [lo, hi]] of Object.entries(ZEIT_BAND)) if (!(e.kmh[id][g] >= lo && e.kmh[id][g] <= hi)) out.push(`band ${id} ${g}: ${e.kmh[id][g]} km/h ∉ ${lo}–${hi}`);
        for (const id in e.farbe) if (!(e.farbe[id][g] > 0.02)) out.push(`farbe ${id} ${g}: Δ ${e.farbe[id][g]}`);
    }
    for (const id in e.tot) for (const r of e.tot[id]) out.push(`regler ${id}: ${r} wirkt nicht`);
    // jede Gattung ihr Antrieb (H7, bis w12-fahrzeug-decke gate:vehicle-drive A3: GT ≠ Supersport in zwei Skalaren)
    const h = Object.values(e.kmh.heute);
    if (new Set(h).size < h.length) out.push(`gattung heute ${h} km/h`);
    return out;
}

// ── G11 DIE PRÜFSTRECKE (w11-fahrzeug, Node; Eintrag F): der Wagen der Bühne (spec/pruefbuehne/strecke.json `soll.gattung`) fährt
// zwei Runden auf der Bahn des Gelände-Gesetzes (gelaende-core `bahn`), gelenkt vom Fahrer der Linie (vehicle-core `pruefFahrt`,
// fester Schritt 1/60 s, ohne Zufall) — gerichtet wird die fliegende Runde: ihre Zeit und die Weite am Kicker (F: 55–65 s, 18–22 m),
// der Landestoß, der Bodenkontakt, die Ablage quer zur Linie, die Querbeschleunigung je Kurve und die Überhöhung (dieselbe R
// überhöht schneller im Scheitel als eben), der Federweg (er arbeitet, der Anschlag nur an der Landung) und die Wiederholung
// (zwei Läufe, dieselbe Spur). Sie richtet seit w11-fahrzeug auch die Vertikale (vorher gate:fahr-leben K5: Kuppe und Klippe).
function streckeMessen(VC, GC) {
    const S = jsonLesen("spec/pruefbuehne/strecke.json"),
        T = GC.erbgutNormal(S.erbgut),
        L = { erbgut: { terme: T }, baseHeight: 0 },
        b = { ...T[1], am: (x, z, ab) => GC.bahnAm(T[1], x, z, ab) },
        G = VC.fahrGesetz(VC.exportDrive(VC.presetPatch(S.soll.gattung))),
        lauf = () => VC.pruefFahrt(G, b, (x, z) => GC.hoehe(L, x, z, false), 2, 1 / 60),
        [a, c] = [lauf(), lauf()];
    return { soll: S.soll, r: a.runden[1], gleich: a.spur === c.spur };
}
function streckeVerdict({ soll, r, gleich }) {
    if (!r) return ["runde: keine fliegende Runde"];
    const out = [],
        drin = (v, [lo, hi]) => v >= lo && v <= hi,
        weite = Math.max(0, ...r.fluege.map((f) => f.weite)),
        [k70b, , k70] = r.kurven;
    if (!drin(r.zeit, soll.rundeS)) out.push(`runde ${r.zeit} s ∉ ${soll.rundeS}`);
    if (!drin(weite, soll.flugM)) out.push(`flug ${weite} m ∉ ${soll.flugM}`);
    if (r.fluege.some((f) => f.stoss > soll.landestossMS)) out.push(`landung ${JSON.stringify(r.fluege)}`);
    if (!(r.kontakt >= soll.kontakt)) out.push(`kontakt ${r.kontakt}`);
    if (!(r.ablage <= soll.ablageM)) out.push(`ablage ${r.ablage} m`);
    for (const k of r.kurven) if (!drin(k.aQ, soll.qG)) out.push(`kurve R ${k.R}: ${k.aQ} g`);
    if (!(k70b.vScheitel > k70.vScheitel)) out.push(`ueberhoehung R 70: ${k70b.vScheitel} ≤ eben ${k70.vScheitel} m/s`);
    if (!(r.hubMin < -0.005 && r.anschlag <= soll.anschlag)) out.push(`federweg ${r.hubMin} m, ${r.anschlag} am Anschlag`);
    if (!gleich) out.push("wiederholung: zwei Läufe, zwei Spuren");
    return out;
}
// DIE KERN-MUTANTEN (vm, ohne Browser; der EINE Lader `kernAusText`): je Klasse ein eingeschmuggelter Täter im echten Kern, die
// Linse nennt ihn ROT — G9: der Körper der Zeit ersetzt den Lack · EIN Antrieb für jede Zeit · die Gestalt der Zeit ohne den
// Schnitt der Flanke · EIN Rezept für jede Gattung; G11: die Bahn ohne Überhöhung · die Normalkraft ohne v·ω · der Zufall in der
// Prüffahrt (zwei Läufe, zwei Spuren; bis w12-fahrzeug-decke kippte der Selbsttest dafür nur das Urteil-Flag)
const G9 = (K) => epocheVerdict(epocheMessen(K.__vehicleCore)),
    G11 = (K) => streckeVerdict(streckeMessen(K.__vehicleCore, K.__gelaendeCore));
const MUTANTEN = [
    ["vehicle", "epocheKoerper(E.koerper, lack) : lack", "epocheStoff(E.koerper) : lack", /^farbe zukunft/, G9],
    ["vehicle", "            Z = (E && E.antrieb) || {};", "            Z = {};", /^ordnung|^band/, G9],
    ["vehicle", "        if (topo) taperBody(", "        if (false) taperBody(", /^regler kutsche: taille/, G9],
    ["vehicle", "        const pre = PRESETS[id];", "        const pre = PRESETS.gt;", /^gattung/, G9],
    ["gelaende", "const BANK = mittel(mittel(ZIEL_BANK));", "const BANK = new Float64Array(N);", /^ueberhoehung/, G11],
    ["vehicle", "const gN = Math.max(0, g * cosN - z.vlong * z.yawRate * Math.sin(z.wank || 0));", "const gN = g * cosN;", /^runde|^ablage|^kurve/, G11],
    ["vehicle", "boden, dt);\n            t += dt;", "boden, dt);\n            z.x += Math.random() * 1e-3;\n            t += dt;", /^wiederholung/, G11],
];
const kerne = () => ({ __vehicleCore: studioKern("vehicle-core.js", "__vehicleCore"), __gelaendeCore: studioKern("gelaende-core.js", "__gelaendeCore") });

const server = statikServer({ start: "/worlds/garage/index.html" });

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Labor-Linse nennt jeden Täter des Befunds ===");
        const ansicht = Object.fromEntries(ANSICHTEN.map((n) => [n, [60, 0.2]]));
        const schirm = { anteil: 10.8, schilder: 0, lehrenSchilder: 5, lehrenTafel: true },
            leicht = { voll: 186, leicht: 46, pr: 0.5, schatten: false, leinwand: true };
        const gesund = { geladen: true, hudDisplay: "flex", hudAbstand: 22, tachoV: 10.5, tachoAnzeige: 38, kulturAb: true, schilderFahrt: 0, schilderWerkstatt: 6, ansicht, schirm, leicht };
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
            ["iso", { ansicht: { ...ansicht, iso: [22, "leer"] } }],
            ["schirm", { schirm: { ...schirm, anteil: 51.4 } }],
            ["schirm", { schirm: { ...schirm, schilder: 5 } }],
            ["lehren-knopf", { schirm: { ...schirm, lehrenTafel: false } }],
            ["leicht", { leicht: { ...leicht, schatten: true } }],
            ["leicht", { leicht: { ...leicht, leinwand: false } }],
        ]) {
            const v = laborVerdict({ ...gesund, ...bruch });
            check(`Selbst-Test ${JSON.stringify(bruch).slice(0, 60)} → ${soll}`, v[0]?.startsWith(soll), v.join(" · "));
        }
        const echt = kerne();
        for (const [k, a, b, muss, U] of MUTANTEN) {
            const [src, ns] = [ausDatei(`${k}-core.js`), `__${k}Core`],
                v = src.split(a).length === 2 ? U({ ...echt, [ns]: kernAusText(src.replace(a, b), ns) }) : [`Anker fehlt: ${a}`];
            check(`Selbst-Test Kern-Mutante ${k} ${muss}`, v.some((t) => muss.test(t)), v.slice(0, 3).join(" · "));
        }
        // der Selbsttest: die Labor-Linse nennt Maus, HUD, Tacho, Preset, Kultur, Lehren, jeden Modus der Ansicht und die
        // Zeit-Achse beim Namen.
        selbsttestEnde(errs);
        process.exit(0);
    }

    // G9 zuerst (Node, der Kern, den die Garage liest; `--epoche` misst nur sie)
    const K = kerne(),
        zeit = epocheMessen(K.__vehicleCore),
        v9 = epocheVerdict(zeit);
    check("G9 die Zeit-Achse (km/h je Stufe × Gattung)", !v9.length, `${JSON.stringify(zeit.kmh)} ${v9.slice(0, 6).join(" · ")}`);
    const strecke = streckeMessen(K.__vehicleCore, K.__gelaendeCore),
        v11 = streckeVerdict(strecke);
    check("G11 die Prüfstrecke (die fliegende Runde)", !v11.length, `${JSON.stringify(strecke.r)} ${v11.join(" · ")}`);
    if (process.argv.includes("--epoche")) {
        urteilEnde(errs.length, `\n❌ ROT — ${[...v9, ...v11].join(" · ")}`, "\n✅ GRÜN — die Zeit-Achse und die Prüfstrecke der Garage.");
        return;
    }

    // G10 der Schirm und Leicht auf der Karte (die Bildzeit voll gegen leicht als Zahl)
    const { browser, page } = await nullWelt(server, { port: PORT, art: "linse", bild: true, frist: 120000, fenster: { width: 1280, height: 720 } }, 60000, "worlds/garage/index.html", "load"); // prettier-ignore
    await page.waitForFunction(() => typeof __vehicleCore === "object" && document.querySelector("canvas") && !document.getElementById("start").disabled, { timeout: 30000 });
    await sleep(500);
    const m = { geladen: true };
    // G10: der Schirm im Standard (die Vereinigung der festen Leisten auf einem 8-px-Raster, die Schilder am Wagen), dann „Lehren"
    const schirm = () =>
        page.evaluate(() => {
            const W = innerWidth, H = innerHeight, c = 8, gx = Math.ceil(W / c), gy = Math.ceil(H / c), g = new Uint8Array(gx * gy), namen = [];
            for (const el of document.body.querySelectorAll("body > *:not(canvas):not(script)")) {
                const cs = getComputedStyle(el), r = el.getBoundingClientRect();
                if (cs.display === "none" || cs.visibility === "hidden" || cs.position !== "fixed" || !(r.width > 0 && r.height > 0)) continue;
                for (let y = Math.max(0, Math.floor(r.top / c)); y < Math.min(gy, Math.ceil(r.bottom / c)); y++)
                    for (let x = Math.max(0, Math.floor(r.left / c)); x < Math.min(gx, Math.ceil(r.right / c)); x++) g[y * gx + x] = 1;
            }
            vehicle.traverseVisible((o) => o.isSprite && namen.push(o.name));
            return { anteil: Math.round((g.reduce((a, b) => a + b, 0) / g.length) * 1000) / 10, schilder: namen.length, tafel: getComputedStyle(document.getElementById("lehren")).display !== "none" };
        });
    const s0 = await schirm();
    await page.click("#lehrenB");
    const s1 = await schirm();
    m.schirm = { anteil: s0.anteil, schilder: s0.schilder, lehrenSchilder: s1.schilder, lehrenTafel: s1.tafel };
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
    await page.evaluate(`window.__m7 = (${tempoSpion})(__vehicleCore, cam, (z) => z === car)`);
    await zug(-8, 0);
    await page.waitForFunction(() => __m7.rueck !== null, { timeout: 30000, polling: 100 }).catch(() => {});
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
    m.tempo = await page.evaluate(() => (__m7.ende(), Object.assign(__m7, { fov: undefined })));
    await page.keyboard.press("Escape");
    await sleep(200);
    m.schilderWerkstatt = (await blick()).namen.length;
    // G4/G5: Gattung und Kultur wechseln — P ist DEFAULT_P + Preset (+ die gewählte Kultur) + die Epoche des Reglers, ohne Rest;
    // Regler == Modell: was der Schöpfer an der Zeile liest (bis 02.11. suchte hier eine Abfrage #v_-Ids, die die Hülle nie baut)
    Object.assign(
        m,
        await page.evaluate(() => {
            R.setAnimationLoop(null); // die Taten bauen, nie ein Bild: die Kutsche der Probe trägt keinen Programm-Schlüssel (Lehre 26)
            const VC = __vehicleCore,
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
    // G8: die Ansicht je Modus am Wagen der Zukunft — das Bild mit gegen ohne Wagen (160×90), die Befehle des Bilds. Die Pixel
    // reisen über die RENDERER-API zurück (das Ausgabe-Ziel des Renderers, Tonkurve + sRGB wie die Leinwand, `__zielLesen`): ein
    // 2D-Abzug der WebGPU-Leinwand (drawImage) las auf der CI (Linux, swiftshader ohne Vulkan-Oberfläche) ein leeres Bild —
    // z152 02.11.: 22/25/45/44 Befehle wie lokal, Wagen 0 in jedem Modus; das Ziel liest auf jedem Backend dasselbe Bild.
    m.ansicht = await page.evaluate(async (ANSICHTEN) => {
        // die Schleife ruht seit G4 (`R.setAnimationLoop(null)` dort): gezeichnet wird nur, was G8 und G10 rufen
        P.epoche = 5;
        rebuild();
        const ziel = new THREE.RenderTarget(160, 90),
            a = {};
        R.setOutputRenderTarget(ziel);
        const bild = async (an) => {
            vehicle.visible = an;
            // ein Bild wie im Loop: erst ein Frame der Seite (Zähler, Node-Frame, der Schatten-Pass zählt mit wie in jedem Frame), dann
            // wie der Loop auf den Vorbau des Werks (`werkSteht`, w13-buehne-async: kein Bild baut seine Programme synchron)
            await new Promise(requestAnimationFrame).then(werkSteht);
            R.render(scene, kamera());
            return [R.info.render.drawCalls, await __zielLesen(ziel, 160, 90, R)];
        };
        for (const n of ANSICHTEN) {
            projSetzen(n === "seite" ? n : "iso");
            // die Explosion über ihren Regler (die erste legt Rahmen und Baukörper frei, wie der Schöpfer sie sieht)
            if (n === "explosion") Object.assign(ansichtRegler.eingabe("explode"), { value: 1 }).dispatchEvent(new Event("input", { bubbles: true }));
            explosionAnwenden((eZeig = +(n === "explosion")));
            for (let i = 0; i < 40; i++) werkOrbit(0.1), n === "animation" && animSchritt(1 / 30, i / 30);
            const ohne = (await bild(false))[1],
                [befehle, mit] = await bild(true);
            // ein Bild aus einem Farbwert ist ein Leser ohne Bild, nie ein Wagen: „leer“; der Alpha-Kanal ist in beiden Bildern
            // deckend (zählt nie, das Bild trägt 160·90·3 Farbwerte)
            a[n] = [befehle, mit.some((w) => w !== mit[0]) ? mit.filter((w, i) => Math.abs(w - ohne[i]) > 20).length / 43200 : "leer"];
        }
        return a;
    }, ANSICHTEN);
    // G10 Leicht: die Bildzeit der Isometrie AUF DER LEINWAND (Median aus 9 Bildern bis zum Ende der GPU-Arbeit; das erste baut)
    // voll gegen leicht, über den Knopf — am Wagen der Zukunft, dessen Programme G8 gebaut hat (Lehre 26: zwischen G4 und G8 baute
    // dieser Aufruf die sieben kalten Programme der Kutsche, lokal 51 s, auf der CI über die Frist der Seite: z225). DIE LEINWAND
    // ZURÜCK heißt beide Ziele: r184 `_renderScene` stellt nach dem Ausgabe-Pass `_renderTarget || _outputRenderTarget` wieder her —
    // nach einem Bild in das Ausgabe-Ziel von G8 IST es das Render-Ziel, `setOutputRenderTarget(null)` allein ließ es stehen (die
    // anderen Linsen setzen beide zurück, ausgabe-aufnahme, kamera-laub, ziel-zensus). Bis w13-wackler-heil maß G10 so das Ziel
    // 160×90 statt der Leinwand: dort halbiert „Leicht" nichts, es blieb der Schatten-Pass (swiftshader 9–13 gegen 7–9 ms, 10–38 %
    // gespart, z245 zweimal ROT); auf der Leinwand 47–59 gegen 17–22 ms. Ein Bild, das nicht auf der Leinwand liegt, ist ROT beim Namen.
    m.leicht = await page.evaluate(async () => {
        R.setOutputRenderTarget(null);
        R.setRenderTarget(null);
        projSetzen("iso"); // die Schleife ruht seit G4, gezeichnet wird nur hier
        const zeit = async () => {
            const t = [];
            for (let i = 0; i < 9; i++) {
                const a = performance.now();
                R.render(scene, kamera());
                await R.backend.device?.queue?.onSubmittedWorkDone?.();
                t.push(performance.now() - a);
            }
            return Math.round(t.sort(aufsteigend)[4]);
        };
        const voll = await zeit();
        document.getElementById("leichtB").click();
        await werkSteht(), R.render(scene, kamera()); // das erste Bild ohne Schatten (der Vorbau trägt seine Programme)
        // der letzte Blick der Seite (der Browser schließt danach): kein Zurückstellen
        return { voll, leicht: await zeit(), pr: R.getPixelRatio(), schatten: sonne.shadow.autoUpdate, leinwand: !R.getRenderTarget() };
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
        ["G10 der Schirm gehört dem Wagen: ≤ 15 % Leiste, Lehren auf Knopf, Leicht halbiert die Auflösung und lässt den Schatten ruhen", "schirm lehren-knopf leicht", `${JSON.stringify(m.schirm)} ${JSON.stringify(m.leicht)}`],
    ])
        check(name, !v.some((t) => frei.split(" ").includes(t.split(" ")[0])), detail);
    check("G7 die Probefahrt atmet das Tempo wie der Ritt", !v7.length, `${JSON.stringify(m.tempo)} ${v7}`);
    urteilEnde(errs.length, `\n❌ ROT — ${errs.length} Verletzung(en): ${[...v, ...v7, ...v9, ...v11].join(" · ")}`, "\n✅ GRÜN — die Garage: Maus, HUD, Tacho, Preset, Kultur, Lehren, Tempo, die Ansicht in jedem Modus und die Zeit-Achse.");
});
