// plattform-probe.cjs — DIE PLATTFORM-PROBE der Goldens (W5, S1: alle Transzendenten, jeder Golden-Satz, Node UND der
// Chrome-Worker der Pflanzen).
// Math.pow mit gebrochenem Exponenten rundet in V8 12.4 (Node 22) und 13.6 (Node 24) im letzten Bit verschieden — im Kern
// und in three r128 (CatmullRomCurve3, Color.convertSRGBToLinear); ein Golden der einen Version bricht auf der anderen.
//
// Die Probe macht diese Drift LOKAL sichtbar, auf jeder Node-Version: sie baut jeden Fall noch einmal, während die
// Transzendenten von Math (FUNKTIONEN) um ±1 ULP verschoben rechnen, und verlangt dieselben Bytes. Verschoben wird nur,
// was ein anderes V8 anders runden kann: nie ein ganzzahliges oder nicht-endliches Ergebnis (sin 0, cos 0, exp 0,
// pow mit ganzem Exponenten, Basis 0 oder 1). Kippt ein Fall, nennt sie je Funktion die Fälle (kipptJe) und die erste
// Aufrufstelle im Kern, deren Drift die Bytes erreicht (Datei:Zeile Funktion; ein Aufruf aus dem vendorten three trägt
// die Kern-Zeile, die three rief). Die Stelle findet eine Halbierung über die Aufruf-Nummer (ein Stapel je Täter, nie
// je Aufruf: ein Tor-Bau ruft Math.pow 905 565-mal).
//
// EINE Quelle, zwei Wirte: `installiereDrift` ist eine in sich geschlossene Funktion — Node ruft sie auf dem eigenen
// Math, der Chrome-Worker der Pflanzen-Goldens (asset-worker-harness) trägt sie als Quelltext vor dem Boot. Der Ablauf
// (`probeAblauf`) kennt nur `lauf(d, welche, bis, fangen) → { r, gerufen, gefangen }`.
//
//   const { plattformProbe } = require("./lib/plattform-probe.cjs");
//   const r = await plattformProbe({ laden: () => frischerKern, bauen: (kern) => ({ fall: sha256, … }), einzeln?, nennen? });
//   nennen(kipptJe) → true | [Funktionen]: die Täter-Stellen werden gesucht (Vorgabe immer; eine Ratsche sucht nur
//   für die Funktionen, die ihre Zeile reißen)
//   einzeln — Funktionen, die je für sich driften (die benannten Zeilen einer Ratsche); der Rest driftet gemeinsam und
//   wird nur dann je Funktion zerlegt, wenn er kippt. Bauten: 2 + 2 × einzeln + 2 (+ 2 je Rest-Funktion, wenn er kippt).
//   r.kippt   — Fälle, deren Bytes am letzten Bit einer Transzendenten hängen ([] = plattformgleich)
//   r.kipptJe — je Funktion die Fälle, die ihre Drift allein kippt (nur Funktionen, die der Bau ruft)
//   r.taeter  — je kippender Funktion die erste Aufrufstelle (Datei:Zeile Funktion), deren Drift die Bytes erreicht
//   r.stellen — je gekipptem Fall die Täter-Stellen (aus r.taeter), nur wenn r.kippt nicht leer ist
//   r.gerufen — je Funktion die Zahl der verschiebbaren Aufrufe eines Baus (der Nenner: 0 heißt, die Probe sah nichts)
//   r.selbst  — die grobe Drift (2^30 ULP auf allen Funktionen) kippt mindestens einen Fall: die Probe erreicht den Bau
"use strict";
const fs = require("fs");
const path = require("path");

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

