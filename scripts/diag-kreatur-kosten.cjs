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
//      DECKUNG: der Zwilling wirft den Umriss der feinen Stufe — je Gestalt Stand-Pose + drei Gang-Posen × vier Sonnen,
//      die Werfer-Ecken (getVertexPosition) entlang der Sonne auf 1 cm gerastert gegen den Umriss der feinen Stufe nach
//      dem Wurf-Gesetz des Ofens (alles ausser den Fell-Schalen); IoU ≥ 0,94 in jeder Lage, Täter = das Gelenk mit der
//      größten ungedeckten Fläche. (S7) der Zwilling 6 % zur Mitte gezogen → rot.
//  (F) DIE RUHE JENSEITS DER GRENZE (S3): beide Stufen tragen DIESELBEN Knochen — wo der Gang jenseits der Grenze ruht
//      (der Peer-Tick des Menschen, die Sicht-Kopie eines fremden Tiers), stehen sie in der Ruhe-Pose: der Mensch in der
//      seiner Vorlage (≤ 0,01 rad je Gelenk), das Tier in der Kern-STAND_POSE (≤ 0,02 rad), nie mitten im Schritt.
//      (S6) die Ruhe gestubbt → der ferne Mensch bleibt mitten im Schritt, rot.
//  (T) SCHMAL (W7): jeder Index über ≤ 65 535 Vertices trägt 16 bit (r184 weitete ihn auf 32, der Stamm hält ihn
//      schmal — `_backendGesetz`), jedes Haut-Gewicht unorm16 (Wolf · Mensch). (S4) die alten Formen gestubbt → die Linse
//      nennt die breiten Puffer.
//  (G) DER RUHENDE LEIB (K59, Gebot 7: Kosten an Schirm + Änderung): ein Tier außer Bild, jenseits der Nah-Gestalt und
//      ohne Zustand ruht (KREATUR_RUHE) — es geht jeden `takt`-ten Takt mit der gesammelten Zeit (die Summe der
//      Schritt-Zeiten = die Summe der Frames, auf 1e-9), und der Matrix-Gang der Szene steigt nicht in sein Skelett (0 Gänge
//      in ein angehängtes Kind). Ein Leser der Glieder (der Treffer) liest die JETZIGE Lage über `_leibMatrix`; das
//      Erwachen im Blick zieht den Leib vor jedem Szenen-Gang nach. Nah, im Stoß, zu schnell für `wegMax` und gefallen ruht
//      keiner. (S8) der Leser ohne Chokepoint verfehlt die Probe; (S9) das Erwachen ohne Nachziehen lässt das angehängte
//      Kind ohne Matrix — beide rot an genau dieser Zeile. Ein ruhender Leib ZEICHNET NIRGENDS (Prüfung K59-1): die
//      Nah-Gestalt (`_kzNah`, ihr Mesh wirft) ruht nie, sein Satz geht beim Ruhe-Beginn sofort aus, und der Blick des
//      Bilds (`_ruheImBild` in `_loopRender`) weckt ihn, wenn die Kamera nach dem Takt auf ihn dreht; im Band aiDiv 3
//      rechnet er die KI in jedem Schritt, in dessen Spanne ein KI-Takt fiel. (S10) der Feld-Besitz ohne Nah-Gestalt →
//      ruht mit sichtbarem Mesh; (S11) der Blick des Bilds gestubbt → ruht im Bild weiter.
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
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");

