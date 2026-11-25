// DIE PERSPEKTIVE menge DES KAPITELS mensch (Meisterkarte 2, k2-mensch.js lädt sie): je Leiter EINE Probe in der warmen Welt der
// Sitzung am Messort stadt-voll (295 Häuser, 1092 Bewohner, der Spieler am Markt im Gedränge). Die höheren Sprossen der Leitern, deren
// S1 schon eine Station urteilt (g2.js karte2.mensch.menge.bild/bevoelkerung/kollektiv, mensch.K2#2, mensch.K5#1), messen mit
// DERSELBEN Art Messung im größeren Umfang: das Bild wie platzAcht (Third, Frustum, freie Sichtlinie, gehend ≥ 0,5 m in 8 Spiel-s),
// die Personen am Soll wie dorfZaehlung (`_bewohnerSoll`, der Leib am Ort, drinnen an der Tür, der Fahrer am Steuer), die Tat wie
// zeugenGang (das Kitz, `damageCreature` vom Spieler, die Zeugen ≤ zeugeM, ihr Abstand vor und nach), der Tag wie die Probe
// bewohner (die Uhr springt, der Takt der Leute mit der Uhr des Spiels). Die Seite der Welt (STADT, ZENSUS, POSE) ist die EINE aus
// k2-mensch-geist.js.
"use strict";
const { STADT, ZENSUS, POSE } = require("./k2-mensch-geist.js");
const { SAATEN } = require("./sitzung-seite.js");

// 20 STICHPROBEN-PERSONEN (bevoelkerung S2): um die Stunde des Werks (Wohnort ≠ Arbeitsort) springt die Uhr, jeder kommt an, dann
// 2 Spiel-Sekunden im Takt des Spiels (wie dorfZaehlung je Ort); je Person über die Liste gestreut ihr Soll der Stunde
// (`_bewohnerSoll`): drinnen → drinnen; am Steuer → der Leib auf dem Sitz ≤ 2 m am Wagen; sonst der gezeichnete Leib ≤ 2 m am Ziel
const STICHPROBE = async (r, T, arg, HILF) => {
    const { s, A, S, L, ab } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    s.renderer.setAnimationLoop(null);
    HILF.uhrAuf(arg.uhr);
    await HILF.takt(Math.round(2 / A.TAKT_DECKEL_S));
    const h = HILF.stunde();
    const gez = (g) => !!g && !g.userData._drinnen && (g.visible || g.userData._satz === true || !!(r._kzBesitztFeld && r._kzBesitztFeld(g)));
    const wahl = [];
    for (let i = 0; i < arg.n; i++) wahl.push(L[Math.floor(((i + 0.5) * L.length) / arg.n)]);
    let an = 0, pendler = 0;
    const wer = [];
    for (const b of wahl) {
        const z = r._bewohnerSoll(b, h);
        const g = b.leib;
        const amWagen = !!(z.ziel && b.wagen && b.wagen.entry && z.ziel === b.wagen.entry.position);
        let ok = false, d = null;
        if (z.drinnen) ok = !!b.drinnen || !!(g && g.userData._drinnen);
        else if (amWagen) {
            d = g ? ab(g.position, b.wagen.gleitJetzt || b.wagen.entry.position) : null;
            ok = !!b.amSteuer && d != null && d <= 2;
        } else {
            d = g && z.ziel ? ab(g.position, z.ziel) : null;
            ok = d != null && d <= 2 && gez(g);
        }
        if (ok) an++;
        else if (wer.length < 3) wer.push((b.rolle || b.beruf || "?") + " " + z.akt + (z.drinnen ? " drinnen" : "") + (d != null ? " " + d.toFixed(1) + " m" : " ohne Leib"));
        if (b.orte && b.orte.werk && b.orte.heim && ab(b.orte.werk, b.orte.heim) > 20) pendler++;
    }
    return { bewohner: L.length, haeuser: S.plan && Array.isArray(S.plan.slots) ? S.plan.slots.length : 0, stichproben: wahl.length, angetroffen: an, pendler, wer, uhr: +h.toFixed(2) };
};

// DIE MENGE IM BILD (bild S2) wie platzAcht: Third an der Pose des Messorts, die Uhr auf 8, das EINE Warten (`__gebautNach`: jeder
// angekommen, jeder Leib mit Feld), 8 Spiel-Sekunden im Takt des Spiels; gezählt je Stand (Hülle mit `_feldLageVon` und `heim`):
// gezeichnet, nicht drinnen, die Brust im Frustum der Spiel-Kamera, die Sichtlinie frei von Hausgrundrissen (ab dem Rand des
// Grundrisses unter dem Auge), gehend ≥ 0,5 m; die Zwillinge: im Bild zwei oder mehr mit derselben Gestalt, denselben Farben und
// derselben Höhe (cm)
const MENGE_BILD = async (r, T, arg, HILF) => {
    const { s, A, L } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    s.renderer.setAnimationLoop(null);
    if (s.cameraMode !== "third") r.setCameraMode("third");
    HILF.uhrAuf(arg.uhr);
    const takte = await window.__gebautNach("die Menge im Bild um " + arg.uhr + " Uhr", {
        fertig: () => {
            const o = r._weltOffen();
            return !o.leute && !o.leiber;
        },
    });
    const cam = s.camera;
    const leiber = () => s.scene.children.filter((o) => o && o.userData && o.userData._feldLageVon && o.userData.heim != null);
    const gez = (g) => !g.userData._drinnen && (g.visible || g.userData._satz === true || !!(r._kzBesitztFeld && r._kzBesitztFeld(g)));
    const p0 = new Map(leiber().map((g) => [g, { x: g.position.x, z: g.position.z }]));
    await HILF.takt(Math.round(8 / A.TAKT_DECKEL_S));
    cam.updateMatrixWorld(true);
    const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const auge = cam.getWorldPosition(new T.Vector3());
    const augeImHaus = r._imGrundriss(auge.x, auge.z, 0) === "haus";
    let imBild = 0, gehend = 0, alle = 0;
    const aus = { drinnen: 0, ungezeichnet: 0, ausserBild: 0, verdeckt: 0 };
    const gesicht = new Map();
    for (const g of leiber()) {
        alle++;
        if (g.userData._drinnen) {
            aus.drinnen++;
            continue;
        }
        if (!gez(g)) {
            aus.ungezeichnet++;
            continue;
        }
        const brust = new T.Vector3(g.position.x, g.position.y + 0.4, g.position.z);
        if (!fr.containsPoint(brust)) {
            aus.ausserBild++;
            continue;
        }
        const d = auge.distanceTo(brust);
        let frei = true, raus = !augeImHaus;
        for (let t = 0.6; t < d - 0.6 && frei; t += 0.5) {
            const k = t / d, h = r._imGrundriss(auge.x + (brust.x - auge.x) * k, auge.z + (brust.z - auge.z) * k, 0) === "haus";
            if (!raus) raus = !h;
            else if (h) frei = false;
        }
        if (!frei) {
            aus.verdeckt++;
            continue;
        }
        imBild++;
        const a = p0.get(g);
        if (a && Math.hypot(g.position.x - a.x, g.position.z - a.z) >= 0.5) gehend++;
        const b = g.userData._feldLageVon.b;
        if (b) {
            const k = b.gestalt + "|" + JSON.stringify(b.farben || null) + "|" + Number(b.groesse || 0).toFixed(2);
            gesicht.set(k, (gesicht.get(k) || 0) + 1);
        }
    }
    const zwillinge = [...gesicht.values()].filter((n) => n > 1).reduce((x, n) => x + n, 0);
    return { imBild, gehend, zwillinge, leiber: alle, aus, auge: auge.toArray().map((v) => +v.toFixed(1)), tod: +s.timeOfDay.toFixed(4), sicht: s.cameraMode, takte };
};

