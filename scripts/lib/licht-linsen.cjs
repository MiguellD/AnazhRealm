// licht-linsen.cjs — DIE ZWEI LICHT-LINSEN der Werkbank (V18.506, Gebot 10). Beide rendern in ein
// EIGENES Render-Target: linear, ungetont (r184 tont nur das Ausgabe-Ziel) — hier ist das gewollt.
//
// __albedoSicht({ nur, w, h }) — DIE ALBEDO-SICHT: jedes Pixel = die diffuse Albedo, die der Shader
//   wirklich ausgibt. Licht: nur das Umgebungslicht, weiß, Stärke π (Lambert: albedo/π · π = albedo);
//   Sonne, Hemi, Himmels-Umgebung und Nebel aus. Emission und eingebackenes Licht fallen über die
//   Differenz (Umgebungslicht π) − (Umgebungslicht 0) heraus. Eine 18-%-Karte liest 0,180 (Selbst-
//   Eichung, gemessen 01.10.). Je Täter-Klasse des Stamms (bodenSatz · f:<preset>:L<stufe> · tier:<seele> · …)
//   ein Schuss aufs nächste Exemplar, Statistik + Bild (sRGB-kodiert, Hintergrund magenta).
// __albedoSicht({ zeilen }) — DIE ALBEDO-TAFEL DER WELT (S1 W1e, spec/farbe/albedo-tafel.json): je Tafel-Zeile ihr
//   Exemplar (eine Architektur, ein Tier, der Spieler, der Boden unter ihm — fehlt es am Ort, setzt die Linse es über die
//   Verben des Stamms, `spawnArchitecture` · `spawnCreatureAt`, und wartet, bis es gezeichnet ist), sichtbar NUR die Züge
//   seiner Täter-Klasse, deren STOFF dem Wähler der Zeile passt (der Material-Schlüssel des Wirts `budgetStoff`: Art ·
//   Rauheit · Metall · Klarlack · Seh-Klasse — dieselben Felder, die das Labor an seinem Material liest); Metall hält die
//   Linse für den Schuss auf 0 (die BASIS-Albedo: ein Lack, eine Klinge tragen sonst fast keine diffuse). Gezählt werden
//   jeder geschriebene Pixel (Alpha > 0 — die Karten-Alpha eines deckenden Stoffs, Ziegel und Backstein, ist kein Loch:
//   mit der Schwelle 0,99 fehlte dem Labor-Haus das Dach). Dieselbe Auswertung wie das
//   Labor (scripts/lib/albedo-tafel.cjs): `albedoAuswerten`, `stoffPasst`.
// __lichtBilanz() — DIE LICHT-BILANZ: eine 18-%-Karte über dem Kronendach in drei Lagen (oben · zur
//   Sonne · von der Sonne), je Licht einzeln und alle zusammen; E = π·L/0,18.
//
// Drei Fallen, die beide Linsen kennen müssen (gemessen 01.10. und 07.10.):
// - `readRenderTargetPixelsAsync` liefert die Zeilen auf 256 Byte ausgerichtet (bytesPerRow); bei
//   W·Bytes ∤ 256 liegt jede Zeile versetzt (eine 8×8-Probe las exakt ¼).
// - Bei ruhendem Loop schaltet niemand den NODE-FRAME weiter: Licht-Uniforms bleiben auf dem Stand des
//   ersten Schusses. Vor jedem Render `nodeFrame.update()`. Und: Meshes in einer `BundleGroup` folgen
//   `visible` erst nach `needsUpdate` (sonst spielt das aufgezeichnete Bündel weiter).
// - Ein 8-Bit-Ziel quantisiert die LINEARE Albedo in Schritten von 0,0039: ein Lack „Tiefschwarz" (0,006) läge auf
//   einer oder zwei Stufen. Beide Albedo-Schüsse lesen ein Halb-Float-Ziel (rgba16float, in WebGPU ohne Zusatz
//   mischbar — rgba32float bräuchte `float32-blendable`).

