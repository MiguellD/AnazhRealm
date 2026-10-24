// diag-gegenstand-stoff.cjs — DIE STOFF-LINSE DER GEGENSTÄNDE (W5): was ein Fahrzeug und eine Klinge der WELT
// an Albedo liefern, je Stoff gegen das Band der Natur geurteilt (das FARB-GESETZ: ein Paletten-Hex ist eine sRGB-
// Absicht, die Albedo sein linearer Wert — Kreatur-Bäcker, Vegetation und Gegenstände lesen dieselbe Kurve).
//
// Node-DIREKT (r128-UMD + require, wie gate:vehicle-contract): je Fahrzeug-Rezept × Lack-Gestalt (Same 1..8) und je
// Schmiede-Rezept baut das Gesetzbuch seine Welt-Gestalt (`buildInstance`); je Mesh liest die Linse, was in die Welt
// reist — die Material-Farbe (ein Stoff ohne Vertex-Farben) bzw. das Mittel der Vertex-Farben je Vertex (der
// Wirt liest NUR das color-Attribut: eine Material-Tönung dazu zeigt das Labor, die Welt nie — Lab ≠ Welt).
// Benannte Täter (je einer eine Probe):
//   ohne-stoff   ein Material ohne userData.__stoff (das Gesetzbuch sagt nicht, was es ist)
//   labor-stoff  Ton (Clay) oder eine Lehre-Überlage in der Welt-Gestalt (der Wagen fuhr als Ton-Modell)
//   band         Albedo (bzw. F0 der Metalle) außerhalb des Bands ihres Stoffs (der Reifen lag roh bei 0,08)
//   klarlack     ein Lack ohne Lackschicht (in der Welt wurde er ein Metall: Tiefschwarz spiegelte nichts)
//   lack-art     ein Uni-Lack als Metall (der gefärbte Spiegel, metalness 0,85) oder ein Metallic-Lack ohne Flocken
//   durchsicht   eine Scheibe ohne Durchsicht
//   toenung      Vertex-Farben UND eine nicht-weiße Material-Farbe (das Labor tönt, die Welt nicht)
//   lack-gestalt die Gestalten tragen nicht die acht Lacke des LACK_GESETZ (linear)
//   transport    das Gesetz der Regler (phyto-core) macht aus Klarlack/Durchsicht nicht die Zahlen des Wirts
//   node scripts/diag-gegenstand-stoff.cjs [--selftest]
//
// DIE TAFEL-PROBE (stoffe.K1, `--tafel`, Port GEGENSTAND_STOFF_PORT): die EINE Stoff-Tafel in SI (`state.materials`) und je
// Stoff (holz, stein, eisen, gras, erde, laub, wasser) EINE Mutation je Wirkung mit beobachtbarer Folge in der echten Welt
// (Null-Renderer, am Ufer des Sees der Welt: Wasser, Eis, Wiese und Bauplatz an einem Ort):
//   rho      ρ × ½: die Masse eines Quaders aus dem Stoff (`_teilMasse`) halbiert, seine Eintauchtiefe im See folgt (am Grund,
//            wer dichter bleibt als Wasser); beim Wasser liegt ein Holz-Quader tiefer
//   mu       μ × ½: der Bremsweg eines mit 3 m/s gestoßenen Wolfs (`_kreaturStossSchritt`) auf einer Platte aus dem Stoff (das
//            Gras: die Wiese am Ufer) verdoppelt sich
//   albedo   OFFEN: die Luma braucht das Ausgabe-Bild der echten GPU, headless zählt sie nie
//   klang    die Frequenz der Klang-Spalte × 2: der Spektral-Schwerpunkt des Schritts (die Stimme des Wirts im
//            OfflineAudioContext) auf dem Stoff steigt (das Wasser: watend am Ufer)
//   tZuend   T_zünd − 100 K: der Stoff im Brennpunkt einer Linse (`_tickFocusingAffordances`) fängt früher Feuer
//   tSchmelz T_schmelz − 100 K: der See gefriert im Winter nicht (`_eisAt`)
//   c        c × ½: der Stoff im Brennpunkt ist nach 2 s wärmer (das Wasser: sein Tagesgang, `_wasserTemperaturAt`, wächst)
// DIE SABOTAGE (Selbsttest im selben Lauf): der EINE Leser der Tafel (`_stoff`) liefert die Zeilen von vor der Mutation — ein
// Leser, der ruft und verwirft —, und jede Wirkung jedes Stoffs ist ROT; eine, die grün bleibt, liest an der Tafel vorbei.
// Staffel 1 = je Stoff ≥ 3 von 7 Wirkungen, Staffel 2 = 7/7; die Zeile `TAFEL {…}` trägt die Messung.
"use strict";
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "vehicle-core.js"));
require(path.join(root, "schmiede-core.js"));
require(path.join(root, "phyto-core.js"));
const PC = globalThis.__phytoCore;
const VC = globalThis.__vehicleCore;
const SC = globalThis.__schmiedeCore;

