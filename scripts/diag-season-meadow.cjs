#!/usr/bin/env node
// diag-season-meadow.cjs — DIE FARBE DES JAHRS. Jeder Foundry-Körper und jede Karte ist Golden-Sommer
// gebacken (die Transport-Schale nagelt season "summer"); das Jahr färbt über die EINE Uniform `uSeasonMul` nach dem
// Studio-Gesetz (seine Gestalt — das Laub fällt, `uLaubPraesenz` über den Jahres-Ecken — prüft gate:fluss W2b am echten
// Laub der Welt). Diese Linse beweist (Node, die geladene Klasse — D3c: am Lauf, nie am Quelltext; das Studio-Orakel F1a
// stand am Text der Shell und fiel):
//   F0  EINE QUELLE: der Stamm liest das SAISON_GESETZ des Kerns (foundry-core, `__terrainCore`), eine Kern-Stützstelle
//       ändert die Welt;
//   F1  `_saisonMul(phase)`: Sommer-Mitte exakt ×1, Herbst und Winter deutlich verschieden;
//   F2  keine Paletten-Literale in der Shell (die dritte Palette im Stamm, `_seasonTint`, bewacht gate:fluss S5b);
//   F3  `_tickSeason` fährt die Uniform aus `_saisonMul` (kein Neubau) und bestellt jede gelegte Karte einer anderen Stufe
//       des Jahrs neu (`_karteJahrTakt`), nie je Bild.
// JEDE STUFE LIEST DAS JAHR (w21-laub-jahr-fern, Befund des Schöpfers: im Winter wich das Laub nah, Karte und Ferne blieben voll):
//   F4  die Karte backt im Jahr (`_karteJahr`, der Eingang ihres Bakes `_karteWeltBacken`): Sommer ×1, Winter in der Präsenz
//       und Tönung des EINEN Gesetzes;
//   F5  die Ferne (phyto-core `kroneImJahr`, ihre Leser Ring, Boden, Feld und Kamm `_kammKroneSaison`): Sommer exakt, das Laub
//       deckt im Winter ≤ 0,3, die Nadel steht ungetönt.
//   F6  der Halm im Jahr (phyto-core `halmImJahr`, w26): Fläche und Fläche von oben × ha, der Stoff (`_halmImJahr`) und das Labor
//       (`halmJahrGlsl`) lesen das Gesetz, kein Leser staucht nur y.
//   node scripts/diag-season-meadow.cjs [--selftest]          (npm run gate:season-meadow)
"use strict";
const { selbsttestEnde, wandEnde, SELBSTTEST, stammLib, ROOT: root } = require("./lib/welt-boot.cjs");

const { AnazhRealm: A, ctx } = stammLib.ladeKlasse(root);
// die Absenzen über den EINEN Helfer (stammLib.fehlt, kommentarfrei); `o.shell` die Wandlung der Shell im Selbsttest
const SHELL = "worlds/terrain/phytogenesis.js";

