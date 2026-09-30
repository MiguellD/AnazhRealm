#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kreatur-kosten.cjs — DIE KREATUR KOSTET, WAS MAN VON IHR SIEHT
// (npm run gate:kreatur-kosten; Orakel-Synthese Tier-1 #2: „Konsum
// verdrahten, nicht neu bauen").
//
// Die Linse hält drei Konsum-Verdrahtungen am ECHTEN Chokepoint
// (updateCreatures / _p2pUpdatePeer), headless/Null-Renderer:
//
//  (A) ANIM-RATEN-LOD: die Auswertungs-Rate der Kreatur-Animation folgt der
//      Distanz (das aiDiv-Muster V17.115 U3, auf den Anim-Block gehoben).
//      Gezählt wird der ECHTE _animateCompoundMotion-KONSUM über N Ticks:
//      nah = jeder Frame · halbe Zone = 1/2 · viertel Zone = 1/4 · hinterm
//      Standbild-Toggle = GAR NICHT. walkPhase/Uhr akkumulieren weiter —
//      der Gang bleibt gleich schnell, nur seltener ausgewertet.
//  (B) NEUTRALE STANCE: hinterm Standbild friert der bauTier-Baum in der
//      Kern-STAND_POSE ein (kein Mid-Step-Gelenkwinkel über Schwelle) —
//      vorher fror er mitten im Schritt (harter Pop beim Wieder-Annähern).
//      Prämisse mitgemessen: VOR dem Freeze ist der Schritt messbar
//      mid-step (> Schwelle), sonst wäre die Linse trivial grün.
//  (C) MENSCH-FERN-GUSS: der lod≥1-Pfad des koerper-Gusses (bakeMenschInstance
//      fein — gemergte Fern-Gestalt) wird KONSUMIERT: _buildHumanGroup trägt
//      nah+fern, der EINE Toggle-Chokepoint (_menschFernToggle) schaltet am
//      Distanz-Band (MENSCH_FERN_DIST_SQ), und der ECHTE Peer-Tick
//      (_p2pUpdatePeer) konsumiert ihn. Mesh-/Vertex-Differenz gemessen.
//  (S) SELBST-TESTS (die Linse feuert): (S1) mit gestubbter Raten-Leiter
//      (_creatureAnimDiv ≡ 1) tickt auch die Hinter-Kreatur voll — der
//      Zähler misst die echte Leiter, nicht sich selbst. (S2) mit gestubbter
//      Neutral-Stance bleibt der Freeze mid-step — die Stance-Messung ist
//      nicht blind. Beide Stubs werden restauriert (Gate-Hook-Lehre).
//
// Determinismus-Disziplin: Proben werden nach JEDEM Tick auf ihre Distanz
// re-gepinnt (die Bänder sind exakt; Wander/Separation können nicht
// hinausdriften); Distanzen skalieren mit der ECHTEN Körpergröße
// (creature.scale.x — die Allometrie bleibt Wahrheit, nichts wird geraten).
//   node scripts/diag-kreatur-kosten.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4447;
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
            for (const fn of [
                "_creatureAnimDiv",
                "_creatureAnimFade",
                "_tierBaumNeutralStance",
                "_menschFernToggle",
                "_animateCompoundMotion",
                "_buildHumanGroup",
                "_p2pUpdatePeer",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            const core = window.__tetrapodaCore;
            if (!core || !Array.isArray(core.STAND_POSE)) return { error: "tetrapoda-Kern kalt (STAND_POSE fehlt)" };
            const SP = core.STAND_POSE;

            const saveMax = s.maxCreatures;
            s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 6);
            const spawnAt = (dx, dz) => {
                const x = pm.x + dx,
                    z = pm.z + dz;
                const h = r.getTerrainHeightAt(x, z);
                return r.spawnCreatureAt(x, (Number.isFinite(h) ? h : 0) + 1, z, "happy", "wesen", {
                    precise: true,
                    bodySize: 1,
                });
            };
            const cleanup = (list) => list.forEach((c) => c && r.removeCreature(c));
            // Gelenk-Abweichung von der Kern-STAND_POSE (Ketten-Ordnung =
            // _animateTierBaum — die EINE Ketten-Wahrheit des Baums).
            const maxDev = (c) => {
                const tb = c.userData && c.userData._tierBaum;
                if (!tb || !tb.teile) return null;
                const T = tb.teile;
                const ketten = [
                    [T.legFL, T.flU, T.flL, T.flP],
                    [T.legFR, T.frU, T.frL, T.frP],
                    [T.legHL, T.hlT, T.hlC, T.hlP],
                    [T.legHR, T.hrT, T.hrC, T.hrP],
                ];
                let dev = 0;
                for (let i = 0; i < 4; i++) {
                    for (let k = 0; k < 4; k++) {
                        if (!ketten[i][k]) continue;
                        dev = Math.max(dev, Math.abs(ketten[i][k].rotation.x - SP[i][k]));
                    }
                }
                return dev;
            };

            // ── (A) ANIM-RATEN-LOD: vier Proben, exakt in die Bänder gepinnt ──
            const p0 = spawnAt(30, 0); // Platzhalter-Position; das Pinnen setzt die Wahrheit
            if (!p0) return { error: "Spawn fehlgeschlagen" };
            const fL = p0.scale.x || 1;
            const fern = Math.sqrt(A.TIER_FERN_DIST_SQ) * fL;
            o.fernDist = fern;
            const dists = { voll: 0.4 * fern, halb: 0.6 * fern, viertel: 0.83 * fern, hinter: 1.25 * fern };
            const winkel = { voll: 0, halb: Math.PI / 2, viertel: Math.PI, hinter: -Math.PI / 2 };
            const probes = { voll: p0 };
            for (const tag of ["halb", "viertel", "hinter"]) {
                probes[tag] = spawnAt(dists[tag], 0);
                if (!probes[tag]) return { error: "Spawn (" + tag + ") fehlgeschlagen" };
            }
            const pin = () => {
                for (const tag of Object.keys(probes)) {
                    probes[tag].position.x = pm.x + Math.cos(winkel[tag]) * dists[tag];
                    probes[tag].position.z = pm.z + Math.sin(winkel[tag]) * dists[tag];
                }
            };
            for (const tag of Object.keys(probes)) probes[tag].userData._probeTag = tag;
            pin();
            const savedACM = r._animateCompoundMotion;
            let counts = { voll: 0, halb: 0, viertel: 0, hinter: 0 };
            r._animateCompoundMotion = function (group) {
                const tag = group && group.userData && group.userData._probeTag;
                if (tag) counts[tag]++;
                return savedACM.apply(this, arguments);
            };
            const N = 100;
            for (let k = 0; k < N; k++) {
                r.updateCreatures(0.02);
                pin();
            }
            o.counts = Object.assign({}, counts);
            o.checks.aVoll = counts.voll === N; // nah = JEDER Frame
            o.checks.aHalb = counts.halb <= N * 0.55 && counts.halb >= N * 0.4; // exakt 1/2 (Stagger-treu)
            o.checks.aViertel = counts.viertel <= N * 0.3 && counts.viertel >= N * 0.15; // exakt 1/4
            o.checks.aHinter = counts.hinter === 0; // hinterm Standbild: GAR nicht
            o.checks.aFernOrdnung = counts.halb <= counts.voll / 2 + 1 && counts.viertel <= counts.halb / 2 + 1;
            o.hinterEingefroren = probes.hinter.userData._animEingefroren === true;
            o.checks.aEingefroren = o.hinterEingefroren;

            // ── (S1) SELBST-TEST Zähl-Linse: Leiter gestubbt (≡ 1) → hinter tickt voll ──
            const savedDiv = r._creatureAnimDiv;
            r._creatureAnimDiv = function () {
                return 1;
            };
            counts = { voll: 0, halb: 0, viertel: 0, hinter: 0 };
            const NS = 20;
            for (let k = 0; k < NS; k++) {
                r.updateCreatures(0.02);
                pin();
            }
            r._creatureAnimDiv = savedDiv; // restaurieren (Gate-Hook-Lehre)
            o.s1Hinter = counts.hinter;
            o.checks.s1LensFires = counts.hinter === NS; // ohne Leiter tickt auch hinter voll

            // ── (B) NEUTRALE STANCE: mid-step posieren → hinterm Standbild einfrieren ──
            const probeS = probes.voll;
            const roles = r._motionRolesForSoul(probeS.userData.soul);
            probeS.userData._animFade = 1;
            savedACM.call(r, probeS, roles, 0.7, 1.3, true, null); // moving → Schritt-Schwung
            o.devMid = maxDev(probeS);
            o.checks.bMidStepPremise = Number.isFinite(o.devMid) && o.devMid > 0.05; // Prämisse: WAR mid-step
            // hinter das Standbild pinnen + ticken → der Freeze-Pfad greift
            probeS.userData._animEingefroren = false;
            dists.voll = 1.25 * fern;
            pin();
            for (let k = 0; k < 3; k++) {
                r.updateCreatures(0.02);
                pin();
            }
            o.devFrozen = maxDev(probeS);
            const tsS = probeS.userData._tierBaum.tailSegs || [];
            o.tailDev = tsS.reduce((m, seg) => Math.max(m, Math.abs(seg.rotation.y)), 0);
            o.checks.bNeutralStance = Number.isFinite(o.devFrozen) && o.devFrozen < 0.02; // Stand-Winkel, kein Mid-Step
            o.checks.bTailNeutral = o.tailDev < 0.02;
            o.checks.bFrozen = probeS.userData._animEingefroren === true;

            // ── (S2) SELBST-TEST Stance-Linse: Neutral-Stance gestubbt → bleibt mid-step ──
            dists.voll = 0.4 * fern;
            pin();
            r.updateCreatures(0.02); // aufwachen (div 1 → Anim läuft, Flag fällt)
            pin();
            probeS.userData._animFade = 1;
            savedACM.call(r, probeS, roles, 5.0, 2.9, true, null); // wieder mid-step
            const devRePose = maxDev(probeS);
            const savedNS = r._tierBaumNeutralStance;
            r._tierBaumNeutralStance = function () {};
            probeS.userData._animEingefroren = false;
            dists.voll = 1.25 * fern;
            pin();
            for (let k = 0; k < 2; k++) {
                r.updateCreatures(0.02);
                pin();
            }
            r._tierBaumNeutralStance = savedNS; // restaurieren (Gate-Hook-Lehre)
            o.devStub = maxDev(probeS);
            o.checks.s2LensFires = Number.isFinite(devRePose) && devRePose > 0.05 && o.devStub > 0.05;
            cleanup([probes.voll, probes.halb, probes.viertel, probes.hinter]);
            s.maxCreatures = saveMax;

            // ── (C) MENSCH-FERN-GUSS: lod1 gebaut + am ECHTEN Peer-Tick konsumiert ──
            const g = r._buildHumanGroup();
            const mf = g && g.userData && g.userData._menschFern;
            o.checks.cFernGebaut = !!(mf && mf.nah && mf.fern);
            if (mf && mf.nah && mf.fern) {
                const stat = (node) => {
                    let m = 0,
                        v = 0;
                    node.traverse((n) => {
                        if ((n.isMesh || n.isSkinnedMesh) && n.geometry) {
                            m++;
                            const p = n.geometry.attributes && n.geometry.attributes.position;
                            if (p) v += p.count;
                        }
                    });
                    return { m, v };
                };
                o.nahStat = stat(mf.nah);
                o.fernStat = stat(mf.fern);
                o.checks.cVertexDiff = o.fernStat.v > 0 && o.fernStat.v < o.nahStat.v * 0.8; // messbar leichter
                o.checks.cMeshDiff = o.fernStat.m < o.nahStat.m; // weniger Draws
                // der EINE Toggle-Chokepoint
                r._menschFernToggle(g, A.MENSCH_FERN_DIST_SQ * 4);
                const t1 = mf.fern.visible === true && mf.nah.visible === false;
                r._menschFernToggle(g, 4);
                const t2 = mf.nah.visible === true && mf.fern.visible === false;
                o.checks.cToggle = t1 && t2;
                // der ECHTE Konsument: _p2pUpdatePeer schaltet am Distanz-Band
                const entry = {
                    mesh: g,
                    x: pm.x + 80,
                    y: pm.y + 1,
                    z: pm.z,
                    yaw: 0,
                    meshKind: "soul",
                    soulName: "human",
                    walkPhase: 0,
                    lastMovedAt: 0,
                };
                r._p2pUpdatePeer(entry, performance.now() / 1000, 0.016);
                o.checks.cPeerFern = mf.fern.visible === true && mf.nah.visible === false;
                entry.x = pm.x + 5;
                r._p2pUpdatePeer(entry, performance.now() / 1000, 0.016);
                o.checks.cPeerNah = mf.nah.visible === true && mf.fern.visible === false;
            }

            o.creaturesAfter = s.creatures.length;
            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== KREATUR-KOSTEN — Anim-Raten-LOD · neutrale Stance · Mensch-Fern-Guss (gate:kreatur-kosten) =====\n");
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
            `  (A) Anim-Auswertungen über 100 Ticks (Standbild-Schwelle ${out.fernDist.toFixed(1)} m): nah ${out.counts.voll} · halb ${out.counts.halb} · viertel ${out.counts.viertel} · hinter ${out.counts.hinter}`
        );
        console.log(
            `  (B) Gelenk-Abweichung von STAND_POSE: mid-step ${out.devMid && out.devMid.toFixed(3)} rad → eingefroren ${out.devFrozen && out.devFrozen.toFixed(4)} rad (Schwanz ${out.tailDev && out.tailDev.toFixed(4)})`
        );
        if (out.nahStat)
            console.log(
                `  (C) Mensch-Gestalt: nah ${out.nahStat.m} Meshes/${out.nahStat.v} Verts vs. fern ${out.fernStat.m} Meshes/${out.fernStat.v} Verts\n`
            );
        check(c.aVoll, `(A) NAH voll: die nahe Kreatur wertet JEDEN Tick aus (${out.counts.voll}/100)`);
        check(c.aHalb, `(A) HALB-Zone: ~1/2 Rate (${out.counts.halb}/100)`);
        check(c.aViertel, `(A) VIERTEL-Zone: ~1/4 Rate (${out.counts.viertel}/100)`);
        check(c.aHinter, `(A) HINTERM Standbild: GAR keine Auswertung (${out.counts.hinter}/100)`);
        check(c.aFernOrdnung, "(A) und die Leiter ist monoton (fern wertet ≤ 1/2 der näheren Stufe aus)");
        check(c.aEingefroren, "(A) die Hinter-Kreatur trägt den Einfrier-Stempel (_animEingefroren)");
        check(c.s1LensFires, `SELBST-TEST (S1): Leiter gestubbt → hinter tickt voll (${out.s1Hinter}/20) — der Zähler misst die echte Leiter`);
        check(c.bMidStepPremise, `(B) PRÄMISSE: vor dem Freeze mid-step (${out.devMid && out.devMid.toFixed(3)} rad > 0.05)`);
        check(c.bNeutralStance, `(B) NEUTRALE STANCE: eingefroren auf Stand-Winkel (${out.devFrozen && out.devFrozen.toFixed(4)} rad < 0.02)`);
        check(c.bTailNeutral, "(B) und der Schwanz ruht (rotation.y ≈ 0)");
        check(c.bFrozen, "(B) der Freeze-Pfad lief (Stempel gesetzt)");
        check(c.s2LensFires, `SELBST-TEST (S2): Stance gestubbt → bleibt mid-step (${out.devStub && out.devStub.toFixed(3)} rad) — die Messung ist nicht blind`);
        check(c.cFernGebaut, "(C) der Mensch trägt den lod1-Fern-Guss (_menschFern nah+fern)");
        check(c.cVertexDiff, "(C) messbare Vertex-Differenz (fern < 80 % von nah)");
        check(c.cMeshDiff, "(C) weniger Meshes im Fern-Guss");
        check(c.cToggle, "(C) der EINE Toggle-Chokepoint schaltet nah↔fern am Distanz-Band");
        check(c.cPeerFern, "(C) KONSUM: der echte Peer-Tick schaltet den fernen Menschen auf den Fern-Guss");
        check(c.cPeerNah, "(C) und zurück auf nah, wenn er herankommt");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die Kreatur kostet, was man von ihr sieht (Anim-Rate · Stand-Pose · Mensch-Fern-Guss KONSUMIERT)" : "❌ ROT — die Kreatur-Kosten-Verdrahtung trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