// Der Drift-Schalter auf einem Math-Objekt (in sich geschlossen: der Worker trägt ihn als Quelltext). setze(d, welche,
// bis, fangen): d ULP auf die Funktionen `welche` (Array), nur die Aufrufe mit Nummer < bis, der Aufruf `fangen` nennt
// seine Kern-Zeile; stand() → { gerufen, gefangen } seit dem letzten setze; aus() stellt Math wieder her.
function installiereDrift(M, funktionen) {
    var f64 = new Float64Array(1);
    var i64 = new BigInt64Array(f64.buffer);
    var orig = {};
    var D = 0;
    var aktiv = null;
    var bis = Infinity;
    var nr = 0;
    var fangen = -1;
    var gefangen = null;
    var gerufen = {};
    // ein three-Aufruf (TubeGeometry → Frenet → CatmullRom → pow) liegt bis zu ~10 Rahmen unter der Kern-Zeile
    var VENDOR = /three[\w.-]*\.js$|plattform-probe\.cjs$/;
    function stelleVon(n) {
        var limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 40;
        var z = String(new Error().stack).split("\n");
        Error.stackTraceLimit = limit;
        for (var i = 1; i < z.length; i++) {
            var m = /([\w.-]+\.c?js):(\d+):\d+\)?$/.exec(z[i]);
            if (m && !VENDOR.test(m[1])) return m[1] + ":" + m[2] + " " + n;
        }
        return "? " + n;
    }
    funktionen.forEach(function (n) {
        var o = M[n];
        orig[n] = o;
        var exakt =
            n === "pow"
                ? function (a, b, y) {
                      return Number.isInteger(b) || a === 0 || a === 1 || Number.isInteger(y);
                  }
                : function (a, b, y) {
                      return Number.isInteger(y);
                  };
        M[n] = function (a, b) {
            var y = o.apply(M, arguments);
            if (!Number.isFinite(y) || exakt(a, b, y)) return y;
            gerufen[n] = (gerufen[n] || 0) + 1;
            if (!D || !aktiv || aktiv.indexOf(n) < 0) return y;
            var i = nr++;
            if (i === fangen) gefangen = stelleVon(n);
            if (i >= bis) return y;
            f64[0] = y;
            i64[0] += BigInt(D);
            return f64[0];
        };
    });
    return {
        setze: function (d, welche, grenze, fang) {
            D = d;
            aktiv = welche || null;
            bis = grenze == null ? Infinity : grenze;
            fangen = fang == null ? -1 : fang;
            nr = 0;
            gefangen = null;
            gerufen = {};
        },
        stand: function () {
            return { gerufen: gerufen, gefangen: gefangen };
        },
        aus: function () {
            for (var n in orig) M[n] = orig[n];
        },
    };
}

// DER ABLAUF (eine Quelle für Node und Browser): lauf(d, welche, bis, fangen) → Promise<{ r, gerufen, gefangen }>.
async function probeAblauf({ lauf, drift = [1, -1], einzeln = [], nennen = () => true }) {
    const b = await lauf(0, null, null, -1);
    const basis = b.r;
    const gerufen = b.gerufen;
    const faelle = Object.keys(basis);
    const kipptIn = (r) => faelle.filter((k) => r[k] !== basis[k]);
    const nurR = async (d, welche, bis, fangen) => (await lauf(d, welche, bis, fangen)).r;
    const alle = Object.keys(gerufen);
    const selbst = kipptIn(await nurR(ULP_SELBST, alle)).length > 0;
    const kipptJe = {};
    const taeter = {};
    const stellen = {};
    const kippt = new Set();
    const einzelLauf = async (n) => {
        const s = new Set();
        for (const d of drift) for (const k of kipptIn(await nurR(d, [n]))) s.add(k);
        if (s.size) kipptJe[n] = [...s];
        for (const k of s) kippt.add(k);
    };
    // die benannten Funktionen (einzeln) je für sich, der Rest gemeinsam — kippt der Rest, dann auch er je Funktion
    for (const n of einzeln) if (alle.indexOf(n) >= 0) await einzelLauf(n);
    const rest = alle.filter((n) => einzeln.indexOf(n) < 0);
    if (rest.length) {
        let restKippt = false;
        for (const d of drift) if (kipptIn(await nurR(d, rest)).length) restKippt = true;
        if (restKippt) for (const n of rest) await einzelLauf(n);
    }
    // je Täter-Funktion: die kleinste Grenze, ab der die Drift der ersten Aufrufe kippt (Halbierung); der Aufruf an der
    // Grenze ist der Täter — sein Stapel nennt die Kern-Zeile. Nur, wenn der Aufrufer es verlangt (eine Ratsche nennt
    // nur, wenn sie reißt — die Halbierung kostet ~20 Bauten je Funktion).
    const zuNennen = kippt.size ? nennen(kipptJe, faelle.length) : false;
    if (zuNennen) {
        for (const n of Array.isArray(zuNennen) ? zuNennen : Object.keys(kipptJe)) {
            for (const d of drift) {
                if (!kipptIn(await nurR(d, [n])).length) continue;
                let lo = 0;
                let hi = 2 * gerufen[n] + 1;
                while (hi - lo > 1) {
                    const mid = (lo + hi) >> 1;
                    if (kipptIn(await nurR(d, [n], mid)).length) hi = mid;
                    else lo = mid;
                }
                const g = await lauf(d, [n], hi, hi - 1);
                taeter[n] = g.gefangen || "? " + n;
                for (const f of kipptIn(g.r)) (stellen[f] = stellen[f] || []).push(taeter[n]);
                break;
            }
        }
    }
    return { faelle: faelle.length, kippt: [...kippt], kipptJe, taeter, stellen, gerufen, selbst };
}

