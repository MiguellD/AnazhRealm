// hoehlen-strahl.cjs — DIE STRAHL-WAHRHEIT DES BODEN-SATZES (Welle 7, die Höhlen-Sicht).
//
// Die Höhlen-Sicht (`_hoehlenSicht`) wählt je Pass die Höhlen-Zellen, die ein Strahl durch Mündung und Portale erreichen
// KANN — eine konservative Rechnung über Boxen. Diese Linse ist ihr unabhängiger Richter: sie schießt Strahlen gegen JEDES
// Dreieck des Boden-Satzes (alle Bereiche, alle Zellen, beide Seiten wie der DoubleSide-Stoff, die Geomorph-Lage wie der
// Vertex-Shader) — ein xz-Raster und eine 2D-DDA tragen die Suche.
//
// `window.__hoehlenStrahl(r, kamera, liste, opt)` — DAS BILD: je Strahl durch das Bild der Kamera (perspektivisch vom Auge,
// orthogonal von weit vor der Nah-Ebene) das ERSTE getroffene Dreieck; seine Zelle MUSS in `liste` (dem Abschnitt des
// Passes) stehen, sonst sähe der Spieler dort ein Loch. Rückgabe { strahlen, treffer, hoehle (Strahlen mit Höhlen-Treffer),
// zellenGetroffen, hoehleZellenGetroffen, hoehleTriGetroffen, fehlend: [{ bereich, knoten, hoehle, ndc, punkt }] }.
//
// `window.__hoehlenSchatten(r, auge, licht, liste, opt)` — DER SCHATTEN: je Strahl des Auges der erste Treffer (der
// Empfänger, den das Bild zeigt), von dort ein Strahl zum Licht (gegen die Blick-Achse der Licht-Kamera). Trifft er im
// Frustum der Licht-Kamera irgendein Dreieck, MUSS er eines aus `liste` (dem Abschnitt der Kaskade) treffen — sonst fiele
// Licht durch Fels auf einen sichtbaren Empfänger (ein Licht-Leck). Rückgabe { empfaenger, beschattet, lecks: [{ empfaenger,
// zelle (die erste ungezeichnete Fläche), hoehle }] }.
function installHoehlenStrahl() {
    const raster = (r, G) => {
        const s = r.state.chunkSaetze && r.state.chunkSaetze.get("boden");
        if (!s) return null;
        const P = s.geom.attributes.position.array;
        const Z = s.geom.attributes.aMorphTarget ? s.geom.attributes.aMorphTarget.array : null;
        const W = s.geom.attributes.aMorphWeight ? s.geom.attributes.aMorphWeight.array : null;
        const zellen = [];
        let nT = 0;
        for (const b of s.bloecke.values()) for (const z of b.zellen) nT += z.idx.length / 3;
        const V = new Float32Array(nT * 9);
        const ZI = new Int32Array(nT);
        let t = 0;
        let x0 = Infinity,
            z0 = Infinity,
            x1 = -Infinity,
            z1 = -Infinity;
        const lage = (v, o3) => {
            const w = W ? W[v] : 0;
            for (let a = 0; a < 3; a++) {
                const p = P[v * 3 + a];
                V[o3 + a] = w > 0 && Z ? p + (Z[v * 3 + a] - p) * w : p;
            }
        };
        for (const b of s.bloecke.values())
            for (const z of b.zellen) {
                const zi = zellen.length;
                zellen.push(z);
                const I = z.idx;
                for (let i = 0; i < I.length; i += 3, t++) {
                    if (I[i] === I[i + 1] && I[i + 1] === I[i + 2]) {
                        ZI[t] = -1; // eine entartete Lücke trifft nie
                        continue;
                    }
                    lage(I[i], t * 9);
                    lage(I[i + 1], t * 9 + 3);
                    lage(I[i + 2], t * 9 + 6);
                    ZI[t] = zi;
                    for (let q = 0; q < 9; q += 3) {
                        const x = V[t * 9 + q],
                            zz = V[t * 9 + q + 2];
                        if (x < x0) x0 = x;
                        if (x > x1) x1 = x;
                        if (zz < z0) z0 = zz;
                        if (zz > z1) z1 = zz;
                    }
                }
            }
        const GX = Math.max(1, Math.ceil((x1 - x0) / G) + 1),
            GZ = Math.max(1, Math.ceil((z1 - z0) / G) + 1);
        const zahl = new Int32Array(GX * GZ + 1);
        const spanne = (tt, f) => {
            let a0 = Infinity,
                a1 = -Infinity,
                c0 = Infinity,
                c1 = -Infinity;
            for (let q = 0; q < 9; q += 3) {
                const x = V[tt * 9 + q],
                    zz = V[tt * 9 + q + 2];
                if (x < a0) a0 = x;
                if (x > a1) a1 = x;
                if (zz < c0) c0 = zz;
                if (zz > c1) c1 = zz;
            }
            const i0 = Math.floor((a0 - x0) / G),
                i1 = Math.floor((a1 - x0) / G),
                k0 = Math.floor((c0 - z0) / G),
                k1 = Math.floor((c1 - z0) / G);
            for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) f(i + k * GX);
        };
        for (let tt = 0; tt < nT; tt++) if (ZI[tt] >= 0) spanne(tt, (c) => zahl[c + 1]++);
        for (let c = 0; c < GX * GZ; c++) zahl[c + 1] += zahl[c];
        const lauf = zahl.slice();
        const liste = new Int32Array(zahl[GX * GZ]);
        for (let tt = 0; tt < nT; tt++) if (ZI[tt] >= 0) spanne(tt, (c) => (liste[lauf[c]++] = tt));
        // Möller–Trumbore, beidseitig
        const treffe = (ox, oy, oz, dx, dy, dz, tt) => {
            const b = tt * 9;
            const e1x = V[b + 3] - V[b],
                e1y = V[b + 4] - V[b + 1],
                e1z = V[b + 5] - V[b + 2];
            const e2x = V[b + 6] - V[b],
                e2y = V[b + 7] - V[b + 1],
                e2z = V[b + 8] - V[b + 2];
            const px = dy * e2z - dz * e2y,
                py = dz * e2x - dx * e2z,
                pz = dx * e2y - dy * e2x;
            const det = e1x * px + e1y * py + e1z * pz;
            if (det > -1e-12 && det < 1e-12) return -1;
            const inv = 1 / det;
            const sx = ox - V[b],
                sy = oy - V[b + 1],
                sz = oz - V[b + 2];
            const u = (sx * px + sy * py + sz * pz) * inv;
            if (u < 0 || u > 1) return -1;
            const qx = sy * e1z - sz * e1y,
                qy = sz * e1x - sx * e1z,
                qz = sx * e1y - sy * e1x;
            const v = (dx * qx + dy * qy + dz * qz) * inv;
            if (v < 0 || u + v > 1) return -1;
            return (e2x * qx + e2y * qy + e2z * qz) * inv;
        };
        const XE = x0 + GX * G,
            ZE = z0 + GZ * G;
        // EIN Durchlauf: 2D-DDA über das Raster (auf seine xz-Fläche geklemmt), `f(tt, h)` je Treffer in [tMin, tMax] —
        // gibt sie true, endet er; `naechster` hält die Suche, sobald der beste Treffer vor der Zellen-Grenze liegt.
        const durchlauf = (ox, oy, oz, dx, dy, dz, tMin, tMax, f, naechster) => {
            let ta = tMin,
                tb = tMax;
            if (Math.abs(dx) > 1e-12) {
                const u = (x0 - ox) / dx,
                    v = (XE - ox) / dx;
                ta = Math.max(ta, Math.min(u, v));
                tb = Math.min(tb, Math.max(u, v));
            } else if (ox < x0 || ox >= XE) return;
            if (Math.abs(dz) > 1e-12) {
                const u = (z0 - oz) / dz,
                    v = (ZE - oz) / dz;
                ta = Math.max(ta, Math.min(u, v));
                tb = Math.min(tb, Math.max(u, v));
            } else if (oz < z0 || oz >= ZE) return;
            if (ta > tb) return;
            const gx = (ox + dx * ta - x0) / G,
                gz = (oz + dz * ta - z0) / G;
            let i = Math.min(GX - 1, Math.max(0, Math.floor(gx))),
                k = Math.min(GZ - 1, Math.max(0, Math.floor(gz)));
            const si = dx > 0 ? 1 : -1,
                sk = dz > 0 ? 1 : -1;
            const tdx = Math.abs(dx) > 1e-12 ? G / Math.abs(dx) : Infinity;
            const tdz = Math.abs(dz) > 1e-12 ? G / Math.abs(dz) : Infinity;
            let tx = Math.abs(dx) > 1e-12 ? ta + ((dx > 0 ? i + 1 - gx : gx - i) * G) / Math.abs(dx) : Infinity;
            let tz = Math.abs(dz) > 1e-12 ? ta + ((dz > 0 ? k + 1 - gz : gz - k) * G) / Math.abs(dz) : Infinity;
            for (;;) {
                const c = i + k * GX;
                for (let q = zahl[c]; q < zahl[c + 1]; q++) {
                    const tt = liste[q];
                    const h = treffe(ox, oy, oz, dx, dy, dz, tt);
                    if (h >= tMin && h <= tMax && f(tt, h)) return;
                }
                const ende = Math.min(tx, tz);
                if ((naechster && naechster() <= ende) || ende > tb) return;
                if (tx < tz) {
                    tx += tdx;
                    i += si;
                    if (i < 0 || i >= GX) return;
                } else {
                    tz += tdz;
                    k += sk;
                    if (k < 0 || k >= GZ) return;
                }
            }
        };
        // der nächste Treffer: [Dreieck, t] oder null
        const erster = (ox, oy, oz, dx, dy, dz, tMin, tMax) => {
            let best = Infinity,
                bestT = -1;
            durchlauf(
                ox,
                oy,
                oz,
                dx,
                dy,
                dz,
                tMin,
                tMax,
                (tt, h) => {
                    if (h < best) {
                        best = h;
                        bestT = tt;
                    }
                    return false;
                },
                () => best
            );
            return bestT >= 0 ? [bestT, best] : null;
        };
        return { zellen, ZI, durchlauf, erster };
    };
    // die Strahlen einer Kamera: je Bild-Punkt Ursprung und Richtung (orthogonal: weit vor der Nah-Ebene, `vor`)
    const strahlen = (kamera, NX, NY, vor, f) => {
        const T = window.THREE;
        kamera.updateMatrixWorld();
        const inv = new T.Matrix4().copy(kamera.projectionMatrix).invert();
        const welt = kamera.matrixWorld;
        const a = new T.Vector3(),
            e = new T.Vector3();
        // die NDC-Tiefe der Nah-Ebene (WebGPU 0…1, WebGL −1…1)
        const zNah = kamera.coordinateSystem === 2001 ? 0 : -1;
        for (let yy = 0; yy < NY; yy++)
            for (let xx = 0; xx < NX; xx++) {
                const nx = ((xx + 0.5) / NX) * 2 - 1,
                    ny = ((yy + 0.5) / NY) * 2 - 1;
                a.set(nx, ny, zNah).applyMatrix4(inv).applyMatrix4(welt);
                e.set(nx, ny, 1).applyMatrix4(inv).applyMatrix4(welt);
                let dx = e.x - a.x,
                    dy = e.y - a.y,
                    dz = e.z - a.z;
                const len = Math.hypot(dx, dy, dz);
                dx /= len;
                dy /= len;
                dz /= len;
                f(a.x - dx * vor, a.y - dy * vor, a.z - dz * vor, dx, dy, dz, vor, vor + len, nx, ny);
            }
    };
    window.__hoehlenStrahl = (r, kamera, liste, opt) => {
        const o = opt || {};
        const R = raster(r, o.zelle || 4);
        if (!R) return { fehler: "kein Boden-Satz" };
        const ortho = kamera.isOrthographicCamera === true;
        const imAbschnitt = new Set(liste);
        const aus = {
            strahlen: 0,
            treffer: 0,
            gekappt: 0,
            hoehle: 0,
            zellenGetroffen: 0,
            hoehleZellenGetroffen: 0,
            hoehleTriGetroffen: 0,
            fehlend: [],
        };
        const getroffen = new Set();
        const WEIT = o.weit || 400;
        strahlen(kamera, o.nx || 160, o.ny || 90, ortho ? 2000 : 0, (ox, oy, oz, dx, dy, dz, vor, tEnde, nx, ny) => {
            aus.strahlen++;
            const h = R.erster(ox, oy, oz, dx, dy, dz, 0, ortho ? tEnde : Math.min(tEnde, WEIT));
            if (!h) return;
            // orthogonal: ein erster Treffer VOR der Nah-Ebene liegt außerhalb der Karte — dieser Pass sagt nichts über ihn
            if (h[1] < vor) {
                aus.gekappt++;
                return;
            }
            aus.treffer++;
            const z = R.zellen[R.ZI[h[0]]];
            if (z.knoten !== undefined) aus.hoehle++;
            if (getroffen.has(z)) return;
            getroffen.add(z);
            if (!imAbschnitt.has(z) && aus.fehlend.length < 64)
                aus.fehlend.push({
                    bereich: z.bereich.key,
                    knoten: z.knoten !== undefined ? z.knoten.id : null,
                    hoehle: z.knoten !== undefined,
                    ndc: [+nx.toFixed(3), +ny.toFixed(3)],
                    punkt: [ox + dx * h[1], oy + dy * h[1], oz + dz * h[1]].map((v) => +v.toFixed(1)),
                });
        });
        aus.zellenGetroffen = getroffen.size;
        for (const z of getroffen)
            if (z.knoten !== undefined) {
                aus.hoehleZellenGetroffen++;
                aus.hoehleTriGetroffen += z.idx.length / 3;
            }
        return aus;
    };
    window.__hoehlenSchatten = (r, auge, licht, liste, opt) => {
        const o = opt || {};
        const T = window.THREE;
        const R = raster(r, o.zelle || 4);
        if (!R) return { fehler: "kein Boden-Satz" };
        licht.updateMatrixWorld();
        const lm = new T.Matrix4().multiplyMatrices(licht.projectionMatrix, licht.matrixWorldInverse);
        const lfr = new T.Frustum().setFromProjectionMatrix(lm, licht.coordinateSystem);
        // zum Licht: gegen die Blick-Achse der Licht-Kamera
        const L = new T.Vector3(0, 0, 1).transformDirection(licht.matrixWorld);
        const imAbschnitt = new Set(liste);
        const p = new T.Vector3();
        const aus = { empfaenger: 0, beschattet: 0, lecks: [] };
        const WEIT = o.weit || 400;
        strahlen(auge, o.nx || 160, o.ny || 90, 0, (ox, oy, oz, dx, dy, dz, vor, tEnde) => {
            const h = R.erster(ox, oy, oz, dx, dy, dz, 0, Math.min(tEnde, WEIT));
            if (!h) return;
            const ex = ox + dx * h[1],
                ey = oy + dy * h[1],
                ez = oz + dz * h[1];
            p.set(ex, ey, ez);
            if (!lfr.containsPoint(p)) return; // die Karte deckt ihn nicht
            aus.empfaenger++;
            let irgend = null,
                gezeichnet = false;
            R.durchlauf(ex, ey, ez, L.x, L.y, L.z, 0.05, 2000, (tt, t) => {
                p.set(ex + L.x * t, ey + L.y * t, ez + L.z * t);
                if (!lfr.containsPoint(p)) return false;
                const z = R.zellen[R.ZI[tt]];
                if (imAbschnitt.has(z)) {
                    gezeichnet = true;
                    return true;
                }
                if (!irgend) irgend = z;
                return false;
            });
            if (gezeichnet) aus.beschattet++;
            else if (irgend && aus.lecks.length < 64)
                aus.lecks.push({
                    empfaenger: [ex, ey, ez].map((v) => +v.toFixed(1)),
                    zelle: irgend.bereich.key + (irgend.knoten !== undefined ? "#" + irgend.knoten.id : ":himmel"),
                    hoehle: irgend.knoten !== undefined,
                });
        });
        return aus;
    };
}

module.exports = { installHoehlenStrahl };
