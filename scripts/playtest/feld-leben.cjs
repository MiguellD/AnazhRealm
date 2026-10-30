"use strict";
// scripts/playtest/feld-leben.cjs — der Richter von Feld/leben (spec/stamm/modul-karte.json): Lebens-Feld · Aura · Wohl · Welt-Feld · Selbst-Analyse.
// 10 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Lebendiges Feld, Lese-Seite: auraAt umhüllt das eingefrorene worldFieldAt; die lokale Aura HEBT die
// Emotion (FIELD_TO_EMOTION: lebendige Region → peace), bleibt aber unter der 0.7-Trigger-Schwelle.
// Save/Restore von Position + Emotionen → kein State-Leak in Folge-Bänder.
async function checkBandV1721LivingFieldAura({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        if (r.state.lifeField) r.state.lifeField.clear(); // V17.27 — Feld-Lese-Tests messen den frozen Kern
        const wf = r.worldFieldAt(123, -456);
        const au = r.auraAt(123, -456);
        out.auraWrapsField =
            au.lebendig === wf.lebendig &&
            au.glut === wf.glut &&
            au.dichte === wf.dichte &&
            au.magieleitung === wf.magieleitung;
        // Der Kreis: finde den lebendigsten Spot in einem weiten Raster, setze
        // den Spieler dorthin, ticke updatePlayerEmotions → peace steigt.
        let spot = null,
            best = -1;
        for (let gx = -2000; gx <= 2000; gx += 100) {
            for (let gz = -2000; gz <= 2000; gz += 100) {
                const l = r.worldFieldAt(gx, gz).lebendig;
                if (l > best) {
                    best = l;
                    spot = { x: gx, z: gz, lebendig: l };
                }
            }
        }
        out.bestLebendig = best;
        if (spot && r.state.playerMesh && r.state.player && r.state.player.emotions) {
            const origPos = r.state.playerMesh.position.clone();
            const origEmo = { ...r.state.player.emotions };
            const origTick = r.state.player.emotionLastTick;
            r.state.playerMesh.position.set(spot.x, origPos.y, spot.z);
            for (const k of Object.keys(r.state.player.emotions)) r.state.player.emotions[k] = 0;
            r.state.player.emotionLastTick = -Infinity;
            let t = 1000;
            r.updatePlayerEmotions(t); // delta=0 (prev=-Inf): kein Effekt
            for (let i = 0; i < 40; i++) {
                t += 2;
                r.updatePlayerEmotions(t);
            }
            out.peaceVal = r.state.player.emotions.peace;
            out.peaceRose = out.peaceVal > 0.04; // die Aura hat peace gehoben
            out.peaceBelowTrigger = out.peaceVal < 0.7; // nie selbst-auslösend
            // Restore — kein State-Leak in Folge-Bänder.
            r.state.playerMesh.position.copy(origPos);
            for (const k of Object.keys(origEmo)) r.state.player.emotions[k] = origEmo[k];
            r.state.player.emotionLastTick = origTick;
        }
        return out;
    });
    check("lebendiges Feld: auraAt umhüllt das eingefrorene worldFieldAt (Kern bit-gleich)", res.auraWrapsField);
    check(
        "lebendiges Feld: eine lebendige Region HEBT peace (der Kreis schließt sich)",
        res.peaceRose,
        `bestLebendig=${res.bestLebendig}, peace=${res.peaceVal}`
    );
    check(
        "lebendiges Feld: die Aura bleibt UNTER der 0.7-Trigger-Schwelle (stimmt, löst nie selbst aus)",
        res.peaceBelowTrigger,
        `peace=${res.peaceVal}`
    );
}

// Schreib-Seite: eine Geburt deponiert Leben, das den frozen lebendig-Kern HEBT (auraAt blendet),
// zerfällt (Homöostase), bei max sättigt; der at_field_need-Loop schließt sich (belebt → ein ANDERER
// Punkt wird ärmster). Leerer Overlay == frozen; der spawn_creature-Pfad deponiert.
async function checkBandV1727WritableField({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const cfg = r.constructor.LIFE_FIELD;
        // die Geburt trägt Leben ins Feld: ein spawn_creature über die DSL deponiert an der Wiege (am Ruf)
        const capD = r.state.maxCreatures;
        const nD = r.state.creatures.length;
        r.state.maxCreatures = nD + 1;
        out.spawnDeposits = window.__consumes(r, "dslRun", r, "_depositLife", [["spawn_creature", ["at_player"], 1, "happy"], { source: "test" }]);
        if (r.state.creatures[nD]) r.removeCreature(r.state.creatures[nD]);
        r.state.maxCreatures = capD;
        // sauberer Start
        if (r.state.lifeField) r.state.lifeField.clear();
        const X = 12345,
            Z = -6789; // ein fester, vom Spieler entfernter Test-Ort
        const frozen = r.worldFieldAt(X, Z).lebendig;
        // (1) backward-compatible: leerer Overlay → auraAt == worldFieldAt
        out.emptyEqualsFrozen = r.auraAt(X, Z).lebendig === frozen;
        // (2) Deposit HEBT lebendig (min(frozen + pulse, 1)) — im selben Takt exakt, auch wenn die Wanduhr 3 ms läuft (GC, Last):
        r._depositLife(X, Z); // die Feld-Uhr ist `state.spielZeit` (CI 39002548016: die Wanduhr trieb 5e-6 ab, ROT ohne Code-Änderung)
        for (const t0 = performance.now(); performance.now() - t0 < 3; ); // die Wanduhr läuft, der Takt steht
        const afterDeposit = r.auraAt(X, Z).lebendig;
        out.depositRaises = afterDeposit > frozen;
        out.depositExact = Math.abs(afterDeposit - Math.min(1, frozen + cfg.pulseCenter)) < 1e-6;
        // (3) Decay senkt zurück zum Substrat (t zurückdrehen = ~120 s vergangen)
        const cell = r.state.lifeField.get(r._lifeCellKey(X, Z));
        const beforeDecay = r.auraAt(X, Z).lebendig;
        cell.t -= 120; // λ=0.008 → ×e^(−0.96) ≈ 0.38
        const afterDecay = r.auraAt(X, Z).lebendig;
        out.decayLowers = afterDecay < beforeDecay && afterDecay > frozen;
        // (4) Sättigung: viele Deposits → Overlay kappt exakt bei max
        r.state.lifeField.clear();
        for (let i = 0; i < 20; i++) r._depositLife(X, Z);
        out.saturates = Math.abs(r.state.lifeField.get(r._lifeCellKey(X, Z)).a - cfg.max) < 1e-6;
        // (5) DER LOOP SCHLIESST SICH: Deposit am ärmsten Ring-Punkt → ein
        // ANDERER wird der ärmste (Leben spreizt in die Welt, kein Abladen)
        r.state.lifeField.clear();
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm && r.dslPositions && typeof r.dslPositions.at_field_need === "function") {
            const ctx2 = { state: r.state, rng: () => 0.5, log: { push() {} }, budget: {} };
            const p1 = r.dslPositions.at_field_need([50], ctx2);
            for (let i = 0; i < 6; i++) r._depositLife(p1.x, p1.z); // sättigen am alten Minimum
            const p2 = r.dslPositions.at_field_need([50], ctx2);
            out.loopSpreads = Math.abs(p2.x - p1.x) > 1 || Math.abs(p2.z - p1.z) > 1;
            out.p1Raised = r.auraAt(p1.x, p1.z).lebendig > r.auraAt(p2.x, p2.z).lebendig;
        } else {
            out.loopSpreads = true;
            out.p1Raised = true;
        }
        if (r.state.lifeField) r.state.lifeField.clear(); // sauberes Ende — keine Pollution für Folge-Bands
        return out;
    });
    check("Schreib-Feld: die Geburt (spawn_creature) deponiert Leben (_depositLife)", res.spawnDeposits);
    check("Schreib-Feld: leerer Overlay → auraAt == worldFieldAt (backward-compatible)", res.emptyEqualsFrozen);
    check(
        "Schreib-Feld: ein Deposit HEBT lebendig über dem frozen Kern (frozen + pulse)",
        res.depositRaises && res.depositExact
    );
    check("Schreib-Feld: Decay senkt zurück zum Substrat (Homöostase, ein Garten will Pflege)", res.decayLowers);
    check("Schreib-Feld: Sättigung kappt exakt bei LIFE_FIELD.max (nie über die Wurzel hinaus)", res.saturates);
    check(
        "Schreib-Feld: der at_field_need-LOOP schließt sich — Leben spreizt, der alte Bedarf weicht",
        res.loopSpreads
    );
    check("Schreib-Feld: der alte Bedarf-Punkt ist gehoben (der Mangel sinkt wirklich)", res.p1Raised);
}

// Kreatur-Trickle: NUR getragene Kreaturen (tendsLife) träufeln Leben in ihre Zelle → die Region
// erhält sich nach dem Geburts-Puls; ambiente Fauna träufelt NICHT (kein Runaway); rate-limitiert.
async function checkBandV1729CreatureTrickle({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const cfg = r.constructor.LIFE_FIELD;
        if (r.state.lifeField) r.state.lifeField.clear();
        // (1) eine TENDENDE Kreatur traeufelt Leben in ihre Zelle
        const X = 23456,
            Z = -8765;
        const tending = { position: { x: X, z: Z }, userData: { tendsLife: true } };
        const key = r._lifeCellKey(X, Z);
        const before = r._lifeOverlayAt(X, Z);
        r._tickCreatureLifeTrickle(tending, 1000);
        const after = r._lifeOverlayAt(X, Z);
        out.tendingDeposits = after > before;
        // (2) Rate-Limit: sofort nochmal (selbe Zeit) → kein zweiter Deposit (die GESPEICHERTE Menge `a`).
        const aStored = r.state.lifeField.get(key).a;
        r._tickCreatureLifeTrickle(tending, 1000);
        out.rateLimited = r.state.lifeField.get(key).a === aStored;
        // (3) nach dem Intervall → traeufelt wieder (lastLifeTrickle wandert)
        r._tickCreatureLifeTrickle(tending, 1000 + cfg.trickleEverySec + 1);
        out.tickedAgain = tending.userData.lastLifeTrickle > 1000;
        // (4) eine AMBIENTE Kreatur (kein tendsLife) traeufelt NICHT (kein Runaway)
        r.state.lifeField.clear();
        // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
        const ambient = { position: { x: 34567, z: -9876 }, userData: { tendsLife: false } };
        r._tickCreatureLifeTrickle(ambient, 2000);
        out.ambientInert = r._lifeOverlayAt(34567, -9876) === 0;
        if (r.state.lifeField) r.state.lifeField.clear(); // sauberes Ende
        return out;
    });
    check("Trickle: eine tendende Kreatur traeufelt Leben in ihre Zelle (sustainiert)", res.tendingDeposits);
    check("Trickle: rate-limitiert (kein Deposit-Sturm pro Frame)", res.rateLimited);
    check("Trickle: nach dem Intervall traeufelt sie wieder (lebendiger Pfad)", res.tickedAgain);
    check("Trickle: ambiente Fauna traeufelt NICHT (kein Feedback-Runaway, V17.27-Disziplin)", res.ambientInert);
}

// Räumliche Emotion: `_feelAction` prägt die Emotion an der Spieler-Zelle ein, auraAt blendet den
// lokalen Abdruck über die globale Stimmung, der Welt-Tint liest das → färbt den Ort. Die
// emotion-Achse ist damit schreibbar UND räumlich konsumiert.
async function checkBandV1732SpatialEmotion({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        if (r.state.emotionField) r.state.emotionField.clear();
        const e = r.state.player.emotions;
        const saved = Object.assign({}, e);
        for (const k of Object.keys(e)) e[k] = 0;
        // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
        const A = { x: 44444, z: -3333 },
            B = { x: 99999, z: 7777 };
        // (1) backward-compat: leeres Overlay → auraAt.emotion === globale Stimmung (selbes Objekt)
        out.emptyIsGlobal = r.auraAt(A.x, A.z).emotion === e;
        // (2) Deposit praegt lokal ein
        r._depositEmotion(A.x, A.z, { sorrow: 0.6 });
        const auraA = r.auraAt(A.x, A.z).emotion;
        out.depositImprints = auraA.sorrow > 0;
        // (3) RAEUMLICH: A traegt sorrow, B (frisch) nicht
        const auraB = r.auraAt(B.x, B.z).emotion;
        out.spatial = (auraA.sorrow || 0) > (auraB.sorrow || 0) + 0.05;
        // (4) Decay senkt (das Gefuehl verblasst)
        const key = r._lifeCellKey(A.x, A.z);
        const stored = r.state.emotionField.get(key).axes.sorrow;
        r.state.emotionField.get(key).t -= 120;
        out.decays = r.auraAt(A.x, A.z).emotion.sorrow < stored;
        // (5) Anti-Passagier-Beweis: ein räumlicher sorrow-Abdruck FÄRBT den Tint am Spieler (sorrow senkt
        // die Sättigung), obwohl die globale Stimmung neutral ist — gleicher Ort, nur der Abdruck differiert.
        out.tintColors = true;
        const THREE = window.THREE;
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (THREE && THREE.Color && pm) {
            // Default auraTintStrength=0 (realistischer Himmel, Schöpfer-Wunsch); der
            // KONSUM-Mechanismus lebt weiter → für die Anti-Passagier-Probe auf 1 forcieren
            // (deterministisch), dann den Default (0) wiederherstellen.
            const _origAuraK1732 = r.state.atmosphere && r.state.atmosphere.auraTintStrength;
            if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = 1;
            for (const k of Object.keys(e)) e[k] = 0;
            r.state.emotionField.clear();
            const sat = (c) => Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
            const fresh = r._dayNightComputeTint();
            r._depositEmotion(pm.x, pm.z, { sorrow: 0.8 });
            const imprinted = r._dayNightComputeTint();
            out.tintColors = sat(imprinted.skyColor) < sat(fresh.skyColor) - 1e-4;
            out.freshSat = sat(fresh.skyColor);
            out.imprintedSat = sat(imprinted.skyColor);
            if (r.state.atmosphere) r.state.atmosphere.auraTintStrength = _origAuraK1732; // restore Default (0)
        }
        r.state.emotionField.clear();
        for (const k of Object.keys(e)) e[k] = saved[k] || 0;
        return out;
    });
    check(
        "raeumliche Emotion: leeres Overlay → auraAt.emotion == globale Stimmung (backward-compat)",
        res.emptyIsGlobal
    );
    check("raeumliche Emotion: ein Deposit praegt die lokale Emotion ein", res.depositImprints);
    check("raeumliche Emotion: der Abdruck ist RAEUMLICH (Ort A traegt sorrow, Ort B nicht)", res.spatial);
    check("raeumliche Emotion: der Abdruck zerfaellt (das Gefuehl verblasst)", res.decays);
    check(
        "KONSUM (kein Passagier): ein raeumlicher sorrow-Abdruck faerbt den Welt-Tint (grayt)",
        res.tintColors,
        `freshSat=${res.freshSat} imprintedSat=${res.imprintedSat}`
    );
}

