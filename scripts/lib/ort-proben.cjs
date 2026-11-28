"use strict";
// scripts/lib/ort-proben.cjs — DER ORT AUF DEM GELÄNDE (siedlung; aus scripts/diag-settlement.cjs geteilt, w28-stadt-grammatik:
// die Linse hielt mit main ffb005db die Decke von 4000 Zeilen nicht): die REINEN Urteile der Settlement-Linse an einem Ort, wie
// die Welt ihn trägt — das Gassen-Gefälle und der Erdbau je Haus (siedlung.K3), das Urteil des Orts (Sockel, Türen: `ortUrteil`
// mit `lokal` und `kasten`), der Zug am Ort (C2), der Belag der Gassen, die Plätze des Licht-Pools (`poolZaehlen`), das Verdikt
// der Abnahme (`ortVerdikt`), die Sicht der Pose (`poseSicht`) und das Dorf-Licht der Gasse (`gassenLicht`). Kein Wort ist
// geändert: `lokal`, `kasten`, `ortUrteil`, `poseSicht` und `poolZaehlen` reisen weiter als Quelltext in die Seite (Teil O),
// der Selbsttest der Linse (`--selftest`, Selbst-Tests 9–16b, C2) feuert an ihnen. `aufsteigend` und `rang` sind die Helfer
// des Welt-Boots (globalThis, in der Seite `window`).
require("./welt-boot.cjs");

// DAS GASSEN-GEFÄLLE (siedlung.K3, rein): p95 in % von |Δ grund| / Länge über jeden Schritt ≥ 0,5 m jeder Gasse des Plans v2
// (plan-lokal um `v2.ort`), `grund(x, z)` die Welt-Höhe ohne Erdbau — der Boden, dem die Trasse folgt.
function gassenGefaelle(v2, grund) {
    const gs = [];
    const h = (p) => grund(v2.ort.x + p.x, v2.ort.z + p.z);
    for (const { pts: P } of v2.roads || [])
        for (let k = 1; k < P.length; k++) {
            const d = Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z);
            if (d >= 0.5) gs.push(Math.abs(h(P[k]) - h(P[k - 1])) / d);
        }
    gs.sort(aufsteigend);
    return +(100 * gs[Math.round(0.95 * (gs.length - 1))]).toFixed(1);
}
// DER ERDBAU JE HAUS (siedlung.K3 Staffel 2, die Kosten neben dem Gefälle): der Median über die Häuser des Plans v2 von
// ∫ |Boden des Hauses − Grund| über seinen Grundriss (obb, 1-m-Raster), in m³ — so viel Erde bewegt der Ort je Haus.
function erdbauMedian(v2, grund) {
    const vs = v2.slots
        .filter((q) => q.obb)
        .map(({ y, obb: b }) => {
            let v = 0;
            for (let u = 0.5 - b.ex; u < b.ex; u++)
                for (let w = 0.5 - b.ez; w < b.ez; w++) {
                    const [p, q] = lokal(0, 0, -b.phi || 0, u, w);
                    v += Math.abs(y - grund(v2.ort.x + b.cx + p, v2.ort.z + b.cz + q));
                }
            return v;
        });
    return Math.round(rang(vs.sort(aufsteigend)));
}

// ===== DAS URTEIL DES ORTS (Teil O, K10 — rein, mit Selbsttest) =====
// v2 = der Ort, wie die Welt ihn trägt (plan-lokal um `ort` {x, z}): je Haus x · z · phi · y (der Boden, absolut) · tuer
// (die Tür-Zeile: x, z, y = Diele, W × D = die Wand) · obb (der Grundriss mit Dach); roads (pts, w) und platz (cx, cz, phi, ex,
// ez). hoehe(x, z) = die Welt-Höhe an einem WELT-Ort. Gemessen:
//   Sockel je Haus = der Fuß des gebauten Körpers über dem Grund unter ihm (9 × 9 Punkte je Box des Körper-Satzes `grund.boxen`,
//   ohne Boxen die obb; nie im hohlen Keller `grund.keller`, S4; der Fuß: das tiefste feste Stück der Hülle des Slots über dem
//   Punkt, `huelle` aus `slotHuelle`, ohne Hülle Grade), Median und Maximum;
//   Tür erreichbar = die Schwelle des Eingangs (`eingang` des Slots, die EINE Regel `eingangVon`: beim Hof-Haus das Tor im
//   Torriegel; ohne ihn die Tür-Zeile) liegt höchstens STUFE über dem Grund 0,3 m vor ihr, die 2 m geradeaus aus
//   der Tür tragen keine Stufe > STUFE (kein Absatz vor der Schwelle), und ein Gang über ein 0,5-m-Raster (Nachbarn mit
//   |Δh| ≤ STUFE, nie durch eine Wand oder den Keller) erreicht einen Weg oder den Platz. Das Raster entsteht nur, wo der Gang geht.
// der Punkt (x, z) im Rahmen um (cx, cz) mit der Drehung phi (reist mit `ortUrteil` als Quelltext in die Seite)
// C2 DER ORT HÄLT DEN ZUG, NIE DAS BILD (w12-dorf-probe): an der Null-Seite lebt der Dorf-Takt ohne Haken (`ohne`: der Bau am
// Ort ist Simulation), unter dem Haken des Orts (`false`, haushalt.json `dorfZug`) bestellt sein Takt nichts (`still`). Bis
// w12-dorf-probe ruhte er, sobald nur der Null-Renderer stand: jede headless Probe am Messort dorf urteilte eine leere Welt
// (0 Häuser nach 9000 Takten, mit Renderer 16).
const dorfZugAmOrt = (c) => c.ohne && c.still;
// DIE HÜLLE EINES SLOTS (Node, am Kern des Gesetzbuchs `FC`): die festen Boxen seines Stufe-0-Baus [x0, y0, z0, x1, y1, z1]
// haus-lokal (Grade = 0) — die Solids, die das Haus in der Welt als Hülle trägt (Kollision == Optik). `ortUrteil` liest an
// ihnen den Fuß je Körper (`sl.huelle`). null: der Slot trägt kein Haus des Gesetzbuchs.
function slotHuelle(FC, sl) {
    const pre = FC.PRESETS[sl.kultur];
    if (!pre || (pre.kind && pre.kind !== "haus")) return null;
    FC.materials();
    const p = FC.hausParams(pre, sl.ov || null);
    if (Number.isFinite(Number(sl.seed)) && !(sl.ov && sl.ov.seed != null)) p.seed = Number(sl.seed);
    p.nur = { moebel: false };
    const st = FC.stapelBau(p, { gelaende: false });
    const boxen = st.H.solids.map((s) => [...s.min, ...s.max].map((v) => Math.round(v * 1000) / 1000));
    st.g.traverse((o) => o.geometry && o.geometry.dispose());
    return boxen;
}
// DER BELAG DER GASSEN (w28-stadt-boden, fachwerk BELAG_GESETZ): je Gasse { i, gen, quer, soll, pflaster, erde } — das Gesetz neben
// den gemalten Bytes ihrer Mitte und ihres Gehwegs 0,4 m vor der Bauflucht (`_wegeBelagAt`). → die Täter beim Namen: eine gepflasterte Gasse ohne Pflaster (bis
// w28-stadt-boden malte der Wirt jede Gasse als Erde), eine Erd-Gasse mit Pflaster oder ohne Erde.
const belagUrteil = (gassen) =>
    (gassen || [])
        .filter((g) =>
            g.soll === "pflaster" ? !(g.pflaster >= 0.9 && g.gehweg >= 0.8) : !(g.pflaster <= 0.1 && g.erde >= 0.9)
        )
        .map(
            (g) =>
                `Gasse ${g.i} (gen ${g.gen}${g.quer ? " quer" : ""}): Gesetz ${g.soll}, Karte Pflaster ${g.pflaster} · Erde ${g.erde} · Gehweg ${g.gehweg}`
        );

