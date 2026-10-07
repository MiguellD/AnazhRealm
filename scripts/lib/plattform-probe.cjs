// plattform-probe.cjs — DIE PLATTFORM-PROBE der Node-Goldens (Integration W5, 06.10.; S1 Wände, 07.10.: alle
// Transzendenten statt nur Math.pow).
// Befund 1 (cc26c7d8): die Klingen-Goldens v5 wurden unter Node 24 (V8 13.6) geprägt, die CI rechnet unter Node 22
// (V8 12.4). Math.pow mit gebrochenem Exponenten rundet dort im letzten Bit anders; Täter schmiede-core sectionAt.
// Befund 2 (S1, 07.10.): die Tor-Goldens v4 standen am Kopf 516e704a unter Node 24 grün und unter Node 22 rot (16 von
// 16 Fällen) — 2405 von 40148 verschiedenen Math.pow-Aufrufen runden in V8 12.4 anders, alle in three r128
// (CatmullRomCurve3 'centripetal' pow(d², 0,25), Color.convertSRGBToLinear pow(c, 2,4)), gerufen aus porta-core.
// sin/cos/acos/atan2/hypot (213 707 verschiedene Aufrufe) rundeten in beiden V8 gleich.
//
// Die Probe macht diese Drift LOKAL sichtbar, auf jeder Node-Version: sie baut jeden Fall noch einmal, während die
// Transzendenten von Math (FUNKTIONEN) um ±1 ULP verschoben rechnen, und verlangt dieselben Bytes. Verschoben wird nur,
// was ein anderes V8 anders runden kann: nie ein ganzzahliges oder nicht-endliches Ergebnis (sin 0, cos 0, exp 0,
// pow mit ganzem Exponenten, Basis 0 oder 1). Kippt ein Fall, nennt sie je Funktion die Fälle (kipptJe) und die erste
// Aufrufstelle im Kern, deren Drift die Bytes erreicht (Datei:Zeile Funktion; ein Aufruf aus dem vendorten three trägt
// die Kern-Zeile, die three rief). Die Stelle findet eine Halbierung über die Aufruf-Nummer (ein Stapel je Täter, nie
// je Aufruf: ein Tor-Bau ruft Math.pow 905 565-mal).
//
//   const { plattformProbe } = require("./lib/plattform-probe.cjs");
//   const r = plattformProbe({ laden: () => frischerKern, bauen: (kern) => ({ fall: sha256, … }), funktionen?, nennen? });
//   nennen(kipptJe) → true: die Täter-Stellen werden gesucht (Vorgabe immer; eine Ratsche sucht nur, wenn sie reißt)
//   einzeln — Funktionen, die je für sich driften (die benannten Zeilen einer Ratsche); der Rest driftet gemeinsam und
//   wird nur dann je Funktion zerlegt, wenn er kippt. Bauten: 2 + 2 × einzeln + 2 (+ 2 je Rest-Funktion, wenn er kippt).
//   r.kippt   — Fälle, deren Bytes am letzten Bit einer Transzendenten hängen ([] = plattformgleich)
//   r.kipptJe — je Funktion die Fälle, die ihre Drift allein kippt (nur Funktionen, die der Bau ruft)
//   r.taeter  — je kippender Funktion die erste Aufrufstelle (Datei:Zeile Funktion), deren Drift die Bytes erreicht
//   r.stellen — je gekipptem Fall die Täter-Stellen (aus r.taeter), nur wenn r.kippt nicht leer ist
//   r.gerufen — je Funktion die Zahl der verschiebbaren Aufrufe eines Baus (der Nenner: 0 heißt, die Probe sah nichts)
//   r.selbst  — die grobe Drift (2^30 ULP auf allen Funktionen) kippt mindestens einen Fall: die Probe erreicht den Bau
"use strict";

const ULP_SELBST = 2 ** 30;
const FUNKTIONEN = [
    "pow",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "atan2",
    "exp",
    "expm1",
    "log",
    "log1p",
    "log2",
    "log10",
    "sinh",
    "cosh",
    "tanh",
    "asinh",
    "acosh",
    "atanh",
    "cbrt",
    "hypot",
];
const VENDOR = /three[\w.-]*\.js$|plattform-probe\.cjs$/;

