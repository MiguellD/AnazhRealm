// diag-blick.cjs — DIE AUGEN: ein ECHTER Schuss aus dem Container, in der Welt ODER in einem Studio (der STUDIO-BLICK, 04.11.:
// ein Agent ohne GPU sieht das Vorher↔Nachher seiner Arbeit selbst — das PNG liest das Read-Werkzeug als Bild).
// Der WebGPU-Frame komponiert nicht in den puppeteer-Screenshot: gelesen wird über die RENDERER-API (r184
// readRenderTargetPixelsAsync am Ausgabe-Ziel, getont wie beim Spieler; ein r128-Studio liest seinen Zeichenpuffer im Takt).
//
//   node scripts/diag-blick.cjs [--out DIR] [--zeit 10|22] [--blick wald|boden]            die Welt (npm run blick)
//   node scripts/diag-blick.cjs --studio <name> [--ansicht a] [--sha <commit>] [--paar] [--uhr frueh|mittag|spaet|0..1] [--nackt]
//     ein Studio (npm run blick:studio --); --uhr und --nackt stellen die EINE Bühne (garage, schmiede: AnazhHuelle.buehne)
//     Studios und Ansichten: garage iso|seite|explosion|persp|strecke [--epoche 0…5] · koerperstudio front|seite|nah|iso (die erste ist die Vorgabe).
//     --sha fährt den Stand eines Commits aus einem temporären Worktree; --paar legt VORHER (--sha, sonst origin/main) und
//     NACHHER (der Arbeitsbaum) nebeneinander in EIN PNG und nennt die Pixel, die sich unterscheiden.
//     Je Bild: Anteil des Objekts (das Bild mit gegen ohne Objekt), Luma-Mittel/σ, Bounding-Box [x0,y0,x1,y1] in Pixeln.
//     Die Seite zeichnet nur, was der Schuss zieht: kein requestAnimationFrame, Zeit und Zufall fest — main↔main Diff 0.
//     GEMESSEN 04.11. unter swiftshader (LINSE_GPU=software, die Schalter der CI): garage iso 5–7 s, koerperstudio front 9–14 s
//     je Bild samt Laden der Seite (Ziel ≤ 90 s).
//   node scripts/diag-blick.cjs --werk <rezept> [--same n] [--lod n] [--uhr frueh|mittag|spaet|0..1] [--nackt] [--boden y] [--ov JSON]   EIN Werk
//     auf der EINEN Bühne der Studios, ohne die Welt (npm run blick:werk --): die Engine der Welt, ihr Licht an ihrer Uhr, ihr Stoff
//     (der Stamm ohne Ankunft, der Foundry-Faden) — vier Blicke um das Werk im Streiflicht (Vorgabe: früh, die Sonne 15° hoch),
//     nebeneinander in EINEM PNG; `--nackt` zeigt die Form allein in der 18-%-Karte. Rezepte: jede id eines Gesetzbuchs (gt ·
//     kathedrale · viktorianisch · langschwert · eiche …).
//   node scripts/diag-blick.cjs --selftest   ein leeres und ein uniformes Bild und ein Studio ohne Objekt sind ROT („blinder Blick“)
//   Ergebnis: PNG in DIR (Vorgabe: die Wurzel) + Exit 0, wenn jedes Bild SUBSTANZ trägt, sonst Exit 1 mit dem Grund.
"use strict";
const {
    statikServer,
    starteBrowser,
    ROOT: root,
    hauptLauf,
    seiteZu,
    path,
    os,
    argOpt,
    pngDatei,
    SELBSTTEST,
    selbsttestEnde,
    taeterFaelle,
    urteilEnde,
} = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const { bildMasse, bildRauschen, pngLesen } = require("./lib/abnahme-urteil.cjs");

const [OUT, STUDIO, W, H] = [argOpt("--out", root), argOpt("--studio", ""), 640, 360];
const git = (...a) => require("child_process").execFileSync("git", a, { cwd: root, encoding: "utf8" }).trim();
const pixel = (url) => pngLesen(Buffer.from(url.split(",")[1], "base64")).u8;

