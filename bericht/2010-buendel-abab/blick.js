// 2010 Bündel (Kopie von p3/n1910/f1/blick.js, Schüsse Bild 1–3 nach Ego → Third): EIN Blick in Fahrt am Steilhang bergab, Third → Ego → Third (Seiten-Code für `werkbank eval`, r = Welt,
// echte GPU, 1920×1080). Der Hang ist der von T4 in gate:fahr-leben (`__weltOrt("hang", { min: 17, max: 32, basis: 3,
// bergab: [30, 12], rMax: 800 })`), die Folge die von T4: Third 70 Bilder geradeaus (W bis 8 m/s, S über 11 m/s) → Ego mit A,
// bis der Wagen 75° gedreht hat (höchstens 300 Bilder) → Third mit A. Der ECHTE Loop (`setAnimationLoop(t => _gameLoopTick(t))`,
// wie herde-bild3 der S6); der Fahrer sitzt an `_gameLoopTick` (wie aufsitzen.js der Radeon). Fünf Schüsse über den Ausgabe-Pfad
// (`__ausgabeAufnahme(…, { satz: "messung" })`, ohne Welt-Warten; der Loop hält für den Schuss an):
//   1-third (Bild 70 vor dem Wechsel) · 2-ego (am Ende der Drehung) · 3-third-02 · 4-third-10 · 5-third-45 (Bilder nach dem
//   Wechsel zurück; T4 misst den Azimut nach 10). Je Schuss VOR dem Schuss gezählt: Kamera, Wagen, die Projektion der Wagen-Mitte
//   (im Bild = |x|,|y| ≤ 1 und vor der Kamera), der Abstand, der Azimut der Kamera gegen den Kurs (T4 `wink`), und je zeichnender
//   Stufe (instSlots, instSlotsBand) der größte Abstand ihrer Instanzen zur Wagen-Mitte (der Band-Partner, der am Ort des Aufstiegs
//   blieb, stünde hier mit Metern).
const st = r.state;
const T = window.THREE;
const rend = st.renderer;
const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const hh = (x, z) => r.getTerrainHeightAt(x, z);
const steil = window.__weltOrt("hang", { min: 17, max: 32, basis: 3, bergab: [30, 12], rMax: 800 });
if (!steil) return { fehler: "kein Steilhang" };
const ab = steil.gier + Math.PI;
const loopAn = () => rend.setAnimationLoop((t) => r._gameLoopTick(t));
const loopAus = () => rend.setAnimationLoop(null);
const gf = (window.__gf = window.__gf || []);
const H = { phase: "hin", n: 0, halt: null, um: 0, g0: null, spur: [] };
let e = null;
const kurs = () => e.rotationY + Math.PI / 2; // Studio-Wagen: Bug +x
const wink = (a) => Math.round((Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 1800) / Math.PI) / 10;
// 1. der Spieler am Hang, die Welt steht (echter Loop, höchstens 60 s)
st.playerMesh.position.set(steil.x, hh(steil.x, steil.z) + 2, steil.z);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
st._fieldVy = 0;
loopAn();
const tw0 = performance.now();
await warte(1500);
while (performance.now() - tw0 < 60000 && !(typeof r._weltSteht === "function" && r._weltSteht())) await warte(100);
const weltStandS = +((performance.now() - tw0) / 1000).toFixed(1);
const weltSteht = typeof r._weltSteht === "function" ? r._weltSteht() : null;
// 2. der GT bergab, aufsitzen (Third)
st.playerMesh.position.set(steil.x, hh(steil.x, steil.z) + 1.2, steil.z);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
e = r.spawnArchitecture("fahrzeug_gt", { x: steil.x, y: hh(steil.x, steil.z) + 0.5, z: steil.z }, { silent: true, precise: true, rotationY: ab - Math.PI / 2 });
if (!e) {
    loopAus();
    return { fehler: "GT nicht gesetzt", steil };
}
const tb0 = performance.now();
while (!e.instanced && !e.mesh && performance.now() - tb0 < 45000) {
    r._rebuildArchitectureMesh(e);
    await warte(200);
}
r.setCameraMode("third");
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) {
    loopAus();
    return { fehler: "Aufsitzen misslang", mr, steil };
}
// 3. der Fahrer an `_gameLoopTick`
const SCHUSS = { "hin:70": "1-third", "ego:ende": "2-ego", "zurueck:1": "3-third-01", "zurueck:2": "4-third-02", "zurueck:3": "5-third-03" };
const roh = r._gameLoopTick;
r._gameLoopTick = function (t) {
    const v = st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0;
    [st.keys.w, st.keys.s] = H.phase === "ein" ? [false, false] : [v < 8, v > 11];
    st.keys.a = H.phase !== "hin" && H.phase !== "ein";
    st.keys.d = false;
    const erg = roh.call(this, t);
    H.n++;
    H.spur.push([H.phase, H.n, +e.position.x.toFixed(2), +e.position.z.toFixed(2), +v.toFixed(2), st.cameraMode]);
    if (H.phase === "ein" && H.n >= 30) [H.phase, H.n] = ["hin", 0];
    else if (H.phase === "hin" && H.n === 70) H.halt = SCHUSS["hin:70"];
    else if (H.phase === "ego") {
        const g = kurs();
        if (H.g0 !== null) H.um += Math.abs(Math.atan2(Math.sin(g - H.g0), Math.cos(g - H.g0)));
        H.g0 = g;
        if (H.um >= (75 * Math.PI) / 180 || H.n >= 300) H.halt = SCHUSS["ego:ende"];
    } else if (H.phase === "zurueck" && SCHUSS["zurueck:" + H.n]) H.halt = SCHUSS["zurueck:" + H.n];
    if (H.halt) rend.setAnimationLoop(null);
    return erg;
};
const M = new T.Matrix4();
const V = new T.Vector3();
const stufen = () => {
    const out = {};
    for (const [k, liste] of [["instSlots", e.instSlots], ["instSlotsBand", e.instSlotsBand]]) {
        if (!liste || !liste.length) {
            out[k] = null;
            continue;
        }
        let dmax = 0,
            n = 0;
        for (const s of liste) {
            const g = st.archInstanceGroups && st.archInstanceGroups.get(s.key);
            if (!g || !g.mesh) continue;
            V.setFromMatrixPosition(M.fromArray(g.mesh.instanceMatrix.array, s.slot * 16));
            if (V.lengthSq() === 0) continue; // ein leerer Slot (Null-Matrix) zeichnet nicht
            dmax = Math.max(dmax, Math.hypot(V.x - e.position.x, V.y - e.position.y, V.z - e.position.z));
            n++;
        }
        out[k] = { n, dmaxM: +dmax.toFixed(2) };
    }
    return out;
};
const bilder = [];
const schuss = async (name) => {
    const c = st.camera.position;
    const [dx, dz] = [c.x - e.position.x, c.z - e.position.z];
    const p = new T.Vector3(e.position.x, e.position.y + 0.8, e.position.z).project(st.camera);
    const vorn = new T.Vector3(e.position.x - c.x, e.position.y + 0.8 - c.y, e.position.z - c.z).dot(st.camera.getWorldDirection(new T.Vector3())) > 0;
    const zahl = {
        name,
        sicht: st.cameraMode,
        bild: H.n,
        v: st.playerVel ? +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(1) : null,
        kamera: [c.x, c.y, c.z].map((q) => +q.toFixed(2)),
        wagen: [e.position.x, e.position.y, e.position.z].map((q) => +q.toFixed(2)),
        abstandM: +Math.hypot(dx, c.y - e.position.y, dz).toFixed(2),
        ndc: [+p.x.toFixed(3), +p.y.toFixed(3)],
        imBild: vorn && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1,
        azimutGegenKursGrad: wink(Math.atan2(-dx, -dz) - kurs()),
        hangGefaelle: +(hh(e.position.x - Math.sin(ab) * 3, e.position.z - Math.cos(ab) * 3) - hh(e.position.x + Math.sin(ab) * 3, e.position.z + Math.cos(ab) * 3)).toFixed(2),
        lod: e._servedLod != null ? e._servedLod : e._lodLevel,
        lodBand: e._lodBandLevel,
        stufen: stufen(),
        spielerSichtbar: st.playerMesh ? st.playerMesh.visible : null,
    };
    if (st.traaNode) st.traaNode._jitterIndex = 0;
    let auf = null;
    try {
        auf = await window.__ausgabeAufnahme(1920, 1080, 1, { satz: "messung" });
    } catch (x) {
        zahl.fehler = String(x && x.message).slice(0, 240);
    }
    if (auf) {
        const cv = document.createElement("canvas");
        cv.width = 1920;
        cv.height = 1080;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(1920, 1080);
        img.data.set(auf.u8.subarray(0, 1920 * 1080 * 4));
        ctx.putImageData(img, 0, 0);
        zahl.jpg = cv.toDataURL("image/jpeg", 0.85);
        zahl.info = auf.info ? { drawCalls: auf.info.drawCalls, triangles: auf.info.triangles } : null;
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
try {
    [H.phase, H.n] = ["ein", 0];
    loopAn();
    // Third 70 Bilder geradeaus
    let h = await bisHalt(30000);
    if (h) await schuss(h);
    else throw new Error("hin ohne Halt");
    // Ego mit A bis 75°
    [H.phase, H.n, H.um, H.g0] = ["ego", 0, 0, null];
    r.setCameraMode("first");
    loopAn();
    h = await bisHalt(30000);
    if (h) await schuss(h);
    else throw new Error("ego ohne Halt");
    const egoGrad = Math.round((H.um * 180) / Math.PI);
    bilder[bilder.length - 1].egoGedrehtGrad = egoGrad;
    // zurück in Third mit A
    [H.phase, H.n] = ["zurueck", 0];
    r.setCameraMode("third");
    for (let k = 0; k < 3; k++) {
        loopAn();
        h = await bisHalt(30000);
        if (h) await schuss(h);
        else throw new Error("zurueck ohne Halt " + k);
    }
} catch (x) {
    ende = String(x && x.message);
} finally {
    loopAus();
    delete r._gameLoopTick;
    for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
}
const res = { ende, steil: { x: +steil.x.toFixed(1), z: +steil.z.toFixed(1), neigung: steil.neigung, ab: +ab.toFixed(3) }, weltStandS, weltSteht, mount: !!(mr && mr.ok), bilder, spurN: H.spur.length, spurAuszug: H.spur.filter((_s, i) => i % 15 === 0), gpuFehler: gf.slice(0, 5) };
try {
    r.dismountArchitecture();
    r.removeArchitecture(e);
} catch (_x) {}
return res;