// DAS BAND DER NATUR je Stoff (lineare Albedo-Luminanz; bei Metallen F0) — die AAA-Referenz (PBR-Tafeln: Ruß/Gummi
// 0,02–0,04 · schwarzer Kunststoff 0,02–0,05 · Leder 0,03–0,2 · Holz 0,05–0,45 · Eisen F0 0,56 · Aluminium 0,91 · Messing
// F0 ~0,8; beschichtete/geschwärzte Metalle tiefer). Darunter liegt nur noch Ruß; ein Stoff dort ist ein Palettenfehler.
const BAND = {
    gummi: [0.015, 0.05],
    kunststoff: [0.015, 0.08],
    polster: [0.02, 0.35],
    lack: [0.0123, 0.9], // Dielektrikum ab sRGB 30 (Frostbite 2014)
    blank: [0.3, 0.95], // blankes Metall: Felge, Klinge, Roh-Stahl
    buntmetall: [0.25, 0.95], // Messing, Bronze
    metall: [0.1, 0.95], // beschichtet, geschwärzt, geschmiedet
    glas: [0, 0.06],
    leder: [0.02, 0.2],
    holz: [0.05, 0.45],
    schnur: [0.02, 0.4],
};
const LABOR = new Set(["ton", "lehre"]);
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linHex = (h) => [lin(((h >> 16) & 255) / 255), lin(((h >> 8) & 255) / 255), lin((h & 255) / 255)];

// Was ein Mesh der Welt an Albedo liefert: Vertex-Farben (Mittel) oder die Material-Farbe.
function weltAlbedo(o) {
    const ca = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
    if (ca && o.material.vertexColors) {
        const s = [0, 0, 0];
        for (let i = 0; i < ca.count; i++) {
            s[0] += ca.getX(i);
            s[1] += ca.getY(i);
            s[2] += ca.getZ(i);
        }
        return { c: s.map((v) => v / Math.max(1, ca.count)), vc: true };
    }
    return { c: [o.material.color.r, o.material.color.g, o.material.color.b], vc: false };
}

// Das Urteil über EINE Welt-Gestalt: Liste der Täter (je Stoff höchstens einer je Art).
function urteil(name, group) {
    const out = [];
    const gesehen = new Set();
    group.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const m = o.material;
        const st = m.userData && m.userData.__stoff;
        const w = weltAlbedo(o);
        const key = (st || "?") + "|" + m.uuid;
        if (gesehen.has(key)) return;
        gesehen.add(key);
        if (!st) return out.push(`${name}: ohne-stoff (${m.type} ${m.color ? m.color.getHexString() : ""})`);
        if (LABOR.has(st)) return out.push(`${name}: labor-stoff ${st} in der Welt-Gestalt`);
        if (st === "licht") {
            const em = m.emissive ? [m.emissive.r, m.emissive.g, m.emissive.b] : [0, 0, 0];
            if (!(lum(em) * (m.emissiveIntensity || 0) >= 0.05)) out.push(`${name}: band licht glüht nicht`);
            return;
        }
        const b = BAND[st];
        if (!b) return out.push(`${name}: ohne-stoff (unbekannter Stoff ${st})`);
        const L = lum(w.c);
        if (!(L >= b[0] && L <= b[1]))
            out.push(`${name}: band ${st} ${L.toFixed(4)} ∉ [${b[0]}, ${b[1]}]${w.vc ? " (Vertex-Farben)" : ""}`);
        if (st === "lack" && m.userData.__lack && !(m.clearcoat > 0)) out.push(`${name}: klarlack fehlt`);
        // Die Lack-Art: ein Uni-Lack ist pigmentiert (Dielektrikum), ein Metallic-Lack spiegelt seine Farbe über Flocken.
        if (st === "lack" && m.userData.__lack) {
            const z = VC.LACK_GESETZ.find((r) => r[0] === m.userData.__lack);
            const metal = z && z[3] === "metallic";
            if (!z || (metal ? !(m.metalness >= 0.5) : !(m.metalness <= 0.05)))
                out.push(`${name}: lack-art ${m.userData.__lack} metalness ${m.metalness} (${z ? z[3] : "ohne Zeile"})`);
        }
        if (st === "glas" && !(m.transparent && m.opacity < 1)) out.push(`${name}: durchsicht fehlt`);
        if (w.vc && (m.color.r < 0.999 || m.color.g < 0.999 || m.color.b < 0.999))
            out.push(`${name}: toenung ${st} (Material-Farbe ${m.color.getHexString()} auf Vertex-Farben)`);
    });
    return out;
}

