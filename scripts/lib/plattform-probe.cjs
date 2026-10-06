// plattform-probe.cjs — DIE PLATTFORM-PROBE der Node-Goldens (Integration W5, 06.10.).
// Befund: die Klingen-Goldens v5 wurden unter Node 24 (V8 13.6) geprägt, die CI rechnet unter Node 22 (V8 12.4).
// Math.pow mit gebrochenem Exponenten rundet dort im letzten Bit anders (49 der 512 sRGB-Kanal-Werte, 487 Rücken-
// Potenzen eines Säbels); zwei Float32-Farben der Säbel-Klinge kippten, die CI war rot und lokal alles grün. Der
// Prüfer riet auf die Farb-Kurve (linKanal) — die Probe fand den Täter: schmiede-core sectionAt, pow(e, 0,7).
//
// Die Probe macht diese Drift LOKAL sichtbar, auf jeder Node-Version: sie baut jeden Fall noch einmal, während
// Math.pow um ±1 ULP verschoben rechnet, und verlangt dieselben Bytes. Verschoben wird nur, was ein anderes V8 anders
// runden kann: gebrochene Exponenten, nie die exakten Fälle (ganzzahliger Exponent, Basis 0 oder 1, Ergebnis 0).
// Kippt ein Fall, nennt sie die Aufrufstelle (Datei:Zeile), deren Drift die Bytes erreicht.
//
//   const { plattformProbe } = require("./lib/plattform-probe.cjs");
//   const r = plattformProbe({ laden: () => frischerKern, bauen: (kern) => ({ fall: sha256, … }) });
//   r.kippt  — Fälle, deren Bytes an Math.pows letztem Bit hängen ([] = plattformgleich)
//   r.stellen — je gekipptem Fall die Aufrufstellen (Datei:Zeile), nur wenn r.kippt nicht leer ist
//   r.selbst — die grobe Drift (2^30 ULP) kippt mindestens einen Fall: die Probe erreicht den Bau
"use strict";

const ULP_SELBST = 2 ** 30;

function plattformProbe({ laden, bauen, drift = [1, -1] }) {
    const f64 = new Float64Array(1);
    const i64 = new BigInt64Array(f64.buffer);
    const orig = Math.pow;
    let D = 0;
    let nurStelle = null;
    let sammeln = null;
    const stelleVon = () => {
        const z = new Error().stack.split("\n");
        for (let i = 1; i < z.length; i++) {
            const m = /([\w.-]+\.js):(\d+):\d+\)?$/.exec(z[i]);
            if (m && !/plattform-probe/.test(m[1])) return m[1] + ":" + m[2];
        }
        return "?";
    };
    Math.pow = function (a, b) {
        const y = orig(a, b);
        if (!D || Number.isInteger(b) || a === 0 || a === 1 || !Number.isFinite(y) || y === 0) return y;
        if (sammeln || nurStelle) {
            const s = stelleVon();
            if (sammeln) sammeln.add(s);
            if (nurStelle && s !== nurStelle) return y;
        }
        f64[0] = y;
        i64[0] += BigInt(D);
        return f64[0];
    };
    const lauf = (d) => {
        D = d;
        try {
            return bauen(laden());
        } finally {
            D = 0;
        }
    };
    try {
        const basis = lauf(0);
        const faelle = Object.keys(basis);
        const kipptIn = (r) => faelle.filter((k) => r[k] !== basis[k]);
        const kippt = new Set();
        for (const d of drift) for (const k of kipptIn(lauf(d))) kippt.add(k);
        const selbst = kipptIn(lauf(ULP_SELBST)).length > 0;
        const stellen = {};
        if (kippt.size) {
            sammeln = new Set();
            lauf(drift[0]);
            const alle = [...sammeln];
            sammeln = null;
            for (const s of alle) {
                nurStelle = s;
                for (const d of drift) for (const k of kipptIn(lauf(d))) (stellen[k] = stellen[k] || new Set()).add(s);
            }
            nurStelle = null;
            for (const k in stellen) stellen[k] = [...stellen[k]];
        }
        return { faelle: faelle.length, kippt: [...kippt], stellen, selbst };
    } finally {
        Math.pow = orig;
    }
}

module.exports = { plattformProbe };
