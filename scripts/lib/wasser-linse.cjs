const { WELT_ORTE_INSTALL } = require("./welt-orte.cjs");
// wasser-linse.cjs — DIE PROBEN DER WASSER-WAND (scripts/diag-wasser-leben.cjs, Welle L Q6 + Q7 bis F3): je Probe eine Seiten-
// Funktion `window.__wasser*` (WASSER_INSTALL), die den Chokepoint selbst ruft (nie einen Stub); was sie misst und warum, steht
// über ihr. Werkbank (echte GPU, sichtbar): `werkbank eval` mit WASSER_INSTALL.
("use strict");

// DIE RUNDUNG der Befunde: `n` Nachkommastellen, nicht Endliches wird null
function wasserRund(n) {
    return (x, m = n) => (Number.isFinite(x) ? Math.round(x * 10 ** m) / 10 ** m : null);
}
// DAS PROBE-BOOT: ein Teile-Werk aus Holz (Rumpf und Sitz) im Buch — zurück sein Name
function wasserBoot(st) {
    st.blueprints.__wasser_boot = {
        name: "__wasser_boot",
        parts: [
            { shape: "box", material: "holz", size: { x: 3, y: 0.6, z: 1.4 }, position: { x: 0, y: 0, z: 0 } },
            { shape: "box", material: "holz", size: { x: 0.4, y: 0.4, z: 0.4 }, position: { x: 0, y: 0.5, z: 0 } },
        ],
        connections: [],
    };
    return "__wasser_boot";
}
// DAS TIER DER PROBE: `seele` an (x, y, z), präzise in Größe 1 — sein Leib zählt nie gegen die Obergrenze der Welt
// (`maxCreatures`: die Welt füllt sie beim Streamen mit ihren Würfen, die Geburt der Probe fiele dann aus)
function wasserTier(r, x, y, z, seele) {
    const st = r.state,
        cap = st.maxCreatures;
    st.maxCreatures = Infinity;
    const c = r.spawnCreatureAt(x, y, z, "happy", seele, { precise: true, bodySize: 1 });
    st.maxCreatures = cap;
    return c;
}
// ── Q7-Gestalt ──
function wasserFluss() {
    const h = st.hydrosphere;
    if (!h || !h.ready || !Array.isArray(h.rivers)) return { fehler: "keine Hydrosphäre" };
    // Der Spiegel des Gesetzes, den Sheet, Körper und Augen lesen (`_atlasWaterLevelAt`, Boden unbekannt → der Kanal-KERN).
    const lauf = (x, z) => r._atlasWaterLevelAt(x, z, -Infinity);
    let schritte = 0,
        steigend = 0,
        anstieg = 0,
        abstieg = 0,
        maxAnstieg = 0;
    const quer = [];
    const buckel = [];
    const stufen = [];
    for (const rv of h.rivers) {
        const P = rv.points;
        let prev = null;
        for (let k = 0; k + 1 < P.length; k++) {
            const a = P[k],
                b = P[k + 1];
            if (a.inLake || b.inLake) {
                prev = null;
                continue;
            }
            const L = Math.hypot(b.x - a.x, b.z - a.z);
            const n = Math.max(1, Math.round(L / 2));
            for (let i = 0; i < n; i++) {
                const t = i / n;
                const w = lauf(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t);
                if (!Number.isFinite(w)) {
                    prev = null;
                    continue;
                }
                if (prev !== null) {
                    const d = w - prev;
                    schritte++;
                    if (d > 0.05) {
                        steigend++;
                        anstieg += d;
                        if (d > maxAnstieg) maxAnstieg = d;
                    } else if (d < 0) abstieg -= d;
                }
                prev = w;
            }
            // Querschnitt am Punkt a: senkrecht zur Fließrichtung über die Kanal-Breite (ohne die Bank-Rampe).
            const fx = b.x - a.x,
                fz = b.z - a.z;
            const fl = Math.hypot(fx, fz) || 1;
            const nx = -fz / fl,
                nz = fx / fl;
            const halbe = Math.max(1, (a.width || 3) * 0.5) * 0.9;
            const W = (d) => lauf(a.x + nx * d, a.z + nz * d);
            let lo = Infinity,
                hi = -Infinity,
                vor = null;
            let stufe = 0;
            for (let d = -halbe; d <= halbe + 1e-6; d += 0.5) {
                const w = W(d);
                if (!Number.isFinite(w)) {
                    vor = null;
                    continue;
                }
                if (w < lo) lo = w;
                if (w > hi) hi = w;
                if (vor !== null && Math.abs(w - vor) > stufe) stufe = Math.abs(w - vor);
                vor = w;
            }
            // Jeder Querschnitt mit Wasser zählt — auch der waagrechte (Spanne 0). Der BUCKEL ist die Wölbung: die Mitte
            // gegen das Mittel der beiden Ränder (ein Gefälle quer — in der Biegung eines breiten Flusses das Gefälle
            // längs — wölbt nicht); die STUFE der größte Sprung zwischen zwei Proben 0,5 m auseinander.
            if (hi >= lo) {
                quer.push(hi - lo);
                stufen.push(stufe);
                const wl = W(-halbe),
                    wr = W(halbe),
                    wm = W(0);
                if (Number.isFinite(wl) && Number.isFinite(wr) && Number.isFinite(wm))
                    buckel.push(Math.abs(wm - (wl + wr) / 2));
            }
        }
    }
    quer.sort((x, y) => x - y);
    buckel.sort((x, y) => x - y);
    stufen.sort((x, y) => x - y);
    const q = (p, A = quer) => (A.length ? A[Math.min(A.length - 1, Math.floor(p * A.length))] : 0);
    const R = wasserRund(3);
    // Wasserfall-Doppel: ein Sturz je Ort (der geteilte Unterlauf zieht ihn sonst je Quelle).
    const wf = Array.isArray(h.waterfalls) ? h.waterfalls : [];
    const orte = new Set(wf.map((f) => Math.round(f.x) + "," + Math.round(f.z)));
    return {
        fluesse: h.rivers.length,
        schritte,
        steigend,
        anteilSteigend: R(schritte ? steigend / schritte : 0, 4),
        anstiegM: R(anstieg, 1),
        abstiegM: R(abstieg, 1),
        maxAnstiegM: R(maxAnstieg),
        querschnitte: quer.length,
        querP50M: R(q(0.5)),
        querP90M: R(q(0.9)),
        querMaxM: R(quer.length ? quer[quer.length - 1] : 0),
        buckelP90M: R(q(0.9, buckel)),
        buckelMaxM: R(buckel.length ? buckel[buckel.length - 1] : 0),
        stufeP99M: R(q(0.99, stufen)),
        stufeMaxM: R(stufen.length ? stufen[stufen.length - 1] : 0),
        wasserfaelle: wf.length,
        wasserfallOrte: orte.size,
    };
}

// ── Q6-Körper ──
async function wasserKoerper(o = {}) {
    const A = r.constructor;
    const DT = A.FIXED_DT;
    const ziel = o.see || (await window.__wasserOrte({})).see.mitte;
    const seeAm = window.__wasserSeeAm(r, ziel);
    if (seeAm.fehler) return { fehler: seeAm.fehler };
    const see = seeAm.see;
    const spiegel = see.level;
    // Der Weg: vom Ostufer (trockenes Gras) nach Westen in die See-Mitte — kein Fluss quert ihn; dort Lage, Kraulen und
    // Eintauchen.
    const [x0, mz] = o.start || (await window.__wasserOrte({})).see.ufer;
    const mx = (o.ziel || ziel)[0];
    const grundMitte = r._voxelSurfaceY(mx, mz);
    const tiefeMitte = grundMitte !== null ? spiegel - grundMitte : null;
    // Die Brustkorb-Linie aus dem Körper-Gesetz: Brustwarzen-Höhe nippleY/H der Proportionen × Welt-Körperhöhe
    // (8 Kopf-Einheiten zu PLAYER_KH, die Gestalt des Avatars — `_buildHumanGroup`).
    const kc = window.__koerperCore;
    const LP = kc && typeof kc.labProportionen === "function" ? kc.labProportionen() : null;
    const koerperH = 8 * (Number.isFinite(A.PLAYER_KH) ? A.PLAYER_KH : 0.2125);
    const brust = LP ? (LP.nippleY / LP.H) * koerperH : 0.72 * koerperH;
    const FUSS = A.PLAYER_FOOT_OFFSET;
    const pm = st.playerMesh;
    const SG = A._schwimmGesetz();
    // Die Welt läuft weiter (der Spiel-Loop ist der Ort des Streamings) — die Sim-Schritte hier sind dieselben, die
    // `_loopFixedStep` je Frame ruft (`_stepFixedSim`). Der Loop ruht, solange die Probe steppt.
    const leib = window.__wasserLeib();
    const [schritt, setze] = [leib.takt, leib.setze];
    const R = wasserRund(3);
    const aus = {
        see: { mitte: [R(mx, 1), R(mz, 1)], spiegel: R(spiegel, 2), tiefeMitte: R(tiefeMitte, 2) },
        brust: R(brust),
    };
    // (1) DER GANG vom Ostufer nach Westen bis zur See-Mitte, W gedrückt — über dem See (das gezeichnete Wasser > 0,5 m
    // über dem Grund) die Füße gegen den Spiegel (K1 im Sommer, das Eis im Winter).
    const gehen = () => {
        setze(x0, r._voxelSurfaceY(x0, mz) + FUSS + 0.05, mz);
        st.yaw = -Math.PI / 2; // vorwärts = −x
        const g = { frames: 0, tiefGeerdet: 0, augenUnterGeerdet: 0, maxTiefeGeerdetM: 0, schwimmFrames: 0 };
        Object.assign(g, { seeFrames: 0, luft: 0, maxM: 0 });
        for (; g.frames < (o.gehFrames || 1500) && pm.position.x > mx; g.frames++) {
            schritt({ w: true });
            const fuss = pm.position.y - FUSS;
            const geerdet = st._fieldWasGrounded === true;
            if (geerdet && spiegel - fuss > brust + 0.05) {
                g.tiefGeerdet++;
                g.maxTiefeGeerdetM = Math.max(g.maxTiefeGeerdetM, R(spiegel - fuss, 2));
            }
            if (geerdet && st.playerEyesUnderwater) g.augenUnterGeerdet++;
            if (st.playerUnderwater) g.schwimmFrames++;
            const s = r._koerperWasser(pm.position.x, pm.position.z, -Infinity);
            if (s - r._voxelSurfaceY(pm.position.x, pm.position.z) > 0.5)
                Object.assign(g, {
                    seeFrames: g.seeFrames + 1,
                    luft: g.luft + !geerdet,
                    maxM: Math.max(g.maxM, R(Math.abs(fuss - s))),
                });
        }
        g.erreichtMitte = pm.position.x <= mx + 1;
        return g;
    };
    // DAS TIER IN DER SEE-MITTE, der Spieler `abstand` daneben: nach 90 Kreatur-Takten (x/z gehalten) der Median der Sohle
    // unter dem Spiegel über die Takte ohne Hüpfer (der Hüpf-Würfel ist eine eigene Klasse, Q1/Q2), seine Wasserlinie (das
    // Schultergelenk, Gelenk-Höhe des Vorderlaufs × Größe) und ob er schwimmt; `ohneBaum` nimmt ihm den Gestalt-Baum.
    const tierLage = (seele, abstand, ohneBaum) => {
        pm.position.set(mx + abstand, spiegel + 1, mz);
        const c = wasserTier(r, mx, spiegel, mz, seele);
        if (!c) return null;
        if (ohneBaum) delete c.userData._tierBaum;
        const tb = c.userData._tierBaum;
        const tiefen = [];
        for (let k = 0; k < 90; k++) {
            const ohneHopf = !(c.userData._hopV > 0) && !(c.userData._hopH > 0);
            r.updateCreatures(0.05);
            c.position.x = mx;
            c.position.z = mz;
            if (k >= 30 && ohneHopf && !(c.userData._hopH > 0)) tiefen.push(spiegel - c.position.y);
        }
        tiefen.sort((a, b) => a - b);
        r.removeCreature(c);
        if (!tiefen.length) return null;
        const linie = tb && tb.bein ? tb.bein[0].h * (c.scale.x || 1) : null;
        const sohle = tiefen[tiefen.length >> 1];
        const schwimmt = c.userData._motionZustand === "schwimmen";
        return { seele, abstand, sohleUnterSpiegel: R(sohle, 3), wasserlinie: R(linie, 3), schwimmt };
    };
    const jahr = [st.seasonPhase, st.autoSeason];
    try {
        aus.hinein = gehen();
        // (2) SCHWIMM-LAGE: an der See-Mitte loslassen, 300 Schritte Ruhe; gemessen die letzten 120.
        const gm = r._voxelSurfaceY(mx, mz);
        setze(mx, Math.max(gm + FUSS + 0.1, spiegel - brust + FUSS), mz);
        const fuesse = [];
        let augenUnter = 0;
        for (let i = 0; i < 300; i++) {
            schritt({});
            if (i >= 180) {
                fuesse.push(pm.position.y - FUSS - spiegel);
                if (st.playerEyesUnderwater) augenUnter++;
            }
        }
        fuesse.sort((a, b) => a - b);
        aus.lage = {
            fussUnterSpiegelP50: R(-fuesse[fuesse.length >> 1], 3),
            sollFussUnterSpiegel: R(brust, 3),
            augenUnter,
            geerdet: st._fieldWasGrounded === true,
            schwimmt: st.playerUnderwater === true,
        };
        // (3) KRAULEN: W 240 Schritte, gemessen die letzten 120 (2 Sim-Sekunden) gegen speed × speedMul.
        st.yaw = -Math.PI / 2;
        let p0 = null;
        for (let i = 0; i < 240; i++) {
            schritt({ w: true });
            if (i === 119) p0 = pm.position.clone();
        }
        const weg = Math.hypot(pm.position.x - p0.x, pm.position.z - p0.z);
        const soll = st.speed * SG.speedMul;
        aus.kraulen = { mps: R(weg / (120 * DT)), soll: R(soll), anteil: R(weg / (120 * DT) / soll) };
        // (4) EINTAUCHEN: aus 6 m über dem Spiegel fallen lassen — das Landungs-Ereignis des Schritt-Klangs.
        const K0 = st._schrittKlang ? st._schrittKlang.landungen : 0;
        setze(mx, spiegel + 6 + FUSS, mz);
        st.isInAir = true;
        const halter = { walkPhase: 0 };
        let landung = null,
            tiefsterFuss = Infinity,
            vEin = null;
        for (let i = 0; i < 360; i++) {
            const vy = st._fieldVy;
            schritt({});
            const fuss = pm.position.y - FUSS;
            if (fuss < tiefsterFuss) tiefsterFuss = fuss;
            if (vEin === null && fuss < spiegel) vEin = vy;
            r._schrittKlangTick(halter, 0, !!st.playerUnderwater, pm);
            const K = st._schrittKlang;
            if (!landung && K && K.landungen > K0)
                landung = {
                    schritt: i,
                    material: K.letzter && K.letzter.material,
                    fussUeberSpiegel: R(fuss - spiegel, 2),
                };
        }
        aus.eintauchen = {
            landung,
            eintauchVy: R(vEin, 2),
            tiefsterFussUnterSpiegel: R(spiegel - tiefsterFuss, 2),
        };
        // (5) DAS MEDIUM DER KAMERA (W-L-d): die Luft geht in den Wasser-Modus (Höhen-Abnahme aus, H = 1e9), wenn die
        // KAMERA unter dem Spiegel liegt — nie nach den Augen des Körpers. Zwei Fälle über der See-Mitte: (a) Kamera
        // 3 m unter dem Spiegel, die Augen des Körpers in der Luft; (b) Kamera 10 m darüber, die Augen getaucht.
        const cam = st.camera;
        const luft = r._luftEnsure();
        if (cam) {
            const camAlt = cam.position.clone();
            const augenAlt = st.playerEyesUnderwater;
            const modus = (camY, augen) => {
                cam.position.set(mx, camY, mz);
                cam.updateMatrixWorld(true);
                st.playerEyesUnderwater = augen;
                r._applyDayNightToScene();
                return luft.U.hoehe.value >= 1e8;
            };
            try {
                aus.medium = { kameraUnten: modus(spiegel - 3, false), kameraOben: modus(spiegel + 10, true) };
            } finally {
                cam.position.copy(camAlt);
                cam.updateMatrixWorld(true);
                st.playerEyesUnderwater = augenAlt;
                r._applyDayNightToScene();
            }
        }
        // (6) DAS TIER IM WASSER (W-T, R-D8/R-D9): je Art nah (der Spieler 8 m daneben) und fern (120 m) — die Sohle gegen
        // ihre Wasserlinie und „am Grund" (Sohle < Grund + 0,5 m); (6b) ohne Gestalt-Baum liegt die Wasserlinie auf der
        // Schwimm-Tiefe des Gesetzes (VERHALTEN.wasser.schwimmTiefeM).
        const playerAlt = pm.position.clone();
        try {
            aus.tier = [8, 120]
                .flatMap((abstand) => ["wesen", "wolf", "fuchs", "baer"].map((seele) => tierLage(seele, abstand)))
                .filter(Boolean)
                .map((t) => Object.assign(t, { amGrund: spiegel - t.sohleUnterSpiegel < gm + 0.5 }));
            const b = tierLage("wolf", 8, true);
            const soll = R(A._verhaltenGesetz().wasser.schwimmTiefeM, 3);
            if (b) aus.baumlos = { sohleUnterSpiegel: b.sohleUnterSpiegel, soll };
        } finally {
            pm.position.copy(playerAlt);
        }
        // (7) DER MITSPIELER (W-kD3b): ein Peer-Körper des Menschen treibt mit der Brustkorb-Linie am See-Spiegel —
        // die EINE Wasser-Wahrheit macht ihn zum Schwimmer (die Schwimm-Lehne neigt den Leib), wie den eigenen.
        const peer = {
            peerId: "wasser-linse",
            soulName: st.player && st.player.soul,
            x: mx,
            y: spiegel - brust + FUSS,
            z: mz,
            yaw: 0,
        };
        r._p2pApplyPeerSoul(peer);
        if (peer.mesh) {
            peer.lastMovedAt = 0;
            peer.walkPhase = 0;
            for (let k = 0; k < 4; k++) r._p2pUpdatePeer(peer, 10 + k * 0.05, 0.05);
            aus.peer = { lehne: R(peer.mesh.rotation.x, 3), meshKind: peer.meshKind };
            st.scene.remove(peer.mesh);
            r._disposeSoulGroup(peer.mesh); // die EINE Entsorgungs-Regel (Frost 08.10.: `_p2pDisposeMesh` fiel)
        }
        // (8) DAS LICHT AM WASSER (K9) fährt mit dem echten Renderer: `wasserLicht` (der Himmel lebt auf der GPU, D3)
        // (9) DAS EIS (stoffe.K3): im Winter (Saison 0,875) trägt der gefrorene See denselben Gang und dieselben Tiere am
        // Spiegel; die Mutation (das Feld +10 °C an seiner EINEN Naht `_temperaturFeld`) bricht den Spieler ein. Gemeldet
        // die Temperatur des Wassers: die Luft an der Naht (`_temperaturAt`) durch die Trägheit seines Körpers (`wasserKoerper`
        // aus der Stoff-Tafel), wie das Eis sie liest (`_eisLinien`).
        const koerper = (y, tiefe) => window.__gelaendeCore.wasserKoerper(r._gelaende(), y, tiefe, r._wasserStoff());
        const tauSee = koerper(spiegel, tiefeMitte).traegTage;
        const gang = () => Object.assign(gehen(), { temperatur: R(r._temperaturAt(spiegel, tauSee)) });
        const feld = (dT) =>
            (r._temperaturFeld = (y, tr) => {
                const F = A.prototype._temperaturFeld.call(r, y, tr);
                return { ...F, mittel: F.mittel + dT };
            });
        Object.assign(st, { autoSeason: false, seasonPhase: 0.875 });
        aus.eis = {
            winter: gang(),
            tier: ["wolf", "fuchs", "baer"].map((seele) => tierLage(seele, 8)).filter(Boolean),
        };
        // (10) DER ÜBERGANG: je Tag ab Saison 0,7 an der See-Mitte, ob das Bild Eis zeigt (über der Linie `null` an ihrer Säule,
        // `_eisLinien` wie der Stoff) und ob es trägt (`_eisAt`) — vom ersten Eis zum tragenden vergehen Tage, je Lage EIN
        // Wechsel; am Tag des ersten und des tragenden Eises ändern 24 Uhr-Lagen nichts (das Eis integriert den Tag).
        const uhr = st.timeOfDay;
        const tag = (t, h = uhr) => {
            Object.assign(st, { seasonPhase: 0.7 + t / 365, timeOfDay: h });
            return [spiegel >= r._eisLinieBei(r._eisLinien().null, tiefeMitte), r._eisAt(mx, mz, spiegel + 0.5, 1) !== null] + "";
        };
        const tage = Array.from({ length: 120 }, (_, t) => tag(t));
        const [erster, traegt] = [tage.findIndex((l) => l > "t"), tage.indexOf("true,true")];
        aus.eis.uebergang = {
            erster,
            traegt,
            wechsel: tage.filter((l, t) => t && l !== tage[t - 1]).length,
            tagesgang: [erster, traegt].map((t) => new Set(Array.from({ length: 24 }, (_, h) => tag(t, h / 24))).size - 1),
        };
        st.timeOfDay = uhr;
        // (11) DAS MEER friert im gemäßigten Winter nicht (Salz und Masse seines Körpers, `wasserKoerper`): vor der Küste
        // (`__wasserOrte`) je Woche des Jahres sein Wasser gegen seinen Gefrierpunkt und das Eis an seinem Spiegel
        // (`_eisAt`); das Feld −15 °C friert es (die Probe sieht Eis).
        const woche = (f) => Array.from({ length: 52 }, (_, i) => ((st.seasonPhase = i / 52), f()));
        const eis = () => woche(() => r._eisAt(...o.meer, st.waterLevel + 0.5, 1)).filter((e) => e !== null).length;
        const K = koerper(st.waterLevel, 1);
        const w = woche(() => r._temperaturAt(st.waterLevel, K.traegTage));
        aus.eis.meer = { tiefst: R(Math.min(...w)), gefrier: R(K.gefrier), traegt: eis() };
        feld(-15);
        aus.eis.meer.kalt = eis();
        st.seasonPhase = 0.875;
        feld(10);
        aus.eis.mutation = gang();
        delete r._temperaturFeld;
        const fl = o.fluss || (await window.__wasserOrte({})).fluss;
        [aus.schmelze, aus.pegel] = wasserSchmelze(r, x0 + 20, mz, { see: [mx, mz], ruhe: spiegel, ufer: x0, fluss: [fl.x, fl.z] });
        aus.erstarrung = wasserErstarrung(r, [[x0, mz], [mx, mz]]);
        aus.gluehen = await wasserGluehen(r, [x0 + 6, mz]);
    } finally {
        delete r._temperaturFeld;
        [st.seasonPhase, st.autoSeason] = jahr;
        r._tickSeason(0); // Schneegrenze und Pegel tragen wieder die Saison der Welt
        leib.zurueck();
    }
    return aus;
}

