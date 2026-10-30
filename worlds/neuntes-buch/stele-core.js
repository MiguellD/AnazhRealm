// AnazhRealm — worlds/neuntes-buch/stele-core.js: DAS NEUNTE GESETZBUCH (Fixture, Meisterkarte studios.K5).
// Ein Gesetzbuch, das der Wirt nicht kennt: die Stele (Meilenstein · Grenzstein · Obelisk) — ein verjüngter Schaft auf
// einem Sockel, oben Kopfplatte und Kappe. Es lebt NICHT im Spiel-Manifest; die Linse `gate:nervensystem` (Teil E)
// (scripts/diag-nervensystem.cjs) reicht es als zehnte Manifest-Zeile durch den EINEN Kern-Weg (Foundry-Faden →
// Buch → Ingest) und misst, dass es ohne eine Zeile im Wirt in der Welt steht: Werkstatt, LOD-Kette, Kosten-Leiste,
// Speicher-Rundlauf. Die Andock-Sequenz (docs/studio-vertrag.md §5) ist hier vollständig — B1 PRESETS · B2 buildInstance
// + kindStages + Budget (B2c, fernform "gesetz") · B4 PARAMS_BY_KIND · B5 LEHREN + messen · B7 KIND_POLICY (die
// Wirts-Zeile der Art: Bauplan-Namensraum und Substanz) · STUDIO_VERTRAG.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __steleCore — keine Top-Level-Globals.
// DETERMINISMUS (G2.3): der Bau ist eine reine Funktion der Regler; der Same reist mit und ist RESERVIERT (seed-invariant,
// je Rezept EINE Gestalt). THREE ist zur Laufzeit global (Worker: r128 aus der Kern-lib); der Manifest-Teil läuft THREE-frei.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1;

    // ── B2/B2c: die Stufen-Wahrheit und das Budget je Stufe. Die Topologie ist fest (jede Stufe trägt an jedem Regler-Rand
    //    dieselbe Zahl Dreiecke, nur die Kappe wechselt sie um ≤ 6): L0 = Schaft mit gefasten Kanten in neun Ringen samt
    //    Schriftband, Sockel, Kopfplatte, Kappe (≤ 150); L1 = vierkantiger Schaft in drei Ringen (≤ 34, ≤ 0,5 · L0); L2 = ein
    //    Kegelstumpf mit Kappe (≤ 16, ≤ 0,15 · L0). Jenseits der Nah-Grenze trägt der Box-Satz im Welt-March (fernform
    //    "gesetz"). Die Grenzen `ab` (m × Welt-Skala) und die Hysterese stehen im Buch, nie im Wirt.
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { stele: [0, 1, 2] },
            budget: {
                stele: {
                    0: { tris: 200, draws: 1, schatten: 0 },
                    1: { tris: 60, draws: 1, schatten: 1, ab: 14 },
                    2: { tris: 24, draws: 1, schatten: 2, ab: 32 },
                    fernform: "gesetz",
                    hyst: 0.1,
                },
                gestalten: {},
            },
        },
    };

    // ── B1: die Rezepte (s = der P-Punkt; die Gestalt ist eine Funktion von s allein); B3: die Stele steht am Weg (site, streut
    //    nicht — der Spieler setzt sie) ──
    var PRESETS = {
        meilenstein: {
            kind: "stele",
            lab: "Meilenstein",
            s: { hoehe: 1.3, breite: 0.45, tiefe: 0.28, verjuengung: 0.12, kappe: 1, sockel: 0.12, fase: 0.03 },
            fx: { place: { mode: "site", siteTag: "weg" } },
        },
        grenzstein: {
            kind: "stele",
            lab: "Grenzstein",
            s: { hoehe: 0.8, breite: 0.36, tiefe: 0.22, verjuengung: 0.05, kappe: 0, sockel: 0, fase: 0.02 },
            fx: { place: { mode: "site", siteTag: "weg" } },
        },
        obelisk: {
            kind: "stele",
            lab: "Obelisk",
            s: { hoehe: 4.8, breite: 0.7, tiefe: 0.7, verjuengung: 0.42, kappe: 2, sockel: 0.08, fase: 0.015 },
            fx: { place: { mode: "site", siteTag: "weg" } },
        },
    };
    for (var _gid in PRESETS) PORTAL_RENDER_CONFIG.lod.budget.gestalten[_gid] = 1;

    // ── B4: die Regler (DIE EINE FORM, v1.2) ──
    var PARAMS = [
        {
            id: "hoehe",
            lab: "Höhe",
            min: 0.5,
            max: 6,
            step: 0.05,
            def: 1.3,
            grp: "Schaft",
            law: "Höhe des Schafts über dem Sockel (m)",
        },
        {
            id: "breite",
            lab: "Breite",
            min: 0.2,
            max: 1.4,
            step: 0.01,
            def: 0.45,
            grp: "Schaft",
            law: "Fußbreite des Schafts (m)",
        },
        {
            id: "tiefe",
            lab: "Tiefe",
            min: 0.15,
            max: 1.2,
            step: 0.01,
            def: 0.28,
            grp: "Schaft",
            law: "Fußtiefe des Schafts (m)",
        },
        {
            id: "verjuengung",
            lab: "Verjüngung",
            min: 0,
            max: 0.6,
            step: 0.01,
            def: 0.12,
            grp: "Schaft",
            law: "Kopfbreite = Fußbreite × (1 − v)",
        },
        {
            id: "fase",
            lab: "Fase",
            min: 0.005,
            max: 0.06,
            step: 0.005,
            def: 0.03,
            grp: "Schaft",
            law: "Kantenfase der Nahstufe (m)",
        },
        {
            id: "sockel",
            lab: "Sockel",
            min: 0,
            max: 0.4,
            step: 0.01,
            def: 0.12,
            grp: "Fuß",
            law: "Sockelhöhe als Anteil der Schafthöhe",
        },
        {
            id: "kappe",
            lab: "Kappe",
            min: 0,
            max: 2,
            step: 1,
            def: 1,
            grp: "Kopf",
            law: "0 flach · 1 Giebel · 2 Pyramidion",
        },
    ];

    // ── B5: die Lehre (der sichtbare Richter) — die Schlankheit Höhe : Fußbreite im Kanon der Steinsetzer ──
    var LEHREN = [
        {
            id: "schlankheit",
            lab: "Schlankheit H/B",
            pass: [1.5, 10],
            warn: [1, 14],
            hint: "Grenzstein ≈ 2 · Obelisk ≈ 7",
        },
    ];
    function messen(P) {
        var p = Object.assign({}, PRESETS.meilenstein.s, P || {});
        return { schlankheit: p.hoehe / Math.max(1e-6, p.breite) };
    }

    // ── B7: die Wirts-Zeile der Art (docs/studio-vertrag.md B7) — der Bauplan-Namensraum und die unsichtbare Substanz,
    //    die der Wirt dem Bauplan gibt (Stein, Sockel + Schaft); die Gestalt kommt aus buildInstance. ──
    var KIND_POLICY = {
        stele: {
            prefix: "stele_",
            substanz: {
                label: "Stele",
                parts: [
                    {
                        shape: "box",
                        material: "stein",
                        position: { x: 0, y: 0.08, z: 0 },
                        size: { x: 0.7, y: 0.16, z: 0.7 },
                        opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                    },
                    {
                        shape: "box",
                        material: "stein",
                        position: { x: 0, y: 0.81, z: 0 },
                        size: { x: 0.45, y: 1.3, z: 0.28 },
                        opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                    },
                ],
            },
        },
    };

    // ── Der Stoff: EIN Stein (Paletten-Hex = sRGB-Absicht, das FARB-GESETZ rechnet ins Lineare), Seh-Klasse "stoff" ──
    var STEIN_HEX = 0x8f8a80;
    function lin(c) {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    var _stein = null;
    function stein() {
        if (_stein) return _stein;
        _stein = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0 });
        _stein.color.setRGB(
            lin(((STEIN_HEX >> 16) & 255) / 255),
            lin(((STEIN_HEX >> 8) & 255) / 255),
            lin((STEIN_HEX & 255) / 255)
        );
        _stein.userData.__seh = "stoff";
        return _stein;
    }

    // ── Der Bau: flache Facetten (je Fläche eigene Ecken, die Normale der Fläche) ──
    function Netz() {
        this.p = [];
        this.n = [];
        this.i = [];
    }
    Netz.prototype.flaeche = function (ecken) {
        // ein ebenes konvexes Vieleck (gegen den Uhrzeigersinn von außen gesehen) als Fächer
        var a = ecken[0],
            b = ecken[1],
            c = ecken[2];
        var ux = b[0] - a[0],
            uy = b[1] - a[1],
            uz = b[2] - a[2];
        var vx = c[0] - a[0],
            vy = c[1] - a[1],
            vz = c[2] - a[2];
        var nx = uy * vz - uz * vy,
            ny = uz * vx - ux * vz,
            nz = ux * vy - uy * vx;
        var l = Math.hypot(nx, ny, nz) || 1;
        var o = this.p.length / 3;
        for (var k = 0; k < ecken.length; k++) {
            this.p.push(ecken[k][0], ecken[k][1], ecken[k][2]);
            this.n.push(nx / l, ny / l, nz / l);
        }
        for (var t = 1; t + 1 < ecken.length; t++) this.i.push(o, o + t, o + t + 1);
    };
    // zwei Ringe (gleiche Eckzahl, gegen den Uhrzeigersinn von oben) als Mantel
    Netz.prototype.mantel = function (unten, oben) {
        for (var k = 0; k < unten.length; k++) {
            var j = (k + 1) % unten.length;
            this.flaeche([unten[k], unten[j], oben[j], oben[k]]);
        }
    };
    Netz.prototype.mesh = function () {
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3));
        g.setAttribute("normal", new THREE.Float32BufferAttribute(this.n, 3));
        g.setIndex(this.i);
        var m = new THREE.Mesh(g, stein());
        m.castShadow = true;
        m.receiveShadow = true;
        return m;
    };

    // der Querschnitt in Höhe y: ein Rechteck b × t, an den vier Kanten um f gefast (f = 0: vier Ecken)
    function ring(b, t, f, y) {
        var x = b / 2,
            z = t / 2;
        if (!(f > 0))
            return [
                [x, y, z],
                [x, y, -z],
                [-x, y, -z],
                [-x, y, z],
            ];
        f = Math.min(f, x * 0.45, z * 0.45);
        return [
            [x, y, z - f],
            [x, y, -z + f],
            [x - f, y, -z],
            [-x + f, y, -z],
            [-x, y, -z + f],
            [-x, y, z - f],
            [-x + f, y, z],
            [x - f, y, z],
        ];
    }
    function deckel(netz, r, oben) {
        netz.flaeche(oben ? r.slice() : r.slice().reverse());
    }
    function kasten(netz, b, h, t, y0) {
        var u = ring(b, t, 0, y0),
            o = ring(b, t, 0, y0 + h);
        netz.mantel(u, o);
        deckel(netz, o, true);
    }
    function kappe(netz, art, b, t, y) {
        var x = b / 2,
            z = t / 2;
        if (art === 1) {
            // der Giebel: First längs der Tiefe, Höhe 0,35 × Breite
            var h = 0.35 * b;
            netz.flaeche([
                [x, y, z],
                [x, y, -z],
                [0, y + h, -z],
                [0, y + h, z],
            ]);
            netz.flaeche([
                [-x, y, -z],
                [-x, y, z],
                [0, y + h, z],
                [0, y + h, -z],
            ]);
            netz.flaeche([
                [-x, y, z],
                [x, y, z],
                [0, y + h, z],
            ]);
            netz.flaeche([
                [x, y, -z],
                [-x, y, -z],
                [0, y + h, -z],
            ]);
        } else if (art === 2) {
            // das Pyramidion: Höhe 0,5 × Breite
            var s = [0, y + 0.5 * b, 0];
            netz.flaeche([[x, y, z], [x, y, -z], s]);
            netz.flaeche([[x, y, -z], [-x, y, -z], s]);
            netz.flaeche([[-x, y, -z], [-x, y, z], s]);
            netz.flaeche([[-x, y, z], [x, y, z], s]);
        }
    }

    function bauStufe(p, stufe) {
        var netz = new Netz();
        var H = p.hoehe,
            B = p.breite,
            T = p.tiefe;
        var k = 1 - p.verjuengung;
        var sh = stufe < 2 ? p.sockel * H : 0;
        var art = Math.round(p.kappe);
        // die Entasis: der Schaft schwillt in der Mitte um 1,5 % (die Kante liest gerade, das Auge nicht)
        var breiteBei = function (u, w) {
            return w * (1 - (1 - k) * u) * (1 + 0.015 * Math.sin(Math.PI * u));
        };
        if (sh > 0) kasten(netz, B * 1.3, sh, T * 1.3, 0);
        // die Kopfplatte trägt 4 cm: L1 und L2 enden an ihrer Oberkante (derselbe Umriss über die Stufen)
        var kopf = sh + H + 0.04;
        var ringe = [];
        if (stufe === 0) {
            // neun Ringe, das Schriftband (0,60–0,70) um 1,2 cm eingezogen
            var us = [0, 0.25, 0.5, 0.6, 0.6, 0.7, 0.7, 0.85, 1];
            var ein = [0, 0, 0, 0, 1, 1, 0, 0, 0];
            for (var a = 0; a < us.length; a++) {
                var d = ein[a] ? 0.024 : 0;
                ringe.push(ring(breiteBei(us[a], B) - d, breiteBei(us[a], T) - d, p.fase, sh + us[a] * H));
            }
        } else if (stufe === 1) {
            var u1 = [0, 0.5, 1];
            for (var c = 0; c < u1.length; c++)
                ringe.push(ring(breiteBei(u1[c], B), breiteBei(u1[c], T), 0, c === 2 ? kopf : sh + u1[c] * H));
        } else {
            // L2: EIN Kegelstumpf vom Boden bis zur Kopfplatte (der Sockel geht in ihm auf)
            var bf = sh > 0 ? 1.15 : 1;
            ringe.push(ring(B * bf, T * bf, 0, 0), ring(breiteBei(1, B), breiteBei(1, T), 0, kopf));
        }
        for (var r = 0; r + 1 < ringe.length; r++) netz.mantel(ringe[r], ringe[r + 1]);
        var bk = breiteBei(1, B),
            tk = breiteBei(1, T);
        if (stufe === 0) {
            // die Kopfplatte: 4 cm, um 2 cm je Seite breiter als der Schaft
            deckel(netz, ringe[ringe.length - 1], true);
            kasten(netz, bk + 0.04, 0.04, tk + 0.04, sh + H);
            if (art) kappe(netz, art, bk + 0.04, tk + 0.04, kopf);
        } else if (art) kappe(netz, art, bk, tk, kopf);
        else deckel(netz, ringe[ringe.length - 1], true);
        return netz.mesh();
    }

    // B2 — die EINE Bau-Funktion: buildInstance(rezeptId, seed, lod, ov) → THREE.Group (Vorlagen-Raum, Meter, Fuß auf y = 0)
    function buildInstance(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        var p = Object.assign({}, pre.s);
        if (ov && typeof ov === "object")
            for (var key in ov) {
                if (!Object.prototype.hasOwnProperty.call(ov, key) || key.indexOf("__") === 0) continue;
                if (typeof ov[key] === "number" && isFinite(ov[key])) p[key] = ov[key];
            }
        var st = PORTAL_RENDER_CONFIG.lod.kindStages.stele;
        var stufe = st.indexOf(lod | 0) >= 0 ? lod | 0 : 0;
        var g = new THREE.Group();
        g.add(bauStufe(p, stufe));
        g.userData = { kind: "stele", rezeptId: rezeptId, seed: seed, lod: stufe };
        g.updateMatrixWorld(true);
        return g;
    }

    root.__steleCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { stele: PARAMS },
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        LEHREN: LEHREN,
        messen: messen,
        KIND_POLICY: KIND_POLICY,
        // B8 — der Stammbaum: das Buch nennt sich und seine Art selbst; der Wirt hängt es in den EINEN Baum, ohne eine Zeile zu lernen
        STAMMBAUM: { studio: "Neuntes Buch", arten: { stele: "Stelen" } },
        buildInstance: buildInstance,
    };
})(typeof self !== "undefined" ? self : globalThis);