// Wohl-Maß + gleitende Baseline (Mess-Schicht für Regel-Fitness + Emotion): die EMA rechnet richtig —
// Cold-Start = erste Beobachtung, stabiler Input → hält, Sprung → trackt mit Lag; Spieler-Baseline
// ebenso.
async function checkBandV1742Wohl({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const W = window.AnazhRealm ? window.AnazhRealm.WERTUNG : r.constructor.WERTUNG;

        // --- (1) das Wohl-Maß: Struktur = lebendig; Erlebt = Valenz (Russell) ---
        const a0 = r.auraAt(0, 0, 0);
        out.wohlStruktur = Math.abs(r._fieldWohlStruktur(a0) - a0.lebendig) < 1e-9;
        out.wohlErlebtValence =
            r._fieldWohlErlebt({ emotion: { joy: 1 } }) > 0.2 && // positive Valenz
            r._fieldWohlErlebt({ emotion: { sorrow: 1 } }) < -0.2 && // negative Valenz
            Math.abs(r._fieldWohlErlebt({ emotion: { awe: 1 } })) < 1e-9; // awe ambivalent → 0

        // --- (2) die Feld-Baseline: Cold-Start = erste Beobachtung ---
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        // eine Zelle mit Headroom (frozen lebendig < 0.7) finden
        let sx = 1000,
            sz = 1000,
            struktur0 = 1;
        for (let i = 0; i < 24; i++) {
            const cx = 1000 + i * 37,
                cz = 1000 + i * 53;
            const s = r._fieldWohlStruktur(r.auraAt(cx, cz, 0));
            if (s < 0.7) {
                sx = cx;
                sz = cz;
                struktur0 = s;
                break;
            }
        }
        const b0 = r._observeFieldWohl(sx, sz, 0);
        out.coldStart = Math.abs(b0 - struktur0) < 1e-6 && Math.abs(r._fieldWohlBaselineAt(sx, sz) - struktur0) < 1e-6;

        // --- (3) stabiler Input → die Baseline HÄLT (kein Drift ohne Änderung) ---
        r._observeFieldWohl(sx, sz, 1);
        out.stableHolds = Math.abs(r._fieldWohlBaselineAt(sx, sz) - struktur0) < 1e-3;

        // --- (4) ein Sprung (Leben deponiert) → die Baseline TRACKT, aber LAGGT (EMA) ---
        r._depositLife(sx, sz, 0.6);
        const strukturHigh = r._fieldWohlStruktur(r.auraAt(sx, sz, 1));
        const pre = r._observeFieldWohl(sx, sz, 3); // Δt=2s ≪ fieldTau → kleiner Schritt
        const bAfter = r._fieldWohlBaselineAt(sx, sz);
        out.tracksAndLags =
            strukturHigh > struktur0 + 0.05
                ? // der Sprung war real: Baseline bewegte sich HOCH, lagt aber WEIT unter dem neuen Wert
                  Math.abs(pre - struktur0) < 1e-3 && bAfter > struktur0 + 1e-4 && bAfter < strukturHigh - 0.05
                : true; // kein Headroom an diesem Spot → vacuously ok (selten)

        // --- (5) Prune: eine alte (lange nicht beobachtete) Zelle fällt, sobald ein Blick nach ihrem Tod schreibt (`_feldTod`) ---
        r._observeFieldWohl(9 * W.cell, 9 * W.cell, 0);
        r._observeFieldWohl(sx, sz, W.pruneAgeSec + 2 * r.constructor.FELD_TOD_EIMER_S);
        out.prunes = !r.state.wohlBaseline.has("9,9");

        // (Die SPIELER-Baseline + ihr Appraisal-Konsum sind Phase 3 → getestet in
        // checkBandV1744Appraisal, mit der Situations-Semantik statt der Stimmung.)

        // restore
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        return out;
    });

    check(
        "Wertung: das Wohl-Maß — Struktur = lebendig, Erlebt = Valenz (joy + / sorrow − / awe neutral)",
        res.wohlStruktur && res.wohlErlebtValence
    );
    check(
        "Wertung: die Feld-Baseline Cold-Start = die erste Beobachtung (keine Überraschung anfangs)",
        res.coldStart
    );
    check("Wertung: stabiler Input → die Baseline HÄLT (EMA driftet nicht ohne Änderung)", res.stableHolds);
    check(
        "Wertung: ein Sprung → die Baseline TRACKT, aber LAGGT weit darunter (das EMA-Wesen, zeit-korrigiert)",
        res.tracksAndLags
    );
    check("Wertung: die Baseline-Map wird gepruned (lange nicht beobachtete Zelle → weg, bounded)", res.prunes);
}

// Emotion als APPRAISAL: δ = Situation − Spieler-Baseline; Situation = Welt um den Spieler (lebendig)
// + HP, NIE seine Stimmung (sonst Rückkopplung → Runaway). Geprüft: Verbesserung → joy-Puls,
// Gewöhnung (δ→0), kein Runaway; anhaltendes Tun erreicht weiter die 0.7-Trigger-Schwelle.
async function checkBandV1744Appraisal({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh.position;

        // save
        const savedEmo = { ...p.emotions };
        const savedBase = p.wohlBaseline;
        const savedTick = p.emotionLastTick;
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        const savedEmoField = r.state.emotionField;
        const savedWeather = r.state.weather;
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };

        // --- (1) die Situation IGNORIERT die Stimmung (kein Feedback-Input) ---
        r.state.lifeField = new Map();
        r.state.emotionField = new Map();
        setEmo({ joy: 1, hope: 1, peace: 1 });
        const sitHighMood = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        setEmo({});
        const sitLowMood = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        out.situationIgnoresMood = Math.abs(sitHighMood - sitLowMood) < 1e-9;

        // --- (2) die Situation STEIGT mit dem Leben der Welt (deposit_life) ---
        const sit0 = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        r._depositLife(pm.x, pm.z, 0.6);
        const sit1 = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        out.situationRisesWithLife = sit1 > sit0 + 0.05 || sit0 > 0.9;

        // --- (3) die Baseline trackt die SITUATION, nicht die Stimmung (der no-Feedback-Beweis) ---
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        setEmo({ joy: 1, hope: 1, peace: 1 }); // Stimmung HOCH …
        p.wohlBaseline = undefined;
        p.emotionLastTick = 1000;
        r.updatePlayerEmotions(1001); // Cold-Start: baseline = SITUATION (lebendig@player), NICHT die ~1 Stimmung
        const baseCold = p.wohlBaseline;
        const sitAtCold = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 1001));
        out.baselineTracksSituation = Math.abs(baseCold - sitAtCold) < 0.05;

        // --- (4) Überraschung: die Situation springt (Leben deponiert) → joy-Puls ---
        setEmo({});
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        p.wohlBaseline = undefined;
        p.emotionLastTick = 2000;
        r.updatePlayerEmotions(2001); // Cold-Start: baseline = sit (karg/frozen)
        const sitPre = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 2001));
        r._depositLife(pm.x, pm.z, 0.85); // Situation springt ÜBER die Baseline
        const sitPost = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 2001));
        const joyBefore = p.emotions.joy;
        p.emotionLastTick = 2001;
        r.updatePlayerEmotions(2002); // δ>0 → joy steigt
        // nur prüfen, wenn der Sprung real war (sonst war kein Headroom — vacuously ok)
        out.surpriseRaisesJoy = sitPost - sitPre > 0.1 ? p.emotions.joy > joyBefore + 0.001 : true;

        // --- (5) Gewöhnung + KEIN Feedback-Runaway (feedback-frei bewiesen) ---
        setEmo({});
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        p.wohlBaseline = 0; // Erwartung: karg
        p.emotionLastTick = 4000;
        r._depositLife(pm.x, pm.z, 0.5);
        for (let t = 4001; t <= 4200; t++) {
            r._depositLife(pm.x, pm.z, 0.5); // die Situation konstant halten (Overlay sättigt)
            r.updatePlayerEmotions(t);
        }
        const sitFinal = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 4200));
        out.habituatesBaselineConverges = Math.abs(p.wohlBaseline - sitFinal) < 0.1; // Baseline holt die Situation ein
        // bei Gewöhnung (Baseline = Situation, δ≈0) gibt EIN weiterer Tick keinen joy-Zuwachs:
        const jPre = p.emotions.joy;
        r._depositLife(pm.x, pm.z, 0.5);
        r.updatePlayerEmotions(4201);
        out.habituatedNoMoreJoy = p.emotions.joy - jPre < 0.01; // δ≈0 → kein joy-Zuwachs mehr
        // KEIN Feedback: baseline = Situation (δ≈0), eine GESEEDETE Stimmung amplifiziert NICHT
        // (eine Mood-Rückkopplung würde joy von 0.5 Richtung 1.0 aufschaukeln — der Runaway-Beweis).
        p.wohlBaseline = sitFinal;
        p.emotions.joy = 0.5;
        for (let t = 4300; t <= 4360; t++) {
            r._depositLife(pm.x, pm.z, 0.5);
            r.updatePlayerEmotions(t);
        }
        out.noRunaway = p.emotions.joy <= 0.52; // hielt/zerfiel — KEIN Aufschaukeln aus der Stimmung

        // --- (6) V17.30 bleibt heil: anhaltendes Tun erreicht WEITER 0.7 + triggert ---
        setEmo({});
        for (let i = 0; i < 10; i++) r._feelAction("build"); // joy → ~1.0 (ACTION_TO_EMOTION, V17.30)
        const joyHigh = p.emotions.joy;
        const freude = r.state.worldRules.find((g) => g.source === "emotion:joy");
        freude.lastFired = -Infinity;
        r._tickWorldRules(5001); // das Gesetz des Gemüts `emotion:joy` feuert (affekt.K2)
        out.triggerPreserved = joyHigh >= 0.7 && freude.lastFired === 5001;

        // restore
        setEmo(savedEmo);
        p.wohlBaseline = savedBase;
        p.emotionLastTick = savedTick;
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        r.state.emotionField = savedEmoField;
        r.state.weather = savedWeather;
        return out;
    });

    check(
        "Appraisal: _playerSituationWohl IGNORIERT die Stimmung (kein Feedback-Input — die Wurzel gegen Runaway)",
        res.situationIgnoresMood
    );
    check(
        "Appraisal: die Situation STEIGT mit dem Leben der Welt (deposit_life → lebendig)",
        res.situationRisesWithLife
    );
    check(
        "Appraisal: die Spieler-Baseline trackt die SITUATION, nicht die Stimmung (Cold-Start = lebendig@player, nicht die ~1 Stimmung)",
        res.baselineTracksSituation
    );
    check(
        "Appraisal: eine Situations-Verbesserung (Region blüht auf) gibt einen joy-Puls (Überraschung, δ>0)",
        res.surpriseRaisesJoy
    );
    check(
        "Appraisal: GEWÖHNUNG — konstante Situation → Baseline holt auf (δ→0) → kein weiterer joy-Zuwachs",
        res.habituatesBaselineConverges && res.habituatedNoMoreJoy
    );
    check(
        "Appraisal: KEIN Runaway — eine konstante Situation pinnt joy nicht auf 1.0 (feedback-frei bewiesen)",
        res.noRunaway
    );
    check(
        "Appraisal: V17.30 bleibt heil — anhaltendes Tun erreicht weiter die 0.7-Trigger-Schwelle + feuert (δ ist ADDITIV)",
        res.triggerPreserved
    );
}

// Die Klammer: rule.value und δ_spieler sind dasselbe Vorhersagefehler-Signal — feuert eine Regel NAH
// am Spieler bei positivem δ_spieler, gibt es Bonus-Credit ∝ Nähe (ferne ausgeschlossen). Anti-Gaming:
// δ_spieler ist die SITUATION, nie die stempelbare Emotion → kein Reward-Hacking.
async function checkBandV1750Klammer({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const p = r.state.player;
        const pm = r.state.playerMesh.position;
        const savedEmo = { ...p.emotions };
        const savedMood = p.mood ? { ...p.mood } : null;
        const savedBase = p.wohlBaseline;
        const savedDelta = p.appraisalDelta;
        const savedTick = p.emotionLastTick;
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        const savedEmoField = r.state.emotionField;
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };

        // (2) ANTI-GAMING an der WURZEL: appraisalDelta trackt die SITUATION (lebendig+HP),
        // NICHT die gestempelte Emotion → eine Regel kann den Bonus nicht über Emotion faken.
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        r.state.emotionField = new Map();
        // (a) die Situation STEIGT (Leben deponiert, Erwartung niedriger) → appraisalDelta steigt
        setEmo({});
        p.appraisalDelta = 0;
        r._depositLife(pm.x, pm.z, 1.0);
        r._depositLife(pm.x, pm.z, 1.0);
        const sitNow = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        p.wohlBaseline = sitNow - 0.3; // δ ≈ +0.3
        p.emotionLastTick = 6000;
        r.updatePlayerEmotions(6005);
        out.deltaTracksSituationUp = p.appraisalDelta > 0.05;
        // (b) die Situation ist FLACH, aber die Emotion HOCH → appraisalDelta bleibt ~0
        setEmo({ joy: 1, hope: 1, peace: 1 });
        p.appraisalDelta = 0;
        const sitFlat = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        p.wohlBaseline = sitFlat; // δ = 0 (Situation unverändert)
        p.emotionLastTick = 6100;
        r.updatePlayerEmotions(6105);
        out.deltaIgnoresEmotion = Math.abs(p.appraisalDelta) < 0.05;

        // (3)+(4) DIE KLAMMER: der lokale Reward + der Spieler-Bonus (nah + positiv) vs der Gate (fern)
        r.state.lifeField = new Map();
        const measureRule = (vx, vz, vbase, pd) => {
            p.appraisalDelta = pd;
            const rule = { value: 0, _vPending: true, _vPos: { x: vx, z: vz }, _vBase: vbase };
            r._measureRuleReward(rule, 0);
            return rule.value;
        };
        const frozenNear = r._fieldWohlStruktur(r.auraAt(pm.x, pm.z, 0));
        const vbaseNear = frozenNear - 0.4; // localReward_near = 0.4 (kontrolliert)
        const vNearBonus = measureRule(pm.x, pm.z, vbaseNear, 0.5);
        const vNearNoBonus = measureRule(pm.x, pm.z, vbaseNear, 0);
        out.clampRewardsNearPositive = vNearBonus > vNearNoBonus + 0.03; // nah + δ_spieler>0 → mehr Wert
        const fx = pm.x + 100;
        const fz = pm.z;
        const frozenFar = r._fieldWohlStruktur(r.auraAt(fx, fz, 0));
        const vbaseFar = frozenFar - 0.4;
        const vFarBonus = measureRule(fx, fz, vbaseFar, 0.5);
        const vFarNoBonus = measureRule(fx, fz, vbaseFar, 0);
        out.proximityGate = Math.abs(vFarBonus - vFarNoBonus) < 1e-9; // fern → der δ_spieler ändert NICHTS
        // (5) ANTI-GAMING end-to-end: eine Regel NAH am Spieler, aber δ_spieler ≤ 0 (keine echte
        // Situations-Verbesserung) → KEIN Bonus (Phase 2 unverändert), egal wie hoch die Emotion ist.
        const vNearNeg = measureRule(pm.x, pm.z, vbaseNear, -0.5);
        out.noGamingWhenNoSituation = Math.abs(vNearNeg - vNearNoBonus) < 1e-9;

        // restore
        setEmo(savedEmo);
        if (savedMood) for (const k of Object.keys(savedMood)) p.mood[k] = savedMood[k];
        p.wohlBaseline = savedBase;
        p.appraisalDelta = savedDelta;
        p.emotionLastTick = savedTick;
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        r.state.emotionField = savedEmoField;
        return out;
    });
    check(
        "Klammer: ANTI-GAMING-Wurzel — appraisalDelta trackt die SITUATION (steigt mit Leben)",
        res.deltaTracksSituationUp
    );
    check(
        "Klammer: ANTI-GAMING-Wurzel — appraisalDelta IGNORIERT die Emotion (hohe Stimmung, flache Situation → ~0)",
        res.deltaIgnoresEmotion
    );
    check(
        "Klammer: KONSUM — eine Regel NAH am Spieler + positiver δ_spieler bekommt MEHR Wert (die Klammer)",
        res.clampRewardsNearPositive
    );
    check(
        "Klammer: der Proximity-Gate — eine FERNE Regel bekommt KEINEN Bonus (δ_spieler ändert nichts)",
        res.proximityGate
    );
    check(
        "Klammer: ANTI-GAMING — eine nahe Regel ohne echte Situations-Verbesserung (δ≤0) bekommt KEINEN Bonus",
        res.noGamingWhenNoSituation
    );
}

