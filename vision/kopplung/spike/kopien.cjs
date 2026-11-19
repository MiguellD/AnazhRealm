// SPIKE KOPPLUNG — die Kern-Kopien nach dem Gesetz (vision/kopplung/entscheid.md 1.4/1.5), aus der Quelle des Repos gebaut.
// Je Datei eine Liste BENANNTER Ersetzungen { name, such, ersatz }: der Such-Text muss in der Quelle GENAU EINMAL stehen, sonst
// bricht der Bau laut ab. Art "methode": `such` ist der Kopf einer Methode (4 Leerzeichen eingerückt); der ganze Leib bis zur
// schließenden Klammer auf derselben Einrückung ist der Such-Text. Die Kopien liegen in einem Temp-Ordner (os.tmpdir), nie im
// Repo; das Original wird nie verändert. Modus: "vorher" (keine Kopie), "gesetz" (die Kopien), "fest" (die Kopien + die
// Kontroll-Kopie von phyto-core: im Kreis `window.__kopplungFest` gibt `ortWetter` feste Eingänge).
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const REPO = path.resolve(__dirname, "../../..");

function methodenText(src, kopf, name) {
    const i = src.indexOf(kopf);
    if (i < 0 || src.indexOf(kopf, i + 1) >= 0)
        throw new Error(`Ersetzung „${name}“: der Methoden-Kopf trifft ${i < 0 ? 0 : "mehr als 1"} Mal`);
    const ende = src.indexOf("\n    }\n", i);
    if (ende < 0) throw new Error(`Ersetzung „${name}“: kein Ende der Methode`);
    return src.slice(i, ende + 6);
}

function anwenden(src, liste, datei) {
    const log = [];
    for (const e of liste) {
        const such = e.art === "methode" ? methodenText(src, e.such, e.name) : e.such;
        let n = 0;
        for (let k = src.indexOf(such); k >= 0; k = src.indexOf(such, k + 1)) n++;
        if (n !== 1) throw new Error(`Ersetzung „${e.name}“ in ${datei}: der Such-Text trifft ${n} Mal (Soll genau 1)`);
        src = src.replace(such, () => e.ersatz);
        log.push({ datei, name: e.name, suchZeichen: such.length, ersatzZeichen: e.ersatz.length });
    }
    return { src, log };
}

