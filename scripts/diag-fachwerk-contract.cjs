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
// Kern-Primitive (bauRezept({bauweise: name}, null, LAB_SEED) frisch → stapelBau/HAUS.build/
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
const { fingerabdruck, goldenSelbsttest, fallSchluessel: caseKey, goldenWand, kernProbe } = require("./lib/plattform-probe.cjs");
const { studioKern, pruefer, taeterFaelle, abwandlung, ROOT: root, path } = require("./lib/welt-boot.cjs");
const fingerprint = (g) => fingerabdruck(g, false, true); // die v3–v5-Form samt Fernform der NUR-WURF-Stufe

// die Goldens der Häuser und der AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen — dasselbe Gesetzbuch, eigene Goldens)
const golden = (n) => path.join(root, "spec/asset-contract/v6/golden", n + ".json");

const { errs, check, wandEnde } = pruefer();
const FC = studioKern("fachwerk-core.js", "__fachwerkCore");

// DIE LEUCHTDICHTE der Vertex-Farbe i × Stoff-Farbe mc (Rec. 709; `f` liest den Kanal — die Welt roh, der Selbsttest als sRGB):
// die Albedo der Häuser (flächengewichtet) und der Ausstattung (je Stoff) lesen sie EINMAL
// `s` = Werte je Ecke: die Gestalt trägt die Farbe im Eck-Format (half × 4, `_eckForm`)
const luma = (C, i, mc, f = (x) => x, s = 3) =>
    0.2126 * f(C[i * s]) * mc.r + 0.7152 * f(C[i * s + 1]) * mc.g + 0.0722 * f(C[i * s + 2]) * mc.b;

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
//    FRISCHER bauRezept-Ableitung statt der eingefrorenen PRESETS (die
//    Probe drift-wacht beide Nähte: Stufen-Komposition UND Rezept-Ableitung). ──
function shellPfad(name, seed, stufe) {
    const kp = FC.bauRezept({ bauweise: name }, null, FC.LAB_SEED);
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
        const hp2 = Object.assign({}, p, { nur: turm || p.arm ? { moebel: false } : {} });
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
            if (o.userData?.door && typeof o.userData.side === "number") fluegelL.push(o);
        });
        const tuerWraps = [];
        for (const Lf of fluegelL) {
            const lg = {};
            FC.bakeLOD(Lf, p.col, lg, 0, true);
            // das Blatt sitzt am Scharnier: das haus-lokale Gitter rückt um das Scharnier zurück, die Hülle steht daran
            for (const rk in lg)
                if (lg[rk]?.pos)
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
        geoms.__decken = FC.deckenZeile(FC.masseVon(st), FC.raumVon(st, p.col)); // der Innen-Stoff liest die Decken (w28-innenlicht)
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
    if (B.pfeiler && S.length) for (const [s, pf] of [
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
            if (o.userData?.sturz) sturz = true;
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
        if (ov?.arkade && !laube && !sturz)
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
    const L = GK.lageGrund(W.__samenCore.EINGANG, W.SimplexNoise);
    const plan = W.__fachwerkCore.ortPlan(W.__fachwerkCore.genesisLayout(FC.genesisSaat(W.__samenCore.EINGANG), welten), { x: 0, z: 0 }, GK.ortCtx(L));
    const Lb = Object.assign({}, L, { erdbau: GK.erdbauNormal(plan.erdbau) });
    const boden = { hoeheAt: (x, z) => GK.hoehe(Lb, x, z, true) };
    const mit = (n, wert) => abwandlung(plan.stationen.find((q) => q.name === n))("", wert);
    const fehler = taeterFaelle(
        [
            // die fern-Station steht 25 m vor dem Fels des Plans; die beiden Stände davor sind gepflanzte Proben des Urteils:
            // BÜHNE: ein Stand im Gürtel abseits jedes Wegs, ein fernes Haus hinter der Wiese, dessen Sichtlinie den Feld-Wurf quert
            { name: "eine Kamera im Gürtel", z: mit("S1", { ego: { x: -32.6, z: 28.1 } }), muss: /^KAMERA im Gürtel/ },
            { name: "eine Sichtlinie über Feld-Wurf", z: mit("S1", { blick: { x: -81, z: 70 }, ziele: [{ art: "haus", x: -81, z: 70, band: "fern" }] }), muss: /^SICHTLINIE über Feld-Wurf/ },
            { name: "eine fern-Station in 25 m", z: mit("S7f", { ego: { x: plan.formationen[0].x + 25, z: plan.formationen[0].z } }), muss: /^ABSTAND fels fern in 25\.0 m/ },
        ],
        (s) => FC.genesisPose(plan, s, false, boden).befunde
    );
    check("POSEN SELBST-TEST: die gepflanzten Täter je ROT beim Namen, genesisLayout wirft laut (eine Welt fehlt · eine ohne Slot)", !fehler.length && wirft(welten.slice(1)) && wirft(welten.concat(["schwarm"])), fehler.join(" · "));
    const P = FC.genesisPosen(plan, boden);
    console.log(P.text.replace(/^/gm, "  "));
    check(`POSEN: jede Station hält ihre Pose (${P.posen.length - P.fehl.length}/${P.posen.length}, Plan-Hash ${FC.ortHash(plan)}; leer ist ROT)`, P.posen.length > 0 && !P.fehl.length, P.fehl.map((u) => u.text).join(" | "));
}

// ── DIE HASPEL (brunnen-haspel, mensch.fahrzeug.maschine#1): die Welle mit Kurbel des Ziehbrunnens ist Gesetz des Kerns
//    (fachwerk `HASPEL`), ihr Verb `kurbeln` hängt im EINEN Klick des Wirts. Je Brunnen (Gestalt 1 und 2, dazu Gestalt 1 mit
//    Fülle 0,2 und Größe 1,2):
//    H1 DIE TEILE: Stufe 0 und 1 tragen die drei benannten Teile der Maschine (kurbel · seil · eimer, `__schwenk.welle`);
//    H2 DER KURBELWEG IM WIRT (stamm `ladeKlasse`, ein Wirt im vm): der Eintrag des Brunnens trägt seine Teile als Slots, der
//       Klick nennt das Verb (H3), die Hand hält es (`_kurbeln` je 0,2 s, `_tickHaspel` je 1/60 s), bis der
//       Eimer geschöpft hat und wieder oben steht. Je Bild gemessen an den Instanz-Matrizen: der Kurbelwinkel aus der Matrix der
//       Kurbel, der Hub aus der des Eimers — |Hub − r·Δφ| über den ganzen Weg, r gemessen an der GEZEICHNETEN Trommel (Bauch +
//       Seil); das Seil endet am Bügel; der Eimer fasst Wasser erst unter dem Spiegel;
//    H3 DER KLICK: der Weg läuft durch den EINEN Dispatcher des Wirts (`tryMouseBreak`: gedrückt nennt er kurbeln, gehalten
//       wiederholt er es und ruft `_kurbeln`) — nie an ihm vorbei.
//    SELBST-TEST: der Eimer an der Fülle (die Teil-Matrix des Eimers bleibt die Ruhe) und ein Wirt ohne Verb am Brunnen sind je
//    ROT beim Namen. Leser: die Station karte2.mensch.fahrzeug.maschine#1 (hub · folgt), der Koordinator vor dem Landen.
function haspelLinse() {
    const stammLib = require("./lib/stamm.cjs");
    const { AnazhRealm: A, ctx: W } = stammLib.ladeKlasse(root);
    const vm = require("vm");
    const T3 = W.THREE;
    const FALLE = [
        { name: "brunnen s1", seed: 1, ov: undefined },
        { name: "brunnen s2", seed: 2, ov: undefined },
        { name: "brunnen s1 fülle 0,2 · größe 1,2", seed: 1, ov: { fuelle: 0.2, groesse: 1.2 } },
    ];
    // die Teile einer gebauten Stufe: Name → Gruppe (die bewegte Gruppe des Kerns)
    const teileVon = (g) => {
        const t = {};
        g.traverse((o) => {
            const w = o.userData && o.userData.__schwenk && o.userData.__schwenk.welle;
            if (w) t[w] = o;
        });
        return t;
    };
    // die Lage einer Gruppe in der Gestalt: [min y, max y] aller Ecken (die Gruppe steht an ihrem Punkt)
    const spanne = (o, m4) => {
        let lo = Infinity,
            hi = -Infinity;
        o.updateMatrixWorld(true);
        const v = new THREE.Vector3();
        o.traverse((x) => {
            if (!x.isMesh) return;
            const P = x.geometry.attributes.position;
            for (let i = 0; i < P.count; i++) {
                v.fromBufferAttribute(P, i).applyMatrix4(x.matrixWorld);
                if (m4) v.applyMatrix4(m4);
                lo = Math.min(lo, v.y);
                hi = Math.max(hi, v.y);
            }
        });
        return [lo, hi];
    };
    // der größte Abstand einer Ecke von einer Achse (Ecken in `fx`), in der Lage der Gestalt
    const radial = (o, fx, ab) => {
        let r = 0;
        o.updateMatrixWorld(true);
        const v = new THREE.Vector3();
        o.traverse((x) => {
            if (!x.isMesh) return;
            const P = x.geometry.attributes.position;
            for (let i = 0; i < P.count; i++) {
                v.fromBufferAttribute(P, i).applyMatrix4(x.matrixWorld);
                if (fx(v)) r = Math.max(r, ab(v));
            }
        });
        return r;
    };
    // der Wickel-Halbmesser der GEZEICHNETEN Trommel: der Bauch (die Ecken der Kurbel um die Mitte, |x| < 0,4 m — die Trommel
    // trägt 0,9 m um x 0, Arm und Griff stehen außen an den Pfosten — um die Achse yH) + der Halbmesser des gezeichneten Seils
    // (um seine Lot-Linie x 0,05)
    const wickelR = (kurbel, seil, yH) =>
        radial(kurbel, (v) => Math.abs(v.x) < 0.4, (v) => Math.hypot(v.y - yH, v.z)) +
        radial(seil, () => true, (v) => Math.hypot(v.x - 0.05, v.z));
    // DER KURBELWEG eines Brunnens im Wirt: `mut` pflanzt einen Täter (der Eimer an der Fülle · kein Verb am Brunnen)
    const weg = (fall, mut) => {
        const v = [];
        const g0 = FC.buildInstance("brunnen", fall.seed, 0, fall.ov);
        const tl = teileVon(g0);
        const H = FC.HASPEL;
        const r = wickelR(tl.kurbel, tl.seil, H.yH);
        const sp0 = { eimer: spanne(tl.eimer), seil: spanne(tl.seil) };
        const wirt = vm.runInContext("new AnazhRealm()", W);
        const st = wirt.state;
        wirt._weltUhrNeu(0);
        st.archInstanceGroups = new Map();
        // die gezeichnete Stufe (`instSlots`) und die Stufe des Bands im Übergang (`instSlotsBand`, sie kommt mitten im Weg)
        const stufe = (art) => {
            const s = [];
            for (const teil of ["kurbel", "seil", "eimer", "aufbau"]) {
                const mats = [new T3.Matrix4()];
                const g = {
                    welle: teil === "aufbau" ? null : { teil },
                    mesh: {
                        setMatrixAt: (i, m) => mats[i].copy(m),
                        getMatrixAt: (i, m) => m.copy(mats[i]),
                        instanceMatrix: {},
                        boundingSphere: null,
                    },
                    mats,
                };
                st.archInstanceGroups.set(art + teil, g);
                s.push({ key: art + teil, slot: 0 });
            }
            return s;
        };
        const slots = stufe("f:brunnen:");
        const bandSlots = stufe("f:brunnen-band:");
        let bandFehl = 0;
        const entry = { id: "haspel-" + fall.seed, type: "brunnen", instSlots: slots, studioOv: fall.ov };
        wirt._foundryPresetForEntry = () => "brunnen";
        if (mut === "kein-verb") wirt._haspelVon = () => null;
        // der Leib, der nur die gezeichnete Stufe sammelt (vor brunnen-haspel 2): das Band blendet in der Ruhe-Lage über
        if (mut === "band")
            wirt._haspelLeib = function (e) {
                const b = e.instSlotsBand;
                e.instSlotsBand = null;
                try {
                    return A.prototype._haspelLeib.call(this, e);
                } finally {
                    e.instSlotsBand = b;
                }
            };
        if (mut === "fuelle") {
            const K = W.__fachwerkCore;
            const echt = K.haspelTeilMatrix;
            wirt._haspelSetzen = function (e, phi) {
                K.haspelTeilMatrix = (M, teil, p) => echt(M, teil, teil === "eimer" ? M.phiF : p);
                try {
                    return A.prototype._haspelSetzen.call(this, e, phi);
                } finally {
                    K.haspelTeilMatrix = echt;
                }
            };
        }
        wirt._haspelLeib(entry);
        const M = wirt._haspelMass(entry);
        const mat = (teil) => st.archInstanceGroups.get("f:brunnen:" + teil).mats[0];
        let fehlHub = 0,
            fehlSeil = 0,
            wegRad = 0,
            phiAlt = 0,
            umkehr = 0,
            nassFrueh = 0,
            maxHub = 0,
            richtung = -1,
            verb = null;
        // DER KLICK (H3): der EINE Dispatcher `tryMouseBreak` — das Fadenkreuz trifft den Brunnen 1,1 m vor der Hand (kein Bogen,
        // kein Leib, kein Gerät der Arena); gedrückt nennt er das Verb, gehalten wiederholt er es im Takt der Hand (0,2 s)
        st.player = {};
        st.playerMesh = null;
        wirt._heldBogenRecipe = () => null;
        wirt._geraetVon = () => false;
        wirt._pickArchitectureAtCrosshair = () => ({ entry, point: { x: 0, y: 1.2, z: 0.5 } });
        wirt._fadenkreuzStrahl = () => ({ o: { x: 0, y: 1.6, z: 1.5 }, d: { x: 0, y: 0, z: -1 } });
        wirt._strikeArchitecture = () => false;
        let gekurbelt = false;
        wirt._kurbeln = function (e) {
            gekurbelt = true;
            return A.prototype._kurbeln.call(this, e);
        };
        for (let bild = 0; bild < 60 * 120 && umkehr < 2; bild++) {
            if (bild % 12 === 0) {
                gekurbelt = false;
                try {
                    wirt.tryMouseBreak(bild ? st.player._mausVerb : undefined);
                    verb = st.player._mausVerb;
                } catch (e) {
                    verb = "wirft: " + String(e && e.message).slice(0, 80);
                }
                if (verb !== "kurbeln" || !gekurbelt) break;
                const z = entry._haspel;
                if (z.richtung !== richtung) {
                    umkehr++;
                    richtung = z.richtung;
                    // am Grund beginnt der Übergang: die Stufe des Bands kommt dazu (wie `_archInstancePlace` sie anlegt)
                    if (umkehr === 1) {
                        entry.instSlotsBand = bandSlots;
                        wirt._haspelLeib(entry);
                    }
                }
                const L = W.__fachwerkCore.haspelLage(M, z.phi);
                if (z.wasser > 0 && !(L.yE + M.innenY < H.spiegel + 1e-9) && !entry._nassGesehen) nassFrueh++;
                if (z.wasser > 0) entry._nassGesehen = true;
            }
            wirt._weltUhrNimm((bild + 1) / 60);
            wirt._tickHaspel(1 / 60);
            const e = mat("kurbel").elements;
            const phi = -Math.atan2(e[6], e[5]);
            let d = phi - phiAlt;
            d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
            wegRad += Math.abs(d);
            const dphi = (phiAlt = phiAlt + d);
            const hub = mat("eimer").elements[13];
            maxHub = Math.max(maxHub, Math.abs(hub));
            fehlHub = Math.max(fehlHub, Math.abs(hub - r * dphi));
            // das Seil endet am Bügel: Unterkante des Seils = Boden des Eimers + Bügel-Höhe
            const s = sp0.seil[0] * mat("seil").elements[5] + mat("seil").elements[13];
            fehlSeil = Math.max(fehlSeil, Math.abs(s - (sp0.eimer[0] + hub + H.buegelH)));
            // das Band zeigt dasselbe φ wie die gezeichnete Stufe (beide Stufen tragen dieselbe Ruhe)
            if (entry.instSlotsBand)
                for (const teil of ["kurbel", "seil", "eimer"]) {
                    const a = mat(teil).elements,
                        b = st.archInstanceGroups.get("f:brunnen-band:" + teil).mats[0].elements;
                    for (let i = 0; i < 16; i++) bandFehl = Math.max(bandFehl, Math.abs(a[i] - b[i]));
                }
        }
        g0.traverse((o) => o.geometry && o.geometry.dispose());
        if (verb !== "kurbeln") v.push(`kein Verb am Brunnen: der Klick nennt „${verb}“ (${fall.name})`);
        else {
            if (umkehr < 2) v.push(`${fall.name}: der Eimer kehrt nicht zweimal um (${umkehr})`);
            // 1 cm über den ganzen Weg: das Raster der Gestalt (2^-12 m an Trommel und Seil) trägt höchstens 0,4 mm in r
            if (fehlHub > 0.01) v.push(`|Hub − r·φ| ${(fehlHub * 100).toFixed(2)} cm > 1 cm (${fall.name})`);
            if (fehlSeil > 0.002) v.push(`das Seil endet ${(fehlSeil * 1000).toFixed(1)} mm neben dem Bügel (${fall.name})`);
            if (nassFrueh) v.push(`der Eimer fasst Wasser über dem Spiegel (${fall.name})`);
            if (!(entry._haspel && entry._haspel.wasser > 0.5)) v.push(`der Eimer schöpft nicht (${fall.name})`);
            if (!entry.instSlotsBand || bandFehl > 1e-6) v.push(`das Band im Übergang zeigt ein anderes φ (Δ ${bandFehl.toExponential(1)}, ${fall.name})`);
        }
        return { v, r, fehlHub, wegRad, maxHub, M, z: entry._haspel, kraft: W.__fachwerkCore.haspelKraft(M, 1, Math.abs(st.gravity)).kurbelN, leer: W.__fachwerkCore.haspelKraft(M, 0, Math.abs(st.gravity)).kurbelN };
    };
    // H1 — die Teile je Stufe
    const ohneTeil = [];
    for (const f of FALLE)
        for (const lod of [0, 1]) {
            const g = FC.buildInstance("brunnen", f.seed, lod, f.ov);
            const t = Object.keys(teileVon(g)).sort().join(",");
            if (t !== "eimer,kurbel,seil") ohneTeil.push(`${f.name} L${lod}: ${t || "keine"}`);
            g.traverse((o) => o.geometry && o.geometry.dispose());
        }
    check("HASPEL H1: jede gezeigte Stufe des Brunnens trägt die Teile der Maschine (kurbel · seil · eimer)", !ohneTeil.length, ohneTeil.join(" · "));
    // H2 — der Kurbelweg im Wirt
    const mess = FALLE.map((f) => weg(f));
    const rot = mess.flatMap((m) => m.v);
    check(
        `HASPEL H2+H3: der Klick (tryMouseBreak) kurbelt, Hub folgt Kurbelweg — ${mess
            .map(
                (m, i) =>
                    `${FALLE[i].name}: |Hub − r·φ| ${(m.fehlHub * 100).toFixed(3)} cm über ${(m.wegRad / (2 * Math.PI)).toFixed(2)} Umdrehungen, r ${(m.r * 100).toFixed(1)} cm (${(2 * Math.PI * m.r).toFixed(3)} m je Umdrehung), Hub ${m.maxHub.toFixed(2)} m, Wasser ${Math.round(m.z.wasser * m.M.volM3 * 1000)} l, Kurbel ${m.leer.toFixed(0)} → ${m.kraft.toFixed(0)} N`
            )
            .join(" · ")}`,
        !rot.length,
        rot.join(" · ")
    );
    // SELBST-TEST — die Täter am ersten Brunnen
    const fuelle = weg(FALLE[0], "fuelle").v;
    const ohne = weg(FALLE[0], "kein-verb").v;
    const band = weg(FALLE[0], "band").v;
    const nennt =
        fuelle.some((s) => /^\|Hub − r·φ\|/.test(s)) &&
        ohne.some((s) => /^kein Verb am Brunnen/.test(s)) &&
        band.length === 1 &&
        /^das Band im Übergang/.test(band[0]);
    check("HASPEL SELBST-TEST: der Eimer an der Fülle, ein Wirt ohne Verb am Brunnen und ein Band in der Ruhe-Lage sind je ROT beim Namen", nennt, `Fülle: ${fuelle.join(" · ") || "grün"} ‖ ohne Verb: ${ohne.join(" · ") || "grün"} ‖ Band: ${band.join(" · ") || "grün"}`);
}

// ── DAS RAUM-LICHT (w28-innenlicht, Familie siedlung.K1): die sechste Zahl der Decken-Zeile ist der mittlere Tageslicht-Quotient
//    des Körpers (fachwerk `raumLicht`), der Dach-Pool des Wirts reicht sie dem EINEN Umgebungs-Term und der Kamera
//    (`_dachTakt` → `_raumHimmel`, `_raumBlendeTakt`). Je Kultur am Mass-Bau:
//    R1 jede Decke trägt elf Zahlen (D, die vier Seiten des Sonnen-Rückstrahls und das Feld des Messers, fachwerk `raumSonne`), D auf dem Raster, 0 < D ≤ 0,2 (ein Körper mit Decke und ohne Öffnung wäre ein Raum ohne Licht);
//    R2 MUTANTEN am selben Bau: ohne Öffnung D = 0 an jeder Decke · jede Öffnung doppelt so breit hebt D an jeder Decke · dichtes
//       Glas (Durchlass 0) senkt die Summe · heller Rückwurf (0,8) hebt D an jeder Decke · eine Öffnung an der Wand zweier Körper zählt keinem.
//    Der Täter steht beim Namen: Kultur · Körper-Index · D.
function raumLinse() {
    const R = FC.RAUM_LICHT,
        rot = [],
        mut = [];
    let n = 0,
        min = 1,
        max = 0;
    const summe = (z) => z.reduce((s, d) => s + d[5], 0);
    for (const k of KULTUREN) {
        const B = FC.massBau(FC.hausParams(FC.PRESETS[k], {})),
            Z = FC.deckenZeile(B.masse, B.raum);
        if (!Z.length) rot.push(k + " ohne Decke");
        Z.forEach((d, i) => {
            n++;
            const D = d[5];
            if (d.length !== 11 || d.slice(6).some((v) => !(v >= 0 && v <= 1)) || !(D > 0 && D <= 0.2) || Math.round(D * R.raster) !== D * R.raster) rot.push(`${k}#${i} D ${D}`);
            else [min, max] = [Math.min(min, D), Math.max(max, D)];
        });
        const mit = (o) => FC.deckenZeile(B.masse, Object.assign({}, B.raum, o));
        const zu = mit({ oeffnungen: [] }),
            breit = mit({ oeffnungen: B.raum.oeffnungen.map((o) => Object.assign({}, o, { w: o.w * 2 })) }),
            dicht = mit({ glas: 0 }),
            hell = mit({ wand: 0.8, boden: 0.8 });
        if (zu.some((d) => d[5] !== 0)) mut.push(k + " ohne Öffnung hell");
        if (breit.some((d, i) => !(d[5] > Z[i][5]))) mut.push(k + " doppelte Öffnung hebt nicht");
        if (!(summe(dicht) < summe(Z))) mut.push(k + " dichtes Glas senkt nicht");
        if (hell.some((d, i) => !(d[5] > Z[i][5]))) mut.push(k + " heller Rückwurf hebt nicht");
        if (zu.some((d) => d.slice(6).some((v) => v !== 0))) mut.push(k + " ohne Öffnung Sonne im Raum");
        if (!Z.some((d) => d.slice(6).some((v) => v > 0))) mut.push(k + " keine Seite trägt Sonne");
    }
    // die Wand zwischen zwei Körpern sieht keinen Himmel: zwei Kästen Wand an Wand, EINE Öffnung in der gemeinsamen Wand, eine außen
    const zwei = [
        { art: "haupt", x0: 0, x1: 4, z0: 0, z1: 4, eY: 3, egTop: 3 },
        { art: "anbau", x0: 4, x1: 7, z0: 0, z1: 4, yLow: 2.5 },
    ];
    const raum = (o) => ({ oeffnungen: o, glas: 0.6, wand: 0.3, boden: 0.2 });
    const innen = FC.deckenZeile(zwei, raum([{ cx: 4, cy: 1, cz: 2, w: 1, h: 2, perp: "x", glas: 0 }])),
        aussen = FC.deckenZeile(zwei, raum([{ cx: 0, cy: 1, cz: 2, w: 1, h: 2, perp: "x", glas: 0 }]));
    if (innen.some((d) => d[5] !== 0)) mut.push("Öffnung zwischen zwei Körpern zählt: " + innen.map((d) => d[5]).join(" · "));
    // die Öffnung in der Wand −x trägt die Seite −x (Index 7) und keine andere
    if (!(aussen[0][7] > 0) || aussen[0][6] + aussen[0][8] + aussen[0][9] !== 0) mut.push("Sonnen-Seite falsch: " + aussen[0].slice(6).join(" · "));
    if (!(aussen[0][5] > 0) || aussen[1][5] !== 0) mut.push("Öffnung außen zählt dem falschen Körper: " + aussen.map((d) => d[5]).join(" · "));
    // R3 GEZEICHNET = GELESEN (der Innen-Stoff): am gebauten Haus der Stufe 0 tragen die Wand-Flächen, die in einen Körper mit Decke
    // schauen (`innenAn`, dieselbe Regel wie der Bake), im Median die Zahl, die das Raum-Licht als Rückwurf der Wand liest
    // (`raumVon`), bis auf Kontakt-AO und Brett-Ton (0,6–1,15). MUTANT: liest der Raum die Außen-Zahl der Rolle, reißt das Band.
    const stoff = [];
    for (const k of ["alpenchalet", "schwarzwald"]) {
        const p = FC.hausParams(FC.PRESETS[k], {});
        p.seed = 7;
        const g = FC.buildInstance(k, 7, 0),
            rows = g.userData.__huelle.decken,
            raum = FC.raumVon({ H: { dims: {} } }, p.col),
            aussen = FC.RAUM_LICHT && 0.2126 * FC._colFor("blockholz", p.col)[0] + 0.7152 * FC._colFor("blockholz", p.col)[1] + 0.0722 * FC._colFor("blockholz", p.col)[2],
            lese = FC.massBau(p).raum.wand,
            L = [];
        g.updateMatrixWorld(true);
        g.traverse((o) => {
            const A = o.geometry && o.geometry.attributes;
            if (!A || !A.color || !A.normal) return;
            for (let v = 0; v < A.position.count; v++) {
                if (Math.abs(A.normal.getY(v)) > 0.3) continue;
                const P = [A.position.getX(v), A.position.getY(v), A.position.getZ(v)],
                    N = [A.normal.getX(v), A.normal.getY(v), A.normal.getZ(v)];
                if (P[1] < 0.6 || !FC.innenAn(P, N, rows, null)) continue;
                L.push(0.2126 * A.color.getX(v) + 0.7152 * A.color.getY(v) + 0.0722 * A.color.getZ(v));
            }
        });
        disposeGroup(g);
        L.sort((x, y) => x - y);
        const med = rang(L),
            im = (z) => med / z >= 0.6 && med / z <= 1.15;
        void raum;
        if (!(L.length > 200) || !im(lese)) stoff.push(`${k}: ${L.length} Innen-Ecken, Median ${med && med.toFixed(3)} gegen gelesen ${lese.toFixed(3)}`);
        if (im(aussen)) stoff.push(`${k}: der Mutant (Außen-Zahl ${aussen.toFixed(3)}) bleibt im Band — die Linse ist blind`);
    }
    check("Raum-Licht R3: gezeichnet = gelesen — die Innenwand trägt den Ton, den das Raum-Licht liest (Mutant Außen-Zahl ROT)", !stoff.length, stoff.join(" · "));
    check(`Raum-Licht R1: ${n} Decken in ${KULTUREN.length} Kulturen tragen D ${(min * 100).toFixed(2)}–${(max * 100).toFixed(2)} % auf dem Raster`, !rot.length, rot.slice(0, 6).join(" · "));
    check("Raum-Licht R2 Mutanten: ohne Öffnung dunkel · doppelte Öffnung · dichtes Glas · heller Rückwurf · Wand zweier Körper", !mut.length, mut.slice(0, 6).join(" · "));
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
    //     EINE HÜLLE JE HAUS (eine-huelle): JEDE Stufe, auch die NUR-WURF-Stufe — das ferne Haus bestellt nur sie, und der Wirt
    //     stellte ihm vier Wände aus der Tür-Zeile auf (kam die Hülle der gezeigten Stufe, rückten die Stände der Bewohner). Am
    //     Stand davor fällt jede Kultur an ihrer Stufe 3 beim Namen (64 von 64); Selbsttest: eine Stufe 3 ohne Hülle wird rot.
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
                    if (l === 0) continue;
                    if (!H[`${k}-s${s}-L${l}`] || H[`${k}-s${s}-L${l}`].join(",") !== z0) bruch.push(`${k}/${s}/L${l}`);
                }
            }
        return bruch;
    };
    const hb = huellenBruch(huellen);
    // in der EINEN Hüllen-Form (rolle fest), 32 Kulturen × 2 Samen
    check("Hülle des Gesetzbuchs: JEDE Stufe (auch die NUR-WURF-Stufe) trägt die Solids der Stufe 0 byte-gleich", hb.length === 0, `${hb.length} Brüche: ${hb.slice(0, 4).join(" ")}`);
    {
        const korrupt = Object.assign({}, huellen);
        korrupt["alemannisch-s7-L1"] = [-4, 0, -5, 4, 9, 5]; // die Stufen-Bounding-Box statt der Solids
        check("SELBST-TEST: eine Stufe mit ihrer Bounding-Box statt der Solids wird rot", huellenBruch(korrupt).length === 1);
        // der Stand vor eine-huelle: die NUR-WURF-Stufe ohne Hülle — jede Kultur fällt an ihr beim Namen
        const fernLeer = Object.assign({}, huellen);
        for (const k of Object.keys(fernLeer)) if (k.endsWith("-L3")) fernLeer[k] = null;
        const fb = huellenBruch(fernLeer);
        check("SELBST-TEST: die NUR-WURF-Stufe ohne Hülle wird rot, jede Kultur beim Namen", fb.length === KULTUREN.length * SEEDS.length && fb.every((b) => b.endsWith("/L3")), `${fb.length} von ${KULTUREN.length * SEEDS.length}`);
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

    // 4b) DAS KREUZ STEHT VOR DER SCHEIBE, VON BEIDEN SEITEN (licht-eine-skala, windowSash): vor jeder großen Glas-Fläche des
    // Flügels liegt in 2–11 mm eine parallele Fläche des Kreuzes (Scheibe ±12,5 mm in Kreuz ±22,5 mm; der Rahmen liegt 12,5 mm
    // davor und zählt nicht). Bis 5ee7c2ce lag die Scheibe um −12 mm: auf einer Seite 2 mm VOR dem Kreuz — das wache Glas
    // zeichnete nachts über die Sprosse (Dorf Nacht: Kreuz-Kontrast am Bild 0,023, mit dem Schnitt 0,168; main 0,034).
    // Die Schwellen sind Ratschen AUS der Messung (L0 Kasten: 4 von 12 Dreiecken sind große Flächen, Ist 0,333; L1 Ist 0,861–0,868;
    // der Rest ist das Oberlicht der Tür ohne Kreuz). Der Mutant „Scheibe an der alten Lage“ fällt ROT (Ist ≤ 0,03).
    {
        const dreiecke = (o, verschiebe) => {
            const P = o.geometry.attributes.position, ix = o.geometry.index, L = []; // prettier-ignore
            const N = ix ? ix.count : P.count;
            const v = (i) => new THREE.Vector3().fromBufferAttribute(P, i);
            for (let i = 0; i < N; i += 3) {
                const e = (ix ? [ix.getX(i), ix.getX(i + 1), ix.getX(i + 2)] : [i, i + 1, i + 2]).map(v);
                const nl = e[1].clone().sub(e[0]).cross(e[2].clone().sub(e[0]));
                if (nl.length() < 1e-8) continue;
                nl.normalize();
                // der Mutant: die Scheibe um `verschiebe` längs ihrer Achse (beide Flächen in dieselbe Richtung)
                if (verschiebe) for (const p of e) p.addScaledVector(nl, (nl.x + 2 * nl.z + 4 * nl.y > 0 ? 1 : -1) * verschiebe);
                for (const p of e) p.applyMatrix4(o.matrixWorld);
                const n = e[1].clone().sub(e[0]).cross(e[2].clone().sub(e[0])).normalize();
                L.push({ n, c: e[0].clone().add(e[1]).add(e[2]).multiplyScalar(1 / 3), r: Math.max(e[0].distanceTo(e[1]), e[1].distanceTo(e[2]), e[2].distanceTo(e[0])) }); // prettier-ignore
            }
            return L;
        };
        const kreuzDeckt = (g, verschiebe = 0) => {
            g.updateMatrixWorld(true);
            const glas = [], rest = []; // prettier-ignore
            g.traverse((o) => {
                if (!o.geometry || !o.material) return;
                if (o.material.opacity < 1) glas.push(...dreiecke(o, verschiebe));
                else rest.push(...dreiecke(o, 0));
            });
            const Z = 0.5, G = new Map(); // prettier-ignore
            for (const q of rest) {
                const k = Math.floor(q.c.x / Z) + "," + Math.floor(q.c.y / Z) + "," + Math.floor(q.c.z / Z);
                (G.get(k) || G.set(k, []).get(k)).push(q);
            }
            let gedeckt = 0;
            const d = new THREE.Vector3();
            for (const t of glas) {
                const b = [Math.floor(t.c.x / Z), Math.floor(t.c.y / Z), Math.floor(t.c.z / Z)];
                let ok = false;
                for (let i = -2; i <= 2 && !ok; i++)
                    for (let j = -2; j <= 2 && !ok; j++)
                        for (let k = -2; k <= 2 && !ok; k++)
                            for (const q of G.get(b[0] + i + "," + (b[1] + j) + "," + (b[2] + k)) || []) {
                                if (q.n.dot(t.n) < 0.99) continue;
                                const vor = d.copy(q.c).sub(t.c).dot(t.n);
                                if (vor <= 0.002 || vor > 0.011) continue;
                                if (Math.sqrt(Math.max(0, d.lengthSq() - vor * vor)) <= t.r) ok = true;
                                if (ok) break;
                            }
                if (ok) gedeckt++;
            }
            return glas.length ? gedeckt / glas.length : 0;
        };
        const SOLL = [0.3, 0.8], bruch = [], mutant = [], ist = []; // prettier-ignore
        for (const k of ["alemannisch", "tudor"])
            for (const l of [0, 1]) {
                const a = kreuzDeckt(FC.buildInstance(k, 7, l));
                const m = kreuzDeckt(FC.buildInstance(k, 7, l), 0.012);
                ist.push(`${k} L${l} ${a.toFixed(3)} (Mutant ${m.toFixed(3)})`);
                if (!(a >= SOLL[l])) bruch.push(`${k} L${l}: nur ${a.toFixed(3)} der Glas-Dreiecke haben das Kreuz 2–11 mm vor sich (Soll ≥ ${SOLL[l]}) — die Scheibe steht vor dem Kreuz (fachwerk windowSash)`); // prettier-ignore
                if (!(m <= 0.1)) mutant.push(`${k} L${l}: die Scheibe um 12 mm verschoben bleibt GRÜN (${m.toFixed(3)})`);
            }
        check("DAS KREUZ STEHT VOR DER SCHEIBE, VON BEIDEN SEITEN (windowSash, L0 und L1)", !bruch.length, bruch.length ? bruch.join(" ‖ ") : ist.join(" · ")); // prettier-ignore
        check("DAS KREUZ VOR DER SCHEIBE SELBST-TEST: die Scheibe an der alten Lage (12 mm verschoben) ist ROT", !mutant.length, mutant.join(" ‖ ")); // prettier-ignore
    }

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

    // 7b) DIE WAND DES STILS (w28-putz-wand): malt ein Stil das Gerüst in den Stoff der Wand (H.rahmen == H.raum), baut keine Stufe
    //     Gerüst unter der Farbe (Riegel · Streben · Zimmermann, in der Flächen-Stufe der Ständer-Ring), und die Felder stehen als
    //     Platten in EINEM Ton: kein Teil mit der Patina je Brett, höchstens jedes fünfte im Stein-Maß (größte Fläche < 0,05 m²) —
    //     außer der Stil zeigt Backstein. Vorher 20 Rezepte (griechisch: 61 % der L0). Selbsttest: das Fachwerk als Putz-Stil.
    //     DER FREMDE VERBAND (haus-ziegel-putz): Putz, Lehmputz und Backstein tragen ihren Ton im Stoff, nie als Patina je Teil
    //     (fachwerk `tonImStoff`) — die Fläche im Verband der Flächen-Stufe trägt keine Farbe je Ecke mehr, an der der Fühler
    //     „Patina“ sie nennt. Der Verband unter der Farbe steht seither im Stoff des Teils: ein Wand-Teil, dessen Stoff eine andere
    //     Zeile des Verband-Gesetzes webt als der Stoff der Wand (`H.raum`), ist umgemalter Verband.
    const wandZeile = (rolle) => Math.max(0, FC.VERBAND_GESETZ.reihe.indexOf(FC.VERBAND_GESETZ.rolle[rolle] || "?"));
    const wandBefund = (K, rezepte) => {
        const bruch = [];
        let n = 0;
        for (const k of rezepte)
            for (const stufe of [0, 1]) {
                const nur = stufe ? { gelaende: false, innenwaende: false, treppe: false, moebel: false } : {};
                const H = K.HAUS(THREE, K.mat, Object.assign(K.hausParams(K.PRESETS[k], null), { seed: 7, nur, flaechig: stufe }));
                const teile = (s) => H.subsystems[s].children.filter((o) => o.isMesh);
                if (H.rahmen !== H.raum) continue;
                n++;
                const ger = ["riegel", "streben", "zimmermann", "geruest"].slice(0, 3 + stufe).filter((s) => teile(s).length);
                const gef = teile("gefache");
                const patina = gef.filter((o) => (o.geometry.attributes.color || { array: [] }).array.some((v) => v !== 1)).length;
                const stein = gef.filter((o) => { const d = new THREE.Box3().setFromBufferAttribute(o.geometry.attributes.position).getSize(new THREE.Vector3()).toArray().sort((x, y) => y - x); return d[0] * d[1] < 0.05; }).length; // prettier-ignore
                const fremd = gef.filter((o) => { const z = (o.material && o.material.userData && o.material.userData.__verband) || 0; return z > 0 && z < FC.VERBAND_GESETZ.reihe.length && z !== wandZeile(H.raum); }).length; // prettier-ignore
                const verband = H.raum !== "backstein" && (patina || fremd || stein > 0.2 * gef.length);
                if (ger.length || verband || (H.grundriss !== "rund" && !gef.length))
                    bruch.push(`${k} L${stufe}: Gerüst [${ger}] · Verband ${!!verband} (von ${gef.length} Wand-Teilen ${patina} mit Patina, ${fremd} in fremdem Verband, ${stein} im Stein-Maß) unter „${H.raum}“`); // prettier-ignore
            }
        return { bruch, n };
    };
    {
        const W = wandBefund(FC, KULTUREN);
        check(`DIE WAND DES STILS: kein Gerüst, kein umgemalter Verband unter der Farbe (${W.n / 2} Rezepte × L0/L1)`, W.n === 40 && !W.bruch.length, W.bruch.slice(0, 3).join(" ‖ ")); // prettier-ignore
        // SELBSTTEST ohne Quelltext: ein Fachwerk-Haus, das sich als Putz-Stil ausgibt (sein Gerüst-Stoff heißt wie sein Wand-Stoff) —
        // die Linse nennt Gerüst und Verband beim Namen, in der L0 und in der Flächen-Stufe
        const luege = Object.assign({}, FC, { HAUS: (...a) => { const H = FC.HAUS(...a); H.raum = H.rahmen; return H; } }); // prettier-ignore
        const rot = wandBefund(luege, ["alemannisch"]).bruch.join(" ‖ ");
        check("DIE WAND DES STILS SELBST-TEST: ein Fachwerk-Haus, das sich als Putz-Stil ausgibt, ist ROT beim Namen (Gerüst und Verband, L0 und L1)", /alemannisch L0: Gerüst \[riegel,streben,zimmermann\] · Verband true.*alemannisch L1: Gerüst \[riegel,streben,zimmermann,geruest\] · Verband true/.test(rot), rot.slice(0, 300)); // prettier-ignore
    }

    // 7c) DIE STUFE AM TEIL (w28-putz-wand, die Quote pipeline.K3 an ihrer Wurzel): kein Teilsystem trägt in der Flächen-Stufe
    //     (und die Kuppel in der fernen, Marke `fern`) seine Stufe 0. Gemessen am Haus mit allen Teilen (marokkanisch mit Arkade,
    //     Terrasse, Kuppel; Samen 1): Dreiecke der Stufe / Dreiecke der L0 je Teil gegen sein Soll. Vorher trug jedes 1,00 (die
    //     Terrasse 0,77) — das Gerüst allein hielt die Quote, mit der glatten Wand lagen 78 von 984 Regler-Fällen über ihr, und
    //     gate:regler-wirkt nennt nur das Höchste. Selbsttest: ein Kern, der seinen Teilen die Stufe nicht reicht.
    const STUFE_AM_TEIL = { gefache: 0.7, fenster: 0.75, hof: 0.8, arkade: 0.8, terrasse: 0.7 }; // gemessen 0,64 · 0,63 · 0,70 · 0,68 · 0,57
    const stufeAmTeil = (K) => {
        const tris = (H, s) => { let n = 0; H.subsystems[s].traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return n; }; // prettier-ignore
        const flaeche = { nur: { gelaende: false, innenwaende: false, treppe: false, moebel: false }, flaechig: 1 };
        const [H0, H1, H2] = [{ nur: {} }, flaeche, { nur: { fern: true } }].map((s) => K.HAUS(THREE, K.mat, Object.assign(K.hausParams(K.PRESETS.marokkanisch, { arkade: 1, terrasse: 1, kuppel: 1 }), { seed: 1 }, s))); // prettier-ignore
        const z = Object.entries(STUFE_AM_TEIL).map(([s, soll]) => ({ s, st: 1, soll, q: tris(H1, s) / tris(H0, s) }));
        z.push({ s: "kuppel", st: 2, soll: 0.8, q: tris(H2, "kuppel") / tris(H0, "kuppel") });
        return { z, bruch: z.filter((x) => !(x.q <= x.soll)).map((x) => `${x.s} trägt in der Stufe ${x.st} ${x.q.toFixed(2)} seiner Stufe 0 (Soll ≤ ${x.soll})`) }; // prettier-ignore
    };
    {
        const S = stufeAmTeil(FC);
        check(`DIE STUFE AM TEIL: jedes Teil kürzt in seiner Stufe (${S.z.map((x) => `${x.s} ${x.q.toFixed(2)}`).join(" · ")})`, !S.bruch.length, S.bruch.join(" ‖ ")); // prettier-ignore
        const taub = Object.assign({}, FC, { HAUS: (T, m, p) => FC.HAUS(T, m, Object.assign({}, p, { flaechig: 0, nur: {} })) });
        const rot = stufeAmTeil(taub).bruch.join(" ‖ ");
        check("DIE STUFE AM TEIL SELBST-TEST: ein Kern, der die Stufe nicht an seine Teile reicht, ist ROT beim Namen (jedes der sechs Teile)", /gefache trägt in der Stufe 1 1\.00.*fenster trägt.*hof trägt.*arkade trägt.*terrasse trägt.*kuppel trägt in der Stufe 2 1\.00/.test(rot), rot.slice(0, 300)); // prettier-ignore
    }

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
                    cs = o.geometry.attributes.color.itemSize,
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
                    for (const v of q) l += luma(C, v, mc, farbe, cs) / 3;
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
            bruchRoh.length ? "" : "die Linse misst nichts"
        );
    }

    // 10) DIE AUSSTATTUNG — die Linse der Täter-Klasse „Host-Part-Look": was der Wirt aus
    //     eigenen Teilen baute (Glut-Zylinder, Brett-Tisch, Brunnen-Zylinder), baut jetzt das Gesetzbuch. Die Gestalt hält:
    //     Stufen echt verschieden UND deckungsgleich (L1 ersetzt L0 ohne Sprung: Hülle ± 8 cm), Boden-Anschluss (jedes
    //     Stück taucht unter y = 0), die Glut leuchtet und wirft nie, jede Zahl auf dem Raster 2^-12 (plattformgleich:
    //     V8 rundet sin/cos auf Linux und Windows verschieden — das Raster macht die Bytes gleich), Determinismus, Goldens.
    console.log("\n=== DIE AUSSTATTUNG — Feuerstelle · Marktstand · Brunnen · Laterne · Wandlaterne · Grabstein · Schild · Markstein · Hauszeichen · Marktkreuz (dasselbe Gesetzbuch) ===");
    check(
        `zehn Ausstattungs-Rezepte mit Stufen [0,1,3] und Gestalten (${AUS.join(", ")})`,
        AUS.length === 10 && JSON.stringify(AUS_LODS) === "[0,1,3]" && AUS_CASES.length >= 34
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
        // DIE ALBEDO-LINSE (kartenlos trägt der Vertex): je Stoff die mittlere Luminanz der Vertex-Farbe × Stoff-Farbe —
        // ein Stoff im Band der Natur (0,08–0,45: Holz, Stein, Tuch, Asche nach Kontakt-AO und Erdsaum — schwarz und Creme sind rot), die Glut dunkel
        // (≤ 0,30 — sie leuchtet durch ihren Stoff, eine helle Glut bleicht in der Sonne zu Creme). Glas misst nicht.
        // Je STOFF, nie je Mesh: ein bewegtes Teil (die Haspel des Brunnens, `__schwenk`) bäckt seinen Stoff als eigenes Mesh —
        // gemittelt wird über alle Ecken des Stoffs in der Gestalt (bis brunnen-haspel war jeder Stoff genau ein Mesh).
        const jeStoff = new Map();
        g.traverse((o) => {
            if (!o.isMesh) return;
            const em = o.material && o.material.emissive;
            const seh = o.material.userData && o.material.userData.__seh;
            const col = o.geometry.attributes.color;
            if (col && seh !== "glas" && !nurWurf) {
                const mc = o.material.color;
                const a = jeStoff.get(o.material) || { s: 0, n: 0, seh };
                for (let i = 0; i < col.count; i++) a.s += luma(col.array, i, mc, undefined, col.itemSize);
                a.n += col.count;
                jeStoff.set(o.material, a);
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
        for (const { s, n, seh } of jeStoff.values()) {
            const Y = s / n;
            const k = `${c.rezeptId}:${seh}`;
            albedo[k] = Math.max(albedo[k] || 0, Y);
            const ok = seh === "glut" ? Y <= 0.3 : Y >= 0.08 && Y <= 0.45;
            if (!ok) {
                albedoOk = false;
                albedoBeispiel = albedoBeispiel || `${caseKey(c)} ${seh}: Y ${Y.toFixed(3)}`;
            }
        }
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
    // 10b) DIE GRENZE IM LAND (w28-grenze-im-land, Leiter mensch.macht.grenze #1): der Rand des Reichs eines Herrn als Haupt- und
    //      Läufersteine (fachwerk `grenzeImLand`). Das Band: Hauptsteine 250–600 m voneinander (Kreisarchiv Bodenseekreis), ab
    //      drei je Reich; kein Stein weiter als `laeuferM` vom nächsten; jeder der 360 Punkte des Rands liegt binnen der halben
    //      größten Steinweite (300 m, die Zählung der Station) eines Steins; derselbe Same dieselben Steine; ein Rand ohne freies
    //      Land trägt keinen Stein und zählt jeden Stand.
    {
        const GL = FC.GRENZE_IM_LAND;
        const SG = FC.SIEDLUNG;
        // die Mitte: der Anker der Metropole am Messort stadt-voll (spec/profiband/haushalt.json, `gruendung.anker`) — dort misst die Station
        const ort = JSON.parse(require("fs").readFileSync(path.join(root, "spec", "profiband", "haushalt.json"), "utf8")).messorte.find((m) => m.id === "stadt-voll");
        const [ax, az] = ort.gruendung.anker;
        const ringe = [SG.nHMin, 26, 295, 499].map((nH) => ({ x: ax, z: az, r: FC.siedlungsReich(SG, nH), nH }));
        let bandOk = true;
        let deckOk = true;
        let beispiel = "";
        for (const A of ringe) {
            const G = FC.grenzeImLand(A, 0x5eed + A.nH, null);
            const H = G.steine.filter((s) => s.haupt);
            const U = 2 * Math.PI * A.r;
            const hW = U / H.length;
            const lW = G.abstandM;
            const band = H.length === G.haupt && H.length >= GL.minHaupt && (H.length === GL.minHaupt || (hW >= 250 && hW <= 600));
            let im = 0;
            for (let k = 0; k < 360; k++) {
                const a = (k * Math.PI) / 180;
                const [x, z] = [A.x + A.r * Math.cos(a), A.z + A.r * Math.sin(a)];
                if (G.steine.some((q) => Math.hypot(q.x - x, q.z - z) <= 300)) im++;
            }
            if (!band || lW > GL.laeuferM + 1e-9) bandOk = false;
            if (im !== 360 || G.fehlt) deckOk = false;
            beispiel += ` · nH ${A.nH}: Reich ${A.r.toFixed(0)} m, ${H.length} Haupt (${hW.toFixed(0)} m), ${G.steine.length} Steine (${lW.toFixed(1)} m), Rand ${im}/360`;
        }
        const leer = FC.grenzeImLand(ringe[2], 1, () => false);
        const zwei = [FC.grenzeImLand(ringe[2], 9, null), FC.grenzeImLand(ringe[2], 9, null)].map((g) => JSON.stringify(g));
        check(`Die Grenze im Land: Hauptsteine im Band 250–600 m (ab ${GL.minHaupt}), Läufer ≤ ${GL.laeuferM} m${beispiel}`, bandOk);
        check("Die Grenze im Land: jeder der 360 Punkte des Rands binnen 300 m eines Steins (die Zählung der Station)", deckOk);
        check("Die Grenze im Land: derselbe Same dieselben Steine; ohne freies Land kein Stein, jeder Stand gezählt", zwei[0] === zwei[1] && leer.steine.length === 0 && leer.fehlt > 0);
    }

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

    // 14) DAS RAUM-LICHT
    raumLinse();

    // 15) DIE HASPEL DES ZIEHBRUNNENS (brunnen-haspel)
    haspelLinse();

    wandEnde(errs, "der Haus-Asset-Vertrag steht (cv:6) — jede Prüfung oben.");
})();
