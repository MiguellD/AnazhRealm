// licht-linsen.cjs — DIE ZWEI LICHT-LINSEN der Werkbank (V18.506, Gebot 10). Beide rendern in ein
// EIGENES Render-Target: linear, ungetont (r184 tont nur das Ausgabe-Ziel) — hier ist das gewollt.
//
// __albedoSicht({ nur, w, h }) — DIE ALBEDO-SICHT: jedes Pixel = die diffuse Albedo, die der Shader
//   wirklich ausgibt. Licht: nur das Umgebungslicht, weiß, Stärke π (Lambert: albedo/π · π = albedo);
//   Sonne, Hemi, Himmels-Umgebung und Nebel aus. Emission und eingebackenes Licht fallen über die
//   Differenz (Umgebungslicht π) − (Umgebungslicht 0) heraus. Eine 18-%-Karte liest 0,180 (Selbst-
//   Eichung, gemessen 01.10.). Je Mesh-Klasse (Boden · Instanz-Schlüssel · Tier · …) ein Schuss aufs
//   nächste Exemplar, Statistik + Bild (sRGB-kodiert, Hintergrund magenta).
// __lichtBilanz() — DIE LICHT-BILANZ: eine 18-%-Karte über dem Kronendach in drei Lagen (oben · zur
//   Sonne · von der Sonne), je Licht einzeln und alle zusammen; E = π·L/0,18.
//
// Zwei Fallen, die beide Linsen kennen müssen (gemessen 01.10.):
// - `readRenderTargetPixelsAsync` liefert die Zeilen auf 256 Byte ausgerichtet (bytesPerRow); bei
//   W·Bytes ∤ 256 liegt jede Zeile versetzt (eine 8×8-Probe las exakt ¼).
// - Bei ruhendem Loop schaltet niemand den NODE-FRAME weiter: Licht-Uniforms bleiben auf dem Stand des
//   ersten Schusses. Vor jedem Render `nodeFrame.update()`. Und: Meshes in einer `BundleGroup` folgen
//   `visible` erst nach `needsUpdate` (sonst spielt das aufgezeichnete Bündel weiter).

