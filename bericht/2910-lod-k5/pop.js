// 2910 lod.K2 Staffel 1 — DER POP UNTER BEWEGUNG (Seiten-Code für `werkbank eval`, r = Welt, T = THREE). Gehen im Ego-Auge an der
// Mess-Wiese, 4 m/s ins Offene (der Blick des Messorts), EINE Sekunde = 4 m in 8 Schritten zu 0,5 m. Je Schritt dieselbe Pose zweimal
// aus dem Ausgabe-Pfad (1920 × 1080, `__ausgabeAufnahme`): A mit dem Stand der Welt vom vorigen Ort, B nachdem der echte Takt
// (`_gameLoopTick`, 12 Takte: Stufen-Wahl, Band, Streu, Wachstum am Rand des Laubs, der Regler des Spielers) am neuen Ort lief. Der
// Kamera-Fluss zwischen A und B ist null — jeder Pixel mit ΔLuma > 18 (Rec. 709) ist ein Pop, den keine Bewegung erklärt. Die
// Blende dithert in beiden Schüssen dieselbe Folge (uDitherT vor jedem Schuss auf 0, 6 Bilder je Schuss, das letzte zählt). Summe
// über die Sekunde ÷ Pixel des Schirms = Pop-Pixel je Sekunde (Soll ≤ 0,05 %); dazu je Schritt die Stufen-Wechsel der Bauten.
const st = r.state, rend = st.renderer, cam = st.camera, A = r.constructor;
const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
const W = 1920, H = 1080, SCHRITTE = 8, WEG = 4, LUMA = 18;
rend.setAnimationLoop(null);
window.__buehne({});
const pm = st.playerMesh.position;
const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
const start = pm.clone();
const boden = (x, z) => r._voxelSurfaceY(x, z);
const pose = (p) => {
    cam.fov = A.KAM_FOV_GRAD;
    cam.updateProjectionMatrix();
    cam.position.set(p.x, boden(p.x, p.z) + 1.7, p.z);
    cam.lookAt(p.x + fwd.x * 50, boden(p.x, p.z) + 1.7, p.z + fwd.z * 50);
    cam.updateMatrixWorld(true);
};
const schuss = async () => {
    const lu = st.lodUniforms;
    if (lu && lu.uDitherT) lu.uDitherT.value = 0;
    let x = null;
    for (let i = 0; i < 6; i++) x = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" });
    return x.u8;
};
const luma = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
const wechsel = () => (st.architectures || []).reduce((s, e) => s + (e && e._lodLevel != null ? e._lodLevel * 7 + (e._lodBandLevel | 0) : 0), 0);
const aus = { schirm: [W, H], weg: WEG, schritte: [], perfTargetMs: st.perfTargetMs, laub: [], bau: [] };
let summe = 0;
try {
    for (let i = 0; i < SCHRITTE; i++) {
        const p0 = start.clone().addScaledVector(fwd, (WEG * i) / SCHRITTE);
        const p1 = start.clone().addScaledVector(fwd, (WEG * (i + 1)) / SCHRITTE);
        pm.set(p0.x, boden(p0.x, p0.z) + 0.05, p0.z);
        for (let t = 0; t < 12; t++) (r._gameLoopTick(performance.now()), await warte(5));
        const w0 = wechsel();
        pose(p1);
        const a = await schuss();
        pm.set(p1.x, boden(p1.x, p1.z) + 0.05, p1.z);
        for (let t = 0; t < 12; t++) (r._gameLoopTick(performance.now()), await warte(5));
        pose(p1);
        const b = await schuss();
        let n = 0;
        for (let k = 0; k < W * H * 4; k += 4) if (Math.abs(luma(a, k) - luma(b, k)) > LUMA) n++;
        summe += n;
        aus.schritte.push({ pop: n, stufen: wechsel() !== w0 });
        aus.laub.push(+st.foliageRadius.toFixed(1));
        aus.bau.push(+st.architectureCullingRadius.toFixed(1));
    }
} finally {
    pm.copy(start);
}
aus.popPixel = summe;
aus.anteilJeSekunde = +((100 * summe) / (W * H) / ((SCHRITTE * (WEG / SCHRITTE)) / 4)).toFixed(4); // % der Pixel je Sekunde bei 4 m/s
return aus;
