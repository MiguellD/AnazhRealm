// haar-kopf-probe.cjs — AUF ZEIT (w27-haar-arm-2, fällt vor der Abgabe): K6 (der Kopf im Seitwärtsgang, gate:kamera-leib:echt) je
// Spielart des Haar-Lichts in EINER Welt auf der echten Karte. Je Spielart dieselbe Messung wie die Linse (diag-kamera-laub
// `leibStrafe`: Prüfplatz, Third, A und D, je Seite `je` Proben), dazu je durchsichtigem Kopf-Pixel: Kern (das stehende Bild weicht
// vom Grund um ≥ 300 ab: die Strähne deckt ganz) oder Saum, heller als das stehende Bild oder dunkler; die Karte des Kopfs der
// schlimmsten Probe (o dicht · # durchsichtig im Kern · + durchsichtig im Saum · . Rand).
//   node scripts/haar-kopf-probe.cjs --satz a|b
"use strict";
const { statikServer, starteBrowser, buehne, ROOT: root, hauptLauf, argOpt } = require("./lib/welt-boot.cjs");
const { istHardwareAdapter } = require("./lib/software-gpu.cjs");
const PORT = Number(process.env.HAAR_KOPF_PORT || 4795);
const STRAFE = { dt: 1000 / 60, warm: 40, zwischen: 30, je: 4, kontrast: 60, halb: 0.5, kopfAnteil: 0.15, kern: 300 };
// DIE SPIELARTEN: [Name, die Farbe des Leibs (null: der Anker der Welt wie an main; sonst die Prägung des Rezepts), der Flicken auf
// HAAR_LOOK.kk.fuss (null: der Zweig)]
const DUNKEL = { skinTone: "karamell", hairColor: "darkbrown" };
const SAETZE = {
    a: [
        ["dunkel", DUNKEL, null],
        ["dunkel-streu-0.25", DUNKEL, { streu: 0.25 }],
        ["dunkel-streu-0.35", DUNKEL, { streu: 0.35 }],
        ["anker", null, null],
    ],
    b: [
        ["dunkel-streu-0.5", DUNKEL, { streu: 0.5 }],
        ["dunkel-ohne-filter", DUNKEL, { streu: 0 }],
        ["anker-streu-0.35", null, { streu: 0.35 }],
        ["dunkel#2", DUNKEL, null],
    ],
};

function mass(bew, still, ohne, W, H, k) {
    const d = (p, c) => ohne[4 * p + c] - still[4 * p + c];
    const kon = (p) => Math.abs(d(p, 0)) + Math.abs(d(p, 1)) + Math.abs(d(p, 2));
    const leib = (p) => kon(p) >= k.kontrast;
    const luma = (u, p) => 0.2126 * u[4 * p] + 0.7152 * u[4 * p + 1] + 0.0722 * u[4 * p + 2];
    const y = [];
    for (let p = 0; p < W * H; p++) if (leib(p)) y.push(p / W);
    const z = { leibPx: 0, leib: 0, kopfPx: 0, kopf: 0, kern: 0, saum: 0, heller: 0, Ls: 0, Lo: 0, Lb: 0 };
    const kopfBis = y.length ? y[0] + k.kopfAnteil * (y.at(-1) - y[0]) : 0;
    const art = new Map();
    for (let p = W; p < W * (H - 1); p++) {
        if (!leib(p)) continue;
        const kopf = p / W < kopfBis;
        if (![p, p - 1, p + 1, p - W, p + W].every(leib)) {
            if (kopf) art.set(p, ".");
            continue;
        }
        let [dd, de] = [0, 0];
        for (let c = 0; c < 3; c++) (dd += d(p, c) ** 2), (de += d(p, c) * (bew[4 * p + c] - still[4 * p + c]));
        const durch = de >= k.halb * dd;
        z.leibPx++, (z.leib += durch), (z.kopfPx += kopf), (z.kopf += kopf && durch);
        if (!kopf) continue;
        (z.Ls += luma(still, p)), (z.Lo += luma(ohne, p)), (z.Lb += luma(bew, p));
        const kern = kon(p) >= k.kern;
        if (durch) (z[kern ? "kern" : "saum"]++), (z.heller += luma(bew, p) > luma(still, p));
        art.set(p, durch ? (kern ? "#" : "+") : "o");
    }
    const xs = [...art.keys()].map((p) => p % W);
    const [x0, x1, y0] = [Math.min(...xs), Math.max(...xs), Math.floor(y[0] || 0)];
    const karte = [];
    for (let yy = y0; yy < kopfBis; yy++) {
        let s = "";
        for (let x = x0; x <= x1; x++) s += art.get(yy * W + x) || " ";
        karte.push(s.replace(/\s+$/, ""));
    }
    const n = z.kopfPx || 1;
    return { ...z, leib: z.leib / (z.leibPx || 1), kopf: z.kopf / n, durch: z.kopf, Ls: z.Ls / n, Lo: z.Lo / n, Lb: z.Lb / n, karte: karte.join("|") };
}

