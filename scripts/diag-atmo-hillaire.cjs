#!/usr/bin/env node
"use strict";
// SPIKE D3 (WIP, Entscheidung, kein Bau): DAS LICHT-VERHÄLTNIS aus EINER Atmosphäre, offline nach Hillaire
// (EGSR 2020, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique", CGF 39(4)).
// Gerechnet wird, was die LUT-Kette des Baus zeigen würde: Transmittance (Sonne) · Mehrfachstreuung Ψ_ms (32²-Gesetz,
// Gl. 5–9) · Himmels-Leuchtdichte je Richtung (der Sky-View-Marsch) → E_Himmel = ∫ L cosθ dω an der waagrechten Fläche,
// E_Sonne = E0·T·μs. Die Größe der Tafel: lichtVerhaeltnis = (E_Sonne + E_Himmel) / E_Himmel (Luma Rec.709, wie
// `__lichtBilanz`), Soll [5; 12,5], gemessen heute 4,226 (soll-tafel himmel-licht).
//
// DAS GESETZ DER WELT, gelesen (nie abgeschrieben): Rayleigh = `AnazhRealm.RAYLEIGH_BETA` (Zenit-Tiefe je Kanal,
// 26c.js) über die Skalenhöhe 8 km; das Aerosol = die EINE Koschmieder-Luft `AnazhRealm.LUFT` (klare Sicht 20 km bei
// 2 % Kontrast, Skalenhöhe 1 km, abzüglich ihres Rayleigh-Anteils) im Wetter `sunny`. Was das Welt-Gesetz nicht
// trägt, kommt aus Hillaire: Mie g 0,8 (HG), Einfach-Albedo 0,9, Ozon-Zelt (25 km ± 15 km), Erdradius 6360/6460 km.
//
//   node scripts/diag-atmo-hillaire.cjs [--aus <datei.json>] [--mu 0.962] [--schnell]
const fs = require("fs");
const path = require("path");

const RG = 6360e3;
const RT = 6460e3;
const LUMA = [0.2126, 0.7152, 0.0722];

