// SPIKE (Kratz, landet nicht): die Stadt als FUNKTION über Vierteln.
// Fall 1: viertel(samen, ix, iz) — zustandslos, Abfrage im Radius R unabhängig von der Stadtgröße.
// Fall 2: EIN Viertel mit dem bestehenden Gesetz gründen (exportSettlement), Naht zweier Nachbarn.
// Fall 3: Fern-Deskriptor eines ungegründeten Viertels aus dem Makro-Gesetz (+ DORF, die Plan-Zahlen ohne Geometrie).
// Aufruf: node stadt-funktion-spike.cjs [fall1|fall2|fall3|alle]
const ROOT = "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/w28-karte-huelle";
const was = process.argv[2] || "alle";

// ── das Makro-Gesetz ─────────────────────────────────────────────────────────────────────────────
const VIERTEL_M = 480; // Kantenlänge: ein 150er-Viertel des Gesetzes reicht r_max 220 m um den Platz (gemessen, form.cjs)
const N_VOLL = 150; // Häuser eines vollen Viertels (Kern); der Rand dünnt
function h32(...a) {
    let h = 2166136261 >>> 0;
    for (const v of a) {
        h = Math.imul(h ^ (v | 0), 16777619) >>> 0;
        h ^= h >>> 13;
        h = Math.imul(h, 2246822519) >>> 0;
        h ^= h >>> 16;
    }
    return h >>> 0;
}
const u01 = (...a) => h32(...a) / 4294967296;
// die Stadt: Samen + Häuserzahl → Radius in Vierteln (die Dichte fällt vom Kern nach außen wie 1 − (r/R)²·0,6)
function stadtRadiusViertel(nHaeuser) {
    // Σ über die Scheibe ≈ π R² · N_VOLL · (1 − 0,3) → R
    return Math.sqrt(nHaeuser / (Math.PI * N_VOLL * 0.7));
}
// das Tor einer Kante: der Schlüssel ist die KANTE (beide Nachbarn rechnen denselben Punkt)
function torAufKante(samen, kx, kz, achse) {
    return 0.3 + 0.4 * u01(samen, kx, kz, achse === "v" ? 1 : 2);
}
function viertel(samen, ix, iz, stadt) {
    const R = stadt.R;
    const mx = (ix + 0.5) * VIERTEL_M,
        mz = (iz + 0.5) * VIERTEL_M;
    const r = Math.hypot(ix + 0.5, iz + 0.5) / R;
    if (r > 1) return null; // außerhalb der Stadt: kein Viertel
    const dichte = 1 - 0.6 * r * r;
    const n = Math.max(12, Math.round(N_VOLL * dichte * (0.85 + 0.3 * u01(samen, ix, iz, 3))));
    const s2 = h32(samen, ix, iz, 7) % 1000000;
    const hoehe = r < 0.25 ? "turm" : r < 0.6 ? "block" : "zeile";
    const x0 = ix * VIERTEL_M,
        z0 = iz * VIERTEL_M,
        L = VIERTEL_M;
    const tore = {
        w: { x: x0, z: z0 + L * torAufKante(samen, ix, iz, "v") },
        o: { x: x0 + L, z: z0 + L * torAufKante(samen, ix + 1, iz, "v") },
        n: { x: x0 + L * torAufKante(samen, ix, iz, "h"), z: z0 },
        s: { x: x0 + L * torAufKante(samen, ix, iz + 1, "h"), z: z0 + L },
    };
    return {
        ix,
        iz,
        mitte: { x: mx, z: mz },
        umriss: [x0, z0, x0 + L, z0 + L],
        wort: `dorf ${s2} ${n}`,
        samen: s2,
        n,
        dichte: +dichte.toFixed(3),
        hoehe,
        tore,
    };
}
function viertelImRadius(samen, stadt, px, pz, R) {
    const out = [];
    const i0 = Math.floor((px - R) / VIERTEL_M),
        i1 = Math.floor((px + R) / VIERTEL_M);
    const k0 = Math.floor((pz - R) / VIERTEL_M),
        k1 = Math.floor((pz + R) / VIERTEL_M);
    for (let i = i0; i <= i1; i++)
        for (let k = k0; k <= k1; k++) {
            const ax = Math.max(i * VIERTEL_M - px, 0, px - (i + 1) * VIERTEL_M),
                az = Math.max(k * VIERTEL_M - pz, 0, pz - (k + 1) * VIERTEL_M);
            if (ax * ax + az * az > R * R) continue;
            const v = viertel(samen, i, k, stadt);
            if (v) out.push(v);
        }
    return out;
}

