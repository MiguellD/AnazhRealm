// diag-fachwerk-contract.cjs — ASSET-VERTRAG v6 (Häuser): der Byte-Beweis für
// fachwerk-core.js buildInstance (Studio-Vertrag B2, docs/studio-vertrag.md).
// Läuft DIREKT in Node (die v2/v3/v4/v5-Klasse): fachwerk-core braucht nur
// THREE-Geometrie/Material-Klassen — das vendorte r128-UMD lädt in Node,
// kein Browser, keine swiftshader-Fragilität (die Canvas-Textur-Bäcker sind
// document-gegated und backen in Node kartenlos — exakt wie im Worker).
//
// Fingerabdruck je Fall (rezeptId × seed × lod): sha256 über den kanonischen
// Byte-Strom der gebauten Gruppe in traverse-Reihenfolge — je Objekt mit
// Geometrie: Typ · matrixWorld (Float64-Bytes) · Material-Signatur (Farbe/
// roughness/metalness/opacity) · alle Attribute (Name sortiert, itemSize +
// rohe Puffer-Bytes) · Index. Ein einziges abweichendes Byte kippt den Hash.
//
// SEED-GETRIEBEN (cv:6, dokumentiert in spec/asset-contract/v6/CONTRACT.md):
// der Haus-Bau würfelt aus P.seed (Fenstertakt · OG-Material · Giebel-Verband ·
// Gauben · Fenster-Schlaf) — anders als Fahrzeug/Tor/Klinge ist derselbe
// Bauplan bei seed 7 und 12345 NICHT byte-gleich (die Goldens frieren beide
// Seeds je Stufe ein; stochastik-freie Stil-Familien dürfen seed-stabil sein).
//
// SPLIT-PARITÄT (aktiv, je Lauf, Stichproben-Rezepte × alle 4 Stufen): der
// Vertrags-Pfad buildInstance(id, seed, L) == die SHELL-KOMPOSITION derselben
// Kern-Primitive (kulturParams(name, LAB_SEED) frisch → stapelBau/HAUS.build/
// bakeLOD/fragFuer/mischeGeoms — wörtlich der promoteBauen-/LOD-Sonden-Pfad
// des Labs) — Kern-Vertrags-Pfad und Lab-Pfad bleiben EIN Bau, und die
// eingefrorene PRESETS-Ableitung drift-wacht gegen die lebende Kultur-Quelle.
//
// STUFEN-WAHRHEIT (kindStages.haus = [0,1,2,3], die erste Mehr-Stufen-Domäne
// außerhalb der Bäume): jede Stufe baut eine ANDERE Geometrie (L0 voll ·
// L1 Hülle · L2 Destillat+Fernkörper · 3 der Fernkörper allein, NUR-WURF, S3 haus) —
// aktiv geprüft; die lod-Klemme des Kerns faltet lod 9 → 3 und lod −1 → 0 (der Wirt
// serviert die NUR-WURF-Stufe keinem Distanz-Wunsch, `_foundryDeclaredStage`). Die
// Stufe 3 trägt ihre Fernform (`__fern`, Hüllen-Form N5) im Fingerabdruck.
//
// Goldens: spec/asset-contract/v6/golden/haeuser.json — EINGEFROREN
// (Taille-Disziplin), gemintet NUR wenn die Datei fehlt (oder MINT_FORCE=1).
// SELBST-TEST: ein in-memory korrumpiertes Golden MUSS rot erkannt werden.
// PLATTFORM-PROBE (S1 Wände): Math.pow ±1 ULP kippt kein Byte, die übrigen Transzendenten halten ihre Ratsche
// (spec/asset-contract/plattform-ratsche.json, Sätze v6 Häuser und v6a Ausstattung).
//   node scripts/diag-fachwerk-contract.cjs
const path = require("path");
const { fingerabdruck, goldenSelbsttest, fallSchluessel: caseKey, goldenWand, kernProbe } = require("./lib/plattform-probe.cjs");
const { studioKern, pruefer, taeterFaelle, abwandlung, ROOT: root } = require("./lib/welt-boot.cjs");
const fingerprint = (g) => fingerabdruck(g, false, true); // die v3–v5-Form samt Fernform der NUR-WURF-Stufe

// die Goldens der Häuser und der AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen — dasselbe Gesetzbuch, eigene Goldens)
const golden = (n) => path.join(root, "spec/asset-contract/v6/golden", n + ".json");

const { errs, check, wandEnde } = pruefer();
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");

// DIE LEUCHTDICHTE der Vertex-Farbe i × Stoff-Farbe mc (Rec. 709; `f` liest den Kanal — die Welt roh, der Selbsttest als sRGB):
// die Albedo der Häuser (flächengewichtet) und der Ausstattung (je Stoff) lesen sie EINMAL
const luma = (C, i, mc, f = (x) => x) => 0.2126 * f(C[i * 3]) * mc.r + 0.7152 * f(C[i * 3 + 1]) * mc.g + 0.0722 * f(C[i * 3 + 2]) * mc.b;

// Wegwerf-Bau sauber entsorgen (194 Häuser in einem Node-Prozess).
function disposeGroup(g) {
    if (!g) return;
    g.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
    });
}

// ── Die eingefrorenen Fälle: Kulturen × Seeds × die drei deklarierten Stufen ──
const KULTUREN = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "haus"); // alle 32 Kultur-Archetypen
// Die Ausstattung: jedes Rezept × jede Gestalt der Welt (Samen 1..V) × jede Stufe, dazu ein ov-Fall.
const AUS = Object.keys(FC.PRESETS).filter((k) => FC.PRESETS[k].kind === "ausstattung");
const LOD_CFG = FC.PORTAL_RENDER_CONFIG.lod; // die Stufen-Tafel des Gesetzbuchs
const AUS_LODS = LOD_CFG.kindStages.ausstattung || [];
const AUS_CASES = [];
for (const k of AUS)
    for (let s = 1; s <= LOD_CFG.budget.gestalten[k]; s++)
        for (const l of AUS_LODS) AUS_CASES.push({ rezeptId: k, seed: s, lod: l });
AUS_CASES.push({ rezeptId: "feuerstelle", seed: 1, lod: 0, ov: { fuelle: 0.2 } });
const SEEDS = [7, 12345];
const LODS = LOD_CFG.kindStages.haus; // [0, 1, 2, 3] — die B2-Stufen-Wahrheit (3 = NUR-WURF)
const CASES = [];
for (const k of KULTUREN) for (const s of SEEDS) for (const l of LODS) CASES.push({ rezeptId: k, seed: s, lod: l });
// ov-Kanal (Parameter-Override) — friert auch die Merge-Semantik ein.
CASES.push({ rezeptId: "alemannisch", seed: 7, lod: 0, ov: { storeys: 3, turm: 1 } });
CASES.push({ rezeptId: "hochhaus", seed: 7, lod: 2, ov: { W: 12 } });

function buildCase(c) {
    return FC.buildInstance(c.rezeptId, c.seed, c.lod, c.ov || undefined);
}
// der Abdruck (sha256) eines Wegwerf-Baus, danach entsorgt
const shaVon = (g) => {
    const f = fingerprint(g);
    disposeGroup(g);
    return f.sha256;
};

