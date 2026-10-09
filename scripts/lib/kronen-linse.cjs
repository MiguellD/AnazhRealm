// kronen-linse.cjs — DIE LINSEN DER KRONE (S7, 05.10.), aus den gebauten Puffern (asset-worker-harness) gelesen:
//
// (1) DIE BILD-DECKUNG — wie viel vom Bild eine Krone deckt, GERASTERT, nicht ihre Flächen-Summe. Befund (Prüfer W5, R3):
//     die Deckungs-Linse summierte Flächen (mittlere Projektion nach Cauchy, je Karte Fläche × Atlas-Füllung) und sah
//     keine Überlappung — sie meldete die neue Nah-Krone mit 0,99 der alten, das Labor-Bild zeigte 0,76 (Eiche 8 m,
//     Subjekt 0,673 → 0,515). Hier wird die Silhouette gemalt: jedes Dreieck der Krone in 24 orthografischen
//     Ansichten — acht Azimute (0°, 22,5° … 157,5°) je Blick-Hebung 0°, 30° und 60° VON UNTEN (der Spieler steht am
//     Boden: eine Krone über ihm liest er schräg von unten, die Mammut-Krone auf 8 m unter 74°) — auf ein festes Raster
//     (Kante `px` in Vorlagen-Einheiten, für beide Stufen eines Paars dieselbe); Karten-Dreiecke lesen je Pixel die
//     Alpha des EINEN Blatt-Atlas (Textur-Ordnung, nächster Texel von Stufe 0) gegen die Schwelle des Stoffs, Klingen
//     und Nadel-Röhren decken voll. Ein Pixel zählt einmal, wie oft es auch überdeckt wird — das ist das Bild.
//       bildDeckung(krone, atlas, px) → { je: [Fläche je Ansicht], mittel, hebung: [Mittel je Blick-Hebung 0°/30°/60°] }
//         krone: [{ kind, pos: Float32Array, idx: Uint32Array, uv: Float32Array|null }] (kroneAus)
//         atlas: { w, h, alpha: Uint8Array (w×h, Zeile 0 = v 0), schwelle: 0..1 }
//
// (2) DIE SCHWEBE — eine Karte ohne Träger. Befund (Prüfer W5, R2): die Nah-Krone strich Zweige unter 0,03·trunkR, ihre
//     Nadel-Karten schwebten ohne Zweig (Fichte 656 von 1406, Mammut 541 von 905), die Weiden-Strähnen hingen ohne
//     Peitsche in der Luft (593 von 677). Eine Karte HÄNGT, wenn die Rinde ihre innere Hälfte oder eine ihrer
//     Kanten-Mitten berührt, oder wenn sie an einer hängenden Karte hängt (die Strähne ist eine Kette: Mitten näher als
//     drei Viertel der halben Diagonalen). schwebe(meshes) → { karten, schwebend, beispiel }.
//
// (3) DER BODEN — kein Laub unter dem Boden der Vorlage (y < 0; die Strähnen hingen unter den Boden-Rand, R1).
//     unterBoden(krone) → tiefstes y des Laubs.
//
// (4) DIE LAGEN (S3, 09.10.) — wie viele Karten-Lagen ein Kronen-Pixel trägt. Befund (Späher S3 pflanzen, Kern
//     78d66a63): die Budget-Zeile war nur gegen die sättigende BINÄRE Deckung geeicht — die Eiche-L0 trug 1 280 Karten
//     mit der Kante 0,22 H, 40,8 Quad-Lagen je Kronen-Pixel; jede Lage wird alpha-getestet und schattiert, 65 % ihrer
//     Fragmente verwirft der Atlas (Kern-Füllung 0,347) — die GPU-Kosten der Krone ohne Bild. Gezählt in DENSELBEN 24
//     Ansichten wie die Bild-Deckung, je Pixel-Mitte jede Karte, die sie überdeckt (Quad-Lage), und jede, deren Atlas-
//     Alpha dort die Schwelle hält (Alpha-Lage); gemittelt über die Pixel mit mindestens einer Lage.
//       bildLagen(krone, atlas, px) → { quad, alpha, je: [{ quad, alpha }] }
//     bildAus(meshes) → die ganze Stufe als Bild (Krone UND Rinde: die Rinde deckt voll) — die L0-Deckungs-Tafel (D0).
"use strict";

const AZIMUTE = 8;
const HEBUNGEN = [0, Math.PI / 6, Math.PI / 3];
const ANSICHTEN = AZIMUTE * HEBUNGEN.length;