function fall1() {
    const zeilen = [];
    for (const nH of [1e4, 1e5, 1e6]) {
        const stadt = { R: stadtRadiusViertel(nH) };
        const Rm = stadt.R * VIERTEL_M;
        for (const [ort, px, pz] of [
            ["kern", 10, 10],
            ["rand", Rm * 0.9, 0],
        ])
            for (const R of [500, 1500]) {
                const W = 2000;
                for (let w = 0; w < 200; w++) viertelImRadius(42, stadt, px, pz, R); // warm
                if (global.gc) global.gc();
                const m0 = process.memoryUsage().heapUsed;
                const t0 = process.hrtime.bigint();
                let anz = 0,
                    halte = null;
                for (let w = 0; w < W; w++) {
                    halte = viertelImRadius(42, stadt, px, pz, R);
                    anz = halte.length;
                }
                const us = Number(process.hrtime.bigint() - t0) / 1e3 / W;
                const bytes = Buffer.byteLength(JSON.stringify(halte));
                // Summe der Häuser über die GANZE Stadt (nur als Gegenprobe der Größe, keine Abfrage)
                zeilen.push({ nH, Rviertel: +stadt.R.toFixed(1), ort, R, viertel: anz, usJeAbfrage: +us.toFixed(1), jsonBytes: bytes });
                void m0;
            }
        // Gegenprobe: Summe der n über alle Viertel = verlangte Häuser?
        let summe = 0;
        const Ri = Math.ceil(stadt.R);
        for (let i = -Ri - 1; i <= Ri; i++) for (let k = -Ri - 1; k <= Ri; k++) {
            const v = viertel(42, i, k, stadt);
            if (v) summe += v.n;
        }
        zeilen.push({ nH, summeN: summe });
    }
    // Speicher: Heap vor/nach 10⁴ Abfragen ohne Halten (es gibt keinen Zustand, der wächst)
    const stadt6 = { R: stadtRadiusViertel(1e6) };
    if (global.gc) global.gc();
    const h0 = process.memoryUsage().heapUsed;
    for (let w = 0; w < 10000; w++) viertelImRadius(42, stadt6, 300 * w, 0, 1500);
    if (global.gc) global.gc();
    const h1 = process.memoryUsage().heapUsed;
    zeilen.push({ heapNach1e4AbfragenKB: Math.round((h1 - h0) / 1024), gcAn: !!global.gc });
    // Zustandslosigkeit: dasselbe Viertel zweimal, andere Reihenfolge
    const a = JSON.stringify(viertel(42, 3, -2, stadt6)),
        b = (viertelImRadius(42, stadt6, 0, 0, 5000), JSON.stringify(viertel(42, 3, -2, stadt6)));
    zeilen.push({ zustandslos: a === b });
    // Tor-Einigkeit: das Ost-Tor von (i,k) == das West-Tor von (i+1,k) für 1000 Kanten
    let gleich = 0;
    for (let w = 0; w < 1000; w++) {
        const i = (w % 40) - 20,
            k = ((w / 40) | 0) - 12;
        const A = viertel(42, i, k, stadt6),
            B = viertel(42, i + 1, k, stadt6);
        if (A && B && A.tore.o.x === B.tore.w.x && A.tore.o.z === B.tore.w.z) gleich++;
        else if (!A || !B) gleich++;
    }
    zeilen.push({ toreEinig: gleich + "/1000" });
    return zeilen;
}

