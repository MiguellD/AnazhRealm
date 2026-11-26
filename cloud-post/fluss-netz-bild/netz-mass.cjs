"use strict";
// Täter-Zahl des Flussnetzes (fluss-netz): je Saat die Heim-Region der Hydrosphäre (der echte Wirt der Klasse im vm, Boden
// `_voxelSurfaceY` ohne Kanal — wie der Faden sie rechnet) und ihre Maße: Stern-Knoten, längste Gerade, Strahler, Hack, Mündung,
// das Maß der Station kohaerenz#1.
//   node netz-mass.cjs <root> [--saaten N] [--fäden 4] [--json out.json] [--kacheln 1|3]
const path = require("path");
const fs = require("fs");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const MASS = Object.freeze({ punkte: 50, tolM: 0.05, soll: 0.95 });
function stationMass(rivers, yAn) {
    const rv = (rivers || []).filter((v) => v.points && v.points.length >= 3);
    const y = yAn || ((p) => (Number.isFinite(p.voxelY) ? p.voxelY : p.y));
    const paare = [];
    for (const v of rv) for (let i = 0; i + 1 < v.points.length; i++) paare.push([v.points[i], v.points[i + 1], !!v.mouth]);
    const schritt = Math.max(1, Math.floor(paare.length / MASS.punkte));
    const wahl = paare.filter((_, i) => i % schritt === 0).slice(0, MASS.punkte);
    const ab = (p, q) => y(q) <= y(p) + MASS.tolM;
    // alle Paare (nicht nur die 50 der Stichprobe): wie viele steigen
    let steigt = 0;
    let steigtMax = 0;
    for (const [p, q] of paare) {
        const d = y(q) - y(p);
        if (d > MASS.tolM) {
            steigt++;
            if (d > steigtMax) steigtMax = d;
        }
    }
    const muendung = {};
    for (const v of rv) muendung[v.mouth] = (muendung[v.mouth] || 0) + 1;
    return { n: wahl.length, vor: wahl.filter(([p, q, e]) => ab(p, q) && e).length, fluesse: rv.length, muendung, paare: paare.length, steigt, steigtMax };
}

// DER GRAPH der gezeichneten Läufe: Punkte nach Lage (cm), Kanten je Folge; ein Zufluss (mouth "zufluss") endet auf der Bahn
// seines Hauptlaufs — sein Ende mündet in den nächsten Punkt eines anderen Laufs (≤ 1,5 Zellen).
function graph(rivers, zelle) {
    const K = (p) => Math.round(p.x * 100) + "," + Math.round(p.z * 100);
    const P = new Map(); // key -> {x,z,w,q,ab:Set,von:Set}
    const knoten = (p) => {
        const k = K(p);
        let n = P.get(k);
        if (!n) {
            n = { k, x: p.x, z: p.z, w: p.width, q: p.quelle, ab: new Set(), von: new Set(), lauf: new Set() };
            P.set(k, n);
        }
        return n;
    };
    const rv = rivers.filter((v) => v.points && v.points.length >= 2);
    rv.forEach((v, ri) => {
        let a = null;
        for (const p of v.points) {
            const b = knoten(p);
            b.lauf.add(ri);
            if (a && a !== b) {
                a.ab.add(b.k);
                b.von.add(a.k);
            }
            a = b;
        }
    });
    // Zuflüsse an die Bahn des Hauptlaufs heften
    const raster = new Map();
    const rk = (x, z) => Math.floor(x / zelle) + "," + Math.floor(z / zelle);
    for (const n of P.values()) {
        const k = rk(n.x, n.z);
        if (!raster.has(k)) raster.set(k, []);
        raster.get(k).push(n);
    }
    rv.forEach((v, ri) => {
        if (v.mouth !== "zufluss") return;
        const e = P.get(K(v.points[v.points.length - 1]));
        if (e.ab.size) return;
        let best = null;
        let bd = 1.5 * zelle;
        const ci = Math.floor(e.x / zelle);
        const cj = Math.floor(e.z / zelle);
        for (let dj = -2; dj <= 2; dj++)
            for (let di = -2; di <= 2; di++)
                for (const n of raster.get(ci + di + "," + (cj + dj)) || []) {
                    if (n === e || n.lauf.has(ri)) continue;
                    const d = Math.hypot(n.x - e.x, n.z - e.z);
                    if (d < bd) {
                        bd = d;
                        best = n;
                    }
                }
        if (best) {
            e.ab.add(best.k);
            best.von.add(e.k);
            e.anHaupt = bd;
        }
    });
    return P;
}