// ---------------------------------------------------------------------------------------------------------------------------
// phyto-core.js — WETTER_ORT, REGEN, ortWetter; Mäander × 0,485 (1.4). kronenDeckungAm ist NICHT gebaut (kein Fall misst Laub).
const PHYTO = [
    {
        name: "maeander-0485",
        such: "        var theta = w.t0 + 0.5 * Math.sin(tt * 0.009 + w.p1) + 0.22 * Math.sin(tt * 0.0257 + w.p2);",
        ersatz:
            "        var theta = w.t0 + 0.485 * (0.5 * Math.sin(tt * 0.009 + w.p1) + 0.22 * Math.sin(tt * 0.0257 + w.p2));",
    },
    {
        name: "ortWetter",
        such: "    // ===================== DIE KARTE (W6): der Codec des EINEN Karten-Atlas — rein, THREE-frei =====================",
        ersatz: `    // === KOPPLUNG (Spike, entscheid.md 1.4) — rein additiv: das Wetter AM ORT als Antrieb jeder Physik ===
    // mix: das Mittel der Zeilen von WX_GESETZ an t_k = 5⌊t/5⌋ − 5j, j = 0…8 (der Kasten 45 s); tor: smoothstep(0,4; 0,6; feuchte);
    // U10 = mix.wind · sturmMS; P = mix.rain · tor · P_ref; im Kreis einer Tat \`wetter\` {x, z, r, t0, dauer, zeile}: rain(zeile) · P_ref.
    var WETTER_ORT = Object.freeze({ kastenS: 45, rasterS: 5 });
    var REGEN = Object.freeze({ P_ref_mmh: 0.834, torAb: 0.4, torVoll: 0.6 });
    function regenTor(feuchte) {
        var u = (feuchte - REGEN.torAb) / (REGEN.torVoll - REGEN.torAb);
        u = u < 0 ? 0 : u > 1 ? 1 : u;
        return u * u * (3 - 2 * u);
    }
    function ortWetter(saat, x, z, t, ort, taten) {
        if (typeof saat !== "string" || !saat) throw new Error("ortWetter: die Saat fehlt");
        var w = wetterAt(saat, x, z, t, ort);
        var R = WETTER_ORT.rasterS,
            n = Math.round(WETTER_ORT.kastenS / R),
            tk = R * Math.floor(t / R);
        var mix = { fog: 0, sun: 0, grey: 0, wind: 0, rain: 0 };
        for (var j = 0; j < n; j++) {
            var Z = WX_GESETZ[wetterAt(saat, x, z, tk - R * j, ort).zeile];
            mix.fog += Z.fog;
            mix.sun += Z.sun;
            mix.grey += Z.grey;
            mix.wind += Z.wind;
            mix.rain += Z.rain;
        }
        mix.fog /= n;
        mix.sun /= n;
        mix.grey /= n;
        mix.wind /= n;
        mix.rain /= n;
        var aus = { zeile: w.zeile, front: w.front, feuchte: w.feuchte, mix: mix, tor_1: regenTor(w.feuchte) };
        /*FEST*/
        aus.U10_ms = aus.mix.wind * WIND_FELD.sturmMS;
        aus.P_mmh = aus.mix.rain * aus.tor_1 * REGEN.P_ref_mmh;
        if (taten)
            for (var i = 0; i < taten.length; i++) {
                var a = taten[i];
                if (!a || a.tat !== "wetter" || !(t >= a.t0 && t < a.t0 + a.dauer)) continue;
                if ((x - a.x) * (x - a.x) + (z - a.z) * (z - a.z) > a.r * a.r) continue;
                var Zt = WX_GESETZ[a.zeile];
                if (!Zt) throw new Error("ortWetter: die Tat wetter trägt keine Zeile von WX_GESETZ (" + a.zeile + ")");
                aus.P_mmh = Zt.rain * REGEN.P_ref_mmh;
                aus.tat = a;
            }
        return aus;
    }

` + "    // ===================== DIE KARTE (W6): der Codec des EINEN Karten-Atlas — rein, THREE-frei =====================",
    },
    {
        name: "export-ortWetter",
        such: "        wetterAt: wetterAt, // wetter.K1 — DAS Wetter am Ort (Saat, Ort, Zeit) → Zeile von WX_GESETZ",
        ersatz:
            "        wetterAt: wetterAt, // wetter.K1 — DAS Wetter am Ort (Saat, Ort, Zeit) → Zeile von WX_GESETZ\n" +
            "        WETTER_ORT: WETTER_ORT, // KOPPLUNG (Spike)\n        REGEN: REGEN, // KOPPLUNG (Spike)\n" +
            "        ortWetter: ortWetter, // KOPPLUNG (Spike) — das Wetter am Ort als Antrieb",
    },
];
// Die Kontroll-Kopie: im Kreis `root.__kopplungFest` {x, z, r, U10, feuchte} feste Eingänge (Zeile bewoelkt, tor 0, P 0, der Wind
// U10, die feuchte des Versuchs); die Tat `wetter` gilt auch dort (Fall II). Außerhalb gilt das Gesetz.
const PHYTO_FEST = [
    {
        name: "kontroll-fest",
        such: "        /*FEST*/",
        ersatz: `        var F = root.__kopplungFest;
        if (F && (x - F.x) * (x - F.x) + (z - F.z) * (z - F.z) <= F.r * F.r) {
            var B = WX_GESETZ.bewoelkt;
            aus = {
                zeile: "bewoelkt",
                front: w.front,
                feuchte: F.feuchte,
                mix: { fog: B.fog, sun: B.sun, grey: B.grey, wind: F.U10 / WIND_FELD.sturmMS, rain: B.rain },
                tor_1: 0,
                fest: true,
            };
        }`,
    },
];