// DAS URTEIL EINES BILDS (rein): Luma und σ (die Bild-Maße der Abnahme), mit dem Bild `ohne` Objekt sein Anteil und seine Box
// (Kanal-Summe > 20 verschieden). Blind ist ein Bild ohne Pixel, eines aus einer Fläche (σ < 2) und eines, in dem das Objekt
// unter 0,5 % deckt.
function bildZahlen(u8, ohne) {
    const m = bildMasse(u8, W, H);
    if (!m) return { blind: "keine Pixel" };
    const z = {
        luma: m.mittel,
        sigma: m.sigma,
        ...(ohne && { anteil: bildRauschen(u8, ohne, W, H, 20).anteil, box: [W, H, -1, -1] }),
    };
    for (let p = 0; ohne && p < W * H; p++)
        if ([0, 1, 2].reduce((s, k) => s + Math.abs(u8[p * 4 + k] - ohne[p * 4 + k]), 0) > 20) {
            const [x, y, b] = [p % W, Math.floor(p / W), z.box];
            z.box = [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)];
        }
    z.blind = m.sigma < 2 ? `uniform (σ ${m.sigma})` : z.anteil < 0.005 ? `Objekt fehlt (Anteil ${z.anteil})` : "";
    return z;
}

// DIE STUDIOS: ihr Bereit-Zeichen und ihre RUHE (Seiten-Kontext): die Ansicht über die Schalter des Studios, Zeit und Blinzeln
// fest, Lehren aus; zurück kommen Renderer, Szene, das Objekt und der EINE Takt der Seite (ihr Bild).
const STUDIOS = {
    garage: {
        ansichten: ["iso", "seite", "explosion", "persp", "strecke"],
        bereit: () => typeof vehicle === "object" && R._initialized && (typeof bahn === "undefined" || bahn),
        // `--epoche e` stellt die Zeit-Achse (w11-fahrzeug); `strecke`: die Prüffahrt, der Fahrer der Linie bis in den Flug über dem
        // Kicker (Punkt 668 der Bahn), gezeichnet aus der Kamera der Fahrt
        ruhe: (an) => {
            if (window.__epoche !== "") (P.epoche = +window.__epoche), rebuild();
            if (an === "strecke") {
                enterDrive(true);
                while (pruef.i < 668) updateVehicle(1 / 60, 0), updateChaseCam(1 / 60);
                return { R, scene, objekt: vehicle, takt: () => (raederSetzen(), R.render(scene, cam)) };
            }
            [simT, tAlt, ANS.explode] = [0, 0, +(an === "explosion")];
            projSetzen(an === "explosion" ? "iso" : an);
            explosionAnwenden((eZeig = ANS.explode));
            gCal.visible = false;
            return { R, scene, objekt: vehicle, takt: (i) => (_wecke(), animate(1000 + (i * 1000) / 60)) };
        },
    },
    koerperstudio: {
        ansichten: ["front", "seite", "nah", "iso"],
        bereit: () => window.gestalt && window.character,
        ruhe: (an) => {
            clock.getElapsedTime = () => 0;
            _blkNext = 1e9;
            const b = new THREE.Box3().setFromObject(gestalt.root),
                c = b.getCenter(new THREE.Vector3()),
                h = b.max.y - b.min.y;
            if (an === "nah") c.y = b.max.y - 0.12 * h;
            const d = ((an === "nah" ? 0.35 : 1.3) * h) / 2 / Math.tan((camera.fov * Math.PI) / 360);
            controls.target.copy(c);
            camera.position
                .copy(c)
                .add(
                    new THREE.Vector3(
                        ...{ front: [0, 0, 1], nah: [0, 0, 1], seite: [1, 0, 0], iso: [1, 0.8, 1] }[an]
                    ).setLength(d)
                );
            controls.update();
            return { R: renderer, scene, objekt: gestalt.root, takt: animate };
        },
    },
};
// DER HALT vor dem ersten Skript der Seite: kein requestAnimationFrame läuft, jedes Bild zieht der Schuss; der Zufall zieht aus
// einem festen Samen — die Seite steht bei jedem Laden im selben Zustand
const HALT = () => {
    let s = 7;
    window.requestAnimationFrame = () => 0;
    Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
};
// DER SCHUSS (Seiten-Kontext): die Ruhe, Takte bis drei Bilder gleich sind (mindestens 12, höchstens 120), dann dasselbe Bild
// ohne Objekt. WebGPU liest das Ausgabe-Ziel, WebGL seine Leinwand im selben Takt (vor dem Komponieren, toDataURL).
async function schuss(ruhe, an, W, H, licht) {
    const S = ruhe(an),
        ziel = S.R.isWebGPURenderer && new THREE.RenderTarget(W, H);
    if (ziel) S.R.setOutputRenderTarget(ziel);
    let [i, gleich, vor, mit] = [0, 0];
    // DIE EINE BÜHNE (worlds/huelle/huelle.js `buehne`): ihr Bild steht erst, wenn ihr Licht liegt und der Vorbau durch ist — der
    // Schuss taktet, bis sie eines gezeichnet hat. Bis w28-studio-welt las er nach dem ersten Takt ein Ziel ohne Bild (seit dem
    // Vorbau der Garage, w13-buehne-async: „Cannot read properties of undefined (reading 'format')“ an main a41ce72d).
    const B = window.AnazhHuelle && AnazhHuelle.buehneDerSeite;
    if (B) await B.steht;
    // die Uhr und die Karte der Bühne (`--uhr`, `--nackt`): das Licht entsteht am stehenden Werk neu
    if (licht && (licht.uhr || licht.nackt)) {
        if (!B) throw new Error("--uhr/--nackt: das Studio steht nicht auf der EINEN Bühne (AnazhHuelle.buehne)");
        if (licht.uhr) await B.uhr(licht.uhr in B.stunden() ? licht.uhr : +licht.uhr);
        if (licht.nackt) B.nackt(true);
    }
    const bild = async () => {
        S.scene.traverse((o) => o.isSprite && (o.visible = false));
        const n0 = B ? B.bildN : -1;
        S.takt(i++);
        for (let n = 0; B && B.bildN === n0 && n < 3000; n++) await new Promise((r) => setTimeout(r, 10)), S.takt(i);
        return ziel ? __png(await __zielLesen(ziel, W, H, S.R), W, H) : S.R.domElement.toDataURL();
    };
    while (i < 120 && (gleich < 3 || i < 12)) {
        mit = await bild();
        gleich = mit === vor ? gleich + 1 : 0;
        vor = mit;
    }
    S.objekt.visible = false;
    return { mit, ohne: await bild(), ruht: gleich >= 3 };
}

