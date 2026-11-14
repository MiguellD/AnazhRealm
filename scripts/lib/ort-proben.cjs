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
//   Sockel je Haus = Boden − tiefster Grund unter dem Grundriss (9 × 9 Punkte; nie im hohlen Keller `grund.keller`, S4), Median
//   und Maximum;
//   Tür erreichbar = die Schwelle (Boden + Diele) liegt höchstens STUFE über dem Grund 0,3 m vor ihr, die 2 m geradeaus aus
//   der Tür tragen keine Stufe > STUFE (kein Absatz vor der Schwelle), und ein Gang über ein 0,5-m-Raster (Nachbarn mit
//   |Δh| ≤ STUFE, nie durch eine Wand oder den Keller) erreicht einen Weg oder den Platz. Das Raster entsteht nur, wo der Gang geht.
// der Punkt (x, z) im Rahmen um (cx, cz) mit der Drehung phi (reist mit `ortUrteil` als Quelltext in die Seite)
// C2 DER ORT HÄLT DEN ZUG, NIE DAS BILD (w12-dorf-probe): an der Null-Seite lebt der Dorf-Takt ohne Haken (`ohne`: der Bau am
// Ort ist Simulation), unter dem Haken des Orts (`false`, haushalt.json `dorfZug`) bestellt sein Takt nichts (`still`). Bis
// w12-dorf-probe ruhte er, sobald nur der Null-Renderer stand: jede headless Probe am Messort dorf urteilte eine leere Welt
// (0 Häuser nach 9000 Takten, mit Renderer 16).
const dorfZugAmOrt = (c) => c.ohne && c.still;
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
                const [px, pz] = [ob.cx + lx * c + lz * s, ob.cz - lx * s + lz * c];
                if (!imKeller(sl, px, pz)) mn = Math.min(mn, hoehe(ox + px, oz + pz));
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
    sockel.sort(aufsteigend);
    return {
        sockelMedian: sockel.length ? Math.round(1000 * rang(sockel)) / 1000 : null,
        sockelMax: sockel.length ? Math.round(1000 * sockel[sockel.length - 1]) / 1000 : null,
        tuerenOk: tueren.filter((t) => t.ok).length,
        tuerenN: tueren.length,
        tuerenFehl: tueren.filter((t) => !t.ok),
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

module.exports = {
    gassenGefaelle,
    erdbauMedian,
    dorfZugAmOrt,
    belagUrteil,
    lokal,
    kasten,
    ortUrteil,
    POOL_AUSSER_RANG,
    poolZaehlen,
    ortVerdikt,
    GT_SOLL_M,
    poseSicht,
    gassenLicht,
    GASSE_SOLL,
};
