// SPIKE gesetz-strahl (15.10., Entscheidungs-Spike, kein Bau): ein Strahl je Pixel in 1/4 Auflösung gegen die HÖHE des
// Gelände-Gesetzes — die Wasser-Spiegelung mit Gelände im Spiegel (und derselbe March für die Himmels-Sicht).
// Seiten-Kontext: Rumpf für `werkbank eval` (r = Welt, T = THREE); legt `window.__strahl` an.
//   __strahl.backen({ cx, cz, n, kante })       die Höhen-Textur aus dem EINEN Gesetz (_terrainMacroSurfaceY + _bodenFarbeAt)
//   __strahl.an({ schritte, modus, quelle, teil, k })   der Probe-Pass vor jedem _loopRender (modus voll|maske, quelle
//                                                textur|funktion — funktion = Kosten-Äquivalent: k Rausch-Rufe je Schritt)
//   __strahl.allein(n)                           die GPU-Zeit des Passes allein (n Draws, onSubmittedWorkDone)
//   __strahl.spiegel(an)                         das Wasser liest den Pass (Tausch von _wasserBlick, Stoff neu)
//   __strahl.ab()                                alles restlos weg
const TSL = T.TSL;
const st = r.state;
const rend = st.renderer;
const S = window.__strahl || (window.__strahl = {});

S.backen = async (k) => {
    const n = k.n || 512;
    const kante = k.kante || 2048;
    const s = kante / n;
    const x0 = k.cx - kante / 2;
    const z0 = k.cz - kante / 2;
    const wl = k.wl;
    const t0 = performance.now();
    const H = new Float32Array(n * n);
    const F = new Float32Array(n * n * 3);
    const f = [0, 0, 0];
    for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
            const x = x0 + (i + 0.5) * s;
            const z = z0 + (j + 0.5) * s;
            // `mesh`: die Höhe, die der Chunk baut (Gesetz + das Becken der Hydrosphäre — die 2D-Höhe trägt den Seegrund
            // NICHT: am See 1816/−6168 Gesetz 1,52 m, Mesh −2,5 m, Spiegel 0,93 m)
            const hm = k.quelle === "mesh" ? r._voxelSurfaceY(x, z) : null;
            const h = Number.isFinite(hm) ? hm : r._terrainMacroSurfaceY(x, z, true);
            H[j * n + i] = h;
            r._bodenFarbeAt(x, h, z, f, s);
            F.set(f, (j * n + i) * 3);
        }
    // DIE KRONEN (`kronen`): der Wald ist auch eine Funktion — die stehenden Darts des Wald-Gesetzes (`_forestCellDarts` +
    // `_forestDartSteht` + `_wildnisTraegt`, dieselbe Wahl wie der Pflanz-Gang) als Kronen-Ellipsoid über ihrem Boden
    // (Krone T m, Mitte 1,6·T über dem Fuß — eine Spike-Näherung der Gestalt), Laub-Albedo dunkelgrün
    let kronen = 0;
    if (k.kronen) {
        const C = r.constructor.FOREST.cell;
        const sd = r._forestSeedInt();
        const cd = (gx, gz) => r._forestCellDarts(gx, gz, sd);
        for (let gx = Math.floor(x0 / C); gx <= Math.floor((x0 + kante) / C); gx++)
            for (let gz = Math.floor(z0 / C); gz <= Math.floor((z0 + kante) / C); gz++)
                for (const d of cd(gx, gz)) {
                    if (!r._forestDartSteht(d, gx, gz, cd) || !r._wildnisTraegt(d.x, d.z)) continue;
                    const T = d.T;
                    const mitte = (Number.isFinite(d.surfaceY) ? d.surfaceY : r._terrainMacroSurfaceY(d.x, d.z)) + 1.6 * T;
                    const i0 = Math.floor((d.x - T - x0) / s),
                        i1 = Math.ceil((d.x + T - x0) / s);
                    const j0 = Math.floor((d.z - T - z0) / s),
                        j1 = Math.ceil((d.z + T - z0) / s);
                    for (let j = Math.max(0, j0); j <= Math.min(n - 1, j1); j++)
                        for (let i = Math.max(0, i0); i <= Math.min(n - 1, i1); i++) {
                            const dx = x0 + (i + 0.5) * s - d.x,
                                dz = z0 + (j + 0.5) * s - d.z;
                            const q = (dx * dx + dz * dz) / (T * T);
                            if (q >= 1) continue;
                            const oben = mitte + T * Math.sqrt(1 - q);
                            if (oben > H[j * n + i]) {
                                H[j * n + i] = oben;
                                F.set([0.035, 0.07, 0.022], (j * n + i) * 3);
                            }
                        }
                    kronen++;
                }
    }
    const tGesetz = performance.now() - t0;
    // die Sonne der Welt (das Richt-Licht): die Schattierung je Texel relativ zum flachen Boden — der Wasser-Stoff
    // multipliziert mit seiner Einstrahlung (uIrr), dieselbe wie sein Körper
    const dl = st.directionalLight;
    const L = new T.Vector3(0, 1, 0);
    if (dl) L.copy(dl.position).sub(dl.target ? dl.target.position : new T.Vector3()).normalize();
    const Ly = Math.max(0.2, L.y);
    const D = new Uint16Array(n * n * 4);
    const hf = T.DataUtils.toHalfFloat;
    let hMax = -1e9;
    for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
            const h = H[j * n + i];
            const hx = (H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)]) / (2 * s);
            const hz = (H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i]) / (2 * s);
            const nl = Math.hypot(hx, 1, hz);
            const ndl = Math.max(0, (-hx * L.x + L.y - hz * L.z) / nl);
            const rel = Math.min(2, 0.3 + (0.7 * ndl) / Ly);
            const o = (j * n + i) * 4;
            D[o] = hf(F[(j * n + i) * 3] * rel);
            D[o + 1] = hf(F[(j * n + i) * 3 + 1] * rel);
            D[o + 2] = hf(F[(j * n + i) * 3 + 2] * rel);
            D[o + 3] = hf(h - wl);
            hMax = Math.max(hMax, h - wl);
        }
    if (S.tex) S.tex.dispose();
    const tex = new T.DataTexture(D, n, n, T.RGBAFormat, T.HalfFloatType);
    tex.name = "spike-strahl-hoehe";
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    tex.wrapS = tex.wrapT = T.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    S.tex = tex;
    S.feld = { cx: k.cx, cz: k.cz, n, kante, wl, hMax, H };
    return { n, kante, kronen, texelM: s, gesetzMs: +tGesetz.toFixed(0), jeHoeheUs: +((tGesetz * 1000) / (n * n)).toFixed(2), hMax: +hMax.toFixed(1) };
};