// Der Lack der Gestalten: Same 1..8 trägt die acht Lacke des Gesetzes (linear), der Körper (größte Lack-Fläche) zählt.
function lackGestalten() {
    const out = [];
    const soll = VC.LACK_GESETZ.slice(1).map((z) => linHex(z[1]));
    const ist = [];
    for (let s = 1; s <= soll.length; s++) {
        const g = VC.buildInstance("gt", s, 0);
        let best = null;
        let n = 0;
        g.traverse((o) => {
            // der Karosserie-Lack (lackStoff stempelt __lack; der Bremssattel ist Lack, aber nicht die Karosserie)
            if (!o.isMesh || !o.material || !o.material.userData || !o.material.userData.__lack) return;
            const c = [o.material.color.r, o.material.color.g, o.material.color.b];
            const k = c.join(",");
            n++;
            if (!best) best = { k, c };
        });
        ist.push(best ? best.c : null);
        if (!n) out.push(`lack-gestalt: Same ${s} trägt keinen Karosserie-Lack`);
    }
    const treffer = soll.filter((c) => ist.some((x) => x && x.every((v, i) => Math.abs(v - c[i]) < 1e-6))).length;
    if (treffer !== soll.length) out.push(`lack-gestalt: ${treffer}/${soll.length} Lacke des LACK_GESETZ in den Gestalten`);
    return out;
}


// Der Transport am Gesetz der Regler: Klarlack und Durchsicht eines
// Stoffs werden die Material-Zahlen, aus denen der Wirt baut (phyto-core `budgetRegler`)
const LACK_GLAS = { clearcoat: 1, clearcoatRoughness: 0.1, opacity: 0.4 };
function transport(R) {
    if (R && R.cc === 1 && R.ccr === 0.1 && R.op === 0.4) return [];
    return [`transport: budgetRegler liest Klarlack/Durchsicht nicht (cc ${R && R.cc} · op ${R && R.op})`];
}

function alles() {
    const out = [];
    for (const id of Object.keys(VC.PRESETS))
        for (let s = 1; s <= 8; s++) out.push(...urteil(`fahrzeug ${id} Same ${s}`, VC.buildInstance(id, s, 0)));
    for (const id of Object.keys(SC.PRESETS)) out.push(...urteil(`klinge ${id}`, SC.buildInstance(id, 1, 0)));
    out.push(...lackGestalten());
    out.push(...transport(PC.budgetRegler("unknown", LACK_GLAS)));
    return [...new Set(out)];
}

