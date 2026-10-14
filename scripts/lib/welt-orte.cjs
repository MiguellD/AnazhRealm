"use strict";
// DIE ORTE AUS DER WELT (K16, Prüfung Runde 2): eine Probe trägt keinen Ort als Zahlen-Paar — seit die Landform im
// Gelände-Kern liegt, steht an den Orten der alten Welt anderes Gelände (der Biss am Hang, der Baum im Haus, die Ankunft im
// Ursprung: drei rote Gruppen der CI). Zwei Quellen tragen jeden Ort einer Probe:
//   - der MESSORT der Band-Serie aus EINER Datei (spec/profiband/haushalt.json, `messorte[].spieler`/`blick` — dieselbe, an
//     der `werkbank umstellen --ort` den Spieler aufstellt), nie als Abschrift;
//   - die STELLE aus der Welt (`__weltOrt` in der Seite): gesucht in Ringen um die Mitte, geprüft am Gesetz und am gebauten
//     Boden — eben, Hang, Hangfuß. Findet die Suche nichts, kommt null zurück (die Probe nennt das laut, nie ein Ersatz-Ort).
// Die Orts-Wand (gate:altlasten, `scanOrtsWand`) hält die Klasse geschlossen.
const { ladeSpec } = require("./band-urteil.cjs");

// der EINE Leser des Haushalts (band-urteil `ladeSpec`, derselbe wie werkbank und gate:vehicle-drive), hier als Ort {x, z}
function messort(id) {
    const o = ladeSpec(id).ort;
    if (!o || !Array.isArray(o.spieler))
        throw new Error(`messort: kein Messort "${id}" in spec/profiband/haushalt.json`);
    const b = Array.isArray(o.blick) ? o.blick : o.spieler;
    return { id, x: o.spieler[0], z: o.spieler[1], blick: { x: b[0], z: b[1] }, wiese: o.wiese || null };
}