async function studioLauf() {
    const [A, paar] = [STUDIOS[STUDIO], process.argv.includes("--paar")],
        an = argOpt("--ansicht", A?.ansichten[0]),
        sha = argOpt("--sha", paar ? "origin/main" : "");
    if (!A?.ansichten.includes(an))
        urteilEnde(
            1,
            `unbekannt: ${STUDIO} ${an} — ${Object.keys(STUDIOS).map((k) => `${k} ${STUDIOS[k].ansichten}`)}`
        );
    const browser = await starteBrowser({ art: SELBSTTEST ? "null" : "linse", frist: 600000 }),
        bilder = [];
    for (const st of [sha && git("rev-parse", sha), (paar || !sha) && "baum"].filter(Boolean)) {
        const [t0, dir, page] = [
            Date.now(),
            st === "baum" ? root : path.join(os.tmpdir(), `studio-blick-${st}`),
            await browser.newPage(),
        ];
        if (st !== "baum") git("worktree", "add", "--detach", dir, st);
        const s = statikServer({ root: dir });
        try {
            await s.lausche(0);
            await page.setViewport({ width: W, height: H });
            await page.evaluateOnNewDocument(HALT);
            await s.zeige(page, 120000, `worlds/${STUDIO}/index.html`, "networkidle0");
            await page.waitForFunction(A.bereit, { timeout: 120000 });
            await page.evaluate((e) => (window.__epoche = e), argOpt("--epoche", ""));
            const r = await page.evaluate(`(${schuss})(${A.ruhe}, "${an}", ${W}, ${H}, ${JSON.stringify({ uhr: argOpt("--uhr", ""), nackt: process.argv.includes("--nackt") })})`),
                mit = pixel(r.mit);
            bilder.push({
                st,
                page,
                mit,
                url: r.mit,
                z: { ...bildZahlen(mit, pixel(r.ohne)), ruht: r.ruht, s: (Date.now() - t0) / 1000 },
            });
        } finally {
            s.close();
            if (st !== "baum") git("worktree", "remove", "--force", dir);
        }
    }
    // EIN PNG: die Bilder nebeneinander (8 px Fuge), links VORHER
    const datei = path.join(OUT, `studio-${STUDIO}-${an}-${bilder.map((b) => b.st.slice(0, 8)).join("-")}.png`);
    const nebeneinander = async (urls, W, H) => {
        const c = Object.assign(document.createElement("canvas"), { width: urls.length * (W + 8) - 8, height: H });
        for (const [k, src] of urls.entries()) {
            const bild = Object.assign(new Image(), { src });
            await bild.decode();
            c.getContext("2d").drawImage(bild, k * (W + 8), 0);
        }
        return c.toDataURL();
    };
    pngDatei(
        datei,
        await bilder.at(-1).page.evaluate(
            nebeneinander,
            bilder.map((b) => b.url),
            W,
            H
        )
    );
    await browser.close();
    console.log(`\n===== DER STUDIO-BLICK — ${STUDIO} ${an} =====\n${datei}`);
    for (const b of bilder) console.log(`  ${b.st.slice(0, 12)}: ${JSON.stringify(b.z)}`);
    if (paar)
        console.log(`  Diff VORHER↔NACHHER: ${JSON.stringify(bildRauschen(bilder[0].mit, bilder[1].mit, W, H, 0))}`);
    const blind = bilder.filter((b) => b.z.blind).map((b) => `${b.st.slice(0, 8)} ${b.z.blind}`);
    urteilEnde(blind.length, `❌ ROT — blinder Blick: ${blind.join(" · ")}`, "✅ GRÜN — der Blick sieht das Studio.");
}