function bildDeckung(meshes, atlas, px) {
    const je = [];
    const thr = Math.round((atlas && atlas.schwelle != null ? atlas.schwelle : 0.5) * 255);
    for (let k = 0; k < ANSICHTEN; k++) {
        // r = horizontal quer zur Blickrichtung; u = Bild-Oben (senkrecht zu r und zum Blick, der um e nach oben zeigt)
        const th = ((k % AZIMUTE) * Math.PI) / AZIMUTE,
            e = HEBUNGEN[Math.floor(k / AZIMUTE)];
        const cx = Math.cos(th),
            cz = Math.sin(th);
        const ux = Math.sin(th) * Math.sin(e),
            uy = Math.cos(e),
            uz = -Math.cos(th) * Math.sin(e);
        // Ausdehnung der Ansicht
        let u0 = Infinity,
            u1 = -Infinity,
            v0 = Infinity,
            v1 = -Infinity;
        for (const m of meshes) {
            const p = m.pos;
            for (let i = 0; i < p.length; i += 3) {
                const u = p[i] * cx + p[i + 2] * cz,
                    v = p[i] * ux + p[i + 1] * uy + p[i + 2] * uz;
                if (u < u0) u0 = u;
                if (u > u1) u1 = u;
                if (v < v0) v0 = v;
                if (v > v1) v1 = v;
            }
        }
        if (!(u1 > u0) || !(v1 > v0)) {
            je.push(0);
            continue;
        }
        const W = Math.ceil((u1 - u0) / px) + 2,
            H = Math.ceil((v1 - v0) / px) + 2;
        const bild = new Uint8Array(W * H);
        for (const m of meshes) {
            const p = m.pos,
                ix = m.idx,
                karte = m.kind === "foliageTex" && m.uv && atlas;
            const uv = m.uv;
            for (let t = 0; t < ix.length; t += 3) {
                const a = ix[t],
                    b = ix[t + 1],
                    c = ix[t + 2];
                const ax = (p[a * 3] * cx + p[a * 3 + 2] * cz - u0) / px,
                    ay = (p[a * 3] * ux + p[a * 3 + 1] * uy + p[a * 3 + 2] * uz - v0) / px;
                const bx = (p[b * 3] * cx + p[b * 3 + 2] * cz - u0) / px,
                    by = (p[b * 3] * ux + p[b * 3 + 1] * uy + p[b * 3 + 2] * uz - v0) / px;
                const qx = (p[c * 3] * cx + p[c * 3 + 2] * cz - u0) / px,
                    qy = (p[c * 3] * ux + p[c * 3 + 1] * uy + p[c * 3 + 2] * uz - v0) / px;
                const fl = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
                if (Math.abs(fl) < 1e-12) continue;
                const xa = Math.max(0, Math.floor(Math.min(ax, bx, qx))),
                    xb = Math.min(W - 1, Math.ceil(Math.max(ax, bx, qx))),
                    ya = Math.max(0, Math.floor(Math.min(ay, by, qy))),
                    yb = Math.min(H - 1, Math.ceil(Math.max(ay, by, qy)));
                // DER BODEN (Gegenprüfung S3): das Bild ist, was über dem Boden der Vorlage steht (y ≥ 0) — die Wurzeln tauchen
                // ab, kein Spieler sieht sie im Boden, und eine Ansicht von unten sähe sie sonst von unter der Erde.
                const ya3 = p[a * 3 + 1],
                    yb3 = p[b * 3 + 1],
                    yc3 = p[c * 3 + 1];
                if (ya3 < 0 && yb3 < 0 && yc3 < 0) continue;
                const ganz = ya3 >= 0 && yb3 >= 0 && yc3 >= 0;
                for (let y = ya; y <= yb; y++) {
                    const sy = y + 0.5;
                    for (let x = xa; x <= xb; x++) {
                        const o = y * W + x;
                        if (bild[o]) continue;
                        const sx = x + 0.5;
                        const w0 = ((bx - sx) * (qy - sy) - (by - sy) * (qx - sx)) / fl,
                            w1 = ((qx - sx) * (ay - sy) - (qy - sy) * (ax - sx)) / fl,
                            w2 = 1 - w0 - w1;
                        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
                        if (!ganz && w0 * ya3 + w1 * yb3 + w2 * yc3 < 0) continue;
                        if (karte) {
                            const tu = w0 * uv[a * 2] + w1 * uv[b * 2] + w2 * uv[c * 2],
                                tv = w0 * uv[a * 2 + 1] + w1 * uv[b * 2 + 1] + w2 * uv[c * 2 + 1];
                            const tx = Math.min(atlas.w - 1, Math.max(0, Math.floor(tu * atlas.w))),
                                ty = Math.min(atlas.h - 1, Math.max(0, Math.floor(tv * atlas.h)));
                            if (atlas.alpha[ty * atlas.w + tx] < thr) continue;
                        }
                        bild[o] = 1;
                    }
                }
            }
        }
        let n = 0;
        for (let i = 0; i < bild.length; i++) n += bild[i];
        je.push(n * px * px);
    }
    return { je, mittel: je.reduce((s, x) => s + x, 0) / je.length, hebung: jeHebung(je) };
}
// Das Bild JE BLICK-HEBUNG (Gegenprüfung S3 R1, 09.10.): das Mittel über die acht Azimute je Hebung (0°, 30°, 60° von
// unten) — das Mittel über alle 24 Ansichten wog die Seitenansicht mit einem Drittel: die flachen Wedel der Koniferen
// deckten von unten 12–35 % mehr, als die Seitenansicht verlor (Tanne-L1 0° 0,70 des Bilds von V18.536, Mittel 0,93).
function jeHebung(je) {
    return HEBUNGEN.map((_, h) => je.slice(h * AZIMUTE, (h + 1) * AZIMUTE).reduce((s, x) => s + x, 0) / AZIMUTE);
}

