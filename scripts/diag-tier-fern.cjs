#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-tier-fern.cjs — DIE GELENKIGE GROBSTUFE TRÄGT (npm run gate:tier-fern;
// Matrix-Zelle tier.lods — die Geometrie-Fernstufe der Kreaturen).
//
// Die Linse hält vier Wahrheiten am ECHTEN Chokepoint (der EINE Stufen-Schalter
// `_gelenkStufe` in updateCreatures, Grenze `ab` × Größe ± `hyst` aus der
// Kern-Zeile tetrapoda lod.budget.kreatur), headless/Null-Renderer,
// Produktions-Boot:
//
//  (N) NAH/FERN-GEOMETRIE: der nahe Wolf zeigt die feine Stufe (die Haut an
//      ≥ 20 Bones), der ferne die gelenkige Grobstufe (bakeTierInstance lod≥1,
//      an DIESELBEN Knochen gebunden). Gezählt wird, was die Haupt-Kamera
//      zeichnet: die sichtbare Kette auf Layer 0 (nah liegt die Grobstufe als
//      Schatten-Zwilling auf SHADOW_TWIN_LAYER — die Haupt-Kamera sieht sie nie);
//      fern < 20 Meshes und < ¼ der nahen Dreiecke. Die Grenze des Wirts ist die
//      der Kern-Zeile (`_gelenk.abM` = `ab`, `hyst` gleich).
//  (H) HYSTERESE: ein Distanz-Pendeln INNERHALB des ±hyst-Bandes um die
//      Schwelle schaltet NIE (kein Sichtbarkeits-Flackern) und gießt NIE
//      (kein _ofenKreaturTemplate-Aufruf, das Memo wächst nicht). Gegenprobe
//      (nicht vakuös): ein WEITES Pendeln über beide Kanten schaltet jeden Tick.
//  (D) DETERMINISMUS (render-rein): zwei Läufe über N Ticks — einmal MIT
//      Stufen-Schalter, einmal OHNE (der Schalter gestubbt: immer nah) — liefern
//      BYTE-GLEICHE Sim-Werte (Position/Yaw/Emotion). Math.random ist in beiden
//      Läufen mit DERSELBEN Seed-Folge gestubbt, aiFrame/Anim-Uhr gepinnt — die
//      EINZIGE Differenz ist die Stufe. Divergenz = die Darstellung sickerte in die Sim.
//  (S) SELBST-TEST (die Linse feuert): mit gestubbtem Schalter (immer nah — der
//      volle Baum auf jede Distanz) MUSS die (N)-Messung den Fehler erkennen.
//      Stub wird restauriert.
//
// Frustum-Disziplin: der Schalter läuft nur `inFrustum` — die Linse stubbt
// isInFrustum ≡ true (in ALLEN Läufen identisch, auch in beiden D-Läufen)
// und restauriert (Gate-Hook-Lehre). Proben werden vor jedem Tick auf ihre
// Distanz re-gepinnt; Distanzen skalieren mit der echten Körpergröße (creature.scale.x).
//   node scripts/diag-tier-fern.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Port über TIER_FERN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4453.
const PORT = Number(process.env.TIER_FERN_PORT || 4453);
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei, Produktions-Boot
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: die Welt settled pumpen (plateau-basiert, die V18.273-Lehre).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 40) break;
                if (ticks % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });

        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            const pm = s.playerMesh && s.playerMesh.position;
            if (!pm) return { error: "kein Spieler" };
            // DIE KERN-ZEILE: die Grenze und die Hysterese der Grobstufe (tetrapoda lod.budget.kreatur)
            const BK = window.__tetrapodaCore && window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
            const abKern = BK && BK[1] ? BK[1].ab : null;
            const hyst = BK ? BK.hyst : null;
            if (!(abKern > 0) || !(hyst > 0)) return { error: "Kern-Zeile kreatur trägt kein ab/hyst" };
            if (typeof r._gelenkStufe !== "function") return { error: "_gelenkStufe fehlt" };

            // ── Harness-Disziplin: leere Bühne (keine Ambient-Separation), Frustum an ──
            for (const c of s.creatures.slice()) r.removeCreature(c);
            const saveMax = s.maxCreatures;
            s.maxCreatures = 8;
            const saveFrustum = r.isInFrustum;
            r.isInFrustum = function () {
                return true; // der Schalter läuft nur inFrustum — für die Messung immer „im Bild"
            };

            // Was die HAUPT-Kamera zeichnet (sichtbare Kette, Layer 0) + Dreiecke und die größte Bone-Zahl einer
            // sichtbaren geskinnten Haut (V18.497: der Leib ist EINE Haut über den Gelenk-Baum).
            let zTris = 0,
                zBones = 0;
            const sichtbar = (node) => {
                let m = 0;
                zTris = 0;
                zBones = 0;
                const walk = (n) => {
                    if (n.visible === false) return;
                    if (n.isMesh && n.geometry && n.layers.isEnabled(0)) {
                        m++;
                        const g = n.geometry;
                        zTris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
                        if (n.isSkinnedMesh && n.skeleton) zBones = Math.max(zBones, n.skeleton.bones.length);
                    }
                    for (const k of n.children || []) walk(k);
                };
                walk(node);
                return m;
            };
            const spawnWolf = (dist) => {
                const x = pm.x + (Number.isFinite(dist) ? dist : 30),
                    z = pm.z;
                const h = r.getTerrainHeightAt(x, z);
                return r.spawnCreatureAt(x, (Number.isFinite(h) ? h : 0) + 1, z, "happy", "wolf", {
                    precise: true,
                    bodySize: 1,
                });
            };
            const c = spawnWolf();
            if (!c) return { error: "Wolf-Spawn fehlgeschlagen (Ofen kalt?)" };
            const gl = c.userData && c.userData._gelenk;
            if (!gl || !gl.nah || !gl.fern) return { error: "_gelenk fehlt am Wolf" };
            o.checks.fernGebaut = gl.meshes.length > 0 && gl.meshes.every((m) => m.isSkinnedMesh);
            o.checks.zeileGelesen = gl.abM === abKern && gl.hyst === hyst; // die Grenze des Wirts IST die Kern-Zeile
            o.abKern = abKern;
            o.hyst = hyst;
            const fL = c.scale.x || 1;
            const fern = abKern * fL;
            o.fernDist = fern;
            const nahZustand = () =>
                gl.istFern === false && gl.nah.visible === true && gl.meshes.every((m) => !m.layers.isEnabled(0));
            const fernZustand = () =>
                gl.istFern === true && gl.nah.visible === false && gl.meshes.every((m) => m.layers.isEnabled(0));
            // Pin: exakte Distanz auf der +x-Achse (XZ — dieselbe Ebene wie distSq im Loop).
            const pin = (dist) => {
                c.position.x = pm.x + dist;
                c.position.z = pm.z;
            };
            const tick = (dist) => {
                pin(dist);
                r.updateCreatures(0.02);
                pin(dist);
            };

            // ── (N) NAH voll · FERN grob — was die Haupt-Kamera zeichnet ──
            tick(0.4 * fern);
            o.nahMeshes = sichtbar(c);
            o.nahTris = zTris;
            o.nahBones = zBones;
            o.checks.nToggleNah = nahZustand();
            tick(1.4 * fern); // jenseits der (1+h)-Kante — die Grobstufe muss tragen
            o.fernMeshes = sichtbar(c);
            o.fernTris = zTris;
            o.fernBones = zBones;
            o.checks.nToggleFern = fernZustand();
            o.checks.nFernGrob = o.fernMeshes < 20 && o.fernMeshes < o.nahMeshes;
            o.checks.nFernKleiner = o.fernTris < o.nahTris / 4; // und << nah (Dreiecke — die Kosten)
            o.checks.nNahVoll = o.nahBones >= 20; // nah bleibt der volle Gelenk-Baum (die Haut trägt ≥ 20 Bones)
            o.checks.nFernGelenkig = o.fernBones >= 20; // fern ist die Grobstufe gelenkig (dieselben Knochen)

            // ── (S) SELBST-TEST: der Schalter gestubbt (immer nah — der volle Baum auf jede Distanz) wird ERKANNT ──
            const saveStufe = r._gelenkStufe;
            r._gelenkStufe = function (gruppe) {
                return saveStufe.call(this, gruppe, 0); // die nahe Stufe auf jede Distanz
            };
            tick(1.4 * fern);
            o.sAltMeshes = sichtbar(c);
            o.sAltTris = zTris;
            o.checks.sLensFires = !(o.sAltMeshes < 20 && o.sAltMeshes < o.nahMeshes && o.sAltTris < o.nahTris / 4);
            r._gelenkStufe = saveStufe; // restaurieren (Gate-Hook-Lehre)

            // ── (H) HYSTERESE: Pendeln an der Kante schaltet nicht, gießt nicht ──
            const memo = A._tierOfenMemo;
            const memoVor = memo ? memo.size : -1;
            const saveOfen = r._ofenKreaturTemplate;
            let gussCalls = 0;
            r._ofenKreaturTemplate = function () {
                gussCalls++;
                return saveOfen.apply(this, arguments);
            };
            // Pendelbreite aus der WAHRHEIT abgeleitet: ±h/5 liegt für jedes legitime hyst tief im Band.
            const bandTief = hyst / 5;
            tick(0.5 * fern); // definierter Start: nah
            const startNah = nahZustand();
            let flipsEng = 0;
            let prev = gl.istFern;
            for (let k = 0; k < 40; k++) {
                tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
                if (gl.istFern !== prev) flipsEng++;
                prev = gl.istFern;
            }
            o.flipsEng = flipsEng;
            o.checks.hKeinFlackern = startNah && flipsEng === 0;
            // (H2): dieselbe Eng-Pendelprobe aus dem FERN-Start — echte Hysterese hält den letzten Zustand auch von fern.
            tick(1.4 * fern);
            const startFern = fernZustand();
            let flipsEngFern = 0;
            prev = gl.istFern;
            for (let k = 0; k < 40; k++) {
                tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
                if (gl.istFern !== prev) flipsEngFern++;
                prev = gl.istFern;
            }
            o.flipsEngFern = flipsEngFern;
            o.checks.hKeinFlackernFern = startFern && flipsEngFern === 0 && fernZustand();
            // Gegenprobe (nicht vakuös): WEIT über beide Kanten pendeln MUSS schalten.
            let flipsWeit = 0;
            prev = gl.istFern;
            for (let k = 0; k < 10; k++) {
                tick((k % 2 ? 0.6 : 1.6) * fern);
                if (gl.istFern !== prev) flipsWeit++;
                prev = gl.istFern;
            }
            o.flipsWeit = flipsWeit;
            o.checks.hToggleLebt = flipsWeit >= 8;
            r._ofenKreaturTemplate = saveOfen; // restaurieren
            o.gussCalls = gussCalls;
            o.memoDelta = memo ? memo.size - memoVor : -1;
            o.checks.hKeinGuss = gussCalls === 0 && o.memoDelta === 0;
            r.removeCreature(c);

            // ── (D) DETERMINISMUS: Sim-Werte identisch mit/ohne Stufen-Schalter ──
            const mulberry32 = (a) => () => {
                a |= 0;
                a = (a + 0x6d2b79f5) | 0;
                let t = Math.imul(a ^ (a >>> 15), 1 | a);
                t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
            const saveRandom = Math.random;
            const lauf = (ohneFern) => {
                Math.random = mulberry32(424242); // DIESELBE Folge je Lauf
                r._creatureAiFrame = 1000;
                s.creatureAnimationTime = 100;
                // IDENTITÄTS-PIN: beide Läufe spawnen DENSELBEN Wolf (c7001); Echtzeit-Stempel uhr-frei.
                s._creatureNetSeq = 7000;
                // der Lauf spawnt im FERN-Regime (1.4·Schwelle) — sonst wäre die Stufe in beiden Läufen inert
                const cw = spawnWolf(1.4 * fern);
                if (!cw) return null;
                if (cw.userData.task) cw.userData.task.since = 0;
                cw.userData.bornAt = 0;
                const spur = [];
                let fernAktivTicks = 0;
                if (ohneFern)
                    r._gelenkStufe = function (gruppe) {
                        return saveStufe.call(this, gruppe, 0); // der alte Zustand: immer die nahe Stufe
                    };
                for (let k = 0; k < 60; k++) {
                    r.updateCreatures(0.02);
                    const glw = cw.userData._gelenk;
                    if (glw && glw.istFern === true) fernAktivTicks++;
                    spur.push(
                        cw.position.x,
                        cw.position.y,
                        cw.position.z,
                        cw.rotation.y,
                        s.creatureEmotions[s.creatures.indexOf(cw)] === "happy" ? 1 : 0
                    );
                }
                r._gelenkStufe = saveStufe; // restaurieren
                r.removeCreature(cw);
                return { spur, fernAktivTicks };
            };
            const laufMit = lauf(false);
            const laufOhne = lauf(true);
            const spurMit = laufMit && laufMit.spur;
            const spurOhne = laufOhne && laufOhne.spur;
            o.dFernAktivTicks = laufMit ? laufMit.fernAktivTicks : -1;
            o.checks.dFernAktiv = !!laufMit && laufMit.fernAktivTicks > 30;
            Math.random = saveRandom; // restaurieren (Gate-Hook-Lehre)
            if (!spurMit || !spurOhne) {
                o.checks.dLaufe = false;
            } else {
                o.checks.dLaufe = true;
                let diffAt = -1;
                for (let k = 0; k < spurMit.length; k++) {
                    if (spurMit[k] !== spurOhne[k]) {
                        diffAt = k;
                        break;
                    }
                }
                o.dDiffAt = diffAt;
                o.dLen = spurMit.length;
                o.checks.dIdentisch = diffAt === -1 && spurMit.length === spurOhne.length;
            }

            r.isInFrustum = saveFrustum; // restaurieren (Gate-Hook-Lehre)
            s.maxCreatures = saveMax;
            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== TIER-FERN — die gelenkige Grobstufe der Kreaturen (gate:tier-fern) =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const c = out.checks;
        console.log(
            `  Schwelle ${out.fernDist.toFixed(1)} m (Kern ab ${out.abKern} · hyst ${out.hyst}) · Wolf im Bild: nah ${out.nahMeshes} Meshes / ${Math.round(out.nahTris)} Dreiecke / Haut ${out.nahBones} Bones → fern ${out.fernMeshes} Meshes / ${Math.round(out.fernTris)} Dreiecke / ${out.fernBones} Bones (Schalter gestubbt: ${out.sAltMeshes})\n`
        );
        check(c.fernGebaut, "(N) der Wolf trägt die gelenkige Grobstufe (_gelenk, jedes Teil geskinnt)");
        check(c.zeileGelesen, `(N) die Grenze des Schalters IST die Kern-Zeile (ab ${out.abKern} m, hyst ${out.hyst})`);
        check(c.nToggleNah, "(N) nah: die feine Stufe im Bild, die Grobstufe nur in den Kaskaden (SHADOW_TWIN_LAYER)");
        check(c.nToggleFern, "(N) fern: die Grobstufe im Bild (Layer 0), die feine verdeckt");
        check(c.nFernGelenkig, `(N) fern ist die Grobstufe gelenkig (Haut an ${out.fernBones} Bones ≥ 20)`);
        check(c.nNahVoll, `(N) nah ist der volle Gelenk-Baum (Haut an ${out.nahBones} Bones ≥ 20)`);
        check(c.nFernGrob, `(N) fern ist GROB (${out.fernMeshes} Meshes < 20 und < ${out.nahMeshes} nah)`);
        check(c.nFernKleiner, `(N) und << nah (${Math.round(out.fernTris)} < ${Math.round(out.nahTris)}/4 Dreiecke)`);
        check(
            c.sLensFires,
            `SELBST-TEST (S): mit gestubbtem Schalter erkennt die Linse den alten Zustand (fern ${out.sAltMeshes} Meshes / ${Math.round(out.sAltTris)} Dreiecke = nah)`
        );
        check(
            c.hKeinFlackern,
            `(H) Eng-Pendeln (±h/5) aus NAH-Start: KEIN Umschalten (${out.flipsEng} Flips/40 Ticks)`
        );
        check(
            c.hKeinFlackernFern,
            `(H2) Eng-Pendeln aus FERN-Start: KEIN Umschalten, fern hält (${out.flipsEngFern} Flips/40 Ticks)`
        );
        check(c.hToggleLebt, `(H) Gegenprobe: weites Pendeln schaltet (${out.flipsWeit} Flips/10 Ticks ≥ 8)`);
        check(c.hKeinGuss, `(H) kein Guss im Frame-Takt (${out.gussCalls} Ofen-Aufrufe · Memo-Delta ${out.memoDelta})`);
        check(c.dLaufe, "(D) beide Determinismus-Läufe liefen (Spawn warm)");
        check(c.dFernAktiv, `(D) das FERN-Regime war im MIT-Lauf real aktiv (${out.dFernAktivTicks}/60 Ticks)`);
        check(
            c.dIdentisch,
            `(D) Sim-Spur BYTE-GLEICH mit/ohne Stufen-Schalter (${out.dLen || 0} Werte${out.dDiffAt >= 0 ? `, erste Differenz @${out.dDiffAt}` : ""})`
        );
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die gelenkige Grobstufe trägt (grob · Kern-Zeile · hysterese-still · render-rein)" : "❌ ROT — die Tier-Fernstufe trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
