// AnazhRealm — schmiede-core.js: DER KLINGEN-STUDIO-KERN (Katalysator-Bogen W-A4a, ε-Checkliste).
// Die generative Substanz des Schmiede-Labors (worlds/schmiede/index.html — ANATOMIE ·
// KLINGE: Rückgrat · Schnitt · Lehren · Stahl): das Schnitt-Gesetz (sectionAt → Loft-Mesh
// UND Massenintegral, EINE Quelle) · die Ausstattung (Knauf/Parier/Griff je Tradition) ·
// die Schlagköpfe (Axt/Hammer/Kolben/Keule/Pick/Grabeblatt) · der Bogen (Balkentheorie) ·
// das Rückgrat (stations) · die LEHREN (Metrologie: Balance/Trägheit/Stoßzentrum/…, Bänder
// je Absicht) · die GATTUNGEN + TRADITIONEN + Aufgaben-Gesetze (ableitenKeil/Klinge/Bogen/
// Pick/Graben — Form EMERGIERT aus der Aufgabe). Byte-treu aus dem Schöpfer-Werk extrahiert
// (Zeilen-Slices, Paritäts-Hash-bewiesen) — die Shell UND AnazhRealm lesen DIESE eine
// Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __schmiedeCore — jeder WEITERE Kern einer
// Laufzeit trägt keine Top-Level-Globals (const-Kollision mit foundry-core im selben
// Worker). Die Manifest-Blöcke (B1 PRESETS · B2 buildInstance+kindStages · B4 PARAMS ·
// B5 LEHREN+messen · STUDIO_VERTRAG) leben unter dem Namensraum, namens- und formgleich
// zu §3; der Validator (gate:studio-vertrag) mappt per Manifest-ns — die porta-core-Form.
//
// DETERMINISMUS (G2.3): der Bau ist eine reine Funktion der Parameter — das Schmiede-Lab
// trägt KEINEN stochastischen Term im Waffen-Bau (Math.random lebt nur in der Shell-Deko:
// Übungshof-Steine/Grasbüschel). Das seed-Argument reist mit (Vertrags-Signatur) und ist
// RESERVIERT wie beim Fahrzeug-/Tor-Kern: buildInstance(id, 7, …) == buildInstance(id,
// 12345, …) byte-gleich — eingefroren in spec/asset-contract/v5 (cv:5). Eine künftige
// Seed-Variation ist ein bewusster Golden-Re-Mint, kein Drift. Die TRADITION ist im
// Wirts-Kanal LAB-FEST Frank (der Lab-Startzustand; die Shell spiegelt ihre Auswahl via
// setTradition) — eine Traditions-Variation im Wirts-Kanal ist ein benannter Folge-Kanal.
//
// SCHNITT-GRENZE (bewusst): der Kern trägt die WAFFEN-Substanz + die Gesetze. Die
// Overlay-/Didaktik-Ebenen (Rückgrat-Zeichnung · Schnitt-Karte · Maßlinien/Labels [DOM-
// Canvas!] · Masse-Streifen · Harmonik · Prüfstand/Arena) bleiben in der Lab-Shell —
// sie sind Lehr-Visualisierung, keine Mesh-Substanz; sie LESEN dieselben Kern-Gesetze
// (measure/stations/sectionAt) über __schmiedeCore.
//
// B5-STAND: das Lab urteilt seine Lehren GEGEN DIE ABSICHT (BANDS je hieb/stich/schlag/
// spalten/nutz) — der Vertrags-Block LEHREN friert je Lehre das hieb-Band als pass ein
// (die Referenz-Absicht des Lab-Startzustands); die volle Absichts-Matrix reist als
// BANDS-Daten + evalLehren/messen (M3: der Export der SELBEN Formeln, die das Lab zeigt).
//
// THREE ist zur Laufzeit global (Browser: CDN r128 VOR diesem Skript; Worker:
// worlds/terrain/lib/three-r128.min.js via importScripts; Node-Gate: global.THREE vor
// require). Der Manifest-Teil (Daten + Funktions-Definitionen) läuft THREE-frei
// (Validator-vm mit Stub) — kein THREE-Aufruf auf Top-Level (Materialien lazy).
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik (v1.1 ist Adressierungs-Norm, kein Block-Bruch)

    // ── B2-Daten: die Stufen-Wahrheit der Domäne (kindStages-Vertrag) ──
    // Waffen/Werkzeuge tragen NUR Stufe 0 (fein); L1=L0-Grade + L2-Auto-Impostor sind
    // Sache des Wirts (docs/studio-vertrag.md B2 / N7.5-Merge am EINEN Ingest).
    var PORTAL_RENDER_CONFIG = {
        lod: { kindStages: { weapon: [0] } },
    };

    // ── Materialien (geteilt, nie disposen; byte-treu Lab Z.182–200) — LAZY (der
    //    Validator-vm lädt ohne THREE; erst der erste Bau ruft sie — vehicle-core-Muster).
    //    Vorbedingung der Bau-Fläche: materials() ist gerufen, BEVOR ein Builder läuft
    //    (buildInstance/buildWeaponModel rufen sie selbst; die Shell ruft sie beim Start). ──
    var M = null;
    function materials() {
        if (M) return M;
        M = {
            steel: new THREE.MeshPhysicalMaterial({
                color: 0xd8dde2,
                metalness: 1.0,
                roughness: 0.17,
                clearcoat: 0.35,
                clearcoatRoughness: 0.18,
                envMapIntensity: 2.6,
            }),
            steelRaw: new THREE.MeshStandardMaterial({
                color: 0x9aa0a6,
                roughness: 0.5,
                metalness: 0.85,
                envMapIntensity: 1.3,
            }),
            brass: new THREE.MeshStandardMaterial({
                color: 0xb89255,
                roughness: 0.32,
                metalness: 1.0,
                envMapIntensity: 2.0,
            }),
            iron: new THREE.MeshStandardMaterial({
                color: 0x3c3e44,
                roughness: 0.46,
                metalness: 0.9,
                envMapIntensity: 1.4,
            }),
            blacksteel: new THREE.MeshStandardMaterial({
                color: 0x23262b,
                roughness: 0.4,
                metalness: 0.92,
                envMapIntensity: 1.5,
            }),
            bronze: new THREE.MeshStandardMaterial({
                color: 0x9a6b3a,
                roughness: 0.4,
                metalness: 1.0,
                envMapIntensity: 1.6,
            }),
            leather: new THREE.MeshStandardMaterial({
                color: 0x4a2f1d,
                roughness: 0.82,
                metalness: 0.04,
                envMapIntensity: 0.5,
            }),
            cord: new THREE.MeshStandardMaterial({
                color: 0x2a2620,
                roughness: 0.78,
                metalness: 0.05,
                envMapIntensity: 0.4,
            }),
            wood: new THREE.MeshStandardMaterial({
                color: 0x6b4a2a,
                roughness: 0.66,
                metalness: 0.05,
                envMapIntensity: 0.6,
            }),
            // Overlays (basisfarbig → tragen auch ungelitt, glühen im Bloom)
            bone: new THREE.MeshBasicMaterial({ color: 0xcdb38a }),
            hand: new THREE.MeshBasicMaterial({ color: 0x66a8ff }),
            bal: new THREE.MeshBasicMaterial({ color: 0x7fc98a }),
            node: new THREE.MeshBasicMaterial({ color: 0xff9a3c }),
            mass: new THREE.MeshBasicMaterial({ color: 0x8a93a0, transparent: true, opacity: 0.85 }),
            cardFill: new THREE.MeshStandardMaterial({
                color: 0xcdb38a,
                roughness: 0.6,
                metalness: 0.2,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
            }),
            cardEdge: new THREE.MeshBasicMaterial({ color: 0xe7c887 }),
        };
        return M;
    }

    // ── Geometrie-Helfer (byte-treu Z.204–206) ──
    function box(w, h, d, m) {
        const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        e.castShadow = e.receiveShadow = true;
        return e;
    }
    function cyl(rt, rb, h, m, seg) {
        const e = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 28), m);
        e.castShadow = e.receiveShadow = true;
        return e;
    }
    function B(cx, cy, cz, hw, hh, hd, m) {
        const e = box(hw * 2, hh * 2, hd * 2, m);
        e.position.set(cx, cy, cz);
        return e;
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS GESETZ · DER QUERSCHNITT
    //   sectionAt(t,P) → Polygon (W,Tk) in Metern, an Klingen-Anteil t∈[0,1].
    //   W = Breite über Schneide↔Rücken · Tk = halbe Dicke (Profil um Mittelebene).
    //   DIESELBE Funktion speist Loft-Mesh UND Massen-/Steifigkeitsintegral.
    // ════════════════════════════════════════════════════════════════════
    function halfH(fam, W, hw, ht, flat) {
        const e = Math.min(1, Math.abs(W) / hw);
        if (fam === "linse") return ht * (1 - e * e); // lentikular — breite Schnitthaut, „niku"
        if (fam === "raute") return ht * (1 - e); // Raute/Diamant — steifer Grat (Stich)
        if (fam === "sechs") return e <= flat ? ht : ht * (1 - (e - flat) / (1 - flat)); // Sechskant — Flach + Fase (vielseitig)
        return ht * (1 - Math.pow(e, 8)); // 'flach' — Barren, scharf abfallende Kante (Basis für tiefe Hohlkehle)
    }
    function sectionAt(t, P) {
        const w = P.w0 * (1 - (1 - P.wTip) * t),
            th = P.th0 * (1 - (1 - P.thTip) * t),
            hw = w / 2,
            ht = th / 2;
        const n = 46,
            top = [],
            bot = [];
        for (let i = 0; i <= n; i++) {
            let W, H;
            if (P.single) {
                // einschneidig: Schneide bei W=-hw, Rücken (voll) bei +hw
                const u = i / n;
                W = -hw + u * w;
                const eFromEdge = (W + hw) / w;
                H = ht * 2 * Math.pow(eFromEdge, 0.7);
                if (eFromEdge > 0.86) H = Math.max(H, ht * 1.0);
                H = Math.min(H, th);
            } else {
                W = -hw + (i / n) * w;
                H = halfH(P.fam, W, hw, ht, P.flat || 0.45);
            }
            // Hohlkehle (Fuller): Rinne im zentralen Breitenband, beidseitig → I-Träger (Flansche = Kanten, Steg = Mitte)
            if (P.fuller > 0 && P.fam !== "raute" && Math.abs(W) < P.fullerW * hw) {
                H -= P.fuller * ht * (1 - Math.pow(W / (P.fullerW * hw), 2));
            }
            H = Math.max(H, 0.0004);
            top.push([W, H]);
            bot.push([W, -H]);
        }
        return top.concat(bot.reverse());
    }
    // ── ULTRAGUSS U6d — DAS WIRTS-SCHNITT-GESETZ (bladeProfile): die EINE Formel-Quelle
    //    des Stamm-Loft-Meshes. anazhRealm `_makePartGeometry` case "bladeProfile" (die
    //    Werkstatt-/DSL-öffentliche Klinge, Oakeshott-Grammatik) liest DIESE Funktion
    //    fail-closed — verbatim aus dem Stamm gewandert, Werte NUMERISCH IDENTISCH
    //    (Gitter-Beweis U6d, 0 Abweichungen: persistierte Spieler-Baupläne + die
    //    eingefrorene KIND_SUBSTANCE-Klinge tragen dieselben Bytes). Neben sectionAt
    //    (der Lab-Metrologie, 4 Familien) ist dies das BEWUSST eigene fünfte Profil
    //    derselben Familie — beide wohnen im Gesetzbuch, kein Parallelpfad im Stamm.
    //    klingenProfil(spec, t, w) → { w, h }:
    //      spec = { baseHalfW, maxThick, tipWidth?, fuller? } (Meter; tipWidth/fuller
    //      roh — die Klemmen wohnen HIER, dieselben Bänder wie der Stamm-Sanitizer),
    //      t ∈ [0,1] Klingen-Anteil Basis→Spitze, w ∈ [−1,1] Breiten-Anteil
    //      (−1 = Schneide, 0 = Grat). Rückgabe: w = X-Koordinate (Meter, signiert),
    //      h = volle Dicke (Meter) an (t,w) — der Loft legt ±h/2 um die Mittelebene.
    function klingenProfil(spec, t, w) {
        const baseHalfW = spec.baseHalfW,
            maxThick = spec.maxThick;
        const tipFrac = Number.isFinite(spec.tipWidth) ? Math.max(0.04, Math.min(1, spec.tipWidth)) : 0.18;
        const fuller = Number.isFinite(spec.fuller) ? Math.max(0, Math.min(0.85, spec.fuller)) : 0.0;
        // distale Verjüngung t^1.3 + Spitzen-Klemme im letzten 8-%-Band
        const hw =
            baseHalfW *
            (1 - (1 - tipFrac) * Math.pow(t, 1.3)) *
            (t > 0.92 ? Math.max(0.04, (1 - t) / 0.08) : 1);
        let th = Math.pow(1 - Math.min(1, Math.abs(w)), 0.7); // linsenförmig: dick am Grat, 0 an der Schneide
        if (fuller > 0) th -= fuller * Math.max(0, 1 - Math.pow(w / 0.4, 2)); // Hohlkehle (zentrale Rinne)
        th = Math.max(0, th);
        const thT = 1 - 0.6 * t; // distale Dicken-Verjüngung
        return { w: w * hw, h: th * maxThick * thT };
    }
    // ── ULTRAGUSS U6d — DIE OAKESHOTT-TYPOLOGIE des Wirts (Ω-B2, wahrerbauplan §3.5):
    //    die drei Werkstatt-/DSL-Proportions-Typen (Querschnitt · Länge · Hohlkehle ·
    //    distale Verjüngung; Längen in m) — verbatim aus dem Stamm gewandert, der Stamm
    //    liest sie als Getter-Delegat (AnazhRealm.OAKESHOTT_TYPES, KOERPER_DIAL_MAP-
    //    Muster). Die 21 GATTUNGEN bleiben die Lab-Rezept-Wahrheit; DIESE Tabelle ist
    //    die eingefrorene Spiel-Grammatik (_buildBladedWeapon), Werte-identisch seit Ω-B2.
    var OAKESHOTT_TYPES = Object.freeze({
        // Typ XII — das ritterliche Schnitt-UND-Stich-Schwert: breite Hohlkehle, mäßige Verjüngung.
        XII: Object.freeze({
            bladeLen: 1.45,
            bladeBaseW: 0.2,
            tipWidth: 0.34,
            fuller: 0.5,
            thick: 0.06,
            gripLen: 0.34,
            pommelR: 0.13,
            guardW: 0.46,
        }),
        // Typ XV — stich-orientiert: scharfe Verjüngung zur Spitze, KEINE Hohlkehle, diamant-steif.
        XV: Object.freeze({
            bladeLen: 1.4,
            bladeBaseW: 0.17,
            tipWidth: 0.12,
            fuller: 0.0,
            thick: 0.07,
            gripLen: 0.32,
            pommelR: 0.12,
            guardW: 0.42,
        }),
        // Typ XIIIa — das große Schwert: lang, lange Hohlkehle, langer Griff (Kontergewicht-Knauf).
        XIIIa: Object.freeze({
            bladeLen: 1.9,
            bladeBaseW: 0.23,
            tipWidth: 0.45,
            fuller: 0.55,
            thick: 0.06,
            gripLen: 0.46,
            pommelR: 0.15,
            guardW: 0.52,
        }),
    });
    // Polygon-Flächenmomente — exakt (Shoelace + zweite Momente), auf Schwerpunkt
    function sectionMoments(poly) {
        let A = 0,
            Sz = 0,
            Sy = 0,
            Izz = 0,
            Iyy = 0;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i],
                b = poly[(i + 1) % poly.length];
            const z0 = a[0],
                y0 = a[1],
                z1 = b[0],
                y1 = b[1];
            const cr = z0 * y1 - z1 * y0;
            A += cr;
            Sz += (z0 + z1) * cr;
            Sy += (y0 + y1) * cr;
            Izz += (y0 * y0 + y0 * y1 + y1 * y1) * cr;
            Iyy += (z0 * z0 + z0 * z1 + z1 * z1) * cr;
        }
        A /= 2;
        Sz /= 6;
        Sy /= 6;
        Izz /= 12;
        Iyy /= 12;
        const cz = Sz / A,
            cy = Sy / A;
        return { A: Math.abs(A), Iz: Math.abs(Izz - A * cy * cy), Iy: Math.abs(Iyy - A * cz * cz) }; // Iz=flach(wabbeln) · Iy=hochkant(Schnitt)
    }
    // Krümmung (Sori): Mittellinie biegt in +Y, Spitze hebt — 0 an Basis, P.kruemmung an Spitze, beschleunigend
    function curveY(s, P) {
        const c = P.kruemmung || 0;
        return c * (1 - Math.cos(s * Math.PI * 0.5));
    }

    const RHO = { stahl: 7850, bronze: 8600, holz: 720, griff: 2600 }; // kg/m³ — Längen in m ⇒ Masse in kg (realer Maßstab)

    // ════════════════════════════════════════════════════════════════════
    // LOFT — die Klinge: Schnittringe entlang der (evtl. gekrümmten) Mittellinie
    //   Rahmen je Ring: Tangente in X-Y · Breite entlang Normale(X-Y) · Dicke entlang Z.
    //   Liefert Geometrie + bladeX (Längskoordinate je Vertex) für die Harmonik-Welle.
    // ════════════════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════════════
    // DIE HAUT — lawful readout: Oberfläche erzählt, was das Objekt IST (kein Anstrich).
    // ════════════════════════════════════════════════════════════════════
    function hnoise(x, y, z) {
        const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (s - Math.floor(s)) * 2 - 1;
    }
    // PBR-Kopplung: helle (polierte) Punkte → glatt/glänzend, dunkle (Patina) → matt. Greift nur in der echten WebGL-App.
    function pbrHaut(mat) {
        if (!mat || typeof mat !== "object") return mat;
        mat.onBeforeCompile = (sh) => {
            sh.fragmentShader = sh.fragmentShader.replace(
                "#include <roughnessmap_fragment>",
                "#include <roughnessmap_fragment>\n#ifdef USE_COLOR\n float _lum=dot(vColor.rgb,vec3(0.299,0.587,0.114));\n roughnessFactor=clamp(mix(0.86,0.16,smoothstep(0.30,0.86,_lum)),0.12,0.95);\n#endif"
            );
        };
        if ("needsUpdate" in mat) mat.needsUpdate = true;
        return mat;
    }
    // Stahl: polierte Schneide · Anlassfarben dahinter (Härtung) · Patina im Körper · dunkler in Hohlkehle
    function stahlHaut(edgeProx, fuller, n, tint) {
        const T = tint || [0.5, 0.51, 0.54],
            ts = (T[0] + T[1] + T[2]) / 1.53;
        let r, g, b;
        if (edgeProx > 0.82) {
            const k = 0.82 + 0.1 * ((edgeProx - 0.82) / 0.18) + 0.03 * n;
            r = k;
            g = k + 0.02;
            b = k + 0.08;
        } // polierte Fase (hell)
        else if (edgeProx > 0.46) {
            const h = (edgeProx - 0.46) / 0.36,
                st = [0.8, 0.62, 0.34],
                bl = [0.34, 0.4, 0.56]; // Anlass-Band (Stroh→Blau)
            r = bl[0] + (st[0] - bl[0]) * h;
            g = bl[1] + (st[1] - bl[1]) * h;
            b = bl[2] + (st[2] - bl[2]) * h;
            const m = 1 + 0.07 * n;
            r *= m;
            g *= m;
            b *= m;
        } else {
            const base = 0.4 + 0.06 * n;
            r = base * T[0] * 2;
            g = (base + 0.015) * T[1] * 2;
            b = (base + 0.045) * T[2] * 2;
        } // Körper-Patina im Werkstoff-Ton
        if (fuller) {
            r *= 0.55;
            g *= 0.58;
            b *= 0.66;
        } // Hohlkehle: Oxidation (dunkel)
        const fm = 1 + 0.08 * n;
        r *= fm;
        g *= fm;
        b *= fm; // Schmiede-Mottle
        return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
    }
    function loftBlade(P, S, blMat) {
        // NAHT (Kern-Split, das porta-doorAngles-Muster): der Shell-Global `bladeMat`
        // (Stahl/Roh-Umschalter) reist als Parameter — Default = polierter Stahl.
        var bladeMat = blMat || materials().steel;
        const NB = 72,
            poly0 = sectionAt(0, P),
            KK = poly0.length;
        const rings = [],
            polys = [];
        for (let i = 0; i <= NB; i++) {
            const s = i / NB,
                t = s,
                x = S.xBlade0 + s * P.klinge,
                cy = curveY(s, P);
            const dsh = 0.5 / NB,
                sp = Math.min(1, s + dsh),
                sm2 = Math.max(0, s - dsh);
            let tx = (sp - sm2) * P.klinge,
                ty = curveY(sp, P) - curveY(sm2, P);
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            const nx = -ty,
                ny = tx; // Normale (Breitenrichtung) in X-Y
            const poly = sectionAt(t, P),
                ring = [];
            for (let k = 0; k < KK; k++) {
                const W = poly[k][0],
                    Tk = poly[k][1];
                ring.push(x + nx * W, cy + ny * W, Tk);
            } // Breite entlang N(X-Y), Dicke entlang Z
            rings.push(ring);
            polys.push(poly);
        }
        const verts = [],
            idx = [],
            bladeX = [],
            start = [],
            cols = [];
        const ham = hamonGesetz(P),
            hamOn = ham.visible && P.single; // emergente Härtelinie: nur einschneidige härtbare Klingen
        for (let i = 0; i < rings.length; i++) {
            start.push(verts.length / 3);
            const poly = polys[i];
            let Wm = 1e-4;
            for (let k = 0; k < KK; k++) Wm = Math.max(Wm, Math.abs(poly[k][0]));
            for (let k = 0; k < KK; k++) {
                const X = rings[i][k * 3],
                    Y = rings[i][k * 3 + 1],
                    Z = rings[i][k * 3 + 2];
                verts.push(X, Y, Z);
                bladeX.push(S.xBlade0 + (i / NB) * P.klinge);
                const edgeProx = Math.abs(poly[k][0]) / Wm,
                    thin = 1 - Math.min(1, Math.abs(poly[k][1]) / (P.th0 * 0.5 + 1e-5));
                const fuller = thin > 0.45 && edgeProx < 0.6;
                let c = stahlHaut(edgeProx, fuller, hnoise(X * 140, Y * 140, Z * 140));
                if (hamOn) {
                    const hpos = poly[k][0] / Wm; // -1 Rücken … +1 Schneide
                    const wave = 0.07 * Math.sin(i * 0.55) + 0.035 * Math.sin(i * 1.7 + 1.2); // Notare-Welle (organisch)
                    const lvl = 1 - 2 * ham.h + wave,
                        nioi = 0.11; // Hamon-Grenze (hpos) · Habuchi-Breite
                    if (hpos > lvl + nioi) {
                        c = [c[0] * 0.45 + 0.4, c[1] * 0.45 + 0.41, c[2] * 0.45 + 0.43];
                    } // Yakiba: frostiger Martensit (hell)
                    else if (hpos > lvl - nioi) {
                        c = [
                            Math.min(1, c[0] * 0.18 + 0.78),
                            Math.min(1, c[1] * 0.18 + 0.79),
                            Math.min(1, c[2] * 0.2 + 0.74),
                        ];
                    } // Nioi/Habuchi: helle Nebelgrenze
                    else {
                        c = [c[0] * 0.72, c[1] * 0.73, c[2] * 0.78];
                    } // Hira (Perlit-Körper): dunkler, matt
                }
                cols.push(c[0], c[1], c[2]);
            }
        }
        for (let i = 0; i < rings.length - 1; i++) {
            const a = start[i],
                b = start[i + 1];
            for (let k = 0; k < KK; k++) {
                const k2 = (k + 1) % KK;
                idx.push(a + k, a + k2, b + k);
                idx.push(b + k, a + k2, b + k2);
            }
        }
        // Spitzen-Kappe (Fächer zum letzten Ring-Zentrum) + Basis-Kappe
        function capCentroid(ringIdxStart) {
            let cx = 0,
                cy = 0,
                cz = 0;
            for (let k = 0; k < KK; k++) {
                cx += verts[(ringIdxStart + k) * 3];
                cy += verts[(ringIdxStart + k) * 3 + 1];
                cz += verts[(ringIdxStart + k) * 3 + 2];
            }
            return [cx / KK, cy / KK, cz / KK];
        }
        const tipC = capCentroid(start[NB]);
        const tIdx = verts.length / 3;
        verts.push(...tipC);
        bladeX.push(S.xPoint);
        cols.push(0.78, 0.8, 0.86);
        for (let k = 0; k < KK; k++) {
            const k2 = (k + 1) % KK;
            idx.push(start[NB] + k, tIdx, start[NB] + k2);
        }
        const baseC = capCentroid(start[0]);
        const bIdx = verts.length / 3;
        verts.push(...baseC);
        bladeX.push(S.xBlade0);
        cols.push(0.44, 0.45, 0.49);
        for (let k = 0; k < KK; k++) {
            const k2 = (k + 1) % KK;
            idx.push(start[0] + k2, bIdx, start[0] + k);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        if (bladeMat.vertexColors !== true) {
            bladeMat.vertexColors = true;
            bladeMat.needsUpdate = true;
            pbrHaut(bladeMat);
        }
        const e = new THREE.Mesh(g, bladeMat);
        e.castShadow = e.receiveShadow = true;
        e.userData.bladeX = bladeX;
        e.userData.baseZ = verts.filter((_, i) => i % 3 === 2).slice(); // Basis-Z je Vertex (für Welle)
        return e;
    }

    // ════════════════════════════════════════════════════════════════════
    // AUSSTATTUNG — Knauf · Parier · Griff  (Profil je Tradition, gedreht um X)
    // ════════════════════════════════════════════════════════════════════
    function latheX(profile, seg, m) {
        // profile: [[r,xLocal]...] → LatheGeometry, dann Achse Y→X drehen
        const pts = profile.map((p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]));
        const g = new THREE.LatheGeometry(pts, seg || 28);
        g.rotateZ(-Math.PI / 2);
        const e = new THREE.Mesh(g, m);
        e.castShadow = e.receiveShadow = true;
        return e;
    }
    function accentMat(acc) {
        return acc === "messing"
            ? M.brass
            : acc === "eisen"
              ? M.iron
              : acc === "bronze"
                ? M.bronze
                : acc === "schwarzstahl"
                  ? M.blacksteel
                  : M.steelRaw;
    }
    function wrapMat(wp) {
        return wp === "ito" ? M.cord : wp === "rau" ? M.cord : M.leather;
    }

    function buildPommel(P, S, T) {
        const g = new THREE.Group();
        const r = P.knaufR,
            x0 = S.xButt,
            m = accentMat(T.accent);
        let prof;
        if (T.pommel === "scheibe")
            prof = [
                [0, r * 0.5],
                [r * 1.05, r * 0.35],
                [r * 1.12, 0],
                [r * 1.05, -r * 0.35],
                [0, -r * 0.55],
            ]; // Rad/Scheibenknauf (Frank)
        else if (T.pommel === "kugel")
            prof = [
                [0, r * 0.7],
                [r * 0.7, r * 0.55],
                [r, 0],
                [r * 0.7, -r * 0.6],
                [0, -r * 0.8],
            ]; // Kugel (Pars)
        else if (T.pommel === "birne")
            prof = [
                [0, r * 0.9],
                [r * 0.5, r * 0.6],
                [r * 0.95, 0],
                [r * 0.7, -r * 0.7],
                [0, -r * 1.1],
            ]; // Birne/Scent-stopper
        else if (T.pommel === "fass")
            prof = [
                [0, r * 0.6],
                [r * 0.9, r * 0.5],
                [r * 1.0, -r * 0.1],
                [r * 0.9, -r * 0.6],
                [0, -r * 0.7],
            ]; // Fass (Brut)
        else if (T.pommel === "kashira")
            prof = [
                [0, r * 0.3],
                [r * 0.85, r * 0.2],
                [r * 0.9, -r * 0.4],
                [r * 0.6, -r * 0.7],
                [0, -r * 0.75],
            ]; // Kashira (Nihon)
        else
            prof = [
                [0, r * 0.5],
                [r, 0.0],
                [0, -r * 0.6],
            ];
        if (T.pommel === "keine") {
            return g;
        } // manche Traditionen: kein Knauf
        const e = latheX(prof, 30, m);
        e.position.x = x0 - r * 0.2;
        g.add(e);
        return g;
    }

    function buildGuard(P, S, T) {
        const g = new THREE.Group();
        const m = accentMat(T.accent);
        const x = S.xGuard + S.gThk * 0.5,
            half = P.parier;
        const eg = P.guardOverride !== undefined ? P.guardOverride : T.guard; // METAGESETZ: effektives Gehilz (Gattung kann Tradition überstimmen)
        if (eg === "keine") {
            // keine Parierstange → Zwinge/Bolster verbindet Griff → Klinge (kein Spalt!)
            const fer = latheX(
                [
                    [0.0115, 0],
                    [0.0145, S.gThk * 0.32],
                    [0.0135, S.gThk * 0.72],
                    [0.01, S.gThk],
                ],
                22,
                m
            );
            fer.position.x = S.xGripEnd;
            fer.castShadow = true;
            g.add(fer);
            return g;
        }
        if (eg === "kreuz") {
            // Kreuz/Parierstange: Quillon-Richtung = Y, ragt über die Schneiden
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0095, half * 2, 20), m);
            bar.position.set(x, 0, 0);
            bar.castShadow = true;
            g.add(bar);
            for (const s of [-1, 1]) {
                const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), m);
                knob.position.set(x, s * half, 0);
                knob.castShadow = true;
                g.add(knob);
            }
            g.add(B(x, 0, 0, S.gThk * 0.7, 0.013, 0.013, m));
        } else if (eg === "scheibe") {
            const d = new THREE.Mesh(new THREE.CylinderGeometry(half, half, 0.006, 40), m);
            d.rotation.z = Math.PI / 2;
            d.position.set(x, 0, 0);
            d.castShadow = true;
            g.add(d);
            const rim2 = new THREE.Mesh(new THREE.TorusGeometry(half, 0.006, 10, 40), m);
            rim2.rotation.y = Math.PI / 2;
            rim2.position.set(x, 0, 0);
            g.add(rim2);
            g.add(B(x, 0, 0, S.gThk * 0.6, 0.011, 0.011, m)); // Mittelblock schließt den Spalt
        } else if (eg === "langetten") {
            for (const s of [-1, 1]) g.add(B(x, s * half * 0.6, 0, S.gThk * 0.7, half * 0.55, 0.016, m));
            g.add(B(x, 0, 0, S.gThk * 0.7, 0.014, 0.02, m));
        } else if (eg === "glocke") {
            const cup = new THREE.Mesh(
                new THREE.SphereGeometry(half * 1.1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
                m
            );
            cup.rotation.z = -Math.PI / 2;
            cup.position.set(x + 0.02, 0, 0);
            cup.castShadow = true;
            g.add(cup);
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, half * 1.6, 16), m);
            bar.position.set(x, 0, 0);
            bar.castShadow = true;
            g.add(bar);
            g.add(B(x, 0, 0, S.gThk * 0.6, 0.011, 0.011, m));
        } else {
            g.add(B(x, 0, 0, S.gThk * 0.6, 0.012, 0.012, m));
        } // unbekannt → wenigstens Mittelblock (kein Spalt)
        return g;
    }

    function buildGrip(P, S, T) {
        const g = new THREE.Group();
        const x0 = S.xGrip0,
            x1 = S.xGripEnd,
            len = x1 - x0,
            rA = griffD(intentControl(P)) * 0.5,
            rB = griffD(intentControl(P)) * 0.5 * 0.85;
        // Holzkern (leicht ballig)
        const core = latheX(
            [
                [0.003, 0],
                [rA, len * 0.06],
                [rA * 1.04, len * 0.5],
                [rB, len * 0.94],
                [0.003, len],
            ],
            24,
            M.wood
        );
        core.position.x = x0;
        woodColors(core, len, 0.5, 0.62);
        g.add(core);
        // Wicklung (Leder/Ito) — schräge Ringe
        const turns = Math.max(4, Math.round(len / 0.022)),
            wm = wrapMat(T.wrap);
        for (let i = 0; i < turns; i++) {
            const xx = x0 + ((i + 0.5) / turns) * len,
                rr = rA * 1.04 * (1 - ((xx - x0) / len) * 0.12) + 0.0016;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.0022, 8, 22), wm);
            ring.rotation.y = Math.PI / 2;
            ring.position.set(xx, 0, 0);
            ring.rotation.z = 0.18;
            ring.castShadow = true;
            g.add(ring);
        }
        return g;
    }

    // ════════════════════════════════════════════════════════════════════
    // SCHLAGKÖPFE — Kolben · Axt · Hammer · Keule (für modus='wucht')
    //   Schaft (langer Holzgriff) + montierter Kopf am +X-Ende. Masse → Integral.
    // ════════════════════════════════════════════════════════════════════
    // Holz: Maserung (Faser-Streifen entlang X) + Griff-Verschleiß (Handpolitur, dunkel wo gehalten)
    function holzHaut(ang, x, gf) {
        const streak =
            hnoise(Math.cos(ang) * 2.4, Math.sin(ang) * 2.4, x * 36) * 0.5 + hnoise(1.7, 0.3, x * 150) * 0.28;
        const lite = 1 + streak * 0.2;
        let r = 0.4 * lite,
            g = 0.285 * lite,
            b = 0.16 * lite;
        if (gf > 0) {
            r *= 1 - 0.3 * gf;
            g *= 1 - 0.35 * gf;
            b *= 1 - 0.42 * gf;
        } // Handschweiß/Politur
        return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
    }
    function woodColors(mesh, len, gC, gW) {
        const p = mesh.geometry.attributes.position,
            cols = [];
        let xmin = 1e9,
            xmax = -1e9;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i);
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
        }
        const L = xmax - xmin || 1;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i),
                y = p.getY(i),
                z = p.getZ(i),
                ang = Math.atan2(z, y),
                af = (x - xmin) / L;
            const gf = gW > 0 ? Math.max(0, 1 - Math.abs(af - gC) / gW) : 0,
                c = holzHaut(ang, x, gf);
            cols.push(c[0], c[1], c[2]);
        }
        mesh.geometry.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        const m = mesh.material.clone ? mesh.material.clone() : mesh.material;
        if (m) {
            m.vertexColors = true;
            pbrHaut(m);
        }
        mesh.material = m;
        return mesh;
    }
    function buildHaft(P, S) {
        const g = new THREE.Group();
        const len = S.xGripEnd - S.xGrip0,
            r = P.schaftR;
        const core = latheX(
            [
                [r * 0.86, 0],
                [r, len * 0.5],
                [r * 0.95, len],
            ],
            22,
            M.wood
        );
        core.position.x = S.xGrip0;
        woodColors(core, len, 0.24, 0.42);
        g.add(core);
        for (let i = 0; i < 5; i++) {
            const xx = S.xGrip0 + 0.02 + i * 0.028;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.99, 0.0022, 8, 20), M.leather);
            ring.rotation.y = Math.PI / 2;
            ring.position.set(xx, 0, 0);
            g.add(ring);
        }
        return g;
    }

    // — Kegel/Dorn entlang ±Z, Basis im Sockel eingebettet (Rücken-Dorn / Beak) —
    // — Lathe um die Z-Achse (Profil [r,zLocal]); Basis bei zBase, Richtung dir(±Z) —
    function latheZ(profile, seg, m, dir, xPos, zBase) {
        const e = new THREE.Mesh(
            new THREE.LatheGeometry(
                profile.map((p) => new THREE.Vector2(p[0], p[1])),
                seg || 22
            ),
            m
        );
        e.rotation.x = ((dir < 0 ? -1 : 1) * Math.PI) / 2;
        e.position.set(xPos || 0, 0, zBase || 0);
        e.castShadow = e.receiveShadow = true;
        return e;
    }
    // — Ogivaler Dorn/Beak entlang ±Z, Basis im Sockel —
    function spikeZ(baseR, len, dir, xPos, zBase, m) {
        const N = 10,
            prof = [[0, 0]];
        for (let k = 0; k <= N; k++) {
            const u = k / N;
            prof.push([baseR * Math.pow(Math.cos((u * Math.PI) / 2), 0.62) + 0.0004, u * len]);
        }
        return latheZ(prof, 16, m, dir, xPos, zBase);
    }

    // ════════════════════════════════════════════════════════════════════
    //  GESCHMIEDETES BLATT — eine konforme Fläche, EINE Quelle (Geometrie UND Masse).
    //   bitField(f,g): f=0 Auge … 1 Schneide, g über die Breite. Gewölbte Wange am Auge,
    //   konvexe Bauchung, gerundete Zehe/Ferse, scharfer Grat (t→0) mit Winkel β.
    // ════════════════════════════════════════════════════════════════════
    function bitField(f, g, P, sR) {
        const beta = (P.beta * Math.PI) / 180,
            reach = P.reach,
            rootR = sR * 0.86,
            rootLen = P.kopfLen * 0.72;
        const droop = (reach - rootR) * 0.16,
            cheek =
                Math.max(0, sR * 0.95 - (reach - rootR) * Math.tan(beta / 2)) *
                (P.cheekMul !== undefined ? P.cheekMul : 1);
        const eHalf = P.edgeLen * 0.5,
            rHalf = rootLen * 0.4,
            u = (g - 0.5) * 2;
        const xe = u * eHalf * (1 - 0.12 * Math.pow(Math.abs(u), 3)),
            ze = reach - droop * u * u,
            x = u * rHalf + (xe - u * rHalf) * f,
            z = rootR + (ze - rootR) * f;
        const dome = 1 - 0.32 * u * u,
            taperG = 1 - 0.7 * Math.pow(Math.max(0, (Math.abs(u) - 0.82) / 0.18), 1.7);
        return {
            xo: x,
            z,
            t: Math.max(0, (Math.tan(beta / 2) * (ze - z) + cheek * dome * Math.pow(1 - f, 1.6)) * taperG),
        };
    }
    function forgeBit(xMid, beard, P, sR, m) {
        const NF = 16,
            NG = 26,
            top = [],
            bot = [],
            V = [],
            idx = [],
            cols = [];
        let c = 0;
        const tint = m && m.color ? [m.color.r, m.color.g, m.color.b] : [0.5, 0.51, 0.54];
        for (let i = 0; i <= NF; i++) {
            const rt = [],
                rb = [];
            for (let j = 0; j <= NG; j++) {
                const F = bitField(i / NF, j / NG, P, sR);
                const ep = j / NG,
                    n = hnoise(i * 1.7, j * 2.3, 3.0);
                const fz = ep < 0.62 ? 0.0011 * hnoise(i * 0.8 + 0.4, j * 1.1, 11) * (1 - ep / 0.62) : 0; // Schmiede-Planieren (Hammer-Dibbel) auf der Wange
                const col = stahlHaut(ep, false, n, tint);
                rt.push(c);
                V.push(xMid + beard + F.xo, F.t + fz, F.z);
                c++;
                cols.push(col[0], col[1], col[2]);
                rb.push(c);
                V.push(xMid + beard + F.xo, -(F.t + fz), F.z);
                c++;
                cols.push(col[0], col[1], col[2]);
            }
            top.push(rt);
            bot.push(rb);
        }
        const q = (a, b, cc, d) => idx.push(a, b, cc, a, cc, d);
        for (let i = 0; i < NF; i++)
            for (let j = 0; j < NG; j++) {
                q(top[i][j], top[i][j + 1], top[i + 1][j + 1], top[i + 1][j]);
                q(bot[i][j], bot[i + 1][j], bot[i + 1][j + 1], bot[i][j + 1]);
            }
        for (let i = 0; i < NF; i++) {
            q(top[i][0], top[i + 1][0], bot[i + 1][0], bot[i][0]);
            q(top[i][NG], bot[i][NG], bot[i + 1][NG], top[i + 1][NG]);
        }
        for (let j = 0; j < NG; j++) q(top[0][j], bot[0][j], bot[0][j + 1], top[0][j + 1]);
        const go = new THREE.BufferGeometry();
        go.setAttribute("position", new THREE.Float32BufferAttribute(V, 3));
        go.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
        go.setIndex(idx);
        go.computeVertexNormals();
        const sm = m.clone ? m.clone() : m;
        if (sm) {
            sm.vertexColors = true;
            pbrHaut(sm);
        }
        const e = new THREE.Mesh(go, sm);
        e.castShadow = e.receiveShadow = true;
        return e;
    }
    // — Geschmiedeter Flansch: radiales Blatt mit Mittelrippe (Linse), gerundete Spitze —
    function leafFlange(fL, innerR, reach, thick, m) {
        const NR = 10,
            NX = 8,
            top = [],
            bot = [],
            V = [],
            idx = [];
        let c = 0;
        for (let i = 0; i <= NR; i++) {
            const fr = i / NR,
                r = innerR + (reach - innerR) * fr;
            const hw =
                    fL *
                    0.5 *
                    (1 - 0.82 * Math.pow(fr, 1.25)) *
                    (1 - 0.55 * Math.pow(Math.max(0, (fr - 0.72) / 0.28), 1.5)),
                th = thick * (1 - 0.45 * fr);
            const rt = [],
                rb = [];
            for (let j = 0; j <= NX; j++) {
                const xf = (j / NX - 0.5) * 2,
                    zz = th * Math.sqrt(Math.max(0, 1 - xf * xf));
                rt.push(c);
                V.push(xf * hw, r, zz);
                c++;
                rb.push(c);
                V.push(xf * hw, r, -zz);
                c++;
            }
            top.push(rt);
            bot.push(rb);
        }
        const q = (a, b, cc, d) => idx.push(a, b, cc, a, cc, d);
        for (let i = 0; i < NR; i++)
            for (let j = 0; j < NX; j++) {
                q(top[i][j], top[i][j + 1], top[i + 1][j + 1], top[i + 1][j]);
                q(bot[i][j], bot[i + 1][j], bot[i + 1][j + 1], bot[i][j + 1]);
            }
        for (let j = 0; j < NX; j++) q(top[0][j], bot[0][j], bot[0][j + 1], top[0][j + 1]); // Wurzelkappe
        for (let j = 0; j < NX; j++) q(top[NR][j], top[NR][j + 1], bot[NR][j + 1], bot[NR][j]); // Spitzenkappe
        const go = new THREE.BufferGeometry();
        go.setAttribute("position", new THREE.Float32BufferAttribute(V, 3));
        go.setIndex(idx);
        go.computeVertexNormals();
        const e = new THREE.Mesh(go, m);
        e.castShadow = e.receiveShadow = true;
        return e;
    }

    // — Bogen: Riser (rigide) + zwei biegende Wurfarme (Balken, getapert, Recurve-Tip) + gespannte Sehne —
    function buildBogen(P, m) {
        const G = new THREE.Group();
        const rl = P.riserLen || 0.13,
            ll = P.limbLen || 0.6,
            wB = P.wBase || 0.03,
            tB = P.tBase || 0.011,
            rec = P.recurve || 0;
        const arc = 0.1 + rec * 0.035,
            rh = rl / 2;
        const sm = (a, b, x) => {
            const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return u * u * (3 - 2 * u);
        };
        const cX = (u) => arc * (1 - Math.cos(u * 1.35)) - rec * 0.16 * sm(0.58, 1.0, u); // Bogen nach +X, Recurve-Hook −X am Tip
        const dFrac = Math.max(0, Math.min(1, P.drawFrac || 0)); // 0 = Ruhe (Standhöhe) · 1 = Vollauszug
        const drawDist = dFrac * (P.draw || 0.6) * 0.82; // wie weit die Nocke nach −X gezogen ist
        const nockX = arc - drawDist; // Nockenpunkt auf der Mittellinie
        const flex = dFrac * (arc * 0.95 + drawDist * 0.55); // Wurfarm-Tip flext nach −X (Cantilever unter Sehnenzug)
        const cXdraw = (u) => cX(u) - flex * sm(0.14, 1.0, u) * sm(0.14, 1.0, u); // äußerer Arm biegt zurück, Wurzel bleibt
        // Riser
        const riser = cyl(tB * 1.7, tB * 1.45, rl * 1.04, M.wood, 16);
        riser.position.set(arc * 0.05, 0, 0);
        riser.castShadow = true;
        G.add(riser);
        // Wurfarme (oben +Y, unten −Y gespiegelt) — ein wasserdichter Loft je Arm
        const tips = [];
        for (const dir of [1, -1]) {
            const NU = 22,
                V = [],
                idx = [],
                ring = [],
                cols = [];
            let c = 0;
            for (let i = 0; i <= NU; i++) {
                const u = i / NU,
                    Y = dir * (rh + u * ll * (1 - dFrac * 0.05)),
                    X = cXdraw(u),
                    w = wB * (1 - 0.62 * u) + 0.004,
                    t = tB * (1 - 0.32 * u) + 0.0028;
                const corners = [
                        [-t / 2, -w / 2],
                        [t / 2, -w / 2],
                        [t / 2, w / 2],
                        [-t / 2, w / 2],
                    ],
                    r = [];
                const gy = hnoise(2.0, Y * 28, 1.0) * 0.5 + hnoise(0.5, Y * 105, 2.0) * 0.3,
                    lite = 1 + gy * 0.17; // Faser entlang des Arms
                for (const cc of corners) {
                    r.push(c);
                    V.push(X + cc[0], Y, cc[1]);
                    c++;
                    const back = cc[0] > 0 ? 1.06 : 0.96; // Rücken (Zug) heller als Bauch (Druck)
                    cols.push(0.4 * lite * back, 0.285 * lite * back, 0.16 * lite * back);
                }
                ring.push(r);
                if (i === NU) tips.push([X, Y, 0]);
            }
            const q = (a, b, cc, d) => idx.push(a, b, cc, a, cc, d);
            for (let i = 0; i < NU; i++)
                for (let k = 0; k < 4; k++) {
                    const k2 = (k + 1) % 4;
                    q(ring[i][k], ring[i][k2], ring[i + 1][k2], ring[i + 1][k]);
                }
            q(ring[0][0], ring[0][3], ring[0][2], ring[0][1]);
            q(ring[NU][0], ring[NU][1], ring[NU][2], ring[NU][3]);
            const go = new THREE.BufferGeometry();
            go.setAttribute("position", new THREE.Float32BufferAttribute(V, 3));
            go.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
            go.setIndex(idx);
            go.computeVertexNormals();
            const am = m.clone ? m.clone() : m;
            if (am) {
                am.vertexColors = true;
                pbrHaut(am);
            }
            const arm = new THREE.Mesh(go, am);
            arm.castShadow = true;
            G.add(arm);
        }
        // Sehne: bei Auszug ein V (Tip → Nocke → Tip), sonst gerade Tip → Tip
        const t1 = tips[0],
            t2 = tips[1],
            smat = M.blacksteel || M.steel;
        function strSeg(ax, ay, bx, by) {
            const len = Math.hypot(ax - bx, ay - by);
            const seg = cyl(0.0026, 0.0026, len, smat, 8);
            seg.position.set((ax + bx) / 2, (ay + by) / 2, 0);
            seg.rotation.z = -Math.atan2(ax - bx, ay - by);
            seg.castShadow = true;
            return seg;
        }
        if (dFrac > 0.02) {
            G.add(strSeg(t1[0], t1[1], nockX, 0));
            G.add(strSeg(nockX, 0, t2[0], t2[1]));
            G.userData.nock = [nockX, 0, 0];
        } else {
            G.add(strSeg(t1[0], t1[1], t2[0], t2[1]));
            G.userData.nock = [(t1[0] + t2[0]) / 2, 0, 0];
        }
        G.userData.drawDist = drawDist;
        G.userData.tips = tips;
        return G;
    }

    // — Meißel/Adze-Ende: flacher Keil mit horizontaler Schneide (für Spitzhacke −Z) —
    function chiselZ(hw, ht, len, dir, xPos, zBase, m) {
        const z1 = zBase + dir * len;
        const V = [
            xPos - hw,
            -ht,
            zBase,
            xPos + hw,
            -ht,
            zBase,
            xPos + hw,
            ht,
            zBase,
            xPos - hw,
            ht,
            zBase,
            xPos - hw,
            0,
            z1,
            xPos + hw,
            0,
            z1,
        ];
        const idx = [0, 1, 2, 0, 2, 3, 0, 4, 5, 0, 5, 1, 3, 2, 5, 3, 5, 4, 0, 3, 4, 1, 5, 2];
        const go = new THREE.BufferGeometry();
        go.setAttribute("position", new THREE.Float32BufferAttribute(V, 3));
        go.setIndex(idx);
        go.computeVertexNormals();
        return new THREE.Mesh(go, m);
    }
    // — Grabeblatt: Platte am Schaftende (+X), Breite Z, Länge X, Mulde in Y. Spaten flach+gerade, Schaufel breit+konkav. —
    function grabeBlatt(P, x0, m) {
        const bw = P.bladeW || 0.16,
            bl = P.bladeLen || 0.24,
            bt = P.bladeTh || 0.004,
            dishD = P.bladeConc !== undefined ? P.bladeConc : 0.02,
            curl = P.sideCurl || 0.01;
        const lift = P.liftAngle || 0.12,
            neckLen = P.neckLen || 0.052,
            sockBack = P.socketBack || 0.05;
        const sR = P.schaftR || 0.018,
            neckR = sR * 1.18,
            spineH = P.spineH || 0.011,
            edgeRound = P.edgeRound || 0.4;
        const G = new THREE.Group();
        // — Tülle: umfasst den Schaft (Schaft steckt drin), glatt in den Hals; Kraft Schaft→Blatt —
        G.add(
            latheX(
                [
                    [sR * 1.02, x0 - sockBack],
                    [sR * 1.5, x0 - sockBack * 0.3],
                    [sR * 1.42, x0 + neckLen * 0.3],
                    [neckR * 1.28, x0 + neckLen * 0.78],
                    [neckR * 1.22, x0 + neckLen + 0.016],
                ],
                26,
                m
            )
        ); // Tülle sleevt über den Hals
        // — Blatt: Hals verlässt die Tülle GERADE, biegt dann progressiv (kein Spalt); Schöpf-Kanal; Rückgrat; dünne Schneide —
        const xn = x0 + neckLen,
            drop = bl * Math.sin(lift),
            up = [Math.sin(lift * 0.6), Math.cos(lift * 0.6), 0];
        const NF = 22,
            NG = 24,
            front = [],
            back = [],
            V = [],
            idx = [];
        let c = 0,
            hw0 = neckR / (bw / 2);
        const smoo = (a, b, x) => {
            const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return t * t * (3 - 2 * t);
        };
        const wProf = (f) => {
            const flare = hw0 + (1 - hw0) * smoo(0, 0.46, f);
            const round = 1 - edgeRound * smoo(0.66, 1.0, f);
            return flare * round;
        };
        const ramp = (f) => smoo(0, 0.24, f),
            spineFrac = 0.4;
        for (let i = 0; i <= NF; i++) {
            const f = i / NF,
                cx = xn + bl * f,
                cy = -drop * f * f,
                w = (bw / 2) * wProf(f),
                rf = [],
                rb = []; // cy=−drop·f² → startet flach am Hals
            const tF = bt * (1 - 0.55 * smoo(0.8, 1.0, f)); // Schneide dünnt zur Spitze
            for (let j = 0; j <= NG; j++) {
                const g = (j / NG - 0.5) * 2;
                const yl = ramp(f) * (-dishD * (1 - g * g) + curl * g * g); // Schöpf-Kanal: Mitte tief, Seiten hoch
                const px = cx + up[0] * yl,
                    py = cy + up[1] * yl,
                    pz = g * w;
                rf.push(c);
                V.push(px, py, pz);
                c++;
                let sb = tF;
                if (f < spineFrac) sb += spineH * (1 - f / spineFrac) * Math.exp(-(g / 0.22) * (g / 0.22)); // Rückgrat (Rippe Hals→Blatt)
                rb.push(c);
                V.push(px - up[0] * sb, py - up[1] * sb, pz);
                c++;
            }
            front.push(rf);
            back.push(rb);
        }
        const q = (a, b, cc, d) => idx.push(a, b, cc, a, cc, d);
        for (let i = 0; i < NF; i++)
            for (let j = 0; j < NG; j++) {
                q(front[i][j], front[i][j + 1], front[i + 1][j + 1], front[i + 1][j]);
                q(back[i][j], back[i + 1][j], back[i + 1][j + 1], back[i][j + 1]);
            }
        for (let i = 0; i < NF; i++) {
            q(front[i][0], front[i + 1][0], back[i + 1][0], back[i][0]);
            q(front[i][NG], back[i][NG], back[i + 1][NG], front[i + 1][NG]);
        }
        for (let j = 0; j < NG; j++) {
            q(front[0][j], back[0][j], back[0][j + 1], front[0][j + 1]);
            q(front[NF][j], front[NF][j + 1], back[NF][j + 1], back[NF][j]);
        }
        const go = new THREE.BufferGeometry();
        go.setAttribute("position", new THREE.Float32BufferAttribute(V, 3));
        go.setIndex(idx);
        go.computeVertexNormals();
        const bl2 = new THREE.Mesh(go, m);
        bl2.castShadow = bl2.receiveShadow = true;
        G.add(bl2);
        return G;
    }
    function buildHead(P, S) {
        const g = new THREE.Group();
        const x0 = S.xHead0,
            L = P.kopfLen,
            sR = P.socketR,
            cx = x0 + L * 0.55,
            m = accentMat(P.kopfAccent || "schwarzstahl");
        const rootR = sR * 0.86;
        if (P.kopfTyp === "keule") {
            // Keule: Holz schwillt MONOTON zum runden Schlagende (Masse ans Ende)
            const prof = [];
            const NC = 24,
                headR = sR * 1.48,
                neckR = Math.max(P.schaftR * 0.96, sR * 0.5);
            for (let k = 0; k <= NC; k++) {
                const u = k / NC;
                let r;
                if (u < 0.8) {
                    r = neckR + (headR - neckR) * Math.pow(u / 0.8, 0.62);
                } // monotones Anschwellen vom Hals
                else {
                    const v = (u - 0.8) / 0.2;
                    r = neckR * 0.15 + (headR - neckR * 0.15) * Math.sqrt(Math.max(0, 1 - v * v));
                } // halbkugelige Kuppe → rundes Ende
                prof.push([Math.max(0.0006, r), u * L]);
            }
            const club = latheX(prof, 28, M.wood);
            club.position.x = x0;
            club.castShadow = true;
            g.add(club);
            for (let k = 0; k < 3; k++) {
                const u = 0.32 + k * 0.17,
                    xx = x0 + L * u,
                    rr = neckR + (headR - neckR) * Math.pow(u / 0.8, 0.62); // Zwingen auf dem Anschwellen
                const band = new THREE.Mesh(new THREE.TorusGeometry(rr * 1.012 + 0.001, 0.0045, 8, 24), M.iron);
                band.rotation.y = Math.PI / 2;
                band.position.set(xx, 0, 0);
                g.add(band);
            }
            return g;
        }
        // — Stahl-Sockel (Auge/Nabe), Rotationskörper um den Schaft → umschließt ihn (Vorschlaghammer baut eigene Trommel) —
        if (P.kopfTyp !== "keule" && P.kopfTyp !== "grabeblatt") {
            const plug = cyl(P.schaftR * 1.0, P.schaftR * 1.0, L * 1.02, M.wood, 16);
            plug.rotation.z = Math.PI / 2;
            plug.position.x = x0 + L * 0.5;
            plug.castShadow = true;
            g.add(plug);
        } // Schaft durch das Auge
        if (P.kopfTyp !== "grabeblatt") {
            const rB = P.schaftR * 1.04,
                sp = [[rB, 0]];
            const NS = 14; // geschlossener Ring-Körper mit Bohrung (grabeblatt nutzt Tülle)
            for (let k = 0; k <= NS; k++) {
                const u = k / NS;
                sp.push([Math.max(P.schaftR * 1.12, sR * (0.82 + 0.18 * Math.sin(Math.PI * u))), u * L]);
            }
            sp.push([rB, L], [rB, 0]);
            const socket = latheX(sp, 30, m);
            socket.position.x = x0;
            socket.castShadow = true;
            g.add(socket);
        }
        if (P.kopfTyp === "axt" || P.kopfTyp === "maul") {
            g.add(forgeBit(cx, L * 0.1, P, sR, m)); // geschmiedetes Blatt nach +Z
            const pts = [];
            for (let j = 0; j <= 10; j++) {
                const F = bitField(1, j / 10, P, sR);
                pts.push(new THREE.Vector3(cx + L * 0.1 + F.xo, 0, F.z));
            } // konvexe Glanz-Schneide
            g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.0013, 6), M.steel));
            if (P.backSpike)
                g.add(spikeZ(sR * 0.52, P.reach * 0.8, -1, cx, -rootR * 0.6, m)); // ogivaler Rücken-Dorn (Waffe)
            else
                g.add(
                    latheZ(
                        [
                            [0, 0],
                            [sR * 0.5, 0],
                            [sR * 0.74, L * 0.05],
                            [sR * 0.74, L * 0.13],
                            [sR * 0.5, L * 0.16],
                            [0, L * 0.16],
                        ],
                        18,
                        m,
                        -1,
                        x0 + L * 0.46,
                        -rootR * 0.5
                    )
                ); // geschlossener Treib-Nacken (Werkzeug)
        } else if (P.kopfTyp === "hammer") {
            const R = sR * 0.92,
                fl = P.reach * 0.55;
            g.add(
                latheZ(
                    [
                        [0, 0],
                        [R * 0.5, 0],
                        [R, fl * 0.14],
                        [R, fl * 0.8],
                        [R * 0.84, fl * 0.95],
                        [R * 0.5, fl],
                        [0, fl],
                    ],
                    22,
                    m,
                    1,
                    cx,
                    rootR * 0.5
                )
            ); // angefaste, geschlossene Bahn +Z
            if (P.beak)
                g.add(spikeZ(sR * 0.5, P.reach * 1.1, -1, cx, -rootR * 0.6, m)); // ogivaler Beak (Waffe)
            else
                g.add(
                    latheZ(
                        [
                            [0, 0],
                            [R * 0.82, 0],
                            [R * 0.82, fl * 0.6],
                            [R * 0.55, fl * 0.78],
                            [0, fl * 0.78],
                        ],
                        20,
                        m,
                        -1,
                        cx,
                        -rootR * 0.5
                    )
                ); // geschlossene Treib-Bahn (Werkzeug)
        } else if (P.kopfTyp === "sledge") {
            // Vorschlaghammer: langer klobiger Querkopf (Z), zwei Bahnen ±Z, Schaft mittig durch
            const R = sR * 1.35,
                H = L * 0.82; // lang & massig: ~2.4× so lang wie breit
            for (const dir of [1, -1])
                g.add(
                    latheZ(
                        [
                            [0, 0],
                            [R * 0.6, 0],
                            [R, H * 0.1],
                            [R, H * 0.86],
                            [R * 0.9, H * 0.96],
                            [R * 0.55, H],
                            [0, H],
                        ],
                        16,
                        m,
                        dir,
                        cx,
                        0
                    )
                ); // wenig Fase → blockig, 16-seitig
        } else if (P.kopfTyp === "kolben") {
            // Streitkolben: Blatt-Flansche mit Rippe, im Sockel verwurzelt
            const n = P.flangeN || 6,
                fL = P.flangeLen || L * 0.7;
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2;
                const fl = leafFlange(fL, rootR * 0.9, P.reach, 0.01, m);
                fl.position.x = cx;
                const grp = new THREE.Group();
                grp.add(fl);
                grp.rotation.x = a;
                g.add(grp);
            }
            const knob = new THREE.Mesh(new THREE.SphereGeometry(sR * 0.55, 16, 12), m);
            knob.position.set(x0 + L + sR * 0.2, 0, 0);
            knob.castShadow = true;
            g.add(knob);
        } else if (P.kopfTyp === "pick") {
            // Spitzhacke: langer ogivaler Dorn (+Z) + flacher Meißel (−Z)
            const pl = P.pickLen || 0.16;
            g.add(spikeZ(sR * 0.55, pl, 1, cx, rootR * 0.4, m)); // Dorn — Energie auf einen Punkt
            g.add(chiselZ(sR * 0.9, sR * 0.3, P.reach * 1.3 + 0.045, -1, cx, -rootR * 0.4, m)); // Meißel/Adze-Ende
        } else if (P.kopfTyp === "grabeblatt") {
            // Spaten/Schaufel: Tülle+Hals+Blatt als verbundenes Stück
            g.add(grabeBlatt(P, x0, m));
            if (P.tread) {
                const xn = x0 + (P.neckLen || 0.052),
                    ft = 0.14,
                    w = (P.bladeW / 2) * 0.55;
                const cx = xn + P.bladeLen * ft,
                    cy = -(P.bladeLen * Math.sin(P.liftAngle || 0.1)) * ft * ft;
                const bar = B(cx, cy + 0.01, 0, 0.012, 0.004, w, m);
                g.add(bar);
            } // Trittstufe auf der Schulter (Spaten)
        }
        return g;
    }

    // ════════════════════════════════════════════════════════════════════
    // 2 · DAS RÜCKGRAT — Stationen aus den Parametern (eine Quelle)
    // ════════════════════════════════════════════════════════════════════
    function stations(P) {
        if (P.modus === "bogen")
            return { bogen: true, L: (P.riserLen || 0.13) + 2 * (P.limbLen || 0.6), xButt: 0, xTip: 0 };
        const impact = P.modus === "wucht",
            xButt = 0,
            xGrip0 = 0;
        if (impact) {
            const gripLen = P.schaft,
                xGripEnd = gripLen,
                xHead0 = xGripEnd,
                xTip = xHead0 + P.kopfLen;
            return {
                impact,
                xButt,
                xGrip0,
                xGripEnd,
                xHead0,
                xTip,
                xBlade0: xHead0,
                xPoint: xTip,
                L: xTip - xButt,
                gThk: 0,
                pivot: xButt + Math.min(0.16, gripLen * 0.22),
                impactX: xHead0 + P.kopfLen * 0.6,
            };
        } else {
            const gThk = 0.022,
                xGripEnd = P.griff,
                xGuard = xGripEnd,
                xBlade0 = xGuard + gThk,
                xPoint = xBlade0 + P.klinge;
            return {
                impact,
                xButt,
                xGrip0,
                xGripEnd,
                xGuard,
                gThk,
                xBlade0,
                xPoint,
                xTip: xPoint,
                L: xPoint - xButt,
                pivot: xGuard - Math.min(0.05, P.griff * 0.28),
                impactX: xBlade0 + 0.7 * P.klinge,
            };
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // 1 · DIE LEHREN — alles INTEGRIERT aus der Geometrie (GEMESSEN/BEWEIS)
    //   M, Schwerpunkt, Trägheit um die Hand, Stoßmittelpunkt (Stoßzentrum),
    //   effektive Schlagmasse, Hohlkehlen-Gewinn (Iy/A), Grundfrequenz (flach).
    // ════════════════════════════════════════════════════════════════════
    // — Schneidenwinkel β der Klinge (Primär-Schliff, äußeres Drittel) aus dem Schnittgesetz —
    function bladeBeta(P) {
        const fam = P.fam,
            flat = P.flat || 0.45,
            ht = (P.th0 * (1 - (1 - P.thTip) * 0.2)) / 2,
            hw = (P.w0 * (1 - (1 - P.wTip) * 0.2)) / 2;
        const e1 = 0.55,
            e2 = 0.95,
            H1 = halfH(fam, e1 * hw, hw, ht, flat),
            H2 = halfH(fam, e2 * hw, hw, ht, flat);
        const slope = Math.abs((H2 - H1) / ((e2 - e1) * hw));
        return (2 * Math.atan(slope) * 180) / Math.PI;
    }

    // — LAWFUL KOPF-MODELL (Masse, deckungsgleich zur Geometrie): Sockel-Hülse (Ring ums Schaftloch) + eingewurzelte Teile —
    function headModel(P, S) {
        const x0 = S.xHead0,
            L = P.kopfLen,
            sR = P.socketR,
            cx = x0 + L * 0.55;
        const parts = [];
        const topo = {
            guard: false,
            spike: false,
            flange: false,
            poll: false,
            symface: false,
            blunt: false,
            edge: false,
        };
        function socketR(u) {
            return Math.max(P.schaftR * 1.1, sR * (0.82 + 0.18 * Math.sin(Math.PI * u)));
        }
        const rHole = P.schaftR * 1.02;
        let mS = 0,
            mSx = 0;
        const NS = 60,
            steelSocket = P.kopfTyp !== "keule";
        if (steelSocket)
            for (let i = 0; i < NS; i++) {
                const u = (i + 0.5) / NS,
                    r = socketR(u),
                    x = x0 + u * L,
                    dm = RHO.stahl * Math.PI * Math.max(0, r * r - rHole * rHole) * (L / NS);
                mS += dm;
                mSx += dm * x;
            }
        if (P.kopfTyp === "axt" || P.kopfTyp === "maul") {
            topo.edge = true;
            let vol = 0;
            const NF = 12,
                NG = 20;
            for (let i = 0; i < NF; i++)
                for (let j = 0; j < NG; j++) {
                    const a = bitField(i / NF, j / NG, P, sR),
                        b = bitField((i + 1) / NF, j / NG, P, sR),
                        cc = bitField(i / NF, (j + 1) / NG, P, sR),
                        dd = bitField((i + 1) / NF, (j + 1) / NG, P, sR);
                    const cellA = Math.abs((b.xo - a.xo) * (cc.z - a.z) - (b.z - a.z) * (cc.xo - a.xo));
                    vol += cellA * 2 * ((a.t + b.t + cc.t + dd.t) / 4);
                }
            const mW = RHO.stahl * vol;
            parts.push({ x: cx, m: mW, Iself: mW * P.reach * P.reach * 0.12 });
            if (P.backSpike) {
                topo.spike = true;
                parts.push({
                    x: cx,
                    m: RHO.stahl * (1 / 3) * Math.PI * Math.pow(sR * 0.55, 2) * P.reach * 0.85,
                    Iself: 0,
                });
            } else {
                topo.poll = true;
                parts.push({ x: x0 - L * 0.05, m: RHO.stahl * Math.PI * Math.pow(sR * 0.72, 2) * L * 0.3, Iself: 0 });
            }
        } else if (P.kopfTyp === "hammer") {
            topo.blunt = true;
            parts.push({ x: cx, m: RHO.stahl * Math.PI * Math.pow(sR * 0.9, 2) * P.reach * 0.55, Iself: 0 });
            if (P.beak) {
                topo.spike = true;
                parts.push({
                    x: cx,
                    m: RHO.stahl * (1 / 3) * Math.PI * Math.pow(sR * 0.5, 2) * P.reach * 1.15,
                    Iself: 0,
                });
            } else topo.poll = true;
        } else if (P.kopfTyp === "sledge") {
            topo.blunt = true;
            topo.symface = true;
            parts.push({ x: cx, m: RHO.stahl * Math.PI * Math.pow(sR, 2) * L * 0.12 * 2, Iself: 0 });
        } else if (P.kopfTyp === "kolben") {
            topo.flange = true;
            topo.blunt = true;
            const n = P.flangeN || 6,
                plate = (P.flangeLen || L * 0.7) * Math.max(0, P.reach - sR * 0.8) * 0.006,
                mFl = RHO.stahl * plate * n;
            parts.push({ x: cx, m: mFl, Iself: mFl * P.reach * P.reach * 0.2 });
            parts.push({ x: x0 + L + 0.01, m: RHO.stahl * (4 / 3) * Math.PI * Math.pow(sR * 0.5, 3), Iself: 0 });
        } else if (P.kopfTyp === "pick") {
            const pl = P.pickLen || 0.16;
            topo.blunt = true;
            const mD = RHO.stahl * (1 / 3) * Math.PI * Math.pow(sR * 0.55, 2) * pl,
                mC2 = RHO.stahl * (sR * 0.9 * 2) * (sR * 0.3 * 2) * (P.reach * 1.3 + 0.045) * 0.5;
            parts.push({ x: cx, m: mD, Iself: mD * pl * pl * 0.1 });
            parts.push({ x: cx, m: mC2, Iself: 0 });
            if ((P.beta || 40) >= 40) topo.poll = true;
            else topo.spike = true; // stumpfer Stein-Dorn = Werkzeug-Punkt
        } else if (P.kopfTyp === "grabeblatt") {
            topo.blunt = true;
            topo.poll = true; // Grabblatt = Werkzeug
            const mB = RHO.stahl * (P.bladeW || 0.13) * (P.bladeLen || 0.24) * (P.bladeTh || 0.0035);
            parts.push({
                x: cx + (P.bladeLen || 0.24) * 0.4,
                m: mB,
                Iself: mB * Math.pow(P.bladeLen || 0.24, 2) * 0.08,
            });
        } else {
            topo.blunt = true;
            let mC = 0,
                mCx = 0;
            const NC = 50;
            const prof = (u) => sR * (0.62 + 0.95 * Math.sin(Math.PI * Math.min(1, u * 1.05)));
            for (let i = 0; i < NC; i++) {
                const u = (i + 0.5) / NC,
                    r = prof(u),
                    x = x0 + u * L,
                    dm = RHO.holz * Math.PI * r * r * (L / NC);
                mC += dm;
                mCx += dm * x;
            }
            parts.push({ x: mCx / mC, m: mC, Iself: mC * sR * sR * 0.4 });
        }
        return {
            parts,
            socket: { m: mS, x: mS > 0 ? mSx / mS : cx },
            betaDeg: P.kopfTyp === "axt" || P.kopfTyp === "maul" ? P.beta : null,
            topo,
        };
    }

    function measure(P) {
        const S = stations(P);
        const strips = [];
        let topo = {
                guard: false,
                spike: false,
                flange: false,
                poll: false,
                symface: false,
                blunt: false,
                edge: false,
            },
            betaDeg = null;
        if (!S.impact) {
            if (P.knaufR > 0) {
                const rk = P.knaufR,
                    mK = RHO.bronze * (4 / 3) * Math.PI * rk * rk * rk * (P.knaufFill || 0.72);
                strips.push({ x: S.xButt - rk * 0.25, m: mK, Iself: 0.4 * mK * rk * rk });
            }
            const NG = 90,
                dg = P.griff / NG,
                a = Math.PI * 0.013 * 0.013;
            for (let i = 0; i < NG; i++) {
                const x = (i + 0.5) * dg;
                strips.push({ x, m: RHO.griff * a * dg });
            }
            const eg =
                P.guardOverride !== undefined
                    ? P.guardOverride
                    : typeof currentTrad !== "undefined" && currentTrad
                      ? currentTrad.guard
                      : "kreuz";
            if (eg !== "keine" && P.parier > 0) {
                const mG = RHO.stahl * (P.parier * 2 * 0.01 * 0.016);
                strips.push({ x: S.xGuard + S.gThk * 0.5, m: mG, Iself: (mG * (P.parier * 2) * (P.parier * 2)) / 12 });
                topo.guard = true;
            }
            topo.edge = true;
        } else {
            const NG = 90,
                dg = S.xGripEnd / NG,
                a = Math.PI * P.schaftR * P.schaftR;
            for (let i = 0; i < NG; i++) {
                const x = (i + 0.5) * dg;
                strips.push({ x, m: RHO.holz * a * dg });
            }
        }
        let sumA = 0,
            sumIy = 0,
            sumIz = 0;
        const NB = 200;
        if (!S.impact) {
            const db = P.klinge / NB;
            for (let i = 0; i < NB; i++) {
                const t = (i + 0.5) / NB,
                    sec = sectionMoments(sectionAt(t, P)),
                    x = S.xBlade0 + (i + 0.5) * db;
                strips.push({ x, m: RHO.stahl * sec.A * db });
                sumA += sec.A;
                sumIy += sec.Iy;
                sumIz += sec.Iz;
            }
            betaDeg = bladeBeta(P);
        }
        if (S.impact) {
            const H = headModel(P, S);
            if (H.socket.m > 0)
                strips.push({ x: H.socket.x, m: H.socket.m, Iself: H.socket.m * P.socketR * P.socketR * 0.5 });
            for (const pt of H.parts) strips.push(pt);
            betaDeg = H.betaDeg;
            topo = H.topo;
        }
        let M = 0,
            Mx = 0;
        for (const s of strips) {
            M += s.m;
            Mx += s.m * s.x;
        }
        const xcm = Mx / M;
        let I = 0;
        for (const s of strips) {
            I += s.m * (s.x - S.pivot) * (s.x - S.pivot) + (s.Iself || 0);
        }
        const d = xcm - S.pivot,
            xcop = Math.abs(d) > 1e-5 ? S.pivot + I / (M * d) : S.xTip;
        const PoB = (xcm - S.xButt) / S.L,
            Inorm = I / (M * S.L * S.L);
        const mEff = I / Math.pow(S.impactX - S.pivot, 2);
        const presence = (S.impact ? P.kopfLen : P.klinge) / S.L;
        let idx = 1.0,
            f1 = 0,
            distal = S.impact ? 1 : P.thTip;
        if (!S.impact && sumA > 0) {
            const ref = { ...P, fuller: 0, fam: "linse", single: false };
            let rA = 0,
                rIy = 0;
            for (let i = 0; i < 50; i++) {
                const t = (i + 0.5) / 50,
                    sec = sectionMoments(sectionAt(t, ref));
                rA += sec.A;
                rIy += sec.Iy;
            }
            idx = sumIy / sumA / (rIy / rA);
            const E = 210e9,
                meanIz = sumIz / NB,
                meanA = sumA / NB,
                mu = RHO.stahl * meanA;
            f1 = (((4.73 * 4.73) / (2 * Math.PI)) * Math.sqrt((E * meanIz) / mu)) / (P.klinge * P.klinge);
        }
        const gripLen = S.impact ? S.xGripEnd : P.griff,
            gripSpan = gripLen / 0.105;
        const ws = (P.task && P.task.werkstoff) || P.werkstoff || "stahl";
        const edgeWinkel = betaDeg != null ? edgeBeta(ws, kantenLast(P)) : null; // ECHTE Schneidenfase (σ_y/K_IC-Boden), ≠ Sektions-Taper
        const gD = griffD(intentControl(P)),
            griffDmm = gD * 1000,
            greifPct = greifkraft(gD) * 100; // ANTHROPOS-Greifer-Kontakt
        const ham = betaDeg != null ? hamonGesetz(P) : null; // differenzielle Härtung (geschärfte Klingen)
        return {
            S,
            M,
            xcm,
            xcop,
            PoB,
            Inorm,
            xcopL: (xcop - S.xButt) / S.L,
            mEffFrac: mEff / M,
            presence,
            distal,
            idx,
            gripSpan,
            f1,
            betaDeg,
            edgeWinkel,
            griffDmm,
            greifPct,
            ham,
            topo,
        };
    }

    // — Bänder je Absicht (geerdet an Messwerten der Archetypen) —
    const BANDS = {
        PoB: { hieb: [0.26, 0.42], stich: [0.12, 0.28], schlag: [0.55, 0.86], spalten: [0.6, 0.9], nutz: [0.2, 0.55] },
        Inorm: {
            hieb: [0.05, 0.12],
            stich: [0.03, 0.08],
            schlag: [0.12, 0.55],
            spalten: [0.2, 0.6],
            nutz: [0.04, 0.2],
        },
        CoP: { hieb: [0.62, 0.86], stich: [0.55, 1.15], schlag: [0.66, 1.14], spalten: [0.66, 1.16], nutz: [0.5, 1.2] },
        mEff: { hieb: [0.12, 0.3], stich: [0.06, 0.18], schlag: [0.25, 0.9], spalten: [0.4, 0.95], nutz: [0.08, 0.4] },
        distal: { hieb: [0.2, 0.62], stich: [0.2, 0.6], schlag: [0, 2], spalten: [0, 2], nutz: [0.2, 0.66] },
        pres: {
            hieb: [0.7, 0.86],
            stich: [0.78, 0.9],
            schlag: [0.13, 0.46],
            spalten: [0.13, 0.46],
            nutz: [0.55, 0.92],
        },
        idx: { hieb: [1.1, 2.2], stich: [0.8, 2.4], schlag: [0.7, 2.6], spalten: [0.7, 2.6], nutz: [0.6, 2.4] },
        grip: { hieb: [1.3, 2.7], stich: [1.0, 2.1], schlag: [2.5, 11], spalten: [3.5, 11], nutz: [0.7, 2.2] },
        beta: { hieb: [16, 26], stich: [18, 30], schlag: [0, 90], spalten: [36, 56], nutz: [16, 26] },
        grD: { hieb: [26, 38], stich: [23, 32], schlag: [30, 40], spalten: [30, 40], nutz: [24, 36] },
        grK: { hieb: [86, 100], stich: [80, 100], schlag: [92, 100], spalten: [92, 100], nutz: [84, 100] },
        hHRC: { hieb: [55, 63], stich: [55, 63], schlag: [54, 62], spalten: [52, 60], nutz: [54, 62] },
        hZone: { hieb: [22, 50], stich: [18, 42], schlag: [30, 52], spalten: [30, 55], nutz: [20, 48] },
    };
    function bandFor(key, intent) {
        return BANDS[key][intent] || BANDS[key].hieb;
    }
    const LEHREN = [
        {
            id: "PoB",
            lab: "Balance-Punkt",
            unit: "·L",
            key: "PoB",
            na: () => false,
            fn: (m) => m.PoB,
            hint: "Schwerpunkt ab Knauf ÷ Länge. Vorn = Energie/Wucht. An der Hand = Kontrolle/agil. Der Knauf ist das Gegengewicht.",
        },
        {
            id: "Inorm",
            lab: "Trägheit (Handlichkeit)",
            unit: "",
            key: "Inorm",
            na: () => false,
            fn: (m) => m.Inorm,
            hint: "I um die Hand ÷ (M·L²), dimensionslos. Klein = schnell anschwingen/stoppen. Groß = träge, aber wuchtig.",
        },
        {
            id: "CoP",
            lab: "Stoßmittelpunkt",
            unit: "·L",
            key: "CoP",
            na: () => false,
            fn: (m) => m.xcopL,
            hint: "Stoßzentrum (konjugierter Punkt). Treffer hier → kein Schlag in die Hand. Soll im Treffbereich liegen.",
        },
        {
            id: "mEff",
            lab: "Schlagmasse",
            unit: "·M",
            key: "mEff",
            na: () => false,
            fn: (m) => m.mEffFrac,
            hint: "Effektive Masse am Treffpunkt ÷ Gesamtmasse. Höher = härterer Schlag. Wucht-Waffen leben davon.",
        },
        {
            id: "distal",
            lab: "Distale Verjüngung ⚖",
            unit: "",
            key: "distal",
            na: (m) => m.S.impact,
            fn: (m) => m.distal,
            hint: "Spitzen-Dicke ÷ Basis-Dicke. MUSS <1 — sonst ein Barren (Attrappe!). Das ist die Anti-Attrappe-Lehre.",
        },
        {
            id: "pres",
            lab: "Klingen-Präsenz",
            unit: "",
            key: "pres",
            na: () => false,
            fn: (m) => m.presence,
            hint: "Arbeitsteil (Klinge bzw. Kopf) ÷ Gesamtlänge. Lang = mehr Schneide. Kurz = mehr Hebel/Griff.",
        },
        {
            id: "idx",
            lab: "Hohlkehlen-Wirkung",
            unit: "×",
            key: "idx",
            na: (m) => m.S.impact,
            fn: (m) => m.idx,
            hint: "Schnitt-Steifigkeit/Masse ÷ Voll-Linse. Hohlkehle = I-Träger: leichter bei erhaltener Schnitt-Steife (>1 = Gewinn).",
        },
        {
            id: "grip",
            lab: "Griff-Spanne",
            unit: "Hände",
            key: "grip",
            na: () => false,
            fn: (m) => m.gripSpan,
            hint: "Grifflänge ÷ Handbreite (~10,5 cm). ~1 = einhändig · ~1,5 = Anderthalbhänder · >2 = beidhändig.",
        },
        {
            id: "beta",
            lab: "Schneidenfase β",
            unit: "°",
            key: "beta",
            na: (m) => m.edgeWinkel == null,
            fn: (m) => m.edgeWinkel,
            hint: "ECHTE Schneidenfase aus der plastischen Grenze (σ_y rollt) + Splitter-Grenze (K_IC) — getrennt vom Sektions-Taper. Schwert akut ~20°, Spaltkeil stumpf ~45°. Aus dem Material, nicht der Silhouette.",
        },
        {
            id: "grD",
            lab: "Griffdurchmesser ✋",
            unit: "mm",
            key: "grD",
            na: (m) => (m.S.impact ? false : false),
            fn: (m) => m.griffDmm,
            hint: "ANTHROPOS: aus dem Kontakt Hand×Werkzeug. Optimum ~33 mm (Sehnen-Kraft-Längen). Wucht will dick, Finesse schlank (Handgelenk-Beweglichkeit).",
        },
        {
            id: "grK",
            lab: "Greifkraft ✋",
            unit: "%",
            key: "grK",
            na: () => false,
            fn: (m) => m.greifPct,
            hint: "Erreichbare Greifkraft bei diesem Durchmesser (umgedrehte Parabel). Der Rapier opfert sie für Spitzenkontrolle — genau der reale Tausch.",
        },
        {
            id: "hHRC",
            lab: "Schneiden-Härte HRC",
            unit: "",
            key: "hHRC",
            na: (m) => !(m.ham && m.ham.visible),
            fn: (m) => (m.ham ? m.ham.edgeHRC : 0),
            hint: "Differenzielle Härtung: harte Schneide (Martensit ~HRC60) hält die Fase, zäher Rücken (Perlit ~HRC40) fängt den Schock. Durchgehärtet splittert, durchweich rollt — nur das Gefälle erfüllt BEIDE Grenzen. Bronze (kein Kohlenstoff) kann es nicht.",
        },
        {
            id: "hZone",
            lab: "Gehärtete Zone (Hamon)",
            unit: "%",
            key: "hZone",
            na: (m) => !(m.ham && m.ham.visible),
            fn: (m) => (m.ham ? m.ham.h * 100 : 0),
            hint: "Höhe der gehärteten Zone (Yakiba) als Anteil der Klingenbreite — die Grenze ist der Hamon, der Ort wo σ_y dem K_IC weicht. Fällt aus Last und Werkstoff, nicht aus dem Pinsel.",
        },
    ];
    function evalLehren(P) {
        const m = measure(P),
            intent = P.intent;
        return LEHREN.map((L) => {
            const na = L.na(m);
            if (na) return { L, v: 0, st: "na", band: [0, 1] };
            const v = L.fn(m),
                band = bandFor(L.key, intent),
                [lo, hi] = band,
                bw = hi - lo;
            let st = "pass";
            if (L.id === "distal") {
                st = v <= 0.62 ? "pass" : v <= 0.78 ? "warn" : "fail";
            } // Attrappe-Sonderregel
            else if (v < lo - bw * 0.2 || v > hi + bw * 0.2) st = "fail";
            else if (v < lo || v > hi) st = "warn";
            return { L, v, st, band };
        });
    }
    // — BEFUND: Schneidenregime + Ökonomie + Hand-Topologie → Waffe/Werkzeug (gemessen, unabhängig von der Absicht) —
    function befund(P, m) {
        let w = 0;
        const t = m.topo,
            b = m.betaDeg,
            imp = m.S.impact;
        const reg = [];
        if (t.edge && b != null) {
            if (b > 45) {
                w -= 0.55;
                reg.push("Keil/Spalten β" + b.toFixed(0) + "°");
            } else if (b < 33) {
                w += 0.1;
                reg.push("schneidend β" + b.toFixed(0) + "°");
            } else {
                w -= 0.05;
                reg.push("robust β" + b.toFixed(0) + "°");
            }
        } else if (t.blunt) {
            reg.push("stumpf/Fläche");
        }
        if (m.Inorm < 0.3 && m.mEffFrac < 0.55) {
            w += 0.15;
            reg.push("erholend");
        } else if (m.Inorm > 0.5 && m.mEffFrac > 0.82) {
            w -= 0.15;
            reg.push("reine Wucht");
        }
        if (t.guard) {
            w += 0.55;
            reg.push("Handschutz");
        }
        if (t.spike || t.flange) {
            w += 0.5;
            reg.push(t.spike ? "Dorn/Beak" : "Flansche");
        }
        if (t.poll || t.symface) {
            w -= 0.5;
            reg.push(t.symface ? "Doppelbahn" : "Treib-Nacken");
        }
        if (!imp && m.S.L > 0.7) {
            w += 0.2;
            reg.push("Kampfreichweite");
        }
        if (!imp && !t.guard && m.S.L < 0.5) {
            w -= 0.35;
            reg.push("führungslos & kurz");
        }
        if (imp && m.S.L < 0.55) w -= 0.25;
        if (!imp && m.S.L < 0.4) w -= 0.15;
        return { w, v: w > 0.22 ? "KRIEGSWAFFE" : w < -0.22 ? "WERKZEUG" : "HYBRID", reg };
    }

    // — Regler (analog, mit Gesetz) —
    const PARAMS_BLADE = [
        {
            id: "klinge",
            lab: "Klingenlänge",
            min: 0.18,
            max: 1.25,
            step: 0.005,
            grp: "KLINGE",
            law: "Spitze = Parier + Länge · setzt Präsenz & Hebel",
        },
        {
            id: "w0",
            lab: "Klingenbreite (Basis)",
            min: 0.014,
            max: 0.06,
            step: 0.001,
            grp: "KLINGE",
            law: "halbe Breite hw = w0/2 → Schnittfläche",
        },
        {
            id: "wTip",
            lab: "Profil-Verjüngung",
            min: 0.1,
            max: 1.0,
            step: 0.01,
            grp: "KLINGE",
            law: "Spitzenbreite ÷ Basis → Spitzen-Geometrie",
        },
        {
            id: "th0",
            lab: "Rücken-Dicke (Basis)",
            min: 0.003,
            max: 0.011,
            step: 0.0002,
            grp: "KLINGE",
            law: "halbe Dicke ht = th0/2 → Steifigkeit",
        },
        {
            id: "thTip",
            lab: "Distale Verjüngung ⚖",
            min: 0.15,
            max: 0.95,
            step: 0.01,
            grp: "KLINGE",
            law: "Spitzen-Dicke ÷ Basis · <1 = echte Klinge (Anti-Attrappe)",
        },
        {
            id: "fuller",
            lab: "Hohlkehle (Tiefe)",
            min: 0,
            max: 0.8,
            step: 0.01,
            grp: "SCHLIFF",
            law: "Rinne im Steg → I-Träger: leichter, Schnitt-Steife bleibt",
        },
        {
            id: "fullerW",
            lab: "Hohlkehle (Breite)",
            min: 0.2,
            max: 0.85,
            step: 0.01,
            grp: "SCHLIFF",
            law: "Stegbreite ÷ Klingenbreite",
        },
        {
            id: "kruemmung",
            lab: "Krümmung (Sori)",
            min: 0,
            max: 0.2,
            step: 0.005,
            grp: "SCHLIFF",
            law: "Mittellinie biegt → Säbel/Shamshir-Bogen",
        },
        {
            id: "griff",
            lab: "Grifflänge",
            min: 0.08,
            max: 0.46,
            step: 0.005,
            grp: "GRIFF & KNAUF",
            law: "÷ Handbreite → ein-/anderthalb-/beidhändig",
        },
        {
            id: "knaufR",
            lab: "Knauf-Radius",
            min: 0.01,
            max: 0.04,
            step: 0.001,
            grp: "GRIFF & KNAUF",
            law: "Gegengewicht: zieht den Balance-Punkt zur Hand",
        },
        {
            id: "parier",
            lab: "Parier-Breite",
            min: 0.04,
            max: 0.34,
            step: 0.005,
            grp: "GRIFF & KNAUF",
            law: "halbe Spannweite der Parierstange",
        },
    ];
    const PARAMS_IMPACT = [
        {
            id: "schaft",
            lab: "Schaftlänge",
            min: 0.25,
            max: 1.4,
            step: 0.01,
            grp: "SCHAFT",
            law: "Hebel: lang = Wucht & Reichweite, träger Schwung",
        },
        {
            id: "schaftR",
            lab: "Schaft-Radius",
            min: 0.01,
            max: 0.026,
            step: 0.001,
            grp: "SCHAFT",
            law: "Holzschaft-Querschnitt → Schaftmasse",
        },
        {
            id: "kopfLen",
            lab: "Auge-Länge",
            min: 0.06,
            max: 0.3,
            step: 0.005,
            grp: "KOPF",
            law: "Längs-Ausdehnung des Sockels (Auge)",
        },
        {
            id: "socketR",
            lab: "Auge-Radius (Nabe)",
            min: 0.014,
            max: 0.045,
            step: 0.001,
            grp: "KOPF",
            law: "Wange ums Schaftloch · Masse ∝ (R²−Loch²) · umschließt den Schaft",
        },
        {
            id: "beta",
            lab: "Schneidenwinkel β",
            min: 18,
            max: 70,
            step: 1,
            grp: "SCHNEIDE (Axt/Maul)",
            law: "Keilwinkel: spitz=schneiden, stumpf=spalten · formt Keil UND Masse UND Befund",
        },
        {
            id: "reach",
            lab: "Reichweite",
            min: 0.04,
            max: 0.16,
            step: 0.002,
            grp: "SCHNEIDE (Axt/Maul)",
            law: "radiale Reichweite der Schneide/Bahn/Dorn ab Schaftachse",
        },
        {
            id: "edgeLen",
            lab: "Schneidenlänge",
            min: 0.05,
            max: 0.18,
            step: 0.005,
            grp: "SCHNEIDE (Axt/Maul)",
            law: "Länge der Schneide entlang Schaft (Bart)",
        },
    ];

    const GATTUNGEN = {
        Langschwert: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.5, zug: 0.0, ziel: "fleisch", laenge: 0.95 },
            griff: 0.24,
            knaufR: 0.021,
            parier: 0.11,
        }, // ausgewogen hauen+stechen
        Säbel: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.22, zug: 0.85, ziel: "fleisch", laenge: 0.83 },
            griff: 0.15,
            knaufR: 0.019,
            parier: 0.09,
        }, // Zug-Schnitt → gebogen, einschneidig
        Degen: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.95, zug: 0.0, ziel: "maille", laenge: 1.06 },
            griff: 0.16,
            knaufR: 0.024,
            parier: 0.1,
        }, // reines Stechen → schmal, steif, Raute
        Großschwert: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.4, zug: 0.0, ziel: "fleisch", laenge: 1.16 },
            griff: 0.42,
            knaufR: 0.024,
            parier: 0.2,
        }, // lang, breit, hauen
        Dolch: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.72, zug: 0.0, ziel: "fleisch", laenge: 0.24 },
            griff: 0.11,
            knaufR: 0.016,
            parier: 0.06,
        }, // kurz, stechen+schneiden
        Messer: {
            modus: "klinge",
            task: { art: "klinge", stich: 0.18, zug: 0.3, ziel: "holz", laenge: 0.2 },
            griff: 0.12,
            knaufR: 0.01,
            parier: 0.02,
            guardOverride: "keine",
            tool: true,
        }, // Nutzschnitt → dünn, einschneidig
        Langbogen: { modus: "bogen", task: { art: "bogen", auszug: 0.95, zugkraft: 1.05, material: "eibe" } }, // langer Auszug, Eibe, gerade
        Kriegsbogen: { modus: "bogen", task: { art: "bogen", auszug: 0.9, zugkraft: 1.55, material: "eibe" } }, // schwerer Kriegs-Langbogen
        Reiterbogen: { modus: "bogen", task: { art: "bogen", auszug: 0.45, zugkraft: 0.75, material: "horn_sehne" } }, // kurz, Recurve, Komposit
        Recurvebogen: { modus: "bogen", task: { art: "bogen", auszug: 0.7, zugkraft: 0.95, material: "holz" } }, // mittel, Recurve
        Streitkolben: {
            modus: "wucht",
            intent: "schlag",
            schaft: 0.58,
            schaftR: 0.016,
            kopfTyp: "kolben",
            kopfLen: 0.12,
            socketR: 0.022,
            reach: 0.052,
            flangeN: 6,
            flangeLen: 0.085,
            backSpike: false,
            beak: false,
            beta: 30,
            edgeLen: 0.1,
        },
        Kriegsaxt: {
            modus: "wucht",
            intent: "schlag",
            kopfTyp: "axt",
            task: { art: "keil", ziel: "fleisch", quer: 0.92, last: 0.4, hart: 0.15 },
            backSpike: true,
            beak: false,
        }, // Fleisch quer trennen → scharf, schlank, schnell
        Kriegshammer: {
            modus: "wucht",
            intent: "schlag",
            schaft: 0.68,
            schaftR: 0.017,
            kopfTyp: "hammer",
            kopfLen: 0.1,
            socketR: 0.024,
            reach: 0.058,
            beak: true,
            backSpike: false,
            beta: 30,
            edgeLen: 0.1,
        },
        Keule: {
            modus: "wucht",
            intent: "schlag",
            schaft: 0.42,
            schaftR: 0.02,
            kopfTyp: "keule",
            kopfLen: 0.26,
            socketR: 0.046,
            beta: 30,
            reach: 0.06,
            edgeLen: 0.1,
            backSpike: false,
            beak: false,
        },
        Fällaxt: {
            modus: "wucht",
            intent: "schlag",
            kopfTyp: "axt",
            task: { art: "keil", ziel: "holz", quer: 0.82, last: 0.55 },
            backSpike: false,
            beak: false,
            tool: true,
        }, // Holz quer fällen (hauen, nicht spalten) → schlank, eindringend, Schneide ~27°
        Spaltmaul: {
            modus: "wucht",
            intent: "spalten",
            kopfTyp: "maul",
            task: { art: "keil", ziel: "holz", quer: 0.12, last: 0.9 },
            backSpike: false,
            beak: false,
            tool: true,
        }, // Holz längs spalten → klobig, schwer, stumpf
        Vorschlaghammer: {
            modus: "wucht",
            intent: "schlag",
            schaft: 0.82,
            schaftR: 0.027,
            kopfTyp: "sledge",
            kopfLen: 0.16,
            socketR: 0.04,
            reach: 0.0,
            beta: 30,
            edgeLen: 0.1,
            backSpike: false,
            beak: false,
            tool: true,
        },
        Beil: {
            modus: "wucht",
            intent: "spalten",
            kopfTyp: "axt",
            task: { art: "keil", ziel: "holz", quer: 0.78, last: 0.2, klein: true },
            backSpike: false,
            beak: false,
            tool: true,
        }, // Einhand-Holz → schlank, kompakt
        Spitzhacke: {
            modus: "wucht",
            intent: "spalten",
            kopfTyp: "pick",
            task: { art: "pick", ziel: "stein", last: 0.6 },
            backSpike: false,
            beak: false,
            tool: true,
        }, // Stein absprengen → Dorn auf einen Punkt
        Spaten: {
            modus: "wucht",
            intent: "spalten",
            kopfTyp: "grabeblatt",
            task: { art: "graben", ziel: "erde", heben: 0.1 },
            backSpike: false,
            beak: false,
            tool: true,
        }, // Erde stechen+trennen → schmal, flach, Trittkante
        Schaufel: {
            modus: "wucht",
            intent: "spalten",
            kopfTyp: "grabeblatt",
            task: { art: "graben", ziel: "erde", heben: 0.9 },
            backSpike: false,
            beak: false,
            tool: true,
        }, // loses Material schöpfen → breit, konkav
    };
    // — Traditionen: jetzt GENERATIVE FORM-REGLER (orthogonale Design-Sprachen, die die Gattungs-Basis biegen) —
    //   Möblierung (pommel/guard/wrap/accent/fam/single/curveBias) + FORM-Multiplikatoren:
    //   breite·dicke (Querschnitt) · taper(wTip)·distal(thTip) (Verjüngung, distal bleibt<1) · kehle(Hohlkehle) · laenge(klinge) · betaFlat(β-Bias) · headBulk·betaMul (Wucht-Kopf)
    const TRADITIONEN = {
        Frank: {
            pommel: "scheibe",
            guard: "kreuz",
            wrap: "leder",
            accent: "messing",
            fam: "sechs",
            single: false,
            curveBias: 0.0,
            breite: 1.0,
            dicke: 1.0,
            taper: 1.0,
            distal: 1.0,
            kehle: 1.0,
            laenge: 1.0,
            betaFlat: 0.0,
            headBulk: 1.0,
            betaMul: 1.0,
        }, // ausgewogen: tiefe Kehle, Kreuz, Radknauf
        Nihon: {
            pommel: "kashira",
            guard: "scheibe",
            wrap: "ito",
            accent: "eisen",
            fam: "linse",
            single: true,
            curveBias: 0.06,
            breite: 0.82,
            dicke: 0.9,
            taper: 1.12,
            distal: 1.05,
            kehle: 0.0,
            laenge: 1.02,
            betaFlat: -0.12,
            headBulk: 0.88,
            betaMul: 0.9,
        }, // schlank, Grat statt Kehle, spitz, gebogen
        Pars: {
            pommel: "kugel",
            guard: "kreuz",
            wrap: "leder",
            accent: "stahl",
            fam: "linse",
            single: true,
            curveBias: 0.07,
            breite: 0.74,
            dicke: 0.86,
            taper: 0.62,
            distal: 0.78,
            kehle: 0.4,
            laenge: 1.16,
            betaFlat: -0.1,
            headBulk: 0.82,
            betaMul: 0.94,
        }, // sehr schlank, stark distal, lang, Nadel
        Urvolk: {
            pommel: "kugel",
            guard: "keine",
            wrap: "leder",
            accent: "bronze",
            fam: "linse",
            single: false,
            curveBias: 0.0,
            breite: 1.18,
            dicke: 1.22,
            taper: 1.05,
            distal: 1.08,
            kehle: 0.0,
            laenge: 0.86,
            betaFlat: 0.08,
            headBulk: 1.22,
            betaMul: 1.12,
        }, // gedrungen, dick, roh, kurz, massiger Kopf
        Brut: {
            pommel: "fass",
            guard: "langetten",
            wrap: "rau",
            accent: "schwarzstahl",
            fam: "flach",
            single: false,
            curveBias: 0.0,
            breite: 1.32,
            dicke: 1.48,
            taper: 1.14,
            distal: 1.14,
            kehle: 0.0,
            laenge: 0.92,
            betaFlat: 0.15,
            headBulk: 1.36,
            betaMul: 1.26,
        }, // breit, sehr dick, kaum Verjüngung, stumpf, klotziger Kopf
    };
    // ── snapBases: friert die Gattungs-Originale ein (Basis für die Regler, kein Kompoundieren) ──
    function snapBases(P) {
        P._kBase = P.kruemmung || 0;
        P._w0B = P.w0;
        P._th0B = P.th0;
        P._wTipB = P.wTip;
        P._thTipB = P.thTip;
        P._fullerB = P.fuller || 0;
        P._klingeB = P.klinge;
        P._flatB = P.flat || 0.45;
        P._reachB = P.reach;
        P._socketB = P.socketR;
        P._kopfB = P.kopfLen;
        P._betaB = P.beta;
    }
    // ── shapeByTradition: DIE ZWEITE ACHSE — Tradition × Gattung biegt die Form. Reine Funktion (UI + headless). ──
    function shapeByTradition(P, T) {
        const cl = (v, a, b) => Math.max(a, Math.min(b, v));
        if (P.modus === "bogen") return;
        if (P.modus === "klinge") {
            if (!P.task) {
                P.fam = T.fam;
                P.single = T.single;
            } // mit Aufgabe besitzt das Gesetz Familie/Schneiden; Tradition gibt Proportion+Krümmung+Möbel
            P.kruemmung = cl((P._kBase || 0) + (T.curveBias || 0), 0, 0.22);
            P.w0 = cl(P._w0B * (T.breite || 1), 0.012, 0.078);
            P.th0 = cl(P._th0B * (T.dicke || 1), 0.0025, 0.014);
            P.wTip = cl(P._wTipB * (T.taper || 1), 0.08, 1.0);
            P.thTip = cl(P._thTipB * (T.distal || 1), 0.12, 0.94); // <1 erzwungen → Anti-Attrappe bleibt
            P.fuller = cl((P._fullerB || 0) * (T.kehle !== undefined ? T.kehle : 1), 0, 0.85);
            P.klinge = cl(P._klingeB * (T.laenge || 1), 0.12, 1.45);
            P.flat = cl((P._flatB || 0.45) + (T.betaFlat || 0), 0.22, 0.74); // β-Bias: flacher → stumpfer
        } else {
            // Wucht: der Kopf
            P.reach = (P._reachB || 0) * (T.headBulk || 1);
            P.socketR = cl((P._socketB || 0.02) * (1 + ((T.headBulk || 1) - 1) * 0.55), 0.012, 0.062);
            P.kopfLen = (P._kopfB || 0.1) * (1 + ((T.headBulk || 1) - 1) * 0.35);
            if (P._betaB !== undefined) P.beta = cl(P._betaB * (T.betaMul || 1), 16, 72);
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS GESETZ DER WERKZEUGFORM — Form EMERGIERT aus der Aufgabe, nicht aus Hand-Zahlen.
    //   Keil-Mechanik (Holz ist anisotrop: längs schwach, quer stark):
    //   quer∈[0,1]  1 = Fasern QUER durchschneiden · 0 = Fasern LÄNGS auseinanderspalten
    //     schneiden  → scharfer Grat (klein β), schlanke Wange (geringer Eindring-Widerstand, dringt tief)
    //     spalten    → stumpfer Keil (groß β, mehr Seitenkraft), dicke Wange (drängt Hälften weg), Masse (Trägheit)
    //   last  = Schwung/Hand (schwer+zweihändig → langer Schaft, mehr Masse)
    //   hart  = Zielhärte (Stein/Knochen → stumpfer, robuster)   klein = Einhand-Skalierung
    // ════════════════════════════════════════════════════════════════════
    // ── Materialkonstanten: GEMESSEN, nicht an die Wunschform gefittet (Reibung Ziel↔Stahl, Zielhärte 0..1) ──
    const ZIELMAT = {
        holz: { mu: 0.35, hart: 0.2, spalt: 0.85 },
        fleisch: { mu: 0.22, hart: 0.05, spalt: 0.1 },
        stein: { mu: 0.5, hart: 0.9, spalt: 0.45 },
        erde: { mu: 0.4, hart: 0.3, spalt: 0.3 },
        knochen: { mu: 0.3, hart: 0.7, spalt: 0.35 },
        maille: { mu: 0.3, hart: 0.78, spalt: 0.05 },
    }; // mu=Reibung, hart=Härte, spalt=Spalt-Anisotropie (wie leicht längs spaltbar)
    // ── WERKSTOFF des Werkzeugs: GEMESSENE Konstanten (Dichte, Härte = Fähigkeit, eine dünne Kante zu halten) ──
    const WERKSTOFF = {
        stahl: { rho: 7850, haerte: 0.62 },
        eisen: { rho: 7870, haerte: 0.45 },
        bronze: { rho: 8600, haerte: 0.38 },
        stein: { rho: 2600, haerte: 0.25 },
    };
    function tradWerkstoff(T) {
        const a = T && T.accent;
        return a === "bronze" ? "bronze" : a === "eisen" ? "eisen" : "stahl";
    } // die Kultur-Metalle koppeln an die Material-Gesetze
    // ── BOGENMAT: elastische Konstanten der Wurfarm-Materialien (E=Steifigkeit, dehnung=max Biegung vor Bruch) ──
    const BOGENMAT = {
        holz: { E: 1.0, dehnung: 1.0, rho: 720 },
        eibe: { E: 0.85, dehnung: 1.35, rho: 670 },
        horn_sehne: { E: 1.35, dehnung: 1.8, rho: 1050 },
    };
    // ════ DAS FUNDAMENT — {E, σ_y, K_IC, ρ} real (SI). Härte=3σ_y (Tabor). Resilienz=σ_y²/2E. ════
    const MAT = {
        stahl: {
            E: 210e9,
            sigY: 1100e6,
            sigYhard: 1900e6,
            KIC: 45e6,
            KIChard: 18e6,
            carbon: 1.0,
            rho: 7850,
            alpha: 1.0,
        },
        eisen: {
            E: 200e9,
            sigY: 280e6,
            sigYhard: 520e6,
            KIC: 90e6,
            KIChard: 55e6,
            carbon: 0.25,
            rho: 7870,
            alpha: 0.7,
        },
        bronze: {
            E: 110e9,
            sigY: 350e6,
            sigYhard: 350e6,
            KIC: 35e6,
            KIChard: 35e6,
            carbon: 0.0,
            rho: 8600,
            alpha: 0.4,
        },
    };
    const hrc = (sy) => Math.round(40 + (sy / 1e6 - 1100) / 40); // geeicht: 1100 MPa→HRC40, 1900→HRC60
    // ════ DIFFERENZIELLE HÄRTUNG — K_IC als volle zweite Achse, der Hamon als EMERGENTE Grenze ════
    //   σ_y (hält die Fase) und K_IC (fängt den Schock) im Konflikt: Martensit hart+spröde, Perlit weich+zäh.
    //   Eine gleichförmige Klinge kann nicht beides → Ungleichförmigkeit ist die EINZIGE Lösung. Der Hamon ist
    //   die Grenze, wo das optimale lokale Material vom σ_y- ins K_IC-Regime kippt. Auslesung, keine Dekoration.
    function hamonGesetz(P) {
        const ws = (P.task && P.task.werkstoff) || P.werkstoff || "stahl",
            m = MAT[ws] || MAT.stahl;
        const impact = kantenLast(P),
            need = Math.min(1, impact * 1.4),
            canHarden = m.carbon;
        const hamon = canHarden * Math.max(0, need); // 0 = kein Hamon (Bronze: carbon=0)
        const brittleLimit = (m.KIChard || m.KIC) / MAT.stahl.KIC;
        let h = (0.18 + need * 0.3) * (0.6 + brittleLimit * 0.8);
        h = Math.max(0, Math.min(0.55, h)) * (canHarden > 0 ? 1 : 0); // gehärtete Fraktion
        const edgeHRC = hamon > 0.05 ? hrc(m.sigYhard || m.sigY) : hrc(m.sigY),
            spineHRC = hrc(m.sigY);
        const sori = hamon * h * (m.alpha || 1) * 0.6; // Sori: Krümmung aus diff. Kontraktion (emergent)
        return { hamon, h, edgeHRC, spineHRC, sori, canHarden, visible: hamon > 0.05 };
    }
    // VERTRAGS-AKT V18.489: matHaerte/matResilienz (3·sigY bzw. sigY²/2E)
    // fielen GANZ — nie intern gerufen, nie extern konsumiert (Zensus-Zeile
    // "Tote Kern-Exporte", 0 Treffer repo-weit; Lehre 3: Def+Export in EINER
    // Welle). Die Formeln traegt die git-Chronik.
    function MATof(ws) {
        return MAT[ws] || MAT.stahl;
    }
    function edgeBeta(ws, edgeLoad) {
        const m = MATof(ws),
            sN = m.sigY / MAT.stahl.sigY,
            kN = m.KIC / MAT.stahl.KIC;
        return Math.max(14, Math.min(60, 15 + 14 * (edgeLoad / sN) + 5 * (edgeLoad / kN)));
    }
    function kantenLast(P) {
        const z = P.task ? P.task.ziel : P.ziel || "holz",
            zm = ZIELMAT[z] || ZIELMAT.holz,
            art = P.task ? P.task.art : null;
        let impact;
        if (P.intent === "spalten") impact = 1.35;
        else if (art === "keil" || P.modus === "wucht") impact = 0.85;
        else if (P.intent === "stich") impact = 0.16;
        else impact = 0.4; // Stechen<Schneiden<Hauen(Axt)<Spalten
        let load = impact * (0.45 + zm.hart * 0.8);
        if (P.intent === "spalten" && zm.spalt > 0.6) load += zm.spalt * 0.55; // Keil spreizt: Spalt-Anisotropie als Querlast — NUR beim Spalten
        return load;
    }
    // ════ ANTHROPOS — zweite Materialtabelle: Körper als Greifer (geeicht: Optimum 33mm, Handbreite 88mm) ════
    const ANTHROPOS = {
        // VERTRAGS-AKT 18.07.: handBreadth/handLength/wristNodeFrac sind
        // GESTRICHEN (0 Leser — Def-only); gripOptD/gripSpread leben intern
        // (greifkraft/griffD → measure.greifPct). Der ANTHROPOS-Export fiel
        // mit (0 externe Leser — die Maschine bleibt intern lebendig).
        gripOptD: 0.034,
        gripSpread: 0.024,
    };
    const greifkraft = (D) => Math.max(0, 1 - Math.pow((D - ANTHROPOS.gripOptD) / ANTHROPOS.gripSpread, 2));
    function griffD(control) {
        return ANTHROPOS.gripOptD - control * 0.01;
    }
    function intentControl(P) {
        return { schlag: 0.0, spalten: 0.05, hieb: 0.45, nutz: 0.5, stich: 0.9 }[P.intent] ?? 0.4;
    }
    // VERTRAGS-AKT V18.489: pobZiel (Point-of-Balance-Ziel je Absicht) fiel
    // GANZ — nie intern gerufen, nie extern konsumiert (Zensus-Zeile "Tote
    // Kern-Exporte"). Die Tabelle traegt die git-Chronik.
    // ── GESCHLOSSENES GESETZ für den Keilwinkel — kein Loop, die Regime-Optima konvergieren analytisch ──
    //   β_split: der Keil muss die Selbsthemmung überschreiten (Reibungswinkel φ=atan μ) und beim Zurückfedern den Riss öffnen → β ≈ 2·k·φ
    //   β_cut:   kleinster Winkel, den die Schneide unter Schlag überlebt (Kantenfestigkeit: härterer Stahl dünner, härteres Ziel robuster)
    //   Eine gemischte Aufgabe sitzt auf der Kompromiss-Linie zwischen beiden Regime-Optima → quer interpoliert, die ENDEN kommen aus der Physik.
    function betaFromMechanik(quer, ziel, hartStahl) {
        const m = ZIELMAT[ziel] || ZIELMAT.holz,
            hs = hartStahl !== undefined ? hartStahl : 0.6;
        const phi = (Math.atan(m.mu) * 180) / Math.PI; // Reibungswinkel = Selbsthemmgrenze
        const betaSplit = 2 * 1.5 * phi; // beidseitiger Keil, ×1.5 Marge → federt zurück statt zu klemmen
        const betaCut = 17 + (1 - hs) * 16 + m.hart * 14; // Kantenfestigkeits-Minimum
        return betaSplit + quer * (betaCut - betaSplit);
    }
    function ableitenKeil(t) {
        const q = t.quer,
            last = t.last !== undefined ? t.last : 0.4,
            klein = t.klein ? 1 : 0,
            sc = klein ? 0.7 : 1.0;
        const zm = ZIELMAT[t.ziel] || ZIELMAT.holz,
            ws = WERKSTOFF[t.werkstoff] || WERKSTOFF.stahl;
        // β  — Reibungs-Selbsthemmung (Spalten) + Kantenfestigkeit der WERKSTOFF-Härte (Schneiden). Geschlossen.
        const beta = Math.round(betaFromMechanik(q, t.ziel, ws.haerte));
        // Wange — Bauch aus der Spalt-Anisotropie des Ziels (nur ein spaltbares Material braucht aktive Seiten-Verdrängung);
        //         Dünnung aus dem Schneid-Drag (eine schneidende Klinge wird hinter der Schneide schlank, um nicht zu klemmen).
        const cheekMul = 1 + (1 - q) * zm.spalt * 0.65 - q * 0.5;
        // Masse — Impuls, um den KLEMMENDEN Spaltkeil durchzutreiben: wächst mit Bauch×Reibung, sinkt mit Werkstoff-Dichte.
        const bind = Math.max(0, cheekMul - 1) * zm.mu; // nur der Spaltbauch klemmt
        const socketR = 0.02 * (1 + bind * 4.4) * Math.sqrt(7850 / ws.rho) * (klein ? 0.85 : 1);
        // Geometrische Folgen: Schneiden will lange Schneide + Tiefe (Faserkontakt/Kerbe), Spalten kompakt; Schaft = Hebel aus Schwung-Klasse.
        const edgeLen = (0.068 + q * 0.05) * sc,
            reach = (0.07 + (1 - q) * 0.03 + q * 0.018) * sc,
            kopfLen = (0.085 + (1 - q) * 0.05) * sc;
        const schaft = klein ? 0.34 : 0.55 + last * 0.35,
            schaftR = 0.016 + (1 - q) * 0.005 + last * 0.003;
        return { beta, cheekMul, edgeLen, reach, socketR, kopfLen, schaft, schaftR };
    }
    // Pick (Spitzhacke): Stein/harten Boden ABSPRENGEN → Energie auf einen PUNKT → langer ogivaler Dorn; Meißel-Ende lockert
    function ableitenPick(t) {
        const hart = t.hart !== undefined ? t.hart : t.ziel === "stein" ? 1 : 0.5,
            last = t.last !== undefined ? t.last : 0.5;
        return {
            beta: Math.round(34 + hart * 12),
            cheekMul: 0.5,
            edgeLen: 0.055,
            reach: 0.075,
            socketR: 0.018 + last * 0.006,
            kopfLen: 0.1,
            schaft: 0.6 + last * 0.18,
            schaftR: 0.018 + last * 0.004,
            pickLen: 0.15 + hart * 0.05,
        };
    }
    // Graben: Erde TRENNEN (Kante sticht ein) + HEBEN (Blatt schöpft). heben∈[0,1]: 0 = Spaten (stechen/schmal/flach/Schneide/Tritt) · 1 = Schaufel (schöpfen/breit/konkav/rund)
    function ableitenGraben(t) {
        const h = t.heben !== undefined ? t.heben : 0.5;
        // Trennen (Kante sticht) + Heben (Schöpf-Kanal). heben treibt Breite, Schöpf-Tiefe, Seiten-Aufwurf, Anstellwinkel, Spitzen-Rundung.
        return {
            bladeW: 0.11 + h * 0.1,
            bladeLen: 0.25 - h * 0.05,
            bladeTh: 0.004,
            bladeConc: 0.01 + h * 0.032, // Schöpf-Tiefe (Mitte sinkt)
            sideCurl: 0.004 + h * 0.032, // Seiten heben sich → hält Material (Spaten ~flach)
            liftAngle: 0.05 + h * 0.3, // Anstellwinkel: Schaufel angestellt zum Schöpfen, Spaten inline zum Stechen
            edgeRound: 0.12 + h * 0.62, // Schaufel rundet die Spitze, Spaten breit-gerade
            neckLen: 0.052,
            socketBack: 0.05,
            spineH: 0.011,
            reach: 0.0,
            socketR: 0.021,
            kopfLen: 0.12,
            schaft: 0.8 - h * 0.18,
            schaftR: 0.019 + 0.002 * (1 - h),
            tread: h < 0.45,
        };
    }
    // ════════════════════════════════════════════════════════════════════
    // DAS GESETZ DER KLINGE — Form EMERGIERT aus der Aufgabe, wie der Keil.
    //   stich∈[0,1]: 0 = Schneiden/Hauen · 1 = Stechen
    //     Schneiden → breit (Schneidenlänge/Masse), Linse (Schneidengeometrie), Hohlkehle (I-Träger-Erleichterung)
    //     Stechen   → schmal + DICK/STEIF (Knickstab unter Druck, Euler → Tiefe ∝ Länge), Raute (steifster Querschnitt), spitz
    //   zug∈[0,1]: Zug-Schnitt (Säbel) → Krümmung + einschneidig (steifer Rücken)
    //   ziel → β über die Schneidengeometrie (weich+harter Stahl dünn; maille/Knochen robust); Werkstoff: weiches Metall → dicker/stumpfer
    // ════════════════════════════════════════════════════════════════════
    function ableitenKlinge(t) {
        const s = t.stich,
            zug = t.zug || 0,
            L = t.laenge;
        const zm = ZIELMAT[t.ziel] || ZIELMAT.fleisch,
            ws = WERKSTOFF[t.werkstoff] || WERKSTOFF.stahl,
            cl = (v, a, b) => Math.max(a, Math.min(b, v));
        const matThick = 1 + (0.62 - ws.haerte) * 0.85; // weicheres Metall → dickerer (stumpferer) Schliff
        const w0 = cl(0.03 + L * 0.016 - s * 0.018, 0.013, 0.055); // Schneiden breit, Stechen schmal
        const th0 = cl((0.0028 + L * 0.0026 + s * 0.0032) * matThick, 0.0028, 0.013); // Stechen=Knickstab → Tiefe (×Länge×Stich)×Material
        const fam = s > 0.66 ? "raute" : s < 0.34 ? "linse" : "sechs"; // Raute=steifster Stab · Linse=Schneide · Sechs=Kompromiss
        const fuller = fam === "raute" ? 0 : cl((1 - s) * 0.62 * Math.min(1, L + 0.1), 0, 0.72); // I-Träger nur lang & nicht-Raute
        const thTip = cl(0.52 - s * 0.16, 0.3, 0.6); // Stechen stärker distal (schneller Ort, dicke Basis)
        const wTip = cl(0.4 - s * 0.24, 0.1, 0.55); // Stechen spitzer
        return {
            w0,
            wTip,
            th0,
            thTip,
            fam,
            fuller,
            fullerW: 0.6,
            klinge: L,
            flat: cl(0.46 - s * 0.1, 0.3, 0.52),
            kruemmung: cl(zug * 0.15, 0, 0.2),
            single: zug > 0.5,
            intent: s > 0.6 ? "stich" : t.ziel === "holz" ? "nutz" : "hieb",
        };
    }
    // ════════════════════════════════════════════════════════════════════
    // DAS GESETZ DES BOGENS — elastische Energiespeicherung, Form aus Balkentheorie.
    //   Wurfarm = biegender Balken. auszug→Armlänge. Dehnungsgrenze→Dicke (dünner biegt schärfer ohne Bruch).
    //   Zugkraft→Breite (F ∝ E·w·t³/L³). Recurve emergiert: kurzer Auszug / dehnbares Material speichert Energie früh.
    //   Gemessen: Zugkraft (N) und gespeicherte Energie ∝ E·w·t·L·dehnung² — beides aus dem Balken, nicht getippt.
    // ════════════════════════════════════════════════════════════════════
    function ableitenBogen(t) {
        const A = t.auszug,
            Z = t.zugkraft,
            bm = BOGENMAT[t.material] || BOGENMAT.holz,
            cl = (v, a, b) => Math.max(a, Math.min(b, v));
        const limbLen = cl(0.4 + A * 0.42, 0.3, 0.92); // Auszug → Wurfarmlänge
        const recurve = cl((1 - A) * 0.5 + (bm.dehnung - 1) * 0.55, 0, 0.65); // kurzer Auszug / dehnbares Material → Recurve
        const tBase = cl(0.009 * bm.dehnung, 0.007, 0.02); // Dicke aus Dehnungsgrenze
        const wBase = cl((0.024 * Z) / bm.E + 0.012, 0.018, 0.058); // Breite aus Zugkraft ÷ Steifigkeit
        const draw = 0.3 + A * 0.62;
        const zugN = Z * 320; // Zugkraft = Ziel, in Newton
        const curveF = 1.0 + recurve * 0.26; // Recurve lädt die Kraft-Weg-Kurve vorn
        const stored = 0.5 * zugN * draw * curveF; // gespeicherte Energie [J] = Fläche unter Kraft-Weg
        const eta = 0.46 + recurve * 0.2; // Wirkungsgrad
        const energie = stored * eta; // Pfeilenergie [J] — SI, kein Fudge, gegen Stretton 114J geeicht
        return {
            limbLen,
            recurve,
            tBase,
            wBase,
            riserLen: 0.13,
            draw,
            zugN,
            energie,
            stored,
            eta,
            bogenMat: t.material,
        };
    }
    // Aufgabe → Form: füllt die Form-Parameter aus der Aufgabe (vor snapBases). Gattung = Aufgabe, Form folgt.
    function applyTask(P) {
        if (!P.task) return;
        const t = P.task;
        if (t.art === "keil") {
            Object.assign(P, ableitenKeil(t));
        } else if (t.art === "pick") {
            Object.assign(P, ableitenPick(t));
        } else if (t.art === "graben") {
            Object.assign(P, ableitenGraben(t));
        } else if (t.art === "klinge") {
            Object.assign(P, ableitenKlinge(t));
        } else if (t.art === "bogen") {
            Object.assign(P, ableitenBogen(t));
        }
    }

    // ── Kern-Zustand: die aktive TRADITION (Lab-Start = Frank; measure liest sie für die
    //    Gehilz-Masse [eg], buildWeaponModel/buildInstance für Werkstoff × Form). Die Shell
    //    spiegelt ihre Auswahl via setTradition; im Foundry-Worker bleibt sie LAB-FEST
    //    Frank → deterministische Verträge (s. Kopf). ──
    var currentTrad = TRADITIONEN.Frank;
    function setTradition(T) {
        currentTrad = T && typeof T === "object" ? T : TRADITIONEN.Frank;
    }

    // ── der Trainingsplatz-Bauer des Labs (byte-treu Z.1411–1418): EINE Gattung → die
    //    komplette Waffe als Group — der Paritäts-Anker für buildInstance (der Waffen-
    //    ständer der Arena baut EXAKT hierüber). ──
    function buildWeaponModel(name) {
        const tp = Object.assign({ flat: 0.42, _kBase: 0 }, GATTUNGEN[name]);
        if (tp.task) {
            tp.task = Object.assign({}, tp.task);
            tp.task.werkstoff = tradWerkstoff(currentTrad);
            applyTask(tp);
            snapBases(tp);
        } else snapBases(tp);
        shapeByTradition(tp, currentTrad);
        const g = new THREE.Group();
        try {
            if (tp.modus === "bogen") {
                tp.drawFrac = 0;
                g.add(buildBogen(tp, M.wood));
            } else {
                const S = stations(tp);
                if (!S.impact) {
                    g.add(loftBlade(tp, S));
                    g.add(buildGuard(tp, S, currentTrad));
                    g.add(buildGrip(tp, S, currentTrad));
                    g.add(buildPommel(tp, S, currentTrad));
                } else {
                    if (tp.modus === "wucht") tp.schaftR = griffD(intentControl(tp)) * 0.5;
                    g.add(buildHaft(tp, S));
                    g.add(buildHead(tp, S));
                }
            }
        } catch (e) {}
        return g;
    }

    // ── B1 REZEPTE — die GATTUNGEN des Labs im Vertrags-Namensraum [a-z0-9_-]+
    //    (`lab` = der Schöpfer-Wortlaut der Buttons; Umlaute normalisiert ae/oe/ss).
    //    Die Rezept-Menge ist BEWUSST alle 21 Gattungen: Waffen UND Werkzeuge — die
    //    tool:true-Einträge (Messer/Fällaxt/Spaltmaul/Vorschlaghammer/Beil/Spitzhacke/
    //    Spaten/Schaufel) decken die geraet_spitzhacke-Klasse. ──
    // prettier-ignore
    var REZEPT_ZU_GATTUNG = {
        langschwert: "Langschwert", saebel: "Säbel", degen: "Degen", grossschwert: "Großschwert",
        dolch: "Dolch", messer: "Messer",
        langbogen: "Langbogen", kriegsbogen: "Kriegsbogen", reiterbogen: "Reiterbogen", recurvebogen: "Recurvebogen",
        streitkolben: "Streitkolben", kriegsaxt: "Kriegsaxt", kriegshammer: "Kriegshammer", keule: "Keule",
        faellaxt: "Fällaxt", spaltmaul: "Spaltmaul", vorschlaghammer: "Vorschlaghammer", beil: "Beil",
        spitzhacke: "Spitzhacke", spaten: "Spaten", schaufel: "Schaufel",
    };

    // ── B1-Ableitung (eine Quelle, zwei Sichten — das porta-SLIDERS→PARAMS-Muster):
    //    die GATTUNGEN sind die Lab-Wahrheit, PRESETS ist die Vertrags-Sicht. `s` trägt
    //    die FLACHEN numerischen Dials der Gattung (griff/knaufR/parier/schaft/…);
    //    fx.place {mode:"hand"} = das Platzierungs-Gesetz als DATEN (Wörterbuch v1 §2.4:
    //    Spawn/Befehl/Hand — KEIN Worldgen; der Host-Dispatch gibt null, gate-bewiesen).
    //    fx.task = die Aufgaben-DNA (Strings+Zahlen, JSON-klonbar, must-ignore für
    //    Alt-Leser) · fx.tool = die Werkzeug-Marke des Labs. KEIN fx.wield: das Lab
    //    trägt keine gezeichneten Reichweiten-/Schwung-Zahlen — seine Lehren sind aus
    //    der Geometrie GEMESSEN, und der Wield-Richter ist Ω-PHYSIS im Host (N6.6,
    //    M3/M9: das Lab eicht, der Host lebt). ──
    var PRESETS = (function () {
        var out = {};
        for (var id in REZEPT_ZU_GATTUNG) {
            if (!Object.prototype.hasOwnProperty.call(REZEPT_ZU_GATTUNG, id)) continue;
            var name = REZEPT_ZU_GATTUNG[id];
            var G = GATTUNGEN[name];
            if (!G) continue;
            var s = {};
            for (var k in G) {
                if (!Object.prototype.hasOwnProperty.call(G, k)) continue;
                if (typeof G[k] === "number" && isFinite(G[k])) s[k] = G[k];
            }
            var fx = { place: { mode: "hand" } };
            if (G.tool) fx.tool = true;
            if (G.task) fx.task = Object.assign({}, G.task);
            // W-A4b — DER GRIFF ALS VERTRAGS-DATEN (fx.held, Woerterbuch-v1-Geist: GESTALT+
            // GESETZ reisen als Daten): dieselbe P-Praeparation wie buildInstance (Task-DNA +
            // snapBases + Tradition, OHNE materials — stations ist reine Mathematik) liefert
            // die Griff-MITTE auf der Template-X-Achse. Klinge: (0+griff)/2 · Werkzeug/Wucht:
            // die echte Haft-Spanne aus der Task-Geometrie · Bogen: 0 (Riser-Mitte am
            // Ursprung). Der Hand-Konsument des Wirts LIEST diese Zahl — kein Dial-Raten.
            var tp = Object.assign({ flat: 0.42, _kBase: 0 }, G);
            if (tp.task) {
                tp.task = Object.assign({}, tp.task);
                tp.task.werkstoff = tradWerkstoff(currentTrad);
                applyTask(tp);
                snapBases(tp);
            } else snapBases(tp);
            shapeByTradition(tp, currentTrad);
            var S = stations(tp);
            fx.held = {
                gripX: S && !S.bogen && isFinite(S.xGrip0) && isFinite(S.xGripEnd) ? (S.xGrip0 + S.xGripEnd) / 2 : 0,
            };
            out[id] = { kind: "weapon", lab: name, s: s, fx: fx };
        }
        return out;
    })();

    // ── B4 PARAMS (Vertrags-Form {id,lab,min,max,step,def,law,grp}) — ABGELEITET aus den
    //    zwei Lab-Regler-Tabellen (PARAMS_BLADE + PARAMS_IMPACT, byte-treu oben; die ids
    //    sind disjunkt). `def` kommt aus dem LAB-STARTZUSTAND P (Z.911–918 byte-treue
    //    Werte) — die Tabellen selbst tragen kein def-Feld, der Startwert IST die eine
    //    dokumentierte Quelle des Labs. Die Werkstatt rendert ihre Slider AUS diesen
    //    Daten (W-A1-Generik), der ov-Kanal von buildInstance liest dieselben ids. ──
    // prettier-ignore
    var PARAM_DEFAULTS = {
        klinge: 0.95, w0: 0.045, wTip: 0.30, th0: 0.0065, thTip: 0.40, fuller: 0.55, fullerW: 0.6,
        kruemmung: 0.0, griff: 0.24, knaufR: 0.021, parier: 0.11,
        schaft: 0.58, schaftR: 0.016, kopfLen: 0.12, socketR: 0.022, beta: 30, reach: 0.052, edgeLen: 0.10,
    };
    var PARAMS = (function () {
        var src = PARAMS_BLADE.concat(PARAMS_IMPACT);
        var out = [];
        for (var i = 0; i < src.length; i++) {
            var d = src[i];
            out.push({
                id: d.id,
                lab: d.lab,
                min: d.min,
                max: d.max,
                step: d.step,
                def: PARAM_DEFAULTS[d.id],
                law: d.law || undefined,
                grp: d.grp,
            });
        }
        return out;
    })();

    // ── B5 LEHREN (Vertrags-Form {id,lab,unit,pass,hint}) — ABGELEITET aus der Lab-
    //    LEHREN-Tafel: pass = das hieb-Band (die Referenz-Absicht des Lab-Startzustands,
    //    bandFor-Fallback). Die VOLLE Absichts-Matrix (BANDS) + der lebende Richter
    //    (evalLehren, urteilt gegen P.intent) reisen daneben — s. B5-STAND im Kopf. ──
    var LEHREN_B5 = (function () {
        var out = [];
        for (var i = 0; i < LEHREN.length; i++) {
            var L = LEHREN[i];
            out.push({ id: L.id, lab: L.lab, unit: L.unit, pass: bandFor(L.key, "hieb"), hint: L.hint });
        }
        return out;
    })();

    // ── B5-Mess-Funktion (M3: der Export der SELBEN Formeln, die die Lab-Tafel zeigt —
    //    je Lehre ihr integrierter Messwert aus measure(P); nicht-anwendbare [na] → null). ──
    function messen(P) {
        var m = measure(P);
        var out = {};
        for (var i = 0; i < LEHREN.length; i++) {
            var L = LEHREN[i];
            out[L.id] = L.na(m) ? null : L.fn(m);
        }
        return out;
    }

    // ── B2: buildInstance(rezeptId, seed, lod, ov?) — die EINE Bau-Funktion ──
    // Deterministisch (rein aus den Parametern, s. Kopf: seed reserviert, Goldens cv:5
    // frieren die Seed-Invarianz ein); lod wird auf die einzige getragene Stufe 0
    // geklemmt (kindStages.weapon=[0] — L1/L2 gradet der Wirt). Die Sequenz ist EXAKT
    // buildWeaponModel (Gattung → Aufgabe×Kultur-Werkstoff → snapBases → Tradition),
    // plus der ov-REGLER-KANAL (B4): P-Overrides NACH Gattung×Tradition = die Lab-
    // Slider-Semantik (Slider schreiben P nach dem Gattungs-/Traditions-Zug; für
    // modus wucht bleibt schaftR lab-treu aus dem Greifer-Kontakt abgeleitet).
    // Ausgang: EINE THREE.Group, Welt-Matrizen aktualisiert — die Naht sind die
    // Float32-Attribute ihrer Meshes (G2.2).
    function buildInstance(rezeptId, seed, lod, ov) {
        var name = REZEPT_ZU_GATTUNG[rezeptId];
        if (!name || !GATTUNGEN[name]) return null;
        materials();
        var tp = Object.assign({ flat: 0.42, _kBase: 0 }, GATTUNGEN[name]);
        // V18.466 (rein additiv) — DIE TRADITION IST WÄHLBAR: ov.__tradition
        // (Frank/Nihon/Pars/Urvolk/Brut — die TRADITIONEN-Tabelle) wählt die
        // orthogonale Design-Sprache; ohne ov bleibt der Bau byte-identisch
        // LAB-FEST Frank (die v5-Klingen-Goldens laufen ov-frei). __-Schlüssel
        // sind STEUER-Passagiere und wandern nie in die Bau-Parameter.
        var trad =
            ov && typeof ov.__tradition === "string" && TRADITIONEN[ov.__tradition]
                ? TRADITIONEN[ov.__tradition]
                : currentTrad;
        if (tp.task) {
            tp.task = Object.assign({}, tp.task);
            tp.task.werkstoff = tradWerkstoff(trad);
            applyTask(tp);
            snapBases(tp);
        } else snapBases(tp);
        shapeByTradition(tp, trad);
        if (ov && typeof ov === "object") {
            for (var k in ov) {
                if (!Object.prototype.hasOwnProperty.call(ov, k)) continue;
                if (k.indexOf("__") === 0) continue;
                tp[k] = ov[k];
            }
        }
        var g = new THREE.Group();
        if (tp.modus === "bogen") {
            tp.drawFrac = 0;
            g.add(buildBogen(tp, M.wood));
        } else {
            var S = stations(tp);
            if (!S.impact) {
                g.add(loftBlade(tp, S));
                g.add(buildGuard(tp, S, trad));
                g.add(buildGrip(tp, S, trad));
                g.add(buildPommel(tp, S, trad));
            } else {
                if (tp.modus === "wucht") tp.schaftR = griffD(intentControl(tp)) * 0.5;
                g.add(buildHaft(tp, S));
                g.add(buildHead(tp, S));
            }
        }
        g.userData = { kind: "weapon", rezeptId: rezeptId, seed: seed, lod: 0 };
        g.updateMatrixWorld(true);
        return g;
    }

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Gesetz- und Bau-Vokabular ──
    // ═══ ARENA-GEFUEHL (rein additive DATEN-Zeilen, Schoepfer-Vertrags-Akt
    // 16.07.: "vollende die verbindungen ... kein offen") — DIE GEFUEHLS-
    // GESETZE der Pruefstand-Arena als REISENDE Daten. N6.6-Revision: der
    // Kern traegt jetzt auch die SCHWUNG-Konstanten des Wirts (dauerProSqrtI
    // et al. — die Omega-PHYSIS-Formel dauer = dauerProSqrtI*sqrt(I) bleibt
    // Wirts-Gesetz, ihre ZAHLEN wohnen hier: EIN Regler fuer Arena UND Welt).
    // gefuehl: Hit-Stop/Erschuetterung skalieren mit der TREFFER-ENERGIE
    // (keRefJ — die 114-J-Eichung der Arena); der Wirt mappt freeze auf
    // seine Anzeige-Uhr und shake auf den Kamera-Dip. bogen: die EINE
    // Schuss-Physik v0 = sqrt(2*E/mArrow) mit E = zugJouleRef*zugkraft*
    // auszug — byte-identisch zur historischen Wirts-Form 34*sqrt(zug*aus)
    // (34^2*0.05/2 = 28.9 J); auszugSec/fovZug/fovRuhe = das Arena-Zieh-
    // Gefuehl (Auszug ueber 0.9 s, Blick verengt 75->54).
    // SPIEGEL-ZENSUS 17.07. (rein additiv, byte-gleiche Zahlen der bisherigen
    // Stamm-Literale — SWING_/BOGEN_LAWS schrumpfen dort auf reine Fallbacks):
    // schwung traegt jetzt auch die HIEB-GEOMETRIE (Phasen-Anteile, Sweep-
    // Bogen +-arcHalfRad um den Blick, Klingen-Kapselradius, Arm-Anteil +
    // Deckel der Reichweite, Sweep-Ursprung ueber der Koerper-Position);
    // gefuehl den STOSS (push = min(stossCap, kb*stossProKb)*stossSkala als
    // direkter Positions-Stoss) + das TOD-KIPPEN (Kipp-Dauer + Nachklang);
    // bogen den PFEIL-FLUG (Lebenszeit, Kapselradius, Muendungs-Abstand vor
    // der Schulter). guete: die GEMESSENE Waffen-Guete (gueteFaktor unten)
    // mappt den bestandenen Lehren-Anteil linear [faktorLeer..faktorVoll] —
    // ein Archetyp (alles pass) schlaegt mit faktorVoll = byte-alter Wucht.
    var ARENA = {
        schwung: {
            // KAPSEL-GESETZ (18.07., rein additiv): die Kreatur-Trefferfläche
            // des Klingen-Sweeps — vertikale Kapsel ∝ Körpergröße L (scale.x):
            // Radius kapselRK·L (Boden kapselRMin), Segment kapselY0·L..kapselY1·L.
            // Waren Wirts-Literale (0.55/0.35/0.1/1.4) — jetzt EINE Quelle.
            kapselRK: 0.55,
            kapselRMin: 0.35,
            kapselY0: 0.1,
            kapselY1: 1.4,
            dauerProSqrtI: 0.55,
            // EINHEITSBREI-SCHNITT (18.07., rein additiv): die Dauer-Konstante
            // für die GEMESSENE Trägheit (kampfMasze, echte kg·m² — andere
            // Einheit als die Tag-Trägheit des Emergenz-Pfads): Langschwert
            // (I 0.137) → ~0.52 s, Grossschwert (0.336) → ~0.81 s, Dolch
            // klemmt flink auf minDauerSec, Vorschlaghammer träge auf max.
            dauerProSqrtIKg: 1.4,
            minDauerSec: 0.25,
            maxDauerSec: 1.8,
            handDauerSec: 0.4,
            windupFrac: 0.3,
            strikeFrac: 0.25,
            arcHalfRad: 1.1,
            bladeRadiusM: 0.35,
            reachBaseM: 0.9,
            reachMaxM: 6,
            shoulderH: 1.2,
        },
        gefuehl: {
            freezeMinSec: 0.04,
            freezeMaxSec: 0.2,
            // V18.491.182 — Lab Prüfstand juice formula; Host hitStop lerp dual.
            labFreezeKeMul: 0.0011,
            labFreezeCleanAdd: 0.05,
            labFreezeSchlagMul: 1.25,
            // V18.491.195 — Lab Prüfstand freeze slows sim dt; Host hitStop-lerp dual (FREEZE_VIS).
            labFreezeDtMul: 0.05,
            // V18.491.184 — Lab Prüfstand shake; Host dipMin/Max dual.
            labShakeKeMul: 0.004,
            labShakeSchlagMul: 1.5,
            labShakeOtherMul: 0.9,
            labShakeMin: 0.02,
            labShakeMax: 0.42,
            // V18.491.185 — Lab Prüfstand kick/recoil; Host stoss* dual.
            labKickFwdMul: 0.012,
            labKickYMul: 0.005,
            labRecoilKeMul: 0.008,
            labRecoilMin: 0.10,
            labRecoilMax: 0.7,
            dipMin: 2.0,
            dipMax: 6.5,
            keRefJ: 114,
            stossCap: 18,
            stossProKb: 1.4,
            stossSkala: 0.12,
            kippDauerSec: 1.0,
            kippNachklangSec: 0.35,
        },
        // V18.491.153 — Lab studio g Gesetz; Host state.gravity stays world signed dual (GRAVITY_VIS .149).
        g: 9.81,
        // V18.491.139 — Lab mArrow + auszug/fov fail-soft (numbers untouched).
        bogen: {
            mArrow: 0.05,
            zugJouleRef: 28.9,
            auszugSec: 0.9,
            fovZug: 54,
            fovRuhe: 75,
            minAuszugFrac: 0.25,
            maxFlugSec: 5,
            radiusM: 0.12,
            muendungM: 1.2,
            // V18.491.173 — Lab Prüfstand drag; Host none.
            labLuftDrag: 0.0016,
            // V18.491.174 — Lab Prüfstand X-cull; Host none (FLUG_VIS time dual stays).
            labXMax: 30,
            // V18.491.175 — Lab stuck-arrow mesh ring cap; Host MAX_PFEILE=16 is live-arrow bound (STUCK_VIS dual).
            labStuckMax: 40,
            // V18.491.176 — Lab Prüfstand hold/sway; Host none.
            labHoldSec: 0.7,   // sec full-draw before sway ramps
            labSwayGain: 0.5,  // sway = clamp((holdT-labHoldSec)*labSwayGain,0,1)
            labSwaySpread: 0.04, // aim jitter ±spread * sway
            // V18.491.177 — Lab Prüfstand life cull; Host maxFlugSec dual = FLUG_VIS.
            labLifeSec: 9,
            // V18.491.178 — Lab cold SI energie fallback; Host zugJouleRef-product dual = SCHUSS_VIS.
            labEnergieFallback: 40,
            // V18.491.181 — Lab VM grip-offset muzzle; Host muendungM world dual = MUENDUNG_VIS. Do NOT Fake-align 0.2→1.2.
            labMuzzleAlongGrip: 0.2,
            // V18.491.183 — Lab Prüfstand release kick; Host none.
            labKickBack: 5, // multiplyScalar(-labKickBack) on fwd
            labKickY: 1.5,
            labKickShake: 0.04,
            // V18.491.187 — Lab Prüfstand target X-slab; ≠ schwung.bladeRadiusM (coincidental); Host capsule gate dual.
            labTargetNear: 0.05,  // X behind face
            labTargetDepth: 0.35, // X through face slab
            // V18.491.188 — Lab drawFrac mesh rebuild hysteresis; Host none.
            labRebuildEps: 0.05,
            // V18.491.189 — Lab Prüfstand aim raise / undraw; Host none.
            labRaiseK: 8,   // lerp k: clamp(dt*labRaiseK,0,1)
            labDrawDecay: 2, // drawFrac -= dt*labDrawDecay when not drawing
        },
        guete: {
            faktorVoll: 1.0,
            faktorLeer: 0.55,
            // EINHEITSBREI-SCHNITT (18.07., rein additiv): der Schadens-Faktor
            // der EFFEKTIVEN MASSE (kampfMasze.mEff / mEffRefKg, geklemmt) —
            // Referenz = Langschwert (~0.25 kg): Messer schlägt gedämpft
            // (dmgMin), Grossschwert ~1.7×, Keule/Hämmer klemmen auf dmgMax.
            mEffRefKg: 0.25,
            mEffDmgMin: 0.6,
            mEffDmgMax: 2.2,
        },
        // V18.491.122 — Lab FEEL mass→Wucht (handling). Host juice reads handlingMul; damage stays mEff.
        // V18.491.123 — Lab _windF Ausholbedarf (I → 0.3..1). Host windup × windF.
        // V18.491.138 — Lab FEEL reads massRef/min/max fail-soft (numbers untouched).
        handling: {
            massRef: 1.4,  // median kg (Messer ~0.25 / Vorschlaghammer ~5.4)
            massMin: 0.42,
            massMax: 2.30,
            iMin: 0.02,
            iRef: 0.16,
            pow: 0.45,
            dragAmp: 0.45,
            denom: 0.5,
            windMin: 0.3,
            windMax: 1,
        },
        // V18.491.145 — Lab Prüfstand camera/walk (Host world eye separate).
        // V18.491.146 — Lab Prüfstand positions (THREE-free arrays; Lab → Vector3).
        // Lab ARENA reads fail-soft; Host state.camera/player untouched.
        studio: {
            eHuman: 78,
            sens: 0.0022,
            eyeY: 1.62,
            walk: 2.8,
            swGain: 0.011,
            // V18.491.190 — Lab Prüfstand FOV lerp k; Host camera none.
            labFovK: 9,
            // V18.491.191 — Lab Prüfstand melee ready lerp k; Host none.
            labReadyK: 16,
            // V18.491.192 — Lab Prüfstand walk bob; ≠ labFovK (coincidental 9); Host none.
            labBobHz: 9,
            labBobAmp: 0.012,
            // V18.491.193 — Lab Prüfstand camera kick/shake decay; Host none.
            labKickVDecay: 0.0003,
            labKickDecay: 0.015,
            labShakeDecay: 0.0006,
            labShakeKill: 0.0008,
            // V18.491.195 — Lab Prüfstand blade trail; Host none.
            labTrailOpacity: 0.72,
            // V18.491.146 — Lab Prüfstand positions (THREE-free arrays; Lab → Vector3).
            dummyPos: [2.4, 0, 0],
            targetPos: [17, 1.42, 0],
            // V18.491.147 — Lab VM camera-space limb (not ANTHROPOS gripOptD).
            // Host schwung.shoulderH=1.2 is world — dual, not Fake-merge.
            anthro: {
                shoulder: [0.19, -0.16, -0.02],
                elbow: [0.21, -0.42, -0.18],
                grip: [0.10, -0.40, -0.48],
            },
        },
        // TREFFERZONEN (18.491.98/.114/.115/.117): relative Körperhöhe L (yFrac 0=Füße … 1=Scheitel).
        // yFrac/rFrac = Lab-Spiegel (postH=1.65); Lab buildDummy mappt ARENA.zonen → absolut.
        // Host-Sweep/Pfeil + Lab aimDummy lesen zoneMulAt/zoneKindAt / userData.zones (eine Quelle).
        // .114: arm.zOffFrac named (Lab-Geo); Host bleibt XZ-blind für WELCHE Zone (Y-only mul).
        // .115: juiceMul — Feel freeze/dip skaliert leicht per Zone (Schaden bleibt dmgMul).
        // .117: ZONE_PICK Lab mesh-ray / Host y-capsule — intentional dual; no Host XZ limb.
        zonen: [
            { kind: "head",  yFrac: 0.988, rFrac: 0.091, dmgMul: 2.4, juiceMul: 1.25 },
            { kind: "chest", yFrac: 0.8,   rFrac: 0.115, dmgMul: 1.5, juiceMul: 1.05 },
            { kind: "belly", yFrac: 0.57,  rFrac: 0.115, dmgMul: 1.2, juiceMul: 1.0 },
            { kind: "arm",   yFrac: 0.788, rFrac: 0.055, dmgMul: 0.7, zOffFrac: 0.158, juiceMul: 0.75 },
            { kind: "leg",   yFrac: 0.364, rFrac: 0.036, dmgMul: 0.8, juiceMul: 0.8 },
        ],
    };

    // ZONE_PICK — intentional dual pick (Feel-Entscheid .117). Do NOT add XZ limb pick on Host.
    // Like FOREST_TOPOLOGY .116 / NINJA_FEEL .97: naming the Feel, not Fake-zu.
    var ZONE_PICK = {
        lab: "mesh-ray", // aimDummy intersectObject + nearest Y; zOffFrac is dummy geo
        host: "y-capsule", // zoneMulAt/zoneKindAt from bladeY/hitY along L; XZ-blind
    };

    // STUDIO_VIS — intentional dual camera/limb frame (Feel-Entscheid .148). Do NOT merge.
    // lab:"pruefstand" = ARENA.studio eyeY/walk/anthro/dummyPos (Lab VM camera-local).
    // host:"world-fp" = Host FP eye ≈1.6 + schwung.shoulderH world (bow muzzle).
    // Like ZONE_PICK .117 / STEER_VIS .124: naming the Feel, not Fake-zu.
    // ARENA.studio numbers stay Lab Gesetz; Host gravity/eye stay world.
    var STUDIO_VIS = {
        lab: "pruefstand",
        host: "world-fp",
    };

    // FOV_VIS — intentional Lab-only Prüfstand FOV lerp k (Feel-Entscheid .190). Do NOT Fake-add Host fov lerp.
    // lab:"fov-lerp-9" = ARENA.studio.labFovK. host:"none" = Host camera path different.
    // Like STUDIO_VIS .148: naming the Feel, not Fake-zu. STUDIO_VIS dual kept.
    var FOV_VIS = { lab: "fov-lerp-9", host: "none" };

    // READY_VIS — intentional Lab-only Prüfstand melee ready lerp k (Feel-Entscheid .191). Do NOT Fake-add Host ready.
    // lab:"ready-lerp-16" = ARENA.studio.labReadyK. host:"none" = Host has no arena.ready lerp.
    // Like FOV_VIS .190: naming the Feel, not Fake-zu. STUDIO_VIS dual kept.
    var READY_VIS = { lab: "ready-lerp-16", host: "none" };

    // BOB_VIS — intentional Lab-only Prüfstand walk bob (Feel-Entscheid .192). Do NOT Fake-merge into labFovK.
    // lab:"bob-9-0.012" = ARENA.studio.labBobHz/labBobAmp. host:"none" = Host camera bob path different.
    // labBobHz===9 AND labFovK===9 is named coincidence (separate fields); ≠ FOV Fake-merge.
    // Like READY_VIS .191: naming the Feel, not Fake-zu. STUDIO_VIS dual kept.
    var BOB_VIS = { lab: "bob-9-0.012", host: "none" };

    // CAM_DECAY_VIS — intentional Lab-only Prüfstand camera kick/shake decay (Feel-Entscheid .193). Do NOT Fake-add Host cam decay.
    // lab:"kick-shake-decay" = ARENA.studio.labKickVDecay/labKickDecay/labShakeDecay/labShakeKill. host:"none" = Host camera path different.
    // Like BOB_VIS .192: naming the Feel, not Fake-zu. STUDIO_VIS dual kept.
    var CAM_DECAY_VIS = { lab: "kick-shake-decay", host: "none" };

    // TRAIL_VIS — intentional Lab-only Prüfstand blade trail opacity (Feel-Entscheid .195). Do NOT Fake-add Host trail.
    // lab:"opacity-0.72" = ARENA.studio.labTrailOpacity. host:"none" = Host trail/VFX path different.
    // Like CAM_DECAY_VIS .193: naming the Feel, not Fake-zu. STUDIO_VIS dual kept.
    var TRAIL_VIS = { lab: "opacity-0.72", host: "none" };

    // GRAVITY_VIS — intentional dual g (Feel-Entscheid .149). Do NOT merge.
    // lab:"arena-g-plus" = Lab ARENA.g +9.81 (studio props/arrows).
    // host:"state-signed" = Host state.gravity −9.81 world (mutable command).
    // Like STUDIO_VIS .148 / ZONE_PICK .117: naming the Feel, not Fake-zu.
    // FAHR.G 9.8 vehicle = other residual, not this Feel.
    var GRAVITY_VIS = {
        lab: "arena-g-plus",
        host: "state-signed",
    };

    // FLUG_VIS — intentional dual arrow cull (Feel-Entscheid .169). Do NOT Fake-align.
    // lab:"life-9" = Prüfstand a.life>_bogenFov().lifeSec ← ARENA.bogen.labLifeSec (.177) (+ labXMax X-cull .174). host:"maxFlugSec-5" = ARENA.bogen.maxFlugSec.
    // Like G_VIS .150 / GRAVITY_VIS .149: naming the Feel, not Fake-zu. Host has no X cull. Do NOT Fake-align 9→5.
    var FLUG_VIS = { lab: "life-9", host: "maxFlugSec-5" };

    // SCHUSS_DRAG_VIS — intentional Lab-only arrow air drag (Feel-Entscheid .173). Do NOT Fake-add Host drag.
    // lab:"luft-0.0016" = ARENA.bogen.labLuftDrag. host:"none" = _tickPfeile no drag.
    var SCHUSS_DRAG_VIS = { lab: "luft-0.0016", host: "none" };

    // STUCK_VIS — intentional dual (Feel-Entscheid .175). Do NOT Fake-align 40→16.
    // lab:"stuck-40" = ARENA.bogen.labStuckMax stuck mesh ring. host:"MAX_PFEILE-16" = AnazhRealm.MAX_PFEILE live-arrow bound.
    // Different domains (stuck meshes vs flying list); naming the dual, not Fake-zu.
    var STUCK_VIS = { lab: "stuck-40", host: "MAX_PFEILE-16" };

    // HOLD_SWAY_VIS — intentional Lab-only full-draw hold/sway (Feel-Entscheid .176). Do NOT Fake-add Host sway.
    // lab:"hold-sway" = ARENA.bogen.labHoldSec/labSwayGain/labSwaySpread. host:"none" = no hold/sway path.
    var HOLD_SWAY_VIS = { lab: "hold-sway", host: "none" };

    // SCHUSS_VIS — intentional energy dual (Feel-Entscheid .178). Do NOT Fake-merge.
    // lab:"si-energie" = Werkstatt P.energie (+ labEnergieFallback cold). host:"zugJouleRef-product" = zugJouleRef·zug·aus.
    var SCHUSS_VIS = { lab: "si-energie", host: "zugJouleRef-product" };

    // MUENDUNG_VIS — intentional muzzle dual (Feel-Entscheid .181). Do NOT Fake-align.
    // lab:"grip-offset-0.2" = labMuzzleAlongGrip on VM grip. host:"muendungM-1.2" = ARENA.bogen.muendungM world.
    var MUENDUNG_VIS = { lab: "grip-offset-0.2", host: "muendungM-1.2" };

    // KICK_VIS — intentional Lab-only Prüfstand release kick (Feel-Entscheid .183). Do NOT Fake-add Host kick.
    // lab:"release-kick" = ARENA.bogen.labKickBack/labKickY/labKickShake. host:"none" = Host bow different juice path.
    var KICK_VIS = { lab: "release-kick", host: "none" };

    // FREEZE_VIS — intentional freeze dual (Feel-Entscheid .182). Do NOT Fake-merge.
    // lab:"ke-formula" = e*labFreezeKeMul+(clean?labFreezeCleanAdd:0) × schlagMul, clamp gefuehl min/max.
    // host:"hitStop-lerp" = freezeMin+(freezeMax-freezeMin)*e.
    // V18.491.195 — companion labFreezeDtMul slows Lab sim dt during freeze; Host hitStop wall-clock (no dt mul).
    var FREEZE_VIS = { lab: "ke-formula", host: "hitStop-lerp" };

    // SHAKE_VIS — intentional shake dual (Feel-Entscheid .184). Do NOT Fake-merge.
    // lab:"ke-shake" = e*labShakeKeMul*(schlag?labShakeSchlagMul:labShakeOtherMul), clamp labShakeMin/Max.
    // host:"dip-lerp" = dipMin+(dipMax-dipMin)*e (camera dip; different domain).
    var SHAKE_VIS = { lab: "ke-shake", host: "dip-lerp" };

    // RECOIL_VIS — intentional recoil dual (Feel-Entscheid .185). Do NOT Fake-merge.
    // lab:"ke-kick-recoil" = kickV/arena.recoil from labKickFwdMul/labKickYMul/labRecoil*.
    // host:"stoss-push" = push = min(stossCap, kb·stossProKb)·stossSkala (knockback; different domain).
    var RECOIL_VIS = { lab: "ke-kick-recoil", host: "stoss-push" };

    // TARGET_VIS — intentional dual bow-target gate (Feel-Entscheid .187). Do NOT Fake-merge.
    // lab:"x-slab" = Prüfstand a.pos.x in [T.pos.x-labTargetNear, T.pos.x+labTargetDepth) then radius hit.
    // host:"capsule-radius" = Host radiusM + creature capsule (TARGET_VIS dual).
    // labTargetDepth 0.35 ≢ schwung.bladeRadiusM 0.35 (melee) — named coincidence only; Do NOT Fake-wire depth←bladeRadiusM.
    var TARGET_VIS = { lab: "x-slab", host: "capsule-radius" };

    // REBUILD_VIS — intentional Lab-only drawFrac mesh-rebuild hysteresis (Feel-Entscheid .188). Do NOT Fake-add Host rebuild.
    // lab:"drawFrac-eps" = ARENA.bogen.labRebuildEps. host:"none" = Host bow has no draw-frac weapon rebuild.
    var REBUILD_VIS = { lab: "drawFrac-eps", host: "none" };

    // AIM_VIS — intentional Lab-only aim raise / undraw (Feel-Entscheid .189). Do NOT Fake-add Host aim.
    // lab:"raise-decay" = ARENA.bogen.labRaiseK/labDrawDecay. host:"none" = Host has no raise/drawFrac mesh path.
    var AIM_VIS = { lab: "raise-decay", host: "none" };

    // V18.491.238 Lab Schmiede rope solver iters; Host none (SEIL_VIS).
    // Do NOT Fake-align alley 16 back — one truth iters:18 for all ropes.
    var SEIL_GESETZ = { iters: 18 };
    var SEIL_VIS = { lab: "iters-18", host: "none" };

    // V18.491.244 Lab Schmiede thrust/lunge feel; Host none (AUSFALL_VIS).
    var AUSFALL_GESETZ = { durSec: 0.34, reachAmp: 0.55 };
    var AUSFALL_VIS = { lab: "lunge-0.34", host: "none" };

    // V18.491.245 Lab Schmiede edge sample count; Host none (SCHNEIDE_VIS).
    var SCHNEIDE_GESETZ = { samples: 8 };
    var SCHNEIDE_VIS = { lab: "samples-8", host: "none" };

    // V18.491.247 Lab Schmiede gauntlet rope recipe; Host none (KETTE_VIS).
    // ≠ SEIL_GESETZ.iters (constraint loop) · ≠ SCHNEIDE samples (edge hit) — do not Fake-merge.
    var KETTE_GESETZ = { segs: 7, len: 1.35, ballR: 0.20 };
    var KETTE_VIS = { lab: "gauntlet-7", host: "none" };

    // V18.491.250 Lab Schmiede Zielscheibe rings; Host none (SCHEIBE_VIS).
    // ≠ KETTE/SEIL — do not Fake-merge.
    var SCHEIBE_GESETZ = {
        R: 0.40,
        rings: [
            [1.0, 0xfff15a], [0.8, 0xfff15a], [0.6, 0xf24b4b], [0.45, 0xf24b4b],
            [0.32, 0x3aa0e0], [0.20, 0x3aa0e0], [0.10, 0x222222]
        ]
    };
    var SCHEIBE_VIS = { lab: "rings-7", host: "none" };

    // V18.491.251 Lab Schmiede arrow shaft; Host none (PFEIL_VIS).
    // ≠ SCHEIBE/KETTE/SEIL — do not Fake-merge. Dead LIFT stays unhoisted.
    var PFEIL_GESETZ = { L: 0.72, shR: 0.0035 };
    var PFEIL_VIS = { lab: "shaft-2", host: "none" };

    // V18.491.252 Lab Schmiede Pendel-Seil; Host none (PENDEL_VIS).
    // ≠ KETTE_GESETZ (gauntlet) · ≠ SEIL_GESETZ.iters · ≠ SCHNEIDE — do not Fake-merge.
    var PENDEL_GESETZ = { L: 1.26, ballR: 0.22, segs: 8 };
    var PENDEL_VIS = { lab: "pendel-8", host: "none" };

    // V18.491.253 Lab Schmiede Werkbank floor; Host none (BANK_VIS).
    // Live FLOOR_Y only — dead LIFT stays unhoisted. ≠ PENDEL/SCHEIBE.
    var BANK_GESETZ = { floorY: -0.26 };
    var BANK_VIS = { lab: "floor-1", host: "none" };

    // V18.491.255 Lab Schmiede weapon eye-height; Host none (HEBE_VIS).
    // Live weapon.y only — ≠ BANK.floorY · ≠ dead LIFT (do not Fake-merge).
    var HEBE_GESETZ = { y: 0.30 };
    var HEBE_VIS = { lab: "eye-1", host: "none" };

    // V18.491.256 Lab Schmiede Torii gate; Host none (TORII_VIS).
    // ≠ HEBE/BANK/PENDEL — do not Fake-merge.
    var TORII_GESETZ = { H: 3.6, W: 3.0 };
    var TORII_VIS = { lab: "gate-2", host: "none" };

    // V18.491.309 Lab Schmiede Torii lintels; Host none (BALKEN_VIS).
    // ≠ TORII_GESETZ H/W (overall gate) · ≠ PERGOLA / GESTELL / BOCK · ≠ LIFT — torii-balken only; do not Fake-merge.
    var BALKEN_GESETZ = {
        kasW: 0.4, kasH: 0.2, kasDL: 1.3, kasY: 0.16, kasRot: 0.03,
        shiW: 0.32, shiH: 0.14, shiDL: 0.9, shiY: -0.02,
        nukW: 0.24, nukH: 0.18, nukDL: 0.2, nukY: -0.7,
        gakW: 0.06, gakH: 0.5, gakD: 0.34, gakY: -0.38
    };
    var BALKEN_VIS = { lab: "torii-balken", host: "none" };

    // V18.491.310 Lab Schmiede Torii posts + feet; Host none (PFOSTEN_VIS).
    // ≠ TORII_GESETZ H/W · ≠ BALKEN_GESETZ · ≠ GESTELL posts · ≠ BOCK posts · ≠ LIFT — torii-pfosten only; do not Fake-merge.
    var PFOSTEN_GESETZ = { postR0: 0.13, postR1: 0.17, footR0: 0.22, footR1: 0.26, footH: 0.18, footY: 0.09 };
    var PFOSTEN_VIS = { lab: "torii-pfosten", host: "none" };

    // V18.491.257 Lab Schmiede Pergola height; Host none (PERGOLA_VIS).
    // ≠ TORII.H — do not Fake-merge.
    var PERGOLA_GESETZ = { H: 3.3 };
    var PERGOLA_VIS = { lab: "shade-1", host: "none" };

    // V18.491.311 Lab Schmiede Pergola posts + braces; Host none (STUTZE_VIS).
    // ≠ PERGOLA_GESETZ.H · ≠ PFOSTEN_GESETZ (Torii posts — separate twin) · ≠ TORII / BALKEN / GESTELL / BOCK · ≠ LIFT — pergola-stutze only; do not Fake-merge.
    var STUTZE_GESETZ = { postR0: 0.09, postR1: 0.12, braceW: 0.45, braceH: 0.45, braceD: 0.08, braceOff: 0.3, braceYOff: 0.45 };
    var STUTZE_VIS = { lab: "pergola-stutze", host: "none" };

    // V18.491.312 Lab Schmiede Pergola edge beams; Host none (RAND_VIS).
    // ≠ STUTZE_GESETZ · ≠ PERGOLA.H · ≠ DOJO bare 0.15/0.16 coincidence · ≠ LIFT — pergola-rand only; do not Fake-merge.
    var RAND_GESETZ = { extra: 0.4, beamH: 0.15, beamT: 0.16 };
    var RAND_VIS = { lab: "pergola-rand", host: "none" };

    // V18.491.313 Lab Schmiede Pergola rafters; Host none (SPARREN_VIS).
    // ≠ RAND_GESETZ.extra=0.4 (edge overhang ≠ rafter overhang 0.2) · ≠ BOCK.halfX=0.75 (step coincidence) · ≠ STUTZE / PERGOLA.H · ≠ LIFT — pergola-sparren only; do not Fake-merge.
    var SPARREN_GESETZ = { step: 0.75, minN: 4, extra: 0.2, h: 0.05, t: 0.06, yOff: 0.1 };
    var SPARREN_VIS = { lab: "pergola-sparren", host: "none" };

    // V18.491.314 Lab Schmiede Pergola paper lanterns; Host none (LEUCHTE_VIS).
    // ≠ LATERNE_GESETZ (stone lantern — different twin) · ≠ SPARREN / RAND / STUTZE / PERGOLA.H · ≠ LIFT — pergola-leuchte only; do not Fake-merge.
    var LEUCHTE_GESETZ = { R: 0.11, H: 0.24, off: 0.35, yOff: 0.5, capR0: 0.04, capR1: 0.12, capH: 0.05, capYOff: 0.36 };
    var LEUCHTE_VIS = { lab: "pergola-leuchte", host: "none" };

    // V18.491.259 Lab Schmiede bamboo stand; Host none (BAMBUS_VIS).
    // ≠ TORII/PERGOLA — do not Fake-merge. Lane bamboo N=7 stays Lab dual.
    var BAMBUS_GESETZ = { N: 4, gap: 0.65, hBase: 1.1, hAlt: 0.3 };
    var BAMBUS_VIS = { lab: "culm-4", host: "none" };

    // V18.491.260 Lab Schmiede banner pole height; Host none (BANNER_VIS).
    // ≠ PERGOLA.H / TORII.H — do not Fake-merge.
    var BANNER_GESETZ = { H: 4.4 };
    var BANNER_VIS = { lab: "pole-1", host: "none" };

    // V18.491.315 Lab Schmiede banner mast mesh; Host none (FAHNE_VIS).
    // ≠ BANNER_GESETZ.H (height already hoisted — mesh is separate twin) · ≠ LEUCHTE / LATERNE · ≠ other bare 0.05/0.07 sites · ≠ LIFT — banner-fahne only; do not Fake-merge.
    var FAHNE_GESETZ = {
        poleR0: 0.05, poleR1: 0.07,
        finR: 0.08,
        armW: 0.04, armH: 0.04, armL: 0.72, armYOff: 0.25, armZ: 0.36,
        clothW: 0.62, clothH: 1.5, clothYOff: 1.0, clothZ: 0.68,
        tipR: 0.31, tipH: 0.22, tipYOff: 1.86
    };
    var FAHNE_VIS = { lab: "banner-fahne", host: "none" };

    // V18.491.261 Lab Schmiede striking wand height; Host none (WAND_VIS).
    // ≠ BANNER.H — do not Fake-merge.
    var WAND_GESETZ = { H: 2.35 };
    var WAND_VIS = { lab: "staff-1", host: "none" };

    // V18.491.262 Lab Schmiede wand strike bands; Host none (BAND_VIS).
    // ≠ WAND.H — do not Fake-merge. arena.wand y0/y1 stay Lab-local.
    var BAND_GESETZ = { ys: [1.00, 1.20, 1.40, 1.60, 1.80] };
    var BAND_VIS = { lab: "bands-5", host: "none" };

    // V18.491.292 Lab Schmiede wand hit hull; Host none (HULL_VIS).
    // ≠ WAND_GESETZ.H · ≠ BAND_GESETZ.ys · ≠ PENDEL.ballR (0.22 coincidence) · ≠ LIFT — wand hit cylinder only; do not Fake-merge.
    var HULL_GESETZ = { R: 0.22, y0: 0.90, y1: 1.92 };
    var HULL_VIS = { lab: "wand-hit", host: "none" };

    // V18.491.293 Lab Schmiede courtyard practice rings; Host none (HOF_VIS).
    // ≠ SOCKEL (bamboo plinth) · ≠ GALGEN (pendulum frame) · ≠ KIRMES (carnival ducks) · ≠ RITTER_GESETZ.ringIn/Out · ≠ FOLGE.r=2.5 (coincidence only) · ≠ LIFT — hof rings only; do not Fake-merge.
    var HOF_GESETZ = { n: 6, step: 2.5, halfW: 0.025, segs: 56, y: 0.006 };
    var HOF_VIS = { lab: "hof-ringe", host: "none" };

    // V18.491.294 Lab Schmiede bamboo culm mesh (makeBamboo); Host none (HALM_VIS).
    // ≠ BAMBUS_GESETZ (stand N/gap/h) · ≠ SOCKEL_GESETZ (plinth) · ≠ HULL_GESETZ (wand hit) · ≠ HOF · ≠ LIFT — culm mesh only; do not Fake-merge.
    var HALM_GESETZ = { nodeLen: 0.32, rTop: 0.042, rBot: 0.048, cylSegs: 10, knotR: 0.047, knotT: 0.011, torusTub: 6, torusRad: 12 };
    var HALM_VIS = { lab: "bambus-halm", host: "none" };

    // V18.491.295 Lab Schmiede bamboo holder cup (buildBamboo + cutting lane); Host none (FASSUNG_VIS).
    // ≠ HALM_GESETZ (culm mesh) · ≠ BAMBUS_GESETZ (stand N/gap/h) · ≠ SOCKEL_GESETZ (plinth) · ≠ SCHNITT_GESETZ (lane layout) · ≠ HULL / HOF · ≠ LIFT — holder cup only; do not Fake-merge.
    var FASSUNG_GESETZ = { rTop: 0.06, rBot: 0.07, H: 0.18, segs: 8, y: 0.13 };
    var FASSUNG_VIS = { lab: "bambus-fassung", host: "none" };

    // V18.491.296 Lab Schmiede cutting-lane base plank; Host none (SCHWELLE_VIS).
    // ≠ SOCKEL_GESETZ (H=0.16 coincidence only — stand plinth ≠ lane base) · ≠ SCHNITT_GESETZ (lane layout) · ≠ FASSUNG / HALM / BAMBUS · ≠ LIFT — schnitt-schwelle only; do not Fake-merge.
    var SCHWELLE_GESETZ = { W: 0.5, H: 0.16, L: 4.6, y: 0.08 };
    var SCHWELLE_VIS = { lab: "schnitt-schwelle", host: "none" };

    // V18.491.297 Lab Schmiede carnival booth frame; Host none (BUDE_VIS).
    // ≠ KIRMES_GESETZ (duck amp/w0/dw — travel only) · ≠ GALGEN · ≠ SCHWELLE / SOCKEL / FASSUNG / HALM · ≠ LIFT — kirmes-bude only; do not Fake-merge.
    var BUDE_GESETZ = {
        wallW: 0.3, wallH: 2.4, wallL: 7.2, wallX: 0.25, wallY: 1.2,
        railYs: [0.8, 1.5, 2.2], railW: 0.08, railH: 0.06, railL: 7.2,
        topW: 0.5, topH: 0.25, topL: 7.4, topX: 0.1, topY: 2.5
    };
    var BUDE_VIS = { lab: "kirmes-bude", host: "none" };

    // V18.491.298 Lab Schmiede carnival duck row heights; Host none (REIHE_VIS).
    // ≠ BUDE_GESETZ.railYs [0.8,1.5,2.2] (rails ≠ duck rows; middle 1.5 coincidence) · ≠ KIRMES amp/w0/dw · ≠ GALGEN / SCHWELLE · ≠ LIFT — kirmes-reihen only; do not Fake-merge.
    var REIHE_GESETZ = { ys: [0.85, 1.5, 2.15] };
    var REIHE_VIS = { lab: "kirmes-reihen", host: "none" };

    // V18.491.299 Lab Schmiede carnival duck forward X; Host none (VOR_VIS).
    // ≠ REIHE_GESETZ.ys · ≠ BUDE_GESETZ (wallX/topX different) · ≠ KIRMES amp/w · ≠ LIFT — kirmes-vor only; do not Fake-merge.
    var VOR_GESETZ = { x: -0.1 };
    var VOR_VIS = { lab: "kirmes-vor", host: "none" };

    // V18.491.300 Lab Schmiede carnival duck hit hull; Host none (TREFF_VIS).
    // ≠ VOR_GESETZ.x · ≠ BUDE.wallW=0.3 (xPos coincidence) · ≠ HULL_GESETZ.R=0.22 (xNeg coincidence) · ≠ BANK.floorY / PENDEL.ballR · ≠ KIRMES / REIHE · ≠ LIFT — kirmes-treff only; do not Fake-merge.
    var TREFF_GESETZ = { xNeg: 0.22, xPos: 0.3, zHalf: 0.28, yHalf: 0.26 };
    var TREFF_VIS = { lab: "kirmes-treff", host: "none" };

    // V18.491.301 Lab Schmiede carnival duck mesh; Host none (ENTE_VIS).
    // ≠ TREFF_GESETZ (hit AABB) · ≠ KIRMES (travel amp/w) · ≠ VOR / REIHE / BUDE · ≠ LIFT — kirmes-ente only; do not Fake-merge.
    var ENTE_GESETZ = {
        bodyR: 0.18, sx: 1.3, sy: 1.0, sz: 0.6,
        headR: 0.1, headX: 0.17, headY: 0.15,
        beakR: 0.04, beakH: 0.1, beakX: 0.27, beakY: 0.15,
        ringN: 3, ringR0: 0.05, ringDr: 0.045, ringT: 0.014, ringX: -0.04, ringZ: 0.33
    };
    var ENTE_VIS = { lab: "kirmes-ente", host: "none" };

    // V18.491.302 Lab Schmiede swing-tatami frame; Host none (BOCK_VIS).
    // ≠ TATAMI_GESETZ (len/rollLen/amp/w) · ≠ GALGEN_GESETZ.span=1.7 (barL coincidence) · ≠ CLOUT.poleH=1.7 · ≠ ENTE / TREFF / KIRMES · ≠ LIFT — tatami-bock only; do not Fake-merge.
    var BOCK_GESETZ = {
        halfX: 0.75,
        postR0: 0.06, postR1: 0.07, postH: 2.4,
        barR: 0.05, barL: 1.7, barY: 2.4
    };
    var BOCK_VIS = { lab: "tatami-bock", host: "none" };

    // V18.491.303 Lab Schmiede tatami roll + binding rings; Host none (ROLLE_VIS).
    // ≠ TATAMI_GESETZ.rollLen · ≠ BOCK_GESETZ · ≠ ENTE_GESETZ.ringT=0.014 (coincidence only) · ≠ LIFT — tatami-rolle only; do not Fake-merge.
    var ROLLE_GESETZ = { R: 0.085, ringYs: [-0.34, 0, 0.34], ringR: 0.09, ringT: 0.014 };
    var ROLLE_VIS = { lab: "tatami-rolle", host: "none" };

    // V18.491.304 Lab Schmiede tatami hang rope radius; Host none (STRICK_VIS).
    // ≠ SEIL_GESETZ.iters (solver) · ≠ SCHAUKEL bare 0.012 rope (coincidence — leave SCHAUKEL alone) · ≠ ROLLE / BOCK / TATAMI.len · ≠ LIFT — tatami-strick only; do not Fake-merge.
    var STRICK_GESETZ = { R: 0.012 };
    var STRICK_VIS = { lab: "tatami-strick", host: "none" };

    // V18.491.305 Lab Schmiede swing-target hang rope mesh; Host none (LEINE_VIS).
    // ≠ STRICK_GESETZ (tatami rope — R coincidence only) · ≠ SCHAUKEL_GESETZ.L=1.55 (dynamics ≠ mesh L=1.5) · ≠ SEIL_GESETZ.iters · ≠ LIFT — schaukel-leine only; do not Fake-merge.
    var LEINE_GESETZ = { R: 0.012, L: 1.5 };
    var LEINE_VIS = { lab: "schaukel-leine", host: "none" };

    // V18.491.306 Lab Schmiede swing-target frame; Host none (GESTELL_VIS).
    // ≠ PERGOLA_GESETZ.H=3.3 (shade vs swing frame — coincidence only) · ≠ BOCK_GESETZ (tatami posts/bar) · ≠ LEINE / SCHAUKEL dynamics / GASSE · ≠ LIFT — schaukel-gestell only; do not Fake-merge.
    var GESTELL_GESETZ = {
        halfZ: 1.1,
        postR0: 0.08, postR1: 0.1, postH: 3.3,
        beamW: 0.14, beamH: 0.14, beamL: 2.6, beamY: 3.3
    };
    var GESTELL_VIS = { lab: "schaukel-gestell", host: "none" };

    // V18.491.307 Lab Schmiede swing-target face rings; Host none (BLATT_VIS).
    // ≠ SCHEIBE_GESETZ (archery static face) · ≠ ROLLE_GESETZ.ringR=0.09 (tatami binding coincidence) · ≠ ENTE.ringDr=0.045 (thk0 coincidence) · ≠ GESTELL / LEINE / SCHAUKEL · ≠ LIFT — schaukel-blatt only; do not Fake-merge.
    var BLATT_GESETZ = { n: 4, rStep: 0.09, thk0: 0.045, dThk: 0.004 };
    var BLATT_VIS = { lab: "schaukel-blatt", host: "none" };

    // V18.491.308 Lab Schmiede swing-target rest height; Host none (RUHE_VIS).
    // ≠ GESTELL.beamY=3.3 · ≠ SCHAUKEL.L=1.55 · ≠ LEINE.L=1.5 · ≠ BLATT / REIHE · ≠ LIFT — schaukel-ruhe only; do not Fake-merge.
    var RUHE_GESETZ = { y: 1.75 };
    var RUHE_VIS = { lab: "schaukel-ruhe", host: "none" };

    // V18.491.263 Lab Schmiede clout target; Host none (CLOUT_VIS).
    // ≠ SCHEIBE/BAND — do not Fake-merge.
    var CLOUT_GESETZ = { cols: [0xe0d088, 0xc85a3a, 0xcab876], step: 0.5, poleH: 1.7, hitR: 1.5 };
    var CLOUT_VIS = { lab: "clout-3", host: "none" };

    // V18.491.266 Lab Schmiede hay bale; Host none (HEU_VIS).
    // ≠ CLOUT — do not Fake-merge.
    var HEU_GESETZ = { r: 0.42, len: 0.78, bandR: 0.43, bandTube: 0.018, bandOff: 0.2 };
    var HEU_VIS = { lab: "bale-2", host: "none" };

    // V18.491.267 Lab Schmiede stone lantern; Host none (LATERNE_VIS).
    // ≠ HEU — do not Fake-merge.
    var LATERNE_GESETZ = {
        baseR0: 0.19, baseR1: 0.23, baseH: 0.2, baseY: 0.1,
        postR0: 0.07, postR1: 0.08, postH: 0.66, postY: 0.53,
        boxW: 0.29, boxH: 0.27, boxD: 0.29, boxY: 0.99,
        capR: 0.27, capH: 0.2, capY: 1.22,
        topR: 0.05, topY: 1.35
    };
    var LATERNE_VIS = { lab: "toro-1", host: "none" };

    // V18.491.268 Lab Schmiede brazier; Host none (KOHLE_VIS).
    // ≠ LATERNE/HEU — do not Fake-merge.
    var KOHLE_GESETZ = {
        legs: 3,
        legR0: 0.02, legR1: 0.025, legH: 0.82,
        legRad: 0.17, legY: 0.4, legTilt: 0.32,
        bowlR0: 0.3, bowlR1: 0.17, bowlH: 0.22, bowlY: 0.84,
        coalR: 0.26, coalH: 0.07, coalY: 0.95
    };
    var KOHLE_VIS = { lab: "braise-1", host: "none" };

    // V18.491.269 Lab Schmiede stone path; Host none (PFAD_VIS).
    // ≠ KOHLE/LATERNE — do not Fake-merge. curbZ is half-spacing (±curbZ).
    var PFAD_GESETZ = {
        x0: -3, x1: 40, step: 1.45,
        slabW: 1.25, slabH: 0.06, slabD: 2.4, slabY: 0.03,
        curbZ: 1.35, curbW: 43, curbH: 0.1, curbD: 0.14, curbX: 18.5, curbY: 0.05
    };
    var PFAD_VIS = { lab: "path-1", host: "none" };

    // V18.491.271 Lab Schmiede spring-pell; Host none (FEDER_VIS).
    // ≠ KETTE_GESETZ / PENDEL_GESETZ / HEBE / LIFT — do not Fake-merge.
    var FEDER_GESETZ = { H: 1.15, k: 26, damp: 2.6, hitR: 0.27 };
    var FEDER_VIS = { lab: "spring-pell", host: "none" };

    // V18.491.272 Lab Schmiede armored dummy; Host none (HARNISCH_VIS).
    // ≠ FEDER / KETTE / PENDEL / HEBE / LIFT — do not Fake-merge.
    var HARNISCH_GESETZ = { scale: 0.82, hitCD: 0.28, hitR: 0.42, y0: 0.7, y1: 2.18 };
    var HARNISCH_VIS = { lab: "armored-dummy", host: "none" };

    // V18.491.273 Lab Schmiede sequence arc; Host none (FOLGE_VIS).
    // ≠ HARNISCH / FEDER / KETTE / PENDEL / LIFT — do not Fake-merge.
    var FOLGE_GESETZ = { N: 5, spread: Math.PI * 0.66, r: 2.5 };
    var FOLGE_VIS = { lab: "sequence-arc", host: "none" };

    // V18.491.274 Lab Schmiede gauntlet corridor; Host none (GASSE_VIS).
    // ≠ KETTE_GESETZ (rope) · ≠ FOLGE · ≠ FEDER · ≠ LIFT — corridor layout only; do not Fake-merge.
    var GASSE_GESETZ = { N: 4, gap: 1.8, H: 3.0 };
    var GASSE_VIS = { lab: "gauntlet-corridor", host: "none" };

    // V18.491.275 Lab Schmiede knight arena; Host none (RITTER_VIS).
    // ≠ HARNISCH_GESETZ (dummy) · ≠ GASSE · ≠ KETTE · ≠ LIFT — arena ring/HP only; do not Fake-merge.
    var RITTER_GESETZ = { ringIn: 4.4, ringOut: 4.62, bannerR: 4.75, hpArm: 3, hpBare: 2 };
    var RITTER_VIS = { lab: "knight-arena", host: "none" };

    // V18.491.276 Lab Schmiede clay thrower; Host none (TON_VIS).
    // ≠ SCHEIBE_GESETZ (archery face) · ≠ RITTER · ≠ HARNISCH · ≠ LIFT — clay pigeon timing/ballistics only; do not Fake-merge.
    var TON_GESETZ = { nearR: 30, nextT0: 1.5, liftY: 0.95, vyBase: 7.5, hitR: 0.45 };
    var TON_VIS = { lab: "clay-thrower", host: "none" };

    // V18.491.277 Lab Schmiede Streitpuppe charger; Host none (STREIT_VIS).
    // ≠ TON · ≠ RITTER · ≠ HARNISCH · ≠ LIFT — Streitpuppe charge/near/hit only; do not Fake-merge.
    var STREIT_GESETZ = { speed: 3.0, nearR: 6.5, hitR: 1.7 };
    var STREIT_VIS = { lab: "charger", host: "none" };

    // V18.491.278 Lab Schmiede swing target; Host none (SCHAUKEL_VIS).
    // ≠ PENDEL_GESETZ (rope-ball) · ≠ STREIT · ≠ TON · ≠ LIFT — archery swing target only; do not Fake-merge.
    var SCHAUKEL_GESETZ = { L: 1.55, R: 0.36, ang0: 0.6 };
    var SCHAUKEL_VIS = { lab: "swing-target", host: "none" };

    // V18.491.279 Lab Schmiede quintain; Host none (QUINT_VIS).
    // ≠ SCHAUKEL_GESETZ (swing target; R coincidence) · ≠ PENDEL · ≠ STREIT · ≠ LIFT — quintain post/arm/shield only; do not Fake-merge.
    var QUINT_GESETZ = { postH: 1.32, armLen: 1.0, shieldR: 0.36 };
    var QUINT_VIS = { lab: "quintain", host: "none" };

    // V18.491.280 Lab Schmiede Drehbaum (spintree); Host none (DREH_VIS).
    // ≠ QUINT_GESETZ (quintain arm) · ≠ SCHAUKEL · ≠ PENDEL · ≠ BAMBUS · ≠ LIFT — Drehbaum only; do not Fake-merge.
    var DREH_GESETZ = { H: 1.5, armLen: 0.92, padR: 0.18 };
    var DREH_VIS = { lab: "spintree", host: "none" };

    // V18.491.281 Lab Schmiede swing-tatami; Host none (TATAMI_VIS).
    // ≠ SCHAUKEL_GESETZ (archery target) · ≠ DREH · ≠ PENDEL · ≠ LIFT — swinging tatami roll only; do not Fake-merge.
    var TATAMI_GESETZ = { len: 0.55, rollLen: 1.0, amp: 0.7, w: 1.4 };
    var TATAMI_VIS = { lab: "swing-tatami", host: "none" };

    // V18.491.282 Lab Schmiede pendulum frame; Host none (GALGEN_VIS).
    // ≠ PENDEL_GESETZ (rope/ball) · ≠ TATAMI · ≠ SCHAUKEL · ≠ LIFT — frame posts/beam only; do not Fake-merge.
    var GALGEN_GESETZ = { H: 2.7, span: 1.7 };
    var GALGEN_VIS = { lab: "pendulum-frame", host: "none" };

    // V18.491.283 Lab Schmiede carnival ducks; Host none (KIRMES_VIS).
    // ≠ GALGEN_GESETZ (H=2.7 coincidence only) · ≠ TATAMI.w · ≠ LIFT — duck travel amp/ω only; do not Fake-merge.
    var KIRMES_GESETZ = { amp: 2.7, w0: 0.55, dw: 0.18 };
    var KIRMES_VIS = { lab: "carnival-ducks", host: "none" };

    // V18.491.284 Lab Schmiede cutting lane (Zickzack); Host none (SCHNITT_VIS).
    // ≠ GASSE_GESETZ (gauntlet) · ≠ BAMBUS_GESETZ (stand N=4; lane dual stays named) · ≠ KIRMES · ≠ LIFT — Schnittgasse layout only; do not Fake-merge.
    var SCHNITT_GESETZ = { N: 7, span: 4.4, h0: 1.25, dh: 0.55 };
    var SCHNITT_VIS = { lab: "cutting-lane", host: "none" };

    // V18.491.285 Lab Schmiede popinjay; Host none (PAPAGEI_VIS).
    // ≠ CLOUT.poleH · ≠ BANNER_H · ≠ SCHNITT · ≠ LIFT — papagei mast/hit only; do not Fake-merge.
    var PAPAGEI_GESETZ = { poleH: 4.6, hitR: 0.36 };
    var PAPAGEI_VIS = { lab: "popinjay", host: "none" };

    // V18.491.286 Lab Schmiede range placements; Host none (BAHN_VIS).
    // ≠ SCHEIBE_GESETZ (face rings) · ≠ CLOUT · ≠ PAPAGEI · ≠ LIFT — range placement table only; do not Fake-merge.
    var BAHN_GESETZ = { specs: [[17, 1.42, -0.5, 0.40], [23, 1.42, 0.4, 0.40], [31, 1.42, 1.0, 0.40], [20, 1.2, -3.2, 0.20]] };
    var BAHN_VIS = { lab: "range-specs", host: "none" };

    // V18.491.287 Lab Schmiede thrust rings (Stechringe); Host none (STECH_VIS).
    // ≠ SCHEIBE · ≠ BAHN · ≠ KETTE · ≠ STREIT (charger) · ≠ LIFT — Stechringe layout only; do not Fake-merge.
    var STECH_GESETZ = { R: 0.16, barH: 2.5, postX: 1.35, spots: [[-0.85, 1.50], [0, 1.42], [0.85, 1.55]] };
    var STECH_VIS = { lab: "thrust-rings", host: "none" };

    // V18.491.288 Lab Schmiede straw pell; Host none (PELL_VIS).
    // ≠ HARNISCH_GESETZ (armored) · ≠ FEDER (spring-pell) · ≠ ARENA.zonen (hit fracs stay) · ≠ LIFT — straw pell structure only; do not Fake-merge.
    var PELL_GESETZ = { postH: 1.65, torsoY: 1.12, torsoH: 0.62, torsoR: 0.17 };
    var PELL_VIS = { lab: "straw-pell", host: "none" };

    // V18.491.289 Lab Schmiede dojo courtyard; Host none (DOJO_VIS).
    // ≠ PERGOLA_GESETZ (H=3.3 coincidence only — shade vs court) · ≠ PELL · ≠ LIFT — dojo frame only; do not Fake-merge.
    var DOJO_GESETZ = { postH: 3.3, x0: 0.2, x1: 6.9, z0: -0.4, z1: 6.5, wallH: 2.7 };
    var DOJO_VIS = { lab: "dojo-court", host: "none" };

    // V18.491.316 Lab Schmiede dojo roof edge beams; Host none (TRAEGER_VIS).
    // ≠ RAND_GESETZ (pergola edge — H/T 0.15/0.16 coincidence only) · ≠ DOJO_GESETZ.postH=3.3 (≠ beam y=3.25) / spans · ≠ PERGOLA.H · ≠ BALKEN · ≠ LIFT — dojo-traeger only; do not Fake-merge.
    var TRAEGER_GESETZ = { Lx: 7.1, Lz: 7.3, H: 0.15, T: 0.16, x: 3.55, z: 3.05, y: 3.25 };
    var TRAEGER_VIS = { lab: "dojo-traeger", host: "none" };

    // V18.491.317 Lab Schmiede dojo roof rafters; Host none (LATTE_VIS).
    // ≠ SPARREN_GESETZ (pergola — H/T 0.05/0.06 coincidence) · ≠ TRAEGER_GESETZ (L/x coincidence; y≠3.25) · ≠ DOJO_GESETZ.z0=-0.4 (layout vs rafter seed) · ≠ LIFT — dojo-latte only; do not Fake-merge.
    var LATTE_GESETZ = { n: 9, z0: -0.4, span: 6.9, L: 7.1, H: 0.05, T: 0.06, x: 3.55, y: 3.36 };
    var LATTE_VIS = { lab: "dojo-latte", host: "none" };

    // V18.491.318 Lab Schmiede dojo corner posts; Host none (STEHER_VIS).
    // ≠ PFOSTEN_GESETZ (Torii) · ≠ STUTZE_GESETZ (Pergola) · ≠ DOJO_GESETZ.postH · ≠ LATTE · ≠ LIFT — dojo-steher only; do not Fake-merge.
    var STEHER_GESETZ = { R0: 0.085, R1: 0.11 };
    var STEHER_VIS = { lab: "dojo-steher", host: "none" };

    // V18.491.319 Lab Schmiede dojo knee braces; Host none (KNIE_VIS).
    // ≠ STUTZE_GESETZ braces (0.45/0.3/yOff — different twin; D=0.08 coincidence) · ≠ STEHER / DOJO / LATTE / TRAEGER · ≠ GALGEN L1620 brace site · ≠ LIFT — dojo-knie only; do not Fake-merge.
    var KNIE_GESETZ = { W: 0.5, H: 0.5, D: 0.08, off: 0.32, y: 2.95, mid: 3.5 };
    var KNIE_VIS = { lab: "dojo-knie", host: "none" };

    // V18.491.320 Lab Schmiede dojo paper lanterns; Host none (PAPIER_VIS).
    // ≠ LEUCHTE_GESETZ (pergola; R/H/yOff different; no string) · ≠ LATERNE_GESETZ (stone toro) · ≠ KNIE / STEHER / DOJO · ≠ sill y=2.78 coincidence · ≠ LIFT — dojo-papier only; do not Fake-merge.
    var PAPIER_GESETZ = {
        R: 0.12, H: 0.26, y: 2.78,
        capR0: 0.04, capR1: 0.13, capH: 0.05, capY: 2.93,
        strR: 0.005, strH: 0.34, strY: 3.12,
        corners: [[1.1, 0.1], [6.0, 0.1], [1.1, 6.0], [6.0, 6.0]]
    };
    var PAPIER_VIS = { lab: "dojo-papier", host: "none" };

    // V18.491.321 Lab Schmiede GALGEN knee braces; Host none (STREBE_VIS).
    // ≠ KNIE_GESETZ (dojo; off 0.32 / absolute y / mid) · ≠ STUTZE_GESETZ braces (0.45×0.45; off/yOff coincidence only) · ≠ GALGEN_GESETZ H/span · ≠ PAPIER · ≠ LIFT — galgen-strebe only; do not Fake-merge.
    var STREBE_GESETZ = { W: 0.5, H: 0.5, D: 0.08, off: 0.3, yOff: 0.45 };
    var STREBE_VIS = { lab: "galgen-strebe", host: "none" };

    // V18.491.322 Lab Schmiede GALGEN posts; Host none (SAULE_VIS).
    // ≠ PFOSTEN_GESETZ · ≠ STUTZE_GESETZ.postR* · ≠ STEHER_GESETZ · ≠ GALGEN_GESETZ H/span · ≠ STREBE · ≠ LIFT — galgen-saule only; do not Fake-merge.
    var SAULE_GESETZ = { R0: 0.08, R1: 0.10 };
    var SAULE_VIS = { lab: "galgen-saule", host: "none" };

    // V18.491.323 Lab Schmiede GALGEN foot; Host none (FUSS_VIS).
    // ≠ PFOSTEN_GESETZ foot (cylinder) · ≠ SAULE · ≠ STREBE · ≠ GALGEN H/span · ≠ SOCKEL · ≠ LIFT — galgen-fuss only; do not Fake-merge.
    var FUSS_GESETZ = { W: 0.42, H: 0.12, D: 0.55, y: 0.06 };
    var FUSS_VIS = { lab: "galgen-fuss", host: "none" };

    // V18.491.324 Lab Schmiede GALGEN crossbeam; Host none (QUER_VIS).
    // ≠ BALKEN_GESETZ (Torii) · ≠ RAND_GESETZ (extra=0.4 coincidence only — different H/T) · ≠ TRAEGER_GESETZ (Dojo) · ≠ GALGEN H/span · ≠ FUSS/SAULE/STREBE · ≠ LIFT — galgen-quer only; do not Fake-merge.
    var QUER_GESETZ = { extra: 0.4, H: 0.17, T: 0.18 };
    var QUER_VIS = { lab: "galgen-quer", host: "none" };

    // V18.491.325 Lab Schmiede GALGEN eye; Host none (OESE_VIS).
    // ≠ ROLLE_GESETZ.ringT=0.014 (coincidence) · ≠ ENTE_GESETZ.ringR0=0.05 (coincidence) · ≠ QUER/FUSS/SAULE/STREBE/GALGEN H·span · ≠ LIFT — galgen-oese only; do not Fake-merge.
    var OESE_GESETZ = { R: 0.05, tube: 0.014, yOff: 0.05 };
    var OESE_VIS = { lab: "galgen-oese", host: "none" };

    // V18.491.326 Lab Schmiede pendulum rope-seg radius; Host none (STRANG_VIS).
    // ≠ STRICK_GESETZ R=0.012 · ≠ LEINE_GESETZ R=0.012 · ≠ SEIL_GESETZ.iters · ≠ OESE · ≠ LIFT — pendel-strang only; do not Fake-merge.
    var STRANG_GESETZ = { R: 0.016 };
    var STRANG_VIS = { lab: "pendel-strang", host: "none" };

    // V18.491.327 Lab Schmiede pendulum ball band; Host none (REIF_VIS).
    // ≠ BAND_GESETZ (wand ys — name clash avoided by REIF) · ≠ OESE_GESETZ · ≠ ROLLE_GESETZ · ≠ STRANG · ≠ PENDEL.ballR · ≠ LIFT — pendel-reif only; do not Fake-merge.
    var REIF_GESETZ = { mul: 0.86, tube: 0.02 };
    var REIF_VIS = { lab: "pendel-reif", host: "none" };

    // V18.491.328 Lab Schmiede dojo back wall panel; Host none (RUECK_VIS).
    // ≠ WAND_GESETZ (striking wand) · ≠ DOJO_GESETZ.wallH (height only — panel T/L/x/z separate) · ≠ HULL · ≠ SCHWELLE · ≠ PAPIER · ≠ LIFT — dojo-rueck only; do not Fake-merge.
    var RUECK_GESETZ = { T: 0.18, L: 9.4, x: -3.4, z: 2.6 };
    var RUECK_VIS = { lab: "dojo-rueck", host: "none" };

    // V18.491.329 Lab Schmiede dojo wall studs; Host none (STIEL_VIS).
    // ≠ RUECK_GESETZ (panel) · ≠ LATTE_GESETZ (roof) · ≠ GASSE_GESETZ.gap=1.8 (coincidence) · ≠ DOJO.wallH · ≠ STEHER · ≠ LIFT — dojo-stiel only; do not Fake-merge.
    var STIEL_GESETZ = { W: 0.22, T: 0.1, n: 6, step: 1.8, x: -3.32, zMid: 2.6, half: 4.5 };
    var STIEL_VIS = { lab: "dojo-stiel", host: "none" };

    // V18.491.330 Lab Schmiede dojo sill; Host none (SIMS_VIS).
    // ≠ SCHWELLE_GESETZ · ≠ PAPIER_GESETZ.y=2.78 (coincidence only) · ≠ RUECK.L/z · ≠ STIEL · ≠ BANK · ≠ LIFT — dojo-sims only; do not Fake-merge.
    var SIMS_GESETZ = { W: 0.4, H: 0.12, L: 9.4, x: -3.35, y: 2.78, z: 2.6 };
    var SIMS_VIS = { lab: "dojo-sims", host: "none" };

    // V18.491.331 Lab Schmiede striking-wand rod; Host none (STAB_VIS).
    // ≠ WAND_GESETZ.H · ≠ BAND_GESETZ.ys · ≠ HULL_GESETZ · ≠ tip cone R=0.055 coincidence · ≠ LIFT — wand-stab only; do not Fake-merge.
    var STAB_GESETZ = { R0: 0.035, R1: 0.055 };
    var STAB_VIS = { lab: "wand-stab", host: "none" };

    // V18.491.332 Lab Schmiede wand strike-band mesh; Host none (STREIF_VIS).
    // ≠ BAND_GESETZ.ys (positions — different twin) · ≠ STAB_GESETZ · ≠ WAND.H · ≠ HULL · ≠ LIFT — wand-streif only; do not Fake-merge.
    var STREIF_GESETZ = { R: 0.065, H: 0.20 };
    var STREIF_VIS = { lab: "wand-streif", host: "none" };

    // V18.491.333 Lab Schmiede wand tip cone; Host none (SPITZE_VIS).
    // ≠ STAB_GESETZ.R1=0.055 (coincidence) · ≠ STREIF · ≠ BAND.ys · ≠ WAND.H · ≠ FAHNE · ≠ LIFT — wand-spitze only; do not Fake-merge.
    var SPITZE_GESETZ = { R: 0.055, H: 0.16, yOff: 0.06 };
    var SPITZE_VIS = { lab: "wand-spitze", host: "none" };

    // V18.491.334 Lab Schmiede wand find-flag; Host none (WIMPEL_VIS).
    // ≠ FAHNE_GESETZ (banner mast) · ≠ SPITZE · ≠ STREIF · ≠ BANNER.H · ≠ LIFT — wand-wimpel only; do not Fake-merge.
    var WIMPEL_GESETZ = { W: 0.44, H: 0.28, xOff: 0.24, yOff: 0.12 };
    var WIMPEL_VIS = { lab: "wand-wimpel", host: "none" };

    // V18.491.335 Lab Schmiede wand base; Host none (STAND_VIS).
    // ≠ HULL_GESETZ.R=0.22 (coincidence) · ≠ SOCKEL_GESETZ · ≠ FUSS_GESETZ · ≠ WIMPEL/SPITZE/STAB · ≠ LIFT — wand-stand only; do not Fake-merge.
    var STAND_GESETZ = { R0: 0.16, R1: 0.22, H: 0.18, y: 0.09 };
    var STAND_VIS = { lab: "wand-stand", host: "none" };

    // V18.491.336 Lab Schmiede weapon-table body height; Host none (TISCH_VIS).
    // ≠ RACK_GESETZ (pitch/margin) · ≠ STAND · ≠ BANK.floorY · ≠ LIFT — waffen-tisch only; do not Fake-merge.
    var TISCH_GESETZ = { H: 0.82 };
    var TISCH_VIS = { lab: "waffen-tisch", host: "none" };

    // V18.491.337 Lab Schmiede weapon-table top; Host none (PLATTE_VIS).
    // ≠ TISCH_GESETZ.H · ≠ RACK pitch/margin · ≠ REIHE.ys 0.85 coincidence · ≠ LIFT — waffen-platte only; do not Fake-merge.
    var PLATTE_GESETZ = { X: 0.62, H: 0.06, y: 0.85 };
    var PLATTE_VIS = { lab: "waffen-platte", host: "none" };

    // V18.491.338 Lab Schmiede weapon-table rail; Host none (SCHIENE_VIS).
    // ≠ RACK_GESETZ.pitch (Y-extent reuse intentional — keep RACK_PITCH for Box Y) · ≠ PLATTE_GESETZ.H=0.06 coincidence · ≠ TISCH · ≠ LIFT — waffen-schiene only; do not Fake-merge.
    var SCHIENE_GESETZ = { T: 0.06, x: -0.27, y: 1.13 };
    var SCHIENE_VIS = { lab: "waffen-schiene", host: "none" };

    // V18.491.339 Lab Schmiede rack weapon pose; Host none (HALTUNG_VIS).
    // ≠ RACK_GESETZ · ≠ SCHIENE_GESETZ.y=1.13 · ≠ PLATTE.y=0.85 · ≠ LIFT — rack-haltung only; do not Fake-merge.
    var HALTUNG_GESETZ = { y: 0.9, rotX: -0.12 };
    var HALTUNG_VIS = { lab: "rack-haltung", host: "none" };

    // V18.491.340 Lab Schmiede sequence pad mesh; Host none (PAD_VIS).
    // ≠ FOLGE_GESETZ (N/spread/r only) · ≠ PLATTE/TISCH/SCHIENE/RACK · ≠ STAND/SOCKEL/FUSS · ≠ LIFT — sequence pad mesh only; do not Fake-merge.
    var PAD_GESETZ = { postR0: 0.05, postR1: 0.07, postH: 1.45, postY: 0.72, padXY: 0.42, padZ: 0.07, padY: 1.5, rimR: 0.24, rimTube: 0.025 };
    var PAD_VIS = { lab: "sequence-pad", host: "none" };

    // V18.491.341 Lab Schmiede clout find-flag; Host none (FAEHNE_VIS).
    // ≠ WIMPEL_GESETZ (wand find-flag) · ≠ FAHNE_GESETZ (banner mast) · ≠ CLOUT_GESETZ (cols/step/poleH/hitR) · ≠ CLOUT.step=0.5 / PAD.postH=1.45 coincidence · ≠ LIFT — clout-fahne only; do not Fake-merge.
    var FAEHNE_GESETZ = { W: 0.5, H: 0.3, xOff: 0.27, y: 1.45 };
    var FAEHNE_VIS = { lab: "clout-fahne", host: "none" };

    // V18.491.342 Lab Schmiede clout mast mesh; Host none (MAST_VIS).
    // ≠ CLOUT_GESETZ.poleH (logic height) · ≠ FAEHNE_GESETZ (flag plane) · ≠ WIMPEL/FAHNE (banner) · ≠ PAD post · ≠ PFOSTEN/STEHER/SAULE · ≠ LIFT — clout-mast only; do not Fake-merge.
    var MAST_GESETZ = { R0: 0.03, R1: 0.03, y: 0.85 };
    var MAST_VIS = { lab: "clout-mast", host: "none" };

    // V18.491.343 Lab Schmiede clout ring mesh; Host none (RING_VIS).
    // ≠ MAST_GESETZ.R=0.03 coincidence · ≠ CLOUT_GESETZ.step · ≠ FAEHNE · ≠ REIF/OESE/ROLLE · ≠ LIFT — clout-ring only; do not Fake-merge.
    var RING_GESETZ = { H: 0.03, y0: 0.015, yStep: 0.004 };
    var RING_VIS = { lab: "clout-ring", host: "none" };

    // V18.491.344 Lab Schmiede armored-dummy base; Host none (PODES_VIS).
    // ≠ HARNISCH_GESETZ (logic) · ≠ STAND_GESETZ (H/y coincidence — wand base) · ≠ FUSS · ≠ SOCKEL · ≠ PFOSTEN · ≠ MAST/RING · ≠ LIFT — dummy-podes only; do not Fake-merge.
    var PODES_GESETZ = { R0: 0.40, R1: 0.50, H: 0.18, y: 0.09 };
    var PODES_VIS = { lab: "dummy-podes", host: "none" };

    // V18.491.345 Lab Schmiede armored-dummy post; Host none (PFOST_VIS).
    // ≠ PODES_GESETZ (base) · ≠ PAD_GESETZ post · ≠ PFOSTEN/STEHER/SAULE/STUTZE · ≠ GESTELL postR coincidence · ≠ MAST · ≠ HARNISCH · ≠ LIFT — dummy-pfost only; do not Fake-merge.
    var PFOST_GESETZ = { R0: 0.06, R1: 0.07, H: 0.85, y: 0.52 };
    var PFOST_VIS = { lab: "dummy-pfost", host: "none" };

    // V18.491.346 Lab Schmiede armored-dummy legs; Host none (BEIN_VIS).
    // ≠ PFOST_GESETZ · ≠ STUTZE_GESETZ.R0=0.09 coincidence · ≠ PAD · ≠ PODES · ≠ STEHER · ≠ LIFT — dummy-bein only; do not Fake-merge.
    var BEIN_GESETZ = { R0: 0.09, R1: 0.07, H: 0.7, xOff: 0.13, y: 0.95 };
    var BEIN_VIS = { lab: "dummy-bein", host: "none" };

    // V18.491.347 Lab Schmiede armored-dummy torso; Host none (RUMPF_VIS).
    // ≠ BEIN_GESETZ · ≠ HARNISCH_GESETZ (logic) · ≠ PFOST · ≠ PODES · ≠ knight torso (y=1.28 / R0 conditional) · ≠ LIFT — dummy-rumpf only; do not Fake-merge.
    var RUMPF_GESETZ = { R0: 0.27, R1: 0.22, H: 0.78, y: 1.56, scaleZ: 0.72 };
    var RUMPF_VIS = { lab: "dummy-rumpf", host: "none" };

    // V18.491.348 Lab Schmiede armored-dummy ridge; Host none (GRAT_VIS).
    // ≠ RUMPF_GESETZ.y coincidence · ≠ HARNISCH · ≠ BEIN.H=0.7 coincidence · ≠ knight ridge (y=1.28) · ≠ LIFT — dummy-grat only; do not Fake-merge.
    var GRAT_GESETZ = { W: 0.03, H: 0.7, D: 0.16, y: 1.56, z: 0.20 };
    var GRAT_VIS = { lab: "dummy-grat", host: "none" };

    // V18.491.349 Lab Schmiede armored-dummy surcoat; Host none (WAMS_VIS).
    // ≠ RUMPF_GESETZ · ≠ HARNISCH · ≠ GRAT · ≠ knight surcoat (R0/R1 0.30/0.26) · ≠ LIFT — dummy-wams only; do not Fake-merge.
    var WAMS_GESETZ = { R0: 0.28, R1: 0.25, H: 0.46, y: 1.42, scaleZ: 0.74 };
    var WAMS_VIS = { lab: "dummy-wams", host: "none" };

    // V18.491.350 Lab Schmiede armored-dummy pauldron; Host none (SCHULTER_VIS).
    // ≠ WAMS_GESETZ · ≠ knight pauldron (y=1.67) · ≠ RUMPF · ≠ HARNISCH · ≠ LIFT — dummy-schulter only; do not Fake-merge.
    var SCHULTER_GESETZ = { R: 0.15, xOff: 0.29, y: 1.95, scaleY: 0.82, scaleZ: 0.92 };
    var SCHULTER_VIS = { lab: "dummy-schulter", host: "none" };

    // V18.491.351 Lab Schmiede armored-dummy neck; Host none (HALS_VIS).
    // ≠ SCHULTER_GESETZ · ≠ HELM (not yet) · ≠ RUMPF · ≠ knight neck (y=1.78) · ≠ LIFT — dummy-hals only; do not Fake-merge.
    var HALS_GESETZ = { R0: 0.10, R1: 0.12, H: 0.12, y: 2.06 };
    var HALS_VIS = { lab: "dummy-hals", host: "none" };

    // V18.491.352 Lab Schmiede armored-dummy helm; Host none (HELM_VIS).
    // ≠ HALS_GESETZ · ≠ knight helm (y=1.95) · ≠ SCHULTER · ≠ VISIER/KAMM · ≠ LIFT — dummy-helm only; do not Fake-merge.
    var HELM_GESETZ = { R: 0.17, y: 2.23, scaleY: 1.12, scaleZ: 1.05 };
    var HELM_VIS = { lab: "dummy-helm", host: "none" };

    // V18.491.353 Lab Schmiede armored-dummy visor; Host none (VISIER_VIS).
    // ≠ HELM_GESETZ · ≠ KAMM · ≠ knight visor (y=1.94) · ≠ LIFT — dummy-visier only; do not Fake-merge.
    var VISIER_GESETZ = { W: 0.30, H: 0.035, D: 0.06, y: 2.22, z: 0.16 };
    var VISIER_VIS = { lab: "dummy-visier", host: "none" };

    // V18.491.354 Lab Schmiede armored-dummy crest; Host none (KAMM_VIS).
    // ≠ GRAT_GESETZ.W=0.03 coincidence · ≠ knight crest (0.03/0.13/0.24 @ y=2.13) · ≠ VISIER · ≠ HELM · ≠ LIFT — dummy-kamm only; do not Fake-merge.
    var KAMM_GESETZ = { W: 0.03, H: 0.12, D: 0.22, y: 2.40 };
    var KAMM_VIS = { lab: "dummy-kamm", host: "none" };

    // V18.491.355 Lab Schmiede spring-pell base; Host none (TELLER_VIS).
    // ≠ FEDER_GESETZ (logic H/k/damp/hitR) · ≠ PODES_GESETZ · ≠ SOCKEL_GESETZ · ≠ STAND · ≠ FUSS · ≠ LIFT — pell-teller only; do not Fake-merge.
    var TELLER_GESETZ = { R0: 0.30, R1: 0.40, H: 0.22, y: 0.11 };
    var TELLER_VIS = { lab: "pell-teller", host: "none" };

    // V18.491.356 Lab Schmiede spring-pell coils; Host none (WENDEL_VIS).
    // ≠ FEDER_GESETZ (logic) · ≠ TELLER_GESETZ (base) · ≠ REIF · ≠ RING · ≠ OESE · ≠ LIFT — pell-wendel only; do not Fake-merge.
    var WENDEL_GESETZ = { R0: 0.18, dR: 0.01, tube: 0.03, y0: 0.22, yStep: 0.07, N: 3 };
    var WENDEL_VIS = { lab: "pell-wendel", host: "none" };

    // V18.491.357 Lab Schmiede spring-pell pole; Host none (STANGE_VIS).
    // ≠ FEDER_GESETZ (logic H/k/damp/hitR — H reused for length only) · ≠ TELLER · ≠ WENDEL · ≠ PFOST.R0=0.06 coincidence · ≠ MAST · ≠ knight arena post (0.06/0.07/3.0) · ≠ LIFT — pell-stange only; do not Fake-merge.
    var STANGE_GESETZ = { R0: 0.06, R1: 0.08 };
    var STANGE_VIS = { lab: "pell-stange", host: "none" };

    // V18.491.358 Lab Schmiede spring-pell bands; Host none (MUFFE_VIS).
    // ≠ FEDER · ≠ TELLER · ≠ WENDEL · ≠ STANGE · ≠ REIF · ≠ RING · ≠ OESE · ≠ STREIF · ≠ BAND (wand ys) · ≠ LIFT — pell-muffe only; do not Fake-merge.
    var MUFFE_GESETZ = { R: 0.075, tube: 0.016, ys: [0.45, 0.75, 1.05] };
    var MUFFE_VIS = { lab: "pell-muffe", host: "none" };

    // V18.491.359 Lab Schmiede spring-pell head; Host none (KOPF_VIS).
    // ≠ FEDER_GESETZ (logic — y stays FEDER_H) · ≠ TELLER · ≠ WENDEL · ≠ STANGE · ≠ MUFFE · ≠ HELM · ≠ LIFT — pell-kopf only; do not Fake-merge.
    var KOPF_GESETZ = { R: 0.16 };
    var KOPF_VIS = { lab: "pell-kopf", host: "none" };

    // V18.491.360 Lab Schmiede knight arena post; Host none (PFAHL_VIS).
    // ≠ PFOST_GESETZ (R0/R1 coincidence — dummy H=0.85) · ≠ STANGE (pell R1=0.08) · ≠ PFOSTEN · ≠ SAULE · ≠ STEHER · ≠ MAST · ≠ LIFT — arena-pfahl only; do not Fake-merge.
    var PFAHL_GESETZ = { R0: 0.06, R1: 0.07, H: 3.0, y: 1.5 };
    var PFAHL_VIS = { lab: "arena-pfahl", host: "none" };

    // V18.491.361 Lab Schmiede spring-pell pivot; Host none (ZAPFEN_VIS).
    // ≠ FEDER_GESETZ (logic) · ≠ TELLER · ≠ STANGE · ≠ KOPF · ≠ MUFFE · ≠ WENDEL · ≠ DREH (spintree) · ≠ LIFT — pell-zapfen only; do not Fake-merge.
    var ZAPFEN_GESETZ = { y: 0.35 };
    var ZAPFEN_VIS = { lab: "pell-zapfen", host: "none" };

    // V18.491.362 Lab Schmiede knight arena banner; Host none (TUCH_VIS).
    // ≠ FAHNE_GESETZ (banner mast) · ≠ FAEHNE_GESETZ (clout flag) · ≠ WIMPEL · ≠ BANNER_GESETZ.H (logic) · ≠ PFAHL · ≠ LIFT — arena-tuch only; do not Fake-merge.
    var TUCH_GESETZ = { W: 0.6, H: 1.2, y: 2.25 };
    var TUCH_VIS = { lab: "arena-tuch", host: "none" };

    // V18.491.363 Lab Schmiede knight body base; Host none (PLINT_VIS).
    // ≠ PODES_GESETZ (dummy) · ≠ TELLER · ≠ SOCKEL · ≠ STAND.R0=0.16 coincidence · ≠ FUSS · ≠ PFAHL · ≠ LIFT — ritter-plint only; do not Fake-merge.
    var PLINT_GESETZ = { R0: 0.17, R1: 0.21, H: 0.10, y: 0.05 };
    var PLINT_VIS = { lab: "ritter-plint", host: "none" };

    // V18.491.364 Lab Schmiede knight legs; Host none (SCHENKEL_VIS).
    // ≠ BEIN_GESETZ (dummy — xOff=0.13 coincidence only) · ≠ PLINT · ≠ PFOST · ≠ STUTZE · ≠ LIFT — ritter-schenkel only; do not Fake-merge.
    var SCHENKEL_GESETZ = { R0: 0.085, R1: 0.07, H: 0.92, xOff: 0.13, y: 0.54 };
    var SCHENKEL_VIS = { lab: "ritter-schenkel", host: "none" };

    // V18.491.365 Lab Schmiede knight torso; Host none (LEIB_VIS).
    // ≠ RUMPF_GESETZ (dummy — R0a/R1/H/scaleZ coincidence; y=1.56 ≠ 1.28; bare R0b=0.29) · ≠ SCHENKEL · ≠ PLINT · ≠ GRAT · ≠ WAMS · ≠ HARNISCH · ≠ LIFT — ritter-leib only; do not Fake-merge.
    var LEIB_GESETZ = { R0a: 0.27, R0b: 0.29, R1: 0.22, H: 0.78, y: 1.28, scaleZ: 0.72 };
    var LEIB_VIS = { lab: "ritter-leib", host: "none" };

    // V18.491.366 Lab Schmiede knight ridge; Host none (RIPPE_VIS).
    // ≠ GRAT_GESETZ (dummy — W/H/D/z coincidence; y=1.56 ≠ 1.28) · ≠ LEIB · ≠ RUMPF · ≠ KAMM · ≠ LIFT — ritter-rippe only; do not Fake-merge.
    var RIPPE_GESETZ = { W: 0.03, H: 0.7, D: 0.16, y: 1.28, z: 0.20 };
    var RIPPE_VIS = { lab: "ritter-rippe", host: "none" };

    // V18.491.367 Lab Schmiede knight surcoat; Host none (KOTTE_VIS).
    // ≠ WAMS_GESETZ (dummy — Ha/ya/scaleZ coincidence; R0/R1 differ) · ≠ LEIB · ≠ RIPPE · ≠ RUMPF · ≠ LIFT — ritter-kotte only; do not Fake-merge.
    var KOTTE_GESETZ = { R0: 0.30, R1: 0.26, Ha: 0.46, Hb: 0.70, ya: 1.42, yb: 1.30, scaleZ: 0.74 };
    var KOTTE_VIS = { lab: "ritter-kotte", host: "none" };

    // V18.491.368 Lab Schmiede knight pauldron; Host none (ACHSEL_VIS).
    // ≠ SCHULTER_GESETZ (dummy — R/xOff/scaleY/scaleZ coincidence; y=1.95 ≠ 1.67) · ≠ KOTTE · ≠ LEIB · ≠ RIPPE · ≠ LIFT — ritter-achsel only; do not Fake-merge.
    var ACHSEL_GESETZ = { R: 0.15, xOff: 0.29, y: 1.67, scaleY: 0.82, scaleZ: 0.92 };
    var ACHSEL_VIS = { lab: "ritter-achsel", host: "none" };

    // V18.491.369 Lab Schmiede knight neck; Host none (NACKEN_VIS).
    // ≠ HALS_GESETZ (dummy — R0/R1/H coincidence; y=2.06 ≠ 1.78) · ≠ ACHSEL · ≠ KOTTE · ≠ LEIB · ≠ LIFT — ritter-nacken only; do not Fake-merge.
    var NACKEN_GESETZ = { R0: 0.10, R1: 0.12, H: 0.12, y: 1.78 };
    var NACKEN_VIS = { lab: "ritter-nacken", host: "none" };

    // V18.491.370 Lab Schmiede knight helm; Host none (HAUBE_VIS).
    // ≠ HELM_GESETZ (dummy — R/scaleY/scaleZ coincidence; y=2.23 ≠ 1.95) · ≠ NACKEN · ≠ ACHSEL · ≠ KOPF · ≠ VISIER · ≠ KAMM · ≠ bare hood · ≠ LIFT — ritter-haube only; do not Fake-merge.
    var HAUBE_GESETZ = { R: 0.17, y: 1.95, scaleY: 1.12, scaleZ: 1.05 };
    var HAUBE_VIS = { lab: "ritter-haube", host: "none" };

    // V18.491.371 Lab Schmiede knight visor; Host none (BLEND_VIS).
    // ≠ VISIER_GESETZ (dummy — W/H/D/z coincidence; y=2.22 ≠ 1.94) · ≠ HAUBE · ≠ HELM · ≠ NACKEN · ≠ KAMM · ≠ LIFT — ritter-blend only; do not Fake-merge.
    var BLEND_GESETZ = { W: 0.30, H: 0.035, D: 0.06, y: 1.94, z: 0.16 };
    var BLEND_VIS = { lab: "ritter-blend", host: "none" };

    // V18.491.372 Lab Schmiede knight crest; Host none (BUSCH_VIS).
    // ≠ KAMM_GESETZ (dummy — W=0.03 coincidence; H/D/y differ) · ≠ BLEND · ≠ HAUBE · ≠ GRAT · ≠ RIPPE · ≠ LIFT — ritter-busch only; do not Fake-merge.
    var BUSCH_GESETZ = { W: 0.03, H: 0.13, D: 0.24, y: 2.13 };
    var BUSCH_VIS = { lab: "ritter-busch", host: "none" };

    // V18.491.373 Lab Schmiede knight hood; Host none (KAPUZE_VIS).
    // ≠ HAUBE_GESETZ (helm — R=0.17 coincidence; y/scale/rot differ) · ≠ HELM · ≠ BUSCH · ≠ BLEND · ≠ KOPF · ≠ LIFT — ritter-kapuze only; do not Fake-merge.
    var KAPUZE_GESETZ = { R: 0.17, y: 1.99, scaleY: 0.7, rotX: -0.3 };
    var KAPUZE_VIS = { lab: "ritter-kapuze", host: "none" };

    // V18.491.374 Lab Schmiede knight head; Host none (SCHAEDEL_VIS).
    // ≠ KOPF_GESETZ (pell R=0.16) · ≠ HAUBE · ≠ KAPUZE · ≠ HELM · ≠ NACKEN · ≠ LIFT — ritter-schaedel only; do not Fake-merge.
    var SCHAEDEL_GESETZ = { R: 0.155, y: 1.93 };
    var SCHAEDEL_VIS = { lab: "ritter-schaedel", host: "none" };

    // V18.491.375 Lab Schmiede knight upper arm; Host none (OBERARM_VIS).
    // ≠ STANGE_GESETZ.R0=0.06 coincidence · ≠ ACHSEL · ≠ SCHENKEL · ≠ BEIN · ≠ KAPUZE.rotX=-0.3 coincidence · ≠ LIFT — ritter-oberarm only; do not Fake-merge.
    var OBERARM_GESETZ = { R0: 0.06, R1: 0.055, H: 0.40, x: 0.05, y: -0.17, z: 0, rotZ: -0.3 };
    var OBERARM_VIS = { lab: "ritter-oberarm", host: "none" };

    // V18.491.376 Lab Schmiede knight sword grip; Host none (HEFT_VIS).
    // ≠ OBERARM · ≠ STANGE · ≠ STAB · ≠ LIFT — ritter-heft only; do not Fake-merge.
    var HEFT_GESETZ = { R0: 0.02, R1: 0.02, H: 0.16, rotX: Math.PI/2 };
    var HEFT_VIS = { lab: "ritter-heft", host: "none" };

    // V18.491.377 Lab Schmiede knight sword guard; Host none (PARIER_VIS).
    // ≠ HEFT · ≠ OBERARM · ≠ STANGE · ≠ QUER · ≠ LIFT — ritter-parier only; do not Fake-merge.
    var PARIER_GESETZ = { W: 0.20, H: 0.03, D: 0.03, z: 0.10 };
    var PARIER_VIS = { lab: "ritter-parier", host: "none" };

    // V18.491.378 Lab Schmiede knight sword blade; Host none (KLINGE_VIS).
    // ≠ HEFT · ≠ PARIER · ≠ STAB · ≠ SPITZE · ≠ SCHNEIDE (samples logic) · ≠ LIFT — ritter-klinge only; do not Fake-merge.
    var KLINGE_GESETZ = { W: 0.045, H: 0.012, D: 0.82, z: 0.54 };
    var KLINGE_VIS = { lab: "ritter-klinge", host: "none" };

    // V18.491.379 Lab Schmiede knight HP pip; Host none (PIP_VIS).
    // ≠ KLINGE · ≠ HEFT · ≠ PARIER · ≠ RING · ≠ PAD · ≠ SCHEIBE · ≠ LIFT — ritter-pip only; do not Fake-merge.
    var PIP_GESETZ = { W: 0.11, H: 0.11, y: 2.40, pitch: 0.17 };
    var PIP_VIS = { lab: "ritter-pip", host: "none" };

    // V18.491.380 Lab Schmiede knight arm group pose; Host none (ARM_VIS).
    // ≠ OBERARM (mesh dims) · ≠ PIP · ≠ HEFT · ≠ PARIER · ≠ KLINGE · ≠ LIFT — ritter-arm group only; do not Fake-merge.
    var ARM_GESETZ = { x: 0.30, y: 1.60, z: 0.08 };
    var ARM_VIS = { lab: "ritter-arm", host: "none" };

    // V18.491.381 Lab Schmiede knight sword group pose; Host none (SCHWERT_VIS).
    // ≠ ARM · ≠ OBERARM · ≠ KLINGE · ≠ HEFT · ≠ PARIER · ≠ PIP · ≠ LIFT — ritter-schwert group only; do not Fake-merge.
    var SCHWERT_GESETZ = { x: 0.12, y: -0.34, z: 0.04 };
    var SCHWERT_VIS = { lab: "ritter-schwert", host: "none" };

    // V18.491.382 Lab Schmiede knight HP pip z-offset; Host none (NAHE_VIS).
    // ≠ PIP (W/H/y/pitch closed .379 without z) · ≠ VOR (kirmes) · ≠ SCHWERT · ≠ ARM · ≠ KLINGE · ≠ HEFT · ≠ PARIER · ≠ LIFT — ritter-nahe only; do not Fake-merge / do not retrofit PIP.
    var NAHE_GESETZ = { z: 0.05 };
    var NAHE_VIS = { lab: "ritter-nahe", host: "none" };

    // V18.491.383 Lab Schmiede straw-pell spine post radii; Host none (DORN_VIS).
    // ≠ STAB (R0=0.035 coincidence; R1 0.055≠0.05) · ≠ PFOST · ≠ PAD.postR0=0.05 coincidence · ≠ PFAHL/STEHER/SAULE/STANGE/MAST · ≠ PELL (H only) · ≠ FUSS · ≠ ARM · ≠ LIFT — pell-dorn only; do not Fake-merge.
    var DORN_GESETZ = { R0: 0.035, R1: 0.05 };
    var DORN_VIS = { lab: "pell-dorn", host: "none" };

    // V18.491.384 Lab Schmiede straw-pell Kreuzfuß; Host none (KREUZ_VIS).
    // ≠ DORN · ≠ FUSS (galgen box) · ≠ SOCKEL · ≠ STAND.R0=0.16 coincidence · ≠ PODES · ≠ PLINT · ≠ TELLER · ≠ SPARREN · ≠ LIFT — pell-kreuz only; do not Fake-merge.
    var KREUZ_GESETZ = { R0: 0.02, R1: 0.025, H: 0.5, rad: 0.16, y: 0.04, tilt: 0.5 };
    var KREUZ_VIS = { lab: "pell-kreuz", host: "none" };

    // V18.491.385 Lab Schmiede straw-pell Stummelarm; Host none (STUMMEL_VIS).
    // ≠ ARM (ritter group) · ≠ OBERARM · ≠ BEIN · ≠ DORN.R1=0.05 coincidence · ≠ KREUZ · ≠ STANGE.R0=0.06 coincidence · ≠ STUTZE · ≠ LIFT — pell-stummel only; do not Fake-merge.
    var STUMMEL_GESETZ = { R0: 0.05, R1: 0.06, H: 0.34, zOff: 0.22, yOff: 0.05, rotX: 0.5 };
    var STUMMEL_VIS = { lab: "pell-stummel", host: "none" };

    // V18.491.386 Lab Schmiede straw-pell Arm-Seilring; Host none (SCHLINGE_VIS).
    // ≠ SEIL (iters logic) · ≠ RING · ≠ REIF · ≠ MUFFE · ≠ STUMMEL · ≠ ARM · ≠ TORII · ≠ LIFT — pell-schlinge only; do not Fake-merge.
    var SCHLINGE_GESETZ = { R: 0.052, tube: 0.01, zOff: 0.30, yOff: 0.12 };
    var SCHLINGE_VIS = { lab: "pell-schlinge", host: "none" };

    // V18.491.387 Lab Schmiede straw-pell Hals; Host none (KEHLE_VIS).
    // ≠ HALS (armored dummy) · ≠ NACKEN (ritter) · ≠ SCHLINGE · ≠ STUMMEL.R0=0.05 coincidence · ≠ DORN.R1=0.05 coincidence · ≠ KOPF · ≠ LIFT — pell-kehle only; do not Fake-merge.
    var KEHLE_GESETZ = { R0: 0.05, R1: 0.07, H: 0.10, yOff: 0.05 };
    var KEHLE_VIS = { lab: "pell-kehle", host: "none" };

    // V18.491.388 Lab Schmiede straw-pell Kopf (Lederball); Host none (BIRNE_VIS).
    // ≠ KOPF (spring-pell R=0.16) · ≠ SCHAEDEL · ≠ KEHLE · ≠ HELM/HAUBE scaleY=1.12 coincidence · ≠ LIFT — pell-birne only; do not Fake-merge (seam Torus R stays separate).
    var BIRNE_GESETZ = { R: 0.135, scaleY: 1.12, yOff: 0.20 };
    var BIRNE_VIS = { lab: "pell-birne", host: "none" };

    // V18.491.389 Lab Schmiede straw-pell Kopf-Naht (outer+inner Torus); Host none (NAHT_VIS).
    // ≠ BIRNE.R=0.135 coincidence · ≠ SCHLINGE · ≠ RING · ≠ REIF · ≠ MUFFE · ≠ NAHE · ≠ LIFT — pell-naht only; do not Fake-merge into BIRNE.
    var NAHT_GESETZ = { R: 0.135, tube: 0.006, R1: 0.118, tube1: 0.005 };
    var NAHT_VIS = { lab: "pell-naht", host: "none" };

    // V18.491.390 Lab Schmiede straw-pell Rumpf-Seilringe; Host none (GURT_VIS).
    // ≠ SCHLINGE (arm) · ≠ NAHT · ≠ RING · ≠ REIF.mul/tube · ≠ MUFFE.ys · ≠ BAND.ys · ≠ BIRNE · ≠ LIFT — pell-gurt only; do not Fake-merge.
    var GURT_GESETZ = { mul: 1.01, tube: 0.012, ys: [0.22, 0.02, -0.20] };
    var GURT_VIS = { lab: "pell-gurt", host: "none" };

    // V18.491.391 Lab Schmiede straw-pell Rumpf-Taper; Host none (KEGEL_VIS).
    // ≠ GURT.mul · ≠ RUMPF · ≠ LEIB · ≠ STUMMEL · ≠ DORN · ≠ PELL.torsoR · ≠ LIFT — pell-kegel only; do not Fake-merge taper into GURT/RUMPF.
    var KEGEL_GESETZ = { mul: 0.92 };
    var KEGEL_VIS = { lab: "pell-kegel", host: "none" };

    // V18.491.392 Lab Schmiede straw-pell Schulter-Ansatz-Y; Host none (ANSATZ_VIS).
    // ≠ SCHULTER (armored pauldron) · ≠ ACHSEL · ≠ KEGEL · ≠ GURT · ≠ STUMMEL · ≠ LIFT — pell-ansatz only; do not Fake-merge into SCHULTER.
    var ANSATZ_GESETZ = { yOff: 0.26 };
    var ANSATZ_VIS = { lab: "pell-ansatz", host: "none" };

    // V18.491.393 Lab Schmiede straw-pell Vorderflächen-ReachX; Host none (REICH_VIS).
    // ≠ ANSATZ · ≠ STUMMEL · ≠ ARM · ≠ SCHULTER · ≠ ACHSEL · ≠ NAHE.z=0.05 coincidence · ≠ VOR · ≠ TREFF · ≠ LIFT — pell-reich only; do not Fake-merge.
    var REICH_GESETZ = { pad: 0.05 };
    var REICH_VIS = { lab: "pell-reich", host: "none" };

    // V18.491.394 Lab Schmiede straw-pell zone-fallback Absolutes (Didaktik-Spiegel); Host none (SPIEGEL_VIS).
    // ≠ ARENA.zonen (yFrac/rFrac — intentional dual when core loaded) · ≠ ZONE_PICK · ≠ REICH · ≠ ANSATZ · ≠ LIFT — pell-spiegel only; do not Fake-merge into ARENA.zonen.
    var SPIEGEL_GESETZ = {
      headR: 0.15, headDmg: 2.4,
      chestYOff: 0.20, rPad: 0.02, chestDmg: 1.5,
      bellyYOff: -0.18, bellyDmg: 1.2,
      armYOff: -0.08, armR: 0.09, armDmg: 0.7,
      legY: 0.6, legR: 0.06, legDmg: 0.8
    };
    var SPIEGEL_VIS = { lab: "pell-spiegel", host: "none" };

    // V18.491.395 Lab Schmiede Streitpuppe Schlitten-Base; Host none (SCHLITT_VIS).
    // ≠ SPIEGEL · ≠ SOCKEL.H=0.16 coincidence · ≠ STAND.H=0.18 coincidence · ≠ PODES · ≠ PLINT · ≠ TELLER · ≠ STREIT (logic) · ≠ LIFT — streit-schlitt only; do not Fake-merge.
    var SCHLITT_GESETZ = { W: 0.8, H: 0.16, D: 1.15, y: 0.18 };
    var SCHLITT_VIS = { lab: "streit-schlitt", host: "none" };

    // V18.491.396 Lab Schmiede Streitpuppe Räder; Host none (RAD_VIS).
    // ≠ SCHLITT · ≠ ROLLE (tatami) · ≠ RING · ≠ REIF · ≠ MUFFE · ≠ DORN · ≠ LIFT — streit-rad only; do not Fake-merge.
    var RAD_GESETZ = { R: 0.14, H: 0.08, xOff: 0.33, zOff: 0.42, y: 0.14 };
    var RAD_VIS = { lab: "streit-rad", host: "none" };

    // V18.491.397 Lab Schmiede Streitpuppe Körper-Tonne; Host none (TONNE_VIS).
    // ≠ RAD · ≠ SCHLITT.H=0.16 coincidence · ≠ RUMPF · ≠ LEIB · ≠ TON (clay logic) · ≠ DORN · ≠ STANGE · ≠ LIFT — streit-tonne only; do not Fake-merge into RAD/SCHLITT/TON.
    var TONNE_GESETZ = { R0: 0.13, R1: 0.16, H: 1.6, y: 1.08 };
    var TONNE_VIS = { lab: "streit-tonne", host: "none" };

    // V18.491.398 Lab Schmiede Streitpuppe Ausleger-Arme; Host none (AUSLEG_VIS).
    // ≠ ARM · ≠ OBERARM · ≠ STUMMEL · ≠ TONNE.R0=0.13 coincidence · ≠ SCHLITT.D=1.15 coincidence · ≠ RAD · ≠ SPARREN · ≠ LIFT — streit-ausleg only; do not Fake-merge.
    var AUSLEG_GESETZ = { W: 1.15, H: 0.13, D: 0.13, y: 1.52 };
    var AUSLEG_VIS = { lab: "streit-ausleg", host: "none" };

    // V18.491.399 Lab Schmiede Streitpuppe Kopf; Host none (KNOLLE_VIS).
    // ≠ KOPF · ≠ BIRNE · ≠ SCHAEDEL · ≠ HAUBE · ≠ AUSLEG · ≠ TONNE · ≠ SCHLITT.y=0.18 coincidence · ≠ LIFT — streit-knolle only; do not Fake-merge.
    var KNOLLE_GESETZ = { R: 0.18, y: 1.99 };
    var KNOLLE_VIS = { lab: "streit-knolle", host: "none" };

    // V18.491.400 Lab Schmiede Streitpuppe Schild; Host none (SCHILD_VIS).
    // ≠ KNOLLE · ≠ AUSLEG · ≠ TONNE · ≠ SCHLITT · ≠ RING · ≠ REIF · ≠ NAHE.z=0.05 coincidence · ≠ LIFT — streit-schild only; do not Fake-merge.
    var SCHILD_GESETZ = { R: 0.28, H: 0.05, y: 1.32, z: 0.24 };
    var SCHILD_VIS = { lab: "streit-schild", host: "none" };

    // V18.491.401 Lab Schmiede Streitpuppe Fahnenstange; Host none (LANZE_VIS).
    // ≠ STANGE · ≠ MAST · ≠ PFOST · ≠ DORN · ≠ SCHILD · ≠ KNOLLE.R=0.18 coincidence (x) · ≠ KREUZ.H=0.5 coincidence · ≠ SCHLITT.y=0.18 coincidence · ≠ SPITZE · ≠ LIFT — streit-lanze only; do not Fake-merge.
    var LANZE_GESETZ = { R: 0.025, H: 0.5, x: 0.18, y: 2.25 };
    var LANZE_VIS = { lab: "streit-lanze", host: "none" };

    // V18.491.402 Lab Schmiede Streitpuppe Ruhe-Wimpel (Cone); Host none (ZIPFEL_VIS).
    // ≠ FAHNE · ≠ WIMPEL · ≠ FAEHNE · ≠ TUCH · ≠ BANNER · ≠ LANZE · ≠ SPITZE · ≠ KEGEL · ≠ KNOLLE.R=0.18 coincidence (x) · ≠ LIFT — streit-zipfel only; do not Fake-merge.
    var ZIPFEL_GESETZ = { R: 0.12, H: 0.32, x: 0.18, y: 2.5 };
    var ZIPFEL_VIS = { lab: "streit-zipfel", host: "none" };

    // V18.491.403 Lab Schmiede Gauntlet-Seilsegment-Radius; Host none (TAU_VIS).
    // ≠ ZIPFEL · ≠ SEIL (iters) · ≠ SCHLINGE · ≠ GURT · ≠ STRICK/LEINE R=0.012 · ≠ STRANG R=0.016 · ≠ OESE.tube=0.014 coincidence · ≠ KETTE (segs/len/ballR) · ≠ PFOST · ≠ DORN · ≠ LATTE · ≠ LIFT — gasse-tau only; do not Fake-merge.
    var TAU_GESETZ = { R: 0.014 };
    var TAU_VIS = { lab: "gasse-tau", host: "none" };

    // V18.491.404 Lab Schmiede Gauntlet-Endpfosten; Host none (PFYL_VIS).
    // ≠ PFOST · ≠ PFOSTEN · ≠ DORN · ≠ PFAHL · ≠ STEHER · ≠ SAULE (R0/R1 0.08/0.10 coincidence — galgen ≠ gasse) · ≠ TAU · ≠ RAD.H=0.08 coincidence · ≠ LIFT — gasse-pfyl only; do not Fake-merge.
    var PFYL_GESETZ = { R0: 0.08, R1: 0.1, xOff: 0.55, zPad: 0.1 };
    var PFYL_VIS = { lab: "gasse-pfyl", host: "none" };

    // V18.491.405 Lab Schmiede Gauntlet-Querbalken; Host none (RIEGEL_VIS).
    // ≠ PFYL (xOff 0.55 coincidence — posts ≠ beam Box; do not retrofit PFYL) · ≠ LATTE · ≠ BALKEN · ≠ QUER.extra=0.4 coincidence · ≠ TRAEGER · ≠ SAULE · ≠ TAU · ≠ PFOST · ≠ DORN · ≠ LIFT — gasse-riegel only; do not Fake-merge.
    var RIEGEL_GESETZ = { W: 0.12, H: 0.14, zExtra: 0.4, xOff: 0.55, yOff: 0.06 };
    var RIEGEL_VIS = { lab: "gasse-riegel", host: "none" };

    // V18.491.406 Lab Schmiede Gauntlet-Pendel-Pivot-Y; Host none (ANGEL_VIS).
    // ≠ RIEGEL.yOff=0.06 · ≠ PFYL · ≠ TAU · ≠ DREH · ≠ ZAPFEN · ≠ LIFT — gasse-angel only; do not Fake-merge.
    var ANGEL_GESETZ = { yOff: 0.12 };
    var ANGEL_VIS = { lab: "gasse-angel", host: "none" };

    // V18.491.407 Lab Schmiede Clay-Thrower Sockel-Block; Host none (BLOCK_VIS).
    // ≠ ANGEL · ≠ RIEGEL · ≠ PFYL · ≠ SCHLITT · ≠ SOCKEL · ≠ FUSS · ≠ BANK · ≠ PODES · ≠ STAND · ≠ PLINT · ≠ TON (logic) · ≠ TREFF.xPos=0.3 coincidence · ≠ LIFT — ton-block only; do not Fake-merge.
    var BLOCK_GESETZ = { W: 0.6, H: 0.3, D: 0.6, y: 0.15 };
    var BLOCK_VIS = { lab: "ton-block", host: "none" };

    // V18.491.408 Lab Schmiede Clay-Thrower Wurfhebel; Host none (HEBEL_VIS).
    // ≠ BLOCK · ≠ ARM · ≠ AUSLEG · ≠ RIEGEL.H=0.14 coincidence · ≠ ANGEL · ≠ PFYL.xOff=0.55 coincidence (y/|rotX|) · ≠ STANGE · ≠ LIFT — ton-hebel only; geom+y+rotX one arm law; do not Fake-merge.
    var HEBEL_GESETZ = { W: 0.14, H: 0.8, D: 0.14, y: 0.55, rotX: -0.55 };
    var HEBEL_VIS = { lab: "ton-hebel", host: "none" };

    // V18.491.409 Lab Schmiede Clay-Thrower Becher/Cup; Host none (BECHER_VIS).
    // ≠ HEBEL.W/D=0.14 coincidence · ≠ BLOCK · ≠ TONNE · ≠ KNOLLE.R=0.18 coincidence · ≠ TON.liftY=0.95 coincidence · ≠ LIFT — ton-becher only; do not Fake-merge.
    var BECHER_GESETZ = { R0: 0.18, R1: 0.14, H: 0.1, y: 0.95, z: 0.22 };
    var BECHER_VIS = { lab: "ton-becher", host: "none" };

    // V18.491.410 Lab Schmiede Clay-Thrower Wurfscheibe; Host none (SCHEIB_VIS).
    // ≠ SCHEIBE (archery face) · ≠ BECHER · ≠ HEBEL · ≠ BLOCK · ≠ RAD · ≠ TONNE · ≠ TELLER · ≠ PLATTE · ≠ PELL.torsoR=0.17 coincidence · ≠ HELM/HAUBE.R=0.17 coincidence · ≠ LIFT — ton-scheib only; pose dynamic; do not Fake-merge.
    var SCHEIB_GESETZ = { R: 0.17, H: 0.04 };
    var SCHEIB_VIS = { lab: "ton-scheib", host: "none" };

    // V18.491.411 Lab Schmiede Bahn/Zielscheiben-Pfosten; Host none (ZIELP_VIS).
    // ≠ PFYL · ≠ PFOST · ≠ DORN.R1=0.05 coincidence · ≠ PFAHL · ≠ STEHER · ≠ MAST · ≠ SCHEIB · ≠ SCHEIBE · ≠ RIEGEL · ≠ STAB · ≠ LIFT — bahn-zielp only; H stays target y; do not Fake-merge.
    var ZIELP_GESETZ = { R0: 0.04, R1: 0.05 };
    var ZIELP_VIS = { lab: "bahn-zielp", host: "none" };

    // V18.491.412 Lab Schmiede Gauntlet-Seil Anfangs-Knick (Verlet ptsPrev X-Bias); Host none (KNICK_VIS).
    // ≠ ZIELP.R1=0.05 coincidence · ≠ DORN.R1 · ≠ NAHE.z · ≠ REICH.pad · ≠ OESE.R · ≠ ANGEL · ≠ RIEGEL · ≠ TAU · ≠ LIFT — gasse-knick only (initial bend, not score); do not Fake-merge.
    var KNICK_GESETZ = { amp: 0.05 };
    var KNICK_VIS = { lab: "gasse-knick", host: "none" };

    // V18.491.413 Lab Schmiede Zielscheibe Dreibock-Beine; Host none (DREIB_VIS).
    // ≠ BEIN (dummy) · ≠ BOCK (tatami) · ≠ FUSS · ≠ STUTZE · ≠ KNICK · ≠ ZIELP · ≠ PFYL · ≠ DORN · ≠ PFOST · ≠ LIFT — scheibe-dreib only; front+back ONE tripod law; do not Fake-merge.
    var DREIB_GESETZ = {
      R0: 0.018, R1: 0.022,
      frontH: 1.05, frontX: 0.12, frontY: -0.38, frontZ: 0.30, frontTilt: 0.26,
      backH: 1.10, backX: 0.40, backY: -0.40, backTilt: 0.40
    };
    var DREIB_VIS = { lab: "scheibe-dreib", host: "none" };

    // V18.491.414 Lab Schmiede View-Model Arm-Glieder (mk factory); Host none (GLIED_VIS).
    // ≠ OBERARM (knight) · ≠ ARM · ≠ STUMMEL · ≠ BEIN · ≠ DREIB · ≠ BIRNE · ≠ SCHLINGE (R=0.052 coinc.) · ≠ KNICK · ≠ LIFT — vm-glied only (hand/up/el/fo ONE limb law); do not Fake-merge.
    var GLIED_GESETZ = {
      handR: 0.052, handSx: 1.1, handSy: 0.85, handSz: 1.3,
      upR0: 0.036, upR1: 0.044,
      elR: 0.05,
      foR0: 0.03, foR1: 0.04
    };
    var GLIED_VIS = { lab: "vm-glied", host: "none" };

    // V18.491.415 Lab Schmiede Drehbaum-Pfosten-Radien; Host none (BAUM_VIS).
    // ≠ DREH (H/armLen/padR already — do not retrofit radii into DREH) · ≠ QUINT post 0.09/0.13 coinc. · ≠ STEHER · ≠ SAULE · ≠ MAST · ≠ PFOST · ≠ PFYL · ≠ DORN · ≠ ZIELP · ≠ GLIED · ≠ DREIB · ≠ LIFT — spintree-post only; do not Fake-merge.
    var BAUM_GESETZ = { R0: 0.09, R1: 0.13 };
    var BAUM_VIS = { lab: "spintree-post", host: "none" };

    // V18.491.416 Lab Schmiede Drehbaum-Sockel/Stumpf; Host none (STUMPF_VIS).
    // ≠ BAUM (trunk R) · ≠ DREH (H/armLen/padR; padR=0.18≠this H coinc.) · ≠ STAND/PODES (H=0.18 y=0.09 coinc.) · ≠ SOCKEL · ≠ FUSS · ≠ TELLER · ≠ PLINT · ≠ BLOCK · ≠ GLIED · ≠ DREIB · ≠ LIFT — spintree-stumpf only; cap separate TEIL left bare; do not Fake-merge.
    var STUMPF_GESETZ = { R0: 0.34, R1: 0.44, H: 0.18, y: 0.09 };
    var STUMPF_VIS = { lab: "spintree-stumpf", host: "none" };

    // V18.491.417 Lab Schmiede Drehbaum-Kappe; Host none (KAPPE_VIS).
    // ≠ STUMPF · ≠ BAUM (R1=0.13 coinc. with R0) · ≠ DREH · ≠ pad Cylinder 0.13 · ≠ HAUBE · ≠ KNOLLE · ≠ BLOCK · ≠ LIFT — spintree-kappe only; do not Fake-merge.
    var KAPPE_GESETZ = { R0: 0.13, R1: 0.11, H: 0.1, yOff: 0.05 };
    var KAPPE_VIS = { lab: "spintree-kappe", host: "none" };

    // V18.491.418 Lab Schmiede Quintain-Pfosten-Radien; Host none (HOLM_VIS).
    // ≠ BAUM (R0/R1 0.09/0.13 coinc. — separate TEIL) · ≠ QUINT (postH/armLen/shieldR already — do not retrofit) · ≠ KAPPE · ≠ STUMPF · ≠ DREH · ≠ PFYL · ≠ PFOST · ≠ DORN · ≠ ZIELP · ≠ STEHER · ≠ STANGE · ≠ PFAHL · ≠ LIFT — quintain-holm only; do not Fake-merge.
    var HOLM_GESETZ = { R0: 0.09, R1: 0.13 };
    var HOLM_VIS = { lab: "quintain-holm", host: "none" };

    // V18.491.419 Lab Schmiede Drehbaum-Schlagpolster; Host none (POLSTER_VIS).
    // ≠ PAD (dummy pad stack) · ≠ DREH.padR=0.18 (hit radius ≠ mesh H coinc.) · ≠ KAPPE.R0=0.13 · ≠ BAUM.R1=0.13 · ≠ STUMPF · ≠ HOLM · ≠ stripe Torus 0.13 left bare · ≠ PLATTE · ≠ TELLER · ≠ SCHEIB · ≠ LIFT — spintree-polster only; do not Fake-merge.
    var POLSTER_GESETZ = { R: 0.13, H: 0.18 };
    var POLSTER_VIS = { lab: "spintree-polster", host: "none" };

    // V18.491.420 Lab Schmiede Drehbaum-Zierstreifen (Torus); Host none (ZIER_VIS).
    // ≠ POLSTER.R=0.13 · ≠ KAPPE.R0 · ≠ BAUM.R1 · ≠ HOLM · ≠ DREH · ≠ STREIF · ≠ REIF · ≠ BAND · ≠ RING · ≠ SCHLINGE · ≠ GURT · ≠ MUFFE.tube=0.016 coinc. · ≠ LIFT — spintree-zier only; do not Fake-merge.
    var ZIER_GESETZ = { R: 0.13, tube: 0.016 };
    var ZIER_VIS = { lab: "spintree-zier", host: "none" };

    // V18.491.421 Lab Schmiede Quintain-Boden/Sockel; Host none (BODEN_VIS).
    // ≠ HOLM · ≠ BLOCK · ≠ STUMPF · ≠ STAND · ≠ PODES · ≠ PLINT · ≠ SOCKEL · ≠ FUSS · ≠ ZIER · ≠ POLSTER · ≠ LIFT — quintain-boden only; do not Fake-merge.
    var BODEN_GESETZ = { R0: 0.3, R1: 0.38, H: 0.2, y: 0.1 };
    var BODEN_VIS = { lab: "quintain-boden", host: "none" };

    // V18.491.422 Lab Schmiede Quintain-Nabe/Hub; Host none (NABE_VIS).
    // ≠ BODEN · ≠ HOLM · ≠ RAD (R=0.14 H=0.08 swapped coinc.) · ≠ RIEGEL.H=0.14 · ≠ PFYL.R0=0.08 · ≠ beam W=0.08 · ≠ LIFT — quintain-nabe only; do not Fake-merge.
    var NABE_GESETZ = { R: 0.08, H: 0.14 };
    var NABE_VIS = { lab: "quintain-nabe", host: "none" };

    // V18.491.423 Lab Schmiede Drehbaum-Speiche/Arm-Querschnitt; Host none (SPEICHE_VIS).
    // ≠ DREH.armLen (length already) · ≠ NABE · ≠ ARM · ≠ AUSLEG · ≠ HEBEL · ≠ QUER · ≠ BALKEN · ≠ HOLM · ≠ RIEGEL · ≠ POLSTER · ≠ ZIER · ≠ LIFT — spintree-speiche only (thick 0.075); do not Fake-merge.
    var SPEICHE_GESETZ = { thick: 0.075 };
    var SPEICHE_VIS = { lab: "spintree-speiche", host: "none" };

    // V18.491.424 Lab Schmiede Quintain-Querbalken-Querschnitt; Host none (QUERB_VIS).
    // ≠ SPEICHE.thick=0.075 · ≠ NABE.R=0.08 coinc. · ≠ RIEGEL · ≠ PFYL · ≠ HOLM · ≠ QUER · ≠ BALKEN · ≠ TRAEGER · ≠ LATTE · ≠ LIFT — quintain-querb only (thick 0.08; L=armLen*2 stays QUINT); do not Fake-merge.
    var QUERB_GESETZ = { thick: 0.08 };
    var QUERB_VIS = { lab: "quintain-querb", host: "none" };

    // V18.491.425 Lab Schmiede Quintain-Schildscheibe; Host none (SCHIRM_VIS).
    // ≠ SCHILD (charger R=0.28 H=0.05) · ≠ QUINT.shieldR=0.36 (hit ≠ mesh R=0.33) · ≠ SCHEIB.H=0.04 coinc. · ≠ QUERB · ≠ POLSTER · ≠ TELLER · ≠ LIFT — quintain-schirm only; do not Fake-merge.
    var SCHIRM_GESETZ = { R: 0.33, H: 0.04 };
    var SCHIRM_VIS = { lab: "quintain-schirm", host: "none" };

    // V18.491.426 Lab Schmiede Quintain-Schildbuckel (Umbo); Host none (BUCKEL_VIS).
    // ≠ SCHIRM · ≠ NABE · ≠ KNOLLE · ≠ BIRNE · ≠ GLIED · ≠ cross Box left bare · ≠ bag H=0.52 coinc. with cross · ≠ LIFT — quintain-buckel only; do not Fake-merge.
    var BUCKEL_GESETZ = { R: 0.07, x: 0.04 };
    var BUCKEL_VIS = { lab: "quintain-buckel", host: "none" };

    // V18.491.427 Lab Schmiede Quintain-Schildkreuz (Balkenkreuz); Host none (KREUZB_VIS).
    // ≠ KREUZ (pell Kreuzfuß R0=0.02 coinc.) · ≠ BUCKEL · ≠ SCHIRM · ≠ QUERB · ≠ LATTE.H=0.05 coinc. · ≠ bag H=0.52 coinc. · ≠ LIFT — quintain-kreuzb only; do not Fake-merge.
    var KREUZB_GESETZ = { W: 0.02, H: 0.52, D: 0.05, x: 0.028 };
    var KREUZB_VIS = { lab: "quintain-kreuzb", host: "none" };

    // V18.491.428 Lab Schmiede Quintain-Sandsack-Körper; Host none (SACK_VIS).
    // ≠ KREUZB.H=0.52 coinc. · ≠ KEGEL · ≠ TONNE · ≠ BIRNE · ≠ NABE · ≠ RAD.R=0.14 coinc. · ≠ bcap Sphere left bare · ≠ LIFT — quintain-sack only; do not Fake-merge.
    var SACK_GESETZ = { R0: 0.14, R1: 0.17, H: 0.52, y: -0.12, rotZ: 0.12 };
    var SACK_VIS = { lab: "quintain-sack", host: "none" };

    // V18.491.429 Lab Schmiede Quintain-Sandsack-Kuppe (bcap); Host none (KUPPE_VIS).
    // ≠ SACK (bag body) · ≠ BIRNE · ≠ KNOLLE · ≠ BUCKEL · ≠ GLIED · ≠ KAPPE (spintree) · ≠ HAUBE · ≠ LIFT — quintain-kuppe only; do not Fake-merge.
    var KUPPE_GESETZ = { R: 0.15, xOff: 0.06, y: -0.35 };
    var KUPPE_VIS = { lab: "quintain-kuppe", host: "none" };

    // V18.491.430 Lab Schmiede Quintain-Arm-Gelenk (postH+yOff); Host none (GELENK_VIS).
    // ≠ ANGEL (gauntlet yOff=0.12) · ≠ ZAPFEN · ≠ KUPPE · ≠ NABE · ≠ ANSATZ · ≠ HOLM · ≠ BAUM · ≠ KAPPE.yOff=0.05 (spintree) · ≠ LIFT — quintain-gelenk only (arm.y + pivot.y same law); do not Fake-merge.
    var GELENK_GESETZ = { yOff: 0.07 };
    var GELENK_VIS = { lab: "quintain-gelenk", host: "none" };

    // V18.491.431 Lab Schmiede Drehbaum-Hub/Pivot (H+yOff); Host none (SPINN_VIS).
    // ≠ GELENK.yOff=0.07 · ≠ KAPPE.yOff=0.05 (same amp, cap mesh TEIL ≠ hub/pivot — keep separate) · ≠ NABE · ≠ BAUM · ≠ HOLM · ≠ DREH · ≠ LIFT — spintree-spinn only (hub.y + pivot.y); do not Fake-merge.
    var SPINN_GESETZ = { yOff: 0.05 };
    var SPINN_VIS = { lab: "spintree-spinn", host: "none" };

    // V18.491.432 Lab Schmiede Popinjay-Mast-Radien; Host none (RUTE_VIS).
    // ≠ PAPAGEI (poleH/hitR already — do not retrofit) · ≠ MAST · ≠ STANGE · ≠ PFAHL · ≠ PFOST.R0=0.06 coinc. · ≠ PFYL.R1=0.1 coinc. · ≠ BAUM · ≠ HOLM · ≠ SPINN · ≠ DORN · ≠ ZIELP · ≠ LIFT — popinjay-rute only; do not Fake-merge.
    var RUTE_GESETZ = { R0: 0.06, R1: 0.1 };
    var RUTE_VIS = { lab: "popinjay-rute", host: "none" };

    // V18.491.433 Lab Schmiede Popinjay-Sitzast/Perch; Host none (AST_VIS).
    // ≠ RUTE · ≠ LATTE.H=0.05 coinc. · ≠ KREUZB.D=0.05 coinc. · ≠ QUERB · ≠ RIEGEL · ≠ SPEICHE · ≠ RACK.pitch=0.55 coinc. · ≠ KAPPE/SPINN yOff=0.05 · ≠ LIFT — popinjay-ast only; do not Fake-merge.
    var AST_GESETZ = { W: 0.55, thick: 0.05 };
    var AST_VIS = { lab: "popinjay-ast", host: "none" };

    // V18.491.434 Lab Schmiede Popinjay-Vogelkörper; Host none (VOGEL_VIS).
    // ≠ AST · ≠ RUMPF · ≠ LEIB · ≠ BIRNE · ≠ KNOLLE · ≠ BUCKEL · ≠ KUPPE · ≠ GLIED · ≠ RAD · ≠ wing dz=0.12 coinc. · ≠ LIFT — popinjay-vogel only (R+scale ONE body law); head/beak/tail separate; do not Fake-merge.
    var VOGEL_GESETZ = { R: 0.12, sx: 1.5, sy: 1, sz: 0.9 };
    var VOGEL_VIS = { lab: "popinjay-vogel", host: "none" };

    // V18.491.435 Lab Schmiede Popinjay-Vogelkopf; Host none (KUKEN_VIS).
    // ≠ VOGEL · ≠ KOPF · ≠ SCHAEDEL · ≠ HAUBE · ≠ BIRNE · ≠ KNOLLE · ≠ BUCKEL · ≠ KUPPE · ≠ SPEICHE.thick=0.075 coinc. · ≠ beak y=0.08 left bare · ≠ LIFT — popinjay-kuken only; do not Fake-merge.
    var KUKEN_GESETZ = { R: 0.075, x: 0.18, y: 0.08 };
    var KUKEN_VIS = { lab: "popinjay-kuken", host: "none" };

    // V18.491.436 Lab Schmiede Popinjay-Schnabel; Host none (SCHNABEL_VIS).
    // ≠ KUKEN (y=0.08 align coinc. — keep separate) · ≠ VOGEL · ≠ KEGEL · ≠ DORN · ≠ SPITZE · ≠ RUTE.R1=0.1 coinc. · ≠ LIFT — popinjay-schnabel only; do not Fake-merge.
    var SCHNABEL_GESETZ = { R: 0.03, H: 0.1, x: 0.27, y: 0.08 };
    var SCHNABEL_VIS = { lab: "popinjay-schnabel", host: "none" };

    // V18.491.437 Lab Schmiede Popinjay-Schwanz; Host none (SCHWANZ_VIS).
    // ≠ SCHNABEL · ≠ KUKEN · ≠ VOGEL · ≠ KEGEL · ≠ BUCKEL.R=0.07 coinc. · ≠ ZIPFEL · ≠ RUTE · ≠ LIFT — popinjay-schwanz only; wings separate; do not Fake-merge.
    var SCHWANZ_GESETZ = { R: 0.07, H: 0.34, x: -0.24 };
    var SCHWANZ_VIS = { lab: "popinjay-schwanz", host: "none" };

    // V18.491.438 Lab Schmiede Popinjay-Flügel (L+R same); Host none (FLUEGEL_VIS).
    // ≠ SCHWANZ · ≠ VOGEL.R=0.12 coinc. with W · ≠ AST · ≠ QUERB · ≠ SPEICHE · ≠ LIFT — popinjay-fluegel only (W/H/D + y + zOff ONE twin); do not Fake-merge.
    var FLUEGEL_GESETZ = { W: 0.12, H: 0.025, D: 0.2, y: 0.03, zOff: 0.12 };
    var FLUEGEL_VIS = { lab: "popinjay-fluegel", host: "none" };

    // V18.491.439 Lab Schmiede Popinjay-Ruhehöhe (restY=poleH+yOff); Host none (RAST_VIS).
    // ≠ FLUEGEL · ≠ PAPAGEI (poleH/hitR) · ≠ AST · ≠ RUTE · ≠ ANSATZ · ≠ GELENK · ≠ SPINN · ≠ RUHE · ≠ LIFT — popinjay-rast only (bird.y + base.y same law); do not Fake-merge.
    var RAST_GESETZ = { yOff: 0.13 };
    var RAST_VIS = { lab: "popinjay-rast", host: "none" };

    // V18.491.440 Lab Schmiede Pfeil-Befiederung (3× Box); Host none (KIEL_VIS).
    // ≠ FEDER (spring-pell logic) · ≠ FLUEGEL · ≠ PFEIL (L/shR) · ≠ RAST · ≠ AST.thick=0.05 coinc. with W · ≠ LIFT — pfeil-kiel only (3 vanes ONE law); tip/nock left bare; do not Fake-merge.
    var KIEL_GESETZ = { W: 0.05, H: 0.022, D: 0.0015, xOff: 0.04, y: 0.011 };
    var KIEL_VIS = { lab: "pfeil-kiel", host: "none" };

    // V18.491.441 Lab Schmiede Stechbahn-Torpfosten-Radien; Host none (TORP_VIS).
    // ≠ STECH (R/barH/postX/spots already — do not retrofit) · ≠ KIEL · ≠ BUCKEL.R=0.07 · ≠ SCHWANZ.R=0.07 · ≠ BAUM · ≠ HOLM · ≠ PFYL · ≠ RUTE · ≠ PFOST · ≠ STEHER · ≠ LIFT — stech-torp only; do not Fake-merge.
    var TORP_GESETZ = { R0: 0.07, R1: 0.09 };
    var TORP_VIS = { lab: "stech-torp", host: "none" };

    // V18.491.442 Lab Schmiede Stechbahn-Querbarre; Host none (BARRE_VIS).
    // ≠ TORP · ≠ QUERB · ≠ RIEGEL · ≠ AST · ≠ BALKEN · ≠ TRAEGER · ≠ LATTE · ≠ STANGE · ≠ RUTE.R1=0.1 coinc. · ≠ STECH.barH (y) · ≠ LIFT — stech-barre only; do not Fake-merge.
    var BARRE_GESETZ = { W: 3.0, thick: 0.1 };
    var BARRE_VIS = { lab: "stech-barre", host: "none" };

    // V18.491.443 Lab Schmiede Stechbahn-Hängeschnur; Host none (FADEN_VIS).
    // ≠ BARRE · ≠ TAU · ≠ SEIL · ≠ STRANG · ≠ STRICK · ≠ GURT · ≠ SCHLINGE · ≠ LIFT — stech-faden only (R; H=STECH_BARH-ry derived); ring tube left bare; do not Fake-merge.
    var FADEN_GESETZ = { R: 0.006 };
    var FADEN_VIS = { lab: "stech-faden", host: "none" };

    // V18.491.444 Lab Schmiede Stechbahn-Ring-Rohr (Torus tube); Host none (ROHR_VIS).
    // ≠ STECH.R (major already) · ≠ FADEN · ≠ ZIER.tube · ≠ MUFFE.tube · ≠ SCHLINGE · ≠ GURT · ≠ OESE · ≠ REIF · ≠ RING · ≠ LIFT — stech-rohr only; do not Fake-merge.
    var ROHR_GESETZ = { tube: 0.026 };
    var ROHR_VIS = { lab: "stech-rohr", host: "none" };

    // V18.491.445 Lab Schmiede Pfeil-Bodkin-Spitze; Host none (BODKIN_VIS).
    // ≠ SPITZE (wand) · ≠ DORN.R0=0.035 coinc. with H · ≠ SCHNABEL · ≠ KIEL · ≠ KEGEL · ≠ ROHR · ≠ PFEIL.shR · ≠ nock left bare · ≠ LIFT — pfeil-bodkin only; do not Fake-merge.
    var BODKIN_GESETZ = { mul: 1.8, H: 0.035, xOff: 0.017 };
    var BODKIN_VIS = { lab: "pfeil-bodkin", host: "none" };

    // V18.491.446 Lab Schmiede Pfeil-Nocke; Host none (NOCK_VIS).
    // ≠ BODKIN · ≠ KIEL · ≠ SCHNABEL · ≠ KEHLE · ≠ PFEIL.shR · ≠ LIFT — pfeil-nock only (mul+H+xOff; R1=shR); do not Fake-merge.
    var NOCK_GESETZ = { mul: 1.5, H: 0.02, xOff: 0.01 };
    var NOCK_VIS = { lab: "pfeil-nock", host: "none" };

    // V18.491.447 Lab Schmiede Lehren-Hand-Drehpunkt (Torus); Host none (HAND_VIS).
    // ≠ NOCK.H=0.02 coinc. with R · ≠ REIF.tube=0.02 coinc. · ≠ OESE · ≠ RING · ≠ MUFFE · ≠ ROHR · ≠ ZIER · ≠ LIFT — lehren-hand only; ground tufts left bare; do not Fake-merge.
    var HAND_GESETZ = { R: 0.02, tube: 0.0035 };
    var HAND_VIS = { lab: "lehren-hand", host: "none" };

    // V18.491.448 Lab Schmiede Grasbüschel-Halm (Cone R); Host none (GRAS_VIS).
    // ≠ HAND · ≠ HALM (bamboo) · ≠ BUSCH · ≠ KEGEL · ≠ LIFT — hof-gras only (R; H stays random); Feldsteine left bare; do not Fake-merge.
    var GRAS_GESETZ = { R: 0.012 };
    var GRAS_VIS = { lab: "hof-gras", host: "none" };

    // V18.491.449 Lab Schmiede Feldstein-Größe (Icosahedron sR=r0+rand*rSpan); Host none (KIESEL_VIS).
    // ≠ GRAS · ≠ HALM · ≠ BUSCH · ≠ LIFT — hof-kiesel only (r0/rSpan; scaleY random left bare); do not Fake-merge.
    var KIESEL_GESETZ = { r0: 0.04, rSpan: 0.11 };
    var KIESEL_VIS = { lab: "hof-kiesel", host: "none" };

    // V18.491.450 Lab Schmiede Feldstein-Abflachung (scaleY=y0+rand*ySpan); Host none (FLACH_VIS).
    // ≠ KIESEL (r0/rSpan) · ≠ GRAS · ≠ PLATTE · ≠ LIFT — hof-flach only; do not Fake-merge into KIESEL.
    var FLACH_GESETZ = { y0: 0.55, ySpan: 0.35 };
    var FLACH_VIS = { lab: "hof-flach", host: "none" };

    // V18.491.451 Lab Schmiede Lehren/Spine-Punkte (dot radii); Host none (PUNKT_VIS).
    // ≠ FLACH · ≠ HAND · ≠ KIESEL · ≠ TUPF (default/cutcard 0.008) · ≠ LIFT — lehren-punkt only (station 0.009 · mark 0.013 for bal+CoP); do not Fake-merge.
    var PUNKT_GESETZ = { station: 0.009, mark: 0.013 };
    var PUNKT_VIS = { lab: "lehren-punkt", host: "none" };

    // V18.491.452 Lab Schmiede default/cutcard Dot-Radius; Host none (TUPF_VIS).
    // ≠ PUNKT · ≠ HAND · ≠ FLACH · ≠ STREU · ≠ LIFT — lehren-tupf only (r 0.008 default + cutcard CoM); do not Fake-merge with streu.
    var TUPF_GESETZ = { r: 0.008 };
    var TUPF_VIS = { lab: "lehren-tupf", host: "none" };

    // V18.491.453 Lab Schmiede Hof Streu-Kosmetik (count + polar rad=r0+rand*rSpan); Host none (STREU_VIS).
    // ≠ TUPF · ≠ PUNKT · ≠ GRAS · ≠ KIESEL · ≠ BUESCHEL · ≠ LIFT — hof-streu only (placement swarm; stone/grass size laws stay own twins); do not Fake-merge.
    var STREU_GESETZ = { count: 82, r0: 3, rSpan: 26 };
    var STREU_VIS = { lab: "hof-streu", host: "none" };

    // V18.491.454 Lab Schmiede Grasbüschel Halm-Anzahl (nb=n0+rand*nSpan|0); Host none (BUESCHEL_VIS).
    // ≠ STREU · ≠ GRAS (R only) · ≠ HALM (bambus) · ≠ BUSCH (ritter) · ≠ HALMH · ≠ LIFT — hof-bueschel only; H/jitter left bare; do not Fake-merge.
    var BUESCHEL_GESETZ = { n0: 3, nSpan: 3 };
    var BUESCHEL_VIS = { lab: "hof-bueschel", host: "none" };

    // V18.491.455 Lab Schmiede Gras-Halm-Höhe (h=h0+rand*hSpan); Host none (HALMH_VIS).
    // ≠ BUESCHEL · ≠ GRAS (R only) · ≠ HALM (bambus) · ≠ STREU · ≠ ZITTER · ≠ LIFT — hof-halmh only; jitter left bare; do not Fake-merge.
    var HALMH_GESETZ = { h0: 0.06, hSpan: 0.11 };
    var HALMH_VIS = { lab: "hof-halmh", host: "none" };

    // V18.491.456 Lab Schmiede Grasbüschel Halm-Zitter (pos+tilt spans); Host none (ZITTER_VIS).
    // ≠ HALMH · ≠ BUESCHEL · ≠ GRAS · ≠ STREU · ≠ RACK.pitch/FLACH.y0 (0.55 coincidence) · ≠ SCHLAUCH · ≠ LIFT — hof-zitter only; do not Fake-merge.
    var ZITTER_GESETZ = { pos: 0.07, tilt: 0.55 };
    var ZITTER_VIS = { lab: "hof-zitter", host: "none" };

    // V18.491.457 Lab Schmiede Overlay ringMesh default Torus-tube; Host none (SCHLAUCH_VIS).
    // ≠ ZITTER · ≠ ROHR (stech 0.026) · ≠ HAND.tube (0.0035) · ≠ SCHLINGE · ≠ Zielscheibe face 0.004 (cyl H coincidence) · ≠ BUTT · ≠ TUPF · ≠ LIFT — lehren-schlauch only; do not Fake-merge.
    var SCHLAUCH_GESETZ = { tube: 0.004 };
    var SCHLAUCH_VIS = { lab: "lehren-schlauch", host: "none" };

    // V18.491.458 Lab Schmiede Zielscheibe Strohballen-Butt (rMul·R + depth H); Host none (BUTT_VIS).
    // ≠ SCHLAUCH · ≠ SCHEIBE (face rings) · ≠ SCHEIB · ≠ SCHEIBF · ≠ DREIB · ≠ POLSTER.H (0.18 coincidence) · ≠ TUPF · ≠ LIFT — scheibe-butt only; face/pos left bare; do not Fake-merge.
    var BUTT_GESETZ = { rMul: 1.06, H: 0.18 };
    var BUTT_VIS = { lab: "scheibe-butt", host: "none" };

    // V18.491.459 Lab Schmiede Zielscheibe Papier-Face/Disc-Dicke; Host none (SCHEIBF_VIS).
    // ≠ BUTT · ≠ BUTTP · ≠ SCHLAUCH (torus tube 0.004 coincidence) · ≠ SCHEIB · ≠ SCHEIBE (R+rings) · ≠ BLATT.dThk · ≠ TUPF · ≠ LIFT — scheibe-face only; stack/pos left bare; do not Fake-merge.
    var SCHEIBF_GESETZ = { H: 0.004 };
    var SCHEIBF_VIS = { lab: "scheibe-face", host: "none" };

    // V18.491.460 Lab Schmiede Zielscheibe Butt-X-Lage; Host none (BUTTP_VIS).
    // ≠ SCHEIBF · ≠ BUTT (rMul/H) · ≠ STAPEL · ≠ VOR (kirmes −0.1 coincidence) · ≠ SCHLAUCH · ≠ LIFT — scheibe-buttp only; disc stack left bare; do not Fake-merge.
    var BUTTP_GESETZ = { x: 0.10 };
    var BUTTP_VIS = { lab: "scheibe-buttp", host: "none" };

    // V18.491.461 Lab Schmiede Zielscheibe Disc-Stack-X (x0 − i·dx); Host none (STAPEL_VIS).
    // ≠ BUTTP · ≠ SCHEIBF · ≠ BUTT · ≠ FACEX · ≠ LIFT — scheibe-stapel only; do not Fake-merge.
    var STAPEL_GESETZ = { x0: -0.003, dx: 0.0006 };
    var STAPEL_VIS = { lab: "scheibe-stapel", host: "none" };

    // V18.491.462 Lab Schmiede Zielscheibe Paper-Face Hit-X (userData.faceX); Host none (FACEX_VIS).
    // ≠ STAPEL · ≠ SCHEIBF · ≠ BUTTP · ≠ BUTT · ≠ NARB · ≠ LIFT — scheibe-facex only; do not Fake-merge with stack x0.
    var FACEX_GESETZ = { x: -0.006 };
    var FACEX_VIS = { lab: "scheibe-facex", host: "none" };

    // V18.491.463 Lab Schmiede Dummy-Narben STICH/SCHLAG Kreisradii; Host none (NARB_VIS).
    // ≠ FACEX (scar lift 0.006 coincidence) · ≠ SCHNITT (cutting-lane) · ≠ SCHRAMM · ≠ TUPF · ≠ LIFT — dummy-narb only; Schnitt-plane left bare; do not Fake-merge.
    var NARB_GESETZ = { stich: 0.022, schlag: 0.058 };
    var NARB_VIS = { lab: "dummy-narb", host: "none" };

    // V18.491.464 Lab Schmiede Dummy-Schnitt-Schramme (Plane W×H); Host none (SCHRAMM_VIS).
    // ≠ NARB (circle radii) · ≠ SCHNITT (cutting-lane) · ≠ FACEX · ≠ NARBZ · ≠ TUPF · ≠ LIFT — dummy-schramm only; do not Fake-merge.
    var SCHRAMM_GESETZ = { W: 0.15, H: 0.014 };
    var SCHRAMM_VIS = { lab: "dummy-schramm", host: "none" };

    // V18.491.465 Lab Schmiede Dummy-Narben Normal-Lift; Host none (NARBZ_VIS).
    // ≠ SCHRAMM · ≠ NARB · ≠ NARBC · ≠ FACEX (−0.006 hit-X coincidence) · ≠ HEBE/LIFT (0.30) · ≠ LIFT — dummy-narbz only; do not Fake-merge.
    var NARBZ_GESETZ = { n: 0.006 };
    var NARBZ_VIS = { lab: "dummy-narbz", host: "none" };

    // V18.491.466 Lab Schmiede Dummy-Narben Cap (max scars); Host none (NARBC_VIS).
    // ≠ NARBZ · ≠ NARB · ≠ KAPPE (spintree) · ≠ TUPF · ≠ SPUR · ≠ LIFT — dummy-narbc only; recoilKeMul already gefuehl .185; do not Fake-merge.
    var NARBC_GESETZ = { max: 30 };
    var NARBC_VIS = { lab: "dummy-narbc", host: "none" };

    // V18.491.467 Lab Schmiede Blade-Trail Point-Cap; Host none (SPUR_VIS).
    // ≠ NARBC · ≠ TRAIL_VIS (opacity only) · ≠ dragMag>12 coincidence · ≠ TUPF · ≠ labRecoilKeMul/RECOIL (.185 already) · ≠ BENCH · ≠ LIFT — trail-spur only; do not Fake-merge.
    var SPUR_GESETZ = { max: 12 };
    var SPUR_VIS = { lab: "trail-spur", host: "none" };

    // V18.491.468 Lab Schmiede Werkbank-Plane (square size); Host none (BENCH_VIS).
    // ≠ SPUR · ≠ BANK (floorY only) · ≠ TISCH · ≠ PLATTE · ≠ BODEN · ≠ FELD · ≠ LIFT — studio-bench only; grid/ground left bare; do not Fake-merge.
    var BENCH_GESETZ = { size: 5 };
    var BENCH_VIS = { lab: "studio-bench", host: "none" };

    // V18.491.469 Lab Schmiede Hof Erd-Scheibe (square size); Host none (FELD_VIS).
    // ≠ BENCH · ≠ BODEN (quintain) · ≠ HOF (ringe) · ≠ ARENA object · ≠ NETZ · ≠ LIFT — hof-feld only; do not Fake-merge.
    var FELD_GESETZ = { size: 72 };
    var FELD_VIS = { lab: "hof-feld", host: "none" };

    // V18.491.470 Lab Schmiede Hof Erd-Scheibe Tessellation (segs×segs); Host none (NETZ_VIS).
    // ≠ FELD (size) · ≠ BENCH · ≠ BODEN · ≠ RAST · ≠ GITTER · ≠ LIFT — hof-netz only; do not Fake-merge.
    var NETZ_GESETZ = { segs: 64 };
    var NETZ_VIS = { lab: "hof-netz", host: "none" };

    // V18.491.471 Lab Schmiede Studio GridHelper (size+divs); Host none (GITTER_VIS).
    // ≠ NETZ · ≠ FELD · ≠ RAST · ≠ BENCH · ≠ HUB · ≠ LIFT — studio-gitter only; colors/opacity/yOff left bare; do not Fake-merge.
    var GITTER_GESETZ = { size: 4.5, divs: 18 };
    var GITTER_VIS = { lab: "studio-gitter", host: "none" };

    // V18.491.472 Lab Schmiede Studio Grid Y-Hub (z-fight lift); Host none (HUB_VIS).
    // ≠ GITTER · ≠ NETZ · ≠ FELD · ≠ NARBZ · ≠ NABE · ≠ SCHLEIER · ≠ LIFT — gitter-hub only; opacity left bare; do not Fake-merge.
    var HUB_GESETZ = { yOff: 0.001 };
    var HUB_VIS = { lab: "gitter-hub", host: "none" };

    // V18.491.473 Lab Schmiede Studio Grid Opacity; Host none (SCHLEIER_VIS).
    // ≠ HUB · ≠ GITTER · ≠ NETZ · ≠ FELD · ≠ FADEN · ≠ NEBEL (porta) · ≠ PATINA · ≠ LIFT — gitter-schleier only; colors left bare; do not Fake-merge.
    var SCHLEIER_GESETZ = { opacity: 0.26 };
    var SCHLEIER_VIS = { lab: "gitter-schleier", host: "none" };

    // V18.491.474 Lab Schmiede Studio Grid Colors (center+grid); Host none (PATINA_VIS).
    // ≠ SCHLEIER · ≠ HUB · ≠ GITTER · ≠ NETZ · ≠ TON · ≠ DUNST · ≠ LIFT — gitter-patina only; lights/fog left bare; do not Fake-merge.
    var PATINA_GESETZ = { center: 0x241b10, grid: 0x130d07 };
    var PATINA_VIS = { lab: "gitter-patina", host: "none" };

    // V18.491.475 Lab Schmiede Studio FogExp2 density; Host none (DUNST_VIS).
    // ≠ PATINA · ≠ SCHLEIER · ≠ HUB · ≠ GITTER · ≠ NEBEL (porta) · ≠ DUNSTA · ≠ LIFT — studio-dunst only; do not Fake-merge.
    var DUNST_GESETZ = { dens: 0.045 };
    var DUNST_VIS = { lab: "studio-dunst", host: "none" };

    // V18.491.476 Lab Schmiede Arena FogExp2 density; Host none (DUNSTA_VIS).
    // ≠ DUNST (studio 0.045) · ≠ PATINA · ≠ SCHLEIER · ≠ NEBEL (porta) · ≠ BLUETE · ≠ LIFT — arena-dunst only; lights/bloom left bare; do not Fake-merge.
    var DUNSTA_GESETZ = { dens: 0.006 };
    var DUNSTA_VIS = { lab: "arena-dunst", host: "none" };

    // V18.491.477 Lab Schmiede Studio UnrealBloomPass (strength/radius/threshold); Host none (BLUETE_VIS).
    // ≠ DUNSTA · ≠ DUNST · ≠ PATINA · ≠ SCHLEIER · ≠ HEMI · ≠ LIFT — studio-bluete only; do not Fake-merge with lights.
    var BLUETE_GESETZ = { strength: 0.42, radius: 0.65, threshold: 0.82 };
    var BLUETE_VIS = { lab: "studio-bluete", host: "none" };

    // V18.491.478 Lab Schmiede Studio HemisphereLight (sky/ground/intensity); Host none (HEMI_VIS).
    // ≠ BLUETE · ≠ DUNSTA · ≠ DUNST · ≠ PATINA · ≠ KEY · ≠ rim/fill/edge left bare · ≠ LIFT — studio-hemi only; do not Fake-merge light rig.
    var HEMI_GESETZ = { sky: 0x6a5a44, ground: 0x0c0806, intensity: 0.5 };
    var HEMI_VIS = { lab: "studio-hemi", host: "none" };

    // V18.491.479 Lab Schmiede Studio Key DirectionalLight (color/intensity/pos); Host none (KEY_VIS).
    // ≠ HEMI · ≠ BLUETE · ≠ DUNSTA · ≠ RIM · ≠ fill/edge · ≠ shadow frustum left bare · ≠ LIFT — studio-key only; do not Fake-merge.
    var KEY_GESETZ = { color: 0xffe8c8, intensity: 3.0, x: 2.4, y: 3.6, z: 2.2 };
    var KEY_VIS = { lab: "studio-key", host: "none" };

    // V18.491.480 Lab Schmiede Studio Rim DirectionalLight (color/intensity/pos); Host none (RIM_VIS).
    // ≠ KEY · ≠ HEMI · ≠ BLUETE · ≠ FILL · ≠ edge · ≠ shadow frustum · ≠ LIFT — studio-rim only; do not Fake-merge light roles.
    var RIM_GESETZ = { color: 0x66a8ff, intensity: 1.5, x: -2.6, y: 1.6, z: -2.2 };
    var RIM_VIS = { lab: "studio-rim", host: "none" };

    // V18.491.481 Lab Schmiede Studio Fill DirectionalLight (color/intensity/pos); Host none (FILL_VIS).
    // ≠ RIM · ≠ KEY · ≠ HEMI · ≠ BLUETE · ≠ EDGE · ≠ shadow frustum · ≠ LIFT — studio-fill only; do not Fake-merge light roles.
    var FILL_GESETZ = { color: 0xff8a44, intensity: 0.6, x: 0.4, y: 0.8, z: -2.6 };
    var FILL_VIS = { lab: "studio-fill", host: "none" };

    // V18.491.482 Lab Schmiede Studio Edge PointLight (color/intensity/dist/pos); Host none (EDGE_VIS).
    // ≠ FILL · ≠ RIM · ≠ KEY · ≠ HEMI · ≠ BLUETE · ≠ RAND (pergola) · ≠ FRUSTUM · ≠ LIFT — studio-edge only; do not Fake-merge.
    var EDGE_GESETZ = { color: 0xfff0d8, intensity: 0.8, dist: 4, x: 0.6, y: 0.5, z: 0.9 };
    var EDGE_VIS = { lab: "studio-edge", host: "none" };

    // V18.491.483 Lab Schmiede Studio Key Shadow Frustum (left/right/top/bottom/near/far); Host none (FRUSTUM_VIS).
    // ≠ EDGE · ≠ KEY color/pos · ≠ FILL · ≠ RIM · ≠ HEMI · ≠ SCHATTEN · ≠ KEGEL · ≠ LIFT — studio-frustum only; do not Fake-merge.
    var FRUSTUM_GESETZ = { left: -1.3, right: 1.3, top: 1.2, bottom: -0.8, near: 0.5, far: 9 };
    var FRUSTUM_VIS = { lab: "studio-frustum", host: "none" };

    // V18.491.484 Lab Schmiede Studio Key Shadow Map (mapSize + bias); Host none (SCHATTEN_VIS).
    // ≠ FRUSTUM · ≠ EDGE · ≠ KEY · ≠ FILL · ≠ RIM · ≠ HEMI · ≠ BLICK · ≠ LIFT — studio-schatten only; mapSize+bias ONE quality twin; do not Fake-merge.
    var SCHATTEN_GESETZ = { size: 2048, bias: -0.00018 };
    var SCHATTEN_VIS = { lab: "studio-schatten", host: "none" };

    // V18.491.485 Lab Schmiede Studio Camera (fov/near/far/pos); Host none (BLICK_VIS).
    // ≠ SCHATTEN · ≠ FRUSTUM · ≠ FOV labFovK (Prüfstand) · ≠ ORBIT · ≠ exposure · ≠ LIFT — studio-blick only; do not Fake-merge.
    var BLICK_GESETZ = { fov: 33, near: 0.05, far: 100, x: 0.16, y: 0.74, z: 1.78 };
    var BLICK_VIS = { lab: "studio-blick", host: "none" };

    // V18.491.486 Lab Schmiede Studio OrbitControls (damp/targetY/minD/maxD/polar); Host none (ORBIT_VIS).
    // ≠ BLICK · ≠ SCHATTEN · ≠ BENCH · ≠ FOV labFovK · ≠ BELICHT · ≠ LIFT — studio-orbit only; do not Fake-merge with camera.
    var ORBIT_GESETZ = { damp: 0.08, ty: 0.30, minD: 0.5, maxD: 4.5, polar: 0.95 };
    var ORBIT_VIS = { lab: "studio-orbit", host: "none" };

    // V18.491.487 Lab Schmiede Studio toneMappingExposure; Host none (BELICHT_VIS).
    // ≠ ORBIT · ≠ BLICK · ≠ BENCH · ≠ SCHATTEN · ≠ BLUETE · ≠ BANKM · ≠ LIFT — studio-belicht only; do not Fake-merge.
    var BELICHT_GESETZ = { exposure: 1.06 };
    var BELICHT_VIS = { lab: "studio-belicht", host: "none" };

    // V18.491.488 Lab Schmiede Studio Bench Material (color/rough/metal/env); Host none (BANKM_VIS).
    // ≠ BELICHT · ≠ ORBIT · ≠ BLICK · ≠ BENCH size · ≠ BANK floorY · ≠ TISCH · ≠ HINTER · ≠ LIFT — studio-bankm only; do not Fake-merge.
    var BANKM_GESETZ = { color: 0x090706, rough: 0.8, metal: 0.2, env: 0.6 };
    var BANKM_VIS = { lab: "studio-bankm", host: "none" };

    // V18.491.489 Lab Schmiede Studio bg/fog color; Host none (HINTER_VIS).
    // ≠ BANKM · ≠ BELICHT · ≠ DUNST dens · ≠ DUNSTA · ≠ BENCH · ≠ LEIN · ≠ LIFT — studio-hinter only; bg+fog share one color; do not Fake-merge dens.
    var HINTER_GESETZ = { color: 0x0a0807 };
    var HINTER_VIS = { lab: "studio-hinter", host: "none" };

    // V18.491.490 Lab Schmiede Studio PMREM Leinwand gradient (top/mid/bot + midT); Host none (LEIN_VIS).
    // ≠ HINTER · ≠ BANKM · ≠ BELICHT · ≠ DUNST · ≠ PATINA (0x241b10 ≠ mid 0x241a12) · ≠ LEINE · ≠ FENSTER · ≠ LIFT — studio-lein only.
    var LEIN_GESETZ = { top: 0x5a4836, mid: 0x241a12, bot: 0x080604, midT: 0.4 };
    var LEIN_VIS = { lab: "studio-lein", host: "none" };

    // V18.491.491 Lab Schmiede Studio Esse-Fenster (shared rgba + two rects); Host none (FENSTER_VIS).
    // ≠ LEIN · ≠ HINTER · ≠ BANKM · ≠ PATINA · ≠ FUNKEN · ≠ grade · ≠ LIFT — studio-fenster only; do not Fake-merge.
    var FENSTER_GESETZ = { r: 255, g: 180, b: 90, a: 0.30, x0: 140, y0: 30, w0: 200, h0: 90, x1: 650, y1: 40, w1: 170, h1: 70 };
    var FENSTER_VIS = { lab: "studio-fenster", host: "none" };

    // V18.491.492 Lab Schmiede Studio Funken-Streifen (rgba + one rect); Host none (FUNKEN_VIS).
    // ≠ FENSTER · ≠ LEIN · ≠ HINTER · ≠ PATINA · ≠ STREIF (wand) · ≠ GRADE · ≠ LIFT — studio-funken only; do not Fake-merge.
    var FUNKEN_GESETZ = { r: 255, g: 120, b: 40, a: 0.18, x: 420, y: 300, w: 260, h: 40 };
    var FUNKEN_VIS = { lab: "studio-funken", host: "none" };

    // V18.491.493 Lab Schmiede Studio Grade (vignette + grain); Host none (GRADE_VIS).
    // ≠ FUNKEN · ≠ FENSTER · ≠ LEIN · ≠ HINTER · ≠ BLUETE · ≠ ERDE · ≠ LIFT — studio-grade only; do not Fake-merge.
    var GRADE_GESETZ = { outer: 1.15, inner: 0.18, mul: 1.25, grain: 0.03, grainOff: 0.015 };
    var GRADE_VIS = { lab: "studio-grade", host: "none" };

    // V18.491.494 Lab Schmiede Hof Erd-Scheibe Terrain-Farben (dark/mid/light); Host none (ERDE_VIS).
    // ≠ GRADE · ≠ FUNKEN · ≠ FENSTER · ≠ LEIN · ≠ HINTER · ≠ PATINA · ≠ FELD size · ≠ NETZ · ≠ RAUSCH · ≠ LIFT — hof-erde only.
    var ERDE_GESETZ = { dark: 0x17130e, mid: 0x2a241b, light: 0x3c3327 };
    var ERDE_VIS = { lab: "hof-erde", host: "none" };

    // V18.491.495 Lab Schmiede Hof Erd-Scheibe Noise (f0/f1/w0/w1); Host none (RAUSCH_VIS).
    // ≠ ERDE · ≠ GRADE · ≠ PATINA · ≠ FELD · ≠ NETZ · ≠ DISK · ≠ HOF ring · ≠ LIFT — hof-rausch only; do not Fake-merge.
    var RAUSCH_GESETZ = { f0: 0.21, f1: 0.055, w0: 0.45, w1: 0.55 };
    var RAUSCH_VIS = { lab: "hof-rausch", host: "none" };

    // V18.491.496 Lab Schmiede Hof Erd-Scheibe Disk Material (rough/metal); Host none (DISK_VIS).
    // ≠ RAUSCH · ≠ ERDE · ≠ GRADE · ≠ BANKM · ≠ SCHEIBE · ≠ RINGF · ≠ LIFT — hof-disk only; do not Fake-merge.
    var DISK_GESETZ = { rough: 0.98, metal: 0 };
    var DISK_VIS = { lab: "hof-disk", host: "none" };

    // V18.491.497 Lab Schmiede Hof Ring Material (color/rough/metal); Host none (RINGF_VIS).
    // ≠ DISK · ≠ RAUSCH · ≠ ERDE · ≠ RIM light · ≠ HOF geo · ≠ REIF · ≠ RAND · ≠ STREUM · ≠ LIFT — hof-ringf only; do not Fake-merge.
    var RINGF_GESETZ = { color: 0x393530, rough: 0.9, metal: 0 };
    var RINGF_VIS = { lab: "hof-ringf", host: "none" };

    // V18.491.498 Lab Schmiede Hof Streu Stein/Gras Mats (s0–s2 + gras + roughs); Host none (STREUM_VIS).
    // ≠ RINGF · ≠ DISK · ≠ RAUSCH · ≠ ERDE · ≠ STREU count · ≠ KIESEL · ≠ GRAS R · ≠ PELLM · ≠ LIFT — hof-streum only; do not Fake-merge.
    var STREUM_GESETZ = { s0: 0x4a453d, s1: 0x3a352d, s2: 0x504a40, sR0: 0.95, sR1: 0.95, sR2: 0.92, gras: 0x36412a, gR: 0.95 };
    var STREUM_VIS = { lab: "hof-streum", host: "none" };

    // V18.491.499 Lab Schmiede Pell Dummy Mats (stroh/leder/holz/seil); Host none (PELLM_VIS).
    // ≠ STREUM · ≠ STREU · ≠ RINGF · ≠ DISK · ≠ PELL geo · ≠ NAHTM · ≠ LIFT — pell-pellm only; do not Fake-merge.
    var PELLM_GESETZ = { stroh: 0xb89a52, strohR: 0.95, leder: 0x6e4a2c, lederR: 0.7, holz: 0x4a3520, holzR: 0.85, seil: 0x8a7240, seilR: 0.95 };
    var PELLM_VIS = { lab: "pell-pellm", host: "none" };

    // V18.491.500 Lab Schmiede Pell Kopf-Naht Material (color/rough/metal); Host none (NAHTM_VIS).
    // ≠ PELLM · ≠ STREUM · ≠ PELL · ≠ NAHT geo · ≠ NAHE · ≠ ETIK · ≠ LIFT — pell-nahtm only; do not Fake-merge.
    var NAHTM_GESETZ = { color: 0x4a3018, rough: 0.8, metal: 0 };
    var NAHTM_VIS = { lab: "pell-nahtm", host: "none" };

    // V18.491.501 Lab Schmiede Overlay Label Sprite (scale/fs/pad/bg/rr); Host none (ETIK_VIS).
    // ≠ NAHTM · ≠ PELLM · ≠ STREUM · ≠ SCHILD · ≠ SCHIEB · ≠ LIFT — lehren-etik only; do not Fake-merge.
    var ETIK_GESETZ = { scale: 0.05, fs: 44, pad: 10, r: 10, g: 7, b: 5, a: 0.80, rr: 11 };
    var ETIK_VIS = { lab: "lehren-etik", host: "none" };

    // V18.491.502 Lab Schmiede Overlay Caliper (opacity/tick/labScale/labY); Host none (SCHIEB_VIS).
    // ≠ ETIK (scale 0.05 ≠ labScale 0.046) · ≠ NAHTM · ≠ PELLM · ≠ FORTE · ≠ LIFT — lehren-schieb only; do not Fake-merge.
    var SCHIEB_GESETZ = { opacity: 0.85, tick: 0.012, labScale: 0.046, labY: 0.045 };
    var SCHIEB_VIS = { lab: "lehren-schieb", host: "none" };

    // V18.491.503 Lab Schmiede Schnitt-Karte Forte (t/sc/xOff/py); Host none (FORTE_VIS).
    // ≠ SCHIEB · ≠ ETIK · ≠ NAHTM · ≠ RUECK.T=0.18 coincidence · ≠ SCHNITT lane · ≠ WIRBEL · ≠ LIFT — lehren-forte only.
    var FORTE_GESETZ = { t: 0.18, sc: 4.2, xOff: 0.12, py: 0.30 };
    var FORTE_VIS = { lab: "lehren-forte", host: "none" };

    // V18.491.504 Lab Schmiede Rückgrat-Mittellinie (color/opacity); Host none (WIRBEL_VIS).
    // ≠ FORTE · ≠ SCHIEB · ≠ ETIK · ≠ RUECK panel · ≠ ACHSE · ≠ pfeil mats · ≠ LIFT — lehren-wirbel only; do not Fake-merge.
    var WIRBEL_GESETZ = { color: 0xe7c887, opacity: 0.8 };
    var WIRBEL_VIS = { lab: "lehren-wirbel", host: "none" };

    // V18.491.505 Lab Schmiede Schnitt-Karte neutrale Achsen (color/opH/opV/mulH/mulV); Host none (ACHSE_VIS).
    // ≠ WIRBEL · ≠ FORTE · ≠ SCHIEB · ≠ RIM (0x66a8ff coincidence) · ≠ KONTUR · ≠ pfeil · ≠ LIFT — lehren-achse only.
    var ACHSE_GESETZ = { color: 0x66a8ff, opH: 0.7, opV: 0.5, mulH: 1.1, mulV: 2.6 };
    var ACHSE_VIS = { lab: "lehren-achse", host: "none" };

    // V18.491.506 Lab Schmiede Schnitt-Karte Kontur (color/zOff); Host none (KONTUR_VIS).
    // ≠ ACHSE · ≠ WIRBEL (same hex, but WIRBEL has opacity · Kontur opaque+zOff) · ≠ FORTE · ≠ RIM · ≠ PFEILM · ≠ LIFT — lehren-kontur only.
    var KONTUR_GESETZ = { color: 0xe7c887, zOff: 0.001 };
    var KONTUR_VIS = { lab: "lehren-kontur", host: "none" };

    // V18.491.507 Lab Schmiede Pfeil Mats (shaft/tip/nock/kiel); Host none (PFEILM_VIS).
    // ≠ KONTUR · ≠ WIRBEL · ≠ ACHSE · ≠ PFEIL L/shR · ≠ BODKIN · ≠ NOCK · ≠ KIEL geo · ≠ SCHEIBM · ≠ LIFT — pfeil-pfeilm only; do not Fake-merge.
    var PFEILM_GESETZ = { shaft: 0x9a7a4a, shaftR: 0.8, tip: 0x9099a0, tipR: 0.5, tipM: 0.7, nock: 0x222428, nockR: 0.6, kiel0: 0xd24b4b, kiel1: 0xe8e0d0, kielR: 0.9 };
    var PFEILM_VIS = { lab: "pfeil-pfeilm", host: "none" };

    // V18.491.508 Lab Schmiede Zielscheibe Mats (butt/face/leg + ringR); Host none (SCHEIBM_VIS).
    // ≠ PFEILM · ≠ SCHEIBE rings · ≠ BUTT/SCHEIBF geo · ≠ PELLM.holz coincidence · ≠ MASSE · ≠ LIFT — scheibe-scheibm only.
    var SCHEIBM_GESETZ = { butt: 0xc6a85a, buttR: 0.98, face: 0xf4f0e8, faceR: 0.9, leg: 0x4a3520, legR: 0.85, ringR: 0.85 };
    var SCHEIBM_VIS = { lab: "scheibe-scheibm", host: "none" };

    // V18.491.509 Lab Schmiede Masse-Streifen λ(x) (y0/sc/N/amp/color); Host none (MASSE_VIS).
    // ≠ SCHEIBM · ≠ PFEILM · ≠ PELLM · ≠ STREIF wand · ≠ GLIEDM · ≠ LIFT — lehren-masse only; do not Fake-merge.
    var MASSE_GESETZ = { y0: -0.16, sc: 0.9, N: 120, amp: 0.09, color: 0x8a93a0 };
    var MASSE_VIS = { lab: "lehren-masse", host: "none" };

    // V18.491.510 Lab Schmiede View-Model Arm Mats (metal/skin); Host none (GLIEDM_VIS).
    // ≠ MASSE · ≠ SCHEIBM · ≠ PFEILM · ≠ GLIED geo · ≠ PELLM.leder coincidence · ≠ TISCHM · ≠ LIFT — vm-gliedm only.
    var GLIEDM_GESETZ = { metal: 0x6e4a2c, metalR: 0.7, skin: 0x7a5436, skinR: 0.75 };
    var GLIEDM_VIS = { lab: "vm-gliedm", host: "none" };

    // V18.491.511 Lab Schmiede Waffen-Tisch Mats (body/top/rail); Host none (TISCHM_VIS).
    // ≠ GLIEDM · ≠ MASSE · ≠ TISCH/PLATTE/SCHIENE geo · ≠ PELLM · ≠ HALMM · ≠ LIFT — waffen-tischm only; do not Fake-merge.
    var TISCHM_GESETZ = { body: 0x4a3522, bodyR: 0.92, top: 0x5a4530, topR: 0.85, rail: 0x33251a, railR: 0.9 };
    var TISCHM_VIS = { lab: "waffen-tischm", host: "none" };

    // V18.491.512 Lab Schmiede Bambus-Halm Mats (culm/knot); Host none (HALMM_VIS).
    // ≠ TISCHM · ≠ GLIEDM · ≠ HALM geo · ≠ HALMH · ≠ STREUM.gras · ≠ SOCKELM · ≠ LIFT — bambus-halmm only.
    var HALMM_GESETZ = { culm: 0x86a544, culmR: 0.72, knot: 0x5f7e2c, knotR: 0.8 };
    var HALMM_VIS = { lab: "bambus-halmm", host: "none" };

    // V18.491.513 Lab Schmiede Bambus-Stand Mats (sockel/fassung + shared rough); Host none (SOCKELM_VIS).
    // ≠ HALMM · ≠ TISCHM · ≠ SOCKEL/FASSUNG geo · ≠ STREUM · ≠ WANDM · ≠ LIFT — bambus-sockelm only; one stand-wood family.
    var SOCKELM_GESETZ = { sockel: 0x3a2a1a, fassung: 0x2a2018, rough: 0.9 };
    var SOCKELM_VIS = { lab: "bambus-sockelm", host: "none" };

    // V18.491.514 Lab Schmiede Treffer-Wand Mats (wil/red/white/dark); Host none (WANDM_VIS).
    // ≠ SOCKELM (dark 0x3a2a18 ≠ sockel 0x3a2a1a) · ≠ HALMM · ≠ TISCHM · ≠ WAND.H · ≠ STREIF · ≠ LIFT — wand-wandm only.
    var WANDM_GESETZ = { wil: 0x9a8a4a, wilR: 0.85, red: 0xc23b2b, redR: 0.72, white: 0xe8e2d4, whiteR: 0.72, dark: 0x3a2a18, darkR: 0.9 };
    var WANDM_VIS = { lab: "wand-wandm", host: "none" };

    // V18.491.515 Lab Schmiede Clout Mast+Fahne Mats (pole/flag); Host none (CLOUTM_VIS).
    // ≠ WANDM · ≠ CLOUT (cols/step/poleH/hitR) · ≠ MAST/FAEHNE geo · ≠ PELLM.holz/SCHEIBM.leg 0x4a3520 coincidence · ≠ LIFT — clout-cloutm only; one pole+flag mat family.
    var CLOUTM_GESETZ = { pole: 0x4a3520, poleR: 0.9, flag: 0xd8c050, flagR: 0.7 };
    var CLOUTM_VIS = { lab: "clout-cloutm", host: "none" };

    // V18.491.516 Lab Schmiede Clout Ring Mat (rough/metal; colors ← CLOUT_COLS); Host none (RINGCM_VIS).
    // ≠ CLOUTM · ≠ RINGF (hof) · ≠ RING geo · ≠ CLOUT cols · ≠ SCHEIBM.ringR · ≠ REIF · ≠ LIFT — clout-ringcm only; ring mat quality only.
    var RINGCM_GESETZ = { rough: 0.7, metal: 0 };
    var RINGCM_VIS = { lab: "clout-ringcm", host: "none" };

    // V18.491.517 Lab Schmiede Harnisch-Dummy Mats (steel/dark/wood/tabard); Host none (HARNISCHM_VIS).
    // ≠ RINGCM · ≠ CLOUTM · ≠ HARNISCH logic · ≠ PELLM.holz 0x4a3520 coincidence · ≠ knight body mats · ≠ LIFT — harnisch-harnischm only; one armored-dummy mat family.
    var HARNISCHM_GESETZ = { steel: 0x9298a0, steelR: 0.40, steelM: 0.80, dark: 0x26262c, darkR: 0.6, darkM: 0.3, wood: 0x4a3520, woodR: 0.9, tabard: 0x6a2a28, tabardR: 0.6 };
    var HARNISCHM_VIS = { lab: "harnisch-harnischm", host: "none" };

    // V18.491.518 Lab Schmiede Feder-Pell Mats (wood/dark/iron/pad); Host none (FEDERM_VIS).
    // ≠ HARNISCHM · ≠ PELLM/NAHTM (straw pell) · ≠ FEDER logic · ≠ sequence pad · ≠ LIFT — feder-federm only; one spring-pell mat family.
    var FEDERM_GESETZ = { wood: 0x6b4f2f, woodR: 0.85, dark: 0x2a1d12, darkR: 0.9, iron: 0x3a3832, ironR: 0.4, pad: 0x8a5a3a, padR: 0.7 };
    var FEDERM_VIS = { lab: "feder-federm", host: "none" };

    // V18.491.519 Lab Schmiede Folge/Sequence Mats (wood/dark/pad); Host none (FOLGEM_VIS).
    // ≠ FEDERM (pad/dark coincidence ≠) · ≠ PELLM · ≠ HARNISCHM.wood 0x4a3520 coincidence · ≠ FOLGE/PAD geo · ≠ lit RGB runtime · ≠ LIFT — folge-folgem only; one sequence mat family.
    var FOLGEM_GESETZ = { wood: 0x4a3520, woodR: 0.9, dark: 0x2a1d12, darkR: 0.9, pad: 0x556070, padR: 0.55 };
    var FOLGEM_VIS = { lab: "folge-folgem", host: "none" };

    // V18.491.520 Lab Schmiede Ritter-Körper Mats (dark/wood/steel/gambeson); Host none (RITTERM_VIS).
    // ≠ FOLGEM · ≠ HARNISCHM (steel/dark/wood coincidence — armored-dummy ≠ knight) · ≠ RITTER logic · ≠ head/hood/sword/pip · ≠ LIFT — ritter-ritterm only; one knight-body mat family.
    var RITTERM_GESETZ = { dark: 0x26262c, darkR: 0.6, darkM: 0.3, wood: 0x4a3520, woodR: 0.9, steel: 0x9298a0, steelR: 0.40, steelM: 0.80, gambeson: 0x6a5840, gambesonR: 0.85 };
    var RITTERM_VIS = { lab: "ritter-ritterm", host: "none" };

    // V18.491.521 Lab Schmiede Ritter Kopf/Kapuze Mats (skin/hood); Host none (SCHAEDELM_VIS).
    // ≠ RITTERM · ≠ HARNISCHM · ≠ SCHAEDEL/KAPUZE geo · ≠ KOPF (pell) · ≠ sword/pip · ≠ LIFT — ritter-schaedelm only; one unarmored head mat family.
    var SCHAEDELM_GESETZ = { skin: 0x8a6a4a, skinR: 0.7, hood: 0x4a3e30, hoodR: 0.85 };
    var SCHAEDELM_VIS = { lab: "ritter-schaedelm", host: "none" };

    // V18.491.522 Lab Schmiede Ritter-Schwert Mats (parier/blade); Host none (SCHWERTM_VIS).
    // ≠ SCHAEDELM · ≠ RITTERM (grip wood stays) · ≠ HARNISCHM · ≠ SCHWERT/PARIER/KLINGE geo · ≠ pip · ≠ LIFT — ritter-schwertm only; one sword mat family.
    var SCHWERTM_GESETZ = { parier: 0x6a6258, parierR: 0.5, parierM: 0.4, blade: 0xb8c0c8, bladeR: 0.35, bladeM: 0.85 };
    var SCHWERTM_VIS = { lab: "ritter-schwertm", host: "none" };

    // V18.491.523 Lab Schmiede Ritter HP-Pip Mat (color/rough); Host none (PIPM_VIS).
    // ≠ SCHWERTM · ≠ RITTERM · ≠ SCHAEDELM · ≠ PIP/NAHE geo · ≠ RINGF/RINGCM · ≠ sequence lit · ≠ LIFT — ritter-pipm only; one pip mat law.
    var PIPM_GESETZ = { color: 0x40e060, rough: 0.6 };
    var PIPM_VIS = { lab: "ritter-pipm", host: "none" };

    // V18.491.524 Lab Schmiede Folge Lit/Dim RGB (updateSequence setRGB); Host none (LEUCHT_VIS).
    // ≠ PIPM · ≠ FOLGEM (pad mat) · ≠ FOLGE logic · ≠ RINGF/RINGCM · ≠ arena ring · ≠ LIFT — folge-leucht only; one lit/dim RGB family.
    var LEUCHT_GESETZ = { litR: 0.92, litG: 0.74, litB: 0.18, dimR: 0.33, dimG: 0.38, dimB: 0.44 };
    var LEUCHT_VIS = { lab: "folge-leucht", host: "none" };

    // V18.491.525 Lab Schmiede Ritter-Arena Ring Mats (arm/bare + rough); Host none (KREISM_VIS).
    // ≠ LEUCHT · ≠ FOLGEM · ≠ RINGF (hof) · ≠ RINGCM (clout) · ≠ RITTER ringIn/Out geo · ≠ banner cols · ≠ LIFT — ritter-kreism only; one arena-floor ring mat family.
    var KREISM_GESETZ = { arm: 0x5a4a38, bare: 0x4a5a40, rough: 0.9 };
    var KREISM_VIS = { lab: "ritter-kreism", host: "none" };

    // V18.491.526 Lab Schmiede Ritter-Arena Banner-Cols (arm/bare arrays + rough); Host none (TUCHM_VIS).
    // ≠ KREISM · ≠ TUCH geo · ≠ BANNER/FAHNE/FAEHNE · ≠ RINGF/RINGCM/CLOUTM · ≠ HARNISCHM.tabard 0x6a2a28 coincidence · ≠ post mats · ≠ LIFT — ritter-tuchm only; one banner-cloth col family.
    var TUCHM_GESETZ = { arm: [0x6a2a28, 0x2a3a5a, 0x3a5a2a, 0x5a4a1a], bare: [0x3a5040, 0x504a30, 0x405040, 0x4a4030], rough: 0.7 };
    var TUCHM_VIS = { lab: "ritter-tuchm", host: "none" };

    // V18.491.527 Lab Schmiede Ritter-Arena Pfahl Mat (color/rough); Host none (PFAHLM_VIS).
    // ≠ TUCHM · ≠ KREISM · ≠ PFAHL geo · ≠ CLOUTM/HARNISCHM wood coincidence sites · ≠ banner · ≠ LIFT — ritter-pfahlm only; one arena-post mat law.
    var PFAHLM_GESETZ = { color: 0x3a2c1c, rough: 0.9 };
    var PFAHLM_VIS = { lab: "ritter-pfahlm", host: "none" };

    // V18.491.528 Lab Schmiede Ritter-Arena Aufstellung (cfgA/cfgU: xz+tabard+crest); Host none (AUFSTELL_VIS).
    // ≠ PFAHLM · ≠ RITTERM · ≠ TUCHM (banner cols coincidence) · ≠ KREISM · ≠ RITTER hp/ring · ≠ charger · ≠ LIFT — ritter-aufstell only; one spawn-cfg family (pos+colors stay together).
    var AUFSTELL_GESETZ = {
      A: [[-2.4, -3.0, 0x6a2a28, 0xc0b020], [0, -3.6, 0x2a3a5a, 0xc8c8d0], [2.4, -3.0, 0x3a5a2a, 0xb05030]],
      U: [[-1.6, -3.2, 0x7a4030, 0x000000], [1.6, -3.2, 0x40607a, 0x000000]]
    };
    var AUFSTELL_VIS = { lab: "ritter-aufstell", host: "none" };

    // V18.491.529 Lab Schmiede Streitpuppe/Charger Mats (wood/dark/cloth/metal); Host none (STREITM_VIS).
    // ≠ AUFSTELL · ≠ RITTERM · ≠ TUCHM · ≠ PFAHLM · ≠ STREIT logic · ≠ FEDERM.dark coincidence · ≠ head/shield/flag · ≠ LIFT — streit-streitm only; one charger base-mat family.
    var STREITM_GESETZ = { wood: 0x5a4530, woodR: 0.9, dark: 0x2a1d12, darkR: 0.9, cloth: 0x6a5a4a, clothR: 0.7, metal: 0x4a4842, metalR: 0.4 };
    var STREITM_VIS = { lab: "streit-streitm", host: "none" };

    // V18.491.530 Lab Schmiede Streitpuppe Kopf-Mat (KNOLLE color/rough); Host none (KNOLLEM_VIS).
    // ≠ STREITM · ≠ AUFSTELL · ≠ TUCHM · ≠ CLOUTM · ≠ KNOLLE geo · ≠ SCHILD/ZIPFEL mats · ≠ LIFT — streit-knollem only; one charger-head mat law.
    var KNOLLEM_GESETZ = { color: 0x7a6a5a, rough: 0.6 };
    var KNOLLEM_VIS = { lab: "streit-knollem", host: "none" };

    // V18.491.531 Lab Schmiede Streitpuppe Schild-Mat (color/rough); Host none (SCHILDM_VIS).
    // ≠ KNOLLEM · ≠ STREITM · ≠ TUCHM · ≠ CLOUTM · ≠ SCHILD geo · ≠ TORII 0x8a3a28 coincidence · ≠ ZIPFEL flag · ≠ LIFT — streit-schildm only; one charger-shield mat law.
    var SCHILDM_GESETZ = { color: 0x8a3a28, rough: 0.6 };
    var SCHILDM_VIS = { lab: "streit-schildm", host: "none" };

    // V18.491.532 Lab Schmiede Streitpuppe Flag/Zipfel-Mat (color/rough); Host none (ZIPFELM_VIS).
    // ≠ SCHILDM · ≠ KNOLLEM · ≠ STREITM · ≠ TUCHM · ≠ CLOUTM · ≠ ZIPFEL geo · ≠ WIMPEL · ≠ LIFT — streit-zipfelm only; one charger-flag mat law.
    var ZIPFELM_GESETZ = { color: 0x6fcf73, rough: 0.6 };
    var ZIPFELM_VIS = { lab: "streit-zipfelm", host: "none" };

    // V18.491.290 Lab Schmiede weapon rack; Host none (RACK_VIS).
    // ≠ KIRMES_GESETZ.w0 (0.55 coincidence — carnival ω ≠ rack pitch) · ≠ DOJO · ≠ LIFT — weapon table spacing only; do not Fake-merge.
    var RACK_GESETZ = { pitch: 0.55, margin: 0.6 };
    var RACK_VIS = { lab: "weapon-rack", host: "none" };

    // V18.491.291 Lab Schmiede bamboo stand plinth; Host none (SOCKEL_VIS).
    // ≠ BAMBUS_GESETZ (culm N/gap/h) · ≠ GALGEN.H / KIRMES.amp (2.7 coincidence) · ≠ RACK · ≠ LIFT — bamboo stand plinth only; do not Fake-merge.
    var SOCKEL_GESETZ = { L: 2.7, H: 0.16, D: 0.45 };
    var SOCKEL_VIS = { lab: "bamboo-plinth", host: "none" };


    // Nächste Zone nach |yFrac − z.yFrac|; null wenn zonen fehlen / yFrac invalid.
    function zoneAt(yFrac) {
        var zs = ARENA && ARENA.zonen;
        if (!zs || !zs.length) return null;
        var y = Number(yFrac);
        if (!isFinite(y)) return null;
        if (y < 0) y = 0;
        else if (y > 1) y = 1;
        var best = zs[0];
        var bestD = Math.abs(y - (Number(best.yFrac) || 0));
        for (var i = 1; i < zs.length; i++) {
            var z = zs[i];
            var d = Math.abs(y - (Number(z.yFrac) || 0));
            if (d < bestD) {
                bestD = d;
                best = z;
            }
        }
        return best;
    }

    // Nächste Zone → dmgMul; fail-soft 1.0.
    // Host y-capsule (ZONE_PICK.host); Lab mesh-ray; Feel .117 no fake XZ limb.
    function zoneMulAt(yFrac) {
        var best = zoneAt(yFrac);
        if (!best) return 1.0;
        var m = Number(best.dmgMul);
        return isFinite(m) && m > 0 ? m : 1.0;
    }

    // Nächste Zone → kind-String; fail-soft "torso".
    // Host y-capsule (ZONE_PICK.host); Lab mesh-ray; Feel .117 no fake XZ limb.
    function zoneKindAt(yFrac) {
        var best = zoneAt(yFrac);
        if (!best || typeof best.kind !== "string" || !best.kind) return "torso";
        return best.kind;
    }

    // TREFFERZONEN .115 — juiceMul je kind (Feel); fail-soft 1.0 (kein kind / unbekannt).
    function zoneJuiceAt(kind) {
        var zs = ARENA && ARENA.zonen;
        if (!zs || !zs.length || typeof kind !== "string" || !kind) return 1.0;
        for (var i = 0; i < zs.length; i++) {
            if (zs[i].kind === kind) {
                var m = Number(zs[i].juiceMul);
                return isFinite(m) && m > 0 ? m : 1.0;
            }
        }
        return 1.0;
    }

    // V18.491.122 — mass→Wucht/Führigkeit (ARENA.handling); Lab wMass + Host juice.
    function handlingMul(masseKg) {
        var H = ARENA && ARENA.handling;
        var ref = H && isFinite(H.massRef) && H.massRef > 0 ? H.massRef : 1.4;
        var lo = H && isFinite(H.massMin) ? H.massMin : 0.42;
        var hi = H && isFinite(H.massMax) ? H.massMax : 2.30;
        var m = isFinite(masseKg) && masseKg > 0 ? masseKg : ref;
        var r = m / ref;
        if (r < lo) r = lo;
        if (r > hi) r = hi;
        return r;
    }

    // V18.491.123 — Lab _windF Ausholbedarf (I → drag → 0.3..1). Host windup × windF.
    function handlingWindF(traegheit) {
        var H = ARENA && ARENA.handling;
        var iMin = H && isFinite(H.iMin) ? H.iMin : 0.02;
        var iRef = H && isFinite(H.iRef) && H.iRef > 0 ? H.iRef : 0.16;
        var pw = H && isFinite(H.pow) ? H.pow : 0.45;
        var amp = H && isFinite(H.dragAmp) ? H.dragAmp : 0.45;
        var den = H && isFinite(H.denom) && H.denom > 0 ? H.denom : 0.5;
        var lo = H && isFinite(H.windMin) ? H.windMin : 0.3;
        var hi = H && isFinite(H.windMax) ? H.windMax : 1;
        var I = isFinite(traegheit) && traegheit > 0 ? traegheit : iMin;
        if (I < iMin) I = iMin;
        var drag = 1 + Math.pow(I / iRef, pw) * amp;
        var w = (drag - 1) / den;
        if (w < lo) w = lo;
        if (w > hi) w = hi;
        return w;
    }

    // ── GUETE (rein additiv, Spiegel-Zensus 17.07.) — DIE GEMESSENE WAFFEN-GUETE
    //    ALS KAMPF-FAKTOR: dieselbe P-Praeparation wie buildInstance (Gattung →
    //    Task×Werkstoff → snapBases → Tradition → ov-Regler, __-Schluessel sind
    //    STEUER-Passagiere), dann urteilt evalLehren gegen die Absichts-Baender;
    //    der bestandene Anteil (pass 1 · warn 0.5 · fail 0; na zaehlt nicht)
    //    mappt linear in [guete.faktorLeer, guete.faktorVoll]. Bogen → faktorVoll
    //    (seine Kraft reist schon als zugkraft×auszug in der EINEN Schuss-
    //    Physik). Der Wirt multipliziert den Faktor auf stats.damage — die
    //    geschmiedete FORM kaempft: eine Attrappe schlaegt matt. ──
    // EINHEITSBREI-SCHNITT (18.07.) — DIE EINE P-PRÄPARATION (reine Extraktion
    // aus gueteFaktor, byte-treu): Gattung → Task×Werkstoff → snapBases →
    // Tradition → ov-Regler (__-Schlüssel sind STEUER-Passagiere). gueteFaktor
    // UND kampfMasze lesen dieselbe Präparation — eine Wahrheit, zwei Urteile.
    function prepP(rezeptId, ov) {
        var name = REZEPT_ZU_GATTUNG[rezeptId];
        if (!name || !GATTUNGEN[name]) return null;
        var tp = Object.assign({ flat: 0.42, _kBase: 0 }, GATTUNGEN[name]);
        var trad =
            ov && typeof ov.__tradition === "string" && TRADITIONEN[ov.__tradition]
                ? TRADITIONEN[ov.__tradition]
                : currentTrad;
        if (tp.task) {
            tp.task = Object.assign({}, tp.task);
            tp.task.werkstoff = tradWerkstoff(trad);
            applyTask(tp);
            snapBases(tp);
        } else snapBases(tp);
        shapeByTradition(tp, trad);
        if (ov && typeof ov === "object") {
            for (var k in ov) {
                if (!Object.prototype.hasOwnProperty.call(ov, k)) continue;
                if (k.indexOf("__") === 0) continue;
                tp[k] = ov[k];
            }
        }
        return tp;
    }

    // EINHEITSBREI-SCHNITT (18.07.) — DIE KAMPF-MASSE JE GATTUNG: measure
    // (die Metrologie) urteilt über die PRÄPARIERTE Gattung; der Wirt fährt
    // Schwung-Dauer (∝ √Trägheit), Reichweite (Gesamtlänge) und Schadens-
    // Faktor (effektive Masse) aus DIESEN Zahlen — ein Dolch ist flink+kurz,
    // ein Grossschwert träge+lang. Bogen → null (die Schuss-Physik bleibt
    // ARENA.bogen). Unbekanntes Rezept → null (die Gattungs-Tafel ist die
    // Domänen-Wand — der Wirt fällt auf seinen Emergenz-Pfad für Eigenwerke).
    function kampfMasze(rezeptId, ov) {
        var tp = prepP(rezeptId, ov);
        if (!tp) return null;
        if (tp.modus === "bogen") return null;
        if (tp.modus === "wucht") tp.schaftR = griffD(intentControl(tp)) * 0.5;
        var m = measure(tp);
        if (!m || !m.S || !isFinite(m.M) || !(m.S.L > 0)) return null;
        var I = m.Inorm * m.M * m.S.L * m.S.L; // die rohe Trägheit um den Pivot (Inorm = I/(M·L²))
        return {
            laengeM: m.S.L,
            masseKg: m.M,
            traegheit: I,
            mEff: m.mEffFrac * m.M,
            pob: m.PoB,
        };
    }

    function gueteFaktor(rezeptId, ov) {
        var tp = prepP(rezeptId, ov);
        if (!tp) return ARENA.guete.faktorVoll;
        if (tp.modus === "bogen") return ARENA.guete.faktorVoll;
        if (tp.modus === "wucht") tp.schaftR = griffD(intentControl(tp)) * 0.5;
        var res = evalLehren(tp);
        var sum = 0;
        var n = 0;
        for (var i = 0; i < res.length; i++) {
            if (res[i].st === "na") continue;
            n++;
            if (res[i].st === "pass") sum += 1;
            else if (res[i].st === "warn") sum += 0.5;
        }
        var score = n > 0 ? sum / n : 1;
        var f = ARENA.guete.faktorLeer + (ARENA.guete.faktorVoll - ARENA.guete.faktorLeer) * score;
        return isFinite(f) && f > 0 ? f : ARENA.guete.faktorVoll;
    }

    root.__schmiedeCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        ARENA: ARENA,
        ZONE_PICK: ZONE_PICK,
        STUDIO_VIS: STUDIO_VIS,
        FOV_VIS: FOV_VIS,
        READY_VIS: READY_VIS,
        BOB_VIS: BOB_VIS,
        CAM_DECAY_VIS: CAM_DECAY_VIS,
        TRAIL_VIS: TRAIL_VIS,
        GRAVITY_VIS: GRAVITY_VIS,
        FLUG_VIS: FLUG_VIS,
        SCHUSS_DRAG_VIS: SCHUSS_DRAG_VIS,
        STUCK_VIS: STUCK_VIS,
        HOLD_SWAY_VIS: HOLD_SWAY_VIS,
        SCHUSS_VIS: SCHUSS_VIS,
        MUENDUNG_VIS: MUENDUNG_VIS,
        KICK_VIS: KICK_VIS,
        FREEZE_VIS: FREEZE_VIS,
        SHAKE_VIS: SHAKE_VIS,
        RECOIL_VIS: RECOIL_VIS,
        TARGET_VIS: TARGET_VIS,
        REBUILD_VIS: REBUILD_VIS,
        AIM_VIS: AIM_VIS,
        SEIL_GESETZ: SEIL_GESETZ,
        SEIL_VIS: SEIL_VIS,
        AUSFALL_GESETZ: AUSFALL_GESETZ,
        AUSFALL_VIS: AUSFALL_VIS,
        SCHNEIDE_GESETZ: SCHNEIDE_GESETZ,
        SCHNEIDE_VIS: SCHNEIDE_VIS,
        KETTE_GESETZ: KETTE_GESETZ,
        KETTE_VIS: KETTE_VIS,
        SCHEIBE_GESETZ: SCHEIBE_GESETZ,
        SCHEIBE_VIS: SCHEIBE_VIS,
        PFEIL_GESETZ: PFEIL_GESETZ,
        PFEIL_VIS: PFEIL_VIS,
        PENDEL_GESETZ: PENDEL_GESETZ,
        PENDEL_VIS: PENDEL_VIS,
        BANK_GESETZ: BANK_GESETZ,
        BANK_VIS: BANK_VIS,
        HEBE_GESETZ: HEBE_GESETZ,
        HEBE_VIS: HEBE_VIS,
        TORII_GESETZ: TORII_GESETZ,
        TORII_VIS: TORII_VIS,
        BALKEN_GESETZ: BALKEN_GESETZ,
        BALKEN_VIS: BALKEN_VIS,
        PFOSTEN_GESETZ: PFOSTEN_GESETZ,
        PFOSTEN_VIS: PFOSTEN_VIS,
        PERGOLA_GESETZ: PERGOLA_GESETZ,
        PERGOLA_VIS: PERGOLA_VIS,
        STUTZE_GESETZ: STUTZE_GESETZ,
        STUTZE_VIS: STUTZE_VIS,
        RAND_GESETZ: RAND_GESETZ,
        RAND_VIS: RAND_VIS,
        SPARREN_GESETZ: SPARREN_GESETZ,
        SPARREN_VIS: SPARREN_VIS,
        LEUCHTE_GESETZ: LEUCHTE_GESETZ,
        LEUCHTE_VIS: LEUCHTE_VIS,
        BAMBUS_GESETZ: BAMBUS_GESETZ,
        BAMBUS_VIS: BAMBUS_VIS,
        BANNER_GESETZ: BANNER_GESETZ,
        BANNER_VIS: BANNER_VIS,
        FAHNE_GESETZ: FAHNE_GESETZ,
        FAHNE_VIS: FAHNE_VIS,
        WAND_GESETZ: WAND_GESETZ,
        WAND_VIS: WAND_VIS,
        BAND_GESETZ: BAND_GESETZ,
        BAND_VIS: BAND_VIS,
        HULL_GESETZ: HULL_GESETZ,
        HULL_VIS: HULL_VIS,
        HOF_GESETZ: HOF_GESETZ,
        HOF_VIS: HOF_VIS,
        HALM_GESETZ: HALM_GESETZ,
        HALM_VIS: HALM_VIS,
        FASSUNG_GESETZ: FASSUNG_GESETZ,
        FASSUNG_VIS: FASSUNG_VIS,
        SCHWELLE_GESETZ: SCHWELLE_GESETZ,
        SCHWELLE_VIS: SCHWELLE_VIS,
        BUDE_GESETZ: BUDE_GESETZ,
        BUDE_VIS: BUDE_VIS,
        REIHE_GESETZ: REIHE_GESETZ,
        REIHE_VIS: REIHE_VIS,
        VOR_GESETZ: VOR_GESETZ,
        VOR_VIS: VOR_VIS,
        TREFF_GESETZ: TREFF_GESETZ,
        TREFF_VIS: TREFF_VIS,
        ENTE_GESETZ: ENTE_GESETZ,
        ENTE_VIS: ENTE_VIS,
        BOCK_GESETZ: BOCK_GESETZ,
        BOCK_VIS: BOCK_VIS,
        ROLLE_GESETZ: ROLLE_GESETZ,
        ROLLE_VIS: ROLLE_VIS,
        STRICK_GESETZ: STRICK_GESETZ,
        STRICK_VIS: STRICK_VIS,
        LEINE_GESETZ: LEINE_GESETZ,
        LEINE_VIS: LEINE_VIS,
        GESTELL_GESETZ: GESTELL_GESETZ,
        GESTELL_VIS: GESTELL_VIS,
        BLATT_GESETZ: BLATT_GESETZ,
        BLATT_VIS: BLATT_VIS,
        RUHE_GESETZ: RUHE_GESETZ,
        RUHE_VIS: RUHE_VIS,
        CLOUT_GESETZ: CLOUT_GESETZ,
        CLOUT_VIS: CLOUT_VIS,
        HEU_GESETZ: HEU_GESETZ,
        HEU_VIS: HEU_VIS,
        LATERNE_GESETZ: LATERNE_GESETZ,
        LATERNE_VIS: LATERNE_VIS,
        KOHLE_GESETZ: KOHLE_GESETZ,
        KOHLE_VIS: KOHLE_VIS,
        PFAD_GESETZ: PFAD_GESETZ,
        PFAD_VIS: PFAD_VIS,
        FEDER_GESETZ: FEDER_GESETZ,
        FEDER_VIS: FEDER_VIS,
        HARNISCH_GESETZ: HARNISCH_GESETZ,
        HARNISCH_VIS: HARNISCH_VIS,
        FOLGE_GESETZ: FOLGE_GESETZ,
        FOLGE_VIS: FOLGE_VIS,
        GASSE_GESETZ: GASSE_GESETZ,
        GASSE_VIS: GASSE_VIS,
        RITTER_GESETZ: RITTER_GESETZ,
        RITTER_VIS: RITTER_VIS,
        TON_GESETZ: TON_GESETZ,
        TON_VIS: TON_VIS,
        STREIT_GESETZ: STREIT_GESETZ,
        STREIT_VIS: STREIT_VIS,
        SCHAUKEL_GESETZ: SCHAUKEL_GESETZ,
        SCHAUKEL_VIS: SCHAUKEL_VIS,
        QUINT_GESETZ: QUINT_GESETZ,
        QUINT_VIS: QUINT_VIS,
        DREH_GESETZ: DREH_GESETZ,
        DREH_VIS: DREH_VIS,
        TATAMI_GESETZ: TATAMI_GESETZ,
        TATAMI_VIS: TATAMI_VIS,
        GALGEN_GESETZ: GALGEN_GESETZ,
        GALGEN_VIS: GALGEN_VIS,
        KIRMES_GESETZ: KIRMES_GESETZ,
        KIRMES_VIS: KIRMES_VIS,
        SCHNITT_GESETZ: SCHNITT_GESETZ,
        SCHNITT_VIS: SCHNITT_VIS,
        PAPAGEI_GESETZ: PAPAGEI_GESETZ,
        PAPAGEI_VIS: PAPAGEI_VIS,
        BAHN_GESETZ: BAHN_GESETZ,
        BAHN_VIS: BAHN_VIS,
        STECH_GESETZ: STECH_GESETZ,
        STECH_VIS: STECH_VIS,
        PELL_GESETZ: PELL_GESETZ,
        PELL_VIS: PELL_VIS,
        DOJO_GESETZ: DOJO_GESETZ,
        DOJO_VIS: DOJO_VIS,
        TRAEGER_GESETZ: TRAEGER_GESETZ,
        TRAEGER_VIS: TRAEGER_VIS,
        LATTE_GESETZ: LATTE_GESETZ,
        LATTE_VIS: LATTE_VIS,
        STEHER_GESETZ: STEHER_GESETZ,
        STEHER_VIS: STEHER_VIS,
        KNIE_GESETZ: KNIE_GESETZ,
        KNIE_VIS: KNIE_VIS,
        PAPIER_GESETZ: PAPIER_GESETZ,
        PAPIER_VIS: PAPIER_VIS,
        STREBE_GESETZ: STREBE_GESETZ,
        STREBE_VIS: STREBE_VIS,
        SAULE_GESETZ: SAULE_GESETZ,
        SAULE_VIS: SAULE_VIS,
        FUSS_GESETZ: FUSS_GESETZ,
        FUSS_VIS: FUSS_VIS,
        QUER_GESETZ: QUER_GESETZ,
        QUER_VIS: QUER_VIS,
        OESE_GESETZ: OESE_GESETZ,
        OESE_VIS: OESE_VIS,
        STRANG_GESETZ: STRANG_GESETZ,
        STRANG_VIS: STRANG_VIS,
        REIF_GESETZ: REIF_GESETZ,
        REIF_VIS: REIF_VIS,
        RUECK_GESETZ: RUECK_GESETZ,
        RUECK_VIS: RUECK_VIS,
        STIEL_GESETZ: STIEL_GESETZ,
        STIEL_VIS: STIEL_VIS,
        SIMS_GESETZ: SIMS_GESETZ,
        SIMS_VIS: SIMS_VIS,
        STAB_GESETZ: STAB_GESETZ,
        STAB_VIS: STAB_VIS,
        STREIF_GESETZ: STREIF_GESETZ,
        STREIF_VIS: STREIF_VIS,
        SPITZE_GESETZ: SPITZE_GESETZ,
        SPITZE_VIS: SPITZE_VIS,
        WIMPEL_GESETZ: WIMPEL_GESETZ,
        WIMPEL_VIS: WIMPEL_VIS,
        STAND_GESETZ: STAND_GESETZ,
        STAND_VIS: STAND_VIS,
        TISCH_GESETZ: TISCH_GESETZ,
        TISCH_VIS: TISCH_VIS,
        PLATTE_GESETZ: PLATTE_GESETZ,
        PLATTE_VIS: PLATTE_VIS,
        SCHIENE_GESETZ: SCHIENE_GESETZ,
        SCHIENE_VIS: SCHIENE_VIS,
        HALTUNG_GESETZ: HALTUNG_GESETZ,
        HALTUNG_VIS: HALTUNG_VIS,
        PAD_GESETZ: PAD_GESETZ,
        PAD_VIS: PAD_VIS,
        FAEHNE_GESETZ: FAEHNE_GESETZ,
        FAEHNE_VIS: FAEHNE_VIS,
        MAST_GESETZ: MAST_GESETZ,
        MAST_VIS: MAST_VIS,
        RING_GESETZ: RING_GESETZ,
        RING_VIS: RING_VIS,
        PODES_GESETZ: PODES_GESETZ,
        PODES_VIS: PODES_VIS,
        PFOST_GESETZ: PFOST_GESETZ,
        PFOST_VIS: PFOST_VIS,
        BEIN_GESETZ: BEIN_GESETZ,
        BEIN_VIS: BEIN_VIS,
        RUMPF_GESETZ: RUMPF_GESETZ,
        RUMPF_VIS: RUMPF_VIS,
        GRAT_GESETZ: GRAT_GESETZ,
        GRAT_VIS: GRAT_VIS,
        WAMS_GESETZ: WAMS_GESETZ,
        WAMS_VIS: WAMS_VIS,
        SCHULTER_GESETZ: SCHULTER_GESETZ,
        SCHULTER_VIS: SCHULTER_VIS,
        HALS_GESETZ: HALS_GESETZ,
        HALS_VIS: HALS_VIS,
        HELM_GESETZ: HELM_GESETZ,
        HELM_VIS: HELM_VIS,
        VISIER_GESETZ: VISIER_GESETZ,
        VISIER_VIS: VISIER_VIS,
        KAMM_GESETZ: KAMM_GESETZ,
        KAMM_VIS: KAMM_VIS,
        TELLER_GESETZ: TELLER_GESETZ,
        TELLER_VIS: TELLER_VIS,
        WENDEL_GESETZ: WENDEL_GESETZ,
        WENDEL_VIS: WENDEL_VIS,
        STANGE_GESETZ: STANGE_GESETZ,
        STANGE_VIS: STANGE_VIS,
        MUFFE_GESETZ: MUFFE_GESETZ,
        MUFFE_VIS: MUFFE_VIS,
        KOPF_GESETZ: KOPF_GESETZ,
        KOPF_VIS: KOPF_VIS,
        PFAHL_GESETZ: PFAHL_GESETZ,
        PFAHL_VIS: PFAHL_VIS,
        ZAPFEN_GESETZ: ZAPFEN_GESETZ,
        ZAPFEN_VIS: ZAPFEN_VIS,
        TUCH_GESETZ: TUCH_GESETZ,
        TUCH_VIS: TUCH_VIS,
        PLINT_GESETZ: PLINT_GESETZ,
        PLINT_VIS: PLINT_VIS,
        SCHENKEL_GESETZ: SCHENKEL_GESETZ,
        SCHENKEL_VIS: SCHENKEL_VIS,
        LEIB_GESETZ: LEIB_GESETZ,
        LEIB_VIS: LEIB_VIS,
        RIPPE_GESETZ: RIPPE_GESETZ,
        RIPPE_VIS: RIPPE_VIS,
        KOTTE_GESETZ: KOTTE_GESETZ,
        KOTTE_VIS: KOTTE_VIS,
        ACHSEL_GESETZ: ACHSEL_GESETZ,
        ACHSEL_VIS: ACHSEL_VIS,
        NACKEN_GESETZ: NACKEN_GESETZ,
        NACKEN_VIS: NACKEN_VIS,
        HAUBE_GESETZ: HAUBE_GESETZ,
        HAUBE_VIS: HAUBE_VIS,
        BLEND_GESETZ: BLEND_GESETZ,
        BLEND_VIS: BLEND_VIS,
        BUSCH_GESETZ: BUSCH_GESETZ,
        BUSCH_VIS: BUSCH_VIS,
        KAPUZE_GESETZ: KAPUZE_GESETZ,
        KAPUZE_VIS: KAPUZE_VIS,
        SCHAEDEL_GESETZ: SCHAEDEL_GESETZ,
        SCHAEDEL_VIS: SCHAEDEL_VIS,
        OBERARM_GESETZ: OBERARM_GESETZ,
        OBERARM_VIS: OBERARM_VIS,
        HEFT_GESETZ: HEFT_GESETZ,
        HEFT_VIS: HEFT_VIS,
        PARIER_GESETZ: PARIER_GESETZ,
        PARIER_VIS: PARIER_VIS,
        KLINGE_GESETZ: KLINGE_GESETZ,
        KLINGE_VIS: KLINGE_VIS,
        PIP_GESETZ: PIP_GESETZ,
        PIP_VIS: PIP_VIS,
        ARM_GESETZ: ARM_GESETZ,
        ARM_VIS: ARM_VIS,
        SCHWERT_GESETZ: SCHWERT_GESETZ,
        SCHWERT_VIS: SCHWERT_VIS,
        NAHE_GESETZ: NAHE_GESETZ,
        NAHE_VIS: NAHE_VIS,
        DORN_GESETZ: DORN_GESETZ,
        DORN_VIS: DORN_VIS,
        KREUZ_GESETZ: KREUZ_GESETZ,
        KREUZ_VIS: KREUZ_VIS,
        STUMMEL_GESETZ: STUMMEL_GESETZ,
        STUMMEL_VIS: STUMMEL_VIS,
        SCHLINGE_GESETZ: SCHLINGE_GESETZ,
        SCHLINGE_VIS: SCHLINGE_VIS,
        KEHLE_GESETZ: KEHLE_GESETZ,
        KEHLE_VIS: KEHLE_VIS,
        BIRNE_GESETZ: BIRNE_GESETZ,
        BIRNE_VIS: BIRNE_VIS,
        NAHT_GESETZ: NAHT_GESETZ,
        NAHT_VIS: NAHT_VIS,
        GURT_GESETZ: GURT_GESETZ,
        GURT_VIS: GURT_VIS,
        KEGEL_GESETZ: KEGEL_GESETZ,
        KEGEL_VIS: KEGEL_VIS,
        ANSATZ_GESETZ: ANSATZ_GESETZ,
        ANSATZ_VIS: ANSATZ_VIS,
        REICH_GESETZ: REICH_GESETZ,
        REICH_VIS: REICH_VIS,
        SPIEGEL_GESETZ: SPIEGEL_GESETZ,
        SPIEGEL_VIS: SPIEGEL_VIS,
        SCHLITT_GESETZ: SCHLITT_GESETZ,
        SCHLITT_VIS: SCHLITT_VIS,
        RAD_GESETZ: RAD_GESETZ,
        RAD_VIS: RAD_VIS,
        TONNE_GESETZ: TONNE_GESETZ,
        TONNE_VIS: TONNE_VIS,
        AUSLEG_GESETZ: AUSLEG_GESETZ,
        AUSLEG_VIS: AUSLEG_VIS,
        KNOLLE_GESETZ: KNOLLE_GESETZ,
        KNOLLE_VIS: KNOLLE_VIS,
        SCHILD_GESETZ: SCHILD_GESETZ,
        SCHILD_VIS: SCHILD_VIS,
        LANZE_GESETZ: LANZE_GESETZ,
        LANZE_VIS: LANZE_VIS,
        ZIPFEL_GESETZ: ZIPFEL_GESETZ,
        ZIPFEL_VIS: ZIPFEL_VIS,
        TAU_GESETZ: TAU_GESETZ,
        TAU_VIS: TAU_VIS,
        PFYL_GESETZ: PFYL_GESETZ,
        PFYL_VIS: PFYL_VIS,
        RIEGEL_GESETZ: RIEGEL_GESETZ,
        RIEGEL_VIS: RIEGEL_VIS,
        ANGEL_GESETZ: ANGEL_GESETZ,
        ANGEL_VIS: ANGEL_VIS,
        BLOCK_GESETZ: BLOCK_GESETZ,
        BLOCK_VIS: BLOCK_VIS,
        HEBEL_GESETZ: HEBEL_GESETZ,
        HEBEL_VIS: HEBEL_VIS,
        BECHER_GESETZ: BECHER_GESETZ,
        BECHER_VIS: BECHER_VIS,
        SCHEIB_GESETZ: SCHEIB_GESETZ,
        SCHEIB_VIS: SCHEIB_VIS,
        ZIELP_GESETZ: ZIELP_GESETZ,
        ZIELP_VIS: ZIELP_VIS,
        KNICK_GESETZ: KNICK_GESETZ,
        KNICK_VIS: KNICK_VIS,
        DREIB_GESETZ: DREIB_GESETZ,
        DREIB_VIS: DREIB_VIS,
        GLIED_GESETZ: GLIED_GESETZ,
        GLIED_VIS: GLIED_VIS,
        BAUM_GESETZ: BAUM_GESETZ,
        BAUM_VIS: BAUM_VIS,
        STUMPF_GESETZ: STUMPF_GESETZ,
        STUMPF_VIS: STUMPF_VIS,
        KAPPE_GESETZ: KAPPE_GESETZ,
        KAPPE_VIS: KAPPE_VIS,
        HOLM_GESETZ: HOLM_GESETZ,
        HOLM_VIS: HOLM_VIS,
        POLSTER_GESETZ: POLSTER_GESETZ,
        POLSTER_VIS: POLSTER_VIS,
        ZIER_GESETZ: ZIER_GESETZ,
        ZIER_VIS: ZIER_VIS,
        BODEN_GESETZ: BODEN_GESETZ,
        BODEN_VIS: BODEN_VIS,
        NABE_GESETZ: NABE_GESETZ,
        NABE_VIS: NABE_VIS,
        SPEICHE_GESETZ: SPEICHE_GESETZ,
        SPEICHE_VIS: SPEICHE_VIS,
        QUERB_GESETZ: QUERB_GESETZ,
        QUERB_VIS: QUERB_VIS,
        SCHIRM_GESETZ: SCHIRM_GESETZ,
        SCHIRM_VIS: SCHIRM_VIS,
        BUCKEL_GESETZ: BUCKEL_GESETZ,
        BUCKEL_VIS: BUCKEL_VIS,
        KREUZB_GESETZ: KREUZB_GESETZ,
        KREUZB_VIS: KREUZB_VIS,
        SACK_GESETZ: SACK_GESETZ,
        SACK_VIS: SACK_VIS,
        KUPPE_GESETZ: KUPPE_GESETZ,
        KUPPE_VIS: KUPPE_VIS,
        GELENK_GESETZ: GELENK_GESETZ,
        GELENK_VIS: GELENK_VIS,
        SPINN_GESETZ: SPINN_GESETZ,
        SPINN_VIS: SPINN_VIS,
        RUTE_GESETZ: RUTE_GESETZ,
        RUTE_VIS: RUTE_VIS,
        AST_GESETZ: AST_GESETZ,
        AST_VIS: AST_VIS,
        VOGEL_GESETZ: VOGEL_GESETZ,
        VOGEL_VIS: VOGEL_VIS,
        KUKEN_GESETZ: KUKEN_GESETZ,
        KUKEN_VIS: KUKEN_VIS,
        SCHNABEL_GESETZ: SCHNABEL_GESETZ,
        SCHNABEL_VIS: SCHNABEL_VIS,
        SCHWANZ_GESETZ: SCHWANZ_GESETZ,
        SCHWANZ_VIS: SCHWANZ_VIS,
        FLUEGEL_GESETZ: FLUEGEL_GESETZ,
        FLUEGEL_VIS: FLUEGEL_VIS,
        RAST_GESETZ: RAST_GESETZ,
        RAST_VIS: RAST_VIS,
        KIEL_GESETZ: KIEL_GESETZ,
        KIEL_VIS: KIEL_VIS,
        TORP_GESETZ: TORP_GESETZ,
        TORP_VIS: TORP_VIS,
        BARRE_GESETZ: BARRE_GESETZ,
        BARRE_VIS: BARRE_VIS,
        FADEN_GESETZ: FADEN_GESETZ,
        FADEN_VIS: FADEN_VIS,
        ROHR_GESETZ: ROHR_GESETZ,
        ROHR_VIS: ROHR_VIS,
        BODKIN_GESETZ: BODKIN_GESETZ,
        BODKIN_VIS: BODKIN_VIS,
        NOCK_GESETZ: NOCK_GESETZ,
        NOCK_VIS: NOCK_VIS,
        HAND_GESETZ: HAND_GESETZ,
        HAND_VIS: HAND_VIS,
        GRAS_GESETZ: GRAS_GESETZ,
        GRAS_VIS: GRAS_VIS,
        KIESEL_GESETZ: KIESEL_GESETZ,
        KIESEL_VIS: KIESEL_VIS,
        FLACH_GESETZ: FLACH_GESETZ,
        FLACH_VIS: FLACH_VIS,
        PUNKT_GESETZ: PUNKT_GESETZ,
        PUNKT_VIS: PUNKT_VIS,
        TUPF_GESETZ: TUPF_GESETZ,
        TUPF_VIS: TUPF_VIS,
        STREU_GESETZ: STREU_GESETZ,
        STREU_VIS: STREU_VIS,
        BUESCHEL_GESETZ: BUESCHEL_GESETZ,
        BUESCHEL_VIS: BUESCHEL_VIS,
        HALMH_GESETZ: HALMH_GESETZ,
        HALMH_VIS: HALMH_VIS,
        ZITTER_GESETZ: ZITTER_GESETZ,
        ZITTER_VIS: ZITTER_VIS,
        SCHLAUCH_GESETZ: SCHLAUCH_GESETZ,
        SCHLAUCH_VIS: SCHLAUCH_VIS,
        BUTT_GESETZ: BUTT_GESETZ,
        BUTT_VIS: BUTT_VIS,
        SCHEIBF_GESETZ: SCHEIBF_GESETZ,
        SCHEIBF_VIS: SCHEIBF_VIS,
        BUTTP_GESETZ: BUTTP_GESETZ,
        BUTTP_VIS: BUTTP_VIS,
        STAPEL_GESETZ: STAPEL_GESETZ,
        STAPEL_VIS: STAPEL_VIS,
        FACEX_GESETZ: FACEX_GESETZ,
        FACEX_VIS: FACEX_VIS,
        NARB_GESETZ: NARB_GESETZ,
        NARB_VIS: NARB_VIS,
        SCHRAMM_GESETZ: SCHRAMM_GESETZ,
        SCHRAMM_VIS: SCHRAMM_VIS,
        NARBZ_GESETZ: NARBZ_GESETZ,
        NARBZ_VIS: NARBZ_VIS,
        NARBC_GESETZ: NARBC_GESETZ,
        NARBC_VIS: NARBC_VIS,
        SPUR_GESETZ: SPUR_GESETZ,
        SPUR_VIS: SPUR_VIS,
        BENCH_GESETZ: BENCH_GESETZ,
        BENCH_VIS: BENCH_VIS,
        FELD_GESETZ: FELD_GESETZ,
        FELD_VIS: FELD_VIS,
        NETZ_GESETZ: NETZ_GESETZ,
        NETZ_VIS: NETZ_VIS,
        GITTER_GESETZ: GITTER_GESETZ,
        GITTER_VIS: GITTER_VIS,
        HUB_GESETZ: HUB_GESETZ,
        HUB_VIS: HUB_VIS,
        SCHLEIER_GESETZ: SCHLEIER_GESETZ,
        SCHLEIER_VIS: SCHLEIER_VIS,
        PATINA_GESETZ: PATINA_GESETZ,
        PATINA_VIS: PATINA_VIS,
        DUNST_GESETZ: DUNST_GESETZ,
        DUNST_VIS: DUNST_VIS,
        DUNSTA_GESETZ: DUNSTA_GESETZ,
        DUNSTA_VIS: DUNSTA_VIS,
        BLUETE_GESETZ: BLUETE_GESETZ,
        BLUETE_VIS: BLUETE_VIS,
        HEMI_GESETZ: HEMI_GESETZ,
        HEMI_VIS: HEMI_VIS,
        KEY_GESETZ: KEY_GESETZ,
        KEY_VIS: KEY_VIS,
        RIM_GESETZ: RIM_GESETZ,
        RIM_VIS: RIM_VIS,
        FILL_GESETZ: FILL_GESETZ,
        FILL_VIS: FILL_VIS,
        EDGE_GESETZ: EDGE_GESETZ,
        EDGE_VIS: EDGE_VIS,
        FRUSTUM_GESETZ: FRUSTUM_GESETZ,
        FRUSTUM_VIS: FRUSTUM_VIS,
        SCHATTEN_GESETZ: SCHATTEN_GESETZ,
        SCHATTEN_VIS: SCHATTEN_VIS,
        BLICK_GESETZ: BLICK_GESETZ,
        BLICK_VIS: BLICK_VIS,
        ORBIT_GESETZ: ORBIT_GESETZ,
        ORBIT_VIS: ORBIT_VIS,
        BELICHT_GESETZ: BELICHT_GESETZ,
        BELICHT_VIS: BELICHT_VIS,
        BANKM_GESETZ: BANKM_GESETZ,
        BANKM_VIS: BANKM_VIS,
        HINTER_GESETZ: HINTER_GESETZ,
        HINTER_VIS: HINTER_VIS,
        LEIN_GESETZ: LEIN_GESETZ,
        LEIN_VIS: LEIN_VIS,
        FENSTER_GESETZ: FENSTER_GESETZ,
        FENSTER_VIS: FENSTER_VIS,
        FUNKEN_GESETZ: FUNKEN_GESETZ,
        FUNKEN_VIS: FUNKEN_VIS,
        GRADE_GESETZ: GRADE_GESETZ,
        GRADE_VIS: GRADE_VIS,
        ERDE_GESETZ: ERDE_GESETZ,
        ERDE_VIS: ERDE_VIS,
        RAUSCH_GESETZ: RAUSCH_GESETZ,
        RAUSCH_VIS: RAUSCH_VIS,
        DISK_GESETZ: DISK_GESETZ,
        DISK_VIS: DISK_VIS,
        RINGF_GESETZ: RINGF_GESETZ,
        RINGF_VIS: RINGF_VIS,
        STREUM_GESETZ: STREUM_GESETZ,
        STREUM_VIS: STREUM_VIS,
        PELLM_GESETZ: PELLM_GESETZ,
        PELLM_VIS: PELLM_VIS,
        NAHTM_GESETZ: NAHTM_GESETZ,
        NAHTM_VIS: NAHTM_VIS,
        ETIK_GESETZ: ETIK_GESETZ,
        ETIK_VIS: ETIK_VIS,
        SCHIEB_GESETZ: SCHIEB_GESETZ,
        SCHIEB_VIS: SCHIEB_VIS,
        FORTE_GESETZ: FORTE_GESETZ,
        FORTE_VIS: FORTE_VIS,
        WIRBEL_GESETZ: WIRBEL_GESETZ,
        WIRBEL_VIS: WIRBEL_VIS,
        ACHSE_GESETZ: ACHSE_GESETZ,
        ACHSE_VIS: ACHSE_VIS,
        KONTUR_GESETZ: KONTUR_GESETZ,
        KONTUR_VIS: KONTUR_VIS,
        PFEILM_GESETZ: PFEILM_GESETZ,
        PFEILM_VIS: PFEILM_VIS,
        SCHEIBM_GESETZ: SCHEIBM_GESETZ,
        SCHEIBM_VIS: SCHEIBM_VIS,
        MASSE_GESETZ: MASSE_GESETZ,
        MASSE_VIS: MASSE_VIS,
        GLIEDM_GESETZ: GLIEDM_GESETZ,
        GLIEDM_VIS: GLIEDM_VIS,
        TISCHM_GESETZ: TISCHM_GESETZ,
        TISCHM_VIS: TISCHM_VIS,
        HALMM_GESETZ: HALMM_GESETZ,
        HALMM_VIS: HALMM_VIS,
        SOCKELM_GESETZ: SOCKELM_GESETZ,
        SOCKELM_VIS: SOCKELM_VIS,
        WANDM_GESETZ: WANDM_GESETZ,
        WANDM_VIS: WANDM_VIS,
        CLOUTM_GESETZ: CLOUTM_GESETZ,
        CLOUTM_VIS: CLOUTM_VIS,
        RINGCM_GESETZ: RINGCM_GESETZ,
        RINGCM_VIS: RINGCM_VIS,
        HARNISCHM_GESETZ: HARNISCHM_GESETZ,
        HARNISCHM_VIS: HARNISCHM_VIS,
        FEDERM_GESETZ: FEDERM_GESETZ,
        FEDERM_VIS: FEDERM_VIS,
        FOLGEM_GESETZ: FOLGEM_GESETZ,
        FOLGEM_VIS: FOLGEM_VIS,
        RITTERM_GESETZ: RITTERM_GESETZ,
        RITTERM_VIS: RITTERM_VIS,
        SCHAEDELM_GESETZ: SCHAEDELM_GESETZ,
        SCHAEDELM_VIS: SCHAEDELM_VIS,
        SCHWERTM_GESETZ: SCHWERTM_GESETZ,
        SCHWERTM_VIS: SCHWERTM_VIS,
        PIPM_GESETZ: PIPM_GESETZ,
        PIPM_VIS: PIPM_VIS,
        LEUCHT_GESETZ: LEUCHT_GESETZ,
        LEUCHT_VIS: LEUCHT_VIS,
        KREISM_GESETZ: KREISM_GESETZ,
        KREISM_VIS: KREISM_VIS,
        TUCHM_GESETZ: TUCHM_GESETZ,
        TUCHM_VIS: TUCHM_VIS,
        PFAHLM_GESETZ: PFAHLM_GESETZ,
        PFAHLM_VIS: PFAHLM_VIS,
        AUFSTELL_GESETZ: AUFSTELL_GESETZ,
        AUFSTELL_VIS: AUFSTELL_VIS,
        STREITM_GESETZ: STREITM_GESETZ,
        STREITM_VIS: STREITM_VIS,
        KNOLLEM_GESETZ: KNOLLEM_GESETZ,
        KNOLLEM_VIS: KNOLLEM_VIS,
        SCHILDM_GESETZ: SCHILDM_GESETZ,
        SCHILDM_VIS: SCHILDM_VIS,
        ZIPFELM_GESETZ: ZIPFELM_GESETZ,
        ZIPFELM_VIS: ZIPFELM_VIS,
        RACK_GESETZ: RACK_GESETZ,
        RACK_VIS: RACK_VIS,
        SOCKEL_GESETZ: SOCKEL_GESETZ,
        SOCKEL_VIS: SOCKEL_VIS,
        zoneMulAt: zoneMulAt,
        zoneKindAt: zoneKindAt,
        zoneJuiceAt: zoneJuiceAt,
        zoneAt: zoneAt,
        handlingMul: handlingMul,
        handlingWindF: handlingWindF,
        gueteFaktor: gueteFaktor,
        kampfMasze: kampfMasze,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { weapon: PARAMS },
        LEHREN: LEHREN_B5,
        buildInstance: buildInstance,
        // Mess- & Lehren-Fläche (Shell + Wirt lesen dieselben Gesetze).
        // VERTRAGS-AKT V18.489 (Zensus-Zeile "Tote Kern-Exporte", Lehre 3/11):
        // die zehn toten Mess-Exporte (LEHREN_LAB · MATof · hrc · matHaerte ·
        // matResilienz · greifkraft · pobZiel · ableitenPick/Graben/Klinge)
        // sind aus dem Namensraum gekuerzt — 0 Konsumenten repo-weit (die
        // Shell destrukturiert sie nicht, der Wirt las sie nie; gemessen
        // 17.07.). Die MASCHINEN bleiben intern lebendig (greifkraft/hrc/
        // MATof speisen messen/befund, ableiten* die P-Praeparation);
        // matHaerte/matResilienz/pobZiel waren ganz tot und fielen mit
        // (Def + Export in EINER Welle). buildInstance ist byte-unberuehrt
        // (Goldens gate:asset-contract gruen — kein Re-Mint noetig).
        // BOGENMAT + ableitenBogen LEBEN seit V18.488 im Wirt.
        BANDS: BANDS,
        bandFor: bandFor,
        measure: measure,
        messen: messen,
        evalLehren: evalLehren,
        befund: befund,
        stations: stations,
        sectionAt: sectionAt,
        sectionMoments: sectionMoments,
        halfH: halfH,
        klingenProfil: klingenProfil,
        curveY: curveY,
        bladeBeta: bladeBeta,
        headModel: headModel,
        RHO: RHO,
        ZIELMAT: ZIELMAT,
        WERKSTOFF: WERKSTOFF,
        BOGENMAT: BOGENMAT,
        MAT: MAT,
        hamonGesetz: hamonGesetz,
        edgeBeta: edgeBeta,
        kantenLast: kantenLast,
        griffD: griffD,
        intentControl: intentControl,
        betaFromMechanik: betaFromMechanik,
        ableitenKeil: ableitenKeil,
        ableitenBogen: ableitenBogen,
        applyTask: applyTask,
        tradWerkstoff: tradWerkstoff,
        // Gattungs-/Traditions-Fläche (die Shell-UI liest DIESE Daten)
        GATTUNGEN: GATTUNGEN,
        OAKESHOTT_TYPES: OAKESHOTT_TYPES,
        TRADITIONEN: TRADITIONEN,
        REZEPT_ZU_GATTUNG: REZEPT_ZU_GATTUNG,
        PARAMS_BLADE: PARAMS_BLADE,
        PARAMS_IMPACT: PARAMS_IMPACT,
        snapBases: snapBases,
        shapeByTradition: shapeByTradition,
        setTradition: setTradition,
        buildWeaponModel: function (name) {
            materials();
            return buildWeaponModel(name);
        },
        // Bau-Fläche (die Shell baut ihre Ebenen aus DIESER Quelle)
        materials: materials,
        loftBlade: loftBlade,
        buildGuard: buildGuard,
        buildGrip: buildGrip,
        buildPommel: buildPommel,
        buildHaft: buildHaft,
        buildHead: buildHead,
        buildBogen: buildBogen,
        forgeBit: forgeBit,
        bitField: bitField,
        leafFlange: leafFlange,
        grabeBlatt: grabeBlatt,
        chiselZ: chiselZ,
        spikeZ: spikeZ,
        latheX: latheX,
        latheZ: latheZ,
        accentMat: accentMat,
        wrapMat: wrapMat,
        woodColors: woodColors,
        holzHaut: holzHaut,
        stahlHaut: stahlHaut,
        pbrHaut: pbrHaut,
        hnoise: hnoise,
        box: box,
        cyl: cyl,
        B: B,
    };
})(typeof self !== "undefined" ? self : globalThis);
