// diag-nervensystem-labs.cjs — DER ε-BEWEIS DER DREI MESHFREI-DOMÄNEN (Katalysator-
// Bogen W-A6/W-A7; Studio-Vertrag §8): klang · koerper · kreatur docken NUR über
// Daten an (Manifest-Zeilen + MESHFREI-Kerne; KEINE KIND_POLICY-Zeile — keine
// Katalog-Blueprints, die Rezepte erscheinen als Studio-Rezepte der Werkstatt).
//   S (statisch, Node): Manifest trägt klang/koerper/tetrapoda (ns-Kerne); die Kern-Form (MESHFREI=1,
//     kein buildInstance) prüft gate:daten-contract am Namensraum.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch trägt lofi/wolf/mensch
//     mit fx.klang/fx.motion · paramsByKind trägt klang/koerper/kreatur (W-A1-
//     Regler-Straße) · KEINE Auto-Blueprints dieser kinds (must-ignore am
//     Chokepoint) · die Studio-Rezepte-Liste der Werkstatt führt sie (sichtbar/
//     regelbar) · DER EINE AUDIO-KONSUMENT LEBT: _klangStudioPreset liest das
//     Genesis-lofi-Genre, _lofiChordDurationMs fährt das Studio-Tempo (78 bpm →
//     ~3077 ms) und liest ohne Rezept die Kern-GENRES-Tafel (fail-closed, 78 bpm).
//   --selftest: injizierte Verletzungen machen die statischen Gesetze rot.
//   node scripts/diag-nervensystem-labs.cjs [--selftest]
const { statikServer, ROOT: root, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");

const server = statikServer();

const { errs, check } = pruefer();

// ===== TEIL S: das Manifest trägt die drei MESHFREI-Kerne (die Kern-Form prüft gate:daten-contract am Namensraum) =====
function staticLaws(manifestSrc) {
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch {}
    for (const id of ["klang", "koerper", "tetrapoda"]) {
        const c = Array.isArray(manifest) ? manifest.find((x) => x && x.id === id) : null;
        out.push([
            `S1: das Manifest traegt den ${id}-Kern (ns-Zeile)`,
            !!c && Array.isArray(c.scripts) && typeof c.ns === "string" && c.ns.length > 0,
        ]);
    }
    return out;
}

hauptLauf(async () => {
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Labs-Linse feuert ===");
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "klang"));
        const s1 = staticLaws(brokenManifest).find((l) => l[0].includes("klang-Kern"));
        check("Selbst-Test 1: klang-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        selbsttestEnde(errs);
        process.exit(0);
    }

    console.log("=== ε-BEWEIS LABS (klang · koerper · kreatur) — TEIL S: das Manifest ===");
    for (const [name, ok, detail] of staticLaws(manifestSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 180000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = { b: {}, k: {}, w: {} };
        await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.lofi && f.recipes.wolf && f.recipes.mensch);
        // ===== B: das Buch traegt die drei Domänen als DATEN =====
        const lofi = f && f.recipes ? f.recipes.lofi : null;
        res.b.lofiKind = lofi && lofi.kind;
        res.b.lofiBpm = lofi && lofi.fx && lofi.fx.klang ? lofi.fx.klang.bpm : null;
        res.b.lofiScale = lofi && lofi.fx && lofi.fx.klang ? JSON.stringify(lofi.fx.klang.scale) : null;
        res.b.klangCount =
            f && f.recipes ? Object.keys(f.recipes).filter((k) => f.recipes[k].kind === "klang").length : 0;
        res.b.params =
            f && f.paramsByKind
                ? {
                      klang: Array.isArray(f.paramsByKind.klang) ? f.paramsByKind.klang.length : -1,
                      koerper: Array.isArray(f.paramsByKind.koerper) ? f.paramsByKind.koerper.length : -1,
                      kreatur: Array.isArray(f.paramsByKind.kreatur) ? f.paramsByKind.kreatur.length : -1,
                  }
                : null;
        // must-ignore am Chokepoint: KEINE Auto-Blueprints dieser kinds.
        // must-ignore-Probe an der HERKUNFTS-MARKE: ein Auto-Blueprint traegt
        // _foundryAutoSpecies (der Chokepoint stempelt sie) — KEINER darf auf ein
        // Rezept der drei MESHFREI-kinds zeigen (die pre-existierenden Avatar-
        // Koerper koerper_human/phoenix/dragon sind KEINE Auto-Blueprints).
        res.b.autoBpOffenders = [];
        for (const n in r.state.blueprints || {}) {
            const bp = r.state.blueprints[n];
            const src = bp && bp._foundryAutoSpecies;
            if (!src || !f.recipes || !f.recipes[src]) continue;
            const k = f.recipes[src].kind;
            if (k === "klang" || k === "koerper" || k === "kreatur") res.b.autoBpOffenders.push(n);
        }
        res.b.noAutoBps = res.b.autoBpOffenders.length === 0;
        // EINE Quelle: die Dial-Karten wohnen in den Gesetzbüchern, der Stamm reicht dieselben Objekte durch (kein Zwilling).
        const A = r.constructor;
        res.b.dialEins =
            A.KOERPER_DIAL_MAP === window.__koerperCore.DIAL_MAP &&
            A.TETRAPODA_DIAL_MAP === window.__tetrapodaCore.DIAL_MAP;
        // ===== K: DER EINE AUDIO-KONSUMENT (Lofi liest das Studio-Tempo) =====
        try {
            const emo = r.state.player.emotions;
            const s0 = emo.sorrow;
            emo.sorrow = 0;
            res.k.studio = r._klangStudioPreset() ? r._klangStudioPreset().bpm : null;
            res.k.durStudio = r._lofiChordDurationMs();
            // W-A7-VERTIEFUNG (Nachlese-Welle): die SKALA führt das Studio-Rezept —
            // der EINE skalen-bewusste Ton-Mapper faltet (mod Skalenlaenge + Oktave).
            res.k.scaleStudio = JSON.stringify(r._lofiActiveScale());
            res.k.semi2Studio = r._lofiScaleSemitone(2); // Blues: scale[2] = 5
            res.k.semi6Studio = r._lofiScaleSemitone(6); // 6-Ton-Skala: idx 6 = Oktav-Wurzel +12
            // die Akkord-BREITE folgt dem klang-Gesetz colorExt (Genre-DNA color,
            // EINE Quelle Lab+Welt): der Grund-Vierklang [0,5,7,12] + (colorExt−1) Terzen darüber.
            const _kc = globalThis.__klangCore;
            const _extSoll = () => {
                const sp = r._klangStudioPreset();
                return _kc && typeof _kc.colorExt === "function" ? _kc.colorExt(sp && sp.dna ? sp.dna.color : 0) : 1;
            };
            const _c0 = r._lofiChordFromDegree(0);
            res.k.chord0Studio = _c0.length === 3 + _extSoll() ? JSON.stringify(_c0.slice(0, 4)) : "len" + _c0.length;
            // Frequenz als ZAHL: der 2. Akkord-Ton (Halbton 5 ueber A2=110) = 110*2^(5/12).
            res.k.freq1Studio = r._lofiChordFreqs(r._lofiChordFromDegree(0), false)[1];
            // Rezept kurz VERSTECKEN (Sicherung + Wiederherstellung — die Gate-Hook-Disziplin):
            const prev = f.recipes.lofi;
            delete f.recipes.lofi;
            res.k.durFallback = r._lofiChordDurationMs();
            // Tests wandern 19.07. (ZWILLINGS-ABSCHIED): ohne Rezept antwortet
            // der KERN (Blues-Skala aus scaleFor/SCALES) — die LOFI_SCALE-
            // Konstante ist gefallen.
            res.k.scaleFallbackKern = JSON.stringify(r._lofiActiveScale()) === "[0,3,5,6,7,10]";
            res.k.semi2Fallback = r._lofiScaleSemitone(2); // A-Moll: 3
            const _c0f = r._lofiChordFromDegree(0);
            res.k.chord0Fallback =
                _c0f.length === 3 + _extSoll() ? JSON.stringify(_c0f.slice(0, 4)) : "len" + _c0f.length;
            f.recipes.lofi = prev;
            res.k.durRestored = r._lofiChordDurationMs();
            res.k.semi2Restored = r._lofiScaleSemitone(2);
            emo.sorrow = s0;
        } catch (e) {
            res.k.err = (e && e.message) || String(e);
        }
        // ===== M: DER MOTION-ERSTKONSUMENT (die Schwanz-Rolle liest fx.motion) =====
        try {
            res.m = {};
            const pi = r._motionStudioProfile(false); // idle
            const pm = r._motionStudioProfile(true); // moving -> joy (MOTION_PROFILE_MAP)
            res.m.idle = pi ? { tailRate: pi.tailRate, tailAmp: pi.tailAmp } : null;
            res.m.moving = pm ? { tailRate: pm.tailRate, tailAmp: pm.tailAmp } : null;
            // KONSUM (Verhaltens-Zahl): eine synthetische Schwanz-Rolle durch den EINEN
            // Animator — mit Studio-Profil sin(t*0.5)*0.10, byte-alt sin(t*2.2)*0.28.
            const mkGroup = () => ({
                children: [{ rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } }],
                userData: {},
            });
            const roles = [{ role: "schwanz", phase: 0 }];
            const g1 = mkGroup();
            r._animateCompoundMotion(g1, roles, 1, 0, false);
            res.m.tailStudio = g1.children[0].rotation.y;
            const prevWolf = f.recipes.wolf;
            delete f.recipes.wolf;
            const g2 = mkGroup();
            r._animateCompoundMotion(g2, roles, 1, 0, false);
            res.m.tailFallback = g2.children[0].rotation.y;
            f.recipes.wolf = prevWolf;
            const g3 = mkGroup();
            r._animateCompoundMotion(g3, roles, 1, 0, false);
            res.m.tailRestored = g3.children[0].rotation.y;
            // KONSUM am lebenden Symbol: der Animator RUFT den Studio-Leser (Spion, die Zahl allein beweist ihn nicht).
            const msp = r._motionStudioProfile;
            res.m.consumes = 0;
            r._motionStudioProfile = (...a) => (res.m.consumes++, msp.apply(r, a));
            r._animateCompoundMotion(mkGroup(), roles, 1, 0, false);
            delete r._motionStudioProfile;
        } catch (e) {
            res.m = res.m || {};
            res.m.err = (e && e.message) || String(e);
        }
        // ===== D: DER KOERPER-DOCK (Abschieds-Welle A — Dials formen GEOMETRIE) =====
        try {
            res.d = {};
            // A1 AVATAR: die Dial-Quelle lebt + der Boot-Avatar traegt den Studio-Stempel
            // (der Ingest-Chokepoint goss nach, falls er vor der Buch-Ankunft baute).
            const dials = r._koerperStudioDials();
            res.d.dials = dials
                ? { height: dials.height, mass: dials.mass, tone: dials.tone, gender: dials.gender }
                : null;
            const pmStamp = r.state.playerMesh && r.state.playerMesh.userData._koerperDials;
            res.d.playerStamped = !!pmStamp;
            res.d.playerBuild = pmStamp ? pmStamp.build : null; // Studio mass 0.35 (Host-Konstante war 0.52)
            // KONSUM als ZAHL: height-Dial 1.15 -> Rig-Hoehe x1.15 (Boundingbox).
            const bboxH = (g) => {
                g.updateMatrixWorld(true);
                const b = new THREE.Box3().setFromObject(g);
                return b.max.y - b.min.y;
            };
            const g0 = r._buildHumanGroup();
            const h0 = bboxH(g0);
            r._disposeSoulGroup(g0);
            const prevH = f.recipes.mensch.s.height;
            f.recipes.mensch.s.height = 1.15;
            const g1 = r._buildHumanGroup();
            const h1 = bboxH(g1);
            r._disposeSoulGroup(g1);
            f.recipes.mensch.s.height = prevH;
            res.d.h0 = h0;
            res.d.h1 = h1;
            res.d.heightConsumed = h0 > 0 && Math.abs(h1 / h0 - 1.15) < 0.03;
            // fail-soft: Rezept versteckt -> Stempel null (byte-alt Konstanten-Bau).
            const prevRec = f.recipes.mensch;
            delete f.recipes.mensch;
            const g2 = r._buildHumanGroup();
            res.d.hiddenStamp = g2.userData._koerperDials === null;
            r._disposeSoulGroup(g2);
            f.recipes.mensch = prevRec;
            // A2 KREATUR (wesen <-> tetrapoda deer): der Studio-Guss lebt + ist tag-neutral.
            const frozen = r.constructor.CREATURE_SOULS.wesen.bodyParts;
            const eff = r._tetrapodaSoulParts("wesen");
            res.d.wesenDocked = !!eff && eff.length === frozen.length;
            res.d.wesenTagNeutral =
                !!eff &&
                JSON.stringify(r.computeCompoundTags({ parts: eff })) ===
                    JSON.stringify(r.computeCompoundTags({ parts: frozen }));
            // KONSUM als ZAHL: leg-Dial 0.22 -> 0.35 => legFrac 0.6 -> 0.75 => laengere
            // Beine schieben den Boden (groundY = belly - legLen) messbar TIEFER —
            // der tiefste Part-Anker (die Fuesse) sinkt.
            const lowY = (ps) =>
                Math.min.apply(
                    null,
                    ps.map((p) => (p && p.position ? p.position.y : 1e9))
                );
            const prevLeg = f.recipes.deer.s.leg;
            f.recipes.deer.s.leg = 0.35;
            const eff2 = r._tetrapodaSoulParts("wesen");
            f.recipes.deer.s.leg = prevLeg;
            res.d.legBase = eff ? lowY(eff) : 1e9;
            res.d.legLong = eff2 ? lowY(eff2) : 1e9;
            res.d.legConsumed = !!eff && !!eff2 && res.d.legLong < res.d.legBase - 0.03;
            // fail-soft: Rezept versteckt -> der Bau faellt byte-alt auf die frozen
            // Modul-bodyParts (dieselbe Referenz am Gruppen-Stempel).
            const prevDeer = f.recipes.deer;
            delete f.recipes.deer;
            const cg = r._buildCreatureGroup("wesen");
            res.d.wesenFallback = !!cg && cg.userData._soulParts === frozen;
            f.recipes.deer = prevDeer;
            const cg2 = r._buildCreatureGroup("wesen");
            res.d.wesenStudioBuild = !!cg2 && cg2.userData._soulParts !== frozen;
            if (cg && r._disposeSoulGroup) r._disposeSoulGroup(cg);
            if (cg2 && r._disposeSoulGroup) r._disposeSoulGroup(cg2);
        } catch (e) {
            res.d = res.d || {};
            res.d.err = (e && e.message) || String(e);
        }
        // ===== X: DIE AUSLÖSCHUNGS-GÜSSE (A5 — Wächter/Holzross/Glutwesen aus den Studio-Straßen) =====
        try {
            res.x = {};
            // (X1/NULL) wolf ↔ tetrapoda-wolf: der Guss dockt, Dials wirken, Tags BYTE-GLEICH
            const frozenG = r.constructor.CREATURE_SOULS.wolf.bodyParts;
            const effG = r._tetrapodaSoulParts("wolf");
            res.x.glutDocked = !!effG && effG.length === frozenG.length;
            res.x.glutDialsWirken = !!effG && JSON.stringify(effG) !== JSON.stringify(frozenG);
            res.x.glutTagNeutral =
                !!effG &&
                JSON.stringify(r.computeCompoundTags({ parts: effG })) ===
                    JSON.stringify(r.computeCompoundTags({ parts: frozenG }));
            // KONSUM als ZAHL: neck-Dial 0.263 -> 0.15 verkuerzt den Hals — der hoechste
            // Part-Anker (Kopf) sinkt messbar.
            const hiY = (ps) =>
                Math.max.apply(
                    null,
                    ps.map((q) => (q && q.position ? q.position.y : -1e9))
                );
            const prevNeck = f.recipes.wolf.s.neck;
            f.recipes.wolf.s.neck = 0.15;
            const effG2 = r._tetrapodaSoulParts("wolf");
            f.recipes.wolf.s.neck = prevNeck;
            res.x.glutNeckConsumed = !!effG && !!effG2 && hiY(effG2) < hiY(effG) - 0.01;
            // (X2/HERZ) DER MENSCH-KÖRPER aus dem Landmark-Guss: koerper_human ist
            // body-shaped + Rolle soul; das Landmark-GESETZ wohnt im koerper-core
            // (der Stamm-Delegat und der Kern liefern DENSELBEN Guss — eine Quelle).
            const wb = r.state.blueprints.koerper_human;
            res.x.waechterParts = wb && wb.parts ? wb.parts.length : 0;
            res.x.waechterBody = !!wb && r._isBodyShaped(wb) === true;
            res.x.waechterRole = wb ? r.computeBlueprintRole(wb) : null;
            res.x.waechterTags = wb ? JSON.stringify(r.computeCompoundTags({ parts: wb.parts })) : "";
            res.x.humanDefTags = JSON.stringify(r.computeSoulCompoundTags(r.playerSoulDefs.human) || {});
            res.x.waechterGussLiest = (() => {
                try {
                    // PIPE-VOLLENDUNG: der Mensch fährt durch die Foundry — der
                    // Stamm-Rig KONSUMIERT den Mensch-Ofen (_ofenMenschTemplate), der über
                    // den Bäcker-Tisch (BAKERS_BY_KIND.koerper → bauMensch+morphAuf im
                    // Bäcker) gießt. Die Identitäts-Wahrheit: Kern trägt das Gesetz, der
                    // Tisch trägt die koerper-Zeile, der Rig liest den Ofen — und der
                    // 8-KH-Atlas bleibt gefallen.
                    const core = window.__koerperCore;
                    if (!core || typeof core.bauMensch !== "function" || typeof core.morphAuf !== "function")
                        return "err:kern fehlt";
                    const tisch = typeof BAKERS_BY_KIND !== "undefined" && typeof BAKERS_BY_KIND.koerper === "function";
                    return tisch && window.__fehlt(r._buildHumanoidRig, /humanSkeleton/);
                } catch (_e2) {
                    return "err:" + _e2.message;
                }
            })();
            // (X3) DAS HOLZROSS aus dem Skelett-Guss: Skelett-Partzahl, Antrieb, Rolle,
            // Sitz + Tags WERT-GLEICH zur gemünzten Alt-Identität (sortiert — die
            // Schluessel-REIHENFOLGE wandert mit der Part-Reihenfolge, die WERTE nie).
            const hb = r.state.blueprints.reittier_holzross;
            const tagSorted = (ps) => {
                const t = r.computeCompoundTags({ parts: ps });
                return JSON.stringify(
                    Object.keys(t)
                        .sort()
                        .map((k) => [k, t[k]])
                );
            };
            res.x.holzrossParts = hb && hb.parts ? hb.parts.length : 0;
            res.x.holzrossMoveable = !!hb && r._isMoveable(hb) === true;
            res.x.holzrossRole = hb ? r.computeBlueprintRole(hb) : null;
            res.x.holzrossSitz = !!hb && JSON.stringify(hb.connections) === '[{"type":"sitz","partA":0,"partB":-1}]';
            res.x.holzrossTags = hb ? tagSorted(hb.parts) : "";
            res.x.holzrossKern = !!hb && hb.parts[hb.parts.length - 1].material === "quarz";
        } catch (e) {
            res.x = res.x || {};
            res.x.err = (e && e.message) || String(e);
        }
        // ===== E: DIE EMOTIONS->PROFIL-BRUECKE (Abschieds-Welle B — beide Leser) =====
        try {
            res.e = {};
            res.e.fleeName = r._motionProfileName(true, { chaos: 1 }, "kreatur"); // flee
            res.e.sadName = r._motionProfileName(false, { sorrow: 0.8 }, "koerper"); // sad
            res.e.defName = r._motionProfileName(true, null, "kreatur"); // joy (byte-alt Default)
            // Kreatur-ZAHL: Schwanz unter Furcht (chaos) = flee 11.0/0.006 geklemmt.
            const mkGroup = () => ({
                children: [{ rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 } }],
                userData: {},
            });
            const roles = [{ role: "schwanz", phase: 0 }];
            const gf = mkGroup();
            r._animateCompoundMotion(gf, roles, 1, 0, true, { chaos: 1 });
            res.e.tailFlee = gf.children[0].rotation.y; // sin(11)*0.006
            // Rig-ZAHL: synthetischer Rig — sorrow=1 -> Kopf sinkt exakt um das
            // sad-headX-Delta (0.18); neutral -> 0 (byte-alt trotz warmem Buch).
            const mkBone = () => ({
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                    set(a, b, c) {
                        this.x = a;
                        this.y = b;
                        this.z = c;
                    },
                },
                position: { x: 0, y: 0, z: 0 },
            });
            const mkSide = () => ({ shoulder: mkBone(), elbow: mkBone(), wrist: mkBone() });
            const mkLeg = () => ({ hip: mkBone(), knee: mkBone(), ankle: mkBone() });
            const mkRig = () => ({
                hips: mkBone(),
                spine: mkBone(),
                chest: mkBone(),
                neck: mkBone(),
                head: mkBone(),
                armL: mkSide(),
                armR: mkSide(),
                legL: mkLeg(),
                legR: mkLeg(),
            });
            const rigN = mkRig();
            r._animateHumanoidRig(rigN, 0.7, 0, false, false, null);
            res.e.headNeutral = rigN.head.rotation.x; // 0 (Delta-Null)
            res.e.spineNeutral = rigN.spine.rotation.x; // -0.02 + sin(0.7*1.6)*0.02 byte-alt
            const rigS = mkRig();
            r._animateHumanoidRig(rigS, 0.7, 0, false, false, { sorrow: 1 });
            res.e.headSad = rigS.head.rotation.x; // +0.18 (sad-Delta)
            // KONSUM: BEIDE Profil-Leser fließen durch den EINEN Resolver; ein Zwilling am Resolver vorbei fällt (Selbsttest).
            const mpn = r._motionProfileName;
            const durch = (k, args) => {
                let n = 0;
                r._motionProfileName = (...a) => (n++, mpn.apply(r, a));
                try {
                    r[k](...args);
                } finally {
                    delete r._motionProfileName;
                }
                return n > 0;
            };
            res.e.resolver = [
                durch("_motionStudioProfile", [true, { chaos: 1 }]),
                durch("_koerperMotionProfile", [false, { sorrow: 1 }]),
            ];
            r._koerperMotionProfile = () => null;
            res.e.resolver.push(durch("_koerperMotionProfile", [false, { sorrow: 1 }]) === false);
            delete r._koerperMotionProfile;
            // VERHALTEN: der Schritt-Takt des Avatars trägt die Emotion als Kadenz (sorrow = das Studio-freq-Verhältnis, neutral 1).
            const gt = r._gaitTick,
                pl = r.state.player,
                em0 = pl.emotions;
            const emoF = (emo) => {
                let fk = null;
                r._gaitTick = function (...a) {
                    fk = a[4] && a[4].emoFaktor;
                    return gt.apply(this, a);
                };
                pl.emotions = emo;
                try {
                    r.animatePlayerSoul(performance.now() / 1000);
                } finally {
                    delete r._gaitTick;
                    pl.emotions = em0;
                }
                return fk;
            };
            const soll = r._koerperMotionProfile(true, { sorrow: 1 }).freq / r._koerperMotionProfile(true, null).freq;
            res.e.stepBridge = {
                soll,
                traurig: emoF({ joy: 0, awe: 0, sorrow: 1, hope: 0, peace: 0, chaos: 0 }),
                neutral: emoF(null),
            };
        } catch (e) {
            res.e = res.e || {};
            res.e.err = (e && e.message) || String(e);
        }
        // ===== W: die Werkstatt-Sichtbarkeit (Studio-Rezepte-Liste, W-A1-Straße) =====
        try {
            const ids = r._workshopStudioRecipeIds();
            res.w.lofi = ids.includes("lofi");
            res.w.wolf = ids.includes("wolf");
            res.w.mensch = ids.includes("mensch");
        } catch (e) {
            res.w.err = (e && e.message) || String(e);
        }
        // ===== O: DER HOST-OFEN IN DER VORSCHAU (ERFINDER-WELLE — „waehle mensch/wolf
        // und nichts erscheint" ist tot: die EINE Vorschau-Quelle baeckt MESHFREI-Domaenen
        // selbst; klang ist ehrlich 3D-frei + die Welt-Klang-Wahl WIRKT als Zahl) =====
        try {
            res.o = {};
            const gM = r._workshopStudioPreviewFrom("mensch", 1, 0, null);
            res.o.mensch = !!(gM && gM.isObject3D && gM.userData && gM.userData.rig);
            res.o.menschMemo = r._workshopStudioPreviewFrom("mensch", 1, 0, null) === gM;
            const gW = r._workshopStudioPreviewFrom("wolf", 1, 0, null);
            res.o.wolf = !!(gW && gW.isObject3D && gW.children.length > 0);
            const pDef = r._tetrapodaSoulParts("wolf");
            const pOv = r._tetrapodaSoulParts("wolf", { leg: 0.5 });
            res.o.ovFormt = !!(
                pDef &&
                pOv &&
                JSON.stringify(pDef.map((p) => p.position)) !== JSON.stringify(pOv.map((p) => p.position))
            );
            res.o.klangFalse = r._workshopStudioPreviewFrom("lofi", 1, 0, null) === false;
            const before = r._lofiChordDurationMs();
            r.state.klangPreset = "blues";
            const after = r._lofiChordDurationMs();
            r.state.klangPreset = null;
            res.o.klangWahl = { before: Math.round(before), after: Math.round(after), wirkt: before !== after };
            // Die neuen Tier-Seelen bauen durch den EINEN Guss (Hof/Welt-Roster).
            res.o.tiere = ["wolf", "fuchs", "baer"].every((n) => {
                const g = r._buildCreatureGroup(n);
                return !!(g && g.children.length);
            });
        } catch (e) {
            res.o = res.o || {};
            res.o.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check('B: das LIVE-Buch traegt lofi als kind "klang"', out.b.lofiKind === "klang", String(out.b.lofiKind));
    check(
        "B: fx.klang reist (bpm 78, Blues-Skala aus der EINEN Lab-Formel)",
        out.b.lofiBpm === 78 && out.b.lofiScale === "[0,3,5,6,7,10]",
        `bpm=${out.b.lofiBpm} scale=${out.b.lofiScale}`
    );
    check("B: alle 22 Genesis-Genres im Buch", out.b.klangCount === 22, String(out.b.klangCount));
    // wolf und mensch (Art und fx.motion) hält gate:asset-contract Byte für Byte (recipes-Golden)
    check(
        "B: die B4-Regler-Tabellen reisen (paramsByKind klang=7 · koerper=8 · kreatur=5)",
        !!out.b.params && out.b.params.klang === 7 && out.b.params.koerper === 8 && out.b.params.kreatur === 5,
        out.b.params
    );
    check(
        "B: KEINE Auto-Blueprints der drei kinds (must-ignore am Chokepoint)",
        out.b.noAutoBps === true,
        (out.b.autoBpOffenders || []).join(",")
    );
    check(
        "B: die Dial-Karten sind die Objekte der Gesetzbücher (koerper + tetrapoda, kein Stamm-Zwilling)",
        out.b.dialEins === true
    );
    check(
        "K: _klangStudioPreset liest das Genesis-lofi-Genre (bpm 78)",
        out.k.studio === 78,
        out.k.err || String(out.k.studio)
    );
    check(
        "K: _lofiChordDurationMs faehrt das STUDIO-Tempo (78 bpm -> ~3077 ms)",
        Math.abs(out.k.durStudio - (60000 / 78) * 4) < 1,
        String(out.k.durStudio)
    );
    check(
        "K: ohne Rezept antwortet der KERN (GENRES lofi 78 bpm → ~3077 ms) — fail-closed, der LOFI_BPM-Zwilling fiel",
        Math.abs(out.k.durFallback - (60000 / 78) * 4) < 1,
        String(out.k.durFallback)
    );
    check("K: nach der Wiederherstellung wieder Studio-Tempo", Math.abs(out.k.durRestored - out.k.durStudio) < 1);
    check(
        "K2 (W-A7-Vertiefung): _lofiActiveScale liest die Studio-Blues-Skala [0,3,5,6,7,10]",
        out.k.scaleStudio === "[0,3,5,6,7,10]",
        String(out.k.scaleStudio)
    );
    check(
        "K2: der EINE Ton-Mapper faltet (scale[2]=5 · idx 6 = Oktav-Wurzel 12 · Akkord i = [0,5,7,12] + colorExt-Breite)",
        out.k.semi2Studio === 5 && out.k.semi6Studio === 12 && out.k.chord0Studio === "[0,5,7,12]",
        `semi2=${out.k.semi2Studio} semi6=${out.k.semi6Studio} chord=${out.k.chord0Studio}`
    );
    check(
        "K2: die Frequenz ist die Studio-Zahl (2. Akkord-Ton = 110·2^(5/12) ≈ 146.83 Hz)",
        Math.abs(out.k.freq1Studio - 110 * Math.pow(2, 5 / 12)) < 0.01,
        String(out.k.freq1Studio)
    );
    check(
        "K2: versteckt → KERN-Blues ([0,3,5,6,7,10] · semi2=5 · Akkord [0,5,7,12]) · wiederhergestellt → Studio",
        out.k.scaleFallbackKern === true &&
            out.k.semi2Fallback === 5 &&
            out.k.chord0Fallback === "[0,5,7,12]" &&
            out.k.semi2Restored === 5,
        `fallback semi2=${out.k.semi2Fallback} restored=${out.k.semi2Restored}`
    );
    check(
        "M (W-A6-Erstkonsument): _motionStudioProfile liest idle 0.5/0.10 · moving[joy] 5.5/0.38",
        !!out.m &&
            !!out.m.idle &&
            out.m.idle.tailRate === 0.5 &&
            out.m.idle.tailAmp === 0.1 &&
            !!out.m.moving &&
            out.m.moving.tailRate === 5.5 &&
            out.m.moving.tailAmp === 0.38,
        (out.m && out.m.err) || JSON.stringify(out.m && out.m.idle)
    );
    check(
        "M: KONSUM als ZAHL — Schwanz-Winkel Studio sin(0.5)·0.10, versteckt antwortet die KERN-Tafel (MOTION.idle, byte-gleiche Lab-Quelle), wiederhergestellt Studio",
        !!out.m &&
            Math.abs(out.m.tailStudio - Math.sin(0.5) * 0.1) < 1e-9 &&
            Math.abs(out.m.tailFallback - Math.sin(0.5) * 0.1) < 1e-9 &&
            Math.abs(out.m.tailRestored - Math.sin(0.5) * 0.1) < 1e-9,
        out.m ? `studio=${out.m.tailStudio} fallback=${out.m.tailFallback}` : ""
    );
    check(
        "M: der EINE Animator ruft den Studio-Leser (Konsum _animateCompoundMotion → _motionStudioProfile)",
        !!out.m && out.m.consumes > 0,
        String(out.m && out.m.consumes)
    );
    check(
        "D (Koerper-Dock A1): _koerperStudioDials liest die 8 Morph-Dials + der Boot-Avatar traegt den Studio-Stempel (build 0.35 statt Host-0.52)",
        !!out.d &&
            !!out.d.dials &&
            out.d.dials.height === 1 &&
            out.d.dials.mass === 0.35 &&
            out.d.playerStamped === true &&
            Math.abs((out.d.playerBuild || 0) - 0.35) < 1e-9,
        (out.d && out.d.err) || JSON.stringify(out.d && out.d.dials)
    );
    check(
        "D: KONSUM als ZAHL — height-Dial 1.15 skaliert die Rig-Hoehe x1.15",
        !!out.d && out.d.heightConsumed === true,
        out.d ? `h0=${out.d.h0} h1=${out.d.h1}` : ""
    );
    check(
        "D: fail-soft — Rezept versteckt -> Stempel null (byte-alt Konstanten-Bau)",
        !!out.d && out.d.hiddenStamp === true
    );
    check(
        "D (Koerper-Dock A2): wesen liest die tetrapoda-deer-Dials (gleiche Part-Zahl, TAG-NEUTRAL per Zahl)",
        !!out.d && out.d.wesenDocked === true && out.d.wesenTagNeutral === true
    );
    check(
        "D: KONSUM als ZAHL — leg-Dial 0.22->0.35 senkt den Fuss-Anker messbar (laengere Beine)",
        !!out.d && out.d.legConsumed === true,
        out.d ? `base=${out.d.legBase} long=${out.d.legLong}` : ""
    );
    check(
        "D: fail-soft — deer versteckt -> _buildCreatureGroup faellt auf die frozen Modul-bodyParts (Referenz-Beweis); warm -> Studio-Guss",
        !!out.d && out.d.wesenFallback === true && out.d.wesenStudioBuild === true
    );
    check(
        "E (Emotions-Bruecke): der EINE Resolver waehlt flee (kreatur/chaos) · sad (koerper/sorrow) · joy (Default byte-alt)",
        !!out.e && out.e.fleeName === "flee" && out.e.sadName === "sad" && out.e.defName === "joy",
        (out.e && out.e.err) || (out.e ? `${out.e.fleeName}/${out.e.sadName}/${out.e.defName}` : "")
    );
    check(
        "E: KONSUM als ZAHL — Schwanz unter Furcht = flee-Profil sin(11)*0.006",
        !!out.e && Math.abs(out.e.tailFlee - Math.sin(11) * 0.006) < 1e-9,
        out.e ? String(out.e.tailFlee) : ""
    );
    check(
        "E: DER RIG LIEST — sorrow=1 senkt den Kopf exakt um das sad-Delta (0.18); neutral bleibt byte-alt (Kopf 0, Atem-Konstanten)",
        !!out.e &&
            Math.abs(out.e.headSad - 0.18) < 1e-9 &&
            Math.abs(out.e.headNeutral) < 1e-9 &&
            Math.abs(out.e.spineNeutral - (-0.02 + Math.sin(0.7 * 1.6) * 0.02)) < 1e-9,
        out.e ? `sad=${out.e.headSad} neutral=${out.e.headNeutral}` : ""
    );
    check(
        "E: der Schritt-Takt des Avatars trägt die Emotion (sorrow = Studio-Kadenz, neutral 1)",
        !!out.e &&
            !!out.e.stepBridge &&
            Math.abs(out.e.stepBridge.soll - 1) > 1e-3 &&
            Math.abs(out.e.stepBridge.traurig - out.e.stepBridge.soll) < 1e-9 &&
            out.e.stepBridge.neutral === 1,
        out.e && out.e.stepBridge
    );
    check(
        "E: beide Profil-Leser fließen durch den EINEN Resolver _motionProfileName (Konsum; ein Zwilling daran vorbei fällt)",
        !!out.e && JSON.stringify(out.e.resolver) === "[true,true,true]",
        out.e && out.e.resolver
    );
    check(
        "X (NULL): der WOLF liest die tetrapoda-wolf-Dials (gleiche Part-Zahl, Dials wirken, TAG-BYTE-GLEICH)",
        !!out.x && out.x.glutDocked === true && out.x.glutDialsWirken === true && out.x.glutTagNeutral === true,
        (out.x && out.x.err) || ""
    );
    check(
        "X: KONSUM als ZAHL — neck-Dial 0.263->0.15 senkt den Kopf-Anker des Wolfs",
        !!out.x && out.x.glutNeckConsumed === true
    );
    check(
        "X (HERZ): koerper_human ist der Landmark-Guss (_isBodyShaped · Rolle soul) + Stamm-Delegat === Kern-Gesetz",
        !!out.x &&
            out.x.waechterParts >= 6 &&
            out.x.waechterBody === true &&
            out.x.waechterRole === "soul" &&
            out.x.waechterGussLiest === true,
        out.x ? `parts=${out.x.waechterParts} body=${out.x.waechterBody} liest=${out.x.waechterGussLiest}` : ""
    );
    check(
        "X (HERZ): Spiegel-Identität — koerper_human trägt EXAKT die Def-Tags des Menschen",
        !!out.x && !!out.x.waechterTags && out.x.waechterTags === out.x.humanDefTags,
        out.x ? out.x.waechterTags : ""
    );
    check(
        "X: das HOLZROSS ist der Skelett-Guss (≥30 Parts · Quarz-Kern · moveable · Rolle vehicle · sitz@0)",
        !!out.x &&
            out.x.holzrossParts >= 30 &&
            out.x.holzrossKern === true &&
            out.x.holzrossMoveable === true &&
            out.x.holzrossRole === "vehicle" &&
            out.x.holzrossSitz === true,
        out.x ? `parts=${out.x.holzrossParts} role=${out.x.holzrossRole}` : ""
    );
    check(
        "X: HOLZROSS-Identität — Tags WERT-GLEICH zur gemünzten Alt-Konstruktion (sortiert, 10.07.)",
        !!out.x &&
            out.x.holzrossTags ===
                '[["brennbar",0.8],["dichte",1.3],["härte",2.0999999999999996],["lebendig",1.4],["magieleitung",2.55],["resoniert",1.8],["transparent",2.8499999999999996],["wärmeleitung",0.44999999999999996],["zähigkeit",1.2]]',
        out.x ? out.x.holzrossTags : ""
    );
    check(
        "W: die Studio-Rezepte-Liste der Werkstatt fuehrt lofi/wolf/mensch (sichtbar/regelbar)",
        out.w.lofi === true && out.w.wolf === true && out.w.mensch === true,
        out.w.err || ""
    );
    check(
        "O: mensch-Rezept -> der Host-Ofen baeckt den AVATAR-Rig in der Vorschau (+ Memo stabil)",
        !!out.o && out.o.mensch === true && out.o.menschMemo === true,
        (out.o && out.o.err) || ""
    );
    check(
        "O: wolf-Rezept -> der Gattungs-Guss steht in der Vorschau + ov FORMT (leg-Dial aendert Positionen)",
        !!out.o && out.o.wolf === true && out.o.ovFormt === true
    );
    check(
        "O: klang-Rezept ist ehrlich 3D-frei (false, keine pending-Schleife) + die WELT-KLANG-WAHL wirkt (Tempo-Zahl)",
        !!out.o && out.o.klangFalse === true && out.o.klangWahl && out.o.klangWahl.wirkt === true,
        out.o && out.o.klangWahl ? `lofi=${out.o.klangWahl.before}ms blues=${out.o.klangWahl.after}ms` : ""
    );
    check("O: die NEUEN TIERE (wolf/fuchs/baer) bauen durch den EINEN Kreatur-Guss", !!out.o && out.o.tiere === true);

    wandEnde(errs, "DIE DREI MESHFREI-DOMÄNEN DOCKEN ALS REINE DATEN: Manifest-Zeilen + §8-Kerne, das Buch traegt fx.klang/fx.motion, die Regler-Strasse traegt die Dials, kein Auto-Blueprint entsteht (must-ignore), die Werkstatt zeigt die Rezepte — der EINE Audio-Konsument lebt (Tempo + SKALA durch den einen Ton-Mapper, fail-soft byte-alt) und der Motion-Erstkonsument liest fx.motion (Schwanz-Rolle, KONSUM als Zahl).");
});
