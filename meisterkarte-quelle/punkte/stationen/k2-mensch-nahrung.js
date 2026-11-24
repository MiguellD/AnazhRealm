// DIE RICHTER-STATIONEN DER PERSPEKTIVE nahrung (Meisterkarte 2, Kapitel mensch; die Fabrik ist k2-mensch.js, ihr Kopf das Gesetz):
// je Leiter EINE Probe am Messort dorf, die jede Sprosse mit derselben Messung an ihrem Umfang misst. Gemessen wird am ERGEBNIS der
// Welt: die gemalten Äcker der Pläne (`_wegeBelagAt` Kanal acker) und ihr Bild aus der Pose am Feldweg, die Pflanzen der Nah-Streu und
// Nah-Wiese im Acker, ein gebundenes Tier über dem Hang gegen ein ungebundenes, die gezeichneten Wasser-Flächen am Acker (der Leser
// von gelaende.K2#1), die Bewohner nach dem Gesetz des Tags (`_bewohnerSoll`), die Pflanze, die der Spieler pflückt, und ihr Nachwuchs
// in geraffter Welt-Zeit. Was die Welt nicht trägt, urteilt die Probe beim Namen: „Umfang nicht erzeugbar“ mit dem gemessenen Umfang,
// „fehlender Leser“ mit der Stelle im Spiel-Baum. Die Seiten-Funktionen sehen nichts aus diesem Modul (sie reisen als Text).
"use strict";

const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";
const SIEDLUNG = ["stamm/siedlung-bewohner.js", "stamm/siedlung-wege.js", "fachwerk-core.js", "koerper-core.js"];
const { FAECHER } = require("./faecher.js");

// DER TAG DER BEWOHNER AN EINER ADRESSE (mensch.nahrung.tier#2, das Gesetz des Fächers, stationen/faecher.js): an der Saat a.saat der
// Plan des Dorfs, wie der Faden ihn baut (fachwerk `exportSettlement`, die Epoche der Saat; ~1 s je Saat, darum je Saat einmal im
// `mit` des Fächers gehalten), seine Orte nach dem Gesetz des Tags (koerper-core `tagesOrte`), und zur Stunde a.zeit je Slot der Plan
// seines Bewohners (koerper-core `tagesPlan` — derselbe Ruf wie der Wirt, stamm/siedlung-bewohner.js:2239): gezählt, wer zur Jagd oder
// zum Fischen geht (Tat, Ort oder Rolle: Jagd, Wild, Fisch)
const JAGD_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore, KC = window.__koerperCore;
    if (!FC || !KC || typeof KC.tagesPlan !== "function" || typeof KC.tagesOrte !== "function") return { fehlt: "der Kern trägt kein Gesetz des Tags (koerper-core tagesPlan / tagesOrte)" };
    const halt = (mit.plaene = mit.plaene || {});
    if (!halt[a.saat]) halt[a.saat] = KC.tagesOrte(FC.exportSettlement({ seed: a.saat, nH: mit.nH, epoche: FC.siedlungsEpoche(a.saat) }));
    const orte = halt[a.saat];
    const JAGD = /jag|jagd|fisch|angel|wild|beute/i;
    let jagd = 0, bewohner = 0;
    const taten = {};
    for (const o of orte) {
        if (o.slot == null) continue;
        bewohner++;
        const p = KC.tagesPlan(a.saat * 1000 + o.slot, o.art, a.zeit, orte);
        taten[p.akt] = (taten[p.akt] || 0) + 1;
        if (JAGD.test(String(p.akt)) || JAGD.test(String(p.wo)) || JAGD.test(String(o.art))) jagd++;
    }
    return { jagd, bewohner, taten, rollen: [...new Set(orte.map((o) => o.art))].join(",") };
};

// DER TAG EINER SIEDLUNG AM GESETZ (strom#2 und hand#3, das Gesetz des Fächers, stationen/faecher.js): an der Saat a.saat in der Größe
// a.ort (fachwerk `GROESSE_N`: dorf 12 · stadt 36 · grossstadt 90 · metropole 220 Häuser) der Plan, wie der Faden ihn baut (fachwerk
// `exportSettlement`, die Epoche der Saat; je Adresse einmal im `mit` gehalten), seine Bewohner, wie der Wirt sie zählt
// (stamm/siedlung-bewohner.js:1074 je Slot `leuteVon`, :1083 der Same `_rollGenome(…, "bewohner").axis("tag")`, :1088 das Kind aus
// `_bewohnerJahre` — der Genom-Roller des Wirts, nie nachgerechnet), ihre Bindung (koerper-core `tagesOrte` · `tagesBindung`, der
// Beruf wie :1123) und zur Stunde a.zeit ihr Plan (`tagesPlan`, derselbe Ruf wie `_bewohnerSoll`, :2637): gezählt, wer draußen beim
// Mahl sitzt und an welchem Tisch, wer am Acker arbeitet und an welchem
const TAG_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore, KC = window.__koerperCore, TC = globalThis.__tetrapodaCore;
    if (!FC || !KC || !TC || typeof KC.tagesPlan !== "function" || typeof KC.tagesOrte !== "function" || typeof KC.tagesBindung !== "function" || typeof FC.exportSettlement !== "function")
        return { fehlt: "der Kern trägt kein Gesetz des Tags (koerper-core tagesPlan · tagesOrte · tagesBindung, fachwerk exportSettlement)" };
    if (!r || typeof r._rollGenome !== "function" || typeof r._bewohnerJahre !== "function") return { fehlt: "die Welt trägt den Genom-Roller des Wirts nicht (_rollGenome · _bewohnerJahre)" };
    const nH = FC.GROESSE_N && FC.GROESSE_N[a.ort];
    if (!(nH > 0)) return { fehlt: "keine Größe „" + a.ort + "“ in fachwerk GROESSE_N" };
    const halt = (mit.tag = mit.tag || {});
    const key = a.saat + "@" + a.ort;
    if (!halt[key]) {
        const P = FC.exportSettlement({ seed: a.saat, nH, epoche: FC.siedlungsEpoche(a.saat) });
        const orte = KC.tagesOrte(P);
        const ortVon = new Map(orte.map((o, i) => [o.slot, i]));
        const platz = orte.find((o) => o.art === "platz") || null;
        const leute = [];
        P.slots.forEach((sl, si) => {
            const n = FC.leuteVon(sl.ov);
            const rolle0 = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            const heimI = ortVon.get(si);
            for (let k = 0; k < n; k++) {
                const wort = (P.seed >>> 0) + ":" + si + ":" + k;
                const same = Math.floor(r._rollGenome(wort, "bewohner").axis("tag") * 4294967296) >>> 0;
                const kind = r._bewohnerJahre(r._rollGenome(wort, "humanoid"), { jahr: P.jahr, rang: k, n }) < KC.ALTER_GESETZ.kindJ;
                const rolle = kind ? "kind" : rolle0;
                const B = KC.tagesBindung(TC, same, rolle, heimI, orte, null, null);
                const am = (i, wo) => (i < 0 || (i === heimI && wo !== "werk") ? null : orte[i]);
                const werk = B.werk < 0 ? null : B.werk === heimI ? (rolle === "wohnhaus" ? null : orte[heimI]) : orte[B.werk];
                const wA = werk && B.werk !== heimI ? orte[B.werk].art : rolle;
                const beruf = kind ? "kind" : !werk ? "hof" : wA === "platz" ? "markt" : wA;
                leute.push({ same, rolle, beruf, orte: { heim: orte[heimI], werk, platz, mahl: am(B.mahl, "mahl"), abend: am(B.abend, "abend"), besuch: am(B.besuch, "besuch") } });
            }
        });
        halt[key] = { leute, felder: (P.felder || []).length, slots: P.slots.length, region: P.region };
    }
    const D = halt[key];
    let mahl = 0, draussen = 0, amAcker = 0, bauern = 0;
    const wo = {}, tisch = new Map(), acker = new Map();
    for (const b of D.leute) {
        const p = KC.tagesPlan(b.same, b.rolle, a.zeit, b.orte, 0, false);
        if (b.beruf === "feld") bauern++;
        if (p.akt === "mittag") {
            mahl++;
            if (!p.drinnen && p.ort) {
                draussen++;
                wo[p.ort.art] = (wo[p.ort.art] || 0) + 1;
                tisch.set(p.ort, (tisch.get(p.ort) || 0) + 1);
            }
        }
        if (p.akt === "arbeit" && !p.drinnen && p.ort && p.ort.art === "feld") {
            amAcker++;
            acker.set(p.ort, (acker.get(p.ort) || 0) + 1);
        }
    }
    const best = (M) => [...M.entries()].reduce((x, e) => (!x || e[1] > x[1] ? e : x), null);
    const t = best(tisch), f = best(acker);
    // im Blick des Ackers mit den meisten (60 m, die Weite eines Bilds vom Feldrain): wer an einem Acker so nah arbeitet
    let nah = 0;
    if (f) for (const [o, n] of acker) if (Math.hypot(o.x - f[0].x, o.z - f[0].z) <= 60) nah += n;
    return {
        leute: D.leute.length, mahl, draussen, wo, amAcker, bauern, jeAcker: f ? f[1] : 0, nah60: nah, aecker: acker.size, felder: D.felder, slots: D.slots, region: D.region,
        tisch: t ? { art: t[0].art, x: +t[0].x.toFixed(1), z: +t[0].z.toFixed(1), n: t[1] } : null,
        acker: f ? { x: +f[0].x.toFixed(1), z: +f[0].z.toFixed(1), n: f[1] } : null,
    };
};

// DIE FLUR EINES PLANS (flur#2, das Gesetz des Fächers): an der Saat a.saat in der Größe a.ort der Plan des Fadens (fachwerk
// `exportSettlement`, sein Acker-Gesetz `dorfLayout`: 1–2 Äcker je Feldweg-Ende) — je Acker seine Fläche 4·ex·ez (die halben Kanten
// des Plans, dieselben, die stamm/siedlung-wege.js als Acker malt), ihre Summe und der Rahmen des Plans (`welt`)
const FLUR_AN = async (r, T, a) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.exportSettlement !== "function" || !FC.GROESSE_N) return { fehlt: "der Kern trägt keinen Plan der Siedlung (fachwerk exportSettlement · GROESSE_N)" };
    const nH = FC.GROESSE_N[a.ort];
    if (!(nH > 0)) return { fehlt: "keine Größe „" + a.ort + "“ in fachwerk GROESSE_N" };
    const P = FC.exportSettlement({ seed: a.saat, nH, epoche: FC.siedlungsEpoche(a.saat) });
    const m2 = (P.felder || []).filter((f) => f && Number.isFinite(f.ex) && Number.isFinite(f.ez)).map((f) => 4 * f.ex * f.ez);
    const summe = m2.reduce((s, x) => s + x, 0);
    const w = P.welt || {};
    return {
        felder: m2.length, km2: +(summe / 1e6).toFixed(6), m2: m2.map((x) => Math.round(x)), mittelM2: m2.length ? Math.round(summe / m2.length) : 0,
        maxM2: m2.length ? Math.round(Math.max(...m2)) : 0, ortKm2: Number.isFinite(w.x0) ? +(((w.x1 - w.x0) * (w.z1 - w.z0)) / 1e6).toFixed(4) : null, slots: P.slots.length, region: P.region,
    };
};

// DIE ROLLEN EINES ORTS (jenseits#1, das Gesetz des Fächers): an der Saat a.saat in der Größe a.ort die Rollen der Slots des Plans
// (fachwerk `exportSettlement`, die Rollen-Tafel `BAU_NUTZUNG` — der Leser: der Wirt liest `sl.rolle`, stamm/siedlung-bewohner.js:1076)
// und die Region der Saat (das Klima des Plans): gezählt Gewächshaus, Garten und die Wohnhäuser
const GARTEN_AN = async (r, T, a) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.exportSettlement !== "function" || !FC.GROESSE_N || !FC.BAU_NUTZUNG) return { fehlt: "der Kern trägt keinen Plan und keine Rollen-Tafel (fachwerk exportSettlement · BAU_NUTZUNG)" };
    const nH = FC.GROESSE_N[a.ort];
    if (!(nH > 0)) return { fehlt: "keine Größe „" + a.ort + "“ in fachwerk GROESSE_N" };
    const P = FC.exportSettlement({ seed: a.saat, nH, epoche: FC.siedlungsEpoche(a.saat) });
    const rollen = {};
    for (const sl of P.slots || []) {
        const ro = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
        rollen[ro] = (rollen[ro] || 0) + 1;
    }
    const zaehle = (re) => Object.keys(rollen).filter((k) => re.test(k)).reduce((s, k) => s + rollen[k], 0);
    const tafel = Object.keys(FC.BAU_NUTZUNG);
    return {
        rollen, region: P.region, slots: (P.slots || []).length, wohnhaus: rollen.wohnhaus || 0,
        gewaechshaus: zaehle(/gewaechs|glas|treib/i), garten: zaehle(/garten|beet/i), tafel: tafel.length, tafelGarten: tafel.filter((k) => /garten|beet|gewaechs|glas|treib/i.test(k)).length,
    };
};