// ---------------------------------------------------------------------------------------------------------------------------
// gelaende-core.js — emc, et0, luftFeuchte, feuchteSchritt, filmSchritt; PEGEL.regen 0,0060 (1.4).
const GELAENDE = [
    {
        name: "pegel-regen-0006",
        such: "regen: 0.072 });",
        ersatz: "regen: 0.006 });",
    },
    {
        name: "feuchte-gesetz",
        such: "    function temperatur(L, y, saison, uhr, traegTage, wetter) {",
        ersatz: `    // === KOPPLUNG (Spike, entscheid.md 1.4) — die Feuchte des toten Fein-Brennstoffs als Wasser-Bilanz, rein additiv ===
    // msat 2,5 (Matthews 2006, = BRAND.feuchte.nass), fsp 0,35 (Faser-Sättigung, = BRAND.feuchte.faser), tau 3 600 s Prozess
    // (1-h-Brennstoff, Fosberg & Deeming 1971), prozess 24 = 86 400 / PEGEL_TAG_S, rhMin 0,3 (gewählt), sMax 1 mm (gewählt).
    const BRENN_FEUCHTE = Object.freeze({ msat: 2.5, fsp: 0.35, tauS: 3600, prozess: 24, rhMin: 0.3, sMaxMm: 1 });
    const esKPa = (T) => 0.6108 * Math.exp((17.27 * T) / (T + 237.3)); // FAO-56 Gl. 11
    // Simard 1968 (NFDRS): RH in %, T in °F → kg/kg
    function emc(rh, T) {
        if (!Number.isFinite(rh) || !Number.isFinite(T)) throw new Error("gelaende-core emc: rh oder T fehlt");
        const H = rh * 100,
            F = T * 1.8 + 32;
        const e =
            H < 10
                ? 0.03229 + 0.281073 * H - 0.000578 * H * F
                : H < 50
                  ? 2.22749 + 0.160107 * H - 0.01478 * F
                  : 21.0606 + 0.005565 * H * H - 0.00035 * H * F - 0.483199 * H;
        return Math.max(0, e) / 100;
    }
    // FAO-56 stündlich (Allen et al. 1998, Gl. 53), u2 = 0,748·U10; Rs aus der Sonnenhöhe und sun, Rn grob (unsicher) → mm/h
    function et0(T, U10, ea, sun, sinH) {
        const Rs = 3.6 * Math.max(0, sinH) * (0.25 + 0.75 * sun);
        const Rn = 0.77 * Rs - 0.03 * (1 - 0.6 * (1 - sun));
        const G = Rn > 0 ? 0.1 * Rn : 0.5 * Rn;
        const u2 = U10 * 0.748,
            es = esKPa(T),
            D = (4098 * es) / (T + 237.3) ** 2,
            g = 0.0665;
        return Math.max(0, (0.408 * D * (Rn - G) + g * (37 / (T + 273)) * u2 * Math.max(0, es - ea)) / (D + g * (1 + 0.34 * u2)));
    }
    // ea = RH̄·e_s(T_Tagesmittel), RH̄ = rhMin + (1 − rhMin)·min(1, feuchte/nebel), nebel = phyto-core stufen.nebel (0,72)
    function luftFeuchte(feuchte, T, Tmittel) {
        const P = root.__phytoCore;
        if (!P || !P.WIND_FELD) throw new Error("gelaende-core luftFeuchte: phyto-core fehlt (stufen.nebel)");
        const nebel = P.WIND_FELD.front.stufen.nebel;
        const R = BRENN_FEUCHTE.rhMin + (1 - BRENN_FEUCHTE.rhMin) * Math.min(1, feuchte / nebel);
        const es = esKPa(T);
        const ea = Math.min(es, R * esKPa(Tmittel));
        return { rh_1: Math.min(1, ea / es), ea_kPa: ea };
    }
    // ein Schritt von dtW s Welt (Prozess 24·dtW): Interzeption c·P·(1 − M/msat) · freies Wasser −Ep · gebunden (EMC − M)/τ
    function feuchteSchritt(M, bett, a, dtW) {
        const B = BRENN_FEUCHTE,
            dt = B.prozess * dtW;
        if (a.P_mmh > 0) {
            const k = (bett.c * a.P_mmh) / 3600 / bett.w;
            return B.msat - (B.msat - M) * Math.exp((-k * dt) / B.msat);
        }
        if (M > B.fsp) return Math.max(B.fsp, M - (a.Ep_mmh / 3600 / bett.w) * dt);
        const e = emc(a.rh_1, a.T_C);
        return e + (M - e) * Math.exp(-dt / B.tauS);
    }
    // der Film der Oberfläche in mm: dS = (P − Ep)·dt, 0 ≤ S ≤ sMax
    function filmSchritt(S, a, dtW) {
        const dtH = (BRENN_FEUCHTE.prozess * dtW) / 3600;
        return Math.min(BRENN_FEUCHTE.sMaxMm, Math.max(0, S + (a.P_mmh - a.Ep_mmh) * dtH));
    }
    function temperatur(L, y, saison, uhr, traegTage, wetter) {`,
    },
    {
        name: "export-feuchte",
        such: "        PEGEL: PEGEL,",
        ersatz:
            "        PEGEL: PEGEL,\n        BRENN_FEUCHTE: BRENN_FEUCHTE, // KOPPLUNG (Spike)\n        emc: emc,\n        et0: et0,\n" +
            "        luftFeuchte: luftFeuchte,\n        feuchteSchritt: feuchteSchritt,\n        filmSchritt: filmSchritt,",
    },
];

