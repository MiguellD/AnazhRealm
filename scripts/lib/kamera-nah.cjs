// kamera-nah.cjs — DIE NAH-DECKUNG DER KAMERA (Leben-Schau 2, 09.10., Befund §6 #5): wie viel des Schirms eine Fläche
// deckt, die näher am Auge liegt als der Nah-Radius der Stellung — und wer sie ist, beim NAMEN. Befund: in allen drei
// Spuren steckte die Kamera in Laub, Strauch oder Fels (A 12 · 27 · 44–47, B 24 · 28 · 31 · 35 · 53, C 12); durchsichtig
// wurde nur, was im Rohr um den Sicht-Strahl lag.
//
// Die Linse rechnet in der Seite gegen die ECHTE Szene (headless oder echte GPU): je Stellung ein Strahlen-Gitter durch den
// Bildwinkel der Spieler-Kamera, je Strahl die Flächen bis zum Nah-Radius (Dreiecke der gezeichneten Meshes, Instanzen mit
// ihren Matrizen, Blatt-Karten mit dem Alpha ihres Atlas). Was eine Fläche dem Auge ist, sagt ihr Stoff: trägt er die
// Durchsicht der Kamera (`maskNode` aus `_kameraDurchsichtNode`), steht sie mit dem Gewicht der EINEN Formel
// (`_durchsichtGewicht` über `DURCHSICHT_ZAHLEN`, mit den Uniform-Werten, die die GPU liest), sonst ganz. Das Rauschen der
// Blende ist je Pixel EINES für alle Flächen: der Strahl zeigt für dh ∈ [0, 1) die erste Fläche mit w > dh — der Anteil, mit
// dem eine Fläche i sichtbar ist, ist max(0, w_i − max(w_0 … w_{i−1})). Die Deckung des Strahls ist die Summe dieser Anteile
// über die TÄTER-Flächen; Boden und Bau sind nie Täter (sie halten die Kamera, `_fieldRaycast`), sie decken nur, was hinter
// ihnen liegt.
//
// Täter-Klassen: Laub (Laub · Blatt-Karte), Rinde (Rinde · Stiel), Fels (Formationen, Streu-Steine, Natur ohne
// Pflanzen-Stoff), Wagen (der eigene, geritten). Im 1st ist nur Laub ein Täter: der Leib steht an der Rinde (der Stamm, an
// dem man lehnt, bleibt ganz).
//
// DER ORTS-SPEICHER: die Szene ruht zwischen den Stellungen eines Orts (kein Takt) — die Welt-Dreiecke der Region (o.ort:
// { id, x, z, r }) werden EINMAL gerechnet und in 2-m-Zellen gelegt; je Stellung fragt die Linse nur die Zellen der Nah-Kugel.
// Der Stoff (und seine Maske) wird je Stellung frisch gelesen. Was sich bewegt (`o.dyn`: die id des Wagens), rechnet sie je
// Stellung neu; `o.neu` verwirft den Speicher.
"use strict";