// (12) DIE SCHMELZE UND DER PEGEL ÜBER SPIELZEIT (stoffe.K3-2): das Jahr läuft im Takt der Saison (`_tickSeason`, eine Woche je
// Takt); am Ort (x, z) je Woche der Pegel des Schnees (`_schneePegelAt`), das Tagesmittel der Luft (die Uhr und ihr Gegenüber heben
// den Tagesgang auf), der Versatz, den die Welt trägt (`_schneeGilt`), das Weiß des Boden-Lesers (`_bodenFarbeAt` gegen den Schnee
// der Palette) und die Chunks, die der Takt der Grenze neu baut. DER PEGEL am See P.see: je Woche der Spiegel des Gesetzes
// (`_atlasWaterLevelAt`) über seinem Ruhe-Spiegel P.ruhe (`hub`), ob an seiner Höhe Schnee schmilzt (Kern `abfluss`; `gegen` die
// Wochen, in denen eins ohne das andere ist), der Fluss an P.fluss (`_hydroRiverAt`), die Tafeln an den Faden (`post`) und die
// Chunks, die der Takt des Pegels neu baut; dann der Körper (`_koerperWasser`, das gezeichnete Wasser) an der Woche des höchsten
// Pegels und in Ruhe, die Chunks gebaut: [sein Spiegel über P.ruhe, die nassen Proben (0,25 m) vom See bis 5 m hinter das Ufer
// P.ufer, der Bezug der Ufer-Bänder]; dann der Regen am Bach (R, wetter.K3). Die Festhalte-Probe: das Feld ohne Jahres-Welle
// hält Schnee und Spiegel (`halt` 0).
// → [die Schmelze, der Pegel]
function wasserSchmelze(r, x, z, P) {
    const [st, K, jahr] = [r.state, window.__gelaendeCore, [r.state.seasonPhase, r.state.autoSeason]];
    const [y, g] = [r._voxelSurfaceY(x, z), r._voxelSurfaceY(...P.see)];
    const [S, c, R] = [r.constructor.BODEN_FARBE.schnee, [0, 0, 0], wasserRund(3)];
    const spanne = (a) => R(Math.max(...a) - Math.min(...a));
    const [post, takt, pg] = [r._voxelZustandPost, r._pegelTakt, { post: 0, neuBau: 0 }];
    r._voxelZustandPost = (m) => {
        if (m.delta && m.delta.pegel !== undefined) pg.post++;
        post.call(r, m);
    };
    r._pegelTakt = () => {
        const alt = st.dirtyVoxelChunks || new Set();
        st.dirtyVoxelChunks = new Set();
        takt.call(r);
        pg.neuBau += st.dirtyVoxelChunks.size;
        st.dirtyVoxelChunks = new Set([...alt, ...st.dirtyVoxelChunks]);
    };
    const lauf = () => {
        const alt = [st.seasonPhase, st.autoSeason, st.seasonYearSeconds, (r._lastSeasonTime = 0)];
        Object.assign(st, { seasonPhase: 0.375, autoSeason: true, seasonYearSeconds: 10.4 });
        const w = [];
        let neuBau = 0;
        try {
            for (let k = 1; k <= 52; k++) {
                const vor = st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0;
                r._tickSeason(k * 200);
                neuBau += (st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0) - vor;
                r._bodenFarbeAt(x, y, z, c);
                const F = r._temperaturFeld(y, 0);
                const t = (K.temperaturAus(F, st.seasonPhase, 0.25) + K.temperaturAus(F, st.seasonPhase, 0.75)) / 2;
                const a = K.abfluss(r._gelaende(), P.ruhe, Math.floor(st.seasonPhase * 365) / 365, (tr) => r._temperaturFeld(P.ruhe, tr));
                w.push({ p: r._schneePegelAt(y), t, v: r._schneeGilt(), weiss: 1 - Math.max(...c.map((v, i) => Math.abs(v - S[i]))) });
                Object.assign(w[k - 1], { h: R(r._atlasWaterLevelAt(...P.see, g) - P.ruhe), a: a > 0, f: (r._hydroRiverAt(...P.fluss) || {}).surfaceY, s: st.seasonPhase });
            }
        } finally {
            [st.seasonPhase, st.autoSeason, st.seasonYearSeconds, r._lastSeasonTime] = alt;
            r._tickSeason(0);
        }
        const n = (f) => w.filter((b, i) => i && f(w[i - 1], b)).length;
        return [
            {
                pegel: spanne(w.map((b) => b.p)),
                schmilzt: n((a, b) => a.t > 0 && b.p < a.p),
                gegen: n((a, b) => (a.t > 1.5 && b.p > a.p + 1e-6) || (a.t < -1.5 && b.p < a.p - 1e-6)),
                versatz: spanne(w.map((b) => b.v)),
                weiss: spanne(w.map((b) => b.weiss)),
                neuBau,
            },
            w,
        ];
    };
    const koerper = (p) => {
        Object.assign(st, { seasonPhase: p, autoSeason: false });
        r._tickSeason(0);
        r._drainDirtyVoxelChunks();
        let nass = 0;
        for (let u = P.see[0]; u <= P.ufer + 5; u += 0.25) nass += r._koerperWasser(u, P.see[1], r._voxelSurfaceY(u, P.see[1])) > r._voxelSurfaceY(u, P.see[1]) + 0.02;
        return [R(r._koerperWasser(...P.see, -Infinity) - P.ruhe), nass, R(r._waterLevelAt(...P.see) - P.ruhe)];
    };
    try {
        const [aus, w] = lauf();
        const top = w.reduce((b, o, i) => (o.h > w[b].h ? i : b), 0);
        Object.assign(pg, { hub: w[top].h, wochen: w.filter((o) => o.h > 0).length, gegen: w.filter((o) => o.h > 0 !== o.a).length });
        Object.assign(pg, { fluss: spanne(w.map((o) => o.f)), flut: koerper(w[top].s), ruhe: koerper(0.375) });
        // R (wetter.K3) DER REGEN SPEIST DEN BACH: das Wort des Spielers „Sturm", 20 min Welt-Uhr im Takt des Regens (`_tickRain`
        // je 5 s): der Spiegel am Bach P.fluss (`_waterLevelAt`) über dem trockenen (`hub`), die Tafeln an den Faden (`post`), das
        // gezeichnete Wasser am See (`koerper`, wie P2); das Regen-Feld gehalten (der Sturm regnet nicht), hebt er nichts (`fest`).
        const sturm = () => {
            const wort = (w, s) => (r._setWeather(w, "human"), (st.weatherTransition = null), r._naesseTakt(s));
            const [vor, p0] = [(wort("sunny", 1e6), r._waterLevelAt(...P.fluss)), pg.post];
            wort("stormy", 0);
            for (let k = 0; k < 240; k++) (st.spielZeit += 5), r._tickRain();
            const aus = { hub: R(r._waterLevelAt(...P.fluss) - vor), post: pg.post - p0, koerper: koerper(0.375)[0] };
            return wort("sunny", 1e6), aus;
        };
        pg.regen = sturm();
        r._weatherFieldFor = () => r.constructor.prototype._weatherFieldFor.call(r, "sunny");
        pg.regen.fest = sturm().hub;
        r._temperaturFeld = (yy, tr) => {
            const F = r.constructor.prototype._temperaturFeld.call(r, yy, tr);
            return { ...F, jahr: { ...F.jahr, amp: 1e-9 } };
        };
        const [h, wh] = lauf();
        [aus.halt, pg.halt] = [h.pegel, Math.max(...wh.map((o) => Math.abs(o.h)))];
        return [aus, pg];
    } finally {
        ["_temperaturFeld", "_voxelZustandPost", "_pegelTakt", "_weatherFieldFor"].forEach((k) => delete r[k]);
        [st.seasonPhase, st.autoSeason] = jahr;
        r._tickSeason(0);
    }
}

// (13) DIE ERSTARRUNG ÜBER SPIELZEIT (stoffe.K3-2): die DSL gießt Lava (`lava`) an Land und ins Wasser des Sees, die Uhr läuft
// im Takt des Tags (`tickDayNight`, Tag 1 min: ein Takt = 0,4 Welt-Stunden); je Takt die glut-Achse der Welt (`auraAt`, `frei`
// ohne Lava), der Stoff unter dem Fuß (`_kontaktStoffAt`), die Decke (`_lavaAt`) und ihr Licht (`_leuchtQuellen`); `ab` der
// erste erstarrte Takt. Die Taten fallen danach.
function wasserErstarrung(r, orte) {
    const st = r.state;
    const wm = st.worldMeta;
    const n = (wm.taten || []).length;
    const alt = [st.timeOfDay, wm.tag, st.dayLengthMinutes, st._lastDayNightTick];
    const aus = orte.map(([x, z]) => ({ x, z, y: r._voxelSurfaceY(x, z), frei: r.auraAt(x, z).glut, reihe: [] }));
    try {
        for (const o of aus) r.dslRun(["lava", o.x, o.y, o.z], { source: "human" });
        Object.assign(st, { dayLengthMinutes: 1, _lastDayNightTick: 0 });
        for (let k = 0; k <= 15; k++) {
            if (k) r.tickDayNight(k);
            aus.forEach((o, i) => {
                const d = r._lavaAt(o.x, o.z);
                const licht = r._leuchtQuellen(o.x, o.y, o.z, 30).some((q) => q.id === wm.taten[n + i]);
                o.reihe.push({ glut: wasserRund(2)(r.auraAt(o.x, o.z).glut), stoff: r._kontaktStoffAt(o.x, o.z, o.y), erstarrt: d.erstarrt, dampf: d.dampf, licht });
            });
        }
    } finally {
        wm.taten.splice(n);
        r._tatGen = (r._tatGen | 0) + 1;
        [st.timeOfDay, wm.tag, st.dayLengthMinutes, st._lastDayNightTick] = alt;
    }
    for (const o of aus) o.ab = o.reihe.findIndex((s) => s.erstarrt);
    return aus;
}

// (15) DER STAHL DER ESSE (stoffe.K3-2): eine Esse am Ufer bei (x, z), die Klinge der Schmiede in der Hand (`klinge_langschwert` aus
// dem Buch der Foundry), mittags im Sommer (das Spieler-Wort); der Takt der Esse (`_tickEsse`) je Sekunde — `feuer`: die Hand am
// Glutbett 60 s, `kalt`: 4,5 m vor der Esse 600 s; je die Sekunde, in der die Glut (Kern `glutAus`) an- bzw. ausgeht (`wechsel`),
// danach die Temperatur, die Glut, das Licht (`_leuchtQuellen`: die Farbtemperatur) und die Luft des Felds an der Hand
// (`_temperaturAt`). Die Mutation: das Feld +10 °C (die Naht `_temperaturFeld`) — derselbe Gang endet um `feld` K wärmer.
async function wasserGluehen(r, [x, z]) {
    const [st, K, R, E] = [r.state, window.__gelaendeCore, wasserRund(2), r.constructor.ESSE];
    const buch = await r._foundryAwaitBook(90000);
    if (!st.blueprints.klinge_langschwert) return { fehler: "keine Klinge der Schmiede: " + JSON.stringify(buch) };
    const pm = st.playerMesh;
    const [held, uhr, ort] = [st.player.equipped && st.player.equipped.held, st.timeOfDay, pm.position.clone()];
    const esse = r.spawnArchitecture("esse", { x, y: r._voxelSurfaceY(x, z), z });
    if (!esse) return { fehler: "die Esse stand nicht" };
    const glut = () => (r._stahl ? K.glutAus(r._stahl.T + 273.15, E.feuerK) : 0);
    const gang = (d, s) => {
        pm.position.set(esse.position.x, esse.position.y, esse.position.z + d);
        let wechsel = 0;
        for (let t = 1; t <= s; t++) {
            const vor = glut() > 0;
            r._tickEsse(1);
            if (!wechsel && glut() > 0 !== vor) wechsel = t;
        }
        const q = r._leuchtQuellen(pm.position.x, pm.position.y, pm.position.z, 30).find((l) => l.quelle === "stahl");
        const T = r._stahl ? R(r._stahl.T) : null;
        return { wechsel, T, glut: R(glut()), kelvin: q ? R(q.L.kelvin, 0) : null, luft: R(r._temperaturAt(pm.position.y)), esse: r._stahl && r._stahl.esse };
    };
    try {
        r.setSeason("sommer");
        r.setTimeOfDay(0.5);
        r.equipHeld("klinge_langschwert");
        r._stahl = null;
        const aus = { stoff: r._geraetStoff(st.blueprints.klinge_langschwert), feuer: gang(1.15, 60), kalt: gang(4.5, 600) };
        r._temperaturFeld = (y, t) => {
            const F = r.constructor.prototype._temperaturFeld.call(r, y, t);
            return { ...F, mittel: F.mittel + 10 };
        };
        r._stahl = null;
        gang(1.15, 60);
        aus.feld = R(gang(4.5, 600).T - aus.kalt.T);
        return aus;
    } finally {
        delete r._temperaturFeld;
        r._stahl = null;
        r.removeArchitecture(esse, { still: true });
        r.equipHeld(held || null);
        r.setTimeOfDay(uhr);
        pm.position.copy(ort);
    }
}
// Der See am Ziel (die Region der Hydrosphäre, Heimat oder Kachel — der See der Landform liegt jenseits ±1024 m): der nächste
// mit Spiegel über dem Meer und mehr als 8 Zellen; ein Fehler-Befund, wenn keiner trägt.
function __wasserSeeAm(r, ziel) {
    const st = r.state;
    const h = r._hydroFor(ziel[0], ziel[1]);
    if (!h || !h.ready) return { fehler: "keine Hydrosphäre" };
    const seen = (h.lakes || []).filter((l) => l.level > (st.waterLevel || 0) + 2 && l.cells && l.cells.length > 8);
    let see = null,
        best = Infinity;
    for (const l of seen) {
        const cx = (l.bbox.minX + l.bbox.maxX) / 2,
            cz = (l.bbox.minZ + l.bbox.maxZ) / 2;
        const d = Math.hypot(cx - ziel[0], cz - ziel[1]);
        if (d < best) {
            best = d;
            see = l;
        }
    }
    return see ? { see } : { fehler: "kein See" };
}

// ── K9: DAS LICHT AM WASSER (W-L-a, W-L-b) — mit dem echten Renderer ──
// Seit D3 ist der Himmel über dem Wasser die Himmels-Sicht der EINEN Atmosphäre, gemalt auf der GPU und EINE Lesung später auf
// der CPU (`_himmelFrisch`): der Null-Renderer malt keinen Himmel (Lehre 16). Die Probe fährt darum im Bild-Lauf (B), am See
// nächst der Mess-Wiese, die Kamera 10 m über und 3 m unter seinem Spiegel.
async function wasserLicht(o = {}) {
    if (!st.renderer || st.renderer._isHeadlessNull) return { fehler: "kein echter Renderer (der Himmel lebt auf der GPU)" };
    const ziel = o.see || (await window.__wasserOrte({})).see.mitte;
    const seeAm = window.__wasserSeeAm(r, ziel);
    if (seeAm.fehler) return { fehler: seeAm.fehler };
    const spiegel = seeAm.see.level;
    const mx = ziel[0];
    const mz = (o.start || (await window.__wasserOrte({})).see.ufer)[1];
    const R = wasserRund(3);
    const aus = {};
    // DAS LICHT AM WASSER (W-L-a, W-L-b): die Farbe der Luft (das Medium, das die Unterwasser-Sicht trägt) zur
    // Mitternacht und zu Mittag, über und unter dem Spiegel; und die Himmels-Umgebung (die IBL jedes Stoffs und
    // der Spiegel des Wassers) am Horizont vor dem Tauchen und danach — der Tauchgang darf sie nicht färben.
    const camL = st.camera;
    const luftL = r._luftEnsure();
    if (camL) {
        const camAltL = camL.position.clone();
        const zeitAlt = st.timeOfDay;
        const weltZeitAlt = st.world ? st.world.timeOfDay : undefined;
        const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
        const augenAltL = st.playerEyesUnderwater;
        // Die Umgebung der EINEN Atmosphäre (D3) kommt EINE Lesung nach der Malung auf die CPU (`_himmelFrisch`, linear
        // Float32): neu gezeichnet und ihre Lesung abgewartet — eine alte Lesung trüge die vorige Uhrzeit.
        const frisch = () => r._himmelFrisch();
        const luft = async (zeit, camY) => {
            // Kamera UND Augen im selben Medium.
            st.playerEyesUnderwater = camY < spiegel;
            st.timeOfDay = zeit;
            if (st.world) st.world.timeOfDay = zeit;
            camL.position.set(mx, camY, mz);
            camL.updateMatrixWorld(true);
            r._applyDayNightToScene();
            if (!(await frisch())) return null;
            r._applyDayNightToScene();
            // unter Wasser: das Medium der Kamera (`U.farbe`); darüber streut die Luft den Himmel der Atmosphäre
            // (D3, `himmelFarbe`) — seine Leuchtdichte über dem Wasser ist E/π der waagrechten Normale
            if (luftL.U.unterWasser.value > 0.5) return lum(luftL.U.farbe.value);
            const e = r._himmelsIrradianz();
            return e ? 0.2126 * e.mitte[0] + 0.7152 * e.mitte[1] + 0.0722 * e.mitte[2] : null;
        };
        const himmel = async () => {
            if (!(await frisch())) return null;
            const tx = r._himmelUmgebungTex();
            const W = tx.image.width,
                H = tx.image.height,
                d = st._skyEnvData;
            if (!d) return null;
            const i = ((H >> 1) * W + (W >> 1)) * 4;
            return [d[i], d[i + 1], d[i + 2]].map((x) => R(x, 5));
        };
        try {
            const nachtOben = await luft(0.0, spiegel + 10);
            const nachtUnten = await luft(0.0, spiegel - 3);
            const mittagUnten = await luft(0.5, spiegel - 3);
            const mittagOben = await luft(0.5, spiegel + 10);
            const vorTauchen = await himmel();
            await luft(0.5, spiegel - 3);
            const getaucht = await himmel();
            await luft(0.5, spiegel + 10);
            aus.licht = {
                nachtOben: R(nachtOben, 4),
                nachtUnten: R(nachtUnten, 4),
                mittagOben: R(mittagOben, 4),
                mittagUnten: R(mittagUnten, 4),
                himmelVor: vorTauchen,
                himmelGetaucht: getaucht,
            };
        } finally {
            st.playerEyesUnderwater = augenAltL;
            st.timeOfDay = zeitAlt;
            if (st.world && weltZeitAlt !== undefined) st.world.timeOfDay = weltZeitAlt;
            camL.position.copy(camAltL);
            camL.updateMatrixWorld(true);
            r._applyDayNightToScene();
        }
    }
    return aus.licht || { fehler: "keine Kamera oder Luft" };
}

// Die Krone der Bank eines Fluss-Punkts nach dem Gesetz des Stands: halbe Breite + Tiefe / bankNeigung, die Tiefe aus
// `_flussTiefe`.
function __wasserKroneVon(r, p) {
    const A = r.constructor;
    const HC = A.HYDROSPHERE;
    const w = p.width;
    const D = typeof A._flussTiefe === "function" ? A._flussTiefe(p) : HC.carveBedMin + HC.carveBedK * w;
    if (!Number.isFinite(HC.bankNeigung)) throw new Error("HYDROSPHERE.bankNeigung fehlt (das Gesetz der Bank)");
    return w * 0.5 + D / HC.bankNeigung;
}

// ── Q6: die Ufer-Flut (W-W1) ──
// Der Spieler steht am Fluss der Mess-Wiese, die Welt streamt um ihn, der Wasser-Automat wird geweckt
// und läuft 600 Takte; dann je Fluss-Punkt im Nah-Ring beide Ufer jenseits der Krone (+0,5 … +6 m): wo das Gesetz das
// Ufer TROCKEN nennt (sein Spiegel unter dem Boden), darf auch der Körper kein Wasser lesen (`_koerperWasser` > Boden +
// 0,1 m = geflutet).
async function wasserUfer(o = {}) {
    const h = st.hydrosphere;
    if (!h || !h.ready) return { fehler: "keine Hydrosphäre" };
    const ziel = o.ort || (({ fluss }) => [fluss.x, fluss.z])(await window.__wasserOrte({}));
    const { p: best, fluesse } = __wasserFlussNah(r, ziel[0], ziel[1]); // der Fluss des Befunds liegt jenseits ±1024 m
    if (!best) return { fehler: "kein Fluss" };
    await window.__wasserStrom([best.x, best.z], 3);
    for (let k = 0; k < (o.takte || 600); k++) r._tickWorldWaterCA();
    // Der Körper-Leser: die EINE Wasser-Wahrheit am Körper.
    const koerper = (x, z, boden) => r._koerperWasser(x, z, boden);
    const span = r._voxelChunkConfig(0).span;
    const pcx = Math.floor(st.playerMesh.position.x / span),
        pcz = Math.floor(st.playerMesh.position.z / span);
    let trocken = 0,
        geflutet = 0,
        maxFlut = 0;
    const beispiele = [];
    for (const rv of fluesse) {
        const P = rv.points;
        for (let k = 0; k + 1 < P.length; k++) {
            const a = P[k],
                b = P[k + 1];
            if (a.inLake || b.inLake) continue;
            if (Math.abs(Math.floor(a.x / span) - pcx) > 2 || Math.abs(Math.floor(a.z / span) - pcz) > 2) continue;
            const fx = b.x - a.x,
                fz = b.z - a.z,
                fl = Math.hypot(fx, fz) || 1;
            const nx = -fz / fl,
                nz = fx / fl;
            const krone = __wasserKroneVon(r, a);
            for (const sg of [-1, 1])
                for (let d = krone + 0.5; d <= krone + 6; d += 1.1) {
                    const x = a.x + nx * d * sg,
                        z = a.z + nz * d * sg;
                    const boden = r._voxelSurfaceY(x, z);
                    if (!Number.isFinite(boden)) continue;
                    if (r._atlasWaterLevelAt(x, z, boden) > boden) continue; // das Gesetz nennt es nass
                    trocken++;
                    const w = koerper(x, z, boden);
                    if (w > boden + 0.1) {
                        geflutet++;
                        if (w - boden > maxFlut) maxFlut = w - boden;
                        if (beispiele.length < 4)
                            beispiele.push([Math.round(x), Math.round(z), wasserRund(2)(w - boden)]);
                    }
                }
        }
    }
    return { ort: [best.x, best.z], trocken, geflutet, maxFlutM: wasserRund(2)(maxFlut), beispiele };
}

// Der Fluss-Punkt nächst (x, z) über die Heimat und die fernen Kacheln (nie im See): { p, vor (sein Nachbar im Lauf),
// fluesse (jeder Fluss der geladenen Regionen) }; p null ohne Fluss.
function __wasserFlussNah(r, x, z) {
    const st = r.state;
    const fluesse = [];
    for (const h of [st.hydrosphere].concat(st.hydroTiles ? [...st.hydroTiles.values()] : []))
        if (h && h.ready) fluesse.push(...(h.rivers || []));
    const aus = { p: null, vor: null, fluesse };
    for (const rv of fluesse)
        rv.points.forEach((q, k) => {
            if (!q.inLake && (!aus.p || Math.hypot(q.x - x, q.z - z) < Math.hypot(aus.p.x - x, aus.p.z - z)))
                ((aus.p = q), (aus.vor = rv.points[k - 1] || rv.points[k + 1]));
        });
    return aus;
}

