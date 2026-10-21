// M2 Gelände K2 (a) — das Graben-Bild: an Ufer-Punkten des Flusses nächst Genesis (5 Saaten wählen den Punkt längs des
// Laufs) je ein Graben 1 m und 3 m jenseits der Krone, gegraben über die ECHTE Eingabe (Spieler 2 m landeinwärts, das
// Fadenkreuz auf dem Graben-Punkt, Klick → Verb graben → der Grabe-Hieb). Der Spiel-Loop läuft. Je Bild (rAF): die
// gezeichneten Wasser-Flächen über ±4,5 m (je Netz die oberste, wie wasser-linse `wasserGraben`): nass, doppelt (zwei Flächen),
// über dem Spiegel (> 10 cm über `_atlasWaterLevelAt`/`_hydroSpiegelQuer`). Gefüllt = nass erreicht 90 % des Endstands.
// Bild: der Ausgabe-Pfad (`__ausgabeAufnahme`, Kamera des Spiels, Third) vor dem Klick und 2 s danach.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, warte, WT } = require("./spiel.cjs");
const { WASSER_INSTALL } = require(WT + "/scripts/lib/wasser-linse.cjs");
const pngSchreiben = require("./png.cjs");
const S = __dirname;
const OUT = path.join(S, "roh", "m2-graben.json");
const SAATEN = [11, 23, 37, 51, 73];