function lokal(cx, cz, phi, x, z) {
    const [c, s] = [Math.cos(phi || 0), Math.sin(phi || 0)];
    return [(x - cx) * c - (z - cz) * s, (x - cx) * s + (z - cz) * c];
}
// der Abstand eines Punkts zur Wand des Rechtecks um (cx, cz) mit den Halbachsen ex × ez, gedreht um phi (innen negativ; reist
// mit `lokal` und `ortUrteil` in die Seite)
function kasten(cx, cz, phi, ex, ez, x, z) {
    const [u, v] = lokal(cx, cz, phi, x, z);
    const [uu, vv] = [Math.abs(u) - ex, Math.abs(v) - ez];
    return uu > 0 ? (vv > 0 ? Math.hypot(uu, vv) : uu) : vv > 0 ? vv : Math.max(uu, vv);
}
function ortUrteil(v2, hoehe, o) {
    o = o || {};
    const STUFE = o.stufeM || 0.4;
    const G = 0.5;
    const KAPPE = o.kappe || 60000;
    const ox = v2.ort.x;
    const oz = v2.ort.z;
    const imRecht = (b, x, z, m) => {
        const [u, v] = lokal(b.cx, b.cz, b.phi, x, z);
        return Math.abs(u) <= b.ex + m && Math.abs(v) <= b.ez + m;
    };
    const imKeller = (sl, x, z) => {
        const K = sl.grund?.keller; // der Raum des Grund-Datums im Rahmen des Hauses (plan-lokal)
        const [u, v] = lokal(sl.x, sl.z, sl.phi, x, z);
        return !!K && u >= K[0] && u <= K[1] && v >= K[2] && v <= K[3];
    };
    const sockel = [];
    const sockelTaeter = []; // der Täter beim Namen: je Haus mit Sockel > 0 seine Nummer, Rolle, Höhe und sein Körper
    const sockelJe = []; // und sein Ort im Plan (der Punkt des höchsten Fußes, `tief`), für Weg, Nachbar und Splat dort
    for (const [si, sl] of v2.slots.entries()) {
        const ob = sl.obb;
        if (!ob) continue;
        const c = Math.cos(ob.phi || 0);
        const s = Math.sin(ob.phi || 0);
        let bei = null;
        let tief = null; // der Punkt des höchsten Fußes im Plan des Orts
        // UNTER DEN WÄNDEN (`grund.boxen`, der Körper-Satz des Hauses im Rahmen des Slots): das Haus steht auf seinen Boxen — die
        // obb trägt das Dach und beim L-, U- und Hof-Haus die leere Ecke zwischen den Flügeln (bis w28-bau-rezept las der Sockel dort
        // den Grund der Gasse unter der Ecke: Auto-Dorf, Gasthaus L, 1,136 m an der Ecke ohne Wand); ohne Boxen die obb
        const bx = sl.grund?.boxen?.length ? sl.grund.boxen : null;
        const flaechen = bx
            ? bx.map((b, k) => ({ cx: sl.x, cz: sl.z, c: Math.cos(sl.phi || 0), s: Math.sin(sl.phi || 0), x0: b[0], x1: b[1], z0: b[2], z1: b[3], art: sl.grund.arten?.[k] || null }))
            : [{ cx: ob.cx, cz: ob.cz, c, s, x0: -ob.ex, x1: ob.ex, z0: -ob.ez, z1: ob.ez, art: null }];
        // DER FUSS DES GEBAUTEN KÖRPERS (`sl.huelle`, die festen Boxen der Hülle des Hauses [x0, y0, z0, x1, y1, z1] haus-lokal —
        // was das Haus an diesem Punkt wirklich baut): der Sockel misst vom tiefsten gebauten Stück über dem Punkt bis zum Grund,
        // nie von der Höhe des Slots allein. Bis hier schwebte der Hof-Ring (Arme und Torriegel, Boden auf 0,55 m über Grade, kein
        // Fundament darunter) über ebenem Grund mit Sockel 0 — das Auge sah unter der Wand hindurch (Dorf-Gasse, 18.11.). Ohne
        // Hülle steht der Körper auf Grade (Fuß 0); ein Punkt ohne gebautes Stück (der offene Hof) zählt nicht
        const hu = Array.isArray(sl.huelle) && sl.huelle.length ? sl.huelle : null;
        const fussBei = (lx, lz) => {
            if (!hu) return 0;
            let f = Infinity;
            for (const q of hu) if (lx >= q[0] && lx <= q[3] && lz >= q[2] && lz <= q[5] && q[1] < f) f = q[1];
            return f;
        };
        let hoch = -Infinity; // der höchste Fuß über seinem Grund
        let art = null;
        let fuss = 0;
        for (const f of flaechen)
            for (let i = 0; i <= 8; i++)
                for (let j = 0; j <= 8; j++) {
                    // mit Hülle die Mitten des Rasters (ein Punkt auf der Kante läse den Nachbar-Körper), ohne die Ecken wie bisher
                    const lx = f.x0 + ((f.x1 - f.x0) * (hu ? i + 0.5 : i)) / (hu ? 9 : 8);
                    const lz = f.z0 + ((f.z1 - f.z0) * (hu ? j + 0.5 : j)) / (hu ? 9 : 8);
                    const [px, pz] = [f.cx + lx * f.c + lz * f.s, f.cz - lx * f.s + lz * f.c];
                    if (imKeller(sl, px, pz)) continue;
                    const fu = fussBei(lx, lz);
                    if (fu === Infinity) continue;
                    const h = hoehe(ox + px, oz + pz);
                    if (sl.y + fu - h > hoch) [hoch, bei, art, fuss, tief] = [sl.y + fu - h, [Math.round(10 * lx) / 10, Math.round(10 * lz) / 10], f.art, fu, [px, pz]];
                }
        sockel.push(Math.max(0, hoch));
        // `bei`: der Punkt mit dem höchsten Fuß über dem Grund im Rahmen des Hauses (x quer, z längs; ex × ez die Halbachsen der
        // obb), `art` sein Körper (haupt · fluegel · hofarm · anbau · turm), `fuss` das tiefste gebaute Stück dort über Grade
        if (hoch > 0) {
            sockelTaeter.push({ si: si, rolle: sl.rolle || null, m: Math.round(1000 * hoch) / 1000, bei, art, fuss: Math.round(1000 * fuss) / 1000, ex: ob.ex, ez: ob.ez });
            sockelJe.push({ si, rolle: sl.rolle || null, m: Math.round(hoch * 1000) / 1000, x: Math.round(sl.x * 10) / 10, z: Math.round(sl.z * 10) / 10, tief });
        }
    }
    sockelJe.sort((a, b) => b.m - a.m);
    // die WAND je Haus: das Rechteck der Tür-Zeile (W × D um den Slot), sonst der Grundriss (das Dach ragt über die Wand)
    const waende = v2.slots
        .map((sl) =>
            sl.tuer && Number.isFinite(sl.tuer.W) && Number.isFinite(sl.tuer.D)
                ? { cx: sl.x, cz: sl.z, phi: sl.phi || 0, ex: sl.tuer.W / 2, ez: sl.tuer.D / 2 }
                : sl.obb
        )
        .filter(Boolean);
    const wege = [];
    for (const rd of v2.roads || [])
        for (let k = 1; k < (rd.pts || []).length; k++) wege.push([rd.pts[k - 1], rd.pts[k], (rd.w || 3) / 2]);
    // AM TIEFSTEN PUNKT des Sockels (die ersten drei Häuser): der nächste Weg (Abstand zum Rand, < 0 = im Weg) und das nächste
    // andere Haus (Abstand der Mitte, sein Boden) — so steht der Täter beim Namen, ob ein Weg-Schnitt oder eine Nachbar-Terrasse
    for (const h of sockelJe.slice(0, 3)) {
        const [px, pz] = h.tief;
        let weg = Infinity;
        for (const [a, b, hw] of wege) {
            const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
            let t = l2 > 0 ? ((px - a.x) * dx + (pz - a.z) * dz) / l2 : 0;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            weg = Math.min(weg, Math.hypot(px - a.x - dx * t, pz - a.z - dz * t) - hw);
        }
        const ich = v2.slots[h.si];
        const nb = v2.slots
            .map((sl, j) => ({ j, d: Math.hypot(sl.x - px, sl.z - pz), y: sl.y, rolle: sl.rolle || null }))
            .filter((q) => q.j !== h.si)
            .sort((a, b) => a.d - b.d)[0];
        const r1 = (v) => Math.round(v * 100) / 100;
        Object.assign(h, {
            tief: [r1(px), r1(pz)],
            grund: r1(hoehe(ox + px, oz + pz) - ich.y),
            wegRand: Number.isFinite(weg) ? r1(weg) : null,
            nachbar: nb ? { si: nb.j, rolle: nb.rolle, d: r1(nb.d), dy: r1(nb.y - ich.y) } : null,
        });
    }
    for (const h of sockelJe.slice(3)) delete h.tief;
    const hz = new Map();
    const zelle = (i, j) => {
        const q = (i + 32768) * 65536 + (j + 32768);
        let z = hz.get(q);
        if (z) return z;
        const x = i * G;
        const zz = j * G;
        let zu = v2.slots.some((sl) => imKeller(sl, x, zz));
        for (const b of waende)
            if (imRecht(b, x, zz, -0.1)) {
                zu = true;
                break;
            }
        let ziel = false;
        if (!zu && v2.platz && Number.isFinite(v2.platz.ex) && imRecht(v2.platz, x, zz, 0)) ziel = true;
        if (!zu)
            for (const [a, b, hw] of wege) {
                if (ziel) break;
                const dx = b.x - a.x;
                const dz = b.z - a.z;
                const l2 = dx * dx + dz * dz;
                let t = l2 > 0 ? ((x - a.x) * dx + (zz - a.z) * dz) / l2 : 0;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                if (Math.hypot(x - a.x - dx * t, zz - a.z - dz * t) <= hw) ziel = true;
            }
        z = { h: hoehe(ox + x, oz + zz), zu, ziel };
        hz.set(q, z);
        return z;
    };
    const tueren = [];
    v2.slots.forEach((sl, si) => {
        const tu = sl.tuer;
        if (!tu || !Number.isFinite(tu.x) || !Number.isFinite(tu.z)) return;
        const c = Math.cos(sl.phi || 0);
        const s = Math.sin(sl.phi || 0);
        const vor = (lz) => [sl.x + tu.x * c + lz * s, sl.z - tu.x * s + lz * c];
        // der EINGANG (`eingangVon` im Slot): beim Hof-Haus das Tor im Torriegel — die Haustür öffnet auf das Hofpflaster
        // (Bau, nie Grund); bis w28-bau-rezept stand die Probe im Hof vor der Haustür und las den Grund unter dem Pflaster
        const ein = sl.eingang || { z: tu.z, y: tu.y };
        const [vx, vz] = vor(ein.z - 0.3);
        const schwelle = sl.y + (Number.isFinite(ein.y) ? ein.y : 0) - hoehe(ox + vx, oz + vz);
        let vorStufe = 0;
        let stufeBei = null; // der Täter der Stufe beim Namen: ihr Meter vor der Tür und das Haus, in dessen Grundriss (Keller) sie liegt
        let hv = hoehe(ox + vx, oz + vz);
        for (let k = 1; k <= 8; k++) {
            const [px, pz] = vor(ein.z - 0.3 - 0.25 * k);
            const hk = hoehe(ox + px, oz + pz);
            if (Math.abs(hk - hv) > vorStufe) {
                vorStufe = Math.abs(hk - hv);
                const im = v2.slots.findIndex((q) => q !== sl && q.obb && imRecht(q.obb, px, pz, 0));
                stufeBei = { m: 0.3 + 0.25 * k, h: Math.round(1000 * (hk - sl.y)) / 1000, haus: im, keller: v2.slots.some((q) => imKeller(q, px, pz)), tief: [Math.round(100 * px) / 100, Math.round(100 * pz) / 100] }; // prettier-ignore
            }
            hv = hk;
        }
        const i0 = Math.round(vx / G);
        const j0 = Math.round(vz / G);
        let erreicht = false;
        if (Math.abs(schwelle) <= STUFE && vorStufe <= STUFE && !zelle(i0, j0).zu) {
            const seen = new Set([i0 * 131072 + j0]);
            const st = [[i0, j0]];
            for (let kopf = 0; kopf < st.length && !erreicht && seen.size < KAPPE;) {
                const [i, j] = st[kopf++];
                const z = zelle(i, j);
                if (z.ziel) {
                    erreicht = true;
                    break;
                }
                for (const [a, b] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    const k = (i + a) * 131072 + (j + b);
                    if (seen.has(k)) continue;
                    const n = zelle(i + a, j + b);
                    if (n.zu || Math.abs(n.h - z.h) > STUFE) continue;
                    seen.add(k);
                    st.push([i + a, j + b]);
                }
            }
        }
        tueren.push({
            si,
            rolle: sl.rolle || null,
            ok: erreicht,
            schwelle: Math.round(schwelle * 1000) / 1000,
            vorStufe: Math.round(vorStufe * 1000) / 1000,
            vor: [Math.round((ox + vx) * 10) / 10, Math.round((oz + vz) * 10) / 10],
            ...(vorStufe > STUFE ? { stufeBei } : {}),
        });
    });
    sockel.sort(aufsteigend);
    return {
        sockelMedian: sockel.length ? Math.round(1000 * rang(sockel)) / 1000 : null,
        sockelMax: sockel.length ? Math.round(1000 * sockel[sockel.length - 1]) / 1000 : null,
        sockelFehl: sockelJe.slice(0, 3),
        tuerenOk: tueren.filter((t) => t.ok).length,
        tuerenN: tueren.length,
        tuerenFehl: tueren.filter((t) => !t.ok),
        sockelTaeter,
        zellen: hz.size,
    };
}
// DIE PLÄTZE DES LICHT-POOLS, DIE DEM ORT GEHÖREN (O Akt, rein — dieselbe Funktion in der Seite und im Selbsttest): `pool` die
// Plätze ({x, z, staerke}), `je` die sichtbaren Quellen der Gasse ([x, z, …]), `qs` jede brennende Quelle des Orts ([x, z]),
// `rang` die Wahl des Pools selbst ({x, z, rang} aus `_leuchtQuellen` mit dem Sichtkegel), `horizont` die sichtbaren im Umkreis
// des Pools, `ausser` der Rang, ab dem eine Quelle außer dem Kegel liegt. Gezählt: jeder helle Platz an einer sichtbaren Quelle,
// dazu (`poolNaeher`) der an einer Quelle des Orts ohne sichtbaren Kopf, deren Kugel den Kegel berührt (Rang < `ausser`) und
// deren Rang vor jeder sichtbaren liegt, die noch wartet. Ein Platz außer dem Kegel, hinter einer Wartenden oder an fremdem
// Licht zählt nie — das Soll des Akts fällt dann ROT (Selbst-Test 16b).
const POOL_AUSSER_RANG = 1e9; // stamm/dirigent-kern.js `_leuchtQuellen`: der Rang einer Quelle, deren Lichtkugel den Sichtkegel nicht berührt, beginnt hier
function poolZaehlen(pool, je, qs, rang, horizont, ausser) {
    const an = (p, l) => l.some(([x, z]) => Math.hypot(x - p.x, z - p.z) < 0.5);
    const rangVon = (p) => {
        const q = rang.find((c) => Math.hypot(c.x - p.x, c.z - p.z) < 0.5);
        return q ? q.rang : Infinity;
    };
    const hell = pool.filter((p) => p.staerke > 0);
    const wartet = Math.min(
        Infinity,
        ...horizont
            .filter(
                (q) =>
                    !an(
                        q,
                        hell.map((p) => [p.x, p.z])
                    )
            )
            .map(rangVon)
    );
    const naeher = hell.filter((p) => !an(p, je) && an(p, qs) && rangVon(p) < ausser && rangVon(p) < wartet).length;
    return { poolOrt: hell.filter((p) => an(p, je)).length + naeher, poolNaeher: naeher };
}
// Das Verdikt des Orts (rein): die Zahlen der Abnahme gegen ihr Ziel — die Liste der verfehlten Namen (leer = gehalten).
function ortVerdikt(m) {
    const fehl = [];
    if (!(m.slots > 0 && m.haeuser === m.slots))
        fehl.push(
            `Häuser ${m.haeuser}/${m.slots} des Exports${m.wasserSlots ? ` (${m.wasserSlots} Slots im Wasser aus dem Plan v2 geworfen)` : ""}`
        );
    if (!(m.sockelMax === 0))
        fehl.push(
            `Sockel max ${m.sockelMax} m (Median ${m.sockelMedian})${m.sockelFehl?.length ? ` — ${m.sockelFehl.map((h) => `Slot ${h.si} ${h.rolle || "?"} ${h.m} m bei ${h.x}/${h.z} (tief ${h.tief}: Weg-Rand ${h.wegRand} m, Nachbar ${h.nachbar ? `Slot ${h.nachbar.si} ${h.nachbar.rolle} in ${h.nachbar.d} m, Boden ${h.nachbar.dy} m` : "–"}${h.splats ? `, Splats ${h.splats}, Welt ${h.welt}` : ""})`).join(" · ")}` : ""}`
        );
    // der Sockel misst den Fuß des gebauten Körpers: ein Haus ohne Hülle (`slotHuelle`) ist nicht gemessen
    if (!(m.huellen === m.haeuser))
        fehl.push(`Hüllen ${m.huellen}/${m.haeuser}: der Sockel misst den gebauten Fuß nur am Haus mit Hülle`);
    if (!(m.tuerenN > 0 && m.tuerenOk === m.tuerenN)) fehl.push(`Türen erreichbar ${m.tuerenOk}/${m.tuerenN}`);
    if (!(m.kronen === 0)) fehl.push(`Kronen in Grundrissen ${m.kronen}`);
    if (!(m.laternenPlan > 0 && m.laternenWelt === m.laternenPlan))
        fehl.push(`Laternen Welt ${m.laternenWelt} / Plan ${m.laternenPlan}`);
    if (!(m.planHashGleich === true)) fehl.push("Plan-Hash Studio ≠ Welt");
    // K66: keine Laterne näher an einer Wand, als ihr Licht-Gesetz trägt; jede Stufe vor einer Haustür liegt auf dem Weg
    if (!(m.laterneWand >= m.laterneWandSoll - 0.01))
        fehl.push(
            `Laterne ${m.laterneWand} m vor einer Hauswand (Soll ≥ ${m.laterneWandSoll} m: die Wand trägt höchstens das Doppelte der Gasse)`
        );
    // K66, Prüfung 2: keine Laterne steht mit ihrem Fuß im gemalten Weg (der Mast ist ein fester Blocker, `tritt` des Rezepts)
    if (!(m.laterneWeg >= m.laterneWegSoll - 0.01))
        fehl.push(
            `Laterne ${m.laterneWeg} m neben dem Wegrand (Soll ≥ ${m.laterneWegSoll} m: der Fuß steht neben der Fahrbahn, nie in ihr)`
        );
    if (!(m.vorplatzN > 0 && m.vorplatzOk === m.vorplatzN))
        fehl.push(
            `Stufe und Vorplatz bis zur Gasse auf dem Weg ${m.vorplatzOk}/${m.vorplatzN}${m.vorplatzFehl?.length ? ` (Haus ${m.vorplatzFehl.slice(0, 3).join(" · ")})` : ""}`
        );
    // eine Wand ohne Vertex ist keine Messung (der Ort am Hang trägt Böschungen): ROT wie eine Wand im Wiesen-Stoff
    if (!(m.terrasseWand > 0 && m.terrasseWiese === 0))
        fehl.push(`Wand der Terrasse mit Wiesen-Stoff ${m.terrasseWiese}/${m.terrasseWand}`);
    // K66, Prüfung 2: keine Wiese wächst auf der Wand (der Grün-Kanal, den die Nah-Wiese liest), die Ferne trägt ihren Schutt
    if (!(m.terrasseWand > 0 && m.terrasseHalm === 0))
        fehl.push(`Wand der Terrasse mit Halm-Grund ${m.terrasseHalm}/${m.terrasseWand}`);
    if (!(m.terrasseWand > 0 && m.terrasseFerne === 0))
        fehl.push(`Wand der Terrasse in der Ferne ohne Schutt ${m.terrasseFerne}/${m.terrasseWand}`);
    if (!(m.fremdBauten === 0)) fehl.push(`fremde Bauten im Erdbau ${m.fremdBauten}`);
    // endet die Kette vor 8 s (der Wagen fuhr den Dorfweg zu Ende), zählt das Tempo bis zum Ende über 8 s: der Weg ist kürzer
    // als das Soll, nie der Wagen langsamer
    const gt8 = m.gtEnde > 0 ? Math.round((m.gtWeg / m.gtEnde) * 8 * 100) / 100 : m.gtWeg;
    if (!(gt8 >= GT_SOLL_M))
        fehl.push(
            `GT auf dem Dorfweg ${m.gtWeg} m in ${m.gtEnde > 0 ? m.gtEnde : 8} s (${gt8} m je 8 s, Soll ≥ ${GT_SOLL_M})${m.gtSteckt ? ` — steckt nach ${m.gtSteckt.s} m: ${m.gtSteckt.naechster || "kein Bau"} in ${m.gtSteckt.abstand} m` : ""}`
        );
    if (!(m.quellenGasse >= GASSE_SOLL))
        fehl.push(`Dorf-Licht der Gasse nachts ${m.quellenGasse} sichtbare Quellen (Soll ≥ ${GASSE_SOLL})`);
    // der Pool trägt jede sichtbare Quelle der Gasse, bis er voll ist (LICHT_POOL.plaetze) — ≥ 1 ließ 4 sichtbare Köpfe mit
    // einem einzigen hellen durch, die Klasse „1 von 6 Laternen im Bild hell“
    const poolSoll = Math.min(m.quellenGasse || 0, m.poolPlaetze || 0);
    if (!(m.poolGasse >= 1 && m.poolGasse >= poolSoll))
        fehl.push(`Licht-Pool der Gasse nachts ${m.poolGasse} Quellen des Orts (Soll ≥ ${Math.max(1, poolSoll)})`);
    return fehl;
}
const GT_SOLL_M = 60;

