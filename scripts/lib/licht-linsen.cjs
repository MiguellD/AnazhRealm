// licht-linsen.cjs — DIE LICHT-LINSEN der Werkbank (Gebot 10): je Linse ein Seiten-Teil (`LINSEN_INSTALL`) und ihr reines Urteil.
// __albedoSicht (`albedo`: die diffuse Albedo unter weißem Umgebungslicht π − 0, Karte 0,180) · __lichtBilanz (`licht`) ·
// __nahFernSicht (`albedo --nah-fern`) · __laubGegenlicht (`licht --laub`) · __tagKurve (`licht --tag`): unten je ihr Gesetz.
// Die Albedo-Linsen rendern in ein EIGENES Ziel (linear, ungetont — r184 tont nur die Ausgabe). Drei Fallen:
// - `readRenderTargetPixelsAsync` richtet jede Zeile auf 256 Byte aus (bytesPerRow);
// - bei ruhendem Loop schaltet niemand den NODE-FRAME weiter (vor jedem Render `nodeFrame.update()`), und Meshes einer
//   `BundleGroup` folgen `visible` erst nach `needsUpdate`;
// - ein 8-Bit-Ziel quantisiert die lineare Albedo in 0,0039 — die Albedo-Schüsse lesen rgba16float.
// Die Luma (Rec. 709) liest jede Linse aus abnahme-urteil (`luma709`; in der Seite global über ABNAHME_INSTALL).
const { luma709, cielab, linSrgb } = require("./abnahme-urteil.cjs");

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
    const Y = (p) => luma709(p);
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
    const img = { data: new Uint8ClampedArray(W * H * 4) };
    for (let i = 0; i < W * H; i++) {
        const o = i * 4;
        // Die Zeilen des Ziels laufen von unten nach oben (WebGL) bzw. oben nach unten (WebGPU) — das Bild ist nur
        // Augenschein, die Zahlen hängen nicht an der Zeilen-Ordnung.
        if (!(hell[o + 3] > deckung)) {
            img.data.set([255, 0, 255, 255], o);
            continue;
        }
        for (let c = 0; c < 3; c++)
            img.data[o + c] = Math.round(255 * linSrgb(Math.min(1, Math.max(0, hell[o + c] - dunkel[o + c]))));
        img.data[o + 3] = 255;
    }
    return {
        name,
        pixel: pix.length,
        gesamt: fmt(mittel(pix), pix.length),
        gruen: fmt(mittel(gruen), gruen.length),
        hell: fmt(mittel(hellR), hellR.length),
        dunkel: fmt(mittel(dunkR), dunkR.length),
        Yq: [q(0.05), q(0.25), q(0.5), q(0.75), q(0.95)].join("/"),
        png: window.__png(img.data, W, H),
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
        const T = window.THREE;
        const sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        const W = opts.w || 320,
            H = opts.h || 200;
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
                    } catch {}
                    await sleep(50);
                }
            };
            for (const z of opts.zeilen) {
                const ex = (z.welt && z.welt.exemplar) || {};
                let pos = null,
                    gesetzt = false,
                    verweigert = null,
                    eintrag = null,
                    kreatur = null;
                if (ex.typ === "architektur") {
                    let best = null;
                    for (const e of st.architectures || [])
                        if (e && e.type === ex.name && e.position) {
                            const d = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                            // `nah`: nur ein Exemplar so nah am Spieler, dass es in seiner Mesh-Stufe zeichnet — ein fernes
                            // trägt die Karte des Atlas (fimp), deren Stoff keine Zeile trennt; sonst setzt die Linse es
                            // `nah: 0`: nie ein fremdes — die Zeile setzt ihr Exemplar mit ihrer Saat (der Lack des GT
                            // folgt dem LACK_GESETZ der Saat)
                            if (d <= (ex.nah != null ? ex.nah : 80) && (!best || d < best.d)) best = { e, d };
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
                        // ein verweigerter Platz (der Genesis-Platz ist Grundriss gegen Natur, die Eiche bei 8/8 fiel) ist
                        // ein Befund der Zeile beim Namen — nie der Spieler als stilles Ersatz-Exemplar
                        if (!e) verweigert = `das Exemplar ${ex.name} ließ sich bei ${x.toFixed(1)}/${zz.toFixed(1)} nicht setzen`;
                    }
                    if (e) {
                        await ticke(600, () => r._archIsRendered(e));
                        // Ein frisch gesetztes Exemplar zieht seine Instanz-Gruppe erst im nächsten Takt nach.
                        await ticke(gesetzt ? 20 : 0, () => false);
                        pos = new T.Vector3(e.position.x, e.position.y, e.position.z);
                        eintrag = e;
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
                        kreatur = c;
                    }
                } else if (ex.typ === "mensch") {
                    // derselbe Bau wie Spieler und Bewohner, mit der Wahl des Labors (material.K1)
                    const [x, zz] = [pp.x + 4, pp.z - 4];
                    const g = r._buildHumanGroup(Object.assign({}, window.__koerperCore.START_PARAMS, ex.wahl));
                    g.name = "mensch";
                    g.position.set(x, r._voxelSurfaceY(x, zz) + r.constructor.PLAYER_FOOT_OFFSET, zz);
                    sc.add(g);
                    gesetzt = true;
                    await ticke(20, () => false);
                    pos = g.position.clone();
                }
                else if (ex.typ === "boden" && ex.wald) {
                    // DER WALD-BODEN AN SEINER STELLE (A5, Radeon): der Boden ist ein Feld, die Ratsche misst ihn an
                    // EINER festen Stelle (`stelle`, Welt-x/z), nie an einer Suche um den Spieler. Dort steht das Wald-Gesetz (`_forestCellDarts` →
                    // `_forestDartSteht` → `_wildnisTraegt`): ≥ `baeume` stehende Bäume binnen `r` m, keiner näher als `frei` m.
                    const W0 = ex.wald,
                        C = r.constructor.FOREST.cell,
                        seedInt = r._forestSeedInt(),
                        [x, zz] = ex.stelle,
                        memo = new Map();
                    const zelle = (gx, gz, k = gx + "," + gz) =>
                        memo.get(k) || memo.set(k, r._forestCellDarts(gx, gz, seedInt)).get(k);
                    let b = 0,
                        nah = Infinity;
                    for (let gz = Math.floor((zz - W0.r) / C); gz <= Math.floor((zz + W0.r) / C); gz++)
                        for (let gx = Math.floor((x - W0.r) / C); gx <= Math.floor((x + W0.r) / C); gx++)
                            for (const d of zelle(gx, gz)) {
                                const dd = Math.hypot(d.x - x, d.z - zz);
                                if (dd < W0.r && r._forestDartSteht(d, gx, gz, zelle) && r._wildnisTraegt(d.x, d.z)) {
                                    b++;
                                    nah = Math.min(nah, dd);
                                }
                            }
                    if (b >= W0.baeume && nah > W0.frei && r._landAt(x, zz) && !(r._nassAt && r._nassAt(x, zz)))
                        pos = new T.Vector3(x, r._voxelSurfaceY(x, zz), zz);
                    else verweigert = `die Stelle ${x}/${zz} trägt keinen Wald-Boden (${b} Bäume, der nächste ${nah.toFixed(1)} m)`;
                }
                exemplare.push({ zeile: z, pos, gesetzt, verweigert, eintrag, kreatur });
            }
            // DAS AUGE DER STUFE AM EXEMPLAR (`exemplar.stufe`): die Welt wählt die Stufe n ihres Exemplars von einem Auge
            // in ihrem Abstand (`_lodAuge`, das EINE Auge der Stufen), bis sie steht. Die Schüsse danach ticken nicht — die Wahl
            // bleibt bis zur Inventur; EIN solches Exemplar je Messung.
            const nahe = exemplare.filter((x) => x.eintrag && Number.isInteger((x.zeile.welt.exemplar || {}).stufe));
            if (nahe.length > 1) throw new Error(`stufe: ${nahe.length} Exemplare — das Auge der Stufen steht an EINEM`);
            for (const x of nahe) {
                const e = x.eintrag,
                    n = x.zeile.welt.exemplar.stufe,
                    D = r.constructor.LOD_DISTANCES;
                const zeigt = () => {
                    for (const g of (st.archInstanceGroups && st.archInstanceGroups.values()) || [])
                        if (g && g.slotEntry && g.mesh && (r._taeterKlasse(g.mesh) || "").endsWith(":L" + n))
                            for (let i = 0; i < (g.liveCount || 0); i++) if (g.slotEntry[i] === e) return true;
                    return false;
                };
                // der Abstand in der EINEN Wahrnehmungs-Distanz der Wahl (`_lodPerceptionDistance`, linear im Abstand): ein hoher
                // Baum schaltet später — die Fichte (26,7 m) stand aus 19 m noch in L0
                const vh = r._lodTreeVisHeight(e),
                    f = vh > 0 ? r._lodPerceptionDistance(1, vh) : 1;
                const ab = [4.2, (D.thresh01 + D.thresh12) / 2, D.thresh12 * 1.6][n] / f / Math.SQRT2;
                const auge = new T.Vector3(e.position.x + ab, e.position.y + 1.7, e.position.z + ab);
                r._lodAuge = () => auge;
                try {
                    await ticke(600, zeigt);
                    await ticke(20, () => false);
                } finally {
                    delete r._lodAuge;
                }
                if (!zeigt()) x.verweigert = `das Exemplar zeigt seine Stufe ${n} nicht (30 s)`;
            }
            // DIE UHR DER TAFEL (`uhr` 0..1, material.K3 Staffel 2): nach dem Takt der Bühne (Mittag) springt der Uhr-Schreiber
            // auf das Wort des Spielers (wie `__laubGegenlicht`) — eine Stufe, deren Ton an einer Hand-Konstante hinge, bräche an der
            // zweiten Uhr; Emission fällt in hell − dunkel heraus. Die Schüsse ticken nicht mehr.
            if (Number.isFinite(opts.uhr)) (st.world && (st.world.timeOfDay = opts.uhr), r.setTimeOfDay(opts.uhr, "human"));
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
        const envAlt = sc.environment;
        const kamAlt = {
            p: st.camera.position.clone(),
            q: st.camera.quaternion.clone(),
            nf: [st.camera.near, st.camera.far],
            fov: st.camera.fov,
            aspect: st.camera.aspect,
            layers: st.camera.layers.mask,
        };
        // der Schuss sieht die Schichten des Auges, nie den Wurf-Zwilling (material.K1: Grobstufe L1 über der feinen L0)
        const { rt, lies, bundles, ruhe, ohneLuft } = window.__linsenZiel(W, H);
        const luftZurueck = ohneLuft();
        sc.environment = null;
        const cam = st.camera;
        // DIE STUFEN-MASKE (die Dither-Blende der Foundry-Stufen misst vom Auge des Spielers, `uLodAuge`): welche Gruppe ein
        // Exemplar trägt, entschied die CPU vom Spieler aus; die Maske kann es von dort trotzdem ganz verwerfen — der Wagen
        // gt am Genesis-Ring (19,3 m, nur L0, Stempel aLodLevel 1) zeichnete 0 Pixel, ohne Maske 6 236.
        // Die Albedo eines Exemplars hängt nicht an seiner Blende: je Schuss ruht die Maske, danach steht sie wie vorher.
        const lu = st.lodUniforms;
        const maskeAlt = lu && lu.uLodMaskOn ? lu.uLodMaskOn.value : null;
        const schuss = async (sicht) => {
            const pass = async (e) => {
                // was nach der Inventur ankommt, zeichnet nie mit (material.K1)
                sc.traverse((o) => {
                    if ((o.isMesh || o.isSprite || o.isPoints || o.isLine) && !visAlt.has(o))
                        meshes.push(o) && visAlt.set(o, o.visible) && kl.set(o, klasse(o));
                });
                for (const m of meshes) m.visible = visAlt.get(m) && sicht(m);
                bundles();
                for (const [l] of lichtAlt) l.intensity = 0;
                A.color.setRGB(1, 1, 1);
                A.intensity = e;
                if (maskeAlt != null) lu.uLodMaskOn.value = 0;
                await ruhe(cam, "die Albedo-Sicht");
                return lies();
            };
            await pass(Math.PI);
            const hell = await pass(Math.PI);
            const dunkel = await pass(0);
            return { hell, dunkel };
        };
        // Ziel je Klasse: das nächste Exemplar. Die Kugel kommt aus den Positionen (die gespeicherte kann
        // veraltet sein — die Linse schreibt nie die Engine-Kugel).
        // `e` (der Eintrag des Exemplars): in seiner Gruppe nur SEIN Platz — die nächste Instanz war, solange seine Stufe reiste,
        // ein Nachbar (die frische Birke maß als Karte 0,17 mit 73k Pixeln eines anderen Baums)
        const ziel = (m, um, e) => {
            const bb = new T.Box3().setFromBufferAttribute(m.geometry.attributes.position);
            const bs = { center: bb.getCenter(new T.Vector3()), radius: bb.getSize(new T.Vector3()).length() / 2 };
            const M = new T.Matrix4(),
                mw = m.matrixWorld;
            let best = null;
            const n = m.isInstancedMesh ? m.count : 1;
            const g = e && [...st.archInstanceGroups.values()].find((q) => q && q.mesh === m && q.slotEntry);
            for (let i = 0; i < n; i++) {
                if (g && g.slotEntry[i] !== e) continue;
                if (m.isInstancedMesh) {
                    m.getMatrixAt(i, M);
                    M.premultiply(mw);
                } else M.copy(mw);
                const s = Math.max(
                    new T.Vector3().setFromMatrixColumn(M, 0).length(),
                    new T.Vector3().setFromMatrixColumn(M, 1).length()
                );
                // DIE KARTE: ihr Quad ist die Einheits-Strecke (0,0,0)–(0,1,0), ihr Rahmen reist je Instanz (`aKarte` y, z: Halbbreite
                // und Höhe, × Skala) — aus der Strecke stand die Birke als Kugel von 1,6 m statt ihrer 15 m im Schuss
                const ka = m.geometry.attributes.aKarte;
                const hb = (ka ? ka.getY(i) : Math.max(bb.max.x, bb.max.z, -bb.min.x, -bb.min.z)) * s,
                    hh = ka ? (ka.getZ(i) * s) / 2 : 0;
                const c = ka ? new T.Vector3().setFromMatrixPosition(M).setY(M.elements[13] + hh) : bs.center.clone().applyMatrix4(M);
                const d = Math.hypot(c.x - um.x, c.z - um.z);
                if (!best || d < best.d) best = { c, rad: ka ? Math.hypot(hb, hh) : bs.radius * s, d, hb };
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
        // DER SATZ DES EXEMPLARS: ein Stoff-Satz trägt viele Exemplare in EINEM Mesh (`_bauSatzBlock`: je lebende Instanz ihre
        // n Ecken ab dem Bereichs-Anfang, `slotEntry[i]` ihr Eintrag) — sonst zeichnete der Schuss die Nachbarn mit. Ein Ausschnitt zeichnet
        // nur die Dreiecke der Instanzen des Exemplars (Ecken kompakt, derselbe Stoff); ein Satz ohne sie fällt aus der Wahl (null), ein
        // Mesh, das kein Satz ist, bleibt. DIE BASIS IM SATZ: der Satz-Stoff liest sein Metall je Ecke (`aRegler.y`) — `metalness = 0`
        // am Stoff erreicht ihn nie; mit `basis` trägt der Ausschnitt Metall 0 in jeder Ecke.
        const ausschnitte = [];
        const satzAusschnitt = (m, eintrag, basis) => {
            let s = null;
            for (const q of (st.chunkSaetze && st.chunkSaetze.values()) || []) if (q.mesh === m) s = q;
            if (!s || !st.archInstanceGroups) return m;
            const tri = [];
            const stufen = new Set(); // die Stufen der Gruppen des Exemplars (die Täter-Klasse der Gruppe `f:<art>:L<n>`)
            let bau = false; // ein Satz ohne Instanz-Gruppen (Boden, Streu, Formationen) ist kein Bau-Satz: er bleibt
            for (const [key, g] of st.archInstanceGroups) {
                if (!g || g.satz !== s.art || !g.slotEntry) continue;
                bau = true;
                const b = s.bloecke.get(key);
                const n = b && b.idx && g.geom && g.geom.attributes.position ? g.geom.attributes.position.count : 0;
                for (let i = 0; n && i < Math.floor(b.vAnzahl / n); i++) {
                    if (g.slotEntry[i] !== eintrag) continue;
                    const sk = /:L(\d+)$/.exec(r._taeterKlasse(g.mesh) || "");
                    if (sk) stufen.add(+sk[1]);
                    const v0 = b.vStart + i * n,
                        v1 = v0 + n;
                    for (let t = 0; t + 2 < b.idx.length; t += 3)
                        if (b.idx[t] >= v0 && b.idx[t] < v1) tri.push(b.idx[t], b.idx[t + 1], b.idx[t + 2]);
                }
            }
            if (!bau) return m;
            if (!tri.length) return null;
            const neu = new Map(),
                alt = [];
            const ix = new Uint32Array(tri.length);
            for (let k = 0; k < tri.length; k++) {
                let j = neu.get(tri[k]);
                if (j === undefined) {
                    j = alt.length;
                    neu.set(tri[k], j);
                    alt.push(tri[k]);
                }
                ix[k] = j;
            }
            const g2 = new T.BufferGeometry();
            for (const [name, a] of Object.entries(m.geometry.attributes)) {
                if (!a.array) throw new Error(`satzAusschnitt(${s.art}): das Attribut ${name} trägt kein eigenes Feld`);
                const w = a.itemSize;
                const out = new a.array.constructor(alt.length * w);
                for (let j = 0; j < alt.length; j++) for (let c = 0; c < w; c++) out[j * w + c] = a.array[alt[j] * w + c];
                if (basis && name === "aRegler") for (let j = 0; j < alt.length; j++) out[j * w + 1] = 0;
                g2.setAttribute(name, new T.BufferAttribute(out, w, a.normalized));
            }
            g2.setIndex(new T.BufferAttribute(ix, 1));
            const t = new T.Mesh(g2, m.material);
            t.name = m.name;
            t.userData = Object.assign({}, m.userData, { satzAusschnitt: s.art, satzStufen: [...stufen] });
            t.matrixAutoUpdate = false;
            t.matrix.copy(m.matrixWorld);
            t.matrixWorld.copy(m.matrixWorld);
            t.frustumCulled = false;
            t.layers.mask = m.layers.mask;
            t.renderOrder = m.renderOrder;
            sc.add(t);
            ausschnitte.push(t);
            return t;
        };
        const ausschnitteFort = () => {
            for (const t of ausschnitte.splice(0)) {
                sc.remove(t);
                t.geometry.dispose();
            }
        };
        const ergebnisse = [];
        const metallAlt = new Map();
        try {
            if (opts.zeilen) {
                for (const ex of exemplare) {
                    ausschnitteFort(); // der Ausschnitt der vorigen Zeile zeichnet nie in dieser
                    const z = ex.zeile;
                    const w = z.welt || {};
                    const kre = new RegExp(w.klasse || "^$");
                    const passt = (m) =>
                        kre.test(kl.get(m)) &&
                        matsOf(m).some((mt) => window.__stoffPasst(w.stoff || null, stoffOf(mt)));
                    // DIE POSE DES LABORS (Karte WL, Radeon, EINE Welt): das Tier steht im Schuss in der Kern-STAND_POSE
                    // mit Gier 0 (`_tierBaumNeutralStance`; das Labor steht idle, stride 0) — mitten im Schritt eingefroren las das
                    // Fell je Phase 0,1746 bis 0,1862, im Stand 0,1849 bis 0,1853
                    if (ex.kreatur) {
                        ex.kreatur.rotation.y = 0;
                        r._tierBaumNeutralStance(ex.kreatur);
                        ex.kreatur.updateMatrixWorld(true);
                    }
                    let sel = meshes.filter((m) => visAlt.get(m) && passt(m));
                    if (ex.eintrag)
                        sel = sel
                            .map((m) => (m.isInstancedMesh ? m : satzAusschnitt(m, ex.eintrag, z.basis !== false)))
                            .filter(Boolean);
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
                            const zz = m.isInstancedMesh ? ziel(m, um, ex.eintrag) : zielSatz(m, um, R);
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
                    // oder 0,24 (Rücken gegen Bauch).
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
                        // DAS EXEMPLAR ALLEIN (die Tiefen-Scheibe wie Karte gegen Gestalt, S2b): eine Instanz-Gruppe zeichnet jede Instanz
                        // ihrer Stufe — gezählt werden nur die Tiefe und die Spalten des Exemplars: schräg seine Kugel, waagrecht (jede Stufe
                        // einer Zeile `blick: "waagrecht"`, der Baum) seine Halbbreite `hb` (die Fichte L1 zählte mit ihrem Wald 119k Pixel
                        // gegen 36k der L0). DIE KARTE sieht das Auge waagrecht: ihr Quad steht lotrecht zur Peilung (`_ang`), jedes ihrer
                        // Pixel liegt in EINER Tiefe (±1 m im EINEN Atlas über jede Art, 582 Karten an Genesis; die Birke maß mit ihren
                        // Nachbarn 0,50 ihrer L0); von oben ist sie eine Strecke.
                        const karte = [...ziele.keys()].some((m) => m.geometry.attributes.aKarte),
                            waag = karte || w.blick === "waagrecht",
                            inst = [...ziele.keys()].some((m) => m.isInstancedMesh),
                            hb = waag ? Math.max(...[...ziele.values()].map((z) => z.hb || 0)) : rad;
                        for (const d of window.__tafelBlicke)
                            if (!(waag && d[1] > 0.9))
                                stellungen.push([
                                    c.clone().addScaledVector(new T.Vector3(d[0], waag ? 0 : d[1], d[2]).normalize(), rad * 2.6),
                                    c,
                                    inst && [rad * 2.6 - (karte || hb), rad * 2.6 + (karte || hb), (hb * 1.05 * H) / (rad * 2.6 * 0.6306)],
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
                    const set = new Set(sel);
                    const hell = new Float32Array(W * H * 4 * stellungen.length);
                    const dunkel = new Float32Array(W * H * 4 * stellungen.length);
                    for (let i = 0; i < stellungen.length; i++) {
                        cam.position.copy(stellungen[i][0]);
                        cam.lookAt(stellungen[i][1]);
                        const nf = stellungen[i][2];
                        [cam.near, cam.far] = nf || kamAlt.nf;
                        cam.updateProjectionMatrix();
                        cam.updateMatrixWorld(true);
                        let t = await schuss((m) => set.has(m));
                        // die Instanz einer eben gewechselten Stufe trägt erst das nächste Bild (swiftshader: die frische Karte der Birke
                        // zeichnete im ersten Schuss kein Pixel, im zweiten 15 235) — ein leerer Schuss fährt einmal neu, bleibt er leer, laut
                        if (nf && !t.hell.some((v, i) => i % 4 === 3 && v > 0)) t = await schuss((m) => set.has(m));
                        if (nf) for (let p = 0; p < W * H; p++) if (Math.abs((p % W) + 0.5 - W / 2) > nf[2]) t.hell[p * 4 + 3] = 0;
                        hell.set(t.hell, i * W * H * 4);
                        dunkel.set(t.dunkel, i * W * H * 4);
                    }
                    const s = { hell, dunkel };
                    for (const [mt, v] of metallAlt) mt.metalness = v;
                    metallAlt.clear();
                    const a = window.__albedoAuswerten(s.hell, s.dunkel, W, H * stellungen.length, 0, z.id);
                    // DIE STUFEN DES SCHUSSES: je Zug seine Foundry-Stufe (`:L<n>` der Täter-Klasse, im Satz die Gruppen des Exemplars)
                    const stufen = new Set();
                    for (const m of sel) {
                        const sk = /:L(\d+)$/.exec(kl.get(m) || "");
                        if (sk) stufen.add(+sk[1]);
                        for (const x of (m.userData && m.userData.satzStufen) || []) stufen.add(x);
                    }
                    ergebnisse.push(
                        Object.assign(a, e, { zuege: sel.length, stoffe: [...stoffe], stufen: [...stufen].sort() })
                    );
                }
                ausschnitteFort();
                // Die Selbst-Eichung der Tafel: die 18-%-Karte liest 0,180 (sonst ist kein Wert der Tafel eine Albedo).
                cam.position.copy(karte.position).add(new T.Vector3(0, 0, 2.2));
                cam.lookAt(karte.position);
                [cam.near, cam.far] = kamAlt.nf;
                cam.updateProjectionMatrix();
                cam.updateMatrixWorld(true);
                const sk = await schuss((m) => m === karte);
                ergebnisse.push(window.__albedoAuswerten(sk.hell, sk.dunkel, W, H, 0, "graukarte"));
            }
        } finally {
            ausschnitteFort();
            if (maskeAlt != null) lu.uLodMaskOn.value = maskeAlt;
            for (const [mt, v] of metallAlt) mt.metalness = v;
            for (const m of meshes) m.visible = visAlt.get(m);
            bundles();
            for (const [l, i, c] of lichtAlt) {
                l.intensity = i;
                l.color.copy(c);
            }
            if (ambEigen) sc.remove(ambEigen);
            luftZurueck();
            sc.environment = envAlt;
            sc.remove(karte);
            cam.position.copy(kamAlt.p);
            cam.quaternion.copy(kamAlt.q);
            cam.fov = kamAlt.fov;
            [cam.near, cam.far] = kamAlt.nf;
            cam.aspect = kamAlt.aspect;
            cam.layers.mask = kamAlt.layers;
            cam.updateProjectionMatrix();
            cam.updateMatrixWorld(true);
            rt.dispose();
            if (r._applyDayNightToScene) r._applyDayNightToScene();
        }
        return ergebnisse;
    })();
}

// DAS ZIEL DER FAMILIE (Halb-Float W × H; Albedo-Sicht, Licht-Bilanz, Nah-Fern und Laub lesen es): `zeichne(cam)` die Szene
// hinein, `lies()` dicht als Float32 (die Zeilen liegen auf 256 Byte, 8 Byte je Pixel), `bundles()` frischt jede Bündel-Gruppe
// (`window.__bundlesNeu`, welt-boot)
function linsenZiel(W, H) {
    const T = window.THREE,
        { renderer: rend, scene: sc } = r.state,
        rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0, type: T.HalfFloatType });
    const zeichne = (cam) => {
        if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
        rend.setRenderTarget(rt);
        rend.setClearColor(0x000000, 0);
        rend.clear();
        rend.render(sc, cam);
        rend.setRenderTarget(null);
    };
    return {
        rt,
        zeichne,
        lies: async () => {
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H),
                s = px.length > W * 4 * H ? Math.ceil(W / 32) * 128 : W * 4;
            return Float32Array.from({ length: W * 4 * H }, (_x, i) => T.DataUtils.fromHalfFloat(px[((i / (W * 4)) | 0) * s + (i % (W * 4))]));
        },
        bundles: window.__bundlesNeu, // das EINE Bündel-Neu der Seite (welt-boot)
        // DIE RUHE DER LINSE: ihre Karten, Kugeln und Licht-Varianten sind neue Stoffe und Programme — der erste Render baut die
        // Pipeline asynchron und zeichnet nichts, und Renders am Stück lassen kein Versprechen reifen. Die Linse schaltet ihren
        // Frame, bis nichts mehr baut — dieselbe Ruhe wie die Aufnahme (`__erstRuhe`, scripts/lib/ausgabe-aufnahme.cjs). Die
        // Kaskaden zeichnen für DIESES Auge und diese Sonne neu (Lehre 17): ihre Karte vom letzten Frame des Spiels lag sonst über
        // der Linse (A7, Radeon: die Sonne auf derselben Birke 0 bis 0,06 je Lauf, Karte gegen Gestalt 0,93–1,32 je Lauf).
        ruhe: (cam, wer) => window.__erstRuhe(() => (r._schattenAlleNeu(), zeichne(cam)), {}, wer),
        // die Linse misst ohne Luft (die Extinktion der Szene ruht während der Schüsse); zurück gibt der Rückgabe-Ruf
        kamera: (cam, p = cam.position.clone(), q = cam.quaternion.clone()) => () => (cam.position.copy(p), cam.quaternion.copy(q)),
        ohneLuft: (U = ((r.state.luft || {}).U || {}).beta, alt = U && U.value) => (U && (U.value = 0), () => U && (U.value = alt)),
    };
}