// Wie viele Rausch-Rufe kostet EINE Höhe des Gesetzes? (das Kosten-Äquivalent der vollen Funktion im Shader)
S.rauschZahl = (k) => {
    const L = r._gelaende();
    const N = L.noise;
    const alt = N.noise2D;
    let z = 0;
    N.noise2D = function (a, b) {
        z++;
        return alt.call(this, a, b);
    };
    let m = 0;
    const werte = [];
    try {
        for (let i = 0; i < (k.n || 400); i++) {
            const x = k.cx + (Math.random() - 0.5) * 2000;
            const zz = k.cz + (Math.random() - 0.5) * 2000;
            z = 0;
            r._terrainMacroSurfaceY(x, zz, true);
            werte.push(z);
            m++;
        }
    } finally {
        N.noise2D = alt;
    }
    werte.sort((a, b) => a - b);
    return { proben: m, median: werte[werte.length >> 1], p90: werte[Math.floor(werte.length * 0.9)], max: werte[werte.length - 1] };
};

S.an = async (k) => {
    if (S.zustand && !k.ohneHaken) S.ab();
    const { Fn, Loop, If, Break, float, vec2, vec3, vec4, uniform, texture, screenUV, max, min, clamp, normalize, abs, fract, dot, smoothstep, mx_noise_float, int } = TSL;
    const db = rend.getDrawingBufferSize(new T.Vector2());
    const teil = k.teil || 4;
    const w = Math.round(db.x / teil);
    const h = Math.round(db.y / teil);
    // das Ziel bleibt über Varianten derselben Größe (der Wasser-Stoff liest seine Textur), fällt erst mit S.weg()
    if (S.rt && (S.rt.width !== w || S.rt.height !== h)) S.rt.setSize(w, h);
    const rt = S.rt || (S.rt = new T.RenderTarget(w, h, { depthBuffer: false, type: T.HalfFloatType }));
    rt.texture.name = "spike-strahl";
    rt.texture.minFilter = rt.texture.magFilter = T.LinearFilter;
    const F = S.feld;
    const U = {
        invVP: uniform(new T.Matrix4()),
        cam: uniform(new T.Vector3()),
        wl: uniform(F.wl),
        mitte: uniform(new T.Vector2(F.cx, F.cz)),
        kante: uniform(F.kante),
        hMax: uniform(F.hMax + 2),
        bild: uniform(0),
    };
    const N = k.schritte || 16;
    const voll = k.modus !== "maske";
    const funk = k.quelle === "funktion";
    const kRausch = k.k || 12;
    // die Kosten-Kurve der Schritte: gegen die Rest-Höhe (Lipschitz, Hang ≤ 1) und mindestens ein wachsender Anteil
    // der Strecke — 16 Schritte erreichen ~0,5 km, 32 ~2,5 km
    const wachs = k.wachs != null ? k.wachs : N <= 16 ? 0.35 : 0.2;
    const fein = k.fein || 0; // Halbierungs-Schritte nach dem Treffer (je einen Abgriff)
    const hoeheAn = (xz) => {
        if (!funk) return texture(S.tex, xz.sub(U.mitte).div(U.kante).add(0.5)).level(0);
        // KOSTEN-ÄQUIVALENT der vollen Funktion: kRausch Rausch-Rufe (MaterialX-Perlin) je Höhe, Farbe flach
        let hh = float(0);
        for (let i = 0; i < kRausch; i++) {
            const f = 0.0003 * Math.pow(1.9, i % 9);
            hh = hh.add(mx_noise_float(xz.mul(f).add(vec2(i * 7.3, i * 3.1))).mul(40 / (1 + (i % 9))));
        }
        return vec4(0.12, 0.16, 0.08, hh.sub(5));
    };
    const luft = r._luftEnsure();
    r._ensureHydroSurfaceMaterial();
    const irr = st.hydroSurfaceUniforms.irr;
    const mat = new T.MeshBasicNodeMaterial();
    mat.name = "spike-strahl";
    mat.fog = false;
    // fragmentNode: die rohe Ausgabe (Alpha = Treffer; ein opaker colorNode setzte Alpha auf 1)
    mat.fragmentNode = Fn(() => {
        // der Boden der Messung: derselbe Pass ohne Arbeit (Ziel-Wechsel, Draw, Submit)
        if (k.modus === "leer") return vec4(0);
        const ndc = vec2(screenUV.x.mul(2.0).sub(1.0), float(1.0).sub(screenUV.y).mul(2.0).sub(1.0));
        const fern = U.invVP.mul(vec4(ndc, 1.0, 1.0));
        const dir = fern.xyz.div(fern.w).sub(U.cam).normalize().toVar();
        const aus = vec4(0).toVar();
        const P = U.cam.toVar();
        const R = dir.toVar();
        const geht = float(0).toVar();
        // der Wasser-Punkt: der Blick-Strahl trifft die Ebene des Sees (spike: EIN Spiegel-Niveau); dort spiegelt er
        If(dir.y.lessThan(-1e-4), () => {
            const tW = U.wl.sub(U.cam.y).div(dir.y);
            P.assign(U.cam.add(dir.mul(tW)));
            R.assign(vec3(dir.x, dir.y.negate(), dir.z));
            const h0 = hoeheAn(P.xz).w;
            If(h0.lessThan(0.0), () => geht.assign(1));
        });
        // voll = jedes Pixel marcht (die obere Schranke; trifft der Blick kein Wasser, steigt der Strahl von der Kamera —
        // der March der Himmels-Sicht); maske = nur Pixel, deren Blick das Wasser trifft
        if (voll)
            If(geht.lessThan(0.5), () => {
                P.assign(U.cam);
                R.assign(dir);
                geht.assign(1);
            });
        If(geht.greaterThan(0.5), () => {
            // Versatz je Pixel und Bild (interleaved gradient noise) — die Zeit-Auflösung glättet die Stufen
            const ign = fract(float(52.9829189).mul(fract(dot(screenUV.mul(vec2(w, h)).add(U.bild.mul(5.588238)), vec2(0.06711056, 0.00583715)))));
            // `ruhig`: ohne Versatz (fester Start, stabile Kanten statt Rauschen, das die Zeit-Auflösung nicht ausmittelt)
            const t = (k.ruhig ? float(1.25) : float(0.5).add(ign.mul(1.5))).toVar();
            const tVor = float(0).toVar();
            const gVor = float(1).toVar();
            const treffer = float(0).toVar();
            const farbe = vec3(0).toVar();
            const ta = float(0).toVar();
            const tb = float(0).toVar();
            Loop(N, () => {
                const p = P.add(R.mul(t));
                const rel = p.xz.sub(U.mitte).div(U.kante);
                If(abs(rel.x).greaterThan(0.5).or(abs(rel.y).greaterThan(0.5)), () => Break());
                const y = p.y.sub(U.wl);
                If(y.greaterThan(U.hMax).and(R.y.greaterThanEqual(0.0)), () => Break());
                const s = hoeheAn(p.xz);
                const g = y.sub(s.w);
                If(g.lessThan(0.0), () => {
                    // der Sekanten-Schnitt zwischen dem letzten freien und dem ersten tiefen Schritt (ohne weiteren Abgriff)
                    // `fein` Halbierungen zwischen frei (ta) und tief (tb), danach die Sekante im letzten Paar
                    ta.assign(tVor);
                    tb.assign(t);
                    const gA = gVor.toVar();
                    const gB = g.toVar();
                    for (let f = 0; f < fein; f++) {
                        const m = ta.add(tb).mul(0.5);
                        const pm = P.add(R.mul(m));
                        const gm = pm.y.sub(U.wl).sub(hoeheAn(pm.xz).w);
                        If(gm.lessThan(0.0), () => {
                            tb.assign(m);
                            gB.assign(gm);
                        }).Else(() => {
                            ta.assign(m);
                            gA.assign(gm);
                        });
                    }
                    const tT = ta.add(tb.sub(ta).mul(gA.div(gA.sub(gB))));
                    const q = vec3(P.add(R.mul(tT)));
                    // Strahlung: Albedo × die Einstrahlung des Wassers (uIrr, E/π), gedunstet von der EINEN Luft längs des
                    // gespiegelten Wegs (Wasser-Punkt → Treffer; das Auge → Wasser legt der Nebel des Wasser-Stoffs auf)
                    const strahl = hoeheAn(q.xz).xyz.mul(irr);
                    farbe.assign(TSL.mix(strahl, luft.farbe(P, q), luft.faktor(P, q)));
                    treffer.assign(float(1.0).sub(smoothstep(0.42, 0.5, max(abs(rel.x), abs(rel.y)))));
                    Break();
                });
                tVor.assign(t);
                gVor.assign(g);
                t.addAssign(max(g.mul(0.9), t.mul(wachs).add(1.5)));
            });
            aus.assign(vec4(farbe, treffer));
        });
        return aus;
    })();
    const szene = new T.Scene();
    szene.name = "spike-strahl";
    const kamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const flaeche = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
    flaeche.frustumCulled = false;
    flaeche.position.z = -0.5;
    szene.add(flaeche);
    // `mal`: dieselbe Fläche M-fach (Überzeichnung ohne Tiefe) — die GPU-Arbeit wächst M-fach, die CPU kaum: die Probe
    // wird GPU-gebunden, Zeit / M ist die GPU-Zeit EINES Passes
    for (let i = 1; i < (k.mal || 1); i++) {
        const m2 = new T.Mesh(flaeche.geometry, mat);
        m2.frustumCulled = false;
        m2.position.z = -0.5;
        szene.add(m2);
    }
    let bild = 0;
    const zeichne = () => {
        const cam = st.camera;
        cam.updateMatrixWorld();
        U.invVP.value.multiplyMatrices(cam.matrixWorld, cam.projectionMatrixInverse);
        U.cam.value.copy(cam.position);
        cam.getWorldPosition(U.cam.value);
        U.bild.value = bild++ % 64;
        const vor = rend.getRenderTarget();
        rend.setRenderTarget(rt);
        rend.render(szene, kamera);
        rend.setRenderTarget(vor);
    };
    if (k.ohneHaken) return { zeichne, weg: () => (mat.dispose(), flaeche.geometry.dispose()) };
    const eigen = Object.prototype.hasOwnProperty.call(r, "_loopRender");
    const altR = r._loopRender;
    r._loopRender = function (t) {
        if (!S.pause) zeichne();
        return altR.call(this, t);
    };
    S.zustand = {
        rt,
        mat,
        geo: flaeche.geometry,
        zeichne,
        weg: () => {
            if (eigen) r._loopRender = altR;
            else delete r._loopRender;
        },
        k: Object.assign({ w, h }, k),
    };
    zeichne();
    await rend.backend.device.queue.onSubmittedWorkDone();
    return { an: true, ziel: [w, h], schritte: N, modus: voll ? "voll" : "maske", quelle: funk ? "funktion(k=" + kRausch + ")" : "textur" };
};