// DIE LAGEN (4): dieselben Ansichten wie bildDeckung, aber jede Karte zählt — eine Lage je Karte über der Pixel-Mitte.
function bildLagen(meshes, atlas, px) {
    const je = [];
    const thr = Math.round((atlas && atlas.schwelle != null ? atlas.schwelle : 0.5) * 255);
    let sQ = 0,
        nQ = 0,
        sA = 0,
        nA = 0;
    for (let k = 0; k < ANSICHTEN; k++) {
        const th = ((k % AZIMUTE) * Math.PI) / AZIMUTE,
            e = HEBUNGEN[Math.floor(k / AZIMUTE)];
        const cx = Math.cos(th),
            cz = Math.sin(th);
        const ux = Math.sin(th) * Math.sin(e),
            uy = Math.cos(e),
            uz = -Math.cos(th) * Math.sin(e);
        let u0 = Infinity,
            u1 = -Infinity,
            v0 = Infinity,
            v1 = -Infinity;
        for (const m of meshes) {
            if (m.kind !== "foliageTex") continue;
            const p = m.pos;
            for (let i = 0; i < p.length; i += 3) {
                const u = p[i] * cx + p[i + 2] * cz,
                    v = p[i] * ux + p[i + 1] * uy + p[i + 2] * uz;
                if (u < u0) u0 = u;
                if (u > u1) u1 = u;
                if (v < v0) v0 = v;
                if (v > v1) v1 = v;
            }
        }
        if (!(u1 > u0) || !(v1 > v0)) {
            je.push({ quad: 0, alpha: 0 });
            continue;
        }
        const W = Math.ceil((u1 - u0) / px) + 2,
            H = Math.ceil((v1 - v0) / px) + 2;
        const quad = new Uint16Array(W * H),
            alpha = new Uint16Array(W * H);
        for (const m of meshes) {
            if (m.kind !== "foliageTex" || !m.uv) continue;
            const p = m.pos,
                ix = m.idx,
                uv = m.uv;
            for (let t = 0; t < ix.length; t += 3) {
                const a = ix[t],
                    b = ix[t + 1],
                    c = ix[t + 2];
                const ax = (p[a * 3] * cx + p[a * 3 + 2] * cz - u0) / px,
                    ay = (p[a * 3] * ux + p[a * 3 + 1] * uy + p[a * 3 + 2] * uz - v0) / px;
                const bx = (p[b * 3] * cx + p[b * 3 + 2] * cz - u0) / px,
                    by = (p[b * 3] * ux + p[b * 3 + 1] * uy + p[b * 3 + 2] * uz - v0) / px;
                const qx = (p[c * 3] * cx + p[c * 3 + 2] * cz - u0) / px,
                    qy = (p[c * 3] * ux + p[c * 3 + 1] * uy + p[c * 3 + 2] * uz - v0) / px;
                const fl = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
                if (Math.abs(fl) < 1e-12) continue;
                const xa = Math.max(0, Math.floor(Math.min(ax, bx, qx))),
                    xb = Math.min(W - 1, Math.ceil(Math.max(ax, bx, qx))),
                    ya = Math.max(0, Math.floor(Math.min(ay, by, qy))),
                    yb = Math.min(H - 1, Math.ceil(Math.max(ay, by, qy)));
                for (let y = ya; y <= yb; y++) {
                    const sy = y + 0.5;
                    for (let x = xa; x <= xb; x++) {
                        const sx = x + 0.5;
                        const w0 = ((bx - sx) * (qy - sy) - (by - sy) * (qx - sx)) / fl,
                            w1 = ((qx - sx) * (ay - sy) - (qy - sy) * (ax - sx)) / fl,
                            w2 = 1 - w0 - w1;
                        // die Diagonale eines Quads gehört EINEM seiner zwei Dreiecke (w2 > 0 halb offen)
                        if (w0 < 0 || w1 < 0 || w2 <= 0) continue;
                        const o = y * W + x;
                        quad[o]++;
                        if (atlas) {
                            const tu = w0 * uv[a * 2] + w1 * uv[b * 2] + w2 * uv[c * 2],
                                tv = w0 * uv[a * 2 + 1] + w1 * uv[b * 2 + 1] + w2 * uv[c * 2 + 1];
                            const tx = Math.min(atlas.w - 1, Math.max(0, Math.floor(tu * atlas.w))),
                                ty = Math.min(atlas.h - 1, Math.max(0, Math.floor(tv * atlas.h)));
                            if (atlas.alpha[ty * atlas.w + tx] >= thr) alpha[o]++;
                        }
                    }
                }
            }
        }
        let q = 0,
            nq = 0,
            al = 0,
            na = 0;
        for (let i = 0; i < quad.length; i++) {
            if (quad[i]) {
                q += quad[i];
                nq++;
            }
            if (alpha[i]) {
                al += alpha[i];
                na++;
            }
        }
        sQ += q;
        nQ += nq;
        sA += al;
        nA += na;
        je.push({ quad: nq ? q / nq : 0, alpha: na ? al / na : 0 });
    }
    return { quad: nQ ? sQ / nQ : 0, alpha: nA ? sA / nA : 0, je };
}