// ── DIE SHELL-KOMPOSITION (Split-Paritäts-Referenz): derselbe Bau aus den
//    Kern-PRIMITIVEN, wörtlich wie das Lab (promoteBauen · LOD-Sonde) — mit
//    FRISCHER kulturParams-Ableitung statt der eingefrorenen PRESETS (die
//    Probe drift-wacht beide Nähte: Stufen-Komposition UND Rezept-Ableitung). ──
function shellPfad(name, seed, stufe) {
    const kp = FC.kulturParams(name, FC.LAB_SEED);
    // ≡ hausParams-Basis: B4-Defaults + terrain:0, dann die Kultur-Felder (applyKultur → readParams).
    const p = { terrain: 0, seed: seed };
    for (const row of FC.PARAMS_BY_KIND.haus) p[row.id] = row.def;
    // die Kultur-Felder in der Reihe der Kultur-Ableitung (die Reihe der Schlüssel von p bleibt die des Lab-Pfads)
    for (const b of ["W", "D", "pitchDeg", "storeys", "hip", "roofCurve", "treppgiebel", "kuppel", "portikus", "arkade", "turm", "zinnen", "veranda", "vorkragung", "pilotis", "terrasse", "brace", "stil", "dachTyp", "bogenTyp", "grundriss"])
        p[b] = kp[b];
    if (kp.col) p.col = Object.assign({}, kp.col);
    p.place = { mode: "site", siteTag: "haus" }; // der fx-Daten-Passagier reist im Vertrags-Pfad mit — hier identisch
    FC.materials();
    const geoms = {};
    const turm = (p.storeys || 1) >= 6;
    if (stufe === 0) {
        // ≡ promoteBauen (Lab) + LÜCKENLOS-Bake:
        const hp2 = Object.assign({}, p, {
            nur: turm ? { moebel: false, innenwaende: false } : p.arm ? { moebel: false } : {},
        });
        const st =
            (p.storeys || 1) > 11
                ? FC.stapelBau(hp2, { gelaende: false })
                : (() => {
                      const H = FC.HAUS(THREE, FC.mat, hp2);
                      return { g: H.build({ gelaende: false }), H };
                  })();
        // DORF-ERLEBNIS — die TÜR-FLÜGEL-SEPARATION wandert mit dem
        // Kern (Lehre 6: Tests wandern mit dem Code): Tür-Blätter (userData.side)
        // werden JE Blatt eigen gebakt + als Scharnier-Wrap angehängt — wörtlich
        // der buildStufe-Pfad; der Rumpf bakt danach LÜCKENLOS wie zuvor.
        const fluegelL = [];
        st.g.updateMatrixWorld(true);
        st.g.traverse((o) => {
            if (o.userData && o.userData.door && typeof o.userData.side === "number") fluegelL.push(o);
        });
        const tuerWraps = [];
        for (const Lf of fluegelL) {
            const lg = {};
            FC.bakeLOD(Lf, p.col, lg, 0, true);
            // das Blatt sitzt am Scharnier: das haus-lokale Gitter rückt um das Scharnier zurück, die Hülle steht daran
            for (const rk in lg)
                if (lg[rk] && lg[rk].pos)
                    for (let vi = 0; vi < lg[rk].pos.length; vi += 3) {
                        lg[rk].pos[vi] -= Lf.position.x;
                        lg[rk].pos[vi + 2] -= Lf.position.z;
                    }
            const wg = FC.geomsZuGruppe(lg, p.col || null);
            if (!wg.children.length) continue;
            wg.position.set(Lf.position.x, 0, Lf.position.z);
            wg.userData = { side: Lf.userData.side, offen: Lf.userData.offen || 0 };
            if (Lf.parent) Lf.parent.remove(Lf);
            tuerWraps.push(wg);
        }
        if (tuerWraps.length) geoms.__tuerFluegel = tuerWraps;
        FC.bakeLOD(st.g, p.col, geoms, 0, true);
        disposeGroup(st.g);
    } else {
        // ≡ LOD-Sonde: MASS-BUILD → B, dann fragFuer (der Warm-Pfad lebt in ihm, S8).
        const mass = FC.stapelBau(Object.assign({}, p, { nur: FC.MASSNUR }), FC.LOD1F);
        const bx = new THREE.Box3().setFromObject(mass.g);
        const B = {
            p,
            q: { phi: 0, x: 0, y: 0, z: 0, obb: { cx: 0, cz: 0 } },
            lod: "chunk",
            dyn: false,
            ext: { x0: bx.min.x, x1: bx.max.x, z0: bx.min.z, z1: bx.max.z, y1: bx.max.y },
            dims: mass.H.dims,
            fp: FC.fpVon(mass.H),
            masse: FC.masseVon(mass),
            spawnL: { x: mass.H.spawn.x, z: mass.H.spawn.z },
            hofGap: 2.5,
            meshes: [],
        };
        disposeGroup(mass.g);
        FC.mischeGeoms(geoms, FC.fragFuer(B, stufe));
        B.frag = null;
        B.fragStufe = undefined;
        if (stufe === 3) geoms.__fern = FC.huelleVonBau(B);
    }
    const g = FC.geomsZuGruppe(geoms, p.col || null);
    // DORF-ERLEBNIS — die separierten Tür-Flügel reisen wie in buildInstance mit.
    if (geoms.__tuerFluegel) for (const wg of geoms.__tuerFluegel) g.add(wg);
    g.userData = { kind: "haus", rezeptId: name, seed, lod: stufe };
    // die NUR-WURF-Stufe: ihre Fernform und der EINE Schatten-Stoff (wie buildInstance)
    if (geoms.__fern) {
        g.userData.__fern = geoms.__fern;
        FC.stufeWirft(g);
    }
    g.updateMatrixWorld(true);
    return g;
}

