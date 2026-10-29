"use strict";
// scripts/lib/fahr-proben.cjs — die Seiten-Probe der Leben-Prüfung „Fahren“ (gate:fahr-leben), am Domänen-Tag Fahrt geteilt
// (Datei-Decke 4 000, PFLICHT-OFFEN D(3)): eine Seiten-Funktion, die scripts/diag-fahr-leben.cjs per page.evaluate fährt.

// ── DIE PROBE IN DER SEITE (Funktionsrumpf; r = die Welt). Fährt den echten Frame. ──
async function probeLeben(expected) {
    const res = {};
    await window.__weltDa();
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt);
    const P = Object.getPrototypeOf(r);
    const A = P.constructor; // die Klasse der Welt (Gesetze und Konstanten)
    const DT = 1 / 60;
    // KONSUM am Zähl-Spion: der Versorger o[k] zählt, während lauf() den Leser einmal ruft (ein Wurf danach entwertet ihn nicht)
    const ruft = (lauf, o, k) => {
        const eigen = Object.prototype.hasOwnProperty.call(o, k);
        const f0 = o[k];
        let n = 0;
        o[k] = function (...a) {
            n++;
            return f0.apply(this, a);
        };
        try {
            lauf();
        } catch {
            /* der Ruf zählt */
        } finally {
            if (eigen) o[k] = f0;
            else delete o[k];
        }
        return n > 0;
    };
    // Frame-Zeiten (ms): Frames ohne (8,3), mit einem (16,7 · 20 · 11,1) und mit zwei Sim-Schritten (25 · 33,3).
    const MUSTER = [16.7, 8.3, 25, 16.7, 33.3, 11.1, 20, 16.7];
    let tMs = performance.now();
    // DIE BAHN-WACHE (Fixture der Fahr-Stationen S2 · S3 · S4): solange eine Station fährt, fällt nach jedem Bild, was in
    // ihrer Bahn mit einer Hülle steht oder hineinwächst (Promotion um den Spieler) — gemessen wird die Fahr-Physik, nie der Wald.
    let bahnWache = null;
    const frame = (i) => {
        tMs += MUSTER[i % MUSTER.length];
        r._gameLoopTick(tMs);
        raeumen();
    };
    const bilder = (n, weiter = () => true) => {
        for (let i = 0; i < n && weiter(); i++) frame(i);
    };
    const raeumen = () => {
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
    // DIE ECHTE VERTIKALE (`isInAir` ist im Sattel bedingungslos geerdet). Nach jedem Sim-Schritt: (a) der Reiter sitzt auf
    // dem Sitz seines Werks (Basis − 0,5 + Sitz-Höhe + Hub der Feder, ±0,05 m), (b) ein Gesetz-Wagen, den der Kern geerdet
    // nennt, steht auf mindestens einem seiner vier Aufstandspunkte (≤ 0,05 m darüber), (c) steht das Werk, gilt der Reiter
    // nicht als in der Luft.
    const inDerLuft = () => {
        const pl = st.player;
        const me = pl && pl.mountedArch !== null && pl.mountedArch !== undefined ? r._mountedEntry : null;
        if (!me || !me.position) return !!st.isInAir;
        const fz = me._fahr;
        if (st.isInAir && !(fz && fz.luft)) return true;
        const sitz = Number.isFinite(me._sitzHeight) ? me._sitzHeight : 0;
        const hub = fz && Number.isFinite(fz.fHub) ? fz.fHub : Number.isFinite(me._rideHeave) ? me._rideHeave : 0;
        if (Math.abs(st.playerMesh.position.y - (me.position.y - 0.5 + sitz + hub)) > 0.05) return true;
        if (!fz || fz.luft || !Number.isFinite(fz.y)) return false;
        const a = r._rittAufstand(me);
        const boden = r._fahrBoden(me);
        const yk = gierUnwrap(me) - Math.PI / 2; // der Rahmen des Kerns
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
    // die Eingabe, die der Welt-Schritt dem Kern gab (Verb-Tafel, Tiefe, Haft, Wind am Ort): die Labor-Spur fährt genau sie
    const kraefte = VC.fahrKraefte;
    VC.fahrKraefte = function (q, e, G, dt) {
        z.eLetzt = e;
        if (z.spur && z.ent && q === z.ent._fahr) z.e = e;
        return kraefte.call(this, q, e, G, dt);
    };
    // der Spion am Sim-Schritt: nach (und vor) jedem Schritt der Welt; der Rückgabewert stellt den vorigen wieder her
    const nachSchritt = (nach, vor) => {
        const echt = r._stepFixedSim;
        r._stepFixedSim = function (simTime, dt) {
            if (vor) vor(dt);
            echt.call(this, simTime, dt);
            nach(dt);
        };
        return () => (r._stepFixedSim = echt);
    };
    r._stepFixedSim = function (simTime, dt) {
        const m = st.playerMesh.position;
        const x0 = m.x;
        const z0 = m.z;
        z.e = null;
        P._stepFixedSim.call(this, simTime, dt);
        const e = z.e;
        if (z.an) {
            z.simWeg += Math.hypot(m.x - x0, m.z - z0);
            z.schritte++;
            if (inDerLuft()) z.luft++;
        }
        if (z.spur && z.ent && z.ent._fahr) {
            const q = z.ent._fahr;
            z.spur.push({ e, dt, x: q.x, z: q.z, yaw: q.yaw, y: q.y, luft: q.luft, v: q.vlong, kontakt: z.kontakt });
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
    // DIE WINDSTILLE (Fixture der ganzen Probe): der Wind am Wagen (wetter.K5, `_fahrWind`) ist eine Funktion der Sim-Uhr, und
    // die trägt die Wanduhr des Boots und jedes Wartens auf Bau und Welt — gleicher Ort, gleiche Saat: 0,35 gegen 1,75 m/s je
    // Lauf. Seit er am 24.10. in den Wagen kam, streuten S3 (Quer-Abdrift 0,333–0,361 m am selben Ort) und L8 (3,5 cm
    // zwischen 60 fps und gemischten Bildern, die zu verschiedenen Sim-Zeiten fahren). Die Linse misst das Fahr-Gesetz; den
    // Wind am Wagen misst sein eigenes Gesetz (wetter.K5). Fehlt das Glied, ruft die Probe den Täter beim Namen.
    if (!r._fahrWind) throw new Error("Windstille: _fahrWind fehlt");
    r._fahrWind = () => ({ x: 0, z: 0 });
    // DIE TROCKENHEIT (Fixture der ganzen Probe, wie die Windstille): der erste Takt der Seite zieht das Wort der Front am Ort
    // zur Welt-Uhr (feld.K2#2) — an der Mess-Wiese zur Uhr 0 Regen; die Nässe senkt die Haftung am Rad (`_fahrHaft`) und geht
    // mit der Welt-Uhr, nie im Sim-Schritt: S4 hob nicht ab (0,08 m über dem Grund), L8 ging ab Schritt 1 auseinander (0,10 m).
    // Das Wort des Spielers hält Sonne und Trockenheit über den EINEN Schreiber; die Nässe am Rad misst die Kette W (feld.K1).
    const wetter = (wort, s) => {
        r._setWeather(wort, "human");
        st.weatherTransition = null; // der Übergang fällt: das Wort steht ab diesem Takt
        r._naesseTakt(s);
    };
    wetter("sunny", 1e6);
    const aufraeumen = () => {
        delete r._loopFixedStep;
        delete r._stepFixedSim;
        delete r._stepCharacter;
        delete r._fahrWind;
    };
    const tasten = (w, a) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
        st.keys.a = !!a;
    };
    const hh = (a, b) => r.getTerrainHeightAt(a, b);
    // der ebene Abstand zweier Lagen (x, z) und das Tempo des Spielers in der Ebene
    const flach = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
    const spielerTempo = () => Math.hypot(st.playerVel.x(), st.playerVel.z());
    const nass = (a, b) => {
        const ws = r._atlasWaterLevelAt(a, b, hh(a, b)); // der Spiegel des Gesetzes (wie gate:vehicle-drive)
        return Number.isFinite(ws) && ws > hh(a, b) - 0.3;
    };
    // Die Strecke: trocken, eben, Fahrt in +x — der nächste Ring um die Mess-Wiese (32 m, bis 512 m) mit Stufe ≤ 0,16 m je 2 m
    // und Quergefälle ≤ 0,05 m je m, darin die kleinste Stufe (welt-orte `strecke`).
    const mo = expected.messort;
    const start = window.__strecke(mo, 16, 0.16, 0.05, true);
    res.start = start;
    if (!start) {
        aufraeumen();
        return res;
    }
    // DER SPIELER STEHT bei (x, z), `h` m über dem Gesetz, ohne Fahrt.
    const stelle = (x, zz, h) => {
        st.playerMesh.position.set(x, hh(x, zz) + h, zz);
        st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
    };
    // DIE TIERE STEHEN (Fixture): ein Steuer-Gesetz, dessen Schritt das Tempo nullt — nur ein Stoß bewegt sie; zurück → das alte.
    const tiereStehen = () => {
        const roh = A._steuerGesetz;
        const steht = Object.create(roh.call(A));
        steht.steuerSchritt = (sw) => (sw.v = 0);
        A._steuerGesetz = () => steht;
        return () => (A._steuerGesetz = roh);
    };
    // EIN TIER der Probe (ruhig, am genauen Ort; die Kappe der Welt lässt es zu)
    const tier = (x, y, zz, art, bodySize) => {
        st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
        return r.spawnCreatureAt(x, y, zz, "calm", art, { precise: true, bodySize });
    };
    // DIE STRASSE der Proben: 6 m breit von (x, z) längs `fahrt` über `L` m, über den Hebel der Dörfer (`_stlWegeBuild`: Boden,
    // Natur-Wand, Wiese) — der Weg der W-Kette (K8) und der Anlauf zur Klippe (S2, S4).
    const strasse = (x, zz, fahrt, L) =>
        r._stlWegeBuild({ roads: [{ pts: [{ x: 0, z: 0 }, { x: L * Math.sin(fahrt), z: L * Math.cos(fahrt) }], w: 6 }] }, { x, z: zz }, "probe:" + x);
    // DIE ANKUNFT: eine Station an einem neuen Ort misst erst, wenn die Welt um den Spieler steht (welt-boot `__weltStehtNach`).
    const ankommen = async (x, zz) => {
        stelle(x, zz, 2);
        await window.__weltStehtNach(frame);
    };
    // Ein Werk setzen, aufsitzen, einschwingen. `fahrt` = Fahrt-Richtung (sin, cos); ein Studio-Fahrzeug liegt längs x.
    const setzen = async (typ, x, zz, fahrt, vorAufsitzen) => {
        stelle(x, zz, 1.2);
        const rotY = typ.startsWith("fahrzeug_") ? fahrt - Math.PI / 2 : fahrt;
        const e = r.spawnArchitecture(
            typ,
            { x, y: hh(x, zz) + 0.5, z: zz },
            { silent: true, precise: true, rotationY: rotY }
        );
        if (!e) return null;
        // der Bau wartet im Takt der Probe (`frame`: Muster-Zeiten, die Bahn-Wache je Bild), nie im Takt der Seite — dessen
        // Wanduhr-Takt (`performance.now()`) trug je Lauf andere Schritte in die Welt, ehe der Wagen fuhr (Lehre 13)
        await window.__gebautNach(e);
        if (vorAufsitzen) vorAufsitzen(e);
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) return null;
        tasten(false);
        bilder(12); // einschwingen (Sitz, Ebene, Interpolation)
        return e;
    };
    // DER GT AM START, Fahrt +x: die Strecke der Proben (W-Kette, S1, Ritt-Takt, Tempo, Räder und mehr)
    const gtAmStart = () => setzen("fahrzeug_gt", start.x, start.z, Math.PI / 2);
    const weg = (e) => {
        r.dismountArchitecture();
        r.removeArchitecture(e);
    };
    // DIE ANFAHRT: der gesetzte Wagen fährt mit v m/s in seine Fahrt-Richtung (sin, cos) — der Kern und der Kontakt-Löser, aus
    // dessen Fahrt der Ritt je Sim-Schritt liest. Leser: die Bremsung der W-Kette (50 km/h), die Ankunft an der Klippe (S2, S4) und
    // an den Orten der Leben-Schau (L1, L2).
    const anfahren = (e, v, fahrt) => {
        e._fahr.vlong = v;
        st.playerVel.setValue(v * Math.sin(fahrt), st.playerVel.y(), v * Math.cos(fahrt));
        return e._fahr.x;
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
        let versatz = 0;
        let stufe = 0;
        for (let i = 0; i < n; i++) {
            const s0 = z.schritte;
            frame(i);
            // die Geritten-Wand: der Eintrag steht auf dem Reiter, seine Stufe ist 0
            const pm = st.playerMesh.position;
            versatz = Math.max(versatz, flach(e.position, pm));
            stufe = Math.max(stufe, r._foundryLodForEntry(e));
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
            v: spielerTempo(),
            versatz,
            stufe,
        };
    };
    // S1 WELT == LABOR: dieselbe Gerade, W, dann W + A; die Spur je Sim-Schritt gegen den Labor-Aufruf, dazu der Takt des Kerns
    // an jedem Schritt der Welt (`__taktHz` am Aufruf, den die Welt dem Kern gab). Leser: die Station S1 und die W-Kette (K8).
    const weltLabor = async () => {
        const g1 = await gtAmStart();
        let labor = null;
        if (g1 && g1._fahr) {
            const z0 = Object.assign({}, g1._fahr);
            z.ent = g1;
            z.spur = [];
            tasten(true, false);
            bilder(90);
            tasten(true, true);
            bilder(90);
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
            let hz = Infinity;
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
                if (!spur[n].e) {
                    [maxM, bei] = [Infinity, n]; // der Welt-Schritt rief den Kern nicht: kein Labor-Ritt
                    break;
                }
                hz = Math.min(hz, window.__taktHz(VC, q, spur[n].e, G, spur[n].dt)); // der Takt an diesem Schritt der Welt
                VC.fahrKraefte(q, spur[n].e, G, spur[n].dt);
                const d = Math.max(Math.hypot(q.x - spur[n].x, q.z - spur[n].z), Math.abs(q.yaw - spur[n].yaw));
                if (d > maxM) {
                    maxM = d;
                    bei = n;
                }
            }
            g1._fahr = fahrRoh;
            labor = { schritte: spur.length, maxM, bei, maxY, kontakte, weg: flach(q, z0), hz };
        }
        if (g1) weg(g1);
        return labor;
    };
    // W (feld.K1) DIE WETTER-KETTE: das Wort Sturm, 20 min per Sprung des Nässe-Schreibers; je Lage Regen-Feld, Nässe (= Uniform
    // des Stoffs), Grip (der Bremsweg `s` der Vollbremsung ab 50 km/h bis bremsV in Sim-Schritten), Brand und Licht: ein Herd
    // am Start fängt trocken (`_brandEntfachen`), glüht `aufS` Spielzeit lang auf, dann fällt das Wort und der Brand tut EINEN
    // Schritt auf seinem Takt (`_tickBrand`) — gemessen die Glut des Herds und die Stärke seines Feuers im Licht der Welt
    // (`_leuchtQuellen`, zur festen Bild-Uhr 0); Brand und Taten fallen vor der Bremsung. Gehalten wird der VORGÄNGER
    // (`festBrand`: der Takt des Brands); `stern` liest das Wort. K8 (fahrzeug.K1) auf demselben Gras: μ(gras) halb in der
    // Stoff-Zeile, dann derselbe Streifen als Weg über den Hebel der Dörfer (`_stlWegeBuild`) trocken und im Sturm, darauf S1
    // (Labor = Welt, Takt).
    const kette = async (K) => {
        const [P0, bV, out] = [Object.getPrototypeOf(r), VC.FAHR.schritt.bremsV, {}];
        await ankommen(start.x, start.z);
        const bremse = async () => {
            const e = await gtAmStart();
            if (!e || !e._fahr) return {};
            const x0 = anfahren(e, K.v0, Math.PI / 2);
            let s = 0;
            [z.spur, z.ent, st.keys.s] = [[], e, true];
            bahnWache = { sx: start.x, sz: start.z, ux: 1, uz: 0, len: 40, quer: 4, n: 0 }; // die Bahn frei (Kiefer bei 20 m)
            bilder(K.bremsMax, () => e._fahr.vlong > bV);
            bahnWache = null;
            for (const q of z.spur) {
                if (!(q.e && q.e.brake) || !(q.v > bV)) break;
                s = q.x - x0;
            }
            [z.spur, z.ent, st.keys.s] = [null, null, false];
            weg(e);
            return { s };
        };
        const lage = async (name, wort, halt) => {
            wetter("sunny", 1e6);
            const [n0, herd] = [(st.worldMeta.taten ||= []).length, r._brandEntfachen(start.x, start.z)];
            st.spielZeit += A.BRAND.aufS;
            r._tickBrand();
            const los = halt && halt();
            wetter(wort, K.sprungS);
            st.spielZeit += A.BRAND.schrittS;
            r._tickBrand();
            const q = r._leuchtQuellen(start.x, 0, start.z, 1e3).find((l) => l.id === herd);
            const m = { regen: r._weatherFieldFor(st.weather).rain, naesse: st.naesse, stoff: r._ensureAtmoUniforms().naesse.value };
            Object.assign(m, { brand: [...st.brandFeld.values()].includes(herd) ? herd.glut : 0, licht: q ? r._leuchtStaerke(q, 0) : 0 });
            st.brandFeld.clear();
            st.worldMeta.taten.length = n0;
            out[name] = Object.assign(m, await bremse());
            if (los) los();
        };
        const halte = (k, fn) => () => ((r[k] = fn), () => delete r[k]);
        const fest = halte("_naesseTakt", () => st.naesse);
        await lage("trocken", "sunny");
        await lage("sturm", "stormy");
        await lage("festRegen", "stormy", halte("_weatherFieldFor", () => P0._weatherFieldFor.call(r, "sunny")));
        await lage("festNaesse", "stormy", fest);
        await lage("festBrand", "stormy", halte("_tickBrand", () => {}));
        await lage("stern", "stormy", () => {
            const los = fest();
            r._fahrHaft = () => (r._weatherIsWet() ? 0.2 : 1);
            return () => los() && delete r._fahrHaft;
        });
        const gras = st.materials.gras;
        await lage("zeile", "sunny", () => ((gras.muRad /= 2), () => (gras.muRad *= 2)));
        strasse(start.x, start.z, Math.PI / 2, 72);
        await lage("weg", "sunny");
        await lage("wegNass", "stormy");
        wetter("sunny", 1e6);
        out.labor = await weltLabor();
        return out;
    };
    // DER HANG (T2 und die Rückmeldung RM) aus der Welt (welt-orte `hang`): das Gefälle über ±3 m
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
    // RM — DIE RÜCKMELDUNG (fahrzeug.K5): der GT fährt Glatt (auf dem Weg der Strecke, Vollgas), Drift (12 m daneben auf der
    // Wiese: Vollgas, dann Handbremse und volle Lenkung) und Hang (bergauf, Vollgas); je Bild die Kanäle an ihrem Ausgang — die
    // Federung im gezeichneten Bild (die Instanz-Matrix eines Aufbau-Blatts gegen den Rahmen der Räder, je Ecke der Hülle) mit dem
    // Boden-Stoß, das Rumble an einem Pad mit Stub-vibrationActuator mit dem Schlupf, die Stimme der Fahrt im Sattel und still
    // danach (ihre Tonhöhe je Drehzahl misst gate:klang-zensus F am Master-Bus). `mutiert`: dieselben Fahrten mit gekappter
    // Kopplung (hubBoden 0, das Rumble ohne Schlupf und Boden).
    const rueck = async (B) => {
        await r._weltbildKommt(); // unter dem Ladeschirm gehört der Welt kein Pad
        const el = document.getElementById("fahr-tacho");
        const sichtbar = () => el && !el.hidden && getComputedStyle(el).display !== "none";
        const tacho = { element: !!el, proben: 0, unsichtbar: 0, falsch: 0, maxKmh: 0 };
        const out = { hilfe: { zeilen: r._hilfeZeilen() }, tacho };
        r.initSymphony();
        const [stimmen, fx, hand] = [() => (st.symphony.fahrt || {}).size, [{}], [0, 0, 0, 0]];
        const akt = { effects: ["dual-rumble"], playEffect: (t, f) => (fx.push(f), Promise.resolve()), reset: () => fx.push({}) };
        navigator.getGamepads = () => [{ connected: true, axes: [0, 0, 0, 0], buttons: [], vibrationActuator: akt }];
        strasse(start.x, start.z, Math.PI / 2, 72);
        const orte = { glatt: [start.x, start.z, Math.PI / 2], drift: [start.x, start.z + 12, Math.PI / 2], hang: hang && [hang.x, hang.z, hang.fahrt] };
        const [M, L, Bu, V] = [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Vector3()];
        const lauf = async (n) => {
            const e = orte[n] && (await setzen("fahrzeug_gt", ...orte[n]));
            if (!e) return null;
            const [m, [x, zz, kurs]] = [{ bild: [] }, orte[n]];
            bahnWache = { sx: x, sz: zz, ux: Math.sin(kurs), uz: Math.cos(kurs), len: 90, quer: 8, n: 0 };
            // die Ecken der Hülle (Rahmen des Studio-Wagens, Bug +x) und ein Aufbau-Blatt, das er zeichnet
            const hu = r._fahrzeugGesetzFor(e).drive.huelle;
            const ecken = [hu.fAx, hu.rAx].flatMap((ax) => [-1, 1].map((q) => [ax, 0, (q * hu.spur) / 2]));
            const f = r._foundryFlattenFor(e, r._foundryPresetForEntry(e), e._servedLod ?? e._lodLevel);
            const k = f.leaves.findIndex((lf, i) => !lf.rad && e.instSlots[i] && st.archInstanceGroups.get(e.instSlots[i].key));
            L.copy(f.leaves[k].localMatrix).invert();
            for (let i = 0; i < B.bilder; i++) {
                const d = n === "drift" && i >= B.driftAb;
                tasten(true);
                [st.keys.d, st.keys.shift, z.eLetzt] = [d, d && i < B.driftAb + 80, null];
                frame(i);
                const fz = e._fahr;
                if (z.eLetzt) hand[2 * st.keys.shift + !!z.eLetzt.hand]++;
                if (i % 10 === 0 && el && ++tacho.proben) {
                    const [zahl, kmh] = [parseInt(el.textContent), Math.round(Math.abs(fz.vlong) * VC.FAHR.kmh)];
                    [tacho.unsichtbar, tacho.maxKmh] = [tacho.unsichtbar + !sichtbar(), Math.max(tacho.maxKmh, kmh)];
                    if (!(Math.abs(zahl - kmh) <= B.tachoKmh) && ++tacho.falsch === 1) tacho.beispiel = `zeigt ${zahl}, Fahrt ${kmh} km/h`;
                }
                // das Bild: der Aufbau, wie er gezeichnet ist (Instanz-Matrix × Blatt⁻¹), je Ecke über dem Rahmen der Räder; der
                // Boden-Stoß des Schritts; das letzte Rumble am Pad (stark, schwach)
                st.archInstanceGroups.get(e.instSlots[k].key).mesh.getMatrixAt(e.instSlots[k].slot, M);
                M.multiply(L);
                r._archEntryWorldMatrix(e, Bu, true);
                const { strongMagnitude: stark = 0, weakMagnitude: schwach = 0 } = fx[fx.length - 1];
                m.bild.push([ecken.map((p) => V.set(...p).applyMatrix4(M).y - V.set(...p).applyMatrix4(Bu).y), Math.abs(fz.bodenStoss || 0), stark, schwach]);
            }
            [bahnWache, m.klingt] = [null, stimmen()];
            weg(e);
            bilder(10);
            m.still = !stimmen();
            tacho.nachAbsteigenSichtbar = !!(tacho.nachAbsteigenSichtbar || sichtbar());
            return m;
        };
        const runde = async () => {
            const o = {};
            for (const n in orte) o[n] = await lauf(n);
            return o;
        };
        out.echt = await runde();
        out.hilfe.handbremseWirkt = hand[3] > 9 * hand[2] && !hand[1];
        out.hilfe.handbremseDetail = `Shift im Fahr-Schritt ${hand[3]}/${hand[2] + hand[3]} (ohne ${hand[1]}/${hand[0] + hand[1]}) Bilder`;
        // DIE MUTANTE: je Kanal die Kopplung gekappt (den stummen Motor schneidet gate:klang-zensus S13)
        const [pg, hb] = [A.PAD_GESETZ, VC.FAHR.schritt.hubBoden];
        A.PAD_GESETZ = { ...pg, rumble: { ...pg.rumble, schlupfVoll: Infinity, bodenVoll: Infinity } };
        VC.FAHR.schritt.hubBoden = 0;
        try {
            out.mutiert = await runde();
        } finally {
            [A.PAD_GESETZ, VC.FAHR.schritt.hubBoden] = [pg, hb];
        }
        return out;
    };
    // ── DIE FAHRT AUF DEM WEGENETZ (fahrzeug.K2, `expected.wegenetz` {orte, mutante, gleich}): die Orte (Zellen, je zwei Nachbarn
    // im Wegenetz) erwachen am Spieler wie im Spiel (der Dorf-Zug, `__anazhAutoSettlement`), ihre Feldwege legt das Gesetz; die
    // Route ist die kürzeste über das Netz (`_wegenetzRoute`) von der Mess-Wiese zum letzten Ort, der GT fährt sie mit dem
    // Fahrer am Steuer (`fahrerSetzen` → Verb-Tafel → der EINE Fahr-Schritt) in den Bildern der Probe (`gleich`: 60 fps); die
    // Zählung des Sim-Takts trägt der Fahrer (`F.takte`, `F.tempo`, `F.fest`). Je 10 m der Route der Boden am Wagen: dorf (ein
    // Haus in 25 m), wald (≥ 3 Bäume der Natur in 15 m), sonst wiese. `mutante` (die Weg-Erkennung aus): die Luftlinie.
    const wegenetz = async (o) => {
        await window.__weltDa(() => A._siedlungGesetz());
        let i = 0;
        const bild = () => (o.gleich ? r._gameLoopTick((tMs += 1000 / 60)) : frame(i++));
        const orte = o.orte.map((k) => r._wegenetzNachbarn(k) && r._wegenetzMemo.orte.get(k));
        for (const ort of orte) {
            stelle(ort.x + 30, ort.z + 30, 2);
            await window.__gebautNach("der Ort " + ort.key, { takt: bild, fertig: () => (r._bewohnerSiedlungen || new Map()).has(ort.key) });
        }
        await Promise.all([...r._wegenetzKanten.values()].map((k) => k.fertig));
        const [W, Z] = [{ x: mo[0], z: mo[1] }, orte[orte.length - 1]];
        const route = o.mutante ? [W, Z] : r._wegenetzRoute([W, Z]);
        if (!route) throw new Error("das Wegenetz trägt keine Route von der Wiese zum Ort " + Z.key);
        const [a, c] = route;
        await setzen("fahrzeug_gt", a.x, a.z, Math.atan2(c.x - a.x, c.z - a.z));
        const F = r.fahrerSetzen(route);
        const b = { wiese: 0, wald: 0, dorf: 0, weg: 0, n: 0 };
        const p = st.playerMesh.position;
        const nah = (x, m) => x && x.position && flach(x.position, p) < m;
        for (let bis = 0; i < 30000 && !F.ende; ) {
            bild();
            if (i % 4 === 3) await window.sleep();
            if (F.s < bis) continue;
            bis = F.s + 10; // je 10 m der Route: steht der Wagen auf Weg und Feldweg, welcher Boden trägt ihn
            const baeume = st.architectures.filter((x) => nah(x, 15) && r._istNatur(x) && /^baum_/.test(x.type)).length;
            b[st.architectures.some((x) => x && x.tuer && nah(x, 25)) ? "dorf" : baeume >= 3 ? "wald" : "wiese"]++;
            [b.weg, b.n] = [b.weg + r._aufWeg(p.x, p.z, 0), b.n + 1];
        }
        r.fahrerSetzen(null);
        const t = F.tempo;
        return { lang: Math.round(F.lang), weg: Math.round(F.s), ende: F.ende, schritte: F.takte, tempo: t, steck: F.fest, anteil: (t[8] + t[9] + t[10]) / F.takte,
            wegAnteil: b.weg / b.n, boden: { wiese: b.wiese / b.n, wald: b.wald / b.n, dorf: b.dorf / b.n }, lage: [p.x, p.z] };
    };
    if (expected.nurKette || expected.nurRueck || expected.wegenetz) {
        try {
            if (expected.nurRueck) res.rueck = await rueck(expected.rueck);
            else if (expected.wegenetz) res.wegenetz = await wegenetz(expected.wegenetz);
            else res.kette = await kette(expected.kette);
        } catch (e) {
            res.err = String((e && e.stack) || e);
        }
        aufraeumen();
        return res;
    }
    try {
        // (1) Der GT geradeaus, W gehalten (Fahrt +x).
        const gt = await gtAmStart();
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
                    st.playerVel.setValue(0, 0, 0);
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
        // (1b) T5 DAS TEMPO DER KAMERA (H3): ein GT aus dem Stand mit W in Third bis 12 m/s, dann zieht die Maus 10 Bilder
        // (state.yaw/pitch wie das mousemove) und lässt los; dazu die FOV-Schreiber über den Absenz-Helfer (__fehlt).
        const sicht5 = st.cameraMode;
        r.setCameraMode("third");
        const g5 = await gtAmStart();
        bilder(120, () => st._kamFovVersatz); // der Übergang des Sichtfelds klingt aus (`_kamFov`)
        if (g5) {
            const m5 = (res.tempo = window.__tempoSpion(VC, st.camera, (z5, vm) => z5 === g5._fahr && vm === g5._fahrSatz.vmax));
            m5.schreiber = [];
            bahnWache = { sx: start.x, sz: start.z, ux: 1, uz: 0, len: 90, quer: 8, n: 0 };
            tasten(true);
            bilder(400, () => !(g5._fahr.speed >= 12));
            for (let j = 0; j < 110; j++) {
                if (j < 10) [st.yaw, st.pitch] = [st.yaw + 0.12, st.pitch - 0.02];
                frame(j);
            }
            bahnWache = null;
            m5.ende();
            weg(g5);
            for (const o of [P, r.constructor])
                for (const k of Object.getOwnPropertyNames(o)) {
                    const f = Object.getOwnPropertyDescriptor(o, k).value;
                    if (typeof f === "function" && !window.__fehlt(f, /\.fov\s*=(?!=)/)) m5.schreiber.push(k);
                }
            // R2: Z wiederholt ohne Ziel im Blick, ein Rezept-Satz ohne Tempo-Felder
            const [fo, mel, ziel] = [r._foundry, [], [true, false]];
            Object.assign(r, { _hasMagnifyingInSight: () => ziel.shift(), _bruchMelden: (t) => mel.push(t), _foundryPresetFor: () => "k" });
            m5.zoom = r.setZoomActive(true) && r.setZoomActive(true);
            r.setZoomActive(false);
            r._foundry = { recipes: { k: { fx: { fahrprofil: { kamera: { dist: 1 } } } } } };
            r._vehicleProfile({ type: "k" });
            m5.laut = mel.some((t) => /fahrprofil\.kamera/.test(t));
            for (const k of ["_hasMagnifyingInSight", "_bruchMelden", "_foundryPresetFor"]) delete r[k];
            r._foundry = fo;
        }
        r.setCameraMode(sicht5);
        // (2) Am Hang ohne Taste: der GT steht bergauf (der Hang der Welt, oben vor der Rückmeldung gesucht).
        if (hang) {
            const gh = await setzen("fahrzeug_gt", hang.x, hang.z, hang.fahrt);
            res.gtHang = gh ? fahrt(gh, 180, false) : { gestartet: false };
            if (gh) weg(gh);
        }
        // (2b) T4 DER WECHSEL AM STEILHANG (F1, Kopf von diag-fahr-leben): bergab 8–11 m/s Third → Ego (W + A, Gier ≥ 75°) →
        // Third → Ego (W + D) → Third; je Bild jede zeichnende Stufe (`instSlots`, `instSlotsBand`, starres Blatt) gegen
        // `_archEntryWorldMatrix` × Blatt, der Gleichlauf des Wagens, in Third Azimut · Quer-Ruck · Höhe über seiner Ebene ·
        // `chaseKamera`; dann das erste Bild ohne Sim-Schritt nach dem Wiederaufstieg (der Wagen steht 1 rad gedreht).
        const steil = window.__weltOrt("hang", { min: 17, max: 32, basis: 3, bergab: [30, 12], rMax: 800 });
        const w = (res.wechsel = { gestartet: false, ort: steil && [Math.round(steil.x), Math.round(steil.z), steil.neigung] });
        if (steil) {
            const ab = steil.gier + Math.PI;
            const sicht0 = st.cameraMode;
            r.setCameraMode("third");
            let e = await setzen("fahrzeug_gt", steil.x, steil.z, ab);
            Object.assign(w, { gestartet: !!e, stufeM: 0, band: 0, ego: [], nach10: [], abV: [], abSprung: [], abFov: [] });
            const [M, B, V, U] = [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Vector3(), new THREE.Vector3()];
            const [gleich, ruck, hoch, spur] = [[], [], [], []];
            const kurs = () => e.rotationY + Math.PI / 2; // Studio-Wagen: Bug +x
            const wink = (a) => Math.round((Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) * 1800) / Math.PI) / 10;
            const pr = e && r._foundryPresetForEntry(e);
            let [i, n, q, ausEgo, fv, wf] = [0, 0, [], false, 0, 0];
            const bild = () => {
                const v = spielerTempo();
                [st.keys.w, st.keys.s] = [v < 8, v > 11];
                frame(i++);
                r._archEntryWorldMatrix(e, M);
                const lod = Number.isFinite(e._servedLod) ? e._servedLod : e._lodLevel;
                const f0 = r._foundryFlattenFor(e, pr, lod);
                const reihe = [[e.instSlots, f0, `L${lod}`]];
                if (e.instSlotsBand && f0 && ++w.band)
                    reihe.push([e.instSlotsBand, r._bandOhneZwilling(r._foundryFlattenFor(e, pr, e._lodBandLevel), f0), `L${e._lodBandLevel} (Band)`]);
                for (const [liste, f, wer] of reihe)
                    for (let k = 0; liste && f && f.leaves && k < Math.min(liste.length, f.leaves.length); k++) {
                        const g = !f.leaves[k].rad && st.archInstanceGroups.get(liste[k].key);
                        if (!g) continue;
                        V.setFromMatrixPosition(B.fromArray(g.mesh.instanceMatrix.array, liste[k].slot * 16));
                        const d = V.distanceTo(U.setFromMatrixPosition(B.multiplyMatrices(M, f.leaves[k].localMatrix)));
                        if (d > w.stufeM) [w.stufeM, w.stufeWer] = [+d.toFixed(2), wer];
                    }
                const tempo = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]) / ((b[2] - a[2]) / 1000);
                if (spur.push([e.position.x, e.position.z, tMs]) > 11) spur.shift();
                if (spur.length === 11 && tempo(spur[0], spur[10]) > 1)
                    gleich.push(Math.abs(tempo(spur[4], spur[5]) / tempo(spur[0], spur[10]) - 1));
                if (st.cameraMode !== "third") return;
                if (ausEgo) [wf, fv] = [Math.max(wf, Math.abs(st.camera.fov - fv)), st.camera.fov];
                const [c, f] = [st.camera.position, kurs()];
                const [dx, dy, dz] = [c.x - e.position.x, c.y - e.position.y, c.z - e.position.z];
                if (++n === 10 && ausEgo) w.nach10.push(wink(Math.atan2(-dx, -dz) - f));
                q.push([dx * Math.cos(f) - dz * Math.sin(f), tMs]);
                if (n > 15) ruck.push(window.__ruckJeBild(q.slice(-3)));
                const o = V.setFromMatrixColumn(M, 1).normalize();
                hoch.push((Math.asin((dx * o.x + dy * o.y + dz * o.z) / Math.hypot(dx, dy, dz)) * 180) / Math.PI);
            };
            const sicht = (s, a, d, k) => {
                [n, q, ausEgo, fv] = [0, [], st.cameraMode === "first", st.camera.fov];
                r.setCameraMode(s);
                [st.keys.a, st.keys.d] = [a, d];
                if (s === "third") for (let j = 0; j < k; j++) bild();
                else {
                    let [um, g0] = [0, kurs()];
                    for (let j = 0; j < 300 && um < (75 * Math.PI) / 180; j++, g0 = kurs()) {
                        bild();
                        um += Math.abs(Math.atan2(Math.sin(kurs() - g0), Math.cos(kurs() - g0)));
                    }
                    w.ego.push(Math.round((um * 180) / Math.PI));
                }
            };
            try {
                if (e) {
                    const [ux, uz] = [Math.sin(ab), Math.cos(ab)];
                    bahnWache = { sx: steil.x - ux * 30, sz: steil.z - uz * 30, ux, uz, len: 90, quer: 45, n: 0 };
                    sicht("third", false, false, 70);
                    sicht("first", true, false);
                    sicht("third", true, false, 70);
                    sicht("first", false, true);
                    sicht("third", false, true, 70);
                    w.abFov.push(+wf.toFixed(2)); // der Sicht-Wechsel Ego → Third: das Tempo-FOV gleitet wie beim Abstieg
                    // ABSTEIGEN IN VOLLER FAHRT (F1 b), in Third und (aufgesessen, Ego, neu auf ≥ 8,5 m/s) in Ego: der größte Weg der
                    // Kamera und der größte Schritt ihres Sichtfelds (H3: das Tempo-FOV fällt nie in einem Bild) je Bild, 3 Bilder
                    // vor bis 30 nach dem Abstieg
                    for (const s of ["third", "first"]) {
                        if (s === "first") {
                            // neu am Start-Ort bergab: der verlassene Wagen rutscht am Gras-Hang weiter, jenseits der Talsohle
                            // stand er hangauf (Gras μ 0,4 klettert keine 20°, fahrzeug.K1)
                            weg(e);
                            e = await setzen("fahrzeug_gt", steil.x, steil.z, ab);
                            r.setCameraMode(s);
                            tasten(true);
                        }
                        for (let j = 0; s === "first" && j < 300 && spielerTempo() < 8.5; j++) frame(i++);
                        const [c, p] = [st.camera.position, st.camera.position.clone()];
                        let [m, mf, f] = [0, 0, st.camera.fov];
                        for (let j = 0; j < 33; j++, m = Math.max(m, c.distanceTo(p)), p.copy(c)) {
                            if (j === 3) {
                                w.abV.push(+spielerTempo().toFixed(1));
                                r.dismountArchitecture();
                            }
                            frame(i++);
                            mf = Math.max(mf, Math.abs(st.camera.fov - f));
                            f = st.camera.fov;
                        }
                        w.abSprung.push(+m.toFixed(2));
                        w.abFov.push(+mf.toFixed(2));
                    }
                    bahnWache = null;
                    tasten(false);
                    // das ERSTE Bild nach dem Aufstieg (1 ms, ohne Sim-Schritt; trug es doch einen, steigt er neu auf)
                    for (let j = 0, s0; j < 3 && w.wiederauf == null; j++) {
                        r.dismountArchitecture();
                        e.rotationY += 1;
                        r.mountArchitecture(e);
                        [s0, tMs] = [st._fixedSimTime, tMs + 1];
                        r._gameLoopTick(tMs);
                        if (st._fixedSimTime === s0) w.wiederauf = wink(e.rotationY - r._rittGier(e, e._rideYaw));
                    }
                    weg(e);
                }
            } finally {
                bahnWache = null;
                r.setCameraMode(sicht0);
            }
            const pq = (a, p) => (a.sort((x, y) => x - y), a.length ? +a[Math.floor(a.length * p)].toFixed(3) : null);
            Object.assign(w, { ruckN: ruck.length, ruckP95: pq(ruck, 0.95), gleichN: gleich.length, gleichP95: pq(gleich, 0.95) });
            Object.assign(w, { hochN: hoch.length, hochP05: pq(hoch, 0.05) });
        }
        // (3) Das Pferd: der richtungs-folgende Ritt ohne Lenk-Gesetz (W in Blick-Richtung +x).
        st.yaw = Math.PI / 2;
        const ross = await setzen("reittier_holzross", start.x, start.z, Math.PI / 2);
        res.ross = ross ? fahrt(ross, 180, true) : { gestartet: false };
        if (ross) weg(ross);

        // ═══ S — DIE STATIONEN (Q13) ═══
        const S = (res.stationen = { kern: !!(VC && typeof VC.fahrSchritt === "function") });
        // R — DIE RÄDER IN DER INSTANZ: dieselbe Gerade; W (1,5 s), dann S (Vollbremsung, 1 s), dann W + A. Je
        // Sim-Schritt die Rad-Leaves (`lf.rad`) RELATIV zum Aufbau (dreht, lenkt das Rad?) und der Aufstand (Naben-Mitte − radR
        // gegen den Boden); ohne Rad-Leaves die Rad-Punkte der Aufbau-Matrix (fAx/rAx × ±Spur/2).
        const gR = await gtAmStart();
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
            let phase = "w";
            const ab5 = nachSchritt((dt) => {
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
                        if (!relStart.has(key)) relStart.set(key, yAchse);
                        const y0 = relStart.get(key);
                        const c =
                            (y0[0] * yAchse[0] + y0[1] * yAchse[1] + y0[2] * yAchse[2]) /
                            (Math.hypot(...y0) * Math.hypot(...yAchse));
                        rolle = Math.max(rolle, Math.acos(Math.max(-1, Math.min(1, c))));
                        if (phase === "a") {
                            // Gier der Nabe im Aufbau: die Achse z des Rades (die Drehachse) gegen die Quer-Achse z des Aufbaus
                            const zA = [e[8], e[9], e[10]];
                            const gier = Math.abs(Math.atan2(zA[0], Math.abs(zA[2])));
                            if (rd.front) lenk = Math.max(lenk, gier);
                            else lenkHinten = Math.max(lenkHinten, gier);
                        }
                    }
                } else {
                    for (const ax of [hu.fAx, hu.rAx])
                        for (const sz of [-1, 1]) {
                            v3.set(ax, 0, (sz * hu.spur) / 2).applyMatrix4(B);
                            punkte.push({ front: ax === hu.fAx, x: v3.x, y: v3.y, z: v3.z });
                        }
                }
                let spalt = 0;
                for (const p of punkte) {
                    const d = p.y - hh(p.x, p.z);
                    spalt = Math.max(spalt, Math.abs(d));
                    if (phase === "s" && p.front) tauchBremse = Math.max(tauchBremse, -d);
                }
                spalte.push(spalt);
            });
            tasten(true, false);
            bilder(90);
            phase = "s";
            for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
            st.keys.s = true;
            bilder(40);
            st.keys.s = false;
            phase = "a";
            tasten(true, true);
            bilder(60);
            tasten(false);
            ab5();
            spalte.sort((a, b) => a - b);
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
            };
            weg(gR);
        }
        // P — DIE KERN-PFLICHT IM SPIEL: ein alter Kern ohne fahrGesetz/fahrEbene muss LAUT brechen
        // (`_kernPflichtBruch`), nie still null liefern (dann ritt der Gesetz-Wagen richtungs-folgend). Die Probe tauscht das
        // Kern-Objekt gegen eine Kopie ohne die beiden Funktionen (wie ein Boot mit altem Kern) und ruft die zwei Leser.
        const gP = await gtAmStart();
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
            // KONSUM (P2): beide Leser lesen den echten Kern durch den EINEN Pflicht-Leser
            gP._fahrSatz = null;
            gP._fahrSatzKey = null;
            const leser =
                ruft(() => r._fahrSatz(gP, r._vehicleProfile(gP)), A, "_fahrSchrittGesetz") &&
                ruft(() => r._rittEbene(gP, gP.position.x, gP.position.z, gP._rideYaw), A, "_fahrSchrittGesetz");
            window.__vehicleCore = alt;
            try {
                gP._fahrSatz = null;
                gP._fahrSatzKey = null;
                S.pflicht = {
                    leser,
                    satz: fang(() => r._fahrSatz(gP, r._vehicleProfile(gP))),
                    ebene: fang(() => r._rittEbene(gP, gP.position.x, gP.position.z, gP._rideYaw)),
                };
            } finally {
                window.__vehicleCore = echt;
            }
            weg(gP);
        }
        // S2 KLIPPE: Anlauf 24 m trocken und eben (≤ 0,3 m je 2 m), dann an einer KANTE binnen 3 m mehr als 3 m und binnen
        // 6 m 6–14 m Fall. Das Kliff kommt aus der Welt (welt-orte `kante`): die nächste Stelle um die Mitte der Welt, dort
        // die schärfste der 8 Richtungen.
        const kOrt = window.__weltOrt("kante", { kanteMin: 3, fall: [6, 14], schritt: 4, rMax: 1600 });
        const kl = kOrt
            ? { x: kOrt.x, z: kOrt.z, fall: kOrt.fall, kante: kOrt.kante, fahrt: kOrt.gier, sx: kOrt.sx, sz: kOrt.sz }
            : null;
        S.klippeOrt = kl;
        // DIE BAHN IST FREI (Fixture der Klippen-Stationen): der gesetzte Wagen stößt einen Remesh seines Chunks an, die Welt
        // streut dort neu ein; vor dem Aufsitzen läuft sie 60 Frames, die Bahn-Wache räumt, was auf dem Anlauf blockt. Der Wagen
        // kommt mit 12 m/s auf einem Weg an (`anfahren`, `strasse`): die Bahn liegt quer 16–45° geneigt, Gras hält quer bis 21,8°
        // (μ 0,4), der Weg bis 35° (fahrzeug.K1) — aus dem Stand rutschte er trotz des Fahrers der Linie 9 m talwärts an der Kante
        // vorbei, auf Gras flog er an einer Welle 80 m weiter mit 0,50 m. Klippen dieser Welt sind Hang-Kanten: im Umkreis 1,6 km
        // liegt keine Bahn flacher als 27,8°.
        const bahnFrei = () => {
            bilder(60);
        };
        if (kl) strasse(kl.sx, kl.sz, kl.fahrt, 24);
        const klippenBahn = (k) => ({
            sx: k.sx,
            sz: k.sz,
            ux: Math.sin(k.fahrt),
            uz: Math.cos(k.fahrt),
            len: 32,
            quer: 6,
            n: 0,
        });
        // DER FAHRER DER LINIE ist der Fahrer des Spiels (`fahrerSetzen`, fahrzeug.K2): er hält auf der Linie der Bahn auf die Kante zu
        // (200 m in ihrer Fahrt — er bremst vor keinem Ende); bis dahin lenkte ein zweiter Fahrer der Linse mit A und D.
        const linie = (k) => r.fahrerSetzen([{ x: k.sx, z: k.sz }, { x: k.sx + Math.sin(k.fahrt) * 200, z: k.sz + Math.cos(k.fahrt) * 200 }]);
        if (kl) {
            bahnWache = klippenBahn(kl);
            const g2 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei);
            if (g2) {
                anfahren(g2, 12, kl.fahrt);
                linie(kl);
                let yv = g2.position.y;
                let sprung = 0;
                let luft = 0;
                let schritte = 0;
                const ab2 = nachSchritt(() => {
                    sprung = Math.max(sprung, Math.abs(g2.position.y - yv));
                    yv = g2.position.y;
                    schritte++;
                    if (g2._fahr && g2._fahr.luft) luft++;
                });
                for (let i = 0; i < 420; i++) frame(i);
                r.fahrerSetzen(null);
                bilder(60);
                ab2();
                const unterGrund = g2.position.y - 0.5 - hh(g2.position.x, g2.position.z);
                S.klippe = {
                    sprung,
                    luft,
                    schritte,
                    ueberGrund: unterGrund,
                    fall: kl.fall,
                    wache: bahnWache.n,
                };
                weg(g2);
            }
            bahnWache = klippenBahn(kl);
            // S4 ABSTEIGEN IM FLUG: dieselbe Klippe, W bis der Wagen `STATION.flugM` über dem Boden fliegt, dann absteigen; 240
            // Frames später steht er auf der Ebene seiner Räder (≤ 0,05 m), gefallen ohne Höhen-Sprung > 0,5 m je Sim-Schritt.
            const g4 = await setzen("fahrzeug_gt", kl.sx, kl.sz, kl.fahrt, bahnFrei);
            if (g4) {
                anfahren(g4, 12, kl.fahrt);
                linie(kl);
                let hoehe = 0;
                let hoeheMax = -Infinity;
                let luftN = 0;
                let gefahren = 0;
                for (let i = 0; i < 420; i++) {
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
                r.fahrerSetzen(null);
                const imFlug = !!(g4._fahr && g4._fahr.luft);
                r.dismountArchitecture();
                let yv = g4.position.y;
                let sprungAb = 0;
                const ab7 = nachSchritt(() => {
                    sprungAb = Math.max(sprungAb, Math.abs(g4.position.y - yv));
                    yv = g4.position.y;
                });
                bilder(240);
                ab7();
                const eb = r._rittEbene(g4, g4.position.x, g4.position.z, g4._rideYaw);
                const bodenY = eb ? eb.y : hh(g4.position.x, g4.position.z);
                S.absteigen = {
                    diag: diag4,
                    imFlug,
                    hoehe,
                    ueberBoden: g4.position.y - 0.5 - bodenY,
                    sprung: sprungAb,
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
        // aus dem GESETZ (welt-orte `querhang`: Höhe, Land, Nässe — nie die gestreamten Bauten, die je Lauf anders geladen
        // waren: drei Orte, 0,27–0,35 m), angekommen an der stehenden Welt (der Fixpunkt), die Tiere stehen, die Bahn-Wache
        // räumt die Fahrt-Linie von Bauten und Stämmen (wie die Gasse von H) — dieselbe Saat fährt dieselbe Abdrift.
        const qOrt = window.__weltOrt("querhang", { schritt: 4, rMax: 1600 });
        const qh = qOrt ? { x: qOrt.sx, z: qOrt.sz, grad: qOrt.neigung, fahrt: qOrt.gier } : null;
        S.querOrt = qh;
        if (qh) {
            await ankommen(qh.x, qh.z);
            const los3 = tiereStehen();
            bahnWache = { sx: qh.x, sz: qh.z, ux: Math.sin(qh.fahrt), uz: Math.cos(qh.fahrt), len: 24, quer: 4, n: 0 };
            raeumen(); // die Bahn ist frei, ehe der Wagen steht (eine Birke bei −0,5 m stieß ihn je Lauf oder nicht)
            const g3 = await setzen("fahrzeug_gt", qh.x, qh.z, qh.fahrt);
            if (g3) {
                // Die QUER-ABDRIFT talwärts: je Sim-Schritt die Geschwindigkeit quer zum Bug, auf die tiefe Seite gezählt
                // (ohne Quer-Hangabtrieb tötet der Reifen jede Quer-Fahrt: 0) — über genau 110 Sim-Schritte (die
                // Uhr des Gesetzes; 100 Muster-Bilder trugen je nach Rest des Akkumulators 110 oder 111), in der Windstille
                // der Probe — gemessen wird der Quer-Hangabtrieb, nie das Wetter.
                let drift = 0;
                let rest3 = 110;
                const ab3 = nachSchritt((dt) => {
                    if (rest3-- <= 0) return;
                    const ry = gierUnwrap(g3);
                    const lx = Math.cos(ry);
                    const lz = -Math.sin(ry);
                    const x = g3.position.x;
                    const zz = g3.position.z;
                    const steigLinks = (hh(x + lx, zz + lz) - hh(x - lx, zz - lz)) / 2;
                    const v = st.playerVel;
                    drift += (v.x() * lx + v.z() * lz) * -Math.sign(steigLinks) * dt;
                });
                tasten(true, false);
                bilder(200, () => rest3 > 0);
                tasten(false);
                ab3();
                S.quer = { drift, weg: flach(g3.position, qh), wache: bahnWache.n };
                weg(g3);
            }
            los3();
            bahnWache = null;
        }

        // ═══ H — DIE HÜLLE ALS KÖRPER ═══ Auf einer freien, trockenen, flachen Gasse (kein fremder Blocker in
        // ±2,5 m auf 16 m) steht 9 m vor dem Wagen ein Hindernis; der GT fährt mit W hinein. Gemessen: das EINDRINGEN der
        // Wagen-Hülle (exportDrive.huelle, 0,1-m-Raster) in die Blocker-Boxen eines Felsblocks (`stein_block`) und den Leib
        // eines Bären, und der kleinste Abstand am Ende (sonst wäre 0 Eindringen vakuös).
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
                        if (frei(x, zz, Math.sin(a), Math.cos(a))) return { x, z: zz, fahrt: a, ux: Math.sin(a), uz: Math.cos(a) };
                    }
                }
            return null;
        })();
        S.gasse = gasse;
        // H1/H2/H7/H8 (der Wagen gegen Fels, Bär, gedrehte Wände) misst gate:kollision-bild (V) — der Bär quer zur Fahrt für H3
        const quer = Number.isFinite(gasse && gasse.fahrt) ? gasse.fahrt + Math.PI / 2 : 0;
        // H3 — EIN WESEN SCHIEBT KEINEN WAGEN: der GT steht (keine Taste), ein Bär steht 0,5 m tief in seinem Bug (er lief
        // hinein); 60 Frames später darf der Wagen sich nicht bewegt haben (das Ausweichen ist Sache des Wesens).
        if (gasse) {
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (gS) {
                const h = r._fahrzeugGesetzFor(gS).drive.huelle;
                const { ux, uz } = gasse;
                const x0 = gS.position.x;
                const z0 = gS.position.z;
                const ab = h.noseX;
                const c = tier(x0 + ux * ab, hh(x0 + ux * ab, z0 + uz * ab) + 0.5, z0 + uz * ab, "baer");
                if (c) {
                    // quer zur Fahrt, seine Flanke 0,5 m tief im Bug — gemessen an SEINEM Leib (`_kreaturLeib`, D2)
                    c.rotation.y = quer;
                    const lb = r._kreaturLeib(c, 0, {});
                    const d = h.noseX + lb.radius - 0.5;
                    const cx = x0 + ux * d;
                    const cz = z0 + uz * d;
                    const cy = hh(cx, cz);
                    const halt = () => {
                        c.position.set(cx, cy, cz);
                        c.rotation.y = quer;
                    };
                    const ab6 = nachSchritt(halt, halt);
                    tasten(false);
                    bilder(60);
                    ab6();
                    S.huelleSchub = { weg: Math.hypot(gS.position.x - x0, gS.position.z - z0) };
                    // KONSUM (H5/H6): die Hülle gleitet über die EINE Schleife, Wagen und Tier lösen gegen den EINEN Leib
                    const k = [gS, r._fahrHuelle(gS), gS.position.x, gS.position.z, 0, 0, DT];
                    c.userData._huellenNah = null;
                    S.huelleKonsum = {
                        gleiten: ruft(() => r._fahrHuelleKontakt(...k), r, "_wandGleiten"),
                        leibWagen: ruft(() => r._fahrHuelleKontakt(...k), r, "_kreaturLeib"),
                        leibTier: ruft(() => r._kreaturHuellenKontakt(c, 0, c.position.x, c.position.z), r, "_kreaturLeib"),
                    };
                    r.removeCreature(c);
                }
                weg(gS);
                // die Kapsel zu Fuß (Schritt 5b) gleitet über dieselbe Schleife
                if (S.huelleKonsum) {
                    st.playerVel.setValue(2, 0, 0);
                    S.huelleKonsum.kapsel = ruft(() => r._stepCharacter(DT, performance.now()), r, "_wandGleiten");
                    st.playerVel.setValue(0, 0, 0);
                }
            }
        }
        // H4 — KEIN SCHUB INS GELÄNDE: die ECHTE Methode `_fahrHuelleKontakt` mit der echten Hülle des GT auf einer
        // synthetischen Welt (ein Objekt mit der Welt als Prototyp): eine senkrechte Gelände-Wand 0,3 m neben der rechten
        // Flanke, ein Kasten überlappt die linke Flanke 0,8 m und schiebt zur Wand hin. Die Hülle darf nicht in die Wand.
        {
            const gT = await gtAmStart();
            if (gT) {
                tasten(false);
                bilder(4);
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
                    // zehn Schritte nacheinander (der Schub je Schritt ist auf eine Rad-Stufe begrenzt): der Kasten
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

        // ═══ L — DIE ORTE DER LEBEN-SCHAU ═══
        // An GENAU den Orten der Leben-Schau, mit ihrem Tempo und ihrer Gier, durch den echten Sim-Schritt. Je Sim-Schritt:
        // `unter` — die Ebene der Räder (der Kern selbst: fahrEbene an der Lage und Gier des Stands) über der Höhe des Wagens,
        // solange er nicht fliegt; `schub` — was der Kontakt-Löser die Lage über die eigene Fahrt hinaus versetzte.
        const VCl = window.__vehicleCore;
        const lebenFahrt = async (L, n) => {
            // die Welt um den Ort steht (die Chunks und ihre Streu — der Glutbrunnen ist Welt-Genese)
            st.playerMesh.position.set(L.ort[0], hh(L.ort[0], L.ort[1]) + 2, L.ort[1]);
            bilder(240);
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
            const abF = nachSchritt(() => {
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
            }, () => {
                zug.schub = 0;
            });
            anfahren(gL, L.v0, L.gier);
            const x0 = gL.position.x;
            const z0 = gL.position.z;
            tasten(true, false);
            bilder(n);
            tasten(false);
            r._stepCharacter = PC;
            abF();
            VCl.fahrStand = standRoh;
            m.weg = Math.hypot(gL.position.x - x0, gL.position.z - z0);
            weg(gL);
            return m;
        };
        // L1 DER HANGFUSS: 9,3 m/s, Gier 92,3°, über den Hangfuß an einen Glutbrunnen — Soll: seine flache Box schiebt den
        // Wagen nie auf höheren Grund, die Höhe friert nie ein. Der Ort aus der Welt: der nächste Glutbrunnen am Dorf-Messort
        // (spec/profiband/haushalt.json `dorf`, `expected.dorf`), angefahren mit Tempo und Gier der Schau (Start 5,6 m,
        // Spieler 3,1 m vor ihm längs der Gier). Kein Glutbrunnen → vakuös, laut.
        const D = expected.dorf;
        await ankommen(D.x, D.z);
        let G = null;
        for (const e of st.architectures)
            if (e && e.position && /glutbrunnen/.test(e.blueprintName || e.name || e.type || ""))
                if (!G || flach(e.position, D) < flach(G.position, D)) G = e;
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
        // L3–L5 DER STOSS: der GT fährt mit W aus 9 m Anlauf in der freien Gasse auf ein Hindernis, das NICHT gehalten wird.
        // Kontakt = der erste Schritt, in dem der Kontakt-Löser Lage oder Fahrt nahm (`z.kontakt`); gemessen: die Fahrt davor
        // und danach (die kleinste in den 8 Schritten danach: Rückprall), der Weg des Getroffenen längs der Fahrt, die
        // Stoß-Ereignisse (`_stossEreignis`) und der Kamera-Ruck.
        const stossProbe = async (h) => {
            if (!gasse) return null;
            const gS = await setzen("fahrzeug_gt", gasse.x, gasse.z, gasse.fahrt);
            if (!gS) return null;
            const { ux, uz } = gasse;
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
            let vPrev = 0;
            const abF = nachSchritt(() => {
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
                if (h.je) h.je(ziel);
                vPrev = v;
                m.schritte++;
            }, () => {
                schrittEv = [];
            });
            tasten(true, false);
            bilder(150);
            tasten(false);
            abF();
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
                await window.__gebautNach(e);
                return e.blockerAABBs && e.blockerAABBs.length ? e : null;
            },
            lage: (e) => ({ x: e.position.x, z: e.position.z }),
            weg: (e) => r.removeArchitecture(e),
        });
        S.stossBaer = await stossProbe({
            setzen: (x, zz) => {
                // Größe 1 (die Gestalt-Masse wächst mit der Größe hoch drei: ein Bär der Größe 2 wiegt 2,7 t, mehr als der GT)
                const c = tier(x, hh(x, zz) + 0.5, zz, "baer", 1);
                if (!c) return null;
                c.position.set(x, hh(x, zz), zz);
                c.rotation.y = gasse.fahrt + Math.PI / 2; // quer zur Fahrt, die Flanke zum Bug
                r.assignCreatureTask(c, "wait");
                // Der Bär steht still: nur der Stoß bewegt ihn.
                if (!A.__steuerLos) A.__steuerLos = tiereStehen();
                return c;
            },
            lage: (c) => ({ x: c.position.x, z: c.position.z }),
            weg: (c) => {
                if (A.__steuerLos) A.__steuerLos(), delete A.__steuerLos;
                r.removeCreature(c);
            },
        });
        // K3 (physik.K3) DER FREIE KÖRPER (`_freiSchritt`), gemessen am Zustand des Lösers: (1) 5 Kisten fallen gestapelt in der
        // Gasse (10 cm Spalt, Gier und Versatz fest): bis alle schlafen, ihr Weg 3 s danach; wach (ohne Schlaf) ihr Weg von 2 bis
        // 4 s; die untere am Boden, jede auf der darunter (Höhen-Abstand der Schwerpunkte weniger beider halber Höhe). (2) das Fass
        // ist ein Hindernis der Stoß-Probe: der größte Winkel seiner Achse zur Lotrechten. Mutanten: Schwere 0, ohne Stoß.
        if (gasse) {
            const stapel = (wach) => {
                const [x, zz] = [gasse.x + gasse.ux * 12, gasse.z + gasse.uz * 12];
                const K = [0, 1, 2, 3, 4].map((k) => r.spawnArchitecture("kiste", { x: x + 0.03 * Math.sin(k), y: hh(x, zz) + 0.6 + 0.7 * k, z: zz }, { silent: true, precise: true, rotationY: k * 1.3 })._frei);
                const lage = () => K.map((k) => k.p.slice());
                const o = { m: K[0].m, ruheS: null, zittern: 0 };
                let [a, t0] = [null, tMs];
                bilder(wach ? 120 : 240, () => (o.ruheS === null && K.every((k) => k.schlaf) && ([o.ruheS, a] = [(tMs - t0) / 1000, lage()]), true));
                bilder(a || wach ? 180 : 0, () => (a = a || lage(), (o.zittern = Math.max(o.zittern, ...K.map((k, j) => Math.hypot(...k.p.map((v, d) => v - a[j][d]))))), true));
                o.boden = K[0].p[1] - K[0].hy - r._koerperBodenUnter(K[0].p[0], K[0].p[1], K[0].p[2]);
                o.fugen = K.slice(1).map((k, j) => k.p[1] - K[j].p[1] - k.hy - K[j].hy);
                for (const k of K) r.removeArchitecture(k.e, { still: true });
                return o;
            };
            const [FREI, schwere] = [A.FREI, st.gravity];
            S.frei = { kisten: stapel(false) };
            A.FREI = Object.freeze({ ...FREI, ruheS: Infinity });
            S.frei.wachZittern = stapel(true).zittern;
            [A.FREI, st.gravity] = [FREI, 0];
            S.frei.schwerelos = stapel(false);
            st.gravity = schwere;
            const fass = async () => {
                let kipp = 0;
                const m = await stossProbe({
                    setzen: (x, zz) => r.spawnArchitecture("fass", { x, y: hh(x, zz) + 0.5, z: zz }, { silent: true, precise: true }),
                    lage: (e) => ({ x: e.position.x, z: e.position.z }),
                    weg: (e) => r.removeArchitecture(e),
                    je: (e) => (kipp = Math.max(kipp, (Math.acos(Math.min(1, e._frei.R[4])) * 180) / Math.PI)),
                });
                return m && { kipp, vVor: m.vVor, vNach: m.vNach, weg: m.zielWeg };
            };
            S.frei.fass = await fass();
            r._freiStoss = () => {}; // die Mutante: der Wagen stößt den freien Körper nicht
            S.frei.fassOhneStoss = await fass();
            delete r._freiStoss;
        }
        // L6 SPIELER UND WAGEN: (a) der Spieler läuft (W) gegen die Flanke eines geparkten GT — der Stoß nimmt ihm
        // die Fahrt in den Wagen (er prallt ab, statt in die Box zu drücken), die Handbremse hält den Wagen (sie nimmt den
        // Stoß eines Menschen auf), der Spieler steckt nicht in ihm; (b) ein GT, angestoßen mit 5 m/s, rutscht auf den
        // stehenden Spieler zu — der Spieler bekommt seinen Impuls, der Wagen schiebt ihn nicht durch.
        if (gasse) {
            r.dismountArchitecture();
            await ankommen(gasse.x, gasse.z);
            const { ux, uz } = gasse;
            const gt = async (x, zz, rotY) => {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, zz) + 0.5, z: zz },
                    { silent: true, precise: true, rotationY: rotY }
                );
                if (e) await window.__gebautNach(e);
                return e && e.blockerAABBs && e.blockerAABBs.length ? e : null;
            };
            // der Abstand der Spieler-Kapsel (r 0,35) zur Hülle des Wagens (< 0: sie steckt in ihm), längs der Gasse im Rahmen
            // der gedrehten Box (`obb` { cx, cz, c, s, hx, hz }, lokal = (Δx·c − Δz·s, Δx·s + Δz·c)), die Welt-AABB nur Vorfilter.
            // Gezählt wird nur eine WAND des Lösers (`_resolveCapsuleVsAABB`): Oberkante über der Stufe des Fußes (Fuß +
            // PLAYER_STEP_UP), Unterkante unter dem Kopf — eine Box, die der Fuß als Stufe nimmt, trägt ihn (Parkour).
            const kapselAbstand = (e) => {
                const pmP = st.playerMesh.position;
                const fuss = pmP.y - A.PLAYER_FOOT_OFFSET;
                const kopf = pmP.y + A.PLAYER_FOOT_OFFSET;
                let d = Infinity;
                for (const b of e.blockerAABBs) {
                    if (!(b.topY > fuss + A.PLAYER_STEP_UP && b.botY < kopf)) continue;
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
                return d - A.PLAYER_WALL_RADIUS;
            };
            const sw = { a: null, b: null };
            // (a) der GT quer zur Gasse 8 m voraus, der Spieler 3,5 m vor der Gasse, Blick und W längs der Gasse
            {
                const e = await gt(gasse.x + ux * 8, gasse.z + uz * 8, gasse.fahrt);
                if (e) {
                    const sx = gasse.x + ux * 3.5;
                    const sz = gasse.z + uz * 3.5;
                    stelle(sx, sz, 1.2);
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
                    m.wagenWeg = flach(e.position, p0);
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
                    stelle(sx, sz, 1.2);
                    tasten(false);
                    bilder(20); // der Spieler steht
                    const G = r._fahrStossSatz(e);
                    const m = { minAbstand: Infinity, spielerDv: 0, angestossen: !!G };
                    if (G) r._fahrWagenStoss(e, G, -ux * 5, -uz * 5);
                    for (let i = 0; i < 180; i++) {
                        frame(20 + i);
                        m.minAbstand = Math.min(m.minAbstand, kapselAbstand(e));
                        m.spielerDv = Math.max(m.spielerDv, spielerTempo());
                    }
                    r.removeArchitecture(e);
                    sw.b = m;
                }
            }
            S.spielerWagen = sw;
        }
        // L8 LOCKSTEP: ein GT (W) gegen einen stehenden Bären — die Lage nach 200 Sim-Schritten bei 60 fps = gemischt.
        if (start && gasse) {
            r.dismountArchitecture();
            await ankommen(start.x, start.z);
            const KADENZ = { 60: [1000 / 60], gemischt: [8, 33, 16, 25, 12, 30, 20, 9, 33, 14] };
            const lauf = (muster, n, nachJedem) => {
                for (let i = 0; i < n; i++) {
                    tMs += muster[i % muster.length];
                    r._gameLoopTick(tMs);
                    if (nachJedem && nachJedem(i) === false) break;
                }
            };
            const los = tiereStehen();
            try {
                const { ux, uz } = gasse;
                let simUhr;
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
                    // DER GLEICHE START: beide Läufe beginnen am RUHENDEN Wagen — gewartet wird auf das Ereignis (der
                    // Fahr-Zustand ändert sich drei Bilder lang um höchstens 1 nm), nie auf die Wanduhr; der Stand reist mit.
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
                    st.maxCreatures = st.creatures.length; // die Kappe lässt genau ihn zu: die Welt streut im Lockstep keins ein
                    const b = tier(bx, hh(bx, bz) + 0.5, bz, "baer", 1);
                    if (!b) {
                        weg(gS);
                        return null;
                    }
                    b.position.set(bx, hh(bx, bz), bz);
                    b.rotation.y = gasse.fahrt + Math.PI / 2;
                    b.userData._steuer = { gier: b.rotation.y, v: 0 };
                    b.userData._stossV = null;
                    st._fixedAccumulator = 0;
                    st._fixedSimTime = simUhr ??= st._fixedSimTime;
                    let schritte = 0;
                    let lage = null;
                    const spur = [];
                    const abF = nachSchritt(() => {
                        schritte++;
                        {
                            const sv = b.userData._stossV;
                            const pmT = st.playerMesh.position;
                            let nah = 0;
                            for (const cr of st.creatures || [])
                                if (cr && cr !== b && flach(cr.position, pmT) < 12)
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
                    });
                    tasten(true);
                    try {
                        lauf(muster, 2000, () => lage === null);
                    } finally {
                        abF();
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
                              abw: +flach(l60, lMix).toFixed(6),
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
                los();
            }
        }
        // L10 DER GESTOSSENE SCHWIMMER: ein Fuchs (Größe 1, sein Steuer-Schritt steht) schwimmt in mehr als 1 m stillem Wasser
        // (`_waterFlowAt` null auf der Bahn — die Probe prüft den Stoß, nicht die Drift), dann ein Stoß von 4 m/s; gemessen je
        // Frame, wie tief er unter seiner Schwimm-Linie liegt (`_kreaturSchwimmt`, `_kreaturSchwimmLinie`). Der Ort: der See
        // aus der Welt (`__wasserOrte`), gesucht um seine tiefste Stelle.
        {
            let ort = null;
            const seeO = (await window.__wasserOrte({ mess: mo })).see;
            const mitte = seeO ? [seeO.x, seeO.z] : null;
            for (let ring = 0; mitte && ring <= 120 && !ort; ring++)
                for (let k = 0; k < Math.max(1, ring * 6) && !ort; k++) {
                    const w = (k / Math.max(1, ring * 6)) * Math.PI * 2;
                    const x = mitte[0] + Math.cos(w) * ring * 4;
                    const zz = mitte[1] + Math.sin(w) * ring * 4;
                    const tief = (d) => r._koerperWasser(x + d, zz, hh(x + d, zz)) - hh(x + d, zz); // `hh` ist endlich (der Sockel)
                    // über 1,2 m am Ort, und 4 m Fahrt in +x bleiben im tiefen (> 1 m), stillen Wasser; der Spiegel ist der JETZT
                    // (der Pegel lebt, wetter.K3), nie der des Funds
                    if (tief(0) > 1.2 && [0, 1, 2, 3, 4].every((d) => tief(d) > 1 && !r._waterFlowAt(x + d, zz)))
                        ort = { x, z: zz, get spiegel() { return r._koerperWasser(x, zz, hh(x, zz)); } };
                }
            if (ort) {
                r.dismountArchitecture();
                st.playerMesh.position.set(ort.x - 4, Math.max(hh(ort.x - 4, ort.z), ort.spiegel) + 1.2, ort.z);
                st.playerVel.setValue(0, 0, 0);
                tasten(false);
                const los = tiereStehen();
                const kappeS = st.maxCreatures;
                st.maxCreatures = st.creatures.length; // die Kappe lässt genau ihn zu (und je Lauf seinen Zwilling, `tier`)
                try {
                    const f = tier(ort.x, ort.spiegel, ort.z, "fuchs", 1);
                    if (f) {
                        f.userData._steuer = { gier: 0, v: 0 };
                        f.userData._stossV = null;
                        bilder(30); // er schwimmt an
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
                        // DER SCHWIMMER IM LOCKSTEP (L8): derselbe Stoß bei 60 fps und bei gemischten Frames,
                        // die Lage 20 Sim-Schritte danach — x, z UND y (im Wasser setzte der Frame-Takt die Höhe, mit seinen Wellen)
                        const schwimmLauf = (muster) => {
                            const g = tier(ort.x, ort.spiegel, ort.z, "fuchs", 1);
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
                            let lage = null;
                            const abFs = nachSchritt(() => {
                                k++;
                                if (k === 20) lage = { x: g.position.x, z: g.position.z, y: g.position.y };
                            });
                            try {
                                for (let i = 0; i < 400 && lage === null; i++) {
                                    tMs += muster[i % muster.length];
                                    r._gameLoopTick(tMs);
                                }
                            } finally {
                                abFs();
                            }
                            r.removeCreature(g);
                            return lage;
                        };
                        const s60 = schwimmLauf([1000 / 60]);
                        const sMix = schwimmLauf([8, 33, 16, 25, 12, 30, 20, 9, 33, 14]);
                        S.lockSchwimmer =
                            s60 && sMix
                                ? {
                                      abw: +flach(s60, sMix).toFixed(6),
                                      abwY: +Math.abs(s60.y - sMix.y).toFixed(6),
                                  }
                                : null;
                    } else S.schwimmer = { fehler: "kein Fuchs" };
                } finally {
                    los();
                    st.maxCreatures = kappeS;
                }
            } else
                S.schwimmer = {
                    fehler: mitte
                        ? `kein tiefes, stilles Wasser im Umkreis 480 m um den See ${mitte.join("/")}`
                        : "kein See in der Welt (`__wasserOrte`)",
                };
        }
        // L9 DER REITER IM WAGEN: je Wagen-Art und am Karren (Teile-Werk) aufsitzen, der Spieler schaut
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
            r.dismountArchitecture();
            bilder(6);
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
                bilder(6);
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
            bilder(6);
            S.reiter = reiter;
            const w1 = rigR().hips;
            S.reiterStand = {
                abw: +flach(w1.position, wurzel0).toFixed(4),
                gier: +Math.abs(w1.rotation.y).toFixed(4),
            };
        }
        // L2 DIE SPALTKANTE: 11,4 m/s über eine Kante — Soll: er fährt über die Kante und FÄLLT. Der Ort kommt aus dem
        // Schicht-Gesetz (`schichtOrt`, die Treppe am stärksten Tafelland-Tal im 16-km-Feld um die Wiese): in 4-m-Ringen bis
        // 400 m die nächste Kante, hinter der der Boden 6–7 m weiter mindestens STATION.randM + 1 tiefer liegt, davor 8 m
        // trockener, stetiger Anlauf (≤ 0,5 m je m), kein Blocker in ±2,5 m von 10 m davor bis 8 m dahinter (nach 240 Frames).
        // L2 läuft ZULETZT: die Suche trägt den Spieler Kilometer fort, danach streamt die Welt um die Wiese neu.
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
                        bilder(240);
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
        res.kette = await kette(expected.kette); // W (feld.K1) zuletzt, darin S1 (Labor = Welt)
        S.labor = res.kette.labor;
        res.rueck = await rueck(expected.rueck); // RM (fahrzeug.K5) auf dem Weg der Kette
    } catch (e) {
        res.err = (e && e.stack) || String(e);
    }
    aufraeumen();
    return res;
}