// Der Node-Wirt: der Schalter auf dem eigenen Math, je Lauf ein frisch geladener Kern.
async function plattformProbe({ laden, bauen, drift, funktionen = FUNKTIONEN, einzeln, nennen }) {
    const T = installiereDrift(Math, funktionen);
    try {
        return await probeAblauf({
            lauf: async (d, welche, bis, fangen) => {
                T.setze(d, welche, bis, fangen);
                try {
                    const r = bauen(laden());
                    return Object.assign({ r }, T.stand());
                } finally {
                    T.setze(0, null);
                }
            },
            drift,
            einzeln,
            nennen,
        });
    } finally {
        T.aus();
    }
}

// ── DIE RATSCHE (spec/asset-contract/plattform-ratsche.json) ──
// Math.pow ist die GEMESSENE Klasse (V8 12.4 ≠ 13.6, zweimal gebissen: v5 schmiede, v4 porta): seine Drift kippt in
// keinem Golden-Satz ein Byte, hart. Die übrigen Transzendenten rundeten in beiden V8 gleich; wo ihre Drift die Bytes
// erreicht, ist der Kern BENANNT: je Satz und Funktion die Zahl der kippenden Fälle als Ratsche (sie darf nur fallen),
// die erste Täter-Stelle als Name, das Soll 0 (EIN Byte-Raster am Ausgang, das Muster porta-core/fachwerk-core
// ausRaster — es kommt mit dem nächsten Re-Mint des Kerns, nie als eigener Byte-Akt).
const RATSCHE_DATEI = path.join(__dirname, "..", "..", "spec", "asset-contract", "plattform-ratsche.json");
function ratscheLesen() {
    return JSON.parse(fs.readFileSync(RATSCHE_DATEI, "utf8"));
}
// urteil → { rot: [Sätze mit Täter], faellt: [Zeilen, die fallen dürfen] }
function ratscheUrteil(satz, PP, R) {
    const z = (R || ratscheLesen()).saetze[satz];
    const rot = [];
    const faellt = [];
    if (!z) return { rot: [`${satz}: keine Zeile in der Ratsche`], faellt };
    if (z.faelle !== PP.faelle) rot.push(`${satz}: ${PP.faelle} Probe-Fälle statt ${z.faelle} (der Nenner der Ratsche)`);
    for (const [n, f] of Object.entries(PP.kipptJe)) {
        // pow ist hart 0 — außer ein Satz nennt seinen gepinnten Wirt (powWirt: CI und lokal dieselbe V8)
        const grenze = n === "pow" && !z.powWirt ? 0 : (z.kippt && z.kippt[n]) || 0;
        if (f.length > grenze)
            rot.push(`${satz} ${n} kippt ${f.length} > ${grenze}${PP.taeter && PP.taeter[n] ? " ← " + PP.taeter[n] : ""}`);
    }
    for (const [n, g] of Object.entries(z.kippt || {})) {
        const ist = (PP.kipptJe[n] || []).length;
        if (ist < g) faellt.push(`${n} ${g} → ${ist}`);
    }
    return { rot, faellt };
}
// SELBST-TEST der Ratsche: ein kippendes Math.pow und eine Funktion über ihrer Zeile werden rot beim Namen.
function ratscheSelbsttest(satz) {
    const R = ratscheLesen();
    const z = R.saetze[satz];
    if (!z) return false;
    const fall = (n) => Array.from({ length: n }, (_, i) => "f" + i);
    const kipptJe = {};
    for (const [n, g] of Object.entries(z.kippt || {})) kipptJe[n] = fall(g);
    const powGrenze = z.powWirt ? (z.kippt || {}).pow || 0 : 0;
    const mitPow = ratscheUrteil(
        satz,
        { faelle: z.faelle, kipptJe: Object.assign({}, kipptJe, { pow: fall(powGrenze + 1) }) },
        R
    );
    const n0 = Object.keys(z.kippt || {}).filter((n) => n !== "pow")[0] || "exp";
    const mehr = ratscheUrteil(
        satz,
        { faelle: z.faelle, kipptJe: Object.assign({}, kipptJe, { [n0]: fall(((z.kippt || {})[n0] || 0) + 1) }) },
        R
    );
    const heil = ratscheUrteil(satz, { faelle: z.faelle, kipptJe }, R);
    return (
        heil.rot.length === 0 &&
        mitPow.rot.some((s) => s.includes(` pow kippt ${powGrenze + 1} > ${powGrenze}`)) &&
        mehr.rot.some((s) => s.includes(` ${n0} kippt `))
    );
}

