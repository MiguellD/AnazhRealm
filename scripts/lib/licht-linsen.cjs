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
                    gesetzt = false,
                    verweigert = null;
                if (ex.typ === "architektur") {
                    let best = null;
                    for (const e of st.architectures || [])
                        if (e && e.type === ex.name && e.position) {
                            const d = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                            // `nah` (K63-n4): nur ein Exemplar so nah am Spieler, dass es in seiner Mesh-Stufe zeichnet — ein fernes
                            // trägt die Karte des Atlas (fimp), deren Stoff keine Zeile trennt; sonst setzt die Linse es
                            if (d <= (ex.nah || 80) && (!best || d < best.d)) best = { e, d };
                        }
                    let e = best && best.e;
                    if (!e) {
                        // Der Platz des gesetzten Exemplars: fest neben dem Spieler (Versatz der Zeile), auf dem Boden.
                        const off = ex.versatz || [8, 8];
                        const x = pp.x + off[0],
                            zz = pp.z + off[1];
                        e = r.spawnArchitecture(
                            ex.name,
                            { x, y: r._voxelSurfaceY(x, zz) + 0.5, z: zz },
                            { seed: ex.seed || 7 }
                        );
                        gesetzt = true;
                        // ein verweigerter Platz (K63-n5: der Genesis-Platz ist Grundriss gegen Natur, die Eiche bei 8/8 fiel) ist
                        // ein Befund der Zeile beim Namen — nie der Spieler als stilles Ersatz-Exemplar
                        if (!e) verweigert = `das Exemplar ${ex.name} ließ sich bei ${x.toFixed(1)}/${zz.toFixed(1)} nicht setzen`;
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
                        c = r.spawnCreatureAt(x, r._voxelSurfaceY(x, zz) + 0.5, zz, "happy", ex.name, {
                            precise: true,
                        });
                        gesetzt = true;
                    }
                    if (c) {
                        await ticke(gesetzt ? 120 : 0, () => false);
                        if (window.__tiereHalten) window.__tiereHalten();
                        pos = new T.Vector3(c.position.x, c.position.y, c.position.z);
                    }
                } else if (ex.typ === "spieler") pos = pp.clone();
                exemplare.push({ zeile: z, pos, gesetzt, verweigert });
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
            return {
                kind: t[0],
                r: zahl(1),
                mt: zahl(2),
                cc: cc ? Number(cc[1]) : 0,
                seh: v ? v[1] : null,
                schluessel: k,
            };
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
                await window.__linseRuhe(rend, rt, sc, cam, "die Albedo-Sicht");
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
                    const passt = (m) =>
                        kre.test(kl.get(m)) &&
                        matsOf(m).some((mt) => window.__stoffPasst(w.stoff || null, stoffOf(mt)));
                    let sel = meshes.filter((m) => visAlt.get(m) && passt(m));
                    const e = {
                        id: z.id,
                        name: z.id,
                        klasse: w.klasse,
                        exemplar: w.exemplar || null,
                        gesetzt: ex.gesetzt,
                    };
                    if (ex.verweigert) {
                        ergebnisse.push(Object.assign(e, { pixel: 0, fehler: ex.verweigert }));
                        continue;
                    }
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
                        ergebnisse.push(
                            Object.assign(e, {
                                pixel: 0,
                                fehler: "kein Zug der Klasse mit passendem Stoff am Exemplar",
                            })
                        );
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
                            bb.expandByPoint(zz.c.clone().addScalar(zz.rad)).expandByPoint(
                                zz.c.clone().addScalar(-zz.rad)
                            );
                        const c = bb.getCenter(new T.Vector3());
                        const rad = Math.max(0.4, bb.getSize(new T.Vector3()).length() / 2);
                        for (const d of window.__tafelBlicke)
                            stellungen.push([
                                c.clone().addScaledVector(new T.Vector3(d[0], d[1], d[2]).normalize(), rad * 2.6),
                                c,
                            ]);
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
                const klassen = [...new Set(kl.values())].filter(
                    (k) => !/^(wasser$|himmel|spieler$|p2p-spieler$|UNBENANNT:)/.test(k)
                );
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