function selbstTest() {
    const fehl = [];
    const mk = (st, hex, extra) => {
        const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex }, extra || {}));
        m.userData.__stoff = st;
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m));
        return g;
    };
    const roh = (h) => {
        const g = mk("gummi", h);
        g.children[0].material.color.setRGB(...linHex(h));
        return g;
    };
    if (urteil("t", roh(0x2a2c2f)).length !== 0) fehl.push("gesunder Reifen meldet");
    // der Reifen roh (r128 las 0x131519 als 0,08 linear)
    if (!urteil("t", mk("gummi", 0x131519)).some((s) => s.includes("band gummi")))
        fehl.push("roher Reifen bleibt still");
    if (!urteil("t", mk("ton", 0x8d9499)).some((s) => s.includes("labor-stoff"))) fehl.push("Ton-Karosserie bleibt still");
    const lack = (name, metalness, cc) => {
        const g = mk("lack", 0x111319, { metalness });
        g.children[0].material.userData.__lack = name;
        g.children[0].material.clearcoat = cc;
        return g;
    };
    if (!urteil("t", lack("Tiefschwarz", 0, 0)).some((s) => s.includes("klarlack")))
        fehl.push("Lack ohne Klarlack bleibt still");
    // der Uni-Lack als gefärbter Spiegel (bis W5: jeder Lack metalness 0,85)
    if (!urteil("t", lack("Signalrot", 0.85, 1)).some((s) => s.includes("lack-art")))
        fehl.push("Uni-Lack als Metall bleibt still");
    if (!urteil("t", mk("glas", 0x0a0f18)).some((s) => s.includes("durchsicht"))) fehl.push("blinde Scheibe bleibt still");
    const vc = mk("holz", 0x6b4a2a, { vertexColors: true });
    const geo = vc.children[0].geometry;
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(0.2), 3));
    if (!urteil("t", vc).some((s) => s.includes("toenung"))) fehl.push("getönte Vertex-Farben bleiben still");
    if (!urteil("t", (() => { const g = mk("gummi", 0x2a2c2f); delete g.children[0].material.userData.__stoff; return g; })()).some((s) => s.includes("ohne-stoff")))
        fehl.push("Stoff ohne Namen bleibt still");
    if (!transport(PC.budgetRegler("unknown", {})).length) fehl.push("Transport ohne Klarlack bleibt still");
    return fehl;
}

