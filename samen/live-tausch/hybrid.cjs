// hybrid.cjs — WEGWERF, Null-Renderer: ist der Bewohner, der NACH dem Neuladen des Kerns aus der ALTEN Vorlage geklont wird, ein
// Zwitter (alte Haut, neues Rig)? Gemessen an der gezeichneten Lage: die Ecken der Haut NACH den Knochen (getVertexPosition) und
// der Abstand der Schulter-Gelenke.
const fs = require("fs");
const path = require("path");
const { statikServer, starteBrowser } = require("../../scripts/lib/welt-boot.cjs");
const ROOT = path.resolve(__dirname, "../..");
const kernA = fs.readFileSync(path.join(ROOT, "koerper-core.js"), "utf8");
const kernB = kernA.replace("shoulderHW = (0.259 * H) / 2", "shoulderHW = (0.360 * H) / 2");
let fassung = "A";
const server = statikServer({ keinCache: true, wandle: (p, roh) => (p === "/koerper-core.js" ? (fassung === "B" ? kernB : kernA) : roh) });
function bauen(o) {
    const T = THREE;
    const alt = r._activePeerUebergabe;
    r._activePeerUebergabe = {};
    let g;
    try {
        g = r._buildHumanGroup(o.ov);
    } finally {
        r._activePeerUebergabe = alt;
    }
    g.position.set(o.x, 0, 0);
    st.scene.add(g);
    g.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(g.matrixWorld).invert();
    const box = new T.Box3();
    const p = new T.Vector3();
    const punkte = [];
    g.traverse((n) => {
        if (!n.isMesh || !n.visible || !n.geometry.attributes.position) return;
        let sichtbar = true;
        for (let q = n; q; q = q.parent) sichtbar = sichtbar && q.visible;
        if (!sichtbar) return;
        const a = n.geometry.attributes.position;
        for (let i = 0; i < a.count; i++) {
            if (n.isSkinnedMesh) n.getVertexPosition(i, p);
            else p.fromBufferAttribute(a, i);
            p.applyMatrix4(n.matrixWorld).applyMatrix4(inv);
            punkte.push(p.x, p.y, p.z);
            box.expandByPoint(p);
        }
    });
    const [y0, y1] = [box.min.y + 0.78 * (box.max.y - box.min.y), box.min.y + 0.84 * (box.max.y - box.min.y)];
    let [lo, hi] = [Infinity, -Infinity];
    for (let i = 0; i < punkte.length; i += 3) if (punkte[i + 1] >= y0 && punkte[i + 1] <= y1) [lo, hi] = [Math.min(lo, punkte[i]), Math.max(hi, punkte[i])];
    const rig = g.userData.rig;
    const w = (k) => (k ? k.getWorldPosition(new T.Vector3()).applyMatrix4(inv) : null);
    const [sL, sR] = [w(rig.armL && rig.armL.shoulder), w(rig.armR && rig.armR.shoulder)];
    let vorlage = null;
    g.traverse((n) => {
        if (n.__ofenVorlagen) vorlage = n.__ofenVorlagen[0];
    });
    return {
        name: o.name,
        gezeichneteBreiteM: +(hi - lo).toFixed(4),
        hoeheM: +(box.max.y - box.min.y).toFixed(4),
        schulterGelenkAbstandM: sL && sR ? +sL.distanceTo(sR).toFixed(4) : null,
        vorlageNutzer: vorlage && vorlage.__ofen.nutzer,
        ecken: punkte.length / 3,
    };
}
(async () => {
    await server.lausche(0);
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    await server.zeige(page, 120000, "index.html");
    await page.evaluate(async () => {
        await window.__weltDa(() => r && st && r._foundry && r._foundry.recipes);
    });
    const ov = await page.evaluate(() => r._dialsAusGenom(r._rollHumanoidGenome("samen-bewohner")));
    const aus = {};
    aus.a1 = await page.evaluate(bauen, { name: "a1 (vor dem Tausch)", ov, x: 0 });
    fassung = "B";
    await page.evaluate(
        () =>
            new Promise((ok) => {
                const s = document.createElement("script");
                s.src = "koerper-core.js?v=samen-" + Date.now();
                s.onload = ok;
                document.head.appendChild(s);
            })
    );
    aus.a2 = await page.evaluate(bauen, { name: "a2 (nach dem Tausch, gleiche Eingabe)", ov, x: 2 });
    console.log(JSON.stringify(aus, null, 1));
    fs.writeFileSync(path.join(__dirname, "hybrid.json"), JSON.stringify(aus, null, 1));
    await browser.close();
    server.close();
    process.exit(0);
})().catch((e) => (console.error("FEHLER", e), process.exit(1)));