function lichtBilanz() {
    return (async () => {
        const T = window.THREE;
        const sc = st.scene,
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
        // DIE ATMOSPHÄRE AM AUGE DER KARTE (D3): Sonne, Himmel und Umgebung rechnet die Welt für die Höhe des Auges
        // (`_atmoSonne`, `_atmoTakt`; Hillaire) — die Linse misst das Licht an der Karte, also mit dem Auge dort (45 m über dem
        // Boden), die Umgebung frisch gezeichnet; danach gilt das Auge des Spielers.
        st.camera.position.copy(basis.clone().add(new T.Vector3(0, 1.5, 0)));
        st.camera.updateMatrixWorld(true);
        r._applyDayNightToScene();
        r._ensureSkyEnvironment(true);
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
        const cam = st.camera;
        const { rt, zeichne, lies, bundles, ruhe, ohneLuft, kamera } = window.__linsenZiel(W, H);
        const kamZurueck = kamera(cam);
        let luftZurueck;
        const lagen = { oben: new T.Vector3(0, 1, 0), zurSonne: hz.clone(), vonSonne: hz.clone().negate() };
        const mess = async (n) => {
            karte.position.copy(basis);
            karte.lookAt(basis.clone().add(n));
            karte.updateMatrixWorld(true);
            cam.position.copy(basis.clone().add(n.clone().multiplyScalar(1.5)));
            cam.lookAt(basis);
            cam.updateMatrixWorld(true);
            // die Karte ist je Aufruf ein neuer Stoff, jede Licht-Variante ein neues Programm (`ruhe` des Ziels)
            await ruhe(cam, "die Licht-Bilanz");
            const lauf = async () => {
                zeichne(cam);
                const px = await lies();
                const s = [0, 0, 0];
                let n2 = 0;
                for (let y = H / 2 - 4; y < H / 2 + 4; y++)
                    for (let x = W / 2 - 4; x < W / 2 + 4; x++) {
                        for (let c = 0; c < 3; c++) s[c] += px[(y * W + x) * 4 + c];
                        n2++;
                    }
                return s.map((v) => v / n2);
            };
            await lauf();
            return lauf();
        };
        const Y = luma709;
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
            luftZurueck = ohneLuft();
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
            if (luftZurueck) luftZurueck();
            sc.remove(karte);
            kamZurueck();
            cam.updateMatrixWorld(true);
            rt.dispose();
            r._applyDayNightToScene();
        }
        return out;
    })();
}

// DIE TAG-ACHSE IM BILD (licht.K1, `werkbank licht --tag`): am Messort in Ego je Uhr (über den Pfad des Spielers) der Schuss aus dem
// Ausgabe-Pfad: Sonnenhöhe, Belichtung des ersten Frames (`sofort`) und des stehenden Himmels (`frisch`), aus der unteren
// Bildhälfte Luma, Leuchtdichte Y (linear, ausgegeben), die Stufen der Szene X (je Pixel durch die Tonkurve zurück) und R/B;
// mittags dazu die 18-%-Karte waagrecht 2,5 m vor dem Auge (ihre Luma, der Anker). Ein Spion zählt die Schreiber der
// Belichtung. Die Uhr läuft die GANZE Bahn in 0,01, um den Horizont in 0,002 nach (`tagFeinUhren`).
const TAG_UHREN = Array.from({ length: 100 }, (_, i) => i / 100);
// `--kurz` (gate:tag-achse:echt): Mitternacht, Mittag, der Buckel 0,33, die Sonne 10° beider Seiten und der Horizont
const TAG_UHREN_KURZ = [0, 0.25, 0.27, 0.28, 0.33, 0.5, 0.72, 0.73, 0.75];
function tagKurve(o) {
    return (async () => {
        const T = window.THREE;
        const rend = st.renderer;
        rend.setAnimationLoop(null);
        window.__buehne();
        const schreiber = {};
        let k = rend.toneMappingExposure;
        Object.defineProperty(rend, "toneMappingExposure", {
            configurable: true,
            enumerable: true,
            get: () => k,
            set: (v) => {
                const s = window.__spielStapel().split(" ← ")[0];
                if (v !== k) schreiber[s] = (schreiber[s] || 0) + 1;
                k = v;
            },
        });
        const lin = Array.from({ length: 256 }, (_, i) => srgbLin(i));
        // die Tonkurve zurück (Khronos PBR Neutral, BELICHTUNG.kurve): Fuß 6,25·x², darüber x − 0,04, die Schulter
        const vor = (d) => (d < 0.04 ? Math.sqrt(d / 6.25) : d <= 0.76 ? d + 0.04 : 0.52 + 0.0576 / Math.max(1 - d, 1e-3));
        const W = 480,
            H = 270;
        const zeilen = [];
        let karte = null;
        try {
            for (const u of o.uhren) {
                if (st.world) st.world.timeOfDay = u;
                if (r.setTimeOfDay(u, "human") !== true) throw new Error(`die Uhr nimmt den Spieler nicht (${u})`);
                const sofort = k;
                // die Leuchtquellen der Stunde blenden ein (`_leuchtTakt`), bis jeder Platz des Pools steht
                for (let i = 0, p; i < 20 && r._leuchtTakt; i++, await sleep(50)) {
                    r._leuchtTakt();
                    if ((p = r._leuchtPool) && p.blende.every((b, j) => b === +!!p.halter[j])) break;
                }
                await window.__weltStehtWarten();
                const u8 = (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
                const s = [0, 0, 0, 0, 0];
                let n = 0;
                for (let i = (H / 2) * W * 4; i < W * H * 4; i += 4, n++) {
                    s[0] += luma709(u8, i);
                    for (let c = 0; c < 3; c++) s[c + 1] += lin[u8[i + c]];
                    s[4] += vor(luma709([lin[u8[i]], lin[u8[i + 1]], lin[u8[i + 2]]]));
                }
                const z = {
                    uhr: u,
                    sonne: +((Math.asin(r._sonnenRichtung().y) * 180) / Math.PI).toFixed(2),
                    sofort: +sofort.toFixed(4),
                    frisch: +k.toFixed(4),
                    hell: +(s[0] / n).toFixed(1),
                    Y: +(luma709(s.slice(1)) / n).toPrecision(4),
                    X: +(s[4] / n).toPrecision(4),
                    warm: +(s[1] / Math.max(s[3], 1e-9)).toFixed(3),
                };
                if (o.png) z.png = window.__png(u8, W, H);
                zeilen.push(z);
                if (u === 0.5) {
                    // DER ANKER: die 18-%-Karte waagrecht, 2,5 m vor dem Auge, 0,6 m unter ihm, ohne Schatten — das Licht der Welt
                    // durch die Belichtung und die Tonkurve, gezählt 3 Pixel in ihrer Mitte
                    const cam = st.camera;
                    const km = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshStandardNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1 }));
                    km.position.copy(cam.position).addScaledVector(cam.getWorldDirection(new T.Vector3()).setY(0).normalize(), 2.5).y -= 0.6;
                    km.rotation.x = -Math.PI / 2;
                    st.scene.add(km);
                    const q = (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
                    st.scene.remove(km);
                    const m = km.position.project(cam);
                    const i0 = (Math.round(((1 - m.y) / 2) * H) * W + Math.round(((m.x + 1) / 2) * W)) * 4;
                    karte = +((luma709(q, i0 - 4) + luma709(q, i0) + luma709(q, i0 + 4)) / 3).toFixed(1);
                    km.geometry.dispose();
                    km.material.dispose();
                }
            }
        } finally {
            delete rend.toneMappingExposure;
            rend.toneMappingExposure = k;
        }
        return { zeilen, schreiber, karte, bahn: o.uhren.length === 100 };
    })();
}

// DAS URTEIL DER TAG-ACHSE (rein) gegen das Soll der Karte licht.K1 — die Kamera folgt dem Licht des Orts, nie dem Bild. ROT:
//   ANKER die 18-%-Karte mittags außerhalb Luma 110–130 · SPRUNG ein Schritt der Messung (0,01, um den Horizont 0,002) über
//   0,1 EV · BUCKEL eine Stunde über Mittag + 0,15 EV · GOLD die Sonne 10° (je Seite zwischen ihren Zeilen gelesen) außerhalb
//   −1 … −0,5 EV · WARM dort R/B unter 1,3 × Mittag · NACHT Mitternacht außerhalb −5 … −3 EV oder unter Luma 22 · REF die Stufen der Szene
//   (X) über 0,3 neben der REF-Kurve (spec/farbe/tag-ref.json, je Knoten, dazwischen linear) · ASYNC der erste Frame neben dem
//   stehenden Himmel · SCHREIBER nicht EINER · BLIND ohne Mittag und Mitternacht. Das EV ist das des Ausgabe-Bilds (Y). Trägt die
//   Messung nicht die ganze Bahn (`bahn`: die 100 Uhren; `--kurz` ist die Wand gate:tag-achse:echt), urteilt sie die Mechanik der
//   Kamera (`TAG_WAND`: Anker, Stetigkeit, EIN Schreiber); was die Szene antwortet, urteilt die Station über die ganze Bahn.
const TAG_SOLL = { karte: [110, 130], sprung: 0.1, buckel: 0.15, gold: [-1, -0.5], warm: 1.3, nacht: [-5, -3], nachtLuma: 22, ref: 0.3, async: 0.05 };
const TAG_WAND = /^(ANKER|SPRUNG|ASYNC|SCHREIBER|BLIND) /;
// die Nachtastung im Feinschritt 0,002: jede Lücke einer Seite, deren Sonne im Fenster um den Horizont steht (−18 … 15°)
function tagFeinUhren(zeilen) {
    return zeilen.flatMap((a, i) => {
        const b = zeilen[i + 1];
        const drin = b && b.uhr - a.uhr < 0.021 && a.uhr % 0.5 && [a, b].some((x) => x.sonne >= -18 && x.sonne <= 15);
        return drin ? Array.from({ length: Math.round((b.uhr - a.uhr) / 0.002) - 1 }, (_, j) => +(a.uhr + 0.002 * (j + 1)).toFixed(3)) : [];
    });
}
function tagKurveUrteil(welt) {
    const S = TAG_SOLL;
    const R = require("../../spec/farbe/tag-ref.json").zeilen;
    const stufen = (h) => {
        const i = R.findIndex((x) => x[0] <= h);
        return i < 1 ? R[Math.max(i, 0)][2] : R[i][2] + ((R[i - 1][2] - R[i][2]) * (h - R[i][0])) / (R[i - 1][0] - R[i][0]);
    };
    const befunde = [],
        kurven = {};
    const ev = (a, b) => Math.log2(Math.max(a, 1e-9) / Math.max(b, 1e-9));
    const r2 = (v) => v.toFixed(2);
    for (const [ort, m] of Object.entries(welt)) {
        const alle = ((m && m.zeilen) || []).concat((m && m.fein) || []).sort((a, b) => a.uhr - b.uhr);
        const rot = (name, text) => ((m && m.bahn) || TAG_WAND.test(name + " ")) && befunde.push(`${name} ${ort}: ${text}`);
        const [mittag, nacht] = [0.5, 0].map((u) => alle.find((x) => x.uhr === u));
        if (!mittag || !nacht) {
            rot("BLIND", `ohne Mittag und Mitternacht (${(m && m.fehler) || "leer"})`);
            continue;
        }
        const e = (x) => ev(x.Y, mittag.Y);
        const ref = (x) => ev(x.X, mittag.X) - stufen(x.sonne) + stufen(mittag.sonne);
        kurven[ort] = `Karte ${m.karte} · ` + alle.map((x) => `${x.uhr}:${r2(e(x))}/${r2(ref(x))}`).join(" ");
        if (!(m.karte >= S.karte[0] && m.karte <= S.karte[1])) rot("ANKER", `die 18-%-Karte mittags Luma ${m.karte}`);
        alle.forEach((x, i) => {
            const a = alle[i - 1];
            if (a && x.uhr - a.uhr < 0.0105 && Math.abs(e(x) - e(a)) > S.sprung) rot("SPRUNG", `Uhr ${a.uhr} → ${x.uhr} ${r2(e(x) - e(a))} EV`);
            if (e(x) > S.buckel) rot("BUCKEL", `Uhr ${x.uhr} (Sonne ${x.sonne}°) ${r2(e(x))} EV über dem Mittag`);
            if (Math.abs(ref(x)) > S.ref) rot("REF", `Uhr ${x.uhr} (Sonne ${x.sonne}°) ${r2(ref(x))} Stufen neben der REF`);
            if (Math.abs(ev(x.sofort, x.frisch)) > S.async) rot("ASYNC", `Uhr ${x.uhr} ${r2(ev(x.sofort, x.frisch))} EV`);
        });
        for (const s of [alle.filter((x) => x.uhr < 0.5), alle.filter((x) => x.uhr > 0.5)]) {
            const i = s.findIndex((x, j) => j && (s[j - 1].sonne - 10) * (x.sonne - 10) <= 0);
            const t = i > 0 && (10 - s[i - 1].sonne) / (s[i].sonne - s[i - 1].sonne || 1);
            const [g, w] = i > 0 ? [e, (x) => x.warm].map((f) => f(s[i - 1]) + (f(s[i]) - f(s[i - 1])) * t) : [NaN, NaN];
            if (!(g >= S.gold[0] && g <= S.gold[1])) rot("GOLD", `Sonne 10° ${r2(g)} EV`);
            if (!(w >= S.warm * mittag.warm)) rot("WARM", `Sonne 10° R/B ${r2(w)} gegen ${mittag.warm} mittags`);
        }
        if (!(e(nacht) >= S.nacht[0] && e(nacht) <= S.nacht[1] && nacht.hell >= S.nachtLuma)) rot("NACHT", `${r2(e(nacht))} EV, Luma ${nacht.hell}`);
        const n = Object.keys(m.schreiber || {});
        if (n.length !== 1) rot("SCHREIBER", n.join(", ") || "keiner");
    }
    return { urteil: befunde.length ? "ROT" : "GRUEN", befunde, kurven };
}

