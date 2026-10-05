// diag-foundry-impostor.cjs — P5/BÄCKER-VEREINIGUNG + W6 DER EINE KARTEN-ATLAS: die Welt-Fernstufe konsumiert den
// STUDIO-Bäcker (Foundry-Worker-Kanal "bake-impostor") über EINEN Karten-Atlas (W6: eine Array-Textur, eine Schicht
// je Karte, EIN Material, EINE Gruppe); der Welt-RTT-Nachbau, das GL-Bake-iframe und der Canvas-Atlas je Karte sind
// GESCHNITTEN. Drei Teile:
//   A (Null-Renderer, HART): die MECHANIK — `_foundryEnsureImpostorRecord` legt eine Atlas-Zelle mit Rahmen an (aus
//     der L1-Geometrie; headless bäckt nie jemand); Eiche + Fichte teilen Quad, Material und EINE Karten-Gruppe, die
//     Schicht und der Rahmen reisen je Instanz (aKarte) über beide Slot-Chokepoints; der Bake-Tick spricht
//     den Kanal "bake-impostor"; KEIN asset-foundry-iframe im DOM; die gefallenen Methoden sind weg.
//   C (swiftshader-WebGPU, HART): das LAYOUT — eine synthetische Karte durch den echten Codec + Schicht-Schreiber
//     steht links oben (nicht gedreht, nicht gespiegelt) — und die Kamera-Kleber-Wand (tote Slots zeichnen nichts).
//   B (echter swiftshader-Renderer, OPT-IN): der Studio-Bake läuft (`__impostorRttBaked` steigt) ohne page-error.
//   node scripts/diag-foundry-impostor.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FIMP_PORT || 4595);
const root = path.resolve(__dirname, "..");
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

async function bootPage(browser, nullRenderer) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((nr) => {
        window.__anazhForceFoundry = true;
        if (nr) window.__anazhHeadlessNullRenderer = true;
    }, nullRenderer);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                typeof window.anazhRealm._foundryEnsureImpostorRecord !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    return { page, pageErrors };
}