// ── Fall 2/3: das bestehende Gesetz ────────────────────────────────────────────────────────────
let FC = null;
function kern() {
    if (FC) return FC;
    const { studioKern } = require(ROOT + "/scripts/lib/welt-boot.cjs");
    FC = studioKern("fachwerk-core.js", "__fachwerkCore");
    return FC;
}
function gruende(v) {
    const t = performance.now();
    const p = kern().exportSettlement({ seed: v.samen, nH: v.n });
    return { p, ms: performance.now() - t };
}
function obbSep(a, b) {
    const cA = Math.cos(a.phi), sA = Math.sin(a.phi), cB = Math.cos(b.phi), sB = Math.sin(b.phi);
    const axes = [[cA, -sA], [sA, cA], [cB, -sB], [sB, cB]], d = [b.cx - a.cx, b.cz - a.cz];
    const R = (o, A) => {
        const c = Math.cos(o.phi), s = Math.sin(o.phi);
        return o.ex * Math.abs(A[0] * c + A[1] * -s) + o.ez * Math.abs(A[0] * s + A[1] * c);
    };
    let mx = -1e9;
    for (const A of axes) mx = Math.max(mx, Math.abs(A[0] * d[0] + A[1] * d[1]) - R(a, A) - R(b, A));
    return mx;
}
function fall2() {
    const stadt = { R: stadtRadiusViertel(1e5) };
    const zeilen = [];
    // Gründungszeit je Viertel: ≈150 und ≈300 (das 300er mit derselben Kante — die Frage ist die Zeit, nicht der Platz)
    for (const n of [150, 300])
        for (const s of [11, 23, 57]) {
            const { p, ms } = gruende({ samen: s, n });
            zeilen.push({ n, samen: s, ms: Math.round(ms), platziert: p.slots.length });
        }
    // die Naht: zwei Nachbarn (0,0) | (1,0), jeder am eigenen Viertel-Mittelpunkt (der Plan liegt um seinen Platz bei 0,0)
    for (const [i, k] of [[0, 0], [2, 1], [-3, 0]]) {
        const A = viertel(42, i, k, stadt),
            B = viertel(42, i + 1, k, stadt);
        const gA = gruende(A),
            gB = gruende(B);
        const verschieb = (p, v) => ({
            haus: p.slots.map((s) => Object.assign({}, s.obb, { cx: s.obb.cx + v.mitte.x, cz: s.obb.cz + v.mitte.z })),
            enden: p.roads.flatMap((r) => [r.pts[0], r.pts[r.pts.length - 1]]).map((q) => ({ x: q.x + v.mitte.x, z: q.z + v.mitte.z })),
            wege: p.roads.map((r) => r.pts.map((q) => ({ x: q.x + v.mitte.x, z: q.z + v.mitte.z }))),
        });
        const a = verschieb(gA.p, A),
            b = verschieb(gB.p, B);
        const kante = A.umriss[2]; // x der gemeinsamen Kante
        const tor = A.tore.o;
        const nahTor = (E) => E.filter((q) => Math.hypot(q.x - tor.x, q.z - tor.z) <= 15).length;
        // Hauptstraßen, die das Tor treffen (ein Ende binnen 15 m), von jeder Seite
        const torA = nahTor(a.enden),
            torB = nahTor(b.enden);
        // blinde Enden an der Naht: Weg-Enden binnen 40 m der Kante ohne Gegen-Ende der anderen Seite binnen 15 m
        const anNaht = (E) => E.filter((q) => Math.abs(q.x - kante) <= 40);
        const blind = (E, G) => anNaht(E).filter((q) => !G.some((g) => Math.hypot(g.x - q.x, g.z - q.z) <= 15)).length;
        // Wege, die über die Kante in den Nachbarn reichen (Punkte jenseits der Kante)
        const ueber = (W, seite) => W.filter((w) => w.some((q) => (seite > 0 ? q.x > kante : q.x < kante))).length;
        let paare = 0;
        for (const ha of a.haus) for (const hb of b.haus) if (Math.abs(ha.cx - hb.cx) < 60 && Math.abs(ha.cz - hb.cz) < 60 && obbSep(ha, hb) < 0) paare++;
        // Häuser jenseits der eigenen Kante (ein Viertel trägt Häuser im Umriss des Nachbarn)
        const hausUeber = a.haus.filter((h) => h.cx > kante).length + b.haus.filter((h) => h.cx < kante).length;
        zeilen.push({
            paar: `${i},${k}|${i + 1},${k}`,
            nA: A.n, nB: B.n, msA: Math.round(gA.ms), msB: Math.round(gB.ms),
            wegEndenA: a.enden.length, wegEndenB: b.enden.length,
            torTreffA: torA, torTreffB: torB, torTrifftBeide: torA > 0 && torB > 0,
            blindAnNahtA: blind(a.enden, b.enden), blindAnNahtB: blind(b.enden, a.enden),
            nahtEndenA: anNaht(a.enden).length, nahtEndenB: anNaht(b.enden).length,
            wegeUeberKanteA: ueber(a.wege, 1), wegeUeberKanteB: ueber(b.wege, -1),
            hausUeberKante: hausUeber, ueberlappPaare: paare,
        });
    }
    return zeilen;
}