// DER SELBSTTEST DES TAG-URTEILS an GEMESSENEN Kurven (spec/farbe/tag-kurve.json): am Kopf (Mess-Wiese) steht die Wand und die
// Staffel nennt genau ihre offenen Posten (REF um die Sonne 10°, WARM), jeder in den Kopf gespielte Täter beim Namen (der Buckel
// des Vorhers: S7, Radeon, Uhr 0,33 +0,94 EV über dem Mittag). DIE KURVE AUS DEM GESETZ (headless): die Stufen der Welt-Kamera (`_belichtungStufen`
// aus dem Stamm, `ladeKlasse`) unter dem gemessenen Licht der REF gegen ihre Stufen je Knoten — die volle Adaption (Steigung 1,
// Stufen 0) ist ROT beim Namen.
function tagKurveSelbsttest() {
    const T = require("../../spec/farbe/tag-kurve.json");
    const kurve = (q, fall) => {
        const alle = q.zeilen.map((r) => Object.fromEntries(T.spalten.map((s, i) => [s, r[i]])));
        const z = (u) => alle.find((x) => x.uhr === u);
        if (fall === "BUCKEL") z(0.33).Y = z(0.5).Y * 1.2;
        if (fall === "SPRUNG") z(0.276).Y *= 1.2;
        if (fall === "GOLD") z(0.276).Y = z(0.278).Y = z(0.5).Y;
        if (fall === "REF") z(0.33).X *= 1.5;
        if (fall === "NACHT") z(0).hell = 10;
        if (fall === "ASYNC") z(0.722).sofort *= 2;
        const m = { zeilen: alle, schreiber: { _dayNightApplyBelichtung: 1 }, karte: fall === "ANKER" ? 170 : q.karte, bahn: fall !== "WAND" };
        if (fall === "SCHREIBER") m.schreiber._tickPortalMembranes = 1;
        if (fall === "BLIND") m.zeilen = [];
        return tagKurveUrteil({ wiese: m }).befunde.join();
    };
    const gesetz = (mutante) => {
        const A = require("./stamm.cjs").ladeKlasse(__dirname + "/../..").AnazhRealm;
        const R = require("../../spec/farbe/tag-ref.json").zeilen;
        A.BELICHTUNG = Object.assign({}, A.BELICHTUNG, mutante);
        return R.filter((x) => !(Math.abs(A._belichtungStufen(x[0], x[1] / R[0][1]) - x[2]) <= 0.005)).map((x) => `GESETZ Sonne ${x[0]}°`).join();
    };
    return [
        [kurve(T.kopf, "WAND"), ""],
        [kurve(T.kopf).replace(/ wiese:[^,]*/g, ""), "REF,REF,REF,REF,WARM,WARM"],
        [kurve(T.kopf, "REF"), /REF wiese: Uhr 0\.33 /],
        ...["ANKER", "SPRUNG", "BUCKEL", "GOLD", "NACHT", "ASYNC", "SCHREIBER", "BLIND"].map((f) => [kurve(T.kopf, f), new RegExp(`(^|,)${f} wiese`)]),
        [gesetz(), ""],
        [gesetz({ steigung: 1, stufen: [[10, 0], [-20, 0]] }), /GESETZ Sonne 10°/],
    ];
}

// DIE ALBEDO NAH GEGEN FERN AN DERSELBEN STELLE („die weiße Masse“): Boden-Satz (nah) und Fern-Ring (fern, er liegt
// darunter) zeichnen dieselbe Stelle. Aus 420 m Höhe (über der Karten-Sicht des Baums, 384 m) orthogonal über 2 × `halb` (132 m) je
// Ort zwei Schüsse unter weißem Umgebungslicht π (hell − dunkel = die Albedo, wie `__albedoSicht`): nur der Satz, nur der Ring. Das
// Quadrat trägt mehrere Zellen des Rings (Schale 0 schnappt auf 24 m: auf 132 m −12 … +7 % neben dem Gesetz, auf 44 m −22 … +20 %).
// Die Orte: Blöcke des Boden-Satzes (der Fußabdruck ganz gedeckt) nach der Deckung des Rings in der Mitte (`_fernFarbeTeile`),
// je Klasse bis zu vier, 30 m auseinander, auf Land.
function nahFernSicht(opts) {
    return (async () => {
        opts = opts || {};
        const T = window.THREE;
        const sc = st.scene,
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
        // die Deckung an der Stelle aus dem Fern-Faden (B2: die Fern-Farbe rechnet nur er) — EIN Auftrag für alle Kandidaten
        const kand = [];
        for (let dx = -220; dx <= 220; dx += 11)
            for (let dz = -220; dz <= 220; dz += 11) {
                const x = Math.round(pp.x + dx),
                    z = Math.round(pp.z + dz);
                if (!gedeckt(x, z)) continue;
                const y = r._voxelSurfaceY(x, z);
                if (!(y > wl + 1)) continue;
                kand.push({ x, z, y, deckung: NaN });
            }
        if (kand.length) {
            const a = await r._fernAuftrag("teile", {
                punkte: new Float64Array(kand.flatMap((k) => [k.x, k.z])),
                y: new Float64Array(kand.map((k) => k.y)),
            });
            kand.forEach((k, i) => (k.deckung = a.teile[i * 8 + 6]));
        }
        const waehle = (liste) => {
            const aus = [];
            for (const k of liste) if (aus.every((a) => Math.hypot(a.x - k.x, a.z - k.z) >= 30)) aus.push(k);
            return aus.slice(0, opts.jeKlasse || 4);
        };
        // DIE KLASSEN AUS DER WELT (kein Orts-Literal): Wald sind die Orte der dichtesten Krone im Quadrat, Wiese die der
        // offensten — je Klasse 30 m auseinander, keine Stelle in beiden; die Deckung ist der gepflanzte Bestand (phyto-core
        // `forestKronenDeckung`).
        const dichte = kand.slice().sort((a, b) => b.deckung - a.deckung || a.x - b.x || a.z - b.z);
        const wald = waehle(dichte);
        const orte = wald
            .map((k) => Object.assign(k, { klasse: "wald" }))
            .concat(
                waehle(dichte.filter((k) => !wald.includes(k)).reverse()).map((k) =>
                    Object.assign(k, { klasse: "wiese" })
                )
            );
        const { rt, lies, bundles, zeichne, ruhe, ohneLuft } = window.__linsenZiel(W, HH);
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
        // DIE LUFT AUS: die EINE Luft lebt im `scene.fogNode` (`_luftEnsure`), nie in `scene.fog` — über 420 m Weg ließ
        // sie beiden Schüssen nur 0,94 ihrer Albedo (eine 18-%-Karte im Boden-Stoff las 0,167, ohne Luft 0,180) und hielt so
        // ein Fünftel des Wiesen-Grunds unter dem Band. Ihre Dichte (`beta`) ruht für die Schüsse; kein Programm wechselt.
        if (sc.fogNode && !(st.luft && st.luft.U && st.luft.U.beta)) throw new Error("__nahFernSicht: die Luft (fogNode) ohne ihre Dichte (luft.U.beta)");
        const luftZurueck = ohneLuft();
        // Die Kamera blickt ORTHOGONAL hinab: beide Schüsse sehen denselben Fußabdruck (2 × `fuss`), auch wo der Fern-Ring
        // unter dem Quadrat tiefer liegt — perspektivisch sah er dort einen größeren (60 m tiefer: ein Drittel mehr Fläche).
        const cam = new T.OrthographicCamera(-halb, halb, halb, -halb, 1, H + 1000);
        // DAS GESETZ AN DER STELLE (die dritte Zahl, der Richter des Täters): beide Leser lesen `_fernRingTeile` — der
        // Fern-Ring an seinen Schnapp-Punkten (Schale 0: 24 m), die Karte des Boden-Stoffs im Raster N — hier das Mittel
        // derselben Formel (Boden unter dem Kronendach × Saison zur Deckung) fein über den Fußabdruck (32 × 32 Punkte).
        const saison = r._fernSaison();
        const gesetz = async (x0, z0) => {
            const c = [0, 0, 0];
            let d = 0;
            // die Teile am Gesetz aus dem Fern-Faden (B2), unter dem Meeresspiegel das Wasser des Rings
            const pts = new Float64Array(2048);
            for (let i = 0; i < 32; i++)
                for (let j = 0; j < 32; j++) {
                    pts[(i * 32 + j) * 2] = Math.round(x0 - halb + ((i + 0.5) * 2 * halb) / 32);
                    pts[(i * 32 + j) * 2 + 1] = Math.round(z0 - halb + ((j + 0.5) * 2 * halb) / 32);
                }
            const a = await r._fernAuftrag("teile", { punkte: pts });
            for (let i = 0; i < 32; i++)
                for (let j = 0; j < 32; j++) {
                    const k = i * 32 + j;
                    const t = a.law[k] < wl ? r._fernRingWasserTeile() : a.teile.subarray(k * 8, k * 8 + 8);
                    const sm = [saison.r, saison.g, saison.b];
                    for (let k = 0; k < 3; k++) c[k] += t[k] + (t[3 + k] * sm[k] - t[k]) * t[6];
                    d += t[6];
                }
            const rgb = c.map((v) => v / 1024);
            return {
                rgb: rgb.map((v) => +v.toFixed(4)),
                Y: +luma709(rgb).toFixed(4),
                deckung: +(d / 1024).toFixed(2),
            };
        };
        const lu = st.lodUniforms;
        const maskeAlt = lu && lu.uLodMaskOn ? lu.uLodMaskOn.value : null;
        const istNah = (m) => m.name === "bodenSatz";
        const istFern = (m) => m.userData && m.userData.inventar === "fern-ring";
        // DER RING WEICHT DEM GEBAUTEN: unter einem gezeichneten Chunk trägt die Schale 0 kein Dreieck (`_fernRingTeilung`
        // Klasse 2). Für die Schüsse der Linse zeichnet der
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
            bundles();
            for (const [l] of lichter) l.intensity = 0;
            A.intensity = e;
            if (maskeAlt != null) lu.uLodMaskOn.value = 0;
            // Das Licht der Linse ist ein neuer Lichter-Satz, ihr Ziel ein neuer Pass: jeder Stoff wartet auf seine Pipeline
            // (`_erstWartet`, asynchron; ein erster Schuss zeigte den Boden-Satz bei voller Deckung mit Y 0,694 statt 0,053). Der Schuss
            // steht erst, wenn zwei Läufe dieselben Bildpunkte UND dieselbe Helligkeit zeigen (höchstens 20 s); die Spur reist mit,
            // steht er nach der Frist nicht still, urteilt die Linse laut (`still`).
            let px = null,
                n = -1,
                yAlt = NaN,
                still = false,
                laeufe = 0;
            const spur = [];
            await ruhe(cam, "die Nah-Fern-Sicht");
            for (let lauf = 0, weiter = window.__deckel("die Ruhe der Nah-Fern-Sicht", 400); weiter(); lauf++) {
                zeichne(cam);
                px = await lies();
                laeufe = lauf + 1;
                let m = 0,
                    s = 0;
                for (let i = 3; i < px.length; i += 4)
                    if (px[i] > 0.5) {
                        m++;
                        s += luma709(px, i - 3);
                    }
                const y = m ? s / m : 0;
                if (spur.length < 12) spur.push([m, +y.toFixed(4)]);
                if (m === n && m > 0 && Math.abs(y - yAlt) <= 1e-4 + 1e-3 * yAlt) {
                    still = true;
                    break;
                }
                n = m;
                yAlt = y;
                // im Software-Holz übersetzt ein Programm über viele Läufe 
                if (m === 0 || lauf >= 4) await sleep(100);
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
                Y: +luma709(rgb).toFixed(4),
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
                // (`wiederholt` false): die Stille eines Schusses allein hält ein falsches Bild nie für fertig.
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
                    gesetz: await gesetz(o.x, o.z),
                });
            }
        } finally {
            // die Teilung des Rings steht wieder, wie sie war
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
            luftZurueck();
            if (maskeAlt != null) lu.uLodMaskOn.value = maskeAlt;
            rt.dispose();
            bundles();
        }
        // Die Karte der Fern-Krone im Boden-Stoff: steht sie nicht (bereit 0, oder ein Füll-Job offen — dann
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

// DAS URTEIL NAH GEGEN FERN (rein): beide Leser lesen EIN Gesetz an der Stelle (`gesetz`), jeder liegt in SEINEM Band — der
// Boden-Satz eng (`nah`: Karte 8 Bit im Raster N), der Fern-Ring nach seiner Abtastung (`fern`: Schale 0, 24 m; über 132 m
// −12 … +18 %), dazu der Grün-Anteil g / (r + g + b). ROT beim Namen (Klasse, Ort, der TÄTER: der Leser außerhalb seines Bands),
// wenn einer Klasse Orte fehlen (je drei Wald- und Wiesen-Orte), ein Schuss leer blieb oder nicht stillstand, das Gesetz fehlt, die
// Karte der Fern-Krone nicht steht, die Welt nicht stand (`welt`: 5 × 5 Chunks im Boden-Satz) oder ein Daten-Bild des Boden-Stoffs
// die GPU des Hauptbilds nicht erreicht (`upload`: Version gehoben, drei Takte Ruhe, die GPU hält sie).
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

