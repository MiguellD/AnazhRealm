// diag-settlement.cjs (gate:settlement) — Teil Z (`--nur-z` allein): das Rang-Gesetz (`rangZensus`) · N: der Export
// deterministisch und eingefroren (spec/asset-contract/v6/golden/siedlung.json, gemintet nur ohne Datei) · B (Browser): Worker,
// Slots am Anker, Wasser- und fail-closed-Wand, Erlebnis-Schichten · C: die Auto-Zellen · O: der Ort auf dem Gelände.
// --selftest: jede Wand feuert an injizierten Brüchen.
const { statikServer, waitFor, ROOT: root, hauptLauf, nullSeite, pruefer } = require("./lib/welt-boot.cjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const goldenDir = path.join(root, "spec/asset-contract/v6/golden");
const goldenFile = path.join(goldenDir, "siedlung.json");

const { errs, check } = pruefer();
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Kanonischer Fingerabdruck eines Exports: das volle JSON (Slots + benannte Schichten).
function fingerprint(plan) {
    return sha(JSON.stringify(plan));
}

// ===== TEIL Z (siedlung.K2): je Saat ein zufälliger Spawn (±8 km) und um ihn 32 × 32 km Welt-Zellen, jede durch das Gesetz
// (`siedlungsZelle`). Z1: binnen 2 km eine Stadt ≥ stadt, deren Export die Mauer trägt. Z3 ZIPF (die Zeile `ZIPF {…}`, die
// Station siedlung.K2#2): der Exponent ζ von N(≥ s) ∝ s^−ζ je Fenster nach Gabaix-Ibragimov — ln(Rang − ½) = a − ζ·ln nH über
// die Orte ab der ersten Rang-Stufe, der Rang einer Größe ist N(≥ s) (gleich große teilen ihn: die Wand des DORF ist EIN
// Punkt, keine erfundene Reihe) —, sein Mittel und das Intervall [kleinste, größte] über die Saaten: über 8 deckt es den
// Median mit 1 − 2 · 0,5⁸ = 99,2 % (die Ordnungs-Statistik der Kaskade); GRÜN nur ganz in 0,8–1,2, und jede Stadt aus Z1
// exportiert Mauer und Graph.
const mittel = (a) => a.reduce((s, v) => s + v, 0) / a.length;
function rangZensus(FC, o = {}) {
    const [S, N, Z] = [o.S || FC.SIEDLUNG, o.saaten || 8, { saaten: [], mitStadt: 0, graph: 0, je: [], n: [] }];
    const W = Math.round(32000 / S.cellM);
    let lcg = 7;
    const zuf = () => ((lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0) / 2 ** 32 - 0.5) * 16000;
    const fnv = (t) => [...t].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
    for (let k = 0; k < N; k++) {
        const [M, st, sx, sz, H] = [new Map(), [], zuf(), zuf(), (u, v) => fnv(`saat-${k}:dorf:${u},${v}`)];
        const [x0, z0] = [sx, sz].map((v) => Math.floor(v / S.cellM - W / 2));
        for (let i = 0; i < W * W; i++) {
            const q = S.rang.length && FC.siedlungsZelle(S, x0 + (i % W), z0 + ((i / W) | 0), H, M);
            if (q?.stufe) st.push([Math.hypot(q.x - sx, q.z - sz), q]);
        }
        let w = null;
        for (const [d, q] of st.filter((u) => u[0] <= 2000).sort((u, v) => u[0] - v[0])) {
            const x = (o.ex || FC.exportSettlement)({ seed: q.seed, nH: q.nH, epoche: FC.siedlungsEpoche(q.seed) });
            if (/stadt|metropole/.test(x.groesse) && x.mauer?.segs.length && (w = [d, x])) break;
        }
        [Z.mitStadt, Z.graph] = [Z.mitStadt + !!w, Z.graph + !!w?.[1].graph?.nE];
        Z.saaten.push(`saat-${k}: ${w ? `${w[1].groesse} ${w[1].slots.length} Slots ${Math.round(w[0])} m` : "keine"}`);
        const g = st.map((u) => u[1].nH).sort((u, v) => v - u);
        const x = g.map(Math.log);
        const dx = x.map((v) => v - mittel(x));
        const zeta = -mittel(g.map((v, i) => dx[i] * Math.log(g.lastIndexOf(v) + 0.5))) / mittel(dx.map((v) => v * v));
        Z.je.push(g[0] > g.at(-1) ? +zeta.toFixed(3) : NaN); // gleich groß: kein Rang-Gesetz, kein ζ
        Z.n.push(g.length);
    }
    const ki = [Math.min(...Z.je), Math.max(...Z.je)];
    const [zeta, ex] = [+mittel(Z.je).toFixed(3), `Mauer und Graph ${Z.graph}/${Z.mitStadt}`];
    const gruen = ki[0] >= 0.8 && ki[1] <= 1.2 && Z.mitStadt > 0 && Z.graph === Z.mitStadt;
    return Object.assign(Z, { ok: Z.mitStadt >= (N * 6) / 8, zipf: { zeta, ki, je: Z.je, n: Z.n, export: ex, gruen } });
}

// ===== TEIL J (siedlung.K4): DIE JAHRESRINGE — je Saat dieselbe Zelle unter 1320 · 1560 · 1860 · 1935 (die Epochen ohne Zahl:
// die Chronik ihrer Region, fachwerk `chronikJahr`). Je Paar (älter, jünger) die Überdeckung je Slot — der Anteil der 3 × 3
// Punkte seines Grundrisses (Ecken, Kanten-Mitten, Mitte), die ein Grundriss des jüngeren trägt —, über den älteren Kern
// gemittelt (Soll ≥ 0,8, die kleinste über Saaten und Paare). Die Epoche bestimmt Rolle, Bauart und Kleidung: jedes Baujahr
// bis zum Schnitt (jahr + spanne), kein Turm vor 1905, keine Halle vor 1850, die Kultur aus der Historie ihres Baujahrs
// (REGION_HIST; die Kirche trägt die Marke ihrer Epoche: vier Epochen, vier Kirchen), die Kleidung die Tracht der Epoche;
// moderne ergibt stadt und trägt den Turm. `ohneErbe` (die Mutante): jede Epoche ein eigener Plan mit ihrer Zahl.
const JAHRESRINGE = ["mittelalter", "hanse", "gruenderzeit", "moderne"];
function jahresringe(FC, o = {}) {
    const J = { paare: [], fehl: [] };
    for (const seed of o.saaten || [1, 2, 3, 5, 7, 11, 13, 17]) {
        const P = JAHRESRINGE.map((epoche) => (o.ex || FC.exportSettlement)({ seed, epoche, nH: o.ohneErbe && FC.DORF({ seed, epoche }).houses.length }));
        J.paare.push(
            P.slice(1).map((jung, k) => {
                const d = P[k].slots.flatMap(({ obb: b }) => [-1, 0, 1, -1, 0, 1, -1, 0, 1].map((u, i) => lokal(0, 0, -b.phi, u * b.ex, ((i / 3) | 0) * b.ez - b.ez)).map(([x, z]) => jung.slots.some((t) => FC.distPunktOBB(b.cx + x, b.cz + z, t.obb) < 1e-6)));
                return +(d.filter(Boolean).length / d.length).toFixed(3);
            })
        );
        const kirchen = new Set(P.map((x) => x.slots.find((s) => s.rolle === "kirche")?.kultur)).size;
        P.forEach((x, k) => {
            const fehl = (w) => J.fehl.push(`${seed}/${JAHRESRINGE[k]}: ${w}`);
            if (JSON.stringify(x.kleidung) !== JSON.stringify(FC.EPOCHEN[JAHRESRINGE[k]].tracht)) fehl(`Kleidung ${JSON.stringify(x.kleidung)}`);
            if (k === 3 && (x.groesse !== "stadt" || kirchen < 4 || !x.slots.some((s) => s.rolle === "turm"))) fehl(`${x.groesse}, ${kirchen} Kirchen`);
            for (const s of x.slots)
                if (s.baujahr > x.jahr + x.spanne || s.baujahr < { turm: 1905, halle: 1850 }[s.rolle] || !(/kirche|scheune/.test(s.rolle) || FC.REGION_HIST[x.region].reduce((q, [ab, n]) => (s.baujahr < ab ? q : n), []).includes(s.kultur)))
                    fehl(`${s.rolle} ${s.kultur} ${s.baujahr}`);
        });
    }
    return Object.assign(J, { min: Math.min(...J.paare.flat()) });
}

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
    gs.sort((a, b) => a - b);
    return +(100 * gs[Math.round(0.95 * (gs.length - 1))]).toFixed(1);
}

// ===== DAS URTEIL DES ORTS (Teil O, K10 — rein, mit Selbsttest) =====
// v2 = der Ort, wie die Welt ihn trägt (plan-lokal um `ort` {x, z}): je Haus x · z · phi · y (der Boden, absolut) · tuer
// (die Tür-Zeile: x, z, y = Diele, W × D = die Wand) · obb (der Grundriss mit Dach); roads (pts, w) und platz (cx, cz, phi, ex,
// ez). hoehe(x, z) = die Welt-Höhe an einem WELT-Ort. Gemessen:
//   Sockel je Haus = Boden − tiefster Grund unter dem Grundriss (9 × 9 Punkte; nie im hohlen Keller `grund.keller`, S4), Median
//   und Maximum;
//   Tür erreichbar = die Schwelle (Boden + Diele) liegt höchstens STUFE über dem Grund 0,3 m vor ihr, die 2 m geradeaus aus
//   der Tür tragen keine Stufe > STUFE (kein Absatz vor der Schwelle), und ein Gang über ein 0,5-m-Raster (Nachbarn mit
//   |Δh| ≤ STUFE, nie durch eine Wand oder den Keller) erreicht einen Weg oder den Platz. Das Raster entsteht nur, wo der Gang geht.
// der Punkt (x, z) im Rahmen um (cx, cz) mit der Drehung phi (reist mit `ortUrteil` als Quelltext in die Seite)
function lokal(cx, cz, phi, x, z) {
    const [c, s] = [Math.cos(phi || 0), Math.sin(phi || 0)];
    return [(x - cx) * c - (z - cz) * s, (x - cx) * s + (z - cz) * c];
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
    for (const sl of v2.slots) {
        const ob = sl.obb;
        if (!ob) continue;
        const c = Math.cos(ob.phi || 0);
        const s = Math.sin(ob.phi || 0);
        let mn = Infinity;
        for (let i = 0; i <= 8; i++)
            for (let j = 0; j <= 8; j++) {
                const lx = ob.ex * (i / 4 - 1);
                const lz = ob.ez * (j / 4 - 1);
                if (imKeller(sl, ob.cx + lx * c + lz * s, ob.cz - lx * s + lz * c)) continue;
                mn = Math.min(mn, hoehe(ox + ob.cx + lx * c + lz * s, oz + ob.cz - lx * s + lz * c));
            }
        sockel.push(Math.max(0, sl.y - mn));
    }
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
        const [vx, vz] = vor(tu.z - 0.3);
        const schwelle = sl.y + (Number.isFinite(tu.y) ? tu.y : 0) - hoehe(ox + vx, oz + vz);
        let vorStufe = 0;
        let hv = hoehe(ox + vx, oz + vz);
        for (let k = 1; k <= 8; k++) {
            const [px, pz] = vor(tu.z - 0.3 - 0.25 * k);
            const hk = hoehe(ox + px, oz + pz);
            vorStufe = Math.max(vorStufe, Math.abs(hk - hv));
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
        });
    });
    sockel.sort((a, b) => a - b);
    return {
        sockelMedian: sockel.length ? Math.round(1000 * sockel[sockel.length >> 1]) / 1000 : null,
        sockelMax: sockel.length ? Math.round(1000 * sockel[sockel.length - 1]) / 1000 : null,
        tuerenOk: tueren.filter((t) => t.ok).length,
        tuerenN: tueren.length,
        tuerenFehl: tueren.filter((t) => !t.ok),
        zellen: hz.size,
    };
}
// Das Verdikt des Orts (rein): die Zahlen der Abnahme gegen ihr Ziel — die Liste der verfehlten Namen (leer = gehalten).
function ortVerdikt(m) {
    const fehl = [];
    if (!(m.slots > 0 && m.haeuser === m.slots))
        fehl.push(
            `Häuser ${m.haeuser}/${m.slots} des Exports${m.wasserSlots ? ` (${m.wasserSlots} Slots im Wasser aus dem Plan v2 geworfen)` : ""}`
        );
    if (!(m.sockelMax === 0)) fehl.push(`Sockel max ${m.sockelMax} m (Median ${m.sockelMedian})`);
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
            `Stufe und Vorplatz bis zur Gasse auf dem Weg ${m.vorplatzOk}/${m.vorplatzN}${m.vorplatzFehl && m.vorplatzFehl.length ? ` (Haus ${m.vorplatzFehl.slice(0, 3).join(" · ")})` : ""}`
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
            `GT auf dem Dorfweg ${m.gtWeg} m in ${m.gtEnde > 0 ? m.gtEnde : 8} s (${gt8} m je 8 s, Soll ≥ ${GT_SOLL_M})`
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

// DAS DORF-LICHT DER GASSE (K10: ≥ 4 sichtbare Quellen im Nachtbild der Gasse) — rein:
// quellen = die brennenden Leuchtquellen des Orts mit Leib ([x, z] je Quelle, Welt), wege = die Wege des Plans ([[x, z], …]
// je Weg, Welt), haeuser = die Grundrisse mit Dach ({cx, cz, ex, ez, phi}, Welt), hfov = der waagrechte Öffnungswinkel des
// Bildes (rad). Die Gasse ist der Stand auf einem Weg-Punkt mit Blick längs des Wegs zu einem Punkt 12–40 m weiter, nie
// 2,5 m an einer Quelle (das Bild der Abnahme, x-gasse3 der Karte); sichtbar ist eine Quelle 2–100 m vor dem Auge im
// Öffnungswinkel, deren Sicht-Linie keinen Grundriss schneidet (die Laterne trägt ihr Licht in 3,6 m, jede Traufe liegt
// darüber). Gewählt wird die Gasse mit den meisten sichtbaren Quellen (gleich viele: die nähere). Liefert { n, pose, je,
// verdeckt }.
function gassenLicht(quellen, wege, haeuser, hfov) {
    const halb = hfov / 2;
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
                    if (haeuser.some((h) => schneidet(px, pz, x, z, h))) {
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

// DER GT AUF DEM DORFWEG: im Browser,
// durch den echten Spiel-Takt (`_gameLoopTick`, feste 60-Hz-Frames) und echte Tasten. Der Weg ist die längste Kette der
// Hauptwege (gen 0, Weg an Weg, wo der nächste beginnt, wo der vorige endet) des Plans, den die Welt trägt; der Wagen startet
// 2 m hinter ihrem Anfang in ihrer Richtung, der Fahrer hält W und lenkt (A/D) zum Punkt 6 m voraus auf der Kette. Gemessen:
// der Fortschritt längs der Kette in `sek` Sekunden (gtWeg), die gefahrene Strecke, die größte Ablage von der Kette und der
// Anteil der Frames auf dem Weg. Läuft im Browser (page.evaluate) — selbstgenügsam.
async function gtDorfweg(v2, anker, sek) {
    const res = {};
    try {
        const r = window.anazhRealm;
        const st = r.state;
        const wege = (v2.roads || []).filter((w) => w.gen === 0 && Array.isArray(w.pts) && w.pts.length > 1);
        const laenge = (w) => {
            let L = 0;
            for (let k = 1; k < w.pts.length; k++)
                L += Math.hypot(w.pts[k].x - w.pts[k - 1].x, w.pts[k].z - w.pts[k - 1].z);
            return L;
        };
        let best = null;
        for (const w0 of wege) {
            const kette = [w0];
            let L = laenge(w0);
            for (;;) {
                const ende = kette[kette.length - 1].pts[kette[kette.length - 1].pts.length - 1];
                const nx = wege.find(
                    (w) => !kette.includes(w) && Math.hypot(w.pts[0].x - ende.x, w.pts[0].z - ende.z) < 0.5
                );
                if (!nx) break;
                kette.push(nx);
                L += laenge(nx);
            }
            if (!best || L > best.L) best = { kette, L };
        }
        if (!best) return { err: "kein Hauptweg im Plan" };
        const P = [];
        for (const w of best.kette)
            for (const p of w.pts) {
                const q = { x: anker.x + p.x, z: anker.z + p.z };
                if (!P.length || Math.hypot(q.x - P[P.length - 1].x, q.z - P[P.length - 1].z) > 1e-3) P.push(q);
            }
        const S = [0];
        for (let k = 1; k < P.length; k++) S.push(S[k - 1] + Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z));
        const hw = (best.kette[0].w || 5) / 2;
        // die Lage auf der Kette: Bogenlänge s und Ablage
        const lage = (x, z) => {
            let bs = 0;
            let bd = Infinity;
            for (let k = 1; k < P.length; k++) {
                const dx = P[k].x - P[k - 1].x;
                const dz = P[k].z - P[k - 1].z;
                const l2 = dx * dx + dz * dz || 1e-9;
                let t = ((x - P[k - 1].x) * dx + (z - P[k - 1].z) * dz) / l2;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                const d = Math.hypot(x - P[k - 1].x - dx * t, z - P[k - 1].z - dz * t);
                if (d < bd) {
                    bd = d;
                    bs = S[k - 1] + Math.sqrt(l2) * t;
                }
            }
            return { s: bs, d: bd };
        };
        const punkt = (s) => {
            s = Math.max(0, Math.min(S[S.length - 1], s));
            let k = 1;
            while (k < P.length - 1 && S[k] < s) k++;
            const t = (s - S[k - 1]) / Math.max(1e-9, S[k] - S[k - 1]);
            return { x: P[k - 1].x + (P[k].x - P[k - 1].x) * t, z: P[k - 1].z + (P[k].z - P[k - 1].z) * t };
        };
        res.kette = Math.round(S[S.length - 1] * 10) / 10;
        let tMs = performance.now();
        const frame = () => {
            tMs += 1000 / 60;
            r._gameLoopTick(tMs);
        };
        const TASTE = {
            w: { key: "w", code: "KeyW" },
            a: { key: "a", code: "KeyA" },
            d: { key: "d", code: "KeyD" },
            e: { key: "e", code: "KeyE" },
        };
        const gehalten = new Set();
        const ereignis = (art, k) =>
            window.dispatchEvent(new KeyboardEvent(art, Object.assign({ bubbles: true }, TASTE[k])));
        const halte = (liste) => {
            for (const k of Array.from(gehalten))
                if (!liste.includes(k)) {
                    ereignis("keyup", k);
                    gehalten.delete(k);
                }
            for (const k of liste)
                if (!gehalten.has(k)) {
                    ereignis("keydown", k);
                    gehalten.add(k);
                }
        };
        const a0 = punkt(2);
        const a1 = punkt(4);
        const fahrt = Math.atan2(a1.x - a0.x, a1.z - a0.z); // Bug (sin, cos)
        st.playerMesh.position.set(
            a0.x + Math.cos(fahrt) * 1.5,
            r.getTerrainHeightAt(a0.x, a0.z) + 1.8,
            a0.z - Math.sin(fahrt) * 1.5
        );
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        for (let i = 0; i < 20; i++) frame();
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: a0.x, y: r.getTerrainHeightAt(a0.x, a0.z) + 0.5, z: a0.z },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "k10-gt-dorfweg" }
        );
        if (!e) return Object.assign(res, { err: "kein GT" });
        await window.__gebautNach(e, { takt: frame });
        ereignis("keydown", "e");
        ereignis("keyup", "e");
        frame();
        if (st.player.mountedArch !== e.id) return Object.assign(res, { err: "der Fahrer sitzt nicht im GT" });
        for (let i = 0; i < 12; i++) frame();
        const s0 = lage(st.playerMesh.position.x, st.playerMesh.position.z).s;
        let px = st.playerMesh.position.x;
        let pz = st.playerMesh.position.z;
        let strecke = 0;
        let ablage = 0;
        let aufWeg = 0;
        let gezaehlt = 0;
        const N = Math.round(sek * 60);
        for (let i = 0; i < N; i++) {
            const z = e._fahr;
            const pos = st.playerMesh.position;
            const lg = lage(pos.x, pos.z);
            const ziel = punkt(lg.s + 6);
            let fehler = 0;
            if (z && Number.isFinite(z.yaw)) {
                fehler = Math.atan2(-(ziel.z - pos.z), ziel.x - pos.x) - z.yaw; // die Fahrt-Richtung ist (cos yaw, −sin yaw)
                fehler = Math.atan2(Math.sin(fehler), Math.cos(fehler));
            }
            halte(fehler > 0.04 ? ["w", "a"] : fehler < -0.04 ? ["w", "d"] : ["w"]);
            frame();
            strecke += Math.hypot(pos.x - px, pos.z - pz);
            px = pos.x;
            pz = pos.z;
            const nach = lage(pos.x, pos.z);
            ablage = Math.max(ablage, nach.d);
            if (nach.s >= S[S.length - 1] - 1) {
                res.endeNachS = Math.round(((i + 1) / 60) * 10) / 10;
                break;
            }
            gezaehlt++;
            if (nach.d <= hw) aufWeg++;
            else if (!res.verlassen) {
                // der Täter beim Namen: der nächste Bau mit Blocker am Ort, wo der Wagen den Weg verlässt
                let naechster = null;
                let nd = Infinity;
                for (const a of st.architectures) {
                    if (!a || a === e || !a.position || !Array.isArray(a.blockerAABBs) || !a.blockerAABBs.length)
                        continue;
                    const dd = Math.hypot(a.position.x - pos.x, a.position.z - pos.z);
                    if (dd < nd) {
                        nd = dd;
                        naechster = a.type;
                    }
                }
                res.verlassen = {
                    s: Math.round((nach.s - s0) * 10) / 10,
                    naechster,
                    abstand: Math.round(nd * 10) / 10,
                };
            }
        }
        halte([]);
        const s1 = lage(st.playerMesh.position.x, st.playerMesh.position.z).s;
        res.gtWeg = Math.round((s1 - s0) * 100) / 100;
        res.strecke = Math.round(strecke * 100) / 100;
        res.ablage = Math.round(ablage * 100) / 100;
        res.aufWeg = Math.round((1000 * aufWeg) / Math.max(1, gezaehlt)) / 1000;
        res.start = { x: Math.round(a0.x * 10) / 10, z: Math.round(a0.z * 10) / 10 };
        r.dismountArchitecture();
        r.removeArchitecture(e);
    } catch (err) {
        res.err = err?.stack || String(err);
    }
    return res;
}