// Die ganze Stufe als Bild (D0): die Krone mit ihrer Atlas-Alpha, die Rinde (und jedes andere Teil) deckt voll.
function bildAus(meshes) {
    const dek = (b64, Typ) => {
        const b = Buffer.from(b64, "base64");
        return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
    };
    const out = [];
    for (const m of meshes || []) {
        if (!m.attrs || !m.attrs.position || !m.index) continue;
        out.push({
            kind: m.kind,
            pos: dek(m.attrs.position.b64, Float32Array),
            idx: dek(m.index, Uint32Array),
            uv: m.kind === "foliageTex" && m.attrs.uv ? dek(m.attrs.uv.b64, Float32Array) : null,
        });
    }
    return out;
}

// Jede zweite Karte fällt (Quads in Bau-Reihenfolge: 4 Ecken, 6 Indizes) — der Selbsttest der L0-Deckungs-Wand.
function kartenAusgeduennt(krone) {
    return krone.map((m) => {
        if (m.kind !== "foliageTex") return m;
        const idx = [];
        for (let t = 0; t + 6 <= m.idx.length; t += 12) for (let k = 0; k < 6; k++) idx.push(m.idx[t + k]);
        return Object.assign({}, m, { idx: Uint32Array.from(idx) });
    });
}

// Jede Karte n-fach (dieselbe Lage n-mal) — der Selbsttest der Lagen-Wand.
function kartenVervielfacht(krone, n) {
    return krone.map((m) => {
        if (m.kind !== "foliageTex") return m;
        const idx = new Uint32Array(m.idx.length * n);
        for (let k = 0; k < n; k++) idx.set(m.idx, k * m.idx.length);
        return Object.assign({}, m, { idx });
    });
}

// Die Krone einer gebauten Antwort (asset-worker-harness: Attribute als base64 des rohen Puffers): Klingen/Nadeln/
// Strähnen (foliage) und Karten (foliageTex) — die Rinde deckt nicht mit (die Deckung ist die der Krone).
function kroneAus(meshes) {
    const dek = (b64, Typ) => {
        const b = Buffer.from(b64, "base64");
        return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
    };
    const out = [];
    for (const m of meshes || []) {
        if ((m.kind !== "foliage" && m.kind !== "foliageTex") || !m.attrs || !m.attrs.position || !m.index) continue;
        out.push({
            kind: m.kind,
            pos: dek(m.attrs.position.b64, Float32Array),
            idx: dek(m.index, Uint32Array),
            uv: m.attrs.uv ? dek(m.attrs.uv.b64, Float32Array) : null,
        });
    }
    return out;
}