// ── DER WERK-BLICK (w28-studio-welt): EIN Werk eines Gesetzbuchs auf der EINEN Bühne der Studios (worlds/huelle/huelle.js `buehne`:
// die Engine der Welt, ihr Licht an ihrer Uhr, ihr Stoff über den Stamm ohne Ankunft, der Foundry-Faden) — ohne die Welt, in
// Sekunden. Vier Blicke um das Werk (die Vorschau-Pose der Welt, Gier 0,6 + k·90°, Neigung 0,32) im Streiflicht, im Stoff der
// Welt oder nackt (die 18-%-Karte), nebeneinander in EINEM PNG. Die Seite trägt NUR die Hülle: Engine, Kerne, Licht und Stamm holt
// die Bühne selbst aus der EINEN Liste der Welt — was der Blick zeigt, zeichnet der Code, mit dem jedes Studio auf ihr zeichnet.
const WERK_BLICKE = [0, 1, 2, 3].map((k) => ({ name: ["vorn", "rechts", "hinten", "links"][k], gier: 0.6 + (k * Math.PI) / 2 }));
const werkSeite = () =>
    `<!doctype html><meta charset="utf-8"><title>werk-blick</title><body style="margin:0;background:#000"><script src="/worlds/huelle/huelle.js"></script></body>`;
