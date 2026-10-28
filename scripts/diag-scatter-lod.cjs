// diag-scatter-lod.cjs — DER FERNWALD FOLGT DER LIVE-DISTANZ (baum-D1/D2).
// Beweist im echten Boot (foundry-ON, Null-Renderer), dass die Scatter-Stufen
// NICHT mehr auf der Bau-Zeit-Distanz eingefroren sind:
//
//   L (LOD-Tick): nach einem Spieler-Sprung wandern die Zellen-Stufen — eine
//     vormals nahe Zelle (lod 0/1) wird nach dem Weg-Sprung per _tickScatterLod
//     auf die Fernstufe re-alloziert (cell.lod folgt, Slots getauscht, Bilanz
//     dicht: alte Slots frei, neue leben).
//   H (Hysterese): ein zweiter Tick OHNE Bewegung realloziert NICHTS mehr
//     (der Chooser ist zustands-stabil — kein Flacker-Churn).
//   P (Promotion über Region-Grenzen): der Promotions-Kreis (promoteM) liest
//     jetzt ALLE geschnittenen Regionen — der 2×2-Fächer um den Spieler wird
//     abgedeckt (Quell-Probe: der Block walkt rx0..rx1/rz0..rz1, nicht nur
//     die Home-Region).
//   F: platzierte Fern-Leaves
//     (Impostor-Quads) über ein 4×4-Region-Raster, A/B durch DIESELBE Pipe:
//     S=1 vs S=SCATTER_FERN_
//     SUPERREGION (Super-Region). Erwartung ≥4× weniger lod2-Gruppen, Slot-
//     Bilanz dicht (Empty-Dispose räumt beide Welten restlos), und die EINE
//     Key-Funktion (_archFernRegionKey) ist der einzige Konstanten-Leser.
//   K (W7 — DIE KARTEN IN DER WAHL): die EINE Atlas-Gruppe ist eine Gruppe der Instanz-Wahl (Hauptbild, Fenster „karte")
//     und zeichnet selbst; je Pass ordnet die Wahl (`_instanzWahlPass`, das EINE Gesetz der Pass-Wahl) genau die Karten nach
//     vorn, die das Frustum der Pass-Kamera treffen — eine Linsen-Kamera über den 16 Karten sieht alle 16, eine in den Himmel
//     keine, eine über der Westhälfte die 8 der Westhälfte; jede gezeichnete Instanz ist eine Karte der Fixtur, jede Marke
//     trägt ihren Slot, nach dem Pass zählt die Gruppe wieder alle. Selbsttest: eine Wahl ohne Gesetz (jede Karte trifft) fällt rot und wird genannt.
//
//   node scripts/diag-scatter-lod.cjs
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");

