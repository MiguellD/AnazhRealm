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
// samt seinem Zustand (`dorfZug`: läuft das Auto-Dorf am Ort)
function messort(id) {
    const o = ladeSpec(id).ort;
    if (!o || !Array.isArray(o.spieler))
        throw new Error(`messort: kein Messort "${id}" in spec/profiband/haushalt.json`);
    const b = Array.isArray(o.blick) ? o.blick : o.spieler;
    return { id, x: o.spieler[0], z: o.spieler[1], blick: { x: b[0], z: b[1] }, wiese: o.wiese || null, dorfZug: o.dorfZug };
}

// DIE WIESE: ein Messort der Art Wiese trägt ihr Gesetz im Haushalt (`messorte[].wiese`) — gemessen wird an EINER
// Funktion mit zwei Wirten: in der Seite die Welt selbst (`werkbank umstellen --ort`, die Suche `__weltOrt("wiese")`), ohne
// Browser der Wirt am Gesetz (`wirtAmGesetz`: gelaende-core, phyto-core und die Wald-Methoden aus dem Stamm-Text —
// gate:profiband H1). Gemessen am Ort (x, z) mit Blick-Punkt `blick` ([x, z]; null = die beste von 16 Richtungen) über den Ring `ring` m:
//   hang     — die Neigung der Ausgleichs-Ebene des Gesetzes (`_terrainMacroSurfaceY`, Mitte + 5 Kreise × 12 Speichen), Grad
//   nass     — der Anteil der Ring-Punkte, die das Land nicht trägt (`_landAt` mit `trockenMarge`)
//   krone    — die Kronen-Fläche π·T² der STEHENDEN Bäume des Wald-Gesetzes (der Bestand `_forestCellDarts` →
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
    // die geborenen Darts eines vorläufigen Bestands (der Wirt am Gesetz trägt keine Wahrheit) teilen die Zellen der Messung
    const geboren = new Map();
    const [r0, r1] = S.rand;
    const baeume = [];
    for (let gz = Math.floor((z - r1) / C); gz <= Math.floor((z + r1) / C); gz++)
        for (let gx = Math.floor((x - r1) / C); gx <= Math.floor((x + r1) / C); gx++)
            for (const d of r._forestCellDarts(gx, gz, seedInt, geboren)) {
                const dd = Math.hypot(d.x - x, d.z - z);
                if (dd > r1 || !r._wildnisTraegt(d.x, d.z)) continue;
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
    return m;
}

// DER WIRT AM GESETZ (ohne Browser): die ECHTE Klasse im vm (scripts/lib/stamm.cjs `ladeKlasse`: die Kerne, die index.html vor
// dem Stamm lädt, dann der Stamm) und eine frisch geborene Welt ohne Bau — `ensureWorldMeta` gibt ihr Saat und Genese-Version,
// gelaende-core `GRUND` Basis und Meer. Er misst das Gesetz (Höhe, Land, Wald); was nur der Bau trägt (die Boden-Karte des
// Grases, die Hydro-Kacheln eines gebauten Rings), misst nur die Welt.
function wirtAmGesetz(root) {
    const { AnazhRealm: A, ctx } = require("./stamm.cjs").ladeKlasse(
        root || require("path").join(__dirname, "..", "..")
    );
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
    if (m.hang > S.hangMax)
        f.push(`Wiese ${wo}: Hang ${m.hang}° über ${S.hangMax}° (Ausgleichs-Ebene über ${S.ring} m)`);
    if (m.nass > 0) f.push(`Wiese ${wo}: ${Math.round(m.nass * 100)} % des Rings tragen Wasser`);
    if (m.krone != null && m.krone > S.kroneMax)
        f.push(
            `Wiese ${wo}: Kronen-Deckung im Ring ${m.krone} über ${S.kroneMax} (${m.baeume} Bäume binnen ${S.ring} m)`
        );
    if (m.kranz != null && m.kranz < S.randMin)
        f.push(
            `Wiese ${wo}: kein Waldrand — Kronen-Deckung im Kranz ${S.rand.join("–")} m ${m.kranz} unter ${S.randMin}`
        );
    if (m.imBlick > 0) f.push(`Wiese ${wo}: ${m.imBlick} Baum/Bäume im Blick binnen ${S.blickFrei} m`);
    if (m.horizont != null && m.horizont > S.horizontMax)
        f.push(
            `Wiese ${wo}: kein Fernblick — das Gelände steigt ${m.horizont}° über das Auge (Grenze ${S.horizontMax}°)`
        );
    if (m.gras != null && m.gras < S.grasMin)
        f.push(`Wiese ${wo}: Wiesen-Gewicht der Boden-Karte ${m.gras} unter ${S.grasMin}`);
    if (mitGras && m.gras == null) f.push(`Wiese ${wo}: das Gras ist ungemessen (die Boden-Karte steht im Ring nicht)`);
    return f;
}

