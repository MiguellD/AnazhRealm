// SPIKE D5 (Zweig spike-d5-boden, kein Gate, nie gemergt): was die Prozedur des Boden-Fragments auf der GPU kostet.
// EINE Welt (die laufende Werkbank), der Chunk-Boden-Stoff in fünf Fassungen je Bau-Modus (`globalThis.__d5Modus`, gelesen
// von `_buildPbrNodeMaterial` und `_terrainGeologyAlbedo`): voll (heute) · konst (die Prozedur aus) · A (die blick-
// unabhängigen Terme aus, die Halm-Parallaxe bleibt) · B (nur die Parallaxe aus) · flach (unbeleuchtet, Vertex-Farbe — der
// Boden ohne Fragment-Arbeit). Je Runde jede Fassung an alle Boden-Meshes, warm, dann die EINE Bank-Runde (`__bankRunde`,
// zerlege-linse) mit den Pass-Stempeln (`__passUhr`) — Runden im Wechsel vorwärts/rückwärts (ABBA), gepaarte Differenz
// zur voll-Messung derselben Runde, Median.
//   node scripts/spike-d5-boden.cjs [--port 8632] [--runden 10] [--n 16] [--json datei]
"use strict";
/* global process, console */

const http = require("http");
const fs = require("fs");
const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : d;
};
const PORT = Number(opt("--port", 8632));

function rufe(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            {
                host: "127.0.0.1",
                port: PORT,
                path: weg,
                method: "POST",
                headers: { "Content-Type": "application/json" },
            },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch {
                        res({ roh: d });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(0);
        req.end(body);
    });
}