// ── DER BOGEN IM VERBAND (K66: kein Bogen ragt über die Traufe, kein Keilstein schwebt lose neben dem Pfeilerkopf). Je
//    Bogen —
//    die Marke `keil` an jedem Keilstein (bogenRahmen: Lage, Kurve, Deckel, Pfeiler), `zwickel` an seiner Mauer — in der
//    Ebene des Bogens (u längs der Wand ab der Bogenmitte, v über dem Kämpfer):
//    B1 die Öffnung ist frei: keine Ecke eines Keilsteins liegt in der Öffnung unter der Laibung (1 cm);
//    B2 der Verband ist geschlossen: benachbarte Keilsteine teilen ihre Fuge (Laibung und Rücken, 1 cm);
//    B3 die Fugen sind radial: jede Stoßfuge zeigt zur Mitte ihrer Kurve (≤ 3°);
//    B4 der Kämpfer trägt: kein Keilstein reicht unter den Kämpfer (1 cm), der Kämpferstein liegt auf seinem Pfeiler;
//    B5 unter der Traufe: der höchste Punkt des Bogens samt Zwickel bleibt unter seinem Deckel (`cap`).
//    Die Mitte der Kurve aus dem EINEN Bogen-Gesetz (fachwerk `BOGEN_GESETZ`): rund (0, 0) · hufeisen (0, R·tan α) ·
//    stich (0, f − ρ) · spitz (±e, 0) je Hälfte.
function bogenEbene(B, m) {
    // die Ecken des Keilsteins in der Bogen-Ebene (u, v), entdoppelt (die Tiefe fällt heraus)
    const p = m.geometry.attributes.position;
    const v3 = new THREE.Vector3();
    const ecken = [];
    m.updateMatrixWorld(true);
    for (let i = 0; i < p.count; i++) {
        v3.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        const u = B.horiz ? v3.x - B.cx : v3.z - B.cz;
        const v = v3.y - B.yS;
        if (!ecken.some((e) => Math.abs(e[0] - u) < 1e-4 && Math.abs(e[1] - v) < 1e-4)) ecken.push([u, v]);
    }
    return ecken;
}
function bogenMitte(BG, B, u) {
    const R = B.R;
    if (B.kurve === "hufeisen") return [0, R * Math.tan(BG.hufeisenAlpha)];
    if (B.kurve === "stich") {
        const f = B.stich;
        const rho = (R * R + f * f) / (2 * f);
        return [0, f - rho];
    }
    if (B.kurve === "spitz") return [u < 0 ? BG.spitzE * R : -BG.spitzE * R, 0];
    return [0, 0];
}
function imPolygon(pt, poly) {
    let drin = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi || 1e-12) + xi) drin = !drin;
    }
    return drin;
}
function abstandPolylinie(pt, pl) {
    let d = Infinity;
    for (let i = 1; i < pl.length; i++) {
        const [ax, ay] = pl[i - 1];
        const [bx, by] = pl[i];
        const dx = bx - ax;
        const dy = by - ay;
        const l2 = dx * dx + dy * dy;
        let t = l2 > 0 ? ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / l2 : 0;
        t = Math.max(0, Math.min(1, t));
        d = Math.min(d, Math.hypot(pt[0] - ax - dx * t, pt[1] - ay - dy * t));
    }
    return d;
}
// Das Urteil EINES Bogens: B die Marke, steine [{i, ecken}] (Ecken in der Ebene), zwickelMaxV die Oberkante seiner Mauer.
function bogenUrteil(BG, B, steine, zwickelMaxV) {
    const bef = [];
    const S = steine.slice().sort((a, b) => a.i - b.i);
    const lai = B.intrados;
    // B1 — die Öffnung: die Laibung samt der Kämpfer-Sehne als Polygon
    for (const s of S)
        for (const e of s.ecken)
            if (imPolygon(e, lai) && abstandPolylinie(e, lai) > 0.01) {
                bef.push(
                    `B1 Keilstein ${s.i} hängt ${abstandPolylinie(e, lai).toFixed(2)} m in die Öffnung (${e.map((x) => x.toFixed(2)).join("/")})`
                );
                break;
            }
    // die Laibungs- und Rücken-Ecken je Stein (die zwei der Mitte nächsten sind Laibung)
    const teile = S.map((s) => {
        // je Ecke die Mitte ihrer Kurve (der Spitzbogen hat zwei: der Schlussstein liegt über beiden)
        const r = s.ecken
            .map((e) => {
                const c = bogenMitte(BG, B, e[0]);
                return { e, r: Math.hypot(e[0] - c[0], e[1] - c[1]) };
            })
            .sort((a, b) => a.r - b.r);
        return { s, lai: r.slice(0, 2).map((q) => q.e), ruecken: r.slice(2).map((q) => q.e) };
    });
    // B2 — der Verband: benachbarte Steine teilen ihre Fuge
    // (die gemeinsame Laibungs-Ecke deckt sich, und jede Stoßfuge liegt auf der Linie der anderen — der Schlussstein darf länger sein)
    const fuge = (t, a) =>
        t.ruecken
            .slice()
            .sort((x, y) => Math.hypot(x[0] - a[0], x[1] - a[1]) - Math.hypot(y[0] - a[0], y[1] - a[1]))[0];
    const zurLinie = (p, a, b) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / (Math.hypot(dx, dy) || 1);
    };
    for (let k = 1; k < teile.length; k++) {
        const A = teile[k - 1];
        const Bt = teile[k];
        let dl = Infinity;
        let pa = null;
        let pb = null;
        for (const a of A.lai)
            for (const b of Bt.lai) {
                const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
                if (d < dl) [dl, pa, pb] = [d, a, b];
            }
        const ra = fuge(A, pa);
        const rb = fuge(Bt, pb);
        const dr = ra && rb ? Math.max(zurLinie(rb, pa, ra), zurLinie(ra, pb, rb)) : Infinity;
        if (dl > 0.01 || dr > 0.01) {
            bef.push(`B2 Fuge ${A.s.i}|${Bt.s.i} offen ${Math.max(dl, dr).toFixed(3)} m`);
            break;
        }
    }
    // B3 — die Fugen radial: je Stein seine zwei Stoßfugen (Laibungs-Ecke zur nächsten Rücken-Ecke)
    for (const t of teile) {
        let schlimm = 0;
        for (const a of t.lai) {
            if (a[1] < 0.02) continue; // das Lager auf dem Kämpfer ist keine Stoßfuge
            const q = fuge(t, a);
            if (!q) continue;
            const fx = q[0] - a[0];
            const fy = q[1] - a[1];
            const c = bogenMitte(BG, B, a[0]);
            const rx = (a[0] + q[0]) / 2 - c[0];
            const ry = (a[1] + q[1]) / 2 - c[1];
            const cos = Math.abs(fx * rx + fy * ry) / (Math.hypot(fx, fy) * Math.hypot(rx, ry) || 1);
            schlimm = Math.max(schlimm, (Math.acos(Math.min(1, cos)) * 180) / Math.PI);
        }
        if (schlimm > 3) {
            bef.push(`B3 Keilstein ${t.s.i} verdreht: Fuge ${schlimm.toFixed(0)}° gegen den Radius`);
            break;
        }
    }
    // B4 — der Kämpfer: nichts unter yS; die Kämpfersteine über ihrem Pfeiler
    const vMin = Math.min(...S.flatMap((s) => s.ecken.map((e) => e[1])));
    if (vMin < -0.01) bef.push(`B4 ein Keilstein reicht ${(-vMin).toFixed(2)} m unter den Kämpfer`);
    if (B.pfeiler && S.length) {
        for (const [s, pf] of [
            [S[0], B.pfeiler[0]],
            [S[S.length - 1], B.pfeiler[1]],
        ]) {
            const fuss = s.ecken.filter((e) => e[1] < 0.02);
            const aus = fuss.filter((e) => e[0] < pf[0] - 0.01 || e[0] > pf[1] + 0.01);
            if (!fuss.length || aus.length) {
                bef.push(
                    `B4 Kämpferstein ${s.i} liegt nicht auf seinem Pfeiler (${fuss.length ? aus[0][0].toFixed(2) : "kein Lager"} außerhalb ${pf[0].toFixed(2)}…${pf[1].toFixed(2)})`
                );
                break;
            }
        }
    }
    // B5 — unter der Traufe
    const vMax = Math.max(zwickelMaxV, ...S.flatMap((s) => s.ecken.map((e) => e[1])));
    if (B.yS + vMax > B.cap + 0.005)
        bef.push(`B5 der Bogen ragt ${(B.yS + vMax - B.cap).toFixed(2)} m über seinen Deckel (${B.cap.toFixed(2)} m)`);
    return bef;
}
// Alle Bögen einer roh gebauten Gruppe → [{B, befunde}]
function bogenBefunde(BG, g) {
    const boegen = new Map();
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        const k = o.userData && o.userData.keil;
        const z = o.userData && o.userData.zwickel;
        if (!k && !z) return;
        const B = (k || z).bogen;
        let e = boegen.get(B);
        if (!e) boegen.set(B, (e = { steine: [], zwickelMaxV: -Infinity }));
        if (k) e.steine.push({ i: k.i, ecken: bogenEbene(B, o) });
        else e.zwickelMaxV = Math.max(e.zwickelMaxV, ...bogenEbene(B, o).map((q) => q[1]));
    });
    return [...boegen].map(([B, e]) => ({ B, befunde: bogenUrteil(BG, B, e.steine, e.zwickelMaxV) }));
}
// Der Selbsttest der Linse: ein Bogen aus Keilen (rund, R 1, Stärke 0,25, 9 Steine) ist grün; verdreht, gerückt, gesenkt,
// zu hoch fällt er je am Namen.
function bogenSelbsttest(BG) {
    const R = 1;
    const t = 0.25;
    const N = 9;
    const B = {
        cx: 0,
        cz: 0,
        yS: 0,
        R,
        horiz: true,
        kurve: "rund",
        cap: 1.3,
        pfeiler: [
            [-1.3, -1],
            [1, 1.3],
        ],
        intrados: [],
    };
    for (let k = 0; k <= 32; k++)
        B.intrados.push([-R * Math.cos((Math.PI * k) / 32), R * Math.sin((Math.PI * k) / 32)]);
    const keil = (i) => {
        const a0 = (Math.PI * i) / N;
        const a1 = (Math.PI * (i + 1)) / N;
        const P = (a, r) => [-r * Math.cos(a), r * Math.sin(a)];
        return { i, ecken: [P(a0, R), P(a1, R), P(a1, R + t), P(a0, R + t)] };
    };
    const gut = () => Array.from({ length: N }, (_, i) => keil(i));
    const fall = (name, steine, cap) => bogenUrteil(BG, Object.assign({}, B, cap ? { cap } : {}), steine, -Infinity);
    const ok = fall("gut", gut()).length === 0;
    const dreh = gut();
    {
        const s = dreh[3];
        const m = s.ecken.reduce((a, e) => [a[0] + e[0] / 4, a[1] + e[1] / 4], [0, 0]);
        const w = (40 * Math.PI) / 180;
        s.ecken = s.ecken.map(([u, v]) => [
            m[0] + (u - m[0]) * Math.cos(w) - (v - m[1]) * Math.sin(w),
            m[1] + (u - m[0]) * Math.sin(w) + (v - m[1]) * Math.cos(w),
        ]);
    }
    const lose = gut();
    lose[4].ecken = lose[4].ecken.map(([u, v]) => [u * 1.06, v * 1.06]);
    const tief = gut();
    tief[0].ecken = tief[0].ecken.map(([u, v]) => [u, v - 0.12]);
    const hat = (bef, k) => bef.some((b) => b.startsWith(k));
    return {
        gruen: ok,
        B3: hat(fall("dreh", dreh), "B3"),
        B2: hat(fall("lose", lose), "B2"),
        B4: hat(fall("tief", tief), "B4"),
        B5: hat(fall("hoch", gut(), 1.1), "B5"),
    };
}
function bogenLinse() {
    const BG = FC.BOGEN_GESETZ;
    check(
        "BOGEN-VERBAND: das Bogen-Gesetz steht im Kern (BOGEN_GESETZ: hufeisenAlpha, spitzE)",
        !!BG && Number.isFinite(BG.hufeisenAlpha) && Number.isFinite(BG.spitzE)
    );
    if (!BG) return;
    const st = bogenSelbsttest(BG);
    check(
        "BOGEN-VERBAND SELBST-TEST: ein Bogen aus Keilen ist grün; verdreht (B3), gerückt (B2), unter dem Kämpfer (B4), über dem Deckel (B5) fällt er",
        st.gruen && st.B3 && st.B2 && st.B4 && st.B5,
        JSON.stringify(st)
    );
    // die Fälle: jede Kultur, wie sie ist (Fenster- und Tür-Bögen) und mit Laube (arkade 1); die Laube in jeder Bogen-Art; die
    // römische Kirche des Auto-Dorfs (die Marke des Dorfs: arkade 1, W 15, D 11)
    const faelle = [];
    for (const k of KULTUREN) {
        faelle.push([k, null]);
        faelle.push([k, { arkade: 1 }]);
    }
    for (const bt of ["rund", "spitz", "hufeisen"]) {
        faelle.push(["alemannisch", { arkade: 1, bogenTyp: bt, storeys: 2 }]);
        faelle.push(["roemisch", { arkade: 1, bogenTyp: bt }]);
    }
    faelle.push(["roemisch", { arkade: 1, W: 15, D: 11 }]);
    FC.materials();
    const t0 = Date.now();
    let boegen = 0;
    const taeter = [];
    const je = { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0 };
    for (const [k, ov] of faelle) {
        const hp = FC.hausParams(FC.PRESETS[k], ov);
        hp.seed = 7;
        const H = FC.HAUS(THREE, FC.mat, hp);
        const g = H.build({ gelaende: false });
        // die Laube trägt ihre Bögen (oder, wo kein Stich unter die Traufe passt, den Sturz der Säulenhalle) — ein Bogen, der am
        // Deckel scheitert, darf die Laube nicht still leeren
        let laube = 0;
        let sturz = false;
        g.traverse((o) => {
            if (o.userData && o.userData.sturz) sturz = true;
        });
        for (const { B, befunde } of bogenBefunde(BG, g)) {
            if (B.art === "arkade") laube++;
            boegen++;
            for (const b of befunde) je[b.slice(0, 2)]++;
            if (befunde.length)
                taeter.push(
                    `bogenRahmen[${B.art}] ${k}${ov ? " " + JSON.stringify(ov) : ""} (${B.kurve}, R ${B.R.toFixed(2)}): ${befunde[0]}`
                );
        }
        if (ov && ov.arkade && !laube && !sturz)
            taeter.push(`arkade ${k} ${JSON.stringify(ov)}: die Laube trägt weder Bogen noch Sturz`);
        disposeGroup(g);
    }
    console.log(
        `  · BOGEN-VERBAND: ${boegen} Bögen in ${faelle.length} Bauten, ${taeter.length} rot — je Befund ${JSON.stringify(je)} (${Date.now() - t0} ms)`
    );
    const kirche = taeter.filter((t) => t.includes('"W":15'));
    const erste = ["B1", "B2", "B3", "B4", "B5"].map((b) => taeter.find((t) => t.includes(": " + b))).filter(Boolean);
    for (const t of erste.concat(kirche.slice(0, 2))) console.log("      " + t);
    check(
        `BOGEN-VERBAND: jeder Bogen liegt im Verband unter seiner Traufe (B1 Öffnung frei · B2 geschlossen · B3 radial · B4 Kämpfer · B5 Deckel; ${boegen} Bögen)`,
        boegen > 0 && taeter.length === 0,
        taeter.length ? `${taeter.length} rot, zuerst: ${taeter[0]}` : ""
    );
}

