// diag-schatten-werfer.cjs — DIE WERFER-WAND (npm run gate:schatten-werfer).
//
// Befund 04.10. (echte GPU, Mess-Wiese, V18.528): beide CSM-Kaskaden zeichneten DIESELBE Werfer-Menge (k0 = k1 = 209
// Befehle · 1,23 M Dreiecke). Drei Wurzeln: (a) das r184-Addon setzte jede Kaskade auf ein Quadrat mit der Diagonale
// ihrer Frustum-Scheibe (347 m / 957 m) — der Blick deckte ein Viertel —, und es stellte die Lichter NACH den Karten
// (r184 ruft sein updateBefore nach den Kaskaden-Pässen); (b) die Region-Bundles trugen EIN Urteil für jeden Pass, das
// der Haupt-Kamera: ein Bundle im Blick warf in beide Kaskaden, eines hinter dem Blick nie; (c) jede Region warf als
// Ganzes. Die Heilung: `_kaskadenPassen` misst die Box an der Scheibe im Licht-Raum (gerastet, texel-geschnappt, nahe
// Ebene über dem höchsten Werfer) im Haken des Haupt-Passes VOR den Karten, `_passSicht` wählt je Schatten-Pass die
// Regionen (Werfer-Hülle) und darin die Werfer (Box je Blatt-Mesh) gegen das Frustum der Pass-Kamera; ein Bundle
// zeichnet dort direkt und frisch (nicht static).
//
// Diese Linse (Null-Renderer, GPU-frei) fährt die ECHTEN Methoden an einer echten CSM-Instanz (Addon-Init mit der
// Haupt-Kamera, wie der erste Material-Bau) und der gebooteten Welt:
//   K1  die Box deckt die Scheibe: jeder Empfänger-Punkt der Kaskade (Ecken im Höhenband + Kanten-Schnitte) liegt im
//       Frustum ihrer Kamera — mittags und am Abend
//   K2  die Box ist eng: Fläche ≤ 60 % des Addon-Quadrats (Diagonale + Fade-Saum) je Kaskade, waagrechter Blick
//   K3  das Zentrum liegt auf dem Texel-Raster der Licht-Basis; 0,37 m Gehen hält Größe und Raster
//   K4  außerhalb des Takts: dieselbe Kamera → keine Kaskade rendert; 40° gedreht → beide rendern (die Scheibe lief
//       aus der Box)
//   K5  die Karten-Größe folgt der Texel-Dichte (sqrt(Referenz-Fläche)/N ≤ texelM, kleinste Zweierpotenz)
//   W1  je Kaskaden-Pass liegt JEDES sichtbare Bundle mit seiner Werfer-Hülle und JEDER sichtbare Werfer mit seiner
//       Box im Frustum der Pass-Kamera; nach dem Pass: Haupt-Urteil, jeder Werfer zurück, Bundles wieder static
//   W2  ein Werfer 2 km vor der Kamera (im Haupt-Urteil sichtbar) wirft in keine Kaskade
//   W3  ein Werfer hinter dem Blick (Haupt-Urteil unsichtbar), der in die nahe Kaskade wirft, wirft
//   W4  eine Region mit einem nahen und einem 2 km fernen Werfer: die Region wirft, der ferne Werfer ruht
//   Z1  die Karten-Ziele: Farbe r8 (der Filter liest sie nur mit shadowMap.transmitted), Tiefe 16 bit, benannt —
//       gesetzt beim Bau des Ziels (die Hülle um setupRenderTarget), nie umgebaut
//   A1  Absenz: kein Frustum-Schreiber nimmt Inseln/Mesh-Tieren den Schatten; das Addon-updateBefore ist stumm, der
//       Haken des Haupt-Passes stellt die Kaskaden (Konsum), Schatten-Pässe stellen nichts
//   H1  die Boden-Entlassung (_chunkBodenNulle) lässt Box und Kugel stehen — die Werfer-Hülle rechnet nie aus leeren
//       Arrays (27 von 49 Böden trugen NaN, ihre Region warf in jede Kaskade)
//   S1  Selbsttest: die alte Regel (jeder Pass liest das Haupt-Urteil) muss W1/W2/W3/W4 rot machen
//   S2  Selbsttest: die alte Entlassung (nur leeren) muss eine NaN-Hülle hinterlassen
//
//   node scripts/diag-schatten-werfer.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SCHATTEN_WERFER_PORT || 4577);
const SELBSTTEST = process.argv.includes("--selftest");
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
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