// DER GENAUE GRAPH: ein Zufluss-Ende heftet am LOT auf die nächste Kante eines anderen Laufs (ein eingefügter Punkt), nicht am
// nächsten Punkt — zwei Mündungen in einer Bahn-Zelle (16 m) sind zwei Orte. Ein Stern: in der Scheibe der Breite des Hauptlaufs
// (≥ 2 m) um einen Zusammenfluss treten ≥ 3 Läufe ein.
function graphGenau(rivers, zelle) {
    const K = (x, z) => Math.round(x * 100) + "," + Math.round(z * 100);
    const P = new Map();
    const knoten = (x, z, w) => {
        const k = K(x, z);
        let n = P.get(k);
        if (!n) {
            n = { k, x, z, w, ab: new Set(), von: new Set(), lauf: new Set() };
            P.set(k, n);
        }
        return n;
    };
    const rv = rivers.filter((v) => v.points && v.points.length >= 2);
    rv.forEach((v, ri) => {
        let a = null;
        for (const p of v.points) {
            const b = knoten(p.x, p.z, p.width);
            b.lauf.add(ri);
            if (a && a !== b) {
                a.ab.add(b.k);
                b.von.add(a.k);
            }
            a = b;
        }
    });
    // die Kanten im Raster
    const raster = new Map();
    const rk = (i, j) => i + "," + j;
    const kanten = [];
    for (const a of P.values())
        for (const bk of a.ab) {
            const b = P.get(bk);
            const e = { a, b };
            kanten.push(e);
            const i0 = Math.floor(Math.min(a.x, b.x) / zelle), i1 = Math.floor(Math.max(a.x, b.x) / zelle);
            const j0 = Math.floor(Math.min(a.z, b.z) / zelle), j1 = Math.floor(Math.max(a.z, b.z) / zelle);
            for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
                const k = rk(i, j);
                if (!raster.has(k)) raster.set(k, []);
                raster.get(k).push(e);
            }
        }
    const einfuegen = [];
    rv.forEach((v, ri) => {
        if (v.mouth !== "zufluss") return;
        const p = v.points[v.points.length - 1];
        const e0 = P.get(K(p.x, p.z));
        if (e0.ab.size) return;
        let best = null;
        let bd = 1.5 * zelle;
        const ci = Math.floor(p.x / zelle), cj = Math.floor(p.z / zelle);
        for (let dj = -2; dj <= 2; dj++)
            for (let di = -2; di <= 2; di++)
                for (const e of raster.get(rk(ci + di, cj + dj)) || []) {
                    // nie in den eigenen (geteilten) Lauf: jede Kante, deren Enden einen Lauf des Endes tragen
                    let eigen = false;
                    for (const l of e0.lauf) if (e.a.lauf.has(l) || e.b.lauf.has(l)) eigen = true;
                    if (eigen) continue;
                    const ex = e.b.x - e.a.x, ez = e.b.z - e.a.z;
                    const l2 = ex * ex + ez * ez || 1;
                    let u = ((p.x - e.a.x) * ex + (p.z - e.a.z) * ez) / l2;
                    u = u < 0 ? 0 : u > 1 ? 1 : u;
                    const qx = e.a.x + ex * u, qz = e.a.z + ez * u;
                    const d = Math.hypot(qx - p.x, qz - p.z);
                    if (d < bd) {
                        bd = d;
                        best = { e, u, qx, qz };
                    }
                }
        if (best) einfuegen.push({ e0, ...best, d: bd });
    });
    for (const f of einfuegen) {
        const { e, u } = f;
        let T;
        if (u <= 1e-6) T = e.a;
        else if (u >= 1 - 1e-6) T = e.b;
        else {
            T = knoten(f.qx, f.qz, e.a.w + (e.b.w - e.a.w) * u);
            for (const l of e.a.lauf) if (e.b.lauf.has(l)) T.lauf.add(l);
            // die Kante a→b teilt sich (eine zweite Einfügung auf derselben Kante heftet an die Teilkante: genügt der Zählung)
            if (e.a.ab.has(e.b.k)) {
                e.a.ab.delete(e.b.k);
                e.b.von.delete(e.a.k);
                e.a.ab.add(T.k);
                T.von.add(e.a.k);
                T.ab.add(e.b.k);
                e.b.von.add(T.k);
            }
        }
        f.e0.ab.add(T.k);
        T.von.add(f.e0.k);
        f.e0.anHaupt = f.d;
    }
    return P;
}
function sterneGenau(P) {
    let streng = 0;
    let eng = 0;
    const alle = [...P.values()];
    const raster = new Map();
    for (const n of alle) {
        const k = Math.floor(n.x / 8) + "," + Math.floor(n.z / 8);
        if (!raster.has(k)) raster.set(k, []);
        raster.get(k).push(n);
    }
    const gezaehlt = new Set();
    // Kanten der Länge 0 (ein Lauf-Ende auf seinem eigenen Punkt) sind keine Zuflüsse
    const zu = (m) => [...m.von].filter((k) => { const v = P.get(k); return Math.hypot(v.x - m.x, v.z - m.z) > 0.05; }).length;
    for (const m of alle) {
        if (zu(m) >= 3) streng++;
        if (m.von.size < 2 || gezaehlt.has(m.k)) continue;
        const R = Math.max(2, m.w || 0);
        const nah = [];
        const ci = Math.floor(m.x / 8), cj = Math.floor(m.z / 8);
        const r = Math.ceil(R / 8);
        for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) for (const n of raster.get(ci + di + "," + (cj + dj)) || []) if (Math.hypot(n.x - m.x, n.z - m.z) <= R) nah.push(n);
        const drin = new Set(nah.map((n) => n.k));
        let ein = 0;
        for (const n of nah) for (const vk of n.von) if (!drin.has(vk)) ein++;
        if (ein >= 3) {
            eng++;
            for (const n of nah) if (n.von.size >= 2) gezaehlt.add(n.k);
        }
    }
    return { streng, eng };
}
// STERN-KNOTEN: (a) streng — ein Punkt mit ≥ 3 Zuflüssen; (b) im Umkreis R — die Läufe, die in die Scheibe um eine Mündung
// eintreten (Kante von außen nach innen), ≥ 3.
function sterne(P, R) {
    let streng = 0;
    let mund = 0;
    const muendungen = [];
    for (const n of P.values()) {
        if (n.von.size >= 2) {
            mund++;
            muendungen.push(n);
        }
        if (n.von.size >= 3) streng++;
    }
    // Scheiben-Zählung, Cluster: jede Mündung zählt die eintretenden Kanten in ihre Scheibe; ein Stern ist ein Cluster mit ≥ 3
    let imUmkreis = 0;
    let groesster = 0;
    const gezaehlt = new Set();
    for (const m of muendungen) {
        if (gezaehlt.has(m.k)) continue;
        let ein = 0;
        const drin = (n) => Math.hypot(n.x - m.x, n.z - m.z) <= R;
        const nah = [];
        for (const n of P.values()) if (drin(n)) nah.push(n);
        for (const n of nah)
            for (const vk of n.von) {
                const v = P.get(vk);
                if (!drin(v)) ein++;
            }
        if (ein >= 3) {
            imUmkreis++;
            for (const n of nah) if (n.von.size >= 2) gezaehlt.add(n.k);
        }
        if (ein > groesster) groesster = ein;
    }
    return { mund, streng, imUmkreis, groesster };
}