// __laubGegenlicht({ art, abstand, sonne }) — DAS LAUB IM GEGENLICHT (phyto-core `laubDurchlass`): der nächste Baum der Art
// (Täter-Klasse f:<art>:L<stufe>, ein Exemplar aus der Instanz-Liste seiner Laub-Senke) aus `abstand` Metern (Augenhöhe 1,7 m,
// Blick auf die Kronen-Mitte), die Sonne in `sonne` Grad Höhe einmal HINTER der Krone (Gegenlicht), einmal hinter dem Auge
// (Auflicht) — dieselbe Höhe, gespiegeltes Azimut, dieselbe Licht-Kette (Sonne mit Schatten, Himmel, Hemi). Sichtbar nur die
// Laub-Züge der Art (Rinde, Boden, alles andere ruht); gezählt jedes geschriebene Pixel (Alpha > 0), das Mittel der linearen
// Luma (eigenes Halb-Float-Ziel, ungetont — ein Verhältnis braucht keine Tonung). Dazu je Lage das Bild (sRGB, Rest magenta).
function laubGegenlicht(opts) {
    return (async () => {
        opts = opts || {};
        const T = window.THREE;
        const sc = st.scene,
            rend = st.renderer;
        rend.setAnimationLoop(null);
        if (window.__buehne) window.__buehne();
        // DIE STUNDE (F6, `uhr` 0..1, 0,5 Mittag): die Bühne zu dieser Stunde, der Pfad des Spielers (sein Satz „nacht")
        if (Number.isFinite(opts.uhr)) (st.world && (st.world.timeOfDay = opts.uhr), r.setTimeOfDay(opts.uhr, "human"));
        const art = new RegExp("^f:" + (opts.art || "buche") + ":L");
        let abstand = opts.abstand || 8;
        let verdeckt = null;
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
            // DAS HAUS und DER BODEN (F6): der Bau-Satz zeichnet jede Gruppe der gesetzten Studio-Architektur, der Boden-Satz den Boden
            if (opts.haus || opts.boden ? o.name === (opts.haus ? "bauSatz" : "bodenSatz") : (k === "foliage" || k === "foliageTex") && art.test(r._taeterKlasse(o))) laub.push(o);
        });
        // der Schuss der Karte (`karte: 2`) sucht kein Exemplar: alle Kronen stehen auf der Karte, das Ziel ist das der Gestalt
        const vorher = opts.karte === 2 ? window.__karteGestalt : null;
        let freiAlt = null;
        if (!laub.length && !vorher) return { fehler: "keine Laub-Senke der Art " + art };
        // Das Exemplar: die nächste Instanz zum Spieler (ab 6 m, sonst stünde das Auge im Stamm).
        const m4 = new T.Matrix4(),
            p = new T.Vector3(),
            q = new T.Quaternion(),
            s = new T.Vector3();
        let ziel = null;
        const gef = (x, z) => [r._voxelSurfaceY(x + 2, z) - r._voxelSurfaceY(x - 2, z), r._voxelSurfaceY(x, z + 2) - r._voxelSurfaceY(x, z - 2)].map((v) => v / 4);
        for (const o of opts.haus || opts.boden ? [] : laub) {
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
                // `hang` (S2b): nur ein Exemplar an einem Hang mindestens so steil (Gefälle am Fuß), das Auge steht talwärts
                if ((opts.ziel || opts.anker || d > 6) && (!ziel || d < ziel.d) && (!opts.hang || opts.ziel || Math.hypot(...gef(p.x, p.z)) >= opts.hang)) {
                    const box = o.geometry.boundingBox.clone().applyMatrix4(m4);
                    ziel = { d, o, i, box, fuss: p.clone() };
                }
            }
        }
        // DAS HAUS (F6): der Eintrag `haus` nächst dem Anker (oder an `ziel`), Box aus den Slots seiner Gruppen, Stufe `_lodLevel`
        if (opts.haus) {
            const von = opts.ziel || opts.anker || [pp.x, pp.z];
            for (const e of st.architectures || []) {
                const pr = e && e.instFoundry === true && Array.isArray(e.instSlots) ? r._foundryPresetForEntry(e) : null;
                const d = pr && r._foundry.recipes[pr] && r._foundry.recipes[pr].kind === "haus" ? Math.hypot(e.position.x - von[0], e.position.z - von[1]) : Infinity;
                if (!(d < (ziel ? ziel.d : Infinity))) continue;
                const box = e.instSlots.map((sl) => st.archInstanceGroups.get(sl.key) && [st.archInstanceGroups.get(sl.key), sl.slot]).filter((gs) => gs && gs[0].mesh && !gs[0].shadowTwin)
                    .reduce((b, [g, i]) => (g.mesh.getMatrixAt(i, m4), b.union((g.mesh.geometry.boundingBox || (g.mesh.geometry.computeBoundingBox(), g.mesh.geometry.boundingBox)).clone().applyMatrix4(m4.premultiply(g.mesh.matrixWorld)))), new T.Box3());
                if (!box.isEmpty()) ziel = { d, e, preset: pr, box, fuss: new T.Vector3(e.position.x, e.position.y, e.position.z) };
            }
        }
        // DER BODEN (F6): die Stelle S (± 6 m, 12–90 m vom Anker) im Boden-Satz, eben (am Hang trägt die grobe Normale des Rings die
        // Sonne anders: Form, nicht Licht), wo Satz und Gesetz des Rings auf 0,5 m gleich hoch liegen (das Dorf ebnet seinen Grund)
        if (opts.boden) {
            const bb = [...st.chunkSaetze.get("boden").bloecke.values()].map((q) => (q.geom.boundingBox || q.geom.computeBoundingBox(), q.geom.boundingBox)), drin = (x, z) => bb.some((q) => x >= q.min.x && x <= q.max.x && z >= q.min.z && z <= q.max.z);
            const von = opts.ziel || opts.anker || [pp.x, pp.z], kand = [];
            for (let rad = opts.ziel ? 0 : 12; rad <= (opts.ziel ? 0 : 90); rad += 6)
                for (let k = 0; k < (opts.ziel ? 1 : 24); k++) {
                    const [x, z] = [von[0] + rad * Math.cos((k * Math.PI) / 12), von[1] + rad * Math.sin((k * Math.PI) / 12)], pkt = [[0, 0], [6, 0], [-6, 0], [0, 6], [0, -6]].map(([u, v]) => [x + u, z + v]), h = pkt.map(([u, v]) => (drin(u, v) ? r._voxelSurfaceY(u, v) : NaN));
                    if (h.every((y) => y > (st.waterLevel || 0) + 1) && Math.hypot(h[1] - h[2], h[3] - h[4]) <= 1.44 && Math.abs(h[1] + h[2] - 2 * h[0]) + Math.abs(h[3] + h[4] - 2 * h[0]) <= 0.4) kand.push({ x, z, h, pkt });
                }
            const g = kand.length && !opts.ziel ? await r._fernAuftrag("teile", { punkte: new Float64Array(kand.flatMap((c) => c.pkt.flat())) }) : null;
            const c = kand.find((c, i) => !g || c.h.every((y, j) => Math.abs(g.law[i * 5 + j] - y) <= 0.5));
            if (c) ziel = { d: 0, box: new T.Box3(new T.Vector3(c.x - 6, Math.min(...c.h) - 0.5, c.z - 6), new T.Vector3(c.x + 6, Math.max(...c.h) + 0.5, c.z + 6)), fuss: new T.Vector3(c.x, c.h[0], c.z) };
        }
        if (vorher) ziel = vorher.ziel;
        if (!ziel) return { fehler: opts.haus ? "kein Haus" : opts.boden ? "keine Stelle im Boden-Satz" : "kein Exemplar der Art" };
        if (opts.haus && Number.isFinite(opts.stufe) && ziel.e._lodLevel !== opts.stufe)
            return { fehler: `das Haus steht in Stufe ${ziel.e._lodLevel}, nicht ${opts.stufe}` };
        // der Schuss der Gestalt nur am Exemplar des Plans in seiner Gestalt (sonst stünde ein fremder Baum im Vergleich)
        if (opts.karte === 1 && opts.ziel && ziel.d > 1.5) return (window.__karteGestalt = null), { fehler: "das Exemplar zeigt keine Gestalt", d: +ziel.d.toFixed(1) };
        const mitte = ziel.box.getCenter(new T.Vector3());
        const hoehe = ziel.box.max.y - ziel.fuss.y;
        const blickVon = opts.anker && !opts.ziel ? opts.anker : [pp.x, pp.z];
        const tal = opts.hang && !opts.ziel ? gef(ziel.fuss.x, ziel.fuss.z) : null;
        let dh = (tal ? new T.Vector3(-tal[0], 0, -tal[1]) : new T.Vector3(blickVon[0] - ziel.fuss.x, 0, blickVon[1] - ziel.fuss.z)).normalize();
        // DAS SPIEL-AUGE (S2b): `wechsel` stellt das Auge in den Abstand, ab dem das Spiel die Karte zeigt — die Stufen-Wahl
        // (`_chooseLODForDistance`) aus der Karte heraus für die Höhe des Exemplars, die nächste Distanz mit Karte —, mal `wechsel`;
        // `augeH` ist die Augenhöhe über dem Boden (Ego 1,6, Third 3,5).
        if (opts.wechsel > 0 && !opts.boden) {
            let d = 4;
            while (d < 600 && r._chooseLODForDistance(d, 2, hoehe) !== 2) d += 0.25;
            abstand = d * opts.wechsel;
            // FREIE SICHT: im Spiel-Abstand stünde das Exemplar im Wald hinter anderen Kronen, und der Vergleich zählte ihre Stufen
            // mit — das Auge nimmt die Peilung (24 Richtungen, am Hang höchstens 60° neben talwärts), deren Gang zum Exemplar keine
            // andere Krone (jede Laub- und Karten-Senke, Kronen-Radius 3,5 m) kreuzt, sonst die mit den wenigsten
            const baeume = [];
            for (const o of opts.plan ? alle : []) {
                if (!o.isInstancedMesh || !/^(f|fimp):/.test(r._taeterKlasse(o))) continue;
                for (let i = 0; i < o.count; i++) {
                    o.getMatrixAt(i, m4);
                    m4.premultiply(o.matrixWorld);
                    p.setFromMatrixPosition(m4);
                    if (Math.hypot(p.x - ziel.fuss.x, p.z - ziel.fuss.z) > 0.5) baeume.push(p.x, p.z);
                }
            }
            let best = null;
            for (let k = 0; k < 24; k++) {
                const a = (k / 24) * Math.PI * 2;
                const ux = Math.cos(a), uz = Math.sin(a);
                if (tal && ux * dh.x + uz * dh.z < 0.5) continue;
                let n = 0;
                for (let j = 0; j < baeume.length; j += 2) {
                    const qx = baeume[j] - ziel.fuss.x, qz = baeume[j + 1] - ziel.fuss.z;
                    const t = qx * ux + qz * uz;
                    if (t > 2 && t < abstand && Math.abs(qx * uz - qz * ux) < 3.5) n++;
                }
                if (!best || n < best.n) best = { n, ux, uz };
            }
            if (best && opts.plan) {
                dh = new T.Vector3(best.ux, 0, best.uz);
                verdeckt = best.n;
            }
        }
        // Die Stufe folgt dem Spieler: `plan` nennt den Augen-Ort (der Aufrufer stellt den Spieler dorthin und lässt die Stufen
        // einschwingen); mit `ziel` steht das Auge am Spieler.
        // mit `auge` (x, z) steht das Auge genau am Plan-Ort (der Spieler darf beim Einschwingen rutschen)
        const auge = opts.ziel
            ? new T.Vector3(opts.auge ? opts.auge[0] : pp.x, 0, opts.auge ? opts.auge[1] : pp.z)
            : ziel.fuss.clone().add(dh.clone().multiplyScalar(abstand));
        auge.y = r._voxelSurfaceY(auge.x, auge.z) + (opts.augeH || 1.7);
        // `l1`: die Schwelle der Karte, unter der das Exemplar im Auge seine L1 VOLL zeigt (der Schuss der Gestalt) — jenseits
        // der Hysterese UND der Blende (sonst stünde die L1 halb in der Karten-Blende, die die CPU nicht zeichnet)
        const D = r.constructor.LOD_DISTANCES;
        const l1 = +(Math.max(r._lodPerceptionDistance(abstand, hoehe), opts.haus ? abstand : 0) + Math.max(D.hysteresis, D.fade || 0) + 1).toFixed(1);
        // DAS FERNE AUGE (der Boden): 400 m vor S, der flachste Blick von oben (≥ 1°) — dort zeichnet der Fern-Ring S (Schuss 2)
        let fern = null;
        for (let j = 0; opts.plan && opts.boden && j < 24; j++) {
            const [fx, fz] = [ziel.fuss.x + 400 * Math.cos((j * Math.PI) / 12), ziel.fuss.z + 400 * Math.sin((j * Math.PI) / 12)], neig = Math.atan2(r._voxelSurfaceY(fx, fz) + (opts.augeH || 1.7) - ziel.fuss.y, 400);
            if (neig >= Math.PI / 180 && r._voxelSurfaceY(fx, fz) > (st.waterLevel || 0) && (!fern || neig < fern[2])) fern = [fx, fz, neig];
        }
        if (opts.plan) return opts.boden && !fern ? { fehler: "kein fernes Auge über der Stelle" } : { fern, ziel: [ziel.fuss.x, ziel.fuss.z], auge: [auge.x, auge.z], hoehe: +hoehe.toFixed(1), abstand: +abstand.toFixed(1), l1, verdeckt, gefaelle: +(ziel.fuss.y - auge.y + (opts.augeH || 1.7)).toFixed(1) };
        const cam = st.camera;
        const dl = st.directionalLight;
        const dlAlt = { p: dl.position.clone(), t: dl.target.position.clone() };
        const visAlt = new Map(alle.map((m) => [m, m.visible]));
        const zl = window.__linsenZiel(W, H),
            { rt, bundles } = zl,
            kamZurueck = zl.kamera(cam);
        let luftZurueck;
        if (elev == null)
            elev = Math.max(
                (5 * Math.PI) / 180,
                Math.atan2(mitte.y - auge.y, Math.hypot(mitte.x - auge.x, mitte.z - auge.z))
            );
        const out = {
            art: opts.haus ? ziel.preset : opts.boden ? "boden" : opts.art || "buche",
            abstand: +Math.hypot(auge.x - ziel.fuss.x, auge.z - ziel.fuss.z).toFixed(1),
            gefaelle: +(ziel.fuss.y - auge.y + (opts.augeH || 1.7)).toFixed(1),
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
            const bild = await lies("das Laub im Gegenlicht");
            sc.environmentIntensity = envAlt;
            dl.castShadow = schattenAlt;
            return bild;
        };
        // Ein Bild der sichtbaren Züge aus `cam` in das Halb-Float-Ziel: je Pixel die lineare Luma (−1 ungeschrieben) und das Bild.
        const lies = async (wer) => {
            await zl.ruhe(cam, wer);
            for (let k = 0; k < 3; k++) zl.zeichne(cam);
            const px = await zl.lies();
            const img = { data: new Uint8ClampedArray(W * H * 4) };
            const enc = (v) => Math.round(255 * Math.min(1, linSrgb(v)));
            const Yp = new Float32Array(W * H).fill(-1),
                Cp = new Float32Array(W * H * 3);
            for (let y = 0; y < H; y++)
                for (let x = 0; x < W; x++) {
                    const i = (y * W + x) * 4;
                    const o = ((H - 1 - y) * W + x) * 4;
                    if (px[i + 3] > 0) {
                        const c = [px[i], px[i + 1], px[i + 2]];
                        Yp[y * W + x] = luma709(c);
                        Cp.set(c, (y * W + x) * 3);
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
            return { Yp, Cp, png: window.__png(img.data, W, H) };
        };
        try {
            for (const m of alle) m.visible = laub.includes(m);
            bundles();
            luftZurueck = zl.ohneLuft();
            if (opts.karte) {
                // DIE KARTE GEGEN IHRE GESTALT (A7, Lehre 19/21: Labor = Welt, die Karte ist dieselbe Krone in einer anderen Stufe):
                // dasselbe Auge auf die Kugel des Exemplars, die Licht-Kette der Bühne (Sonne mit Schatten, Himmel), derselbe Baum-Satz
                // (Laub, Rinde, Karten jeder Art) — Schuss 1 in den Stufen der Gestalt, Schuss 2 (der Aufrufer stellt die Stufen auf
                // die Karte) jede Krone als Karte. Gezählt jedes Pixel im Rechteck der Box, das beide zeichnen; Mittel linear, L*, C*ab.
                const fr = opts.karte === 2 && opts.boden ? st.fernRing : null;
                const frei = fr && fr.teilung && fr.teilung.frei ? fr.teilung.frei.index : null;
                const naht = fr ? fr.meshes.find((m) => m.geometry === fr.teilung.naht) : null;
                if (frei && fr.geos[0].index.array.length === frei.array.length) (freiAlt = [frei, frei.array.slice()]), frei.array.set(fr.geos[0].index.array), (frei.needsUpdate = true);
                for (const m of alle)
                    m.visible = opts.boden ? (fr ? m !== naht && m.userData.inventar === "fern-ring" : laub.includes(m)) : opts.haus ? laub.includes(m) || m.name === "bauWurf" : /^fimp:/.test(r._taeterKlasse(m)) || (/^f:/.test(r._taeterKlasse(m)) && /^(bark|foliage|foliageTex|schatten)$/.test(m.material && m.material.userData && m.material.userData.foundryKind));
                bundles();
                const fovAlt = cam.fov,
                    rad = ziel.box.min.distanceTo(ziel.box.max) / 2;
                cam.position.copy(auge);
                cam.lookAt(mitte);
                cam.fov = Math.min(fovAlt, (360 / Math.PI) * Math.atan((1.1 * rad) / auge.distanceTo(mitte)));
                // DIE TIEFEN-SCHEIBE (S2b): im Spiel-Abstand stehen Kronen vor und hinter dem Exemplar im Rechteck (Wald, Gebüsch,
                // die Kronen hinter ihm in fremder Stufe) — die Kamera zeichnet nur den Zylinder des Exemplars (near/far um seine
                // Mitte, so tief wie die Krone breit: die Kugel der Box trug beim hohen Baum die halbe Höhe als Tiefe)
                const nfAlt = [cam.near, cam.far],
                    rxz = Math.max(ziel.box.max.x - ziel.box.min.x, ziel.box.max.z - ziel.box.min.z) / 2;
                cam.near = Math.max(0.1, auge.distanceTo(mitte) - rxz);
                cam.far = auge.distanceTo(mitte) + rxz;
                cam.updateProjectionMatrix();
                cam.updateMatrixWorld(true);
                const rand = [0, 0]; // die Box im Bild, um die Mitte (die Zeilen-Richtung des Rücklesens zählt nicht)
                for (let k = 0; k < 8; k++) {
                    const e = new T.Vector3(k & 1 ? ziel.box.max.x : ziel.box.min.x, k & 2 ? ziel.box.max.y : ziel.box.min.y, k & 4 ? ziel.box.max.z : ziel.box.min.z).project(cam);
                    rand[0] = Math.max(rand[0], Math.abs(e.x));
                    rand[1] = Math.max(rand[1], Math.abs(e.y));
                }
                const wurf = dl.castShadow;
                dl.castShadow = wurf && !opts.boden; // der Boden ohne Schatten: die Kaskaden folgen dem Auge, die ferne Stelle läge außerhalb
                const b = await lies("die Karte gegen die Gestalt");
                dl.castShadow = wurf;
                // DIE STELLE IM BILD (der Boden): gezählt wird je Schuss, was waagrecht in 6 m um S liegt (Orts-Stoff: die Welt-Lage je Pixel)
                if (opts.boden) {
                    const os = new T.MeshBasicNodeMaterial({ side: T.DoubleSide }), sicht = alle.filter((m) => m.visible), stoffe = sicht.map((m) => m.material);
                    os.colorNode = T.TSL.vec4(T.TSL.positionWorld.sub(T.TSL.uniform(ziel.fuss.clone())), 1);
                    sicht.forEach((m) => (m.material = os));
                    const o = await lies("der Ort der Stelle");
                    sicht.forEach((m, i) => (m.material = stoffe[i]));
                    os.dispose();
                    b.maske = Uint8Array.from(o.Yp, (y, i) => +(y !== -1 && b.Yp[i] >= 0 && Math.hypot(o.Cp[i * 3], o.Cp[i * 3 + 2]) <= 6));
                }
                [cam.near, cam.far] = nfAlt;
                cam.fov = fovAlt;
                cam.updateProjectionMatrix();
                const stufeJetzt = opts.boden ? (opts.karte === 1 ? "bodenSatz" : "fern-ring") : opts.haus ? "f:" + ziel.preset + ":L" + ziel.e._lodLevel : r._taeterKlasse(ziel.o);
                if (opts.karte === 1) return (window.__karteGestalt = Object.assign(out, b, { stufe: stufeJetzt, ziel })), { stufe: out.stufe };
                const g = window.__karteGestalt;
                const lab = window.__lab;
                if (opts.boden) {
                    const mittel = (x, m = x.maske.reduce((s, v) => s + v, 0)) => m ? Object.assign(lab([0, 1, 2].map((q) => x.Cp.reduce((s, v, i) => (i % 3 === q && x.maske[(i / 3) | 0] ? s + v : s), 0) / m)), { pixel: m }) : null;
                    const [lg, lk] = [mittel(g), mittel(b)];
                    if (!lg || !lk) return { fehler: "die Stelle zeichnet kein Pixel" };
                    return Object.assign(out, { stufe: g.stufe + " → " + stufeJetzt, paar: "fern/nah", karte: { gestalt: lg, karte: lk, verhaeltnis: +(lk.Y / lg.Y).toFixed(3), dL: +(lk.L - lg.L).toFixed(2), dC: +(lk.C - lg.C).toFixed(2), png: [g.png, b.png] } });
                }
                const sg = [0, 0, 0], sk = [0, 0, 0];
                let n = 0;
                // DAS EXEMPLAR ALLEIN (S2b): gezählt wird die Insel um die Mitte der Krone, die beide Schüsse zeichnen (Lücken
                // bis 3 px gehören zur Krone) — Nachbarn in derselben Tiefe stehen als eigene Inseln daneben
                const im = (i) => g && g.Yp[i] >= 0 && b.Yp[i] >= 0 && Math.abs(((i % W) + 0.5) / W * 2 - 1) <= rand[0] && Math.abs((((i / W) | 0) + 0.5) / H * 2 - 1) <= rand[1];
                const insel = new Uint8Array(W * H), stapel = [];
                for (let i = 0, best = Infinity; i < W * H; i++) {
                    const dd = ((i % W) - W / 2) ** 2 + (((i / W) | 0) - H / 2) ** 2;
                    if (im(i) && dd < best) (best = dd), (stapel[0] = i);
                }
                if (stapel.length) insel[stapel[0]] = 1;
                while (stapel.length) {
                    const i = stapel.pop(), x = i % W, y = (i / W) | 0;
                    for (let v = Math.max(0, y - 3); v <= Math.min(H - 1, y + 3); v++)
                        for (let u = Math.max(0, x - 3); u <= Math.min(W - 1, x + 3); u++) if (!insel[v * W + u] && im(v * W + u)) (insel[v * W + u] = 1), stapel.push(v * W + u);
                }
                for (let i = 0; g && i < W * H; i++)
                    if (insel[i]) {
                        for (let c = 0; c < 3; c++) (sg[c] += g.Cp[i * 3 + c]), (sk[c] += b.Cp[i * 3 + c]);
                        n++;
                    }
                if (!n) return { fehler: g ? "Karte und Gestalt teilen kein Pixel" : "kein Schuss der Gestalt (karte: 1)" };
                const lg = lab(sg.map((v) => v / n)), lk = lab(sk.map((v) => v / n));
                return Object.assign(out, { stufe: opts.haus || opts.boden ? g.stufe + " → " + stufeJetzt : g.stufe, paar: opts.haus || opts.boden ? "fern/nah" : undefined, pixel: n, karte: { gestalt: lg, karte: lk, verhaeltnis: +(lk.Y / lg.Y).toFixed(3), dL: +(lk.L - lg.L).toFixed(2), dC: +(lk.C - lg.C).toFixed(2), png: [g.png, b.png] } });
            }
            if (opts.oben) {
                // DIE KRONE VON OBEN (Nordstern §4.5 „Bestandes-Albedo … von oben im Ausgabe-Pfad“): das Auge lotrecht
                // über dem Exemplar, die Licht-Kette der Bühne unberührt (Mittag, Sommer, Sonne mit Schatten, Himmel). Drei Bilder
                // aus demselben Auge: die Krone im Licht (L), dieselbe Krone unter weißem Umgebungslicht π und 0 (A = hell − dunkel,
                // die Blatt-Albedo derselben Pixel) und allein eine waagrechte 18-%-Karte über der Spitze (Lk, unbeschattet).
                // Die Reflexion der Krone R = 0,18 · L / Lk (= π·L/E); das Soll rechnet `kronenObenUrteil` aus A.
                const kopf = ziel.box.max.y;
                const breit = Math.max(ziel.box.max.x - ziel.box.min.x, ziel.box.max.z - ziel.box.min.z, 2);
                const fov = (cam.fov * Math.PI) / 180;
                cam.position.set(mitte.x, kopf + (0.75 * breit) / Math.tan(fov / 2), mitte.z);
                cam.quaternion.setFromEuler(new T.Euler(-Math.PI / 2, 0, 0));
                cam.updateMatrixWorld(true);
                const krone = await lies("die Krone von oben");
                const lichter = [];
                sc.traverse((o) => {
                    if (o.isLight) lichter.push([o, o.intensity]);
                });
                // die Albedo wie `__albedoSicht`: das Umgebungslicht der Szene weiß (ein neues Licht wechselt die Licht-Signatur
                // jedes Programms), die übrigen Lichter und der Himmel still
                const envA = sc.environment;
                let amb = st.ambientLight || lichter.map((e) => e[0]).find((l) => l.isAmbientLight);
                const ambEigen = amb ? null : new T.AmbientLight(0xffffff, 0);
                if (ambEigen) sc.add((amb = ambEigen));
                const ambFarbe = amb.color.clone();
                let hell, dunkel;
                try {
                    for (const [l] of lichter) l.intensity = 0;
                    sc.environment = null;
                    amb.color.setRGB(1, 1, 1);
                    amb.intensity = Math.PI;
                    await lies("die Albedo der Krone");
                    hell = await lies("die Albedo der Krone");
                    amb.intensity = 0;
                    dunkel = await lies("die Albedo der Krone");
                } finally {
                    if (ambEigen) sc.remove(ambEigen);
                    amb.color.copy(ambFarbe);
                    for (const [l, i] of lichter) l.intensity = i;
                    sc.environment = envA;
                }
                const karte = new T.Mesh(
                    new T.PlaneGeometry(breit * 2, breit * 2),
                    new T.MeshStandardNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 })
                );
                karte.rotation.x = -Math.PI / 2;
                karte.position.set(mitte.x, kopf + 0.05, mitte.z);
                karte.updateMatrixWorld(true);
                let kb;
                try {
                    sc.add(karte);
                    for (const m of laub) m.visible = false;
                    bundles();
                    kb = await lies("die 18-%-Karte über der Krone");
                } finally {
                    sc.remove(karte);
                    karte.geometry.dispose();
                    karte.material.dispose();
                    for (const m of laub) m.visible = true;
                    bundles();
                }
                let sl = 0,
                    sa = 0,
                    n = 0,
                    sk = 0,
                    nk = 0;
                for (let i = 0; i < W * H; i++) {
                    if (kb.Yp[i] >= 0) {
                        sk += kb.Yp[i];
                        nk++;
                    }
                    if (krone.Yp[i] >= 0 && hell.Yp[i] >= 0 && dunkel.Yp[i] >= 0) {
                        sl += krone.Yp[i];
                        sa += hell.Yp[i] - dunkel.Yp[i];
                        n++;
                    }
                }
                const LL = window.__phytoCore && window.__phytoCore.LAUB_LICHT;
                const sd = dl.position.clone().sub(dl.target.position).normalize();
                out.oben = {
                    pixel: n,
                    L: n ? +(sl / n).toFixed(5) : null,
                    Lk: nk ? +(sk / nk).toFixed(5) : null,
                    A: n ? +(sa / n).toFixed(4) : null,
                    R: n && nk && sk > 0 ? +((0.18 * (sl / n)) / (sk / nk)).toFixed(4) : null,
                    tau: LL ? [LL.tauNadel, LL.tauLaub] : null,
                    sonneGrad: +((Math.asin(Math.max(-1, Math.min(1, sd.y))) * 180) / Math.PI).toFixed(1),
                    // die Stufe des Exemplars (die Täter-Klasse seiner Laub-Senke) — der Täter beim Namen
                    stufe: r._taeterKlasse(ziel.o),
                    png: krone.png,
                };
                out.stoffe = laub.map((m) => m.material.userData.laubLicht || "ohne").join(",");
                return out;
            }
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
            if (freiAlt) freiAlt[0].array.set(freiAlt[1]), (freiAlt[0].needsUpdate = true);
            for (const m of alle) m.visible = visAlt.get(m);
            bundles();
            if (luftZurueck) luftZurueck();
            dl.position.copy(dlAlt.p);
            dl.target.position.copy(dlAlt.t);
            dl.target.updateMatrixWorld(true);
            dl.updateMatrixWorld(true);
            kamZurueck();
            cam.updateMatrixWorld(true);
            rt.dispose();
            r._applyDayNightToScene();
        }
        return out;
    })();
}

