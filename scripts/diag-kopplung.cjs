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
//   F6 DIE WELLE IM HALM (druckwelle-bild): die Druckwelle im EINEN Wind-Term — die Front im Halm am Radius des Gesetzes, der
//      Winkel aus dem Luft-Weg der Welle, der Halm steht wieder auf; ohne Welle ist der Term bit-gleich der alte; der Bild-Takt
//      trägt die Welle ein. Drei Mutanten (ohne Leser, halbe Trägheit, spätere Tafel) MÜSSEN rot sehen.
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
        await warteAufWelt(page, 120000, server);
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
            // Eine Größe ist ein Knoten mit seinem Wert; ein `toVar` trägt ihn weiter (`addAssign` schreibt ihn), `Fn` ruft seinen
            // Rumpf, `If` geht den Zweig nur, wenn die Bedingung gilt — wie die GPU ihn überspringt (F6: die Welle im Halm). Die
            // Tafel der Welle liest die Probe aus den Daten der ECHTEN Textur (`_wellenTafel`).
            const val = (x) => (x && x.v !== undefined ? x.v : x);
            const N = (v) => {
                const n = { v };
                const op = (f) => (b) => N(f(n.v, val(b)));
                Object.assign(n, { mul: op((a, b) => a * b), add: op((a, b) => a + b), sub: op((a, b) => a - b), div: op((a, b) => a / b) });
                return Object.assign(n, { greaterThan: op((a, b) => (a > b ? 1 : 0)), toVar: () => n, addAssign: (b) => ((n.v += val(b)), n) });
            };
            const V = (...a) => {
                const w = Object.fromEntries(a.map((x, i) => ["xyzw"[i], N(val(x))]));
                Object.defineProperty(w, "add", { value: (b) => V(...a.map((x, i) => val(x) + val(b["xyzw"[i]]))) });
                return w;
            };
            const f = (g) => (...a) => N(g(...a.map(val)));
            const T = { float: f((x) => x), fract: f((x) => x - Math.floor(x)), vec3: V, ivec2: V, int: f(Math.trunc) };
            for (const k of ["sin", "cos", "sqrt", "max", "min", "tanh", "asin", "log", "floor", "pow"]) T[k] = f(Math[k]);
            Object.assign(T, {
                clamp: f((x, a, b) => Math.min(b, Math.max(a, x))),
                step: f((kante, x) => (x >= kante ? 1 : 0)),
                mix: f((a, b, t) => a + (b - a) * t),
                Fn: (g) => () => g(),
                If: (c, g) => void (val(c) && g()),
                textureLoad: (tex, ij) => V(...tex.image.data.subarray(4 * val(ij.x), 4 * val(ij.x) + 4)),
            });
            const E0 = { t: 3.7, U: 0.4, dx: 1, dz: 0 };
            // e.wellen: die lebenden Druckwellen [{ x, z, w3, alter, radius }] in der Höhe der Ecke; `mut(s)` verdirbt den Leser
            // (die Selbst-Tests von F6)
            const sway = (e, rausch = () => 0.37, mut = null) => {
                const s = Object.create(r);
                [T.positionWorld, T.positionGeometry] = [V(e.lx, 0.5, e.lz), V(0, e.hy, 0)];
                s._weltNaht = () => ({ lage: T.positionWorld, vorlage: (x) => x });
                const uBend = [0, 1, 2, 3, 4, 5].map((i) => V(...((!i && e.b) || [0, -1e6, 0, 0])));
                const wl = e.wellen || [];
                const slots = Array.from({ length: AR.DRUCK.bildWellen }, (_, i) => wl[i] || { x: 0, z: 0, w3: 0, alter: 0, radius: 0 });
                const [uWelle, uWelleUhr] = [slots.map((w) => V(w.x, 0.5, w.z, w.w3)), slots.map((w) => V(w.alter, w.radius))];
                const windUniforms = { uWindTime: N(e.t), uWindStrength: N(e.U), uWindDir: V(e.dx, e.dz), uBend, uWelleZahl: N(wl.length), uWelle, uWelleUhr };
                s.state = { windUniforms, materials: r.state.materials };
                if (mut) mut(s);
                const o = r._windSwayOffset.call(s, T, { rausch: N(rausch(e)) });
                return { x: o.x.v, y: o.y.v, z: o.z.v };
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
                    // der Wind-Satz entsteht am ersten Leser (Boden, Gras: `_windUniformsEnsure`) — die Probe nimmt dieselbe Tür,
                    // bevor der Takt schreibt (bis 16.11. legte ihn zufällig das Material einer fliegenden Insel an)
                    gras: () => (r._windUniformsEnsure(), r._loopRender(), st.windUniforms.uWindStrength.value),
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

            // ══ F6 DIE WELLE IM HALM (druckwelle-bild) — die Druckwelle im EINEN Wind-Term (`_halmWelle`), an der Energie eines
            //    Fasses (60 MJ), ohne Wind (der Versatz ist die Welle allein):
            //    RUHE      ohne Welle ist der Versatz bit-gleich dem Wind-Term ohne den Leser der Welle, die Höhe genau 0;
            //    FRONT     zu drei Altern (die Front bei 5 · 15 · 40 m) liegt die Grenze stehender ↔ geneigter Halm am Radius des
            //              Gesetzes (`druckwelle().ankunft`); vor der Front und jenseits des Radius der Welle steht jeder Halm;
            //    WINKEL    am Ende des Pulses neigt er um asin(tanh(κ · ξ ÷ L)), ξ der Luft-Weg des Gesetzes (`druckwelle().weg`,
            //              geschlossen gerechnet, nicht die Tafel) — radial von der Ladung weg, seine Länge bleibt;
            //    AUFSTEHEN nach Dauer + √θ ÷ Rate steht er (Versatz genau 0), auf halbem Weg dazwischen; zwei Wellen summieren
            //              (höchstens liegend), zwei gegenüber heben sich auf;
            //    TAKT      `_druckWelle` trägt die Welle ein, `_tickHalmWelle` füllt Slot 0 (Ort, W^(1/3), Alter auf der Welt-Uhr,
            //              Radius) und leert ihn nach `bildEnde`.
            //    Selbst-Tests: der Leser ohne Welle, die halbe Trägheit des Halms und eine um 5 % spätere Tafel MÜSSEN rot sehen. ══
            {
                const SG = globalThis.__schmiedeCore.STOFF_GESETZ;
                const [luft, hz, E, hy] = [r._druckLuft(), r._halmZahlen(), 6e7, 0.4];
                const [w3, radius] = [Math.cbrt(E / SG.DRUCK.tntJ), SG.druckRadius(E, luft)];
                const still = { ...E0, U: 0, lz: 0, hy };
                const eine = (alter, x = 0) => ({ x, z: 0, w3, alter, radius });
                const halm = (R, wellen, mut) => sway({ ...still, lx: R, wellen }, undefined, mut);
                const neigung = (o) => Math.hypot(o.x, o.z) / hy;
                const welle = (mut) => {
                    const z = { front: 0, vor: 0, winkel: 0, form: 0, auf: 0 };
                    for (const Rf of [5, 15, 40]) {
                        const alter = SG.druckwelle(E, Rf, luft).ankunft;
                        let [lo, hi] = [Rf - 2, Rf + 2];
                        z.vor = Math.max(z.vor, neigung(halm(hi, [eine(alter)], mut)));
                        if (!(neigung(halm(lo, [eine(alter)], mut)) > 0)) {
                            z.front = 1e9; // hinter der Front steht der Halm: keine Grenze
                            continue;
                        }
                        for (let k = 0; k < 40; k++) {
                            const m = 0.5 * (lo + hi);
                            if (neigung(halm(m, [eine(alter)], mut)) > 0) lo = m;
                            else hi = m;
                        }
                        z.front = Math.max(z.front, Math.abs(0.5 * (lo + hi) - Rf));
                    }
                    z.vor = Math.max(z.vor, neigung(halm(radius + 1, [eine(SG.druckwelle(E, radius + 1, luft).ankunft + 0.02)], mut)));
                    for (const R of [5, 10, 20, 40, 100]) {
                        const w = SG.druckwelle(E, R, luft);
                        const soll = Math.asin(Math.tanh(hz.traeg * w.weg));
                        const o = halm(R, [eine(w.ankunft + w.dauer)], mut);
                        z.winkel = Math.max(z.winkel, Math.abs(Math.asin(Math.min(1, neigung(o))) - soll));
                        z.form = Math.max(z.form, Math.abs(o.z), o.x > 0 ? 0 : 1, Math.abs(Math.hypot(hy + o.y, o.x, o.z) - hy));
                        const steht = w.ankunft + w.dauer + Math.sqrt(soll) / hz.rueck;
                        const halb = neigung(halm(R, [eine(0.5 * (w.ankunft + w.dauer + steht))], mut));
                        z.auf = Math.max(z.auf, neigung(halm(R, [eine(steht + 0.01)], mut)), halb > 0 && halb < Math.sin(soll) ? 0 : 1);
                    }
                    return z;
                };
                const ohne = (s) => (s._halmWelle = () => V(0, 0, 0));
                const traeg = (s) => (s._halmZahlen = () => ({ ...hz, traeg: hz.traeg / 2 }));
                const spaet = (s) =>
                    (s._wellenTafel = function (TT) {
                        const lies = r._wellenTafel.call(this, TT);
                        return (Z) => Object.assign(lies(Z), { zeit: lies(Z).zeit.mul(1.05) });
                    });
                const [gut, rot] = [welle(null), { ohne: welle(ohne), traeg: welle(traeg), spaet: welle(spaet) }];
                // RUHE: der Wind allein, mit und ohne den Leser der Welle
                const wind = { ...E0, lx: 3.3, lz: 1.7, hy: 0.5 };
                const [a, b] = [sway(wind), sway(wind, undefined, ohne)];
                const ruhe = a.x === b.x && a.z === b.z && a.y === 0 && Math.hypot(a.x, a.z) > 1e-3;
                // zwei Wellen am selben Ort (höchstens liegend) und zwei gegenüber (sie heben sich auf)
                const spitze = SG.druckwelle(E, 5, luft);
                const [ein, zwei, gegen] = [
                    halm(5, [eine(spitze.ankunft + spitze.dauer)]),
                    halm(5, [eine(spitze.ankunft + spitze.dauer), eine(spitze.ankunft + spitze.dauer)]),
                    halm(5, [eine(spitze.ankunft + spitze.dauer), eine(spitze.ankunft + spitze.dauer, 10)]),
                ];
                const summe = neigung(zwei) > neigung(ein) && neigung(zwei) <= 1 + 1e-12 && zwei.y >= -hy - 1e-12 && neigung(gegen) < 1e-9;
                // TAKT: der echte Schreiber in einer Welt ohne Körper im Radius (keine Frist trifft die Probe-Welt)
                const wu = r._ensureWindCoupling(THREE.TSL);
                const w = Object.create(r);
                // die Probe-Welt trägt je Augenblick IHREN Stand (die Uhr der Welt schreibt die Probe nie — Ein-Schreiber-Wand)
                const um = (t) => (w.state = Object.assign(Object.create(r.state), { creatures: [], playerMesh: null, spielZeit: t }));
                um(100);
                Object.assign(w, { _druckFristen: [], _druckWellen: [], _blockerUmPlatz: () => {} });
                const P = pm.position;
                const wl = w._druckWelle({ x: P.x + 7, y: P.y, z: P.z - 3 }, E, 100);
                um(100.25);
                w._tickHalmWelle();
                const [s0, u0] = [wu.uWelle[0].value, wu.uWelleUhr[0].value];
                const traegtEin =
                    wu.uWelleZahl.value === 1 && Math.abs(s0.x - P.x - 7) < 1e-6 && Math.abs(s0.z - P.z + 3) < 1e-6 &&
                    Math.abs(s0.w - w3) < 1e-9 && Math.abs(u0.x - 0.25) < 1e-9 && Math.abs(u0.y - radius) < 1e-9;
                um(wl.bildEnde + 0.01);
                w._tickHalmWelle();
                const leert = wu.uWelleZahl.value === 0 && w._druckWellen.length === 0;
                o.zahlen.welle = { gut, rot, ruhe, summe, traegtEin, leert, lebtS: wl.bildEnde - 100, radius };
                if (!ruhe) fail(`F6: ohne Welle ist der Wind-Term nicht der alte (${JSON.stringify([a, b])})`);
                if (!(gut.front < 1e-3 && gut.vor === 0))
                    fail(`F6: die Front im Halm liegt nicht am Radius des Gesetzes (±${gut.front} m; vor der Front ${gut.vor})`);
                if (!(gut.winkel < 5e-4 && gut.form < 1e-9))
                    fail(`F6: der Halm neigt nicht um den Winkel des Gesetzes (±${gut.winkel} rad; Richtung und Länge ±${gut.form})`);
                if (!(gut.auf === 0)) fail(`F6: der Halm steht nach seiner Frist nicht wieder auf (${gut.auf})`);
                if (!summe) fail(`F6: zwei Wellen summieren nicht bis liegend oder heben sich gegenüber nicht auf (${JSON.stringify([ein, zwei, gegen])})`);
                if (!(traegtEin && leert))
                    fail(`F6: der Bild-Takt trägt die Welle nicht in Slot 0 oder leert ihn nicht (trägt ${traegtEin}, leert ${leert})`);
                if (!(rot.ohne.front > 1)) fail("F6-Selbsttest: der Leser ohne Welle bleibt unerkannt");
                if (!(rot.traeg.winkel > 0.05)) fail(`F6-Selbsttest: die halbe Trägheit des Halms bleibt unerkannt (±${rot.traeg.winkel} rad)`);
                if (!(rot.spaet.front > 0.05)) fail(`F6-Selbsttest: die spätere Tafel bleibt unerkannt (±${rot.spaet.front} m)`);
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
                    // die Welle im Halm: der Wind-Term der Welt ruft ihren Leser, der Bild-Takt ihren Schreiber
                    const leser = ruft(r, "_windSwayOffset", r, "_halmWelle", [THREE.TSL, {}]);
                    const takt = ruft(r, "_loopRender", r, "_tickHalmWelle", []);
                    if (!(leser > 0 && takt > 0))
                        fail(`KONSUM: die Welle erreicht den Halm nicht (\`_halmWelle\` ${leser}, \`_tickHalmWelle\` ${takt} Rufe)`);
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
    if (z.welle) {
        const [g, m] = [z.welle.gut, z.welle.rot];
        console.log(
            `  F6 Welle im Halm: Front ±${(g.front * 1000).toFixed(3)} mm · Winkel ±${g.winkel.toExponential(2)} rad · Form ±${g.form.toExponential(1)} · lebt ${z.welle.lebtS.toFixed(2)} s bis ${z.welle.radius.toFixed(1)} m` +
                ` · Mutanten: ohne Leser Front ${m.ohne.front} · halbe Trägheit ±${m.traeg.winkel.toFixed(3)} rad · spätere Tafel ±${m.spaet.front.toFixed(3)} m`
        );
    }
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