// DER ZENSUS DER SIEDLUNG (jede Leiter der Perspektive): warten, bis die Siedlung am Messort ihre Bewohner trägt und nichts mehr offen
// ist (`__gebautNach`, wie g2 dorfZaehlung), dann je Plan die Äcker (Welt-OBB, Anteil gemalt innen und im Ring 2,5 m außen), die
// Rollen der Häuser, die Bewohner mit Beruf und Rolle, ihr Ziel um 10 und 12:30 Uhr nach dem Gesetz des Tags, Stände, Wagen, Tiere
const ZENSUS = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const offen = () => {
        const o = typeof r._weltOffen === "function" ? r._weltOffen() : {};
        return !o.leute && !o.leiber;
    };
    const alle = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan);
    await window.__gebautNach("die Siedlung am Messort (Zensus nahrung)", {
        fertig: () => alle().some((S) => Array.isArray(S.liste) && S.liste.length > 0) && offen(),
    });
    const SL = alle().sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    if (!SL.length) throw new Error("keine Siedlung mit Plan am Messort");
    const plus = (o, k) => (o[k] = (o[k] || 0) + 1);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const Z = {
        siedlungen: SL.length, bewohner: 0, berufe: {}, rollen: {}, slotRollen: {}, haeuser: 0, wagen: 0, fahrer: 0, staende: 0,
        maerkte: 0, feldwege: 0, felder: [], jahre: [], feld10: 0, mahl: 0, mahlMitte: null, garten: null, kreaturen: 0, zahm: 0,
        jaeger: 0, hirten: 0, spieler: { x: pm.x, z: pm.z }, nah: { ox: SL[0].ox, oz: SL[0].oz, name: SL[0].plan.name || null },
    };
    let mx = 0;
    let mz = 0;
    for (const S of SL) {
        const P = S.plan;
        if (Number.isFinite(P.jahr)) Z.jahre.push(P.jahr);
        for (const sl of P.slots || []) {
            Z.haeuser++;
            const ro = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            plus(Z.slotRollen, ro);
            if (!Z.garten && /garten|gewaechs|glas|treib|farm/i.test(ro)) Z.garten = { x: S.ox + sl.x, z: S.oz + sl.z, rolle: ro };
        }
        for (const b of Array.isArray(S.liste) ? S.liste : []) {
            Z.bewohner++;
            const wer = String(b.beruf) + " " + String(b.rolle);
            plus(Z.berufe, String(b.beruf));
            plus(Z.rollen, String(b.rolle));
            if (/jag|fisch|hirt/i.test(wer)) Z.jaeger++;
            if (/hirt/i.test(wer)) Z.hirten++;
            if (b.wagen) Z.fahrer++;
            const z10 = r._bewohnerSoll(b, 10);
            const z12 = r._bewohnerSoll(b, 12.5);
            if (b.beruf === "feld" && z10 && !z10.drinnen && z10.ziel) Z.feld10++;
            if (z12 && z12.akt === "mittag" && !z12.drinnen && z12.ziel) {
                Z.mahl++;
                mx += z12.ziel.x;
                mz += z12.ziel.z;
            }
        }
        Z.wagen += S.verkehr && Array.isArray(S.verkehr.wagen) ? S.verkehr.wagen.length : 0;
        const st = (P.staende || []).length;
        Z.staende += st;
        if (st > 0) Z.maerkte++;
        Z.feldwege += (P.feldwege || []).length;
        for (const fd of P.felder || []) {
            if (!fd || !Number.isFinite(fd.cx) || !Number.isFinite(fd.ex)) continue;
            const x = S.ox + fd.cx;
            const z = S.oz + fd.cz;
            const c = Math.cos(fd.phi || 0);
            const sn = Math.sin(fd.phi || 0);
            const pt = (u, v) => [x + u * c - v * sn, z + u * sn + v * c];
            let i = 0, ni = 0, a = 0, na = 0;
            for (let p = -2; p <= 2; p++)
                for (let q = -2; q <= 2; q++) {
                    const w = pt((p / 2.5) * fd.ex, (q / 2.5) * fd.ez);
                    ni++;
                    if (acker(w[0], w[1]) >= 0.5) i++;
                }
            for (const t of [-1, -0.5, 0, 0.5, 1])
                for (const uv of [[fd.ex + 2.5, t * fd.ez], [-(fd.ex + 2.5), t * fd.ez], [t * fd.ex, fd.ez + 2.5], [t * fd.ex, -(fd.ez + 2.5)]]) {
                    const w = pt(uv[0], uv[1]);
                    na++;
                    if (acker(w[0], w[1]) >= 0.5) a++;
                }
            Z.felder.push({ x: +x.toFixed(2), z: +z.toFixed(2), phi: fd.phi || 0, ex: fd.ex, ez: fd.ez, m2: +(4 * fd.ex * fd.ez).toFixed(1), gemalt: +(i / ni).toFixed(3), rand: +(a / na).toFixed(3) });
        }
    }
    if (Z.mahl) Z.mahlMitte = { x: mx / Z.mahl, z: mz / Z.mahl };
    const C = s.creatures || [];
    Z.kreaturen = C.length;
    Z.zahm = C.filter((c) => c && c.userData && (c.userData.bond || 0) >= 0.5).length;
    return Z;
};

// S1 der Flur: je Feldweg-Ende des nächsten Plans die Pose (Auge 1,7 m über dem Anfang des Feldwegs, Blick auf den Acker, die Kamera
// mit dem Sichtfeld des Spiels `KAM_FOV_GRAD`, 16:9) — ein Acker zählt, wenn er als FLÄCHE gemalt ist (innen ≥ 0,6 der Proben acker
// ≥ 0,5, im Ring 2,5 m außen ≤ 0,2: er hat eine Kante) und seine gemalten Zellen frei von Gelände und Grundriss ≥ 0,5 % des Bilds decken.
// Der Spieler steht danach an der besten Pose (dort schneidet die Sitzung den Preis)
const FLUR_BLICK = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const S = [...(r._bewohnerSiedlungen || new Map()).values()]
        .filter((x) => x && x.plan)
        .sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z))[0];
    if (!S) throw new Error("keine Siedlung am Messort");
    const P = S.plan;
    const h = (x, z) => r.getTerrainHeightAt(x, z);
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return a.acker || 0;
    };
    const F = (P.felder || [])
        .filter((fd) => fd && Number.isFinite(fd.cx) && Number.isFinite(fd.ex))
        .map((fd) => ({ x: S.ox + fd.cx, z: S.oz + fd.cz, c: Math.cos(fd.phi || 0), s: Math.sin(fd.phi || 0), ex: fd.ex, ez: fd.ez }));
    const pt = (f, u, v) => [f.x + u * f.c - v * f.s, f.z + u * f.s + v * f.c];
    const flaeche = (f) => {
        let i = 0, ni = 0, a = 0, na = 0;
        for (let p = -2; p <= 2; p++)
            for (let q = -2; q <= 2; q++) {
                const w = pt(f, (p / 2.5) * f.ex, (q / 2.5) * f.ez);
                ni++;
                if (acker(w[0], w[1]) >= 0.5) i++;
            }
        for (const t of [-1, -0.5, 0, 0.5, 1])
            for (const uv of [[f.ex + 2.5, t * f.ez], [-(f.ex + 2.5), t * f.ez], [t * f.ex, f.ez + 2.5], [t * f.ex, -(f.ez + 2.5)]]) {
                const w = pt(f, uv[0], uv[1]);
                na++;
                if (acker(w[0], w[1]) >= 0.5) a++;
            }
        return { innen: i / ni, rand: a / na };
    };
    const cam = new T.PerspectiveCamera(Number.isFinite(A.KAM_FOV_GRAD) ? A.KAM_FOV_GRAD : 60, 16 / 9, 0.1, 2000);
    const frei = (ax, ay, az, bx, by, bz) => {
        for (let k = 1; k < 24; k++) {
            const t = k / 24;
            const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
            if (h(x, z) > y + 0.05) return false;
            // nur ein Grundriss, der steht, verdeckt (pm-front-f1; GTX 31ea3847 „4 Äcker als Fläche gemalt, bestes Bild 0,00 %“):
            // `_imGrundriss` nennt auch „weg“ und „lichtung“ (stamm/vegetation-baum.js) — flacher Grund, das Auge stand auf dem Feldweg,
            // und jeder Strahl galt als verdeckt. Es sperren „haus“ und „bau“ wie in k2-mensch-geist.js
            const g = typeof r._imGrundriss === "function" ? r._imGrundriss(x, z) : false;
            if (g === "haus" || g === "bau") return false;
        }
        return true;
    };
    const v = new T.Vector3(), vu = new T.Vector3(), vv = new T.Vector3();
    const imBild = (e, f) => {
        cam.position.set(e.x, e.y, e.z);
        cam.lookAt(f.x, h(f.x, f.z), f.z);
        cam.updateMatrixWorld(true);
        const N = 8, du = (2 * f.ex) / N, dv = (2 * f.ez) / N;
        let anteil = 0;
        for (let p = 0; p < N; p++)
            for (let q = 0; q < N; q++) {
                const u = -f.ex + (p + 0.5) * du, w = -f.ez + (q + 0.5) * dv;
                const m = pt(f, u, w);
                const y = h(m[0], m[1]) + 0.05;
                if (acker(m[0], m[1]) < 0.5) continue;
                v.set(m[0], y, m[1]).project(cam);
                if (!(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z > -1 && v.z < 1)) continue;
                if (!frei(e.x, e.y, e.z, m[0], y, m[1])) continue;
                const m1 = pt(f, u + du, w), m2 = pt(f, u, w + dv);
                vu.set(m1[0], h(m1[0], m1[1]) + 0.05, m1[1]).project(cam);
                vv.set(m2[0], h(m2[0], m2[1]) + 0.05, m2[1]).project(cam);
                anteil += Math.abs((vu.x - v.x) * (vv.y - v.y) - (vu.y - v.y) * (vv.x - v.x)) / 4;
            }
        return anteil;
    };
    const flaechen = F.map(flaeche);
    const gemalt = flaechen.filter((q) => q.innen >= 0.6 && q.rand <= 0.2).length;
    let best = null;
    for (const fw of P.feldwege || []) {
        const p0 = fw && fw.pts && fw.pts[0];
        if (!p0) continue;
        const ex = S.ox + p0.x, ez = S.oz + p0.z;
        const e = { x: ex, y: h(ex, ez) + 1.7, z: ez };
        let n = 0, top = null;
        F.forEach((f, i) => {
            if (Math.hypot(f.x - ex, f.z - ez) > 45) return;
            const q = flaechen[i];
            if (!(q.innen >= 0.6 && q.rand <= 0.2)) return;
            const a = imBild(e, f);
            if (a >= 0.005) n++;
            if (!top || a > top.a) top = { a, f };
        });
        if (top && (!best || n > best.n || (n === best.n && top.a > best.top.a))) best = { n, e, top };
    }
    const aus = { felder: F.length, gemalt, feldwege: (P.feldwege || []).length, imBild: best ? best.n : 0, anteil: best ? +best.top.a.toFixed(4) : 0, pose: null };
    if (best) {
        const f = best.top.f, e = best.e;
        aus.pose = { px: +e.x.toFixed(2), py: +e.y.toFixed(2), pz: +e.z.toFixed(2), lx: +f.x.toFixed(2), ly: +h(f.x, f.z).toFixed(2), lz: +f.z.toFixed(2) };
        // DER SPIELER AN DER POSE: Stand am Feldweg-Ende, die Gier auf den Acker (die Kopfrichtung der Kamera gemessen, wie dorfZaehlung)
        pm.set(e.x, h(e.x, e.z) + A.PLAYER_FOOT_OFFSET, e.z);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
        const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
        const kopf = async () => {
            await window.__seitenTakt();
            await window.__seitenTakt();
            const d = s.camera.getWorldDirection(new T.Vector3());
            return Math.atan2(d.x, d.z);
        };
        const ziel = Math.atan2(f.x - e.x, f.z - e.z);
        for (let it = 0; it < 2; it++) {
            const h0 = await kopf();
            const y0 = s.yaw;
            s.yaw = y0 + 0.1;
            const h1 = await kopf();
            const sg = Math.sign(wrap(h1 - h0)) || 1;
            s.yaw = y0 + sg * wrap(ziel - h0);
        }
    }
    return aus;
};