// DIE WÜRFE DES FELDS WEICHEN DEM ORT: jede Art, die das Affinitäts-Feld wirft (Wald, Fels, Geode und die Feuerstelle
// des Glut-Felds), weicht dem Ort wie die Natur — sie sperrt der Ort-Wahl keinen Grund (`_bauFrei`, die Wand der Wahl und der
// Slot-Quelle), der Grundriss eines Hauses räumt sie (`_grundrissRaeumen`), der Weg des Dorfs auch (`_naturRaeumen`).
// C-K5b DER VORRAT JE ZELLE (Karte vorrat-pingpong): am Mess-Ort `dorf` liegen zwei Zellen im Vorlauf-Ring. Der Zug läuft je
// Gang einen Takt, bis 20 Gänge nichts unterwegs ist und kein Export beginnt, dann 150 Gänge Ruhe; gezählt werden die Bereitungen
// (`_ortMitTrasse`) je Zelle. Der Selbsttest `alt` "vorrat" hält EINEN Vorrat zur Zeit, "trasse" jeden Export am Raster des
// Wunschs, wohin die Wahl ihn auch rückt — wie bis zu ihren Schnitten. C-K3 DIE TRASSE AM ORT: je Vorrat der Abstand seines Plans v2 vom Ort
// seines Höhen-Rasters, die Lese-Punkte außerhalb des Rasters und die Gassen (das Gefälle misst `gassenGefaelle`). Browser.
async function vorratAmDorf(messort, alt) {
    const r = window.anazhRealm;
    const SG = r.constructor._siedlungGesetz();
    const [cx, cz] = [Math.floor(messort[0] / SG.cellM), Math.floor(messort[1] / SG.cellM)];
    const zelle = new Map();
    for (let i = 0; i < 25; i++) {
        const z = r._autoSettlementCellInfo(cx + (i % 5) - 2, cz + Math.floor(i / 5) - 2);
        if (z) zelle.set(z.seed, z.key);
    }
    const e = { exporte: {}, alle: 0, nachZug: -1, trasse: [], welt: r._gelaende().seed };
    const [req, bereite, ort0] = [r._foundryRequestSettlement, r._ortMitTrasse, {}];
    r._foundryRequestSettlement = function (dp, ...a) {
        e.alle++;
        if (alt === "trasse" && dp && dp.ort) dp.ort = ort0[dp.seed] ||= dp.ort;
        return req.call(this, dp, ...a);
    };
    r._ortMitTrasse = function (dp, ...a) {
        const k = zelle.get(dp && dp.seed) || "fremd";
        e.exporte[k] = (e.exporte[k] || 0) + 1;
        return bereite.call(this, dp, ...a);
    };
    const bereiten = r._dorfBereiten;
    if (alt === "vorrat")
        r._dorfBereiten = function (key, ...a) {
            for (const k of this._dorfVorraete.keys()) if (k !== key) this._dorfVorraete.delete(k);
            return bereiten.call(this, key, ...a);
        };
    const hook0 = window.__anazhAutoSettlement;
    window.__anazhAutoSettlement = true;
    r._dorfVorraete = new Map();
    const pm = r.state.playerMesh.position;
    pm.set(messort[0], r.getTerrainHeightAt(messort[0], messort[1]) + 1, messort[1]);
    const leer = () =>
        !r._autoSettlementQueue &&
        !r._autoSettlementPendingKey &&
        !r._stlWegePending &&
        !r._weltOffen().foundry &&
        [...r._dorfVorraete.values()].every((v) => v.da);
    let gaenge = 0;
    try {
        for (let still = 0; still < 20 && gaenge < 600; gaenge++) {
            const vor = e.alle;
            r._tickAutoSettlement(pm);
            still = leer() && e.alle === vor ? still + 1 : 0;
            await sleep(20);
        }
        e.nachZug = -e.alle;
        for (let g = 0; g < 150; g++) {
            r._tickAutoSettlement(pm);
            await sleep(20);
        }
        for (const [k, v] of r._dorfVorraete) {
            const b = await v.fertig;
            const v2 = b && r._ortPlaene.get(r.constructor._ortSchluessel(b.plan, b.anker));
            if (v2)
                e.trasse.push({
                    zelle: k,
                    versatzM: +Math.hypot(v2.ort.x - b.anker.x, v2.ort.z - b.anker.z).toFixed(1),
                    aussen: (b.plan.trasse || {}).aussen,
                    v2: { ort: v2.ort, roads: v2.roads },
                });
        }
    } finally {
        delete r._foundryRequestSettlement;
        delete r._ortMitTrasse;
        delete r._dorfBereiten;
        window.__anazhAutoSettlement = hook0;
    }
    return Object.assign(e, { nachZug: e.nachZug + e.alle, gaenge, offen: r._weltOffen().foundry });
}

// Je Art ein Wurf an einem
// freien Ort (die Wand in jeder Höhe der Platte: im Hang liegt die Platte tiefer als der Wurf), in der Mitte eines Hauses
// und auf dem Weg. DAS WERK DERSELBEN ART weicht nie: die Feuerstelle des Satzes oder des Bau-Modus ist Bau (sie sperrt den
// Grund, kein Grundriss und kein Weg räumt sie) — es entscheidet die HERKUNFT (die Marke `feldWurf`, die nur der Wurf des
// Felds trägt: `_enqueueVegetationSpawn`), nie die Art. `defekt` ist der Selbst-Schein: "bau" — die Feuerstelle gilt wieder als Bau (der Wurf
// MUSS sperren); "art" — die Art entscheidet (das Werk MUSS weichen).
// Läuft im Browser (page.evaluate) — selbstgenügsam.
function feldWurfImOrt(anker, defekt) {
    const res = { sperrt: [], grundriss: [], weg: [], fehl: [], werk: { arten: [], weicht: [] } };
    const r = window.anazhRealm;
    const A = r.constructor;
    // die Arten des Felds (`_vegetationSampleSpawn`), wie die Linse sie kennt — die Welt trägt sie als EINE Liste
    const LISTE = [
        "baum_eiche",
        "baum_kiefer",
        "baum_birke",
        "baum_erle",
        "baum_buche",
        "baum_tanne",
        "baum_karst",
        "stein_block",
        "kristall_geode",
        "glutbrunnen",
    ];
    res.arten = LISTE.length;
    res.quelle = Array.isArray(A.FELD_WURF) && A.FELD_WURF.join() === LISTE.join();
    if (defekt === "bau")
        r._weichtDemBau = function (e) {
            return this._istNatur(e);
        };
    if (defekt === "art")
        r._weichtDemBau = function (e) {
            return this._istNatur(e) || (!!e && A.FELD_WURF.includes(e.type));
        };
    // die Marke trägt der EINE Wurf-Pfad des Felds (`_enqueueVegetationSpawn`): seine Optionen, am Setzen abgegriffen
    let feldOpts = null;
    {
        const sofort = r._vegSpawnImmediate;
        r._naturSetzen = (name, pos, o) => {
            feldOpts = o;
            return null;
        };
        r._wildnisTraegt = () => true;
        r._vegSpawnImmediate = true;
        try {
            r._enqueueVegetationSpawn("glutbrunnen", { x: anker.x, y: 0, z: anker.z }, { silent: true, seed: 4711 });
        } finally {
            delete r._naturSetzen; // die Methoden des Prototyps gelten wieder
            delete r._wildnisTraegt;
            r._vegSpawnImmediate = sofort;
        }
    }
    res.feldMarke = !!(feldOpts && feldOpts.feldWurf === true);
    const neu = [];
    try {
        const H = (x, z) => r.getTerrainHeightAt(x, z);
        const haus = r.state.architectures.find(
            (e) => e.fundament && e.position && Math.hypot(e.position.x - anker.x, e.position.z - anker.z) < 200
        );
        if (!haus) {
            res.err = "kein Haus am Ort";
            return res;
        }
        const ry = haus.rotationY || 0;
        const f = haus.fundament;
        const hx = haus.position.x + (f.ox || 0) * Math.cos(ry) + (f.oz || 0) * Math.sin(ry);
        const hz = haus.position.z - (f.ox || 0) * Math.sin(ry) + (f.oz || 0) * Math.cos(ry);
        const box = { ex: 2, ez: 2, ox: 0, oz: 0 };
        // trocken auch nach der Wasser-Wand jedes Werks der Liste (`_werkImWasser`, die Wurzel `spawnArchitecture`)
        const trocken = (x, z) =>
            r._landAt(x, z, 0.2) &&
            r._landAt(x + 2, z + 2, 0.2) &&
            r._landAt(x - 2, z - 2, 0.2) &&
            !LISTE.some((t) => r._werkImWasser(t, { x, z }, {}, 4711));
        // ein Punkt des Wegs (keine Grundriss-Fläche binnen 3 m) und ein freier Ort (kein Grundriss, kein Bau binnen 4 m)
        let weg = null;
        let frei = null;
        for (let i = 0; i < 6400 && !(weg && frei); i++) {
            const x = anker.x + ((i % 80) - 40) * 2.5;
            const z = anker.z + (Math.floor(i / 80) - 40) * 2.5;
            if (!trocken(x, z)) continue;
            const g = r._imGrundriss(x, z, 3, 0);
            if (!weg && g === "weg" && r._imGrundriss(x, z, 0.8, 0) === "weg") weg = { x, z };
            if (!frei && g === false && r._bauFrei(x, z, 0, { ex: 4, ez: 4, ox: 0, oz: 0 }, null, -Infinity))
                frei = { x, z };
        }
        res.orte = { haus: [+hx.toFixed(1), +hz.toFixed(1)], weg, frei };
        if (!weg || !frei) {
            res.err = `kein ${weg ? "freier Ort" : "Punkt des Wegs"} um ${anker.x.toFixed(0)}/${anker.z.toFixed(0)}`;
            return res;
        }
        // der Wurf mit den Optionen des Felds (samt seiner Marke), das Werk präzise mit der Marke werk (der Satz, der Bau-Modus)
        const wirf = (t, x, z, wo, werk) => {
            let nein = "";
            const o = Object.assign(werk ? { precise: true, werk: true } : Object.assign({}, feldOpts), {
                seed: 4711,
                absage: (g) => (nein = " " + g),
            });
            const e = r.spawnArchitecture(t, { x, y: H(x, z) + 0.5, z }, o);
            if (!e && werk) res.werk.weicht.push(`${t} (kein Werk @${wo}${nein})`);
            else if (!e) res.fehl.push(t + "@" + wo + nein);
            else neu.push(e);
            return e;
        };
        const steht = (e) => r.state.architectures.includes(e);
        for (const t of LISTE) {
            res.werk.arten.push(t);
            const wo = [];
            const w1 = wirf(t, frei.x, frei.z, "frei", true);
            if (w1 && r._bauFrei(frei.x, frei.z, 0, box, null, -Infinity)) wo.push("sperrt nicht");
            if (w1) r.removeArchitecture(w1);
            const w2 = wirf(t, hx, hz, "haus", true);
            if (w2) {
                r._grundrissRaeumen(haus);
                if (!steht(w2)) wo.push("im Grundriss geräumt");
            }
            const w3 = wirf(t, weg.x, weg.z, "weg", true);
            if (w3) {
                r._naturRaeumen(weg.x, weg.z, 2, false, null);
                if (!steht(w3)) wo.push("auf dem Weg geräumt");
            }
            if (wo.length) res.werk.weicht.push(`${t} (${wo.join(" · ")})`);
            for (const e of [w1, w2, w3]) if (e && steht(e)) r.removeArchitecture(e);
        }
        for (const t of LISTE) {
            const e1 = wirf(t, frei.x, frei.z, "frei");
            if (e1 && !r._bauFrei(frei.x, frei.z, 0, box, null, -Infinity)) res.sperrt.push(t);
            if (e1) r.removeArchitecture(e1);
            const e2 = wirf(t, hx, hz, "haus");
            if (e2) {
                r._grundrissRaeumen(haus);
                if (steht(e2)) res.grundriss.push(t);
            }
            const e3 = wirf(t, weg.x, weg.z, "weg");
            if (e3) {
                r._naturRaeumen(weg.x, weg.z, 2, false, null);
                if (steht(e3)) res.weg.push(t);
            }
        }
    } catch (err) {
        res.err = err?.stack || String(err);
    } finally {
        for (const e of neu) if (r.state.architectures.includes(e)) r.removeArchitecture(e);
        if (defekt) delete r._weichtDemBau; // die Wand des Prototyps gilt wieder
    }
    const fiel = new Set([...res.sperrt, ...res.grundriss, ...res.weg, ...res.fehl.map((s) => s.split("@")[0])]);
    res.weichen = res.arten - fiel.size;
    return res;
}

// Die dp-Fixtures der Goldens (klein = schnell; ein Dorf + ein Weiler).
const FIXTURES = [
    { seed: 7, nH: 12 },
    { seed: 12345, nH: 6 },
];

