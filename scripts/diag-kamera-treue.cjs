#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kamera-treue.cjs — DIE KAMERA-TREUE-WAND (gate:kamera-treue, 04.10.)
//
// Befund (echte GPU, Mess-Wiese −900/−850, Werkbank, EINE Welt): die Region-RenderBundles trugen die Kamera nicht.
// r184 hält `_currentRenderBundle` ohne Stapel; das erste lichtempfangende Objekt im Hauptpass löst den Schatten-
// Render aus (ShadowNode.updateBefore), dessen eigener Bundle-Durchlauf den Zeiger auf null setzt — die Region nahm
// 129 Draws auf und verfolgte 1. Der Replay refresht nur Verfolgte: zwei Blicke in entgegengesetzte Richtungen
// waren zu 98 % pixelgleich, auch mit dem Nachziehen der geteilten Gruppen (8cf8cb5). Die Bundles fielen; die Region
// ist eine schlichte Gruppe mit derselben Kugel, jedes Mitglied zeichnet direkt.
//
// Die Wand nennt jeden Rückkehrer beim Namen (echter Renderer, swiftshader, Software-Holz `kienspan`):
//   (a) ZENSUS — kein Objekt der Szene ist eine BundleGroup; jede lebende Region (`x,z` · `s:x,z`) ist eine Gruppe
//       mit ihrer Kugel (`userData.cullSphere`), ihre Mitglieder cullen nicht selbst (die Kugel besitzt die Sicht).
//       Lauf-Kontrolle: eine eingeschleuste BundleGroup `region:SELBST` MUSS genannt werden. REGION-PROBE am echten
//       Chokepoint (die Mess-Wiese trägt heute keine regionale Gruppe): `_archRegionGruppeFor` mintet eine Region vor
//       und eine hinter der Kamera, `_loopFrustumCulling` → `_archRegionCull` zeigt die vordere und verbirgt die
//       hintere, `_archMeshAushaengen` nimmt die geleerte Region aus Szene und Karte.
//   (b) ABSENZ am Code (window.__codeOf, Kommentare bereinigt) — keine Methode des Stamms trägt `BundleGroup`,
//       `_renderBundle` oder `executeBundles`.
//   (c) BILD — die Diät des Spiels zeichnet nach einem Blick X den Blick Y wie die Vendor-Bahn (jedes Objekt voll
//       refresht): Anteil gleicher Pixel ≥ 0,999 bei eingefrorener Zeit. Lauf-Kontrolle: eine Abkürzung OHNE
//       Schreiben der geteilten Gruppen (die Klasse der Bundle-Abkürzung V18.518) MUSS sichtbar abweichen (< 0,95)
//       — sonst ist die Bild-Probe blind und die Wand rot.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil über einen grünen Zensus und je einen
// injizierten Täter (BundleGroup in der Szene · Region ohne Kugel · Methode mit BundleGroup · Bild klebt ·
// blinde Bild-Probe) — jeder fällt rot und wird genannt.
//   node scripts/diag-kamera-treue.cjs [--selftest]   (npm run gate:kamera-treue)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const BILD_SOLL = 0.999; // die Diät zeichnet wie die Vendor-Bahn
const BLIND_GRENZE = 0.95; // die kaputte Abkürzung MUSS darunter liegen

function urteil(z) {
    const v = [];
    for (const n of z.bundleGruppen) v.push(`ZENSUS: \`${n}\` ist eine BundleGroup (der Replay trägt die Kamera nicht)`);
    if (!z.selbstBundleGenannt) v.push("ZENSUS: die eingeschleuste BundleGroup `region:SELBST` blieb ungenannt (der Zensus ist blind)");
    const p = z.regionProbe || {};
    if (!(p.gruppe === true && p.kugel === true)) v.push("REGION: `_archRegionGruppeFor` mintet keine schlichte Gruppe mit Kugel");
    if (!(p.vorn === true && p.hinten === false))
        v.push(`REGION: der Region-Cull wirkt nicht (vor der Kamera sichtbar=${p.vorn}, dahinter sichtbar=${p.hinten})`);
    if (p.raus !== true) v.push("REGION: eine geleerte Region blieb in Szene oder Karte (Leck)");
    for (const n of z.regionOhneKugel) v.push(`ZENSUS: Region \`${n}\` trägt keine Kugel (userData.cullSphere)`);
    for (const n of z.regionKeineGruppe) v.push(`ZENSUS: Region \`${n}\` ist keine schlichte Gruppe`);
    for (const n of z.mitgliedCulltSelbst) v.push(`ZENSUS: Mitglied \`${n}\` cullt selbst (die Region-Kugel besitzt die Sicht)`);
    for (const n of z.codeTraeger) v.push(`ABSENZ: Methode \`${n}\` trägt BundleGroup/_renderBundle/executeBundles`);
    if (!(z.bild.diaet >= BILD_SOLL))
        v.push(
            `BILD: nach Blick X zeichnet die Diät Blick Y zu ${z.bild.diaet} gleich mit der Vendor-Bahn (Soll ≥ ${BILD_SOLL}) — ein Programm klebt an der alten Kamera`
        );
    if (!(z.bild.kaputt < BLIND_GRENZE))
        v.push(
            `BILD: die Abkürzung ohne Schreiben zeichnet Y zu ${z.bild.kaputt} gleich (Soll < ${BLIND_GRENZE}) — die Bild-Probe ist blind`
        );
    return v;
}

