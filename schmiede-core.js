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
    const matHaerte = (m) => 3 * m.sigY,
        matResilienz = (m) => (m.sigY * m.sigY) / (2 * m.E);
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
        gripOptD: 0.034,
        gripSpread: 0.024,
        handBreadth: 0.088,
        handLength: 0.185,
        wristNodeFrac: 0.224,
    };
    const greifkraft = (D) => Math.max(0, 1 - Math.pow((D - ANTHROPOS.gripOptD) / ANTHROPOS.gripSpread, 2));
    function griffD(control) {
        return ANTHROPOS.gripOptD - control * 0.01;
    }
    function intentControl(P) {
        return { schlag: 0.0, spalten: 0.05, hieb: 0.45, nutz: 0.5, stich: 0.9 }[P.intent] ?? 0.4;
    }
    function pobZiel(intent) {
        return { schlag: 0.66, spalten: 0.62, hieb: 0.4, nutz: 0.34, stich: 0.12 }[intent] ?? 0.4;
    }
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
        if (tp.task) {
            tp.task = Object.assign({}, tp.task);
            tp.task.werkstoff = tradWerkstoff(currentTrad);
            applyTask(tp);
            snapBases(tp);
        } else snapBases(tp);
        shapeByTradition(tp, currentTrad);
        if (ov && typeof ov === "object") {
            for (var k in ov) {
                if (!Object.prototype.hasOwnProperty.call(ov, k)) continue;
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
                g.add(buildGuard(tp, S, currentTrad));
                g.add(buildGrip(tp, S, currentTrad));
                g.add(buildPommel(tp, S, currentTrad));
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
    root.__schmiedeCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS: PARAMS,
        LEHREN: LEHREN_B5,
        buildInstance: buildInstance,
        // Mess- & Lehren-Fläche (Shell + Wirt lesen dieselben Gesetze)
        LEHREN_LAB: LEHREN,
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
        curveY: curveY,
        bladeBeta: bladeBeta,
        headModel: headModel,
        RHO: RHO,
        ZIELMAT: ZIELMAT,
        WERKSTOFF: WERKSTOFF,
        BOGENMAT: BOGENMAT,
        MAT: MAT,
        MATof: MATof,
        hrc: hrc,
        hamonGesetz: hamonGesetz,
        matHaerte: matHaerte,
        matResilienz: matResilienz,
        edgeBeta: edgeBeta,
        kantenLast: kantenLast,
        ANTHROPOS: ANTHROPOS,
        greifkraft: greifkraft,
        griffD: griffD,
        intentControl: intentControl,
        pobZiel: pobZiel,
        betaFromMechanik: betaFromMechanik,
        ableitenKeil: ableitenKeil,
        ableitenPick: ableitenPick,
        ableitenGraben: ableitenGraben,
        ableitenKlinge: ableitenKlinge,
        ableitenBogen: ableitenBogen,
        applyTask: applyTask,
        tradWerkstoff: tradWerkstoff,
        // Gattungs-/Traditions-Fläche (die Shell-UI liest DIESE Daten)
        GATTUNGEN: GATTUNGEN,
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