function plattformProbe({ laden, bauen, drift = [1, -1], funktionen = FUNKTIONEN, einzeln = [], nennen = () => true }) {
    const f64 = new Float64Array(1);
    const i64 = new BigInt64Array(f64.buffer);
    const orig = {};
    for (const n of funktionen) orig[n] = Math[n];
    let D = 0;
    let aktiv = null; // Set der verschobenen Funktionen
    let bis = Infinity; // nur die Aufrufe mit Nummer < bis driften (Halbierung)
    let nr = 0; // laufende Nummer der driftfähigen Aufrufe der aktiven Funktionen
    let fangen = -1; // die Nummer, deren Stapel die Täter-Stelle nennt
    let gefangen = null;
    let zaehlen = null;
    const stelleVon = (n) => {
        // ein three-Aufruf (TubeGeometry → Frenet → CatmullRom → pow) liegt bis zu ~10 Rahmen unter der Kern-Zeile
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 40;
        const z = new Error().stack.split("\n");
        Error.stackTraceLimit = limit;
        for (let i = 1; i < z.length; i++) {
            const m = /([\w.-]+\.c?js):(\d+):\d+\)?$/.exec(z[i]);
            if (m && !VENDOR.test(m[1])) return m[1] + ":" + m[2] + " " + n;
        }
        return "? " + n;
    };
    for (const n of funktionen) {
        const o = orig[n];
        const exakt =
            n === "pow"
                ? (a, b, y) => Number.isInteger(b) || a === 0 || a === 1 || Number.isInteger(y)
                : (a, b, y) => Number.isInteger(y);
        Math[n] = function (a, b) {
            const y = o.apply(Math, arguments);
            if (!Number.isFinite(y) || exakt(a, b, y)) return y;
            if (zaehlen) zaehlen[n] = (zaehlen[n] || 0) + 1;
            if (!D || !aktiv.has(n)) return y;
            const i = nr++;
            if (i === fangen) gefangen = stelleVon(n);
            if (i >= bis) return y;
            f64[0] = y;
            i64[0] += BigInt(D);
            return f64[0];
        };
    }
    const lauf = (d, welche, grenze) => {
        D = d;
        aktiv = welche || null;
        bis = grenze == null ? Infinity : grenze;
        nr = 0;
        try {
            return bauen(laden());
        } finally {
            D = 0;
            aktiv = null;
            bis = Infinity;
        }
    };
    try {
        zaehlen = {};
        const basis = lauf(0);
        const gerufen = zaehlen;
        zaehlen = null;
        const faelle = Object.keys(basis);
        const kipptIn = (r) => faelle.filter((k) => r[k] !== basis[k]);
        const alle = new Set(Object.keys(gerufen));
        const selbst = kipptIn(lauf(ULP_SELBST, alle)).length > 0;
        const kipptJe = {};
        const taeter = {};
        const stellen = {};
        const kippt = new Set();
        const einzelLauf = (n) => {
            const s = new Set();
            for (const d of drift) for (const k of kipptIn(lauf(d, new Set([n])))) s.add(k);
            if (s.size) kipptJe[n] = [...s];
            for (const k of s) kippt.add(k);
        };
        // die benannten Funktionen (einzeln) je für sich, der Rest gemeinsam — kippt der Rest, dann auch er je Funktion
        for (const n of einzeln) if (alle.has(n)) einzelLauf(n);
        const rest = new Set([...alle].filter((n) => einzeln.indexOf(n) < 0));
        if (rest.size) {
            let restKippt = false;
            for (const d of drift) if (kipptIn(lauf(d, rest)).length) restKippt = true;
            if (restKippt) for (const n of rest) einzelLauf(n);
        }
        // je Täter-Funktion: die kleinste Grenze, ab der die Drift der ersten Aufrufe kippt (Halbierung); der Aufruf an
        // der Grenze ist der Täter — sein Stapel nennt die Kern-Zeile. Nur, wenn der Aufrufer es verlangt (eine Ratsche
        // nennt nur, wenn sie reißt — die Halbierung kostet ~20 Bauten je Funktion).
        if (kippt.size && nennen(kipptJe)) {
            for (const n of Object.keys(kipptJe)) {
                const nur = new Set([n]);
                for (const d of drift) {
                    if (!kipptIn(lauf(d, nur)).length) continue;
                    let lo = 0;
                    let hi = 2 * gerufen[n] + 1;
                    while (hi - lo > 1) {
                        const mid = (lo + hi) >> 1;
                        if (kipptIn(lauf(d, nur, mid)).length) hi = mid;
                        else lo = mid;
                    }
                    fangen = hi - 1;
                    gefangen = null;
                    const k = kipptIn(lauf(d, nur, hi));
                    fangen = -1;
                    taeter[n] = gefangen || "? " + n;
                    for (const f of k) (stellen[f] = stellen[f] || []).push(taeter[n]);
                    break;
                }
            }
        }
        return { faelle: faelle.length, kippt: [...kippt], kipptJe, taeter, stellen, gerufen, selbst };
    } finally {
        for (const n of funktionen) Math[n] = orig[n];
    }
}

