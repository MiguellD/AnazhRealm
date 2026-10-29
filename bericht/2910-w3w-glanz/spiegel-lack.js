// 2910 w3w-glanz material.K4 Staffel 1 — DIE SPIEGEL-TREUE AN LACK UND SCHEIBE AUS EGO (Seiten-Code für `werkbank eval`, r = Welt,
// T = THREE). Ein GT (`fahrzeug_gt`, das Fahrzeug-Studio) steht rechts neben dem Spieler, die Länge längs seines Blicks: seine
// Flanke 1,3 m neben der Blick-Achse, das Heck 1,5 m voraus — der Ego-Blick (die Kamera des Spiels, `_loopCamera`, Gier des
// Spiels, Neigung −0,15) trifft die Tür streifend (55–78°), ihr Spiegel zeigt den Boden und die Welt links voraus, die das Bild
// selbst trägt. Schüsse aus dem Ausgabe-Pfad (1920×1080): G die Welt, O_lack ohne den Lack (jeder Stoff mit Klarlack ≥ 0,5 und
// Metall ≥ 0,5, nie durchsichtig), O_glas ohne die Scheiben (durchsichtig, Klarlack) — Lack und Scheibe werfen in jedem Schuss
// keinen Schatten. Die Maske je Klasse: das Pixel, das ohne sie um mehr als 18 (je Kanal) anders ist; in ihr die Welt-Punkte
// aus der Tiefe des Schusses G (`__spiegelDaten`), die Ebene per Haupt-Achsen (die kleinste der Kovarianz), dann nur die Pixel
// ≤ 3 cm an ihr (die Tür, die Seiten-Scheibe — nie die Rundung, der Schweller, die Felge). Das Maß ist das der Wasser-Station
// (gelaende.K3): `__klassenMasse(...).spiegelTreue` mit der Normale der Ebene (`normale`, abnahme-urteil spiegelPartner).
// Die Pose prüft sich: steht der Wagen quer (die Normale längs des Blicks), dreht die Probe ihn einmal um 90°.
const st = r.state, rend = st.renderer, cam = st.camera, sc = st.scene;
const W = 1920, H = 1080;
const raf = () => new Promise((f) => requestAnimationFrame(f));
rend.setAnimationLoop(null);
window.__buehne({});
if (st.world) st.world.timeOfDay = 0.5;
r.setTimeOfDay(0.5, "human");
if (st.cameraMode !== "first") r.setCameraMode("first");
const ego = () => {
    st.pitch = -0.15;
    for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
    cam.updateMatrixWorld(true);
    const d = new T.Vector3();
    cam.getWorldDirection(d);
    return { auge: cam.position.clone(), d };
};
let { auge, d } = ego();
const fwd = d.clone().setY(0).normalize(), rechts = new T.Vector3(-fwd.z, 0, fwd.x);
const mitte = auge.clone().addScaledVector(fwd, 3.8).addScaledVector(rechts, 2.25);
const versuche = [];
let e = null, ergebnis = null;
const glanzStoffe = (pruef) => {
    const o = [];
    sc.traverse((m) => { if (m.isMesh && m.visible && m.material && pruef(m.material)) o.push(m); });
    return o;
};
const istLack = (m) => m.clearcoat >= 0.5 && m.metalness >= 0.5 && m.transparent !== true;
const istGlas = (m) => m.transparent === true && m.clearcoat >= 0.5;
const kovNormale = (pts) => {
    const c = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length);
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const p of pts) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) A[i][j] += (p[i] - c[i]) * (p[j] - c[j]);
    // Jacobi-Drehungen: die Eigenvektoren der symmetrischen 3×3
    const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let s = 0; s < 40; s++)
        for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
            if (Math.abs(A[p][q]) < 1e-12) continue;
            const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]), cs = Math.cos(th), sn = Math.sin(th);
            for (let k = 0; k < 3; k++) {
                const a = A[k][p], b = A[k][q];
                (A[k][p] = cs * a - sn * b), (A[k][q] = sn * a + cs * b);
            }
            for (let k = 0; k < 3; k++) {
                const a = A[p][k], b = A[q][k];
                (A[p][k] = cs * a - sn * b), (A[q][k] = sn * a + cs * b);
            }
            for (let k = 0; k < 3; k++) {
                const a = V[k][p], b = V[k][q];
                (V[k][p] = cs * a - sn * b), (V[k][q] = sn * a + cs * b);
            }
        }
    const i = [0, 1, 2].reduce((m, k) => (A[k][k] < A[m][m] ? k : m), 0);
    return { c, n: [V[0][i], V[1][i], V[2][i]] };
};
try {
    for (const dreh of [0, Math.PI / 2]) {
        const rot = Math.atan2(-fwd.z, fwd.x) + dreh;
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        try {
            e = r.spawnArchitecture("fahrzeug_gt", { x: mitte.x, y: r.getTerrainHeightAt(mitte.x, mitte.z) + 0.5, z: mitte.z }, { silent: true, precise: true, rotationY: rot });
            if (!e) return { ende: "der Wagen setzt nicht", versuche };
            await window.__gebautNach(e, { bau: () => {}, takt: raf });
            for (let i = 0; i < 30; i++) await raf();
        } finally {
            rend.setAnimationLoop(null);
        }
        ({ auge, d } = ego());
        const lack = glanzStoffe(istLack), glas = glanzStoffe(istGlas);
        const alle = [...lack, ...glas], wurf = alle.map((m) => m.castShadow);
        alle.forEach((m) => (m.castShadow = false));
        window.__bundlesNeu();
        const schuss = async (aus) => {
            aus.forEach((m) => (m.visible = false));
            window.__bundlesNeu();
            try {
                r._schattenAlleNeu();
                return (await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })).u8;
            } finally {
                aus.forEach((m) => (m.visible = true));
                window.__bundlesNeu();
            }
        };
        let G, sp, Ol, Og;
        try {
            G = await schuss([]);
            sp = await window.__spiegelDaten();
            Ol = await schuss(lack);
            Og = await schuss(glas);
        } finally {
            alle.forEach((m, i) => (m.castShadow = wurf[i]));
            window.__bundlesNeu();
        }
        const { tiefe, tw, th, ivp: I } = sp;
        const welt = (p) => {
            const x = p % W, y = (p - x) / W;
            const v = [((x + 0.5) / W) * 2 - 1, 1 - ((y + 0.5) / H) * 2, tiefe[((((y + 0.5) * th) / H) | 0) * tw + ((((x + 0.5) * tw) / W) | 0)]];
            const w = I[3] * v[0] + I[7] * v[1] + I[11] * v[2] + I[15];
            return [0, 1, 2].map((k) => (I[k] * v[0] + I[k + 4] * v[1] + I[k + 8] * v[2] + I[k + 12]) / w);
        };
        const klasse = (O, name, n0) => {
            const roh = [];
            for (let p = 0; p < W * H; p++) {
                const i = p * 4;
                if (Math.max(Math.abs(G[i] - O[i]), Math.abs(G[i + 1] - O[i + 1]), Math.abs(G[i + 2] - O[i + 2])) > 18) roh.push(p);
            }
            if (roh.length < 2000) return { name, pixel: roh.length, fehler: "zu wenig Pixel" };
            const P = roh.map(welt);
            let { c, n } = kovNormale(P);
            let innen = roh.map((_p, k) => k).filter((k) => Math.abs((P[k][0] - c[0]) * n[0] + (P[k][1] - c[1]) * n[1] + (P[k][2] - c[2]) * n[2]) <= 0.05);
            ({ c, n } = kovNormale(innen.map((k) => P[k])));
            innen = roh.map((_p, k) => k).filter((k) => Math.abs((P[k][0] - c[0]) * n[0] + (P[k][1] - c[1]) * n[1] + (P[k][2] - c[2]) * n[2]) <= 0.03);
            const zumAuge = [auge.x - c[0], auge.y - c[1], auge.z - c[2]];
            if (n[0] * zumAuge[0] + n[1] * zumAuge[1] + n[2] * zumAuge[2] < 0) n = n.map((x) => -x);
            const m = new Uint8Array(W * H);
            for (const k of innen) m[roh[k]] = 1;
            const ms = window.__klassenMasse(G, m, W, H, null, null, Object.assign({}, sp, { normale: n }));
            const blick = Math.abs(n[0] * fwd.x + n[2] * fwd.z);
            const zl = Math.hypot(...zumAuge);
            return {
                name, pixel: roh.length, ebene: innen.length, normale: n.map((x) => +x.toFixed(3)),
                einfallGrad: +((Math.acos(Math.min(1, Math.abs((n[0] * zumAuge[0] + n[1] * zumAuge[1] + n[2] * zumAuge[2]) / zl))) * 180) / Math.PI).toFixed(1),
                quer: blick > 0.7, spiegelTreue: ms.spiegelTreue, bloecke: ms.sp ? ms.sp[0] : null, luma: ms.luma,
            };
        };
        const vlack = klasse(Ol, "lack");
        const vglas = klasse(Og, "glas");
        versuche.push({ dreh: +dreh.toFixed(3), lack: vlack, glas: vglas, stoffe: { lack: lack.length, glas: glas.length } });
        r.removeArchitecture(e);
        e = null;
        ergebnis = { lack: vlack, glas: vglas };
        if (!(vlack.quer && vglas.quer)) break;
    }
} finally {
    if (e) r.removeArchitecture(e);
}
return {
    ende: "ok",
    stand: { version: r.constructor.VERSION, uhr: st.timeOfDay, wetter: st.weather, saison: st.season, sicht: st.cameraMode },
    auge: auge.toArray().map((x) => +x.toFixed(2)), blick: d.toArray().map((x) => +x.toFixed(3)), wagen: mitte.toArray().map((x) => +x.toFixed(2)),
    ergebnis, versuche,
};