function selbsttest() {
    const gruen = {
        bundleGruppen: [],
        selbstBundleGenannt: true,
        regionen: 4,
        regionProbe: { gruppe: true, kugel: true, vorn: true, hinten: false, raus: true },
        regionOhneKugel: [],
        regionKeineGruppe: [],
        mitgliedCulltSelbst: [],
        codeTraeger: [],
        bild: { diaet: 1, kaputt: 0.31 },
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Zensus fällt rot: " + urteil(gruen).join(" · "));
    const faelle = [
        { name: "BundleGroup in der Szene", z: { ...gruen, bundleGruppen: ["regionBundle:@global"] }, muss: /`regionBundle:@global` ist eine BundleGroup/ },
        { name: "Zensus blind", z: { ...gruen, selbstBundleGenannt: false }, muss: /region:SELBST/ },
        { name: "Region ohne Kugel", z: { ...gruen, regionOhneKugel: ["region:3,4"] }, muss: /Region `region:3,4` trägt keine Kugel/ },
        {
            name: "Region-Cull tot",
            z: { ...gruen, regionProbe: { gruppe: true, kugel: true, vorn: true, hinten: true, raus: true } },
            muss: /der Region-Cull wirkt nicht/,
        },
        {
            name: "Region-Leck",
            z: { ...gruen, regionProbe: { gruppe: true, kugel: true, vorn: true, hinten: false, raus: false } },
            muss: /Leck/,
        },
        { name: "Methode mit BundleGroup", z: { ...gruen, codeTraeger: ["_archRegionGruppeFor"] }, muss: /Methode `_archRegionGruppeFor`/ },
        { name: "Bild klebt", z: { ...gruen, bild: { diaet: 0.18, kaputt: 0.18 } }, muss: /klebt an der alten Kamera/ },
        { name: "Bild-Probe blind", z: { ...gruen, bild: { diaet: 1, kaputt: 1 } }, muss: /die Bild-Probe ist blind/ },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        if (!v.some((s) => f.muss.test(s))) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${f.muss})`);
        console.log(`  ${v.length ? "✅" : "❌"} Selbsttest „${f.name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== KAMERA-TREUE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.KAMERA_TREUE_PORT) || 4472;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

(async () => {
    console.log("=== KAMERA-TREUE — echter Renderer (swiftshader, kienspan): Zensus · Absenz · Bild ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-unsafe-webgpu",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        // dieselbe „Code ohne Kommentare“-Quelle wie der Playtest (Absenz-Greps treffen nie Zitate)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    let out = null;
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        // EINSCHWINGEN in kurzen Schritten, gerendert wird gestubbt (Tempo; das gpu-lens-Muster).
        await page.evaluate(() => {
            window.__settle = { start: performance.now(), gestubbt: false, last: -1, stabil: 0, fertig: false, sz: 0 };
        });
        for (;;) {
            const s = await page.evaluate(async () => {
                const S = window.__settle;
                const t0 = performance.now();
                while (!S.fertig && performance.now() - t0 < 4000) {
                    const r = window.anazhRealm;
                    if (r && !S.gestubbt && r.state && r.state.renderer) {
                        window.__echtRender = r.state.renderer.render.bind(r.state.renderer);
                        r.state.renderer.render = function () {};
                        r.state.postProcessingFailed = true;
                        r.state._buehneStand = true;
                        S.gestubbt = true;
                    }
                    if (r && r.state && r.state.rendererReady && typeof r._gameLoopTick === "function") {
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {}
                        const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                        S.sz = sz;
                        if (sz === S.last) S.stabil++;
                        else {
                            S.stabil = 0;
                            S.last = sz;
                        }
                        const ring = r.state.chunkRingRadius || 2;
                        const soll = Math.min(25, (2 * ring + 1) * (2 * ring + 1));
                        if (sz >= soll && S.stabil > 30) S.fertig = true;
                    }
                    await new Promise((res) => setTimeout(res, 6));
                }
                return { fertig: S.fertig, ms: performance.now() - S.start, sz: S.sz };
            });
            if (s.fertig || s.ms > 240000) {
                log(`Einschwingen: ${s.sz} Chunks nach ${Math.round(s.ms / 1000)} s${s.fertig ? "" : " (Wand)"}`);
                break;
            }
        }
        // (a) ZENSUS + (b) ABSENZ
        const zensus = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE;
            const z = {
                bundleGruppen: [],
                selbstBundleGenannt: false,
                regionen: 0,
                regionOhneKugel: [],
                regionKeineGruppe: [],
                mitgliedCulltSelbst: [],
                codeTraeger: [],
            };
            const zaehle = () => {
                const namen = [];
                st.scene.traverse((o) => {
                    if (o.isBundleGroup === true) namen.push(o.name || o.uuid);
                });
                return namen;
            };
            z.bundleGruppen = zaehle();
            if (typeof T.BundleGroup === "function") {
                const b = new T.BundleGroup();
                b.name = "region:SELBST";
                st.scene.add(b);
                z.selbstBundleGenannt = zaehle().includes("region:SELBST");
                st.scene.remove(b);
            }
            const map = st._regionGruppen || new Map();
            for (const [k, g] of map) {
                if (!/^(s:)?-?\d+,-?\d+$/.test(String(k))) continue;
                z.regionen++;
                const n = g.name || String(k);
                if (!(g.isGroup === true && g.isBundleGroup !== true)) z.regionKeineGruppe.push(n);
                if (!(g.userData && g.userData.cullSphere)) z.regionOhneKugel.push(n);
                for (const m of g.children)
                    if (m.isInstancedMesh === true && m.frustumCulled !== false)
                        z.mitgliedCulltSelbst.push((m.userData && m.userData.archInstanceKey) || m.name || m.uuid);
            }
            // REGION-PROBE am echten Chokepoint: eine Region vor der Kamera (die des Punkts 120 m voraus), eine drei
            // Regionen dahinter; je ein Platzhalter-Kind, damit sie leben.
            {
                const R = r.constructor.ARCH_REGION_M;
                const cam = st.camera,
                    pm = st.playerMesh.position;
                cam.position.set(pm.x, pm.y + 6, pm.z);
                cam.lookAt(pm.x + 40, pm.y + 1, pm.z + 0.0001);
                cam.updateMatrixWorld(true);
                const key = (x, zz) => Math.floor(x / R) + "," + Math.floor(zz / R);
                const kv = key(pm.x + 120, pm.z),
                    kh = key(pm.x - 3 * R, pm.z);
                const vorn = r._archRegionGruppeFor(kv),
                    hinten = r._archRegionGruppeFor(kh);
                const kv0 = new T.Group(),
                    kh0 = new T.Group();
                vorn.add(kv0);
                hinten.add(kh0);
                r._loopFrustumCulling();
                const p = {
                    gruppe: vorn.isGroup === true && vorn.isBundleGroup !== true && vorn.parent === st.scene,
                    kugel: !!(vorn.userData.cullSphere && hinten.userData.cullSphere),
                    vorn: vorn.visible,
                    hinten: hinten.visible,
                };
                r._archMeshAushaengen(kv0);
                r._archMeshAushaengen(kh0);
                const map = st._regionGruppen;
                p.raus = !vorn.parent && !hinten.parent && !(map && (map.has(kv) || map.has(kh)));
                z.regionProbe = p;
            }
            const verboten = /BundleGroup|_renderBundle|executeBundles/;
            const pruefe = (name, fn) => {
                if (typeof fn === "function" && verboten.test(window.__codeOf(fn))) z.codeTraeger.push(name);
            };
            const P = Object.getPrototypeOf(r);
            for (const k of Object.getOwnPropertyNames(P)) {
                const d = Object.getOwnPropertyDescriptor(P, k);
                if (d && typeof d.value === "function") pruefe(k, d.value);
            }
            for (const k of Object.getOwnPropertyNames(r.constructor)) {
                const d = Object.getOwnPropertyDescriptor(r.constructor, k);
                if (d && typeof d.value === "function") pruefe("AnazhRealm." + k, d.value);
            }
            return z;
        });
        log(
            `Zensus: ${zensus.regionen} lebende Regionen · ${zensus.bundleGruppen.length} BundleGroups · Code-Träger ${zensus.codeTraeger.length} · ` +
                `Region-Probe ${JSON.stringify(zensus.regionProbe)}`
        );
        // (c) BILD — Kamera-Treue bei eingefrorener Zeit; jeder Schuss ein echter Render in ein Ziel (160×120).
        const bild = await page.evaluate(async () => {
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE,
                AR = r.constructor;
            const rend = st.renderer;
            rend.render = window.__echtRender;
            st.postProcessingFailed = true;
            if (typeof rend.setAnimationLoop === "function") rend.setAnimationLoop(null);
            const nf = rend._nodes.nodeFrame;
            const zeit = nf.time;
            nf.update = function () {
                this.frameId++;
                this.deltaTime = 0;
                this.time = zeit;
            };
            const W = 160,
                H = 120;
            const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
            const cam = st.camera;
            const pm = st.playerMesh.position;
            const blick = (dx) => {
                cam.position.set(pm.x, pm.y + 6, pm.z);
                cam.lookAt(pm.x + dx * 40, pm.y + 1, pm.z + 0.0001);
                cam.updateMatrixWorld(true);
            };
            const spiel = AR._diaetRefresh;
            const vendor = function (obs, ro, frame, altNR) {
                return altNR.call(obs, ro, frame);
            };
            const kaputt = function (obs, ro, frame, altNR) {
                return obs.renderObjects.has(ro) ? false : spiel(obs, ro, frame, altNR);
            };
            const schuss = async (diaet) => {
                AR._diaetRefresh = diaet;
                nf.update();
                rend.setRenderTarget(rt);
                rend.render(st.scene, cam);
                rend.setRenderTarget(null);
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                const zeile = W * 4,
                    schritt = roh.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
                const u8 = new Uint8Array(zeile * H);
                for (let y = 0; y < H; y++) u8.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
                return u8;
            };
            const gleich = (a, b) => {
                let g = 0;
                for (let i = 0; i < W * H; i++) {
                    const o = i * 4;
                    if (Math.abs(a[o] - b[o]) <= 2 && Math.abs(a[o + 1] - b[o + 1]) <= 2 && Math.abs(a[o + 2] - b[o + 2]) <= 2)
                        g++;
                }
                return +(g / (W * H)).toFixed(4);
            };
            try {
                blick(1);
                await schuss(vendor); // Warm (Pipelines)
                blick(-1);
                await schuss(vendor);
                const wahr = await schuss(vendor); // Y, jedes Objekt voll
                blick(1);
                await schuss(vendor); // X schreibt alle Gruppen
                blick(-1);
                const diaet = await schuss(spiel); // Y mit der Diät des Spiels
                blick(1);
                await schuss(vendor);
                blick(-1);
                const kap = await schuss(kaputt); // Y mit der Abkürzung ohne Schreiben
                blick(1);
                const x = await schuss(vendor);
                return { diaet: gleich(diaet, wahr), kaputt: gleich(kap, wahr), xGegenY: gleich(x, wahr) };
            } finally {
                AR._diaetRefresh = spiel;
                if (rt.dispose) rt.dispose();
            }
        });
        log(`Bild: Diät ${bild.diaet} · Abkürzung ohne Schreiben ${bild.kaputt} · X gegen Y ${bild.xGegenY}`);
        out = Object.assign(zensus, { bild });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const v = urteil(out);
    if (pageErrors.length) v.push(`${pageErrors.length} Seiten-Fehler: ${pageErrors[0]}`);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — die Region ist eine schlichte Gruppe mit Kugel (Probe: vorn sichtbar, dahinter verborgen, geleert fort; ` +
            `${out.regionen} lebend), keine BundleGroup lebt oder steht im Code; ` +
            `die Diät zeichnet Blick Y nach Blick X wie die Vendor-Bahn (${out.bild.diaet}), die Abkürzung ohne Schreiben fällt sichtbar ab (${out.bild.kaputt}).`
    );
})();