// Linear-RGB → Luma Y, L*, C*ab (D65): die Farb-Zahl jeder Karten- und Weg-Zeile
function lab(rgb) {
    const [L, a, b] = cielab(rgb);
    return { Y: +luma709(rgb).toFixed(5), L: +L.toFixed(2), C: +Math.hypot(a, b).toFixed(2) };
}

// DER LICHTWEG (Licht K3): dieselbe graue Fläche (18 %) im Licht der Welt-Stoffe (eine MeshStandard-Karte gleicher Normale aus
// demselben Auge) und im Licht eines Wegs, der den Baustein `_weltLicht` ruft — `panorama` (seine Textur grau), `feld` (ein grauer
// Kasten im Welt-March), `spiegel` (die Spiegelung einer grauen Wand über Wasser), `wasser` (der Körper: das Bild mit minus ohne sein
// Licht, ÷ R∞) — je Stunde, ohne Luft und Schatten. Eine Zahl am Namen (`feld0`, `spiegel180`) stellt die Fläche senkrecht, ihre
// Normale so viele Grad neben dem Azimut der Sonne (0 zur Sonne); `feld` liegt waagrecht, die Welt des Spiegels auch (der Boden
// des Spiegel-Felds im Licht des Boden-Stoffs). Das Urteil ist absolut (`weg`): 0,9–1,1.
function lichtWeg(opts) {
    return (async () => {
        const T = window.THREE, sc = st.scene, rend = st.renderer, cam = st.camera, fp = st.feldPass;
        const [, art, grad] = /^([a-z]+)(\d*)$/.exec(opts.weg), senkrecht = grad !== "" && art !== "spiegel";
        rend.setAnimationLoop(null);
        if (window.__buehne) window.__buehne();
        if (Number.isFinite(opts.uhr)) (st.world && (st.world.timeOfDay = opts.uhr), r.setTimeOfDay(opts.uhr, "human"));
        await r._himmelFrisch();
        if (!fp) return { fehler: "kein Feld-Pass" };
        r._weltLichtTakt();
        const pp = st.playerMesh.position, o = new T.Vector3(pp.x, r._voxelSurfaceY(pp.x, pp.z) + 45, pp.z), unten = new T.Vector3(0.001, -1, 0);
        const W = 32, zl = window.__linsenZiel(W, W), rt = zl.rt, alle = [], dl = st.directionalLight, wurf = dl.castShadow;
        // die Normale der senkrechten Fläche: waagrecht, `grad` Grad neben dem Azimut der Sonne — das Auge blickt gegen sie
        const nh = dl.position.clone().sub(dl.target.position).setY(0).normalize().applyAxisAngle(new T.Vector3(0, 1, 0), ((+grad || 0) * Math.PI) / 180);
        sc.traverse((m) => (m.isMesh || m.isSprite || m.isPoints) && alle.push([m, m.visible]));
        let luftZurueck;
        const kamZurueck = zl.kamera(cam);
        const flaeche = (mat, kipp) => Object.assign(new T.Mesh(new T.PlaneGeometry(40, 40).rotateX(kipp), mat), { frustumCulled: false });
        const karte = flaeche(new T.MeshStandardNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18), roughness: 1, metalness: 0 }), -Math.PI / 2);
        const see = flaeche(r._ensureHydroSurfaceMaterial(), Math.PI / 2), n = see.geometry.attributes.position.count;
        [["aFlow", 2, 0], ["aWave", 1, 0], ["aDepth", 1, 20], ["aSlope", 1, 0]].forEach(([a, k, v]) => see.geometry.setAttribute(a, new T.Float32BufferAttribute(new Float32Array(n * k).fill(v), k)));
        // DER KÖRPER IM FLÜSSIGEN WASSER (stoffe.K3, wie die Bühne von diag-post-kette): `wasser` und `spiegel` stehen mit Auge,
        // Karte und Fläche 10 m unter der tiefsten Linie, über der Eis beginnt (`_eisLinien`), höchstens am Auge des Orts — 43 m
        // über dem Dorf (127,8 m) lag die Fläche seit stoffe.K3-2 im Eis des Sommers (die Linie 102,3 m an ihrer Säule), und Eis
        // ÷ R∞ des Wassers ist kein Lichtweg (Luma 126,9). Das Licht der Welt hängt nicht an der Höhe (`_weltLicht`).
        if (art === "wasser" || art === "spiegel") o.y =Math.min(o.y, Math.min(...r._eisLinien().null) - 8);
        karte.position.copy(o).y -= 2;
        see.position.copy(karte.position);
        sc.add(karte, see);
        const lies = async (ding, blick, wand) => {
            cam.position.copy(o);
            cam.lookAt(o.clone().add(blick));
            cam.updateMatrixWorld(true);
            // der Takt des Feld-Passes für DIESES Auge (Strahl, Stellvertreter), ohne neues Panorama
            [fp.panoFlug, fp.mesh.visible] = [true, true];
            r._tickFeldPass(st.fernRing);
            for (const [m] of alle) m.visible = m === ding;
            [karte, see].forEach((m) => (m.visible = m === ding));
            if (wand) karte.position.copy(o).add(blick), karte.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), blick.clone().normalize().negate()), karte.updateMatrixWorld(true);
            zl.bundles();
            await zl.ruhe(cam, "der Lichtweg");
            const px = await zl.lies(), s = [0, 0, 0];
            for (let y = W / 2 - 4; y < W / 2 + 4; y++) for (let x = W / 2 - 4; x < W / 2 + 4; x++) for (let c = 0; c < 3; c++) s[c] += px[(y * W + x) * 4 + c] / 64;
            return s;
        };
        const panoAlt = fp.panoDaten.slice(), WL = Object.values(r._weltLicht().U), wlAlt = WL.map((u) => (u.value.clone ? u.value.clone() : u.value));
        try {
            // ohne Wurf trägt kein Stoff einen Schatten — der Baustein liest es im Takt (`wurf`): die Pässe messen wie die Karte
            dl.castShadow = false;
            r._weltLichtTakt();
            luftZurueck = zl.ohneLuft();
            let welt = await lies(karte, senkrecht ? nh.clone().multiplyScalar(-3) : unten, senkrecht);
            let weg;
            if (art === "panorama") {
                for (let i = 0; i < fp.panoDaten.length; i += 4) fp.panoDaten.set([0.18, 0.18, 0.18, 3000], i);
                fp.panoTex.needsUpdate = true;
                weg = await lies(fp.mesh, new T.Vector3(1, -0.1, 0));
            } else if (art === "spiegel") {
                // DER SPIEGEL: über einer Wasser-Fläche (Feld-Zellen Art 1) 30 m voraus eine graue Wand (18 %, ihre Fläche 45° neben
                // der Sonne: Sonne und Himmel, kein Glanz der Karte im Rücken des Auges), das Auge 2 m darüber blickt 25° hinab (Öffnung 20°) — jeder gespiegelte Strahl verlässt den Schirm, das
                // Feld des Spiegel-Passes trägt ihn. Die Wand des Felds ist Boden (Art 0): der Spiegel lichtet sie wie der Boden-Stoff (die
                // geflattete Licht-Normale, ohne Wurf keine Zuwendung, w4) — die Welt ist die Karte waagrecht aus demselben Auge.
                const S = r._spiegelFeld(), L = r._spiegelLeser(), K = r.constructor.SPIEGEL, n = S.n, alt = [S.daten.slice(), S.stoff.slice(), S.hoechste.slice(), S.mitte, S.hMax];
                const H = see.position.y - S.bezug, fov = cam.fov;
                const I0 = Math.floor(o.x / K.texel) - n / 2, J0 = Math.floor(o.z / K.texel) - n / 2, w = (k, k0, a) => (k0 + ((((k - k0) % n) + n) % n) + 0.5) * K.texel - a;
                S.hoechste.fill(-30000);
                for (let j = 0; j < n; j++)
                    for (let i = 0; i < n; i++) {
                        const istWand = -(w(i, I0, o.x) * nh.x + w(j, J0, o.z) * nh.z) > 30, h = istWand ? H + 60 : H - 0.6, b = Math.floor(j / K.block) * S.nb + Math.floor(i / K.block);
                        S.daten.set([T.DataUtils.toHalfFloat(h), S.leer, S.leer, 0], (j * n + i) * 4);
                        S.stoff.set(istWand ? [108, 108, 108, 0] : [0, 0, 0, 1], (j * n + i) * 4);
                        S.hoechste[b] = Math.max(S.hoechste[b], h);
                    }
                [S.tex, S.stoffTex, S.hTex].forEach((t) => (t.needsUpdate = true));
                [S.mitte, S.hMax, cam.fov] = [[o.x, o.z], H + 60, 20];
                cam.updateProjectionMatrix();
                try {
                    cam.lookAt(o.clone().add(nh.clone().negate().setY(-Math.tan((25 * Math.PI) / 180))));
                    cam.updateProjectionMatrix();
                    cam.updateMatrixWorld(true);
                    [karte.visible, see.visible] = [false, true];
                    // das Feld lädt seine Texturen erst im Bild hoch: die Erst-Ruhe, dann drei Läufe
                    const lauf = () => (st.postProcessing.render(), r._spiegelPassRechne(L));
                    await window.__erstRuhe(lauf, {}, "der Spiegel");
                    for (let k = 0; k < 3; k++) lauf(), await sleep(200);
                    const [Wr, Hr] = [L.rt.width, L.rt.height], px = await rend.readRenderTargetPixelsAsync(L.rt, 0, 0, Wr, Hr), sch = px.length / Hr;
                    weg = [0, 1, 2].map((c) => { let a = 0; for (let y = (Hr >> 1) - 4; y < (Hr >> 1) + 4; y++) for (let x = (Wr >> 1) - 4; x < (Wr >> 1) + 4; x++) a += T.DataUtils.fromHalfFloat(px[y * sch + x * 4 + c]); return a / 64; });
                } finally {
                    [S.daten, S.stoff, S.hoechste].forEach((d, k) => d.set(alt[k]));
                    [S.tex, S.stoffTex, S.hTex].forEach((t) => (t.needsUpdate = true));
                    [S.mitte, S.hMax, cam.fov] = [alt[3], alt[4], fov];
                    S.stand++;
                    cam.updateProjectionMatrix();
                }
            } else if (art === "feld") {
                // der graue Kasten: waagrecht 2,5 m unter dem Auge, senkrecht 12 m voraus mit der dünnen Achse auf `nh`
                const m = senkrecht ? new T.Matrix4().makeRotationY(Math.atan2(-nh.z, nh.x)).setPosition(o.clone().addScaledVector(nh, -12)) : new T.Matrix4().makeTranslation(o.x, o.y - 2.5, o.z);
                const h = r._weltKapselSpawn("lichtweg:" + opts.weg, m, () => [{ box: true, c: new T.Vector3(), h: senkrecht ? new T.Vector3(0.5, 20, 20) : new T.Vector3(20, 0.5, 20), farbe: { r: 0.18, g: 0.18, b: 0.18 } }]);
                weg = await lies(fp.march, senkrecht ? nh.clone().negate() : unten).finally(() => r._weltFeldFrei(h));
            } else {
                const mit = await lies(see, unten), R = r.constructor._wasserKoerper(r.constructor.Gesetz("terrain:WASSER_GESETZ"));
                WL.forEach((u) => (u.value = u.value.clone ? u.value.setScalar(0) : 0));
                const ohne = await lies(see, unten);
                weg = mit.map((v, c) => ((v - ohne[c]) / R[c]) * 0.18);
            }
            const [lw, lk] = [window.__lab(welt), window.__lab(weg)];
            return { art: opts.weg, stufe: "welt-stoff → " + opts.weg, weg: true, karte: { gestalt: lw, karte: lk, verhaeltnis: +(lk.Y / lw.Y).toFixed(3), dL: +(lk.L - lw.L).toFixed(2), dC: +(lk.C - lw.C).toFixed(2) } };
        } finally {
            fp.panoDaten.set(panoAlt);
            fp.panoFlug = false;
            fp.panoTex.needsUpdate = true;
            WL.forEach((u, i) => (u.value = u.value.copy ? u.value.copy(wlAlt[i]) : wlAlt[i]));
            for (const [m, v] of alle) m.visible = v;
            sc.remove(karte, see);
            karte.geometry.dispose();
            karte.material.dispose();
            see.geometry.dispose();
            dl.castShadow = wurf;
            if (luftZurueck) luftZurueck();
            kamZurueck();
            cam.updateMatrixWorld(true);
            rt.dispose();
        }
    })();
}