// Die Wand eines Golden-Gates (check(name, ok, detail) ist die Zeile des Gates): Probe + Ratsche, der Nenner
// (verschiebbare Aufrufe je Funktion), die grobe Drift und der Selbst-Test der Ratsche. `lauf` (statt laden/bauen)
// trägt einen fremden Wirt — den Chrome-Worker der Pflanzen.
async function probeWand(satz, { laden, bauen, lauf, funktionen }, check) {
    const R = ratscheLesen();
    const zeile = R.saetze[satz];
    const einzeln = Object.keys((zeile && zeile.kippt) || {});
    // nur die Funktionen, die ihre Zeile reißen, werden halbiert (die Halbierung kostet ~20 Güsse je Funktion)
    const nennen = (kipptJe) =>
        Object.keys(kipptJe).filter((n) => {
            const grenze = n === "pow" && !(zeile && zeile.powWirt) ? 0 : ((zeile && zeile.kippt) || {})[n] || 0;
            return kipptJe[n].length > grenze;
        });
    const PP = lauf
        ? await probeAblauf({ lauf, einzeln, nennen })
        : await plattformProbe({ laden, bauen, funktionen, einzeln, nennen });
    const urteil = ratscheUrteil(satz, PP, R);
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
    const powSatz = zeile && zeile.powWirt
        ? "Math.pow hält seine Zeile (gepinnter Wirt — CI und lokal dieselbe V8)"
        : "Math.pow ±1 ULP kippt kein Byte";
    check(
        `PLATTFORM-PROBE ${satz}: ${powSatz}, die übrigen Transzendenten halten die Ratsche (${PP.faelle} Fälle; benannt: ${benannt || "keine — plattformgleich"}; Nenner ${nenner || "0"})`,
        urteil.rot.length === 0 && PP.faelle > 0,
        urteil.rot.join(" · ")
    );
    if (urteil.faellt.length)
        console.log(`  ↓ RATSCHE ${satz} kann fallen (spec/asset-contract/plattform-ratsche.json): ${urteil.faellt.join(" · ")}`);
    check(`SELBST-TEST: eine grobe Drift (2^30 ULP) kippt die Bytes — die Plattform-Probe erreicht den Bau`, PP.selbst);
    check(`SELBST-TEST: die Ratsche ${satz} reißt bei kippendem Math.pow und über ihrer Zeile — beim Namen`, ratscheSelbsttest(satz));
    return PP;
}