// ── T5 · K8 · G7 (H3) DAS TEMPO DER KAMERA (Meisterkarte Fahrzeug K3): bei vmax FOV ≥ +8° und Arm ≥ +15 %, im Drift der
// Azimut ≤ 15° am Fahrtvektor, nach dem Maus-Orbit zurück in 1–1,25 s; im Ritt bei 10 m/s ≥ 3,2° (10/16 der Kurve mit dem
// Nachlauf), camera.fov = Ruhe + Tempo, der Wirt reicht (z, vmax) SEINES Gesetzes, EIN FOV-Schreiber; die Drehrate knickt
// nach dem Loslassen in der Kurve je Bild um ≤ 0,25 der Kurve. ──
function tempoVerdict(m) {
    if (!m || !(m.n > 0)) return ["tempo: kein Aufruf der Chase-Cam (vakuös)"];
    const soll = [
        ["fovMax", m.fovMax >= 8, `fov +${m.fovMax}° bei vmax (Soll ≥ 8°)`],
        ["arm", m.arm >= 0.15, `arm +${m.arm} bei vmax (Soll ≥ 0,15)`],
        ["drift", m.drift <= 15, `drift: der Azimut ${m.drift}° neben dem Fahrtvektor`],
        ["quelle", m.quelle, "quelle: der Wirt reicht nicht Fahr-Zustand und vmax seines Gesetzes"],
        ["fov", m.fov && m.fov[10] >= 3.2, `fov +${m.fov && m.fov[10]}° bei 10 m/s (Soll ≥ 3,2°)`],
        ["zeigt", m.zeigt <= 0.01, `zeigt: camera.fov ${m.zeigt}° neben Ruhe + Tempo`],
        ["schreiber", String(m.schreiber) === "_kamFov", `schreiber ${m.schreiber} (Soll EINER, _kamFov)`],
        ["orbit", m.orbit >= 20, `orbit ${m.orbit}°: die Maus dreht das Rig nicht`],
        ["rueck", !(m.orbit >= 20) || (m.rueck >= 1 && m.rueck <= 1.25), `rueck ${m.rueck} s nach dem Loslassen (Soll 1–1,25 s)`],
        ["knick", m.knick <= 0.25, `knick: die Drehrate springt nach dem Loslassen um ${m.knick} der Kurve je Bild (Soll ≤ 0,25)`],
        ["kern", !String(m.kern), `kern: dem Fahr-Kern fehlt ${m.kern}`],
        ["zoom", m.zoom, "zoom: das Auto-Repeat von Z kippt das Fernglas"],
        ["laut", m.laut, "laut: _kamSatz bricht still"],
    ];
    return soll.filter(([k, ok]) => k in m && !ok).map((s) => s[2]);
}
// DER RUCK JE BILD (T4, fzk3-drift): die zweite Differenz des Quer-Versatzes [[q, tMs] × 3] ZEITRICHTIG über die ungleichen
// Bildzeiten, auf ein 60-Hz-Bild gerechnet (gleiche Bildzeiten: q2 − 2q1 + q0). Je Bild roh zählte jede gleichförmige
// Querbewegung als Ruck — die Überblendung des Rigs (1,8 m/s) und das Mitgehen in den Schlupf am Hang trugen 0,035 m, zeitrichtig 0,0022.
function ruckJeBild([[a, ta], [b, tb], [c, tc]]) {
    return Math.abs((c - b) / (tc - tb) - (b - a) / (tb - ta)) * (2 / (tc - ta)) * (1000 / 60) ** 2;
}
// DER TEMPO-SPION (Seite: Welt UND Garage) umhüllt VC.chaseKamera: zeigt = |camera.fov − Ruhe − fovPlus des Vor-Bilds|; ein
// Schatten-Zustand ohne Maus misst Orbit und Rückkehr ab dem Loslassen in der Zeit des Rigs (dt je Aufruf).
function tempoSpion(VC, cam, quelle) {
    const [ck, sch, ruhe] = [VC.chaseKamera, {}, cam.fov];
    const m = Object.defineProperty({ n: 0, zeigt: 0, quelle: true, orbit: 0, rueck: null, fov: {} }, "ende", {
        value: () => (VC.chaseKamera = ck),
    });
    let [letzt, g0, los] = [0, 0, null];
    VC.chaseKamera = (c, g, s, dt, K, z, vmax) => {
        m.zeigt = Math.max(m.zeigt, +Math.abs(cam.fov - ruhe - letzt).toFixed(3));
        m.quelle = m.quelle && quelle(z, vmax);
        const v = ck(c, g, s, dt, K, z, vmax);
        letzt = v.fovPlus || 0;
        if (z && z.speed >= 10 && !(10 in m.fov)) m.fov[10] = +letzt.toFixed(2);
        g0 = Number.isFinite(g) ? g : g0;
        ck(sch, g0, s, dt, K, z, vmax);
        const ab = (Math.abs(Math.atan2(Math.sin(c.az - sch.az), Math.cos(c.az - sch.az))) * 180) / Math.PI;
        m.orbit = Math.max(m.orbit, Math.round(ab));
        if (!Number.isFinite(g)) [los, m.rueck] = [0, null];
        else if (los !== null && m.rueck === null) {
            los += dt;
            if (ab <= Math.max(1, 0.03 * m.orbit)) m.rueck = +los.toFixed(2);
        }
        m.n++;
        return v;
    };
    return m;
}
// DER KERN (Node): je 5 s Stand und vmax, Drift 45° (vlong = vlat = 8 m/s); was ihm fehlt, nennt `kern` (nie ein Wurf).
function kernTempo(VC) {
    const kern = ["chaseKamera", "chaseGreif"].filter((n) => !VC[n]);
    if (kern[0] === "chaseKamera") return { kern };
    const [K, dt, vmax] = [VC.FAHR.kamera, 1 / 60, 16];
    const lauf = (c, n, g, sp, q = 0) => {
        let v;
        for (let i = 0; i < n; i++) v = VC.chaseKamera(c, g, 0, dt, K, { vlong: sp, vlat: q, speed: Math.hypot(sp, q) }, vmax);
        return v;
    };
    const arm = (v) => Math.hypot(v.x, v.y - K.blickHoehe, v.z);
    const [c0, cd] = [{}, {}];
    const [v0, v1] = [lauf(c0, 300, 0, 0), lauf(c0, 300, 0, vmax)];
    lauf(cd, 300, 0, 8, 8);
    const drift = +((Math.abs(cd.az - Math.PI / 4) * 180) / Math.PI).toFixed(1);
    // die Rückkehr in der Kurve (0,5 rad/s): die Maus hält 0,5 s und dreht das Rig 0,5 rad, dann frei — der größte
    // Sprung der Drehrate je Bild ab dem Loslassen, relativ zur Kurve
    const ck = {};
    let [az, rate, knick] = [0, 0, 0];
    for (let i = 0; i < (kern.length ? 0 : 300); i++) {
        if (i === 120) VC.chaseGreif(ck, 0.5, 0, K);
        lauf(ck, 1, i >= 120 && i < 150 ? NaN : i * dt * 0.5, 8);
        const r = (ck.az - az) / dt;
        if (i >= 150) knick = Math.max(knick, Math.abs(r - rate) / 0.5);
        [az, rate] = [ck.az, r];
    }
    const m = { kern, fovMax: +(v1.fovPlus || 0).toFixed(2), arm: +(arm(v1) / arm(v0) - 1).toFixed(3), drift };
    return kern.length ? m : Object.assign(m, { knick: +knick.toFixed(2) });
}

