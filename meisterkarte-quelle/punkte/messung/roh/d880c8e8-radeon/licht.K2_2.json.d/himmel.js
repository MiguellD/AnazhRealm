return await (async function himmelZurSonne(r, T) {
    const st = r.state;
    const rend = st.renderer;
    const cam = st.camera;
    const sc = st.scene;
    const dl = st.directionalLight;
    const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
    rend.setAnimationLoop(null);
    window.__buehne({});
    r.setTimeOfDay(0.5, "human");
    r._himmelSprung = true;
    r._applyDayNightToScene();
    for (let i = 0; i < 20 && typeof r._leuchtTakt === "function"; i++) (r._leuchtTakt(), await warte(50));
    const S = dl.position.clone().sub(dl.target.position).normalize();
    const a = new T.Vector3(S.x, 0, S.z).normalize();
    const R = 0.5;
    const P0 = st.playerMesh.position.clone();
    const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
    const quer = new T.Vector3(-fwd.z, 0, fwd.x);
    const rc = new T.Raycaster();
    rc.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
    rc.far = 60;
    const frei = (p) =>
        [1, -1].every((sg) =>
            [-45, 0, 45].every((dw) =>
                [20, 45].every((el) => {
                    const w = Math.atan2(a.z * sg, a.x * sg) + (dw * Math.PI) / 180;
                    const e = (el * Math.PI) / 180;
                    rc.set(p, new T.Vector3(Math.cos(w) * Math.cos(e), Math.sin(e), Math.sin(w) * Math.cos(e)));
                    return !rc.intersectObject(sc, true).some((h) => !(h.object.name || "").startsWith("probe:") && h.object !== st.playerMesh);
                })
            )
        );
    let mitte = null;
    for (const d of [10, 14, 18, 22, 27, 33, 40])
        for (const s of [0, 5, -5, 10, -10]) {
            if (mitte) break;
            const m = P0.clone().addScaledVector(fwd, d).addScaledVector(quer, s);
            m.y = r._voxelSurfaceY(m.x, m.z) + R;
            if (frei(m)) mitte = m;
        }
    if (!mitte) return { ende: "kein freier Himmel", stand: { uhr: st.timeOfDay, wetter: st.weather } };
    const geo = new T.SphereGeometry(R, 96, 64);
    const kugel = new T.Mesh(geo, r._buildToonNodeMaterial({ color: new T.Color(0.18, 0.18, 0.18) }));
    kugel.position.copy(mitte);
    kugel.castShadow = kugel.receiveShadow = true;
    kugel.frustumCulled = false;
    kugel.name = "probe:kugel:himmel";
    sc.add(kugel);
    const [fov0, pos0, quat0, I0] = [cam.fov, cam.position.clone(), cam.quaternion.clone(), dl.intensity];
    const W = 1920;
    const H = 1080;
    const srgb = (b) => {
        const v = b / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const SC = 0.76;
    const DD = 1 - SC;
    const invNeutral = (y) => {
        const ymin = Math.min(...y);
        const ymax = Math.max(...y);
        let k = 1;
        if (ymax >= SC) {
            const np = Math.min(ymax, 0.9995);
            k = ((DD * DD) / (1 - np) - DD + SC) / np;
        }
        const um = ymin * k;
        const xm = Math.sqrt(um / 6.25);
        const off = um < 0.04 ? xm - 6.25 * xm * xm : 0.04;
        return y.map((v) => v * k + off);
    };
    const seiten = {};
    st.playerMesh.visible = false;
    dl.intensity = 0;
    try {
        for (const [name, sg] of [
            ["zur", 1],
            ["weg", -1],
        ]) {
            cam.fov = 50;
            cam.updateProjectionMatrix();
            cam.position.copy(mitte).addScaledVector(a, 4 * sg);
            cam.position.y += 0.5;
            cam.lookAt(mitte);
            cam.updateMatrixWorld(true);
            let x = null;
            for (let i = 0; i < 3; i++) {
                r._schattenAlleNeu();
                x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
            }
            const [camM, projI, cp, belicht] = [cam.matrixWorld.clone(), cam.projectionMatrixInverse.clone(), cam.position.clone(), rend.toneMappingExposure];
            const pc = mitte.clone().project(cam);
            const rpx = (((R / mitte.distanceTo(cp)) * (H / 2)) / Math.tan((50 * Math.PI) / 360)) * 1.15;
            const [cx, cy] = [((pc.x + 1) / 2) * W, ((1 - pc.y) / 2) * H];
            const [sp, ray, v, hit] = [new T.Sphere(mitte, R), new T.Ray(), new T.Vector3(), new T.Vector3()];
            const Ys = [];
            let clip = 0;
            for (let y = Math.max(0, Math.floor(cy - rpx)); y < Math.min(H, Math.ceil(cy + rpx)); y++)
                for (let px = Math.max(0, Math.floor(cx - rpx)); px < Math.min(W, Math.ceil(cx + rpx)); px++) {
                    v.set(((px + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, 0.5).applyMatrix4(projI).applyMatrix4(camM);
                    ray.set(cp, v.sub(cp).normalize());
                    if (!ray.intersectSphere(sp, hit)) continue;
                    const N = hit.clone().sub(mitte).normalize();
                    if (N.dot(ray.direction) > -0.26 || Math.abs(N.y) > 0.25 || N.dot(a) * sg < 0.85) continue;
                    const i = (y * W + px) * 4;
                    const y8 = [x.u8[i], x.u8[i + 1], x.u8[i + 2]];
                    if (Math.max(...y8) >= 254) clip++;
                    const lin = invNeutral(y8.map(srgb)).map((c) => c / belicht);
                    Ys.push(0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]);
                }
            Ys.sort((p, q) => p - q);
            seiten[name] = {
                Y: Ys.length ? +Ys[Ys.length >> 1].toFixed(5) : null,
                n: Ys.length,
                clip,
                belicht: +belicht.toFixed(4),
                auge: cp.toArray().map((q) => +q.toFixed(2)),
            };
        }
    } finally {
        dl.intensity = I0;
        sc.remove(kugel);
        kugel.material.dispose();
        geo.dispose();
        cam.fov = fov0;
        cam.updateProjectionMatrix();
        cam.position.copy(pos0);
        cam.quaternion.copy(quat0);
        cam.updateMatrixWorld(true);
        st.playerMesh.visible = true;
    }
    const [z, w] = [seiten.zur, seiten.weg];
    return {
        ende: "ok",
        stand: { uhr: st.timeOfDay, wetter: st.weather },
        sonneGrad: +((Math.asin(S.y) * 180) / Math.PI).toFixed(1),
        ort: mitte.toArray().map((q) => +q.toFixed(1)),
        seiten,
        himmelZurSonne: z.Y && w.Y ? +(z.Y / w.Y).toFixed(3) : null,
    };
})(r, T);