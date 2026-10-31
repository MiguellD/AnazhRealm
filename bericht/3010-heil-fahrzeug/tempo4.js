// w4-heil-fahrzeug (30.10.): tempo3.js mit dem WEG DER PROBE, dem Gas bis zum Plateau in Sim-Zeit und dem Stoß beim Namen. Bis
// hierher prüfte die Bahn nur die Hüllen der Bauten: die Natur, die das Feld erst wirft, wenn der Spieler naht (Bäume, Fels), und
// ein Baum, dessen Gestalt noch wartet (K20, ohne Hülle), standen nicht in ihr — der Wagen fuhr in sie, und das Tempo am Stoß hieß
// „top" (Null-Renderer an 98ef98bb und 715754fc gleich: Stoß nach 35,5 m bei 13,87 m/s an Felsbogen und Kiefer, Radeon-Sitzung
// 715754fc 13,26 m/s). Jetzt legt die Probe einen Weg über die Bahn (`_stlWegeBuild`, wie gate:fahr-leben `strasse`): die Welt räumt
// die Natur auf ihm (`_wegeRaeumen`) und wirft keine mehr darauf; das Gas endet am Plateau der Sim-Zeit (Δv < 0,05 m/s je
// Sim-Sekunde, nie an der Zahl der Bilder), ein Stoß endet es beim Namen (ende ≠ "ok").
// Messschuld 21.10. (OMEN, GTX) M27 Fahrzeug K3 in der Welt: tempo2.js der Radeon (Bahn, Ruhe, Vollgas bis vmax, zwei Schüsse)
// + Rückkehr (der Tempo-Spion aus scripts/lib/fahr-proben.cjs um VC.chaseKamera: bei vmax zieht die Maus 10 Bilder
// state.yaw +0,12, dann frei — orbit/rueck in der Zeit des Rigs) + Drift (Gas + D: Fahrtvektor gegen Bug = Schlupf, der
// Kamera-Azimut (Kamera→Wagen) gegen den Fahrtvektor = drift, Soll ≤ 15°) + Schuss im Drift.
// DIE 1 (proben-schnell 30.10., `window.__tempoNur === "vmax"`, fahrzeug.K3#1): Ruhe und Plateau sind ihr Kriterium — Orbit, Drift
// und die drei Schüsse misst die 2 (FAHR_SITZUNG, derselbe Ritt bis zum Ende); in der 1 liefen sie doppelt. DAS WARTEN: am Ort und
// nach dem Weg das EINE Einschwingen (`__weltStehtNach`: es hält den Regler, solange die Welt schwingt, sein Deckel wirft beim Namen)
// statt 1,5 s Uhr und einer eigenen Schleife mit stiller 60-s-Frist, nach der der Ritt in einer Welt fuhr, die nicht stand; der GT im
// Takt (`__gebautNach`) statt alle 200 ms. Am Ort stand die Welt der Sitzung schon, das Einschwingen braucht dort dennoch ~560 Takte
// (`ortTakte`, Radeon 9,6–15,6 s) — auch ohne Sprung an den Ort; die Ursache steht offen, die Zahl im Ergebnis
const nurVmax = window.__tempoNur === "vmax";
delete window.__tempoNur;
const st = r.state;
const rend = st.renderer;
const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const hh = (x, z) => r.getTerrainHeightAt(x, z);
const W0 = window.__messWiese || [-278, -1038];
const bahn = (sx, sz, a) => {
    const [ux, uz] = [Math.sin(a), Math.cos(a)];
    let hub = 0;
    for (let d = 5; d <= 220; d += 5) {
        const [x, z] = [sx + ux * d, sz + uz * d];
        if (!r._landAt(x, z) || (typeof r._nassAt === "function" && r._nassAt(x, z))) return null;
        hub = Math.max(hub, Math.abs(hh(x, z) - hh(sx, sz)));
        if (hub > 1.5) return null;
    }
    for (const e of r.state.architectures || []) {
        if (!e || !e.position || !e.blockerAABBs) continue;
        if (Math.hypot(e.position.x - sx, e.position.z - sz) > 260) continue;
        for (const q of e.blockerAABBs) {
            const bx = (q.minX + q.maxX) / 2 - sx, bz = (q.minZ + q.maxZ) / 2 - sz;
            const l = bx * ux + bz * uz, halb = Math.max(q.maxX - q.minX, q.maxZ - q.minZ) / 2;
            if (l > -5 && l < 225 && Math.abs(bx * uz - bz * ux) < 3 + halb) return null;
        }
    }
    return { a, hub };
};
st.playerMesh.position.set(W0[0], hh(W0[0], W0[1]) + 2, W0[1]);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
const to0 = performance.now();
const ortTakte = await window.__weltStehtNach();
const ortStandS = +((performance.now() - to0) / 1000).toFixed(1);
let ort = null, best = null;
for (let ring = 0; ring <= 12 && !best; ring++)
    for (let k = 0; k < Math.max(1, ring * 6) && !best; k++) {
        const w = (k / Math.max(1, ring * 6)) * Math.PI * 2;
        const [sx, sz] = [W0[0] + Math.cos(w) * ring * 40, W0[1] + Math.sin(w) * ring * 40];
        if (!r._landAt(sx, sz)) continue;
        for (let j = 0; j < 32 && !best; j++) best = bahn(sx, sz, (j / 32) * Math.PI * 2);
        if (best) ort = { x: sx, z: sz };
    }
