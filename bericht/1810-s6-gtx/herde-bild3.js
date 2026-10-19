// 1810 S6 Blick, Teil 2, Runde 3 (Seiten-Code für `werkbank eval`, r = Welt). Runde 1/2 trugen zwei Fehler des Werkzeugs: die
// Takte liefen von Hand (setTimeout, 26–75 ms je Takt statt des echten Loops), und `__ausgabeAufnahme` wartete vor dem Schuss in
// Spiel-Takten, bis die Welt stand (`__weltStehtWarten`) — die Herde lief in diesen Takten aus der Flucht. Jetzt:
//   der ECHTE Loop (`setAnimationLoop(t => _gameLoopTick(t))`, wie `werkbank lauf`); der Haken an tickAffordances hält den Spieler
//   40 m vor der Herde, bis die Welt steht (`_weltSteht`, höchstens 25 s), und führt ihn dann mit 3 m/s Spielzeit (Σ dt) aus 25 m in
//   die Herde; je Takt die Spur (t, je Glied x, z, Gier, Flucht). Flieht die Hälfte 6 Takte lang, hält der Loop an: DREI Schüsse
//   (`__ausgabeAufnahme(…, { satz: "messung" })` — ohne Welt-Warten, die Szene steht still), je 8 echte Takte auseinander; danach
//   2 s Spur. Die Flucht-Zahl jedes Bilds wird VOR dem Schuss gezählt.
const st = r.state;
const T = window.THREE;
const rend = st.renderer;
const w = window.__herdeWahl;
if (!w) return { fehler: "keine Wahl (herde-wahl.js)" };
const VH = r.constructor._verhaltenGesetz().herde;
const byId = new Map((st.creatures || []).filter((c) => c && w.ids.includes(c.uuid)).map((c) => [c.uuid, c]));
const glieder = () => w.ids.map((id) => byId.get(id)).filter((c) => c && st.creatures.includes(c));
const mitte = (g) => {
    let x = 0,
        z = 0;
    for (const c of g) {
        x += c.position.x;
        z += c.position.z;
    }
    return { x: x / g.length, z: z / g.length };
};
const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const H = { phase: "ruhe", s: 0, start: null, dir: null, spur: [], fliehtSeit: 0, ersteFlucht: null, takte: 0 };
const P = Object.getPrototypeOf(r);
r.tickAffordances = function (dt) {
    const p = this.state.playerMesh.position;
    if (H.phase === "ruhe") {
        const h = window.__herdeHalt;
        p.x = h.x;
        p.z = h.z;
    } else if (H.phase === "lauf") {
        if (Number.isFinite(dt) && dt > 0) H.s += 3 * Math.min(dt, 0.1);
        p.x = H.start.x + H.dir.x * H.s;
        p.z = H.start.z + H.dir.z * H.s;
        const a = w.ids.map((id) => {
            const c = byId.get(id);
            return c && st.creatures.includes(c) ? [c.position.x, c.position.z, c.rotation.y, c.userData._motionZustand === "flucht" ? 1 : 0, 2 * this._kreaturRaum(c)] : null;
        });
        H.spur.push({ t: performance.now(), a });
        H.takte++;
        const da = a.filter(Boolean);
        const fl = da.filter((x) => x[3]).length;
        if (fl && H.ersteFlucht == null) H.ersteFlucht = H.spur.length - 1;
        H.fliehtSeit = fl * 2 >= da.length ? H.fliehtSeit + 1 : 0;
    }
    return P.tickAffordances.call(this, dt);
};
const loopAn = () => rend.setAnimationLoop((t) => r._gameLoopTick(t));
const loopAus = () => rend.setAnimationLoop(null);
const bilder = [];
const schuss = async (name) => {
    const g = glieder();
    const m = mitte(g);
    const flucht = g.filter((c) => c.userData._motionZustand === "flucht").length;
    const p = st.playerMesh.position;
    let bx = m.x - p.x,
        bz = m.z - p.z;
    const bd = Math.hypot(bx, bz) || 1;
    bx /= bd;
    bz /= bd;
    const cx = p.x - bx * 6,
        cz = p.z - bz * 6;
    const gy = r._voxelSurfaceY(cx, cz);
    const my = r._voxelSurfaceY(m.x, m.z);
    st.camera.position.set(cx, (Number.isFinite(gy) ? gy : p.y) + 5, cz);
    st.camera.lookAt(m.x, (Number.isFinite(my) ? my : p.y) + 0.8, m.z);
    st.camera.updateMatrixWorld(true);
    r._schattenAlleNeu();
    if (st.traaNode) st.traaNode._jitterIndex = 0;
    let auf = null,
        fehler = null;
    try {
        auf = await window.__ausgabeAufnahme(1920, 1080, 1, { satz: "messung" });
    } catch (e) {
        fehler = String(e && e.message).slice(0, 240);
    }
    const imBild = g.map((c) => {
        const v = new T.Vector3(c.position.x, c.position.y + 0.8, c.position.z).project(st.camera);
        return [Math.round(((v.x + 1) / 2) * 1920), Math.round(((1 - v.y) / 2) * 1080), +st.camera.position.distanceTo(c.position).toFixed(1)];
    });
    let jpg = null;
    if (auf) {
        const cv = document.createElement("canvas");
        cv.width = 1920;
        cv.height = 1080;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(1920, 1080);
        img.data.set(auf.u8.subarray(0, 1920 * 1080 * 4));
        ctx.putImageData(img, 0, 0);
        jpg = cv.toDataURL("image/jpeg", 0.9);
    }
    bilder.push({ name, takt: H.spur.length, flucht, n: g.length, spielerZurMitteM: +bd.toFixed(1), kamera: st.camera.position.toArray().map((v) => +v.toFixed(1)), imBild, fehler, jpg });
};
// 1. die Welt am Halt-Ort steht (echter Loop)
loopAn();
const tw0 = performance.now();
while (performance.now() - tw0 < 25000 && !(typeof r._weltSteht === "function" && r._weltSteht())) await warte(100);
const weltStandS = +((performance.now() - tw0) / 1000).toFixed(1);
const weltSteht = typeof r._weltSteht === "function" ? r._weltSteht() : null;
// 2. der Lauf in die Herde
let g = glieder();
let m = mitte(g);
const pm = st.playerMesh.position;
let dx = m.x - pm.x,
    dz = m.z - pm.z;