// DIE RUHE DER LINSE (K63-n1, die EINE Stelle für jede Linse dieser Familie, die in ihr eigenes Ziel zeichnet): ihre Karten,
// Kugeln und Licht-Varianten sind neue Stoffe und Programme — der erste Render baut die Pipeline asynchron und zeichnet nichts,
// und Renders am Stück lassen kein Versprechen reifen (gemessen 15.10., Radeon, frische Welt: die Licht-Bilanz las E 0 statt 9,51,
// die Welt-Seite der Albedo-Tafel jede Zeile stumm und die Karte null). Die Linse schaltet ihren Frame, bis nichts mehr baut —
// dieselbe Ruhe wie die Aufnahme (`__erstRuhe`, scripts/lib/ausgabe-aufnahme.cjs); ohne sie bricht sie laut.
function linseRuhe(rend, rt, sc, cam, wer) {
    if (typeof window.__erstRuhe !== "function") throw new Error(`${wer}: die Erst-Ruhe fehlt (AUSGABE_INSTALL)`);
    const zeichne = () => {
        if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
        rend.setRenderTarget(rt);
        rend.setClearColor(0x000000, 0);
        rend.clear();
        rend.render(sc, cam);
        rend.setRenderTarget(null);
    };
    return window.__erstRuhe(zeichne, {}, wer);
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
            const zeichne = () => {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
            };
            // die Karte ist je Aufruf ein neuer Stoff, jede Licht-Variante ein neues Programm (`linseRuhe`)
            await window.__linseRuhe(rend, rt, sc, cam, "die Licht-Bilanz");
            const lauf = async () => {
                zeichne();
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

// DIE ALBEDO NAH GEGEN FERN AN DERSELBEN STELLE (0910-8, „die weiße Masse“): der Boden-Satz (nah) und der Fern-Ring (fern)
// zeichnen dieselbe Stelle des Chunk-Quadrats — der Ring liegt darunter. Aus 420 m Höhe (jenseits der Karten-Sicht des Baums,
// 384 m: kein echter Wald im Bild, wie im Befund des Schöpfers) orthogonal über einem Quadrat von 2 × `halb` (132 m) je Ort
// zwei Schüsse unter weißem Umgebungslicht π (hell − dunkel = die Albedo, wie `__albedoSicht`): nur der Boden-Satz, nur der
// Fern-Ring. Das Quadrat trägt mehrere Zellen des Rings (Schale 0 schnappt auf 24 m): auf 44 m lag der Ring allein durch
// seine Abtastung −22 … +20 % neben dem Gesetz an der Stelle, auf 132 m −12 … +7 % (gemessen 11.10., Mess-Wiese). Die Orte
// wählt die Linse unter den Blöcken des Boden-Satzes (der ganze Fußabdruck nah gedeckt) nach der Deckung des Fern-Rings in
// der Mitte (`_fernFarbeTeile`): Wald ≥ 0,9, Wiese ≤ 0,7 (an der Mess-Wiese deckt der Ring im Median 0,98, die lichteste
// Stelle 0,38), je bis zu vier, 30 m auseinander, auf Land.
function nahFernSicht(opts) {
    return (async () => {
        opts = opts || {};
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        const H = opts.hoehe || 420,
            halb = opts.halb || 66,
            W = 64,
            HH = 64;
        const pp = st.playerMesh.position;
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const satz = st.chunkSaetze && st.chunkSaetze.get("boden");
        if (!satz || !satz.bloecke || satz.bloecke.size === 0)
            throw new Error("__nahFernSicht: kein Boden-Satz (chunkSaetze.boden) — nichts Nahes zu messen");
        // Ein Ort zählt nur, wo der Boden-Satz den GANZEN Fußabdruck des Schusses trägt (der Ring der Chunks endet nach
        // `_builtRingRadius`, der Fern-Ring nie): Mitte und vier Ecken liegen in der Box eines Blocks.
        const boxen = [...satz.bloecke.values()].map((b) => {
            if (!b.geom.boundingBox) b.geom.computeBoundingBox();
            return b.geom.boundingBox;
        });
        const drin = (x, z) => boxen.some((bb) => x >= bb.min.x && x <= bb.max.x && z >= bb.min.z && z <= bb.max.z);
        const fuss = halb + 1;
        const gedeckt = (x, z) =>
            [
                [0, 0],
                [fuss, fuss],
                [fuss, -fuss],
                [-fuss, fuss],
                [-fuss, -fuss],
            ].every(([a, b]) => drin(x + a, z + b));
        const teile = new Float32Array(7);
        const kand = [];
        for (let dx = -220; dx <= 220; dx += 11)
            for (let dz = -220; dz <= 220; dz += 11) {
                const x = Math.round(pp.x + dx),
                    z = Math.round(pp.z + dz);
                if (!gedeckt(x, z)) continue;
                const y = r._voxelSurfaceY(x, z);
                if (!(y > wl + 1)) continue;
                r._fernFarbeTeile(x, y, z, teile);
                kand.push({ x, z, y, deckung: teile[6] });
            }
        const waehle = (liste) => {
            const aus = [];
            for (const k of liste) if (aus.every((a) => Math.hypot(a.x - k.x, a.z - k.z) >= 30)) aus.push(k);
            return aus.slice(0, opts.jeKlasse || 4);
        };
        // DIE KLASSEN AUS DER WELT (K53, kein Orts-Literal): Wald sind die Orte der dichtesten Krone im Quadrat, Wiese die der
        // offensten — je Klasse 30 m auseinander, keine Stelle in beiden. Bis K53 lasen sie 0,9 und 0,7: die Zahlen der Geburt
        // (`forestGeburt`), die das Dach bis K16 als Deckung las; seit K16 ist die Deckung der gepflanzte Bestand (phyto-core
        // `forestKronenDeckung`, Matérn-II gesättigt bei 0,18) — die Linse fand keinen Wald-Ort mehr. Gemessen 14.10. in 2 km um die
        // Mess-Wiese: Deckung p50 0,176 · max 0,178 an V18.545 (main 9fb869a5), 0,175 · 0,178 am Kopf — der Wald ging nicht verloren.
        const dichte = kand.slice().sort((a, b) => b.deckung - a.deckung || a.x - b.x || a.z - b.z);
        const wald = waehle(dichte);
        const orte = wald
            .map((k) => Object.assign(k, { klasse: "wald" }))
            .concat(
                waehle(dichte.filter((k) => !wald.includes(k)).reverse()).map((k) =>
                    Object.assign(k, { klasse: "wiese" })
                )
            );
        const half = (h) => {
            const s = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
            if (e === 31) return f ? NaN : Infinity;
            return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        };
        const rt = new T.RenderTarget(W, HH, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
        const lies = async () => {
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, HH);
            const zeile = W * 4;
            const schritt = px.length > zeile * HH ? Math.ceil((zeile * 2) / 256) * 128 : zeile;
            const out = new Float32Array(zeile * HH);
            for (let yy = 0; yy < HH; yy++)
                for (let i = 0; i < zeile; i++) out[yy * zeile + i] = half(px[yy * schritt + i]);
            return out;
        };
        const meshes = [];
        sc.traverse((o) => {
            if (o.isMesh || o.isSprite || o.isPoints || o.isLine) meshes.push(o);
        });
        const visAlt = new Map(meshes.map((m) => [m, m.visible]));
        const lichter = [];
        sc.traverse((o) => {
            if (o.isLight) lichter.push([o, o.intensity]);
        });
        const A = new T.AmbientLight(0xffffff, Math.PI);
        sc.add(A);
        const envAlt = sc.environment,
            fogAlt = sc.fog;
        sc.environment = null;
        sc.fog = null;
        // DIE LUFT AUS (K53): die EINE Luft lebt im `scene.fogNode` (`_luftEnsure`), nie in `scene.fog` — über 420 m Weg ließ
        // sie beiden Schüssen nur 0,94 ihrer Albedo (eine 18-%-Karte im Boden-Stoff las 0,167, ohne Luft 0,180) und hielt so
        // ein Fünftel des Wiesen-Grunds unter dem Band. Ihre Dichte (`beta`) ruht für die Schüsse; kein Programm wechselt.
        const luftU = st.luft && st.luft.U && st.luft.U.beta ? st.luft.U.beta : null;
        if (sc.fogNode && !luftU) throw new Error("__nahFernSicht: die Luft (fogNode) ohne ihre Dichte (luft.U.beta)");
        const betaAlt = luftU ? luftU.value : null;
        if (luftU) luftU.value = 0;
        // Die Kamera blickt ORTHOGONAL hinab: beide Schüsse sehen denselben Fußabdruck (2 × `fuss`), auch wo der Fern-Ring
        // unter dem Quadrat tiefer liegt — perspektivisch sah er dort einen größeren (60 m tiefer: ein Drittel mehr Fläche).
        const cam = new T.OrthographicCamera(-halb, halb, halb, -halb, 1, H + 1000);
        // DAS GESETZ AN DER STELLE (die dritte Zahl, der Richter des Täters): beide Leser lesen `_fernRingTeile` — der
        // Fern-Ring an seinen Schnapp-Punkten (Schale 0: 24 m), die Karte des Boden-Stoffs im Raster N — hier das Mittel
        // derselben Formel (Boden unter dem Kronendach × Saison zur Deckung) fein über den Fußabdruck (32 × 32 Punkte).
        const saison = r._fernSaison();
        const gesetz = (x0, z0) => {
            const c = [0, 0, 0];
            let d = 0;
            for (let i = 0; i < 32; i++)
                for (let j = 0; j < 32; j++) {
                    const x = Math.round(x0 - halb + ((i + 0.5) * 2 * halb) / 32),
                        z = Math.round(z0 - halb + ((j + 0.5) * 2 * halb) / 32);
                    const law = r._terrainMacroSurfaceY(x, z, false);
                    const t = r._fernRingTeile(x, z, law, law < wl, true);
                    const sm = [saison.r, saison.g, saison.b];
                    for (let k = 0; k < 3; k++) c[k] += t[k] + (t[3 + k] * sm[k] - t[k]) * t[6];
                    d += t[6];
                }
            const rgb = c.map((v) => v / 1024);
            return {
                rgb: rgb.map((v) => +v.toFixed(4)),
                Y: +(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(4),
                deckung: +(d / 1024).toFixed(2),
            };
        };
        const lu = st.lodUniforms;
        const maskeAlt = lu && lu.uLodMaskOn ? lu.uLodMaskOn.value : null;
        const istNah = (m) => m.name === "bodenSatz";
        const istFern = (m) => m.userData && m.userData.inventar === "fern-ring";
        // DER RING WEICHT DEM GEBAUTEN (K16): unter einem gezeichneten Chunk trägt die Schale 0 kein Dreieck (`_fernRingTeilung`
        // Klasse 2) — der Fern-Schuss im Quadrat der Chunks war seither leer (0 px). Für die Schüsse der Linse zeichnet der
        // freie Teil der Schale 0 ihr volles Index-Muster (der Träger `geos[0]`, dieselbe Länge), der Naht-Teil ruht; danach
        // steht die Teilung wieder, wie sie war.
        const fr = st.fernRing;
        const freiIx = fr && fr.teilung && fr.teilung.frei && fr.teilung.frei.index;
        const freiAlt = freiIx ? freiIx.array.slice() : null;
        const nahtMesh = fr && fr.meshes ? fr.meshes.find((m) => fr.teilung && m.geometry === fr.teilung.naht) : null;
        const nahtSicht = nahtMesh ? visAlt.get(nahtMesh) : null;
        if (freiIx && fr.geos[0].index.array.length === freiIx.array.length) {
            freiIx.array.set(fr.geos[0].index.array);
            freiIx.needsUpdate = true;
            if (nahtMesh) visAlt.set(nahtMesh, false);
        }
        const schuss = async (sicht, e) => {
            for (const m of meshes) m.visible = visAlt.get(m) && sicht(m);
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
            for (const [l] of lichter) l.intensity = 0;
            A.intensity = e;
            if (maskeAlt != null) lu.uLodMaskOn.value = 0;
            // Das Licht der Linse (nur Umgebungslicht) ist ein neuer Lichter-Satz, ihr Ziel ein neuer Pass: jeder Stoff zeichnet
            // hier zum ersten Mal und wartet auf seine Pipeline (`_erstWartet`, die Welt baut sie asynchron) — in frischer
            // Sitzung zeichnete der Boden-Satz 0 von 4 096 Bildpunkten, erst nach Sekunden voll. Der Schuss steht darum erst,
            // wenn zwei Läufe dieselben Bildpunkte decken UND dieselbe Helligkeit zeigen (höchstens 20 s): in einem von acht
            // frischen Läufen (Integration V18.542, Software-Holz unter Last) zeigte der erste Schuss den Boden-Satz an einem
            // Wald-Ort bei voller Deckung mit Y 0,694 statt 0,053 (ROT +1 200 % gegen das Gesetz, im Lauf danach grün) — die
            // Deckung allein hielt ein Bild für fertig, das sich noch änderte. Die Spur (Bildpunkte, Helligkeit je Lauf) reist
            // mit; steht der Schuss nach der Frist nicht still, urteilt die Linse laut (`still`).
            let px = null,
                n = -1,
                yAlt = NaN,
                still = false,
                laeufe = 0;
            const spur = [];
            const frist = performance.now() + 20000;
            await window.__linseRuhe(rend, rt, sc, cam, "die Nah-Fern-Sicht");
            for (let lauf = 0; ; lauf++) {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                px = await lies();
                laeufe = lauf + 1;
                let m = 0,
                    s = 0;
                for (let i = 3; i < px.length; i += 4)
                    if (px[i] > 0.5) {
                        m++;
                        s += 0.2126 * px[i - 3] + 0.7152 * px[i - 2] + 0.0722 * px[i - 1];
                    }
                const y = m ? s / m : 0;
                if (spur.length < 12) spur.push([m, +y.toFixed(4)]);
                if (m === n && m > 0 && Math.abs(y - yAlt) <= 1e-4 + 1e-3 * yAlt) {
                    still = true;
                    break;
                }
                if (performance.now() > frist) break;
                n = m;
                yAlt = y;
                // im Software-Holz übersetzt ein Programm über viele Läufe (gemessen: die ersten zwei Orte leer)
                if (m === 0 || lauf >= 4) await new Promise((w) => setTimeout(w, 100));
            }
            return { px, still, laeufe, spur };
        };
        const mittel = (sh, sd) => {
            const hell = sh.px,
                dunkel = sd.px;
            const still = sh.still && sd.still;
            // die Spur reist nur mit, wenn ein Schuss mehr als die zwei Mindest-Läufe brauchte oder nicht stillstand
            const spur = !still || sh.laeufe > 2 || sd.laeufe > 2 ? { hell: sh.spur, dunkel: sd.spur } : undefined;
            let n = 0,
                R = 0,
                G = 0,
                B = 0;
            for (let i = 0; i < W * HH; i++) {
                if (!(hell[i * 4 + 3] > 0.5)) continue;
                n++;
                R += hell[i * 4] - dunkel[i * 4];
                G += hell[i * 4 + 1] - dunkel[i * 4 + 1];
                B += hell[i * 4 + 2] - dunkel[i * 4 + 2];
            }
            if (!n) return { n: 0, still, spur };
            const rgb = [R / n, G / n, B / n];
            return {
                n,
                rgb: rgb.map((v) => +v.toFixed(4)),
                Y: +(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(4),
                still,
                spur,
            };
        };
        const aus = [];
        try {
            for (const o of orte) {
                cam.position.set(o.x, o.y + H, o.z + 0.01);
                cam.lookAt(o.x, o.y, o.z);
                cam.updateMatrixWorld(true);
                // DIE WIEDERHOLUNG: ein Paar (nah, fern) zählt erst, wenn die nächste Runde an derselben Stelle dieselben
                // Bildpunkte und dieselbe Albedo (1 %) zeigt — höchstens vier Runden, sonst urteilt die Linse laut
                // (`wiederholt` false). In frischen Sitzungen (Integration V18.542, Software-Holz unter Last, 2 von 16 Läufen)
                // zeigte die ERSTE Runde am ersten Ort einen Leser falsch und still: der Boden-Satz Y 0,694 statt 0,053, der
                // Fern-Ring 0,152 statt 0,063 — die Stille eines Schusses allein hielt ein falsches Bild für fertig.
                const paar = async () => ({
                    nah: mittel(await schuss(istNah, Math.PI), await schuss(istNah, 0)),
                    fern: mittel(await schuss(istFern, Math.PI), await schuss(istFern, 0)),
                });
                const gleich = (a, b) =>
                    a.n > 0 && a.n === b.n && Math.abs(a.Y - b.Y) <= 0.01 * Math.max(a.Y, b.Y) + 1e-4;
                let vor = await paar(),
                    jetzt = null,
                    runden = 1;
                const verworfen = [];
                for (;;) {
                    jetzt = await paar();
                    runden++;
                    if (gleich(vor.nah, jetzt.nah) && gleich(vor.fern, jetzt.fern)) break;
                    verworfen.push([vor.nah.Y, vor.fern.Y]);
                    if (runden >= 4) {
                        jetzt.nah.wiederholt = gleich(vor.nah, jetzt.nah);
                        jetzt.fern.wiederholt = gleich(vor.fern, jetzt.fern);
                        break;
                    }
                    vor = jetzt;
                }
                aus.push({
                    ort: [o.x, o.z],
                    d: Math.round(Math.hypot(o.x - pp.x, o.z - pp.z)),
                    klasse: o.klasse,
                    deckung: +o.deckung.toFixed(2),
                    nah: jetzt.nah,
                    fern: jetzt.fern,
                    runden,
                    verworfen: verworfen.length ? verworfen : undefined,
                    gesetz: gesetz(o.x, o.z),
                });
            }
        } finally {
            // die Teilung des Rings steht wieder, wie sie war (9ca8b242 setzte diese Rückgabe in die Licht-Bilanz, wo `freiAlt`
            // nie stand: `werkbank licht` brach seither mit „freiAlt is not defined", K63)
            if (freiAlt) {
                freiIx.array.set(freiAlt);
                freiIx.needsUpdate = true;
                if (nahtMesh) visAlt.set(nahtMesh, nahtSicht);
            }
            for (const m of meshes) m.visible = visAlt.get(m);
            for (const [l, i] of lichter) l.intensity = i;
            sc.remove(A);
            sc.environment = envAlt;
            sc.fog = fogAlt;
            if (luftU) luftU.value = betaAlt;
            if (maskeAlt != null) lu.uLodMaskOn.value = maskeAlt;
            rt.dispose();
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        }
        // Die Karte der Fern-Krone im Boden-Stoff (seit 0910-8): steht sie nicht (bereit 0, oder ein Füll-Job offen — dann
        // liegt ihre Mitte noch am alten Anker), mischt der Boden hier nichts — das Urteil nennt es.
        const nk = st.fernKroneNah;
        return {
            hoehe: H,
            halb,
            orte: aus,
            // die Kandidaten des Quadrats: wie viele und die stärkste Deckung (ein Urteil ohne Wald-Orte nennt sie)
            kandidaten: {
                n: kand.length,
                deckungMax: kand.length ? +Math.max(...kand.map((k) => k.deckung)).toFixed(2) : null,
                deckungMin: kand.length ? +Math.min(...kand.map((k) => k.deckung)).toFixed(2) : null,
            },
            nahKarte: nk ? (nk.U.bereit.value === 1 && !nk.job ? 1 : 0) : null,
        };
    })();
}

// DAS URTEIL NAH GEGEN FERN (rein): beide Leser lesen EIN Gesetz an der Stelle (`gesetz`, das feine Mittel derselben Formel);
// jeder liegt in SEINEM Band um das Gesetz — der Boden-Satz eng (`nah`: Karte 8 Bit im Raster N), der Fern-Ring nach seiner
// Abtastung (`fern`: Schale 0 schnappt auf 24 m; über 132 m gemessen −12 … +18 %), dazu der Grün-Anteil g / (r + g + b). ROT
// beim Namen (Klasse, Ort, nah gegen fern, der TÄTER: der Leser außerhalb seines Bands), wenn einer Klasse Orte fehlen (mindestens
// drei Wald- und drei Wiesen-Orte), ein Schuss leer blieb oder nicht stillstand, das Gesetz fehlt, die Karte der Fern-Krone
// nicht steht, die Welt vor der Linse nicht stand (`welt`: das 5 × 5 der Chunks um den Spieler im Boden-Satz) oder ein
// Daten-Bild des Boden-Stoffs die GPU des Hauptbilds nicht erreicht (`upload`: Version gehoben, drei Takte, in denen der
// Boden-Satz ruht, die GPU hält sie).
function nahFernUrteil(messung, band) {
    band = Object.assign({ nah: 0.1, fern: 0.25, gruenNah: 0.03, gruenFern: 0.05, jeKlasse: 3 }, band || {});
    const befunde = [];
    const zeilen = [];
    const w = messung && messung.welt;
    if (w && w.gestanden !== true)
        befunde.push(
            `NAH-FERN Welt: das Quadrat der Linse stand nach ${(w.ms / 1000).toFixed(0)} s nicht (Chunk ${w.chunk}, fehlt ` +
                `${(w.fehlt || []).length}: ${(w.fehlt || []).slice(0, 6).join(" ")}; gebaut ${w.gebaut}, Ring ${w.ring}, im Bau ` +
                `${w.imBau}, Karte ${w.karte})`
        );
    const up = messung && messung.upload;
    if (up && up.ruhig !== true)
        befunde.push(
            `NAH-FERN Upload: der Boden-Satz ruhte in ${up.versuche} Versuchen nie drei Takte — die Probe ist blind`
        );
    if (up && !(up.bilder >= 3))
        befunde.push(
            `NAH-FERN Upload: ${up.bilder} von 3 Bildern gezeichnet (die GPU-Leine hielt) — die Probe ist blind`
        );
    if (up && !(up.texe && up.texe.length))
        befunde.push("NAH-FERN Upload: kein Daten-Bild des Boden-Stoffs gefunden — die Probe ist blind");
    for (const u of (up && up.texe) || [])
        if (!(u.gpu >= u.soll))
            befunde.push(
                `NAH-FERN Upload: ${u.name} — die GPU hält Version ${u.gpu}, der Schreiber hob sie auf ${u.soll}; der Boden ` +
                    "zeichnet im Hauptbild ein altes Bild"
            );
    if (messung && messung.nahKarte === 0)
        befunde.push(
            "NAH-FERN Karte: die Fern-Krone des nahen Bodens steht nicht für diesen Ort (bereit 0 oder Füll-Job offen) — der Boden mischt nichts"
        );
    for (const k of ["wald", "wiese"]) {
        const n = ((messung && messung.orte) || []).filter((o) => o.klasse === k).length;
        if (n < band.jeKlasse)
            befunde.push(
                `NAH-FERN ${k}: ${n} Orte — das Urteil braucht mindestens ${band.jeKlasse}` +
                    (messung && messung.kandidaten
                        ? ` (${messung.kandidaten.n} Kandidaten im Quadrat, stärkste Deckung ${messung.kandidaten.deckungMax})`
                        : "")
            );
    }
    const gr = (c) => c[1] / Math.max(1e-6, c[0] + c[1] + c[2]);
    const pz = (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(0)} %`;
    for (const o of (messung && messung.orte) || []) {
        if (!o.nah || !o.fern || !o.nah.n || !o.fern.n) {
            befunde.push(
                `NAH-FERN ${o.klasse} ${o.ort.join("/")}: leerer Schuss (nah ${o.nah ? o.nah.n : 0} px, fern ${o.fern ? o.fern.n : 0} px)`
            );
            continue;
        }
        const unstet = ["nah", "fern"].filter((k) => o[k].still === false || o[k].wiederholt === false);
        if (unstet.length) {
            befunde.push(
                `NAH-FERN ${o.klasse} ${o.ort.join("/")}: der Schuss ${unstet.join(" und ")} stand nicht still oder wiederholte ` +
                    `sich nicht (Runden ${o.runden || 1}, verworfen ${JSON.stringify(o.verworfen || [])}, Spur ` +
                    `${JSON.stringify((o[unstet[0]].spur || {}).hell || [])})`
            );
            continue;
        }
        const gY = o.gesetz && o.gesetz.Y > 0 ? o.gesetz.Y : null;
        if (!gY) {
            befunde.push(`NAH-FERN ${o.klasse} ${o.ort.join("/")}: ohne das Gesetz an der Stelle kein Urteil`);
            continue;
        }
        const dY = o.nah.Y / o.fern.Y - 1;
        const dN = o.nah.Y / gY - 1;
        const dF = o.fern.Y / gY - 1;
        const gG = o.gesetz.rgb ? gr(o.gesetz.rgb) : null;
        const gN = gG == null ? 0 : gr(o.nah.rgb) - gG;
        const gF = gG == null ? 0 : gr(o.fern.rgb) - gG;
        zeilen.push({
            klasse: o.klasse,
            ort: o.ort,
            deckung: o.deckung,
            nahY: o.nah.Y,
            fernY: o.fern.Y,
            gesetzY: gY,
            dY: +dY.toFixed(3),
            nahGesetz: +dN.toFixed(3),
            fernGesetz: +dF.toFixed(3),
            gruenNah: +gN.toFixed(3),
            gruenFern: +gF.toFixed(3),
            runden: o.runden || 1,
        });
        const taeter = [];
        if (Math.abs(dN) > band.nah || Math.abs(gN) > band.gruenNah)
            taeter.push(`Boden-Satz ${pz(dN)} (Grün ${gN >= 0 ? "+" : ""}${gN.toFixed(3)})`);
        if (Math.abs(dF) > band.fern || Math.abs(gF) > band.gruenFern)
            taeter.push(`Fern-Ring ${pz(dF)} (Grün ${gF >= 0 ? "+" : ""}${gF.toFixed(3)})`);
        if (taeter.length)
            befunde.push(
                `NAH-FERN ${o.klasse} ${o.ort.join("/")} (Deckung ${o.deckung}): Boden-Satz Y ${o.nah.Y} gegen Fern-Ring Y ${o.fern.Y} ` +
                    `(${pz(dY)}) — zwei Farben derselben Stelle; Täter ${taeter.join(" und ")} gegen das Gesetz Y ${gY}`
            );
    }
    return { befunde, zeilen };
}

// __laubGegenlicht({ art, abstand, sonne }) — DAS LAUB IM GEGENLICHT (K19, phyto-core `laubDurchlass`): der nächste Baum der Art
// (Täter-Klasse f:<art>:L<stufe>, ein Exemplar aus der Instanz-Liste seiner Laub-Senke) aus `abstand` Metern (Augenhöhe 1,7 m,
// Blick auf die Kronen-Mitte), die Sonne in `sonne` Grad Höhe einmal HINTER der Krone (Gegenlicht), einmal hinter dem Auge
// (Auflicht) — dieselbe Höhe, gespiegeltes Azimut, dieselbe Licht-Kette (Sonne mit Schatten, Himmel, Hemi). Sichtbar nur die
// Laub-Züge der Art (Rinde, Boden, alles andere ruht); gezählt jedes geschriebene Pixel (Alpha > 0), das Mittel der linearen
// Luma (eigenes Halb-Float-Ziel, ungetont — ein Verhältnis braucht keine Tonung). Dazu je Lage das Bild (sRGB, Rest magenta).
function laubGegenlicht(opts) {
    return (async () => {
        opts = opts || {};
        const r = window.anazhRealm;
        const T = window.THREE;
        const st = r.state,
            sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        if (window.__buehne) window.__buehne();
        const art = new RegExp("^f:" + (opts.art || "buche") + ":L");
        const abstand = opts.abstand || 8;
        // Die Sonne steht HINTER der Krone: ihre Höhe ist die Peilung vom Auge zur Kronen-Mitte (mindestens 5°) — eine feste
        // Höhe (`sonne` in Grad) stand für den hohen Baum unter der Krone (aus 8 m blickt das Auge 40° hinauf).
        let elev = opts.sonne > 0 ? (opts.sonne * Math.PI) / 180 : null;
        const W = opts.w || 320,
            H = opts.h || 240;
        const pp = st.playerMesh.position;
        const laub = [];
        const alle = [];
        sc.traverse((o) => {
            if (!(o.isMesh || o.isSprite || o.isPoints)) return;
            alle.push(o);
            const k = o.material && o.material.userData && o.material.userData.foundryKind;
            if ((k === "foliage" || k === "foliageTex") && art.test(r._taeterKlasse(o))) laub.push(o);
        });
        if (!laub.length) return { fehler: "keine Laub-Senke der Art " + art };
        // Das Exemplar: die nächste Instanz zum Spieler (ab 6 m, sonst stünde das Auge im Stamm).
        const m4 = new T.Matrix4(),
            p = new T.Vector3(),
            q = new T.Quaternion(),
            s = new T.Vector3();
        let ziel = null;
        for (const o of laub) {
            const n = o.isInstancedMesh ? o.count : 1;
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            for (let i = 0; i < n; i++) {
                if (o.isInstancedMesh) o.getMatrixAt(i, m4);
                else m4.identity();
                m4.premultiply(o.matrixWorld);
                m4.decompose(p, q, s);
                // Mit `ziel` (x, z) das Exemplar dort; sonst das nächste zum `anker` (der Messort — dasselbe Exemplar in
                // jedem Lauf, gleich wo der vorige den Spieler ließ) bzw. zum Spieler ab 6 m (sonst stünde das Auge im Stamm).
                const von = opts.anker || [pp.x, pp.z]; // der Blick kommt aus der Richtung des Ankers
                const d = opts.ziel
                    ? Math.hypot(p.x - opts.ziel[0], p.z - opts.ziel[1])
                    : Math.hypot(p.x - von[0], p.z - von[1]);
                if ((opts.ziel || opts.anker || d > 6) && (!ziel || d < ziel.d)) {
                    const box = o.geometry.boundingBox.clone().applyMatrix4(m4);
                    ziel = { d, o, i, box, fuss: p.clone() };
                }
            }
        }
        if (!ziel) return { fehler: "kein Exemplar der Art" };
        const mitte = ziel.box.getCenter(new T.Vector3());
        const hoehe = ziel.box.max.y - ziel.fuss.y;
        const blickVon = opts.anker && !opts.ziel ? opts.anker : [pp.x, pp.z];
        const dh = new T.Vector3(blickVon[0] - ziel.fuss.x, 0, blickVon[1] - ziel.fuss.z).normalize();
        // Die Stufe folgt dem Spieler: `plan` nennt den Augen-Ort (der Aufrufer stellt den Spieler dorthin und lässt die Stufen
        // einschwingen); mit `ziel` steht das Auge am Spieler.
        const auge = opts.ziel
            ? new T.Vector3(pp.x, 0, pp.z)
            : ziel.fuss.clone().add(dh.clone().multiplyScalar(abstand));
        auge.y = r._voxelSurfaceY(auge.x, auge.z) + 1.7;
        if (opts.plan) return { ziel: [ziel.fuss.x, ziel.fuss.z], auge: [auge.x, auge.z], hoehe: +hoehe.toFixed(1) };
        const cam = st.camera;
        const kamAlt = { p: cam.position.clone(), q: cam.quaternion.clone() };
        const dl = st.directionalLight;
        const dlAlt = { p: dl.position.clone(), t: dl.target.position.clone() };
        const visAlt = new Map(alle.map((m) => [m, m.visible]));
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
        const luftU = st.luft && st.luft.U;
        const luftAlt = luftU ? luftU.beta.value : null;
        const half = (h) => {
            const sg = (h & 0x8000) >> 15,
                e = (h & 0x7c00) >> 10,
                f = h & 0x03ff;
            if (e === 0) return (sg ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
            if (e === 31) return f ? NaN : Infinity;
            return (sg ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        };
        const bundles = () =>
            sc.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        if (elev == null)
            elev = Math.max(
                (5 * Math.PI) / 180,
                Math.atan2(mitte.y - auge.y, Math.hypot(mitte.x - auge.x, mitte.z - auge.z))
            );
        const out = {
            art: opts.art || "buche",
            abstand: +Math.hypot(auge.x - ziel.fuss.x, auge.z - ziel.fuss.z).toFixed(1),
            sonneGrad: +((elev * 180) / Math.PI).toFixed(1),
            hoehe: +hoehe.toFixed(1),
            d: +ziel.d.toFixed(1),
        };
        const schuss = async (gegen, nurSonne) => {
            // Die Sonne: Höhe `elev`, Azimut hinter der Krone (gegen) oder hinter dem Auge (auf).
            const sd = dh
                .clone()
                .multiplyScalar((gegen ? -1 : 1) * Math.cos(elev))
                .add(new T.Vector3(0, Math.sin(elev), 0))
                .normalize();
            dl.target.position.copy(mitte);
            dl.position.copy(mitte.clone().add(sd.multiplyScalar(200)));
            dl.target.updateMatrixWorld(true);
            dl.updateMatrixWorld(true);
            if (dl.shadow) dl.shadow.needsUpdate = true;
            cam.position.copy(auge);
            cam.lookAt(mitte);
            cam.updateMatrixWorld(true);
            // `nurSonne`: Himmel (die EINE Umgebung) und Schatten schweigen — der Vergleich mit dem Labor misst den Stoff unter EINEM Licht.
            const envAlt = sc.environmentIntensity;
            const schattenAlt = dl.castShadow;
            if (nurSonne) {
                sc.environmentIntensity = 0;
                dl.castShadow = false; // der Stoff allein: kein Schatten, kein Himmel
            }
            let px = null;
            await window.__linseRuhe(rend, rt, sc, cam, "das Laub im Gegenlicht");
            for (let k = 0; k < 3; k++) {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                rend.setRenderTarget(rt);
                rend.setClearColor(0x000000, 0);
                rend.clear();
                rend.render(sc, cam);
                rend.setRenderTarget(null);
                px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            }
            sc.environmentIntensity = envAlt;
            dl.castShadow = schattenAlt;
            const zeile = W * 4;
            const schritt = px.length > zeile * H ? Math.ceil((zeile * 2) / 256) * 128 : zeile;
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            const cx = cv.getContext("2d");
            const img = cx.createImageData(W, H);
            const enc = (v) =>
                Math.round(255 * Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
            const Yp = new Float32Array(W * H).fill(-1);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    const i = y * schritt + x * 4;
                    const o = ((H - 1 - y) * W + x) * 4;
                    const a = half(px[i + 3]);
                    if (a > 0) {
                        const c = [half(px[i]), half(px[i + 1]), half(px[i + 2])];
                        Yp[y * W + x] = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
                        img.data[o] = enc(c[0]);
                        img.data[o + 1] = enc(c[1]);
                        img.data[o + 2] = enc(c[2]);
                    } else {
                        img.data[o] = 255;
                        img.data[o + 1] = 0;
                        img.data[o + 2] = 255;
                    }
                    img.data[o + 3] = 255;
                }
            cx.putImageData(img, 0, 0);
            return { Yp, png: cv.toDataURL("image/png") };
        };
        try {
            for (const m of alle) m.visible = laub.includes(m);
            bundles();
            if (luftU) luftU.beta.value = 0;
            // Gezählt wird jedes Pixel, das BEIDE Lagen zeichnen (die Stufen-Blende der Nachbarn wechselt ihr Dither je Bild).
            const paar = (g, a) => {
                let sg = 0,
                    sa = 0,
                    n = 0;
                for (let i = 0; i < W * H; i++)
                    if (g.Yp[i] >= 0 && a.Yp[i] >= 0) {
                        sg += g.Yp[i];
                        sa += a.Yp[i];
                        n++;
                    }
                return {
                    pixel: n,
                    gegen: { Y: n ? +(sg / n).toFixed(4) : null, png: g.png },
                    auf: { Y: n ? +(sa / n).toFixed(4) : null, png: a.png },
                    verhaeltnis: n && sa > 0 ? +(sg / sa).toFixed(3) : null,
                };
            };
            Object.assign(out, paar(await schuss(true), await schuss(false)));
            // Dasselbe nur unter der Sonne (Himmel still) — die Seite, die das Labor gegenmisst (`laborLaubGegenlicht`).
            const s = paar(await schuss(true, true), await schuss(false, true));
            out.sonne = { pixel: s.pixel, gegen: { Y: s.gegen.Y }, auf: { Y: s.auf.Y }, verhaeltnis: s.verhaeltnis };
            out.stoffe = laub.map((m) => m.material.userData.laubLicht || "ohne").join(",");
        } finally {
            for (const m of alle) m.visible = visAlt.get(m);
            bundles();
            if (luftU) luftU.beta.value = luftAlt;
            dl.position.copy(dlAlt.p);
            dl.target.position.copy(dlAlt.t);
            dl.target.updateMatrixWorld(true);
            dl.updateMatrixWorld(true);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.updateMatrixWorld(true);
            rt.dispose();
            r._applyDayNightToScene();
        }
        return out;
    })();
}

// DAS URTEIL DER LAUB-LICHT-LINSE (K19): je Art leuchtet das Laub im Gegenlicht — Luma Gegenlicht / Auflicht ≥ `glanz`
// (1,3) —, und das Labor zeigt dasselbe Verhältnis (± `labor`, 10 %), wo es gemessen ist. Täter beim Namen.
function laubLichtUrteil(messung, band) {
    band = Object.assign({ glanz: 1.3, labor: 0.1 }, band || {});
    const befunde = [];
    const zeilen = [];
    for (const [art, w] of Object.entries((messung && messung.welt) || {})) {
        if (!w || w.fehler || !(w.verhaeltnis > 0)) {
            befunde.push(`LAUB-LICHT ${art}: keine Messung (${(w && w.fehler) || "kein Laub-Pixel"})`);
            continue;
        }
        const lab = messung.labor && messung.labor[art];
        const lv = lab && lab.verhaeltnis > 0 ? lab.verhaeltnis : null;
        // Das Labor misst unter EINEM Licht (Key allein): gegen die Welt-Seite nur unter der Sonne, wo gemessen.
        const ws = w.sonne && w.sonne.verhaeltnis > 0 ? w.sonne.verhaeltnis : w.verhaeltnis;
        zeilen.push({ art, welt: w.verhaeltnis, weltSonne: ws, labor: lv, gegen: w.gegen.Y, auf: w.auf.Y });
        if (w.verhaeltnis < band.glanz)
            befunde.push(
                `LAUB-LICHT ${art}: Gegenlicht/Auflicht ${w.verhaeltnis} < ${band.glanz} (Luma ${w.gegen.Y} / ${w.auf.Y}, Stoffe ${w.stoffe}) — das Laub leuchtet nicht`
            );
        if (lv != null && Math.abs(ws / lv - 1) > band.labor)
            befunde.push(
                `LAUB-LICHT ${art}: Welt ${ws} gegen Labor ${lv} (nur Sonne) — mehr als ±${band.labor * 100} %`
            );
    }
    if (!zeilen.length && !befunde.length) befunde.push("LAUB-LICHT: keine Art gemessen");
    return { urteil: befunde.length ? "ROT" : "GRUEN", befunde, zeilen };
}

module.exports = {
    laubLichtUrteil,
    LINSEN_INSTALL:
        `window.__linseRuhe = ${linseRuhe.toString()};` +
        `window.__laubGegenlicht = ${laubGegenlicht.toString()};` +
        `window.__albedoAuswerten = ${albedoAuswerten.toString()};` +
        `window.__stoffPasst = ${stoffPasst.toString()};` +
        `window.__tafelBlicke = ${JSON.stringify(TAFEL_BLICKE)};` +
        `window.__albedoSicht = ${albedoSicht.toString()};` +
        `window.__nahFernSicht = ${nahFernSicht.toString()};` +
        `window.__lichtBilanz = ${lichtBilanz.toString()};`,
    albedoAuswerten,
    stoffPasst,
    nahFernUrteil,
    TAFEL_BLICKE,
};