const STOFFE = ["holz", "stein", "eisen", "gras", "erde", "laub", "wasser"];
const WIRKUNGEN = ["rho", "mu", "albedo", "klang", "tZuend", "tSchmelz", "c"];
async function tafelProbe(STOFFE, sabotage) {
    const r = window.anazhRealm;
    const [st, A] = [r.state, r.constructor];
    const [M, pm, FUSS] = [st.materials, st.playerMesh, A.PLAYER_FOOT_OFFSET];
    const see = (await window.__wasserOrte({})).see;
    const [[UX, UZ], [SX, SZ]] = [see.ufer, see.mitte];
    const hh = (x, z) => r._voxelSurfaceY(x, z);
    const setz = (x, z, y) => {
        pm.position.set(x, (y === undefined ? hh(x, z) : y) + FUSS, z);
        st.playerVel.setValue(0, 0, 0);
        [st._fixedSimPos, st.isInAir] = [null, false];
    };
    await window.__weltStehtNach(() => (setz(UX, UZ), r._gameLoopTick(performance.now())));
    window.__buehne();
    const box = (m, sx, sy, sz, x, y) => ({ shape: "box", material: m, size: { x: sx, y: sy, z: sz }, position: { x, y, z: 0 } });
    const werk = (n, parts, x, z, y) => {
        st.blueprints[n] = { parts };
        return r.spawnArchitecture(n, { x, y: y === undefined ? hh(x, z) : y, z }, { silent: true, precise: true });
    };
    const weg = (e) => {
        if (st.architectures.includes(e)) r.removeArchitecture(e);
        delete st.blueprints[e.type];
    };
    const spiegel = r._koerperWasser(SX, SZ, hh(SX, SZ));
    const grund = spiegel - hh(SX, SZ);
    let watX = UX; // das Ufer, an dem der Spieler watet (0,15–0,45 m Wasser)
    while (watX > UX - 30 && !(r._koerperWasser(watX, UZ, hh(watX, UZ)) - hh(watX, UZ) > 0.15)) watX -= 0.25;
    const [PX, PZ] = [UX + 14, UZ]; // die Platte (16 × 1,2 × 4 m) und die Linse daneben
    const linse = werk("_tafel_linse", [box("eisen", 0.2, 2.2, 0.2, 0.7, 1.1), box("quarz", 0.8, 0.8, 0.8, 0, 2.6)], UX + 30, UZ);
    // der Boden der Natur: 4 m Wiese (Gras der Boden-Karte, offen) und 4 m Waldboden (das Kronendach) längs −z, die nächsten
    // um das Ufer
    const gruen = (x, z, g = {}) => (r._bodenSichtAt(x, z, g) !== null ? g.gruen : 0);
    const natur = { gras: (x, z) => gruen(x, z) > 0.9 && r._kronenStreuAt(x, z) < 0.3, laub: (x, z) => r._kronenStreuAt(x, z) > 0.6 };
    for (const n of Object.keys(natur)) {
        const f = natur[n];
        natur[n] = null;
        for (let d = 0; d <= 120 && !natur[n]; d += 3)
            for (let k = 0; k < Math.max(1, d) && !natur[n]; k++) {
                const [x, z] = [UX + d * Math.cos((2 * Math.PI * k) / Math.max(1, d)), UZ + d * Math.sin((2 * Math.PI * k) / Math.max(1, d))];
                if ([0, 1, 2, 3, 4].every((q) => f(x, z - q) && !r._nassAt(x, z - q, 0.1, hh(x, z - q)))) natur[n] = [x, z];
            }
    }
    const platte = (X, fn) => {
        const e = natur[X] !== undefined ? null : werk("_tafel_platte", [box(X, 8, 0.4, 3, 0, 0.2)], PX, PZ, hh(PX, PZ) + 0.5);
        if (!e && !natur[X]) throw new Error("kein Boden aus " + X + " um das Ufer");
        try {
            return e ? fn(PX - 3, PZ, e.blockerAABBs[0].topY, 1) : fn(natur[X][0], natur[X][1], hh(natur[X][0], natur[X][1]), 0);
        } finally {
            if (e) weg(e);
        }
    };
    const zentroid = (d) => {
        const N = 1 << Math.floor(Math.log2(d.length));
        const [re, im] = [Float64Array.from(d.subarray(0, N)), new Float64Array(N)];
        for (let i = 1, j = 0; i < N; i++) {
            let b = N >> 1;
            for (; j & b; b >>= 1) j ^= b;
            j ^= b;
            if (i < j) [re[i], re[j]] = [re[j], re[i]];
        }
        for (let len = 2; len <= N; len <<= 1)
            for (let i = 0; i < N; i += len)
                for (let k = 0; k < len / 2; k++) {
                    const [c, s, a, b] = [Math.cos((-2 * Math.PI * k) / len), Math.sin((-2 * Math.PI * k) / len), i + k, i + k + len / 2];
                    const [tr, ti] = [re[b] * c - im[b] * s, re[b] * s + im[b] * c];
                    [re[b], im[b], re[a], im[a]] = [re[a] - tr, im[a] - ti, re[a] + tr, im[a] + ti];
                }
        let [sf, s] = [0, 0];
        for (let k = 1; k < N / 2; k++) [sf, s] = [sf + (re[k] ** 2 + im[k] ** 2) * k, s + re[k] ** 2 + im[k] ** 2];
        return (sf / s) * (48000 / N);
    };
    const brenn = (X, dauer) => {
        const p = r._brennpunkte(linse, r._sonnenRichtung())[0];
        const e = werk("_tafel_ziel", [box(X, 0.6, 0.6, 0.6, 0, 0)], p.x, p.z, p.y);
        let t = 0;
        try {
            for (; t < dauer && st.architectures.includes(e); t += 0.25) r._tickFocusingAffordances(0.25);
            return { warm: e.heatBuildup || 0, zuend: st.architectures.includes(e) ? null : t };
        } finally {
            weg(e);
            if (st.brandFeld) st.brandFeld.clear();
        }
    };
    const halte = (felder, fn) => {
        const alt = Object.keys(felder).map((k) => [k, st[k]]);
        Object.assign(st, felder);
        try {
            return fn();
        } finally {
            for (const [k, v] of alt) st[k] = v;
        }
    };
    const W = {
        rho: [
            (z) => (z.rho *= 0.5),
            (X) => {
                const e = werk("_tafel", [box(X === "wasser" ? "holz" : X, 3, 0.6, 1.4, 0, 0.3)], SX, SZ);
                try {
                    return [st.blueprints._tafel.parts.reduce((m, p) => m + r._teilMasse(p), 0), spiegel - r._fahrBoden(e)(SX, SZ)];
                } finally {
                    weg(e);
                }
            },
            (X, v, n) =>
                X === "wasser"
                    ? Math.abs(n[1] - v[1]) > 0.05
                    : Math.abs(n[0] / v[0] - 0.5) < 0.005 && (Math.abs(n[1] - v[1]) > 0.02 || Math.min(v[1], n[1]) > grund - 0.05),
        ],
        mu: [
            (z) => (z.mu *= 0.5),
            (X) =>
                platte(X, (x, z, y, ux) => {
                    st.maxCreatures = st.creatures.length + 1;
                    const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
                    w.position.y = y;
                    w.userData._stossV = { x: 3 * ux, z: 3 * (ux - 1) };
                    const [x0, z0] = [w.position.x, w.position.z];
                    for (let i = 0; i < 3000 && w.userData._stossV; i++) r._kreaturStossSchritt(A.FIXED_DT);
                    r.removeCreature(w);
                    return Math.hypot(w.position.x - x0, w.position.z - z0);
                }),
            (X, v, n) => v > 0.1 && n / v > 1.7 && n / v < 2.3,
        ],
        albedo: null,
        klang: [
            (z) => (z.klang = Object.assign({}, z.klang, { freq: z.klang.freq * 2 })),
            async (X) => {
                const sym = st.symphony;
                const alt = [sym.enabled, sym.ctx, sym.masterGain];
                const ctx = new OfflineAudioContext(1, 24000, 48000);
                [sym.enabled, sym.ctx, sym.masterGain] = [true, ctx, ctx.destination];
                try {
                    const tritt = (x, z, y) => (setz(x, z, y), r._schrittKlangTick({ walkPhase: 0 }, 0, false, pm), r._schrittKlangEreignis(pm, false, 0));
                    if (X === "wasser") tritt(watX, UZ);
                    else platte(X, tritt);
                    return zentroid((await ctx.startRendering()).getChannelData(0));
                } finally {
                    [sym.enabled, sym.ctx, sym.masterGain] = alt;
                    setz(UX, UZ);
                }
            },
            (X, v, n) => n / v > 1.4,
        ],
        tZuend: [(z) => (z.tZuend -= 100), (X) => brenn(X, 120).zuend, (X, v, n) => v > 0 && n > 0 && n < 0.85 * v],
        tSchmelz: [
            (z) => (z.tSchmelz -= 100),
            (X) => {
                if (X !== "wasser") throw new Error("offen: kein Leser der Phase von " + X);
                return halte({ seasonPhase: 0.875, autoSeason: false, timeOfDay: 0.5 }, () => +(r._eisAt(SX, SZ, NaN) !== null));
            },
            (X, v, n) => v === 1 && n === 0,
        ],
        c: [
            (z) => (z.c *= 0.5),
            (X) =>
                X === "wasser"
                    ? halte({ timeOfDay: 0.625 }, () => r._wasserTemperaturAt(spiegel)) - halte({ timeOfDay: 0.125 }, () => r._wasserTemperaturAt(spiegel))
                    : brenn(X, 2).warm,
            (X, v, n) => v > 0 && n / v > 1.5,
        ],
    };
    const aus = {};
    const tafelLeser = r._stoff;
    for (const X of STOFFE) {
        aus[X] = {};
        for (const w of Object.keys(W)) {
            const z = M[X];
            const alt = z && z[w];
            if (!W[w]) {
                aus[X][w] = { ok: false, fehler: "offen: die Luma braucht das Ausgabe-Bild (echte GPU)" };
                continue;
            }
            try {
                const vor = await W[w][1](X);
                if (!z) throw new Error("keine Zeile " + X);
                if (sabotage) {
                    const snap = Object.fromEntries(Object.keys(M).map((n) => [n, Object.assign({}, M[n])]));
                    r._stoff = (n) => snap[n];
                }
                W[w][0](z);
                const nach = await W[w][1](X);
                aus[X][w] = { vor, nach, ok: !!W[w][2](X, vor, nach) };
            } catch (e) {
                aus[X][w] = { ok: false, fehler: String((e && e.message) || e).slice(0, 140) };
            } finally {
                if (z) z[w] = alt;
                if (tafelLeser) r._stoff = tafelLeser;
                else delete r._stoff;
            }
        }
    }
    weg(linse);
    return aus;
}
async function tafel() {
    const { statikServer, starteBrowser, nullRenderer, warteAufWelt, buehne } = require("./lib/welt-boot.cjs");
    const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");
    const PORT = Number(process.env.GEGENSTAND_STOFF_PORT || 4677);
    const server = statikServer();
    await new Promise((ok) => server.listen(PORT, "127.0.0.1", ok));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    try {
        const page = await browser.newPage();
        await nullRenderer(page);
        await page.evaluateOnNewDocument(WASSER_INSTALL);
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 180000 });
        await warteAufWelt(page, 180000);
        await buehne(page);
        const echt = await page.evaluate(tafelProbe, STOFFE, false);
        const sabotage = await page.evaluate(tafelProbe, STOFFE, true);
        const je = Object.fromEntries(STOFFE.map((X) => [X, WIRKUNGEN.filter((w) => echt[X][w].ok)]));
        const vorbei = STOFFE.flatMap((X) => WIRKUNGEN.filter((w) => sabotage[X][w].ok).map((w) => X + "." + w));
        console.log("=== DIE STOFF-TAFEL (stoffe.K1): je Stoff EINE Mutation je Wirkung, beobachtet in der Welt ===");
        const f = (v) => (Array.isArray(v) ? v.map(f).join("/") : typeof v === "number" ? +v.toFixed(3) : v);
        for (const X of STOFFE) {
            console.log(`  ${X.padEnd(7)} ${je[X].length}/7 — ` + WIRKUNGEN.map((w) => `${echt[X][w].ok ? "✅" : "❌"} ${w} ${echt[X][w].fehler || f(echt[X][w].vor) + " → " + f(echt[X][w].nach)}`).join(" · "));
        }
        console.log("TAFEL " + JSON.stringify({ je: Object.fromEntries(STOFFE.map((X) => [X, je[X].length])), wirkungen: je, vorbei, echt }));
        const s1 = STOFFE.every((X) => je[X].length >= 3);
        if (vorbei.length) console.error(`❌ SABOTAGE: ${vorbei.join(", ")} bleibt grün, während die Tafel ihre alte Zeile liefert — der Leser liest an ihr vorbei`);
        console.log(s1 && !vorbei.length ? `✅ TAFEL GRÜN — Staffel ${STOFFE.every((X) => je[X].length === 7) ? 2 : 1}` : "❌ TAFEL ROT — " + (s1 ? "die Sabotage" : "ein Stoff unter 3 von 7"));
        return s1 && !vorbei.length ? 0 : 1;
    } finally {
        await browser.close();
        server.close();
    }
}
if (process.argv.includes("--tafel")) {
    tafel().then(
        (c) => process.exit(c),
        (e) => {
            console.error(e);
            process.exit(2);
        }
    );
    return;
}

