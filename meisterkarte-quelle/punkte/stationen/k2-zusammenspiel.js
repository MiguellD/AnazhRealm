// stationen/k2-zusammenspiel.js — DIE LEITER-RICHTER DES KAPITELS zusammenspiel der Meisterkarte 2 (33 Leitern, 213 Sprossen,
// die Kopplungen, R7: jede Kopplung misst mit ihrem Gegenlauf; 18.11., Zweig richter-planet-leben-zusammenspiel). Der Kern ist der
// von k2-planet.js.
"use strict";
const K = require("./k2-planet.js").kern;
const L = K.kapitel("zusammenspiel");

// ── DIE PERSPEKTIVE zusammenspiel.leben (3 Leitern, 21 Sprossen, belegt: leben-formt-planet S1 — g1.js PFAD_SITZUNG, stadt-im-netz S1 —
// Tafel vegetation.K4#1): das Leben als Wandler des Planeten, der Planet als Former der Arten, die Siedlung im Netz. Jede Sprosse misst
// ihre Wirkung MIT ihrem Gegenlauf (R7: die Ursache gekappt → die Wirkung verschwindet). Die Leser des Spiels:
//   · der Bestand je Region (stamm/kreatur-leben.js `_bestandRegion` → `_bestandTakt` → tetrapoda-core BESTAND_GESETZ: Geburt nach
//     Lebensraum der Boden-Klasse `_bodenKlasseAt`, Riss der Jäger, Fraß am Jungwuchs `_kreaturFrass`) — DAS LABOR der Station fährt
//     ihn über die Spiel-Uhr (in Stücken ≤ aufholS, wie der Spieler fern liest), fängt den Fraß als Zahl (die Gabe ans Feld schreibt
//     es nicht: der Lauf lässt das Leben-Feld unberührt), kappt die Ursache (die Wölfe gestrichen, die Boden-Klasse festgehalten,
//     die Jagd des Spielers als Entnahme) und stellt jede Region byte-gleich zurück;
//   · das Gelände unter Starkregen (`__wetterSetzen("stormy")`, Takte des Spiels, `_voxelSurfaceY` am Hang, `_forestStandDensity`);
//   · der Planet-Faden (`r._planetAuftrag` planet-anker / planet-ort, voxel-worker planetOrtAuftrag — derselbe Weg wie die Reise)
//     an den Saaten „same-saat-0…31“ und am Anker der Welt, über 10⁶ und 10⁸ Jahre, mit und ohne Leben (der Faden ignoriert jedes
//     Feld außer samen, breite, laenge, zeitMa — die Gegenprobe zeigt es);
//   · die Siedlung (`worldMeta.settlementCells`, `_staedte`) und die Bestäuber (`_bestaeuberListe`).
// Ein Richter ohne Zahl bekommt sein Soll aus dem Wort selbst oder einer benannten Erd-Referenz (K.soll mit refQuelle beim Namen).
L.perspektive("leben", (() => {
    const LF = "leben.kopplung.leben-formt-planet";
    const EP = "leben.kopplung.evolution-planet";
    const SN = "leben.kopplung.stadt-im-netz";
    const PFAD = [
        "stamm/kreatur-leben.js",
        "stamm/kreatur-fauna.js",
        "stamm/koerper-leib.js",
        "tetrapoda-core.js",
        "stamm/feld-leben.js",
        "stamm/vegetation-wiese.js",
        "stamm/gelaende-*.js",
        "stamm/wasser-hydro.js",
        "stamm/bild-himmel.js",
        "stamm/dirigent-takt.js",
        "stamm/siedlung-ort.js",
        "gelaende-core.js",
        "planet-core.js",
        "voxel-worker.js",
        "scripts/werkbank.cjs",
    ];
    // DAS SOLL EINES RICHTER-WORTS OHNE ZAHL: das Wort steht wörtlich im Richter und trägt keine Zahl (sonst K.soll); die Schwelle trägt
    // eine benannte Quelle (das Wort selbst — „> Umland“, „wächst“, „byte-gleich“ — oder eine Erd-Referenz)
    // „≈ 0“: das Nullband einer Korrelation (Fisher-z, 95 %) — die 0 steht im Wort, das Band trägt seine Quelle
    const sollNahe = (ID, nr, wort, o) => {
        const sp = K.sprosseVon(ID, nr);
        if (!sp.richter.includes(wort) || !/≈/.test(wort)) throw new Error("sollNahe: „" + wort + "“ steht nicht im Richter " + ID + " S" + nr);
        if (!K.zahlenIn(wort).includes(o.ref)) throw new Error("sollNahe: " + o.ref + " steht nicht im Wort");
        return { wort, key: o.key, rel: "±", a: o.toleranz, b: undefined, ref: o.ref, refQuelle: o.refQuelle, einheit: o.einheit || "" };
    };
    // DER ZEUGE DER KOPPLUNG (R7): N Antworten der Welt mit Streuung, und die Wirkung MIT der Ursache gegen OHNE sie — beide gemessen,
    // verschieden (eine Kopplung, deren Gegenlauf dasselbe zeigt, ist Rauschen oder eine Konstante)
    const zeugeR7 = (min, was) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (Soll ≥ " + min + ")";
        if (!(z.streuung > 0)) return "die Antworten tragen keine Streuung (eine Konstante, nicht die Welt)";
        if (!(Number.isFinite(z.mit) && Number.isFinite(z.ohne))) return "der Gegenlauf fehlt (R7: " + was + ")";
        if (!(z.mit !== z.ohne)) return "die Wirkung bleibt im Gegenlauf (mit " + z.mit + " = ohne " + z.ohne + ": " + was + ")";
        return null;
    };
    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
    // DER SELBSTTEST: die Messung im Soll mit Zeuge, und drei benannte Attrappen, die den Wortlaut erfüllen, ohne die Welt zu ändern
    const selbst = (werte, z) => ({
        gruen: { werte, zeuge: z },
        attrappen: [
            { name: "die Zahl ohne Antwort der Welt (eine Konstante)", roh: { werte, zeuge: { antworten: 0, streuung: 0 } } },
            { name: "ohne Gegenlauf (R7: die Ursache nie gekappt)", roh: { werte, zeuge: { antworten: z.antworten, streuung: z.streuung } } },
            { name: "der Gegenlauf ändert nichts (mit = ohne: keine Kopplung)", roh: { werte, zeuge: Object.assign({}, z, { ohne: z.mit }) } },
        ],
    });

    return {
        leitern: {
            // ═══ LEBEN FORMT GELÄNDE, WASSER UND FELS (S2–S7; S1 trägt g1.js PFAD_SITZUNG) ═══
            [LF]: {
                sek: 40,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S2 Rutschung im Starkregen, S3 Bildpaar am Fluss, S5 Draufsicht der Küste, S6 Felswand, S7 Bildvergleich) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const pose = (p) => (p ? { px: p[0], py: p[1], pz: p[2], lx: p[3], ly: p[4], lz: p[5] } : { ort: "wiese" });
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const sdv = (l) => { const m = mittel(l); return l.length > 1 ? Math.sqrt(l.reduce((q, v) => q + (v - m) * (v - m), 0) / (l.length - 1)) : 0; };
                    const hang = async (r, T, a) => {
                        const s = r.state;
                        const LG = r.constructor._lebensraumGesetz();
                        const pm = s.playerMesh.position;
                        const wald = [];
                        const offen = [];
                        for (let d = 20; d <= a.radius && (wald.length < a.n || offen.length < a.n); d += 20)
                            for (let k = 0; k < 24; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 12);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 12);
                                if (r._bodenKlasseAt(x, z) !== "hang") continue;
                                const sd = r._forestStandDensity(x, z);
                                if (sd >= LG.L.waldSd) { if (wald.length < a.n) wald.push([x, z, sd]); }
                                else if (sd < LG.L.randSd && offen.length < a.n) offen.push([x, z, sd]);
                            }
                        const Y = (p) => r._voxelSurfaceY(p[0], p[1]);
                        const alle = wald.concat(offen);
                        const h0 = alle.map(Y);
                        const w0 = s.weather;
                        const uhr0 = s.spielZeit;
                        let t = performance.now();
                        try {
                            window.__wetterSetzen("stormy");
                            for (let i = 0; i < a.takte; i++) r._gameLoopTick((t += 1000 / 60));
                        } finally {
                            window.__wetterSetzen(w0);
                        }
                        const dh = alle.map((p, i) => Math.abs(Y(p) - h0[i]));
                        const sds = alle.map((p) => p[2]);
                        const p0 = offen[0] || wald[0];
                        const y0 = p0 ? Y(p0) : 0;
                        return {
                            nWald: wald.length,
                            nOffen: offen.length,
                            dhWald: dh.slice(0, wald.length),
                            dhOffen: dh.slice(wald.length),
                            sdSpanne: sds.length ? Math.max(...sds) - Math.min(...sds) : 0,
                            hSpanne: h0.length ? Math.max(...h0) - Math.min(...h0) : 0,
                            spielS: s.spielZeit - uhr0,
                            wetterZurueck: s.weather === w0,
                            pose: p0 ? [p0[0] + 30, y0 + 25, p0[1] + 30, p0[0], y0, p0[1]] : null,
                        };
                    };
                    const fluss = async (r, T, a) => {
                        const s = r.state;
                        const LG = r.constructor._lebensraumGesetz();
                        const pm = s.playerMesh.position;
                        const nah = new Set(r._bestandNah());
                        let fl = null;
                        const reg = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        for (const h of reg)
                            for (const rv of h.rivers || [])
                                for (const p of rv.points || []) {
                                    if (p.inLake || nah.has(r._bestandKey(p.x, p.z))) continue;
                                    const d = Math.hypot(p.x - pm.x, p.z - pm.z);
                                    if (!fl || d < fl.d) fl = { d, x: p.x, z: p.z, w: p.width };
                                }
                        if (!fl) return { fehler: "kein Fluss in den Hydro-Regionen um den Spieler" };
                        const nass = () => {
                            let n = 0;
                            for (let i = -a.fenster; i <= a.fenster; i += 2) for (let j = -a.fenster; j <= a.fenster; j += 2) if (r._nassAt(fl.x + i, fl.z + j)) n++;
                            return n;
                        };
                        const jahr = s.seasonYearSeconds > 0 ? s.seasonYearSeconds : 2400;
                        const vor = nass();
                        const uhr = s.spielZeit;
                        let nach;
                        try {
                            s.spielZeit = uhr + a.jahre * jahr;
                            nach = nass();
                        } finally {
                            s.spielZeit = uhr;
                        }
                        const y = r._voxelSurfaceY(fl.x, fl.z);
                        const gattungen = Object.keys(LG.L.gattung);
                        return { fl, key: r._bestandKey(fl.x, fl.z), vor, nach, jahr, gattungen, biber: gattungen.filter((g) => /biber|beaver|castor/i.test(g)).length, pose: [fl.x + 20, y + 40, fl.z + 20, fl.x, y, fl.z] };
                    };
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const LG = C._lebensraumGesetz();
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const fnv = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion"), _bodenKlasseAt: eigen("_bodenKlasseAt") };
                            const ids0 = new Set(orig.map((t) => t.id));
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [], ufer: null, uferN: 0 };
                            const geb = new Map();
                            const uferZ = r._bestandFeld(key).zellen.filter((c) => c.klasse === "fluss");
                            const uferH = () => uferZ.map((c) => r._voxelSurfaceY(c.x, c.z));
                            const u0 = a.ufer ? uferH() : null;
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            let start = 0;
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            if (L.klasse) {
                                r._bestandKlassen = null;
                                r._bodenKlasseAt = function () { return L.klasse; };
                            }
                            try {
                                if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                start = R.tiere.length;
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                    for (const t of R.tiere) if (!ids0.has(t.id) && !geb.has(t.id)) geb.set(t.id, { g: t.g, x: t.x, z: t.z, bs: t.bs, soul: t.soul });
                                    if (L.jagd && tk <= L.jagd.bis + 1e-6 && Math.round(tk) % L.jagd.je === 0) {
                                        const n = R.tiere.filter((t) => t.g === L.jagd.g).length;
                                        z.entnommen += weg(L.jagd.g, L.jagd.n != null ? L.jagd.n : Math.round(L.jagd.anteil * n));
                                    }
                                    z.reihe.push(zaehl());
                                }
                                if (u0) {
                                    const u1 = uferH();
                                    z.ufer = u0.length ? u0.reduce((q, h, i) => q + Math.abs(u1[i] - h), 0) / u0.length : null;
                                    z.uferN = u0.length;
                                }
                                z.hash = fnv(JSON.stringify([z.reihe, R.tiere.map((t) => [t.id, t.g, r3(t.bs), r3(t.x), r3(t.z)])]));
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.tode = start + geb.size - Object.values(z.n).reduce((q, v) => q + v, 0) - z.entnommen;
                            z.geboren = geb.size;
                            if (a.geburten)
                                z.geborene = [...geb.values()].map((t) => {
                                    const kl = r._bodenKlasseAt(t.x, t.z);
                                    return [t.g, r3(t.x), r3(t.z), r3(t.bs), t.soul, kl, LG.lebensraum(t.g, kl, LG.L) > 0 ? 1 : 0, r3(r._temperaturAt(r._terrainMacroSurfaceY(t.x, t.z, false)))];
                                });
                            z.ms = r3(performance.now() - t0);
                            z.verbiss = r3(z.verbiss);
                            z.gabe = r3(z.gabe);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const [ix, iz] = key.split(",").map(Number);
                            const cx = (ix + 0.5) * SE;
                            const cz = (iz + 0.5) * SE;
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, cx: r3(cx), cz: r3(cz), hy: r3(r._terrainMacroSurfaceY(cx, cz, false)), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, jahr: s.seasonYearSeconds > 0 ? s.seasonYearSeconds : 2400, regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const planet = async (r, T, a) => {
                        await r._fadenQuelle();
                        const samen0 = r._planetSamen();
                        const grad = (x) => Math.round((x * 18000) / Math.PI) / 100;
                        const ort = (samen, b, l, z, extra) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, breite: b, laenge: l, zeitMa: z }, extra || {}));
                        const ohneId = (o) => JSON.stringify(Object.assign({}, o, { requestId: 0 }));
                        const blaetter = (o, p, aus) => {
                            for (const k of Object.keys(o || {})) {
                                if (o[k] && typeof o[k] === "object") blaetter(o[k], p + k + ".", aus);
                                else aus.push(p + k);
                            }
                            return aus;
                        };
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: samen0 });
                        const B = grad(an.breite);
                        const L = grad(an.laenge);
                        const saaten = Array.from({ length: a.saaten }, (_, i) => "same-saat-" + i);
                        const anker = await Promise.all(saaten.map((x) => r._planetAuftrag({ type: "planet-anker", samen: x })));
                        const mit = await Promise.all(saaten.map((x, i) => ort(x, grad(anker[i].breite), grad(anker[i].laenge), 0)));
                        const ohne = await Promise.all(saaten.map((x, i) => ort(x, grad(anker[i].breite), grad(anker[i].laenge), 0, { leben: false })));
                        let verschieden = 0;
                        for (let i = 0; i < saaten.length; i++) if (ohneId(mit[i]) !== ohneId(ohne[i])) verschieden++;
                        const hs = mit.map((o) => o.hoeheM);
                        const reise = await Promise.all(a.reise.map((z) => ort(samen0, B, L, z)));
                        const lagen = [[B, L], [B + 5, L], [B - 5, L], [B, L + 5], [B, L - 5]];
                        const tief = [];
                        for (const [b, l] of lagen) tief.push(await Promise.all(a.tief.map((z) => ort(samen0, b, l, z))));
                        const tiefOhne = await Promise.all(lagen.map(([b, l]) => ort(samen0, b, l, a.tief[a.tief.length - 1], { leben: false })));
                        const terme = blaetter(mit[0].delta, "", []);
                        return {
                            samen0,
                            B,
                            L,
                            kuesteKm: an.kuesteKm,
                            version: mit[0].version,
                            saaten: saaten.length,
                            antwortenMit: mit.length,
                            verschieden,
                            hSpanne: Math.max(...hs) - Math.min(...hs),
                            terme,
                            lebenTerme: terme.filter((k) => /kalk|karbonat|kohle|torf|riff|koralle|mangrove|leben|bio|asche|pionier|vulkan|biber/i.test(k)),
                            meerTerme: Object.keys(mit[0].delta.meer || {}),
                            reise: reise.map((o) => [o.zeitMa, o.land ? 1 : 0, Math.round(o.hoeheM), o.delta.wuchs.decke, o.delta.wuchs.wald]),
                            tief: tief.map((rh) => rh.map((o) => [o.zeitMa, Math.round(o.hoeheM), o.delta.wildnis.hartAnteil, o.delta.wildnis.schichtDicke, o.land ? 1 : 0])),
                            tiefOhneGleich: tiefOhne.filter((o, i) => ohneId(o) === ohneId(tief[i][tief[i].length - 1])).length,
                        };
                    };
                    const aus = {};
                    // S2 — der Hang unter Starkregen: bewaldet gegen offen (der Gegenlauf: die Wurzeln fehlen)
                    try {
                        const h = await S(hang, U[2]);
                        const ew = mittel(h.dhWald);
                        const eo = mittel(h.dhOffen);
                        const werte = { erosionGerodetM: eo, erosionBewaldetM: ew, hangPunkte: h.nWald + h.nOffen, takte: U[2].takte };
                        if (ew > 0 && Number.isFinite(eo)) werte.erosionVerhaeltnis = eo / ew;
                        const roh = { werte, zeuge: Z(h.nWald + h.nOffen, h.sdSpanne, eo, ew), auge: await A("leben-hang-s2", pose(h.pose), { wetter: "stormy" }) };
                        if (!(h.nWald >= 3 && h.nOffen >= 3)) roh.nicht = "nur " + h.nWald + " bewaldete und " + h.nOffen + " offene Hang-Punkte im Umkreis " + U[2].radius + " m";
                        else if (!(eo > 0)) roh.nicht = "kein Abtrag unter Starkregen: Δh 0 m an " + (h.nWald + h.nOffen) + " Hang-Punkten nach " + U[2].takte + " Takten Sturm (bewaldet " + ew + " m, offen " + eo + " m) — die Höhe ist eine Funktion des Gelände-Kerns ohne Regen- und Wurzel-Term, keine Rutschung";
                        aus[2] = roh;
                    } catch (e) {
                        aus[2] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S3 — der Fluss über 10 Spieljahre: der Bestand der Fluss-Region im Zeitraffer, die Wasserfläche vor ↔ nach, der Biber im Buch
                    try {
                        const f = await S(fluss, U[3]);
                        if (f.fehler) throw new Error(f.fehler);
                        const b = await S(bestand, { keys: [f.key], n: 1, ring: [0, 0], nahErlaubt: false, laeufe: [{ name: "zehn", dauer: U[3].jahre * f.jahr, schritt: 600 }] });
                        const L = b.je[0] && b.je[0].laeufe.zehn;
                        const werte = { wasserVor: f.vor, wasserNach: f.nach, biberGattungen: f.biber, gattungen: f.gattungen.length };
                        if (L) werte.sprungJahre = (U[3].jahre * f.jahr) / f.jahr;
                        if (L) werte.geboren = L.geboren;
                        aus[3] = {
                            werte,
                            zeuge: Z(L ? L.reihe.length : 0, L ? L.geboren : 0, f.nach - f.vor, 0),
                            auge: await A("leben-fluss-s3", pose(f.pose)),
                            nicht: "kein Biber im Buch der Gattungen (" + f.gattungen.join(", ") + ") — 10 Spieljahre am Fluss (" + (L ? L.geboren : "?") + " Geburten in der Region " + f.key + "): Wasserfläche " + f.vor + " → " + f.nach + " Felder, kein Stau, kein Totholz",
                        };
                    } catch (e) {
                        aus[3] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S4 — die Wölfe: Regionen mit Wald und Fluss, 2 Spielstunden mit ↔ ohne Wölfe; Verbiss (der Fraß am Jungwuchs) und das Ufer
                    try {
                        const b = await S(bestand, { ring: [2, 4], n: U[4].regionen, wahl: ["wald", "fluss"], ufer: true, laeufe: [{ name: "mit", dauer: U[4].dauer, schritt: 600 }, { name: "ohne", dauer: U[4].dauer, schritt: 600, ohne: ["wolf"] }] });
                        const vm = b.je.map((x) => x.laeufe.mit.verbiss);
                        const vo = b.je.map((x) => x.laeufe.ohne.verbiss);
                        const um = b.je.map((x) => x.laeufe.mit.ufer);
                        const uo = b.je.map((x) => x.laeufe.ohne.ufer);
                        const wolf = b.je.map((x) => mittel(x.laeufe.mit.reihe.map((q) => q.wolf || 0)));
                        const d = uo.map((v, i) => v - um[i]).filter(Number.isFinite);
                        const dv = vo.map((v, i) => v - vm[i]);
                        const ci = (l) => { const m = mittel(l); const h = l.length > 1 ? (1.96 * sdv(l)) / Math.sqrt(l.length) : NaN; return [m - h, m + h]; };
                        const [lo, hi] = ci(d);
                        const [vlo, vhi] = ci(dv);
                        const werte = {
                            regionen: b.je.length,
                            verbissMit: vm.reduce((q, v) => q + v, 0),
                            verbissOhne: vo.reduce((q, v) => q + v, 0),
                            woelfeMittel: mittel(wolf),
                            uferErosionMitM: mittel(um.filter(Number.isFinite)),
                            uferErosionOhneM: mittel(uo.filter(Number.isFinite)),
                            nullImIntervall: d.length >= 2 && (lo > 0 || hi < 0) ? 0 : 1,
                            verbissNullImIntervall: dv.length >= 2 && (vlo > 0 || vhi < 0) ? 0 : 1,
                        };
                        const roh = { werte, zeuge: Z(b.je.reduce((q, x) => q + x.laeufe.mit.reihe.length + x.laeufe.ohne.reihe.length, 0), sdv(vm.concat(vo)), werte.verbissMit, werte.verbissOhne) };
                        if (!b.je.length) roh.nicht = "keine Region mit Wald und Fluss im Ring 2–4 um den Spieler";
                        else if (!(d.some((v) => v !== 0))) roh.nicht = "keine Ufer-Erosion: mit und ohne Wölfe Δh 0 m an " + b.je.reduce((q, x) => q + (x.laeufe.mit.uferN || 0), 0) + " Ufer-Zellen nach " + U[4].dauer / 3600 + " Spielstunden (Verbiss mit " + werte.verbissMit.toFixed(2) + " ↔ ohne " + werte.verbissOhne.toFixed(2) + ") — der Verbiss erreicht das Ufer nie: die Höhe am Fluss liest weder Jungwuchs noch Wurzel";
                        aus[4] = roh;
                    } catch (e) {
                        aus[4] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S5–S7 — der Planet-Faden: Küste, Kruste über 10⁸ Jahre, 32 Saaten mit ↔ ohne Leben, die Zeitreise über 10⁶ Jahre
                    let P = null;
                    let pw = null;
                    try {
                        P = await S(planet, U[7]);
                    } catch (e) {
                        pw = warf(e);
                    }
                    if (!P) for (const nr of [5, 6, 7]) aus[nr] = { werte: {}, zeuge: {}, nicht: pw };
                    else {
                        const riff = P.lebenTerme.filter((k) => /riff|koralle|mangrove|kalk|karbonat/i.test(k));
                        aus[5] = {
                            werte: { riffTerme: riff.length, kuesteKm: P.kuesteKm, antworten: P.antwortenMit },
                            zeuge: Z(P.antwortenMit, P.hSpanne, riff.length, 0),
                            auge: await A("leben-kueste-s5", { ort: "wiese" }),
                            nicht: "keine Riffe und Mangroven: der Planet-Faden trägt " + P.terme.length + " Terme (" + P.terme.join(", ") + "), das Meer nur " + P.meerTerme.join(", ") + " — kein Leben baut Land; die Küste liegt " + Math.round(P.kuesteKm) + " km vom Anker",
                        };
                        const kalkTerme = P.lebenTerme.filter((k) => /kalk|karbonat|kohle|torf/i.test(k));
                        const ha = P.tief.flat().map((x) => x[2]);
                        aus[6] = {
                            werte: { kalkTerme: kalkTerme.length, antworten: P.tief.flat().length, hartAnteilSpanne: Math.max(...ha) - Math.min(...ha), ohneLebenGleich: P.tiefOhneGleich },
                            zeuge: Z(P.tief.flat().length, P.hSpanne, kalkTerme.length, 0),
                            auge: await A("leben-fels-s6", { ort: "wiese" }),
                            nicht: "kein Kalk und keine Kohle: " + P.tief.flat().length + " Antworten des Planet-Fadens an 5 Lagen über " + Math.abs(U[7].tief[U[7].tief.length - 1]) + " Ma — kein Term des Meereslebens, " + P.tiefOhneGleich + "/5 mit ↔ ohne Leben byte-gleich",
                        };
                        const glied = { vulkan: /vulkan|lava/i, asche: /asche/i, pionier: /pionier/i, wald: /wuchs\.wald/i, torf: /torf/i, kohle: /kohle/i };
                        const wechselt = (i) => new Set(P.reise.map((x) => x[i])).size > 1;
                        let belegt = 0;
                        for (const g of Object.keys(glied)) if (g === "wald" ? wechselt(4) : P.lebenTerme.some((k) => glied[g].test(k))) belegt++;
                        const spanne = Math.max(...P.reise.map((x) => Math.abs(x[0])));
                        aus[7] = {
                            werte: { unterscheidbarProzent: (100 * P.verschieden) / P.saaten, saaten: P.saaten, zeitreiseJahre: spanne * 1e6, kettengliederProzent: (100 * belegt) / 6 },
                            zeuge: Z(P.antwortenMit + P.reise.length, P.hSpanne, P.verschieden, 0),
                            auge: await A("leben-planet-s7", { ort: "wiese" }),
                            nicht: "kein Planet ohne Leben: an " + P.saaten + " Saaten sind mit ↔ ohne Leben " + P.verschieden + " Antworten verschieden (der Faden liest nur samen, breite, laenge, zeitMa); die Zeitreise über " + spanne + " Ma am Anker belegt " + belegt + " von 6 Kettengliedern (Wald " + P.reise.map((x) => x[4]).join("/") + ")",
                        };
                    }
                    await schiess(24, 34);
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { radius: 400, n: 12, takte: 20 },
                        soll: [K.soll(LF, 2, "Erosion gerodet ≥ 5× bewaldet", { key: "erosionVerhaeltnis", einheit: "×" })],
                        auge: { pose: "der offene Hang im Starkregen (stormy), 30 m seitlich und 25 m über dem Hangpunkt", vorbild: "Rutschung sichtbar am gerodeten, nicht am bewaldeten Hang (Prüfer-Satz R11, 2AFC gerodet ↔ bewaldet)" },
                        zeuge: zeugeR7(6, "Erosion gerodet gegen bewaldet"),
                        taeter: "gelaende-core.js hoehe (die Höhe ohne Regen- und Wurzel-Term)",
                        nicht: "kein Abtrag unter Starkregen, keine Rutschung",
                        leser: "stamm/gelaende-boden.js:239 — „keine Erosions-Simulation“: kein Leser trägt Abtrag nach Regen × (1 − Wurzelhalt `_forestStandDensity`) ins Gelände",
                        ...selbst({ erosionVerhaeltnis: 6.2, erosionGerodetM: 0.31, erosionBewaldetM: 0.05 }, Z(17, 0.6, 0.31, 0.05)),
                    },
                    3: {
                        u: { fenster: 30, jahre: 10 },
                        soll: [K.soll(LF, 3, "Bildpaar 0/10 Jahre", { key: "sprungJahre", zahl: 10, einheit: "a" })],
                        auge: { pose: "über dem nächsten Fluss außerhalb der nahen Regionen, 40 m hoch, Blick hinab (Jahr 0 und Jahr 10)", vorbild: "Referenz-Luftbild eines Biberstaus: Wasserfläche und Totholz (Bildpaar 0/10 Jahre)" },
                        zeuge: zeugeR7(10, "Wasserfläche mit Biber gegen ohne"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (kein Biber im Buch der Gattungen)",
                        nicht: "kein Biber, kein Stau",
                        leser: "tetrapoda-core.js:2077 — das Buch der Gattungen trägt deer, fox, wolf, bear: kein Biber, und kein Leser des Wassers (gelaende-core stauFelder) liest ein Tier",
                        ...selbst({ sprungJahre: 10, wasserVor: 120, wasserNach: 190 }, Z(40, 12, 70, 0)),
                    },
                    4: {
                        u: { regionen: 3, dauer: 7200 },
                        soll: [K.soll(LF, 4, "Intervall ohne 0", { key: "nullImIntervall", zahl: 0 })],
                        zeuge: zeugeR7(24, "Verbiss mit Wölfen gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _kreaturFrass (der Verbiss erreicht das Ufer nie)",
                        nicht: "keine Ufer-Erosion",
                        leser: "stamm/kreatur-leben.js:2191 — `_kreaturFrass` schreibt den Verbiss ins Leben-Feld; kein Leser des Ufers (gelaende-core hoehe, `_hydroDistAt`) liest Jungwuchs oder Wurzel",
                        ...selbst({ nullImIntervall: 0, verbissMit: 210, verbissOhne: 260, uferErosionMitM: 0.02, uferErosionOhneM: 0.11 }, Z(72, 14, 210, 260)),
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(LF, 5, "Riffdicke gegen Akkretionsraten", { key: "akkretionMmJeA", rel: "band", zahl: 1, bis: 10, einheit: "mm/a", refQuelle: "Erde: Riff-Akkretion im Holozän 1–10 mm/a (Montaggioni 2005, Earth-Science Reviews 71)" }),
                            K.soll(LF, 5, "Rifftyp in Draufsicht ≥ 75 % richtig", { key: "rifftypProzent", einheit: "%" }),
                        ],
                        auge: { pose: "Draufsicht einer Küste (heute keine Küste im Umkreis — geschossen an der Wiese)", vorbild: "Luftbilder Saum-, Barriere- und Atoll-Riff (Darwin 1842), Prüfer-Satz R11 ≥ 75 % richtig" },
                        taeter: "planet-core.js planetOrt (kein Term des Riffs)",
                        nicht: "keine Riffe, keine Mangroven",
                        leser: "voxel-worker.js:1175 — planetOrtAuftrag trägt das Meer nur als waterLevelM: kein Riff, keine Akkretion des Lebens",
                        ...selbst({ akkretionMmJeA: 4, rifftypProzent: 80 }, Z(32, 2400, 3, 0)),
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LF, 6, "Kalkanteil der Kruste wächst mit dem Meeresleben", { key: "kalkSteigung", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „wächst mit“ — die Steigung des Kalkanteils der Kruste gegen das Meeresleben über 10⁸ Jahre > 0" })],
                        auge: { pose: "eine Felswand (heute keine Schicht im Fels — geschossen an der Wiese)", vorbild: "Kohleflöze in der Felswand sichtbar (Prüfer-Satz R11)" },
                        taeter: "planet-core.js planetPlan (kein Kalk, keine Kohle)",
                        nicht: "kein Kalk, keine Kohle",
                        leser: "planet-core.js:307 — planetPlan(samen, koerperIn) trägt im Körper g, wasserKm, krustenAnteil … — kein Meeresleben, die Kruste kein Kalk",
                        ...selbst({ kalkSteigung: 0.4 }, Z(30, 900, 2, 0)),
                    },
                    7: {
                        u: { saaten: 32, reise: [0, -0.2, -0.4, -0.6, -0.8, -1], tief: [0, -20, -40, -60, -80, -100] },
                        soll: [
                            K.soll(LF, 7, "32 Saaten mit und ohne Leben im Bildvergleich unterscheidbar ≥ 90 %", { key: "unterscheidbarProzent", einheit: "%" }),
                            K.soll(LF, 7, "32 Saaten", { key: "saaten", rel: "≥", zahl: 32 }),
                            K.soll(LF, 7, "Zeitreise an einem Ort über 10⁶ Jahre", { key: "zeitreiseJahre", rel: "≥", zahl: 1e6, einheit: "a" }),
                            K.soll(LF, 7, "jedes Kettenglied im Bild belegt", { key: "kettengliederProzent", rel: "≥", zahl: 100, einheit: "%", refQuelle: "das Wort selbst: „jedes Kettenglied“ — 6 von 6 Gliedern des Umfangs (Vulkan, Asche, Pionierflora, Wald, Torf, Kohle)" }),
                        ],
                        auge: { pose: "der Anker der Welt (Orbit nicht erzeugbar — geschossen an der Wiese), je Saat mit und ohne Leben", vorbild: "Bildvergleich 32 Saaten mit ↔ ohne Leben ≥ 90 % unterscheidbar (Prüfer-Satz R11); Zeitreise: jedes Glied im Bild" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Leben-Term im Planeten)",
                        nicht: "kein Planet ohne Leben, keine Kette Vulkan → Kohle",
                        leser: "voxel-worker.js:1175 — planetOrtAuftrag liest nur samen, breite, laenge, zeitMa: kein Schalter des Lebens, kein Glied Asche, Torf, Kohle",
                        unklar: "„über 10⁶ Jahre“ ist ein Maß des Umfangs, die Station hält es als Soll zeitreiseJahre ≥ 10⁶ — Vorschlag: der Richter nennt „Zeitreise ≥ 10⁶ Jahre“ als eigene Bedingung.",
                        ...selbst({ unterscheidbarProzent: 94, saaten: 32, zeitreiseJahre: 1e6, kettengliederProzent: 100 }, Z(38, 2400, 32, 0)),
                    },
                },
            },

            // ═══ EVOLUTION LIEST DEN PLANETEN (S1–S6) ═══
            [EP]: {
                sek: 20,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S1 die Würfe im Bild gezählt, S2 Bildvergleich Nord ↔ Süd) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const pearson = (x, y) => {
                        const mx = mittel(x);
                        const my = mittel(y);
                        let a = 0;
                        let b = 0;
                        let c = 0;
                        for (let i = 0; i < x.length; i++) {
                            a += (x[i] - mx) * (y[i] - my);
                            b += (x[i] - mx) * (x[i] - mx);
                            c += (y[i] - my) * (y[i] - my);
                        }
                        return b > 0 && c > 0 ? a / Math.sqrt(b * c) : NaN;
                    };
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const LG = C._lebensraumGesetz();
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const fnv = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion"), _bodenKlasseAt: eigen("_bodenKlasseAt") };
                            const ids0 = new Set(orig.map((t) => t.id));
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [], ufer: null, uferN: 0 };
                            const geb = new Map();
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            let start = 0;
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            if (L.klasse) {
                                r._bestandKlassen = null;
                                r._bodenKlasseAt = function () { return L.klasse; };
                            }
                            try {
                                if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                start = R.tiere.length;
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.ohne) for (const g of L.ohne) weg(g, Infinity);
                                    for (const t of R.tiere) if (!ids0.has(t.id) && !geb.has(t.id)) geb.set(t.id, { g: t.g, x: t.x, z: t.z, bs: t.bs, soul: t.soul });
                                    z.reihe.push(zaehl());
                                }
                                z.hash = fnv(JSON.stringify([z.reihe, R.tiere.map((t) => [t.id, t.g, r3(t.bs), r3(t.x), r3(t.z)])]));
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.tode = start + geb.size - Object.values(z.n).reduce((q, v) => q + v, 0);
                            z.geboren = geb.size;
                            z.geborene = [...geb.values()].map((t) => {
                                const kl = r._bodenKlasseAt(t.x, t.z);
                                return [t.g, r3(t.x), r3(t.z), r3(t.bs), t.soul, kl, LG.lebensraum(t.g, kl, LG.L) > 0 ? 1 : 0, r3(r._temperaturAt(r._terrainMacroSurfaceY(t.x, t.z, false)))];
                            });
                            z.ms = r3(performance.now() - t0);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const [ix, iz] = key.split(",").map(Number);
                            const cx = (ix + 0.5) * SE;
                            const cz = (iz + 0.5) * SE;
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, cx: r3(cx), cz: r3(cz), hy: r3(r._terrainMacroSurfaceY(cx, cz, false)), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const planeten = async (r, T, a) => {
                        await r._fadenQuelle();
                        const saaten = Array.from({ length: a.n }, (_, i) => "same-saat-" + i);
                        const an = await Promise.all(saaten.map((x) => r._planetAuftrag({ type: "planet-anker", samen: x })));
                        const LG = r.constructor._lebensraumGesetz();
                        return { antworten: an.filter((x) => Number.isFinite(x.breite)).length, breiten: an.map((x) => Math.round((x.breite * 18000) / Math.PI) / 100), gattungen: Object.keys(LG.L.gattung) };
                    };
                    const aus = {};
                    let B = null;
                    let bw = null;
                    try {
                        B = await S(bestand, { ring: [2, 3], n: U[1].regionen, laeufe: [{ name: "frei", dauer: U[1].dauer, schritt: 600 }, { name: "frei2", dauer: U[1].dauer, schritt: 600 }, { name: "fest", dauer: U[1].dauer, schritt: 600, klasse: U[1].festKlasse }] });
                        if (!B.je.length) throw new Error("keine bereite Region im Ring 2–3 um den Spieler (" + B.kand + " Kandidaten)");
                    } catch (e) {
                        bw = warf(e);
                    }
                    if (!B || bw) for (const nr of [1, 2, 3, 4, 5]) aus[nr] = { werte: {}, zeuge: {}, nicht: bw };
                    else {
                        const frei = B.je.flatMap((x) => x.laeufe.frei.geborene);
                        const fest = B.je.flatMap((x) => x.laeufe.fest.geborene);
                        const anteil = (l) => (l.length ? l.reduce((q, x) => q + x[6], 0) / l.length : NaN);
                        const klassen = new Set(B.je.flatMap((x) => x.klassen));
                        const r0 = B.je[0];
                        const pose = { px: r0.cx + 60, py: r0.hy + 80, pz: r0.cz + 60, lx: r0.cx, ly: r0.hy, lz: r0.cz };
                        // S1 — der Wurf in der Boden-Klasse der Gattung; Gegenlauf: die Klasse festgehalten (die Ursache gekappt)
                        aus[1] = {
                            werte: { anteilImRaum: anteil(frei), anteilFest: anteil(fest), wuerfe: frei.length, wuerfeFest: fest.length, regionen: B.je.length },
                            zeuge: Z(frei.length, klassen.size - 1, anteil(frei), anteil(fest)),
                            auge: await A("leben-evo-s1", pose),
                        };
                        // S2 — Merkmal aus Klima und Boden: Größe ↔ Temperatur der Geburt; das Fell: Varianten je Gattung
                        const bs = frei.map((x) => x[3]);
                        const tp = frei.map((x) => x[7]);
                        const rGK = pearson(bs, tp);
                        const rFest = pearson(fest.map((x) => x[3]), fest.map((x) => x[7]));
                        const seelen = {};
                        for (const x of frei) (seelen[x[0]] = seelen[x[0]] || new Set()).add(x[4]);
                        const fellVarianten = Math.max(0, ...Object.values(seelen).map((q) => q.size));
                        const w2 = { korrGroesseKlima: rGK, fellVarianten, wuerfe: frei.length };
                        if (fest.length > 3 && Number.isFinite(rFest)) w2.ohneSelektionZ = Math.abs(Math.atanh(Math.max(-0.999999, Math.min(0.999999, rFest)))) * Math.sqrt(fest.length - 3);
                        aus[2] = {
                            werte: w2,
                            zeuge: Z(frei.length, Math.max(...bs) - Math.min(...bs), rGK, rFest),
                            auge: await A("leben-evo-s2", pose),
                            nicht: "kein Erbgang: das Tier des Bestands trägt nur die Größe (`_creatureBodySize` aus dem Strom der Region, ohne Eltern), das Fell ist eines je Seele (" + fellVarianten + " Variante(n) je Gattung) — Korrelation Größe ↔ Klima " + (Number.isFinite(rGK) ? rGK.toFixed(3) : "—") + " an " + frei.length + " Würfen",
                        };
                        // S3 — Vikarianz: die Gattungen je Region (ein Buch) gegen das Trennungsalter
                        const sets = B.je.map((x) => new Set(Object.keys(x.laeufe.frei.n)));
                        let dmax = 0;
                        for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) dmax = Math.max(dmax, [...sets[i]].filter((g) => !sets[j].has(g)).length + [...sets[j]].filter((g) => !sets[i].has(g)).length);
                        aus[3] = {
                            werte: { regionen: B.je.length, baumDistanzMax: dmax, gattungenGesamt: new Set(B.je.flatMap((x) => Object.keys(x.laeufe.frei.n))).size },
                            zeuge: Z(B.je.length, dmax, NaN, NaN),
                            nicht: "kein Stammbaum je Kontinent: jede Region wirft aus EINEM Buch der Gattungen (" + B.je.length + " Regionen, Unterschied ≤ " + dmax + " Gattungen aus der Boden-Klasse, nie aus einer Trennung) — die Platten des Planeten liest es nie",
                        };
                        // S4 — Katastrophe: ohne Ereignis der Bestand je Spielstunde; ein Ereignis liest der Bestand nicht
                        let wellen = 0;
                        let tode = 0;
                        const sum = B.je[0].laeufe.frei.reihe.map((_, i) => B.je.reduce((q, x) => q + Object.values(x.laeufe.frei.reihe[i] || {}).reduce((u, v) => u + v, 0), 0));
                        for (let i = 1; i < sum.length; i++) if (sum[i - 1] > 0 && sum[i] <= 0.5 * sum[i - 1]) wellen++;
                        for (const x of B.je) tode += x.laeufe.frei.tode;
                        aus[4] = {
                            werte: { wellenOhneEreignis: wellen, todeOhneEreignis: tode, regionen: B.je.length },
                            zeuge: Z(B.je.reduce((q, x) => q + x.laeufe.frei.reihe.length, 0), tode, NaN, wellen),
                            nicht: "kein Ereignis im Bestand: die Bilanz (tetrapoda bestandBilanz) liest Nahrung und Riss, nie Vulkan oder Einschlag — ohne Ereignis " + wellen + " Wellen, " + tode + " Tode in " + U[1].dauer / 3600 + " Spielstunden an " + B.je.length + " Regionen; ein Überlebenden-Profil gibt es nicht",
                        };
                        // S5 — Eingriff: Wiederholung byte-gleich (frei ↔ frei2); einen Eingriff des Spielers in Gebirge oder Meerenge gibt es nicht
                        const gleich = B.je.every((x) => x.laeufe.frei.hash === x.laeufe.frei2.hash) ? 1 : 0;
                        aus[5] = {
                            werte: { wiederholungGleich: gleich, regionen: B.je.length },
                            zeuge: Z(B.je.length * 2, new Set(B.je.map((x) => x.laeufe.frei.hash)).size - 1, NaN, NaN),
                            nicht: "kein Eingriff des Spielers in Gebirge oder Meerenge (kein Verb hebt ein Gebirge, kein Leser des Bestands liest den Planeten) — die Wiederholung desselben Laufs ist " + (gleich ? "byte-gleich" : "VERSCHIEDEN") + " an " + B.je.length + " Regionen",
                        };
                    }
                    // S6 — 10 Planeten: der Faden antwortet je Saat; eine Ahnenlinie trägt keine
                    try {
                        const P = await S(planeten, { n: U[6].planeten });
                        aus[6] = {
                            werte: { planeten: P.antworten },
                            zeuge: Z(P.antworten, Math.max(...P.breiten) - Math.min(...P.breiten), NaN, NaN),
                            nicht: "keine Ahnenlinie: an " + P.antworten + " Planeten dasselbe Buch der Gattungen (" + P.gattungen.join(", ") + "), kein Baum, kein Ereignis der Geologie im Leben",
                        };
                    } catch (e) {
                        aus[6] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    await schiess(10, 15);
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { regionen: 4, dauer: 3600, festKlasse: "wiese" },
                        soll: [K.soll(EP, 1, "≥ 0,9 der Würfe in der Boden-Klasse der Gattung", { key: "anteilImRaum" })],
                        auge: { pose: "60 m schräg über der Mitte der ersten gemessenen Region, die Würfe im Bild", vorbild: "die Würfe im Bild gezählt: ≥ 0,9 in der Boden-Klasse ihrer Gattung (Klassen-Maske der Tiere gegen die Boden-Klasse)" },
                        zeuge: zeugeR7(20, "die Boden-Klasse festgehalten"),
                        taeter: "stamm/kreatur-leben.js _pickFaunaSoulAtPlayer (die Gattung aus der Boden-Klasse)",
                        ...selbst({ anteilImRaum: 1, anteilFest: 0.12 }, Z(40, 4, 1, 0.12)),
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(EP, 2, "Korrelation Fell ↔ Boden ≥ 0,5", { key: "korrFellBoden" }),
                            sollNahe(EP, 2, "ohne Selektion ≈ 0", { key: "ohneSelektionZ", ref: 0, toleranz: 1.96, refQuelle: "Nullband einer Korrelation: |atanh r| · √(n − 3) ≤ 1,96 (Fisher 1921, 95 %)" }),
                        ],
                        auge: { pose: "die Würfe der nördlichsten und der südlichsten Region nebeneinander", vorbild: "Bildvergleich Nord ↔ Süd: Fell folgt dem Boden, Größe dem Klima (Bergmann 1847)" },
                        zeuge: zeugeR7(20, "Merkmal mit Selektion gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (die Größe aus dem Strom, kein Erbgang)",
                        nicht: "kein Erbgang, kein Fell je Tier",
                        leser: "stamm/kreatur-leben.js:1993 — der Wurf würfelt die Größe `_creatureBodySize` aus dem Strom der Region, ohne Eltern; tetrapoda-core.js:4135 fellFarbe liest das Muster der Art, nie den Boden",
                        unklar: "„ohne Selektion ≈ 0“ trägt kein Band — die Station setzt das 95-%-Nullband nach Fisher (|atanh r|·√(n−3) ≤ 1,96).",
                        ...selbst({ korrFellBoden: 0.62, ohneSelektionZ: 0.8 }, Z(40, 0.4, 0.62, 0.05)),
                    },
                    3: {
                        u: {},
                        soll: [K.soll(EP, 3, "Baum-Distanz wächst mit dem Trennungsalter der Kontinente", { key: "baumSteigung", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „wächst mit“ — die Steigung der Baum-Distanz gegen das Trennungsalter der Kontinente > 0" })],
                        zeuge: zeugeR7(4, "Baum-Distanz getrennt gegen verbunden"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (EIN Buch der Gattungen für jeden Ort)",
                        nicht: "kein Stammbaum je Kontinent",
                        leser: "tetrapoda-core.js:2077 — das Buch der Gattungen ist EINES für jede Region; kein Leser verbindet die Platten (planet-core lageScholle) mit einer Art",
                        ...selbst({ baumSteigung: 0.8 }, Z(12, 3, 0.8, 0)),
                    },
                    4: {
                        u: {},
                        soll: [
                            K.soll(EP, 4, "ohne Ereignis keine Welle", { key: "wellenOhneEreignis", rel: "=", zahl: 0, refQuelle: "das Wort selbst: „keine Welle“ — 0 Einbrüche des Gesamtbestands der gemessenen Regionen auf ≤ die Hälfte binnen 600 Spiel-s ohne Ereignis (die Welle ist ein Ereignis der Landschaft, nie das Rauschen von sechs Tieren einer Region)" }),
                            K.soll(EP, 4, "Überlebenden-Profil gegen das Muster der Kreide-Paläogen-Grenze", { key: "profilKPgRang", rel: "≥", zahl: 0.7, refQuelle: "K-Pg: Überlebende klein, grabend, Generalisten (Longrich et al. 2016); Rang-Übereinstimmung ≥ 0,7 wie die Ursachen-Probe R10" }),
                        ],
                        zeuge: zeugeR7(12, "Einbruch mit Ereignis gegen ohne"),
                        taeter: "tetrapoda-core.js bestandBilanz (liest kein Ereignis)",
                        nicht: "keine Katastrophe im Bestand",
                        leser: "stamm/kreatur-leben.js:2401 `_bestandTakt` liest Nahrung, Riss und Alter; kein Leser trägt Vulkan-Provinz oder Einschlag in die Bilanz",
                        unklar: "„gegen das Muster der Kreide-Paläogen-Grenze“ trägt keine Zahl — die Station misst die Rang-Übereinstimmung des Überlebens (Masse, Grabend, Kost) mit der Schwelle 0,7 der Ursachen-Probe R10.",
                        ...selbst({ wellenOhneEreignis: 0, profilKPgRang: 0.78 }, Z(24, 9, 6, 0)),
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(EP, 5, "Baum-Distanz über der Schwelle", { key: "baumDistanzUeber", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „über der Schwelle“ — Baum-Distanz des Paars mit ↔ ohne Eingriff minus die Distanz der Wiederholung (0 bei byte-gleich) > 0" }),
                            K.soll(EP, 5, "Wiederholung byte-gleich", { key: "wiederholungGleich", rel: "=", zahl: 1, refQuelle: "das Wort selbst: „byte-gleich“ — 1 = der Hash zweier Läufe desselben Eingriffs gleich" }),
                        ],
                        zeuge: zeugeR7(8, "Arten mit Eingriff gegen ohne"),
                        taeter: "stamm/kreatur-leben.js _bestandTakt (kein Eingriff des Planeten erreicht den Bestand)",
                        nicht: "kein Eingriff in Gebirge oder Meerenge",
                        leser: "planet-core.js:307 — planetPlan nimmt nur den Samen und den Körper: kein Verb des Spielers hebt ein Gebirge oder öffnet eine Meerenge, und der Bestand liest den Planeten nie",
                        ...selbst({ baumDistanzUeber: 2, wiederholungGleich: 1 }, Z(8, 2, 2, 0)),
                    },
                    6: {
                        u: { planeten: 10 },
                        soll: [
                            K.soll(EP, 6, "Zufallsort auf 10 Planeten", { key: "planeten", rel: "≥", zahl: 10 }),
                            K.soll(EP, 6, "Ahnenlinie und Ereignis 100 % konsistent", { key: "konsistentProzent", rel: "≥", zahl: 100, einheit: "%" }),
                        ],
                        zeuge: zeugeR7(10, "Ahnenlinie mit Geschichte gegen ohne"),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (keine Ahnenlinie)",
                        nicht: "keine Ahnenlinie",
                        leser: "tetrapoda-core.js:2077 — die Gattungen sind gesetzt, nicht geworden: kein Baum, kein Ereignis, kein Ort der Herkunft",
                        ...selbst({ planeten: 10, konsistentProzent: 100 }, Z(10, 40, 10, 0)),
                    },
                },
            },

            // ═══ MENSCH, STADT UND MEER IM NETZ DES LEBENS (S2–S8; S1 trägt die Tafel vegetation.K4#1) ═══
            [SN]: {
                sek: 30,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S2 Bildpaar übernutzt ↔ daneben, S5 Mündung, S7 Panel der Epochen, S8 Umland mit ↔ ohne Stadt) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const warf = (e) => "die Messung warf: " + String((e && e.message) || e).slice(0, 200);
                    const Z = (n, streuung, mit, ohne) => ({ antworten: n, streuung, mit, ohne });
                    const stand0 = M.swift ? null : await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];").catch(() => null);
                    const spaeter = [];
                    const A = async (name, p, o) => {
                        const a = { bild: null, pose: JSON.stringify(p), grund: "noch nicht geschossen" };
                        spaeter.push({ a, name, p, o });
                        return a;
                    };
                    const schiess = async (frist, heim) => {
                        for (const s of spaeter) {
                            const b = M.uhr() < frist ? await M.auge(s.name, s.p, s.o) : { bild: null, pose: JSON.stringify(s.p), grund: "der Deckel der Leiter: kein Schuss nach " + frist + " s" };
                            delete s.a.grund;
                            Object.assign(s.a, b);
                        }
                        if (stand0 && spaeter.length && M.uhr() < heim) {
                            await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                            await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
                        }
                    };
                    const mittel = (l) => (l.length ? l.reduce((q, v) => q + v, 0) / l.length : NaN);
                    const bestand = async (r, T, a) => {
                        const s = r.state;
                        const C = r.constructor;
                        const F = r._bestandRegionen();
                        const SE = r._bestandSeite();
                        const nah = new Set(r._bestandNah());
                        const [hx, hz] = r._bestandHier().split(",").map(Number);
                        const kand = [];
                        for (let d = a.ring[0]; d <= a.ring[1]; d++)
                            for (let i = -d; i <= d; i++)
                                for (let j = -d; j <= d; j++) {
                                    const k = hx + i + "," + (hz + j);
                                    if (Math.max(Math.abs(i), Math.abs(j)) === d && !nah.has(k)) kand.push(k);
                                }
                        const tWart = performance.now();
                        const bereit = async (k) => {
                            for (let i = 0; i < 40 && !r._bestandBereit(k) && performance.now() - tWart < (a.wartMs || 6000); i++) await new Promise((ok) => setTimeout(ok, 100));
                            return r._bestandBereit(k);
                        };
                        const keys = [];
                        for (const k of a.keys || kand) {
                            if (keys.length >= a.n) break;
                            if ((nah.has(k) && !a.nahErlaubt) || !(await bereit(k))) continue;
                            const kl = r._bestandFeld(k).zellen.map((c) => c.klasse);
                            if (a.wahl && !a.wahl.every((w) => kl.includes(w))) continue;
                            keys.push(k);
                        }
                        const eigen = (m) => (Object.prototype.hasOwnProperty.call(r, m) ? r[m] : null);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const lauf = (key, L) => {
                            const neu = !F.regionen[key];
                            const R = r._bestandRegion(key, false);
                            const orig = R.tiere.slice();
                            const felder = orig.map((t) => Object.assign({}, t));
                            const vor = { t: R.t, seq: R.seq, gen: r._lebenGen, kl: r._bestandKlassen, jetzt: s.spielZeit };
                            const alt = { _depositLife: eigen("_depositLife"), _depositEmotion: eigen("_depositEmotion") };
                            const z = { verbiss: 0, gabe: 0, risse: 0, entnommen: 0, reihe: [] };
                            const zaehl = () => { const n = {}; for (const t of R.tiere) n[t.g] = (n[t.g] || 0) + 1; return n; };
                            const weg = (g, n) => {
                                let k = 0;
                                for (let i = R.tiere.length - 1; i >= 0 && k < n; i--) if (R.tiere[i].g === g && !R.tiere[i].leib && !R.tiere[i].gehege) (R.tiere.splice(i, 1), k++);
                                return k;
                            };
                            const t0 = performance.now();
                            r._depositLife = function (x, y, m) { if (m < 0) z.verbiss -= m; else z.gabe += m; };
                            r._depositEmotion = function () { z.risse++; };
                            try {
                                const schritte = Math.max(1, Math.round(L.dauer / L.schritt));
                                for (let k = 1; k <= schritte; k++) {
                                    const tk = (k * L.dauer) / schritte;
                                    s.spielZeit = vor.jetzt + tk;
                                    r._bestandRegion(key, true, 0, Infinity, []);
                                    if (L.jagd && tk <= L.jagd.bis + 1e-6 && Math.round(tk) % L.jagd.je === 0) {
                                        const n = R.tiere.filter((t) => t.g === L.jagd.g).length;
                                        z.entnommen += weg(L.jagd.g, L.jagd.n != null ? L.jagd.n : Math.round(L.jagd.anteil * n));
                                    }
                                    z.reihe.push(zaehl());
                                }
                            } finally {
                                s.spielZeit = vor.jetzt;
                                for (const m of Object.keys(alt)) { if (alt[m]) r[m] = alt[m]; else delete r[m]; }
                                z.n = zaehl();
                                R.t = vor.t;
                                R.seq = vor.seq;
                                R.tiere.length = 0;
                                R.tiere.push(...orig);
                                orig.forEach((t, i) => { for (const k of Object.keys(t)) if (!(k in felder[i])) delete t[k]; Object.assign(t, felder[i]); });
                                r._bestandKlassen = vor.kl;
                                r._lebenGen = vor.gen;
                                if (neu) delete F.regionen[key];
                            }
                            z.ms = r3(performance.now() - t0);
                            z.verbiss = r3(z.verbiss);
                            return z;
                        };
                        const je = [];
                        for (const key of keys) {
                            const laeufe = {};
                            for (const L of a.laeufe) laeufe[L.name] = lauf(key, L);
                            je.push({ key, nah: nah.has(key), klassen: r._bestandFeld(key).zellen.map((c) => c.klasse), laeufe });
                        }
                        return { keys, kand: kand.length, seite: SE, jahr: s.seasonYearSeconds > 0 ? s.seasonYearSeconds : 2400, regionenNachher: Object.keys(F.regionen).length, je };
                    };
                    const orte = async (r, T, a) => {
                        const s = r.state;
                        const cells = (s.worldMeta && s.worldMeta.settlementCells) || {};
                        const doerfer = Object.values(cells).filter((c) => c && Number.isFinite(c.x)).map((c) => ({ x: c.x, z: c.z, nH: c.nH || 0, stadt: c.stadt || 0, epoche: c.epoche || null, key: r._bestandKey(c.x, c.z) }));
                        const staedte = r._staedte();
                        await r._fadenQuelle();
                        const an = await r._planetAuftrag({ type: "planet-anker", samen: r._planetSamen() });
                        const B = Math.round((an.breite * 18000) / Math.PI) / 100;
                        const L = Math.round((an.laenge * 18000) / Math.PI) / 100;
                        const lagen = [[B, L], [B + 1, L], [B - 1, L], [B, L + 1], [B, L - 1]];
                        const wald = [];
                        for (const [b, l] of lagen) wald.push(await Promise.all(a.zeiten.map((z) => r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: b, laenge: l, zeitMa: z }).then((o) => [o.delta.wuchs.wald, o.delta.wuchs.decke, Math.round(o.hoeheM)]))));
                        const fk = r._fischKarte;
                        let staende = 0;
                        if (fk && fk.zellen) for (const c of fk.zellen.values()) if (c.stand) staende++;
                        const d0 = doerfer[0];
                        const y0 = d0 ? r._voxelSurfaceY(d0.x, d0.z) : 0;
                        return {
                            doerfer,
                            jahr: s.seasonYearSeconds > 0 ? s.seasonYearSeconds : 2400,
                            staedte: staedte.length,
                            groessteStadt: staedte.reduce((q, x) => Math.max(q, x.nH || 0), 0),
                            kuesteKm: an.kuesteKm,
                            wald,
                            bestaeuber: (r._bestaeuberListe || []).length,
                            fischStaende: staende,
                            gattungen: Object.keys(r.constructor._lebensraumGesetz().L.gattung),
                            pose: d0 ? [d0.x + 40, y0 + 60, d0.z + 40, d0.x, y0, d0.z] : null,
                        };
                    };
                    const pose = (p) => (p ? { px: p[0], py: p[1], pz: p[2], lx: p[3], ly: p[4], lz: p[5] } : { ort: "wiese" });
                    const aus = {};
                    let O = null;
                    try {
                        O = await S(orte, { zeiten: U[7].zeiten });
                    } catch (e) {
                        for (const nr of [2, 3, 4, 5, 6, 7, 8]) aus[nr] = { werte: {}, zeuge: {}, nicht: warf(e) };
                        return { sprossen: aus };
                    }
                    const doerfer = O.doerfer.length;
                    const groesster = O.doerfer.reduce((q, x) => Math.max(q, x.stadt || x.nH || 0), 0);
                    // S2 — Jagd des Spielers als Entnahme: der Bestand mit ↔ ohne Jagd; der Fang am Wasser
                    try {
                        const b = await S(bestand, { ring: [2, 3], n: U[2].regionen, wahl: ["wiese"], laeufe: [{ name: "ohne", dauer: 3600, schritt: 600 }, { name: "jagd", dauer: 3600, schritt: 600, jagd: { g: "deer", anteil: 0.5, je: 600, bis: 1800 } }] });
                        const ende = (L) => (L.reihe.length ? L.reihe[L.reihe.length - 1].deer || 0 : 0);
                        const mitJ = b.je.map((x) => ende(x.laeufe.jagd));
                        const ohneJ = b.je.map((x) => ende(x.laeufe.ohne));
                        aus[2] = {
                            werte: { fangOrte: 0, hirscheOhneJagd: mittel(ohneJ), hirscheMitJagd: mittel(mitJ), entnommen: b.je.reduce((q, x) => q + x.laeufe.jagd.entnommen, 0), fischStaende: O.fischStaende },
                            zeuge: Z(b.je.length * 12, Math.max(...ohneJ.concat(mitJ)) - Math.min(...ohneJ.concat(mitJ)), mittel(mitJ), mittel(ohneJ)),
                            auge: await A("leben-netz-s2", pose(O.pose)),
                            nicht: "kein Fang des Spielers: an 0 Orten ein Fang je Stunde (" + O.fischStaende + " Fisch-Stände der Karte, kein Verb fischt) — die Jagd als Entnahme: Hirsche nach 1 Spielstunde " + mittel(mitJ).toFixed(1) + " mit ↔ " + mittel(ohneJ).toFixed(1) + " ohne Jagd an " + b.je.length + " Regionen",
                        };
                    } catch (e) {
                        aus[2] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S3 — Überjagung ×3 über 10 Spieljahre und die Erholung nach dem Stopp (der Fang selbst fehlt); die Fischerdörfer
                    try {
                        const J = O.jahr;
                        const jahre = U[3].jahre;
                        const b = await S(bestand, { ring: [2, 4], n: U[3].regionen, wahl: ["wiese"], laeufe: [{ name: "basis", dauer: jahre * J, schritt: 600, jagd: { g: "deer", anteil: U[3].anteil, je: J, bis: jahre * J } }, { name: "drei", dauer: (jahre + U[3].stopJahre) * J, schritt: 600, jagd: { g: "deer", anteil: 3 * U[3].anteil, je: J, bis: jahre * J } }] });
                        if (!b.je.length) throw new Error("keine Region mit Wiese im Ring 2–4");
                        const amEnde = (L, s) => { const i = Math.round(s / 600) - 1; return L.reihe[i] ? L.reihe[i].deer || 0 : NaN; };
                        const summe = (name, s) => b.je.reduce((q, x) => q + amEnde(x.laeufe[name], s), 0);
                        const basis10 = summe("basis", jahre * J);
                        const drei10 = summe("drei", jahre * J);
                        const drei15 = summe("drei", (jahre + U[3].stopJahre) * J);
                        const reihe = b.je[0].laeufe.drei.reihe;
                        const w3 = { saaten: 1, fischerdorfProzent: 0, doerfer, regionen: b.je.length, spieljahre: (b.je[0].laeufe.basis.reihe.length * 600) / b.jahr, hirscheBasis: basis10, hirscheDrei: drei10, hirscheErholt: drei15, entnommenBasis: b.je.reduce((q, x) => q + x.laeufe.basis.entnommen, 0), entnommenDrei: b.je.reduce((q, x) => q + x.laeufe.drei.entnommen, 0) };
                        if (basis10 > 0) w3.bestandRueckgangProzent = (100 * (basis10 - drei10)) / basis10;
                        w3.erholung = drei15 - drei10;
                        aus[3] = {
                            werte: w3,
                            zeuge: Z(b.je.reduce((q, x) => q + x.laeufe.basis.reihe.length + x.laeufe.drei.reihe.length, 0), Math.max(...reihe.map((q) => q.deer || 0)) - Math.min(...reihe.map((q) => q.deer || 0)), drei10, basis10),
                            nicht: "keine Fischerdörfer und kein Fang: " + doerfer + " Ort(e) der Welt, die Küste " + Math.round(O.kuesteKm) + " km vom Anker, eine Saat — die Lage des Dorfs liest die Krautschicht, nie den Fischgrund; die Überjagung ×3 als Jagd an " + b.je.length + " Regionen: Hirsche nach " + jahre + " Spieljahren " + drei10 + " ↔ Basis " + basis10 + ", " + U[3].stopJahre + " Jahre nach dem Stopp " + drei15,
                        };
                    } catch (e) {
                        aus[3] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S4 — Kulturfolger am Ort gegen das Umland: der Bestand der Orts-Region gegen die Regionen im Ring
                    try {
                        const ortKeys = [...new Set(O.doerfer.map((d) => d.key))];
                        const st = await S(bestand, { keys: ortKeys, n: ortKeys.length, ring: [0, 0], nahErlaubt: true, laeufe: [{ name: "jetzt", dauer: U[4].dauer, schritt: 600 }] });
                        const umKeys = [];
                        for (const k of ortKeys) {
                            const [ix, iz] = k.split(",").map(Number);
                            for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const q = ix + i + "," + (iz + j); if (!ortKeys.includes(q) && !umKeys.includes(q)) umKeys.push(q); }
                        }
                        const um = await S(bestand, { keys: umKeys, n: U[4].umland, ring: [0, 0], nahErlaubt: true, laeufe: [{ name: "jetzt", dauer: U[4].dauer, schritt: 600 }] });
                        const km2 = (st.seite * st.seite) / 1e6;
                        const dichte = (x, gs) => gs.reduce((q, g) => q + (x.laeufe.jetzt.n[g] || 0), 0) / km2;
                        const kultur = ["fox"];
                        const scheu = ["deer", "wolf", "bear"];
                        const ks = mittel(st.je.map((x) => dichte(x, kultur)));
                        const ku = mittel(um.je.map((x) => dichte(x, kultur)));
                        const ss = mittel(st.je.map((x) => dichte(x, scheu)));
                        const su = mittel(um.je.map((x) => dichte(x, scheu)));
                        const w4 = { kulturfolgerDiff: ks - ku, scheueDiff: ss - su, kulturStadt: ks, kulturUmland: ku, scheueStadt: ss, scheueUmland: su, orte: st.je.length, umland: um.je.length, nutztierGattungen: 0, groessterOrt: groesster };
                        aus[4] = {
                            werte: w4,
                            zeuge: Z(st.je.length + um.je.length, Math.abs(ss - su) + Math.abs(ks - ku), ks, ku),
                            nicht: "keine Stadt mit 10⁴ Bewohnern (" + O.staedte + " Städte, der größte Ort " + groesster + " Häuser) und keine Nutztiere im Buch (" + O.gattungen.join(", ") + ") — der Wurf des Bestands fragt nie den Grundriss: Füchse " + ks.toFixed(1) + " /km² am Ort ↔ " + ku.toFixed(1) + " im Umland, Scheue " + ss.toFixed(1) + " ↔ " + su.toFixed(1),
                        };
                    } catch (e) {
                        aus[4] = { werte: {}, zeuge: {}, nicht: warf(e) };
                    }
                    // S5 — die Metropole: Städte der Welt, ein Leser der Stoffströme
                    aus[5] = {
                        werte: { staedte: O.staedte, groessteStadt: O.groessteStadt, doerfer },
                        zeuge: Z(doerfer + O.staedte, groesster, NaN, NaN),
                        auge: await A("leben-netz-s5", pose(O.pose)),
                        nicht: "keine Metropole und keine Stoffströme: " + O.staedte + " Städte der Welt (größte " + O.groessteStadt + " Häuser); kein Leser trägt Nahrung herein, Abwasser hinaus, Algen oder Sauerstoff im Wasser",
                    };
                    // S6 — Hecken, Bestäuber und Hafenstädte
                    aus[6] = {
                        werte: { saaten: 1, bestaeuber: O.bestaeuber, heckenLeser: 0, staedte: O.staedte },
                        zeuge: Z(1, O.bestaeuber, NaN, NaN),
                        nicht: "keine Monokultur, keine Hecke, keine Hafenstadt: die Bestäuber lesen Blüte, Wind, Feuchte und Tag (" + O.bestaeuber + " im Lauf headless), kein Feld des Menschen; " + O.staedte + " Städte an 1 Saat",
                    };
                    // S7 — der Wald über Jahrtausende: der Planet-Faden am Anker und vier Nachbarn, 0 … 10 000 Jahre zurück
                    const wald = O.wald.map((rh) => rh.map((x) => x[0]));
                    const alt = mittel(wald.map((rh) => rh[rh.length - 1]));
                    const neu = mittel(wald.map((rh) => rh[0]));
                    aus[7] = {
                        werte: { waldRueckgangProzent: alt > 0 ? (100 * (alt - neu)) / alt : NaN, waldJetzt: neu, waldVor: alt, antworten: wald.flat().length },
                        zeuge: Z(wald.flat().length, Math.max(...O.wald.flat().map((x) => x[2])) - Math.min(...O.wald.flat().map((x) => x[2])), neu, alt),
                        auge: await A("leben-netz-s7", pose(O.pose)),
                        nicht: "keine Rodung über Jahrtausende: der Planet-Faden trägt den Wald " + wald.map((rh) => rh.join("/")).join(" · ") + " über " + Math.abs(U[7].zeiten[U[7].zeiten.length - 1]) * 1e6 + " Jahre — kein Mensch im Planeten, keine Epoche der Fischerei",
                    };
                    // S8 — die Stadt jenseits Tokio
                    aus[8] = {
                        werte: { groessteStadt: O.groessteStadt, staedte: O.staedte },
                        zeuge: Z(O.staedte, 0, NaN, NaN),
                        auge: await A("leben-netz-s8", pose(O.pose)),
                        nicht: "keine Stadt über 10⁸ Bewohner: " + O.staedte + " Städte, der größte Ort " + groesster + " Häuser; kein Leser bilanziert Versorgung aus der Saat-Ökologie",
                    };
                    await schiess(18, 25);
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { regionen: 4 },
                        soll: [K.soll(SN, 2, "Fang je Stunde ↔ Fischdichte an 20 Orten r ≥ 0,6", { key: "fangR" }), K.soll(SN, 2, "an 20 Orten", { key: "fangOrte", rel: "≥", zahl: 20 })],
                        auge: { pose: "schräg über dem Ort der Welt (übernutzt ↔ daneben)", vorbild: "Bildpaar übernutzter Ort gegen daneben (Prüfer-Satz R11)" },
                        zeuge: zeugeR7(20, "Bestand mit Nutzung gegen ohne"),
                        taeter: "stamm/kreatur-fauna.js _fischZelle (kein Fang)",
                        nicht: "kein Fang des Spielers",
                        leser: "stamm/kreatur-fauna.js:562 — `_fischZelle` setzt den Stand aus dem Gesetz, kein Verb des Spielers fängt und kein Fang liest die Fischdichte",
                        ...selbst({ fangR: 0.7, fangOrte: 20 }, Z(24, 5, 4, 9)),
                    },
                    3: {
                        u: { jahre: 10, stopJahre: 5, anteil: 0.1, regionen: 3 },
                        soll: [
                            K.soll(SN, 3, "50 Saaten", { key: "saaten", rel: "≥", zahl: 50 }),
                            K.soll(SN, 3, "≥ 70 % der Fischerdörfer am produktivsten Drittel der Küste", { key: "fischerdorfProzent", einheit: "%" }),
                            K.soll(SN, 3, "Fang ×3 → Bestand −≥ 50 % in 10 Spieljahren", { key: "bestandRueckgangProzent", einheit: "%" }),
                            K.soll(SN, 3, "in 10 Spieljahren", { key: "spieljahre", rel: "≤", zahl: 10, einheit: "a" }),
                            K.soll(SN, 3, "Erholung nach Stopp", { key: "erholung", rel: ">", zahl: 0, einheit: "Tiere", refQuelle: "das Wort selbst: Erholung — der Bestand fünf Spieljahre nach dem Stopp minus der Bestand am Stopp > 0" }),
                        ],
                        zeuge: zeugeR7(20, "Bestand bei Fang ×3 gegen einfach"),
                        taeter: "stamm/siedlung-ort.js _ortNaehrt (der Ort liest die Krautschicht, nie den Fischgrund)",
                        nicht: "keine Fischerdörfer, kein Fang",
                        leser: "stamm/siedlung-ort.js:1707 — `_ortNaehrt` liest die Krautschicht (gelaende-core ortKraut), nie den Fischgrund (`_fischZelle`); kein Verb fängt",
                        unklar: "„Fang ×3“ nennt keinen Grund-Fang — die Station misst die Überjagung als Entnahme 10 % ↔ 30 % der Hirsche je Spieljahr (die Jagd, die das Spiel trägt).",
                        ...selbst({ saaten: 50, fischerdorfProzent: 76, bestandRueckgangProzent: 62, spieljahre: 10, erholung: 7 }, Z(100, 9, 4, 11)),
                    },
                    4: {
                        u: { umland: 24, dauer: 0 },
                        soll: [
                            K.soll(SN, 4, "Kulturfolger-Dichte Stadt > Umland", { key: "kulturfolgerDiff", rel: ">", zahl: 0, einheit: "/km²", refQuelle: "das Wort selbst: „Stadt > Umland“ — Dichte der Kulturfolger am Ort minus im Umland > 0" }),
                            K.soll(SN, 4, "Scheue < Umland", { key: "scheueDiff", rel: "<", zahl: 0, einheit: "/km²", refQuelle: "das Wort selbst: „Scheue < Umland“ — Dichte der Scheuen am Ort minus im Umland < 0" }),
                            K.soll(SN, 4, "Nutztiere und Weidefläche gegen Agrarstatistik der Epoche ±Faktor 3", { key: "agrarFaktor", rel: "≤", zahl: 3, einheit: "×" }),
                        ],
                        zeuge: zeugeR7(5, "Dichte am Ort gegen Umland"),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (der Wurf fragt nie den Grundriss)",
                        nicht: "keine Stadt mit 10⁴ Bewohnern, keine Nutztiere",
                        leser: "stamm/kreatur-leben.js:1958 — der Wurf des Gesetzes fragt nur die Saat (`_wildnisTraegt`), nie den Ort: kein Kulturfolger, keine Scheu; tetrapoda-core.js:2077 gattung: kein Nutztier im Buch",
                        unklar: "„Kulturfolger“ trägt im Buch nur den Fuchs (Tauben, Ratten, Möwen fehlen) — die Station zählt ihn; „±Faktor 3“ als max(x/ref, ref/x) ≤ 3.",
                        ...selbst({ kulturfolgerDiff: 4.2, scheueDiff: -6, agrarFaktor: 1.8 }, Z(7, 10, 9.2, 5)),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(SN, 5, "Algenblüte und Sauerstoffloch stromab im Bildpaar gegen eine Saat ohne Stadt", { key: "algenDiff", rel: ">", zahl: 0, refQuelle: "das Wort selbst: Algenblüte stromab mit Stadt minus ohne Stadt > 0" })],
                        auge: { pose: "die Mündung stromab der Stadt (heute keine Stadt — geschossen über dem Ort der Welt)", vorbild: "Bildpaar Algenblüte und Sauerstoffloch gegen eine Saat ohne Stadt (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-ort.js _staedte (keine Metropole, keine Stoffströme)",
                        nicht: "keine Metropole, keine Stoffströme",
                        leser: "stamm/siedlung-ort.js:1455 — `_staedte` kennt Häuser und Ringe, keinen Strom von Nahrung und Abwasser; kein Leser des Wassers trägt Algen oder Sauerstoff",
                        ...selbst({ algenDiff: 0.3 }, Z(2, 1, 0.4, 0.1)),
                    },
                    6: {
                        u: {},
                        soll: [
                            K.soll(SN, 6, "Intervall ohne 0", { key: "nullImIntervall", zahl: 0 }),
                            K.soll(SN, 6, "Rangkorrelation Küstenstadt-Größe ↔ Meeres-Ertrag + Hafengunst ≥ 0,6", { key: "rangKorr" }),
                            K.soll(SN, 6, "an 50 Saaten", { key: "saaten", rel: "≥", zahl: 50 }),
                        ],
                        zeuge: zeugeR7(50, "Bestäuber mit Hecken gegen ohne"),
                        taeter: "stamm/kreatur-fauna.js _bestaeuberTakt (kein Feld, keine Hecke)",
                        nicht: "keine Monokultur, keine Hecken, keine Hafenstädte",
                        leser: "stamm/kreatur-fauna.js:613 — `_bestaeuberTakt` liest Blüte, Wind, Feuchte und Tag, kein Feld und keine Hecke des Menschen; stamm/siedlung-ort.js:1455 `_staedte` ordnet keine Stadt nach Hafengunst",
                        ...selbst({ nullImIntervall: 0, rangKorr: 0.66, saaten: 50 }, Z(60, 12, 30, 12)),
                    },
                    7: {
                        u: { zeiten: [0, -0.002, -0.004, -0.006, -0.008, -0.01] },
                        soll: [
                            K.soll(SN, 7, "Waldanteil über Jahrtausende gegen Pollen-Reihen", { key: "waldRueckgangProzent", rel: "band", zahl: 50, bis: 70, einheit: "%", refQuelle: "Pollen-Reihen Mitteleuropas: Waldanteil von ~80 % (6000 v. Chr.) auf ~30 % (1850), Rückgang 50–70 % (Kaplan, Krumhardt & Zimmermann 2009, Quaternary Science Reviews 28)" }),
                            K.soll(SN, 7, "Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 %", { key: "panelProzent", einheit: "%" }),
                        ],
                        auge: { pose: "schräg über dem Ort der Welt, je Epoche", vorbild: "Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 % (Prüfer-Satz R11)" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Mensch im Planeten)",
                        nicht: "keine Rodung über Epochen",
                        leser: "voxel-worker.js:1175 — planetOrtAuftrag trägt delta.wuchs aus Klima und Zeit, keine Zivilisation: keine Rodung, keine Megafauna, keine Fischerei je Epoche",
                        unklar: "„gegen Pollen-Reihen“ trägt keine Zahl — die Station setzt den Rückgang des Waldanteils Mitteleuropas 50–70 % (Kaplan et al. 2009).",
                        ...selbst({ waldRueckgangProzent: 58, panelProzent: 74 }, Z(30, 200, 0.4, 0.9)),
                    },
                    8: {
                        u: {},
                        soll: [K.soll(SN, 8, "Fehlbetrag ≤ 1 %", { key: "fehlbetragProzent", einheit: "%" })],
                        auge: { pose: "das Umland des Orts der Welt, mit ↔ ohne Stadt", vorbild: "Umland mit/ohne Stadt im Bildpaar verschieden (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-ort.js _staedte (keine Stadt über 10⁸)",
                        nicht: "keine Stadt über 10⁸ Bewohner",
                        leser: "stamm/siedlung-ort.js:1455 — `_staedte` kennt keine Bewohnerzahl und keine Versorgung; kein Leser bilanziert die Stadt gegen die Saat-Ökologie",
                        ...selbst({ fehlbetragProzent: 0.6 }, Z(3, 1, 1, 0)),
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE zusammenspiel.same (9 Leitern, 61 Sprossen, 3 belegt: stoerung S1, kaskade S1, ereignis S1 — g1.js BRAND_SITZUNG
// und LAVA_SITZUNG): die Kopplungen über alle Kapitel, jede mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung um
// den Spieler (dort stehen die Chunks): die Tat über die Wege des Spiels (der Satz `spawn_studio`, `lava`, `_brandEntfachen`, die Ernte
// `harvestArchitecture`), ihre Antwort über die Leser der Welt (`auraAt`, `_atlasWaterLevelAt`, `_forestStandDensity`, `_temperaturAt`,
// `faunaBestand`, `_sukzession`, `_werkAlter`), der Planet über den Planet-Faden (`r._planetAuftrag`, planet-ort und planet-anker) an den
// Saaten „same-saat-0…99“ (der Faden behält die Pläne je Samen: jede Leiter fragt dieselben). Jede Tat wird am Ende zurückgenommen
// (die Taten-Liste auf ihre Länge, `_tatGen`, die Decken neu gemalt, der Wald der Narbe neu gepflanzt — wie brandSeite der Linse).
L.perspektive("same", (() => {
    const A = "same.kopplung.aufwaerts";
    // DER RICHTER OHNE ZAHL (ereignis S3/S7, erdsaat S1, zeitreise S2/S3): K.soll verlangt eine Zahl im Wort, diese Richter tragen keine —
    // ihre Bedingung steht als 0/1 (oder Gleichheit) im Wort selbst; das Wort steht wörtlich im Richter, und NUR ein Richter ohne jede Zahl
    // darf diesen Weg gehen (sonst wirft er wie K.soll)
    const sollOhneZahl = (id, nr, wort, o) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error("der Richter " + id + " S" + nr + " trägt Zahlen — K.soll, nie sollOhneZahl");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: undefined, ref: undefined, refQuelle: undefined, einheit: o.einheit || "" };
    };

    // ════════ same.kopplung.aufwaerts — die Tat schreibt das Große (Haus, Lava) ════════
    // Die Tat: ein Haus über den Satz `spawn_studio haus` (der EINE Stempel `_studioStampFor`) 30–120 m um den Spieler; zehn Orte im
    // Umkreis bis 1 km (Pegel `_atlasWaterLevelAt`, Leben `auraAt`, Wuchs `_wuchsAt`, Feuchte `_feuchteAt`, Wild aus `faunaBestand`, Wald
    // `_forestStandDensity`) vor ↔ nach der Tat, der Gegenlauf dieselben Orte zweimal OHNE Tat; der Speicher-Zuwachs ist die Länge des
    // Stands (`buildStateSnapshot`) nach ↔ vor; der Wald in 5 km, das Wasser der nächsten Flusspunkte, die Temperatur am Haus und 1 km
    // fern, die Küste und das Klima des Planeten am Anker der Welt. Am Gerät: das Bildpaar aus 400 m über dem Ort vor ↔ nach dem Bau.
    // Dann die Lava (`lava`, der einzige Ausbruch der Welt) auf einer Zelle ohne Bett (sie zündet nichts): Temperatur und Sonnenlicht
    // vor ↔ nach, der Gegenlauf zweimal ohne Guss. Der Planet: 100 Saaten am Anker, Zeit 0 ↔ 300 a, und ob seine Antwort ein Glied der
    // Zivilisation trägt.
    const zeugeHaus = (roh) => {
        const z = roh.zeuge || {};
        if (z.haus !== true) return "kein Haus gebaut (der Satz spawn_studio setzte nichts)";
        if (!(z.blkNach > z.blkVor)) return "das Haus steht nicht an seiner Stelle (Blocker am Ort " + z.blkVor + " → " + z.blkNach + ")";
        if (!(z.orte >= 10)) return "nur " + (z.orte || 0) + " Orte im Umkreis gemessen (Soll 10)";
        if (z.gegen !== 0) return "der Gegenlauf ohne Tat ändert " + z.gegen + " Orte (Rauschen, keine Kopplung)";
        if (!(z.bytes > 0)) return "kein Speicher-Zuwachs der Tat gemessen";
        return null;
    };
    const HAUS_Z = { haus: true, blkVor: 0, blkNach: 6, orte: 10, gegen: 0, bytes: 262, bild: true };
    const zeugePlanet = (min) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.saaten >= min)) return "nur " + (z.saaten || 0) + " Saaten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Saaten tragen keine Streuung der Höhe (eine Konstante, nicht der Faden)";
        if (!(z.mitOhne > 0)) return "kein Paar mit ↔ ohne Ursache gemessen (der Gegenlauf fehlt)";
        return null;
    };
    const PLANET_Z = { saaten: 100, streuungM: 2400, mitOhne: 100 };

    return {
        leitern: {
            [A]: {
                sek: 45,
                mutiert: true,
                pfad: ["stamm/feld-dsl.js", "stamm/feld-leben.js", "stamm/feld-brand.js", "stamm/siedlung-*.js", "stamm/vegetation-wiese.js", "stamm/bild-himmel.js", "stamm/wasser-hydro.js", "stamm/gelaende-chunks.js", "stamm/kreatur-leben.js", "stamm/speicher-welten.js", "voxel-worker.js", "planet-core.js", "gelaende-core.js", "phyto-core.js", "fachwerk-core.js", "scripts/werkbank.cjs"],
                ungefahren: "das Bildpaar aus 400 m (S1) und die Orbit-Bilder (S7) schießt nur das Gerät; headless steht die Welt nie (__ausgabeAufnahme wartet auf Ruhe)",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const seite = async (r, a) => {
                        const st = r.state;
                        const C = AnazhRealm;
                        const cs = C.LIFE_FIELD.cell;
                        const pm = st.playerMesh.position;
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1e3) / 1e3 : null);
                        const frei = (x, z, R) => r._landAt(x, z, 0.2) && !r._nassAt(x, z) && !r._blockerUmPlatz(x, z, R, []).length;
                        let P = null;
                        for (let d = 30; d <= 120 && !P; d += 15)
                            for (let k = 0; k < 12 && !P; k++) {
                                const x = pm.x + d * Math.cos((k * Math.PI) / 6);
                                const z = pm.z + d * Math.sin((k * Math.PI) / 6);
                                if (frei(x, z, 8)) P = { x, z };
                            }
                        if (!P) return { fehler: "kein trockener freier Ort 30–120 m um den Spieler" };
                        P.y = r._voxelSurfaceY(P.x, P.z);
                        const tiere = () => {
                            const o = [];
                            for (const R of Object.values((st.faunaBestand || {}).regionen || {})) for (const t of R.tiere || []) o.push(t);
                            return o;
                        };
                        const orte = a.radien.map((m, k) => [P.x + m * Math.cos(k * 2.39996), P.z + m * Math.sin(k * 2.39996)]);
                        const lies = () => {
                            const T = tiere();
                            return orte.map(([x, z]) => {
                                const y = r._voxelSurfaceY(x, z);
                                return [r3(r._atlasWaterLevelAt(x, z, y)), r3(r.auraAt(x, z).lebendig), r3(r._wuchsAt(x, z)), r3(r._feuchteAt(x, z, y)), T.filter((t) => Math.hypot(t.x - x, t.z - z) <= 150).length, r3(r._forestStandDensity(x, z))];
                            });
                        };
                        const anders = (X, Y) => X.filter((q, i) => q.some((v, j) => v !== Y[i][j])).length;
                        const wald = () => {
                            let s = 0;
                            let n = 0;
                            for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (i * i + j * j <= 25) (s += r._forestStandDensity(P.x + i * 1000, P.z + j * 1000)), n++;
                            return r3(s / n);
                        };
                        const flussP = (r._hydroFor(P.x, P.z).rivers || []).flatMap((v) => v.points).sort((p, q) => Math.hypot(p.x - P.x, p.z - P.z) - Math.hypot(q.x - P.x, q.z - P.z)).slice(0, 8);
                        const fluss = () => r3(flussP.reduce((s, p) => { const b = r._voxelSurfaceY(p.x, p.z); return s + Math.max(0, r._atlasWaterLevelAt(p.x, p.z, b) - b); }, 0));
                        const fern = { x: P.x + 1000, z: P.z };
                        const temp = (q) => r3(r._temperaturAt(r._voxelSurfaceY(q.x, q.z), 0));
                        let t = performance.now();
                        const takt = () => r._gameLoopTick((t += 1000 / 60));
                        await r._fadenQuelle();
                        const an = await r._planetAnker();
                        const [B, L] = [(an.breite * 180) / Math.PI, (an.laenge * 180) / Math.PI];
                        const samen = r._planetSamen();
                        const planet = async () => {
                            const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: B, laenge: L, zeitMa: 0 });
                            return [r3(o.kuesteKm), r3(o.delta.klima.sommer), r3(o.delta.meer.waterLevelM), r3(o.hoeheM)];
                        };
                        const bild = async () => {
                            await window.__weltStehtNach(takt, 900);
                            const cam = st.camera;
                            cam.position.set(P.x + 1, P.y + 400, P.z + 1);
                            cam.lookAt(P.x, P.y, P.z);
                            cam.updateMatrixWorld(true);
                            const v = new T.Vector3(P.x, P.y + 3, P.z).project(cam);
                            return { u8: (await window.__ausgabeAufnahme(960, 540)).u8, px: Math.round(((v.x + 1) / 2) * 960), py: Math.round(((1 - v.y) / 2) * 540) };
                        };
                        const aus = { ort: [P.x, P.z].map(Math.round), orte: orte.length };
                        const vor = lies();
                        aus.gegen = anders(vor, lies());
                        const pVor = await planet();
                        const [w0, f0, t0, y30] = [wald(), fluss(), [temp(P), temp(fern)], r._voxelSurfaceY(P.x + 30, P.z)];
                        const b0 = JSON.stringify(r.buildStateSnapshot()).length;
                        aus.blkVor = r._blockerUmPlatz(P.x, P.z, 6, []).length;
                        let bVor = null;
                        if (a.bild) {
                            try {
                                bVor = await bild();
                            } catch (e) {
                                aus.bild = { fehler: String((e && e.message) || e).slice(0, 200) };
                            }
                        }
                        const a0 = st.architectures.length;
                        const halt = st.weatherEffectTime;
                        let haus = null;
                        st.weatherEffectTime = 0;
                        try {
                            r.dslRun(["spawn_studio", "haus", ["at", P.x, P.y, P.z], 1, a.same], { source: "human" });
                            st.weatherEffectTime = halt;
                            haus = st.architectures.slice(a0).find((e) => /haus/.test(e.type)) || null;
                            aus.haus = !!haus;
                            aus.typ = haus && haus.type;
                            aus.blkNach = r._blockerUmPlatz(P.x, P.z, 6, []).length;
                            aus.orteGeaendert = anders(vor, lies());
                            aus.bytes = JSON.stringify(r.buildStateSnapshot()).length - b0;
                            aus.planet = [pVor, await planet()];
                            aus.wald = [w0, wald()];
                            aus.fluss = [f0, fluss()];
                            aus.temp = [t0, [temp(P), temp(fern)]];
                            aus.senkungM = r3(y30 - r._voxelSurfaceY(P.x + 30, P.z));
                            aus.staedte = r._staedte().length;
                            if (bVor && haus) {
                                try {
                                    const n = await bild();
                                    let k = 0;
                                    for (let y = n.py - 30; y <= n.py + 30; y++)
                                        for (let x = n.px - 30; x <= n.px + 30; x++) {
                                            if (x < 0 || y < 0 || x >= 960 || y >= 540) continue;
                                            const i = (y * 960 + x) * 4;
                                            if (Math.abs(n.u8[i] - bVor.u8[i]) + Math.abs(n.u8[i + 1] - bVor.u8[i + 1]) + Math.abs(n.u8[i + 2] - bVor.u8[i + 2]) > 24) k++;
                                        }
                                    aus.bild = { pixel: k, px: [n.px, n.py] };
                                } catch (e) {
                                    aus.bild = { fehler: String((e && e.message) || e).slice(0, 200) };
                                }
                            }
                        } finally {
                            st.weatherEffectTime = halt;
                            if (haus) r.removeArchitecture(haus);
                        }
                        // DIE LAVA auf einer Zelle ohne Bett im 3×3 (sie zündet nichts), 20–80 m vom Haus
                        let Q = null;
                        for (let d = 20; d <= 80 && !Q; d += 10)
                            for (let k = 0; k < 12 && !Q; k++) {
                                const x = P.x + d * Math.cos((k * Math.PI) / 6);
                                const z = P.z + d * Math.sin((k * Math.PI) / 6);
                                const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
                                let bett = false;
                                for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) bett = bett || !!r._brandStoff(cx + i, cz + j);
                                if (!bett && frei(x, z, 4)) Q = { x, z, y: r._voxelSurfaceY(x, z) };
                            }
                        const licht = () => {
                            for (let i = 0; i < 4; i++) takt();
                            const c = st.weltLicht && st.weltLicht.U && st.weltLicht.U.l0c && st.weltLicht.U.l0c.value;
                            return r3(c ? c.x + c.y + c.z : st.directionalLight ? st.directionalLight.intensity : NaN);
                        };
                        if (!Q) aus.lava = { fehler: "keine Zelle ohne Bett 20–80 m um den Ort" };
                        else {
                            const L0 = (st.worldMeta.taten ||= []);
                            const n0 = L0.length;
                            const bf0 = new Set((st.brandFeld || new Map()).keys());
                            const lv = { ort: [Q.x, Q.z].map(Math.round), tVor: temp(Q), lichtVor: licht(), tOhne: temp(Q), lichtOhne: licht(), tFernVor: temp({ x: Q.x + 1000, z: Q.z }) };
                            st.weatherEffectTime = 0;
                            try {
                                r.dslRun(["lava", Q.x, Q.y, Q.z], { source: "human" });
                                st.weatherEffectTime = halt;
                                lv.taten = L0.length - n0;
                                lv.glut = r3((r._lavaAt(Q.x, Q.z) || { glut: null }).glut);
                                lv.tNach = temp(Q);
                                lv.lichtNach = licht();
                                lv.tFernNach = temp({ x: Q.x + 1000, z: Q.z });
                            } finally {
                                st.weatherEffectTime = halt;
                                L0.length = n0;
                                for (const k of [...(st.brandFeld || new Map()).keys()]) if (!bf0.has(k)) st.brandFeld.delete(k);
                                r._tatGen = (r._tatGen | 0) + 1;
                                r._lavaTaktT = -Infinity;
                                for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._lavaStufeMalen(s);
                            }
                            aus.lava = lv;
                        }
                        // DER PLANET an 100 Saaten am Anker: Zeit 0 ↔ 300 a (0,0003 Ma) — und ob die Antwort ein Glied der Zivilisation trägt
                        const ziv = (o) => Object.keys(o).concat(Object.keys(o.delta || {})).filter((k) => /ziv|kultur|co2|techn|mensch|siedl|stadt/i.test(k)).length;
                        const S0 = await Promise.all(
                            Array.from({ length: a.saaten }, async (_, i) => {
                                const s = "same-saat-" + i;
                                const o0 = await r._planetAuftrag({ type: "planet-ort", samen: s, breite: B, laenge: L, zeitMa: 0 });
                                const o1 = await r._planetAuftrag({ type: "planet-ort", samen: s, breite: B, laenge: L, zeitMa: 0.0003 });
                                return [o0.hoeheM, o1.delta.klima.sommer - o0.delta.klima.sommer, ziv(o0) + ziv(o1), o1.hoeheM !== o0.hoeheM ? 1 : 0];
                            })
                        );
                        const hm = S0.reduce((s, q) => s + q[0], 0) / S0.length;
                        aus.saaten = { n: S0.length, streuungM: r3(Math.sqrt(S0.reduce((s, q) => s + (q[0] - hm) * (q[0] - hm), 0) / S0.length)), dSommer: r3(S0.reduce((s, q) => s + q[1], 0) / S0.length), ziv: S0.filter((q) => q[2] > 0).length, zeitAendert: S0.reduce((s, q) => s + q[3], 0) };
                        return aus;
                    };
                    const x = await S(seite, { radien: [60, 120, 200, 300, 400, 500, 650, 800, 900, 1000], same: 7, bild: !M.swift, saaten: 100 });
                    if (x.fehler) throw new Error(x.fehler);
                    const P0 = x.planet ? x.planet[0] : [];
                    const P1 = x.planet ? x.planet[1] : [];
                    const lv = x.lava || {};
                    const sa = x.saaten || {};
                    const auge7 = await M.auge("same-aufwaerts-s7", { ort: "wiese" });
                    const zh = { haus: x.haus, blkVor: x.blkVor, blkNach: x.blkNach, orte: x.orte, gegen: x.gegen, bytes: x.bytes, bild: !!(x.bild && x.bild.pixel != null), typ: x.typ };
                    const zp = { saaten: sa.n, streuungM: sa.streuungM, mitOhne: 0, zivilisation: sa.ziv };
                    const wa = x.wald || [];
                    const fl = x.fluss || [];
                    const te = x.temp || [[], []];
                    return {
                        sprossen: {
                            1: { werte: { sichtHoeheM: x.bild && x.bild.pixel != null ? (x.bild.pixel >= 4 ? 400 : 0) : undefined, orteGeaendert: x.orteGeaendert, tatBytes: x.bytes }, zeuge: Object.assign({ bildFehler: x.bild && x.bild.fehler }, zh) },
                            2: { werte: { rWaldBevoelkerung: null, waldAnteilVor: wa[0], waldAnteilNach: wa[1], staedte: x.staedte }, zeuge: Object.assign({ staedte: x.staedte, wald: wa }, zh), nicht: "kein Dorf rodet: r._staedte() trägt " + x.staedte + " Städte, der Wald im Umkreis 5 km steht nach der Tat bei " + wa[1] + " (vor " + wa[0] + ") — phyto-core forestStandDensity liest keine Bevölkerung" },
                            3: { werte: { sedimentFaktor: null, waermeinselK: te[1][0] != null && te[1][1] != null ? Math.round((te[1][0] - te[1][1]) * 1000) / 1000 : null, tempAmHausVorNachK: te[0][0] != null ? Math.round((te[1][0] - te[0][0]) * 1000) / 1000 : null }, zeuge: Object.assign({ temp: te }, zh), nicht: "keine Stadt von 10⁵ und kein Sediment: die Temperatur liest nur die Höhe (`_temperaturAt(y)`), Haus ↔ 1 km fern " + JSON.stringify(te[1]) + " °C; die Erosion liest keine Rodung" },
                            4: { werte: { orbitZuBoden: null, sprungJahre: 0, kuesteVorKm: P0[0], kuesteNachKm: P1[0] }, zeuge: Object.assign({ planet: x.planet }, zh), nicht: "kein Damm, kein Delta: die Küste des Planeten am Anker vor ↔ nach der Tat " + P0[0] + " ↔ " + P1[0] + " km — planet-ort nimmt nur samen, breite, laenge, zeitMa" },
                            5: { werte: { hochwasserFaktor: fl[0] > 0 ? Math.round((fl[1] / fl[0]) * 1000) / 1000 : null, senkungFaktor: null, senkungCmA: x.senkungM != null ? x.senkungM * 100 : null }, zeuge: Object.assign({ fluss: fl }, zh), nicht: "keine Megastadt (10⁷), keine Versiegelung: der Pegel liest keinen Bau (Wassertiefe der nächsten Flusspunkte vor ↔ nach " + fl.join(" ↔ ") + " m), der Boden sinkt nicht" },
                            6: {
                                werte: { abkuehlungK: lv.tVor != null && lv.tNach != null ? Math.round((lv.tVor - lv.tNach) * 1000) / 1000 : null, bodenlichtVerh: lv.lichtVor > 0 && lv.lichtNach != null ? Math.round((lv.lichtNach / lv.lichtVor) * 1000) / 1000 : null },
                                zeuge: { glut: lv.glut, taten: lv.taten, gegenK: lv.tOhne != null && lv.tVor != null ? lv.tVor - lv.tOhne : null, gegenLicht: lv.lichtOhne != null && lv.lichtVor != null ? lv.lichtOhne - lv.lichtVor : null, fern: [lv.tFernVor, lv.tFernNach], fehler: lv.fehler },
                                nicht: "kein Ausbruch kühlt einen Kontinent: die Lava ist EINE 16-m-Zelle (glut " + lv.glut + "), Temperatur " + lv.tVor + " → " + lv.tNach + " °C, Sonnenlicht " + lv.lichtVor + " → " + lv.lichtNach + " — `_temperaturAt` liest keine Asche, kein Aerosol",
                            },
                            7: { werte: { plausibelProzent: undefined, erwaermungK: sa.dSommer }, zeuge: zp, auge: auge7, nicht: "keine Zivilisation formt den Planeten: " + sa.ziv + " von " + sa.n + " Saaten tragen ein Glied der Zivilisation, kein CO₂ im Planet-Faden; 300 a ändern den Sommer um " + sa.dSommer + " K" },
                            8: { werte: { anteilProzent: sa.n ? (100 * sa.ziv) / sa.n : null }, zeuge: zp, nicht: "keine Fremd-Zivilisation: " + sa.ziv + " von " + sa.n + " Planeten-Saaten tragen eine — der Faden kennt den Zustand mit Zivilisation nicht (planet-ort ohne Eingang)" },
                        },
                    };
                },
                sprossen: {
                    1: {
                        u: { tat: "haus", radienM: [60, 1000] },
                        soll: [K.soll(A, 1, "Pixel aus 400 m an seiner Stelle", { key: "sichtHoeheM", rel: "≥", zahl: 400, einheit: "m" }), K.soll(A, 1, "Bildpaar an 10 Orten im Umkreis", { key: "orteGeaendert", rel: "≥", zahl: 10 })],
                        zeuge: (roh) => zeugeHaus(roh) || ((roh.zeuge || {}).bild !== true ? "das Haus aus 400 m ohne Bildpaar (keine Pixel der Welt)" : null),
                        taeter: "stamm/feld-leben.js `_tatSchreiben` / phyto-core `forestStandDensity` (die Tat verschiebt keinen Elternknoten: Pegel, Wuchs, Wild um das Haus bleiben)",
                        leser: "stamm/vegetation-wiese.js:2596 `_forestStandDensity` und stamm/gelaende-boden.js:1538 `_feuchteAt` — kein Leser eines gebauten Hauses im Umkreis",
                        gruen: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: HAUS_Z },
                        attrappen: [
                            { name: "zehn geänderte Orte ohne gebautes Haus", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { haus: false }) } },
                            { name: "die Orte ändern sich auch ohne Tat (das Rauschen der Welt zählt als Kopplung)", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { gegen: 4 }) } },
                            { name: "400 m aus der Projektion statt aus dem Bild", roh: { werte: { sichtHoeheM: 400, orteGeaendert: 10 }, zeuge: Object.assign({}, HAUS_Z, { bild: false }) } },
                        ],
                    },
                    2: {
                        u: { staedteMin: 3, waldRadiusKm: 5 },
                        soll: [K.soll(A, 2, "r ≥ 0,6", { key: "rWaldBevoelkerung" }), K.soll(A, 2, "ΔE ≥ 5 an der Tat", { key: "deltaETat" }), K.soll(A, 2, "sonst ≤ 1", { key: "deltaESonst" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.staedte >= 3)) return "nur " + (z.staedte || 0) + " Städte (r braucht ≥ 3)";
                            if (!(z.wald && z.wald[0] !== z.wald[1])) return "der Wald im Umkreis 5 km ändert sich mit der Tat nicht";
                            return zeugeHaus(roh);
                        },
                        taeter: "phyto-core.js forestStandDensity (liest keine Bevölkerung) · stamm/siedlung-ort.js `_staedte`",
                        nicht: "kein Dorf, das rodet",
                        leser: "stamm/vegetation-wiese.js:2596 `_forestStandDensity` — kein Eingang der Bevölkerung; stamm/siedlung-ort.js:1455 `_staedte` leer in der Welt",
                        gruen: { werte: { rWaldBevoelkerung: 0.71, deltaETat: 7.2, deltaESonst: 0.6 }, zeuge: Object.assign({ staedte: 12, wald: [0.62, 0.48] }, HAUS_Z) },
                        attrappen: [{ name: "r 0,71 aus drei erfundenen Dörfern, der Wald bleibt", roh: { werte: { rWaldBevoelkerung: 0.71, deltaETat: 7.2, deltaESonst: 0.6 }, zeuge: Object.assign({ staedte: 12, wald: [0.62, 0.62] }, HAUS_Z) } }],
                    },
                    3: {
                        u: { stadt: 1e5, talKm: 10 },
                        soll: [K.soll(A, 3, "Sediment im Hafen ≥ 2× der Wald-Saat", { key: "sedimentFaktor" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.temp && z.temp[1] && z.temp[1][0] != null)) return "keine Temperatur am Ort gemessen";
                            if (!(roh.werte && Math.abs(roh.werte.waermeinselK) > 0)) return "Stadt und Umland gleich warm (keine Wärmeinsel aus der Welt)";
                            return zeugeHaus(roh);
                        },
                        taeter: "stamm/bild-himmel.js `_temperaturAt` (liest nur die Höhe) · gelaende-core.js (keine Erosion aus Rodung)",
                        nicht: "keine Stadt, kein Sediment",
                        leser: "stamm/bild-himmel.js:2874 `_temperaturAt(y, traegTage)` — kein Ort, keine Siedlung im Eingang",
                        unklar: "„Temperatur Stadt ↔ Umland gegen gemessene Wärmeinseln“ trägt keine Zahl — Vorschlag: Wärmeinsel 1–3 K (die Tiefe der Sprosse) als zweites Soll.",
                        gruen: { werte: { sedimentFaktor: 2.4, waermeinselK: 1.8 }, zeuge: Object.assign({ temp: [[14, 14], [15.8, 14]] }, HAUS_Z) },
                        attrappen: [{ name: "Sediment 2,4× ohne Wärmeinsel und ohne Stadt", roh: { werte: { sedimentFaktor: 2.4, waermeinselK: 0 }, zeuge: Object.assign({ temp: [[14, 14], [14, 14]] }, HAUS_Z, { haus: false }) } }],
                    },
                    4: {
                        u: { dammKm: 100, jahre: 10 },
                        soll: [
                            K.soll(A, 4, "Bildpaar Delta vor ↔ nach 10 Jahren", { key: "sprungJahre", rel: "≥", zahl: 10, einheit: "a" }),
                            K.soll(A, 4, "Fläche der Änderung Orbit ↔ Boden ±10 %", { key: "orbitZuBoden", ref: 1, refQuelle: "die Fläche am Boden derselben Fahrt (Orbit ÷ Boden = 1; Erde: Rückzug des Nil-Deltas nach Assuan, Stanley 1996)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.planet && z.planet[0] && z.planet[1])) return "der Planet-Faden antwortete nicht vor und nach der Tat";
                            if (z.planet[0][0] === z.planet[1][0]) return "die Küste des Planeten bleibt nach der Tat (" + z.planet[0][0] + " km)";
                            return zeugeHaus(roh);
                        },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Eingang der Tat)",
                        nicht: "kein Damm, kein Delta",
                        leser: "voxel-worker.js:1175 planetOrtAuftrag(msg) — nimmt samen, breite, laenge, zeitMa, keine Tat",
                        gruen: { werte: { sprungJahre: 10, orbitZuBoden: 1.04 }, zeuge: Object.assign({ planet: [[288.6, 0, 0, 120], [287.9, 0, 0, 120]] }, HAUS_Z) },
                        attrappen: [{ name: "Orbit ÷ Boden 1,04, die Küste unverändert", roh: { werte: { sprungJahre: 10, orbitZuBoden: 1.04 }, zeuge: Object.assign({ planet: [[288.6, 0, 0, 120], [288.6, 0, 0, 120]] }, HAUS_Z) } }],
                    },
                    5: {
                        u: { menschen: 1e7, region: true },
                        soll: [K.soll(A, 5, "Hochwasser-Spitze ≥ 1,5× nach Versiegelung", { key: "hochwasserFaktor" }), K.soll(A, 5, "Senkung cm/a im Faktor 3 von Jakarta", { key: "senkungFaktor", rel: "≤", zahl: 3 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.fluss && z.fluss[0] > 0)) return "kein Wasser an den Flusspunkten gemessen";
                            if (z.fluss[0] === z.fluss[1]) return "das Wasser der Flusspunkte bleibt nach der Versiegelung (" + z.fluss[0] + " m)";
                            return zeugeHaus(roh);
                        },
                        taeter: "gelaende-core.js pegelZustand (kein Eingang der Versiegelung)",
                        nicht: "keine Megastadt, keine Versiegelung",
                        leser: "stamm/wasser-hydro.js:231 `_pegelZustand` — liest Regen-Stempel und Regen-Mittel, keinen Bau",
                        gruen: { werte: { hochwasserFaktor: 1.7, senkungFaktor: 1.6 }, zeuge: Object.assign({ fluss: [2.1, 3.6] }, HAUS_Z) },
                        attrappen: [{ name: "Faktor 1,7 bei gleichem Wasser", roh: { werte: { hochwasserFaktor: 1.7, senkungFaktor: 1.6 }, zeuge: Object.assign({ fluss: [2.1, 2.1] }, HAUS_Z) } }],
                    },
                    6: {
                        u: { ausbruch: "lava", zelleM: 16 },
                        soll: [
                            K.soll(A, 6, "Abkühlung gegen Pinatubo (~0,5 K) ±50 %", { key: "abkuehlungK", ref: 0.5, refQuelle: "Erde: Pinatubo 1991, globale Abkühlung ~0,5 K im Jahr darauf (Hansen et al. 1992)" }),
                            K.soll(A, 6, "Bodenlicht unter der Wolke ±15 %", { key: "bodenlichtVerh", ref: 0.75, refQuelle: "Erde: Direktstrahlung Mauna Loa nach Pinatubo −25 % (Dutton & Christy 1992)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.fehler) return "kein Guss: " + z.fehler;
                            if (!(z.glut > 0 && z.taten >= 1)) return "die Lava glüht nicht (kein Ausbruch in der Welt)";
                            if (z.gegenK == null || z.gegenLicht == null) return "kein Gegenlauf ohne Guss gemessen";
                            if (Math.abs(z.gegenK) >= Math.abs((roh.werte || {}).abkuehlungK || 0)) return "die Abkühlung ohne Guss ist so groß wie mit (keine Kopplung)";
                            return null;
                        },
                        taeter: "stamm/bild-himmel.js `_temperaturAt` (kein Aerosol, keine Asche)",
                        nicht: "kein Ausbruch, der einen Kontinent kühlt",
                        leser: "stamm/bild-himmel.js:2874 `_temperaturAt` und stamm/feld-leben.js:2460 `_lavaGiessen` — die Lava schreibt nur ihre Zelle",
                        gruen: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 1, taten: 1, gegenK: 0, gegenLicht: 0 } },
                        attrappen: [
                            { name: "0,42 K ohne Guss", roh: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 0, taten: 0, gegenK: 0, gegenLicht: 0 } } },
                            { name: "dieselbe Abkühlung im Gegenlauf (der Tag kühlt, nicht die Asche)", roh: { werte: { abkuehlungK: 0.42, bodenlichtVerh: 0.78 }, zeuge: { glut: 1, taten: 1, gegenK: 0.42, gegenLicht: 0 } } },
                        ],
                    },
                    7: {
                        u: { saaten: 100, jahre: 300 },
                        soll: [K.soll(A, 7, "plausibel ≥ 90 %", { key: "plausibelProzent", einheit: "%" }), K.soll(A, 7, "Erwärmung je CO₂-Verdopplung 2–5 K", { key: "erwaermungK", einheit: "K" })],
                        auge: { pose: "Orbit über dem Planeten vor ↔ nach 300 a (heute keine Orbit-Pose: geschossen an der Wiese)", vorbild: "Prüfer-Satz R11: Orbitbild-Paare an 100 Saaten, plausibel ≥ 90 %" },
                        taeter: "voxel-worker.js planetOrtAuftrag (kein CO₂, keine Zivilisation)",
                        nicht: "keine Zivilisation, die den Planeten formt",
                        leser: "voxel-worker.js:1175 planetOrtAuftrag — kein Eingang für Landbau, Industrie, CO₂",
                        gruen: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "3 K aus einer Tafel ohne Faden", roh: { werte: { plausibelProzent: 92, erwaermungK: 3 }, zeuge: { saaten: 0 } } }],
                    },
                    8: {
                        u: { planeten: 100 },
                        soll: [K.soll(A, 8, "Anteil der Planeten, die sich vom Zustand ohne Zivilisation messbar unterscheiden ≥ 80 %", { key: "anteilProzent", einheit: "%" })],
                        zeuge: zeugePlanet(100),
                        taeter: "voxel-worker.js planetOrtAuftrag (kein Zustand mit Zivilisation)",
                        nicht: "keine Fremd-Zivilisation",
                        leser: "voxel-worker.js:1175 planetOrtAuftrag — kein Eingang einer Zivilisation",
                        gruen: { werte: { anteilProzent: 86 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "86 % ohne Paar mit ↔ ohne Zivilisation", roh: { werte: { anteilProzent: 86 }, zeuge: Object.assign({}, PLANET_Z, { mitOhne: 0 }) } }],
                    },
                },
            },
        },
    };
})());

module.exports = L.stationen();
