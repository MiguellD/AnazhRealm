// diag-weltbild-frost.cjs — DIE FROST-WAND (gate:weltbild-frost, 07.10.). Befund (Leben-Schau v1-Pfad, echte GPU, Radeon
// 890M): nach Werkstatt und Tab stand das Weltbild — drei Bilder gleich, während der Spieler 50 m in den Fluss trieb und die
// Uhr 00:00 → 12:21 lief; die Konsole: „Index range (count 13884, Uint32) does not fit in index buffer size (27768)" und
// „Invalid CommandBuffer renderContext_4/5". Wurzel: r184 schreibt beim Anlegen eines Index die geweitete Form in das GETEILTE
// Attribut zurück (`createAttribute`: `array = new Uint32Array(array)`), und der Draw bindet das Format nach dem Array-Typ.
// Die Hülle des schmalen Index lag nur an der Welt-Instanz; das Backend der Ich-Bühne (Tab) weitete die Mensch-Vorlage
// (`sharedGeom`), das der Hof-Bühne die Tier-Vorlagen — die Welt band uint32 auf 16-bit-Puffern, Dawn verwarf jeden
// Render-Kontext der Welt. Der Schnitt: das Backend-Gesetz an der KLASSE (`_backendGesetz`: schmaler Index · Index-Wache ·
// GPU-Wache).
//
// Je Schritt (Werkstatt mit Eiche · Tab/Ich-Bühne · Hof-Bühne — jede Bühne ein eigenes WebGPU-Backend, das Geometrie mit
// der Welt teilt) prüft die Wand am ECHTEN Renderer (der Null-Renderer ist für jeden Draw blind):
//   I  DER INDEX-ZENSUS: jeder Index-Puffer der Welt-GPU trägt das Format, das der Draw bindet (Bytes des Arrays ≤ Puffer)
//   G  kein WebGPU-Validierungsfehler auf irgendeinem Device (eigener Hörer, unabhängig vom Spiel: `uncapturederror` jedes
//      Device UND die THREE-Konsolenzeile, mit der r184 eine Validierung aus seinem offenen Pipeline-Fehler-Bereich meldet)
//   W  die Wachen des Spiels stehen und schweigen (`_indexWache` · `_gpuWache`)
//   B  DAS BILD FOLGT: zwei Bilder des präsentierten Canvas bei gedrehter Kamera unterscheiden sich in ≥ 2 % der 16×16-Blöcke
// Danach DIE TÄTER (jeder Lauf — die Wand beweist sich selbst):
//   T1 ein Probe-Mesh zeichnet einen Index ≥ seiner Vertex-Zahl → die Index-Wache nennt es („bereich")
//   T2 ein Mensch-Index wird geweitet wie von einem fremden Backend → die Index-Wache nennt ihn („format") beim Pfad, die
//      GPU-Wache des Spiels und der eigene Hörer zählen, und die Bild-Probe sagt BILD STEHT
//
// Zwei Wege, derselbe Prüfer:
//   node scripts/diag-weltbild-frost.cjs          headless (swiftshader, ?holz=kienspan) — CI: der Spiel-Takt ruht (ein
//                                                 Welt-Frame kostet dort Sekunden), die Welt-GPU zeichnet die PROBE-BÜHNE:
//                                                 einen Menschen und ein Tier aus denselben Bauern wie Spieler, Ich- und
//                                                 Hof-Bühne (`_buildHumanGroup`, `_buildCreatureGroup` — geteilte Vorlagen)
//   node scripts/diag-weltbild-frost.cjs --echt   sichtbares Chrome auf der echten GPU: der SPIELPFAD (Ankunft · dritte
//                                                 Person · Werkstatt · Tab · Hof) im laufenden Spiel, das Bild-Paar je Schritt
//   … [--bilder <ordner>]                         legt je Bild-Paar beide Bilder ab
//   Port: WELTBILD_FROST_PORT (Standard 4426). Exit 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.WELTBILD_FROST_PORT || 4426);
const ECHT = process.argv.includes("--echt");
const BILDER = (() => {
    const i = process.argv.indexOf("--bilder");
    return i >= 0 ? path.resolve(process.argv[i + 1]) : null;
})();
const FOLGT_MIN = 0.02; // Anteil bewegter 16×16-Blöcke der Bildmitte, ab dem das Bild der Kamera folgt
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