// ── Fall 3: der Fern-Deskriptor ───────────────────────────────────────────────────────────────
// Ohne Gründung: DORF (die Plan-Zahlen, keine Geometrie) liefert je Haus W, D, Geschosse, Dach; das Makro-Gesetz legt
// die Körper zu BLOCK Blöcken (die Lose, nach Index-Ring vom Platz nach außen, wie das Layout sie vom Kern zieht).
const BLOCKE = 24;
const GESCHOSS_M = 2.75;
function fernDeskriptor(v) {
    const t = performance.now();
    const D = kern().DORF({ seed: v.samen, nH: v.n });
    const H = D.houses;
    const blk = [];
    const je = Math.ceil(H.length / BLOCKE);
    for (let b = 0; b * je < H.length; b++) {
        const teil = H.slice(b * je, (b + 1) * je);
        const flaeche = teil.reduce((s, h) => s + h.W * h.D, 0);
        const hoehe = teil.reduce((s, h) => s + h.storeys * GESCHOSS_M, 0) / teil.length;
        // Lage: Ring b/BLOCKE um die Mitte (Index-Ring), Winkel aus dem Samen; First quer zur Ring-Tangente
        const rr = 25 + 190 * Math.sqrt((b + 0.5) / BLOCKE);
        const th = 2 * Math.PI * u01(v.samen, b, 9);
        blk.push({ x: rr * Math.cos(th), z: rr * Math.sin(th), flaeche, n: teil.length, hoehe, first: (th + Math.PI / 2) % Math.PI });
    }
    // Bytes: je Block x,z int16 (m) · Seite uint8 (0,5 m, √Fläche) · n uint8 · Höhe uint8 (0,5 m) · First uint8 = 8 Byte; Kopf 12 Byte
    const buf = Buffer.alloc(12 + 8 * blk.length);
    buf.writeUInt32LE(v.samen, 0); buf.writeUInt16LE(v.n, 4); buf.writeUInt16LE(blk.length, 6);
    blk.forEach((k, i) => {
        const o = 12 + 8 * i;
        buf.writeInt16LE(Math.round(k.x), o); buf.writeInt16LE(Math.round(k.z), o + 2);
        buf.writeUInt8(Math.min(255, Math.round(Math.sqrt(k.flaeche) * 2)), o + 4);
        buf.writeUInt8(Math.min(255, k.n), o + 5);
        buf.writeUInt8(Math.min(255, Math.round(k.hoehe * 2)), o + 6);
        buf.writeUInt8(Math.round((k.first / Math.PI) * 255), o + 7);
    });
    const summe = {
        haeuser: H.length,
        flaeche: blk.reduce((s, k) => s + k.flaeche, 0),
        hoeheMittel: H.reduce((s, h) => s + h.storeys * GESCHOSS_M, 0) / H.length,
    };
    return { blk, bytes: buf.length, summe, ms: performance.now() - t };
}
function fall3() {
    const stadt = { R: stadtRadiusViertel(1e5) };
    const zeilen = [];
    for (const [i, k] of [[0, 0], [2, 1], [-3, 0]]) {
        const v = viertel(42, i, k, stadt);
        const F = fernDeskriptor(v);
        const { p } = gruende(v);
        const ist = {
            haeuser: p.slots.length,
            flaeche: p.slots.reduce((s, q) => s + 4 * q.obb.ex * q.obb.ez, 0),
            hoeheMittel: p.slots.reduce((s, q) => s + q.ov.storeys * GESCHOSS_M, 0) / p.slots.length,
            firstHoeheMittel: p.slots.reduce((s, q) => s + q.ext.y1, 0) / p.slots.length,
        };
        const pz = (a, b) => +((100 * (a - b)) / b).toFixed(1);
        zeilen.push({
            viertel: `${i},${k}`, wort: v.wort, bloecke: F.blk.length, bytes: F.bytes, msFern: +F.ms.toFixed(1),
            haeuserFern: F.summe.haeuser, haeuserIst: ist.haeuser, abwHaeuserPz: pz(F.summe.haeuser, ist.haeuser),
            flaecheFern: Math.round(F.summe.flaeche), flaecheIst: Math.round(ist.flaeche), abwFlaechePz: pz(F.summe.flaeche, ist.flaeche),
            hoeheFern: +F.summe.hoeheMittel.toFixed(2), hoeheIstGeschoss: +ist.hoeheMittel.toFixed(2), abwHoehePz: pz(F.summe.hoeheMittel, ist.hoeheMittel),
            firstHoeheIst: +ist.firstHoeheMittel.toFixed(2), abwGegenFirstPz: pz(F.summe.hoeheMittel, ist.firstHoeheMittel),
        });
    }
    return zeilen;
}

const aus = {};
if (was === "fall1" || was === "alle") aus.fall1 = fall1();
if (was === "fall2" || was === "alle") aus.fall2 = fall2();
if (was === "fall3" || was === "alle") aus.fall3 = fall3();
for (const [k, z] of Object.entries(aus)) {
    console.log("== " + k);
    for (const r of z) console.log(JSON.stringify(r));
}