// DER STROM AN EINEN ORT (Seite, EIN Weg für jede Probe der Wand): der Spieler `hoehe` über dem Boden an `ort`, die Welt
// streamt synchron um ihn (Worker ausgehängt — wie der Playtest), bis die Chunk-Zahl steht. Der Bild-Renderer ruht dabei.
async function wasserStrom(ort, hoehe) {
    if (st.renderer) {
        st.renderer.render = function () {};
        if (typeof st.renderer.renderAsync === "function") st.renderer.renderAsync = () => Promise.resolve();
    }
    st.postProcessingFailed = true;
    st.playerMesh.position.set(ort[0], r._voxelSurfaceY(ort[0], ort[1]) + hoehe, ort[1]);
    if (st._fixedSimPos) st._fixedSimPos.copy(st.playerMesh.position);
    // die Kacheln des Rings kommen aus dem Faden, ehe er aushängt (der Haupt-Faden rechnet sie nie)
    await window.__weltDa(() => !r._ensureHydroTilesAround(ort[0], ort[1], 2048));
    const worker = st.voxelWorker;
    st.voxelWorker = null;
    r._syncStelle = "naht"; // der Faden hängt aus: der Ring baut an der Test-Naht (`SYNC_STELLEN`, streaming.K4)
    for (let last = -1, still = 0, weiter = window.__deckel("der Ring am Wasser", 9000); weiter(); await sleep(0)) {
        try {
            r._gameLoopTick(performance.now());
        } catch {}
        const n = st.voxelChunks ? st.voxelChunks.size : 0;
        still = n === last ? still + 1 : 0;
        last = n;
        if (n >= 9 && still > 30 && !r._weltOffen().chunks) break;
    }
    st.voxelWorker = worker;
    r._syncStelle = null;
}

// ── F3: DER GRABEN AM FLUSS ── Je ein Graben 1 m und 3 m jenseits der Krone (`__wasserKroneVon`, je eine Bank)
// über den Weg des Grabe-Hiebs (DSL `voxel_carve`, r 3,5 m), dann Takt um Takt, bis der Automat ruht (höchstens `o.takte`).
// Je Takt über ±9 m je 0,5 m das GEZEICHNETE Wasser > 10 cm über dem gezeichneten Boden (`_bodenSichtAt`) gegen den Spiegel
// des Gesetzes (`_atlasWaterLevelAt`, jenseits der Krone `_hydroSpiegelQuer`): `doppelt`, `ueber` (> 10 cm darüber), in Ruhe
// `abseits` (> 10 cm darunter, wo der Spiegel über dem Boden des Gesetzes liegt); die Nah-Wiese ganz außerhalb des
// Hiebs (die Säule r 3,5 und eine Zelle über ihre Wand, dort trägt die Ecke ihren Abstand, gelaende-core `editForm`; zwei
// Zellen des Sheets, eine Zelle seines Netzes: r + 4 Zellen; Fälle, Büschel je Takt); der Takt berichtet, nie geurteilt.
async function wasserGraben(o = {}) {
    const K = r.constructor.NAH_WIESE.kachel;
    const HIEB = 3.5; // das Maß des Grabe-Hiebs
    const AUSSEN = HIEB + 4 * r._voxelChunkConfig(0).step;
    const f2 = wasserRund(2);
    const { p: a, vor: b } = __wasserFlussNah(r, o.fluss.x, o.fluss.z);
    if (!a || !b) return { fehler: "kein Fluss am Ort" };
    const nl = Math.hypot(a.x - b.x, a.z - b.z) || 1;
    const nx = -(a.z - b.z) / nl,
        nz = (a.x - b.x) / nl;
    const krone = __wasserKroneVon(r, a);
    const messen = (px, pz) => {
        const m = { nass: 0, doppelt: 0, ueber: 0, ueberM: 0, abseits: 0, abseitsM: 0 };
        for (let gz = -9; gz <= 9; gz += 0.5)
            for (let gx = -9; gx <= 9; gx += 0.5) {
                const x = px + gx,
                    z = pz + gz;
                const g = r._bodenSichtAt(x, z) ?? r._voxelSurfaceY(x, z);
                const ys = wasserFlaechen(r, x, z).filter((y) => y > g + 0.1);
                if (!ys.length) continue;
                const atlas = r._atlasWaterLevelAt(x, z, g);
                const S = atlas > -Infinity ? atlas : r._hydroSpiegelQuer(x, z);
                const top = ys[ys.length - 1];
                m.nass++;
                if (ys.length > 1) m.doppelt++;
                if (top > S + 0.1) ((m.ueber++), (m.ueberM = Math.max(m.ueberM, f2(top - Math.max(g, S)))));
                else if (S - top > 0.1 && S > r._voxelSurfaceY(x, z)) // wo das Gesetz die Spalte nass nennt
                    ((m.abseits++), (m.abseitsM = Math.max(m.abseitsM, f2(S - top))));
            }
        return m;
    };
    const graeben = [];
    for (const [abstand, sg] of o.graeben || [
        [1, 1],
        [3, -1],
    ]) {
        const px = a.x + nx * sg * (krone + abstand),
            pz = a.z + nz * sg * (krone + abstand);
        await window.__wasserStrom([px + nx * sg * 6, pz + nz * sg * 6], 0.6); // der Spieler 6 m landeinwärts
        await window.__weltStehtNach(() => r._gameLoopTick(performance.now()), 600); // die Welt steht, die Wiese mit
        const aussen = (key) => {
            const [tx, tz] = key.split(",").map(Number);
            return Math.hypot(Math.max(tx * K - px, 0, px - (tx + 1) * K), Math.max(tz * K - pz, 0, pz - (tz + 1) * K)) > AUSSEN;
        };
        const g = { abstand, ort: [f2(px), f2(pz)], sheets: 0, sheetMs: 0, caMs: 0, wieseFaelle: 0, ruhe: -1 };
        Object.assign(g, { bueschel: [Infinity, -Infinity], doppelt: 0, ueber: 0, ueberM: 0 });
        const huelle = (name, wirkt) => {
            const f = r[name];
            r[name] = function (...args) {
                const t = performance.now();
                return [f.apply(this, args), wirkt(performance.now() - t, args)][0];
            };
        };
        huelle("_buildVoxelChunkWaterCellSheet", (ms) => ((g.sheets++), (g.sheetMs += ms)));
        huelle("_tickWorldWaterCA", (ms) => (g.caMs += ms));
        huelle("_nahWieseKachelFaellt", (ms, [key]) => aussen(key) && g.wieseFaelle++);
        g.vor = messen(px, pz).nass;
        try {
            r.dslRun(["voxel_carve", px, r._voxelSurfaceY(px, pz), pz, HIEB], { source: "human" });
            for (let t = 0; t < (o.takte || 900) && g.ruhe < 0; t++) {
                r._gameLoopTick(performance.now());
                const m = messen(px, pz);
                for (const k of ["doppelt", "ueber", "ueberM"]) g[k] = Math.max(g[k], m[k]);
                let n = 0;
                for (const [key, kt] of st.nahWiese ? st.nahWiese.kacheln : []) if (aussen(key)) n += kt.bueschel.length;
                g.bueschel = [Math.min(g.bueschel[0], n), Math.max(g.bueschel[1], n)];
                const wach = (st.waterCAActive ? st.waterCAActive.size : 0) + r._weltOffen().chunks;
                if (!wach && !(st.pendingWaterIso && st.pendingWaterIso.size)) g.ruhe = t; // Automat, Neubau, Sheets ruhen
                if (t % 5 === 4) await sleep(0);
            }
        } finally {
            for (const name of ["_buildVoxelChunkWaterCellSheet", "_tickWorldWaterCA", "_nahWieseKachelFaellt"]) delete r[name];
        }
        const m = messen(px, pz);
        Object.assign(g, { nass: m.nass, abseits: m.abseits, abseitsM: m.abseitsM, caMs: f2(g.caMs) });
        graeben.push(Object.assign(g, { sheetMs: f2(g.sheetMs) }));
    }
    return { ort: [f2(a.x), f2(a.z)], krone: f2(krone), graeben };
}

// Die Höhen des gezeichneten Wassers über (x, z): je Netz, das den Punkt trägt, seine oberste Fläche (`_wasserNetzHoehe`, ein
// Netz zeichnet je Zelle ein Viereck), aufsteigend, je Fläche eine (10 cm trennen zwei). Leser: Graben und Damm.
function wasserFlaechen(r, x, z) {
    const span = r._voxelChunkConfig(0).span;
    const ys = [];
    for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
            const n = r._wasserNetz(Math.floor(x / span) + dx, Math.floor(z / span) + dz);
            const y = n ? r.constructor._wasserNetzHoehe(n, x, z) : null;
            if (y !== null) ys.push(y);
        }
    return ys.sort((p, q) => p - q).filter((y, j, l) => !j || y - l[j - 1] > 0.1);
}

// ── gelaende.K2 (b) · (d): DER DAMM AM FLUSS ── 60 m stromab des Graben-Orts (längs des Laufs) quer über den Fluss aus dem
// Verb des Aufschüttens (DSL `voxel_fill`, r 3,5 m) je 3 m eine Säule, die Krone 3 m über dem Spiegel, so weit das Land unter
// der Krone liegt (±30 m). (b) Der Spieler 40 m seitab, Takt um Takt, bis der Automat ruht; 6 und 12 m stromauf (längs des
// Laufs) das GEZEICHNETE Wasser gegen die Überlaufhöhe (der niedrigste Pfad über den Boden des Feldes `_voxelSurfaceY` von
// dort zum Fluss 12 m stromab, Gitter 0,9 m, ±50 m, halbiert auf 1 cm) und gegen den Fluss von vorher (`_hydroSpiegelQuer`),
// 6 und 12 m stromab gegen den Fluss (der Abfluss hält). (d) `o.ferne`: der Spieler 150 m auf der Achse des Damms (dort löst
// die Masche des Rings ihn auf: ~5 × 15 m), der Fern-Ring unter den Säulen vor dem Edit und nach der Antwort des Fern-Fadens
// auf ihn (byte-Diff), und der Fern-Faden, der jeden späteren Ring rechnet (die Bestellung des Rings), an denselben Punkten
// auf der Krone.
async function wasserDamm(o = {}) {
    const f2 = wasserRund(2);
    const S = (q) => r._hydroSpiegelQuer(q.x, q.z);
    const { p, fluesse } = __wasserFlussNah(r, o.fluss.x, o.fluss.z);
    const P = fluesse.find((f) => f.points.includes(p)).points;
    const ab = S(P[P.indexOf(p) + 1] || p) < S(P[P.indexOf(p) - 1] || p) ? 1 : -1;
    // der Ort d m stromab von p längs des Laufs (stromauf negativ; zwischen zwei Punkten des Laufs liegen bis 12 m)
    const lauf = (d) => {
        let [i, s, l] = [P.indexOf(p), Math.sign(d) * ab, Math.abs(d)];
        for (let e; P[i + s] && (e = Math.hypot(P[i + s].x - P[i].x, P[i + s].z - P[i].z)) < l; i += s) l -= e;
        const [q, e] = [P[i + s] || P[i], Math.hypot((P[i + s] || P[i]).x - P[i].x, (P[i + s] || P[i]).z - P[i].z) || 1];
        return { x: P[i].x + ((q.x - P[i].x) * l) / e, z: P[i].z + ((q.z - P[i].z) * l) / e };
    };
    const [a, b] = [lauf(60), lauf(61)];
    const [nx, nz] = [a.z - b.z, b.x - a.x].map((v) => v / Math.hypot(b.x - a.x, b.z - a.z));
    const krone = S(a) + 3;
    const saeulen = [];
    for (let s = -30; s <= 30; s += 3) if (r._voxelSurfaceY(a.x + nx * s, a.z + nz * s) < krone) saeulen.push([a.x + nx * s, a.z + nz * s]);
    const aus = { krone: f2(krone), saeulen: saeulen.length };
    const takt = () => r._gameLoopTick(performance.now());
    const ring = new Map();
    const fr = () => st.fernRing;
    const unter = (n) => ((q) => saeulen.some(([x, z]) => Math.hypot(q.x - x, q.z - z) < 3) && q)(r._fernRingPunkt(fr(), n)); // die ebene Krone
    const y = (q) => fr().geos[q.s].attributes.position.getY(q.li);
    await window.__wasserStrom([a.x + nx * (o.ferne ? 150 : 40), a.z + nz * (o.ferne ? 150 : 40)], 3);
    if (o.ferne) {
        await window.__gebautNach("der Fern-Ring", { fertig: () => fr() && fr().cursor >= fr().totalVerts, takt, max: 3000 });
        for (let n = 0; n < fr().totalVerts; n++) if (unter(n)) ring.set(n, y(unter(n)));
    }
    for (const [x, z] of saeulen) r.dslRun(["voxel_fill", x, krone - 3.5, z, 3.5], { source: "human" });
    if (o.ferne) {
        // der Edit reist durch die EINE Bestellung des Rings (`_fernRingUmEdits`): die Probe wartet auf ihre Antwort, eingehängt
        // (die Laufzeit-Marke `editFlug`, der Edit-Stand `feldEditsN` des Rings), nie auf eine Frist
        const ed = st.worldMeta.voxelEdits;
        await window.__gebautNach("der Edit im Fern-Ring", {
            fertig: () => fr().feldEditsN === ed.length && !fr().editFlug && !fr().nachEdit.length,
            takt,
            max: 600,
        });
        const hub = [...ring].map(([n, v]) => y(unter(n)) - v);
        // der Fern-Faden, der jeden späteren Ring rechnet: die EINE Bestellung des Rings (`_fernRingBestellen` — jedes Feld, das
        // der Faden liest) an denselben Punkten unter den Säulen, ihre Fläche auf der Krone (oder über ihr: die Krone der Masche,
        // `fernKrone`, liest das Feld, dessen Vereinigung zweier Säulen die Krone um 0,42 m hebt). z44: ein Auftrag von Hand ohne
        // Winkel und Reihen-Faktor der Masche (`ang`, `q`) warf im Faden (`fernKrone`: „reading '0'“), die Deck-Mischung fehlte still.
        const fa = await r._fernRingBestellen(fr(), Int32Array.from(ring.keys()));
        aus.ring = { punkte: hub.length, anders: hub.filter(Boolean).length, hubM: f2(Math.max(0, ...hub)), faden: fa.nassY.filter((v) => v >= krone - 0.01).length };
        return aus;
    }
    const ruht = () => !((st.waterCAActive ? st.waterCAActive.size : 0) + r._weltOffen().chunks + (st.pendingWaterIso ? st.pendingWaterIso.size : 0));
    await window.__gebautNach("der Stausee", { fertig: ruht, takt, max: 900 });
    // die Überlaufhöhe: der niedrigste Pfad über den Boden des Feldes (0,9 m, ±50 m) zum Fluss 12 m stromab, halbiert auf 1 cm
    const N = 112;
    const zelle = (q) => Math.round((q.x - a.x + 50) / 0.9) + Math.round((q.z - a.z + 50) / 0.9) * N;
    const boden = Float64Array.from({ length: N * N }, (_, c) => r._voxelSurfaceY(a.x - 50 + (c % N) * 0.9, a.z - 50 + ((c / N) | 0) * 0.9));
    const erreicht = (weg, h, da = new Uint8Array(N * N)) => {
        for (let c; (c = weg.pop()) !== undefined; )
            for (const nb of [c % N ? c - 1 : -1, (c + 1) % N ? c + 1 : -1, c - N, c + N])
                if (boden[nb] <= h && !da[nb]) weg.push(nb), (da[nb] = 1);
        return da[zelle(lauf(72))];
    };
    const oben = (q) => f2(wasserFlaechen(r, q.x, q.z).pop());
    aus.stromauf = [6, 12].map((d) => {
        let [q, lo, hi] = [lauf(60 - d), 0, krone + 1];
        for (lo = boden[zelle(q)]; hi - lo > 0.01; ) erreicht([zelle(q)], (lo + hi) / 2) ? (hi = (lo + hi) / 2) : (lo = (lo + hi) / 2);
        return { d, wasser: oben(q), ueberlauf: f2(hi), fluss: f2(S(q)) };
    });
    aus.stromab = [6, 12].map((d) => ({ d, wasser: oben(lauf(60 + d)), fluss: f2(S(lauf(60 + d))) }));
    return aus;
}

// ── Q7-Gestalt: die Ufer-Farbe ──
// Quer zum Fluss, vom Kanal bis 3 m jenseits der Krone in 2-cm-Schritten auf dem Boden (`_voxelSurfaceY`): die EINE
// Boden-Farbe (`_bodenFarbeAt`) darf dort keinen Sprung tragen — Strand, Schlick, Pfad und Höhen-Feuchte lesen die Höhe
// über dem Wasser, und wo der Fluss-Spiegel an der Krone endet, sprang der Bezug auf den Meeresspiegel. Ein Sprung =
// Luma-Stufe > 0,02 zwischen zwei Nachbar-Proben (stetig ändert sich die Farbe dort < 0,008 je 2 cm), Boden-Stufen über
// 0,15 m (Überhang, Kante) zählen nicht. Dazu die Parität: die Worker-Farbe eines Ufer-Chunks gegen den Main.
async function wasserUferFarbe(o = {}) {
    const h = st.hydrosphere;
    if (!h || !h.ready) return { fehler: "keine Hydrosphäre" };
    const L = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const R = wasserRund(1);
    const proben = [];
    for (const rv of h.rivers)
        for (let k = 3; k + 1 < rv.points.length && proben.length < (o.n || 24); k += 9) {
            const a = rv.points[k],
                b = rv.points[k + 1];
            if (!a.inLake && !b.inLake) proben.push([a, b]);
        }
    let schritte = 0,
        spruenge = 0,
        maxSprung = 0;
    const beispiele = [];
    const c = [0, 0, 0];
    // U3 — DER SCHILF-BEZUG: das Ufer-Band der Nah-Streu (Schilf, Boden-Zeile mit `ufer`) über der Höhe über dem Wasser,
    // wie die Kachel es rechnet (`_nahStreuBodenGewicht`: die Bänder über See und über dem Fluss mit seiner Kronen-Blende,
    // das Maximum). Gemessen wird NUR der Ufer-Faktor
    // (Licht, Feuchte, Fels, Hang bleiben leer: ihre eigenen Grenzen sind Gesetz, nicht Bezug). Sprung = Gewicht-Stufe
    // > 0,1 zwischen zwei 2-cm-Nachbarn (stetig höchstens 0,05: das Band läuft über 0,3 m aus).
    const core = globalThis.__phytoCore;
    const arten = r._nahStreuArten();
    const schilfA = arten ? arten.find((A) => A.zeile && A.zeile.ufer) : null;
    const schilfW = (x, z, y) => {
        const uf = { see: 0, fluss: null, ufer: 0 };
        r._waterLevelAt(x, z, uf);
        return r._nahStreuBodenGewicht(core, schilfA.zeile, { ufer: y - r._koerperWasser(x, z, y) }, uf, y);
    };
    let sSchritte = 0,
        sSpruenge = 0,
        sMax = 0;
    const sBeispiele = [];
    for (const [a, b] of proben) {
        const fx = b.x - a.x,
            fz = b.z - a.z,
            fl = Math.hypot(fx, fz) || 1;
        const nx = -fz / fl,
            nz = fx / fl;
        const weit = __wasserKroneVon(r, a) + 3;
        for (const sg of [-1, 1]) {
            let vorL = null,
                vorY = null,
                vorS = null;
            for (let d = 0; d <= weit; d += 0.02) {
                const x = a.x + nx * d * sg,
                    z = a.z + nz * d * sg;
                const y = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(y)) {
                    vorL = null;
                    vorS = null;
                    continue;
                }
                if (schilfA && core) {
                    const s = schilfW(x, z, y);
                    if (vorS !== null && Math.abs(y - vorY) < 0.15) {
                        sSchritte++;
                        const st2 = Math.abs(s - vorS);
                        if (st2 > sMax) sMax = st2;
                        if (st2 > 0.1) {
                            sSpruenge++;
                            if (sBeispiele.length < 5)
                                sBeispiele.push([R(x), R(z), R(d, 2), R(st2, 2)]);
                        }
                    }
                    vorS = s;
                }
                r._bodenFarbeAt(x, y, z, c);
                const l = L(c);
                if (vorL !== null && Math.abs(y - vorY) < 0.15) {
                    schritte++;
                    const s = Math.abs(l - vorL);
                    if (s > maxSprung) maxSprung = s;
                    if (s > 0.02) {
                        spruenge++;
                        if (beispiele.length < 5)
                            beispiele.push([R(x), R(z), R(d, 2)]);
                    }
                }
                vorL = l;
                vorY = y;
            }
        }
    }
    // Die Parität: ein Ufer-Chunk aus dem Worker (Farbe je Vertex im Worker gerechnet) gegen DASSELBE Gesetz im Stamm —
    // die Spalten-Farbe `_bodenFarbeAt` und der Fels-Stoff `_felsStoff` darüber, auf dem Netz des Workers (der Worker
    // mischt den Fels-Stoff in seine Farbe, der Stamm setzt nur die Attribute).
    let paritaet = null;
    if (r._getVoxelWorker() && proben.length) {
        await r._voxelWorkerSyncState({ op: "init" });
        const T = window.THREE;
        const span = r._voxelChunkConfig(0).span;
        let vertices = 0,
            abweichend = 0,
            maxDiff = 0,
            fels = 0;
        for (const [a] of proben.slice(0, o.chunks || 3)) {
            const m = await r._voxelWorkerComputeChunkMesh(Math.floor(a.x / span), Math.floor(a.z / span), 0);
            if (!m || m.empty) continue;
            const pos = new Float32Array(m.positions),
                col = new Float32Array(m.colors);
            const soll = new Float32Array(pos.length);
            for (let i = 0; i < pos.length; i += 3) {
                r._bodenFarbeAt(pos[i], pos[i + 1], pos[i + 2], c);
                soll[i] = c[0];
                soll[i + 1] = c[1];
                soll[i + 2] = c[2];
            }
            const spalte = soll.slice();
            const g = new T.BufferGeometry();
            g.setAttribute("position", new T.BufferAttribute(pos, 3));
            g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normals), 3));
            g.setAttribute("aHimmel", new T.BufferAttribute(new Float32Array(m.himmel), 1));
            g.setAttribute("color", new T.BufferAttribute(soll, 3));
            g.setIndex(new T.BufferAttribute(new Uint32Array(m.indices), 1));
            r._felsStoff(g);
            for (let i = 0; i < pos.length; i += 3) {
                vertices++;
                let dmax = 0,
                    dfels = 0;
                for (let k = 0; k < 3; k++) {
                    dmax = Math.max(dmax, Math.abs(soll[i + k] - col[i + k]));
                    dfels = Math.max(dfels, Math.abs(soll[i + k] - spalte[i + k]));
                }
                if (dfels > 0) fels++;
                if (dmax > 0) abweichend++;
                if (dmax > maxDiff) maxDiff = dmax;
            }
            g.dispose();
        }
        paritaet = { vertices, abweichend, maxDiff, fels };
    }
    return {
        proben: proben.length,
        schritte,
        spruenge,
        maxSprung: R(maxSprung, 3),
        beispiele,
        paritaet,
        schilf: schilfA
            ? {
                  art: schilfA.id,
                  schritte: sSchritte,
                  spruenge: sSpruenge,
                  maxSprung: R(sMax, 3),
                  beispiele: sBeispiele,
              }
            : { fehler: "keine Nah-Streu-Art mit Ufer-Band (Buch oder Render-Config fehlt)" },
    };
}

