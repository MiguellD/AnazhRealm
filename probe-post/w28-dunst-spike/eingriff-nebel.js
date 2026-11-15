// SPIKE „das frühe Bild im Dunst" (DUNST_ART vom Vorspann: "lade" · "spiel"): der Spieler bekommt sein Bild, sobald Boden, Licht und
// Leib stehen und Boden + Himmel gezeichnet sind; die Sichtweite der EINEN Luft (β = 3,912 / V, `_luftBeta`) beginnt kurz vor dem
// nächsten offenen Bau-Posten und weicht nur zurück, wie dahinter fertig wird.
//   "lade":  die Welt bleibt im Lade-Takt (volle Bau-Frist), ab dem frühen Bild zeichnet JEDER Takt; das Weltbild fällt wie heute.
//   "spiel": das erste Weltbild steht beim frühen Bild (`_weltbildSteht`), der Rest baut im Takt des Spiels.
// → extra.dunst = { art, frueh, gehoben, weltbild, V: [[ms, V m, Ziel, offene Terme], …], neu, pop: [[Art, m, V], …], dt: [ms …], bilder: {name: dataURL} }
if (P && !P.__dunst) {
    P.__dunst = true;
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const H = (X.dunst = { art: DUNST_ART, frueh: null, gehoben: null, weltbild: null, V: [], neu: 0, pop: [], dt: [], bilder: {}, fehler: "" });
    const K = 3.912; // −ln 0,02
    const FRUEH = new Set(["boden", "licht", "leib", "buch"]);
    let V = 8;
    let ziel = 8;
    let letzte = 0;
    let offenRoh = null;
    let klar = Infinity;
    let tV = 0;
    const B0 = P._luftBeta;
    P._luftBeta = function (wf) {
        const b = B0.call(this, wf);
        if (wf) return b; // die Anker des Gesetzes (klar, Sturm) bleiben
        klar = K / b;
        return b;
    };
    const termVon = (l) => String(l.term || "");
    const steht = (w) => {
        const st = w.state;
        const E = w._erstZeichnung;
        if (!E || !st.scene) return false;
        const boden = st.scene.getObjectByName("bodenSatz");
        return !!boden && E.gezeichnet.has(boden) && !!st.skybox && E.gezeichnet.has(st.skybox);
    };
    // der nächste offene Bau-Posten in m (waagrecht vom Spieler)
    const naechster = (w, terme) => {
        const st = w.state;
        const p = st.playerMesh.position;
        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
        let d = Infinity;
        if (terme.has("streu")) d = Math.min(d, 10);
        if (terme.has("pflanzung")) d = Math.min(d, 15);
        if (terme.has("horizont") || terme.has("karten")) d = Math.min(d, R);
        if (terme.has("bauten") || terme.has("karten"))
            for (const e of st.architectures || []) {
                if (!e || !e.position || (w._archIsRendered(e) && !w._stufeOffen(e))) continue;
                const x = Math.hypot(e.position.x - p.x, e.position.z - p.z);
                if (x < d && x <= R) d = x;
            }
        return d;
    };
    const gesehen = new WeakSet();
    let gezaehlt = false;
    const popZaehlen = (w) => {
        const st = w.state;
        const p = st.playerMesh.position;
        for (const e of st.architectures || []) {
            if (!e || !e.position || gesehen.has(e) || !w._archIsRendered(e)) continue;
            gesehen.add(e);
            if (!gezaehlt) continue; // der Bestand beim frühen Bild zählt nicht als neu
            H.neu++;
            const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
            if (Math.exp((-K * d) / Math.min(V, klar)) > 0.1 && H.pop.length < 60) H.pop.push([String(e._lodSpecies || e.type), Math.round(d), Math.round(V)]);
        }
        gezaehlt = true;
    };
    const L0 = P._weltbildLuecken;
    let innen = false;
    P._weltbildLuecken = function (...a) {
        const roh = L0.apply(this, a);
        if (innen) return roh;
        try {
            offenRoh = roh;
            const st = this.state;
            if (H.frueh == null && st.playerMesh && !roh.some((l) => FRUEH.has(termVon(l))) && steht(this)) {
                H.frueh = Math.round(performance.now());
                H.offenBeimBild = roh.map((l) => termVon(l) + (l.n ? " " + l.n : "")).join(" · ");
                const el = document.getElementById("ladeschirm");
                if (el && DUNST_ART === "lade") el.style.opacity = "0";
            }
            if (DUNST_ART === "spiel" && H.frueh != null && !st._weltbildDa) return [];
        } catch (err) {
            H.fehler = "luecken: " + String(err.message);
        }
        return roh;
    };
    const F1 = P._ladeBildFaellig;
    P._ladeBildFaellig = function (L) {
        const r = F1.call(this, L);
        if (!r && H.frueh != null && this._ladeTakt()) {
            L.ladeBild = performance.now();
            L.ladeVorher = true;
            return true;
        }
        return r;
    };
    const schuss = (w, name) => {
        try {
            const c = w.state.renderer.domElement;
            const k = document.createElement("canvas");
            k.width = 948;
            k.height = Math.round((948 * c.height) / c.width);
            k.getContext("2d").drawImage(c, 0, 0, k.width, k.height);
            H.bilder[name] = k.toDataURL("image/jpeg", 0.86);
        } catch (err) {
            H.fehler = "schuss: " + String(err.message);
        }
    };
    const R0 = P._loopRender;
    P._loopRender = function (...a) {
        const st = this.state;
        const jetzt = performance.now();
        try {
            if (st.playerMesh && H.gehoben == null) {
                // nach der Freigabe im Spiel fragt der Eingriff die Lücken selbst (der Lade-Takt fragt nicht mehr)
                if (st._weltbildDa && DUNST_ART === "spiel") {
                    innen = true;
                    try {
                        offenRoh = L0.call(this);
                    } finally {
                        innen = false;
                    }
                }
                const roh = offenRoh || [];
                const terme = new Set(roh.map(termVon));
                if (H.frueh != null && (DUNST_ART === "lade" ? !!st._weltbildDa : roh.length === 0)) H.gehoben = Math.round(jetzt);
                const d = roh.length ? naechster(this, terme) : Infinity;
                ziel = Math.max(8, Math.min(d === Infinity ? klar : d - Math.max(4, 0.15 * d), klar));
                const dt = Math.min(0.25, (jetzt - (letzte || jetzt)) / 1000);
                if (ziel > V && !terme.has("zeichnung")) V = Math.min(ziel, V * Math.pow(2.2, dt) + 6 * dt);
                if (H.frueh != null && jetzt - tV > 400 && H.V.length < 120) {
                    tV = jetzt;
                    H.V.push([Math.round(jetzt), Math.round(V), Math.round(Math.min(ziel, 99999)), [...terme].join(" ")]);
                }
                if (H.frueh != null) popZaehlen(this);
            } else if (H.gehoben != null && V < klar) {
                const dt = Math.min(0.25, (jetzt - letzte) / 1000);
                V = Math.min(klar, V * Math.pow(3, dt) + 20 * dt);
                if (V >= klar && H.klar == null) H.klar = Math.round(jetzt);
            }
            if (st._weltbildDa && H.weltbild == null) H.weltbild = Math.round(st._weltbildDa);
            if (H.frueh != null && H.dt.length < 600 && (H.gehoben == null || jetzt - H.gehoben < 500)) H.dt.push(Math.round(jetzt - letzte));
            letzte = jetzt;
        } catch (err) {
            H.fehler = "takt: " + String(err.message);
        }
        try {
            const luft = st.luft;
            if (luft && st.playerMesh && V < klar && !st.kameraUnterWasser) {
                luft.U.beta.value = K / V;
                luft.U.hoehe.value = 40;
                luft.U.bezugY.value = st.playerMesh.position.y - 2;
                if (luft.U.spektrum && luft.U.spektrum.value && luft.U.spektrum.value.set) luft.U.spektrum.value.set(1, 1, 1);
                H.nebel = (H.nebel | 0) + 1;
            }
        } catch (err) {
            H.fehler = "nebel: " + String(err.message);
        }
        const r = R0.apply(this, a);
        try {
            if (H.frueh != null) {
                const seit = jetzt - H.frueh;
                for (const [name, ab] of [
                    ["0-frei", 0],
                    ["1-plus3", 3000],
                    ["2-plus8", 8000],
                ])
                    if (!(name in H.bilder) && seit >= ab) schuss(this, name);
                if (H.gehoben != null && !("3-gehoben" in H.bilder) && jetzt - H.gehoben > 2500) schuss(this, "3-gehoben");
            }
        } catch (err) {
            H.fehler = "bild: " + String(err.message);
        }
        return r;
    };
}