// DIE SICHT DER POSE (Teil O, w28-stadt-grammatik — rein, reist mit `lokal` und `kasten` in die Seite): die Pose des Orts
// (`_ortPose` {x, z, ziel}) blickt waagrecht in der Höhe des Auges `augeY` auf die Fassade `ziel` — so stellt die Probe die
// Kamera des Spiels (gpu-probe `bild:<ort>`, Neigung 0). Je 0,25 m des Strahls liegt das Gelände (`hoehe`, die Höhe der Welt)
// nicht über ihm und kein Grundriss (`rechtecke` {cx, cz, phi, ex, ez}, Welt) in ihm; der Bau, an dessen Wand das Ziel liegt,
// zählt nicht. Liefert die Täter beim Namen (leer = frei). Die Abnahme des Bilds nannte beides erst am Bild der Karte
// („Blickziel verdeckt von bauSatz in 24.17 m“ an stadt-voll, b61450be; „verdeckt von an Punkt 1 Gelände“ am Mutanten der Fassade).
function poseSicht(pose, augeY, hoehe, rechtecke) {
    const [dx, dz] = [pose.ziel.x - pose.x, pose.ziel.z - pose.z];
    const d = Math.hypot(dx, dz);
    const wand = rechtecke.filter(
        (b) => Math.abs(kasten(b.cx, b.cz, b.phi, b.ex, b.ez, pose.ziel.x, pose.ziel.z)) > 0.05
    );
    let [gel, bau] = [null, null];
    for (let s = 0.25; s < d - 0.05 && !(gel && bau); s += 0.25) {
        const [x, z] = [pose.x + (dx * s) / d, pose.z + (dz * s) / d];
        const h = hoehe(x, z);
        if (!gel && h > augeY) gel = `Gelände ${(h - augeY).toFixed(2)} m über dem Auge in ${s.toFixed(2)} m`;
        const k = bau ? -1 : wand.findIndex((b) => kasten(b.cx, b.cz, b.phi, b.ex, b.ez, x, z) < 0);
        if (k >= 0) bau = `ein Grundriss (${wand[k].cx.toFixed(1)} ${wand[k].cz.toFixed(1)}) in ${s.toFixed(2)} m`;
    }
    return [gel, bau].filter(Boolean);
}

