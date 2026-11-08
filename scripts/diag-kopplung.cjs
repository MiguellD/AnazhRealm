#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kopplung.cjs — DIE KOPPLUNGS-LINSE (npm run gate:kopplung): die Welt fasst den Körper an (F1, die Strömung, misst
// gate:wasser-leben K4 STRÖMUNG).
//   F2 GLEITEN (PM_ClipVelocity): eine 45°-Wand behält ~Tempo/2 entlang der Absicht; am STEILHANG rutscht der Körper.
//   F3 WIND: EIN uWindDir (seeded, langsam) treibt die wandernde Böe als dot(worldXZ, windDir) — quer gleich, längs
//      verschieden, die Richtung dreht mit; das FELD (wetter.K5): der EINE Wind am Ort `_windAt`, vom Gelände geformt (Lee
//      −40 %, Tal-Düse +20 %), und jeder Leser (Wasser, Regen, Tuch, Rauch, Wagen) ruft ihn und folgt seiner Mutation.
//   F4 GRAS: die uBend-Sphären biegen Halme RADIAL weg, die CPU-Seite (`_tickGrasBend`) füllt Spieler, Ritt, nahe Kreaturen.
//   F5 DIE BÖE IM BILD (klang.K2#1): ohne Stärke steht jeder Halm, und derselbe Halm wiegt im Verhältnis der Böe am Ort
//      (`_windAt`) — das Rauschen je Halm verschiebt nur die Phase; die zweite Welle (die Phase wandert mit dem Ort) MUSS rot sehen.
// Jede Fixture läuft durch die ECHTEN Methoden (Shim = Object.create(realm) mit synthetischem Dichtefeld/Wasser) und trägt
// ihren SELBST-TEST: der Fix am Gesetz abgeschaltet (SLIDE_CLIP_PLANES 0, Hang-Grenze −1) MUSS rot sehen.
// Exit 1 bei jedem Fail.
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, warteAufWelt, hauptLauf, nullSeite } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.KOPPLUNG_PORT || 4407);
const server = statikServer();

