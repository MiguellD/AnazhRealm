// AnazhRealm — worlds/fachwerk/studio.js: DAS FACHWERK-STUDIO AUF DER WELT-ENGINE (S1-b; Vorbild worlds/garage/studio.js).
//
// `index.html?studio=fachwerk` — oder das Fachwerk-Tor der Welt (ein Tor, dessen Ziel ein Modus ist, öffnet kein iframe:
// `_buildPortalOverlay` ruft `__studioModi.fachwerk.betreten`). Die Welt läuft wie immer; das Studio legt seine Steuerung über
// sie und führt die Kamera (Orbit um das Werk, `kameraFuehren`). Es erzeugt nichts selbst:
//   · DAS HAUS ist ein Werk der Welt: `spawnArchitecture("haus_<kultur>")` (die Ausstattung: Feuerstelle · Marktstand ·
//     Brunnen über ihre Baupläne), die Regler als Prägung (studioOv) — derselbe Bau des Foundry-Workers und dieselbe
//     Stufenkette wie jedes Haus der Welt; ein Griff baut das Werk neu, das alte steht, bis das neue gezeichnet ist. Das Werk
//     nimmt den Platz des Hauses vor dem Tor (die Vorschau) und bleibt in der Welt, wenn das Studio schließt;
//   · DAS DORF ist der Siedlungs-Akt der Welt: `spawnSettlement` am Welt-Ort des Labors (gelaende-core `hangOrt` der Lage — der
//     Hang, auf dem es seit K10 plante), derselbe Plan v2 (fachwerk `ortPlan`), dieselben Häuser, Wege, Laternen und die
//     Stadtmauer, die jede Siedlung der Welt trägt (`_stlMauerBauen`); ein neuer Regler-Stand baut das Dorf neu
//     (`siedlungAbbauen` nimmt das alte ganz, Erdbau und Gedächtnis eingeschlossen). Der Spieler steht vor dem Dorf, nie in ihm
//     (derselbe Radius, an dem der Anker urteilt: `_siedlungsMass`), und kehrt beim Verlassen ans Tor zurück;
//   · die BÜHNE ist die Welt: ihr Renderer (r184), ihr Licht, ihr Boden, ihre Uhr und ihre Tonkurve — kein eigener Renderer,
//     keine Szene, kein Dorf-Boden;
//   · Regler, Sitzung und Kosten-Leiste sind die Hülle (AnazhHuelle); die Meta-Regler (Jahr · Klima · Personen · Wohlstand)
//     schreiben die Form über das Gesetz des Kerns (`metaParams`).
// Was das Labor bis S1-b trug und hier fällt (benannt): die eigene Szene mit Herdfeuer und Tageszeit (die Uhr ist das Wort der
// Welt: „setze uhrzeit abend"), der Gelände-Schalter (der Boden ist immer die Welt), die LOD-Sonde (die Kosten-Leiste zeigt
// jede Stufe, die Welt wechselt sie selbst), Explosions-Sicht, Schnitt und Subsystem-Schalter (das Werk der Welt ist gebacken,
// es trägt keine Teile), der Begeh-Modus (die Welt ist begehbar), der Labor-Selbsttest (die Wände prüfen die Welt) und das
// Panorama (ein Modus braucht kein Ziel-Bild).
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
    const WERK = "fachwerk"; // die Marke des Werks in seiner Prägung (`__werk`, ein Steuer-Passagier)
    const SAAT = 49177; // der Same des Hauses vor dem Fachwerk-Tor (`_ensurePortalPreview`)
    const VORSCHAU = "portal-preview-fachwerk"; // das Haus vor dem Fachwerk-Tor — das Studio nimmt seinen Platz
    // Die Ausstattung: der Bauplan der Welt je Gesetz der AUSSTATTUNG (fachwerk-core), null = das Haus der gewählten Kultur
    const AUSSTATTUNG = {
        haus: null,
        feuerstelle: "glutbrunnen",
        marktstand: "marktstand_dorf",
        brunnen: "brunnen_dorf",
    };
    // Die Wahlen des Hauses (Daten-Passagiere des Kerns, `hausParams`: brace · grundriss · stil · dachTyp · bogenTyp)
    const WAHLEN = [
        [
            "brace",
            "Fachwerk-Figur",
            [
                ["andreas", "Andreaskreuz"],
                ["k", "K-Strebe"],
                ["mann", "Mann"],
                ["wild", "Wilder Mann"],
                ["none", "—"],
            ],
        ],
        [
            "grundriss",
            "Grundriss",
            [
                ["I", "I · Rechteck"],
                ["L", "L · Kreuzflügel"],
                ["U", "U · Flügel + Anbau"],
                ["T", "T · Flügel + Anbau"],
                ["kreuz", "Kreuz"],
                ["hof", "Hof"],
            ],
        ],
        [
            "stil",
            "Stil",
            [
                ["alt", "Fachwerk"],
                ["modern", "Modern · Putz"],
                ["huette", "Blockholz"],
                ["stein", "Putz / Stein"],
                ["glas", "Glasfassade"],
                ["stroh", "Reet / Stroh"],
            ],
        ],
        [
            "dachTyp",
            "Dachtyp",
            [
                ["sattel", "Sattel"],
                ["mansard", "Mansarde"],
                ["pyramide", "Pyramide"],
                ["kegel", "Kegel"],
                ["pult", "Pult"],
                ["tonne", "Tonne"],
                ["schmetterling", "Schmetterling"],
                ["zwiebel", "Zwiebel"],
            ],
        ],
        [
            "bogenTyp",
            "Bogen",
            [
                ["none", "—"],
                ["rund", "Rundbogen"],
                ["spitz", "Spitzbogen"],
                ["hufeisen", "Hufeisen"],
            ],
        ],
    ];
    // Die Wege des Studios in den Kern: die Meta-Achsen (`metaParams`) und das Dorf (der Siedlungs-Akt klemmt nH auf 4–120)
    const BED_META = [
        { id: "jahr", lab: "Jahr", min: 1000, max: 2025, step: 5, def: 1500, law: "metaParams: Epoche, Neigung, Stil" },
        { id: "klima", lab: "Klima", min: 0, max: 100, step: 1, def: 50, law: "kalt steil · heiß flach (metaParams)" },
        {
            id: "leute",
            lab: "Personen",
            min: 1,
            max: 20,
            step: 1,
            def: 5,
            law: "Grundfläche und Geschosse (metaParams)",
        },
        { id: "wohl", lab: "Wohlstand", min: 0, max: 100, step: 1, def: 40, law: "Zier und Ausstattung (metaParams)" },
    ];
    const BED_DORF = [
        {
            id: "nH",
            lab: "Häuser",
            min: 4,
            max: 120,
            step: 1,
            def: 18,
            law: "die Größe des Plans — der Akt der Welt klemmt 4–120",
        },
        {
            id: "budget",
            lab: "Prim-Budget",
            min: 100000,
            max: 400000,
            step: 10000,
            def: 170000,
            law: "das Budget des Plans (DORF_NORM)",
        },
    ];
    const st = {
        r: null,
        FC: null,
        aktiv: false,
        offen: null,
        modus: "haus",
        aus: "haus",
        kultur: "fraenkisch",
        P: null,
        werk: null,
        kommt: null,
        hausOrt: null,
        dorfOrt: null,
        dorf: null,
        baut: null,
        nochmal: false,
        epoche: "",
        heim: null,
        ziel: null,
        dom: null,
        bruch: null,
        kam: { az: 0.85, el: 0.3, dist: 30, soll: null, t: 0, zug: null },
        hoerer: [],
    };

    // ── der Stand ⇄ das Werk ──
    const typ = () => (AUSSTATTUNG[st.aus] ? AUSSTATTUNG[st.aus] : "haus_" + st.kultur);
    const rezept = () => (AUSSTATTUNG[st.aus] ? st.aus : st.kultur);
    const zeilen = () => st.FC.PARAMS_BY_KIND[AUSSTATTUNG[st.aus] ? "ausstattung" : "haus"];
    // die Basis des Werks: die Zeilen-Vorgaben, das Rezept (s + die Wahlen und Farben aus fx) — derselbe Merge wie `hausParams`
    function basis() {
        const pre = st.FC.PRESETS[rezept()] || {};
        const b = {};
        for (const z of zeilen()) b[z.id] = z.def;
        Object.assign(b, pre.s || {});
        if (!AUSSTATTUNG[st.aus]) for (const [k] of WAHLEN) if (pre.fx && pre.fx[k] != null) b[k] = pre.fx[k];
        if (!AUSSTATTUNG[st.aus] && pre.fx && pre.fx.col) b.col = Object.assign({}, pre.fx.col);
        return b;
    }
    const werkSchluessel = () =>
        zeilen()
            .map((z) => z.id)
            .concat(AUSSTATTUNG[st.aus] ? [] : WAHLEN.map((w) => w[0]).concat("col"));
    function standSetzen() {
        const b = basis();
        for (const k of werkSchluessel()) delete st.P[k];
        Object.assign(st.P, b);
    }
    // Die Prägung des Werks: was der Stand gegen sein Rezept trägt, die Marke als Passagier (der Same reist im Eintrag)
    function praegung() {
        const b = basis();
        const ov = { __werk: WERK };
        for (const k of werkSchluessel())
            if (st.P[k] !== undefined && JSON.stringify(st.P[k]) !== JSON.stringify(b[k])) ov[k] = st.P[k];
        return ov;
    }
    const saat = () => (st.sitz ? st.sitz.seed : SAAT);
    function istWerk(e) {
        return !!(e && e.studioOv && e.studioOv.__werk === WERK);
    }
    function gezeichnet(e) {
        return !!(e && (e.instanced || e.mesh));
    }
    function ortVon(e) {
        return {
            x: e.position.x,
            y: e.position.y,
            z: e.position.z,
            ry: Number.isFinite(e.rotationY) ? e.rotationY : 0,
        };
    }

    // ── der Platz des Hauses: das Werk, das schon steht; das Haus vor dem Tor; sonst 14 m vor dem Blick ──
    function hausPlatz() {
        const r = st.r;
        const s = r.state;
        const p = s.playerMesh.position;
        const nah = (e) => e && e.position && Math.hypot(e.position.x - p.x, e.position.z - p.z) < 90;
        const da = s.architectures.find((e) => istWerk(e) && nah(e));
        if (da) {
            st.werk = da;
            const m = /^haus_(.+)$/.exec(da.type);
            if (m && st.FC.PRESETS[m[1]]) st.kultur = m[1];
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
        const x = p.x + (blick.x / n) * 14;
        const z = p.z + (blick.z / n) * 14;
        return { x, y: r.getTerrainHeightAt(x, z) + 0.5, z, ry: Math.atan2(blick.x, blick.z) + Math.PI };
    }
    // ── der Ort des Dorfs: der Hang der Lage, auf dem das Labor seit K10 plante (gelaende-core `hangOrt`) ──
    function dorfPlatz() {
        const GK = window.__gelaendeCore;
        const L = st.r._gelaende();
        const h = GK.hangOrt(L, (x, z) => GK.hoehe(L, x, z, true) > L.waterLevel + 3);
        if (!h) throw new Error("kein Hang auf der Lage der Welt (gelaende-core hangOrt)");
        return { x: Math.round(h.x), z: Math.round(h.z) };
    }

    // ── das Werk bauen (derselbe Weg wie jedes Haus der Welt) ──
    function werkSetzen() {
        const r = st.r;
        const t = typ();
        if (!r.state.blueprints[t]) return bruch(`die Welt kennt den Bauplan ${t} nicht (das Buch der Foundry)`);
        if (st.kommt) r.removeArchitecture(st.kommt); // ein noch nicht gezeichnetes Werk fällt sofort
        const o = st.hausOrt;
        let absage = null;
        st.kommt = r.spawnArchitecture(
            t,
            { x: o.x, y: o.y, z: o.z },
            { silent: true, seed: saat(), rotationY: o.ry, studioOv: praegung(), absage: (g) => (absage = g) }
        );
        if (st.kommt)
            st.kommt._werkstatt = true; // die Vorschau der Werkstatt: ein Unikat je Regler-Stand, nie auf der Platte
        else bruch(`die Welt stellt ${t} nicht hin (${absage || "ohne Grund"})`);
    }
    function neuBauen() {
        if (!st.aktiv) return;
        if (st.modus === "dorf") return dorfBauen();
        werkSetzen();
        if (st.kosten) st.kosten.neu();
    }
    // je Bild: das kommende Werk löst das stehende ab, sobald es gezeichnet ist (den Bau dockt der Takt der Welt an)
    function takt() {
        if (!st.aktiv) return;
        requestAnimationFrame(takt);
        if (st.kommt && gezeichnet(st.kommt)) {
            if (st.werk && st.werk !== st.kommt) st.r.removeArchitecture(st.werk);
            st.werk = st.kommt;
            st.kommt = null;
        }
    }

    // ── das Dorf: der Siedlungs-Akt der Welt am Welt-Ort; ein neuer Stand ersetzt das alte Dorf ganz ──
    const dorfDp = () => ({ seed: saat(), nH: st.P.nH, budget: st.P.budget, epoche: st.epoche || undefined });
    function dorfBauen() {
        if (st.baut) {
            st.nochmal = true;
            return st.baut;
        }
        st.baut = (async () => {
            const r = st.r;
            do {
                st.nochmal = false;
                const dp = dorfDp();
                const plan = await r._foundryRequestSettlement(dp);
                if (!plan) throw new Error("die Welt plant kein Dorf (export-settlement leer)");
                if (st.dorf) r.siedlungAbbauen(st.dorf);
                st.dorf = null;
                const o = st.dorfOrt;
                const m = r._siedlungsMass(plan);
                // der Spieler vor dem Dorf, nie in ihm: auf der Achse der Kamera, eine Armlänge über dem Radius des Ankers
                const d = m.R + r.constructor.STRUCTURE_PLAYER_CLEAR_MARGIN + 6;
                const sx = o.x + m.cx + Math.cos(st.kam.az) * d;
                const sz = o.z + m.cz + Math.sin(st.kam.az) * d;
                const pm = r.state.playerMesh;
                pm.position.set(sx, r.getTerrainHeightAt(sx, sz) + 1, sz);
                pm.visible = false;
                const res = await r.spawnSettlement(Object.assign({}, dp, { position: { x: o.x, z: o.z } }));
                if (!res || !(res.placed > 0))
                    throw new Error(
                        `die Welt stellt am Ort ${o.x}/${o.z} kein Dorf (${res ? res.skipped + " Slots übersprungen" : "kein Plan"})`
                    );
                st.dorf = res;
                if (!st.nochmal) dorfRahmen();
            } while (st.nochmal && st.aktiv);
        })()
            .catch((e) => bruch(e))
            .finally(() => (st.baut = null));
        return st.baut;
    }
    // DIE POSE DES DORFS (3/4 von Südost, wie das Labor rahmte): die Mitte der Häuser, der Abstand aus ihrem Rand
    function dorfRahmen() {
        const hs = (st.dorf && st.dorf.haeuser) || [];
        if (!hs.length) return;
        const mx = hs.reduce((s, e) => s + e.position.x, 0) / hs.length;
        const mz = hs.reduce((s, e) => s + e.position.z, 0) / hs.length;
        const R = Math.max(12, ...hs.map((e) => Math.hypot(e.position.x - mx, e.position.z - mz)));
        st.ziel = { x: mx, y: st.r.getTerrainHeightAt(mx, mz) + 6, z: mz };
        st.kam.soll = { az: 0.62, el: 0.48, dist: Math.min(260, R * 2 + 12) };
    }
    function hausRahmen() {
        const o = st.hausOrt;
        const P = st.P;
        st.ziel = { x: o.x, y: o.y + 3.5, z: o.z };
        const gross = AUSSTATTUNG[st.aus] ? 3 : Math.max(P.W || 8, P.D || 8);
        st.kam.soll = { az: o.ry + 0.85, el: 0.3, dist: gross * 1.7 + 7 };
    }

    // ── die Modi ──
    function modusSetzen(m) {
        if (m !== "haus" && m !== "dorf") return;
        const wechsel = st.modus !== m;
        st.modus = m;
        const pm = st.r.state.playerMesh;
        if (m === "haus" && wechsel && st.heim) {
            pm.position.set(st.heim.x, st.heim.y, st.heim.z);
            pm.visible = true;
        }
        if (st.dom) {
            st.dom.classList.toggle("dorf", m === "dorf");
            for (const b of st.dom.querySelectorAll("#fachwerk-modi .btn")) b.classList.toggle("on", b.dataset.m === m);
        }
        if (m === "dorf") {
            if (wechsel || !st.dorf) dorfBauen();
            else dorfRahmen();
        } else {
            hausRahmen();
            if (!st.werk && !st.kommt) werkSetzen();
        }
    }
    function kulturSetzen(k) {
        if (!st.FC.PRESETS[k] || st.FC.PRESETS[k].kind !== "haus") return false;
        st.kultur = k;
        st.aus = "haus";
        standSetzen();
        malen();
        if (st.regler) st.regler.sync();
        if (st.modus !== "haus") modusSetzen("haus");
        else neuBauen();
        return true;
    }
    function ausSetzen(a) {
        if (!(a in AUSSTATTUNG)) return;
        st.aus = a;
        standSetzen();
        reglerBauen();
        malen();
        hausRahmen();
        neuBauen();
    }
    // die Meta-Achsen schreiben die Form über das Gesetz des Kerns (metaParams) — ein Rückgängig-Schritt mit dem Zug
    function metaAnwenden() {
        if (AUSSTATTUNG[st.aus]) return;
        const P = st.P;
        const m = st.FC.metaParams(P.jahr, P.klima / 100, P.leute, P.wohl / 100);
        const F = m.F || {};
        Object.assign(P, {
            pitchDeg: m.pitch,
            W: m.W,
            D: m.D,
            storeys: m.storeys,
            stil: m.stil,
            brace: m.stil === "alt" ? "andreas" : "none",
        });
        for (const k of [
            "treppgiebel",
            "kuppel",
            "portikus",
            "arkade",
            "turm",
            "zinnen",
            "veranda",
            "vorkragung",
            "pilotis",
            "terrasse",
        ])
            P[k] = +!!F[k];
        Object.assign(P, {
            bogenTyp: m.bogen,
            dachTyp: "sattel",
            grundriss: m.grund,
            col: Object.assign({}, st.FC.DEFCOL, m.col),
        });
        if (st.regler) st.regler.sync();
        malen();
        neuBauen();
    }

    // ── die Kamera: Orbit um das Ziel (Maus ziehen, Rad) ──
    function fuehre(camera, t) {
        const k = st.kam;
        const dt = k.t ? Math.min(0.1, Math.max(0, t - k.t)) : 0;
        k.t = t;
        const z = st.ziel;
        if (!z) return;
        if (!k.soll) k.soll = { az: k.az, el: k.el, dist: k.dist };
        const f = dt ? 1 - Math.exp(-dt / 0.12) : 1;
        k.az += (k.soll.az - k.az) * f;
        k.el += (k.soll.el - k.el) * f;
        k.dist += (k.soll.dist - k.dist) * f;
        const ce = Math.cos(k.el);
        const x = z.x + Math.cos(k.az) * ce * k.dist;
        const zz = z.z + Math.sin(k.az) * ce * k.dist;
        const y = Math.max(z.y + Math.sin(k.el) * k.dist, st.r.getTerrainHeightAt(x, zz) + 0.6);
        camera.position.set(x, y, zz);
        camera.lookAt(z.x, z.y, z.z);
    }
    function aufCanvas(ev) {
        const c = st.r.state.renderer && st.r.state.renderer.domElement;
        return !!c && ev.target === c;
    }
    function hoeren(ziel, art, fn) {
        ziel.addEventListener(art, fn, { capture: true, passive: false }); // das Rad ruft preventDefault (Zoom des Studios)
        st.hoerer.push([ziel, art, fn]);
    }
    function soll() {
        return st.kam.soll || (st.kam.soll = { az: st.kam.az, el: st.kam.el, dist: st.kam.dist });
    }
    function hoererAn() {
        // das Studio hält Zeiger und Tasten, die ihm gehören — die Welt dahinter sieht sie nicht (kein Zeiger-Fang, kein Graben)
        const halt = (ev) => {
            if (aufCanvas(ev)) {
                ev.stopImmediatePropagation();
                ev.preventDefault();
            }
        };
        hoeren(window, "click", halt);
        hoeren(window, "mousedown", halt);
        hoeren(window, "pointerdown", (ev) => {
            if (!aufCanvas(ev)) return;
            st.kam.zug = { x: ev.clientX, y: ev.clientY };
            ev.stopImmediatePropagation();
        });
        hoeren(window, "pointermove", (ev) => {
            const z = st.kam.zug;
            if (!z) return;
            const s = soll();
            s.az += (ev.clientX - z.x) * 0.006;
            s.el = Math.max(0.04, Math.min(1.35, s.el + (ev.clientY - z.y) * 0.006));
            z.x = ev.clientX;
            z.y = ev.clientY;
        });
        hoeren(window, "pointerup", () => (st.kam.zug = null));
        hoeren(window, "wheel", (ev) => {
            if (!aufCanvas(ev)) return;
            const s = soll();
            s.dist = Math.max(4, Math.min(320, s.dist * Math.exp(ev.deltaY * 0.001)));
            ev.preventDefault();
            ev.stopImmediatePropagation();
        });
        const GEHALTEN = /^(?:Key[WASDEH]|Space|Arrow(?:Up|Down|Left|Right)|Escape)$/;
        hoeren(window, "keydown", (ev) => {
            const t = ev.target;
            if (
                t &&
                (t.tagName === "TEXTAREA" || t.tagName === "SELECT" || (t.tagName === "INPUT" && t.type !== "range"))
            )
                return;
            if (ev.ctrlKey || ev.metaKey || ev.altKey || !GEHALTEN.test(ev.code)) return;
            ev.stopImmediatePropagation();
            ev.preventDefault();
            if (ev.code === "Escape") return verlassen();
            if (ev.code === "KeyH") modusSetzen("haus");
            if (ev.code === "KeyE") modusSetzen("dorf");
        });
        hoeren(window, "keyup", (ev) => {
            if (GEHALTEN.test(ev.code)) ev.stopImmediatePropagation();
        });
    }
    function hoererAus() {
        for (const [z, a, fn] of st.hoerer) z.removeEventListener(a, fn, true);
        st.hoerer.length = 0;
        st.kam.zug = null;
    }

    // ── das Panel ──
    const CSS = `
#fachwerk-studio{--panel:rgba(14,12,9,.84);--ink:#e2dacb;--mut:#8c806d;--hair:rgba(170,140,90,.18);--holz:#b98a4e;
  --holz-hell:#e8c27e;--mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
  --sans:system-ui,-apple-system,"Segoe UI",sans-serif;--h-akzent:var(--holz-hell);--h-tinte:var(--ink);--h-matt:var(--mut);
  --h-feld:var(--panel);--h-mono:var(--mono);font-family:var(--sans);color:var(--ink);font-size:11px}
#fachwerk-studio *{box-sizing:border-box}
#fachwerk-studio .ctl,#fachwerk-studio .leg{position:fixed;z-index:2147483100;background:var(--panel);
  border:1px solid var(--hair);border-radius:11px;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px)}
#fachwerk-studio .ctl{top:16px;right:16px;width:318px;max-height:calc(100vh - 32px);overflow-y:auto;padding:12px}
#fachwerk-studio .leg{bottom:14px;left:50%;transform:translateX(-50%);font-family:var(--mono);font-size:10px;color:var(--mut);padding:8px 11px}
#fachwerk-studio h1{font-size:14px;font-weight:600;letter-spacing:.04em;margin:3px 0 9px}
#fachwerk-studio h1 b{color:var(--holz-hell);font-weight:600}
#fachwerk-studio .sec-t{font-family:var(--mono);font-size:9px;letter-spacing:.24em;color:var(--holz);margin:11px 2px 6px}
#fachwerk-studio .row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px}
#fachwerk-studio .btn{flex:1;min-width:58px;font:11px var(--sans);color:var(--ink);background:rgba(170,130,80,.10);
  border:1px solid var(--hair);border-radius:7px;padding:6px 4px;cursor:pointer;text-align:center}
#fachwerk-studio .btn:hover{background:rgba(170,130,80,.20)}
#fachwerk-studio .btn.on{background:rgba(232,194,126,.16);border-color:rgba(232,194,126,.46);color:var(--holz-hell)}
#fachwerk-studio .kult .btn{flex:0 0 calc(25% - 4px);min-width:0;font-size:10px;padding:5px 2px}
#fachwerk-studio label.w{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:3px 2px}
#fachwerk-studio select{flex:1;max-width:60%;font:11px var(--sans);color:var(--ink);background:rgba(170,130,80,.10);border:1px solid var(--hair);border-radius:6px;padding:3px}
#fachwerk-studio .nur-dorf{display:none}
#fachwerk-studio.dorf .nur-dorf{display:block}
#fachwerk-studio.dorf .nur-haus{display:none}
`;
    const HTML = `
<div class="ctl" id="fachwerk-ctl">
  <h1><b>Fachwerk</b> · Haus · Dorf · Stadt</h1>
  <div id="fachwerk-sitzung"></div>
  <div class="row" id="fachwerk-modi"><button class="btn on" data-m="haus">Haus</button><button class="btn" data-m="dorf">Dorf</button></div>
  <div class="nur-haus">
    <div class="sec-t">AUSSTATTUNG</div>
    <div class="row" id="fachwerk-aus"></div>
    <div class="sec-t">KULTUR</div>
    <div class="row kult" id="fachwerk-kulturen"></div>
    <div class="row"><button class="btn" id="fachwerk-wuerfel">Alles würfeln</button></div>
    <div class="sec-t">META · JAHR · KLIMA · LEUTE · WOHLSTAND</div>
    <div id="fachwerk-meta"></div>
    <div class="sec-t">WAHLEN</div>
    <div id="fachwerk-wahlen"></div>
    <div id="fachwerk-form"></div>
    <div id="fachwerk-kosten"></div>
  </div>
  <div class="nur-dorf">
    <div class="sec-t">EPOCHE</div>
    <label class="w">Epoche <select id="fachwerk-epoche"></select></label>
    <div id="fachwerk-dorf"></div>
    <div class="row"><button class="btn" id="fachwerk-felder">Neuer Same · neues Dorf</button></div>
  </div>
</div>
<div class="leg">MAUS ziehen · RAD · H Haus · E Dorf · Esc zurück in die Welt — die Bühne ist die Welt: ihr Licht, ihr Boden, ihre Uhr</div>
`;
    function knopf(ziel, text, fn) {
        const b = document.createElement("button");
        b.className = "btn";
        b.textContent = text;
        b.addEventListener("click", fn);
        ziel.appendChild(b);
        return b;
    }
    function wahl(sel, text, wert) {
        const o = document.createElement("option");
        o.value = wert;
        o.textContent = text;
        sel.appendChild(o);
    }
    function reglerBauen() {
        const $ = (s) => st.dom.querySelector(s);
        st.regler = AnazhHuelle.regler($("#fachwerk-form"), zeilen(), {
            werte: st.P,
            ruheMs: 160,
            sitzung: st.sitz,
            basis: () => basis(),
            nachRuhe: () => neuBauen(),
        });
        const FC = st.FC;
        const k = AUSSTATTUNG[st.aus] ? "ausstattung" : "haus";
        $("#fachwerk-kosten").textContent = ""; // die Leiste des vorigen Werks fällt
        st.kosten = AnazhHuelle.kosten($("#fachwerk-kosten"), {
            budget: FC.PORTAL_RENDER_CONFIG.lod.budget[k],
            stufen: FC.PORTAL_RENDER_CONFIG.lod.kindStages[k],
            bauen: (s) => FC.buildInstance(rezept(), st.r._foundryVariantFor(saat(), rezept()), s, praegung()),
            quelle: "gemessen an der Gestalt des Werks (fachwerk-core buildInstance, Same und Prägung des Werks)",
        });
        st.kosten.neu();
    }
    function panelBauen() {
        const FC = st.FC;
        if (!document.getElementById("fachwerk-studio-css")) {
            const h = document.createElement("link");
            h.rel = "stylesheet";
            h.href = new URL("../huelle/huelle.css" + (V ? "?v=" + V : ""), SKRIPT).href;
            document.head.appendChild(h);
            const s = document.createElement("style");
            s.id = "fachwerk-studio-css";
            s.textContent = CSS;
            document.head.appendChild(s);
        }
        const d = document.createElement("section");
        d.id = "fachwerk-studio";
        d.setAttribute("aria-label", "Fachwerk — Haus · Dorf · Stadt");
        d.innerHTML = HTML;
        document.body.appendChild(d);
        st.dom = d;
        const $ = (s) => d.querySelector(s);
        st.sitz = AnazhHuelle.sitzung({
            werte: st.P,
            seed: SAAT,
            zustand: () => ({ kultur: st.kultur, aus: st.aus, epoche: st.epoche }),
            zustandSetzen: (z) => {
                st.kultur = z.kultur;
                st.aus = z.aus;
                st.epoche = z.epoche;
                malen();
            },
            beiSeed: () => neuBauen(),
            anwenden: () => (st.modus === "haus" ? metaOderBau() : neuBauen()),
        });
        st.sitz.leiste($("#fachwerk-sitzung"), { seed: true });
        for (const m of d.querySelectorAll("#fachwerk-modi .btn"))
            m.addEventListener("click", () => modusSetzen(m.dataset.m));
        for (const a of Object.keys(AUSSTATTUNG))
            knopf($("#fachwerk-aus"), a === "haus" ? "Haus" : FC.AUSSTATTUNG[a].lab.split(" · ")[0], () =>
                st.sitz.schritt(() => ausSetzen(a))
            ).dataset.a = a;
        for (const k of FC.KULTNAMES)
            if (FC.PRESETS[k] && FC.PRESETS[k].kind === "haus")
                knopf($("#fachwerk-kulturen"), FC.PRESETS[k].lab.split(" · ")[0], () =>
                    st.sitz.schritt(() => kulturSetzen(k))
                ).dataset.k = k;
        $("#fachwerk-wuerfel").addEventListener("click", () => st.sitz.wuerfeln(zeilen()));
        st.meta = AnazhHuelle.regler($("#fachwerk-meta"), BED_META, {
            werte: st.P,
            sitzung: st.sitz,
            gruppen: false,
            zuruecksetzen: false,
            nachRuhe: () => metaAnwenden(),
        });
        for (const [k, lab, opts] of WAHLEN) {
            const l = document.createElement("label");
            l.className = "w";
            l.textContent = lab;
            const s = document.createElement("select");
            s.dataset.k = k;
            for (const [v, t] of opts) wahl(s, t, v);
            s.addEventListener("change", () => {
                const neu = s.value;
                st.sitz.schritt(() => {
                    st.P[k] = neu;
                    neuBauen();
                });
            });
            l.appendChild(s);
            $("#fachwerk-wahlen").appendChild(l);
        }
        const ep = $("#fachwerk-epoche");
        wahl(ep, "Gewachsen · aus dem Samen", "");
        for (const e of Object.keys(FC.EPOCHEN)) wahl(ep, e[0].toUpperCase() + e.slice(1), e);
        ep.addEventListener("change", () => {
            const neu = ep.value;
            st.sitz.schritt(() => {
                st.epoche = neu;
                dorfBauen();
            });
        });
        st.dorfRegler = AnazhHuelle.regler($("#fachwerk-dorf"), BED_DORF, {
            werte: st.P,
            sitzung: st.sitz,
            gruppen: false,
            zuruecksetzen: false,
            ruheMs: 400,
            nachRuhe: () => dorfBauen(),
        });
        $("#fachwerk-felder").addEventListener("click", () => st.sitz.seedSetzen((st.sitz.seed + 7919) >>> 0));
        reglerBauen();
        malen();
    }
    function metaOderBau() {
        if (st.regler) st.regler.sync();
        malen();
        neuBauen();
    }
    function malen() {
        const d = st.dom;
        if (!d) return;
        for (const b of d.querySelectorAll("#fachwerk-kulturen .btn"))
            b.classList.toggle("on", !AUSSTATTUNG[st.aus] && b.dataset.k === st.kultur);
        for (const b of d.querySelectorAll("#fachwerk-aus .btn")) b.classList.toggle("on", b.dataset.a === st.aus);
        for (const s of d.querySelectorAll("#fachwerk-wahlen select"))
            if (st.P[s.dataset.k] != null) s.value = st.P[s.dataset.k];
        const ep = d.querySelector("#fachwerk-epoche");
        if (ep) ep.value = st.epoche;
    }

    // ── betreten · verlassen ──
    // `wie`: { modus: "dorf", dp } öffnet das Studio im Dorf (das Tor-Wort, die Linse) — ohne erst ein Haus zu bauen
    async function betreten(wie) {
        if (st.aktiv) return;
        if (st.offen) return st.offen;
        st.offen = (async () => {
            const r = window.anazhRealm;
            const FC = window.__fachwerkCore;
            if (!r || !FC || typeof r.kameraFuehren !== "function" || typeof r.siedlungAbbauen !== "function")
                throw new Error("die Welt-Engine steht nicht (anazhRealm, __fachwerkCore)");
            while (!r.state._weltbildDa) await new Promise((res) => setTimeout(res, 120));
            const buch = await r._foundryAwaitBook(20000);
            if (!buch || !buch.ok) throw new Error("das Buch der Foundry kommt nicht (die Häuser der Welt)");
            st.r = r;
            st.FC = FC;
            st.P = {};
            for (const z of BED_META.concat(BED_DORF)) st.P[z.id] = z.def;
            const pm = r.state.playerMesh;
            st.heim = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
            st.hausOrt = hausPlatz();
            st.dorfOrt = dorfPlatz();
            standSetzen();
            if (st.werk && st.werk.studioOv)
                for (const k in st.werk.studioOv) if (k.slice(0, 2) !== "__") st.P[k] = st.werk.studioOv[k];
            st.modus = null;
            st.aktiv = true;
            panelBauen();
            if (st.werk && Number.isFinite(st.werk.seed)) st.sitz.seedSetzen(st.werk.seed, true);
            hoererAn();
            if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
            st.kam.soll = null;
            st.kam.t = 0;
            r.kameraFuehren(fuehre);
            r.studioModus(WERK); // HUD, Rad und Wort der Welt gehören dem Studio
            requestAnimationFrame(takt);
            if (wie && wie.dp) dpSetzen(wie.dp);
            modusSetzen(wie && wie.modus === "dorf" ? "dorf" : "haus");
            r.log("Fachwerk: das Studio steht in der Welt (H Haus · E Dorf · Esc zurück)", "INFO");
        })()
            .catch((e) => bruch(e))
            .finally(() => (st.offen = null));
        return st.offen;
    }
    // DAS DORF VERLANGEN (das Tor-Wort „dorf", die Linse H6 im Bild): der Stand des Dorfs, dann der Akt — fertig, wenn es steht
    function dpSetzen(dp) {
        if (Number.isFinite(dp.seed)) st.sitz.seedSetzen(dp.seed, true);
        if (Number.isFinite(dp.nH)) st.P.nH = dp.nH;
        if (Number.isFinite(dp.budget)) st.P.budget = dp.budget;
        if (dp.epoche !== undefined) st.epoche = dp.epoche || "";
        if (st.dorfRegler) st.dorfRegler.sync();
        malen();
    }
    async function dorfVerlangen(dp) {
        const o = dp || {};
        if (st.offen) await st.offen;
        if (!st.aktiv) await betreten({ modus: "dorf", dp: o });
        else {
            dpSetzen(o);
            if (st.modus !== "dorf") modusSetzen("dorf");
            else dorfBauen();
        }
        if (!st.aktiv) return null;
        while (st.baut) await st.baut;
        return st.dorf ? st.dorf.placed : 0;
    }
    function verlassen() {
        if (!st.aktiv) return;
        st.aktiv = false;
        hoererAus();
        const r = st.r;
        if (st.kommt) r.removeArchitecture(st.kommt); // das Werk, das steht, bleibt in der Welt
        if (st.werk) delete st.werk._werkstatt; // ab jetzt ein Werk der Welt: seine Stufen treffen die Platte
        st.kommt = null;
        st.werk = null;
        st.dorf = null; // das Dorf bleibt in der Welt, wie der Akt es stellte
        const pm = r.state.playerMesh;
        if (st.heim) pm.position.set(st.heim.x, st.heim.y, st.heim.z);
        pm.visible = true;
        r.kameraFuehren(null);
        r.studioModus(null);
        if (st.dom) st.dom.remove();
        st.dom = null;
        if (such.get("studio") === WERK) history.replaceState(null, "", location.pathname + location.hash);
        r.log("Fachwerk verlassen — Haus und Dorf stehen in der Welt", "INFO");
    }
    // Die Wörter des Fachwerks (DSL der Registry): die 32 Kulturen, „dorf" und „haus".
    function wort(w) {
        if (!st.aktiv) return false;
        const k = String(w || "").toLowerCase();
        if (k === "dorf" || k === "haus") return (modusSetzen(k), true);
        return st.FC.PRESETS[k] ? (st.sitz.schritt(() => kulturSetzen(k)), true) : false;
    }
    // EIN BRUCH IST LAUT: beim Namen ins Log der Welt und in die Konsole.
    function bruch(e) {
        const grund = String((e && e.message) || e);
        st.bruch = grund;
        console.error(`[Fachwerk] ${grund}`);
        const r = st.r || window.anazhRealm;
        if (r && typeof r.log === "function") r.log(`Fachwerk: ${grund}`, "ERROR");
    }

    // DIE LINSE (gate:studio-huelle H6 im Bild, gate:studio-begehen) und das Tor der Welt lesen das Studio hier.
    window.__studioModi = window.__studioModi || {};
    window.__studioModi[WERK] = Object.freeze({
        betreten,
        verlassen,
        wort,
        dorf: dorfVerlangen,
        zustand: () => ({
            bruch: st.bruch,
            aktiv: st.aktiv,
            modus: st.modus,
            kultur: st.kultur,
            aus: st.aus,
            epoche: st.epoche,
            seed: st.sitz ? st.sitz.seed : null,
            P: st.P ? Object.assign({}, st.P) : null,
            werk: st.werk ? st.werk.id : null,
            kommt: st.baut ? "dorf" : st.kommt ? st.kommt.id : null,
            ort: st.modus === "dorf" ? st.dorfOrt : st.hausOrt,
            dorf: st.dorf
                ? {
                      placed: st.dorf.placed,
                      skipped: st.dorf.skipped,
                      name: st.dorf.name,
                      groesse: st.dorf.groesse,
                      mauer: st.dorf.mauer,
                      haeuser: st.dorf.haeuser.map((e) => ({
                          position: { x: e.position.x, y: e.position.y, z: e.position.z },
                      })),
                  }
                : null,
        }),
        werk: () => st.werk,
    });
    if (such.get("studio") !== WERK) return;
    const los = () => (window.anazhRealm ? betreten() : setTimeout(los, 120));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los);
    else los();
})();