// DER STROM (dichte S2, S3, S4): um 8 Uhr (der Weg zum Werk) je Spiel-Sekunde im Takt des Spiels die Lage jedes Bewohners draußen
// binnen des Radius am Spieler; gehend über 0,3 m/s. Die Achse des Stroms aus den Richtungen der Gehenden (axial gemittelt), je
// Gehendem seine Nachbarn im Band ±0,6 m quer, ±6 m längs: Φ_i = ((gleich − gegen) ÷ (gleich + gegen))², Φ das Mittel (1 = Spuren);
// der Gegenstrom: 2 × die kleinere Richtung (ohne Gegenstrom ist Φ = 1 trivial — das Maß zählt ihn als Umfang). Die Dichte je
// Gehendem: alle draußen binnen 1,5 m ÷ (π · 1,5²); v(ρ) je Dichte-Klasse gegen Weidmann (1993) v = 1,34 · (1 − e^(−1,913 · (1/ρ − 1/5,4)))
const STROM = async (r, T, arg, HILF) => {
    const { s, A, L } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    s.renderer.setAnimationLoop(null);
    HILF.uhrAuf(arg.uhr);
    const bis = performance.now() + arg.ms;
    const lage = () => new Map(HILF.draussen(arg.radius).filter((b) => !b.amSteuer).map((b) => [b, { x: b.leib.position.x, z: b.leib.position.z }]));
    const proS = Math.round(1 / A.TAKT_DECKEL_S);
    let vor = lage();
    const reihen = [];
    for (let t = 1; t <= arg.sek && performance.now() < bis; t++) {
        await HILF.takt(proS);
        const jetzt = lage(), reihe = [];
        for (const [b, p] of jetzt) {
            const q = vor.get(b);
            if (q) reihe.push({ b, x: p.x, z: p.z, vx: p.x - q.x, vz: p.z - q.z });
        }
        reihen.push(reihe);
        vor = jetzt;
    }
    const V = 0.3;
    let c2 = 0, s2 = 0;
    for (const rh of reihen)
        for (const p of rh)
            if (Math.hypot(p.vx, p.vz) > V) {
                const a = Math.atan2(p.vz, p.vx);
                c2 += Math.cos(2 * a);
                s2 += Math.sin(2 * a);
            }
    const th = 0.5 * Math.atan2(s2, c2), ux = Math.cos(th), uz = Math.sin(th);
    const plus = new Set(), minus = new Set(), geher = new Set(), phi = [], dichte = [];
    let maxGleich = 0;
    for (const rh of reihen) {
        const g = rh.filter((p) => Math.hypot(p.vx, p.vz) > V);
        maxGleich = Math.max(maxGleich, g.length);
        let sum = 0, nn = 0;
        for (const p of g) {
            geher.add(p.b);
            const si = p.vx * ux + p.vz * uz >= 0 ? 1 : -1;
            (si > 0 ? plus : minus).add(p.b);
            let ns = 0, no = 0;
            for (const q of g) {
                if (q === p) continue;
                const dx = q.x - p.x, dz = q.z - p.z;
                if (Math.abs(-dx * uz + dz * ux) < 0.6 && Math.abs(dx * ux + dz * uz) < 6) {
                    if ((q.vx * ux + q.vz * uz >= 0 ? 1 : -1) === si) ns++;
                    else no++;
                }
            }
            if (ns + no) {
                sum += ((ns - no) / (ns + no)) ** 2;
                nn++;
            }
            let k = 0;
            for (const q of rh) if (Math.hypot(q.x - p.x, q.z - p.z) < 1.5) k++;
            dichte.push({ rho: k / (Math.PI * 2.25), v: Math.hypot(p.vx, p.vz) });
        }
        phi.push(nn ? sum / nn : null);
    }
    let zeit = 999;
    for (let i = 0; i < phi.length; i++)
        if (phi[i] != null && phi[i] >= 0.7) {
            zeit = i + 1;
            break;
        }
    const spaet = phi.slice(-5).filter((x) => x != null);
    const W = (rho) => 1.34 * (1 - Math.exp(-1.913 * (1 / rho - 1 / 5.4)));
    // die Dichte-Klassen über den Bereich des Wortlauts 0,5–4 P/m² (die letzte schließt 4 ein); gemessen ist eine Klasse ab 5 Proben
    const KLASSEN = [[0.5, 1], [1, 1.5], [1.5, 2], [2, 3], [3, 4]];
    const klassen = [];
    for (const [a, b] of KLASSEN) {
        const q = dichte.filter((d) => d.rho >= a && (b === 4 ? d.rho <= b : d.rho < b));
        if (q.length < 5) continue;
        const rho = q.reduce((x, d) => x + d.rho, 0) / q.length, v = q.reduce((x, d) => x + d.v, 0) / q.length;
        klassen.push({ von: a, bis: b, n: q.length, rho: +rho.toFixed(2), v: +v.toFixed(2), weidmann: +W(rho).toFixed(2), ab: +(Math.abs(v - W(rho)) / W(rho)).toFixed(3) });
    }
    return {
        sek: reihen.length,
        radius: arg.radius,
        plus: plus.size,
        minus: minus.size,
        gegenstrom: 2 * Math.min(plus.size, minus.size),
        geher: geher.size,
        maxGleich,
        zeit,
        ordnung: spaet.length ? +(spaet.reduce((x, y) => x + y, 0) / spaet.length).toFixed(3) : null,
        phi: phi.map((x) => (x == null ? null : +x.toFixed(2))),
        abweichung: klassen.length ? klassen.reduce((m, k) => Math.max(m, k.ab), 0) : null,
        dichteBis: +dichte.reduce((m, d) => Math.max(m, d.rho), 0).toFixed(2),
        abdeckung: +(klassen.length / KLASSEN.length).toFixed(3),
        klassen,
        proben: dichte.length,
    };
};

// DIE WEGE JE STUNDE (rhythmus S2–S7): je Stunde 0–23 springt die Uhr (jeder kommt an), dann ein Fenster von fensterH Spielstunden
// mit der Uhr des Spiels (`_uhrSetzen` „uhr“, der Takt der Leute je DT, wie die Probe bewohner); ein Weg beginnt, wenn das Ziel eines
// Bewohners um mehr als 2 m springt. Wege/h = Beginne ÷ fensterH. Die Spitzen: zusammenhängende Stunden mit ≥ der Hälfte der
// höchsten; Spitze zu Tal: die kleinere der zwei höchsten Spitzen ÷ das Kleinste zwischen ihnen (mindestens die Auflösung: 1 Weg je
// Fenster)
const WEGE = async (r, T, arg, HILF) => {
    const { s, L, ab } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    const bis = performance.now() + arg.ms;
    const tagS = s.dayLengthMinutes * 60, DT = 0.5;
    const takte = Math.max(1, Math.round((arg.fensterH * tagS) / 24 / DT));
    const je = [];
    for (let h = 0; h < 24 && performance.now() < bis; h++) {
        HILF.uhrAuf(h);
        const letzt = new Map(L.map((b) => [b, b.ziel]));
        let wege = 0;
        for (let k = 0; k < takte; k++) {
            r._uhrSetzen((s.timeOfDay + DT / tagS) % 1, "uhr");
            HILF.leute(DT);
            for (const b of L) {
                const z = b.ziel, z0 = letzt.get(b);
                if (z === z0) continue;
                if (z && z0 && ab(z, z0) > 2) wege++;
                letzt.set(b, z);
            }
        }
        je.push(Math.round(wege / arg.fensterH));
    }
    const max = je.reduce((m, w) => Math.max(m, w), 0);
    const spitzen = [];
    let lauf = null;
    for (let i = 0; i < je.length; i++) {
        if (max > 0 && je[i] >= 0.5 * max) {
            if (!lauf) spitzen.push((lauf = { h: i, max: je[i] }));
            else if (je[i] > lauf.max) (lauf.max = je[i]), (lauf.h = i);
        } else lauf = null;
    }
    let verhaeltnis = null;
    if (spitzen.length >= 2) {
        const [a, b] = spitzen.slice().sort((x, y) => y.max - x.max).slice(0, 2).sort((x, y) => x.h - y.h);
        const tal = je.slice(a.h, b.h + 1).reduce((m, w) => Math.min(m, w), Infinity);
        verhaeltnis = +(Math.min(a.max, b.max) / Math.max(tal, 1 / arg.fensterH)).toFixed(2);
    }
    return { bewohner: L.length, stunden: je.length, je, max, spitzen: spitzen.length, spitzenUm: spitzen.map((x) => x.h), verhaeltnis, wegeTag: je.reduce((x, y) => x + y, 0) };
};