// ---------------------------------------------------------------------------------------------------------------------------
// stamm/bild-himmel.js — _temperaturAt(x, z, y, traeg) zur Tag-Phase und am Ort; _wetterAm; _feuchteAm mit Epochen-Anker (1.5/1.6)
const BILD_HIMMEL = [
    {
        name: "temperatur-am-ort+wetter-am+feuchte-am",
        art: "methode",
        such: "    _temperaturAt(y, traegTage) {",
        ersatz: `    // KOPPLUNG (Spike): die Temperatur AM ORT zur Tag-Phase der Welt-Uhr (nie timeOfDay, nie das Wort); t (Vorgabe die Welt-Uhr)
    // trägt der Integrator der Feuchte (\`_feuchteFenster\`) für seine Schritte
    _temperaturAt(x, z, y, traegTage, t = this.state.spielZeit) {
        if (!(Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(y)))
            throw new Error("_temperaturAt: Ort oder Höhe fehlt (" + x + ", " + z + ", " + y + ")");
        const w = this._wetterAm(x, z, t);
        return globalThis.__gelaendeCore.temperaturAus(this._temperaturFeld(y, traegTage), this._saisonAm(t), this._tagPhaseAm(t), {
            sun: w.mix.sun,
            rain: w.mix.rain * w.tor_1,
        });
    }
    // die Tag-Phase der Welt-Uhr: frac(tagNull + t / PEGEL_TAG_S)
    _tagPhaseAm(t) {
        const wm = this.state.worldMeta;
        const d = (+(wm && wm.tagNull) || 0) + t / AnazhRealm.PEGEL_TAG_S;
        return d - Math.floor(d);
    }
    // die Saison: saisonNull (Vorgabe 0,375) + Prozess-Tage / 365 (autoSeason), sonst saisonNull
    _saisonAm(t) {
        const st = this.state;
        const s0 = Number.isFinite(st.worldMeta && st.worldMeta.saisonNull) ? st.worldMeta.saisonNull : 0.375;
        if (!st.autoSeason) return s0;
        const s = s0 + t / AnazhRealm.PEGEL_TAG_S / globalThis.__gelaendeCore.TEMPERATUR.jahrTage;
        return s - Math.floor(s);
    }
    // die Taten \`wetter\` der Welt (inkrementell wie der Tat-Index)
    _wetterTaten() {
        const L = this.state.worldMeta && this.state.worldMeta.taten;
        const n = Array.isArray(L) ? L.length : 0;
        let J = this._wetterTatIdx;
        if (!J || J.L !== L || J.n > n || J.gen !== this._tatGen) J = this._wetterTatIdx = { L, n: 0, gen: this._tatGen, a: [] };
        for (; J.n < n; J.n++) if (L[J.n] && L[J.n].tat === "wetter") J.a.push(L[J.n]);
        return J.a;
    }
    // DAS WETTER AM ORT (Kern \`ortWetter\`): Rechenpunkt die Mitte der 16-m-Zelle, Memo je Zelle × 5 s
    _wetterAm(x, z, t = this.state.spielZeit) {
        if (!(Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(t))) throw new Error("_wetterAm: Ort oder Zeit fehlt");
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz, tk] = [Math.floor(x / cs), Math.floor(z / cs), 5 * Math.floor(t / 5)];
        const M = this._wetterAmMerk || (this._wetterAmMerk = new Map());
        const taten = this._wetterTaten();
        const k = cx + "," + cz + "," + tk + "," + taten.length;
        let w = M.get(k);
        if (!w) {
            if (M.size > 40000) M.clear();
            const wm = this.state.worldMeta || {};
            w = globalThis.__phytoCore.ortWetter(wm.seed || "anazh-realm-seed", (cx + 0.5) * cs, (cz + 0.5) * cs, tk, this._gelaende().ort.wetter, taten);
            M.set(k, w);
        }
        return w;
    }
    // DIE FEUCHTE DES BRENNSTOFFS AM ORT → { gras, laub, film_mm } — je Zelle das Fenster ab dem Epochen-Anker (1.6)
    _feuchteAm(x, z, y, t = this.state.spielZeit) {
        if (!(Number.isFinite(x) && Number.isFinite(z) && Number.isFinite(y) && Number.isFinite(t)))
            throw new Error("_feuchteAm: Ort, Höhe oder Zeit fehlt (" + x + ", " + z + ", " + y + ", " + t + ")");
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz, self] = [Math.floor(x / cs), Math.floor(z / cs), this];
        return {
            get gras() {
                return self._feuchteFenster(cx, cz, y, t, "gras").M;
            },
            get laub() {
                return self._feuchteFenster(cx, cz, y, t, "laub").M;
            },
            get film_mm() {
                return self._feuchteFenster(cx, cz, y, t, "gras").S;
            },
        };
    }
    // Das Bett der Bilanz aus der Zeile des Stoffs: c = 1 − exp(−σ·w/(π·ρp)), w die Last, mx
    _feuchteBett(art) {
        const B = this._feuchteBetten || (this._feuchteBetten = {});
        if (!B[art]) {
            const Z = this._stoff(art);
            if (!Z || !Z.brenn || !(Z.rho > 0)) throw new Error("_feuchteBett: der Stoff " + art + " trägt kein Brenn-Bett");
            const b = Z.brenn;
            B[art] = { c: 1 - Math.exp((-b.sigma * b.last) / (Math.PI * Z.rho)), w: b.last, mx: b.mx };
        }
        return B[art];
    }
    // Der Antrieb eines Schritts an der Zelle zur Welt-Zeit u (P, Ep, rh, T)
    _feuchteAntrieb(xc, zc, F, F0, u) {
        const G = globalThis.__gelaendeCore;
        const wm = this.state.worldMeta || {};
        const w = globalThis.__phytoCore.ortWetter(wm.seed || "anazh-realm-seed", xc, zc, u, this._gelaende().ort.wetter, this._wetterTaten());
        const [sai, ph] = [this._saisonAm(u), this._tagPhaseAm(u)];
        const T = G.temperaturAus(F, sai, ph, { sun: w.mix.sun, rain: w.mix.rain * w.tor_1 });
        const Tm = G.temperaturAus(F0, sai, ph);
        const lf = G.luftFeuchte(w.feuchte, T, Tm);
        const sinH = Math.max(0, __weltLicht.sonnenRichtung(__weltLicht.sonnenWinkel(ph))[1]);
        const Ep = G.et0(T, w.U10_ms, lf.ea_kPa, w.mix.sun, sinH);
        return { P_mmh: w.P_mmh, Ep_mmh: Ep, rh_1: w.P_mmh > 0 ? 1 : lf.rh_1, T_C: T };
    }
    // Das Fenster: Anker e = φ + H·⌊(t − φ)/H⌋ − H (5-s-Raster), Start M(e) = EMC(e), Film 0; das Memo schreitet nur innerhalb
    // derselben Epoche vor (dieselben Schritte ab demselben Anker — bitgleich zur Neurechnung). H: Gras/Film 1, Laub 2 Prozess-Tage.
    _feuchteFenster(cx, cz, y, t, art) {
        const G = globalThis.__gelaendeCore;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const H = (art === "laub" ? 2 : 1) * AnazhRealm.PEGEL_TAG_S;
        const R = 5;
        const wm = this.state.worldMeta || {};
        const s = (wm.seed || "anazh-realm-seed") + ":" + cx + "," + cz + ":" + art;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        const phi = R * Math.round((H * (h / 4294967296)) / R);
        const tq = R * Math.floor(t / R);
        const e = phi + H * Math.floor((tq - phi) / H) - H;
        const Mm = this._feuchteMerk || (this._feuchteMerk = new Map());
        const k = art + "|" + cx + "," + cz + "|" + this._wetterTaten().length;
        let m = Mm.get(k);
        if (this._feuchteFrisch || !m || m.e !== e || m.u > tq || m.y !== y) {
            if (Mm.size > 20000) Mm.clear();
            const F = this._temperaturFeld(y, 0);
            const F0 = Object.assign({}, F, { tag: { amp: 0, gipfel: 0, spaet: 0 } });
            const [xc, zc] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
            const a0 = this._feuchteAntrieb(xc, zc, F, F0, e);
            m = { e, u: e, y, F, F0, xc, zc, M: G.emc(a0.rh_1, a0.T_C), S: 0, schritte: 0 };
            Mm.set(k, m);
        }
        const bett = this._feuchteBett(art);
        while (m.u < tq) {
            const a = this._feuchteAntrieb(m.xc, m.zc, m.F, m.F0, m.u);
            m.M = G.feuchteSchritt(m.M, bett, a, R);
            m.S = G.filmSchritt(m.S, a, R);
            m.u += R;
            m.schritte++;
        }
        return m;
    }
`,
    },
];

