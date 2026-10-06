// wasser-linse.cjs — DIE WASSER-LINSE der Leben-Prüfung (Welle L, Klassen Q6 + Q7): drei Proben, die den Defekt beim
// NAMEN nennen und den Chokepoint selbst rufen (nie einen Stub). Befund 06.10. (sichtbares Fenster, echte Radeon,
// artifacts/profiband/leben/befund-wasser-fluss.md): der Fluss steigt bergauf (14,3 % der 2-m-Schritte), wölbt sich
// 1,55 m über die Breite, wird mit der Spielzeit ein weißes Zebra; wer in den See geht, geht am Grund (4,52 m unter dem
// Spiegel), der Schwimmer treibt auf dem 1,8-m-Zell-Dach, kraulen kriecht mit 0,137 m/s (Soll 0,977), das Eintauchen
// ist stumm.
//
//   window.__wasserFluss()           Q7-Gestalt: steigende 2-m-Schritte der Lauf-Fläche längs aller Flussmitten, der
//                                    Querschnitt (Spanne der Lauf-Fläche quer über die Kanal-Breite), Wasserfall-Doppel
//   window.__wasserKoerper(o)        Q6-Körper: Hineingehen (Frames „Brustkorb unter dem Spiegel UND geerdet"), Schwimm-
//                                    Lage (Füße unter dem See-Spiegel in Ruhe), Kraul-Tempo gegen das Gesetz, Eintauchen
//                                    (Landungs-Ereignis „wasser"); der See-Spiegel `lake.level` ist die sichtbare Wahrheit
//   window.__wasserBild(o)           Q7-Bild: das ECHTE Wasser-Material auf einem synthetischen Fluss-Bogen, gerendert
//                                    bei Wasser-Uhr 60 s und 3600 s — Kanten-Dichte (mittlere Luma-Variation je Pixel)
//                                    und Weiß-Anteil; ein Phasen-Zerfall macht die 3600-s-Kanten-Dichte zum Vielfachen
//
// Werkbank (echte GPU, sichtbar): `werkbank eval` mit WASSER_INSTALL; Gate: scripts/diag-wasser-leben.cjs.
"use strict";

// ── Q7-Gestalt ──
function wasserFluss() {
    const r = window.anazhRealm;
    const st = r.state;
    const h = st.hydrosphere;
    if (!h || !h.ready || !Array.isArray(h.rivers)) return { fehler: "keine Hydrosphäre" };
    // Die Lauf-Fläche: was Körper und Augen lesen (`_waterRunSurfaceAt`, Boden unbekannt → der Kanal-KERN).
    const lauf = (x, z) => r._waterRunSurfaceAt(x, z);
    let schritte = 0,
        steigend = 0,
        anstieg = 0,
        abstieg = 0,
        maxAnstieg = 0;
    const quer = [];
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
            let lo = Infinity,
                hi = -Infinity;
            for (let d = -halbe; d <= halbe + 1e-6; d += 0.5) {
                const w = lauf(a.x + nx * d, a.z + nz * d);
                if (!Number.isFinite(w)) continue;
                if (w < lo) lo = w;
                if (w > hi) hi = w;
            }
            if (hi > lo) quer.push(hi - lo);
        }
    }
    quer.sort((x, y) => x - y);
    const q = (p) => (quer.length ? quer[Math.min(quer.length - 1, Math.floor(p * quer.length))] : 0);
    const R = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
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
        wasserfaelle: wf.length,
        wasserfallOrte: orte.size,
    };
}

// ── Q6-Körper ──
function wasserKoerper(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const st = r.state;
        const A = r.constructor;
        const DT = A.FIXED_DT;
        const h = st.hydrosphere;
        if (!h || !h.ready) return { fehler: "keine Hydrosphäre" };
        const ziel = o.see || [-944, -640];
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
        if (!see) return { fehler: "kein See" };
        const spiegel = see.level;
        // Der Weg des Befunds (06.10., Station 1): vom Ostufer (−884/−650, trockenes Gras) nach Westen bis −935 (8 m
        // tief) — kein Fluss quert ihn; dort Lage, Kraulen und Eintauchen.
        const [x0, mz] = o.start || [-884, -650];
        const mx = (o.ziel || [-935, -650])[0];
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
        const vorher = { loop: r._loopFixedStep };
        r._loopFixedStep = function () {
            return 0;
        };
        let t = Number.isFinite(st._fixedSimTime) ? st._fixedSimTime : 0;
        const schritt = (keys) => {
            st.keys = Object.assign({}, keys || {});
            r._stepFixedSim(t, DT);
            t += DT;
            st._fixedSimTime = t;
        };
        const setze = (x, y, z) => {
            pm.position.set(x, y, z);
            st._fieldVy = 0;
            st.playerVel.setValue(0, 0, 0);
            st.isInAir = false;
            st._fieldWasGrounded = false;
            if (st._fixedSimPos) st._fixedSimPos.copy(pm.position);
            st._fixedPrevPos = null;
        };
        const R = (x, n = 3) => (Number.isFinite(x) ? Math.round(x * 10 ** n) / 10 ** n : null);
        const aus = {
            see: { mitte: [R(mx, 1), R(mz, 1)], spiegel: R(spiegel, 2), tiefeMitte: R(tiefeMitte, 2) },
            brust: R(brust),
        };
        const keysAlt = st.keys;
        const yawAlt = st.yaw;
        try {
            // (1) HINEINGEHEN: vom Ostufer nach Westen, W gedrückt.
            const g0 = r._voxelSurfaceY(x0, mz);
            setze(x0, g0 + FUSS + 0.05, mz);
            st.yaw = -Math.PI / 2; // vorwärts = −x
            let tiefGeerdet = 0,
                augenUnterGeerdet = 0,
                maxTiefeGeerdet = 0,
                schwimmFrames = 0,
                n = 0;
            for (; n < (o.gehFrames || 1500); n++) {
                schritt({ w: true });
                const fuss = pm.position.y - FUSS;
                const tiefe = spiegel - fuss;
                const geerdet = st._fieldWasGrounded === true;
                if (geerdet && tiefe > brust + 0.05) {
                    tiefGeerdet++;
                    if (tiefe > maxTiefeGeerdet) maxTiefeGeerdet = tiefe;
                }
                if (geerdet && st.playerEyesUnderwater) augenUnterGeerdet++;
                if (st.playerUnderwater) schwimmFrames++;
                if (pm.position.x <= mx) break;
            }
            aus.hinein = {
                frames: n,
                erreichtMitte: pm.position.x <= mx + 1,
                tiefGeerdet,
                augenUnterGeerdet,
                maxTiefeGeerdetM: R(maxTiefeGeerdet, 2),
                schwimmFrames,
            };
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
            const luft = typeof r._luftEnsure === "function" ? r._luftEnsure() : null;
            if (cam && luft && luft.U && luft.U.hoehe) {
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
        } finally {
            st.keys = keysAlt || {};
            st.yaw = yawAlt;
            r._loopFixedStep = vorher.loop;
        }
        return aus;
    })();
}