// DIE SCHRECK-FRONT (kollektiv S2) wie zeugenGang am Markt der Stadt: um 10 Uhr, der Gegenlauf 2 Spiel-s ohne Tat (wer ging ohnehin
// weg), dann die Tat 2 m neben dem Spieler (das Kitz, `damageCreature` vom Spieler: der EINE Schadens-Weg ruft `_bewohnerZeuge`);
// 6 Spiel-s im Takt des Spiels. Je Bewohner draußen binnen 60 m seine Reaktion: der erste Takt, in dem er ≥ 0,5 m weiter vom Opfer
// steht als bei der Tat; die Front v = Var(d) ÷ Cov(d, t) (die Steigung der Reaktionszeit über den Abstand; ohne Gefälle 999: die
// Kunde erreicht jeden im selben Takt). Flucht: der Anteil der Zeugen (≤ zeugeM bei der Tat), die nach 6 s ≥ 0,5 m weiter weg stehen
const SCHRECK = async (r, T, arg, HILF) => {
    const { s, A, L, pm } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    s.renderer.setAnimationLoop(null);
    HILF.uhrAuf(arg.uhr);
    await HILF.takt(10);
    const fx = pm.x + 2, fz = pm.z, o = { x: fx, z: fz };
    const lage = () => new Map(L.filter((b) => b.leib && !b.drinnen).map((b) => [b, { x: b.leib.position.x, z: b.leib.position.z }]));
    const abO = (p) => Math.hypot(p.x - o.x, p.z - o.z);
    const ZM = A.BEWOHNER.zeugeM;
    const g0 = lage();
    await HILF.takt(20);
    const g1 = lage();
    let gegenN = 0, gegenWeg = 0;
    for (const [b, p] of g0) {
        if (abO(p) >= ZM) continue;
        const q = g1.get(b);
        if (!q) continue;
        gegenN++;
        if (abO(q) - abO(p) > 0.5) gegenWeg++;
    }
    const opfer = r.spawnCreatureAt(fx, r._voxelSurfaceY(fx, fz), fz, "happy", "wesen", { precise: true, bodySize: 0.6 });
    if (!opfer) return { fehler: "Spawn des Opfers" };
    const vor = lage();
    const zeugen = [...vor].filter(([, p]) => abO(p) < ZM).map(([b]) => b);
    const furcht0 = zeugen.map((b) => r._kreaturFurchtErinnert(b.leib));
    const tat = r.damageCreature(opfer, 9999, { source: "player", fromPos: { x: pm.x, y: pm.y, z: pm.z } });
    const reakt = new Map();
    for (let k = 1; k <= 60; k++) {
        await HILF.takt(1);
        for (const [b, p] of vor) {
            if (reakt.has(b) || !b.leib) continue;
            const d0 = abO(p);
            if (d0 > 60) continue;
            if (abO(b.leib.position) - d0 >= 0.5) reakt.set(b, { d: d0, t: k * A.TAKT_DECKEL_S });
        }
    }
    const nach = lage();
    const furcht1 = zeugen.map((b) => r._kreaturFurchtErinnert(b.leib));
    let fl = 0, fn = 0;
    for (const b of zeugen) {
        const p = vor.get(b), q = nach.get(b);
        if (!p || !q) continue;
        fn++;
        if (abO(q) - abO(p) > 0.5) fl++;
    }
    for (const c of [...(s.creatures || []), ...(s.leichname || [])]) if (c === opfer) r.removeCreature(c);
    const pts = [...reakt.values()];
    let front = 0;
    if (pts.length >= 3) {
        const md = pts.reduce((x, p) => x + p.d, 0) / pts.length, mt = pts.reduce((x, p) => x + p.t, 0) / pts.length;
        let cov = 0, vd = 0;
        for (const p of pts) (cov += (p.d - md) * (p.t - mt)), (vd += (p.d - md) ** 2);
        front = cov > 1e-9 ? +(vd / cov).toFixed(2) : 999;
    }
    const med = (a) => {
        const v = a.filter(Number.isFinite).sort((x, y) => x - y);
        return v.length ? +v[Math.floor(v.length / 2)].toFixed(3) : null;
    };
    const fern = pts.filter((p) => p.d > ZM).length;
    return { zeugen: zeugen.length, gezaehlt: fn, flucht: fn ? +(fl / fn).toFixed(3) : null, front, reagiert: pts.length, jenseits: fern, gegenlauf: gegenN ? +(gegenWeg / gegenN).toFixed(3) : null, furcht: [med(furcht0), med(furcht1)], tat: !!(tat && tat.ok), zeugeM: ZM };
};

// DIE GESUNDHEIT (seuche S1, S2): wessen Satz oder Leib ein Feld der Krankheit trägt (krank, Infekt, Seuche, Erreger, Fieber, gesund)
// DER KRANKE (seuche S1, bewohner-satz): die Krankheit ist ein Feld des Lebenslaufs — ein GETTER der Tafel `BEWOHNER_SATZ`
// (`b.krank` → `_bewohnerLauf` „krank“, am Tag der Prozesse), kein eigener Schlüssel des Satzes: `Object.keys(b)` sieht ihn nicht,
// gelesen wird er beim Namen. Je Kranken DER KRANK-TAG: sein Soll der Stunde, wie der Takt es liest (`_bewohnerSoll`: der Kern-Plan
// mit `b.krank` als Eingang), je Viertelstunde über 24 h gegen den Tag desselben Menschen gesund (der Kern-Plan `tagesPlan` mit
// demselben Samen, derselben Rolle, denselben Orten und demselben Regen an seiner Tür, nur `krank` falsch) — der Anteil der
// Viertelstunden, in denen Ort, drinnen oder Akt abweichen. DAS BILDPAAR: sein Leib zur Stunde `arg.uhr` (die Haltung seines
// Gemüts, `_bewohnerGemuet` — die Stand-Zeile, die sein Leib zeigt) gegen die Haltung, die derselbe Akt einem Gesunden seiner Rolle
// gibt (koerper `tagesHaltung(akt, rolle)`): trägt der Kranke eine eigene Haltung (Tiefe: „Haltung, Husten“)?
const KRANK = async (r, T, arg, HILF) => {
    const { L } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    const KC = window.__koerperCore;
    if (!KC || typeof KC.tagesPlan !== "function" || typeof KC.tagesHaltung !== "function") return { fehler: "der Kern trägt keinen Tagesplan (koerper tagesPlan, tagesHaltung)" };
    const wort = (k) => ["krank", "infekt", "seuche", "erreger", "fieber", "gesund"].some((w) => String(k).toLowerCase().includes(w));
    const feld = L.filter((b) => Object.keys(b).some(wort) || (b.leib && b.leib.userData && Object.keys(b.leib.userData).some(wort))).length;
    const kranke = L.filter((b) => b.krank === true);
    if (Number.isFinite(arg && arg.uhr)) HILF.uhrAuf(arg.uhr);
    const bis = performance.now() + ((arg && arg.ms) || 10000) * 0.6;
    let [gemessen, abweichend, summe, posten, mitHaltung, haltungAnders, daheim] = [0, 0, 0, 0, 0, 0, 0];
    const akte = {};
    for (const b of kranke) {
        if (performance.now() > bis) break;
        if (!b.orte || !b.orte.tuer || !Number.isFinite(b.same)) continue;
        const o = b.orte;
        const regen = r._wetterFeldAm(o.tuer.x, o.tuer.z, undefined, {}).rain;
        let q0 = 0;
        for (let q = 0; q < 96; q++) {
            const h = q / 4;
            const k = r._bewohnerSoll(b, h);
            const g = KC.tagesPlan(b.same, b.rolle, h, o, regen, false);
            const gZiel = g.drinnen ? o.tuer : g.ort;
            if (k.akt !== g.akt || !!k.drinnen !== !!g.drinnen || (k.ziel !== gZiel && !(b.amSteuer && g.ort === o.werk))) q0++;
        }
        gemessen++;
        summe += q0 / 96;
        if (q0 > 0) abweichend++;
        else posten++;
        // das Bild zur Stunde: der Leib des Kranken, sein Akt und die Haltung, die er zeigt
        if (b.leib && b.akt) {
            const gm = r._bewohnerGemuet(b);
            const gesund = KC.tagesHaltung(b.akt, b.rolle);
            mitHaltung++;
            if ((gm && gm.haltung) !== gesund) haltungAnders++;
            akte[b.akt] = (akte[b.akt] || 0) + 1;
            if (b.ziel === o.heim || b.ziel === o.tuer || b.drinnen) daheim++;
        }
    }
    return {
        bewohner: L.length,
        krank: kranke.length,
        feld,
        gemessen,
        abweichend,
        posten,
        tag: gemessen ? +(summe / gemessen).toFixed(4) : null,
        mitHaltung,
        haltungAnders,
        haltung: mitHaltung ? +(haltungAnders / mitHaltung).toFixed(4) : null,
        daheim,
        akte,
        uhr: +HILF.stunde().toFixed(2),
    };
};

