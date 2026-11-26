// Kandidat für den Leser von erleben.bild.auge#5 (bewegungs-feld): Zensus bewegter Dinge (K8-Gesetz, gate:kamera-leib:echt) und
// Geister-Fläche der zeitlichen Auflösung gegen dieselbe Welt nach 32 ruhenden Bildern. Aufruf: werkbank /eval mit
// (o) => {yaw, halten, liveMs, refBilder, png, maxM}; Messort stadt-voll, Third.
// Mess-Funktion in der Seite: Zensus der Bewegten (a) und Geister-Fläche (b) bei fester Kamera.
async (o) => {
    const r = anazhRealm, st = r.state, T = THREE, R = st.renderer;
    const schlaf = (ms) => new Promise((z) => setTimeout(z, ms));
    const tn = st.traaNode;
    const oben = R.coordinateSystem === T.WebGPUCoordinateSystem; // WebGPU liest Zeilen oben zuerst
    const aus = { o };
    if (!tn) return { fehler: "kein traaNode" };
    if (o.yaw != null) st.yaw = o.yaw;
    if (o.pitch != null) st.pitch = o.pitch;
    const H = window.__gehalten || (window.__gehalten = new Set());
    H.clear();
    if (typeof window.__halten !== "function") return { fehler: "kein __halten" };
    window.__halten(o.halten ? ["bewohner", "wagen", "tiere", "leib"] : []);
    if (!o.halten) H.clear();
    // LIVE: der echte Loop (rAF) o.liveMs lang
    window.__loop(1);
    await schlaf(o.liveMs || 6000);
    window.__loop();
    aus.bewohner = (() => { try { const b = r._bewohnerListe && r._bewohnerListe(); return b ? (b.length ?? b.size ?? Object.keys(b).length) : null; } catch (e) { return String(e).slice(0, 80); } })();
    const rend = R;
    const k = { maxM: o.maxM || 120, minPx: 1, minR: 3, saum: 2 };
    const bild = async () => { for (let i = 0, g0 = r._gpuLeine.gerendert; i < 20 && r._gpuLeine.gerendert === g0; i++) { await schlaf(16); R._nodes.nodeFrame.update(); r._gameLoopTick(performance.now()); } };
    const kopf = (o3) => { const n = []; for (let x = o3; x && n.length < 4; x = x.parent) if (x.name) n.push(x.name); return n.join("<") || o3.type; };
    const klasse = (s) => (/leib|spieler|player/i.test(s) ? "leib" : /bewohner|mensch|buerger|haut|koerper/i.test(s) ? "mensch" : /wagen|fahr|karren|kutsche|rad|achse|verkehr|zug|walze/i.test(s) ? "wagen" : /kreatur|tier|fauna|vogel|wolf|hirsch|fisch|herde|schwarm/i.test(s) ? "kreatur" : "andere");
    const sichtbar = (o3) => { for (let x = o3; x; x = x.parent) if (x.visible === false) return false; return true; };
    const durch = (x) => [].concat(x.material || []).some((m) => m && m.transparent === true);
    const [v, mi] = [new T.Vector3(), new T.Matrix4()];
    const imLeib = new Set();
    st.playerMesh.traverse((n) => imLeib.add(n));
    // je Ding seine Punkte: die Mitte (Instanz: unter ihrer Matrix) und je Knochen der Haut sein Gelenk; dazu sein Radius
    const schnapp = () => {
        const L = new Map();
        st.scene.updateMatrixWorld();
        st.scene.traverse((x) => {
            // der Zeichner einer Senke zeichnet ihre Instanzen (gezählt an der Senke)
            if (!x.isMesh || x.isInstanzZeichner || !x.geometry || !sichtbar(x)) return;
            const g = x.geometry;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const [c, rad] = g.boundingSphere ? [g.boundingSphere.center, g.boundingSphere.radius] : [new T.Vector3(), 0];
            const A = x.instanceMatrix && x.instanceMatrix.array;
            const n = A ? Math.min(x.count | 0, A.length / 16) : 1;
            if (!(n > 0)) return;
            const knochen = x.isSkinnedMesh && x.skeleton ? x.skeleton.bones : [];
            const je = 1 + knochen.length;
            const [P, R] = [new Float64Array(n * je * 3), new Float64Array(n)];
            for (let i = 0; i < n; i++) {
                mi.copy(x.matrixWorld);
                if (A) mi.multiply(new T.Matrix4().fromArray(A, i * 16));
                R[i] = rad * mi.getMaxScaleOnAxis();
                v.copy(c).applyMatrix4(mi);
                [P[i * je * 3], P[i * je * 3 + 1], P[i * je * 3 + 2]] = [v.x, v.y, v.z];
                for (let j = 0; j < knochen.length; j++) {
                    v.setFromMatrixPosition(knochen[j].matrixWorld);
                    [P[(i * je + 1 + j) * 3], P[(i * je + 1 + j) * 3 + 1], P[(i * je + 1 + j) * 3 + 2]] = [v.x, v.y, v.z];
                }
            }
            L.set(x, { P, R, n, je, name: (imLeib.has(x) ? "leib:" : "") + kopf(x), durch: durch(x) });
        });
        return L;
    };
    const halb = (q) => { const [s, e, f] = [q & 0x8000 ? -1 : 1, (q >> 10) & 31, q & 1023]; return e === 0 ? s * 6.103515625e-5 * (f / 1024) : e === 31 ? NaN : s * 2 ** (e - 15) * (1 + f / 1024); };
    // die Lage jedes Dings, wie das Bild sie zeichnet: am Stempel des Bilds (`_traaReprojektion`, nach Takt und Schatten, vor dem
    // Szenen-Pass) — ein Schreiber im halben Takt zieht zwischen zwei Bildern nicht, die Lage nach dem Takt nennte ihn bewegt
    const [U, knochen] = [AnazhRealm._bewegungUniformen ? AnazhRealm._bewegungUniformen() : null, AnazhRealm._bewegungKnochen];
    const proto = Object.getPrototypeOf(r)._traaReprojektion;
    let [lagen, schmuggel, nr] = [[], false, 0];
    r._traaReprojektion = function () {
        proto.call(this);
        if (schmuggel && U) U.bild.value = -7;
        lagen.push({ bild: ++nr, S: schnapp() });
        if (lagen.length > 3) lagen.shift();
    };
    const zensus = async () => {
        lagen = [];
        await bild();
        await bild();
        await bild();
        if (lagen.length < 3 || lagen[2].bild !== lagen[1].bild + 1) throw new Error("zwei Bilder in Folge fehlen");
        const [Sp, S0, S1] = [lagen[0].S, lagen[1].S, lagen[2].S];
        const rt = st.scenePass && st.scenePass.renderTarget;
        const [W, H] = rt ? [rt.width, rt.height] : [1, 1];
        const ib = rt ? rt.textures.findIndex((x) => x.name === "bewegung") : -1;
        let feld = null;
        if (ib >= 0) {
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H, ib);
            const kan = 2, B = px.BYTES_PER_ELEMENT;
            feld = { px, kan, zeile: px.length > W * H * kan ? (Math.ceil((W * kan * B) / 256) * 256) / B : W * kan, f: px.constructor.name === "Uint16Array" ? halb : (q) => q };
        }
        const oben = rend.coordinateSystem === T.WebGPUCoordinateSystem;
        const kam = st.camera;
        const pv = new T.Matrix4().multiplyMatrices(kam.projectionMatrix, kam.matrixWorldInverse);
        const fy = kam.projectionMatrix.elements[5]; // cot(fov/2): der Radius eines Dings im Abstand d deckt R · fy / d · H/2 Pixel
        const lies = (px, py) => {
            const j = (oben ? H - 1 - py : py) * feld.zeile + px * feld.kan;
            return [feld.f(feld.px[j]) * 0.5 * W, feld.f(feld.px[j + 1]) * 0.5 * H];
        };
        const z = { ziel: ib >= 0, W, H, klassen: {}, beispiele: [] };
        const [n0, n1] = [new T.Vector3(), new T.Vector3()];
        for (const [x, b] of S1) {
            const a = S0.get(x);
            if (!a || a.n !== b.n || a.je !== b.je) continue;
            const kl = b.durch ? "durchsichtig" : klasse(b.name);
            for (let i = 0; i < b.n; i++) {
                // der Punkt des Dings, der am weitesten zieht (die Mitte, ein Gelenk)
                let w = null;
                for (let j = 0; j < b.je; j++) {
                    const q = (i * b.je + j) * 3;
                    n1.set(b.P[q], b.P[q + 1], b.P[q + 2]).applyMatrix4(pv);
                    if (Math.abs(n1.z) > 1 || Math.abs(n1.x) > 0.97 || Math.abs(n1.y) > 0.97) continue;
                    n0.set(a.P[q], a.P[q + 1], a.P[q + 2]).applyMatrix4(pv);
                    const [ex, ey] = [(n1.x - n0.x) * 0.5 * W, (n1.y - n0.y) * 0.5 * H];
                    if (!w || Math.hypot(ex, ey) > w.lang) w = { lang: Math.hypot(ex, ey), ex, ey, px: Math.floor((n1.x * 0.5 + 0.5) * W), py: Math.floor((n1.y * 0.5 + 0.5) * H), q };
                }
                if (!w || w.lang < k.minPx) continue;
                const d = Math.hypot(b.P[w.q] - kam.position.x, b.P[w.q + 1] - kam.position.y, b.P[w.q + 2] - kam.position.z);
                if (d > k.maxM || (b.R[i] * fy) / Math.max(d, 1e-3) * 0.5 * H < k.minR) continue;
                if (w.lang > W / 8) { z.sprung = (z.sprung | 0) + 1; continue; } // ein Sprung (ein Platz nimmt ein anderes Ding) ist keine Bewegung
                let [ok, gem] = [false, null];
                const sw = Math.min(12, Math.max(k.saum, Math.ceil(w.lang)));
                for (let dy = -sw; feld && dy <= sw && !ok; dy++)
                    for (let dx = -sw; dx <= sw && !ok; dx++) {
                        const [mx, my] = lies(Math.min(W - 1, Math.max(0, w.px + dx)), Math.min(H - 1, Math.max(0, w.py + dy)));
                        const proj = (mx * w.ex + my * w.ey) / (w.lang * w.lang);
                        ok = proj > 2 / 3 && proj < 1.5;
                        if (ok || !gem) gem = [+mx.toFixed(2), +my.toFixed(2)];
                    }
                const K = (z.klassen[kl] ||= { bewegt: 0, getragen: 0 });
                K.bewegt++;
                K.getragen += ok;
                if (ok) (z.verh ||= []).push(+(Math.hypot(gem[0], gem[1]) / w.lang).toFixed(2));
                if (!ok && kl !== "durchsichtig" && z.beispiele.length < 16) z.beispiele.push({ kl, name: b.name.slice(0, 48), i, d: +d.toFixed(1), soll: [+w.ex.toFixed(2), +w.ey.toFixed(2)], gem, fenster: (() => { if (!feld) return null; let [nz, sx, sy, best] = [0, 0, 0, null]; for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) { const [mx, my] = lies(Math.min(W - 1, Math.max(0, w.px + dx)), Math.min(H - 1, Math.max(0, w.py + dy))); if (Math.hypot(mx, my) > 0.5) { nz++; sx += mx; sy += my; if (!best || Math.hypot(mx, my) > best[2]) best = [dx, dy, +Math.hypot(mx, my).toFixed(2), +mx.toFixed(2), +my.toFixed(2)]; } } return { nz, m: nz ? [+(sx / nz).toFixed(2), +(sy / nz).toFixed(2)] : null, best }; })(), px: [w.px, w.py], stempel: (() => { try { const B = AnazhRealm.__bewegungBild; const zz = x.__arenaZ, ar = x.__arena; const va = ar && zz && ar.__instanzQuelle.instanceMatrixVor ? ar.__instanzQuelle.instanceMatrixVor.array[(zz.erst + i) * 16 + 3] : null; const vs = x.__bewegungI ? x.__bewegungI.vor.array[i * 16 + 3] : null; return { B, arena: va, senke: vs, welt: x.__bewegung ? x.__bewegung.stempel : null, haut: x.skeleton ? x.skeleton.__bewegungBild : null, zBew: zz ? zz.bewBild : null, inst: !!x.instanceMatrix, ar: !!ar }; } catch (e) { return String(e).slice(0, 60); } })(), davor: (() => { const p = Sp.get(x); if (!p || p.n !== b.n) return null; const q = w.q; n1.set(a.P[q], a.P[q + 1], a.P[q + 2]).applyMatrix4(pv); n0.set(p.P[q], p.P[q + 1], p.P[q + 2]).applyMatrix4(pv); return [+((n1.x - n0.x) * 0.5 * W).toFixed(2), +((n1.y - n0.y) * 0.5 * H).toFixed(2)]; })() });
            }
        }
        return z;
    };
    const zz = await zensus();
    for (let k = 1; k < (o.halten ? 1 : 5); k++) {
        window.__loop(1); await schlaf(1500); window.__loop();
        const z2 = await zensus();
        for (const [kl, K] of Object.entries(z2.klassen)) { const Z = (zz.klassen[kl] ||= { bewegt: 0, getragen: 0 }); Z.bewegt += K.bewegt; Z.getragen += K.getragen; }
        (zz.verh ||= []).push(...(z2.verh || []));
        for (const e of z2.beispiele) if (zz.beispiele.length < 16) zz.beispiele.push(e);
    }
    delete r._traaReprojektion;
    const [bw, gt] = Object.entries(zz.klassen).filter(([kl]) => kl !== "durchsichtig").reduce(([p, q], [, K]) => [p + K.bewegt, q + K.getragen], [0, 0]);
    aus.zensus = { ...zz, bewegt: bw, getragen: gt, anteilOhne: bw ? +((bw - gt) / bw).toFixed(4) : null };
    const kam = st.camera;
    aus.kamera = { p: kam.position.toArray().map((v) => +v.toFixed(2)), yaw: st.yaw };
    // DIE GEISTER-FLÄCHE: A = Ausgabe der zeitlichen Auflösung nach dem Lauf, B = dieselbe Welt (kein Takt) nach Neubeginn und 32 Bildern
    const lies = async () => {
        const z = tn._historyRenderTarget;
        const w = z.width, h = z.height;
        const px = await R.readRenderTargetPixelsAsync(z, 0, 0, w, h, 0);
        const kan = px.length / (w * h) | 0;
        const f = px.constructor.name === "Uint16Array" ? halb : (q) => q;
        const L = new Float32Array(w * h * 3);
        for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) { const q = Math.max(0, f(px[i * kan + c])); L[i * 3 + c] = q / (1 + q); }
        return { L, w, h };
    };
    const A = await lies();
    st._traaR.neu = true;
    for (let i = 0; i < (o.refBilder || 32); i++) window.__loopBild();
    const B = await lies();
    const schw = [0.02, 0.04, 0.08];
    const n = A.w * A.h;
    const zahl = schw.map(() => 0);
    const maske = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        let m = 0;
        for (let c = 0; c < 3; c++) m = Math.max(m, Math.abs(A.L[i * 3 + c] - B.L[i * 3 + c]));
        for (let s = 0; s < schw.length; s++) if (m > schw[s]) zahl[s]++;
        maske[i] = m > 0.04 ? 255 : 0;
    }
    aus.geister = { w: A.w, h: A.h, schwellen: schw, anteil: zahl.map((z) => +(z / n * 100).toFixed(3)) };
    // die Bilder (halbe Größe, Zeilen oben zuerst)
    if (o.png) {
        const k = 2, bw = A.w / k | 0, bh = A.h / k | 0;
        const bildU8 = (Q, rot) => {
            const u = new Uint8Array(bw * bh * 4);
            for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
                const sy = oben ? y * k : A.h - 1 - y * k, i = sy * A.w + x * k, j = (y * bw + x) * 4;
                for (let c = 0; c < 3; c++) u[j + c] = Math.round(255 * Math.pow(Math.min(1, Q.L[i * 3 + c] * 1.6), 1 / 2.2));
                if (rot && maske[i]) { u[j] = 255; u[j + 1] >>= 2; u[j + 2] >>= 2; }
            }
            return u;
        };
        aus.png = { a: window.__png(bildU8(A, false), bw, bh), b: window.__png(bildU8(B, false), bw, bh), maske: window.__png(bildU8(A, true), bw, bh) };
    }
    H.clear();
    return aus;
}