// DER KANONISCHE FINGERABDRUCK einer gebauten Gruppe (die v3-Form, die jeder Golden-Satz der Gesetzbücher trägt: fachwerk
// v3–v5, porta, schmiede, vehicle) — bis F4 stand er viermal wortgleich in den Vertrags-Linsen. `nurGeometrie`: ohne die
// Material-Signatur (die Seed-Probe des Fahrzeugs); `mitFern`: die NUR-WURF-Stufe des Hauses trägt ihre Fernform als Beipack
// `__fern` (die Tor-Goldens zählen ihn nicht).
function fingerabdruck(group, nurGeometrie, mitFern) {
    const h = require("crypto").createHash("sha256");
    let objects = 0;
    let vertices = 0;
    group.updateMatrixWorld(true);
    group.traverse((o) => {
        const geo = o.geometry;
        if (!geo || !geo.attributes || !geo.attributes.position) return;
        objects++;
        vertices += geo.attributes.position.count;
        h.update(String(o.type));
        h.update(Buffer.from(new Float64Array(o.matrixWorld.elements).buffer));
        const m = nurGeometrie ? null : o.material;
        if (m) {
            h.update(
                JSON.stringify({
                    c: m.color ? m.color.getHex() : null,
                    e: m.emissive ? m.emissive.getHex() : null,
                    r: typeof m.roughness === "number" ? m.roughness : null,
                    mt: typeof m.metalness === "number" ? m.metalness : null,
                    o: typeof m.opacity === "number" ? m.opacity : null,
                    t: !!m.transparent,
                })
            );
        }
        for (const name of Object.keys(geo.attributes).sort()) {
            const a = geo.attributes[name];
            const arr = a.array;
            h.update(name);
            h.update(String(a.itemSize));
            h.update(Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength));
        }
        if (geo.index) {
            const ia = geo.index.array;
            h.update("index");
            h.update(Buffer.from(ia.buffer, ia.byteOffset, ia.byteLength));
        }
    });
    if (mitFern && group.userData && group.userData.__fern) h.update("__fern" + JSON.stringify(group.userData.__fern));
    return { objects, vertices, sha256: h.digest("hex") };
}

// DER SCHLÜSSEL EINES FALLS der Vertrags-Linsen (fachwerk · porta · schmiede): Rezept, Saat, Stufe und die Schlüssel der
// Prägung — je Linse eine eigene Zeile war ein Zwilling.
const fallSchluessel = (c) => `${c.rezeptId}-s${c.seed}-L${c.lod}${c.ov ? "-ov_" + Object.keys(c.ov).sort().join("_") : ""}`;

// DER GOLDEN-VERGLEICH der Vertrags-Linsen (fachwerk · porta · schmiede · vehicle; auch ihr Selbst-Test ruft ihn): die
// Fälle des Goldens gegen das Ist (sha256, dann objects/vertices) → Abweichungsliste.
function goldenVergleich(golden, actual) {
    const bad = [];
    for (const k in golden.cases) {
        const g = golden.cases[k];
        const a = actual[k];
        if (!a) {
            bad.push(`${k}: fehlt im Ist`);
            continue;
        }
        if (g.sha256 !== a.sha256)
            bad.push(`${k}: sha256 weicht ab (${g.sha256.slice(0, 12)}… != ${a.sha256.slice(0, 12)}…)`);
        else if (g.objects !== a.objects || g.vertices !== a.vertices) bad.push(`${k}: objects/vertices weichen ab`);
    }
    return bad;
}

// DER SELBST-TEST des Golden-Vergleichs (die Linse ist nicht vakuös) gegen das Ist selbst (S1 Wände: er misst auch auf einem
// roten Stand, was er misst): ein gekipptes sha256 und eine objects-Drift am ersten Fall werden rot.
function goldenSelbsttest(actual, check) {
    const k0 = Object.keys(actual)[0];
    const [t1, t2] = [0, 1].map(() => JSON.parse(JSON.stringify(actual)));
    t1[k0].sha256 = (t1[k0].sha256[0] === "0" ? "1" : "0") + t1[k0].sha256.slice(1);
    t2[k0].objects += 1;
    const rot = (golden, ist, was) => goldenVergleich(golden, ist).some((s) => s.includes(was));
    check("SELBST-TEST: korruptes Golden (sha256) wird erkannt", rot({ cases: t1 }, actual, "sha256"));
    check("SELBST-TEST: objects-Drift wird erkannt", rot({ cases: actual }, t2, "objects"));
}