const PFAD = [
    "stamm/siedlung-*.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/bild-himmel.js",
    "stamm/dirigent-takt.js",
    "stamm/daten.js",
    "koerper-core.js",
    "fachwerk-core.js",
    "scripts/lib/kreatur-proben.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "spec/profiband/haushalt.json",
];
const ADAPTER = "[linse-gpu] amd/rdna-3 (Probe)";
const mut = (leiter, n, nIst, werte) => ({ leiter, adapter: ADAPTER, sprossen: { [n]: { art: "zahl", n: nIst, werte } } });
const um = (soll, wort) => ({ soll, wort });
const ge = (key, wort, soll) => ({ key, wort, soll, richtung: "≥" });
const le = (key, wort, soll) => ({ key, wort, soll, richtung: "≤" });
const band = (key, wort, von, bis) => ({ key, wort, von, bis });
const nicht = (umfang, masse, fehlt) => ({ umfang, masse, erwartet: "nicht", fehlt });
const leser = (umfang, masse, fehlt, wo) => ({ umfang, masse, erwartet: "leser", fehlt, wo });
// strikt („3 Uhr < 0,05“) ohne erfundenen Abstand; `her` hängt die Herleitung eines Solls an, das aus dem Wortlaut folgt
const lt = (key, wort, soll) => ({ key, wort, soll, richtung: "<" });
const gt = (key, wort, soll) => ({ key, wort, soll, richtung: ">" });
const her = (m, herkunft) => Object.assign({}, m, { herkunft });
const AM_PLAN = ge("amPlan", "Anteil Angetroffener am Plan-Ort", 0.95);
const AM_PLAN_WIE4 = her(AM_PLAN, "„wie 4“: das Soll von S4, ≥ 0,95 der Angetroffenen am Plan-Ort aus 100 Teleports, im größeren Umfang");