// DIE LÄNGSTE GERADE je Lauf: die längste Folge von Punkten, die alle in der halben Breite ihrer Sehne liegen (man legt eine
// Gerade ins Gerinne) — in m und in Gerinne-Breiten.
function gerade(v) {
    const p = v.points;
    let bestM = 0;
    let bestW = 0;
    for (let i = 0; i < p.length - 1; i++) {
        for (let j = i + 1; j < p.length; j++) {
            const ex = p[j].x - p[i].x;
            const ez = p[j].z - p[i].z;
            const L = Math.hypot(ex, ez);
            if (!(L > 0)) continue;
            let ok = true;
            for (let k = i + 1; k < j; k++) {
                const tol = Math.max(0.5, 0.5 * p[k].width);
                const d = Math.abs((p[k].x - p[i].x) * ez - (p[k].z - p[i].z) * ex) / L;
                if (d > tol) {
                    ok = false;
                    break;
                }
            }
            if (!ok) break;
            if (L > bestM) bestM = L;
            let w = 0;
            for (let k = i; k <= j; k++) w += p[k].width;
            w /= j - i + 1;
            if (L / w > bestW) bestW = L / w;
        }
    }
    return { m: bestM, w: bestW, achse: achse(v) };
}
// DIE ACHSEN-GERADE (fluss-netz): die längste Folge, deren Punkte alle binnen max(½ Breite, 2 % der Sehne) an ihr liegen —
// das Lineal, das das Auge sieht (ein Mini-Mäander von 2,4 m auf 300 m ist gerade), in m und Breiten.
function achse(v) {
    const p = v.points;
    let bestM = 0;
    let bestW = 0;
    let i = 0;
    while (i < p.length - 1) {
        let jOk = i + 1;
        for (let j = i + 2; j < p.length; j++) {
            const ex = p[j].x - p[i].x;
            const ez = p[j].z - p[i].z;
            const L = Math.hypot(ex, ez);
            let ok = L > 0;
            for (let k = i + 1; k < j && ok; k++) {
                const tol = Math.max(0.5 * p[k].width, 0.02 * L);
                if (Math.abs((p[k].x - p[i].x) * ez - (p[k].z - p[i].z) * ex) / L > tol) ok = false;
            }
            if (ok) jOk = j;
            if (j - i > 260) break;
        }
        const L = Math.hypot(p[jOk].x - p[i].x, p[jOk].z - p[i].z);
        let w = 0;
        for (let k = i; k <= jOk; k++) w += p[k].width;
        w /= jOk - i + 1;
        if (L > bestM) bestM = L;
        if (L / w > bestW) bestW = L / w;
        i++;
    }
    return { m: bestM, w: bestW };
}
// DIE REGEL DER BÖGEN: die Abstände der Wendepunkte (Vorzeichen-Wechsel der Richtungs-Änderung, |Δθ| > 0,02) in Breiten —
// ein Sinus fester Wellenlänge streut wenig (VK klein), ein Fluss viel.
function boegen(v) {
    const p = v.points;
    const halb = [];
    let vz = 0;
    let s = 0;
    let s0 = null;
    for (let k = 1; k + 1 < p.length; k++) {
        s += Math.hypot(p[k].x - p[k - 1].x, p[k].z - p[k - 1].z);
        const a = Math.atan2(p[k].z - p[k - 1].z, p[k].x - p[k - 1].x);
        const b = Math.atan2(p[k + 1].z - p[k].z, p[k + 1].x - p[k].x);
        let d = b - a;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        if (Math.abs(d) < 0.02) continue;
        const z = d > 0 ? 1 : -1;
        if (vz && z !== vz) {
            if (s0 != null) halb.push((s - s0) / Math.max(1, p[k].width));
            s0 = s;
        }
        vz = z;
    }
    return halb;
}