function laubLichtUrteil(messung, band) {
    band = Object.assign({ glanz: 1.3, labor: 0.1, karte: 0.1, ton: 3 }, band || {});
    const befunde = [];
    const zeilen = [];
    for (const [art, w] of Object.entries((messung && messung.welt) || {})) {
        if (w && w.karte) {
            // DIE KARTE GEGEN IHRE GESTALT (A7): Luma im Band ±`karte`, der Ton (C*ab) höchstens `ton` daneben
            // DIE FERNE JE STUNDE (F6, `paar` fern/nah: Haus L2/L0, Fern-Ring/Boden-Satz) antwortet der Uhr wie die Nähe — gegen ihre Zeile
            // zu Mittag (`<art>@0.5`; der Ton-Abstand skaliert mit der Buntheit der Nähe), der Mittag selbst reist als `mittag` (Lehre 19)
            const mittag = w.paar && /@/.test(art) && !/@0\.5$/.test(art) ? messung.welt[art.replace(/@.*$/, "@0.5")] : null;
            const kC = mittag && mittag.karte && mittag.karte.gestalt && w.karte.gestalt ? w.karte.gestalt.C / mittag.karte.gestalt.C : 1;
            const k = mittag && mittag.karte ? { verhaeltnis: +(w.karte.verhaeltnis / mittag.karte.verhaeltnis).toFixed(3), dL: +(w.karte.dL - mittag.karte.dL).toFixed(2), dC: +(w.karte.dC - mittag.karte.dC * kC).toFixed(2) } : w.karte;
            if (w.paar && !mittag && !/@0\.5$/.test(art)) befunde.push(`FERN ${art}: ohne die Zeile zu Mittag (\`--uhr 0.5,…\`) kein Urteil der Stunde`);
            if (w.paar && /@0\.5$/.test(art)) {
                zeilen.push({ art, stufe: w.stufe, mittag: w.karte.verhaeltnis, dL: w.karte.dL, dC: w.karte.dC });
                continue;
            }
            zeilen.push({ art, stufe: w.stufe, karte: k.verhaeltnis, dL: k.dL, dC: k.dC, mittag: mittag ? mittag.karte.verhaeltnis : undefined });
            if (Math.abs(Math.log(k.verhaeltnis)) > Math.log(1 + band.karte) || Math.abs(k.dC) > band.ton)
                befunde.push(`${w.paar ? "FERN" : w.weg ? "WEG" : "KARTE"} ${art}: ${w.paar ? w.paar + " gegen Mittag" : w.weg ? "Weg/Welt" : "Karte/Gestalt"} (${w.stufe}) Luma ${k.verhaeltnis} (ΔL* ${k.dL}, ΔC* ${k.dC}) — außerhalb ±${band.karte * 100} % / ΔC* ${band.ton}`);
            continue;
        }
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

// DIE KRONE VON OBEN: die Reflexion einer dichten Krone folgt aus dem Blatt, nie aus der Karte. Ein Blatt mit der
// Albedo A und dem Durchlass tau (phyto-core LAUB_LICHT: T = tau · R) streut ω = A · (1 + tau); eine dichte, isotrop streuende
// Blattschicht wirft davon R∞ = (1 − √(1−ω)) / (1 + √(1−ω)) zurück (Zwei-Strom / Kubelka–Munk: Meador & Weaver 1980, J. Atmos.
// Sci. 37:630; Sellers 1985, Int. J. Remote Sens. 6:1335 — die Natur: Nadelwald sichtbar 0,03–0,05, Laubwald 0,04–0,06, wo
// das Blatt R(550) ≈ 0,13 trägt). Das Band reicht vom Nadel- bis zum Laub-Durchlass (`tau` [Nadel, Laub]) über der GEMESSENEN
// Albedo derselben Pixel — eine Krone als EINE besonnte Schale läge bei A · cos θ, um das Zwei- bis Dreifache darüber.
function kronenReflexionSoll(A, tau) {
    const km = (w) => {
        const s = Math.sqrt(Math.max(0, 1 - Math.min(1, w)));
        return (1 - s) / (1 + s);
    };
    return [+km(A * (1 + tau[0])).toFixed(4), +km(A * (1 + tau[1])).toFixed(4)];
}
function kronenObenUrteil(messung) {
    const befunde = [];
    const zeilen = [];
    for (const [art, w] of Object.entries((messung && messung.welt) || {})) {
        const o = w && w.oben;
        if (!o || !(o.R > 0) || !(o.A > 0) || !Array.isArray(o.tau)) {
            befunde.push(
                `KRONE-OBEN ${art}: keine Messung (${(w && w.fehler) || "kein Kronen-Pixel, keine Karte oder kein tau"})`
            );
            continue;
        }
        const band = kronenReflexionSoll(o.A, o.tau);
        zeilen.push({ art, R: o.R, A: o.A, band, pixel: o.pixel, sonneGrad: o.sonneGrad });
        if (o.R > band[1] || o.R < band[0])
            befunde.push(
                `KRONE-OBEN ${art}: Reflexion ${o.R} außerhalb [${band.join(", ")}] (Blatt-Albedo ${o.A}, ${o.pixel} px, Stoffe ${w.stoffe}) — ${o.R > band[1] ? "die Krone lichtet als besonnte Schale" : "die Krone schluckt mehr als ihr Blatt"}`
            );
    }
    if (!zeilen.length && !befunde.length) befunde.push("KRONE-OBEN: keine Art gemessen");
    return { urteil: befunde.length ? "ROT" : "GRUEN", befunde, zeilen };
}

// DIE KANTE ALS LINIE (Ferne K2-2): je Rand-Spalte (`kante[x]`: die erste gezeichnete Zeile, über ihr läuft das Gesetz weiter)
// die Stufe |Δ ln Y| zur Zeile darüber und der Struktur-Tensor von ln Y (9 × 4) um sie; `linie` die längste Folge mit Stufe ≥
// `schwelle`, Kohärenz ≥ 0,5, Kante ≤ 10° aus der Waagrechten, Sprung ≤ 2 px. Der Kamm eines Grats davor ist keine Kante.
function kantenLinie(Y, W, H, kante, schwelle, schritt) {
    const ln = (x, y) => Math.log(Y[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))] + 1e-4);
    let [lauf, linie, stufe, vor] = [0, 0, 0, {}];
    for (const x of Object.keys(kante).map(Number).sort((a, b) => a - b)) {
        const [y0, j] = [kante[x], [0, 0, 0, 0]];
        for (let v = y0 - 2; v <= y0 + 1; v++)
            for (let u = x - 4; u <= x + 4; u++) {
                const [gx, gy] = [ln(u + 1, v) - ln(u - 1, v), ln(u, v + 1) - ln(u, v - 1)];
                [j[0], j[1], j[2]] = [j[0] + gx * gx, j[1] + gy * gy, j[2] + gx * gy];
            }
        j[3] = Math.abs(ln(x, y0) - ln(x, y0 - 1));
        const ist = j[3] >= schwelle && (j[0] - j[1]) ** 2 + 4 * j[2] ** 2 >= 0.5 * (j[0] + j[1]) ** 2 && Math.abs(Math.atan2(2 * j[2], j[1] - j[0])) <= Math.PI / 9;
        lauf = !ist ? 0 : vor.ist && x - vor.x === schritt && Math.abs(y0 - vor.y) <= 2 ? lauf + schritt : schritt;
        [linie, stufe, vor] = [Math.max(linie, lauf), Math.max(stufe, j[3]), { x, y: y0, ist }];
    }
    return { linie, stufe: +stufe.toFixed(4) };
}

// DIE LUFT IM BILD (ferne-luft, Meisterkarte Ferne K1 + K2): vom Hügel je Uhr vier Azimute ab der Sonne, je drei
// Schüsse aus dem Ausgabe-Pfad — Luft (L), β 0 (L0), β 1 (S) —, linear; je Pixel T = (L − S)/(L0 − S) je Kanal gegen die externe
// Referenz längs des Strahls zum Gelände-Gesetz (Bänder nur, wo die Szenen-Tiefe ihn bestätigt); der Rand je Spalte das fernste
// Pixel, die Kante `kantenLinie`. Misst eine Sicht kein Band (zur tiefen Sonne liegt die In-Streuung in der Kompression), schießt
// sie mit Blende 1/4 nach; der Bloom ruht, seine Schwelle bricht die Linearität (zur Sonne 7° hob er T bei 8 km um 70 %).
// DIE SICHT IM WETTER (Ferne K5): `o.wetter` ist das Wort des Spielers für die Bühne; je Sicht die Sichtweite am Bezugsniveau
// −ln(kontrast)/β je Pixel der Szene mit T_grün in 0,05…0,95 (β = −ln T / (g·d·Spektrum grün)), der Median. Der Sturm ist dunkel
// (Mittag: In-Streuung sRGB ≈ 20): seine Sicht schießt mit Blende 16 (linear, T ist ein Verhältnis), blickt 8° hinab (die Bänder
// 0,4–1,5 km) und verlangt ≥ 12 Stufen zwischen L0 und S im grünen Kanal.
function luftTiefe(o) {
    return (async () => {
        const T = window.THREE;
        const cam = st.camera;
        const U = st.luft.U;
        const R = o.ref;
        const W = 480;
        const H = 270;
        const fov0 = cam.fov;
        if (st.renderer.toneMapping !== T.NeutralToneMapping) throw new Error("__luftTiefe: die Rückrechnung kennt nur die Neutral-Kurve");
        st.renderer.setAnimationLoop(null);
        window.__buehne(o.wetter && { wetter: o.wetter });
        const PU = st.postProcessingUniforms;
        const bloom0 = PU.bloomStrength.value;
        PU.bloomStrength.value = 0;
        const gesetz = (x, z) => r._terrainMacroSurfaceY(x, z, false);
        const gx = st.playerMesh.position.x;
        const gz = st.playerMesh.position.z;
        const gy = gesetz(gx, gz) + o.augeM;
        const Hs = R.skalenHoeheM;
        const lin = Array.from({ length: 256 }, (_, i) => srgbLin(i));
        const roh = (u8, i) => {
            const c = [lin[u8[i]], lin[u8[i + 1]], lin[u8[i + 2]]];
            const m = Math.min(...c);
            const mi = m >= 0.04 ? m + 0.04 : Math.sqrt(m / 6.25);
            return Math.max(...c) > 0.75 ? null : c.map((x) => x + (mi >= 0.08 ? 0.04 : mi - 6.25 * mi * mi));
        };
        const Y = luma709;
        const ton = (u8, i) => {
            const c = [u8[i], u8[i + 1], u8[i + 2]];
            const hi = Math.max(...c);
            const d = hi - Math.min(...c);
            if (d < 1) return 0;
            return 60 * (hi === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : hi === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4);
        };
        const med = (a) => (a.length ? +a.slice().sort((x, y) => x - y)[a.length >> 1].toPrecision(4) : null);
        // β und Blende des Schusses über dem Anwenden des Himmels; der Feld-Pass wie in der Spiel-Schleife
        let dichte = null;
        let blende = 1;
        const anwenden = r._dayNightApplyHemiUndLuft;
        const belichten = r._dayNightApplyBelichtung;
        r._dayNightApplyHemiUndLuft = function (...a) {
            anwenden.apply(this, a);
            if (dichte != null) U.beta.value = dichte;
        };
        r._dayNightApplyBelichtung = function (...a) {
            belichten.apply(this, a);
            st.renderer.toneMappingExposure *= blende;
        };
        const schuss = async (b, k) => {
            const alt = U.beta.value;
            const e = st.renderer.toneMappingExposure;
            blende = k;
            st.renderer.toneMappingExposure = e * k;
            if (b != null) U.beta.value = dichte = b;
            if (st.fernRing) r._tickFeldPass(st.fernRing);
            try {
                return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
            } finally {
                dichte = null;
                blende = 1;
                U.beta.value = alt;
                st.renderer.toneMappingExposure = e;
            }
        };
        const blick = (az) => {
            cam.fov = 16;
            cam.updateProjectionMatrix();
            cam.position.set(gx, gy, gz);
            cam.lookAt(gx + Math.sin(az) * 1e3, gy - (o.wetter ? 140 : 44), gz - Math.cos(az) * 1e3);
            cam.updateMatrixWorld(true);
        };
        const s = new T.Vector3();
        const q = new T.Vector3();
        const unter = (t) => gy + s.y * t < gesetz(gx + s.x * t, gz + s.z * t);
        const treffer = (xx, yy, D) => {
            const nx = ((xx + 0.5) / W) * 2 - 1;
            const ny = 1 - ((yy + 0.5) / H) * 2;
            s.set(nx, ny, 1).applyMatrix4(cam.projectionMatrixInverse).applyMatrix4(cam.matrixWorld).sub(cam.position).normalize();
            let a = 0;
            let t = 30;
            while (t < 6e4 && !unter(t)) {
                a = t;
                t += Math.max(8, t * 0.01);
            }
            if (t >= 6e4) return null;
            for (let k = 0; k < 12; k++) {
                if (unter((a + t) / 2)) t = (a + t) / 2;
                else a = (a + t) / 2;
            }
            const k = (s.y * t) / Hs;
            const z = D.tiefe[Math.floor(((yy + 0.5) / H) * D.th) * D.tw + Math.floor(((xx + 0.5) / W) * D.tw)];
            const szene = z < 1 && Math.abs(q.set(nx, ny, z).applyMatrix4(D.iv).distanceTo(cam.position) / t - 1) <= 0.15;
            return { d: t, szene, g: Math.exp(-(gy - (st.waterLevel || 0)) / Hs) * (Math.abs(k) < 1e-3 ? 1 - k / 2 : (1 - Math.exp(-k)) / k) };
        };
        const bRef = R.rayleigh.map((x) => -Math.log(R.kontrast) / R.sichtKlarM - R.rayleigh[1] + x);
        const uhr = (u) => {
            if (st.world) st.world.timeOfDay = u;
            if (r.setTimeOfDay(u, "human") !== true) throw new Error(`__luftTiefe: die Uhr nimmt den Spieler nicht (${u})`);
            const sd = r._sonnenRichtung();
            return { sonne: +((Math.asin(sd.y) * 180) / Math.PI).toFixed(2), az: Math.atan2(sd.x, -sd.z) };
        };
        // die Schwellen L0 − S gehen mit der Blende k
        const sicht = async (az, k) => {
            blick(az);
            const L = await schuss(null, k);
            const D = await window.__spiegelDaten();
            const L0 = await schuss(0, k);
            const S = await schuss(1, k);
            D.iv = new T.Matrix4().fromArray(D.ivp);
            const bd = R.baenderM.map((d) => ({ d, q: [[], [], []], dk: [], dh: [] }));
            const gez = [];
            const fern = {};
            const gesetzOben = {};
            const inS = [[], [], []];
            const sb = [];
            for (let yy = 0; yy < H; yy += 2)
                for (let xx = 4; xx < W; xx += 8) {
                    const t = treffer(xx, yy, D);
                    const i = (yy * W + xx) * 4;
                    const l = roh(L, i);
                    const l0 = roh(L0, i);
                    const sa = roh(S, i);
                    if (t && !(xx in gesetzOben)) gesetzOben[xx] = yy;
                    if (!t || !l || !l0 || !sa || Math.abs(Y(l0) - Y(sa)) < 0.02 * Y(sa)) continue;
                    gez.push({ x: xx, d: t.d, C: Math.abs(Y(l) - Y(sa)) / Y(sa) });
                    sa.forEach((x, c) => inS[c].push(x));
                    fern[xx] = Math.max(fern[xx] || 0, t.d);
                    const tc = [0, 1, 2].map((c) => (Math.abs(l0[c] - sa[c]) < 0.02 * k ? null : (l[c] - sa[c]) / (l0[c] - sa[c])));
                    const tg = Math.abs(L0[i + 1] - S[i + 1]) >= 12 && (l[1] - sa[1]) / (l0[1] - sa[1]);
                    if (t.szene && tg > 0.05 && tg < 0.95) sb.push((-Math.log(R.kontrast) * t.g * t.d * U.spektrum.value.y) / -Math.log(tg));
                    const b = t.szene && bd.find((x) => Math.abs(t.d - x.d) < 0.12 * x.d);
                    if (!b) continue;
                    tc.forEach((x, c) => x != null && b.q[c].push(x / Math.exp(-bRef[c] * t.g * t.d)));
                    if (tc[0] > 0.01 && tc[2] > 0.01 && Math.min(Math.abs(l0[0] - sa[0]), Math.abs(l0[2] - sa[2])) >= 0.05 * k)
                        b.dk.push(Math.log(tc[0] / tc[2]) / (t.g * t.d));
                    const dh = Math.abs(ton(L, i) - ton(S, i));
                    b.dh.push(Math.min(dh, 360 - dh));
                }
            const rand = med(Object.values(fern));
            const Yd = Float32Array.from({ length: W * H }, (_, p) => Y([lin[L[p * 4]], lin[L[p * 4 + 1]], lin[L[p * 4 + 2]]]));
            // je Spalte die erste Zeile, die die Luft ändert (8 Bit, auch über der Kompression): das Ende der gezeichneten Welt
            const oben = {};
            for (const x in gesetzOben)
                for (let y = 0, i = +x * 4; y < H && !(x in oben); y++, i += W * 4) if (Math.abs(L0[i] - S[i]) + Math.abs(L0[i + 1] - S[i + 1]) + Math.abs(L0[i + 2] - S[i + 2]) > 4) oben[x] = y;
            const kante = Object.fromEntries(Object.keys(oben).filter((x) => gesetzOben[x] < oben[x] - 1).map((x) => [x, oben[x]]));
            const kl = kantenLinie(Yd, W, H, kante, R.kontrast, 8);
            const hfov = (2 * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect) * 180) / Math.PI;
            return {
                kante: { spalten: Object.keys(oben).length, rand: Object.keys(kante).length, linie: +((kl.linie / W) * hfov).toFixed(2), stufe: kl.stufe },
                blende: k,
                baender: bd.map((b) => ({ d: b.d, n: b.dh.length, q: b.q.map(med), dk: med(b.dk), nk: b.dk.length, dh: med(b.dh) })),
                himmel: inS[0].length >= R.mindest.n ? inS.map(med) : null,
                rand: { km: +(rand / 1000).toFixed(1), C: med(gez.filter((x) => x.d >= 0.9 * fern[x.x]).map((x) => x.C)) },
                sicht: { m: med(sb), n: sb.length },
            };
        };
        const zeilen = [];
        let weiss = null;
        try {
            for (const u of R.uhren) {
                const so = uhr(u);
                for (let k = 0; k < 4; k++) {
                    const az = so.az + (k * Math.PI) / 2;
                    let z = await sicht(az, o.wetter ? 16 : 1);
                    if (z.baender.every((b) => b.n < R.mindest.n)) z = await sicht(az, 0.25);
                    zeilen.push(Object.assign({ uhr: u, sonne: so.sonne, az: k * 90 }, z));
                }
            }
            // FERNES WEISS bei Sonne 5° (die Uhr in Halbierungen): eine weiße Lambert-Tafel `weiss.m` vor dem Auge, die Sonne im Rücken
            let [a, b] = [0.2, 0.3];
            for (let k = 0; k < 14; k++) [a, b] = uhr((a + b) / 2).sonne < 5 ? [(a + b) / 2, b] : [a, (a + b) / 2];
            const so = uhr(b);
            const az = so.az + Math.PI;
            const [wx, wz] = [gx + Math.sin(az) * R.weiss.m, gz - Math.cos(az) * R.weiss.m];
            const tafel = new T.Mesh(new T.PlaneGeometry(R.weiss.seite, R.weiss.seite), new T.MeshStandardMaterial());
            tafel.position.set(wx, gesetz(wx, wz) + R.weiss.seite, wz);
            st.scene.add(tafel);
            try {
                blick(az);
                tafel.lookAt(cam.position);
                const p = tafel.position.clone().project(cam);
                for (const k of [1, 0.25]) {
                    const c = !weiss && roh(await schuss(null, k), (Math.round(((1 - p.y) / 2) * H) * W + Math.round(((p.x + 1) / 2) * W)) * 4);
                    if (c) weiss = { sonne: so.sonne, blende: k, RB: +(c[0] / c[2]).toFixed(3) };
                }
            } finally {
                st.scene.remove(tafel);
                tafel.geometry.dispose();
                tafel.material.dispose();
            }
        } finally {
            delete r._dayNightApplyHemiUndLuft;
            delete r._dayNightApplyBelichtung;
            PU.bloomStrength.value = bloom0;
            cam.fov = fov0;
            cam.updateProjectionMatrix();
            window.__buehne();
        }
        return { gy: Math.round(gy), zeilen, weiss };
    })();
}