// ── DIE POSEN-LINSE (Pflicht A · F, der Prüfplatz): das Gesetz der Stationen (fachwerk `genesisPose`) an jeder Pose des Plans
//    (`genesisLayout` → `ortPlan`, die EINE Quelle der Posen) auf dem Grund der Standard-Welt samt Erdbau — rein in node, im Wirt,
//    wie index.html ihn lädt (stamm `ladeKlasse`: die Kerne, dann der Stamm). Dazu hält sie, was der Kern nicht sieht: das Auge des
//    Plans ist die Kamera des Wirts (KAM_FOV_GRAD, EGO_AUGE_M, PLAYER_FOOT_OFFSET, der Arm der Third aus dem Konstruktor), die
//    Bänder seiner Tor-Stufen die von porta. Der Plan ist der der Welt (ihre Kerne aus dem Wirt), sein Plan-Hash steht in der
//    Zeile der Posen — das Labor ?ort=genesis nennt denselben. Leer bricht sie ROT. Leser: der Koordinator vor dem Landen von
//    ort-wirt. SELBST-TEST: genesisLayout wirft laut, fehlt eine Welt oder hat eine keinen Slot; eine Kamera im Gürtel, eine
//    Sichtlinie über Feld-Wurf, eine fern-Station in 25 m — je ROT beim Namen.   node scripts/diag-fachwerk-contract.cjs --posen
function posenLinse() {
    const { AnazhRealm: A, ctx: W } = require("./lib/stamm.cjs").ladeKlasse(root);
    const [r, G, T] = [require("vm").runInContext("new AnazhRealm()", W).state, FC.GENESIS_ORT, W.__portaCore.PORTAL_RENDER_CONFIG.lod.budget.gate];
    const r6 = (a) => JSON.stringify(a.map((v) => Math.round(v * 1e6) / 1e6));
    const ist = [A.KAM_FOV_GRAD, A.EGO_AUGE_M, A.PLAYER_FOOT_OFFSET, r.cameraThirdDistance, r.cameraThirdHeight, T[1].ab * (1 + T.hyst), T[2].ab * (1 - T.hyst), T[2].ab * (1 + T.hyst)];
    const soll = [G.auge.fovGrad, G.auge.augeM, G.auge.fussM, G.auge.armM, G.auge.armHochM].concat(G.torStufe[1], G.torStufe[2][0]);
    check("POSEN: das Auge des Plans ist die Kamera des Wirts, seine Tor-Stufen die von porta", r6(ist) === r6(soll), r6(ist));
    const welten = G.tafel.map((t) => t.welt);
    const wirft = (w) => {
        try {
            FC.genesisLayout(1, w);
        } catch (e) {
            return /Slot|fehlt/.test(e.message);
        }
    };
    const GK = W.__gelaendeCore;
    const L = GK.lageGrund(GK.LAGE_GRUND.seed, W.SimplexNoise);
    const plan = W.__fachwerkCore.ortPlan(W.__fachwerkCore.genesisLayout(FC.genesisSaat(GK.LAGE_GRUND.seed), welten), { x: 0, z: 0 }, GK.ortCtx(L));
    const Lb = Object.assign({}, L, { erdbau: GK.erdbauNormal(plan.erdbau) });
    const boden = { hoeheAt: (x, z) => GK.hoehe(Lb, x, z, true) };
    const mit = (n, wert) => abwandlung(plan.stationen.find((q) => q.name === n))("", wert);
    const fehler = taeterFaelle(
        [
            { name: "eine Kamera im Gürtel", z: mit("S1", { ego: { x: -32.6, z: 28.1 } }), muss: /^KAMERA im Gürtel/ },
            { name: "eine Sichtlinie über Feld-Wurf", z: mit("S1", { blick: { x: -81, z: 70 }, ziele: [{ art: "haus", x: -81, z: 70, band: "fern" }] }), muss: /^SICHTLINIE über Feld-Wurf/ },
            { name: "eine fern-Station in 25 m", z: mit("S7f", { ego: { x: -70, z: 70 } }), muss: /^ABSTAND fels fern in 25\.0 m/ },
        ],
        (s) => FC.genesisPose(plan, s, false, boden).befunde
    );
    check("POSEN SELBST-TEST: die gepflanzten Täter je ROT beim Namen, genesisLayout wirft laut (eine Welt fehlt · eine ohne Slot)", !fehler.length && wirft(welten.slice(1)) && wirft(welten.concat(["schwarm"])), fehler.join(" · "));
    const P = FC.genesisPosen(plan, boden);
    console.log(P.text.replace(/^/gm, "  "));
    check(`POSEN: jede Station hält ihre Pose (${P.posen.length - P.fehl.length}/${P.posen.length}, Plan-Hash ${FC.ortHash(plan)}; leer ist ROT)`, P.posen.length > 0 && !P.fehl.length, P.fehl.map((u) => u.text).join(" | "));
}