// STRAHLER/HORTON über den Graph: Ordnung je Punkt; ein Strom = die maximale Kette gleicher Ordnung.
function horton(P, opt = {}) {
    const ord = new Map();
    const ein = new Map();
    for (const n of P.values()) ein.set(n.k, n.von.size);
    const reihe = [];
    for (const n of P.values()) if (n.von.size === 0) reihe.push(n.k);
    const topo = [];
    const rest = new Map(ein);
    while (reihe.length) {
        const k = reihe.pop();
        topo.push(k);
        for (const b of P.get(k).ab) {
            rest.set(b, rest.get(b) - 1);
            if (rest.get(b) === 0) reihe.push(b);
        }
    }
    // bekannt: ein Knoten, dessen ganzer Oberlauf an echten Quellen beginnt (nie am Rand der Region) — nur dort ist die
    // Ordnung die des Netzes
    const bekannt = new Set();
    for (const k of topo) {
        const n = P.get(k);
        if (!n.von.size ? n.q < 1 : [...n.von].every((v) => bekannt.has(v))) bekannt.add(k);
    }
    for (const k of topo) {
        const n = P.get(k);
        if (!n.von.size) {
            ord.set(k, 1);
            continue;
        }
        const o = [...n.von].map((v) => ord.get(v) || 1).sort((a, b) => b - a);
        ord.set(k, o.length >= 2 && o[0] === o[1] ? o[0] + 1 : o[0]);
    }
    // Ströme: Kanten a->b mit ord(a) == ord(b) setzen den Strom fort; ein Strom beginnt, wo kein Vorgänger gleicher Ordnung
    const N = {};
    const Lsum = {};
    for (const k of topo) {
        const n = P.get(k);
        const o = ord.get(k);
        const gleich = [...n.von].some((v) => ord.get(v) === o);
        if (!gleich && (!opt.bekannt || bekannt.has(k))) {
            // ein neuer Strom der Ordnung o: seine Länge stromab bis zur Ordnung > o
            N[o] = (N[o] || 0) + 1;
            let L = 0;
            let c = n;
            for (let g = 0; g < 100000; g++) {
                const b = [...c.ab][0];
                if (!b) break;
                const nb = P.get(b);
                L += Math.hypot(nb.x - c.x, nb.z - c.z);
                if (ord.get(b) !== o) break;
                c = nb;
            }
            Lsum[o] = (Lsum[o] || 0) + L;
        }
    }
    return { N, Lsum, max: Math.max(0, ...Object.keys(N).map(Number)) };
}
function verhaeltnis(N, Lsum) {
    const os = Object.keys(N)
        .map(Number)
        .sort((a, b) => a - b);
    const fit = (ys) => {
        const xs = os.filter((o) => ys(o) > 0);
        if (xs.length < 2) return NaN;
        const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
        const my = xs.reduce((a, o) => a + Math.log(ys(o)), 0) / xs.length;
        let sxy = 0;
        let sxx = 0;
        for (const o of xs) {
            sxy += (o - mx) * (Math.log(ys(o)) - my);
            sxx += (o - mx) * (o - mx);
        }
        return Math.exp(sxy / sxx);
    };
    return { RB: 1 / fit((o) => N[o]), RL: fit((o) => Lsum[o] / N[o]) };
}