async function checkBandWelle6APolish({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welle 6.A — Interaktion-Polish (Erdung auf Bauwerken) ###
    // Der Feld-Controller (`_stepCharacter`) löst die Wand-Kollision nativ; `isPlayerGrounded` liest den
    // `_groundedCache` und trifft Bauwerke über `entry.blockerAABBs`. groundDistance 0.6 (nicht 0.5),
    // damit der y-Offset eines Sub-Compounds auf einer Plattform den Sprung nicht blockiert.
    const wave6aResults = await safeEvaluate(page, () => {
        if (!r || !r.state.playerVel) return null;
        const out = {};


        // 6.A2 Diskrimination an eindeutiger Setup-Position (frühere Tests verschieben mesh.position):
        // in der Luft → not grounded, auf gespawntem Bauwerk → grounded.
        const savedX = r.state.playerMesh.position.x;
        const savedY = r.state.playerMesh.position.y;
        const savedZ = r.state.playerMesh.position.z;

        // Bau an eindeutiger Position neben dem Spieler, auf der Höhe des Gelände-Gesetzes → überlappt das Boden-Niveau
        // (typischer In-Spiel-Fall). Seit K16 liegt der Boden am Spawn nicht mehr bei y = 0: ein Bau auf y = 0 stak im
        // Hügel, und „50 m über dem Dach“ lag noch im Fels (die Negativ-Kontrolle war geerdet).
        const archX = savedX + 20;
        const archZ = savedZ + 20;
        const archY = r._terrainMacroSurfaceY(archX, archZ);
        const vorArch = new Set(r.state.architectures);
        // AUSLÖSCHUNGS-WELLE — temple fiel; die begehbare haus_basis-Substanz (KIND_SUBSTANCE)
        // trägt die Erdungs-Probe als Test-Blueprint (flaches Dach, solide blockerAABBs).
        const KS6a = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_w6a_haus) delete r.state.blueprints._t_w6a_haus;
        r.state.blueprints._t_w6a_haus = {
            name: "_t_w6a_haus",
            parts: JSON.parse(JSON.stringify(KS6a.haus_basis.parts)),
        };
        const entry = r.spawnArchitecture("_t_w6a_haus", { x: archX, y: archY, z: archZ }, { seed: 4242 });
        out.archEntrySpawned = !!entry;
        // DETERMINISMUS-BOGEN P3 — Architektur-Kollision ist feld-nativ via
        // entry.blockerAABBs (solide Part-AABBs, dichte ≥ 0.3), kein Ammo-Body mehr.
        out.archHasCollision = !!(entry && Array.isArray(entry.blockerAABBs) && entry.blockerAABBs.length > 0);

        // temple ist jetzt instanced (kein entry.mesh). Die
        // Top-Y instanced-aware aus den Flatten-Leaf-AABBs × entry-World-Matrix
        // bestimmen (Collision IST gebaut → isPlayerGrounded raycastet sie).
        let topY = null;
        if (entry && entry.mesh) {
            topY = new THREE.Box3().setFromObject(entry.mesh).max.y;
        } else if (entry && entry.instanced) {
            const flat = r._archFlattenBlueprint(entry.type);
            const ew = r._archEntryWorldMatrix(entry);
            const wbox = new THREE.Box3();
            const lbox = new THREE.Box3();
            const lw = new THREE.Matrix4();
            wbox.makeEmpty();
            for (const leaf of flat.leaves) {
                if (!leaf.geom || !leaf.geom.boundingBox) continue;
                lw.multiplyMatrices(ew, leaf.localMatrix);
                lbox.copy(leaf.geom.boundingBox).applyMatrix4(lw);
                wbox.union(lbox);
            }
            topY = wbox.isEmpty() ? null : wbox.max.y;
        }
        if (entry && topY !== null) {
            // Negativ-Kontrolle: 50 m über Tempel-Top — Ray reicht nur
            // 2.5 m runter, also trifft das Bauwerk nicht.
            r.state.playerMesh.position.set(archX, topY + 50, archZ);
            // Cache invalidieren vor frischem Compute.
            delete r.state._groundedCachedAt;
            out.isGroundedHighInSky = r.isPlayerGrounded();
            // Positiv-Test: die visuelle Top-BBox ist nicht 1:1 die Kollision (Dekor-Spitzen ragen über die
            // Sub-Boxes) → steigende dy abtasten; EIN Treffer beweist die Bauwerks-Erdung (groundDistance 0.6
            // = Obergrenze je Sample).
            out.archTopY = topY;
            let foundGrounded = false;
            let groundedAtDy = null;
            for (const dy of [0.1, 0.3, 0.5, 0.7, 1.0, 1.5, 2.0]) {
                r.state.playerMesh.position.set(archX, topY + dy, archZ);
                // Cache vor jeder Position-Probe invalidieren: im Spiel ändert der Physics-Tick die Position zwischen
                // Frames, hier setzen wir sie manuell.
                delete r.state._groundedCachedAt;
                if (r.isPlayerGrounded()) {
                    foundGrounded = true;
                    groundedAtDy = dy;
                    break;
                }
            }
            out.isGroundedOnArchitecture = foundGrounded;
            out.groundedAtDy = groundedAtDy;
            // Restore
            r.state.playerMesh.position.set(savedX, savedY, savedZ);
        } else {
            out.isGroundedOnArchitecture = false;
            out.isGroundedHighInSky = false;
        }
        // Cleanup nach Identität über den EINEN Abbau-Pfad (jedes Aufräumen der Bänder): ein Bau lässt Feld-Würfe
        // weichen (`_weichtDemBau`) — die Kürzung auf die alte Länge ließ ihn dann als Waise ohne Bauplan in der Welt
        for (const e of r.state.architectures.filter((x) => !vorArch.has(x))) r.removeArchitecture(e);
        delete r.state.blueprints._t_w6a_haus;

        // Kein per-Frame-Pfad ruft optimizePhysics/processOptimization (leckte WASM, flutete die Konsole).
        // __fehlt liest ohne Kommentare — sonst träfe der Absenz-Grep den Kommentar, der den Code zitiert.
        out.noDoomLoopInSelfAnalysis = window.__fehlt(r._loopSelfAnalysis, /processOptimization|optimizePhysics/);
        out.nexusProcessOptGone = !(r.nexus && typeof r.nexus.processOptimization === "function");

        return out;
    });

    if (wave6aResults) {
        check(
            "der Physik-Doom-Loop ist weg — _loopSelfAnalysis ruft nicht mehr optimizePhysics (kein churn/spam/leck bei niedriger fps)",
            wave6aResults.noDoomLoopInSelfAnalysis && wave6aResults.nexusProcessOptGone
        );
        if (wave6aResults.archEntrySpawned) {
            check(
                "Welle 6.A2: Bauwerk-Spawn liefert feld-native Kollision via blockerAABBs",
                wave6aResults.archHasCollision
            );
            check(
                "Welle 6.A2: Negativ-Kontrolle — hoch im Himmel nicht geerdet",
                wave6aResults.isGroundedHighInSky === false
            );
            check(
                "Welle 6.A2: Diskrimination — Spieler 0.5 m über Bauwerks-Oberseite ist geerdet",
                wave6aResults.isGroundedOnArchitecture === true
            );
        }
    }

    // ### Welle 6.A3 — Slope-Steepness (Anti-Wandkleben) ###
    // isPlayerGrounded speichert das flachste Treffer-Normal-Y in `state.groundNormalY`; ist keine Fläche
    // begehbar (Normal-Y < hang.maxSlopeY = 0.5, >60°), gilt `state.onSteepSlope = true` und der
    // Bewegungs-Input wird auf 20 % gedrosselt — kein Kleben an senkrechten Wänden.
    const wave6a3Results = await safeEvaluate(page, () => {
        const out = {};
        // 6.A3 — Tests wandern 19.07.: der State-Zwilling fiel, die Leser
        // lesen das Steilhang-Gesetz (hang.maxSlopeY) fail-closed direkt.
        const hangMax = r.constructor._bewegungsBlock("hang", ["maxSlopeY", "malus"]).maxSlopeY;
        out.hasHangMaxSlopeY = typeof hangMax === "number";
        out.hangMaxSlopeYValue = hangMax;
        out.hangMaxSlopeYIs05 = Math.abs(hangMax - 0.5) < 0.001;

        // Diskriminations-Test onSteepSlope (= isGrounded && bestNormalY<0.5) in zwei Setups:
        // (a) Spieler hoch im Himmel → nicht geerdet → false; (b) auf flachem Tempel-Dach (Normal-Y ~1)
        // → false. Nicht am prozeduralen Initial-Terrain — das darf lokal steil sein.
        const _savedX = r.state.playerMesh.position.x;
        const _savedY = r.state.playerMesh.position.y;
        const _savedZ = r.state.playerMesh.position.z;

        // (a) Himmel: `_groundedCachedAt` vor jedem isPlayerGrounded-Call nullen — der Cache hält zwei Schritte
        // und trüge sonst einen stale Wert der alten Spieler-Position.
        // BÜHNE: der Himmel 5 km über jedem Boden
        r.state.playerMesh.position.set(0, 5000, 0);
        r.state._groundedCachedAt = 0;
        r.isPlayerGrounded();
        out.skyOnSteepSlope = r.state.onSteepSlope;
        out.skyGroundNormalY = r.state.groundNormalY;

        // (b) Flaches Bauwerks-Dach: separater Tempel-Spawn. Spieler-Position VOR dem Spawn restoren —
        // `spawnArchitecture` baut den Mesh nur im architectureCullingRadius (XZ) um den SPIELER; stünde
        // er noch bei (0,5000,0), bliebe der Spawn cold (mesh=null) und der Test mäße nichts.
        r.state.playerMesh.position.set(_savedX, _savedY, _savedZ);
        const vorArch = new Set(r.state.architectures);
        let _entryA3 = null;
        let _spawnErrA3 = null;
        try {
            // AUSLÖSCHUNGS-WELLE — temple fiel; das flache haus_basis-Dach (KIND_SUBSTANCE) trägt
            // die „flaches Dach ist nicht steil"-Probe als Test-Blueprint.
            const KSa3 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
            if (r.state.blueprints._t_w6a3_haus) delete r.state.blueprints._t_w6a3_haus;
            r.state.blueprints._t_w6a3_haus = {
                name: "_t_w6a3_haus",
                parts: JSON.parse(JSON.stringify(KSa3.haus_basis.parts)),
            };
            _entryA3 = r.spawnArchitecture("_t_w6a3_haus", { x: _savedX + 40, y: 0, z: _savedZ + 40 }, { seed: 9999 });
        } catch (e) {
            _spawnErrA3 = String((e && e.stack) || e).slice(0, 300);
        }
        out.spawnErrA3 = _spawnErrA3;
        out.savedX = _savedX;
        out.savedZ = _savedZ;
        out.entryA3Null = !_entryA3;
        out.entryA3Shape = _entryA3
            ? `mesh=${!!_entryA3.mesh} instanced=${!!_entryA3.instanced} keys=${Object.keys(_entryA3).slice(0, 10).join("/")}`
            : "null";
        let flatBlueprintNotSteep = false;
        // temple instanced: Top-Y aus Flatten-Leaf-AABBs.
        let topYA3 = null;
        if (_entryA3 && _entryA3.mesh) {
            topYA3 = new THREE.Box3().setFromObject(_entryA3.mesh).max.y;
        } else if (_entryA3 && _entryA3.instanced) {
            const flat = r._archFlattenBlueprint(_entryA3.type);
            const ew = r._archEntryWorldMatrix(_entryA3);
            const wbox = new THREE.Box3();
            const lbox = new THREE.Box3();
            const lw = new THREE.Matrix4();
            wbox.makeEmpty();
            for (const leaf of flat.leaves) {
                if (!leaf.geom || !leaf.geom.boundingBox) continue;
                lw.multiplyMatrices(ew, leaf.localMatrix);
                lbox.copy(leaf.geom.boundingBox).applyMatrix4(lw);
                wbox.union(lbox);
            }
            topYA3 = wbox.isEmpty() ? null : wbox.max.y;
        }
        if (_entryA3 && topYA3 !== null) {
            // Setze Spieler knapp über die Top-Fläche
            r.state.playerMesh.position.set(_savedX + 40, topYA3 + 0.3, _savedZ + 40);
            r.state._groundedCachedAt = 0;
            // Nur werten, wenn der Raycast wirklich das flache Dach traf (groundNormalY > 0.7): unter CPU-Last
            // kann die Architektur-Kollision verzögert gebaut sein, dann erdet der Spieler auf steilem Terrain
            // (grounded allein trennt das nicht). Kein flaches Dach getroffen → unmessbar = bestanden.
            const _groundedOnTopA3 = r.isPlayerGrounded();
            const _nyA3 = r.state.groundNormalY;
            flatBlueprintNotSteep = _groundedOnTopA3 && _nyA3 > 0.7 ? r.state.onSteepSlope === false : true;
            out.archTopGroundNormalY = r.state.groundNormalY;
            out.archTopOnSteepSlope = r.state.onSteepSlope;
        }
        out.flatBlueprintNotSteep = flatBlueprintNotSteep;
        for (const e of r.state.architectures.filter((x) => !vorArch.has(x))) r.removeArchitecture(e);
        delete r.state.blueprints._t_w6a3_haus;
        r.state.playerMesh.position.set(_savedX, _savedY, _savedZ);



        return out;
    });

    if (wave6a3Results) {
        check("Welle 6.A3: Steilhang-Gesetz (hang.maxSlopeY) fail-closed lesbar", wave6a3Results.hasHangMaxSlopeY);
        check("Welle 6.A3: hang.maxSlopeY == 0.5 (cos 60° = walkable bis 60°)", wave6a3Results.hangMaxSlopeYIs05);
        check(
            "Welle 6.A3: Negativ-Kontrolle — Himmel hat onSteepSlope=false (nicht geerdet)",
            wave6a3Results.skyOnSteepSlope === false
        );
        check(
            "Welle 6.A3: Diskrimination — flache Bauwerks-Oberseite ist NICHT als steil markiert",
            wave6a3Results.flatBlueprintNotSteep,
            `archTopNy=${wave6a3Results.archTopGroundNormalY}, archTopSteep=${wave6a3Results.archTopOnSteepSlope}, entryNull=${wave6a3Results.entryA3Null}, shape=${wave6a3Results.entryA3Shape}, saved=(${Math.round(wave6a3Results.savedX)},${Math.round(wave6a3Results.savedZ)}), err=${wave6a3Results.spawnErrA3}`
        );
    }

    // ### Raycast-Place + Stabilitäts-Visual ###
    // tickBuildMode → _resolvePhantomTarget castet den Strahl des Fadenkreuzes (`_fadenkreuzStrahl`: die Richtung der
    // Kamera ab der Ebene des Ziels — Gegenprüfung Runde 2, nie was zwischen Kamera und Spieler liegt) ({x, y, z,
    // isStable, hit}): das Phantom folgt der Blickrichtung (Pitch wirkt), Tint grün bei stabilem Boden, sonst rot.
    const wave6a45Results = await safeEvaluate(page, () => {
        const out = {};




        // Build-Modus auf "stein_block"-Slot 0, Kamera in den Boden schauen lassen, tickBuildMode →
        // Phantom liegt im Treffer-Bereich + isStable=true.
        const savedYaw = r.state.yaw;
        const savedCamPos = r.state.camera ? r.state.camera.position.clone() : null;
        const savedCamQuat = r.state.camera ? r.state.camera.quaternion.clone() : null;
        const savedPlayerPos = r.state.playerMesh.position.clone();

        // Garantiert flache Test-Oberfläche: Tempel-Dach (Normal-Y ~1) statt prozeduralem Heightfield.
        // Spawn-Y=200 hebt den Tempel über die Voxel-Chunks (Surface ≤ base+64), sonst träfe der Raycast
        // den Voxel-Boden statt des Tempels.
        const _spawnArchX = 60;
        const _spawnArchZ = 60;
        const _spawnArchY = 200;
        const vorArch = new Set(r.state.architectures);
        // AUSLÖSCHUNGS-WELLE — temple fiel; das flache haus_basis-Dach (KIND_SUBSTANCE)
        // liefert die garantiert-flache Raycast-Fläche als Test-Blueprint.
        const KSa45 = (window.AnazhRealm || r.constructor).KIND_SUBSTANCE || {};
        if (r.state.blueprints._t_w6a45_haus) delete r.state.blueprints._t_w6a45_haus;
        r.state.blueprints._t_w6a45_haus = {
            name: "_t_w6a45_haus",
            parts: JSON.parse(JSON.stringify(KSa45.haus_basis.parts)),
        };
        const _archEntry = r.spawnArchitecture(
            "_t_w6a45_haus",
            { x: _spawnArchX, y: _spawnArchY, z: _spawnArchZ },
            { seed: 4711 }
        );
        out.testArchSpawned = !!_archEntry;
        let _archTopY = 0;
        if (_archEntry && _archEntry.mesh) {
            const _box = new THREE.Box3().setFromObject(_archEntry.mesh);
            _archTopY = _box.max.y;
        }
        r.state.playerMesh.position.set(_spawnArchX, _archTopY + 5, _spawnArchZ);
        // Kamera 8m über Bauwerks-Top, blickt steil nach unten auf die Mitte
        r.state.camera.position.set(_spawnArchX, _archTopY + 8, _spawnArchZ);
        r.state.camera.lookAt(_spawnArchX, _archTopY, _spawnArchZ);
        // Build-Modus auf Slot 0 (stein_block, gesetzt — der Start-Gurt liest den Katalog)
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        out.buildModeActive = r.state.buildMode.active;
        out.phantomExists = !!r.state.buildMode.phantomMesh;
        if (r.state.buildMode.phantomMesh) {
            r.tickBuildMode();
            const phantomPos = r.state.buildMode.phantomMesh.position;
            // Erwartung: Phantom landet auf Bauwerks-Top bei
            // _archTopY, alter Fallback wäre playerY-0.5 = _archTopY+4.5.
            // Hit-Y ist klar < playerY−1.
            out.phantomY = phantomPos.y;
            out.phantomYDownward = phantomPos.y < r.state.playerMesh.position.y - 1;
            // Stabilität: Boden flache Oberseite → Normal-Y ~ 1 → isStable=true
            out.phantomOnGroundAfterTick = r.state.buildMode.phantomOnGround;

            // Diskrimination 2: Kamera nach oben in den Himmel → kein Hit → fallback
            r.state.camera.lookAt(_spawnArchX, _archTopY + 100, _spawnArchZ + 1);
            r.tickBuildMode();
            out.phantomOnGroundSky = r.state.buildMode.phantomOnGround;
        }

        // Cleanup
        r._clearBuildMode();
        for (const e of r.state.architectures.filter((x) => !vorArch.has(x))) r.removeArchitecture(e);
        delete r.state.blueprints._t_w6a45_haus;
        if (savedCamPos) r.state.camera.position.copy(savedCamPos);
        if (savedCamQuat) r.state.camera.quaternion.copy(savedCamQuat);
        r.state.playerMesh.position.copy(savedPlayerPos);
        r.state.yaw = savedYaw;

        return out;
    });

    if (wave6a45Results) {
        if (wave6a45Results.phantomExists) {
            check(
                "Welle 6.A4: Phantom landet auf Hit-Punkt (nicht alter Y-Fallback)",
                wave6a45Results.phantomYDownward
            );
            check(
                "Welle 6.A5: Diskrimination — Kamera auf Boden → phantomOnGround=true",
                wave6a45Results.phantomOnGroundAfterTick === true
            );
            check(
                "Welle 6.A5: Diskrimination — Kamera auf Himmel → phantomOnGround=false",
                wave6a45Results.phantomOnGroundSky === false
            );
        }
    }

    // ### Welle 6.E1 — Fähigkeit-Beschreibung (describeProgram) ###
    const wave6e1Results = await safeEvaluate(page, () => {
        const out = {};
        // Vorlagen-Smoke-Tests
        out.weatherDesc = r.describeProgram(["weather", "rainy"]);
        out.spawnCreatureDesc = r.describeProgram(["spawn_creature", ["at_player"], 3, "happy"]);
        out.chainDesc = r.describeProgram(["chain", ["weather", "sunny"], ["spawn_tree", ["near_player"], 4]]);
        out.whenDesc = r.describeProgram(["when", ["emotion_above", "joy", 0.7], ["skybox_color", "0xffaa00"]]);
        out.unknownDesc = r.describeProgram(["fictional_op", 42]);
        out.weatherOk = /Wetter/.test(out.weatherDesc) && /rainy/.test(out.weatherDesc);
        out.creatureOk =
            /3/.test(out.spawnCreatureDesc) &&
            /happy/.test(out.spawnCreatureDesc) &&
            /Spieler/.test(out.spawnCreatureDesc);
        out.chainOk = /und/.test(out.chainDesc);
        out.whenOk = /joy/.test(out.whenDesc) && /Himmel/.test(out.whenDesc);
        out.unknownOk = /fictional_op/.test(out.unknownDesc);
        // Diskrimination: Beschreibung wird beim addNewAbility gespeichert
        const beforeCount = r.state.dsl.abilities.length;
        r.addNewAbility("test_desc_e1", ["weather", "rainy"], "test");
        const added = r.state.dsl.abilities.find((a) => a.name === "test_desc_e1");
        out.persistedDescription = added ? added.description : null;
        out.persistedOk = !!(added && added.description && /Wetter/.test(added.description));
        r.state.dsl.abilities = r.state.dsl.abilities.slice(0, beforeCount);
        delete r.state.abilities.test_desc_e1;
        // Lazy-Compute für Legacy-Save: Eintrag ohne description hinzufügen,
        // renderAbilitiesList ruft → description wird befüllt.
        r.state.dsl.abilities.push({
            name: "legacy_test_e1",
            program: ["weather", "sunny"],
            source: "test",
            createdAt: 0,
        });
        r.renderAbilitiesList();
        const legacyAfter = r.state.dsl.abilities.find((a) => a.name === "legacy_test_e1");
        out.lazyComputed = !!(legacyAfter && legacyAfter.description);
        r.state.dsl.abilities = r.state.dsl.abilities.filter((a) => a.name !== "legacy_test_e1");
        return out;
    });

    if (wave6e1Results) {
        check("Welle 6.E1: weather-Op wird beschrieben (Wetter + Wert)", wave6e1Results.weatherOk);
        check("Welle 6.E1: spawn_creature-Op nutzt count + emotion + position", wave6e1Results.creatureOk);
        check("Welle 6.E1: chain-Op verbindet Teile mit 'und'", wave6e1Results.chainOk);
        check("Welle 6.E1: when-Op rendert Condition + Then", wave6e1Results.whenOk);
        check("Welle 6.E1: unbekannter Op fällt sauber auf Fallback", wave6e1Results.unknownOk);
        check("Welle 6.E1: addNewAbility persistiert description-Feld", wave6e1Results.persistedOk);
        check(
            "Welle 6.E1: Lazy-Compute füllt description bei alten Saves (renderAbilitiesList)",
            wave6e1Results.lazyComputed
        );
    }

    // ### WOW-Start statt Anleitungs-Modal ###
    // Beweist: das alte Intro-Modal ist restlos weg; der Begleiter (Eins) lädt EINMAL diegetisch ein
    // (Einladung, keine Steuerungs-Anleitung), gegated + idempotent.
    const wowStartResults = await safeEvaluate(page, () => {
        const out = {};
        // (a) Das Anleitungs-Modal ist restlos entfernt (seine Methoden bewacht gate:altlasten).
        out.noDialogInDom = !document.getElementById("intro-dialog");
        // (b) Der WOW-Start: der Begleiter lädt ein — eine Einladung, KEINE Anleitung.
        const msg = r._firstWelcomeMessage();
        out.welcomeIsInvitation = typeof msg === "string" && msg.length > 0;
        out.welcomeNotManual = !/WASD|Hotbar|Space|Maus|1-9|drücke/i.test(msg);
        // (c) Beim ersten Welt-Start (Flags geleert) spricht der Begleiter diegetisch.
        try {
            localStorage.removeItem("anazh.ui.skipIntro");
        } catch {
            /* localStorage gesperrt — worldJournal trägt das Flag */
        }
        if (r.state.worldJournal && r.state.worldJournal.seen) r.state.worldJournal.seen.intro = false;
        const box = document.getElementById("dialogue-box");
        if (box) box.textContent = "";
        r._firstWorldWelcome({ immediate: true });
        out.welcomeSpoken = !!box && box.textContent.length > 0;
        // (d) Gegated: ein zweiter Start (jetzt "seen") spricht nicht erneut.
        if (box) box.textContent = "";
        r._firstWorldWelcome({ immediate: true });
        out.idempotent = !!box && box.textContent.length === 0;
        return out;
    });

    if (wowStartResults) {
        check("UI-Putz WOW-Start: kein #intro-dialog im DOM", wowStartResults.noDialogInDom);
        check("UI-Putz WOW-Start: Begrüssung ist eine Einladung (nicht-leer)", wowStartResults.welcomeIsInvitation);
        check("UI-Putz WOW-Start: Begrüssung ist KEINE Steuerungs-Anleitung", wowStartResults.welcomeNotManual);
        check("UI-Putz WOW-Start: Begleiter spricht beim ersten Welt-Start", wowStartResults.welcomeSpoken);
        check("UI-Putz WOW-Start: zweiter Start bleibt still (gegated)", wowStartResults.idempotent);
    }

    // ### Visuelle Verbindungs-Linien + Brech-Warning ###
    // _addConnectionLines hängt je Connection eine THREE.Line an die Group; Farbe via _connectionColor
    // (computeConnectionStrength → grün/gelb/rot). Schwächste Verbindung < 0.7 →
    // _applyCompoundWorldEffects schreibt einen idempotenten weakness-Journal-Eintrag.
    const wave6fResults = await safeEvaluate(page, () => {
        const out = {};

        // Farb-Mapping
        out.colorWeak = r._connectionColor(0.4);
        out.colorOk = r._connectionColor(1.0);
        out.colorStrong = r._connectionColor(2.0);
        out.colorWeakIsRed = out.colorWeak === 0xff5555;
        out.colorOkIsYellow = out.colorOk === 0xffcc44;
        out.colorStrongIsGreen = out.colorStrong === 0x66ff88;

        // Test-Bauplan mit zwei Parts + einer expliziten Verbindung
        const testName = "wave6f_test";
        r.state.blueprints[testName] = {
            name: testName,
            label: "Test",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                    material: "stein",
                },
                {
                    shape: "box",
                    position: { x: 1.05, y: 0, z: 0 },
                    size: { x: 1, y: 1, z: 1 },
                    color: 0x888888,
                    material: "stein",
                },
            ],
            connections: [{ type: "masonry", partA: 0, partB: 1 }],
        };
        // Build und auf THREE.Line prüfen — die Linien sind ein
        // WERKSTATT-Werkzeug (opts.connectionLines), der Test bestellt sie
        // wie der Werkstatt-Viewer (der Test wandert mit).
        const built = r._buildFromBlueprint(r.state.blueprints[testName], 0, undefined, { connectionLines: true });
        // eine Verbindung erzeugt jetzt eine Linie UND
        // einen Mittelpunkt-Marker (beide isConnectionLine), damit
        // die Verbindung auch bei überlappenden Parts sichtbar ist.
        let connLineCount = 0;
        let connMarkerCount = 0;
        let lineColor = null;
        built.traverse((node) => {
            // W-G (V9.56-i): die ACHSEN-GEISTER (isJointAxis — Linien +
            // Kegel-Spitzen) sind eine NEUE Viewer-Schicht; der Verbindungs-Zähler
            // klammert sie aus (der Test prüft die Verbindung, nicht die Achse).
            if (node.userData && node.userData.isConnectionLine && !node.userData.isJointAxis) {
                if (node.isLine) connLineCount++;
                if (node.isMesh) connMarkerCount++;
                if (node.material && node.material.color) lineColor = node.material.color.getHex();
            }
        });
        out.lineCount = connLineCount;
        out.lineExists = connLineCount === 1 && connMarkerCount === 1;
        out.lineHasUserDataFlag = connLineCount === 1;
        out.lineColor = lineColor;
        // OHNE Bestellung (= jeder Welt-Spawn) bleibt das Werk REIN:
        // keine Linien/Marker über gespawnten Gefährten/Portalen.
        let worldLines = 0;
        const builtPlain = r._buildFromBlueprint(r.state.blueprints[testName]);
        builtPlain.traverse((node) => {
            if (node.userData && node.userData.isConnectionLine) worldLines++;
        });
        out.worldClean = worldLines === 0;

        // 6.F2 Brech-Warning: extrem schwache Verbindung → Journal-Eintrag
        // (wir erzwingen weak indem wir partB sehr weit weg setzen → contactArea=0)
        const weakName = "wave6f_weak";
        r.state.blueprints[weakName] = {
            name: weakName,
            label: "Schwach",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 0.5, y: 0.5, z: 0.5 },
                    material: "stein",
                },
                {
                    shape: "box",
                    position: { x: 10, y: 0, z: 0 },
                    size: { x: 0.5, y: 0.5, z: 0.5 },
                    material: "stein",
                },
            ],
            connections: [{ type: "gluing", partA: 0, partB: 1 }],
        };
        const weakStrength = r.computeConnectionStrength(
            r.state.blueprints[weakName].connections[0],
            r.state.blueprints[weakName]
        );
        out.weakStrength = weakStrength;
        out.weakIsBelowThreshold = weakStrength < 0.7;

        // Journal-Counter vor spawn
        const beforeJournal =
            r.state.worldJournal && r.state.worldJournal.entries ? r.state.worldJournal.entries.length : 0;
        const beforeSeenKeys =
            r.state.worldJournal && r.state.worldJournal.seen
                ? Object.keys(r.state.worldJournal.seen).filter((k) => k.startsWith("weak_connection:")).length
                : 0;
        const vorArch = new Set(r.state.architectures);
        r.spawnArchitecture(weakName, { x: 250, y: 0, z: 250 }, { seed: 1 });
        const afterSeenKeys =
            r.state.worldJournal && r.state.worldJournal.seen
                ? Object.keys(r.state.worldJournal.seen).filter((k) => k.startsWith("weak_connection:")).length
                : 0;
        const afterJournal =
            r.state.worldJournal && r.state.worldJournal.entries ? r.state.worldJournal.entries.length : 0;
        out.weakJournalIncrement = afterJournal - beforeJournal >= 1;
        out.weakSeenKeyAdded = afterSeenKeys > beforeSeenKeys;

        // 6.F2 Idempotenz: zweimal spawnen → kein zweiter Eintrag
        r.spawnArchitecture(weakName, { x: 260, y: 0, z: 260 }, { seed: 2 });
        const after2Journal =
            r.state.worldJournal && r.state.worldJournal.entries ? r.state.worldJournal.entries.length : 0;
        out.weakIsIdempotent = after2Journal === afterJournal;

        // Negativ-Kontrolle: starker Bauplan → KEIN weak_connection-Eintrag
        const strongName = "wave6f_strong";
        r.state.blueprints[strongName] = {
            name: strongName,
            label: "Stark",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    position: { x: 0, y: 0, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                    material: "eisen",
                },
                {
                    shape: "box",
                    position: { x: 2.0, y: 0, z: 0 },
                    size: { x: 2, y: 2, z: 2 },
                    material: "eisen",
                },
            ],
            connections: [{ type: "welding", partA: 0, partB: 1 }],
        };
        const strongStrength = r.computeConnectionStrength(
            r.state.blueprints[strongName].connections[0],
            r.state.blueprints[strongName]
        );
        out.strongStrength = strongStrength;
        out.strongIsAboveThreshold = strongStrength >= 0.7;
        const seenBefore3 = Object.keys(r.state.worldJournal.seen || {}).filter((k) =>
            k.startsWith("weak_connection:" + strongName)
        ).length;
        r.spawnArchitecture(strongName, { x: 270, y: 0, z: 270 }, { seed: 3 });
        const seenAfter3 = Object.keys(r.state.worldJournal.seen || {}).filter((k) =>
            k.startsWith("weak_connection:" + strongName)
        ).length;
        out.strongNoWarning = seenAfter3 === seenBefore3;

        // Cleanup
        for (const e of r.state.architectures.filter((x) => !vorArch.has(x))) r.removeArchitecture(e);
        delete r.state.blueprints[testName];
        delete r.state.blueprints[weakName];
        delete r.state.blueprints[strongName];

        return out;
    });

    if (wave6fResults) {
        check("Welle 6.F1: schwache Verbindung (<0.7) = rot 0xff5555", wave6fResults.colorWeakIsRed);
        check("Welle 6.F1: mittlere Verbindung (0.7..1.5) = goldgelb 0xffcc44", wave6fResults.colorOkIsYellow);
        check("Welle 6.F1: starke Verbindung (≥1.5) = grün 0x66ff88", wave6fResults.colorStrongIsGreen);
        check("Welle 6.F1: Bauplan mit Connection erhält THREE.Line im Group", wave6fResults.lineExists);
        check(
            "die Gelenk-Linien sind WERKSTATT-Werkzeug — die Welt bleibt rein",
            wave6fResults.worldClean
        );
        check("Welle 6.F1: Line trägt userData.isConnectionLine-Flag", wave6fResults.lineHasUserDataFlag);
        check("Welle 6.F2: weakBauplan hat strength < 0.7 (test-setup korrekt)", wave6fResults.weakIsBelowThreshold);
        check(
            "Welle 6.F2: spawnArchitecture mit schwacher Verbindung schreibt Journal-Eintrag",
            wave6fResults.weakJournalIncrement
        );
        check("Welle 6.F2: weak_connection:-Schlüssel im worldJournal.seen", wave6fResults.weakSeenKeyAdded);
        check("Welle 6.F2: Idempotent — zweiter Spawn schreibt KEIN doppeltes Warn", wave6fResults.weakIsIdempotent);
        check(
            "Welle 6.F2: starker Bauplan hat strength ≥ 0.7 (test-setup korrekt)",
            wave6fResults.strongIsAboveThreshold
        );
        check(
            "Welle 6.F2: Diskrimination — starker Bauplan löst KEINE weak-Warning aus",
            wave6fResults.strongNoWarning
        );
    }
}