// In der Seite: die Stellen der gewünschten Art, gesucht in Ringen um die MITTE DER WELT: den Ursprung des
// Gesetzes — dort kommt jede Welt an (die Start-Plattform steht an der nächsten freien Stelle um ihn, `_genesisMitte`; ihr
// Ort hängt am Takt des Boots und taugt nicht als Mitte einer Suche, die je Lauf dieselbe Stelle finden muss), nie ein Messort. Jede Art ist EIN Gesetz am Gelände der Welt (Gesetz-Höhe, Dichtefeld,
// Land, Bauten):
//   eben      — Land ohne Nässe, die Spanne des Bodens im Umkreis `r` (8 Speichen) ≤ `spanne` m, kein Fels darüber
//   hang      — die Neigung des Gesetzes (zentrale Differenz über ±`basis` m, Vorgabe 1) zwischen `min` und `max` Grad, Land
//               ohne Nässe; `bergab` [d, Grad]: d m talwärts steht noch mindestens diese Neigung (ein gleichmäßiger Hang);
//               zurück auch `gier` (rad, rotation.y-Sinn: 0 = +z) bergauf
//   hangfuss  — eine ebene Stelle (Neigung ≤ `fussMax` Grad), hinter der binnen `bis` m ein Hang ≥ `hangMin` Grad steigt;
//               zurück kommt auch die Richtung `gier`, die auf den Hang zeigt
//   querhang  — die Neigung (±1 m) zwischen `min` und `max` Grad (Vorgabe 25,2–40,1), die Höhenlinie ±`linie` m gerade (je
//               2 m Neigung ≥ `linieMin` Grad, Fall-Richtung binnen `winkel` Grad), trocken — eine Funktion des
//               Gesetzes allein, nie der gestreamten Bauten (die Bahn räumt die Station; mit dem Bau-Blick fand S3 je Lauf je
//               nach geladenem Baum (-71, -52), (-69, -48) oder (85, 53) und maß 0,27–0,35 m); zurück der Start `sx`/`sz`
//               (`linie` m vor der Stelle) und `gier` längs der Höhenlinie
//   kante     — das Kliff: in einer von 8 Richtungen fällt der Boden binnen 3 m um mehr als `kanteMin` m und binnen 6 m um
//               `fall` [3, 14] m auf trockenen Grund, davor ein Anlauf von `anlauf` m trocken und eben (≤ 0,3 m je 2 m);
//               zurück die schärfste Richtung: `gier` (die Fahrt über die Kante), `kante`, `fall`, der Start `sx`/`sz`
//   hoehle    — die Spalte, in der ein Leib steht: von der Oberkante (`_voxelSurfaceY`) abwärts Fels ≥ `fels` m, dann Luft
//               ≥ `luft` m, dann ein Grund aus Fels (≥ 1 m); im Umkreis `R` m ein GRUND (der Fels im Abstand d höchstens d/3
//               über oder unter dem der Spalte, darüber Luft bis +2,4 m); `wand`: verlangt die Wand der Höhle binnen 2,5 m (16
//               Richtungen, Fels vom Fuß + Stufe bis 2,1 m darüber) — zurück `grund`, `dach`, `wand` { dx, dz, d } oder null
//   ufer      — eine trockene, flache Stelle (Neigung ≤ `fussMax` Grad, Vorgabe 8), vor der binnen `bis` m (Vorgabe 30) Wasser
//               steht (`_nassAt`: Wasser über dem Boden) und über `breite` m (Vorgabe 10) Wasser bleibt — ein Gewässer, keine
//               Pfütze; zurück kommen `gier` zum Wasser und `wasserBei` (m) — der Bild-Ort der Soll-Tafel für das Wasser
//   wiese     — das Gesetz der Mess-Wiese (`o.wiese`, Vorgabe die Schwellen des Messorts `__wieseGesetz`)
// opts: { mitte: [x, z] (Vorgabe die Mitte der Welt), rMax (m, Vorgabe 400), schritt (m, Vorgabe 6), anzahl (Vorgabe 1),
// abstand (m zwischen zwei Funden, Vorgabe 5), ... }. Findet die Suche nichts, kommt eine leere Liste (die Probe nennt das
// laut, nie ein Ersatz-Ort).
function weltOrte(art, opts) {
    const o = opts || {};
    const [mx, mz] = o.mitte || window.__weltMitte;
    const rMax = o.rMax || 400;
    const schritt = o.schritt || 6;
    const anzahl = o.anzahl || 1;
    const abstand = o.abstand == null ? 5 : o.abstand;
    const H = (x, z) => r.getTerrainHeightAt(x, z);
    const trocken = (x, z) => r._landAt(x, z) && !(r._nassAt(x, z));
    const grad = (t) => (Math.atan(t) * 180) / Math.PI;
    const gefaelle = (x, z, b) => [(H(x + b, z) - H(x - b, z)) / (2 * b), (H(x, z + b) - H(x, z - b)) / (2 * b)];
    const neigung = (x, z, b) => grad(Math.hypot(...gefaelle(x, z, b || 1)));
    const unterFels = (x, z) => r._kreaturUnterFels(x, H(x, z), z);
    // die Spalte der letzten Probe (ek-schleife): `fest` fragt je Höhe dieselbe Spalte — EIN Spalten-Kontext
    // (`_terrainColumnContext`, dieselbe Dichte wie ohne), nie je Höhe ein neuer (die Spalten-Suche `hoehle` rechnete
    // 3,0 von 3,8 s am Kontext, ein Ruf hielt den Haupt-Faden 1,8 s)
    let sp = {};
    const fest = (x, y, z) =>
        r._fieldSolid(x, y, z, sp.x === x && sp.z === z ? sp.k : (sp = { x, z, k: r._terrainColumnContext(x, z) }).k);
    // die Fahrt-Linie ab (sx, sz) längs (ux, uz): kein Blocker eines Baus von l0 bis l1 m, quer binnen q m (+ halbe Box)
    const bahnFrei = (sx, sz, ux, uz, l0, l1, q) => {
        for (const e of st.architectures || []) {
            if (!e || !e.position || !e.blockerAABBs) continue;
            if (Math.hypot(e.position.x - sx, e.position.z - sz) > l1 + 20) continue;
            for (const b of e.blockerAABBs) {
                const bx = (b.minX + b.maxX) / 2 - sx;
                const bz = (b.minZ + b.maxZ) / 2 - sz;
                const l = bx * ux + bz * uz;
                const halb = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 2;
                if (l > l0 && l < l1 && Math.abs(bx * uz - bz * ux) < q + halb) return false;
            }
        }
        return true;
    };
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
            const b = o.basis || 1;
            const [gx, gz] = gefaelle(x, z, b);
            const t = Math.hypot(gx, gz);
            const n = grad(t);
            if (!(n >= (o.min == null ? 25 : o.min) && n <= (o.max == null ? 35 : o.max))) return null;
            const ux = gx / t,
                uz = gz / t;
            if (o.bergab) {
                const [d, min] = o.bergab;
                if (!trocken(x - ux * d, z - uz * d) || !(neigung(x - ux * d, z - uz * d, b) >= min)) return null;
            }
            return { neigung: Math.round(n * 10) / 10, gier: Math.atan2(ux, uz) };
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
        ufer: (x, z) => {
            if (!trocken(x, z) || unterFels(x, z)) return null;
            if (neigung(x, z) > (o.fussMax == null ? 8 : o.fussMax)) return null;
            const bis = o.bis || 30,
                breite = o.breite || 10;
            const nass = (px, pz) => r._nassAt(px, pz);
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2;
                const dx = Math.sin(a),
                    dz = Math.cos(a);
                for (let d = 3; d <= bis; d += 3) {
                    if (!nass(x + dx * d, z + dz * d)) continue;
                    let bleibt = true;
                    for (let e = d + 2; e <= d + breite && bleibt; e += 2) bleibt = nass(x + dx * e, z + dz * e);
                    if (bleibt) return { gier: Math.round(a * 1000) / 1000, wasserBei: d };
                    break;
                }
            }
            return null;
        },
        querhang: (x, z) => {
            const [gx, gz] = gefaelle(x, z, 1);
            const t = Math.hypot(gx, gz);
            const n = grad(t);
            if (!(n >= (o.min == null ? 25.2 : o.min) && n <= (o.max == null ? 40.1 : o.max)) || !trocken(x, z))
                return null;
            const cx = -gz / t,
                cz = gx / t;
            const L = o.linie || 8;
            const cosW = Math.cos(((o.winkel == null ? 20 : o.winkel) * Math.PI) / 180);
            for (let s = -L; s <= L; s += 2) {
                const [ax, az] = gefaelle(x + cx * s, z + cz * s, 1);
                const ag = Math.hypot(ax, az);
                if (!(grad(ag) >= (o.linieMin == null ? 16.7 : o.linieMin))) return null;
                if ((ax * gx + az * gz) / (ag * t) < cosW || !trocken(x + cx * s, z + cz * s)) return null;
            }
            const sx = x - cx * L,
                sz = z - cz * L;
            return { neigung: Math.round(n * 10) / 10, sx, sz, gier: Math.atan2(cx, cz) };
        },
        kante: (x, z) => {
            const h0 = H(x, z);
            if (!Number.isFinite(h0) || !trocken(x, z)) return null;
            const kMin = o.kanteMin == null ? 1.5 : o.kanteMin;
            const [f0, f1] = o.fall || [3, 14];
            const anlauf = o.anlauf || 24;
            let best = null;
            for (let k = 0; k < 8; k++) {
                const ux = Math.sin((k * Math.PI) / 4),
                    uz = Math.cos((k * Math.PI) / 4);
                const kante = h0 - H(x + ux * 3, z + uz * 3);
                if (!(kante > kMin) || (best && kante <= best.kante)) continue;
                const fall = h0 - H(x + ux * 6, z + uz * 6);
                if (!(fall >= f0 && fall <= f1) || !trocken(x + ux * 6, z + uz * 6)) continue;
                let gut = true;
                for (let s = 2; s <= anlauf && gut; s += 2) {
                    const a = H(x - ux * s, z - uz * s);
                    const b = H(x - ux * (s - 2), z - uz * (s - 2));
                    if (!Number.isFinite(a) || Math.abs(a - b) > 0.3 || !trocken(x - ux * s, z - uz * s)) gut = false;
                }
                if (!gut) continue;
                best = { kante, fall, gier: Math.atan2(ux, uz), sx: x - ux * anlauf, sz: z - uz * anlauf };
            }
            return best;
        },
        hoehle: (x, z) => {
            const felsMin = o.fels == null ? 2 : o.fels;
            const luftMin = o.luft == null ? 3 : o.luft;
            const R = o.R == null ? 1.8 : o.R;
            const top = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(top)) return null;
            let y = top - 0.05;
            let fels = 0;
            while (y > top - 50 && fest(x, y, z)) {
                y -= 0.25;
                fels += 0.25;
            }
            if (fels < felsMin) return null;
            let luft = 0;
            while (y > top - 70 && !fest(x, y, z)) {
                y -= 0.25;
                luft += 0.25;
            }
            if (luft < luftMin || y <= top - 70 || !fest(x, y - 1, z)) return null;
            while (fest(x, y + 0.02, z)) y += 0.02;
            const g = y;
            // der Leib passt: im Umkreis R ein Grund (Fels höchstens d/3 über oder unter dem der Spalte), Luft bis +2,4 m
            for (let k = 0; k < 12; k++) {
                const w = (k / 12) * Math.PI * 2;
                for (const rr of [R / 2, R]) {
                    const px = x + Math.cos(w) * rr,
                        pz = z + Math.sin(w) * rr;
                    const d = rr / 3;
                    for (let yy = g + d + 0.05; yy <= g + 2.4; yy += 0.3) if (fest(px, yy, pz)) return null;
                    let fy = g + d + 0.05;
                    while (fy > g - d && !fest(px, fy, pz)) fy -= 0.05;
                    if (fy <= g - d) return null;
                }
            }
            // die Wand der Höhle: je Richtung (16) der erste Abstand, an dem der Fels vom Fuß + einer Stufe bis über zwei weitere
            // Meter reicht — die nächste binnen 2,5 m, sonst null (`wand` verlangt sie)
            let wand = null;
            const stufe = AnazhRealm.PLAYER_STEP_UP;
            for (let k = 0; k < 16; k++) {
                const w = (k / 16) * Math.PI * 2;
                const dx = Math.cos(w),
                    dz = Math.sin(w);
                for (let d = 0.1; d <= 2.5 && (!wand || d < wand.d); d += 0.1) {
                    let ganz = true;
                    for (let yy = g + stufe; yy <= g + stufe + 2.1 && ganz; yy += 0.25)
                        ganz = fest(x + dx * d, yy, z + dz * d);
                    if (ganz) {
                        wand = { dx, dz, d };
                        break;
                    }
                }
            }
            if (o.wand && !wand) return null;
            return { grund: g, dach: top, wand };
        },
        // stoff — 4 m trockener, freier Boden aus dem Stoff `o.stoff` längs −z: der Stoff unter dem Fuß (`_kontaktStoffAt`, stoffe.K1)
        stoff: (x, z) =>
            bahnFrei(x, z, 0, -1, -1, 5, 1) && [0, 1, 2, 3, 4].every((q) => !r._nassAt(x, z - q, 0.1, H(x, z - q)) && r._kontaktStoffAt(x, z - q, H(x, z - q)) === o.stoff) ? {} : null,
        // wiese — das Gesetz der Mess-Wiese (`o.wiese`, Vorgabe die Schwellen des Messorts `__wieseGesetz`): erst Boden (Hang,
        // Nässe), dann Wald, Blick und Horizont; zurück kommt die Messung samt dem besten Blick-Punkt
        // Die Suche steht vor dem Bau: das Gras liest sie am Gesetz der Boden-Farbe (`_bodenFarbeAt`, aus dem der Chunk jeden
        // Vertex färbt — dieselbe Wiesen-Wache g − (r+b)/2 wie die Boden-Karte), die gebaute Karte urteilt nach dem Umstellen.
        wiese: (x, z) => {
            const S = o.wiese || window.__wieseGesetz;
            const b = window.__wieseMessen(r, x, z, null, S, true);
            if (b.fehler || window.__wieseUrteil(b, S).length) return null;
            const gs = AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle;
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
            return window.__wieseUrteil(m, S).length
                ? null
                : Object.assign(m, { grasGesetz: Math.round(g * 1000) / 1000 });
        },
    }[art];
    if (!pruefe) throw new Error(`__weltOrte: unbekannte Art "${art}"`);
    const funde = [];
    for (let rr = 0; rr <= rMax && funde.length < anzahl; rr += schritt) {
        const n = Math.max(1, Math.round((2 * Math.PI * rr) / schritt));
        for (let q = 0; q < n && funde.length < anzahl; q++) {
            const a = (q / n) * Math.PI * 2 + rr * 0.37;
            const x = mx + Math.cos(a) * rr,
                z = mz + Math.sin(a) * rr;
            if (funde.some((f) => Math.hypot(f.x - x, f.z - z) < abstand)) continue;
            const p = pruefe(x, z);
            if (p) funde.push(Object.assign({ art, x, z, y: H(x, z), abstand: rr, mitte: [mx, mz] }, p));
        }
    }
    return funde;
}

