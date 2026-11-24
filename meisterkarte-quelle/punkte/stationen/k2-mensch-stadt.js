// DIE RICHTER-STATIONEN DER PERSPEKTIVE stadt (Meisterkarte 2, Kapitel mensch; die Fabrik k2-mensch.js): sieben Leitern, je Leiter
// EIN Mess-Programm in der warmen Welt der Sitzung. Gemessen wird das ERGEBNIS der Welt: die Häuser, die als Bau der Welt an ihrem
// Slot stehen (der Bau mit dem Samen des Slots binnen 1 m an seinem Ort — der Leser von scripts/lib/stadt-proben.cjs), ihre Hülle
// (die festen Blocker-Kisten über dem Grund), die Pläne der Orte (`_bewohnerSiedlungen`: Straßen, Grundrisse, Region, Jahr, Kern),
// die Bewohner (Leib, Ort, Höhe über dem Grund und dem gezeichneten Wasser), das Rang-Gesetz der Zellen (`_autoSettlementCellInfo`,
// derselbe Leser wie siedlung.K2) und Bilder an fester Pose. Wo die Welt den Umfang der Sprosse nicht stellen kann, misst die Probe den
// Umfang, den sie stellt, und urteilt „Umfang nicht erzeugbar“ mit der Zahl (erreicht die Welt ihn, wirft die Sprosse: ihre Messung
// ist dann nicht gebaut — UNGEMESSEN beim Namen, nie ein falsches ROT). Sechs Sprossen urteilen das GESETZ am Fächer
// (stationen/faecher.js, Meta-Gesetz M4), nie die Bühne des Messorts: groesse#1, vertikal#2, breite#1, siedlungsnetz#2, habitat#1,
// messlatte#1 (ORT_AN, NETZ_AN und die Fächer der Fronten unten).
"use strict";

const { FAECHER } = require("./faecher.js");

// ───────────────────────── DIE SEITE DER WELT: der Ort am Spieler (r = Welt, T = THREE) ─────────────────────────
// o: nahM (der Ort = die größte Siedlung mit stehenden Häusern binnen nahM m, sonst die nächste) · blick (die Häuser im Bild der Kamera
// des Spiels) · rand (die Pose am Ortsrand mit den meisten freien Häusern) · strasse/strasseM (die Straße nächst dem Spieler und ihre
// ersten strasseM m) · block (der Block am Haus nächst dem Spieler) · hoch (das höchste Gebäude binnen 1500 m) · ueber (die
// Überführungen der Straßen, die Regel von vertikal S1)
const STADT = async (r, T, o) => {
    o = o || {};
    const st = r.state;
    const pm = st.playerMesh.position;
    const r2 = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);
    const terr = (x, z) => r.getTerrainHeightAt(x, z);
    const boden = (x, z) => {
        const y = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(x, z) : NaN;
        return isFinite(y) ? y : terr(x, z);
    };
    const B = r._bewohnerSiedlungen || new Map();
    const alle = [...B.values()].filter((q) => q && q.plan && Array.isArray(q.plan.slots));
    if (!alle.length) return { fehler: "keine Siedlung mit Plan in der Welt der Sitzung (r._bewohnerSiedlungen leer)" };
    const dS = (q) => Math.hypot(q.ox - pm.x, q.oz - pm.z);
    // WAS STEHT: der Bau der Welt mit dem Samen des Slots an seinem Ort (stadt-proben.cjs)
    const jeSame = new Map();
    for (const e of st.architectures || [])
        if (e && e.position) {
            const k = e.seed >>> 0;
            const L = jeSame.get(k);
            if (L) L.push(e);
            else jeSame.set(k, [e]);
        }
    const stehend = (q) => {
        const aus = [];
        for (const sl of q.plan.slots) {
            if (!sl || !sl.obb) continue;
            const e = (jeSame.get(sl.seed >>> 0) || []).find((x) => Math.hypot(x.position.x - q.ox - sl.x, x.position.z - q.oz - sl.z) < 1);
            if (e) aus.push({ sl, e, q });
        }
        return aus;
    };
    const je = alle.map((q) => ({ q, H: stehend(q) })).filter((x) => x.H.length > 0);
    if (!je.length) return { fehler: "keine Siedlung mit stehenden Häusern (" + alle.length + " Pläne)" };
    const nah = je.filter((x) => dS(x.q) < (o.nahM || 600));
    let O = (nah.length ? nah : je)[0];
    for (const x of nah.length ? nah : je) if (nah.length ? x.H.length > O.H.length : dS(x.q) < dS(O.q)) O = x;
    const S = O.q;
    const Hs = O.H;
    const plan = S.plan;
    // DIE FORM-ZWILLINGE: Häuser derselben Gestalt (Rolle, Stil, Geschosse, Breite und Tiefe auf 0,5 m, Dachneigung auf 5°, Dach,
    // Grundriss) — gezählt wird jedes Haus, dessen Gestalt ein zweites trägt
    const sig = (sl) => {
        const v = sl.ov || {};
        const g = (x, s) => (typeof x === "number" && isFinite(x) ? Math.round(x / s) * s : x == null ? "" : String(x));
        return [sl.rolle, v.stil, v.storeys, g(v.W, 0.5), g(v.D, 0.5), g(v.pitchDeg, 5), v.dachTyp, v.grundriss].join("|");
    };
    const zwillinge = (L) => {
        const z = new Map();
        for (const h of L) z.set(sig(h.sl), (z.get(sig(h.sl)) || 0) + 1);
        let n = 0;
        for (const v of z.values()) if (v > 1) n += v;
        return n;
    };
    // die Strecke (ex, ez) → (px, pz) kreuzt den Grundriss b (plan-lokal) — stadt-proben.cjs `kreuzt`
    const kreuzt = (b, ex, ez, px, pz) => {
        const c = Math.cos(b.phi);
        const s = Math.sin(b.phi);
        const lok = (x, z) => [(x - b.cx) * c - (z - b.cz) * s, (x - b.cx) * s + (z - b.cz) * c];
        const a = lok(ex, ez);
        const e = lok(px, pz);
        let t0 = 0;
        let t1 = 1;
        for (const [k, h] of [
            [0, b.ex],
            [1, b.ez],
        ]) {
            const d = e[k] - a[k];
            if (Math.abs(d) < 1e-9) {
                if (Math.abs(a[k]) > h) return false;
                continue;
            }
            const u = (-h - a[k]) / d;
            const w = (h - a[k]) / d;
            t0 = Math.max(t0, Math.min(u, w));
            t1 = Math.min(t1, Math.max(u, w));
        }
        return t0 < t1;
    };
    // der nächste Punkt des Grundrisses b zum Auge, 0,3 m vor seiner Wand — stadt-proben.cjs `wandPunkt`
    const wandPunkt = (b, ex, ez) => {
        const c = Math.cos(b.phi);
        const s = Math.sin(b.phi);
        const lx = (ex - b.cx) * c - (ez - b.cz) * s;
        const lz = (ex - b.cx) * s + (ez - b.cz) * c;
        const qx = Math.max(-b.ex, Math.min(b.ex, lx));
        const qz = Math.max(-b.ez, Math.min(b.ez, lz));
        const wx = b.cx + qx * c + qz * s;
        const wz = b.cz - qx * s + qz * c;
        const d = Math.hypot(wx - ex, wz - ez) || 1;
        return [wx + ((ex - wx) / d) * 0.3, wz + ((ez - wz) / d) * 0.3, d];
    };
    // DIE HÄUSER IM BILD einer Pose (1280 × 720 wie K.bild): ihr nächster Wand-Punkt 2 m über ihrem Boden liegt im Rahmen, näher als
    // sichtM, und kein anderer stehender Grundriss steht auf der Sichtlinie (2D — von oben eine Untergrenze)
    const imBlick = (P, sichtM) => {
        const cam = st.camera.clone();
        cam.aspect = 1280 / 720;
        cam.position.set(P.px, P.py, P.pz);
        cam.lookAt(P.lx, P.ly, P.lz + 1e-4);
        cam.updateProjectionMatrix();
        cam.updateMatrixWorld(true);
        const v = new T.Vector3();
        const ex = P.px - S.ox;
        const ez = P.pz - S.oz;
        const nahe = Hs.filter((h) => Math.hypot(h.sl.obb.cx - ex, h.sl.obb.cz - ez) < sichtM + 30);
        const seen = [];
        for (const h of nahe) {
            const [wx, wz, d] = wandPunkt(h.sl.obb, ex, ez);
            if (d > sichtM) continue;
            const y = (typeof h.sl.y === "number" ? h.sl.y : h.e.position.y) + 2;
            v.set(S.ox + wx, y, S.oz + wz).project(cam);
            if (!(Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1)) continue;
            if (nahe.some((g) => g !== h && kreuzt(g.sl.obb, ex, ez, wx, wz))) continue;
            seen.push(h);
        }
        return seen;
    };
    const lang = (p) => {
        let L = 0;
        for (let k = 1; k < p.length; k++) L += Math.hypot(p[k].x - p[k - 1].x, p[k].z - p[k - 1].z);
        return L;
    };
    const roads = (plan.roads || []).filter((rd) => rd && Array.isArray(rd.pts) && rd.pts.length >= 2);
    const aus = {
        ort: { key: S.key, name: plan.name, region: plan.region, jahr: plan.jahr, groesse: plan.groesse, kernel: plan.kernel, seed: plan.seed >>> 0, ox: r2(S.ox), oz: r2(S.oz), d: r2(dS(S)) },
        slots: plan.slots.length,
        steht: Hs.length,
        mitTuer: Hs.filter((h) => h.sl.tuer).length,
        strassen: roads.length,
        netzKm: r2(roads.reduce((a, rd) => a + lang(rd.pts), 0) / 1000),
        viertel: new Set(Hs.map((h) => h.sl.viertel || "ohne")).size,
        kulturen: [...new Set(Hs.map((h) => h.sl.kultur || "ohne"))],
        zwillinge: zwillinge(Hs),
    };
    // die Fläche: das Rechteck der stehenden Häuser (Mitte ± größte halbe Seite), km²
    {
        let [x0, x1, z0, z1] = [Infinity, -Infinity, Infinity, -Infinity];
        for (const h of Hs) {
            const e = Math.max(h.sl.obb.ex, h.sl.obb.ez);
            x0 = Math.min(x0, h.sl.obb.cx - e);
            x1 = Math.max(x1, h.sl.obb.cx + e);
            z0 = Math.min(z0, h.sl.obb.cz - e);
            z1 = Math.max(z1, h.sl.obb.cz + e);
        }
        aus.flaecheKm2 = Math.round(((x1 - x0) * (z1 - z0)) / 1e3) / 1e3;
    }
    // DIE SITZUNG: alle Orte mit stehenden Häusern — Saaten, Regionen, Kerne, Kultur × Jahrhundert, das jüngste Jahr, die Bewohner
    aus.siedlungen = je.length;
    aus.stehtAlle = je.reduce((a, x) => a + x.H.length, 0);
    aus.saaten = new Set(je.map((x) => x.q.plan.seed >>> 0)).size;
    aus.regionen = [...new Set(je.map((x) => x.q.plan.region || "ohne"))];
    aus.kerne = [...new Set(je.map((x) => x.q.plan.kernel || "ohne"))];
    aus.kulturEpoche = new Set(je.map((x) => (x.q.plan.region || "ohne") + ":" + Math.floor((x.q.plan.jahr || 0) / 100))).size;
    aus.jahrMax = Math.max(...je.map((x) => (typeof x.q.plan.jahr === "number" ? x.q.plan.jahr : -Infinity)));
    aus.bewohnerAlle = je.reduce((a, x) => a + (Array.isArray(x.q.liste) ? x.q.liste.length : 0), 0);
    aus.sichtKm = r2(Math.max(...je.flatMap((x) => x.H.map((h) => Math.hypot(h.e.position.x - pm.x, h.e.position.z - pm.z)))) / 1000);
    aus.fremde = je.filter((x) => (x.q.liste || []).some((b) => b && b.genom && b.genom.headRatio == null)).length;
    aus.welten = [st.worldMeta && st.worldMeta.seed].filter((x) => x != null).length;
    aus.schwere = typeof st.gravity === "number" ? r2(st.gravity) : null;
    // die Orte fern der Oberfläche: der Boden ihrer Häuser im Mittel mehr als 50 m vom Grund (Habitat, Schale, Station)
    aus.habitate = je.filter((x) => x.H.reduce((a, h) => a + Math.abs(h.e.position.y - terr(h.e.position.x, h.e.position.z)), 0) / x.H.length > 50).length;
    // DIE BEWOHNER des Orts: Leib über dem Grund und dem gezeichneten Wasser, je Hektar, die Dekaden ihrer Höhe über Grund
    {
        const L = (Array.isArray(S.liste) ? S.liste : []).filter((b) => b && b.leib && b.leib.position);
        const ha = new Map();
        const dek = new Set();
        let [unterGrund, unterWasser, fern] = [0, 0, 0];
        for (const b of L) {
            const p = b.leib.position;
            const g = terr(p.x, p.z);
            const h = p.y - g;
            if (h < -2) unterGrund++;
            if (Math.abs(h) > 50) fern++;
            const w = typeof r._wasserBildAt === "function" ? r._wasserBildAt(p.x, p.z) : null;
            if (typeof w === "number" && isFinite(w) && p.y < w - 1) unterWasser++;
            const k = Math.floor(p.x / 100) + "," + Math.floor(p.z / 100);
            ha.set(k, (ha.get(k) || 0) + 1);
            dek.add(Math.abs(h) < 1 ? 0 : Math.floor(Math.log10(Math.abs(h))) + 1);
        }
        const g0 = typeof st.gravity === "number" ? Math.abs(st.gravity) : NaN;
        aus.bewohner = {
            n: Array.isArray(S.liste) ? S.liste.length : 0,
            mitLeib: L.length,
            unterGrund,
            unterWasser,
            fern,
            proHaMax: Math.max(0, ...ha.values()),
            dekaden: dek.size,
            niedrigSchwer: isFinite(g0) && g0 > 0.1 && g0 <= 9.81 / 3 + 0.2 ? aus.bewohnerAlle : 0,
            schwerelos: isFinite(g0) && g0 <= 0.1 ? aus.bewohnerAlle : 0,
        };
    }
    // die Pose der Kamera des Spiels (der Messort stellt sie: ortPose), der Blick 30 m voraus
    const camPose = () => {
        const c = st.camera;
        c.updateMatrixWorld(true);
        const dir = new T.Vector3();
        c.getWorldDirection(dir);
        const p = c.position;
        return { px: r2(p.x), py: r2(p.y), pz: r2(p.z), lx: r2(p.x + dir.x * 30), ly: r2(p.y + dir.y * 30), lz: r2(p.z + dir.z * 30) };
    };
    if (o.blick) {
        const P = camPose();
        const L = imBlick(P, o.sichtM || 300);
        aus.blick = { pose: P, n: L.length, zwillinge: zwillinge(L) };
    }
    // DER ORTSRAND: 8 Richtungen um die Mitte der Häuser, 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte (3 m) —
    // die Richtung mit den meisten Häusern im Bild
    if (o.rand) {
        const cx = Hs.reduce((a, h) => a + S.ox + h.sl.obb.cx, 0) / Hs.length;
        const cz = Hs.reduce((a, h) => a + S.oz + h.sl.obb.cz, 0) / Hs.length;
        const R = Math.max(...Hs.map((h) => Math.hypot(S.ox + h.sl.obb.cx - cx, S.oz + h.sl.obb.cz - cz) + Math.hypot(h.sl.obb.ex, h.sl.obb.ez)));
        let best = null;
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            const px = cx + Math.cos(a) * (R + 20);
            const pz = cz + Math.sin(a) * (R + 20);
            const P = { px: r2(px), py: r2(boden(px, pz) + 8), pz: r2(pz), lx: r2(cx), ly: r2(boden(cx, cz) + 3), lz: r2(cz) };
            const L = imBlick(P, 2 * R + 60);
            if (!best || L.length > best.L.length) best = { P, L, grad: i * 45 };
        }
        aus.rand = { pose: best.P, richtungGrad: best.grad, n: best.L.length, zwillinge: zwillinge(best.L), R: r2(R) };
    }
    // DIE STRASSE nächst dem Spieler: ihre ersten strasseM m (vorwärts, sonst rückwärts; trägt sie die Länge nicht, die längste Straße
    // ab ihrem Anfang); das Auge 1,7 m über dem Grund am Anfang, der Blick längs der Straße. Gezählt längs des Stücks: Häuser mit Front
    // an der Straße (Grundriss ≤ 12 m von der Achse), davon Gewerbe (Rolle ≠ wohnhaus), Menschen (Leib draußen ≤ 10 m), Wagen (≤ 10 m)
    if (o.strasse && roads.length) {
        const M = o.strasseM || 100;
        let best = null;
        for (const rd of roads)
            rd.pts.forEach((q, k) => {
                const d = Math.hypot(S.ox + q.x - pm.x, S.oz + q.z - pm.z);
                if (!best || d < best.d) best = { rd, k, d };
            });
        let rd = best.rd;
        let k0 = best.k;
        if (lang(rd.pts) < M) {
            rd = roads.reduce((a, x) => (lang(x.pts) > lang(a.pts) ? x : a));
            k0 = 0;
        }
        const zug = lang(rd.pts.slice(k0)) >= Math.min(M, lang(rd.pts)) ? rd.pts.slice(k0) : rd.pts.slice(0, k0 + 1).reverse();
        const weg = [zug[0]];
        let L = 0;
        for (let k = 1; k < zug.length && L < M; k++) {
            L += Math.hypot(zug[k].x - zug[k - 1].x, zug[k].z - zug[k - 1].z);
            weg.push(zug[k]);
        }
        const dWeg = (x, z) => {
            let m = Infinity;
            for (let k = 1; k < weg.length; k++) {
                const a = weg[k - 1];
                const b = weg[k];
                const dx = b.x - a.x;
                const dz = b.z - a.z;
                const l2 = dx * dx + dz * dz || 1;
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
                m = Math.min(m, Math.hypot(x - a.x - dx * t, z - a.z - dz * t));
            }
            return m;
        };
        const front = Hs.filter((h) => dWeg(h.sl.obb.cx, h.sl.obb.cz) - Math.max(h.sl.obb.ex, h.sl.obb.ez) <= 12);
        const menschen = (Array.isArray(S.liste) ? S.liste : []).filter((b) => b && b.leib && b.leib.position && !b.drinnen && dWeg(b.leib.position.x - S.ox, b.leib.position.z - S.oz) <= 10).length;
        const wagen = ((S.verkehr && S.verkehr.wagen) || []).filter((W) => W && W.entry && W.entry.position && dWeg(W.entry.position.x - S.ox, W.entry.position.z - S.oz) <= 10).length;
        const a = weg[0];
        const z = weg[Math.min(weg.length - 1, Math.max(1, Math.round(weg.length * 0.4)))];
        const ya = boden(S.ox + a.x, S.oz + a.z) + 1.7;
        aus.strasse = {
            pose: { px: r2(S.ox + a.x), py: r2(ya), pz: r2(S.oz + a.z), lx: r2(S.ox + z.x), ly: r2(ya), lz: r2(S.oz + z.z) },
            laengeM: r2(L),
            klasse: ["ortsdurchfahrt", "wohnstrasse", "gasse"][Math.max(0, Math.min(2, rd.gen | 0))],
            fassaden: front.length,
            gewerbe: front.filter((h) => h.sl.rolle && h.sl.rolle !== "wohnhaus").length,
            menschen,
            wagen,
            dSpieler: r2(Math.hypot(S.ox + a.x - pm.x, S.oz + a.z - pm.z)),
        };
    }
    // DER BLOCK am Haus nächst dem Spieler: die stehenden Häuser binnen 35 m um seine Mitte, die mit Tür (der Eingang in einen Raum);
    // die Pose vom Straßenpunkt nächst dem Haus, Auge 1,7 m, Blick auf seine Mitte 3 m über seinem Boden
    if (o.block && roads.length) {
        let h0 = Hs[0];
        for (const h of Hs) if (Math.hypot(S.ox + h.sl.obb.cx - pm.x, S.oz + h.sl.obb.cz - pm.z) < Math.hypot(S.ox + h0.sl.obb.cx - pm.x, S.oz + h0.sl.obb.cz - pm.z)) h0 = h;
        const blk = Hs.filter((h) => Math.hypot(h.sl.obb.cx - h0.sl.obb.cx, h.sl.obb.cz - h0.sl.obb.cz) <= 35);
        let q0 = null;
        for (const rd of roads)
            for (const q of rd.pts) {
                const d = Math.hypot(q.x - h0.sl.obb.cx, q.z - h0.sl.obb.cz);
                if (!q0 || d < q0.d) q0 = { q, d };
            }
        const yb = typeof h0.sl.y === "number" ? h0.sl.y : h0.e.position.y;
        const ya = boden(S.ox + q0.q.x, S.oz + q0.q.z) + 1.7;
        aus.block = {
            pose: { px: r2(S.ox + q0.q.x), py: r2(ya), pz: r2(S.oz + q0.q.z), lx: r2(S.ox + h0.sl.obb.cx), ly: r2(yb + 3), lz: r2(S.oz + h0.sl.obb.cz) },
            haeuser: blk.length,
            mitTuer: blk.filter((h) => h.sl.tuer).length,
            dSpieler: r2(Math.hypot(S.ox + q0.q.x - pm.x, S.oz + q0.q.z - pm.z)),
        };
    }
    // DAS HÖCHSTE GEBÄUDE binnen 1500 m: die Oberkante seiner festen Hülle (Blocker-Kisten ohne Pflanze und ohne stempelfreie Teile)
    // über dem Grund an seinem Fuß; daneben die Geschosse seines Slots
    if (o.hoch) {
        let best = null;
        let gMax = 0;
        for (const x of je.filter((y) => dS(y.q) < 1500))
            for (const h of x.H) {
                let top = -Infinity;
                for (const a of h.e.blockerAABBs || []) if (a && !a.pflanze && !a.stempelfrei && isFinite(a.topY)) top = Math.max(top, a.topY);
                const g = h.sl.ov && typeof h.sl.ov.storeys === "number" ? h.sl.ov.storeys : 0;
                gMax = Math.max(gMax, g);
                if (!isFinite(top)) continue;
                const m = top - terr(h.e.position.x, h.e.position.z);
                if (!best || m > best.m) best = { m, g, x: h.e.position.x, z: h.e.position.z, rolle: h.sl.rolle };
            }
        aus.hoch = best ? { m: r2(best.m), geschosse: best.g, geschosseMax: gMax, x: r2(best.x), z: r2(best.z), rolle: best.rolle } : { m: null, geschosseMax: gMax };
    }
    // DIE EBENEN (vertikal S1): zwei Straßen-Stücke eines Plans, die sich ohne gemeinsamen Knoten (1 m) kreuzen, sind eine Überführung —
    // ohne sie trägt die Stadt EINE begehbare Ebene; über die Pläne binnen 1500 m
    if (o.ueber) {
        let ueber = 0;
        for (const x of je.filter((y) => dS(y.q) < 1500)) {
            const seg = [];
            for (const rd of x.q.plan.roads || []) {
                const p = (rd && rd.pts) || [];
                for (let k = 0; k + 1 < p.length; k++) seg.push([p[k].x, p[k].z, p[k + 1].x, p[k + 1].z]);
            }
            const nahEnde = (px, pz, sg) => Math.hypot(px - sg[0], pz - sg[1]) < 1 || Math.hypot(px - sg[2], pz - sg[3]) < 1;
            for (let a = 0; a < seg.length; a++)
                for (let b = a + 1; b < seg.length; b++) {
                    const A = seg[a];
                    const C = seg[b];
                    const dx1 = A[2] - A[0];
                    const dz1 = A[3] - A[1];
                    const dx2 = C[2] - C[0];
                    const dz2 = C[3] - C[1];
                    const den = dx1 * dz2 - dz1 * dx2;
                    if (Math.abs(den) < 1e-9) continue;
                    const ta = ((C[0] - A[0]) * dz2 - (C[1] - A[1]) * dx2) / den;
                    const tb = ((C[0] - A[0]) * dz1 - (C[1] - A[1]) * dx1) / den;
                    if (ta <= 0 || ta >= 1 || tb <= 0 || tb >= 1) continue;
                    const px = A[0] + dx1 * ta;
                    const pz = A[1] + dz1 * ta;
                    if (!nahEnde(px, pz, A) && !nahEnde(px, pz, C)) ueber++;
                }
        }
        aus.ueber = ueber;
        aus.ebenen = ueber > 0 ? 2 : 1;
    }
    return aus;
};