S.allein = async (n) => {
    const Z = S.zustand;
    if (!Z) return { fehler: "kein Pass" };
    const q = rend.backend.device.queue;
    const lauf = async (m) => {
        await q.onSubmittedWorkDone();
        const t0 = performance.now();
        for (let i = 0; i < m; i++) Z.zeichne();
        await q.onSubmittedWorkDone();
        return (performance.now() - t0) / m;
    };
    await lauf(3);
    const w = [];
    for (let i = 0; i < 7; i++) w.push(await lauf(n || 24));
    w.sort((a, b) => a - b);
    // der leere Draw (derselbe Weg, Pass ohne Arbeit) als Boden: Ziel-Wechsel + Submit
    return { k: Z.k, alleinMs: +w[3].toFixed(3), werte: w.map((x) => +x.toFixed(3)) };
};

// DAS WASSER LIEST DEN PASS: _wasserBlick mit dem Spiegel des Gesetzes statt nur des Himmels (Kopie des Bausteins,
// EINE Zeile anders: himmel → mix(himmel, Gelände × Einstrahlung, Treffer))
S.spiegel = (an) => {
    const P = Object.getPrototypeOf(r);
    if (!an) {
        delete r._wasserBlick;
        return r._tiefenKnotenTausch();
    }
    r._wasserBlick = function (TSL, WG, o) {
        const { float, vec3, normalize, reflect, max, dot, pow, clamp, texture, equirectUV, screenUV, mix } = TSL;
        const ndvW = clamp(dot(o.n, o.viewDir), 0.0, 1.0);
        const fres = float(WG.fresnel[0]).add(float(WG.fresnel[1]).mul(pow(float(1.0).sub(ndvW), float(WG.fresnel[2]))));
        const _R = reflect(o.viewDir.negate(), o.n);
        const _Rh = normalize(vec3(_R.x, max(_R.y, float(0.02)), _R.z));
        const himmel0 = texture(this._himmelUmgebungTex(), equirectUV(_Rh)).level(float(0)).rgb;
        // der Spiegel des Gesetzes: der Pass in 1/4 Auflösung am Schirm-Ort, die Kräusel-Normale verschiebt ihn
        const sp = texture(S.rt.texture, screenUV.add(o.n.xz.mul(0.03))).level(float(0));
        const himmel = mix(himmel0, sp.rgb, sp.a);
        const spec = pow(max(dot(reflect(normalize(o.sunDir).negate(), o.n), o.viewDir), 0.0), float(WG.spec[0]));
        const glanz = o.sunCol.mul(spec).mul(WG.spec[1]).mul(o.light);
        const eigen = o.koerper
            .mul(o.irr)
            .mul(float(1.0).sub(o.T))
            .mul(float(1.0).sub(fres))
            .add(himmel.mul(fres))
            .add(glanz);
        return { eigen, fres };
    };
    void P;
    return r._tiefenKnotenTausch();
};