// HACK: an jedem Punkt, dessen ganzer Oberlauf in der Region beginnt (an Quellen, nie am Rand), die Länge des längsten Laufs
// stromauf L und das Einzugsgebiet A (aus der Voll-Breite: Kern `flussBreite` umgekehrt) — der Exponent h in L ∝ A^h.
function hack(P, topo, FB) {
    const Lup = new Map();
    const voll = new Map();
    const pts = [];
    const reihe = [];
    const rest = new Map();
    for (const n of P.values()) {
        rest.set(n.k, n.von.size);
        if (!n.von.size) reihe.push(n.k);
    }
    while (reihe.length) {
        const k = reihe.pop();
        const n = P.get(k);
        let L = 0;
        let ok = true;
        if (!n.von.size) ok = n.q < 1; // eine echte Quelle (das Rinnsal beginnt hier), nicht der Rand
        for (const vk of n.von) {
            const v = P.get(vk);
            const lv = Lup.get(vk);
            if (lv == null) ok = false;
            else L = Math.max(L, lv + Math.hypot(n.x - v.x, n.z - v.z));
        }
        if (ok) Lup.set(k, L);
        if (ok && n.q >= 1 && L > 0) {
            const A = Math.pow(Math.max(1e-9, (n.w - FB.min) / FB.k), 1 / FB.exp); // km²
            pts.push([Math.log(A), Math.log(L / 1000)]);
        }
        for (const b of n.ab) {
            rest.set(b, rest.get(b) - 1);
            if (rest.get(b) === 0) reihe.push(b);
        }
    }
    return pts;
}
// HACK AM NETZ DES KERNS: je Knoten das Einzugsgebiet des Kerns (`knotenA` · Kante², das Glied trägt es als A) und die Länge
// des längsten Laufs bis zur Quelle (Bogen der Bahn; Zuflüsse, die auf einer Bahn münden, am Ort ihrer Mündung) — nur Läufe
// aus einer echten Quelle (ein Lauf vom Rand der Reichweite hat keine bekannte Länge).
function hackNetz(G, L) {
    const la = G.flussLaeufe(L, -1024, -1024, 1024, 1024, 16);
    const gl = [];
    for (const l of la)
        l.glieder.forEach((g, i) => {
            g.lauf = l;
            g.prev = i ? l.glieder[i - 1] : null;
            g.len = g.bahn[g.bahn.length - 1].s;
            g.zu = [];
            gl.push(g);
        });
    const hash = new Map();
    const key = (x, z) => Math.floor(x / 8) + "," + Math.floor(z / 8);
    for (const g of gl)
        for (const p of g.bahn) {
            const k = key(p.x, p.z);
            if (!hash.has(k)) hash.set(k, []);
            hash.get(k).push([g, p]);
        }
    for (const l of la) {
        if (l.ende !== "muendung") continue;
        const e = l.glieder[l.glieder.length - 1];
        let best = null;
        let bd = 2;
        for (let di = -1; di <= 1; di++)
            for (let dj = -1; dj <= 1; dj++)
                for (const [g, p] of hash.get(Math.floor(e.bx / 8) + di + "," + (Math.floor(e.bz / 8) + dj)) || []) {
                    if (g.lauf === l) continue;
                    const d = Math.hypot(p.x - e.bx, p.z - e.bz);
                    if (d < bd) {
                        bd = d;
                        best = [g, p.t];
                    }
                }
        if (best) best[0].zu.push([e, best[1]]);
    }
    const memo = new Map();
    const lEnd = (g) => {
        if (memo.has(g)) return memo.get(g);
        memo.set(g, NaN);
        const s = lStart(g);
        let v = s + g.len;
        for (const [e, tc] of g.zu) {
            const u = lEnd(e) + (1 - tc) * g.len;
            if (u > v || v !== v) v = u === u ? Math.max(u, v === v ? v : -1) : v;
        }
        memo.set(g, v);
        return v;
    };
    const lStart = (g) => (g.prev ? lEnd(g.prev) : g.lauf.quelle ? 0 : NaN);
    const pts = [];
    for (const g of gl) {
        const s = lStart(g);
        if (s > 0 && g.A > 0) pts.push([Math.log(g.A / 1e6), Math.log(s / 1000)]);
    }
    return pts;
}
function regression(pts) {
    if (pts.length < 3) return { h: NaN, n: pts.length };
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    for (const p of pts) {
        sxy += (p[0] - mx) * (p[1] - my);
        sxx += (p[0] - mx) ** 2;
        syy += (p[1] - my) ** 2;
    }
    return { h: sxy / sxx, c: Math.exp(my - (sxy / sxx) * mx), r2: (sxy * sxy) / (sxx * syy), n: pts.length };
}