// DAS IST EINES VERTRAGS (porta · schmiede · vehicle): jeder Fall doppelt gebaut und gefingert, je Schlüssel der Abdruck des
// ersten Baus — trägt ein zweiter Bau ein anderes Byte, bricht die Determinismus-Zeile.
function vertragIst(faelle, bau, check, schluessel = fallSchluessel) {
    const ist = {};
    let gleich = true;
    for (const c of faelle) {
        const [a, b] = [0, 1].map(() => fingerabdruck(bau(c)));
        gleich = gleich && a.sha256 === b.sha256;
        ist[schluessel(c)] = a;
    }
    check(`Determinismus: jeder der ${faelle.length} Fälle baut doppelt byte-gleich`, gleich);
    return ist;
}

// DIE GOLDEN-WAND eines Vertrags (fachwerk · porta · schmiede · vehicle — bis hier fünfmal wortgleich): beim ersten Lauf
// (oder MINT_FORCE=1) friert sie das Ist in `datei` ein ({ cv, minted, cases }), danach vergleicht sie byte-exakt und nennt
// jede Abweichung; `n` ist die Zahl der Fälle, die das Golden tragen muss.
function goldenWand(datei, cv, ist, check, n, minted = "buildInstance(rezeptId, seed, lod, ov?) — sha256 je Fall") {
    const name = path.basename(datei);
    if (!fs.existsSync(datei) || process.env.MINT_FORCE === "1") {
        fs.mkdirSync(path.dirname(datei), { recursive: true });
        fs.writeFileSync(datei, JSON.stringify({ cv, minted, cases: ist }, null, 2) + "\n");
        console.log(`  🧊 GOLDEN GEMINTET (${Object.keys(ist).length} Fälle) → ${name} — ab jetzt EINGEFROREN`);
    }
    const golden = JSON.parse(fs.readFileSync(datei, "utf8"));
    const zahl = Object.keys(golden.cases).length;
    check(`Golden ${name} trägt cv:${cv} + alle ${n} Fälle`, golden.cv === cv && zahl === n);
    const diffs = goldenVergleich(golden, ist);
    check(`Goldens ${name} byte-exakt (${zahl} Fälle)`, diffs.length === 0, diffs[0] || "");
    for (const d of diffs.slice(1)) console.log(`      ↳ ${d}`);
}

// DIE PROBE EINES STUDIO-KERNS (fachwerk · porta · schmiede · vehicle): die Wand `probeWand` über den je Lauf frisch geladenen
// Kern (`studioKern` frisch) — je Fall `bau(K, c)` gefingert (`finger`, `schluessel`), danach `weg(g)`; am Ende trägt `name` wieder den Kern der
// Linse. Bis zur Decke w3s-sukzession lud, baute und legte jede Linse selbst (fünf Mal).
async function kernProbe(satz, datei, name, faelle, check, o = {}) {
    const { bau = (K, c) => K.buildInstance(c.rezeptId, c.seed, c.lod, c.ov), finger = fingerabdruck, schluessel = fallSchluessel, weg = () => {} } = o;
    const eigen = globalThis[name];
    const bauen = (K) => {
        const r = {};
        for (const c of faelle) {
            const g = bau(K, c);
            r[schluessel(c)] = finger(g).sha256;
            weg(g);
        }
        return r;
    };
    await probeWand(satz, { laden: () => require("./welt-boot.cjs").studioKern(datei, name, true), bauen }, check);
    globalThis[name] = eigen;
}

module.exports = {
    kernProbe,
    vertragIst,
    goldenWand,
    plattformProbe,
    installiereDrift,
    FUNKTIONEN,
    probeWand,
    fingerabdruck,
    goldenSelbsttest,
    fallSchluessel,
};
