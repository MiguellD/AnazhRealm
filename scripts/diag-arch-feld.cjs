// diag-arch-feld.cjs — DIE LINSE „gesetzte Dinge erscheinen" (V18.494, 30.09.): im
// Analog-Pfad ist ein gesetzter Bau nur sichtbar, wenn er einen Feld-Slot bekommt
// (_archZiegelFern). GEMESSEN vor der Heilung: eine gesetzte Eiche + ein Haus blieben
// 300 Takte ohne jeden Versuch (Verhungern in der Listen-Reihenfolge, 4 Bakes/s über
// Budget), und nach vorn gezogen brannte die Eiche nach 8 „leer"-Versuchen aus (das
// Foundry-Mesh lädt asynchron) — dauerhaft unsichtbar, wie 26 von 28 Weltgen-Bauten.
// Die Linse fährt den ECHTEN Renderer (WebGPU/swiftshader — der Null-Renderer ist für
// den ganzen Analog-Pfad blind) auf der Mess-Wiese −900/−850 und prüft:
//   A  nah (10 m · 26 m): gesetzte Eiche UND Haus sind binnen 200 Takten sichtbar — das Studio-Mesh steht
//      ODER der Feld-Slot überbrückt (AAA nah, V18.496: nah ist das Mesh die Gestalt, das Feld trägt nur,
//      bis es steht)
//   AM nah steht danach das Studio-Mesh (Grenze 800 Takte) — erst dann schießt die Linse: das Bild zeigt die
//      Gestalt, nicht die Brücke
//   A' fern (jenseits der Mesh-Zone): gesetzte Eiche UND Haus bekommen ihren Feld-Slot — der Feld-Bake-Takt geht
//      nah zuerst über alle Verbraucher, der ferne Bau wartet auf die Näheren und verhungert nie (Grenze 1000 Takte;
//      gemessen 02.10.: Dorf mit 55 Foundry-Bauten Takt 111, mit 107 Bauten > 200 — der Takt vergab 84 Fits in
//      200 Takten, alle in Distanz-Ordnung)
//   S  statisch: in der Mesh-Zone wartet ein ungebackener Bau in DERSELBEN Distanz-Schlange wie fern
//      (Befund 02.10.: in Listen-Reihenfolge fraß das Dorf den überbuchten Bake-Takt, das frisch gesetzte
//      Haus blieb 200 Takte ohne Feld und ohne Mesh); --selftest injiziert den Listen-Ruf → S rot
//   B  kein Foundry-Bau ist „aufgegeben" ohne Slot (ausgebrannt)
//   C  die Eiche hat ihren Fern-Satz auf dem Baum-Schlüssel (abaum:eiche:<v>)
//   D  das Feld liest dasselbe Licht wie das Mesh: neutrale Feld-Box vs. MeshStandard-Box am
//      selben Ort, Luminanz-Verhältnis über die gemeinsame Maske im Band 0,8–1,25
// plus je ein Schuss (artifacts/beweis-e/arch-feld-*.png) fürs Auge.
//   node scripts/diag-arch-feld.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const argOf = (k, d) => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : d;
};
const PORT = Number(process.env.ARCH_FELD_PORT || 4467);
const OUT = path.resolve(argOf("--out", path.join(root, "artifacts", "beweis-e")));
const W = 640,
    H = 360;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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

