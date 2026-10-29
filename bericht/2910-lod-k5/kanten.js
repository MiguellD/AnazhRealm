// 2910 lod.K5 Staffel 1 — DER KANTEN-VERSATZ AM WECHSEL IM ECHTEN BILD (Seiten-Code für `werkbank eval`, r = Welt, T = THREE).
// Je Familie und gezeigter Stufe die schlechteste Vorlage (die Fehler-Tafel LOD_SCHIRM, 29.10.): ein Exemplar 40 m voraus im Blick des
// Messorts, das Auge des Spielers (1,7 m über dem Boden, KAM_FOV_GRAD) im Wechsel-Abstand des Gesetzes (`_wechselAbstand` · die
// Schwellen der Bäume · `_archStufenGrenzen`), Blick auf die halbe Höhe. Ohne Blende und ohne Band (lodMaskOn, foundryCrossfade aus,
// der LOD-Takt ruht: jede Stufe zeichnet voll, allein): je Abstand ein Schuss OHNE das Exemplar, einer mit der L0, einer mit der
// gewählten Stufe — Ausgabe-Pfad 1920 × 1080 (`__ausgabeAufnahme`, je dreimal, der letzte zählt). Die Maske einer Stufe = die Pixel,
// deren Kanal sich gegen den Schuss ohne Exemplar um > 18 hebt; der Kanten-Versatz = Chamfer der Masken-Kanten (Euklid-Distanz-
// Transformation, beidseitig gemittelt) in Bildpunkten. Die Karte bäckt die Welt (`_tickImpostorBake`), bevor sie zählt.
const st = r.state, rend = st.renderer, cam = st.camera, A = r.constructor;
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
const W = 1920, H = 1080;
rend.setAnimationLoop(null);
window.__buehne({});
const P0 = st.playerMesh.position.clone();
const fov0 = cam.fov, kam0 = [cam.position.clone(), cam.quaternion.clone()];
const merk = { maske: st.lodMaskOn, band: st.foundryCrossfade, takt: st.atmosphere && st.atmosphere.treeLOD };
st.lodMaskOn = false;
st.foundryCrossfade = false;
st.atmosphere = st.atmosphere || {};
st.atmosphere.treeLOD = false;
const boden = (x, z) => r._voxelSurfaceY(x, z);
const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
const FAELLE = [
    { kind: "tree", typ: () => r._growTreeBlueprintForSpawn("baum_weide", "lod-k5"), stufen: [1, 2] },
    { kind: "haus", typ: () => "haus_modern", stufen: [1] },
    { kind: "haus", typ: () => "haus_alemannisch", stufen: [2] },
    { kind: "gate", typ: () => "tor_kathedrale", stufen: [1] },
    { kind: "gate", typ: () => "tor_geisttor", stufen: [2] },
    { kind: "vehicle", typ: () => "fahrzeug_limousine", stufen: [1] },
];
const schuss = async () => {
    let x = null;
    for (let i = 0; i < 3; i++) {
        r._schattenAlleNeu();
        x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
    }
    return x.u8;
};
const maske = (a, b) => {
    const m = new Uint8Array(W * H);
    for (let p = 0, i = 0; p < W * H; p++, i += 4)
        m[p] = Math.abs(a[i] - b[i]) > 18 || Math.abs(a[i + 1] - b[i + 1]) > 18 || Math.abs(a[i + 2] - b[i + 2]) > 18 ? 1 : 0;
    return m;
};
const edt = (f, n) => {
    const d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    let k = 0;
    z[0] = -Infinity, z[1] = Infinity;
    const s = (q, w) => (f[q] + q * q - (f[w] + w * w)) / (2 * q - 2 * w);
    for (let q = 1; q < n; q++) {
        let x = s(q, v[k]);
        while (x <= z[k]) x = s(q, v[--k]);
        k++, v[k] = q, z[k] = x, z[k + 1] = Infinity;
    }
    for (let q = 0, j = 0; q < n; q++) {
        while (z[j + 1] < q) j++;
        d[q] = (q - v[j]) ** 2 + f[v[j]];
    }
    return d;
};
const chamfer = (a, b) => {
    // der Rahmen beider Masken (+ 8 px), die Kanten je Maske, die Distanz zur Kante der anderen
    let [x0, y0, x1, y1] = [W, H, -1, -1];
    for (let p = 0; p < W * H; p++) if (a[p] || b[p]) [x0, y0, x1, y1] = [Math.min(x0, p % W), Math.min(y0, (p / W) | 0), Math.max(x1, p % W), Math.max(y1, (p / W) | 0)];
    if (x1 < 0) return { px: null, pixel: 0 };
    [x0, y0, x1, y1] = [Math.max(0, x0 - 8), Math.max(0, y0 - 8), Math.min(W - 1, x1 + 8), Math.min(H - 1, y1 + 8)];
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const kante = (m) => {
        const k = new Uint8Array(w * h);
        for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
                const p = (y + y0) * W + x + x0;
                if (m[p] && (!m[p - 1] || !m[p + 1] || !m[p - W] || !m[p + W])) k[y * w + x] = 1;
            }
        return k;
    };
    const abstand = (k) => {
        const g = new Float64Array(w * h);
        for (let x = 0; x < w; x++) {
            const sp = edt(Float64Array.from({ length: h }, (_, y) => (k[y * w + x] ? 0 : 1e20)), h);
            for (let y = 0; y < h; y++) g[y * w + x] = sp[y];
        }
        for (let y = 0; y < h; y++) {
            const zl = edt(g.subarray(y * w, y * w + w), w);
            for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(zl[x]);
        }
        return g;
    };
    const [ka, kb] = [kante(a), kante(b)];
    const mittel = (k, g) => {
        let s = 0, n = 0;
        for (let i = 0; i < k.length; i++) if (k[i]) (s += g[i]), n++;
        return n ? s / n : NaN;
    };
    return { px: (mittel(ka, abstand(kb)) + mittel(kb, abstand(ka))) / 2, pixel: a.reduce((s, x) => s + x, 0) };
};
// die Stufe erzwingen: der EINE Wechsel (`_switchArchitectureLOD`), bis die Stufe dient (die Karte bäckt die Welt)
const stelle = async (e, s, d) => {
    for (let i = 0; i < 400; i++) {
        [e._lodLevel, e._servedLod] = [s === 0 ? 1 : 0, undefined]; // kein Klammer-Kurzschluss: die Stufe kommt neu
        if (r._switchArchitectureLOD(e, s, d) && e._lodLevel === s) return true;
        r._tickImpostorBake();
        await warte(50);
    }
    return false;
};
const aus = { schirm: [W, H], fov: A.KAM_FOV_GRAD, faelle: [] };
const neu = [];
try {
    cam.fov = A.KAM_FOV_GRAD;
    cam.updateProjectionMatrix();
    st.playerMesh.visible = false;
    for (const F of FAELLE) {
        const m = P0.clone().addScaledVector(fwd, 40);
        m.y = boden(m.x, m.z);
        const e = r.spawnArchitecture(F.typ(), { x: m.x, y: m.y, z: m.z }, { silent: true, seed: 1 });
        if (!e) {
            aus.faelle.push({ kind: F.kind, fehler: "kein Exemplar" });
            continue;
        }
        neu.push(e);
        if (!e.instanced) r._rebuildArchitectureMesh(e);
        const preset = r._foundryPresetForEntry(e);
        for (let i = 0; i < 400 && (F.kind !== "tree" || r._lodTreeVisHeight(e) == null); i++) await warte(50);
        const hoehe = F.kind === "tree" ? r._lodTreeVisHeight(e) : null;
        const D = A.LOD_DISTANCES, ref = st.lodRef > 0 ? st.lodRef : D.lodRef;
        const G = F.kind === "tree" ? null : r._archStufenGrenzen(e);
        for (const s of F.stufen) {
            const sk = e.scale > 0 ? e.scale : 1;
            const d = F.kind === "tree" ? [D.thresh01, D.thresh12][s - 1] * Math.max(hoehe, ref) / ref : G.grenzen.find((g) => g.stufe === s).ab * sk;
            const auge = m.clone().addScaledVector(fwd, -d);
            auge.y = boden(auge.x, auge.z) + 1.7;
            const hoch = hoehe || 4;
            cam.position.copy(auge);
            cam.lookAt(m.x, m.y + hoch / 2, m.z);
            cam.updateMatrixWorld(true);
            r._archInstanceRemove(e);
            const leer = await schuss();
            const ok0 = await stelle(e, 0, d);
            const b0 = await schuss();
            const oks = await stelle(e, s, d);
            const bs = await schuss();
            const k = chamfer(maske(b0, leer), maske(bs, leer));
            aus.faelle.push({ kind: F.kind, preset, stufe: s, d: +d.toFixed(2), hoehe, px: k.px == null ? null : +k.px.toFixed(3), pixel: k.pixel, ok: ok0 && oks });
        }
        r._archInstanceRemove(e);
    }
} finally {
    for (const e of neu) r.removeArchitecture(e);
    st.lodMaskOn = merk.maske;
    st.foundryCrossfade = merk.band;
    st.atmosphere.treeLOD = merk.takt;
    cam.fov = fov0;
    cam.updateProjectionMatrix();
    cam.position.copy(kam0[0]), cam.quaternion.copy(kam0[1]), cam.updateMatrixWorld(true);
    st.playerMesh.visible = true;
}
return aus;