// ---------------------------------------------------------------------------------------------------------------------------
// Die Rufer der Temperatur tragen den Ort (die Signatur (x, z, y, traeg) wirft ohne Ort)
const FELD_LEBEN = [
    {
        name: "temperatur-ort-lava",
        such: "this._temperaturAt(a.y, 0), {",
        ersatz: "this._temperaturAt(a.x, a.z, a.y, 0), {",
    },
    {
        name: "temperatur-ort-esse",
        such: "const luft = this._temperaturAt(pm.position.y);",
        ersatz: "const luft = this._temperaturAt(pm.position.x, pm.position.z, pm.position.y);",
    },
];
const KLANG = [
    { name: "temperatur-ort-grille", such: "this._temperaturAt(py, ", ersatz: "this._temperaturAt(px, pz, py, " },
];
const KOERPER_FAHRT = [
    { name: "temperatur-ort-brennglas", such: "this._temperaturAt(P0.y)", ersatz: "this._temperaturAt(P0.x, P0.z, P0.y)" },
];
const SIEDLUNG_WEGE = [
    { name: "temperatur-ort-lava-busch", such: "this._temperaturAt(a.y, 0) + 273.15", ersatz: "this._temperaturAt(a.x, a.z, a.y, 0) + 273.15" },
];

// ---------------------------------------------------------------------------------------------------------------------------
// stamm/stoff-material.js — die Stärke des Winds aus dem Wetter AM ORT (nie das Wort am Spieler)
const STOFF_MATERIAL = [
    {
        name: "wind-staerke-am-ort",
        such: "const staerke = this._weatherFieldFor(this.state.weather).wind * this._windWob(tt) * form;",
        ersatz: "const staerke = this._wetterAm(x, z).mix.wind * this._windWob(tt) * form;",
    },
];