// Die nächste Stelle der Art (`weltOrte` mit anzahl 1) oder null.
function weltOrt(art, opts) {
    return window.__weltOrte(art, Object.assign({}, opts, { anzahl: 1 }))[0] || null;
}

// DIE STRECKE der Fahr-Proben (`window.__strecke`): je Kandidat in Ringen zu 32 m um `mitte` (bis `ringe`) 72 m in +x, je 2 m und
// ±3 m daneben trocken (der Spiegel des Gesetzes liegt ≥ 0,3 m unter dem Grund), Stufe ≤ stufeMax je 2 m und Quergefälle ≤ querMax
// je m; die kleinste Stufe — mit `naechster` im nächsten Ring, der einen trägt. Leser: gate:fahr-leben, gate:vehicle-drive B-e.
function strecke(mitte, ringe, stufeMax = Infinity, querMax = Infinity, naechster = false) {
    let best = null;
    for (let ring = 0; ring <= ringe && !(naechster && best); ring++)
        for (let k = 0; k < (ring ? 8 : 1); k++) {
            const [x, z] = [mitte[0] + Math.cos((k * Math.PI) / 4) * ring * 32, mitte[1] + Math.sin((k * Math.PI) / 4) * ring * 32];
            let [stufe, quer, vor] = [0, 0, null];
            for (let s = 0; s <= 36 && stufe < Infinity; s++) {
                const h = [-3, 0, 3].map((dz) => r.getTerrainHeightAt(x + s * 2, z + dz));
                if (h.some((y, j) => !Number.isFinite(y) || r._atlasWaterLevelAt(x + s * 2, z + 3 * j - 3, y) > y - 0.3)) stufe = Infinity;
                else if (vor) stufe = Math.max(stufe, ...h.map((y, j) => Math.abs(y - vor[j])));
                [vor, quer] = [h, Math.max(quer, Math.abs(h[2] - h[0]) / 6)];
            }
            if (stufe <= stufeMax && quer <= querMax && (!best || stufe < best.stufe)) best = { x, z, stufe, quer };
        }
    return best;
}

// DIE MITTE DER WELT: der Ursprung des Gesetzes (s. `weltOrte`) — die EINE Mitte jeder Orts-Suche einer Probe
const WELT_MITTE = [0, 0];
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
    WELT_MITTE,
    WELT_ORTE_INSTALL:
        `window.__messWiese = [${WIESE.x}, ${WIESE.z}];` +
        WIESE_INSTALL +
        `window.__weltMitte = ${JSON.stringify(WELT_MITTE)};` +
        `window.__weltOrte = ${weltOrte.toString()};` +
        `window.__weltOrt = ${weltOrt.toString()};` +
        `window.__strecke = ${strecke.toString()};`,
};
