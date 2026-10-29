// 2910 w3w-glanz material.K5 Staffel 1 — DIE KUGEL-BÜHNE DES GLANZES (Seiten-Code für `werkbank eval`, r = Welt, T = THREE).
// Je Klasse EINE Kugel (Radius 0,5 m, 1,2 m über dem Boden, ohne Schatten) im Welt-Stoff ihrer Stoff-Zeile
// (`r._buildToonNodeMaterial({ color, stoff, tags })` → `_buildPbrNodeMaterial`, derselbe Bau wie bau-teile/siedlung-bauten), die
// Umgebung des Stoffs aus (envMapIntensity 0: kein Himmel, kein Spiegel — nur die Sonne zählt). Das Auge 2,5 m vor der Kugel, so
// gedreht, dass der Halbwinkel zwischen Sonne und Auge θd = 25° ist (die Geometrie der Referenz), Blickfeld 30°, 1920×1080, die
// Szene in voller Auflösung (szeneSkala 1, keine Nach-Schärfe) und ohne Bloom. Schüsse je Klasse: C ohne Sonne (Himmel, Hemi,
// Ambient), A mit der Sonne × q für q = 1, 1/32, 1/1024 (die Belichtungs-Reihe: je Pixel die hellste ungesättigte). Je Pixel:
// Strahl → Kugel → N; die Ausgabe zurück durch sRGB und die Tonkurve (Khronos PBR Neutral, wie bericht/2110-messschuld2/kugel.js)
// ÷ Belichtung → linear; f = (A_q − C) / (q · E · cos θL) mit E = Y(Licht-Farbe) · Stärke — die BRDF in 1/sr. Das Profil über θh
// (Winkel N–H) und daraus dieselben Maße wie die Referenz (MERL über NBRDF, die Stoff-Zeile `_defaultMaterials`): Boden = Mittel
// θh 30–40°, Kappe = mittlere BRDF in θh ≤ 1° (Raumwinkel-gewogen), Energie = ∫ (f − Boden) dω über θh ≤ 20°, Breite θ50 = Median
// der Energie, Spitze ρ = Kappe / Energie (1/sr). Rückgabe je Klasse diese Maße, θd im Mittel, die Pixel und die Lücken.
const st = r.state, rend = st.renderer, cam = st.camera, sc = st.scene, dl = st.directionalLight, Z = st.materials;
const KL = ["eisen", "bronze", "quarz", "stahl"];
const W = 1920, H = 1080, R = 0.5, D = 2.5, FOV = 30, TD = 25, Q = [1, 1 / 32, 1 / 1024];
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
rend.setAnimationLoop(null);
window.__buehne({});
if (st.world) st.world.timeOfDay = 0.5;
r.setTimeOfDay(0.5, "human");
for (let i = 0; i < 20 && typeof r._leuchtTakt === "function"; i++) (r._leuchtTakt(), await warte(50));
const S = dl.position.clone().sub(dl.target.position).normalize();
const up = new T.Vector3(0, 1, 0);
// das Auge: V = S·cos 2θd + quer·sin 2θd (quer waagrecht ⟂ S) — V·S = cos 50°, V.y = S.y·cos 50° > 0
const quer = new T.Vector3().crossVectors(S, up).normalize();
const V = S.clone().multiplyScalar(Math.cos((2 * TD * Math.PI) / 180)).addScaledVector(quer, Math.sin((2 * TD * Math.PI) / 180)).normalize();
const P0 = st.playerMesh.position.clone();
const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
const rc = new T.Raycaster();
rc.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
const frei = (p, d, weit) => {
    rc.set(p, d);
    rc.far = weit;
    return !rc.intersectObject(sc, true).some((h) => !(h.object.name || "").startsWith("probe:") && h.object !== st.playerMesh);
};
let M = null;
const ortSuche = [];
for (const d of [8, 12, 16, 20, 25, 30, 40, 55])
    for (const s of [0, 5, -5, 10, -10]) {
        if (M) break;
        const m = P0.clone().addScaledVector(fwd, d).addScaledVector(new T.Vector3(-fwd.z, 0, fwd.x), s);
        m.y = r.getTerrainHeightAt(m.x, m.z) + 1.2;
        const k = m.clone().addScaledVector(V, D);
        const ok = frei(m, S, 120) && frei(m, V, D + 0.5) && k.y > r.getTerrainHeightAt(k.x, k.z) + 0.3;
        ortSuche.push([d, s, ok]);
        if (ok) M = m;
    }