(async () => {
    const o = await oeffne({ profil: path.join(S, "profil-graben"), vorDoc: [() => { window.__anazhAutoSettlement = false; }] });
    const { page, cdp } = o;
    await page.evaluate(WASSER_INSTALL);
    await page.evaluate(fs.readFileSync(path.join(S, "zielen.js"), "utf8"));
    await klick(cdp);
    await warte(1000);
    // die Ufer-Punkte: der Fluss nächst dem Spieler (Genesis), je Saat ein Punkt des Laufs (nicht im See)
    const punkte = await page.evaluate((saaten) => {
        const r = window.anazhRealm, pm = r.state.playerMesh.position;
        const fn = window.__wasserFlussNah(r, pm.x, pm.z);
        if (!fn.p) return { fehler: "kein Fluss" };
        let rv = fn.fluesse.find((f) => f.points.includes(fn.p));
        const k0 = rv.points.indexOf(fn.p);
        return saaten.map((s, i) => {
            let x = (s * 2654435761) >>> 0; x ^= x >>> 13;
            let k = k0 + (i - 2) * 9 + ((x % 5) - 2); if (k < 1) k = 1 + (1 - k) + 40; if (k > rv.points.length - 2) k = rv.points.length - 2 - (k - rv.points.length) - 40; k = Math.max(1, Math.min(rv.points.length - 2, k));
            const a = rv.points[k], b = rv.points[k - 1];
            return { saat: s, k, a: { x: a.x, z: a.z, width: a.width, inLake: a.inLake }, b: { x: b.x, z: b.z }, seite: x & 1 ? 1 : -1, dSpieler: Math.round(Math.hypot(a.x - pm.x, a.z - pm.z)) };
        });
    }, SAATEN);
    const erg = { punkte, graeben: [] };
    if (punkte.fehler) throw new Error(punkte.fehler);
    for (const P of punkte) {
        for (const abstand of [1, 3]) {
            const g = await page.evaluate(async (P, abstand) => {
                const r = window.anazhRealm, st = r.state;
                const a = r.state.hydrosphere && null;
                const { p: q, vor: b } = window.__wasserFlussNah(r, P.a.x, P.a.z);
                const nl = Math.hypot(q.x - b.x, q.z - b.z) || 1;
                const nx = (-(q.z - b.z) / nl) * P.seite, nz = ((q.x - b.x) / nl) * P.seite;
                const krone = window.__wasserKroneVon(r, q);
                const px = q.x + nx * (krone + abstand), pz = q.z + nz * (krone + abstand);
                // der Spieler 2,2 m landeinwärts, Blick auf den Punkt, Third
                const sx = px + nx * 2.2, sz = pz + nz * 2.2;
                st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
                if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
                if (st.cameraMode !== "third") r.setCameraMode("third");
                for (const dl = performance.now() + 60000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 200));
                window.__gp = { px, pz, krone, q: [q.x, q.z] };
                const blick = await window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz });
                return { px, pz, krone: +krone.toFixed(2), spieler: [sx, sz], blick };
            }, P, abstand);
            // das Bild vorher (Ausgabe-Pfad, Kamera des Spiels)
            const bild = async (name) => {
                const b = await page.evaluate(async () => {
                    const { u8, info } = await window.__ausgabeAufnahme(960, 540);
                    return { b64: btoa(String.fromCharCode.apply(null, Array.from(u8.subarray(0, 0)))), w: info && info.w, roh: Array.from(u8) };
                });
                if (pngSchreiben) fs.writeFileSync(path.join(S, "roh", name), pngSchreiben(Uint8Array.from(b.roh), 960, 540));
            };
            if (P === punkte[0]) await bild(`m2-s${P.saat}-a${abstand}-vor.png`);
            // Spur je Bild installieren, dann der Klick (echte Eingabe)
            await page.evaluate(() => {
                const r = window.anazhRealm, span = r._voxelChunkConfig(0).span, G = window.__gp;
                const flaechen = (x, z) => {
                    const ys = [];
                    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
                        const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
                        const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
                        if (y !== null) ys.push(y);
                    }
                    return ys.sort((p, q) => p - q).filter((y, j, l) => !j || y - l[j - 1] > 0.1);
                };
                const messen = () => {
                    const m = { nass: 0, doppelt: 0, ueber: 0, ueberM: 0 };
                    for (let gz = -4.5; gz <= 4.5; gz += 0.5) for (let gx = -4.5; gx <= 4.5; gx += 0.5) {
                        const x = G.px + gx, z = G.pz + gz;
                        const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
                        const ys = flaechen(x, z).filter((y) => y > g + 0.1);
                        if (!ys.length) continue;
                        const atlas = r._atlasWaterLevelAt(x, z, g);
                        const Sp = atlas > -Infinity ? atlas : r._hydroSpiegelQuer(x, z);
                        const top = ys[ys.length - 1];
                        m.nass++;
                        if (ys.length > 1) m.doppelt++;
                        if (top > Sp + 0.1) (m.ueber++), (m.ueberM = Math.max(m.ueberM, +(top - Sp).toFixed(2)));
                    }
                    return m;
                };
                window.__gSpur = [];
                window.__gT0 = null;
                window.__gVor = messen();
                window.addEventListener("mousedown", () => { if (window.__gT0 == null) window.__gT0 = performance.now(); }, { once: true, capture: true });
                const f = () => {
                    if (window.__gT0 != null && performance.now() - window.__gT0 < 4000) {
                        window.__gSpur.push([+(performance.now() - window.__gT0).toFixed(1), messen()]);
                        requestAnimationFrame(f);
                    } else if (window.__gT0 == null) requestAnimationFrame(f);
                };
                requestAnimationFrame(f);
            });
            if (!(await page.evaluate(() => window.anazhRealm.state.isPointerLocked))) { await page.bringToFront(); await klick(cdp); await warte(600); }
            await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 960, y: 540, button: "left", clickCount: 1 });
            await warte(40);
            await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 960, y: 540, button: "left", clickCount: 1 });
            await warte(2000);
            if (P === punkte[0] || P === punkte[2]) await bild(`m2-s${P.saat}-a${abstand}-2s.png`);
            await warte(2300);
            const sp = await page.evaluate(() => ({ spur: window.__gSpur, vor: window.__gVor, verb: window.anazhRealm.state.player._mausVerb, edits: Object.keys(window.anazhRealm.state.worldMeta.voxelEdits || {}).length }));
            const end = sp.spur.length ? sp.spur[sp.spur.length - 1][1].nass : 0;
            const voll = sp.spur.find((x) => x[1].nass >= 0.9 * end && end > sp.vor.nass);
            const maxD = Math.max(0, ...sp.spur.map((x) => x[1].doppelt)), maxU = Math.max(0, ...sp.spur.map((x) => x[1].ueber)), maxUM = Math.max(0, ...sp.spur.map((x) => x[1].ueberM));
            const z = { saat: P.saat, abstand, ...g, verb: sp.verb, edits: sp.edits, bilder: sp.spur.length, nassVor: sp.vor.nass, nassEnde: end, gefuelltMs: voll ? voll[0] : null, doppeltMax: maxD, ueberMax: maxU, ueberMaxM: maxUM, doppeltEnde: sp.spur.length ? sp.spur[sp.spur.length - 1][1].doppelt : null };
            erg.graeben.push(z);
            console.log(JSON.stringify({ saat: z.saat, abstand, verb: z.verb, edits: z.edits, k: P.k, krone: z.krone, nassVor: z.nassVor, nassEnde: z.nassEnde, gefuelltMs: z.gefuelltMs, doppeltMax: maxD, ueberMax: maxU, ueberMaxM: maxUM, bilder: z.bilder }));
            fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
        }
    }
    erg.fehler = o.fehler.slice(0, 5);
    fs.writeFileSync(OUT, JSON.stringify(erg, null, 1));
    await o.browser.close();
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});