if (!best) return { fehler: "keine freie Bahn" };
const loopAn = () => rend.setAnimationLoop((t) => r._gameLoopTick(t));
const loopAus = () => rend.setAnimationLoop(null);
// DER WEG DER PROBE: 40 m breit über die ganze Bahn (Gas, Orbit und Drift fahren auf ihm) — die Natur weicht ihm
r._stlWegeBuild({ roads: [{ pts: [{ x: 0, z: 0 }, { x: 225 * Math.sin(best.a), z: 225 * Math.cos(best.a) }], w: 40 }] }, { x: ort.x, z: ort.z }, "probe:tempo4");
st.playerMesh.position.set(ort.x, hh(ort.x, ort.z) + 2, ort.z);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
const tw0 = performance.now();
await window.__weltStehtNach();
const weltStandS = +((performance.now() - tw0) / 1000).toFixed(1);
const bahnNachStand = !!bahn(ort.x, ort.z, best.a);
const e = r.spawnArchitecture("fahrzeug_gt", { x: ort.x, y: hh(ort.x, ort.z) + 0.5, z: ort.z }, { silent: true, precise: true, rotationY: best.a - Math.PI / 2 });
if (!e) return { fehler: "GT nicht gesetzt" };
await window.__gebautNach(e, { fertig: () => !!(e.instanced || e.mesh) });
r.setCameraMode("third");
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return (loopAus(), { fehler: "Aufsitzen misslang", mr });
// DER TEMPO-SPION (Wortlaut scripts/lib/fahr-proben.cjs tempoSpion) um die EINE Chase-Cam des Ritts
const VC = r.constructor._fahrSchrittGesetz().vc;
const spion = (function tempoSpion(VC, cam, quelle) {
    const [ck, sch, ruhe] = [VC.chaseKamera, {}, cam.fov];
    const m = Object.defineProperty({ n: 0, zeigt: 0, quelle: true, orbit: 0, rueck: null, fov: {} }, "ende", {
        value: () => (VC.chaseKamera = ck),
    });
    let [letzt, g0, los] = [0, 0, null];
    VC.chaseKamera = (c, g, s, dt, K, z, vmax) => {
        m.zeigt = Math.max(m.zeigt, +Math.abs(cam.fov - ruhe - letzt).toFixed(3));
        m.quelle = m.quelle && quelle(z, vmax);
        const v = ck(c, g, s, dt, K, z, vmax);
        letzt = v.fovPlus || 0;
        if (z && z.speed >= 10 && !(10 in m.fov)) m.fov[10] = +letzt.toFixed(2);
        g0 = Number.isFinite(g) ? g : g0;
        ck(sch, g0, s, dt, K, z, vmax);
        const ab = (Math.abs(Math.atan2(Math.sin(c.az - sch.az), Math.cos(c.az - sch.az))) * 180) / Math.PI;
        m.orbit = Math.max(m.orbit, Math.round(ab));
        if (!Number.isFinite(g)) [los, m.rueck] = [0, null];
        else if (los !== null && m.rueck === null) {
            los += dt;
            if (ab <= Math.max(1, 0.03 * m.orbit)) m.rueck = +los.toFixed(2);
        }
        m.n++;
        return v;
    };
    return m;
})(VC, st.camera, (z5, vm) => z5 === e._fahr && vm === e._fahrSatz.vmax);
const H = { phase: "ruhe", n: 0, halt: null, spur: [], tVor: null, sim: 0, simSpur: [], top: 0, stoss: null };
const DECKEL = r.constructor.TAKT_DECKEL_S;
const grad = (a) => +((Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 180) / Math.PI).toFixed(1);
const roh = r._gameLoopTick;
r._gameLoopTick = function (t) {
    st.keys.w = H.phase !== "ruhe";
    st.keys.d = H.phase === "drift";
    st.keys.s = st.keys.a = false;
    if (H.phase === "orbit" && H.n < 10) [st.yaw, st.pitch] = [st.yaw + 0.12, st.pitch - 0.02];
    const erg = roh.call(this, t);
    H.n++;
    const dtSim = H.tVor === null ? 0 : Math.min(Math.max(0, (t - H.tVor) / 1000), DECKEL);
    H.tVor = t;
    const vx = st.playerVel ? st.playerVel.x() : 0, vz = st.playerVel ? st.playerVel.z() : 0;
    const v = Math.hypot(vx, vz);
    const c = st.camera.position;
    const arm = Math.hypot(c.x - e.position.x, c.y - e.position.y, c.z - e.position.z);
    const z = e._fahr || {};
    // Winkel in der Ebene: Fahrtvektor, Blick Kamera→Wagen, Schlupf aus dem Kern (atan2(vlat, |vlong|))
    const aV = Math.atan2(vx, vz), aK = Math.atan2(e.position.x - c.x, e.position.z - c.z);
    const schlupf = Number.isFinite(z.vlat) ? grad(Math.atan2(z.vlat, Math.abs(z.vlong))) : null;
    H.spur.push([H.phase, H.n, +v.toFixed(2), +st.camera.fov.toFixed(2), +arm.toFixed(2), schlupf, v > 2 ? grad(aK - aV) : null]);
    if (H.phase === "ruhe" && H.n === 60) H.halt = "ruhe";
    else if (H.phase === "gas") {
        // DAS PLATEAU IN SIM-ZEIT: Δv über die letzte Sim-Sekunde < 0,05 m/s nach ≥ 3 s Gas; ein Einbruch unter 70 % des
        // Höchsten ist ein Stoß (die Hüllen um den Wagen beim Namen); der Deckel 20 Sim-Sekunden
        H.sim += dtSim;
        H.simSpur.push([H.sim, v]);
        while (H.simSpur.length > 2 && H.simSpur[1][0] <= H.sim - 1) H.simSpur.shift();
        H.top = Math.max(H.top, v);
        if (H.top > 3 && v < 0.7 * H.top && !H.stoss) {
            const nah = r._blockerUmPlatz(e.position.x, e.position.z, 6, []).filter((b) => b !== e && b.position);
            nah.sort((a, b) => Math.hypot(a.position.x - e.position.x, a.position.z - e.position.z) - Math.hypot(b.position.x - e.position.x, b.position.z - e.position.z));
            H.stoss = { vor: +H.top.toFixed(2), v: +v.toFixed(2), simS: +H.sim.toFixed(2), wegM: +Math.hypot(e.position.x - ort.x, e.position.z - ort.z).toFixed(1), an: nah.slice(0, 3).map((b) => b.type + " " + Math.hypot(b.position.x - e.position.x, b.position.z - e.position.z).toFixed(1) + " m") };
            H.halt = "stoss";
        } else if (H.sim >= 3 && H.simSpur[0][0] <= H.sim - 1 && v - H.simSpur[0][1] < 0.05) H.halt = "vmax";
        else if (H.sim >= 20 || H.n >= 3000) H.halt = "deckel";
    } else if (H.phase === "orbit" && (H.n >= 150 || (H.n > 10 && spion.rueck !== null && H.n > 100))) H.halt = "orbit";
    else if (H.phase === "drift" && H.n >= 120) H.halt = "drift";
    if (H.halt) rend.setAnimationLoop(null);
    return erg;
};
const bilder = [];
const schuss = async (name) => {
    const c = st.camera.position;
    const v = st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0;
    const zahl = { name, sicht: st.cameraMode, v: +v.toFixed(2), fov: +st.camera.fov.toFixed(2), armM: +Math.hypot(c.x - e.position.x, c.y - e.position.y, c.z - e.position.z).toFixed(2) };
    if (st.traaNode) st.traaNode._jitterIndex = 0;
    try {
        const auf = await window.__ausgabeAufnahme(1920, 1080, 1, { satz: "messung" });
        const cv = document.createElement("canvas");
        [cv.width, cv.height] = [1920, 1080];
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(1920, 1080);
        img.data.set(auf.u8.subarray(0, 1920 * 1080 * 4));
        ctx.putImageData(img, 0, 0);
        zahl.jpg = cv.toDataURL("image/jpeg", 0.85);
    } catch (x) {
        zahl.fehler = String(x && x.message).slice(0, 200);
    }
    bilder.push(zahl);
};
const bisHalt = async (ms) => {
    const t0 = performance.now();
    while (!H.halt && performance.now() - t0 < ms) await warte(5);
    const h = H.halt;
    H.halt = null;
    return h;
};
let ende = "ok";
const phasen = {};
try {
    loopAn();
    if ((await bisHalt(30000)) && !nurVmax) await schuss("1-stand");
    [H.phase, H.n] = ["gas", 0];
    loopAn();
    phasen.gas = await bisHalt(120000);
    if (phasen.gas !== "vmax") throw new Error("Gas ohne Plateau: " + (H.stoss ? "Stoß an " + H.stoss.an.join(", ") + " bei " + H.stoss.vor + " m/s nach " + H.stoss.wegM + " m" : phasen.gas || "Frist 120 s") + " (" + H.sim.toFixed(1) + " Sim-s, " + H.n + " Bilder)");
    if (!nurVmax) {
        await schuss("2-vmax");
        [H.phase, H.n] = ["orbit", 0];
        loopAn();
        phasen.orbit = await bisHalt(20000);
        [H.phase, H.n] = ["drift", 0];
        loopAn();
        phasen.drift = await bisHalt(20000);
        if (phasen.drift) await schuss("3-drift");
    }
} catch (x) {
    ende = String(x && x.message);
} finally {
    loopAus();
    spion.ende();
    delete r._gameLoopTick;
    for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
}
const ruhe = H.spur.filter((p) => p[0] === "ruhe").slice(-10);
const gas = H.spur.filter((p) => p[0] === "gas");
const top = gas.reduce((a, p) => (p[2] > a[2] ? p : a), gas[0] || [0, 0, 0, 0, 0]);
const fov0 = ruhe.length ? ruhe[ruhe.length - 1][3] : null;
const arm0 = ruhe.length ? ruhe.reduce((s, p) => s + p[4], 0) / ruhe.length : null;
const fahr = e._fahrSatz || null;
const dr = H.spur.filter((p) => p[0] === "drift");
const med = (a) => { const s = a.filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const drEnde = dr.slice(-30);
const res = {
    nur: nurVmax ? "vmax" : null, ortStandS, ortTakte, ende, phasen, bahnNachStand, gasSimS: +H.sim.toFixed(2), stoss: H.stoss, ort: { x: +ort.x.toFixed(1), z: +ort.z.toFixed(1) }, richtungHubM: +best.hub.toFixed(2), weltStandS, mount: !!(mr && mr.ok),
    vmaxGesetz: fahr && fahr.vmax != null ? fahr.vmax : null, ruhe: { fov: fov0, armM: arm0 && +arm0.toFixed(2) },
    top: { v: top[2], fov: top[3], armM: top[4], fovPlus: fov0 != null ? +(top[3] - fov0).toFixed(2) : null, armPlus: arm0 ? +(top[4] / arm0 - 1).toFixed(3) : null },
    fovMaxGas: Math.max(...gas.map((p) => p[3])),
    rueck: { orbitGrad: spion.orbit, rueckS: spion.rueck, sollS: [1, 1.25], zeigt: spion.zeigt, quelle: spion.quelle, fov10: spion.fov[10], n: spion.n },
    drift: {
        bilder: dr.length, vEnde: drEnde.length ? drEnde[drEnde.length - 1][2] : null,
        schlupfMax: Math.max(...dr.map((p) => p[5] || 0)), schlupfEndeMedian: med(drEnde.map((p) => p[5])),
        kameraGegenFahrtEndeMedian: med(drEnde.map((p) => p[6])), kameraGegenFahrtMax: Math.max(...dr.map((p) => p[6] || 0)),
        kameraGegenFahrtBeiSchlupfMax: (dr.reduce((a, p) => ((p[5] || 0) > (a[5] || 0) ? p : a), dr[0] || []) || [])[6], soll: 15,
    },
    bilder, spurN: H.spur.length, spurAuszug: H.spur.filter((_s, i) => i % 20 === 0), spurDrift: dr.filter((_s, i) => i % 5 === 0),
};
try { r.dismountArchitecture(); r.removeArchitecture(e); } catch (_x) {}
return res;
