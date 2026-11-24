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
//   F7  die Phänologie je Art (leben.pflanzen.jahreslauf#2, phyto-core PHAENO_GESETZ): der Kalender des Spiels JE ART
//       (`_saisonPraesenz(phase, o, art)`, die erste Woche nach der kahlen Krone, in der Laub oder die eigene Blüte der Art ≥ 0,5
//       steht) folgt der Reihe des Phänologie-Netzes (DWD 1991–2020: Hasel, Erle, Birke, Buche, Eiche) mit Rang ≥ 0,8, und der Stoff
//       liest das Gesetz je Art (`_jahrLage`: `laubImJahr` über dem Stoff-Wert `userData.jahrArt`; die Gestalt reicht ihre Art,
//       `_foundryBuildGroup` über `_phaenoArtVon`). Bis jahreslauf#2 trug jede Art EINE Kurve: Rang 0.
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
        "F0 der Stamm liest das SAISON_GESETZ des Kerns",
        SG && ctx.__terrainCore.SAISON_GESETZ === SG && A._saisonGesetz() === SG && folgt
    );
    const werte = {};
    for (const [n, ph] of Object.entries({ spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 })) werte[n] = o.welt(ph);
    const d = (x, y) => (x && y ? Math.abs(x.r - y.r) + Math.abs(x.g - y.g) + Math.abs(x.b - y.b) : 0);
    pruef(
        "F1 Sommer ×1, Herbst und Winter verschieden",
        werte.summer && d(werte.summer, { r: 1, g: 1, b: 1 }) < 1e-12 && d(werte.autumn, werte.summer) > 0.3 && d(werte.winter, werte.summer) > 0.3,
        Object.entries(werte)
            .map(([n, c]) => `${n} (${c.r.toFixed(2)},${c.g.toFixed(2)},${c.b.toFixed(2)})`)
            .join(" · ")
    );
    pruef(
        "F2a keine Paletten-Literale in der Shell",
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
        "F3 _tickSeason tönt und bestellt die Karten",
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
    // F6 DER HALM IM JAHR (w26-winter-fichte, vegetation.K5#2): `ha` ist der Anteil der Sommer-LÄNGE (phyto-core `halmImJahr`) — an
    // den zwei Kanten einer Zeile eines geneigten Halms (Mitte m, Breite ±w quer zu seiner Ebene, die Normale in ihr) kürzt die
    // Mitte auf ha · m, die Breite bleibt (die Fläche fällt genau mit ha), die Ähre kürzt als Ganzes, der Sommer ist exakt; der Stoff
    // der Welt (`_halmImJahr`, Gras-Stoff und Ferne) und das Labor (`halmJahrGlsl` = WIND_GLSL) lesen das Gesetz, kein Leser
    // staucht nur y (bis w26: Fläche 0,44, von oben 1,00 — LAI 2–10 m Winter 0,567 × Sommer, Radeon 87537d3f)
    const [PC, ha] = [ctx.__phytoCore, SG.stuetzen[3].ha];
    const J = (h, ae = 0) => Object.values((o.halm || PC.halmImJahr)(PC.WIND_ZAHLEN, h, 0.3, 0.9, 0.04, -0.95, 0, ae)).map((q, i) => (q / [0.3, 0.9, 0.04][i]).toFixed(9)); // prettier-ignore
    pruef(
        "F6 der Halm kürzt seine Länge",
        [J(ha), J(ha, 1)] + "" === [ha, ha, 1, ha, ha, ha].map((q) => q.toFixed(9)) + "" && ["_halmFerne", "_foundryTreeMaterial"].every((g) => !stammLib.fehlt(g, /_halmImJahr\(/, { wandel: o.stamm })) // prettier-ignore
    );
    // F7 DIE PHÄNOLOGIE JE ART (jahreslauf#2): der Kalender JE ART gegen die Reihe des Netzes, der Stoff liest das Gesetz je Art
    const REIHE = ["busch_hazel", "baum_erle", "baum_birke", "baum_buche", "baum_eiche"];
    const Wj = Object.assign(Object.create(A.prototype), { state: { seasonPhase: 0.375 } });
    const praes = o.praesenz || A.prototype._saisonPraesenz;
    const kurve = (art) => Array.from({ length: 52 }, (_, i) => { const q = praes.call(Wj, i / 52, {}, art); return [q.x, q.y]; }); // prettier-ignore
    const bestand = kurve(undefined);
    const kal = REIHE.map((a) => {
        const k = kurve(a);
        const eigen = k.some((q, i) => Math.abs(q[1] - bestand[i][1]) > 1e-6);
        const x = k.map((q) => q[0]);
        const tief = x.indexOf(Math.min(...x));
        for (let s = 1; s <= 52; s++) { const i = (tief + s) % 52; if (x[i] >= 0.5 || (eigen && k[i][1] >= 0.5)) return i; } // prettier-ignore
        return 99;
    });
    const rk = (v) => v.map((q) => v.filter((p) => p < q).length + (v.filter((p) => p === q).length - 1) / 2);
    const pear = (a, b) => { const n = a.length, ma = a.reduce((s, q) => s + q, 0) / n, mb = b.reduce((s, q) => s + q, 0) / n; let ab = 0, aa = 0, bb = 0; for (let i = 0; i < n; i++) { ab += (a[i] - ma) * (b[i] - mb); aa += (a[i] - ma) ** 2; bb += (b[i] - mb) ** 2; } return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0; }; // prettier-ignore
    const rang = pear(rk(kal), rk(REIHE.map((_, i) => i)));
    const stoff = !stammLib.fehlt("_jahrLage", /laubImJahr\([\s\S]*userData\.jahrArt|userData\.jahrArt[\s\S]*laubImJahr\(/, { wandel: o.stamm }) && !stammLib.fehlt("_foundryBuildGroup", /_phaenoArtVon\(/, { wandel: o.stamm }); // prettier-ignore
    pruef("F7 die Phänologie je Art", rang >= 0.8 && stoff, "Kalender (Woche) " + REIHE.map((a, i) => a + " " + kal[i]).join(" · ") + " · Rang " + rang.toFixed(3) + (stoff ? "" : " · der Stoff liest die Art nicht")); // prettier-ignore
    return aus;
}
const WELT = (ph) => A.prototype._saisonMul.call(null, ph, {});

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();
if (SELBSTTEST) {
    console.log("=== SAISON-FARBE — SELBST-TEST ===");
    const roh = (o, wer) => pruefe(Object.assign({ welt: WELT }, o)).find((g) => g[0].startsWith(wer))[1] === false;
    check("Selbst-Test 1: ohne Phasen-Versatz → F1 rot", roh({ welt: (ph) => WELT(ph + 0.125) }, "F1"));
    check("Selbst-Test 2: eigenes Gesetz → F0 rot", roh({ welt: (ph) => (ph === 0.625 ? { r: 1.2, g: 0.9, b: 0.7 } : WELT(ph)) }, "F0"));
    check(
        "Selbst-Test 3: Paletten-Kopie → F2a rot",
        roh({ shell: (t) => t.replace("const seq = SAISON_GESETZ.stuetzen;", "const seq = [{ ti: 0x6a9a3e }];") }, "F2a")
    );
    check("Selbst-Test 5: ohne Leser → F3 rot", roh({ mul: () => null }, "F3"));
    // die Brüche des Befunds (w21): der Takt bestellt nie, die Karte backt Sommer, Ferne und Kamm tragen nur Farbe
    check("Selbst-Test 6: Takt bestellt nie → F3 rot", roh({ takt() {} }, "F3"));
    check("Selbst-Test 7: Karte backt Sommer → F4 rot", roh({ karteJahr: () => ({ praesenz: { x: 1 } }) }, "F4"));
    check("Selbst-Test 8: Ferne ohne Präsenz → F5 rot", roh({ krone: (Z, p, S, K) => ({ farbe: K, deckung: 1 }) }, "F5"));
    check("Selbst-Test 9: Kamm färbt nur → F5 rot", roh({ kamm() {} }, "F5"));
    // die Brüche des Befunds (w26): das Gesetz und die Ferne stauchen nur y (das Labor liest das Gesetz über WIND_GLSL, `halmJahrGlsl`)
    check("Selbst-Test 10: Gesetz → F6 rot", roh({ halm: (Z, h, x, y, z) => ({ x, y: y * h, z }) }, "F6"));
    check("Selbst-Test 11: Ferne → F6 rot", roh({ stamm: (s) => s.replace("jahr = this._halmImJahr(T,", "jahr = (") }, "F6"));
    // der Täter von jahreslauf#2: EINE Kurve für jede Art (die Art fällt), der Stoff liest die Präsenz ohne Art
    check("Selbst-Test 12: eine Kurve für jede Art → F7 rot", roh({ praesenz(ph, out) { return A.prototype._saisonPraesenz.call(this, ph, out); } }, "F7")); // prettier-ignore
    check("Selbst-Test 13: Stoff ohne Art → F7 rot", roh({ stamm: (s) => s.replace('this._stoffWert(T, "userData.jahrArt", "vec2")', "T.vec2(376, -1)") }, "F7")); // prettier-ignore
    selbsttestEnde(errs, "die Jahres-Linse feuert.");
    process.exit(0);
}
console.log("=== DAS JAHR DER WELT ===");
for (const [n, ok, d] of pruefe({ welt: WELT })) check(n, ok, d);
wandEnde(errs, "das Jahr der Welt ist das des Studios.");