// Die Seiten-Funktion (als Quelle injiziert): o = { radien: { Klasse: m }, gw, gh, ort, dyn, neu } — Täter ist eine Fläche
// einer Klasse mit Radius, näher am Auge als ihr Radius.
function nahDeckungInSeite(o) {
    const r = window.anazhRealm;
    const st = r.state;
    const T = window.THREE;
    const K = r.constructor;
    const cam = st.camera;
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    const E = cam.position.clone();
    const R = o.radien || {};
    const D = Math.max(0, ...Object.values(R));
    const D2 = D * D;
    // die Einträge, die nie zählen (o.ohne: ids — das benannte Ziel eines Beweisbilds, K32); sie wirken beim Sammeln, darum
    // fragt ein Aufrufer mit `ohne` stets mit `neu`
    const OHNE = new Set(o.ohne || []);
    // je Klasse die Höhe, über der ein Treffer erst zählt (o.ueber: { Klasse: y }) — die Böschung am Auge, nie der Boden darunter
    const UEBER = o.ueber || {};
    const lu = st.lodUniforms || {};
    // die Werte, die die GPU liest (uKamAuge · uKamZiel · uKamNah)
    const auge = lu.uKamAuge ? lu.uKamAuge.value.clone() : null;
    const ziel = lu.uKamZiel ? lu.uKamZiel.value.clone() : null;
    const nah = lu.uKamNah ? lu.uKamNah.value.clone() : null;
    const knoten = r._kamDurchKnoten || null; // die Masken-Knoten je Art (Laub · Rinde), falls der Stamm sie hält
    const gewicht = (p, art) => {
        if (!auge || !ziel) return 1;
        const n = nah ? (art === "rinde" ? nah.y : art === "boden" ? nah.z : nah.x) : undefined;
        return K._durchsichtGewicht(
            K.DURCHSICHT_ZAHLEN,
            p,
            { x: auge.x, y: auge.y, z: auge.z },
            { x: ziel.x, y: ziel.y, z: ziel.z },
            ziel.w,
            n
        );
    };
    const player = st.playerMesh;
    const ritt = st.player && st.player.mountedArch != null ? r._mountedEntry : null;
    const unter = (obj, wurzel) => {
        for (let p = obj; p; p = p.parent) if (p === wurzel) return true;
        return false;
    };
    const archNachMesh = new Map();
    for (const e of st.architectures || []) if (e && e.mesh) archNachMesh.set(e.mesh, e);
    const eintragNachId = new Map();
    for (const e of st.architectures || []) if (e && e.id != null) eintragNachId.set(e.id, e);
    const eintragVon = (obj, inst) => {
        // der Pool der Fundamente (`st.archFundament`, EIN Mesh für jedes Bauwerk, `idAt[slot]` = die id des Eintrags;
        // gemessen 15.10.: der Fuß des griechischen Hauses „verdeckt von bau-fundament" — sein eigener Sockel)
        const fu = st.archFundament;
        if (fu && obj === fu.mesh) return eintragNachId.get(fu.idAt[inst]) || null;
        if (obj.isInstancedMesh && obj.userData && obj.userData.archInstanceKey && st.archInstanceGroups) {
            const g = st.archInstanceGroups.get(obj.userData.archInstanceKey);
            return g && g.slotEntry ? g.slotEntry[inst] || null : null;
        }
        for (let p = obj; p; p = p.parent) if (archNachMesh.has(p)) return archNachMesh.get(p);
        return null;
    };
    // DAS ZIEL IM SATZ (K63-n6; gemessen 15.10., Radeon: das römische Haus im Dorf „verdeckt von bauSatz in 14,49 m", Ziel
    // 16,45 m — die eigene Front): der Bau-Satz zeichnet die Instanzen vieler Gruppen in EINEM Mesh (`_bauSatzBlock`: je
    // lebende Instanz ihre n Ecken in Welt-Lage ab dem Bereichs-Anfang `vStart`), ein Dreieck dort gehört `slotEntry[i]` seiner
    // Gruppe. Je Satz-Mesh die Ecken-Läufe der Einträge in `o.ohne` — sie decken nie und verdecken nie, wie jedes andere Ziel.
    const ohneSatz = new Map();
    if (OHNE.size && st.chunkSaetze && st.archInstanceGroups)
        for (const [key, g] of st.archInstanceGroups) {
            const s = g && g.satz && g.slotEntry ? st.chunkSaetze.get(g.satz) : null;
            const b = s && s.mesh ? s.bloecke.get(key) : null;
            const n = b && g.geom && g.geom.attributes.position ? g.geom.attributes.position.count : 0;
            if (!n) continue;
            const laeufe = ohneSatz.get(s.mesh) || [];
            for (let i = 0; i < Math.floor(b.vAnzahl / n); i++) {
                const e = g.slotEntry[i];
                if (e && OHNE.has(e.id)) laeufe.push(b.vStart + i * n, b.vStart + (i + 1) * n);
            }
            if (laeufe.length) ohneSatz.set(s.mesh, laeufe);
        }
    const imLauf = (l, v) => {
        for (let k = 0; k < l.length; k += 2) if (v >= l[k] && v < l[k + 1]) return true;
        return false;
    };
    const natur = (e) => !!e && typeof r._istNatur === "function" && r._istNatur(e);
    const artVonStoff = (mat) => {
        const k = mat && mat.userData ? mat.userData.foundryKind : null;
        if (k === "foliage" || k === "foliageTex") return "laub";
        if (k === "bark" || k === "stem") return "rinde";
        return null;
    };
    // die Klasse einer Fläche: { klasse, name } — klasse ∈ Laub · Rinde · Fels · Wagen (Täter) | Boden · Bau (halten)
    // | null (nie gezählt: Himmel, Wasser, Spieler, Kreatur)
    const klasseVon = (obj, mat, e) => {
        const nm = obj.name || "";
        if (nm === "bodenSatz") return { klasse: "Gelände", name: "Gelände" };
        if (nm === "bauSatz") return { klasse: "Bau", name: "bauSatz" };
        if (nm === "formationenSatz") return { klasse: "Fels", name: "Formation" };
        // die Halm-Senken der Nah-Wiese (`nahWiese:L<stufe>:…`, `_nahWieseSenken`) sind die Boden-Schicht wie die wiegende Streu
        // (gemessen 15.10.: als „Bau" deckten sie 15,3 % des Vordergrunds vor dem Haus im Dorf)
        if (nm.startsWith("nahWiese:L")) return { klasse: "Streu", name: nm };
        const art = artVonStoff(mat);
        if (nm === "streuSatz") {
            // die wiegende Nah-Streu (Blume, Farn, Gestrüpp, Schilf) ist die Boden-Schicht
            if (wiegend.has(mat)) return { klasse: "Streu", name: "Streu " + (art || "?") };
            if (art === "laub") return { klasse: "Laub", name: "Streu-Laub" };
            if (art === "rinde") return { klasse: "Rinde", name: "Streu-Reisig" };
            return { klasse: "Fels", name: "Streu-Stein" };
        }
        if (ritt && e === ritt) return { klasse: "Wagen", name: "Wagen " + (e.type || "?") };
        if (art === "laub") return { klasse: "Laub", name: "Laub " + ((e && e.type) || nm || "Streu") };
        if (art === "rinde") return { klasse: "Rinde", name: "Rinde " + ((e && e.type) || nm || "Streu") };
        if (e && natur(e)) return { klasse: "Fels", name: "Natur " + e.type };
        return { klasse: "Bau", name: (e && e.type) || nm || obj.type };
    };
    const zaehlt = (obj) =>
        obj.isMesh &&
        obj.geometry &&
        obj.geometry.attributes &&
        obj.geometry.attributes.position &&
        !(obj.material && obj.material.visible === false) &&
        // was die Kamera zeichnet: der Schatten-Zwilling (SHADOW_TWIN_LAYER, Stoff „schatten") wirft nur in den Kaskaden
        obj.layers.test(st.camera.layers) &&
        !obj.isSkinnedMesh &&
        obj.name !== "himmel" &&
        obj.name !== "wasserSatz" &&
        !(obj.userData && obj.userData.isHydrosphere) &&
        !unter(obj, player);
    const TAETER = {};
    for (const [k, v] of Object.entries(R)) if (v > 0) TAETER[k] = v;
    // die Stoffe der wiegenden Nah-Streu (Schlüssel „…|wiegt" im Stoff-Speicher des Stamms)
    const wiegend = new Set();
    for (const [k, m] of Object.entries(r._foundryMats || {})) if (k.endsWith("|wiegt")) wiegend.add(m);
    // die Blatt-Karte schneidet ihr Alpha aus dem EINEN Atlas (RGBA; ein komprimierter Atlas zählt die ganze Karte)
    const atlas = r._foliageAtlasTex && r._foliageAtlasTex.image ? r._foliageAtlasTex.image : null;
    const atlasA =
        atlas && atlas.data && atlas.data.length === atlas.width * atlas.height * 4
            ? (u, v) => {
                  const x = Math.min(atlas.width - 1, Math.max(0, Math.floor(u * atlas.width)));
                  const y = Math.min(atlas.height - 1, Math.max(0, Math.floor(v * atlas.height)));
                  return atlas.data[(y * atlas.width + x) * 4 + 3] / 255;
              }
            : null;
    const m4 = new T.Matrix4();
    const im = new T.Matrix4();
    const va = new T.Vector3();
    const vb = new T.Vector3();
    const vc = new T.Vector3();
    const bs = new T.Sphere();
    // Die Dreiecke eines (Mesh, Instanz) in die Sammler legen, die `nimm(ax..cz)` zulässt. meta: { k, art, mat, cut, karte }
    const metaVon = new Map();
    const metaFuer = (kl, mat, karte) => {
        const key = kl.klasse + "|" + kl.name + "|" + mat.uuid + "|" + (karte ? 1 : 0);
        let me = metaVon.get(key);
        if (!me) {
            me = { k: kl, art: artVonStoff(mat), mat, cut: mat.alphaTest > 0 ? mat.alphaTest : 0.5, karte };
            metaVon.set(key, me);
        }
        return me;
    };
    const legeDreiecke = (obj, inst, nimm, sammle) => {
        const g = obj.geometry;
        const pos = g.attributes.position;
        const uv = g.attributes.uv || null;
        const idx = g.index ? g.index.array : null;
        const nIdx = idx ? idx.length : pos.count;
        const dr0 = Math.max(0, g.drawRange.start);
        const dr1 = Math.min(nIdx, g.drawRange.start + (Number.isFinite(g.drawRange.count) ? g.drawRange.count : nIdx));
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const gruppen =
            g.groups && g.groups.length && Array.isArray(obj.material)
                ? g.groups
                : [{ start: dr0, count: dr1 - dr0, materialIndex: 0 }];
        const e = eintragVon(obj, inst);
        if (e && OHNE.has(e.id)) return; // das Ziel selbst (o.ohne) deckt nie und verdeckt nie
        const ohneL = ohneSatz.get(obj) || null; // ... auch als Bereich im Satz (`ohneSatz`)
        for (const gr of gruppen) {
            const mat = mats[gr.materialIndex] || mats[0];
            if (!mat || mat.visible === false) continue;
            const kl = klasseVon(obj, mat, e);
            if (!kl) continue;
            const karte = !!(atlasA && uv && mat.userData && mat.userData.foundryKind === "foliageTex");
            const me = metaFuer(kl, mat, karte);
            const s0 = Math.max(dr0, gr.start);
            const s1 = Math.min(dr1, gr.start + gr.count);
            for (let t = s0; t + 2 < s1; t += 3) {
                const i0 = idx ? idx[t] : t;
                const i1 = idx ? idx[t + 1] : t + 1;
                const i2 = idx ? idx[t + 2] : t + 2;
                if (ohneL && imLauf(ohneL, i0)) continue;
                va.fromBufferAttribute(pos, i0).applyMatrix4(m4);
                vb.fromBufferAttribute(pos, i1).applyMatrix4(m4);
                vc.fromBufferAttribute(pos, i2).applyMatrix4(m4);
                if (!nimm(va, vb, vc)) continue;
                sammle(
                    va,
                    vb,
                    vc,
                    karte ? [uv.getX(i0), uv.getY(i0), uv.getX(i1), uv.getY(i1), uv.getX(i2), uv.getY(i2)] : null,
                    me
                );
            }
        }
    };
    // je (Mesh, Instanz) die Matrix und die Hülle; `fn(obj, inst)` nur für die, deren Hülle `kugel` schneidet
    const jeInstanz = (obj, kugel, fn) => {
        const g = obj.geometry;
        if (!g.boundingSphere) g.computeBoundingSphere();
        const gross = !Number.isFinite(g.boundingSphere.radius) || g.boundingSphere.radius > 1e5;
        const n = obj.isInstancedMesh ? obj.count : 1;
        for (let i = 0; i < n; i++) {
            m4.copy(obj.matrixWorld);
            if (obj.isInstancedMesh) {
                im.fromArray(obj.instanceMatrix.array, i * 16);
                if (Math.abs(im.determinant()) < 1e-12) continue; // ein freier Slot
                m4.multiply(im);
            }
            if (!gross) {
                bs.copy(g.boundingSphere).applyMatrix4(m4);
                if (!(typeof kugel === "function" ? kugel(bs) : bs.intersectsSphere(kugel))) continue;
            }
            fn(obj, i);
        }
    };
    const dynamisch = (obj, inst) => {
        const e = eintragVon(obj, inst);
        return !!(e && o.dyn != null && e.id === o.dyn);
    };
    // ── DER ORTS-SPEICHER ──
    const ZELLE = 2;
    const zk = (ix, iz) => ix * 65536 + iz;
    let C = window.__nahSpeicher;
    if (o.neu || !C || !o.ort || C.id !== o.ort.id) {
        const tris = [];
        const uvs = [];
        const metas = [];
        const R = o.ort ? o.ort.r : 60;
        const cx = o.ort ? o.ort.x : E.x;
        const cz = o.ort ? o.ort.z : E.z;
        const region = new T.Sphere(new T.Vector3(cx, E.y, cz), 1e6); // die Hülle schneidet nur in x/z (unten)
        const imFeld = (a, b, c) =>
            Math.max(a.x, b.x, c.x) >= cx - R &&
            Math.min(a.x, b.x, c.x) <= cx + R &&
            Math.max(a.z, b.z, c.z) >= cz - R &&
            Math.min(a.z, b.z, c.z) <= cz + R;
        const sammle = (a, b, c, u, me) => {
            tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
            if (u) uvs.push(u[0], u[1], u[2], u[3], u[4], u[5]);
            else uvs.push(0, 0, 0, 0, 0, 0);
            metas.push(me);
        };
        st.scene.traverseVisible((obj) => {
            if (!zaehlt(obj)) return;
            jeInstanz(obj, region, (ob, i) => {
                if (dynamisch(ob, i)) return;
                // die Hülle in x/z gegen das Feld
                const g = ob.geometry;
                const gross = !Number.isFinite(g.boundingSphere.radius) || g.boundingSphere.radius > 1e5;
                if (!gross) {
                    bs.copy(g.boundingSphere).applyMatrix4(m4);
                    if (Math.abs(bs.center.x - cx) > R + bs.radius || Math.abs(bs.center.z - cz) > R + bs.radius)
                        return;
                }
                legeDreiecke(ob, i, imFeld, sammle);
            });
        });
        const n = metas.length;
        const ft = new Float32Array(tris);
        const zellen = new Map();
        for (let t = 0; t < n; t++) {
            const b = t * 9;
            const ix0 = Math.floor(Math.min(ft[b], ft[b + 3], ft[b + 6]) / ZELLE);
            const ix1 = Math.floor(Math.max(ft[b], ft[b + 3], ft[b + 6]) / ZELLE);
            const iz0 = Math.floor(Math.min(ft[b + 2], ft[b + 5], ft[b + 8]) / ZELLE);
            const iz1 = Math.floor(Math.max(ft[b + 2], ft[b + 5], ft[b + 8]) / ZELLE);
            for (let ix = ix0; ix <= ix1; ix++)
                for (let iz = iz0; iz <= iz1; iz++) {
                    const k = zk(ix, iz);
                    let l = zellen.get(k);
                    if (!l) zellen.set(k, (l = []));
                    l.push(t);
                }
        }
        C = window.__nahSpeicher = {
            id: o.ort ? o.ort.id : "?",
            tris: ft,
            uvs: new Float32Array(uvs),
            metas,
            zellen,
            stempel: new Int32Array(n),
            lauf: 0,
        };
    }
    // ── die Dreiecke in der Nah-Kugel: aus dem Speicher (Zellen der Kugel) und das Bewegte frisch ──
    const tri = [];
    const uvt = [];
    const meta = [];
    const inKugel = (a, b, c) => {
        const qx = Math.max(Math.min(a.x, b.x, c.x), Math.min(E.x, Math.max(a.x, b.x, c.x)));
        const qy = Math.max(Math.min(a.y, b.y, c.y), Math.min(E.y, Math.max(a.y, b.y, c.y)));
        const qz = Math.max(Math.min(a.z, b.z, c.z), Math.min(E.z, Math.max(a.z, b.z, c.z)));
        return (qx - E.x) ** 2 + (qy - E.y) ** 2 + (qz - E.z) ** 2 <= D2;
    };
    C.lauf++;
    {
        const ft = C.tris;
        for (let ix = Math.floor((E.x - D) / ZELLE); ix <= Math.floor((E.x + D) / ZELLE); ix++)
            for (let iz = Math.floor((E.z - D) / ZELLE); iz <= Math.floor((E.z + D) / ZELLE); iz++) {
                const l = C.zellen.get(zk(ix, iz));
                if (!l) continue;
                for (const t of l) {
                    if (C.stempel[t] === C.lauf) continue;
                    C.stempel[t] = C.lauf;
                    const b = t * 9;
                    va.set(ft[b], ft[b + 1], ft[b + 2]);
                    vb.set(ft[b + 3], ft[b + 4], ft[b + 5]);
                    vc.set(ft[b + 6], ft[b + 7], ft[b + 8]);
                    if (!inKugel(va, vb, vc)) continue;
                    for (let k = 0; k < 9; k++) tri.push(ft[b + k]);
                    for (let k = 0; k < 6; k++) uvt.push(C.uvs[t * 6 + k]);
                    meta.push(C.metas[t]);
                }
            }
    }
    const kugel = new T.Sphere(E, D);
    const sammleNah = (a, b, c, u, me) => {
        tri.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        if (u) uvt.push(u[0], u[1], u[2], u[3], u[4], u[5]);
        else uvt.push(0, 0, 0, 0, 0, 0);
        meta.push(me);
    };
    if (o.dyn != null)
        st.scene.traverseVisible((obj) => {
            if (!zaehlt(obj)) return;
            jeInstanz(obj, kugel, (ob, i) => {
                if (dynamisch(ob, i)) legeDreiecke(ob, i, inKugel, sammleNah);
            });
        });
    // die Maske je Stoff, frisch gelesen (ein Schmuggel nimmt sie)
    const maskeVon = new Map();
    const maskeArt = (me) => {
        if (maskeVon.has(me.mat)) return maskeVon.get(me.mat);
        const mat = me.mat;
        const maske = !!(mat.maskNode && mat.maskNode.isNode);
        const a = !maske
            ? null
            : knoten
              ? mat.maskNode === knoten.laub
                  ? "laub"
                  : mat.maskNode === knoten.rinde
                    ? "rinde"
                    : mat.maskNode === knoten.boden
                      ? "boden"
                      : "fremd"
              : me.art || "rinde";
        maskeVon.set(mat, a);
        return a;
    };
    // ── das Gitter: je Dreieck die Zellen, die seine Projektion deckt — vor der Nah-Ebene der Kamera geklippt (was hinter
    // ihr liegt, zeichnet die GPU nie) ──
    const gw = o.gw || 48;
    const gh = o.gh || 27;
    const zellen = Array.from({ length: gw * gh }, () => []);
    const V = cam.matrixWorldInverse.elements;
    const Pm = cam.projectionMatrix.elements;
    const near = cam.near;
    const nT = meta.length;
    // je Dreieck: Ecke 0 und die zwei Kanten (Möller–Trumbore), Skalare
    const G = new Float64Array(nT * 9);
    const vz = [0, 0, 0];
    const vx = [0, 0, 0];
    const vy = [0, 0, 0];
    const poly = [];
    for (let t = 0; t < nT; t++) {
        const b = t * 9;
        G[b] = tri[b];
        G[b + 1] = tri[b + 1];
        G[b + 2] = tri[b + 2];
        for (let k = 0; k < 3; k++) G[b + 3 + k] = tri[b + 3 + k] - tri[b + k];
        for (let k = 0; k < 3; k++) G[b + 6 + k] = tri[b + 6 + k] - tri[b + k];
        for (let k = 0; k < 3; k++) {
            const x = tri[b + k * 3];
            const y = tri[b + k * 3 + 1];
            const z = tri[b + k * 3 + 2];
            vx[k] = V[0] * x + V[4] * y + V[8] * z + V[12];
            vy[k] = V[1] * x + V[5] * y + V[9] * z + V[13];
            vz[k] = V[2] * x + V[6] * y + V[10] * z + V[14];
        }
        poly.length = 0;
        for (let k = 0; k < 3; k++) {
            const j = (k + 1) % 3;
            const vorn = vz[k] <= -near;
            if (vorn) poly.push(vx[k], vy[k], vz[k]);
            if (vorn !== vz[j] <= -near) {
                const s = (-near - vz[k]) / (vz[j] - vz[k]);
                poly.push(vx[k] + (vx[j] - vx[k]) * s, vy[k] + (vy[j] - vy[k]) * s, -near);
            }
        }
        if (!poly.length) continue;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity;
        for (let q = 0; q < poly.length; q += 3) {
            const w = -poly[q + 2];
            const nx = (Pm[0] * poly[q] + Pm[8] * poly[q + 2]) / w;
            const ny = (Pm[5] * poly[q + 1] + Pm[9] * poly[q + 2]) / w;
            if (nx < x0) x0 = nx;
            if (nx > x1) x1 = nx;
            if (ny < y0) y0 = ny;
            if (ny > y1) y1 = ny;
        }
        if (x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1) continue;
        const cx0 = Math.max(0, Math.floor(((x0 + 1) / 2) * gw - 0.5));
        const cx1 = Math.min(gw - 1, Math.ceil(((x1 + 1) / 2) * gw - 0.5));
        const cy0 = Math.max(0, Math.floor(((1 - y1) / 2) * gh - 0.5));
        const cy1 = Math.min(gh - 1, Math.ceil(((1 - y0) / 2) * gh - 0.5));
        for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) zellen[cy * gw + cx].push(t);
    }
    // ── die Strahlen ──
    const dir = new T.Vector3();
    const fwd = cam.getWorldDirection(new T.Vector3());
    const treffer = [];
    let deckung = 0;
    const jeKlasse = {};
    const jeName = {};
    const ex = E.x;
    const ey = E.y;
    const ez = E.z;
    for (let cy = 0; cy < gh; cy++)
        for (let cx = 0; cx < gw; cx++) {
            const l = zellen[cy * gw + cx];
            if (!l.length) continue;
            const nx = ((cx + 0.5) / gw) * 2 - 1;
            const ny = 1 - ((cy + 0.5) / gh) * 2;
            dir.set(nx, ny, 0.5).unproject(cam).sub(E).normalize();
            const dx = dir.x;
            const dy = dir.y;
            const dz = dir.z;
            // die Tiefe längs der Blickachse je Meter des Strahls: die GPU klippt an der Nah-EBENE (z = −near)
            const cosA = dx * fwd.x + dy * fwd.y + dz * fwd.z;
            treffer.length = 0;
            for (const t of l) {
                const b = t * 9;
                const e1x = G[b + 3],
                    e1y = G[b + 4],
                    e1z = G[b + 5];
                const e2x = G[b + 6],
                    e2y = G[b + 7],
                    e2z = G[b + 8];
                const px = dy * e2z - dz * e2y;
                const py = dz * e2x - dx * e2z;
                const pz = dx * e2y - dy * e2x;
                const det = e1x * px + e1y * py + e1z * pz;
                if (det > -1e-12 && det < 1e-12) continue;
                const inv = 1 / det;
                const tx = ex - G[b];
                const ty = ey - G[b + 1];
                const tz = ez - G[b + 2];
                const u = (tx * px + ty * py + tz * pz) * inv;
                if (u < 0 || u > 1) continue;
                const qx = ty * e1z - tz * e1y;
                const qy = tz * e1x - tx * e1z;
                const qz = tx * e1y - ty * e1x;
                const v = (dx * qx + dy * qy + dz * qz) * inv;
                if (v < 0 || u + v > 1) continue;
                const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
                if (d > D || d * cosA < near) continue;
                const me = meta[t];
                if (me.karte) {
                    const ub = t * 6;
                    const w0 = 1 - u - v;
                    const su = w0 * uvt[ub] + u * uvt[ub + 2] + v * uvt[ub + 4];
                    const sv = w0 * uvt[ub + 1] + u * uvt[ub + 3] + v * uvt[ub + 5];
                    if (atlasA(su, sv) < me.cut) continue;
                }
                treffer.push({ d, me });
            }
            if (!treffer.length) continue;
            treffer.sort((a, b) => a.d - b.d);
            let m = 0;
            for (const h of treffer) {
                const me = h.me;
                const ma = maskeArt(me);
                let w = 1;
                if (ma) {
                    const p = { x: ex + dx * h.d, y: ey + dy * h.d, z: ez + dz * h.d };
                    w = gewicht(p, ma === "fremd" ? me.art : ma);
                }
                if (w > m) {
                    if (TAETER[me.k.klasse] && h.d <= TAETER[me.k.klasse] && !(UEBER[me.k.klasse] > ey + dy * h.d)) {
                        const a = w - m;
                        deckung += a;
                        jeKlasse[me.k.klasse] = (jeKlasse[me.k.klasse] || 0) + a;
                        jeName[me.k.name] = (jeName[me.k.name] || 0) + a;
                    }
                    m = w;
                }
                if (m >= 1) break;
            }
        }
    // ── DAS ZIEL (K32, die Abnahme des Beweisbilds; o.ziel = { x, y, z, name, saum }): liegt es im Bild (Projektion der
    // Spieler-Kamera, vor der Nah-Ebene, |ndc| ≤ 0,95), und verdeckt es nichts? Der Strahl Auge → Ziel fragt jede gezeichnete
    // Fläche bis `saum` (0,5 m) vor dem Ziel — Laub · Rinde · Fels · Bau · Gelände · Wagen, nie die Nah-Streu (Gras und Blumen
    // sind die Boden-Schicht) und nie das Ziel selbst (`o.ohne`); Blatt-Karten mit dem Alpha ihres Atlas, Flächen mit der
    // Durchsicht der Kamera mit dem Gewicht der EINEN Formel (verdeckt ab 0,5). Der erste Verdecker steht beim Namen. ──
    let zielOut = null;
    if (o.ziel) {
        const Z = o.ziel;
        const zv = new T.Vector3(Z.x, Z.y, Z.z);
        const vorn = zv.clone().applyMatrix4(cam.matrixWorldInverse).z < -near;
        zv.project(cam);
        const imBild = vorn && Math.abs(zv.x) <= 0.95 && Math.abs(zv.y) <= 0.95;
        // DIE LINIE Auge → Punkt bis `saum` davor: der erste Verdecker und sein Abstand
        const linie = (px, py, pz, saum) => {
            const zx = px - ex,
                zy = py - ey,
                zz = pz - ez;
            const L = Math.hypot(zx, zy, zz) || 1e-6;
            const ux = zx / L,
                uy = zy / L,
                uz = zz / L;
            const bis = Math.max(0, L - saum);
            // die Hülle einer Instanz schneidet die Strecke [0, bis]
            const amStrahl = (s) => {
                const cx = s.center.x - ex,
                    cy = s.center.y - ey,
                    cz = s.center.z - ez;
                const t = Math.max(0, Math.min(bis, cx * ux + cy * uy + cz * uz));
                return (cx - ux * t) ** 2 + (cy - uy * t) ** 2 + (cz - uz * t) ** 2 <= s.radius * s.radius;
            };
            let vor = null;
            let vorD = Infinity;
            const pruefe = (a, b, c, uvs, me) => {
                if (me.k.klasse === "Streu") return;
                const e1x = b.x - a.x,
                    e1y = b.y - a.y,
                    e1z = b.z - a.z;
                const e2x = c.x - a.x,
                    e2y = c.y - a.y,
                    e2z = c.z - a.z;
                const px = uy * e2z - uz * e2y,
                    py = uz * e2x - ux * e2z,
                    pz = ux * e2y - uy * e2x;
                const det = e1x * px + e1y * py + e1z * pz;
                if (det > -1e-12 && det < 1e-12) return;
                const inv = 1 / det;
                const tx = ex - a.x,
                    ty = ey - a.y,
                    tz = ez - a.z;
                const u = (tx * px + ty * py + tz * pz) * inv;
                if (u < 0 || u > 1) return;
                const qx = ty * e1z - tz * e1y,
                    qy = tz * e1x - tx * e1z,
                    qz = tx * e1y - ty * e1x;
                const v = (ux * qx + uy * qy + uz * qz) * inv;
                if (v < 0 || u + v > 1) return;
                const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
                if (d <= near || d >= bis || d >= vorD) return;
                if (me.karte && uvs) {
                    const w0 = 1 - u - v;
                    if (atlasA(w0 * uvs[0] + u * uvs[2] + v * uvs[4], w0 * uvs[1] + u * uvs[3] + v * uvs[5]) < me.cut)
                        return;
                }
                const ma = maskeArt(me);
                if (
                    ma &&
                    gewicht({ x: ex + ux * d, y: ey + uy * d, z: ez + uz * d }, ma === "fremd" ? me.art : ma) < 0.5
                )
                    return;
                vorD = d;
                vor = me.k.name;
            };
            st.scene.traverseVisible((obj) => {
                if (!zaehlt(obj)) return;
                jeInstanz(obj, amStrahl, (ob, i) => legeDreiecke(ob, i, () => true, pruefe));
            });
            return { vor, vorD, L };
        };
        // der Punkt des Ziels und, wenn genannt (`fussY`), sein Fuß: ein Ziel hinter einer Kuppe zeigt nur die Krone
        const saum = Z.saum != null ? Z.saum : 0.5;
        const kopf = linie(Z.x, Z.y, Z.z, saum);
        const fuss = Number.isFinite(Z.fussY) ? linie(Z.x, Z.fussY, Z.z, saum) : null;
        const zu = kopf.vor != null ? kopf : fuss && fuss.vor != null ? fuss : null;
        zielOut = {
            name: Z.name || "Ziel",
            imBild,
            ndc: [+zv.x.toFixed(3), +zv.y.toFixed(3)],
            frei: zu == null,
            vor: zu ? (zu === fuss ? "am Fuß " : "") + zu.vor : null,
            vorAbstand: zu ? +zu.vorD.toFixed(2) : null,
            abstand: +kopf.L.toFixed(2),
            fussFrei: fuss ? fuss.vor == null : null,
        };
    }
    const N = gw * gh;
    const rund = (x) => +(x / N).toFixed(4);
    const kl = {};
    for (const [k, v] of Object.entries(jeKlasse)) kl[k] = rund(v);
    const nm = {};
    for (const [k, v] of Object.entries(jeName)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4))
        nm[k] = rund(v);
    return {
        deckung: rund(deckung),
        jeKlasse: kl,
        taeter: nm,
        dreiecke: nT,
        taeterDreiecke: meta.filter((me) => TAETER[me.k.klasse]).length,
        speicher: C.metas.length,
        atlas: !!atlasA,
        auge: [+E.x.toFixed(2), +E.y.toFixed(2), +E.z.toFixed(2)],
        fremd: meta.some((me) => maskeArt(me) === "fremd"),
        ziel: zielOut,
    };
}

module.exports = { nahDeckungInSeite, KAMERA_NAH_INSTALL: `window.__nahDeckung = ${nahDeckungInSeite.toString()};` };