// ── DIE RATSCHE (spec/asset-contract/plattform-ratsche.json) ──
// Math.pow ist die GEMESSENE Klasse (V8 12.4 ≠ 13.6, zweimal gebissen: v5 schmiede, v4 porta): seine Drift kippt in
// keinem Golden-Satz ein Byte, hart. Die übrigen Transzendenten rundeten in beiden V8 gleich; wo ihre Drift die Bytes
// erreicht, ist der Kern BENANNT: je Satz und Funktion die Zahl der kippenden Fälle als Ratsche (sie darf nur fallen),
// die erste Täter-Stelle als Name, das Soll 0 (EIN Byte-Raster am Ausgang, das Muster porta-core/fachwerk-core
// ausRaster — es kommt mit dem nächsten Re-Mint des Kerns, nie als eigener Byte-Akt).
const RATSCHE_DATEI = require("path").join(__dirname, "..", "..", "spec", "asset-contract", "plattform-ratsche.json");
function ratscheLesen() {
    return JSON.parse(require("fs").readFileSync(RATSCHE_DATEI, "utf8"));
}
// urteil → { rot: [Sätze mit Täter], faellt: [Zeilen, die fallen dürfen] }
function ratscheUrteil(satz, PP, R) {
    const z = (R || ratscheLesen()).saetze[satz];
    const rot = [];
    const faellt = [];
    if (!z) return { rot: [`${satz}: keine Zeile in der Ratsche`], faellt };
    if (z.faelle !== PP.faelle) rot.push(`${satz}: ${PP.faelle} Probe-Fälle statt ${z.faelle} (der Nenner der Ratsche)`);
    for (const [n, f] of Object.entries(PP.kipptJe)) {
        const grenze = n === "pow" ? 0 : (z.kippt && z.kippt[n]) || 0;
        if (f.length > grenze)
            rot.push(`${satz} ${n} kippt ${f.length} > ${grenze}${PP.taeter && PP.taeter[n] ? " ← " + PP.taeter[n] : ""}`);
    }
    for (const [n, g] of Object.entries(z.kippt || {})) {
        const ist = (PP.kipptJe[n] || []).length;
        if (ist < g) faellt.push(`${n} ${g} → ${ist}`);
    }
    return { rot, faellt };
}
// Die Probe mit ihrer Ratsche: die Täter-Stellen sucht sie nur, wenn die Ratsche reißt.
function probeMitRatsche(satz, { laden, bauen, funktionen }) {
    const R = ratscheLesen();
    let faelle = 0;
    const PP = plattformProbe({
        laden,
        bauen: (k) => {
            const r = bauen(k);
            faelle = Object.keys(r).length;
            return r;
        },
        funktionen,
        einzeln: Object.keys((R.saetze[satz] && R.saetze[satz].kippt) || {}),
        nennen: (kipptJe) => ratscheUrteil(satz, { faelle, kipptJe }, R).rot.length > 0,
    });
    return { PP, urteil: ratscheUrteil(satz, PP, R), zeile: R.saetze[satz] };
}
// SELBST-TEST der Ratsche: ein kippendes Math.pow und eine Funktion über ihrer Zeile werden rot beim Namen.
function ratscheSelbsttest(satz) {
    const R = ratscheLesen();
    const z = R.saetze[satz];
    if (!z) return false;
    const fall = (n) => Array.from({ length: n }, (_, i) => "f" + i);
    const kipptJe = {};
    for (const [n, g] of Object.entries(z.kippt || {})) kipptJe[n] = fall(g);
    const mitPow = ratscheUrteil(satz, { faelle: z.faelle, kipptJe: Object.assign({}, kipptJe, { pow: fall(1) }) }, R);
    const n0 = Object.keys(z.kippt || {})[0] || "exp";
    const mehr = ratscheUrteil(
        satz,
        { faelle: z.faelle, kipptJe: Object.assign({}, kipptJe, { [n0]: fall(((z.kippt || {})[n0] || 0) + 1) }) },
        R
    );
    const heil = ratscheUrteil(satz, { faelle: z.faelle, kipptJe }, R);
    return (
        heil.rot.length === 0 &&
        mitPow.rot.some((s) => s.includes(" pow kippt 1 > 0")) &&
        mehr.rot.some((s) => s.includes(` ${n0} kippt `))
    );
}