const PORT = Number(process.env.SCATTER_LOD_PORT || 4441);
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    // ── F (Absenz über den EINEN Helfer): kein zweiter Keying-Ort — die Konstante lesen NUR der Key (`_archFernRegionKey`)
    // und die T3-Kugel (`_archRegionBundleFor`), der `s:`-Super-Key hat EINE Ableitung (`_archFernRegionKey`). Dass die
    // Leser lesen, zeigen die Unit-, Kugel- und Diät-Proben im Boot.
    check(
        "F(Absenz): kein dritter Leser von SCATTER_FERN_SUPERREGION (nur Key und T3-Kugel)",
        stammLib.fehlt({ ausser: ["_archFernRegionKey", "_archRegionBundleFor"] }, /AnazhRealm\.SCATTER_FERN_SUPERREGION(?!\s*=[^=])/),
        stammLib.fehlt.wo
    );
    check(
        "F(Absenz): kein zweiter Ableitungs-Ort des `s:`-Super-Keys",
        stammLib.fehlt({ ausser: "_archFernRegionKey" }, /"s:" \+ Math\.floor/),
        stammLib.fehlt.wo
    );

    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = {};
        const r = await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready);
        // Scatter-Regionen um den Spieler bauen lassen (der Streaming-Tick baut 1/Frame), bis die Streu STEHT (die EINE
        // Antwort `_streuWartet`): die Fern-Baum-Karte bestellt ihr Leser — eine Region wartet auf sie und baut nach
        // der Lieferung neu; erst dann trägt sie ihre Fern-Zellen.
        const pm = r.state.playerMesh.position;
        // DER TAKT DER STREU ist beides, was sie liest: die Schlange des Walds (`_tickWaldPlan`, K69 — die Gestalt jedes
        // Foundry-Baums wartet auf den Plan seines Orts, wie im Spiel der Job `waldPlan` vor `scatterDeco`) und der Streamer.
        // Ohne die Schlange stand keine Nah-Zelle einer zwei-stufigen Art (D ROT, K69-2 N2: kandidat 35,8 m, lodVor undefined).
        const streuTakt = () => {
            r._tickWaldPlan(Infinity);
            r._tickScatterStreaming(pm);
        };
        let cells = 0;
        const zellen = () => {
            const map = r.state.scatterRegions;
            cells = 0;
            if (map) for (const reg of map.values()) cells += reg.cells ? reg.cells.length : 0;
            return cells;
        };
        const streuSchritt = async () => (streuTakt(), await sleep(30));
        await window
            .__gebautNach("die Streu um den Spieler", { fertig: () => zellen() > 40 && r._streuWartet(pm) === 0, takt: streuSchritt, max: 1500 });
        res.streuWartet = r._streuWartet(pm);
        res.cells = cells;
        // ── P: die Promotion erreicht eine Zelle jenseits der Region-Grenze (nah 0,85·pr in der Nachbar-Region), die ferne
        // (1,7·pr) nie; Streuen und Räumen schweigen, der Sprung nach Region 950 lässt den echten Ring stehen.
        {
            const SC = r.constructor.SCATTER, regM = SC.regionM, pr = SC.promoteM, K = 950, map = r.state.scatterRegions;
            const ecke = (d) => (K + 1) * regM + pr * d, zelle = (d) => ({ x: ecke(d), z: ecke(d), slots: [], promotable: true, layer: "tree" });
            const nah = zelle(0.3), weit = zelle(0.9), key = K + 1 + "," + (K + 1), gesehen = [];
            map.set(key, { regX: K + 1, regZ: K + 1, cells: [nah, weit] });
            r._promoteScatterCell = (c) => (gesehen.push(c), false);
            r._streuRegionInReichweite = r._disposeScatterRegion = () => false;
            try { r._tickScatterStreaming({ x: ecke(-0.3), y: 0, z: ecke(-0.3) }); } finally { delete r._promoteScatterCell; delete r._streuRegionInReichweite; delete r._disposeScatterRegion; map.delete(key); }
            res.p = gesehen.includes(nah) && !gesehen.includes(weit);
        }
        if (!cells) return res;
        // Eine lebende Zelle suchen (Schicht-agnostisch — der Tick trägt alle
        // Schichten; im Null-Renderer deferrieren Baum-Fernstufen [kein RTT] →
        // meist proben wir eine Grammatik-Schicht, derselbe Chokepoint).
        // DAS FELD URTEILT (das-feld-zeichnet §2 Stufe 1): die Probe MUSS eine
        // Zelle wählen, die der B2-Guard des Ticks WANDERN LÄSST — Zellen mit
        // region-PRIVATEN Slots (`@regX,regZ`, nicht `@s:`-Super-Region) gehören
        // BY DESIGN dem Region-Lifecycle (JEDE Stufe der Boden-Schichten trägt den Region-Key).
        const map = r.state.scatterRegions;
        const b2Privat = (c) =>
            Array.isArray(c.slots) &&
            c.slots.some((s) => {
                if (!s || typeof s.key !== "string") return false;
                const at = s.key.indexOf("@");
                return at >= 0 && !(s.key.startsWith("@s:", at));
            });
        const sucheProbe = (nurNah) => {
            for (const reg of map.values()) {
                for (const c of reg.cells || []) {
                    if (c.slots && c.bpName && !b2Privat(c) && (!nurNah || c.lod < 2)) return c;
                }
            }
            return null;
        };
        // BEVORZUGT eine NAHE Zelle (lod<2 → Weg-Sprung auf die vorgewärmte
        // Fernstufe); IM FOUNDRY-REGIME ist diese Population fast leer (innerM 64:
        // dn = raw·min(12/visH,1) < 15.4 verlangte visH ≥ ~50 m — die alten
        // „lod 0"-Funde waren STUFEN-GEKLEMMTE Arten [Blume/Fels: requested 2,
        // serviert ff.lod=0], deren „Wandern" nur der bpName-identische
        // Hysterese-Quittieren-Pfad war; seit DAS FELD URTEILT sind sie region-
        // privat + B2-geschützt). Kurz warten, dann die NAH-Richtung an einer
        // echten Fern-Baum-Zelle proben — der STÄRKERE Beweis (echter Slot-Tausch).
        let probe = null;
        await window
            .__gebautNach("eine Fern-Baum-Zelle", { fertig: () => !!(probe = sucheProbe(true)), takt: streuSchritt, max: 170 });
        if (!probe) probe = sucheProbe(false);
        res.probeGefunden = !!probe;
        if (!probe) return res;
        const lodVorher = probe.lod;
        const bpVorher = probe.bpName;
        const slotsVorher = JSON.stringify(probe.slots);
        // ── L: der Spieler springt — nahe Zelle: WEIT weg (Stufe steigt);
        //       ferne Zelle: NAH heran (Stufe sinkt). Nah-Ziel 20 m: die
        //       Wahrnehmungs-Distanz dn ≤ raw (min(12/visH,1) ≤ 1) ⇒ raw 20 <
        //       thresh12 − hysteresis = 22.6 ⇒ der Abstieg 2→1 ist für JEDE
        //       Sichthöhe garantiert. ──
        const dx = probe.x - pm.x;
        const dz = probe.z - pm.z;
        const d0 = Math.hypot(dx, dz);
        const naeher = lodVorher >= 2;
        const ziel = naeher ? 20 : 340;
        pm.x = probe.x - (dx / (d0 || 1)) * ziel;
        pm.z = probe.z - (dz / (d0 || 1)) * ziel;
        // Der Wander-Loop YIELDET deadline-basiert: der Zellen-Chokepoint lässt
        // bei ladendem Ziel-Asset die alte Stufe stehen (ctxNoDefer — „Retry in
        // der nächsten Runde"); ein rein synchroner Loop könnte den async
        // Foundry-Stufen-Bau nie ankommen sehen (die Nah-Richtung 2→1/0 wäre
        // strukturell unmöglich). Dieselbe 30-s-Warte-Disziplin wie der
        // F-Block (Flat lädt async, 100-ms-Polls).
        const lodTakt = (zahl, bis) => async () => {
            for (let i = 0; i < 40 && !bis(); i++) r._tickScatterLod(pm, 8, zahl);
            await sleep(150);
        };
        const gewandelt = () => probe.lod !== lodVorher;
        await window.__gebautNach("der Stufen-Wandel der Probe", { fertig: gewandelt, takt: lodTakt(400, gewandelt), max: 300 });
        const wandel = gewandelt() ? 1 : 0;
        res.l = {
            lodVorher,
            lodNachher: probe.lod,
            gewandert: wandel === 1 && (naeher ? probe.lod < lodVorher : probe.lod > lodVorher),
            // Stufen-GEKLEMMTE Arten (bpName über die Stufen identisch) tauschen
            // BEWUSST keine Slots (Review-Fix B2 — kein Churn); nur ein echter
            // Gestalt-Wechsel (bpName anders) muss die Slots re-allozieren.
            bpGewechselt: probe.bpName !== bpVorher,
            slotsGetauscht: JSON.stringify(probe.slots) !== slotsVorher,
            slotsLeben: Array.isArray(probe.slots) && probe.slots.length > 0,
        };
        // ── H: erst die Sprung-Adaption DRÄNIEREN (alle Zellen wandern auf die
        //       neue Distanz), dann: ohne Bewegung realloziert der Tick NICHTS
        //       mehr (Hysterese stabil, kein Flacker-Churn) ──
        let leer = 0;
        for (let i = 0; i < 600 && leer < 3; i++) {
            leer = r._tickScatterLod(pm, 16, 800) === 0 ? leer + 1 : 0;
        }
        let re = 0;
        for (let i = 0; i < 40; i++) re += r._tickScatterLod(pm, 16, 800);
        res.h = { nachlauf: re, drainiert: leer >= 3 };
        // ── D (DIE RÜCK-WANDERUNG, der B2-Einweg-Freeze fällt): eine
        //     private Boden-Zelle (@reg-Slots, lod<2) demotet auf die Fern-Stufe,
        //     sobald der Spieler geht — Slots wandern nach @s:, die private Hülle
        //     leert sich und wird ge-reapt (die EINE Reap-Frage); der Ursprungs-
        //     Sphere-Hazard fiel mit dem freien Slot (die Gruppe ist dicht). Probe
        //     NUR an ZWEI-stufigen Arten (strauch/eiche) — geklemmte Arten
        //     (Blume/Fels) quittieren bewusst ohne Slot-Tausch. ──
        const dblk = {};
        try {
            const zweiStufig = (c) =>
                typeof c.bpName === "string" &&
                (c.bpName.startsWith("fscatter:strauch:") || c.bpName.startsWith("fscatter:eiche:"));
            let dz2 = null;
            const zweiNah = () => {
                for (const reg of map.values())
                    for (const c of reg.cells || []) if (c.slots && c.bpName && c.lod < 2 && b2Privat(c) && zweiStufig(c)) return (dz2 = c);
                return null;
            };
            await window
                .__gebautNach("eine nahe zwei-stufige Zelle", {
                    fertig: zweiNah,
                    takt: async () => (streuTakt(), r._tickScatterLod(pm, 8, 800), await sleep(60)),
                    max: 500,
                })
                .catch(() => (dz2 = null)); // keine nahe da: die Probe baut die Voraussetzung (unten)
            // DIE VORAUSSETZUNG WIRD GEBAUT, NICHT ERHOFFT: nach dem L-Sprung stand an der neuen
            // Spieler-Stelle oft keine NAHE zwei-stufige Boden-Zelle (Zensus: 81 Strauch-Zellen, alle Fern-Stufe @s:) —
            // die Probe war Glück der Welt-Lage. Dann tritt der Spieler 8 m an die nächste zwei-stufige Zelle der
            // BODEN-Schichten (nicht die globale Baum-Schicht) und der Takt holt sie auf ihre Nah-Stufe (privat, @reg).
            if (!dz2) {
                const boden = (c) => {
                    const l = r._scatterLayerByName && r._scatterLayerByName.get(c.layer);
                    return !!l && l.kind !== "tree";
                };
                let kand = null,
                    kd = Infinity;
                for (const reg of map.values())
                    for (const c of reg.cells || []) {
                        if (!c.slots || !zweiStufig(c) || !boden(c)) continue;
                        const d = Math.hypot(c.x - pm.x, c.z - pm.z);
                        if (d < kd) {
                            kd = d;
                            kand = c;
                        }
                    }
                dblk.kandidatDistanz = kand ? +kd.toFixed(1) : null;
                if (kand) {
                    pm.x = kand.x - 8;
                    pm.z = kand.z;
                    await window
                        .__gebautNach("der Kandidat in der Nah-Stufe", {
                            fertig: () => kand.lod < 2 && b2Privat(kand),
                            takt: async () => {
                                streuTakt();
                                for (let i = 0; i < 20; i++) r._tickScatterLod(pm, 8, 800);
                                await sleep(100);
                            },
                            max: 450,
                        });
                    if (kand.lod < 2 && b2Privat(kand)) dz2 = kand;
                }
            }
            dblk.zelleGefunden = !!dz2;
            if (dz2) {
                dblk.lodVor = dz2.lod;
                dblk.bpVor = dz2.bpName;
                const privat = (k) => {
                    const at = k.indexOf("@");
                    return at >= 0 && !(k.startsWith("@s:", at));
                };
                const privKeysVor = dz2.slots.map((s) => s.key).filter(privat);
                dblk.privateSlotsVor = privKeysVor.length;
                // Spieler geht: weit weg von der Zelle, aber unter der 480-m-
                // Tick-Grenze (outerM + 96) — die Rück-Wanderung muss greifen.
                pm.x = dz2.x + 420;
                pm.z = dz2.z;
                // Die private Hülle ist eine GETEILTE Gruppe (Art × Gestalt × Stufe × Region): eine Art trägt
                // nur ihre Budget-Gestalten (strauch 1), also teilen sich alle Zellen der Region dieselbe Hülle — der
                // Tick muss die ganze Region demoten, bevor sie leer ist. Gewartet wird auf Zelle UND Hülle.
                const huelleLeer = () =>
                    privKeysVor.every((k) => {
                        const g = r.state.archInstanceGroups && r.state.archInstanceGroups.get(k);
                        return !g || (g.liveCount | 0) === 0;
                    });
                const fern2 = () => dz2.lod === 2 && huelleLeer();
                await window.__gebautNach("die Zelle in der Fern-Stufe", { fertig: fern2, takt: lodTakt(800, fern2), max: 300 });
                dblk.demotet = dz2.lod === 2;
                // Fern-Slots: die Super-Region (Boden-Fernstufen) ODER — die Karte (W6) — die EINE globale Atlas-Gruppe.
                dblk.slotsFern =
                    Array.isArray(dz2.slots) &&
                    dz2.slots.length > 0 &&
                    dz2.slots.every((s) => {
                        if (s.key === r.constructor.IMPOSTOR_ATLAS_GRUPPE) return true;
                        const at = s.key.indexOf("@");
                        return at >= 0 && (s.key.startsWith("@s:", at));
                    });
                // die private Hülle: ge-reapt (weg) oder restlos leer
                dblk.huelleWeg = privKeysVor.every((k) => {
                    const g = r.state.archInstanceGroups && r.state.archInstanceGroups.get(k);
                    return !g || (g.liveCount | 0) === 0;
                });
                // Die Gruppe ist dicht (`_archGroupFree` verdichtet): kein gezeichneter Slot einer
                // privaten Gruppe trägt eine Null-Skala (der freie Slot, der die Kugel verzerrte).
                let ursprungsHazard = 0;
                if (r.state.archInstanceGroups) {
                    for (const [k, g] of r.state.archInstanceGroups) {
                        if (!privat(k) || !g.mesh || !g.mesh.instanceMatrix) continue;
                        const arr = g.mesh.instanceMatrix.array;
                        for (let sl = 0; sl < g.mesh.count; sl++) {
                            const o = sl * 16;
                            if (arr[o] === 0 && arr[o + 5] === 0 && arr[o + 10] === 0) ursprungsHazard++;
                        }
                    }
                }
                dblk.ursprungsHazard = ursprungsHazard;
            }
        } catch (e) {
            dblk.err = String(e && e.message);
        }
        res.d = dblk;
        // ── F: A/B durch DIESELBE Pipe ──
        // Gestreute Fern-Geometrie (die Gras-Fernstufe; die Karten zeichnen seit W6 in der EINEN Atlas-Gruppe —
        // eigene Probe) über ein 4×4-Region-Raster: S=1 reproduziert das alte
        // per-Region-Keying (VORHER), die Produktions-Konstante keyt SUPER-REGIONEN
        // (NACHHER). Zählung = region-gekeyte Fern-Wrapper (+ Batches); danach Remove →
        // die Empty-Dispose muss BEIDE Welten restlos räumen (Slot-Bilanz dicht).
        const fern = {};
        try {
            const AR = r.constructor; // die Klasse (Statics) — window trägt nur die Instanz
            const S0 = AR.SCATTER_FERN_SUPERREGION;
            fern.s0 = S0;
            // Unit: die EINE Key-Funktion — fern+Region → Super-Region; nicht-fern/null/gemappt unberührt.
            fern.unit =
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, "7,9") ===
                    "s:" + Math.floor(7 / S0) + "," + Math.floor(9 / S0) &&
                r._archFernRegionKey("fscatter:eiche:3:2", {}, "5,5") ===
                    "s:" + Math.floor(5 / S0) + "," + Math.floor(5 / S0) &&
                r._archFernRegionKey("busch_hazel", { leafKey: "f:strauch|1|1:0" }, "7,9") === "7,9" &&
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, null) === null &&
                r._archFernRegionKey("x", { leafKey: "fimp:a" }, "s:1,2") === "s:1,2";
            // Die T3-Kugel liest die Konstante: mit verstelltem Hebel (3) misst die Super-Region-Kugel 3 Regionen, die Region eine.
            {
                const M = AR.ARCH_REGION_M;
                let bS;
                AR.SCATTER_FERN_SUPERREGION = 3;
                try { bS = r._archRegionBundleFor("s:9001,9001"); } finally { AR.SCATTER_FERN_SUPERREGION = S0; }
                const b1 = r._archRegionBundleFor("9001,9001"), rad = (b) => b && b.userData.cullSphere && b.userData.cullSphere.radius;
                fern.kugel = Math.abs(rad(bS) - (M * 3 * Math.SQRT1_2 + 140)) < 1e-6 && Math.abs(rad(b1) - (M * Math.SQRT1_2 + 140)) < 1e-6;
                for (const k of ["s:9001,9001", "9001,9001"]) { const bg = r.state._regionBundles.get(k); r.state._regionBundles.delete(k); if (bg && bg.parent) bg.parent.remove(bg); }
            }
            // Die Fern-Flats über die ECHTE Pipe ziehen (die Geometrie lädt async): die Gras-Fernstufe (Geometrie — sie
            // trägt die Super-Region-Diät) und die strauch-Karte (W6: EINE globale Atlas-Gruppe, gleich welche Region).
            let flat = null,
                karte = null;
            await window
                .__gebautNach("gras und strauch in L2", {
                    fertig: () => {
                        flat = r._foundryFlattenFor({ seed: 7 }, "gras", 2);
                        karte = r._foundryFlattenFor({ seed: 7 }, "strauch", 2);
                        return !!(flat && flat.instanceable && karte && karte.instanceable);
                    },
                    takt: () => sleep(100),
                    max: 300,
                });
            fern.flat = !!(flat && flat.instanceable && flat.lod === 2 && karte && karte.instanceable && karte.lod === 2);
            if (fern.flat) {
                // DIE KARTEN-DIÄT: 16 strauch-Karten in 16 Regionen → genau EINE Gruppe (die Atlas-Gruppe), Bilanz dicht.
                const G = AR.IMPOSTOR_ATLAS_GRUPPE;
                const lebend = () => {
                    const g = r.state.archInstanceGroups.get(G);
                    return g ? g.liveCount | 0 : 0;
                };
                const vorK = new Set(r.state.archInstanceGroups.keys()),
                    lebendVor = lebend();
                const alleK = [];
                for (let gx = 0; gx < 4; gx++)
                    for (let gz = 0; gz < 4; gz++) {
                        const sl = r._scatterInstanceAdd(
                            "fscatter:strauch:1:2",
                            (900 + gx) * AR.ARCH_REGION_M + 8,
                            0,
                            (900 + gz) * AR.ARCH_REGION_M + 8,
                            0,
                            1,
                            null,
                            900 + gx + "," + (900 + gz),
                            karte
                        );
                        if (sl) alleK.push(sl);
                    }
                const neuK = [...r.state.archInstanceGroups.keys()].filter((k) => !vorK.has(k) && /(^|#)fimp:/.test(k));
                const slotKeys = new Set(alleK.flat().map((x) => x.key));
                fern.karten = {
                    instanzen: lebend() - lebendVor,
                    gruppen: slotKeys.size,
                    gruppe: [...slotKeys][0] || null,
                    neueKartenGruppen: neuK.length,
                };
                // ── K: die Karten in der Wahl (W7) — Linsen-Kameras über den 16 Karten (die Fixtur liegt fern jeder Welt-Karte).
                {
                    const T = window.THREE;
                    const g = r.state.archInstanceGroups.get(G);
                    const S = r._kaskadenSchmier();
                    const fixtur = new Set(alleK.flat());
                    const blick = (x, y, z, lx, ly, lz, fov = 30, aspekt = 1) => {
                        const cam = new T.PerspectiveCamera(fov, aspekt, 1, 6000);
                        cam.position.set(x, y, z);
                        cam.lookAt(lx, ly, lz);
                        cam.updateMatrixWorld(true);
                        cam.updateProjectionMatrix();
                        S.frustum.setFromProjectionMatrix(
                            new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse),
                            cam.coordinateSystem
                        );
                        r._passWahlLage(S, cam, -1);
                        r._instanzWahlPass("haupt", S);
                        const n = g.mesh.count;
                        // die Treue: jede gezeichnete Instanz ist eine Karte der Fixtur, jede Marke trägt ihren Slot
                        let treu = true;
                        for (let i = 0; i < g.liveCount; i++) {
                            const ref = g.slotRef[i];
                            if (!ref || ref.slot !== i || (i < n && !fixtur.has(ref))) treu = false;
                        }
                        r._instanzWahlZurueck(S.wahlHaupt);
                        return { n, treu, zurueck: g.mesh.count === g.liveCount };
                    };
                    const mx = (900 + 2) * AR.ARCH_REGION_M,
                        mz = (900 + 2) * AR.ARCH_REGION_M;
                    const kuss = {
                        wahl: !!g && g.wahl === "haupt" && g.wahlStufe === "karte" && !!g.mesh.parent,
                    };
                    const a = blick(mx, 2400, mz, mx, 0, mz + 1e-3);
                    kuss.alle = a.n;
                    kuss.treu = a.treu && a.zurueck;
                    kuss.himmel = blick(mx, 2400, mz, mx, 9000, mz + 1e-3).n;
                    // die Westhälfte (gx 0, 1 — x 230 408 und 230 664): eine schmale Kamera hoch über ihrer Mitte; der Blick nach
                    // unten trägt Welt-z in der Höhe des Bilds (60°: ±520 m deckt alle vier Reihen), Welt-x in der Breite
                    // (Aspekt 0,5: ±260 m deckt ±128 m, nicht die Ostspalte +384 m)
                    const wx = (900 + 0.5) * AR.ARCH_REGION_M + 8,
                        wz = (900 + 1.5) * AR.ARCH_REGION_M + 8;
                    const w = blick(wx, 900, wz, wx, 0, wz + 1e-3, 60, 0.5);
                    kuss.westBreite = w.n;
                    kuss.treu = kuss.treu && w.treu && w.zurueck;
                    // der Selbsttest: ohne das Gesetz trifft jede Karte — der Himmels-Blick fällt rot
                    r._passTrifft = () => true;
                    try {
                        kuss.selbsttestHimmel = blick(mx, 2400, mz, mx, 9000, mz + 2e-3).n;
                    } finally {
                        delete r._passTrifft;
                    }
                    fern.kartenWahl = kuss;
                }
                for (const sl of alleK) r._scatterFreeSlots(sl);
                fern.karten.leck = lebend() - lebendVor;
                const R = AR.ARCH_REGION_M;
                // der platzierte Bau keyt global — die Super-Region ist ein Gesetz der STREU. Die Fixtur
                // streut das Fern-Flat (Name `fscatter:…:2` = Fern-Stufe) über den echten Streu-Eintritt in 4×4
                // Regionen und räumt über den echten Streu-Austritt.
                const PROBE = "fscatter:diaetprobe:0:2";
                const zaehle = () => {
                    let w = 0;
                    for (const k of r.state.archInstanceGroups.keys()) if (k.startsWith(PROBE + "#") && k.includes("@")) w++;
                    return { w };
                };
                const welt = (S) => {
                    AR.SCATTER_FERN_SUPERREGION = S;
                    const vor = zaehle();
                    const alle = [];
                    for (let gx = 0; gx < 4; gx++)
                        for (let gz = 0; gz < 4; gz++) {
                            const slots = r._scatterInstanceAdd(
                                PROBE,
                                (900 + gx) * R + 8,
                                0,
                                (900 + gz) * R + 8,
                                0,
                                1,
                                null,
                                900 + gx + "," + (900 + gz),
                                flat
                            );
                            if (slots) alle.push(slots);
                        }
                    const mit = zaehle();
                    for (const slots of alle) r._scatterFreeSlots(slots);
                    const nach = zaehle();
                    return { gruppen: mit.w - vor.w, leck: nach.w - vor.w };
                };
                const a = welt(1); // VORHER: per-Region (die V18.300/V18.303-Welt)
                const b = welt(S0); // NACHHER: Super-Region (Produktions-Konstante)
                AR.SCATTER_FERN_SUPERREGION = S0;
                fern.vorher = a.gruppen;
                fern.nachher = b.gruppen;
                fern.leckA = a.leck;
                fern.leckB = b.leck;
            }
        } catch (e) {
            fern.err = String((e && e.message) || e);
        }
        res.f = fern;
        return res;
    });

    console.log("=== V18.464 SCATTER-LOD — der Fernwald folgt der LIVE-Distanz ===");
    check("Scatter-Zellen gebaut", out.cells > 40, `zellen=${out.cells}`);
    check("P: die Promotion erreicht die Zelle jenseits der Region-Grenze (0,85·pr), die ferne (1,7·pr) nie", out.p === true);
    check("Probe-Zelle gefunden", out.probeGefunden === true);
    if (out.l) {
        check(
            `L: die Stufe WANDERT nach dem Weg-Sprung (${out.l.lodVorher} → ${out.l.lodNachher})`,
            out.l.gewandert === true
        );
        check(
            "L: Slots re-alloziert bei Gestalt-Wechsel (bzw. bewusst behalten bei geklemmter Art)",
            out.l.slotsLeben && (out.l.bpGewechselt ? out.l.slotsGetauscht : !out.l.slotsGetauscht),
            `bpGewechselt=${out.l.bpGewechselt} getauscht=${out.l.slotsGetauscht}`
        );
    } else check("L: LOD-Block erreicht", false);
    if (out.h)
        check(
            "H: nach der Sprung-Adaption kein Realloc-Churn (Hysterese stabil)",
            out.h.drainiert === true && out.h.nachlauf === 0,
            `nachlauf=${out.h.nachlauf} drainiert=${out.h.drainiert}`
        );
    else check("H: Hysterese-Block erreicht", false);
    if (out.d) {
        check(
            "D: private Boden-Zelle GEFUNDEN (B2-Population, zwei-stufig)",
            out.d.zelleGefunden === true,
            out.d.err || `bp=${out.d.bpVor || "—"} lodVor=${out.d.lodVor} Kandidat ${out.d.kandidatDistanz == null ? "direkt" : out.d.kandidatDistanz + " m"}`
        );
        if (out.d.zelleGefunden) {
            check(
                "D: DIE RÜCK-WANDERUNG — die Zelle demotet auf die Fern-Stufe, sobald der Spieler geht",
                out.d.demotet === true,
                `lod ${out.d.lodVor} → ${out.d.demotet ? 2 : "blieb"}`
            );
            check(
                "D: die Slots wandern nach @s: (Super-Region) bzw. in die EINE Karten-Gruppe, die private Hülle leert/reapt",
                out.d.slotsFern === true && out.d.huelleWeg === true,
                `slotsFern=${out.d.slotsFern} hülleWeg=${out.d.huelleWeg} (private Slots vor: ${out.d.privateSlotsVor})`
            );
            check(
                "D: kein Ursprungs-Sphere-Hazard (kein Null-Skala-Slot in einer dichten Gruppe)",
                out.d.ursprungsHazard === 0,
                `hazard-Slots=${out.d.ursprungsHazard}`
            );
        }
    } else check("D: Rück-Wanderungs-Block erreicht", false);
    if (out.f) {
        check(
            "F: die EINE Fern-Key-Funktion (Unit: fern→Super-Region, nicht-fern/null/gemappt unberührt)",
            out.f.unit === true,
            out.f.err || ""
        );
        check("F: die T3-Kugel liest die Konstante (Hebel 3 → Radius über 3 Regionen, die Region über eine)", out.f.kugel === true, out.f.err || "");
        check("F: Gras-Fernstufe + strauch-Karte über die echte Pipe (lod=2)", out.f.flat === true, out.f.err || "");
        const K = out.f.karten || {};
        check(
            `F: DIE KARTEN-DIÄT (W6) — 16 Karten in 16 Regionen zeichnen in EINER Gruppe (${K.gruppe || "—"}), Bilanz dicht`,
            K.instanzen === 16 && K.gruppen === 1 && K.gruppe === "impostor#fimp:atlas" && K.leck === 0,
            JSON.stringify(K)
        );
        const KS = out.f.kartenWahl || {};
        check(
            "K: DIE KARTEN IN DER WAHL (W7) — die Atlas-Gruppe ist eine Gruppe der Instanz-Wahl und zeichnet die Karten, die das Gesetz trifft (über den 16: alle, Himmel: keine), jede gezeichnete Instanz eine Karte der Fixtur",
            KS.wahl === true && KS.alle === 16 && KS.himmel === 0 && KS.treu === true,
            JSON.stringify(KS)
        );
        check(
            "K: … eine schmale Linse über der Westhälfte sieht genau deren 8 Karten",
            KS.westBreite === 8,
            `${KS.westBreite}`
        );
        check(
            "K: Selbsttest — eine Wahl ohne das Gesetz legt jede Karte in den Himmels-Blick, die Linse nennt es",
            KS.selbsttestHimmel >= 16,
            `ohne Gesetz ${KS.selbsttestHimmel} Karten im Himmels-Blick (Soll mit Gesetz 0)`
        );
        check(
            `F: DIE DIÄT — 4×4 Regionen: per-Region ${out.f.vorher} → Super-Region ${out.f.nachher} Fern-Gruppen (≥4× weniger)`,
            Number.isFinite(out.f.vorher) &&
                Number.isFinite(out.f.nachher) &&
                out.f.vorher >= 16 &&
                out.f.nachher >= 1 &&
                out.f.vorher >= 4 * out.f.nachher,
            `S=${out.f.s0}`
        );
        check(
            "F: Slot-Bilanz dicht — die Empty-Dispose räumt BEIDE Welten restlos",
            out.f.leckA === 0 && out.f.leckB === 0,
            `leckA=${out.f.leckA} leckB=${out.f.leckB}`
        );
    } else check("F: Fern-Diät-Block erreicht", false);

    await browser.close();
    server.close();
    wandEnde(errs, "die Scatter-Stufen folgen der LIVE-Distanz (Re-Allokation über den EINEN Zellen-Chokepoint, Hysterese churn-frei), die Promotion liest den ganzen Region-Fächer, und die Fern-Gruppen tragen die Super-Region-Diät (EIN Keying-Chokepoint, Bilanz dicht).");
});