// ── Q7-Bild ──
async function wasserBild(o = {}) {
    const T = window.THREE;
    const renderer = st.renderer;
    if (!renderer || !renderer.backend || renderer.backend.isNullBackend) return { fehler: "kein echter Renderer" };
    const mat = r._ensureHydroSurfaceMaterial();
    const U = st.hydroSurfaceUniforms;
    // Ein Fluss-Bogen (Radius 40 m, 14 m breit, 120°) mit dem Strömungs-Attribut, wie es das Zell-Sheet trägt: die
    // Richtung entlang der Tangente, der Betrag zur Bank hin ausgeblendet (der wet-only Blur des Sheets). Die erste
    // Hälfte ist RUHIGES Wasser (aSlope 0 — dort schäumt das Gesetz nicht), die zweite eine STROMSCHNELLE (aSlope 3,2:
    // das Wildwasser trägt die advektierten Strähnen — an ihnen sieht die Linse den Phasen-Zerfall).
    // Der Bogen liegt am Ort der Welt-Kamera (vor ihr): die Welt-Uniforms des Materials (Kamera-Abstand der Detail-
    // Blende) lesen dieselbe Szene wie im Spiel.
    const wc = st.camera ? st.camera.position : { x: 0, y: 0, z: 0 };
    const OX = Math.round(wc.x) - 40,
        OY = Math.round(wc.y) - 20,
        OZ = Math.round(wc.z);
    const RAD = 40,
        BREITE = 14,
        NA = 120,
        NR = 28;
    const pos = [],
        flow = [],
        depth = [],
        nul = [],
        steil = [],
        farbe = [],
        idx = [];
    for (let i = 0; i <= NA; i++) {
        const a = -Math.PI / 3 + ((2 * Math.PI) / 3) * (i / NA);
        for (let j = 0; j <= NR; j++) {
            const u = j / NR;
            const rr = RAD - BREITE / 2 + BREITE * u;
            pos.push(OX + rr * Math.cos(a), OY, OZ + rr * Math.sin(a));
            const ss = (e0, e1, x) => {
                const k = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
                return k * k * (3 - 2 * k);
            };
            const mag = ss(0, 0.35, u) * ss(0, 0.35, 1 - u);
            flow.push(-Math.sin(a) * mag, Math.cos(a) * mag);
            depth.push(2.0);
            nul.push(0);
            const schnelle = a >= 0;
            steil.push(schnelle ? 3.2 : 0);
            farbe.push(1, schnelle ? 0 : 1, 1);
        }
    }
    for (let i = 0; i < NA; i++)
        for (let j = 0; j < NR; j++) {
            const a = i * (NR + 1) + j,
                b = a + NR + 1;
            idx.push(a, a + 1, b, b, a + 1, b + 1);
        }
    const geom = new T.BufferGeometry();
    geom.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    geom.setAttribute("aFlow", new T.Float32BufferAttribute(flow, 2));
    geom.setAttribute("aDepth", new T.Float32BufferAttribute(depth, 1));
    geom.setAttribute("aWave", new T.Float32BufferAttribute(nul, 1));
    geom.setAttribute("aSlope", new T.Float32BufferAttribute(steil, 1));
    geom.setAttribute("color", new T.Float32BufferAttribute(farbe, 3));
    geom.setIndex(idx);
    const W = o.w || 512,
        H = o.h || 288;
    const szene = new T.Scene();
    szene.background = new T.Color(0, 0, 0);
    const wasser = new T.Mesh(geom, mat);
    wasser.frustumCulled = false;
    szene.add(wasser);
    const cam = new T.PerspectiveCamera(50, W / H, 0.5, 400);
    cam.position.set(OX + RAD + 26, OY + 20, OZ);
    cam.lookAt(OX + RAD - 6, OY, OZ);
    cam.updateMatrixWorld(true);
    const rt = new T.RenderTarget(W, H);
    // DIE SZENEN-TIEFE DES BILDS (Integration K host-vram × Welle L wasser): das Wasser liest den Grund hinter sich aus
    // dem Tiefen-Abbild des Hauptbilds (`_szeneTiefe`; `_tiefenAbbild` zieht es nur für die Szene und die Kamera des
    // Spiels). Für den Render der Probe zieht der Zug das Abbild aus IHRER Tiefe — wie im Spiel aus dem Hauptbild;
    // sonst las ihr Bogen die Tiefe des letzten Welt-Bilds, der optische Weg zerfiel, und der Ufer-Saum deckte 99 % des
    // ruhigen Flusses (B1 SCHAUM). Nur der Zug sieht die Probe als Hauptbild (jeder andere Haken der Szene bleibt fremd).
    const zugRoh = Object.getPrototypeOf(r)._tiefenAbbild;
    const lese = async () => {
        renderer.setRenderTarget(rt);
        if (typeof zugRoh === "function")
            r._tiefenAbbild = function (frame, abbild) {
                if (frame.scene !== szene) return zugRoh.call(this, frame, abbild);
                const szeneAlt = st.scene,
                    kameraAlt = st.camera;
                st.scene = szene;
                st.camera = cam;
                try {
                    return zugRoh.call(this, frame, abbild);
                } finally {
                    st.scene = szeneAlt;
                    st.camera = kameraAlt;
                }
            };
        try {
            renderer.render(szene, cam);
        } finally {
            delete r._tiefenAbbild;
        }
        renderer.setRenderTarget(null);
        return await renderer.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
    };
    // Die Maske: derselbe Bogen auf schwarz, ruhig weiß, Stromschnelle rot (1 = ruhig, 2 = Stromschnelle).
    // (Die Wicklung zeigt nach unten wie die des Sheets — das Wasser-Material zeichnet BackSide, die Maske beide.)
    const maskMat = new T.MeshBasicNodeMaterial({ vertexColors: true, side: T.DoubleSide });
    wasser.material = maskMat;
    const mPix = await lese();
    wasser.material = mat;
    const maske = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) maske[p] = mPix[p * 4] > 128 ? (mPix[p * 4 + 1] > 128 ? 1 : 2) : 0;
    const zeitAlt = U.time.value;
    // Das Licht der Probe fest (das Render-Ziel ist linear und ungetont: im Mittagslicht sättigte der Schaum bei 255
    // und verschluckte jede Strähne): Licht des Orts 1 (Schaum 0,93 · Deckung 0,7 bleibt unter 1), kein Sonnen-Glanz.
    // Der Spiel-Loop ruht während der Probe (Lehre 17): zwischen den beiden Uhren schriebe der Tag-Nacht-Takt Licht
    // und Himmel neu. Die Stimmung der Probe fest bei 0: der Haken `uEmotion` (die Vitalität des Spielers) hebt den
    // Schaum des Gesetzes bis auf das Doppelte und driftet mit der Boot-Zeit. B1 misst den Schaum des Gesetzes, nicht die Laune.
    renderer.setAnimationLoop(null);
    // DER HIMMEL DER PROBE FEST (K40, Lehre 17): das Wasser spiegelt die Himmels-Umgebung der Tageszeit, und der Boot
    // dauert je Adapter verschieden lang — die Probe spiegelt den Mittag.
    const tagAlt = st.timeOfDay;
    const weltTagAlt = st.world ? st.world.timeOfDay : undefined;
    const himmelMittag = (zeit, welt) => {
        st.timeOfDay = zeit;
        if (st.world && welt !== undefined) st.world.timeOfDay = welt;
        r._applyDayNightToScene();
        r._ensureSkyEnvironment(true);
    };
    himmelMittag(0.5, 0.5);
    // Das Gefühl der Welt ruht (uEmotion hebt den Schaum, der Takt schreibt es aus dem Feld, je nach Boot-Dauer).
    const gefuehlAlt = U.emotion ? U.emotion.value : null;
    if (U.emotion) U.emotion.value = 0;
    const WL = Object.values(r._weltLicht().U), wlAlt = WL.map((u) => (u.value.clone ? u.value.clone() : u.value));
    const lichtAlt = U.light.value;
    const mess = async (zeit) => {
        U.time.value = zeit;
        WL.forEach((u) => (u.value = u.value.clone ? u.value.setScalar(0) : 0));
        r._weltLicht().U.ambientFarbe.value.setScalar(Math.PI); // das Licht der Welt E/π = 1 (allein Ambient π)
        U.light.value = 0;
        // DAS BILD OHNE SCHAUM: derselbe Frame mit dem Schaum-Faktor des Gesetzes auf 0 (foamD × (1 +
        // uEmotion), uEmotion −1) — „hell" zählt nur, wo der SCHAUM das Pixel hebt, nie der Himmel im Fresnel des
        // Streiflichts
        U.emotion.value = -1;
        const px0 = await lese();
        U.emotion.value = 0;
        const px = await lese();
        const L = new Float32Array(W * H);
        const L0 = new Float32Array(W * H);
        for (let p = 0; p < W * H; p++) {
            L[p] = 0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2];
            L0[p] = 0.2126 * px0[p * 4] + 0.7152 * px0[p * 4 + 1] + 0.0722 * px0[p * 4 + 2];
        }
        const zone = (z) => {
            let n = 0,
                tv = 0,
                weiss = 0,
                hell = 0,
                summe = 0,
                np = 0;
            for (let y = 0; y < H - 1; y++)
                for (let x = 0; x < W - 1; x++) {
                    const p = x + y * W;
                    if (maske[p] !== z) continue;
                    np++;
                    summe += L[p];
                    if (L[p] > 64) weiss++; // Schaum: über ein Viertel Weiß (der Wasser-Körper liegt bei Licht 1 unter 20)
                    if (L[p] > 32 && L[p] - L0[p] > 8) hell++; // Schaum-Deckung: doppelt so hell wie der Wasser-Körper im Licht 1, vom Schaum

                    if (maske[p + 1] === z && maske[p + W] === z) {
                        tv += Math.abs(L[p + 1] - L[p]) + Math.abs(L[p + W] - L[p]);
                        n++;
                    }
                }
            return {
                kantenDichte: n ? tv / n : 0,
                weissAnteil: np ? weiss / np : 0,
                hellAnteil: np ? hell / np : 0,
                mittel: np ? summe / np : 0,
                pixel: np,
            };
        };
        // das Bild selbst (für den Bericht): das Render-Ziel als PNG (linear, ungetont — ein Vergleichs-Bild, kein Look)
        return { ruhig: zone(1), schnelle: zone(2), png: o.png ? window.__png(px, W, H) : null };
    };
    let a, b, sturm;
    // B7: das Fragment-WGSL, das r184 dem Bogen baut (sein Render-Objekt mit dem Wasser-Stoff) — die Leck-Linse liest es
    const fragmente = new Set();
    const holen = renderer._objects.get;
    const zurueck = leihe(renderer._objects, {
        get(...x) {
            const ro = holen.apply(this, x);
            if (ro.object === wasser && ro.material === mat) fragmente.add(ro.getNodeBuilderState().fragmentShader);
            return ro;
        },
    });
    // Der Wind des Wetters (W-R3): ruhig (Sonne, 0,06) für beide Uhren, dann derselbe Bogen im Sturm (1,0). Vor der
    // Welle L trug das Material keinen Wind — dann ist beides dasselbe Bild.
    const windAlt = U.wind ? U.wind.value : null;
    try {
        // zwei Uhren, die keine ganze Zahl von Phasen trennt (sonst verglichen beide dieselbe Phase)
        if (U.wind) U.wind.value = 0.06;
        a = await mess(o.t0 || 61.3);
        b = await mess(o.t1 || 3601.7);
        if (U.wind) U.wind.value = 1.0;
        sturm = await mess(o.t0 || 61.3);
    } finally {
        zurueck();
        if (U.wind) U.wind.value = windAlt;
        U.time.value = zeitAlt;
        WL.forEach((u, i) => (u.value = u.value.copy ? u.value.copy(wlAlt[i]) : wlAlt[i]));
        U.light.value = lichtAlt;
        himmelMittag(tagAlt, weltTagAlt);
        if (U.emotion) U.emotion.value = gefuehlAlt;
        geom.dispose();
        maskMat.dispose();
        rt.dispose();
    }
    const R = wasserRund(3);
    const Z = (z) => ({
        kantenDichte: R(z.kantenDichte),
        weissAnteil: R(z.weissAnteil, 4),
        hellAnteil: R(z.hellAnteil, 4),
        mittel: R(z.mittel, 1),
        pixel: z.pixel,
    });
    return {
        uhr60: { ruhig: Z(a.ruhig), schnelle: Z(a.schnelle) },
        uhr3600: { ruhig: Z(b.ruhig), schnelle: Z(b.schnelle) },
        // der Phasen-Zerfall an den Strähnen der Stromschnelle: Kanten-Dichte bei 3600 s gegen 60 s
        kantenVerhaeltnis: R(a.schnelle.kantenDichte > 0 ? b.schnelle.kantenDichte / a.schnelle.kantenDichte : 0),
        // der Sturm am ruhigen Fluss: Kanten-Dichte bei Wind 1,0 gegen 0,06 (dieselbe Uhr)
        sturmVerhaeltnis: R(a.ruhig.kantenDichte > 0 ? sturm.ruhig.kantenDichte / a.ruhig.kantenDichte : 0),
        fragmente: [...fragmente],
        png60: a.png,
        png3600: b.png,
    };
}

// ── Q7-Regen ──
// Der ECHTE Regen der Welt (`_tickRain` im Sturm, dasselbe Objekt, dasselbe Material) allein auf Schwarz, mit einer
// Kamera am Auge quer zum Wind: lit = Pixel über 4/255; eine Schliere = ein senkrechter Lauf ≥ 4 lit Pixel; die Neigung
// = (rechts − links) / (rechts + links) der diagonalen Nachbarn im Lauf (der Wind treibt die Schlieren schräg).
async function wasserRegen(o = {}) {
    const T = window.THREE;
    const renderer = st.renderer;
    if (!renderer || !renderer.backend || renderer.backend.isNullBackend) return { fehler: "kein echter Renderer" };
    const W = o.w || 640,
        H = o.h || 360;
    renderer.setAnimationLoop(null);
    const wetterAlt = st.weather;
    const camAlt = st.camera;
    const cam = new T.PerspectiveCamera(camAlt.fov, W / H, camAlt.near, camAlt.far);
    cam.position.copy(camAlt.position);
    const t = 61.3;
    const wd = r._windDirAt(t);
    // quer zum Wind blicken (der Drift liegt ganz in der Bild-Ebene)
    cam.lookAt(cam.position.x - wd.z, cam.position.y, cam.position.z + wd.x);
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    const rt = new T.RenderTarget(W, H);
    let px = null,
        mesh = null,
        eltern = null;
    try {
        r._setWeather("stormy", "human");
        st.weatherTransition = null;
        st.camera = cam;
        r._bildZeit = t; // die Bild-Uhr (A9), die der Regen liest
        r._tickRain();
        const sys = r._rainSystem;
        mesh = sys && sys.mesh;
        if (!mesh) return { fehler: "kein Regen-Objekt" };
        eltern = mesh.parent;
        const szene = new T.Scene();
        szene.background = new T.Color(0, 0, 0);
        szene.add(mesh);
        renderer.setRenderTarget(rt);
        renderer.render(szene, cam);
        renderer.setRenderTarget(null);
        px = await renderer.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
    } finally {
        if (mesh && eltern) eltern.add(mesh);
        st.camera = camAlt;
        r._setWeather(wetterAlt, "human");
        st.weatherTransition = null;
        rt.dispose();
    }
    const lit = new Uint8Array(W * H);
    let n = 0;
    for (let p = 0; p < W * H; p++)
        if (0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2] > 4) {
            lit[p] = 1;
            n++;
        }
    let schlieren = 0,
        rechts = 0,
        links = 0;
    for (let x = 0; x < W; x++) {
        let lauf = 0;
        for (let y = 0; y <= H; y++) {
            const an = y < H && lit[x + y * W];
            if (an) lauf++;
            else {
                if (lauf >= 4) schlieren++;
                lauf = 0;
            }
        }
    }
    for (let y = 0; y + 1 < H; y++)
        for (let x = 1; x + 1 < W; x++) {
            const p = x + y * W;
            if (!lit[p] || lit[p + W]) continue;
            if (lit[p + W + 1]) rechts++;
            if (lit[p + W - 1]) links++;
        }
    return {
        litAnteil: wasserRund(5)(n / (W * H)),
        schlieren,
        neigung: rechts + links > 0 ? wasserRund(3)((rechts - links) / (rechts + links)) : 0,
    };
}

// ── Q6: die Decke (D11) ──
// Das Zell-Gesetz hält Höhlen unter und neben Seen trocken (caveDry, `_skyOpenWaterFilter`): je geladener Wasser-Spalte
// die erste LUFT-Zelle über einer FEST-Zelle, deren Mitte unter dem Spiegel des Gesetzes liegt (`_atlasWaterLevelAt` mit
// tiefem Boden — See, Fluss, Rand-Spiegel) und über der eine FEST-Zelle steht (die Decke). Ihr Boden (`_fieldSurfaceBelow`)
// ist der Grund eines Körpers in der Höhle: die EINE Wasser-Wahrheit am Körper darf dort kein Wasser lesen (Chokepoint), der
// Spieler schwimmt dort nicht (`_stepFixedSim`), die Kamera taucht nicht (`_applyDayNightToScene`), das Tier schwimmt nicht
// (`updateCreatures`, sein Grund der Höhlen-Boden — wie ihn `_koerperBodenUnter` liefert).
async function wasserHoehle(o = {}) {
    const A = r.constructor;
    const cfg = r._voxelChunkConfig(0);
    const { dim, dimY, step, span, floorDrop } = cfg;
    const oy = (st.terrainBaseHeight || 0) - floorDrop;
    const S = A.CELL_STATE;
    const dq = dim * dim;
    const R = wasserRund(2);
    const hoehlen = [];
    for (const [key, e] of st.voxelChunks || []) {
        if (!e || !e.waterCells) continue;
        const c = e.waterCells;
        const [cx, cz] = key.split(",").map(Number);
        for (let k = 0; k < dim; k++)
            for (let i = 0; i < dim; i++) {
                const b = i + k * dim;
                const x = cx * span + (i + 0.5) * step,
                    z = cz * span + (k + 0.5) * step;
                const L = r._atlasWaterLevelAt(x, z, -1e9);
                if (!(L > -Infinity)) continue;
                for (let j = 1; j < dimY; j++) {
                    const cy = oy + (j + 0.5) * step;
                    if (cy > L) break;
                    if (c[b + j * dq] !== S.AIR || c[b + (j - 1) * dq] !== S.SOLID) continue;
                    let decke = false,
                        wasserDrueber = false;
                    for (let jj = j + 1; jj < dimY && oy + jj * step < L; jj++) {
                        if (c[b + jj * dq] === S.SOLID) decke = true;
                        else if (decke && c[b + jj * dq] === S.WATER) wasserDrueber = true;
                    }
                    if (!decke) continue;
                    const boden = r._fieldSurfaceBelow(x, cy, z, 3);
                    if (Number.isFinite(boden) && boden < L - 0.2)
                        hoehlen.push({ x, z, boden, L, unter: wasserDrueber, luft: c[b + (j + 1) * dq] === S.AIR });
                    break;
                }
            }
    }
    let nass = 0,
        nassUnter = 0,
        nassNeben = 0,
        unter = 0,
        maxM = 0;
    const beispiele = [];
    for (const h of hoehlen) {
        if (h.unter) unter++;
        const w = r._koerperWasser(h.x, h.z, h.boden);
        if (w > h.boden + 0.1) {
            nass++;
            if (h.unter) nassUnter++;
            else nassNeben++;
            if (w - h.boden > maxM) maxM = w - h.boden;
            if (beispiele.length < 4) beispiele.push([R(h.x, 1), R(h.z, 1), R(h.boden), R(w)]);
        }
    }
    // DER WAGEN (wasser-wahrheit): die Tiefe am Wagen (`_fahrTiefe`, der Wasser-Term des Fahr-Schritts) an jedem
    // Höhlen-Boden — ein Wagen, der dort steht, steht trocken.
    let wagenNass = 0,
        wagenMax = 0;
    for (const h of hoehlen) {
        const t = r._fahrTiefe({ x: h.x, z: h.z, y: h.boden });
        if (t > 0.05) {
            wagenNass++;
            if (t > wagenMax) wagenMax = t;
        }
    }
    // Die Pfade der Leser an Höhlen mit Kopf-Raum (zwei Luft-Zellen über dem Boden): Spieler, Kamera, Tier.
    const raum = hoehlen.filter((h) => h.luft);
    const wahl = [];
    for (let q = 0; q < raum.length && wahl.length < (o.n || 6); q += Math.max(1, Math.floor(raum.length / 6)))
        wahl.push(raum[q]);
    const FUSS = A.PLAYER_FOOT_OFFSET;
    const leib = window.__wasserLeib();
    let schwimmFrames = 0,
        kameraUnter = 0,
        tierSchwimmt = 0,
        tierProben = 0;
    try {
        for (const h of wahl) {
            leib.setze(h.x, h.boden + FUSS + 0.02, h.z);
            for (let s = 0; s < 20; s++) {
                leib.takt();
                if (st.playerUnderwater) schwimmFrames++;
            }
            if (st.camera) {
                st.camera.position.set(h.x, h.boden + 1.6, h.z);
                st.camera.updateMatrixWorld(true);
                r._applyDayNightToScene();
                if (st.kameraUnterWasser) kameraUnter++;
            }
            const c = wasserTier(r, h.x, h.boden, h.z, "wolf");
            if (c) {
                tierProben++;
                let schwimmt = false;
                for (let s = 0; s < 6; s++) {
                    c.position.x = h.x;
                    c.position.z = h.z;
                    c.userData.cachedGroundY = h.boden;
                    c.userData.cachedGroundX = h.x;
                    c.userData.cachedGroundZ = h.z;
                    r.updateCreatures(0.05);
                    if (c.userData._motionZustand === "schwimmen") schwimmt = true;
                }
                if (schwimmt) tierSchwimmt++;
                r.removeCreature(c);
            }
        }
    } finally {
        leib.zurueck();
    }
    return {
        proben: hoehlen.length,
        unter,
        neben: hoehlen.length - unter,
        nass,
        nassUnter,
        nassNeben,
        maxM: R(maxM),
        beispiele,
        spieler: { proben: wahl.length, schritte: wahl.length * 20, schwimmFrames },
        kamera: { proben: st.camera ? wahl.length : 0, unterWasser: kameraUnter },
        tier: { proben: tierProben, schwimmt: tierSchwimmt },
        wagen: { proben: hoehlen.length, nass: wagenNass, maxM: R(wagenMax) },
    };
}

