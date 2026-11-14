// ton-wechsel.cjs — DER TON AM WECHSEL (gate:haus-fern N, w28-stoff-fuge): trägt die Stufe 1 an der Grenze 0 ↔ 1 den Ton der
// Stufe 0? Die Stufe 0 BAUT ihren Verband Stein für Stein, jeder Stein in SEINEM Ton (fachwerk `steinTon`: die Ziehung des
// Gesetzbuchs, porta `steinZiehung`) — ein Pixel zeigt den Stein, den er trifft. Die Stufe 1 TRÄGT ihn als Raster (`aFuge`: u · v
// · Stein-Anteil), der Stoff der Welt rechnet je Pixel den Ton aus dem EINEN Kamm (`_steinStoff` → porta `steinTonMittel`: das
// Mittel der Steine unter dem Pixel, je Achse aus seiner Spanne). Hier dieselbe Rechnung über Zahlen: je Fläche mit Raster, die
// ein Auge an der Grenze sieht (Augenhöhe und Dorf-Blick, vier Seiten), die Spanne des Pixels in Steinen je Achse aus den
// Ableitungen am Schirm (die Brennweite des EINEN Schirms, `_brennweite`), ein Feld von Pixeln um ihre Mitte — die Streuung des
// Tons der Stufe 1 gegen die der Stufe 0 an denselben Pixeln. Leser: scripts/diag-haus-fern.cjs (N).
"use strict";

// die Algebra der Zahlen (porta `steinZiehung`, `steinTonMittel`): dieselben Glieder wie die Knoten der Welt und das GLSL des Labors
const ZAHL = {
    k: (x) => x,
    add: (a, b) => a + b,
    mul: (a, b) => a * b,
    mod: (a, b) => a - b * Math.floor((a + 0.5) / b),
    floor: Math.floor,
    sub: (a, b) => a - b,
    div: (a, b) => a / b,
    min: Math.min,
    max: Math.max,
    clamp01: (a) => Math.min(1, Math.max(0, a)),
    sign: Math.sign,
    inverseSqrt: (a) => 1 / Math.sqrt(a),
    mix: (a, b, t) => a + (b - a) * t,
};

const streu = (A) => {
    const m = A.reduce((s, a) => s + a, 0) / A.length;
    return Math.sqrt(A.reduce((s, a) => s + (a - m) * (a - m), 0) / A.length);
};