// ── Q7-Bild ──
function wasserBild(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const st = r.state;
        const T = window.THREE;
        const renderer = st.renderer;
        if (!renderer || !renderer.backend || renderer.backend.isNullBackend) return { fehler: "kein echter Renderer" };
        const mat = r._ensureHydroSurfaceMaterial();
        const U = st.hydroSurfaceUniforms;
        // Ein Fluss-Bogen (Radius 40 m, 14 m breit, 120°) mit dem Strömungs-Attribut, wie es das Zell-Sheet trägt: die
        // Richtung entlang der Tangente, der Betrag zur Bank hin ausgeblendet (der wet-only Blur des Sheets). Die erste
        // Hälfte ist RUHIGES Wasser (aSlope 0 — dort schäumt das Gesetz nicht), die zweite eine STROMSCHNELLE (aSlope 3,2:
        // das Wildwasser trägt die advektierten Strähnen — an ihnen sieht die Linse den Phasen-Zerfall). `aShore` (0) trägt
        // der Bogen für das Material vor V18.532, das es noch las.
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
        geom.setAttribute("aShore", new T.Float32BufferAttribute(nul, 1));
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
        const lese = async () => {
            renderer.setRenderTarget(rt);
            renderer.render(szene, cam);
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
        // Der Spiel-Loop ruht während der Probe (Lehre 17): zwischen den beiden Uhren schrieb der Tag-Nacht-Takt Licht
        // und Himmel neu (06.10.: die Stromschnelle bei Uhr 3600 2,5× heller als bei 60 — das Licht, nicht das Wasser).
        renderer.setAnimationLoop(null);
        const irrAlt = U.irr.value.clone();
        const lichtAlt = U.light.value;
        const mess = async (zeit) => {
            U.time.value = zeit;
            U.irr.value.setRGB(1, 1, 1);
            U.light.value = 0;
            const px = await lese();
            const L = new Float32Array(W * H);
            for (let p = 0; p < W * H; p++) L[p] = 0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2];
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
                        if (L[p] > 32) hell++; // Schaum-Deckung: doppelt so hell wie der Wasser-Körper im Licht 1

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
            return { ruhig: zone(1), schnelle: zone(2), png: o.png ? bildDaten(px) : null };
        };
        // Das Bild selbst (für den Bericht): das Render-Ziel als PNG (linear, ungetont — ein Vergleichs-Bild, kein Look).
        const bildDaten = (px) => {
            const c = document.createElement("canvas");
            c.width = W;
            c.height = H;
            const ctx = c.getContext("2d");
            const im = ctx.createImageData(W, H);
            im.data.set(px.subarray(0, W * H * 4));
            for (let p = 3; p < W * H * 4; p += 4) im.data[p] = 255;
            ctx.putImageData(im, 0, 0);
            return c.toDataURL("image/png");
        };
        let a, b;
        try {
            // zwei Uhren, die keine ganze Zahl von Phasen trennt (sonst verglichen beide dieselbe Phase)
            a = await mess(o.t0 || 61.3);
            b = await mess(o.t1 || 3601.7);
        } finally {
            U.time.value = zeitAlt;
            U.irr.value.copy(irrAlt);
            U.light.value = lichtAlt;
            geom.dispose();
            maskMat.dispose();
            rt.dispose();
        }
        const R = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
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
            png60: a.png,
            png3600: b.png,
        };
    })();
}

module.exports = {
    WASSER_INSTALL:
        `window.__wasserFluss = ${wasserFluss.toString()};` +
        `window.__wasserKoerper = ${wasserKoerper.toString()};` +
        `window.__wasserBild = ${wasserBild.toString()};`,
};