// Jede Karte (4 Ecken je Quad, in Bau-Reihenfolge) um ihre Mitte skaliert — der Selbsttest der Deckungs-Wand.
function kartenSkaliert(krone, f) {
    return krone.map((m) => {
        if (m.kind !== "foliageTex") return m;
        const p = Float32Array.from(m.pos);
        for (let q = 0; q + 12 <= p.length; q += 12)
            for (let k = 0; k < 3; k++) {
                const c = (p[q + k] + p[q + 3 + k] + p[q + 6 + k] + p[q + 9 + k]) / 4;
                for (let e = 0; e < 4; e++) p[q + e * 3 + k] = c + (p[q + e * 3 + k] - c) * f;
            }
        return Object.assign({}, m, { pos: p });
    });
}

// Die Rinde einer gebauten Antwort als Dreiecks-Liste (alles mit Fläche, das nicht Krone ist).
function rindeAus(meshes) {
    const dek = (b64, Typ) => {
        const b = Buffer.from(b64, "base64");
        return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
    };
    const tris = [];
    for (const m of meshes || []) {
        if (m.kind === "foliage" || m.kind === "foliageTex" || !m.attrs || !m.attrs.position || !m.index) continue;
        const p = dek(m.attrs.position.b64, Float32Array),
            ix = dek(m.index, Uint32Array);
        const v = (i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
        for (let t = 0; t < ix.length; t += 3) tris.push([v(ix[t]), v(ix[t + 1]), v(ix[t + 2])]);
    }
    return tris;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
// Nächster Punkt eines Dreiecks (Ericson, Real-Time Collision Detection 5.1.5).
function naechster(p, a, b, c) {
    const ab = sub(b, a),
        ac = sub(c, a),
        ap = sub(p, a);
    const d1 = dot(ab, ap),
        d2 = dot(ac, ap);
    if (d1 <= 0 && d2 <= 0) return a;
    const bp = sub(p, b),
        d3 = dot(ab, bp),
        d4 = dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) return b;
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        return [a[0] + ab[0] * v, a[1] + ab[1] * v, a[2] + ab[2] * v];
    }
    const cp = sub(p, c),
        d5 = dot(ab, cp),
        d6 = dot(ac, cp);
    if (d6 >= 0 && d5 <= d6) return c;
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6);
        return [a[0] + ac[0] * w, a[1] + ac[1] * w, a[2] + ac[2] * w];
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        return [b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w];
    }
    const den = 1 / (va + vb + vc),
        v = vb * den,
        w = vc * den;
    return [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];
}