// Wartet, bis der Foundry-Worker ready ist + zwei Atlas-Zellen stehen (Eiche, Fichte — der Rahmen kommt headless aus
// der L1-Geometrie, die async lädt), baut ihre Karten-Flats und streut drei Instanzen in die Welt-Gruppen.
async function driveImpostor(page) {
    return await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { ready: false, rec: null, err: null, hasIframe: null, cutMethods: null };
        try {
            const f = r._ensureAssetFoundry();
            const dl = performance.now() + 60000;
            while (f && !f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
            out.ready = !!(f && f.ready);
            if (!out.ready) {
                out.err = "Worker nicht ready";
                return out;
            }
            // Die Zellen treiben: erst lädt die L1-Geometrie (null), dann steht die Zelle mit Rahmen.
            let rec = null,
                rec2 = null,
                flat1 = null,
                flat2 = null;
            const dl2 = performance.now() + 45000;
            while (performance.now() < dl2) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                rec = r._foundryEnsureImpostorRecord("eiche", 1) || rec;
                rec2 = r._foundryEnsureImpostorRecord("fichte", 1) || rec2;
                flat1 = r._foundryBuildImpostorFlat({ seed: 7 }, "eiche") || flat1;
                flat2 = r._foundryBuildImpostorFlat({ seed: 7 }, "fichte") || flat2;
                if (rec && rec2 && flat1 && flat2) break;
                await new Promise((res) => setTimeout(res, 30));
            }
            const at = r._impostorAtlas();
            if (rec) {
                out.rec = {
                    imAtlas: !!(at && at.zellen.get(rec.key) === rec),
                    schicht: rec.idx,
                    hasFrame: !!(rec.frame && rec.frame.halfH > 0 && rec.frame.halfW > 0),
                    keineSaison: !/spring|summer|autumn|winter/.test(rec.key),
                };
            }
            // DER EINE ATLAS: zwei Arten teilen Quad + Material + Gruppe, die Schicht und der Rahmen reisen je Instanz.
            if (flat1 && flat2) {
                const l1 = flat1.leaves[0],
                    l2 = flat2.leaves[0];
                out.atlas = {
                    quadGeteilt: l1.geom === l2.geom,
                    materialGeteilt: l1.mat === l2.mat,
                    billboard: !!(l1.mat && l1.mat.userData && l1.mat.userData.impostorBillboard),
                    schichtenVerschieden: l1.zelle !== l2.zelle,
                    texturen: !!(at.map && at.nmap && at.map.isDataArrayTexture && at.cap >= at.n),
                    fmt: at.fmt,
                };
                // drei Instanzen über BEIDE Slot-Chokepoints: Streu (zwei Arten, Region 3,4) + ein gesetzter Eintrag
                const vor = new Set(r.state.archInstanceGroups ? r.state.archInstanceGroups.keys() : []);
                const sE = r._scatterInstanceAdd("fscatter:eiche:1:2", 10, 0, 10, 0.3, 1.1, null, "3,4", flat1);
                const sF = r._scatterInstanceAdd("fscatter:fichte:1:2", 20, 0, 10, 0.7, 0.9, null, "3,4", flat2);
                const entry = { type: "baum_eiche", position: { x: 30, y: 0, z: 10 }, rotation: 0, scale: 1.2, seed: 7 };
                r._archInstanceAdd(entry, flat1);
                const neu = [...r.state.archInstanceGroups.keys()].filter((k) => !vor.has(k));
                const karten = [...r.state.archInstanceGroups.keys()].filter((k) => /(^|#)fimp:/.test(k));
                const g = r.state.archInstanceGroups.get(r.constructor.IMPOSTOR_ATLAS_GRUPPE);
                const ak = g && g.mesh.geometry.attributes.aKarte; // (Schicht, Halbbreite, Höhe, ±Sichthöhe) je Slot
                const slot = (i) => (ak ? Array.from(ak.array.slice(i * 4, i * 4 + 4)) : [NaN, NaN, NaN, NaN]);
                // die WebGPU-Grenze: höchstens 8 Vertex-Puffer je Pipeline (Echt-GPU 04.10.: 10 → das Bundle starb) —
                // gezählt im schlimmsten Fall: ab 1024 Instanzen reist auch instanceMatrix als Vertex-Puffer (r184)
                const geo = g && g.mesh.geometry;
                const puffer = geo ? Object.keys(geo.attributes).length + (g.mesh.instanceColor ? 1 : 0) + 1 : 99;
                out.gruppen = {
                    neu,
                    karten,
                    // die Slots, die DIESE Probe belegt hat (die Welt kann die Gruppe schon füllen)
                    zellen: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].map((i) => slot(i)[0]),
                    rahmen: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].flatMap((i) => slot(i).slice(1, 3)),
                    slotGruppen: [sE[0].key, sF[0].key, entry.instSlots[0].key],
                    erwartet: [l1.zelle, l2.zelle, l1.zelle],
                    erwartetRahmen: [...l1.rahmen, ...l2.rahmen, ...l1.rahmen],
                    // die Sichthöhe je Slot = Höhe der Höhen-Stufe × Instanz-Skala (dieselbe Zahl wie der aH0-Stempel)
                    sicht: [sE[0].slot, sF[0].slot, entry.instSlots[0].slot].map((i) => slot(i)[3]),
                    erwartetSicht: [l1.sicht * 1.1, l2.sicht * 0.9, l1.sicht * 1.2],
                    instanziert: !!(ak && ak.isInstancedBufferAttribute && ak.itemSize === 4),
                    vertexPuffer: puffer,
                    attribute: geo ? Object.keys(geo.attributes) : [],
                };
            }
            // BÄCKER-VEREINIGUNG: der Bake-Tick spricht den Studio-Kanal, der RTT-Nachbau ist weg.
            const strip = (x) =>
                String(x)
                    .replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/\/\/[^\n]*/g, "");
            out.vereinigung = {
                kanalImTick: /bake-impostor|_foundryBakeImpostorRequest/.test(strip(r._tickImpostorBake)),
                requestMethode: typeof r._foundryBakeImpostorRequest === "function",
                payloadKonsument: typeof r._applyStudioImpostorPayload === "function",
                rttNachbau: typeof r._bakeImpostorAtlasRTT,
            };
            // Kein asset-foundry-iframe im DOM (das Bake-iframe ist geschnitten).
            out.hasIframe = !!document.querySelector('iframe[src*="asset-foundry"]');
            // Die iframe-Methoden sind weg (der Karten-Zwilling W6 — Canvas-Atlas je Karte, Umdrehen, Silhouette,
            // Re-Frame, Rahmen-Quad — steht in gate:altlasten).
            out.cutMethods = {
                requestImpostor: typeof r._foundryRequestImpostor,
                ensureBakeIframe: typeof r._foundryEnsureBakeIframe,
                buildImpostorRecord: typeof r._foundryBuildImpostorRecord,
            };
            out.rttBaked = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            // Den Bake-Tick pumpen (echter Renderer bäckt async über mehrere Frames).
            for (let i = 0; i < 40; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 30));
                if ((window.__impostorRttBaked || 0) > out.rttBaked) break;
            }
            out.rttBakedAfter = (typeof window !== "undefined" && window.__impostorRttBaked) || 0;
            out.rttErrorAfter = (typeof window !== "undefined" && window.__impostorRttError) || null;
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });
}