// DAS LAND (das Rang-Gesetz, derselbe Leser wie siedlung.K2 und siedlungsnetz S1): die Zellen eines Quadrats von seiteKm um den Spieler
// fragt die Probe die Welt (`_autoSettlementCellInfo` — wo die Welt ihre Orte trägt) bis zur Frist budgetMs; gezählt: Orte, Städte der
// Rang-Stufe 2, die Dekaden ihrer Größen, der Anteil der Zellen mit Ort. Dazu die Bewohner und die Sichtweite der stehenden Orte.
const LAND = async (r, T, o) => {
    const st = r.state;
    const pm = st.playerMesh.position;
    const t0 = performance.now();
    const r2 = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);
    const A = typeof AnazhRealm._siedlungGesetz === "function" ? AnazhRealm._siedlungGesetz() : null;
    if (!A || typeof r._autoSettlementCellInfo !== "function") return { fehler: "das Siedlungs-Gesetz fehlt (_siedlungGesetz · _autoSettlementCellInfo)" };
    const M = A.cellM;
    const halb = Math.round((o.seiteKm * 1000) / M / 2);
    const c0 = [Math.floor(pm.x / M), Math.floor(pm.z / M)];
    const groessen = [];
    let zellen = 0;
    let staedte = 0;
    let voll = true;
    for (let i = -halb; i < halb && voll; i++) {
        for (let k = -halb; k < halb; k++) {
            const z = r._autoSettlementCellInfo(c0[0] + i, c0[1] + k);
            zellen++;
            if (z && z.nH > 0) {
                groessen.push(z.nH);
                if ((z.stufe | 0) >= 2) staedte++;
            }
        }
        if (performance.now() - t0 > o.budgetMs) voll = false;
    }
    const B = r._bewohnerSiedlungen || new Map();
    const alle = [...B.values()].filter((q) => q && q.plan);
    const gross = groessen.length ? Math.max(...groessen) : 0;
    const klein = groessen.length ? Math.min(...groessen) : 0;
    return {
        seiteKm: r2((2 * halb * M) / 1000),
        zellen,
        voll,
        orte: groessen.length,
        staedte,
        dekaden: klein > 0 ? r2(Math.log10(gross / klein)) : 0,
        groesseMax: gross,
        bebaut: zellen ? r2(groessen.length / zellen) : null,
        bewohner: alle.reduce((a, q) => a + (Array.isArray(q.liste) ? q.liste.length : 0), 0),
        siedlungen: alle.length,
        sichtKm: r2(Math.max(0, ...alle.map((q) => Math.hypot(q.ox - pm.x, q.oz - pm.z))) / 1000),
        welten: [st.worldMeta && st.worldMeta.seed].filter((x) => x != null).length,
        s: r2((performance.now() - t0) / 1000),
    };
};

