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
//            OfflineAudioContext, das Mittel aus 8 Tritten) auf dem Stoff steigt (das Wasser: watend am Ufer)
//   tZuend   T_zünd − 100 K: der Stoff im Brennpunkt einer Linse (`_tickFocusingAffordances`) fängt früher Feuer
//   tSchmelz T_schmelz − 100 K: der See gefriert im Winter nicht (`_eisAt`)
//   c        c × ½: der Stoff im Brennpunkt ist nach 2 s wärmer; das Wasser folgt der Luft schneller, der See trägt im Herbst
//            über einen Tag früher (der Tag, ab dem `_eisAt` über den Linien `_eisLinien` trägt, auf die Stunde)
// DIE SABOTAGE (Selbsttest im selben Lauf): der EINE Leser der Tafel (`_stoff`) liefert die Zeilen von vor der Mutation — ein
// Leser, der ruft und verwirft —, und jede Wirkung jedes Stoffs ist ROT; eine, die grün bleibt, liest an der Tafel vorbei.
// Staffel 1 = je Stoff ≥ 3 von 7 Wirkungen, Staffel 2 = 7/7; die Zeile `TAFEL {…}` trägt die Messung.
"use strict";
const { urteilEnde, studioKern } = require("./lib/welt-boot.cjs");

const VC = studioKern("vehicle-core.js", "__vehicleCore");
const SC = studioKern("schmiede-core.js", "__schmiedeCore");
const PC = studioKern("phyto-core.js", "__phytoCore");

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
    return { c: o.material.color.toArray(), vc: false };
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
            const em = m.emissive ? m.emissive.toArray() : [0, 0, 0];
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
        g.traverse((o) => {
            // der Karosserie-Lack (lackStoff stempelt __lack; der Bremssattel ist Lack, aber nicht die Karosserie)
            if (!best && o.isMesh && o.material && o.material.userData && o.material.userData.__lack)
                best = o.material.color.toArray();
        });
        ist.push(best);
        if (!best) out.push(`lack-gestalt: Same ${s} trägt keinen Karosserie-Lack`);
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
    // je Täter-Gestalt: das Urteil nennt seinen Täter, sonst bleibt er still
    const still = (g, taeter, name) => urteil("t", g).some((s) => s.includes(taeter)) || fehl.push(name + " still");
    // der Reifen roh (r128 las 0x131519 als 0,08 linear)
    still(mk("gummi", 0x131519), "band gummi", "roher Reifen bleibt");
    still(mk("ton", 0x8d9499), "labor-stoff", "Ton-Karosserie bleibt");
    const lack = (name, metalness, cc) => {
        const g = mk("lack", 0x111319, { metalness });
        g.children[0].material.userData.__lack = name;
        g.children[0].material.clearcoat = cc;
        return g;
    };
    still(lack("Tiefschwarz", 0, 0), "klarlack", "Lack ohne Klarlack bleibt");
    // der Uni-Lack als gefärbter Spiegel (bis W5: jeder Lack metalness 0,85)
    still(lack("Signalrot", 0.85, 1), "lack-art", "Uni-Lack als Metall bleibt");
    still(mk("glas", 0x0a0f18), "durchsicht", "blinde Scheibe bleibt");
    const vc = mk("holz", 0x6b4a2a, { vertexColors: true });
    const geo = vc.children[0].geometry;
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(0.2), 3));
    still(vc, "toenung", "getönte Vertex-Farben bleiben");
    const namenlos = mk("gummi", 0x2a2c2f);
    delete namenlos.children[0].material.userData.__stoff;
    still(namenlos, "ohne-stoff", "Stoff ohne Namen bleibt");
    if (!transport(PC.budgetRegler("unknown", {})).length) fehl.push("Transport ohne Klarlack bleibt still");
    return fehl;
}