hauptLauf(async () => {
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;

    // ===== SELBST-TEST =====
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Settlement-Linse feuert ===");
        const a = FC.exportSettlement(FIXTURES[0]);
        // V2: ein manipulierter Export (ein Slot verschoben) kippt den Fingerabdruck — die Byte-Wand ist nicht vakuös.
        const b = JSON.parse(JSON.stringify(a));
        b.slots[0].x += 0.001;
        check("Selbst-Test 2: ein 1-mm-Slot-Versatz kippt den Fingerabdruck", fingerprint(a) !== fingerprint(b));
        // V6 (K10, Teil O): das Urteil des Orts feuert am Täter — ein ebener Ort hält, ein Absatz vor der Tür, ein Haus über
        // dem Grund und ein Haus ohne Weg fallen beim Namen; das Verdikt nennt jede verfehlte Zahl.
        const haus = (x, z, y) => ({
            x,
            z,
            phi: 0,
            y,
            rolle: "wohnhaus",
            tuer: { x: 0, z: -2, y: 0, W: 4, D: 4 },
            obb: { cx: x, cz: z, phi: 0, ex: 2.5, ez: 2.5 },
        });
        const ortT = (slots) => ({
            ort: { x: 100, z: 100 }, // BÜHNE: reines Urteil-Fixture, kein Welt-Ort
            slots,
            roads: [
                {
                    pts: [
                        { x: -20, z: 0 }, // BÜHNE: Weg im Plan-Rahmen eines Fixtures
                        { x: 20, z: 0 }, // BÜHNE: Weg im Plan-Rahmen eines Fixtures
                    ],
                    w: 3,
                },
            ],
            platz: null,
        });
        const eben = () => 10;
        const u0 = ortUrteil(ortT([haus(-8, 8, 10), haus(8, 8, 10)]), eben);
        check(
            "Selbst-Test 8: ein ebener Ort hält (Sockel 0, Türen 2/2)",
            u0.sockelMax === 0 && u0.tuerenOk === 2 && u0.tuerenN === 2,
            u0
        );
        const absatz = (x, z) => (z - 100 < 5 ? 9 : 10);
        const u1 = ortUrteil(ortT([haus(-8, 8, 10), haus(8, 8, 10)]), absatz);
        check(
            "Selbst-Test 9: ein Absatz von 1 m vor den Türen -> 0/2, die Stufe beim Namen",
            u1.tuerenOk === 0 && u1.tuerenFehl.every((t) => t.vorStufe === 1),
            u1.tuerenFehl
        );
        const u2 = ortUrteil(ortT([haus(-8, 8, 11), haus(8, 8, 10)]), eben);
        check(
            "Selbst-Test 10: ein Haus 1 m über dem Grund -> Sockel max 1, seine Schwelle fällt",
            u2.sockelMax === 1 && u2.tuerenOk === 1 && u2.tuerenFehl[0].si === 0,
            u2
        );
        const u3 = ortUrteil(Object.assign(ortT([haus(-8, 8, 10)]), { roads: [] }), eben, { kappe: 4000 });
        check("Selbst-Test 11: ohne Weg erreicht keine Tür ein Ziel", u3.tuerenOk === 0 && u3.tuerenN === 1);
        const gut = {
            haeuser: 16,
            slots: 16,
            sockelMax: 0,
            sockelMedian: 0,
            tuerenOk: 2,
            tuerenN: 2,
            kronen: 0,
            laternenWelt: 6,
            laternenPlan: 6,
            laterneWand: 3.1,
            laterneWandSoll: 2.548,
            laterneWeg: 1.55,
            laterneWegSoll: 0.45,
            vorplatzOk: 16,
            vorplatzN: 16,
            terrasseWand: 120,
            terrasseWiese: 0,
            terrasseHalm: 0,
            terrasseFerne: 0,
        };
        Object.assign(gut, {
            planHashGleich: true,
            fremdBauten: 0,
            gtWeg: 76.4,
            quellenGasse: 5,
            poolGasse: 4,
            poolPlaetze: 4,
        });
        check("Selbst-Test 12: das Verdikt eines gehaltenen Orts ist leer", ortVerdikt(gut).length === 0);
        const schlecht = Object.assign({}, gut, {
            kronen: 3,
            laternenWelt: 0,
            planHashGleich: false,
            sockelMax: 2.72,
            gtWeg: 5.2,
            haeuser: 12,
            wasserSlots: 4,
            laterneWand: 1.45,
            laterneWeg: -1.2,
            vorplatzOk: 0,
            terrasseWiese: 87,
            terrasseHalm: 64,
            terrasseFerne: 120,
        });
        const vs = ortVerdikt(schlecht).join(" · ");
        check(
            "Selbst-Test 13: das Verdikt nennt Sockel, Kronen, Laternen, Plan-Hash, den GT auf dem Dorfweg und die Häuser des Exports (4 im Wasser geworfen) beim Namen",
            /Sockel max 2.72/.test(vs) &&
                /Kronen in Grundrissen 3/.test(vs) &&
                /Laternen Welt 0/.test(vs) &&
                /Plan-Hash/.test(vs) &&
                /GT auf dem Dorfweg 5.2 m/.test(vs) &&
                /Häuser 12\/16 des Exports \(4 Slots im Wasser/.test(vs) &&
                /Laterne 1.45 m vor einer Hauswand/.test(vs) &&
                /Laterne -1.2 m neben dem Wegrand/.test(vs) &&
                /Stufe und Vorplatz bis zur Gasse auf dem Weg 0\/16/.test(vs) &&
                /Wand der Terrasse mit Wiesen-Stoff 87\/120/.test(vs) &&
                /Wand der Terrasse mit Halm-Grund 64\/120/.test(vs) &&
                /Wand der Terrasse in der Ferne ohne Schutt 120\/120/.test(vs) &&
                /Wand der Terrasse mit Wiesen-Stoff 0\/0/.test(
                    ortVerdikt(Object.assign({}, gut, { terrasseWand: 0 })).join(" · ")
                ),
            vs
        );
        check(
            "Selbst-Test 13b: endet der Dorfweg vor 8 s, zählt das Tempo bis zum Ende (48 m in 5,1 s hält, 20 m in 5,1 s fällt)",
            ortVerdikt(Object.assign({}, gut, { gtWeg: 48.16, gtEnde: 5.1 })).length === 0 &&
                /GT auf dem Dorfweg 20 m in 5.1 s/.test(
                    ortVerdikt(Object.assign({}, gut, { gtWeg: 20, gtEnde: 5.1 })).join(" · ")
                )
        );
        // Selbst-Test 16 (das Dorf-Licht der Gasse): ein Weg von 60 m, fünf Laternen 3 m neben ihm alle 10 m — die Gasse
        // sieht vier, ein Haus zwischen Weg und Laternen verdeckt zwei, ohne Quellen bleibt nichts, und das Verdikt nennt die Gasse
        {
            const weg = [];
            for (let x = 0; x <= 60; x += 2) weg.push([x, 0]);
            const lat = [10, 20, 30, 40, 50].map((x) => [x, 3]);
            const hfov = 2 * Math.atan(Math.tan((75 * Math.PI) / 360) * (16 / 9));
            const frei = gassenLicht(lat, [weg], [], hfov);
            const haus = { cx: 35, cz: 2, ex: 6, ez: 0.5, phi: 0 };
            const zu = gassenLicht(lat, [weg], [haus], hfov);
            const leer = gassenLicht([], [weg], [], hfov);
            const vg = ortVerdikt(Object.assign({}, gut, { quellenGasse: 3, poolGasse: 0 })).join(" · ");
            const vp = ortVerdikt(Object.assign({}, gut, { quellenGasse: 4, poolGasse: 1 })).join(" · ");
            check(
                "Selbst-Test 16: die Gasse sieht die Laternen am Weg, ein Haus verdeckt sie, ohne Quellen bleibt 0, das Verdikt nennt Gasse und Pool",
                frei.n >= 4 &&
                    zu.n < frei.n &&
                    zu.verdeckt > 0 &&
                    leer.n === 0 &&
                    /Dorf-Licht der Gasse nachts 3 sichtbare Quellen/.test(vg) &&
                    /Licht-Pool der Gasse nachts 0/.test(vg) &&
                    /Licht-Pool der Gasse nachts 1 Quellen des Orts \(Soll ≥ 4\)/.test(vp),
                JSON.stringify({ frei: frei.n, zu: zu.n, verdeckt: zu.verdeckt, leer: leer.n })
            );
        }
        // V7 (K10, das Brücken-Etikett): ein Weg quer über einen Fluss (die Rinne |x| < 3, 2 m tief) trägt eine Brücke von
        // Widerlager zu Widerlager, unter ihr keine Trasse und ein FREI-Splat: der Grund in der Rinne bleibt (kein Damm). Ohne
        // das Wasser-Urteil (ctx.wasserAt) staut der Erdbau die Rinne auf die Höhe des Wegs — die Linse sieht den Unterschied.
        {
            require(path.join(root, "gelaende-core.js"));
            const Gb = globalThis.__gelaendeCore;
            const pts = [];
            for (let x = -20; x <= 20; x += 2) pts.push({ x, z: 0 });
            const planB = { slots: [], roads: [{ pts, w: 3 }], laternen: [] };
            const rinne = (x) => (Math.abs(x) < 3 ? -2 : 0);
            const ctxB = (mitWasser) => ({
                hoeheAt: (x) => rinne(x - 100),
                flaeche: (sp) => {
                    const E = Gb.erdbauNormal(sp);
                    return (x, z) => Gb.erdbauFlaeche(E, x, z);
                },
                wasserAt: mitWasser ? (x) => Math.abs(x - 100) < 3 : null,
            });
            const mit = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(true)); // BÜHNE: reines ortPlan-Fixture über einer gedachten Rinne
            const ohne = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(false)); // BÜHNE: reines ortPlan-Fixture über einer gedachten Rinne
            const yMit = Gb.erdbauY(Gb.erdbauNormal(mit.erdbau), 100, 0, -2);
            const yOhne = Gb.erdbauY(Gb.erdbauNormal(ohne.erdbau), 100, 0, -2);
            const br = mit.roads[0].bruecken || [];
            const freiN = mit.erdbau.filter((p) => p.art === "frei").length;
            check(
                "Selbst-Test 14: das Brücken-Etikett — der Weg über die Rinne trägt EINE Brücke, ein FREI-Splat hält den Grund (kein Damm), ohne Wasser-Urteil staut der Erdbau",
                br.length === 1 && freiN === 1 && yMit === -2 && yOhne > -1.5 && Math.abs(mit.roads[0].ys[10]) < 1e-9,
                JSON.stringify({ br, freiN, yMit, yOhne, deck: mit.roads[0].ys[10] })
            );
        }
        // V-Z (siedlung.K2): der Zensus am Rang-Gesetz mit festem Export (das Fenster misst die Größen allein) — das Gesetz
        // GRÜN; ROT beim Namen ZIPF: gleich große Siedlungen, jede Stufe so groß wie die erste, ein Export ohne Graph, einer
        // ohne Mauer (Z1: keine Stadt), kein Rang
        const R = FC.SIEDLUNG.rang;
        const zf = [
            {},
            { gleich: 36 },
            { rang: R.map((r) => ({ ...r, nH: R[0].nH })) },
            { graph: null },
            { mauer: null },
        ];
        const zs = [...zf, { rang: [] }].map((f) => {
            const ex = () => ({ groesse: "stadt", mauer: { segs: [0] }, graph: { nE: 1 }, slots: [], ...f });
            const zelle = (...a) => ((q) => (q && f.gleich ? { ...q, nH: f.gleich } : q))(FC.siedlungsZelle(...a));
            return rangZensus({ ...FC, siedlungsZelle: zelle }, { ex, S: { ...FC.SIEDLUNG, rang: f.rang || R } }).zipf;
        });
        check(
            "Selbst-Test Z ZIPF: das Gesetz GRÜN · gleich große Siedlungen, Stufen gleich groß, ohne Graph, ohne Mauer, ohne Rang ROT",
            zs[0].gruen && !zs.slice(1).some((z) => z.gruen),
            zs.map((z) => `ZIPF ζ ${z.zeta} [${z.ki}] ${z.export}`).join(" · ")
        );
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN.");
        process.exit(0);
    }

    // Teil J urteilt über das Gesetz und seine Mutanten: ohne Erbe bricht die Überdeckung, der Turm von 1455 (bis K4 die
    // Ring-Stadt) und ein Export ohne Tracht fallen beim Namen
    console.log("=== TEIL J: DIE JAHRESRINGE (siedlung.K4) ===");
    const mut = (dp) => ((x) => ({ ...x, kleidung: null, slots: [{ ...x.slots[1], rolle: "turm", baujahr: 1455 }] }))(FC.exportSettlement(dp));
    const [J, J0, Jm] = [{}, { ohneErbe: 1 }, { ex: mut, saaten: [5] }].map((o) => jahresringe(FC, o));
    console.log("JAHRESRINGE " + JSON.stringify({ min: J.min, paare: J.paare, ohneErbe: J0.min, fehl: J.fehl }));
    check(`J1 JAHRESRINGE ${J.min} (Soll ≥ 0,8; ohne Erbe ${J0.min})`, J.min >= 0.8 && J0.min < 0.8);
    check(`J2 EPOCHE: ${J.fehl.length} Brüche, die Mutante ${Jm.fehl.length}`, !J.fehl.length && /turm \S+ 1455/.test(Jm.fehl) && /Kleidung null/.test(Jm.fehl));
    if (process.argv.includes("--nur-j")) process.exit(errs.length ? 1 : 0);

    console.log("=== TEIL Z: DAS RANG-GESETZ (siedlung.K2) ===");
    const Z = rangZensus(FC);
    const alt = FC.exportSettlement({ seed: 5 }); // „moderne" ohne Zahl ergibt stadt: Teil J
    check(`Z1 RANG: binnen 2 km eine ummauerte Stadt in ${Z.mitStadt}/8 Saaten (Soll ≥ 6)`, Z.ok, Z.saaten.join(" · "));
    check(`Z2 OHNE EPOCHE ${alt.slots.length} Slots (18 Häuser)`, alt.slots.length === 21);
    console.log("ZIPF " + JSON.stringify(Z.zipf));
    check(
        `Z3 ZIPF: ζ ${Z.zipf.zeta} [${Z.zipf.ki.join("; ")}] über ${Z.je.length} Saaten × 32 × 32 km (Soll 0,8–1,2), ${Z.zipf.export}`,
        Z.zipf.gruen
    );
    if (process.argv.includes("--nur-z")) process.exit(errs.length ? 1 : 0);

    console.log("=== N5.7 SETTLEMENT — TEIL N: exportSettlement (Node, deterministisch + eingefroren) ===");
    const plans = {};
    for (const dp of FIXTURES) {
        const key = JSON.stringify(dp);
        const p1 = FC.exportSettlement(dp);
        const p2 = FC.exportSettlement(dp);
        plans[key] = p1;
        check(`deterministisch fuer ${key} (zwei Läufe byte-gleich)`, fingerprint(p1) === fingerprint(p2));
        check(
            `Slots sauber fuer ${key} (>=4, bekannte Kulturen, endliche Anker, |x/z| < 5000)`,
            Array.isArray(p1.slots) &&
                p1.slots.length >= 4 &&
                p1.slots.every(
                    (s) =>
                        typeof s.kultur === "string" &&
                        !!FC.KULTUR[s.kultur] &&
                        isFinite(s.x) &&
                        isFinite(s.z) &&
                        isFinite(s.phi) &&
                        Math.abs(s.x) < 5000 &&
                        Math.abs(s.z) < 5000 &&
                        s.ov &&
                        typeof s.ov === "object"
                ),
            `slots=${p1.slots?.length}`
        );
    }

    // Golden: EINGEFROREN — gemintet NUR wenn die Datei fehlt (Taille-Disziplin).
    if (!fs.existsSync(goldenFile)) {
        fs.mkdirSync(goldenDir, { recursive: true });
        const golden = {};
        for (const dp of FIXTURES) {
            const key = JSON.stringify(dp);
            golden[key] = {
                sha256: fingerprint(plans[key]),
                slots: plans[key].slots.length,
                name: plans[key].name,
                groesse: plans[key].groesse,
            };
        }
        fs.writeFileSync(goldenFile, JSON.stringify(golden, null, 4) + "\n");
        console.log(`  🧊 Golden GEMINTET (${goldenFile}) — ab jetzt EINGEFROREN.`);
    }
    const golden = JSON.parse(fs.readFileSync(goldenFile, "utf8"));
    for (const dp of FIXTURES) {
        const key = JSON.stringify(dp);
        check(
            `GOLDEN byte-treu fuer ${key} (${golden[key]?.slots} Slots · „${golden[key]?.name}")`,
            !!golden[key] && golden[key].sha256 === fingerprint(plans[key]),
            golden[key] ? fingerprint(plans[key]).slice(0, 12) : "Golden fehlt"
        );
    }

    // ===== U6c: SNAP-/BRANDWAND-PROBE — die EINE Wahrheit, zwei Leser =====
    // Die Gesetze wohnen im Kern (__fachwerkCore.reihenSnap/brandwand, verbatim aus
    // buildDorf gewandert); das Lab ruft DIESELBEN Funktionen. Probe 1 (synthetisch):
    // zwei dichte parallele Nachbarn docken auf die Norm-Fuge und markieren die
    // anliegende Seite als Brandwand. Probe 2 (end-to-end): ein städtischer Export
    // trägt ov.brandwand — der Kern-Layout-Pfad KONSUMIERT das Gesetz.
    console.log("\n=== U6c: REIHEN-SNAP + BRANDWAND (Kern-Gesetz, beidseitiger Konsum) ===");
    {
        const gap = 0.06; // Metropol-Norm — dicht (<=0.6), der Snap-Pfad ist scharf
        // zwei Nachbarn (8 × 7 m) in einer Reihe, der zweite `x` m weiter (Grundriss-Daten einer Einheits-Probe, kein Ort)
        const paar = (x) => [
            [0, x].map(() => ({ dims: { W: 8, D: 7 }, kern: false, p: {} })),
            [0, x].map((cx) => ({ phi: 0, x: cx, z: 0, obb: { cx, cz: 0, phi: 0, ex: 4, ez: 3.5 } })),
        ];
        const [Bs, pl] = paar(9);
        const snaps = FC.reihenSnap(Bs, pl, gap);
        const fuge = Math.abs(pl[1].obb.cx - pl[0].obb.cx) - 8; // (Wi+Wj)/2 = 8
        check("Snap-Probe: zwei dichte Nachbarn docken an (1 Paar)", snaps === 1, `snaps=${snaps}`);
        check("Snap-Probe: die Fuge ist die Norm-Fuge", Math.abs(fuge - gap) < 1e-9, `fuge=${fuge.toFixed(4)}`);
        check(
            "Snap-Probe: x und obb.cx rücken kohärent (Solids/OBB fließen konsistent)",
            pl[0].x === pl[0].obb.cx && pl[1].x === pl[1].obb.cx
        );
        Bs.forEach((B, i) => (B.q = pl[i]));
        const bwN = FC.brandwand(Bs, gap);
        check(
            "Brandwand-Probe: die anliegenden Seiten sind markiert (x1 am linken, x0 am rechten Haus)",
            bwN === 2 &&
                Bs[0].p.brandwand &&
                Bs[0].p.brandwand.x1 === 1 &&
                Bs[1].p.brandwand &&
                Bs[1].p.brandwand.x0 === 1,
            `bwN=${bwN}`
        );
        const weit = FC.reihenSnap(...paar(30), gap);
        check("Snap-Probe: ferne Nachbarn (Fuge>1.8m) bleiben stehen", weit === 0, `snaps=${weit}`);
        const stadt = FC.exportSettlement({ seed: 7, nH: 20 });
        const bwSlots = stadt.slots.filter((s) => s.ov?.brandwand).length;
        check(
            "Konsum-Probe: der städtische Export trägt ov.brandwand (der Kern-Pfad ruft DIESELBE Wahrheit wie buildDorf)",
            stadt.staedtisch === true && bwSlots >= 1,
            `groesse=${stadt.groesse} · brandwand-Slots=${bwSlots}`
        );
        // DAS DORF-LICHT: gemessen wird das Licht je METER der Gasse, nie die Zahl der Laternen. Gemessen wird jeder Meter der Weg-Achse, sein Maß der Abstand zur
        // nächsten Quelle des Plans, die nachts brennt (Mast und Wandlaterne, Zeitplan `nacht` > 0): in der Gasse (eine Kern-Wand
        // näher als LICHT_MARKE_M − armM, dort trägt die Wand ihr Licht) jeder ≤ LICHT_MARKE_M (das Gesetz des Kerns,
        // wandLaternen), über alle Meter p90 ≤ 10 m. Je
        // Laterne bleibt ihr Stand: der Mast vor der Wand (LATERNE_WAND aus LICHT_GESETZ.laterne, die Wand trägt höchstens das
        // Doppelte der Gasse; K66) und mit dem Fuß neben jedem Weg (der Tritt des Rezepts), die Wandlaterne mit dem Kopf `armM` vor der Wand eines Kerns (W × D der Tür-Zeile, nie vor der Traufe).
        const trittR = FC.PRESETS.laterne.fx.tritt.r;
        const LGd = FC.LICHT_GESETZ.laterne;
        const LWd = FC.LICHT_GESETZ.wandlaterne;
        const wandSoll = Math.sqrt(Math.max(0, (LGd.hoeheM ** 2 + LGd.kernM ** 2) / 2 - LGd.kernM ** 2));
        const MARKE_SOLL = Number.isFinite(FC.LICHT_MARKE_M) ? FC.LICHT_MARKE_M : 10; // ohne das Gesetz misst sie mit 10 m und fällt
        const MARKE_P90 = 10;
        const GASSE_M = MARKE_SOLL - (LWd ? LWd.armM : 0);
        // der Abstand eines Punkts zur Wand des Rechtecks um (cx, cz) mit den Halbachsen ex × ez, gedreht um phi (innen negativ)
        const kasten = (cx, cz, phi, ex, ez, x, z) => {
            const [u, v] = lokal(cx, cz, phi, x, z);
            const [uu, vv] = [Math.abs(u) - ex, Math.abs(v) - ez];
            return uu > 0 ? (vv > 0 ? Math.hypot(uu, vv) : uu) : vv > 0 ? vv : Math.max(uu, vv);
        };
        // der Abstand eines Punkts zur Wand des Kerns eines Slots (die Tür-Zeile W × D um den Slot)
        const kernAbstand = (sl, x, z) => {
            const tu = sl.tuer;
            return tu && tu.W > 0 && tu.D > 0 ? kasten(sl.x, sl.z, sl.phi, tu.W / 2, tu.D / 2, x, z) : Infinity;
        };
        const brennt = (l) => ((l.wand ? LWd : LGd) || { zeit: {} }).zeit.nacht > 0;
        const wegPunkt = (rd, u) => {
            const P = rd.pts || [];
            let acc = 0;
            for (let i = 0; i + 1 < P.length; i++) {
                const s = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z);
                if (acc + s >= u) {
                    const t = s > 0 ? (u - acc) / s : 0;
                    return { x: P[i].x + (P[i + 1].x - P[i].x) * t, z: P[i].z + (P[i + 1].z - P[i].z) * t };
                }
                acc += s;
            }
            return P[P.length - 1];
        };
        const dorfLicht = (pl) => {
            const L = Array.isArray(pl.laternen) ? pl.laternen : [];
            const maste = L.filter((l) => !l.wand);
            const waende = L.filter((l) => l.wand);
            const ds = [];
            const dunkel = [];
            let gasse = 0;
            (pl.roads || []).forEach((rd, ri) => {
                for (let u = 0; u <= (rd.len || 0); u += 1) {
                    const m = wegPunkt(rd, u);
                    let d = Infinity;
                    for (const l of L) if (brennt(l)) d = Math.min(d, Math.hypot(l.x - m.x, l.z - m.z));
                    ds.push(d);
                    let w = Infinity;
                    for (const sl of pl.slots || []) w = Math.min(w, kernAbstand(sl, m.x, m.z));
                    if (!(w <= GASSE_M)) continue;
                    gasse++;
                    if (!(d <= MARKE_SOLL)) dunkel.push([ri, u, Math.round(d * 10) / 10]);
                }
            });
            let wand = Infinity;
            for (const l of maste)
                for (const { obb: o } of pl.slots || [])
                    if (o) wand = Math.min(wand, kasten(o.cx, o.cz, o.phi, o.ex, o.ez, l.x, l.z));
            const wandOk = !(wand < wandSoll - 0.01);
            let weg = Infinity;
            for (const l of maste)
                for (const rd of [...(pl.roads || []), ...(pl.feldwege || [])]) {
                    const P = rd.pts || [];
                    const halb = Math.max(1.2, rd.w || 2.5) / 2;
                    for (let i = 0; i + 1 < P.length; i++) {
                        const dx = P[i + 1].x - P[i].x;
                        const dz = P[i + 1].z - P[i].z;
                        const L2 = dx * dx + dz * dz;
                        const t =
                            L2 > 1e-9 ? Math.max(0, Math.min(1, ((l.x - P[i].x) * dx + (l.z - P[i].z) * dz) / L2)) : 0;
                        weg = Math.min(weg, Math.hypot(l.x - P[i].x - dx * t, l.z - P[i].z - dz * t) - halb);
                    }
                }
            const wegOk = !(weg < trittR - 0.01);
            // die Wandlaterne hängt: ihr Kopf liegt armM (± 5 cm) vor der Wand eines Kerns (die Tür-Zeile W × D um den Slot)
            let haengt = 0;
            for (const l of waende) {
                let best = Infinity;
                for (const sl of pl.slots || []) best = Math.min(best, Math.abs(kernAbstand(sl, l.x, l.z) - LWd.armM));
                if (best <= 0.05) haengt++;
            }
            const ueber = dunkel.length;
            const weiteste = dunkel.reduce((a, b) => (b[2] > a[2] ? b : a), [null, null, 0]);
            return {
                n: L.length,
                nWand: waende.length,
                ds,
                gasse,
                ueber,
                maxD: weiteste[2],
                wo: weiteste[0] === null ? "-" : `Weg ${weiteste[0]} bei ${weiteste[1]} m`,
                wand: Math.round(wand * 100) / 100,
                weg: Math.round(weg * 100) / 100,
                wegOk,
                haengt,
                haengtOk: haengt === waende.length,
                ok: ueber === 0 && wandOk && wegOk && haengt === waende.length,
            };
        };
        const lichtFehl = [];
        const alleDs = [];
        let lichtN = 0;
        let wandAlle = 0;
        let lAlle = 0;
        let gasseAlle = 0;
        let dunkelAlle = 0;
        for (const [seed, nH] of [
            [7, 12],
            [12345, 6],
            [4291161376, 13],
            [3, 9],
            [7, 18],
            [11, 40],
            [5, 14],
            [9, 20],
            [7, 16],
            [2, 10],
            [1, 8],
        ])
            for (const epoche of [undefined, "antike"]) {
                const pl = FC.exportSettlement({ seed, nH, epoche });
                const d = dorfLicht(pl);
                lichtN++;
                alleDs.push(...d.ds);
                wandAlle += d.nWand;
                lAlle += d.n;
                gasseAlle += d.gasse;
                dunkelAlle += d.ueber;
                if (!d.ok)
                    lichtFehl.push(
                        `${seed}/${nH}/${epoche || "-"}: ${d.ueber}/${d.gasse} Meter der Gasse weiter als ${MARKE_SOLL} m von einer brennenden Quelle (der dunkelste ${d.maxD} m, ${d.wo}), der nächste Mast ${d.wand} m vor einer Wand (Soll ≥ ${wandSoll.toFixed(2)} m) und ${d.weg} m neben dem Wegrand (Soll ≥ ${trittR} m), Wandlaternen an der Wand ${d.haengt}/${d.nWand}`
                    );
            }
        // die Stadt der Moderne (der Zweig der Gas- und Elektro-Laternen, laterneQuer wie im Dorf): kein Fuß im Weg
        for (const [seed, nH, epoche] of [[3, 30, "moderne"]]) {
            const d = dorfLicht(FC.exportSettlement({ seed, nH, epoche }));
            lichtN++;
            if (!d.wegOk)
                lichtFehl.push(
                    `${seed}/${nH}/${epoche}: die nächste Laterne ${d.weg} m neben dem Wegrand (Soll ≥ ${trittR} m)`
                );
        }
        alleDs.sort((a, b) => a - b);
        const mq = (q) =>
            alleDs.length ? alleDs[Math.min(alleDs.length - 1, Math.floor(alleDs.length * q))] : Infinity;
        if (!Number.isFinite(FC.LICHT_MARKE_M)) lichtFehl.push("der Kern trägt kein LICHT_MARKE_M (das Soll je Meter)");
        if (!(mq(0.9) <= MARKE_P90)) lichtFehl.push(`p90 je Meter ${mq(0.9).toFixed(1)} m (Soll ≤ ${MARKE_P90} m)`);
        console.log(
            `  DORF-LICHT je Meter: dunkle Gasse ${dunkelAlle}/${gasseAlle} Meter weiter als ${MARKE_SOLL} m · alle Meter Median ${mq(0.5).toFixed(1)} m · p90 ${mq(0.9).toFixed(1)} m · max ${(alleDs[alleDs.length - 1] || 0).toFixed(1)} m · Laternen ${lAlle} (Wand ${wandAlle})`
        );
        check(
            `DAS DORF-LICHT je Meter: jeder Meter der Gasse (Kern-Wand ≤ ${GASSE_M.toFixed(1)} m) ≤ ${MARKE_SOLL} m von einer Quelle, die nachts brennt, alle Meter p90 ≤ ${MARKE_P90} m; der Mast vor der Wand und mit dem Fuß neben dem Weg, die Wandlaterne an der Wand (${lichtN} Pläne, ${gasseAlle} Meter Gasse)`,
            lichtFehl.length === 0,
            lichtFehl.slice(0, 3).join(" · ")
        );
        // DAS LICHT DER WANDLATERNE: die Wand in armM trägt höchstens das Doppelte der Gasse unter ihr (das Wand-Gesetz
        // der Laterne, K66), ihr Licht brennt nachts in der Farbe der Laterne (das Datum ihres Rezepts hält gate:fachwerk-contract)
        const wandGesetz = LWd
            ? ((LWd.hoeheM ** 2 + LWd.kernM ** 2) / (LWd.armM ** 2 + LWd.kernM ** 2)) ** (LWd.abfall / 2)
            : Infinity;
        check(
            `Das Licht der Wandlaterne hält das Wand-Gesetz: die Wand in ${LWd ? LWd.armM : "?"} m trägt ${wandGesetz.toFixed(2)} × die Gasse unter ihr (Soll ≤ 2), ${LWd ? LWd.kelvin : "?"} K wie die Laterne`,
            wandGesetz <= 2.001 && !!LWd && LWd.zeit.nacht > 0 && LWd.kelvin === LGd.kelvin
        );
        // DIE WANDLATERNE IM ORTPLAN (K66-2 N1): fällt ein Slot ins Wasser (ortPlan, auch der Rückfall von `_ortWahl`), hängt jede
        // Wandlaterne armM vor der Wand des Hauses, mit dem die Welt sie hebt (`v2.slots[l.slot]`, `_spawnSettlementSlot`), und die
        // des nassen Hauses fällt mit ihm.
        const wandImOrt = (pl, v2, nass) => {
            const W = (v2.laternen || []).filter((l) => l.wand);
            let haengt = 0;
            const fremd = [];
            for (const l of W) {
                const sl = v2.slots[l.slot];
                const d = sl ? kernAbstand(sl, l.x, l.z) : Infinity;
                if (LWd && Math.abs(d - LWd.armM) <= 0.05) haengt++;
                else fremd.push(Number.isFinite(d) ? Math.round(d * 10) / 10 : "kein Haus");
            }
            const nassL = (pl.laternen || []).filter((l) => l.wand && l.slot === nass);
            const bleibt = nassL.filter((l) => W.some((w) => w.x === l.x && w.z === l.z)).length;
            return {
                n: W.length,
                haengt,
                fremd,
                nass: nassL.length,
                bleibt,
                ok: W.length > 0 && !fremd.length && !bleibt,
            };
        };
        {
            const pl = FC.exportSettlement({ seed: 7, nH: 16 });
            const j = (pl.laternen.find((l) => l.wand) || {}).slot;
            const o = Number.isInteger(j) && pl.slots[j] ? pl.slots[j].obb : null;
            const v2 = o
                ? FC.ortPlan(
                      pl,
                      { x: 0, z: 0 },
                      {
                          hoeheAt: () => 10,
                          flaeche: () => () => 10,
                          wasserAt: (x, z) => Math.hypot(x - o.cx, z - o.cz) < 1.0, // nur der Grund von Slot j ist nass
                      }
                  )
                : null;
            const w = v2 ? wandImOrt(pl, v2, j) : null;
            check(
                `Die Wandlaterne hängt im Ortplan an ihrem Haus: Slot ${j} fällt ins Wasser (${v2 ? v2.wasserSlots || 0 : "?"} nass), ${w ? w.haengt : 0}/${w ? w.n : 0} hängen ${LWd ? LWd.armM : "?"} m vor der Wand ihres Slots, ${w ? w.bleibt : "?"}/${w ? w.nass : "?"} des nassen Hauses bleiben`,
                !!w && w.ok && v2.wasserSlots === 1 && w.nass > 0,
                JSON.stringify({ fremd: w && w.fremd.slice(0, 6) })
            );
            // der Ortplan, wie er bis N1 reiste (die Laternen mit den Nummern des v1-Plans), hängt sie an fremde Häuser
            const alt = v2 ? wandImOrt(pl, Object.assign({}, v2, { laternen: pl.laternen }), j) : null;
            check(
                "Selbst-Test 16: der Ortplan mit den Slot-Nummern des v1-Plans (wie bis N1) fällt — Wandlaternen an fremden Häusern, die des nassen Hauses bleibt",
                !!alt && !alt.ok && alt.fremd.length > 0 && alt.bleibt > 0,
                JSON.stringify(
                    alt && { haengt: alt.haengt, n: alt.n, fremd: alt.fremd.slice(0, 4), bleibt: alt.bleibt }
                )
            );
        }
        {
            const pl = FC.exportSettlement({ seed: 7, nH: 12 });
            const o0 = pl.slots[0].obb;
            const p0 = pl.roads[0].pts[2];
            const w0 = pl.roads[0].w;
            const inDerFahrbahn = dorfLicht(
                Object.assign({}, pl, {
                    laternen: pl.laternen.concat([
                        { x: p0.x - Math.sin(p0.th) * (w0 / 4), z: p0.z + Math.cos(p0.th) * (w0 / 4), th: 0 },
                    ]),
                })
            );
            // DIE DICHTE GASSE: derselbe Plan ohne seine Wandlaternen — die Marken der dichten Gasse sind dunkel; eine
            // Wandlaterne 0,9 m von ihrem Stand weg hängt an keiner Wand
            const plG = FC.exportSettlement({ seed: 7, nH: 16 });
            const ohneWand = dorfLicht(Object.assign({}, plG, { laternen: plG.laternen.filter((l) => !l.wand) }));
            const schwebt = dorfLicht(
                Object.assign({}, plG, {
                    laternen: plG.laternen.map((l) =>
                        l.wand
                            ? Object.assign({}, l, { x: l.x - Math.cos(l.th) * 0.9, z: l.z - Math.sin(l.th) * 0.9 })
                            : l
                    ),
                })
            );
            check(
                "Selbst-Test 15: derselbe Plan ohne Laternen fällt im Dorf-Licht, ein Mast an der Wand (0,45 m wie bis K66) ebenso, einer in der Fahrbahn (rd.w/4 von der Achse wie bis K66-n4) am Weg; die dichte Gasse ohne ihre Wandlaternen an der Marke, eine Wandlaterne 0,9 m vor ihrem Stand an der Wand",
                dorfLicht(pl).ok &&
                    !dorfLicht(Object.assign({}, pl, { laternen: [] })).ok &&
                    !dorfLicht(
                        Object.assign({}, pl, {
                            laternen: pl.laternen.concat([
                                {
                                    x: o0.cx + (o0.ex + 0.45) * Math.cos(o0.phi || 0),
                                    z: o0.cz - (o0.ex + 0.45) * Math.sin(o0.phi || 0),
                                    th: 0,
                                },
                            ]),
                        })
                    ).ok &&
                    !inDerFahrbahn.ok &&
                    !inDerFahrbahn.wegOk &&
                    dorfLicht(plG).ok &&
                    plG.laternen.some((l) => l.wand) &&
                    ohneWand.ueber > 0 &&
                    !schwebt.haengtOk,
                JSON.stringify({
                    weg: inDerFahrbahn.weg,
                    wegOk: inDerFahrbahn.wegOk,
                    ohneWand: `${ohneWand.ueber}/${ohneWand.gasse} Meter der Gasse > ${MARKE_SOLL} m, der dunkelste ${ohneWand.maxD} m`,
                    schwebt: `${schwebt.haengt}/${schwebt.nWand}`,
                })
            );
        }
    }

    // ===== TEIL B: der lebende Kanal (Browser, foundry-ON) =====
    console.log("\n=== TEIL B: der lebende Kanal (Browser, foundry-ON, Null-Renderer) ===");
    const PORT = Number(process.env.SETTLEMENT_PORT || 4436);
    const server = statikServer();
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 240000 });
    await server.zeige(page, 30000);
    // DIE PROBEN JE LAUFZEIT-MARKE: `fn` läuft in der Seite, jede Probe setzt ihre Marke (`__marke(name)`); gewartet wird Marke um
    // Marke über das EINE Warten (`waitFor`, sein Name im Puls der Stall-Akte), höchstens eine Runde je Marke — so trägt jede Probe
    // die Frist des Browsers allein, nie die Summe (bis 26.10. EIN Ruf über Teil B und C: am belasteten Laptop riss er nach 240 s
    // in C-K5c, die Linse brach mit Exit 2 vor C-K3). Reißt oder wirft eine, trägt das Ergebnis `bruch` mit ihrer Marke (ein Wurf
    // samt Stapel, ein Riss samt Ursache) und was `fn` bis dahin in `__kanal.res` trug — die EINE Wand der Proben, keine eigene
    // catch-Kette je Probe.
    const jeMarke = async (fn) => {
        await page.evaluate((src) => {
            const K = (window.__kanal = { n: 0 });
            window.__marke = (m) => ((K.marke = m), K.n++);
            K.lauf = new Function("return (" + src + ")")()()
                .catch((e) => ({ ...K.res, bruch: `${K.marke}: ${(e && e.stack) || e}` }))
                .finally(() => (K.ende = true));
        }, fn.toString());
        let K = {};
        try {
            while (!(K = await page.evaluate(() => window.__kanal)).ende)
                await waitFor(page, (n) => window.__kanal.n > n || window.__kanal.ende, K.marke, K.n);
            return await page.evaluate(() => window.__kanal.lauf);
        } catch (e) {
            return { ...K.res, bruch: `${K.marke}: ${(e.cause || e).message}` };
        }
    };
    // die Welt samt den Rezepten der Foundry — vor Teil B und, brach eine Probe, frisch geladen für Teil O
    const bereit = () =>
        page.evaluate(async () => {
            const f = (await window.__weltDa())._ensureAssetFoundry();
            await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.alemannisch);
        });
    await bereit();

    const out = await jeMarke(async () => {
        const res = (window.__kanal.res = {});
        window.__marke("B");
        const r = window.anazhRealm;
        // 1) Der Export durch den EINEN Worker (massBau × Häuser braucht Sekunden; ein Hänger reißt an der Marke B).
        const plan = await r._foundryRequestSettlement({ seed: 7, nH: 8 });
        res.planOk = !!(plan && Array.isArray(plan.slots) && plan.slots.length >= 4);
        res.planName = plan && plan.name;
        res.planSlots = plan && plan.slots ? plan.slots.length : -1;
        if (!res.planOk) return res;
        // 2) Der Konsument: POSITIONS-DETERMINISTISCH am SELBEN Anker (die Wasser-Wand ist
        //    Terrain-Wahrheit je Ort — verschiedene Anker duerfen verschieden viele Slots
        //    tragen; die Determinismus-Aussage ist: derselbe Export + derselbe Anker ⇒
        //    jedes Haus beider Akte exakt am Slot des Plans v2 [x/z/rot/seed]).
        const before = r.state.architectures.length;
        // BÜHNE: Bau-Anker: derselbe Export am selben Anker — den Ort trägt das Platz-Gesetz des Stamms (_spawnSettlementFromExport)
        const o1 = { x: 400, z: 400 };
        // Der zweite Akt steht auf dem geräumten Ort: die Bau-Wand (_bauFrei) setzt kein Haus in ein Haus — neben dem ersten
        // Dorf entstünde am selben Anker keines (Integration Welle L, gate:haus-welt W7). Die folgenden Proben lesen die
        // lebenden Einträge des zweiten Akts.
        // der Akt hebt über den Zug (K5): Häuser vor dem ersten Bild nach dem ersten
        const lift0 = r._spawnSettlementSlot;
        let [zugAkt, aus] = [0, false];
        r._spawnSettlementSlot = function (...a) {
            if (!zugAkt) requestAnimationFrame(() => (aus = true));
            zugAkt += !aus;
            return lift0.apply(this, a);
        };
        const r1 = await r._spawnSettlementFromExport(await r._ortWahl(plan, o1), o1);
        delete r._spawnSettlementSlot;
        res.zugAkt = zugAkt <= r.constructor.AUTO_SETTLEMENT.perTick && r1.placed > zugAkt;
        const akt1 = r.state.architectures.slice(before);
        for (const e of akt1) r.removeArchitecture(e);
        const mid2 = r.state.architectures.length;
        const r2 = await r._spawnSettlementFromExport(await r._ortWahl(plan, o1), o1);
        const after = r.state.architectures.length;
        res.placed1 = r1.placed;
        res.skipped1 = r1.skipped;
        res.placed2 = r2.placed;
        // Die Buchhaltung: der Akt setzt die Häuser seiner Slots und an ihnen ihre Wandlaternen (die Laterne des Plans
        // mit `wand` und dem Slot des Hauses, `_spawnSettlementSlot`) — sonst nichts.
        const istHaus = (e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0;
        const alle1 = r.state.architectures.slice(mid2, after);
        const e1 = alle1.filter(istHaus);
        const wandPlan = (plan.laternen || []).filter((l) => l && l.wand).length;
        res.wand1 = alle1.length - e1.length;
        res.wandPlan = wandPlan;
        res.entriesMatch =
            akt1.filter(istHaus).length === r1.placed &&
            mid2 === before &&
            e1.length === r2.placed &&
            akt1.length === alle1.length &&
            res.wand1 <= wandPlan;
        res.allHaus = alle1.every((e) => istHaus(e) || e.type === "wandlaterne_dorf");
        // Slot-Anker == Plan-Slot, POSITIONS-DETERMINISTISCH: JEDES Haus BEIDER Akte trägt exakt anker + slot.x/z, phi und seed
        // seines Slots, beide Akte heben gleich viele; der zweite steht auf dem Boden des Plans v2 (y = slot.y + 0,5,
        // `_ortWahl` — derselbe Plan am selben Anker; y des ersten ist der Grund vor seinem Erdbau). Die Welt rückt kein Haus:
        // die Ersatz-Orte und die hMax-Suche fielen mit dem Erdbau.
        const v2 = await r._ortWahl(plan, o1);
        res.planV2 = !!(v2 && v2.version === 2);
        res.slotAnchorExact =
            !!v2 &&
            e1.length > 0 &&
            r1.placed === r2.placed &&
            [...akt1.filter(istHaus), ...e1].every((e) => {
                const sl = v2.slots.find((x) => x.seed >>> 0 === e.seed);
                if (!sl || e.rotationY !== (sl.phi || 0)) return false;
                return (
                    Math.abs(e.position.x - (o1.x + sl.x)) < 1e-9 &&
                    Math.abs(e.position.z - (o1.z + sl.z)) < 1e-9 &&
                    (!e1.includes(e) || Math.abs(e.position.y - (sl.y + 0.5)) < 1e-9)
                );
            });
        // HAUS-DOPPELBAU-SCHNITT — der KONSUM-Beweis lebt:
        // (a) jeder platzierte Eintrag trägt den Slot-ov als studioOv (rolle
        //     byte-gleich, per seed dem Export-Slot zugeordnet),
        // (b) der Flatten-Chokepoint LIEST ihn (_artifactStudioOv non-null) und
        //     zwei rollen-verschiedene Häuser trennen sich im ov-Hash — das
        //     Dorf ist kein Kultur-Default-Klonfeld mehr.
        res.ovTravels =
            e1.length > 0 &&
            e1.every((e) => {
                const s = plan.slots.find((sl) => sl.seed >>> 0 === e.seed);
                return (
                    s && e.studioOv && typeof e.studioOv === "object" && e.studioOv.rolle === (s.rolle || "wohnhaus")
                );
            });
        const ovA = e1.length ? r._artifactStudioOv(e1[0]) : null;
        const eB = e1.find((e) => e.studioOv && ovA && e.studioOv.rolle !== ovA.rolle);
        const ovB = eB ? r._artifactStudioOv(eB) : null;
        res.ovKeysSplit = !!(ovA && ovB && r._studioOvHash(ovA) !== r._studioOvHash(ovB));
        // der Spion am Ruf: lieferer[name] zählt (und delegiert), solange wer.methode(...args) läuft — die Zahl der Rufe
        const ruft = (wer, methode, lieferer, name, args) => {
            const eigen = Object.prototype.hasOwnProperty.call(lieferer, name);
            const echt = lieferer[name];
            let n = 0;
            lieferer[name] = function (...x) {
                n++;
                return echt.apply(this, x);
            };
            try {
                wer[methode](...args);
            } catch {
                /* ein Wurf nach dem Ruf entwertet den Konsum nicht */
            } finally {
                if (eigen) lieferer[name] = echt;
                else delete lieferer[name];
            }
            return n;
        };
        // DER ERLEBNIS-HEBEL (Schicht-Vollendung): die Hof-Bäume und Marktstände des Plans stehen, die Zäune laufen über den
        // Zaun-Pool, die Äcker in die Wege-Karte; ohne die Schichten hebt er keins davon (die Zähne). Die Probe räumt ihre Bauten.
        const erlebnis = (p, key) => {
            const n0 = r.state.architectures.length;
            const wk = r._wegeKarteEnsure();
            const b0 = wk.siedlungen.length;
            const m0 = (r.state.stlMauer || {}).top | 0;
            const zaeune = ruft(r, "_spawnSettlementErlebnis", r, "_stlZaunAddStrip", [p, o1, { key }]);
            const neu = r.state.architectures.slice(n0);
            neu.forEach((e) => r.removeArchitecture(e));
            const aecker = wk.siedlungen.slice(b0).some((b) => b.formen.some((fo) => fo.kanal === 1));
            const plan_ = [p.trees, p.staende, p.fences, p.felder].map((x) => (x || []).length).join("/");
            return {
                baeume: neu.filter((e) => e.type.indexOf("baum_") === 0).length,
                staende: neu.filter((e) => e.type === "marktstand_dorf").length,
                zaeune,
                aecker,
                plan: plan_,
                mauer: ((r.state.stlMauer || {}).top | 0) - m0,
            };
        };
        // Die Stände stehen nur auf einem Markt-Platz; der Plan des Samens 7 hat keinen — zwei Stände an Hof-Baum-Plätzen des Plans.
        res.erlebnis = v2
            ? erlebnis(
                  Object.assign({}, v2, { staende: (v2.trees || []).slice(0, 2).map((t) => ({ x: t.x, z: t.z })) }),
                  "__probe"
              )
            : null;
        res.planKern = [plan.kernel, (plan.staende || []).length];
        res.erlebnisLeer = v2
            ? erlebnis(Object.assign({}, v2, { trees: [], staende: [], fences: [], felder: [] }), "__probe2")
            : null;
        // DIE STADTMAUER (siedlung.K2): der Erlebnis-Hebel legt die Mauer des Exports der Stadt (Same 9, 36 Häuser) in den
        // Mauer-Pool — Wand und Krone je Segment, Turm und Dach je Turm; er wirft, die Natur weicht ihrer Linie
        const vS = await r._ortWahl(await r._foundryRequestSettlement({ seed: 9, nH: 36 }), o1);
        const g = vS.mauer.segs[0];
        res.stadt = Object.assign(erlebnis(vS, "__mauer"), {
            soll: 2 * (vS.mauer.segs.length + vS.mauer.towers.length),
            wirft: r.state.stlMauer.mesh.castShadow,
            natur: r._aufWeg(o1.x + (g.x0 + g.x1) / 2, o1.z + (g.z0 + g.z1) / 2, 0.5),
        });
        // DORF-IN-TERRAIN — der Footprint reist als entry.fundament (der Grundriss der Wände und des Erdbaus eines Altstands);
        // das Podest fiel mit dem Erdbau: keine Fundament-Box, kein Sockel-Pool.
        res.fundamentTravels = e1.length > 0 && e1.every((e) => e.fundament && Number.isFinite(e.fundament.ex));
        // 3) fail-closed: ein Slot mit unbekannter Kultur faellt (kein Spawn, kein Crash).
        const fake = JSON.parse(JSON.stringify(plan));
        fake.slots = [Object.assign({}, fake.slots[0], { kultur: "gibtsnicht" })];
        const o3 = { x: 900, z: 900 }; // BÜHNE: fail-closed gilt an jedem Ort
        const r3 = await r._spawnSettlementFromExport(await r._ortWahl(fake, o3), o3);
        res.failClosed = r3.placed === 0 && r3.skipped === 1;
        // 4) Γ5: spawnSettlement wuerfelt seed-frei aus dem Welt-Stream (Source-Probe am lebenden Symbol).
        // der Same zieht aus dem EINEN Bau-Strom `_bauSame("stadt")` (Welt-Seed:<art>:<n>, FNV-1a) — derselbe für
        // den Chat-Satz „baue dorf hier" (die Probe wandert mit dem Code).
        // derselbe Strom für den Chat-Satz „baue dorf hier" (kein Math.random im Satz hält gate:werkstatt-weg W1)
        const baueHier = (r.chatDslPatterns || []).find((p) => p.example === "baue dorf hier");
        res.gammaHier = !!baueHier && ruft(baueHier, "build", r, "_bauSame", [["baue dorf hier", "dorf"]]) > 0;
        res.gammaStream =
            ruft(r, "spawnSettlement", r, "_bauSame", [{ position: null }]) > 0 &&
            window.__fehlt([r.spawnSettlement, r._bauSame], /Math\.random/);
        // DER DSL-AKT spawn_village liest die Größe aus dem Siedlungs-Gesetz NACH der Buch-Ankunft: das Dorf
        // des Akts trägt nH = SIEDLUNG.nHMin + (Same >>> 24) % SIEDLUNG.nHSpan, gemessen am Rebuild-Gedächtnis (settlementCells).
        {
            const SG = r.constructor._siedlungGesetz();
            const same = 0x5a5a1234;
            const pv = { x: o1.x + 600, y: 0, z: o1.z - 600 };
            pv.y = r.getTerrainHeightAt(pv.x, pv.z);
            const ctxV = { budget: { spawnsLeft: 4 }, log: [], rng: () => 0.5, source: "human" };
            r.dslEffects.spawn_village([["at", pv.x, pv.y, pv.z], same], ctxV);
            let cell = null;
            for (const weiter = window.__deckel("B: das Dorf des DSL-Akts", 600); !cell && weiter();) {
                await sleep(100);
                const sc = r.state.worldMeta?.settlementCells || {};
                // der Wege-Schlüssel des Dorfs: d:<Same>@<Ort> (der EINE Schreiber `spawn_village`, stamm/siedlung-ort.js;
                // die Probe läuft in frischer Welt, ein älterer Stand ohne @<Ort> lädt hier nie)
                for (const key of Object.keys(sc)) if (key.startsWith(`d:${same >>> 0}@`)) cell = sc[key];
            }
            res.villageNH = cell ? cell.nH : null;
            res.villageNHSoll = SG ? r.constructor.Gesetz("fachwerk:siedlungsGroesse")(SG, same, 0) : null;
        }
        // ===== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) =====
        res.c = {};
        window.__marke("C");
        {
            const A = r.constructor.AUTO_SETTLEMENT;
            // C1 — die Zell-Wahrheit des Wirts zieht aus dem Strom des Welt-Seeds (Γ5) und kehrt mit ihm zurück; Seltenheit,
            // Größen und Determinismus des Gesetzes (fachwerk `siedlungsZelle` am Kern-Hash) misst Teil Z über 8 × 32 × 32 km.
            const zelleN = (n) => r._autoSettlementCellInfo((n % 13) - 6, Math.floor(n / 13) - 6);
            const cand = [...Array(169).keys()].map(zelleN).find((i1) => i1 && r._autoSettlementSiteOk(i1.x, i1.z));
            const zellen = () =>
                [...Array(169).keys()]
                    .map(zelleN)
                    .filter(Boolean)
                    .map((z) => z.key + ":" + z.seed)
                    .join("|");
            const wmS = r.state.worldMeta;
            const s0 = wmS.seed;
            const z0 = zellen();
            wmS.seed = (s0 || "anazh-realm-seed") + ":x";
            const z1 = zellen();
            wmS.seed = s0;
            res.c.seedStrom = z0 !== "" && z0 !== z1 && z0 === zellen();
            res.c.spawnClearWall = r._autoSettlementSiteOk(0, 0) === false; // die Warmup-Welt bleibt dorffrei
            // C2 — HEADLESS-DEFAULT: Null-Renderer ohne Hook -> der Tick ruht (kein Pending).
            const prevHook = window.__anazhAutoSettlement;
            delete window.__anazhAutoSettlement;
            if (cand) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.headlessQuiet = !r._autoSettlementPendingKey && !r._autoSettlementQueue;
            // C3 — die ERZWUNGENE Dorf-Zelle (Hook an, sichern + wiederherstellen):
            // Export -> Reservierung -> budgetierte Materialisierung ueber Ticks.
            window.__anazhAutoSettlement = true;
            const wm = r.state.worldMeta;
            const key = cand ? cand.key : null;
            const [kx, kz] = key ? key.split(",").map(Number) : [];
            const archBefore = r.state.architectures.length;
            const plan = cand ? await r._autoSettlementSpawnCell(kx, kz, cand) : null;
            res.c.planOk = !!(plan && Array.isArray(plan.slots));
            // DORF-ERLEBNIS — das Band wandert MIT dem Gesetz: die
            // Reservierung ist jetzt das Rebuild-Gedächtnis-OBJEKT {seed,nH,x,z}.
            res.c.reserved = !!(
                key &&
                wm.settlementCells &&
                wm.settlementCells[key] &&
                typeof wm.settlementCells[key] === "object" &&
                isFinite(wm.settlementCells[key].seed)
            );
            // EXISTENZ VOR FRAMERATE (Lehre 13): über dem Frame-Budget DROSSELT der Takt das
            // Tempo, er sperrt die Siedlung nie — 16 Takte dauerhaft über dem Budget tragen Häuser, höchstens einen je
            // drosselTakte-ten Takt.
            // Gemessen über den ECHTEN Job-Pfad (Q0): der Frame-Dispatcher (`_dispatchFrameJobs`) mit den Jobs des Spiels
            // (`_buildDeferrableJobs`, der Spieler steht, wo er steht) und einem ausgeschöpften Budget — die Deko (prio 2,
            // `scatterDeco` → `_tickScatterStreaming` → `_tickAutoSettlement`) läuft dort nur jeden 4. Frame und nie in
            // einem Frame mit Chunk-Bau. Gezählt wird in Frames, bis zwei Slots bearbeitet sind (höchstens 3000 Frames ≈ 50 s
            // bei 60 Bildern/s): die Siedlung wächst über dem Budget — je Deko-Lauf ohne Chunk-Bau höchstens 1/drosselTakte Slot.
            const fob = r.state._frameOverBudget;
            const drossel = A.drosselTakte || 8;
            const B = r._makeFrameBudget(0);
            const pmP = r.state.playerMesh.position;
            const qIdx0 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : null;
            const qJetzt = () => (r._autoSettlementQueue ? r._autoSettlementQueue.idx : null);
            // erst steht der Ring (der Boden zuerst — ein Frame mit Chunk-Bau trägt keine Deko): normale Frames, bis 60 in
            // Folge ohne Chunk-Bau laufen; der Auto-Zug ruht dabei (Hook aus), die Schlange wartet auf die Messung
            let ruhig = 0;
            let vorlauf = 0;
            r.state._frameOverBudget = false;
            window.__anazhAutoSettlement = false;
            while (ruhig < 60 && vorlauf < 3000) {
                B.totalMs = Infinity;
                B.startFrame();
                r.state._frameChunksBuilt = false;
                r._dispatchFrameJobs(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }), B);
                ruhig = r.state._frameChunksBuilt ? 0 : ruhig + 1;
                vorlauf++;
                await sleep(0);
            }
            res.c.vorlaufFrames = vorlauf;
            window.__anazhAutoSettlement = true;
            const qStart = qJetzt();
            let dekoLaeufe = 0;
            let FRAMES = 0;
            while (FRAMES < 3000 && r._autoSettlementQueue && qJetzt() - qStart < 2) {
                B.totalMs = 0;
                B.startFrame();
                r.state._frameChunksBuilt = false;
                r.state._frameOverBudget = true;
                const ran = r._dispatchFrameJobs(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }), B);
                if (ran.includes("scatterDeco") && !r.state._frameChunksBuilt) dekoLaeufe++;
                FRAMES++;
                await sleep(0);
            }
            // gezählt werden die bearbeiteten Slots (ein Slot an Wasser/Klippe fällt geschlossen, er zählt als Schritt)
            const qIdx1 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : qIdx0;
            res.c.ueberBudget = Number.isFinite(qStart) && Number.isFinite(qIdx1) ? qIdx1 - qStart : null;
            res.c.ueberBudgetFrames = FRAMES;
            res.c.dekoLaeufe = dekoLaeufe;
            res.c.budgetWall = res.c.ueberBudget >= 1 && res.c.ueberBudget <= Math.floor(dekoLaeufe / drossel) + 1;
            r.state._frameOverBudget = false;
            // die Materialisierung über Ticks (das Budget je Schritt des Zugs misst Teil B am Akt, `zugAkt`)
            let ticks = 0;
            for (; r._autoSettlementQueue && ticks < 500; ticks++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            const archAfter = r.state.architectures.length;
            res.c.placed = archAfter - archBefore;
            res.c.ticks = ticks;
            // DORF-ERLEBNIS — die Siedlung hebt auch BRUNNEN (brunnen_dorf) und HOF-BÄUME (Studio-Bäume der
            // trees-Schicht): das Band wandert mit dem Gesetz.
            res.c.allHaus = r.state.architectures
                .slice(archBefore)
                .every(
                    (e) =>
                        typeof e.type === "string" &&
                        (e.type.indexOf("haus_") === 0 ||
                            e.type === "brunnen_dorf" ||
                            e.type === "marktstand_dorf" ||
                            e.type === "laterne_dorf" ||
                            e.type === "wandlaterne_dorf" ||
                            e.type.indexOf("baum_") === 0)
                );
            // C4 — IDEMPOTENZ: dieselbe Zelle nochmal -> 0 neue (Reservierung traegt).
            const again = await r._autoSettlementSpawnCell(kx, kz, cand);
            for (let t2 = 0; t2 < 5; t2++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.idempotent = again === null && r.state.architectures.length === archAfter;
            // C5 — DER GENESIS-PORTAL-RING (Schöpfer: „beim ersten spawn
            // die kernportale um die genesis-plattform anordnen"): am Genesis-Ort
            // (`_genesisMitte`, die Mitte der Start-Plattform — Welle L, V-D1) heben alle builtIn-Welt-Portale im
            // Kreis R 11 m; doppelt idempotent
            // (worldMeta-Stempel + Existenz-Probe).
            res.c.ring = {};
            window.__marke("C5");
            {
                const wm5 = r.state.worldMeta;
                const M5 = r._genesisMitte();
                const d2M = (e) => (e.position.x - M5.x) ** 2 + (e.position.z - M5.z) ** 2;
                delete wm5.genesisPortalRing;
                r._genesisRingFertig = false;
                const portalArten = Object.keys(r.state.blueprints || {}).filter((n) => {
                    const b = r.state.blueprints[n];
                    return b && b.builtIn && b.role === "portal" && b.portalMeta && b.portalMeta.world;
                });
                res.c.ring.arten = portalArten.length;
                const imRing = () =>
                    r.state.architectures.filter(
                        (e) => e && e.position && portalArten.includes(e.type) && d2M(e) <= 400
                    ).length;
                const ringVorher = imRing();
                for (let t5 = 0; t5 < 30 && !wm5.genesisPortalRing; t5++)
                    r._genesisPortalRing({ x: M5.x, y: 1, z: M5.z });
                res.c.ring.stempel = wm5.genesisPortalRing === true;
                res.c.ring.gebaut = imRing() - ringVorher;
                const archRing = r.state.architectures.length;
                r._genesisPortalRing({ x: M5.x, y: 1, z: M5.z }); // Idempotenz: der Stempel traegt
                res.c.ring.idempotent = r.state.architectures.length === archRing;
                // Radius-Probe: jedes neue Ring-Portal sitzt auf ~R 11 (±2 m)
                res.c.ring.radiusOk = r.state.architectures
                    .filter((e) => e && e.position && portalArten.includes(e.type))
                    .slice(-res.c.ring.gebaut)
                    .every((e) => {
                        const d = Math.sqrt(d2M(e));
                        return d > 9 && d < 13;
                    });
            }
            // C6 — DER WEGE-SCHLÜSSEL TRÄGT DEN ORT: zwei Siedlungen mit DEMSELBEN Samen an
            // zwei Orten bauen je ihre Wege (die Wege-Formen werden am echten Bau gezählt, `_stlWegeBuild` läuft durch).
            window.__marke("C6");
            {
                const orig = r._stlWegeBuild;
                const formen = [];
                r._stlWegeBuild = function (...a) {
                    const n6 = orig.apply(this, a);
                    formen.push(n6);
                    return n6;
                };
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: 1500, y: 0, z: 1500 } });
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: -1500, y: 0, z: 1500 } });
                r._stlWegeBuild = orig;
                res.c.wegeJeOrt = formen;
            }
            // C7 — DER BLICK GEHÖRT DEM, DER DAS DORF VERLANGT: ein Dorf aus einem Nexus-Programm (DSL-Quelle „nexus") lässt den Blick des Spielers
            // stehen; eines aus dem Chat-Programm des Spielers (DSL-Quelle „human") und der Befehl „dorf" richten ihn auf IHR
            // neues Dorf (den Schwerpunkt der eben gesetzten Häuser) — nie auf alle Häuser der Welt.
            window.__marke("C7");
            {
                const pm = r.state.playerMesh;
                const orig = r.spawnSettlement;
                let laeuft = null;
                r.spawnSettlement = function (o) {
                    laeuft = orig.call(this, o);
                    return laeuft;
                };
                const probe = async (px, pz, setzen) => {
                    pm.position.set(px, r.getTerrainHeightAt(px, pz) + 1.2, pz);
                    r.state.yaw = 1;
                    const vorher = new Set(r.state.architectures);
                    laeuft = null;
                    setzen();
                    if (laeuft) await laeuft;
                    const neu = r.state.architectures.filter(
                        (e) => e && !vorher.has(e) && typeof e.type === "string" && e.type.startsWith("haus_")
                    );
                    let cx = 0,
                        cz = 0;
                    for (const e of neu) {
                        cx += e.position.x;
                        cz += e.position.z;
                    }
                    const soll = neu.length ? r._blickGierZu(cx / neu.length - px, cz / neu.length - pz) : null;
                    const d = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
                    return {
                        haeuser: neu.length,
                        gier: +r.state.yaw.toFixed(4),
                        gedreht: +d(r.state.yaw, 1).toFixed(4),
                        nebenDorf: soll === null ? null : +d(r.state.yaw, soll).toFixed(4),
                    };
                };
                const dorf = (same, source) => () => r.dslRun(["spawn_village", ["at_player"], same], { source });
                res.c.blick = {
                    nexus: await probe(1500, -1500, dorf(4712, "nexus")),
                    spieler: await probe(-1500, -1500, dorf(4713, "human")),
                    chat: await probe(1800, 600, () => {
                        const muster = r.chatSystemPatterns.find((q) => q.re.test("dorf 4714 8"));
                        muster.run("dorf 4714 8".match(muster.re), () => {});
                    }),
                    // die Werkzeuge des Spielers: Fähigkeit per Taste, Wirken, Verzehr — und ein Mitspieler (für die Welt)
                    faehigkeit: await probe(-1800, 600, dorf(4715, "ability:dorfruf")),
                    wirken: await probe(1800, -600, dorf(4716, "capability:dorf")),
                    verzehr: await probe(-1800, -600, dorf(4717, "consume:dorfsamen")),
                    mitspieler: await probe(600, 1800, dorf(4718, "remote-peer")),
                };
                r.spawnSettlement = orig;
            }
            // C-K5 — DAS ERSTE HAUS AM ERWACHEN (siedlung.K5): die Zelle von C3, der Spieler naht durch den Vorlauf-Ring; `haus` =
            // Takte vom Erwachen bis zum ersten Slot, `plaene` = Pläne v2 (`ortPlan`) im Haupt-Thread und im Ort-Faden
            // (`_ortWahlMass.kandidaten`); `alt` (Selbsttest) stellt die Schichten des Gangs vor das erste Haus
            res.c.k5 = {};
            window.__marke("C-K5");
            const FC = globalThis.__fachwerkCore;
            const ortPlan0 = FC.ortPlan;
            const alt = ["_autoSettlementRejected", "_stlWegePending", "_autoSettlementQueue"].map((f) => r[f]);
            const zelle = wm.settlementCells[key];
            const vorher = [new Set(r.state.architectures), new Set(Object.keys(wm.erdbau || {}))];
            // die Läufe gehen samt Bauten, Erdbau und Wegen (für den nächsten Lauf und Teil O)
            const raeume = () => {
                for (const e of r.state.architectures.filter((e) => !vorher[0].has(e))) r.removeArchitecture(e);
                for (const k of Object.keys(wm.erdbau).filter((k) => !vorher[1].has(k))) {
                    const s = wm.erdbau[k];
                    delete wm.erdbau[k];
                    r._erdbauWirkt(s, false);
                }
                if (r._stlWegeKeys) r._stlWegeKeys.delete(key);
            };
            const pm = r.state.playerMesh;
            const p0 = pm.position.clone();
            // kx, kz: die Zelle von C3 (oben einmal aus `key` gelesen)
            const lauf = async (nH, vorlauf, alt, fern) => {
                r.state._frameOverBudget = false;
                const seed = (cand.seed ^ Math.imul(nH * 2 + !vorlauf, 0x9e3779b1)) >>> 0;
                r._autoSettlementCellInfo = (x, z) => (x === kx && z === kz ? { ...cand, seed, nH } : null);
                Object.assign(r, {
                    _autoSettlementRejected: new Set(),
                    _stlWegePending: true,
                    _autoSettlementQueue: null,
                });
                delete wm.settlementCells[key];
                let [wach, erst, haus, haupt, vor] = [false, null, -1, 1, 0];
                r._foundryFlattenFor = function (e, ...a) {
                    vor += !wach && /^haus_/.test(e.type);
                    return r.constructor.prototype._foundryFlattenFor.call(this, e, ...a);
                };
                FC.ortPlan = function (p, ...a) {
                    haupt += wach && p && p.slots ? 1 : 0;
                    return ortPlan0.call(this, p, ...a);
                };
                const lift = r.constructor.prototype._spawnSettlementSlot;
                r._spawnSettlementSlot = function (sl, o, ...a) {
                    const q = r._autoSettlementQueue;
                    if (!erst && q && q.cellKey === key) erst = q;
                    return lift.call(this, sl, o, ...a);
                };
                const zug = r._dorfZug;
                if (alt)
                    r._dorfZug = (p, o, k, g) =>
                        zug.call(
                            r,
                            p,
                            o,
                            k,
                            (function* () {
                                for (const v of g) if (v !== true) yield v;
                                yield true;
                            })()
                        );
                const stell = (m) => (pm.position.set(cand.x + m, pm.position.y, cand.z), pm.position);
                const nah = A.nearM + (cand.mehrM || 0); // der Ring, an dem die Zelle erwacht (`_autoSettlementZelle`)
                if (vorlauf) r._tickAutoSettlement(stell(nah + 80));
                if (vorlauf) for (const v of r._dorfVorraete.values()) await v.fertig;
                for (let i = 0; vorlauf && !alt && i < 20; i++) r._tickAutoSettlement(pm.position);
                // der Gang durch den Vorlauf-Ring (4 m/s, 20 s bis zum Ring): je 4 m ein Takt, der Vorrat liest die Reihe des Zugs,
                // bis seine Stufen stehen — dann erwacht die Zelle am Ring (das Auge des Vorrats, `_dorfVorbacken`)
                const vr = vorlauf && !alt && r._dorfVorraete.get(key);
                for (let m = nah + 80; vr && m > nah + 1; m -= 4)
                    for (let i = 0; i < 400 && (r._tickAutoSettlement(stell(m)), !vr.vorgebacken); i++)
                        await sleep(5);
                const vor0 = new Set(r.state.architectures); // die Häuser der Läufe davor zählen nie
                const pw = stell(nah - 2);
                // DAS ERSTE HAUS IM BILD (sk5-haus): `bild` = Takte vom Erwachen, bis ein Haus der Zelle in der Stufe steht, die
                // seine Kette für seinen Abstand wählt — in der Mesh-Zone seine gedockte Stufe (`_foundryPlatzBereit`), dahinter
                // seine Hülle im Welt-March über den Chokepoint des Cull-Takts (`_archZiegelFern`; der Null-Renderer zeichnet kein
                // Feld, die Linse öffnet es je Ruf). Der Fit-Takt ist voll wie am Dorf: nähere Fits fragten zuerst (Werkbank am
                // Messort dorf: 49 ja / 1 210 nein). `nahImSchirm`: ein Slot der Mesh-Zone mit der Mitte im Schirm; `fern`
                // (Selbsttest) dreht die Reihe des Zugs um — die Hülle vor dem Haus in der Mesh-Zone.
                const [R, rd] = [r.state.architectureCullingRadius, r.state.renderer];
                const d = (q) => Math.hypot(q.x - pw.x, q.z - pw.z);
                const stufe = (e) => {
                    if (d(e.position) <= R) return r._foundryPlatzBereit(e, r._foundryPresetForEntry(e)) && "mesh";
                    while (r._weltBakeErlaubt(0));
                    rd._isHeadlessNull = false;
                    r._archZiegelFern(e);
                    rd._isHeadlessNull = true;
                    return e._ziegelSlot && "huelle";
                };
                if (fern) r._dorfZug = (...a) => ((q) => (q.reihe.reverse(), q))(zug.apply(r, a));
                let [bild, erstes] = [-1, null];
                wach = true;
                for (
                    const weiter = window.__deckel("C-K5: das erste Haus", 400, () => !!r._autoSettlementPendingKey);
                    (!erst || (!erstes && bild < 400)) && weiter();
                ) {
                    haus += !erst;
                    r._tickAutoSettlement(pw);
                    bild++;
                    const e = r.state.architectures.find((e) => !vor0.has(e) && /^haus_/.test(e.type) && stufe(e));
                    if (e) erstes = { typ: e.type, stufe: stufe(e), d: +d(e.position).toFixed(1) };
                    await sleep(5);
                }
                r._dorfZug = zug;
                const nahImSchirm = (erst ? erst.plan.slots : []).some((s) => {
                    const q = { x: erst.origin.x + s.x, z: erst.origin.z + s.z };
                    return d(q) <= R && r._imErstenBlick(q.x, q.z, 0, true);
                });
                return (
                    erst && {
                        nH,
                        plaene: haupt + r._ortWahlMass.kandidaten,
                        haus,
                        vor,
                        bild,
                        erstes,
                        nahImSchirm,
                    }
                );
            };
            try {
                for (const [k, nH, v, alt, fern] of [
                    ["vorlauf12", 12, 1],
                    ["vorlauf300", 300, 1],
                    ["fern300", 302, 1, 0, 1],
                    ["teleport12", 12, 0],
                    ["teleport300", 300, 0],
                    ["alt300", 301, 1, 1],
                ])
                    res.c.k5[k] = await lauf(nH, v, alt, fern);
                delete r._foundryFlattenFor;
                res.c.k5.drossel = A.drosselTakte;
                const y = r.state.yaw;
                const slot = (d, w, e = 3) => ({
                    x: d * Math.sin(y + w),
                    z: d * Math.cos(y + w),
                    obb: { ex: e, ez: e },
                });
                // DIE MITTE ZUERST (siedlung-k5-erstes-haus, Winkel in rad): 11 m bei 70° mit 10-m-Grundriss streift der Bildwinkel
                // nur — die Mitte 40 m voraus hebt vor ihm, er vor dem 15 m neben dem Spieler (die Scheibe allein hob ihn zuerst)
                res.c.k5.schirm = r._dorfZug(
                    { slots: [slot(15, 1.57), slot(40, 0), slot(11, 1.22, 5)] },
                    pm.position
                ).reihe;
                // C-K5c DER ORT IST EINE FUNKTION (Lehre 7): zwei Vorläufe derselben Saat, der Spieler 3,7 m versetzt im Vorlauf-Ring
                // — der Plan v2 bit-gleich, sonst die erste abweichende Größe; `stoer` (Selbsttest) rückt den Wunsch mit ihm
                const i3 = { ...cand, seed: (cand.seed ^ 0x51ed) >>> 0, nH: 300 };
                const fnv = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
                const ortLauf = async (d, stoer) => {
                    Object.assign(r, { _dorfVorraete: new Map(), _ortPlaene: new Map(), _ortWahlFlug: new Map() });
                    pm.position.set(i3.x + d, pm.position.y, i3.z);
                    const wahl = r._ortWahl;
                    if (stoer)
                        r._ortWahl = (p, o, ...a) => wahl.call(r, p, Object.assign(o, { x: o.x + d / 1e3 }), ...a);
                    const b = await r._dorfBereiten(key, i3).finally(() => delete r._ortWahl);
                    const v2 = r._ortPlaene.get(r.constructor._ortSchluessel(b.plan, b.anker));
                    const s = [
                        b.anker.x,
                        b.anker.z,
                        v2.ort.x,
                        v2.ort.z,
                        ...v2.slots.flatMap((q) => [q.x, q.z, q.y, q.phi]),
                    ];
                    return { s, erdbau: fnv(JSON.stringify(v2.erdbau)), hash: fnv(JSON.stringify(v2)) };
                };
                const erste = (a, b) => {
                    const i = a.s.findIndex((v, j) => v !== b.s[j]);
                    const name =
                        ["anker.x", "anker.z", "ort.x", "ort.z"][i] ||
                        `slot ${(i - 4) >> 2}.${"xzy"[(i - 4) & 3] || "phi"}`;
                    return i >= 0 ? `${name} ${a.s[i]} ≠ ${b.s[i]}` : a.erdbau !== b.erdbau ? "erdbau" : null;
                };
                const ortPaar = async (stoer) => {
                    const [a, b] = [await ortLauf(A.nearM + 140, stoer), await ortLauf(A.nearM + 136.3, stoer)];
                    return { hash: [a.hash, b.hash], erste: erste(a, b) };
                };
                window.__marke("C-K5c");
                res.c.k5.ort = await ortPaar(false);
                res.c.k5.ortStoer = await ortPaar(true);
                // C-K5d DAS ERWACHEN IN RATEN (Lehre 14): je Takt vom Erwachen bis zum letzten Haus (`_tickAutoSettlement`, seine
                // Mikro-Tasks, `_wegeRaeumen`) die Schritte des Dorfs und die ms; `voll` (Selbsttest) baut alles im ersten Takt
                const wachLauf = async (voll) => {
                    raeume();
                    Object.assign(r, { _dorfVorraete: new Map(), _ortPlaene: new Map(), _autoSettlementQueue: null });
                    delete wm.settlementCells[key];
                    pm.position.set(i3.x + A.nearM + 80, pm.position.y, i3.z);
                    await r._dorfBereiten(key, i3);
                    const pw = pm.position.set(i3.x + A.nearM - 20, pm.position.y, i3.z).clone();
                    let [s, im] = [{}, 0];
                    const zaehl = (n, art, f = r.constructor.prototype[n]) =>
                        (r[n] = function (...a) {
                            if (!im && (n !== "spawnArchitecture" || /^(brunnen|marktstand)_dorf$/.test(a[0])))
                                s[art] = (s[art] || 0) + 1;
                            return f.apply(this, a);
                        });
                    // EINE Tafel der Haken: sie zählen, und der Lauf löst sie (samt der Slot-Quelle)
                    const HAKEN = {
                        _erdbauSetzen: "erdbau",
                        _erdbauAmWasser: "erdbau",
                        _stlWegeBuild: "wege",
                        _dorfLaterneSetzen: "laternen",
                        spawnArchitecture: "ausstattung",
                        _naturSetzen: "ausstattung",
                    };
                    for (const n in HAKEN) zaehl(n, HAKEN[n]);
                    const slot = r._spawnSettlementSlot;
                    r._spawnSettlementSlot = function (...a) {
                        im++;
                        try {
                            return ((s.haeuser = (s.haeuser || 0) + 1), slot.apply(this, a));
                        } finally {
                            im--;
                        }
                    };
                    const takte = [];
                    r._wegeRaeumen(); // die Flächen der Läufe davor
                    try {
                        for (
                            let t = 0, weiter = window.__deckel("C-K5d", 400, false);
                            t === 0 || r._autoSettlementQueue;
                            t++
                        ) {
                            weiter();
                            s = {};
                            const t0 = performance.now();
                            if (t) r._tickAutoSettlement(pw);
                            else r._autoSettlementSpawnCell(kx, kz, i3);
                            for (let m = 0; m < 3; m++) await Promise.resolve();
                            if (voll && !t)
                                for (pm.position.x += 2000; r._autoSettlementQueue;) r._tickAutoSettlement(pw);
                            r._wegeRaeumen();
                            takte.push({ ms: +(performance.now() - t0).toFixed(1), s });
                            // steht der Spieler im Grund jedes offenen Slots (`_dorfZugSchritt`), geht er
                            const q = r._autoSettlementQueue;
                            if (t && q && !q.gang && !s.haeuser) pm.position.x += 2000;
                        }
                    } finally {
                        for (const n of [...Object.keys(HAKEN), "_spawnSettlementSlot"]) delete r[n];
                    }
                    const zeile = (t, i) =>
                        `Takt ${i} ${t.ms} ms: ${Object.entries(t.s)
                            .map(([k, n]) => `${k} ${n}`)
                            .join(" · ")}`;
                    const lang = takte.map((_t, i) => i).sort((a, b) => takte[b].ms - takte[a].ms);
                    return {
                        takte: takte.length,
                        haus: takte.findIndex((t) => t.s.haeuser),
                        mehr: takte
                            .map(zeile)
                            .filter((_z, i) => Object.keys(takte[i].s).length > 1)
                            .slice(0, 3),
                        max: lang.slice(0, 4).map((i) => zeile(takte[i], i)),
                        kopf: takte.slice(0, 6).map(zeile),
                    };
                };
                window.__marke("C-K5d");
                res.c.k5.wach = await wachLauf(false);
                res.c.k5.wachVoll = await wachLauf(true);
            } finally {
                FC.ortPlan = ortPlan0;
                for (const f of ["_autoSettlementCellInfo", "_spawnSettlementSlot", "_dorfZug"]) delete r[f];
                [r._autoSettlementRejected, r._stlWegePending, r._autoSettlementQueue] = alt;
                Object.assign(r, { _autoSettlementPendingKey: null, _dorfVorraete: new Map() });
                wm.settlementCells[key] = zelle;
                pm.position.copy(p0);
                raeume();
            }
            // Hook wiederherstellen (sichern + wiederherstellen, nie loeschen — die Disziplin):
            if (prevHook === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = prevHook;
            r.state._frameOverBudget = fob;
        }
        return res;
    });
    const wurf = await jeMarke(async () => {
        window.__marke("Selbsttest");
        throw "__probeWurf";
    });
    check("B/C: jede Probe kehrt an ihrer Marke zurück", !out.bruch, out.bruch);
    check(
        "B/C Selbsttest: die Probe, die wirft, steht beim Namen ihrer Marke",
        wurf.bruch === "Selbsttest: __probeWurf"
    );
    // die gebrochene Probe hält ihre Haken in der Seite (ein Hänger läuft nie in sein finally)
    if (out.bruch) await page.reload().then(bereit);

    // ===== TEIL O: DER ORT AUF DEM GELÄNDE — das Dorf 7/18 der Gründerzeit an einem Hang, gemessen an der Welt =====
    // Der Akt `spawnSettlement` an einem Hang (Gefälle 0,12–0,25 über 16 m, fern der Orte der Teile B und C); gemessen wird,
    // was die Welt trägt: die Häuser (Eintrag: Ort, Gier, Boden y − 0,5), der Grund unter und vor ihnen (`getTerrainHeightAt`,
    // der Boden der Körper), der Wald-Plan (`_forestCellDarts`), die Laternen (Einträge der Studio-Gestalt laterne) und der
    // Plan v2 (`_ortPlaene`).
    const messeOrt = async (modus, messort) => {
        const dpO = { seed: 7, nH: 18, epoche: "gruenderzeit" };
        const outO = await page.evaluate(
            async (urteilSrc, dp, modus, messort) => {
                const r = window.anazhRealm;
                const ortUrteil = new Function(urteilSrc)();
                const res = {};
                try {
                    const H = (x, z) => r._terrainMacroSurfaceY(x, z, true);
                    const L = r._gelaende();
                    const vorher = r.state.architectures.length;
                    const zellenVor = new Set(Object.keys(r.state.worldMeta?.settlementCells || {}));
                    let plan;
                    if (modus === "auto") {
                        // DAS AUTO-DORF DER WELT (Pflicht-OFFEN C): der Dorf-Zug, wie er im Spiel läuft — der Spieler steht am
                        // Mess-Ort `dorf` (spec/profiband/haushalt.json), der Takt (`_tickAutoSettlement`) wählt die Zelle, holt den
                        // Export, legt den Plan v2 und baut die Häuser budgetiert über seine Takte
                        const pm = r.state.playerMesh;
                        pm.position.set(messort[0], H(messort[0], messort[1]) + 1, messort[1]);
                        const SG = r.constructor._siedlungGesetz();
                        const [cx, cz] = [Math.floor(messort[0] / SG.cellM), Math.floor(messort[1] / SG.cellM)];
                        const zelle = (res.zelle = cx + "," + cz);
                        const cells = () => r.state.worldMeta?.settlementCells || {};
                        // DER SELBST-TEST (Karte SO): ein zweites Dorf im Fenster, die
                        // erste Dorf-Zelle des Gesetzes drei Zellen weit (ihr Bau berührt die Zelle nie), kommt zuerst an und wächst zuerst
                        for (let i = 0; i < 49 && !res.zweit; i++) {
                            const [dx, dz] = [(i % 7) - 3, Math.floor(i / 7) - 3];
                            const zi =
                                Math.max(Math.abs(dx), Math.abs(dz)) === 3 &&
                                r._autoSettlementCellInfo(cx + dx, cz + dz);
                            if (!zi || cells()[zi.key]) continue;
                            r._autoSettlementSpawnCell(cx + dx, cz + dz, zi);
                            res.zweit = r._autoSettlementPendingKey === zi.key ? zi.key : "abgewiesen";
                        }
                        // das Fenster endet am Ereignis DER Zelle (reserviert, ihre Schlange gewachsen), nie an der Ruhe aller Dörfer; baut
                        // der Zug sie nie, ruht er ohne sie (nichts unterwegs über drosselTakte Takte) — die Uhr wacht nur gegen ein Hängen
                        const leer = () =>
                            !r._autoSettlementQueue && !r._autoSettlementPendingKey && !r._stlWegePending;
                        const hook0 = window.__anazhAutoSettlement;
                        window.__anazhAutoSettlement = true;
                        try {
                            for (let still = 0; still <= r.constructor.AUTO_SETTLEMENT.drosselTakte;) {
                                const vor = leer();
                                r._tickAutoSettlement(pm.position);
                                const q = r._autoSettlementQueue;
                                if (cells()[zelle] && !(q && q.cellKey === zelle)) break;
                                still = vor && leer() ? still + 1 : 0;
                                await sleep(20);
                            }
                        } finally {
                            window.__anazhAutoSettlement = hook0;
                        }
                        const c = cells()[zelle];
                        if (!c || !Number.isFinite(c.seed)) {
                            res.err = `der Dorf-Zug baut an ${messort.join("/")} kein Dorf der Zelle ${zelle}`;
                            return res;
                        }
                        plan = { seed: c.seed, nH: c.nH, epoche: r._siedlungEpoche(c.seed) };
                    } else {
                        const ort = globalThis.__gelaendeCore.hangOrt(L, (x, z) => r._landAt(x, z, 0.2));
                        res.hang = ort;
                        if (!ort) return res;
                        plan = dp;
                        await r.spawnSettlement(
                            Object.assign({}, dp, { position: { x: ort.x, y: H(ort.x, ort.z), z: ort.z } })
                        );
                    }
                    // DIE ZELLE, DIE DER LAUF BESTELLT HAT (Karte SO): ihr Gedächtnis (`settlementCells`: die Zelle am Mess-Ort, im
                    // Akt der neue Eintrag mit seinem Samen) trägt den Anker, ihr Plan v2 ist der mit ihrem Samen an ihrem Ort, ihre
                    // Häuser und Laternen stehen am Anker + Slot bzw. Laterne des Plans — nie die erste neue Zelle, der letzte Plan
                    // oder alle Bauten seit vorher (die Ankunfts-Reihenfolge mischte ein zweites Dorf im Fenster ein)
                    const sc = r.state.worldMeta?.settlementCells || {};
                    const neuKeys = Object.keys(sc).filter((k) => !zellenVor.has(k));
                    const zc = sc[res.zelle || neuKeys.find((k) => sc[k]?.seed === dp.seed)];
                    const anker = zc ? { x: zc.x, z: zc.z } : null;
                    // der Export am Ort der Trasse (`wx`, `wz`), wie ihn der Wege-Bau nach dem Laden holt (siedlung.K3)
                    plan = await r._foundryRequestSettlement(
                        Object.assign({}, plan, zc && { ort: { x: zc.wx, z: zc.wz } })
                    );
                    const amOrt = (e, l) =>
                        !!anker &&
                        Math.abs(e.position.x - anker.x - l.x) + Math.abs(e.position.z - anker.z - l.z) < 0.01;
                    const v2 = [...((anker && r._ortPlaene) || new Map()).values()].find(
                        (p) => p.seed >>> 0 === zc.seed >>> 0 && p.ort.x === anker.x && p.ort.z === anker.z
                    );
                    const P = v2 || plan;
                    res.anker = anker;
                    res.planV2 = !!v2;
                    res.trasse = v2 &&
                        zc && {
                            zelle: res.zelle || "Akt",
                            versatzM: +Math.hypot(anker.x - zc.wx, anker.z - zc.wz).toFixed(1),
                            aussen: (plan.trasse || {}).aussen,
                            v2: { ort: v2.ort, roads: v2.roads },
                        };
                    const istHaus = (e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0;
                    const haeuser = r.state.architectures.filter(
                        (e) => istHaus(e) && P.slots.some((sl) => sl.seed >>> 0 === e.seed && amOrt(e, sl))
                    );
                    res.haeuser = haeuser.length;
                    // die Ankunfts-Lesart (bis Karte SO) für den Selbst-Test: die erste neue Zelle, alle Häuser seit vorher — und das
                    // Ereignis, das er prüft (W9): der Eintrag des zweiten Dorfs steht VOR dem der Zelle (der Zug hält EINE Zelle unterwegs)
                    const [iZ, iZweit] = [neuKeys.indexOf(res.zelle), neuKeys.indexOf(res.zweit)];
                    res.ankunft = {
                        zelle: neuKeys[0],
                        haeuser: r.state.architectures.slice(vorher).filter(istHaus).length,
                        zweitVor: iZweit >= 0 && iZweit < iZ,
                    };
                    const PR = globalThis.__fachwerkCore.PRESETS;
                    const laternen = r.state.architectures.filter(
                        (e) =>
                            [PR.laterne?.fx?.licht, PR.wandlaterne?.fx?.licht].includes(r._lichtDatumDerGestalt(e)) &&
                            (P.laternen || []).some((l) => amOrt(e, l))
                    );
                    const masten = laternen.filter((e) => r._lichtDatumDerGestalt(e) === PR.laterne?.fx?.licht);
                    // gezählt am EXPORT (die Slots des Studios): der Plan v2 wirft nasse Slots, bevor er steht (fachwerk `ortPlan`,
                    // `wasserSlots`) — an ihm gezählt sähe die Linse die Häuser nie, die ein Ort ohne trockenen Grund verliert
                    res.slots = plan.slots.length;
                    res.wasserSlots = (v2 && v2.wasserSlots) || 0;
                    // DER TÄTER JE FEHLENDEM HAUS: die Wand der EINEN Slot-Quelle, an der der Slot fiel — das Wasser
                    // (`_fundamentLand`) oder ein Bau im Weg (`_bauFrei`, mit den Bauten, die keine Natur sind, binnen 8 m)
                    // die Meldung der Ort-Wahl (`_ortWahl`: kein trockener Ort in den Ringen) und ihre Kosten (`_ortWahlMass`)
                    res.ortMass = r._ortWahlMass;
                    res.ortWahl = (r.state.logBuffer || [])
                        .map(String)
                        .filter((z) => /ORT: der Plan/.test(z))
                        .slice(-2);
                    res.slotFehl = [];
                    if (anker)
                        for (const sl of P.slots) {
                            if (haeuser.some((e) => e.seed === sl.seed >>> 0)) continue;
                            const ry = sl.phi || 0;
                            const ob = sl.obb;
                            const dx = ob ? ob.cx - sl.x : 0;
                            const dz = ob ? ob.cz - sl.z : 0;
                            const fp = ob
                                ? {
                                      ex: ob.ex,
                                      ez: ob.ez,
                                      ox: dx * Math.cos(ry) - dz * Math.sin(ry),
                                      oz: dx * Math.sin(ry) + dz * Math.cos(ry),
                                  }
                                : { ex: 0.5, ez: 0.5, ox: 0, oz: 0 };
                            const wx = anker.x + sl.x;
                            const wz = anker.z + sl.z;
                            const saum = ob ? globalThis.__fachwerkCore.ORT_GESETZ.saumM : 0;
                            // die nassen Punkte des EINEN Fundament-Rasters: Spiegel des Gesetzes über dem gebauten Boden
                            const c0 = Math.cos(ry);
                            const s0 = Math.sin(ry);
                            const ras = r.constructor._fundamentRaster(
                                { ex: fp.ex + saum, ez: fp.ez + saum, ox: fp.ox, oz: fp.oz },
                                sl.tuer,
                                0.5
                            );
                            let nassN = 0;
                            let tief = 0;
                            for (const [lx, lz] of ras) {
                                const px = wx + lx * c0 + lz * s0;
                                const pz = wz - lx * s0 + lz * c0;
                                if (r._landAt(px, pz, 0.2)) continue;
                                nassN++;
                                const b = r._voxelSurfaceY(px, pz);
                                tief = Math.max(tief, r._atlasWaterLevelAt(px, pz, b) - b);
                            }
                            res.slotFehl.push({
                                y: Math.round(sl.y * 100) / 100,
                                nass: nassN + "/" + ras.length,
                                tief: Math.round(tief * 100) / 100,
                                x: Math.round(wx * 10) / 10,
                                z: Math.round(wz * 10) / 10,
                                wasser: !r._fundamentLand(wx, wz, ry, fp, sl.tuer, saum),
                                bau: !r._bauFrei(wx, wz, ry, fp, sl.tuer, sl.y),
                                nah: r.state.architectures
                                    .filter(
                                        (e) =>
                                            e.position &&
                                            !r._istNatur(e) &&
                                            Math.hypot(e.position.x - wx, e.position.z - wz) < 8
                                    )
                                    .map((e) => e.type),
                            });
                        }
                    const slots = [];
                    for (const e of haeuser) {
                        const sl = P.slots.find((s) => s.seed >>> 0 === e.seed);
                        if (!sl || !anker) continue;
                        const lx = e.position.x - anker.x;
                        const lz = e.position.z - anker.z;
                        const ob = sl.obb
                            ? Object.assign({}, sl.obb, { cx: sl.obb.cx + lx - sl.x, cz: sl.obb.cz + lz - sl.z })
                            : null;
                        slots.push({
                            x: lx,
                            z: lz,
                            phi: e.rotationY || 0,
                            y: e.position.y - 0.5,
                            rolle: sl.rolle,
                            tuer: sl.tuer,
                            obb: ob,
                            grund: sl.grund || null,
                        });
                    }
                    const ortW = { ort: anker, slots, roads: P.roads || [], platz: P.platz || null };
                    res.urteil = anker ? ortUrteil(ortW, (x, z) => r.getTerrainHeightAt(x, z)) : null;
                    // die Kronen des Wald-Plans über den Grundrissen (Dach-Fläche + Krone T)
                    const F = r.constructor.FOREST;
                    const seedInt = r._forestSeedInt();
                    let [x0, x1, z0, z1] = [Infinity, -Infinity, Infinity, -Infinity];
                    const dachW = [];
                    for (const sl of slots) {
                        if (!sl.obb) continue;
                        const ob = Object.assign({}, sl.obb, { cx: sl.obb.cx + anker.x, cz: sl.obb.cz + anker.z });
                        dachW.push(ob);
                        const rr = Math.hypot(ob.ex, ob.ez);
                        x0 = Math.min(x0, ob.cx - rr);
                        x1 = Math.max(x1, ob.cx + rr);
                        z0 = Math.min(z0, ob.cz - rr);
                        z1 = Math.max(z1, ob.cz + rr);
                    }
                    let kronen = 0;
                    for (let gx = Math.floor((x0 - 20) / F.cell); gx <= Math.floor((x1 + 20) / F.cell); gx++)
                        for (let gz = Math.floor((z0 - 20) / F.cell); gz <= Math.floor((z1 + 20) / F.cell); gz++)
                            for (const d of r._forestCellDarts(gx, gz, seedInt) || []) {
                                for (const ob of dachW) {
                                    const c = Math.cos(ob.phi || 0);
                                    const s = Math.sin(ob.phi || 0);
                                    const dx = d.x - ob.cx;
                                    const dz = d.z - ob.cz;
                                    const u = Math.max(0, Math.abs(dx * c - dz * s) - ob.ex);
                                    const v = Math.max(0, Math.abs(dx * s + dz * c) - ob.ez);
                                    if (Math.hypot(u, v) < (d.T || 0)) {
                                        kronen++;
                                        break;
                                    }
                                }
                            }
                    res.kronen = kronen;
                    // die Laternen der Zelle gegen die des Plans: je Laterne die Studio-Gestalt (fachwerk AUSSTATTUNG laterne) als
                    // Eintrag, dessen Licht ihr Rezept trägt (`_lichtDatumDerGestalt`) — ein Licht ohne Leib zählt nicht
                    res.laternenWelt = laternen.length;
                    res.laternenPlan = Array.isArray(P.laternen) ? P.laternen.length : 0;
                    // DIE LATERNE VOR DER WAND: je Laterne der
                    // Zelle der Abstand zur nächsten Hauswand des Plans (die Tür-Zeile W × D um den Slot); das Soll aus dem EINEN
                    // Licht-Gesetz (fachwerk LICHT_GESETZ.laterne, Abfall 1/(d² + k²)): die Wand trägt höchstens das Doppelte der Gasse
                    const LGl = globalThis.__fachwerkCore.LICHT_GESETZ.laterne;
                    res.laterneWandSoll =
                        Math.round(
                            1000 * Math.sqrt(Math.max(0, (LGl.hoeheM ** 2 + LGl.kernM ** 2) / 2 - LGl.kernM ** 2))
                        ) / 1000;
                    let lwMin = Infinity;
                    for (const e of P.ort ? masten : [])
                        for (const sl of P.slots) {
                            const tu = sl.tuer;
                            if (!tu || !Number.isFinite(tu.W) || !Number.isFinite(tu.D)) continue;
                            const c = Math.cos(sl.phi || 0);
                            const sn = Math.sin(sl.phi || 0);
                            const dx = e.position.x - (P.ort.x + sl.x);
                            const dz = e.position.z - (P.ort.z + sl.z);
                            const uu = Math.abs(dx * c - dz * sn) - tu.W / 2;
                            const vv = Math.abs(dx * sn + dz * c) - tu.D / 2;
                            lwMin = Math.min(lwMin, uu > 0 ? (vv > 0 ? Math.hypot(uu, vv) : uu) : vv > 0 ? vv : 0);
                        }
                    res.laterneWand = Number.isFinite(lwMin) ? Math.round(lwMin * 100) / 100 : null;
                    // DIE LATERNE NEBEN DER FAHRBAHN:
                    // je Laterne der Zelle der Abstand zum Rand jedes Wegs der EINEN Wege-Karte (die Segmente der Straßen und Feldwege,
                    // `_wegeFormAbstand`; der Tritt einer Ausstattung ist ein Segment ohne Länge und zählt nicht) — Soll: der Tritt des Rezepts
                    const AR = r.constructor;
                    const GZ = AR.GRUNDRISS_ZELLE;
                    res.laterneWegSoll = globalThis.__fachwerkCore.PRESETS.laterne.fx.tritt.r;
                    let lwegMin = Infinity;
                    for (const { position: q } of masten)
                        for (let a = -1; a <= 1; a++)
                            for (let b = -1; b <= 1; b++) {
                                const zk = AR._grundrissSchluessel(Math.floor(q.x / GZ) + a, Math.floor(q.z / GZ) + b);
                                for (const bb of r._grundrissStand().wege.get(zk) || [])
                                    for (const f of bb.formen)
                                        if (
                                            f.typ === "segment" &&
                                            f.kanal >= 0 &&
                                            Math.hypot(f.bx - f.ax, f.bz - f.az) > 0.01
                                        )
                                            lwegMin = Math.min(lwegMin, AR._wegeFormAbstand(f, q.x, q.z));
                            }
                    res.laterneWeg = Number.isFinite(lwegMin) ? Math.round(lwegMin * 100) / 100 : null;
                    // DIE STUFE VOR DER TÜR IST WEG: je Haus der Punkt 0,8 m
                    // vor der Mitte seiner Haustür liegt auf einer Fläche des Dorfs (`_aufWeg`: die Formen der EINEN Wege-Karte, die
                    // die Wiese über `_pfadFeldAt` und die Natur-Wand lesen) — Grundriss gegen Natur gilt auch für Treppe und Vorplatz
                    let vpOk = 0;
                    let vpN = 0;
                    const vpFehl = [];
                    // und vom Eingang
                    // (fachwerk `eingangVon`, beim Hof-Haus das Tor) bis zur Gasse liegt keine Lücke: auf der Achse der Tür je 0,25 m
                    // bis vorplatzM + gasseM — wer nach einem Punkt ohne Fläche wieder auf eine Fläche tritt, hat Wiese vor der Tür
                    const OG = window.__fachwerkCore.ORT_GESETZ;
                    // und die
                    // Wiese liest das GEMALTE Feld (`_pfadFeldAt` → `_wegeFeldAt`: die Bytes der Wege-Karte, weich um ±randM) — zwei Formen, die sich
                    // nur berühren, tragen an der Naht je 0,5: auf der Achse der Tür bis in die Gasse (die erste Weg-Form, die kein
                    // Kasten ist) hält das Feld ≥ 0,9 (die Wiese ≤ 17 % ihrer Dichte). Die Karte zieht dafür an den Ort und zurück.
                    const inGasse = (x, z) => {
                        const l = r
                            ._grundrissStand()
                            .wege.get(AR._grundrissSchluessel(Math.floor(x / GZ), Math.floor(z / GZ)));
                        if (l)
                            for (const b of l)
                                for (const f of b.formen)
                                    if (f.typ !== "kasten" && f.kanal >= 0 && AR._wegeFormAbstand(f, x, z) < 0)
                                        return true;
                        return false;
                    };
                    const pmW = r.state.playerMesh;
                    let feldMin = Infinity;
                    if (P.ort) r._tickWegeKarte({ x: P.ort.x, z: P.ort.z });
                    if (P.ort)
                        P.slots.forEach((sl, si) => {
                            const tu = sl.tuer;
                            if (!tu || !Number.isFinite(tu.x) || !Number.isFinite(tu.z)) return;
                            const c = Math.cos(sl.phi || 0);
                            const sn = Math.sin(sl.phi || 0);
                            const welt = (lz) => [
                                P.ort.x + sl.x + tu.x * c + lz * sn,
                                P.ort.z + sl.z - tu.x * sn + lz * c,
                            ];
                            vpN++;
                            const [wx, wz] = welt(tu.z - 0.8);
                            const ez = window.__fachwerkCore.eingangVon(sl).z;
                            let luecke = null;
                            let frei = null;
                            for (let t = 0.3; t <= OG.vorplatzM + OG.gasseM; t += 0.25) {
                                const [qx, qz] = welt(ez - t);
                                const auf = r._aufWeg(qx, qz, 0);
                                if (!auf && frei === null) frei = t;
                                if (auf && frei !== null) {
                                    luecke = [+frei.toFixed(2), +t.toFixed(2)];
                                    break;
                                }
                            }
                            let tief = OG.vorplatzM;
                            for (let t = 0.3; t <= OG.vorplatzM + OG.gasseM; t += 0.25)
                                if (inGasse(...welt(ez - t))) {
                                    tief = t;
                                    break;
                                }
                            // und in der
                            // ganzen Breite der Stufe (fachwerk `vorplatzFlaeche`: Türbreite samt Saum) — der Maler fällt an der
                            // Kante einer Form auf 0,5, die Wiese stand dort mit der Hälfte ihrer Dichte auf der Platte
                            const exS = window.__fachwerkCore.vorplatzFlaeche(sl).ex;
                            const quer = (lx, lz) => [
                                P.ort.x + sl.x + (tu.x + lx) * c + lz * sn,
                                P.ort.z + sl.z - (tu.x + lx) * sn + lz * c,
                            ];
                            let duenn = null;
                            for (let t = 0.3; t <= tief + 0.01; t += 0.1)
                                for (const lx of [0, -exS, exS]) {
                                    const [qx, qz] = quer(lx, ez - t);
                                    const v = r._wegeFeldAt(qx, qz);
                                    if (v < feldMin) feldMin = v;
                                    if (v < 0.9 && duenn === null)
                                        duenn = [+t.toFixed(2), +v.toFixed(2), +lx.toFixed(2)];
                                }
                            if (r._aufWeg(wx, wz, 0) && !luecke && !duenn) vpOk++;
                            else
                                vpFehl.push(
                                    luecke
                                        ? `${si}: Wiese ${luecke[0]}–${luecke[1]} m vor dem Eingang`
                                        : duenn
                                          ? `${si}: Feld ${duenn[1]} ${duenn[0]} m vor dem Eingang${duenn[2] ? `, ${duenn[2]} m quer (Flanke der Stufe)` : ""} (Gasse ab ${tief.toFixed(2)} m)`
                                          : `${si}: Stufe`
                                );
                        });
                    if (P.ort && pmW) r._tickWegeKarte(pmW.position);
                    res.vorplatzFeld = Number.isFinite(feldMin) ? Math.round(feldMin * 100) / 100 : null;
                    // DIE WAND DER TERRASSE, gezählt am Netz, das der Spieler sieht: der voxel-worker baut die Chunks um den Ort (± 60 m,
                    // Stufe 0, `_voxelWorkerComputeChunkMesh` — derselbe Bau wie das Streaming); Wand ist jeder Vertex unter dem
                    // Himmel, steiler als der Schutt-Kandidat (23°), den der Erdbau um > 0,25 m hebt oder senkt und der auf keiner
                    // Fläche des Erdbaus liegt (`erdbauFlaeche`); Wiese ist er, wo sein Fels-Stoff (die Steile über rockLo … rockHi
                    // plus der Schutt im Vertex, gelaende-core `felsStoff`) unter 0,5 bleibt
                    if (P.ort) {
                        const GC = globalThis.__gelaendeCore;
                        const GG = r.constructor.TERRAIN_GEOLOGY;
                        const Lg = r._gelaende();
                        const Lo = Object.assign({}, Lg, { erdbau: null });
                        const span = r._voxelChunkConfig(0).span;
                        let wand = 0;
                        let wiese = 0;
                        let halm = 0;
                        let ferne = 0;
                        const fernFehl = [];
                        const fehl = [];
                        for (let a = Math.floor((P.ort.x - 60) / span); a <= Math.floor((P.ort.x + 60) / span); a++)
                            for (
                                let b = Math.floor((P.ort.z - 60) / span);
                                b <= Math.floor((P.ort.z + 60) / span);
                                b++
                            ) {
                                const w = await r._voxelWorkerComputeChunkMesh(a, b, 0);
                                if (!w || w.empty) continue;
                                const pos = w.positions;
                                const nor = w.normals;
                                for (let i = 0; i < pos.length / 3; i++) {
                                    const x = pos[3 * i];
                                    const y = pos[3 * i + 1];
                                    const z = pos[3 * i + 2];
                                    if (Math.abs(x - P.ort.x) > 60 || Math.abs(z - P.ort.z) > 60) continue;
                                    if (w.himmel[i] < 1) continue;
                                    const st = 1 - nor[3 * i + 1];
                                    if (st < GG.schuttKandidat) continue;
                                    const f = GC.erdbauFlaeche(Lg.erdbau, x, z);
                                    if (f !== null && Math.abs(y - f) <= 0.25) continue;
                                    const hub = GC.hoehe(Lg, x, z, true) - GC.hoehe(Lo, x, z, true);
                                    if (Math.abs(hub) <= 0.25) continue;
                                    wand++;
                                    // K66, Prüfung 2: die Halme der Wand — die Nah-Wiese wächst nach dem Grün-Kanal der Boden-Karte
                                    // (`_bodenKarteAusMesh`: die Wiesen-Wache `gruenSchwelle` über der FERTIGEN Vertex-Farbe), die
                                    // Ferne nach `_fernSchuttAt` (Ring, Kronen-Karte, Feld-Pass): Wiese ab dem halben Grün, Ferne ohne Schutt
                                    // — wo das Netz den Stoff der Wand zeigt (Schutt ≥ 0,5) und der Erdbau die Höhe der Ferne bewegt (ohne Detail-Term, wie
                                    // der Ring); die Ferne ist ein Höhenfeld: unter der Kante einer Fläche zeigt sie die Fläche
                                    const C3 = w.colors;
                                    let tg = (C3[3 * i + 1] - 0.5 * (C3[3 * i] + C3[3 * i + 2])) / GG.gruenSchwelle;
                                    tg = tg < 0 ? 0 : tg > 1 ? 1 : tg;
                                    if (tg * tg * (3 - 2 * tg) >= 0.5) halm++;
                                    if (
                                        f === null &&
                                        w.schutt[i] >= 0.5 &&
                                        Math.abs(GC.hoehe(Lg, x, z, false) - GC.hoehe(Lo, x, z, false)) > 0.25 &&
                                        !((a) => (GC.hoehe(r._gelaende(), x, z, false, a), a.schutt > 0 || a.wand > 0))(
                                            { hang: 0, schutt: 0, wand: 0 }
                                        )
                                    ) {
                                        ferne++;
                                        if (fernFehl.length < 4)
                                            fernFehl.push([x, y, z, hub].map((v) => Math.round(v * 100) / 100));
                                    }
                                    let t = (st - GG.rockLo) / (GG.rockHi - GG.rockLo);
                                    t = t < 0 ? 0 : t > 1 ? 1 : t;
                                    if (t * t * (3 - 2 * t) + w.schutt[i] < 0.5) {
                                        wiese++;
                                        if (fehl.length < 6)
                                            fehl.push(
                                                [x, y, z, st, w.schutt[i], hub].map((v) => Math.round(v * 100) / 100)
                                            );
                                    }
                                }
                            }
                        res.terrasseWand = wand;
                        res.terrasseWiese = wiese;
                        res.terrasseHalm = halm;
                        res.terrasseFerne = ferne;
                        res.terrasseFerneFehl = fernFehl;
                        res.terrasseFehl = fehl;
                    }
                    res.vorplatzOk = vpOk;
                    res.vorplatzN = vpN;
                    res.vorplatzFehl = vpFehl;
                    // die Altwelten: Bauten, die kein Ort trägt (kein Haus mit Grundriss, keine Ausstattung des Dorfs: brunnen_dorf,
                    // marktstand_dorf), auf dem Erdbau eines Orts — nie das gesetzte Haus auf seinem EIGENEN Grund (`haus:`, S4)
                    let fremd = 0;
                    for (const e of r.state.architectures)
                        if (
                            !e.fundament &&
                            !/_dorf$/.test(e.type) &&
                            !r.state.worldMeta.erdbau[
                                `haus:${Math.round(e.position.x * 100)},${Math.round(e.position.z * 100)}`
                            ] &&
                            !r._ortFrei(e.position.x, e.position.z, 0.01)
                        ) {
                            fremd++;
                            (res.fremdArten || (res.fremdArten = {}))[e.type] = (res.fremdArten[e.type] || 0) + 1;
                        }
                    res.fremdBauten = fremd;
                    // DAS DORF-LICHT DER GASSE (Pflicht-OFFEN C): Mitternacht über den EINEN Uhr-Schreiber, die brennenden Quellen aus
                    // dem EINEN Licht-Gesetz der Welt (`_leuchtQuellen`: Datum × Zeitplan > 0) — gezählt wird jede mit Leib (Studio-
                    // Gestalt mit Licht-Datum oder Glut) im Ort; die Gasse und ihre Sicht rechnet `gassenLicht` (Node), den Licht-Pool
                    // der Gasse liest `gassenPool`. Der Schein: derselbe Ort mit dunklem Zeitplan.
                    if (anker) {
                        const uhr0 = r.state.timeOfDay;
                        if (!r._uhrSetzen(0, "regler")) throw new Error("die Uhr nimmt Mitternacht nicht");
                        const brennend = () =>
                            r
                                ._leuchtQuellen(anker.x, H(anker.x, anker.z), anker.z, 250, null)
                                .filter(
                                    (q) =>
                                        q.id &&
                                        q.id.position &&
                                        (r._lichtDatumDerGestalt(q.id) || r._glutFlaeche(q.id) > 0) &&
                                        Math.hypot(q.x - anker.x, q.z - anker.z) < 250
                                )
                                .map((q) => [q.x, q.z]);
                        const qs = brennend();
                        r._lichtZeitplan = () => 0;
                        let dunkel;
                        try {
                            dunkel = brennend();
                        } finally {
                            delete r._lichtZeitplan;
                        }
                        r._uhrSetzen(uhr0, "regler");
                        res.gasseIn = {
                            qs,
                            dunkel,
                            wege: (P.roads || []).map((w) => (w.pts || []).map((p) => [anker.x + p.x, anker.z + p.z])),
                            haeuser: dachW,
                            hfov: 2 * Math.atan(Math.tan((r.state.camera.fov * Math.PI) / 360) * (16 / 9)),
                        };
                    }
                    res.v2Json = v2 ? JSON.stringify(v2) : null;
                    // DER PLAN-HASH STUDIO = WELT (in derselben Seite, kein Plattform-Bit dazwischen): der Export des Fachwerk-Kerns
                    // (die Foundry rechnet ihn, das Labor baut dasselbe Layout — Teil A friert ihn ein) am Anker über die Lage des
                    // STUDIOS (gelaende-core `lageGrund` der Saat) und seinen ctx (`ortCtx`) — byte-gleich mit dem Plan v2 der Welt,
                    // oder der Wirt weicht vom Grund der Lage ab.
                    if (v2 && anker) {
                        const Gs = globalThis.__gelaendeCore;
                        const studio = globalThis.__fachwerkCore.ortPlan(
                            plan,
                            anker,
                            Gs.ortCtx(Gs.lageGrund(L.seed, window.SimplexNoise))
                        );
                        res.planHashGleich = JSON.stringify(studio) === res.v2Json;
                    }
                    res.planJson = JSON.stringify({ roads: P.roads || [] });
                } catch (e) {
                    res.err = (e && e.stack) || String(e);
                }
                return res;
            },
            `${lokal}\nreturn ${ortUrteil}`,
            dpO,
            modus,
            messort
        );
        // DIE GASSE (rein, hier) und IHR LICHT-POOL (die Seite): Mitternacht, die Kamera der Gasse in Augenhöhe, ein frischer Pool
        // über den EINEN Schreiber (`_leuchtTakt`) — gezählt die Plätze, die eine sichtbare Quelle des Orts trägt.
        if (outO.gasseIn) {
            const gi = outO.gasseIn;
            const g = gassenLicht(gi.qs, gi.wege, gi.haeuser, gi.hfov);
            outO.gasse = {
                n: g.n,
                pose: g.pose && g.pose.map((v) => Math.round(v * 10) / 10),
                je: g.je,
                verdeckt: g.verdeckt,
                brennend: gi.qs.length,
                schein: gassenLicht(gi.dunkel, gi.wege, gi.haeuser, gi.hfov).n,
            };
            if (g.pose)
                Object.assign(
                    outO.gasse,
                    await page.evaluate(
                        (pose, je) => {
                            const r = window.anazhRealm;
                            const cam = r.state.camera;
                            const H = (x, z) => r._terrainMacroSurfaceY(x, z, true);
                            const uhr0 = r.state.timeOfDay;
                            const cam0 = { p: cam.position.clone(), q: cam.quaternion.clone(), a: cam.aspect };
                            const [px, pz, lx, lz] = pose;
                            r._uhrSetzen(0, "regler");
                            cam.aspect = 16 / 9;
                            cam.updateProjectionMatrix();
                            cam.position.set(px, H(px, pz) + 1.7, pz);
                            cam.lookAt(lx, H(lx, lz) + 1.7, lz);
                            cam.updateMatrixWorld(true);
                            r._leuchtPool = null;
                            r._leuchtTakt();
                            const pl = (r._leuchtPool && r._leuchtPool.plaetze) || [];
                            // DER HORIZONT DES POOLS: die sichtbaren Quellen der Gasse, die das Gesetz des Pools überhaupt
                            // wählen darf (`_leuchtQuellen` im `umkreisM` um das Auge, ohne Sichtkegel) — eine Laterne 63 m vor
                            // dem Auge zeigt ihren glühenden Kopf, ihr Licht trägt der Pool nicht (Gebot 7: Kosten am Schirm)
                            const LP = r.constructor.LICHT_POOL;
                            const imHorizont = r
                                ._leuchtQuellen(cam.position.x, cam.position.y, cam.position.z, LP.umkreisM, null)
                                .filter((q) => je.some(([x, z]) => Math.hypot(x - q.x, z - q.z) < 0.5)).length;
                            const out = {
                                plaetze: Math.min(LP.plaetze, imHorizont),
                                pool: pl.map((p) => [p.quelle, Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10]),
                                poolOrt: pl.filter(
                                    (p) => p.staerke > 0 && je.some(([x, z]) => Math.hypot(x - p.x, z - p.z) < 0.5)
                                ).length,
                            };
                            r._uhrSetzen(uhr0, "regler");
                            cam.position.copy(cam0.p);
                            cam.quaternion.copy(cam0.q);
                            cam.aspect = cam0.a;
                            cam.updateProjectionMatrix();
                            r._leuchtPool = null;
                            return out;
                        },
                        g.pose,
                        g.je
                    )
                );
        }
        // DER GT AUF DEM DORFWEG des Orts, den die Welt trägt (Plan v2, sonst der Export)
        const gtO =
            outO.anker && (outO.v2Json || outO.planJson)
                ? await page.evaluate(gtDorfweg, JSON.parse(outO.v2Json || outO.planJson), outO.anker, 8)
                : { err: "kein Ort" };
        return { outO, gtO };
    };
    const MESSORT_DORF = JSON.parse(
        fs.readFileSync(path.join(root, "spec", "profiband", "haushalt.json"), "utf8")
    ).messorte.find((o) => o.id === "dorf").spieler;
    const O = await messeOrt("akt", null);
    const OA = await messeOrt("auto", MESSORT_DORF);
    const K5 = [];
    for (const alt of [null, "vorrat", "trasse"]) K5.push(await page.evaluate(vorratAmDorf, MESSORT_DORF, alt));
    const [K5b, K5bS, K3S] = K5;
    // die Würfe des Felds am Auto-Dorf (`feldWurfImOrt`) und ihr Selbst-Schein
    const wirf = (d) => (OA.outO.anker ? page.evaluate(feldWurfImOrt, OA.outO.anker, d) : { err: "kein Ort" });
    const [FW, FWd, FWa] = [await wirf(false), await wirf("bau"), await wirf("art")];

    await browser.close();
    server.close();

    check(
        "B: _foundryRequestSettlement liefert den Export durch den EINEN Worker",
        out.planOk === true,
        `slots=${out.planSlots} name=${out.planName}`
    );
    check(
        // placed > 0, Buchhaltung exakt
        "B: der Konsument platziert",
        out.placed1 > 0 && out.entriesMatch === true,
        `placed=${out.placed1} skipped=${out.skipped1} Wandlaternen ${out.wand1}/${out.wandPlan}`
    );
    check(
        // Tabellen-Regel, kein Literal
        "B: jeder Eintrag ist ein haus_<kultur>-Blueprint oder die Wandlaterne seines Hauses",
        out.allHaus === true
    );
    check(
        // derselbe Anker zweimal, beide Akte heben gleich viele, jedes Haus beider Akte: entry == anker + slot.x/z, phi, seed
        // (y == slot.y + 0,5 am zweiten) — der Slot-Anker trägt den Determinismus, kein eigener Offset-Vergleich
        "B: POSITIONS-DETERMINISTISCH — der Slot-Anker sitzt EXAKT auf dem Plan v2",
        out.planV2 === true && out.slotAnchorExact === true,
        `v2=${out.planV2} placed1=${out.placed1} placed2=${out.placed2}`
    );
    check("B: DORF-IN-TERRAIN — der Slot-Footprint reist als entry.fundament {ex,ez}", out.fundamentTravels === true);
    check(
        "B: DER AKT hebt über den Zug — vor dem ersten Bild nach dem ersten Haus höchstens perTick (K5)",
        out.zugAkt === true
    );
    check(
        // rolle == Export
        "B: HAUS-DOPPELBAU — der Slot-ov reist als studioOv an JEDEM Eintrag",
        out.ovTravels === true
    );
    check(
        // der ov-Hash trennt Kirche von Wohnhaus
        "B: HAUS-DOPPELBAU — der Flatten-Chokepoint liest den Stempel",
        out.ovKeysSplit === true
    );
    const eh = out.erlebnis || {};
    const el = out.erlebnisLeer || {};
    check(
        // Hof-Bäume, Marktstände, Zäune über den Zaun-Pool, Äcker in der Wege-Karte
        "B: der Erlebnis-Hebel hebt die Schichten des Plans — ohne sie keine",
        eh.baeume > 0 &&
            eh.staende > 0 &&
            eh.zaeune > 0 &&
            eh.aecker === true &&
            el.baeume === 0 &&
            el.staende === 0 &&
            el.zaeune === 0 &&
            el.aecker === false,
        `mit ${JSON.stringify(out.erlebnis)} · ohne ${JSON.stringify(out.erlebnisLeer)} · Plan ${JSON.stringify(out.planKern)}`
    );
    const sm = out.stadt || {};
    check(
        `B: DIE STADTMAUER (siedlung.K2) — ${sm.mauer}/${sm.soll} Streifen, wirft, die Natur weicht; Dorf ${eh.mauer}`,
        sm.mauer >= 0.8 * sm.soll && sm.wirft && sm.natur && !eh.mauer,
        sm
    );
    check("B: fail-closed — unbekannte Kultur faellt (0 platziert, 1 uebersprungen)", out.failClosed === true);
    check(
        // `_bauSame` am Ruf, kein Math.random
        "B: Γ5 — der Siedlungs-Same zieht aus dem Bau-Strom",
        out.gammaStream === true
    );
    check("B: Γ5 — „baue dorf hier“ zieht denselben Bau-Strom (_bauSame)", out.gammaHier === true);
    check(
        // nach der Buch-Ankunft, nie der Kern-Default
        "B: der DSL-Akt spawn_village trägt die Größe des Siedlungs-Gesetzes",
        Number.isFinite(out.villageNH) && out.villageNH === out.villageNHSoll,
        `nH ${out.villageNH} (Soll ${out.villageNHSoll})`
    );
    const pruefeOrt = (titel, modusName, outO, gtO) => {
        console.log(`\n=== TEIL O: DER ORT AUF DEM GELÄNDE (K10, ${titel}) ===`);
        if (outO.err) console.log("  Fehler im Akt: " + outO.err.split("\n").slice(0, 3).join(" | "));
        if (outO.zelle)
            check(
                // wie im Spiel, _tickAutoSettlement
                `O ${modusName}: der Dorf-Zug baut das Dorf der Zelle am Mess-Ort`,
                !outO.err && outO.haeuser > 0,
                `Zelle ${outO.zelle}`
            );
        else
            check(
                `O ${modusName}: ein Hang trägt den Akt (Gefälle 0,12–0,25 über 16 m, trocken)`,
                !!outO.hang,
                outO.hang
                    ? `${outO.hang.x.toFixed(1)}/${outO.hang.z.toFixed(1)} Gefälle ${outO.hang.g.toFixed(3)}`
                    : "kein Hang"
            );
        const planHashGleich = outO.planHashGleich === true;
        const u = outO.urteil || {};
        const m = {
            haeuser: outO.haeuser,
            slots: outO.slots,
            wasserSlots: outO.wasserSlots,
            sockelMedian: u.sockelMedian,
            sockelMax: u.sockelMax,
            tuerenOk: u.tuerenOk,
            tuerenN: u.tuerenN,
            kronen: outO.kronen,
            laternenWelt: outO.laternenWelt,
            laternenPlan: outO.laternenPlan,
            laterneWand: outO.laterneWand,
            laterneWandSoll: outO.laterneWandSoll,
            laterneWeg: outO.laterneWeg,
            laterneWegSoll: outO.laterneWegSoll,
            vorplatzOk: outO.vorplatzOk,
            vorplatzN: outO.vorplatzN,
            vorplatzFehl: outO.vorplatzFehl,
            terrasseWand: outO.terrasseWand,
            terrasseWiese: outO.terrasseWiese,
            terrasseHalm: outO.terrasseHalm,
            terrasseFerne: outO.terrasseFerne,
            terrasseFerneFehl: outO.terrasseFerneFehl,
            vorplatzFeld: outO.vorplatzFeld,
            planHashGleich,
            fremdBauten: outO.fremdBauten,
            gtWeg: gtO.gtWeg,
            gtEnde: gtO.endeNachS,
            quellenGasse: outO.gasse ? outO.gasse.n : null,
            poolGasse: outO.gasse ? outO.gasse.poolOrt : null,
            poolPlaetze: outO.gasse ? outO.gasse.plaetze : null,
        };
        console.log("  DORF-LICHT DER GASSE " + JSON.stringify(outO.gasse || null));
        console.log("  GT AUF DEM DORFWEG " + JSON.stringify(gtO.err ? { err: gtO.err.split("\n")[0] } : gtO));
        console.log(
            "  ORT-ZAHLEN " +
                JSON.stringify(
                    Object.assign(
                        {
                            haeuser: outO.haeuser,
                            slots: outO.slots,
                            planV2: outO.planV2,
                            zellen: u.zellen,
                            fremdArten: outO.fremdArten || {},
                            zweit: outO.zweit,
                        },
                        m
                    )
                )
        );
        if (u.tuerenFehl?.length) console.log("  Türen ohne Gang: " + JSON.stringify(u.tuerenFehl));
        if (outO.terrasseFehl?.length)
            console.log("  Wand im Wiesen-Stoff (x, y, z, Steile, Schutt, Hub): " + JSON.stringify(outO.terrasseFehl));
        if (outO.slotFehl?.length) console.log("  Slots ohne Haus: " + JSON.stringify(outO.slotFehl));
        if (outO.ortWahl?.length) console.log("  Ort-Wahl: " + outO.ortWahl.join(" | "));
        if (outO.ortMass) console.log("  ORT-WAHL-KOSTEN " + JSON.stringify(outO.ortMass));
        const fehlO = ortVerdikt(m);
        check(
            `O ${modusName}: das Dorf trägt jedes Haus (alle Slots stehen)`,
            outO.haeuser > 0 && outO.haeuser === outO.slots,
            `${outO.haeuser}/${outO.slots}`
        );
        if (outO.zelle)
            check(
                `O ${modusName}: Selbst-Test — ein zweites Dorf im Fenster, vor der Zelle angekommen, lässt das Urteil der Zelle gleich; die Ankunfts-Reihenfolge (erste neue Zelle, alle Häuser seit vorher) mischt es ein`,
                !!outO.ankunft &&
                    outO.ankunft.zweitVor &&
                    outO.ankunft.zelle !== outO.zelle &&
                    outO.ankunft.haeuser > outO.haeuser,
                `zweites Dorf ${outO.zweit}, vor der Zelle ${(outO.ankunft || {}).zweitVor} · Ankunft: Zelle ${(outO.ankunft || {}).zelle}, Häuser ${(outO.ankunft || {}).haeuser}/${outO.slots} · Zelle ${outO.zelle}: ${outO.haeuser}/${outO.slots}`
            );
        check(
            // Sockel 0, Türen, Kronen 0, Laternen, Plan-Hash, Altwelten 0, der GT ≥ 60 m in 8 s auf dem Dorfweg, ≥ 4 Quellen in der Gasse nachts
            `O ${modusName}: der Ort hält jede Zahl`,
            fehlO.length === 0,
            fehlO.join(" · ") || "gehalten"
        );
        check(
            // die Zahl liest das Licht-Gesetz der Welt
            `O ${modusName}: Selbst-Schein — der Zeitplan dunkel, die Gasse sieht keine Quelle`,
            !!outO.gasse && outO.gasse.schein === 0 && outO.gasse.n > 0,
            outO.gasse ? `hell ${outO.gasse.n} · dunkel ${outO.gasse.schein}` : "keine Gasse"
        );
    };
    pruefeOrt("Dorf 7/18 Gründerzeit am Hang", "Akt", O.outO, O.gtO);
    pruefeOrt(`das Auto-Dorf der Welt am Mess-Ort dorf, Zelle ${OA.outO.zelle || "?"}`, "Auto-Dorf", OA.outO, OA.gtO);
    console.log("  FELD-WURF IM ORT " + JSON.stringify(FW));
    check(
        // keiner sperrt der Wahl Grund (_bauFrei), Grundriss und Weg räumen ihn (die Arten aus EINER Liste, FELD_WURF)
        "O Auto-Dorf: jeder Wurf des Felds weicht dem Ort wie die Natur",
        !FW.err && FW.quelle === true && FW.feldMarke === true && FW.weichen === FW.arten,
        FW.err
            ? FW.err.split("\n")[0]
            : `${FW.weichen}/${FW.arten} Arten weichen` +
                  (FW.quelle ? "" : " · die Liste ist nicht EINE Quelle") +
                  (FW.feldMarke ? "" : " · der Wurf des Felds trägt keine Marke (feldWurf, _enqueueVegetationSpawn)") +
                  (FW.sperrt.length ? " · sperrt: " + FW.sperrt.join(", ") : "") +
                  (FW.grundriss.length ? " · im Grundriss: " + FW.grundriss.join(", ") : "") +
                  (FW.weg.length ? " · auf dem Weg: " + FW.weg.join(", ") : "") +
                  (FW.fehl.length ? " · kein Wurf: " + FW.fehl.join(", ") : "")
    );
    check(
        // und bleibt im Grundriss: die Linse sieht den Täter
        "O Auto-Dorf: Selbst-Schein — die Feuerstelle als Bau sperrt den Grund",
        !FWd.err && FWd.sperrt.includes("glutbrunnen") && FWd.grundriss.includes("glutbrunnen"),
        FWd.err
            ? FWd.err.split("\n")[0]
            : `sperrt: ${FWd.sperrt.join(", ") || "—"} · im Grundriss: ${FWd.grundriss.join(", ") || "—"}`
    );
    check(
        // der Satz, der Bau-Modus: es sperrt den Grund, kein Grundriss und kein Weg räumt es (die Herkunft entscheidet, die Marke werk, nie die Art)
        "O Auto-Dorf: das Werk jeder Art weicht nie",
        !FW.err && FW.werk.arten.length === FW.arten && FW.werk.weicht.length === 0,
        FW.err
            ? FW.err.split("\n")[0]
            : `Werk-Arten ${FW.werk.arten.join(", ") || "—"}` +
                  (FW.werk.weicht.length ? " · weicht als Werk: " + FW.werk.weicht.join(", ") : " · keins weicht")
    );
    check(
        // die Linse sieht den Täter
        "O Auto-Dorf: Selbst-Schein — entscheidet die Art, weicht die Feuerstelle des Menschen",
        !FWa.err && FWa.werk.weicht.some((w) => w.startsWith("glutbrunnen")),
        FWa.err ? FWa.err.split("\n")[0] : `weicht als Werk: ${FWa.werk.weicht.join(", ") || "—"}`
    );
    console.log("\n=== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) ===");
    const c = out.c || {};
    check(
        // ein anderer Seed, andere Dörfer; zurück, dieselben (Γ5) — selten und deterministisch misst Teil Z am Kern-Hash
        "C1: die Zell-Wahrheit des Wirts aus dem Welt-Seed",
        c.seedStrom === true,
        `seedStrom=${c.seedStrom}`
    );
    check("C1b: die Spawn-Klar-Wand steht (der Welt-Ursprung ist nie Dorf-Site)", c.spawnClearWall === true);
    check(
        // Null-Renderer ohne Hook: kein Pending, keine Queue
        "C2: HEADLESS-DEFAULT — der Auto-Zug ruht",
        c.headlessQuiet === true
    );
    check(
        // Export → Reservierung → Häuser
        "C3: die erzwungene Dorf-Zelle materialisiert",
        c.planOk === true && c.reserved === true && c.placed >= 1 && c.allHaus === true,
        `placed=${c.placed} ticks=${c.ticks}`
    );
    check(
        // echter Job-Pfad scatterDeco: Slots in Frames, nie 0, je Deko-Lauf ≤ 1/drosselTakte
        "C3b: Existenz vor Framerate — über dem Budget wächst die Siedlung gedrosselt",
        c.budgetWall === true,
        `über dem Budget: ${c.ueberBudget} Slots in ${c.ueberBudgetFrames} Frames (${c.dekoLaeufe} Deko-Läufe; der Ring stand nach ${c.vorlaufFrames} Frames)`
    );
    check(
        // zwei Siedlungen mit demselben Samen bauen je ihre Wege
        "C6: der Wege-Schlüssel trägt den Ort",
        Array.isArray(c.wegeJeOrt) && c.wegeJeOrt.length === 2 && c.wegeJeOrt.every((n6) => n6 > 0),
        `Wege-Formen je Ort: ${(c.wegeJeOrt || []).join(" / ")}`
    );
    const bl = c.blick || {};
    const blZ = (q) =>
        q ? `${q.haeuser} Häuser, Gier ${q.gier} (gedreht ${q.gedreht}, neben dem Dorf ${q.nebenDorf})` : "–";
    check(
        // 0710-7; 4B: −2,745 mitten im Lauf
        "C7: ein Nexus-Dorf lässt den Blick stehen",
        !!bl.nexus && bl.nexus.haeuser > 0 && bl.nexus.gedreht < 1e-6,
        `Nexus: ${blZ(bl.nexus)}`
    );
    check(
        // Chat-Programm und Befehl „dorf“: der Blick auf SEIN neues Dorf
        "C7: das verlangte Dorf richtet den Blick auf sich",
        !!bl.spieler &&
            !!bl.chat &&
            bl.spieler.haeuser > 0 &&
            bl.chat.haeuser > 0 &&
            bl.spieler.nebenDorf < 0.05 &&
            bl.chat.nebenDorf < 0.05,
        `Chat-Programm: ${blZ(bl.spieler)} · dorf: ${blZ(bl.chat)}`
    );
    const werkzeug = ["faehigkeit", "wirken", "verzehr"];
    check(
        // Fähigkeit ability:, Wirken capability:, Verzehr consume: (0710-8)
        "C7: das Dorf eines Werkzeugs schaut auf sich",
        werkzeug.every((k) => !!bl[k] && bl[k].haeuser > 0 && bl[k].nebenDorf < 0.05),
        werkzeug.map((k) => `${k}: ${blZ(bl[k])}`).join(" · ")
    );
    check(
        // remote-…: er handelt für die Welt
        "C7: das Dorf eines Mitspielers lässt den Blick stehen",
        !!bl.mitspieler && bl.mitspieler.haeuser > 0 && bl.mitspieler.gedreht < 1e-6,
        `Mitspieler: ${blZ(bl.mitspieler)}`
    );
    const ring = c.ring || {};
    check(
        // alle builtIn-Welt-Portale, Stempel gesetzt
        "C5: DER GENESIS-PORTAL-RING hebt am Ursprung",
        ring.stempel === true && ring.arten >= 1 && ring.gebaut >= 1,
        `arten=${ring.arten} gebaut=${ring.gebaut}`
    );
    check(
        // der Stempel trägt, 0 Doppel
        "C5: Ring-Radius ~11 m, doppelt idempotent",
        ring.radiusOk === true && ring.idempotent === true,
        `radiusOk=${ring.radiusOk} idem=${ring.idempotent}`
    );
    check(
        // worldMeta.settlementCells trägt über den Reload
        "C4: IDEMPOTENT — dieselbe Zelle nochmal: 0 neue Häuser",
        c.idempotent === true
    );
    const k5 = c.k5 || {};
    // über dem Budget liegt ein Takt des Zugs je drosselTakte Bilder (Stadt GTX 41 fps): 0,5 s tragen `soll` Takte
    const soll = Math.floor((0.5 * 41) / k5.drossel);
    const je = (n, f) => n.every((k) => k5[k] && f(k5[k]));
    // DAS ERSTE HAUS IM BILD (sk5-haus): nH 12 und 300 heben das nächste Haus nach dem Vorlauf, seine Stufen bestellt vor ihm, und
    // es steht in der Stufe seines Abstands ≤ `soll` Takte nach dem Erwachen, auch hinter vollem Fit-Takt — nie als Hülle, solange
    // ein Haus der Mesh-Zone vorn im Schirm liegt (das ferne vor dem nahen, beim Namen)
    const fernVorNah = (w = {}) =>
        w.erstes &&
        w.erstes.stufe === "huelle" &&
        w.nahImSchirm &&
        `${w.erstes.typ} als Hülle in ${w.erstes.d} m vor dem nahen`;
    check(
        `C-K5: DAS ERSTE HAUS IM BILD — nH 12 und 300 ≤ ${soll} Takte nach dem Erwachen, das nahe zuerst, vorgebacken`,
        je(["vorlauf12", "vorlauf300"], (w) => w.vor > 0 && w.erstes && w.bild <= soll && !fernVorNah(w)),
        k5
    );
    check(
        "C-K5 Selbsttest: ein fernes Haus vor dem nahen ist ROT beim Namen",
        !!fernVorNah(k5.fern300),
        fernVorNah(k5.fern300) || k5
    );
    check(
        // der Export nach dem Erwachen (Teleport) und die Schichten vor dem ersten Haus (alt)
        "C-K5 Selbsttest: Teleport und alt fallen ROT",
        je(["teleport300", "alt300"], (w) => w.haus > soll),
        k5
    );
    check(
        // Teleport, Start-Dorf; die Pläne im Haupt-Thread und im Ort-Faden
        "C-K5 OHNE VORLAUF: Pläne bis zum ersten Haus nH 300 / nH 12 ≤ 1,2",
        je(["teleport12", "teleport300"], () => k5.teleport300.plaene / k5.teleport12.plaene <= 1.2),
        k5
    );
    check(
        // 40 m voraus, 11 m bei 70°, 15 m daneben
        "C-K5: DER RANG — Mitte vor Streifen vor außer Schirm",
        String(k5.schirm) === "1,2,0",
        k5
    );
    const [ort, ortS, wach, voll] = [k5.ort || {}, k5.ortStoer || {}, k5.wach || {}, k5.wachVoll || {}];
    check(
        // zwei Vorläufe nH 300, der Spieler 3,7 m versetzt
        "C-K5c: DER ORT IST EINE FUNKTION — der Plan v2 bit-gleich",
        !!ort.hash && ort.hash[0] === ort.hash[1] && !ort.erste,
        ort.erste ? `die erste Abweichung: ${ort.erste}` : JSON.stringify(ort.hash)
    );
    check("C-K5c Selbsttest: der Wunsch, der mit dem Spieler rückt, ist ROT", !!ortS.erste, ortS);
    console.log("  C-K5d DAS ERWACHEN " + JSON.stringify(wach));
    check(
        // vom Erwachen bis zum letzten Haus, je Takt ein Schritt des Dorfs
        "C-K5d: DAS ERWACHEN IN RATEN — je Takt höchstens EIN Schritt",
        wach.takte > 1 && !!wach.mehr && !wach.mehr.length,
        (wach.mehr || []).join(" | ") ||
            `${wach.takte} Takte, das erste Haus im Takt ${wach.haus}, der längste ${wach.max}`
    );
    check(
        "C-K5d Selbsttest: der Voll-Bau im Takt des Erwachens ist ROT",
        !!voll.mehr && voll.mehr.length > 0,
        (voll.mehr || []).join(" | ")
    );
    const mehrfach = (e) =>
        Object.entries(e.exporte)
            .filter(([, x]) => x > 1)
            .map(([k, x]) => `Zelle ${k}: ${x} Exporte`);
    const ruht = (e) => !e.nachZug && !e.offen;
    check(
        // am Mess-Ort dorf bereiten sich zwei Zellen vor
        "C-K5b: EIN VORRAT JE ZELLE — höchstens EIN Export",
        Object.keys(K5b.exporte).length >= 2 && !mehrfach(K5b).length,
        K5b
    );
    // 150 Gänge ohne Export, kein Foundry-Auftrag offen
    check("C-K5b: NACH DEM ZUG STEHT DIE WELT", ruht(K5b), K5b);
    check(
        // das alte Überspringen
        "C-K5b Selbsttest: EIN Vorrat zur Zeit ist ROT",
        mehrfach(K5bS).length > 0 && !ruht(K5bS),
        mehrfach(K5bS).join(" · ") + " " + JSON.stringify(K5bS)
    );
    // C-K3: die Vorräte am Mess-Ort, das Auto-Dorf und der Akt am Hang — jeder Plan steht am Ort seines Rasters und hält das Gefälle
    require(path.join(root, "gelaende-core.js"));
    const GN = globalThis.__gelaendeCore;
    const Lw = GN.lageGrund(K5b.welt, require(path.join(root, "vendor/simplex-noise.js")));
    for (const t of [...K5b.trasse, ...K3S.trasse, OA.outO.trasse, O.outO.trasse].filter(Boolean)) {
        t.p95 = gassenGefaelle(t.v2, (x, z) => GN.hoehe(Lw, x, z, true));
        delete t.v2;
    }
    const trassen = [...K5b.trasse, OA.outO.trasse, O.outO.trasse];
    const gefSoll = FC.ORT_GESETZ.gefaelle * 100;
    check(
        `C-K3: DIE TRASSE AM ORT — ${trassen.length} Dörfer stehen am Ort ihres Höhen-Rasters, Gassen-Gefälle p95 ≤ ${gefSoll} % am Grund ohne Erdbau`,
        trassen.length >= 4 && trassen.every((t) => t && t.versatzM === 0 && t.aussen === 0 && t.p95 <= gefSoll),
        trassen
    );
    check(
        "C-K3 Selbsttest: der Plan am Raster des gerückten Wunschs ist ROT",
        K3S.trasse.some((t) => t.p95 > gefSoll),
        K3S.trasse
    );
    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    // exportSettlement deterministisch + eingefroren (Kern), der Export durch den EINEN Worker (Brücke generisch, M8), der Host hebt
    // die Slots positions-deterministisch, wasser-bewacht und fail-closed (deliberater Akt) — und der Worldgen-Konsument lebt
    // (Auto-Dörfer: Γ5-Zellen, Site-Wände, budgetierte Materialisierung durch die EINE Slot-Quelle, Reload-idempotent, headless-ruhig)
    console.log("\n✅ GRÜN — DER SETTLEMENT-KANAL N5.7 STEHT.");
    process.exit(0);
});