hauptLauf(async () => {
    const { browser, page } = await nullSeite({ frist: 300000 }, server, PORT);
    let out = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        out = await page.evaluate(() => {
            const AR = AnazhRealm;
            const o = { fails: [], zahlen: {} };
            const fail = (msg) => o.fails.push(msg);
            const DT = 1 / 60;

            // ── Der Bewegungs-Shim: ECHTE `_stepCharacter`/`_loopPlayerMovement` auf synthetischem Dichtefeld + Wasser ──
            const mkVel = () => ({
                _x: 0,
                _y: 0,
                _z: 0,
                x() {
                    return this._x;
                },
                y() {
                    return this._y;
                },
                z() {
                    return this._z;
                },
                setValue(a, b, c) {
                    this._x = a;
                    this._y = b;
                    this._z = c;
                },
            });
            const mkShim = (densityAt) => {
                const shim = Object.create(r);
                shim.state = {
                    playerMesh: { position: new THREE.Vector3(0, 0.5, 0) },
                    playerVel: mkVel(),
                    player: { mountedArch: null },
                    keys: {},
                    verbTafel: { gehalten: {} }, // die Verb-Tafel, gefüllt vom echten Sammler (`_verbTafelSammeln`)
                    yaw: 0,
                    speed: 6,
                    sprintSpeed: 12,
                    gravity: -14.715,
                    _fieldVy: 0,
                    waterLevel: -50,
                    terrainBaseHeight: 0,
                    seasonPhase: 0.375, // Sommer-Mittag: das Temperatur-Feld des Eises (stoffe.K3) friert nichts
                    timeOfDay: 0.5,
                    worldMeta: { voxelTerrain: true },
                    forward: new THREE.Vector3(),
                    right: new THREE.Vector3(),
                    moveDirection: new THREE.Vector3(),
                    architectures: [],
                    floatingIslands: null,
                    materials: st.materials,
                };
                shim._mountedEntry = null;
                shim._fieldDensityAt = (x, y, z) => densityAt(x, y, z);
                shim._terrainColumnContext = () => null;
                // die EINE Wasser-Wahrheit am Körper: trocken, kein Fluss
                shim._koerperWasser = () => -Infinity;
                shim._hydroRiverAt = () => null;
                return shim;
            };
            const runTicks = (shim, n, keys, yaw) => {
                shim.state.verbTafel.gehalten = keys || {};
                shim.state.yaw = yaw || 0;
                let t = 0;
                for (let i = 0; i < n; i++) {
                    shim._verbTafelSammeln();
                    shim._loopPlayerMovement(t, DT);
                    shim._stepCharacter(DT, t);
                    t += DT;
                }
            };

            // ══ FIXTURE 2 (F2) — GLEITEN STATT VOLLSTOPP ══
            // (a) 45°-Anlauf (1,0,1)/√2 auf die Wand x=8 (Normale −x): PM_ClipVelocity behält die Tangente, Fortschritt entlang
            //     der ABSICHT ≈ Tempo/2 statt 0; Kugel-Auflösung aus (es spricht allein der Klip); die Wand SCHWEBT ab y=0.25,
            //     damit ihr Fuß die Boden-Normale nicht steil färbt.
            const wallDens = (x, y) => Math.max(0 - y, Math.min((x - 8) * 2, (y - 0.25) * 4));
            const mkWallShim = () => {
                const s = mkShim(wallDens);
                s._fieldResolveSphere = () => false; // Isolation: nur der Klip verteidigt
                return s;
            };
            const yaw45 = Math.PI / 4; // forward = (0.707, 0, 0.707) → 45° auf die Wand
            const intentProj = (p0, p1) => (p1.x - p0.x + (p1.z - p0.z)) / Math.SQRT2;
            const runWallWindow = (shim) => {
                runTicks(shim, 180, { vor: true }, yaw45); // Anlauf: sicher an der Wand
                const p0 = shim.state.playerMesh.position.clone();
                runTicks(shim, 120, { vor: true }, yaw45); // Mess-Fenster: 2 s an der Wand
                const p1 = shim.state.playerMesh.position;
                return { proj: intentProj(p0, p1), x: p1.x, z: p1.z };
            };
            {
                const free = mkShim((x, y) => 0 - y); // ohne Wand: Referenz-Tempo
                const fRes = runWallWindow(free);
                const wall = mkWallShim();
                const wRes = runWallWindow(wall);
                const ratio = fRes.proj > 0 ? wRes.proj / fRes.proj : NaN;
                o.zahlen.klip = { frei: fRes.proj, wand: wRes.proj, ratio, endX: wRes.x, endZ: wRes.z };
                if (!(ratio > 0.3 && ratio < 0.75))
                    fail(
                        `F2a: 45°-Wand-Gleiten aus dem Takt — Absichts-Tempo ${(ratio * 100).toFixed(0)} % der freien Fahrt (soll ~50 %, Band 30–75 %)`
                    );
                if (!(wRes.x < 8.01)) fail(`F2a: der Klip ließ die Wand durch (x=${wRes.x.toFixed(2)} ≥ 8)`);
                // Selbst-Test F2a: die Klip-Schleife des Kontakt-Lösers auf 0 Ebenen (SLIDE_CLIP_PLANES, `_wandGleiten`) → der
                // Fortschritt MUSS kollabieren.
                const k0 = AR.SLIDE_CLIP_PLANES;
                AR.SLIDE_CLIP_PLANES = 0;
                let stopped;
                try {
                    stopped = runWallWindow(mkWallShim());
                } finally {
                    AR.SLIDE_CLIP_PLANES = k0;
                }
                const deadRatio = fRes.proj > 0 ? stopped.proj / fRes.proj : NaN;
                o.zahlen.klipTot = { wand: stopped.proj, ratio: deadRatio };
                if (!(deadRatio < 0.1))
                    fail(
                        `F2a-Selbsttest: Voll-Stopp glitt trotzdem (${(deadRatio * 100).toFixed(0)} % — die Fixture sähe den alten Bug nicht)`
                    );
            }
            // (b) STEILHANG: Gradient 2,5 (~68°, ny≈0.37 < hang.maxSlopeY 0.5) in +x — ohne Input rutscht der Körper bergab,
            //     statt zu haften; Kugel-Auflösung aus (es spricht allein der Gravitations-Term).
            const mkSlopeShim = () => {
                const s = mkShim((x, y) => -2.5 * x - y);
                s._fieldResolveSphere = () => false;
                return s;
            };
            {
                const slope = mkSlopeShim();
                runTicks(slope, 120, {}, 0);
                const sp = slope.state.playerMesh.position;
                o.zahlen.steilhang = { x: sp.x, y: sp.y };
                if (!(sp.x > 0.3))
                    fail(`F2b: Steilhang-Rutsch nur ${sp.x.toFixed(3)} m in 120 Ticks (soll > 0,3 m bergab)`);
                if (!(sp.y < 0.4)) fail(`F2b: der Rutsch folgte der Fläche nicht abwärts (y=${sp.y.toFixed(2)})`);
                // Selbst-Test F2b: die Hang-Grenze auf −1 (hang.maxSlopeY über `_bewegungsBlock`) → der Körper MUSS haften.
                const B0 = AR._bewegungsBlock;
                AR._bewegungsBlock = function (k, f) {
                    const b = B0.call(this, k, f);
                    return k === "hang" ? Object.assign({}, b, { maxSlopeY: -1 }) : b;
                };
                const stuck = mkSlopeShim();
                try {
                    runTicks(stuck, 120, {}, 0);
                } finally {
                    AR._bewegungsBlock = B0;
                }
                o.zahlen.steilhangTot = stuck.state.playerMesh.position.x;
                if (!(Math.abs(stuck.state.playerMesh.position.x) < 0.05))
                    fail(
                        `F2b-Selbsttest: deaktivierter Rutsch rutschte trotzdem (${stuck.state.playerMesh.position.x.toFixed(3)} m)`
                    );
            }

            // ══ FIXTURE 3 (F3) — WIND-RICHTUNG ══
            // DIE SKALAR-ALGEBRA (F4, F5): derselbe Knoten-Baum, den `_windSwayOffset` für die GPU baut, numerisch an EINER Umgebung
            // e (Uhr t, Stärke U, Richtung dx/dz, Lage der Ecke lx/lz, Höhe hy, Slot 0 der Biegung b, das Rauschen des Halms `rausch`
            // (e) — sonst 0,37; seine Ziehung aus dem Fuß rechnet der Stoff in u32, `_ortZiehung`) — die ECHTE Quelle rechnet, kein
            // Nachbau. Die Naht Vorlage ↔ Welt (`_weltNaht`) ist hier die Einheit; an der echten Instanz misst sie gate:foundry-impostor C4.
            const val = (x) => (x && x.v !== undefined ? x.v : x);
            const N = (v) => {
                const op = (f) => (b) => N(f(v, val(b)));
                return { v, mul: op((a, b) => a * b), add: op((a, b) => a + b), sub: op((a, b) => a - b), div: op((a, b) => a / b) };
            };
            const V = (...a) => Object.fromEntries(a.map((x, i) => ["xyzw"[i], N(val(x))]));
            const f = (g) => (...a) => N(g(...a.map(val)));
            const T = { float: f((x) => x), fract: f((x) => x - Math.floor(x)), vec3: V };
            for (const k of ["sin", "cos", "sqrt", "max", "min"]) T[k] = f(Math[k]);
            const E0 = { t: 3.7, U: 0.4, dx: 1, dz: 0 };
            const sway = (e, rausch = () => 0.37) => {
                const s = Object.create(r);
                [T.positionWorld, T.positionGeometry] = [V(e.lx, 0.5, e.lz), V(0, e.hy, 0)];
                s._weltNaht = () => ({ lage: T.positionWorld, vorlage: (x) => x });
                const uBend = [0, 1, 2, 3, 4, 5].map((i) => V(...((!i && e.b) || [0, -1e6, 0, 0])));
                s.state = { windUniforms: { uWindTime: N(e.t), uWindStrength: N(e.U), uWindDir: V(e.dx, e.dz), uBend } };
                const o = r._windSwayOffset.call(s, T, { rausch: N(rausch(e)) });
                return { x: o.x.v, z: o.z.v };
            };
            // die Böe längs und quer der Richtung prüft F5 gegen `_windAt` selbst (bis w20-boee-bild hier quer gleich / längs
            // verschieden an drei Punkten)
            {
                // Die CPU-Richtungs-Quelle: seeded, langsam (< 0.02 rad/s Drift) und einheitslang.
                const d10 = r._windDirAt(10);
                const d10b = r._windDirAt(10);
                const d11 = r._windDirAt(11);
                const other = Object.create(r);
                other.state = { worldMeta: { seed: "anderer-seed-xyz" } };
                const dOther = other._windDirAt(10);
                const ang = (a, b) => Math.abs(Math.atan2(a.x, a.z) - Math.atan2(b.x, b.z));
                o.zahlen.windDir = { d10, d11, dOther };
                if (!(d10.x === d10b.x && d10.z === d10b.z)) fail("F3: `_windDirAt` ist nicht deterministisch");
                if (!(Math.abs(Math.hypot(d10.x, d10.z) - 1) < 1e-9)) fail("F3: uWindDir ist kein Einheitsvektor");
                if (!(ang(d10, d11) < 0.02))
                    fail(`F3: der Wind dreht zu schnell (${ang(d10, d11).toFixed(4)} rad/s — soll langsam wandern)`);
                if (!(ang(d10, dOther) > 1e-3))
                    fail("F3: anderer worldSeed ergab dieselbe Wind-Grundrichtung (nicht seeded?)");
            }

            // ══ F3 FELD (wetter.K5) — der EINE Wind am Ort `_windAt`, vom Gelände geformt: hinter dem Kamm und in der Tal-Düse des
            //    Gesetzes (Wind +x, Bühnen-Höhe), an 41 × 41 Orten der Welt; „×0" zieht jeden Leser — Gras und Krone über die Uniform,
            //    den Regen bis zum Boden seines Gesetzes (der Wind mindestens 0,1) ══
            {
                const U = (H, x, z) =>
                    Object.assign(Object.create(r), { _terrainMacroSurfaceY: H, _windDirAt: () => ({ x: 1, z: 0 }) })._windAt(x, z, 0)
                        .staerke;
                const eben = U(() => 0, 104, 8);
                const lee = U((x) => 60 * Math.exp(-((x / 120) ** 2)), 104, 8) / eben - 1;
                const duese = U((x, z) => 40 * (1 - Math.exp(-((z / 80) ** 2))), 8, 8) / eben - 1;
                const [st, P] = [r.state, r.state.playerMesh.position];
                const form = Array.from({ length: 1681 }, (_, i) => r._windAt(P.x + (i % 41) * 64 - 1280, P.z + ((i / 41) | 0) * 64 - 1280, 9).form);
                const alt = [st.weather, st.dorfRauch, st.hydroSurfaceUniforms];
                [st.weather, st.weatherTransition, st.hydroSurfaceUniforms] = ["stormy", null, { wind: { value: 0 } }];
                const g = new THREE.Group().add(new THREE.Object3D());
                g.position.copy(P);
                const { vc } = AR._fahrSchrittGesetz();
                const T = { x: P.x, y: 9, z: P.z };
                const leser = {
                    gras: () => (r._loopRender(), st.windUniforms.uWindStrength.value),
                    wasser: () => (r._dayNightApplyWaterMaterials(P), st.hydroSurfaceUniforms.wind.value),
                    regen: () => (r._tickRain(), r._rainSystem.uDrift.value.length()),
                    tuch: () => (r._animateCompoundMotion(g, [{ role: "segel", phase: 0 }], 1.3), Math.abs(g.children[0].rotation.z)),
                    rauch: () => {
                        st.dorfRauch = { quellen: [], teilchen: [Object.assign(T, { x: P.x, z: P.z, vy: 0, dx: 0, a: 0.5, s: 1 })] };
                        r._updateDorfRauch(0.5);
                        return Math.hypot(T.x - P.x, T.z - P.z);
                    },
                    // die Flanke im Wind (vehicle-core fahrKraefte; im Flug ist aLat die Kraft des Winds allein)
                    wagen: () => {
                        const w = r._fahrWind(P);
                        const z = Object.assign(vc.fahrZustand(0, 0, Math.atan2(-w.x, -w.z)), { luft: true });
                        vc.fahrKraefte(z, { wind: w }, vc.fahrGesetz(vc.exportDrive(Object.assign({}, vc.DEFAULT_P, vc.presetPatch("gt")))), DT);
                        return Math.abs(z.aLat);
                    },
                };
                const [echt, m, L] = [r._windAt, { x0: false }, {}];
                r._windAt = function (...a) {
                    return Object.assign({}, echt.apply(this, a), m.x0 ? { staerke: 0, ms: 0 } : {});
                };
                try {
                    for (const [k, f] of Object.entries(leser)) L[k] = [((m.x0 = false), f()), ((m.x0 = true), f())];
                } finally {
                    delete r._windAt;
                    [st.weather, st.dorfRauch, st.hydroSurfaceUniforms] = alt;
                }
                const folgt = Object.keys(L).filter((k) => L[k][0] > 1e-4 && L[k][1] <= (k === "regen" ? 0.15 : 0) * L[k][0]);
                const fd = (o.zahlen.feld = { lee, duese, min: Math.min(...form), max: Math.max(...form), L, folgt });
                if (!(Math.abs(lee + 0.4) < 0.02 && Math.abs(duese - 0.2) < 0.02 && fd.min <= 0.7 && fd.max >= 1.1 && folgt.length === 6))
                    fail(`F3: das Gelände formt den Wind nicht oder ein Leser folgt ihm nicht: ${JSON.stringify(fd)}`);
            }

            // ══ FIXTURE 4 (F4) — GRAS-INTERAKTION (radiales Wegbiegen) ══
            {
                // die Sphäre bei x=2 (r=2) gegen den Slot aus (w=0, y=−1e6): der Halm links und rechts der Sphäre, an der Wurzel
                // (hf=0 biegt nie) und außer Reichweite
                const [L, L0, R, R0, W, W0, F, F0] = [[1.2, 0.8], [2.8, 0.8], [1.2, 0], [30, 0.8]].flatMap(([lx, hy]) =>
                    [[2, 0.5, 0, 2], null].map((b) => sway({ ...E0, b, lx, lz: 0, hy }))
                );
                o.zahlen.bend = { dLinks: L.x - L0.x, dRechts: R.x - R0.x };
                if (!(L.x < L0.x - 1e-3)) fail("F4: Halm links der Sphäre biegt nicht RADIAL WEG (−x)");
                if (!(R.x > R0.x + 1e-3)) fail("F4: Halm rechts der Sphäre biegt nicht RADIAL WEG (+x)");
                if (!(Math.abs(W.x - W0.x) < 1e-9)) fail("F4: die WURZEL biegt sich (hf-Gewichtung fehlt)");
                if (!(Math.abs(F.x - F0.x) < 1e-9)) fail("F4: die Sphäre wirkt außerhalb ihres Radius");
                // CPU-Seite: der Frame-Tick (`_loopRender`) speist uWindDir aus dem EINEN Wind (`_windAt`, Richtung `_windDirAt(t)`) und
                // füllt über `_tickGrasBend` Slot 0 mit dem Spieler; tote Slots ruhen. THREE.TSL, die Slots und der Spieler stehen in
                // jeder gebooteten Welt (bis w20-boee-bild fragte ein Wenn danach und ließ die Probe sonst still).
                const wu = r._ensureWindCoupling(THREE.TSL);
                const [pp, t] = [pm.position, 1234.5];
                wu.uBend[0].value.set(pp.x + 99, 0, 0, 0);
                wu.uWindDir.value.set(0, 0);
                r._bildZeit = t; // die Bild-Uhr (A9), die der Frame-Tick liest
                r._loopRender();
                const [b0, wd] = [wu.uBend[0].value, r._windDirAt(t)];
                if (!(Math.abs(b0.x - pp.x) < 1e-6 && b0.w > 0))
                    fail(`F4: der Frame-Tick trägt den Spieler nicht in Slot 0 (x=${b0.x}, w=${b0.w})`);
                if (!(wu.uWindDir.value.x === wd.x && wu.uWindDir.value.y === wd.z))
                    fail("F3: der Frame-Tick (`_loopRender`) speist uWindDir nicht aus `_windDirAt`");
                if (!(wu.uBend[5].value.w === 0)) fail("F4: ungenutzte Slots sind nicht aus (w≠0)");
            }

            // ══ F5 DIE BÖE IM BILD (klang.K2#1: der Wind-Klang folgt dem Wind im Bild, w20-boee-bild) — gespeist wie im Frame-Takt
            //    (Uhr, WEATHER_WIND_AMP × Stärke und Richtung des EINEN Winds am Auge, `_windAt`): ohne Stärke steht jeder Halm (kein
            //    zweiter Wind), und derselbe Halm (sein Rauschen) mit der Ecke 37 m längs und 29 m quer zum Wind wiegt im Verhältnis
            //    der Böe am Ort (`_windAt(x, z, t).boe`) — das Rauschen je Halm verschiebt nur die Phase. Bis w20-boee-bild lief die
            //    Phase als zweite Welle über die Wiese (uWindTime·1,7 + (Lage·uWindDir)·0,35): im Ausschnitt der Station hielten die
            //    Büschel gemeinsam an, das Bild trug einen eigenen Takt neben der Böe. Selbst-Test: die zweite Welle (das Rauschen
            //    aus (Lage·uWindDir)·0,35/2π = 0,0557) MUSS rot sehen. ══
            {
                const P = pm.position;
                const boe = (rausch) => {
                    let ab = 0;
                    for (let i = 0; i < 30; i++) {
                        const [t, ax] = [20 + i * 2.31, P.x + (i % 7)];
                        const w = r._windAt(P.x, P.z, t);
                        const [x, z] = [ax + w.x * 37 - w.z * 29, P.z + w.z * 37 + w.x * 29];
                        const e = { t, U: w.staerke * AR.WEATHER_WIND_AMP, dx: w.x, dz: w.z, lx: ax, lz: P.z, hy: 0.5 };
                        const [a, b, n] = [{}, { lx: x, lz: z }, { U: 0 }].map((q) => sway({ ...e, ...q }, rausch));
                        const soll = r._windAt(x, z, t).boe / r._windAt(ax, P.z, t).boe;
                        ab = Math.max(ab, Math.abs(Math.hypot(b.x, b.z) / Math.hypot(a.x, a.z) / soll - 1), Math.abs(n.x) + Math.abs(n.z));
                    }
                    return ab;
                };
                const [ab, welle] = [boe(), boe((e) => (e.lx * e.dx + e.lz * e.dz) * 0.0557)];
                o.zahlen.boe = { ab, welle };
                if (!(ab < 1e-9)) fail(`F5: das Wiegen folgt der EINEN Böe am Ort nicht (±${ab}) — ein zweiter Wind`);
                if (!(welle > 1e-3)) fail("F5-Selbsttest: die zweite Welle bleibt unerkannt");
            }

            // ══ KONSUM-PROBEN (Lehre 5/6: der Ruf, nie der Text — der Lieferant zählt, der Leser läuft) ══
            {
                const ruft = (obj, m, prov, key, args) => {
                    const alt = prov[key];
                    let n = 0;
                    prov[key] = function (...a) {
                        n++;
                        return alt.apply(this, a);
                    };
                    try {
                        obj[m](...args);
                    } finally {
                        delete prov[key];
                    }
                    return n;
                };
                // EIN Wind, seine Leser: Gras und Baum-Stoff holen uWindDir aus derselben Quelle `_ensureWindCoupling`
                if (window.THREE && THREE.TSL) {
                    const baum = Object.create(r);
                    baum._baumWindKnoten = {};
                    const mat = new THREE.MeshStandardNodeMaterial();
                    const gras = ruft(r, "_windSwayOffset", r, "_ensureWindCoupling", [THREE.TSL, {}]);
                    const rinde = ruft(baum, "_baumWindStoff", r, "_ensureWindCoupling", [
                        mat,
                        "bark",
                        { ht: 12, delta: 0.3, an: 1 },
                    ]);
                    if (!(gras > 0 && rinde > 0))
                        fail(
                            `KONSUM: uWindDir hat nicht EINE Quelle (Gras ${gras}, Rinde ${rinde} Rufe von \`_ensureWindCoupling\`)`
                        );
                }
            }
            return o;
        });
    } catch (e) {
        console.error("LINSE-FEHLER:", e.message);
        out = { fails: [`Harness: ${e.message}`], zahlen: {} };
    }
    await browser.close();
    server.close();

    console.log("\n===== KOPPLUNGS-LINSE (Gleiten · Wind · Gras) =====\n");
    const z = out.zahlen || {};
    if (z.klip)
        console.log(
            `  F2 Gleiten: 45°-Wand ${(z.klip.ratio * 100).toFixed(0)} % Absichts-Tempo (frei ${z.klip.frei.toFixed(2)} m → Wand ${z.klip.wand.toFixed(2)} m) · Voll-Stopp-Kontrolle ${(z.klipTot ? z.klipTot.ratio * 100 : NaN).toFixed(0)} % · Steilhang-Rutsch ${z.steilhang ? z.steilhang.x.toFixed(2) : "?"} m`
        );
    if (z.windDir)
        console.log(`  F3 Wind: Drift ${z.windDir ? "seeded/langsam" : "?"}`);
    const fd = z.feld;
    if (fd)
        console.log(
            `  F3 Feld: Lee ${(100 * fd.lee).toFixed(0)} % · Tal-Düse +${(100 * fd.duese).toFixed(0)} % · Welt ${fd.min.toFixed(2)}–${fd.max.toFixed(2)} · Leser ${fd.folgt.length}/${Object.keys(fd.L).length} folgen ×0 (` +
                Object.entries(fd.L).map(([n, [a, b]]) => `${n} ${a.toFixed(3)} → ${b.toFixed(3)}`).join(" · ") + ")"
        );
    if (z.bend)
        console.log(
            `  F4 Gras: Biegung links ${z.bend.dLinks.toFixed(3)} / rechts +${z.bend.dRechts.toFixed(3)}`
        );
    if (z.boe) console.log(`  F5 Böe am Ort ±${z.boe.ab} · zweite Welle ±${z.boe.welle}`);
    console.log("");
    for (const f of out.fails) console.log(`  ❌ ${f}`);
    const ok = out.fails.length === 0;
    console.log(
        ok
            ? "  ✅ ALLE KOPPLUNGS-INVARIANTEN OK — Wände gleiten (PM_ClipVelocity), Steilhang rutscht, Wind hat EINE Richtung, Gras weicht aus\n"
            : `\n  ❌ ${out.fails.length} KOPPLUNGS-INVARIANTE(N) VERLETZT\n`
    );
    process.exit(ok ? 0 : 1);
});