// ── Q6: jeder Körper liegt nach seiner Gestalt im Wasser — auch der Wagen (D10, W-W2, F-D5, W-L4) ──
// Das Gefährt im See der Mess-Wiese, gefahren über den Ritt im Sim-Schritt (`_rittSchritt`, dann der Frame-Tick
// `_tickMountedMovement` — nur Sicht; der Reiter hält x/z): (a) der
// Straßenwagen (fahrzeug_gt, die Hülle aus dem Fahrzeug-Kern) in der See-Mitte darf nicht treiben; (b) das Holz-Boot
// (Teile-Werk) treibt dort mit dem Tiefgang seiner Gestalt; (c) im Rand-Streifen des Sees (1–7 m Wasser über Atlas-Land)
// treibt das Boot; (d) treibend
// nickt das Boot nicht mit dem Seegrund (F-D5 „25° Bug-ab": das Nick-Ziel las die Ebene des Grunds).
async function wasserWagen(o = {}) {
    const ziel = o.see || (await window.__wasserOrte({})).see.mitte;
    const h = r._hydroFor(ziel[0], ziel[1]);
    if (!h || !h.ready) return { fehler: "keine Hydrosphäre" };
    let see = null,
        best = Infinity;
    for (const l of h.lakes || []) {
        if (!(l.level > (st.waterLevel || 0) + 2) || !l.cells || l.cells.length <= 8) continue;
        const d = Math.hypot((l.bbox.minX + l.bbox.maxX) / 2 - ziel[0], (l.bbox.minZ + l.bbox.maxZ) / 2 - ziel[1]);
        if (d < best) {
            best = d;
            see = l;
        }
    }
    if (!see) return { fehler: "kein See" };
    const S = see.level;
    const R = wasserRund(3);
    await window.__weltDa(() => st.blueprints && st.blueprints.fahrzeug_gt);
    if (!(st.blueprints && st.blueprints.fahrzeug_gt)) return { fehler: "kein Studio-Wagen im Buch (fahrzeug_gt)" };
    const BOOT = wasserBoot(st);
    const [pm, leib] = [st.playerMesh.position, window.__wasserLeib()];
    const fahre = (typ, x, z, takte) => {
        const boden = r._voxelSurfaceY(x, z);
        pm.set(x, Math.max(S, boden) + 1, z);
        const e = r.spawnArchitecture(typ, { x, y: boden, z }, { silent: true, precise: true });
        if (!e) return { fehler: "kein Eintrag " + typ };
        // Das Probe-Boot ist ein Teile-Werk ohne Antriebs-Tag: fahrbar gesetzt (die Probe misst das Wasser, nicht die
        // Fahrzeug-Signatur der Affordanz).
        if (typ === BOOT) e.affordances = Object.assign({}, e.affordances, { moveable: true });
        const m = r.mountArchitecture(e);
        if (!(m && m.ok) || st.player.mountedArch !== e.id) {
            r.removeArchitecture(e);
            return { fehler: "nicht geritten " + typ };
        }
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        for (let k = 0; k < (takte || 40); k++) {
            pm.x = x;
            pm.z = z;
            // der Ritt im Sim-Schritt (Lage, Wasser, Sitz), danach der Frame-Tick (nur Sicht)
            r._rittSchritt(0.05);
            r._tickMountedMovement(0.05);
        }
        const grund = r.getTerrainHeightAt(x, z);
        // die Unterkante des Rumpfs: Studio-Fahrzeug die Ebene y = 0 (die Basis), Teile-Werk Basis − Boden-Klärung
        const unten =
            e.position.y - 0.5 - (e._fahrAchseX ? 0 : Number.isFinite(e._groundClear) ? e._groundClear : 0);
        const aus = {
            afloat: e._afloat === true,
            tiefe: R(S - boden, 2),
            unterkanteUeberGrund: R(unten - grund),
            unterkanteUnterSpiegel: R(S - unten),
            nickZielGrad: R(((Number.isFinite(e._terrainPitchZiel) ? e._terrainPitchZiel : 0) * 180) / Math.PI, 2),
            wankZielGrad: R(((Number.isFinite(e._terrainRollZiel) ? e._terrainRollZiel : 0) * 180) / Math.PI, 2),
        };
        r.dismountArchitecture();
        r.removeArchitecture(e);
        return aus;
    };
    const aus = { see: { spiegel: R(S, 2) } };
    try {
        const mitte = o.mitte || ziel;
        aus.wagen = fahre("fahrzeug_gt", mitte[0], mitte[1]);
        aus.boot = fahre(BOOT, mitte[0], mitte[1]);
        // (c) der Rand-Streifen: Atlas-Land neben dem See, der Boden ≥ 1 m unter dem Spiegel — auf den Strahlen von der
        //     Mitte des Sees (16 Richtungen, je 3 m) die ersten Atlas-Land-Spalten jenseits der See-Zellen
        const rand = [];
        for (let w = 0; w < 16 && rand.length < 12; w++) {
            const ca = Math.cos((w * Math.PI) / 8),
                sa = Math.sin((w * Math.PI) / 8);
            let land = false;
            for (let d = 3; d <= 600 && rand.length < 12; d += 3) {
                const x = mitte[0] + ca * d,
                    z = mitte[1] + sa * d;
                const hr = r._hydroFor(x, z);
                if (!hr || !hr.water) break;
                const ci = Math.floor((x - hr.originX) / hr.cell),
                    cj = Math.floor((z - hr.originZ) / hr.cell);
                if (hr.water.waterKind[ci + cj * hr.dim] !== 0) continue; // noch See
                land = true;
                const boden = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(boden) || S - boden < 1) break; // der Streifen endet am Ufer
                rand.push([R(x, 1), R(z, 1), S - boden]);
            }
            if (!land) continue;
        }
        let treibt = 0;
        const randAus = [];
        for (const [x, z, tiefe] of rand) {
            const f = fahre(BOOT, x, z, 20);
            if (f.afloat) treibt++;
            randAus.push([x, z, R(tiefe, 2), f.afloat]);
        }
        aus.rand = { proben: rand.length, treibt, punkte: randAus };
        // (d) Bug-ab: der Punkt des Wegs vom Ostufer (`o.ufer`, aus der Welt) zur Mitte mit dem steilsten Seegrund und
        //     ≥ 2,5 m Wasser.
        let steil = null,
            gMax = 0;
        const ostufer = o.ufer || (await window.__wasserOrte({})).see.ufer;
        for (let x = ostufer[0]; x >= mitte[0]; x -= 1) {
            const z = ostufer[1];
            const b0 = r._voxelSurfaceY(x, z),
                b1 = r._voxelSurfaceY(x - 2, z);
            if (!Number.isFinite(b0) || !Number.isFinite(b1) || S - b0 < 2.5) continue;
            const g = Math.abs(b1 - b0) / 2;
            if (g > gMax) {
                gMax = g;
                steil = [x - 1, z];
            }
        }
        if (steil) {
            const f = fahre(BOOT, steil[0], steil[1]);
            aus.bugAb = Object.assign({ ort: steil, grundGrad: R((Math.atan(gMax) * 180) / Math.PI, 1) }, f);
        }
    } finally {
        delete st.blueprints[BOOT];
        leib.zurueck();
    }
    return aus;
}

// ── DAS GEZEICHNETE WASSER (die Linse misst das BILD, nicht die Funktion) ──
// Was die Welt als Wasser ZEICHNET: die Dreiecke des Wasser-Sheets je Chunk (`state.voxelChunkWaterIso`, dieselbe Geometrie,
// die der Renderer bekommt) über dem sichtbaren Boden (die oberste Fläche des fertigen Chunk-Meshes, `entry.mesh`; Lehre 22:
// sichtbar ist das Mesh, nie das Gesetz). Die Chunks baut die Probe dort, wo sie misst (`sichere`). `at(x, z)`: { boden,
// wasser, sichtbar } (sichtbar = das Sheet liegt dort mehr als 2 cm über dem gezeichneten Boden) oder null (kein Chunk).
function wasserSichtNetz() {
    const cfg = r._voxelChunkConfig(0);
    const span = cfg.span;
    const B = 0.9; // Kante der Dreiecks-Fächer (m)
    const netze = new Map();
    const boeden = new Map();
    const faecherVon = (m) => {
        let n = null;
        if (m && m.geometry && m.geometry.attributes && m.geometry.attributes.position) {
            const pos = m.geometry.attributes.position.array;
            const ix = m.geometry.index ? m.geometry.index.array : null;
            const triN = ix ? ix.length / 3 : pos.length / 9;
            const faecher = new Map();
            for (let t = 0; t < triN; t++) {
                const a = ix ? ix[3 * t] : 3 * t,
                    b = ix ? ix[3 * t + 1] : 3 * t + 1,
                    c = ix ? ix[3 * t + 2] : 3 * t + 2;
                const x0 = Math.min(pos[3 * a], pos[3 * b], pos[3 * c]),
                    x1 = Math.max(pos[3 * a], pos[3 * b], pos[3 * c]);
                const z0 = Math.min(pos[3 * a + 2], pos[3 * b + 2], pos[3 * c + 2]),
                    z1 = Math.max(pos[3 * a + 2], pos[3 * b + 2], pos[3 * c + 2]);
                for (let fz = Math.floor(z0 / B); fz <= Math.floor(z1 / B); fz++)
                    for (let fx = Math.floor(x0 / B); fx <= Math.floor(x1 / B); fx++) {
                        const k = fx + "," + fz;
                        let l = faecher.get(k);
                        if (!l) faecher.set(k, (l = []));
                        l.push(a, b, c);
                    }
            }
            n = { pos, faecher };
        }
        return n;
    };
    const netz = (key) => {
        if (!netze.has(key)) netze.set(key, faecherVon(st.voxelChunkWaterIso && st.voxelChunkWaterIso.get(key)));
        return netze.get(key);
    };
    const bodenNetz = (key) => {
        if (!boeden.has(key)) {
            const e = st.voxelChunks && st.voxelChunks.get(key);
            boeden.set(key, faecherVon(e && e.mesh));
        }
        return boeden.get(key);
    };
    // die oberste Fläche eines Netzes an (x, z): das höchste Dreieck darüber (baryzentrisch in xz) oder null
    const hoehe = (n, x, z) => {
        if (!n) return null;
        const l = n.faecher.get(Math.floor(x / B) + "," + Math.floor(z / B));
        if (!l) return null;
        const p = n.pos;
        let best = null;
        for (let i = 0; i < l.length; i += 3) {
            const a = 3 * l[i],
                b = 3 * l[i + 1],
                c = 3 * l[i + 2];
            const d = (p[b + 2] - p[c + 2]) * (p[a] - p[c]) + (p[c] - p[b]) * (p[a + 2] - p[c + 2]);
            if (Math.abs(d) < 1e-12) continue;
            const u = ((p[b + 2] - p[c + 2]) * (x - p[c]) + (p[c] - p[b]) * (z - p[c + 2])) / d;
            const v = ((p[c + 2] - p[a + 2]) * (x - p[c]) + (p[a] - p[c]) * (z - p[c + 2])) / d;
            const w = 1 - u - v;
            if (u < -1e-6 || v < -1e-6 || w < -1e-6) continue;
            const y = u * p[a + 1] + v * p[b + 1] + w * p[c + 1];
            if (best === null || y > best) best = y;
        }
        return best;
    };
    // BEREIT ist ein Chunk, dessen Sheet gebaut wurde, nachdem sein Ring (die acht Nachbarn, deren Zellen es liest) als LOD-0-
    // Chunks stand — synchron, Worker ausgehängt, erst wenn eine Probe ihn braucht. Ein Nachbar, den die Probe dafür (neu)
    // baut, zeichnet sein Wasser im selben Zug (die Welt heilt ihn im nächsten Takt): Körper und Bild lesen dieselbe Welt.
    const bereit = new Set();
    const sichere = (cx, cz) => {
        const key = cx + "," + cz;
        if (bereit.has(key)) return;
        const w = st.voxelWorker;
        st.voxelWorker = null;
        r._syncStelle = "naht";
        const ring = [];
        try {
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const e = st.voxelChunks && st.voxelChunks.get(cx + dx + "," + (cz + dz));
                    if (!e) r._ensureVoxelChunkAt(cx + dx, cz + dz, 0);
                    else if (!e.empty && (e.lod || 0) !== 0)
                        r._rebuildVoxelChunk(cx + dx, cz + dz, 0, { forceSync: true });
                    ring.push([cx + dx, cz + dz]);
                }
            r._buildVoxelChunkWaterIsoSurface(cx, cz);
            for (const [nx, nz] of ring) {
                const nk = nx + "," + nz;
                const ne = st.voxelChunks && st.voxelChunks.get(nk);
                if (ne && ne.waterCells && !(st.voxelChunkWaterIso && st.voxelChunkWaterIso.has(nk)))
                    r._buildVoxelChunkWaterIsoSurface(nx, nz);
            }
        } finally {
            st.voxelWorker = w;
            r._syncStelle = null;
        }
        for (const [nx, nz] of ring) {
            netze.delete(nx + "," + nz);
            boeden.delete(nx + "," + nz);
        }
        bereit.add(key);
    };
    // ein Netz endet nicht genau an seiner Chunk-Kante (Surface-Nets-Vertices in den Zellen; die Wasser-Vertices sind bis
    // 0,54 m versetzt): die oberste Fläche über die Netze des Chunks und der Nachbarn, deren Kante näher als 0,6 m liegt
    const oben = (von, x, z) => {
        const cx = Math.floor(x / span),
            cz = Math.floor(z / span);
        let best = null;
        for (let dz = -1; dz <= 1; dz++)
            for (let dx = -1; dx <= 1; dx++) {
                if (dx && Math.abs(x - (cx + (dx > 0 ? 1 : 0)) * span) > 0.6) continue;
                if (dz && Math.abs(z - (cz + (dz > 0 ? 1 : 0)) * span) > 0.6) continue;
                if (von === netz) sichere(cx + dx, cz + dz);
                const y = hoehe(von(cx + dx + "," + (cz + dz)), x, z);
                if (y !== null && (best === null || y > best)) best = y;
            }
        return best;
    };
    const sheetY = (x, z) => oben(netz, x, z);
    const at = (x, z) => {
        const cx = Math.floor(x / span),
            cz = Math.floor(z / span);
        sichere(cx, cz);
        const e = st.voxelChunks && st.voxelChunks.get(cx + "," + cz);
        if (!e || e.empty || (e.lod || 0) !== 0) return null;
        const wasser = sheetY(x, z);
        const boden = oben(bodenNetz, x, z);
        return { boden, wasser, sichtbar: wasser !== null && boden !== null && wasser > boden + 0.02 };
    };
    // DAS URTEIL JE PUNKT: je Punkt über
    // dem höheren der beiden Böden (Gesetz `y` und gezeichnetes Mesh `s.boden`, G): PHANTOM, wo die Welt Wasser 5 cm über G
    // zeichnet und der Körper an seinem Grund keine 2 cm liest; UNSICHTBAR, wo der Körper Wasser 5 cm über G liest und die
    // Welt keine 2 cm zeichnet. Keine Nachbar-Toleranz, keine Querschnitts-Existenz: Breite gegen Breite, Fläche gegen Fläche.
    // `s` ist `at(px, pz)`, gelesen VOR dem Körper: `at` baut die Chunks und Sheets, wo die Probe misst — Körper und Bild lesen
    // dieselbe Welt.
    const punkt = (s, y, kw) => {
        if (!s || s.boden === null) return null;
        const G = Number.isFinite(y) ? Math.max(y, s.boden) : s.boden;
        const kNass = Number.isFinite(y) && kw > y + 0.02;
        const k5 = Number.isFinite(y) && kw > G + 0.05;
        const b5 = s.wasser !== null && s.wasser > G + 0.05;
        const b2 = s.wasser !== null && s.wasser > G + 0.02;
        return { s, G, k5, b2, phantom: b5 && !kNass, unsichtbar: k5 && !b2 };
    };
    // Ein Querschnitt (je 0,25 m von −halb bis +halb um (x, z), quer zur Richtung (nx, nz)): der KÖRPER (die EINE Wahrheit
    // `_koerperWasser` über dem Boden des Gesetzes, nass ab 5 cm — Breite und Tiefe: die zusammenhängende nasse Strecke, die
    // der Mitte am nächsten liegt, und ihr Maximum) und der VERGLEICH mit dem BILD je Punkt (`punkt`): die Breiten des
    // Körper-Wassers (`koerperM`), des gezeichneten (`bildM`), der Phantome (`phantomM`) und des Unsichtbaren
    // (`unsichtbarM`). Liegt das gezeichnete Mesh über dem Wasser des Körpers, ist es VERDECKT (`verdeckt`, Lehre 22: das
    // 1,8-m-Mesh trägt die Feinform des Gesetzes nicht — die Boden-Domäne, gezählt, nicht geurteilt).
    // der Körper liest die EINE Wahrheit (`_koerperWasser`)
    const koerper = (x, z, y) => r._koerperWasser(x, z, y);
    // `eigen(px, pz)` (optional): liegt der Punkt im Kanal DIESES Flusses (bis zu seiner Krone)? Dann ist das Körper-Wasser dort
    // das Wasser des Flusses selbst (`kQ`); ohne `eigen` das Wasser, dessen Spiegel der des Flusses an diesem Ort ist.
    const quer = (x, z, nx, nz, halb, eigen) => {
        const n = Math.round(halb / 0.25);
        const k = [],
            kQ = [],
            bS = [];
        let unbekannt = 0,
            verdeckt = 0,
            koerperN = 0,
            bildN = 0,
            phantomN = 0,
            unsichtbarN = 0;
        for (let i = -n; i <= n; i++) {
            const px = x + nx * i * 0.25,
                pz = z + nz * i * 0.25;
            const s = at(px, pz);
            const y = r._voxelSurfaceY(px, pz);
            const kw = Number.isFinite(y) ? koerper(px, pz, y) : -Infinity;
            const kn = Number.isFinite(y) && kw > y + 0.05;
            k.push(kn ? kw - y : 0);
            // das Wasser des FLUSSES selbst (ein See, ein anderer Fluss daneben zählt nicht zum Lauf)
            let eigenes = false;
            if (kn && eigen) eigenes = eigen(px, pz);
            else if (kn) {
                const rv = r._hydroRiverAt(px, pz);
                eigenes = !!rv && Math.abs(rv.surfaceY - kw) < 0.02;
            }
            kQ.push(eigenes ? kw - y : 0);
            const p = punkt(s, y, kw);
            if (!p) {
                unbekannt++;
                bS.push(0);
                continue;
            }
            if (kn && !p.k5) verdeckt++;
            if (p.k5) koerperN++;
            if (p.b2) bildN++;
            if (p.phantom) phantomN++;
            if (p.unsichtbar) unsichtbarN++;
            // gezeichnet heißt sichtbar (2 cm über beiden Böden, wie `at`)
            bS.push(p.b2 ? p.s.wasser - p.G : 0);
        }
        const spanne = (A) => {
            let best = -1;
            for (let i = 0; i < A.length; i++)
                if (A[i] > 0 && (best < 0 || Math.abs(i - n) < Math.abs(best - n))) best = i;
            if (best < 0) return { breite: 0, tiefe: 0 };
            let lo = best,
                hi = best,
                tiefe = A[best];
            while (lo > 0 && A[lo - 1] > 0) tiefe = Math.max(tiefe, A[--lo]);
            while (hi < A.length - 1 && A[hi + 1] > 0) tiefe = Math.max(tiefe, A[++hi]);
            return { breite: (hi - lo + 1) * 0.25, tiefe };
        };
        const K = spanne(k),
            Q = spanne(kQ),
            Bi = spanne(bS);
        return {
            breiteK: K.breite,
            tiefeK: K.tiefe,
            breiteQ: Q.breite,
            tiefeQ: Q.tiefe,
            tiefeMitte: kQ[n],
            breiteB: Bi.breite,
            tiefeB: Bi.tiefe,
            koerperM: koerperN * 0.25,
            bildM: bildN * 0.25,
            phantomM: phantomN * 0.25,
            unsichtbarM: unsichtbarN * 0.25,
            unbekannt,
            verdeckt,
        };
    };
    // Ein Fenster je Punkt (Schritt d): die Flächen des Körper-Wassers, des gezeichneten, der Phantome und des Unsichtbaren
    // (m²) und je die ersten Beispiele [x, z, Wasser über G].
    const fenster = (x0, z0, x1, z1, d) => {
        let punkte = 0,
            koerperN = 0,
            bildN = 0,
            phantomN = 0,
            unsichtbarN = 0;
        const bspP = [],
            bspU = [];
        const R2 = wasserRund(2);
        for (let z = z0; z <= z1; z += d)
            for (let x = x0; x <= x1; x += d) {
                const s = at(x, z);
                const y = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(y)) continue;
                const kw = koerper(x, z, y);
                const p = punkt(s, y, kw);
                if (!p) continue;
                punkte++;
                if (p.k5) koerperN++;
                if (p.b2) bildN++;
                if (p.phantom) {
                    phantomN++;
                    if (bspP.length < 4) bspP.push([x, z, R2(p.s.wasser - p.G)]);
                }
                if (p.unsichtbar) {
                    unsichtbarN++;
                    if (bspU.length < 4) bspU.push([x, z, R2(kw - p.G)]);
                }
            }
        const f = d * d;
        return {
            punkte,
            koerperM2: koerperN * f,
            bildM2: bildN * f,
            phantomM2: phantomN * f,
            unsichtbarM2: unsichtbarN * f,
            bspP,
            bspU,
        };
    };
    return { at, quer, fenster, span };
}

