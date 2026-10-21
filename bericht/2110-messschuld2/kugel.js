// 2110 messschuld2 licht.K2 Staffel 1 — DIE LICHT-BILANZ AN EINER KUGEL (Seiten-Code für `werkbank eval`, r = Welt, T = THREE).
// Vier Kugeln (Radius 0,5 m) auf dem Boden der Mess-Wiese, Stoff = das EINE Stoff-Programm der Welt (`r._buildToonNodeMaterial`
// → `_buildPbrNodeMaterial({ color })`, derselbe Bau wie bau-teile/siedlung-bauten): 18 % (Karte der Albedo-Tafel, `karte.albedo`)
// und Weiß 0,80, je eine in der Sonne und eine im Schatten einer Scheibe (Radius 0,8 m, 6 m vor der Kugel zur Sonne, derselbe Stoff).
// Bühne wie `werkbank bild` (Sonne, Sommer, Uhr 0,5 über den Uhr-Schreiber), Schuss über `__ausgabeAufnahme(1920, 1080, 1,
// { satz: "messung" })`. Auswertung je Pixel: Strahl → Kugel → Normale N; das Ausgabe-Pixel zurück durch sRGB und die Tonkurve
// (Khronos PBR Neutral, r184 NeutralToneMapping; Entsättigung der Schulter nicht invertiert) ÷ Belichtung → linear.
// Klassen je Kugel: oben (N·up ≥ 0,94, die waagrechte Karte) · sonne (N·S ≥ 0,94) · abgewandt (N·S ≤ −0,3, N·up ≥ 0).
const st = r.state, rend = st.renderer, cam = st.camera, sc = st.scene, dl = st.directionalLight;
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
rend.setAnimationLoop(null);
const boden = (x, z) => r._voxelSurfaceY(x, z);
const P0 = st.playerMesh.position.clone();
const fov0 = cam.fov, kam0 = [cam.position.clone(), cam.quaternion.clone()];
window.__buehne({});
if (st.world) st.world.timeOfDay = 0.5;
r.setTimeOfDay(0.5, "human");
for (let i = 0; i < 20 && typeof r._leuchtTakt === "function"; i++) (r._leuchtTakt(), await warte(50));
const S = dl.position.clone().sub(dl.target.position).normalize();
const a = new T.Vector3(S.x, 0, S.z).normalize(), b = new T.Vector3(-a.z, 0, a.x), up = new T.Vector3(0, 1, 0);
const R = 0.5, D = 6, RS = 0.8;
const stoff = (alb, seite) => r._buildToonNodeMaterial(Object.assign({ color: new T.Color(alb, alb, alb) }, seite ? { side: T.DoubleSide } : {}));
// DER ORT DER REIHE (Lauf 3: 3 m neben dem Spieler lagen alle vier Kugeln im Baum-Schatten, A = C): voraus im Blick des Messorts
// (ins Offene) die erste Stelle, an der kein Werfer (Ebene SHADOW_TWIN_LAYER, die die Kaskaden sehen) den Strahl der beiden
// Sonnen-Kugeln zur Sonne kreuzt (60 m); der Beweis bleibt das Bild: A gegen B je Sonnen-Kugel
const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
const rc = new T.Raycaster();
rc.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
rc.far = 60;
const frei = (p) => {
    rc.set(p, S);
    return !rc.intersectObject(sc, true).some((h) => !(h.object.name || "").startsWith("probe:") && h.object !== st.playerMesh);
};
let mitte = null;
const ortSuche = [];
for (const d of [10, 14, 18, 22, 27, 33, 40])
    for (const s of [0, 5, -5, 10, -10]) {
        if (mitte) break;
        const m = P0.clone().addScaledVector(fwd, d).addScaledVector(b, s);
        const ok = [1.3, 0, -2.6, -3.9].every((tt) => {
            const p = m.clone().addScaledVector(a, tt);
            p.y = boden(p.x, p.z) + 2 * R;
            return frei(p);
        });
        ortSuche.push([d, s, ok]);
        if (ok) mitte = m;
    }
