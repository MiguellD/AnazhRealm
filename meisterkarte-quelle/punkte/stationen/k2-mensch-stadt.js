// DIE RICHTER-STATIONEN DER PERSPEKTIVE stadt (Meisterkarte 2, Kapitel mensch; die Fabrik k2-mensch.js): sieben Leitern, je Leiter
// EIN Mess-Programm in der warmen Welt der Sitzung. Gemessen wird das ERGEBNIS der Welt: die Häuser, die als Bau der Welt an ihrem
// Slot stehen (der Bau mit dem Samen des Slots binnen 1 m an seinem Ort — der Leser von scripts/lib/stadt-proben.cjs), ihre Hülle
// (die festen Blocker-Kisten über dem Grund), die Pläne der Orte (`_bewohnerSiedlungen`: Straßen, Grundrisse, Region, Jahr, Kern),
// die Bewohner (Leib, Ort, Höhe über dem Grund und dem gezeichneten Wasser), das Rang-Gesetz der Zellen (`_autoSettlementCellInfo`,
// derselbe Leser wie siedlung.K2) und Bilder an fester Pose. Wo die Welt den Umfang der Sprosse nicht stellen kann, misst die Probe den
// Umfang, den sie stellt, und urteilt „Umfang nicht erzeugbar“ mit der Zahl (erreicht die Welt ihn, wirft die Sprosse: ihre Messung
// ist dann nicht gebaut — UNGEMESSEN beim Namen, nie ein falsches ROT).
"use strict";

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
        seite: { STADT },
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
            // S1: der Weiler — der Messort dorf (Zelle −4,−4), die Pose am Ortsrand
            await K.schritt(1, async () => {
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
                    mass: "im Bild gezählt " + D.rand.n + " Häuser (Soll ≥ 10) · Form-Zwillinge im Bild " + D.rand.zwillinge + " (Soll 0) · stehend " + D.steht + " von " + D.slots + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
                });
            });
        },
        sprossen: {
            1: { auge: { pose: "dorf (Zelle −4,−4): Ortsrand in der Richtung mit den meisten freien Häusern (von 8), 20 m vor dem äußersten Haus, 8 m über Grund, Blick auf die Mitte, Mittag", vorbild: "Foto eines realen Weilers (~10 Gebäude) vom Ortsrand: Panel-2AFC ≤ 90 %, Zwillinge im Bild 0" } },
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
        seite: { STADT },
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
            await K.schritt(2, async () => nicht(2, da().hoch.geschosseMax, 30, "Türme mit 30 Geschossen: der höchste Turm der Stadt trägt " + W.hoch.geschosseMax + " Geschosse, das höchste Gebäude " + W.hoch.m + " m über Grund"));
            await K.schritt(3, async () => nicht(3, da().hoch.m, 400, "Supertall ≥ 400 m: das höchste Gebäude der Sitzung misst " + W.hoch.m + " m über Grund"));
            await K.schritt(4, async () => nicht(4, da().ebenen, 2, "2 begehbare Ebenen (Brücken, Unterführung, U-Bahn): " + W.ueber + " Überführungen der Straßen (die Regel von vertikal S1), " + W.bewohner.unterGrund + " Bewohner unter dem Grund"));
            await K.schritt(5, async () => nicht(5, da().bewohner.proHaMax, 1e4, "≥ 5 Schichten und 10 000 Bewohner je ha (Kowloon): die Stadt trägt höchstens " + W.bewohner.proHaMax + " Bewohner je ha auf " + W.ebenen + " Ebene"));
            await K.schritt(6, async () => nicht(6, da().hoch.m, 1000, "Arkologie ≥ 1 km mit 10⁶ Bewohnern: das höchste Gebäude misst " + W.hoch.m + " m, die Stadt trägt " + W.bewohner.n + " Bewohner"));
            await K.schritt(7, async () => nicht(7, da().ebenen, 10, "≥ 10 durchgehend begehbare Schichten über ≥ 100 km²: die Stadt trägt " + W.ebenen + " Ebene auf " + W.flaecheKm2 + " km²"));
            await K.schritt(8, async () => nicht(8, da().bewohner.dekaden, 5, "Bewohner auf ≥ 5 Höhen-Dekaden (Meeresboden bis Orbit): die " + W.bewohner.mitLeib + " Bewohner mit Leib stehen auf " + W.bewohner.dekaden + " Dekaden über Grund"));
        },
        sprossen: {
            2: { umfang: { soll: 30, wort: "Geschosse des höchsten Turms" }, masse: [{ key: "hoeheM", wort: "höchstes Gebäude m", soll: 100, richtung: "≥" }], erwartet: "nicht", fehlt: "Türme mit 30 Geschossen" },
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
        seite: { STADT },
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
            await K.schritt(1, async () => {
                da();
                const b = await K.bild(1, W.blick.pose, { wahl: 0, uhr: 0.5 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll, Kamera des Spiels an der ortPose platz " + JSON.stringify(W.blick.pose) + ", Mittag",
                    mass: "Region des Plans " + W.ort.region + " · Jahr " + W.ort.jahr + " · Kulturen der stehenden Häuser " + W.kulturen.join(", ") + " · im Blick " + W.blick.n + " Häuser" + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
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
        seite: { LAND },
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
            await K.schritt(2, async () => nicht(2, da().sichtKm, 1000, "ein Land von 10³ km, gesehen aus 100 km bei Nacht: die Sitzung trägt Orte bis " + L.sichtKm + " km vom Spieler (" + L.siedlungen + " Siedlungen)"));
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
        },
        sprossen: {
            2: { auge: { pose: "100 km über dem Land, Nacht", vorbild: "Satellitenbild eines Landes bei Nacht: Verwechslung ≥ 30 %" }, erwartet: "nicht", fehlt: "ein Land von 10³ km" },
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
        },
    }),

    // ═════ mensch.stadt.habitat — Siedeln jenseits der Oberfläche ═════
    // stadt-voll: wo die Bewohner stehen — unter dem Grund, unter dem gezeichneten Wasser, fern der Oberfläche, unter welcher Schwere
    F.leiter("mensch.stadt.habitat", {
        sek: 45,
        pfad: PFAD,
        seite: { STADT },
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
            await K.schritt(1, async () => nicht(1, da().bewohner.unterGrund, 100, "EINE Siedlung unter der Erde mit 10² Bewohnern: von " + W.bewohner.mitLeib + " Bewohnern mit Leib stehen " + W.bewohner.unterGrund + " mehr als 2 m unter dem Grund"));
            await K.schritt(2, async () => nicht(2, da().bewohner.unterWasser, 1000, "Stadt unter Wasser mit 10³: " + W.bewohner.unterWasser + " Bewohner stehen mehr als 1 m unter dem gezeichneten Wasser"));
            await K.schritt(3, async () => nicht(3, da().bewohner.niedrigSchwer, 1000, "Kolonie auf Mond oder Mars mit 10³: die Welt trägt die Schwere " + W.schwere + " m/s², kein Bewohner lebt bei 1/6 oder 1/3 g"));
            await K.schritt(4, async () => nicht(4, da().bewohner.schwerelos, 1e4, "Station im freien Raum mit 10⁴: die Welt trägt die Schwere " + W.schwere + " m/s², 0 Bewohner schwerelos"));
            await K.schritt(5, async () => nicht(5, da().bewohner.fern, 1e6, "Zylinder-Habitat mit 10⁶: " + W.bewohner.fern + " Bewohner stehen mehr als 50 m über oder unter dem Grund des Planeten"));
            await K.schritt(6, async () => nicht(6, da().habitate, 1000, "Netz von 10³ Habitaten: die Sitzung trägt " + W.habitate + " Orte fern der Oberfläche unter " + W.siedlungen + " Siedlungen"));
            await K.schritt(7, async () => nicht(7, da().welten, 100, "jede Lebensform an jedem Ort jeder Welt (100 Saaten): die Sitzung trägt " + W.welten + " Welt, ihre Bewohner sind Menschen"));
        },
        sprossen: {
            1: {
                umfang: { soll: 100, wort: "Bewohner unter der Erde" },
                masse: [
                    { key: "lebenslinien", wort: "Lebenslinien bis zur Quelle verfolgbar", soll: 3, richtung: "≥" },
                    { key: "verlassen", wort: "Gegenlauf Schacht verstopft: Anteil, der den Trakt verlässt", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "eine Siedlung unter der Erde",
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
            ],
        },
    }),

    // ═════ mensch.stadt.messlatte — Die Stadt gegen die Besten ═════
    // stadt-voll: der Block (S2, Tag und Nacht), die Fläche der Stadt (S3–S6), zuletzt die 100-m-Straße (S1, die niedrigste Sprosse)
    F.leiter("mensch.stadt.messlatte", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        seite: { STADT },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let W;
            try {
                W = await K.welt("return await (" + H.seite.STADT + ")(r, T, " + JSON.stringify({ strasse: true, strasseM: 100, block: true }) + ");");
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
            await K.schritt(1, async () => {
                const S = da().strasse;
                if (!S) throw new Error("die Stadt trägt keine Straße mit zwei Punkten");
                const b = await K.bild(1, S.pose, { wahl: 0, uhr: 0.5 });
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll, " + S.laengeM + " m der Straße nächst dem Spieler (" + S.klasse + "): Auge 1,7 m am Anfang, Blick längs der Straße " + JSON.stringify(S.pose) + ", Mittag",
                    mass: "die vier Zählungen an " + S.laengeM + " m: Fassaden " + S.fassaden + ", Läden (Gewerbe) " + S.gewerbe + ", Menschen " + S.menschen + ", Wagen " + S.wagen + (b.abnahme ? " · Abnahme " + b.abnahme : ""),
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
