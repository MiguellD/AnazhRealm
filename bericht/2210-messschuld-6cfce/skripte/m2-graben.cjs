// M2 Gelände K2 (a) — das Graben-Bild: an Ufer-Punkten des Flusses nächst Genesis (5 Saaten wählen den Punkt längs des
// Laufs) je ein Graben 1 m und 3 m jenseits der Krone, gegraben über die ECHTE Eingabe (Spieler 2 m landeinwärts, das
// Fadenkreuz auf dem Graben-Punkt, Klick → Verb graben → der Grabe-Hieb). Der Spiel-Loop läuft. Je Bild (rAF): die
// gezeichneten Wasser-Flächen über ±4,5 m (je Netz die oberste, wie wasser-linse `wasserGraben`): nass, doppelt (zwei Flächen),
// über dem Spiegel (> 10 cm über `_atlasWaterLevelAt`/`_hydroSpiegelQuer`). Gefüllt = nass erreicht 90 % des Endstands.
// Bild: der Ausgabe-Pfad (`__ausgabeAufnahme`, Kamera des Spiels, Third) vor dem Klick und 2 s danach.
// `--sicht first` (gelaende.K2 Staffel 2, Ego): dieselbe Bahn im Ich-Auge — die Kamera des Spiels (`_loopCamera`) am Kopf, der
// Blick nach unten auf den Boden vor dem Leib. Der Stand wählt sich wie ein Spieler, der aus dem Busch tritt: 2,2 m vom Graben-
// Punkt, landeinwärts zuerst, sonst um ihn gedreht (±15° … ±90°, nie zum Fluss), bis die Abnahme des Blicks (dieselben Schwellen
// wie die Aufnahme, ohne die Bild-Zeilen) frei ist und das Fadenkreuz den Boden trifft (kein Bauwerk `_pickArchitectureAtCrosshair`,
// keine Blüte `_ernteZiel` davor — die Wahl des Verbs in `tryMouseBreak`). Im 1st fällt Laub nur bis 0,8 m (`KAMERA_DURCHSICHT.ichM`):
// ein Hasel 0,9 m neben dem Graben-Punkt deckte vom Stand landeinwärts 27,7 % (die Aufnahme warf vor dem ersten Graben, Ego 0/0
// am 27.10.) und nahm den Klick als abbau (swiftshader an ea07267e: Saat 11, 1 m: verb abbau, 0 Edits); bei −90° frei, graben.
const fs = require("fs");
const path = require("path");
const { oeffne, klick, warte, WT } = require("./spiel.cjs");
const { WASSER_INSTALL } = require(WT + "/scripts/lib/wasser-linse.cjs");
const pngSchreiben = require("./png.cjs");
const S = __dirname;
const SICHT = process.argv.includes("--sicht") ? process.argv[process.argv.indexOf("--sicht") + 1] : "third";
if (SICHT !== "third" && SICHT !== "first") throw new Error("--sicht third|first, nicht " + SICHT);
const EGO = SICHT === "first";
const OUT = path.join(S, "roh", EGO ? "m2-graben-ego.json" : "m2-graben.json");
const SAATEN = [11, 23, 37, 51, 73];