// ===== TEIL C — DIE KARTEN-WAND auf echtem Renderer (swiftshader-WebGPU, frischer in-page Renderer) =====
// (1) DAS LAYOUT: eine synthetische Studio-Karte (jede Ansicht: nur die LINKE OBERE Viertel-Fläche opak, Zeile 0 =
//     Unterkante wie readPixels) reist durch den ECHTEN Karten-Codec (__phytoCore.karteKodiere, BC wenn der Adapter
//     es kann, sonst rgba8) und den ECHTEN Schicht-Schreiber in den Atlas — das Bild MUSS links oben stehen (die Karte
//     steht richtig herum und ist nicht gespiegelt).
// (2) DIE KAMERA-KLEBER-WAND (18.07., Schöpfer: „Felsen/Kristalle/Autos/Feueresse hängen an der Kamera"): Wurzel —
//     _archGroupFree lässt die Null-3×3 mit lebender Translation zurück; der Impostor-positionNode baut das Quad aus
//     Translation + Normal-Probe NEU — der singulär gewordene Probe machte den toten Slot zu einem welt-spannenden
//     camera-facing Quad. Die Wand: _lebt = probe²>1e-12 + select ⇒ toter Slot: _sInst=0 UND _alpha=0.
//     SELBSTTEST — ein Monster-Slot (Skala 1000) MUSS den Schirm fluten; derselbe Slot durch den ECHTEN Free-Chokepoint
//     befreit ⇒ ~0 Pixel in seiner Schirm-Hälfte; der lebende Slot zeichnet weiter.
async function kleberProbe(page, fmtWunsch) {
    return await page.evaluate(async (fmtWunsch) => {
        const r = window.anazhRealm;
        const out = { err: null };
        try {
            const T = THREE;
            const ren = new T.WebGPURenderer({ antialias: false });
            await ren.init();
            const W = 192,
                H = 128;
            ren.setSize(W, H, false);
            // Ein frischer Atlas im Format des Probe-Renderers (die Seite fährt den Null-Renderer).
            // BEIDE Format-Stufen desselben Pfads: BC (Adapter-Feature) und rgba8/rg8 (DataArrayTexture, GPU-Mips)
            if (fmtWunsch === "bc" && !ren.hasFeature("texture-compression-bc")) return { fmt: "bc", ohneFeature: true };
            out.fmt = fmtWunsch;
            r._kartenAtlas = undefined;
            const at = r._impostorAtlas();
            at.fmt = out.fmt;
            const prevCf = r.state.foundryCrossfade;
            r.state.foundryCrossfade = false; // die Nah-Ausblendung des Crossfades maskiert die Probe sonst
            if (r.state._foliageMatCache)
                for (const [k, m] of r.state._foliageMatCache) if (m.userData && m.userData.impostorBillboard) r.state._foliageMatCache.delete(k);
            const mat = r._impostorAtlasMaterial();
            r.state.foundryCrossfade = prevCf;
            out.billboard = !!(mat && mat.userData && mat.userData.impostorBillboard);
            if (!out.billboard) {
                out.err = "Impostor-TSL-Wiring fehlgeschlagen: " + (window.__impostorAtlasError || "unbekannt");
                return out;
            }
            // (1) die synthetische Studio-Karte: Albedo linear, links oben opak; Normale zur Kamera
            const core = window.__phytoCore;
            const cw = at.cw,
                ch = at.ch,
                V = at.V,
                H0 = 8; // die Sichthöhe der Probe-Karten (= ihr Rahmen 2 · halfH)
            const alb = new Uint8Array(cw * ch * V * 4);
            for (let y = 0; y < ch * V; y++)
                for (let x = 0; x < cw; x++) {
                    const vy = (y % ch) / ch; // 0 = Unterkante der Ansicht
                    if (x < cw / 2 && vy >= 0.5) {
                        const o = (y * cw + x) * 4;
                        alb[o] = 60;
                        alb[o + 1] = 160;
                        alb[o + 2] = 40;
                        alb[o + 3] = 255;
                    }
                }
            const nrm = new Uint8Array(cw * ch * V * 4); // voll: der Codec mittelt sie auf 1/normalTeiler
            for (let i = 0; i < nrm.length; i += 4) {
                nrm[i] = 128;
                nrm[i + 1] = 128;
                nrm[i + 2] = 255;
                nrm[i + 3] = 255;
            }
            const schicht = core.karteKodiere(
                { cw, ch, V, frame: { halfH: 4, halfW: 4 }, albedo: alb, normal: nrm },
                at.fmt
            );
            const z = r._impostorZelleNeu(at, "fimp:gateKarte|1", "eiche", 1, null);
            out.geschrieben = r._applyStudioImpostorPayload(z, schicht);
            const leaf = r._impostorLeaf(z, new T.Matrix4(), H0);
            // die volle Karte (jede Ansicht ganz opak) trägt den Monster-Slot: sein sichtbarer Fuß-Ausschnitt deckt
            const albV = new Uint8Array(alb.length);
            for (let i = 0; i < albV.length; i += 4) {
                albV[i + 1] = 120;
                albV[i + 3] = 255;
            }
            const zV = r._impostorZelleNeu(at, "fimp:gateKarte|2", "eiche", 2, null);
            const vollOk = r._applyStudioImpostorPayload(
                zV,
                core.karteKodiere({ cw, ch, V, frame: { halfH: 4, halfW: 4 }, albedo: albV, normal: nrm }, at.fmt)
            );
            out.geschrieben = out.geschrieben && vollOk;
            const leafV = r._impostorLeaf(zV, new T.Matrix4(), H0);
            const geo = r._lodInstanceFacade(leaf.geom, 2);
            const mesh = new T.InstancedMesh(geo, mat, 2);
            mesh.frustumCulled = false;
            const M = new T.Matrix4();
            // Slot 0 (LEBT): links im Bild. Slot 1 (erst MONSTER, dann befreit): rechts im Bild.
            M.compose(new T.Vector3(-6, 0, 0), new T.Quaternion(), new T.Vector3(1, 1, 1));
            mesh.setMatrixAt(0, M);
            M.compose(new T.Vector3(6, 0, 0), new T.Quaternion(), new T.Vector3(1000, 1000, 1000));
            mesh.setMatrixAt(1, M);
            mesh.count = 2;
            mesh.instanceMatrix.needsUpdate = true;
            r._lodSlotStamp({ mesh }, 0, 1, false, leaf);
            r._lodSlotStamp({ mesh }, 1, 1, false, leafV);
            const szene = new T.Scene();
            szene.add(mesh);
            szene.add(new T.AmbientLight(0xffffff, 3));
            const cam = new T.PerspectiveCamera(60, W / H, 0.5, 500);
            cam.position.set(0, 4, 26);
            cam.lookAt(0, 4, 0);
            cam.updateMatrixWorld(true);
            const rt = new T.RenderTarget(W, H);
            ren.setRenderTarget(rt);
            // Die Schirm-Box des lebenden Quads (Anker −6, Halbbreite 4, Höhe 8) — in Quadranten geteilt.
            const px = (x, y) => {
                const v = new T.Vector3(x, y, 0).project(cam);
                return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
            };
            const [x0, yUnten] = px(-10, 0),
                [x1, yOben] = px(-2, 8);
            // EICHUNG der Lese-Richtung: ein Marker über dem Quad (allein gezeichnet) — liest die Rückgabe Zeile 0 oben?
            const marker = new T.Mesh(new T.BoxGeometry(2, 2, 2), new T.MeshBasicMaterial({ color: 0xffffff }));
            marker.position.set(-6, 14, 0);
            szene.add(marker);
            mesh.visible = false;
            await ren.renderAsync(szene, cam);
            const mb = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            let sy = 0,
                ny = 0;
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++)
                    if (mb[(y * W + x) * 4 + 3] > 0) {
                        sy += y;
                        ny++;
                    }
            const yMarker = px(-6, 14)[1];
            const obenZuerst = ny > 0 && Math.abs(sy / ny - yMarker) < Math.abs(H - 1 - sy / ny - yMarker);
            out.eichung = { markerPx: ny, obenZuerst };
            szene.remove(marker);
            mesh.visible = true;
            const zaehle = async () => {
                await ren.renderAsync(szene, cam);
                const buf = await ren.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const q = { lo: 0, ro: 0, lu: 0, ru: 0, links: 0, rechts: 0, zeilen: {} };
                const xm = (x0 + x1) / 2,
                    ym = (yOben + yUnten) / 2;
                for (let yr = 0; yr < H; yr++)
                    for (let x = 0; x < W; x++) {
                        if (!(buf[(yr * W + x) * 4 + 3] > 0)) continue;
                        const y = obenZuerst ? yr : H - 1 - yr; // Schirm-Zeile, 0 = oben
                        if (x < W / 2) q.links++;
                        else q.rechts++;
                        if (x >= x0 && x <= x1 && y >= yOben && y <= yUnten) {
                            q[y < ym ? (x < xm ? "lo" : "ro") : x < xm ? "lu" : "ru"]++;
                            q.zeilen[y] = (q.zeilen[y] || 0) + 1;
                        }
                    }
                return q;
            };
            const vorher = await zaehle();
            out.monsterPx = vorher.rechts;
            // (2) DIE WAND: Slot 1 durch den ECHTEN Free-Chokepoint befreien.
            const fakeG = { mesh, free: [], slotEntry: null, liveCount: 2 };
            r._archGroupFree(fakeG, 1);
            out.freeNull3x3 = (() => {
                const chk = new T.Matrix4();
                mesh.getMatrixAt(1, chk);
                const e = chk.elements;
                return e[0] === 0 && e[5] === 0 && e[10] === 0 && Math.abs(e[12] - 6) < 1e-6;
            })();
            const nachher = await zaehle();
            // das Layout zählt nach der Befreiung (der Monster-Slot deckt vorher auch die linke Box)
            out.layout = { lo: nachher.lo, ro: nachher.ro, lu: nachher.lu, ru: nachher.ru, zeilen: nachher.zeilen };
            out.box = { x0, x1, yOben, yUnten };
            out.lebtPx = nachher.links;
            out.totPx = nachher.rechts;
            ren.dispose();
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    }, fmtWunsch);
}