// ---------------------------------------------------------------------------------------------------------------------------
// stamm/feld-brand.js — lastAm (Gras: p der Wiese), keine Sperre durch die Tat, M je Zelle zu ihrer Ankunft, kein Erbe, iw netto
const FELD_BRAND = [
    {
        name: "bett-lastAm-ohne-sperre",
        art: "methode",
        such: "    _brandStoff(cx, cz) {",
        ersatz: `    // KOPPLUNG (Spike): DAS BETT AUS FUNKTIONEN (\`lastAm\`) — die Last je Bett-Punkt ist die Bedeckung p der Wiese (der Wurf der
    // Nah-Wiese als Funktion: \`terrain:groundCover\`.grass × \`_wieseGrund\` mit dem Grün von \`_bodenFarbeAt\` über \`gruenSchwelle\`);
    // Bett ist, wo p ≥ minStoff; leb = Mittel von p über das Bett × (1 − Asche der Zelle, \`_brandZelle\`). Die Tat sperrt nicht.
    // Laub (\`kronenDeckungAm\`) ist im Spike NICHT gebaut.
    _brandStoff(cx, cz) {
        const key = cx + "," + cz;
        const M = this._brandBett || (this._brandBett = new Map());
        let g = M.get(key);
        if (g === undefined) M.set(key, (g = this._lastAm(cx, cz)));
        if (!g) return null;
        const a = this._brandZelle(cx, cz);
        const leb = g.p * (1 - (a ? a.asche : 0));
        if (!(leb >= AnazhRealm.BRAND.minStoff)) return null;
        return Object.assign({}, g, { leb });
    }
    _lastAm(cx, cz) {
        const B = AnazhRealm.BRAND;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
        if (this._nassAt(x, z)) return null;
        const [y, h] = [this._voxelSurfaceY(x, z), cs / 2];
        const [gx, gz] = [(this._voxelSurfaceY(x + h, z) - y) / h, (this._voxelSurfaceY(x, z + h) - y) / h];
        const GC = AnazhRealm.Gesetz("terrain:groundCover", null) || AnazhRealm._kernPflichtBruch("terrain:groundCover");
        const GS = AnazhRealm.GRASS_SLOPE;
        const gs = AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle;
        const licht = this._bodenLichtFeld(cx * cs, cz * cs, (cx + 1) * cs, (cz + 1) * cs);
        const col = [0, 0, 0];
        const cl = (v) => Math.max(0, Math.min(1, v));
        const punkt = (px, pz) => {
            const py = this._voxelSurfaceY(px, pz);
            if (!Number.isFinite(py)) return 0;
            this._bodenFarbeAt(px, py, pz, col);
            const t2 = cl((col[1] - 0.5 * (col[0] + col[2])) / gs);
            const wg = this._wieseGrund(px, pz, py, t2 * t2 * (3 - 2 * t2));
            if (!(wg > 0)) return 0;
            const m = this._feuchteAt(px, pz, py);
            const rk = cl((this._slopeAt(px, pz, null, 1) - GS.lo) / (GS.hi - GS.lo));
            return GC(licht(px, pz), m, rk, Infinity).grass * wg;
        };
        const messen = (P) => {
            const bett = new Uint8Array(P.length);
            let [n, s] = [0, 0];
            P.forEach(([u, v], k) => {
                const p = punkt(x + u * cs, z + v * cs);
                if (p >= B.minStoff) ((bett[k] = 1), n++, (s += p));
            });
            return { N: P.length, bett, n, s };
        };
        const fein = () =>
            Array.from({ length: B.bettGitter ** 2 }, (_, k) => [
                ((k % B.bettGitter) + 0.5) / B.bettGitter - 0.5,
                (Math.floor(k / B.bettGitter) + 0.5) / B.bettGitter - 0.5,
            ]);
        const grob = messen(B.bettGrob);
        const { N, bett, n, s } = grob.n > 0 && grob.n < grob.N ? messen(fein()) : grob;
        if (!n) return null;
        return { zeile: this._stoff("gras"), p: s / n, anteil: n / N, bett: n < N ? bett : null, x, z, y, gx, gz, boden: this._feuchteAt(x, z, y) };
    }
`,
    },
    {
        name: "feuchte-je-zelle-tempo",
        such: "        const M = this._brandFeuchte(f.boden);\n        // an der Erlöschungs-Feuchte",
        ersatz: "        const M = this._feuchteAm(f.x, f.z, f.y, t)[f.zeile.name];\n        // an der Erlöschungs-Feuchte",
    },
    {
        name: "temperatur-am-ort-tempo",
        such: 'const [W, luft] = [this._stoff("wasser"), this._temperaturAt(f.y)];',
        ersatz: 'const [W, luft] = [this._stoff("wasser"), this._temperaturAt(f.x, f.z, f.y, 0, t)];',
    },
    {
        name: "iw-netto",
        such: "iw: (f.zeile.brenn.heiz / 1000) * f.zeile.brenn.last * Math.min(1, f.leb),",
        ersatz: "iw: (f.zeile.brenn.heiz / 1000) * f.zeile.brenn.last * Math.min(1, f.leb) * (1 - AnazhRealm.BRAND.mineral.gesamt),",
    },
    {
        name: "kein-erbe",
        such: "bf.set(nk, Object.assign(neu, { an: t + dt, ex: ax, ez: az, mx: zelle.mx, boden: zelle.boden, von: key }));",
        ersatz: "bf.set(nk, Object.assign(neu, { an: t + dt, ex: ax, ez: az, von: key }));",
    },
    {
        name: "feuchte-je-zelle-schritt",
        such: `            const M = this._brandFeuchte(z.boden);
            if (M < z.mx && z.t0 === null) {
                if (z.an <= t) faellig.push(z);
                continue;
            }`,
        ersatz: `            if (z.t0 === null) {
                if (z.an <= t) faellig.push(z); // die Wartende urteilt ihr EIGENES M zu IHRER Ankunft (\`_brandZuenden\`)
                continue;
            }
            const M = this._feuchteAm((z.cx + 0.5) * AnazhRealm.LIFE_FIELD.cell, (z.cz + 0.5) * AnazhRealm.LIFE_FIELD.cell, z.y, t)[z.stoff];`,
    },
];