// DIE WIESE (K55): ein Messort der Art Wiese trägt ihr Gesetz im Haushalt (`messorte[].wiese`) — gemessen wird an EINER
// Funktion mit zwei Wirten: in der Seite die Welt selbst (`werkbank umstellen --ort`, die Suche `__weltOrt("wiese")`), ohne
// Browser der Wirt am Gesetz (`wirtAmGesetz`: gelaende-core, phyto-core und die Wald-Methoden aus dem Stamm-Text —
// gate:profiband H1). Bis K55 stand die Mess-Wiese als Zahlen-Paar −900/−850 im Haushalt; K16 hob dort den Boden um 83 m, am
// Hang stand Nadelwald (fichte/tanne +16 Befehle, busch 0), und die ABAB 1410-2 verglich zwei Szenen.
// Gemessen am Ort (x, z) mit Blick-Punkt `blick` ([x, z]; null = die beste von 16 Richtungen) über den Ring `ring` m:
//   hang     — die Neigung der Ausgleichs-Ebene des Gesetzes (`_terrainMacroSurfaceY`, Mitte + 5 Kreise × 12 Speichen), Grad
//   nass     — der Anteil der Ring-Punkte, die das Land nicht trägt (`_landAt` mit `trockenMarge`)
//   krone    — die Kronen-Fläche π·T² der STEHENDEN Bäume des Wald-Gesetzes (`_forestCellDarts` → `_forestDartSteht` →
//              `_wildnisTraegt`, derselbe Gang wie `_forestPlantChunk`) mit Stamm im Ring, je Ring-Fläche
//   kranz    — dieselbe Fläche im Kranz `rand` [r0, r1] m je Kranz-Fläche: der Waldrand
//   imBlick  — stehende Bäume, deren KRONE (Scheibe T um den Stamm) binnen `blickFrei` m in den Sektor ±`blickWinkel`° um den
//              Blick ragt oder über dem Auge steht (die Ego-Sicht ist frei: an der ersten Wahl −538/−636 hing eine Birke 3,7 m
//              hinter dem Auge mit 29 % Laub im Bild, ihr Stamm lag außerhalb des Sektors)
//   horizont — der größte Erhebungswinkel des Gesetzes über dem Auge (+1,7 m) längs des Blicks über `fern` m: der Fernblick
//   gras     — das Mittel des Wiesen-Gewichts der GEBAUTEN Boden-Karte (`_bodenSichtAt` … `gruen`, derselbe Leser wie die
//              Nah-Wiese) über die Ring-Punkte; null, wo der Wirt keine Karte trägt (ohne Browser) oder ein Punkt ungebaut ist
// `nurBoden`: nur hang und nass (die Vorprüfung der Suche).
function wieseMessen(r, x, z, blick, S, nurBoden) {
    const H = (px, pz) => r._terrainMacroSurfaceY(px, pz);
    const R = S.ring;
    const pkt = [[0, 0]];
    for (let i = 1; i <= 5; i++)
        for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2;
            pkt.push([(Math.cos(a) * R * i) / 5, (Math.sin(a) * R * i) / 5]);
        }
    let sh = 0,
        sxh = 0,
        szh = 0,
        sxx = 0,
        szz = 0,
        nass = 0;
    const hs = [];
    for (const [dx, dz] of pkt) {
        const h = H(x + dx, z + dz);
        if (!Number.isFinite(h)) return { fehler: `kein Gesetz-Boden bei ${Math.round(x + dx)}/${Math.round(z + dz)}` };
        hs.push(h);
        sh += h;
        sxh += dx * h;
        szh += dz * h;
        sxx += dx * dx;
        szz += dz * dz;
        if (!r._landAt(x + dx, z + dz, S.trockenMarge)) nass++;
    }
    const b = sxh / sxx,
        c = szh / szz,
        y = sh / pkt.length;
    let rest = 0;
    pkt.forEach(([dx, dz], i) => {
        const e = hs[i] - (y + b * dx + c * dz);
        rest += e * e;
    });
    const r2 = (v) => Math.round(v * 100) / 100;
    const r3 = (v) => Math.round(v * 1000) / 1000;
    const m = {
        x,
        z,
        y: r2(y),
        hang: r2((Math.atan(Math.hypot(b, c)) * 180) / Math.PI),
        rauh: r2(Math.sqrt(rest / pkt.length)),
        nass: r3(nass / pkt.length),
    };
    if (nurBoden) return m;
    // der Wald: die stehenden Bäume bis zum Kranz-Ende
    const C = r.constructor.FOREST.cell;
    const seedInt = r._forestSeedInt();
    const memo = new Map();
    const zelle = (gx, gz) => {
        const k = gx + "," + gz;
        let d = memo.get(k);
        if (!d) memo.set(k, (d = r._forestCellDarts(gx, gz, seedInt)));
        return d;
    };
    const [r0, r1] = S.rand;
    const baeume = [];
    for (let gz = Math.floor((z - r1) / C); gz <= Math.floor((z + r1) / C); gz++)
        for (let gx = Math.floor((x - r1) / C); gx <= Math.floor((x + r1) / C); gx++)
            for (const d of zelle(gx, gz)) {
                const dd = Math.hypot(d.x - x, d.z - z);
                if (dd > r1 || !r._forestDartSteht(d, gx, gz, zelle) || !r._wildnisTraegt(d.x, d.z)) continue;
                baeume.push({ dx: d.x - x, dz: d.z - z, dd, T: d.T, a: Math.PI * d.T * d.T, sp: d.sp });
            }
    let krone = 0,
        kranz = 0,
        imRing = 0;
    for (const t of baeume) {
        if (t.dd <= R) {
            krone += t.a;
            imRing++;
        } else if (t.dd >= r0) kranz += t.a;
    }
    m.krone = r3(krone / (Math.PI * R * R));
    m.baeume = imRing;
    m.kranz = r3(kranz / (Math.PI * (r1 * r1 - r0 * r0)));
    // der Blick: je Richtung die Bäume im Sektor und der Horizont des Gesetzes
    const auge = H(x, z) + 1.7;
    const W = (S.blickWinkel * Math.PI) / 180;
    const richtung = (ux, uz) => {
        let imBlick = 0;
        for (const t of baeume) {
            if (t.dd <= t.T) {
                imBlick++; // die Krone steht über dem Auge
                continue;
            }
            if (t.dd - t.T > S.blickFrei) continue;
            const ab = Math.acos(Math.max(-1, Math.min(1, (t.dx * ux + t.dz * uz) / t.dd)));
            if (ab - Math.asin(t.T / t.dd) < W) imBlick++;
        }
        let horizont = -90;
        for (let d = S.fern[0]; d <= S.fern[1]; d += 20)
            horizont = Math.max(horizont, (Math.atan2(H(x + ux * d, z + uz * d) - auge, d) * 180) / Math.PI);
        return { imBlick, horizont: r2(horizont), ux, uz };
    };
    let w;
    if (blick) {
        const l = Math.hypot(blick[0] - x, blick[1] - z);
        w = richtung((blick[0] - x) / l, (blick[1] - z) / l);
    } else
        for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2;
            const e = richtung(Math.sin(a), Math.cos(a));
            if (!w || e.imBlick < w.imBlick || (e.imBlick === w.imBlick && e.horizont < w.horizont)) w = e;
        }
    m.imBlick = w.imBlick;
    m.horizont = w.horizont;
    m.blick = blick || [Math.round((x + w.ux * 10) * 10) / 10, Math.round((z + w.uz * 10) * 10) / 10];
    // das Gras der gebauten Boden-Karte (nur in der Welt)
    m.gras = null;
    if (typeof r._bodenSichtAt === "function") {
        const g = {};
        let s = 0,
            n = 0;
        for (const [dx, dz] of pkt) {
            if (r._bodenSichtAt(x + dx, z + dz, g) === null) {
                n = -1;
                break;
            }
            s += g.gruen;
            n++;
        }
        m.gras = n > 0 ? r3(s / n) : null;
    }
    return m;
}