// DER STAND IM ACKER (frucht): der Spieler 3 m vor der Kante des gemalten Ackers, die Kacheln der Nah-Streu über Acker und Ring
// stehen (`zustand` „steht“); gezählt werden die Pflanzen der Nah-Streu (ohne Stein und Totholz, ohne Geerntetes) und die Büschel der
// Nah-Wiese IM Acker, als Kontrolle dieselben im Ring 2–8 m außen (sie zeigt, dass die Streu dort baut)
const FRUCHT = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const f = arg.feld;
    if (!f) throw new Error("kein gemalter Acker am Messort");
    const c = Math.cos(f.phi || 0), sn = Math.sin(f.phi || 0);
    // die Lage im Acker in der Drehung seines Anstrichs (`_wegeFormAbstand` Kasten: u = c·dx − s·dz, v = s·dx + c·dz) — bis
    // pm-acker-kette 2 drehte die Station andersherum: an einem gedrehten Acker zählte sie Büschel neben ihm als „innen“
    const lokal = (x, z) => {
        const dx = x - f.x, dz = z - f.z;
        return [c * dx - sn * dz, sn * dx + c * dz];
    };
    const abstand = (x, z) => {
        const l = lokal(x, z);
        return Math.max(Math.abs(l[0]) - f.ex, Math.abs(l[1]) - f.ez);
    };
    const ex = f.x + sn * (f.ez + 3), ez = f.z + c * (f.ez + 3);
    pm.set(ex, r.getTerrainHeightAt(ex, ez) + A.PLAYER_FOOT_OFFSET, ez);
    if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    const K = A.NAH_STREU.kachel;
    const proben = [];
    for (let p = -1; p <= 1; p++) for (let q = -1; q <= 1; q++) proben.push([f.x + p * f.ex * c + q * f.ez * sn, f.z - p * f.ex * sn + q * f.ez * c]);
    const steht = () =>
        proben.every((w) => {
            const k = s.nahStreu && s.nahStreu.kacheln.get(Math.floor(w[0] / K) + "," + Math.floor(w[1] / K));
            return !!(k && k.zustand === "steht");
        });
    let takte = 0;
    for (; takte < 150 && !steht(); takte++) await window.__seitenTakt();
    if (!steht()) throw new Error("die Nah-Streu über dem Acker steht nicht nach " + takte + " Takten");
    const arten = r._nahStreuArten() || [];
    let innen = 0, ring = 0, wiInnen = 0, wiRing = 0;
    const kinds = {};
    for (const [key, k] of s.nahStreu.kacheln) {
        if (!k || k.zustand !== "steht" || !Array.isArray(k.items)) continue;
        const alt = r._geerntetIn(key);
        for (const it of k.items) {
            const art = arten[it.art];
            if (!art || alt.has(it.id) || art.kind === "rock" || art.kind === "deadwood") continue;
            const d = abstand(it.x, it.z);
            if (d <= 0) {
                innen++;
                kinds[art.id] = (kinds[art.id] || 0) + 1;
            } else if (d >= 2 && d <= 8) ring++;
        }
    }
    const nw = s.nahWiese;
    for (const k of nw && nw.kacheln ? nw.kacheln.values() : [])
        for (const b of (k && k.bueschel) || []) {
            const d = abstand(b.x, b.z);
            if (d <= 0) wiInnen++;
            else if (d >= 2 && d <= 8) wiRing++;
        }
    // Ego 1,7 m über dem GRUND (der gezeichnete Boden): „+1,7“ der Werkbank misst über der obersten Voxel-Fläche — unter einer Krone
    // stand das Auge im Baum (Bild frucht_1-S1 am e71adb10: 15 m über dem Acker)
    const grund = (x, z) => r._bodenSichtAt(x, z) ?? r.getTerrainHeightAt(x, z);
    // die Kultur: die Strecken mit Halmen der Frucht im Körper des Ackers (`ackerKoerper.je`, `_ackerKoerperTakt`) — nie der Wildwuchs
    let halme = 0, kaemme = 0, stand = null;
    if (s.ackerKoerper) {
        s.ackerKoerper.takt = null;
        for (let i = 0; i < 4; i++) await window.__seitenTakt();
        const zk = s.ackerKoerper.je.get(A._ackerSchluessel ? A._ackerSchluessel(f.x, f.z) : "");
        if (zk) [halme, kaemme, stand] = [zk.frucht, zk.kaemme, zk.stand];
    }
    return { innen, ring, wiInnen, wiRing, kinds, takte, halme, kaemme, stand, pose: { px: +ex.toFixed(2), py: +(grund(ex, ez) + 1.7).toFixed(2), pz: +ez.toFixed(2), lx: f.x, ly: +(grund(f.x, f.z) + 0.3).toFixed(2), lz: f.z } };
};

// DAS GEBUNDENE TIER ÜBER DEM HANG (tier S1): ein Hang von 10–30° nahe dem Spieler mit ≥ 3 m Anstieg über 16 m (Land, frei von
// Grundrissen); zwei Tiere der Seele „wesen“ neben dem Spieler — das eine bindet die Geste des Spielers (`assignCreatureTask`
// follow_player, NICHT still: der Bond der Geste), das andere bleibt ungebunden (der Gegenlauf). Der Spieler geht 1,4 m/s bergauf,
// der Takt des Spiels je 1/30 s (`_gameLoopTick`, der Loop der Seite ruht solange); gemessen der waagrechte Abstand des gebundenen
// Tiers nach 2 s Anlauf (p95), der Anstieg und der Abstand des ungebundenen am Ende. Dazu der Bestand: Tiere, zahme (bond ≥ 0,5)
const TIER = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const h = (x, z) => r.getTerrainHeightAt(x, z);
    const C0 = (s.creatures || []).slice();
    const aus = { wild: C0.length, zahm: C0.filter((c) => c && c.userData && (c.userData.bond || 0) >= 0.5).length };
    const P0 = { x: pm.x, z: pm.z };
    let hang = null;
    for (let ring = 1; ring <= 30 && !hang; ring++)
        for (let q = 0, n = ring * 8; q < n && !hang; q++) {
            const a = (q / n) * Math.PI * 2;
            const x = P0.x + Math.cos(a) * ring * 4, z = P0.z + Math.sin(a) * ring * 4;
            const gx = (h(x + 1, z) - h(x - 1, z)) / 2, gz = (h(x, z + 1) - h(x, z - 1)) / 2;
            const g = Math.hypot(gx, gz);
            const w = (Math.atan(g) * 180) / Math.PI;
            if (!(w >= 10 && w <= 30)) continue;
            const ux = gx / g, uz = gz / g;
            let ok = h(x + ux * 16, z + uz * 16) - h(x, z) >= 3;
            for (let t = -3; t <= 18 && ok; t += 1.5)
                for (const o of [-3, 0, 3]) {
                    const px = x + ux * t - uz * o, pz = z + uz * t + ux * o;
                    if (!r._landAt(px, pz) || (typeof r._imGrundriss === "function" && r._imGrundriss(px, pz))) ok = false;
                }
            if (ok) hang = { x, z, ux, uz, grad: +w.toFixed(1) };
        }
    if (!hang) throw new Error("kein Hang von 10–30° mit ≥ 3 m Anstieg über 16 m nahe dem Spieler");
    aus.hangGrad = hang.grad;
    const stelle = (o) => {
        const x = hang.x - hang.uz * o - hang.ux * 2, z = hang.z + hang.ux * o - hang.uz * 2;
        const c = r.spawnCreatureAt(x, h(x, z) + 0.3, z, "happy", "wesen", { precise: true, bodySize: 1 });
        if (!c) throw new Error("kein Tier gesetzt (spawnCreatureAt wesen)");
        return c;
    };
    window.__loop(false);
    try {
        pm.set(hang.x, h(hang.x, hang.z) + A.PLAYER_FOOT_OFFSET, hang.z);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
        const gebunden = stelle(1.5);
        const frei = stelle(-1.5);
        r.assignCreatureTask(gebunden, "follow_player");
        aus.bond0 = +(gebunden.userData.bond || 0).toFixed(4);
        const y0 = h(hang.x, hang.z);
        const ab = [];
        let uhr = performance.now();
        let weg = 0;
        for (let k = 0; k < 390; k++) {
            if (k >= 30) weg = Math.min(16, weg + 1.4 / 30);
            const x = hang.x + hang.ux * weg, z = hang.z + hang.uz * weg;
            pm.set(x, h(x, z) + A.PLAYER_FOOT_OFFSET, z);
            r._gameLoopTick((uhr += 1000 / 30));
            if (k >= 60) ab.push(Math.hypot(gebunden.position.x - pm.x, gebunden.position.z - pm.z));
            if (k % 15 === 14) await window.sleep();
        }
        ab.sort((a, b) => a - b);
        aus.p95 = ab.length ? +ab[Math.min(ab.length - 1, Math.floor(0.95 * ab.length))].toFixed(2) : null;
        aus.hub = +(h(pm.x, pm.z) - y0).toFixed(2);
        aus.frei = +Math.hypot(frei.position.x - pm.x, frei.position.z - pm.z).toFixed(2);
        aus.bond1 = +(gebunden.userData.bond || 0).toFixed(4);
        aus.folgt = gebunden.userData.task ? gebunden.userData.task.name : null;
        // „bindet sich“: die Geste hob den Bond, das Tier folgt — und steht näher als das ungebundene (der Gegenlauf im Umfang)
        aus.n = aus.bond1 > 0 && aus.folgt === "follow_player" && aus.frei > aus.p95 ? 1 : 0;
    } finally {
        window.__loop(true);
    }
    return aus;
};

// DAS WASSER AM ACKER (erdbau, der Leser von gelaende.K2#1 — proben-welt wasserGraben): je gemaltem Acker auf einem Raster über
// Acker und 3 m Ring die gezeichneten Wasser-Flächen (`_wasserNetz` × `_wasserNetzHoehe`, die oberste je Netz) über dem Boden der
// Sicht + 0,1 m; „Bach nahe“, wo dasselbe Wasser auf dem Kreis 30 m um den Acker liegt; der Wuchs des Orts (`_wuchsAt`) bewässert
// gegen unbewässert
const WASSER = async (r, T, arg) => {
    const span = r._voxelChunkConfig(0).span;
    const flaechen = (x, z) => {
        const ys = [];
        for (let dz = -1; dz <= 1; dz++)
            for (let dx = -1; dx <= 1; dx++) {
                const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
                const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
                if (y !== null) ys.push(y);
            }
        return ys;
    };
    const nass = (x, z) => {
        const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
        return flaechen(x, z).some((y) => y > g + 0.1);
    };
    const F = (arg.felder || []).filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2);
    let bew = 0, ohneBach = 0, wB = 0, nB = 0, wU = 0, nU = 0;
    for (const f of F) {
        const c = Math.cos(f.phi), sn = Math.sin(f.phi);
        const pt = (u, v) => [f.x + u * c - v * sn, f.z + u * sn + v * c];
        let w = 0;
        for (let p = -3; p <= 3; p++)
            for (let q = -2; q <= 2; q++) {
                const a = pt((p / 3.5) * (f.ex + 3), (q / 2.5) * (f.ez + 3));
                if (nass(a[0], a[1])) w++;
            }
        let bach = 0;
        for (let k = 0; k < 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            if (nass(f.x + Math.cos(a) * 30, f.z + Math.sin(a) * 30)) bach++;
        }
        const wu = typeof r._wuchsAt === "function" ? r._wuchsAt(f.x, f.z) : null;
        if (w > 0) {
            bew++;
            if (!bach) ohneBach++;
            if (Number.isFinite(wu)) (wB += wu), nB++;
        } else if (Number.isFinite(wu)) (wU += wu), nU++;
    }
    return { aecker: F.length, bewaessert: bew, grabenOhneBach: ohneBach, gruenDelta: nB && nU ? +(wB / nB - wU / nU).toFixed(4) : null };
};

// DIE HAND DES SPIELERS (hand S1): die nächste pflückbare Pflanze der Nah-Streu (ihre Art gibt eine Ernte, sie steht im Block
// einer Senke ihrer Kachel) — gepflückt über den Weg des Klicks (`_harvestScatterPick`); gemessen: fort aus jedem Block, die Ernte im
// Inventar, die Tat der Welt und ihre Dauer (`_tatIndex().dauer`), dann die Welt-Uhr gerafft (spielZeit) um die halbe Dauer — die
// Pflanze darf NICHT stehen (Gegenlauf) — und über die Dauer hinaus: sie steht wieder (der Takt des Spiels heilt und baut die
// Kachel). Dazu der Boden der Äcker vor ↔ nach der gerafften Zeit um 10 Uhr (ändert die Arbeit ihn?)
const HAND = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const ns = s.nahStreu;
    const arten = typeof r._nahStreuArten === "function" ? r._nahStreuArten() : null;
    if (!ns || !ns.kacheln || !arten) throw new Error("keine Nah-Streu am Spieler");
    r.setTimeOfDay(10 / 24, "regler");
    const acker = (x, z) => {
        const a = {};
        r._wegeBelagAt(x, z, a);
        return (a.acker || 0) + (a.erde || 0);
    };
    const F = (arg.felder || []).filter((f) => f.gemalt >= 0.6);
    const boden = () =>
        F.map((f) => {
            const c = Math.cos(f.phi), sn = Math.sin(f.phi);
            const L = [];
            for (let p = -2; p <= 2; p++) for (let q = -2; q <= 2; q++) L.push(acker(f.x + (p / 2.5) * f.ex * c - (q / 2.5) * f.ez * sn, f.z + (p / 2.5) * f.ex * sn + (q / 2.5) * f.ez * c));
            return L;
        });
    const boden0 = boden();
    const steht = (key, id) => {
        const k = ns.kacheln.get(key);
        if (!k || !k.senken) return false;
        for (const sk of k.senken) {
            const S = ns.senken.get(sk);
            const b = S && S.bloecke ? S.bloecke.get(key) : null;
            if (b && b.ids && b.ids.indexOf(id) >= 0) return true;
        }
        return false;
    };
    let best = null;
    for (const [key, k] of ns.kacheln) {
        if (!k || k.zustand !== "steht" || !Array.isArray(k.items) || !k.senken) continue;
        const alt = r._geerntetIn(key);
        for (const it of k.items) {
            const art = arten[it.art];
            if (!art || !art.ernte || alt.has(it.id)) continue;
            const sk = [...k.senken].find((x) => {
                const S = ns.senken.get(x);
                const b = S && S.bloecke ? S.bloecke.get(key) : null;
                return !!(S && S.ernte && b && b.ids && b.ids.indexOf(it.id) >= 0);
            });
            if (sk == null) continue;
            const d = Math.hypot(it.x - pm.x, it.z - pm.z);
            if (!best || d < best.d) best = { key, id: it.id, senke: sk, d, art: art.id, ernte: ns.senken.get(sk).ernte };
        }
    }
    if (!best) throw new Error("keine pflückbare Pflanze der Nah-Streu am Spieler");
    const inv = () => {
        let n = 0;
        for (const x of (s.player && s.player.inventory) || []) if (x && x.kind === "material" && x.material === best.ernte) n += x.count || 0;
        return n;
    };
    const vor = steht(best.key, best.id);
    const inv0 = inv();
    if (!r._harvestScatterPick({ key: best.key, senke: best.senke, id: best.id, name: best.art })) throw new Error("das Pflücken nahm die Pflanze nicht (_harvestScatterPick)");
    const weg = vor && !steht(best.key, best.id);
    const ernte = inv() - inv0;
    const tat = (s.worldMeta.taten || []).slice().reverse().find((a) => a && a.tat === "ernten" && a.kachel === best.key && a.id === best.id);
    if (!tat) throw new Error("das Pflücken schrieb keine Tat der Welt");
    const dauer = r._tatIndex().dauer.get(tat);
    if (!(dauer > 0)) throw new Error("die Tat der Ernte trägt keine Dauer");
    const raffe = (stunden) => (s.spielZeit += (stunden * r._kalender().tagS) / 24);
    const takte = async (n, bis) => {
        for (let i = 0; i < n; i++) {
            await window.__seitenTakt();
            if (bis && bis()) return i + 1;
        }
        return n;
    };
    raffe(dauer * 0.5);
    await takte(20);
    const frueh = steht(best.key, best.id);
    raffe(dauer * 0.5 + 0.05);
    const tz = await takte(150, () => steht(best.key, best.id));
    const zurueck = steht(best.key, best.id);
    const boden1 = boden();
    let geaendert = 0;
    boden0.forEach((L, i) => {
        const d = L.reduce((a, x, j) => a + Math.abs(x - boden1[i][j]), 0) / Math.max(1, L.length);
        if (d > 0.05) geaendert++;
    });
    return { art: best.art, ernteStoff: best.ernte, d: +best.d.toFixed(2), weg: weg ? 1 : 0, ernte, dauerH: +dauer.toFixed(3), frueh: frueh ? 1 : 0, zurueck: zurueck ? 1 : 0, takte: tz, aecker: F.length, bodenGeaendert: geaendert };
};