const STOFFE = ["holz", "stein", "eisen", "gras", "erde", "laub", "wasser"];
const WIRKUNGEN = ["rho", "mu", "albedo", "klang", "tZuend", "tSchmelz", "c"];
async function tafelProbe(STOFFE, WIRKUNGEN, sabotage) {
    const M = st.materials;
    const pm = st.playerMesh;
    const { see } = await window.__wasserOrte({});
    const [UX, UZ] = see.ufer;
    const [SX, SZ] = see.mitte;
    const hh = (x, z) => r._voxelSurfaceY(x, z);
    const setz = (x, z, y = hh(x, z)) => pm.position.set(x, y + r.constructor.PLAYER_FOOT_OFFSET, z);
    await window.__weltStehtNach(() => (setz(UX, UZ), (st._fixedSimPos = null), r._gameLoopTick(performance.now())));
    window.__buehne();
    st.autoSeason = false;
    // ein Werk `n` aus Quadern [Stoff, Breite, Höhe, Tiefe, Versatz x, Mitte y] bei (x, z, y); mit `fn` gemessen, dann abgerissen
    const werk = async (n, teile, x, z, y, fn) => {
        st.blueprints[n] = { parts: teile.map(([m, sx, sy, sz, px, py]) => ({ shape: "box", material: m, size: { x: sx, y: sy, z: sz }, position: { x: px, y: py, z: 0 } })) };
        const e = r.spawnArchitecture(n, { x, y, z }, { silent: true, precise: true });
        if (!fn) return e;
        try {
            return await fn(e);
        } finally {
            if (st.architectures.includes(e)) r.removeArchitecture(e);
        }
    };
    const linse = await werk("_linse", [["eisen", 0.2, 2.2, 0.2, 0.7, 1.1], ["quarz", 0.8, 0.8, 0.8, 0, 2.6]], UX + 30, UZ, hh(UX + 30, UZ));
    const grund = hh(SX, SZ);
    const spiegel = r._koerperWasser(SX, SZ, grund);
    const tiefe = spiegel - grund; // die Säule des Sees: der Körper, dessen Trägheit c trägt
    let watX = UX; // das Ufer, an dem der Spieler watet
    while (watX > UX - 30 && !(r._koerperWasser(watX, UZ, hh(watX, UZ)) > hh(watX, UZ) + 0.15)) watX -= 0.25;
    // der Boden aus X: Gras und Laub der Natur (4 m trocken längs −z, die EINE Orts-Suche nach dem Stoff unter dem Fuß), sonst
    // eine Platte 8 × 0,4 × 3 m an der Oberkante ihrer Hülle; `fn(x, z, y, längs x)`
    const boden = (X, fn, o = ["gras", "laub"].includes(X) && window.__weltOrt("stoff", { stoff: X, mitte: [UX, UZ], rMax: 126, schritt: 3 })) =>
        o ? fn(o.x, o.z, hh(o.x, o.z), 0) : werk("_platte", [[X, 8, 0.4, 3, 0, 0.2]], UX + 14, UZ, hh(UX + 14, UZ) + 0.5, (e) => fn(UX + 11, UZ, e.blockerAABBs[0].topY, 1));
    // der Stoff im Brennpunkt der Linse: [Erwärmung nach `dauer` s, Zündzeit oder null]
    const brenn = (X, dauer) => {
        const p = r._brennpunkte(linse, r._sonnenRichtung())[0];
        return werk("_ziel", [[X, 0.6, 0.6, 0.6, 0, 0]], p.x, p.z, p.y, (e) => {
            let t = 0;
            for (; t < dauer && st.architectures.includes(e); t += 0.25) r._tickFocusingAffordances(0.25);
            if (st.brandFeld) st.brandFeld.clear();
            return [e.heatBuildup, st.architectures.includes(e) ? null : t];
        });
    };
    const um = (k, v, fn) => {
        const alt = st[k];
        st[k] = v;
        try {
            return fn();
        } finally {
            st[k] = alt;
        }
    };
    // der Tag, ab dem der See trägt (Sommer 0,375 … Winter 0,875, halbiert auf die Stunde)
    const traegt = (lo = 0.375, hi = 0.875) => {
        for (let m; hi - lo > 1 / 8760; ) um("seasonPhase", (m = (lo + hi) / 2), () => r._eisAt(SX, SZ, NaN)) === null ? (lo = m) : (hi = m);
        return hi * 365;
    };
    // je Wirkung [Mutation, Messung, Urteil (vorher, nachher)]
    const W = {
        rho: [
            (z) => (z.rho *= 0.5),
            (X) => werk("_tafel", [[X === "wasser" ? "holz" : X, 3, 0.6, 1.4, 0, 0.3]], SX, SZ, grund, (e) => [r._teilMasse(st.blueprints._tafel.parts[0]), spiegel - r._fahrBoden(e)(SX, SZ)]),
            (X, v, n) => (X === "wasser" ? n[1] - v[1] > 0.05 : Math.abs(n[0] / v[0] - 0.5) < 0.005 && (v[1] - n[1] > 0.02 || n[1] > tiefe - 0.05)),
        ],
        mu: [
            (z) => (z.mu *= 0.5),
            (X) =>
                boden(X, (x, z, y, ux) => {
                    st.maxCreatures = st.creatures.length + 1;
                    const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
                    w.position.y = y;
                    w.userData._stossV = { x: 3 * ux, z: 3 * ux - 3 };
                    for (let i = 0; i < 3000 && w.userData._stossV; i++) r._kreaturStossSchritt(r.constructor.FIXED_DT);
                    r.removeCreature(w);
                    return Math.hypot(w.position.x - x, w.position.z - z);
                }),
            (X, v, n) => v > 0.1 && Math.abs(n / v - 2) < 0.3,
        ],
        klang: [
            (z) => (z.klang = { ...z.klang, freq: z.klang.freq * 2 }),
            // je Tritt EIN Rausch-Burst (`_playSchrittOneShot`, Math.random): sein Schwerpunkt streut (Erde 241–406 Hz in 400 Tritten,
            // ein Paar über 1,4 in 3 von 800 — die Sabotage maß grün), gemessen wird das Mittel aus 8 Tritten, je einer im eigenen Kontext
            async (X) => {
                const sym = st.symphony;
                const alt = { ...sym };
                const tritt = (x, z, y) => (setz(x, z, y), r._schrittKlangTick({ walkPhase: 0 }, 0, false, pm), r._schrittKlangEreignis(pm, false, 0));
                let summe = 0;
                for (let i = 0; i < 8; i++) {
                    const ctx = new OfflineAudioContext(1, 24000, 48000);
                    Object.assign(sym, { enabled: true, ctx, masterGain: ctx.destination });
                    await (X === "wasser" ? tritt(watX, UZ) : boden(X, tritt));
                    Object.assign(sym, alt);
                    summe += window.__klangCore.schwerpunkt((await ctx.startRendering()).getChannelData(0), 48000) / 8;
                }
                return summe;
            },
            (X, v, n) => n / v > 1.4,
        ],
        tZuend: [(z) => (z.tZuend -= 100), async (X) => (await brenn(X, 120))[1], (X, v, n) => n > 0 && n < 0.85 * v],
        tSchmelz: [
            (z) => (z.tSchmelz -= 100),
            (X) => {
                if (X !== "wasser") throw new Error("offen: kein Leser der Phase von " + X);
                return um("seasonPhase", 0.875, () => +(r._eisAt(SX, SZ, NaN) !== null));
            },
            (X, v, n) => v === 1 && n === 0,
        ],
        c: [
            (z) => (z.c *= 0.5),
            async (X) => (X === "wasser" ? traegt() : (await brenn(X, 2))[0]),
            (X, v, n) => (X === "wasser" ? v - n > 1 : v > 0 && n / v > 1.5),
        ],
    };
    const aus = {};
    const leser = r._stoff;
    for (const X of STOFFE)
        for (const w of WIRKUNGEN) {
            const z = M[X];
            const alt = z && z[w];
            const f = W[w];
            aus[X] = aus[X] || {};
            try {
                if (!f) throw new Error("offen: die Luma braucht das Ausgabe-Bild (echte GPU)");
                if (alt === null) throw new Error("offen: die Zeile " + X + " trägt kein " + w + " (keine Wirkung zu mutieren)");
                const vor = await f[1](X);
                if (sabotage) {
                    const snap = Object.fromEntries(Object.keys(M).map((n) => [n, { ...M[n] }]));
                    r._stoff = (n) => snap[n];
                }
                f[0](z);
                const nach = await f[1](X);
                aus[X][w] = { vor, nach, ok: !!f[2](X, vor, nach) };
            } catch (e) {
                aus[X][w] = { ok: false, fehler: String(e.message || e).slice(0, 140) };
            } finally {
                if (z) z[w] = alt;
                r._stoff = leser;
            }
        }
    r.removeArchitecture(linse);
    return aus;
}
async function tafel() {
    const { statikServer, starteBrowser, nullRenderer, warteAufWelt, buehne } = require("./lib/welt-boot.cjs");
    const port = Number(process.env.GEGENSTAND_STOFF_PORT || 4677);
    const server = await statikServer().lausche(port);
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    try {
        const page = await browser.newPage();
        await nullRenderer(page);
        await server.zeige(page, 180000);
        await warteAufWelt(page, 180000);
        await page.evaluate(require("./lib/wasser-linse.cjs").WASSER_INSTALL);
        await buehne(page);
        const echt = await page.evaluate(tafelProbe, STOFFE, WIRKUNGEN, false);
        const sab = await page.evaluate(tafelProbe, STOFFE, WIRKUNGEN, true);
        const je = {};
        for (const X of STOFFE) console.log(X, (je[X] = WIRKUNGEN.filter((w) => echt[X][w].ok)).length + "/7", JSON.stringify(echt[X]));
        // an der Tafel vorbei: grün trotz Sabotage; stumm: die Sabotage maß nicht (ein Absturz ist kein Rot)
        const vorbei = STOFFE.flatMap((X) => WIRKUNGEN.filter((w) => sab[X][w].ok || (je[X].includes(w) && sab[X][w].fehler)).map((w) => X + "." + w));
        console.log("TAFEL " + JSON.stringify({ je, vorbei }));
        const gruen = !vorbei.length && STOFFE.every((X) => je[X].length >= 3);
        console.log(gruen ? "✅ TAFEL GRÜN — Staffel " + (STOFFE.every((X) => je[X].length === 7) ? 2 : 1) : "❌ TAFEL ROT — an der Tafel vorbei oder stumm: " + vorbei);
        return gruen ? 0 : 1;
    } finally {
        await browser.close();
        server.close();
    }
}
if (process.argv.includes("--tafel")) {
    tafel().then(process.exit, (e) => {
        console.error(e);
        process.exit(2);
    });
    return;
}

const fehlSelbst = selbstTest();
if (process.argv.includes("--selftest")) {
    urteilEnde(fehlSelbst.length, "❌ SELBST-TEST ROT — " + fehlSelbst.join(" · "), "✅ SELBST-TEST GRÜN — die Stoff-Linse feuert auf Ton, rohen Reifen, Lack ohne Lackschicht, blinde Scheibe, Tönung, Namenlose und fehlenden Transport.");
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