// DER WIRT AM GESETZ (ohne Browser): die ECHTE Klasse im vm (scripts/lib/stamm.cjs `ladeKlasse`: die Kerne, die index.html vor
// dem Stamm lädt, dann der Stamm) und eine frisch geborene Welt ohne Bau — `ensureWorldMeta` gibt ihr Saat und Genese-Version,
// gelaende-core `GRUND` Basis und Meer. Er misst das Gesetz (Höhe, Land, Wald); was nur der Bau trägt (die Boden-Karte des
// Grases, die Hydro-Kacheln eines gebauten Rings), misst nur die Welt.
function wirtAmGesetz(root) {
    const { AnazhRealm: A, ctx } = require("./stamm.cjs").ladeKlasse(root || require("path").join(__dirname, "..", ".."));
    const G = ctx.__gelaendeCore.GRUND;
    const w = Object.create(A.prototype);
    w.state = { worldMeta: {}, terrainBaseHeight: G.basis, waterLevel: G.basis - G.meerUnterBasis };
    w.ensureWorldMeta();
    return w;
}

// DAS URTEIL DER WIESE (rein): je verletztem Teil ein Befund beim Namen; `gras` urteilt, wo es gemessen ist — fordert der
// Aufrufer es (`mitGras`, die Welt nach dem Einschwingen), ist ein ungemessenes Gras ROT.
function wieseUrteil(m, S, mitGras) {
    const f = [];
    if (!m || m.fehler) return [`Wiese: nicht gemessen (${(m && m.fehler) || "keine Messung"})`];
    const wo = `${m.x}/${m.z}`;
    if (m.hang > S.hangMax) f.push(`Wiese ${wo}: Hang ${m.hang}° über ${S.hangMax}° (Ausgleichs-Ebene über ${S.ring} m)`);
    if (m.nass > 0) f.push(`Wiese ${wo}: ${Math.round(m.nass * 100)} % des Rings tragen Wasser`);
    if (m.krone != null && m.krone > S.kroneMax)
        f.push(`Wiese ${wo}: Kronen-Deckung im Ring ${m.krone} über ${S.kroneMax} (${m.baeume} Bäume binnen ${S.ring} m)`);
    if (m.kranz != null && m.kranz < S.randMin)
        f.push(`Wiese ${wo}: kein Waldrand — Kronen-Deckung im Kranz ${S.rand.join("–")} m ${m.kranz} unter ${S.randMin}`);
    if (m.imBlick > 0) f.push(`Wiese ${wo}: ${m.imBlick} Baum/Bäume im Blick binnen ${S.blickFrei} m`);
    if (m.horizont != null && m.horizont > S.horizontMax)
        f.push(`Wiese ${wo}: kein Fernblick — das Gelände steigt ${m.horizont}° über das Auge (Grenze ${S.horizontMax}°)`);
    if (m.gras != null && m.gras < S.grasMin) f.push(`Wiese ${wo}: Wiesen-Gewicht der Boden-Karte ${m.gras} unter ${S.grasMin}`);
    if (mitGras && m.gras == null) f.push(`Wiese ${wo}: das Gras ist ungemessen (die Boden-Karte steht im Ring nicht)`);
    return f;
}