// Im Seiten-Kontext: EIN Schuss mit der gegebenen Kamera + die Zahlen dieses Renders.
const SCHUSS_FN = async (kam) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    const cam = r.state.camera;
    const scene = r.state.scene;
    cam.position.set(kam.px, kam.py, kam.pz);
    // BODEN-KLEMME: das Auge nie im Hang (der 24.07.-Befund der Kreatur-Sonde).
    const sy = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(kam.px, kam.pz) : null;
    if (typeof sy === "number" && isFinite(sy) && cam.position.y < sy + 0.35) cam.position.y = sy + 0.35;
    cam.lookAt(kam.lx, kam.ly, kam.lz);
    cam.updateMatrixWorld(true);
    // Die March-Uniforms folgen der Kamera über den EINEN Produktions-Pfad (sonst
    // marcht der Pass aus der Kamera des letzten Loop-Takts — falsche Gestalt).
    try {
        if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
    } catch (_e) {}
    if (r.state.playerMesh) r.state.playerMesh.visible = false; // der eigene Körper steht nicht im Beweis
    const rt = new THREE_.RenderTarget(640, 360, { depthBuffer: true, samples: 0 });
    const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
    if (rend.info && typeof rend.info.reset === "function") rend.info.reset();
    rend.setRenderTarget(rt);
    const t0 = performance.now();
    if (typeof rend.renderAsync === "function") await rend.renderAsync(scene, cam);
    else rend.render(scene, cam);
    const renderMs = performance.now() - t0;
    const ri = (rend.info && rend.info.render) || {};
    const zahlen = {
        dc: ri.drawCalls != null ? ri.drawCalls : ri.calls,
        tris: ri.triangles,
        renderMsSwiftshader: Math.round(renderMs),
    };
    let px = null;
    if (typeof rend.readRenderTargetPixelsAsync === "function")
        px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, 640, 360);
    rend.setRenderTarget(prev);
    if (rt.dispose) rt.dispose();
    if (!px || !px.length) return { ok: false, grund: "keine Pixel", zahlen };
    const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    const set = new Set();
    let nonzero = 0;
    for (let i = 0; i < u8.length; i += 4 * 97) {
        set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
        if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
    }
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 360;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(640, 360);
    img.data.set(u8.subarray(0, 640 * 360 * 4)); // WebGPU-Readback ist TOP-DOWN (diag-blick-Messwert)
    ctx.putImageData(img, 0, 0);
    const wm = r.state.weltMarch;
    const fp = r.state.feldPass;
    zahlen.weltMarch = wm
        ? {
              belegt: wm.belegt,
              bricks: wm.brickCache ? wm.brickCache.size : null,
              kapseln: wm.kapselCache ? wm.kapselCache.size : null,
              gesetzBloecke: wm.gesetzBloecke || 0,
          }
        : null;
    zahlen.feldPass = fp ? { sichtbar: !!(fp.mesh && fp.mesh.visible), laeufe: fp.laeufe, pano: fp.panoLaeufe } : null;
    try {
        if (typeof r._analogEMetrologieZeile === "function") zahlen.zeile = String(r._analogEMetrologieZeile());
    } catch (_e) {}
    return { ok: true, farben: set.size, nonzero, png: cv.toDataURL("image/png"), zahlen };
};