(async function main() {
    // EINE Teil-Linse allein (`--bogen` · `--posen`)
    const teil = process.argv.includes("--bogen") ? bogenLinse : process.argv.includes("--posen") ? posenLinse : null;
    if (teil) {
        console.log(`=== ${teil.name} (fachwerk-core) ===`);
        teil();
        console.log(errs.length ? `\n❌ ROT — ${errs.length}` : "\n✅ GRÜN");
        process.exit(errs.length ? 1 : 0);
    }
    console.log("=== ASSET-VERTRAG v6 — Häuser (fachwerk-core.js buildInstance) ===");
    check("fachwerk-core geladen (__fachwerkCore + buildInstance)", !!FC && typeof FC.buildInstance === "function");
    check(
        "alle 32 Kulturen im Rezept-Namensraum (PRESETS)",
        KULTUREN.length === 32 && KULTUREN.every((k) => /^[a-z0-9_-]+$/.test(k))
    );
    check(
        "kindStages.haus == [0,1,2,3] (3 = NUR-WURF)",
        JSON.stringify(LODS) === "[0,1,2,3]"
    );

    // 1) Alle Fälle bauen + fingerprinten.
    const actual = {};
    const huellen = {}; // DIE HÜLLE DES GESETZBUCHS je Fall (Beipack __huelle, Welle L)
    const t0 = Date.now();
    for (const c of CASES) {
        const g = buildCase(c);
        actual[caseKey(c)] = fingerprint(g);
        const hu = g.userData && g.userData.__huelle;
        huellen[caseKey(c)] =
            hu && Array.isArray(hu.teile)
                ? hu.teile
                      .filter((t) => t.art === "box" && (t.rolle === "fest" || t.rolle === "beide"))
                      .flatMap((t) => [t.c[0] - t.h[0], t.c[1] - t.h[1], t.c[2] - t.h[2], t.c[0] + t.h[0], t.c[1] + t.h[1], t.c[2] + t.h[2]])
                : null;
        disposeGroup(g);
    }
    console.log(`      ↳ ${CASES.length} Fälle gebaut in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

    // 1b) KOLLISION == OPTIK IN JEDER FERNE: jede Stufe trägt die Solids der Stufe 0 byte-gleich — die Welt
    //     kollidiert nie mit einer Stufen-Bounding-Box (die L1-Box des Hof-Hauses lag 8,2 m vor seinen Solids, die Tür war
    //     von vorn unerreichbar). Selbsttest: eine Stufe mit ihrer Bounding-Box statt der Solids muss rot werden.
    const NUR_WURF = (l) => !!(LOD_CFG.budget.haus[l] || {}).nurWurf;
    const huellenBruch = (H) => {
        const bruch = [];
        for (const k of KULTUREN)
            for (const s of SEEDS) {
                const h0 = H[`${k}-s${s}-L0`];
                if (!h0 || h0.length < 6) {
                    bruch.push(`${k}/${s}: L0 ohne Solids`);
                    continue;
                }
                const z0 = h0.join(",");
                for (const l of LODS) {
                    if (l === 0 || NUR_WURF(l)) continue; // die NUR-WURF-Stufe wird nie gezeigt und trägt keine Kollision
                    if (!H[`${k}-s${s}-L${l}`] || H[`${k}-s${s}-L${l}`].join(",") !== z0) bruch.push(`${k}/${s}/L${l}`);
                }
            }
        return bruch;
    };
    const hb = huellenBruch(huellen);
    // in der EINEN Hüllen-Form (rolle fest), 32 Kulturen × 2 Samen
    check("Hülle des Gesetzbuchs: jede gezeigte Stufe trägt die Solids der Stufe 0 byte-gleich", hb.length === 0, hb.slice(0, 4).join(" "));
    {
        const korrupt = Object.assign({}, huellen);
        korrupt["alemannisch-s7-L1"] = [-4, 0, -5, 4, 9, 5]; // die Stufen-Bounding-Box statt der Solids
        check("SELBST-TEST: eine Stufe mit ihrer Bounding-Box statt der Solids wird rot", huellenBruch(korrupt).length === 1);
    }
    {
        // die Hofmauer trägt Solids: das Hof-Haus reicht in seinen Solids bis vor das Tor (z < −13 m)
        const hm = huellen["marokkanisch-s7-L0"] || [];
        let zMin = Infinity;
        for (let i = 2; i < hm.length; i += 6) zMin = Math.min(zMin, hm[i]);
        check("Hofmauer-Solids: marokkanisch (Hof-Grundriss) trägt seine Hofmauer bis z = " + zMin.toFixed(2) + " m", zMin < -13);
    }

    // 2) Determinismus: Stichproben-Fälle bauen doppelt byte-gleich (jede Stufe vertreten).
    let determin = true;
    for (const c of [
        { rezeptId: "alemannisch", seed: 7, lod: 0 },
        { rezeptId: "tudor", seed: 12345, lod: 1 },
        { rezeptId: "hochhaus", seed: 7, lod: 2 },
        { rezeptId: "marokkanisch", seed: 7, lod: 2 },
        { rezeptId: "chinesisch", seed: 7, lod: 3 },
    ])
        if (shaVon(buildCase(c)) !== actual[caseKey(c)].sha256) determin = false;
    check("Determinismus: Stichproben-Fälle (alle 4 Stufen) bauen doppelt byte-gleich", determin);

    // 3) SEED-GETRIEBEN (cv:6-Semantik — s. Kopf): der Fachwerk-Bau variiert mit dem Samen.
    check(
        "Seed-GETRIEBEN: alemannisch seed 7 != seed 12345 (L0: Fenstertakt, Verband, Gauben)",
        actual["alemannisch-s7-L0"].sha256 !== actual["alemannisch-s12345-L0"].sha256
    );
    check(
        "Seed-GETRIEBEN: tudor seed 7 != seed 12345 (L1: der Fenster-Schlaf)",
        actual["tudor-s7-L1"].sha256 !== actual["tudor-s12345-L1"].sha256
    );

    // 4) Die Stufen sind ECHT verschieden (keine kollabierte Mehr-Stufen-Deklaration).
    let stufenEcht = true;
    for (const k of ["alemannisch", "hanseatisch", "japanisch"])
        for (const l of [0, 1, 2]) if (actual[`${k}-s7-L${l}`].sha256 === actual[`${k}-s7-L${l + 1}`].sha256) stufenEcht = false;
    // Voll · Hülle · Destillat · Fernkörper
    check("Stufen-Wahrheit: L0 != L1 != L2 != L3 je Stichproben-Kultur", stufenEcht);

    // 5) ov-Kanal wirkt (Override ändert die Geometrie wirklich — kein Passagier).
    check(
        "ov-Kanal: Parameter-Override ändert den Bau (alemannisch != alemannisch+storeys/turm)",
        actual["alemannisch-s7-L0"].sha256 !== actual["alemannisch-s7-L0-ov_storeys_turm"].sha256
    );
    check(
        "ov-Kanal: auch am Destillat (hochhaus L2 != hochhaus L2+W)",
        actual["hochhaus-s7-L2"].sha256 !== actual["hochhaus-s7-L2-ov_W"].sha256
    );

    // 6) lod-Klemme: die Wahl faltet auf die deklarierten Stufen (Flatten-Semantik).
    const f9 = shaVon(buildCase({ rezeptId: "alemannisch", seed: 7, lod: 9 }));
    const fm = shaVon(buildCase({ rezeptId: "alemannisch", seed: 7, lod: -1 }));
    // die größte deklarierte Stufe ≤ der Wahl — die Anzeige-Klammer ist die des Wirts
    check("lod-Klemme: buildInstance(…, lod 9) == Stufe 3", f9 === actual["alemannisch-s7-L3"].sha256);
    check("lod-Klemme: buildInstance(…, lod −1) == Stufe 0", fm === actual["alemannisch-s7-L0"].sha256); // fail-closed auf die kleinste

    // 7) SPLIT-PARITÄT: der Vertrags-Pfad == der Lab-Pfad (Kern-Primitive, frische Kultur-Ableitung).
    const PARITY = ["alemannisch", "hochhaus", "hanseatisch", "japanisch", "marokkanisch", "holzhuette"];
    let parity = 0;
    let parityN = 0;
    for (const k of PARITY)
        for (const L of LODS) {
            parityN++;
            if (shaVon(shellPfad(k, 7, L)) === actual[`${k}-s7-L${L}`].sha256) parity++;
        }
    check(
        `Split-Parität: buildInstance == Shell-Komposition der Kern-Primitive (${parity}/${parityN} Rezept×Stufe)`,
        parity === parityN
    );

    // 8) Goldens: einfrieren beim ersten Lauf, danach byte-exakt vergleichen.
    goldenWand(golden("haeuser"), 6, actual, check, CASES.length);

    // 9) SELBST-TEST — die Linse ist nicht vakuös: korrumpierte Goldens werden rot.
    // gegen das Ist selbst (S1 Wände): der Selbst-Test misst auch auf einem roten Stand, was er misst
    goldenSelbsttest(actual, check);

    // 9b) DAS FARB-GESETZ DER HÄUSER — die Linse der Täter-Klasse „Hex roh als linear" (der Bake `_colFor` legt das
    //     Paletten-Hex nie roh in den Vertex). Gemessen wird, was die Welt liest: je Kultur
    //     (alle 32, Stufe 1 — die Flächen-Stufe, die das Auge am längsten sieht) die flächengewichtete lineare Albedo der
    //     Vertex-Farbe × Stoff-Farbe, je Rolle und gesamt, gegen das Band der Natur (diag-albedo-zensus): Holz-Klasse
    //     (holz · stamm · blockholz · lattung · boden) ≤ 0,25 · Kalk und Lehm (putz · gefach · lehm) ≤ 0,85 · jeder andere
    //     Stoff ≤ 0,45 · das ganze Haus ≤ 0,50. SELBST-TEST: dieselben Häuser mit roh gelesener Farbe (linear → sRGB
    //     zurück) MÜSSEN rot werden.
    {
        console.log("\n=== DAS FARB-GESETZ DER HÄUSER — die Albedo, die die Welt liest ===");
        const rolleVon = (m) => {
            for (const k in FC._MM) if (FC._MM[k] === m) return k;
            return null;
        };
        const HOLZ = new Set(["holz", "stamm", "blockholz", "lattung", "boden"]);
        const KALK = new Set(["putz", "gefach", "lehm"]);
        const decke = (r) => (HOLZ.has(r) ? 0.25 : KALK.has(r) ? 0.85 : 0.45);
        const roh = require("./lib/abnahme-urteil.cjs").linSrgb; // die EINE sRGB-Kurve
        // je Haus: { gesamt, rollen: { rolle: Y } } — `farbe` liest die Vertex-Farbe (die Welt) oder ihr Roh-Zwilling
        const albedoHaus = (g, farbe) => {
            const proRolle = {};
            let A = 0,
                Y = 0;
            g.traverse((o) => {
                if (!o.isMesh || !o.geometry.attributes.color) return;
                const seh = o.material.userData && o.material.userData.__seh;
                if (seh === "glas" || seh === "glut") return; // Glas spiegelt, Glut leuchtet — keine Albedo des Stoffs
                const r = rolleVon(o.material) || "?";
                const P = o.geometry.attributes.position.array,
                    C = o.geometry.attributes.color.array,
                    I = o.geometry.index ? o.geometry.index.array : null,
                    mc = o.material.color;
                const n = I ? I.length : P.length / 3;
                let a = 0,
                    y = 0;
                for (let i = 0; i < n; i += 3) {
                    const q = I ? [I[i], I[i + 1], I[i + 2]] : [i, i + 1, i + 2];
                    const [p0, p1, p2] = q.map((v) => v * 3);
                    const ux = P[p1] - P[p0],
                        uy = P[p1 + 1] - P[p0 + 1],
                        uz = P[p1 + 2] - P[p0 + 2],
                        vx = P[p2] - P[p0],
                        vy = P[p2 + 1] - P[p0 + 1],
                        vz = P[p2 + 2] - P[p0 + 2];
                    const ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
                    let l = 0;
                    for (const v of q) l += luma(C, v, mc, farbe) / 3;
                    a += ar;
                    y += ar * l;
                }
                if (!(a > 0)) return;
                const e = proRolle[r] || (proRolle[r] = { a: 0, y: 0 });
                e.a += a;
                e.y += y;
                A += a;
                Y += y;
            });
            const rollen = {};
            for (const r in proRolle) rollen[r] = proRolle[r].y / proRolle[r].a;
            return { gesamt: A > 0 ? Y / A : 0, rollen };
        };
        const urteil = (mess) => {
            const bruch = [];
            for (const [k, m] of mess) {
                if (m.gesamt > 0.5) bruch.push(`${k} gesamt ${m.gesamt.toFixed(3)} > 0,50`);
                for (const r in m.rollen)
                    if (m.rollen[r] > decke(r)) bruch.push(`${k} ${r} ${m.rollen[r].toFixed(3)} > ${decke(r)}`);
            }
            return bruch;
        };
        const welt = [],
            vorher = [];
        const maxRolle = {};
        for (const k of KULTUREN) {
            const g = FC.buildInstance(k, 7, 1);
            const m = albedoHaus(g, (c) => c);
            welt.push([k, m]);
            vorher.push([k, albedoHaus(g, roh)]);
            for (const r in m.rollen) if (!maxRolle[r] || m.rollen[r] > maxRolle[r][0]) maxRolle[r] = [m.rollen[r], k];
            disposeGroup(g);
        }
        const gesamt = welt.map(([, m]) => m.gesamt);
        const bruch = urteil(welt);
        check(
            `Albedo der Häuser im Band der Natur (${KULTUREN.length} Kulturen, L1): gesamt ${Math.min(...gesamt).toFixed(2)}–${Math.max(...gesamt).toFixed(2)} · ` +
                ["holz", "putz", "ziegel", "backstein", "stein"]
                    .filter((r) => maxRolle[r])
                    .map((r) => `${r} ≤ ${maxRolle[r][0].toFixed(2)}`)
                    .join(" · "),
            bruch.length === 0,
            bruch.slice(0, 3).join(" | ")
        );
        const bruchRoh = urteil(vorher);
        check(
            `SELBST-TEST: roh gelesene Farbe wird rot (${bruchRoh.length} Brüche)`,
            bruchRoh.length > 0,
            bruchRoh.length > 0 ? "" : "die Linse misst nichts"
        );
    }

    // 10) DIE AUSSTATTUNG — die Linse der Täter-Klasse „Host-Part-Look": was der Wirt aus
    //     eigenen Teilen baute (Glut-Zylinder, Brett-Tisch, Brunnen-Zylinder), baut jetzt das Gesetzbuch. Die Gestalt hält:
    //     Stufen echt verschieden UND deckungsgleich (L1 ersetzt L0 ohne Sprung: Hülle ± 8 cm), Boden-Anschluss (jedes
    //     Stück taucht unter y = 0), die Glut leuchtet und wirft nie, jede Zahl auf dem Raster 2^-12 (plattformgleich:
    //     V8 rundet sin/cos auf Linux und Windows verschieden — das Raster macht die Bytes gleich), Determinismus, Goldens.
    console.log("\n=== DIE AUSSTATTUNG — Feuerstelle · Marktstand · Brunnen · Laterne · Wandlaterne (dasselbe Gesetzbuch) ===");
    check(
        `fünf Ausstattungs-Rezepte mit Stufen [0,1,3] und Gestalten (${AUS.join(", ")})`,
        AUS.length === 5 && JSON.stringify(AUS_LODS) === "[0,1,3]" && AUS_CASES.length >= 25
    );
    // DIE LATERNE: der Leib und das Licht EINER Quelle — das Rezept trägt das Datum LICHT_GESETZ.laterne, und der
    // Glas-Kopf (Seh-Klasse glas, die Rolle des Fensters: er zündet nachts) umschließt die Licht-Höhe `hoeheM` je Stufe 0/1.
    // Die Wandlaterne trägt dasselbe: fx.licht = LICHT_GESETZ.wandlaterne, der Kopf um ihre Licht-Höhe.
    for (const rz of ["laterne", "wandlaterne"]) {
        const L = FC.PRESETS[rz] && FC.PRESETS[rz].fx && FC.PRESETS[rz].fx.licht;
        let kopf = 0;
        for (const lod of [0, 1]) {
            const g = FC.buildInstance(rz, 1, lod);
            g.traverse((o) => {
                if (!o.isMesh || (o.material.userData && o.material.userData.__seh) !== "glas") return;
                const bb = new THREE.Box3().setFromObject(o);
                if (L && bb.min.y < L.hoeheM && bb.max.y > L.hoeheM) kopf++;
            });
            disposeGroup(g);
        }
        check(
            `Die ${rz === "laterne" ? "Laterne" : "Wandlaterne"} trägt ihr Licht: fx.licht = LICHT_GESETZ.${rz}, der Glas-Kopf umschließt die Licht-Höhe (L0 und L1)`,
            !!L && JSON.stringify(L) === JSON.stringify(FC.LICHT_GESETZ[rz]) && kopf === 2,
            `Kopf um hoeheM in ${kopf}/2 Stufen`
        );
    }
    const ausIst = {};
    const huelle = {};
    let glutOk = true,
        glutDa = false,
        bodenOk = true,
        rasterOk = true,
        rasterBeispiel = "",
        albedoOk = true,
        albedoBeispiel = "";
    const albedo = {};
    for (const c of AUS_CASES) {
        const g = buildCase(c);
        ausIst[caseKey(c)] = fingerprint(g);
        const bb = new THREE.Box3().setFromObject(g);
        huelle[caseKey(c)] = bb;
        const nurWurf = !!(LOD_CFG.budget.ausstattung[c.lod] || {}).nurWurf;
        // die Wandlaterne (K66-2, siteTag wand) hängt: ihr Anschluss ist die Platte in der Wand-Ebene x = armM, nie der Boden
        const anDerWand = FC.PRESETS[c.rezeptId].fx.place.siteTag === "wand";
        if (
            !nurWurf &&
            (anDerWand ? !(Math.abs(bb.max.x - FC.LICHT_GESETZ.wandlaterne.armM) < 0.01) : !(bb.min.y < -0.02))
        )
            bodenOk = false;
        g.traverse((o) => {
            if (!o.isMesh) return;
            const em = o.material && o.material.emissive;
            // DIE ALBEDO-LINSE (kartenlos trägt der Vertex): je Stoff die mittlere Luminanz der Vertex-Farbe × Stoff-Farbe —
            // ein Stoff im Band der Natur (0,08–0,45: Holz, Stein, Tuch, Asche nach Kontakt-AO und Erdsaum — schwarz und Creme sind rot), die Glut dunkel
            // (≤ 0,30 — sie leuchtet durch ihren Stoff, eine helle Glut bleicht in der Sonne zu Creme). Glas misst nicht.
            const seh = o.material.userData && o.material.userData.__seh;
            const col = o.geometry.attributes.color;
            if (col && seh !== "glas" && !nurWurf) {
                const mc = o.material.color;
                let s = 0;
                for (let i = 0; i < col.count; i++) s += luma(col.array, i, mc);
                const Y = s / col.count;
                const k = `${c.rezeptId}:${seh}`;
                albedo[k] = Math.max(albedo[k] || 0, Y);
                const ok = seh === "glut" ? Y <= 0.3 : Y >= 0.08 && Y <= 0.45;
                if (!ok) {
                    albedoOk = false;
                    albedoBeispiel = albedoBeispiel || `${caseKey(c)} ${seh}: Y ${Y.toFixed(3)}`;
                }
            }
            if (em && em.getHex() !== 0) {
                if (c.rezeptId === "feuerstelle") glutDa = true;
                if (o.castShadow !== false || (o.material.userData && o.material.userData.__seh) !== "glut") glutOk = false;
            }
            for (const name of Object.keys(o.geometry.attributes)) {
                const q = name === "normal" ? 16384 : 4096;
                const arr = o.geometry.attributes[name].array;
                for (let i = 0; i < arr.length; i++)
                    if (arr[i] * q !== Math.round(arr[i] * q) || Object.is(arr[i], -0)) {
                        rasterOk = false;
                        rasterBeispiel = rasterBeispiel || `${caseKey(c)} ${name}[${i}] = ${arr[i]}`;
                        break;
                    }
            }
        });
        disposeGroup(g);
    }
    let stufenAus = true,
        deckung = true,
        deckBeispiel = "";
    for (const k of AUS)
        for (let s = 1; s <= LOD_CFG.budget.gestalten[k]; s++) {
            const a = `${k}-s${s}-L0`,
                b = `${k}-s${s}-L1`;
            if (ausIst[a].sha256 === ausIst[b].sha256) stufenAus = false;
            const A = huelle[a],
                B = huelle[b];
            const d = Math.max(
                Math.abs(A.min.x - B.min.x),
                Math.abs(A.max.x - B.max.x),
                Math.abs(A.max.y - B.max.y),
                Math.abs(A.min.z - B.min.z),
                Math.abs(A.max.z - B.max.z)
            );
            if (d > 0.08) {
                deckung = false;
                deckBeispiel = deckBeispiel || `${k} s${s}: L0↔L1 Hülle ${d.toFixed(3)} m`;
            }
        }
    check("Stufen-Wahrheit: L0 != L1 je Rezept × Gestalt", stufenAus); // nah fein · mittel grob
    check("Deckungsgleich: die L1-Hülle liegt auf der L0-Hülle (± 8 cm)", deckung, deckBeispiel); // kein Sprung beim Stufen-Wechsel
    check(
        // Steine, Pfosten, Kranz im Boden — kein Schweben am Hang
        "Boden-Anschluss: jedes Stück taucht unter y = 0, die Wandlaterne trägt ihre Platte in der Wand (x = armM)",
        bodenOk
    );
    check("Die Glut leuchtet und wirft nie (emissive ⇒ Seh-Klasse glut, castShadow false)", glutOk && glutDa); // die Feuerstelle trägt sie
    check(
        `Albedo im Band (kartenlos, je Stoff: Stoff 0,08–0,45 · Glut ≤ 0,30) — ${Object.entries(albedo)
            .map(([k, v]) => k + " " + v.toFixed(2))
            .join(" · ")}`,
        albedoOk,
        albedoBeispiel
    );
    check("Plattformgleich: jede Zahl auf dem Raster 2^-12 (Normalen 2^-14), kein −0", rasterOk, rasterBeispiel);
    check("Determinismus: die Ausstattung baut doppelt byte-gleich", shaVon(buildCase(AUS_CASES[0])) === shaVon(buildCase(AUS_CASES[0])));
    check(
        "ov-Kanal der Ausstattung: fuelle 0,2 baut eine andere Feuerstelle", // weniger Scheite, kleinere Flamme
        ausIst["feuerstelle-s1-L0"].sha256 !== ausIst["feuerstelle-s1-L0-ov_fuelle"].sha256
    );
    goldenWand(golden("ausstattung"), 6, ausIst, check, AUS_CASES.length, "buildInstance(ausstattung, seed, lod, ov?) — sha256 je Fall");

    // 11) PLATTFORM-PROBE (S1 Wände, scripts/lib/plattform-probe.cjs): jeder Probe-Fall baut noch einmal, während die
    //     Transzendenten von Math um ±1 ULP verschoben rechnen. Math.pow kippt kein Byte (die gemessene Klasse, V8 12.4
    //     der CI ≠ V8 13.6 lokal); die übrigen halten ihre Ratsche (spec/asset-contract/plattform-ratsche.json). Die
    //     Häuser (v6): Samen 7 × alle drei Stufen × jede vierte Kultur — ein voller Bau kostet ~34 s, die Probe baut
    //     ~20-mal; die Ausstattung (v6a, gerastert): jeder Fall.
    const PROBE_HAUS = CASES.filter((c) => !c.ov && c.seed === 7 && KULTUREN.indexOf(c.rezeptId) % 4 === 0);
    for (const [satz, faelle] of [["v6", PROBE_HAUS], ["v6a", AUS_CASES]])
        await kernProbe(satz, "fachwerk-core.js", "__fachwerkCore", faelle, check, { finger: fingerprint, weg: disposeGroup });

    // 12) DER BOGEN IM VERBAND
    bogenLinse();

    // 13) DIE POSEN DES GENESIS-ORTS
    posenLinse();

    wandEnde(errs, "der Haus-Asset-Vertrag steht (cv:6) — jede Prüfung oben.");
})();
