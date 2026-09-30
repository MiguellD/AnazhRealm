#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-tier-fern.cjs — DER TIER-FERN-GUSS TRÄGT (npm run gate:tier-fern;
// Matrix-Zelle tier.lods — die Geometrie-Fernstufe der Kreaturen).
//
// Die Linse hält vier Wahrheiten am ECHTEN Chokepoint (der wrap↔fern-Toggle
// in updateCreatures, TIER_FERN_DIST_SQ ± TIER_FERN_HYST), headless/Null-
// Renderer, Produktions-Boot:
//
//  (N) NAH/FERN-GEOMETRIE: der nahe Wolf trägt den vollen Gelenk-Baum, der
//      ferne Wolf das gemergte lod1-Standbild (bakeTierInstance lod≥1 —
//      grobe Segmente, alles in den Root gebacken). Gezählt wird die
//      SICHTBARE Mesh-Zahl (visible-Kette): fern << nah, fern < 20 Meshes.
//      Beide Zahlen stehen im Bericht.
//  (H) HYSTERESE: ein Distanz-Pendeln INNERHALB des ±10-%-Bandes um die
//      Schwelle schaltet NIE (kein Sichtbarkeits-Flackern) und gießt NIE
//      (kein _ofenKreaturTemplate-Aufruf, das Memo wächst nicht — die
//      Geometrie bleibt das memoisierte Template). Gegenprobe (nicht
//      vakuös): ein WEITES Pendeln über beide Kanten hinaus schaltet
//      jeden Tick — der Toggle lebt.
//  (D) DETERMINISMUS (render-rein): zwei Läufe über N Ticks — einmal MIT
//      Fern-Zweig, einmal OHNE (der alte Zustand) — liefern BYTE-GLEICHE
//      Sim-Werte (Position/Yaw/Emotion). Math.random ist in beiden Läufen
//      mit DERSELBEN Seed-Folge gestubbt (der Sprung-Wurf ist Alt-Random),
//      aiFrame/Anim-Uhr auf denselben Start gepinnt — die EINZIGE Differenz
//      ist der Fern-Zweig. Divergenz = die Darstellung sickerte in die Sim.
//  (S) SELBST-TEST (die Linse feuert): mit deaktiviertem Fern-Zweig
//      (tb.fern = null — der Zustand vor dem Fern-Guss: ~80 Meshes auf
//      jede Distanz) MUSS die (N)-Messung den alten Fehler erkennen
//      (sichtbare Fern-Mesh-Zahl ≥ 20). Stub wird restauriert.
//
// Frustum-Disziplin: der Toggle läuft nur `inFrustum` — die Linse stubbt
// isInFrustum ≡ true (in ALLEN Läufen identisch, auch in beiden D-Läufen)
// und restauriert (Gate-Hook-Lehre). Proben werden vor jedem Tick auf ihre
// Distanz re-gepinnt (Wander/Separation driftet nicht hinaus); Distanzen
// skalieren mit der echten Körpergröße (creature.scale.x).
//   node scripts/diag-tier-fern.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4453;
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
            if (!Number.isFinite(A.TIER_FERN_DIST_SQ) || !Number.isFinite(A.TIER_FERN_HYST))
                return { error: "TIER_FERN-Konstanten fehlen" };

            // ── Harness-Disziplin: leere Bühne (keine Ambient-Separation), Frustum an ──
            for (const c of s.creatures.slice()) r.removeCreature(c);
            const saveMax = s.maxCreatures;
            s.maxCreatures = 8;
            const saveFrustum = r.isInFrustum;
            r.isInFrustum = function () {
                return true; // der Toggle läuft nur inFrustum — für die Messung immer „im Bild"
            };

            // SICHTBARE Meshes (visible-Kette ab der Gruppe — was der Renderer zöge).
            const sichtbar = (node) => {
                let m = 0;
                const walk = (n) => {
                    if (n.visible === false) return;
                    if (n.isMesh && n.geometry) m++;
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
            const tb = c.userData && c.userData._tierBaum;
            if (!tb || !tb.wrap) return { error: "_tierBaum fehlt am Wolf" };
            o.checks.fernGebaut = !!tb.fern; // der lod1-Zweig hängt am Körper
            const fL = c.scale.x || 1;
            const fern = Math.sqrt(A.TIER_FERN_DIST_SQ) * fL;
            o.fernDist = fern;
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

            // ── (N) NAH voll · FERN grob — die sichtbare Mesh-Zahl ──
            tick(0.4 * fern);
            o.nahMeshes = sichtbar(c);
            o.checks.nToggleNah = tb.wrap.visible === true && (!tb.fern || tb.fern.visible === false);
            tick(1.4 * fern); // jenseits der (1+h)-Kante — der Fern-Zweig muss tragen
            o.fernMeshes = sichtbar(c);
            o.checks.nToggleFern = !!tb.fern && tb.fern.visible === true && tb.wrap.visible === false;
            o.checks.nFernGrob = o.fernMeshes < 20; // das Ziel: fern DEUTLICH unter 20 Meshes
            o.checks.nFernKleiner = o.fernMeshes < o.nahMeshes / 4; // und << nah
            o.checks.nNahVoll = o.nahMeshes > 40; // nah bleibt der volle Gelenk-Baum

            // ── (S) SELBST-TEST: der ALTE Zustand (kein Fern-Zweig) wird ERKANNT ──
            // tb.fern = null ⇒ der Toggle no-opt, der volle Baum bleibt auf jede
            // Distanz sichtbar — exakt die 80-Meshes-Welt vor dem Fern-Guss. Die
            // (N)-Messung MUSS dann rot schlagen (sonst ist die Linse vakuös).
            const saveFern = tb.fern;
            tb.fern = null;
            tb.wrap.visible = true;
            if (saveFern) saveFern.visible = false;
            tick(1.4 * fern);
            o.sAltMeshes = sichtbar(c);
            o.checks.sLensFires = !(o.sAltMeshes < 20); // die Fern-Grob-Prüfung erkennt den alten Fehler
            tb.fern = saveFern; // restaurieren (Gate-Hook-Lehre)

            // ── (H) HYSTERESE: Pendeln an der Kante schaltet nicht, gießt nicht ──
            // Guss-Zähler auf den EINEN Ofen-Chokepoint (kein Guss im Frame-Takt).
            const memo = A._tierOfenMemo;
            const memoVor = memo ? memo.size : -1;
            const saveOfen = r._ofenKreaturTemplate;
            let gussCalls = 0;
            r._ofenKreaturTemplate = function () {
                gussCalls++;
                return saveOfen.apply(this, arguments);
            };
            // Pendelbreite aus der WAHRHEIT abgeleitet (Verify-Ernte: hart kodierte
            // ±2 % urteilten über die Konstantenwahl statt über die Mechanik):
            // ±h/5 liegt für jedes legitime TIER_FERN_HYST tief im Band.
            const hyst = A.TIER_FERN_HYST;
            const bandTief = hyst / 5;
            tick(0.5 * fern); // definierter Start: nah
            const startNah = tb.wrap.visible === true;
            let flipsEng = 0;
            let prev = tb.wrap.visible;
            for (let k = 0; k < 40; k++) {
                tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
                if (tb.wrap.visible !== prev) flipsEng++;
                prev = tb.wrap.visible;
            }
            o.flipsEng = flipsEng;
            o.checks.hKeinFlackern = startNah && flipsEng === 0;
            // (H2, Verify-Ernte): dieselbe Eng-Pendelprobe aus dem FERN-Start —
            // echte Hysterese hält den letzten Zustand AUCH von fern kommend; eine
            // Regression auf EINE (verschobene) Kante bei (1+h) hielte die Nah-
            // Probe oben aus, flippte hier aber sofort zurück.
            tick(1.4 * fern);
            const startFern = !!tb.fern && tb.fern.visible === true;
            let flipsEngFern = 0;
            prev = tb.wrap.visible;
            for (let k = 0; k < 40; k++) {
                tick((k % 2 ? 1 + bandTief : 1 - bandTief) * fern);
                if (tb.wrap.visible !== prev) flipsEngFern++;
                prev = tb.wrap.visible;
            }
            o.flipsEngFern = flipsEngFern;
            o.checks.hKeinFlackernFern = startFern && flipsEngFern === 0 && !!tb.fern && tb.fern.visible === true;
            // Gegenprobe (nicht vakuös): WEIT über beide Kanten pendeln MUSS schalten.
            let flipsWeit = 0;
            prev = tb.wrap.visible;
            for (let k = 0; k < 10; k++) {
                tick((k % 2 ? 0.6 : 1.6) * fern);
                if (tb.wrap.visible !== prev) flipsWeit++;
                prev = tb.wrap.visible;
            }
            o.flipsWeit = flipsWeit;
            o.checks.hToggleLebt = flipsWeit >= 8;
            r._ofenKreaturTemplate = saveOfen; // restaurieren
            o.gussCalls = gussCalls;
            o.memoDelta = memo ? memo.size - memoVor : -1;
            o.checks.hKeinGuss = gussCalls === 0 && o.memoDelta === 0;
            r.removeCreature(c);

            // ── (D) DETERMINISMUS: Sim-Werte identisch mit/ohne Fern-Zweig ──
            // Ein Lauf = frischer Wolf + N freie Ticks (KEIN Pinnen — die Sim
            // läuft, wohin sie will). Gleiche Random-Seed-Folge, gleicher
            // aiFrame-/Uhr-Start; die einzige Differenz ist der Fern-Zweig.
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
                // IDENTITÄTS-PIN: das Charakter-Wandern hasht die netId — beide
                // Läufe müssen DENSELBEN Wolf spawnen (c7001), sonst misst die
                // Linse Identitäts- statt Fern-Differenzen. Ebenso die Echtzeit-
                // Stempel (task.since/bornAt) — die Sim soll uhr-frei vergleichen.
                s._creatureNetSeq = 7000;
                // Verify-Ernte: der Lauf spawnt im FERN-REGIME (1.4·Schwelle) —
                // bei 0.5·Schwelle wäre der Fern-Zweig in BEIDEN Läufen inert
                // (animDiv/Freeze/Toggle greifen erst jenseits der Kanten) und
                // die Spur trivial byte-gleich (teil-vakuöse Probe). 60 freie
                // Ticks driften max. ~4 m — das Regime bleibt jenseits (1−h).
                const cw = spawnWolf(1.4 * fern);
                if (!cw) return null;
                if (cw.userData.task) cw.userData.task.since = 0;
                cw.userData.bornAt = 0;
                if (ohneFern && cw.userData._tierBaum) {
                    cw.userData._tierBaum.fern = null; // der alte Zustand
                    cw.userData._tierBaum.wrap.visible = true;
                }
                const spur = [];
                let fernAktivTicks = 0;
                for (let k = 0; k < 60; k++) {
                    r.updateCreatures(0.02);
                    const tbw = cw.userData._tierBaum;
                    if (tbw && tbw.fern && tbw.fern.visible === true) fernAktivTicks++;
                    spur.push(
                        cw.position.x,
                        cw.position.y,
                        cw.position.z,
                        cw.rotation.y,
                        s.creatureEmotions[s.creatures.indexOf(cw)] === "happy" ? 1 : 0
                    );
                }
                r.removeCreature(cw);
                return { spur, fernAktivTicks };
            };
            const laufMit = lauf(false);
            const laufOhne = lauf(true);
            const spurMit = laufMit && laufMit.spur;
            const spurOhne = laufOhne && laufOhne.spur;
            // Regime-Beweis: im MIT-Lauf war der Fern-Zweig wirklich AKTIV (sonst
            // verglich die Probe zwei identisch-nahe Welten — nicht vakuös).
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

    console.log("\n===== TIER-FERN — Geometrie-Fernstufe der Kreaturen (gate:tier-fern) =====\n");
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
            `  Schwelle ${out.fernDist.toFixed(1)} m · Wolf SICHTBAR: nah ${out.nahMeshes} Meshes → fern ${out.fernMeshes} Meshes (alt-Zustand: ${out.sAltMeshes})\n`
        );
        check(c.fernGebaut, "(N) der Wolf trägt den lod1-Fern-Zweig (_tierBaum.fern)");
        check(c.nToggleNah, "(N) nah: der volle Gelenk-Baum sichtbar, das Standbild verdeckt");
        check(c.nToggleFern, "(N) fern: das Standbild sichtbar, der Gelenk-Baum verdeckt");
        check(c.nNahVoll, `(N) nah ist der volle Baum (${out.nahMeshes} Meshes > 40)`);
        check(c.nFernGrob, `(N) fern ist GROB (${out.fernMeshes} Meshes < 20)`);
        check(c.nFernKleiner, `(N) und << nah (${out.fernMeshes} < ${out.nahMeshes}/4)`);
        check(
            c.sLensFires,
            `SELBST-TEST (S): ohne Fern-Zweig erkennt die Linse den alten Zustand (${out.sAltMeshes} Meshes fern ≥ 20)`
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
            `(D) Sim-Spur BYTE-GLEICH mit/ohne Fern-Zweig (${out.dLen || 0} Werte${out.dDiffAt >= 0 ? `, erste Differenz @${out.dDiffAt}` : ""})`
        );
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — der Tier-Fern-Guss trägt (grob · hysterese-still · render-rein)" : "❌ ROT — die Tier-Fernstufe trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