// ---------- die Welt-Konstanten lesen (stamm/26c.js, stamm/06b.js), nie abschreiben ----------
function weltGesetz() {
    const wurzel = path.join(__dirname, "..");
    const t26c = fs.readFileSync(path.join(wurzel, "stamm", "26c.js"), "utf8");
    const t06b = fs.readFileSync(path.join(wurzel, "stamm", "06b.js"), "utf8");
    const zahl = (re, text, name) => {
        const m = text.match(re);
        if (!m) throw new Error(`Welt-Gesetz: ${name} nicht gefunden`);
        return m.slice(1).map(Number);
    };
    const [rr, rg, rb] = zahl(
        /AnazhRealm\.RAYLEIGH_BETA\s*=\s*Object\.freeze\(\{\s*r:\s*([\d.e-]+),\s*g:\s*([\d.e-]+),\s*b:\s*([\d.e-]+)/,
        t26c,
        "RAYLEIGH_BETA"
    );
    const luftBlock = t26c.match(/AnazhRealm\.LUFT\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/);
    if (!luftBlock) throw new Error("Welt-Gesetz: LUFT nicht gefunden");
    const L = {};
    for (const m of luftBlock[1].matchAll(/(\w+):\s*([\d.e-]+)/g)) L[m[1]] = Number(m[2]);
    const [sonnigNebel, sonnigRegen] = zahl(
        /sunny:\s*Object\.freeze\(\{\s*fog:\s*([\d.]+),[^}]*rain:\s*([\d.]+)/,
        t06b,
        "WEATHER_FIELD.sunny"
    );
    // `_luftBeta(sunny)` (24.js): betaRayleigh + fog·dunst + rain·regen, dunst = (K/sichtKlar − βR)/sunny.fog
    const K = -Math.log(L.kontrast);
    const dunst = (K / L.sichtKlarM - L.betaRayleigh) / sonnigNebel;
    const betaSonnig = L.betaRayleigh + sonnigNebel * dunst + sonnigRegen * 0;
    // der Boden der Welt, gemessen (spec/farbe/albedo-tafel.json, `werkbank albedo`): das Mittel aus Laub und Wald-Boden
    // je Kanal — die Mess-Wiese liegt im Gras am Waldrand; das Gras selbst trägt die Tafel nicht
    const tafel = JSON.parse(fs.readFileSync(path.join(wurzel, "spec", "farbe", "albedo-tafel.json"), "utf8"));
    const zeile = (id) => {
        const z = tafel.zeilen.find((x) => x.id === id);
        if (!z || !z.ist || !z.ist.welt) throw new Error(`Albedo-Tafel: ${id} ohne Welt-Messung`);
        return z.ist.welt.rgb.split("/").map(Number);
    };
    const la = zeile("laub"),
        bo = zeile("boden");
    const bodenAlbedo = la.map((v, c) => (v + bo[c]) / 2);
    return {
        bodenAlbedo,
        rayleighZenitTiefe: [rr, rg, rb],
        luft: L,
        betaSonnig,
        aerosolBetaBoden: betaSonnig - L.betaRayleigh,
        aerosolSkalenHoehe: L.skalenHoeheM,
    };
}

// ---------- das Medium ----------
function atmosphaere(o) {
    const HR = o.HR || 8000;
    const betaR = o.rayleighZenitTiefe.map((t) => t / HR); // Streuung = Extinktion (Rayleigh absorbiert nicht)
    const alpha = o.angstroem || 0; // Mie spektral: β(λ) = β550·(λ/550)^-α (Hillaire: grau, α = 0)
    const lam = [680, 550, 440];
    const mieExt = lam.map((l) => o.mieExt550 * Math.pow(l / 550, -alpha));
    const ssa = o.mieSsa == null ? 0.9 : o.mieSsa;
    return {
        betaR,
        HR,
        mieExt,
        mieSca: mieExt.map((e) => e * ssa),
        HM: o.HM,
        g: o.g == null ? 0.8 : o.g,
        phase: o.phase || "hg",
        ozon: o.ozon || [0.65e-6, 1.881e-6, 0.085e-6], // Hillaire/Bruneton: Absorption je m im Zelt-Gipfel
        albedo: Array.isArray(o.albedo) ? o.albedo : [0, 1, 2].map(() => (o.albedo == null ? 0.3 : o.albedo)), // je Kanal
        h0: o.h0 || 0,
    };
}
function dichte(A, h, out) {
    const dR = Math.exp(-h / A.HR);
    const dM = Math.exp(-h / A.HM);
    const dO = Math.max(0, 1 - Math.abs(h - 25e3) / 15e3);
    for (let c = 0; c < 3; c++) {
        const sR = A.betaR[c] * dR;
        const sM = A.mieSca[c] * dM;
        out.sR[c] = sR;
        out.sM[c] = sM;
        out.sca[c] = sR + sM;
        out.ext[c] = sR + A.mieExt[c] * dM + A.ozon[c] * dO;
    }
}
const neuMedium = () => ({ sR: [0, 0, 0], sM: [0, 0, 0], sca: [0, 0, 0], ext: [0, 0, 0] });

// Strahl ab Radius r, cos Zenit mu: Abstand zum Rand der Atmosphäre bzw. zum Boden (-1 = kein Treffer)
function zumRand(r, mu) {
    const d = r * r * (mu * mu - 1) + RT * RT;
    return -r * mu + Math.sqrt(Math.max(0, d));
}
function zumBoden(r, mu) {
    if (mu >= 0) return -1;
    const d = r * r * (mu * mu - 1) + RG * RG;
    if (d < 0) return -1;
    return -r * mu - Math.sqrt(d);
}

// ---------- Transmittance-LUT (Bruneton-Parametrisierung, wie Hillaire 256×64; hier feiner) ----------
function transmittanceLut(A, NMU, NR, STEPS) {
    const H = Math.sqrt(RT * RT - RG * RG);
    const lut = new Float64Array(NMU * NR * 3);
    const m = neuMedium();
    for (let j = 0; j < NR; j++) {
        const xr = j / (NR - 1);
        const rho = H * xr;
        const r = Math.sqrt(rho * rho + RG * RG);
        for (let i = 0; i < NMU; i++) {
            const xmu = i / (NMU - 1);
            const dMin = RT - r;
            const dMax = rho + H;
            const d = dMin + xmu * (dMax - dMin);
            let mu = d === 0 ? 1 : (H * H - rho * rho - d * d) / (2 * r * d);
            mu = Math.max(-1, Math.min(1, mu));
            const tau = [0, 0, 0];
            const dt = d / STEPS;
            for (let s = 0; s < STEPS; s++) {
                const t = (s + 0.5) * dt;
                const ri = Math.sqrt(t * t + 2 * r * mu * t + r * r);
                dichte(A, ri - RG, m);
                for (let c = 0; c < 3; c++) tau[c] += m.ext[c] * dt;
            }
            const k = (j * NMU + i) * 3;
            for (let c = 0; c < 3; c++) lut[k + c] = Math.exp(-tau[c]);
        }
    }
    return { lut, NMU, NR, H };
}
// T(r, mu) zum Rand; trifft der Strahl den Boden → 0 (Erdschatten)
function transmittance(TL, r, mu, out) {
    if (zumBoden(r, mu) >= 0) {
        out[0] = out[1] = out[2] = 0;
        return out;
    }
    const H = TL.H;
    const rho = Math.sqrt(Math.max(0, r * r - RG * RG));
    const d = zumRand(r, mu);
    const dMin = RT - r;
    const dMax = rho + H;
    const xmu = dMax > dMin ? (d - dMin) / (dMax - dMin) : 0;
    const xr = rho / H;
    const fi = Math.max(0, Math.min(1, xmu)) * (TL.NMU - 1);
    const fj = Math.max(0, Math.min(1, xr)) * (TL.NR - 1);
    const i0 = Math.min(TL.NMU - 2, Math.floor(fi));
    const j0 = Math.min(TL.NR - 2, Math.floor(fj));
    const a = fi - i0;
    const b = fj - j0;
    const L = TL.lut;
    for (let c = 0; c < 3; c++) {
        const v00 = L[(j0 * TL.NMU + i0) * 3 + c];
        const v10 = L[(j0 * TL.NMU + i0 + 1) * 3 + c];
        const v01 = L[((j0 + 1) * TL.NMU + i0) * 3 + c];
        const v11 = L[((j0 + 1) * TL.NMU + i0 + 1) * 3 + c];
        out[c] = (v00 * (1 - a) + v10 * a) * (1 - b) + (v01 * (1 - a) + v11 * a) * b;
    }
    return out;
}

// ---------- Mehrfachstreuung Ψ_ms (Hillaire §5.5, Gl. 5–9) ----------
function mehrfachLut(A, TL, NMUS, NH, NDMU, NDPHI, STEPS) {
    const lut = new Float64Array(NMUS * NH * 3);
    const m = neuMedium();
    const Ts = [0, 0, 0];
    const pu = 1 / (4 * Math.PI);
    for (let j = 0; j < NH; j++) {
        const h = Math.max(1, (j / (NH - 1)) * (RT - RG) - 1);
        const r = RG + h;
        for (let i = 0; i < NMUS; i++) {
            const mus = -1 + (2 * i) / (NMUS - 1);
            const sx = Math.sqrt(Math.max(0, 1 - mus * mus));
            const sy = mus;
            const Lsum = [0, 0, 0];
            const Fsum = [0, 0, 0];
            for (let a = 0; a < NDMU; a++) {
                const mu = -1 + ((a + 0.5) * 2) / NDMU;
                const st = Math.sqrt(Math.max(0, 1 - mu * mu));
                for (let b = 0; b < NDPHI; b++) {
                    const phi = ((b + 0.5) * 2 * Math.PI) / NDPHI;
                    const vx = st * Math.cos(phi);
                    const vy = mu;
                    const vz = st * Math.sin(phi);
                    const tB = zumBoden(r, mu);
                    const boden = tB >= 0;
                    const tMax = boden ? tB : zumRand(r, mu);
                    const thr = [1, 1, 1];
                    const L = [0, 0, 0];
                    const F = [0, 0, 0];
                    let tPrev = 0;
                    for (let s = 0; s < STEPS; s++) {
                        const tE = tMax * Math.pow((s + 1) / STEPS, 2);
                        const tM = tMax * Math.pow((s + 0.5) / STEPS, 2);
                        const dt = tE - tPrev;
                        tPrev = tE;
                        const px = vx * tM,
                            py = r + vy * tM,
                            pz = vz * tM;
                        const ri = Math.sqrt(px * px + py * py + pz * pz);
                        dichte(A, ri - RG, m);
                        const muS = (px * sx + py * sy) / ri;
                        transmittance(TL, ri, muS, Ts);
                        for (let c = 0; c < 3; c++) {
                            const e = m.ext[c];
                            const tr = Math.exp(-e * dt);
                            const integ = e > 0 ? (1 - tr) / e : dt;
                            L[c] += thr[c] * m.sca[c] * pu * Ts[c] * integ;
                            F[c] += thr[c] * m.sca[c] * integ;
                            thr[c] *= tr;
                        }
                    }
                    if (boden) {
                        const gx = vx * tMax,
                            gy = r + vy * tMax,
                            gz = vz * tMax;
                        const gr = Math.sqrt(gx * gx + gy * gy + gz * gz);
                        const nl = Math.max(0, (gx * sx + gy * sy) / gr);
                        transmittance(TL, gr, nl, Ts);
                        for (let c = 0; c < 3; c++) L[c] += thr[c] * Ts[c] * nl * (A.albedo[c] / Math.PI);
                    }
                    for (let c = 0; c < 3; c++) {
                        Lsum[c] += L[c];
                        Fsum[c] += F[c];
                    }
                }
            }
            const n = NDMU * NDPHI;
            const k = (j * NMUS + i) * 3;
            for (let c = 0; c < 3; c++) {
                const L2 = Lsum[c] / n; // ∫ L p_u dω (Gl. 6), p_u steckt im Marsch
                const fms = Fsum[c] / n; // ∫ f_ms p_u dω × 4π … (Gl. 7): Mittel über die Kugel
                lut[k + c] = L2 / (1 - fms); // Gl. 9
            }
        }
    }
    return { lut, NMUS, NH };
}
function mehrfach(ML, h, mus, out) {
    const fi = Math.max(0, Math.min(1, (mus + 1) / 2)) * (ML.NMUS - 1);
    const fj = Math.max(0, Math.min(1, h / (RT - RG))) * (ML.NH - 1);
    const i0 = Math.min(ML.NMUS - 2, Math.floor(fi));
    const j0 = Math.min(ML.NH - 2, Math.floor(fj));
    const a = fi - i0;
    const b = fj - j0;
    const L = ML.lut;
    for (let c = 0; c < 3; c++) {
        const v00 = L[(j0 * ML.NMUS + i0) * 3 + c];
        const v10 = L[(j0 * ML.NMUS + i0 + 1) * 3 + c];
        const v01 = L[((j0 + 1) * ML.NMUS + i0) * 3 + c];
        const v11 = L[((j0 + 1) * ML.NMUS + i0 + 1) * 3 + c];
        out[c] = (v00 * (1 - a) + v10 * a) * (1 - b) + (v01 * (1 - a) + v11 * a) * b;
    }
    return out;
}

// ---------- Phasen ----------
const phaseR = (nu) => (3 / (16 * Math.PI)) * (1 + nu * nu);
function phaseM(A, nu) {
    const g = A.g;
    if (A.phase === "cs") {
        const k = ((3 / (8 * Math.PI)) * (1 - g * g)) / (2 + g * g);
        return (k * (1 + nu * nu)) / Math.pow(1 + g * g - 2 * g * nu, 1.5);
    }
    return (1 - g * g) / (4 * Math.PI * Math.pow(1 + g * g - 2 * g * nu, 1.5));
}

// ---------- der Sky-View-Marsch: Leuchtdichte des Himmels in Richtung v vom Auge ----------
function himmelL(A, TL, ML, r0, v, sun, STEPS, out) {
    const m = neuMedium();
    const Ts = [0, 0, 0];
    const Ps = [0, 0, 0];
    const mu = v[1];
    const tB = zumBoden(r0, mu);
    const tMax = tB >= 0 ? tB : zumRand(r0, mu);
    const nu = v[0] * sun[0] + v[1] * sun[1] + v[2] * sun[2];
    const pR = phaseR(nu);
    const pM = phaseM(A, nu);
    const thr = [1, 1, 1];
    out[0] = out[1] = out[2] = 0;
    let tPrev = 0;
    for (let s = 0; s < STEPS; s++) {
        const tE = tMax * Math.pow((s + 1) / STEPS, 2);
        const tM = tMax * Math.pow((s + 0.5) / STEPS, 2);
        const dt = tE - tPrev;
        tPrev = tE;
        const px = v[0] * tM,
            py = r0 + v[1] * tM,
            pz = v[2] * tM;
        const ri = Math.sqrt(px * px + py * py + pz * pz);
        const hi = ri - RG;
        dichte(A, hi, m);
        const muS = (px * sun[0] + py * sun[1] + pz * sun[2]) / ri;
        transmittance(TL, ri, muS, Ts);
        mehrfach(ML, hi, muS, Ps);
        for (let c = 0; c < 3; c++) {
            const e = m.ext[c];
            const tr = Math.exp(-e * dt);
            const integ = e > 0 ? (1 - tr) / e : dt;
            const S = Ts[c] * (m.sR[c] * pR + m.sM[c] * pM) + Ps[c] * m.sca[c];
            out[c] += thr[c] * S * integ;
            thr[c] *= tr;
        }
    }
    return out;
}

// ---------- die Bilanz an der Karte ----------
function bilanz(A, opts) {
    const q = opts.schnell
        ? { tmu: 256, tr: 64, tst: 200, mmus: 32, mh: 32, mdmu: 8, mdphi: 16, mst: 32, sth: 90, sph: 180, sst: 64 }
        : { tmu: 512, tr: 128, tst: 400, mmus: 32, mh: 32, mdmu: 16, mdphi: 32, mst: 48, sth: 180, sph: 360, sst: 128 };
    const TL = transmittanceLut(A, q.tmu, q.tr, q.tst);
    const ML = mehrfachLut(A, TL, q.mmus, q.mh, q.mdmu, q.mdphi, q.mst);
    const mus = opts.mu;
    const sun = [Math.sqrt(1 - mus * mus), mus, 0];
    const r0 = RG + A.h0;
    const Tsun = transmittance(TL, r0, mus, [0, 0, 0]);
    const Esonne = Tsun.map((t) => t * mus); // E0 = 1 je Kanal (Hillaire: Sonne weiß), waagrecht
    const Ehimmel = [0, 0, 0];
    const Ezur = [0, 0, 0]; // senkrechte Karte, Normale zur Sonne (Azimut)
    const Evon = [0, 0, 0]; // senkrechte Karte, Normale von der Sonne weg
    const L = [0, 0, 0];
    const dth = Math.PI / 2 / q.sth;
    const dph = (2 * Math.PI) / q.sph;
    let zenitL = null;
    for (let a = 0; a < q.sth; a++) {
        const th = (a + 0.5) * dth;
        const ct = Math.cos(th),
            st = Math.sin(th);
        for (let b = 0; b < q.sph; b++) {
            const ph = (b + 0.5) * dph;
            const v = [st * Math.cos(ph), ct, st * Math.sin(ph)];
            himmelL(A, TL, ML, r0, v, sun, q.sst, L);
            const dw = st * dth * dph;
            const nz = v[0]; // Azimut der Sonne liegt auf +x
            for (let c = 0; c < 3; c++) {
                Ehimmel[c] += L[c] * ct * dw;
                if (nz > 0) Ezur[c] += L[c] * nz * dw;
                else Evon[c] += L[c] * -nz * dw;
            }
        }
    }
    zenitL = himmelL(A, TL, ML, r0, [0, 1, 0], sun, q.sst, [0, 0, 0]);
    const Y = (x) => LUMA[0] * x[0] + LUMA[1] * x[1] + LUMA[2] * x[2];
    const eS = Y(Esonne),
        eH = Y(Ehimmel);
    // die senkrechten Karten: Himmel allein; dazu der Lambert-Boden (Albedo A.albedo) aus der unteren Halbkugel
    const bodenVert = (Y(A.albedo) / 2) * (eS + eH);
    return {
        mu: mus,
        T_sonne: Tsun.map((x) => +x.toFixed(4)),
        E_sonne_rgb: Esonne.map((x) => +x.toFixed(5)),
        E_himmel_rgb: Ehimmel.map((x) => +x.toFixed(5)),
        E_sonne: +eS.toFixed(5),
        E_himmel: +eH.toFixed(5),
        diffusAnteil: +(eH / (eS + eH)).toFixed(4),
        lichtVerhaeltnis: +((eS + eH) / eH).toFixed(3),
        himmelFarbe_rgb: Ehimmel.map((x) => +(x / Math.max(...Ehimmel)).toFixed(3)),
        zenit_L_rgb: zenitL.map((x) => +x.toFixed(5)),
        umgebungAzimut_himmel: +(Y(Ezur) / Y(Evon)).toFixed(3),
        umgebungAzimut_mitBoden: +((Y(Ezur) + bodenVert) / (Y(Evon) + bodenVert)).toFixed(3),
    };
}

// ---------- Lauf ----------
function main() {
    const argv = process.argv.slice(2);
    const opt = (n, d) => {
        const i = argv.indexOf(n);
        return i >= 0 ? argv[i + 1] : d;
    };
    const schnell = argv.includes("--schnell");
    const mu = Number(opt("--mu", "0.962")); // sonnenRichtung.y der Messung (soll-tafel himmel-licht, 15.10.)
    const aus = opt("--aus", null);
    const W = weltGesetz();
    // die Höhe der Karte über dem Bezug der Luft (bezugY = waterLevel, 24.js): die Mess-Wiese −278/−1038 (K55) am Gesetz
    // (welt-orte `wirtAmGesetz`), die Karte 45 m über dem Boden (`__lichtBilanz`)
    const wirt = require("./lib/welt-orte.cjs").wirtAmGesetz(path.join(__dirname, ".."));
    const bodenY = wirt._terrainMacroSurfaceY(-278, -1038);
    const h0 = Number(opt("--h0", String(bodenY + 45 - wirt.state.waterLevel)));
    const welt = {
        rayleighZenitTiefe: W.rayleighZenitTiefe,
        mieExt550: W.aerosolBetaBoden,
        HM: W.aerosolSkalenHoehe,
        h0,
        albedo: W.bodenAlbedo,
    };
    const hillaire = {
        rayleighZenitTiefe: [5.802e-6 * 8000, 13.558e-6 * 8000, 33.1e-6 * 8000],
        mieExt550: 4.44e-6,
        HM: 1200,
        h0,
    };
    const faelle = [
        [
            "welt (RAYLEIGH_BETA + LUFT 20 km/1 km + Boden der Albedo-Tafel; Hillaire g 0,8 · Ozon; Karte an der Mess-Wiese)",
            welt,
        ],
        ["welt, Boden grau 0,3 (Hillaire-Vorgabe)", Object.assign({}, welt, { albedo: 0.3 })],
        ["welt, Boden grau 0,1", Object.assign({}, welt, { albedo: 0.1 })],
        ["welt, Mie Cornette-Shanks", Object.assign({}, welt, { phase: "cs" })],
        ["welt, Mie g 0,7", Object.assign({}, welt, { g: 0.7 })],
        ["welt, Aerosol Ångström α 1,3", Object.assign({}, welt, { angstroem: 1.3 })],
        ["welt, Karte auf dem Bezug (0 m)", Object.assign({}, welt, { h0: 0 })],
        ["welt, Karte 300 m über dem Bezug", Object.assign({}, welt, { h0: 300 })],
        ["welt, Sicht 40 km", Object.assign({}, welt, { mieExt550: 3.912 / 40000 - W.luft.betaRayleigh })],
        ["welt, Sicht 10 km", Object.assign({}, welt, { mieExt550: 3.912 / 10000 - W.luft.betaRayleigh })],
        ["Hillaire-Vorgabe (Bruneton-Erde, Aerosol-Tiefe 0,0053)", hillaire],
    ];
    const nurErster = argv.includes("--nur-welt");
    const t0 = Date.now();
    const erg = {
        werkzeug: "diag-atmo-hillaire (Spike D3, offline)",
        datum: new Date().toISOString(),
        soll: [5, 12.5],
        heute: 4.226,
        weltGesetz: {
            rayleighZenitTiefe: W.rayleighZenitTiefe,
            luft: W.luft,
            betaSonnig: +W.betaSonnig.toExponential(4),
            aerosolBetaBoden: +W.aerosolBetaBoden.toExponential(4),
            aerosolTiefe550: +(W.aerosolBetaBoden * W.aerosolSkalenHoehe).toFixed(4),
            bodenAlbedo: W.bodenAlbedo.map((x) => +x.toFixed(4)),
        },
        h0: +h0.toFixed(1),
        aufloesung: schnell ? "schnell" : "voll",
        faelle: [],
    };
    for (const [name, o] of nurErster ? faelle.slice(0, 1) : faelle) {
        const t = Date.now();
        const A = atmosphaere(o);
        const b = bilanz(A, { mu, schnell });
        b.fall = name;
        b.ms = Date.now() - t;
        erg.faelle.push(b);
        console.log(
            `${name}: lichtVerhaeltnis ${b.lichtVerhaeltnis} (Diffus-Anteil ${b.diffusAnteil}) · E Sonne ${b.E_sonne} · E Himmel ${b.E_himmel} · Azimut ${b.umgebungAzimut_himmel}/${b.umgebungAzimut_mitBoden} · ${b.ms} ms`
        );
    }
    // DIE SICHT, die das Soll trägt: dieselbe Rechnung über die klare Sicht der Luft (`LUFT.sichtKlarM`), schnell aufgelöst
    if (!nurErster) {
        erg.sichtReihe = [];
        for (const km of [10, 15, 20, 25, 30, 40, 60, 100, 200]) {
            const o = Object.assign({}, welt, { mieExt550: Math.max(0, 3.912 / (km * 1000) - W.luft.betaRayleigh) });
            const b = bilanz(atmosphaere(o), { mu, schnell: true });
            erg.sichtReihe.push({
                sichtKm: km,
                aerosolTiefe550: +(o.mieExt550 * o.HM).toFixed(4),
                lichtVerhaeltnis: b.lichtVerhaeltnis,
                diffusAnteil: b.diffusAnteil,
            });
            console.log(`Sicht ${km} km: lichtVerhaeltnis ${b.lichtVerhaeltnis}`);
        }
    }
    erg.ms = Date.now() - t0;
    if (aus) {
        fs.mkdirSync(path.dirname(aus), { recursive: true });
        fs.writeFileSync(aus, JSON.stringify(erg, null, 2));
        console.log("Rohdatei:", aus);
    }
}
// ---------- DIE ZWEITE ZAHL: C*ab der Klasse im Ausgabe-Bild (`werkbank bild … --klasse`, Bild + <datei>.maske.png) ----------
// Die Maske mischt je Klassen-Pixel 0,6·Bild + 0,4·Ton (werkbank.cjs, `ton`), der Rest ist Grau mit B + 40: ein Pixel gehört
// der Klasse, wenn die Maske dort genau den Mischwert eines Tons trägt. C*ab des Mittels (linear gemittelt, dann Lab) und
// der Median je Pixel.
function cabAuswerten(datei) {
    const { pngLesen } = require("./lib/abnahme-urteil.cjs");
    const bild = pngLesen(fs.readFileSync(datei));
    const maske = pngLesen(fs.readFileSync(datei.replace(/\.png$/i, "") + ".maske.png"));
    if (bild.W !== maske.W || bild.H !== maske.H) throw new Error("Bild und Maske ungleich groß");
    const TON = [
        [255, 80, 80],
        [80, 255, 80],
        [80, 120, 255],
        [255, 220, 60],
        [255, 80, 255],
        [60, 230, 230],
        [255, 150, 40],
        [180, 120, 255],
    ];
    const lin = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
    const lab = (c) => {
        const X = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047,
            Y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2],
            Z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
        const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
    };
    const B = bild.u8,
        M = maske.u8;
    const s = [0, 0, 0];
    const cs = [];
    let n = 0;
    for (let p = 0; p < bild.W * bild.H; p++) {
        const i = p * 4;
        let drin = false;
        for (const f of TON) {
            let ok = true;
            for (let ch = 0; ch < 3 && ok; ch++)
                ok = Math.abs(M[i + ch] - Math.round(0.6 * B[i + ch] + 0.4 * f[ch])) <= 1;
            if (ok) {
                drin = true;
                break;
            }
        }
        if (!drin) continue;
        const c = [lin(B[i]), lin(B[i + 1]), lin(B[i + 2])];
        for (let ch = 0; ch < 3; ch++) s[ch] += c[ch];
        const L = lab(c);
        cs.push(Math.hypot(L[1], L[2]));
        n++;
    }
    if (!n) return { datei, pixel: 0 };
    const m = lab(s.map((v) => v / n));
    cs.sort((a, b) => a - b);
    return {
        datei,
        pixel: n,
        L: +m[0].toFixed(1),
        a: +m[1].toFixed(1),
        b: +m[2].toFixed(1),
        cabMittel: +Math.hypot(m[1], m[2]).toFixed(1),
        cabMedian: +cs[Math.floor(n / 2)].toFixed(1),
    };
}

// ---------- KURVE GEGEN ALBEDO (offline, am Ausgabe-Bild): ACES r184 umkehren, AgX/Neutral (r184) neu anlegen ----------
// Die Ausgabe ist sRGB(ACES(x)), x = die gegradete Szene mal Belichtung (25c.js: Sättigung 1,18 · Kontrast 1,06 um 0,5 ·
// Entgrauen 0,35 bis 0,16; danach macht die Pipeline ACES + sRGB). ACES r184 (vendor/three.webgpu.min.js `acesFilmicToneMapping`:
// mat3 aus 9 Zahlen = Matrix3 zeilenweise; der Fit b = v·(v+0,432951)·0,983729 + 0,238081) ist je Kanal monoton und wird
// exakt umgekehrt; Pixel mit einem Kanal auf 255 (geklemmt) zählen nicht. Dann AgX und Neutral (r184, dieselbe Belichtung)
// und das Grading zurückgerechnet (Neutral ohne Grading = was Licht und Albedo allein tragen).
const mat = (r) => r; // Zeilen
const mulM = (M, v) => [0, 1, 2].map((i) => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);
const ausSpalten = (c0, c1, c2) => [0, 1, 2].map((i) => [c0[i], c1[i], c2[i]]);
function inv3(m) {
    const [a, b, c] = m[0],
        [d, e, f] = m[1],
        [g, h, i] = m[2];
    const A = e * i - f * h,
        B = -(d * i - f * g),
        C = d * h - e * g;
    const det = a * A + b * B + c * C;
    return [
        [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
        [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
        [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
    ];
}
const ACES_IN = mat([
    [0.59719, 0.35458, 0.04823],
    [0.076, 0.90834, 0.01566],
    [0.0284, 0.13383, 0.83777],
]);
const ACES_OUT = mat([
    [1.60475, -0.53108, -0.07367],
    [-0.10208, 1.10813, -0.00605],
    [-0.00327, -0.07276, 1.07602],
]);
const ACES_IN_INV = inv3(ACES_IN),
    ACES_OUT_INV = inv3(ACES_OUT);
const acesFit = (v) => (v * (v + 0.0245786) - 0.000090537) / (v * ((v + 0.432951) * 0.983729) + 0.238081);
function acesFitInv(a) {
    const A = 1 - 0.983729 * a,
        B = 0.0245786 - 0.432951 * 0.983729 * a,
        C = -(0.000090537 + 0.238081 * a);
    return (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A);
}
const acesTm = (x) =>
    mulM(
        ACES_OUT,
        mulM(
            ACES_IN,
            x.map((v) => v / 0.6)
        ).map(acesFit)
    ).map((v) => Math.min(1, Math.max(0, v)));
const acesTmInv = (y) => mulM(ACES_IN_INV, mulM(ACES_OUT_INV, y).map(acesFitInv)).map((v) => v * 0.6);
const SRGB_2020 = ausSpalten([0.6274, 0.0691, 0.0164], [0.3293, 0.9195, 0.088], [0.0433, 0.0113, 0.8956]);
const R2020_SRGB = ausSpalten([1.6605, -0.1246, -0.0182], [-0.5876, 1.1329, -0.1006], [-0.0728, -0.0083, 1.1187]);
const AGX_IN = ausSpalten(
    [0.856627153315983, 0.137318972929847, 0.11189821299995],
    [0.0951212405381588, 0.761241990602591, 0.0767994186031903],
    [0.0482516061458583, 0.101439036467562, 0.811302368396859]
);
const AGX_OUT = ausSpalten(
    [1.1271005818144368, -0.1413297634984383, -0.14132976349843826],
    [-0.11060664309660323, 1.157823702216272, -0.11060664309660294],
    [-0.016493938717834573, -0.016493938717834257, 1.2519364065950405]
);
const agxKontrast = (t) => {
    const r = t * t,
        s = r * r;
    return 15.5 * s * r - 40.14 * s * t + 31.96 * s - 6.868 * r * t + 0.4298 * r + 0.1191 * t - 0.00232;
};
function agxTm(x) {
    let c = mulM(AGX_IN, mulM(SRGB_2020, x));
    c = c.map((v) => Math.min(1, Math.max(0, (Math.log2(Math.max(v, 1e-10)) + 12.47393) / (4.026069 + 12.47393))));
    c = c.map(agxKontrast);
    c = mulM(AGX_OUT, c).map((v) => Math.pow(Math.max(0, v), 2.2));
    return mulM(R2020_SRGB, c).map((v) => Math.min(1, Math.max(0, v)));
}
function neutralTm(x) {
    let c = x.slice();
    const xmin = Math.min(...c);
    const off = xmin < 0.08 ? xmin - 6.25 * xmin * xmin : 0.04;
    c = c.map((v) => v - off);
    const peak = Math.max(...c);
    if (peak < 0.76) return c.map((v) => Math.min(1, Math.max(0, v)));
    const d = 1 - 0.76;
    const np = 1 - (d * d) / (peak + d - 0.76);
    c = c.map((v) => (v * np) / peak);
    const g = 1 - 1 / (0.15 * (peak - np) + 1);
    return c.map((v) => Math.min(1, Math.max(0, v * (1 - g) + np * g)));
}
const Ylin = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
// das Grading von 25c.js zurück (Entgrauen per Fixpunkt, Kontrast, Sättigung); Bloom, Godrays und lokaler Kontrast bleiben
function gradingZurueck(d) {
    let c = d.slice();
    for (let k = 0; k < 12; k++) {
        const gs = Math.max(...c) - Math.min(...c);
        const t = Math.max(0, Math.min(1, (gs - 0.16) / (0 - 0.16)));
        const w = t * t * (3 - 2 * t) * 0.35;
        const L = Ylin(c);
        const warm = [L * 1.14, L, L * 0.82];
        c = d.map((v, i) => (v - w * warm[i]) / (1 - w));
    }
    const sat = c.map((v) => (v - 0.5) / 1.06 + 0.5);
    const L = Ylin(sat);
    return sat.map((v) => L + (v - L) / 1.18);
}
function kurveAuswerten(datei) {
    const { pngLesen } = require("./lib/abnahme-urteil.cjs");
    const bild = pngLesen(fs.readFileSync(datei));
    const maske = pngLesen(fs.readFileSync(datei.replace(/\.png$/i, "") + ".maske.png"));
    const TON = [
        [255, 80, 80],
        [80, 255, 80],
        [80, 120, 255],
        [255, 220, 60],
        [255, 80, 255],
        [60, 230, 230],
        [255, 150, 40],
        [180, 120, 255],
    ];
    const dec = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
    const lab = (c) => {
        const X = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047,
            Y = Ylin(c),
            Z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
        const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
    };
    const B = bild.u8,
        M = maske.u8;
    const xs = [];
    let geklemmt = 0,
        rueckFehler = 0;
    for (let p = 0; p < bild.W * bild.H; p++) {
        const i = p * 4;
        let drin = false;
        for (const f of TON) {
            let ok = true;
            for (let ch = 0; ch < 3 && ok; ch++)
                ok = Math.abs(M[i + ch] - Math.round(0.6 * B[i + ch] + 0.4 * f[ch])) <= 1;
            if (ok) {
                drin = true;
                break;
            }
        }
        if (!drin) continue;
        if (B[i] === 255 || B[i + 1] === 255 || B[i + 2] === 255) {
            geklemmt++;
            continue;
        }
        const y = [dec(B[i]), dec(B[i + 1]), dec(B[i + 2])];
        const x = acesTmInv(y);
        const z = acesTm(x);
        rueckFehler = Math.max(rueckFehler, Math.abs(z[0] - y[0]), Math.abs(z[1] - y[1]), Math.abs(z[2] - y[2]));
        xs.push(x);
    }
    const auswerten = (fn, k = 1, schritt = 1) => {
        const s = [0, 0, 0];
        const cs = [];
        for (let j = 0; j < xs.length; j += schritt) {
            const x = xs[j];
            const o = fn(x.map((v) => v * k));
            for (let c = 0; c < 3; c++) s[c] += o[c];
            const L = lab(o);
            cs.push(Math.hypot(L[1], L[2]));
        }
        cs.sort((a, b) => a - b);
        const m = lab(s.map((v) => v / cs.length));
        return {
            L: +m[0].toFixed(1),
            cabMittel: +Math.hypot(m[1], m[2]).toFixed(1),
            cabMedian: +cs[cs.length >> 1].toFixed(1),
        };
    };
    // dieselbe Helligkeit: die Belichtung, die L* des Klassen-Mittels auf das von ACES legt (Bisektion in log2)
    const gleichL = (fn, Lziel) => {
        let lo = -4,
            hi = 4;
        for (let k = 0; k < 30; k++) {
            const mid = (lo + hi) / 2;
            if (auswerten(fn, Math.pow(2, mid), 9).L < Lziel) lo = mid;
            else hi = mid;
        }
        return Math.pow(2, (lo + hi) / 2);
    };
    const roh = xs.map(gradingZurueck);
    const ohneGrading = (fn) => (x) => fn(gradingZurueck(x));
    const aces = auswerten(acesTm);
    const kAgx = gleichL(agxTm, aces.L),
        kNeu = gleichL(neutralTm, aces.L),
        kNeuRoh = gleichL(ohneGrading(neutralTm), aces.L);
    return {
        datei,
        pixel: xs.length,
        geklemmt,
        rueckFehlerMax: +rueckFehler.toExponential(2),
        aces,
        acesOhneGrading: auswerten(ohneGrading(acesTm)),
        agx: auswerten(agxTm),
        neutral: auswerten(neutralTm),
        agxGleichL: Object.assign({ belichtung: +kAgx.toFixed(3) }, auswerten(agxTm, kAgx)),
        neutralGleichL: Object.assign({ belichtung: +kNeu.toFixed(3) }, auswerten(neutralTm, kNeu)),
        neutralOhneGradingGleichL: Object.assign(
            { belichtung: +kNeuRoh.toFixed(3) },
            auswerten(ohneGrading(neutralTm), kNeuRoh)
        ),
        szeneMittel: lab(roh.reduce((s, c) => s.map((v, i) => v + c[i] / roh.length), [0, 0, 0])).map(
            (v) => +v.toFixed(1)
        ),
    };
}

if (require.main === module) {
    const i = process.argv.indexOf("--cab");
    const k = process.argv.indexOf("--kurve");
    if (i >= 0) for (const d of process.argv.slice(i + 1)) console.log(JSON.stringify(cabAuswerten(d)));
    else if (k >= 0) {
        const aus = [];
        for (const d of process.argv.slice(k + 1).filter((a) => !a.startsWith("--") && /\.png$/i.test(a))) {
            const e = kurveAuswerten(d);
            aus.push(e);
            console.log(JSON.stringify(e));
        }
        const ai = process.argv.indexOf("--aus");
        if (ai >= 0) fs.writeFileSync(process.argv[ai + 1], JSON.stringify(aus, null, 2));
    } else main();
}
module.exports = { atmosphaere, transmittanceLut, mehrfachLut, himmelL, bilanz, weltGesetz, RG, RT };