// ---------------------------------------------------------------------------------------------------------------------------
// MESS-ERSETZUNG (in JEDEM Modus, auch "vorher"; ändert keine Zahl der Physik): `_brandTempo` legt vor seiner Rückgabe die
// Glieder ab, die der Spike liest — I_R, der Wind auf Flammenhöhe u, ob der Wind-Deckel 0,9·I_R (feld-brand.js:330) greift,
// das U10 am Ort (ohne Böe) und das M, das die Zelle las. Beweis „keine Zahl ändert sich“: vorher-a mit und ohne diese Ersetzung
// gibt dieselben R (spike.md, Fall I).
const DIAG = {
    "stamm/feld-brand.js": [
        {
            name: "diag-tempo-glieder",
            such: "        return { R: R0 * (1 + phi) * 0.00508, ecc, px: phi ? vx / phi : 1, pz: phi ? vz / phi : 0, tr: 23040 / sig };",
            ersatz:
                "        this._tempoLetzt = { IR, u, deckel: u > 0.9 * IR, U10: w.ms / (w.boe * this._windWob(t)), M, leb: f.leb };\n" +
                "        return { R: R0 * (1 + phi) * 0.00508, ecc, px: phi ? vx / phi : 1, pz: phi ? vz / phi : 0, tr: 23040 / sig };",
        },
    ],
};

