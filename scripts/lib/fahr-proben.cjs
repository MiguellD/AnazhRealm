"use strict";
// scripts/lib/fahr-proben.cjs — die Seiten-Probe der Leben-Prüfung „Fahren“ (gate:fahr-leben), am Domänen-Tag Fahrt geteilt
// (Datei-Decke 4 000, PFLICHT-OFFEN D(3)): eine Seiten-Funktion, die scripts/diag-fahr-leben.cjs per page.evaluate fährt.

// ── DIE PROBE IN DER SEITE (Funktionsrumpf; r = die Welt). Fährt den echten Frame. ──
async function probeLeben(expected) {
    const res = {};
    const dl0 = performance.now() + 60000;
    while (
        (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
        performance.now() < dl0
    )
        await new Promise((r) => setTimeout(r, 100));
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 50000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await new Promise((r2) => setTimeout(r2, 80));
    }
    const P = Object.getPrototypeOf(r);
    const DT = 1 / 60;
    // Frame-Zeiten (ms): Frames ohne (8,3), mit einem (16,7 · 20 · 11,1) und mit zwei Sim-Schritten (25 · 33,3).
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    // DIE BAHN-WACHE (Fixture der Fahr-Stationen S2 · S3 · S4): solange eine Station fährt, hält sie ihre Bahn frei — was
    // dort mit einer Hülle steht oder WÄHREND der Fahrt hineinwächst (die Promotion um den Spieler macht Streu-Zellen zu
    // Bäumen, deren Stamm im Weltmaß den Wagen hält), fällt nach jedem Bild. Gemessen wird die Fahr-Physik am Gelände,
    // nie der Wald: in der CI hing es am Takt, ob ein Baum vor oder nach der Bahn-Wahl kam (S3 bei (-1027, -801) nach
    // 3,2 m gehalten, Lauf 37713513122; S4 hob nach „Bahn geräumt 8" nicht ab, Lauf 37710018372).
    let bahnWache = null;
    const frame = (i) => {
        tMs += MUSTER[i % MUSTER.length];
        r._gameLoopTick(tMs);
        const w = bahnWache;
        if (!w) return;
        for (const e of st.architectures.slice()) {
            if (!e || !e.blockerAABBs || !e.position || /^fahrzeug_/.test(e.type || "")) continue;
            const dx = e.position.x - w.sx;
            const dz = e.position.z - w.sz;
            const l = dx * w.ux + dz * w.uz;
            if (l > -6 && l < w.len && Math.abs(dx * w.uz - dz * w.ux) < w.quer) {
                r.removeArchitecture(e);
                w.n++;
                (w.typen || (w.typen = [])).push(e.type + "@" + l.toFixed(1));
            }
        }
    };
    // DIE ZÄHLER am echten Takt: der Teleport-Zweig des Akkumulators (exakt seine Bedingung), der Weg je Sim-Schritt,
    // und die Spur je Sim-Schritt (Eingabe + Fahr-Zustand) für den Labor-Vergleich.
    const z = { teleport: 0, schritte: 0, luft: 0, simWeg: 0, an: false, spur: null, ent: null };
    // DIE ECHTE VERTIKALE (Gegenprüfung 07.10.: `isInAir` ist im Sattel bedingungslos geerdet — die alte Zählung konnte nie
    // mehr rot werden). Nach jedem Sim-Schritt: (a) der Reiter sitzt auf dem Sitz seines Werks (Basis − 0,5 + Sitz-Höhe +
    // Hub der Feder, ±0,05 m), (b) ein Gesetz-Wagen, den der Kern geerdet nennt, steht auf mindestens einem seiner vier
    // Aufstandspunkte (kein Punkt mehr als 0,05 m über seinem Boden) — beides misst die Lage selbst —, und (c) steht das
    // Werk, gilt der Reiter nicht als in der Luft (der Befund F-D10: 421 von 421 Schritten; die Wand gegen den Rückfall).
    const inDerLuft = () => {
        const pl = st.player;
        const me = pl && pl.mountedArch !== null && pl.mountedArch !== undefined ? r._mountedEntry : null;
        if (!me || !me.position) return !!st.isInAir;
        const fz = me._fahr;
        if (st.isInAir && !(fz && fz.luft)) return true;
        const sitz = Number.isFinite(me._sitzHeight) ? me._sitzHeight : 0;
        const hub = fz && Number.isFinite(fz.fHub) ? fz.fHub : Number.isFinite(me._rideHeave) ? me._rideHeave : 0;
        if (Math.abs(st.playerMesh.position.y - (me.position.y - 0.5 + sitz + hub)) > 0.05) return true;
        if (!fz || fz.luft || !Number.isFinite(fz.y) || typeof r._rittAufstand !== "function") return false;
        const a = r._rittAufstand(me);
        const boden = r._fahrBoden(me);
        const yk = (Number.isFinite(me._rideYaw) ? me._rideYaw : 0) - Math.PI / 2; // der Rahmen des Kerns
        const fx = Math.cos(yk);
        const fzz = -Math.sin(yk);
        const lx = -Math.sin(yk);
        const lz = -Math.cos(yk);
        let minSpalt = Infinity;
        for (const l of [a.vorn, a.hinten])
            for (const q of [a.quer, -a.quer]) {
                const px = me.position.x + fx * l + lx * q;
                const pz = me.position.z + fzz * l + lz * q;
                const y = fz.y + Math.tan(fz.steig || 0) * l + Math.tan(fz.wank || 0) * q;
                minSpalt = Math.min(minSpalt, y - boden(px, pz));
            }
        return minSpalt > 0.05;
    };
    r._loopFixedStep = function (realDt, ct) {
        const m = st.playerMesh;
        if (z.an && st._fixedSimPos && !(st._fixedRenderPos && m.position.equals(st._fixedRenderPos))) z.teleport++;
        return P._loopFixedStep.call(this, realDt, ct);
    };
    r._stepFixedSim = function (simTime, dt) {
        const m = st.playerMesh.position;
        const x0 = m.x;
        const z0 = m.z;
        const k = st.keys;
        const e = {
            throttle: k.w ? 1 : 0,
            brake: k.s ? 1 : 0,
            steer: (k.a ? 1 : 0) - (k.d ? 1 : 0),
            hand: !!k.shift,
        };
        P._stepFixedSim.call(this, simTime, dt);
        if (z.an) {
            z.simWeg += Math.hypot(m.x - x0, m.z - z0);
            z.schritte++;
            if (inDerLuft()) z.luft++;
        }
        if (z.spur && z.ent && z.ent._fahr) {
            const q = z.ent._fahr;
            z.spur.push({ e, dt, x: q.x, z: q.z, yaw: q.yaw, y: q.y, luft: q.luft, kontakt: z.kontakt });
        }
    };
    // Der EINE Kontakt-Löser: was er in diesem Sim-Schritt der Fahrt nahm (Lage oder Geschwindigkeit ≠ v·dt), ist kein
    // Fahr-Schritt — die Labor-Spur übernimmt dort die Lage der Welt (gezählt als Kontakt-Schritt).
    r._stepCharacter = function (delta, ct) {
        const m = st.playerMesh.position;
        const v = st.playerVel;
        const x0 = m.x;
        const z0 = m.z;
        const vx = v.x();
        const vz = v.z();
        P._stepCharacter.call(this, delta, ct);
        const dtc = Math.min(0.1, Math.max(0.0001, delta));
        const anders =
            Math.abs(m.x - (x0 + vx * dtc)) > 1e-9 ||
            Math.abs(m.z - (z0 + vz * dtc)) > 1e-9 ||
            Math.abs(v.x() - vx) > 1e-9 ||
            Math.abs(v.z() - vz) > 1e-9;
        z.kontakt = anders ? { x: m.x, z: m.z, vx: v.x(), vz: v.z() } : null;
    };
    const aufraeumen = () => {
        delete r._loopFixedStep;
        delete r._stepFixedSim;
        delete r._stepCharacter;
    };
    const tasten = (w, a) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
        st.keys.a = !!a;
    };
    const hh = (a, b) => r.getTerrainHeightAt(a, b);
    const nass = (a, b) => {
        const ws = r._atlasWaterLevelAt(a, b, hh(a, b)); // der Spiegel des Gesetzes (wie gate:vehicle-drive)
        return Number.isFinite(ws) && ws > hh(a, b) - 0.3;
    };
    // Die Strecke: trocken, die kleinste Stufe (dieselbe Suche wie gate:vehicle-drive B-e), Fahrt in +x — und EBEN: die
    // Mess-Wiese war eben, seit K16 liegt sie am Hang (quer 0,31 m je m, die Strecke von damals 0,21 m Stufe je 2 m). Der
    // nächste Ring (32 m, bis 512 m) mit einer Strecke, deren Stufe ≤ 0,16 m je 2 m und deren Quergefälle ≤ 0,05 m je m
    // ist, darin die kleinste Stufe.
    const mo = expected.messort;
    let start = null;
    for (let ring = 0; ring <= 16 && !start; ring++)
        for (let k = 0; k < (ring ? 8 : 1); k++) {
            const cx = mo[0] + Math.cos((k * Math.PI) / 4) * ring * 32;
            const cz = mo[1] + Math.sin((k * Math.PI) / 4) * ring * 32;
            let trocken = true;
            let stufe = 0;
            for (const dz of [-3, 0, 3]) {
                let vor = null;
                for (let s = 0; s <= 36 && trocken; s++) {
                    const hx = hh(cx + s * 2, cz + dz);
                    if (!Number.isFinite(hx) || nass(cx + s * 2, cz + dz)) trocken = false;
                    if (vor !== null) stufe = Math.max(stufe, Math.abs(hx - vor));
                    vor = hx;
                }
            }
            let quer = 0;
            for (let s = 0; s <= 36 && trocken; s++)
                quer = Math.max(quer, Math.abs(hh(cx + s * 2, cz + 3) - hh(cx + s * 2, cz - 3)) / 6);
            if (trocken && stufe <= 0.16 && quer <= 0.05 && (!start || stufe < start.stufe))
                start = { x: cx, z: cz, stufe, quer };
        }
    res.start = start;
    if (!start) {
        aufraeumen();
        return res;
    }
    // DIE ANKUNFT (K55-2): eine Station an einem neuen Ort misst erst, wenn die Welt um den Spieler steht — der Ring der Chunks
    // ändert sich 80 Frames lang nicht, kein Bau wartet (höchstens 3000 Frames). Die Orte der Stationen kommen aus der Welt und
    // liegen Hunderte Meter auseinander (die Mess-Wiese, das Dorf, die Mitte der Welt): ohne Ankunft fuhr L1 an einen
    // Glutbrunnen ohne Kontakt, L6 setzte den Spieler 1,68 m in den Wagen, und L8 maß, während die Welt um die Gasse streamte.
    const ankommen = async (x, zz) => {
        st.playerMesh.position.set(x, hh(x, zz) + 2, zz);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        let stabil = 0;
        let zuletzt = -1;
        for (let i = 0; i < 3000; i++) {
            frame(i);
            const n = st.voxelChunks ? st.voxelChunks.size : 0;
            if (n === zuletzt) stabil++;
            else {
                stabil = 0;
                zuletzt = n;
            }
            if (i > 60 && stabil > 80 && !(st.voxelMeshPending && st.voxelMeshPending.size > 0)) break;
            if (i % 10 === 0) await new Promise((ok) => setTimeout(ok, 0));
        }
    };
    // Ein Werk setzen, aufsitzen, einschwingen. `fahrt` = Fahrt-Richtung (sin, cos); ein Studio-Fahrzeug liegt längs x.
    const setzen = async (typ, x, zz, fahrt, vorAufsitzen) => {
        st.playerMesh.position.set(x, hh(x, zz) + 1.2, zz);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const rotY = typ.startsWith("fahrzeug_") ? fahrt - Math.PI / 2 : fahrt;
        const e = r.spawnArchitecture(
            typ,
            { x, y: hh(x, zz) + 0.5, z: zz },
            { silent: true, precise: true, rotationY: rotY }
        );
        if (!e) return null;
        const dlB = performance.now() + 45000;
        while (!e.instanced && !e.mesh && performance.now() < dlB) {
            r._rebuildArchitectureMesh(e);
            if (e.instanced || e.mesh) break;
            await new Promise((r3) => setTimeout(r3, 200));
        }
        if (vorAufsitzen) vorAufsitzen(e);
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) return null;
        tasten(false);
        for (let i = 0; i < 12; i++) frame(i); // einschwingen (Sitz, Ebene, Interpolation)
        return e;
    };
    const weg = (e) => {
        r.dismountArchitecture();
        r.removeArchitecture(e);
    };
    const gierUnwrap = (e) => (Number.isFinite(e._rideYaw) ? e._rideYaw : 0);
    // Eine Fahrt: n Frames mit/ohne W; zählt Teleport · Sim-Weg · Fahr-Weg · Luft · Gier (gesamt und in Frames ohne
    // Sim-Schritt — dort darf nichts den Wagen drehen).
    const fahrt = (e, n, w) => {
        tasten(w);
        z.teleport = 0;
        z.schritte = 0;
        z.luft = 0;
        z.simWeg = 0;
        z.an = true;
        let fahrWeg = 0;
        let px = e.position.x;
        let pz = e.position.z;
        let g0 = gierUnwrap(e);
        let gier = 0;
        let gierFrame = 0;
        for (let i = 0; i < n; i++) {
            const s0 = z.schritte;
            frame(i);
            fahrWeg += Math.hypot(e.position.x - px, e.position.z - pz);
            px = e.position.x;
            pz = e.position.z;
            const g = gierUnwrap(e);
            let d = g - g0;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            gier += Math.abs(d);
            if (z.schritte === s0) gierFrame += Math.abs(d);
            g0 = g;
        }
        z.an = false;
        tasten(false);
        return {
            gestartet: true,
            frames: n,
            teleport: z.teleport,
            schritte: z.schritte,
            luft: z.luft,
            simWeg: z.simWeg,
            fahrWeg,
            gierGrad: (gierFrame * 180) / Math.PI,
            gierGesamt: (gier * 180) / Math.PI,
            v: st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0,
        };
    };
    try {
        // (1) Der GT geradeaus, W gehalten (Fahrt +x).
        const gt = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        res.gt = gt ? fahrt(gt, 240, true) : { gestartet: false };
        // DIE VERTIKALE SIEHT IHRE TÄTER (am lebenden Ritt): (a) der Reiter 0,3 m über dem Sitz, (b) der geerdete Wagen
        // 0,3 m über seinem Boden (im Stand, der Kern nennt ihn geerdet) — je 10 Frames mit einem Eingriff nach dem
        // Ritt-Schritt; die Zählung muss feuern.
        if (gt && typeof P._rittSchritt === "function") {
            const eingriff = (fn, w) => {
                r._rittSchritt = function (dt) {
                    P._rittSchritt.call(this, dt);
                    fn();
                };
                const m = fahrt(gt, 10, w);
                delete r._rittSchritt;
                return m.luft;
            };
            res.luftTaeter = {
                sitz: eingriff(() => {
                    st.playerMesh.position.y += 0.3;
                }, true),
                wagen: (() => {
                    // erst steht er (die Fahrt fällt, 30 Frames ohne Taste: Halt am Stand)
                    if (gt._fahr) {
                        gt._fahr.vlong = 0;
                        gt._fahr.vlat = 0;
                        gt._fahr.yawRate = 0;
                        gt._fahr.vy = 0; // auch die Steig-Rate des Hangs (sonst hüpft er aus dem Stand)
                    }
                    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                    fahrt(gt, 30, false);
                    return eingriff(() => {
                        if (gt._fahr && !gt._fahr.luft) {
                            gt._fahr.y += 0.3;
                            gt.position.y += 0.3;
                            st.playerMesh.position.y += 0.3;
                        }
                    }, false);
                })(),
            };
        }
        if (gt) weg(gt);
        // (2) Am Hang ohne Taste: der GT steht bergauf (der Befund: rollte zurück und drehte sich 84°). Der Hang kommt aus der
        // Welt (welt-orte `hang`, K55-2 — bis dahin ±48 m um die Mess-Wiese, die flache Aue trug keinen): das Gefälle über ±3 m
        // 0,2–0,45 (11,3–24,2°), gleichmäßig — 6 m talwärts noch ≥ 0,15 (8,5°) —, trocken.
        const grad = (t) => (Math.atan(t) * 180) / Math.PI;
        const hangOrt = window.__weltOrt("hang", {
            min: grad(0.2),
            max: grad(0.45),
            basis: 3,
            bergab: [6, grad(0.15)],
            rMax: 800,
        });
        const hang = hangOrt
            ? { x: hangOrt.x, z: hangOrt.z, g: Math.tan((hangOrt.neigung * Math.PI) / 180), fahrt: hangOrt.gier }
            : null;
        res.hang = hang;
        if (hang) {
            const gh = await setzen("fahrzeug_gt", hang.x, hang.z, hang.fahrt);
            res.gtHang = gh ? fahrt(gh, 180, false) : { gestartet: false };
            if (gh) weg(gh);
        }
        // (3) Das Pferd: der richtungs-folgende Ritt ohne Lenk-Gesetz (W in Blick-Richtung +x).
        st.yaw = Math.PI / 2;
        const ross = await setzen("reittier_holzross", start.x, start.z, Math.PI / 2);
        res.ross = ross ? fahrt(ross, 180, true) : { gestartet: false };
        if (ross) weg(ross);

        // ═══ S — DIE STATIONEN (Q13) ═══
        const S = (res.stationen = { kern: !!(VC && typeof VC.fahrSchritt === "function") });
        // R — DIE RÄDER IN DER INSTANZ (Q13 F-D8): dieselbe Gerade; W (1,5 s), dann S (Vollbremsung, 1 s), dann W + A.
        // Je Sim-Schritt die Rad-Leaves (`lf.rad`): ihre Matrix RELATIV zum Aufbau (dreht das Rad? lenkt es?) und der
        // Aufstand (Naben-Mitte − radR gegen den Boden). Ohne Rad-Leaves (die starre Instanz) misst die Linse die Rad-
        // Punkte der Aufbau-Matrix (fAx/rAx × ±Spur/2) — der Befund: kein Rad rollt oder lenkt, beim Bremsen tauchen die
        // Vorderräder 7,4–11,1 cm in den Boden.
        const gR = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (gR) {
            const preset = r._foundryPresetForEntry(gR);
            const flat = r._foundryFlattenFor(
                gR,
                preset,
                Number.isFinite(gR._servedLod) ? gR._servedLod : gR._lodLevel
            );
            const hu = r._fahrzeugGesetzFor(gR).drive.huelle;
            const radR = hu.radR * (Number.isFinite(gR.scale) ? gR.scale : 1);
            const rad = [];
            // die STEHENDEN Rad-Leaves (R:s — der Bremssattel hängt an der Nabe: er lenkt mit, rollt aber nie)
            const steh = [];
            if (flat && Array.isArray(flat.leaves) && gR.instSlots)
                for (let i = 0; i < flat.leaves.length && i < gR.instSlots.length; i++)
                    if (flat.leaves[i].rad) (flat.leaves[i].rad.dreht ? rad : steh).push({ i, rd: flat.leaves[i].rad });
            let stehRolle = 0;
            const Bu = new THREE.Matrix4();
            const M = new THREE.Matrix4();
            const B = new THREE.Matrix4();
            const Rel = new THREE.Matrix4();
            const v3 = new THREE.Vector3();
            const relStart = new Map();
            let rolle = 0;
            let lenk = 0;
            let lenkHinten = 0;
            let tauchBremse = 0;
            const spalte = [];
            const spalteSicht = [];
            // die Boden-Karte des gezeichneten Meshs (der EINE Leser `_bodenSichtAt`, bilinear, am Chunk-Rand die des
            // Nachbarn); null ohne Karte
            const sicht = (x, zz) => r._bodenSichtAt(x, zz);
            let phase = "w";
            const P5 = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                P5.call(this, simTime, dt);
                r._tickMountedMovement(dt);
                r._archEntryWorldMatrix(gR, B);
                const Binv = B.clone().invert();
                // der Sattel im UNGEFEDERTEN Rahmen der Räder: seine Hoch-Achse bleibt oben (nur der Lenk-Einschlag dreht
                // um sie) — rollt er mit dem Rad, kippt sie um den Rad-Winkel
                r._archEntryWorldMatrix(gR, Bu, true);
                const BuInv = Bu.clone().invert();
                for (const { i } of steh) {
                    const s = gR.instSlots[i];
                    const g = st.archInstanceGroups.get(s.key);
                    if (!g) continue;
                    g.mesh.getMatrixAt(s.slot, M);
                    const e = Rel.multiplyMatrices(BuInv, M).elements;
                    const c = e[5] / Math.max(1e-9, Math.hypot(e[4], e[5], e[6]));
                    stehRolle = Math.max(stehRolle, Math.acos(Math.max(-1, Math.min(1, c))));
                }
                // die Rad-Punkte: Naben-Mitte je Ecke (Rad-Leaf) oder der Rad-Punkt der Aufbau-Matrix (starr)
                const punkte = [];
                if (rad.length) {
                    for (const { i, rd } of rad) {
                        const s = gR.instSlots[i];
                        const g = st.archInstanceGroups.get(s.key);
                        if (!g) continue;
                        g.mesh.getMatrixAt(s.slot, M);
                        v3.setFromMatrixPosition(M);
                        punkte.push({ front: rd.front, x: v3.x, y: v3.y - radR, z: v3.z });
                        // relativ zum Aufbau: die Achse z (Rolle um sie) und die Gier der Nabe (Lenkung)
                        Rel.multiplyMatrices(Binv, M);
                        const key = rd.ecke;
                        const e = Rel.elements;
                        const yAchse = [e[4], e[5], e[6]];
                        const xAchse = [e[0], e[1], e[2]];
                        if (!relStart.has(key)) relStart.set(key, yAchse);
                        const y0 = relStart.get(key);
                        const c =
                            (y0[0] * yAchse[0] + y0[1] * yAchse[1] + y0[2] * yAchse[2]) /
                            (Math.hypot(...y0) * Math.hypot(...yAchse));
                        rolle = Math.max(rolle, Math.acos(Math.max(-1, Math.min(1, c))));
                        if (phase === "a") {
                            // Gier der Nabe im Aufbau: die Achse z des Rades (die Drehachse) gegen die Quer-Achse z des Aufbaus
                            const zA = [e[8], e[9], e[10]];
                            const gier = Math.abs(Math.atan2(zA[0], Math.abs(zA[2]))) * (rd.dreh ? 1 : 1);
                            if (rd.front) lenk = Math.max(lenk, gier);
                            else lenkHinten = Math.max(lenkHinten, gier);
                        }
                        void xAchse;
                    }
                } else {
                    for (const ax of [hu.fAx, hu.rAx])
                        for (const sz of [-1, 1]) {
                            v3.set(ax, 0, (sz * hu.spur) / 2).applyMatrix4(B);
                            punkte.push({ front: ax === hu.fAx, x: v3.x, y: v3.y, z: v3.z });
                        }
                }
                let spalt = 0;
                let spaltS = -1;
                for (const p of punkte) {
                    const d = p.y - hh(p.x, p.z);
                    spalt = Math.max(spalt, Math.abs(d));
                    if (phase === "s" && p.front) tauchBremse = Math.max(tauchBremse, -d);
                    // DIE SICHT (Gegenprüfung 07.10., Entscheid D1: nur messen und benennen — die Sim bleibt auf dem Gesetz):
                    // derselbe Aufstandspunkt gegen den GEZEICHNETEN Boden (die Boden-Karte des fertigen Meshs, Lehre 22)
                    const ys = sicht(p.x, p.z);
                    if (ys !== null) spaltS = Math.max(spaltS, Math.abs(p.y - ys));
                }
                spalte.push(spalt);
                if (spaltS >= 0) spalteSicht.push(spaltS);
            };
            tasten(true, false);
            for (let i = 0; i < 90; i++) frame(i);
            phase = "s";
            for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
            st.keys.s = true;
            for (let i = 0; i < 40; i++) frame(i);
            st.keys.s = false;
            phase = "a";
            tasten(true, true);
            for (let i = 0; i < 60; i++) frame(i);
            tasten(false);
            r._stepFixedSim = P5;
            spalte.sort((a, b) => a - b);
            spalteSicht.sort((a, b) => a - b);
            S.raeder = {
                leaves: rad.length,
                stehend: steh.length,
                stehRolle,
                rolle,
                lenk,
                lenkHinten,
                tauchBremse,
                spaltP75: spalte.length ? spalte[Math.floor(spalte.length * 0.75)] : Infinity,
                spaltMax: spalte.length ? spalte[spalte.length - 1] : Infinity,
                sichtSchritte: spalteSicht.length,
                sichtP75: spalteSicht.length ? spalteSicht[Math.floor(spalteSicht.length * 0.75)] : null,
                sichtMax: spalteSicht.length ? spalteSicht[spalteSicht.length - 1] : null,
            };
            weg(gR);
        }
        // P — DIE KERN-PFLICHT IM SPIEL (Gegenprüfung 07.10.): ein alter Kern ohne fahrGesetz/fahrEbene muss LAUT brechen
        // (`_kernPflichtBruch`), nie still null liefern (dann ritt der Gesetz-Wagen richtungs-folgend). Die Probe tauscht das
        // Kern-Objekt gegen eine Kopie ohne die beiden Funktionen (wie ein Boot mit altem Kern) und ruft die zwei Leser.
        const gP = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (gP) {
            const echt = window.__vehicleCore;
            const alt = Object.assign({}, echt);
            delete alt.fahrGesetz;
            delete alt.fahrEbene;
            const fang = (fn) => {
                try {
                    const v = fn();
                    return v === null || v === undefined ? "null" : "wert";
                } catch (e) {
                    const msg = String((e && e.message) || e);
                    return /KERN-PFLICHT/.test(msg) ? "bruch" : "fehler " + msg.slice(0, 80);
                }
            };
            window.__vehicleCore = alt;
            try {
                gP._fahrSatz = null;
                gP._fahrSatzKey = null;
                S.pflicht = {
                    satz: fang(() => r._fahrSatz(gP, r._vehicleProfile(gP))),
                    ebene: fang(() => r._rittEbene(gP, gP.position.x, gP.position.z, gP._rideYaw)),
                };
            } finally {
                window.__vehicleCore = echt;
            }
            weg(gP);
        }
        // S1 WELT == LABOR: dieselbe Gerade, W, dann W + A; die Spur je Sim-Schritt gegen den Labor-Aufruf.
        const g1 = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
        if (g1 && g1._fahr && S.kern) {
            const z0 = Object.assign({}, g1._fahr);
            z.ent = g1;
            z.spur = [];
            tasten(true, false);
            for (let i = 0; i < 90; i++) frame(i);
            tasten(true, true);
            for (let i = 0; i < 90; i++) frame(i);
            tasten(false);
            const spur = z.spur;
            z.spur = null;
            z.ent = null;
            const G = g1._fahrSatz;
            const boden = r._fahrBoden(g1);
            // Die Labor-Spur: derselbe Kern (Stand an der Lage, dann Kräfte — die Folge der Probefahrt, um einen Stand
            // versetzt), dieselben Eingaben, derselbe Boden. Wo der Kontakt-Löser griff, übernimmt sie die Lage der Welt.
            const q = Object.assign({}, z0);
            // der Boden UNTER dem Werk liest die Lage seines Fahr-Zustands (`_werkBoden`, Leben-Schau 2) — die Spur fährt als er
            const fahrRoh = g1._fahr;
            g1._fahr = q;
            let maxM = 0;
            let bei = -1;
            let maxY = 0;
            let kontakte = 0;
            for (let n = 0; n < spur.length; n++) {
                const k = spur[n].kontakt;
                if (k) {
                    kontakte++;
                    const cy = Math.cos(q.yaw);
                    const sy = Math.sin(q.yaw);
                    q.x = k.x;
                    q.z = k.z;
                    q.vlong = k.vx * cy - k.vz * sy;
                    q.vlat = -k.vx * sy - k.vz * cy;
                }
                VC.fahrStand(q, G, boden, spur[n].dt);
                maxY = Math.max(maxY, Math.abs(q.y - spur[n].y));
                VC.fahrKraefte(q, spur[n].e, G, spur[n].dt);
                const d = Math.max(Math.hypot(q.x - spur[n].x, q.z - spur[n].z), Math.abs(q.yaw - spur[n].yaw));
                if (d > maxM) {
                    maxM = d;
                    bei = n;
                }
            }
            g1._fahr = fahrRoh;
            S.labor = { schritte: spur.length, maxM, bei, maxY, kontakte, weg: Math.hypot(q.x - z0.x, q.z - z0.z) };
        }
        if (g1) weg(g1);
        // S2 KLIPPE: Anlauf 24 m trocken und eben (≤ 0,3 m je 2 m), dann fällt der Grund binnen 6 m um 3–14 m (der Befund fand
        // 8,5 m) — an einer KANTE: binnen 3 m mehr als 3 m, binnen 6 m 6–14 m Fall (an einer Kante von 2,15 m auf 3 m flog der
        // Wagen in S4 nie, an 3,13 m mit 3–4 m Fall zwei Takte 0,05 m hoch). Das Kliff kommt aus der Welt (welt-orte `kante`, K55-2 — bis
        // dahin die schärfste Kante ± 160 m um die Mess-Wiese; die flache Aue trug keine): die nächste Stelle um die Mitte der
        // Welt, dort die schärfste der 8 Richtungen.
        const kOrt = window.__weltOrt("kante", { kanteMin: 3, fall: [6, 14], schritt: 4, rMax: 1600 });
        const kl = kOrt
            ? { x: kOrt.x, z: kOrt.z, fall: kOrt.fall, kante: kOrt.kante, fahrt: kOrt.gier, sx: kOrt.sx, sz: kOrt.sz }
            : null;
        S.klippeOrt = kl;
        // DIE BAHN IST FREI (Fixture der Klippen-Stationen): der gesetzte Wagen stößt beim Spawn einen Remesh seines Chunks an,
        // und die Welt streut dort neu ein (Spawn-Affinität — im Lauf vom 07.10. standen drei Felsbögen und ein Glutbrunnen
        // AUF dem Wagen und schoben ihn 3,3 m in den Hang: die Klasse „Natur weicht dem Bau", Familie koerper-haus, D3).
        // Vor dem Aufsitzen läuft die Welt 60 Frames, dann räumt die Probe, was auf dem Anlauf bis 8 m über die Kante blockt.
        let geraeumt = 0;
        const bahnFrei = (k) => (wagen) => {
            for (let i = 0; i < 60; i++) frame(i);
            const ux = Math.sin(k.fahrt);
            const uz = Math.cos(k.fahrt);
            let n = 0;
            for (const e of st.architectures.slice()) {
                if (!e || e === wagen || !e.blockerAABBs || !e.position) continue;
                const dx = e.position.x - k.sx;
                const dz = e.position.z - k.sz;
                const l = dx * ux + dz * uz;
                if (l > -6 && l < 32 && Math.abs(dx * uz - dz * ux) < 6) {
                    r.removeArchitecture(e);
                    n++;
                }
            }
            geraeumt = n;
        };
        const klippenBahn = (k) => ({
            sx: k.sx,
            sz: k.sz,
            ux: Math.sin(k.fahrt),
            uz: Math.cos(k.fahrt),
            len: 32,
            quer: 6,
            n: 0,
        });
        // DER FAHRER DER LINIE (K55-5): W und die Lenkung eines Spielers, der auf die Kante zuhält — die Gier zielt auf die
        // Linie (Ziel-Gier = Fahrt − 0,35 · Quer-Abstand, höchstens ±0,6 rad), A dreht die Gier auf, D zurück (der Fahr-Satz:
        // steer = A − D, die Gier wächst mit steer). Ohne Lenkung glitt der GT am Grat vor der Kante der Mitte der Welt
        // (589,7/147,9, Querhang 23–38°) 17° von der Linie und fuhr 3 m neben der Kante vorbei (Flug 0,32 m, S4 vakuös).
        let gierVor = null;
        const halteLinie = (g, k) => {
            for (const t of ["w", "a", "s", "d", "shift", " "]) st.keys[t] = false;
            st.keys.w = true;
            const gier = Number.isFinite(g._rideYaw) ? g._rideYaw : k.fahrt;
            const q = (g.position.x - k.sx) * Math.cos(k.fahrt) - (g.position.z - k.sz) * Math.sin(k.fahrt);
            const ziel = k.fahrt - Math.max(-0.6, Math.min(0.6, 0.35 * q));
            const dreh = gierVor === null ? 0 : gier - gierVor;
            gierVor = gier;
            let e = ziel - gier - 3 * dreh;
            e = Math.atan2(Math.sin(e), Math.cos(e));
            if (e > 0.02) st.keys.a = true;
            else if (e < -0.02) st.keys.d = true;
        };
        if (kl) {
            bahnWache = klippenBahn(kl);
            const g2 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei(kl));
            if (g2) {
                tasten(true, false);
                gierVor = null;
                let yv = g2.position.y;
                let sprung = 0;
                let luft = 0;
                let schritte = 0;
                const P2 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P2.call(this, simTime, dt);
                    sprung = Math.max(sprung, Math.abs(g2.position.y - yv));
                    yv = g2.position.y;
                    schritte++;
                    if (g2._fahr && g2._fahr.luft) luft++;
                };
                for (let i = 0; i < 420; i++) {
                    halteLinie(g2, kl);
                    frame(i);
                }
                tasten(false);
                for (let i = 0; i < 60; i++) frame(i);
                r._stepFixedSim = P2;
                const unterGrund = g2.position.y - 0.5 - hh(g2.position.x, g2.position.z);
                S.klippe = {
                    sprung,
                    luft,
                    schritte,
                    ueberGrund: unterGrund,
                    fall: kl.fall,
                    geraeumt,
                    wache: bahnWache.n,
                };
                weg(g2);
            }
            bahnWache = klippenBahn(kl);
            // S4 ABSTEIGEN IM FLUG (Gegenprüfung 07.10.: `dismountArchitecture` stellte den Wagen nicht ab — wer im Flug
            // ausstieg, ließ ihn bis zum Reload in der Luft hängen): dieselbe Klippe, W bis der Wagen `STATION.flugM` über dem
            // Boden fliegt, dann absteigen; 240 Frames später steht er auf der Ebene seiner Räder (≤ 0,05 m), gefallen ohne Höhen-
            // Sprung > 0,5 m je Sim-Schritt.
            const g4 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei(kl));
            if (g4) {
                tasten(true, false);
                let hoehe = 0;
                let hoeheMax = -Infinity;
                let luftN = 0;
                let gefahren = 0;
                gierVor = null;
                for (let i = 0; i < 420; i++) {
                    halteLinie(g4, kl);
                    frame(i);
                    gefahren++;
                    hoehe = g4.position.y - 0.5 - hh(g4.position.x, g4.position.z);
                    if (g4._fahr && g4._fahr.luft) {
                        luftN++;
                        hoeheMax = Math.max(hoeheMax, hoehe);
                    }
                    if (g4._fahr && g4._fahr.luft && hoehe >= expected.flugM) break;
                }
                const weg4 =
                    (g4.position.x - kl.sx) * Math.sin(kl.fahrt) + (g4.position.z - kl.sz) * Math.cos(kl.fahrt);
                const diag4 =
                    `Flug ${luftN} Takte, höchstens ${hoeheMax.toFixed(2)} m über dem Grund, Kante ${kl.kante.toFixed(2)} m auf 3 m` +
                    ` · ${weg4.toFixed(1)} m längs der Bahn, ` +
                    `${((g4.position.x - kl.sx) * Math.cos(kl.fahrt) - (g4.position.z - kl.sz) * Math.sin(kl.fahrt)).toFixed(2)} m quer, in ${gefahren} Frames (Kante bei ` +
                    `${Math.hypot(kl.x - kl.sx, kl.z - kl.sz).toFixed(1)} m)` +
                    (bahnWache.typen ? ` · die Wache räumte ${bahnWache.typen.join(", ")}` : "");
                tasten(false);
                const imFlug = !!(g4._fahr && g4._fahr.luft);
                r.dismountArchitecture();
                let yv = g4.position.y;
                let sprungAb = 0;
                const P7 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P7.call(this, simTime, dt);
                    sprungAb = Math.max(sprungAb, Math.abs(g4.position.y - yv));
                    yv = g4.position.y;
                };
                for (let i = 0; i < 240; i++) frame(i);
                r._stepFixedSim = P7;
                const eb = r._rittEbene(g4, g4.position.x, g4.position.z, g4._rideYaw);
                const bodenY = eb ? eb.y : hh(g4.position.x, g4.position.z);
                S.absteigen = {
                    diag: diag4,
                    imFlug,
                    hoehe,
                    ueberBoden: g4.position.y - 0.5 - bodenY,
                    sprung: sprungAb,
                    geraeumt,
                    wache: bahnWache.n,
                };
                r.removeArchitecture(g4);
                // das Fenster der Station bleibt 420 Fahr-Frames lang, auch wenn der Wagen früh abhebt: die Welt der folgenden
                // Stationen läuft gleich weit (L8 las nach dem frühen Abstieg 0,3 mm je Bildrate — die Lockstep-Probe fährt,
                // während die Welt noch streamt; benannt offen)
                for (let i = gefahren; i < 420; i++) frame(i);
            }
            bahnWache = null;
        }
        // S3 QUERHANG: 25–40° quer, die Höhenlinie 16 m gerade (Richtung ±20°), trocken; Fahrt längs der Linie, W. Der Querhang
        // kommt aus der Welt (welt-orte `querhang`, K55-2 — bis dahin ± 160 m um die Mess-Wiese, die flache Aue trug keinen):
        // die Fahrt-Linie ist frei von Bauten und Stämmen (wie die Gasse von H) — seit die Stamm-Hülle eines Studio-Baums im
        // Weltmaß steht (Leben-Schau 07.10., Kollision == Optik), hält ein Stamm den Wagen (in der CI nach 3,2 m).
        const qOrt = window.__weltOrt("querhang", { schritt: 4, rMax: 1600 });
        const qh = qOrt ? { x: qOrt.sx, z: qOrt.sz, grad: qOrt.neigung, fahrt: qOrt.gier } : null;
        S.querOrt = qh;
        if (qh) {
            bahnWache = { sx: qh.x, sz: qh.z, ux: Math.sin(qh.fahrt), uz: Math.cos(qh.fahrt), len: 24, quer: 4, n: 0 };
            const g3 = await setzen("fahrzeug_gt", qh.x, qh.z, qh.fahrt);
            if (g3) {
                // Die QUER-ABDRIFT talwärts: je Sim-Schritt die Geschwindigkeit quer zum Bug, auf die tiefe Seite gezählt
                // (ohne Quer-Hangabtrieb tötet der Reifen jede Quer-Fahrt: 0).
                let drift = 0;
                const P3 = r._stepFixedSim;
                r._stepFixedSim = function (simTime, dt) {
                    P3.call(this, simTime, dt);
                    const ry = Number.isFinite(g3._rideYaw) ? g3._rideYaw : 0;
                    const lx = Math.cos(ry);
                    const lz = -Math.sin(ry);
                    const x = g3.position.x;
                    const zz = g3.position.z;
                    const steigLinks = (hh(x + lx, zz + lz) - hh(x - lx, zz - lz)) / 2;
                    const v = st.playerVel;
                    drift += (v.x() * lx + v.z() * lz) * -Math.sign(steigLinks) * dt;
                };
                tasten(true, false);
                for (let i = 0; i < 100; i++) frame(i);
                tasten(false);
                r._stepFixedSim = P3;
                S.quer = { drift, weg: Math.hypot(g3.position.x - qh.x, g3.position.z - qh.z), wache: bahnWache.n };
                weg(g3);
            }
            bahnWache = null;
        }

        // ═══ H — DIE HÜLLE ALS KÖRPER (Q5 · F-D4 F-L5) ═══
        // Auf einer freien, trockenen, flachen Gasse (kein fremder Blocker in ±2,5 m auf 16 m) steht 9 m vor dem Wagen ein
        // Hindernis; der GT fährt mit W hinein. Gemessen wird das EINDRINGEN der Wagen-Hülle (exportDrive.huelle: Bug bis
        // Heck × ±bw, ein 0,1-m-Raster) in das Hindernis — in die Blocker-Boxen eines Felsblocks (`stein_block`) und in den
        // Raum eines Bären (tetrapoda VERHALTEN.separation: halber Paar-Radius × bodySize) — und als Beweis der Berührung
        // der kleinste Abstand am Ende (sonst wäre 0 Eindringen vakuös). Befund: Bug 1,97–2,32 m im Stamm, 2,17 m in der
        // Wand, der Bär ganz im Wagen.
        const gasse = (() => {
            const frei = (x, zz, ux, uz) => {
                for (let s = 0; s <= 16; s += 1) {
                    const px = x + ux * s;
                    const pz = zz + uz * s;
                    const h0 = hh(px, pz);
                    if (!Number.isFinite(h0) || nass(px, pz)) return false;
                    if (s > 0 && Math.abs(h0 - hh(px - ux, pz - uz)) > 0.08) return false;
                    if (Math.abs(hh(px + uz * 2, pz - ux * 2) - hh(px - uz * 2, pz + ux * 2)) / 4 > 0.05) return false;
                }
                for (const e of st.architectures) {
                    if (!e || !e.position || !e.blockerAABBs) continue;
                    if (Math.hypot(e.position.x - x, e.position.z - zz) > 40) continue;
                    for (const b of e.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2 - x;
                        const cz = (b.minZ + b.maxZ) / 2 - zz;
                        const l = cx * ux + cz * uz;
                        const q = Math.abs(cx * uz - cz * ux);
                        if (l > -4 && l < 18 && q < 2.5 + Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 2) return false;
                    }
                }
                return true;
            };
            for (let ring = 0; ring <= 20; ring++)
                for (let k = 0; k < (ring ? 12 : 1); k++) {
                    const x = mo[0] + Math.cos((k * Math.PI) / 6) * ring * 24;
                    const zz = mo[1] + Math.sin((k * Math.PI) / 6) * ring * 24;
                    for (let d = 0; d < 8; d++) {
                        const a = (d * Math.PI) / 4;
                        if (frei(x, zz, Math.sin(a), Math.cos(a))) return { x, z: zz, fahrt: a };
                    }
                }
            return null;
        })();
        S.gasse = gasse;
        const huelleProbe = async (hindernis) => {
            if (!gasse) return null;
            const gH = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (!gH) return null;
            const h = r._fahrzeugGesetzFor(gH).drive.huelle;
            const sc = Number.isFinite(gH.scale) ? gH.scale : 1;
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            // die Gasse ist frei von fremden Wesen (ein Wolf vor dem Bug hält den Wagen an seinem Leib — die Probe misst ihr
            // eigenes Hindernis): jedes Wesen im Umkreis 30 m der Strecke geht, bevor das Hindernis steht
            for (const cr of (st.creatures || []).slice())
                if (
                    cr &&
                    cr.position &&
                    Math.hypot(cr.position.x - (gasse.x + ux * 8), cr.position.z - (gasse.z + uz * 8)) < 30
                )
                    r.removeCreature(cr);
            const ziel = hindernis.setzen(gH.position.x + ux * 9, gH.position.z + uz * 9);
            if (!ziel) {
                weg(gH);
                return null;
            }
            let tief = 0;
            let abstand = Infinity;
            let nah = Infinity; // der kleinste Abstand über die Fahrt (gleitet die Hülle an der Wand entlang, zählt der Kontakt)
            let schritte = 0;
            const messen = () => {
                const ry = Number.isFinite(gH._rideYaw) ? gH._rideYaw : 0;
                const fX = Math.sin(ry);
                const fZ = Math.cos(ry);
                abstand = Infinity;
                for (let l = h.tailX * sc; l <= h.noseX * sc + 1e-6; l += 0.1)
                    for (let q = -h.bw * sc; q <= h.bw * sc + 1e-6; q += 0.1) {
                        const px = gH.position.x + l * fX + q * fZ;
                        const pz = gH.position.z + l * fZ - q * fX;
                        const t = hindernis.tiefe(ziel, px, pz);
                        tief = Math.max(tief, t);
                        abstand = Math.min(abstand, t > 0 ? 0 : hindernis.abstand(ziel, px, pz));
                    }
            };
            const P4 = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                // das Hindernis steht VOR dem Kontakt und bei der Messung am selben Ort (das Hirn des Bären läuft im Frame)
                hindernis.halten(ziel);
                P4.call(this, simTime, dt);
                hindernis.halten(ziel);
                messen();
                nah = Math.min(nah, abstand);
                schritte++;
            };
            tasten(true, false);
            for (let i = 0; i < 150; i++) frame(i);
            tasten(false);
            r._stepFixedSim = P4;
            const vorn = (gH.position.x - gasse.x) * ux + (gH.position.z - gasse.z) * uz;
            weg(gH);
            hindernis.weg(ziel);
            return { tief, abstand, nah, schritte, vorn };
        };
        const boxTiefe = (boxes, px, pz) => {
            let t = 0;
            for (const b of boxes || []) {
                if (px < b.minX || px > b.maxX || pz < b.minZ || pz > b.maxZ) continue;
                t = Math.max(t, Math.min(px - b.minX, b.maxX - px, pz - b.minZ, b.maxZ - pz));
            }
            return t;
        };
        const boxAbstand = (boxes, px, pz) => {
            let a = Infinity;
            for (const b of boxes || []) {
                const dx = Math.max(b.minX - px, 0, px - b.maxX);
                const dz = Math.max(b.minZ - pz, 0, pz - b.maxZ);
                a = Math.min(a, Math.hypot(dx, dz));
            }
            return a;
        };
        S.huelleBlock = await huelleProbe({
            setzen: (x, zz) => {
                const b = r.spawnArchitecture(
                    "stein_block",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true }
                );
                if (b) r._populateBlockerAABBs(b);
                return b && b.blockerAABBs && b.blockerAABBs.length ? b : null;
            },
            tiefe: (b, px, pz) => boxTiefe(b.blockerAABBs, px, pz),
            abstand: (b, px, pz) => boxAbstand(b.blockerAABBs, px, pz),
            halten: () => {},
            weg: (b) => r.removeArchitecture(b),
        });
        // Der Bär steht QUER zur Fahrt (die Flanke zum Bug): gemessen wird gegen SEINEN Leib (`_kreaturLeib`, D2 — dieselbe
        // Größe, mit der er selbst gegen jede Hülle löst: drei Achsen längs der Gier, je Achse der Radius), nie gegen einen
        // zweiten Kreis. Der Wagen soll den Leib berühren (Abstand ≤ 0,3 m), nicht vor einem breiteren Kreis halten.
        const leibAchsen = (b) => {
            const lb = b.leib;
            const out = [];
            for (let o = -1; o <= 1; o++)
                out.push([b.c.position.x + lb.fx * o * lb.halb, b.c.position.z + lb.fz * o * lb.halb]);
            return out;
        };
        const leibMass = (b, px, pz) => {
            let d = Infinity;
            for (const [ax, az] of leibAchsen(b)) d = Math.min(d, Math.hypot(px - ax, pz - az));
            return d - b.leib.radius; // < 0: im Leib
        };
        const quer = Number.isFinite(gasse && gasse.fahrt) ? gasse.fahrt + Math.PI / 2 : 0;
        let baerLeib = null;
        const baerHalten = (b) => {
            b.c.position.set(b.x, b.y, b.z);
            b.c.rotation.y = b.ry;
            b.c.userData._stossV = null; // die Hand der Probe hält auch die Geschwindigkeit (der Bär steht)
            b.leib = r._kreaturLeib(b.c, 0, b.leib || {});
        };
        S.huelleBaer = await huelleProbe({
            setzen: (x, zz) => {
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1); // die Probe braucht ihren Bären
                const c = r.spawnCreatureAt(x, hh(x, zz) + 0.5, zz, "calm", "baer", { precise: true });
                if (!c) return null;
                // die Füße auf dem Boden (die Lage eines stehenden Tiers; der Leib reicht vom Fuß bis zum Kopf)
                const b = { c, x, z: zz, y: hh(x, zz), ry: quer };
                baerHalten(b);
                // die Maße im Bericht: der Leib und der Kreis, den der Wagen-Kontakt vor D2 las (separation × bodySize)
                baerLeib = {
                    radius: b.leib.radius,
                    halb: b.leib.halb,
                    // (der feste Paar-Radius 1,6 m dieses Kreises fiel mit dem persönlichen Raum, Welle LF — die Zahl
                    // bleibt als Bericht des Vor-Stands)
                    kreis: 0.5 * 1.6 * (c.userData.bodySize || 1),
                };
                return b;
            },
            tiefe: (b, px, pz) => Math.max(0, -leibMass(b, px, pz)),
            abstand: (b, px, pz) => Math.max(0, leibMass(b, px, pz)),
            // der Bär steht (sein Hirn läuft im Frame-Takt; die Probe hält ihn am Ort und in seiner Gier)
            halten: baerHalten,
            weg: (b) => r.removeCreature(b.c),
        });
        if (S.huelleBaer && baerLeib) S.huelleBaer.leib = baerLeib;
        // H3 — EIN WESEN SCHIEBT KEINEN WAGEN: der GT steht (keine Taste), ein Bär steht 0,5 m tief in seinem Bug (er lief
        // hinein); 60 Frames später darf der Wagen sich nicht bewegt haben (das Ausweichen ist Sache des Wesens).
        if (gasse) {
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (gS) {
                const h = r._fahrzeugGesetzFor(gS).drive.huelle;
                const ux = Math.sin(gasse.fahrt);
                const uz = Math.cos(gasse.fahrt);
                const x0 = gS.position.x;
                const z0 = gS.position.z;
                const ab = h.noseX;
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                const c = r.spawnCreatureAt(
                    x0 + ux * ab,
                    hh(x0 + ux * ab, z0 + uz * ab) + 0.5,
                    z0 + uz * ab,
                    "calm",
                    "baer",
                    {
                        precise: true,
                    }
                );
                if (c) {
                    // quer zur Fahrt, seine Flanke 0,5 m tief im Bug — gemessen an SEINEM Leib (`_kreaturLeib`, D2)
                    c.rotation.y = quer;
                    const lb = r._kreaturLeib(c, 0, {});
                    const d = h.noseX + lb.radius - 0.5;
                    const cx = x0 + ux * d;
                    const cz = z0 + uz * d;
                    const cy = hh(cx, cz);
                    const P6 = r._stepFixedSim;
                    r._stepFixedSim = function (simTime, dt) {
                        c.position.set(cx, cy, cz);
                        c.rotation.y = quer;
                        P6.call(this, simTime, dt);
                        c.position.set(cx, cy, cz);
                        c.rotation.y = quer;
                    };
                    tasten(false);
                    for (let i = 0; i < 60; i++) frame(i);
                    r._stepFixedSim = P6;
                    S.huelleSchub = { weg: Math.hypot(gS.position.x - x0, gS.position.z - z0) };
                    r.removeCreature(c);
                }
                weg(gS);
            }
        }
        // H7 — DAS GEDREHTE HAUS (Entscheid D5 der Welle L, Integration): eine Haus-Wand 12 × 0,8 m, 34° gegen die Fahrt
        // gedreht, als Hülle der Stufe (`_hausHuelleSetzen` → `_hausObb`, derselbe Weg wie der Beipack `__huelle` der
        // Foundry) steht 9 m voraus; der GT fährt mit W hinein. Gemessen gegen die ECHTE Wand (im Rahmen der gedrehten Box):
        // das Eindringen und der kleinste Abstand über die Fahrt. Die Welt-AABB der gedrehten Wand ist ein Mehrfaches der
        // Wand — hält die Hülle an ihr, bleibt sie vor der Wand stehen (keine Berührung).
        st.blueprints._t_fahr_haus = {
            name: "_t_fahr_haus",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 12, y: 2.5, z: 0.8 } },
            ],
        };
        const obbLokal = (ob, px, pz) => {
            const dx = px - ob.cx;
            const dz = pz - ob.cz;
            return [dx * ob.c - dz * ob.s, dx * ob.s + dz * ob.c];
        };
        S.huelleHaus = await huelleProbe({
            setzen: (x, zz) => {
                const e = r.spawnArchitecture(
                    "_t_fahr_haus",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt + 0.6 }
                );
                if (!e) return null;
                // die EINE Hüllen-Form (N5, S3 haus): die Wand als Kasten c ± h, rolle "fest" (vorher die Zahlen-Zeile `boxen`)
                r._hausHuelleSetzen(e, {
                    stufe: 0,
                    teile: [{ art: "box", c: [0, -0.25, 0], h: [6, 2.75, 0.4], rolle: "fest" }],
                });
                const box = (e.blockerAABBs || []).find((b) => b.obb);
                if (!box) {
                    r.removeArchitecture(e);
                    return null;
                }
                return { e, ob: box.obb, aabb: [box.maxX - box.minX, box.maxZ - box.minZ] };
            },
            tiefe: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.max(0, Math.min(b.ob.hx - Math.abs(lx), b.ob.hz - Math.abs(lz)));
            },
            abstand: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.hypot(Math.max(Math.abs(lx) - b.ob.hx, 0), Math.max(Math.abs(lz) - b.ob.hz, 0));
            },
            halten: () => {},
            weg: (b) => r.removeArchitecture(b.e),
        });
        delete st.blueprints._t_fahr_haus;
        // H8 — DIE GEDREHTE TEIL-BOX (D5, die zweite Rolle der Hülle: jedes Hindernis aus Teilen — der geparkte Wagen, der
        // Fels, das Tor, ein Bauwerk — steht als seine Teil-Boxen aus `_blockerComputePartAABB`): eine Mauer aus EINEM Teil
        // 12 × 0,8 m, ohne Haus-Hülle, 34° gegen die Fahrt gedreht, steht 9 m voraus; der GT fährt mit W hinein. Gemessen
        // gegen das ECHTE Teil (in seinem Rahmen): das Eindringen und der kleinste Abstand über die Fahrt. Steht das Teil als
        // Welt-AABB, hält die Hülle vor dem Rechteck um die Mauer.
        st.blueprints._t_fahr_mauer = {
            name: "_t_fahr_mauer",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 12, y: 2.5, z: 0.8 } },
            ],
        };
        S.huelleTeil = await huelleProbe({
            setzen: (x, zz) => {
                const e = r.spawnArchitecture(
                    "_t_fahr_mauer",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt + 0.6 }
                );
                if (!e) return null;
                r._populateBlockerAABBs(e);
                if (!e.blockerAABBs || e.blockerAABBs.length !== 1 || e._hausHuelle) {
                    r.removeArchitecture(e);
                    return null;
                }
                const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                const c = Math.cos(e.rotationY);
                const sn = Math.sin(e.rotationY);
                return { e, ob: { cx: e.position.x, cz: e.position.z, c, s: sn, hx: 6 * sc, hz: 0.4 * sc } };
            },
            tiefe: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.max(0, Math.min(b.ob.hx - Math.abs(lx), b.ob.hz - Math.abs(lz)));
            },
            abstand: (b, px, pz) => {
                const [lx, lz] = obbLokal(b.ob, px, pz);
                return Math.hypot(Math.max(Math.abs(lx) - b.ob.hx, 0), Math.max(Math.abs(lz) - b.ob.hz, 0));
            },
            halten: () => {},
            weg: (b) => r.removeArchitecture(b.e),
        });
        delete st.blueprints._t_fahr_mauer;
        // H4 — KEIN SCHUB INS GELÄNDE (Befund 07.10.: ein beim Remesh auf den Wagen gestreuter Felsbogen schob ihn 3,3 m in
        // den Hang, 2,43 m unter den Boden; die Wand-Regel der Vertikale hielt ihn dort). Die ECHTE Methode
        // `_fahrHuelleKontakt` mit der echten Hülle des GT auf einer synthetischen Welt (ein Objekt mit der Welt als Prototyp):
        // eine senkrechte Gelände-Wand 0,3 m neben der rechten Flanke, ein Kasten überlappt die linke Flanke 0,8 m und schiebt
        // zur Wand hin. Die Hülle darf nicht in die Wand.
        {
            const gT = await setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
            if (gT) {
                tasten(false);
                for (let i = 0; i < 4; i++) frame(i);
                const kEcht = r._fahrHuelle(gT);
                if (kEcht) {
                    const k = Object.assign({}, kEcht, { schub: [] });
                    const WX = k.hw + 0.3;
                    const w = Object.create(r);
                    w.state = {
                        architectures: [
                            {
                                id: -7,
                                position: { x: -k.hw - 0.1, y: 0, z: 0 },
                                blockerAABBs: [
                                    {
                                        minX: -k.hw - 1.0,
                                        maxX: -k.hw + 0.8,
                                        minZ: -1,
                                        maxZ: 1,
                                        botY: -1,
                                        topY: 3,
                                        dick: 5,
                                    },
                                ],
                            },
                        ],
                        creatures: [],
                        floatingIslands: [],
                        player: { mountedArch: -1 },
                    };
                    w._terrainColumnContext = () => null;
                    w._fieldSolid = (px) => px > WX;
                    w._fieldGradient = (px, py, pz, o) => {
                        const out = o || {};
                        out.x = -1;
                        out.y = 0;
                        out.z = 0;
                        out.mag = 1;
                        return out;
                    };
                    const ent = { _fahr: { y: 0, steig: 0, wank: 0 }, _rideYaw: 0 };
                    // zehn Schritte nacheinander (der Schub je Schritt ist auf eine Rad-Stufe begrenzt, 0710-2): der Kasten
                    // drückt die Hülle Schritt um Schritt an die Wand, und keiner schiebt sie hinein
                    let x = 0;
                    let schub = 0;
                    let eindringen = 0;
                    for (let i = 0; i < 10; i++) {
                        const o = w._fahrHuelleKontakt(ent, k, x, 0, 0, 0, 1 / 60);
                        if (i === 0)
                            for (let j = 0; j < k.schub.length; j += 2) schub += Math.hypot(k.schub[j], k.schub[j + 1]);
                        x = o.x;
                        eindringen = Math.max(eindringen, o.x + k.hw - WX);
                    }
                    S.huelleHang = { schub, eindringen: Math.max(0, eindringen), x, anWand: WX - (x + k.hw) };
                }
                weg(gT);
            }
        }

        // ═══ L — DIE ORTE DER LEBEN-SCHAU (Auftrag 0710-2, Befund 07.10. auf integ-l 828d5ace, sichtbar gefahren) ═══
        // An GENAU den Orten der Leben-Schau, mit ihrem Tempo und ihrer Gier, durch den echten Sim-Schritt. Je Sim-Schritt:
        // `unter` — die Ebene der Räder (der Kern selbst: fahrEbene an der Lage und Gier des Stands) über der Höhe des Wagens,
        // solange er nicht fliegt; `schub` — was der Kontakt-Löser die Lage über die eigene Fahrt hinaus versetzte.
        const VCl = window.__vehicleCore;
        const lebenFahrt = async (L, n) => {
            // die Welt um den Ort steht (die Chunks und ihre Streu — der Glutbrunnen ist Welt-Genese)
            st.playerMesh.position.set(L.ort[0], hh(L.ort[0], L.ort[1]) + 2, L.ort[1]);
            for (let i = 0; i < 240; i++) frame(i);
            const ziel = L.ziel ? L.ziel() : true;
            const gL = await setzen("fahrzeug_gt", L.start[0], L.start[1], L.gier);
            if (!gL) return null;
            for (const cr of (st.creatures || []).slice())
                if (cr && cr.position && Math.hypot(cr.position.x - L.ort[0], cr.position.z - L.ort[1]) < 30)
                    r.removeCreature(cr);
            const m = {
                ziel: !!ziel,
                unterMax: 0,
                unterN: 0,
                schubMax: 0,
                kontakte: 0,
                vor: -Infinity,
                yMin: Infinity,
            };
            m.y0 = gL._fahr ? gL._fahr.y : NaN;
            const zug = {};
            const PC = r._stepCharacter;
            r._stepCharacter = function (delta, ct) {
                const p = st.playerMesh.position;
                zug.x0 = p.x;
                zug.z0 = p.z;
                zug.vx = st.playerVel.x();
                zug.vz = st.playerVel.z();
                zug.dt = Math.min(0.1, Math.max(0.0001, delta));
                PC.call(this, delta, ct);
                const s = Math.hypot(p.x - (zug.x0 + zug.vx * zug.dt), p.z - (zug.z0 + zug.vz * zug.dt));
                // nur eine VERSETZUNG zählt (eine Wand nimmt die eigene Fahrt zurück: die Lage bleibt hinter x0 + v·dt)
                const zurueck = Math.hypot(p.x - zug.x0, p.z - zug.z0) <= Math.hypot(zug.vx, zug.vz) * zug.dt + 1e-6;
                zug.schub = zurueck ? 0 : s;
            };
            // die Höhe unter dem Gesetz am STAND selbst (Lage und Gier, an denen der Kern die Ebene stellt — die Kräfte
            // danach rücken die Lage um v·dt vor)
            const standRoh = VCl.fahrStand;
            VCl.fahrStand = function (zf, G, boden, dt) {
                const sx = zf.x;
                const sz = zf.z;
                const syaw = zf.yaw;
                const aus = standRoh.call(this, zf, G, boden, dt);
                if (zf === gL._fahr && dt > 0 && !zf.luft && Number.isFinite(zf.y)) {
                    const eb = VCl.fahrEbene(G, boden, sx, sz, syaw);
                    if (eb) {
                        const u = eb.y - zf.y;
                        m.unterMax = Math.max(m.unterMax, u);
                        if (u > 0.05) m.unterN++;
                    }
                }
                return aus;
            };
            const PF = r._stepFixedSim;
            r._stepFixedSim = function (simTime, dt) {
                zug.schub = 0;
                PF.call(this, simTime, dt);
                const fz = gL._fahr;
                if (!fz || !Number.isFinite(fz.y)) return;
                m.schubMax = Math.max(m.schubMax, zug.schub);
                if (zug.schub > 1e-3) m.kontakte++;
                // wie weit der Wagen längs seiner Fahrt über den Ort hinaus kam
                m.vor = Math.max(
                    m.vor,
                    (gL.position.x - L.ort[0]) * Math.sin(L.gier) + (gL.position.z - L.ort[1]) * Math.cos(L.gier)
                );
                m.yMin = Math.min(m.yMin, fz.y);
            };
            st.playerVel.setValue(Math.sin(L.gier) * L.v0, st.playerVel.y(), Math.cos(L.gier) * L.v0);
            if (gL._fahr) gL._fahr.vlong = L.v0;
            const x0 = gL.position.x;
            const z0 = gL.position.z;
            tasten(true, false);
            for (let i = 0; i < n; i++) frame(i);
            tasten(false);
            r._stepCharacter = PC;
            r._stepFixedSim = PF;
            VCl.fahrStand = standRoh;
            m.weg = Math.hypot(gL.position.x - x0, gL.position.z - z0);
            weg(gL);
            return m;
        };
        // L1 DER HANGFUSS: 9,3 m/s, Gier 92,3°, über den Hangfuß an den Glutbrunnen des Dorfs — seine flache Box (in der alten
        // Welt −848,9/−861,8) lag unter dem Band der Hülle, bis der Wagen am Hangfuß absank; dann schob sie ihn in EINEM Schritt
        // 0,97 m quer auf 0,25 m höheren Grund, der Wand-Zweig des Kerns fror die Höhe ein: 1,16 m unter den Rädern, für immer.
        // DER ORT AUS DER WELT (K16, Orts-Wand): der Glutbrunnen ist Welt-Genese des Dorfs — die Probe steht am Dorf-Messort
        // (spec/profiband/haushalt.json `dorf`, `expected.dorf`), nimmt den nächsten Glutbrunnen des Bestands und fährt ihn mit dem
        // Tempo und der Gier der Schau an (Start 5,6 m, Spieler 3,1 m vor ihm längs der Gier). Kein Glutbrunnen → vakuös, laut.
        const D = expected.dorf;
        await ankommen(D.x, D.z);
        let G = null;
        for (const e of st.architectures)
            if (e && e.position && /glutbrunnen/.test(e.blueprintName || e.name || e.type || ""))
                if (
                    !G ||
                    Math.hypot(e.position.x - D.x, e.position.z - D.z) <
                        Math.hypot(G.position.x - D.x, G.position.z - D.z)
                )
                    G = e;
        const gierL1 = (92.3 * Math.PI) / 180;
        const vor = (d) => [G.position.x - Math.sin(gierL1) * d, G.position.z - Math.cos(gierL1) * d];
        S.hangfuss = G
            ? await lebenFahrt(
                  {
                      ort: vor(3.1),
                      start: vor(5.6),
                      gier: gierL1,
                      v0: 9.3,
                      ziel: () => (st.architectures.includes(G) ? G : null),
                  },
                  150
              )
            : { ziel: false, kontakte: 0, fehlt: "kein Glutbrunnen am Dorf-Messort" };
        // L3–L5 DER STOSS (Leben-Schau 07.10.: Baum 10,41 → 0,16 · geparkter GT 11,28 → 0,00 · Bär 9,27 → 0,17 m/s, je in
        // EINEM Frame, kein Rückprall, der Gegner bewegt sich nicht, keine Rückmeldung): der GT fährt mit W aus 9 m Anlauf
        // in der freien Gasse auf das Hindernis, das NICHT gehalten wird. Kontakt = der erste Schritt, in dem der Kontakt-
        // Löser Lage oder Fahrt nahm (`z.kontakt`, der Mitschnitt am EINEN Kontakt-Löser); gemessen: die Fahrt davor und danach, die kleinste in den 8 Schritten danach (der
        // Rückprall), der Weg des Getroffenen längs der Fahrt, die Stoß-Ereignisse (`_stossEreignis`) und der Kamera-Ruck.
        const stossProbe = async (h) => {
            if (!gasse) return null;
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (!gS) return null;
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            for (const cr of (st.creatures || []).slice())
                if (
                    cr &&
                    cr.position &&
                    Math.hypot(cr.position.x - (gasse.x + ux * 8), cr.position.z - (gasse.z + uz * 8)) < 30
                )
                    r.removeCreature(cr);
            const ziel = await h.setzen(gS.position.x + ux * 9, gS.position.z + uz * 9);
            if (!ziel) {
                weg(gS);
                return null;
            }
            const p0 = h.lage(ziel);
            const m = {
                kontakt: -1,
                vVor: 0,
                vNach: 0,
                vMinNach: Infinity,
                schritte: 0,
                ereignisse: 0,
                ruck: 0,
                ohneAnnaeherung: 0,
                ohneWer: {}, // der Partner je Stoß ohne Annäherung
                erster: null, // der erste Kontakt: wer, unter welchem Winkel, wie weit vor dem Ziel
                gasseTiere: 0, // die meisten Tiere zugleich in der Gasse (3 m quer, −3…12 m längs)
                gasseArten: [],
            };
            let schrittEv = []; // die Stoß-Partner dieses Sim-Schritts
            const nenne = (w) => schrittEv.push(w);
            // DIE ANNÄHERUNG je Stoß des eigenen Wagens: die Fahrt in die Berührung (vor dem Löser) gegen die Geschwindigkeit
            // des Gegners längs derselben Normalen (Leib: Steuer-Schritt + getragener Stoß; Wagen: sein Fahr-Zustand).
            let vEin = null;
            const HKroh = r._fahrHuelleKontakt;
            r._fahrHuelleKontakt = function (entry, k, x0, z0, vx, vz, ...rest) {
                const alt = vEin;
                vEin = entry === gS ? { x: vx, z: vz } : null;
                try {
                    return HKroh.call(this, entry, k, x0, z0, vx, vz, ...rest);
                } finally {
                    vEin = alt;
                }
            };
            const annaeherung = (gx, gz, nx, nz, wer) => {
                if (vEin && !(vEin.x * nx + vEin.z * nz > gx * nx + gz * nz + 1e-6)) {
                    m.ohneAnnaeherung++;
                    m.ohneWer[wer] = (m.ohneWer[wer] || 0) + 1;
                }
            };
            const KSroh = r._kreaturStoss;
            r._kreaturStoss = function (c, nx, nz, dv) {
                const ud = c.userData;
                const sw = ud._steuer;
                const sv = ud._stossV;
                const v = sw && Number.isFinite(sw.v) ? sw.v : 0;
                const wer = "Tier " + (ud.soul || c.name || "?");
                if (vEin) nenne(wer);
                annaeherung(
                    (v ? Math.sin(sw.gier) * v : 0) + (sv ? sv.x : 0),
                    (v ? Math.cos(sw.gier) * v : 0) + (sv ? sv.z : 0),
                    nx,
                    nz,
                    wer
                );
                return KSroh.call(this, c, nx, nz, dv);
            };
            const WSroh = r._fahrWagenStoss;
            r._fahrWagenStoss = function (e, G, dvx, dvz) {
                const d = Math.hypot(dvx, dvz);
                const f = e._fahr;
                const fahrt = f && Number.isFinite(f.vlong) && Number.isFinite(f.yaw);
                const wer = "Wagen " + (e.type || "?") + (e === gS ? " (der eigene)" : "");
                if (vEin) nenne(wer);
                if (d > 0)
                    annaeherung(
                        fahrt ? f.vlong * Math.cos(f.yaw) - f.vlat * Math.sin(f.yaw) : 0,
                        fahrt ? -f.vlong * Math.sin(f.yaw) - f.vlat * Math.cos(f.yaw) : 0,
                        dvx / d,
                        dvz / d,
                        wer
                    );
                return WSroh.call(this, e, G, dvx, dvz);
            };
            const evRoh = r._stossEreignis;
            if (typeof evRoh === "function")
                r._stossEreignis = function (...a) {
                    m.ereignisse++;
                    nenne(`Ereignis Δv ${Number.isFinite(a[1]) ? a[1].toFixed(2) : "?"}`);
                    return evRoh.apply(this, a);
                };
            st._landImpactPending = 0;
            const PF = r._stepFixedSim;
            let vPrev = 0;
            r._stepFixedSim = function (simTime, dt) {
                schrittEv = [];
                PF.call(this, simTime, dt);
                const v = st.playerVel.x() * ux + st.playerVel.z() * uz;
                m.ruck = Math.max(m.ruck, st._landImpactPending || 0);
                if (m.kontakt < 0 && vPrev > 2 && z.kontakt) {
                    m.kontakt = m.schritte;
                    m.vVor = vPrev;
                    m.vNach = v;
                    m.vMinNach = v;
                    // wer, unter welchem Winkel (Fahrt gegen die Richtung zum Ziel), wie weit vor dem Ziel (längs der Gasse)
                    const pz = h.lage(ziel);
                    const wx = pz.x - gS.position.x;
                    const wz = pz.z - gS.position.z;
                    const vx2 = st.playerVel.x();
                    const vz2 = st.playerVel.z();
                    const cw = (vPrev * (wx * ux + wz * uz)) / Math.max(1e-9, Math.hypot(wx, wz) * Math.abs(vPrev));
                    m.erster = {
                        mit: schrittEv.length ? schrittEv.join(" + ") : "der Löser ohne Stoß",
                        winkel: +((Math.acos(Math.max(-1, Math.min(1, cw))) * 180) / Math.PI).toFixed(1),
                        abstand: +(wx * ux + wz * uz).toFixed(2),
                        quer: +Math.abs(wx * uz - wz * ux).toFixed(2),
                        vQuer: +Math.abs(vx2 * uz - vz2 * ux).toFixed(2),
                    };
                } else if (m.kontakt >= 0 && m.schritte - m.kontakt <= 8) m.vMinNach = Math.min(m.vMinNach, v);
                // die Gasse: Tiere, die während der Probe hineinkommen
                let n = 0;
                for (const cr of st.creatures || []) {
                    if (!cr || !cr.position) continue;
                    const dx = cr.position.x - gasse.x;
                    const dz = cr.position.z - gasse.z;
                    const l = dx * ux + dz * uz;
                    if (l < -3 || l > 12 || Math.abs(dx * uz - dz * ux) > 3) continue;
                    n++;
                    const art = (cr.userData && cr.userData.soul) || "?";
                    if (m.gasseArten.indexOf(art) < 0) m.gasseArten.push(art);
                }
                m.gasseTiere = Math.max(m.gasseTiere, n);
                vPrev = v;
                m.schritte++;
            };
            tasten(true, false);
            for (let i = 0; i < 150; i++) frame(i);
            tasten(false);
            r._stepFixedSim = PF;
            if (typeof evRoh === "function") delete r._stossEreignis;
            delete r._fahrHuelleKontakt;
            delete r._kreaturStoss;
            delete r._fahrWagenStoss;
            if (!Number.isFinite(m.vMinNach)) m.vMinNach = m.vNach;
            const p1 = h.lage(ziel);
            m.zielWeg = (p1.x - p0.x) * ux + (p1.z - p0.z) * uz;
            weg(gS);
            h.weg(ziel);
            return m;
        };
        S.stossFels = await stossProbe({
            setzen: (x, zz) => {
                const b = r.spawnArchitecture(
                    "stein_block",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true }
                );
                return b && b.blockerAABBs && b.blockerAABBs.length ? b : null;
            },
            lage: (b) => ({ x: b.position.x, z: b.position.z }),
            weg: (b) => r.removeArchitecture(b),
        });
        S.stossWagen = await stossProbe({
            setzen: async (x, zz) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: gasse.fahrt - Math.PI / 2 }
                );
                if (!e) return null;
                const dlP = performance.now() + 45000;
                while (!e.instanced && !e.mesh && performance.now() < dlP) {
                    r._rebuildArchitectureMesh(e);
                    if (e.instanced || e.mesh) break;
                    await new Promise((r4) => setTimeout(r4, 200));
                }
                return e.blockerAABBs && e.blockerAABBs.length ? e : null;
            },
            lage: (e) => ({ x: e.position.x, z: e.position.z }),
            weg: (e) => r.removeArchitecture(e),
        });
        S.stossBaer = await stossProbe({
            setzen: (x, zz) => {
                st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
                // Größe 1 (die Gestalt-Masse wächst mit der Größe hoch drei: ein Bär der Größe 2 wiegt 2,7 t, mehr als der GT)
                const c = r.spawnCreatureAt(x, hh(x, zz) + 0.5, zz, "calm", "baer", { precise: true, bodySize: 1 });
                if (!c) return null;
                c.position.set(x, hh(x, zz), zz);
                c.rotation.y = gasse.fahrt + Math.PI / 2; // quer zur Fahrt, die Flanke zum Bug
                if (typeof r.assignCreatureTask === "function") r.assignCreatureTask(c, "wait");
                // Der Bär steht still (sein Hirn wählte Flucht oder Wandern mit Math.random — 07.10. kippte L5 so von
                // 7,99 → 6,07 auf 7,92 → 3,70 m/s): ein Steuer-Gesetz, dessen Schritt das Tempo nullt; nur der Stoß bewegt ihn.
                const A = Object.getPrototypeOf(r).constructor;
                if (!A.__steuerRoh) {
                    A.__steuerRoh = A._steuerGesetz;
                    const steht = Object.create(A.__steuerRoh.call(A));
                    steht.steuerSchritt = (sw) => {
                        sw.v = 0;
                    };
                    A._steuerGesetz = () => steht;
                }
                return c;
            },
            lage: (c) => ({ x: c.position.x, z: c.position.z }),
            weg: (c) => {
                const A = Object.getPrototypeOf(r).constructor;
                if (A.__steuerRoh) {
                    A._steuerGesetz = A.__steuerRoh;
                    delete A.__steuerRoh;
                }
                r.removeCreature(c);
            },
        });
        // L6 SPIELER UND WAGEN (0710-4): (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Stoß nimmt ihm
        // die Fahrt in den Wagen (er prallt ab, statt in die Box zu drücken), die Handbremse hält den Wagen (sie nimmt den
        // Stoß eines Menschen auf), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s, rutscht auf den
        // stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.
        if (gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            await ankommen(gasse.x, gasse.z);
            const ux = Math.sin(gasse.fahrt);
            const uz = Math.cos(gasse.fahrt);
            const gt = async (x, zz, rotY) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: rotY }
                );
                const dlG = performance.now() + 45000;
                while (e && !e.instanced && !e.mesh && performance.now() < dlG) {
                    r._rebuildArchitectureMesh(e);
                    if (e.instanced || e.mesh) break;
                    await new Promise((r5) => setTimeout(r5, 200));
                }
                return e && e.blockerAABBs && e.blockerAABBs.length ? e : null;
            };
            // der Abstand der Spieler-Kapsel (r 0,35) zur Hülle des Wagens (< 0: sie steckt in ihm), längs der Gasse gemessen —
            // im Rahmen der Box: ein Teil quer zu den Welt-Achsen trägt seine gedrehte Box (`obb` { cx, cz, c, s, hx, hz }, lokal
            // = (Δx·c − Δz·s, Δx·s + Δz·c)), in der die Kapsel löst; die Welt-AABB ist nur ihr Vorfilter. An der Gasse von K55
            // (diagonal) las die Welt-AABB den Spieler 1,97 m „im Wagen", wo er an der gedrehten Flanke abprallte.
            // Gezählt wird nur eine WAND des Lösers (`_resolveCapsuleVsAABB`): die Oberkante der Box über der Stufe des Fußes
            // (Fuß + PLAYER_STEP_UP), ihre Unterkante unter dem Kopf. Eine Box, die der Fuß als Stufe nimmt, trägt ihn — W gegen
            // die frische Wand KLETTERT (Parkour): an der Gasse von K55 stieg der Spieler auf den Wagen (Fuß 0,85 m über dem Grund,
            // über der Unterkörper-Box), und die flache Probe las ihn 0,42 m „im Wagen", während er auf ihm stand.
            const AK = r.constructor;
            const kapselAbstand = (e) => {
                const pmP = st.playerMesh.position;
                const fuss = pmP.y - AK.PLAYER_FOOT_OFFSET;
                const kopf = pmP.y + AK.PLAYER_FOOT_OFFSET;
                let d = Infinity;
                for (const b of e.blockerAABBs) {
                    if (!(b.topY > fuss + AK.PLAYER_STEP_UP && b.botY < kopf)) continue;
                    const ob = b.obb;
                    const dx = pmP.x - (ob ? ob.cx : (b.minX + b.maxX) / 2);
                    const dz = pmP.z - (ob ? ob.cz : (b.minZ + b.maxZ) / 2);
                    const lx = ob ? dx * ob.c - dz * ob.s : dx;
                    const lz = ob ? dx * ob.s + dz * ob.c : dz;
                    const hx = ob ? ob.hx : (b.maxX - b.minX) / 2;
                    const hz = ob ? ob.hz : (b.maxZ - b.minZ) / 2;
                    const ix = Math.max(Math.abs(lx) - hx, 0);
                    const iz = Math.max(Math.abs(lz) - hz, 0);
                    const aussen = Math.hypot(ix, iz);
                    const innen = aussen > 0 ? 0 : Math.min(hx - Math.abs(lx), hz - Math.abs(lz));
                    d = Math.min(d, aussen > 0 ? aussen : -innen);
                }
                return d - AK.PLAYER_WALL_RADIUS;
            };
            const sw = { a: null, b: null };
            // (a) der GT quer zur Gasse 8 m voraus, der Spieler 3,5 m vor der Gasse, Blick und W längs der Gasse
            {
                const e = await gt(gasse.x + ux * 8, gasse.z + uz * 8, gasse.fahrt);
                if (e) {
                    const sx = gasse.x + ux * 3.5;
                    const sz = gasse.z + uz * 3.5;
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    st.yaw = gasse.fahrt;
                    const p0 = { x: e.position.x, z: e.position.z };
                    const m = {
                        minAbstand: Infinity,
                        wagenWeg: 0,
                        kontakt: -1,
                        vorKontakt: 0,
                        nachKontakt: Infinity,
                        aufstieg: 0, // wie hoch der Fuß nach dem Kontakt über dem Boden stand (der Spieler stieg auf den Wagen)
                        schub: 0, // in wie vielen Schritten der Wagen den Spieler aus seiner Hülle schob
                        paare: 0, // Stöße Wagen → Spieler mit Fahrt in den Wagen
                        prallNach: -Infinity, // der größte Rest-Anteil der Fahrt in den Wagen (relativ) NACH dem Stoß (≤ 0: er prallt ab)
                    };
                    const SProh = r._stossPaar;
                    r._stossPaar = function (qa, qb, nx, nz) {
                        if (qb !== st.playerMesh) return SProh.call(this, qa, qb, nx, nz);
                        // die Fahrt des Spielers in den Wagen RELATIV zum Wagen (n zeigt vom Wagen zum Spieler; der Wagen mit
                        // seiner echten Geschwindigkeit vor und nach dem Stoß — die Handbremse hält ihn)
                        const rel = () => {
                            const w = r._fahrWagenGeschw(qa);
                            return -((st.playerVel.x() - (w ? w.x : 0)) * nx + (st.playerVel.z() - (w ? w.z : 0)) * nz);
                        };
                        const vor = rel();
                        const J = SProh.call(this, qa, qb, nx, nz);
                        const nach = rel();
                        if (vor > 0.05) {
                            m.paare++;
                            m.prallNach = Math.max(m.prallNach, nach / vor);
                        }
                        return J;
                    };
                    const SQroh = r._stepCharacterStructures;
                    r._stepCharacterStructures = function (pos, feetY, headY, radius, huelle, quellen) {
                        const n0 = quellen ? quellen.length : 0;
                        const t = SQroh.call(this, pos, feetY, headY, radius, huelle, quellen);
                        if (!huelle && quellen && quellen.length > n0 && m.kontakt >= 0) m.schub++;
                        return t;
                    };
                    tasten(true);
                    // DER ANLAUF: die langsamste Fahrt in den Wagen auf den letzten 30 cm vor der Hülle (Kapsel-Abstand
                    // 0,05–0,3 m). Nicht die Fahrt EINES Frames davor: die Kapsel klemmt ihren Schritt auf den Rest-Spalt
                    // (Spalt ÷ Takt), und je nach Lage der Gasse fällt dieser Klemm-Frame vor die 0,02-m-Schwelle (K16:
                    // 1,19 m/s über den ganzen Anlauf, der Frame davor 0,22 m/s — die Linse rief „vakuös").
                    let vorher = 0;
                    let anlauf = Infinity;
                    for (let i = 0; i < 240; i++) {
                        frame(i);
                        const ab = kapselAbstand(e);
                        if (m.kontakt >= 0 && i - m.kontakt <= 30) {
                            const pmA = st.playerMesh.position;
                            m.aufstieg = Math.max(m.aufstieg, pmA.y - 0.5 - hh(pmA.x, pmA.z)); // Fuß = Ursprung − 0,5
                        }
                        m.minAbstand = Math.min(m.minAbstand, ab);
                        const vU = st.playerVel.x() * ux + st.playerVel.z() * uz; // die Fahrt des Spielers in den Wagen
                        if (m.kontakt < 0 && ab > 0.05 && ab <= 0.3) anlauf = Math.min(anlauf, vU);
                        if (m.kontakt < 0 && ab <= 0.02) {
                            m.kontakt = i;
                            m.vorKontakt = Number.isFinite(anlauf) ? anlauf : vorher;
                        }
                        if (m.kontakt >= 0 && i - m.kontakt <= 10) m.nachKontakt = Math.min(m.nachKontakt, vU);
                        vorher = vU;
                    }
                    tasten(false);
                    delete r._stepCharacterStructures;
                    delete r._stossPaar;
                    for (let i = 0; i < 60; i++) frame(240 + i);
                    m.wagenWeg = Math.hypot(e.position.x - p0.x, e.position.z - p0.z);
                    r.removeArchitecture(e);
                    sw.a = m;
                }
            }
            // (b) der GT längs der Gasse, sein Bug 0,8 m vor dem stehenden Spieler; ein Stoß von 5 m/s gegen den Spieler
            {
                const sx = gasse.x + ux * 1.5;
                const sz = gasse.z + uz * 1.5;
                const e = await gt(gasse.x + ux * 5.2, gasse.z + uz * 5.2, gasse.fahrt - Math.PI / 2);
                if (e) {
                    st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
                    st.playerVel.setValue(0, 0, 0);
                    st._fieldVy = 0;
                    tasten(false);
                    for (let i = 0; i < 20; i++) frame(i); // der Spieler steht
                    const G = r._fahrStossSatz(e);
                    const m = { minAbstand: Infinity, spielerDv: 0, angestossen: !!G };
                    if (G) r._fahrWagenStoss(e, G, -ux * 5, -uz * 5);
                    for (let i = 0; i < 180; i++) {
                        frame(20 + i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        m.spielerDv = Math.max(m.spielerDv, Math.hypot(st.playerVel.x(), st.playerVel.z()));
                    }
                    r.removeArchitecture(e);
                    sw.b = m;
                }
            }
            S.spielerWagen = sw;
        }
        // L7 DER GESTOSSENE LEIB VOR DÜNNER WAND (0710-5): ein Bär (Größe 1, sein Steuer-Schritt steht) 3 m vor einer 0,35 m
        // dünnen Wand wird mit 13,7 m/s gegen sie gedrückt (ein Wagen, der nachschiebt: 45 Frames je Frame neu gesetzt) — je
        // Kadenz (60 fps, 30 fps, gemischte Frames 8–33 ms)
        // zehn Versuche, Start-Abstand (über einen Frame-Weg), Lage quer und Phase des Akkumulators je Versuch versetzt. Gezählt: wie oft die Mitte des
        // Bären hinter die Wand gerät. Vorher (der Stoß im Frame-Takt ohne Weg-Prüfung) 30 fps 9/10, gemischt 9/10.
        // L8 LOCKSTEP (0710-5): ein GT (W) gegen einen stehenden Bären, die Lage des Wagens nach genau 200 Sim-Schritten bei
        // 60 fps und bei gemischten Frames — sie muss gleich sein (der Stoß des Leibs lebt im festen Schritt).
        if (start && gasse) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            await ankommen(start.x, start.z);
            const A = Object.getPrototypeOf(r).constructor;
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (sw2) => {
                sw2.v = 0;
            };
            const KADENZ = { 60: [1000 / 60], 30: [1000 / 30], gemischt: [8, 33, 16, 25, 12, 30, 20, 9, 33, 14] };
            const lauf = (muster, n, nachJedem) => {
                for (let i = 0; i < n; i++) {
                    tMs += muster[i % muster.length];
                    r._gameLoopTick(tMs);
                    if (nachJedem && nachJedem(i) === false) break;
                }
            };
            A._steuerGesetz = () => steht;
            try {
                // L7
                const wx = start.x + 14;
                const wz = start.z;
                const g = hh(wx, wz);
                const wand = r.spawnArchitecture(
                    "stein_block",
                    { x: wx, y: g + 0.5, z: wz },
                    { silent: true, precise: true }
                );
                if (wand) {
                    const platte = () => {
                        wand.blockerAABBs = [
                            {
                                minX: wx - 0.175,
                                maxX: wx + 0.175,
                                minZ: wz - 2,
                                maxZ: wz + 2,
                                botY: g - 0.5,
                                topY: g + 3,
                                dick: 3.5,
                            },
                        ];
                        wand._blockerReach = 3;
                    };
                    // der Spieler steht zu Fuß neben der Probe (die Tiere ticken im Nah-Band)
                    st.playerMesh.position.set(wx - 4, hh(wx - 4, wz + 6) + 1.2, wz + 6);
                    st.playerVel.setValue(0, 0, 0);
                    tasten(false);
                    const L7 = {};
                    for (const [name, muster] of Object.entries(KADENZ)) {
                        let durch = 0;
                        let n = 0;
                        let tiefstX = -Infinity;
                        for (let v = 0; v < 10; v++) {
                            platte();
                            const bz = wz - 0.9 + v * 0.2;
                            // der Start-Abstand je Versuch um 4,5 cm versetzt: zehn Versuche decken einen ganzen Frame-Weg (30 fps,
                            // ~0,45 m) — durch geht nur, wessen vordere Achse im Sprung über die Wandmitte kommt, ein Fenster von cm
                            st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1); // die Probe braucht ihren Bären
                            const bx = wx - 0.175 - 3 - v * 0.045;
                            const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", {
                                precise: true,
                                bodySize: 1,
                            });
                            if (!b) continue;
                            b.position.set(bx, hh(bx, bz), bz);
                            b.rotation.y = Math.PI / 2;
                            b.userData._steuer = { gier: Math.PI / 2, v: 0 };
                            b.userData._stossV = null;
                            lauf([1 + v * 1.3], 1); // die Phase des Akkumulators je Versuch
                            b.userData._stossV = { x: 13.7, z: 0 };
                            let maxX = -Infinity;
                            // der Stoß DRÜCKT wie ein Wagen, der nachschiebt: je Frame neu 13,7 m/s gegen die Wand (die Gegenprüfung:
                            // Bär vor der Wand, Wagen 13,7 m/s) — liegt der Leib an der Wand, beginnt jeder Frame mit der Achse an ihr
                            lauf(muster, 90, (i) => {
                                maxX = Math.max(maxX, b.position.x);
                                if (i < 45) b.userData._stossV = { x: 13.7, z: 0 };
                            });
                            n++;
                            tiefstX = Math.max(tiefstX, maxX - (wx + 0.175));
                            if (maxX > wx + 0.175) durch++;
                            r.removeCreature(b);
                        }
                        L7[name] = { durch, n, ueber: +tiefstX.toFixed(3) };
                    }
                    r.removeArchitecture(wand);
                    S.leibWand = L7;
                }
                // L8
                const ux = Math.sin(gasse.fahrt);
                const uz = Math.cos(gasse.fahrt);
                const lockProbe = async (muster) => {
                    const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
                    if (!gS) return null;
                    const bx = gasse.x + ux * 9;
                    const bz = gasse.z + uz * 9;
                    // die Welt der anderen Tiere ruht: der Umkreis 60 m geräumt, keine Geburt während der Probe (die Kappe
                    // steht auf dem Bestand + dem Bären) — der Lockstep prüft den Stoß, nicht den Takt des Spawners
                    for (const cr of (st.creatures || []).slice())
                        if (cr && cr.position && Math.hypot(cr.position.x - bx, cr.position.z - bz) < 60)
                            r.removeCreature(cr);
                    // DER GLEICHE START (K70-N1): beide Läufe beginnen am RUHENDEN Wagen. `setzen` schwingt 12 Bilder im
                    // Muster ein — wie viele Sim-Schritte das sind, hängt am Rest des Akkumulators: im roten Lauf begann der
                    // 60-fps-Lauf am frisch gesetzten Stand (vy 0), der gemischte einen Schritt später (vy −g·dt) — 1,2 mm
                    // nach 200 Schritten (CI 38712496194; lokal 1 von 4 Läufen). Gewartet wird auf das Ereignis (der
                    // Fahr-Zustand ändert sich drei Bilder lang um höchstens 1 nm), nie auf die Wanduhr; der Stand reist mit
                    // (`start`), die Bilder bis zur Ruhe auch.
                    let ruhe = 0;
                    let stand = null;
                    let bilder = 0;
                    let unruhe = null; // die Größe, die zuletzt um mehr als 1 nm ging (die Linse nennt sie)
                    const namen = ["x", "z", "y", "vy", "speed", "yaw", "steig", "wank"];
                    for (; bilder < 600 && ruhe < 3; bilder++) {
                        tMs += 1000 / 60;
                        r._gameLoopTick(tMs);
                        const fz = gS._fahr;
                        const jetzt = fz ? [fz.x, fz.z, fz.y, fz.vy, fz.speed, fz.yaw, fz.steig, fz.wank] : null;
                        const d =
                            jetzt && stand ? Math.max(...jetzt.map((v, k) => Math.abs(v - stand[k]))) : Infinity;
                        ruhe = d <= 1e-9 ? ruhe + 1 : 0;
                        if (d > 1e-9 && jetzt && stand) {
                            const k = jetzt.findIndex((v, j) => Math.abs(v - stand[j]) === d);
                            unruhe = namen[k] + " " + d.toExponential(2);
                        }
                        stand = jetzt;
                    }
                    const kappeL = st.maxCreatures;
                    st.maxCreatures = st.creatures.length + 1;
                    const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", {
                        precise: true,
                        bodySize: 1,
                    });
                    if (!b) {
                        weg(gS);
                        return null;
                    }
                    b.position.set(bx, hh(bx, bz), bz);
                    b.rotation.y = gasse.fahrt + Math.PI / 2;
                    b.userData._steuer = { gier: b.rotation.y, v: 0 };
                    b.userData._stossV = null;
                    st._fixedAccumulator = 0;
                    const PF = r._stepFixedSim;
                    let schritte = 0;
                    let lage = null;
                    const spur = [];
                    r._stepFixedSim = function (simTime, dt) {
                        PF.call(this, simTime, dt);
                        schritte++;
                        {
                            const sv = b.userData._stossV;
                            const pmT = st.playerMesh.position;
                            let nah = 0;
                            for (const cr of st.creatures || [])
                                if (cr && cr !== b && Math.hypot(cr.position.x - pmT.x, cr.position.z - pmT.z) < 12)
                                    nah++;
                            spur.push([
                                pmT.x,
                                pmT.z,
                                b.position.x,
                                b.position.z,
                                b.position.y,
                                sv ? Math.hypot(sv.x, sv.z) : 0,
                                nah,
                            ]);
                        }
                        // die Sim-Lage des Reiters (im Schritt die Wahrheit; die Lage des Werks folgt ihr je Frame)
                        const pmS = st.playerMesh.position;
                        if (schritte === 200) lage = { x: pmS.x, z: pmS.z, bx: b.position.x, bz: b.position.z };
                    };
                    tasten(true);
                    try {
                        lauf(muster, 2000, () => lage === null);
                    } finally {
                        r._stepFixedSim = PF;
                        tasten(false);
                        st.maxCreatures = kappeL;
                    }
                    weg(gS);
                    r.removeCreature(b);
                    if (lage) {
                        lage.spur = spur;
                        lage.start = stand;
                        lage.ruhe = ruhe >= 3;
                        lage.bilder = bilder;
                        lage.unruhe = unruhe;
                    }
                    return lage;
                };
                const l60 = await lockProbe(KADENZ[60]);
                const lMix = await lockProbe(KADENZ.gemischt);
                // der erste Schritt, in dem die Läufe auseinandergehen, und die Größe, die zuerst abweicht (die Linse nennt sie)
                let erst = null;
                if (l60 && lMix) {
                    const namen = ["Wagen x", "Wagen z", "Bär x", "Bär z", "Bär y", "Bär Stoß", "Tiere nahe dem Wagen"];
                    for (let i = 0; i < Math.min(l60.spur.length, lMix.spur.length) && !erst; i++)
                        for (let k = 0; k < namen.length; k++)
                            if (l60.spur[i][k] !== lMix.spur[i][k]) {
                                erst = {
                                    schritt: i + 1,
                                    groesse: namen[k],
                                    d: +(lMix.spur[i][k] - l60.spur[i][k]).toFixed(5),
                                    tiere: [l60.spur[i][6], lMix.spur[i][6]], // die Tiere nahe dem Wagen in beiden Läufen
                                };
                                break;
                            }
                }
                S.lockstep =
                    l60 && lMix
                        ? {
                              abw: +Math.hypot(l60.x - lMix.x, l60.z - lMix.z).toFixed(6),
                              baerAbw: +Math.hypot(l60.bx - lMix.bx, l60.bz - lMix.bz).toFixed(6),
                              ruhe: l60.ruhe && lMix.ruhe,
                              ruheBilder: [l60.bilder, lMix.bilder],
                              unruhe: [l60.unruhe, lMix.unruhe],
                              startAbw:
                                  l60.start && lMix.start
                                      ? Math.max(...l60.start.map((v, k) => Math.abs(v - lMix.start[k])))
                                      : null,
                              gleicherStart:
                                  !!(l60.start && lMix.start) &&
                                  Math.max(...l60.start.map((v, k) => Math.abs(v - lMix.start[k]))) <= 1e-7,
                              erst,
                          }
                        : null;
            } finally {
                A._steuerGesetz = steuerRoh;
            }
        }
        // L10 DER GESTOSSENE SCHWIMMER (0710-5-Nachschnitt): eine Stelle mit mehr als 1 m Wasser nahe dem Messort, ein Fuchs
        // (Größe 1, sein Steuer-Schritt steht) schwimmt dort; dann ein Stoß von 4 m/s — gemessen je Frame, wie tief er unter
        // seiner Schwimm-Linie liegt (die EINE Wasser-Regel der Tiere, V18.536: `_kreaturSchwimmt` über dem Grund des Gesetzes,
        // die Sohle um seine Wasserlinie unter dem Spiegel, `_kreaturSchwimmLinie`). Vorher setzte der Sim-Schritt die Höhe
        // eines gleitenden Leibs auf den Boden, auch im Wasser.
        // STILLES Wasser (`_waterFlowAt` null auf der ganzen Bahn): die Strömung trägt ein schwimmendes Tier im Frame-Takt
        // (`updateCreatures`), wie sein Steuer-Schritt, den die Probe stillstellt — sie prüft den Stoß, nicht die Drift. Seit
        // K16 liegt im 240-m-Kreis nur ein Fluss (−686,7/−796,1, die Drift quer 0,12 m in 20 Schritten): L8 las dort
        // 1,9 mm je Bildrate, am stillen Wasser 368 m weiter 0 m.
        // Der Ort: der See AUS DER WELT (`__wasserOrte`, K16) — die Flüsse des Gelände-Netzes tragen höchstens 0,8 m Kanal,
        // im 480-m-Kreis um den Messort stand kein tiefes Wasser mehr; gesucht wird um die tiefste Stelle des Sees.
        {
            let ort = null;
            const seeO = window.__wasserOrte({ mess: mo }).see;
            const mitte = seeO ? [seeO.x, seeO.z] : null;
            for (let ring = 0; mitte && ring <= 120 && !ort; ring++)
                for (let k = 0; k < Math.max(1, ring * 6) && !ort; k++) {
                    const w = (k / Math.max(1, ring * 6)) * Math.PI * 2;
                    const x = mitte[0] + Math.cos(w) * ring * 4;
                    const zz = mitte[1] + Math.sin(w) * ring * 4;
                    const boden = hh(x, zz);
                    const sp = Number.isFinite(boden) ? r._koerperWasser(x, zz, boden) : -Infinity;
                    if (Number.isFinite(sp) && Number.isFinite(boden) && sp - boden > 1.2) {
                        // 4 m Fahrt in +x bleiben im tiefen, stillen Wasser
                        let tief = true;
                        for (let d = 0; d <= 4 && tief; d++)
                            if (
                                !(r._koerperWasser(x + d, zz, hh(x + d, zz)) - hh(x + d, zz) > 1) ||
                                r._waterFlowAt(x + d, zz)
                            )
                                tief = false;
                        if (tief) ort = { x, z: zz, spiegel: sp };
                    }
                }
            if (ort) {
                if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
                st.playerMesh.position.set(ort.x - 4, Math.max(hh(ort.x - 4, ort.z), ort.spiegel) + 1.2, ort.z);
                st.playerVel.setValue(0, 0, 0);
                tasten(false);
                const A = Object.getPrototypeOf(r).constructor;
                const steuerRoh = A._steuerGesetz;
                const steht = Object.create(steuerRoh.call(A));
                steht.steuerSchritt = (sw2) => {
                    sw2.v = 0;
                };
                A._steuerGesetz = () => steht;
                const kappeS = st.maxCreatures;
                st.maxCreatures = st.creatures.length + 1;
                try {
                    const f = r.spawnCreatureAt(ort.x, ort.spiegel, ort.z, "calm", "fuchs", {
                        precise: true,
                        bodySize: 1,
                    });
                    if (f) {
                        f.userData._steuer = { gier: 0, v: 0 };
                        f.userData._stossV = null;
                        for (let i = 0; i < 30; i++) frame(i); // er schwimmt an
                        // die Schwimm-Linie des Spiels über dem Grund des Gesetzes (schwimmt er nicht, NaN: die Probe ist rot)
                        const linie = () => {
                            const sp2 = r._kreaturSchwimmt(f, hh(f.position.x, f.position.z));
                            return sp2 === null ? NaN : r._kreaturSchwimmLinie(f, sp2);
                        };
                        const m = { vorher: +(f.position.y - linie()).toFixed(3), tiefste: Infinity, gleitet: 0 };
                        f.userData._stossV = { x: 4, z: 0 };
                        for (let i = 0; i < 40; i++) {
                            frame(i);
                            if (f.userData._stossV) m.gleitet++;
                            m.tiefste = Math.min(m.tiefste, f.position.y - linie());
                        }
                        m.tiefste = +m.tiefste.toFixed(3);
                        m.tiefe = +(ort.spiegel - hh(ort.x, ort.z)).toFixed(2);
                        S.schwimmer = m;
                        r.removeCreature(f);
                        // DER SCHWIMMER IM LOCKSTEP (L8, 0710-5-Nachschnitt): derselbe Stoß bei 60 fps und bei gemischten Frames,
                        // die Lage 20 Sim-Schritte danach — x, z UND y (im Wasser setzte der Frame-Takt die Höhe, mit seinen Wellen)
                        const schwimmLauf = (muster) => {
                            const g = r.spawnCreatureAt(ort.x, ort.spiegel, ort.z, "calm", "fuchs", {
                                precise: true,
                                bodySize: 1,
                            });
                            if (!g) return null;
                            g.userData._steuer = { gier: 0, v: 0 };
                            g.userData._stossV = null;
                            let k = 0;
                            for (let i = 0; i < 30; i++) {
                                tMs += muster[i % muster.length];
                                r._gameLoopTick(tMs);
                            }
                            g.position.x = ort.x; // dieselbe Start-Lage in beiden Läufen
                            g.position.z = ort.z;
                            st._fixedAccumulator = 0;
                            g.userData._stossV = { x: 4, z: 0 };
                            const PFs = r._stepFixedSim;
                            let lage = null;
                            r._stepFixedSim = function (simTime, dt) {
                                PFs.call(this, simTime, dt);
                                k++;
                                if (k === 20) lage = { x: g.position.x, z: g.position.z, y: g.position.y };
                            };
                            try {
                                for (let i = 0; i < 400 && lage === null; i++) {
                                    tMs += muster[i % muster.length];
                                    r._gameLoopTick(tMs);
                                }
                            } finally {
                                r._stepFixedSim = PFs;
                            }
                            r.removeCreature(g);
                            return lage;
                        };
                        st.maxCreatures = st.creatures.length + 1;
                        const s60 = schwimmLauf([1000 / 60]);
                        const sMix = schwimmLauf([8, 33, 16, 25, 12, 30, 20, 9, 33, 14]);
                        S.lockSchwimmer =
                            s60 && sMix
                                ? {
                                      abw: +Math.hypot(s60.x - sMix.x, s60.z - sMix.z).toFixed(6),
                                      abwY: +Math.abs(s60.y - sMix.y).toFixed(6),
                                  }
                                : null;
                    } else S.schwimmer = { fehler: "kein Fuchs" };
                } finally {
                    A._steuerGesetz = steuerRoh;
                    st.maxCreatures = kappeS;
                }
            } else
                S.schwimmer = {
                    fehler: mitte
                        ? `kein tiefes, stilles Wasser im Umkreis 480 m um den See ${mitte.join("/")}`
                        : "kein See in der Welt (`__wasserOrte`)",
                };
        }
        // L9 DER REITER IM WAGEN (0710-4 Klasse 4): je Wagen-Art und am Karren (Teile-Werk) aufsitzen, der Spieler schaut
        // quer zur Fahrt (die Maus ist nicht der Wagen), einschwingen — dann die HAUT des Reiters: jede Ecke jedes sichtbaren
        // Meshes der Nah-Gestalt über ihre Knochen. Gemessen über der Rad-Ebene (Ursprung − 0,5): die Oberkante gegen die
        // Dachlinie des Kerns (huelle.yRoof), die Unterseite der Oberschenkel gegen die Sitzfläche (der Sitz-Anker), das
        // Hüftgelenk (Mitte beider) gegen den Anker längs/quer im Rahmen des Wagens, der Blick des Leibs gegen die Fahrt;
        // nach dem Absteigen steht die Hüfte, wo sie vorher stand.
        if (start) {
            const T = window.THREE;
            const V = new T.Vector3();
            const H1 = new T.Vector3();
            const H2 = new T.Vector3();
            const pm = st.playerMesh;
            const rigR = () => pm.userData && pm.userData.rig;
            const huefteRel = () => {
                const rg = rigR();
                pm.updateMatrixWorld(true);
                rg.legL.hip.getWorldPosition(H1);
                rg.legR.hip.getWorldPosition(H2);
                return { x: (H1.x + H2.x) / 2, y: (H1.y + H2.y) / 2, z: (H1.z + H2.z) / 2 };
            };
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (let i = 0; i < 6; i++) frame(i);
            const wurzel0 = rigR().hips.position.clone(); // der Wurzel-Knochen vor dem ersten Aufsitzen
            const reiter = [];
            const typen = Object.keys(st.blueprints)
                .filter((n) => /^fahrzeug_/.test(n))
                .sort();
            for (const typ of typen) {
                const e = await setzen(typ, start.x, start.z, Math.PI / 2);
                if (!e) {
                    reiter.push({ typ, fehler: "kein Aufsitzen" });
                    continue;
                }
                st.yaw = gierUnwrap(e) + Math.PI / 2; // der Spieler schaut quer zur Fahrt
                for (let i = 0; i < 6; i++) frame(i);
                const rg = rigR();
                const nah = pm.userData._gelenk ? pm.userData._gelenk.nah : pm;
                const schenkel = new Set([rg.legL.hip, rg.legR.hip]);
                let oben = -Infinity;
                let unten = Infinity;
                // die Hülle des Kerns im Rahmen des Wagens (vor dem Durchlauf: Rahmen und Stationen)
                const fzgH = r._fahrzeugGesetzFor(e);
                const hu = fzgH && fzgH.drive && fzgH.drive.huelle ? fzgH.drive.huelle : null;
                const scH = Number.isFinite(e.scale) ? e.scale : 1;
                const thH = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const basisH = e.position.y - 0.5;
                const aussen = { unten: 0, oben: 0, seite: 0, laengs: 0, n: 0, tief: {}, wer: {} };
                const strahlProben = []; // jede 40. Ecke: Welt-Lage, Seite (±1 quer), Knochen
                const raus = (art, um, kn) => {
                    aussen[art]++;
                    if (!(aussen.tief[art] >= um)) {
                        aussen.tief[art] = +um.toFixed(3);
                        aussen.wer[art] = kn;
                    }
                };
                pm.updateMatrixWorld(true);
                nah.traverse((o) => {
                    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                    for (let n = o; n && n !== pm; n = n.parent) if (!n.visible) return; // die Fern-Gestalt ist verborgen
                    const pos = o.geometry.attributes.position;
                    const sw = o.isSkinnedMesh ? o.geometry.attributes.skinWeight : null;
                    const si = o.isSkinnedMesh ? o.geometry.attributes.skinIndex : null;
                    for (let i = 0; i < pos.count; i++) {
                        o.getVertexPosition(i, V);
                        V.applyMatrix4(o.matrixWorld);
                        if (V.y > oben) oben = V.y;
                        let kn = null;
                        if (sw) {
                            let bw = -1;
                            for (let k = 0; k < 4; k++) {
                                const w = sw.getComponent(i, k);
                                if (w > bw) {
                                    bw = w;
                                    kn = o.skeleton.bones[si.getComponent(i, k)];
                                }
                            }
                            if (schenkel.has(kn) && V.y < unten) unten = V.y;
                        }
                        if (!hu) continue;
                        aussen.n++;
                        if (aussen.n % 40 === 0) {
                            const lzS = (V.x - e.position.x) * Math.sin(thH) + (V.z - e.position.z) * Math.cos(thH);
                            strahlProben.push(V.x, V.y, V.z, lzS >= 0 ? 1 : -1, (kn && kn.name) || o.name || "?");
                        }
                        const dxH = V.x - e.position.x;
                        const dzH = V.z - e.position.z;
                        const lx = (dxH * Math.cos(thH) - dzH * Math.sin(thH)) / scH;
                        const lz = (dxH * Math.sin(thH) + dzH * Math.cos(thH)) / scH;
                        const ly = (V.y - basisH) / scH;
                        const name = (kn && kn.name) || o.name || "?";
                        const T = 0.02;
                        if (ly < hu.ySill - T) raus("unten", hu.ySill - ly, name);
                        else if (ly > hu.yRoof + T) raus("oben", ly - hu.yRoof, name);
                        else {
                            const breit = hu.cw; // der Reiter sitzt in der Kabine (ihre halbe Breite, jede Höhe)
                            if (Math.abs(lz) > breit + T) raus("seite", Math.abs(lz) - breit, name);
                            else if (lx > hu.noseX + T || lx < hu.tailX - T)
                                raus("laengs", Math.max(lx - hu.noseX, hu.tailX - lx), name);
                        }
                    }
                });
                // die Strahlen gegen die gezeichnete Haut (die Instanz-Gruppen dieses Wagens, je Leaf ein Slot)
                let glas = null;
                if (strahlProben.length) {
                    const G = st.archInstanceGroups;
                    const refs = [...(e.instSlots || []), ...(e.instSlotsBand || [])];
                    const ziele = new Map();
                    for (const ref of refs) {
                        const g = G && G.get(ref.key);
                        if (!g || !g.mesh) continue;
                        g.mesh.updateMatrixWorld(true);
                        if (!ziele.has(g.mesh)) ziele.set(g.mesh, new Set());
                        ziele.get(g.mesh).add(ref.slot);
                    }
                    const rc = new T.Raycaster();
                    rc.far = 2.5;
                    const O = new T.Vector3();
                    const Dq = new T.Vector3();
                    glas = { n: 0, aussen: 0, wer: {} };
                    for (let i = 0; i < strahlProben.length; i += 5) {
                        O.set(strahlProben[i], strahlProben[i + 1], strahlProben[i + 2]);
                        const sd = strahlProben[i + 3];
                        Dq.set(Math.sin(thH) * sd, 0, Math.cos(thH) * sd); // quer nach außen (R_y(θ)·(0,0,±1))
                        rc.set(O, Dq);
                        let trifft = false;
                        for (const [mesh, slots] of ziele) {
                            const hits = rc.intersectObject(mesh, false);
                            if (hits.some((h) => h.instanceId === undefined || slots.has(h.instanceId))) {
                                trifft = true;
                                break;
                            }
                        }
                        glas.n++;
                        if (!trifft) {
                            glas.aussen++;
                            const w = strahlProben[i + 4];
                            glas.wer[w] = (glas.wer[w] || 0) + 1;
                        }
                    }
                }
                const sc = Number.isFinite(e.scale) ? e.scale : 1;
                const fzg = r._fahrzeugGesetzFor(e);
                const d = fzg && fzg.drive;
                let sitz = d && d.sitz ? d.sitz : null;
                if (!sitz) {
                    const bp = st.blueprints[e.type];
                    sitz = bp ? r._attachPointFor(bp, "sitz").point : null;
                }
                const basis = e.position.y - 0.5;
                const th = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const h = huefteRel();
                const dx = h.x - e.position.x;
                const dz = h.z - e.position.z;
                const lx = dx * Math.cos(th) - dz * Math.sin(th); // der Rahmen des Wagens (R_y(−θ))
                const lz = dx * Math.sin(th) + dz * Math.cos(th);
                rg.hips.getWorldDirection(V); // das Modell schaut längs +z
                const fx = e._fahrAchseX ? Math.cos(th) : Math.sin(th);
                const fz = e._fahrAchseX ? -Math.sin(th) : Math.cos(th);
                const cosB = (V.x * fx + V.z * fz) / Math.max(1e-9, Math.hypot(V.x, V.z));
                reiter.push({
                    typ,
                    oben: +(oben - basis).toFixed(3),
                    dach: d && d.huelle && Number.isFinite(d.huelle.yRoof) ? +(d.huelle.yRoof * sc).toFixed(3) : null,
                    schenkel: +(unten - basis).toFixed(3),
                    sitz: sitz ? +(sitz.y * sc).toFixed(3) : null,
                    ankerL: sitz ? +(lx - sitz.x * sc).toFixed(3) : null,
                    ankerQ: sitz ? +(lz - sitz.z * sc).toFixed(3) : null,
                    blickGrad: +((Math.acos(Math.max(-1, Math.min(1, cosB))) * 180) / Math.PI).toFixed(1),
                    lehneGrad: rg.spine ? +((-rg.spine.rotation.x * 180) / Math.PI).toFixed(1) : null,
                    aussen: hu ? aussen : null,
                    glas,
                });
                weg(e);
            }
            for (let i = 0; i < 6; i++) frame(i);
            S.reiter = reiter;
            const w1 = rigR().hips;
            S.reiterStand = {
                abw: +Math.hypot(w1.position.x - wurzel0.x, w1.position.z - wurzel0.z).toFixed(4),
                gier: +Math.abs(w1.rotation.y).toFixed(4),
            };
        }
        // L2 DIE SPALTKANTE: 11,4 m/s in +x auf den Rand des 23-m-Spalts (−904/−975) — der Wagen stand in EINEM Schritt (11,44 →
        // 0,19 m/s), Gas danach 0,00 m, der Bug über der Kante. Soll: er fährt über die Kante und FÄLLT.
        // Seit K16 (die Canyon-Maske fiel) liegt an −904/−975 kein Spalt mehr, sondern ein Hang (0,6 m je m) mit einer Eiche
        // (−904,5/−976) in der Bahn, und im Kilometer um die Mess-Wiese trägt keine Kante einen stetigen Anlauf (die nächste,
        // −1394/−950 in −z, fällt 11,2 m, ihr Anlauf springt 1,27 m je m). Der Ort kommt aus dem Gesetz: die Kliffs trägt das
        // Schicht-Gesetz, `schichtOrt` nennt die Treppe am stärksten Tafelland-Tal im 16-km-Feld um die Wiese; um sie herum
        // (4-m-Ringe, bis 400 m, je Ort die vier Achsen) die nächste Kante, hinter der der Boden 6–7 m weiter mindestens
        // STATION.randM + 1 tiefer liegt, davor 8 m trockener, stetiger Anlauf (≤ 0,5 m je m) — und, wenn die Welt dort steht
        // (240 Frames), kein Blocker in ±2,5 m von 10 m davor bis 8 m dahinter.
        // L2 läuft ZULETZT: die Suche trägt den Spieler zum Schicht-Ort (Kilometer fort), danach streamt die Welt um die
        // Wiese neu — vor L8 gefahren, las der Lockstep dort 0,4 mm je Bildrate (0 ohne die Reise).
        const kante = await (async () => {
            const GK = globalThis.__gelaendeCore;
            const so = GK.schichtOrt(r._gelaende(), mo[0] - 8000, mo[1] - 8000, mo[0] + 8000, mo[1] + 8000);
            if (!so) return null;
            const frei = (kx, kz, ux, uz) => {
                for (const e of st.architectures) {
                    if (!e || !e.position || !e.blockerAABBs || Math.hypot(e.position.x - kx, e.position.z - kz) > 40)
                        continue;
                    for (const b of e.blockerAABBs) {
                        const cx = (b.minX + b.maxX) / 2 - kx;
                        const cz = (b.minZ + b.maxZ) / 2 - kz;
                        const l = cx * ux + cz * uz;
                        const q = Math.abs(cx * uz - cz * ux);
                        const h = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) / 2;
                        if (l > -10 - h && l < 8 + h && q < 2.5 + h) return false;
                    }
                }
                return true;
            };
            const ACHSEN = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ];
            let geladen = 0;
            for (let ring = 0; ring <= 100; ring++)
                for (let k = 0; k < (ring ? 8 * ring : 1); k++) {
                    const a = ring ? (k / (8 * ring)) * Math.PI * 2 : 0;
                    const kx = Math.round(so.x + Math.cos(a) * ring * 4);
                    const kz = Math.round(so.z + Math.sin(a) * ring * 4);
                    const rand = hh(kx, kz);
                    if (!Number.isFinite(rand)) continue;
                    for (const [ux, uz] of ACHSEN) {
                        const grund = Math.min(hh(kx + ux * 6, kz + uz * 6), hh(kx + ux * 7, kz + uz * 7));
                        if (!(rand - grund >= expected.randM + 1)) continue;
                        let ok = !nass(kx, kz);
                        for (let s0 = 1; s0 <= 8 && ok; s0++)
                            ok =
                                !nass(kx - ux * s0, kz - uz * s0) &&
                                Math.abs(hh(kx - ux * s0, kz - uz * s0) - hh(kx - ux * (s0 - 1), kz - uz * (s0 - 1))) <=
                                    0.5;
                        if (!ok || geladen >= 6) continue;
                        // die Welt an der Kante steht (Chunks und Streu), dann erst urteilt die Blocker-Wache
                        st.playerMesh.position.set(kx, rand + 2, kz);
                        for (let i = 0; i < 240; i++) frame(i);
                        geladen++;
                        if (frei(kx, kz, ux, uz)) return { x: kx, z: kz, ux, uz, grund, so };
                    }
                }
            return null;
        })();
        S.spalt = kante
            ? await lebenFahrt(
                  {
                      ort: [kante.x, kante.z],
                      start: [kante.x - kante.ux * 8, kante.z - kante.uz * 8],
                      gier: Math.atan2(kante.ux, kante.uz),
                      v0: 11.4,
                  },
                  150
              )
            : null;
        if (S.spalt) {
            S.spalt.randX = kante.x;
            S.spalt.randZ = kante.z;
            S.spalt.achse = [kante.ux, kante.uz];
            S.spalt.schichtOrt = [kante.so.x, kante.so.z];
            S.spalt.rand = hh(kante.x, kante.z);
            S.spalt.grund = kante.grund;
        }
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}

module.exports = { probeLeben };