// Seiten-Kontext (Rumpf für /eval: r = Welt, T = THREE)
const SEITE = `
const k = __K__;
const st = r.state;
const rend = st.renderer;
// die fünf Fassungen, einmal je Seite gebaut (die Original-Fassung IST voll)
if (!window.__d5Mats) {
    const orig = st.voxelChunkMaterial;
    const m = { voll: orig };
    for (const modus of ["konst", "A", "B"]) {
        globalThis.__d5Modus = modus;
        st.voxelChunkMaterial = null;
        m[modus] = r._getVoxelChunkMaterial();
    }
    globalThis.__d5Modus = "voll";
    const TS = T.TSL;
    const sk = r._bodenStufenKnoten();
    const fl = new T.MeshBasicNodeMaterial({ side: T.DoubleSide });
    fl.colorNode = TS.vec4(sk.farbe, 1.0);
    const tgt = TS.attribute("aMorphTarget", "vec3");
    fl.positionNode = TS.positionLocal.add(tgt.sub(TS.positionLocal).mul(sk.f));
    r._materialObserverDiaet(fl);
    m.flach = fl;
    st.voxelChunkMaterial = orig;
    window.__d5Mats = m;
}
const M = window.__d5Mats;
const alle = new Set(Object.values(M));
// DIE VERSTÄRKUNG ("--klone K"): K Kopien jedes Boden-Meshes (dieselbe Geometrie, derselbe Stoff, derselbe Abschnitt je Pass —
// "_chunkSatzZeige" setzt den drawRange der geteilten Geometrie) zeichnen im Hauptbild in derselben Tiefe (LessEqual) nach dem
// Original: jedes Pixel des Bodens wird (K+1)-mal schattiert, der Unterschied zweier Fassungen wächst (K+1)-fach über die
// Fremdlast. Modus "voll0" = voll ohne die Kopien (der echte Frame).
if (window.__d5Klone) for (const c of window.__d5Klone) c.parent && c.parent.remove(c);
window.__d5Klone = [];
if (k.klone > 0) {
    const orig = [];
    st.scene.traverse((o) => o.isMesh && alle.has(o.material) && orig.push(o));
    for (const o of orig)
        for (let i = 0; i < k.klone; i++) {
            const c = new T.Mesh(o.geometry, o.material);
            c.matrixAutoUpdate = false;
            c.matrix.copy(o.matrix);
            c.matrixWorld.copy(o.matrixWorld);
            c.frustumCulled = false;
            c.castShadow = false;
            c.receiveShadow = o.receiveShadow;
            c.renderOrder = o.renderOrder;
            c.layers.mask = o.layers.mask;
            c.userData = { d5Klon: true };
            o.parent.add(c);
            window.__d5Klone.push(c);
        }
}
const setze = (modus) => {
    const ohne = modus === "voll0";
    const ziel = M[ohne ? "voll" : modus];
    for (const c of window.__d5Klone) c.visible = !ohne;
    let n = 0;
    st.scene.traverse((o) => {
        if (o.isMesh && alle.has(o.material)) {
            if (o.material !== ziel) o.material = ziel;
            if (o.visible) n++;
        }
    });
    if (st.chunkSaetze && st.chunkSaetze.get("boden")) st.chunkSaetze.get("boden").spec.mat = ziel;
    st.voxelChunkMaterial = ziel;
    return n;
};
window.__d5Setze = setze;
if (k.nurSetzen) return { gesetzt: k.nurSetzen, meshes: setze(k.nurSetzen) };
rend.setAnimationLoop(null);
window.__buehne();
const modi = k.modi;
const meshes = {};
// warm: jede Fassung baut ihr Programm (Haupt + Kaskaden), bevor eine Runde zählt
for (const m of modi) {
    meshes[m] = setze(m);
    await window.__bankRunde(8);
}
const roh = {};
modi.forEach((m) => (roh[m] = []));
// DER WECHSEL JE FRAME ("--wechsel Z"): die Radeon wechselt ihren Takt im Sekunden-Maß (σ 2 ms je Bank-Runde, auch mit 30
// Frames und ohne Fremdlast) — Z Zyklen, je Zyklus jede Fassung EIN Frame (Reihenfolge je Zyklus gemischt), jeder Frame
// einzeln bis zur GPU-Ruhe gewartet; die Differenz zur voll-Fassung DESSELBEN Zyklus (≈ 0,1 s Abstand) teilt den Takt-Zustand.
// Ohne Schatten-Takt (die Kaskaden-Folge streute je Frame; ihr Inhalt hängt nicht an der Fassung).
if (k.wechsel > 0) {
    const q = rend.backend.device.queue;
    const frame = async () => {
        const c0 = performance.now();
        if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
        r._loopRender(performance.now() / 1000);
        const c1 = performance.now();
        await q.onSubmittedWorkDone();
        return { t: performance.now() - c0, cpu: c1 - c0 };
    };
    for (const m of modi) {
        setze(m);
        for (let i = 0; i < 4; i++) await frame();
    }
    let saat = 12345;
    const zufall = () => ((saat = (saat * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    try {
        for (let z = 0; z < k.wechsel; z++) {
            const folge = modi.slice().sort(() => zufall() - 0.5);
            for (const m of folge) {
                setze(m);
                const f = await frame();
                roh[m].push({ z, gpu: +f.t.toFixed(3), cpu: +f.cpu.toFixed(3), stempel: 0, pass: {} });
            }
        }
    } finally {
        setze("voll");
        for (const c of window.__d5Klone) c.parent && c.parent.remove(c);
        window.__d5Klone = [];
    }
    return { roh, meshes, wechsel: k.wechsel, kamera: [+st.camera.position.x.toFixed(1), +st.camera.position.y.toFixed(1), +st.camera.position.z.toFixed(1)] };
}
// DIE PASS-STEMPEL (zerlege-linse \`__passUhr\`): je Pass die GPU-Zeit seines Render-Abschnitts — unter Fremdlast stabiler
// als die Wanduhr der Bank (die fremde Arbeit reiht sich zwischen die Pässe)
const uhr = window.__passUhr();
try {
    for (let i = 0; i < k.runden; i++) {
        const folge = i % 2 === 0 ? modi : modi.slice().reverse();
        for (const m of folge) {
            setze(m);
            await window.__bankRunde(3);
            await uhr.lesen();
            uhr.messen = true;
            const b = await window.__bankRunde(k.n);
            uhr.messen = false;
            const je = (await uhr.lesen()) || {};
            const pass = {};
            let summe = 0;
            for (const [p, e] of Object.entries(je)) {
                const v = Object.values(e).reduce((a, x) => a + x, 0) / k.n;
                pass[p] = +v.toFixed(3);
                summe += v;
            }
            roh[m].push({ gpu: +b.jeFrame.toFixed(3), cpu: +b.cpuJeFrame.toFixed(3), stempel: +summe.toFixed(3), pass });
        }
    }
} finally {
    uhr.ab();
    setze("voll");
    for (const c of window.__d5Klone) c.parent && c.parent.remove(c);
    window.__d5Klone = [];
}
const pp = st.playerMesh ? st.playerMesh.position : null;
const cam = st.camera;
return {
    roh,
    meshes,
    spieler: pp ? [+pp.x.toFixed(1), +pp.y.toFixed(1), +pp.z.toFixed(1)] : null,
    kamera: cam ? [+cam.position.x.toFixed(1), +cam.position.y.toFixed(1), +cam.position.z.toFixed(1)] : null,
    puffer: [rend.domElement.width, rend.domElement.height],
};
`;

