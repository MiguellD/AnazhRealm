// DIE TREUE DES SPEICHERS: der Abstands-Block von `/bild` (werkbank.cjs, `if (k.abstand) {` … bis zur Maske) alt (git HEAD) und neu
// in der Null-Welt an der Mess-Wiese, dieselbe Kamera, dieselbe Teilung (vier Klassen in Streifen): neu frisch, neu aus dem Speicher,
// alt — die Zählung (Bänder, cos, Klassen, Farbton) muss gleich sein. Dazu die Zeit je Fassung.
"use strict";
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const baum = path.resolve(process.argv[2] || "/home/user/spiel-a");
process.chdir(baum);
const { statikServer, nullSeite } = require(path.join(baum, "scripts/lib/welt-boot.cjs"));
const { messort } = require(path.join(baum, "scripts/lib/welt-orte.cjs"));
const AU = require(path.join(baum, "scripts/lib/abnahme-urteil.cjs"));
const block = (text) => {
    const a = text.indexOf("                    let abstand = null;\n                    if (k.abstand) {");
    const b = text.indexOf("                    // die Maske: jede Klasse in ihrem Ton über dem Bild");
    if (a < 0 || b < 0) throw new Error("der Abstands-Block steht nicht im Text");
    return text.slice(a, b) + "\nreturn abstand;";
};
const neu = block(fs.readFileSync("scripts/werkbank.cjs", "utf8"));
const alt = block(execFileSync("git", ["show", "f0dab43d:scripts/werkbank.cjs"], { encoding: "utf8", maxBuffer: 1 << 28 }));
(async () => {
    const server = statikServer();
    await server.lausche(Number(process.argv[3] || 4771));
    const { browser, page } = await nullSeite({ frist: 600000 });
    try {
        await server.zeige(page);
        await page.evaluate(() => window.__weltDa((x) => x.state.worldMeta && x.state.worldMeta.worldId));
        const m = messort("wiese");
        await page.evaluate(async (x, z) => {
            window.__anazhAutoSettlement = false;
            r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            r.setCameraMode("first");
            await window.__weltStehtNach(null, 3000);
        }, m.x, m.z);
        // die Farbton-Probe der Abnahme (dieselbe wie in der Werkbank), falls die Null-Seite sie nicht trägt
        const ft = AU.farbtonProbe ? AU.farbtonProbe.toString() : null;
        const lauf = (code) =>
            page.evaluate(
                (c, ft) => {
                    if (!window.__farbtonProbe && ft) window.__farbtonProbe = (0, eval)("(" + ft + ")");
                    if (!window.__farbtonProbe) window.__farbtonProbe = (acc, u8, i) => (acc[0]++, (acc[1] += u8[i] / 255), (acc[2] += u8[i + 1] / 255), (acc[3] += 1));
                    for (let i = 0; i < 30; i++) r._loopCamera(1000 + i * 100);
                    const cam = r.state.camera;
                    cam.updateMatrixWorld(true);
                    const W = 1920, H = 1080;
                    const namen = ["bodenSatz", "nahWiese:L1", "nahWiese:L2", "streuSatz"];
                    const teil = new Uint8Array(W * H);
                    for (let p = 0; p < W * H; p++) teil[p] = 1 + (((p % W) >> 5) % 4);
                    const u8 = new Uint8Array(W * H * 4);
                    for (let i = 0; i < u8.length; i++) u8[i] = (i * 2654435761) >>> 24;
                    const k = { abstand: true };
                    const t0 = performance.now();
                    let a; try { a = new Function("r", "THREE", "cam", "W", "H", "teil", "namen", "u8", "k", c)(r, THREE, cam, W, H, teil, namen, u8, k); } catch (x) { return { ms: -1, a: String(x.stack).slice(0, 600) }; }
                    return { ms: Math.round(performance.now() - t0), a };
                },
                code,
                ft
            );
        await page.evaluate(() => delete window.__abstandSpeicher);
        const N1 = await lauf(neu);
        const N2 = await lauf(neu);
        const A1 = await lauf(alt);
        const s = (x) => JSON.stringify(x.a);
        console.log("ZEIT neu frisch " + N1.ms + " ms · neu aus dem Speicher " + N2.ms + " ms · alt " + A1.ms + " ms");
        console.log("TREUE neu frisch = alt: " + (s(N1) === s(A1)) + " · Speicher = frisch: " + (s(N2) === s(N1)) + " · Bänder " + JSON.stringify(N1.a.klassen));
        // ändert sich der Boden, fällt der Speicher: die Ziel-Karte eines Chunks neu (ein neues Objekt) → frisch marschiert
        console.log("SAEULE " + (await page.evaluate(() => { const S = (r.state.saeulenVorlaeufig = r.state.saeulenVorlaeufig || new Map()); S.set("probe-fern", { x: 1e6, z: 1e6, rr: 1, krone: 0 }); return S.size; })));
        const N3 = await lauf(neu);
        await page.evaluate(() => r.state.saeulenVorlaeufig.delete("probe-fern"));
        console.log("FALL nach geändertem Boden: " + N3.ms + " ms (frisch), gleich: " + (s(N3) === s(N1)) + (N3.ms < 0 ? " · " + N3.a : ""));
    } finally {
        await browser.close();
        server.close();
    }
})().catch((e) => (console.log("FEHLER " + (e && e.stack)), (process.exitCode = 1)));
