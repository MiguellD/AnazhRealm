// diag-blick.cjs — DIE AUGEN: ein ECHTER Schuss aus dem Container, in der Welt ODER in einem Studio (der STUDIO-BLICK, 04.11.:
// ein Agent ohne GPU sieht das Vorher↔Nachher seiner Arbeit selbst — das PNG liest das Read-Werkzeug als Bild).
// Der WebGPU-Frame komponiert nicht in den puppeteer-Screenshot: gelesen wird über die RENDERER-API (r184
// readRenderTargetPixelsAsync am Ausgabe-Ziel, getont wie beim Spieler; ein r128-Studio liest seinen Zeichenpuffer im Takt).
//
//   node scripts/diag-blick.cjs [--out DIR] [--zeit 10|22] [--blick wald|boden]            die Welt (npm run blick)
//   node scripts/diag-blick.cjs --studio <name> [--ansicht a] [--sha <commit>] [--paar]   ein Studio (npm run blick:studio --)
//     Studios und Ansichten: garage iso|seite|explosion|persp · koerperstudio front|seite|nah|iso (die erste ist die Vorgabe).
//     --sha fährt den Stand eines Commits aus einem temporären Worktree; --paar legt VORHER (--sha, sonst origin/main) und
//     NACHHER (der Arbeitsbaum) nebeneinander in EIN PNG und nennt die Pixel, die sich unterscheiden.
//     Je Bild: Anteil des Objekts (das Bild mit gegen ohne Objekt), Luma-Mittel/σ, Bounding-Box [x0,y0,x1,y1] in Pixeln.
//     Die Seite zeichnet nur, was der Schuss zieht: kein requestAnimationFrame, Zeit und Zufall fest — main↔main Diff 0.
//     GEMESSEN 04.11. unter swiftshader (LINSE_GPU=software, die Schalter der CI): garage iso 5–7 s, koerperstudio front 9–14 s
//     je Bild samt Laden der Seite (Ziel ≤ 90 s).
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
        ansichten: ["iso", "seite", "explosion", "persp"],
        bereit: () => typeof vehicle === "object" && R._initialized,
        ruhe: (an) => {
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
async function schuss(ruhe, an, W, H) {
    const S = ruhe(an),
        ziel = S.R.isWebGPURenderer && new THREE.RenderTarget(W, H);
    if (ziel) S.R.setOutputRenderTarget(ziel);
    let [i, gleich, vor, mit] = [0, 0];
    const bild = async () => {
        S.scene.traverse((o) => o.isSprite && (o.visible = false));
        S.takt(i++);
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
            const r = await page.evaluate(`(${schuss})(${A.ruhe}, "${an}", ${W}, ${H})`),
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
        await window.__weltDa(() => !(!r || !st));
        await window.__weltStehtNach(); // die Welt steht (das EINE Einschwingen, welt-boot)
        if (st.renderer._isHeadlessNull) return { fatal: "Null-Renderer — ohne echten Renderer kein Schuss" };
        // Blick: Augenhöhe in den Wald ODER auf den Boden; die Zeit über die eine Zeit-Quelle
        const [pm, [dx, dy]] = [st.playerMesh.position, blick === "boden" ? [2, -2] : [30, 4]];
        st.camera.position.set(pm.x, pm.y + 1.7, pm.z);
        st.camera.lookAt(pm.x + dx, pm.y + dy, pm.z + dx);
        st.camera.updateMatrixWorld(true);
        if (zeit) st.world.timeOfDay = zeit / 24;
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
} else hauptLauf(STUDIO ? studioLauf : weltLauf);
