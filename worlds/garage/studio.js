// AnazhRealm — worlds/garage/studio.js: DIE GARAGE AUF DER WELT-ENGINE (S1, W3; Vorbild worlds/gelaende/studio.js).
//
// `index.html?studio=garage` — oder das Garage-Tor der Welt (ein Tor, dessen Ziel ein Modus ist, öffnet kein iframe:
// `_buildPortalOverlay` ruft `__studioModi.garage.betreten`). Die Welt läuft wie immer; das Studio legt die Lehren-Tafel und
// die Steuerung über sie und führt die Kamera (Orbit um das Werk, `kameraFuehren`). Es erzeugt nichts selbst:
//   · DER WAGEN ist ein Werk der Welt: `spawnArchitecture("fahrzeug_<gattung>")`, die Regler als Prägung (studioOv) — derselbe
//     Bau des Foundry-Workers und dieselbe Stufenkette wie jeder Wagen der Welt, der Same wählt den Lack (vehicle-core
//     `lackIndex` über die Gestalt des Samens, `_foundryVariantFor`); ein Griff baut das Werk neu, das alte steht, bis das
//     neue gezeichnet ist. Das Werk bleibt in der Welt, wenn das Studio schließt, und trägt den ganzen Stand (Gattung im
//     Typ, Kultur und Regler in der Prägung, der Lack im Samen);
//   · die BÜHNE ist die Welt: ihr Renderer (r184), ihr Licht, ihr Boden, ihre Tonkurve — kein eigener Renderer, keine Szene;
//   · die LEHREN (Rahmen · Gelenke · Maßlinien · Baukörper · Negativraum) baut der Kern (vehicle-core) als Ebenen in der
//     Welt-Szene, an der Lage des Werks (`_archEntryWorldMatrix`);
//   · die PROBEFAHRT ist das Verb drive der Welt (`mountArchitecture`): ihr Fahr-Schritt (das Fahr-Gesetz liest die Prägung
//     des Werks), ihre Chase-Cam (`chaseKamera` des Kerns), ihr Gelände — das Studio zeigt nur den Tacho;
//   · Regler, Sitzung und Kosten-Leiste sind die Hülle (AnazhHuelle).
(function () {
    "use strict";
    let such;
    try {
        such = new URLSearchParams(location.search);
    } catch (_e) {
        return;
    }
    const SKRIPT = document.currentScript && document.currentScript.src;
    const V = (() => {
        try {
            return new URL(SKRIPT).searchParams.get("v") || "";
        } catch (_e) {
            return "";
        }
    })();
    const WERK = "garage"; // die Marke des Werks in seiner Prägung (`__werk`, ein Steuer-Passagier)
    const SAAT = 49178; // der Same des Wagens am Garage-Tor — der erste Same der Werke
    const VORSCHAU = "portal-preview-garage"; // der Wagen vor dem Garage-Tor — das Studio nimmt seinen Platz
    const ZUSTAND = { frame: false, joints: false, cal: true, pkg: false, wagen: true, neg: false };
    // Die EINE Sicht des gebauten Wagens: der Ergebnis-Knopf zeigt sie, die Probefahrt fährt in ihr (Befund 0710-2: die
    // Lehren lagen in der Fahrt über dem Wagen).
    const ERGEBNIS = { frame: false, joints: false, cal: false, pkg: false, wagen: true, neg: false };
    const LY = [
        ["frame", "Rahmen"],
        ["joints", "Gelenke"],
        ["cal", "Lehren"],
        ["pkg", "Baukörper"],
        ["wagen", "Wagen"],
        ["neg", "Negativ"],
    ];
    const st = {
        r: null,
        VC: null,
        M: null,
        aktiv: false,
        offen: null,
        modus: "werkstatt",
        P: null,
        presetId: "gt",
        kulturId: null,
        lack: 0,
        show: Object.assign({}, ZUSTAND),
        ergOn: false,
        werk: null,
        kommt: null,
        kommtT: 0,
        ort: null,
        ebenen: null,
        dom: null,
        kam: { az: Math.atan2(7.4, 6.2), el: 0.258, dist: 10, soll: null, t: 0, zug: null },
        hoerer: [],
    };

    // ── der Stand ⇄ das Werk ──
    function basis() {
        const VC = st.VC;
        return Object.assign(
            {},
            VC.DEFAULT_P,
            VC.presetPatch(st.presetId),
            st.kulturId ? VC.CULTURES[st.kulturId].fx : {}
        );
    }
    // DER LACK IST DER SAME (vehicle-core `lackIndex`) — so, wie die Welt ihn liest: der Same wählt die Gestalt seines Werks
    // (`_foundryVariantFor`, der Knuth-Eimer), die Gestalt den Lack. Der Same eines Lacks ist der erste ab SAAT, der ihn trägt.
    function lackVon(s) {
        const v = st.r._foundryVariantFor(s, st.presetId);
        if (!Number.isFinite(v))
            throw new Error(`das Buch nennt die Gestalten von ${st.presetId} nicht (_foundryVariantFor)`);
        return st.VC.lackIndex(v);
    }
    function saat() {
        for (let s = SAAT; s < SAAT + 256; s++) if (lackVon(s) === st.lack) return s;
        throw new Error(`kein Same ab ${SAAT} trägt den Lack ${st.lack}`);
    }
    // Die Prägung des Werks: was der Stand gegen die Gattung trägt (Kultur + Regler), die Marke und die Kultur als Passagiere.
    function praegung() {
        const VC = st.VC;
        const gattung = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(st.presetId));
        const ov = { __werk: WERK };
        if (st.kulturId) ov.__kultur = st.kulturId;
        for (const k in st.P) if (st.P[k] !== gattung[k]) ov[k] = st.P[k];
        return ov;
    }
    function standAusWerk(e) {
        const VC = st.VC;
        const pid = String(e.type).replace(/^fahrzeug_/, "");
        if (!VC.PRESETS[pid]) return false;
        const ov = e.studioOv || {};
        st.presetId = pid;
        st.kulturId = ov.__kultur && VC.CULTURES[ov.__kultur] ? ov.__kultur : null;
        st.lack = lackVon(Number.isFinite(e.seed) ? e.seed : SAAT);
        for (const k in st.P) delete st.P[k];
        Object.assign(st.P, VC.DEFAULT_P, VC.presetPatch(pid));
        for (const k in ov) if (k.slice(0, 2) !== "__") st.P[k] = ov[k];
        return true;
    }
    function istWerk(e) {
        return !!(e && e.studioOv && e.studioOv.__werk === WERK);
    }
    function gezeichnet(e) {
        return !!(e && (e.instanced || e.mesh));
    }

    // ── der Platz: das Werk, das schon steht; der Wagen vor dem Tor; sonst der nächste fahrbare Grund vor dem Blick ──
    function platzFinden() {
        const r = st.r;
        const s = r.state;
        const p = s.playerMesh.position;
        const nah = (e) => e && e.position && Math.hypot(e.position.x - p.x, e.position.z - p.z) < 90;
        const da = s.architectures.find((e) => istWerk(e) && nah(e));
        if (da) {
            standAusWerk(da);
            st.werk = da;
            return ortVon(da);
        }
        const vor = s.architectures.find((e) => e.id === VORSCHAU && nah(e));
        if (vor) {
            const o = ortVon(vor);
            r.removeArchitecture(vor);
            return o;
        }
        const blick = new THREE.Vector3();
        s.camera.getWorldDirection(blick);
        const n = Math.hypot(blick.x, blick.z) || 1;
        const x = p.x + (blick.x / n) * 8;
        const z = p.z + (blick.z / n) * 8;
        const probe = {
            type: "fahrzeug_" + st.presetId,
            position: { x, y: r.getTerrainHeightAt(x, z) + 0.5, z },
            rotationY: Math.atan2(blick.x, blick.z),
            scale: 1,
        };
        const weg = r._fahrPlatzWege(probe);
        let w = weg.next();
        while (!w.done) w = weg.next();
        if (!w.value) throw new Error("kein fahrbarer Grund im Radius des Platz-Gesetzes (FAHR.platz) vor dem Blick");
        return ortVon(probe);
    }
    function ortVon(e) {
        return {
            x: e.position.x,
            y: e.position.y,
            z: e.position.z,
            ry: Number.isFinite(e.rotationY) ? e.rotationY : 0,
        };
    }

    // ── das Werk bauen (derselbe Weg wie jeder Wagen der Welt) ──
    function werkSetzen() {
        const r = st.r;
        const typ = "fahrzeug_" + st.presetId;
        if (!r.state.blueprints[typ]) return bruch(`die Welt kennt den Bauplan ${typ} nicht (das Buch der Foundry)`);
        if (st.kommt) r.removeArchitecture(st.kommt); // ein noch nicht gezeichnetes Werk fällt sofort
        const o = st.ort;
        let absage = null;
        st.kommt = r.spawnArchitecture(
            typ,
            { x: o.x, y: o.y, z: o.z },
            { silent: true, seed: saat(), rotationY: o.ry, studioOv: praegung(), absage: (g) => (absage = g) }
        );
        st.kommtT = 0;
        if (!st.kommt) bruch(`die Welt stellt ${typ} nicht hin (${absage || "ohne Grund"})`);
    }
    function werkWeg() {
        const r = st.r;
        for (const e of [st.kommt, st.werk]) if (e) r.removeArchitecture(e);
        st.kommt = st.werk = null;
    }
    // je Bild: das kommende Werk löst das stehende ab, sobald es gezeichnet ist; die Ebenen stehen an der Lage des Werks
    function takt(t) {
        if (!st.aktiv) return;
        requestAnimationFrame(takt);
        const r = st.r;
        if (st.kommt) {
            if (gezeichnet(st.kommt)) {
                if (st.werk && st.werk !== st.kommt) r.removeArchitecture(st.werk);
                st.werk = st.kommt;
                st.kommt = null;
            } else if (t - st.kommtT > 250) {
                st.kommtT = t;
                r._rebuildArchitectureMesh(st.kommt);
            }
        }
        const e = st.werk;
        if (e && st.modus === "werkstatt") st.ort = ortVon(e);
        if (st.ebenen && st.ort) {
            if (e) r._archEntryWorldMatrix(e, st.ebenen.matrix);
            else
                st.ebenen.matrix.compose(
                    new THREE.Vector3(st.ort.x, st.ort.y - 0.5, st.ort.z),
                    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), st.ort.ry),
                    new THREE.Vector3(1, 1, 1)
                );
            st.ebenen.matrixWorldNeedsUpdate = true;
        }
        if (st.modus === "fahren" && e && e._fahr) {
            const sp = st.dom.querySelector("#garage-spd");
            if (sp) sp.textContent = String(Math.round(Math.abs(e._fahr.speed) * st.VC.FAHR.kmh)); // km/h aus der EINEN Kern-Zeile
        }
    }

    // ── die Ebenen der Lehren (Kern-Bau, Welt-Szene) ──
    function label(text, hex, scale) {
        scale = scale || 0.42;
        const fs = 46;
        const pad = 10;
        const cv = document.createElement("canvas");
        const cx = cv.getContext("2d");
        cx.font = `600 ${fs}px ui-monospace,Menlo,monospace`;
        cv.width = cx.measureText(text).width + pad * 2;
        cv.height = fs + pad * 2;
        cx.font = `600 ${fs}px ui-monospace,Menlo,monospace`;
        cx.fillStyle = "rgba(7,11,16,.78)";
        const rr = 11;
        cx.beginPath();
        cx.moveTo(rr, 0);
        cx.arcTo(cv.width, 0, cv.width, cv.height, rr);
        cx.arcTo(cv.width, cv.height, 0, cv.height, rr);
        cx.arcTo(0, cv.height, 0, 0, rr);
        cx.arcTo(0, 0, cv.width, 0, rr);
        cx.fill();
        cx.fillStyle = hex;
        cx.textBaseline = "middle";
        cx.fillText(text, pad, cv.height / 2 + 2);
        const t = new THREE.CanvasTexture(cv);
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
        sp.scale.set((cv.width / cv.height) * scale, scale, 1);
        sp.renderOrder = 999;
        sp.name = text;
        return sp;
    }
    // Gelenke — die Hardpoints mit Freiheitsgraden (vorn Lenkung + Sturz, alle Drehung + Federweg)
    function gelenke(H, P) {
        const VC = st.VC;
        const g = new THREE.Group();
        const dofM = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.5 });
        for (const k of ["HUB_FL", "HUB_FR", "HUB_RL", "HUB_RR"]) {
            const p = H[k];
            g.add(VC.dot(p, st.M.joint, 0.03));
            const rs = VC.ring(P.radR * 0.5, dofM);
            rs.position.set(p[0], p[1], p[2]);
            g.add(rs);
        }
        const l1 = label("DOF: Lenkung + Sturz + Drehung + Federweg", "#ffd27a", 0.34);
        l1.position.set(H.HUB_FR[0], P.radR + 0.55, H.HUB_FR[2] + 0.1);
        g.add(l1);
        const l2 = label("DOF: Drehung + Federweg", "#ffd27a", 0.34);
        l2.position.set(H.HUB_RR[0], P.radR + 0.5, H.HUB_RR[2] + 0.1);
        g.add(l2);
        return g;
    }
    // Maßlinien — die Lehren räumlich, die Farbe ist der Zustand der Lehre (PRUEF_GESETZ des Kerns)
    function messlinie(a, b, farbe, txt, quer) {
        const VC = st.VC;
        const m = new THREE.LineBasicMaterial({ color: farbe });
        const g = new THREE.Group();
        g.add(VC.seg(a, b, m));
        const t = quer || [0, 0.05, 0];
        g.add(VC.seg([a[0] - t[0], a[1] - t[1], a[2] - t[2]], [a[0] + t[0], a[1] + t[1], a[2] + t[2]], m));
        g.add(VC.seg([b[0] - t[0], b[1] - t[1], b[2] - t[2]], [b[0] + t[0], b[1] + t[1], b[2] + t[2]], m));
        const lb = label(txt, "#" + farbe.toString(16).padStart(6, "0"), 0.34);
        lb.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.1, (a[2] + b[2]) / 2);
        g.add(lb);
        return g;
    }
    function masslinien(H, P, res) {
        const PG = st.VC.PRUEF_GESETZ;
        const by = (id) => PG[res.find((x) => x.L.id === id).st];
        const g = new THREE.Group();
        const s = P.spur / 2 + 0.45;
        g.add(
            messlinie(
                [H.A_F[0], 0.02, s],
                [H.A_R[0], 0.02, s],
                by("rl"),
                "RADSTAND " + ((P.radstand * 1000) | 0),
                [0, 0.06, 0]
            )
        );
        g.add(
            messlinie(
                [H.A_F[0], P.guertel + 0.05, 0],
                [H.COWL[0], P.guertel + 0.05, 0],
                by("dta"),
                "DASH→ACHSE " + (((H.A_F[0] - H.COWL[0]) * 1000) | 0)
            )
        );
        g.add(
            messlinie(
                [H.A_F[0], 0.02, -s],
                [H.NOSE[0], 0.02, -s],
                by("ueb"),
                "ÜH-V " + ((P.ueberhangV * 1000) | 0),
                [0, 0.06, 0]
            )
        );
        g.add(
            messlinie(
                [H.A_R[0], 0.02, -s],
                [H.TAIL[0], 0.02, -s],
                by("ueb"),
                "ÜH-H " + ((P.ueberhangH * 1000) | 0),
                [0, 0.06, 0]
            )
        );
        g.add(
            messlinie(
                [H.A_F[0] - 0.35, 0, s],
                [H.A_F[0] - 0.35, P.fahrhoehe, s],
                by("bf"),
                "FREI " + ((P.fahrhoehe * 1000) | 0),
                [0.06, 0, 0]
            )
        );
        g.add(
            messlinie(
                [H.A_F[0], 0, P.spur / 2 + 0.18],
                [H.A_F[0], P.radR * 2, P.spur / 2 + 0.18],
                0x6fd0e8,
                "RAD-Ø " + ((P.radR * 2000) | 0),
                [0.06, 0, 0]
            )
        );
        return g;
    }
    // Negativraum — die Leere, die formt (Radhaus, Tumblehome, Unterschnitt)
    function negativ(H, P) {
        const VC = st.VC;
        const g = new THREE.Group();
        const bw = P.spur / 2 + 0.13;
        for (const k of ["HUB_FL", "HUB_FR", "HUB_RL", "HUB_RR"]) {
            const v = VC.cyl(P.radR * 1.15, P.radR * 1.15, 0.3, st.M.neg, 24);
            v.rotation.x = Math.PI / 2;
            v.position.set(H[k][0], P.radR, Math.sign(H[k][2]) * bw);
            g.add(v);
        }
        for (const sd of [-1, 1]) {
            const t = VC.box(H.HDR_F[0] - H.HDR_R[0], (P.dach - P.guertel) * 0.8, P.tumblehome + 0.02, st.M.neg);
            t.position.set(
                (H.HDR_F[0] + H.HDR_R[0]) / 2,
                (P.guertel + P.dach) / 2 + 0.03,
                sd * (bw - P.tumblehome * 0.5)
            );
            g.add(t);
        }
        const u = VC.box(P.radstand * 0.9, P.fahrhoehe * 0.9, bw * 1.6, st.M.neg);
        u.position.set(0, P.fahrhoehe * 0.45, 0);
        g.add(u);
        const lb = label("NEGATIVRAUM definiert mehr als Masse", "#ff8aa0", 0.36);
        lb.position.set(0, P.dach + 0.35, 0);
        g.add(lb);
        return g;
    }
    function ebenenWeg() {
        const g = st.ebenen;
        if (!g) return;
        if (g.parent) g.parent.remove(g);
        g.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.isSprite && o.material) {
                if (o.material.map) o.material.map.dispose();
                o.material.dispose();
            }
        });
        st.ebenen = null;
    }
    function ebenenBauen() {
        ebenenWeg();
        const VC = st.VC;
        const P = st.P;
        const H = VC.hardpoints(P);
        const res = VC.evalLehren(P);
        const ctx = { M: st.M, bodyMat: st.M.clay, doors: [], corners: [] };
        const g = new THREE.Group();
        g.name = "garage-ebenen";
        g.matrixAutoUpdate = false;
        const S = VC.scal(H, P);
        const pkg = VC.buildPackage(H, P, ctx);
        const frame = VC.buildFrame(H, P, ctx);
        VC.taperBody(pkg, S, P);
        VC.taperBody(frame, S, P);
        VC.bowEnds(pkg, S);
        const teile = { pkg, frame, joints: gelenke(H, P), cal: masslinien(H, P, res), neg: negativ(H, P) };
        for (const k in teile) {
            teile[k].name = "garage-" + k;
            teile[k].userData.ebene = k;
            g.add(teile[k]);
        }
        g.traverse((o) => {
            o.castShadow = false;
            o.receiveShadow = false;
        });
        st.r.state.scene.add(g);
        st.ebenen = g;
        ebenenSicht();
        tafel(res);
    }
    function sicht() {
        return st.modus === "fahren" ? ERGEBNIS : st.show;
    }
    function ebenenSicht() {
        const S = sicht();
        if (st.ebenen) for (const c of st.ebenen.children) c.visible = !!S[c.userData.ebene];
    }
    // die Sicht: die Ebenen, die Knöpfe — und das Werk (Wagen aus: es tritt ab, die Ebenen bleiben an seinem Ort)
    function sichtAnwenden() {
        ebenenSicht();
        const soll = !!sicht().wagen;
        if (soll && !st.werk && !st.kommt) werkSetzen();
        else if (!soll && (st.werk || st.kommt)) werkWeg();
        if (st.dom)
            LY.forEach(([k], i) =>
                st.dom.querySelector("#garage-layers").children[i].classList.toggle("on", !!st.show[k])
            );
    }

    // ── die Lehren-Tafel ──
    function pct(v, dom) {
        return Math.max(0, Math.min(100, ((v - dom[0]) / (dom[1] - dom[0])) * 100));
    }
    function tafel(res) {
        let html = "";
        let ok = 0;
        for (const { L, v, st: s } of res) {
            if (s === "pass") ok++;
            const p = pct(v, L.dom);
            const lo = pct(L.pass[0], L.dom);
            const hi = pct(L.pass[1], L.dom);
            html += `<div class="lr ${s}"><div class="lr-h"><span class="lr-lab">${L.lab}</span><span class="lr-val">${v.toFixed(3)}${L.unit}</span></div><div class="lr-bar"><div class="lr-band" style="left:${lo}%;width:${hi - lo}%"></div><div class="lr-mark" style="left:${p}%"></div></div><div class="lr-hint">${L.hint}</div></div>`;
        }
        st.dom.querySelector("#garage-lrlist").innerHTML = html;
        st.dom.querySelector("#garage-score").innerHTML = `<b>${ok}</b> / ${res.length} in Toleranz`;
    }

    // ── der Neubau: jeder Griff (Regler, Gattung, Kultur, Lack, Rückgängig) ──
    function neuBauen() {
        ebenenBauen();
        if (st.kosten) st.kosten.neu();
        if (sicht().wagen) werkSetzen();
    }
    function presetSetzen(pid) {
        st.presetId = pid;
        for (const k in st.P) delete st.P[k];
        Object.assign(st.P, basis());
        st.regler.sync();
        neuBauen();
    }
    function kulturSetzen(kid) {
        const VC = st.VC;
        const alt = st.kulturId ? VC.CULTURES[st.kulturId].fx : {};
        const gattung = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(st.presetId));
        for (const k in alt) {
            if (k in gattung) st.P[k] = gattung[k];
            else delete st.P[k];
        } // die alte Kultur fällt ganz, die Regler bleiben
        st.kulturId = kid;
        if (kid) Object.assign(st.P, VC.CULTURES[kid].fx);
        st.regler.sync();
        neuBauen();
    }

    // ── die Probefahrt: das Verb drive der Welt ──
    function fahrStart() {
        const r = st.r;
        if (st.modus === "fahren") return;
        if (!gezeichnet(st.werk)) return bruch("die Probefahrt wartet auf das Werk (es ist noch nicht gezeichnet)");
        st.modus = "fahren";
        sichtAnwenden();
        r.kameraFuehren(null); // die Kamera der Welt: Third hinter dem Wagen (`chaseKamera` des Kerns)
        const m = r.mountArchitecture(st.werk);
        if (!m || !m.ok) {
            st.modus = "werkstatt";
            r.kameraFuehren(fuehre);
            return bruch(`die Welt lässt nicht aufsteigen (${(m && m.reason) || "ohne Grund"})`);
        }
        if (r.state.cameraMode !== "third") r.setCameraMode("third");
        st.dom.classList.add("fahrt");
    }
    function fahrEnde() {
        const r = st.r;
        if (st.modus !== "fahren") return;
        r.dismountArchitecture();
        st.modus = "werkstatt";
        st.dom.classList.remove("fahrt");
        if (st.werk) st.ort = ortVon(st.werk);
        st.kam.soll = null;
        sichtAnwenden();
        r.kameraFuehren(fuehre);
    }

    // ── die Kamera der Werkstatt: ein Orbit um das Werk (Maus ziehen · Rad), über dem Boden der Welt ──
    function fuehre(camera, t) {
        const k = st.kam;
        const dt = k.t ? Math.min(0.1, Math.max(0, t - k.t)) : 0;
        k.t = t;
        const o = st.ort;
        if (!o) return;
        if (!k.soll) k.soll = { az: k.az, el: k.el, dist: k.dist };
        const f = dt ? 1 - Math.exp(-dt / 0.12) : 1;
        k.az += (k.soll.az - k.az) * f;
        k.el += (k.soll.el - k.el) * f;
        k.dist += (k.soll.dist - k.dist) * f;
        const a = k.az - o.ry; // der Orbit im Rahmen des Wagens (Bug +x), gedreht mit seiner Gier
        const ce = Math.cos(k.el);
        const zx = o.x;
        const zy = o.y - 0.5 + 0.55;
        const zz = o.z;
        const x = zx + Math.cos(a) * ce * k.dist;
        const z = zz + Math.sin(a) * ce * k.dist;
        const y = Math.max(zy + Math.sin(k.el) * k.dist, st.r.getTerrainHeightAt(x, z) + 0.4);
        camera.position.set(x, y, z);
        camera.lookAt(zx, zy, zz);
    }
    function aufCanvas(ev) {
        const c = st.r.state.renderer && st.r.state.renderer.domElement;
        return !!c && ev.target === c;
    }
    function hoeren(ziel, art, fn) {
        ziel.addEventListener(art, fn, true);
        st.hoerer.push([ziel, art, fn]);
    }
    function hoererAn() {
        // die Werkstatt hält Zeiger und Tasten, die ihr gehören — die Welt dahinter sieht sie nicht (kein Zeiger-Fang, kein Graben)
        const halt = (ev) => {
            if (st.modus === "werkstatt" && aufCanvas(ev)) {
                ev.stopImmediatePropagation();
                ev.preventDefault();
            }
        };
        hoeren(window, "click", halt);
        hoeren(window, "mousedown", halt);
        hoeren(window, "pointerdown", (ev) => {
            if (st.modus !== "werkstatt" || !aufCanvas(ev)) return;
            st.kam.zug = { x: ev.clientX, y: ev.clientY };
            ev.stopImmediatePropagation();
        });
        hoeren(window, "pointermove", (ev) => {
            const z = st.kam.zug;
            if (!z) return;
            const s = st.kam.soll || (st.kam.soll = { az: st.kam.az, el: st.kam.el, dist: st.kam.dist });
            s.az += (ev.clientX - z.x) * 0.006;
            s.el = Math.max(0.04, Math.min(1.35, s.el + (ev.clientY - z.y) * 0.006));
            z.x = ev.clientX;
            z.y = ev.clientY;
        });
        hoeren(window, "pointerup", () => (st.kam.zug = null));
        hoeren(window, "wheel", (ev) => {
            if (st.modus !== "werkstatt" || !aufCanvas(ev)) return;
            const s = st.kam.soll || (st.kam.soll = { az: st.kam.az, el: st.kam.el, dist: st.kam.dist });
            s.dist = Math.max(3.5, Math.min(16, s.dist * Math.exp(ev.deltaY * 0.001)));
            ev.preventDefault();
            ev.stopImmediatePropagation();
        });
        const GEHALTEN = /^(?:Key[WASDP]|Space|Arrow(?:Up|Down|Left|Right)|Digit[1-6]|Escape)$/;
        hoeren(window, "keydown", (ev) => {
            const t = ev.target;
            if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && t.type !== "range"))) return;
            if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
            if (st.modus === "fahren") {
                if (ev.code !== "Escape") return; // die Fahrt gehört der Welt (W/S Gas·Bremse, A/D Lenken, Leer Handbremse)
                ev.stopImmediatePropagation();
                ev.preventDefault();
                return fahrEnde();
            }
            if (!GEHALTEN.test(ev.code)) return;
            ev.stopImmediatePropagation();
            ev.preventDefault();
            if (ev.code === "Escape") return verlassen();
            const d = /^Digit([1-6])$/.exec(ev.code);
            if (d) st.dom.querySelector("#garage-layers").children[+d[1] - 1].click();
            if (ev.code === "KeyP") {
                const kn = [...st.dom.querySelectorAll("#garage-presets button")];
                const i = kn.findIndex((b) => b.classList.contains("on"));
                kn[(i + 1) % kn.length].click();
            }
        });
        hoeren(window, "keyup", (ev) => {
            if (st.modus === "werkstatt" && GEHALTEN.test(ev.code)) ev.stopImmediatePropagation();
        });
    }
    function hoererAus() {
        for (const [z, a, fn] of st.hoerer) z.removeEventListener(a, fn, true);
        st.hoerer.length = 0;
        st.kam.zug = null;
    }

    // ── das Panel ──
    const CSS = `
#garage-studio{--panel:rgba(9,14,20,.82);--ink:#cdd8e2;--mut:#6d7d8c;--hair:rgba(90,140,170,.16);--steel:#4f8fa6;
  --steel-bright:#6fd0e8;--pass:#4ec98a;--warn:#e8b54a;--fail:#e0664a;--mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
  --sans:system-ui,-apple-system,"Segoe UI",sans-serif;--h-akzent:var(--steel-bright);--h-tinte:var(--ink);--h-matt:var(--mut);
  --h-feld:var(--panel);--h-mono:var(--mono);font-family:var(--sans);color:var(--ink);font-size:11px}
#garage-studio *{box-sizing:border-box}
#garage-studio .tafel,#garage-studio .ctl,#garage-studio .leg{position:fixed;z-index:2147483100;background:var(--panel);
  border:1px solid var(--hair);border-radius:11px;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
#garage-studio .tafel{top:16px;left:18px;width:336px;max-height:calc(100vh - 150px);overflow-y:auto;padding:13px 13px 9px}
#garage-studio .ctl{top:16px;right:16px;width:294px;max-height:calc(100vh - 32px);overflow-y:auto;padding:12px}
#garage-studio .leg{bottom:14px;left:18px;font-family:var(--mono);font-size:10px;color:var(--mut);padding:8px 11px;line-height:1.9}
#garage-studio .leg .k{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:-1px}
#garage-studio .eb{font-family:var(--mono);font-size:10px;letter-spacing:.32em;color:var(--steel)}
#garage-studio h1{font-size:14px;font-weight:600;letter-spacing:.04em;margin:3px 0 9px}
#garage-studio h1 b{color:var(--steel-bright);font-weight:600}
#garage-studio .tafel-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px}
#garage-studio .tafel-h .t{font-family:var(--mono);font-size:10px;letter-spacing:.26em;color:var(--steel)}
#garage-studio .score b{color:var(--pass)}
#garage-studio .lr{padding:8px 0;border-top:1px solid var(--hair)}
#garage-studio .lr:first-of-type{border-top:none}
#garage-studio .lr-h{display:flex;justify-content:space-between;align-items:baseline}
#garage-studio .lr-lab{font-size:12px;font-weight:500}
#garage-studio .lr-val{font-family:var(--mono);font-size:12px}
#garage-studio .lr-bar{position:relative;height:6px;margin:6px 0 5px;border-radius:3px;background:rgba(120,150,175,.10);overflow:hidden}
#garage-studio .lr-band{position:absolute;top:0;bottom:0;border-radius:3px;background:rgba(78,201,138,.22);box-shadow:inset 0 0 0 1px rgba(78,201,138,.30)}
#garage-studio .lr-mark{position:absolute;top:-2px;width:2px;height:10px;border-radius:1px;transform:translateX(-1px)}
#garage-studio .lr-hint{font-size:10px;line-height:1.5;color:var(--mut)}
#garage-studio .lr.pass .lr-val{color:var(--pass)} #garage-studio .lr.pass .lr-mark{background:var(--pass)}
#garage-studio .lr.warn .lr-val{color:var(--warn)} #garage-studio .lr.warn .lr-mark{background:var(--warn)}
#garage-studio .lr.fail .lr-val{color:var(--fail)} #garage-studio .lr.fail .lr-mark{background:var(--fail)}
#garage-studio .sec-t{font-family:var(--mono);font-size:9px;letter-spacing:.24em;color:var(--steel);margin:11px 2px 6px}
#garage-studio .row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}
#garage-studio .btn{flex:1;min-width:62px;font:11px var(--sans);color:var(--ink);background:rgba(80,130,160,.10);
  border:1px solid var(--hair);border-radius:7px;padding:7px 4px;cursor:pointer;text-align:center}
#garage-studio .btn:hover{background:rgba(80,130,160,.20)}
#garage-studio .btn.on{background:rgba(111,208,232,.16);border-color:rgba(111,208,232,.42);color:var(--steel-bright)}
#garage-studio .btn.start{flex:1 1 100%;font-size:12px;font-weight:600;color:#cdeefa;padding:10px 4px;
  background:linear-gradient(180deg,rgba(111,208,232,.20),rgba(111,208,232,.09));border-color:rgba(111,208,232,.46)}
#garage-studio .sw{width:21px;height:21px;border-radius:50%;border:2px solid rgba(120,150,175,.32);cursor:pointer;padding:0;flex:none}
#garage-studio .sw.on{box-shadow:0 0 0 2px var(--steel-bright)}
#garage-hud{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483100;display:none;align-items:baseline;gap:22px;
  font-family:var(--mono);background:rgba(10,16,22,.74);border:1px solid var(--hair);border-radius:12px;padding:10px 20px;backdrop-filter:blur(8px)}
#garage-hud #garage-spd{font-size:30px;font-weight:600;color:var(--steel-bright)}
#garage-hud .u{font-size:12px;color:var(--mut)}
#garage-hud .keys{font-size:11px;color:var(--mut)}
#garage-hud .keys b{color:var(--steel-bright);font-weight:600}
#garage-studio.fahrt .tafel,#garage-studio.fahrt .ctl,#garage-studio.fahrt .leg{display:none}
#garage-studio.fahrt #garage-hud{display:flex}
`;
    const HTML = `
<div class="tafel">
  <div class="eb">ANATOMISCHE METHODE · KAROSSERIE</div>
  <h1><b>Rahmen</b> · Gelenke · <b>Lehren</b> · Baukörper · Wagen</h1>
  <div class="tafel-h"><span class="t">DIE LEHREN · PROPORTIONS-PRÜFUNG</span><span class="score" id="garage-score"></span></div>
  <div id="garage-lrlist"></div>
</div>
<div class="ctl" id="garage-ctl">
  <div id="garage-sitzung"></div>
  <div class="sec-t">GATTUNGS-PRESETS</div>
  <div class="row" id="garage-presets"></div>
  <div class="sec-t">KULTUR</div>
  <div class="row" id="garage-kulturen"></div>
  <div class="sec-t">FAHREN</div>
  <div class="row"><button class="btn start" id="garage-start">▶ Motor starten · Probefahrt in der Welt</button></div>
  <div class="sec-t">EBENEN</div>
  <div class="row" id="garage-layers"></div>
  <div class="sec-t">ANSICHT · LACK</div>
  <div class="row"><button class="btn" id="garage-ergebnis">Ergebnis</button></div>
  <div class="row" id="garage-lack" style="gap:5px;margin:3px 0"></div>
  <div id="garage-sliders"></div>
  <div id="garage-kosten"></div>
</div>
<div class="leg">
  <span class="k" style="background:#6fd0e8"></span>Rahmen — Hardpoints &amp; Glieder<br>
  <span class="k" style="background:#ffb24a"></span>Gelenke — Freiheitsgrade<br>
  <span class="k" style="background:#4ec98a"></span>Lehren — Maßlinien (Soll erfüllt)<br>
  <span class="k" style="background:#3a536a"></span>Baukörper — Akku · Motoren · Zelle · Sitze<br>
  <span class="k" style="background:#8d9499"></span>Wagen — das Werk der Welt (Foundry, Welt-Licht)<br>
  <span class="k" style="background:#ff5a7a"></span>Negativraum — die Leere, die formt<br>
  MAUS ziehen · RAD · 1–6 Ebenen · P Gattung · Esc zurück in die Welt
</div>
<div id="garage-hud"><span><span id="garage-spd">0</span> <span class="u">km/h</span></span><span class="keys"><b>W</b>/<b>S</b> Gas·Bremse&nbsp;&nbsp;<b>A</b>/<b>D</b> Lenken&nbsp;&nbsp;<b>Leer</b> Handbremse&nbsp;&nbsp;<b>Esc</b> Werkstatt</span></div>
`;
    function knopf(ziel, text, fn) {
        const b = document.createElement("button");
        b.className = "btn";
        b.textContent = text;
        b.addEventListener("click", fn);
        ziel.appendChild(b);
        return b;
    }
    function panelBauen() {
        const VC = st.VC;
        if (!document.getElementById("garage-studio-css")) {
            const h = document.createElement("link");
            h.rel = "stylesheet";
            h.href = new URL("../huelle/huelle.css" + (V ? "?v=" + V : ""), SKRIPT).href;
            document.head.appendChild(h);
            const s = document.createElement("style");
            s.id = "garage-studio-css";
            s.textContent = CSS;
            document.head.appendChild(s);
        }
        const d = document.createElement("section");
        d.id = "garage-studio";
        d.setAttribute("aria-label", "Garage — Anatomie · Fahrzeug");
        d.innerHTML = HTML;
        document.body.appendChild(d);
        st.dom = d;
        const $ = (s) => d.querySelector(s);
        const pdiv = $("#garage-presets");
        const cdiv = $("#garage-kulturen");
        const markiert = () => [...pdiv.children].some((c) => c.classList.contains("on"));
        st.sitz = AnazhHuelle.sitzung({
            werte: st.P,
            zustand: () => ({ presetId: st.presetId, kulturId: st.kulturId, lack: st.lack, markiert: markiert() }),
            zustandSetzen: (z) => {
                st.presetId = z.presetId;
                st.kulturId = z.kulturId;
                st.lack = z.lack;
                malen(z.markiert);
            },
            anwenden: () => neuBauen(),
        });
        st.sitz.leiste($("#garage-sitzung"), { seed: false });
        const ids = Object.keys(VC.PRESETS).filter((id) => VC.PRESETS[id].kind === "vehicle");
        for (const pid of ids)
            knopf(pdiv, VC.PRESETS[pid].lab, () => {
                st.sitz.schritt(() => presetSetzen(pid));
                malen(true);
            }).dataset.id = pid;
        for (const cid in VC.CULTURES)
            knopf(cdiv, VC.CULTURES[cid].lab, () => {
                const ab = st.kulturId === cid; // der zweite Klick auf die gewählte Kultur wählt sie ab
                st.sitz.schritt(() => kulturSetzen(ab ? null : cid));
                malen(markiert());
            }).dataset.id = cid;
        $("#garage-start").addEventListener("click", fahrStart);
        const ldiv = $("#garage-layers");
        for (const [k, lab] of LY)
            knopf(ldiv, lab, () => {
                st.show[k] = !st.show[k];
                sichtAnwenden();
            });
        $("#garage-ergebnis").addEventListener("click", () => {
            st.ergOn = !st.ergOn;
            Object.assign(st.show, st.ergOn ? ERGEBNIS : ZUSTAND);
            $("#garage-ergebnis").classList.toggle("on", st.ergOn);
            sichtAnwenden();
        });
        // der Lack ist der Same des Werks (lackIndex): jedes Farbfeld der Welt — Clay bleibt der Kern-Stoff der Ebenen
        const ldv = $("#garage-lack");
        VC.LACK_GESETZ.forEach((pt, li) => {
            if (pt[2]) return;
            const sw = document.createElement("button");
            sw.className = "sw";
            sw.title = pt[0];
            sw.dataset.lack = String(li);
            sw.style.background = "#" + pt[1].toString(16).padStart(6, "0");
            sw.addEventListener("click", () => {
                st.sitz.schritt(() => {
                    st.lack = li;
                    neuBauen();
                });
                malen(markiert());
            });
            ldv.appendChild(sw);
        });
        // Regler — die Hülle (K41): der EINE Generator aus PARAMS_BY_KIND.vehicle schreibt P; das Werk baut neu, wenn der Zug ruht
        st.regler = AnazhHuelle.regler($("#garage-sliders"), VC.PARAMS_BY_KIND.vehicle, {
            werte: st.P,
            ruheMs: 140,
            sitzung: st.sitz,
            basis: () => basis(),
            bei: (id, v, pp) => {
                if (!pp.dyn) [...pdiv.children].forEach((c) => c.classList.remove("on"));
            },
            nachRuhe: () => neuBauen(),
        });
        // die Kosten-Leiste: die Gestalt des Werks (buildInstance des Kerns, derselbe Bau wie der Foundry-Worker) je Stufe
        st.kosten = AnazhHuelle.kosten($("#garage-kosten"), {
            budget: VC.PORTAL_RENDER_CONFIG.lod.budget.vehicle,
            stufen: VC.PORTAL_RENDER_CONFIG.lod.kindStages.vehicle,
            bauen: (s) => VC.buildInstance(st.presetId, st.r._foundryVariantFor(saat(), st.presetId), s, st.P),
            quelle: "gemessen an der Gestalt des Werks (vehicle-core buildInstance, Same und Prägung des Werks); Befehle nach dem Budget-Gesetz ≤ Zeile",
        });
        malen(true);
    }
    function malen(markiert) {
        const d = st.dom;
        for (const b of d.querySelectorAll("#garage-presets button"))
            b.classList.toggle("on", !!markiert && b.dataset.id === st.presetId);
        for (const b of d.querySelectorAll("#garage-kulturen button"))
            b.classList.toggle("on", b.dataset.id === st.kulturId);
        for (const b of d.querySelectorAll("#garage-lack .sw")) b.classList.toggle("on", +b.dataset.lack === st.lack);
    }

    // ── betreten · verlassen ──
    async function betreten() {
        if (st.aktiv || st.offen) return st.offen;
        st.offen = (async () => {
            const r = window.anazhRealm;
            const VC = window.__vehicleCore;
            if (!r || !VC || typeof r.kameraFuehren !== "function")
                throw new Error("die Welt-Engine steht nicht (anazhRealm, __vehicleCore)");
            while (!r.state._weltbildDa) await new Promise((res) => setTimeout(res, 120));
            const buch = await r._foundryAwaitBook(20000);
            if (!buch || !buch.ok) throw new Error("das Buch der Foundry kommt nicht (die Wagen der Welt)");
            st.r = r;
            st.VC = VC;
            st.M = VC.materials();
            st.P = Object.assign({}, VC.DEFAULT_P, VC.presetPatch("gt"));
            st.lack = lackVon(SAAT);
            st.ort = platzFinden();
            st.modus = "werkstatt";
            st.aktiv = true;
            panelBauen();
            st.regler.sync();
            ebenenBauen();
            st.kosten.neu();
            if (!st.werk) werkSetzen();
            sichtAnwenden();
            hoererAn();
            if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
            st.kam.soll = null;
            st.kam.t = 0;
            r.kameraFuehren(fuehre);
            requestAnimationFrame(takt);
            r.log("Garage: die Werkstatt steht in der Welt (Esc — zurück)", "INFO");
        })()
            .catch((e) => bruch(e))
            .finally(() => (st.offen = null));
        return st.offen;
    }
    function verlassen() {
        if (!st.aktiv) return;
        fahrEnde();
        st.aktiv = false;
        hoererAus();
        ebenenWeg();
        if (st.kommt) st.r.removeArchitecture(st.kommt); // das Werk, das steht, bleibt in der Welt
        st.kommt = null;
        st.werk = null;
        st.r.kameraFuehren(null);
        if (st.dom) st.dom.remove();
        st.dom = null;
        if (such.get("studio") === WERK) history.replaceState(null, "", location.pathname + location.hash);
        st.r.log("Garage verlassen — das Werk steht in der Welt", "INFO");
    }
    // Die Wörter der Garage (DSL der Registry): Gattungen und Kulturen über die echten Knöpfe, probefahrt · werkstatt.
    function wort(w) {
        if (!st.aktiv) return false;
        if (w === "probefahrt") return (fahrStart(), true);
        if (w === "werkstatt") return (fahrEnde(), true);
        return AnazhHuelle.knopfMitText(st.dom.querySelector("#garage-ctl"), w);
    }
    // EIN BRUCH IST LAUT: beim Namen ins Log der Welt und in die Konsole.
    function bruch(e) {
        const grund = String((e && e.message) || e);
        console.error(`[Garage] ${grund}`);
        if (st.r && typeof st.r.log === "function") st.r.log(`Garage: ${grund}`, "ERROR");
        else if (window.anazhRealm && typeof window.anazhRealm.log === "function")
            window.anazhRealm.log(`Garage: ${grund}`, "ERROR");
    }

    // DIE PROBE (gate:garage-labor) und das Tor der Welt lesen das Studio hier.
    window.__studioModi = window.__studioModi || {};
    window.__studioModi[WERK] = Object.freeze({
        betreten,
        verlassen,
        wort,
        zustand: () => ({
            aktiv: st.aktiv,
            modus: st.modus,
            presetId: st.presetId,
            kulturId: st.kulturId,
            lack: st.lack,
            P: st.P ? Object.assign({}, st.P) : null,
            werk: st.werk ? st.werk.id : null,
            kommt: st.kommt ? st.kommt.id : null,
            show: Object.assign({}, st.show),
        }),
        werk: () => st.werk,
        ebenen: () => st.ebenen,
    });
    if (such.get("studio") !== WERK) return;
    const los = () => (window.anazhRealm ? betreten() : setTimeout(los, 120));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los);
    else los();
})();
