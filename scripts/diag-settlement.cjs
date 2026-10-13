// diag-settlement.cjs — DER SETTLEMENT-KANAL N5.7 (Katalysator-Bogen W-A5b).
// Zwei Teile:
//   TEIL N (Node, direkt): fachwerk-core exportSettlement(dp) ist DETERMINISTISCH
//     (derselbe dp ⇒ byte-derselbe Export; anderer Seed ⇒ anderer Export), die
//     Slots sind sauber (bekannte Kulturen, endliche Anker, keine ±9999-Parkplätze),
//     und der Export ist EINGEFROREN (sha256-Golden je dp-Fixture in
//     spec/asset-contract/v6/golden/siedlung.json — Taille-Disziplin: gemintet NUR
//     wenn die Datei fehlt; ein Kern-Edit, der das Layout verschiebt, wird rot).
//   TEIL B (Browser, foundry-ON, Null-Renderer): der Kanal lebt END-TO-END —
//     _foundryRequestSettlement holt den Export durch den EINEN Worker (die Brücke
//     dispatcht generisch über die Zweit-Kern-Schleife, M8), _spawnSettlementFromExport
//     platziert N haus_<kultur>-Einträge POSITIONS-DETERMINISTISCH am Anker (zweiter
//     Anker ⇒ identische Offsets), die Wasser-Wand + die fail-closed-Slot-Regel greifen
//     (unbekannte Kultur wird übersprungen), und der Chat-Konsument "dorf" existiert.
//   TEIL C (Nachlese-Welle — WORLDGEN-AUTO-DÖRFER, derselbe Browser): der
//     "settlement"-Dispatch-Kanal hat seinen Worldgen-Konsumenten — Zell-Wahrheit
//     deterministisch (2 Läufe byte-gleich, zell-sensitiv, Γ5 ":dorf"-Stream), die
//     Site-Wände greifen (Spawn-Klar-Wand am Ursprung), die erzwungene Dorf-Zelle
//     (Hook __anazhAutoSettlement, gesichert+wiederhergestellt) materialisiert
//     BUDGETIERT über Ticks (perTick, _frameOverBudget pausiert), IDEMPOTENT
//     (worldMeta.settlementCells markiert; zweiter Durchlauf spawnt 0 neue) und
//     durch DIE EINE Slot-Quelle _spawnSettlementSlot; headless-default RUHT der
//     Auto-Zug (Null-Renderer ohne Hook → kein Pending, kein Dorf).
//   --selftest: ein in-memory korrumpiertes Golden MUSS rot erkannt werden + ein
//     Slot mit unbekannter Kultur MUSS fallen + die Auto-Dorf-Struktur-Gesetze
//     MÜSSEN auf injizierte Verletzungen feuern (die Linse ist nicht vakuös).
//   node scripts/diag-settlement.cjs [--selftest]
// Re-Mint 30.09.2026 (V18.492, begründet): der Export trägt je Slot additiv `chimney`
//   (die Schornstein-Position, die der Rauch des fachwerk-Gesetzes liest); das Layout
//   (Kulturen · Anker · Drehung · ov) blieb gegen das alte Golden feld-für-feld gleich.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const goldenDir = path.join(root, "spec/asset-contract/v6/golden");
const goldenFile = path.join(goldenDir, "siedlung.json");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Nachlese-Welle — die STATISCHEN Auto-Dorf-Gesetze (kommentar-gestrippt, die
// V18.267-Falle): Reservierung + Γ5-Stream + die EINE Slot-Quelle + Headless-Ruhe.
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
function autoStaticLaws(anazhSrc) {
    const nc = stripComments(anazhSrc);
    return [
        [
            // DORF-ERLEBNIS (17.07.) — das Band wandert MIT dem Gesetz: die
            // Reservierung trägt jetzt das Rebuild-Gedächtnis {seed,nH,x,z}
            // (Wege-Streifen über Reload) statt der nackten 1 — truthy bleibt.
            "C-S1: _autoSettlementSpawnCell RESERVIERT (settlementCells[key] = {seed,nH,x,z} — das Spawn-einmal- + Rebuild-Gedächtnis)",
            /settlementCells\[key\] = \{ seed:/.test(nc),
        ],
        [
            'C-S2: die Zell-Wahrheit zieht aus dem ":dorf"-Stream (Γ5, kein Math.random im Auto-Pfad)',
            /:dorf:/.test(nc) &&
                (() => {
                    const i = nc.indexOf("_autoSettlementCellInfo(cx, cz) {");
                    const j = i >= 0 ? nc.indexOf("_tickAutoSettlement(", i) : -1;
                    return i >= 0 && j > i && !/Math\.random/.test(nc.slice(i, j));
                })(),
        ],
        [
            "C-S3: der Tick platziert durch DIE EINE Slot-Quelle (_spawnSettlementSlot — kein Parallel-Platzierer)",
            /_tickAutoSettlement\(playerPos\) \{[\s\S]{0,4000}_spawnSettlementSlot\(/.test(nc),
        ],
        [
            "C-S4: der Auto-Zug ruht headless (Null-Renderer-Wand + __anazhAutoSettlement-Hook)",
            /_isHeadlessNull\) return;/.test(nc) && /__anazhAutoSettlement/.test(nc),
        ],
        [
            // HAUS-DOPPELBAU-SCHNITT (P0-Inventur 18.07.): das Slot-Rezept (ov)
            // reist als Guss-Stempel in den Spawn — die Optik baut aus DERSELBEN
            // hp-Wahrheit wie Blocker/ext. Ohne diese Zeile ist das Dorf ein
            // Kultur-Default-Klonfeld (der Riss).
            "C-S5: _spawnSettlementSlot reicht slot.ov als studioOv (Optik == Plan, kein Kultur-Default-Klon)",
            /studioOv: slot\.ov/.test(nc),
        ],
        [
            // SCHICHT-VOLLENDUNG (18.07.): die Hof-Bäume + Marktstände des
            // Exports heben durch den EINEN Chokepoint (Orchestrierung, kein
            // Parallel-System), Zäune durch den Zaun-Pool, Wege + Äcker durch die Wege-Karte (V18.530: Boden).
            "C-S6: der Erlebnis-Hebel konsumiert trees/staende (spawnArchitecture) + fences (Zaun-Pool) / felder (Wege-Karte)",
            (() => {
                const i = nc.indexOf("_spawnSettlementErlebnis(plan, origin, so) {");
                const j = i >= 0 ? nc.indexOf("_spawnSettlementFromExport(", i) : -1;
                const erlebnis = i >= 0 && j > i ? nc.slice(i, j) : "";
                return (
                    /plan\.trees/.test(erlebnis) &&
                    /baum_/.test(erlebnis) &&
                    /plan\.staende/.test(erlebnis) &&
                    /marktstand_dorf/.test(erlebnis) &&
                    /plan\.fences/.test(nc) &&
                    /plan\.felder/.test(nc)
                );
            })(),
        ],
    ];
}

// Kanonischer Fingerabdruck eines Exports: das volle JSON (Slots + benannte Schichten).
function fingerprint(plan) {
    return sha(JSON.stringify(plan));
}

// ===== DAS URTEIL DES ORTS (Teil O, K10 — rein, mit Selbsttest) =====
// v2 = der Ort, wie die Welt ihn trägt (plan-lokal um `ort` {x, z}): je Haus x · z · phi · y (der Boden, absolut) · tuer
// (die Tür-Zeile: x, z, y = Diele, W × D = die Wand) · obb (der Grundriss mit Dach); roads (pts, w) und platz (cx, cz, phi, ex,
// ez). hoehe(x, z) = die Welt-Höhe an einem WELT-Ort. Gemessen:
//   Sockel je Haus = Boden − tiefster Grund unter dem Grundriss (9 × 9 Punkte), Median und Maximum;
//   Tür erreichbar = die Schwelle (Boden + Diele) liegt höchstens STUFE über dem Grund 0,3 m vor ihr, die 2 m geradeaus aus
//   der Tür tragen keine Stufe > STUFE (kein Absatz vor der Schwelle), und ein Gang über ein 0,5-m-Raster (Nachbarn mit
//   |Δh| ≤ STUFE, nie durch eine Wand) erreicht einen Weg oder den Platz. Das Raster entsteht nur, wo der Gang geht.
function ortUrteil(v2, hoehe, o) {
    o = o || {};
    const STUFE = o.stufeM || 0.4;
    const G = 0.5;
    const KAPPE = o.kappe || 60000;
    const ox = v2.ort.x;
    const oz = v2.ort.z;
    const imRecht = (b, x, z, m) => {
        const c = Math.cos(b.phi || 0);
        const s = Math.sin(b.phi || 0);
        const dx = x - b.cx;
        const dz = z - b.cz;
        return Math.abs(dx * c - dz * s) <= b.ex + m && Math.abs(dx * s + dz * c) <= b.ez + m;
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
        let zu = false;
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
    if (!(m.sockelMax === 0)) fehl.push(`Sockel max ${m.sockelMax} m (Median ${m.sockelMedian})`);
    if (!(m.tuerenN > 0 && m.tuerenOk === m.tuerenN)) fehl.push(`Türen erreichbar ${m.tuerenOk}/${m.tuerenN}`);
    if (!(m.kronen === 0)) fehl.push(`Kronen in Grundrissen ${m.kronen}`);
    if (!(m.laternenPlan > 0 && m.laternenWelt === m.laternenPlan))
        fehl.push(`Laternen Welt ${m.laternenWelt} / Plan ${m.laternenPlan}`);
    if (!(m.planHashGleich === true)) fehl.push("Plan-Hash Studio ≠ Welt");
    if (!(m.fremdBauten === 0)) fehl.push(`fremde Bauten im Erdbau ${m.fremdBauten}`);
    // endet die Kette vor 8 s (der Wagen fuhr den Dorfweg zu Ende), zählt das Tempo bis zum Ende über 8 s: der Weg ist kürzer
    // als das Soll, nie der Wagen langsamer
    const gt8 = m.gtEnde > 0 ? Math.round(((m.gtWeg / m.gtEnde) * 8) * 100) / 100 : m.gtWeg;
    if (!(gt8 >= GT_SOLL_M))
        fehl.push(`GT auf dem Dorfweg ${m.gtWeg} m in ${m.gtEnde > 0 ? m.gtEnde : 8} s (${gt8} m je 8 s, Soll ≥ ${GT_SOLL_M})`);
    return fehl;
}
const GT_SOLL_M = 60;

// DER GT AUF DEM DORFWEG (K10 × Auge 10.10. Bild 05: 8 s Vollgas, 5,2 m — der Wagen hing am Sockel-Kasten): im Browser,
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
        for (let i = 0; i < 60 && !e.instanced && !e.mesh; i++) {
            r._rebuildArchitectureMesh(e);
            await new Promise((ok) => setTimeout(ok, 50));
        }
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
        res.err = (err && err.stack) || String(err);
    }
    return res;
}

// Die dp-Fixtures der Goldens (klein = schnell; ein Dorf + ein Weiler).
const FIXTURES = [
    { seed: 7, nH: 12 },
    { seed: 12345, nH: 6 },
];

(async () => {
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FC = globalThis.__fachwerkCore;

    // ===== DIE ALTWELTEN (K10 × Entscheid §5.4) — Mess-Modus, kein Tor: `--altwelt <save.json> …` lädt jeden Save durch den
    // echten Lade-Pfad (`loadState`: Boden-Umzug, die alten Orte ziehen auf ihren Erdbau) und zählt die Bauten, die kein Ort
    // trägt (kein Grundriss, keine Dorf-Ausstattung), deren Boden der Erdbau verschiebt (|Δh| > 5 cm gegen dieselbe Welt ohne
    // Erdbau) bzw. die AUF einer Erdbau-Fläche stehen — je Art, Natur (Baum, Busch, Fels, Kristall) getrennt.
    const iAlt = process.argv.indexOf("--altwelt");
    if (iAlt >= 0) {
        const dateien = process.argv.slice(iAlt + 1).filter((a) => !a.startsWith("--"));
        const puppeteer = require("puppeteer");
        const PORT = Number(process.env.SETTLEMENT_PORT || 4436);
        const server = require("http").createServer((req, res) => {
            let p = req.url.split("?")[0];
            if (p === "/") p = "/index.html";
            const fp = path.join(root, p);
            if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
            fs.readFile(fp, (err, data) => {
                if (err) return ((res.statusCode = 404), res.end());
                const ext = path.extname(fp);
                res.setHeader(
                    "Content-Type",
                    ext === ".html"
                        ? "text/html"
                        : ext === ".js"
                          ? "application/javascript"
                          : ext === ".json"
                            ? "application/json"
                            : "application/octet-stream"
                );
                res.end(data);
            });
        });
        await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
        const browser = await puppeteer.launch({
            headless: true,
            protocolTimeout: 240000,
            args: [
                "--use-angle=swiftshader",
                "--enable-unsafe-swiftshader",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        for (const datei of dateien) {
            const save = JSON.parse(fs.readFileSync(datei, "utf8"));
            const page = await browser.newPage();
            await page.evaluateOnNewDocument(() => {
                window.__anazhForceFoundry = true;
                window.__anazhHeadlessNullRenderer = true;
            });
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
            const z = await page.evaluate(async (s) => {
                const dl = performance.now() + 90000;
                while (performance.now() < dl) {
                    const r0 = window.anazhRealm;
                    const f0 = r0 && typeof r0._ensureAssetFoundry === "function" ? r0._ensureAssetFoundry() : null;
                    if (f0 && f0.ready && f0.recipes && r0.state.blueprints && r0.state.blueprints.haus_alemannisch)
                        break;
                    await new Promise((ok) => setTimeout(ok, 100));
                }
                const r = window.anazhRealm;
                const out = {
                    arten: {},
                    natur: 0,
                    gebaut: 0,
                    auf: 0,
                    verschoben: 0,
                    schwebend: 0,
                    dhMax: 0,
                    nebenMax: 0,
                };
                try {
                    r.loadState(s);
                    const G = globalThis.__gelaendeCore;
                    const L = r._gelaende();
                    const L0 = {
                        seed: L.seed,
                        noise: L.noise,
                        baseHeight: L.baseHeight,
                        waterLevel: L.waterLevel,
                        erbgut: L.erbgut,
                        regionSize: L.regionSize,
                        erdbau: null,
                    };
                    out.erdbauSplats = L.erdbau ? L.erdbau.n : 0;
                    out.orte = r.state.architectures.filter((e) => e.fundament).length;
                    for (const e of r.state.architectures) {
                        if (!e || !e.position || e.fundament || /_dorf$/.test(e.type)) continue;
                        const dh = Math.abs(
                            G.hoehe(L, e.position.x, e.position.z, true) - G.hoehe(L0, e.position.x, e.position.z, true)
                        );
                        const auf = !r._ortFrei(e.position.x, e.position.z, 0.01);
                        if (!(dh > 0.05) && !auf) continue;
                        const natur = /^(baum_|grown_|fels|kristall)/.test(e.type);
                        out[natur ? "natur" : "gebaut"]++;
                        if (auf) out.auf++;
                        if (dh > 0.05) {
                            out.verschoben++;
                            // folgt der Bau seinem Boden? (Fuß-Höhe 0,5 über dem Grund, wie jeder Bau gesetzt wird)
                            const neben = Math.abs(e.position.y - 0.5 - G.hoehe(L, e.position.x, e.position.z, true));
                            out.nebenMax = Math.max(out.nebenMax, Math.round(neben * 100) / 100);
                            if (neben > 0.05) out.schwebend++;
                        }
                        out.dhMax = Math.max(out.dhMax, Math.round(dh * 100) / 100);
                        out.arten[e.type] = (out.arten[e.type] || 0) + 1;
                    }
                } catch (err) {
                    out.err = (err && err.stack) || String(err);
                }
                return out;
            }, save);
            console.log(`ALTWELT ${datei}: ` + JSON.stringify(z));
            await page.close();
        }
        await browser.close();
        server.close();
        process.exit(0);
    }

    // ===== SELBST-TEST =====
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Settlement-Linse feuert ===");
        const a = FC.exportSettlement(FIXTURES[0]);
        // V1: ein korrumpiertes Golden wird erkannt (die Byte-Wand ist nicht vakuös).
        const fakeGolden = { [JSON.stringify(FIXTURES[0])]: "deadbeef" };
        check(
            "Selbst-Test 1: korruptes Golden wird erkannt",
            fingerprint(a) !== fakeGolden[JSON.stringify(FIXTURES[0])]
        );
        // V2: ein manipulierter Export (ein Slot verschoben) kippt den Fingerabdruck.
        const b = JSON.parse(JSON.stringify(a));
        b.slots[0].x += 0.001;
        check("Selbst-Test 2: ein 1-mm-Slot-Versatz kippt den Fingerabdruck", fingerprint(a) !== fingerprint(b));
        // V3 (Nachlese-Welle): die Auto-Dorf-Struktur-Gesetze feuern auf Injektion.
        const anazhSrcST = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        const okAll = autoStaticLaws(anazhSrcST).every((l) => l[1] === true);
        check("Selbst-Test 3: die Auto-Dorf-Gesetze sind am HEAD gruen (Vorbedingung)", okAll);
        const broken1 = anazhSrcST.replace("settlementCells[key] = { seed:", "settlementCells[key] = kaputt({ seed:");
        const cs1 = autoStaticLaws(broken1).find((l) => l[0].startsWith("C-S1"));
        check("Selbst-Test 4: Reservierung entfernt -> C-S1 feuert", cs1 && cs1[1] === false);
        const broken2 = anazhSrcST.replace(
            /_spawnSettlementSlot\(q\.plan\.slots/g,
            "_meinParallelPlatzierer(q.plan.slots"
        );
        const cs3 = autoStaticLaws(broken2).find((l) => l[0].startsWith("C-S3"));
        check("Selbst-Test 5: Parallel-Platzierer injiziert -> C-S3 feuert", cs3 && cs3[1] === false);
        // V4 (HAUS-DOPPELBAU): der ov-Stempel entfernt -> C-S5 feuert (der
        // Doppelbau-Riss kann nicht still wiederkehren).
        const broken3 = anazhSrcST.replace(/studioOv: slot\.ov/g, "/* ov verworfen */");
        const cs5 = autoStaticLaws(broken3).find((l) => l[0].startsWith("C-S5"));
        check("Selbst-Test 6: ov-Stempel entfernt -> C-S5 feuert", cs5 && cs5[1] === false);
        // V5 (SCHICHT-VOLLENDUNG): der Baum-Konsum entfernt -> C-S6 feuert.
        const broken4 = anazhSrcST.replace(/plan\.trees/g, "planXtrees");
        const cs6 = autoStaticLaws(broken4).find((l) => l[0].startsWith("C-S6"));
        check("Selbst-Test 7: plan.trees-Konsum entfernt -> C-S6 feuert", cs6 && cs6[1] === false);
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
            ort: { x: 100, z: 100 },
            slots,
            roads: [
                {
                    pts: [
                        { x: -20, z: 0 },
                        { x: 20, z: 0 },
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
            JSON.stringify(u0)
        );
        const absatz = (x, z) => (z - 100 < 5 ? 9 : 10);
        const u1 = ortUrteil(ortT([haus(-8, 8, 10), haus(8, 8, 10)]), absatz);
        check(
            "Selbst-Test 9: ein Absatz von 1 m vor den Türen -> 0/2, die Stufe beim Namen",
            u1.tuerenOk === 0 && u1.tuerenFehl.every((t) => t.vorStufe === 1),
            JSON.stringify(u1.tuerenFehl)
        );
        const u2 = ortUrteil(ortT([haus(-8, 8, 11), haus(8, 8, 10)]), eben);
        check(
            "Selbst-Test 10: ein Haus 1 m über dem Grund -> Sockel max 1, seine Schwelle fällt",
            u2.sockelMax === 1 && u2.tuerenOk === 1 && u2.tuerenFehl[0].si === 0,
            JSON.stringify(u2)
        );
        const u3 = ortUrteil(Object.assign(ortT([haus(-8, 8, 10)]), { roads: [] }), eben, { kappe: 4000 });
        check("Selbst-Test 11: ohne Weg erreicht keine Tür ein Ziel", u3.tuerenOk === 0 && u3.tuerenN === 1);
        const gut = {
            sockelMax: 0,
            sockelMedian: 0,
            tuerenOk: 2,
            tuerenN: 2,
            kronen: 0,
            laternenWelt: 6,
            laternenPlan: 6,
        };
        Object.assign(gut, { planHashGleich: true, fremdBauten: 0, gtWeg: 76.4 });
        check("Selbst-Test 12: das Verdikt eines gehaltenen Orts ist leer", ortVerdikt(gut).length === 0);
        const schlecht = Object.assign({}, gut, {
            kronen: 3,
            laternenWelt: 0,
            planHashGleich: false,
            sockelMax: 2.72,
            gtWeg: 5.2,
        });
        const vs = ortVerdikt(schlecht).join(" · ");
        check(
            "Selbst-Test 13: das Verdikt nennt Sockel, Kronen, Laternen, Plan-Hash und den GT auf dem Dorfweg beim Namen",
            /Sockel max 2.72/.test(vs) &&
                /Kronen in Grundrissen 3/.test(vs) &&
                /Laternen Welt 0/.test(vs) &&
                /Plan-Hash/.test(vs) &&
                /GT auf dem Dorfweg 5.2 m/.test(vs),
            vs
        );
        check(
            "Selbst-Test 13b: endet der Dorfweg vor 8 s, zählt das Tempo bis zum Ende (48 m in 5,1 s hält, 20 m in 5,1 s fällt)",
            ortVerdikt(Object.assign({}, gut, { gtWeg: 48.16, gtEnde: 5.1 })).length === 0 &&
                /GT auf dem Dorfweg 20 m in 5.1 s/.test(ortVerdikt(Object.assign({}, gut, { gtWeg: 20, gtEnde: 5.1 })).join(" · "))
        );
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
            const mit = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(true));
            const ohne = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(false));
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
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRÜN.");
        process.exit(0);
    }

    console.log("=== N5.7 SETTLEMENT — TEIL N: exportSettlement (Node, deterministisch + eingefroren) ===");
    check("exportSettlement existiert im Kern (das exportDrive-Muster)", typeof FC.exportSettlement === "function");
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
            `slots=${p1.slots && p1.slots.length}`
        );
        check(
            `benannte Schichten reisen fuer ${key} (roads/brunnen/spawn/welt — v1 unkonsumiert erlaubt)`,
            Array.isArray(p1.roads) && Array.isArray(p1.brunnen) && !!p1.spawn && !!p1.welt,
            `roads=${p1.roads && p1.roads.length}`
        );
    }
    check(
        "seed-sensitiv (Seed 7 != Seed 12345)",
        fingerprint(plans[JSON.stringify(FIXTURES[0])]) !== fingerprint(plans[JSON.stringify(FIXTURES[1])])
    );

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
            `GOLDEN byte-treu fuer ${key} (${golden[key] && golden[key].slots} Slots · „${golden[key] && golden[key].name}")`,
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
        const Bs = [
            { dims: { W: 8, D: 7 }, kern: false, p: {} },
            { dims: { W: 8, D: 7 }, kern: false, p: {} },
        ];
        const pl = [
            { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
            { phi: 0, x: 9, z: 0, obb: { cx: 9, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
        ];
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
        const weit = FC.reihenSnap(
            [
                { dims: { W: 8, D: 7 }, kern: false, p: {} },
                { dims: { W: 8, D: 7 }, kern: false, p: {} },
            ],
            [
                { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
                // BÜHNE: Grundriss-Daten einer Einheits-Probe, kein gesetzter Ort
                { phi: 0, x: 30, z: 0, obb: { cx: 30, cz: 0, phi: 0, ex: 4, ez: 3.5 } },
            ],
            gap
        );
        check("Snap-Probe: ferne Nachbarn (Fuge>1.8m) bleiben stehen", weit === 0, `snaps=${weit}`);
        const stadt = FC.exportSettlement({ seed: 7, nH: 20 });
        const bwSlots = stadt.slots.filter((s) => s.ov && s.ov.brandwand).length;
        check(
            "Konsum-Probe: der städtische Export trägt ov.brandwand (der Kern-Pfad ruft DIESELBE Wahrheit wie buildDorf)",
            stadt.staedtisch === true && bwSlots >= 1,
            `groesse=${stadt.groesse} · brandwand-Slots=${bwSlots}`
        );
        // SCHICHT-VOLLENDUNG (18.07.): der Export trägt NUR gelebte Schichten —
        // trees/fences/felder/staende reisen (Hof-Bäume + Zäune + Äcker +
        // Marktstände haben Konsumenten); fluss/bruecken/graph (keine Welt-
        // Wahrheit) und die mauer sind GESTRICHEN (kein toter Passagier,
        // Vertrags-Akt); die LATERNEN reisen seit K10 (ihr Leser ist das
        // Leuchtquellen-Gesetz der Welt, die Gestalt `laterne_dorf`, K11). Grund: die Stadt-Genese mit Mauer/Fluss/Brücken in der
        // Welt ist neues Verhalten hinter dem Feature-Stopp bis v1.0
        // (docs/roadmap.md §0.v1, Leben-Synthese §5.3) — offen, benannt.
        check(
            "SCHICHT-VOLLENDUNG: Export trägt trees/fences/felder/staende/laternen, aber fluss/bruecken/graph/mauer sind gestrichen",
            Array.isArray(stadt.trees) &&
                Array.isArray(stadt.fences) &&
                Array.isArray(stadt.felder) &&
                Array.isArray(stadt.staende) &&
                stadt.mauer === undefined &&
                Array.isArray(stadt.laternen) &&
                stadt.fluss === undefined &&
                stadt.bruecken === undefined &&
                stadt.graph === undefined,
            `trees=${Array.isArray(stadt.trees) ? stadt.trees.length : "fehlt"} fences=${Array.isArray(stadt.fences) ? stadt.fences.length : "fehlt"} laternen=${Array.isArray(stadt.laternen) ? stadt.laternen.length : "fehlt"}`
        );
        // DAS DORF-LICHT (K10, Auge 13.10.): das Start-Dorf trug 0 Laternen, „Dorf-Lichter nachts = Laternenzahl" hielt
        // mit 0 = 0 vakuös. Jeder Plan mit Wegen trägt je Platz eine und je 25 m Weg eine Laterne (das Dorf-Licht des
        // Gesetzbuchs, dorfLayout) — über Dörfer, Weiler und Märkte, jede Epoche. Selbsttest: derselbe Plan ohne Laternen.
        const dorfLicht = (pl) => {
            let wegM = 0;
            for (const rd of pl.roads || []) wegM += rd.len || 0;
            const soll = (pl.platz ? 1 : 0) + Math.floor(wegM / 25);
            const n = Array.isArray(pl.laternen) ? pl.laternen.length : 0;
            return { n, soll, wegM: Math.round(wegM), ok: !(wegM > 0) || n >= soll };
        };
        const lichtFehl = [];
        let lichtN = 0;
        for (const [seed, nH] of [
            [7, 12],
            [12345, 6],
            [4291161376, 13],
            [3, 9],
            [7, 18],
            [11, 40],
        ])
            for (const epoche of [undefined, "antike"]) {
                const pl = FC.exportSettlement({ seed, nH, epoche });
                const d = dorfLicht(pl);
                lichtN++;
                if (!d.ok) lichtFehl.push(`${seed}/${nH}/${epoche || "-"}: ${d.n} Laternen < ${d.soll} (${d.wegM} m Weg)`);
            }
        check(
            `DAS DORF-LICHT: jeder Plan mit Wegen trägt je Platz und je 25 m Weg eine Laterne (${lichtN} Pläne)`,
            lichtFehl.length === 0,
            lichtFehl.slice(0, 3).join(" · ")
        );
        {
            const pl = FC.exportSettlement({ seed: 7, nH: 12 });
            check(
                "Selbst-Test 15: derselbe Plan ohne Laternen fällt im Dorf-Licht",
                dorfLicht(pl).ok && !dorfLicht(Object.assign({}, pl, { laternen: [] })).ok
            );
        }
    }

    // ===== TEIL B: der lebende Kanal (Browser, foundry-ON) =====
    console.log("\n=== TEIL B: der lebende Kanal (Browser, foundry-ON, Null-Renderer) ===");
    const puppeteer = require("puppeteer");
    const http = require("http");
    const PORT = Number(process.env.SETTLEMENT_PORT || 4436);
    const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".woff2": "font/woff2",
    };
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/") p = "/index.html";
        const fp = path.join(root, p);
        if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = {};
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            if (f && f.ready && f.recipes && f.recipes.alemannisch) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        res.bookReady = !!(f && f.ready && f.recipes && f.recipes.alemannisch);
        // 1) Der Export durch den EINEN Worker (Timeout-bewacht — massBau × Häuser braucht Sekunden).
        const plan = await Promise.race([
            r._foundryRequestSettlement({ seed: 7, nH: 8 }),
            new Promise((res3) => setTimeout(() => res3("timeout"), 90000)),
        ]);
        res.planOk = !!(plan && plan !== "timeout" && Array.isArray(plan.slots) && plan.slots.length >= 4);
        res.planName = plan && plan.name;
        res.planSlots = plan && plan.slots ? plan.slots.length : plan === "timeout" ? "timeout" : -1;
        if (!res.planOk) return res;
        // 2) Der Konsument: POSITIONS-DETERMINISTISCH am SELBEN Anker (die Wasser-Wand ist
        //    Terrain-Wahrheit je Ort — verschiedene Anker duerfen verschieden viele Slots
        //    tragen; die Determinismus-Aussage ist: derselbe Export + derselbe Anker ⇒
        //    byte-dieselben Eintraege [type/x/z/rot/seed]).
        const before = r.state.architectures.length;
        // BÜHNE: Bau-Anker: derselbe Export am selben Anker — den Ort trägt das Platz-Gesetz des Stamms (_spawnSettlementFromExport)
        const o1 = { x: 400, z: 400 };
        // Der zweite Akt steht auf dem geräumten Ort: die Bau-Wand (_bauFrei) setzt kein Haus in ein Haus — neben dem ersten
        // Dorf entstünde am selben Anker keines (Integration Welle L, gate:haus-welt W7). Die folgenden Proben lesen die
        // lebenden Einträge des zweiten Akts.
        const r1 = r._spawnSettlementFromExport(plan, o1);
        const mid = r.state.architectures.length;
        const schnitt = (list) => list.map((e) => [e.type, e.position.x, e.position.z, e.rotationY, e.seed]);
        const akt1 = r.state.architectures.slice(before, mid);
        const e1Schnitt = schnitt(akt1);
        for (const e of akt1) r.removeArchitecture(e);
        const mid2 = r.state.architectures.length;
        const r2 = r._spawnSettlementFromExport(plan, o1);
        const after = r.state.architectures.length;
        res.placed1 = r1.placed;
        res.skipped1 = r1.skipped;
        res.placed2 = r2.placed;
        res.entriesMatch = mid - before === r1.placed && mid2 === before && after - mid2 === r2.placed;
        const e1 = r.state.architectures.slice(mid2, after);
        res.allHaus = e1.every((e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0);
        // Offsets relativ zum Anker byte-vergleichen (x/z; y ist Terrain-Wahrheit je Ort).
        const off = (list, o) => list.map((e) => [e[0], e[1] - o.x, e[2] - o.z, e[3], e[4]]);
        res.offsetsDeterministic =
            r1.placed === r2.placed && JSON.stringify(off(e1Schnitt, o1)) === JSON.stringify(off(schnitt(e1), o1));
        // Slot-Anker == Plan-Slot (K10): JEDER platzierte Eintrag trägt exakt anker + slot.x/z, phi und seed seines Slots und
        // steht auf dem Boden des Plans v2 (y = slot.y + 0,5, `_ortPlanSetzen` — derselbe Plan am selben Anker). Die Welt rückt
        // kein Haus: die Ersatz-Orte und die hMax-Suche fielen mit dem Erdbau des Orts.
        const v2 = typeof r._ortPlanSetzen === "function" ? r._ortPlanSetzen(plan, o1) : null;
        res.planV2 = !!(v2 && v2.version === 2);
        res.slotAnchorExact =
            !!v2 &&
            e1.length > 0 &&
            e1.every((e) => {
                const sl = v2.slots.find((x) => x.seed >>> 0 === e.seed);
                if (!sl || e.rotationY !== (sl.phi || 0)) return false;
                return (
                    Math.abs(e.position.x - (o1.x + sl.x)) < 1e-9 &&
                    Math.abs(e.position.z - (o1.z + sl.z)) < 1e-9 &&
                    Math.abs(e.position.y - (sl.y + 0.5)) < 1e-9
                );
            });
        // HAUS-DOPPELBAU-SCHNITT (P0-Inventur 18.07.) — der KONSUM-Beweis lebt:
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
        // DORF-IN-TERRAIN — der Footprint reist als entry.fundament (der Grundriss der Wände und des Erdbaus eines Altstands);
        // das Podest fiel mit dem Erdbau (K10): keine Fundament-Box, kein Sockel-Pool.
        res.fundamentTravels = e1.length > 0 && e1.every((e) => e.fundament && Number.isFinite(e.fundament.ex));
        res.podestAbsent = typeof r._archFundamentBox === "undefined" && !("archFundament" in r.state);
        // 3) fail-closed: ein Slot mit unbekannter Kultur faellt (kein Spawn, kein Crash).
        const fake = JSON.parse(JSON.stringify(plan));
        fake.slots = [Object.assign({}, fake.slots[0], { kultur: "gibtsnicht" })];
        const r3 = r._spawnSettlementFromExport(fake, { x: 900, z: 900 });
        res.failClosed = r3.placed === 0 && r3.skipped === 1;
        // 4) Der Chat-Konsument "dorf" existiert in der System-Befehls-Tabelle.
        res.chatDorf = r.chatSystemPatterns.some((p) => p.example && p.example.indexOf("dorf") === 0);
        // 5) Γ5: spawnSettlement wuerfelt seed-frei aus dem Welt-Stream (Source-Probe am lebenden Symbol).
        // Welle L: der Same zieht aus dem EINEN Bau-Strom `_bauSame("stadt")` (Welt-Seed:<art>:<n>, FNV-1a) — derselbe für
        // den Chat-Satz „baue dorf hier" (die Probe wandert mit dem Code).
        const src = window.__codeOf ? window.__codeOf(r.spawnSettlement) : r.spawnSettlement.toString();
        const srcSame = window.__codeOf ? window.__codeOf(r._bauSame) : String(r._bauSame);
        // derselbe Strom für den Chat-Satz „baue dorf hier" (Welle L: vorher würfelte Math.random den Dorf-Samen)
        const baueHier = (r.chatDslPatterns || []).find((p) => p.example === "baue dorf hier");
        const srcHier = baueHier
            ? (window.__codeOf ? window.__codeOf(baueHier.build) : String(baueHier.build)).replace(/\/\/[^\n]*/g, "")
            : "";
        res.gammaHier = /_bauSame\(/.test(srcHier) && !/Math\.random/.test(srcHier);
        res.gammaStream =
            /_bauSame\("stadt"\)/.test(src) &&
            !/Math\.random/.test(src) &&
            /:\$\{art\}:/.test(srcSame) &&
            !/Math\.random/.test(srcSame);
        // Nachlese-Welle (V9.56-i — die Probe wandert mit dem Code): die Wasser-Wand
        // lebt seit der Slot-Extraktion in der EINEN Slot-Quelle _spawnSettlementSlot.
        // Schau-2: das LAND (`_landAt`) über dem ganzen Fundament, die Zwillings-Probe fiel; seit der Gegenprüfung fragt der
        // Slot das EINE Land des Fundaments (`_fundamentLand`: jeder Punkt des `_fundamentRaster` fragt `_landAt`) — dieselbe
        // Probe wie die Wand jedes Werks an der Wurzel.
        const codeOf = (f) => (window.__codeOf ? window.__codeOf(f) : f.toString());
        const fl = typeof r._fundamentLand === "function" ? codeOf(r._fundamentLand) : "";
        res.waterWall =
            /_fundamentLand\(/.test(codeOf(r._spawnSettlementSlot)) &&
            /_fundamentRaster\(/.test(fl) &&
            /_landAt\(/.test(fl);
        // Der Anker misst den Plan selbst (`_siedlungsAnker`: das Dorf vor dem Spieler, im Bildwinkel); die Schätzung über
        // `_structureSpawnPos("haus_basis")` fiel (Leben-Schau 07.10.: „dorf 7 18" umringte den Spieler).
        res.anchorChokepoint = /this\._siedlungsAnker\(plan/.test(src) && !/_structureSpawnPos/.test(src);
        // 6) DER DSL-AKT spawn_village liest die Größe aus dem Siedlungs-Gesetz NACH der Buch-Ankunft (Welle L): das Dorf
        //    des Akts trägt nH = SIEDLUNG.nHMin + (Same >>> 24) % SIEDLUNG.nHSpan (vorher bei kaltem Buch still der
        //    Kern-Default). Gemessen am Rebuild-Gedächtnis des Dorfs (settlementCells: Same, nH, Ort).
        try {
            const SG = r.constructor._siedlungGesetz();
            const same = 0x5a5a1234;
            const pv = { x: o1.x + 600, y: 0, z: o1.z - 600 };
            pv.y = r.getTerrainHeightAt(pv.x, pv.z);
            const ctxV = { budget: { spawnsLeft: 4 }, log: [], rng: () => 0.5, source: "human" };
            r.dslEffects.spawn_village([["at", pv.x, pv.y, pv.z], same], ctxV);
            let cell = null;
            for (let k = 0; k < 600 && !cell; k++) {
                await new Promise((rs) => setTimeout(rs, 100));
                const sc = (r.state.worldMeta && r.state.worldMeta.settlementCells) || {};
                // der Wege-Schlüssel des Dorfs: d:<Same>@<Ort> (Welle L), auf älteren Ständen d:<Same>
                for (const key of Object.keys(sc))
                    if (key === "d:" + (same >>> 0) || key.indexOf("d:" + (same >>> 0) + "@") === 0) cell = sc[key];
            }
            res.villageNH = cell ? cell.nH : null;
            res.villageNHSoll = SG ? SG.nHMin + ((same >>> 24) % SG.nHSpan) : null;
        } catch (e) {
            res.villageNHErr = (e && e.message) || String(e);
        }
        // ===== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) =====
        res.c = {};
        try {
            const A = r.constructor.AUTO_SETTLEMENT;
            // C1 — Zell-Wahrheit deterministisch + zell-sensitiv (reine Funktion, Γ5).
            let cand = null;
            let candCount = 0;
            for (let cz = -6; cz <= 6 && !cand; cz++) {
                for (let cx = -6; cx <= 6; cx++) {
                    const i1 = r._autoSettlementCellInfo(cx, cz);
                    if (!i1) continue;
                    candCount++;
                    if (r._autoSettlementSiteOk(i1.x, i1.z)) {
                        cand = i1;
                        break;
                    }
                }
            }
            res.c.hashRare = candCount > 0 && candCount < 169; // selten, aber existent (13x13 Zellen)
            const rep = cand ? r._autoSettlementCellInfo(parseInt(cand.key), parseInt(cand.key.split(",")[1])) : null;
            res.c.deterministic = !!(cand && rep && JSON.stringify(cand) === JSON.stringify(rep));
            res.c.spawnClearWall = r._autoSettlementSiteOk(0, 0) === false; // die Warmup-Welt bleibt dorffrei
            res.c.channelLive = r._autoSettlementChannelLive() === true; // der Dispatch-Kanal (M8)
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
            const archBefore = r.state.architectures.length;
            const plan = cand
                ? await Promise.race([
                      r._autoSettlementSpawnCell(parseInt(key), parseInt(key.split(",")[1]), cand),
                      new Promise((rs) => setTimeout(() => rs("timeout"), 90000)),
                  ])
                : null;
            res.c.planOk = !!(plan && plan !== "timeout" && Array.isArray(plan.slots));
            // DORF-ERLEBNIS (17.07.) — das Band wandert MIT dem Gesetz: die
            // Reservierung ist jetzt das Rebuild-Gedächtnis-OBJEKT {seed,nH,x,z}.
            res.c.reserved = !!(
                key &&
                wm.settlementCells &&
                wm.settlementCells[key] &&
                typeof wm.settlementCells[key] === "object" &&
                isFinite(wm.settlementCells[key].seed)
            );
            // DORF-ERLEBNIS — Brunnen/Wege heben bei ANKUNFT (deliberat, klein,
            // budget-frei); die Budget-Wand gilt der HAUS-Materialisierung:
            // Referenz ist der Stand NACH der Ankunft.
            const archAnkunft = r.state.architectures.length;
            // EXISTENZ VOR FRAMERATE (Welle L, Leben-Prüfung N-D9; Lehre 13): über dem Frame-Budget DROSSELT der Takt das
            // Tempo, er sperrt die Siedlung nie — 16 Takte dauerhaft über dem Budget tragen Häuser, höchstens einen je
            // drosselTakte-ten Takt. Vorher (die V18.282-Wand) entstand über dem Budget nichts: 60 von 60 Proben, 0 Häuser.
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
                await new Promise((rs) => setTimeout(rs, 0));
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
                await new Promise((rs) => setTimeout(rs, 0));
            }
            // gezählt werden die bearbeiteten Slots (ein Slot an Wasser/Klippe fällt geschlossen, er zählt als Schritt)
            const qIdx1 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : qIdx0;
            res.c.ueberBudget = Number.isFinite(qStart) && Number.isFinite(qIdx1) ? qIdx1 - qStart : null;
            res.c.ueberBudgetFrames = FRAMES;
            res.c.dekoLaeufe = dekoLaeufe;
            res.c.budgetWall = res.c.ueberBudget >= 1 && res.c.ueberBudget <= Math.floor(dekoLaeufe / drossel) + 1;
            r.state._frameOverBudget = false;
            // Materialisierung: je Tick hoechstens perTick Slots (gezaehlt).
            let ticks = 0;
            let maxPerTick = 0;
            let prevCount = r.state.architectures.length;
            while (r._autoSettlementQueue && ticks < 500) {
                r._tickAutoSettlement({ x: cand.x, z: cand.z });
                const now2 = r.state.architectures.length;
                if (now2 - prevCount > maxPerTick) maxPerTick = now2 - prevCount;
                prevCount = now2;
                ticks++;
            }
            const archAfter = r.state.architectures.length;
            res.c.placed = archAfter - archBefore;
            res.c.ticks = ticks;
            res.c.budgeted = maxPerTick > 0 && maxPerTick <= A.perTick && ticks >= 2;
            // DORF-ERLEBNIS — die Siedlung hebt jetzt auch BRUNNEN (brunnen_dorf)
            // und HOF-BÄUME (SCHICHT-VOLLENDUNG 18.07.: Studio-Bäume der
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
                            e.type.indexOf("baum_") === 0)
                );
            // C4 — IDEMPOTENZ: dieselbe Zelle nochmal -> 0 neue (Reservierung traegt).
            const again = await r._autoSettlementSpawnCell(parseInt(key), parseInt(key.split(",")[1]), cand);
            for (let t2 = 0; t2 < 5; t2++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.idempotent = again === null && r.state.architectures.length === archAfter;
            // C5 — DER GENESIS-PORTAL-RING (V18.486, Schöpfer: „beim ersten spawn
            // die kernportale um die genesis-plattform anordnen"): am Genesis-Ort
            // (`_genesisMitte`, die Mitte der Start-Plattform — Welle L, V-D1) heben alle builtIn-Welt-Portale im
            // Kreis R 11 m; doppelt idempotent
            // (worldMeta-Stempel + Existenz-Probe). Bis hier hatte der Ring KEINE
            // Linse — Fertigkeit ohne Konsum-Beweis ist die verbotene Klasse.
            res.c.ring = {};
            try {
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
                const ringVorher = r.state.architectures.filter(
                    (e) => e && e.position && portalArten.includes(e.type) && d2M(e) <= 400
                ).length;
                for (let t5 = 0; t5 < 30 && !wm5.genesisPortalRing; t5++)
                    r._genesisPortalRing({ x: M5.x, y: 1, z: M5.z });
                const ringNachher = r.state.architectures.filter(
                    (e) => e && e.position && portalArten.includes(e.type) && d2M(e) <= 400
                ).length;
                res.c.ring.stempel = wm5.genesisPortalRing === true;
                res.c.ring.gebaut = ringNachher - ringVorher;
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
            } catch (e5) {
                res.c.ring.err = (e5 && e5.message) || String(e5);
            }
            // C6 — DER WEGE-SCHLÜSSEL TRÄGT DEN ORT (Welle L, Leben-Prüfung S-W1): zwei Siedlungen mit DEMSELBEN Samen an
            // zwei Orten bauen je ihre Wege (die Wege-Formen werden am echten Bau gezählt, `_stlWegeBuild` läuft durch).
            // Vorher schlüsselte das Gedächtnis nur den Samen: die zweite (die Stadt `dorf 7 120` neben `dorf 7 18`) blieb ohne Weg.
            try {
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
            } catch (e6) {
                res.c.wegeErr = (e6 && e6.message) || String(e6);
            }
            // C7 — DER BLICK GEHÖRT DEM, DER DAS DORF VERLANGT (0710-7; OMEN 0710-6 Boot 4B: ein Nexus-Dorf drehte die Gier
            // mitten im Lauf auf −2,745): ein Dorf aus einem Nexus-Programm (DSL-Quelle „nexus") lässt den Blick des Spielers
            // stehen; eines aus dem Chat-Programm des Spielers (DSL-Quelle „human") und der Befehl „dorf" richten ihn auf IHR
            // neues Dorf (den Schwerpunkt der eben gesetzten Häuser) — nie auf alle Häuser der Welt.
            try {
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
                res.c.blick = {
                    nexus: await probe(1500, -1500, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4712], { source: "nexus" })
                    ),
                    spieler: await probe(-1500, -1500, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4713], { source: "human" })
                    ),
                    chat: await probe(1800, 600, () => {
                        const muster = r.chatSystemPatterns.find((q) => q.re.test("dorf 4714 8"));
                        muster.run("dorf 4714 8".match(muster.re), () => {});
                    }),
                    // die Werkzeuge des Spielers (0710-8): Fähigkeit per Taste, Wirken, Verzehr — und ein Mitspieler (für die Welt)
                    faehigkeit: await probe(-1800, 600, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4715], { source: "ability:dorfruf" })
                    ),
                    wirken: await probe(1800, -600, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4716], { source: "capability:dorf" })
                    ),
                    verzehr: await probe(-1800, -600, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4717], { source: "consume:dorfsamen" })
                    ),
                    mitspieler: await probe(600, 1800, () =>
                        r.dslRun(["spawn_village", ["at_player"], 4718], { source: "remote-peer" })
                    ),
                };
                r.spawnSettlement = orig;
            } catch (e7) {
                res.c.blickErr = (e7 && e7.message) || String(e7);
            }
            // Hook wiederherstellen (sichern + wiederherstellen, nie loeschen — die Disziplin):
            if (prevHook === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = prevHook;
            r.state._frameOverBudget = fob;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }
        return res;
    });

    // ===== TEIL O: DER ORT AUF DEM GELÄNDE (K10) — das Dorf 7/18 der Gründerzeit an einem Hang, gemessen an der Welt =====
    // Der Akt `spawnSettlement` an einem Hang (Gefälle 0,12–0,25 über 16 m, fern der Orte der Teile B und C); gemessen wird,
    // was die Welt trägt: die Häuser (Eintrag: Ort, Gier, Boden y − 0,5), der Grund unter und vor ihnen (`getTerrainHeightAt`,
    // der Boden der Körper), der Wald-Plan (`_forestCellDarts`), die Laternen (Einträge der Studio-Gestalt laterne) und der
    // Plan v2 (`_ortPlaene`).
    const dpO = { seed: 7, nH: 18, epoche: "gruenderzeit" };
    const outO = await page.evaluate(
        async (urteilSrc, dp) => {
            const r = window.anazhRealm;
            const ortUrteil = new Function("return (" + urteilSrc + ")")();
            const res = {};
            try {
                const H = (x, z) => r._terrainMacroSurfaceY(x, z, true);
                const L = r._gelaende();
                const ort = globalThis.__gelaendeCore.hangOrt(L, (x, z) => r._landAt(x, z, 0.2));
                res.hang = ort;
                if (!ort) return res;
                const plan = await r._foundryRequestSettlement(dp);
                const vorher = r.state.architectures.length;
                const zellenVor = new Set(Object.keys((r.state.worldMeta && r.state.worldMeta.settlementCells) || {}));
                await r.spawnSettlement(
                    Object.assign({}, dp, { position: { x: ort.x, y: H(ort.x, ort.z), z: ort.z } })
                );
                const sc = (r.state.worldMeta && r.state.worldMeta.settlementCells) || {};
                const neuKey = Object.keys(sc).find((k) => !zellenVor.has(k));
                const anker = neuKey ? { x: sc[neuKey].x, z: sc[neuKey].z } : null;
                const v2 = r._ortPlaene ? [...r._ortPlaene.values()].pop() : null;
                const P = v2 || plan;
                res.anker = anker;
                res.planV2 = !!v2;
                const neu = r.state.architectures.slice(vorher);
                const haeuser = neu.filter((e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0);
                res.haeuser = haeuser.length;
                res.slots = P.slots.length;
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
                    });
                }
                const ortW = { ort: anker, slots, roads: P.roads || [], platz: P.platz || null };
                res.urteil = anker ? ortUrteil(ortW, (x, z) => r.getTerrainHeightAt(x, z)) : null;
                // die Kronen des Wald-Plans über den Grundrissen (Dach-Fläche + Krone T)
                const F = r.constructor.FOREST;
                const seedInt = r._forestSeedInt();
                let x0 = Infinity;
                let x1 = -Infinity;
                let z0 = Infinity;
                let z1 = -Infinity;
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
                // die Laternen der Welt um den Ort gegen die des Plans: je Laterne die Studio-Gestalt (fachwerk AUSSTATTUNG
                // laterne) als Eintrag, dessen Licht ihr Rezept trägt (`_lichtDatumDerGestalt`) — ein Licht ohne Leib zählt nicht
                let lw = 0;
                if (anker)
                    for (const e of r.state.architectures)
                        if (
                            r._lichtDatumDerGestalt(e) === globalThis.__fachwerkCore.PRESETS.laterne?.fx?.licht &&
                            Math.hypot(e.position.x - anker.x, e.position.z - anker.z) < 250
                        )
                            lw++;
                res.laternenWelt = lw;
                res.laternenPlan = Array.isArray(P.laternen) ? P.laternen.length : 0;
                // der Zwilling: ein Licht ohne Leib (der Laternen-Leser bis K10-2 und sein Zellen-Gedächtnis)
                res.laternenZwilling = ["_laternenLesen", "_laternen"].filter((k) => k in r);
                // die Altwelten: Bauten, die kein Ort trägt (kein Haus mit Grundriss, keine Ausstattung des Dorfs: brunnen_dorf,
                // marktstand_dorf), auf dem Erdbau eines Orts
                let fremd = 0;
                if (typeof r._ortFrei === "function")
                    for (const e of r.state.architectures)
                        if (!e.fundament && !/_dorf$/.test(e.type) && !r._ortFrei(e.position.x, e.position.z, 0.01)) {
                            fremd++;
                            (res.fremdArten || (res.fremdArten = {}))[e.type] = (res.fremdArten[e.type] || 0) + 1;
                        }
                res.fremdBauten = fremd;
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
                res.lage = {
                    seed: L.seed,
                    baseHeight: L.baseHeight,
                    waterLevel: L.waterLevel,
                    erbgut: L.erbgut,
                    regionSize: L.regionSize,
                };
            } catch (e) {
                res.err = (e && e.stack) || String(e);
            }
            return res;
        },
        ortUrteil.toString(),
        dpO
    );
    // DER GT AUF DEM DORFWEG des Orts, den die Welt trägt (Plan v2, sonst der Export)
    const gtO =
        outO.anker && (outO.v2Json || outO.planJson)
            ? await page.evaluate(gtDorfweg, JSON.parse(outO.v2Json || outO.planJson), outO.anker, 8)
            : { err: "kein Ort" };

    await browser.close();
    server.close();

    check("B: das LIVE-Buch ist warm (Voraussetzung)", out.bookReady === true);
    check(
        "B: _foundryRequestSettlement liefert den Export durch den EINEN Worker",
        out.planOk === true,
        `slots=${out.planSlots} name=${out.planName}`
    );
    check(
        "B: der Konsument platziert (placed > 0, Buchhaltung exakt)",
        out.placed1 > 0 && out.entriesMatch === true,
        `placed=${out.placed1} skipped=${out.skipped1}`
    );
    check("B: jeder Eintrag ist ein haus_<kultur>-Blueprint (Tabellen-Regel, kein Literal)", out.allHaus === true);
    check(
        "B: POSITIONS-DETERMINISTISCH (derselbe Anker zweimal — identische Offsets/Seeds/Rotationen)",
        out.offsetsDeterministic === true,
        `placed1=${out.placed1} placed2=${out.placed2}`
    );
    check(
        "B: der Slot-Anker sitzt EXAKT auf dem Plan v2 (entry == anker + slot.x/z, y == slot.y + 0,5, phi, seed)",
        out.planV2 === true && out.slotAnchorExact === true,
        `v2=${out.planV2}`
    );
    check("B: DORF-IN-TERRAIN — der Slot-Footprint reist als entry.fundament {ex,ez}", out.fundamentTravels === true);
    check(
        "B: DORF-IN-TERRAIN — das Podest ist gefallen (keine _archFundamentBox, kein Sockel-Pool)",
        out.podestAbsent === true
    );
    check(
        "B: HAUS-DOPPELBAU — der Slot-ov reist als studioOv an JEDEM Eintrag (rolle == Export)",
        out.ovTravels === true
    );
    check(
        "B: HAUS-DOPPELBAU — der Flatten-Chokepoint liest den Stempel (ov-Hash trennt Kirche von Wohnhaus)",
        out.ovKeysSplit === true
    );
    check("B: fail-closed — unbekannte Kultur faellt (0 platziert, 1 uebersprungen)", out.failClosed === true);
    check('B: der Chat-Konsument "dorf [seed] [häuser]" steht in der Befehls-Tabelle', out.chatDorf === true);
    check("B: Γ5 — der Siedlungs-Same zieht aus dem :stadt-Stream (kein Math.random)", out.gammaStream === true);
    check("B: Γ5 — „baue dorf hier“ zieht denselben Bau-Strom (_bauSame, kein Math.random)", out.gammaHier === true);
    check(
        "B: der DSL-Akt spawn_village trägt die Größe des Siedlungs-Gesetzes (nach der Buch-Ankunft, nie der Kern-Default)",
        Number.isFinite(out.villageNH) && out.villageNH === out.villageNHSoll,
        `nH ${out.villageNH} (Soll ${out.villageNHSoll})${out.villageNHErr ? " err=" + out.villageNHErr : ""}`
    );
    check(
        "B: die Wasser-Wand steht in der EINEN Slot-Quelle (_spawnSettlementSlot → _fundamentLand: _landAt je Punkt des Fundaments)",
        out.waterWall === true
    );
    check("B: der Anker misst den Plan (_siedlungsAnker, keine haus_basis-Schaetzung)", out.anchorChokepoint === true);
    console.log("\n=== TEIL O: DER ORT AUF DEM GELÄNDE (K10, Dorf 7/18 Gründerzeit am Hang) ===");
    if (outO.err) console.log("  Fehler im Akt: " + outO.err.split("\n").slice(0, 3).join(" | "));
    check(
        "O: ein Hang trägt den Akt (Gefälle 0,12–0,25 über 16 m, trocken)",
        !!outO.hang,
        outO.hang
            ? `${outO.hang.x.toFixed(1)}/${outO.hang.z.toFixed(1)} Gefälle ${outO.hang.g.toFixed(3)}`
            : "kein Hang"
    );
    const planHashGleich = outO.planHashGleich === true;
    const u = outO.urteil || {};
    const m = {
        sockelMedian: u.sockelMedian,
        sockelMax: u.sockelMax,
        tuerenOk: u.tuerenOk,
        tuerenN: u.tuerenN,
        kronen: outO.kronen,
        laternenWelt: outO.laternenWelt,
        laternenPlan: outO.laternenPlan,
        planHashGleich,
        fremdBauten: outO.fremdBauten,
        gtWeg: gtO.gtWeg,
        gtEnde: gtO.endeNachS,
    };
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
                    },
                    m
                )
            )
    );
    if (u.tuerenFehl && u.tuerenFehl.length) console.log("  Türen ohne Gang: " + JSON.stringify(u.tuerenFehl));
    const fehlO = ortVerdikt(m);
    check(
        "O: das Dorf trägt jedes Haus (alle Slots stehen)",
        outO.haeuser > 0 && outO.haeuser === outO.slots,
        `${outO.haeuser}/${outO.slots}`
    );
    check(
        "O: der Ort hält jede Zahl (Sockel 0, Türen, Kronen 0, Laternen, Plan-Hash, Altwelten 0, der GT ≥ 60 m in 8 s auf dem Dorfweg)",
        fehlO.length === 0,
        fehlO.join(" · ") || "gehalten"
    );
    check(
        "O: die Laterne hat EINE Quelle — ihre Studio-Gestalt trägt Leib und Licht, kein Licht ohne Leib (`_laternenLesen` gefallen)",
        Array.isArray(outO.laternenZwilling) && outO.laternenZwilling.length === 0,
        "lebt: " + (outO.laternenZwilling || ["?"]).join(", ")
    );
    console.log("\n=== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) ===");
    for (const [name, ok] of autoStaticLaws(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"))) check(name, ok);
    const c = out.c || {};
    check(
        "C1: die Zell-Wahrheit ist selten + deterministisch (2 Läufe byte-gleich, Γ5)",
        c.hashRare === true && c.deterministic === true,
        c.err || ""
    );
    check("C1b: die Spawn-Klar-Wand steht (der Welt-Ursprung ist nie Dorf-Site)", c.spawnClearWall === true);
    check("C1c: der Dispatch-Kanal lebt (mind. ein Rezept -> settlement, M8)", c.channelLive === true);
    check(
        "C2: HEADLESS-DEFAULT — Null-Renderer ohne Hook: der Auto-Zug ruht (kein Pending, keine Queue)",
        c.headlessQuiet === true
    );
    check(
        "C3: die erzwungene Dorf-Zelle materialisiert (Export -> Reservierung -> Häuser)",
        c.planOk === true && c.reserved === true && c.placed >= 1 && c.allHaus === true,
        `placed=${c.placed} ticks=${c.ticks}`
    );
    check(
        "C3b: Existenz vor Framerate — über dem Budget wächst die Siedlung gedrosselt (echter Job-Pfad scatterDeco: Slots in Frames, nie 0, je Deko-Lauf ≤ 1/drosselTakte)",
        c.budgetWall === true,
        `über dem Budget: ${c.ueberBudget} Slots in ${c.ueberBudgetFrames} Frames (${c.dekoLaeufe} Deko-Läufe; der Ring stand nach ${c.vorlaufFrames} Frames)`
    );
    check(
        "C6: der Wege-Schlüssel trägt den Ort — zwei Siedlungen mit demselben Samen bauen je ihre Wege",
        Array.isArray(c.wegeJeOrt) && c.wegeJeOrt.length === 2 && c.wegeJeOrt.every((n6) => n6 > 0),
        `Wege-Formen je Ort: ${(c.wegeJeOrt || []).join(" / ")}${c.wegeErr ? " err=" + c.wegeErr : ""}`
    );
    const bl = c.blick || {};
    const blZ = (q) =>
        q ? `${q.haeuser} Häuser, Gier ${q.gier} (gedreht ${q.gedreht}, neben dem Dorf ${q.nebenDorf})` : "–";
    check(
        "C7: ein Nexus-Dorf lässt den Blick des Spielers stehen (0710-7; 4B: −2,745 mitten im Lauf)",
        !!bl.nexus && bl.nexus.haeuser > 0 && bl.nexus.gedreht < 1e-6,
        `Nexus: ${blZ(bl.nexus)}${c.blickErr ? " err=" + c.blickErr : ""}`
    );
    check(
        "C7: ein Dorf, das der Spieler verlangt (Chat-Programm, Befehl „dorf“), richtet den Blick auf SEIN neues Dorf",
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
        "C7: ein Dorf aus einem Werkzeug des Spielers (Fähigkeit ability:, Wirken capability:, Verzehr consume:) schaut auf SEIN Dorf (0710-8)",
        werkzeug.every((k) => !!bl[k] && bl[k].haeuser > 0 && bl[k].nebenDorf < 0.05),
        werkzeug.map((k) => `${k}: ${blZ(bl[k])}`).join(" · ")
    );
    check(
        "C7: ein Dorf eines Mitspielers (remote-…) lässt den Blick stehen — er handelt für die Welt",
        !!bl.mitspieler && bl.mitspieler.haeuser > 0 && bl.mitspieler.gedreht < 1e-6,
        `Mitspieler: ${blZ(bl.mitspieler)}`
    );
    const ring = c.ring || {};
    check(
        "C5: DER GENESIS-PORTAL-RING hebt am Ursprung (alle builtIn-Welt-Portale, Stempel gesetzt)",
        ring.stempel === true && ring.arten >= 1 && ring.gebaut >= 1,
        `arten=${ring.arten} gebaut=${ring.gebaut}${ring.err ? " err=" + ring.err : ""}`
    );
    check(
        "C5: Ring-Radius ~11 m + doppelt idempotent (Stempel traegt, 0 Doppel)",
        ring.radiusOk === true && ring.idempotent === true,
        `radiusOk=${ring.radiusOk} idem=${ring.idempotent}`
    );
    check(
        "C3c: BUDGETIERT über Ticks (je Tick <= perTick Slots, mehrere Ticks — das BOOT_PHASE3-Muster)",
        c.budgeted === true,
        `ticks=${c.ticks}`
    );
    check(
        "C4: IDEMPOTENT — dieselbe Zelle nochmal: 0 neue Häuser (worldMeta.settlementCells trägt über den Reload)",
        c.idempotent === true
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER SETTLEMENT-KANAL N5.7 STEHT: exportSettlement ist deterministisch + eingefroren (Kern), der Export reist durch den EINEN Worker (Brücke generisch, M8), der Host hebt die Slots positions-deterministisch, wasser-bewacht und fail-closed in die Welt (deliberater Akt) — UND der Worldgen-Konsument lebt (Auto-Dörfer: Γ5-Zellen, Site-Wände, budgetierte Materialisierung durch die EINE Slot-Quelle, Reload-idempotent, headless-ruhig)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Settlement-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
