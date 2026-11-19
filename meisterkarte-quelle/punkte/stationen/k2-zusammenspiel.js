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

// ── DIE PERSPEKTIVE zusammenspiel.mensch (6 Leitern, 37 Sprossen, 1 belegt: antwort S1 — g5.js K4_PROBE, der Ring um das Spielerhaus
// mit dem Gegen-Ort B derselben Saat): wie der Mensch mit der Welt gekoppelt ist — Leib, Sport, Tag, Antwort auf Eingriff, Kultur und der
// Kreislauf der Versorgung —, jede Kopplung mit ihrem Gegenlauf (R7). Gemessen wird in der warmen Welt der Sitzung an EINEM lebenden Dorf
// um den Spieler (der Satz „dorf“ des Spiels: `spawnSettlement`, die Bewohner über `__gebautNach` bis `S.liste && S.lebt`; steht schon ein
// lebendes Dorf ≤ 230 m, misst die Probe dort): der Tag über das Soll des Gesetzes (`_bewohnerSoll` → koerper `tagesPlan`) und den Stand
// jedes Bewohners (`b.drinnen`) nach dem Sprung der Uhr, der Leib über das Genom (`_rollHumanoidGenome`, die EINE Quelle von Höhe und
// Hautton) und die Gestalt der Tracht (`S.gestalten`, `koerper kleidZonen`), Bau und Kultur über den Plan des Fachwerks
// (`_foundryRequestSettlement`, derselbe Export, den der Satz „dorf“ ruft) an den Zellen der Welt (`_autoSettlementCellInfo`) und am
// Boden der Zelle (`_rockExposureAt`, `_forestStandDensity`, `_bodenKlasseAt`). Wetter nur über `__wetterSetzen`, die Schwerkraft über
// den Welt-Akt `gravity` der DSL (unter dem Mess-Halt gehoben und zurückgestellt); Uhr, Wetter und Schwerkraft kehren am Ende zurück.
L.perspektive("mensch", (() => {
    const LEIB = "mensch.kopplung.leib";
    const SPORT = "mensch.kopplung.sport";
    const LEBEN = "mensch.kopplung.leben";
    const KULTUR = "mensch.kopplung.kultur";
    const KREIS = "mensch.kopplung.kreislauf";
    const ANTWORT = "mensch.kopplung.antwort";
    const PFAD_DORF = ["stamm/siedlung-*.js", "stamm/koerper-leib.js", "koerper-core.js", "fachwerk-core.js", "stamm/bild-himmel.js", "stamm/feld-dsl.js", "scripts/lib/welt-boot.cjs", "scripts/werkbank.cjs"];
    // DAS WORT OHNE ZAHL: K.soll verlangt eine Zahl im Wort; eine Bedingung des Richters ohne Zahl („Statur gedrungener“, „verlassene
    // Häuser verfallen“, „ohne Eingriff byte-gleich“) steht als 0/1-Maß. Das Wort steht wörtlich im Richter und trägt selbst KEINE Zahl —
    // jede Zahl-Bedingung geht durch K.soll
    const sollWort = (id, nr, wort, o) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(wort).length) throw new Error("das Wort „" + wort + "“ trägt eine Zahl — K.soll, nie sollWort");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: undefined, ref: undefined, refQuelle: undefined, einheit: o.einheit || "" };
    };

    // ════════ die Zeugen der Welt ════════
    const zeugeDorf = (roh) => {
        const z = roh.zeuge || {};
        if (!(z.n >= 8)) return "nur " + (z.n || 0) + " Bewohner im Dorf der Probe (Soll ≥ 8)";
        return null;
    };
    const zeugeRegen = (roh) => {
        const z = roh.zeuge || {};
        const d = zeugeDorf(roh);
        if (d) return d;
        if (!(z.regen >= 0.3) || !(z.sonne === 0)) return "der Regen am Ort stand nicht (rain Sonne " + z.sonne + " → Regen " + z.regen + ")";
        if (!(z.istSonne > z.istRegen)) return "der Stand draußen änderte sich nicht unter dem Regen (" + z.istSonne + " → " + z.istRegen + ")";
        if (!(z.istGegen >= z.istSonne - 0.1)) return "der Gegenlauf fehlt: die Sonne zurück, und draußen bleibt " + z.istGegen + " gegen " + z.istSonne + " (die Wirkung verschwindet nicht mit der Ursache)";
        return null;
    };
    const DORF_Z = { n: 27, sonne: 0, regen: 0.6, istSonne: 0.89, istRegen: 0.3, istGegen: 0.89 };

    return {
        leitern: {
            // ════════ mensch.kopplung.leib — Leib folgt dem Planeten ════════
            // EIN Messprogramm: das Dorf der Probe (gegründet, wenn keins lebt), dann je Sprosse am Dorf und an den Zellen der Welt:
            // S1 die gezeigte Tracht (Gestalt des Bewohners) unter Sonne → Regen → Sonne nach dem Sprung der Uhr; S2 200 Genome aus den
            // Samen der Zellen und die Breite ihrer Herkunft (die Welt trägt EINEN Anker); S3 der Stoff der Tracht (koerper kleidZonen
            // `webe`) gegen Feld, Herde, Stände des Plans; S4 die Vielfalt der Häute im Dorf und ob eine Zelle einen Hafen trägt; S5 die
            // Tracht der Pläne in 4 Epochen und die Höhe DERSELBEN Bewohner je Epoche (die Ursache Epoche allein bewegt, der Gegenlauf
            // dieselbe Epoche zweimal); S6 die Schwerkraft 2 g über den Welt-Akt `gravity`: Genom und Plan unter 1 g ↔ 2 g.
            [LEIB]: {
                sek: 60,
                mutiert: true,
                pfad: PFAD_DORF,
                ungefahren: "das Bildpaar der Tracht Sonne ↔ Regen (S1), die Bilder von Hafen ↔ Bergdorf (S4) und das Dorf unter 2 g (S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const dorf = async (r, a) => {
                        const st = r.state, pm = st.playerMesh.position;
                        const nah = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.plan && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230).sort((p, q) => Math.hypot(p.ox - pm.x, p.oz - pm.z) - Math.hypot(q.ox - pm.x, q.oz - pm.z));
                        const lebt = () => nah().find((q) => q.liste && q.lebt && q.liste.length >= 8);
                        const t0 = performance.now();
                        let D = lebt(), gebaut = false;
                        if (!D && !nah().length) {
                            let ort = null;
                            for (const R of [100, 130, 160]) for (let k = 0; k < 16 && !ort; k++) { const w = (k / 16) * 2 * Math.PI, x = pm.x + Math.cos(w) * R, z = pm.z + Math.sin(w) * R; if (r._landAt(x, z, 0.2) && !(r._nassAt && r._nassAt(x, z))) ort = { x, z }; }
                            if (!ort) return { fehler: "kein Land 100–160 m um den Spieler für das Dorf der Probe" };
                            await r.spawnSettlement({ seed: a.same, nH: a.nH, position: { x: ort.x, y: 0, z: ort.z } });
                            gebaut = true;
                        }
                        if (!D) {
                            try { await window.__gebautNach("das Dorf der Probe mensch", { fertig: () => !!lebt(), max: 400 }); } catch (e) { return { fehler: "das Dorf lebt nicht: " + String((e && e.message) || e).slice(0, 160) }; }
                            D = lebt();
                        }
                        if (!D) return { fehler: "kein lebendes Dorf ≤ 230 m um den Spieler" };
                        window.__kmDorf = D.key;
                        const y = r.getTerrainHeightAt(D.ox, D.oz);
                        return { key: D.key, n: D.liste.length, ms: Math.round(performance.now() - t0), gebaut, region: D.plan.region, jahr: D.plan.jahr, seed: D.plan.seed, pose: { px: D.ox, py: y + 9, pz: D.oz + 32, lx: D.ox, ly: y + 1.5, lz: D.oz } };
                    };
                    const leib = async (r, a) => {
                        const st = r.state, A = AnazhRealm, kc = window.__koerperCore;
                        const D = r._bewohnerSiedlungen.get(window.__kmDorf);
                        if (!D || !D.liste) return { fehler: "das Dorf der Probe fehlt" };
                        const Lb = D.liste, n = Lb.length;
                        const alt = { w: st.weather, tod: st.timeOfDay, g: st.gravity, halt: st.weatherEffectTime };
                        const takt = async (k) => { for (let i = 0; i < k; i++) await window.__seitenTakt(); };
                        const sprung = async (h) => { r.setTimeOfDay(((h + 6) % 24) / 24, "regler"); await takt(1); r.setTimeOfDay(h / 24, "regler"); await takt(2); };
                        const wetter = (w) => { if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter " + w + " gilt nicht"); };
                        const pearson = (x, y) => { const m = x.length; if (m < 3) return null; const mx = x.reduce((s, v) => s + v, 0) / m, my = y.reduce((s, v) => s + v, 0) / m; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < m; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null; };
                        const aus = { n };
                        const LAGEN = a.lagen;
                        const lagen = () => { let k = 0, kap = 0; for (const b of Lb) { const G = D.gestalten && D.gestalten[b.gestalt]; const top = G && ((G.ov && G.ov.top) || (G.dK && G.dK.top)); if (LAGEN.includes(top)) k++; if (G && G.ov && G.ov.kapuze) kap++; } return { lagen: k / n, kapuze: kap / n, tops: [...new Set(Lb.map((b) => { const G = D.gestalten && D.gestalten[b.gestalt]; return G && G.ov && G.ov.top; }))].join("+") }; };
                        try {
                            wetter("sunny"); await sprung(12); const s1 = lagen(), rs = r._weatherFieldFor().rain;
                            wetter("rainy"); await sprung(12); const s2 = lagen(), rr = r._weatherFieldFor().rain;
                            wetter("sunny"); await sprung(12); const s3 = lagen();
                            aus.s1 = { sonne: s1, regen: s2, gegen: s3, rainSonne: rs, rainRegen: rr };
                        } catch (e) { aus.s1 = { fehler: String((e && e.message) || e).slice(0, 200) }; }
                        const toene = Object.keys(kc.SKIN_TONES);
                        const zellen = [];
                        for (let cx = -11; cx <= 11 && zellen.length < 240; cx++) for (let cz = -11; cz <= 11; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push(c); }
                        const anker = await r._planetAnker();
                        const ton = [], zs = [];
                        for (const c of zellen.slice(0, 200)) { const g = r._rollHumanoidGenome(c.seed + ":1:0"); ton.push(toene.indexOf(g.skinTone)); zs.push(c.z); }
                        aus.s2 = { genome: ton.length, toene: new Set(ton).size, rZ: pearson(ton, zs), breiteGrad: (anker.breite * 180) / Math.PI, breiteStreuung: 0 };
                        try {
                            const T = D.plan.kleidung;
                            const zonen = kc.kleidZonen(Object.assign({}, kc.START_PARAMS, { top: T.top, bottom: T.bottom, shoes: T.shoes }));
                            const stoffe = [...new Set(zonen.map((z) => z.webe))];
                            const erz = new Set();
                            for (const f of D.plan.felder || []) for (const k of ["frucht", "art", "ernte", "kultur"]) if (typeof f[k] === "string") erz.add(f[k]);
                            for (const s of D.plan.staende || []) for (const k of ["ware", "gut", "art"]) if (typeof s[k] === "string") erz.add(s[k]);
                            aus.s3 = { tracht: T.top + "/" + T.bottom + "/" + T.shoes, stoffe, erzeugnisse: [...erz], felder: (D.plan.felder || []).length, staende: (D.plan.staende || []).length, drin: stoffe.filter((s) => erz.has(s)).length };
                        } catch (e) { aus.s3 = { fehler: String((e && e.message) || e).slice(0, 200) }; }
                        const anteile = {};
                        for (const b of Lb) anteile[b.farben.skinTone] = (anteile[b.farben.skinTone] || 0) + 1;
                        let simpson = 1;
                        for (const k of Object.keys(anteile)) simpson -= (anteile[k] / n) ** 2;
                        let hafen = 0, plaene = 0;
                        for (const c of zellen.slice(0, 64)) { const P = await r._foundryRequestSettlement({ seed: c.seed, nH: c.nH }); if (!P) continue; plaene++; if (P.slots.some((s) => /hafen|kai|mole/i.test(String(s.rolle || "")))) hafen++; }
                        aus.s4 = { vielfaltDorf: simpson, plaene, hafen };
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const hoch = () => Lb.reduce((s, b) => s + r._rollHumanoidGenome(b.seed).kh * 800, 0) / n;
                        const ep = [];
                        for (const j of a.jahre) {
                            const e = E(j);
                            const P = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH, epoche: e });
                            const T = P && P.kleidung;
                            ep.push({ jahr: j, epoche: e, tracht: T ? [T.top, T.bottom, T.shoes, T.farben.join("+")].join("/") : null, cm: hoch() });
                        }
                        const P0 = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH, epoche: E(a.jahre[0]) });
                        const tr0 = P0 && P0.kleidung ? [P0.kleidung.top, P0.kleidung.bottom, P0.kleidung.shoes, P0.kleidung.farben.join("+")].join("/") : null;
                        aus.s5 = { ep, gegenGleich: tr0 === ep[0].tracht && Math.abs(hoch() - ep[0].cm) < 1e-9 };
                        try {
                            const vor = Lb.map((b) => r._rollHumanoidGenome(b.seed));
                            const pv = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH });
                            st.weatherEffectTime = 0;
                            try { r.dslRun(["gravity", alt.g * 2], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; }
                            const g2 = st.gravity;
                            const nach = Lb.map((b) => r._rollHumanoidGenome(b.seed));
                            const pn = await r._foundryRequestSettlement({ seed: a.same, nH: a.nH });
                            const kh = (L) => L.reduce((s, x) => s + x.kh, 0) / L.length, bau = (L) => L.reduce((s, x) => s + x.build, 0) / L.length;
                            const stock = (P) => P.slots.reduce((s, x) => s + ((x.ov && x.ov.storeys) || 1), 0) / P.slots.length;
                            aus.s6 = { gFaktor: g2 / alt.g, khVor: kh(vor), khNach: kh(nach), bauVor: bau(vor), bauNach: bau(nach), stockVor: stock(pv), stockNach: stock(pn) };
                        } catch (e) { aus.s6 = { fehler: String((e && e.message) || e).slice(0, 200) }; }
                        finally {
                            if (st.gravity !== alt.g) { st.weatherEffectTime = 0; try { r.dslRun(["gravity", alt.g], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; } }
                            if (st.gravity !== alt.g) st.gravity = alt.g;
                            window.__wetterSetzen(alt.w);
                            r.setTimeOfDay(alt.tod, "regler");
                        }
                        aus.gZurueck = st.gravity === alt.g;
                        return aus;
                    };
                    const d = await S(dorf, { same: 7, nH: 8 });
                    if (!d || d.fehler) throw new Error("das Dorf der Probe: " + (d && d.fehler));
                    const m = await S(leib, { lagen: ["pullover", "poncho", "jacket", "jacke", "coat", "mantel", "hoodie"], same: d.seed, nH: 8, jahre: [1320, 1560, 1700, 1860] });
                    if (!m || m.fehler) throw new Error("der Leib: " + (m && m.fehler));
                    const aus = {};
                    const s1 = m.s1 || {};
                    const amGeraet = async (name, code) => {
                        if (M.swift) return M.auge(name, d.pose, {});
                        await H.seite("const st = r.state; window.__kmAugeAlt = { w: st.weather, tod: st.timeOfDay, g: st.gravity, halt: st.weatherEffectTime }; " + code + " return 1;");
                        try { return await M.auge(name, d.pose, {}); }
                        finally { await H.seite("const st = r.state, a = window.__kmAugeAlt; if (a) { window.__wetterSetzen(a.w); r.setTimeOfDay(a.tod, \"regler\"); if (st.gravity !== a.g) { st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", a.g], { source: \"human\" }); } finally { st.weatherEffectTime = a.halt; } if (st.gravity !== a.g) st.gravity = a.g; } } delete window.__kmAugeAlt; return 1;"); }
                    };
                    const a1s = await amGeraet("mensch-leib-s1-sonne", "window.__wetterSetzen(\"sunny\"); r.setTimeOfDay(0.5, \"regler\");");
                    const a1r = await amGeraet("mensch-leib-s1-regen", "window.__wetterSetzen(\"rainy\"); r.setTimeOfDay(0.5, \"regler\");");
                    const auge1 = { bild: a1s.bild && a1r.bild ? a1s.bild + " ↔ " + a1r.bild : null, pose: a1s.pose, grund: a1s.grund || a1r.grund };
                    aus[1] = s1.fehler ? { werte: {}, nicht: "der Wechsel Sonne ↔ Regen warf: " + s1.fehler, auge: auge1 } : {
                        werte: { lagenDelta: s1.regen.lagen - s1.sonne.lagen, lagenSonne: s1.sonne.lagen, lagenRegen: s1.regen.lagen, kapuzeRegen: s1.regen.kapuze },
                        zeuge: { n: m.n, dorfMs: d.ms, dorfGebaut: d.gebaut, rainSonne: s1.rainSonne, rainRegen: s1.rainRegen, tops: s1.sonne.tops + " → " + s1.regen.tops + " → " + s1.gegen.tops, gegen: s1.gegen.lagen },
                        auge: auge1,
                        ...(s1.regen.lagen - s1.sonne.lagen > 0 ? {} : { nicht: "die Tracht folgt dem Wetter nicht: unter Regen trägt das Dorf dieselbe Gestalt (" + s1.regen.tops + "), Lagen " + s1.sonne.lagen + " → " + s1.regen.lagen + ", Kapuze 0 — die Tracht ist die der Epoche (stamm/siedlung-bewohner.js:363 _bewohnerTracht)" }),
                    };
                    const s2 = m.s2;
                    aus[2] = { werte: { saaten: s2.genome, hautToene: s2.toene, rHauttonNordSued: s2.rZ, breiteGrad: s2.breiteGrad }, zeuge: { genome: s2.genome, toene: s2.toene, breiteStreuung: s2.breiteStreuung }, nicht: "keine Herkunfts-Breite am Leib: die Welt trägt EINEN Anker (" + s2.breiteGrad.toFixed(2) + "° N, stamm/gelaende-chunks.js:680 _planetAnker) und das Genom liest keine — Hautton gleichverteilt über " + s2.toene + " Töne (stamm/koerper-leib.js:44 skinTone)" };
                    const s3 = m.s3 || {};
                    aus[3] = s3.fehler ? { werte: {}, nicht: "der Stoff der Tracht warf: " + s3.fehler } : { werte: { stoffProzent: (100 * s3.drin) / Math.max(1, s3.stoffe.length), stoffe: s3.stoffe.length, erzeugnisse: s3.erzeugnisse.length, felder: s3.felder }, zeuge: { stoffe: s3.stoffe.length, erzeugnisse: s3.erzeugnisse.length, gegenWechsel: false, tracht: s3.tracht + " = " + s3.stoffe.join("+") }, ...(s3.erzeugnisse.length ? {} : { nicht: "die Region trägt keine Erzeugnisse: " + s3.felder + " Felder ohne Frucht, keine Herde, " + s3.staende + " Stände ohne Ware — die Tracht (" + s3.tracht + ") ist Wolle/Denim/Leder aus dem Schnitt (koerper-core.js:257 webe), nie aus Feld oder Handel" }) };
                    const s4 = m.s4;
                    aus[4] = { werte: { vielfaltDorf: s4.vielfaltDorf, hafenOrte: s4.hafen, plaene: s4.plaene }, zeuge: { plaene: s4.plaene, hafen: s4.hafen }, auge: await M.auge("mensch-leib-s4", d.pose, {}), nicht: "kein Hafen unter " + s4.plaene + " Plänen der Zellen und keine Migration: das Genom liest nur seinen Samen (stamm/koerper-leib.js:10 _rollHumanoidGenome), jedes Dorf ist gleich gemischt (Simpson " + s4.vielfaltDorf.toFixed(2) + ")" };
                    const s5 = m.s5, ref = U[5].ref;
                    const abw = s5.ep.map((e) => Math.abs(e.cm - ref[String(e.jahr)]));
                    const cms = s5.ep.map((e) => e.cm);
                    const trachten = s5.ep.map((e) => e.tracht);
                    const eindeutig = trachten.filter((t) => t && trachten.filter((u) => u === t).length === 1).length;
                    aus[5] = { werte: { epocheProzent: (100 * eindeutig) / s5.ep.length, groesseAbwCm: Math.max(...abw), groesseCm: cms[0] }, zeuge: { plaene: s5.ep.filter((e) => e.tracht).length, trachtWechsel: new Set(trachten).size - 1, groesseStreuungCm: Math.max(...cms) - Math.min(...cms), gegenGleich: s5.gegenGleich, epochen: s5.ep.map((e) => e.jahr + ":" + e.epoche + ":" + e.cm.toFixed(1)).join(" ") } };
                    const s6 = m.s6 || {};
                    aus[6] = s6.fehler ? { werte: {}, nicht: "die Schwerkraft 2 g warf: " + s6.fehler, auge: await amGeraet("mensch-leib-s6", "") } : {
                        werte: { gFaktor: s6.gFaktor, gedrungen: (s6.khVor - s6.khNach) / s6.khVor + (s6.bauNach - s6.bauVor), stockwerkDelta: s6.stockNach - s6.stockVor },
                        zeuge: { gFaktor: s6.gFaktor, gZurueck: m.gZurueck, kh: s6.khVor + " → " + s6.khNach },
                        auge: await amGeraet("mensch-leib-s6", "st.weatherEffectTime = 0; try { r.dslRun([\"gravity\", 2 * st.gravity], { source: \"human\" }); } finally { st.weatherEffectTime = window.__kmAugeAlt.halt; }"),
                        ...(s6.khNach < s6.khVor || s6.bauNach > s6.bauVor ? {} : { nicht: "der Leib liest die Schwerkraft nicht: unter " + s6.gFaktor + " g dieselbe Höhe und derselbe Bau (stamm/koerper-leib.js:43 kh aus dem Samen; der Welt-Akt gravity schreibt nur state.gravity für _stepCharacter, stamm/feld-dsl.js:961 gravity)" }),
                    };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [sollWort(LEIB, 1, "Lagen-Anteil steigt im Bildpaar", { key: "lagenDelta", rel: ">", zahl: 0 })],
                        auge: { pose: "Third über dem Dorfplatz (32 m, 9 m über Grund), Sonne 12 Uhr ↔ Regen 12 Uhr", vorbild: "Bildpaar Sonne ↔ Regen desselben Platzes: Prüfer-Satz (R11) zählt Lagen und Kapuzen" },
                        taeter: "stamm/siedlung-bewohner.js _bewohnerTracht (die Tracht der Epoche, kein Wetter)",
                        nicht: "die Tracht liest kein Wetter",
                        leser: "stamm/siedlung-bewohner.js:363 _bewohnerTracht(d, T, tuch) setzt nur den Schnitt der Epoche (S.plan.kleidung); kein Leser des Wetter-Felds (rain) und der Temperatur am Leib",
                        gruen: { werte: { lagenDelta: 0.4 }, zeuge: { n: 27 } },
                        attrappen: [{ name: "Lagen-Anteil aus einer Tafel ohne Bild", roh: { werte: { lagenDelta: 0.4 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(LEIB, 2, "200 Saaten", { key: "saaten", rel: "≥", zahl: 200 }), K.soll(LEIB, 2, "Hautton ↔ Breite r ≥ 0,7", { key: "r" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.genome >= 200)) return "nur " + (z.genome || 0) + " Genome der Welt (Soll 200)";
                            if (!(z.toene >= 2)) return "die Genome tragen keinen Wechsel des Hauttons";
                            if (!(z.breiteStreuung > 0)) return "die Herkunft trägt keine Streuung der Breite (EIN Anker — r ohne Ursache)";
                            if (!(Math.abs(z.gegenR) < 0.2)) return "der Gegenlauf fehlt: dieselbe Breite für alle muss den Gang auslöschen (r " + z.gegenR + ")";
                            return null;
                        },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (Hautton aus dem Samen, keine Breite)",
                        nicht: "keine Breite am Leib",
                        leser: "stamm/koerper-leib.js:44 skinTone = g.pick(\"skin\", …) gleichverteilt; kein Leser der Herkunfts-Breite (UV) und keine Breite je Siedlung (stamm/gelaende-chunks.js:680 _planetAnker, EIN Anker je Welt)",
                        gruen: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 200, toene: 7, breiteStreuung: 31.5, gegenR: 0.03 } },
                        attrappen: [
                            { name: "r 0,74 aus einer Hautton-Tafel je Breite (kein Genom der Welt)", roh: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 0 } } },
                            { name: "r über EINE Breite (keine Streuung der Ursache)", roh: { werte: { saaten: 200, r: 0.74 }, zeuge: { genome: 200, toene: 7, breiteStreuung: 0, gegenR: 0 } } },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(LEIB, 3, "Stoffe ⊆ Erzeugnisse und Handel der Region 100 %", { key: "stoffProzent", rel: "≥", zahl: 100, einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.stoffe >= 1)) return "kein Stoff der Tracht gelesen";
                            if (!(z.erzeugnisse >= 1)) return "die Region trägt keine Erzeugnisse (Feld, Herde, Handel) — 100 % über einer leeren Menge";
                            if (z.gegenWechsel !== true) return "der Gegenlauf fehlt: die Wolle aus der Region genommen, und die Tracht bleibt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kleidung = Schnitt der Epoche, kein Stoff aus Feld/Herde/Handel)",
                        nicht: "keine Erzeugnisse der Region",
                        leser: "fachwerk-core.js:4515 kleidung {top, bottom, shoes, farben} aus EPOCHEN[…].tracht; kein Leser von Flachs, Wolle, Seide aus Feld, Herde, Handel (koerper-core.js:257 webe folgt nur dem Schnitt)",
                        gruen: { werte: { stoffProzent: 100 }, zeuge: { stoffe: 3, erzeugnisse: 4, gegenWechsel: true } },
                        attrappen: [{ name: "100 % über einer leeren Erzeugnis-Liste", roh: { werte: { stoffProzent: 100 }, zeuge: { stoffe: 3, erzeugnisse: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [sollWort(LEIB, 4, "Vielfalts-Index Hafen > Bergdorf", { key: "vielfaltDelta", rel: ">", zahl: 0 })],
                        auge: { pose: "Third über dem Dorfplatz (heute: das Dorf der Probe; ein Hafen fehlt)", vorbild: "Bildpaar Hafen ↔ Bergdorf gegen Zensus-Daten gemischter Häfen, Prüfer-Satz (R11)" },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (kein Hafen, keine Migration)",
                        nicht: "kein Hafen, keine Migration",
                        leser: "fachwerk-core.js:4410 region der Siedlung fällt aus rnd() des Samens; kein Hafen-Ort und kein Zuzug, der Leib und Mode mischt",
                        gruen: { werte: { vielfaltDelta: 0.2 }, zeuge: { plaene: 64, hafen: 3 } },
                        attrappen: [{ name: "Vielfalt ohne Hafen", roh: { werte: { vielfaltDelta: 0.2 }, zeuge: { plaene: 0 } } }],
                    },
                    5: {
                        u: { ref: { 1320: 171, 1560: 170, 1700: 167, 1860: 167 } },
                        soll: [K.soll(LEIB, 5, "Epoche ≥ 80 %", { key: "epocheProzent", einheit: "%" }), K.soll(LEIB, 5, "Körpergröße ± 5 cm gegen reale Kurve", { key: "groesseAbwCm", rel: "≤", zahl: 5, einheit: "cm" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.plaene >= 4)) return "nur " + (z.plaene || 0) + " Pläne der Epochen (Soll 4)";
                            if (!(z.trachtWechsel >= 1)) return "die Tracht wechselt über 4 Epochen nicht";
                            if (!(z.groesseStreuungCm > 0)) return "die Körpergröße DERSELBEN Bewohner wandelt sich über 4 Epochen nicht (" + z.epochen + ") — die Epoche erreicht den Leib nicht";
                            if (z.gegenGleich !== true) return "der Gegenlauf fehlt: dieselbe Epoche zweimal ist nicht gleich";
                            return null;
                        },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (kh aus dem Samen, kein Jahr)",
                        leser: "stamm/koerper-leib.js:43 kh = 0,215 · (1 + 0,08 · …) aus dem Samen; kein Leser des Jahrs (Referenz: Koepke & Baten 2005, Hatton & Bray 2010)",
                        unklar: "„Epoche ≥ 80 %“ nennt nicht, wer die Epoche erkennt — Vorschlag: Prüfer-Satz (R11) ordnet 4 Tracht-Bilder ihren Epochen zu, ≥ 80 % richtig; die Station zählt bis dahin die Epochen mit eindeutiger Tracht",
                        gruen: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 4, trachtWechsel: 3, groesseStreuungCm: 4.6, gegenGleich: true } },
                        attrappen: [
                            { name: "die Größe der Erd-Kurve abgeschrieben (der Leib wandelt sich nicht)", roh: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 4, trachtWechsel: 3, groesseStreuungCm: 0, gegenGleich: true } } },
                            { name: "ohne Pläne der Epochen", roh: { werte: { epocheProzent: 100, groesseAbwCm: 2.4 }, zeuge: { plaene: 0 } } },
                        ],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LEIB, 6, "2 g", { key: "gFaktor" }), sollWort(LEIB, 6, "Statur gedrungener", { key: "gedrungen", rel: ">", zahl: 0 }), K.soll(LEIB, 6, "Leib und Kultur kohärent ≥ 0,8", { key: "kohaerent" })],
                        auge: { pose: "Third über dem Dorfplatz unter 2 g (Welt-Akt gravity)", vorbild: "Fremdwelt-Probe (R10): ein eingefrorener Leser sagt aus dem Bild die Schwerkraft voraus, Kohärenz Leib ↔ Kultur ≥ 0,8" },
                        taeter: "stamm/koerper-leib.js _rollHumanoidGenome (keine Schwerkraft am Leib)",
                        nicht: "der Leib liest keine Schwerkraft",
                        leser: "stamm/feld-dsl.js:961 gravity, der Welt-Akt, schreibt state.gravity nur für _stepCharacter; das Genom (stamm/koerper-leib.js:43 kh) und der Plan (fachwerk-core.js:4403 DORF) lesen sie nicht",
                        gruen: { werte: { gFaktor: 2, gedrungen: 0.06, kohaerent: 0.85 }, zeuge: { gFaktor: 2, gZurueck: true } },
                        attrappen: [{ name: "gedrungen ohne Schwerkraft-Akt", roh: { werte: { gFaktor: 2, gedrungen: 0.06, kohaerent: 0.85 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.sport — Sport sitzt im Leben der Welt ════════
            // Der Tag jedes Bewohners am Abend (18,5–21 Uhr) über das Soll des Gesetzes (`_bewohnerSoll` → koerper tagesPlan) unter Sonne
            // und Regen, der Mittag als Gegenlauf (die Ursache Abend gekappt); die Rollen der Pläne an 200 Zellen (Sportstätten, Arenen)
            // gegen den Boden der Zelle (`_bodenKlasseAt`). Was der Tag nicht kennt (Spiel, Partie, Eis, Liga), urteilt „nicht erzeugbar“.
            [SPORT]: {
                sek: 35,
                mutiert: true,
                pfad: PFAD_DORF,
                ungefahren: "das Bild der Sportkultur zweier Saaten (S5, S6) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const dorf = async (r, a) => {
                        const st = r.state, pm = st.playerMesh.position;
                        const nah = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.plan && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230).sort((p, q) => Math.hypot(p.ox - pm.x, p.oz - pm.z) - Math.hypot(q.ox - pm.x, q.oz - pm.z));
                        const lebt = () => nah().find((q) => q.liste && q.lebt && q.liste.length >= 8);
                        let D = lebt();
                        if (!D && !nah().length) {
                            let ort = null;
                            for (const R of [100, 130, 160]) for (let k = 0; k < 16 && !ort; k++) { const w = (k / 16) * 2 * Math.PI, x = pm.x + Math.cos(w) * R, z = pm.z + Math.sin(w) * R; if (r._landAt(x, z, 0.2) && !(r._nassAt && r._nassAt(x, z))) ort = { x, z }; }
                            if (!ort) return { fehler: "kein Land 100–160 m um den Spieler für das Dorf der Probe" };
                            await r.spawnSettlement({ seed: a.same, nH: a.nH, position: { x: ort.x, y: 0, z: ort.z } });
                        }
                        if (!D) {
                            try { await window.__gebautNach("das Dorf der Probe mensch", { fertig: () => !!lebt(), max: 400 }); } catch (e) { return { fehler: "das Dorf lebt nicht: " + String((e && e.message) || e).slice(0, 160) }; }
                            D = lebt();
                        }
                        if (!D) return { fehler: "kein lebendes Dorf ≤ 230 m um den Spieler" };
                        window.__kmDorf = D.key;
                        const y = r.getTerrainHeightAt(D.ox, D.oz);
                        return { key: D.key, n: D.liste.length, seed: D.plan.seed, pose: { px: D.ox, py: y + 9, pz: D.oz + 32, lx: D.ox, ly: y + 1.5, lz: D.oz } };
                    };
                    const sport = async (r, a) => {
                        const st = r.state;
                        const D = r._bewohnerSiedlungen.get(window.__kmDorf);
                        if (!D || !D.liste) return { fehler: "das Dorf der Probe fehlt" };
                        const Lb = D.liste, n = Lb.length, alt = { w: st.weather };
                        const SPIEL = /spiel|sport|partie|eis|ball|ringen|lauf|rudern|klettern/i;
                        const zaehle = (stunden) => { let spiel = 0, ges = 0, platz = 0; const akte = {}; for (const h of stunden) for (const b of Lb) { const z = r._bewohnerSoll(b, h); ges++; akte[z.akt] = (akte[z.akt] || 0) + 1; if (SPIEL.test(String(z.akt))) spiel++; if (z.wo === "platz" && !z.drinnen) platz++; } return { spiel, ges, platz, akte }; };
                        const aus = { n };
                        try {
                            window.__wetterSetzen("sunny");
                            aus.abend = zaehle(a.abend); aus.mittag = zaehle(a.mittag); aus.rainSonne = r._weatherFieldFor().rain;
                            window.__wetterSetzen("rainy");
                            aus.abendRegen = zaehle(a.abend); aus.rainRegen = r._weatherFieldFor().rain;
                            window.__wetterSetzen("sunny");
                            aus.abendGegen = zaehle(a.abend);
                        } finally { window.__wetterSetzen(alt.w); }
                        const zellen = [];
                        for (let cx = -11; cx <= 11 && zellen.length < 200; cx++) for (let cz = -11; cz <= 11 && zellen.length < 200; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push(c); }
                        const STAETTE = /arena|stadion|sport|bad|turnier|reitbahn|kampfbahn|spielplatz|liga/i;
                        let staetten = 0, plaene = 0;
                        const biome = {}, rollen = new Set();
                        for (const c of zellen) {
                            const P = await r._foundryRequestSettlement({ seed: c.seed, nH: c.nH });
                            if (!P) continue;
                            plaene++;
                            for (const s of P.slots) { rollen.add(String(s.rolle || "-")); if (STAETTE.test(String(s.rolle || ""))) staetten++; }
                            const k = r._bodenKlasseAt(c.x, c.z);
                            biome[k] = (biome[k] || 0) + 1;
                        }
                        aus.zellen = { plaene, staetten, biome: Object.keys(biome).length, rollen: [...rollen].join("+") };
                        return aus;
                    };
                    const d = await S(dorf, { same: 7, nH: 8 });
                    if (!d || d.fehler) throw new Error("das Dorf der Probe: " + (d && d.fehler));
                    const m = await S(sport, { abend: [18.5, 19, 19.5, 20, 20.5], mittag: [10, 11, 14, 15, 16] });
                    if (!m || m.fehler) throw new Error("der Sport: " + (m && m.fehler));
                    const akte = Object.keys(m.abend.akte).join("+");
                    const kein = "der Tag kennt kein Spiel: die Akte am Abend sind " + akte + " (koerper-core.js:5326 tagesPlan — schlaf · morgen · besuch · arbeit · mittag · abend)";
                    const z = m.zellen;
                    const aus = {};
                    aus[1] = { werte: { spielProzent: (100 * m.abend.spiel) / m.abend.ges, amPlatzProzent: (100 * m.abend.platz) / m.abend.ges }, zeuge: { n: m.n, spielAbend: m.abend.spiel, spielMittag: m.mittag.spiel, stunden: 5 }, nicht: kein };
                    aus[2] = { werte: { partienSonne: m.abend.spiel, partienRegen: m.abendRegen.spiel, amPlatzSonne: m.abend.platz, amPlatzRegen: m.abendRegen.platz }, zeuge: { partienSonne: m.abend.spiel, regen: m.rainRegen, gegenPartien: m.abendGegen.spiel }, nicht: kein + "; keine Partie, die der Regen abbricht, kein Eis unter 0 °C" };
                    aus[3] = { werte: { saaten: z.plaene, staetten: z.staetten, biome: z.biome }, zeuge: { saaten: z.plaene, sportarten: 0, biome: z.biome }, nicht: "keine Sportart an " + z.plaene + " Plänen der Zellen (Rollen " + z.rollen.slice(0, 160) + ") — fachwerk DORF kennt keine Sportstätte" };
                    aus[4] = { werte: { stadien: z.staetten }, zeuge: { stadien: z.staetten }, nicht: "kein Stadion und kein Spieltag: " + z.staetten + " Sportstätten unter " + z.plaene + " Plänen" };
                    aus[5] = { werte: { artenJeSaat: 0, staetten: z.staetten }, zeuge: { saaten: z.plaene }, auge: await M.auge("mensch-sport-s5", d.pose, {}), nicht: "keine Sportart mit Lebenslauf (keine Sportstätte, kein Spiel im Tag)" };
                    aus[6] = { werte: { sportkulturAnders: 0, biome: z.biome }, zeuge: { saaten: z.plaene }, auge: await M.auge("mensch-sport-s6", d.pose, {}), nicht: "keine Sportkultur, die das Gelände formen könnte (" + z.biome + " Böden unter " + z.plaene + " Zellen, 0 Sportstätten)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(SPORT, 1, "Anteil im Spiel 5–15 %", { key: "spielProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.n >= 8)) return "nur " + (z.n || 0) + " Bewohner";
                            if (!(z.spielAbend > 0)) return "am Abend spielt niemand (Soll der Welt: 0 Akte „Spiel“)";
                            if (!(z.spielMittag < z.spielAbend)) return "der Gegenlauf fehlt: am Mittag (der Abend gekappt) spielen ebenso viele (" + z.spielMittag + ")";
                            return null;
                        },
                        taeter: "koerper-core.js tagesPlan (kein Spiel am Abend)",
                        nicht: "kein Spiel im Tag",
                        leser: "koerper-core.js:5326 tagesPlan(same, rolle, stunde, orte, nass) kennt die Akte schlaf · morgen · besuch · arbeit · mittag · abend; keine Freizeit, kein Spiel auf dem Platz",
                        gruen: { werte: { spielProzent: 9 }, zeuge: { n: 27, spielAbend: 12, spielMittag: 0 } },
                        attrappen: [{ name: "9 % aus einer Tafel ohne Akt der Welt", roh: { werte: { spielProzent: 9 }, zeuge: { n: 27, spielAbend: 0, spielMittag: 0 } } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(SPORT, 2, "Partien bei Regen ↓ ≥ 50 %", { key: "regenRueckgangProzent", einheit: "%" }), K.soll(SPORT, 2, "Eis nur < 0 °C", { key: "eisMaxC", einheit: "°C" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.partienSonne > 0)) return "keine Partie unter Sonne — ein Rückgang über nichts";
                            if (!(z.regen >= 0.3)) return "der Regen am Ort stand nicht";
                            if (!(z.gegenPartien > 0)) return "der Gegenlauf fehlt: die Sonne zurück, und keine Partie kehrt wieder";
                            return null;
                        },
                        taeter: "koerper-core.js tagesPlan (keine Partie, kein Eis)",
                        nicht: "keine Partie, kein Eis",
                        leser: "koerper-core.js:5326 tagesPlan kennt keine Partie; der Regen treibt nur ins Haus (koerper-core.js:5218 regen, TAGES_GESETZ), kein Eis-Sport an der Temperatur (stamm/bild-himmel.js:2874 _temperaturAt hat keinen Leser im Tag)",
                        gruen: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 10, regen: 0.6, gegenPartien: 10 } },
                        attrappen: [{ name: "Rückgang 80 % ohne Partie", roh: { werte: { regenRueckgangProzent: 80, eisMaxC: -2 }, zeuge: { partienSonne: 0, regen: 0.6, gegenPartien: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(SPORT, 3, "200 Saaten", { key: "saaten", rel: "≥", zahl: 200 }), K.soll(SPORT, 3, "Biom ↔ Sportart Cramérs V ≥ 0,3", { key: "cramersV" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.saaten >= 200)) return "nur " + (z.saaten || 0) + " Pläne der Zellen";
                            if (!(z.sportarten >= 2)) return "weniger als zwei Sportarten in der Welt (" + (z.sportarten || 0) + ")";
                            if (!(z.biome >= 2)) return "nur ein Boden unter den Zellen";
                            if (!(z.gegenV < 0.1)) return "der Gegenlauf fehlt: die Böden vertauscht, und V bleibt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (keine Sportstätte, kein Boden)",
                        nicht: "keine Sportart",
                        leser: "fachwerk-core.js:4403 DORF(DP) liest Same, Größe, Epoche; keine Sportstätte und kein Boden der Zelle",
                        gruen: { werte: { saaten: 200, cramersV: 0.41 }, zeuge: { saaten: 200, sportarten: 5, biome: 6, gegenV: 0.04 } },
                        attrappen: [{ name: "V 0,41 aus einer Tabelle", roh: { werte: { saaten: 200, cramersV: 0.41 }, zeuge: { saaten: 200, sportarten: 0, biome: 6 } } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(SPORT, 4, "Verkehr ≥ + 30 % auf Stadion-Trassen", { key: "verkehrPlusProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.stadien >= 1)) return "kein Stadion in der Welt";
                            if (!(z.kontrolle > 0)) return "kein Verkehr am Kontroll-Tag gemessen (der Gegenlauf fehlt)";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kein Stadion), stamm/siedlung-verkehr.js (kein Spieltag)",
                        nicht: "kein Stadion",
                        leser: "stamm/siedlung-verkehr.js:27 _verkehrAnlegen(S) legt die Wagen nur in der Stadt ihres Plans an (PFLICHT-OFFEN C); kein Spieltag und kein Stadion als Ziel",
                        gruen: { werte: { verkehrPlusProzent: 42 }, zeuge: { stadien: 1, kontrolle: 18 } },
                        attrappen: [{ name: "+42 % ohne Stadion", roh: { werte: { verkehrPlusProzent: 42 }, zeuge: { stadien: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(SPORT, 5, "je Saat ≥ 1 Art mit Lebenslauf", { key: "artenJeSaat" }), K.soll(SPORT, 5, "plausibel ≥ 70 %", { key: "plausibelProzent", einheit: "%" })],
                        auge: { pose: "Third über dem Dorfplatz (heute ohne Sportstätte)", vorbild: "Prüfer-Satz (R11): der Lebenslauf einer Sportart (Entstehen, Wandern, Sterben) gegen die Geschichte realer Sportarten, ≥ 70 % plausibel" },
                        taeter: "fachwerk-core.js DORF / koerper-core.js tagesPlan (keine Sportart)",
                        nicht: "keine Sportart",
                        leser: "koerper-core.js:5326 tagesPlan kennt kein Spiel; fachwerk-core.js:4403 DORF keine Sportstätte",
                        gruen: { werte: { artenJeSaat: 2, plausibelProzent: 75 }, zeuge: { saaten: 16 } },
                        attrappen: [{ name: "zwei Arten ohne Welt", roh: { werte: { artenJeSaat: 2, plausibelProzent: 75 }, zeuge: {} } }],
                    },
                    6: {
                        u: {},
                        soll: [sollWort(SPORT, 6, "andere Geländesaat zeigt andere Sportkultur", { key: "sportkulturAnders", rel: ">", zahl: 0 })],
                        auge: { pose: "Third über dem Dorfplatz zweier Geländesaaten zur gleichen Stunde", vorbild: "Prüfer-Satz (R11) im Blindpaar: welche Sportkultur gehört zu welchem Gelände, stimmig" },
                        taeter: "fachwerk-core.js DORF / koerper-core.js tagesPlan (keine Sportkultur)",
                        nicht: "keine Sportkultur",
                        leser: "fachwerk-core.js:4403 DORF liest kein Gelände; koerper-core.js:5326 tagesPlan kein Spiel",
                        gruen: { werte: { sportkulturAnders: 1 }, zeuge: { saaten: 2 } },
                        attrappen: [{ name: "andere Sportkultur ohne Bild", roh: { werte: { sportkulturAnders: 1 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.leben — Leben und Welt formen sich ════════
            // S1 der Tag des Dorfs unter Sonne → Regen → Sonne (der Gegenlauf), je Stand der Anteil draußen NACH dem Sprung der Uhr (der Wirt
            // stellt jeden an das Soll seiner Stunde, `_bewohnerSoll` mit dem Regen des EINEN Wetter-Felds) — der Stand `b.drinnen`, den der
            // Spieler sieht, nie nur das Soll; S3 die Familie je Haus (die Liste, Samen „Plan:Haus:Person“) gegen das Volumen des Hauses und den
            // Plan 20 Jahre später; S2/S4–S6 fragen die Welt, ob sie Not, Gedächtnis und Wendepunkte trägt.
            [LEBEN]: {
                sek: 20,
                mutiert: true,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const dorf = async (r, a) => {
                        const st = r.state, pm = st.playerMesh.position;
                        const nah = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.plan && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230).sort((p, q) => Math.hypot(p.ox - pm.x, p.oz - pm.z) - Math.hypot(q.ox - pm.x, q.oz - pm.z));
                        const lebt = () => nah().find((q) => q.liste && q.lebt && q.liste.length >= 8);
                        let D = lebt();
                        if (!D && !nah().length) {
                            let ort = null;
                            for (const R of [100, 130, 160]) for (let k = 0; k < 16 && !ort; k++) { const w = (k / 16) * 2 * Math.PI, x = pm.x + Math.cos(w) * R, z = pm.z + Math.sin(w) * R; if (r._landAt(x, z, 0.2) && !(r._nassAt && r._nassAt(x, z))) ort = { x, z }; }
                            if (!ort) return { fehler: "kein Land 100–160 m um den Spieler für das Dorf der Probe" };
                            await r.spawnSettlement({ seed: a.same, nH: a.nH, position: { x: ort.x, y: 0, z: ort.z } });
                        }
                        if (!D) {
                            try { await window.__gebautNach("das Dorf der Probe mensch", { fertig: () => !!lebt(), max: 400 }); } catch (e) { return { fehler: "das Dorf lebt nicht: " + String((e && e.message) || e).slice(0, 160) }; }
                            D = lebt();
                        }
                        if (!D) return { fehler: "kein lebendes Dorf ≤ 230 m um den Spieler" };
                        window.__kmDorf = D.key;
                        return { key: D.key, n: D.liste.length, seed: D.plan.seed };
                    };
                    const leben = async (r, a) => {
                        const st = r.state, A = AnazhRealm;
                        const D = r._bewohnerSiedlungen.get(window.__kmDorf);
                        if (!D || !D.liste) return { fehler: "das Dorf der Probe fehlt" };
                        const Lb = D.liste, n = Lb.length, alt = { w: st.weather, tod: st.timeOfDay };
                        const takt = async (k) => { for (let i = 0; i < k; i++) await window.__seitenTakt(); };
                        const sprung = async (h) => { r.setTimeOfDay(((h + 6) % 24) / 24, "regler"); await takt(1); r.setTimeOfDay(h / 24, "regler"); await takt(a.takte); };
                        const wetter = (w) => { if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter " + w + " gilt nicht"); };
                        const pearson = (x, y) => { const m = x.length; if (m < 3) return null; const mx = x.reduce((s, v) => s + v, 0) / m, my = y.reduce((s, v) => s + v, 0) / m; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < m; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null; };
                        const stand = () => { const h = st.timeOfDay * 24; return { ist: Lb.filter((b) => !b.drinnen).length / n, soll: Lb.filter((b) => !r._bewohnerSoll(b, h).drinnen).length / n, rain: r._weatherFieldFor().rain }; };
                        const aus = { n };
                        try {
                            wetter("sunny"); await sprung(12); aus.sonne = stand();
                            wetter("rainy"); await sprung(12); aus.regen = stand();
                            wetter("sunny"); await sprung(12); aus.gegen = stand();
                        } catch (e) { aus.fehler1 = String((e && e.message) || e).slice(0, 200); }
                        finally { window.__wetterSetzen(alt.w); r.setTimeOfDay(alt.tod, "regler"); }
                        const fam = {};
                        for (const b of Lb) { const h = Number(String(b.seed).split(":")[1]); fam[h] = (fam[h] || 0) + 1; }
                        const vol = (s) => (s && s.ov ? (s.ov.W || 0) * (s.ov.D || 0) * Math.max(1, s.ov.storeys || 1) : 0);
                        const xs = [], ys = [];
                        D.plan.slots.forEach((s, h) => { if (String(s.rolle || "wohnhaus") === "wohnhaus" || fam[h]) { xs.push(fam[h] || 0); ys.push(vol(s)); } });
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const nH = ((st.worldMeta.settlementCells || {})[window.__kmDorf] || {}).nH || D.plan.slots.length;
                        const P0 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH });
                        const P0b = await r._foundryRequestSettlement({ seed: D.plan.seed, nH });
                        const ph = (P) => (P ? JSON.stringify(P.slots.map((x) => [x.seed, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys])) : null);
                        const P20 = await r._foundryRequestSettlement(D.plan.chronik ? { seed: D.plan.seed, nH, epoche: E(D.plan.jahr), jahr: D.plan.jahr + 20 } : { seed: D.plan.seed, nH, jahr: D.plan.jahr + 20 });
                        let anbau = 0, leer = 0, verfall = 0;
                        const da = [], dv = [];
                        if (P0 && P20) P0.slots.forEach((s, h) => { const t = P20.slots.find((q) => (q.seed >>> 0) === (s.seed >>> 0)); const v0 = vol(s), v1 = t ? vol(t) : 0; if (v1 > v0) anbau++; if (!fam[h]) { leer++; if (v1 < v0) verfall++; } da.push(fam[h] || 0); dv.push(v1 - v0); });
                        aus.s3 = { haeuser: xs.length, r: pearson(xs, ys), famStreuung: Math.max(...xs) - Math.min(...xs), sprung: !!(P0 && P20), gegenGleich: !!P0 && ph(P0) === ph(P0b), jahr20: D.plan.jahr + 20, chronik: !!D.plan.chronik, anbau, leer, verfall, rAnbau: pearson(da, dv) };
                        const ops = Object.keys(r.dslEffects || {});
                        aus.ops = { not: ops.filter((k) => /ernte|duerre|hunger|seuche|krieg|pest|missernte/i.test(k)), alle: ops.length };
                        const GED = /erinner|gedaecht|gedenk|trauer|chronik|lebenslauf|name/i;
                        aus.gedaechtnis = Lb.filter((b) => Object.keys(b).some((k) => GED.test(k))).length;
                        aus.namen = Lb.filter((b) => typeof b.name === "string" && b.name).length;
                        const bins = new Set(Lb.map((b) => Math.floor((b.genom && b.genom.alter) * 10)));
                        aus.kohorten = bins.size;
                        return aus;
                    };
                    const d = await S(dorf, { same: 7, nH: 8 });
                    if (!d || d.fehler) throw new Error("das Dorf der Probe: " + (d && d.fehler));
                    const m = await S(leben, { takte: 3 });
                    if (!m || m.fehler) throw new Error("das Leben: " + (m && m.fehler));
                    const aus = {};
                    aus[1] = m.fehler1 || !m.sonne ? { werte: {}, nicht: "der Wechsel Sonne ↔ Regen warf: " + m.fehler1 } : {
                        werte: { draussenSinkt: m.sonne.ist - m.regen.ist, draussenSonne: m.sonne.ist, draussenRegen: m.regen.ist, draussenGegen: m.gegen.ist, sollSonne: m.sonne.soll, sollRegen: m.regen.soll },
                        zeuge: { n: m.n, sonne: m.sonne.rain, regen: m.regen.rain, istSonne: m.sonne.ist, istRegen: m.regen.ist, istGegen: m.gegen.ist },
                    };
                    const ops = m.ops.not.length ? m.ops.not.join("+") : "keiner";
                    aus[2] = { werte: { notAkte: m.ops.not.length, gedaechtnisFelder: m.gedaechtnis }, zeuge: { betroffene: 0, befragt: 0 }, nicht: "keine Missernte und keine Not in der Welt: Welt-Akte der Not " + ops + " (von " + m.ops.alle + "), " + m.gedaechtnis + " von " + m.n + " Bewohnern tragen ein Gedächtnis — niemand zieht um, niemand nennt ein Ereignis" };
                    const s3 = m.s3;
                    aus[3] = {
                        werte: { r: s3.r, verfallProzent: s3.leer ? (100 * s3.verfall) / s3.leer : undefined, anbau: s3.anbau, rAnbau: s3.rAnbau },
                        zeuge: { haeuser: s3.haeuser, famStreuung: s3.famStreuung, sprung: s3.sprung, gegenGleich: s3.gegenGleich, anbau: s3.anbau, leer: s3.leer, jahr20: s3.jahr20, chronik: s3.chronik },
                        ...(s3.anbau > 0 ? {} : { nicht: "in 20 Jahren baut keine Familie an: der Plan des Dorfs " + (s3.chronik ? "mit" : "ohne") + " Chronik ist im Jahr " + s3.jahr20 + " derselbe (" + s3.anbau + " Häuser wuchsen, " + s3.verfall + " von " + s3.leer + " leeren verfielen) — die Leute folgen dem Haus (fachwerk-core.js:9527 leuteVon), das Haus nie der Familie" }),
                    };
                    aus[4] = { werte: { kohortenBins: m.kohorten, gedaechtnisFelder: m.gedaechtnis }, zeuge: { ereignis: false }, nicht: "kein Vulkan, keine Seuche, kein Krieg erreicht die Bewohner: keine Flucht vor einem Ereignis, kein Gedenken (" + m.gedaechtnis + " Gedächtnis-Felder), keine Kohorte über die Zeit (" + m.kohorten + " Alters-Stufen, ohne Geburt und Tod)" };
                    aus[5] = { werte: { personenBenannt: m.namen, wendepunkte: 0 }, zeuge: { wendepunkte: 0, personen: m.namen }, nicht: "keine Geschichte aus Leben: " + m.namen + " von " + m.n + " Bewohnern tragen einen Namen, die Welt kennt keinen Wendepunkt" };
                    aus[6] = { werte: { personenBenannt: m.namen, wendepunkte: 0 }, zeuge: { wendepunkte: 0, personen: m.namen }, nicht: "keine Wendepunkte und kein Planetenwechsel mit Personen (" + m.namen + " benannte Bewohner)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(LEBEN, 1, "Anteil draußen sinkt ≥ 0,3", { key: "draussenSinkt" })],
                        zeuge: zeugeRegen,
                        zeugeText: "der Regen treibt ins Haus, die Sonne zurück holt sie heraus (Gegenlauf)",
                        taeter: "koerper-core.js tagesPlan / stamm/siedlung-bewohner.js _bewohnerSoll (der Regen des Wetter-Felds)",
                        gruen: { werte: { draussenSinkt: 0.59 }, zeuge: DORF_Z },
                        attrappen: [
                            { name: "der Anteil aus dem Soll ohne Stand (niemand ging)", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, istRegen: 0.89 } } },
                            { name: "der Gegenlauf fehlt (die Sonne holt niemanden zurück)", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, istGegen: 0.3 } } },
                            { name: "ohne Regen am Ort", roh: { werte: { draussenSinkt: 0.59 }, zeuge: { ...DORF_Z, regen: 0 } } },
                        ],
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(LEBEN, 2, "mit Missernte ziehen ≥ 10 % der Betroffenen um", { key: "umzugProzent", einheit: "%" }),
                            sollWort(LEBEN, 2, "ändern ihren Tag", { key: "tagGeaendertProzent", rel: "≥", zahl: 10, einheit: "%" }),
                            sollWort(LEBEN, 2, "ohne Missernte keine Umzugswelle", { key: "umzugOhneProzent", rel: "<", zahl: 10, einheit: "%" }),
                            K.soll(LEBEN, 2, "Betroffene nennen das Ereignis auf Frage ≥ 0,8", { key: "nennenAnteil" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.betroffene >= 10)) return "nur " + (z.betroffene || 0) + " Betroffene einer Missernte in der Welt";
                            if (!(z.befragt >= 1)) return "niemand wurde befragt";
                            if (typeof z.gegenUmzugProzent !== "number") return "der Gegenlauf ohne Missernte fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Not, kein Gedächtnis eines Ereignisses)",
                        unklar: "„keine Umzugswelle“ trägt keine Zahl — Vorschlag: ohne Missernte ziehen < 10 % um (die Schwelle derselben Zeile); die Station misst so",
                        nicht: "keine Missernte, keine Not",
                        leser: "stamm/feld-dsl.js:926 dslEffects trägt keinen Welt-Akt Missernte; stamm/siedlung-bewohner.js:2140 furchtErinnert: der Bewohner erinnert nur Furcht vor Gewalt, kein Ereignis, keinen Umzug",
                        gruen: { werte: { umzugProzent: 14, tagGeaendertProzent: 14, umzugOhneProzent: 1, nennenAnteil: 0.86 }, zeuge: { betroffene: 40, befragt: 40, gegenUmzugProzent: 1 } },
                        attrappen: [{ name: "Umzug 14 % ohne Betroffene der Welt", roh: { werte: { umzugProzent: 14, tagGeaendertProzent: 14, umzugOhneProzent: 1, nennenAnteil: 0.86 }, zeuge: { betroffene: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(LEBEN, 3, "Bauten ↔ Familiengröße r ≥ 0,5", { key: "r" }), sollWort(LEBEN, 3, "verlassene Häuser verfallen", { key: "verfallProzent", rel: ">", zahl: 0, einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.haeuser >= 5)) return "nur " + (z.haeuser || 0) + " Häuser mit Familie";
                            if (!(z.famStreuung > 0)) return "alle Familien gleich groß (keine Ursache)";
                            if (z.sprung !== true) return "der Sprung 20 J fehlt (kein Plan 20 Jahre später)";
                            if (!(z.anbau >= 1)) return "in 20 Jahren baut keine Familie an (" + (z.anbau || 0) + " Häuser wuchsen) — das Haus folgt der Familie nicht";
                            if (!(z.leer >= 1)) return "kein verlassenes Haus im Dorf, an dem Verfall zu sehen wäre";
                            if (z.gegenGleich !== true) return "der Gegenlauf fehlt: ohne Sprung (dasselbe Jahr zweimal) ist der Plan nicht gleich";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (die Familie folgt dem Haus — leuteVon —, nie das Haus der Familie)",
                        leser: "fachwerk-core.js:9527 leuteVon(hp): die Leute eines Hauses aus seinem Bau; kein Anbau aus der Familie, kein Verfall leerer Häuser (stamm/siedlung-satz.js:788 _werkAlter altert ohne Bewohner)",
                        gruen: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: { haeuser: 8, famStreuung: 3, sprung: true, gegenGleich: true, anbau: 3, leer: 2 } },
                        attrappen: [
                            { name: "r aus dem statischen Plan ohne Sprung (das Haus macht die Familie)", roh: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: { haeuser: 8, famStreuung: 3, sprung: true, gegenGleich: true, anbau: 0, leer: 2 } } },
                            { name: "ohne Häuser der Welt", roh: { werte: { r: 0.62, verfallProzent: 40 }, zeuge: {} } },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(LEBEN, 4, "Gedenken nach 50 J", { key: "gedenkenJahre", rel: "≥", zahl: 50, einheit: "J" }), sollWort(LEBEN, 4, "alle drei messbar", { key: "messbar", rel: "≥", zahl: 3 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.ereignis !== true) return "kein Ereignis (Vulkan, Seuche, Krieg) erreichte die Bewohner";
                            if (!(z.flucht > 0)) return "niemand floh";
                            if (typeof z.gegenDelle !== "number") return "der Gegenlauf ohne Ereignis fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (kein Ereignis, kein Gedenken, keine Kohorte)",
                        nicht: "kein Ereignis über Generationen",
                        leser: "stamm/siedlung-bewohner.js:2140 furchtErinnert: die Flucht folgt nur der Furcht vor Gewalt am Ort; keine Geburt, kein Tod, kein Gedenken über Jahre",
                        gruen: { werte: { gedenkenJahre: 60, messbar: 3 }, zeuge: { ereignis: true, flucht: 12, gegenDelle: 0 } },
                        attrappen: [{ name: "drei Messungen ohne Ereignis", roh: { werte: { gedenkenJahre: 60, messbar: 3 }, zeuge: { ereignis: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(LEBEN, 5, "Wendepunkte auf benennbare Personen ≥ 0,8", { key: "personenAnteil" }), K.soll(LEBEN, 5, "verschiebt sich in ≥ 70 %", { key: "gegenProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.wendepunkte >= 1)) return "kein Wendepunkt der Geschichte in der Welt";
                            if (!(z.personen >= 1)) return "keine benennbare Person";
                            if (z.gegen !== true) return "der Gegenlauf (Person entfernt) fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Geschichte aus Personen)",
                        nicht: "keine Geschichte aus Leben",
                        leser: "stamm/siedlung-bewohner.js:377 _bewohnerGenome gibt Leib und Farbe, keinen Namen, keinen Lebenslauf; kein Leser einer Geschichte",
                        gruen: { werte: { personenAnteil: 0.85, gegenProzent: 75 }, zeuge: { wendepunkte: 20, personen: 17, gegen: true } },
                        attrappen: [{ name: "Wendepunkte aus einem Text", roh: { werte: { personenAnteil: 0.85, gegenProzent: 75 }, zeuge: { wendepunkte: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LEBEN, 6, "andere Personen → andere Wendepunkte ≥ 70 %", { key: "andereProzent", einheit: "%" }), K.soll(LEBEN, 6, "dieselben Personen → dieselben Wendepunkte ≥ 95 %", { key: "dieselbenProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.wendepunkte >= 1)) return "kein Wendepunkt in der Welt";
                            if (!(z.personen >= 1)) return "keine Person";
                            if (z.gegen !== true) return "der Gegenlauf (dieselben Personen) fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-bewohner.js (keine Wendepunkte)",
                        nicht: "keine Wendepunkte",
                        leser: "stamm/siedlung-bewohner.js:377 _bewohnerGenome trägt keinen Lebenslauf je Bewohner, kein Planetenwechsel mit Personen",
                        gruen: { werte: { andereProzent: 80, dieselbenProzent: 98 }, zeuge: { wendepunkte: 30, personen: 20, gegen: true } },
                        attrappen: [{ name: "Prozente ohne Wendepunkt", roh: { werte: { andereProzent: 80, dieselbenProzent: 98 }, zeuge: { wendepunkte: 0 } } }],
                    },
                },
            },

            // ════════ mensch.kopplung.kultur — Kultur folgt der Welt ════════
            // 32 Zellen der Welt: ihr Plan (der Baustoff der Häuser: `ov.stil` stein · klinker → Stein, huette → Holz, alt → Fachwerk/Lehm;
            // das Dach `ov.pitchDeg`) gegen den Boden der Zelle (Fels, Wald, Bodenklasse) und das Klima des Planeten am Anker (planet-ort);
            // die Mutation: Regen über `__wetterSetzen` und Schwerkraft 2 g über den Welt-Akt — der Plan derselben Zelle vor ↔ nach;
            // der Tag der Bewohner über 24 Stunden (ein Fest?), die Rollen der Pläne (heiliger Ort). 1 000 Orte zählt die Probe an den Zellen.
            [KULTUR]: {
                sek: 20,
                mutiert: true,
                pfad: PFAD_DORF.concat(["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/gelaende-boden.js", "stamm/vegetation-wiese.js", "stamm/kreatur-leben.js"]),
                ungefahren: "die Hausbilder der 32 Zellen (S1), die 1 000 Ortsbilder (S6) und die 20 Stadtbilder unter 2 g (S7) schießt nur das Gerät",
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const kultur = async (r, a) => {
                        const st = r.state, alt = { w: st.weather, g: st.gravity, halt: st.weatherEffectTime };
                        const pearson = (x, y) => { const m = x.length; if (m < 3) return null; const mx = x.reduce((s, v) => s + v, 0) / m, my = y.reduce((s, v) => s + v, 0) / m; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < m; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null; };
                        const STOFF = { stein: "stein", klinker: "stein", huette: "holz", alt: "lehm", glas: "glas", modern: "glas" };
                        const stoffVon = (P) => { const k = {}; for (const s of P.slots) { const w = STOFF[(s.ov && s.ov.stil) || ""] || "lehm"; k[w] = (k[w] || 0) + 1; } return Object.keys(k).sort((p, q) => k[q] - k[p])[0]; };
                        const hash = (P) => { const t = JSON.stringify(P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.ov && x.ov.stil])); let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; };
                        const zellen = [];
                        for (let R = 0; R <= 26 && zellen.length < 1000; R++) for (let cx = -R; cx <= R; cx++) for (let cz = -R; cz <= R; cz++) { if (Math.max(Math.abs(cx), Math.abs(cz)) !== R) continue; const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push(c); }
                        const aus = { orte: zellen.length };
                        const Z = zellen.slice(0, 32), plaene = [];
                        for (const c of Z) plaene.push(await r._foundryRequestSettlement({ seed: c.seed, nH: c.nH }));
                        let passend = 0, n1 = 0;
                        const dach = [], heilig = [], stoffe = {};
                        Z.forEach((c, i) => {
                            const P = plaene[i];
                            if (!P) return;
                            n1++;
                            const fels = r._rockExposureAt(c.x, c.z), wald = r._forestStandDensity(c.x, c.z);
                            const soll = fels >= 0.3 ? "stein" : wald >= 0.5 ? "holz" : "lehm";
                            const ist = stoffVon(P);
                            stoffe[ist] = (stoffe[ist] || 0) + 1;
                            if (ist === soll) passend++;
                            dach.push(P.slots.reduce((s, x) => s + ((x.ov && x.ov.pitchDeg) || 0), 0) / P.slots.length);
                            heilig.push(P.slots.some((x) => /kirche|kapelle|tempel|schrein|kloster/i.test(String(x.rolle || ""))) ? 1 : 0);
                        });
                        aus.s1 = { saaten: n1, passend, stoffe };
                        await r._fadenQuelle();
                        const An = await r._planetAnker();
                        const O = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: (An.breite * 180) / Math.PI, laenge: (An.laenge * 180) / Math.PI, zeitMa: 0 });
                        const nied = O && O.delta && O.delta.wetter ? O.delta.wetter.regenQuote : null;
                        const vor = Z.map((c, i) => (plaene[i] ? hash(plaene[i]) : null));
                        let regenAnders = 0, gAnders = 0, nR = 0, gleich2 = 0;
                        for (let i = 0; i < Z.length; i++) { const P = await r._foundryRequestSettlement({ seed: Z[i].seed, nH: Z[i].nH }); if (P && vor[i] != null && hash(P) === vor[i]) gleich2++; }
                        try {
                            window.__wetterSetzen("rainy");
                            for (let i = 0; i < Z.length; i++) { const P = await r._foundryRequestSettlement({ seed: Z[i].seed, nH: Z[i].nH }); if (!P || vor[i] == null) continue; nR++; if (hash(P) !== vor[i]) regenAnders++; }
                        } finally { window.__wetterSetzen(alt.w); }
                        try {
                            st.weatherEffectTime = 0;
                            try { r.dslRun(["gravity", alt.g * 2], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; }
                            aus.g2 = st.gravity / alt.g;
                            for (let i = 0; i < 20; i++) { const P = await r._foundryRequestSettlement({ seed: Z[i].seed, nH: Z[i].nH }); if (P && vor[i] != null && hash(P) !== vor[i]) gAnders++; }
                        } finally {
                            if (st.gravity !== alt.g) { st.weatherEffectTime = 0; try { r.dslRun(["gravity", alt.g], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; } }
                            if (st.gravity !== alt.g) st.gravity = alt.g;
                        }
                        aus.s2 = { orte: dach.length, dachStreuung: Math.max(...dach) - Math.min(...dach), niederschlag: nied, niederschlagStreuung: 0, rDach: null, nRegen: nR, regenAnders, gleich2 };
                        aus.s7 = { stadtplaene: 20, gAnders, g2: aus.g2 };
                        aus.s4 = { heilig: heilig.reduce((s, v) => s + v, 0), orte: heilig.length };
                        const D = window.__kmDorf && r._bewohnerSiedlungen.get(window.__kmDorf);
                        let feste = 0, akte = new Set();
                        if (D && D.liste) for (let h = 0; h < 24; h += 0.5) for (const b of D.liste) { const z = r._bewohnerSoll(b, h); akte.add(String(z.akt)); if (/fest|feier|markttag|kirchweih|ernte/i.test(String(z.akt))) feste++; }
                        aus.s3 = { feste, akte: [...akte].join("+"), dorf: !!(D && D.liste) };
                        return aus;
                    };
                    const m = await S(kultur, {});
                    if (!m || m.fehler) throw new Error("die Kultur: " + (m && m.fehler));
                    const aus = {};
                    const s1 = m.s1;
                    aus[1] = { werte: { saaten: s1.saaten, passendProzent: (100 * s1.passend) / Math.max(1, s1.saaten) }, zeuge: { saaten: s1.saaten, stoffe: JSON.stringify(s1.stoffe) }, auge: await M.auge("mensch-kultur-s1", { ort: "genesis" }, {}), nicht: "der Baustoff folgt nicht dem Boden: der Plan liest nur seinen Samen (fachwerk-core.js:4410 region aus rnd()), " + s1.passend + " von " + s1.saaten + " Zellen treffen den Stoff ihres Bodens wie der Zufall" };
                    const s2 = m.s2;
                    aus[2] = { werte: { mutationProzent: (100 * s2.regenAnders) / Math.max(1, s2.nRegen), dachStreuungGrad: s2.dachStreuung, niederschlagAnker: s2.niederschlag }, zeuge: { orte: s2.orte, niederschlagStreuung: s2.niederschlagStreuung, mutationen: s2.nRegen, gegenGleich: s2.gleich2 }, nicht: "kein Niederschlag am Ort einer Siedlung: die Welt trägt EIN Klima am Anker (Regen-Quote " + s2.niederschlag + "), der Plan liest keins — " + s2.regenAnders + " von " + s2.nRegen + " Plänen ändern sich unter Regen; Dach-Neigung streut " + s2.dachStreuung.toFixed(1) + "° aus dem Samen" };
                    const s3 = m.s3;
                    aus[3] = { werte: { feste: s3.feste }, zeuge: { feste: s3.feste, ereignisse: 0 }, nicht: "kein Fest und kein Kalender: der Tag kennt " + s3.akte + " (koerper-core.js:5326 tagesPlan), kein Ereignis der Saat am Himmel oder in der Ernte" };
                    const s4 = m.s4;
                    aus[4] = { werte: { heiligeOrte: s4.heilig, orte: s4.orte }, zeuge: { verschoben: false, orte: s4.orte }, nicht: "kein Gebirge verschiebbar und keine Sprachgrenze am Gelände: " + s4.heilig + " von " + s4.orte + " Zellen tragen einen heiligen Bau aus der Tafel ihres Samens, nie aus dem Gelände" };
                    aus[5] = { werte: { heiligeOrte: s4.heilig }, zeuge: { eingriff: false }, nicht: "keine Kaskade Vulkan → Kultur: der Plan liest kein Gelände und keinen Ausbruch (fachwerk-core.js:4403 DORF), kein Mythos, keine Sprachgrenze" };
                    aus[6] = { werte: { orte: m.orte }, zeuge: { orte: m.orte }, auge: await M.auge("mensch-kultur-s6", { ort: "genesis" }, {}), nicht: m.orte < 1000 ? "nur " + m.orte + " Siedlungs-Zellen im Umkreis von 26 Zellen (Soll 1 000 Orte)" : undefined };
                    const s7 = m.s7;
                    aus[7] = { werte: { gekoppeltProzent: (100 * s7.gAnders) / s7.stadtplaene, gFaktor: s7.g2 }, zeuge: { stadtplaene: s7.stadtplaene }, auge: await M.auge("mensch-kultur-s7", { ort: "genesis" }, {}), nicht: "die Kultur liest die Schwerkraft nicht: unter " + s7.g2 + " g ändern sich " + s7.gAnders + " von 20 Plänen (stamm/feld-dsl.js:961 gravity nur für _stepCharacter)" };
                    for (const k of Object.keys(aus)) if (aus[k].nicht === undefined) delete aus[k].nicht;
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(KULTUR, 1, "32 Saaten", { key: "saaten", rel: "≥", zahl: 32 }), K.soll(KULTUR, 1, "passender Baustoff ≥ 85 %", { key: "passendProzent", einheit: "%" }), K.soll(KULTUR, 1, "Region aus Hausbild ≥ 70 %", { key: "regionBildProzent", einheit: "%" })],
                        auge: { pose: "Third vor dem Haus der Zelle (32 Zellen; headless: Genesis)", vorbild: "Prüfer-Satz (R11): die Region aus dem Hausbild ≥ 70 % gegen Hausbilder realer Regionen" },
                        taeter: "fachwerk-core.js DORF (die Region aus rnd(), kein Boden)",
                        nicht: "der Baustoff liest keinen Boden",
                        leser: "fachwerk-core.js:4410 region = rnd() des Samens; kein Leser von Fels (_rockExposureAt), Wald und Lehm der Zelle",
                        gruen: { werte: { saaten: 32, passendProzent: 88, regionBildProzent: 74 }, zeuge: { saaten: 32 } },
                        attrappen: [{ name: "88 % ohne Zellen", roh: { werte: { saaten: 32, passendProzent: 88, regionBildProzent: 74 }, zeuge: {} } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(KULTUR, 2, "Dach ↔ Niederschlag r ≥ 0,5", { key: "r" }), K.soll(KULTUR, 2, "Mutation ≥ 90 %", { key: "mutationProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 32)) return "nur " + (z.orte || 0) + " Orte";
                            if (!(z.niederschlagStreuung > 0)) return "der Niederschlag streut nicht über die Orte (EIN Klima — r ohne Ursache)";
                            if (!(z.mutationen >= 32)) return "keine Mutation des Klimas gemessen";
                            if (!(z.gegenGleich >= 32)) return "der Gegenlauf fehlt: ohne Mutation ist der Plan nicht zweimal gleich (" + z.gegenGleich + " von 32)";
                            return null;
                        },
                        taeter: "fachwerk-core.js bauRezept (kein Klima am Dach)",
                        nicht: "kein Klima am Dach",
                        leser: "fachwerk-core.js:4382 bauRezept({nutzung, rahmen:{region, band}}) liest kein Klima; Jahr und Klima fielen mit dem Labor-Meta-Gesetz (worlds/fachwerk/fachwerk.js:807 Klima)",
                        gruen: { werte: { r: 0.58, mutationProzent: 94 }, zeuge: { orte: 32, niederschlagStreuung: 900, mutationen: 32, gegenGleich: 32 } },
                        attrappen: [{ name: "r 0,58 über EIN Klima", roh: { werte: { r: 0.58, mutationProzent: 94 }, zeuge: { orte: 32, niederschlagStreuung: 0, mutationen: 32 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(KULTUR, 3, "≥ 80 % der Feste auf einem Ereignis der Saat", { key: "festeProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.feste >= 1)) return "kein Fest im Tag der Bewohner";
                            if (!(z.ereignisse >= 1)) return "kein Ereignis der Saat (Himmel, Ernte) gezählt";
                            if (z.gegen !== true) return "der Gegenlauf fehlt: das Ereignis genommen, und das Fest bleibt";
                            return null;
                        },
                        taeter: "koerper-core.js tagesPlan (kein Fest, kein Kalender)",
                        nicht: "kein Fest",
                        leser: "koerper-core.js:5326 tagesPlan kennt kein Fest; kein Kalender aus Himmel (stamm/bild-himmel.js:673 mond steht nur im Bild des Himmels) und Ernte",
                        gruen: { werte: { festeProzent: 85 }, zeuge: { feste: 6, ereignisse: 5, gegen: true } },
                        attrappen: [{ name: "85 % ohne Fest", roh: { werte: { festeProzent: 85 }, zeuge: { feste: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [sollWort(KULTUR, 4, "Gebirge verschoben → Grenze folgt", { key: "grenzeFolgt", rel: ">", zahl: 0 }), K.soll(KULTUR, 4, "Mutante = 0", { key: "mutante" }), K.soll(KULTUR, 4, "angepasst ≥ 80 %", { key: "angepasstProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.verschoben !== true) return "kein Gebirge verschoben";
                            if (!(z.orte >= 32)) return "zu wenige Orte";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (kein Gelände, keine Sprachgrenze)",
                        nicht: "keine Grenze aus dem Gelände",
                        leser: "fachwerk-core.js:4403 DORF(DP) liest kein Gelände; keine Sprachgrenze und keine Gefahren-Bauweise (Bebenzone, Vulkanhang)",
                        gruen: { werte: { grenzeFolgt: 1, mutante: 0, angepasstProzent: 84 }, zeuge: { verschoben: true, orte: 40 } },
                        attrappen: [{ name: "Grenze folgt ohne verschobenes Gebirge", roh: { werte: { grenzeFolgt: 1, mutante: 0, angepasstProzent: 84 }, zeuge: { verschoben: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [sollWort(KULTUR, 5, "heiliger Ort, Baustoff, Sprachgrenze, Mythos alle ≠", { key: "andersZahl", rel: "≥", zahl: 4 }), K.soll(KULTUR, 5, "Mutante 0", { key: "mutante" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.eingriff !== true) return "kein Vulkan-Eingriff an der Welt";
                            if (typeof z.gegenAnders !== "number") return "der Gegenlauf ohne Eingriff fehlt";
                            return null;
                        },
                        taeter: "fachwerk-core.js DORF (keine Kaskade Geologie → Kultur)",
                        nicht: "keine Kaskade Vulkan → Kultur",
                        leser: "fachwerk-core.js:4403 DORF liest keinen Ausbruch und kein Gelände; kein Mythos, keine Sprache am Ort",
                        gruen: { werte: { andersZahl: 4, mutante: 0 }, zeuge: { eingriff: true, gegenAnders: 0 } },
                        attrappen: [{ name: "vier ≠ ohne Eingriff", roh: { werte: { andersZahl: 4, mutante: 0 }, zeuge: { eingriff: false } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KULTUR, 6, "1 000 Orte", { key: "orte", rel: "≥", zahl: 1000 }), K.soll(KULTUR, 6, "Klima, Gestein, Epoche aus dem Bild ≥ 70 %", { key: "bildProzent", einheit: "%" })],
                        auge: { pose: "Ego vor dem Ort (1 000 Orte; headless: Genesis)", vorbild: "Prüfer-Satz (R11): Klima, Gestein und Epoche aus dem Bild ≥ 70 % gegen die Wahrheit der Welt" },
                        taeter: "fachwerk-core.js DORF (der Bau deutet den Ort nicht)",
                        leser: "fachwerk-core.js:4403 DORF liest kein Klima und kein Gestein; nur die Epoche steht im Bau",
                        gruen: { werte: { orte: 1000, bildProzent: 72 }, zeuge: { orte: 1000 } },
                        attrappen: [{ name: "1 000 Orte ohne Bild", roh: { werte: { orte: 1000, bildProzent: 72 }, zeuge: {} } }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(KULTUR, 7, "Schwerkraft aus 20 Stadtbildern ≥ 70 %", { key: "schwerkraftBildProzent", einheit: "%" }), K.soll(KULTUR, 7, "gekoppelt ≥ 85 %", { key: "gekoppeltProzent", einheit: "%" })],
                        auge: { pose: "Third über 20 Städten unter 2 g (Welt-Akt gravity; headless: Genesis)", vorbild: "Fremdwelt-Probe (R10): ein eingefrorener Leser sagt die Schwerkraft aus dem Stadtbild voraus ≥ 70 %" },
                        taeter: "fachwerk-core.js DORF (keine Schwerkraft am Bau)",
                        nicht: "die Kultur liest keine Schwerkraft",
                        leser: "stamm/feld-dsl.js:961 gravity schreibt nur state.gravity; fachwerk-core.js:4403 DORF liest sie nicht",
                        gruen: { werte: { schwerkraftBildProzent: 75, gekoppeltProzent: 90 }, zeuge: { stadtplaene: 20 } },
                        attrappen: [{ name: "gekoppelt ohne Plan", roh: { werte: { schwerkraftBildProzent: 75, gekoppeltProzent: 90 }, zeuge: {} } }],
                    },
                },
            },

            // ════════ mensch.kopplung.kreislauf — Die Stadt trägt sich ════════
            // 20 Bewohner des Dorfs: ihre Orte (heim · werk · mahl, die Bindung des Wirts) und ob ihr Mahl eine Herkunft trägt; der Plan:
            // Felder (Fläche), Brunnen, Stände, Laternen; die größte Stadt, die das Gesetz trägt (fachwerk STADT_FUNKTION).
            [KREIS]: {
                sek: 8,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const kreis = async (r, a) => {
                        const D = window.__kmDorf && r._bewohnerSiedlungen.get(window.__kmDorf);
                        const pm = r.state.playerMesh.position;
                        const Dn = D && D.liste ? D : [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.liste && q.lebt && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230)[0];
                        if (!Dn) return { fehler: "kein lebendes Dorf ≤ 230 m (die Leiter leib gründet es)" };
                        const L20 = Dn.liste.slice(0, 20), P = Dn.plan;
                        const HERK = /herkunft|vorrat|ware|bissen|mahlzeit|nahrung|essen/i;
                        let heim = 0, werk = 0, mahl = 0, herkunft = 0, wasser = 0;
                        for (const b of L20) {
                            const o = b.orte || {};
                            if (o.heim) heim++;
                            if (o.werk && o.werk !== o.heim) werk++;
                            if (o.mahl) mahl++;
                            if (Object.keys(b).some((k) => HERK.test(k))) herkunft++;
                            if ((P.brunnen || []).length) wasser++;
                        }
                        const feldM2 = (P.felder || []).reduce((s, f) => s + 4 * (f.ex || 0) * (f.ez || 0), 0);
                        const stadtM2 = P.slots.reduce((s, x) => s + ((x.ov && x.ov.W) || 0) * ((x.ov && x.ov.D) || 0), 0);
                        const SF = AnazhRealm.Gesetz("fachwerk:STADT_FUNKTION");
                        return { personen: L20.length, n: Dn.liste.length, heim, werk, mahl, herkunft, wasser, felder: (P.felder || []).length, feldM2, stadtM2, brunnen: (P.brunnen || []).length, staende: (P.staende || []).length, laternen: (P.laternen || []).length, stadtVoll: SF ? SF.voll : null };
                    };
                    const m = await S(kreis, {});
                    if (!m || m.fehler) throw new Error("der Kreislauf: " + (m && m.fehler));
                    const P = (x) => (100 * x) / Math.max(1, m.personen);
                    const ware = "keine Ware mit Herkunft: das Mahl ist ein Ort der Bindung (koerper-core.js:5269 tagesBindung), nie ein Bissen aus der Flur — " + m.herkunft + " von " + m.personen + " tragen eine Herkunft";
                    const aus = {};
                    aus[1] = { werte: { personen: m.personen, mahlFeldProzent: P(m.herkunft), wohnungProzent: P(m.heim), werkProzent: P(m.werk), wasserProzent: P(m.wasser) }, zeuge: { personen: m.personen, felder: m.felder, gegen: false }, nicht: ware + "; " + m.brunnen + " Brunnen im Plan" };
                    aus[2] = { werte: { staende: m.staende, gueter: 0 }, zeuge: { gueter: 0 }, nicht: "kein Gut mit Bilanz: " + m.staende + " Stände ohne Ware, kein Brennholz, kein Werkzeug im Fluss" };
                    aus[3] = { werte: { laternen: m.laternen, leitungen: 0 }, zeuge: { stoffe: 0 }, nicht: "kein Stoff im Fluss: keine Leitung, kein Abwasser, kein Müll; " + m.laternen + " Laternen ohne Energie" };
                    aus[4] = { werte: { hinterlandM2: m.feldM2, stadtM2: m.stadtM2, verhaeltnis: m.stadtM2 ? m.feldM2 / m.stadtM2 : undefined }, zeuge: { bedarf: 0 }, nicht: "kein Bedarf je Person: Hinterland " + Math.round(m.feldM2) + " m² Feld gegen " + Math.round(m.stadtM2) + " m² Grund, ohne Strom und Handel" };
                    aus[5] = { werte: { personenDorf: m.n, versorgtAnteil: 0, stadtVoll: m.stadtVoll }, zeuge: { personen: m.n }, nicht: "10⁸ in EINER Stadt nicht erzeugbar (das Dorf der Probe trägt " + m.n + ", die Stadt des Fachwerks klemmt ihre Häuser) und keine Person ist versorgt (keine Nahrung, keine Energie)" };
                    aus[6] = { werte: { mangelModell: 0 }, zeuge: { saaten: 0 }, nicht: "kein Mangel und keine Ursache: die Welt kennt keine Versorgung über 100 J" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [K.soll(KREIS, 1, "20 Personen", { key: "personen", rel: "≥", zahl: 20 }), K.soll(KREIS, 1, "Mahl bis Feld ≥ 90 %", { key: "mahlFeldProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.personen >= 20)) return "nur " + (z.personen || 0) + " Personen";
                            if (!(z.felder >= 1)) return "kein Feld im Plan";
                            if (z.gegen !== true) return "der Gegenlauf fehlt: das Feld genommen, und das Mahl bleibt";
                            return null;
                        },
                        taeter: "koerper-core.js tagesBindung (das Mahl ist ein Ort, keine Ware)",
                        nicht: "keine Ware mit Herkunft",
                        leser: "koerper-core.js:5269 tagesBindung bindet mahl an einen Ort; kein Bissen, kein Vorrat, keine Herkunft bis zum Feld des Plans",
                        gruen: { werte: { personen: 20, mahlFeldProzent: 95 }, zeuge: { personen: 20, felder: 4, gegen: true } },
                        attrappen: [{ name: "95 % ohne Feld und Gegenlauf", roh: { werte: { personen: 20, mahlFeldProzent: 95 }, zeuge: { personen: 20, felder: 0 } } }],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(KREIS, 2, "Bilanz je Gut ± 10 %", { key: "bilanzAbwProzent", rel: "≤", zahl: 10, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).gueter >= 3) ? "kein Gut (Markt, Brennholz, Werkzeug) mit Bilanz in der Welt" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: die Quelle eines Guts gekappt, und die Bilanz bleibt" : null),
                        taeter: "fachwerk-core.js DORF (Stände ohne Ware)",
                        nicht: "kein Gut",
                        leser: "koerper-core.js:5201 markt (TAGES_GESETZ) bietet Arbeit, Mahl und Morgengang, keine Ware mit Menge",
                        gruen: { werte: { bilanzAbwProzent: 6 }, zeuge: { gueter: 3, gegen: true } },
                        attrappen: [{ name: "Bilanz 6 % ohne Gut", roh: { werte: { bilanzAbwProzent: 6 }, zeuge: { gueter: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(KREIS, 3, "Bilanz je Stoff ± 5 %", { key: "bilanzAbwProzent", rel: "≤", zahl: 5, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).stoffe >= 3) ? "kein Stoff (Leitung, Abwasser, Müll) im Fluss der Welt" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: die Leitung gekappt, und die Bilanz bleibt" : null),
                        taeter: "fachwerk-core.js DORF (keine Leitung, kein Abwasser)",
                        nicht: "kein Stoff im Fluss",
                        leser: "fachwerk-core.js:4403 DORF legt Brunnen und Laternen als Bauten, ohne Fluss von Wasser, Abwasser, Müll",
                        gruen: { werte: { bilanzAbwProzent: 3 }, zeuge: { stoffe: 3, gegen: true } },
                        attrappen: [{ name: "Bilanz 3 % ohne Stoff", roh: { werte: { bilanzAbwProzent: 3 }, zeuge: { stoffe: 0 } } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(KREIS, 4, "Hinterland ≥ Stadtfläche × Bedarf ± 30 %", { key: "hinterlandAbwProzent", rel: "≤", zahl: 30, einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).bedarf > 0) ? "kein Bedarf je Person in der Welt — das Hinterland deckt nichts" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: das Hinterland genommen, und die Stadt bleibt versorgt" : null),
                        taeter: "fachwerk-core.js DORF (Felder ohne Bedarf)",
                        unklar: "„Hinterland ≥ Stadtfläche × Bedarf ± 30 %“ mischt ≥ und ± — Vorschlag: Hinterland ÷ (Stadtfläche × Bedarf) ≥ 0,7; die Station misst die Unterdeckung ≤ 30 %",
                        nicht: "kein Bedarf",
                        leser: "fachwerk-core.js:4403 DORF: die Felder des Plans haben eine Fläche, keinen Ertrag und keinen Bedarf; kein Strom, kein Handel",
                        gruen: { werte: { hinterlandAbwProzent: 18 }, zeuge: { bedarf: 2.1, gegen: true } },
                        attrappen: [{ name: "18 % ohne Bedarf", roh: { werte: { hinterlandAbwProzent: 18 }, zeuge: { bedarf: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(KREIS, 5, "1 000 Personen ≥ 0,99", { key: "versorgtAnteil" }), K.soll(KREIS, 5, "100 Bissen bis Feld ≥ 90 %", { key: "bissenProzent", einheit: "%" })],
                        zeuge: (roh) => (!((roh.zeuge || {}).personen >= 1000) ? "nur " + ((roh.zeuge || {}).personen || 0) + " Personen in der Stadt (Soll 1 000 je Stichprobe)" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: das Feld genommen, und der Bissen bleibt" : null),
                        taeter: "fachwerk-core.js STADT_FUNKTION / koerper-core.js tagesBindung (keine Versorgung)",
                        nicht: "10⁸ in einer Stadt nicht erzeugbar",
                        leser: "stamm/siedlung-ort.js:1136 spawnSettlement klemmt die Stadt an fachwerk STADT_FUNKTION (Kachel-Netz), keine Versorgung je Person",
                        gruen: { werte: { versorgtAnteil: 0.995, bissenProzent: 93 }, zeuge: { personen: 1000, gegen: true } },
                        attrappen: [{ name: "0,995 ohne Personen", roh: { werte: { versorgtAnteil: 0.995, bissenProzent: 93 }, zeuge: { personen: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KREIS, 6, "16 Saaten × 100 J", { key: "saaten", rel: "≥", zahl: 16 }), K.soll(KREIS, 6, "16 Saaten × 100 J", { key: "jahre", rel: "≥", zahl: 100, einheit: "J" }), sollWort(KREIS, 6, "kein Mangel ohne sichtbare Ursache", { key: "mangelOhneUrsache", rel: "=", zahl: 0 })],
                        zeuge: (roh) => (!((roh.zeuge || {}).saaten >= 16) ? "keine Saat lief 100 J mit Versorgung" : (roh.zeuge || {}).gegen !== true ? "der Gegenlauf fehlt: eine Ursache gesetzt (Missernte), und kein Mangel folgt" : null),
                        taeter: "die Welt (kein Kreislauf der Versorgung)",
                        nicht: "kein Mangel-Modell",
                        leser: "koerper-core.js:5269 tagesBindung ohne Nahrung; kein Sprung über 100 J mit Bilanz",
                        gruen: { werte: { saaten: 16, jahre: 100, mangelOhneUrsache: 0 }, zeuge: { saaten: 16, gegen: true } },
                        attrappen: [{ name: "kein Mangel, weil nichts gezählt", roh: { werte: { saaten: 16, jahre: 100, mangelOhneUrsache: 0 }, zeuge: { saaten: 0 } } }],
                    },
                },
            },

            // ════════ mensch.kopplung.antwort — Die Welt antwortet auf Eingriff (S1 trägt g5.js K4_PROBE) ════════
            // Die Zellen der Welt (`_autoSettlementCellInfo`) als Siedlungsnetz: Dichte im 200-m-Gürtel einer Linie durch den Spieler gegen
            // die Kontrolle (S2), die Netz-Kennzahlen des Dorfs der Probe zweimal (S3), der Rang (nH) von 64 Zellen mit ↔ ohne Eingriff (S4),
            // 64 Pläne im Jahr X+300 (Epoche über fachwerk epocheImJahr, wie der Satz „dorf … jahr“) mit Eingriff (Schwerkraft 2 g, der
            // Welt-Akt) gegen ohne Eingriff zweimal (S5), 100 Taten (Schwerkraft g_k) und ihre Folge in den Perspektiven Leib (Genom),
            // Bau (Plan), Markt (Stände), Tag (Soll draußen) mit dem Gegenlauf ohne Tat (S6).
            [ANTWORT]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD_DORF,
                mess: async function (H, U, M) {
                    const S = (fn, a) => H.seite("return await (" + String(fn) + ")(r, " + JSON.stringify(a || {}) + ");");
                    const antwort = async (r, a) => {
                        const st = r.state, A = AnazhRealm, alt = { g: st.gravity, halt: st.weatherEffectTime };
                        const pm = st.playerMesh.position;
                        const hash = (P) => { if (!P) return null; const t = JSON.stringify([P.region, P.jahr, P.kleidung, P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.rolle])]); let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; };
                        const schwer = (g) => { st.weatherEffectTime = 0; try { r.dslRun(["gravity", g], { source: "human" }); } finally { st.weatherEffectTime = alt.halt; } return st.gravity; };
                        const zellen = [];
                        for (let cx = -9; cx <= 9; cx++) for (let cz = -9; cz <= 9; cz++) { const c = r._autoSettlementCellInfo(cx, cz); if (c) zellen.push({ cx, cz, seed: c.seed, nH: c.nH, x: c.x, z: c.z }); }
                        const SG = A._siedlungGesetz();
                        const cellM = (SG && SG.cellM) || 512;
                        const ring = 9 * cellM;
                        const inG = zellen.filter((c) => Math.abs(c.z - pm.z) <= 200).length, ausG = zellen.length - inG;
                        const flG = 2 * ring * 400, flA = 4 * ring * ring - flG;
                        const aus = { zellen: zellen.length, s2: { dichteFaktor: ausG ? inG / flG / (ausG / flA) : null, inG, ausG } };
                        const D = window.__kmDorf && r._bewohnerSiedlungen.get(window.__kmDorf);
                        const nHD = D ? ((st.worldMeta.settlementCells || {})[window.__kmDorf] || {}).nH || D.plan.slots.length : 0;
                        const netz = (P) => (P ? { wege: (P.roads || []).length, knoten: P.graph && P.graph.nodes ? P.graph.nodes.length : null, kanten: P.graph && P.graph.edges ? P.graph.edges.length : null, felder: (P.felder || []).length } : null);
                        if (D) { const p1 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }); const p2 = await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }); aus.s3 = { a: netz(p1), b: netz(p2), gleich: hash(p1) === hash(p2) }; }
                        const Z = zellen.slice().sort((p, q) => Math.hypot(p.x - pm.x, p.z - pm.z) - Math.hypot(q.x - pm.x, q.z - pm.z)).slice(0, 64);
                        const rang = () => Z.map((c) => { const i = r._autoSettlementCellInfo(c.cx, c.cz); return i ? i.nH : 0; });
                        const E = A.Gesetz("fachwerk:epocheImJahr");
                        const basis = [];
                        for (const c of Z) basis.push(await r._foundryRequestSettlement({ seed: c.seed, nH: c.nH }));
                        const plus = async () => { const o = []; for (let i = 0; i < Z.length; i++) { const P0 = basis[i]; o.push(P0 ? hash(await r._foundryRequestSettlement({ seed: Z[i].seed, nH: Z[i].nH, epoche: E(P0.jahr + 300) })) : null); } return o; };
                        const rang0 = rang(), ohne1 = await plus(), ohne2 = await plus();
                        let mit = null, rangMit = null, g2 = null;
                        try { g2 = schwer(alt.g * 2) / alt.g; rangMit = rang(); mit = await plus(); }
                        finally { if (st.gravity !== alt.g) schwer(alt.g); if (st.gravity !== alt.g) st.gravity = alt.g; }
                        const paare = ohne1.filter((h, i) => h != null && mit && mit[i] != null).length;
                        aus.s4 = { orte: Z.length, rangVerschiebung: rang0.filter((v, i) => rangMit && v !== rangMit[i]).length, g2 };
                        aus.s5 = { orte: Z.length, paare, anders: ohne1.filter((h, i) => h != null && mit && mit[i] != null && mit[i] !== h).length, ohneUngleich: ohne1.filter((h, i) => h !== ohne2[i]).length, hashe: new Set(ohne1).size, zeitAnders: ohne1.filter((h, i) => basis[i] && h !== hash(basis[i])).length, g2 };
                        const LS = D && D.liste ? D.liste.slice(0, 12) : [];
                        const blick = async () => { const P = D ? await r._foundryRequestSettlement({ seed: D.plan.seed, nH: nHD }) : null; return { leib: LS.map((b) => r._rollHumanoidGenome(b.seed).kh).join(","), bau: hash(P), markt: P ? (P.staende || []).length : null, tag: LS.filter((b) => !r._bewohnerSoll(b, 12).drinnen).length }; };
                        const K4 = ["leib", "bau", "markt", "tag"];
                        let taten = 0, mitFolge = 0, mutante = 0;
                        const vor = await blick();
                        try {
                            for (let k = 0; k < a.taten; k++) {
                                const g = -(1 + ((k * 7919) % 280) / 10);
                                schwer(g);
                                if (st.gravity !== g) continue;
                                taten++;
                                const nach = await blick();
                                if (K4.filter((p) => nach[p] !== vor[p]).length >= 3) mitFolge++;
                                schwer(alt.g);
                                const gegen = await blick();
                                mutante = Math.max(mutante, K4.filter((p) => gegen[p] !== vor[p]).length);
                            }
                        } finally { if (st.gravity !== alt.g) schwer(alt.g); if (st.gravity !== alt.g) st.gravity = alt.g; }
                        aus.s6 = { taten, mitFolge, mutante, perspektiven: K4.length, dorf: !!D };
                        aus.gZurueck = st.gravity === alt.g;
                        return aus;
                    };
                    const m = await S(antwort, { taten: 100 });
                    if (!m || m.fehler) throw new Error("die Antwort: " + (m && m.fehler));
                    const aus = {};
                    aus[2] = { werte: { dichteFaktor: m.s2.dichteFaktor, zellen: m.zellen }, zeuge: { trasse: false, zellen: m.zellen, kontrolle: m.s2.ausG }, nicht: "keine Trasse des Spielers: die DSL kennt keinen Weg-Akt, die Zellen der Welt lesen keine Erreichbarkeit — Dichte im Gürtel " + (m.s2.dichteFaktor == null ? "?" : m.s2.dichteFaktor.toFixed(2)) + "× der Kontrolle ohne Trasse" };
                    const s3 = m.s3 || {};
                    aus[3] = { werte: { gegenAenderung: s3.gleich === true ? 0 : s3.gleich === false ? 1 : undefined, wegeAlt: s3.a ? s3.a.wege : undefined }, zeuge: { abriss: false, neubau: 0, gegenGemessen: s3.gleich !== undefined }, nicht: "kein Neubau nach Zerstörung: der Ort wächst nur aus seinem Jahr (stamm/siedlung-ort.js:2915 _ortWaechst), kein Bodenwert und kein Wiederaufbau nach remove_architecture" };
                    aus[4] = { werte: { rangVerschiebung: m.s4.rangVerschiebung, orte: m.s4.orte, sprungJ: 0 }, zeuge: { orte: m.s4.orte, eingriff: m.s4.g2 === 2, kontrolle: true, sprung: false }, nicht: "kein Sprung 50 J am Siedlungsnetz und kein Leerstand: der Rang der Zelle liest kein Jahr und keinen Eingriff (stamm/siedlung-ort.js:1410 _autoSettlementCellInfo) — unter 2 g verschoben " + m.s4.rangVerschiebung + " von " + m.s4.orte };
                    aus[5] = { werte: { orteAnders: m.s5.anders, sprungJ: 300, ohneUngleich: m.s5.ohneUngleich, zeitAnders: m.s5.zeitAnders }, zeuge: { paare: m.s5.paare, hashe: m.s5.hashe, eingriff: m.s5.g2 === 2, gegenPaare: m.s5.orte - m.s5.ohneUngleich } };
                    aus[6] = { werte: { taten: m.s6.taten, folgeProzent: m.s6.taten ? (100 * m.s6.mitFolge) / m.s6.taten : undefined, mutante: m.s6.mutante }, zeuge: { taten: m.s6.taten, perspektiven: m.s6.perspektiven, dorf: m.s6.dorf, gegenGemessen: true } };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(ANTWORT, 2, "Dichte im 200-m-Gürtel ≥ 2× gegen Kontroll-Saat", { key: "dichteFaktor" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.trasse !== true) return "keine Trasse des Spielers gelegt";
                            if (!(z.zellen >= 20)) return "zu wenige Zellen";
                            if (!(z.kontrolle > 0)) return "keine Kontrolle";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _autoSettlementCellInfo (keine Erreichbarkeit)",
                        nicht: "keine Trasse des Spielers",
                        leser: "stamm/siedlung-ort.js:1410 _autoSettlementCellInfo(cx, cz) liest Same und Rang, keine Trasse und keine Erreichbarkeit; die DSL (stamm/feld-dsl.js:926 dslEffects) kennt keinen Weg-Akt",
                        gruen: { werte: { dichteFaktor: 2.4 }, zeuge: { trasse: true, zellen: 300, kontrolle: 250 } },
                        attrappen: [{ name: "2,4× ohne Trasse", roh: { werte: { dichteFaktor: 2.4 }, zeuge: { trasse: false, zellen: 300, kontrolle: 250 } } }],
                    },
                    3: {
                        u: {},
                        soll: [
                            sollWort(ANTWORT, 3, "Netz-Kennzahlen des Neubaus weichen vom alten Viertel ab", { key: "abweichung", rel: ">", zahl: 0 }),
                            K.soll(ANTWORT, 3, "liegen im Band realer Wiederaufbau-Pläne ≥ 70 %", { key: "bandProzent", einheit: "%" }),
                            sollWort(ANTWORT, 3, "Gegenlauf ohne Zerstörung: Viertel unverändert", { key: "gegenAenderung", rel: "=", zahl: 0 }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.abriss !== true) return "kein Viertel zerstört";
                            if (!(z.neubau >= 1)) return "kein Neubau";
                            if (z.gegenGemessen !== true) return "der Gegenlauf fehlt";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _ortWaechst (kein Wiederaufbau)",
                        nicht: "kein Wiederaufbau",
                        leser: "stamm/siedlung-ort.js:2915 _ortWaechst baut nur Häuser seines Jahrs nach; kein Neubau nach Zerstörung, kein Bodenwert",
                        gruen: { werte: { abweichung: 1, bandProzent: 76, gegenAenderung: 0 }, zeuge: { abriss: true, neubau: 6, gegenGemessen: true } },
                        attrappen: [{ name: "Abweichung ohne Abriss", roh: { werte: { abweichung: 1, bandProzent: 76, gegenAenderung: 0 }, zeuge: { abriss: false } } }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(ANTWORT, 4, "Sprung 50 J", { key: "sprungJ", rel: "≥", zahl: 50, einheit: "J" }), sollWort(ANTWORT, 4, "Rang-Verschiebung gegen Kontrolle", { key: "rangVerschiebung", rel: ">", zahl: 0 }), K.soll(ANTWORT, 4, "Leerstand erkannt ≥ 70 %", { key: "leerstandProzent", einheit: "%" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.orte >= 20)) return "zu wenige Orte";
                            if (z.eingriff !== true) return "kein Eingriff";
                            if (z.sprung !== true) return "kein Sprung 50 J am Siedlungsnetz";
                            return null;
                        },
                        taeter: "stamm/siedlung-ort.js _autoSettlementCellInfo (kein Jahr, kein Eingriff)",
                        nicht: "kein Sprung am Netz",
                        leser: "stamm/siedlung-ort.js:1410 _autoSettlementCellInfo liest kein Jahr und keinen Eingriff; kein Leerstand",
                        gruen: { werte: { sprungJ: 50, rangVerschiebung: 5, leerstandProzent: 74 }, zeuge: { orte: 64, eingriff: true, sprung: true } },
                        attrappen: [{ name: "Rang verschoben ohne Sprung", roh: { werte: { sprungJ: 50, rangVerschiebung: 5, leerstandProzent: 74 }, zeuge: { orte: 64, eingriff: true, sprung: false } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(ANTWORT, 5, "64 Orte im Jahr X+300 anders", { key: "orteAnders", rel: "≥", zahl: 64 }), K.soll(ANTWORT, 5, "X+300", { key: "sprungJ", rel: "≥", zahl: 300, einheit: "J" }), sollWort(ANTWORT, 5, "ohne Eingriff byte-gleich", { key: "ohneUngleich", rel: "=", zahl: 0 })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.paare >= 64)) return "nur " + (z.paare || 0) + " Paare mit ↔ ohne Eingriff (Soll 64)";
                            if (!(z.hashe >= 2)) return "alle Orte gleich (eine Konstante)";
                            if (z.eingriff !== true) return "der Eingriff (Schwerkraft 2 g) stand nicht";
                            if (!(z.gegenPaare >= 64)) return "der Gegenlauf ohne Eingriff fehlt";
                            return null;
                        },
                        zeugeText: "64 Orte X+300 mit ↔ ohne Eingriff, ohne Eingriff zweimal byte-gleich",
                        taeter: "fachwerk-core.js DORF (der Plan liest keinen Eingriff)",
                        leser: "fachwerk-core.js:4403 DORF(DP) liest Same, Größe, Epoche; ein Eingriff der Welt (Akt, Haus, Schwerkraft) erreicht den Plan der Zelle nicht",
                        gruen: { werte: { orteAnders: 64, sprungJ: 300, ohneUngleich: 0 }, zeuge: { paare: 64, hashe: 60, eingriff: true, gegenPaare: 64 } },
                        attrappen: [{ name: "64 anders ohne Paare der Welt", roh: { werte: { orteAnders: 64, sprungJ: 300, ohneUngleich: 0 }, zeuge: { paare: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(ANTWORT, 6, "100 Taten", { key: "taten", rel: "≥", zahl: 100 }), K.soll(ANTWORT, 6, "Folge in ≥ 3 Perspektiven ≥ 90 %", { key: "folgeProzent", zahl: 90, einheit: "%" }), K.soll(ANTWORT, 6, "Mutante = 0", { key: "mutante" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.taten >= 100)) return "nur " + (z.taten || 0) + " Taten an der Welt";
                            if (!(z.perspektiven >= 3)) return "weniger als 3 Perspektiven beobachtet";
                            if (z.dorf !== true) return "kein Dorf, an dem Leib, Markt und Tag antworten";
                            if (z.gegenGemessen !== true) return "der Gegenlauf ohne Tat fehlt";
                            return null;
                        },
                        zeugeText: "100 Taten, je Tat Leib · Bau · Markt · Tag vor ↔ nach und der Gegenlauf ohne Tat",
                        taeter: "stamm/feld-dsl.js gravity (die Tat erreicht nur _stepCharacter)",
                        leser: "stamm/feld-dsl.js:961 gravity, der Welt-Akt, schreibt state.gravity für den Schritt des Spielers; Leib (stamm/koerper-leib.js:43 kh), Bau (fachwerk-core.js:4403 DORF), Markt und Tag (koerper-core.js:5326 tagesPlan) lesen keine Tat",
                        gruen: { werte: { taten: 100, folgeProzent: 93, mutante: 0 }, zeuge: { taten: 100, perspektiven: 4, dorf: true, gegenGemessen: true } },
                        attrappen: [{ name: "93 % ohne Taten der Welt", roh: { werte: { taten: 100, folgeProzent: 93, mutante: 0 }, zeuge: { taten: 0 } } }],
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