// DIE AUSWERTUNG beider Albedo-Linsen (Welt r184 und Labor r128 lesen DIESE Funktion): `hell`/`dunkel` sind lineare
// RGBA-Werte (Float32, je Pixel 4), `deckung` die Alpha-Schwelle eines gezählten Pixels. Albedo = hell − dunkel (die
// Emission und jedes Licht außer dem Umgebungslicht fallen heraus), dazu das Bild (sRGB-kodiert, Rest magenta).
function albedoAuswerten(hell, dunkel, W, H, deckung, name) {
    const pix = [];
    for (let i = 0; i < W * H; i++) {
        if (!(hell[i * 4 + 3] > deckung)) continue;
        const a = [0, 1, 2].map((c) => Math.max(0, hell[i * 4 + c] - dunkel[i * 4 + c]));
        const em = (dunkel[i * 4] + dunkel[i * 4 + 1] + dunkel[i * 4 + 2]) / 3;
        pix.push([a[0], a[1], a[2], em]);
    }
    const srgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    const Y = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    const mittel = (arr) => {
        if (!arr.length) return null;
        const m = [0, 0, 0, 0];
        for (const p of arr) for (let c = 0; c < 4; c++) m[c] += p[c];
        return m.map((v) => v / arr.length);
    };
    const fmt = (m, n) =>
        m
            ? {
                  anteil: +(n / Math.max(1, pix.length)).toFixed(2),
                  rgb: m
                      .slice(0, 3)
                      .map((v) => +v.toFixed(4))
                      .join("/"),
                  Y: +Y(m).toFixed(4),
                  emission: +m[3].toFixed(3),
              }
            : null;
    const istGruen = (p) => p[1] > p[0] * 1.08 && p[1] > p[2] * 1.08;
    const gruen = pix.filter(istGruen);
    const rest = pix.filter((p) => !istGruen(p));
    const ys = rest.map(Y).sort((a, b) => a - b);
    const med = ys.length ? ys[Math.floor(ys.length / 2)] : 0;
    const hellR = rest.filter((p) => Y(p) >= med),
        dunkR = rest.filter((p) => Y(p) < med);
    const yAll = pix.map(Y).sort((a, b) => a - b);
    const q = (f) => (yAll.length ? +yAll[Math.min(yAll.length - 1, Math.floor(f * yAll.length))].toFixed(3) : null);
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
        const o = i * 4;
        // Die Zeilen des Ziels laufen von unten nach oben (WebGL) bzw. oben nach unten (WebGPU) — das Bild ist nur
        // Augenschein, die Zahlen hängen nicht an der Zeilen-Ordnung.
        if (!(hell[o + 3] > deckung)) {
            img.data.set([255, 0, 255, 255], o);
            continue;
        }
        for (let c = 0; c < 3; c++)
            img.data[o + c] = Math.round(255 * srgb(Math.min(1, Math.max(0, hell[o + c] - dunkel[o + c]))));
        img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return {
        name,
        pixel: pix.length,
        gesamt: fmt(mittel(pix), pix.length),
        gruen: fmt(mittel(gruen), gruen.length),
        hell: fmt(mittel(hellR), hellR.length),
        dunkel: fmt(mittel(dunkR), dunkR.length),
        Yq: [q(0.05), q(0.25), q(0.5), q(0.75), q(0.95)].join("/"),
        png: cv.toDataURL("image/png"),
    };
}

// DER STOFF-WÄHLER einer Tafel-Zeile (Welt und Labor lesen DIESE Funktion): `s` = { kind, r, mt, cc, seh } des
// gezeichneten Materials, `sel` = { kind (Regex), seh, r/mt/cc: [min, max] } — jedes genannte Feld muss passen.
function stoffPasst(sel, s) {
    if (!sel) return true;
    if (!s) return false;
    if (sel.kind && !new RegExp(sel.kind).test(s.kind || "")) return false;
    if (sel.seh && s.seh !== sel.seh) return false;
    for (const f of ["r", "mt", "cc"])
        if (sel[f]) {
            const v = s[f];
            if (!(typeof v === "number" && v >= sel[f][0] && v <= sel[f][1])) return false;
        }
    return true;
}