const d0 = Math.hypot(dx, dz) || 1;
H.dir = { x: dx / d0, z: dz / d0 };
H.start = { x: m.x - H.dir.x * 25, z: m.z - H.dir.z * 25 };
H.phase = "lauf";
const tl0 = performance.now();
while (performance.now() - tl0 < 20000 && H.fliehtSeit < 6) await warte(10);
const ausgeloest = H.fliehtSeit >= 6;
loopAus();
if (ausgeloest) {
    for (let b = 1; b <= 3; b++) {
        await schuss("bild-" + b);
        if (b < 3) {
            const k0 = H.takte;
            loopAn();
            while (H.takte - k0 < 8) await warte(2);
            loopAus();
        }
    }
    const k0 = H.takte;
    loopAn();
    const t2 = performance.now();
    while (performance.now() - t2 < 2000) await warte(20);
    loopAus();
}
H.phase = "ende";
delete r.tickAffordances;
// 3. die Zahlen: über alle Lauf-Takte und nur über Flucht-Takte (das Glied flieht in beiden Takten)
const spur = H.spur;
const n = w.ids.length;
const mit = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const r3 = (v) => (v == null || !Number.isFinite(v) ? null : +v.toFixed(3));
const cvk = (a) => {
    const mm = mit(a);
    return mm ? Math.sqrt(mit(a.map((x) => (x - mm) * (x - mm)))) / mm : null;
};
const koh = [],
    kohF = [],
    ausr = [];