function misst(root, saaten, opt) {
    const { AnazhRealm: A, ctx } = require(path.join(root, "scripts/lib/stamm.cjs")).ladeKlasse(root);
    const G = ctx.__gelaendeCore;
    const FB = G.FLUSS_BREITE || { min: 2, k: 4.7, exp: 0.37 };
    const H = A.HYDROSPHERE;
    const aus = [];
    for (const saat of saaten) {
        const w = Object.create(A.prototype);
        w.state = { worldMeta: { seed: saat }, terrainBaseHeight: G.GRUND.basis, waterLevel: G.GRUND.basis - G.GRUND.meerUnterBasis };
        w.journalAppend = () => {};
        w.worldsIndexUpsert = () => {};
        w.ensureWorldMeta();
        const L = w._gelaende();
        L.hydroComputing = true;
        const rivers = [];
        let ms = 0;
        const k = opt.kacheln || 1;
        const half = H.regionSize / 2;
        try {
            for (let rx = -(k >> 1); rx <= k >> 1; rx++)
                for (let rz = -(k >> 1); rz <= k >> 1; rz++) {
                    const t0 = process.hrtime.bigint();
                    const origin = rx || rz ? { x: rx * H.regionSize - half, z: rz * H.regionSize - half } : null;
                    const h = G.hydrosphaere(L, H, (x, z) => w._voxelSurfaceY(x, z), origin);
                    ms += Number(process.hrtime.bigint() - t0) / 1e6;
                    if (!rx && !rz) Object.assign(aus, { heim: h });
                    for (const v of h.rivers) rivers.push(v);
                }
        } finally {
            delete L.hydroComputing;
        }
        const heim = aus.heim;
        delete aus.heim;
        const roh = stationMass(heim.rivers);
        // DIE STATION LIEST DIE GEBAUTE WELT: die Hydrosphäre steht, `_voxelSurfaceY` trägt ihren Kanal (dichteSpalte)
        w.state.hydrosphere = heim;
        w._spalten = null;
        const st = stationMass(heim.rivers, (p) => w._voxelSurfaceY(p.x, p.z));
        st.roh = { vor: roh.vor, n: roh.n, steigt: roh.steigt, steigtMax: roh.steigtMax };
        const P = graph(rivers, H.cell);
        const s = sterne(P, 32);
        Object.assign(s, { genau: sterneGenau(graphGenau(rivers, H.cell)) });
        const g = heim.rivers.filter((v) => v.points.length >= 2).map(gerade);
        const bo = heim.rivers.filter((v) => v.points.length >= 3).flatMap(boegen);
        const ho = horton(P);
        const hb = horton(P, { bekannt: true });
        const hk = hack(P, null, FB);
        const hn = hackNetz(G, L);
        aus.push({
            saat,
            ms,
            st,
            sterne: s,
            gerade: g,
            boegen: bo,
            horton: ho,
            hortonBekannt: hb,
            hack: hk,
            hackNetz: hn,
            laeufe: heim.rivers.length,
        });
    }
    return aus;
}