async function haarKopf(k) {
    const [st, mass] = [r.state, (0, eval)(`(${k.mass})`)];
    const rend = st.renderer;
    await r._foundryAwaitBook(45000);
    r.setCameraMode("third");
    [st.yaw, st.pitch] = [Math.atan2(k.blick.x - k.x, k.blick.z - k.z), 0];
    let t = performance.now();
    const bild = (dt) => new Promise(requestAnimationFrame).then(() => (r._genesisOrt(st.playerMesh.position), r._gameLoopTick(dt ? (t += dt) : (t = performance.now()))));
    const steht = (g = st.playerMesh.userData._gelenk) => st.worldMeta.genesisOrt?.steht && g && !g.istFern && g.nahStufe !== 1;
    for (let i = 0; i < 1800 && !steht(); i++) await bild();
    if (!steht()) throw new Error("Prüfplatz/Leib steht nicht");
    await __weltStehtNach(() => r._gameLoopTick(performance.now())).catch((e) => {
        if (!k.weich) throw e;
    });
    __buehne();
    const [W, H] = rend.getDrawingBufferSize(new THREE.Vector2()).toArray();
    const schuss = async () => (await __ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
    // das Haar des Spielers: die Strähnen-Teile (Klasse hair) und ihre Stoffe mit dem Lichtmodell des Stamms; `faerbe` prägt den
    // Leib (der EINE Übergabe-Kanal, null: ohne Prägung) und sammelt das Haar des neuen Gusses
    const K = AnazhRealm._haarLichtModell();
    const kk0 = window.__koerperCore.HAAR_LOOK.kk;
    let [haar, mats] = [[], new Set()];
    const faerbe = async (f) => {
        if (st.workshop) st.workshop.studioOv = {};
        if (f) r._studioUebergabeEmpfang({ type: "uebergabe", world: "probe", kind: "koerper", preset: "mensch", seed: 0, ov: f });
        else r.applyPlayerSoul(st.player.soul || "human");
        for (let i = 0; i < 600 && !steht(); i++) await bild();
        haar = [];
        st.playerMesh.traverse((o) => o.isMesh && (o.userData.__klasse || o.material?.userData?.__klasse) === "hair" && haar.push(o));
        mats = new Set(haar.map((o) => o.material));
    };
    const setze = (name, o) => {
        for (const m of mats) {
            if (!m.userData.__lichtOrig) m.userData.__lichtOrig = [m.setupLightingModel, m.customProgramCacheKey, m.setupLightingModel()];
            const [lm0, key0, inst] = m.userData.__lichtOrig;
            if (!o) [m.setupLightingModel, m.customProgramCacheKey] = [lm0, key0];
            else {
                const kk = { ...kk0, fuss: { ...kk0.fuss, ...o } };
                m.setupLightingModel = () => new K(kk, { ...inst.faser, lappen: K.lappen(kk, inst.faser.unter) });
                m.customProgramCacheKey = function () {
                    return key0.call(this) + "|" + name;
                };
            }
            m.needsUpdate = true;
        }
        window.__bundlesNeu && window.__bundlesNeu();
    };
    const farbe = (o) => {
        const c = o.geometry.attributes.color;
        let s = [0, 0, 0];
        for (let i = 0; i < c.count; i++) for (let f = 0; f < 3; f++) s[f] += c.getComponent(i, f) / c.count;
        return s.map((v) => +v.toFixed(4));
    };
    const out = { traa: !!st.traaNode, W, H, staende: [] };
    let farbe0;
    for (const [name, f, o] of k.staende) {
        if (JSON.stringify(f) !== farbe0) await faerbe(f), (farbe0 = JSON.stringify(f));
        setze(name, o);
        await schuss(); // die Pipeline der Spielart baut hier
        st._traaR && (st._traaR.neu = true);
        const proben = [];
        for (const seite of ["KeyA", "KeyD"]) {
            const taste = (art) => dispatchEvent(new KeyboardEvent(art, { bubbles: true, code: seite, key: seite[3].toLowerCase() }));
            taste("keydown");
            for (let j = 0; j < k.je; j++) {
                for (let i = 0; i < (j ? k.zwischen : k.warm); i++) await bild(k.dt);
                const rt = new THREE.RenderTarget(W, H);
                rend.setOutputRenderTarget(rt);
                for (let i = 0, g0 = r._gpuLeine.gerendert; i < 20 && r._gpuLeine.gerendert === g0; i++) await bild(k.dt);
                rend.setOutputRenderTarget(null);
                rend.setRenderTarget(null);
                const [bew, still, weg] = [await __zielLesen(rt, W, H), await schuss(), []];
                rt.dispose();
                st.playerMesh.traverse((n) => n.isMesh && n.layers.mask & 1 && weg.push(n) && (n.layers.mask ^= 1));
                const ohne = await schuss();
                for (const n of weg) n.layers.mask ^= 1;
                st._traaR && (st._traaR.neu = true);
                proben.push({ seite: seite[3], probe: j, ...mass(bew, still, ohne, W, H, k) });
            }
            taste("keyup");
            for (let i = 0; i < 20; i++) await bild(k.dt);
        }
        out.staende.push({ name, proben, haar: haar.filter((o) => o.geometry.attributes.aHaarT).map(farbe) });
    }
    return out;
}

hauptLauf(async () => {
    const satz = argOpt("--satz", "a");
    const server = statikServer({ root });
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 900000 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const hart = istHardwareAdapter(browser.adapter);
    const adresse = hart ? "index.html" : "index.html?holz=" + (process.env.HAAR_KOPF_HOLZ || "kienspan");
    await page.evaluate(() => window.__erstRuhe?.(() => {}, { erstFristMs: 6e5 }, "der Abschied der Welt"));
    await server.zeige(page, 0, adresse);
    await page.evaluate(async () => (await __weltDa((r) => r.state.rendererReady)).state.renderer.setAnimationLoop(null));
    await buehne(page);
    const m = await page.evaluate(haarKopf, { ...STRAFE, ...require("./lib/welt-orte.cjs").messort("genesis"), mass: `${mass}`, staende: SAETZE[satz], weich: !hart });
    await browser.close();
    server.close();
    const p1 = (x) => (100 * x).toFixed(1);
    console.log(`✅ HAAR ${m.W}×${m.H} · zeitliche Auflösung ${m.traa ? "an" : "AUS"} · Farbe der Strähnen ${m.staende.map((s) => s.name + " " + s.haar.join("/")).join(" · ")}`.slice(0, 590));
    const karten = [];
    for (const s of m.staende) {
        const P = s.proben;
        const sum = (f) => P.reduce((a, b) => a + f(b), 0);
        const [n, durch] = [sum((b) => b.kopfPx), sum((b) => b.durch)];
        console.log(
            `✅ ${s.name}: Kopf ${P.map((b) => b.seite + b.probe + " " + p1(b.kopf)).join(" · ")} % · Mittel ${p1(durch / (n || 1))} % · durch ${durch} von ${n} px: Kern ${sum((b) => b.kern)} Saum ${sum((b) => b.saum)} · heller ${sum((b) => b.heller)} · Luma still ${(sum((b) => b.Ls) / P.length).toFixed(1)} bew ${(sum((b) => b.Lb) / P.length).toFixed(1)} ohne ${(sum((b) => b.Lo) / P.length).toFixed(1)} · Leib ${P.map((b) => p1(b.leib)).join("/")}`.slice(0, 590)
        );
        const w = [...P].sort((a, b) => b.kopf - a.kopf)[0];
        karten.push(`✅ KARTE ${s.name} ${w.seite}${w.probe}: ${w.karte}`.slice(0, 590));
    }
    for (const z of karten) console.log(z);
    process.exit(0);
});