const fl = w.ids.map(() => ({ s: 0, kipp: 0, letzte: 0, v: [], zk: 0 }));
const dts = [];
for (let i = 1; i < spur.length; i++) {
    const A0 = spur[i - 1].a,
        A1 = spur[i].a,
        dt = (spur[i].t - spur[i - 1].t) / 1000;
    if (!(dt > 0) || dt > 0.25) continue; // die Schuss-Pausen zählen nie als Takt
    dts.push(dt * 1000);
    const da = A1.filter(Boolean);
    if (!da.length) continue;
    const mx = da.reduce((s, x) => s + x[0], 0) / da.length,
        mz = da.reduce((s, x) => s + x[1], 0) / da.length;
    const k = da.filter((x) => Math.hypot(x[0] - mx, x[1] - mz) / x[4] <= VH.fensterRaum).length / da.length;
    if (i >= (H.ersteFlucht || 0)) koh.push(k);
    if (da.some((x) => x[3])) kohF.push(k);
    let rx = 0,
        rz = 0,
        nl = 0;
    for (let j = 0; j < n; j++) {
        if (!A0[j] || !A1[j]) continue;
        if (A1[j][3] !== A0[j][3]) fl[j].zk++;
        const vx = (A1[j][0] - A0[j][0]) / dt,
            vz = (A1[j][1] - A0[j][1]) / dt;
        const v = Math.hypot(vx, vz);
        if (v > 0.5) {
            rx += vx / v;
            rz += vz / v;
            nl++;
        }
        if (!A0[j][3] || !A1[j][3]) {
            fl[j].letzte = 0;
            continue;
        }
        fl[j].s += dt;
        fl[j].v.push(v);
        let dy = A1[j][2] - A0[j][2];
        while (dy > Math.PI) dy -= 2 * Math.PI;
        while (dy < -Math.PI) dy += 2 * Math.PI;
        if (Math.abs(dy) > 0.01) {
            if (fl[j].letzte && Math.sign(dy) !== Math.sign(fl[j].letzte)) fl[j].kipp++;
            fl[j].letzte = dy;
        }
    }
    if (nl >= 2 && da.some((x) => x[3])) ausr.push(Math.hypot(rx, rz) / nl);
}
dts.sort((a, b) => a - b);
const laufS = spur.length > 1 ? (spur[spur.length - 1].t - spur[0].t) / 1000 : 0;
const t0 = spur.length ? spur[0].t : 0;
return {
    gruppe: w.mitVerband ? "verband" : "wurf",
    n,
    weltStandS,
    weltSteht,
    ausgeloest,
    takte: spur.length,
    taktMs: { p50: r3(dts[dts.length >> 1]), p95: r3(dts[Math.floor(dts.length * 0.95)]) },
    ersteFlucht: H.ersteFlucht,
    kohaesion: { abFlucht: r3(mit(koh)), abFluchtMin: r3(koh.length ? Math.min(...koh) : null), inFlucht: r3(mit(kohF)), inFluchtMin: r3(kohF.length ? Math.min(...kohF) : null), fensterRaum: VH.fensterRaum },
    ausrichtungInFlucht: r3(mit(ausr)),
    flucht: {
        sekunden: fl.map((x) => r3(x.s)),
        tempoMs: fl.map((x) => r3(mit(x.v))),
        tempoVk: fl.map((x) => r3(cvk(x.v))),
        gierKippenJeFluchtS: fl.map((x) => r3(x.s > 0.3 ? x.kipp / x.s : null)),
        zustandKippenJeS: fl.map((x) => r3(laufS ? x.zk / laufS : null)),
    },
    bilder,
    spur: spur.map((s) => [Math.round(s.t - t0), ...s.a.map((x) => (x ? [+x[0].toFixed(2), +x[1].toFixed(2), +x[2].toFixed(3), x[3]] : null))]),
};