if (require.main !== module && isMainThread) {
    module.exports = { graph, graphGenau, sterneGenau, sterne, gerade, achse, boegen, horton, verhaeltnis, hack, regression, stationMass };
} else if (!isMainThread) {
    parentPort.postMessage(misst(workerData.root, workerData.saaten, workerData.opt));
} else {
    const arg = (n, d) => {
        const i = process.argv.indexOf(n);
        return i > 0 ? process.argv[i + 1] : d;
    };
    const root = path.resolve(process.argv[2] || ".");
    const N = Number(arg("--saaten", 100));
    const F = Number(arg("--faeden", 4));
    const opt = { kacheln: Number(arg("--kacheln", 1)) };
    const saaten = ["anazh-realm-seed", ...Array.from({ length: N }, (_, i) => "same-saat-" + i)];
    const teile = Array.from({ length: F }, () => []);
    saaten.forEach((s, i) => teile[i % F].push(s));
    const t0 = Date.now();
    Promise.all(
        teile.map(
            (t) =>
                new Promise((res, rej) => {
                    const wk = new Worker(__filename, { workerData: { root, saaten: t, opt } });
                    wk.on("message", res);
                    wk.on("error", rej);
                })
        )
    ).then((teil) => {
        const je = teil.flat().sort((a, b) => saaten.indexOf(a.saat) - saaten.indexOf(b.saat));
        const sum = (f) => je.reduce((a, m) => a + f(m), 0);
        const n = sum((m) => m.st.n);
        const vor = sum((m) => m.st.vor);
        const lebt = je.filter((m) => m.st.n >= MASS.punkte && m.st.vor / m.st.n >= MASS.soll).length;
        const mu = {};
        for (const m of je) for (const k in m.st.muendung) mu[k] = (mu[k] || 0) + m.st.muendung[k];
        const laeufe = Object.values(mu).reduce((a, b) => a + b, 0);
        const ger = je.flatMap((m) => m.gerade);
        const gm = ger.map((g) => g.m).sort((a, b) => a - b);
        const gw = ger.map((g) => g.w).sort((a, b) => a - b);
        const q = (a, f) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
        const NN = {};
        const LL = {};
        for (const m of je)
            for (const o in m.horton.N) {
                NN[o] = (NN[o] || 0) + m.horton.N[o];
                LL[o] = (LL[o] || 0) + m.horton.Lsum[o];
            }
        const vh = verhaeltnis(NN, LL);
        const hk = regression(je.flatMap((m) => m.hack));
        const ms = je.map((m) => m.ms).sort((a, b) => a - b);
        const bericht = {
            saaten: je.length,
            station: { lebt, vor, n, anteil: vor / n, paare: sum((m) => m.st.paare), steigt: sum((m) => m.st.steigt), steigtMax: Math.max(...je.map((m) => m.st.steigtMax)) },
            ohneKanal: {
                lebt: je.filter((m) => m.st.roh.n >= MASS.punkte && m.st.roh.vor / m.st.roh.n >= MASS.soll).length,
                vor: sum((m) => m.st.roh.vor),
                n: sum((m) => m.st.roh.n),
                steigt: sum((m) => m.st.roh.steigt),
                steigtMax: Math.max(...je.map((m) => m.st.roh.steigtMax)),
            },
            muendung: mu,
            randAnteil: (mu.border || 0) / laeufe,
            sterne: {
                muendungen: sum((m) => m.sterne.mund),
                streng: sum((m) => m.sterne.streng),
                imUmkreis32: sum((m) => m.sterne.imUmkreis),
                saatenMitStern: je.filter((m) => m.sterne.imUmkreis > 0).length,
                groesster: Math.max(...je.map((m) => m.sterne.groesster)),
                genauStreng: sum((m) => m.sterne.genau.streng),
                genauEng: sum((m) => m.sterne.genau.eng),
                saatenGenauEng: je.filter((m) => m.sterne.genau.eng > 0).length,
            },
            gerade: { laeufe: ger.length, p50m: q(gm, 0.5), p90m: q(gm, 0.9), maxM: gm[gm.length - 1], p50w: q(gw, 0.5), p90w: q(gw, 0.9), maxW: gw[gw.length - 1], ueber10w: gw.filter((x) => x > 10).length },
            achse: (() => {
                const am = ger.map((g) => g.achse.m).sort((a, b) => a - b);
                const aw = ger.map((g) => g.achse.w).sort((a, b) => a - b);
                return { p50m: q(am, 0.5), p90m: q(am, 0.9), maxM: am[am.length - 1], p50w: q(aw, 0.5), p90w: q(aw, 0.9), maxW: aw[aw.length - 1], ueber10w: aw.filter((x) => x > 10).length, ueber20w: aw.filter((x) => x > 20).length };
            })(),
            boegen: (() => {
                const b = je.flatMap((m) => m.boegen);
                const mu = b.reduce((a, x) => a + x, 0) / Math.max(1, b.length);
                const sd = Math.sqrt(b.reduce((a, x) => a + (x - mu) * (x - mu), 0) / Math.max(1, b.length));
                return { n: b.length, mittelBreiten: mu, vk: sd / mu };
            })(),
            horton: { N: NN, Lmittel: Object.fromEntries(Object.keys(NN).map((o) => [o, Math.round(LL[o] / NN[o])])), RB: vh.RB, RL: vh.RL },
            hortonBekannt: (() => {
                const NN = {};
                const LL = {};
                for (const m of je)
                    for (const o in m.hortonBekannt.N) {
                        NN[o] = (NN[o] || 0) + m.hortonBekannt.N[o];
                        LL[o] = (LL[o] || 0) + m.hortonBekannt.Lsum[o];
                    }
                const v = verhaeltnis(NN, LL);
                return { N: NN, Lmittel: Object.fromEntries(Object.keys(NN).map((o) => [o, Math.round(LL[o] / NN[o])])), RB: v.RB, RL: v.RL };
            })(),
            hack: hk,
            hackNetz: regression(je.flatMap((m) => m.hackNetz)),
            ms: { p50: ms[ms.length >> 1], max: ms[ms.length - 1] },
            wand: Date.now() - t0,
            schlecht: je
                .slice()
                .sort((a, b) => a.st.vor / Math.max(1, a.st.n) - b.st.vor / Math.max(1, b.st.n))
                .slice(0, 9)
                .map((m) => `${m.saat} ${m.st.vor}/${m.st.n}`),
        };
        console.log(JSON.stringify(bericht, null, 1));
        const out = arg("--json", null);
        if (out) fs.writeFileSync(out, JSON.stringify({ bericht, je }, null, 0));
    });
}