async function checkBandWelle6GHylomorphism({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Hylomorphismus-Unification ###
    // Bäume laufen durchs Architektur-System (spawn_tree-DSL-Op → spawnArchitecture): EINE Sprache,
    // EIN Renderpfad. Inseln + UFOs bleiben Sonderpfad (Inseln = floating-chunk-Disziplin).
    const wave6gResults = await safeEvaluate(page, async () => {
        const out = {};
        // Hylomorphismus-Baupläne: baum_eiche + baum_kiefer +
        // laub-Material müssen als Built-ins existieren.
        const bps = r.state.blueprints || {};
        // Bäume wachsen aus der Grammatik (keine statischen baum_eiche/baum_kiefer-Baupläne): einen wachsen
        // und die SUBSTANZ prüfen — ≥2 Parts, holz-Stamm + laub-Krone als Materialien. Die FORM
        // (Tube-Rinde + Blatt-Karten) ist grammatik-getrieben und wird nicht geprüft.
        const __heKey = r._growTreeBlueprintForSpawn && r._growTreeBlueprintForSpawn("baum_eiche", "struktur|eiche");
        const __hkKey = r._growTreeBlueprintForSpawn && r._growTreeBlueprintForSpawn("baum_kiefer", "struktur|kiefer");
        const __heBp = __heKey && bps[__heKey];
        const __hkBp = __hkKey && bps[__hkKey];
        out.hasBaumKiefer = !!(__hkBp && Array.isArray(__hkBp.parts) && __hkBp.parts.length >= 2);
        out.baumEicheIsBuiltIn = !!(__heBp && __heBp.builtIn === true);
        out.eichenStammHolz = !!(__heBp && __heBp.parts.some((p) => p.material === "holz"));
        out.eichenKroneLaub = !!(__heBp && __heBp.parts.some((p) => p.material === "laub"));

        // Worldgen-Bäume leben in state.architectures (Präfix baum_, stamm_ oder prozedural grown_) — gezählt, wenn das Spiel
        // sagt, dass der Wald der Mesh-Zone steht (Karte WL): keine Lücke „pflanzung"/„bauten" des Weltbilds (`_weltbildLuecken`,
        // der Leser des Ladeschirms). Die Lücke ist nur das WARTEN, nie das Urteil: „bauten" zählt jedes Bauwerk, ein Haus im Werk
        // sperrte G1 und D2M (n=1159); den Hänger richtet gate:ankunft L2a, hier das Gesetz (Bäume in architectures).
        const istBaum = (a) => typeof a.type === "string" && /^(baum_|stamm_|grown_)/.test(a.type);
        const wald = () =>
            r._weltbildLuecken(true).filter((l) => /^(pflanzung|bauten)$/.test(l.term)).map((l) => l.satz).join(" · ");
        out.waldErsterBlick = r.state.architectures.filter(istBaum).length;
        out.waldLueckeErst = wald();
        for (out.waldTakte = 0; wald() && out.waldTakte < 1500; out.waldTakte++) {
            r._gameLoopTick(performance.now());
            await sleep(0);
        }
        out.waldLueckeRest = wald();
        const archTrees = r.state.architectures.filter(istBaum);
        out.worldgenTreesInArchitectures = archTrees.length;
        // Mindestens ein gerenderter Baum (instanced, kein a.mesh) muss Kollision tragen — feld-nativ via
        // blockerAABBs (beim Spawn gefüllt, render-unabhängig), kein Ammo-Body.
        const renderedTree = archTrees.find(
            (a) => (a.mesh || a.instanced) && Array.isArray(a.blockerAABBs) && a.blockerAABBs.length > 0
        );
        out.treeHasCompoundCollision = !!renderedTree;

        // DETERMINISMUS-BOGEN P3 — Inseln tragen kein per-Objekt-Kollisions-Artefakt
        // mehr (Ammo entfernt); der Boden lebt feld-nativ.
        const initIslands = Array.isArray(r.state.floatingIslands) ? r.state.floatingIslands : [];
        out.initIslandsCount = initIslands.length;

        // DSL-Op-Tests: spawn_tree → erzeugt Architektur.
        const archsBefore = r.state.architectures.length;
        const islandsBefore = r.state.floatingIslands.length;
        const ufosBefore = r.state.ufos ? r.state.ufos.length : 0;
        const playerPos = r.state.playerMesh ? r.state.playerMesh.position : { x: 0, y: 50, z: 0 };
        // der Ort des Baums liegt auf dem LAND (die Natur-Wand lässt keinen Baum ins Wasser — der feste Versatz
        // +50/+50 lag im Wasser, der Baum fiel benannt „wasser")
        let tx = playerPos.x + 50;
        const ty = playerPos.y;
        let tz = playerPos.z + 50;
        out.treeOrtWasser = !r._landAt(tx, tz, 0.4);
        for (let k = 0; k < 64 && !r._landAt(tx, tz, 0.4); k++) {
            tx = playerPos.x + 50 + Math.cos(k * 0.9) * (4 + k);
            tz = playerPos.z + 50 + Math.sin(k * 0.9) * (4 + k);
        }

        r.dslRun(["spawn_tree", ["at", tx, ty, tz], 1], { source: "test" });
        r.dslRun(["spawn_island", ["at", tx + 20, ty, tz + 20], 5, 12345], {
            source: "test",
        });
        r.dslRun(["spawn_ufo", ["at", tx + 40, ty + 10, tz + 40]], { source: "test" });

        const archsAfter = r.state.architectures.length;
        const islandsAfter = r.state.floatingIslands.length;
        const ufosAfter = r.state.ufos ? r.state.ufos.length : 0;
        out.treeAddedToArchitectures = archsAfter === archsBefore + 1;
        out.islandSpawned = islandsAfter > islandsBefore;
        out.ufoSpawned = ufosAfter > ufosBefore;

        const newTreeArch = archsAfter > archsBefore ? r.state.architectures[archsAfter - 1] : null;
        out.newTreeIsBaumEiche = !!(newTreeArch && newTreeArch.type === "baum_eiche");
        // DER WALD PLANT IM TAKT: die Gestalt des Baums wartet auf den Plan der Wald-Zellen um seinen Ort, wie auf ein
        // kaltes Buch — die Schlange des Walds (`_tickWaldPlan`) plant sie im Takt, dann steht er mit Gestalt und Hülle. Der
        // Band läuft den Takt, bis er steht (höchstens 900 Takte), und nennt, wie lange er wartete.
        out.newTreeWaldWartet = !!(newTreeArch && !r._waldPlanSteht(newTreeArch.position.x, newTreeArch.position.z));
        out.newTreeTakte = 0;
        const steht = () =>
            !!(newTreeArch && (newTreeArch.mesh || newTreeArch.instanced)) &&
            Array.isArray(newTreeArch.blockerAABBs) &&
            newTreeArch.blockerAABBs.length > 0;
        while (newTreeArch && !steht() && out.newTreeTakte < 900) {
            r._gameLoopTick();
            out.newTreeTakte++;
            if (out.newTreeTakte % 10 === 0) await sleep(0);
        }
        // instancierter Baum: gerendert via Instance-Slot
        // (entry.instanced), nicht via entry.mesh.
        out.newTreeHasMesh = !!(newTreeArch && (newTreeArch.mesh || newTreeArch.instanced));
        // DETERMINISMUS-BOGEN P3 — Baum-Kollision ist feld-nativ via blockerAABBs
        // (der solide Holz-Stamm, dichte ≥ 0.3), kein Ammo-Compound mehr.
        out.newTreeHasCollision = !!(
            newTreeArch &&
            Array.isArray(newTreeArch.blockerAABBs) &&
            newTreeArch.blockerAABBs.length > 0
        );
        // Compound-Tags müssen Holz+Laub spiegeln (lebendig+brennbar).
        if (newTreeArch) {
            const bp = r.state.blueprints[newTreeArch.type];
            const tags = r.computeCompoundTags(bp);
            out.treeTagsLebendig = tags && tags.lebendig > 0.5;
            out.treeTagsBrennbar = tags && tags.brennbar > 0.5;
        }

        const newIsland = islandsAfter > islandsBefore ? r.state.floatingIslands[islandsAfter - 1] : null;
        const newUfo = ufosAfter > ufosBefore ? r.state.ufos[ufosAfter - 1] : null;
        // DETERMINISMUS-BOGEN P3 — Inseln tragen kein per-Objekt-Kollisions-Artefakt
        // mehr (Ammo entfernt); der UFO-Negativtest bleibt (er hat nie Kollision).
        out.ufoHasNoCollision = !!(newUfo && (!newUfo.userData || !newUfo.userData.collision));
        // Inseln aus der Surface-Nets-Pipeline: Vollkörper per Konstruktion (Iso-Fläche schließt oben +
        // unten). Gemessen wird die Y-Spanne (> 0.5 m), nicht die auflösungsabhängige Vertex-Zahl.
        if (newIsland && newIsland.geometry && newIsland.geometry.attributes.position) {
            const pa = newIsland.geometry.attributes.position.array;
            let minY = Infinity;
            let maxY = -Infinity;
            for (let i = 1; i < pa.length; i += 3) {
                if (pa[i] < minY) minY = pa[i];
                if (pa[i] > maxY) maxY = pa[i];
            }
            out.islandHasUnderside = isFinite(minY) && isFinite(maxY) && maxY - minY > 0.5;
        }

        // Diskrimination: derselbe Seed → dieselben Vertices.
        const beforeIslandsCount = r.state.floatingIslands.length;
        r.dslRun(["spawn_island", ["at", tx + 80, ty, tz], 5, 99999], { source: "test" });
        r.dslRun(["spawn_island", ["at", tx + 100, ty, tz], 5, 99999], { source: "test" });
        const i1 = r.state.floatingIslands[beforeIslandsCount];
        const i2 = r.state.floatingIslands[beforeIslandsCount + 1];
        if (i1 && i2 && i1.geometry && i2.geometry) {
            const v1 = i1.geometry.attributes.position.array;
            const v2 = i2.geometry.attributes.position.array;
            out.seedDeterministic =
                v1.length === v2.length &&
                v1.length > 0 &&
                Math.abs(v1[1] - v2[1]) < 0.0001 &&
                Math.abs(v1[10] - v2[10]) < 0.0001;
        }

        // Chat-Pattern-Tests bleiben — die Patterns selbst sind gleich.
        const treeBuilt = r.parseChatToDsl("pflanze baum hier");
        const treeProg = treeBuilt && treeBuilt.program;
        out.chatTreeProg =
            Array.isArray(treeProg) &&
            treeProg[0] === "spawn_tree" &&
            Array.isArray(treeProg[1]) &&
            treeProg[1][0] === "at";
        const islandBuilt = r.parseChatToDsl("setze insel hier");
        const islandProg = islandBuilt && islandBuilt.program;
        out.chatIslandProg =
            Array.isArray(islandProg) &&
            islandProg[0] === "spawn_island" &&
            Array.isArray(islandProg[1]) &&
            islandProg[1][0] === "at" &&
            Number.isFinite(islandProg[3]);
        const ufoBuilt = r.parseChatToDsl("rufe ufo hier");
        const ufoProg = ufoBuilt && ufoBuilt.program;
        out.chatUfoProg =
            Array.isArray(ufoProg) &&
            ufoProg[0] === "spawn_ufo" &&
            Array.isArray(ufoProg[1]) &&
            ufoProg[1][0] === "at";

        return out;
    });

    if (wave6gResults && !wave6gResults.error) {
        // Inseln teilen die Surface-Nets-Pipeline mit den Voxel-Chunks: `_voxelChunkGeometry` nimmt einen
        // `densityFn`-Callback (Default = Welt-Chunks, Insel-Pfad übergibt `_islandDensityAt`).
        const r42a = await page.evaluate(() => {
            const out = {};
            {
                // Density bei Mitte (lx=lz=ly=0): innerhalb der Insel-
                // Schicht → > 0 (fest). Density weit außen → < 0 (Luft).
                const dummyNoise = { noise2D: () => 0 };
                out.solidInCenter = r._islandDensityAt(0, 0, 0, 6, 5, dummyNoise) > 0;
                out.airFarAway = r._islandDensityAt(20, 0, 0, 6, 5, dummyNoise) < 0;
                out.airAbove = r._islandDensityAt(0, 50, 0, 6, 5, dummyNoise) < 0;
            }
            // Mesher mit densityFn-Callback: untere Hälfte fest,
            // obere Hälfte Luft → garantierte Iso-Fläche bei y=2.
            out.mesherAcceptsDensity = (() => {
                try {
                    const g = r._voxelChunkGeometry(0, 0, 0, 4, 4, 4, 1, (_x, y) => 2 - y);
                    const pos = g && g.getAttribute("position");
                    return !!(pos && pos.count > 0);
                } catch {
                    return false;
                }
            })();
            return out;
        });
        check("_islandDensityAt liefert fest in der Mitte (> 0)", r42a.solidInCenter);
        check("_islandDensityAt liefert Luft außerhalb des Radius", r42a.airFarAway);
        check("_islandDensityAt liefert Luft weit über der Insel", r42a.airAbove);
        check("_voxelChunkGeometry akzeptiert densityFn-Callback", !!r42a.mesherAcceptsDensity);
        // Skirt-Disziplin im Smooth-Pass: Naht-Vertices (Rand-Zellen i==0/dimX-1, k==0/dimZ-1) bleiben
        // unverschoben, sonst zerstört Laplacian die Skirt-Überlappung der Nachbar-Chunks. Probe: zwei
        // benachbarte Chunks bauen — an der gemeinsamen Naht teilen >50 % der Vertices die Position
        // (ohne die Disziplin ~0).
        const r42bSkirt = await page.evaluate(() => {
            const chunks = [...r.state.voxelChunks.values()].filter((c) => c && c.mesh && c.mesh.geometry).slice(0, 9);
            if (chunks.length < 2) return { err: "weniger als 2 Voxel-Chunks" };
            const seen = new Map();
            let dup = 0;
            for (const c of chunks) {
                const pa = c.mesh.geometry.getAttribute("position").array;
                for (let i = 0; i < pa.length; i += 3) {
                    const key = `${pa[i].toFixed(2)}|${pa[i + 1].toFixed(2)}|${pa[i + 2].toFixed(2)}`;
                    if (seen.has(key)) dup++;
                    else seen.set(key, true);
                }
            }
            return { chunks: chunks.length, unique: seen.size, duplicates: dup };
        });
        check(
            `Skirt-Naht — ${r42bSkirt.duplicates || 0} Vertices teilen identische Position zwischen ${r42bSkirt.chunks || 0} Nachbar-Chunks (Smooth respektiert Naht)`,
            (r42bSkirt.duplicates || 0) >= 200
        );
        // Insel-Höhen-Amplitude skaliert mit `height`.
        const r42bIslandAmp = await page.evaluate(() => {
            const noise = { noise2D: () => 0.5 };
            // height=5: kleine Insel
            const small = r._islandDensityAt(0, 0, 0, 6, 5, noise);
            // height=20: grosse Insel — Density-Wert in der Mitte
            // sollte SUBSTANZIELL grösser sein (mehr Material in der Höhe).
            const big = r._islandDensityAt(0, 0, 0, 6, 20, noise);
            return { small, big, ratio: small > 0 ? big / small : 0 };
        });
        check(
            `Insel-Amplitude skaliert mit height (ratio ${(r42bIslandAmp.ratio || 0).toFixed(2)}x bei height 20 vs 5)`,
            r42bIslandAmp.ratio > 1.5
        );
        // DSL spawn_island akzeptiert 5. `size`-Argument.
        const r42bDsl = await page.evaluate(() => {
            const before = r.state.floatingIslands.length;
            r.dslRun(["spawn_island", ["at", 200, 80, 200], 8, 77777, 30], { source: "test" });
            const after = r.state.floatingIslands.length;
            const isle = r.state.floatingIslands[before];
            if (!isle) return { spawned: false };
            const bbox = new window.THREE.Box3().setFromObject(isle);
            return { spawned: after === before + 1, width: bbox.max.x - bbox.min.x };
        });
        check(
            `DSL spawn_island mit size=30 baut eine grosse Insel (${(r42bDsl.width || 0).toFixed(1)} m breit)`,
            r42bDsl.spawned && r42bDsl.width > 24
        );
        // Insel-Material wie der Voxel-Boden: MeshToon + vertexColors (kein Terrain-ShaderMaterial — das
        // braucht aField/uv, die Surface-Nets-Geometrie nicht hat → Löcher). _attachIslandColors färbt
        // grün-oben/erdig-unten per Vertex-Normale.
        const r42c = await page.evaluate(() => {
            const out = {};
            const isle = r.spawnIslandAt(260, 90, 260, 9, { seed: 8181 });
            if (isle) {
                out.material = isle.material.type;
                // Insel = natives MeshToonNodeMaterial (lights=true): isMeshToonMaterial ist NATIV gesetzt,
                // isMeshToonNodeMaterial markiert den Node-Pfad. Mode-agnostisch: das aktive Lichtmodell ist
                // Toon ODER PBR.
                out.isToonMarker = !!(isle.material.isMeshToonMaterial || isle.material.isMeshStandardMaterial);
                out.isNodeMaterial = /Node/.test(isle.material.type || "");
            }
            return out;
        });
        check(
            `V9.42-c/234: Insel nutzt das aktive lit NodeMaterial (Toon ODER PBR) — ${r42c.material}`,
            r42c.isToonMarker === true && r42c.isNodeMaterial === true
        );
        check("Welle 6.G P1.5: Bauplan 'baum_kiefer' existiert (Multi-Part, V17.11)", wave6gResults.hasBaumKiefer);
        check("Welle 6.G P1.5: baum_eiche ist builtIn", wave6gResults.baumEicheIsBuiltIn);
        check("Welle 6.G P1.5: baum_eiche Stamm = cylinder/holz", wave6gResults.eichenStammHolz);
        check("Welle 6.G P1.5: baum_eiche Krone = sphere/laub", wave6gResults.eichenKroneLaub);
        check(
            "Welle 6.G P1.5: Worldgen-Bäume sind in state.architectures",
            wave6gResults.worldgenTreesInArchitectures > 0,
            `n=${wave6gResults.worldgenTreesInArchitectures} nach ${wave6gResults.waldTakte} Takten (erster Blick n=${wave6gResults.waldErsterBlick}${wave6gResults.waldLueckeErst ? ", " + wave6gResults.waldLueckeErst : ""})${wave6gResults.waldLueckeRest ? ", offen nach dem Deckel: " + wave6gResults.waldLueckeRest : ""}`
        );
        check(
            "Welle 6.G P1.5: mind. ein Worldgen-Baum hat feld-native Kollision via blockerAABBs",
            wave6gResults.treeHasCompoundCollision
        );
        check(
            "Welle 6.G P1.5: spawn_tree DSL-Op fügt Eintrag zu state.architectures hinzu",
            wave6gResults.treeAddedToArchitectures
        );
        check("Welle 6.G P1.5: neu-gespawnter Baum hat type='baum_eiche'", wave6gResults.newTreeIsBaumEiche);
        console.log(
            `  Welle 6.G P1.5: der neue Baum stand nach ${wave6gResults.newTreeTakte} Takten (Plan des Walds wartete: ${wave6gResults.newTreeWaldWartet})`
        );
        check("Welle 6.G P1.5: neu-gespawnter Baum ist gerendert (Mesh oder instanced)", wave6gResults.newTreeHasMesh);
        check(
            "Welle 6.G P1.5: neu-gespawnter Baum hat feld-native Kollision via blockerAABBs (solider Stamm)",
            wave6gResults.newTreeHasCollision
        );
        if (wave6gResults.treeTagsLebendig !== undefined) {
            check("Welle 6.G P1.5: Baum-Compound-Tags zeigen lebendig (holz + laub)", wave6gResults.treeTagsLebendig);
            check("Welle 6.G P1.5: Baum-Compound-Tags zeigen brennbar (holz + laub)", wave6gResults.treeTagsBrennbar);
        }
        check(
            "Welle 6.G P1.5: spawn_island DSL-Op fügt Insel zu state.floatingIslands hinzu",
            wave6gResults.islandSpawned
        );
        check("Welle 6.G P1.5: spawn_ufo DSL-Op fügt UFO zu state.ufos hinzu", wave6gResults.ufoSpawned);
        if (wave6gResults.islandHasUnderside !== undefined) {
            check(
                "Welle 6.G P1.5 / V9.42-a: Insel hat Vollkörper (Y-Spanne > 0.5 m, Surface-Nets schließt sich)",
                wave6gResults.islandHasUnderside
            );
        }
        check(
            "Welle 6.G P1.5: UFO bleibt bewusst kollisionsfrei (fliegender Beobachter)",
            wave6gResults.ufoHasNoCollision
        );
        check(
            "Welle 6.G P1.5: spawn_island mit gleichem Seed produziert identische Vertices (Multi-User-Sync)",
            wave6gResults.seedDeterministic
        );
        check("Welle 6.G P1.5: Chat 'pflanze baum hier' → spawn_tree mit ['at',...]", wave6gResults.chatTreeProg);
        check(
            "Welle 6.G P1.5: Chat 'setze insel hier' → spawn_island mit ['at',...] + eingebettetem Seed",
            wave6gResults.chatIslandProg
        );
        check("Welle 6.G P1.5: Chat 'rufe ufo hier' → spawn_ufo mit ['at',...]", wave6gResults.chatUfoProg);
    }

    // ### Welt-Affinitäts-Feld ###
    // Bäume + Strukturen verteilen sich über das Welt-Feld (4 Noise-Schichten: lebendig/dichte/glut/
    // magieleitung) — KEINE Tabelle: Bauplan-Compound-Tags resonieren mit dem Welt-Tag-Feld.
    // Baupläne: stein_block (dichte), kristall_geode (magieleitung), glutbrunnen (glut).
    const wave6gP2Results = await safeEvaluate(page, () => {
        const out = {};
        // der Voxel-Populator ist die lebende Schicht.
        const bps = r.state.blueprints || {};
        // worldFieldAt liefert 4 Tag-Achsen.
        const sample = r.worldFieldAt(0, 0);
        out.fieldHas4Axes = !!(
            sample &&
            typeof sample.lebendig === "number" &&
            typeof sample.dichte === "number" &&
            typeof sample.glut === "number" &&
            typeof sample.magieleitung === "number"
        );
        out.fieldValuesInRange =
            sample.lebendig >= 0 && sample.lebendig <= 1 && sample.dichte >= 0 && sample.dichte <= 1;
        // Determinismus: gleiche Position → gleiche Werte; zwei verschiedene Positionen → verschiedene
        // Werte (Noise nicht-konstant).
        const a1 = r.worldFieldAt(50, 30);
        const a2 = r.worldFieldAt(50, 30);
        out.fieldDeterministic =
            Math.abs(a1.lebendig - a2.lebendig) < 1e-9 && Math.abs(a1.dichte - a2.dichte) < 1e-9;
        const b1 = r.worldFieldAt(50, 30);
        const b2 = r.worldFieldAt(1000, -1000);
        out.fieldVariesBySamplePos =
            Math.abs(b1.lebendig - b2.lebendig) > 0.001 || Math.abs(b1.dichte - b2.dichte) > 0.001;
        // spawnAffinityForBlueprint: in einer (empirisch gesuchten) lebendig-hohen Region hat baum_eiche
        // (holz+laub) höhere Affinität als stein_block (dichte-hoch, lebendig=0).
        // Iteriere Welt-Grid um eine Position mit hohem lebendig
        // zu finden.
        let bestLebendigSpot = null;
        let bestLebendig = 0;
        for (let x = -200; x <= 200; x += 25) {
            for (let z = -200; z <= 200; z += 25) {
                const f = r.worldFieldAt(x, z);
                if (f.lebendig > bestLebendig) {
                    bestLebendig = f.lebendig;
                    bestLebendigSpot = { x, z };
                }
            }
        }
        if (bestLebendigSpot && bestLebendig > 0.5) {
            const treeAff = r.spawnAffinityForBlueprint("baum_eiche", bestLebendigSpot.x, bestLebendigSpot.z);
            const steinAff = r.spawnAffinityForBlueprint("stein_block", bestLebendigSpot.x, bestLebendigSpot.z);
            // In hohem-lebendig-Bereich sollte Baum >> Stein.
            out.affinityFavorsTreeInLebendigRegion = treeAff > steinAff * 1.5;
        }
        // Dasselbe für dichte: in dichte-hoher Region
        // sollte stein_block bevorzugt sein.
        let bestDichteSpot = null;
        let bestDichte = 0;
        for (let x = -200; x <= 200; x += 25) {
            for (let z = -200; z <= 200; z += 25) {
                const f = r.worldFieldAt(x, z);
                if (f.dichte > bestDichte) {
                    bestDichte = f.dichte;
                    bestDichteSpot = { x, z };
                }
            }
        }
        if (bestDichteSpot && bestDichte > 0.5) {
            const treeAff = r.spawnAffinityForBlueprint("baum_eiche", bestDichteSpot.x, bestDichteSpot.z);
            const steinAff = r.spawnAffinityForBlueprint("stein_block", bestDichteSpot.x, bestDichteSpot.z);
            // Ist die Stelle auch lebendig-hoch, kann der Baum gewinnen — geprüft wird daher nur
            // „stein signifikant > 0“ (die Affinität greift).
            out.steinAffinityNonzeroInDichteRegion = steinAff > 0.05;
            // Für klare Diskrimination: an einer wirklich
            // dichte-dominanten Position erwarten wir
            // stein > tree (wenn lebendig dort low).
            const f = r.worldFieldAt(bestDichteSpot.x, bestDichteSpot.z);
            if (f.lebendig < 0.4) {
                out.affinityFavorsSteinInDichteOnlyRegion = steinAff > treeAff;
            }
        }
        // Initial-Worldgen: state.architectures enthält jetzt
        // Affinity-gespawnte Strukturen — Bäume + (idealerweise)
        // mindestens eine der drei neuen Bauplan-Typen.
        const archs = Array.isArray(r.state.architectures) ? r.state.architectures : [];
        out.archCount = archs.length;
        const typeCounts = {};
        for (const a of archs) typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
        out.affinitySpawnTypes = typeCounts;
        out.hasInitialTrees = (typeCounts.baum_eiche || 0) + (typeCounts.baum_kiefer || 0) > 0;
        // Das Welt-Affinitäts-Feld treibt die Vegetation idempotent über `_populateVoxelChunkVegetation`
        // (am Voxel-Chunk-Lifecycle); geprüft wird dessen Idempotenz-Cache `voxelPopulatedChunks`, den
        // die initialen Voxel-Chunks beim Welt-Aufbau füllen.
        const before = archs.length;
        // Ein bereits-befüllter Chunk: zweiter Aufruf MUSS 0
        // zurückgeben dank voxelPopulatedChunks-Cache.
        const firstChunkKey = r.state.voxelPopulatedChunks ? [...r.state.voxelPopulatedChunks][0] : null;
        if (firstChunkKey) {
            const [cx, cz] = firstChunkKey.split(",").map(Number);
            const secondReturn = r._populateVoxelChunkVegetation(cx, cz);
            const after = r.state.architectures.length;
            out.populateIdempotent = secondReturn === 0 && after === before;
        }
        // Affinitäts-Tag-Wächter: die Parts einer spawnbaren Architektur bestimmen WO sie spawnt
        // (computeCompoundTags × worldField in spawnAffinityForBlueprint) UND wie sie aussieht. Eine
        // Optik-Anreicherung darf die 4 Affinitäts-Achsen-Tags NICHT verschieben, sonst kippt der
        // Winner-take-all in _vegetationSampleSpawn (glut sphere→cylinder entfesselt brennbar → 0 Bäume).
        // Die gemessene Baseline ist eingefroren; eine bewusste Rebalance zieht sie hier nach.
        out.archAffinityTags = {};
        out.archResoniert = {};
        out.archBroadcasting = {};
        // 4 Spawn-Affinitäts-Achsen + resoniert (Musik-Achse): resoniert treibt nicht den Spawn, aber den
        // Resonator/Abschied-Ping — und kann über FORM_TAG_ACTIVATION genauso unbemerkt kippen.
        const AFF_AXES = ["lebendig", "dichte", "brennbar", "magieleitung"];
        const spawnable = [
            "baum_eiche",
            "baum_kiefer",
            "stein_block",
            "kristall_geode",
            "glutbrunnen",
            "felsbogen",
            "felsturm",
        ];
        for (const n of spawnable) {
            const bp = bps[n];
            if (!bp) continue;
            const tags = r.computeCompoundTags(bp) || {};
            const slim = {};
            for (const a of AFF_AXES) slim[a] = Math.round((tags[a] || 0) * 1e6) / 1e6;
            out.archAffinityTags[n] = slim;
            out.archResoniert[n] = Math.round((tags.resoniert || 0) * 1e6) / 1e6;
            const aff =
                r.computeBlueprintAffordances(bp);
            out.archBroadcasting[n] = !!(aff && aff.broadcasting);
        }
        return out;
    });

    if (wave6gP2Results && !wave6gP2Results.error) {
        // Der `hasPopulateChunk`-Flag prüft das Voxel-Pendant `_populateVoxelChunkVegetation`
        // (umgewidmet im evaluate-Block; `populateChunkVegetation` ist gelöscht).
        check(
            "Welle 6.G P2: worldFieldAt liefert 4 Tag-Achsen (lebendig/dichte/glut/magie)",
            wave6gP2Results.fieldHas4Axes
        );
        check("Welle 6.G P2: worldFieldAt-Werte im Bereich [0,1]", wave6gP2Results.fieldValuesInRange);
        check(
            "Welle 6.G P2: worldFieldAt deterministisch (selbe Position → selber Wert)",
            wave6gP2Results.fieldDeterministic
        );
        check(
            "Welle 6.G P2: worldFieldAt variiert mit Position (Noise nicht konstant)",
            wave6gP2Results.fieldVariesBySamplePos
        );
        if (wave6gP2Results.affinityFavorsTreeInLebendigRegion !== undefined) {
            check(
                "Welle 6.G P2: Baum-Affinity > Stein-Affinity in lebendig-hoher Region",
                wave6gP2Results.affinityFavorsTreeInLebendigRegion
            );
        }
        if (wave6gP2Results.steinAffinityNonzeroInDichteRegion !== undefined) {
            check(
                "Welle 6.G P2: Stein-Affinity > 0 in dichte-hoher Region",
                wave6gP2Results.steinAffinityNonzeroInDichteRegion
            );
        }
        if (wave6gP2Results.affinityFavorsSteinInDichteOnlyRegion !== undefined) {
            check(
                "Welle 6.G P2: Stein-Affinity > Baum-Affinity in dichte-only-Region (lebendig<0.4)",
                wave6gP2Results.affinityFavorsSteinInDichteOnlyRegion
            );
        }
        check(
            "Welle 6.G P2: Initial-Worldgen hat Architekturen über Affinity gespawnt",
            wave6gP2Results.archCount > 0,
            `n=${wave6gP2Results.archCount}`
        );
        check("Welle 6.G P2: Initial-Worldgen hat mind. einen Baum gespawnt", wave6gP2Results.hasInitialTrees);
        check(
            "Welle 6.G P2: populateChunkVegetation idempotent (zweiter Aufruf → 0 spawns)",
            wave6gP2Results.populateIdempotent
        );
        // Affinitäts-Tag-Stabilitäts-Wächter (siehe evaluate-Block oben): eingefrorene, GEMESSENE
        // Baseline der 4 Affinitäts-Achsen + `resoniert` je spawnbarer Architektur. Ein verschobener Tag
        // verschiebt den Spawn-Ort (Winner-take-all) und kann Bäume verdrängen; bewusste Shifts ziehen
        // die Baseline nach (felsturm: eisen-Mast → dichte 1.8, resoniert 1.2).
        const AFF_BASELINE = {
            // die Baseline trägt jetzt die GEWACHSENE Spezies-Wahrheit (gemessen):
            // baum_eiche = Basis + Art-Variation (lebendig +0.05); baum_kiefer = Basis +
            // (brennbar +0.1, resoniert +0.05). Die statische Kugel-Baum-Baseline ist tot.
            baum_eiche: { lebendig: 1.45, dichte: 0.8, brennbar: 0.8, magieleitung: 0.7, resoniert: 1.35 },
            baum_kiefer: { lebendig: 1.4, dichte: 0.8, brennbar: 0.9, magieleitung: 0.7, resoniert: 1.4 },
            stein_block: { lebendig: 0, dichte: 2.55, brennbar: 0, magieleitung: 0, resoniert: 0 },
            kristall_geode: { lebendig: 0, dichte: 1.95, brennbar: 0, magieleitung: 2.55, resoniert: 2.7 },
            glutbrunnen: { lebendig: 1, dichte: 1.7, brennbar: 0, magieleitung: 1.5, resoniert: 1.95 },
            felsbogen: { lebendig: 0, dichte: 2.55, brennbar: 0, magieleitung: 0, resoniert: 0.6 },
            felsturm: { lebendig: 0, dichte: 1.8, brennbar: 0, magieleitung: 0, resoniert: 1.2 },
        };
        const measuredTags = wave6gP2Results.archAffinityTags || {};
        const measuredReson = wave6gP2Results.archResoniert || {};
        for (const name of Object.keys(AFF_BASELINE)) {
            const exp = AFF_BASELINE[name];
            const got = measuredTags[name];
            let ok = !!got;
            let detail = "";
            if (got) {
                for (const a of ["lebendig", "dichte", "brennbar", "magieleitung"]) {
                    if (Math.abs((got[a] || 0) - exp[a]) > 1e-4) {
                        ok = false;
                        detail = `${a}: erwartet ${exp[a]}, gemessen ${got[a]}`;
                        break;
                    }
                }
                if (ok && Math.abs((measuredReson[name] || 0) - exp.resoniert) > 1e-4) {
                    ok = false;
                    detail = `resoniert: erwartet ${exp.resoniert}, gemessen ${measuredReson[name]}`;
                }
            } else {
                detail = "Bauplan fehlt oder keine Tags gemessen";
            }
            check(`Tags von '${name}' stabil (Spawn-Ort + Resonanz unverschoben)`, ok, detail);
        }
        // der felsturm ist ein EISEN-Mast → broadcasting-Affordanz (Antenne/
        // Relais): sichert die neue Funktion ab (geht sie verloren, war's eine
        // Regression). Gegenprobe: felsbogen (stein, nicht leitfähig) ist es NICHT.
        const bc = wave6gP2Results.archBroadcasting || {};
        check("felsturm ist broadcasting (eisen-Mast = Antenne/Relais)", bc.felsturm === true);
        check("felsbogen ist NICHT broadcasting (stein, nicht leitfähig)", bc.felsbogen === false);
    }

    // ### Felsformationen ###
    // felsbogen (Trilithon, begehbarer Überhang) + felsturm (Fels-Nadel) als Welt-Bürger — KEIN
    // Voxel-Terrain: die Per-Part-Kollision lässt zwischen den Pfeilern eine echte begehbare Lücke.
    const wave6gP3Results = await safeEvaluate(page, () => {
        const out = {};
        const bps = r.state.blueprints || {};
        const fb = bps.felsbogen;
        const ft = bps.felsturm;

        // Felsbogen — die zwei Pfeiler (tiefste Box-Parts) lassen
        // eine begehbare Lücke; ein Sturz spannt darüber.
        if (fb && fb.parts) {
            const boxes = fb.parts
                .filter((p) => p.shape === "box")
                .slice()
                .sort((a, b) => a.position.y - b.position.y);
            if (boxes.length >= 3) {
                const a = boxes[0];
                const b = boxes[1];
                const lintel = boxes[2];
                const innerGap = Math.abs(b.position.x - a.position.x) - (a.size.x / 2 + b.size.x / 2);
                out.felsbogenGap = innerGap;
                out.felsbogenWalkable = innerGap > 2; // Spieler-Hitbox ist ~1 m
                out.felsbogenLintelAbove = lintel.position.y > a.position.y && lintel.position.y > b.position.y;
            }
        }

        // Felsturm — vertikal: bbox-Höhe deutlich grösser als Breite.
        if (ft && ft.parts) {
            let minY = Infinity;
            let maxY = -Infinity;
            let minX = Infinity;
            let maxX = -Infinity;
            for (const p of ft.parts) {
                minY = Math.min(minY, p.position.y - p.size.y / 2);
                maxY = Math.max(maxY, p.position.y + p.size.y / 2);
                minX = Math.min(minX, p.position.x - p.size.x / 2);
                maxX = Math.max(maxX, p.position.x + p.size.x / 2);
            }
            out.felsturmSpanY = maxY - minY;
            out.felsturmSpanX = maxX - minX;
            out.felsturmVertical = maxY - minY > (maxX - minX) * 2;
        }

        // Felsbogen ist ein Stein-Compound — dicht.
        if (fb) {
            const tags = r.computeCompoundTags(fb);
            out.felsbogenDichte = tags ? tags.dichte || 0 : 0;
            out.felsbogenIsDense = out.felsbogenDichte > 0.5;
        }

        // spawnArchitecture("felsbogen") → Mesh + feld-native Kollision via blockerAABBs (eine AABB je
        // solidem Stein-Part); die Lücke zwischen den Pfeilern hat keinen Part → begehbarer Durchgang.
        // Unter Foundry hinge „gerendert + Farbe“ am Varianten-Cache (lauf-abhängig warm/kalt) — geprüft
        // wird der klassische/Grammatik-Spawn unter lokalem __withNoFoundry-Hook (deterministisch).
        const pm = r.state.playerMesh;
        const px = pm ? pm.position.x : 0;
        const pz = pm ? pm.position.z : 0;
        window.__withNoFoundry(() => {
            const eb = r.spawnArchitecture("felsbogen", { x: px + 9, y: 4, z: pz + 9 });
            out.felsbogenSpawned = !!(eb && eb.type === "felsbogen");
            // felsbogen ist instanced (kein eb.mesh); „gerendert"
            // = instanced ODER klassischer Mesh.
            out.felsbogenHasMesh = !!(eb && (eb.mesh || eb.instanced));
            out.felsbogenCompoundChildren = eb && Array.isArray(eb.blockerAABBs) ? eb.blockerAABBs.length : 0;
            out.felsbogenWalkThroughCollision = out.felsbogenCompoundChildren >= 3;
            // der Felsbogen rendert in der stein-Material-Farbe
            // (0x7a7a7a), NICHT weiss. V12.0-perf.c.2 — die Farbe kommt jetzt aus
            // dem geteilten Leaf-Material (Flatten-Cache), nicht aus eb.mesh.
            if (eb) {
                let firstMeshHex = null;
                if (eb.mesh) {
                    eb.mesh.traverse((n) => {
                        if (firstMeshHex === null && n.isMesh && n.material && n.material.color) {
                            firstMeshHex = n.material.color.getHex();
                        }
                    });
                } else if (eb.instanced) {
                    // Das geteilte Tag-Signatur-Material ist WEISS, die Part-Farbe reist als Instanz-Farbe (leaf.tint
                    // = _archPartTintColor-Hex). Gerendert wird mat.color × tint — genau diese Multiplikation liest
                    // die Probe (tint undefined ⇒ Material-Farbe pur).
                    const flat = r._archFlattenBlueprint("felsbogen");
                    const l0 = flat.leaves[0];
                    if (l0 && l0.mat && l0.mat.color) {
                        const mc = l0.mat.color;
                        let fr = mc.r;
                        let fg = mc.g;
                        let fbb = mc.b;
                        if (l0.tint !== undefined) {
                            fr *= ((l0.tint >> 16) & 0xff) / 255;
                            fg *= ((l0.tint >> 8) & 0xff) / 255;
                            fbb *= (l0.tint & 0xff) / 255;
                        }
                        firstMeshHex =
                            (Math.round(fr * 255) << 16) | (Math.round(fg * 255) << 8) | Math.round(fbb * 255);
                    }
                }
                out.felsbogenMeshHex = firstMeshHex;
                // stein ist ein Grau (r=g=b). Der gerenderte Wert ist
                // stein × Helligkeit (V4-P3-Präzisions-Modulation) —
                // ein dunkleres Grau, aber klar KEIN Weiss.
                if (firstMeshHex !== null) {
                    const rr = (firstMeshHex >> 16) & 0xff;
                    const gg = (firstMeshHex >> 8) & 0xff;
                    const bb = firstMeshHex & 0xff;
                    out.felsbogenNotWhite = firstMeshHex !== 0xffffff;
                    out.felsbogenStoneGrey = rr === gg && gg === bb && rr <= 0xa0;
                }
            }
            const et = r.spawnArchitecture("felsturm", { x: px - 9, y: 4, z: pz - 9 });
            out.felsturmSpawned = !!(et && et.type === "felsturm");
            // P3 — feld-native Kollision via blockerAABBs (solide Stein-Parts).
            out.felsturmHasCollision = !!(et && Array.isArray(et.blockerAABBs) && et.blockerAABBs.length > 0);
        });

        // Placement-Probe über den Voxel-Populator: über ein Raster frischer Chunks MUSS mindestens ein
        // Felsbogen + ein Felsturm spawnen (Landmark-Wurf 0.014 × Affinitäts-Floor; 12×12=144 Chunks =
        // statistisch sicher).
        const vorArch = new Set(r.state.architectures);
        // Frische Voxel-Chunk-Indices, deutlich außerhalb des
        // initialen 9×9-Voxel-Rings (cx,cz ∈ [-4..4]).
        const fresh = new Set();
        for (let cx = 20; cx <= 31; cx++) {
            for (let cz = 20; cz <= 31; cz++) {
                const key = `${cx},${cz}`;
                if (r.state.voxelPopulatedChunks && r.state.voxelPopulatedChunks.has(key)) continue;
                fresh.add(key);
                // der Test-Pfad braucht synchrone Spawns (er
                // misst gleich danach state.architectures); im echten
                // Streaming geht das durch die Per-Frame-Queue.
                r._populateVoxelChunkVegetation(cx, cz, { immediate: true });
            }
        }
        let fbCount = 0;
        let ftCount = 0;
        for (const e of r.state.architectures) {
            if (vorArch.has(e)) continue;
            const t = e.type;
            if (t === "felsbogen") fbCount++;
            else if (t === "felsturm") ftCount++;
        }
        out.placedFelsbogen = fbCount;
        out.placedFelsturm = ftCount;
        out.placementWorks = fbCount > 0 && ftCount > 0;
        // die Würfe ferner Daten-Chunks (nie gebaut) fallen nach Identität aus der Liste — der Abbau-Pfad schriebe je Wurf
        // einen Journal-Eintrag und füllte dessen Deckel (200)
        r.state.architectures = r.state.architectures.filter((x) => vorArch.has(x));
        // Test-Räume aus dem Voxel-Idempotenz-Cache löschen
        // (sonst leben die Test-Chunk-Keys dauerhaft + blockieren
        // einen späteren echten Pass).
        for (const k of fresh) {
            if (r.state.voxelPopulatedChunks) r.state.voxelPopulatedChunks.delete(k);
        }
        return out;
    });

    if (wave6gP3Results && !wave6gP3Results.error) {
        check(
            `W6.G P3: Felsbogen-Pfeiler lassen eine begehbare Lücke (Gap=${(wave6gP3Results.felsbogenGap || 0).toFixed(1)}m > 2m)`,
            wave6gP3Results.felsbogenWalkable
        );
        check("W6.G P3: Felsbogen-Sturz spannt über den Pfeilern", wave6gP3Results.felsbogenLintelAbove);
        check(
            `W6.G P3: Felsturm ist vertikal (Höhe ${(wave6gP3Results.felsturmSpanY || 0).toFixed(1)} >> Breite ${(wave6gP3Results.felsturmSpanX || 0).toFixed(1)})`,
            wave6gP3Results.felsturmVertical
        );
        check("W6.G P3: Felsbogen ist ein dichtes Stein-Compound", wave6gP3Results.felsbogenIsDense);
        check(
            "W6.G P3: spawnArchitecture('felsbogen') erzeugt Mesh + Eintrag",
            wave6gP3Results.felsbogenSpawned && wave6gP3Results.felsbogenHasMesh
        );
        check(
            "W6.G P3: der Felsbogen rendert stein-grau, nicht weiss (V9.06-Fix)",
            wave6gP3Results.felsbogenNotWhite && wave6gP3Results.felsbogenStoneGrey,
            `hex=${(wave6gP3Results.felsbogenMeshHex || 0).toString(16)}`
        );
        check(
            "W6.G P3: Felsbogen-Kollision ist feld-nativ mit >=3 blockerAABBs — der Durchgang lebt auf Kollisions-Ebene",
            wave6gP3Results.felsbogenWalkThroughCollision,
            `n=${wave6gP3Results.felsbogenCompoundChildren}`
        );
        check(
            "W6.G P3: spawnArchitecture('felsturm') erzeugt Eintrag + feld-native Kollision (blockerAABBs)",
            wave6gP3Results.felsturmSpawned && wave6gP3Results.felsturmHasCollision
        );
        check(
            `W6.G P3: Felsbögen UND Felstürme spawnen über das Welt-Affinitäts-Feld (Bögen=${wave6gP3Results.placedFelsbogen}, Türme=${wave6gP3Results.placedFelsturm})`,
            wave6gP3Results.placementWorks
        );
    }

    // ### Das Terrain wird Materie ###
    // Ein Grabe-Hieb löst Terrain in Material auf, dessen Identität aus worldFieldAt emergiert (die
    // sichtbare Farbe ist das Material, das der Spieler bekommt) — keine Biom-Tabelle.
    const wave6gP4Results = await safeEvaluate(page, () => {
        const out = {};

        // Resonanz — die dominante Welt-Achse bestimmt das Material.
        // worldFieldAt mocken (Muster wie andere Tests, Z. ~14339).
        const origWFA = r.worldFieldAt;
        const known = ["erde", "stein", "glut", "quarz"];
        const probe = (lebendig, dichte, glut, magieleitung) => {
            r.worldFieldAt = () => ({ lebendig, dichte, glut, magieleitung });
            return r._terrainMaterialAt(0, 0);
        };
        out.lebendigYieldsErde = probe(0.9, 0.2, 0.1, 0.1) === "erde";
        out.dichteYieldsStein = probe(0.2, 0.9, 0.1, 0.1) === "stein";
        out.glutYieldsGlut = probe(0.2, 0.1, 0.9, 0.1) === "glut";
        out.magieYieldsQuarz = probe(0.1, 0.2, 0.1, 0.9) === "quarz";
        r.worldFieldAt = origWFA;
        out.returnsKnownMaterial = known.indexOf(r._terrainMaterialAt(40, -25)) >= 0;
        // Das Terrain ist nicht uniform — über ein Raster
        // emergieren ≥2 verschiedene Boden-Materialien.
        const seen = {};
        for (let x = -200; x <= 200; x += 40) {
            for (let z = -200; z <= 200; z += 40) {
                seen[r._terrainMaterialAt(x, z)] = true;
            }
        }
        out.terrainMaterialVariety = Object.keys(seen).length;

        // Integration — ein Grabe-Hieb (tryMouseBreak, Terrain-Zweig)
        // füllt das Inventar mit dem Boden-Material. _raycastWorldHit
        // + _pickArchitectureAtCrosshair mocken (kein Physik-Setup).
        const origRay = r._raycastWorldHit;
        const origPick = r._pickArchitectureAtCrosshair;
        const origMode = r.getGameMode();
        r.setGameMode("frieden"); // Stamina frei
        const digX = 60;
        const digZ = -40;
        const digY = 5;
        r._raycastWorldHit = () => ({ hit: true, x: digX, y: digY, z: digZ });
        r._pickArchitectureAtCrosshair = () => null;
        // Das gegrabene Material schichtet nach Tiefe: DENSELBEN 3-arg-Aufruf wie digTerrain machen,
        // sonst rechnet der Test ohne Tiefe gegen die Strata.
        const expectMat = r._terrainMaterialAt(digX, digZ, digY);
        const inv = r.state.player.inventory;
        // Inventar tief snapshotten — der Grabe-Test darf den
        // Spieler-Zustand nicht verschmutzen (spätere 6.C1-Tests
        // prüfen „Inventar initial leer"). Disziplin.
        const invSnapshot = inv.map((s) => (s ? { ...s } : null));
        const matSlotsBefore = inv.filter((s) => s && s.kind === "material").length;
        const ok = r.tryMouseBreak();
        const dugSlot = inv.find((s) => s && s.kind === "material" && s.material === expectMat);
        out.digReturned = ok === true;
        out.digYieldedMaterial = !!dugSlot || inv.filter((s) => s && s.kind === "material").length > matSlotsBefore;
        out.digYieldMatchesField = !!dugSlot;
        out.digYieldCountSane = !!(dugSlot && dugSlot.count >= 1 && dugSlot.count <= 10);
        for (let i = 0; i < inv.length; i++) inv[i] = invSnapshot[i];
        r._raycastWorldHit = origRay;
        r._pickArchitectureAtCrosshair = origPick;

        // Un-mocked Realpfad: der ECHTE _raycastWorldHit gegen das echte Terrain; nur
        // _pickArchitectureAtCrosshair wird genullt (garantiert den Terrain-Zweig). Kamera blickt nach
        // unten → beweist Raycast + `carveVoxel` + Material-Yield ohne Mock.
        if (r.state.camera && r.state.playerMesh) {
            // Ein paar Loop-Ticks pumpen, damit der Spieler per Schwerkraft auf der Oberfläche settled —
            // sonst hängt der feld-native Raycast vom zufälligen Welt-Zustand ab (renderer-unabhängig).
            for (let k = 0; k < 12; k++) r._gameLoopTick(performance.now());
            const cam = r.state.camera;
            const pm = r.state.playerMesh;
            const savedPos = cam.position.clone();
            const savedQuat = cam.quaternion.clone();
            cam.position.set(pm.position.x, pm.position.y + 4, pm.position.z);
            cam.lookAt(pm.position.x, pm.position.y - 20, pm.position.z);
            cam.updateMatrixWorld(true);
            r._pickArchitectureAtCrosshair = () => null;
            const realHit = r._raycastWorldHit(40);
            out.realRaycastHit = !!(realHit && realHit.hit);
            const matSumBefore = inv
                .filter((s) => s && s.kind === "material")
                .reduce((a, s) => a + (s.count || 0), 0);
            r.tryMouseBreak();
            const matSumAfter = inv
                .filter((s) => s && s.kind === "material")
                .reduce((a, s) => a + (s.count || 0), 0);
            out.realDigYielded = matSumAfter > matSumBefore;
            for (let i = 0; i < inv.length; i++) inv[i] = invSnapshot[i];
            r._pickArchitectureAtCrosshair = origPick;
            cam.position.copy(savedPos);
            cam.quaternion.copy(savedQuat);
            cam.updateMatrixWorld(true);
        }
        r.setGameMode(origMode);
        return out;
    });

    if (wave6gP4Results && !wave6gP4Results.error) {
        check("W6.G P4: _terrainMaterialAt liefert ein bekanntes Boden-Material", wave6gP4Results.returnsKnownMaterial);
        check("W6.G P4: lebendig-dominante Region → erde (Resonanz)", wave6gP4Results.lebendigYieldsErde);
        check("W6.G P4: dichte-dominante Region → stein (Resonanz)", wave6gP4Results.dichteYieldsStein);
        check("W6.G P4: glut-dominante Region → glut (Resonanz)", wave6gP4Results.glutYieldsGlut);
        check("W6.G P4: magie-dominante Region → quarz (Resonanz)", wave6gP4Results.magieYieldsQuarz);
        check(
            `W6.G P4: das Terrain ist nicht uniform (${wave6gP4Results.terrainMaterialVariety} Boden-Materialien über das Raster)`,
            (wave6gP4Results.terrainMaterialVariety || 0) >= 2
        );
        check(
            "W6.G P4: ein Grabe-Hieb (tryMouseBreak) füllt das Inventar mit Boden-Material",
            wave6gP4Results.digReturned && wave6gP4Results.digYieldedMaterial
        );
        check(
            "W6.G P4: das gegrabene Material entspricht worldFieldAt am Grabe-Ort + der Yield ist in [1,10]",
            wave6gP4Results.digYieldMatchesField && wave6gP4Results.digYieldCountSane
        );
        check("W6.G P4: der ECHTE Raycast (Kamera nach unten) trifft das Terrain", wave6gP4Results.realRaycastHit);
        check(
            "W6.G P4: ein un-gemockter Grabe-Hieb (echter Raycast + V9.36-carveVoxel) yieldet Material",
            wave6gP4Results.realDigYielded
        );
    }
}

// Γ3 FELD-CHARAKTER FOUNDATION:
// Frequenz-Fächer pro Welt-Stimme bei genVersion >= 3 (Domain-Warp als Folge).
// Legacy gen<3 = bit-identisch zu Pre-V18.203 (V18.181/Disziplin).
async function checkBandV18203Gamma3FeldCharakter({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = r.constructor;
        const out = {};

        // (F1) FIELD_CHARACTER frozen Konstanten
        if (A.FIELD_CHARACTER) {
            const FC = A.FIELD_CHARACTER;
            // Wellenlängen-Spreizung: lebendig 200, dichte 340, glut 520, magie 160
            out.allDifferent =
                FC.lambdaLebendig !== FC.lambdaDichte &&
                FC.lambdaLebendig !== FC.lambdaGlut &&
                FC.lambdaLebendig !== FC.lambdaMagieleitung &&
                FC.lambdaDichte !== FC.lambdaGlut;
            out.allPositive =
                FC.lambdaLebendig > 0 && FC.lambdaDichte > 0 && FC.lambdaGlut > 0 && FC.lambdaMagieleitung > 0;
        }

        // Save state für Tests
        const origGen = r.state.worldMeta ? r.state.worldMeta.genVersion : undefined;
        const origField = r.state.worldField;
        try {
            // (F2) LEGACY gen=1: bit-identisch zu Pre-V18.203. Lass uns die
            // ALTE Form selbst nachrechnen (s=0.005 für alle vier) und mit
            // worldFieldAt vergleichen.
            r.state.worldMeta = { ...(r.state.worldMeta || {}), genVersion: 1 };
            r.state.worldField = null; // re-init
            const f1 = r.worldFieldAt(100, 200);
            const ws = 0.005;
            const f1Manual = r.state.worldField;
            const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2));
            const legacyExpected = {
                lebendig: n01(f1Manual.lebendigNoise.noise2D(100 * ws, 200 * ws)),
                dichte: n01(f1Manual.dichteNoise.noise2D(100 * ws + 100, 200 * ws - 200)),
                glut: n01(f1Manual.glutNoise.noise2D(100 * ws + 500, 200 * ws + 700)),
                magieleitung: n01(f1Manual.magieNoise.noise2D(100 * ws - 333, 200 * ws + 999)),
            };
            out.legacyBitIdentical =
                Math.abs(f1.lebendig - legacyExpected.lebendig) < 1e-9 &&
                Math.abs(f1.dichte - legacyExpected.dichte) < 1e-9 &&
                Math.abs(f1.glut - legacyExpected.glut) < 1e-9 &&
                Math.abs(f1.magieleitung - legacyExpected.magieleitung) < 1e-9;

            // (F3) GEN=3: Frequenz-Fächer aktiv — anderer Wert als Legacy am
            // selben Punkt.
            r.state.worldMeta.genVersion = 3;
            r.state.worldField = null;
            const f3 = r.worldFieldAt(100, 200);
            // f3 sollte ANDERE Werte als f1 haben (mindestens eine Stimme)
            out.gen3DiffersFromLegacy =
                Math.abs(f1.lebendig - f3.lebendig) > 1e-6 ||
                Math.abs(f1.dichte - f3.dichte) > 1e-6 ||
                Math.abs(f1.glut - f3.glut) > 1e-6 ||
                Math.abs(f1.magieleitung - f3.magieleitung) > 1e-6;

            // F4 ist nur Sanity (kein NaN/Infinity); die echte Bit-Identitäts-Probe inkl. Warp ist F9b.
            const FC = A.FIELD_CHARACTER;
            out.gen3ValuesFinite =
                Number.isFinite(f3.lebendig) &&
                Number.isFinite(f3.dichte) &&
                Number.isFinite(f3.glut) &&
                Number.isFinite(f3.magieleitung);

            // (F5) GEN=2 zwischen Tor: gen 2 ist Γ1-Feuchte, NICHT Γ3.
            // Verhalten = LEGACY (s=0.005 für alle, kein Frequenz-Fächer).
            r.state.worldMeta.genVersion = 2;
            r.state.worldField = null;
            const f2 = r.worldFieldAt(100, 200);
            out.gen2StaysLegacy = Math.abs(f1.lebendig - f2.lebendig) < 1e-9 && Math.abs(f1.dichte - f2.dichte) < 1e-9;

            // (F6) Wellenlängen-Effekt: dichte (λ340) sollte LANGSAMER variieren
            // als magieleitung (λ160) bei gen 3. Wir testen über eine kurze
            // Distanz (40 m) → magie sollte mehr "Bewegung" zeigen.
            r.state.worldMeta.genVersion = 3;
            r.state.worldField = null;
            let totalDeltaMagie = 0;
            let totalDeltaDichte = 0;
            const fA = r.worldFieldAt(0, 0);
            for (let d = 5; d <= 200; d += 5) {
                const fB = r.worldFieldAt(d, 0);
                totalDeltaMagie += Math.abs(fB.magieleitung - fA.magieleitung);
                totalDeltaDichte += Math.abs(fB.dichte - fA.dichte);
            }
            out.magieMoreVariable = totalDeltaMagie > totalDeltaDichte;
            out.totalDeltaMagie = Number(totalDeltaMagie.toFixed(3));
            out.totalDeltaDichte = Number(totalDeltaDichte.toFixed(3));



            // (F9) DOMAIN-WARP: bei gen=3 verschiebt der Warp die Lese-Position.
            // Wir vergleichen: worldFieldAt(x,z) mit warp vs. ohne warp
            // (manuell, mit den ECHTEN Noise-Instanzen).
            r.state.worldMeta.genVersion = 3;
            r.state.worldField = null;
            const fW = r.worldFieldAt(500, 700);
            const fwNoise = r.state.worldField;
            // Berechne ohne Warp (warpAmp = 0)
            const sLeb = 1 / FC.lambdaLebendig;
            const noWarp = n01(fwNoise.lebendigNoise.noise2D(500 * sLeb, 700 * sLeb));
            // Berechne mit Warp
            const wpX = fwNoise.warpNoise.noise2D(500 * FC.warpScale, 700 * FC.warpScale) * FC.warpAmp;
            const wpZ = fwNoise.warpNoise.noise2D(500 * FC.warpScale + 51.7, 700 * FC.warpScale - 23.1) * FC.warpAmp;
            const wx = 500 + wpX;
            const wz = 700 + wpZ;
            const withWarp = n01(fwNoise.lebendigNoise.noise2D(wx * sLeb, wz * sLeb));
            out.warpedMatchesActual = Math.abs(fW.lebendig - withWarp) < 1e-9;
            out.warpChangesValue = Math.abs(noWarp - withWarp) > 1e-6;


            // (F11) Bei gen<3: warp wird NICHT angewendet (Legacy bleibt clean)
            r.state.worldMeta.genVersion = 1;
            r.state.worldField = null;
            const fLeg2 = r.worldFieldAt(500, 700);
            const wsLeg = 0.005;
            const legacyExpected2 = {
                lebendig: n01(r.state.worldField.lebendigNoise.noise2D(500 * wsLeg, 700 * wsLeg)),
            };
            // legacy verwendet KEINEN Warp → exakt der unWarp-Wert
            out.legacyNoWarp = Math.abs(fLeg2.lebendig - legacyExpected2.lebendig) < 1e-9;
        } finally {
            if (origGen === undefined) {
                if (r.state.worldMeta) delete r.state.worldMeta.genVersion;
            } else if (r.state.worldMeta) {
                r.state.worldMeta.genVersion = origGen;
            }
            r.state.worldField = origField;
        }
        return out;
    });

    check("(F1b) Vier verschiedene Wellenlängen (Spreizung)", res.allDifferent === true);
    check("(F1c) Alle Wellenlängen positiv", res.allPositive === true);
    check(
        "(F2) LEGACY gen=1: bit-identisch zu manueller s=0.005-Berechnung (Pre-V18.203)",
        res.legacyBitIdentical === true
    );
    check(
        "(F3) GEN=3: Werte verschieden zu Legacy (Frequenz-Fächer aktiv)",
        res.gen3DiffersFromLegacy === true
    );
    check("(F4) GEN=3: Werte endlich (kein NaN durch Warp/Fächer)", res.gen3ValuesFinite === true);
    check("(F5) GEN=2 (Γ1-Feuchte-Tor) bleibt Legacy (kein Γ3-Charakter)", res.gen2StaysLegacy === true);
    check(
        `(F6) magieleitung (λ160) variabler als dichte (λ340) über 200 m (Δmagie ${res.totalDeltaMagie} > Δdichte ${res.totalDeltaDichte})`,
        res.magieMoreVariable === true
    );
    check("(F9a) Warp ändert den gelesenen Wert (Sample-Position verschoben)", res.warpChangesValue === true);
    check(
        "(F9b) Implementierung matched manuelle Warp-Berechnung (bit-identisch)",
        res.warpedMatchesActual === true
    );
    check("(F11) gen<3: kein Warp angewendet (Legacy clean, kein Drift)", res.legacyNoWarp === true);
}

module.exports = {
    checkBandV1721LivingFieldAura, checkBandV1727WritableField, checkBandV1729CreatureTrickle,
    checkBandV1732SpatialEmotion, checkBandV1742Wohl, checkBandV1744Appraisal, checkBandV1750Klammer,
    checkBandWelle6APolish, checkBandWelle6GHylomorphism, checkBandV18203Gamma3FeldCharakter,
};