async function werkSchuss(w, o, blicke, W, H) {
    await AnazhHuelle.weltThree(); // die Engine der Welt aus der EINEN Liste (Import-Karte + Bootstrap von index.html)
    const [T, t0, ms] = [THREE, performance.now(), {}];
    const szene = new T.Scene();
    const B = AnazhHuelle.buehne({ szene, uhr: 0.5, sonnenWeite: 80 });
    await B.steht;
    ms.licht = Math.round(performance.now() - t0);
    const st = B.stunden();
    if (o.uhr !== "mittag") await B.uhr(o.uhr in st ? o.uhr : +o.uhr);
    const uhr = B.uhrIst();
    const t1 = performance.now();
    const g = await B.werk(w);
    ms.werk = Math.round(performance.now() - t1);
    szene.add(g);
    g.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(g),
        c = bb.getCenter(new T.Vector3()),
        rad = bb.getSize(new T.Vector3()).length() / 2;
    // der Boden der Atmosphäre unter dem Fuß des Werks, die Sonne über ihm (der Schatten trägt das Streiflicht)
    const boden = new T.Mesh(
        new T.PlaneGeometry(60 * rad, 60 * rad),
        new T.MeshStandardMaterial({ color: new T.Color().setRGB(...__weltLicht.ATMO_BODEN, T.LinearSRGBColorSpace), roughness: 1, metalness: 0 })
    );
    boden.rotation.x = -Math.PI / 2;
    boden.position.set(c.x, o.boden == null ? bb.min.y : o.boden, c.z);
    boden.receiveShadow = true;
    szene.add(boden);
    Object.assign(B.sonne.shadow.camera, { left: -2.2 * rad, right: 2.2 * rad, top: 2.2 * rad, bottom: -2.2 * rad, near: 1, far: 160 + 4 * rad });
    B.sonne.shadow.camera.updateProjectionMatrix();
    B.sonneUeber(c.x, c.y, c.z);
    if (o.nackt) B.nackt(true);
    const ziel = new T.RenderTarget(W, H);
    B.renderer.setOutputRenderTarget(ziel);
    const cam = new T.PerspectiveCamera(45, W / H, Math.min(0.1, rad / 10), Math.max(200, 32 * rad));
    const bild = async () => {
        await B.werkSteht(cam);
        for (let n = 0; n < 2; n++) {
            while (!B.bild(cam)) await new Promise((r) => setTimeout(r, 20));
            await new Promise((r) => setTimeout(r, 20));
        }
        return __png(await __zielLesen(ziel, W, H, B.renderer), W, H);
    };
    const [cp, sp, bilder, t2] = [Math.cos(0.32), Math.sin(0.32), [], performance.now()];
    let tris = 0;
    g.traverse((x) => x.isMesh && (tris += (x.geometry.index ? x.geometry.index.count : x.geometry.attributes.position.count) / 3));
    for (const b of blicke) {
        // der Abstand, bei dem die Hüllkugel des Werks die Bildhöhe füllt
        cam.position.set(c.x + cp * Math.cos(b.gier), c.y + sp, c.z + cp * Math.sin(b.gier)).sub(c).multiplyScalar((rad * 1.08) / Math.sin((cam.fov * Math.PI) / 360)).add(c);
        cam.lookAt(c);
        cam.updateMatrixWorld(true);
        g.visible = true;
        const mit = await bild();
        g.visible = false;
        bilder.push({ name: b.name, mit, ohne: await bild() });
    }
    ms.bilder = Math.round(performance.now() - t2);
    const info = B.renderer.backend.device.adapterInfo;
    return { bilder, uhr, ms, tris, teile: g.children.length, adapter: info.description || info.vendor, stoffe: [...new Set(g.children.map((x) => x.material.type))] };
}
async function werkLauf() {
    const w = { preset: argOpt("--werk", ""), seed: +argOpt("--same", "1"), lod: +argOpt("--lod", "0"), ov: JSON.parse(argOpt("--ov", "null")) };
    // `--boden y`: die Höhe des Bodens im Rahmen des Werks (ein Haus: 0, sein Keller liegt im Gelände); ohne Wort der Fuß des Werks
    const boden = argOpt("--boden", "");
    const o = { uhr: argOpt("--uhr", "frueh"), nackt: process.argv.includes("--nackt"), boden: boden === "" ? null : +boden };
    const [t0, server, browser] = [Date.now(), statikServer({ seiten: { "/__werk-blick.html": werkSeite } }), await starteBrowser({ art: SELBSTTEST ? "null" : "linse", frist: 600000 })];
    const page = await browser.newPage();
    await server.lausche(0);
    await page.setViewport({ width: W, height: H });
    await server.zeige(page, 120000, "__werk-blick.html", "load");
    const r = await page.evaluate(werkSchuss, w, o, WERK_BLICKE, W, H);
    const datei = path.join(OUT, `werk-${w.preset}-L${w.lod}-${o.uhr}${o.nackt ? "-nackt" : ""}.png`);
    const nebeneinander = async (urls, W, H) => {
        const c = Object.assign(document.createElement("canvas"), { width: urls.length * (W + 8) - 8, height: H });
        for (const [k, src] of urls.entries()) {
            const b = Object.assign(new Image(), { src });
            await b.decode();
            c.getContext("2d").drawImage(b, k * (W + 8), 0);
        }
        return c.toDataURL();
    };
    pngDatei(datei, await page.evaluate(nebeneinander, r.bilder.map((b) => b.mit), W, H));
    const zahlen = r.bilder.map((b) => ({ name: b.name, ...bildZahlen(pixel(b.mit), pixel(b.ohne)) }));
    await seiteZu(browser, server, {}, `\n===== DER WERK-BLICK — ${w.preset} L${w.lod} (Same ${w.seed}) · Uhr ${r.uhr} · ${o.nackt ? "nackt" : "im Stoff der Welt"} =====`, "fatal");
    console.log(datei);
    console.log(`  ${r.teile} Teile · ${Math.round(r.tris)} △ · Stoffe ${r.stoffe} · ${r.adapter} · Licht ${r.ms.licht} ms · Werk ${r.ms.werk} ms · vier Bilder ${r.ms.bilder} ms · ganz ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    for (const z of zahlen) console.log(`  ${z.name}: ${JSON.stringify({ anteil: z.anteil, luma: z.luma, sigma: z.sigma, box: z.box })}`);
    const blind = zahlen.filter((z) => z.blind).map((z) => `${z.name} ${z.blind}`);
    urteilEnde(blind.length, `❌ ROT — blinder Blick: ${blind.join(" · ")}`, "✅ GRÜN — der Blick sieht das Werk auf der Bühne der Welt.");
}

async function weltLauf() {
    const [server, browser] = [
            statikServer(),
            await starteBrowser({ art: SELBSTTEST ? "null" : "linse", frist: 600000 }),
        ],
        page = await browser.newPage();
    await server.lausche(0);
    await page.setViewport({ width: W, height: H });
    // KEIN Null-Renderer — die Augen brauchen den echten (WebGPU via swiftshader-Vulkan).
    await server.zeige(page, 60000);
    await page.evaluate(AUSGABE_INSTALL); // die EINE Aufnahme: der echte Frame, getont wie beim Spieler
    const welt = async (zeit, blick, W, H) => {
        await window.__weltDa(() => r && st);
        await window.__weltStehtNach(); // die Welt steht (das EINE Einschwingen, welt-boot)
        if (st.renderer._isHeadlessNull) return { fatal: "Null-Renderer — ohne echten Renderer kein Schuss" };
        // Blick: Augenhöhe in den Wald ODER auf den Boden; die Zeit über die eine Zeit-Quelle
        const [pm, [dx, dy]] = [st.playerMesh.position, blick === "boden" ? [2, -2] : [30, 4]];
        st.camera.position.set(pm.x, pm.y + 1.7, pm.z);
        st.camera.lookAt(pm.x + dx, pm.y + dy, pm.z + dx);
        st.camera.updateMatrixWorld(true);
        if (zeit) r.setTimeOfDay(zeit / 24, "regler");
        await __takte(20, 30); // echte Loop-Ticks, damit Uniforms/Streaming den Blick tragen
        // GEMESSEN: der WebGPU-Readback liefert die Zeilen TOP-DOWN — kein Y-Flip
        return { png: __png((await window.__ausgabeAufnahme(W, H, 1)).u8, W, H) };
    };
    const out = await page.evaluate(
        welt,
        process.env.BLICK_ZEIT || argOpt("--zeit", ""),
        argOpt("--blick", "wald"),
        W,
        H
    );
    // die Seiten-Fehler nennt der EINE Sammler (welt-boot)
    await seiteZu(browser, server, out, "\n===== DIE AUGEN (T0) — der Welt-Schuss =====", "fatal");
    const [z, datei] = [bildZahlen(pixel(out.png)), path.join(OUT, `blick-${Date.now()}.png`)];
    pngDatei(datei, out.png);
    console.log(`Schuss: ${datei} · ${JSON.stringify(z)}`);
    urteilEnde(z.blind, `❌ ROT — blinder Blick: ${z.blind}`, "✅ GRÜN — die Augen sehen (Substanz im Bild).");
}

if (SELBSTTEST) {
    const bild = (f) => Uint8Array.from({ length: W * H * 4 }, (_, i) => f((i >> 2) % W, Math.floor(i / 4 / W))),
        grund = bild((x, y) => (x * 3 + y * 5) % 200),
        mit = bild((x, y) => (x > 100 && x < 300 && y > 50 && y < 250 ? 250 : (x * 3 + y * 5) % 200)),
        z = bildZahlen(mit, grund),
        faelle = [
            ["leeres Bild", [], null, /keine Pixel/],
            ["uniformes Bild", bild(() => 90), null, /uniform/],
            ["Studio ohne Objekt", grund, grund, /Objekt fehlt/],
        ].map(([name, a, b, muss]) => ({ name, z: bildZahlen(a, b), muss }));
    z.blind ||=
        `${z.box}` !== "101,51,299,249" || bildRauschen(grund, mit, W, H, 0).pixel !== 199 * 199
            ? `Box/Paar ${JSON.stringify(z)}`
            : "";
    const fehler = taeterFaelle([...faelle, { name: "Studio mit Objekt: Box und Paar", z, muss: null }], (z) =>
        [z.blind].filter(Boolean)
    );
    selbsttestEnde(fehler, "der blinde Blick fällt rot, Box und Paar zählen jedes Pixel.");
} else hauptLauf(argOpt("--werk", "") ? werkLauf : STUDIO ? studioLauf : weltLauf);