// In der Seite: die nächste Stelle der gewünschten Art um (mx, mz). Arten:
//   eben      — Land ohne Nässe, die Spanne des Bodens im Umkreis `r` (8 Speichen) ≤ `spanne` m, kein Fels darüber
//   hang      — die Neigung des Gesetzes (zentrale Differenz über 2 m) zwischen `min` und `max` Grad, Land ohne Nässe
//   hangfuss  — eine ebene Stelle (Neigung ≤ `fussMax` Grad), hinter der binnen `bis` m ein Hang ≥ `hangMin` Grad steigt;
//               zurück kommt auch die Richtung `gier` (rad, rotation.y-Sinn: 0 = +z), die auf den Hang zeigt
// opts: { mitte: [x, z] (Vorgabe der Messort `__messWiese`), rMax (m, Vorgabe 400), schritt (m, Vorgabe 6), ... }
function weltOrt(art, opts) {
    const o = opts || {};
    const r = window.anazhRealm;
    const mitte = o.mitte || window.__messWiese;
    if (!mitte) throw new Error("__weltOrt: keine Mitte (weder opts.mitte noch __messWiese)");
    const [mx, mz] = mitte;
    const rMax = o.rMax || 400;
    const schritt = o.schritt || 6;
    const H = (x, z) => r.getTerrainHeightAt(x, z);
    const trocken = (x, z) => r._landAt(x, z) && !(typeof r._nassAt === "function" && r._nassAt(x, z));
    const neigung = (x, z) => {
        const gx = (H(x + 1, z) - H(x - 1, z)) / 2;
        const gz = (H(x, z + 1) - H(x, z - 1)) / 2;
        return (Math.atan(Math.hypot(gx, gz)) * 180) / Math.PI;
    };
    const unterFels = (x, z) => typeof r._kreaturUnterFels === "function" && r._kreaturUnterFels(x, H(x, z), z);
    const pruefe = {
        eben: (x, z) => {
            const rr = o.r || 6;
            const sp = o.spanne == null ? 1 : o.spanne;
            let lo = Infinity,
                hi = -Infinity;
            for (let k = 0; k <= 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                const px = k === 8 ? x : x + Math.cos(a) * rr,
                    pz = k === 8 ? z : z + Math.sin(a) * rr;
                if (!trocken(px, pz)) return null;
                const h = H(px, pz);
                if (!Number.isFinite(h)) return null;
                lo = Math.min(lo, h);
                hi = Math.max(hi, h);
            }
            return hi - lo <= sp && !unterFels(x, z) ? { spanne: Math.round((hi - lo) * 100) / 100 } : null;
        },
        hang: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            const n = neigung(x, z);
            return n >= (o.min == null ? 25 : o.min) && n <= (o.max == null ? 35 : o.max)
                ? { neigung: Math.round(n * 10) / 10 }
                : null;
        },
        hangfuss: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            if (neigung(x, z) > (o.fussMax == null ? 5 : o.fussMax)) return null;
            const bis = o.bis || 10;
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2;
                const dx = Math.sin(a),
                    dz = Math.cos(a);
                for (let d = 3; d <= bis; d += 1) {
                    const px = x + dx * d,
                        pz = z + dz * d;
                    if (!trocken(px, pz)) break;
                    if (neigung(px, pz) >= (o.hangMin == null ? 15 : o.hangMin) && H(px, pz) > H(x, z) + 0.5)
                        return { gier: Math.round(a * 1000) / 1000, hangBei: d };
                }
            }
            return null;
        },
        // wiese — das Gesetz der Mess-Wiese (`o.wiese`, Vorgabe die Schwellen des Messorts `__wieseGesetz`): erst Boden (Hang,
        // Nässe), dann Wald, Blick und Horizont; zurück kommt die Messung samt dem besten Blick-Punkt
        // Die Suche steht vor dem Bau: das Gras liest sie am Gesetz der Boden-Farbe (`_bodenFarbeAt`, aus dem der Chunk jeden
        // Vertex färbt — dieselbe Wiesen-Wache g − (r+b)/2 wie die Boden-Karte), die gebaute Karte urteilt nach dem Umstellen.
        wiese: (x, z) => {
            const S = o.wiese || window.__wieseGesetz;
            const b = window.__wieseMessen(r, x, z, null, S, true);
            if (b.fehler || window.__wieseUrteil(b, S).length) return null;
            const gs = r.constructor.TERRAIN_GEOLOGY.gruenSchwelle;
            const f = [0, 0, 0];
            let g = 0;
            for (let i = 0; i <= 4; i++)
                for (let k = 0; k < (i ? 8 : 1); k++) {
                    const a = (k / 8) * Math.PI * 2;
                    const px = x + (Math.cos(a) * S.ring * i) / 4,
                        pz = z + (Math.sin(a) * S.ring * i) / 4;
                    r._bodenFarbeAt(px, r._terrainMacroSurfaceY(px, pz), pz, f);
                    const t = Math.max(0, Math.min(1, (f[1] - 0.5 * (f[0] + f[2])) / gs));
                    g += (t * t * (3 - 2 * t)) / 33;
                }
            if (g < S.grasMin) return null;
            const m = window.__wieseMessen(r, x, z, null, S);
            return window.__wieseUrteil(m, S).length ? null : Object.assign(m, { grasGesetz: Math.round(g * 1000) / 1000 });
        },
    }[art];
    if (!pruefe) throw new Error(`__weltOrt: unbekannte Art "${art}"`);
    for (let rr = 0; rr <= rMax; rr += schritt) {
        const n = Math.max(1, Math.round((2 * Math.PI * rr) / schritt));
        for (let q = 0; q < n; q++) {
            const a = (q / n) * Math.PI * 2 + rr * 0.37;
            const x = mx + Math.cos(a) * rr,
                z = mz + Math.sin(a) * rr;
            const p = pruefe(x, z);
            if (p)
                return Object.assign(
                    { art, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, y: H(x, z), abstand: rr },
                    p
                );
        }
    }
    return null;
}

const WIESE = messort("wiese");
// In die Seite: der Messort, sein Wiesen-Gesetz, die EINE Messung und ihr Urteil, die Orts-Suche.
const WIESE_INSTALL =
    `window.__wieseGesetz = ${JSON.stringify(WIESE.wiese)};` +
    `window.__wieseMessen = ${wieseMessen.toString()};` +
    `window.__wieseUrteil = ${wieseUrteil.toString()};`;
module.exports = {
    messort,
    wieseMessen,
    wieseUrteil,
    wirtAmGesetz,
    WIESE_INSTALL,
    WELT_ORTE_INSTALL:
        `window.__messWiese = [${WIESE.x}, ${WIESE.z}];` + WIESE_INSTALL + `window.__weltOrt = ${weltOrt.toString()};`,
};