// DER VORRAT DER SCHEUNE (strom S1): je Hof der Siedlung am Messort (`S.scheunen`: die Scheune, ihre Esser, die Werke ihrer Bauern) die
// Welt-Uhr gerafft, Stunde für Stunde über `tage` Tage (`_scheuneFassen` wie der Takt des Bilds); gemessen: die Ernten (Anstiege des
// Vorrats) und die Mahlzeiten (Abstiege) je Hof, hochgerechnet auf ein Jahr — ein Sägezahn nur, wo beides geschieht —, und der Hof,
// dessen Scheune sowohl voll (≥ eine Kiste) als auch leer (keine Kiste) stand, mit seinen beiden Stunden. `zu` (optional, in
// Stunden ab dem Anfang): die Welt-Uhr auf diese Stunde stellen und das Bild des Bestands sofort legen (das Bildpaar).
const STROM = async (r, T, arg) => {
    const s = r.state;
    const pm = s.playerMesh.position;
    const KC = window.__koerperCore;
    const SL = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.plan && Array.isArray(S.scheunen) && S.scheunen.length);
    SL.sort((a, b) => Math.hypot(a.ox - pm.x, a.oz - pm.z) - Math.hypot(b.ox - pm.x, b.oz - pm.z));
    const S = SL[0];
    if (!S || typeof r._scheuneFassen !== "function") return { hoefe: 0, fehlt: "keine Scheune als Halter des Bestands (S.scheunen, _scheuneFassen)" };
    const kiste = KC.BESTAND_GESETZ.kiste;
    const stdJeS = (r._weltStunde(s.spielZeit + 1000) - r._weltStunde(s.spielZeit)) / 1000;
    if (arg.zu != null) {
        s.spielZeit = arg.z0 + arg.zu / stdJeS;
        const H = S.scheunen[arg.hof];
        r._bestandBild(H, true);
        for (let i = 0; i < 4; i++) await window.__seitenTakt();
        // die Pose: 7 m vor dem Tor (gegen den Blick des Hofs, dort stehen die Kisten), 1,5 m zur Seite der Kisten, Ego 1,7 m über dem Grund
        const w = H.orte.werk;
        const [fx, fz] = [Math.sin(w.blick), Math.cos(w.blick)];
        const y = (x, z) => r._bodenSichtAt(x, z) ?? r.getTerrainHeightAt(x, z);
        const [px, pz, lx, lz] = [w.x - fx * 7 + fz * 1.5, w.z - fz * 7 - fx * 1.5, w.x + fz * 1.5, w.z - fx * 1.5];
        const kam = { px, pz, py: y(px, pz) + 1.7, lx, lz, ly: y(lx, lz) + 0.5 };
        return { n: KC.bestandAm(H.bestand, r._weltStunde()), kisten: H.bestandBild ? H.bestandBild.children.filter((c) => c.visible).length * (H.bestandBild.visible ? 1 : 0) : -1, kam };
    }
    const tage = arg.tage || 2;
    const z0 = s.spielZeit;
    const hoefe = S.scheunen.map((H) => ({ leute: H.leute.length, bauern: H.werke.length, e0: H.bestand.ernten, auf: 0, ab: 0, voll: null, leer: null, vor: KC.bestandAm(H.bestand, r._weltStunde()) }));
    for (let i = 1; i <= 24 * tage; i++) {
        s.spielZeit = z0 + i / stdJeS;
        const h = r._weltStunde();
        S.scheunen.forEach((H, j) => {
            r._scheuneFassen(H, h);
            const n = KC.bestandAm(H.bestand, h);
            const o = hoefe[j];
            if (n > o.vor + 1e-9) o.auf++;
            if (n < o.vor - 1e-9) o.ab++;
            if (n >= kiste && o.voll == null) o.voll = i;
            if (n < 1e-9 && o.voll != null && o.leer == null) o.leer = i;
            o.vor = n;
        });
    }
    hoefe.forEach((o, j) => (o.ernten = S.scheunen[j].bestand.ernten - o.e0));
    const jahr = r._gelaende().ort.klimaHeute.jahrTage || 365;
    const zahn = hoefe.filter((o) => o.ernten > 0 && o.ab > 0);
    const paar = hoefe.findIndex((o) => o.voll != null && o.leer != null);
    return {
        name: S.plan.name,
        z0,
        stdJeS,
        tage,
        hoefe: hoefe.length,
        saegezahn: zahn.length ? Math.min(...zahn.map((o) => o.ernten)) * (jahr / tage) : 0,
        zahnHoefe: zahn.length,
        paar,
        voll: paar >= 0 ? hoefe[paar].voll : null,
        leer: paar >= 0 ? hoefe[paar].leer : null,
        je: hoefe.map((o) => [o.leute, o.bauern, o.ernten, o.ab]),
    };
};

// DAS BESTELLEN DES ACKERS (hand S2): der nächste Acker des Registers (`state.aecker`), der Spieler 1 m vor seiner Stirn, der Blick
// längs seiner langen Achse 60° zum Boden auf einen Punkt 1,5 m im Acker — der Klick des Spiels (`tryMouseBreak`, bis die Tat
// „bestellen“ steht; im Pfad trägt die Mühe mehrere Hiebe), dann der Körper des Ackers (`ackerKoerper.je`): das Stück der Hand, seine
// Kämme, seine Achse gegen die Zugrichtung. `nur` „pose“: nur die Pose des Bilds (vor dem Klick).
const BESTELLEN = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const pm = s.playerMesh.position;
    const cam = s.camera;
    if (!s.aecker || !s.aecker.size || typeof r._ackerAt !== "function") return { fehlt: "kein Register der Äcker (state.aecker, _ackerAt)" };
    const a = [...s.aecker.values()].sort((p, q) => Math.hypot(p.x - pm.x, p.z - pm.z) - Math.hypot(q.x - pm.x, q.z - pm.z))[0];
    const [stand, ziel] = [A._ackerWelt(a, -a.ex - 1, 0), A._ackerWelt(a, -a.ex + 1.5, 0)];
    const y = (x, z) => r._bodenSichtAt(x, z) ?? r.getTerrainHeightAt(x, z);
    const pose = { px: stand[0], pz: stand[1], py: y(stand[0], stand[1]) + 1.7, lx: ziel[0], lz: ziel[1], ly: y(ziel[0], ziel[1]) };
    if (arg.nur === "pose") return { pose, acker: A._ackerSchluessel(a.x, a.z) };
    r.setTimeOfDay(10 / 24, "regler");
    const taten = () => r._tatIndex().bestellen.length;
    const n0 = taten();
    let klicks = 0;
    for (; klicks < 24 && taten() === n0; klicks++) {
        if (s.player) s.player.stamina = Math.max(s.player.stamina || 0, 100);
        pm.set(pose.px, pose.py - 1.6 + 1.8, pose.pz);
        cam.position.set(pose.px, pose.py, pose.pz);
        cam.lookAt(pose.lx, pose.ly, pose.lz);
        cam.updateMatrixWorld(true);
        r.tryMouseBreak();
    }
    const tat = r._tatIndex().bestellen[taten() - 1];
    if (!tat || taten() === n0) return { klicks, tat: 0, fehlt: "der Klick am Acker schrieb keine Tat „bestellen“ (" + klicks + " Klicks)" };
    if (s.ackerKoerper) s.ackerKoerper.takt = null;
    for (let i = 0; i < 6; i++) await window.__seitenTakt();
    const K = s.ackerKoerper;
    const z = K && K.je.get(tat.acker);
    const hand = z && z.hand.find((q) => Math.abs(q.x - tat.x) < 0.01 && Math.abs(q.z - tat.z) < 0.01);
    // die Zugrichtung: der Blick des Klicks längs u (die Achse 0 des Ackers)
    return { klicks, tat: 1, acker: tat.acker, achse: tat.achse, zug: 0, kaemme: hand ? hand.kaemme : 0, stuecke: z ? z.stuecke : 0, pose };
};