// o.welt(phase) → {r,g,b} (die Methode der Klasse), o.mul: der Leser, den `_tickSeason` ruft (Selbsttest: gebrochen)
function pruefe(o) {
    const aus = [];
    const pruef = (name, ok, detail) => aus.push([name, !!ok, detail || ""]);
    const SG = ctx.SAISON_GESETZ;
    const herbst = (ph) => JSON.stringify(o.welt(ph));
    const vor = herbst(0.625);
    const alt = SG && SG.stuetzen[2].ti;
    if (SG) SG.stuetzen[2].ti = 0xa0602a;
    const folgt = herbst(0.625) !== vor;
    if (SG) SG.stuetzen[2].ti = alt;
    pruef(
        "F0 der Stamm liest das SAISON_GESETZ des Kerns (+ __terrainCore), eine Kern-Stützstelle ändert die Welt",
        SG && ctx.__terrainCore.SAISON_GESETZ === SG && A._saisonGesetz() === SG && folgt
    );
    const werte = {};
    for (const [n, ph] of Object.entries({ spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 })) werte[n] = o.welt(ph);
    const d = (x, y) => (x && y ? Math.abs(x.r - y.r) + Math.abs(x.g - y.g) + Math.abs(x.b - y.b) : 0);
    pruef(
        "F1 Sommer-Mitte exakt ×1, Herbst und Winter deutlich verschieden",
        werte.summer && d(werte.summer, { r: 1, g: 1, b: 1 }) < 1e-12 && d(werte.autumn, werte.summer) > 0.3 && d(werte.winter, werte.summer) > 0.3,
        Object.entries(werte)
            .map(([n, c]) => `${n} (${c.r.toFixed(2)},${c.g.toFixed(2)},${c.b.toFixed(2)})`)
            .join(" · ")
    );
    pruef(
        "F2a die Shell trägt keine Paletten-Literale (Stützstellen nur im SAISON_GESETZ)",
        stammLib.fehlt(null, /0x6a9a3e|0xb0702a|0x6e6650/, { datei: SHELL, wandel: o.shell }),
        stammLib.fehlt.wo
    );
    // die Sommer-Karten a, b backen im Herbst neu, c trägt seine Stufe (8), d ist nicht gelegt; der zweite Takt ruht
    const z = (key, jahr, gebacken = 1) => [key, { key, jahr, gebacken }];
    const w = Object.assign(Object.create(A.prototype), { _kartenAtlas: { zellen: new Map([z("a", 0), z("b", 4), z("c", 8), z("d", 0, 0)]) }, _impostorBakeQueue: [], _schneeTakt() {}, _pegelTakt() {} }); // prettier-ignore
    w.state = { seasonPhase: 0.625, autoSeason: false };
    const u = { uSeasonMul: { value: { r: 1, g: 1, b: 1 } } };
    w._ensureSeasonUniforms = () => (w.state.seasonUniforms = u);
    if (o.mul) w._saisonMul = o.mul;
    if (o.takt) w._karteJahrTakt = o.takt;
    A.prototype._tickSeason.call(w);
    A.prototype._tickSeason.call(w);
    pruef(
        "F3 _tickSeason fährt uSeasonMul aus _saisonMul und bestellt die Karten anderer Stufe",
        d(u.uSeasonMul.value, o.welt(0.625)) < 1e-12 && d(u.uSeasonMul.value, { r: 1, g: 1, b: 1 }) > 0.3 && w.state.season === "autumn" && w._impostorBakeQueue + "" === "a,b", // prettier-ignore
        JSON.stringify(u.uSeasonMul.value) + w._impostorBakeQueue
    );
    // die Karte (`_karteJahr`) und die Ferne (phyto-core `kroneImJahr`, der Kamm `_kammKroneSaison`) im Winter der Welt
    const W = Object.assign(Object.create(A.prototype), { state: { seasonPhase: 0.875 } });
    const wi = (o.karteJahr || A.prototype._karteJahr).call(W, 0.875);
    const pw = SG.stuetzen[3].pr;
    pruef("F4 die Karte backt im Jahr", wi.praesenz.x === pw && d(wi.mul, o.welt(0.875)) < 1e-12, wi.praesenz.x);
    const kr = (...x) => (o.krone || ctx.__phytoCore.kroneImJahr)(ctx.__phytoCore.WIND_ZAHLEN, ...x);
    const [so, la, na] = [kr(1, 1, 3, 2, 1, 1), kr(pw, 2, 3, 2, 1, 1), kr(pw, 2, 3, 0, 0, 0)];
    const ecke = { setXYZ() {}, setX: (i, v) => (ecke[i] = v) };
    const art = { laub: [[1, 1, 1], [1, 1, 1]], wirft: [1, 0], rinde: [[1, 1, 1], [1, 1, 1]] }; // prettier-ignore
    (o.kamm || A.prototype._kammKroneSaison).call(W, { laub: art, mesh: { geometry: { userData: { kammArt: [0, 1] }, attributes: { color: ecke, aDeckt: ecke } } } }); // prettier-ignore
    pruef(
        "F5 die Ferne liest das Jahr",
        so.farbe === 3 && so.deckung === 1 && la.deckung <= 0.3 && na.farbe === 3 && na.deckung === 1 && ecke[0] <= 0.3 && ecke[1] === 1, // prettier-ignore
        [la.deckung, ecke[0], ecke[1]]
    );
    // F6 DER HALM IM JAHR (w26-winter-fichte, vegetation.K5#2): `ha` ist der Anteil der Sommer-LÄNGE — an einem Halm wie emitGrass
    // (geneigt, gebogen, breit) fallen seine Fläche und die von oben genau mit ha (phyto-core `halmImJahr`), der Stoff der Welt
    // liest das Gesetz (`_halmImJahr` über einer Zahlen-TSL), das Labor auch (`halmJahrGlsl` = WIND_GLSL), und kein Leser staucht
    // nur y (bis w26: Fläche 0,44, von oben 1,00 — LAI 2–10 m Winter 0,567 × Sommer, Radeon 87537d3f)
    const PC = ctx.__phytoCore, ha = SG.stuetzen[3].ha, halm = o.halm || PC.halmImJahr; // prettier-ignore
    const ecken = [];
    for (let s = 0, p = [0.02, 0, -0.01], d = [Math.sin(0.3), Math.cos(0.3), 0]; s <= 4; s++) {
        if (s) (d = [d[0] + 0.12 * s * s * 0.1, d[1] - 0.1 * s * s * 0.1, d[2]].map((v, _, a) => v / Math.hypot(...a))), (p = p.map((v, i) => v + d[i] * 0.3)); // prettier-ignore
        const b = 0.035 * (1 - (s / 4) ** 1.5), n = [-d[1], d[0], 0]; // die Breite längs z, die Normale in der Ebene des Halms
        ecken.push([p[0], p[1], p[2] - b, n], [p[0], p[1], p[2] + b, n]);
    }
    const flaeche = (f) => {
        const P = ecken.map(([x, y, z, n]) => f(x, y, z, n));
        let [A, Ay] = [0, 0];
        for (let i = 0; i + 3 < P.length; i += 2)
            for (const [a, b, c] of [[P[i], P[i + 1], P[i + 2]], [P[i + 1], P[i + 3], P[i + 2]]]) { // prettier-ignore
                const [u, v] = [b.map((q, k) => q - a[k]), c.map((q, k) => q - a[k])];
                const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
                (A += Math.hypot(...n) / 2), (Ay += Math.abs(n[1]) / 2);
            }
        return [A, Ay];
    };
    const kern = (h) => (x, y, z, n) => ((J) => [J.x + 0.02, J.y, J.z - 0.01])(halm(PC.WIND_ZAHLEN, h, x - 0.02, y, z + 0.01, n[0], n[2], 0)); // prettier-ignore
    const [s0, s1, wi6] = [flaeche((...e) => e.slice(0, 3)), flaeche(kern(1)), flaeche(kern(ha))];
    // der Stoff der Welt über einer Zahlen-TSL (Knoten mit Zahl oder vec3): dieselbe Ecke wie das Gesetz
    const N = (v) => ({ v, get x() { return N(v[0]); }, get y() { return N(v[1]); }, get z() { return N(v[2]); }, add: (b) => N2(v, b, (p, q) => p + q), sub: (b) => N2(v, b, (p, q) => p - q), mul: (b) => N2(v, b, (p, q) => p * q) }); // prettier-ignore
    const N2 = (a, b, f) => ((bv) => N(Array.isArray(a) || Array.isArray(bv) ? [0, 1, 2].map((i) => f(Array.isArray(a) ? a[i] : a, Array.isArray(bv) ? bv[i] : bv)) : f(a, bv)))(b.v === undefined ? b : b.v); // prettier-ignore
    const Tz = { float: N, vec3: (...k) => N(k.map((q) => (q.v === undefined ? q : q.v))), min: (a, b) => N(Math.min(a.v, b.v)), max: (a, b) => N(Math.max(a.v, b.v)), pow: (a, b) => N(Math.pow(a.v, b.v)), sqrt: (a) => N(Math.sqrt(a.v)), sin: (a) => N(Math.sin(a.v)), step: (e, x) => N(x.v >= e ? 1 : 0), normalGeometry: N([0.8, 0.5, 0.33]), attribute: () => N([0.1, 0, -0.2]) }; // prettier-ignore
    const ws = Object.assign(Object.create(A.prototype), { _ensureSeasonUniforms: () => ({ uLaubPraesenz: { z: N(ha) } }) }); // prettier-ignore
    const st = (o.halmStamm || A.prototype._halmImJahr).call(ws, Tz, N([0.1, 0, -0.2]), N([0.35, 0.6, -0.1])).v;
    const ref = PC.halmImJahr(PC.WIND_ZAHLEN, ha, 0.25, 0.6, 0.1, 0.8, 0.33, 0);
    const glsl = (o.glsl || ctx.halmJahrGlsl)();
    const yNur = stammLib.fehlt(null, /positionLocal\.mul\(\s*TSL\.vec3\(\s*1\s*,\s*_ha\s*,\s*1\s*\)\)|lage\.y\.mul\(\s*ha\s*\)/, { wandel: o.stamm }); // prettier-ignore
    pruef(
        "F6 der Halm kürzt im Jahr seine Fläche mit ha (Kern), der Stoff der Welt und das Labor lesen das Gesetz, kein Leser staucht nur y",
        Math.abs(s1[0] - s0[0]) < 1e-9 && Math.abs(wi6[0] / s0[0] - ha) < 0.01 && Math.abs(wi6[1] / s0[1] - ha) < 0.01 &&
            Math.hypot(st[0] - 0.1 - ref.x, st[1] - ref.y, st[2] + 0.2 - ref.z) < 1e-9 &&
            glsl.includes(PC.halmImJahr(PC.WIND_GLSL, "_hHa", "_hO.x", "_hO.y", "_hO.z", "objectNormal.x", "objectNormal.z", "_hAe").x) && yNur, // prettier-ignore
        `Fläche ${(wi6[0] / s0[0]).toFixed(3)} · von oben ${(wi6[1] / s0[1]).toFixed(3)} bei ha ${ha} · Stoff ${st.map((q) => q.toFixed(3))} · ${yNur ? "" : stammLib.fehlt.wo}` // prettier-ignore
    );
    return aus;
}
const WELT = (ph) => A.prototype._saisonMul.call(null, ph, {});

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();
if (SELBSTTEST) {
    console.log("=== SAISON-FARBE — SELBST-TEST: die Linse feuert auf injizierte Brüche ===");
    const roh = (o, wer) => pruefe(Object.assign({ welt: WELT }, o)).find((g) => g[0].startsWith(wer))[1] === false;
    check("Selbst-Test 1: Welt ohne Phasen-Versatz (+0,125) → F1 rot", roh({ welt: (ph) => WELT(ph + 0.125) }, "F1"));
    check("Selbst-Test 2: die Welt mit eigenem Gesetz (folgt der Kern-Stützstelle nicht) → F0 rot", roh({ welt: (ph) => (ph === 0.625 ? { r: 1.2, g: 0.9, b: 0.7 } : WELT(ph)) }, "F0"));
    check(
        "Selbst-Test 3: eine Paletten-Kopie zurück in die Shell → F2a rot",
        roh({ shell: (t) => t.replace("const seq = SAISON_GESETZ.stuetzen;", "const seq = [{ ti: 0x6a9a3e }];") }, "F2a")
    );
    check("Selbst-Test 5: _tickSeason ohne Leser (der Mul schreibt nicht) → F3 rot", roh({ mul: () => null }, "F3"));
    // die Brüche des Befunds (w21): der Takt bestellt nie, die Karte backt Sommer, Ferne und Kamm tragen nur Farbe
    check("Selbst-Test 6: der Takt bestellt nie → F3 rot", roh({ takt() {} }, "F3"));
    check("Selbst-Test 7: die Karte backt Sommer → F4 rot", roh({ karteJahr: () => ({ praesenz: { x: 1 } }) }, "F4"));
    check("Selbst-Test 8: die Ferne ohne Präsenz → F5 rot", roh({ krone: (Z, p, S, K) => ({ farbe: K, deckung: 1 }) }, "F5"));
    check("Selbst-Test 9: der Kamm färbt nur → F5 rot", roh({ kamm() {} }, "F5"));
    // die Brüche des Befunds (w26): das Gesetz, der Stoff, das Labor und der Stamm stauchen nur y
    check("Selbst-Test 10: das Gesetz staucht nur y → F6 rot", roh({ halm: (Z, h, x, y, z) => ({ x, y: y * h, z }) }, "F6"));
    check("Selbst-Test 11: der Stoff staucht nur y → F6 rot", roh({ halmStamm: (T, f, l) => T.vec3(l.x, l.y.mul(0.35), l.z) }, "F6")); // prettier-ignore
    check("Selbst-Test 12: das Labor staucht nur y → F6 rot", roh({ glsl: () => "transformed.y*=clamp(uHalm,0.0,1.0);" }, "F6"));
    check("Selbst-Test 13: die Ferne staucht nur y → F6 rot", roh({ stamm: (t) => t.replace("this._halmFerneKnoten = jahr.mul(v)", "this._halmFerneKnoten = T.vec3(lage.x, lage.y.mul(ha), lage.z).mul(v)") }, "F6")); // prettier-ignore
    selbsttestEnde(errs, "die Saison-Farb-Linse feuert auf jede injizierte Bruch-Klasse.");
    process.exit(0);
}
console.log("=== DIE SAISON IST EINE FARBE — uSeasonMul nach dem Studio-Gesetz (Node, die geladene Klasse) ===");
for (const [n, ok, d] of pruefe({ welt: WELT })) check(n, ok, d);
wandEnde(errs, "die Welt färbt ihr Jahr wie das Studio: EINE Uniform, keine Saison im Körper.");