if (!mitte) return { fehler: "kein freier Ort", ortSuche };
const kugeln = [
    { name: "W-sonne", alb: 0.8, t: 1.3, schatten: false },
    { name: "G-sonne", alb: 0.18, t: 0, schatten: false },
    { name: "G-schatten", alb: 0.18, t: -2.6, schatten: true },
    { name: "W-schatten", alb: 0.8, t: -3.9, schatten: true },
];
const neu = [];
const geo = new T.SphereGeometry(R, 96, 64), scheibe = new T.CircleGeometry(RS, 48);
for (const k of kugeln) {
    const p = mitte.clone().addScaledVector(a, k.t);
    p.y = boden(p.x, p.z) + R;
    k.c = p;
    const m = new T.Mesh(geo, stoff(k.alb));
    m.position.copy(p);
    m.castShadow = m.receiveShadow = true;
    m.frustumCulled = false;
    m.name = "probe:kugel:" + k.name;
    sc.add(m), neu.push(m);
    if (k.schatten) {
        const s = new T.Mesh(scheibe, stoff(0.18, true));
        s.position.copy(p).addScaledVector(S, D);
        s.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), S);
        s.castShadow = true;
        s.receiveShadow = true;
        s.frustumCulled = false;
        s.name = "probe:scheibe:" + k.name;
        sc.add(s), neu.push(s);
        k.scheibe = s.position.toArray().map((v) => +v.toFixed(2));
    }
}
// das Auge: 5,5 m quer zur Reihe (die Sonne steht seitlich), 6 m über dem Boden (Blick ~47° hinab: Kappe oben und die Sonnen-Normale liegen mitten in der Kugel, nicht am Rand), Blick auf die Mitte der Reihe
const mr = mitte.clone().addScaledVector(a, -1.3);
const auge = mr.clone().addScaledVector(b, 5.5);
auge.y = Math.max(boden(auge.x, auge.z), boden(mr.x, mr.z)) + 6;
const ziel = mr.clone();
ziel.y = boden(mr.x, mr.z) + 0.5;
cam.fov = 50;
cam.updateProjectionMatrix();
cam.position.copy(auge);
cam.lookAt(ziel);
cam.updateMatrixWorld(true);
st.playerMesh.visible = false;
const W = 1920, H = 1080;
// DREI SCHÜSSE derselben Pose: A die Welt (Sonne, Schatten-Knoten, Scheiben) · B die Kugeln ohne Schatten-Empfang (die Sonne ungeschattet)
// · C die Sonne aus (dl.intensity 0: nur Himmel/Umgebung) — B/C trennt, ob die Kugel die Sonne bekommt, A gegen B, ob ein Schatten fällt
const auf = [], varianten = [];
const kugelMeshes = neu.filter((m) => m.name.startsWith("probe:kugel"));
const schuss = async (tag, n) => {
    for (let i = 0; i < n; i++) {
        try {
            if (st.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(st.fernRing);
        } catch (_e) {}
        r._schattenAlleNeu();
        const x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
        if (i === n - 1) (auf.push(x), varianten.push({ tag, dlIntensitaet: +dl.intensity.toFixed(3) }));
    }
};
const I0 = dl.intensity;
try {
    await schuss("A-welt", 3);
    kugelMeshes.forEach((m) => ((m.receiveShadow = false), (m.material.needsUpdate = true)));
    await schuss("B-ohneEmpfang", 3);
    kugelMeshes.forEach((m) => ((m.receiveShadow = true), (m.material.needsUpdate = true)));
    dl.intensity = 0;
    await schuss("C-ohneSonne", 3);
} finally {
    dl.intensity = I0;
    cam.updateMatrixWorld(true);
}
const camM = cam.matrixWorld.clone(), projI = cam.projectionMatrixInverse.clone(), cp = cam.position.clone(), camS = cam.clone();
const belicht = rend.toneMappingExposure, kurve = rend.toneMapping;
// zurück: Kugeln weg, Kamera wie vorher
for (const m of neu) (sc.remove(m), m.material.dispose());
geo.dispose(), scheibe.dispose();
cam.fov = fov0;
cam.updateProjectionMatrix();
cam.position.copy(kam0[0]), cam.quaternion.copy(kam0[1]), cam.updateMatrixWorld(true);
st.playerMesh.visible = true;
// die Tonkurve zurück: sRGB → linear, PBR Neutral invertiert (Offset aus dem kleinsten Kanal, Schulter über den größten)
const srgb = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const SC = 0.8 - 0.04, DD = 1 - SC;
const invNeutral = (y) => {
    const ymin = Math.min(...y), ymax = Math.max(...y);
    let k = 1;
    if (ymax >= SC) { const np = Math.min(ymax, 0.9995); const pk = (DD * DD) / (1 - np) - DD + SC; k = pk / np; }
    const yu = y.map((v) => v * k), um = ymin * k;
    const off = um < 0.04 ? (() => { const xm = Math.sqrt(um / 6.25); return xm - 6.25 * xm * xm; })() : 0.04;
    return yu.map((v) => v + off);
};
const lies = (u8) => {
    const ray = new T.Ray(), v = new T.Vector3(), hit = new T.Vector3();
    const out = {};
    for (const k of kugeln) {
        const sp = new T.Sphere(k.c, R);
        const pc = k.c.clone().project(camS);
        const rpx = (R / k.c.distanceTo(cp)) * (H / 2) / Math.tan((50 * Math.PI) / 360) * 1.15;
        const cx = ((pc.x + 1) / 2) * W, cy = ((1 - pc.y) / 2) * H;
        const kl = { oben: [], sonne: [], abgewandt: [], obenRoh: [] }, bins = {};
        let n = 0, clip = 0;
        for (let y = Math.max(0, Math.floor(cy - rpx)); y < Math.min(H, Math.ceil(cy + rpx)); y++)
            for (let x = Math.max(0, Math.floor(cx - rpx)); x < Math.min(W, Math.ceil(cx + rpx)); x++) {
                v.set(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).applyMatrix4(projI).applyMatrix4(camM);
                ray.set(cp, v.sub(cp).normalize());
                if (!ray.intersectSphere(sp, hit)) continue;
                const N = hit.clone().sub(k.c).normalize();
                // Rand-Pixel (Kante, TRAA) weg: die Normale steht nicht schräger als 75° zum Auge
                if (N.dot(ray.direction) > -0.26) continue;
                const i = (y * W + x) * 4;
                const y8 = [u8[i], u8[i + 1], u8[i + 2]];
                n++;
                if (Math.max(...y8) >= 254) clip++;
                const lin = invNeutral(y8.map(srgb)).map((c) => c / belicht);
                const Y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
                const ns = N.dot(S), nu = N.y;
                if (nu >= 0.94) (kl.oben.push(Y), kl.obenRoh.push(y8[1]));
                if (ns >= 0.94) kl.sonne.push(Y);
                if (ns <= -0.3 && nu >= 0) kl.abgewandt.push(Y);
                const bk = (Math.round(ns * 5) / 5).toFixed(1);
                (bins[bk] = bins[bk] || []).push(Y);
            }
        const med = (q) => (q.length ? +q.sort((p, s) => p - s)[q.length >> 1].toFixed(4) : null);
        out[k.name] = { px: n, clip, mitte: [Math.round(cx), Math.round(cy)], rPx: Math.round(rpx / 1.15) };
        for (const [z, q] of Object.entries(kl)) if (z !== "obenRoh") out[k.name][z] = { Y: med(q), n: q.length };
        out[k.name].profilNS = Object.fromEntries(Object.keys(bins).sort((p, s) => p - s).map((bk) => [bk, med(bins[bk]) + "/" + bins[bk].length]));
        out[k.name].oben.sRGB = kl.obenRoh.length ? kl.obenRoh.sort((p, s) => p - s)[kl.obenRoh.length >> 1] : null;
    }
    return out;
};
const je = auf.map((x) => lies(x.u8));
const L = je[0];
const q = (A, B, f) => (L[A][f].Y && L[B][f].Y ? +(L[A][f].Y / L[B][f].Y).toFixed(3) : null);
// die Scheibe verdeckt vom Himmel über der Kugel-Oberseite den Anteil ≈ (RS/D)² · cos(Zenit der Sonne) — die Korrektur ist genannt, nie gerechnet
const verdeckt = +(((RS / (D - R)) ** 2) * S.y).toFixed(4);
// Bild zum Ansehen: das ganze Bild (JPEG) und der Ausschnitt um die Reihe ×1
const bild = (u8, crop) => {
    const cv = document.createElement("canvas");
    cv.width = W, cv.height = H;
    const cx = cv.getContext("2d");
    cx.putImageData(new ImageData(new Uint8ClampedArray(u8.buffer.slice(u8.byteOffset, u8.byteOffset + W * H * 4)), W, H), 0, 0);
    if (!crop) return cv.toDataURL("image/jpeg", 0.88);
    const c2 = document.createElement("canvas");
    c2.width = crop[2], c2.height = crop[3];
    c2.getContext("2d").drawImage(cv, crop[0], crop[1], crop[2], crop[3], 0, 0, crop[2], crop[3]);
    return c2.toDataURL("image/png");
};
const xs = Object.values(L).map((k) => k.mitte[0]), ys = Object.values(L).map((k) => k.mitte[1]), rr = Math.max(...Object.values(L).map((k) => k.rPx));
const crop = [Math.max(0, Math.min(...xs) - rr * 2), Math.max(0, Math.min(...ys) - rr * 3), 0, 0];
crop[2] = Math.min(W - crop[0], Math.max(...xs) - crop[0] + rr * 2);
crop[3] = Math.min(H - crop[1], Math.max(...ys) - crop[1] + rr * 2);
return {
    ende: "ok",
    stand: { version: r.constructor.VERSION, uhr: st.timeOfDay, wetter: st.weather, saison: st.season },
    puffer: [rend.getDrawingBufferSize(new T.Vector2()).x, rend.getDrawingBufferSize(new T.Vector2()).y], u8len: auf[0].u8.length,
    kurve, belicht: +belicht.toFixed(4), csm: !!st.csmNode, dlWirft: dl.castShadow, kaskaden: st.csmNode && st.csmNode.lights ? st.csmNode.lights.length : 0,
    sonne: S.toArray().map((v) => +v.toFixed(3)), sonnenHoeheGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1),
    spieler: P0.toArray().map((v) => +v.toFixed(1)), auge: auge.toArray().map((v) => +v.toFixed(2)),
    kugeln: kugeln.map((k) => ({ name: k.name, alb: k.alb, c: k.c.toArray().map((v) => +v.toFixed(2)), scheibe: k.scheibe || null })),
    ortSuche: ortSuche.length, ort: mitte.toArray().map((v) => +v.toFixed(1)), varianten, dlIntensitaet: +I0.toFixed(3),
    schuesse: je,
    bilanz: {
        verhaeltnisG_oben: q("G-sonne", "G-schatten", "oben"),
        verhaeltnisW_oben: q("W-sonne", "W-schatten", "oben"),
        schattenAnteilG: L["G-schatten"].oben.Y && L["G-sonne"].oben.Y ? +(L["G-schatten"].oben.Y / L["G-sonne"].oben.Y).toFixed(4) : null,
        schattenAnteilW: L["W-schatten"].oben.Y && L["W-sonne"].oben.Y ? +(L["W-schatten"].oben.Y / L["W-sonne"].oben.Y).toFixed(4) : null,
        eigeneKugel_sonneZuAbgewandtG: q("G-sonne", "G-sonne", "oben") && L["G-sonne"].abgewandt.Y ? +(L["G-sonne"].sonne.Y / L["G-sonne"].abgewandt.Y).toFixed(3) : null,
        weissZuGrau_oben_sonne: q("W-sonne", "G-sonne", "oben"),
        weissZuGrau_oben_schatten: q("W-schatten", "G-schatten", "oben"),
        scheibeVerdecktHimmel: verdeckt,
    },
    bilder: [
        { name: "kugel-voll", jpg: bild(auf[0].u8) },
        { name: "kugel-reihe", jpg: bild(auf[0].u8, crop), crop },
        { name: "kugel-reihe-B", jpg: bild(auf[1].u8, crop), crop },
    ],
};