function albedoSicht(opts) {
    return (async () => {
        opts = opts || {};
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        const W = opts.w || 320,
            H = opts.h || 200;
        const nur = opts.nur ? new RegExp(opts.nur) : null;
        const klasse = (o) => {
            let p = o;
            while (p && p !== sc) {
                const u = p.userData || {};
                if (u.isHydrosphere) return "wasser";
                if (u.voxelChunkX != null) return "boden";
                if (u.archInstanceKey) return "inst:" + u.archInstanceKey;
                if (u.archBatchKey) return "batch:" + u.archBatchKey;
                if (p.name === "wolf" || p.name === "mensch") return p.name;
                if (u._tierBaum || u.soul) return "tier";
                if (u.sourceOp) return "gesetzt:" + u.sourceOp;
                if (u.isGraukarte) return "graukarte";
                p = p.parent;
            }
            return "sonst";
        };
        const pp = st.playerMesh.position;
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardNodeMaterial({
                color: new T.Color(0.18, 0.18, 0.18),
                roughness: 1,
                metalness: 0,
                side: T.DoubleSide,
            })
        );
        karte.userData.isGraukarte = true;
        karte.position.set(pp.x + 40, pp.y + 30, pp.z + 40);
        sc.add(karte);
        karte.updateMatrixWorld(true);
        const meshes = [];
        sc.traverse((o) => {
            if (o.isMesh || o.isSprite || o.isPoints || o.isLine) meshes.push(o);
        });
        const visAlt = new Map(meshes.map((m) => [m, m.visible]));
        const kl = new Map(meshes.map((m) => [m, klasse(m)]));
        const lichtAlt = [];
        sc.traverse((o) => {
            if (o.isLight) lichtAlt.push([o, o.intensity, o.color.clone()]);
        });
        const amb = st.ambientLight || lichtAlt.map((e) => e[0]).find((l) => l.isAmbientLight);
        let ambEigen = null;
        if (!amb) {
            ambEigen = new T.AmbientLight(0xffffff, 0);
            sc.add(ambEigen);
        }
        const A = amb || ambEigen;
        const fogAlt = sc.fog ? [sc.fog.near, sc.fog.far] : null;
        const envAlt = sc.environment;
        const kamAlt = { p: st.camera.position.clone(), q: st.camera.quaternion.clone() };
        if (sc.fog) {
            sc.fog.near = 1e7;
            sc.fog.far = 2e7;
        }
        sc.environment = null;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const cam = st.camera;
        const srgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
        const bundles = () =>
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        const lies = async () => {
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const z = W * 4;
            if (roh.length <= z * H) return roh;
            const s = Math.ceil(z / 256) * 256;
            const u8 = new Uint8Array(z * H);
            for (let y = 0; y < H; y++) u8.set(roh.subarray(y * s, y * s + z), y * z);
            return u8;
        };
        const schuss = async (sicht) => {
            for (const m of meshes) m.visible = visAlt.get(m) && sicht(m);
            bundles();
            const pass = async (e) => {
                for (const [l] of lichtAlt) l.intensity = 0;
                A.color.setRGB(1, 1, 1);
                A.intensity = e;
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                return lies();
            };
            await pass(Math.PI);
            const hell = await pass(Math.PI);
            const dunkel = await pass(0);
            return { hell, dunkel };
        };
        const auswerten = (s, name) => {
            const { hell, dunkel } = s;
            const pix = [];
            for (let i = 0; i < W * H; i++) {
                if (hell[i * 4 + 3] === 0) continue;
                const a = [0, 1, 2].map((c) => Math.max(0, hell[i * 4 + c] - dunkel[i * 4 + c]) / 255);
                const em = (dunkel[i * 4] + dunkel[i * 4 + 1] + dunkel[i * 4 + 2]) / 765;
                pix.push([a[0], a[1], a[2], em]);
            }
            const Y = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
            const mittel = (arr) => {
                if (!arr.length) return null;
                const m = [0, 0, 0, 0];
                for (const p of arr) for (let c = 0; c < 4; c++) m[c] += p[c];
                return m.map((v) => v / arr.length);
            };
            const fmt = (m, n) =>
                m
                    ? {
                          anteil: +(n / Math.max(1, pix.length)).toFixed(2),
                          rgb: m
                              .slice(0, 3)
                              .map((v) => +v.toFixed(3))
                              .join("/"),
                          Y: +Y(m).toFixed(3),
                          emission: +m[3].toFixed(3),
                      }
                    : null;
            const istGruen = (p) => p[1] > p[0] * 1.08 && p[1] > p[2] * 1.08;
            const gruen = pix.filter(istGruen);
            const rest = pix.filter((p) => !istGruen(p));
            const ys = rest.map(Y).sort((a, b) => a - b);
            const med = ys.length ? ys[Math.floor(ys.length / 2)] : 0;
            const hellR = rest.filter((p) => Y(p) >= med),
                dunkR = rest.filter((p) => Y(p) < med);
            const yAll = pix.map(Y).sort((a, b) => a - b);
            const q = (f) =>
                yAll.length ? +yAll[Math.min(yAll.length - 1, Math.floor(f * yAll.length))].toFixed(3) : null;
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(W, H);
            for (let i = 0; i < W * H; i++) {
                const o = i * 4;
                if (hell[o + 3] === 0) {
                    img.data.set([255, 0, 255, 255], o);
                    continue;
                }
                for (let c = 0; c < 3; c++)
                    img.data[o + c] = Math.round(255 * srgb(Math.max(0, hell[o + c] - dunkel[o + c]) / 255));
                img.data[o + 3] = 255;
            }
            ctx.putImageData(img, 0, 0);
            return {
                name,
                pixel: pix.length,
                gesamt: fmt(mittel(pix), pix.length),
                gruen: fmt(mittel(gruen), gruen.length),
                hell: fmt(mittel(hellR), hellR.length),
                dunkel: fmt(mittel(dunkR), dunkR.length),
                Yq: [q(0.05), q(0.25), q(0.5), q(0.75), q(0.95)].join("/"),
                png: cv.toDataURL("image/png"),
            };
        };
        // Ziel je Klasse: das nächste Exemplar. Die Kugel kommt aus den Positionen (die gespeicherte kann
        // veraltet sein — die Linse schreibt nie die Engine-Kugel).
        const ziel = (m) => {
            const bb = new T.Box3().setFromBufferAttribute(m.geometry.attributes.position);
            const bs = { center: bb.getCenter(new T.Vector3()), radius: bb.getSize(new T.Vector3()).length() / 2 };
            const M = new T.Matrix4(),
                mw = m.matrixWorld;
            let best = null;
            const n = m.isInstancedMesh ? m.count : 1;
            for (let i = 0; i < n; i++) {
                if (m.isInstancedMesh) {
                    m.getMatrixAt(i, M);
                    M.premultiply(mw);
                } else M.copy(mw);
                const c = bs.center.clone().applyMatrix4(M);
                const s = Math.max(
                    new T.Vector3().setFromMatrixColumn(M, 0).length(),
                    new T.Vector3().setFromMatrixColumn(M, 1).length()
                );
                const d = Math.hypot(c.x - pp.x, c.z - pp.z);
                if (!best || d < best.d) best = { c, rad: bs.radius * s, d };
            }
            return best;
        };
        const ergebnisse = [];
        const klassen = [...new Set(kl.values())].filter((k) => !/^(sonst|wasser|mensch)/.test(k));
        try {
            for (const k of klassen) {
                if (nur && !nur.test(k)) continue;
                let z = null;
                if (k === "boden") {
                    const y = r._voxelSurfaceY(pp.x, pp.z);
                    cam.position.set(pp.x, y + 14, pp.z + 0.01);
                    cam.lookAt(pp.x, y, pp.z);
                } else {
                    for (const m of meshes)
                        if (kl.get(m) === k && visAlt.get(m)) {
                            const zz = ziel(m);
                            if (zz && (!z || zz.d < z.d)) z = zz;
                        }
                    if (!z) continue;
                    const dx = z.c.x - pp.x,
                        dz = z.c.z - pp.z,
                        dl = Math.hypot(dx, dz) || 1;
                    const ab = Math.max(1.2, z.rad * 2.4);
                    cam.position.set(z.c.x - (dx / dl) * ab, z.c.y + z.rad * 0.3, z.c.z - (dz / dl) * ab);
                    cam.lookAt(z.c.x, z.c.y, z.c.z);
                }
                cam.updateMatrixWorld(true);
                const e = auswerten(await schuss((m) => kl.get(m) === k), k);
                if (z) e.abstand = +z.d.toFixed(1);
                ergebnisse.push(e);
            }
        } finally {
            for (const m of meshes) m.visible = visAlt.get(m);
            bundles();
            for (const [l, i, c] of lichtAlt) {
                l.intensity = i;
                l.color.copy(c);
            }
            if (ambEigen) sc.remove(ambEigen);
            if (fogAlt) {
                sc.fog.near = fogAlt[0];
                sc.fog.far = fogAlt[1];
            }
            sc.environment = envAlt;
            sc.remove(karte);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.updateMatrixWorld(true);
            rt.dispose();
            if (r._applyDayNightToScene) r._applyDayNightToScene();
        }
        return ergebnisse;
    })();
}