// DAS URTEIL DER LUFT (die Bänder in spec/farbe/luft-referenz.json): K1-1 KOSCHMIEDER, K1-2 JE KANAL (Δβ blau−rot gegen die
// Referenz, grau = 0) · FARBTON, K2-1 KANTE; was die Referenz `offen` nennt, steht OFFEN und hält die Wand nicht. Jede Sicht
// (Uhr × Azimut) misst `mindest`, sonst ROT beim Namen: eine leere Messung ist nie grün.
function luftTiefeUrteil(m, R) {
    const B = R.band;
    const M = R.mindest;
    const liste = [];
    const dRef = R.rayleigh[2] - R.rayleigh[0];
    const gemessen = R.baenderM.map(() => 0);
    for (const u of R.uhren)
        for (const az of [0, 90, 180, 270]) {
            const z = m.zeilen.find((x) => x.uhr === u && x.az === az) || { sonne: "–", baender: [], rand: { km: 0, C: null } };
            const wo = `Uhr ${u} (Sonne ${z.sonne}°) Azimut ${az}°`;
            for (const b of z.baender.filter((x) => x.n >= M.n)) {
                const q = b.q.map((x, c) => (x == null || Math.abs(x - 1) > B.T ? "RGB"[c] + " " + x : "")).filter(Boolean);
                if (u === 0.5) gemessen[R.baenderM.indexOf(b.d)]++;
                if (u === 0.5 && q.length) liste.push(`K1-1 KOSCHMIEDER ${wo} ${b.d / 1000} km: T/T_soll ${q.join(", ")} außerhalb ±${B.T * 100} %`);
                if (b.d === 8000 && !(b.dh <= B.dh)) liste.push(`K1-2 FARBTON ${wo} 8 km: ${b.dh}° von der In-Streuung > ${B.dh}°`);
            }
            const fern = z.baender.filter((b) => b.d >= 2000 && b.nk > 0);
            const nk = fern.reduce((a, b) => a + b.nk, 0);
            // inverse Varianz: der Fehler von dk fällt mit d, die Band-Mediane wiegen nk·d²
            const w = fern.reduce((a, b) => a + b.nk * b.d * b.d, 0);
            const v = +(fern.reduce((a, b) => a + b.dk * b.nk * b.d * b.d, 0) / w / dRef).toFixed(2);
            if (nk < M.nk) liste.push(`K1-2 JE KANAL ${wo} ab 2 km: ungemessen (${nk} Paare < ${M.nk})`);
            else if (!(v >= B.kanal[0] && v <= B.kanal[1])) liste.push(`K1-2 JE KANAL ${wo} ab 2 km: Δβ blau−rot ${v} × Referenz (grau = 0, ${nk} Paare)`);
            if (u === 0.5 && !(z.rand.C != null && z.rand.C <= B.rand))
                liste.push(`K2-1 KANTE ${wo}: Restkontrast ${z.rand.C == null ? "ungemessen" : z.rand.C} am Rand ${z.rand.km} km > ${B.rand}`);
        }
    gemessen.forEach((n, i) => {
        if (n < M.azimute) liste.push(`K1-1 KOSCHMIEDER Uhr 0.5 ${R.baenderM[i] / 1000} km: in ${n} von 4 Azimuten gemessen (< ${M.azimute})`);
    });
    // der Himmel am Horizont (die In-Streuung, linear) zu Mittag gegen den Ton der Referenz; die Sonnenseite: Y der In-Streuung
    // zur Sonne / gegen sie je Uhr; das ferne Weiß bei Sonne 5°
    const Y = (c) => c && luma709(c);
    for (const z of m.zeilen.filter((x) => x.uhr === 0.5)) {
        const [r, g, b] = z.himmel || [0, 0, 0];
        const d = Math.max(r, g, b) - Math.min(r, g, b);
        const h = d > 0 && b >= Math.max(r, g) ? +(60 * ((r - g) / d + 4)).toFixed(1) : null;
        if (!(Math.abs(h - R.himmel.ton) <= B.himmelTon))
            liste.push(`K1-2 HIMMEL Azimut ${z.az}°: Ton der In-Streuung ${h == null ? "nicht blau " + z.himmel : h + "°"} statt ${R.himmel.ton}° ±${B.himmelTon}`);
    }
    for (const u of R.uhren) {
        const h = [0, 180].map((az) => Y((m.zeilen.find((x) => x.uhr === u && x.az === az) || {}).himmel));
        const s = h[1] > 0 ? +(h[0] / h[1]).toFixed(3) : null;
        if (!(s >= B.seite)) liste.push(`K1-2 SONNENSEITE Uhr ${u}: Y der In-Streuung zur Sonne / gegen sie ${s} < ${B.seite}`);
    }
    if (!(m.weiss && m.weiss.RB >= B.weissRB)) liste.push(`K1-2 FERNES WEISS bei Sonne 5°: R/B ${JSON.stringify(m.weiss)} < ${B.weissRB}`);
    // K2-2 am Hügel und am Gipfel zu Mittag: keine waagrechte Linie über `band.linie` Grad
    for (const [ort, zs] of [["Hügel", m.zeilen], ["Gipfel", m.gipfel && m.gipfel.zeilen]])
        for (const az of [0, 90, 180, 270]) {
            const k = ((zs || []).find((x) => x.uhr === 0.5 && x.az === az) || {}).kante || { spalten: 0 };
            if (!(k.spalten >= M.spalten && k.linie < B.linie)) liste.push(`K2-2 KANTENLINIE ${ort} Azimut ${az}°: Linie ${k.linie}° Stufe ${k.stufe} (${k.rand}/${k.spalten} Spalten)`);
        }
    const offen = (b) => Object.keys(R.offen || {}).some((k) => b.includes(k));
    const staffel = {};
    for (const k of ["K1-1", "K1-2", "K2-1", "K2-2"]) staffel[k] = liste.some((b) => b.startsWith(k)) ? "ROT" : "GRUEN";
    const befunde = liste.filter((b) => !offen(b));
    return { urteil: befunde.length ? "ROT" : "GRUEN", staffel, befunde, offen: liste.filter(offen) };
}

// DER WETTER-ZUG IM BILD (Licht K5): klar → `o.wort` → klar als Wort des Spielers, je Wort `o.sek` Sekunden der Welt-Uhr im
// echten Takt (`_gameLoopTick`, Schritt TAKT_DECKEL_S) über die Transition des Spiels, bis das Wort steht (ihre Dauer moduliert
// das Gemüt, `_emotionModulate`: Regen → klar 62 s; Deckel 150 s), die Uhr steht. Je Sekunde die Summe der
// Leuchtdichte des Ausgabe-Bilds (linear, Rec. 709), das Wort und der Stand des Übergangs.
function wetterZug(o) {
    return (async () => {
        const dt = r.constructor.TAKT_DECKEL_S;
        const [T0, tag, reihe] = [performance.now(), st.dayLengthMinutes, []];
        let k = 0;
        st.renderer.setAnimationLoop(null);
        window.__buehne();
        st.dayLengthMinutes = 1e9;
        try {
            for (const [wort, sek] of [["sunny", 5], [o.wort, o.sek], ["sunny", o.sek]]) {
                if (window.__wetterSetzen(wort, true) !== wort) throw new Error(`__wetterZug: das Wort gilt nicht (${wort})`);
                for (let s = 0; s < 150 && (s < sek || st.weatherTransition); s++) {
                    for (let i = 0; i < 1 / dt; i++) r._gameLoopTick(T0 + ++k * dt * 1000);
                    const u8 = (await window.__ausgabeAufnahme(160, 90, 1, { satz: "messung" })).u8;
                    const wt = st.weatherTransition;
                    const Y = u8.reduce((a, v, i) => a + (i % 4 < 3 && [0.2126, 0.7152, 0.0722][i % 4] * ((v / 255 + 0.055) / 1.055) ** 2.4), 0);
                    reihe.push({ t: st.spielZeit, wetter: st.weather, zug: wt ? wt.progress : 1, Y });
                }
            }
        } finally {
            st.dayLengthMinutes = tag;
            window.__buehne();
        }
        return { reihe };
    })();
}

// DIE URTEILE DES WETTERS (spec/farbe/luft-referenz.json `wetter`): die Sicht — der Median der Sichten mit `mindest.n` Pixeln
// über ≥ `mindest.azimute` Azimute gegen `sichtSturmM` ± `band`; der Zug — der größte Sprung |log2 Y_k/Y_k−1| je Sekunde der
// Welt-Uhr ≤ `zugEvS`, und jedes Wort stand am Ende seiner Phase (sonst misst die Reihe keinen Übergang).
function wetterLuftUrteil(m, R) {
    const s = (m.zeilen || []).filter((z) => z.sicht.n >= R.mindest.n).map((z) => z.sicht.m).sort((a, b) => a - b);
    const ist = s.length >= R.mindest.azimute ? s[s.length >> 1] : null;
    const x = m.reihe || [];
    const d = x.slice(1).map((y, i) => ({ ...y, d: Math.abs(Math.log2(y.Y / x[i].Y)) / (y.t - x[i].t) }));
    const sprung = d.reduce((a, b) => (b.d <= a.d ? a : b), d[0]);
    const gezogen = x.some((y) => y.wetter === m.wort && y.zug === 1) && x.length > 2 && x.at(-1).wetter === "sunny" && x.at(-1).zug === 1;
    return {
        sicht: { gruen: Math.abs(ist / R.wetter.sichtSturmM - 1) <= R.wetter.band, ist, n: s.length },
        zug: { gruen: gezogen && sprung.d <= R.wetter.zugEvS, sprung, gezogen },
    };
}

function luftTiefeSelbsttest(R) {
    const ref = R.rayleigh.map((x) => -Math.log(R.kontrast) / R.sichtKlarM - R.rayleigh[1] + x);
    const sichten = (dk, C, n = 50, linie = 0, seite = 1.3, himmel = [0.7, 0.79, 1]) =>
        R.uhren.flatMap((uhr) =>
            [0, 90, 180, 270].map((az) => ({
                uhr,
                sonne: 60,
                az,
                rand: { km: 20, C },
                kante: { spalten: n, rand: n, linie, stufe: 0.01 },
                himmel: n ? himmel.map((x) => (az ? x : seite * x)) : null,
                baender: R.baenderM.map((d) => ({ d, n, q: [1, 1, 1], dk, nk: n, dh: 5 })),
            }))
        );
    const urteil = (zeilen, gipfel = zeilen, weiss = { RB: 1.5 }) => luftTiefeUrteil({ zeilen, gipfel: { zeilen: gipfel }, weiss }, Object.assign({}, R, { offen: {} }));
    const leer = urteil(sichten(null, null, 0)).staffel;
    const k = ref[2] - ref[0];
    // das Bild einer Welt-Kante: Himmel 0,5 über einer Stufe `c` ab Zeile 100 (`zacke`: je zweite Spalte 8 px tiefer)
    const bild = (c, zacke) => {
        const kante = {};
        for (let x = 4; x < 480; x += 8) kante[x] = 100 + (zacke ? (x >> 3) % 2 : 0) * 8;
        return kantenLinie(Float32Array.from({ length: 129600 }, (_, p) => (p / 480 >= kante[(p % 480 & ~7) + 4] ? 0.5 - c / 2 : 0.5)), 480, 270, kante, R.kontrast, 8).linie;
    };
    return [
        urteil(sichten(k, 0.005)).urteil === "GRUEN" || "die Referenz selbst ist ROT",
        urteil(sichten(0, 0.005)).befunde.some((b) => /JE KANAL/.test(b)) || "ein grauer β ist nicht ROT",
        urteil(sichten(k, 0.21)).staffel["K2-1"] === "ROT" || "die Kante 21 % ist nicht ROT",
        urteil(sichten(k, 0.005, 50, R.band.linie)).staffel["K2-2"] === "ROT" || "eine Linie an der Schwelle ist nicht ROT",
        urteil(sichten(k, 0.005), []).staffel["K2-2"] === "ROT" || "ein fehlender Gipfel ist nicht ROT",
        urteil(sichten(k, 0.005, 50, 0, 1.15)).befunde.some((b) => /SONNENSEITE/.test(b)) || "die Sonnenseite 1,15 ist nicht ROT",
        urteil(sichten(k, 0.005, 50, 0, 1.3, [0.39, 0.45, 0.39])).befunde.some((b) => /HIMMEL/.test(b)) || "ein grüner Horizont ist nicht ROT",
        urteil(sichten(k, 0.005), undefined, null).befunde.some((b) => /FERNES WEISS/.test(b)) || "ein ungemessenes fernes Weiß ist nicht ROT",
        (bild(0.05) >= 400 && bild(0.01) === 0 && bild(0.05, true) <= 8) || `Linie bei Stufe 5 % ${bild(0.05)} px, 1 % ${bild(0.01)}, Zacken ${bild(0.05, true)}`,
        (leer["K1-1"] === "ROT" && leer["K1-2"] === "ROT" && leer["K2-1"] === "ROT" && leer["K2-2"] === "ROT") || "eine leere Messung ist nicht ROT",
        urteil([]).urteil === "ROT" || "eine Messung ohne Sicht ist nicht ROT",
        ...[[1500, 4, true], [1800, 4, false], [1500, 2, false]].map(([m, n, g]) =>
            wetterLuftUrteil({ zeilen: Array(n).fill({ sicht: { m, n: 50 } }) }, R).sicht.gruen === g || `Sicht ${m} m × ${n} nicht ${g}`),
        ...[[0.05, "rainy", true], [0.5, "rainy", false], [0.05, "sunny", false]].map(([e, w, g]) =>
            wetterLuftUrteil({ wort: "rainy", reihe: [0, 1, 2, 3].map((t) => ({ t, Y: 2 ** (-e * t), wetter: t === 2 ? w : "sunny", zug: 1 })) }, R).zug.gruen === g || `Zug ${e} EV/s ${w} nicht ${g}`),
    ].filter((x) => x !== true);
}

// DIE EICHUNG DER TONKURVE (Lehre 21, F1): die Kurven von three (r184 TSL, r128 GLSL gleich) auf einem GRAUEN Eingang
// (Belichtung × Leuchtdichte; die Farb-Matrizen von ACES halten Grau). `kartenEichung(kurve, ev)` ist das k·L, das die 18-%-Karte
// auf Mittelgrau + ev EV legt: kurve(k·L / 2^ev) = 0,18 — die Labore auf + 1 EV (die Albedo-Tafel), die Welt auf den Anker
// des Mittags (ev 0, licht.K1). Eine Kurve ohne Zeile hat keine Eichung (null) — die Linse nennt sie.
const TONKURVE_GRAU = {
    ACESFilmicToneMapping: (v) => {
        const x = v / 0.6;
        return Math.min(1, (x * (x + 0.0245786) - 0.000090537) / (x * (0.983729 * x + 0.432951) + 0.238081));
    },
    NeutralToneMapping: (v) => {
        const c = v - (v < 0.08 ? v - 6.25 * v * v : 0.04);
        return c < 0.76 ? c : 1 - (0.24 * 0.24) / (c + 0.24 - 0.76);
    },
};
function kartenEichung(kurve, ev = 1) {
    const f = TONKURVE_GRAU[kurve];
    if (!f) return null;
    let lo = 0;
    let hi = 4;
    for (let i = 0; i < 60; i++) {
        const m = (lo + hi) / 2;
        if (f(m) < 0.18) lo = m;
        else hi = m;
    }
    return lo * 2 ** ev;
}

// DIE NÄSSE IM BILD (wetter.K2): eine Pose unter der Bühne klar · Regen frisch · Regen 10 min (`naesse: 600`); je Rasterpunkt
// nass/frisch trennt die Nässe vom Licht, nass gegen nass ohne Regen-Sprite zählt die Schlieren je Klasse. Im Dorf trifft der
// Strahl Hülle, Tür-Flügel oder Boden: unter der Decke „innen"; die Dach-Bauten ohne Hülle (`NAESSE.dachArten`) im Umkreis
// 24 m prüfen den Dach-Pool an ihrer Mitte. `haus`: nur die Schwelle, an die der Spieler tritt (die Tür öffnet).
function naesseSicht(o) {
    return (async () => {
        const T = window.THREE;
        const cam = st.camera;
        const p = st.playerMesh.position;
        // DIE DACH-BAUTEN OHNE HÜLLE (`NAESSE.dachArten`): `dach: "ziel"` nennt den nächsten, `dach: "pruefen"` prüft jeden im
        // Umkreis 24 m am Dach-Pool an seiner Mitte (am Boden)
        if (o.dach) {
            const U = r._ensureAtmoUniforms();
            const arten = (r.constructor.NAESSE || {}).dachArten || [];
            const ab = (a) => Math.hypot(a.position.x - p.x, a.position.z - p.z);
            const bauten = st.architectures.filter((a) => {
                const pr = !a._hausHuelle && a.position && r._foundryPresetForEntry(a);
                const rec = pr && r._foundry.recipes[pr];
                return rec && (arten.includes(pr) || arten.includes(rec.kind));
            }).sort((a, b) => ab(a) - ab(b));
            if (o.dach === "ziel") return { ziel: bauten.length ? [bauten[0].position.x, bauten[0].position.z] : null };
            const nah = bauten.filter((a) => ab(a) < 24);
            const unterDach = (x, y, z) => (U.dachLage || []).some((L, i) => {
                const [l, m] = [L.value, U.dachMass[i].value];
                return Math.abs((x - l.x) * l.z - (z - l.y) * l.w) < m.x && Math.abs((x - l.x) * l.w + (z - l.y) * l.z) < m.y && y < m.z;
            });
            const trocken = nah.filter((a) => unterDach(a.position.x, r._terrainMacroSurfaceY(a.position.x, a.position.z, false) + 0.2, a.position.z));
            return { n: nah.length, trocken: trocken.length, arten: [...new Set(nah.map((a) => a.type))] };
        }
        const e = o.ort === "dorf" ? st.architectures.filter((a) => a._hausHuelle && a.tuer).sort((a, b) => Math.hypot(a.position.x - p.x, a.position.z - p.z) - Math.hypot(b.position.x - p.x, b.position.z - p.z))[0] : null;
        if (o.ort === "dorf" && !e) throw new Error("NÄSSE: kein Haus mit Hülle und Tür am Ort");
        const k = e ? e._hausHuelleSkala || 1 : 1;
        const [co, si] = e ? [Math.cos(e.rotationY || 0), Math.sin(e.rotationY || 0)] : [1, 0];
        const welt = (x, y, z) => new T.Vector3(e.position.x + (x * co + z * si) * k, e.position.y + y * k, e.position.z + (z * co - x * si) * k);
        const lokal = (v) => [((v.x - e.position.x) * co - (v.z - e.position.z) * si) / k, (v.y - e.position.y) / k, ((v.x - e.position.x) * si + (v.z - e.position.z) * co) / k];
        const boxen = e ? e._hausHuelle.teile.filter((t) => t.art === "box" && t.rolle === "fest") : [];
        const fl = (t) => t.h[0] * t.h[2];
        const decke = boxen.filter((t) => fl(t) >= 0.5 * Math.max(...boxen.map(fl))).sort((a, b) => b.c[1] + b.h[1] - a.c[1] - a.h[1])[0];
        const t = e && e.tuer;
        if (o.haus) return { schwelle: welt(t.x + 1.3, 0, t.z - 0.8).toArray() };
        for (const f of ((e && e.instSlots) || []).map((s) => s.tuer || (st.archInstanceGroups.get(s.key) || {}).tuer).filter((f) => f && Math.abs(f.zf - t.z) < 0.5)) {
            const L = Math.abs(t.x - f.hx);
            const [bx, bz] = [L * Math.cos(f.offen) * Math.sign(t.x - f.hx), Math.abs(L * Math.sin(f.offen))];
            for (const sz of [1, -1]) boxen.push({ tuer: true, c: [f.hx + bx / 2, t.y + t.h / 2, f.zf + (sz * bz) / 2], h: [Math.abs(bx) / 2 + 0.04, t.h / 2, bz / 2 + 0.04] });
        }
        st.renderer.setAnimationLoop(null);
        if (e) {
            cam.position.copy(welt(t.x, t.y + 1.5, t.z + 1));
            cam.lookAt(welt(t.x, t.y - 0.8, t.z - 2.5));
            cam.updateMatrixWorld(true);
        }
        // das Raster der Zeichenfläche (die Werkbank, `page.setViewport` 640 × 360), ungefiltert: im halben Raster mittelte der
        // Box-Filter vier Pixel, und eine Schliere hob kaum einen Punkt über die Schwelle (Dorf-Haus, Radeon: draußen 8 von 57 600)
        const W = 640;
        const H = 360;
        const schuss = async (wetter, naesse) => {
            window.__buehne({ wetter, naesse });
            return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
        };
        const klar = await schuss("sunny", 1e6);
        await schuss("rainy", 0); // der Regen-Himmel schwingt ein (sein erster Schuss 19–33 % dunkler)
        const frisch = await schuss("rainy", 0);
        const nass = await schuss("rainy", 600);
        const sprite = r._rainSystem && r._rainSystem.mesh;
        if (sprite) sprite.layers.disable(0);
        // ohne Sprite in DERSELBEN Nässe: `naesse` sind Sekunden Regen ab dem Stand (`_naesseTakt`) — mit 600 trug der Vergleich
        // 20 statt 10 min (0,992 gegen 0,909), und die helle nasse Schwelle des Dorf-Hauses zählte 15 Punkte als Regen innen
        const ohne = await schuss("rainy", 0);
        if (sprite) sprite.layers.enable(0);
        const Y = luma709;
        const strahl = new T.Vector3();
        const klasse = (x, y) => {
            if (!e) return y > H * 0.55 ? "aussen" : null;
            strahl.set(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 1).unproject(cam).sub(cam.position).normalize();
            const a = lokal(cam.position);
            const d = lokal(cam.position.clone().add(strahl)).map((v, i) => v - a[i]);
            let best = 40;
            let flue = false;
            for (const b of boxen) {
                let t0 = 0;
                let t1 = best;
                for (let i = 0; i < 3 && t0 <= t1; i++) {
                    const u = (b.c[i] - b.h[i] - a[i]) / d[i];
                    const v = (b.c[i] + b.h[i] - a[i]) / d[i];
                    t0 = Math.max(t0, Math.min(u, v));
                    t1 = Math.min(t1, Math.max(u, v));
                }
                if (t0 <= t1 && t0 > 0.05) [best, flue] = [t0, !!b.tuer];
            }
            for (let s = 0.3; s < best; s += 0.1 + s * 0.02) {
                const q = cam.position.clone().addScaledVector(strahl, s);
                if (q.y < r._terrainMacroSurfaceY(q.x, q.z, false)) [best, flue] = [s, false];
            }
            if (best >= 40 || flue) return null;
            const h = lokal(cam.position.clone().addScaledVector(strahl, best));
            const unter = Math.abs(h[0] - decke.c[0]) < decke.h[0] - 0.05 && Math.abs(h[2] - decke.c[2]) < decke.h[2] - 0.05 && h[1] < decke.c[1];
            return unter ? "innen" : "aussen";
        };
        const je = { innen: [], aussen: [] };
        const regen = { innen: 0, aussen: 0 };
        for (let y = 1; y < H; y += 2)
            for (let x = 1; x < W; x += 2) {
                const i = (y * W + x) * 4;
                const c = klasse(x, y);
                if (c && Y(frisch, i) > 8) je[c].push(Y(nass, i) / Y(frisch, i));
                if (c && Math.abs(Y(nass, i) - Y(ohne, i)) > 3) regen[c]++;
            }
        const mittel = (u8) => {
            let s = 0;
            for (let i = 0; i < W * H * 4; i += 4) s += Y(u8, i);
            return s / W / H;
        };
        const med = (l) => (l.length ? +l.sort((a, b) => a - b)[l.length >> 1].toFixed(3) : null);
        const A = { k: (n) => n, mul: (x, y) => x * y, sub: (x, y) => x - y, mix: (x, y, w) => x + (y - x) * w };
        const dicht = typeof r.constructor._naesseGesetz === "function" ? r.constructor._naesseGesetz(A, 0.4, 0.3, 1, 1) : null;
        // der Glanz: die GGX-Spitze 1/α² (α = Rauheit²) des porösen Bodens (Rauheit 0,8) nass gegen trocken
        const poroes = typeof r.constructor._naesseGesetz === "function" ? r.constructor._naesseGesetz(A, 0.4, 0.8, 0, 1) : null;
        return {
            ort: o.ort,
            haus: e && e.type,
            naesse: Number.isFinite(st.naesse) ? +st.naesse.toFixed(3) : null,
            innen: { n: je.innen.length, verhaeltnis: med(je.innen) },
            aussen: { n: je.aussen.length, verhaeltnis: med(je.aussen) },
            dicht: dicht ? +dicht.faktor.toFixed(3) : null,
            glanz: poroes ? +((0.8 / poroes.rauh) ** 4).toFixed(2) : null,
            regen,
            regenbild: +(mittel(nass) / mittel(klar)).toFixed(3),
            png: o.png ? [klar, frisch, nass].map((u8) => window.__png(u8, W, H)) : undefined,
        };
    })();
}