function probe(selbsttest) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const st = r.state;
    const A = r.constructor;
    const K = A.SCHATTEN_KASKADE;
    const cam = st.camera;
    const csm = st.csmNode;
    const aus = { selbsttest };
    if (!csm) return Object.assign(aus, { fehler: "keine CSM" });
    // Die Addon-Init, wie sie der erste Material-Bau fährt (Kaskaden-Lichter + Frusta an der Haupt-Kamera).
    if (!csm.camera) csm._init({ camera: cam, renderer: { coordinateSystem: cam.coordinateSystem } });
    const pm = st.playerMesh.position;
    const blick = (yaw) => {
        cam.position.set(pm.x, pm.y + 1.6, pm.z);
        cam.lookAt(pm.x + Math.sin(yaw) * 100, pm.y + 1.6, pm.z + Math.cos(yaw) * 100);
        cam.updateMatrixWorld(true);
        r._loopFrustumCulling(); // das Haupt-Urteil der Bundles für diesen Blick
    };
    const tag = (t) => {
        st.timeOfDay = t;
        if (st.world) st.world.timeOfDay = t;
        r._applyDayNightToScene();
        st.directionalLight.updateMatrixWorld(true);
        st.directionalLight.target.updateMatrixWorld(true);
    };
    const alleNeu = () => csm.lights.forEach((l) => ((l.shadow.autoUpdate = false), (l.shadow.needsUpdate = true)));
    const S = r._kaskadenSchmier();
    // Kamera der Kaskade so, wie `renderShadow` sie stellt (updateMatrices), dann ihr Frustum.
    const frustumVon = (i) => {
        const lw = csm.lights[i];
        lw.shadow.updateMatrices(lw);
        const c = lw.shadow.camera;
        const m = new T.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
        return new T.Frustum().setFromProjectionMatrix(m, c.coordinateSystem);
    };
    const deckt = () => {
        let schlecht = 0,
            n = 0;
        const huellen = r._kaskadenHuellen(S);
        for (let i = 0; i < csm.lights.length; i++) {
            const fr = frustumVon(i);
            const k = r._kaskadenScheibe(csm, i, huellen, S);
            for (let j = 0; j < k; j++) {
                n++;
                if (!fr.containsPoint(S.punkte[j])) schlecht++;
            }
        }
        return { schlecht, n };
    };
    // Das Addon-Quadrat je Kaskade (CSMShadowNode._updateShadowBounds: Diagonale + Fade-Saum).
    const addonBreite = (i) => {
        const f = csm.frustums[i];
        const p1 = f.vertices.far[0];
        const p2 =
            p1.distanceTo(f.vertices.far[2]) > p1.distanceTo(f.vertices.near[2])
                ? f.vertices.far[2]
                : f.vertices.near[2];
        const far = Math.max(cam.far, csm.maxFar);
        const ld = f.vertices.far[0].z / (far - cam.near);
        return p1.distanceTo(p2) + 0.25 * ld * ld * (far - cam.near);
    };

    // ── K: die Box ──
    tag(0.5);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.karten = csm._anazhKarten.slice();
    aus.k1Mittag = deckt();
    aus.k2 = csm._anazhFit.map((f, i) => {
        const a = addonBreite(i);
        return {
            W: +f.W.toFixed(1),
            H: +f.H.toFixed(1),
            addon: +a.toFixed(1),
            anteil: +((f.W * f.H) / (a * a)).toFixed(3),
        };
    });
    aus.k3 = csm._anazhFit.map((f) => {
        const q = (f.x0 + f.W / 2) / f.texel;
        return Math.abs(q - Math.round(q)) < 1e-6;
    });
    const vorher = csm._anazhFit.map((f) => ({ W: f.W, texel: f.texel }));
    cam.position.x += 0.37;
    cam.updateMatrixWorld(true);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.k3gehen = csm._anazhFit.map((f, i) => {
        const q = (f.x0 + f.W / 2) / f.texel;
        return f.W === vorher[i].W && Math.abs(q - Math.round(q)) < 1e-6;
    });
    // K4 — außerhalb des Takts
    csm.lights.forEach((l) => ((l.shadow.autoUpdate = false), (l.shadow.needsUpdate = false)));
    r._kaskadenPassen(csm);
    aus.k4still = csm.lights.map((l) => l.shadow.needsUpdate === true);
    blick(0.7);
    csm.lights.forEach((l) => (l.shadow.needsUpdate = false));
    r._kaskadenPassen(csm);
    aus.k4dreh = csm.lights.map((l) => l.shadow.needsUpdate === true);
    // K1 am Abend (lange Schatten, schräge Box)
    tag(0.72);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    aus.k1Abend = deckt();
    // K5 — die Texel-Dichte trägt die Karte
    {
        const far = A.PERF_SHADOW_RANGE_MAX * A.SCHATTEN_FERN_FAKTOR;
        const br = [];
        csm.customSplitsCallback(csm.cascades, cam.near, far, br);
        const halb = Math.tan(T.MathUtils.degToRad(cam.fov) / 2) * K.bezugAspekt;
        const saum = [0, 1];
        aus.k5 = aus.karten.map((n, i) => {
            r._kaskadenSaum(br, i, csm.fade === true, saum);
            const dA = cam.near + saum[0] * (far - cam.near),
                dB = cam.near + saum[1] * (far - cam.near);
            const wurzel = Math.sqrt(2 * halb * dB * (dB - dA));
            const tx = K.texelM[Math.min(i, K.texelM.length - 1)];
            return {
                n,
                texel: +(wurzel / n).toFixed(3),
                soll: tx,
                kleinste: wurzel / n <= tx && wurzel / (n / 2) > tx,
            };
        });
    }

    // ── W: die Werfer je Pass ──
    tag(0.5);
    blick(0);
    alleNeu();
    r._kaskadenPassen(csm);
    const map = st._regionBundles;
    const kasten = (x, y, z, s) => {
        const bg = new T.BundleGroup();
        const m = new T.Mesh(new T.BoxGeometry(s, s, s), new T.MeshBasicMaterial());
        m.position.set(x, y, z);
        m.castShadow = true;
        bg.add(m);
        st.scene.add(bg);
        bg.updateMatrixWorld(true);
        return bg;
    };
    // W2 — 2 km vor der Kamera, im Haupt-Urteil sichtbar (so sah die alte Regel ihn: im Blick → wirft)
    const fern = kasten(pm.x, pm.y + 5, pm.z + 2000, 20);
    fern.userData._sichtHaupt = true;
    map.set("__w7:fern", fern);
    // W3 — hinter dem Blick, aber zwischen Licht und naher Scheibe: Box-Zentrum der Kaskade 0, 15 m zum Licht hin
    const f0 = csm._anazhFit[0];
    const hinterInv = f0.basisInv.clone().invert();
    const p3 = new T.Vector3(f0.x0 + f0.W / 2, f0.y0 + f0.H / 2, f0.zt - 15).applyMatrix4(hinterInv);
    const hinter = kasten(p3.x, p3.y, p3.z, 3);
    hinter.userData._sichtHaupt = false;
    map.set("__w7:hinter", hinter);
    // W4 — EINE Region, zwei Werfer: einer in der nahen Box, einer 2 km fern. Die Region wirft (ihre Hülle schneidet die
    // Box), der ferne Werfer ruht im Pass — die Wahl gilt je Werfer, nicht je Region.
    const zwei = kasten(p3.x, p3.y, p3.z, 2);
    const weit = new T.Mesh(new T.BoxGeometry(4, 4, 4), new T.MeshBasicMaterial());
    weit.position.set(pm.x + 2000, pm.y, pm.z);
    weit.castShadow = true;
    zwei.add(weit);
    zwei.updateMatrixWorld(true);
    zwei.userData._sichtHaupt = true;
    map.set("__w7:zwei", zwei);
    const passeAlt = (kamera, nach) => {
        // DIE ALTE REGEL (bis V18.528): jeder Pass liest das Haupt-Urteil
        for (const bg of map.values()) if (bg.userData._sichtHaupt !== undefined) bg.visible = bg.userData._sichtHaupt;
        void kamera;
        void nach;
    };
    const pruefe = (pass) => {
        const w = {
            falsch: 0,
            kindFalsch: 0,
            sichtbar: [],
            fernWirft: false,
            hinterWirft: false,
            zweiWirft: false,
            weitWirft: false,
            direkt: false,
            zurueck: true,
        };
        for (let i = 0; i < csm.lights.length; i++) {
            const fr = frustumVon(i);
            const kam = csm.lights[i].shadow.camera;
            pass(kam, false);
            let n = 0;
            for (const bg of map.values()) {
                if (!bg.visible) continue;
                n++;
                const h = r._bundleWerferHuelle(bg);
                if (!h || !fr.intersectsBox(h)) w.falsch++;
            }
            w.sichtbar.push(n);
            // je Werfer: jedes sichtbare werfende Blatt-Mesh einer sichtbaren Region liegt mit seiner Box im Frustum
            for (const bg of map.values()) {
                if (!bg.visible) continue;
                bg.traverseVisible((o) => {
                    if (o === bg || !o.isMesh || !o.castShadow || o.children.length > 0) return;
                    const b = o.userData._werferKind;
                    if (!b || !fr.intersectsBox(b)) w.kindFalsch++;
                });
            }
            if (fern.visible) w.fernWirft = true;
            if (i === 0 && hinter.visible) w.hinterWirft = true;
            if (i === 0) {
                w.zweiWirft = zwei.visible;
                w.weitWirft = zwei.visible && weit.visible;
                // das Bundle zeichnet im Schatten-Pass direkt und frisch (nicht `static`: kein Uniform-Refresh hieße die
                // Kaskaden-Kamera seiner letzten Aufnahme)
                w.direkt = zwei.isBundleGroup !== true && zwei.static === false;
            }
            pass(kam, true);
            for (const bg of map.values()) {
                if (bg.userData._sichtHaupt !== undefined && bg.visible !== bg.userData._sichtHaupt) w.zurueck = false;
                if (bg.isBundleGroup !== true || bg.static !== true) w.zurueck = false;
            }
            if (weit.visible !== true) w.zurueck = false;
        }
        return w;
    };
    try {
        aus.haupt = [...map.values()].filter((bg) => bg.userData._sichtHaupt === true).length;
        aus.bundles = map.size;
        aus.w = pruefe((k, nach) => r._passSicht(k, nach));
        if (selbsttest) aus.s1 = pruefe(passeAlt);
    } finally {
        for (const [k, bg] of [
            ["__w7:fern", fern],
            ["__w7:hinter", hinter],
            ["__w7:zwei", zwei],
        ]) {
            map.delete(k);
            st.scene.remove(bg);
        }
    }

    // ── Z1: die Karten-Ziele — der Knoten baut sein Ziel durch die Hülle (wie r184 setupRenderTarget) ──
    {
        const rt = new T.RenderTarget(8, 8);
        const dt = new T.DepthTexture(8, 8);
        rt.depthTexture = dt;
        const knoten = { setupRenderTarget: () => ({ shadowMap: rt, depthTexture: dt }) };
        r._kaskadenZiele({ _shadowNodes: [knoten] });
        const z = knoten.setupRenderTarget({}, {});
        aus.z1 = {
            farbe: z.shadowMap.texture.format === T.RedFormat,
            tiefe: z.depthTexture.type === T.UnsignedShortType,
            namen: rt.texture.name === "kaskade0:farbe" && dt.name === "kaskade0:tiefe",
            // die echte CSM: jeder Kaskaden-Knoten trägt die Hülle seit der Geburt
            echt:
                csm._shadowNodes.length > 0 &&
                csm._shadowNodes.every((sn) => Object.prototype.hasOwnProperty.call(sn, "setupRenderTarget")),
        };
    }

    // ── H1: die Hülle steht vor der Boden-Entlassung (sonst rechnet jede spätere Hülle aus leeren Arrays NaN) ──
    {
        const boden = () => {
            const g = new T.BufferGeometry();
            g.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 10, 5, 0, 0, 5, 10], 3));
            g.setIndex([0, 1, 2]);
            const m = new T.Mesh(g, new T.MeshBasicMaterial());
            m.castShadow = true;
            m.updateMatrixWorld(true);
            return m;
        };
        const huelle = (m) => {
            const b = new T.Box3();
            r._werferBoxDazu(b, m);
            return b;
        };
        const m = boden();
        r._chunkBodenNulle(m.geometry);
        const b = huelle(m);
        aus.h1 = {
            leer: m.geometry.attributes.position.array.length === 0,
            box: Number.isFinite(b.min.x) && Number.isFinite(b.max.y) && b.max.y === 5,
        };
        if (selbsttest) {
            // die ALTE Entlassung: nur leeren, die Hülle kommt später — sie muss NaN tragen
            const alt = boden();
            for (const k in alt.geometry.attributes) {
                const a = alt.geometry.attributes[k];
                a.array = new a.array.constructor(0);
            }
            const ba = huelle(alt);
            aus.s2 = { nan: Number.isNaN(ba.min.x) || Number.isNaN(ba.max.y) };
        }
    }

    // ── A1: Absenz + Konsum ──
    aus.a1 = {
        inselnFrei: !/isInFrustum\(/.test(window.__codeOf(r._loopFrustumCulling)),
        tiereFrei: !/visible\s*=\s*inFrustum/.test(window.__codeOf(r.updateCreatures)),
        eigeneMethode:
            Object.prototype.hasOwnProperty.call(csm, "updateBefore") &&
            Object.prototype.hasOwnProperty.call(csm, "_init"),
        // kein Umbau nach der Geburt: die Karten-Ziele fallen nie im laufenden Frame (Bind-Gruppen der Bundles)
        keinUmbau: !/\.dispose\(\)|_kaskadenKarten|_kaskadenZiele/.test(window.__codeOf(r._kaskadenPassen)),
    };
    {
        const roh = r._kaskadenPassen;
        let n = 0;
        r._kaskadenPassen = function (...a) {
            n++;
            return roh.apply(this, a);
        };
        const lp = csm.lights[0].position.clone();
        let nAddon = -1,
            nSchatten = -1;
        try {
            // das Addon-updateBefore ist stumm (es lief NACH den Karten), der Haken des Haupt-Passes stellt die Kaskaden
            csm.updateBefore({});
            nAddon = n;
            st.scene.onBeforeRender(st.renderer, st.scene, csm.lights[0].shadow.camera, null);
            st.scene.onAfterRender(st.renderer, st.scene, csm.lights[0].shadow.camera, null);
            nSchatten = n;
            st.scene.onBeforeRender(st.renderer, st.scene, cam, null);
            st.scene.onAfterRender(st.renderer, st.scene, cam, null);
        } finally {
            delete r._kaskadenPassen;
        }
        aus.a1.konsum = nAddon === 0 && nSchatten === 0 && n === 1;
        aus.a1.addonStumm = nAddon === 0 && lp.equals(csm.lights[0].position);
        aus.a1.zaehl = { addon: nAddon, schatten: nSchatten, haupt: n };
    }
    return aus;
}

