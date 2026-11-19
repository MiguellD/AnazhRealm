// DIE STUFE AUS DER L0 MIT MUSTER IM STOFF (Spike, nicht Gesetz): aus den Netzen der L0 (je Netz ein Stoff) entsteht die Stufe —
// (1) MUSTER-TEILE (Ecken mit einer Verband-Zeile ≠ 0: Backstein, Dachziegel, Naturstein) werden je Ebene und je Zone zur Fläche: die
//     Steine einer Ebene, die näher als `luecke` beieinander liegen, bilden eine Zone (ein Gefach, eine Dachfläche); ihre konvexe Hülle
//     ist die neue Fläche, mit der mittleren Farbe ihrer Steine (flächengewichtet) und DERSELBEN Verband-Zeile — der Stoff webt das
//     Muster (`_verbandStoff`). Ebenen mit weniger als `minFlaeche` m² (Kanten und Kuppen der Steine: ihr Relief) fallen.
// (2) Jede andere Fläche bleibt, außer ihre schmale Seite (die kleinste Höhe des Dreiecks) liegt an der Grenze unter einem Bildpunkt
//     `s` — die Flanke eines Balkens, ein Pflock, eine Fuge.
// muster(netze, s) → neue Netze im Format des Foundry-Fadens ({ kind, mat, <attr>: { array, itemSize }, index })
function muster(netze, s, opt) {
    const o = Object.assign({ luecke: 0.06, minFlaeche: 0.5, ebeneM: 0.02 }, opt || {});
    const aus = [];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const punkt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const laenge = (a) => Math.hypot(a[0], a[1], a[2]);
    const sicht = sichtbar(netze, s, o.glas || []);
    for (let mi = 0; mi < netze.length; mi++) {
        const m = netze[mi];
        if (!m || !m.position || !m.position.array || !m.index) {
            aus.push(m);
            continue;
        }
        const P = m.position.array, n = P.length / 3, I = m.index;
        const attrs = Object.keys(m).filter((k) => m[k] && m[k].array && m[k].itemSize && m[k].array.length === n * m[k].itemSize);
        const V = m.aVerband ? m.aVerband.array : null;
        const p = (i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
        // die Ecken verschweißt (1 mm): die Teile sind zusammenhängende Dreiecke
        const schweiss = new Map(), wid = new Int32Array(n);
        for (let i = 0; i < n; i++) {
            const k = Math.round(P[i * 3] * 1000) + "," + Math.round(P[i * 3 + 1] * 1000) + "," + Math.round(P[i * 3 + 2] * 1000);
            let w = schweiss.get(k);
            if (w === undefined) schweiss.set(k, (w = schweiss.size));
            wid[i] = w;
        }
        const nt = I.length / 3, eltern = new Int32Array(schweiss.size).map((_, i) => i);
        const finde = (x) => { while (eltern[x] !== x) x = eltern[x] = eltern[eltern[x]]; return x; };
        for (let t = 0; t < nt; t++) {
            const a = finde(wid[I[t * 3]]), b = finde(wid[I[t * 3 + 1]]), c = finde(wid[I[t * 3 + 2]]);
            eltern[b] = a;
            eltern[finde(c)] = a;
        }
        const behalten = [], ebenen = new Map();
        for (let t = 0; t < nt; t++) {
            const ia = I[t * 3], ib = I[t * 3 + 1], ic = I[t * 3 + 2];
            const A = p(ia), B = p(ib), C = p(ic);
            const nn = kreuz(sub(B, A), sub(C, A)), fl2 = laenge(nn);
            if (!(fl2 > 1e-12)) continue;
            const nr = V ? Math.round(V[ia]) : 0;
            if (nr) {
                if (!sicht[mi][t]) continue;
                const nv = nn.map((x) => x / fl2), d = punkt(nv, A);
                const key = nr + "|" + nv.map((x) => Math.round(x * 20)).join(",") + "|" + Math.round(d / o.ebeneM);
                let e = ebenen.get(key);
                if (!e) ebenen.set(key, (e = { nr, n: nv, tris: [], flaeche: 0 }));
                e.tris.push(t);
                e.flaeche += fl2 / 2;
                continue;
            }
            // was aus keiner Außen-Richtung in einem Bildpunkt vorn liegt, fällt (das Innere, die Rückseite eines Balkens an der Wand)
            if (!sicht[mi][t]) continue;
            const kante = Math.max(laenge(sub(B, A)), laenge(sub(C, B)), laenge(sub(A, C)));
            // die kleinste Höhe (2 · Fläche ÷ längste Kante) unter einem Bildpunkt: die Fläche fällt
            if (fl2 / kante < s) continue;
            behalten.push(t);
        }
        // die neue Geometrie: behaltene Dreiecke mit ihren Attributen, dann die Zonen-Flächen
        const ecken = [], idx = [];
        const alt = new Map();
        for (const t of behalten)
            for (let j = 0; j < 3; j++) {
                const i = I[t * 3 + j];
                let q = alt.get(i);
                if (q === undefined) {
                    alt.set(i, (q = ecken.length));
                    ecken.push({ von: i });
                }
                idx.push(q);
            }
        let zonen = 0;
        for (const e of ebenen.values()) {
            if (e.flaeche < o.minFlaeche) continue;
            // die Achsen der Ebene
            const up = Math.abs(e.n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
            let tA = kreuz(up, e.n);
            const tl = laenge(tA);
            tA = tA.map((x) => x / tl);
            const bA = kreuz(e.n, tA);
            // je Teil (Stein) sein Rechteck in der Ebene; Teile näher als `luecke` bilden eine Zone
            const teile = new Map();
            for (const t of e.tris) {
                const k = finde(wid[I[t * 3]]);
                let r = teile.get(k);
                if (!r) teile.set(k, (r = { u0: 1e9, u1: -1e9, v0: 1e9, v1: -1e9, tris: [] }));
                r.tris.push(t);
                for (let j = 0; j < 3; j++) {
                    const q = p(I[t * 3 + j]), u = punkt(q, tA), v = punkt(q, bA);
                    r.u0 = Math.min(r.u0, u); r.u1 = Math.max(r.u1, u); r.v0 = Math.min(r.v0, v); r.v1 = Math.max(r.v1, v);
                }
            }
            const R = [...teile.values()], ze = R.map((_, i) => i);
            const zf = (x) => { while (ze[x] !== x) x = ze[x] = ze[ze[x]]; return x; };
            const ordnung = R.map((_, i) => i).sort((a, b) => R[a].u0 - R[b].u0);
            for (let a = 0; a < ordnung.length; a++) {
                const ra = R[ordnung[a]];
                for (let b = a + 1; b < ordnung.length; b++) {
                    const rb = R[ordnung[b]];
                    if (rb.u0 > ra.u1 + o.luecke) break;
                    if (rb.v0 <= ra.v1 + o.luecke && ra.v0 <= rb.v1 + o.luecke) ze[zf(ordnung[b])] = zf(ordnung[a]);
                }
            }
            const gruppen = new Map();
            R.forEach((r, i) => { const g = zf(i); if (!gruppen.has(g)) gruppen.set(g, []); gruppen.get(g).push(r); });
            for (const g of gruppen.values()) {
                // die konvexe Hülle der Ecken der Zone (Andrew), ihre Farbe flächengewichtet, ihre Tiefe das Mittel
                const pts = [];
                let tiefe = 0, nt2 = 0, fl = 0;
                const farbe = m.color ? new Array(m.color.itemSize).fill(0) : null;
                for (const r of g)
                    for (const t of r.tris) {
                        const ia = I[t * 3], ib = I[t * 3 + 1], ic = I[t * 3 + 2];
                        const f = laenge(kreuz(sub(p(ib), p(ia)), sub(p(ic), p(ia)))) / 2;
                        fl += f;
                        for (const i of [ia, ib, ic]) {
                            const q = p(i);
                            pts.push([punkt(q, tA), punkt(q, bA)]);
                            tiefe += punkt(q, e.n);
                            nt2++;
                            if (farbe) for (let j = 0; j < farbe.length; j++) farbe[j] += (m.color.array[i * m.color.itemSize + j] * f) / 3;
                        }
                    }
                if (!(fl > 0)) continue;
                tiefe /= nt2;
                if (farbe) for (let j = 0; j < farbe.length; j++) farbe[j] /= fl;
                // die Zone als Raster der Zelle `c` (zwei Bildpunkte): eine Zelle trägt, wo das Rechteck eines Steins sie berührt (die
                // Fuge unter einer Zelle schließt sich); die größten Rechtecke der getragenen Zellen sind die Fläche — Löcher (ein Fenster,
                // ein Balken ohne Stein dahinter) bleiben offen. Die Fläche liegt 3 mm hinter der Front der Steine (der Balken davor gewinnt).
                const c = 2 * s;
                let gu0 = 1e9, gv0 = 1e9, gu1 = -1e9, gv1 = -1e9;
                for (const r of g) { gu0 = Math.min(gu0, r.u0); gv0 = Math.min(gv0, r.v0); gu1 = Math.max(gu1, r.u1); gv1 = Math.max(gv1, r.v1); }
                const nu = Math.max(1, Math.ceil((gu1 - gu0) / c)), nv = Math.max(1, Math.ceil((gv1 - gv0) / c));
                const zelle = new Uint8Array(nu * nv);
                for (const r of g) {
                    const a0 = Math.max(0, Math.floor((r.u0 - gu0) / c)), a1 = Math.min(nu - 1, Math.floor((r.u1 - gu0) / c));
                    const b0 = Math.max(0, Math.floor((r.v0 - gv0) / c)), b1 = Math.min(nv - 1, Math.floor((r.v1 - gv0) / c));
                    for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) zelle[b * nu + a] = 1;
                }
                const ecke = (u, v) => {
                    const w = tiefe - 0.003;
                    ecken.push({ neu: [tA[0] * u + bA[0] * v + e.n[0] * w, tA[1] * u + bA[1] * v + e.n[1] * w, tA[2] * u + bA[2] * v + e.n[2] * w], n: e.n, farbe, nr: e.nr });
                };
                for (let b = 0; b < nv; b++)
                    for (let a = 0; a < nu; a++) {
                        if (zelle[b * nu + a] !== 1) continue;
                        let w = 1;
                        while (a + w < nu && zelle[b * nu + a + w] === 1) w++;
                        let h = 1;
                        while (b + h < nv) {
                            let voll = true;
                            for (let x = a; x < a + w && voll; x++) voll = zelle[(b + h) * nu + x] === 1;
                            if (!voll) break;
                            h++;
                        }
                        for (let y = b; y < b + h; y++) for (let x = a; x < a + w; x++) zelle[y * nu + x] = 2;
                        const u0 = gu0 + a * c, u1 = Math.min(gu1, gu0 + (a + w) * c), v0 = gv0 + b * c, v1 = Math.min(gv1, gv0 + (b + h) * c);
                        const basis = ecken.length;
                        ecke(u0, v0); ecke(u1, v0); ecke(u1, v1); ecke(u0, v1);
                        // gewickelt nach der Normale der Ebene: (t, b) mit t × b = n läuft gegen den Uhrzeigersinn
                        idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
                    }
                zonen++;
            }
        }
        if (!idx.length) continue;
        const neu = { kind: m.kind, mat: m.mat };
        for (const a of attrs) {
            const k = m[a].itemSize, arr = new Float32Array(ecken.length * k);
            ecken.forEach((q, i) => {
                if (q.von !== undefined) for (let j = 0; j < k; j++) arr[i * k + j] = m[a].array[q.von * k + j];
                else if (a === "position") arr.set(q.neu, i * 3);
                else if (a === "normal") arr.set(q.n, i * 3);
                else if (a === "color" && q.farbe) for (let j = 0; j < k; j++) arr[i * k + j] = q.farbe[j];
                else if (a === "aVerband") arr[i] = q.nr;
            });
            neu[a] = { array: arr, itemSize: k };
        }
        neu.index = ecken.length > 65535 ? Uint32Array.from(idx) : Uint16Array.from(idx);
        neu.zonen = zonen;
        aus.push(neu);
    }
    return aus;
}

// WAS AN DER GRENZE GESEHEN WIRD: je Richtung (12 Azimute × 3 Höhen 0° · 29° · 60° und von oben) ein Tiefen-Raster der Netze in der
// Zelle `s` (ein Bildpunkt an der Grenze, orthografisch); ein Dreieck ist sichtbar, wenn es in einer Richtung an mindestens einer
// Pixel-Mitte vorn liegt. → je Netz ein Uint8Array je Dreieck (1 = sichtbar)
function sichtbar(netze, s, glas) {
    const aus = netze.map((m) => (m && m.index && m.position ? new Uint8Array(m.index.length / 3) : null));
    const richt = [[0, 1, 0]];
    for (const el of [0, 0.5, 1.05])
        for (let k = 0; k < 12; k++) {
            const az = (k * Math.PI) / 6 + 0.13;
            richt.push([Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)]);
        }
    for (const d of richt) {
        const up = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        let t = [up[1] * d[2] - up[2] * d[1], up[2] * d[0] - up[0] * d[2], up[0] * d[1] - up[1] * d[0]];
        const tl = Math.hypot(t[0], t[1], t[2]);
        t = t.map((x) => x / tl);
        const b = [d[1] * t[2] - d[2] * t[1], d[2] * t[0] - d[0] * t[2], d[0] * t[1] - d[1] * t[0]];
        let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
        const proj = netze.map((m) => {
            if (!m || !m.index || !m.position) return null;
            const P = m.position.array, n = P.length / 3, q = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) {
                const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
                const u = (x * t[0] + y * t[1] + z * t[2]) / s, v = (x * b[0] + y * b[1] + z * b[2]) / s;
                q[i * 3] = u; q[i * 3 + 1] = v; q[i * 3 + 2] = x * d[0] + y * d[1] + z * d[2];
                u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
            }
            return q;
        });
        const W = Math.ceil(u1 - u0) + 2, H = Math.ceil(v1 - v0) + 2;
        const tiefe = new Float32Array(W * H).fill(-1e9), wer = new Int32Array(W * H).fill(-1), werN = new Int32Array(W * H);
        netze.forEach((m, mi) => {
            const q = proj[mi];
            if (!q) return;
            const I = m.index;
            // Glas verdeckt nichts (man sieht durch die Scheibe ins Innere) — es selbst ist sichtbar
            if (glas[mi]) { aus[mi].fill(1); return; }
            for (let tr = 0; tr < I.length / 3; tr++) {
                const a = I[tr * 3] * 3, bb = I[tr * 3 + 1] * 3, c = I[tr * 3 + 2] * 3;
                const ax = q[a] - u0, ay = q[a + 1] - v0, bx = q[bb] - u0, by = q[bb + 1] - v0, cx = q[c] - u0, cy = q[c + 1] - v0;
                const fl = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
                if (Math.abs(fl) < 1e-12) continue;
                const xa = Math.max(0, Math.ceil(Math.min(ax, bx, cx) - 0.5)), xb = Math.min(W - 1, Math.floor(Math.max(ax, bx, cx) - 0.5));
                const ya = Math.max(0, Math.ceil(Math.min(ay, by, cy) - 0.5)), yb = Math.min(H - 1, Math.floor(Math.max(ay, by, cy) - 0.5));
                for (let y = ya; y <= yb; y++)
                    for (let x = xa; x <= xb; x++) {
                        const px = x + 0.5, py = y + 0.5;
                        const w0 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) / fl;
                        const w1 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) / fl;
                        const w2 = 1 - w0 - w1;
                        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
                        const z = w0 * q[a + 2] + w1 * q[bb + 2] + w2 * q[c + 2];
                        const k = y * W + x;
                        if (z > tiefe[k]) { tiefe[k] = z; wer[k] = tr; werN[k] = mi; }
                    }
            }
        });
        for (let k = 0; k < W * H; k++) if (wer[k] >= 0) aus[werN[k]][wer[k]] = 1;
        // ein Dreieck unter einem Bildpunkt (die feine Teilung eines gewölbten Blechs) trifft keine Pixel-Mitte: es ist sichtbar, wenn
        // sein Schwerpunkt nicht hinter der vordersten Fläche seines Pixels liegt (5 mm)
        netze.forEach((m, mi) => {
            const q = proj[mi];
            if (!q) return;
            const I = m.index;
            for (let tr = 0; tr < I.length / 3; tr++) {
                if (aus[mi][tr]) continue;
                const a = I[tr * 3] * 3, bb = I[tr * 3 + 1] * 3, c = I[tr * 3 + 2] * 3;
                // nur ein Dreieck unter einem Bildpunkt (Fläche im Raster < 1): ein größeres hätte eine Pixel-Mitte getroffen
                if (Math.abs((q[bb] - q[a]) * (q[c + 1] - q[a + 1]) - (q[c] - q[a]) * (q[bb + 1] - q[a + 1])) / 2 >= 1) continue;
                const x = Math.floor((q[a] + q[bb] + q[c]) / 3 - u0), y = Math.floor((q[a + 1] + q[bb + 1] + q[c + 1]) / 3 - v0);
                if (x < 0 || y < 0 || x >= W || y >= H) continue;
                const k = y * W + x;
                if (wer[k] >= 0 && (q[a + 2] + q[bb + 2] + q[c + 2]) / 3 >= tiefe[k] - 0.005) aus[mi][tr] = 1;
            }
        });
    }
    return aus;
}