const fehlSelbst = selbstTest();
if (process.argv.includes("--selftest")) {
    if (fehlSelbst.length) {
        console.error("❌ SELBST-TEST ROT — " + fehlSelbst.join(" · "));
        process.exit(1);
    }
    console.log("✅ SELBST-TEST GRÜN — die Stoff-Linse feuert auf Ton, rohen Reifen, Lack ohne Lackschicht, blinde Scheibe, Tönung, Namenlose und fehlenden Transport.");
    process.exit(0);
}
const befunde = alles();
console.log("=== DIE STOFF-LINSE DER GEGENSTÄNDE (Fahrzeuge × 8 Lacke · Klingen/Werkzeuge) ===");
const klassen = {};
for (const b of befunde) {
    const k = (b.split(": ")[1] || b).split(" ")[0];
    klassen[k] = (klassen[k] || 0) + 1;
}
for (const b of befunde.slice(0, 40)) console.log("  ❌ " + b);
if (befunde.length > 40) console.log(`  … ${befunde.length - 40} weitere`);
if (fehlSelbst.length) console.log("  ❌ Selbst-Test: " + fehlSelbst.join(" · "));
if (befunde.length || fehlSelbst.length) {
    console.error(`\n❌ ROT — ${befunde.length} Befund(e): ${JSON.stringify(klassen)}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — jeder Stoff der Fahrzeuge und Klingen liegt im Band seiner Natur, der Lack trägt seine Lackschicht und die acht Lacke, jede Scheibe ihre Durchsicht, das Labor tönt nichts, was die Welt nicht sieht.");
process.exit(0);