// ── Q7-Gestalt: die Quelle (W-F5) ──
// JEDE Quelle in den Kacheln der Probe (`o.kacheln` = `QUELL_KACHELN`: der Mess-Ring mit der Kachel des Bachs der Mess-Wiese,
// der See, die Küste), ohne Filter. Je Quelle die Querschnitte (±15 m quer zum Lauf, je 2 m) vom Ursprung längs ihres EIGENEN Laufs
// (bis vor das Segment, das in einen See oder einen anderen Fluss mündet, höchstens 48 m): der KÖRPER (`_koerperWasser`,
// Breite und Tiefe über dem Boden des Gesetzes) und das BILD (das gezeichnete Sheet, `__wasserSichtNetz`).
// GESPEIST ist eine Quelle, die das Gesetz breiter als das Rinnsal beginnt (ein Abfluss) UND an deren Ursprung wirklich See-
// Wasser steht (Körper-Wasser, das der See- oder Meeres-Spiegel des Gesetzes trägt, bis 10 m um den Ursprung): ihr Wasser
// kommt nicht aus dem Nichts. GESPEIST ist auch eine Quelle IM KANAL eines breiteren Flusses (ihr Wasser ist seins) — sie darf
// seinen Spiegel nie heben (BUCKEL).
// Jede andere ist eine QUELLE im Sinn des Gesetzes, und das Wasser des FLUSSES (das Körper-Wasser im Kanal ihres EIGENEN
// Laufs bis zur Krone; ein See, ein anderer Fluss daneben zählt nie) darf auf ihrem ersten Segment nicht breiter sein als die
// HÜLLE des Gesetzes und am Ursprung nicht
// tiefer (dahinter trägt der Fluss die Breiten seiner Punkte, Biegungen weiten den Querschnitt): das Rinnsal (quellBett)
// plus quellWeitung je Meter Lauf, das Wasser bis zur Krone (Bett-Tiefe je Breite höchstens die des kleinsten vollen Flusses
// dieser Welt, `stats.bettMin`; Neigung bankNeigung); Mess-Körnung zwei Proben
// (0,5 m) in der Breite, 5 cm in der Tiefe (in der Mitte des Laufs). Ein SPRUNG ist ein Querschnitt über der Hülle (am
// Ursprung: die Quelle bricht aus dem Nichts). Eine Quelle ohne Körper-Wasser auf ihren ersten 16 m ist TROCKEN (nie grün).
// Unsichtbar/Phantom je PUNKT (`quer`: Breite des Bilds gegen Breite des Körpers), summiert über alle Quell-Läufe.
async function wasserQuelle(o = {}) {
    if (!st.hydrosphere || !st.hydrosphere.ready) return { fehler: "keine Hydrosphäre" };
    const HC = r.constructor.HYDROSPHERE;
    const R = wasserRund(2);
    // die Hülle des Gesetzes (fehlt eine Größe im Stand, gilt die des Gesetzes von heute)
    const F = Number.isFinite(HC.spiegelFreibord) ? HC.spiegelFreibord : 0.25;
    const sN = Number.isFinite(HC.bankNeigung) ? HC.bankNeigung : 0.7;
    const qBett = Number.isFinite(HC.quellBett) ? HC.quellBett : 1.2;
    const G = Number.isFinite(HC.quellWeitung) ? HC.quellWeitung : 0.25;
    const huelleVon = (h) => {
        const bett = h.stats && h.stats.bettMin > 0 ? h.stats.bettMin : globalThis.__gelaendeCore.FLUSS_BREITE.min;
        const dRel = HC.carveBedMin / bett + HC.carveBedK;
        const huelle = (s) => {
            const w = qBett + G * Math.max(0, s);
            return { breite: w * (1 + (2 * dRel) / sN) + 0.5, tiefe: (1 - F) * dRel * w + 0.05 };
        };
        huelle.rinnsal = qBett;
        return huelle;
    };
    // DIE KACHELN (K61, `QUELL_KACHELN`): die Probe misst genau die Kacheln, die sie trägt, und stellt jede selbst her (an
    // ihrer Mitte) — nie, was der Ring des Augenblicks geladen hat; steht eine nicht, bricht sie beim Namen
    if (!Array.isArray(o.kacheln) || !o.kacheln.length) return { fehler: "die Quell-Probe trägt keine Kacheln" };
    const size = HC.regionSize;
    const regionen = [];
    for (const key of o.kacheln) {
        const [rx, rz] = String(key).split(",").map(Number);
        await window.__weltDa(() => !r._ensureHydroTilesAround(rx * size, rz * size, size / 2 + 256)); // samt den Rändern der Nachbarn
        const h = rx === 0 && rz === 0 ? st.hydrosphere : st.hydroTiles && st.hydroTiles.get(rx + "," + rz);
        if (!h || !h.ready || !Array.isArray(h.rivers))
            return { fehler: `die Kachel ${key} der Quell-Probe steht nicht` };
        if (regionen.indexOf(h) < 0) regionen.push(h);
    }
    // der Bach der Mess-Wiese (aus der Welt, `__wasserOrte`) liegt in einer Kachel der Probe
    const bachOrt = o.bach || (await window.__wasserOrte({})).bach;
    const bachKachel = bachOrt && globalThis.__gelaendeCore.kachelSchluessel(r._gelaende(), bachOrt.x, bachOrt.z);
    if (bachKachel && o.kacheln.indexOf(bachKachel) < 0)
        return {
            fehler: `der Bach der Mess-Wiese liegt in der Kachel ${bachKachel}, nicht in den Kacheln der Quell-Probe`,
        };
    const sicht = window.__wasserSichtNetz();
    const koerperNass = (x, z) => {
        const y = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(y)) return false;
        const w = r._koerperWasser(x, z, y);
        return w > y + 0.05;
    };
    let quellen = 0,
        gespeist = 0,
        spruenge = 0,
        trocken = 0,
        unsichtbar = 0,
        phantom = 0,
        unsichtbarBreite = 0,
        phantomBreite = 0,
        querschnitte = 0,
        verdeckt = 0,
        imKanal = 0,
        zulauf = 0,
        buckel = 0,
        buckelMax = 0;
    const breiten0 = [],
        tiefen0 = [],
        beispiele = [],
        alle = [];
    for (const h of regionen) {
        const huelle = huelleVon(h);
        // wie viele Flüsse tragen einen Punkt (ein geteilter Unterlauf beendet den eigenen Lauf einer Quelle)
        const traeger = new Map();
        for (const rv of h.rivers) {
            const gesehen = new Set();
            for (const p of rv.points) {
                const k = p.x + "," + p.z;
                if (gesehen.has(k)) continue;
                gesehen.add(k);
                traeger.set(k, (traeger.get(k) || 0) + 1);
            }
        }
        const ursprung = new Set();
        for (const rv of h.rivers) {
            const P = rv.points;
            if (!P || P.length < 2) continue;
            const k0 = P[0].x + "," + P[0].z;
            if (ursprung.has(k0)) continue;
            ursprung.add(k0);
            // DER TEIL: `teil {k, n}` misst nur die Quellen, deren Ursprung in Teil k fällt — der Schlüssel ist der Ort
            // des Ursprungs (nie die Reihenfolge der Kacheln), jede Quelle fällt in genau einen Teil
            if (o.teil && window.__wasserQuellTeil(P[0], o.teil.n) !== o.teil.k) continue;
            const fl = Math.hypot(P[1].x - P[0].x, P[1].z - P[0].z) || 1;
            const fx = (P[1].x - P[0].x) / fl,
                fz = (P[1].z - P[0].z) / fl;
            // der Kanal DIESER Quelle: bis zur Krone ihrer eigenen Segmente (der gezeichnete Spiegel liegt auf dem
            // 1,8-m-Gitter, ein Spiegel-Vergleich auf 2 cm trennte nicht mehr; ein Nachbar-Fluss zählte als eigenes Wasser)
            const eigenSeg = [];
            const kanalVon = (segs) => (px, pz) => {
                for (const [a, b, krA, krB] of segs) {
                    const ex = b.x - a.x,
                        ez = b.z - a.z,
                        l2 = ex * ex + ez * ez || 1;
                    const t = Math.max(0, Math.min(1, ((px - a.x) * ex + (pz - a.z) * ez) / l2));
                    if (Math.hypot(px - (a.x + ex * t), pz - (a.z + ez * t)) <= krA + (krB - krA) * t) return true;
                }
                return false;
            };
            const eigen = kanalVon(eigenSeg);
            // das erste Segment allein (der SPRUNG misst die Quelle, K16): an einer Biegung läuft der Querschnitt längs des
            // nächsten Segments, und dessen Wasser zählte als Breite der Quelle (2104/6616: 18,75 m bei s = 12 m)
            const eigen0 = (px, pz) => kanalVon(eigenSeg.slice(0, 1))(px, pz);
            for (let i = 0; i + 1 < P.length; i++) {
                if (P[i + 1].inLake || (traeger.get(P[i + 1].x + "," + P[i + 1].z) || 0) > 1) break;
                // die Krone des Gesetzes, längs des Segments zwischen seinen Punkten (wie `_hydroRiverAt`)
                eigenSeg.push([P[i], P[i + 1], window.__wasserKroneVon(r, P[i]), window.__wasserKroneVon(r, P[i + 1])]);
                if (eigenSeg.length > 32) break;
            }
            if (!eigenSeg.length)
                eigenSeg.push([P[0], P[1], window.__wasserKroneVon(r, P[0]), window.__wasserKroneVon(r, P[1])]);
            const lauf = [];
            let s = 0;
            for (let i = 0; i + 1 < P.length && s <= 48; i++) {
                // der eigene Lauf endet vor dem Segment, das in einen See oder einen anderen Fluss mündet
                const b = P[i + 1];
                if (b.inLake || (traeger.get(b.x + "," + b.z) || 0) > 1) break;
                const a = P[i];
                const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
                const nx = -(b.z - a.z) / L,
                    nz = (b.x - a.x) / L;
                for (let t = 0; t < L && s <= 48; t += 2, s += 2) {
                    const x = a.x + ((b.x - a.x) * t) / L,
                        z = a.z + ((b.z - a.z) * t) / L;
                    lauf.push(Object.assign(sicht.quer(x, z, nx, nz, 15, eigen), { s, seg: i, x, z, nx, nz }));
                }
            }
            if (!lauf.length)
                lauf.push(
                    Object.assign(sicht.quer(P[0].x, P[0].z, -fz, fx, 15, eigen), {
                        s: 0,
                        seg: 0,
                        x: P[0].x,
                        z: P[0].z,
                        nx: -fz,
                        nz: fx,
                    })
                );
            quellen++;
            const q0 = lauf[0];
            breiten0.push(q0.breiteQ);
            tiefen0.push(q0.tiefeMitte);
            // GESPEIST: das Gesetz beginnt die Quelle breiter als das Rinnsal (ein Abfluss) — und am Ursprung steht wirklich
            // See-Wasser (Körper-Wasser, das nicht der Fluss trägt, bis 10 m um den Ursprung). Behauptet das Gesetz einen
            // Abfluss ohne See, ist es ein Sprung.
            const abfluss = P[0].width > huelle.rinnsal * 1.001;
            let seeNah = false;
            for (let d = 0.5; d <= 10 && !seeNah; d += 0.5)
                for (let a = 0; a < 8 && !seeNah; a++) {
                    const x = P[0].x + Math.cos((a * Math.PI) / 4) * d,
                        z = P[0].z + Math.sin((a * Math.PI) / 4) * d;
                    if (!koerperNass(x, z)) continue;
                    // See-Wasser: Körper-Wasser, das der See- oder Meeres-Spiegel des Gesetzes trägt (nicht der Fluss)
                    const uf = { see: -Infinity, fluss: null, ufer: 0 };
                    r._waterLevelAt(x, z, uf);
                    seeNah = uf.see > r._voxelSurfaceY(x, z) + 0.05;
                }
            // IM KANAL: der Ursprung liegt im Kanal eines BREITEREN Flusses (bis zu dessen Krone, nie auf dem eigenen
            // Lauf) — sein Wasser ist das Wasser des breiteren (gespeist). Es darf dessen Spiegel nie heben: BUCKEL ist das
            // Körper-Wasser am Ursprung über dem höchsten Spiegel der deckenden Segmente. Gedeckt heißt wie in
            // `_hydroRiverAt`: der Abstand zum SEGMENT bis zu seiner Krone, Breite und Spiegel längs des Segments.
            let kanalS = -Infinity;
            for (const rw of h.rivers)
                for (let i = 0; i + 1 < rw.points.length; i++) {
                    const a = rw.points[i],
                        b = rw.points[i + 1];
                    if (a.inLake || b.inLake || !Number.isFinite(a.S) || !Number.isFinite(b.S)) continue;
                    // nie der eigene Lauf (K16: jedes Glied des Netzes gehört EINEM Lauf; ein Zufluss, der am Kopf der Quelle
                    // endet, teilt ihren ersten Punkt und speist sie)
                    if (rw === rv) continue;
                    const ex = b.x - a.x,
                        ez = b.z - a.z,
                        l2 = ex * ex + ez * ez || 1;
                    const t = Math.max(0, Math.min(1, ((P[0].x - a.x) * ex + (P[0].z - a.z) * ez) / l2));
                    if (!(a.width + (b.width - a.width) * t > P[0].width)) continue;
                    const kr =
                        window.__wasserKroneVon(r, a) +
                        (window.__wasserKroneVon(r, b) - window.__wasserKroneVon(r, a)) * t;
                    if (Math.hypot(P[0].x - (a.x + ex * t), P[0].z - (a.z + ez * t)) > kr) continue;
                    const sp = a.S + (b.S - a.S) * t;
                    if (sp > kanalS) kanalS = sp;
                }
            const imKanalJa = kanalS > -Infinity;
            if (imKanalJa) {
                imKanal++;
                const y0 = r._voxelSurfaceY(P[0].x, P[0].z);
                const hub = r._koerperWasser(P[0].x, P[0].z, y0) - kanalS;
                if (hub > 0.05) {
                    buckel++;
                    if (hub > buckelMax) buckelMax = hub;
                    if (beispiele.length < (o.beispiele || 6))
                        beispiele.push(["buckel", R(P[0].x, 0), R(P[0].z, 0), R(hub)]);
                }
            }
            // ZULAUF: das Netz des Gelände-Gesetzes ist eins für die ganze Welt, die Kachel schneidet es — ein Lauf, der
            // am Rand seiner Kachel beginnt (bis eine Zelle innen), trägt das Wasser seines Oberlaufs jenseits des Rands.
            const randAbstand = Math.min(
                P[0].x - h.originX,
                P[0].z - h.originZ,
                h.originX + h.dim * h.cell - P[0].x,
                h.originZ + h.dim * h.cell - P[0].z
            );
            const zulaufJa = randAbstand <= h.cell * 1.01;
            if (zulaufJa) zulauf++;
            const gespeistJa = (abfluss && seeNah) || imKanalJa || zulaufJa;
            if (gespeistJa) gespeist++;
            let ueber = null;
            if (!gespeistJa)
                for (const q of lauf) {
                    if (q.seg > 0) break; // die Quelle ist ihr erstes Segment; dahinter trägt der Fluss seine Punkt-Breiten
                    const hl = huelle(q.s);
                    const q1 = eigenSeg.length > 1 ? sicht.quer(q.x, q.z, q.nx, q.nz, 15, eigen0) : q;
                    if (q1.breiteQ > hl.breite || (q.s === 0 && q1.tiefeMitte > hl.tiefe)) {
                        ueber = Object.assign({}, q, { breiteQ: q1.breiteQ, tiefeMitte: q1.tiefeMitte });
                        break;
                    }
                }
            if (ueber) spruenge++;
            let unsicht = 0,
                phant = 0,
                nassFrueh = false;
            for (let i = 0; i < lauf.length; i++) {
                const q = lauf[i];
                querschnitte++;
                if (q.unsichtbarM > 0) unsicht++;
                if (q.phantomM > 0) phant++;
                unsichtbarBreite += q.unsichtbarM;
                phantomBreite += q.phantomM;
                verdeckt += q.verdeckt;
                if (q.s <= 16 && q.breiteK > 0) nassFrueh = true;
            }
            unsichtbar += unsicht;
            phantom += phant;
            if (!nassFrueh) trocken++;
            // je Quelle: x, z, gespeist, Körper-Breite und -Tiefe am Ursprung, Bild-Breite am Ursprung, Sprung (s, Breite,
            // Tiefe gegen die Hülle), unsichtbare und Phantom-Querschnitte, Querschnitte
            const zeile = [
                R(P[0].x, 0),
                R(P[0].z, 0),
                gespeistJa ? 1 : 0,
                R(q0.breiteQ),
                R(q0.tiefeMitte),
                R(q0.breiteB),
                ueber
                    ? [
                          ueber.s,
                          R(ueber.breiteQ),
                          R(ueber.tiefeMitte),
                          R(huelle(ueber.s).breite),
                          R(huelle(ueber.s).tiefe),
                      ]
                    : 0,
                unsicht,
                phant,
                lauf.length,
            ];
            alle.push(zeile);
            if ((ueber || !nassFrueh || unsicht > 0 || phant > 0) && beispiele.length < (o.beispiele || 6))
                beispiele.push(zeile);
        }
    }
    const p50 = (A) => (A.length ? A.slice().sort((x, y) => x - y)[A.length >> 1] : 0);
    const h0 = huelleVon(st.hydrosphere)(0);
    return {
        quellen,
        gespeist,
        imKanal,
        zulauf,
        buckel,
        buckelMax: R(buckelMax),
        regionen: regionen.length,
        huelle0: [R(h0.breite), R(h0.tiefe)],
        spruenge,
        trocken,
        querschnitte,
        unsichtbar,
        phantom,
        unsichtbarBreite,
        phantomBreite,
        verdeckt,
        breiteP50: R(p50(breiten0)),
        breiteMax: R(breiten0.length ? Math.max(...breiten0) : 0),
        tiefeP50: R(p50(tiefen0)),
        tiefeMax: R(tiefen0.length ? Math.max(...tiefen0) : 0),
        beispiele,
        alle: o.alle ? alle : undefined,
        // die Teile fügt `quellTeileVereinen` zusammen: die Rohwerte je Quelle, der Teil und die gemessenen Kacheln
        // (aus dem Ursprung jeder Region, das Urteil verlangt `QUELL_KACHELN`)
        breiten0: o.teil ? breiten0 : undefined,
        tiefen0: o.teil ? tiefen0 : undefined,
        teil: o.teil || undefined,
        kacheln: regionen.map((h) => (h.originX + size / 2) / size + "," + (h.originZ + size / 2) / size),
    };
}

// DIE KACHELN DER QUELL-PROBE (K61, zweite Prüfung): die Probe legt ihre Regionen FEST — Schlüssel „rx,rz" der Hydro-
// Kacheln (`kachelSchluessel`, 2048 m; „0,0" die Heimat). Die zwölf: der Mess-Ring (Mess-Wiese ±1024 m), die Kachel des
// Sees, die Küste mit der Kachel der Küsten-Suche. Eine Kachel verschwindet nie (sie ist ein Fenster des Gesetzes über dem Seed).
const QUELL_KACHELN = ["0,0", "-1,-1", "-1,0", "0,-1", "1,-3", "1,4", "1,5", "2,4", "2,5", "0,5", "0,6", "1,6"];

// Der Teil einer Quelle: aus dem Ort ihres Ursprungs, je Teil-Zahl n fest — der Seiten-Kontext ruft ihn, Node prüft ihn.
function wasserQuellTeil(p, n) {
    const h = (Math.imul(Math.round(p.x * 4), 73856093) ^ Math.imul(Math.round(p.z * 4), 19349663)) >>> 0;
    return h % n;
}

// DIE TEILE ZUSAMMEN: die Quell-Probe in n Seiten nebeneinander (je Seite ein Teil, `teil {k, n}`) urteilt über
// dieselben Quellen wie EIN Lauf — die Zähler summiert, Breite und Tiefe am Ursprung aus den Rohwerten, die Kacheln in jedem
// Teil dieselben (sonst Abbruch beim Namen: ein Teil sähe andere Quellen), jeder Teil k = 0..n−1 genau einmal (sonst fielen
// die Quellen eines Teils still aus der Summe).
function quellTeileVereinen(teile) {
    for (const t of teile) if (t.fehler) return { fehler: t.fehler };
    const n = teile[0].teil ? teile[0].teil.n : teile.length;
    const ist = teile.map((t) => (t.teil ? t.teil.k + "/" + t.teil.n : "ohne Teil")).sort();
    const soll = Array.from({ length: n }, (_, k) => k + "/" + n).sort();
    if (ist.join(" ") !== soll.join(" "))
        return {
            fehler: `die Teile der Quell-Probe decken nicht alle Quellen (${ist.join(" ")} statt ${soll.join(" ")})`,
        };
    const abdruck = (t) => (Array.isArray(t.kacheln) ? t.kacheln.join(" ") : "keine");
    const fremd = teile.find((t) => abdruck(t) !== abdruck(teile[0]));
    if (fremd)
        return {
            fehler: `die Teile der Quell-Probe sehen verschiedene Kacheln (${abdruck(teile[0])} gegen ${abdruck(fremd)})`,
        };
    const R = wasserRund(2);
    const p50 = (A) => (A.length ? A.slice().sort((x, y) => x - y)[A.length >> 1] : 0);
    const summe = (k) => teile.reduce((s, t) => s + (t[k] || 0), 0);
    const breiten0 = [].concat(...teile.map((t) => t.breiten0 || []));
    const tiefen0 = [].concat(...teile.map((t) => t.tiefen0 || []));
    const v = { teile: teile.length };
    for (const k of [
        "quellen",
        "gespeist",
        "imKanal",
        "zulauf",
        "buckel",
        "spruenge",
        "trocken",
        "querschnitte",
        "unsichtbar",
        "phantom",
        "unsichtbarBreite",
        "phantomBreite",
        "verdeckt",
    ])
        v[k] = summe(k);
    v.buckelMax = R(Math.max(0, ...teile.map((t) => t.buckelMax || 0)));
    v.regionen = teile[0].regionen;
    v.kacheln = teile[0].kacheln;
    v.huelle0 = teile[0].huelle0;
    v.breiteP50 = R(p50(breiten0));
    v.breiteMax = R(breiten0.length ? Math.max(...breiten0) : 0);
    v.tiefeP50 = R(p50(tiefen0));
    v.tiefeMax = R(tiefen0.length ? Math.max(...tiefen0) : 0);
    v.beispiele = [].concat(...teile.map((t) => t.beispiele || [])).slice(0, 6);
    if (teile.every((t) => Array.isArray(t.alle))) v.alle = [].concat(...teile.map((t) => t.alle));
    return v;
}

// ── Q7-Bild: der Bach der Mess-Wiese ──
// Der Fluss der Kachel durch −856/−1160 von seiner Quelle an, die ersten zehn Segmente, je 2 m ein Querschnitt ±5 m (wie die
// Gegenprüfung), je PUNKT (0,25 m) der KÖRPER (`_koerperWasser` über dem Boden des Gesetzes) gegen das BILD (das Sheet über
// dem gezeichneten Boden, `__wasserSichtNetz`): die Breiten-Summen des Körper-Wassers, des gezeichneten, des Unsichtbaren
// (der Körper liest Wasser, das niemand sieht) und der Phantome (gezeichnetes Wasser, in dem der Körper trocken steht). Dazu
// die Pflanzen am Lauf (`__wasserFlora`, ±6 m um die Mittellinie).
// die Länge der Bach-Probe (m auf der Bahn ab der Quelle; F8 urteilt ab 80 Querschnitten zu 2 m) — die Seite erhält sie mit
// `WASSER_INSTALL`
const BACH_PROBE_M = 200;
async function wasserBach(o = {}) {
    const R = wasserRund(2);
    const bachOrt = Number.isFinite(o.x) && Number.isFinite(o.z) ? null : (await window.__wasserOrte({})).bach;
    const ZX = bachOrt ? bachOrt.x : o.x,
        ZZ = bachOrt ? bachOrt.z : o.z;
    await window.__weltDa(() => !r._ensureHydroTilesAround(ZX, ZZ, BACH_PROBE_M + 256));
    const h = r._hydroFor(ZX, ZZ);
    if (!h || !h.ready || !Array.isArray(h.rivers)) return { fehler: "keine Hydrosphäre am Bach" };
    let rv = null,
        bd = Infinity;
    for (const f of h.rivers)
        for (const p of f.points) {
            const d = Math.hypot(p.x - ZX, p.z - ZZ);
            if (d < bd) {
                bd = d;
                rv = f;
            }
        }
    if (!rv || bd > 40) return { fehler: `kein Fluss an ${ZX}/${ZZ} (nächster Punkt ${R(bd)} m)` };
    const P = rv.points;
    const sicht = window.__wasserSichtNetz();
    // DIE ERSTEN `BACH_PROBE_M` METER des Bachs, nie eine Zahl seiner Punkte: die Abtastung der Bahn ist Sache des Gesetzes
    let segmente = 0;
    for (let lang = 0; segmente < P.length - 1 && lang < BACH_PROBE_M; segmente++)
        lang += Math.hypot(P[segmente + 1].x - P[segmente].x, P[segmente + 1].z - P[segmente].z);
    const aus = {
        quelle: [R(P[0].x, 0), R(P[0].z, 0)],
        segmente,
        querschnitte: 0,
        koerperNass: 0,
        gezeichnet: 0,
        breiteKoerper: 0,
        breiteBild: 0,
        phantomBreite: 0,
        unsichtbarBreite: 0,
        mitPhantom: 0,
        mitUnsichtbar: 0,
        verdeckt: 0,
        beispiele: [],
    };
    for (let q = 0; q < segmente; q++) {
        const a = P[q],
            b = P[q + 1];
        const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        const nx = -(b.z - a.z) / L,
            nz = (b.x - a.x) / L;
        for (let t = 0; t < L; t += 2) {
            const x = a.x + ((b.x - a.x) * t) / L,
                z = a.z + ((b.z - a.z) * t) / L;
            const s = sicht.quer(x, z, nx, nz, 5);
            aus.querschnitte++;
            aus.verdeckt += s.verdeckt;
            if (s.koerperM > 0) aus.koerperNass++;
            if (s.bildM > 0) aus.gezeichnet++;
            aus.breiteKoerper += s.koerperM;
            aus.breiteBild += s.bildM;
            aus.phantomBreite += s.phantomM;
            aus.unsichtbarBreite += s.unsichtbarM;
            if (s.phantomM > 0) aus.mitPhantom++;
            if (s.unsichtbarM > 0) aus.mitUnsichtbar++;
            if ((s.phantomM > 0 || s.unsichtbarM > 0) && aus.beispiele.length < (o.beispiele || 6))
                aus.beispiele.push([R(x, 1), R(z, 1), s.koerperM, s.bildM, s.phantomM, s.unsichtbarM]);
        }
    }
    aus.flora = window.__wasserFlora({ sicht, lauf: P.slice(0, segmente + 1), radius: 6 });
    return aus;
}