(async () => {
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Die Welt plateau-pumpen (der Null-Renderer hat keinen Loop): Chunks > 20 und 40 Takte stabil.
        const welt = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const st = r.state;
            let last = -1,
                stabil = 0,
                takte = 0;
            while (takte < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                takte++;
                const n = st.voxelChunks ? st.voxelChunks.size : 0;
                if (n === last) stabil++;
                else {
                    stabil = 0;
                    last = n;
                }
                if (n > 20 && stabil > 40) break;
                if (takte % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            return { takte, chunks: last, bundles: st._regionBundles ? st._regionBundles.size : 0 };
        });
        if (!(welt.bundles >= 4)) throw new Error(`Welt ohne Region-Bundles (${JSON.stringify(welt)})`);
        const a = await page.evaluate(probe, SELBSTTEST);
        if (a.fehler) throw new Error(a.fehler);
        console.log(
            `=== Werfer-Wand: Karten ${a.karten.join("/")} · ${a.bundles} Bundles, Haupt-Urteil ${a.haupt}, Kaskaden-Pässe ${a.w.sichtbar.join("/")} ===`
        );
        check(
            "K1 die Box deckt die Scheibe (Mittag)",
            a.k1Mittag.n > 0 && a.k1Mittag.schlecht === 0,
            `${a.k1Mittag.n - a.k1Mittag.schlecht}/${a.k1Mittag.n} Empfänger-Punkte`
        );
        check(
            "K1 die Box deckt die Scheibe (Abend)",
            a.k1Abend.n > 0 && a.k1Abend.schlecht === 0,
            `${a.k1Abend.n - a.k1Abend.schlecht}/${a.k1Abend.n} Empfänger-Punkte`
        );
        check(
            "K2 die Box ist eng (≤ 60 % des Addon-Quadrats)",
            a.k2.every((k) => k.anteil <= 0.6),
            a.k2.map((k, i) => `k${i} ${k.W}×${k.H} m vs ${k.addon}² (${Math.round(k.anteil * 100)} %)`).join(" · ")
        );
        check(
            "K3 Zentrum auf dem Texel-Raster",
            a.k3.every(Boolean) && a.k3gehen.every(Boolean),
            `gehen 0,37 m: ${a.k3gehen}`
        );
        check(
            "K4 außerhalb des Takts: still → keine, 40° gedreht → beide rendern",
            a.k4still.every((x) => !x) && a.k4dreh.every(Boolean),
            `still ${a.k4still} · gedreht ${a.k4dreh}`
        );
        check(
            "K5 die Karte folgt der Texel-Dichte (kleinste Zweierpotenz)",
            a.k5.every((k) => k.kleinste),
            a.k5.map((k, i) => `k${i} ${k.n} → ${k.texel} m (Soll ${k.soll})`).join(" · ")
        );
        check("W1 jeder Kaskaden-Pass wirft nur Bundles in seiner Box", a.w.falsch === 0, `${a.w.falsch} falsch`);
        check("W1 … und darin nur Werfer in seiner Box", a.w.kindFalsch === 0, `${a.w.kindFalsch} falsch`);
        check("W1 nach dem Schatten-Pass: Haupt-Urteil, jeder Werfer zurück, Bundles wieder Bundles", a.w.zurueck);
        check("W2 der Werfer 2 km vor der Kamera wirft in keine Kaskade", a.w.fernWirft === false);
        check("W3 der Werfer hinter dem Blick wirft in die nahe Kaskade", a.w.hinterWirft === true);
        check(
            "W4 die Region wirft, ihr Werfer 2 km fern ruht (Wahl je Werfer, Bundle zeichnet direkt)",
            a.w.zweiWirft === true && a.w.weitWirft === false && a.w.direkt === true,
            `Region ${a.w.zweiWirft} · fern ${a.w.weitWirft} · direkt ${a.w.direkt}`
        );
        check(
            "Z1 Karten-Ziele: Farbe r8 · Tiefe 16 bit · benannt",
            a.z1.farbe && a.z1.tiefe && a.z1.namen && a.z1.echt,
            JSON.stringify(a.z1)
        );
        check("A1 kein Frustum-Schreiber für Inseln", a.a1.inselnFrei);
        check("A1 kein Frustum-Schreiber für Mesh-Tiere", a.a1.tiereFrei);
        check(
            "A1 die CSM fährt Geburt und Fit des Hosts — der Fit im Haken des Haupt-Passes, vor jeder Karte (Konsum)",
            a.a1.eigeneMethode && a.a1.konsum && a.a1.addonStumm,
            JSON.stringify(a.a1.zaehl)
        );
        check("A1 kein Karten-Umbau im laufenden Frame", a.a1.keinUmbau);
        check(
            "H1 die Boden-Entlassung lässt die Hülle stehen (Box aus den Positionen vor dem Leeren)",
            a.h1.leer && a.h1.box,
            JSON.stringify(a.h1)
        );
        if (SELBSTTEST) {
            const s = a.s1;
            check(
                "S1 Selbsttest: die alte Regel macht W1/W2/W3/W4 rot",
                s.falsch > 0 &&
                    s.kindFalsch > 0 &&
                    s.fernWirft === true &&
                    s.hinterWirft === false &&
                    s.weitWirft === true,
                `falsch ${s.falsch}/${s.kindFalsch} · fern wirft ${s.fernWirft} · hinter wirft ${s.hinterWirft} · weit wirft ${s.weitWirft}`
            );
            check(
                "S2 Selbsttest: die alte Entlassung (nur leeren) hinterlässt eine NaN-Hülle",
                a.s2 && a.s2.nan === true
            );
        }
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN schatten-werfer" : "ROT schatten-werfer");
    process.exit(ok ? 0 : 1);
})();