// DAS DORF-LICHT DER GASSE (K10: ≥ 4 sichtbare Quellen im Nachtbild der Gasse) — rein:
// quellen = die brennenden Leuchtquellen des Orts mit Leib ([x, z] je Quelle, Welt), wege = die Wege des Plans ([[x, z], …]
// je Weg, Welt), haeuser = die Grundrisse mit Dach ({cx, cz, ex, ez, phi}, Welt), hfov = der waagrechte Öffnungswinkel des
// Bildes (rad). Die Gasse ist der Stand auf einem Weg-Punkt mit Blick längs des Wegs zu einem Punkt 12–40 m weiter, nie
// 2,5 m an einer Quelle (das Bild der Abnahme, x-gasse3 der Karte); sichtbar ist eine Quelle 2–100 m vor dem Auge im
// Öffnungswinkel, deren Sicht-Linie keinen Grundriss schneidet (die Laterne trägt ihr Licht in 3,6 m, jede Traufe liegt
// darüber). DIE QUELLE AN DER WAND (w28-stadt-grammatik): die Wandlaterne hängt `armM` vor der Wand ihres Hauses, unter seiner
// Traufe — im Grundriss mit Dach liegt sie bis GASSE_TRAUFE_M TIEF. Ihr Haus verdeckt sie dem nicht, der vor ihrer Wand steht:
// die Sicht-Linie liegt in diesem Grundriss nie tiefer als die Quelle selbst (wer durch das Haus sähe, läge tiefer). Bis hier
// verdeckte jeder Grundriss, den die Linie berührt — auch der eigene: die Linse sah nie eine Wandlaterne, und an der
// Fahrstraße der Stadt, wo vor der Bauflucht kein Mast steht, trägt die Wand das Licht („dorf 7 18 gruenderzeit“).
// Gewählt wird die Gasse mit den meisten sichtbaren Quellen (gleich viele: die nähere). Liefert { n, pose, je, verdeckt }.
const GASSE_TRAUFE_M = 1.5;
function gassenLicht(quellen, wege, haeuser, hfov) {
    const halb = hfov / 2;
    // die Tiefe eines Punkts im Grundriss (≤ 0: außen) und die größte Tiefe der Sicht-Linie in ihm (die Tiefe ist konkav längs
    // der Linie: Dreiteilung)
    const tiefe = (h, x, z) => {
        const [u, v] = lokal(h.cx, h.cz, h.phi, x, z);
        return Math.min(h.ex - Math.abs(u), h.ez - Math.abs(v));
    };
    const tiefste = (ax, az, bx, bz, h) => {
        let [lo, hi] = [0, 1];
        const d = (s) => tiefe(h, ax + (bx - ax) * s, az + (bz - az) * s);
        for (let i = 0; i < 40; i++) {
            const [m1, m2] = [lo + (hi - lo) / 3, hi - (hi - lo) / 3];
            if (d(m1) < d(m2)) lo = m1;
            else hi = m2;
        }
        return d((lo + hi) / 2);
    };
    const verdecktVon = (ax, az, bx, bz, h) => {
        if (!schneidet(ax, az, bx, bz, h)) return false;
        const tq = tiefe(h, bx, bz);
        return tq > GASSE_TRAUFE_M || tiefste(ax, az, bx, bz, h) > Math.max(tq, 0) + 0.05;
    };
    const schneidet = (ax, az, bx, bz, h) => {
        const [u0, v0] = lokal(h.cx, h.cz, h.phi, ax, az);
        const [u1, v1] = lokal(h.cx, h.cz, h.phi, bx, bz);
        let t0 = 0;
        let t1 = 1;
        for (const [p, d, e] of [
            [u0, u1 - u0, h.ex],
            [v0, v1 - v0, h.ez],
        ]) {
            if (Math.abs(d) < 1e-12) {
                if (Math.abs(p) > e) return false;
                continue;
            }
            let ta = (-e - p) / d;
            let tb = (e - p) / d;
            if (ta > tb) [ta, tb] = [tb, ta];
            t0 = Math.max(t0, ta);
            t1 = Math.min(t1, tb);
            if (t0 > t1) return false;
        }
        return true;
    };
    let best = null;
    for (const w of wege)
        for (let i = 0; i < w.length; i++)
            for (let j = 0; j < w.length; j++) {
                const [px, pz] = w[i];
                const [qx, qz] = w[j];
                const L = Math.hypot(qx - px, qz - pz);
                if (L < 12 || L > 40) continue;
                if (quellen.some(([x, z]) => Math.hypot(x - px, z - pz) < 2.5)) continue;
                const ux = (qx - px) / L;
                const uz = (qz - pz) / L;
                const je = [];
                let verdeckt = 0;
                for (const [x, z] of quellen) {
                    const d = Math.hypot(x - px, z - pz);
                    if (d < 2 || d > 100) continue;
                    if (Math.acos(Math.max(-1, Math.min(1, ((x - px) * ux + (z - pz) * uz) / d))) > halb) continue;
                    if (haeuser.some((h) => verdecktVon(px, pz, x, z, h))) {
                        verdeckt++;
                        continue;
                    }
                    je.push([Math.round(x * 10) / 10, Math.round(z * 10) / 10, Math.round(d * 10) / 10]);
                }
                const s = je.reduce((a, q) => a + q[2], 0);
                if (!best || je.length > best.n || (je.length === best.n && s < best.s))
                    best = { n: je.length, s, pose: [px, pz, qx, qz], je, verdeckt };
            }
    return best
        ? { n: best.n, pose: best.pose, je: best.je, verdeckt: best.verdeckt }
        : { n: 0, pose: null, je: [], verdeckt: 0 };
}
const GASSE_SOLL = 4;

