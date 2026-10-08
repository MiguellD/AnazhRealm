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
//      nah = jeder Frame · halbe Zone = 1/2 · viertel Zone = 1/4 · jenseits der
//      Stufen-Grenze (`ab` × Größe) = GAR NICHT. walkPhase/Uhr akkumulieren weiter —
//      der Gang bleibt gleich schnell, nur seltener ausgewertet.
//  (B) NEUTRALE STANCE: jenseits der Grenze friert der bauTier-Baum in der
//      Kern-STAND_POSE ein (kein Mid-Step-Gelenkwinkel über Schwelle) —
//      vorher fror er mitten im Schritt (harter Pop beim Wieder-Annähern).
//      Prämisse mitgemessen: VOR dem Freeze ist der Schritt messbar
//      mid-step (> Schwelle), sonst wäre die Linse trivial grün.
//  (C) DIE GROBSTUFE DES MENSCHEN: der lod≥1-Pfad des koerper-Gusses (bakeMenschInstance
//      fein — die gelenkige Grobstufe, S3) wird KONSUMIERT: _buildHumanGroup trägt
//      nah+fern (_gelenk), der EINE Stufen-Schalter (_gelenkStufe) schaltet an der
//      Grenze der Kern-Zeile (ab, hyst), und der ECHTE Peer-Tick (_p2pUpdatePeer)
//      konsumiert ihn. Mesh-/Vertex-Differenz gemessen.
//  (R) STARR-BINDUNG + KÖRPER-KUGEL (02.10.): der Ofen-Guss zieht je Material
//      EINEN Draw — kein starres Teil teilt Material/Schatten/Attribut-Satz mit
//      einem zweiten ungebundenen (vorher 35 Draws je Wolf); jede geskinnte
//      Hülle cullt (frustumCulled) gegen ihre Körper-Kugel, und die POSE-PROBE
//      (ein Wolf im Gang, 24 Takte, jede Hülle Vertex für Vertex in der Pose)
//      bleibt in der Kugel — kein Pop am Bildrand. (S3) Starr-Bindung gestubbt →
//      die Linse zählt die unverschmolzenen Teile.
//  (W) DER WERFER JE GESTALT (S3, Lehre 19): je Art und Mensch nah (10 m × Größe) und mittel (45 m × Größe) nach
//      dem echten Tick — Werfer = jedes Mesh mit castShadow, sichtbarer Kette und Ebenen in der Kaskaden-Maske. Soll
//      aus der Kern-Zeile: der Wurf-Teil der Grobstufe (`wurf.seh`, gezählt mit phyto-core budgetSippen über den
//      Ofen-Ausgang), Tier ≤ 6 200 / 1, Mensch ≤ 38 000 / 5, mittel wirft, nah wirft kein L0-Mesh; dazu die Absenz der
//      castShadow-Literale am Gelenk-Guss und der Wirts-Distanzen. (S5) Zwilling gestubbt → die L0 wirft wieder, rot.
//      (R) prüft dazu: die Grobstufe ist geskinnt und trägt die Knochen der L0 (EIN Skelett), im Gang in ihrer Kugel.
//  (F) DIE RUHE JENSEITS DER GRENZE (S3): beide Stufen tragen DIESELBEN Knochen — wo der Gang jenseits der Grenze ruht
//      (der Peer-Tick des Menschen, die Sicht-Kopie eines fremden Tiers), stehen sie in der Ruhe-Pose: der Mensch in der
//      seiner Vorlage (≤ 0,01 rad je Gelenk), das Tier in der Kern-STAND_POSE (≤ 0,02 rad), nie mitten im Schritt.
//      (S6) die Ruhe gestubbt → der ferne Mensch bleibt mitten im Schritt, rot.
//  (T) SCHMAL (W7): jeder Index über ≤ 65 535 Vertices trägt 16 bit (r184 weitete ihn auf 32, der Stamm hält ihn
//      schmal — `_backendGesetz`), jedes Haut-Gewicht unorm16 (Wolf · Mensch). (S4) die alten Formen gestubbt → die Linse
//      nennt die breiten Puffer.
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
// Port über KREATUR_KOSTEN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4447.
const PORT = Number(process.env.KREATUR_KOSTEN_PORT || 4447);
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
        // der Kommentar-Stripper der Absenz-Proben (Kommentare zitieren die gefallenen Namen)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
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
                "_gelenkStufe",
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
            // die Stufen-Grenze aus der Kern-Zeile (`ab` × Größe, S3) — dieselbe, die der Schalter liest
            const fern = window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * fL;
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
            o.checks.aHinter = counts.hinter === 0; // jenseits der Grenze: GAR nicht
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

            // ── (B) NEUTRALE STANCE: mid-step posieren → jenseits der Grenze einfrieren ──
            const probeS = probes.voll;
            const roles = r._motionRolesForSoul(probeS.userData.soul);
            // Gehen heißt WEG (Welle 5, das Gang-Gesetz): der Schritt-Schwung folgt der Lage-Änderung des Leibs — die
            // Probe läuft 20 Takte mit 1,6 m/s (ein einzelner Ruf ohne Weg steht).
            const schreite = (pr) => {
                const g0 = pr.userData._tierBaum._gang;
                let tS = (g0 ? g0.lastT : 0) + 1 / 30;
                for (let k = 0; k < 20; k++) {
                    pr.position.x += 1.6 / 30;
                    savedACM.call(r, pr, roles, tS, 1.3 + 0.17 * k, true, null);
                    tS += 1 / 30;
                }
            };
            probeS.userData._animFade = 1;
            schreite(probeS); // moving → Schritt-Schwung
            o.devMid = maxDev(probeS);
            o.checks.bMidStepPremise = Number.isFinite(o.devMid) && o.devMid > 0.05; // Prämisse: WAR mid-step
            // jenseits der Grenze pinnen + ticken → der Freeze-Pfad greift
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
            schreite(probeS); // wieder mid-step
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

            // ── (C) DIE GELENK-GESTALT DES MENSCHEN: die Grobstufe gebaut + am ECHTEN Peer-Tick über den EINEN Schalter ──
            const g = r._buildHumanGroup();
            const mf = g && g.userData && g.userData._gelenk;
            o.checks.cFernGebaut = !!(mf && mf.nah && mf.fern);
            // die Stufen eines Zustands: nah = die feine sichtbar, die Grobstufe nur in den Kaskaden; fern = umgekehrt
            const istNah = () =>
                mf.istFern === false &&
                mf.nah.visible === true &&
                mf.meshes.every((m) => !m.layers.isEnabled(0) && m.layers.isEnabled(A.SHADOW_TWIN_LAYER));
            const istFern = () =>
                mf.istFern === true && mf.nah.visible === false && mf.meshes.every((m) => m.layers.isEnabled(0));
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
                // der EINE Stufen-Schalter (Grenze `ab` aus der Kern-Zeile)
                r._gelenkStufe(g, mf.abM * mf.abM * 4);
                const t1 = istFern();
                r._gelenkStufe(g, 4);
                const t2 = istNah();
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
                o.checks.cPeerFern = istFern();
                entry.x = pm.x + 5;
                r._p2pUpdatePeer(entry, performance.now() / 1000, 0.016);
                o.checks.cPeerNah = istNah();
            }

            // ── (R) STARR-BINDUNG + KÖRPER-KUGEL ──
            const T3 = window.THREE;
            const recW = A.TETRAPODA_SOUL_MAP && A.TETRAPODA_SOUL_MAP.wolf;
            const starrZensus = (root) => {
                const z = { meshes: 0, skins: 0, unverschmolzen: 0, ungecullt: 0, ohneKugel: 0, breit: [] };
                const seen = new Set();
                root.traverse((n) => {
                    if (!n.isMesh || !n.geometry) return;
                    z.meshes++;
                    // (T) SCHMAL: ein Index über ≤ 65 535 Vertices trägt 16 bit, ein Haut-Gewicht unorm16
                    const gs = n.geometry;
                    const nV = gs.attributes.position ? gs.attributes.position.count : 0;
                    if (gs.index && nV <= 65535 && gs.index.array.BYTES_PER_ELEMENT !== 2)
                        z.breit.push(`Index ${gs.index.array.constructor.name} über ${nV} Vertices`);
                    const sw = gs.attributes.skinWeight;
                    if (sw && !(sw.array instanceof Uint16Array && sw.normalized === true))
                        z.breit.push(`Haut-Gewicht ${sw.array.constructor.name}${sw.normalized ? " normiert" : ""}`);
                    if (n.isSkinnedMesh) {
                        z.skins++;
                        if (n.frustumCulled === false) z.ungecullt++;
                        if (!n.boundingSphere) z.ohneKugel++;
                        return;
                    }
                    const g = n.geometry;
                    const sig = Object.keys(g.attributes)
                        .sort()
                        .map((k) => k + ":" + g.attributes[k].itemSize)
                        .join(",");
                    const key = (n.material && n.material.uuid) + "|" + (n.castShadow ? 1 : 0) + "|" + sig;
                    if (seen.has(key)) z.unverschmolzen++;
                    else seen.add(key);
                });
                return z;
            };
            const wolfT = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
            o.rWolf = wolfT ? starrZensus(wolfT.root) : null;
            const gM = r._buildHumanGroup();
            const mfM = gM && gM.userData && gM.userData._gelenk;
            o.rMensch = mfM && mfM.nah ? starrZensus(mfM.nah) : null;
            o.checks.rWolfStarr = !!o.rWolf && o.rWolf.unverschmolzen === 0 && o.rWolf.skins >= 2;
            o.checks.rMenschStarr = !!o.rMensch && o.rMensch.unverschmolzen === 0;
            o.checks.rKugel =
                !!o.rWolf &&
                !!o.rMensch &&
                o.rWolf.ungecullt + o.rWolf.ohneKugel + o.rMensch.ungecullt + o.rMensch.ohneKugel === 0;
            // POSE-PROBE: ein Wolf im Gang — jede sichtbare Hülle bleibt Vertex für Vertex in ihrer Kugel
            let raus = 0,
                geprueft = 0,
                maxUeber = 0;
            // DER ZWILLING TRÄGT DAS SKELETT DER NAHEN (S3): jedes Mesh der Grobstufe ist geskinnt, und seine Knochen SIND die
            // Knochen der L0 (Identität je Name) — EIN Skelett je Gestalt; im Gang bleibt auch er in seiner Kugel.
            const zw = { meshes: 0, geskinnt: 0, knochen: 0, fremd: 0, geprueft: 0 };
            const wp = spawnAt(6, 0);
            if (wp && wp.userData && wp.userData._tierBaum) {
                const v = new T3.Vector3();
                let l1Geo = null;
                wp.traverse((n) => {
                    for (const vl of n.__ofenVorlagen || [])
                        if (vl && vl.__ofen && String(vl.__ofen.key).split("|")[1] === "1") {
                            l1Geo = new Set();
                            vl.root.traverse((q) => {
                                if (q.isMesh && q.geometry) l1Geo.add(q.geometry);
                            });
                        }
                });
                const teileL0 = wp.userData._tierBaum.teile || {};
                wp.traverse((n) => {
                    if (!n.isMesh || !l1Geo || !l1Geo.has(n.geometry)) return;
                    zw.meshes++;
                    if (!n.isSkinnedMesh || !n.skeleton) return;
                    zw.geskinnt++;
                    for (const b of n.skeleton.bones) {
                        zw.knochen++;
                        if (teileL0[b.name] !== b) zw.fremd++;
                    }
                });
                for (let k = 0; k < 24; k++) {
                    wp.position.x += 1.6 * 0.07; // der Gang folgt dem Weg (1,6 m/s)
                    r._animateTierBaum(wp, k * 0.07, k * 0.35, true, null);
                    wp.updateMatrixWorld(true);
                    wp.traverse((n) => {
                        if (!n.isSkinnedMesh || !n.boundingSphere) return;
                        if (l1Geo && l1Geo.has(n.geometry)) zw.geprueft++;
                        const kugel = n.boundingSphere.clone().applyMatrix4(n.matrixWorld);
                        const pos = n.geometry.attributes.position;
                        for (let i = 0; i < pos.count; i += 3) {
                            n.getVertexPosition(i, v);
                            v.applyMatrix4(n.matrixWorld);
                            const d = v.distanceTo(kugel.center) - kugel.radius;
                            geprueft++;
                            if (d > 0) {
                                raus++;
                                if (d > maxUeber) maxUeber = d;
                            }
                        }
                    });
                }
                r.removeCreature(wp);
            }
            o.rPose = { geprueft, raus, maxUeber };
            o.checks.rPoseInKugel = geprueft > 1000 && raus === 0;
            o.rZwilling = zw;
            o.checks.rZwillingKnochen =
                zw.meshes > 0 && zw.geskinnt === zw.meshes && zw.knochen > 0 && zw.fremd === 0 && zw.geprueft > 0;
            // (S3) SELBST-TEST: ohne Starr-Bindung zählt die Linse die unverschmolzenen Teile
            const saveStarr = A._ofenStarrBinden;
            const saveMemo = A._tierOfenMemo;
            A._ofenStarrBinden = function () {};
            A._tierOfenMemo = new Map();
            const wolfRoh = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
            o.s3Roh = wolfRoh ? starrZensus(wolfRoh.root) : null;
            A._ofenStarrBinden = saveStarr; // restaurieren (Gate-Hook-Lehre)
            A._tierOfenMemo = saveMemo;
            o.checks.s3LensFires = !!o.s3Roh && o.s3Roh.unverschmolzen > 0;
            // (T) SCHMAL (W7): r184 weitet jeden 16-bit-Index auf 32 bit (der Stamm hält ihn schmal, `_backendGesetz`), die Foundry
            // lieferte Uint32-Indizes und float32-Haut-Gewichte — der Spieler trug 8 MB, 1,7 MB davon Breite ohne Gewinn.
            o.checks.tSchmal = !!o.rWolf && !!o.rMensch && o.rWolf.breit.length === 0 && o.rMensch.breit.length === 0;
            // (S4) SELBST-TEST: mit den alten Formen (Index wie geliefert, Gewicht float32) nennt die Linse die Breite
            const saveSchmal = A._indexSchmal;
            const saveGewicht = A._hautGewicht;
            A._indexSchmal = (arr) => arr;
            A._hautGewicht = (arr, is) =>
                new T3.BufferAttribute(arr instanceof Float32Array ? arr : Float32Array.from(arr), is || 4);
            A._tierOfenMemo = new Map();
            const wolfBreit = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
            o.s4Breit = wolfBreit ? starrZensus(wolfBreit.root).breit : null;
            A._indexSchmal = saveSchmal; // restaurieren (Gate-Hook-Lehre)
            A._hautGewicht = saveGewicht;
            A._tierOfenMemo = saveMemo;
            o.checks.s4LensFires = !!o.s4Breit && o.s4Breit.length > 0;

            // ── (W) DER WERFER JE GESTALT (S3, Lehre 19): die Kern-Zeile sagt, welche Stufe wirft (`schatten`) und welcher
            // Teil von ihr (`wurf.seh`). Gezählt wird, was die Kaskaden zeichnen: jedes Mesh der Gestalt mit castShadow, dessen
            // Kette sichtbar ist und dessen Ebenen die Kaskaden-Maske treffen (Layer 0 oder SHADOW_TWIN_LAYER) — nah (10 m ×
            // Größe) und mittel (45 m × Größe) nach dem ECHTEN Tick (updateCreatures, _p2pUpdatePeer). Das Soll des Wurf-Teils
            // rechnet phyto-core `budgetSippen` aus dem Ausgang des Ofens (`_ofenBudget`, Stufe 1, gefiltert nach `wurf.seh`).
            const T3W = T3;
            const PCW = window.__phytoCore;
            const maskeK = new T3W.Layers();
            maskeK.enable(A.SHADOW_TWIN_LAYER);
            const ketteSichtbar = (o, bis) => {
                for (let p = o; p; p = p.parent) {
                    if (p.visible === false) return false;
                    if (p === bis) return true;
                }
                return true;
            };
            const dreieckeVon = (geo) => (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3);
            const geoMenge = (root) => {
                const m = new Set();
                root.traverse((n) => {
                    if (n.isMesh && n.geometry) m.add(n.geometry);
                });
                return m;
            };
            // die Vorlagen eines Leibs (das Memo meldet sie am Leib an: `_ofenVorlagenBinden`) je Stufe
            const vorlagenVon = (gruppe) => {
                const je = {};
                gruppe.traverse((n) => {
                    for (const v of n.__ofenVorlagen || [])
                        if (v && v.__ofen && v.root) je[String(v.__ofen.key).split("|")[1]] = v;
                });
                return je;
            };
            const werferVon = (gruppe, l0, l1) => {
                const w = { tris: 0, draws: 0, l0: 0, l0Tris: 0, l1: 0, fremd: 0 };
                gruppe.traverse((n) => {
                    if (!n.isMesh || !n.geometry || n.castShadow !== true || !n.layers.test(maskeK)) return;
                    if (!ketteSichtbar(n, gruppe)) return;
                    const t = dreieckeVon(n.geometry);
                    w.tris += t;
                    w.draws++;
                    if (l0.has(n.geometry)) {
                        w.l0++;
                        w.l0Tris += t;
                    } else if (l1.has(n.geometry)) w.l1++;
                    else w.fremd++;
                });
                return w;
            };
            // Das Budget je Gestalt und Pass (Plan §3.5, Soll-Bild): der Zwilling ist der Wurf-Teil der Grobstufe.
            const WURF_SOLL = { kreatur: { draws: 1, tris: 6200 }, koerper: { draws: 5, tris: 38000 } };
            const budgetFang = new Map();
            const saveBudget = r._ofenBudget;
            const saveMemoW = A._tierOfenMemo;
            const saveFrustumW = r.isInFrustum;
            r._ofenBudget = function (core, kind, lod) {
                const aus = saveBudget.apply(this, arguments);
                budgetFang.set(kind + "|" + (lod | 0), aus);
                return aus;
            };
            r.isInFrustum = function () {
                return true; // der Stufen-Schalter läuft nur im Bild — für die Messung immer „im Bild"
            };
            A._tierOfenMemo = new Map(); // ein frischer Guss je Gestalt: der Ausgang des Ofens wird gefangen
            const wurfTeil = (core, kind) => {
                const B = core && core.PORTAL_RENDER_CONFIG && core.PORTAL_RENDER_CONFIG.lod.budget[kind];
                const z1 = B && B[1];
                const seh = z1 && z1.wurf && Array.isArray(z1.wurf.seh) ? z1.wurf.seh : null;
                const aus = budgetFang.get(kind + "|1");
                if (!seh || !aus) return { fehlt: !seh ? "wurf.seh fehlt an der Stufe 1" : "kein Ausgang der Stufe 1" };
                const teil = aus.filter((m) => m && m.position && m.mat && seh.indexOf(m.mat.seh) >= 0);
                return Object.assign({ seh }, PCW.budgetSippen(teil));
            };
            const urteil = (kind, B, stufe, w, soll) => {
                const st = B[stufe] && Number.isInteger(B[stufe].schatten) ? B[stufe].schatten : stufe;
                const zt = B[st] ? B[st].tris : 0;
                return (
                    w.draws > 0 &&
                    w.l0 === 0 &&
                    w.fremd === 0 &&
                    w.draws <= WURF_SOLL[kind].draws &&
                    w.tris <= WURF_SOLL[kind].tris &&
                    w.tris <= zt &&
                    !soll.fehlt &&
                    w.tris === soll.tris &&
                    w.draws <= soll.draws
                );
            };
            o.w = [];
            const tcW = window.__tetrapodaCore;
            const kcW = window.__koerperCore;
            const BT = tcW.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
            const BM = kcW.PORTAL_RENDER_CONFIG.lod.budget.koerper;
            const SM = A.TETRAPODA_SOUL_MAP || {};
            for (const art of ["wolf", "fox", "bear", "deer"]) {
                const seele = Object.keys(SM).find((k) => SM[k] === art);
                budgetFang.clear();
                const x0 = pm.x + 10,
                    hW = r.getTerrainHeightAt(x0, pm.z);
                const cw = seele
                    ? r.spawnCreatureAt(x0, (Number.isFinite(hW) ? hW : 0) + 1, pm.z, "happy", seele, {
                          precise: true,
                          bodySize: 1,
                      })
                    : null;
                if (!cw) {
                    o.w.push({ name: "tier:" + art, fehler: "Spawn fehlgeschlagen" });
                    continue;
                }
                const fLw = cw.scale.x || 1;
                const vl = vorlagenVon(cw);
                const l0 = vl["0"] ? geoMenge(vl["0"].root) : new Set();
                const l1 = vl["1"] ? geoMenge(vl["1"].root) : new Set();
                const tick = (d) => {
                    for (let k = 0; k < 3; k++) {
                        cw.position.x = pm.x + d;
                        cw.position.z = pm.z;
                        r.updateCreatures(0.02);
                    }
                    cw.position.x = pm.x + d;
                    cw.position.z = pm.z;
                    cw.updateMatrixWorld(true);
                };
                tick(10 * fLw);
                const nah = werferVon(cw, l0, l1);
                // (S5) SELBST-TEST: der Zwilling gestubbt — die nahe Stufe wirft wieder selbst (der alte Zustand)
                let s5 = null;
                if (art === "wolf") {
                    const gesichert = [];
                    cw.traverse((n) => {
                        if (n.isMesh && l0.has(n.geometry)) {
                            gesichert.push([n, n.castShadow]);
                            n.castShadow = n.userData.__klasse !== "fellSchale";
                        }
                    });
                    s5 = werferVon(cw, l0, l1);
                    for (const [n, c] of gesichert) n.castShadow = c; // restaurieren (Gate-Hook-Lehre)
                }
                tick(45 * fLw);
                const mittel = werferVon(cw, l0, l1);
                const soll = wurfTeil(tcW, "kreatur");
                o.w.push({
                    name: "tier:" + art,
                    nah,
                    mittel,
                    soll,
                    schatten1: BT[1] ? BT[1].schatten : null,
                    gruen: urteil("kreatur", BT, 0, nah, soll) && urteil("kreatur", BT, 1, mittel, soll),
                    nahGruen: urteil("kreatur", BT, 0, nah, soll),
                    s5Rot: s5 ? !urteil("kreatur", BT, 0, s5, soll) && s5.l0 > 0 : null,
                    s5,
                });
                r.removeCreature(cw);
            }
            {
                budgetFang.clear();
                const gW = r._buildHumanGroup();
                const vl = gW ? vorlagenVon(gW) : {};
                const l0 = vl["0"] ? geoMenge(vl["0"].root) : new Set();
                const l1 = vl["1"] ? geoMenge(vl["1"].root) : new Set();
                const peer = (d) => {
                    const e = {
                        mesh: gW,
                        x: pm.x + d,
                        y: pm.y + 1,
                        z: pm.z,
                        yaw: 0,
                        meshKind: "soul",
                        soulName: "human",
                        walkPhase: 0,
                        lastMovedAt: 0,
                    };
                    r._p2pUpdatePeer(e, performance.now() / 1000, 0.016);
                    gW.updateMatrixWorld(true);
                };
                if (gW) {
                    peer(10);
                    const nah = werferVon(gW, l0, l1);
                    peer(45);
                    const mittel = werferVon(gW, l0, l1);
                    const soll = wurfTeil(kcW, "koerper");
                    o.w.push({
                        name: "mensch",
                        nah,
                        mittel,
                        soll,
                        schatten1: BM[1] ? BM[1].schatten : null,
                        gruen: urteil("koerper", BM, 0, nah, soll) && urteil("koerper", BM, 1, mittel, soll),
                    });
                } else o.w.push({ name: "mensch", fehler: "kein Mensch-Guss" });
            }
            r._ofenBudget = saveBudget; // restaurieren (Gate-Hook-Lehre)
            r.isInFrustum = saveFrustumW;
            A._tierOfenMemo = saveMemoW;
            o.checks.wWerfer = o.w.length === 5 && o.w.every((x) => x.gruen === true);
            o.checks.s5LensFires = o.w.some((x) => x.s5Rot === true);
            // Absenz (window.__codeOf, Kommentare gestrippt): kein castShadow-Literal am Gelenk-Guss, kein Leser der Wirts-
            // Distanzen (die Gestalt liest `ab`/`hyst` aus ihrer Kern-Zeile).
            const codeW = window.__codeOf;
            const LIT = /castShadow\s*=\s*false/g;
            o.wLiterale = ["_buildCreatureGroup", "_buildHumanoidRig"].reduce(
                (n, k) => n + ((typeof r[k] === "function" ? codeW(r[k]) : "").match(LIT) || []).length,
                0
            );
            const DIST = /\b(?:TIER_FERN_DIST_SQ|TIER_FERN_HYST|MENSCH_FERN_DIST_SQ)\b/g;
            const distLeser = [];
            for (const ziel of [A.prototype, A]) {
                for (const k of Object.getOwnPropertyNames(ziel)) {
                    if (k === "constructor") continue; // die Klasse selbst ist kein Leser (ihr Text trüge jeden)
                    const d = Object.getOwnPropertyDescriptor(ziel, k);
                    for (const fn of [d && d.value, d && d.get]) {
                        if (typeof fn !== "function") continue;
                        const n = (codeW(fn).match(DIST) || []).length;
                        if (n) distLeser.push(k + "×" + n);
                    }
                }
            }
            o.wDistLeser = distLeser;
            o.wDistKonst = ["TIER_FERN_DIST_SQ", "TIER_FERN_HYST", "MENSCH_FERN_DIST_SQ"].filter((k) => k in A);
            o.checks.wAbsenz = o.wLiterale === 0 && distLeser.length === 0 && o.wDistKonst.length === 0;

            // ── (F) DIE RUHE JENSEITS DER GRENZE (S3): beide Stufen tragen DIESELBEN Knochen — wo der Gang jenseits der Grenze
            // ruht (der Peer-Tick des Menschen, die Sicht-Kopie eines fremden Tiers), stehen sie in der Ruhe-Pose, nie mitten
            // im Schritt (das Standbild der Basis stand in der Ruhe-Pose). Gemessen nach dem ECHTEN Tick: erst nah gehen
            // (Prämisse: mitten im Schritt), dann jenseits der Grenze ein Tick. Mensch gegen die Ruhe-Pose seiner Vorlage
            // (Winkel je Gelenk), Tier gegen die Kern-STAND_POSE (dieselbe Ketten-Wahrheit wie (B)). ──
            const ruheAbw = (nah, vorlage) => {
                const a = { rad: 0, gelenk: null };
                if (!nah || !vorlage || !vorlage.teile) return a;
                nah.traverse((n) => {
                    const q = n.name && vorlage.teile[n.name];
                    if (!q || !(n.isGroup || n.isBone)) return;
                    const w = n.quaternion.angleTo(q.quaternion);
                    if (w > a.rad) {
                        a.rad = w;
                        a.gelenk = n.name;
                    }
                });
                return a;
            };
            const peerF = (gF, eF, d, gehen) => {
                eF.x = pm.x + d;
                for (let k = 0; k < (gehen ? 30 : 1); k++) {
                    if (gehen) {
                        eF.x += 0.1; // 3 m/s im Takt 1/30 s — der Gang folgt dem Weg
                        eF.lastMovedAt = performance.now() / 1000;
                    }
                    r._p2pUpdatePeer(eF, performance.now() / 1000, 1 / 30);
                }
                gF.updateMatrixWorld(true);
            };
            const menschRuhe = () => {
                const gF = r._buildHumanGroup();
                const mfF = gF && gF.userData && gF.userData._gelenk;
                const vF = gF ? vorlagenVon(gF)["0"] : null;
                if (!mfF || !vF) return null;
                const eF = {
                    mesh: gF,
                    x: pm.x + 8,
                    y: pm.y + 1,
                    z: pm.z,
                    yaw: 0,
                    meshKind: "soul",
                    soulName: "human",
                    walkPhase: 0,
                    lastMovedAt: 0,
                };
                peerF(gF, eF, 8, true);
                const mitte = ruheAbw(mfF.nah, vF);
                peerF(gF, eF, 2.5 * mfF.abM, false);
                const fern = ruheAbw(mfF.nah, vF);
                return { mitte, fern, istFern: mfF.istFern === true };
            };
            o.fMensch = menschRuhe();
            // die Sicht-Kopie eines fremden Wolfs (der Peer-Strom, `_p2pTickRemoteCreatures`)
            const seeleF = Object.keys(SM).find((k) => SM[k] === "wolf");
            const kopieRuhe = () => {
                const mK = seeleF ? r._buildCreatureGroup(seeleF) : null;
                const glK = mK && mK.userData && mK.userData._gelenk;
                if (!glK) return null;
                const remote = s.p2p.remoteCreatures;
                const rcK = { mesh: mK, peerId: "__linseF" };
                remote.set("__linseF|1", rcK);
                const zuK = (d, gehen) => {
                    const t0K = performance.now() / 1000;
                    if (!gehen) {
                        mK.position.set(pm.x + d, pm.y, pm.z);
                        rcK.tx = pm.x + d;
                        rcK.tz = pm.z;
                        rcK.ty = pm.y;
                        r._p2pTickRemoteCreatures(t0K, 1 / 30);
                        return;
                    }
                    mK.position.set(pm.x + d, pm.y, pm.z);
                    for (let k = 0; k < 30; k++) {
                        rcK.tx = mK.position.x + 0.2; // der Sender läuft voraus — die Kopie zieht nach und geht
                        rcK.tz = pm.z;
                        rcK.ty = pm.y;
                        r._p2pTickRemoteCreatures(t0K + k / 30, 1 / 30);
                    }
                };
                zuK(6, true);
                const mitte = maxDev(mK);
                zuK(2.5 * glK.abM, false);
                const fern = maxDev(mK);
                const istFern = glK.istFern === true;
                remote.delete("__linseF|1");
                if (typeof r._disposeSoulGroup === "function") r._disposeSoulGroup(mK);
                return { mitte, fern, istFern };
            };
            o.fKopie = kopieRuhe();
            o.checks.fMenschPraemisse = !!o.fMensch && o.fMensch.mitte.rad > 0.05;
            o.checks.fMenschRuhe = !!o.fMensch && o.fMensch.istFern && o.fMensch.fern.rad <= 0.01;
            o.checks.fKopiePraemisse = !!o.fKopie && o.fKopie.mitte > 0.05;
            o.checks.fKopieRuhe = !!o.fKopie && o.fKopie.istFern && o.fKopie.fern <= 0.02;
            // (S6) SELBST-TEST: die Ruhe gestubbt — der ferne Mensch friert wieder mitten im Schritt
            const saveRuhe = r._gelenkRuhe;
            r._gelenkRuhe = function () {};
            o.s6 = menschRuhe();
            if (saveRuhe) r._gelenkRuhe = saveRuhe;
            else delete r._gelenkRuhe; // restaurieren (Gate-Hook-Lehre)
            o.checks.s6LensFires = !!o.s6 && o.s6.fern.rad > 0.05;

            o.creaturesAfter = s.creatures.length;
            return o;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== KREATUR-KOSTEN — Anim-Raten-LOD · neutrale Stance · Grobstufe · Werfer je Gestalt (gate:kreatur-kosten) =====\n"
    );
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
            `  (A) Anim-Auswertungen über 100 Ticks (Stufen-Grenze ${out.fernDist.toFixed(1)} m): nah ${out.counts.voll} · halb ${out.counts.halb} · viertel ${out.counts.viertel} · hinter ${out.counts.hinter}`
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
        check(c.aHinter, `(A) JENSEITS der Grenze: GAR keine Auswertung (${out.counts.hinter}/100)`);
        check(c.aFernOrdnung, "(A) und die Leiter ist monoton (fern wertet ≤ 1/2 der näheren Stufe aus)");
        check(c.aEingefroren, "(A) die Hinter-Kreatur trägt den Einfrier-Stempel (_animEingefroren)");
        check(
            c.s1LensFires,
            `SELBST-TEST (S1): Leiter gestubbt → hinter tickt voll (${out.s1Hinter}/20) — der Zähler misst die echte Leiter`
        );
        check(
            c.bMidStepPremise,
            `(B) PRÄMISSE: vor dem Freeze mid-step (${out.devMid && out.devMid.toFixed(3)} rad > 0.05)`
        );
        check(
            c.bNeutralStance,
            `(B) NEUTRALE STANCE: eingefroren auf Stand-Winkel (${out.devFrozen && out.devFrozen.toFixed(4)} rad < 0.02)`
        );
        check(c.bTailNeutral, "(B) und der Schwanz ruht (rotation.y ≈ 0)");
        check(c.bFrozen, "(B) der Freeze-Pfad lief (Stempel gesetzt)");
        check(
            c.s2LensFires,
            `SELBST-TEST (S2): Stance gestubbt → bleibt mid-step (${out.devStub && out.devStub.toFixed(3)} rad) — die Messung ist nicht blind`
        );
        if (out.rWolf)
            console.log(
                `  (R) Wolf-Guss ${out.rWolf.meshes} Meshes (${out.rWolf.skins} geskinnt, ${out.rWolf.unverschmolzen} unverschmolzen) · Mensch nah ${out.rMensch && out.rMensch.meshes} Meshes · ohne Starr-Bindung ${out.s3Roh && out.s3Roh.meshes} Meshes (${out.s3Roh && out.s3Roh.unverschmolzen} unverschmolzen) · Pose-Probe ${out.rPose.geprueft} Vertices, ${out.rPose.raus} außerhalb der Kugel\n`
            );
        check(
            c.rWolfStarr,
            "(R) Wolf: kein starres Teil zieht einen zweiten Draw für dasselbe Material (Starr-Bindung)"
        );
        check(c.rMenschStarr, "(R) Mensch: dasselbe für den nahen Körper");
        check(c.rKugel, "(R) jede geskinnte Hülle cullt gegen ihre Körper-Kugel (frustumCulled, boundingSphere)");
        check(
            c.rPoseInKugel,
            `(R) POSE-PROBE: der gehende Wolf bleibt in seinen Kugeln (${out.rPose && out.rPose.raus} von ${out.rPose && out.rPose.geprueft} außerhalb)`
        );
        check(
            c.s3LensFires,
            `SELBST-TEST (S3): Starr-Bindung gestubbt → ${out.s3Roh && out.s3Roh.unverschmolzen} unverschmolzene Teile gezählt`
        );
        check(
            c.tSchmal,
            `(T) SCHMAL: jeder Index über ≤ 65 535 Vertices trägt 16 bit, jedes Haut-Gewicht unorm16 (Wolf · Mensch) — ${
                [...((out.rWolf && out.rWolf.breit) || []), ...((out.rMensch && out.rMensch.breit) || [])]
                    .slice(0, 3)
                    .join(" · ") || "sauber"
            }`
        );
        check(
            c.s4LensFires,
            `SELBST-TEST (S4): die alten Formen → die Linse nennt ${out.s4Breit && out.s4Breit.length} breite Puffer (${(
                out.s4Breit || []
            )
                .slice(0, 2)
                .join(" · ")})`
        );
        check(
            c.rZwillingKnochen,
            `(R) ZWILLING: die Grobstufe ist geskinnt und trägt die Knochen der nahen (${out.rZwilling && out.rZwilling.geskinnt}/${out.rZwilling && out.rZwilling.meshes} geskinnt, ${out.rZwilling && out.rZwilling.fremd} fremde von ${out.rZwilling && out.rZwilling.knochen} Knochen) und bleibt im Gang in ihrer Kugel`
        );
        const fW = (w) => (w ? `${Math.round(w.tris).toLocaleString("de-DE")}/${w.draws}` : "?");
        for (const g of out.w || []) {
            if (g.fehler) {
                check(false, `(W) ${g.name}: ${g.fehler}`);
                continue;
            }
            const sollT =
                g.soll && !g.soll.fehlt ? `${fW(g.soll)} (seh ${g.soll.seh.join("+")})` : g.soll && g.soll.fehlt;
            const taeter =
                `${g.name} nah wirft ${fW(g.nah)}${g.nah.l0 ? ` (L0 ${fW({ tris: g.nah.l0Tris, draws: g.nah.l0 })})` : ""}` +
                `, mittel ${fW(g.mittel)}${g.mittel.draws === 0 && g.schatten1 === 1 ? " trotz schatten 1" : ""}`;
            check(g.gruen, `(W) ${taeter} — Soll Wurf-Teil der Grobstufe ${sollT}`);
        }
        if (out.w && out.w[0] && out.w[0].s5)
            check(
                c.s5LensFires,
                `SELBST-TEST (S5): Zwilling gestubbt → die nahe Stufe wirft wieder ${fW(out.w[0].s5)} (L0 ${out.w[0].s5.l0}) — rot an genau dieser Zeile`
            );
        check(
            c.wAbsenz,
            `(W) ABSENZ: castShadow-Literale am Gelenk-Guss ${out.wLiterale} · Leser der Wirts-Distanzen ${out.wDistLeser.length}${out.wDistLeser.length ? " (" + out.wDistLeser.join(", ") + ")" : ""} · Konstanten ${out.wDistKonst.length ? out.wDistKonst.join(", ") : "0"}`
        );
        check(c.cFernGebaut, "(C) der Mensch trägt die gelenkige Grobstufe (_gelenk nah+fern)");
        check(c.cVertexDiff, "(C) messbare Vertex-Differenz (fern < 80 % von nah)");
        check(c.cMeshDiff, "(C) weniger Meshes im Fern-Guss");
        check(c.cToggle, "(C) der EINE Stufen-Schalter (_gelenkStufe) schaltet nah↔fern an der Grenze der Kern-Zeile");
        check(c.cPeerFern, "(C) KONSUM: der echte Peer-Tick schaltet den fernen Menschen auf die Grobstufe (Layer 0)");
        check(c.cPeerNah, "(C) und zurück auf nah, wenn er herankommt (die Grobstufe nur in den Kaskaden)");
        const fR = (a) => (a ? `${a.rad.toFixed(3)} rad${a.gelenk ? " (" + a.gelenk + ")" : ""}` : "?");
        const fM = out.fMensch,
            fK = out.fKopie;
        check(
            c.fMenschPraemisse,
            `(F) PRÄMISSE: der gehende Mensch-Peer ist nah mitten im Schritt (${fM ? fR(fM.mitte) : "kein Peer"} > 0,05)`
        );
        check(
            c.fMenschRuhe,
            `(F) RUHE: der ferne Mensch-Peer (Grobstufe im Bild${fM && fM.istFern ? "" : " — FEHLT"}) steht in der Ruhe-Pose — ${fM ? fR(fM.fern) : "?"} ≤ 0,01`
        );
        check(
            c.fKopiePraemisse,
            `(F) PRÄMISSE: die gehende Sicht-Kopie eines Wolfs ist nah mitten im Schritt (${fK ? fK.mitte.toFixed(3) : "?"} rad > 0,05)`
        );
        check(
            c.fKopieRuhe,
            `(F) RUHE: die ferne Sicht-Kopie (Grobstufe${fK && fK.istFern ? "" : " — FEHLT"}) steht in der Kern-STAND_POSE — ${fK ? fK.fern.toFixed(3) : "?"} rad ≤ 0,02`
        );
        check(
            c.s6LensFires,
            `SELBST-TEST (S6): die Ruhe gestubbt → der ferne Mensch bleibt mitten im Schritt (${out.s6 ? fR(out.s6.fern) : "?"})`
        );
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die Kreatur kostet, was man von ihr sieht (Anim-Rate · Stand-Pose · Grobstufe KONSUMIERT · Starr-Bindung · Körper-Kugel · Werfer aus der Kern-Zeile · Ruhe jenseits der Grenze)" : "❌ ROT — die Kreatur-Kosten-Verdrahtung trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