const DATEIEN = {
    "phyto-core.js": PHYTO,
    "gelaende-core.js": GELAENDE,
    "stamm/bild-himmel.js": BILD_HIMMEL,
    "stamm/feld-leben.js": FELD_LEBEN,
    "stamm/klang.js": KLANG,
    "stamm/koerper-fahrt.js": KOERPER_FAHRT,
    "stamm/siedlung-wege.js": SIEDLUNG_WEGE,
    "stamm/stoff-material.js": STOFF_MATERIAL,
    "stamm/feld-brand.js": FELD_BRAND,
};

// → { modus, ordner, karte: { "/phyto-core.js": "<temp>/phyto-core.kopplung.js", … }, log }
// "vorher": nur die Mess-Ersetzung DIAG an der Kopie von feld-brand.js (die Physik des Originals); "gesetz"/"fest": die Kopien.
function bauKopien(modus) {
    if (!["vorher", "gesetz", "fest"].includes(modus)) throw new Error("bauKopien: Modus vorher | gesetz | fest, nicht " + modus);
    const ordner = fs.mkdtempSync(path.join(os.tmpdir(), "kopplung-spike-"));
    const karte = {},
        log = [];
    const dateien = [...new Set([...Object.keys(DATEIEN), ...Object.keys(DIAG)])];
    for (const datei of dateien) {
        const liste = [...(modus === "vorher" ? [] : DATEIEN[datei] || []), ...(DIAG[datei] || [])];
        if (!liste.length) continue;
        const roh = fs.readFileSync(path.join(REPO, datei), "utf8");
        let { src, log: l } = anwenden(roh, liste, datei);
        log.push(...l);
        if (datei === "phyto-core.js" && modus === "fest") {
            const f = anwenden(src, PHYTO_FEST, datei);
            src = f.src;
            log.push(...f.log);
        }
        const name =
            path.basename(datei, ".js") +
            (modus === "vorher" ? ".vorher-diag.js" : datei === "phyto-core.js" && modus === "fest" ? ".kopplung-fest.js" : ".kopplung.js");
        const ziel = path.join(ordner, name);
        fs.writeFileSync(ziel, src);
        karte["/" + datei] = ziel;
    }
    return { modus, ordner, karte, log };
}

module.exports = { bauKopien, DATEIEN, REPO };

if (require.main === module) {
    const k = bauKopien(process.argv[2] || "gesetz");
    for (const e of k.log) console.log(`${e.datei} · ${e.name} · Such ${e.suchZeichen} Z → Ersatz ${e.ersatzZeichen} Z`);
    for (const [p, f] of Object.entries(k.karte)) console.log(`${p} → ${f}`);
    // die Kopien laufen durch den Parser
    try {
        for (const f of Object.values(k.karte)) new (require("vm").Script)(fs.readFileSync(f, "utf8"), { filename: f });
        console.log("Parser: " + Object.keys(k.karte).length + " Kopien ok");
    } finally {
        fs.rmSync(k.ordner, { recursive: true, force: true }); // wie die Bühne: die Kopien leben nur für den Lauf
    }
}