// der Rumpf jeder Leiter: der Ruf einer Seiten-Funktion mit der Frist der Probe (in messe als Text — die Fabrik reicht nur H und K)
module.exports = (F) => [
    // ───────── DIE FLUR: die gemalten Äcker der Pläne, ihr Bild am Dorfrand, ihre Fläche je Umfang ─────────
    F.leiter("mensch.nahrung.flur", {
        sek: 45,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/dirigent-takt.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const flaechen = () => z().felder.filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2);
            const km2 = () => flaechen().reduce((a, f) => a + f.m2, 0) / 1e6;
            const luft = () => ({ px: z().nah.ox, py: "+150", pz: z().nah.oz + 80, lx: z().nah.ox, ly: "+0", lz: z().nah.oz });
            H.zeile("Flur: " + (Z ? Z.felder.length + " Äcker im Plan, gemalt als Fläche " + flaechen().length + ", " + km2().toFixed(5) + " km²" : "kein Zensus (" + zf + ")"));
            await K.schritt(3, async () => {
                const n = flaechen().length;
                if (n < 1000) return K.nicht(3, { n, fehlt: "10³ Parzellen auf 10² km²: die Welt am Messort trägt " + n + " gemalte Äcker (" + z().siedlungen + " Siedlung(en)), 8 Saaten trägt die Sitzung nicht" });
                const b = await K.bild(3, luft());
                K.auge(3, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs", mass: n + " Parzellen" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: 1, fehlt: "16 Saaten je Region 10⁴ km²: die Sitzung trägt EINE Saat; Weide als Nutzung trägt kein Plan (" + Object.keys(z().slotRollen).join("/") + ")" }));
            await K.schritt(5, async () => K.nicht(5, { n: +km2().toFixed(6), fehlt: "Nutzflächen eines Kontinents (10⁶ km²) je Klimazone: die gemalte Flur am Messort deckt " + km2().toFixed(5) + " km²" }));
            await K.schritt(6, async () => K.nicht(6, { n: flaechen().length, fehlt: "10⁹ Parzellen eines Planeten für 100 Zufallslandungen: " + flaechen().length + " gemalte Äcker am Messort" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit fremden Agrarformen: die Sitzung trägt eine Welt, ihr Acker ist ein gemaltes Rechteck" }));
            // S1 zuletzt: der Spieler endet an ihrer Pose (der Preis der Sitzung)
            await K.schritt(1, async () => {
                const B = await ruf("FLUR_BLICK");
                const n = flaechen().length;
                K.zahl(1, {
                    n,
                    werte: { imBild: B.imBild },
                    beleg: B.felder + " Äcker im Plan, " + B.gemalt + " als Fläche gemalt, " + B.feldwege + " Feldwege; bestes Bild " + (B.anteil * 100).toFixed(2) + " % an Pose " + JSON.stringify(B.pose),
                    taeter: B.imBild >= 1 ? null : n ? "kein gemalter Acker frei im Bild vom Feldweg-Ende (Gelände/Grundriss verdeckt oder ≥ 45 m fern)" : "kein Acker als Fläche gemalt (stamm/siedlung-wege.js felder-Schicht: _landAt oder ortKraut verweigert)",
                });
            });
            // S2 AM GESETZ (der Fächer, zuletzt: er liest nur den Kern): 8 Saaten × weiler, dorf, markt — die Äcker des Plans und ihre
            // Fläche; die Flur eines Dorfs ≈ 1 km² (Gewannflur: 100 ha, der Morgen ≈ 0,25 ha, die Hufe 30 Morgen) gegen die Summe der Äcker
            await K.schritt(2, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.FLUR_AN, export: "fachwerk-core.js:11165 exportSettlement (felder des dorfLayout)", leser: "stamm/siedlung-wege.js:2675" },
                    adressen: { saaten: 8, orte: ["weiler", "dorf", "markt"] },
                    masse: {
                        km2: { wie: "max", feld: "km2" },
                        felder: { wie: "max", feld: "felder" },
                        mittelM2: { wie: (v, aus) => { const m = aus.flatMap((x) => x.w.m2); return m.length ? Math.round(m.reduce((s, y) => s + y, 0) / m.length) : 0; } },
                        maxM2: { wie: "max", feld: "maxM2" },
                        aecker: { wie: (v, aus) => aus.reduce((s, x) => s + x.w.felder, 0) },
                        ortKm2: { wie: "max", feld: "ortKm2" },
                        je: { wie: (v, aus) => aus.reduce((o, x) => ((o[x.a.ort] = Math.max(o[x.a.ort] || 0, x.w.km2)), o), {}) },
                    },
                    schlecht: { feld: "km2", richtung: "min" },
                    pose: (a, w) => "Luftbild 150 m über der Mitte des Plans der Saat " + a.saat + " (" + a.ort + ", " + w.slots + " Häuser), 80 m südlich — Flur " + w.km2 + " km² in " + w.felder + " Äckern",
                    ungemessen: [
                        "die Feldgrößen-Verteilung gegen eine reale Flur (KS ≤ 0,25): kein Korpus realer Parzellen in der Station — gemessen sind Größe und Zahl der Äcker",
                        "das Luftbild der Flur gegen das Kataster (Blindurteil ≤ 65 %): ungemessen bis zum Gerät — die Pose nennt der Fächer",
                    ],
                    ms: Math.max(4000, Math.floor((H.rest() - 3) * 1000)),
                });
                const W = R.werte;
                H.zeile("Flur am Gesetz: " + R.akte.slice(0, 500) + " · je Größe " + JSON.stringify(W.je) + " · Acker im Mittel " + W.mittelM2 + " m², größter " + W.maxM2 + " m²");
                if (!R.gemessen) return K.nicht(2, { n: 0, fehlt: "die Flur eines Dorfs ≈ 1 km²: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "keine Adresse des Fächers an der Frist") });
                if (W.km2 < 0.5)
                    return K.nicht(2, {
                        n: W.km2,
                        fehlt: "die Flur eines Dorfs ≈ 1 km²: an " + R.gemessen + " Plänen (Weiler bis Markt) decken höchstens " + W.felder + " Äcker " + W.km2 + " km² (" + W.aecker + " Äcker, im Mittel " + W.mittelM2 + " m², der größte " + W.maxM2 +
                            " m² = " + (W.maxM2 / 2500).toFixed(2) + " Morgen zu 2 500 m²), der Ort selbst " + W.ortKm2 + " km² (fachwerk-core.js:6563 dorfLayout: 1–2 Äcker je Feldweg-Ende zu 12–21 × 8–15 m)",
                    });
                const b = await K.bild(2, luft());
                K.auge(2, { bild: b.datei, pose: "Luftbild 150 m über der Mitte des Dorfs, 80 m südlich", mass: "Flur am Gesetz bis " + W.km2 + " km², " + W.felder + " Äcker" });
            });
        },
        seite: { ZENSUS, FLUR_BLICK, FAECHER, FLUR_AN },
        sprossen: {
            1: { umfang: { soll: 1, wort: "gemalte Äcker am Feldweg-Ende" }, masse: [{ key: "imBild", wort: "Äcker als Fläche im Bild am Dorfrand", soll: 1, richtung: "≥" }] },
            2: { auge: { pose: "Luftbild 150 m über der Mitte des Plans mit der kleinsten Flur des Fächers, 80 m südlich", vorbild: "die reale Flur eines Dorfs ≈ 1 km² (Gewannflur Mitteleuropa, Luftbild/Kataster): Feldgrößen-Verteilung KS ≤ 0,25, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "die Flur am Gesetz deckt ≪ 1 km² an jedem Plan von Weiler bis Markt (fachwerk-core.js:6563: 1–2 Äcker je Feldweg-Ende zu 12–21 × 8–15 m, je Acker ein Bruchteil des Morgens)" },
            3: { auge: { pose: "Luftbild 150 m über der Mitte des Dorfs", vorbild: "20 Satellitenbilder realer Agrarlandschaft (10² km², 10³ Parzellen) an 8 Saaten, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "10³ Parzellen: die Welt am Messort trägt eine Handvoll Äcker" },
            4: { umfang: { soll: 16, wort: "Saaten je Region 10⁴ km²" }, masse: [{ key: "r", wort: "Acker/Weide/Wald über Abstand (r)", soll: 0.8, richtung: "≥" }, { key: "anteil", wort: "Saaten mit r ≥ 0,8", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "16 Saaten und Weide als Nutzung" },
            5: { umfang: { soll: 1e6, wort: "km² Kontinent" }, masse: [{ key: "fao", wort: "Abweichung Nutzfläche je Klimazone gegen FAO", soll: 0.25, richtung: "≤" }], erwartet: "nicht", fehlt: "ein Kontinent mit Nutzflächen je Klimazone" },
            6: { auge: { pose: "100 Zufallslandungen, Ego 1,7 m", vorbild: "Fotos realer Kulturlandschaft je Landungsort: plausibel ≥ 90 %" }, erwartet: "nicht", fehlt: "10⁹ Parzellen eines Planeten" },
            7: { auge: { pose: "Luftbild je Welt, 150 m", vorbild: "Panel „bewirtschaftet“ ≥ 70 % an 64 Welten, Lagerente (Thünen) r ≥ 0,7" }, erwartet: "nicht", fehlt: "64 Welten mit fremden Agrarformen" },
        },
        proben: {
            1: [{ name: "ATTRAPPE: die Äcker im Plan, keiner gemalt oder frei im Bild — ROT am Bild", j: { leiter: "mensch.nahrung.flur", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 3, werte: { imBild: 0 } } } }, gruen: false, zahl: /ROT an Äcker als Fläche im Bild am Dorfrand 0 / }],
        },
    }),

    // ───────── DIE FRUCHT: was auf dem gemalten Acker steht ─────────
    F.leiter("mensch.nahrung.frucht", {
        sek: 60,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/vegetation-wiese.js", "stamm/feld-leben.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            let R = null, rf = "";
            const feld = () => {
                const sp = z().spieler;
                return z().felder.filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2).sort((a, b) => Math.hypot(a.x - sp.x, a.z - sp.z) - Math.hypot(b.x - sp.x, b.z - sp.z))[0] || null;
            };
            try {
                R = await ruf("FRUCHT", { feld: feld() });
                H.zeile("Acker: " + R.halme + " Strecken mit Halmen der Frucht auf " + R.kaemme + " Kämmen (Stand " + JSON.stringify(R.stand) + "); Wildwuchs " + R.innen + " Pflanzen + " + R.wiInnen + " Büschel innen, Kontrolle im Ring " + R.ring + " + " + R.wiRing + " (" + R.takte + " Takte)");
            } catch (e) {
                rf = String((e && e.message) || e).slice(0, 200);
            }
            const r = () => {
                if (!R) throw new Error("kein Stand im Acker: " + rf);
                if (!(R.ring + R.wiRing > 0)) throw new Error("die Kontrolle im Ring trägt keine Pflanze — die Streu baute dort nicht");
                return R;
            };
            // die Kultur sind die Halme der Frucht im Körper des Ackers; Wildwuchs im Acker (Nah-Streu, Nah-Wiese) ist keine
            const kultur = () => r().halme || 0;
            const artText = () => (r().halme ? "weizen in " + r().halme + " Strecken" : "keine") + " · Wildwuchs " + (r().innen + r().wiInnen) + (Object.keys(r().kinds).length ? " (" + Object.entries(r().kinds).map(([k, v]) => k + " " + v).join(", ") + ")" : "");
            await K.schritt(2, async () => K.nicht(2, { n: kultur(), fehlt: "eine Kulturart über ein Spieljahr: im Acker stehen " + kultur() + " Pflanzen (Arten: " + artText() + ") — der Takt räumt jeden Wuchs vom Acker, das Boden-Gesetz trägt keine Kulturart" }));
            await K.schritt(3, async () => K.nicht(3, { n: 1, fehlt: "32 Saaten × 4 Klimazonen mit ihren Pflanzen: die Sitzung trägt eine Saat und eine Zone, " + z().felder.length + " Äcker ohne Kulturart" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().felder.length, fehlt: "10³ Felder mit eigenem Schicksal (Ertrag, Dürre): die Welt am Messort trägt " + z().felder.length + " Äcker ohne Ertrag" }));
            await K.schritt(5, async () => K.nicht(5, { n: 0, fehlt: "Domestikation über 10⁴ Jahre (Ähre −9000…2020): " + kultur() + " Pflanzen im Acker, keine Kulturart, keine Ähre — kein Jahr Domestikation" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "64 Welten mit gezüchteter Art: die Sitzung trägt eine Welt ohne Kulturform" }));
            // S1 zuletzt: der Spieler steht am Rand des Ackers
            await K.schritt(1, async () => {
                if (kultur() < 1) return K.nicht(1, { n: 0, fehlt: "eine Kulturpflanze auf einem Acker: der gemalte Acker trägt keine Halme der Frucht (" + artText() + ", Kontrolle im Ring " + (r().ring + r().wiRing) + ") — der Körper des Ackers (siedlung-wege `_ackerKoerperTakt`) stellt keine Frucht" });
                const b = await K.bild(1, r().pose, { wahl: 0 });
                K.auge(1, { bild: b.datei, pose: "3 m vor der Kante des nächsten Ackers, Ego 1,7 m, Blick auf seine Mitte", mass: kultur() + " Pflanzen im Acker (" + artText() + ")" });
            });
        },
        seite: { ZENSUS, FRUCHT },
        sprossen: {
            1: { auge: { pose: "3 m vor der Kante des nächsten Ackers, Ego 1,7 m, Blick auf seine Mitte", vorbild: "Foto eines realen Getreideackers in Reihen (Weizen, BBCH 30–60): Reihen im Bildspektrum ≥ 3σ, Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "keine Kulturpflanze auf dem Acker" },
            2: { umfang: { soll: 1, wort: "Kulturart über 1 Spieljahr" }, masse: [{ key: "bbch", wort: "Abweichung Höhe und Farbe gegen BBCH-Kurve", soll: 0.15, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Kulturart" },
            3: { auge: { pose: "Ego 1,7 m am Acker je Saat und Zone", vorbild: "Fotos der Kulturpflanzen je Klimazone (Reis, Weizen, Mais, Hirse): Bild ↔ Klima ≥ 80 % an 32 Saaten × 4 Zonen" }, erwartet: "nicht", fehlt: "32 Saaten und Kulturpflanzen je Zone" },
            4: { umfang: { soll: 1000, wort: "Felder mit eigenem Schicksal" }, masse: [{ key: "ertrag", wort: "Ertrag bei Dürre (relativ)", von: -0.7, bis: -0.3, herkunft: "„Ertrag −30…−70 %“: das Band als Anteil, −0,7 bis −0,3" }, { key: "gelb", wort: "Feld gelb im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10³ Felder mit Ertrag" },
            5: { umfang: { soll: 1e4, wort: "Jahre Domestikation" }, masse: [{ key: "aehre", wort: "Abweichung Ährengröße −9000/−2000/1900/2020 archäobotanisch", soll: 0.3, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Ähre, keine Domestikation" },
            6: { auge: { pose: "Ego 1,7 m am Acker je Welt", vorbild: "Panel: gezüchtete Art erkannt ≥ 80 % an 64 Welten, Merkmal wandert" }, erwartet: "nicht", fehlt: "64 Welten mit Kulturformen" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: eine Art steht, ihr Wuchs folgt keiner BBCH-Kurve — ROT an der Abweichung", j: { leiter: "mensch.nahrung.frucht", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 1, werte: { bbch: 0.4 } } } }, gruen: false, zahl: /ROT an Abweichung Höhe und Farbe gegen BBCH-Kurve 0\.4 / }],
        },
    }),

    // ───────── DAS TIER: Bindung, Jagd, Herde ─────────
    F.leiter("mensch.nahrung.tier", {
        sek: 50,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/kreatur-*.js", "stamm/feld-sprache.js", "scripts/werkbank.cjs"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            // S2 ÜBER DEN FÄCHER (stationen/faecher.js): 8 Saaten × 24 Stunden, je Adresse der Tag jedes Bewohners nach dem Gesetz des
            // Kerns (JAGD_AN) — der Umfang je Saat ist die kleinste Zahl der Jäger über die 8 Saaten (die Karte: je Saat); vor dem Zensus:
            // der Fächer braucht die Bühne nicht
            await K.schritt(2, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.JAGD_AN, export: "koerper-core.js:5459 tagesOrte + :5630 tagesPlan (TAGES_GESETZ :5300)", leser: "stamm/siedlung-bewohner.js:2239" },
                    adressen: { saaten: 8, zeiten: Array.from({ length: 24 }, (_, h) => h + 0.5) },
                    mit: { nH: 60 },
                    ms: Math.max(4000, Math.floor((H.rest() - 4) * 1000)),
                    masse: {
                        jaegerJeSaat: { wie: (v, aus) => Math.min(...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => Math.max(0, ...aus.filter((x) => x.a.saat === s).map((x) => x.w.jagd)))) },
                        jagdJeTag: { wie: (v) => v.reduce((q, x) => q + x, 0) / 8, feld: "jagd" },
                        bewohner: { wie: "summe", feld: "bewohner" },
                        taten: { wie: "zaehle", feld: "taten" },
                        rollen: { wie: "verschieden", feld: "rollen" },
                    },
                    schlecht: { feld: "jagd", richtung: "min" },
                    ungemessen: ["der Wildbestand unter der Jagd (ohne Jäger keine Jagd, die ihn senkt)"],
                });
                H.zeile("Tier S2: " + R.akte.slice(0, 400));
                if (R.fehlt) return K.leser(2, { fehlt: R.fehlt, wo: "koerper-core.js:5630" });
                const w = R.werte;
                return K.nicht(2, {
                    n: w.jaegerJeSaat,
                    fehlt: "Bewohner, die jagen und fischen (8 Saaten): " + w.jaegerJeSaat + " Jäger je Saat, " + w.jagdJeTag + " Jagden je Tag; die Taten des Tags " + Object.keys(w.taten).join("/") +
                        " — koerper-core.js:5300 TAGES_GESETZ trägt keine Rolle, die jagt oder fischt · " + R.akte,
                });
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const wer = () => "Bewohner " + z().bewohner + " (Berufe " + Object.keys(z().berufe).join("/") + "), Tiere " + z().kreaturen + ", zahm " + z().zahm;
            });
            await K.schritt(3, async () => K.nicht(3, { n: z().hirten, fehlt: "10² Tiere in einer Herde mit Hirte: " + z().hirten + " Hirten — " + wer() }));
            await K.schritt(4, async () => K.nicht(4, { n: z().zahm, fehlt: "10³ Haustiere aus der Wildfauna (32 Saaten): " + z().zahm + " zahme Tiere (bond ≥ 0,5)" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().jaeger, fehlt: "Fischerei und Aquakultur mit Bestand und Fang: kein Fischer, kein Fang — " + wer() }));
            await K.schritt(6, async () => K.nicht(6, { n: z().hirten, fehlt: "Wanderhirten über 10⁴ km²: " + z().hirten + " Hirten, keine Herde" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit Nutztieren und Zähmungs-Drift: die Sitzung trägt eine Welt, " + z().zahm + " zahme Tiere" }));
            // S1 zuletzt: der Spieler endet oben am Hang
            await K.schritt(1, async () => {
                const t = await ruf("TIER");
                K.zahl(1, {
                    n: t.n,
                    werte: { p95: t.p95, hub: t.hub },
                    beleg: "Hang " + t.hangGrad + "°, bond " + t.bond0 + " → " + t.bond1 + ", Aufgabe " + t.folgt + ", Gegenlauf: das ungebundene Tier " + t.frei + " m; Bestand " + t.wild + " Tiere, " + t.zahm + " zahm",
                    taeter: !(t.bond1 > 0 && t.folgt === "follow_player") ? "die Geste bindet nicht (stamm/kreatur-verhalten.js assignCreatureTask follow_player)" : !(t.frei > t.p95) ? "das ungebundene Tier steht ebenso nah — die Nähe misst keine Bindung" : !(t.p95 <= 5) ? "das gebundene Tier fällt über dem Hang zurück (stamm/kreatur-verhalten.js updateCreatures, Folgen)" : null,
                });
            });
        },
        seite: { ZENSUS, TIER, FAECHER, JAGD_AN },
        sprossen: {
            1: { umfang: { soll: 1, wort: "an den Spieler gebundenes Tier" }, masse: [{ key: "p95", wort: "Abstand p95 zum Spieler über den Hang (m)", soll: 5, richtung: "≤" }, { key: "hub", wort: "Anstieg des Wegs über den Hang (m)", soll: 0, richtung: ">" }] },
            2: { umfang: { soll: 1, wort: "jagende oder fischende Bewohner (je Saat, 8 Saaten)" }, masse: [{ key: "jagdJeTag", wort: "Jagden je Tag", soll: 1, richtung: "≥" }, { key: "wildDelta", wort: "Änderung des Wildbestands", soll: 0, richtung: "<" }], erwartet: "nicht", fehlt: "kein Bewohner jagt oder fischt" },
            3: { umfang: { soll: 100, wort: "Tiere in einer Herde mit Hirte" }, masse: [{ key: "gras", wort: "Rückgang der Grasdeckung nach 30 Tagen (Anteil)", soll: 0.2, richtung: "≥" }, { key: "viehpfad", wort: "Viehpfad im Boden (getretene Fläche, m²)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Herde, kein Hirte" },
            4: { umfang: { soll: 1000, wort: "Haustiere aus der Wildfauna" }, masse: [{ key: "haustier", wort: "Saaten mit Haustier", soll: 0.8, richtung: "≥" }, { key: "gestalt", wort: "Gestalt-Distanz Haustier ↔ Wildform im Soll (Anteil)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Haustiere" },
            5: { umfang: { soll: 1, wort: "Fischerei mit Bestand und Fang" }, masse: [{ key: "kollaps", wort: "Bestandsrückgang bei Übernutzung (Anteil)", soll: 0.5, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Fischerei" },
            6: { umfang: { soll: 1, wort: "Herde mit Wanderhirte über 10⁴ km²" }, masse: [{ key: "hoehenlinie", wort: "Herden auf der Weide-Höhenlinie", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "keine Wanderhirten" },
            7: { umfang: { soll: 64, wort: "Welten mit Nutztieren" }, masse: [{ key: "drift", wort: "Welten mit Zähmungs-Drift", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "64 Welten" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: das ungebundene Tier steht ebenso nah — kein gebundenes Tier im Umfang", j: { leiter: "mensch.nahrung.tier", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { p95: 3, hub: 4 } } } }, gruen: false, zahl: /ROT an Umfang 0 < 1 an den Spieler gebundenes Tier/ },
                { name: "ATTRAPPE: die Ebene statt des Hangs (der Weg steigt nicht, er fällt 0,4 m)", j: { leiter: "mensch.nahrung.tier", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { p95: 3, hub: -0.4 } } } }, gruen: false, zahl: /ROT an Anstieg des Wegs über den Hang \(m\) -0\.4 / },
            ],
        },
    }),

    // ───────── DER ERDBAU: Wasser am Acker (derselbe Leser wie gelaende.K2#1, die Bewohner statt des Spielers) ─────────
    F.leiter("mensch.nahrung.erdbau", {
        sek: 45,
        pfad: [...SIEDLUNG, "stamm/gelaende-*.js", "stamm/wasser-*.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const bau = (re) => Object.entries(z().slotRollen).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
            const rollen = () => Object.keys(z().slotRollen).join("/");
            await K.schritt(3, async () => {
                const n = bau(/terras|teich|damm|muehl|wehr/i);
                if (n < 1) return K.nicht(3, { n, fehlt: "Terrasse, Mühlteich, Damm: kein Erdbau der Bewohner im Plan (Rollen " + rollen() + ")" });
                const b = await K.bild(3, { px: z().nah.ox, py: "+60", pz: z().nah.oz + 60, lx: z().nah.ox, ly: "+0", lz: z().nah.oz });
                K.auge(3, { bild: b.datei, pose: "60 m über der Mitte des Dorfs, 60 m südlich", mass: n + " Erdbauten" });
            });
            await K.schritt(4, async () => K.nicht(4, { n: bau(/polder|deich|kanal|pumpe/i), fehlt: "Polder, Deich und Kanal über 10³ km²: keiner im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(5, async () => K.nicht(5, { n: bau(/talsperre|stau|tagebau/i), fehlt: "Talsperre oder Tagebau (10⁸ m³): keiner im Plan" }));
            await K.schritt(6, async () => K.nicht(6, { n: bau(/terras|teich|damm|polder|deich|kanal|tagebau/i), fehlt: "planetare Umformung über 1000 Jahre: die Bewohner formen kein Land, die Sitzung rafft Stunden" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "64 Welten mit Terraforming: die Sitzung trägt eine Welt" }));
            await K.schritt(2, async () => {
                const w = await ruf("WASSER", { felder: z().felder });
                H.zeile("Wasser am Acker: " + w.bewaessert + " von " + w.aecker + " gemalten Äckern, ohne Bach " + w.grabenOhneBach + ", Wuchs Δ " + w.gruenDelta);
                if (w.bewaessert < 1) return K.nicht(2, { n: 0, fehlt: "Bewohner bewässern: an " + w.aecker + " gemalten Äckern liegt keine gezeichnete Wasser-Fläche (der Leser von gelaende.K2#1) — kein Graben der Bewohner" });
                K.zahl(2, { n: w.bewaessert, werte: { gruenDelta: w.gruenDelta, grabenOhneBach: w.grabenOhneBach }, beleg: w.aecker + " Äcker, bewässert " + w.bewaessert, taeter: w.grabenOhneBach > 0 ? "Wasser am Acker ohne Bach im Umkreis 30 m" : null });
            });
        },
        seite: { ZENSUS, WASSER },
        bestehend: { 1: "gelaende.K2#1" },
        sprossen: {
            2: { umfang: { soll: 1, wort: "Acker, den Bewohner bewässern" }, masse: [{ key: "gruenDelta", wort: "Wuchs bewässert − unbewässert", soll: 0, richtung: ">" }, { key: "grabenOhneBach", wort: "Gräben an Äckern ohne Bach", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Bewohner bewässert" },
            3: { auge: { pose: "60 m über der Mitte des Dorfs, 60 m südlich", vorbild: "Luftbild realer Reisterrassen und Mühlteiche (Banaue, Schwarzwald): Blindurteil ≤ 65 %, Terrassen über der Hang-Schwelle ≥ 80 %" }, erwartet: "nicht", fehlt: "kein Erdbau der Bewohner" },
            4: { umfang: { soll: 1, wort: "Polder mit Deich, Kanal und Pumpe (10³ km²)" }, masse: [{ key: "polderVoll", wort: "Polder voll nach Pumpe aus (ja = 1)", soll: 1, richtung: "≥" }, { key: "bruchRelief", wort: "Flut des Deichbruchs folgt dem Gefälle (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Polder" },
            5: { umfang: { soll: 1, wort: "Talsperre oder Tagebau (≥ 10⁸ m³)" }, masse: [{ key: "seeFlaeche", wort: "Abweichung Stauseefläche", soll: 0.1, richtung: "≤" }, { key: "aue", wort: "Aue stromab geändert (Fläche, m²)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Talsperre" },
            6: { auge: { pose: "Orbit über der Welt, Jahr 0 und 1000", vorbild: "Satellitenbild der Erde mit Umformung (Polder, Terrassen, Tagebaue): ≥ 1 % Land umgeformt, plausibel ≥ 90 %" }, erwartet: "nicht", fehlt: "1000 Jahre Umformung" },
            7: { umfang: { soll: 64, wort: "Welten mit Terraforming" }, masse: [{ key: "r", wort: "Terrassenhöhe ↔ 1/g (r)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "64 Welten" },
        },
        proben: {
            2: [{ name: "ATTRAPPE: Wasser am Acker ohne Bach — ein gemalter Graben, kein Fluss speist ihn", j: { leiter: "mensch.nahrung.erdbau", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 2, werte: { gruenDelta: 0.05, grabenOhneBach: 1 } } } }, gruen: false, zahl: /ROT an Gräben an Äckern ohne Bach 1 / }],
        },
    }),

    // ───────── DER STROM DER NAHRUNG: Ernte → Vorrat → Mahl → Markt ─────────
    F.leiter("mensch.nahrung.strom", {
        sek: 60,
        mutiert: true, // S1 rafft die Welt-Uhr über zwei Tage (die Ernten und Mahle der Scheunen)
        pfad: [...SIEDLUNG, "stamm/siedlung-verkehr.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            await K.schritt(3, async () => K.nicht(3, { n: z().maerkte, fehlt: "10 Orte mit Markt, Preis und Wagen: " + z().maerkte + " Markt mit " + z().staende + " Ständen, " + z().wagen + " Wagen — kein Preis" }));
            await K.schritt(4, async () => K.nicht(4, { n: z().bewohner, fehlt: "10⁴ Bewohner mit Hunger und Überfluss: " + z().bewohner + " am Messort, keiner isst aus einem Vorrat" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().bewohner, fehlt: "eine Stadt ≥ 10⁸ vom Hinterland: " + z().bewohner + " Bewohner, kein Bissen hat Herkunft" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "16 Saaten × 100 Jahre: die Sitzung trägt eine Saat über Stunden" }));
            await K.schritt(1, async () => {
                const V = await ruf("STROM", { tage: 2 });
                H.zeile("Scheunen " + V.hoefe + " (" + (V.name || "") + "): Sägezahn " + V.saegezahn + " Ernten je Jahr an " + V.zahnHoefe + " Höfen, Paar Hof " + V.paar + " voll " + V.voll + " h, leer " + V.leer + " h · je Hof [Esser, Bauern, Ernten, Mahle] " + JSON.stringify(V.je));
                let vollLeer = 0, beleg = "";
                if (V.paar >= 0) {
                    const bildAn = async (zu, wort) => {
                        const o = await ruf("STROM", { zu, z0: V.z0, hof: V.paar });
                        const b = await K.bild(1 + "-" + wort, o.kam, { wahl: 0 });
                        return { ...o, datei: b.datei };
                    };
                    // die Uhr reist nur vorwärts: das Paar fällt auf dieselben Stunden des Tags nach dem gemessenen Fenster
                    const voll = await bildAn(V.voll + 24 * V.tage, "voll");
                    const leer = await bildAn(V.leer + 24 * V.tage, "leer");
                    vollLeer = voll.kisten >= 1 && leer.kisten === 0 ? 1 : 0;
                    beleg = "voll " + voll.n.toFixed(1) + " (" + voll.kisten + " Kisten, " + voll.datei + ") ↔ leer " + leer.n.toFixed(1) + " (" + leer.kisten + " Kisten, " + leer.datei + ")";
                }
                K.zahl(1, {
                    n: V.zahnHoefe > 0 ? 1 : 0,
                    werte: { saegezahn: V.saegezahn, vollLeer },
                    beleg: V.hoefe + " Scheunen, " + V.zahnHoefe + " mit Ernte und Mahl; " + beleg,
                    taeter: !V.hoefe ? "keine Scheune als Halter (stamm/siedlung-bewohner.js _scheuneAnlegen)" : !V.zahnHoefe ? "keine Ernte in die Scheune (koerper-core scheuneFassen)" : !vollLeer ? "die Scheune steht nie voll und leer (koerper-core BESTAND_GESETZ.mahl)" : null,
                });
            });
            // S2 AM GESETZ (der Fächer, zuletzt: er liest nur den Kern und den Genom-Roller, nie die geraffte Welt): 4 Saaten × dorf,
            // stadt, grossstadt × die Stunden um den Mittag (TAGES_GESETZ.mittag 12 ± 0,5) — trägt das Gesetz des Tags 10² beim Mahl,
            // urteilt die Sprosse am Leser der Speise: das Mahl ist eine Zahl je Kopf aus der Scheune (BESTAND_GESETZ.mahl), kein Korb
            // trägt sie vom Feld, kein Teller ein Gericht. Am Messort dorf misst der Zensus der Welt das Mahl des Dorfs daneben
            await K.schritt(2, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.TAG_AN, export: "koerper-core.js:5677 tagesPlan (:5503 tagesOrte · :5574 tagesBindung, fachwerk-core.js:11165 exportSettlement)", leser: "stamm/siedlung-bewohner.js:2637" },
                    adressen: { saaten: 4, orte: ["dorf", "stadt", "grossstadt"], zeiten: [11.5, 12, 12.5, 13, 13.5] },
                    masse: {
                        draussen: { wie: "max", feld: "draussen" },
                        beimMahl: { wie: "max", feld: "mahl" },
                        tisch: { wie: (v, aus) => aus.reduce((m, x) => Math.max(m, x.w.tisch ? x.w.tisch.n : 0), 0) },
                        hundert: { wie: (v, aus) => new Set(aus.filter((x) => x.w.draussen >= 100).map((x) => x.a.saat)).size },
                        saaten: { wie: (v, aus) => new Set(aus.map((x) => x.a.saat)).size },
                        je: { wie: (v, aus) => aus.reduce((o, x) => ((o[x.a.ort] = Math.max(o[x.a.ort] || 0, x.w.draussen)), o), {}) },
                        fenster: { wie: (v, aus) => aus.reduce((o, x) => ((o[x.a.zeit] = Math.max(o[x.a.zeit] || 0, x.w.draussen)), o), {}) },
                    },
                    schlecht: { feld: "draussen", richtung: "max" },
                    pose: (a, w) => "Saat " + a.saat + " " + a.ort + " (" + w.slots + " Häuser, " + w.leute + " Bewohner) um " + a.zeit + " Uhr: " +
                        (w.tisch ? "8 m diagonal vor dem Tisch am " + w.tisch.art + " bei (" + w.tisch.x + ", " + w.tisch.z + ") im Plan, Ego 1,7 m — " + w.tisch.n + " essen dort draußen, kein Gericht, kein Korb" : "kein Tisch draußen"),
                    ungemessen: [
                        "die Stände der Wirt-Bindung (ein Ort ohne freien Stand bindet neu, stamm/siedlung-bewohner.js:1043) und der Weg über das Netz (koerper-core tagesWege): der Fächer bindet nach dem Gesetz ohne Netz und ohne volle Orte, die Händler der Stände fehlen",
                        "das Bildpaar Mahl ↔ Foto (≤ 65 % trennbar): ungemessen bis zum Gerät — die Pose nennt der Fächer, die Sitzung steht am Dorf",
                    ],
                    ms: Math.max(4000, Math.floor((H.rest() - 3) * 1000)),
                });
                const W = R.werte;
                H.zeile("Mahl am Gesetz: " + R.akte.slice(0, 500) + " · je Größe " + JSON.stringify(W.je) + " · je Stunde " + JSON.stringify(W.fenster) + " · Dorf der Welt " + (Z ? Z.mahl + "/" + Z.bewohner : "—"));
                if (!R.gemessen) return K.nicht(2, { n: 0, fehlt: "10² Bewohner beim Mahl: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "keine Adresse des Fächers an der Frist") });
                if (W.draussen >= 100)
                    return K.leser(2, {
                        n: W.draussen,
                        fehlt: "Korb Feld → Teller und Gericht: das Gesetz des Tags trägt " + W.draussen + " draußen beim Mahl (" + W.hundert + " von " + W.saaten + " Saaten ≥ 10², am größten Tisch " + W.tisch +
                            "), doch das Mahl ist eine Zahl je Kopf aus der Scheune (6 Einheiten, die Ernte als Zahl in den Halter, koerper-core.js:5902) — kein Leib trägt einen Korb vom Feld, kein Teller ein Gericht",
                        wo: "koerper-core.js:5761",
                    });
                if (R.gerissen) throw new Error("10² beim Mahl an der Frist ungemessen: " + R.gerissen + " Adressen offen, gemessen höchstens " + W.draussen + " draußen");
                K.nicht(2, { n: W.draussen, fehlt: "10² Bewohner beim Mahl: das Gesetz des Tags trägt höchstens " + W.draussen + " draußen beim Mahl (" + JSON.stringify(W.je) + ")" });
            });
        },
        seite: { ZENSUS, STROM, FAECHER, TAG_AN },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Dorf mit Scheune, das erntet und lagert" }, masse: [{ key: "saegezahn", wort: "Sägezahn des Scheunen-Vorrats (Ernten je Jahr)", soll: 1, richtung: "≥" }, { key: "vollLeer", wort: "Scheune voll ↔ leer im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "zahl" },
            2: {
                auge: { pose: "8 m diagonal vor dem größten Tisch des Mahls um 12:30 Uhr an der schlechtesten Adresse des Fächers, Ego 1,7 m", vorbild: "Foto eines realen Dorf-Mahls (Gericht auf dem Teller, Korb vom Feld): ≤ 65 % vom Foto trennbar, der Korb Feld → Teller verfolgt" },
                erwartet: "leser",
                fehlt: "10² beim Mahl trägt das Gesetz des Tags (Stadt, Großstadt), das Mahl ist eine Zahl je Kopf aus der Scheune: kein Korb vom Feld, kein Gericht auf dem Teller",
                wo: "koerper-core.js:5761",
            },
            3: { umfang: { soll: 10, wort: "Orte mit Markt" }, masse: [{ key: "preisPlus", wort: "Preis in A nach Missernte", soll: 0.5, richtung: "≥" }, { key: "wagenAusB", wort: "Wagen aus B unterwegs", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10 Orte mit Markt und Preis" },
            4: { umfang: { soll: 1e4, wort: "Bewohner mit Hunger und Überfluss" }, masse: [{ key: "bevDuerre", wort: "Rückgang der Bevölkerung nach Dürre (Anteil)", soll: 0.1, richtung: "≥" }, { key: "wanderstrom", wort: "Wandernde nach der Dürre", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "10⁴ Bewohner, Hunger" },
            5: { umfang: { soll: 1e8, wort: "Einwohner einer Stadt vom Hinterland" }, masse: [{ key: "bissen", wort: "Bissen bis Feld/Stall verfolgt", soll: 0.9, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Stadt ≥ 10⁸" },
            6: { umfang: { soll: 16, wort: "Saaten × 100 Jahre" }, masse: [{ key: "hungerOhne", wort: "Hunger ohne Ursache", soll: 0, richtung: "≤" }], erwartet: "nicht", fehlt: "16 Saaten × 100 Jahre" },
        },
        proben: {
            3: [{ name: "ATTRAPPE: der Preis steigt, doch kein Wagen aus B fährt — der Strom ist nur eine Zahl", j: { leiter: "mensch.nahrung.strom", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 10, werte: { preisPlus: 0.6, wagenAusB: 0 } } } }, gruen: false, zahl: /ROT an Wagen aus B unterwegs 0 / }],
        },
    }),

    // ───────── DIE HAND: der Spieler sammelt, bestellt; die Bewohner arbeiten ─────────
    F.leiter("mensch.nahrung.hand", {
        sek: 60,
        mutiert: true,
        pfad: [...SIEDLUNG, "stamm/vegetation-wiese.js", "stamm/feld-leben.js", "stamm/kampf.js", "stamm/koerper-seele.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            let G = null, gf = "";
            try {
                G = await ruf("HAND", { felder: Z ? Z.felder : [] });
                H.zeile("gepflückt " + G.art + " (" + G.d + " m): fort " + G.weg + ", Ernte +" + G.ernte + " " + G.ernteStoff + ", Dauer " + G.dauerH + " h, früh " + G.frueh + ", zurück " + G.zurueck + " nach " + G.takte + " Takten");
            } catch (e) {
                gf = String((e && e.message) || e).slice(0, 200);
            }
            const g = () => {
                if (!G) throw new Error("keine Messung der Hand: " + gf);
                return G;
            };
            await K.schritt(2, async () => {
                const P = await ruf("BESTELLEN", { nur: "pose" });
                if (P.fehlt) return K.leser(2, { fehlt: P.fehlt, wo: "stamm/kampf.js:2308" });
                const vor = await K.bild("2-vor", P.pose, { wahl: 0 });
                const B = await ruf("BESTELLEN", {});
                H.zeile("bestellt: " + JSON.stringify(B));
                if (!B.tat) return K.zahl(2, { n: 0, werte: { furchen: 0 }, taeter: B.fehlt || "keine Tat (stamm/kampf.js tryMouseBreak)" });
                const nach = await K.bild("2-nach", P.pose, { wahl: 0 });
                const furchen = B.kaemme > 0 && B.achse === B.zug && vor.datei !== nach.datei ? 1 : 0;
                K.zahl(2, {
                    n: 1,
                    werte: { furchen },
                    beleg: "Acker " + B.acker + ": " + B.klicks + " Klicks, " + B.kaemme + " Kämme in Achse " + B.achse + " (Zug " + B.zug + "); Bildpaar " + vor.datei + " ↔ " + nach.datei,
                    taeter: !furchen ? (B.kaemme > 0 ? "die Furchen laufen quer zum Zug (stamm/siedlung-wege.js _ackerBestellen)" : "das Stück trägt keinen Kamm (stamm/siedlung-wege.js _ackerKoerperTakt)") : null,
                });
            });
            await K.schritt(4, async () => K.nicht(4, { n: g().bodenGeaendert, fehlt: "Werkzeug jeder Epoche mit Spur: nach " + g().dauerH + " gerafften Stunden änderte die Arbeit den Boden an " + g().bodenGeaendert + " von " + g().aecker + " Äckern" }));
            await K.schritt(5, async () => K.nicht(5, { n: z().bewohner, fehlt: "ein Fest des Jahres mit 10³ Menschen in der Erntezeit (16 Saaten): " + z().bewohner + " Bewohner, keine Erntezeit" }));
            await K.schritt(6, async () => K.nicht(6, { n: g().weg, fehlt: "20 Zufallsrollen der Nahrung: der Spieler spielt " + g().weg + " (das Sammeln) — kein Bestellen, Hüten, Fischen, Kochen" }));
            await K.schritt(1, async () =>
                K.zahl(1, {
                    // „der Spieler sammelt“: die Ernte liegt im Inventar (der Umfang); verschwindet und kehrt sind die Maße
                    n: g().ernte >= 1 ? 1 : 0,
                    werte: { weg: g().weg, frueh: g().frueh, zurueck: g().zurueck },
                    beleg: g().art + " " + g().d + " m vom Spieler, Ernte +" + g().ernte + " " + g().ernteStoff + ", Nachwuchs-Zeit " + g().dauerH + " Welt-Stunden, zurück nach " + g().takte + " Takten",
                    taeter: !g().weg ? "die Pflanze bleibt im Block (stamm/vegetation-wiese.js _streuNehmen)" : g().frueh ? "die Pflanze kehrt vor ihrer Nachwuchs-Zeit (stamm/vegetation-wiese.js _tickScatterRegrow)" : !g().zurueck ? "die Pflanze kehrt nach ihrer Nachwuchs-Zeit nicht (stamm/vegetation-wiese.js _nahStreuTat / _tickNahStreu)" : null,
                })
            );
            // S3 AM GESETZ (der Fächer, zuletzt: er liest nur den Kern und den Genom-Roller): 4 Saaten × metropole (das Dorf misst der
            // Zensus der Welt) × die Stunden der Arbeit — trägt das Gesetz des Tags 50 am Acker, urteilt die Sprosse am Leser der Arbeit:
            // der Acker liest nur die Tat des Spielers (bestellen), die Arbeit der Bewohner hat keine Fläche je Stunde und keine Haltung.
            // Die Saat 4 geht voran: am Kern trägt sie 122 am Acker (headless, 24.11.), eine Metropole bindet ~7 s — die Frist der
            // Sitzung reißt sonst vor ihr; die Saaten 1–3 (am Kern 0–22) folgen
            await K.schritt(3, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.TAG_AN, export: "koerper-core.js:5677 tagesPlan (:5503 tagesOrte · :5574 tagesBindung, fachwerk-core.js:11165 exportSettlement)", leser: "stamm/siedlung-bewohner.js:2637" },
                    adressen: { saaten: [4, 1, 2, 3], orte: ["metropole"], zeiten: [8, 10, 15] },
                    masse: {
                        amAcker: { wie: "max", feld: "amAcker" },
                        jeAcker: { wie: "max", feld: "jeAcker" },
                        nah60: { wie: "max", feld: "nah60" },
                        bauern: { wie: "max", feld: "bauern" },
                        fuenfzig: { wie: (v, aus) => new Set(aus.filter((x) => x.w.amAcker >= 50).map((x) => x.a.saat)).size },
                        saaten: { wie: (v, aus) => new Set(aus.map((x) => x.a.saat)).size },
                        je: { wie: (v, aus) => aus.reduce((o, x) => ((o[x.a.saat] = Math.max(o[x.a.saat] || 0, x.w.amAcker)), o), {}) },
                    },
                    schlecht: { feld: "nah60", richtung: "max" },
                    pose: (a, w) => "Saat " + a.saat + " " + a.ort + " um " + a.zeit + " Uhr: " + (w.acker ? "12 m diagonal vor dem Acker bei (" + w.acker.x + ", " + w.acker.z + ") im Plan, Ego 1,7 m — " + w.acker.n + " an ihm, " + w.nah60 + " im Umkreis 60 m" : "kein Bewohner am Acker"),
                    ungemessen: [
                        "die Stände der Wirt-Bindung (ein Ort ohne freien Stand bindet neu, stamm/siedlung-bewohner.js:1043) und der Weg über das Netz (koerper-core tagesWege): der Fächer bindet nach dem Gesetz ohne Netz und ohne volle Orte",
                        "das Bildpaar Erntetag ↔ Foto (≤ 65 % trennbar): ungemessen bis zum Gerät — die Pose nennt der Fächer, die Sitzung steht am Dorf",
                        "die Fläche je Stunde (± 30 % gegen Sichel 0,1 ha und Sense 0,2–0,4 ha je Kopf und Tag): das Gesetz trägt keine — die Herstellung des Ackers zählt Kraut je Stunde (koerper-core.js:5732)",
                    ],
                    ms: Math.max(4000, Math.floor((H.rest() - 3) * 1000)),
                });
                const W = R.werte;
                H.zeile("Feldarbeit am Gesetz: " + R.akte.slice(0, 500) + " · je Saat " + JSON.stringify(W.je) + " · Dorf der Welt um 10 Uhr " + (Z ? Z.feld10 + "/" + Z.bewohner : "—"));
                if (!R.gemessen) return K.nicht(3, { n: 0, fehlt: "50 Bewohner bei der Feldarbeit: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "keine Adresse des Fächers an der Frist") });
                if (W.amAcker >= 50)
                    return K.leser(3, {
                        n: W.amAcker,
                        fehlt: "Fläche je Stunde und sichtbare Arbeit: das Gesetz des Tags trägt " + W.amAcker + " am Acker (" + W.fuenfzig + " von " + W.saaten + " Saaten ≥ 50, an einem Acker höchstens " + W.jeAcker + ", im Umkreis 60 m " + W.nah60 +
                            "), doch der Acker liest nur die Tat des Spielers — die Arbeit der Bewohner ändert keinen Acker (keine Fläche je Stunde, die Herstellung zählt Kraut, koerper-core.js:5732) und zeigt keine Feldarbeit (die Haltung jedes Werks ist dieselbe leichte Vorlage pwalk, koerper-core.js:5432)",
                        wo: "stamm/siedlung-wege.js:2975",
                    });
                if (R.gerissen) throw new Error("50 am Acker an der Frist ungemessen: " + R.gerissen + " Adressen offen, gemessen höchstens " + W.amAcker);
                K.nicht(3, { n: W.amAcker, fehlt: "50 Bewohner bei der Feldarbeit: das Gesetz des Tags trägt höchstens " + W.amAcker + " am Acker (" + JSON.stringify(W.je) + ")" });
            });
        },
        seite: { ZENSUS, HAND, BESTELLEN, FAECHER, TAG_AN },
        sprossen: {
            1: { umfang: { soll: 1, wort: "gesammelte Wildpflanze im Inventar" }, masse: [{ key: "weg", wort: "Pflanze fort nach dem Pflücken", soll: 1, richtung: "≥" }, { key: "frueh", wort: "Gegenlauf: zurück vor der Nachwuchs-Zeit", soll: 0, richtung: "≤" }, { key: "zurueck", wort: "zurück nach der Nachwuchs-Zeit", soll: 1, richtung: "≥" }] },
            2: { umfang: { soll: 1, wort: "vom Spieler bestellter Acker" }, masse: [{ key: "furchen", wort: "Furchen in Zugrichtung im Bildpaar (ja = 1)", soll: 1, richtung: "≥" }], erwartet: "zahl" },
            3: {
                auge: { pose: "12 m diagonal vor dem Acker mit den meisten Bewohnern im Umkreis 60 m an der schlechtesten Adresse des Fächers, Ego 1,7 m", vorbild: "Foto eines realen Erntetags (50 Menschen bei der Ernte): ≤ 65 % trennbar; Fläche je Stunde ± 30 % gegen Agrargeschichte" },
                erwartet: "leser",
                fehlt: "50 am Acker trägt das Gesetz des Tags (Metropole), keiner ändert ihn: der Acker liest nur die Tat des Spielers, die Arbeit hat keine Fläche je Stunde und keine Haltung",
                wo: "stamm/siedlung-wege.js:2975",
            },
            4: { umfang: { soll: 1, wort: "Feldarbeit, die den Acker ändert (je Werkzeug und Epoche)" }, masse: [{ key: "haTag", wort: "Abweichung ha/Tag gegen Agrargeschichte", soll: 0.3, richtung: "≤" }, { key: "spur", wort: "Spur je Werkzeug erkannt", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "die Arbeit ändert den Acker nicht" },
            5: { umfang: { soll: 1000, wort: "Menschen am Fest des Jahres" }, masse: [{ key: "festErnte", wort: "Saaten mit Fest in der Erntezeit der eigenen Frucht", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Fest, keine Erntezeit" },
            6: { umfang: { soll: 20, wort: "Zufallsrollen der Nahrung" }, masse: [{ key: "spielbarS", wort: "Zeit bis spielbar p95 (s)", soll: 5, richtung: "≤" }, { key: "aendert", wort: "Tat ändert die Welt", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Rolle der Nahrung statt 20" },
        },
        proben: {
            1: [{ name: "ATTRAPPE: die Pflanze steht vor ihrer Nachwuchs-Zeit wieder (der Block baut sie sofort neu)", j: { leiter: "mensch.nahrung.hand", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { weg: 1, frueh: 1, zurueck: 1 } } } }, gruen: false, zahl: /ROT an Gegenlauf: zurück vor der Nachwuchs-Zeit 1 / }],
        },
    }),

    // ───────── JENSEITS DES ACKERS: Garten, Gewächshaus, Turm, Ozean ─────────
    F.leiter("mensch.nahrung.jenseits", {
        sek: 35,
        pfad: [...SIEDLUNG],
        messe: async (H, K) => {
            await K.messort("dorf");
            const ms = () => Math.max(5000, Math.floor((H.rest() - 3) * 1000));
            const ruf = (name, arg) => K.welt("return await (" + H.seite[name] + ")(r, T, " + JSON.stringify(arg || {}) + ");", ms());
            let Z = null, zf = "";
            try {
                Z = await ruf("ZENSUS");
            } catch (e) {
                zf = String((e && e.message) || e).slice(0, 200);
            }
            const z = () => {
                if (!Z) throw new Error("kein Zensus der Siedlung: " + zf);
                return Z;
            };
            const bau = (re) => Object.entries(z().slotRollen).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
            const rollen = () => Object.keys(z().slotRollen).join("/");
            await K.schritt(2, async () => K.nicht(2, { n: bau(/gewaechs|glas|treib/i), fehlt: "ein Gewächshausmeer von 10² km²: kein Gewächshaus im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(3, async () => K.nicht(3, { n: bau(/nahrungsturm|vertikal|farm/i), fehlt: "Nahrungstürme einer Megastadt: keiner im Plan (Rollen " + rollen() + ")" }));
            await K.schritt(4, async () => K.nicht(4, { n: bau(/ozean|aqua|fischzucht/i), fehlt: "eine Ozeanfarm: keine im Plan" }));
            await K.schritt(5, async () => K.nicht(5, { n: 1, fehlt: "64 Saaten mit Habitat-Agrar: die Sitzung trägt eine Saat ohne Habitat" }));
            await K.schritt(6, async () => K.nicht(6, { n: 1, fehlt: "16 Saaten über Sonnensysteme mit Import: die Sitzung trägt eine Welt" }));
            // S1 AM GESETZ (der Fächer): 12 Saaten × dorf, stadt — die Rollen der Pläne (die Rollen-Tafel BAU_NUTZUNG) und die Region
            // der Saat (das Klima); den Garten trägt nur das Hof-Gesetz (fachwerk-core.js:4196 hofFuer: zwei Beete hinter dem ländlichen
            // Wohnhaus), das kein Leser der Welt baut (buildInstance → buildStufe ohne hofFuer, fachwerk-core.js:7081)
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.GARTEN_AN, export: "fachwerk-core.js:11165 exportSettlement (Rollen der Slots, BAU_NUTZUNG :2686)", leser: "stamm/siedlung-bewohner.js:1076" },
                    adressen: { saaten: 12, orte: ["dorf", "stadt"] },
                    masse: {
                        gewaechshaus: { wie: "summe", feld: "gewaechshaus" },
                        garten: { wie: "summe", feld: "garten" },
                        wohnhaus: { wie: "summe", feld: "wohnhaus" },
                        tafel: { wie: "max", feld: "tafel" },
                        tafelGarten: { wie: "max", feld: "tafelGarten" },
                        rollen: { wie: (v, aus) => [...new Set(aus.flatMap((x) => Object.keys(x.w.rollen)))].sort() },
                        klima: { wie: (v, aus) => [...new Set(aus.map((x) => x.w.region))].sort() },
                    },
                    schlecht: { feld: "wohnhaus", richtung: "max" },
                    pose: (a, w) => "Saat " + a.saat + " " + a.ort + " (" + w.region + ", " + w.wohnhaus + " Wohnhäuser): 10 m diagonal hinter dem ersten ländlichen Wohnhaus, Ego 1,7 m — dort stünden die Beete des Hof-Gesetzes",
                    ungemessen: [
                        "die Beete des Hof-Gesetzes (fachwerk-core.js:4196, 62 % der ländlichen Wohnhäuser): kein Export des Plans nennt sie, kein Leser der Welt baut sie — gezählt sind die Rollen",
                        "das Bildpaar Garten ↔ Foto (≤ 65 %): ungemessen bis zum Gerät — die Pose nennt der Fächer",
                    ],
                    ms: Math.max(4000, Math.floor((H.rest() - 3) * 1000)),
                });
                const W = R.werte;
                H.zeile("Garten am Gesetz: " + R.akte.slice(0, 500) + " · Rollen " + (W.rollen || []).join("/") + " · Klima " + (W.klima || []).join("/"));
                if (!R.gemessen) return K.nicht(1, { n: 0, fehlt: "Gewächshaus und Garten im Ort: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "keine Adresse des Fächers an der Frist") });
                if (!(W.gewaechshaus > 0 && W.garten > 0))
                    return K.nicht(1, {
                        n: W.gewaechshaus + W.garten,
                        fehlt: "Gewächshaus und Garten im Ort: an " + R.gemessen + " Plänen (" + W.klima.join(", ") + ") trägt kein Slot die Rolle (Gewächshaus " + W.gewaechshaus + ", Garten " + W.garten + "; die Rollen-Tafel kennt " + W.tafel +
                            " Rollen, " + W.tafelGarten + " davon Garten oder Glas) — der Garten lebt nur als zwei Beete hinter dem ländlichen Wohnhaus im Hof-Gesetz (fachwerk-core.js:4196), ohne Klima, und kein Leser der Welt baut ihn (fachwerk-core.js:7081)",
                    });
                const gt = z().garten;
                if (!gt) throw new Error("das Gesetz trägt Garten und Gewächshaus, der Plan am Messort keinen (Rollen " + rollen() + ")");
                const b = await K.bild(1, { px: gt.x + 10, py: "+1.7", pz: gt.z + 10, lx: gt.x, ly: "+1.0", lz: gt.z });
                K.auge(1, { bild: b.datei, pose: "10 m diagonal vor dem ersten Garten/Gewächshaus, Ego 1,7 m", mass: gt.rolle });
            });
        },
        seite: { ZENSUS, FAECHER, GARTEN_AN },
        sprossen: {
            1: {
                auge: { pose: "10 m diagonal vor dem ersten Garten/Gewächshaus, Ego 1,7 m (am Gesetz: hinter dem ländlichen Wohnhaus der schlechtesten Adresse)", vorbild: "Bildpaar realer Bauerngarten und Gewächshaus (Mitteleuropa): ≤ 65 % trennbar, nur in passendem Klima" },
                erwartet: "nicht",
                fehlt: "keine Rolle Garten oder Gewächshaus in der Rollen-Tafel; die Beete des Hof-Gesetzes lesen kein Klima und baut kein Leser der Welt",
            },
            2: { auge: { pose: "Orbit über dem Ort", vorbild: "Satellitenbild Almería (Gewächshausmeer, Albedo-Fleck): Blindurteil ≤ 65 %" }, erwartet: "nicht", fehlt: "kein Gewächshausmeer" },
            3: { umfang: { soll: 1, wort: "Nahrungsturm einer Megastadt" }, masse: [{ key: "r", wort: "Stadtnahrung ↔ Bodenpreis (r)", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "kein Nahrungsturm" },
            4: { umfang: { soll: 1, wort: "Ozeanfarm" }, masse: [{ key: "r", wort: "Farmfläche ↔ Küstenbevölkerung (r)", soll: 0, richtung: ">" }], erwartet: "nicht", fehlt: "keine Ozeanfarm" },
            5: { umfang: { soll: 64, wort: "Saaten mit Habitat-Agrar" }, masse: [{ key: "anteil", wort: "Saaten, die sich sichtbar ernähren", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "64 Saaten mit Habitat" },
            6: { umfang: { soll: 16, wort: "Saaten über Sonnensysteme" }, masse: [{ key: "import", wort: "Welten ohne Überschuss, die sichtbar importieren", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "16 Saaten über Sonnensysteme" },
        },
        proben: {
            3: [{ name: "ATTRAPPE: ein Turm steht, seine Nahrung folgt keinem Bodenpreis (r 0,2)", j: { leiter: "mensch.nahrung.jenseits", adapter: PROBE, sprossen: { 3: { art: "zahl", n: 1, werte: { r: 0.2 } } } }, gruen: false, zahl: /ROT an Stadtnahrung ↔ Bodenpreis \(r\) 0\.2 / }],
        },
    }),
];
// die Gesetze der Fächer für den Lauf am Kern ohne Welt (das Werkzeug ruft dieselben Seiten-Funktionen)
module.exports.TAG_AN = TAG_AN;
module.exports.FLUR_AN = FLUR_AN;
module.exports.GARTEN_AN = GARTEN_AN;