(async () => {
    const k = {
        modi: String(opt("--modi", "voll,konst,A,B,flach")).split(","),
        runden: Number(opt("--runden", 10)),
        n: Number(opt("--n", 16)),
        nurSetzen: opt("--setze", null),
        klone: Number(opt("--klone", 0)),
        wechsel: Number(opt("--wechsel", 0)),
    };
    const t0 = Date.now();
    const o = await rufe("/eval", { code: SEITE.replace("__K__", JSON.stringify(k)) });
    const e = o.ergebnis;
    if (k.nurSetzen) {
        console.log(JSON.stringify(o));
        return;
    }
    if (!e || !e.roh) {
        console.error(JSON.stringify(o, null, 1).slice(0, 3000));
        process.exit(1);
    }
    const med = (a) => {
        const v = a.slice().sort((x, y) => x - y);
        const h = v.length >> 1;
        return v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2;
    };
    const mad = (a) => {
        const m = med(a);
        return 1.4826 * med(a.map((x) => Math.abs(x - m)));
    };
    const q = (a, p) => {
        const v = a.slice().sort((x, y) => x - y);
        return v[Math.min(v.length - 1, Math.floor(p * v.length))];
    };
    const reihe = (m, f) => e.roh[m].map(f);
    const zeilen = {};
    for (const m of k.modi) {
        const g = reihe(m, (x) => x.gpu);
        const h = reihe(m, (x) => x.pass.haupt || 0);
        const s = reihe(m, (x) => x.stempel);
        // je Runde die Differenz zur voll-Messung derselben Runde (gepaart)
        const d = g.map((x, i) => e.roh.voll[i].gpu - x);
        const dh = h.map((x, i) => (e.roh.voll[i].pass.haupt || 0) - x);
        const ds = s.map((x, i) => e.roh.voll[i].stempel - x);
        zeilen[m] = {
            bankMs: +med(g).toFixed(2),
            bankP20: +q(g, 0.2).toFixed(2),
            bankSigma: +mad(g).toFixed(2),
            cpuMs: +med(reihe(m, (x) => x.cpu)).toFixed(2),
            hauptMs: +med(h).toFixed(2),
            hauptSigma: +mad(h).toFixed(2),
            stempelMs: +med(s).toFixed(2),
            dBank: +med(d).toFixed(2),
            dBankSigma: +mad(d).toFixed(2),
            dBankP20: +(
                q(
                    e.roh.voll.map((x) => x.gpu),
                    0.2
                ) - q(g, 0.2)
            ).toFixed(2),
            dHaupt: +med(dh).toFixed(2),
            dHauptSigma: +mad(dh).toFixed(2),
            dStempel: +med(ds).toFixed(2),
        };
    }
    const K1 = k.klone + 1;
    const anteil = (x, frame, frag) => ({
        ms: x,
        frameProzent: +((100 * x) / frame).toFixed(1),
        fragmentProzent: frag ? +((100 * x) / frag).toFixed(1) : null,
    });
    const urteil = {};
    for (const [art, dk, fk] of [
        ["bank", "dBank", "bankMs"],
        ["bankP20", "dBankP20", "bankP20"],
    ]) {
        // der echte Frame: voll0 (ohne Kopien), sonst voll
        const frame = (zeilen.voll0 || zeilen.voll)[fk];
        const je = (z) => (z ? +(z[dk] / K1).toFixed(3) : null);
        const frag = je(zeilen.flach);
        urteil[art] = {
            frameMs: frame,
            // der ganze Boden-Zug im Hauptbild (Vertex + Raster + Fragment): (voll − voll0) / K
            bodenZugMs: zeilen.voll0 && k.klone > 0 ? +(zeilen.voll0[dk] / k.klone).toFixed(3) : null,
            bodenFragmentMs: frag,
            prozedurKonst: zeilen.konst ? anteil(je(zeilen.konst), frame, frag) : null,
            cacheA: zeilen.A ? anteil(je(zeilen.A), frame, frag) : null,
            parallaxeB: zeilen.B ? anteil(je(zeilen.B), frame, frag) : null,
        };
    }
    const aus = Object.assign({ k, zeilen, urteil, sek: Math.round((Date.now() - t0) / 1000) }, e);
    console.log(
        JSON.stringify(
            { zeilen, urteil, meshes: e.meshes, spieler: e.spieler, kamera: e.kamera, sek: aus.sek },
            null,
            1
        )
    );
    const j = opt("--json");
    if (j) fs.writeFileSync(j, JSON.stringify(aus, null, 1));
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