S.ab = () => {
    const Z = S.zustand;
    if (!Z) return { ab: false };
    Z.weg();
    Z.mat.dispose();
    Z.geo.dispose();
    S.zustand = null;
    return { ab: true };
};

S.weg = () => {
    const a = S.ab();
    let w = 0;
    if (Object.prototype.hasOwnProperty.call(r, "_wasserBlick")) {
        delete r._wasserBlick;
        w = r._tiefenKnotenTausch();
    }
    if (S.rt) S.rt.dispose();
    if (S.tex) S.tex.dispose();
    S.rt = S.tex = S.feld = null;
    return { ab: a.ab, wasserZurueck: w };
};
// was der Pass schrieb: Anteil der Treffer, mittlere Strahlung der Treffer (Rückbild des Ziels)
S.lesen = async () => {
    const R = S.rt;
    const px = await rend.readRenderTargetPixelsAsync(R, 0, 0, R.width, R.height);
    const f = T.DataUtils.fromHalfFloat;
    let n = 0,
        tr = 0,
        sr = 0,
        sg = 0,
        sb = 0;
    for (let i = 0; i < px.length; i += 4) {
        n++;
        const a = px instanceof Uint16Array ? f(px[i + 3]) : px[i + 3];
        if (a > 0.5) {
            tr++;
            sr += px instanceof Uint16Array ? f(px[i]) : px[i];
            sg += px instanceof Uint16Array ? f(px[i + 1]) : px[i + 1];
            sb += px instanceof Uint16Array ? f(px[i + 2]) : px[i + 2];
        }
    }
    return { pixel: n, treffer: +(tr / n).toFixed(3), mittel: [sr, sg, sb].map((v) => +(v / Math.max(1, tr)).toFixed(3)) };
};
// DAS PAAR (fremde Last auf der iGPU streut die Bank): der leere Pass und die Variante abwechselnd, je Runde n Draws,
// die Differenz je Runde — ihr Median ist die Arbeit des Passes allein
S.paar = async (kB, runden, n) => {
    const A = await S.an({ modus: "leer", ohneHaken: true, teil: kB.teil, mal: kB.mal });
    const B = await S.an(Object.assign({ ohneHaken: true }, kB));
    const q = rend.backend.device.queue;
    const lauf = async (Z, m) => {
        await q.onSubmittedWorkDone();
        const t0 = performance.now();
        for (let i = 0; i < m; i++) Z.zeichne();
        await q.onSubmittedWorkDone();
        return (performance.now() - t0) / m;
    };
    await lauf(A, 4);
    await lauf(B, 4);
    const d = [];
    const a = [];
    const b = [];
    for (let i = 0; i < (runden || 16); i++) {
        const ta = await lauf(A, n || 24);
        const tb = await lauf(B, n || 24);
        a.push(ta);
        b.push(tb);
        d.push(tb - ta);
    }
    A.weg();
    B.weg();
    const med = (v) => +v.slice().sort((x, y) => x - y)[v.length >> 1].toFixed(3);
    const sd = d.slice().sort((x, y) => x - y);
    const M = kB.mal || 1;
    return { v: JSON.stringify(kB), leerMs: med(a), passMs: med(b), deltaMs: med(d), jePassMs: +(med(d) / M).toFixed(3), p25: +sd[Math.floor(sd.length * 0.25)].toFixed(3), p75: +sd[Math.floor(sd.length * 0.75)].toFixed(3) };
};
// DIE BANK IM BILD, GEPAART: der echte Frame (`__bankRunde`, dieselbe Runde wie gpu-bank) abwechselnd ohne und mit dem Pass,
// je Paar die Differenz — fremde Last auf der iGPU trifft beide Hälften eines Paars gleich
S.bankPaar = async (paare, n) => {
    if (!S.zustand) return { fehler: "kein Pass" };
    rend.setAnimationLoop(null);
    window.__buehne();
    S.pause = false;
    await window.__bankRunde(4);
    S.pause = true;
    await window.__bankRunde(4);
    const d = [],
        a = [],
        b = [];
    for (let i = 0; i < (paare || 12); i++) {
        const erst = i % 2 === 0;
        S.pause = !erst;
        const x = await window.__bankRunde(n || 12);
        S.pause = erst;
        const y = await window.__bankRunde(n || 12);
        const mit = erst ? x : y,
            ohne = erst ? y : x;
        a.push(ohne.jeFrame);
        b.push(mit.jeFrame);
        d.push(mit.jeFrame - ohne.jeFrame);
    }
    S.pause = false;
    const med = (v) => +v.slice().sort((p, q) => p - q)[v.length >> 1].toFixed(3);
    const sd = d.slice().sort((p, q) => p - q);
    return { k: S.zustand.k, ohneMs: med(a), mitMs: med(b), deltaMs: med(d), p25: +sd[Math.floor(sd.length * 0.25)].toFixed(3), p75: +sd[Math.floor(sd.length * 0.75)].toFixed(3) };
};
