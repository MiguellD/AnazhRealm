// diag-schatten-takt.cjs — DIE SCHATTEN-WAND (npm run gate:schatten-takt).
//
// Befund 04.10. (echte GPU, Profil): beide CSM-Kaskaden renderten JEDEN Frame (updateShadow ~9,5 ms CPU). Der
// Schatten-Cache (V18.264) schrieb `renderer.shadowMap.needsUpdate` — r184 liest das nicht; der EINE Leser ist
// `ShadowNode.updateBefore` mit `shadow.needsUpdate || shadow.autoUpdate` je Licht (Vendor-Anker). Die Heilung:
// `_loopShadowUpdate` fährt je Kaskade den echten Leser (nah jeden nahMax-ten Frame, fern im fernFaktor-Takt). JE FRAME
// HÖCHSTENS EINE KASKADE (1410-3): unter Regler voll renderte die nahe jeden Frame und jeder dritte trug beide — der
// CPU-Takt der Doppel-Frames bildete den p95.
//
// Diese Linse (Null-Renderer, GPU-frei) fährt den ECHTEN `_loopShadowUpdate` gegen Schein-Kaskaden und zählt:
//   T1  autoUpdate ist an jeder Kaskade AUS (sonst renderte sie trotzdem jeden Frame)
//   T2  Regler-Intervall 1: die nahe Kaskade jeden nahMax-ten Frame, die ferne in den Frames dazwischen, KEIN Frame
//       mit zwei Kaskaden
//   T3  Regler-Intervall 4: die nahe höchstens jeden nahMax-ten (laufende Tiere werfen nah), die ferne seltener
//   T4  ein Sonnen-Sprung erzwingt beide im selben Takt
//   T5  ohne CSM trägt das Haupt-Licht die EINE Map im Nah-Takt (jeden nahMax-ten Frame)
//   T6  `_schattenAlleNeu` markiert jede Kaskade (die Werkzeuge vor einer Aufnahme)
//   T7  die Kamera BEWEGT sich (Gang, Drehung): die nahe Kaskade folgt jedem Frame (Intervall 1), beide dürfen in einen
//       Frame — der Schatten des gehenden Spielers hinkt nie (1410-3, Kosten an der Änderung)
//   S1  Selbsttest: mit dem alten Schreiber (renderer.shadowMap.needsUpdate) als _loopShadowUpdate wird KEINE
//       Kaskade markiert und autoUpdate bleibt an — T1/T2 fielen
//   S2  Selbsttest: das Gesetz vor 1410-3 (nah jeden Frame, fern jeden fernFaktor-ten im selben Frame) zählt
//       Doppel-Frames — T2 fiele
//
//   node scripts/diag-schatten-takt.cjs

const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.SCHATTEN_PORT || 4576);
const server = statikServer();