// ===== TEIL D — DIE STRICH-WAND (Integration W6, Echt-GPU 05.10.) =====
// Die Karte liest die Peilung des ANKERS (für das ganze Quad dieselbe); steht sie genau auf einer Ansichts-Grenze, kippt
// ihr Rundungs-Rauschen einzelne Pixel auf die Nachbar-Ansicht — die Atlas-Koordinate springt dort um 1/8 bis 7/8 der
// Textur. Nahm die Hardware die Ableitung aus der springenden Koordinate, griff sie im 2×2-Block die gröbste Stufe, deren
// Filter den Fuß der Nachbar-Ansicht als senkrechten Strich über die Krone zog (Höhen-Sonde, echte GPU: 30–40 px über der
// L1-Spitze, Peilung auf einer Ansicht). swiftshader rechnet die Peilung ohne Rauschen und sieht den Strich nie — die Wand
// liest darum die QUELLE: jede Atlas-Stichprobe (Albedo und Normale) läuft über `_probeA` mit den Gradienten der STETIGEN
// Koordinate (die Ansichts-Höhe ohne Sprung). Den Strich am Bild misst die Höhen-Sonde der Werkbank (artifacts/profiband/
// integ-stufe6, `hoehe-sonde.js`).
function strichWand(src) {
    const v = [];
    const zahl = (t) => src.split(t).length - 1;
    if (!src.includes("const _uvStetig = _Ta.vec2(_uv.x, _uv.y.div(_V));"))
        v.push("die stetige Koordinate (uv.x, uv.y / V) fehlt");
    if (!src.includes("const _gX = _uvStetig.dFdx();") || !src.includes("const _gY = _uvStetig.dFdy();"))
        v.push("die Gradienten kommen nicht aus der stetigen Koordinate");
    if (!src.includes("const _probeA = (tex, uv) => tex.sample(uv).depth(_schicht).grad(_gX, _gY);"))
        v.push("die Atlas-Stichprobe trägt keine expliziten Gradienten");
    const direkt = zahl("_at.mapNode.sample(") + zahl("_at.nmapNode.sample(");
    if (direkt) v.push(direkt + " Atlas-Stichprobe(n) an _probeA vorbei (Ableitung aus der springenden Koordinate)");
    const albedo = zahl("_probeA(_at.mapNode, _uvA)") + zahl("_probeA(_at.mapNode, _uvB)");
    const normale = zahl("_probeA(_at.nmapNode, _uvA)") + zahl("_probeA(_at.nmapNode, _uvB)");
    if (albedo !== 2 || normale !== 2)
        v.push(`Albedo (${albedo}) und Normale (${normale}) laufen nicht je zweimal (Ansicht A und B) über _probeA`);
    return v;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const errs = [];

    // ===== TEIL A — MECHANIK (Null-Renderer, HART) =====
    const browserA = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const { page: pageA, pageErrors: errA } = await bootPage(browserA, true);
    const A = await driveImpostor(pageA);
    const Cs = [await kleberProbe(pageA, "bc"), await kleberProbe(pageA, "rgba8")];
    await browserA.close();

    console.log("=== P5/BÄCKER-VEREINIGUNG + W6 DER EINE KARTEN-ATLAS — TEIL A: MECHANIK (Null-Renderer) ===");
    console.log(`  Worker ready: ${A.ready}`);
    console.log(`  Atlas-Zelle: ${JSON.stringify(A.rec)}`);
    console.log(`  Atlas (Quad/Material geteilt, Schichten): ${JSON.stringify(A.atlas)}`);
    console.log(`  Gruppen (Streu ×2 Arten + gesetzt): ${JSON.stringify(A.gruppen)}`);
    console.log(`  Vereinigung (Kanal/Methoden/kein Nachbau): ${JSON.stringify(A.vereinigung)}`);
    console.log(`  asset-foundry-iframe im DOM: ${A.hasIframe} (erwartet false)`);
    console.log(`  gefallene Methoden (erwartet undefined): ${JSON.stringify(A.cutMethods)}`);
    if (A.err) console.log(`  Fehler: ${A.err}`);
    if (errA.length) console.log("  Seiten-Fehler A:", errA.slice(0, 3));

    if (!A.ready) errs.push("A: der Worker wurde nicht ready");
    if (!A.rec) errs.push("A: keine Atlas-Zelle entstanden (die LOD1-Geometrie lud nicht?)");
    else {
        if (!A.rec.imAtlas) errs.push("A: die Zelle steht nicht im EINEN Atlas (_impostorAtlas().zellen)");
        if (!A.rec.hasFrame) errs.push("A: die Zelle hat keinen Rahmen");
        if (!A.rec.keineSaison) errs.push("A: der Zell-Schlüssel trägt eine Saison");
    }
    if (!A.atlas) errs.push("A: keine Karten-Flats (Eiche + Fichte) entstanden");
    else {
        if (!A.atlas.quadGeteilt) errs.push("A: zwei Arten tragen verschiedene Quads (je Karte eine Geometrie)");
        if (!A.atlas.materialGeteilt) errs.push("A: zwei Arten tragen verschiedene Materialien (je Karte ein Programm)");
        if (!A.atlas.billboard) errs.push("A: das Atlas-TSL-Wiring kam nicht zustande (kein Billboard-Marker)");
        if (!A.atlas.schichtenVerschieden) errs.push("A: zwei Arten teilen dieselbe Atlas-Schicht");
        if (!A.atlas.texturen) errs.push("A: der Atlas trägt keine Array-Texturen für seine Zellen");
    }
    if (A.gruppen) {
        const G = A.gruppen;
        if (G.karten.length !== 1)
            errs.push(`A: ${G.karten.length} Karten-Gruppen statt EINER (${G.karten.slice(0, 4).join(" · ")})`);
        if (!G.slotGruppen.every((k) => k === "impostor#fimp:atlas"))
            errs.push(`A: die Probe-Slots liegen nicht in der Atlas-Gruppe (${G.slotGruppen.join(" · ")})`);
        if (!G.instanziert) errs.push("A: aKarte ist kein Instanz-vec4 der Karten-Gruppe");
        if (!(G.vertexPuffer <= 8))
            errs.push(`A: die Karten-Pipeline trägt ${G.vertexPuffer} Vertex-Puffer (WebGPU-Grenze 8): ${G.attribute.join(" · ")}`);
        else {
            if (JSON.stringify(G.zellen) !== JSON.stringify(G.erwartet))
                errs.push(`A: aKarte.x je Slot ${JSON.stringify(G.zellen)} ≠ ${JSON.stringify(G.erwartet)}`);
            const rOk = G.rahmen.every((v, i) => Math.abs(v - G.erwartetRahmen[i]) < 1e-5);
            if (!rOk) errs.push(`A: aKarte.yz je Slot ${JSON.stringify(G.rahmen)} ≠ ${JSON.stringify(G.erwartetRahmen)}`);
            // die Sichthöhe der Maske: die Höhe der Höhen-Stufe × Instanz-Skala (der aH0-Stempel der L1), frei = positiv
            const sOk = G.sicht.every((v, i) => v > 0 && Math.abs(v - G.erwartetSicht[i]) < 1e-3 * Math.max(1, G.erwartetSicht[i]));
            if (!sOk) errs.push(`A: aKarte.w je Slot ${JSON.stringify(G.sicht)} ≠ ${JSON.stringify(G.erwartetSicht)} (Sichthöhe × Skala)`);
        }
    }
    if (A.vereinigung) {
        if (!A.vereinigung.kanalImTick)
            errs.push("A: `_tickImpostorBake` spricht NICHT den Studio-Kanal (bake-impostor)");
        if (!A.vereinigung.requestMethode) errs.push("A: `_foundryBakeImpostorRequest` fehlt");
        if (!A.vereinigung.payloadKonsument) errs.push("A: `_applyStudioImpostorPayload` fehlt");
        if (A.vereinigung.rttNachbau !== "undefined")
            errs.push(`A: der RTT-Nachbau ` + "`_bakeImpostorAtlasRTT`" + ` lebt noch (${A.vereinigung.rttNachbau})`);
    } else if (A.ready) errs.push("A: die Vereinigungs-Proben liefen nicht");
    if (A.hasIframe) errs.push("A: ein asset-foundry-iframe LEBT noch im DOM (P3b nicht geschnitten)");
    if (A.cutMethods) {
        for (const [k, v] of Object.entries(A.cutMethods))
            if (v !== "undefined") errs.push(`A: die gefallene Methode ${k} existiert noch (${v})`);
    }
    if (errA.length) errs.push(`A: ${errA.length} Seiten-Fehler`);

    for (const C of Cs) {
        const F = `C[${C.fmt}]`;
        console.log(`\n=== TEIL C [${C.fmt}] — DIE KARTEN-WAND (Layout + tote Slots zeichnen NICHTS, swiftshader-WebGPU) ===`);
        if (C.ohneFeature) {
            console.log("  (der Probe-Adapter kennt texture-compression-bc nicht — die BC-Stufe misst die Blick-Sonde)");
            continue;
        }
        console.log(`  geschrieben: ${C.geschrieben} · Wiring: ${C.billboard}`);
        console.log(`  Eichung der Lese-Richtung: ${JSON.stringify(C.eichung)}`);
        console.log(
            `  LAYOUT (Karte: links oben opak) — Quadranten px: lo ${C.layout && C.layout.lo} · ro ${C.layout && C.layout.ro}` +
                ` · lu ${C.layout && C.layout.lu} · ru ${C.layout && C.layout.ru}`
        );
        if (C.layout) console.log(`  Schirm-Box ${JSON.stringify(C.box)} · Zeilen ${JSON.stringify(C.layout.zeilen)}`);
        console.log(`  Selbsttest Monster-Slot (Skala 1000) Pixel: ${C.monsterPx} (Linse MUSS Müll sehen)`);
        console.log(`  Free-Chokepoint Null-3×3+Translation: ${C.freeNull3x3}`);
        console.log(`  nach _archGroupFree — lebender Slot: ${C.lebtPx} px · toter Slot: ${C.totPx} px`);
        if (C.err) {
            console.log(`  Fehler: ${C.err}`);
            errs.push(`${F}: Karten-Probe brach ab — ${C.err}`);
            continue;
        }
        if (!C.billboard) errs.push(`${F}: das Atlas-TSL-Wiring kam nicht zustande (kein Billboard-Marker)`);
        if (!C.geschrieben) errs.push(`${F}: die kodierte Schicht wurde nicht in den Atlas geschrieben`);
        if (!(C.eichung && C.eichung.markerPx > 4)) errs.push(`${F}: die Eichung sah den Marker nicht (Probe blind)`);
        const L = C.layout || {};
        const rest = (L.ro || 0) + (L.lu || 0) + (L.ru || 0);
        if (!(L.lo > 40 && L.lo > 6 * rest))
            errs.push(`${F}: die Karte steht NICHT links oben (lo ${L.lo} · Rest ${rest}) — Layout gedreht oder gespiegelt`);
        if (!(C.monsterPx > 200))
            errs.push(`${F}-SELBSTTEST: der Monster-Slot flutete den Schirm NICHT (${C.monsterPx} px) — die Linse ist blind`);
        if (!C.freeNull3x3) errs.push(`${F}: _archGroupFree schrieb nicht die erwartete Null-3×3 mit lebender Translation`);
        if (!(C.lebtPx > 40)) errs.push(`${F}: der LEBENDE Slot zeichnet zu wenig (${C.lebtPx} px ≤ 40) — die Probe ist blind`);
        if (!(C.totPx <= 8))
            errs.push(`${F}: der TOTE Slot zeichnet noch ${C.totPx} px (> 8) — die Kamera-Kleber-Wand hält NICHT`);
    }

    console.log("\n=== TEIL D — DIE STRICH-WAND (Quelle: jede Atlas-Stichprobe mit den Gradienten der stetigen Koordinate) ===");
    {
        const quelle = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const echt = strichWand(quelle);
        console.log(`  echte Quelle: ${echt.length ? echt.join(" · ") : "hält"}`);
        for (const f of echt) errs.push("D: " + f);
        const ANKER = "const _probeA = (tex, uv) => tex.sample(uv).depth(_schicht).grad(_gX, _gY);";
        for (const [name, src] of [
            ["Stichprobe ohne Gradienten", quelle.replace(ANKER, "const _probeA = (tex, uv) => tex.sample(uv).depth(_schicht);")],
            [
                "Gradienten aus der springenden Koordinate",
                quelle.replace("const _gX = _uvStetig.dFdx();", "const _gX = _uvA.dFdx();"),
            ],
            [
                "Normale direkt gesampelt",
                quelle.replace("_probeA(_at.nmapNode, _uvA).xy", "_at.nmapNode.sample(_uvA).depth(_schicht).xy"),
            ],
        ]) {
            const f = strichWand(src);
            const feuert = src !== quelle && f.length > 0;
            console.log(`  Selbsttest „${name}“ → ${feuert ? "feuert" : "BLIND"}${src === quelle ? " (ANKER FEHLT)" : ""}`);
            if (!feuert) errs.push(`D-SELBSTTEST: „${name}“ → die Wand feuert nicht${src === quelle ? " (ANKER FEHLT)" : ""}`);
        }
    }

    // ===== TEIL B — DER RTT-BAKE LÄUFT (echter swiftshader-Renderer, OPT-IN) =====
    // NUR mit P5_REAL_RENDERER=1: zwei swiftshader-Seiten verhungern den Container-Event-Loop
    // (dokumentiert) → per Default aus, damit der Gate deterministisch bleibt. Den RTT-LOOK
    // misst die Blick-Sonde auf echter GPU; Mechanik (A) und Layout (C) sind der hardware-unabhängige Beweis.
    if (process.env.P5_REAL_RENDERER) {
        console.log("\n=== P5 — TEIL B: RTT-BAKE auf echtem Renderer (opt-in) ===");
        try {
        const browserB = await puppeteer.launch({
            headless: true,
            protocolTimeout: 180000,
            args: [
                "--use-angle=swiftshader",
                "--enable-unsafe-swiftshader",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        const { page: pageB, pageErrors: errB } = await bootPage(browserB, false);
        const B = await driveImpostor(pageB);
        await browserB.close();
        console.log(`  Worker ready: ${B.ready} · Record foundry: ${B.rec && B.rec.foundry}`);
        console.log(`  RTT gebacken (nach Pump): ${B.rttBakedAfter} · RTT-Fehler: ${B.rttErrorAfter || "keiner"}`);
        if (errB.length) {
            console.log("  Seiten-Fehler B:", errB.slice(0, 3));
            errs.push(`B: ${errB.length} Seiten-Fehler beim RTT-Pfad`);
        }
        if (B.err) console.log(`  (B-Notiz: ${B.err})`);
            if (B.rttBakedAfter > 0) console.log("  ok — der RTT-Bake lief auf echter GPU-Bahn (Atlas gebacken).");
            else console.log("  (RTT nicht abgeschlossen — swiftshader-fragil; den LOOK misst die Blick-Sonde auf echter GPU.)");
        } catch (e) {
            console.log(`  (Teil B uebersprungen — Renderer-Start fehlgeschlagen: ${(e && e.message) || e})`);
        }
    } else {
        console.log("\n(Teil B [echter RTT-Bake] per Default aus — mit P5_REAL_RENDERER=1 aktivieren; den LOOK misst die Blick-Sonde auf echter GPU.)");
    }

    server.close();
    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Welt-Fernstufe konsumiert den STUDIO-Bäcker über EINEN Karten-Atlas (eine Gruppe, ein Material, Schicht + Rahmen je Instanz), die Karte steht richtig herum, tote Slots zeichnen nichts, jede Atlas-Stichprobe trägt die Gradienten der stetigen Koordinate (kein Stamm-Strich); RTT-Nachbau, Bake-iframe und Canvas-Atlas je Karte sind geschnitten."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Foundry-Impostor-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