if (!M) return { ende: "kein freier Ort", ortSuche };
const geo = new T.SphereGeometry(R, 160, 120);
const kugel = new T.Mesh(geo, null);
kugel.position.copy(M);
kugel.castShadow = kugel.receiveShadow = false;
kugel.frustumCulled = false;
kugel.name = "probe:kugel-glanz";
const fov0 = cam.fov, kam0 = [cam.position.clone(), cam.quaternion.clone()];
const skala0 = st.szeneSkala, I0 = dl.intensity, pu = st.postProcessingUniforms || {}, bloom0 = pu.bloomStrength ? pu.bloomStrength.value : null;
const E = I0 * (0.2126 * dl.color.r + 0.7152 * dl.color.g + 0.0722 * dl.color.b);
// die Tonkurve zurück (wie kugel.js): sRGB → linear, PBR Neutral invertiert
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
const Ylin = (u8, i, b) => {
    const l = invNeutral([u8[i], u8[i + 1], u8[i + 2]].map(srgb)).map((c) => c / b);
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};
// die Fächer des Profils über θh: 0–5° je 0,25°, 5–40° je 1°
const RAND = [];
for (let t = 0; t < 5; t += 0.25) RAND.push(t);
for (let t = 5; t <= 40; t += 1) RAND.push(t);
const fach = (t) => { for (let i = RAND.length - 2; i >= 0; i--) if (t >= RAND[i]) return i; return -1; };
const masse = (sum, n) => {
    const d2r = Math.PI / 180;
    const fb = [];
    for (let i = 0; i < RAND.length - 1; i++) if (n[i] > 0) fb.push([(RAND[i] + RAND[i + 1]) / 2, sum[i] / n[i], (RAND[i + 1] - RAND[i]) * d2r]);
    const boden = fb.filter(([t]) => t >= 30).reduce((a, [, f]) => a + f, 0) / Math.max(1, fb.filter(([t]) => t >= 30).length);
    let ks = 0, kw = 0;
    for (const [t, f, dt] of fb) if (t <= 1) (ks += f * Math.sin(t * d2r) * dt), (kw += Math.sin(t * d2r) * dt);
    const kum = [];
    let e = 0;
    for (const [t, f, dt] of fb) if (t <= 20) (e += Math.max(f - boden, 0) * Math.sin(t * d2r) * dt * 2 * Math.PI), kum.push([t, e, dt]);
    let med = null;
    for (let i = 0; i < kum.length && med == null; i++)
        if (kum[i][1] >= e / 2) {
            const vor = i ? kum[i - 1][1] : 0, t0 = kum[i][0] - kum[i][2] / (2 * d2r), t1 = kum[i][0] + kum[i][2] / (2 * d2r);
            med = t0 + ((e / 2 - vor) / Math.max(kum[i][1] - vor, 1e-12)) * (t1 - t0);
        }
    const kappe = kw > 0 ? ks / kw : null;
    return { breite: med == null ? null : +med.toFixed(3), spitze: kappe && e > 0 ? +(kappe / e).toFixed(2) : null, kappe: kappe && +kappe.toFixed(4), boden: +boden.toFixed(5), energie: +e.toFixed(6) };
};
const out = {};
const schuss = async (q) => {
    dl.intensity = I0 * q;
    r._schattenAlleNeu();
    const x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
    return { u8: x.u8, b: rend.toneMappingExposure };
};
sc.add(kugel);
try {
    st.szeneSkala = 1;
    if (pu.bloomStrength) pu.bloomStrength.value = 0;
    st.playerMesh.visible = false;
    cam.fov = FOV;
    cam.updateProjectionMatrix();
    cam.position.copy(M).addScaledVector(V, D);
    cam.lookAt(M);
    cam.updateMatrixWorld(true);
    for (const n of KL) {
        const mat = r._buildToonNodeMaterial({ color: Z[n].color, stoff: n, tags: Z[n].tags });
        mat.envMapIntensity = 0;
        kugel.material = mat;
        const C = await schuss(0);
        const A = [];
        for (const q of Q) A.push(await schuss(q));
        cam.updateMatrixWorld(true);
        const camM = cam.matrixWorld.clone(), projI = cam.projectionMatrixInverse.clone(), cp = cam.position.clone();
        const sp = new T.Sphere(M, R), ray = new T.Ray(), v = new T.Vector3(), hit = new T.Vector3(), Hh = new T.Vector3(), Vp = new T.Vector3();
        const pc = M.clone().project(cam);
        const rpx = ((R / M.distanceTo(cp)) * (H / 2)) / Math.tan((FOV * Math.PI) / 360) * 1.1;
        const cx = ((pc.x + 1) / 2) * W, cy = ((1 - pc.y) / 2) * H;
        const sum = new Float64Array(RAND.length), anz = new Uint32Array(RAND.length);
        let px = 0, td = 0, satt = 0;
        for (let y = Math.max(0, Math.floor(cy - rpx)); y < Math.min(H, Math.ceil(cy + rpx)); y++)
            for (let x = Math.max(0, Math.floor(cx - rpx)); x < Math.min(W, Math.ceil(cx + rpx)); x++) {
                v.set(((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).applyMatrix4(projI).applyMatrix4(camM);
                ray.set(cp, v.sub(cp).normalize());
                if (!ray.intersectSphere(sp, hit)) continue;
                const N = hit.clone().sub(M).normalize();
                const cl = N.dot(S);
                if (cl < 0.25 || N.dot(ray.direction) > -0.26) continue;
                Vp.copy(cp).sub(hit).normalize();
                Hh.copy(S).add(Vp).normalize();
                const th = (Math.acos(Math.min(1, N.dot(Hh))) * 180) / Math.PI;
                const i = (y * W + x) * 4, f0 = fach(th);
                if (f0 < 0) continue;
                const yc = Ylin(C.u8, i, C.b);
                let f = null;
                for (let k = 0; k < Q.length && f == null; k++) {
                    const u = A[k].u8;
                    if (Math.max(u[i], u[i + 1], u[i + 2]) >= 250) continue;
                    f = (Ylin(u, i, A[k].b) - yc) / (Q[k] * E * cl);
                }
                if (f == null) { satt++; continue; }
                sum[f0] += f;
                anz[f0]++;
                px++;
                td += (Math.acos(Math.min(1, S.dot(Hh))) * 180) / Math.PI;
            }
        const luecken = [];
        for (let k = 0; k < RAND.length - 1; k++) if (RAND[k] < 20 && !anz[k]) luecken.push(RAND[k]);
        out[n] = Object.assign(masse(sum, anz), {
            zeile: [Z[n].rauheit, Z[n].metall], thetaD: px ? +(td / px).toFixed(2) : null, pixel: px, satt, luecken,
            belicht: [C.b, ...A.map((a) => a.b)].map((b) => +b.toFixed(4)),
            profil: Object.fromEntries([0, 2, 4, 8, 12, 16, 20, 24, 30, 40].filter((k) => k < RAND.length - 1 && anz[k]).map((k) => [RAND[k], +(sum[k] / anz[k]).toFixed(4)])),
        });
        mat.dispose();
    }
} finally {
    sc.remove(kugel);
    geo.dispose();
    dl.intensity = I0;
    st.szeneSkala = skala0;
    if (pu.bloomStrength && bloom0 != null) pu.bloomStrength.value = bloom0;
    cam.fov = fov0;
    cam.updateProjectionMatrix();
    cam.position.copy(kam0[0]), cam.quaternion.copy(kam0[1]), cam.updateMatrixWorld(true);
    st.playerMesh.visible = true;
}
return {
    ende: "ok",
    stand: { version: r.constructor.VERSION, uhr: st.timeOfDay, wetter: st.weather, saison: st.season },
    sonnenHoeheGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1), E: +E.toFixed(4), ort: M.toArray().map((x) => +x.toFixed(1)), ortSuche: ortSuche.length,
    klassen: out,
};