// Port über KREATUR_KOSTEN_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4447.
const PORT = Number(process.env.KREATUR_KOSTEN_PORT || 4447);
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
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
            // (K72: der Wurf ist die Ebene SHADOW_TWIN_LAYER — nah liegt kein Teil der Grobstufe auf Ebene 0, ihre werfenden
            // Teile liegen auf der Wurf-Ebene, und ist sie der Zwilling, wirft mindestens eins)
            const istNah = () =>
                mf.istFern === false &&
                mf.nah.visible === true &&
                mf.meshes.every((m) => !m.layers.isEnabled(0) && m.castShadow === m.layers.isEnabled(A.SHADOW_TWIN_LAYER)) &&
                (!mf.zwilling || mf.meshes.some((m) => m.layers.isEnabled(A.SHADOW_TWIN_LAYER)));
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
            // (W) DECKUNG — der Zwilling wirft den Umriss der feinen Stufe (das Spike-Soll, Lehre 18; Gegenprüfung S3: der
            // Wurf-Umriss der Grobstufe lag am Wolf 7 % unter dem der feinen, Lauf und Pfote fehlten). Je Gestalt in der
            // Stand-Pose und drei Gang-Posen (der echte Gang-Chokepoint), je Sonne (seitlich 25° und 45°, schräg 35°, hoch
            // 75°): der Umriss der Werfer, entlang der Sonne auf den Boden projiziert und auf 1 cm gerastert, gegen den
            // Umriss der feinen Stufe, wie sie vor S3 warf (ihre Teile nach dem Wurf-Gesetz des Ofens: alles ausser den
            // Fell-Schalen) — dieselben Knochen, dieselbe Pose (getVertexPosition: die Haut, wie der Renderer sie stellt).
            // Täter = das Gelenk, dessen Fläche der Zwilling nicht deckt.
            const DECKUNG_MIN = 0.94;
            const ZELLE_W = 0.01;
            const vW = new T3W.Vector3();
            const punkte = (meshes) =>
                meshes.map((m) => {
                    const g = m.geometry,
                        pos = g.attributes.position,
                        n = pos.count;
                    const P = new Float64Array(n * 3);
                    for (let i = 0; i < n; i++) {
                        m.getVertexPosition(i, vW);
                        vW.applyMatrix4(m.matrixWorld);
                        P[i * 3] = vW.x;
                        P[i * 3 + 1] = vW.y;
                        P[i * 3 + 2] = vW.z;
                    }
                    const si = g.attributes.skinIndex,
                        sw = g.attributes.skinWeight;
                    const knochen = (i) => {
                        if (!si || !m.skeleton) return m.name || "starr";
                        let b = 0,
                            bw = -1;
                        for (let k = 0; k < 4; k++) {
                            const w = sw.getComponent(i, k);
                            if (w > bw) {
                                bw = w;
                                b = si.getComponent(i, k);
                            }
                        }
                        const bn = m.skeleton.bones[b];
                        return bn ? bn.name : "?";
                    };
                    return { P, idx: g.index ? g.index.array : null, n, knochen };
                });
            const umriss = (sets, L, y0, box, mitTaeter) => {
                const nx = Math.ceil((box[2] - box[0]) / ZELLE_W),
                    nz = Math.ceil((box[3] - box[1]) / ZELLE_W);
                const M = new Uint8Array(nx * nz);
                const G = mitTaeter ? new Array(nx * nz) : null;
                const pr = (P, i) => {
                    const t = (P[i * 3 + 1] - y0) / L.y;
                    return [(P[i * 3] - L.x * t - box[0]) / ZELLE_W, (P[i * 3 + 2] - L.z * t - box[1]) / ZELLE_W];
                };
                for (const m of sets) {
                    const nT = m.idx ? m.idx.length / 3 : m.n / 3;
                    for (let t = 0; t < nT; t++) {
                        const i0 = m.idx ? m.idx[t * 3] : t * 3,
                            i1 = m.idx ? m.idx[t * 3 + 1] : t * 3 + 1,
                            i2 = m.idx ? m.idx[t * 3 + 2] : t * 3 + 2;
                        const a = pr(m.P, i0),
                            b = pr(m.P, i1),
                            c = pr(m.P, i2);
                        const d = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
                        if (Math.abs(d) < 1e-12) continue;
                        const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))),
                            x1 = Math.min(nx - 1, Math.ceil(Math.max(a[0], b[0], c[0]))),
                            z0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))),
                            z1 = Math.min(nz - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
                        let wer = null;
                        for (let z = z0; z <= z1; z++)
                            for (let x = x0; x <= x1; x++) {
                                const px = x + 0.5,
                                    pz = z + 0.5;
                                const w0 = ((b[0] - px) * (c[1] - pz) - (b[1] - pz) * (c[0] - px)) / d,
                                    w1 = ((c[0] - px) * (a[1] - pz) - (c[1] - pz) * (a[0] - px)) / d;
                                if (w0 < 0 || w1 < 0 || 1 - w0 - w1 < 0) continue;
                                const id = x + nx * z;
                                M[id] = 1;
                                if (G && !G[id]) G[id] = wer || (wer = m.knochen(i0));
                            }
                    }
                }
                return { M, G };
            };
            // je Pose die Punkte beider Sätze, je Sonne der Vergleich; schrumpf: der Selbst-Test zieht den Zwilling zur Mitte
            const deckungJe = (soll, ist, yaw, y0, schrumpf) => {
                const S = punkte(soll),
                    I = punkte(ist);
                if (schrumpf) {
                    let cx = 0,
                        cy = 0,
                        cz = 0,
                        n = 0;
                    for (const m of I)
                        for (let i = 0; i < m.n; i++) {
                            cx += m.P[i * 3];
                            cy += m.P[i * 3 + 1];
                            cz += m.P[i * 3 + 2];
                            n++;
                        }
                    for (const m of I)
                        for (let i = 0; i < m.n; i++) {
                            m.P[i * 3] = cx / n + (m.P[i * 3] - cx / n) * schrumpf;
                            m.P[i * 3 + 1] = cy / n + (m.P[i * 3 + 1] - cy / n) * schrumpf;
                            m.P[i * 3 + 2] = cz / n + (m.P[i * 3 + 2] - cz / n) * schrumpf;
                        }
                }
                const fx = Math.sin(yaw),
                    fz = Math.cos(yaw),
                    sx = Math.cos(yaw),
                    sz = -Math.sin(yaw);
                const sonne = (ax, az, grad) => {
                    const e = (grad * Math.PI) / 180,
                        l = Math.hypot(ax, az) || 1;
                    return new T3W.Vector3((ax / l) * Math.cos(e), Math.sin(e), (az / l) * Math.cos(e));
                };
                const SONNEN = {
                    seite25: sonne(sx, sz, 25),
                    seite45: sonne(sx, sz, 45),
                    schraeg35: sonne(sx + fx, sz + fz, 35),
                    hoch75: sonne(sx, sz, 75),
                };
                const out = [];
                for (const [name, L] of Object.entries(SONNEN)) {
                    const box = [1e9, 1e9, -1e9, -1e9];
                    for (const m of S.concat(I))
                        for (let i = 0; i < m.n; i++) {
                            const t = (m.P[i * 3 + 1] - y0) / L.y;
                            const gx = m.P[i * 3] - L.x * t,
                                gz = m.P[i * 3 + 2] - L.z * t;
                            if (gx < box[0]) box[0] = gx;
                            if (gz < box[1]) box[1] = gz;
                            if (gx > box[2]) box[2] = gx;
                            if (gz > box[3]) box[3] = gz;
                        }
                    box[0] -= 0.05;
                    box[1] -= 0.05;
                    box[2] += 0.05;
                    box[3] += 0.05;
                    const A = umriss(S, L, y0, box, true),
                        B = umriss(I, L, y0, box, false);
                    let ab = 0,
                        ao = 0,
                        bo = 0,
                        nA = 0,
                        nB = 0;
                    const taeter = {};
                    for (let i = 0; i < A.M.length; i++) {
                        if (A.M[i]) nA++;
                        if (B.M[i]) nB++;
                        if (A.M[i] && B.M[i]) ab++;
                        else if (A.M[i]) {
                            ao++;
                            taeter[A.G[i]] = (taeter[A.G[i]] || 0) + 1;
                        } else if (B.M[i]) bo++;
                    }
                    const top = Object.entries(taeter).sort((x, y) => y[1] - x[1])[0] || null;
                    out.push({
                        sonne: name,
                        iou: ab / Math.max(1, ab + ao + bo),
                        flaeche: nB / Math.max(1, nA) - 1,
                        top,
                    });
                }
                return out;
            };
            // die Werfer einer Gestalt (wie werferVon) und die Teile ihrer feinen Stufe nach dem Wurf-Gesetz des Ofens
            const werferMeshes = (gruppe) => {
                const w = [];
                gruppe.traverse((n) => {
                    if (
                        n.isMesh &&
                        n.geometry &&
                        n.castShadow === true &&
                        n.layers.test(maskeK) &&
                        ketteSichtbar(n, gruppe)
                    )
                        w.push(n);
                });
                return w;
            };
            const feineWerfer = (gruppe, l0) => {
                const w = [];
                gruppe.traverse((n) => {
                    const mt = n.material || {};
                    if (!n.isMesh || !l0.has(n.geometry) || n.userData.__klasse === "fellSchale") return;
                    if (mt.transparent && mt.opacity < 1) return;
                    w.push(n);
                });
                return w;
            };
            const deckungUrteil = (je) => {
                let schlecht = null;
                let summe = 0;
                for (const x of je) {
                    summe += x.iou;
                    if (!schlecht || x.iou < schlecht.iou) schlecht = x;
                }
                return { min: schlecht, mittel: summe / Math.max(1, je.length), n: je.length };
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
                // (W) DECKUNG: die Stand-Pose und drei Gang-Posen (der echte Gang-Chokepoint), dieselben Knochen
                const dk = [];
                const messW = (pose, schrumpf) => {
                    cw.updateMatrixWorld(true);
                    const je = deckungJe(feineWerfer(cw, l0), werferMeshes(cw), cw.rotation.y, 0, schrumpf);
                    if (!schrumpf) for (const x of je) dk.push(Object.assign({ pose }, x));
                    return je;
                };
                r._tierBaumNeutralStance(cw);
                messW("stand");
                for (let k = 0; k < 16; k++) {
                    cw.position.x += 0.112; // der Gang folgt dem Weg (1,6 m/s im Takt 0,07 s)
                    r._animateTierBaum(cw, k * 0.07, k * 0.35, true, null);
                    if (k === 7 || k === 11 || k === 15) messW("gang" + k);
                }
                // (S7) SELBST-TEST: der Zwilling 6 % zur Mitte gezogen — die Deckung fällt unter die Schwelle
                const s7 = art === "wolf" ? deckungUrteil(messW("s7", 0.94)) : null;
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
                    deckung: deckungUrteil(dk),
                    s7,
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
                    // (W) DECKUNG: die Ruhe des Nah-Peers und drei Gang-Posen am echten Peer-Tick (dieselben Knochen)
                    const dkM = [];
                    const messM = (pose) => {
                        gW.updateMatrixWorld(true);
                        for (const x of deckungJe(feineWerfer(gW, l0), werferMeshes(gW), gW.rotation.y, 0))
                            dkM.push(Object.assign({ pose }, x));
                    };
                    messM("stand");
                    const eM = {
                        mesh: gW,
                        x: pm.x + 10,
                        y: pm.y + 1,
                        z: pm.z,
                        yaw: 0,
                        meshKind: "soul",
                        soulName: "human",
                        walkPhase: 0,
                        lastMovedAt: 0,
                    };
                    for (let k = 0; k < 30; k++) {
                        eM.x += 0.1; // 3 m/s im Takt 1/30 s
                        eM.lastMovedAt = performance.now() / 1000;
                        r._p2pUpdatePeer(eM, performance.now() / 1000, 1 / 30);
                        if (k === 9 || k === 19 || k === 29) messM("gang" + k);
                    }
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
                        deckung: deckungUrteil(dkM),
                    });
                } else o.w.push({ name: "mensch", fehler: "kein Mensch-Guss" });
            }
            r._ofenBudget = saveBudget; // restaurieren (Gate-Hook-Lehre)
            r.isInFrustum = saveFrustumW;
            A._tierOfenMemo = saveMemoW;
            o.checks.wWerfer = o.w.length === 5 && o.w.every((x) => x.gruen === true);
            o.checks.s5LensFires = o.w.some((x) => x.s5Rot === true);
            o.deckungMin = DECKUNG_MIN;
            o.checks.wDeckung =
                o.w.length === 5 &&
                o.w.every((x) => x.deckung && x.deckung.n >= 16 && x.deckung.min.iou >= DECKUNG_MIN);
            const s7W = o.w.find((x) => x.s7);
            o.s7 = s7W ? s7W.s7 : null;
            o.checks.s7LensFires = !!o.s7 && o.s7.min.iou < DECKUNG_MIN;
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

            // ── (G) DER RUHENDE LEIB (K59, Gebot 7): außer Bild, fern, ohne Zustand → grober Takt, kein Matrix-Gang ──
            // Der Null-Renderer backt kein Feld (`_tickKreaturZiegel` schweigt headless): die Probe trägt den Bake-Versuch
            // (`_kzVersuch`) wie ein ferner Leib, dessen Feld steht. Der Frustum kommt wie im Loop aus `_loopFrustumCulling`;
            // der Matrix-Gang ist `scene.updateMatrixWorld()` wie im Render. Gezählt: volle Schritte (`_kreaturHuellenKontakt`
            // je Schritt), die Zeit der Schritte (`_kreaturLaufTakt` trägt das dt), die Gänge in ein angehängtes Kind.
            o.g = (() => {
                const T3 = window.THREE;
                const R = A.KREATUR_RUHE;
                if (!R || typeof r._tickKreaturRuhe !== "function")
                    return { fehler: "KREATUR_RUHE/_tickKreaturRuhe fehlt" };
                const cam = s.camera;
                const blick = (dx, dz) => {
                    cam.position.set(pm.x, pm.y + 2, pm.z);
                    cam.lookAt(pm.x + dx, pm.y + 2, pm.z + dz);
                    cam.updateMatrixWorld(true);
                };
                const g = { schritte: 0, zeit: 0, gaenge: 0 };
                const probe = spawnAt(-120, 0);
                if (!probe) return { fehler: "Spawn fehlgeschlagen" };
                const u = probe.userData;
                u._kzVersuch = true;
                const kind = new T3.Object3D();
                kind.position.set(0, 1, 0);
                const kindGang = kind.updateMatrixWorld;
                kind.updateMatrixWorld = function (f) {
                    g.gaenge++;
                    return kindGang.call(this, f);
                };
                probe.add(kind);
                const P = Object.getPrototypeOf(r);
                r._kreaturHuellenKontakt = function (c) {
                    if (c === probe) g.schritte++;
                    return P._kreaturHuellenKontakt.apply(this, arguments);
                };
                r._kreaturLaufTakt = function (c, dt) {
                    if (c === probe) g.zeit += dt;
                    return P._kreaturLaufTakt.apply(this, arguments);
                };
                const takt = (n, setze) => {
                    for (let k = 0; k < n; k++) {
                        if (setze) setze();
                        r._loopFrustumCulling();
                        r.updateCreatures(0.02);
                        s.scene.updateMatrixWorld();
                    }
                };
                const nullen = () => {
                    g.schritte = 0;
                    g.gaenge = 0;
                };
                const kindStimmt = () => {
                    const soll = new T3.Matrix4()
                        .compose(probe.position, probe.quaternion, probe.scale)
                        .multiply(kind.matrix);
                    let d = 0;
                    for (let k = 0; k < 16; k++)
                        d = Math.max(d, Math.abs(soll.elements[k] - kind.matrixWorld.elements[k]));
                    return d;
                };
                // der Leser an der ruhenden Probe: ein senkrechter Stab durch ihre JETZIGE Lage (`dz` m neben der des Ruhe-Beginns)
                const leserTrifft = (dz) => {
                    const p = probe.position;
                    p.z += dz;
                    const hit = r._kreaturGliedTreffer(probe, p.x, p.y - 1, p.z, p.x, p.y + 4, p.z, 0.4);
                    p.z -= dz;
                    return !!hit;
                };
                try {
                    // (G1) RUHT: 120 m hinter dem Blick — jeder `takt`-te Takt ein Schritt, die Zeit vollständig, kein Gang ins Kind
                    blick(1, 0);
                    takt(2);
                    nullen();
                    const t0 = g.zeit + (u._ruheDt || 0);
                    const NG = 40;
                    takt(NG);
                    g.g1 = {
                        ruht: u._ruht === true,
                        wurzel: Object.prototype.hasOwnProperty.call(probe, "updateMatrixWorld"),
                        schritte: g.schritte,
                        zeitFehler: Math.abs(g.zeit + (u._ruheDt || 0) - t0 - NG * 0.02),
                        gaenge: g.gaenge,
                    };
                    // (G2) DER LESER zieht nach: der Treffer an der ruhenden Probe liest ihre jetzige Lage
                    g.g2 = { trifft: leserTrifft(5) };
                    // (S8) SELBST-TEST: der Leser ruft die Wurzel direkt (ohne Chokepoint) → er liest die Lage des letzten
                    // Nachziehens (G2, +5 m) und verfehlt die Probe 5 m auf der anderen Seite
                    r._leibMatrix = function (c) {
                        c.updateMatrixWorld(true);
                    };
                    g.s8 = { trifft: leserTrifft(-5) };
                    delete r._leibMatrix;
                    // (G3) ERWACHT: der Blick wendet sich zur Probe — das Erwachen zieht den ganzen Leib nach, bevor ein
                    // Szenen-Gang läuft (das Kind steht an der jetzigen Lage); der erste Schritt trägt die gesammelte Zeit
                    blick(-1, 0);
                    r._loopFrustumCulling();
                    r._tickKreaturRuhe(0.02, pm);
                    g.g3 = {
                        wach: u._ruht === false,
                        wurzel: Object.prototype.hasOwnProperty.call(probe, "updateMatrixWorld"),
                        kindFehler: kindStimmt(),
                    };
                    nullen();
                    takt(4);
                    g.g3.schritte = g.schritte;
                    g.g3.zeitFehler = Math.abs(g.zeit + (u._ruheDt || 0) - t0 - (NG + 4) * 0.02);
                    // (S9) SELBST-TEST: das Erwachen ohne Nachziehen → das Kind trägt die Matrix des Ruhe-Beginns
                    blick(1, 0);
                    takt(3);
                    const wachOrig = r._kreaturErwacht;
                    r._kreaturErwacht = function (c) {
                        c.userData._ruht = false;
                        delete c.updateMatrixWorld;
                    };
                    const ruhte9 = u._ruht === true;
                    probe.position.z += 5;
                    blick(-1, 0);
                    r._loopFrustumCulling();
                    r._tickKreaturRuhe(0.02, pm);
                    g.s9 = { ruhteVorher: ruhte9, wach: u._ruht === false, kindFehler: kindStimmt() };
                    if (wachOrig === P._kreaturErwacht) delete r._kreaturErwacht;
                    else r._kreaturErwacht = wachOrig;
                    probe.position.z -= 5;
                    // (G4) NAH: 40 m hinter dem Blick (diesseits der Nah-Gestalt) — jeder Takt ein Schritt
                    blick(1, 0);
                    const nahX = -Math.min(40, A.KREATUR_NAH_MESH.aus - 10);
                    const pinNah = () => {
                        probe.position.x = pm.x + nahX;
                        probe.position.z = pm.z;
                    };
                    takt(2, pinNah);
                    nullen();
                    takt(12, pinNah);
                    g.g4 = { schritte: g.schritte, ruht: u._ruht === true };
                    // (G5) ZUSTAND: ein Leib im Stoß ruht nie, auch fern hinter dem Blick
                    probe.position.x = pm.x - 120;
                    u._stossV = { x: 0.1, z: 0 };
                    nullen();
                    takt(12);
                    g.g5 = { schritte: g.schritte, ruht: u._ruht === true };
                    delete u._stossV;
                    // (G6) WEG: ein Leib, dessen grober Schritt `wegMax` überschritte, geht voll
                    takt(3);
                    const ruhteVorher = u._ruht === true;
                    if (u._steuer) u._steuer.v = (1.5 * R.wegMax) / (R.takt * 0.02);
                    r._tickKreaturRuhe(0.02, pm);
                    g.g6 = { ruhteVorher, ruht: u._ruht === true };
                    // (G7) DER GEFALLENE ruht nie: ein ruhender Leib unter den Gefallenen erwacht
                    if (u._steuer) u._steuer.v = 0;
                    takt(3);
                    const ruhte7 = u._ruht === true;
                    const iW = s.creatures.indexOf(probe);
                    s.creatures.splice(iW, 1);
                    s.leichname.push(probe);
                    r._tickKreaturRuhe(0.02, pm);
                    g.g7 = { ruhteVorher: ruhte7, wach: u._ruht === false };
                    s.leichname.splice(s.leichname.indexOf(probe), 1);
                    s.creatures.splice(iW, 0, probe);
                    // (G8) DIE NAH-GESTALT ruht nie: ein Leib, dessen Mesh noch die Gestalt trägt (`_kzNah` — er kreuzte eben
                    // `aus` nach außen, der Ziegel schaltet erst in seinem Takt), zeichnet und wirft in die Kaskaden (bis
                    // 306 m) — ruhte er, stünde sein Werfer, wo die Ruhe begann (Prüfung K59-1: 10 m daneben, 1 Werfer statt 0)
                    const nahGestalt = () => {
                        if (u._ruht === true) r._kreaturErwacht(probe);
                        blick(1, 0);
                        let ruhte = 0;
                        u._kzNah = true;
                        takt(8, () => {
                            probe.position.x = pm.x - 120;
                            probe.position.z = pm.z;
                            if (u._ruht === true) ruhte++;
                        });
                        if (u._ruht === true) ruhte++;
                        delete u._kzNah;
                        return ruhte;
                    };
                    g.g8 = { ruhte: nahGestalt() };
                    // (S10) SELBST-TEST: der Besitz des Felds ohne die Nah-Gestalt (die Formel vor der Nachbesserung) → ruht
                    r._kzBesitztFeld = function (c) {
                        const v = c && c.userData;
                        return !!(v && (v._kzGlieder || v._kzVersuch));
                    };
                    g.s10 = { ruhte: nahGestalt() };
                    delete r._kzBesitztFeld;
                    // (G9) DAS FELD RUHT MIT: ein ruhender Leib zeichnet nirgends — sein Satz geht beim Ruhe-Beginn SOFORT aus
                    // (sonst stünde er, wo die Ruhe begann, und käme dieser Ort ins Bild, zeigte er den Leib dort)
                    if (u._ruht === true) r._kreaturErwacht(probe);
                    const H = { feld: -1, brick: { d: 1 } };
                    const feldBuch = [];
                    r._weltFeldAktiv = function (h, an, sofort) {
                        if (h === H) return void feldBuch.push({ an: !!an, sofort: !!sofort });
                        return P._weltFeldAktiv.apply(this, arguments);
                    };
                    u._kzGlieder = [{ handle: H, teil: probe }];
                    takt(6, () => {
                        probe.position.x = pm.x - 120;
                        probe.position.z = pm.z;
                    });
                    const letzt = feldBuch[feldBuch.length - 1];
                    g.g9 = { ruht: u._ruht === true, aus: !!letzt && !letzt.an && letzt.sofort, buch: feldBuch.length };
                    // (G10) DER BLICK DES BILDS weckt: die Kamera dreht nach dem Kreatur-Takt auf den ruhenden Leib (Teleport,
                    // Portal, ein Schwenk über den Rand, die Aufnahme) — der Render-Pfad (`_loopRender`) prüft den Blick DIESES
                    // Bilds und weckt ihn, bevor er zeichnet
                    const bildProbe = (stumm) => {
                        blick(1, 0);
                        takt(3, () => {
                            probe.position.x = pm.x - 120;
                            probe.position.z = pm.z;
                        });
                        const ruhteVorher = u._ruht === true;
                        let gerufen = 0;
                        const rib = r._ruheImBild;
                        r._ruheImBild = function () {
                            gerufen++;
                            if (!stumm && typeof rib === "function") return rib.apply(this, arguments);
                        };
                        blick(-1, 0);
                        let fehler = null;
                        try {
                            r._loopRender(performance.now());
                        } catch (e) {
                            fehler = String((e && e.message) || e).slice(0, 120);
                        }
                        delete r._ruheImBild;
                        return { ruhteVorher, ruht: u._ruht === true, gerufen, fehler };
                    };
                    g.g10 = bildProbe(false);
                    // (S11) SELBST-TEST: der Blick des Bilds gestubbt → der Leib ruht im Bild weiter
                    g.s11 = bildProbe(true);
                    delete r._weltFeldAktiv;
                    delete u._kzGlieder;
                    // (G11) DIE KI IM GROBEN TAKT: im Band aiDiv 3 (346–432 m) rechnet ein ruhender Leib die KI in jedem Schritt,
                    // in dessen Spanne ein KI-Takt fiel — bei Takt 4 in jedem (die Kadenz, nie die Entscheidung)
                    if (u._ruht === true) r._kreaturErwacht(probe);
                    blick(1, 0);
                    // gepinnt: die Lage und das Tempo (ein Wanderer beschleunigt über `wegMax` hinaus und ginge dann voll — (G6))
                    const pinFern = () => {
                        probe.position.x = pm.x - 400;
                        probe.position.z = pm.z;
                        if (u._steuer) u._steuer.v = Math.min(u._steuer.v, 1);
                    };
                    let ki = 0;
                    r._tickCreatureTaskDirection = function (c) {
                        if (c === probe) ki++;
                        return P._tickCreatureTaskDirection.apply(this, arguments);
                    };
                    takt(4, pinFern);
                    nullen();
                    ki = 0;
                    takt(24, pinFern);
                    g.g11 = { band: r._detailBand(400 / 43.2).aiDiv, ruht: u._ruht === true, schritte: g.schritte, ki };
                    delete r._tickCreatureTaskDirection;
                } finally {
                    delete r._kreaturHuellenKontakt;
                    delete r._kreaturLaufTakt;
                    delete r._leibMatrix;
                    delete r._kzBesitztFeld;
                    delete r._weltFeldAktiv;
                    delete r._ruheImBild;
                    delete r._tickCreatureTaskDirection;
                    delete u._kzGlieder;
                    delete u._kzNah;
                    if (u._ruht === true) r._kreaturErwacht(probe);
                    probe.remove(kind);
                    cleanup([probe]);
                }
                return g;
            })();
            {
                const G = o.g || {};
                const R = A.KREATUR_RUHE || {};
                o.checks.gRuht =
                    !!G.g1 &&
                    G.g1.ruht &&
                    G.g1.wurzel &&
                    G.g1.schritte >= 40 / R.takt - 1 &&
                    G.g1.schritte <= 40 / R.takt + 1 &&
                    G.g1.zeitFehler < 1e-9 &&
                    G.g1.gaenge === 0;
                o.checks.gLeser = !!G.g2 && G.g2.trifft;
                o.checks.s8LensFires = !!G.s8 && !G.s8.trifft;
                o.checks.gErwacht =
                    !!G.g3 &&
                    G.g3.wach &&
                    !G.g3.wurzel &&
                    G.g3.schritte === 4 &&
                    G.g3.kindFehler < 1e-6 &&
                    G.g3.zeitFehler < 1e-9;
                o.checks.s9LensFires = !!G.s9 && G.s9.ruhteVorher && G.s9.wach && G.s9.kindFehler > 1;
                o.checks.gNah = !!G.g4 && G.g4.schritte === 12 && !G.g4.ruht;
                o.checks.gZustand = !!G.g5 && G.g5.schritte === 12 && !G.g5.ruht;
                o.checks.gWeg = !!G.g6 && G.g6.ruhteVorher && !G.g6.ruht;
                o.checks.gGefallen = !!G.g7 && G.g7.ruhteVorher && G.g7.wach;
                o.checks.gNahGestalt = !!G.g8 && G.g8.ruhte === 0;
                o.checks.s10LensFires = !!G.s10 && G.s10.ruhte > 0;
                o.checks.gFeldRuht = !!G.g9 && G.g9.ruht && G.g9.aus;
                o.checks.gBildWeckt = !!G.g10 && G.g10.ruhteVorher && !G.g10.ruht && G.g10.gerufen > 0;
                o.checks.s11LensFires = !!G.s11 && G.s11.ruhteVorher && G.s11.ruht && G.s11.gerufen > 0;
                o.checks.gKi =
                    !!G.g11 && G.g11.band === 3 && G.g11.ruht && G.g11.schritte >= 5 && G.g11.ki === G.g11.schritte;
            }

            o.ruheTakt = A.KREATUR_RUHE && A.KREATUR_RUHE.takt;
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
        const fD = (d) =>
            d && d.min
                ? `IoU min ${d.min.iou.toFixed(3)} (${d.min.pose || "gang"}/${d.min.sonne}, Fläche ${(d.min.flaeche * 100).toFixed(1)} %${
                      d.min.top ? `, Täter ${d.min.top[0]} ${d.min.top[1]} cm²` : ""
                  }) · Mittel ${d.mittel.toFixed(3)} über ${d.n} Posen × Sonnen`
                : "?";
        for (const g of out.w || [])
            if (g.deckung)
                check(
                    !!g.deckung.min && g.deckung.n >= 16 && g.deckung.min.iou >= out.deckungMin,
                    `(W) DECKUNG ${g.name}: der Zwilling wirft den Umriss der feinen Stufe — ${fD(g.deckung)} ≥ ${out.deckungMin}`
                );
        if (out.s7)
            check(
                c.s7LensFires,
                `SELBST-TEST (S7): der Zwilling 6 % zur Mitte gezogen → ${fD(out.s7)} < ${out.deckungMin} — die Deckung ist nicht blind`
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
        const G = out.g || {};
        if (G.fehler) check(false, `(G) ${G.fehler}`);
        else {
            const g1 = G.g1 || {},
                g3 = G.g3 || {};
            check(
                c.gRuht,
                `(G) RUHT: 120 m hinter dem Blick geht der Leib ${g1.schritte} von 40 Takten (Takt 1/${out.ruheTakt}), die Zeit vollständig (Fehler ${g1.zeitFehler}), ${g1.gaenge} Matrix-Gänge ins angehängte Kind, eigene Wurzel ${g1.wurzel}`
            );
            check(
                c.gLeser,
                "(G) LESER: der Treffer an der ruhenden Probe liest ihre jetzige Lage (`_leibMatrix` zieht nach)"
            );
            check(
                c.s8LensFires,
                "SELBST-TEST (S8): der Leser ruft die ruhende Wurzel direkt → er liest die Lage des Ruhe-Beginns und verfehlt"
            );
            check(
                c.gErwacht,
                `(G) ERWACHT im Blick: die Wurzel fällt, das Kind steht vor jedem Szenen-Gang an der jetzigen Lage (Fehler ${g3.kindFehler}), danach ${g3.schritte}/4 Schritte, die Zeit vollständig (${g3.zeitFehler})`
            );
            check(
                c.s9LensFires,
                `SELBST-TEST (S9): das Erwachen ohne Nachziehen → das angehängte Kind bleibt ohne Matrix (Fehler ${G.s9 && G.s9.kindFehler})`
            );
            check(c.gNah, `(G) NAH (diesseits der Nah-Gestalt) ruht nie: ${G.g4 && G.g4.schritte}/12 Schritte`);
            check(c.gZustand, `(G) ZUSTAND: ein Leib im Stoß ruht nie: ${G.g5 && G.g5.schritte}/12 Schritte`);
            check(c.gWeg, "(G) WEG: ein Leib, dessen grober Schritt `wegMax` überschritte, geht voll");
            check(c.gGefallen, "(G) der Gefallene ruht nie (ein ruhender Leib unter den Gefallenen erwacht)");
            check(
                c.gNahGestalt,
                `(G) NAH-GESTALT: ein Leib, dessen Mesh die Gestalt trägt (\`_kzNah\`), ruht 120 m hinter dem Blick nie — ruhte ${G.g8 && G.g8.ruhte}/9 Takte (\`_kreaturRuht\` fragt \`_kzBesitztFeld\`; sonst wirft sein Mesh mit eingefrorener Matrix)`
            );
            check(
                c.s10LensFires,
                `SELBST-TEST (S10): der Feld-Besitz ohne Nah-Gestalt → der Leib ruht mit sichtbarem Mesh (${G.s10 && G.s10.ruhte}/9 Takte)`
            );
            check(
                c.gFeldRuht,
                `(G) FELD: der ruhende Leib zeichnet nirgends — sein Satz geht beim Ruhe-Beginn sofort aus (${G.g9 ? `ruht ${G.g9.ruht}, aus ${G.g9.aus}, ${G.g9.buch} Schalter` : "?"})`
            );
            check(
                c.gBildWeckt,
                `(G) BLICK DES BILDS: die Kamera dreht nach dem Kreatur-Takt auf den ruhenden Leib — \`_loopRender\` weckt ihn vor dem Zeichnen (\`_ruheImBild\` ${G.g10 ? `${G.g10.gerufen}× gerufen, ruht danach ${G.g10.ruht}${G.g10.fehler ? `, Fehler ${G.g10.fehler}` : ""}` : "?"})`
            );
            check(c.s11LensFires, "SELBST-TEST (S11): der Blick des Bilds gestubbt → der Leib ruht im Bild weiter");
            check(
                c.gKi,
                `(G) KI: im Band aiDiv ${G.g11 && G.g11.band} rechnet der ruhende Leib die KI in jedem Schritt, in dessen Spanne ein KI-Takt fiel (${G.g11 ? `${G.g11.ki} KI bei ${G.g11.schritte} Schritten, ruht ${G.g11.ruht}` : "?"})`
            );
        }
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die Kreatur kostet, was man von ihr sieht (Anim-Rate · Stand-Pose · Grobstufe KONSUMIERT · Starr-Bindung · Körper-Kugel · Werfer aus der Kern-Zeile · Ruhe jenseits der Grenze · der ruhende Leib außer Bild)" : "❌ ROT — die Kreatur-Kosten-Verdrahtung trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