// ── K1 (physik K1, `--koerper`): Masse und Eintauchtiefe am Spieler-Weg (Takt, `_fahrBoden`), dann jede Zeile ρ ×2.
async function probeKoerper(opt) {
    await window.__weltDa();
    const r = window.anazhRealm;
    const st = r.state;
    const A = Object.getPrototypeOf(r).constructor;
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt);
    const res = { err: null };
    const hh = (a, b) => r.getTerrainHeightAt(a, b);
    let tMs = performance.now();
    try {
        const see = (await window.__wasserOrte({ mess: opt.messort })).see;
        const tief = (x, z) => r._koerperWasser(x, z, hh(x, z)) - hh(x, z);
        let ort = null;
        for (let ring = 0; see && ring <= 160 && !ort; ring++)
            for (let k = 0; k < Math.max(1, ring * 6) && !ort; k++) {
                const w = (k / Math.max(1, ring * 6)) * Math.PI * 2;
                const [x, z] = [see.x + Math.cos(w) * ring * 3, see.z + Math.sin(w) * ring * 3];
                if ([0, 2, 4, 6].every((d) => tief(x + d, z) > 2 && !r._waterFlowAt(x + d, z)))
                    // der Spiegel am Ort JETZT über die EINE Wasser-Wahrheit, nie der Fund-Moment: der Pegel ist eine Funktion des
                    // Wetter-Felds (wetter.K3), die 300 Takte der Messung heben ihn im Regen bis zur Krone (+0,2 m)
                    ort = { x, z, get spiegel() { return r._koerperWasser(x, z, hh(x, z)); } };
            }
        if (!(res.ort = ort)) throw new Error("kein See");
        const steuerRoh = A._steuerGesetz;
        const steht = Object.create(steuerRoh.call(A));
        steht.steuerSchritt = (sw) => (sw.v = 0);
        const mats = st.materials;
        const alt = {};
        for (const n of Object.keys(mats)) if (mats[n].builtIn && n !== "wasser") alt[n] = mats[n].rho; // die Leiber und Dinge, nie das Medium
        const box = (m, sz, y) => ({ shape: "box", material: m, size: sz, position: { x: 0, y, z: 0 } });
        for (const m of ["holz", "stein"]) st.blueprints["_k1_" + m] = { parts: [box(m, { x: 3, y: 0.6, z: 1.4 }, 0.3)] };
        const eigen = { parts: [box("holz", { x: 0.15, y: 1.5, z: 0.15 }, 0), box("holz", { x: 0.6, y: 0.6, z: 0.6 }, 1.5)] };
        const keule = st.blueprints.klinge_keule;
        const messe = () => {
            const pm = st.playerMesh;
            pm.position.set(ort.x, ort.spiegel - 0.4 + A.PLAYER_FOOT_OFFSET, ort.z);
            st.playerVel.setValue(0, 0, 0);
            A._steuerGesetz = () => steht;
            st.maxCreatures = st.creatures.length + 1;
            const wolf = r.spawnCreatureAt(ort.x + 3, ort.spiegel, ort.z, "calm", "wolf", { precise: true, bodySize: 1 });
            wolf.userData._steuer = { gier: 0, v: 0 };
            for (let i = 0; i < 300; i++) r._gameLoopTick((tMs += 16.7));
            A._steuerGesetz = steuerRoh;
            const leib = (q, fuss, schwimmt, mensch) => {
                const g = hh(q.position.x, q.position.z);
                const sp = r._koerperWasser(q.position.x, q.position.z, g);
                const [kg, traegt] = [r._stossKoerper(q, {}).m, r._leibGetragen(mensch)];
                return { kg, tief: +(sp - fuss).toFixed(3), grund: +(sp - g).toFixed(3), schwimmt, traegt };
            };
            const o = { spieler: leib(pm, pm.position.y - A.PLAYER_FOOT_OFFSET, !!st.playerUnderwater, true) };
            o.wolf = leib(wolf, wolf.position.y, r._kreaturSchwimmt(wolf, hh(wolf.position.x, wolf.position.z)) !== null);
            st.playerVel.setValue(3, 0, 0);
            wolf.userData._stossV = { x: 0, z: 0 };
            o.stoss = { J: r._stossPaar(pm, wolf, 1, 0), dvA: 3 - st.playerVel.x(), dvB: wolf.userData._stossV.x };
            st.playerVel.setValue(0, 0, 0);
            r.removeCreature(wolf);
            const werk = (typ) => {
                const e = r.spawnArchitecture(typ, { x: ort.x, y: hh(ort.x, ort.z), z: ort.z }, { silent: true, precise: true });
                try {
                    const prof = r._vehicleProfile(e);
                    const K = r._stossKoerper(e, {});
                    const bp = st.blueprints[e.type];
                    const hu = r._teileHuelle(bp);
                    return {
                        kg: K ? K.m : bp.parts.reduce((m, p) => m + r._teilMasse(p), 0),
                        rho: prof.dichte,
                        anteil: r._eintauchAnteil(prof.dichte),
                        schwimmt: prof.floats,
                        tief: +(ort.spiegel - r._fahrBoden(e)(ort.x, ort.z)).toFixed(3),
                        grund: +(ort.spiegel - hh(ort.x, ort.z)).toFixed(3),
                        kernKg: K && K.G.m * window.__vehicleCore.FAHR.masseDichte,
                        wasserK: K && K.G.wasser.kStirn,
                        H: hu.y1 - hu.y0,
                    };
                } finally {
                    r.removeArchitecture(e);
                }
            };
            [o.wagen, o.holz, o.stein] = ["fahrzeug_gt", "_k1_holz", "_k1_stein"].map(werk);
            const lab = window.__schmiedeCore.kampfMasze("keule").masseKg;
            o.geschmiedet = { kg: r._schmiedeKampfMasze(keule).masseKg, labKg: lab, dauer: r._swingDauerFuerBlueprint(keule) };
            o.lose = { kg: r._geraetMasze(eigen).masseKg, dauer: r._swingDauerFuerBlueprint(eigen) };
            return o;
        };
        res.vor = messe();
        try {
            for (const n of Object.keys(alt)) mats[n].rho = alt[n] * 2;
            res.mutiert = Object.keys(alt).length;
            res.nach = messe();
        } finally {
            for (const n of Object.keys(alt)) mats[n].rho = alt[n];
            for (const m of ["holz", "stein"]) delete st.blueprints["_k1_" + m];
        }
        Object.assign(res, {
            refKg: window.__tetrapodaCore.KAMPF.refKg,
            rhoBlech: mats.blech.rho,
            brustM: A._schwimmBrustM(),
            rhoW: A._fahrGesetz().wasserRho,
        });
        // das Labor: der Guss des Körperstudios (Saat 0, Start-Dials), sein Leib in Metern (6 E = 8 Kopf-Einheiten) × ρ(leib)
        const sk = BAKERS_BY_KIND.koerper(window.__koerperCore, "mensch", 0, 0, undefined).userData.__skelett;
        const w = sk.joints.find((j) => j.name === sk.root).scale;
        res.labMensch = sk.leibV * w[0] * w[1] * w[2] * ((8 * A.PLAYER_KH) / 6) ** 3 * mats.leib.rho;
    } catch (e) {
        res.err = String((e && e.stack) || e);
    }
    return res;
}

module.exports = { probeLeben, probeKoerper, tempoVerdict, tempoSpion, kernTempo, ruckJeBild };