// ───────────────────────── DER FÄCHER AM GESETZ (pm-faecher-mensch 24.11.; Meta-Gesetz M4, stationen/faecher.js) ─────────────────────────
// Die Fronten habitat#1 · groesse#1 · vertikal#2 · breite#1 · messlatte#1 · siedlungsnetz#2 urteilen das GESETZ an einem Fächer von
// Adressen, nie die EINE Stadt am Messort. Bis hier stand jede auf der Bühne (STADT am Messort: EINE Saat, EIN Plan).
//
// DER ORT DES GESETZES AN EINER ADRESSE: der Plan, den das Spiel für eine Zelle der Welt bestellt. Gerufen wird fachwerk
// exportSettlement({seed, nH, epoche}), so wie der Wirt ihn ruft (stamm/siedlung-ort.js:2145 `_dorfBereiten` → :308 der Faden).
//   a.saat  der Zell-Same: der Hash der Zelle, den `siedlungsZelle` als seed gibt.
//   Größe   aus dem Rang-Gesetz der Stufe mit.stufe (`siedlungsGroesse`).
//   Epoche  die Legende des Samens (`siedlungsEpoche`). Oder a.zeit, das Wort einer Epoche, wie der Satz „dorf <saat> <epoche>“ es
//           dem Export reicht; dann gilt die Größe ihrer Klasse.
// Gelesen, nie nachgerechnet:
//   - die Slots: Rolle, Kultur, der Vektor ov, der Grund;
//   - die Massen (`planMassen`, Leser stamm/siedlung-wege.js:2056; die Hülle ext.y1 der Stapel-Bauten über 11 Geschossen steht bei 0,6 m);
//   - die Leute (`leuteVon`, Leser stamm/siedlung-bewohner.js:380);
//   - die Räume unter Grade (BAU_NUTZUNG.raeume mit der Ebene „keller“);
//   - die Gassen (`roads`).
// Die Form-Zwillinge zählen nach der Regel von STADT oben: Rolle, Stil, Geschosse, Breite und Tiefe auf 0,5 m, Neigung auf 5°, Dach,
// Grundriss.
// Die Adresse a.ort = "welt" ist der Ort der Sitzung: der Plan, den die Welt hält (`_bewohnerSiedlungen`, derselbe Export), der größte
// binnen 600 m um den Spieler, sonst der nächste. Dort trägt die Straße die Pose eines Bilds und zählt Menschen und Wagen der Welt.
const ORT_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.exportSettlement !== "function" || !FC.SIEDLUNG) return { fehlt: "der Kern trägt kein Siedlungs-Gesetz (fachwerk exportSettlement fehlt)" };
    let h, dp, P, W0 = null;
    if (a.ort === "welt") {
        const B = r && r._bewohnerSiedlungen;
        const pm = r && r.state && r.state.playerMesh && r.state.playerMesh.position;
        const alle = B && pm ? [...B.values()].filter((q) => q && q.plan && Array.isArray(q.plan.slots)) : [];
        if (!alle.length) return { fehlt: "der Ort der Sitzung fehlt (r._bewohnerSiedlungen trägt keinen Plan am Spieler)" };
        const d = (q) => Math.hypot(q.ox - pm.x, q.oz - pm.z);
        const nah = alle.filter((q) => d(q) < 600);
        W0 = nah.length ? nah.reduce((x, y) => (y.plan.slots.length > x.plan.slots.length ? y : x)) : alle.reduce((x, y) => (d(y) < d(x) ? y : x));
        P = W0.plan;
        h = P.seed >>> 0;
        dp = { seed: h, nH: null, epoche: P.epoche || null };
    } else {
        h = a.saat >>> 0 || 1;
        dp = a.zeit ? { seed: h, epoche: a.zeit } : { seed: h, nH: FC.siedlungsGroesse(FC.SIEDLUNG, h, mit.stufe | 0), epoche: FC.siedlungsEpoche(h) };
        P = FC.exportSettlement(dp);
    }
    const L = (P.slots || []).filter((sl) => sl && sl.ov);
    const r1 = (v) => Math.round(v * 10) / 10;
    const g = (x, s) => (typeof x === "number" && isFinite(x) ? Math.round(x / s) * s : x == null ? "" : String(x));
    const sig = (sl) => [sl.rolle, sl.ov.stil, sl.ov.storeys, g(sl.ov.W, 0.5), g(sl.ov.D, 0.5), g(sl.ov.pitchDeg, 5), sl.ov.dachTyp, sl.ov.grundriss].join("|");
    const z = new Map();
    for (const sl of L) z.set(sig(sl), (z.get(sig(sl)) || []).concat([sl]));
    let zwillinge = 0, paar = null;
    for (const [k, v] of z)
        if (v.length > 1) {
            zwillinge += v.length;
            if (!paar) paar = k + " (" + v.map((sl) => sl.kultur + " " + sl.ov.W + "×" + sl.ov.D + " m " + r1(sl.ov.pitchDeg) + "°").join(" = ") + ")";
        }
    // die Zeile des Bau-Gesetzes je Slot (ov.programm ist ihre `zeile`) und was sie unter Grade und zur Straße trägt
    const zeile = new Map(Object.values(FC.BAU_NUTZUNG || {}).map((q) => [q.zeile, q]));
    const raeume = (sl) => ((zeile.get(sl.ov.programm) || {}).raeume || []);
    const wohnUnter = L.filter((sl) => raeume(sl).some((q) => q[4] === "keller" && /wohn|kammer|schlaf|stube/.test(q[0])));
    const leute = (sl) => (typeof FC.leuteVon === "function" ? FC.leuteVon(sl.ov) : 0);
    const M = typeof FC.planMassen === "function" ? FC.planMassen(P) : null;
    let hoch = { m: 0, geschosse: 0, rolle: null };
    if (M) for (let k = 0; k < M.n; k++) if (M.lage[k * 7 + 3] > 0 && M.lage[k * 7 + 5] + M.lage[k * 7 + 6] > hoch.m) hoch = { m: r1(M.lage[k * 7 + 5] + M.lage[k * 7 + 6]), geschosse: P.slots[k].ov.storeys, rolle: P.slots[k].rolle };
    const aus = {
        h, nH: dp.nH == null ? null : dp.nH, epoche: dp.epoche || null, name: P.name, region: P.region, jahr: P.jahr, groesse: P.groesse,
        n: L.length, haeuser: L.filter((sl) => sl.rolle !== "scheune").length, zwillinge, paar,
        kulturen: [...new Set(L.filter((sl) => sl.rolle !== "scheune").map((sl) => sl.kultur))].sort(),
        geschosse: Math.max(0, ...L.map((sl) => sl.ov.storeys || 0)), hoeheM: hoch.m, hoch,
        keller: L.filter((sl) => sl.grund && sl.grund.keller).length,
        tiefM: r1(Math.min(0, ...L.map((sl) => (sl.grund && sl.grund.keller ? sl.grund.keller[4] : 0)))),
        unterGrade: [...new Set(L.flatMap((sl) => raeume(sl).filter((q) => q[4] === "keller").map((q) => q[0])))].sort(),
        wohnUnter: wohnUnter.length, leute: L.reduce((s, sl) => s + leute(sl), 0), leuteUnter: wohnUnter.reduce((s, sl) => s + leute(sl), 0),
    };
    // DIE STRASSE (mit.strasseM): der Plan gibt die Gassen als Kanten des Wegnetzes (je ≤ 62 m, roads), die Straße ist ihr Zug. Gezogen
    // wird von jeder Kante, beide Richtungen: am Knoten weiter auf die Kante mit dem kleinsten Knick (≤ 35°, ein Blick längs der Straße).
    // Der längste Zug ist die Straße; gemessen werden ihre ersten strasseM m. Gezählt längs des Stücks (die Regel von STADT strasse
    // oben):
    //   Fassaden  Grundriss ≤ 12 m von der Achse;
    //   Läden     davon die, deren Zeile im Erdgeschoss zur Straße Handel oder Werk trägt;
    //   Leute     wer in den Fassaden wohnt.
    if (mit.strasseM) {
        const lang = (p) => p.reduce((s, q, k) => (k ? s + Math.hypot(q.x - p[k - 1].x, q.z - p[k - 1].z) : 0), 0);
        const roads = (P.roads || []).filter((rd) => rd && Array.isArray(rd.pts) && rd.pts.length >= 2);
        const knoten = (q) => Math.round(q.x * 2) + "," + Math.round(q.z * 2);
        const an = new Map();
        roads.forEach((rd, i) => {
            for (const [q, vor] of [[rd.pts[0], true], [rd.pts[rd.pts.length - 1], false]]) an.set(knoten(q), (an.get(knoten(q)) || []).concat([{ i, vor }]));
        });
        const lauf = (i, vor) => (vor ? roads[i].pts : roads[i].pts.slice().reverse());
        const richtung = (p, ende) => {
            const a = ende ? p[Math.max(0, p.length - 4)] : p[0], b = ende ? p[p.length - 1] : p[Math.min(p.length - 1, 3)];
            return Math.atan2(b.z - a.z, b.x - a.x);
        };
        let zug = [];
        for (let i0 = 0; i0 < roads.length; i0++)
            for (const v0 of [true, false]) {
                const benutzt = new Set([i0]);
                let p = lauf(i0, v0), pfad = p.slice();
                while (lang(pfad) < 3 * mit.strasseM) {
                    const r0 = richtung(p, true);
                    let best = null;
                    for (const e of an.get(knoten(p[p.length - 1])) || []) {
                        if (benutzt.has(e.i)) continue;
                        const q = lauf(e.i, e.vor), knick = Math.abs(((richtung(q, false) - r0 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
                        if (knick <= (35 * Math.PI) / 180 && (!best || knick < best.knick)) best = { e, q, knick };
                    }
                    if (!best) break;
                    benutzt.add(best.e.i);
                    p = best.q;
                    pfad = pfad.concat(p.slice(1));
                }
                if (lang(pfad) > lang(zug)) zug = pfad;
            }
        const weg = [];
        let lm = 0;
        for (let k = 0; k < zug.length && (k < 1 || lm < mit.strasseM); k++) {
            if (k) lm += Math.hypot(zug[k].x - zug[k - 1].x, zug[k].z - zug[k - 1].z);
            weg.push(zug[k]);
        }
        const rd = zug.length ? { pts: zug } : null;
        const dWeg = (x, zz) => {
            let m = Infinity;
            for (let k = 1; k < weg.length; k++) {
                const A = weg[k - 1], B = weg[k], dx = B.x - A.x, dz = B.z - A.z, t = Math.max(0, Math.min(1, ((x - A.x) * dx + (zz - A.z) * dz) / (dx * dx + dz * dz || 1)));
                m = Math.min(m, Math.hypot(x - A.x - dx * t, zz - A.z - dz * t));
            }
            return m;
        };
        const front = L.filter((sl) => sl.obb && dWeg(sl.obb.cx, sl.obb.cz) - Math.max(sl.obb.ex, sl.obb.ez) <= 12);
        aus.strasse = {
            laengeM: r1(lm), gasseM: rd ? r1(lang(rd.pts)) : 0, gassen: roads.length, fassaden: front.length,
            laeden: front.filter((sl) => raeume(sl).some((q) => q[4] === "eg" && q[5] === "strasse" && /laden|gaststube|kontor|werkraum|beschlagstand/.test(q[0]))).length,
            leute: front.reduce((s, sl) => s + leute(sl), 0),
        };
        // am Ort der Sitzung: die Pose (Auge 1,7 m über dem Grund am Anfang, Blick längs 40 % des Stücks) und was die Welt dort
        // trägt (die Regel von STADT strasse: Leib draußen ≤ 10 m, Wagen ≤ 10 m von der Achse)
        if (W0 && weg.length >= 2) {
            const y = (x, zz) => {
                const v = typeof r._voxelSurfaceY === "function" ? r._voxelSurfaceY(x, zz) : NaN;
                return isFinite(v) ? v : r.getTerrainHeightAt(x, zz);
            };
            const A0 = weg[0], Z0 = weg[Math.min(weg.length - 1, Math.max(1, Math.round(weg.length * 0.4)))];
            const ya = y(W0.ox + A0.x, W0.oz + A0.z) + 1.7;
            const r2 = (v) => Math.round(v * 100) / 100;
            aus.strasse.pose = { px: r2(W0.ox + A0.x), py: r2(ya), pz: r2(W0.oz + A0.z), lx: r2(W0.ox + Z0.x), ly: r2(ya), lz: r2(W0.oz + Z0.z) };
            aus.strasse.menschen = (Array.isArray(W0.liste) ? W0.liste : []).filter((b) => b && b.leib && b.leib.position && !b.drinnen && dWeg(b.leib.position.x - W0.ox, b.leib.position.z - W0.oz) <= 10).length;
            aus.strasse.wagen = ((W0.verkehr && W0.verkehr.wagen) || []).filter((V) => V && V.entry && V.entry.position && dWeg(V.entry.position.x - W0.ox, V.entry.position.z - W0.oz) <= 10).length;
        }
    }
    return aus;
};
// DAS LAND DES GESETZES (siedlungsnetz#2): das Rang-Gesetz (fachwerk `siedlungsZelle`, Leser stamm/siedlung-ort.js:1444) in einem
// Fenster von mit.zellen × mit.zellen Zellen am Ort a.ort = [km x, km z].
//   a.saat == null  die geladene Welt der Sitzung über den Wirt (`_autoSettlementCellInfo`, :1427).
//   a.saat = s      eine Welt des Gesetzes: dieselbe Funktion mit dem Hash des Kerns (fachwerk `ortHash` über [s, cx, cz]). Der Wirt
//                   hasht „<Welt-Same>:dorf:cx,cz“ und kennt nur die geladene Saat.
// Gelesen: die Orte, ihre Stufe und ihre Häuser. Dazu `sichtM`, wie weit die Welt Orte weckt (AnazhRealm.AUTO_SETTLEMENT.nearM).
const NETZ_AN = async (r, T, a, mit) => {
    const FC = globalThis.__fachwerkCore;
    if (!FC || typeof FC.siedlungsZelle !== "function" || !FC.SIEDLUNG) return { fehlt: "der Kern trägt kein Rang-Gesetz (fachwerk siedlungsZelle fehlt)" };
    const S = FC.SIEDLUNG;
    let frage;
    if (a.saat == null) {
        if (!r || typeof r._autoSettlementCellInfo !== "function") return { fehlt: "die geladene Welt fehlt (stamm/siedlung-ort.js:1427 `_autoSettlementCellInfo` fragt nur die Saat der Sitzung)" };
        frage = (cx, cz) => r._autoSettlementCellInfo(cx, cz);
    } else {
        const memo = new Map();
        frage = (cx, cz) => FC.siedlungsZelle(S, cx, cz, (x, zz) => FC.ortHash([a.saat, x, zz]), memo);
    }
    const c0 = [Math.floor((a.ort[0] * 1000) / S.cellM), Math.floor((a.ort[1] * 1000) / S.cellM)];
    let orte = 0, staedte = 0, haeuser = 0, nMax = 0;
    for (let i = 0; i < mit.zellen; i++)
        for (let k = 0; k < mit.zellen; k++) {
            const q = frage(c0[0] + i, c0[1] + k);
            if (!q || !(q.nH > 0)) continue;
            orte++;
            haeuser += q.nH;
            nMax = Math.max(nMax, q.nH);
            if ((q.stufe | 0) >= 2) staedte++;
        }
    const A = typeof AnazhRealm !== "undefined" && AnazhRealm.AUTO_SETTLEMENT ? AnazhRealm.AUTO_SETTLEMENT : null;
    return { welt: a.saat == null ? "geladen" : a.saat, km: a.ort, zellen: mit.zellen * mit.zellen, orte, staedte, haeuser, nMax, sichtM: A ? A.nearM + A.vorlaufM : null };
};
// DIE ZELL-SAMEN DES FÄCHERS: n Hashes, gestreut über 2³² (Knuth, gerade wie jede Zelle mit Ort bei rarity 2). Die Größe der Stufe 0
// spannt so nHMin … nHMin + nHSpan − 1. Mit kleinen Samen stünde jeder Ort bei nHMin (h >>> 24 = 0).
const ZELL_SAATEN = (n) => Array.from({ length: n }, (_, i) => Math.imul(2 * (i + 1), 2654435761) >>> 0);
// DIE FÄCHER DER FRONTEN. Je Front die Bauart, dazu `urteil(R)`, rein auf den Werten:
//   { art: "nicht" | "leser" | "auge", n, fehlt, wo?, mass? }.
// Der Rahmen (messe) und die Messung headless lesen dasselbe. Die Schwelle steht an der Sprosse der Karte; urteil nennt nur, ob das
// Gesetz den Umfang trägt.
// habitat#1: EINE Siedlung unter der Erde, 10² Bewohner
const HABITAT_FAECHER = (saaten, ms) => ({
    gesetz: { export: "fachwerk-core.js:11165 exportSettlement (DORF :5182, BAU_NUTZUNG :2686)", leser: "stamm/siedlung-ort.js:308" },
    adressen: { saaten },
    masse: {
        orte: { wie: "anzahl" }, leuteUnter: { wie: "summe", feld: "leuteUnter" }, wohnUnter: { wie: "summe", feld: "wohnUnter" },
        tiefM: { wie: "min", feld: "tiefM" }, keller: { wie: "summe", feld: "keller" }, slots: { wie: "summe", feld: "n" },
        leuteMax: { wie: "max", feld: "leute" }, unterGrade: { wie: (v) => [...new Set(v.flat())].sort(), feld: "unterGrade" },
    },
    schlecht: { feld: "tiefM", richtung: "min" },
    pose: (a, w) => "der tiefste Raum des Gesetzes: der Keller " + -w.tiefM + " m unter dem Grund in " + w.name + " (Saat " + a.saat + ")",
    ungemessen: ["Lebenslinien Luft, Wasser, Licht im Bild und der Gegenlauf Schacht verstopft: kein Trakt, kein Schacht im Gesetz"],
    ms,
    urteil: (R) => {
        const w = R.werte;
        return {
            art: "nicht",
            n: w.leuteUnter,
            fehlt: "EINE Siedlung unter der Erde mit 10² Bewohnern: an " + w.orte + " Orten (" + w.slots + " Lose) wohnen " + w.leuteUnter + " unter dem Grund; unter Grade nur der Keller (" + w.keller +
                " Lose, bis " + w.tiefM + " m, fachwerk-core.js:236) mit " + w.unterGrade.join("/") + ", kein Wohnraum (BAU_NUTZUNG.raeume :2686), jedes Los auf dem Grund (DORF :5218)",
        };
    },
});
// groesse#1: Weiler, 10 Gebäude — im Bild ≥ 10 Häuser, Zwillinge im Bild 0
const WEILER_FAECHER = (saaten, ms) => ({
    gesetz: { export: "fachwerk-core.js:11165 exportSettlement (DORF :5182, Stufe 0 siedlungsGroesse :4476)", leser: "stamm/siedlung-ort.js:308" },
    adressen: { saaten },
    masse: {
        orte: { wie: "anzahl" }, nMin: { wie: "min", feld: "n" }, nMax: { wie: "max", feld: "n" },
        mitZehn: { wie: (v) => v.filter((x) => x >= 10).length, feld: "n" },
        zwillinge: { wie: "summe", feld: "zwillinge" }, mitZwilling: { wie: (v) => v.filter((x) => x > 0).length, feld: "zwillinge" },
        zehnOhne: { wie: (v, aus) => aus.filter((x) => x.w.n >= 10 && !x.w.zwillinge).length },
        paar: { wie: "erste", feld: "paar" },
    },
    schlecht: { feld: "zwillinge", richtung: "max" },
    pose: (a, w) => "Ortsrand von " + w.name + " (Saat " + a.saat + ", " + w.nH + " Lose, " + w.n + " Gebäude, " + w.zwillinge + " Form-Zwillinge: " + (w.paar || "keine") + ")",
    ungemessen: ["das Panel-2AFC Straßenbild gegen das Foto eines Weilers: ungemessen bis zum Gerät; das Bild der schlechtesten Saat braucht ihren Ort in der warmen Welt"],
    ms,
    urteil: (R) => {
        const w = R.werte;
        const zahl = w.orte + " Weiler der Stufe 0: " + w.nMin + "–" + w.nMax + " Gebäude, " + w.mitZehn + " mit ≥ 10, " + w.zehnOhne + " davon ohne Zwilling; Form-Zwillinge an " + w.mitZwilling + " Orten (" + w.zwillinge + " Gebäude)";
        if (w.mitZwilling || !w.mitZehn)
            return {
                art: "nicht",
                n: w.zehnOhne,
                fehlt: "Weiler ohne Form-Zwillinge: an " + w.mitZwilling + " von " + w.orte + " Weilern der Stufe 0 (" + w.nMin + "–" + w.nMax + " Gebäude) stehen Zwillinge, " + w.zwillinge +
                    " Gebäude; die Klemmen fachwerk-core.js:5221 (Breite 5–15 m) und :5259–5261 (Scheune 4–7 m, ≥ 28°); ≥ 10 ohne Zwilling an " + w.zehnOhne + " · zuerst " + w.paar,
            };
        return { art: "auge", n: w.zehnOhne, mass: zahl };
    },
});
// vertikal#2: Türme 30 Geschosse, höchstes Gebäude ≥ 100 m
// Band: CTBUH Height Calculator, je Geschoss 3,1 m (Wohnen) bis 3,9 m (Büro), 30 Geschosse ≈ 100–135 m (der Turm des Kerns: 23 Geschosse, 70,9 m)
const TURM_FAECHER = (saaten, epochen, ms) => ({
    gesetz: { export: "fachwerk-core.js:11165 exportSettlement (DOWNTOWN :5235, BAU_NUTZUNG.turm :2711) + :4908 planMassen", leser: "stamm/siedlung-wege.js:2056" },
    adressen: { saaten, zeiten: epochen },
    masse: {
        orte: { wie: "anzahl" }, geschosse: { wie: "max", feld: "geschosse" }, hoeheM: { wie: "max", feld: "hoeheM" },
        jeEpoche: { wie: (v, aus) => {
            const o = {};
            for (const x of aus) o[x.a.zeit] = Math.max(o[x.a.zeit] || 0, x.w.geschosse);
            return o;
        } },
    },
    schlecht: { feld: "hoeheM", richtung: "max" },
    pose: (a, w) => "das höchste Gebäude des Fächers: " + w.hoch.rolle + " mit " + w.hoch.geschosse + " Geschossen, " + w.hoch.m + " m in " + w.name + " (Saat " + a.saat + ", " + a.zeit + "), aus 5 km",
    ungemessen: ["die Silhouette aus 5 km im Bild: ungemessen bis zum Gerät"],
    ms,
    urteil: (R) => {
        const w = R.werte;
        return {
            art: "nicht",
            n: w.geschosse,
            fehlt: "Türme mit 30 Geschossen: an " + w.orte + " Orten (Saaten × Epochen) trägt der höchste Turm " + w.geschosse + " Geschosse, das höchste Gebäude " + w.hoeheM +
                " m; das Gesetz deckelt den Turm bei 8–23 Geschossen (BAU_NUTZUNG.turm fachwerk-core.js:2711, DOWNTOWN :5235) · je Epoche " + Object.keys(w.jeEpoche).map((k) => k + " " + w.jeEpoche[k]).join(", "),
        };
    },
});
// breite#1: 1 Familie, 6 Regionen — die Regionen des Gesetzes und ihre eigene Gestalt (Bauweisen, die keine andere Region trägt)
const REGION_FAECHER = (saaten, ms) => ({
    gesetz: { export: "fachwerk-core.js:11165 exportSettlement (DORF :5182, REGION_HIST :4259, EPOCHEN :4272)", leser: "stamm/siedlung-ort.js:308" },
    adressen: { saaten },
    masse: {
        orte: { wie: "anzahl" },
        je: { wie: (v, aus) => {
            const o = {};
            for (const x of aus) {
                const q = (o[x.w.region] = o[x.w.region] || { orte: 0, kulturen: [] });
                q.orte++;
                q.kulturen = [...new Set(q.kulturen.concat(x.w.kulturen))].sort();
            }
            for (const k in o) o[k].eigen = o[k].kulturen.filter((c) => !Object.keys(o).some((j) => j !== k && o[j].kulturen.includes(c)));
            return o;
        } },
    },
    schlecht: { feld: "kulturen.length", richtung: "min" },
    pose: (a, w) => "der Platz von " + w.name + " (Saat " + a.saat + ", " + w.region + ", " + w.jahr + "): die Stadt mit den wenigsten Bauweisen (" + w.kulturen.join(", ") + ")",
    ungemessen: ["die Region aus dem Stadtbild erkannt (Panel, ≥ 50 % aus 6): ungemessen bis zum Gerät; das Bild der schlechtesten Saat braucht ihren Ort in der warmen Welt"],
    ms,
    urteil: (R) => {
        const je = R.werte.je, reg = Object.keys(je), eigen = reg.filter((k) => je[k].eigen.length);
        const zahl = R.werte.orte + " Orte, " + reg.length + " Regionen, " + eigen.length + " mit eigener Bauweise (" + reg.map((k) => k + " " + je[k].orte + " Orte/" + je[k].eigen.length + " eigen").join(", ") + ")";
        if (reg.length < 6 || eigen.length < 6) return { art: "nicht", n: eigen.length, fehlt: "6 Regionen einer Familie mit eigener Gestalt. " + zahl };
        return { art: "auge", n: eigen.length, mass: zahl };
    },
});
// messlatte#1: EINE Straße, 100 m, Tag — trägt der Plan der Orte (Stufe 1) 100 m Straße, und was steht an ihr
const STRASSE_FAECHER = (saaten, ms) => ({
    gesetz: { export: "fachwerk-core.js:11165 exportSettlement (dorfLayout roads, BAU_NUTZUNG :2686)", leser: "stamm/siedlung-ort.js:308" },
    adressen: { saaten, dazu: [{ saat: null, ort: "welt", zeit: null }] },
    mit: { stufe: 1, strasseM: 100 },
    masse: {
        welt: { wie: "erste", feld: "strasse", nur: (a) => a.ort === "welt" },
        orte: { wie: "anzahl" }, mitHundert: { wie: (v) => v.filter((x) => x >= 100).length, feld: "strasse.gasseM" },
        fassadenMin: { wie: "min", feld: "strasse.fassaden" }, fassadenMax: { wie: "max", feld: "strasse.fassaden" },
        laedenMin: { wie: "min", feld: "strasse.laeden" }, laedenMax: { wie: "max", feld: "strasse.laeden" }, leuteMin: { wie: "min", feld: "strasse.leute" },
    },
    schlecht: { feld: "strasse.fassaden", richtung: "min" },
    pose: (a, w) => "die längste Straße (Zug der Gassen) von " + w.name + " (Saat " + a.saat + ", " + w.nH + " Lose): Auge 1,7 m am Anfang, Blick längs der ersten " + w.strasse.laengeM + " m, Mittag",
    ungemessen: ["Menschen draußen und Wagen an der Straße: der Tagesplan und der Verkehr leben nur in der warmen Welt (an der Adresse „welt“ gezählt)", "das Blindpaar gegen den Vergleichstitel und dessen vier Zählungen: ungemessen bis zum Gerät"],
    ms,
    urteil: (R) => {
        const w = R.werte;
        const zahl = w.orte + " Orte (Stufe 1" + (w.welt ? " und der Ort der Sitzung" : "") + "), " + w.mitHundert + " mit einer Straße ≥ 100 m (Zug der Gassen, Knick ≤ 35°); an ihren ersten 100 m Fassaden " + w.fassadenMin + "–" + w.fassadenMax + ", Läden " + w.laedenMin + "–" + w.laedenMax + ", Bewohner der Fassaden ≥ " + w.leuteMin;
        if (!w.mitHundert) return { art: "nicht", n: 0, fehlt: "EINE Straße von 100 m. " + zahl };
        return { art: "auge", n: w.mitHundert, mass: zahl };
    },
});
// siedlungsnetz#2: Land 10³ km — 10 × 10 Fenster zu 16 × 16 Zellen (4 km, der Block der obersten Rang-Stufe) im Raster von 100 km
const LAND_FAECHER = (saaten, ms) => ({
    gesetz: { export: "fachwerk-core.js:4505 siedlungsZelle (SIEDLUNG.rang :4450, GROESSE_WAND :4458)", leser: "stamm/siedlung-ort.js:1444" },
    adressen: { saaten: saaten.concat([null]), orte: Array.from({ length: 100 }, (_, i) => [(i % 10) * 100, Math.floor(i / 10) * 100]) },
    mit: { zellen: 16 },
    masse: {
        fenster: { wie: "anzahl" }, welten: { wie: "verschieden", feld: "welt" }, mitOrt: { wie: (v) => v.filter((x) => x > 0).length, feld: "orte" },
        orte: { wie: "summe", feld: "orte" }, staedte: { wie: "summe", feld: "staedte" }, nMax: { wie: "max", feld: "nMax" },
        geladen: { wie: (v, aus) => aus.filter((x) => x.w.welt === "geladen").reduce((s, x) => s + x.w.orte, 0) }, sichtM: { wie: "max", feld: "sichtM" },
    },
    schlecht: { feld: "orte", richtung: "min" },
    pose: (a, w) => "100 km über dem Fenster bei " + w.km.join("/") + " km der Welt " + w.welt + " (" + w.orte + " Orte), Nacht",
    ungemessen: ["das Nachtbild aus 100 km gegen das Satellitenbild eines Landes: ungemessen bis zum Gerät"],
    ms,
    urteil: (R) => {
        const w = R.werte;
        return {
            art: "leser",
            n: w.orte,
            fehlt: "das Land aus 100 km bei Nacht: die Welt weckt Orte nur binnen " + (w.sichtM || "260 + 160") + " m um den Spieler, die Ferne baut nur Wort-Städte (stamm/siedlung-wege.js:2025). Das Rang-Gesetz trägt " +
                w.orte + " Orte, " + w.staedte + " Städte bis " + w.nMax + " Häuser in " + w.mitOrt + " von " + w.fenster + " Fenstern zu 4 km über 1 000 km (" + w.welten + " Welten)",
            wo: "stamm/siedlung-ort.js:3711",
        };
    },
});

const PFAD = ["stamm/siedlung-*.js", "stamm/gelaende-kollision.js", "stamm/gelaende-boden.js", "fachwerk-core.js", "spec/profiband/haushalt.json", "scripts/lib/stadt-proben.cjs"];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ═════ mensch.stadt.groesse — Größe einer zusammenhängenden Stadt ═════
    // stadt-voll (S2–S8: die Häuser, die stehen, und das Bild am Markt), dann dorf (S1: der Weiler vom Ortsrand — die niedrigste
    // Sprosse, dort endet die Probe)
    F.leiter("mensch.stadt.groesse", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        seite: { STADT, FAECHER, ORT_AN, ZELL_SAATEN, WEILER_FAECHER },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = async (o) => {
                try {
                    return await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify(o) + ");");
                } catch (e) {
                    return { fehler: String((e && e.message) || e).slice(0, 200) };
                }
            };
            const da = (W) => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            const W = await welt({ blick: true, sichtM: 300 });
            H.zeile("stadt-voll: " + (W && !W.fehler ? W.ort.name + " · " + W.steht + "/" + W.slots + " Häuser stehen · im Blick " + W.blick.n : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => {
                da(W);
                const b = await K.bild(2, W.blick.pose, { wahl: 0, uhr: 0.5 });
                K.auge(2, {
                    bild: b.datei,
                    pose: "stadt-voll, Kamera des Spiels an der ortPose platz " + JSON.stringify(W.blick.pose) + ", Mittag",
                    mass: "im Blick gezählt " + W.blick.n + " Häuser (Soll ≥ 100) · stehend " + W.steht + " von " + W.slots + " · Form-Zwillinge im Blick " + W.blick.zwillinge + " · Gassen " + W.strassen + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
            const gross = [
                [3, 1e3, "Kleinstadt 10³ Häuser"],
                [4, 1e4, "Großstadt 10⁴ Häuser"],
                [5, 1e5, "Metropole 10⁵ Häuser, 10⁶ Bewohner"],
                [6, 1e6, "Megastadt 10⁶ Häuser, 10⁷ Bewohner, ~2 000 km²"],
                [7, 1e7, "Tokio-Maß 10⁷ Häuser, 3,7·10⁷ Bewohner"],
                [8, 1e8, "≥ 10⁸ Häuser in EINER Bebauung"],
            ];
            for (const [n, soll, wort] of gross)
                await K.schritt(n, async () => {
                    da(W);
                    nicht(n, W.steht, soll, wort + ": die größte Stadt der Sitzung trägt " + W.steht + " stehende Häuser und " + W.bewohner.n + " Bewohner" + (n <= 4 ? "; dorf 7 9310 (9 639 Häuser, nur der Kern aus 3 × 3 Kacheln begehbar) steht erst nach ~154 s, über dem Deckel von 60 s" : ""));
                });
            // S1: der Weiler am FÄCHER des Gesetzes (stationen/faecher.js): 20 Zell-Samen der Stufe 0, je Adresse ein Ruf von fachwerk
            // exportSettlement, wie der Wirt ihn ruft (stamm/siedlung-ort.js:308). Trägt eine Adresse Form-Zwillinge oder keine ≥ 10
            // Gebäude, urteilt der Fächer „Umfang nicht erzeugbar“ an der schlechtesten Adresse. Sonst rechnet er die Zahl-Hälfte, und
            // das Bild kommt vom Ortsrand des Messorts dorf (Zelle −4,−4): der Fächer nennt den Ort, den das Panel sehen müsste
            await K.schritt(1, async () => {
                const f = H.seite.WEILER_FAECHER(H.seite.ZELL_SAATEN(20), Math.max(3000, Math.min(20000, Math.floor((H.rest() - 25) * 1000))));
                f.gesetz.fn = H.seite.ORT_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Weiler S1: " + R.akte.slice(0, 400));
                if (R.fehlt || !R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (U.art === "nicht") return K.nicht(1, { n: U.n, fehlt: U.fehlt });
                try {
                    await K.messort("dorf");
                } catch (e) {
                    throw new Error("der Messort dorf: " + String((e && e.message) || e).slice(0, 200));
                }
                const D = da(await welt({ rand: true }));
                const b = await K.bild(1, D.rand.pose, { wahl: 0, uhr: 0.5 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "dorf (Zelle −4,−4), Ortsrand " + D.rand.richtungGrad + "°: 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte " + JSON.stringify(D.rand.pose) + ", Mittag",
                    mass: "am Fächer: " + U.mass + " · im Bild gezählt " + D.rand.n + " Häuser (Soll ≥ 10) · Form-Zwillinge im Bild " + D.rand.zwillinge + " (Soll 0)" + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        },
        sprossen: {
            1: {
                auge: { pose: "dorf (Zelle −4,−4): Ortsrand in der Richtung mit den meisten freien Häusern (von 8), 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte, Mittag", vorbild: "Foto eines realen Weilers (~10 Gebäude) vom Ortsrand: Panel-2AFC ≤ 90 %, Zwillinge im Bild 0" },
                erwartet: "nicht",
                fehlt: "Weiler ohne Form-Zwillinge: an 9 von 20 Weilern der Stufe 0 stehen Zwillinge (die Klemmen fachwerk-core.js:5221 und :5259–5261)",
            },
            2: { auge: { pose: "stadt-voll: die Kamera des Spiels an der ortPose platz (Markt im Gedränge), Mittag", vorbild: "Straßen- und Luftbild einer realen Marktstadt (10² Gebäude: Platz, Kirche, Markt, Mauer): 2AFC ≤ 85 %" } },
            3: { auge: { pose: "Anflug über die Kleinstadt", vorbild: "Anflug-Bild einer realen Kleinstadt (10³ Gebäude): 2AFC ≤ 80 %" }, erwartet: "nicht", fehlt: "Kleinstadt 10³ Häuser in der warmen Welt" },
            4: { auge: { pose: "20 Stichflächen der Großstadt", vorbild: "Luft- und Straßenbild einer realen Großstadt (10⁴ Gebäude): 2AFC ≤ 75 %" }, erwartet: "nicht", fehlt: "Großstadt 10⁴ Häuser in der warmen Welt" },
            5: { auge: { pose: "Skyline aus 20 km und Straße", vorbild: "Skyline und Straße realer Metropolen (10⁵ Gebäude): 2AFC ≤ 70 %" }, erwartet: "nicht", fehlt: "Metropole 10⁵ Häuser, 10⁶ Bewohner" },
            6: { auge: { pose: "Luftbild bis zum Horizont", vorbild: "Luftbild einer realen Megastadt (10⁶ Gebäude, ~2 000 km²): 2AFC ≤ 65 %" }, erwartet: "nicht", fehlt: "Megastadt 10⁶ Häuser" },
            7: { auge: { pose: "1 000 Straßenbilder", vorbild: "Straßenfotos von Tokio: 2AFC ≤ 60 %, Zwillinge ≤ 1 %" }, erwartet: "nicht", fehlt: "Tokio-Maß 10⁷ Häuser" },
            8: {
                umfang: { soll: 1e8, wort: "Gebäude in EINER Bebauung" },
                masse: [
                    { key: "tuerRaum", wort: "gewählte Gebäude mit Tür in einen Raum", soll: 0.99, richtung: "≥" },
                    { key: "zwillinge", wort: "Zwillinge", soll: 0.001, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "≥ 10⁸ Häuser in einer Bebauung",
            },
        },
        proben: {
            1: [
                { name: "TÄTER am Kern (Fächer, 20 Zell-Samen headless): Form-Zwillinge an 9 von 20 Weilern, zuerst 5 gleiche Scheunen in Portanum", j: { leiter: "mensch.stadt.groesse", adapter: KARTE, sprossen: { 1: { art: "nicht", n: 11, fehlt: "Weiler ohne Form-Zwillinge: an 9 von 20 Weilern der Stufe 0 (9–23 Gebäude) stehen Zwillinge, 23 Gebäude; die Klemmen fachwerk-core.js:5221 (Breite 5–15 m) und :5259–5261 (Scheune 4–7 m, ≥ 28°); ≥ 10 ohne Zwilling an 11" } } }, gruen: false, zahl: /Umfang nicht erzeugbar: Weiler ohne Form-Zwillinge: an 9 von 20 Weilern .*fachwerk-core\.js:5221/ },
            ],
            8: [
                { name: "ATTRAPPE: 10⁸ gezählt, die Türen führen nirgends hin", j: { leiter: "mensch.stadt.groesse", adapter: KARTE, sprossen: { 8: { art: "zahl", n: 1e8, werte: { tuerRaum: 0.5, zwillinge: 0 } } } }, gruen: false, zahl: /ROT an gewählte Gebäude mit Tür in einen Raum 0\.5 / },
            ],
            2: [
                { name: "das Bild fehlt (der Schuss warf): keine Messung", j: { leiter: "mensch.stadt.groesse", adapter: KARTE, sprossen: { 2: { art: "auge", pose: "Probe", vorbild: "Probe" } } }, gruen: false, zahl: /keine Messung der Sprosse$/ },
            ],
        },
    }),

    // ═════ mensch.stadt.form — Stadtform-Wahrheit ═════
    // S1 und S3 urteilt breite.siedlung#1 (die Wand Kern ↔ Rand, der Dichte-Fit R² und der Höhen-Median Kern/Rand an dorf 7 9310 —
    // ihr Urteil verlangt alle drei); hier: die Saaten der Sitzung und der Bodenblick (S6) an der Straße nächst dem Spieler
    F.leiter("mensch.stadt.form", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        seite: { STADT },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ strasse: true, strasseM: 40 }) + ");");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (W && !W.fehler ? W.steht + " Häuser, " + W.saaten + " Saaten, " + W.strassen + " Straßen" : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => nicht(2, da().steht, 1e4, "Großstadt 10⁴ Häuser mit Vierteln aus dem Bodenwert: die Stadt trägt " + W.steht + " stehende Häuser in " + W.viertel + " Vierteln; dorf 7 9310 steht erst nach ~154 s, über dem Deckel von 60 s"));
            await K.schritt(4, async () => nicht(4, da().saaten, 100, "100 Saaten mit Plan in einer Sitzung (die Welt trägt " + W.saaten + ") und das Band 100 realer Städte (OSM) — kein Baum trägt es"));
            await K.schritt(5, async () => nicht(5, da().saaten, 100, "10² Saaten je Größenklasse als Draufsicht: die Sitzung trägt " + W.saaten + " Saaten"));
            await K.schritt(7, async () => nicht(7, da().saaten, 100, "10² Saaten, aus deren Bild Kenner Alter, Wohlstand, Klima, Gelände lesen: die Sitzung trägt " + W.saaten + " Saaten"));
            await K.schritt(6, async () => {
                const S = da().strasse;
                if (!S) throw new Error("die Stadt trägt keine Straße mit zwei Punkten");
                const b = await K.bild(6, S.pose, { wahl: 0, uhr: 0.5 });
                K.auge(6, {
                    bild: b.datei,
                    pose: "stadt-voll, Straße nächst dem Spieler (" + S.klasse + ", " + S.dSpieler + " m vom Spieler): Auge 1,7 m, Blick längs der Straße " + JSON.stringify(S.pose) + ", Mittag",
                    mass: "Straßen der Stadt " + W.strassen + " (das Bild zeigt eine) · an den ersten " + S.laengeM + " m: Fassaden " + S.fassaden + ", Gewerbe " + S.gewerbe + ", Menschen " + S.menschen + ", Wagen " + S.wagen + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        },
        sprossen: {
            2: { auge: { pose: "20 Straßenbilder der Großstadt", vorbild: "Straßenbilder realer Großstadt-Viertel: Blindtest Lage und Wohlstand ≥ 70 %" }, erwartet: "nicht", fehlt: "Großstadt 10⁴ Häuser in der warmen Welt" },
            4: {
                umfang: { soll: 100, wort: "Saaten mit Plan" },
                masse: [{ key: "imBand", wort: "Saaten mit 4 Kennzahlen im Band 100 realer Städte (OSM)", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "100 Saaten in einer Sitzung und das OSM-Band",
            },
            5: { auge: { pose: "Draufsicht je Saat", vorbild: "Satellitenbilder realer Städte je Größenklasse: Verwechslung ≥ 40 %" }, erwartet: "nicht", fehlt: "10² Saaten je Größenklasse" },
            6: { auge: { pose: "stadt-voll: der Straßenpunkt des Plans nächst dem Spieler, Auge 1,7 m über Grund, Blick längs der Straße, Mittag", vorbild: "Street-View einer realen Stadt gleicher Klasse (Pflaster, Schilder, Abnutzung, Leben): Verwechslung ≥ 40 %" } },
            7: { auge: { pose: "Luft- und Straßenbild je Saat", vorbild: "Kenner lesen Alter, Wohlstand, Klima, Gelände der Saat ≥ 70 %" }, erwartet: "nicht", fehlt: "10² Saaten" },
        },
        bestehend: { 1: "breite.siedlung#1", 3: "breite.siedlung#1" },
        proben: {
            4: [
                { name: "ATTRAPPE: 100 Saaten, nur die Hälfte im OSM-Band", j: { leiter: "mensch.stadt.form", adapter: KARTE, sprossen: { 4: { art: "zahl", n: 100, werte: { imBand: 0.5 } } } }, gruen: false, zahl: /ROT an Saaten mit 4 Kennzahlen im Band 100 realer Städte \(OSM\) 0\.5 / },
            ],
        },
    }),

    // ═════ mensch.stadt.vertikal — Vertikale Stadt ═════
    // hochhaus-dach (die Metropole der Moderne): das höchste Gebäude (Hülle über Grund, Geschosse), die Ebenen nach der Regel von S1,
    // die Bewohner je Hektar und die Dekaden ihrer Höhe
    F.leiter("mensch.stadt.vertikal", {
        sek: 45,
        pfad: PFAD,
        seite: { STADT, FAECHER, ORT_AN, ZELL_SAATEN, TURM_FAECHER },
        messe: async (H, K) => {
            await K.messort("hochhaus-dach");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ hoch: true, ueber: true }) + ");");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                if (!W.hoch || W.hoch.m == null) throw new Error("kein Gebäude mit Hülle binnen 1500 m");
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("hochhaus-dach: " + (W && !W.fehler ? "höchstes Gebäude " + (W.hoch && W.hoch.m) + " m, " + (W.hoch && W.hoch.geschosseMax) + " Geschosse, Überführungen " + W.ueber : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(3, async () => nicht(3, da().hoch.m, 400, "Supertall ≥ 400 m: das höchste Gebäude der Sitzung misst " + W.hoch.m + " m über Grund"));
            await K.schritt(4, async () => nicht(4, da().ebenen, 2, "2 begehbare Ebenen (Brücken, Unterführung, U-Bahn): " + W.ueber + " Überführungen der Straßen (die Regel von vertikal S1), " + W.bewohner.unterGrund + " Bewohner unter dem Grund"));
            await K.schritt(5, async () => nicht(5, da().bewohner.proHaMax, 1e4, "≥ 5 Schichten und 10 000 Bewohner je ha (Kowloon): die Stadt trägt höchstens " + W.bewohner.proHaMax + " Bewohner je ha auf " + W.ebenen + " Ebene"));
            await K.schritt(6, async () => nicht(6, da().hoch.m, 1000, "Arkologie ≥ 1 km mit 10⁶ Bewohnern: das höchste Gebäude misst " + W.hoch.m + " m, die Stadt trägt " + W.bewohner.n + " Bewohner"));
            await K.schritt(7, async () => nicht(7, da().ebenen, 10, "≥ 10 durchgehend begehbare Schichten über ≥ 100 km²: die Stadt trägt " + W.ebenen + " Ebene auf " + W.flaecheKm2 + " km²"));
            await K.schritt(8, async () => nicht(8, da().bewohner.dekaden, 5, "Bewohner auf ≥ 5 Höhen-Dekaden (Meeresboden bis Orbit): die " + W.bewohner.mitLeib + " Bewohner mit Leib stehen auf " + W.bewohner.dekaden + " Dekaden über Grund"));
            // S2 am FÄCHER des Gesetzes: 10 Zell-Samen × jede Epoche des Kerns (fachwerk EPOCHEN), je Adresse ein Ruf von exportSettlement
            // und die Massen, die das Spiel liest (planMassen, Leser stamm/siedlung-wege.js:2056): der höchste Turm und das höchste Gebäude
            await K.schritt(2, async () => {
                const epochen = await K.welt("return Object.keys((globalThis.__fachwerkCore && globalThis.__fachwerkCore.EPOCHEN) || {});");
                if (!Array.isArray(epochen) || !epochen.length) throw new Error("der Kern trägt keine Epochen (fachwerk EPOCHEN)");
                const f = H.seite.TURM_FAECHER(H.seite.ZELL_SAATEN(10), epochen, Math.max(3000, Math.floor((H.rest() - 4) * 1000)));
                f.gesetz.fn = H.seite.ORT_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Türme S2: " + R.akte.slice(0, 400));
                if (R.fehlt || !R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (!(U.n < 30)) throw new Error("Umfang erreicht (" + U.n + " Geschosse ≥ 30), die Messung der Sprosse ist nicht gebaut");
                K.nicht(2, { n: U.n, fehlt: U.fehlt });
            });
        },
        sprossen: {
            2: { umfang: { soll: 30, wort: "Geschosse des höchsten Turms" }, masse: [{ key: "hoeheM", wort: "höchstes Gebäude m", soll: 100, richtung: "≥" }], erwartet: "nicht", fehlt: "Türme mit 30 Geschossen: das Gesetz deckelt den Turm bei 8–23 Geschossen (BAU_NUTZUNG.turm fachwerk-core.js:2711)" },
            3: { umfang: { soll: 400, wort: "m Höhe (Supertall)" }, masse: [{ key: "unruhe", wort: "Pixel-Unruhe im Anflug 10 km bis zum Fuß", soll: 0.01, richtung: "≤" }], erwartet: "nicht", fehlt: "ein Gebäude ≥ 400 m" },
            4: { umfang: { soll: 2, wort: "begehbare Ebenen" }, masse: [{ key: "ebenenBewohnt", wort: "Ebenen mit Bewohnern", soll: 2, richtung: "≥" }], erwartet: "nicht", fehlt: "eine zweite begehbare Ebene" },
            5: { auge: { pose: "Gang zwischen den Türmen", vorbild: "Fotos der Kowloon Walled City (Gänge, Höfe, Licht von oben): Bildpaar-2AFC ≤ 70 %" }, erwartet: "nicht", fehlt: "≥ 5 Schichten, 10 000 Bewohner je ha" },
            6: { umfang: { soll: 1000, wort: "m Höhe der Struktur (Arkologie)" }, masse: [{ key: "bewohner", wort: "Bewohner der Struktur", soll: 1e6, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Struktur ≥ 1 km" },
            7: { umfang: { soll: 10, wort: "durchgehend begehbare Schichten" }, masse: [{ key: "flaecheKm2", wort: "Fläche der Stadtschalen km²", soll: 100, richtung: "≥" }], erwartet: "nicht", fehlt: "10 Schichten" },
            8: { umfang: { soll: 5, wort: "Höhen-Dekaden mit Bewohnern" }, masse: [{ key: "ohneLadeschirm", wort: "Straße → Orbit ohne Ladeschirm (1 = ja)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "Bewohner auf 5 Höhen-Dekaden" },
        },
        bestehend: { 1: "karte2.mensch.stadt.vertikal#1" },
        proben: {
            2: [
                { name: "ATTRAPPE: 30 Geschosse gezählt, der Turm nur 90 m hoch", j: { leiter: "mensch.stadt.vertikal", adapter: KARTE, sprossen: { 2: { art: "zahl", n: 30, werte: { hoeheM: 90 } } } }, gruen: false, zahl: /ROT an höchstes Gebäude m 90 / },
                { name: "TÄTER am Kern (Fächer, 10 Zell-Samen × 9 Epochen headless): der höchste Turm 23 Geschosse, 70,9 m", j: { leiter: "mensch.stadt.vertikal", adapter: KARTE, sprossen: { 2: { art: "nicht", n: 23, fehlt: "Türme mit 30 Geschossen: an 90 Orten (Saaten × Epochen) trägt der höchste Turm 23 Geschosse, das höchste Gebäude 70.9 m; das Gesetz deckelt den Turm bei 8–23 Geschossen (BAU_NUTZUNG.turm fachwerk-core.js:2711, DOWNTOWN :5235)" } } }, gruen: false, zahl: /Umfang nicht erzeugbar: Türme mit 30 Geschossen: .*23 Geschosse.*\(gemessen 23, Soll 30 / },
            ],
        },
    }),

    // ═════ mensch.stadt.breite — Stadtgestalt aus Ursache ═════
    // stadt-voll: die Regionen, Kerne, Kultur × Jahrhundert, Jahre und Bauenden der Pläne der Sitzung; das Bild am Markt (S1, die
    // niedrigste Sprosse, zuletzt)
    F.leiter("mensch.stadt.breite", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        seite: { STADT, FAECHER, ORT_AN, ZELL_SAATEN, REGION_FAECHER },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ blick: true, sichtM: 300 }) + ");");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (W && !W.fehler ? "Region " + W.ort.region + " · Regionen " + W.regionen.join(",") + " · Kerne " + W.kerne.join(",") + " · Jahr bis " + W.jahrMax : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => nicht(2, da().kerne.length, 10, "10 Netzformen aus Ursache (organisch, Raster, radial, Wasser, Terrasse, Burg) an 50 Saaten: die Sitzung trägt " + W.kerne.length + " Kernform(en) (" + W.kerne.join(", ") + ") in " + W.saaten + " Saaten"));
            await K.schritt(3, async () => nicht(3, da().regionen.length, 6, "Kulturräume aller Kontinente: die Sitzung trägt " + W.regionen.length + " Region(en) (" + W.regionen.join(", ") + "); das Gesetz kennt 6 (mitteleuropa, alpin, mediterran, nordisch, fernost, antik — fachwerk-core.js:3609), Afrika, Amerika, Süd- und Westasien, Ozeanien fehlen"));
            await K.schritt(4, async () => nicht(4, da().kulturEpoche, 100, "10² Kultur × Epoche an 100 Saaten: die Sitzung trägt " + W.kulturEpoche + " Paare Region × Jahrhundert"));
            await K.schritt(5, async () => nicht(5, da().jahrMax, 2100, "Zukunft 2100–3000 an 100 Zukunfts-Städten: das jüngste Jahr eines Plans der Sitzung ist " + W.jahrMax));
            await K.schritt(6, async () => nicht(6, da().fremde, 1, "fremde Bauende an 100 Saaten: jede der " + W.siedlungen + " Siedlungen der Sitzung bauen Menschen (jeder Bewohner mit humanoidem Genom), fremde " + W.fremde));
            await K.schritt(7, async () => nicht(7, da().saaten, 1e4, "≥ 10⁴ unterscheidbare Stadtformen an 10 000 Saaten: die Sitzung trägt " + W.saaten + " Saaten"));
            // S1 am FÄCHER des Gesetzes: 30 Zell-Samen, je Adresse ein Ruf von fachwerk exportSettlement (Leser stamm/siedlung-ort.js:308).
            // Gezählt: die Regionen der Familie und je Region die Bauweisen, die keine andere trägt. Fehlt eine, urteilt der Fächer „Umfang
            // nicht erzeugbar“. Sonst trägt das Bild am Markt der Stadt die Zahl-Hälfte des Fächers ans Panel
            await K.schritt(1, async () => {
                const f = H.seite.REGION_FAECHER(H.seite.ZELL_SAATEN(30), Math.max(3000, Math.min(20000, Math.floor((H.rest() - 15) * 1000))));
                f.gesetz.fn = H.seite.ORT_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Regionen S1: " + R.akte.slice(0, 400));
                if (R.fehlt || !R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (U.art === "nicht") return K.nicht(1, { n: U.n, fehlt: U.fehlt });
                da();
                const b = await K.bild(1, W.blick.pose, { wahl: 0, uhr: 0.5 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll (" + W.ort.region + ", " + W.ort.jahr + "), Kamera des Spiels an der ortPose platz " + JSON.stringify(W.blick.pose) + ", Mittag",
                    mass: "am Fächer: " + U.mass + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll: die Kamera des Spiels an der ortPose platz (Markt), Mittag", vorbild: "Fotos realer Altstädte der 6 Regionen der Familie (Mitteleuropa, Alpen, Mittelmeer, Norden, Fernost, Antike): Region erkannt ≥ 50 %" } },
            2: { auge: { pose: "Luft- und Straßenbild je Saat", vorbild: "reale Städte je Netzform (organisch, Raster, radial, Wasser, Terrasse, Burg): Kenner nennen die Ursache ≥ 70 %" }, erwartet: "nicht", fehlt: "10 Netzformen aus Ursache" },
            3: { auge: { pose: "Straßenbild je Kulturraum", vorbild: "Fotos von 20 Referenz-Altstädten aller Kontinente: glaubhaft ≥ 70 %, Klimazone erkannt ≥ 60 %" }, erwartet: "nicht", fehlt: "Kulturräume aller Kontinente" },
            4: { auge: { pose: "Straßenbild je Kultur × Epoche", vorbild: "Fotos des Kulturraums: 2AFC ≤ 80 %, paarweise unterscheidbar ≥ 90 %" }, erwartet: "nicht", fehlt: "10² Kultur × Epoche" },
            5: { auge: { pose: "Stadtbild je Zukunfts-Stadt", vorbild: "Fremdwelt-Probe (R10, eingefrorener Leser): Ursache gelesen Rang ≥ 0,7, Gegenlauf Technik getauscht ≥ 80 %" }, erwartet: "nicht", fehlt: "Städte der Jahre 2100–3000" },
            6: { auge: { pose: "Stadtbild je fremder Saat", vorbild: "Fremdwelt-Probe (R10): Körperbau der Bauenden aus dem Stadtbild, Rang ≥ 0,7" }, erwartet: "nicht", fehlt: "fremde Bauende" },
            7: { auge: { pose: "Stadtbild je Saat", vorbild: "≥ 1 000 Cluster im Wahrnehmungsraum; Erd-nahe 2AFC gegen Stadtfotos ≤ 75 %, übrige Fremdwelt-Probe (R10)" }, erwartet: "nicht", fehlt: "10⁴ Stadtformen" },
        },
        proben: {
            1: [
                { name: "das Bild fehlt (der Schuss warf): keine Messung", j: { leiter: "mensch.stadt.breite", adapter: KARTE, sprossen: { 1: { art: "auge", pose: "Probe", vorbild: "Probe" } } }, gruen: false, zahl: /keine Messung der Sprosse$/ },
            ],
        },
    }),

    // ═════ mensch.stadt.siedlungsnetz — Siedlungsnetz ═════
    // stadt-voll: das Rang-Gesetz über 32 × 32 km um den Spieler (derselbe Leser wie S1, siedlung.K2), die Bewohner und die Sichtweite
    // der Orte der Sitzung
    F.leiter("mensch.stadt.siedlungsnetz", {
        sek: 45,
        pfad: PFAD,
        seite: { LAND, FAECHER, NETZ_AN, LAND_FAECHER },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let L;
            try {
                L = await K.welt("return await (" + H.seite.LAND + ")(r, T, " + JSON.stringify({ seiteKm: 32, budgetMs: Math.max(3000, Math.floor((H.rest() - 12) * 1000)) }) + ");", Math.max(10, H.rest() - 4) * 1000);
            } catch (e) {
                L = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!L || L.fehler) throw new Error("das Land: " + ((L && L.fehler) || "ohne Antwort"));
                return L;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("Land: " + (L && !L.fehler ? L.zellen + " Zellen (" + L.seiteKm + " km" + (L.voll ? "" : ", an der Frist") + "), " + L.orte + " Orte, " + L.staedte + " Städte, " + L.dekaden + " Dekaden" : (L && L.fehler) || "ohne Antwort"));
            await K.schritt(3, async () => {
                if (!da().voll) throw new Error("das Rang-Gesetz endete an der Frist (" + L.zellen + " Zellen)");
                nicht(3, L.staedte, 1e4, "10⁴ Städte, Zipf über 4 Dekaden: in " + L.seiteKm + " × " + L.seiteKm + " km stehen " + L.staedte + " Städte der Rang-Stufe 2, die Größen spannen " + L.dekaden + " Dekaden (bis " + L.groesseMax + " Häuser; das Gesetz deckelt die Stadt bei 500, fachwerk-core.js:3682); 100 Landungen ≤ 5 s fehlen (Ankunft kalt 16,6 s, Pflicht B)");
            });
            await K.schritt(4, async () => nicht(4, da().bewohner, 8e9, "Planet mit 10⁶ Siedlungen und 8·10⁹ Bewohnern im Orbitbild bei Nacht: die Sitzung trägt " + L.bewohner + " Bewohner in " + L.siedlungen + " Siedlungen"));
            await K.schritt(5, async () => {
                if (!da().voll) throw new Error("das Rang-Gesetz endete an der Frist (" + L.zellen + " Zellen)");
                nicht(5, L.bewohner, 1e11, "Ökumenopolis ≥ 10¹¹: die Sitzung trägt " + L.bewohner + " Bewohner; das Rang-Gesetz besetzt " + L.bebaut + " der Zellen (Soll Horizont ≥ 0,95 bebaut)");
            });
            await K.schritt(6, async () => nicht(6, da().welten, 100, "10² Planeten-Saaten im Orbitbild: die Sitzung trägt " + L.welten + " Welt"));
            // S2 am FÄCHER des Gesetzes: das Rang-Gesetz (fachwerk siedlungsZelle, Leser stamm/siedlung-ort.js:1444) in 10 × 10 Fenstern
            // über 1 000 km, an drei Welten des Kerns und der geladenen Welt der Sitzung. Trägt das Gesetz das Land, fehlt der Leser:
            // die Welt weckt Orte nur am Spieler (AnazhRealm.AUTO_SETTLEMENT, stamm/siedlung-ort.js:3711)
            await K.schritt(2, async () => {
                const f = H.seite.LAND_FAECHER([1, 2, 3], Math.max(3000, Math.floor((H.rest() - 4) * 1000)));
                f.gesetz.fn = H.seite.NETZ_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Land S2: " + R.akte.slice(0, 400));
                if (!R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (!(U.n > 0)) return K.nicht(2, { n: 0, fehlt: "ein Land von 10³ km: das Rang-Gesetz trägt in " + R.werte.fenster + " Fenstern keinen Ort (fachwerk-core.js:4505 siedlungsZelle)" });
                K.leser(2, { n: U.n, fehlt: U.fehlt, wo: U.wo });
            });
        },
        sprossen: {
            2: {
                auge: { pose: "100 km über dem Land, Nacht", vorbild: "Satellitenbild eines Landes bei Nacht: Verwechslung ≥ 30 %" },
                erwartet: "leser",
                fehlt: "das Land aus 100 km bei Nacht: das Rang-Gesetz trägt Orte über 1 000 km, die Welt weckt sie nur binnen 420 m um den Spieler",
                wo: "stamm/siedlung-ort.js:3711",
            },
            3: {
                umfang: { soll: 1e4, wort: "Städte (Rang-Stufe 2)" },
                masse: [
                    { key: "zeta", wort: "ζ über 4 Dekaden", von: 0.8, bis: 1.2 },
                    { key: "dekaden", wort: "Dekaden der Größen", soll: 4, richtung: "≥" },
                    { key: "landungS", wort: "100 Zufallslandungen, die längste s", soll: 5, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "10⁴ Städte über 4 Dekaden",
            },
            4: { auge: { pose: "Orbit bei Nacht", vorbild: "Black Marble (die Erde bei Nacht, NASA): plausibel ≥ 70 %" }, erwartet: "nicht", fehlt: "10⁶ Siedlungen, 8·10⁹ Bewohner" },
            5: {
                umfang: { soll: 1e11, wort: "Bewohner (Ökumenopolis)" },
                masse: [
                    { key: "horizontBebaut", wort: "Horizont bebaut", soll: 0.95, richtung: "≥" },
                    { key: "wiederholung", wort: "Wiederholung", soll: 0.001, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "10¹¹ Bewohner",
            },
            6: { auge: { pose: "Orbit je Planeten-Saat", vorbild: "Orbitbilder von 10² Planeten: paarweise unterscheidbar ≥ 90 %, plausibel ≥ 70 %" }, erwartet: "nicht", fehlt: "10² Planeten" },
        },
        bestehend: { 1: "karte2.mensch.stadt.siedlungsnetz#1" },
        proben: {
            3: [
                { name: "ATTRAPPE: 10⁴ Städte, Zipf außer Band", j: { leiter: "mensch.stadt.siedlungsnetz", adapter: KARTE, sprossen: { 3: { art: "zahl", n: 1e4, werte: { zeta: 1.5, dekaden: 4, landungS: 3 } } } }, gruen: false, zahl: /ROT an ζ über 4 Dekaden 1\.5 / },
            ],
            2: [
                { name: "TÄTER am Kern (Fächer, 3 Welten × 100 Fenster headless): 70 409 Orte im Gesetz, die Welt weckt sie nur am Spieler", j: { leiter: "mensch.stadt.siedlungsnetz", adapter: KARTE, sprossen: { 2: { art: "leser", n: 70409, fehlt: "das Land aus 100 km bei Nacht: die Welt weckt Orte nur binnen 260 + 160 m um den Spieler, die Ferne baut nur Wort-Städte (stamm/siedlung-wege.js:2025). Das Rang-Gesetz trägt 70409 Orte, 284 Städte bis 500 Häuser in 300 von 300 Fenstern zu 4 km über 1 000 km (3 Welten)", wo: "stamm/siedlung-ort.js:3711" } } }, gruen: false, zahl: /fehlender Leser: das Land aus 100 km bei Nacht: die Welt weckt Orte nur binnen .*\(stamm\/siedlung-ort\.js:3711\) · gemessen 70409/ },
            ],
        },
    }),

    // ═════ mensch.stadt.habitat — Siedeln jenseits der Oberfläche ═════
    // stadt-voll: wo die Bewohner stehen — unter dem Grund, unter dem gezeichneten Wasser, fern der Oberfläche, unter welcher Schwere
    F.leiter("mensch.stadt.habitat", {
        sek: 45,
        pfad: PFAD,
        seite: { STADT, FAECHER, ORT_AN, ZELL_SAATEN, HABITAT_FAECHER },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, {});");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (W && !W.fehler ? W.bewohner.n + " Bewohner (" + W.bewohner.mitLeib + " mit Leib), unter Grund " + W.bewohner.unterGrund + ", unter Wasser " + W.bewohner.unterWasser + ", Schwere " + W.schwere : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => nicht(2, da().bewohner.unterWasser, 1000, "Stadt unter Wasser mit 10³: " + W.bewohner.unterWasser + " Bewohner stehen mehr als 1 m unter dem gezeichneten Wasser"));
            await K.schritt(3, async () => nicht(3, da().bewohner.niedrigSchwer, 1000, "Kolonie auf Mond oder Mars mit 10³: die Welt trägt die Schwere " + W.schwere + " m/s², kein Bewohner lebt bei 1/6 oder 1/3 g"));
            await K.schritt(4, async () => nicht(4, da().bewohner.schwerelos, 1e4, "Station im freien Raum mit 10⁴: die Welt trägt die Schwere " + W.schwere + " m/s², 0 Bewohner schwerelos"));
            await K.schritt(5, async () => nicht(5, da().bewohner.fern, 1e6, "Zylinder-Habitat mit 10⁶: " + W.bewohner.fern + " Bewohner stehen mehr als 50 m über oder unter dem Grund des Planeten"));
            await K.schritt(6, async () => nicht(6, da().habitate, 1000, "Netz von 10³ Habitaten: die Sitzung trägt " + W.habitate + " Orte fern der Oberfläche unter " + W.siedlungen + " Siedlungen"));
            await K.schritt(7, async () => nicht(7, da().welten, 100, "jede Lebensform an jedem Ort jeder Welt (100 Saaten): die Sitzung trägt " + W.welten + " Welt, ihre Bewohner sind Menschen"));
            // S1 am FÄCHER des Gesetzes: 20 Zell-Samen, je Adresse ein Ruf von fachwerk exportSettlement (Leser stamm/siedlung-ort.js:308).
            // Gezählt wird, wer in einem Wohnraum unter Grade wohnt (BAU_NUTZUNG.raeume, Ebene „keller“), und wie tief das Gesetz baut
            await K.schritt(1, async () => {
                const f = H.seite.HABITAT_FAECHER(H.seite.ZELL_SAATEN(20), Math.max(3000, Math.floor((H.rest() - 4) * 1000)));
                f.gesetz.fn = H.seite.ORT_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Habitat S1: " + R.akte.slice(0, 400));
                if (R.fehlt || !R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (!(U.n < 100)) throw new Error("Umfang erreicht (" + U.n + " Bewohner unter Grade ≥ 100), die Messung der Sprosse ist nicht gebaut");
                K.nicht(1, { n: U.n, fehlt: U.fehlt });
            });
        },
        sprossen: {
            1: {
                umfang: { soll: 100, wort: "Bewohner unter der Erde" },
                masse: [
                    { key: "lebenslinien", wort: "Lebenslinien bis zur Quelle verfolgbar", soll: 3, richtung: "≥" },
                    { key: "verlassen", wort: "Gegenlauf Schacht verstopft: Anteil, der den Trakt verlässt", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "eine Siedlung unter der Erde: das Gesetz baut unter Grade nur den Keller (fachwerk-core.js:236), kein Wohnraum (BAU_NUTZUNG.raeume :2686)",
            },
            2: {
                umfang: { soll: 1000, wort: "Bewohner unter Wasser" },
                masse: [
                    { key: "schleuse", wort: "Schleuse hin und zurück ohne Ladebild (1 = ja)", soll: 1, richtung: "≥" },
                    { key: "druck", wort: "Hüllform ↔ Tiefe gegen das Druck-Gesetz, Abweichung", soll: 0.2, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "eine Stadt unter Wasser",
            },
            3: { auge: { pose: "Gang eines Bewohners", vorbild: "Film realer Mondgänge (Apollo) bei 1/6 und 1/3 g: 2AFC ≤ 75 %" }, erwartet: "nicht", fehlt: "eine Kolonie bei 1/6 oder 1/3 g" },
            4: { auge: { pose: "Bewegung eines Bewohners", vorbild: "Stations-Film der ISS (Schwerelosigkeit): 2AFC ≤ 75 %" }, erwartet: "nicht", fehlt: "eine Station ohne Schwere" },
            5: { auge: { pose: "Blick nach oben an der Innenwand", vorbild: "Rechen-Referenz eines Zylinder-Habitats (O'Neill): Bildpaar" }, erwartet: "nicht", fehlt: "ein Zylinder-Habitat" },
            6: { umfang: { soll: 1000, wort: "Habitate und Kolonien" }, masse: [{ key: "mangel", wort: "Gegenlauf Habitat gekappt: Mangel bei den Abnehmern nach der Flugzeit (1 = ja)", soll: 1, richtung: "≥" }], erwartet: "nicht", fehlt: "ein Netz von Habitaten" },
            7: { auge: { pose: "Siedlung je Welt-Saat", vorbild: "Fremdwelt-Probe (R10) an 100 Saaten: Bauart folgt Welt und Leib" }, erwartet: "nicht", fehlt: "fremde Welten mit Bewohnern" },
        },
        proben: {
            1: [
                { name: "ATTRAPPE: 100 Bewohner im Keller, keine Lebenslinie", j: { leiter: "mensch.stadt.habitat", adapter: KARTE, sprossen: { 1: { art: "zahl", n: 100, werte: { lebenslinien: 0, verlassen: 1 } } } }, gruen: false, zahl: /ROT an Lebenslinien bis zur Quelle verfolgbar 0 / },
                { name: "TÄTER am Kern (Fächer, 20 Zell-Samen headless): 0 Bewohner unter Grade, der Keller 2,4 m ohne Wohnraum", j: { leiter: "mensch.stadt.habitat", adapter: KARTE, sprossen: { 1: { art: "nicht", n: 0, fehlt: "EINE Siedlung unter der Erde mit 10² Bewohnern: an 20 Orten (312 Lose) wohnen 0 unter dem Grund; unter Grade nur der Keller (105 Lose, bis -2.4 m, fachwerk-core.js:236) mit keller/kohlenkeller/kueche/vorrat/zisterne, kein Wohnraum (BAU_NUTZUNG.raeume :2686), jedes Los auf dem Grund (DORF :5218)" } } }, gruen: false, zahl: /Umfang nicht erzeugbar: EINE Siedlung unter der Erde mit 10² Bewohnern: an 20 Orten .* wohnen 0 unter dem Grund/ },
            ],
        },
    }),

    // ═════ mensch.stadt.messlatte — Die Stadt gegen die Besten ═════
    // stadt-voll: der Block (S2, Tag und Nacht), die Fläche der Stadt (S3–S6), zuletzt die 100-m-Straße (S1, die niedrigste Sprosse)
    F.leiter("mensch.stadt.messlatte", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        seite: { STADT, FAECHER, ORT_AN, ZELL_SAATEN, STRASSE_FAECHER },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ block: true }) + ");");
            } catch (e) {
                W = { fehler: String((e && e.message) || e).slice(0, 200) };
            }
            const da = () => {
                if (!W || W.fehler) throw new Error("die Stadt am Messort: " + ((W && W.fehler) || "ohne Antwort"));
                return W;
            };
            const nicht = (n, wert, soll, fehlt) => {
                if (!(typeof wert === "number" && isFinite(wert))) throw new Error("der Umfang ist nicht gemessen");
                if (wert >= soll) throw new Error("Umfang erreicht (" + wert + " ≥ " + soll + "), die Messung der Sprosse ist nicht gebaut");
                K.nicht(n, { n: wert, fehlt });
            };
            H.zeile("stadt-voll: " + (W && !W.fehler ? W.steht + " Häuser auf " + W.flaecheKm2 + " km²" : (W && W.fehler) || "ohne Antwort"));
            await K.schritt(2, async () => {
                const Bk = da().block;
                if (!Bk) throw new Error("die Stadt trägt keinen Block an einer Straße");
                const tag = await K.bild(2, Bk.pose, { wahl: 0, uhr: 0.5 });
                const nacht = await K.bild("2-nacht", Bk.pose, { wahl: 0, uhr: 0 });
                K.auge(2, {
                    bild: tag.datei,
                    pose: "stadt-voll, Block am Haus nächst dem Spieler, vom Straßenpunkt " + JSON.stringify(Bk.pose) + ", Mittag (das Nachtbild: " + nacht.datei + ")",
                    mass: "Häuser im Block " + Bk.haeuser + ", mit Tür in einen Raum " + Bk.mitTuer + (tag.abnahme ? " · Abnahme " + tag.abnahme : ""),
                });
            });
            await K.schritt(3, async () => nicht(3, da().flaecheKm2, 1, "ein Viertel von 1 km² an 20 Zufallsstraßen: die Stadt bedeckt " + W.flaecheKm2 + " km² (Rechteck der stehenden Häuser)"));
            await K.schritt(4, async () => nicht(4, da().steht, 1e6, "die Nachtstraße der Megastadt im Regen (10⁶ Häuser, Verkehr in drei Ebenen): die Stadt trägt " + W.steht + " Häuser auf einer Ebene"));
            await K.schritt(5, async () => nicht(5, da().flaecheKm2, 10, "die ganze Stadt des Vergleichstitels (10–100 km²) an 100 Zufallsorten: die Stadt bedeckt " + W.flaecheKm2 + " km²"));
            await K.schritt(6, async () => nicht(6, da().flaecheKm2, 85000, "zehnmal Fläche und Menge von Tokio (~85 000 km²): die Stadt bedeckt " + W.flaecheKm2 + " km²"));
            await K.schritt(7, async () => nicht(7, da().kulturEpoche, 100, "dieselbe Tiefe in jeder Stadt jeder Epoche, Kultur und Welt (1 000 Zufallsorte): die Sitzung trägt " + W.kulturEpoche + " Paare Region × Jahrhundert in " + W.saaten + " Saaten"));
            // S1 am FÄCHER des Gesetzes: 12 Zell-Samen der Stufe 1, je Adresse ein Ruf von fachwerk exportSettlement (Leser
            // stamm/siedlung-ort.js:308). Gezählt: die Straße als Zug der Gassen und an ihren ersten 100 m Fassaden, Läden und Bewohner.
            // Trägt kein Ort 100 m Straße, urteilt der Fächer „Umfang nicht erzeugbar“. Sonst geht das Bild der Straße nächst dem Spieler
            // ans Panel, mit den Zählungen am Gesetz und Menschen und Wagen der warmen Welt (Tagesplan und Verkehr leben nur dort)
            await K.schritt(1, async () => {
                const f = H.seite.STRASSE_FAECHER(H.seite.ZELL_SAATEN(12), Math.max(3000, Math.min(20000, Math.floor((H.rest() - 15) * 1000))));
                f.gesetz.fn = H.seite.ORT_AN;
                const R = await H.seite.FAECHER(K.welt, f);
                H.zeile("Straße S1: " + R.akte.slice(0, 400));
                if (!R.gemessen) throw new Error("der Fächer maß keine Adresse: " + (R.fehlt || (R.fehler[0] && R.fehler[0].fehler) || "an der Frist"));
                const U = f.urteil(R);
                if (U.art === "nicht") return K.nicht(1, { n: U.n, fehlt: U.fehlt });
                const S = R.werte.welt;
                if (!S || !S.pose) throw new Error("der Ort der Sitzung trägt keine Straße mit Pose: " + (R.fehlt || "kein Zug der Gassen"));
                const b = await K.bild(1, S.pose, { wahl: 0, uhr: 0.5 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll, die längste Straße des Orts der Sitzung (Zug der Gassen): Auge 1,7 m am Anfang, Blick längs ihrer ersten " + S.laengeM + " m " + JSON.stringify(S.pose) + ", Mittag",
                    mass: "die vier Zählungen an " + S.laengeM + " m: Fassaden " + S.fassaden + ", Läden " + S.laeden + ", Menschen " + S.menschen + ", Wagen " + S.wagen + " · am Fächer: " + U.mass + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll: 100 m der Straße nächst dem Spieler, Auge 1,7 m über Grund am Anfang, Blick längs der Straße, Mittag", vorbild: "dieselbe Kameralage im Vergleichstitel (100 m Straße, Tag): das Panel wählt unser Bild ≥ 20 %, die vier Zählungen an beiden" } },
            2: { auge: { pose: "stadt-voll: der Block am Haus nächst dem Spieler, vom nächsten Straßenpunkt, Mittag und Mitternacht", vorbild: "derselbe Block im Vergleichstitel bei Tag und Nacht: Blindpaar ≥ 30 %, betretbare Innenräume ≥ Vergleichstitel" } },
            3: { auge: { pose: "20 Zufallsstraßen eines Viertels", vorbild: "Viertel 1 km² im Vergleichstitel: Blindpaar ≥ 40 %" }, erwartet: "nicht", fehlt: "ein Viertel von 1 km²" },
            4: { auge: { pose: "Nachtstraße im Regen", vorbild: "Nachtstraße des dichtesten Vergleichstitels (gewählt ≥ 50 %) und Nachtfoto von Tokio (2AFC ≤ 70 %)" }, erwartet: "nicht", fehlt: "die Nachtstraße einer Megastadt" },
            5: {
                umfang: { soll: 10, wort: "km² Stadtfläche" },
                masse: [{ key: "zaehlAnteil", wort: "Zufallsorte mit allen vier Zählungen ≥ Vergleichstitel", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "eine Stadt von 10 km²",
            },
            6: { auge: { pose: "100 Zufallsorte", vorbild: "Vergleichstitel an 100 Zufallsorten (Blindpräferenz ≥ 70 %) und Straßenfotos von Tokio (2AFC ≤ 60 %)" }, erwartet: "nicht", fehlt: "zehnmal Tokio" },
            7: { auge: { pose: "1 000 Zufallsorte über Saaten und Epochen", vorbild: "Vergleichstitel: Blindpräferenz ≥ 70 %, alle vier Zählungen ≥ Vergleichstitel" }, erwartet: "nicht", fehlt: "jede Stadt jeder Epoche" },
        },
        proben: {
            5: [
                { name: "ATTRAPPE: 10 km², an der Hälfte der Orte flacher als der Vergleichstitel", j: { leiter: "mensch.stadt.messlatte", adapter: KARTE, sprossen: { 5: { art: "zahl", n: 10, werte: { zaehlAnteil: 0.5 } } } }, gruen: false, zahl: /ROT an Zufallsorte mit allen vier Zählungen ≥ Vergleichstitel 0\.5 / },
            ],
        },
    }),
];
// die Gesetz-Rufe und Fächer der Fronten für die Messung headless am Kern (pm-werk faecher-kern.cjs), wie k2-mensch-geist.js
Object.assign(module.exports, { ORT_AN, NETZ_AN, ZELL_SAATEN, HABITAT_FAECHER, WEILER_FAECHER, TURM_FAECHER, REGION_FAECHER, STRASSE_FAECHER, LAND_FAECHER });