module.exports = (F) => [
    // ── mensch.menge.bevoelkerung ── S2 20 Personen am Soll in der Stadt (der Leser von S1 größer); S3–S9 jenseits der Stadt
    F.leiter("mensch.menge.bevoelkerung", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "karte2.mensch.menge.bevoelkerung#1" },
        sprossen: {
            2: { umfang: um(1000, "Bewohner der Stadt"), masse: [ge("angetroffen", "Stichproben-Personen ± 2 m angetroffen", 20)] },
            3: nicht(um(10000, "Bewohner"), [le("ks", "KS-Abstand Alter und Haushalt", 0.1), ge("saaten", "Anteil Saaten im Band", 0.9)], "10⁴ Bewohner in 20 Saaten"),
            4: nicht(um(100000, "Bewohner einer Großstadt"), [AM_PLAN], "10⁵ Bewohner einer Großstadt, 100 Teleports"),
            5: nicht(um(1000000, "Bewohner einer Metropole"), [AM_PLAN_WIE4, ge("hausArbeitFamilie", "Anteil mit Haus, Arbeit und Familie", 0.95)], "10⁶ Bewohner einer Metropole"),
            6: nicht(um(10000000, "Bewohner einer Megastadt"), [AM_PLAN_WIE4, le("ks", "KS-Abstand Alter und Haushalt", 0.1), ge("saaten", "Anteil Saaten im Band", 0.9)], "10⁷–4·10⁷ Bewohner einer Megastadt"),
            7: nicht(um(400000000, "Bewohner einer Bebauung"), [AM_PLAN, ge("versorgt", "Anteil mit Wohnung, Werk und Versorgung", 0.99)], "4·10⁸ Bewohner in einer Bebauung"),
            8: nicht(um(1000000000, "Menschen eines Planeten"), [ge("rang", "Rang-r der Dichte gegen das Nachtlicht", 0.7), ge("saaten", "Anteil Saaten im Band", 0.8)], "10⁹–10¹⁰ Menschen eines Planeten"),
            9: nicht(um(10000000000, "Menschen je Planet und Jahr"), [ge("lebenslauf", "Anteil konsistenter Lebensläufe", 0.99), ge("dieselbe", "Anteil derselben Person gealtert in t und t + 20", 1)], "10¹⁰ Menschen je Planet über die Jahre"),
        },
        seite: { STADT, ZENSUS, STICHPROBE, SAATEN },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            for (const [n, fehlt] of [[4, "10⁵ Bewohner einer Großstadt"], [5, "10⁶ Bewohner einer Metropole"], [6, "10⁷–4·10⁷ Bewohner einer Megastadt"], [7, "4·10⁸ Bewohner in einer Bebauung"], [8, "10⁹–10¹⁰ Menschen eines Planeten"], [9, "10¹⁰ Menschen je Planet über die Jahre"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + " in " + z.haeuser + " Häusern)" });
                });
            // S2 vor den Saaten: die Probe endet an seiner Pose (der Heimweg der Saaten stellt den Spieler zurück an den Markt)
            await K.schritt(2, async () => {
                const p = pruef(await welt("STICHPROBE", { uhr: 10, n: 20 }), "die Stichprobe der Stadt");
                H.zeile("S2 " + p.angetroffen + " von " + p.stichproben + " ± 2 m angetroffen um " + p.uhr + " Uhr");
                K.zahl(2, {
                    n: p.bewohner,
                    werte: { angetroffen: p.angetroffen },
                    beleg: p.stichproben + " Personen über die Liste der Stadt (" + p.haeuser + " Häuser) um " + p.uhr + " Uhr, Wohnort ≠ Arbeitsort (> 20 m) " + p.pendler + " von " + p.stichproben,
                    taeter: p.wer.length ? "nicht angetroffen: " + p.wer.join(", ") : null,
                });
            });
            // S3 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
            // gezählt ihre Bewohner (die Liste der Siedlung oder `leuteVon` ihres Plans, stamm/siedlung-bewohner.js:839). Erreicht die
            // Welt 20 Saaten mit ≥ 10⁴ Bewohnern, fehlt der Leser des KS-Abstands; sonst steht der Umfang mit der Zahl je Saat. Die
            // Schleife läuft zuletzt, nach S2, bis 3 s vor der Frist — die Stadt-Pose von S2 (GTX 58 s) und der Zensus S4–S9 messen
            // in der Zeit wie vorher; der Heimweg stellt den Spieler zurück an den Markt (`versatz`).
            await K.schritt(3, async () => {
                const arg = { stamm: "mensch.menge.bevoelkerung-s3", n: 20, bis: Date.now() + Math.max(0, (H.rest() - 3) * 1000) };
                const zaehl = function (r) {
                    const FC = globalThis.__fachwerkCore;
                    let bew = 0;
                    for (const S of (r._bewohnerSiedlungen || new Map()).values())
                        if (Array.isArray(S.liste)) bew += S.liste.length;
                        else if (S.plan && Array.isArray(S.plan.slots) && FC && typeof FC.leuteVon === "function") bew += S.plan.slots.reduce((a, sl) => a + Math.max(0, FC.leuteVon(sl.ov) | 0), 0);
                    return bew;
                };
                const s = await K.welt("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", " + zaehl + ");", Math.max(5000, Math.floor((H.rest() - 2) * 1000)));
                if (!s || s.fehler) throw new Error("die Saaten: " + ((s && s.fehler) || "ohne Antwort"));
                H.zeile("S3 Saaten " + JSON.stringify(s));
                const bew = s.je.map((x) => x.z);
                const max = bew.length ? Math.max(...bew) : 0;
                const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m); Bewohner je Saat am Erwachen ihrer Welt " + (bew.join(" · ") || "—");
                if (s.je.length >= 20 && Math.min(...bew) >= 10000)
                    return K.leser(3, { n: max, fehlt: "KS-Abstand Alter und Haushalt gegen den Zensus der Epoche: kein Leser je Saat — " + zeit, wo: "stamm/siedlung-bewohner.js:458" });
                K.nicht(3, { n: max, fehlt: "10⁴ Bewohner in 20 Saaten: die Welt wechselte am Ort in " + s.je.length + " von 20 Saaten (" + zeit + (s.grund ? "; Ende: " + s.grund : "") + ")" });
            });
        },
        proben: {
            2: [
                { name: "drei Personen fern ihres Solls (17 von 20) — ROT an den Angetroffenen", j: mut("mensch.menge.bevoelkerung", 2, 1092, { angetroffen: 17 }), gruen: false, zahl: /ROT an Stichproben-Personen ± 2 m angetroffen 17 verfehlt ≥ 20/ },
                { name: "das Dorf statt der Stadt (77 Bewohner) — ROT am Umfang", j: mut("mensch.menge.bevoelkerung", 2, 77, { angetroffen: 20 }), gruen: false, zahl: /ROT an Umfang 77 < 1000 Bewohner der Stadt/ },
            ],
        },
    }),

    // ── mensch.menge.bild ── S2 die Menge im Bild wie platzAcht (Third, 8 Uhr, die Stadt), S3 das Bild am Markt; S4–S7 jenseits
    F.leiter("mensch.menge.bild", {
        sek: 50,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "karte2.mensch.menge.bild#1" },
        sprossen: {
            2: { umfang: um(100, "Menschen im Bild"), masse: [ge("gehend", "Gehende im Bild", 40), le("zwillinge", "Zwillinge im Bild", 0)] },
            3: { auge: { pose: "stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 8 Uhr", vorbild: "Foto eines vollen Bahnsteigs (Dichte ± 20 %, Zwillinge 0)" } },
            4: nicht(um(10000, "Menschen auf dem Platz"), [le("ploppen", "Ploppen am Übergang", 0), ge("zaehlung", "Zählung im Bild", 10000)], "10⁴ Menschen auf einem Platz"),
            5: nicht(um(100000, "Menschen im Stadion"), [band("welle", "Tempo der Welle in m je s", 10, 15), band("breite", "Breite der Welle in m", 6, 12), ge("startorte", "Startorte in 10 Läufen", 5)], "10⁵ Menschen in einem Stadion"),
            6: nicht(um(1000000, "Menschen im Kegel"), [le("flugS", "Orbit bis Gesicht in s", 10), le("brueche", "Brüche im Flug", 0), ge("zaehlung", "Zählung im Kegel", 1000000)], "10⁶ Menschen eines Pilgerfests"),
            7: { auge: { pose: "Turmblick über die Stadt, 10 m bis 10 km", vorbild: "Fotos realer Großstädte (Zählung ≥ 10⁷)" }, erwartet: "nicht", fehlt: "10⁷–10⁸ Menschen einer Megastadt" },
        },
        seite: { STADT, ZENSUS, POSE, MENGE_BILD },
        messe: async (H, K) => {
            K.sicht = "third";
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            for (const [n, fehlt] of [[4, "10⁴ Menschen auf einem Platz"], [5, "10⁵ Menschen in einem Stadion"], [6, "10⁶ Menschen eines Pilgerfests"], [7, "10⁷–10⁸ Menschen einer Megastadt im Turmblick"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + ")" });
                });
            await K.schritt(2, async () => {
                const m = pruef(await welt("MENGE_BILD", { uhr: 8 }), "die Menge im Bild");
                H.zeile("S2 im Bild " + m.imBild + ", gehend " + m.gehend + ", Zwillinge " + m.zwillinge + " (" + m.sicht + ", tod " + m.tod + ")");
                K.zahl(2, {
                    n: m.imBild,
                    werte: { gehend: m.gehend, zwillinge: m.zwillinge },
                    beleg: "Stände " + m.leiber + ", aus der Zählung " + JSON.stringify(m.aus) + ", Auge " + JSON.stringify(m.auge) + ", " + m.sicht + ", tod " + m.tod + ", Takte " + m.takte,
                    taeter: m.imBild < 100 ? "im Bild " + m.imBild + " (drinnen " + m.aus.drinnen + ", außer Bild " + m.aus.ausserBild + ", verdeckt " + m.aus.verdeckt + ")" : null,
                });
            });
            await K.schritt(3, async () => {
                const p = pruef(await welt("POSE"), "die Pose am Markt");
                const bild = await K.bild(3, p.pose);
                K.auge(3, { bild: bild.datei, pose: "stadt-voll Markt 8 Uhr (" + [p.pose.px, p.pose.py, p.pose.pz].join(", ") + ") → (" + [p.pose.lx, p.pose.ly, p.pose.lz].join(", ") + ")", mass: "Gruppe " + p.dicht + " Menschen in 4 m (" + p.dichteQm + " P je m²), " + p.imKreis + " draußen binnen 20 m" + (bild.abnahme ? " · Abnahme " + bild.abnahme : "") });
            });
        },
        proben: {
            2: [
                { name: "die Menge steht (12 von 120 gehen) — ROT an den Gehenden", j: mut("mensch.menge.bild", 2, 120, { gehend: 12, zwillinge: 0 }), gruen: false, zahl: /ROT an Gehende im Bild 12 verfehlt ≥ 40/ },
                { name: "Attrappe: EINE Gestalt vervielfältigt (Zwillinge 2) — ROT an den Zwillingen", j: mut("mensch.menge.bild", 2, 120, { gehend: 50, zwillinge: 2 }), gruen: false, zahl: /ROT an Zwillinge im Bild 2 verfehlt ≤ 0/ },
            ],
        },
    }),

    // ── mensch.menge.dichte ── S2 die Spuren im Gegenstrom, S3 v(ρ) gegen Weidmann, beide am Strom der Stadt um 8 Uhr; S4–S7 jenseits
    F.leiter("mensch.menge.dichte", {
        sek: 50,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "mensch.K5#1" },
        sprossen: {
            2: { umfang: um(100, "Gehende im Gegenstrom"), masse: [le("zeit", "Zeit bis Spuren in s", 30), ge("ordnung", "Ordnungsparameter der Spuren", 0.7)] },
            3: { umfang: um(1000, "Gehende gemessen"), masse: [le("abweichung", "größte Abweichung v gegen Weidmann", 0.15), ge("abdeckung", "Anteil gemessener Dichte-Klassen 0,5–4 P je m²", 1)] },
            4: nicht(um(1000, "Drängende am Engpass"), [band("fluss", "spezifischer Fluss in P je m und s", 1.2, 1.9)], "10³–10⁴ Drängende an einem Engpass"),
            5: nicht(um(10000, "Menschen im dichten Strom"), [le("periode", "Abweichung der Wellenperiode gegen Aufnahmen", 0.25), le("tempo", "Abweichung des Wellentempos gegen Aufnahmen", 0.25)], "10⁴ Menschen in einem dichten Strom"),
            6: nicht(um(100000, "Menschen eines Fests"), [{ key: "gedraenge", wort: "Gedränge-Zellen über 5 P je m² an erzwungenen Stellen", soll: 0, richtung: ">" }, le("breiter", "Gedränge-Zellen bei breiterem Ausgang", 0)], "10⁵ Menschen eines Fests"),
            7: nicht(um(10000000, "Menschen eines Badefests"), [ge("festplaetze", "Anteil Festplätze mit Gedränge an erzwungenen Stellen", 0.9)], "10⁷ Menschen eines Badefests am Fluss"),
        },
        seite: { STADT, ZENSUS, STROM },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null, str = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            const strom = async () => str || (str = pruef(await welt("STROM", { uhr: 8, sek: 30, radius: 40 }), "der Strom der Stadt"));
            for (const [n, fehlt] of [[5, "10⁴ Menschen in einem dichten Strom"], [6, "10⁵ Menschen eines Fests"], [7, "10⁷ Menschen eines Badefests"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + ")" });
                });
            await K.schritt(2, async () => {
                const t = await strom();
                H.zeile("S2 " + t.sek + " s, Gegenstrom " + t.gegenstrom + " (" + t.plus + "/" + t.minus + "), Φ " + t.ordnung + ", Spuren nach " + t.zeit + " s");
                if (t.sek < 30 && t.zeit === 999) throw new Error("der Strom reichte in der Frist nur " + t.sek + " von 30 Spiel-s — ungemessen, nie eine verkürzte Frist als ROT");
                K.zahl(2, { n: t.gegenstrom, werte: { zeit: t.zeit, ordnung: t.ordnung }, beleg: t.sek + " Spiel-s um 8 Uhr binnen " + t.radius + " m, Gehende " + t.geher + " (" + t.plus + " ⇄ " + t.minus + "), Φ je s " + JSON.stringify(t.phi.slice(0, 30)), taeter: t.gegenstrom < 100 ? "Gegenstrom " + t.gegenstrom + ": der Tag verteilt die Wege der Stadt, kein Gang trägt 10² gegeneinander" : null });
            });
            await K.schritt(3, async () => {
                const t = await strom();
                K.zahl(3, { n: t.geher, werte: { abweichung: t.abweichung, abdeckung: t.abdeckung }, beleg: t.proben + " Proben je Gehendem und s, größte Dichte " + t.dichteBis + " P je m², die Klassen " + JSON.stringify(t.klassen), taeter: t.abdeckung < 1 ? "größte Dichte " + t.dichteBis + " P je m²: die Stadt füllt nicht jede Klasse bis 4 P je m²" : null });
            });
            await K.schritt(4, async () => {
                const t = await strom();
                K.nicht(4, { n: t.maxGleich, fehlt: "10³–10⁴ Drängende an einem Engpass: höchstens " + t.maxGleich + " gingen zugleich binnen " + t.radius + " m, kein Ereignis staut die Stadt an einer Tür" });
            });
        },
        proben: {
            2: [{ name: "Gleichstrom ohne Gegenlauf: Φ = 1 trivial — ROT am Umfang", j: mut("mensch.menge.dichte", 2, 0, { zeit: 1, ordnung: 1 }), gruen: false, zahl: /ROT an Umfang 0 < 100 Gehende im Gegenstrom/ }],
            3: [
                { name: "die Menge geht frei bei jeder Dichte (Abweichung 0,4) — ROT an Weidmann", j: mut("mensch.menge.dichte", 3, 1200, { abweichung: 0.4, abdeckung: 1 }), gruen: false, zahl: /ROT an größte Abweichung v gegen Weidmann 0\.4 verfehlt ≤ 0\.15/ },
                { name: "nur die lockere Menge (2 von 5 Klassen) — ROT an der Abdeckung", j: mut("mensch.menge.dichte", 3, 1200, { abweichung: 0.05, abdeckung: 0.4 }), gruen: false, zahl: /ROT an Anteil gemessener Dichte-Klassen 0,5–4 P je m² 0\.4 verfehlt ≥ 1/ },
            ],
        },
    }),

    // ── mensch.menge.rhythmus ── S2 die Wege je Stunde der Stadt über 24 h; S3–S7 messen dieselbe Ganglinie gegen größere Umfänge
    F.leiter("mensch.menge.rhythmus", {
        sek: 50,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "mensch.K2#2" },
        sprossen: {
            // der Umfang „10³ Wege/h (Stadt)“ ist eine Klasse der Stadt (Entscheid des Koordinators 25.11. 06:05): ≥ 10³ Bewohner UND an der
            // Spitze ≥ 10^2,5 = 316 Wege je Stunde — eine Stadt der Klasse trägt quellentreu 340–710 Wege in der Spitzen-Stunde
            2: { umfang: um(1000, "Bewohner der Stadt"), masse: [her(ge("spitze", "Wege je Stunde an der Spitze (Umfang der Stadt)", 316), "der Umfang „10³ Wege/h (Stadt)“ als Klasse der Zehnerpotenz: die Spitzen-Stunde der Stadt trägt ≥ 10^2,5 = 316 Wege"), band("spitzen", "Spitzen der Wege je Stunde", 2, 2), ge("verhaeltnis", "Spitze zu Tal", 3)] },
            3: nicht(um(10000, "Wege je Stunde"), [le("ks", "KS-Abstand der Pendeldistanz", 0.15), ge("saaten", "Anteil Saaten im Band", 0.8)], "10⁴ Wege je Stunde"),
            4: nicht(um(100000, "Wege je Tag an einem Knoten"), [band("dichte8", "Dichte um 8 Uhr in P je m²", 2, 4), lt("dichte3", "Dichte um 3 Uhr in P je m²", 0.05)], "10⁵ Wege je Tag an einem Knoten"),
            5: nicht(um(1000000, "Wege je Tag"), [ge("durchgaenge", "Durchgänge je Tag", 1000000), ge("ganglinie", "Ganglinie in der realen Form (1 = ja)", 1)], "10⁶ Wege je Tag"),
            6: nicht(um(10000000, "Wege je Tag einer Megaregion"), [her(ge("baender", "Paare im Band realer Zählungen (Sonntag/Werktag, Ferien/Schule)", 2), "die zwei im Wortlaut genannten Paare Sonntag/Werktag und Ferien/Schule: beide im Band, 2 von 2")], "10⁷ Wege je Tag einer Megaregion"),
            7: nicht(um(100000000, "Wege je Tag eines Planeten"), [ge("netze", "Anteil Epochen mit Flüssen im Band realer Netze", 1)], "10⁸–10⁹ Wege je Tag eines Planeten"),
        },
        seite: { STADT, WEGE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 8) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let wg = null;
            const wege = async () => wg || (wg = pruef(await welt("WEGE", { fensterH: 0.1 }), "die Wege der Stadt"));
            await K.schritt(2, async () => {
                const w = await wege();
                H.zeile("S2 " + w.stunden + " Stunden, Wege je Stunde " + JSON.stringify(w.je));
                if (w.stunden < 24) throw new Error("der Tag reichte in der Frist nur " + w.stunden + " von 24 Stunden — ungemessen, nie ein halber Tag als Urteil");
                K.zahl(2, { n: w.bewohner, werte: { spitze: w.max, spitzen: w.spitzen, verhaeltnis: w.verhaeltnis }, beleg: "Wege je Stunde 0–" + (w.stunden - 1) + " Uhr " + JSON.stringify(w.je) + ", Spitzen um " + JSON.stringify(w.spitzenUm) + " Uhr, " + w.bewohner + " Bewohner, " + w.wegeTag + " Wege am Tag", taeter: w.spitzen !== 2 ? "koerper-core.js TAGES_GESETZ: die Wenden des Tags (wach, Werk, Mittag, Werk-Ende, Ruhe) tragen " + w.spitzen + " Spitzen" : null });
            });
            for (const [n, fehlt, tag] of [[3, "10⁴ Wege je Stunde", false], [4, "10⁵ Wege je Tag an einem Knoten", true], [5, "10⁶ Wege je Tag", true], [6, "10⁷ Wege je Tag einer Megaregion", true], [7, "10⁸–10⁹ Wege je Tag eines Planeten", true]])
                await K.schritt(n, async () => {
                    const w = await wege();
                    K.nicht(n, { n: tag ? w.wegeTag : w.max, fehlt: fehlt + ": die Stadt trägt " + (tag ? w.wegeTag + " Wege am Tag" : w.max + " Wege je Stunde an der Spitze") + " (" + w.bewohner + " Bewohner)" });
                });
        },
        proben: {
            2: [
                { name: "der Tag der Wenden: 4 Spitzen (Morgen, Mittag, Abend, Ruhe) — ROT an den Spitzen", j: mut("mensch.menge.rhythmus", 2, 1356, { spitze: 1100, spitzen: 4, verhaeltnis: 5 }), gruen: false, zahl: /ROT an Spitzen der Wege je Stunde 4 verfehlt 2–2/ },
                { name: "Attrappe: flache Ganglinie (Spitze zu Tal 1,2) — ROT am Verhältnis", j: mut("mensch.menge.rhythmus", 2, 1356, { spitze: 1100, spitzen: 2, verhaeltnis: 1.2 }), gruen: false, zahl: /ROT an Spitze zu Tal 1\.2 verfehlt ≥ 3/ },
                { name: "das Dorf statt der Stadt (477 Bewohner) — ROT am Umfang", j: mut("mensch.menge.rhythmus", 2, 477, { spitze: 650, spitzen: 2, verhaeltnis: 8.6 }), gruen: false, zahl: /ROT an Umfang 477 < 1000 Bewohner der Stadt/ },
                { name: "die Stadt (1 356 Bewohner), Spitze 910 Wege/h, 2 Spitzen, Spitze zu Tal 3", j: mut("mensch.menge.rhythmus", 2, 1356, { spitze: 910, spitzen: 2, verhaeltnis: 3 }), gruen: true },
                { name: "die flache Spitze (300 Wege/h < 10^2,5) — ROT am Umfang der Spitze", j: mut("mensch.menge.rhythmus", 2, 1356, { spitze: 300, spitzen: 2, verhaeltnis: 8.6 }), gruen: false, zahl: /ROT an Wege je Stunde an der Spitze \(Umfang der Stadt\) 300 verfehlt ≥ 316/ },
                { name: "3 Spitzen (6 · 18 · 22 Uhr) — ROT an den Spitzen", j: mut("mensch.menge.rhythmus", 2, 1356, { spitze: 1470, spitzen: 3, verhaeltnis: 5 }), gruen: false, zahl: /ROT an Spitzen der Wege je Stunde 3 verfehlt 2–2/ },
            ],
        },
    }),

    // ── mensch.menge.seuche ── kein Gesetz der Krankheit: S1 das Bild ohne Kranken (Umfang nicht erzeugbar), S2 der fehlende Leser
    F.leiter("mensch.menge.seuche", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        sprossen: {
            // S1 „Bildpaar gesund/krank; Krank-Tag weicht ab“ (Umfang 1 Person krank, Tiefe Haltung, Husten, bleibt daheim): zwei Zahlen
            // aus dem Spiel — der Tag (Viertelstunden, in denen der Krank-Tag vom gesunden Tag desselben Menschen abweicht) und das Bild
            // (der Kranke trägt im Bild eine andere Haltung als der Gesunde im selben Akt: das Paar trennt sich am Leib)
            1: {
                umfang: um(1, "Person krank"),
                masse: [
                    her(gt("tag", "Anteil der Viertelstunden, in denen der Krank-Tag vom gesunden Tag abweicht", 0), "„Krank-Tag weicht ab“: der Tag des Kranken gegen seinen gesunden Tag, strikt über 0"),
                    her(ge("haltung", "Anteil Kranker, deren Haltung im Bild von der des Gesunden im selben Akt abweicht", 1), "„Bildpaar gesund/krank“ mit der Tiefe „Haltung, Husten“: das Paar trennt sich am Leib — jeder Kranke, den das Bild zeigt"),
                ],
            },
            2: leser(um(100, "Bewohner im Ausbruch"), [ge("sir", "Kurve in der Form S-I-R (1 = ja)", 1), ge("r0", "R0 im Band des Erregers (1 = ja)", 1)], "kein Erreger und keine Ansteckung: der Satz des Bewohners trägt keine Gesundheit", "stamm/siedlung-bewohner.js:887"),
            3: nicht(um(10000, "Bewohner einer Stadt"), [ge("senkung", "Senkung der Spitze bei geschlossenem Markt", 0.3)], "10⁴ Bewohner einer Stadt im Ausbruch"),
            4: nicht(um(1000000, "Bewohner einer Region"), [ge("r", "Korrelation Ankunft und Netzabstand", 0.7)], "10⁶ Bewohner einer Region"),
            5: nicht(um(100000000, "Menschen über Epochen"), [ge("erreger", "Anteil Erreger im historischen Band", 0.8), ge("lebenserwartung", "Zuwachs der Lebenserwartung 1800 bis 2000 in J", 30)], "10⁸ Menschen über Epochen"),
            6: nicht(um(10000000000, "Menschen eines Planeten"), [ge("wellenzahl", "Wellenzahl im Band realer Pandemien (1 = ja)", 1), ge("abstand", "Wellenabstand im Band realer Pandemien (1 = ja)", 1), ge("ketten", "Anteil verfolgbarer Infektionsketten", 1)], "10¹⁰ Menschen eines Planeten"),
        },
        seite: { STADT, ZENSUS, KRANK },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null, kr = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            const krank = async () => kr || (kr = pruef(await welt("KRANK", { uhr: 10 }), "die Gesundheit der Stadt"));
            await K.schritt(1, async () => {
                const k = await krank();
                H.zeile("S1 krank " + k.krank + " von " + k.bewohner + ", gemessen " + k.gemessen + ", Tag weicht ab " + k.abweichend + " (Anteil " + k.tag + ", Posten " + k.posten + "), Haltung anders " + k.haltungAnders + " von " + k.mitHaltung + ", um " + k.uhr + " Uhr daheim " + k.daheim + " " + JSON.stringify(k.akte));
                K.zahl(1, {
                    n: k.abweichend,
                    werte: { tag: k.tag, haltung: k.haltung },
                    beleg: k.krank + " von " + k.bewohner + " Bewohnern heute krank (b.krank, der Lebenslauf am Tag der Prozesse); " + k.gemessen + " gemessen: der Krank-Tag (_bewohnerSoll) gegen den gesunden (koerper tagesPlan, krank falsch) in " + k.tag + " der Viertelstunden anders, " + k.posten + " am Posten ohne Abweichung; um " + k.uhr + " Uhr " + k.daheim + " daheim, Akte " + JSON.stringify(k.akte) + ", Haltung anders " + k.haltungAnders + " von " + k.mitHaltung,
                    taeter: !(k.tag > 0)
                        ? "koerper-core.js tagesPlan — der Krank-Tag (Eingang krank) weicht vom gesunden nicht ab"
                        : "koerper-core.js tagesHaltung(akt, rolle) — die Haltung kennt den Kranken nicht: er sitzt im Akt des Abends wie ein Gesunder (kein Stand des Kranken in TAGES_GESETZ.haltung, kein Husten)",
                });
            });
            await K.schritt(2, async () => {
                const k = await krank();
                K.leser(2, { fehlt: "kein Erreger und keine Ansteckung: " + k.krank + " von " + k.bewohner + " Bewohnern heute krank (ein Wurf je Woche aus ihrem Samen, LEBENSLAUF.krank), keiner steckt einen anderen an", wo: "stamm/siedlung-bewohner.js _bewohnerLauf (krank)", n: k.krank });
            });
            for (const [n, fehlt] of [[3, "10⁴ Bewohner einer Stadt im Ausbruch"], [4, "10⁶ Bewohner einer Region"], [5, "10⁸ Menschen über Epochen"], [6, "10¹⁰ Menschen eines Planeten"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + "), keiner erkrankt" });
                });
        },
        proben: {
            1: [
                { name: "die Krankheit genommen (der Plan liest b.krank nicht, wie vor bewohner-satz): kein Tag weicht ab — ROT am Umfang", j: mut("mensch.menge.seuche", 1, 0, { tag: 0, haltung: 0 }), gruen: false, zahl: /ROT an Umfang 0 < 1 Person krank/ },
                { name: "der Kranke bleibt daheim, sitzt aber wie ein Gesunder (der Stand von heute) — ROT an der Haltung", j: mut("mensch.menge.seuche", 1, 40, { tag: 0.3, haltung: 0 }), gruen: false, zahl: /ROT an Anteil Kranker, deren Haltung im Bild von der des Gesunden im selben Akt abweicht 0 verfehlt ≥ 1/ },
                { name: "ein Kranker mit eigener Haltung, dessen Tag nicht abweicht — ROT am Tag", j: mut("mensch.menge.seuche", 1, 1, { tag: 0, haltung: 1 }), gruen: false, zahl: /ROT an Anteil der Viertelstunden, in denen der Krank-Tag vom gesunden Tag abweicht 0 verfehlt > 0/ },
            ],
            2: [
                { name: "Attrappe: ein Ausbruch ohne Kurve (keiner steckt an) — ROT an der Form S-I-R", j: mut("mensch.menge.seuche", 2, 100, { sir: 0, r0: 1 }), gruen: false, zahl: /ROT an Kurve in der Form S-I-R \(1 = ja\) 0 verfehlt ≥ 1/ },
                { name: "die Seuche ohne Maß des Erregers (R0 fremd) — ROT an R0", j: mut("mensch.menge.seuche", 2, 100, { sir: 1, r0: 0 }), gruen: false, zahl: /ROT an R0 im Band des Erregers \(1 = ja\) 0 verfehlt ≥ 1/ },
            ],
        },
    }),

    // ── mensch.menge.kollektiv ── S2 die Schreck-Front am Markt (der Leser von S1 größer); S3 ohne Leser; S4–S7 jenseits der Stadt
    F.leiter("mensch.menge.kollektiv", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "karte2.mensch.menge.kollektiv#1" },
        sprossen: {
            2: { umfang: um(100, "Zeugen der Tat"), masse: [band("front", "Schreck-Front in m je s", 3, 8), ge("flucht", "Anteil Zeugen auf der Flucht weg", 0.9)] },
            3: leser(um(1000, "Menschen im Zug"), [band("kopf", "Tempo des Kopfs in m je s", 0.5, 1), le("teilnehmer", "Abweichung Länge × Dichte gegen Teilnehmer", 0.1)], "kein Zug mit Ziel, Ruf und Kordon: der Plan der Stunde kennt sechs Akte, keinen gemeinsamen", "koerper-core.js:5326"),
            4: nicht(um(100000, "Bewohner einer Stadt"), [le("raeumung", "Abweichung der Räumungszeit", 0.25), ge("stau", "Anteil Stau an Engstellen", 0.8)], "10⁵ Bewohner einer Stadt in der Räumung"),
            5: nicht(um(1000000, "Menschen auf der Flucht"), [band("km", "Tagesstrecke in km", 10, 30), ge("lager", "Lagerdichte im Band des Luftbilds (1 = ja)", 1)], "10⁶ Menschen auf der Flucht über Land"),
            6: nicht(um(10000000, "Menschen eines Volks"), [ge("route", "Anteil Siedlungen entlang der Route", 0.6), ge("mangel", "Anteil ungesetzter Wanderungen aus Mangel", 0.8)], "10⁷ Menschen über Jahrzehnte"),
            7: nicht(um(100000000, "Menschen über Jahrtausende"), [le("logFehler", "log-Fehler der Besiedlungsfront je Jahrtausend", 0.3)], "10⁸–10⁹ Menschen über Jahrtausende"),
        },
        seite: { STADT, ZENSUS, SCHRECK },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            await K.schritt(3, async () => {
                const z = await zensus();
                K.leser(3, { fehlt: "kein Zug mit Ziel, Ruf und Kordon: der Plan der Stunde kennt sechs Akte, keinen gemeinsamen (" + z.stadt + " Bewohner der Stadt, keiner im Zug)", wo: "koerper-core.js:5326", n: z.stadt });
            });
            for (const [n, fehlt] of [[4, "10⁵ Bewohner einer Stadt in der Räumung"], [5, "10⁶ Menschen auf der Flucht über Land"], [6, "10⁷ Menschen über Jahrzehnte"], [7, "10⁸–10⁹ Menschen über Jahrtausende"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + ")" });
                });
            // S2 zuletzt: die Probe endet an seiner Pose (der Spieler am Markt, die Tat 2 m neben ihm)
            await K.schritt(2, async () => {
                const s = pruef(await welt("SCHRECK", { uhr: 10 }), "die Tat am Markt");
                H.zeile("S2 Zeugen " + s.zeugen + ", Flucht " + s.flucht + ", Front " + s.front + " m/s, reagiert " + s.reagiert + " (jenseits " + s.zeugeM + " m: " + s.jenseits + ")");
                K.zahl(2, {
                    n: s.zeugen,
                    werte: { front: s.front, flucht: s.flucht },
                    beleg: "Tat " + s.tat + " um 10 Uhr, reagiert " + s.reagiert + " binnen 60 m (jenseits des Zeugen-Kreises " + s.jenseits + "), Gegenlauf ohne Tat weg " + s.gegenlauf + ", Furcht der Zeugen " + JSON.stringify(s.furcht),
                    taeter: s.front > 8 ? "stamm/siedlung-bewohner.js _bewohnerZeuge: jeder Zeuge ≤ " + s.zeugeM + " m erinnert die Tat im selben Takt, kein Schreck wandert über Sicht und Klang" : null,
                });
            });
        },
        proben: {
            2: [
                { name: "die Kunde im selben Takt (Front 999 m/s) — ROT an der Front", j: mut("mensch.menge.kollektiv", 2, 140, { front: 999, flucht: 0.95 }), gruen: false, zahl: /ROT an Schreck-Front in m je s 999 verfehlt 3–8/ },
                { name: "Attrappe: die Zeugen bleiben stehen (Flucht 0,4) — ROT an der Flucht", j: mut("mensch.menge.kollektiv", 2, 140, { front: 5, flucht: 0.4 }), gruen: false, zahl: /ROT an Anteil Zeugen auf der Flucht weg 0\.4 verfehlt ≥ 0\.9/ },
            ],
        },
    }),
];
