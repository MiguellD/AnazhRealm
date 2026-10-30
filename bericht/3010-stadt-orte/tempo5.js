// w4-stadt-orte (30.10.): die Tempo-Probe fährt auf dem RUNDKURS der Stadt — dem Ort mit Rolle, den das Stadt-Gesetz legt und
// frei hält (fachwerk ORTE_GESETZ.rundkurs: geschlossene Bahn auf EINER Ebene, um sie der Sturzraum; die Natur-Wand und die Würfe
// des Felds lesen seine Fläche). tempo4.js (w4-heil-fahrzeug) legte für die Probe einen 40-m-Weg über eine freie Bahn an der
// Mess-Wiese (ein Weg nur für die Messung); jetzt fährt der GT dort, wo die Wagen der Welt fahren. Der Ort: `boot --ort stadt`
// (die Großstadt „dorf 7 120“ am Anker 663/423); die Probe nimmt den Plan v2 dieser Stadt (`_ortPlaene`), die äußere Gerade
// seines Rundkurses (`geraden[0]`), setzt den GT 8 m nach ihrem Anfang in ihre Richtung. Gas bis zum Plateau der Sim-Zeit,
// Orbit, Drift (wie tempo4.js: der Tempo-Spion um VC.chaseKamera, das Plateau Δv < 0,05 m/s je Sim-Sekunde, der Stoß beim Namen).
// Dazu zählt sie, was auf der Fläche des Rundkurses steht: jeder Eintrag der Natur und jeder Wurf des Felds (Soll 0).
const st = r.state;
const rend = st.renderer;
const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const hh = (x, z) => r.getTerrainHeightAt(x, z);
const FC = globalThis.__fachwerkCore;
const pm0 = st.playerMesh.position;
// DER PLAN DER STADT: der Plan v2 mit Orten, dessen Ort dem Spieler am nächsten liegt (die Stadt der Grundstellung `stadt`)
let plan = null;
{
    const t0 = performance.now();
    while (performance.now() - t0 < 120000) {
        const kand = [...((r._ortPlaene && r._ortPlaene.values()) || [])].filter((p) => p && p.version === 2 && Array.isArray(p.orte) && p.ort);
        kand.sort((a, b) => Math.hypot(a.ort.x - pm0.x, a.ort.z - pm0.z) - Math.hypot(b.ort.x - pm0.x, b.ort.z - pm0.z));
        plan = kand[0] || null;
        if (plan) break;
        rend.setAnimationLoop((t) => r._gameLoopTick(t));
        await warte(500);
    }
    rend.setAnimationLoop(null);
}
if (!plan) return { fehler: "keine Stadt mit Orten (Plan v2 mit orte) in 120 s" };
const rk = plan.orte.find((o) => o.rolle === "rundkurs");
if (!rk)
    return {
        fehler: "die Stadt trägt keinen Rundkurs" + (plan.orteFehlen ? ": " + plan.orteFehlen.map((f) => f.rolle + " — " + f.grund).join("; ") : plan.orteImWasser ? ": das Wasser nahm ihn" : ""),
    };
const O = plan.ort;
const g = rk.geraden[0];
const [ax, az, bx, bz] = [O.x + g.ax, O.z + g.az, O.x + g.bx, O.z + g.bz];
const L = Math.hypot(bx - ax, bz - az);
const [ux, uz] = [(bx - ax) / L, (bz - az) / L];
const a = Math.atan2(ux, uz);
const ort = { x: ax + ux * 8, z: az + uz * 8 };
// die Fläche des Rundkurses in der Welt (fachwerk `ortFlaechen`): was auf ihr steht, ist ein Bruch des Orts
const flaechen = FC.ortFlaechen(rk, 0).map((f) => Object.assign({}, f, { cx: O.x + f.cx, cz: O.z + f.cz }));
const aufFlaeche = (x, z) =>
    flaechen.some((f) => {
        const c = Math.cos(f.phi), s = Math.sin(f.phi), dx = x - f.cx, dz = z - f.cz;
        return Math.abs(dx * c - dz * s) <= f.ex && Math.abs(dx * s + dz * c) <= f.ez;
    });