// DIE STADT ALS NETZ VON KACHELN (w28-stadt-funktion · w28-stadt-netz; fachwerk `viertelWort`, `kachelNetz`, `exportSettlement`
// mit dp.kachel — rein): (a) das Ring-Gesetz an acht Städten von der Wand bis zum Tausendfachen — die Summe aller Kacheln ist die
// Zahl des Worts (die Dichte fällt zum Rand, `STADT_FORM`), keine fasst mehr als `jeKachel`, jede außer der Mitte trägt das Erbe,
// zweimal gefragt dasselbe Wort (zustandslos), bis 1000 Kacheln keine zwei mit demselben Samen; bis zur Wand ist das Wort EIN
// Plan; (b) DIE NAHT an 400 zufälligen Nachbar-Paaren: die Tore der gemeinsamen Kante aus beiden Kacheln gleich, die Straße
// kommt senkrecht an, ihre Klasse ist beidseits dieselbe; (c) am kleinen Stand (Wand `klein` 40, je Kachel 30 — dasselbe
// Gesetz, der Export kostet Bruchteile): das Wort über der Wand ist die Mitte seiner Stadt und nennt sie (`stadt`, `kachel`,
// `netz`), das Wort an der Wand trägt kein Feld davon, kein Los steht außerhalb der Kachel, die Mauer steht nur an Kanten des Kerns
// zur Vorstadt (`mauerTeil`), und eine Kachel steht in Region, Jahr und Spanne der Mitte. `o.wort` und `o.netz` tauschen das Gesetz (die
// Mutanten des Selbsttests). Rückgabe { gruen, fehl, je }.
function stadtFunktion(FC, o = {}) {
    const SF = FC.STADT_FUNKTION, SN = FC.STADT_NETZ, wort = o.wort || FC.viertelWort, netz = o.netz || FC.kachelNetz, fehl = [], je = [];
    const pruef = (staedte) => {
        for (const nH of staedte) {
            const R = FC.stadtRinge(nH), samen = new Map();
            let n = 0, sum = 0, hi = 0;
            for (let i = -R - 1; i <= R + 1; i++)
                for (let k = -R - 1; k <= R + 1; k++) {
                    const v = wort(7, nH, i, k);
                    if (!v) continue;
                    n++, (sum += v.nH), (hi = Math.max(hi, v.nH));
                    if ((i || k) && !(v.erbe && isFinite(v.erbe.jahr) && isFinite(v.erbe.spanne))) fehl.push(`Stadt ${nH}: Kachel ${i},${k} ohne Erbe`);
                    if (JSON.stringify(v) !== JSON.stringify(wort(7, nH, i, k))) fehl.push(`Stadt ${nH}: Kachel ${i},${k} trägt beim zweiten Fragen ein anderes Wort`);
                    if (samen.has(v.seed)) fehl.push(`Stadt ${nH}: Kachel ${i},${k} und ${samen.get(v.seed)} tragen denselben Samen ${v.seed}`);
                    if (R <= 10) samen.set(v.seed, i + "," + k);
                }
            if (sum > nH || nH - sum >= SF.rest) fehl.push(`Stadt ${nH} (Wand ${SF.voll}): die Kacheln tragen ${sum} Häuser`);
            if (nH > SF.voll && hi > SN.jeKachel) fehl.push(`Stadt ${nH}: eine Kachel mit ${hi} Häusern über ${SN.jeKachel}`);
            if (nH <= SF.voll && n !== 1) fehl.push(`das Wort ${nH} bis zur Wand ${SF.voll} ist ${n} Pläne`);
            je.push(`${nH} → ${n} Σ ${sum}`);
        }
    };
    const V = SF.voll, K = SN.jeKachel, M = FC.SIEDLUNG.cellM;
    pruef([V, V + 1, V + SF.rest, 2 * V, 3 * V + 77, 9 * K, 10 * V, 1000 * V]);
    // (b) die Naht
    const zufall = (a, b) => ((Math.imul(a + 11, 0x9e3779b1) ^ Math.imul(b + 5, 0x85ebca6b)) >>> 0) % 2001;
    for (let q = 0; q < 400; q++) {
        const [s, ix, iz, ost] = [zufall(q, 1), zufall(q, 2) - 1000, zufall(q, 3) - 1000, q % 2 === 0];
        const A = netz(s, ix, iz), B = ost ? netz(s, ix + 1, iz) : netz(s, ix, iz + 1);
        const [a, b] = ost ? [A.tore.o, B.tore.w] : [A.tore.s, B.tore.n];
        if (JSON.stringify(a) !== JSON.stringify(b)) { fehl.push(`NAHT ${s} ${ix},${iz} ${ost ? "Ost" : "Süd"}: die Tore der Kante sind aus beiden Kacheln verschieden`); break; }
        const an = (N, ende, soll) => N.edges.filter((e) => { const p = e.pts[ende ? e.pts.length - 1 : 0]; return Math.abs((ost ? p.x : p.z) - soll) < 1e-6; });
        const [eA, eB] = [an(A, true, M / 2), an(B, false, -M / 2)];
        const schief = (e, ende) => { const P = e.pts, [p, r] = ende ? [P[P.length - 2], P[P.length - 1]] : [P[0], P[1]]; return Math.abs(Math.atan2(r.z - p.z, r.x - p.x) - (ost ? 0 : Math.PI / 2)); };
        if (eA.length !== a.length || eB.length !== a.length || eA.some((e, j) => e.gen !== eB[j].gen || schief(e, true) > 0.02 || schief(eB[j], false) > 0.02)) { fehl.push(`NAHT ${s} ${ix},${iz}: die Straßen treffen sich an der Kante nicht (Zahl, Klasse oder Richtung)`); break; }
    }
    // (d) DIE FORM IM BILD (`STADT_FORM`, w28-stadt-form) an der Stadt von 33 vollen Kacheln: KEIN STAB — in den Massen der
    // Stufe 1 (`kachelMassen`, Mitte · Kern · Rand) trägt jedes Haus seine Traufe auf seiner Tiefe (Traufe / Tiefe ≤ `stab`: der
    // Grundriss wächst mit den Geschossen, ein hohes Haus steht auf einem tiefen Platz); KEINE TON-KANTE — der Ton hängt an der
    // LAGE (`stadtTonAn`): über fünf Kanten zweier Kacheln springt er auf 2 m um höchstens 6 von 255 (eine Stufe trägt 3), das
    // Feld lebt, und die Massen lesen es an ihrem Ort (ohne `tonHub`: in der Kachel neben der Mitte bleiben die Häuser an der
    // Mitte, wie sie sind — dort ist das Feld 0 —, die am Rand wechseln die Farbe). `o.massen` und `o.tonAn` tauschen das Gesetz.
    const massen = o.massen || FC.kachelMassen, tonAn = o.tonAn || FC.stadtTonAn, FO = FC.STADT_FORM, gross = 33 * K;
    for (const [i, k] of [[0, 0], [1, 0], [2, 1]]) {
        const m = massen(7, gross, i, k);
        if (!m) { fehl.push(`FORM: die Stadt ${gross} trägt keine Kachel ${i},${k}`); continue; }
        let stab = 0, wer = "";
        for (let h = 0; h < m.n; h++) { const [d, t] = [m.lage[h * 7 + 4], m.lage[h * 7 + 5]]; if (t / d > FO.stab + 1e-3 && !stab++) wer = `${t.toFixed(1)} m auf ${d.toFixed(1)} m`; }
        if (stab) fehl.push(`FORM STAB: ${stab} von ${m.n} Häusern der Kachel ${i},${k} tragen Traufe / Tiefe über ${FO.stab} (${wer})`);
    }
    const grau = { putz: 0x808080, ziegel: 0x808080 }, rot = (c) => [(c.putz >> 16) & 255, (c.ziegel >> 16) & 255];
    let [sprung, wo, lebt] = [0, "", false];
    for (const [i, k, di, dk] of [[1, 0, 1, 0], [2, 1, 0, 1], [-2, -1, 1, 0], [0, 3, 0, 1], [3, 3, 1, 0]]) {
        const [A, B] = [tonAn(7, i, k, M), tonAn(7, i + di, k + dk, M)];
        for (let q = 0; q < 32; q++) {
            const t = ((q + 0.5) / 32 - 0.5) * M, [a, b] = [rot(A(grau, di ? M / 2 - 1 : t, dk ? M / 2 - 1 : t)), rot(B(grau, di ? 1 - M / 2 : t, dk ? 1 - M / 2 : t))];
            const d = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
            if (d > sprung) [sprung, wo] = [d, `${i},${k} → ${i + di},${k + dk}`];
            lebt = lebt || a[0] !== 128 || a[1] !== 128;
        }
    }
    if (sprung > 6) fehl.push(`FORM TON-KANTE: über die Kante ${wo} springt der Ton auf 2 m um ${sprung} von 255 — er hängt an der Kachel, nicht an der Lage`);
    if (!lebt) fehl.push("FORM TON: das Feld der Viertel-Töne ist an fünf Kanten überall 0");
    {
        const hub = FO.tonHub, mit = massen(7, gross, 1, 0);
        let ohne = null;
        FO.tonHub = 0;
        try { ohne = massen(7, gross, 1, 0); } finally { FO.tonHub = hub; }
        let [gleich, anders] = [0, 0];
        if (mit && ohne) for (let h = 0; h < mit.n; h++) Array.from(mit.ton.subarray(h * 6, h * 6 + 6)).some((v, j) => Math.abs(v - ohne.ton[h * 6 + j]) > 1e-5) ? anders++ : gleich++;
        if (!gleich || !anders) fehl.push(`FORM TON: die Massen der Kachel 1,0 lesen das Feld nicht an ihrem Ort (ohne tonHub ${anders} Häuser anders, ${gleich} gleich — Soll: beides)`);
    }
    // (c) der Export am kleinen Stand
    const klein = o.klein || 40, gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    [SF.voll, SN.jeKachel] = [klein, 30];
    try {
        pruef([klein + SF.rest, 3 * klein, 30 * klein]);
        const stadt = 3 * klein, [ueber, wand] = [FC.exportSettlement({ seed: 7, nH: stadt }), FC.exportSettlement({ seed: 7, nH: klein })];
        const st = ueber.stadt, ka = ueber.kachel;
        if (!st || st.nH !== stadt || !ka || ka.i || ka.k || !ueber.netz) fehl.push(`der Export über der Wand nennt seine Stadt nicht (${JSON.stringify(st)} · ${JSON.stringify(ka)})`);
        if (wand.stadt || wand.kachel || wand.netz) fehl.push("der Export an der Wand trägt ein Feld der Stadt");
        if (!gleich(ueber, FC.exportSettlement({ kachel: { samen: 7, nH: stadt, i: 0, k: 0 } }))) fehl.push("das Wort über der Wand ist nicht die Mitte seiner Stadt");
        let v = null, ik = null;
        for (let i = -1; i <= 1 && !v; i++) for (let k = -1; k <= 1 && !v; k++) if ((i || k) && (v = wort(7, stadt, i, k))) ik = [i, k];
        const p = v && FC.exportSettlement({ kachel: { samen: 7, nH: stadt, i: ik[0], k: ik[1] } });
        if (!p) fehl.push("der erste Ring trägt keine Kachel");
        else {
            if (p.region !== ueber.region || p.jahr !== ueber.jahr || p.spanne !== ueber.spanne) fehl.push(`die Kachel steht in ${p.region} ${p.jahr}+${p.spanne}, die Mitte in ${ueber.region} ${ueber.jahr}+${ueber.spanne}`);
            const aus = p.slots.filter((q) => { const c = q.obb, r = Math.hypot(c.ex, c.ez); return Math.abs(c.cx) - r > M / 2 || Math.abs(c.cz) - r > M / 2; }).length;
            if (aus) fehl.push(`${aus} Lose der Kachel ${ik} stehen außerhalb von ihr`);
            // DIE MAUER STEHT UM DEN KERN: eine Kachel ab `mauerTeil` der vollen Zahl ist Kern, ihr Rand ist die Kante zu einem
            // Nachbarn darunter (die Vorstadt liegt vor der Mauer) — an der Mitte und an der Kachel des Rings: je Kante das Gesetz,
            // je Mauer-Stück die Kante, an der es liegt
            const imKern = (a, b) => ((w) => !!w && w.nH >= FC.STADT_FORM.mauerTeil * SN.jeKachel)(wort(7, stadt, a, b));
            const e = M / 2 - SN.mauerInnenM;
            let kanten = 0;
            for (const [plan, a, b] of [[ueber, 0, 0], [p, ik[0], ik[1]]]) {
                const rand = plan.kachel.rand;
                for (const s of (plan.mauer || { segs: [] }).segs) {
                    const k = Math.abs(s.x0 + e) < 0.01 && Math.abs(s.x1 + e) < 0.01 ? "w" : Math.abs(s.x0 - e) < 0.01 && Math.abs(s.x1 - e) < 0.01 ? "o" : Math.abs(s.z0 + e) < 0.01 && Math.abs(s.z1 + e) < 0.01 ? "n" : "s";
                    if (!rand[k]) { fehl.push(`die Mauer der Kachel ${a},${b} steht an der Kante ${k}, die kein Rand des Kerns ist`); break; }
                }
                for (const [k, di, dk] of [["w", -1, 0], ["o", 1, 0], ["n", 0, -1], ["s", 0, 1]]) {
                    if (rand[k] !== (imKern(a, b) && !imKern(a + di, b + dk))) fehl.push(`der Rand ${k} der Kachel ${a},${b} widerspricht dem Gesetz der Kacheln`);
                    kanten += rand[k] ? 1 : 0;
                }
            }
            if (!imKern(0, 0) || !kanten) fehl.push(`die Stadt ${stadt} trägt keinen Rand des Kerns (Mitte im Kern: ${imKern(0, 0)}, Rand-Kanten an Mitte und Ring-Kachel: ${kanten})`);
        }
    } finally {
        [SF.voll, SN.jeKachel] = [V, K];
    }
    return { gruen: !fehl.length, fehl, je };
}