// Die Wand eines Golden-Gates in vier Zeilen (check(name, ok, detail) ist die Zeile des Gates): Probe + Ratsche, der
// Nenner (verschiebbare Aufrufe je Funktion), die grobe Drift und der Selbst-Test der Ratsche.
function probeWand(satz, { laden, bauen, funktionen }, check) {
    const { PP, urteil, zeile } = probeMitRatsche(satz, { laden, bauen, funktionen });
    const nenner = Object.entries(PP.gerufen)
        .map(([n, z]) => n + " " + z)
        .join(" · ");
    const benannt = Object.entries((zeile && zeile.kippt) || {})
        .map(([n, g]) => `${n} ${g}`)
        .join(" · ");
    // Ein Satz ohne Transzendente (die Daten-Kerne): der Nenner 0 IST der Befund — ruft er eine, reißt die Zeile.
    if (zeile && zeile.transzendentenFrei) {
        check(
            `PLATTFORM-PROBE ${satz}: transzendenten-frei — 0 verschiebbare Aufrufe in ${PP.faelle} Fällen, plattformgleich ohne Raster`,
            !nenner && urteil.rot.length === 0 && PP.faelle > 0,
            nenner ? `ruft jetzt ${nenner} — der Satz braucht seine Ratschen-Zeile` : urteil.rot.join(" · ")
        );
        check(`SELBST-TEST: die Ratsche ${satz} reißt bei kippendem Math.pow — beim Namen`, ratscheSelbsttest(satz));
        return PP;
    }
    check(
        `PLATTFORM-PROBE ${satz}: Math.pow ±1 ULP kippt kein Byte, die übrigen Transzendenten halten die Ratsche (${PP.faelle} Fälle; benannt: ${benannt || "keine — plattformgleich"}; Nenner ${nenner || "0"})`,
        urteil.rot.length === 0 && PP.faelle > 0,
        urteil.rot.join(" · ")
    );
    if (urteil.faellt.length)
        console.log(`  ↓ RATSCHE ${satz} kann fallen (spec/asset-contract/plattform-ratsche.json): ${urteil.faellt.join(" · ")}`);
    check(`SELBST-TEST: eine grobe Drift (2^30 ULP) kippt die Bytes — die Plattform-Probe erreicht den Bau`, PP.selbst);
    check(`SELBST-TEST: die Ratsche ${satz} reißt bei kippendem Math.pow und über ihrer Zeile — beim Namen`, ratscheSelbsttest(satz));
    return PP;
}

module.exports = {
    plattformProbe,
    FUNKTIONEN,
    ratscheUrteil,
    probeMitRatsche,
    ratscheSelbsttest,
    probeWand,
    RATSCHE_DATEI,
};