// S — die Ziegel-Schlange: im Mesh-Zonen-Zweig von tickArchitectureCulling ruft ein Bau ohne Slot den
// Ziegel NIE direkt (Listen-Reihenfolge), er reiht sich in die Distanz-Schlange.
function schlangenGesetz(src) {
    const a = src.indexOf("\n    tickArchitectureCulling() {");
    if (a < 0) return { ok: false, grund: "tickArchitectureCulling fehlt" };
    const b = src.indexOf("\n    }\n", a);
    const body = src.slice(a, b);
    const za = body.indexOf("if (distSq <= radiusSq) {");
    const ze = body.indexOf("} else {", za);
    if (za < 0 || ze < 0) return { ok: false, grund: "Mesh-Zonen-Zweig nicht gefunden" };
    const zweig = body.slice(za, ze).replace(/\/\/.*$/gm, "");
    const rufe = (zweig.match(/this\._archZiegelFern\(entry\)/g) || []).length;
    const bewacht = (
        zweig.match(
            /if \(entry\._ziegelSlot \|\| entry\._ziegelGebacken \|\| ohneFeld\) this\._archZiegelFern\(entry\)/g
        ) || []
    ).length;
    const schlange = /ziegelOffen\.push\(entry\)/.test(zweig);
    return { ok: rufe === bewacht && schlange, grund: `Rufe ${rufe} · bewacht ${bewacht} · Schlange ${schlange}` };
}
{
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    if (process.argv.includes("--selftest")) {
        const kaputt = stamm.replace(
            "if (entry._ziegelSlot || entry._ziegelGebacken || ohneFeld) this._archZiegelFern(entry);\n                else {\n                    // Steht",
            "this._archZiegelFern(entry);\n                if (false) {\n                    // Steht"
        );
        const heil = schlangenGesetz(stamm);
        const bruch = schlangenGesetz(kaputt);
        const ok = heil.ok && kaputt !== stamm && !bruch.ok;
        console.log(`${ok ? "✅" : "❌"} SELBST-TEST S: heil ${heil.grund} · Listen-Ruf injiziert ${bruch.grund}`);
        process.exit(ok ? 0 : 1);
    }
    const S = schlangenGesetz(stamm);
    console.log(`${S.ok ? "✅" : "❌"} S  Mesh-Zone reiht in die Distanz-Schlange (${S.grund})`);
    if (!S.ok) process.exit(1);
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("[D]")) console.log("  " + t);
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const res = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 300000;
        while (
            (!window.anazhRealm || !window.anazhRealm.state || typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl0
        )
            await sleep(200);
        const r = window.anazhRealm;
        if (!r || !r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
        const dlB = performance.now() + 90000;
        while (r._foundry && !(r._foundry.ready && r._foundry.recipes) && performance.now() < dlB) await sleep(500);
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(40);
            }
        };
        const X = -900,
            Z = -850;
        r.state.playerMesh.position.set(X, r._voxelSurfaceY(X, Z) + 1.8, Z);
        await tick(80);
        const pm = r.state.playerMesh.position;
        const hausName = Object.keys(r.state.blueprints || {})
            .filter((n) => n.startsWith("haus_"))
            .sort()[0];
        const setze = (name, d) => {
            const x = pm.x + d,
                z = pm.z + d * 0.2;
            const y = r._voxelSurfaceY(x, z) + 0.5;
            const e = r.spawnArchitecture(name, { x, y, z }, { rotationY: 0 });
            return { e, x, y, z };
        };
        // Die Takt-Verbraucher (wer bekommt den Feld-Bake-Takt, wer nicht) — die Linse nennt den Hunger beim Namen.
        const taktZaehl = {};
        const taktRoh = r._weltBakeErlaubt.bind(r);
        r._weltBakeErlaubt = function () {
            const ok = taktRoh();
            const k = (new Error().stack.split("\n")[2] || "").trim().split(" ")[1] || "?";
            const z2 = taktZaehl[k] || (taktZaehl[k] = { ja: 0, nein: 0 });
            if (ok) z2.ja++;
            else z2.nein++;
            return ok;
        };
        const B = setze("baum_eiche", 10);
        const Hh = setze(hausName, 26);
        // FERN: jenseits der Mesh-Zone (Cull-Radius) ist das Feld die Gestalt.
        const fernD = Math.round((r.state.architectureCullingRadius || 130) + 40);
        const BF = setze("baum_eiche", fernD);
        const HF = setze(hausName, fernD + 16);
        const eb = B.e,
            eh = Hh.e;
        const ebF = BF.e,
            ehF = HF.e;
        const idx = { baum: r.state.architectures.indexOf(eb), haus: r.state.architectures.indexOf(eh) };
        // Sichtbar = das Mesh steht ODER der Feld-Slot trägt (AAA nah: das Feld überbrückt nur, bis das Mesh steht).
        const sichtbar = (e) => !!(e && (r._archIsRendered(e) || e._ziegelSlot));
        let slotB = null,
            slotH = null,
            slotBF = null,
            slotHF = null;
        for (let t = 1; t <= 200; t++) {
            await tick(1);
            if (slotB == null && sichtbar(eb)) slotB = t;
            if (slotH == null && sichtbar(eh)) slotH = t;
            if (slotBF == null && ebF && ebF._ziegelSlot) slotBF = t;
            if (slotHF == null && ehF && ehF._ziegelSlot) slotHF = t;
            if (slotB != null && slotH != null && slotBF != null && slotHF != null && t >= 40) break;
        }
        // NAH IST DAS MESH: die Feld-Brücke trägt nur, bis das Studio-Mesh steht — weiter takten, bis beide nahen
        // Bauten als Mesh rendern; FERN gilt nah zuerst, nie verhungert: der Takt geht in Distanz-Ordnung, der ferne
        // Bau wartet auf die Näheren und kommt an (Grenze 1000 Takte gesamt). Erst dann schießt die Linse.
        let meshB = r._archIsRendered(eb) ? 0 : null,
            meshH = r._archIsRendered(eh) ? 0 : null;
        for (let t = 201; t <= 1000; t++) {
            if (meshB != null && meshH != null && slotBF != null && slotHF != null) break;
            await tick(1);
            if (meshB == null && r._archIsRendered(eb)) meshB = t - 200;
            if (meshH == null && r._archIsRendered(eh)) meshH = t - 200;
            if (slotBF == null && ebF && ebF._ziegelSlot) slotBF = t;
            if (slotHF == null && ehF && ehF._ziegelSlot) slotHF = t;
        }
        r._weltBakeErlaubt = taktRoh;
        // B — ausgebrannte Foundry-Bauten (aufgegeben ohne Slot):
        let foundryN = 0,
            ausgebrannt = 0,
            mitSlot = 0;
        for (const a of r.state.architectures) {
            if (!r._archFoundryPreset || !r._archFoundryPreset(a)) continue;
            foundryN++;
            if (a._ziegelSlot) mitSlot++;
            else if (a._ziegelGebacken) ausgebrannt++;
        }
        const wm = r.state.weltMarch;
        const variante = r._foundryVariantFor(eb ? eb.seed : 0);
        // Der Zustand je gesetztem Bau (die Linse nennt den Täter, nicht nur „Takt null").
        const zustand = (e) =>
            e
                ? {
                      mesh: !!r._archIsRendered(e),
                      slot: !!e._ziegelSlot,
                      gebacken: !!e._ziegelGebacken,
                      versuche: e._ziegelVersuche || 0,
                      // Foundry-Bau: steht die L1-Flat (Quelle des Fits) und der geteilte Baum-Satz schon?
                      flat: r._archFoundryPreset(e)
                          ? r._foundry.cache.has(
                                r._archFoundryPreset(e) +
                                    "|" +
                                    r._foundryVariantFor(e.seed) +
                                    "|1|" +
                                    (r.state.season || "summer")
                            )
                          : null,
                      satz: r._archFoundryPreset(e)
                          ? !!(
                                wm &&
                                wm.kapselCache.has(
                                    "abaum:" + r._archFoundryPreset(e) + ":" + r._foundryVariantFor(e.seed)
                                )
                            )
                          : null,
                      d: Math.round(Math.hypot(e.position.x - pm.x, e.position.z - pm.z)),
                  }
                : null;
        window.__afB = B;
        window.__afH = Hh;
        return {
            hausName,
            idx,
            n: r.state.architectures.length,
            slotB,
            slotH,
            slotBF,
            slotHF,
            meshB,
            meshH,
            fernD,
            takt: taktZaehl,
            zBF: zustand(ebF),
            zHF: zustand(ehF),
            versucheB: eb ? eb._ziegelVersuche || 0 : null,
            foundryN,
            mitSlot,
            ausgebrannt,
            geteilt: !!(wm && wm.kapselCache.has("abaum:eiche:" + variante)),
            zB: zustand(eb),
            zH: zustand(eh),
            felderFrei: wm ? wm.freiFelder.length : null,
            felderVoll: !!r._weltFelderVollWarn,
            radius: Math.round(r.state.architectureCullingRadius || 0),
        };
    });
    if (!res || res.fatal) {
        console.log("FEHLER:", res ? res.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(`Liste: ${res.n} Bauten · Eiche auf Platz ${res.idx.baum} · ${res.hausName} auf Platz ${res.idx.haus}`);
    console.log(
        `Zustand: Eiche ${JSON.stringify(res.zB)} · Haus ${JSON.stringify(res.zH)} · Feld-Liste frei ${res.felderFrei}` +
            `${res.felderVoll ? " (VOLL gemeldet)" : ""} · Mesh-Zone ${res.radius} m`
    );
    const A = res.slotB != null && res.slotH != null;
    const AF = res.slotBF != null && res.slotHF != null;
    const AM = res.meshB != null && res.meshH != null;
    const Bk = res.ausgebrannt === 0;
    const C = res.geteilt;
    console.log(
        `${A ? "✅" : "❌"} A  nah sichtbar (Mesh oder Feld-Brücke): Eiche ab Takt ${res.slotB} · Haus ab Takt ${res.slotH} (Grenze 200)`
    );
    console.log(
        `${AM ? "✅" : "❌"} AM nah steht das Studio-Mesh: Eiche ${res.meshB} · Haus ${res.meshH} Takte nach der Brücke (Grenze 800)`
    );
    console.log(
        `${AF ? "✅" : "❌"} A' fern Feld-Slot (${res.fernD} m, jenseits der Mesh-Zone): Eiche ab Takt ${res.slotBF} · ` +
            `Haus ab Takt ${res.slotHF} (Grenze 1000 — nah zuerst, nie verhungert)` +
            (AF ? "" : ` — ${JSON.stringify(res.zBF)} · ${JSON.stringify(res.zHF)} · Takt ${JSON.stringify(res.takt)}`)
    );
    console.log(
        `${Bk ? "✅" : "❌"} B  Foundry-Bauten: ${res.foundryN} · mit Slot ${res.mitSlot} · ausgebrannt ${res.ausgebrannt}`
    );
    console.log(`${C ? "✅" : "❌"} C  die Eiche hat ihren Fern-Satz auf dem Baum-Schlüssel (abaum:eiche:<v>)`);
    const kam = await page.evaluate(() => {
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        const g = r._voxelSurfaceY(pm.x, pm.z);
        const B = window.__afB,
            H = window.__afH;
        return {
            baum: { px: pm.x, py: g + 1.7, pz: pm.z, lx: B.x, ly: B.y + 3, lz: B.z },
            haus: { px: pm.x, py: g + 1.7, pz: pm.z, lx: H.x, ly: H.y + 3, lz: H.z },
        };
    });
    for (const k of ["baum", "haus"]) {
        const s = await page.evaluate(SCHUSS_FN, kam[k]);
        if (!s.ok) {
            console.log(`– Schuss ${k}: ${s.grund}`);
            continue;
        }
        const f = path.join(OUT, `arch-feld-${k}.png`);
        fs.writeFileSync(f, Buffer.from(s.png.split(",")[1], "base64"));
        console.log(`  Schuss ${k}: ${path.relative(root, f)} · dc=${s.zahlen.dc} tris=${s.zahlen.tris}`);
    }
    // D — DAS LICHT DER WELT (das Licht-Modell, ohne Albedo-Störer): am SELBEN Ort einmal eine Feld-Box
    // (Kapsel-Satz, Albedo 0,5 linear), einmal eine MeshStandard-Box (color 0,5, roughness 1, metalness 0),
    // dazu der Hintergrund. Die Pixel-Maske ist identisch; Luminanz-Mittel Feld/Mesh muss ~1 sein.
    // Die Boxen schweben über dem Kronendach (freie Sicht); der Spiel-Loop ruht, Mittag fest, die Sonne
    // wirft keinen Schatten (das Feld hat keinen Schatten-Lookup).
    const schussPx = (modus) =>
        page.evaluate(
            async (modus, DW, DH) => {
                const r = window.anazhRealm;
                const THREE_ = window.THREE;
                const rend = r.state.renderer;
                rend.setAnimationLoop(null);
                if (r.state.world) r.state.world.timeOfDay = 0.5;
                r.state.timeOfDay = 0.5;
                if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                if (r.state.directionalLight) r.state.directionalLight.castShadow = false;
                let L = window.__licht;
                if (!L) {
                    const pm = r.state.playerMesh.position;
                    const x = pm.x + 6,
                        z = pm.z + 6;
                    const y = r._voxelSurfaceY(x, z) + 45; // über dem Kronendach: freier Blick, Himmel als Grund
                    const M = new THREE_.Matrix4().makeTranslation(x, y, z);
                    const handle = r._weltKapselSpawn("licht-linse:box", M, () => [
                        {
                            box: true,
                            c: new THREE_.Vector3(0, 0, 0),
                            h: new THREE_.Vector3(1, 1, 1),
                            farbe: { r: 0.5, g: 0.5, b: 0.5 },
                        },
                    ]);
                    const mat = new THREE_.MeshStandardNodeMaterial({ roughness: 1, metalness: 0 });
                    mat.color.setRGB(0.5, 0.5, 0.5);
                    const mesh = new THREE_.Mesh(new THREE_.BoxGeometry(2, 2, 2), mat);
                    mesh.position.set(x, y, z);
                    mesh.castShadow = false;
                    mesh.receiveShadow = false;
                    r.state.scene.add(mesh);
                    const cam = { px: x - 5, py: y + 3.2, pz: z - 6, lx: x, ly: y, lz: z };
                    L = window.__licht = { handle, mesh, cam };
                }
                if (!L.handle) return { fehlt: "Feld-Box ohne Slot" };
                r._weltFeldAktiv(L.handle, modus === "feld");
                L.mesh.visible = modus === "mesh";
                const cam = r.state.camera;
                cam.position.set(L.cam.px, L.cam.py, L.cam.pz);
                cam.lookAt(L.cam.lx, L.cam.ly, L.cam.lz);
                cam.updateMatrixWorld(true);
                if (r.state.playerMesh) r.state.playerMesh.visible = false;
                let u8 = null;
                for (let k = 0; k < 2; k++) {
                    try {
                        if (r.state.fernRing && typeof r._tickFeldPass === "function")
                            r._tickFeldPass(r.state.fernRing);
                    } catch (_e) {}
                    const rt = new THREE_.RenderTarget(DW, DH, { depthBuffer: true, samples: 0 });
                    const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
                    rend.setRenderTarget(rt);
                    if (typeof rend.renderAsync === "function") await rend.renderAsync(r.state.scene, cam);
                    else rend.render(r.state.scene, cam);
                    const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, DW, DH);
                    rend.setRenderTarget(prev);
                    if (rt.dispose) rt.dispose();
                    u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                }
                const cv = document.createElement("canvas");
                cv.width = DW;
                cv.height = DH;
                const ctx = cv.getContext("2d");
                const img = ctx.createImageData(DW, DH);
                img.data.set(u8.subarray(0, DW * DH * 4));
                ctx.putImageData(img, 0, 0);
                let bin = "";
                for (let i = 0; i < u8.length; i += 0x8000)
                    bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
                return { b64: btoa(bin), png: cv.toDataURL("image/png") };
            },
            modus,
            320,
            180
        );
    const bilder = {};
    // Erster Schuss wärmt (Pipelines, Sichtbarkeit nach dem Umsetzen); der Hintergrund zählt zuletzt.
    for (const modus of ["warm", "feld", "mesh", "aus"]) {
        const t0 = Date.now();
        const b = await Promise.race([
            schussPx(modus),
            new Promise((res) => setTimeout(() => res({ fehlt: `Zeit-Wand 600 s im Modus ${modus}` }), 600000)),
        ]);
        console.log(`  D-Schuss ${modus}: ${b.fehlt || "ok"} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        if (!b.fehlt) {
            b.px = Buffer.from(b.b64, "base64");
            fs.writeFileSync(
                path.join(OUT, `arch-feld-licht-${modus}.png`),
                Buffer.from(b.png.split(",")[1], "base64")
            );
        }
        bilder[modus] = b;
    }
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const L = window.__licht;
        if (L) {
            if (L.handle) r._weltFeldFrei(L.handle);
            r.state.scene.remove(L.mesh);
        }
        if (r.state.directionalLight) r.state.directionalLight.castShadow = true;
        r.state.renderer.setAnimationLoop(r._gameLoopTick);
    });
    const { aus: bg, feld, mesh } = bilder;
    let D = false;
    if (bg.fehlt || feld.fehlt || mesh.fehlt) {
        console.log(`❌ D  Feld-Licht: ${bg.fehlt || feld.fehlt || mesh.fehlt}`);
    } else {
        // Gemeinsame Maske: Pixel, die BEIDE Boxen gegenüber dem Hintergrund ändern.
        let n = 0,
            lf = 0,
            lm = 0;
        const rf = [0, 0, 0],
            rm = [0, 0, 0];
        const lum = (p, i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
        const diff = (p, i) =>
            Math.abs(p[i] - bg.px[i]) + Math.abs(p[i + 1] - bg.px[i + 1]) + Math.abs(p[i + 2] - bg.px[i + 2]);
        for (let i = 0; i < bg.px.length; i += 4) {
            if (diff(feld.px, i) <= 24 || diff(mesh.px, i) <= 24) continue;
            n++;
            lf += lum(feld.px, i);
            lm += lum(mesh.px, i);
            for (let c = 0; c < 3; c++) {
                rf[c] += feld.px[i + c];
                rm[c] += mesh.px[i + c];
            }
        }
        const q = lm > 0 ? lf / lm : 0;
        D = n > 300 && q >= 0.8 && q <= 1.25;
        const f = (v) => v.map((x) => Math.round(x / Math.max(1, n))).join("/");
        console.log(
            `${D ? "✅" : "❌"} D  Feld-Licht ≙ Mesh-Licht (neutrale Box am selben Ort): Feld rgb ${f(rf)} · Mesh rgb ${f(rm)} ` +
                `· Luminanz ${(lf / Math.max(1, n)).toFixed(1)} / ${(lm / Math.max(1, n)).toFixed(1)} = ${q.toFixed(2)} (Band 0,8–1,25) · ${n} px`
        );
    }
    await browser.close();
    server.close();
    const gruen = A && AM && AF && Bk && C && D && pageErrors.length === 0;
    console.log(
        gruen
            ? "✅ GRÜN — gesetzte Dinge erscheinen: nah als Mesh (das Feld überbrückt), fern im Feld."
            : `❌ ROT${pageErrors.length ? " · Page-Errors: " + pageErrors.slice(0, 2).join(" | ") : ""}`
    );
    process.exit(gruen ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