// DAS WACHE GLAS IST EINE QUELLE (nacht-fenster-glas, die Klasse „jede Quelle der Nacht geht durch den EINEN Lichtweg“; Leser:
// gate:settlement Teil F, die Familie des Dorf-Lichts): die Klasse im vm (`ladeKlasse`: der Stamm des Baums, wahlweise ein Täter
// `taeter` am Text — die Kette [[glied, alt, neu], …]) über einem Wirt ohne Renderer. Die Häuser des Plans `dp` (fachwerk `FC`
// exportSettlement, ihre Hülle aus `buildInstance` Stufe 0) treten in den Bestand (`_blockerEintritt`) und bekommen die Hülle über
// den EINEN Eintritt (`_hausHuelleSetzen`); um Mitternacht (die Sonne 30° unter dem Horizont) fragt die Linse die Quellen der Welt
// (`_leuchtQuellen` über den ganzen Ort) und die Wahl des Pools (`_leuchtWahl`). Je Haus: seine Zeilen `fenster` (das wache Glas
// des Gesetzbuchs, fachwerk `fensterZeile`), das Verzeichnis „licht“, je Zeile GENAU EINE Quelle „fenster“ ihrer Kennung, ihr Ort
// die Mitte des Glases 0,05 m vor der Wand im Raum der Decken desselben Hauses (`_deckenVon`: die Lage, die Dach, Regen und Schatten
// am Haus lesen) und 0,5 m vor ihr kein fester Teil der Hülle; kein Glas auf einem Platz des Pools; je Fenster sein Fleck in der
// Karte (`_lichtKarteFleck`: Zellen davor, keine dahinter). `rohe`: die gebauten Hüllen eines früheren Laufs (ein Täter am Stamm
// teilt das Gesetzbuch). → { haeuser, wach, jeHaus, quellen, verzeichnis, wahlGlas, wahlAlle, zellen, hinten, fehl, rohe, ms }
function fensterLicht(root, { FC, dp = { seed: 5 }, taeter = null, haeuser = Infinity, rohe = null } = {}) {
    const t0 = Date.now();
    const S = require("./stamm.cjs");
    const vm = require("vm");
    rohe =
        rohe ||
        FC.exportSettlement(dp)
            .slots.slice(0, haeuser)
            .map((s) => {
                const g = FC.buildInstance(s.kultur, s.seed, 0, s.ov);
                g.traverse((o) => o.geometry && o.geometry.dispose());
                return { s, huelle: g.userData.__huelle };
            });
    const { AnazhRealm: A, ctx } = S.ladeTaeter(root, taeter);
    const r = Object.create(A.prototype);
    const cam = vm.runInContext("new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 2000)", ctx);
    r.state = { architectures: [], blueprints: {}, materials: {}, timeOfDay: 0, camera: cam };
    Object.assign(r, {
        _bildZeit: 0,
        _augenLeuchte: null,
        _portalLeuchte: null,
        _sonnenRichtung: () => ({ y: -0.5 }), // Mitternacht: die Sonne 30° unter dem Horizont
        _lodAuge: () => null,
        _brandGlutUm: () => {},
        _tatIndex: () => ({ lava: [] }),
        _lavaSpanne: () => [1000, 1400],
        _stahlGlut: () => null,
        _foundryPresetForEntry: () => null,
        _populateBlockerAABBs: () => {},
        _grundrissRaeumen: () => {},
    });
    const haus = rohe.map(({ s, huelle }, i) => {
        const e = { type: "haus_" + s.kultur, kind: "haus", position: { x: s.x, y: 0, z: s.z }, rotationY: s.phi, scale: 1 };
        e.name = `${s.kultur}#${i}@${Math.round(s.x)},${Math.round(s.z)}`;
        r.state.architectures.push(e);
        r._blockerEintritt(e);
        r._hausHuelleSetzen(e, A._huellePacken(huelle, "fenster-licht:" + s.kultur));
        return e;
    });
    const fehl = [];
    const n = haus.length || 1;
    const [mx, mz] = haus.reduce((a, e) => [a[0] + e.position.x / n, a[1] + e.position.z / n], [0, 0]);
    const Q = r._zeitplanFest(() => r._leuchtQuellen(mx, 1.7, mz, 1e4, null));
    const glas = Q.filter((q) => q.quelle === "fenster");
    const licht = new Set(r._blockerMit("licht"));
    let wach = 0;
    let verzeichnis = 0;
    for (const e of haus) {
        const zeilen = (e._hausHuelle && e._hausHuelle.fenster) || [];
        wach += zeilen.length;
        if (licht.has(e)) verzeichnis++;
        if (licht.has(e) !== zeilen.length > 0)
            fehl.push(`${e.name}: ${zeilen.length} wache Fenster, im Verzeichnis „licht“ ${licht.has(e)} (\`_hausHuelleSetzen\`)`);
        // der Raum der Decken desselben Hauses (`_deckenVon`, die erste Decke: ihre Mitte in Welt und Haus, Gier, Oberkante)
        const D = r._deckenVon(e)[0];
        const dz0 = e._hausHuelle && e._hausHuelle.decken && e._hausHuelle.decken[0];
        const sk = e._hausHuelleSkala || 1;
        const welt = (p) => {
            const [ux, uz] = [p[0] - (dz0[0] + dz0[1]) / 2, p[2] - (dz0[2] + dz0[3]) / 2];
            return [D.x + (ux * D.co + uz * D.si) * sk, D.y + (p[1] - dz0[4]) * sk, D.z + (uz * D.co - ux * D.si) * sk];
        };
        const fest = A._huelleVon(e._hausHuelle, "fest", "fenster-licht") || [];
        const drin = (p) => fest.some((t) => t.c && [0, 1, 2].every((a) => Math.abs(p[a] - t.c[a]) <= t.h[a]));
        zeilen.forEach((z, i) => {
            const qs = glas.filter((q) => q.id && q.id.haus === e && q.id.fenster === i);
            if (qs.length !== 1) {
                fehl.push(`${e.name} Fenster ${i} [${z.slice(0, 3)}]: ${qs.length} Quellen in \`_leuchtQuellen\``);
                return;
            }
            const q = qs[0];
            const [nx, nz] = [z[5], z[6]];
            const nw = D ? [nx * D.co + nz * D.si, 0, nz * D.co - nx * D.si] : [NaN, 0, NaN];
            const soll = D ? welt(z).map((v, a) => v + nw[a] * 0.05) : [NaN, NaN, NaN];
            const ab = Math.max(Math.abs(q.x - soll[0]), Math.abs(q.y - soll[1]), Math.abs(q.z - soll[2]));
            const nab = Math.max(Math.abs(q.normale[0] - nw[0]), Math.abs(q.normale[2] - nw[2]));
            const frei = !drin([z[0] + nx * 0.5, z[1], z[2] + nz * 0.5]);
            if (!(ab < 1e-6 && nab < 1e-9 && frei))
                fehl.push(`${e.name} Fenster ${i}: die Quelle steht nicht 0,05 m vor ihrem Glas (Ort ±${ab.toFixed(3)} m, Normale ±${nab.toFixed(3)}, 0,5 m davor frei ${frei})`);
        });
        for (const q of glas) if (q.id.haus === e && !(q.id.fenster < zeilen.length)) fehl.push(`${e.name}: Quelle ohne Zeile (${q.id.fenster})`);
    }
    // DIE WAHL: das Glas nimmt nie einen Platz, die Karte trägt es (`pool.alle`)
    cam.position.set(mx, 1.7, mz);
    cam.lookAt(mx + 1, 1.7, mz);
    cam.updateMatrixWorld(true);
    const pool = { t: -Infinity, uhr: -Infinity, x: NaN, y: NaN, z: NaN, wahl: [], alle: [] };
    r._leuchtWahl(pool, cam, 0);
    const wahlGlas = pool.wahl.filter((q) => q.normale).length;
    const wahlAlle = pool.alle.filter((q) => q.quelle === "fenster").length;
    // DER FLECK JE FENSTER in einer Karte um es (`_lichtKarteFleck`, der Boden auf 0)
    const K = A.LICHT_KARTE;
    const t = K.texel;
    const G = { boden: new Float32Array(t * t), d: [new Float64Array(t * t * 3), new Float64Array(t * t * 3)], c: new Float64Array(t * t * 3), e: new Float64Array(t * t) }; // prettier-ignore
    r._lichtKarteZ = { flecken: 0 };
    let [zellen, hinten] = [0, 0];
    for (const q of glas) {
        for (const a of [G.d[0], G.d[1], G.c, G.e]) a.fill(0);
        const [gx, gz] = [Math.round(q.x / K.zelleM) * K.zelleM, Math.round(q.z / K.zelleM) * K.zelleM];
        const I = r._leuchtStaerke(q, 0, true);
        r._lichtKarteFleck(G, gx, gz, { q, I, x: q.x, y: q.y, z: q.z }, I);
        for (let j = 0; j < t; j++)
            for (let i = 0; i < t; i++) {
                if (!(G.e[j * t + i] > 0)) continue;
                zellen++;
                const [cx, cz] = [gx + (i + 0.5 - t / 2) * K.zelleM, gz + (j + 0.5 - t / 2) * K.zelleM];
                if (q.normale[0] * (cx - q.x) + q.normale[2] * (cz - q.z) <= 0) hinten++;
            }
    }
    // DER SCHUB DER MITTE (nacht-licht-klasse, `_lichtKarteSchub`): die Karte steht um das Auge (`_lichtKarteTakt` über die Wahl
    // `pool`, ein Boden mit Relief), das Auge rückt 17 m / 9 m — die geschobene Karte ist Zelle für Zelle und Halbwert für Halbwert
    // die ganz gebaute an derselben Mitte.
    const LK = { gitter: { image: { data: new Uint16Array(t * 3 * t * 4) }, needsUpdate: false }, mitte: { value: { set() {} } } };
    r.state.atmoUniforms = { lichtKarte: LK };
    r.getTerrainHeightAt = (x, z) => 2 * Math.sin(x / 9) + Math.cos(z / 7);
    const kp = { halter: [], blende: [], alle: pool.alle };
    const steht = () => {
        for (let k = 0; k < 40000; k++) {
            const Z = r._lichtKarteZ;
            if (Z && Z.g && !Z.bau && !(Z.offen > 0) && !(Z.teil && Z.teil.length) && k > 2) return k;
            r._lichtKarteTakt(kp, cam);
        }
        return -1;
    };
    r._lichtKarteZ = null;
    steht();
    cam.position.set(mx + 17, 1.7, mz + 9);
    const tSchub = Date.now();
    steht();
    const geschoben = { e: Float64Array.from(r._lichtKarteZ.g.e), a: Uint16Array.from(LK.gitter.image.data), ms: Date.now() - tSchub };
    r._lichtKarteZ = null;
    const tGanz = Date.now();
    steht();
    const schub = { ungleich: 0, halbUngleich: 0, licht: 0, msSchub: geschoben.ms, msGanz: Date.now() - tGanz };
    const Ge = r._lichtKarteZ.g.e;
    for (let i = 0; i < Ge.length; i++) {
        if (Ge[i] > 0) schub.licht++;
        if (Math.abs(geschoben.e[i] - Ge[i]) > 1e-9 * (1 + Math.abs(Ge[i]))) schub.ungleich++;
    }
    for (let i = 0; i < geschoben.a.length; i++) if (geschoben.a[i] !== LK.gitter.image.data[i]) schub.halbUngleich++;
    // DER UNTERSCHIED LÄDT HÖCHSTENS `zellenJeBild` (nacht-licht-klasse): auf der stehenden Karte kommt eine Wandlaterne (70 m, ihr
    // Fleck deckt die ganze Karte) — EIN Takt lädt höchstens `zellenJeBild` Zellen und eine Zeile hoch (`_lichtKarteHalb`); bis hier
    // schrieb ihr Fleck bis zur Frist und lud jede Zeile in denselben Takt (das Dorf: ein Fleck 21,9 ms). Die Uhr der Linse steht
    // (`performance.now` 0, stamm.cjs): die Frist bindet hier nie, allein der Rest
    kp.alle = [...pool.alle, { id: "linse-wandlaterne", quelle: "laterne", L: FC.LICHT_GESETZ.wandlaterne, masse: 1, x: mx + 3, y: 3, z: mz + 3 }];
    const halbEcht = r._lichtKarteHalb;
    let hoch = 0;
    r._lichtKarteHalb = function (G2, g2, [i0, j0, i1, j1]) {
        hoch += (i1 - i0 + 1) * (j1 - j0 + 1);
        return halbEcht.apply(this, arguments);
    };
    const unterschied = { hoch: 0, darf: K.zellenJeBild + t, takte: 0 };
    try {
        r._lichtKarteTakt(kp, cam);
        unterschied.hoch = hoch;
        unterschied.takte = steht();
    } finally {
        r._lichtKarteHalb = halbEcht;
    }
    return {
        haeuser: haus.length,
        wach,
        jeHaus: +(wach / n).toFixed(2),
        quellen: glas.length,
        verzeichnis,
        wahlGlas,
        wahlAlle,
        zellen: glas.length ? Math.round(zellen / glas.length) : 0,
        hinten,
        schub,
        unterschied,
        fehl,
        rohe,
        ms: Date.now() - t0,
    };
}
// Das Urteil der Linse (rein): die verfehlten Namen (leer = gehalten).
function fensterUrteil(m) {
    const fehl = m.fehl.slice(0, 6);
    if (m.fehl.length > 6) fehl.push(`… ${m.fehl.length - 6} weitere`);
    if (!(m.wach > 0)) fehl.push("kein waches Fenster im Plan — die Linse sieht keinen Täter");
    if (m.quellen !== m.wach) fehl.push(`${m.quellen} Quellen „fenster“ für ${m.wach} wache Fenster (\`_leuchtQuellen\`)`);
    if (m.wahlGlas) fehl.push(`${m.wahlGlas} Quellen mit Normale auf einem Platz des Pools (\`_leuchtWahl\`)`);
    if (!(m.wahlAlle > 0)) fehl.push("die Wahl am Ort trägt kein Glas (`_leuchtWahl` → `pool.alle`)");
    if (m.hinten) fehl.push(`${m.hinten} Zellen hinter der Wand tragen Licht (\`_lichtKarteFleck\`)`);
    if (!(m.zellen > 0)) fehl.push("kein Fleck des Glases in der Karte (`_lichtKarteFleck`)");
    const S = m.schub;
    if (!(S && S.licht > 0)) fehl.push("die Karte um das Auge trägt kein Licht — der Schub ungeprüft (`_lichtKarteTakt`)");
    else if (S.ungleich || S.halbUngleich)
        fehl.push(`die geschobene Karte ist nicht die ganz gebaute: ${S.ungleich} Zellen, ${S.halbUngleich} Halbwerte (\`_lichtKarteSchub\`)`);
    const U = m.unterschied;
    if (!(U && U.hoch > 0)) fehl.push("die Wandlaterne lädt nichts hoch — der Unterschied ungeprüft (`_lichtKarteTakt`)");
    else if (U.hoch > U.darf)
        fehl.push(`ein Takt des Unterschieds lädt ${U.hoch} Zellen hoch, erlaubt ${U.darf} (\`_lichtKarteFleck\` ohne Rest)`);
    return fehl;
}
// DIE TÄTER DER LINSE (ihr Selbsttest, gate:settlement --selftest): der Zweig des Glases fehlt in den Quellen, das Glas nimmt einen
// Platz des Pools, der Fleck strahlt hinter die Wand (ohne Lambert)
const FENSTER_TAETER = {
    "ohne Glas-Zweig": [["_leuchtQuellen", "if (fensterAn)", "if (false)"]],
    "Glas auf dem Platz": [["_leuchtWahl", "if (!s.normale && pool.wahl.push(s)", "if (pool.wahl.push(s)"]],
    "ohne Lambert": [["_lichtKarteFleck", "const N = s.q.normale;", "const N = null;"]],
    // der Schub trägt die Summe E ohne ihren Schritt (nacht-licht-klasse: `schiebe(g.e)` — der Versatz NaN, das Band leer)
    "Schub ohne Schritt": [["_lichtKarteSchub", "e: schiebe(g.e, 1),", "e: schiebe(g.e),"]],
    // der Fleck schreibt bis zur Frist ohne den Rest der Zellen (nacht-licht-klasse: das Dorf lud 19 881 Zellen in einen Takt)
    "Fleck ohne Rest": [["_lichtKarteFleck", "|| (j - jA) * (i1 - i0 + 1) >= zellen)", "|| false)"]],
};

module.exports = {
    fensterLicht,
    fensterUrteil,
    FENSTER_TAETER,
    stadtFunktion,
    gassenGefaelle,
    erdbauMedian,
    dorfZugAmOrt,
    belagUrteil,
    lokal,
    kasten,
    ortUrteil,
    slotHuelle,
    POOL_AUSSER_RANG,
    poolZaehlen,
    ortVerdikt,
    GT_SOLL_M,
    poseSicht,
    gassenLicht,
    GASSE_SOLL,
};