(async () => {
    const o = await oeffne({ profil: path.join(S, EGO ? "profil-graben-ego" : "profil-graben"), vorDoc: [() => { window.__anazhAutoSettlement = false; }] });
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
    // die Beweisbilder: Third an Punkt 0 (vor und 2 s) und Punkt 2 (2 s); Ego nur von einem freien Stand — ein fälliges Bild ohne
    // freien Stand fällt an den nächsten Graben mit freiem (die Blick-Wahl sucht freie Sicht, Lehre 17)
    const plan = { vor: { 1: [0], 3: [0] }, nach: { 1: [0, 2], 3: [0, 2] } };
    if (punkte.fehler) throw new Error(punkte.fehler);
    for (const [i, P] of punkte.entries()) {
        for (const abstand of [1, 3]) {
            const g = await page.evaluate(async (P, abstand, SICHT) => {
                const r = window.anazhRealm, st = r.state;
                const a = r.state.hydrosphere && null;
                const { p: q, vor: b } = window.__wasserFlussNah(r, P.a.x, P.a.z);
                const nl = Math.hypot(q.x - b.x, q.z - b.z) || 1;
                const nx = (-(q.z - b.z) / nl) * P.seite, nz = ((q.x - b.x) / nl) * P.seite;
                const krone = window.__wasserKroneVon(r, q);
                const px = q.x + nx * (krone + abstand), pz = q.z + nz * (krone + abstand);
                // der Spieler 2,2 m landeinwärts (Ego: um den Punkt gedreht, bis der Blick frei ist), Blick auf den Punkt
                const stellen = (w) => {
                    const c = Math.cos((w * Math.PI) / 180), s = Math.sin((w * Math.PI) / 180);
                    const sx = px + (nx * c - nz * s) * 2.2, sz = pz + (nx * s + nz * c) * 2.2;
                    st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
                    if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
                    return [sx, sz];
                };
                let spieler = stellen(0);
                if (st.cameraMode !== SICHT) r.setCameraMode(SICHT);
                for (const dl = performance.now() + 60000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await new Promise((f) => setTimeout(f, 200));
                window.__gp = { px, pz, krone, q: [q.x, q.z] };
                let blick = await window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz });
                if (SICHT !== "first") return { px, pz, krone: +krone.toFixed(2), spieler, blick };
                const stand = [];
                // `_weltSteht()` ist direkt nach dem Sprung noch der alte Stand (die Wache oben endet ohne Takt) — die Probe sah den Hasel
                // ungezeichnet (Deckung 0), die Aufnahme danach 27,7 %: erst Takt um Takt (`__seitenTakt`, Lehre 26), dann dieselbe 60-s-Wache
                // (`__weltStehtNach` kehrte auf swiftshader nicht zurück: sein Deckel zählt nur Takte ohne Offenes). Die Nachbar-Stände
                // (≤ 4,4 m) liegen in derselben gezeichneten Nähe.
                const tW = performance.now();
                let takte = 0;
                for (const dl = performance.now() + 60000; (!takte || !r._weltSteht()) && performance.now() < dl; takte++) await window.__seitenTakt();
                for (const w of [0, 15, -15, 30, -30, 45, -45, 60, -60, 90, -90]) {
                    if (w) spieler = stellen(w);
                    blick = await window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz });
                    const rot = window.__abnahmeUrteil(window.__abnahmeMessen({})).rot.filter((u) => !u.feld.startsWith("bild."));
                    const bau = r._pickArchitectureAtCrosshair();
                    if (bau && bau.entry) rot.push({ grund: "Bauwerk am Fadenkreuz " + (bau.entry.type || bau.entry.id) });
                    if (r._ernteZiel()) rot.push({ grund: "Blüte am Fadenkreuz" });
                    stand.push({ w, rot: rot.map((u) => u.grund) });
                    if (!rot.length) break;
                }
                // kein freier Stand (Saat 37: Laub-Streu 22–61 % auf jedem): der Stand landeinwärts wie Third, kein Beweisbild hier
                if (stand[stand.length - 1].rot.length && stand.length > 1)
                    (spieler = stellen(0)), (blick = await window.__zielen({ x: px, y: r._voxelSurfaceY(px, pz), z: pz }));
                return { px, pz, krone: +krone.toFixed(2), spieler, blick, sicht: SICHT, stand, takte, standMs: Math.round(performance.now() - tW) };
            }, P, abstand, SICHT);
            // das Bild vorher (Ausgabe-Pfad, Kamera des Spiels)
            const bild = async (name) => {
                const b = await page.evaluate(async () => {
                    const { u8, info } = await window.__ausgabeAufnahme(960, 540);
                    return { b64: btoa(String.fromCharCode.apply(null, Array.from(u8.subarray(0, 0)))), w: info && info.w, roh: Array.from(u8) };
                });
                if (pngSchreiben) fs.writeFileSync(path.join(S, "roh", name), pngSchreiben(Uint8Array.from(b.roh), 960, 540));
            };
            const frei = !g.stand || !g.stand[g.stand.length - 1].rot.length;
            const faellig = (l) => (frei && l.length && l[0] <= i ? (l.shift(), true) : false);
            g.bild = [];
            if (faellig(plan.vor[abstand])) await bild(`${EGO ? "m2e" : "m2"}-s${P.saat}-a${abstand}-vor.png`), g.bild.push("vor");
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
            if (faellig(plan.nach[abstand])) await bild(`${EGO ? "m2e" : "m2"}-s${P.saat}-a${abstand}-2s.png`), g.bild.push("2s");
            await warte(2300);
            const sp = await page.evaluate(() => ({ spur: window.__gSpur, vor: window.__gVor, verb: window.anazhRealm.state.player._mausVerb, edits: Object.keys(window.anazhRealm.state.worldMeta.voxelEdits || {}).length }));
            const end = sp.spur.length ? sp.spur[sp.spur.length - 1][1].nass : 0;
            const voll = sp.spur.find((x) => x[1].nass >= 0.9 * end && end > sp.vor.nass);
            const maxD = Math.max(0, ...sp.spur.map((x) => x[1].doppelt)), maxU = Math.max(0, ...sp.spur.map((x) => x[1].ueber)), maxUM = Math.max(0, ...sp.spur.map((x) => x[1].ueberM));
            const z = { saat: P.saat, abstand, ...g, verb: sp.verb, edits: sp.edits, bilder: sp.spur.length, nassVor: sp.vor.nass, nassEnde: end, gefuelltMs: voll ? voll[0] : null, doppeltMax: maxD, ueberMax: maxU, ueberMaxM: maxUM, doppeltEnde: sp.spur.length ? sp.spur[sp.spur.length - 1][1].doppelt : null };
            erg.graeben.push(z);
            console.log(JSON.stringify({ saat: z.saat, abstand, sicht: SICHT, bild: z.bild.join("+"), stand: z.stand && z.stand.map((x) => x.w + (x.rot.length ? "×" : "✓")).join(" "), standMs: z.standMs, verb: z.verb, edits: z.edits, k: P.k, krone: z.krone, nassVor: z.nassVor, nassEnde: z.nassEnde, gefuelltMs: z.gefuelltMs, doppeltMax: maxD, ueberMax: maxU, ueberMaxM: maxUM, bilder: z.bilder }));
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