// DAS URTEIL: draußen 0,5–0,8, innen ±5 % und 0 Schlieren (draußen ≥ 1: die Zählung sieht den Regen), Metall (`_naesseGesetz`)
// ±5 %, Glanz ≥ 2×, Regenbild ≤ Sonne, je Klasse ≥ 100 Punkte; im Dorf jeder Dach-Bau im Umkreis trocken (≥ 1).
function naesseUrteil(welt) {
    const befunde = [];
    const band = (n, wert, lo, hi) => (wert == null || wert < lo || wert > hi) && befunde.push(`${n} ${wert} außerhalb [${lo}, ${hi}]`);
    if (!Object.keys(welt).length) befunde.push("keine Messung");
    for (const [ort, m] of Object.entries(welt)) {
        if (m.fehler) {
            befunde.push(`${ort}: ${m.fehler}`);
            continue;
        }
        for (const c of ort === "dorf" ? ["aussen", "innen"] : ["aussen"])
            if (!(m[c].n >= 100)) befunde.push(`${ort} ${c}: ${m[c].n} Rasterpunkte < 100`);
        band(`${ort} Nässe porös draußen`, m.aussen.verhaeltnis, 0.5, 0.8);
        if (ort === "dorf") band(`${ort} innen unter dem Dach`, m.innen.verhaeltnis, 0.95, 1.05);
        band(`${ort} dicht (Metall)`, m.dicht, 0.95, 1.05);
        band(`${ort} Glanz nass/trocken`, m.glanz, 2, Infinity);
        if (!(m.regen && m.regen.aussen >= 1)) befunde.push(`${ort}: keine Schliere draußen — die Regen-Zählung ist blind`);
        if (ort === "dorf" && !(m.regen && m.regen.innen === 0)) befunde.push(`${ort}: ${m.regen && m.regen.innen} Regen-Punkte innen`);
        const d = m.dachBauten;
        if (ort === "dorf" && !(d && d.n >= 1 && d.trocken === d.n)) befunde.push(`${ort}: Dach-Bauten trocken ${d && d.trocken}/${d && d.n}`);
        if (!(m.regenbild <= 1)) befunde.push(`${ort} Regenbild ${m.regenbild} × so hell wie die Sonne`);
    }
    return { urteil: befunde.length ? "ROT" : "GRUEN", befunde };
}

// DER KONTAKT-SCHATTEN (Seiten-Code): ein Pfosten 0,5 × 0,5 × 3 m (das EINE Stoff-Programm) auf der Platte `o.platte` der
// Prüfbühne (spec/pruefbuehne/welt.json saat-s7-platte, 1,4 m dick, Oberkante über jedem Halm: der Boden-Stoff ohne Relief, nie
// die Linse); je Pose (ego 2 m quer, Auge 1,6 m · third 4,5 m, 2,6 m) und Ziel drei Schüsse aus dem Ausgabe-Pfad ohne Bloom: A die
// Welt, B ohne Pfosten, C ohne Sonne. Die Sonnen-Sicht f = (A − C)/(B − C), linear, quer zum Schatten s Meter hinter dem Pfosten,
// je Punkt das Mittel längs der Kante (±2 cm: das Rauschen der gedrehten Vogel-Punkte fällt, die Breite ist die des Bilds nach der
// zeitlichen Auflösung); je Linie zwei Kanten beidseits des Kerns, je Kante die Breite 10–90 % von f oder ihr Grund (`fleck` ·
// `kern` · `rand`). `fuss` (s 0,05–0,3) trägt den Median, `zuwachs` (16 Linien bis 0,4 m vor die Spitze, die Kamera je 2 m) die
// Gerade cm über L = Weg Werfer → Empfänger längs des Lichts (kleinste Quadrate), die Scheibe k / 0,688 (der 10–90-%-Halbschatten
// der Sonnen-Scheibe ist 0,688 ihrer Breite: das Kreis-Segment).
function kontaktSicht(o) {
    return (async () => {
        const [r, T] = [window.anazhRealm, window.THREE];
        const st = r.state;
        const { renderer: rend, camera: cam, scene: sc, directionalLight: dl } = st;
        rend.setAnimationLoop(null);
        window.__buehne({});
        if (o.uhr !== 0.5) (r.setTimeOfDay(o.uhr, "human"), (r._himmelSprung = true), r._applyDayNightToScene());
        const PU = st.postProcessingUniforms;
        const [bloom0, I0, fov0, kam0] = [PU.bloomStrength.value, dl.intensity, cam.fov, cam.matrix.clone()];
        // die Krone der Platte: ihre Blocker-Box (das Netz, auf dem der Spieler steht), nie die Spec
        const platte = st.architectures.find((a) => a.id === o.platte);
        if (!platte?.blockerAABBs) return { fehler: `keine Platte „${o.platte}" auf der Bühne` };
        const F = new T.Vector3(platte.position.x, platte.blockerAABBs[0].topY, platte.position.z);
        const S = dl.position.clone().sub(dl.target.position).normalize();
        const d = new T.Vector3(-S.x, 0, -S.z).normalize();
        const b = new T.Vector3(-d.z, 0, d.x);
        const laenge = 3 / Math.tan(Math.asin(Math.max(0.05, S.y)));
        const pf = new T.Mesh(new T.BoxGeometry(0.5, 3.3, 0.5), r._buildToonNodeMaterial({ color: new T.Color(0.4, 0.4, 0.4) }));
        pf.position.set(F.x, F.y + 1.35, F.z);
        pf.rotation.y = Math.atan2(d.x, d.z);
        pf.castShadow = pf.receiveShadow = true;
        pf.frustumCulled = false;
        sc.add(pf);
        st.playerMesh.visible = false;
        PU.bloomStrength.value = 0;
        const { x: W, y: H } = rend.getDrawingBufferSize(new T.Vector2());
        const lin = Array.from({ length: 256 }, (_, i) => srgbLin(i));
        // PBR Neutral zurück (Versatz am kleinsten, Schulter am größten Kanal)
        const zurueck = (c) => {
            const hi = Math.min(Math.max(...c), 0.9995);
            const k = hi >= 0.76 ? (0.0576 / (1 - hi) + 0.52) / hi : 1;
            const m = Math.min(...c) * k;
            const x = Math.sqrt(m / 6.25);
            return c.map((v) => v * k + (m < 0.04 ? x - 6.25 * x * x : 0.04));
        };
        const schuss = async () => {
            for (let i = 0; i < 2; i++) r._schattenAlleNeu(), (o.u8 = (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8);
            const L = new Float32Array(W * H);
            for (let i = 0; i < W * H; i++) {
                const c = zurueck([lin[o.u8[4 * i]], lin[o.u8[4 * i + 1]], lin[o.u8[4 * i + 2]]]);
                L[i] = luma709(c) / rend.toneMappingExposure;
            }
            return L;
        };
        const v = new T.Vector3();
        const probe = (L) => {
            const [x, y] = [((v.x + 1) / 2) * W - 0.5, ((1 - v.y) / 2) * H - 0.5];
            const [x0, y0, fx, fy] = [Math.floor(x), Math.floor(y), x % 1, y % 1];
            const g = (i, j) => L[(y0 + j) * W + x0 + i];
            return (g(0, 0) * (1 - fx) + g(1, 0) * fx) * (1 - fy) + (g(0, 1) * (1 - fx) + g(1, 1) * fx) * fy;
        };
        const aus = { uhr: o.uhr, sonneGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1), schattenM: +laenge.toFixed(2), posen: {} };
        const ziele = {};
        for (let i = 0; i < 22; i++) {
            const s = i < 6 ? 0.05 * (i + 1) : 0.3 + ((laenge - 0.7) * (i - 5)) / 16;
            if (i < 6 || s > 0.3) (ziele[s < 1 ? 0.25 : Math.floor(s / 2) * 2 + 1.25] ||= []).push(s);
        }
        // je Linie zwei Kanten beidseits des Kerns (h[0] Kern … Rand): gültig mit Kern ≤ 10 %, Rand ≥ 90 %, ohne Fleck; dunkle Flecken
        // (< 1/5 des Sonnen-Anteils) tragen kein f, Lücken bis 3 cm überbrückt die Gerade
        const kanten = (abc) => {
            const sonne = abc.map(([, bb, c]) => bb - c).sort((x, y) => x - y)[abc.length >> 1];
            const f = abc.map(([a, bb, c]) => (bb - c > 0.2 * sonne ? (a - c) / (bb - c) : NaN));
            for (let i = 1, j; i < f.length; i = j + 1) {
                for (j = i; j < f.length && f[j] !== f[j]; j++);
                for (let k = i; k < j && j < f.length && j - i <= 10; k++) f[k] = f[i - 1] + ((f[j] - f[i - 1]) * (k - i + 1)) / (j - i + 1);
            }
            const m3 = f.map((x, i) => [f[i - 1] ?? x, x, f[i + 1] ?? x].sort((y, z) => y - z)[1]);
            const k = m3.reduce((m, x, i) => (x === x && !(m3[m] <= x) ? i : m), -1);
            return [m3.slice(0, k + 1).reverse(), m3.slice(k)].map((h) =>
                k < 0 || h.some((x) => x !== x) ? "fleck" : !(h[0] <= 0.1) ? "kern" : !(h[h.length - 1] >= 0.9) ? "rand" : (h.filter((x) => x > 0.1 && x < 0.9).length * 3) / 10
            );
        };
        try {
            for (const [pose, ab, hoch] of [
                ["ego", 2, 1.6],
                ["third", 4.5, 2.6],
            ]) {
                const linien = [];
                for (const [z, liste] of Object.entries(ziele)) {
                    const ziel = F.clone().addScaledVector(d, 0.25 + +z);
                    cam.fov = 60;
                    cam.updateProjectionMatrix();
                    cam.position.copy(ziel).addScaledVector(b, ab).setY(F.y + hoch);
                    cam.lookAt(ziel);
                    cam.updateMatrixWorld(true);
                    const A = await schuss();
                    if (o.png && z === "0.25") aus.posen[pose] = { png: window.__png(o.u8.slice(), W, H) };
                    pf.visible = false;
                    const B = await schuss();
                    pf.visible = true;
                    dl.intensity = 0;
                    const C = await schuss();
                    dl.intensity = I0;
                    for (const s of liste) {
                        const abc = [];
                        for (let u = -0.7; u <= 0.7; u += 0.003)
                            abc.push([A, B, C].map((L) => [-2, -1, 0, 1, 2].reduce((m, e) => (v.copy(F).addScaledVector(d, 0.25 + s + e / 100).addScaledVector(b, u).project(cam), m + probe(L) / 5), 0)));
                        linien.push([s, +((0.25 + s) / Math.hypot(S.x, S.z)).toFixed(2), ...kanten(abc)]);
                    }
                }
                // der Fuß: der Median der gültigen Kanten; der Zuwachs: die Gerade w = a + k · L über alle
                const P = linien.flatMap(([s, L, ...k]) => k.filter((w) => w >= 0).map((w) => [L, w, s]));
                const fu = P.filter((q) => q[2] <= 0.3).map((q) => q[1]).sort((x, y) => x - y);
                const mi = (i) => P.reduce((s, q) => s + q[i], 0) / P.length;
                const k = P.reduce((s, [L, w]) => s + (L - mi(0)) * (w - mi(1)), 0) / P.reduce((s, [L]) => s + (L - mi(0)) ** 2, 0);
                const Ls = P.map((q) => q[0]);
                Object.assign((aus.posen[pose] ||= {}), {
                    linien,
                    fuss: { halbschattenCm: fu[fu.length >> 1], kanten: fu.length, von: 12 },
                    zuwachs: { scheibeCmJeM: +(k / 0.688).toFixed(3), kanten: P.length, von: 2 * linien.length, wegM: Math.max(...Ls) - Math.min(...Ls) },
                });
            }
        } finally {
            [dl.intensity, PU.bloomStrength.value, cam.fov, st.playerMesh.visible] = [I0, bloom0, fov0, true];
            sc.remove(pf);
            pf.geometry.dispose();
            pf.material.dispose();
            kam0.decompose(cam.position, cam.quaternion, cam.scale);
            cam.updateProjectionMatrix();
            cam.updateMatrixWorld(true);
        }
        return aus;
    })();
}

// DAS URTEIL: am Fuß der Median-Halbschatten ≤ 3 cm in Ego UND Third aus ≥ 6 gültigen Kanten je Pose (Staffel 1); mit
// `zuwachs` (Staffel 2) dazu je Pose der Zuwachs der Scheibe 0,9 ± 0,25 cm je m (tan 0,53°) aus ≥ 75 % gültigen Kanten über
// ≥ 1 m Weg — ein fester Filter-Kern (alle Kanten gleich breit) trägt 0, die Gründe der übrigen stehen je Linie in `linien`.
function kontaktUrteil(m, zuwachs) {
    const befunde = m && !m.fehler ? [] : [(m && m.fehler) || "keine Messung"];
    for (const pose of befunde.length ? [] : ["ego", "third"]) {
        const { fuss: f = { kanten: 0, von: 0 }, zuwachs: z = {} } = m.posen[pose] || {};
        for (const [rot, b] of [
            [!(f.kanten >= 6), `${f.kanten} von ${f.von} Kanten gültig`],
            [!(f.halbschattenCm != null && f.halbschattenCm <= 3), `Halbschatten am Fuß ${f.halbschattenCm} cm`],
            [zuwachs && !(z.kanten >= 0.75 * z.von && z.wegM >= 1), `Zuwachs aus ${z.kanten} von ${z.von} Kanten über ${z.wegM} m`],
            [zuwachs && !(Math.abs(z.scheibeCmJeM - 0.9) <= 0.25), `Zuwachs ${z.scheibeCmJeM} cm je m (Soll 0,9 ± 0,25)`],
        ])
            if (rot) befunde.push(`${pose}: ${b}`);
    }
    return { urteil: befunde.length ? "ROT" : "GRUEN", befunde };
}

function kontaktSelbsttest() {
    const p = (cm, kanten = 12, zu = 0.93, zk = 32) => ({ fuss: { halbschattenCm: cm, kanten, von: 12 }, zuwachs: { scheibeCmJeM: zu, kanten: zk, von: 32, wegM: 8.5 } });
    const U = (posen, z) => kontaktUrteil({ posen }, z).befunde.join();
    return [
        [U({ ego: p(2.1), third: p(2.8) }, true), /^$/],
        [U({ ego: p(17.5), third: p(2.8) }), /^ego: Halbschatten am Fuß 17\.5 cm$/],
        [U({ ego: p(null, 0) }), /^ego: 0 von 12 Kanten gültig,ego: Halbschatten am Fuß null cm,third: 0 von 0/],
        [U({ ego: p(2.1, 12, 0.05, 5), third: p(2.8) }, true), /^ego: Zuwachs aus 5 von 32 Kanten über 8\.5 m,ego: Zuwachs 0\.05 cm je m/],
    ]
        .filter(([ist, soll]) => !soll.test(ist))
        .map(([ist, soll]) => `${soll} ≠ ${ist}`);
}

module.exports = {
    kontaktSicht,
    kontaktUrteil,
    kontaktSelbsttest,
    naesseSicht,
    naesseUrteil,
    kantenLinie,
    luftTiefe,
    luftTiefeUrteil,
    luftTiefeSelbsttest,
    wetterZug,
    wetterLuftUrteil,
    kartenEichung,
    laubLichtUrteil,
    tagKurveUrteil,
    tagKurveSelbsttest,
    tagFeinUhren,
    TAG_UHREN,
    TAG_UHREN_KURZ,
    kronenObenUrteil,
    kronenReflexionSoll,
    LINSEN_INSTALL:
        `window.__linsenZiel = ${linsenZiel.toString()};` +
        `window.__laubGegenlicht = ${laubGegenlicht.toString()};` +
        `window.__albedoAuswerten = ${albedoAuswerten.toString()};` +
        `window.__stoffPasst = ${stoffPasst.toString()};` +
        `window.__tafelBlicke = ${JSON.stringify(TAFEL_BLICKE)};` +
        `window.__albedoSicht = ${albedoSicht.toString()};` +
        `window.__nahFernSicht = ${nahFernSicht.toString()};` +
        `window.__lichtBilanz = ${lichtBilanz.toString()};` +
        `window.__tagKurve = ${tagKurve.toString()};` +
        `window.__lichtWeg = ${lichtWeg.toString()};` +
        `window.__lab = ${lab.toString()};`,
    albedoAuswerten,
    stoffPasst,
    nahFernUrteil,
    TAFEL_BLICKE,
};