function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    const T = r.constructor.SCHATTEN_TAKT;
    const echtCsm = st.csmNode;
    const echtDl = st.directionalLight;
    const echtIv = st._shadowMinInterval;
    const kaskade = () => ({ shadow: { autoUpdate: true, needsUpdate: false } });
    const sonne = { position: { x: 10, y: 200, z: 10 } };
    const lauf = (lichter, n) => {
        const z = lichter.map(() => 0);
        z.doppelt = 0;
        for (let i = 0; i < n; i++) {
            lichter.forEach((l) => (l.shadow.needsUpdate = false));
            r._loopShadowUpdate();
            lichter.forEach((l, k) => l.shadow.needsUpdate && z[k]++);
            if (lichter.filter((l) => l.shadow.needsUpdate).length > 1) z.doppelt++;
        }
        return z;
    };
    const aus = {};
    try {
        // T1/T2 — CSM, Regler-Intervall 1
        const k = [kaskade(), kaskade()];
        st.csmNode = { lights: k };
        st.directionalLight = sonne;
        st._shadowMinInterval = 1;
        r._shadowLast = null;
        r._shadowFrame = 0;
        lauf(k, 1); // Sonnen-Erstlauf
        aus.t2 = lauf(k, 30);
        aus.t2doppelt = aus.t2.doppelt;
        aus.t1 = k.every((l) => l.shadow.autoUpdate === false);
        // T3 — Regler-Intervall 4
        st._shadowMinInterval = 4;
        aus.t3 = lauf(k, 60);
        aus.t3doppelt = aus.t3.doppelt;
        // T4 — Sonnen-Sprung
        st._shadowMinInterval = 4;
        lauf(k, 3);
        sonne.position.x += 100;
        k.forEach((l) => (l.shadow.needsUpdate = false));
        r._loopShadowUpdate();
        aus.t4 = k.map((l) => l.shadow.needsUpdate);
        // T5 — ohne CSM
        st.csmNode = null;
        const dl = Object.assign(kaskade(), { position: sonne.position });
        st.directionalLight = dl;
        st._shadowMinInterval = 1;
        r._shadowLast = null;
        aus.t5 = lauf([dl], 20)[0];
        aus.t5aus = dl.shadow.autoUpdate === false;
        // T7 — die Kamera bewegt sich: je Takt ein Schritt der Kamera-Matrix
        st.csmNode = { lights: k };
        st.directionalLight = sonne;
        st._shadowMinInterval = 1;
        r._shadowLast = null;
        const kam = st.camera;
        const kamAlt = kam ? kam.position.x : 0;
        const roh = r._loopShadowUpdate;
        let schritt = 0;
        r._loopShadowUpdate = function () {
            if (kam) {
                kam.position.x = kamAlt + 0.05 * ++schritt;
                kam.updateMatrixWorld(true);
            }
            return roh.call(this);
        };
        try {
            lauf(k, 1);
            aus.t7 = lauf(k, 30);
            aus.t7doppelt = aus.t7.doppelt;
        } finally {
            delete r._loopShadowUpdate;
            if (kam) {
                kam.position.x = kamAlt;
                kam.updateMatrixWorld(true);
            }
        }
        aus.t7kamera = !!kam;
        // T6
        const k6 = [kaskade(), kaskade()];
        k6.forEach((l) => (l.shadow.needsUpdate = false));
        st.csmNode = { lights: k6 };
        r._schattenAlleNeu();
        aus.t6 = k6.every((l) => l.shadow.needsUpdate === true);
        aus.quelle = String(r._loopShadowUpdate);
        // S1 — der alte Schreiber (V18.264: nur renderer.shadowMap.needsUpdate) gegen dieselben Schein-Kaskaden:
        // keine wird markiert, autoUpdate bleibt an — T1/T2 müssen an ihm scheitern
        const k7 = [kaskade(), kaskade()];
        st.csmNode = { lights: k7 };
        const smSchein = { needsUpdate: false };
        r._loopShadowUpdate = function () {
            smSchein.needsUpdate = true;
        };
        try {
            const z7 = lauf(k7, 30);
            aus.s1 = { z: z7, auto: k7.every((l) => l.shadow.autoUpdate === true) };
        } finally {
            delete r._loopShadowUpdate;
        }
        // S2 — das Gesetz vor 1410-3 gegen dieselben Schein-Kaskaden (Intervall 1): nah jeden Frame, fern jeden
        // fernFaktor-ten — es trägt Doppel-Frames, T2 muss an ihm scheitern
        const k8 = [kaskade(), kaskade()];
        st.csmNode = { lights: k8 };
        let f8 = 0;
        r._loopShadowUpdate = function () {
            f8++;
            k8[0].shadow.autoUpdate = k8[1].shadow.autoUpdate = false;
            k8[0].shadow.needsUpdate = true;
            if (f8 % T.fernFaktor === 0) k8[1].shadow.needsUpdate = true;
        };
        try {
            aus.s2 = lauf(k8, 30).doppelt;
        } finally {
            delete r._loopShadowUpdate;
        }
    } finally {
        st.csmNode = echtCsm;
        st.directionalLight = echtDl;
        st._shadowMinInterval = echtIv;
        r._shadowLast = null;
    }
    aus.T = T;
    return aus;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null" });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.message || String(e)).split("\n")[0]));
    let ok = true;
    const check = (name, cond, detail) => {
        console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
        if (!cond) ok = false;
    };
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(
            () => window.anazhRealm && typeof window.anazhRealm._loopShadowUpdate === "function" && window.THREE,
            { timeout: 120000 }
        );
        const a = await page.evaluate(probe);
        const T = a.T;
        console.log(`=== Schatten-Wand: nahMax ${T.nahMax} · fernFaktor ${T.fernFaktor} ===`);
        check("T1 autoUpdate ist an jeder Kaskade aus", a.t1);
        const fern2 = 30 / (T.nahMax * T.fernFaktor);
        check(
            "T2 Intervall 1: nah jeden nahMax-ten Frame, fern dazwischen, kein Frame mit zwei Kaskaden",
            a.t2[0] === 30 / T.nahMax && a.t2[1] >= Math.floor(fern2) - 1 && a.t2[1] <= Math.ceil(fern2) && a.t2doppelt === 0,
            `30 Frames → ${a.t2.join(" / ")}, doppelt ${a.t2doppelt}`
        );
        check(
            "T3 Intervall 4: nah höchstens jeden nahMax-ten, fern im 4×fernFaktor-Takt",
            a.t3[0] === 60 / Math.min(T.nahMax, 4) && a.t3[1] === 60 / (4 * T.fernFaktor) && a.t3doppelt === 0,
            `60 Frames → ${a.t3.join(" / ")}, doppelt ${a.t3doppelt}`
        );
        check("T4 ein Sonnen-Sprung erzwingt beide", a.t4[0] === true && a.t4[1] === true);
        check("T5 ohne CSM: das Haupt-Licht im Nah-Takt", a.t5 === 20 / T.nahMax && a.t5aus, `20 Frames → ${a.t5}`);
        check("T6 _schattenAlleNeu markiert jede Kaskade", a.t6);
        check(
            "T7 die Kamera bewegt sich: nah jeden Frame, fern jeden fernFaktor-ten, beide dürfen in einen Frame",
            a.t7kamera && a.t7[0] === 30 && a.t7[1] === 30 / T.fernFaktor && a.t7doppelt > 0,
            `30 Frames → ${a.t7 ? a.t7.join(" / ") : "–"}, doppelt ${a.t7doppelt}`
        );
        check(
            "S1 Selbsttest: der alte Schreiber markiert keine Kaskade (T2 0/0) und lässt autoUpdate an (T1 fiele)",
            a.s1.z[0] === 0 && a.s1.z[1] === 0 && a.s1.auto,
            `${a.s1.z.join(" / ")}`
        );
        check(
            "S2 Selbsttest: das Gesetz vor 1410-3 trägt Doppel-Frames (T2 fiele)",
            a.s2 > 0,
            `30 Frames → doppelt ${a.s2}`
        );
        check(
            "Absenz: _loopShadowUpdate schreibt nicht mehr renderer.shadowMap.needsUpdate",
            !/shadowMap\.needsUpdate\s*=/.test(a.quelle)
        );
        check("keine Page-Errors", pageErrors.length === 0, pageErrors.slice(0, 2).join(" | "));
    } catch (e) {
        check("Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    console.log(ok ? "GRÜN schatten-takt" : "ROT schatten-takt");
    process.exit(ok ? 0 : 1);
})();