const fehler = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fehler.push(name);
}

// Der eigene Hörer: jedes GPUDevice der Seite (Welt und Bühnen) meldet jede Validierung hierher — unabhängig davon, ob
// das Spiel eine Wache trägt (an altem Code ist diese Zahl der Befund).
function geraeteHoerer() {
    if (typeof GPUAdapter === "undefined" || window.__frostHoer) return;
    const H = (window.__frostHoer = { devices: 0, n: 0, erste: [] });
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        const nr = H.devices++;
        dev.addEventListener("uncapturederror", (ev) => {
            H.n++;
            if (H.erste.length < 6)
                H.erste.push(
                    `device ${nr}: ` +
                        String((ev.error && ev.error.message) || ev.error)
                            .split("\n")[0]
                            .slice(0, 220)
                );
        });
        return dev;
    };
}

// Der Prüf-Raum in der Seite: `wurzel` (was die Welt-GPU zeichnet und der Zensus liest), `zeichne(n)` (n Bilder der Welt-
// GPU), `drehe()` (63° Gier), `leib` (der Mensch, dessen Index der Täter T2 weitet).
function pruefRaum(echt) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const rend = r.state.renderer;
    const F = (window.__frostWand = { echt });
    r.setCameraMode("third");
    if (echt) {
        F.wurzel = r.state.scene;
        F.leib = r.state.playerMesh;
        F.zeichne = async (n) => {
            const info = rend.info.render;
            const a = info.calls,
                t = performance.now();
            while ((info.calls - a < n || performance.now() - t < 600) && performance.now() - t < 120000)
                await new Promise((res) => setTimeout(res, 50));
        };
        F.drehe = () => (r.state.yaw += 1.1);
        F.mittag = () => {
            r.state.timeOfDay = 0.5;
            if (r.state.world) r.state.world.timeOfDay = 0.5;
            r.state.pitch = -0.18;
        };
        return { weg: "spielpfad" };
    }
    rend.setAnimationLoop(null);
    const scene = new T.Scene();
    scene.background = new T.Color(0x6688aa);
    scene.add(new T.HemisphereLight(0xffffff, 0x445533, 2.2));
    const sonne = new T.DirectionalLight(0xffffff, 2.0);
    sonne.position.set(3, 6, 4);
    scene.add(sonne);
    const pivot = new T.Group();
    scene.add(pivot);
    const leib = r._buildHumanGroup();
    pivot.add(leib);
    // das Tier der Hof-Bühne: das erste Wesen des Hofs, gebaut wie dort (`_hofRefreshFocus` → `_buildCreatureGroup`)
    let tier = null,
        seele = null;
    const c = (r.state.creatures || [])[0];
    if (c) seele = r._creatureProfile(c).soul;
    if (seele) tier = r._buildCreatureGroup(seele);
    if (tier) {
        tier.position.set(1.3, 0, -0.4);
        pivot.add(tier);
    }
    // ein Ring farbiger Kisten auf dem Drehteller: die Drehung ändert die Bildmitte sichtbar
    for (let i = 0; i < 8; i++) {
        const k = new T.Mesh(
            new T.BoxGeometry(0.35, 0.5 + 0.15 * i, 0.35),
            new T.MeshStandardNodeMaterial({ color: new T.Color().setHSL(i / 8, 0.7, 0.5) })
        );
        const w = (i / 8) * Math.PI * 2;
        k.position.set(Math.cos(w) * 1.1, 0.3, Math.sin(w) * 1.1);
        pivot.add(k);
    }
    pivot.traverse((o) => {
        if (o.isMesh) {
            o.visible = true;
            o.frustumCulled = false;
        }
    });
    const b = rend.domElement.getBoundingClientRect();
    const cam = new T.PerspectiveCamera(45, b.width / Math.max(1, b.height), 0.05, 100);
    cam.position.set(0, 1.0, 3.0);
    cam.lookAt(0, 0.7, 0);
    F.wurzel = scene;
    F.leib = leib;
    F.zeichne = async (n) => {
        for (let i = 0; i < n; i++) {
            scene.updateMatrixWorld(true);
            rend.render(scene, cam);
        }
        await rend.backend.device.queue.onSubmittedWorkDone();
        await new Promise((res) => setTimeout(res, 50));
    };
    F.drehe = () => (pivot.rotation.y += 1.1);
    F.mittag = () => {};
    return { weg: "probe-buehne", tier: tier ? seele : null };
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: !ECHT,
        protocolTimeout: 1800000,
        defaultViewport: ECHT ? { width: 1280, height: 720, deviceScaleFactor: 1 } : { width: 640, height: 360 },
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1300,820"] : softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    const t0 = Date.now();
    const zeit = () => `+${Math.round((Date.now() - t0) / 1000)} s`;
    let konsole = 0;
    // Der zweite Weg einer Validierung: r184 fängt sie in seinem offenen Pipeline-Fehler-Bereich und meldet sie als
    // THREE-Konsolenzeile (nie als uncapturederror) — der eigene Hörer zählt auch diese (die Zeilen des Spiels nicht).
    const konsoleGpu = { n: 0, erste: [] };
    page.on("pageerror", (e) => console.log(`  [Seiten-Fehler] ${zeit()}: ${String(e.message || e).split("\n")[0]}`));
    page.on("console", (m) => {
        const t = m.text();
        if (!t.startsWith("[AnazhRealm") && /does not fit in|\[Invalid [A-Za-z]+|\n\s*-\s*While /.test(t)) {
            konsoleGpu.n++;
            if (konsoleGpu.erste.length < 3) konsoleGpu.erste.push("konsole: " + t.split("\n")[0].slice(0, 200));
        }
        if (/INDEX-WACHE|GPU-VALIDIERUNG/.test(t) && konsole++ < 10) console.log("  [Spiel] " + t.slice(0, 260));
    });
    await page.evaluateOnNewDocument(geraeteHoerer);
    await page.goto(`http://127.0.0.1:${PORT}/index.html${ECHT ? "" : "?holz=kienspan"}`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    const boot = await page.evaluate(
        async (minChunks) => {
            const dl = performance.now() + 360000;
            while (performance.now() < dl) {
                const r = window.anazhRealm;
                const st = r && r.state;
                if (st && st.rendererReady && st.playerMesh && st.voxelChunks && st.voxelChunks.size >= minChunks)
                    break;
                await new Promise((res) => setTimeout(res, 300));
            }
            const r = window.anazhRealm;
            const rend = r && r.state && r.state.renderer;
            return {
                bereit: !!(r && r.state.rendererReady),
                webgpu: !!(rend && rend.backend && rend.backend.isWebGPUBackend === true),
                chunks: r && r.state.voxelChunks ? r.state.voxelChunks.size : -1,
            };
        },
        ECHT ? 25 : 9
    );
    console.log(
        `=== DIE FROST-WAND (${ECHT ? "echte GPU" : "swiftshader, kienspan"}) — Boot ${zeit()} ${JSON.stringify(boot)} ===`
    );
    if (!boot.bereit || !boot.webgpu) {
        check("die Welt steht auf einem WebGPU-Backend", false, JSON.stringify(boot));
        await browser.close();
        server.close();
        process.exit(1);
    }
    if (BILDER) fs.mkdirSync(BILDER, { recursive: true });
    const raum = await page.evaluate(pruefRaum, ECHT);
    console.log(`  Prüf-Raum: ${JSON.stringify(raum)}`);

    const zeichne = (n) => page.evaluate((n) => window.__frostWand.zeichne(n), n);
    const clip = await page.evaluate(() => {
        const b = window.anazhRealm.state.renderer.domElement.getBoundingClientRect();
        return { x: b.x + b.width * 0.2, y: b.y + b.height * 0.22, width: b.width * 0.6, height: b.height * 0.5 };
    });
    const schuss = async (datei) => {
        const b64 = await page.screenshot({ clip, encoding: "base64" });
        if (datei) fs.writeFileSync(datei, Buffer.from(b64, "base64"));
        return b64;
    };
    const vergleich = (a, b) =>
        page.evaluate(
            async (a, b) => {
                const lade = async (s) => {
                    const bin = atob(s);
                    const u8 = new Uint8Array(bin.length);
                    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
                    const bm = await createImageBitmap(new Blob([u8], { type: "image/png" }));
                    const c = new OffscreenCanvas(bm.width, bm.height);
                    const g = c.getContext("2d");
                    g.drawImage(bm, 0, 0);
                    return { d: g.getImageData(0, 0, bm.width, bm.height).data, w: bm.width, h: bm.height };
                };
                const A = await lade(a),
                    B = await lade(b);
                // Block-Mittel 16×16: die zeitliche Kantenglättung zittert über einem stehenden Bild Pixel für Pixel (Laub:
                // 6 % der Pixel), ihr Block-Mittel bleibt (0,1 % der Blöcke); eine Drehung bewegt 70–97 % der Blöcke.
                const K = 16,
                    bw = Math.floor(A.w / K),
                    bh = Math.floor(A.h / K);
                let anders = 0;
                for (let by = 0; by < bh; by++)
                    for (let bx = 0; bx < bw; bx++) {
                        let s = 0;
                        for (let c = 0; c < 3; c++) {
                            let ma = 0,
                                mb = 0;
                            for (let y = 0; y < K; y++)
                                for (let x = 0; x < K; x++) {
                                    const i = ((by * K + y) * A.w + bx * K + x) * 4 + c;
                                    ma += A.d[i];
                                    mb += B.d[i];
                                }
                            s += Math.abs(ma - mb) / (K * K);
                        }
                        if (s > 12) anders++;
                    }
                return anders / Math.max(1, bw * bh);
            },
            a,
            b
        );
    // B — das Bild-Paar: zwei Bilder des präsentierten Canvas, dazwischen 63° Gier.
    const bildPaar = async (tag) => {
        await page.evaluate(() => window.__frostWand.mittag());
        await zeichne(ECHT ? 8 : 2);
        const a = await schuss(BILDER && path.join(BILDER, tag + "-a.png"));
        await page.evaluate(() => window.__frostWand.drehe());
        await zeichne(ECHT ? 8 : 2);
        const b = await schuss(BILDER && path.join(BILDER, tag + "-b.png"));
        return vergleich(a, b);
    };
    // I + G + W — der Index-Zensus der Welt-GPU, der eigene Hörer, die Wachen des Spiels.
    const lage = async () => {
        const l = await lageSeite();
        l.hoer += konsoleGpu.n;
        l.hoerErste = l.hoerErste.concat(konsoleGpu.erste);
        return l;
    };
    const lageSeite = () =>
        page.evaluate(() => {
            const r = window.anazhRealm;
            const be = r.state.renderer.backend;
            const kaputt = [];
            let n = 0,
                mensch = 0;
            window.__frostWand.wurzel.traverse((o) => {
                const g = o.geometry;
                if (!g || !g.index || !be.data.has(g.index)) return;
                const d = be.data.get(g.index);
                if (!d.buffer) return;
                n++;
                let pfad = [];
                for (let x = o; x && pfad.length < 6; x = x.parent) pfad.unshift(x.name || x.type);
                pfad = pfad.join("/");
                if (/mensch/.test(pfad)) mensch++;
                if (g.index.array.byteLength > d.buffer.size)
                    kaputt.push(
                        `${pfad} (Geometrie ${g.id}: ${g.index.count} × ${g.index.array.constructor.name} auf ${d.buffer.size} B)`
                    );
            });
            const H = window.__frostHoer;
            return {
                n,
                mensch,
                kaputt,
                hoer: H ? H.n : -1,
                hoerErste: H ? H.erste : [],
                devices: H ? H.devices : -1,
                indexWache: r._indexWache ? { n: r._indexWache.n, brueche: r._indexWache.brueche.slice(0, 8) } : null,
                gpuWache: r._gpuWache ? { n: r._gpuWache.n } : null,
                wachenDa: typeof r._indexWacheDraw === "function" && typeof r._gpuWacheAn === "function",
            };
        });
    // Ein Schritt: tun, die Welt-GPU zeichnen lassen (die geteilten Gestalten im Bild), dann I · G · W — und B, wo das
    // Bild-Paar läuft (headless: am Anfang und nach der letzten Bühne; echt: je Schritt).
    const schritt = async (tag, tu, mitBild) => {
        const was = tu ? await tu() : null;
        const folgt = mitBild || ECHT ? await bildPaar(tag) : null;
        if (folgt === null) await zeichne(ECHT ? 8 : 2);
        const l = await lage();
        console.log(
            `\n[${tag}] ${zeit()} · ${was ? JSON.stringify(was) + " · " : ""}${folgt === null ? "" : `Bild ${(folgt * 100).toFixed(1)} % der Blöcke bewegt · `}${l.n} Index-Puffer (${l.mensch} Mensch) · Devices ${l.devices}`
        );
        if (folgt !== null)
            check(
                `${tag}: B das Bild folgt der Kamera`,
                folgt >= FOLGT_MIN,
                `${(folgt * 100).toFixed(2)} % der Blöcke (Soll ≥ ${FOLGT_MIN * 100} %)`
            );
        check(
            `${tag}: I jeder Index-Puffer der Welt-GPU trägt das gebundene Format`,
            l.kaputt.length === 0,
            l.kaputt.slice(0, 4).join(" | ")
        );
        check(
            `${tag}: G kein WebGPU-Validierungsfehler`,
            l.hoer === 0,
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
        check(
            `${tag}: W die Wachen des Spiels stehen und schweigen`,
            l.wachenDa && (!l.indexWache || l.indexWache.n === 0) && (!l.gpuWache || l.gpuWache.n === 0),
            l.wachenDa ? JSON.stringify({ index: l.indexWache, gpu: l.gpuWache }) : "_indexWacheDraw/_gpuWacheAn fehlen"
        );
        return l;
    };
    const warteBuehne = (wer) =>
        page.evaluate(async (wer) => {
            const r = window.anazhRealm;
            const dl = performance.now() + 180000;
            const holen = () =>
                wer === "ich"
                    ? r.state.ichStage
                    : wer === "hof"
                      ? r.state.hofStage
                      : r.state.workshop && r.state.workshop.preview;
            while (performance.now() < dl) {
                const s = holen();
                if (s && s.renderer && s.renderer.info.render.calls >= 2) break;
                await new Promise((res) => setTimeout(res, 200));
            }
            const s = holen();
            let meshes = 0;
            if (s && s.scene) s.scene.traverse((o) => o.isMesh && meshes++);
            return { bühne: wer, gezeichnet: s && s.renderer ? s.renderer.info.render.calls : 0, meshes };
        }, wer);

    if (ECHT) await schritt("ankunft", null, true);
    const start = await schritt(ECHT ? "dritte-person" : "probe-buehne", null, true);
    check(
        "die Welt-GPU zeichnet einen Menschen (Mensch-Indizes auf der Welt-GPU)",
        start.mensch > 0,
        `${start.mensch} Mensch-Index-Puffer`
    );
    await schritt("werkstatt-eiche", async () => {
        const wahl = await page.evaluate(() => {
            const r = window.anazhRealm;
            r.toggleDrawer("werkstatt");
            if (r.state.blueprints && r.state.blueprints.baum_eiche)
                return r.selectBlueprintForEdit("baum_eiche") ? "baum_eiche" : null;
            return null;
        });
        const b = await warteBuehne("werkstatt");
        await page.evaluate(() => window.anazhRealm.closeAllDrawers());
        return { wahl, ...b };
    });
    await schritt("tab-ich-buehne", async () => {
        await page.evaluate(() => window.anazhRealm.toggleInventoryOverlay(true));
        const b = await warteBuehne("ich");
        await page.evaluate(() => window.anazhRealm.toggleInventoryOverlay(false));
        return b;
    });
    await schritt(
        "hof-buehne",
        async () => {
            await page.evaluate(() => window.anazhRealm.toggleDrawer("kreaturen"));
            const b = await warteBuehne("hof");
            await page.evaluate(() => window.anazhRealm.closeAllDrawers());
            return b;
        },
        true
    );

    // DIE TÄTER — die Wand beweist sich an jedem Lauf.
    console.log("\n=== DIE TÄTER (die Wachen und die Bild-Probe beißen) ===");
    const t1 = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const F = window.__frostWand;
        const geo = new T.BufferGeometry();
        geo.setAttribute("position", new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
        geo.setIndex(new T.BufferAttribute(new Uint16Array([0, 1, 3]), 1));
        const m = new T.Mesh(geo, new T.MeshBasicNodeMaterial({ color: 0xff00ff }));
        m.name = "frost-taeter-bereich";
        m.frustumCulled = false;
        if (F.echt) {
            const cam = r.state.camera;
            m.position.copy(new T.Vector3(0, 0, -2).applyQuaternion(cam.quaternion).add(cam.position));
        }
        F.wurzel.add(m);
        await F.zeichne(F.echt ? 8 : 1);
        F.wurzel.remove(m);
        const W = r._indexWache;
        return W ? W.brueche.filter((b) => b.art === "bereich").map((b) => `${b.objekt}: ${b.detail}`) : null;
    });
    check(
        "T1 die Index-Wache nennt den Index über der Vertex-Zahl beim Namen",
        !!t1 && t1.some((s) => /frost-taeter-bereich/.test(s)),
        JSON.stringify(t1)
    );
    const t2 = await page.evaluate(() => {
        const r = window.anazhRealm;
        const be = r.state.renderer.backend;
        let ziel = null;
        window.__frostWand.leib.traverse((o) => {
            const g = o.geometry;
            if (
                ziel ||
                !o.visible ||
                !g ||
                !g.index ||
                !(g.index.array instanceof Uint16Array) ||
                !be.data.has(g.index)
            )
                return;
            if (be.data.get(g.index).buffer) ziel = o;
        });
        if (!ziel) return null;
        const vor = r._gpuWache ? r._gpuWache.n : 0;
        // genau, was ein fremdes r184-Backend beim Anlegen tut: die geweitete Form zurück in das geteilte Attribut
        ziel.geometry.index.array = new Uint32Array(ziel.geometry.index.array);
        return { geometrie: ziel.geometry.id, name: ziel.name || ziel.type, vor };
    });
    if (!t2) check("T2 der Mensch trägt einen schmalen Index auf der Welt-GPU", false, "kein Ziel");
    else {
        const steht = await bildPaar("taeter-format");
        const l = await lage();
        const genannt =
            l.indexWache && l.indexWache.brueche.find((b) => b.art === "format" && b.geometrie === t2.geometrie);
        check(
            "T2 die Index-Wache nennt den geweiteten Index beim Pfad",
            !!genannt,
            genannt ? `${genannt.objekt}: ${genannt.detail}` : JSON.stringify(l.indexWache)
        );
        check(
            "T2 die GPU-Wache des Spiels zählt die Validierung",
            !!l.gpuWache && l.gpuWache.n > t2.vor,
            JSON.stringify(l.gpuWache)
        );
        check(
            "T2 der eigene Hörer hört die Validierung (Device oder r184-Fehler-Bereich)",
            l.hoer > 0,
            `${l.hoer} Meldungen: ${l.hoerErste.slice(0, 2).join(" | ")}`
        );
        check(
            "T2 die Bild-Probe erkennt das stehende Bild",
            steht < FOLGT_MIN,
            `${(steht * 100).toFixed(2)} % der Blöcke bewegt`
        );
    }
    console.log(`\n  Dauer ${zeit()}`);

    await browser.close();
    server.close();
    if (fehler.length) {
        console.error(`\n❌ DIE FROST-WAND ROT — ${fehler.length} Befund(e): ${fehler.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ DIE FROST-WAND steht — durch Werkstatt, Ich- und Hof-Bühne trägt jeder Index-Puffer der Welt-GPU sein Format, kein Device meldet, das Bild folgt der Kamera; die Täter (Index über der Vertex-Zahl, ein fremd geweiteter Mensch-Index) nennen die Wachen beim Namen, und das stehende Bild wird erkannt."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Frost-Wand-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