function lichtBilanz() {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        if (window.__buehne) window.__buehne();
        const pp = st.playerMesh.position;
        const gy = r._voxelSurfaceY(pp.x, pp.z);
        const dl = st.directionalLight;
        const sd = dl.position.clone().sub(dl.target.position).normalize();
        const hz = new T.Vector3(sd.x, 0, sd.z).normalize();
        const W = 64,
            H = 64;
        const karte = new T.Mesh(
            new T.PlaneGeometry(1.2, 1.2),
            new T.MeshStandardNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 })
        );
        const basis = new T.Vector3(pp.x + 6, gy + 45, pp.z + 6);
        sc.add(karte);
        const meshes = [];
        sc.traverse((o) => {
            if ((o.isMesh || o.isSprite || o.isPoints) && o !== karte) meshes.push(o);
        });
        const visAlt = new Map(meshes.map((m) => [m, m.visible]));
        const lichtAlt = [];
        sc.traverse((o) => {
            if (o.isLight) lichtAlt.push([o, o.intensity]);
        });
        const envAlt = sc.environment;
        const fogAlt = sc.fog ? [sc.fog.near, sc.fog.far] : null;
        const kamAlt = { p: st.camera.position.clone(), q: st.camera.quaternion.clone() };
        const cam = st.camera;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
        const lagen = { oben: new T.Vector3(0, 1, 0), zurSonne: hz.clone(), vonSonne: hz.clone().negate() };
        const half = (h) => {
            const s = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
            if (e === 31) return f ? NaN : Infinity;
            return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        };
        const bundles = () =>
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        const mess = async (n) => {
            karte.position.copy(basis);
            karte.lookAt(basis.clone().add(n));
            karte.updateMatrixWorld(true);
            cam.position.copy(basis.clone().add(n.clone().multiplyScalar(1.5)));
            cam.lookAt(basis);
            cam.updateMatrixWorld(true);
            const lauf = async () => {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const zeile = W * 4;
                const schritt = px.length > zeile * H ? Math.ceil((zeile * 2) / 256) * 128 : zeile;
                const s = [0, 0, 0];
                let n2 = 0;
                for (let y = H / 2 - 4; y < H / 2 + 4; y++)
                    for (let x = W / 2 - 4; x < W / 2 + 4; x++) {
                        const i = y * schritt + x * 4;
                        for (let c = 0; c < 3; c++) s[c] += half(px[i + c]);
                        n2++;
                    }
                return s.map((v) => v / n2);
            };
            await lauf();
            return lauf();
        };
        const Y = (s) => 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
        const out = { sonnenRichtung: [sd.x, sd.y, sd.z].map((v) => +v.toFixed(3)), lichter: {} };
        for (const [l, i] of lichtAlt)
            out.lichter[l.type] = {
                intensitaet: +i.toFixed(3),
                farbe: l.color
                    .toArray()
                    .map((v) => +v.toFixed(3))
                    .join("/"),
            };
        try {
            for (const m of meshes) m.visible = false;
            bundles();
            if (sc.fog) {
                sc.fog.near = 1e7;
                sc.fog.far = 2e7;
            }
            const varianten = { alle: null, umgebung: "env" };
            for (const [l] of lichtAlt) varianten[l.type] = l.type;
            for (const [vn, typ] of Object.entries(varianten)) {
                for (const [l, i] of lichtAlt) l.intensity = typ == null || l.type === typ ? i : 0;
                sc.environment = typ == null || typ === "env" ? envAlt : null;
                out[vn] = {};
                for (const [ln, n] of Object.entries(lagen)) {
                    const L = await mess(n);
                    out[vn][ln] = {
                        L: L.map((v) => +v.toFixed(3)).join("/"),
                        E: +((Math.PI * Y(L)) / 0.18).toFixed(2),
                    };
                }
            }
        } finally {
            for (const m of meshes) m.visible = visAlt.get(m);
            bundles();
            for (const [l, i] of lichtAlt) l.intensity = i;
            sc.environment = envAlt;
            if (fogAlt) {
                sc.fog.near = fogAlt[0];
                sc.fog.far = fogAlt[1];
            }
            sc.remove(karte);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.updateMatrixWorld(true);
            rt.dispose();
            r._applyDayNightToScene();
        }
        return out;
    })();
}

module.exports = {
    LINSEN_INSTALL: `window.__albedoSicht = ${albedoSicht.toString()};` + `window.__lichtBilanz = ${lichtBilanz.toString()};`,
};