// ── Q7-Bild: das Fenster am See der Mess-Wiese ──
// ±40 m um −890/−650 je 0,5 m (wie die Gegenprüfung): Körper gegen Bild je Punkt (`__wasserSichtNetz().fenster`) und die
// Pflanzen im Fenster (`__wasserFlora`).
async function wasserSee(o = {}) {
    const f = o.fenster || (await window.__wasserOrte({})).see.fenster;
    await window.__weltDa((r) => !r._ensureHydroTilesAround((f[0] + f[2]) / 2, (f[1] + f[3]) / 2, 256));
    const sicht = window.__wasserSichtNetz();
    const aus = sicht.fenster(f[0], f[1], f[2], f[3], o.d || 0.5);
    aus.fenster = f;
    aus.flora = window.__wasserFlora({ sicht, fenster: f });
    return aus;
}

// ── Q7-Bild: die Pflanzen im gezeichneten Wasser ──
// Je Kachel im Gebiet (ein Fenster [x0, z0, x1, z1] oder der Korridor ±radius um einen Lauf) die Pflanzen, wie die Welt sie
// setzt: die Nah-Streu (`_nahStreuKachel`, jede Art ohne Ufer-Band) und die Nah-Wiese (`_nahWieseKachelBueschel`, das Gras).
// DIE PFLANZEN DER NÄHE (EIN Gang): jede Kachel der Nah-Streu und der Nah-Wiese über den Kästen [x0, z0, x1, z1] (ihre Chunks baut
// `sicht.at`, synchron — die Probe misst hier), je Pflanze `je(art, it, A)` (art "streu" | "wiese", A die Art der Streu);
// zurück je art die gebauten und die wartenden Kacheln
function wasserPflanzen(sicht, kaesten, je) {
    const [r, n] = [window.anazhRealm, {}];
    const arten = r._nahStreuArten();
    for (const [K, art] of [[r.constructor.NAH_STREU.kachel, "streu"], [r.constructor.NAH_WIESE.kachel, "wiese"]]) {
        const kacheln = new Set();
        for (const [x0, z0, x1, z1] of kaesten)
            for (let tz = Math.floor(z0 / K); tz <= Math.floor(z1 / K); tz++)
                for (let tx = Math.floor(x0 / K); tx <= Math.floor(x1 / K); tx++) kacheln.add(tx + "," + tz);
        n[art] = { kacheln: 0, warten: 0 };
        for (const [tx, tz] of [...kacheln].map((k) => k.split(",").map(Number))) {
            sicht.at((tx + 0.5) * K, (tz + 0.5) * K);
            const satz = art === "streu" ? r._nahStreuKachel(tx, tz, arten) : r._nahWieseKachelBueschel(tx, tz);
            n[art][satz ? "kacheln" : "warten"]++;
            for (const it of satz ? satz.items || satz : []) je(art, it, arten[it.art]);
        }
    }
    return n;
}

// Im Wasser steht eine Pflanze, über deren Fuß (der gerenderte Boden, auf dem sie steht) die Welt mehr als 5 cm Wasser
// zeichnet — über dem gezeichneten Boden an ihrem Ort, sichtbar (ein Sheet unter dem Gelände trägt keine Pflanze). Arten mit Ufer-Band (Schilf) stehen dort nach ihrem Gesetz — gezählt, nicht geurteilt.
function wasserFlora(o = {}) {
    const sicht = o.sicht || window.__wasserSichtNetz();
    const arten = r._nahStreuArten();
    if (!arten) return { fehler: "die Nah-Streu hat keine Arten (das Buch fehlt)" };
    const R2 = wasserRund(2);
    let x0, z0, x1, z1, imGebiet;
    if (o.fenster) {
        [x0, z0, x1, z1] = o.fenster;
        imGebiet = (x, z) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
    } else {
        const P = o.lauf || [];
        const rad = o.radius || 6;
        x0 = Math.min(...P.map((p) => p.x)) - rad;
        x1 = Math.max(...P.map((p) => p.x)) + rad;
        z0 = Math.min(...P.map((p) => p.z)) - rad;
        z1 = Math.max(...P.map((p) => p.z)) + rad;
        imGebiet = (x, z) => {
            for (let q = 0; q + 1 < P.length; q++) {
                const a = P[q],
                    b = P[q + 1];
                const ex = b.x - a.x,
                    ez = b.z - a.z,
                    l2 = ex * ex + ez * ez || 1;
                const t = Math.max(0, Math.min(1, ((x - a.x) * ex + (z - a.z) * ez) / l2));
                if (Math.hypot(x - (a.x + ex * t), z - (a.z + ez * t)) <= rad) return true;
            }
            return false;
        };
    }
    const imWasser = (x, y, z) => {
        const s = sicht.at(x, z);
        if (!s || s.wasser === null) return 0;
        const G = s.boden !== null ? Math.max(y, s.boden) : y;
        return s.wasser > G + 0.05 ? s.wasser - y : 0;
    };
    const streu = { pflanzen: 0, ufer: 0, imWasser: 0, maxM: 0, jeArt: {}, bsp: [] };
    const wiese = { bueschel: 0, imWasser: 0, maxM: 0, bsp: [] };
    const kacheln = wasserPflanzen(sicht, [[x0, z0, x1, z1]], (art, it, A) => {
        if (!imGebiet(it.x, it.z)) return;
        const [b, w] = [art === "streu" ? streu : wiese, imWasser(it.x, it.y, it.z)];
        b[art === "streu" ? "pflanzen" : "bueschel"]++;
        if (!w || (art === "streu" && A.zeile && A.zeile.ufer && ++streu.ufer)) return;
        b.imWasser++;
        b.maxM = Math.max(b.maxM, R2(w));
        if (art === "streu") streu.jeArt[A.id] = (streu.jeArt[A.id] || 0) + 1;
        if (b.bsp.length < 4) b.bsp.push([...(art === "streu" ? [A.id] : []), R2(it.x), R2(it.z), R2(w)]);
    });
    return { streu: Object.assign(kacheln.streu, streu), wiese: Object.assign(kacheln.wiese, wiese) };
}

// ── Q7-Gestalt: die Bank ──
// Je Fluss-Punkt binnen `r` m (Vorgabe 240) um den Fluss der Mess-Wiese (`ort`, Vorgabe `__wasserOrte` fluss; die Kacheln
// dort rechnet die Probe selbst) ein Profil-Schnitt quer zum Lauf — die Stichprobe ist das GESETZ an diesem Ort (K55-5: bis
// dahin zählten nur Punkte in schon gestreamten LOD-0-Chunks; die Zahl hing am Streaming-Stand, CI 12–22, lokal 4): der
// Boden des Gesetzes (`_voxelSurfaceY`, 0,1-m-Schritte) von der Wasserlinie (der erste Boden über dem Spiegel) 6 m weit —
// die BANK, die der Kanal schneidet — und ihre steilste Neigung über 0,5 m je Seite. Gegen das Geologie-Gesetz des Bodens
// (`TERRAIN_GEOLOGY`, wie `_terrainGeologyAlbedo`): ab rockLo (1 − n.y = 0,42, ≈ 54,5°) trägt der Hang Fels; Geröll-Kandidat
// ist ein Profil ab `schuttKandidat` (≈ 23°) — Schutt trägt nur der Schutthang des Schicht-Gesetzes (je Vertex `aSchutt`, K17). Dazu das BILD (Lehre 22: sichtbar ist das 1,8-m-Mesh): die Vertices der Chunk-Meshes über dem Spiegel
// des nächsten Fluss-Punkts, bis 6 m darüber und bis halbe Breite + 8 m von seiner Mitte — ihr Fels- und Geröll-Gewicht aus
// der Geometrie-Normale.
async function wasserBank(o = {}) {
    const h = st.hydrosphere;
    if (!h || !h.ready || !Array.isArray(h.rivers)) return { fehler: "keine Hydrosphäre" };
    const G = r.constructor.TERRAIN_GEOLOGY;
    const R = wasserRund(2);
    const grad = (steile) => (Math.acos(1 - steile) * 180) / Math.PI;
    const felsGrad = grad(G.rockLo),
        geroellGrad = grad(G.schuttKandidat);
    const ort = o.ort || (({ fluss }) => fluss && [fluss.x, fluss.z])(await window.__wasserOrte({}));
    if (!ort) return { fehler: "kein Fluss an der Mess-Wiese" };
    const rad = o.r || 240;
    await window.__weltDa(() => !r._ensureHydroTilesAround(ort[0], ort[1], rad + 64));
    const punkte = [];
    // Heimat-Region und Kacheln (der Fluss der Mess-Wiese liegt jenseits ±1024 m)
    const regionen = [h].concat(st.hydroTiles ? [...st.hydroTiles.values()].filter((t) => t && t.ready) : []);
    for (const rv of regionen.flatMap((g) => g.rivers || [])) {
        const P = rv.points;
        for (let k = 0; k + 1 < P.length; k++) {
            const a = P[k],
                b = P[k + 1];
            if (a.inLake || b.inLake || Math.hypot(a.x - ort[0], a.z - ort[1]) > rad) continue;
            punkte.push([a, b]);
        }
    }
    const spiegelVon = (a) => (Number.isFinite(a.S) ? a.S : r._atlasWaterLevelAt(a.x, a.z, -Infinity));
    const winkel = [];
    let fels = 0,
        geroell = 0;
    const beispiele = [];
    const jede = Math.max(1, Math.floor(punkte.length / (o.n || 80)));
    for (let q = 0; q < punkte.length; q += jede) {
        const [a, b] = punkte[q];
        const fl = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        const nx = -(b.z - a.z) / fl,
            nz = (b.x - a.x) / fl;
        const sp = spiegelVon(a);
        if (!Number.isFinite(sp)) continue;
        for (const sg of [-1, 1]) {
            const ys = [];
            for (let d = 0; d <= 40; d += 0.1) {
                const y = r._voxelSurfaceY(a.x + nx * d * sg, a.z + nz * d * sg);
                ys.push(Number.isFinite(y) ? y : NaN);
            }
            const i0 = ys.findIndex((y) => y > sp);
            if (i0 < 0) continue;
            let maxG = 0;
            for (let i = i0; i + 5 < ys.length && i < i0 + 60; i++) {
                const g = Math.abs(ys[i + 5] - ys[i]) / 0.5;
                if (Number.isFinite(g) && g > maxG) maxG = g;
            }
            const w = (Math.atan(maxG) * 180) / Math.PI;
            winkel.push(w);
            if (w > felsGrad) {
                fels++;
                if (beispiele.length < 4) beispiele.push([R(a.x, 1), R(a.z, 1), sg, R(w, 1)]);
            } else if (w > geroellGrad) geroell++;
        }
    }
    // Das Bild: Mesh-Vertices der Nah-Chunks an der Bank.
    let vertices = 0,
        felsV = 0,
        geroellV = 0,
        gewicht = 0;
    const ss = (e0, e1, v) => {
        const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
    };
    const ZELLE = 8;
    const raster = new Map();
    for (const [a, b] of punkte) {
        const sp = spiegelVon(a);
        const hw = Math.max(1, a.width * 0.5);
        const L = Math.hypot(b.x - a.x, b.z - a.z);
        for (let t = 0; t <= L; t += 0.5) {
            const x = a.x + ((b.x - a.x) * t) / (L || 1),
                z = a.z + ((b.z - a.z) * t) / (L || 1);
            const k = Math.floor(x / ZELLE) + "," + Math.floor(z / ZELLE);
            if (!raster.has(k)) raster.set(k, []);
            raster.get(k).push([x, z, sp, hw]);
        }
    }
    const naechster = (x, z) => {
        const ci = Math.floor(x / ZELLE),
            cj = Math.floor(z / ZELLE);
        let best = null,
            bd = Infinity;
        for (let dj = -2; dj <= 2; dj++)
            for (let di = -2; di <= 2; di++) {
                const L = raster.get(ci + di + "," + (cj + dj));
                if (!L) continue;
                for (const p of L) {
                    const d = Math.hypot(p[0] - x, p[1] - z);
                    if (d < bd) {
                        bd = d;
                        best = p;
                    }
                }
            }
        return best ? { d: bd, sp: best[2], hw: best[3] } : null;
    };
    const T = window.THREE;
    const v = new T.Vector3(),
        n = new T.Vector3();
    const nm = new T.Matrix3();
    for (const [, e] of st.voxelChunks || []) {
        if (!e || !e.mesh || e.lod !== 0 || !e.mesh.geometry) continue;
        const g = e.mesh.geometry;
        const pos = g.attributes.position,
            nor = g.attributes.normal;
        if (!pos || !nor) continue;
        e.mesh.updateMatrixWorld(true);
        nm.getNormalMatrix(e.mesh.matrixWorld);
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(e.mesh.matrixWorld);
            const nb = naechster(v.x, v.z);
            if (!nb || nb.d > nb.hw + 8 || !(v.y > nb.sp) || v.y > nb.sp + 6) continue;
            n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
            const steile = Math.max(0, Math.min(1, 1 - n.y));
            const rw = ss(G.rockLo, G.rockHi, steile);
            const sch = e.mesh.geometry.attributes.aSchutt;
            const sw = sch ? sch.getX(i) : 0;
            vertices++;
            gewicht += rw + sw;
            if (steile > G.rockLo) felsV++;
            else if (sw > 0.5) geroellV++;
        }
    }
    const s = winkel.slice().sort((x, y) => x - y);
    const q = (p) => (s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0);
    return {
        ort,
        r: rad,
        segmente: punkte.length,
        profile: s.length,
        felsGrad: R(felsGrad, 1),
        winkelP50: R(q(0.5), 1),
        winkelP90: R(q(0.9), 1),
        winkelMax: R(s.length ? s[s.length - 1] : 0, 1),
        fels,
        geroell,
        felsAnteil: R(s.length ? fels / s.length : 0, 3),
        beispiele,
        bild: {
            vertices,
            felsAnteil: R(vertices ? felsV / vertices : 0, 4),
            geroellAnteil: R(vertices ? geroellV / vertices : 0, 4),
            gewichtMittel: R(vertices ? gewicht / vertices : 0, 4),
        },
    };
}

// ── Q6: die Leser der EINEN Wasser-Wahrheit ──
// Je Spalte jedes geladenen Chunks (LOD 0) an zwei Orten — dem See der Mess-Wiese und der Küste des Meeres (−88/−880:
// dort taucht die 3D-Rauheit das Gelände unter den Meeresspiegel, die Zellen fluten es als Küsten-Aquifer) — gegen die
// EINE Wahrheit am Körper (`_koerperWasser` über dem Boden `_voxelSurfaceY`):
//   KLANG     die Spalten-Probe (`_nassAt`) an echtem Wasser: ihr billiger Beweis (Obergrenze, Fels darüber) irrt nie.
//   KÜSTE     das Sheet: wo die Zellen Wasser über dem Boden zeichnen (oberste WATER-Zelle über der obersten FEST-Zelle,
//             ihr Spiegel über dem Boden) und der Atlas Land sagt, trägt der Körper es — er las dort nichts.
// Ob Ufer-Scheu und Trink-Ziel der Wahrheit folgen, prüft die Mutation (K12 M) am Verhalten.
async function wasserLeser(o = {}) {
    if (!st.hydrosphere || !st.hydrosphere.ready) return { fehler: "keine Hydrosphäre" };
    const { dim, dimY, step, span, floorDrop } = r._voxelChunkConfig(0);
    const oy = (st.terrainBaseHeight || 0) - floorDrop;
    const dq = dim * dim;
    const tisch = typeof st.waterLevel === "number" ? st.waterLevel : 0;
    const aus = {
        orte: [],
        spalten: 0,
        nass: 0,
        klang: 0,
        kueste: { sichtbar: 0, trocken: 0 },
    };
    const bsp = { klang: [], kueste: [] };
    const R1 = wasserRund(1);
    for (const [px, pz] of o.orte || (({ see, kueste }) => [see.ufer, kueste])(await window.__wasserOrte({}))) {
        await window.__wasserStrom([px, pz], 3);
        aus.orte.push([px, pz, st.voxelChunks.size]);
        const pcx = Math.floor(px / span),
            pcz = Math.floor(pz / span);
        for (const [key, e] of st.voxelChunks) {
            if (!e || !e.waterCells || e.lod !== 0) continue;
            const [cx, cz] = key.split(",").map(Number);
            if (Math.abs(cx - pcx) > 3 || Math.abs(cz - pcz) > 3) continue;
            const cells = e.waterCells;
            for (let k = 0; k < dim; k++)
                for (let i = 0; i < dim; i++) {
                    const x = cx * span + (i + 0.5) * step,
                        z = cz * span + (k + 0.5) * step;
                    const boden = r._voxelSurfaceY(x, z);
                    if (!Number.isFinite(boden)) continue;
                    aus.spalten++;
                    const w = r._koerperWasser(x, z, boden);
                    const nass = boden < w - 0.05;
                    if (nass) aus.nass++;
                    if (r._nassAt(x, z) !== nass) {
                        aus.klang++;
                        if (bsp.klang.length < 4) bsp.klang.push([R1(x), R1(z), R1(boden), R1(w)]);
                    }
                    const sc = r._caColumnScan(cells, null, i + k * dim, dq, dimY);
                    if (!(sc.floodTopJ >= 0 && sc.floodTopJ > sc.solidTopJ)) continue;
                    if (r._atlasWaterLevelAt(x, z, boden) > -Infinity) continue;
                    if (!(Math.min(tisch, oy + (sc.floodTopJ + 1) * step) > boden + 0.05)) continue;
                    aus.kueste.sichtbar++;
                    if (!nass) {
                        aus.kueste.trocken++;
                        if (bsp.kueste.length < 4) bsp.kueste.push([R1(x), R1(z), R1(boden), R1(tisch)]);
                    }
                }
        }
    }
    aus.beispiele = bsp;
    return aus;
}

// DER LEIB DER PROBE (EIN Gestell): der Spiel-Takt ruht, `setze` stellt den Leib ruhend an (x, y, z), `takt` geht mit den Tasten
// einen festen Sim-Schritt (`_stepFixedSim`), `zurueck` stellt Ort, Tasten, Blick, Takt und Kamera wieder her.
function wasserLeib() {
    const [r, A] = [window.anazhRealm, window.anazhRealm.constructor];
    const [st, pm] = [r.state, r.state.playerMesh];
    const alt = [pm.position.clone(), st.keys, r._loopFixedStep, st.camera && st.camera.position.clone(), st.yaw];
    [r._loopFixedStep, st.keys] = [() => 0, {}];
    let t = Number.isFinite(st._fixedSimTime) ? st._fixedSimTime : 0;
    const leib = {
        setze(x, y, z) {
            pm.position.set(x, y, z);
            if (st._fixedSimPos) st._fixedSimPos.copy(pm.position);
            [st._fixedPrevPos, st._fieldVy, st.isInAir, st._fieldWasGrounded] = [null, 0, false, false];
            st.playerVel.setValue(0, 0, 0);
            return pm;
        },
        takt: (keys) => ((st.keys = Object.assign({}, keys)), r._stepFixedSim(t, A.FIXED_DT), (st._fixedSimTime = t += A.FIXED_DT)),
        zurueck() {
            [r._loopFixedStep, st.keys, st.yaw] = [alt[2], alt[1] || {}, alt[4]];
            leib.setze(alt[0].x, alt[0].y, alt[0].z);
            if (alt[3]) (st.camera.position.copy(alt[3]), st.camera.updateMatrixWorld(true), r._applyDayNightToScene());
        },
    };
    return leib;
}

