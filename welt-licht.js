// welt-licht.js — DAS LICHT DES ORTS: die EINE Atmosphäre der Welt als Tafeln (Hillaire 2020), die Sonne, die Umgebung und die
// Belichtung — EIN Baustein der Engine, den die Welt (stamm/bild-himmel.js ruft ihn je Tafel, je Anker, je Belichtung) UND die
// Bühne der Studios laden (`buehne`, studios.K4: Studio = Modus der Welt-Engine — ein Studio zeichnet sein Werk im Licht der
// Welt, nie unter eigenen Studio-Lichtern). Bis w12-studio-buehne lebten Tafeln, Anker und Belichtung nur im Stamm, den eine
// Studio-Seite nie lädt (gate:studio-huelle H6) — darum zeichnete jede Bühne unter eigenem Licht (garage: Key 2,93π Bernstein,
// Fill, Rim, schwarze Bühne mit Nebel, Belichtung 1,04; die Welt am Mittag: Sonne 6,97 und Himmel, Belichtung 0,511).
// Das Gesetz der Luft selbst (Medium, Durchlass, Sonne) bleibt Kern: foundry-core `ATMO_GESETZ` · `ATMO_RECHNUNG` (VOR diesem
// Skript geladen). THREE ist erst beim Ruf nötig (die Tafeln sind TSL, r184), nie beim Laden.
// eslint-disable-next-line no-unused-vars
var __weltLicht = (function () {
    "use strict";
    const KERN = globalThis.__terrainCore;
    if (!KERN || !KERN.ATMO_GESETZ || !KERN.ATMO_RECHNUNG)
        throw new Error("welt-licht.js: die Atmosphäre fehlt — foundry-core.js (__terrainCore.ATMO_GESETZ) lädt vor dem Licht");

    // DIE TAFELN DER EINEN ATMOSPHÄRE (D3, Hillaire 2020; `atmoTafeln`): Größen (Texel) und Marsch-Schritte. Transmittance
    // 256×64 und Ψ_ms 32×32 je Medium, die Himmels-Sicht 192×108 je Stufe der Sonne, die Umgebung 128×64 (Equirekt, PMREM).
    // mediumStufe: die Stufe des Mediums im Logarithmus der Extinktion (`_atmoMediumJetzt`) — 2 % halten den Zenit-Durchlass
    // der klaren Luft (Aerosol-Tiefe 0,18) unter einer 8-bit-Stufe; ein Übergang klar → Sturm (Faktor 13) sind 130 Stufen.
    // flug: so viele Stufen darf das Medium wandern, solange die Tafel im Flug ist (`_waagrechtIrradianz`) — der steilste Anstieg im
    // Zug klar → Regen (β ×1,13 je Sekunde, 6 Stufen) bleibt eine Sekunde darunter, der Himmel je E0 folgt ihm mit ≤ β^0,62:
    // 8 Stufen sind ≤ 10 % am Himmel, am Mittag ≤ 0,02 EV an der Karte.
    const ATMO_LUT = Object.freeze({
        mediumStufe: 0.02,
        flug: 8,
        durchlass: Object.freeze([256, 64]),
        mehrfach: Object.freeze([32, 32]),
        himmel: Object.freeze([192, 108]),
        umgebung: Object.freeze([128, 64]),
        bestrahlung: Object.freeze([65, 1]),
        richtungen: Object.freeze([12, 24]),
        schritte: Object.freeze({ durchlass: KERN.ATMO_GESETZ.durchlassSchritte, mehrfach: 20, himmel: 32 }),
    });
    // DER BODEN DER ATMOSPHÄRE (D3): die gemessene Welt-Albedo (linear) — das Mittel aus Laub und Wald-Boden der Albedo-Tafel
    // (spec/farbe/albedo-tafel.json, ist.welt; `werkbank albedo --tafel`), nie ein Grau 0,3. Er trägt die Mehrfachstreuung UND die
    // untere Hälfte der EINEN Umgebung — den Boden, den jeder nahe Stoff spiegelt (Geschichte: stamm/bild-himmel.js).
    const ATMO_BODEN = Object.freeze([0.1003, 0.1385, 0.0449]);
    // Licht-Rig: KEY_BASE skaliert die Rayleigh-Lichtmenge aufs Schlüssellicht (Mittag ≈ 2.6·0.913). Ziel key-dominant (Vorlage
    // dir/(amb+hemi) ≈ 15:1); die Schattenseite trägt der Himmel.
    const KEY_BASE = 2.6;
    // r128→r184-Licht-Übersetzung (three.js r155, useLegacyLights → physisch): Legacy-Licht hatte keine 1/π-BRDF-Normierung —
    // physikalische Lichter sind bei gleicher Zahl ~π-fach dunkler. Die aus dem r128-Studio kopierten Rig-Werte (Key · Hemi-Tag)
    // laufen durch diesen EINEN Faktor; die Nacht bleibt unberührt. Kein Tuning-Knopf.
    const LEGACY_LICHT = Math.PI;
    // DIE BELICHTUNG (licht.K1) — EINE Eichung mit der Tonkurve (F1): `kurve` ist die Tonkurve des Renderers (three r184: Khronos
    // PBR Neutral), `zielKarte` das k·L der 18-%-Karte, das DIESE Kurve auf Mittelgrau legt (sRGB 118; `kartenEichung(kurve, 0)`
    // in scripts/lib/licht-linsen.cjs rechnet es nach). `min` ist nur die Wand gegen ein entartetes Licht. `steigung` ist die
    // Kompensations-Steigung des Tags (1 = volle Adaption, 0 = feste Blende), `stufen` die Knoten [Grad, Stufen] der Tag-Achse
    // für Dämmerung und Nacht, `gleitung` [oben, unten] das Band, in dem die Kamera von der Steigung auf sie gleitet; `nachtGrad`
    // (S7) die Tiefe der Sonne, in der das Nacht-Auge der Post-Kette ganz steht. Die Messungen stehen am Stamm (bild-himmel.js).
    const BELICHTUNG = Object.freeze({
        kurve: "NeutralToneMapping",
        zielKarte: 0.22,
        min: 0.05,
        steigung: 0.75,
        gleitung: Object.freeze([12, 8]),
        stufen: Object.freeze([Object.freeze([10, -0.87]), Object.freeze([-20, -2.17])]),
        nachtGrad: -32,
    });
    // DIE GRENZGRÖSSE DER STERNE je Sonnenhöhe [Grad, Größe] (V18.530, `HIMMEL.grenzgroesse` der Welt): im hellen Tag (≥ 10°) ist
    // nichts zu sehen, am Ende der bürgerlichen Dämmerung (−6°) +1,5, der nautischen (−12°) +4, astronomische Nacht (−18°) +6 —
    // die Anker der EINEN Tag-Achse (`tagAchse`).
    const GRENZGROESSE = Object.freeze(
        [
            [10, -5],
            [2, -4.5],
            [0, -3],
            [-6, 1.5],
            [-12, 4],
            [-18, 6],
        ].map((a) => Object.freeze(a))
    );
    // MONDLICHT: nachts wird das Haupt-Richtlicht zur Mondquelle — `r/g/b` der Purkinje-Hue aus dem Gesetz
    // (`ATMO_GESETZ.nacht.mond`), `intensity` die Helligkeit; das Wetter dimmt ihn.
    const MOONLIGHT = Object.freeze({
        r: KERN.ATMO_GESETZ.nacht.mond[0],
        g: KERN.ATMO_GESETZ.nacht.mond[1],
        b: KERN.ATMO_GESETZ.nacht.mond[2],
        intensity: 0.22,
    });
    // DIE GPU-LEINE (Welt `_gpuLeineFrei`, Bühne `buehneZeichnet`): höchstens so viele Bilder zugleich auf der GPU unterwegs — mehr
    // ist nur Eingabe-Verzug (gemessen 04.10.: 600 ms bei ≈ 10 Frames in der Schlange), nie mehr Durchsatz.
    const GPU_FRAMES_IM_FLUG = 2;

    // DAS SCHIRM-DREIECK: EIN Dreieck über den ganzen Schirm in der Form von r184 `QuadMesh` (Lage [-1,3 · -1,-1 · 3,-1], uv
    // [0,-1 · 0,1 · 2,1], Ortho-Kamera ±1 in `userData.kamera`), sein Fragment aus `fn()` — die Pässe der Atmosphäre und das
    // Ausgabe-Dreieck jeder Bühne (`_buehneRender`) teilen Geometrie und Kamera.
    let schirmForm = null;
    function schirmDreieck(fn, name) {
        const THREE = globalThis.THREE;
        const D =
            schirmForm ||
            (schirmForm = {
                g: new THREE.BufferGeometry()
                    .setAttribute("position", new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3))
                    .setAttribute("uv", new THREE.Float32BufferAttribute([0, -1, 0, 1, 2, 1], 2)),
                kamera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            });
        const m = new THREE.MeshBasicNodeMaterial();
        m.name = name;
        m.fragmentNode = fn();
        m.depthTest = false;
        m.depthWrite = false;
        m.toneMapped = false;
        m.fog = false;
        const q = new THREE.Mesh(D.g, m);
        q.name = name;
        q.frustumCulled = false;
        q.userData.kamera = D.kamera;
        return q;
    }

    // DIE RICHTUNG DER EQUIREKT-LAGE (die Umkehr von r184 `equirectUV`): uv → Einheits-Richtung, φ = (u − ½)·2π, Höhe = (v − ½)·π
    // — so malt die Umgebung (`passUmgebung`), so tastet die Himmels-Sonde des Lichts der Welt ab (`_weltLichtHimmel`).
    function umgebungRichtung(q) {
        const phi = q.x.sub(0.5).mul(2 * Math.PI);
        const el = q.y.sub(0.5).mul(Math.PI);
        return globalThis.THREE.TSL.vec3(el.cos().mul(phi.cos()), el.sin(), el.cos().mul(phi.sin()));
    }

    // DIE TAFELN (EINMAL je Szene): Fragment-Pässe in RenderTargets — EIN Pfad für WebGPU und WebGL (Compute hätte unter
    // WebGL keinen Himmel). Transmittance 256×64 (Bruneton-Parametrisierung) und Mehrfachstreuung Ψ_ms 32×32 (Hillaire Gl.
    // 5–9) je Medium, die Himmels-Sicht 192×108 (Azimut absolut, Breite quadratisch um den Horizont) je Stufe der Sonne,
    // die Umgebung 128×64 (Equirekt, die Vorlage von PMREM) im groben Takt der Umgebung. Die Leser: die Kuppel und die Luft
    // (`himmelFarbe`), der Spiegel des Wassers, die Umgebung (PMREM, der Film des Tors). `o.G` das Gesetz der Luft (die Welt: ihr
    // Himmel, `_atmoGesetz`), `o.M` das Medium (`_atmoMediumJetzt`), `o.teilen` legt die Uniforms in ihre Gruppe (die Welt: die
    // renderGroup, `_uniformHeimatTeilen` — Kuppel und Luft sind Stoffe der Szene). → die Tafeln (Uniforms, Ziele, Pässe).
    function atmoTafeln(o) {
        const THREE = globalThis.THREE;
        const teilen = o.teilen || ((u) => u);
        if (typeof THREE === "undefined" || !THREE.TSL || !THREE.MeshBasicNodeMaterial || !THREE.RenderTarget)
            throw new Error("Die Atmosphäre: THREE trägt TSL/MeshBasicNodeMaterial/RenderTarget nicht (Vendor)");
        const T = THREE.TSL;
        const { Fn, float, vec2, vec3, vec4, uv, texture, exp, sqrt, max, clamp, select, Loop, If, dot, length } = T;
        const G = o.G;
        const Z = ATMO_LUT;
        const RG = G.erdeM / 1000,
            RT = G.randM / 1000;
        const H = Math.sqrt(RT * RT - RG * RG);
        const PI = Math.PI;
        const M = o.M;
        const U = teilen({
            betaR: T.uniform(new THREE.Vector3().fromArray(M.betaR)),
            HR: T.uniform(M.HR),
            HM: T.uniform(M.HM),
            mieExt: T.uniform(new THREE.Vector3().fromArray(M.mieExt)),
            mieSca: T.uniform(new THREE.Vector3().fromArray(M.mieSca)),
            g: T.uniform(M.g),
            ozon: T.uniform(new THREE.Vector3().fromArray(M.ozon)),
            albedo: T.uniform(new THREE.Vector3().fromArray(M.albedo)),
            hKm: T.uniform(0.002),
            sonne: T.uniform(new THREE.Vector3(0, 1, 0)),
            mond: T.uniform(new THREE.Vector3(0, -1, 0)),
            // DAS LICHT JETZT (E0, `_atmoE0`): die Tafeln tragen den Himmel je Einheit der Sonne über der Atmosphäre, der Leser
            // (`himmelFarbe`, die Wolke) multipliziert E0 — die Tages-Intensität ist linear und zeichnet keine Tafel neu
            licht: T.uniform(1),
            // der Mond in Einheiten von E0 (Purkinje-Hue × MOONLIGHT × Wetter / E0)
            mondE: T.uniform(new THREE.Vector3(0, 0, 0)),
            // das Sternen-Licht in Einheiten von E0 (die Zenit-Leuchtdichte des Gesetzes × der Anteil der Nacht / E0, `_atmoSternenLicht`)
            nachtE: T.uniform(new THREE.Vector3(0, 0, 0)),
            toenung: T.uniform(new THREE.Vector3(1, 1, 1)),
        });
        const ziel = (w, h, wrapS, name) => {
            const rt = new THREE.RenderTarget(w, h, {
                type: THREE.HalfFloatType,
                depthBuffer: false,
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            });
            rt.name = name;
            rt.texture.name = name;
            rt.texture.wrapS = wrapS || THREE.ClampToEdgeWrapping;
            rt.texture.wrapT = THREE.ClampToEdgeWrapping;
            return rt;
        };
        const rtT = ziel(Z.durchlass[0], Z.durchlass[1], null, "atmo-durchlass");
        const rtMS = ziel(Z.mehrfach[0], Z.mehrfach[1], null, "atmo-mehrfach");
        const rtSV = ziel(Z.himmel[0], Z.himmel[1], THREE.RepeatWrapping, "atmo-himmel");
        const rtEq = ziel(Z.umgebung[0], Z.umgebung[1], THREE.RepeatWrapping, "himmel-umgebung");
        const rtBS = ziel(Z.bestrahlung[0], Z.bestrahlung[1], null, "atmo-bestrahlung");
        rtEq.texture.mapping = THREE.EquirectangularReflectionMapping;
        // ── das Medium als Knoten (h in km über dem Bezug) ──
        const dichteO = (h) =>
            max(
                float(1).sub(
                    h
                        .sub(G.ozon.mitteM / 1000)
                        .abs()
                        .div(G.ozon.halbM / 1000)
                ),
                0
            );
        const streuR = (h) => U.betaR.mul(exp(h.negate().div(U.HR)));
        const streuM = (h) => U.mieSca.mul(exp(h.negate().div(U.HM)));
        const ext = (h) =>
            streuR(h)
                .add(U.mieExt.mul(exp(h.negate().div(U.HM))))
                .add(U.ozon.mul(dichteO(h)));
        const subUv = (x, n) =>
            clamp(x, 0, 1)
                .mul(1 - 1 / n)
                .add(0.5 / n);
        const ausUv = (u, n) => clamp(u.sub(0.5 / n).div(1 - 1 / n), 0, 1);
        const amBoden = (r, mu) =>
            T.and(
                mu.lessThan(0),
                r
                    .mul(r)
                    .mul(mu.mul(mu).sub(1))
                    .add(RG * RG)
                    .greaterThanEqual(0)
            );
        const zumRand = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .add(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RT * RT),
                            0
                        )
                    )
                );
        const zumBoden = (r, mu) =>
            r
                .negate()
                .mul(mu)
                .sub(
                    sqrt(
                        max(
                            r
                                .mul(r)
                                .mul(mu.mul(mu).sub(1))
                                .add(RG * RG),
                            0
                        )
                    )
                );
        const durchlass = (r, mu) => {
            const rho = sqrt(max(r.mul(r).sub(RG * RG), 0));
            const d = max(zumRand(r, mu), 0);
            const dMin = float(RT).sub(r);
            const dMax = rho.add(H);
            const xmu = d.sub(dMin).div(max(dMax.sub(dMin), 1e-4));
            const t = texture(rtT.texture, vec2(subUv(xmu, Z.durchlass[0]), subUv(rho.div(H), Z.durchlass[1]))).level(
                float(0)
            ).rgb;
            return select(amBoden(r, mu), vec3(0), t);
        };
        // Ψ_ms in Zeilen LINEAR in der Höhe (Hillaire): die zweite Zeile liegt bei 3,2 km. Quadratisch (w = √(h/H), Zeilen bei 0,
        // 0,10, 0,42, 0,94 km — w4-ferne-blau, Duv −0,001 am Horizont) löste die Grenzschicht des Dunsts auf und hob im dichten
        // Dunst des Regens das Licht des Himmels: das Regenbild stieg über das der Sonne (werkbank licht --naesse, Radeon: Wiese
        // 0,966 → 1,012, Dorf 0,951 → 1,050; gate:naesse:echt ROT) — heil-w4-ferne-blau.
        const mehrfach = (h, mus) =>
            texture(
                rtMS.texture,
                vec2(subUv(mus.add(1).mul(0.5), Z.mehrfach[0]), subUv(h.div(RT - RG), Z.mehrfach[1]))
            ).level(float(0)).rgb;
        const phaseR = (nu) =>
            nu
                .mul(nu)
                .add(1)
                .mul(3 / (16 * PI));
        const phaseM = (nu) => {
            const g2 = U.g.mul(U.g);
            return g2.oneMinus().div(
                g2
                    .add(1)
                    .sub(U.g.mul(nu).mul(2))
                    .pow(1.5)
                    .mul(4 * PI)
            );
        };
        // ── Transmittance: je Texel der Durchlass (r, mu) bis zum Rand ──
        const passDurchlass = Fn(() => {
            const q = uv();
            const xmu = ausUv(q.x, Z.durchlass[0]);
            const rho = ausUv(q.y, Z.durchlass[1]).mul(H).toVar();
            const r = sqrt(rho.mul(rho).add(RG * RG)).toVar();
            const dMin = float(RT).sub(r);
            const d = dMin.add(xmu.mul(rho.add(H).sub(dMin))).toVar();
            const mu = clamp(
                select(
                    d.lessThan(1e-4),
                    float(1),
                    float(H * H)
                        .sub(rho.mul(rho))
                        .sub(d.mul(d))
                        .div(r.mul(d).mul(2))
                ),
                -1,
                1
            ).toVar();
            const tau = vec3(0).toVar();
            const N = Z.schritte.durchlass;
            const dt = d.div(N).toVar();
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const t = s.add(0.5).mul(dt);
                const hi = max(sqrt(t.mul(t).add(r.mul(mu).mul(t).mul(2)).add(r.mul(r))).sub(RG), 0);
                tau.addAssign(ext(hi).mul(dt));
            });
            return vec4(exp(tau.negate()), 1);
        });
        // ── Ψ_ms: je (cos Sonnen-Zenit, Höhe) die Mehrfachstreuung (Hillaire Gl. 5–9), 8 × 8 Richtungen, Boden = Welt-Albedo ──
        const passMehrfach = Fn(() => {
            const q = uv();
            const mus = ausUv(q.x, Z.mehrfach[0]).mul(2).sub(1).toVar();
            const h = max(ausUv(q.y, Z.mehrfach[1]).mul(RT - RG), 0.001).toVar();
            const r = h.add(RG).toVar();
            const sun = vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0).toVar();
            const Lsum = vec3(0).toVar();
            const Fsum = vec3(0).toVar();
            const N = Z.schritte.mehrfach;
            Loop({ start: 0, end: 64, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(8).floor();
                const b = k.sub(a.mul(8));
                const mu = a
                    .add(0.5)
                    .mul(2 / 8)
                    .sub(1)
                    .toVar();
                const sv = sqrt(max(float(1).sub(mu.mul(mu)), 0));
                const phi = b.add(0.5).mul((2 * PI) / 8);
                const v = vec3(sv.mul(phi.cos()), mu, sv.mul(phi.sin())).toVar();
                const boden = amBoden(r, mu).toVar();
                const tMax = select(boden, zumBoden(r, mu), zumRand(r, mu)).toVar();
                const thr = vec3(1).toVar();
                const L = vec3(0).toVar();
                const F = vec3(0).toVar();
                const tAlt = float(0).toVar();
                Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                    const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                    const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                    const dt = tE.sub(tAlt).toVar();
                    tAlt.assign(tE);
                    const p = vec3(v.x.mul(tM), r.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                    const ri = length(p).toVar();
                    const hi = max(ri.sub(RG), 0).toVar();
                    const sca = streuR(hi).add(streuM(hi)).toVar();
                    const e = max(ext(hi), vec3(1e-7)).toVar();
                    const tr = exp(e.negate().mul(dt)).toVar();
                    const integ = tr.oneMinus().div(e).toVar();
                    L.addAssign(
                        thr
                            .mul(sca)
                            .mul(durchlass(ri, dot(p, sun).div(ri)))
                            .mul(integ)
                            .mul(1 / (4 * PI))
                    );
                    F.addAssign(thr.mul(sca).mul(integ));
                    thr.mulAssign(tr);
                });
                If(boden, () => {
                    const gp = vec3(v.x.mul(tMax), r.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                    const gr = length(gp).toVar();
                    const nl = max(dot(gp, sun).div(gr), 0).toVar();
                    L.addAssign(
                        thr
                            .mul(durchlass(gr, nl))
                            .mul(nl)
                            .mul(U.albedo)
                            .mul(1 / PI)
                    );
                });
                Lsum.addAssign(L);
                Fsum.addAssign(F);
            });
            const fms = Fsum.div(64);
            return vec4(Lsum.div(64).div(max(fms.oneMinus(), vec3(1e-4))), 1);
        });
        // ── die Himmels-Sicht: Richtung ↔ Texel (Azimut absolut, Breite quadratisch um den Horizont des Auges) ──
        const horizontEl = () => T.acos(float(RG).div(U.hKm.add(RG))).negate();
        const himmelUv = (dir) => {
            const el = T.asin(clamp(dir.y, -1, 1)).toVar();
            const hz = horizontEl().toVar();
            const oben = sqrt(max(el.sub(hz).div(float(PI / 2).sub(hz)), 0))
                .mul(0.5)
                .add(0.5);
            const unten = float(0.5).sub(sqrt(max(hz.sub(el).div(float(PI / 2).add(hz)), 0)).mul(0.5));
            const u = T.atan(dir.z, dir.x)
                .div(2 * PI)
                .add(1)
                .fract();
            return vec2(u, subUv(select(el.greaterThanEqual(hz), oben, unten), Z.himmel[1]));
        };
        // DER MARSCH längs v: die Quellen (Richtung, Gewicht in Einheiten von E0 — die Sonne 1, der Mond `mondE`) und das
        // Sternen-Licht (`nacht`, in E0). Die Himmels-Sicht ruft ihn mit Sonne, Mond und Sternen, die Bestrahlungs-Tafel mit
        // EINER Quelle je Sonnenhöhe — derselbe Marsch, dieselbe Streuung, dieselben Tafeln.
        const marsch = (v, quellen, nacht) => {
            const r0 = U.hKm.add(RG).toVar();
            const mu = v.y;
            const boden = amBoden(r0, mu).toVar();
            const tMax = select(boden, zumBoden(r0, mu), zumRand(r0, mu)).toVar();
            const ph = quellen.map((q) => {
                const nu = dot(v, q.dir);
                return vec2(phaseR(nu), phaseM(nu)).toVar();
            });
            const thr = vec3(1).toVar();
            const L = vec3(0).toVar();
            const tAlt = float(0).toVar();
            const N = Z.schritte.himmel;
            Loop({ start: 0, end: N, type: "float", name: "s" }, ({ s }) => {
                const tE = tMax.mul(s.add(1).div(N).pow(2)).toVar();
                const tM = tMax.mul(s.add(0.5).div(N).pow(2));
                const dt = tE.sub(tAlt).toVar();
                tAlt.assign(tE);
                const p = vec3(v.x.mul(tM), r0.add(v.y.mul(tM)), v.z.mul(tM)).toVar();
                const ri = length(p).toVar();
                const hi = max(ri.sub(RG), 0).toVar();
                const sR = streuR(hi).toVar();
                const sM = streuM(hi).toVar();
                const sca = sR.add(sM).toVar();
                const S = quellen
                    .map((q, i) => {
                        const muQ = dot(p, q.dir).div(ri).toVar();
                        const s = durchlass(ri, muQ)
                            .mul(sR.mul(ph[i].x).add(sM.mul(ph[i].y)))
                            .add(mehrfach(hi, muQ).mul(sca));
                        return q.gewicht ? q.gewicht.mul(s) : s;
                    })
                    .reduce((a, b) => a.add(b))
                    .toVar();
                const e = max(ext(hi), vec3(1e-7)).toVar();
                const tr = exp(e.negate().mul(dt)).toVar();
                L.addAssign(thr.mul(S).mul(tr.oneMinus().div(e)));
                thr.mulAssign(tr);
            });
            // DAS STERNEN-LICHT (D3-2, `ATMO_GESETZ.nacht`): über dem Horizont leuchtet der Nachthimmel selbst — schräg durch die
            // leuchtende Schicht gesehen länger (van Rhijn), gedämpft durch dieselbe Luft wie jeder Strahl (`thr`, der Durchlass
            // bis zum Rand). Der Boden unter dem Horizont: Lambert mit der Welt-Albedo im Licht von Sonne und Mond.
            If(boden.not(), () => {
                const q = r0.div(RG + G.nacht.glutHoeheM / 1000);
                const vanRhijn = float(1).div(sqrt(max(float(1).sub(q.mul(q).mul(float(1).sub(mu.mul(mu)))), 1e-4)));
                L.addAssign(nacht.mul(vanRhijn).mul(thr));
            });
            If(boden, () => {
                const gp = vec3(v.x.mul(tMax), r0.add(v.y.mul(tMax)), v.z.mul(tMax)).toVar();
                const n = gp.div(length(gp)).toVar();
                const gr = length(gp).toVar();
                const E = quellen
                    .map((q) => {
                        const l = max(dot(n, q.dir), 0).toVar();
                        const e = durchlass(gr, l).mul(l);
                        return q.gewicht ? q.gewicht.mul(e) : e;
                    })
                    .reduce((a, b) => a.add(b));
                L.addAssign(
                    thr
                        .mul(E)
                        .mul(U.albedo)
                        .mul(1 / PI)
                );
            });
            return L;
        };
        const passHimmel = Fn(() => {
            const q = uv();
            const phi = q.x.mul(2 * PI).toVar();
            const w = ausUv(q.y, Z.himmel[1]);
            const hz = horizontEl().toVar();
            const c = w.sub(0.5).mul(2).toVar();
            const el = select(
                c.greaterThanEqual(0),
                hz.add(c.mul(c).mul(float(PI / 2).sub(hz))),
                hz.sub(c.mul(c).mul(float(PI / 2).add(hz)))
            ).toVar();
            const ce = el.cos().toVar();
            const v = vec3(ce.mul(phi.cos()), el.sin(), ce.mul(phi.sin())).toVar();
            return vec4(marsch(v, [{ dir: U.sonne }, { dir: U.mond, gewicht: U.mondE }], U.nachtE), 1);
        });
        // DIE FARBE DES HIMMELS in Richtung `dir` (Welt): die Himmels-Sicht (je Einheit E0) × das Licht jetzt (E0) × die Tönung
        // (Wetter, Feld, Gefühl, DSL — relativ zum Himmel des Studios, `_dayNightApplySkybox`). Leser: die Kuppel, die Luft.
        const himmelJeLicht = (dir) => texture(rtSV.texture, himmelUv(dir)).level(float(0)).rgb;
        const himmelFarbe = (dir) => himmelJeLicht(dir).mul(U.licht).mul(U.toenung);
        // ── die Umgebung: Equirekt (three `equirectUV`: u = atan(z, x)/2π + ½, v = asin(y)/π + ½) aus der Himmels-Sicht, JE
        // EINHEIT DES LICHTS wie die Tafeln: das Licht jetzt (E0 · Tönung) trägt jeder ihrer Leser je Bild (`_umgebungLicht`) ──
        const passUmgebung = Fn(() => vec4(himmelJeLicht(umgebungRichtung(uv()).toVar()), 1));
        // ── DIE BESTRAHLUNGS-TAFEL (S7): je Texel eine Sonnenhöhe e (quadratisch dicht um den Horizont, e = c·|c|) und die
        // Bestrahlung einer waagrechten Fläche durch den Himmel dieser Sonne, je Einheit E0 — derselbe Marsch wie die Himmels-
        // Sicht über die obere Halbkugel (kosinus-gewichtet, `ATMO_LUT.richtungen`); der letzte Texel trägt das Sternen-Licht je
        // Einheit `nachtE`. Gezeichnet je Medium und Höhe des Auges, EINMAL zurückgelesen (`_himmelsTafelLesen`): die CPU kennt
        // den Himmel jeder Stunde synchron (`_himmelsBestrahlung`), nie eine Lesung nach der Malung.
        const BW = Z.bestrahlung[0];
        const [NT, NP] = Z.richtungen;
        const passBestrahlung = Fn(() => {
            const i = uv().x.mul(BW).floor().toVar();
            const stern = i.greaterThanEqual(BW - 1).toVar();
            const c = i
                .div(BW - 2)
                .mul(2)
                .sub(1)
                .toVar();
            const mus = clamp(c.mul(c.abs()), -1, 1).toVar();
            const sonne = select(stern, vec3(0, -1, 0), vec3(sqrt(max(float(1).sub(mus.mul(mus)), 0)), mus, 0)).toVar();
            const nacht = select(stern, float(1), float(0)).toVar();
            const E = vec3(0).toVar();
            Loop({ start: 0, end: NT * NP, type: "float", name: "k" }, ({ k }) => {
                const a = k.div(NP).floor();
                const ct = sqrt(float(1).sub(a.add(0.5).div(NT))).toVar();
                const sv = sqrt(max(float(1).sub(ct.mul(ct)), 0)).toVar();
                const phi = k
                    .sub(a.mul(NP))
                    .add(0.5)
                    .mul((2 * PI) / NP)
                    .toVar();
                E.addAssign(marsch(vec3(sv.mul(phi.cos()), ct, sv.mul(phi.sin())).toVar(), [{ dir: sonne }], nacht));
            });
            return vec4(E.mul(PI / (NT * NP)), 1);
        });
        // DER PASS: das Schirm-Dreieck (`_schirmDreieck`) — dieselbe uv-Lage, in der jeder Leser die Tafel abtastet.
        const quad = schirmDreieck;
        return {
            U,
            rtT,
            rtMS,
            rtSV,
            rtEq,
            qT: quad(passDurchlass, "atmo-durchlass"),
            qMS: quad(passMehrfach, "atmo-mehrfach"),
            qSV: quad(passHimmel, "atmo-himmel"),
            qEq: quad(passUmgebung, "atmo-umgebung"),
            rtBS,
            qBS: quad(passBestrahlung, "atmo-bestrahlung"),
            tafelSchluessel: null,
            // DIE LESUNG LEBT MIT DER TAFEL (`_himmelsTafelLesen`): die Bestrahlung auf der CPU, ihre Lese-Nummer, der Anker des Himmels
            // und der Belichtung — sie teilen die Lebenszeit der Tafel, die sie lasen. Als Felder am Wirt fielen sie beim Tausch am
            // Ort (`_weltAbschied`), die Tafel blieb mit ihrem Schlüssel und las nie neu: die Belichtung stand nie mehr, das erste
            // Weltbild jeder Ziel-Welt erst am Deckel (60 s, Radeon 30.10.)
            tafel: null,
            tafelFlug: null,
            tafelNr: 0,
            anker: null,
            belichtung: null,
            himmelFarbe,
            durchlass,
            RG,
            mediumBeta: null,
            himmelSchluessel: null,
            himmelVersion: 0,
            tafelnFrisch: false,
        };

    }

    // DIE STUFEN DER KAMERA (rein): die Blenden-Stufen der 18-%-Karte gegen den Anker bei der Sonnenhöhe h (Grad) und dem Licht q
    // (E gegen den Anker). Über `gleitung[0]` die Steigung: log2 q × (1 − `steigung`); unter `gleitung[1]` die Stufen der
    // Tag-Achse (`stufen`, linear in h zwischen den Knoten, außen gehalten); dazwischen linear in h gemischt. `B` die Eichung (die
    // Welt reicht ihre, `AnazhRealm.BELICHTUNG` — an ihr spielen die Linsen ihre Täter ein, scripts/lib/licht-linsen.cjs).
    function belichtungStufen(h, q, B = BELICHTUNG) {
        const K = B.stufen;
        let n = K[K.length - 1][1];
        if (h >= K[0][0]) n = K[0][1];
        else
            for (let i = 1; i < K.length; i++)
                if (h >= K[i][0]) {
                    n = K[i][1] + ((K[i - 1][1] - K[i][1]) * (h - K[i][0])) / (K[i - 1][0] - K[i][0]);
                    break;
                }
        const [oben, unten] = B.gleitung;
        const t = Math.max(0, Math.min(1, (h - unten) / (oben - unten)));
        return t * (1 - B.steigung) * Math.log2(q) + (1 - t) * n;
    }

    // DIE BELICHTUNG AUS DEM LICHT (licht.K1, H1): `w` die Beleuchtungsstärke einer waagrechten Fläche des Orts (rgb), `EA` der
    // Anker (`belichtungAnker`), `e` der Sinus der Sonnenhöhe, `stufen` die Stufen der Kamera (die Welt reicht ihr Glied
    // `AnazhRealm._belichtungStufen`, an dem die Linsen den Schein der Kamera prüfen). → die Belichtung k: die 18-%-Karte unter
    // dem Anker auf `zielKarte` und die Stufen der Kamera gegen ihn; `B` die Eichung (wie `belichtungStufen`).
    function belichtung(w, EA, e, stufen, B = BELICHTUNG) {
        const E = Math.max(0.2126 * w[0] + 0.7152 * w[1] + 0.0722 * w[2], 1e-6);
        const h = (Math.asin(Math.max(-1, Math.min(1, e))) * 180) / Math.PI;
        return Math.max(B.min, (B.zielKarte * 2 ** (stufen || belichtungStufen)(h, E / EA)) / ((0.18 / Math.PI) * E));
    }

    // DER ANKER DER KAMERA (S7, H1): E der waagrechten Karte unter der Zenit-Sonne der klaren Luft — E0 (`KEY_BASE` ·
    // `LEGACY_LICHT`) × (ihr Durchlass, `ATMO_RECHNUNG.sonne`, e = 1, Bezug der Luft, + `himmel`: der Himmel der Bestrahlungs-
    // Tafel derselben Luft, ihr Anker `tafelAnker`). `G` das Gesetz der Luft, `R` seine Rechnung.
    function belichtungAnker(G, R, himmel) {
        const M = R.medium(G, R.betaKlar(G), ATMO_BODEN);
        const s = R.sonne(G, M, 0.001, 1, ATMO_LUT.schritte.durchlass, [0, 0, 0]);
        const l = 0.2126 * s.col.r + 0.7152 * s.col.g + 0.0722 * s.col.b;
        return KEY_BASE * LEGACY_LICHT * (s.lum * l + himmel);
    }

    // E0 — DIE SONNE ÜBER DER ATMOSPHÄRE in Welt-Einheiten: das Schlüssellicht (KEY_BASE, r128 → r184 über LEGACY_LICHT) × die
    // Tages-Intensität `staerke` (der Tint der Welt: Wetter, Aura). Das Richtlicht trägt E0 · Durchlass, die Tafeln den Himmel in E0.
    function e0(staerke) {
        return Math.max(0, KEY_BASE * LEGACY_LICHT * staerke);
    }

    // DER WINKEL DER SONNE zur Tageszeit t (0 Mitternacht · 0,5 Mittag) — ohne die Stufen der Schatten-Karten (`_sonnenWinkel`
    // der Welt hält ihn über sie) — und die Richtung zu ihr (Einheitsvektor [x, y, z]; y ≤ 0 unter dem Horizont).
    function sonnenWinkel(t) {
        return t * Math.PI * 2 - Math.PI / 2;
    }
    function sonnenRichtung(winkel) {
        const x = Math.cos(winkel);
        const y = Math.sin(winkel);
        const z = Math.sin(winkel * 0.5) * 0.4;
        const l = Math.hypot(x, y, z) || 1;
        return [x / l, y / l, z / l];
    }

    // DIE EINE TAG-ACHSE (S7, W7): jede Größe des Lichts über den Tag ist EINE Funktion der Sonnenhöhe e = sin(Höhe) — die Kanäle
    // grenze (die Grenzgröße der Sterne), daemmerung (1 im hellen Tag … 0 in astronomischer Nacht), tag (das Nacht-Auge der
    // Post-Kette), nacht (die Ersatz-Lichter der Nacht: 0 ab ~14,5°, 1 am Horizont) und hell (die Leuchtdichte des Tageshimmels
    // relativ zum Mittag). Die Geschichte der Kanäle steht am Leser der Welt (`_tagAchse`).
    function tagAchse(e) {
        const A = GRENZGROESSE;
        const s = Math.max(-1, Math.min(1, e));
        const h = (Math.asin(s) * 180) / Math.PI;
        let grenze = A[A.length - 1][1];
        if (h >= A[0][0]) grenze = A[0][1];
        else
            for (let i = 1; i < A.length; i++)
                if (h >= A[i][0]) {
                    const t = (h - A[i - 1][0]) / (A[i][0] - A[i - 1][0]);
                    grenze = A[i - 1][1] + (A[i][1] - A[i - 1][1]) * t;
                    break;
                }
        const mTag = A[0][1],
            mNacht = A[A.length - 1][1];
        const q = Math.max(0, Math.min(1, (s + 0.18) / 0.6));
        const nachtE = 0.25; // die Sonnenhöhe (sin), unter der die Ersatz-Lichter der Nacht beginnen
        const hN = (Math.asin(nachtE) * 180) / Math.PI;
        const nG = BELICHTUNG.nachtGrad;
        return {
            e,
            grenze,
            daemmerung: (mNacht - grenze) / (mNacht - mTag),
            tag: Math.max(0, Math.min(1, (h - nG) / (hN - nG))),
            nacht: 1 - Math.max(0, Math.min(1, s / nachtE)),
            hell: 0.045 + 0.955 * q * q * (3 - 2 * q),
        };
    }

    // Halb-Float (IEEE 754 binary16, die Lesung eines HalfFloat-Ziels) → Zahl
    function halbZuFloat(h) {
        const s = h & 0x8000 ? -1 : 1;
        const e = (h & 0x7c00) >> 10;
        const f = h & 0x03ff;
        if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
        if (e === 31) return f ? NaN : s * Infinity;
        return s * Math.pow(2, e - 15) * (1 + f / 1024);
    }

    // DIE BESTRAHLUNGS-TAFEL AUS IHRER LESUNG (`readRenderTargetPixelsAsync` der Zeile W × 1, Halb- oder Voll-Float rgba): je
    // Sonnenhöhe die Bestrahlung einer waagrechten Fläche durch den Himmel je Einheit E0 (rgb), der letzte Texel das Sternen-Licht
    // je Einheit `nachtE` → Float32Array W × 3. Ihr ANKER (`tafelAnker`): die Luma des Himmels unter der Zenit-Sonne (Texel W − 2).
    function tafelAusPixeln(px, W) {
        const halb = px instanceof Uint16Array;
        const w = new Float32Array(W * 3);
        for (let i = 0; i < W; i++)
            for (let c = 0; c < 3; c++) w[i * 3 + c] = halb ? halbZuFloat(px[i * 4 + c]) : px[i * 4 + c];
        return w;
    }
    function tafelAnker(w, W) {
        return 0.2126 * w[(W - 2) * 3] + 0.7152 * w[(W - 2) * 3 + 1] + 0.0722 * w[(W - 2) * 3 + 2];
    }

    // DER HIMMEL ÜBER DEM ORT, SYNCHRON (S7; rgb, E einer waagrechten Fläche): die Bestrahlungs-Tafel `T` ({W, werte}) an der Sonne
    // und am Mond der Uniforms `U` der Tafeln, das Sternen-Licht — in derselben Zusammensetzung wie die Farbe des Himmels
    // (`himmelFarbe`: E0 × Tönung, der Mond in `mondE`, die Sterne in `nachtE`) → `out`.
    function bestrahlung(T, U, out) {
        const W = T.W,
            w = T.werte;
        const lies = (mu, c) => {
            const x = ((Math.sign(mu) * Math.sqrt(Math.min(1, Math.abs(mu))) + 1) / 2) * (W - 2);
            const i = Math.max(0, Math.min(W - 3, Math.floor(x)));
            const f = Math.max(0, Math.min(1, x - i));
            return w[i * 3 + c] * (1 - f) + w[(i + 1) * 3 + c] * f;
        };
        const ms = U.sonne.value.y,
            mm = U.mond.value.y;
        const m = U.mondE.value,
            n = U.nachtE.value,
            t = U.toenung.value;
        for (let c = 0; c < 3; c++) {
            const k = c === 0 ? "x" : c === 1 ? "y" : "z";
            out[c] = U.licht.value * t[k] * (lies(ms, c) + m[k] * lies(mm, c) + n[k] * w[(W - 1) * 3 + c]);
        }
        return out;
    }

    // DIE UMGEBUNG DER STOFFE (material.K4) — EIN Gesetz der Welt und der Bühne: der Himmel, den jeder Standard- und Physical-Stoff
    // spiegelt und aus dem er Licht empfängt, ist die PMREM-Lage der Equirekt-Tafel (`rtEq`, der Himmel JE EINHEIT DES LICHTS)
    // × das Licht jetzt (`umgebungLicht`: E0 · Tönung aus den Uniforms `U` der Tafeln, je Bild gelesen, nie eingebacken).
    // `umgebungZeichnen` filtert die Tafel (PMREM per `fromEquirectangular`, WebGPU-tauglich, in das BESTEHENDE Ziel `ziel`:
    // stabile Textur-Identität über jede Neuzeichnung), `himmelDerStoffe` ist der Knoten jedes Lesers — `richtung`/`stufe` fest
    // für eine Sonde (der Boden der Atmosphäre im Rückstrahl), sonst reicht r184 sie je Stoff (Spiegelung: die Rauheit als Stufe,
    // Bestrahlung: Stufe 1). Die Welt legt darüber ihren Spiegel-Pass und den Rückstrahl des gezeichneten Bodens
    // (`_spiegelUmgebung`, stamm/bild-sicht.js), die Bühne trägt ihn bloß (kein Feld; ihr Boden ist der Boden der Atmosphäre).
    // Bis w12-studio-buehne schrieben Welt und Bühne diesen Knoten je eigen (`_umgebungLicht` im Stamm, `buehne` hier).
    function umgebungLicht(U) {
        return U.toenung.mul(U.licht);
    }
    function umgebungZeichnen(gen, A, ziel) {
        return gen.fromEquirectangular(A.rtEq.texture, ziel || null);
    }
    function himmelDerStoffe(quelle, U, richtung, stufe) {
        return globalThis.THREE.TSL.pmremTexture(quelle, richtung, stufe).mul(umgebungLicht(U));
    }

    // DIE BÜHNE DER WELT (studios.K4, w12-studio-buehne — Studio = Modus der Welt-Engine): ein Studio zeichnet sein Werk im Licht
    // der Welt. Dieselbe Luft (der Kern: `ATMO_GESETZ`, klares Medium über dem Boden `ATMO_BODEN`), dieselben Tafeln
    // (`atmoTafeln`), dieselbe Sonne (E0 · Durchlass, `ATMO_RECHNUNG.sonne`), dieselbe Umgebung (`umgebungZeichnen` und
    // `himmelDerStoffe` — die Knoten, die `_spiegelUmgebung` der Welt jedem Stoff reicht; den Spiegel des Schirms trägt die Bühne
    // nicht, sie hat kein Feld), derselbe Himmel als Grund (die Equirekt-Tafel), dieselbe Belichtung (Anker und Stufen
    // der Kamera aus der Bestrahlungs-Tafel, `belichtung`) und dieselbe Tonkurve (`BELICHTUNG.kurve`). Die Bühne steht im TAG der
    // Welt (`o.uhr`, Vorgabe Mittag — das Wort jeder Sonde: Mittag · Sonne · Sommer): wo die Tag-Achse Ersatz-Lichter der Nacht
    // (Hemi, Ambient, Sterne) trüge, bricht sie laut, sie trägt die Nacht nicht. Das Auge steht am Bezug der Luft (1 m, die Höhe
    // des Ankers). Gezeichnet werden die Tafeln einmal beim Ruf (der Renderer steht: nach `init()`); die Belichtung liegt, sobald
    // die Bestrahlungs-Tafel zurückkam (`steht`, ein Versprechen) — bis dahin zeichnet die Bühne kein Bild (`belichtung` null).
    // → { sonne (DirectionalLight, Richtung `richtung`), staerke, tafeln, umgebung (das PMREM-Ziel), knoten, achse, steht, belichtung }.
    function buehne(o) {
        const THREE = globalThis.THREE;
        const T = THREE && THREE.TSL;
        const R = o && o.renderer;
        const szene = o && o.szene;
        if (!T || !R || R.isWebGPURenderer !== true || !szene)
            throw new Error("DIE BÜHNE DER WELT: sie zeichnet auf der Engine der Welt (three r184 WebGPURenderer) in eine Szene");
        const uhr = o.uhr == null ? 0.5 : o.uhr;
        const G = KERN.ATMO_GESETZ;
        const AR = KERN.ATMO_RECHNUNG;
        const M = AR.medium(G, AR.betaKlar(G), ATMO_BODEN);
        const winkel = sonnenWinkel(uhr);
        const s = sonnenRichtung(winkel);
        const m = sonnenRichtung(winkel + Math.PI);
        const achse = tagAchse(s[1]);
        if (!(achse.nacht === 0 && achse.daemmerung === 1))
            throw new Error(
                `DIE BÜHNE DER WELT steht im Tag: die Uhr ${uhr} trägt die Ersatz-Lichter der Nacht (nacht ${achse.nacht.toFixed(3)}, ` +
                    `Dämmerung ${achse.daemmerung.toFixed(3)}) — die Nacht zeichnet nur die Welt`
            );
        const hKm = 0.001;
        const A = atmoTafeln({ G, M });
        const U = A.U;
        U.hKm.value = hKm;
        U.sonne.value.set(s[0], s[1], s[2]);
        U.mond.value.set(m[0], m[1], m[2]);
        const E0 = e0(1);
        U.licht.value = E0;
        const mi = MOONLIGHT.intensity / Math.max(E0, 1e-6);
        U.mondE.value.set(MOONLIGHT.r * mi, MOONLIGHT.g * mi, MOONLIGHT.b * mi);
        const N = G.nacht.himmel;
        const sw = Math.max(0, Math.min(1, 1 - achse.daemmerung));
        U.nachtE.value.set(N[0] * sw, N[1] * sw, N[2] * sw).divideScalar(Math.max(E0, 1e-6));
        // die Tafeln in ihre Ziele: Durchlass und Ψ_ms (das Medium), die Himmels-Sicht (die Sonne), die Umgebung, die Bestrahlung
        const vor = R.getRenderTarget();
        for (const [q, rt] of [
            [A.qT, A.rtT],
            [A.qMS, A.rtMS],
            [A.qSV, A.rtSV],
            [A.qEq, A.rtEq],
            [A.qBS, A.rtBS],
        ]) {
            R.setRenderTarget(rt);
            R.render(q, q.userData.kamera);
        }
        R.setRenderTarget(vor);
        A.mediumBeta = AR.betaKlar(G);
        A.tafelnFrisch = true;
        const umgebung = umgebungZeichnen(new THREE.PMREMGenerator(R), A);
        szene.environment = umgebung.texture;
        const knoten = (szene.environmentNode = himmelDerStoffe(umgebung.texture, U));
        // der Grund ist der Himmel: die Equirekt-Tafel (je Einheit des Lichts) × E0 — als `background` (eine Textur, kein Knoten:
        // die Sonden schwärzen für ihre Masken `background`, ein `backgroundNode` hätte Vorrang und malte den Himmel in die Maske)
        szene.background = A.rtEq.texture;
        szene.backgroundIntensity = U.licht.value;
        szene.fog = null;
        // die Sonne: E0 · Durchlass am Auge, ihr Farbton der Durchlass der EINEN Luft
        const a = AR.sonne(G, M, hKm, s[1], ATMO_LUT.schritte.durchlass, [0, 0, 0]);
        const sonne = o.sonne || new THREE.DirectionalLight();
        sonne.color.setRGB(a.col.r, a.col.g, a.col.b);
        sonne.intensity = E0 * a.lum;
        R.toneMapping = THREE[BELICHTUNG.kurve];
        R.outputColorSpace = THREE.SRGBColorSpace;
        // `knoten` (die Umgebung jedes Stoffs) und `staerke` (die Sonne des Gesetzes) liest die Treue der Bühne (`buehneZeichnet`):
        // die Bühne zeichnet unter diesem Licht allein — Identität, nie ein Nachbau
        const B = {
            sonne,
            staerke: sonne.intensity,
            richtung: new THREE.Vector3(s[0], s[1], s[2]),
            tafeln: A,
            umgebung,
            knoten,
            achse,
            belichtung: null,
            imFlug: 0,
        };
        const W = A.rtBS.width;
        B.steht = R.readRenderTargetPixelsAsync(A.rtBS, 0, 0, W, 1).then((px) => {
            const werte = tafelAusPixeln(px, W);
            A.tafel = A.tafelFlug = { W, werte, medium: A.mediumBeta, stufe: Math.round(hKm * 10) };
            A.anker = tafelAnker(werte, W);
            A.belichtung = belichtungAnker(G, AR, A.anker);
            // die waagrechte Fläche des Orts: die Sonne mit dem Sinus ihrer Höhe und der Himmel der Tafel — Hemi und Ambient trägt
            // der Tag nicht (die Tag-Achse oben: nacht 0)
            const E = bestrahlung(A.tafel, U, [0, 0, 0]);
            const I = sonne.intensity * Math.max(0, s[1]);
            E[0] += sonne.color.r * I;
            E[1] += sonne.color.g * I;
            E[2] += sonne.color.b * I;
            B.belichtung = R.toneMappingExposure = belichtung(E, A.belichtung, s[1]);
            return B;
        });
        return B;
    }

    // DIE TREUE DER BÜHNE (studios.K4, w13-buehne-lack): jedes Bild der Bühne fragt vor dem Zeichnen, ob es unter dem Licht der Welt
    // ALLEIN steht — false, solange die Belichtung nicht liegt; ein Licht neben ihrer Sonne, die Sonne oder die Belichtung (samt
    // Tonkurve) neben dem Gesetz, ein Himmel neben ihrem Knoten (Stärke 1, der Himmel als Grund in E0) oder ein Stoff mit eigener
    // Umgebung (envNode/envMap) bricht LAUT beim Namen, nie still (der Sammler jeder Linse, die die Seite fährt, nennt ihn).
    // Bis w12-studio-buehne zeichnete die garage unter drei Lichtern am Blick bei Belichtung 1,04: ihr Lack „glänzte" (iso, Lack-Pixel
    // Luma 92,5, p95/p50 2,11). GEMESSEN 06.11. (swiftshader, garage iso, Lack-Pixel): im Licht der Welt 46,0 / p95/p50 1,14 — ohne
    // die Sonne 30,9 / 1,55 (der Himmels-Spiegel steht, das Licht der Sonne auf Dach und Haube deckt ihn), bei Belichtung 1,04
    // 66,5 / 1,15, ein Chrom-Wagen (Spiegel 1) 80,9: unter dem Licht der Welt erreicht KEIN Stoff am Lack-Blick den Glanz von main —
    // der war das Studio-Licht. Die Welt zeigt denselben Lack (Lack-Kugel 35°/7 m: Welt 45,3, Bühne 48,2, w12-studio-buehne).
    // DIE LEINE DER BÜHNE (wie die Welt, stamm/dirigent-takt.js `_gpuLeineFrei`): jedes gezeichnete Bild meldet die Arbeit davor an die
    // Queue; sind GPU_FRAMES_IM_FLUG Meldungen offen, zeichnet die Bühne nicht (der Aufrufer fragt im nächsten Takt wieder). Ohne sie
    // lief die Garage ihrer GPU beliebig voraus — auf dem CPU-Raster der CI (z259, Linux-swiftshader) stand ihre Schlange 25 s lang,
    // jeder Pipeline-Bau und jedes Lesen wartete dahinter, die Labor-Linse riss in G8 nach 120 s.
    function buehneZeichnet(B, szene, R) {
        if (!B || B.belichtung == null) return false;
        const q = R.backend && R.backend.device ? R.backend.device.queue : null;
        if (q && B.imFlug >= GPU_FRAMES_IM_FLUG) return false;
        const fremd = new Set();
        let sonne = false;
        szene.traverse((o) => {
            if (o === B.sonne) sonne = true;
            else if (o.isLight) fremd.add(`ein Licht ${o.type} „${o.name}"`);
            for (const m of [o.material].flat())
                if (m && (m.envNode || m.envMap)) fremd.add(`eine eigene Umgebung am Stoff „${m.name || m.type}"`);
        });
        if (!sonne || B.sonne.intensity !== B.staerke) fremd.add(`die Sonne ${B.sonne.intensity} statt ${B.staerke}`);
        if (R.toneMappingExposure !== B.belichtung || R.toneMapping !== globalThis.THREE[BELICHTUNG.kurve])
            fremd.add(`die Belichtung ${R.toneMappingExposure} statt ${B.belichtung}`);
        const U = B.tafeln.U;
        if (
            szene.environmentNode !== B.knoten ||
            szene.environmentIntensity !== 1 ||
            szene.background !== B.tafeln.rtEq.texture ||
            szene.backgroundIntensity !== U.licht.value
        )
            fremd.add("ein Himmel neben dem Knoten des Gesetzes");
        if (fremd.size)
            throw new Error(`DIE BÜHNE DER WELT zeichnet unter dem Licht der Welt allein: ${[...fremd].join(" · ")}`);
        if (q) {
            B.imFlug++;
            const los = () => B.imFlug--;
            q.onSubmittedWorkDone().then(los, los);
        }
        return true;
    }

    return Object.freeze({
        ATMO_LUT,
        ATMO_BODEN,
        KEY_BASE,
        LEGACY_LICHT,
        BELICHTUNG,
        GRENZGROESSE,
        GPU_FRAMES_IM_FLUG,
        MOONLIGHT,
        schirmDreieck,
        umgebungRichtung,
        atmoTafeln,
        belichtungStufen,
        belichtung,
        belichtungAnker,
        e0,
        sonnenWinkel,
        sonnenRichtung,
        tagAchse,
        halbZuFloat,
        tafelAusPixeln,
        tafelAnker,
        bestrahlung,
        umgebungLicht,
        umgebungZeichnen,
        himmelDerStoffe,
        buehne,
        buehneZeichnet,
    });
})();