// DIE TAFEL-BLICKE beider Albedo-Seiten (Welt und Labor lesen DIESE Liste): vier Dreiviertel-Seiten von schräg oben und der
// Blick von oben, je auf die Hülle des Exemplars (Abstand 2,6 × Halbmesser, Öffnung 35°).
const TAFEL_BLICKE = [
    [1, 0.45, 1.2],
    [-1.2, 0.45, 1],
    [-1, 0.45, -1.2],
    [1.2, 0.45, -1],
    [0.05, 1, 0.05],
];

function albedoSicht(opts) {
    return (async () => {
        opts = opts || {};
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        const W = opts.w || 320,
            H = opts.h || 200;
        const nur = opts.nur ? new RegExp(opts.nur) : null;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        // Die Klasse ist die Täter-Klasse des Stamms (`_taeterKlasse` — dieselbe wie Draw-Zähler, Puffer-Zensus und
        // Flugschreiber). Keinen Schuss bekommen das Wasser (es spiegelt), der Himmel und der Mensch (Spieler, Peers).
        const klasse = (o) => {
            for (let p = o; p && p !== sc; p = p.parent) if (p.userData && p.userData.isHydrosphere) return "wasser";
            return r._taeterKlasse(o);
        };
        const pp = st.playerMesh.position;
        // DIE TAFEL setzt fehlende Exemplare VOR der Inventur (sie sollen in der Mesh-Liste stehen); was sie setzt, bleibt
        // in der Welt — nach einer Tafel misst kein Band mehr in derselben Welt.
        const exemplare = [];
        if (opts.zeilen) {
            const ticke = async (n, fertig) => {
                for (let i = 0; i < n && !fertig(); i++) {
                    try {
                        window.__buehne();
                        if (window.__ortSchritt) window.__ortSchritt();
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    await sleep(50);
                }
            };
            for (const z of opts.zeilen) {
                const ex = (z.welt && z.welt.exemplar) || {};
                let pos = null,
                    gesetzt = false;
                if (ex.typ === "architektur") {
                    let best = null;
                    for (const e of st.architectures || [])
                        if (e && e.type === ex.name && e.position) {
                            const d = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                            if (d <= 80 && (!best || d < best.d)) best = { e, d };
                        }
                    let e = best && best.e;
                    if (!e) {
                        // Der Platz des gesetzten Exemplars: fest neben dem Spieler (Versatz der Zeile), auf dem Boden.
                        const off = ex.versatz || [8, 8];
                        const x = pp.x + off[0],
                            zz = pp.z + off[1];
                        e = r.spawnArchitecture(ex.name, { x, y: r._voxelSurfaceY(x, zz) + 0.5, z: zz }, { seed: ex.seed || 7 });
                        gesetzt = true;
                    }
                    if (e) {
                        await ticke(600, () => r._archIsRendered(e));
                        // Ein frisch gesetztes Exemplar zieht seine Instanz-Gruppe erst im nächsten Takt nach.
                        await ticke(gesetzt ? 20 : 0, () => false);
                        pos = new T.Vector3(e.position.x, e.position.y, e.position.z);
                    }
                } else if (ex.typ === "tier") {
                    const tierOf = (c) => {
                        let top = c;
                        while (top && top.parent && top.parent !== sc) top = top.parent;
                        return top && top.userData && top.userData._tierBaum ? top.userData.soul : null;
                    };
                    let best = null;
                    for (const c of st.creatures || [])
                        if (c && c.position && tierOf(c) === ex.name) {
                            const d = Math.hypot(c.position.x - pp.x, c.position.z - pp.z);
                            if (d <= 30 && (!best || d < best.d)) best = { c, d };
                        }
                    let c = best && best.c;
                    if (!c) {
                        const off = ex.versatz || [-8, 4];
                        const x = pp.x + off[0],
                            zz = pp.z + off[1];
                        c = r.spawnCreatureAt(x, r._voxelSurfaceY(x, zz) + 0.5, zz, "happy", ex.name, { precise: true });
                        gesetzt = true;
                    }
                    if (c) {
                        await ticke(gesetzt ? 120 : 0, () => false);
                        if (window.__tiereHalten) window.__tiereHalten();
                        pos = new T.Vector3(c.position.x, c.position.y, c.position.z);
                    }
                } else if (ex.typ === "spieler") pos = pp.clone();
                exemplare.push({ zeile: z, pos, gesetzt });
            }
        }
        const karte = new T.Mesh(
            new T.PlaneGeometry(2, 2),
            new T.MeshStandardNodeMaterial({
                color: new T.Color(0.18, 0.18, 0.18),
                roughness: 1,
                metalness: 0,
                side: T.DoubleSide,
            })
        );
        karte.name = "graukarte";
        karte.position.set(pp.x + 40, pp.y + 30, pp.z + 40);
        sc.add(karte);
        karte.updateMatrixWorld(true);
        const meshes = [];
        sc.traverse((o) => {
            if (o.isMesh || o.isSprite || o.isPoints || o.isLine) meshes.push(o);
        });
        const visAlt = new Map(meshes.map((m) => [m, m.visible]));
        const kl = new Map(meshes.map((m) => [m, klasse(m)]));
        // Der STOFF eines Wirts-Materials: sein Schlüssel im Material-Cache (`_foundryMats`, `budgetStoff`):
        // Art|Rauheit|Metall|flach|Umgebung … |cc:<k>@<r> … |v:<Seh-Klasse>. Ein Material außerhalb des Caches hat keinen.
        const stoffInv = new Map();
        for (const [k, m] of Object.entries(r._foundryMats || {})) stoffInv.set(m, k);
        const stoffOf = (mat) => {
            const k = stoffInv.get(mat);
            if (!k) return null;
            const t = k.split("|");
            const zahl = (i) => (t.length > i && /^-?\d/.test(t[i]) ? Number(t[i]) : null);
            const cc = /\|cc:([\d.]+)@/.exec(k);
            const v = /\|v:([a-z]+)/.exec(k);
            return { kind: t[0], r: zahl(1), mt: zahl(2), cc: cc ? Number(cc[1]) : 0, seh: v ? v[1] : null, schluessel: k };
        };
        const matsOf = (m) => (Array.isArray(m.material) ? m.material : [m.material]).filter(Boolean);
        const lichtAlt = [];
        sc.traverse((o) => {
            if (o.isLight) lichtAlt.push([o, o.intensity, o.color.clone()]);
        });
        const amb = st.ambientLight || lichtAlt.map((e) => e[0]).find((l) => l.isAmbientLight);
        let ambEigen = null;
        if (!amb) {
            ambEigen = new T.AmbientLight(0xffffff, 0);
            sc.add(ambEigen);
        }
        const A = amb || ambEigen;
        // Die Linse misst ohne Luft (die Extinktion der Szene ruht während des Schusses).
        const luftU = st.luft && st.luft.U;
        const luftAlt = luftU ? luftU.beta.value : null;
        const envAlt = sc.environment;
        const kamAlt = {
            p: st.camera.position.clone(),
            q: st.camera.quaternion.clone(),
            fov: st.camera.fov,
            aspect: st.camera.aspect,
        };
        if (luftU) luftU.beta.value = 0;
        sc.environment = null;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
        const cam = st.camera;
        const half = (h) => {
            const s = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
            if (e === 31) return f ? NaN : Infinity;
            return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        };
        const bundles = () =>
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        // Halb-Float, je Zeile auf 256 Byte ausgerichtet (8 Byte je Pixel) → Float32, dicht.
        const lies = async () => {
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const zeile = W * 4;
            const schritt = px.length > zeile * H ? Math.ceil((zeile * 2) / 256) * 128 : zeile;
            const out = new Float32Array(zeile * H);
            for (let y = 0; y < H; y++) for (let i = 0; i < zeile; i++) out[y * zeile + i] = half(px[y * schritt + i]);
            return out;
        };
        // DIE STUFEN-MASKE (die Dither-Blende der Foundry-Stufen misst vom Auge des Spielers, `uLodAuge`): welche Gruppe ein
        // Exemplar trägt, entschied die CPU vom Spieler aus; die Maske kann es von dort trotzdem ganz verwerfen — der Wagen
        // gt am Genesis-Ring (19,3 m, nur L0, Stempel aLodLevel 1) zeichnete 0 Pixel, ohne Maske 6 236 (gemessen 07.10.).
        // Die Albedo eines Exemplars hängt nicht an seiner Blende: je Schuss ruht die Maske, danach steht sie wie vorher.
        const lu = st.lodUniforms;
        const maskeAlt = lu && lu.uLodMaskOn ? lu.uLodMaskOn.value : null;
        const schuss = async (sicht) => {
            for (const m of meshes) m.visible = visAlt.get(m) && sicht(m);
            bundles();
            const pass = async (e) => {
                for (const [l] of lichtAlt) l.intensity = 0;
                A.color.setRGB(1, 1, 1);
                A.intensity = e;
                if (maskeAlt != null) lu.uLodMaskOn.value = 0;
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                return lies();
            };
            await pass(Math.PI);
            const hell = await pass(Math.PI);
            const dunkel = await pass(0);
            return { hell, dunkel };
        };
        // Ziel je Klasse: das nächste Exemplar. Die Kugel kommt aus den Positionen (die gespeicherte kann
        // veraltet sein — die Linse schreibt nie die Engine-Kugel).
        const ziel = (m, um) => {
            const bb = new T.Box3().setFromBufferAttribute(m.geometry.attributes.position);
            const bs = { center: bb.getCenter(new T.Vector3()), radius: bb.getSize(new T.Vector3()).length() / 2 };
            const M = new T.Matrix4(),
                mw = m.matrixWorld;
            let best = null;
            const n = m.isInstancedMesh ? m.count : 1;
            for (let i = 0; i < n; i++) {
                if (m.isInstancedMesh) {
                    m.getMatrixAt(i, M);
                    M.premultiply(mw);
                } else M.copy(mw);
                const c = bs.center.clone().applyMatrix4(M);
                const s = Math.max(
                    new T.Vector3().setFromMatrixColumn(M, 0).length(),
                    new T.Vector3().setFromMatrixColumn(M, 1).length()
                );
                const d = Math.hypot(c.x - um.x, c.z - um.z);
                if (!best || d < best.d) best = { c, rad: bs.radius * s, d };
            }
            return best;
        };
        // Ein Satz (das Haus im Bau-Satz seines Stoffs, der Fels im Formationen-Satz) ist EIN Mesh über viele Exemplare:
        // sein Ziel ist die Hülle seiner Ecken in der KUGEL R um das Exemplar (der Formationen-Satz legt seine freien Plätze
        // auf den Ursprung — eine Säule über dem Exemplar nahm sie mit, die Hülle reichte 70 m hoch).
        const zielSatz = (m, um, R) => {
            const p = m.geometry.attributes.position;
            const v = new T.Vector3();
            const bb = new T.Box3();
            // Eine geskinnte Haut (Tier, Spieler) liegt erst nach ihren Knochen an ihrem Ort (`getVertexPosition`).
            for (let i = 0; i < p.count; i++) {
                if (m.isSkinnedMesh && m.getVertexPosition) m.getVertexPosition(i, v);
                else v.fromBufferAttribute(p, i);
                v.applyMatrix4(m.matrixWorld);
                if (v.distanceTo(um) <= R) bb.expandByPoint(v);
            }
            if (bb.isEmpty()) return null;
            const c = bb.getCenter(new T.Vector3());
            return { c, rad: bb.getSize(new T.Vector3()).length() / 2, d: Math.hypot(c.x - um.x, c.z - um.z) };
        };
        const ergebnisse = [];
        const metallAlt = new Map();
        const ahnenAlt = new Map();
        try {
            if (opts.zeilen) {
                for (const ex of exemplare) {
                    const z = ex.zeile;
                    const w = z.welt || {};
                    const kre = new RegExp(w.klasse || "^$");
                    const passt = (m) => kre.test(kl.get(m)) && matsOf(m).some((mt) => window.__stoffPasst(w.stoff || null, stoffOf(mt)));
                    let sel = meshes.filter((m) => visAlt.get(m) && passt(m));
                    const e = { id: z.id, name: z.id, klasse: w.klasse, exemplar: w.exemplar || null, gesetzt: ex.gesetzt };
                    const um = ex.pos || pp;
                    // DAS EXEMPLAR, nicht die Klasse: eine Instanz-Gruppe zählt, wenn ihre nächste Instanz im Umkreis des
                    // Exemplars steht (L0 und L1 einer Art tragen sonst je ein anderes Exemplar ins Bild), ein Satz mit
                    // seinen Ecken in diesem Umkreis (`radius` der Zeile, sonst 6 m) — nur sie zeichnen im Schuss.
                    const R = (w.exemplar && w.exemplar.radius) || 6;
                    const ziele = new Map();
                    if (w.blick !== "oben")
                        for (const m of sel) {
                            const zz = m.isInstancedMesh ? ziel(m, um) : zielSatz(m, um, R);
                            if (zz && zz.d <= R) ziele.set(m, zz);
                        }
                    if (w.blick !== "oben") sel = sel.filter((m) => ziele.has(m));
                    if (!sel.length) {
                        ergebnisse.push(Object.assign(e, { pixel: 0, fehler: "kein Zug der Klasse mit passendem Stoff am Exemplar" }));
                        continue;
                    }
                    // Der Tafel-Blick ist der des Labors (Öffnung 35°, Seiten wie das Ziel) — die Spiel-Kamera öffnet 75°.
                    cam.fov = 35;
                    cam.aspect = W / H;
                    cam.updateProjectionMatrix();
                    // DIE TAFEL-BLICKE (`TAFEL_BLICKE`, dieselben im Labor): vier Dreiviertel-Seiten und oben, die übrige Welt aus;
                    // die Albedo ist das Mittel über alle Blicke — ein einziger Blick las den Wolf je nach seiner Wendung 0,17
                    // oder 0,24 (Rücken gegen Bauch, gemessen 07.10. in zwei Welten).
                    const stellungen = [];
                    if (w.blick === "oben") {
                        const y = r._voxelSurfaceY(um.x, um.z);
                        stellungen.push([new T.Vector3(um.x, y + 14, um.z + 0.01), new T.Vector3(um.x, y, um.z)]);
                    } else {
                        const bb = new T.Box3();
                        for (const zz of ziele.values())
                            bb.expandByPoint(zz.c.clone().addScalar(zz.rad)).expandByPoint(zz.c.clone().addScalar(-zz.rad));
                        const c = bb.getCenter(new T.Vector3());
                        const rad = Math.max(0.4, bb.getSize(new T.Vector3()).length() / 2);
                        for (const d of window.__tafelBlicke)
                            stellungen.push([c.clone().addScaledVector(new T.Vector3(d[0], d[1], d[2]).normalize(), rad * 2.6), c]);
                    }
                    const stoffe = new Set();
                    for (const m of sel)
                        for (const mt of matsOf(m)) {
                            const s = stoffOf(mt);
                            if (s) stoffe.add(s.schluessel);
                            if (z.basis !== false && typeof mt.metalness === "number" && !metallAlt.has(mt)) {
                                metallAlt.set(mt, mt.metalness);
                                mt.metalness = 0;
                            }
                        }
                    // Die Ahnen der gewählten Züge stehen für den Schuss sichtbar: die Ich-Sicht verbirgt den eigenen Leib
                    // (Spieler-Gruppe und Körper-Gruppe unsichtbar, die Haut darunter sichtbar — 0 Pixel, gemessen 07.10.).
                    for (const m of sel)
                        for (let a = m.parent; a && a !== sc; a = a.parent)
                            if (!ahnenAlt.has(a)) {
                                ahnenAlt.set(a, a.visible);
                                a.visible = true;
                            }
                    const set = new Set(sel);
                    const hell = new Float32Array(W * H * 4 * stellungen.length);
                    const dunkel = new Float32Array(W * H * 4 * stellungen.length);
                    for (let i = 0; i < stellungen.length; i++) {
                        cam.position.copy(stellungen[i][0]);
                        cam.lookAt(stellungen[i][1]);
                        cam.updateMatrixWorld(true);
                        const t = await schuss((m) => set.has(m));
                        hell.set(t.hell, i * W * H * 4);
                        dunkel.set(t.dunkel, i * W * H * 4);
                    }
                    const s = { hell, dunkel };
                    for (const [a, v] of ahnenAlt) a.visible = v;
                    ahnenAlt.clear();
                    for (const [mt, v] of metallAlt) mt.metalness = v;
                    metallAlt.clear();
                    const a = window.__albedoAuswerten(s.hell, s.dunkel, W, H * stellungen.length, 0, z.id);
                    ergebnisse.push(Object.assign(a, e, { zuege: sel.length, stoffe: [...stoffe] }));
                }
                // Die Selbst-Eichung der Tafel: die 18-%-Karte liest 0,180 (sonst ist kein Wert der Tafel eine Albedo).
                cam.position.copy(karte.position).add(new T.Vector3(0, 0, 2.2));
                cam.lookAt(karte.position);
                cam.updateMatrixWorld(true);
                const sk = await schuss((m) => m === karte);
                ergebnisse.push(window.__albedoAuswerten(sk.hell, sk.dunkel, W, H, 0, "graukarte"));
            } else {
                const klassen = [...new Set(kl.values())].filter((k) => !/^(wasser$|himmel|spieler$|p2p-spieler$|UNBENANNT:)/.test(k));
                for (const k of klassen) {
                    if (nur && !nur.test(k)) continue;
                    let z = null;
                    if (k === "bodenSatz" || k === "voxelChunk") {
                        const y = r._voxelSurfaceY(pp.x, pp.z);
                        cam.position.set(pp.x, y + 14, pp.z + 0.01);
                        cam.lookAt(pp.x, y, pp.z);
                    } else {
                        for (const m of meshes)
                            if (kl.get(m) === k && visAlt.get(m)) {
                                const zz = ziel(m, pp);
                                if (zz && (!z || zz.d < z.d)) z = zz;
                            }
                        if (!z) continue;
                        const dx = z.c.x - pp.x,
                            dz = z.c.z - pp.z,
                            dl = Math.hypot(dx, dz) || 1;
                        const ab = Math.max(1.2, z.rad * 2.4);
                        cam.position.set(z.c.x - (dx / dl) * ab, z.c.y + z.rad * 0.3, z.c.z - (dz / dl) * ab);
                        cam.lookAt(z.c.x, z.c.y, z.c.z);
                    }
                    cam.updateMatrixWorld(true);
                    const s = await schuss((m) => kl.get(m) === k);
                    const e = window.__albedoAuswerten(s.hell, s.dunkel, W, H, 0, k);
                    if (z) e.abstand = +z.d.toFixed(1);
                    ergebnisse.push(e);
                }
            }
        } finally {
            if (maskeAlt != null) lu.uLodMaskOn.value = maskeAlt;
            for (const [a, v] of ahnenAlt) a.visible = v;
            for (const [mt, v] of metallAlt) mt.metalness = v;
            for (const m of meshes) m.visible = visAlt.get(m);
            bundles();
            for (const [l, i, c] of lichtAlt) {
                l.intensity = i;
                l.color.copy(c);
            }
            if (ambEigen) sc.remove(ambEigen);
            if (luftU) luftU.beta.value = luftAlt;
            sc.environment = envAlt;
            sc.remove(karte);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.fov = kamAlt.fov;
            cam.aspect = kamAlt.aspect;
            cam.updateProjectionMatrix();
            cam.updateMatrixWorld(true);
            rt.dispose();
            if (r._applyDayNightToScene) r._applyDayNightToScene();
        }
        return ergebnisse;
    })();
}

function lichtBilanz() {
    return (async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        if (window.__buehne) window.__buehne();
        const pp = st.playerMesh.position;
        const gy = r._voxelSurfaceY(pp.x, pp.z);
        const dl = st.directionalLight;
        const sd = dl.position.clone().sub(dl.target.position).normalize();
        const hz = new T.Vector3(sd.x, 0, sd.z).normalize();
        const W = 64,
            H = 64;
        const karte = new T.Mesh(
            new T.PlaneGeometry(1.2, 1.2),
            new T.MeshStandardNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 })
        );
        const basis = new T.Vector3(pp.x + 6, gy + 45, pp.z + 6);
        sc.add(karte);
        const meshes = [];
        sc.traverse((o) => {
            if ((o.isMesh || o.isSprite || o.isPoints) && o !== karte) meshes.push(o);
        });
        const visAlt = new Map(meshes.map((m) => [m, m.visible]));
        const lichtAlt = [];
        sc.traverse((o) => {
            if (o.isLight) lichtAlt.push([o, o.intensity]);
        });
        const envAlt = sc.environment;
        // Die Linse misst ohne Luft (die Extinktion der Szene ruht während des Schusses).
        const luftU = st.luft && st.luft.U;
        const luftAlt = luftU ? luftU.beta.value : null;
        const kamAlt = { p: st.camera.position.clone(), q: st.camera.quaternion.clone() };
        const cam = st.camera;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
        const lagen = { oben: new T.Vector3(0, 1, 0), zurSonne: hz.clone(), vonSonne: hz.clone().negate() };
        const half = (h) => {
            const s = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
            if (e === 31) return f ? NaN : Infinity;
            return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        };
        const bundles = () =>
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        const mess = async (n) => {
            karte.position.copy(basis);
            karte.lookAt(basis.clone().add(n));
            karte.updateMatrixWorld(true);
            cam.position.copy(basis.clone().add(n.clone().multiplyScalar(1.5)));
            cam.lookAt(basis);
            cam.updateMatrixWorld(true);
            const lauf = async () => {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const zeile = W * 4;
                const schritt = px.length > zeile * H ? Math.ceil((zeile * 2) / 256) * 128 : zeile;
                const s = [0, 0, 0];
                let n2 = 0;
                for (let y = H / 2 - 4; y < H / 2 + 4; y++)
                    for (let x = W / 2 - 4; x < W / 2 + 4; x++) {
                        const i = y * schritt + x * 4;
                        for (let c = 0; c < 3; c++) s[c] += half(px[i + c]);
                        n2++;
                    }
                return s.map((v) => v / n2);
            };
            await lauf();
            return lauf();
        };
        const Y = (s) => 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
        const out = { sonnenRichtung: [sd.x, sd.y, sd.z].map((v) => +v.toFixed(3)), lichter: {} };
        for (const [l, i] of lichtAlt)
            out.lichter[l.type] = {
                intensitaet: +i.toFixed(3),
                farbe: l.color
                    .toArray()
                    .map((v) => +v.toFixed(3))
                    .join("/"),
            };
        try {
            for (const m of meshes) m.visible = false;
            bundles();
            if (luftU) luftU.beta.value = 0;
            const varianten = { alle: null, umgebung: "env" };
            for (const [l] of lichtAlt) varianten[l.type] = l.type;
            for (const [vn, typ] of Object.entries(varianten)) {
                for (const [l, i] of lichtAlt) l.intensity = typ == null || l.type === typ ? i : 0;
                sc.environment = typ == null || typ === "env" ? envAlt : null;
                out[vn] = {};
                for (const [ln, n] of Object.entries(lagen)) {
                    const L = await mess(n);
                    out[vn][ln] = {
                        L: L.map((v) => +v.toFixed(3)).join("/"),
                        E: +((Math.PI * Y(L)) / 0.18).toFixed(2),
                    };
                }
            }
        } finally {
            for (const m of meshes) m.visible = visAlt.get(m);
            bundles();
            for (const [l, i] of lichtAlt) l.intensity = i;
            sc.environment = envAlt;
            if (luftU) luftU.beta.value = luftAlt;
            sc.remove(karte);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.updateMatrixWorld(true);
            rt.dispose();
            r._applyDayNightToScene();
        }
        return out;
    })();
}

module.exports = {
    LINSEN_INSTALL:
        `window.__albedoAuswerten = ${albedoAuswerten.toString()};` +
        `window.__stoffPasst = ${stoffPasst.toString()};` +
        `window.__tafelBlicke = ${JSON.stringify(TAFEL_BLICKE)};` +
        `window.__albedoSicht = ${albedoSicht.toString()};` +
        `window.__lichtBilanz = ${lichtBilanz.toString()};`,
    albedoAuswerten,
    stoffPasst,
    TAFEL_BLICKE,
};