// ── K12 M: DIE MUTATION DER EINEN WAHRHEIT (Meisterkarte Gelände K4, Staffel 1) ──
// An `n` (50) Zufalls-Punkten trockenen Lands um `ort` trägt der Kern der Wahrheit am Körper (`_koerperWasserSpiegel`) je eine
// Scheibe von RHO m mit einem Spiegel TIEF m über dem Boden. Jeder Leser (LESER, die Liste steht nur hier; das Trink-Ziel
// sucht 6 m daneben) liest vorher trocken und im Takt danach nass; die Nah-Wiese und die Nah-Streu ohne Ufer-Band (je Kachel
// neu gebaut) tragen in den Scheiben vorher Pflanzen, danach keine. Wer nicht folgt, liest eine eigene Fläche — die Kontrolle
// (das Gesetz allein) nie, sonst ist die Probe blind.
async function wasserMutation(o = {}) {
    const A = r.constructor;
    const [RHO, TIEF] = [3, 3];
    const ort = o.ort || (await window.__wasserOrte({})).see.ufer;
    await window.__wasserStrom(ort, 3);
    const sicht = window.__wasserSichtNetz();
    const baum = Object.keys(A.FOREST.crown)[0];
    const [zufall, R] = [window.__phytoCore.mulberry32(0x2545f491), wasserRund(1)]; // der Vorlagen-RNG (phyto-core)
    const drin = (x, z) => punkte.some((p) => (x - p.x) ** 2 + (z - p.z) ** 2 <= RHO * RHO);
    // im Wasser einer Scheibe steht, was in ihr unter ihrem Spiegel wurzelt (am Hang ragt ihr Rand über ihn)
    const unter = (it) => punkte.some((p) => (it.x - p.x) ** 2 + (it.z - p.z) ** 2 <= RHO * RHO && it.y < p.b + TIEF);
    const punkte = [];
    let versuche = 0;
    for (; versuche < 3000 && punkte.length < (o.n || 50); versuche++) {
        const x = ort[0] + (zufall() * 2 - 1) * 60;
        const z = ort[1] + (zufall() * 2 - 1) * 60;
        if (punkte.some((p) => Math.hypot(p.x - x, p.z - z) < 2 * RHO + 4)) continue;
        sicht.at(x, z);
        const b = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(b) || r._koerperWasser(x, z, b) > b - 1) continue;
        if (r._naturWand(baum, { x, y: b, z }, null) || r._findNearestWaterPoint(x + 6, z, 8)) continue;
        punkte.push({ x, z, b });
    }
    const flora = () => {
        const n = { wiese: 0, streu: 0 };
        const k = wasserPflanzen(sicht, punkte.map((p) => [p.x - RHO, p.z - RHO, p.x + RHO, p.z + RHO]), (art, it, A) => {
            if ((art === "wiese" || !A.zeile.ufer) && unter(it)) n[art]++;
        });
        n.warten = k.streu.warten + k.wiese.warten;
        return n;
    };
    const LESER = {
        leib: "der Sim-Schritt (`_stepFixedSim` → playerUnderwater)",
        kamera: "das Medium der Kamera (`_applyDayNightToScene`)",
        tier: "der Kreatur-Takt (`updateCreatures` → schwimmen)",
        wagen: "die Tiefe am Wagen (`_fahrTiefe`)",
        scheu: "die Ufer-Scheu (`_creatureWaterContextAt`)",
        trinken: "das Trink-Ziel (`_findNearestWaterPoint`)",
        klang: "die Nässe des Klangs (`_nassAt`)",
        schritt: "das Material des Schritts (`_schrittMaterialAt`)",
        wand: "die Natur-Wand (`_naturWand` → `_stammFussLand`)",
        land: "das Land der Streu und der Werke (`_landAt`)",
        kontrolle: "das Gesetz allein (`_atlasWaterLevelAt`, die Kontrolle)",
    };
    const leib = window.__wasserLeib();
    const c = punkte.length ? wasserTier(r, punkte[0].x, punkte[0].b, punkte[0].z, "wolf") : null;
    const takt = Math.max(1, A.KREATUR_RUHE.takt);
    const urteil = (p) => {
        const u = {};
        leib.setze(p.x, p.b + A.PLAYER_FOOT_OFFSET + 0.02, p.z);
        leib.takt();
        u.leib = !!st.playerUnderwater;
        if (st.camera) {
            st.camera.position.set(p.x, p.b + 1, p.z);
            st.camera.updateMatrixWorld(true);
            r._applyDayNightToScene();
            u.kamera = !!st.kameraUnterWasser;
        }
        if (c) {
            u.tier = false;
            for (let f = 0; f < takt && !u.tier; f++) {
                c.position.set(p.x, p.b, p.z);
                Object.assign(c.userData, { cachedGroundY: p.b, cachedGroundX: p.x, cachedGroundZ: p.z });
                r.updateCreatures(0.05);
                u.tier = c.userData._motionZustand === "schwimmen";
            }
            u.scheu = r._creatureWaterContextAt(c, p.b).inWater;
        }
        u.wagen = r._fahrTiefe({ x: p.x, z: p.z, y: p.b }) > 0.05;
        const ziel = r._findNearestWaterPoint(p.x + 6, p.z, 8);
        u.trinken = !!ziel && drin(ziel.x, ziel.z);
        u.klang = r._nassAt(p.x, p.z);
        u.schritt = r._schrittMaterialAt(p.x, p.z, p.b) === "wasser";
        u.wand = r._naturWand(baum, { x: p.x, y: p.b, z: p.z }, null) === "wasser";
        u.land = !r._landAt(p.x, p.z, 0.4);
        u.kontrolle = r._atlasWaterLevelAt(p.x, p.z, p.b) > p.b;
        return u;
    };
    const leser = {};
    for (const k of Object.keys(LESER)) leser[k] = { wer: LESER[k], n: 0, vor: 0, nach: 0, bsp: null };
    const zaehle = (feld, p, u) => {
        for (const k of Object.keys(u)) {
            if (feld === "vor") leser[k].n++;
            if (u[k]) leser[k][feld]++;
            else if (feld === "nach" && !leser[k].bsp) leser[k].bsp = [R(p.x), R(p.z)];
        }
    };
    const aus = { punkte: punkte.length, versuche, rho: RHO, tief: TIEF, leser, flora: { vor: flora() } };
    try {
        for (const p of punkte) zaehle("vor", p, urteil(p));
        const gitter = new Map();
        for (const p of punkte) {
            p.s = p.b + TIEF;
            for (let gz = Math.floor((p.z - RHO) / 8); gz <= Math.floor((p.z + RHO) / 8); gz++)
                for (let gx = Math.floor((p.x - RHO) / 8); gx <= Math.floor((p.x + RHO) / 8); gx++)
                    gitter.set(gx + "," + gz, (gitter.get(gx + "," + gz) || []).concat(p));
        }
        const echt = r._koerperWasserSpiegel;
        r._koerperWasserSpiegel = function (x, z, g) {
            for (const p of gitter.get(Math.floor(x / 8) + "," + Math.floor(z / 8)) || [])
                if ((x - p.x) ** 2 + (z - p.z) ** 2 <= RHO * RHO) return p.s;
            return echt.call(this, x, z, g);
        };
        for (const p of punkte) zaehle("nach", p, urteil(p));
        aus.flora.nach = flora();
    } finally {
        delete r._koerperWasserSpiegel;
        if (c) r.removeCreature(c);
        leib.zurueck();
    }
    return aus;
}

// ── GELÄNDE K4 STAFFEL 2: ÜBERALL ── `n` Würfe über die Karte (±6 km, je ≥ 1,5 km auseinander): trockenes Land (`_landAt`) oder
// der Fluss-Punkt nächst dem Wurf mit Strömung und ≥ 1,2 m Wasser (`fluss`); an jedem die Mutation oder die Strömung.
async function wasserKarte(o) {
    const [orte, zufall] = [[], window.__phytoCore.mulberry32(0x51ed270b)];
    for (let v = 0; v < 400 && orte.length < o.n; v++) {
        const [x, z] = [zufall() * 12000 - 6000, zufall() * 12000 - 6000];
        if (orte.some(([a, b]) => Math.hypot(a - x, b - z) < 1500)) continue;
        await window.__weltDa(() => !r._ensureHydroTilesAround(x, z, 300));
        const tief = (q, b = r._voxelSurfaceY(q.x, q.z)) => r._waterFlowAt(q.x, q.z) && r._atlasWaterLevelAt(q.x, q.z, b) - b >= 1.2;
        const P = o.fluss ? (r._hydroFor(x, z).rivers || []).flatMap((rv) => rv.points.slice(4, -4)).filter((q) => !q.inLake) : [];
        const p = o.fluss ? P.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z)).slice(0, 400).find((q) => tief(q)) : { x, z };
        if (o.fluss ? p : r._landAt(x, z, 2)) orte.push([p.x, p.z]);
    }
    const aus = [];
    for (const ort of orte) aus.push(Object.assign({ ort }, await (o.fluss ? window.__wasserTreibt : window.__wasserMutation)({ ort })));
    return aus;
}

// DIE LÄUFE ENDEN IN SEE ODER MEER: jeder Lauf des Gesetzes (`flussLaeufe` ±3 km) bis zu seiner Senke verfolgt, über den
// Fenster-Rand und die Mündung (der Lauf der Ebene darunter, dessen Bahn sie trägt); jede Senke (auch jede `benannteSeen`) ist
// nass (`_nassAt`, dort oder daneben); stromab fällt die Sohle jedes Flusses der Regionen streng, sein Spiegel steigt nie.
async function wasserLaeufe() {
    const [G, L] = [window.__gelaendeCore, r._gelaende()];
    const start = G.flussLaeufe(L, -3072, -3072, 3072, 3072, 16);
    const aus = { laeufe: start.length, ende: {}, nass: 0, trocken: [], schritte: 0, steigt: 0 };
    const senken = new Map();
    for (let [gl, ende, k, n] of start.map((l) => [l.glieder, l.ende, l.k, 0])) {
        let { bx: x, bz: z } = gl[gl.length - 1];
        for (; n < 400 && ende !== "see" && ende !== "meer"; n++) {
            const e = ende;
            const weiter = G.flussLaeufe(L, x - 1, z - 1, x + 1, z + 1, 16)
                .filter((l) => l.k === (e === "muendung" ? k - 1 : k))
                .map((l) => {
                    const i = l.glieder.findIndex((q) => (e === "muendung" ? q.bahn.some((b) => Math.hypot(b.x - x, b.z - z) < 16) : q.ax === x && q.az === z));
                    const f = l.glieder[l.glieder.length - 1];
                    return i >= 0 ? [l.glieder.slice(i), l.ende, l.k] : e === "rand" && f.bx === x && f.bz === z && l.ende !== "rand" ? [[f], l.ende, l.k] : null;
                })
                .find(Boolean);
            [gl, ende, k] = weiter || [gl, "verloren", k];
            if (!weiter) break;
            ({ bx: x, bz: z } = gl[gl.length - 1]);
        }
        aus.ende[ende] = (aus.ende[ende] || 0) + 1;
        if (ende === "see" || ende === "meer") senken.set(x + "," + z, [ende, x, z]);
        else if (aus.trocken.length < 6) aus.trocken.push([ende, Math.round(x), Math.round(z)]);
    }
    for (const k of G.benannteSeen(L, -3072, -3072, 16, 385)) senken.set(k, ["see", -3072 + (k % 385) * 16, -3072 + ((k / 385) | 0) * 16]);
    for (const [ende, x, z] of senken.values()) {
        await window.__weltDa(() => !r._ensureHydroTilesAround(x, z, 32));
        if ([[0, 0], [16, 0], [-16, 0], [0, 16], [0, -16]].some(([dx, dz]) => r._nassAt(x + dx, z + dz))) aus.nass++;
        else aus.trocken.push([ende, Math.round(x), Math.round(z)]);
    }
    aus.senken = senken.size;
    for (const h of [r.state.hydrosphere, ...r.state.hydroTiles.values()])
        for (const P of (h.rivers || []).map((rv) => rv.points)) for (let i = 1; i < P.length; i++, aus.schritte++) aus.steigt += P[i].S > P[i - 1].S || P[i].y >= P[i - 1].y;
    return aus;
}

// DIE STRÖMUNG TREIBT (gate:kopplung F1 in der Welt): am Fluss-Punkt `ort` je Körper 90 Takte ohne Eingabe, mit und ohne Strömung
// (`_waterFlowAt` schweigt); der Weg längs des Laufs ist die Drift — Schwimmer (`_stepFixedSim`), geritten das Probe-Boot und der
// Wolf (`updateCreatures`, sein Steuer-Gesetz rudert nicht) treiben, ohne Strömung nicht.
async function wasserTreibt(o) {
    const [r, A] = [window.anazhRealm, window.anazhRealm.constructor];
    const [x, z] = o.ort;
    await window.__wasserStrom([x, z], 3);
    const f = r._waterFlowAt(x, z);
    if (!f) return { fehler: "kein Fluss am Ort" };
    const m = Math.hypot(f.x, f.z);
    const S = r._atlasWaterLevelAt(x, z, r._voxelSurfaceY(x, z));
    const [st, leib, SG] = [r.state, window.__wasserLeib(), A._steuerGesetz()];
    const lauf = (setze, takt, fort) => {
        const weg = [];
        for (const mit of [true, false]) {
            if (!mit) r._waterFlowAt = () => null;
            const k = setze();
            if (!k) return { fehler: "der Körper steht nicht" };
            const w = k.position.x * f.x + k.position.z * f.z;
            for (let n = 0; n < 90; n++) takt(k);
            weg.push(wasserRund(3)((k.position.x * f.x + k.position.z * f.z - w) / m));
            delete r._waterFlowAt;
            if (fort) fort(k);
        }
        return { mit: weg[0], ohne: weg[1] };
    };
    const BOOT = wasserBoot(st);
    const aus = { ort: [x, z], strom: m };
    try {
        aus.schwimmer = lauf(() => leib.setze(x, S - 0.9, z), () => leib.takt());
        aus.boot = lauf(
            () => {
                leib.setze(x, S + 1, z);
                const e = r.spawnArchitecture(BOOT, { x, y: r._voxelSurfaceY(x, z), z }, { silent: true, precise: true });
                e.affordances = Object.assign({}, e.affordances, { moveable: true });
                return (r.mountArchitecture(e) || {}).ok ? e : (r.removeArchitecture(e), null);
            },
            () => (leib.takt(), r._tickMountedMovement(A.FIXED_DT)),
            (e) => (r.dismountArchitecture(), r.removeArchitecture(e))
        );
        A._steuerGesetzMemo = Object.assign({}, SG, { steuerSchritt: (s) => (s.v = 0) });
        leib.setze(x, S + 30, z); // sein Leib schöbe den Wolf
        aus.tier = lauf(() => wasserTier(r, x, S, z, "wolf"), () => r.updateCreatures(A.FIXED_DT), (c) => r.removeCreature(c));
    } finally {
        delete r._waterFlowAt;
        delete st.blueprints[BOOT];
        A._steuerGesetzMemo = SG;
        leib.zurueck();
    }
    return aus;
}

// ── DIE ORTE DES WASSERS AUS DER WELT ── nie als Literale der Proben: gesucht am Gesetz nächst der
// Mess-Wiese (`mess`): der See (die nächste benannte Senke des Gelände-Gesetzes, deren Kachel einen See über dem Meer trägt,
// tiefste Stelle ≥ 3 m), sein Ostufer (von der tiefsten Stelle nach +x die erste trockene Spalte, 4 m landein — der Weg
// des Körpers läuft längs x), der Fluss (der nächste Lauf-Punkt 2–14 m breit), der Bach (die Quelle des nächsten Laufs
// mit ≥ 11 Punkten — die Bach-Probe misst seine ersten Segmente) und die Küste (die nächste Ozean-Zelle des Atlas neben
// Land, dort die Land-Seite).
async function wasserOrte(o = {}) {
    const G = window.__gelaendeCore;
    const mitte = o.mess || window.__messWiese; // der Messort aus spec/profiband/haushalt.json (welt-orte.cjs)
    if (!mitte) throw new Error("__wasserOrte: keine Mitte (weder opts.mess noch __messWiese)");
    const [MX, MZ] = mitte;
    const wl = st.waterLevel || 0;
    const R1 = wasserRund(1);
    const tiefe = (x, z) => {
        const g = r._voxelSurfaceY(x, z);
        if (!Number.isFinite(g)) return -Infinity;
        const w = r._atlasWaterLevelAt(x, z, g);
        return w > g ? w - g : -Infinity;
    };
    const aus = { mess: [MX, MZ], see: null, fluss: null, bach: null, kueste: null };
    await window.__weltDa(() => !r._ensureHydroTilesAround(MX, MZ, 1024));
    // 1) der See
    const L = r._gelaende();
    const kand = G.benannteSeen(L, -12000, -12000, 64, 375)
        .map((k) => ({ x: -12000 + (k % 375) * 64, z: -12000 + ((k / 375) | 0) * 64 }))
        .sort((a, b) => Math.hypot(a.x - MX, a.z - MZ) - Math.hypot(b.x - MX, b.z - MZ));
    for (const k of kand) {
        await window.__weltDa(() => !r._ensureHydroTilesAround(k.x, k.z, 0));
        const h = r._hydroFor(k.x, k.z);
        const lake = h && (h.lakes || []).find((l) => l.level > wl + 2 && l.cells && l.cells.length >= 16);
        if (!lake) continue;
        // die Mitte und der Weg vom Ostufer tragen das Wasser des SEES (kein Fluss mündet dort: sein Spiegel läge über dem
        // des Sees — am See 1816/−6168 trug die tiefste Zelle den Fluss-Spiegel 1,54 m statt 0,91 m, K2/K6 maßen am See)
        const seeWasser = (x, z) => tiefe(x, z) > 0 && !r._hydroRiverAt(x, z);
        const zellen = [];
        for (const q of lake.cells) {
            const x = h.originX + ((q % h.dim) + 0.5) * h.cell;
            const z = h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell;
            const t = tiefe(x, z);
            if (t >= 3 && !r._hydroRiverAt(x, z)) zellen.push({ x, z, t });
        }
        zellen.sort((a, b) => b.t - a.t);
        let best = null;
        let ufer = null;
        for (const c of zellen) {
            let d = 2;
            while (d <= 600 && seeWasser(c.x + d, c.z)) d++;
            if (d > 600 || tiefe(c.x + d, c.z) > 0) continue; // ein Fluss oder kein Ufer auf dem Weg
            best = c;
            ufer = [R1(c.x + d + 4), R1(c.z)];
            break;
        }
        if (!best) continue;
        aus.see = {
            x: R1(best.x),
            z: R1(best.z),
            tiefe: R1(best.t),
            level: lake.level,
            ufer,
            mitte: [R1(best.x), R1(best.z)],
            fenster: [ufer[0] - 40, ufer[1] - 40, ufer[0] + 40, ufer[1] + 40],
        };
        break;
    }
    // 2) Fluss und Bach: über alle geladenen Regionen
    const regionen = [st.hydrosphere]
        .concat(st.hydroTiles ? [...st.hydroTiles.values()] : [])
        .filter((h) => h && h.ready);
    let fd = Infinity;
    let bd = Infinity;
    for (const h of regionen)
        for (const rv of h.rivers || []) {
            const P = rv.points || [];
            for (const p of P) {
                if (p.inLake || !(p.width >= 2 && p.width <= 14)) continue;
                const d = Math.hypot(p.x - MX, p.z - MZ);
                if (d < fd) ((fd = d), (aus.fluss = { x: R1(p.x), z: R1(p.z), breite: R1(p.width) }));
            }
            let lang = 0;
            for (let k = 1; k < P.length && lang < BACH_PROBE_M; k++)
                lang += Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z);
            if (lang >= BACH_PROBE_M) {
                const d = Math.hypot(P[0].x - MX, P[0].z - MZ);
                if (d < bd) ((bd = d), (aus.bach = { x: R1(P[0].x), z: R1(P[0].z) }));
            }
        }
    // 3) die Küste: die nächste Ozean-Zelle (waterKind 1) neben Land mit Boden unter dem Meer, die Land-Seite — liegt das Meer jenseits der geladenen
    //    Kacheln, zuerst am Gesetz (Ringe zu 64 m bis 12 km) der erste Grund unter dem Meer, dort die Kachel
    if (!regionen.some((h) => h.water && h.water.waterKind && h.water.waterKind.indexOf(1) >= 0))
        for (let R = 64, da = false; R <= 12000 && !da; R += 64) {
            const n = Math.ceil((2 * Math.PI * R) / 64);
            for (let k = 0; k < n && !da; k++) {
                const x = MX + R * Math.cos((k / n) * 2 * Math.PI);
                const z = MZ + R * Math.sin((k / n) * 2 * Math.PI);
                if (!(r._terrainMacroSurfaceY(x, z, false) < wl - 2)) continue;
                await window.__weltDa(() => !r._ensureHydroTilesAround(x, z, 0));
                const h = r._hydroFor(x, z);
                if (h && h.ready && regionen.indexOf(h) < 0) regionen.push(h);
                da = !!(h && h.water && h.water.waterKind && h.water.waterKind.indexOf(1) >= 0);
                // die Küste ist breiter als eine Kachel: ihre Nachbarn gehören zur Suche nach der Tasche (unten)
                if (da) {
                    await window.__weltDa(() => !r._ensureHydroTilesAround(x, z, 1024));
                    for (const t of st.hydroTiles ? st.hydroTiles.values() : [])
                        if (t && t.ready && regionen.indexOf(t) < 0) regionen.push(t);
                }
            }
        }
    let kd = Infinity;
    for (const h of regionen) {
        const wK = h.water && h.water.waterKind;
        if (!wK) continue;
        for (let cj = 1; cj < h.dim - 1; cj++)
            for (let ci = 1; ci < h.dim - 1; ci++) {
                if (wK[ci + cj * h.dim] !== 0) continue;
                let meer = null;
                for (const [di, dj] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ])
                    if (wK[ci + di + (cj + dj) * h.dim] === 1) meer = [di, dj];
                if (!meer) continue;
                const x = h.originX + (ci + 0.5) * h.cell;
                const z = h.originZ + (cj + 0.5) * h.cell;
                const d = Math.hypot(x - MX, z - MZ);
                if (d < kd) ((kd = d), (aus.kueste = [R1(x), R1(z)]), (aus.meer = [x + meer[0] * h.cell, z + meer[1] * h.cell]));
            }
    }
    // die TASCHE: Atlas-Land mit Boden unter dem Meer liegt nur jenseits des 3×3-Rands (am Rand füllt der Atlas die
    // Spalte selbst bis zum Spiegel) — dort zeichnet das Sheet den Küsten-Aquifer, und dort misst die Probe K12. Je Land-Zelle
    // ohne Wasser im 3×3 und mit Meer in 6 Zellen 8 × 8 Proben; die Zelle mit den meisten Proben unter dem Meer (gleich viele:
    // die nähere), dort die tiefste. Die Landform trägt sie selten.
    let besteZahl = 0,
        besteD = Infinity;
    for (const h of regionen) {
        const wK = h.water && h.water.waterKind;
        if (!wK || wK.indexOf(1) < 0) continue;
        const D = h.dim;
        for (let cj = 1; cj < D - 1; cj++)
            for (let ci = 1; ci < D - 1; ci++) {
                if (wK[ci + cj * D] !== 0) continue;
                let rand = false,
                    meer = false;
                for (let dj = -1; dj <= 1 && !rand; dj++)
                    for (let di = -1; di <= 1; di++) {
                        const k = wK[ci + di + (cj + dj) * D];
                        if (k === 1 || k === 2) rand = true;
                    }
                if (rand) continue;
                for (let dj = -6; dj <= 6 && !meer; dj++)
                    for (let di = -6; di <= 6; di++) {
                        const ni = ci + di,
                            nj = cj + dj;
                        if (ni >= 0 && nj >= 0 && ni < D && nj < D && wK[ni + nj * D] === 1) meer = true;
                    }
                if (!meer) continue;
                let zahl = 0,
                    tiefst = null;
                for (let a = 0; a < 8; a++)
                    for (let b = 0; b < 8; b++) {
                        const x = h.originX + (ci + (a + 0.5) / 8) * h.cell,
                            z = h.originZ + (cj + (b + 0.5) / 8) * h.cell;
                        const g = r._voxelSurfaceY(x, z);
                        if (!(g < wl - 0.05) || r._atlasWaterLevelAt(x, z, g) > -Infinity) continue;
                        zahl++;
                        if (!tiefst || g < tiefst[2]) tiefst = [x, z, g];
                    }
                if (!zahl) continue;
                const d = Math.hypot(tiefst[0] - MX, tiefst[1] - MZ);
                if (zahl > besteZahl || (zahl === besteZahl && d < besteD)) {
                    besteZahl = zahl;
                    besteD = d;
                    aus.kueste = [R1(tiefst[0]), R1(tiefst[1])];
                }
            }
    }
    return aus;
}

module.exports = {
    WASSER_INSTALL:
        WELT_ORTE_INSTALL +
        `var BACH_PROBE_M = ${BACH_PROBE_M};` +
        wasserRund.toString() +
        wasserFlaechen.toString() +
        wasserBoot.toString() +
        wasserTier.toString() +
        wasserPflanzen.toString() +
        wasserSchmelze.toString() +
        wasserErstarrung.toString() +
        wasserGluehen.toString() +
        // jede Probe als `window.__<Name>` (der Name der Funktion ohne führende Striche)
        Object.entries({ wasserOrte, wasserLeser, wasserLeib, wasserMutation, wasserKarte, wasserLaeufe, wasserTreibt, wasserHoehle, wasserWagen, wasserSichtNetz, wasserFlora, wasserSee, wasserQuelle, wasserQuellTeil, wasserBach, wasserBank, wasserFluss, __wasserKroneVon, wasserUfer, wasserStrom, __wasserFlussNah, wasserGraben, wasserDamm, wasserUferFarbe, wasserKoerper, wasserBild, __wasserSeeAm, wasserLicht, wasserRegen })
            .map(([n, f]) => `window.__${n.replace(/^_+/, "")} = ${f};`)
            .join(""),
    quellTeileVereinen,
    QUELL_KACHELN,
};