const natur = () =>
    (st.architectures || []).filter((e) => e && e.position && aufFlaeche(e.position.x, e.position.z) && r._weichtDemBau(e)).map((e) => e.type);
st.playerMesh.position.set(ort.x, hh(ort.x, ort.z) + 2, ort.z);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
const loopAn = () => rend.setAnimationLoop((t) => r._gameLoopTick(t));
const loopAus = () => rend.setAnimationLoop(null);
loopAn();
const tw0 = performance.now();
await warte(1500);
while (performance.now() - tw0 < 60000 && !(typeof r._weltSteht === "function" && r._weltSteht())) await warte(100);
// die Räumung der Fläche läuft im Takt (`_wegeRaeumen`): ein paar Takte nach dem Stand
await warte(1500);
loopAus();
const weltStandS = +((performance.now() - tw0) / 1000).toFixed(1);
const naturAufBahn = natur();
// der Grund längs der Geraden (die Ebene der Bahn, fachwerk `bahnEbene`): sein Hub über 220 m ab dem Start
let lo = Infinity, hi = -Infinity;
for (let d = 0; d <= Math.min(220, L - 8); d += 5) {
    const y = hh(ort.x + ux * d, ort.z + uz * d);
    lo = Math.min(lo, y);
    hi = Math.max(hi, y);
}
const e = r.spawnArchitecture("fahrzeug_gt", { x: ort.x, y: hh(ort.x, ort.z) + 0.5, z: ort.z }, { silent: true, precise: true, rotationY: a - Math.PI / 2 });
if (!e) return { fehler: "GT nicht gesetzt" };
const tb0 = performance.now();
while (!e.instanced && !e.mesh && performance.now() - tb0 < 45000) {
    r._rebuildArchitectureMesh(e);
    await warte(200);
}
r.setCameraMode("third");
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return { fehler: "Aufsitzen misslang", mr };
// DER TEMPO-SPION (Wortlaut scripts/lib/fahr-proben.cjs tempoSpion) um die EINE Chase-Cam des Ritts
const VC = r.constructor._fahrSchrittGesetz().vc;
const spion = (function tempoSpion(VC, cam, quelle) {
    const [ck, sch, ruhe] = [VC.chaseKamera, {}, cam.fov];
    const m = Object.defineProperty({ n: 0, zeigt: 0, quelle: true, orbit: 0, rueck: null, fov: {} }, "ende", {
        value: () => (VC.chaseKamera = ck),
    });
    let [letzt, g0, los] = [0, 0, null];
    VC.chaseKamera = (c, gg, s, dt, K, z, vmax) => {
        m.zeigt = Math.max(m.zeigt, +Math.abs(cam.fov - ruhe - letzt).toFixed(3));
        m.quelle = m.quelle && quelle(z, vmax);
        const v = ck(c, gg, s, dt, K, z, vmax);
        letzt = v.fovPlus || 0;
        if (z && z.speed >= 10 && !(10 in m.fov)) m.fov[10] = +letzt.toFixed(2);
        g0 = Number.isFinite(gg) ? gg : g0;
        ck(sch, g0, s, dt, K, z, vmax);
        const ab = (Math.abs(Math.atan2(Math.sin(c.az - sch.az), Math.cos(c.az - sch.az))) * 180) / Math.PI;
        m.orbit = Math.max(m.orbit, Math.round(ab));
        if (!Number.isFinite(gg)) [los, m.rueck] = [0, null];
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
const grad = (w) => +((Math.abs(Math.atan2(Math.sin(w), Math.cos(w))) * 180) / Math.PI).toFixed(1);
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
    const aV = Math.atan2(vx, vz), aK = Math.atan2(e.position.x - c.x, e.position.z - c.z);
    const schlupf = Number.isFinite(z.vlat) ? grad(Math.atan2(z.vlat, Math.abs(z.vlong))) : null;
    H.spur.push([H.phase, H.n, +v.toFixed(2), +st.camera.fov.toFixed(2), +arm.toFixed(2), schlupf, v > 2 ? grad(aK - aV) : null]);
    if (H.phase === "ruhe" && H.n === 60) H.halt = "ruhe";
    else if (H.phase === "gas") {
        H.sim += dtSim;
        H.simSpur.push([H.sim, v]);
        while (H.simSpur.length > 2 && H.simSpur[1][0] <= H.sim - 1) H.simSpur.shift();
        H.top = Math.max(H.top, v);
        if (H.top > 3 && v < 0.7 * H.top && !H.stoss) {
            const nah = r._blockerUmPlatz(e.position.x, e.position.z, 6, []).filter((b) => b !== e && b.position);
            nah.sort((p, q) => Math.hypot(p.position.x - e.position.x, p.position.z - e.position.z) - Math.hypot(q.position.x - e.position.x, q.position.z - e.position.z));
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
    if (await bisHalt(30000)) await schuss("1-stand");
    [H.phase, H.n] = ["gas", 0];
    loopAn();
    phasen.gas = await bisHalt(120000);
    if (phasen.gas !== "vmax") throw new Error("Gas ohne Plateau: " + (H.stoss ? "Stoß an " + H.stoss.an.join(", ") + " bei " + H.stoss.vor + " m/s nach " + H.stoss.wegM + " m" : phasen.gas || "Frist 120 s") + " (" + H.sim.toFixed(1) + " Sim-s, " + H.n + " Bilder)");
    await schuss("2-vmax");
    [H.phase, H.n] = ["orbit", 0];
    loopAn();
    phasen.orbit = await bisHalt(20000);
    [H.phase, H.n] = ["drift", 0];
    loopAn();
    phasen.drift = await bisHalt(20000);
    if (phasen.drift) await schuss("3-drift");
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
const top = gas.reduce((m, p) => (p[2] > m[2] ? p : m), gas[0] || [0, 0, 0, 0, 0]);
const fov0 = ruhe.length ? ruhe[ruhe.length - 1][3] : null;
const arm0 = ruhe.length ? ruhe.reduce((s, p) => s + p[4], 0) / ruhe.length : null;
const fahr = e._fahrSatz || null;
const dr = H.spur.filter((p) => p[0] === "drift");
const med = (w) => { const s = w.filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
const drEnde = dr.slice(-30);
const res = {
    ende, phasen, ort: "rundkurs", start: { x: +ort.x.toFixed(1), z: +ort.z.toFixed(1) }, stadt: { x: +O.x.toFixed(1), z: +O.z.toFixed(1), slots: plan.slots.length },
    geradeM: +L.toFixed(1), hubGeradeM: +(hi - lo).toFixed(2), bahnHubM: rk.hub, bahnGefaelle: rk.gefaelle, naturAufBahn, gasSimS: +H.sim.toFixed(2), stoss: H.stoss, weltStandS, mount: !!(mr && mr.ok),
    vmaxGesetz: fahr && fahr.vmax != null ? fahr.vmax : null, ruhe: { fov: fov0, armM: arm0 && +arm0.toFixed(2) },
    top: { v: top[2], fov: top[3], armM: top[4], fovPlus: fov0 != null ? +(top[3] - fov0).toFixed(2) : null, armPlus: arm0 ? +(top[4] / arm0 - 1).toFixed(3) : null },
    fovMaxGas: Math.max(...gas.map((p) => p[3])),
    rueck: { orbitGrad: spion.orbit, rueckS: spion.rueck, sollS: [1, 1.25], zeigt: spion.zeigt, quelle: spion.quelle, fov10: spion.fov[10], n: spion.n },
    drift: {
        bilder: dr.length, vEnde: drEnde.length ? drEnde[drEnde.length - 1][2] : null,
        schlupfMax: Math.max(...dr.map((p) => p[5] || 0)), schlupfEndeMedian: med(drEnde.map((p) => p[5])),
        kameraGegenFahrtEndeMedian: med(drEnde.map((p) => p[6])), kameraGegenFahrtMax: Math.max(...dr.map((p) => p[6] || 0)),
        kameraGegenFahrtBeiSchlupfMax: (dr.reduce((m, p) => ((p[5] || 0) > (m[5] || 0) ? p : m), dr[0] || []) || [])[6], soll: 15,
    },
    bilder, spurN: H.spur.length, spurAuszug: H.spur.filter((_s, i) => i % 20 === 0), spurDrift: dr.filter((_s, i) => i % 5 === 0),
};
try { r.dismountArchitecture(); r.removeArchitecture(e); } catch (_x) {}
return res;