// `g` die gebaute Stufe 1 (eine Gruppe, je Mesh `aFuge`), `d` die Grenze 0 ↔ 1 in Metern, `f` die Brennweite in Pixeln je Meter
// auf einem Meter Abstand, `PC` porta-core (`steinZiehung`, `steinTonMittel` — oder ein Gesetz an seiner Stelle: die Mutante),
// `augen` die Höhen des Auges. → { dach: { q, blick }, wand: { q, blick } } — je Art das kleinste Verhältnis der Streuungen Stufe 1 ÷ Stufe 0 über die Blicke.
function tonAmWechsel(g, d, f, PC, augen = [1.7, 7]) {
    const T = global.THREE;
    const proben = {}; // je Art und Blick (Höhe · Seite): [Stufe 1, Stufe 0]
    const [a, b, c, n, gu, gv, e, ri, up] = Array.from({ length: 9 }, () => new T.Vector3());
    g.updateMatrixWorld(true);
    const bb = new T.Box3().setFromObject(g),
        mitte = bb.getCenter(new T.Vector3());
    g.traverse((o) => {
        const A = o.isMesh && o.geometry.attributes;
        const F = A && A.aFuge;
        if (!F) return;
        const P = A.position,
            I = o.geometry.index ? o.geometry.index.array : null,
            nT = (I ? I.length : P.count) / 3;
        for (let t = 0; t < nT; t++) {
            const [i0, i1, i2] = I ? [I[t * 3], I[t * 3 + 1], I[t * 3 + 2]] : [t * 3, t * 3 + 1, t * 3 + 2];
            if (!(F.getZ(i0) > 0 && F.getZ(i1) > 0 && F.getZ(i2) > 0)) continue;
            a.fromBufferAttribute(P, i0).applyMatrix4(o.matrixWorld);
            b.fromBufferAttribute(P, i1).applyMatrix4(o.matrixWorld);
            c.fromBufferAttribute(P, i2).applyMatrix4(o.matrixWorld);
            const e1 = b.clone().sub(a),
                e2 = c.clone().sub(a);
            n.crossVectors(e1, e2);
            const flaeche = n.length() / 2;
            if (flaeche < 0.02) continue; // die Stirn eines Bands, ein Splitter: kein Feld
            n.normalize();
            const art = n.y > 0.15 ? "dach" : Math.abs(n.y) < 0.15 ? "wand" : null;
            if (!art) continue;
            // der Gradient von u und v in der Fläche (die lineare Lage im Dreieck)
            const grad = (k) => {
                const q0 = F.getComponent(i0, k),
                    d1 = F.getComponent(i1, k) - q0,
                    d2 = F.getComponent(i2, k) - q0;
                const g11 = e1.dot(e1),
                    g12 = e1.dot(e2),
                    g22 = e2.dot(e2),
                    det = g11 * g22 - g12 * g12;
                const x = (d1 * g22 - d2 * g12) / det,
                    y = (d2 * g11 - d1 * g12) / det;
                return e1.clone().multiplyScalar(x).add(e2.clone().multiplyScalar(y));
            };
            gu.copy(grad(0));
            gv.copy(grad(1));
            const m0 = a.clone().add(b).add(c).multiplyScalar(1 / 3);
            const u0 = (F.getX(i0) + F.getX(i1) + F.getX(i2)) / 3,
                v0 = (F.getY(i0) + F.getY(i1) + F.getY(i2)) / 3;
            for (const h of augen)
                for (let k = 0; k < 4; k++) {
                    const w = (k * Math.PI) / 2 + 0.3;
                    const auge = new T.Vector3(mitte.x + Math.cos(w) * d, h, mitte.z + Math.sin(w) * d);
                    e.copy(m0).sub(auge);
                    const r = e.length();
                    e.normalize();
                    if (n.dot(e) > -0.05) continue; // die Fläche sieht vom Auge weg (oder streift es)
                    ri.crossVectors(e, new T.Vector3(0, 1, 0)).normalize();
                    up.crossVectors(ri, e);
                    // ein Pixel-Schritt am Schirm → die Lage auf der Fläche (der Strahl dreht um 1/f, trifft die Ebene)
                    const schritt = (s) => s.clone().sub(e.clone().multiplyScalar(n.dot(s) / n.dot(e))).multiplyScalar(r / f);
                    const [dr, du] = [schritt(ri), schritt(up)];
                    const [uR, uU, vR, vU] = [gu.dot(dr), gu.dot(du), gv.dot(dr), gv.dot(du)];
                    // die Spanne wie der Stoff sie nimmt (`_steinStoff`: fwidth, nie unter 1e-5)
                    const [sU, sV] = [Math.max(1e-5, Math.abs(uR) + Math.abs(uU)), Math.max(1e-5, Math.abs(vR) + Math.abs(vU))];
                    const pr = (proben[art + "@" + h + "/" + k] ||= [[], []]);
                    // ein Feld von 16 × 16 Pixeln um die Mitte; der Läufer-Verband versetzt jede zweite Lage (wie `_fugeStoff`)
                    for (let y = -8; y < 8; y++)
                        for (let x = -8; x < 8; x++) {
                            const v = v0 + x * vR + y * vU,
                                lage = Math.floor(v),
                                u = u0 + x * uR + y * uU - 0.5 * (((lage % 2) + 2) % 2);
                            const M = PC.steinTonMittel(ZAHL, u, sU, v, sV);
                            pr[0].push((2 * M.z - 1) * M.amp);
                            pr[1].push(2 * PC.steinZiehung(ZAHL, Math.floor(u), lage) - 1);
                        }
                }
        }
    });
    // je Art der schwächste Blick: das Verhältnis der Streuungen Stufe 1 ÷ Stufe 0 (ein Blick mit weniger als 4 Feldern zählt nicht)
    const aus = {};
    for (const key in proben) {
        const [art, blick] = key.split("@"), [p1, p0] = proben[key];
        if (p1.length < 4 * 256) continue;
        const q = streu(p1) / streu(p0);
        if (!aus[art] || q < aus[art].q) aus[art] = { q, blick };
    }
    return aus;
}

// DIE MUTANTE (der Befund vor dem Akt, d294bda9): EIN Schalter an der kleineren Achse — der Stein, den die Pixel-Mitte trifft, sein
// Ton nur, wo ein Stein 2,5 … 5 Pixel über die LANGE Achse des Pixels misst
function schalterGesetz(PC) {
    const glatt = (a, b, x) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    };
    return {
        steinZiehung: PC.steinZiehung,
        steinTonMittel: (A, u, sU, v, sV) => ({
            z: PC.steinZiehung(A, Math.floor(u), Math.floor(v)),
            amp: glatt(2.5, 5, 1 / Math.max(sU, sV)),
        }),
    };
}

module.exports = { tonAmWechsel, schalterGesetz, ZAHL };