function schwebe(meshes) {
    const rinde = rindeAus(meshes);
    const karten = [];
    for (const m of kroneAus(meshes)) {
        if (m.kind !== "foliageTex") continue;
        const p = m.pos;
        for (let q = 0; q + 12 <= p.length; q += 12) {
            const c = [0, 1, 2, 3].map((e) => [p[q + e * 3], p[q + e * 3 + 1], p[q + e * 3 + 2]]);
            const mi = [0, 1, 2].map((k) => (c[0][k] + c[1][k] + c[2][k] + c[3][k]) / 4);
            karten.push({ m: mi, h: Math.hypot(...sub(c[0], c[2])) / 2, c });
        }
    }
    if (!karten.length) return { karten: 0, schwebend: 0, beispiel: null };
    let ymin = Infinity,
        ymax = -Infinity;
    for (const t of rinde)
        for (const v of t) {
            if (v[1] < ymin) ymin = v[1];
            if (v[1] > ymax) ymax = v[1];
        }
    const H = rinde.length ? Math.max(1e-6, ymax - ymin) : 1,
        Z = H / 40,
        grid = new Map(),
        key = (x, y, z) => x + "," + y + "," + z;
    for (const t of rinde) {
        const lo = [0, 1, 2].map((k) => Math.floor(Math.min(t[0][k], t[1][k], t[2][k]) / Z));
        const hi = [0, 1, 2].map((k) => Math.floor(Math.max(t[0][k], t[1][k], t[2][k]) / Z));
        for (let x = lo[0]; x <= hi[0]; x++)
            for (let y = lo[1]; y <= hi[1]; y++)
                for (let z = lo[2]; z <= hi[2]; z++) {
                    const kk = key(x, y, z);
                    if (!grid.has(kk)) grid.set(kk, []);
                    grid.get(kk).push(t);
                }
    }
    const abstand = (p, rmax) => {
        let best = Infinity;
        const R = Math.ceil(rmax / Z),
            c = p.map((v) => Math.floor(v / Z));
        for (let x = c[0] - R; x <= c[0] + R; x++)
            for (let y = c[1] - R; y <= c[1] + R; y++)
                for (let z = c[2] - R; z <= c[2] + R; z++) {
                    const L = grid.get(key(x, y, z));
                    if (!L) continue;
                    for (const t of L) {
                        const q = naechster(p, t[0], t[1], t[2]);
                        const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
                        if (d < best) best = d;
                    }
                }
        return best;
    };
    const fest = karten.map((k) => {
        if (abstand(k.m, k.h * 0.5) <= k.h * 0.5) return true;
        const tol = Math.max(k.h * 0.15, H * 0.003);
        // die Kante berührt die Rinde: ihre Mitte — und (S3, 09.10.) acht weitere Proben je Kante: der Wedel tritt aus dem
        // offenen Ende seiner Röhre, seine Ansatz-Kante kreuzt die Röhren-Wand, ihre Mitte liegt auf der Achse (r entfernt)
        for (let e = 0; e < 4; e++) {
            const A = k.c[e],
                B = k.c[(e + 1) % 4];
            for (const t of [0.5, 0.0625, 0.1875, 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.9375])
                if (abstand([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t], tol) <= tol)
                    return true;
        }
        return false;
    });
    // Ketten: eine Karte hängt an einer hängenden Karte (Raster der Mitten, Nachbarzellen).
    const ZK = Math.max(...karten.map((k) => k.h)) * 1.5,
        G2 = new Map();
    karten.forEach((k, i) => {
        const kk = k.m.map((v) => Math.floor(v / ZK)).join(",");
        if (!G2.has(kk)) G2.set(kk, []);
        G2.get(kk).push(i);
    });
    const offen = [];
    fest.forEach((f, i) => f && offen.push(i));
    while (offen.length) {
        const j = offen.pop(),
            kj = karten[j],
            c = kj.m.map((v) => Math.floor(v / ZK));
        for (let x = c[0] - 1; x <= c[0] + 1; x++)
            for (let y = c[1] - 1; y <= c[1] + 1; y++)
                for (let z = c[2] - 1; z <= c[2] + 1; z++)
                    for (const i of G2.get(x + "," + y + "," + z) || []) {
                        if (fest[i]) continue;
                        // S3 (09.10.): eine Kanten-Mitte der Karte liegt IN der hängenden Karte (die Glieder einer Strähne
                        // überlappen je ein Zehntel — der Wedel teilt seine Bahn in Stücke von Nadel-Maß, schmaler als die
                        // Mitten-Regel reicht)
                        const ki = karten[i];
                        let haengt = Math.hypot(...sub(ki.m, kj.m)) < (ki.h + kj.h) * 0.75;
                        const tol = Math.max(ki.h * 0.15, H * 0.003);
                        for (let e = 0; e < 4 && !haengt; e++) {
                            const A = ki.c[e],
                                B = ki.c[(e + 1) % 4];
                            const mi = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
                            for (const [a, b, c2] of [
                                [kj.c[0], kj.c[1], kj.c[2]],
                                [kj.c[0], kj.c[2], kj.c[3]],
                            ]) {
                                const q = naechster(mi, a, b, c2);
                                if (Math.hypot(mi[0] - q[0], mi[1] - q[1], mi[2] - q[2]) <= tol) haengt = true;
                            }
                        }
                        if (haengt) {
                            fest[i] = true;
                            offen.push(i);
                        }
                    }
    }
    let schwebend = 0,
        beispiel = null;
    fest.forEach((f, i) => {
        if (f) return;
        schwebend++;
        if (!beispiel) beispiel = karten[i].m.map((v) => +v.toFixed(3));
    });
    return { karten: karten.length, schwebend, beispiel };
}

function unterBoden(krone) {
    let y = Infinity;
    for (const m of krone) for (let i = 1; i < m.pos.length; i += 3) if (m.pos[i] < y) y = m.pos[i];
    return y;
}

module.exports = {
    bildDeckung,
    bildLagen,
    bildAus,
    kroneAus,
    kartenSkaliert,
    kartenAusgeduennt,
    kartenVervielfacht,
    schwebe,
    unterBoden,
    ANSICHTEN,
    AZIMUTE,
    HEBUNGEN,
};

