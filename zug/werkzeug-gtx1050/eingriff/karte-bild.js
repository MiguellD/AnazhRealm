// Messung ohne Eingriff — DIE KARTEN-FRAGE AM ERSTEN WELTBILD: weicht der Ladeschirm, bevor die Atlas-Gruppe der Karten
// (`IMPOSTOR_ATLAS_GRUPPE`) im Hauptbild zeichnete? Nach jedem Bild (hinter `_kontaktPassZeichne`, im selben Task wie der
// Render) der Stand der Gruppe: Instanzen, Arena, die Pässe, in denen sie schon zeichnete (`gezeichnet` der Erst-Zeichnung),
// ihr Vorbau, die offenen Pipelines beim Etikett — jede Änderung [ms, Stand]. Dazu das AUGE: die Leinwand im Task des ersten
// Weltbilds, im Task der ersten Zeichnung der Karten und 3 s nach dem Bild (JPEG an `/__bild`, FREI_JSON nennt den Ort).
// Mit FREI_NACH=<ms> läuft die Sonde so lange nach dem Bild weiter.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const K = (X.karte = { verlauf: [], bilder: [], amBild: null, erstZug: null, fehler: "" });
    const bild = (r, name) => {
        try {
            const c = r.state.renderer.domElement;
            const daten = c.toDataURL("image/jpeg", 0.85);
            K.bilder.push([name, Math.round(performance.now()), c.width + "x" + c.height, daten.length]);
            fetch("/__bild", { method: "POST", body: JSON.stringify({ name, daten }) }).catch(() => {});
        } catch (err) {
            K.fehler = "Bild " + name + ": " + String(err.message);
        }
    };
    const stand = (r) => {
        const st = r.state;
        const E = r._erstZeichnung;
        const A = r.constructor.IMPOSTOR_ATLAS_GRUPPE;
        const g = st.archInstanceGroups ? st.archInstanceGroups.get(A) : null;
        const m = g ? g.mesh : null;
        const a = m ? m.__arena : null;
        const o = a || m;
        const pass = o && E ? E.gezeichnet.get(o) : null;
        const vor = o && E ? E.vorgebaut.get(o) : null;
        const merk = o && E ? E.vorgemerkt.get(o) : null;
        const offen = [];
        if (E) for (const p of E.offen.keys()) offen.push(String(E.namen.get(p) || "?").replace("renderPipeline_", ""));
        // die Bäume im Blick des ersten Bilds nach ihrer Stufe (2 = Karte)
        const je = [0, 0, 0];
        for (const e of st.architectures || []) {
            if (!e || !e.position || !e._lodSpecies || !(e._lodLevel >= 0 && e._lodLevel <= 2)) continue;
            if (r._imErstenBlick(e.position.x, e.position.z, r.constructor.ERSTER_BLICK.dingM)) je[e._lodLevel]++;
        }
        const mat = m && m.material ? (m.material.name || m.material.type) + "_" + m.material.id : "";
        return {
            gruppe: g ? m.count | 0 : -1,
            arena: a ? a.glieder.length : 0,
            stoff: mat,
            paesse: pass ? [...pass].join(",") : "",
            vorgebaut: vor ? vor.size : 0,
            vorgemerkt: merk ? merk.size : 0,
            offen: offen.sort().join(" "),
            imBlick: je.join("/"),
            schlange: (r._impostorBakeQueue || []).length,
            bild: st._weltbildDa ? Math.round(st._weltbildDa) : 0,
        };
    };
    let zuletzt = "";
    let nachBild = 0;
    const K0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (direkt) {
        const aus = K0.call(this, direkt);
        try {
            const s = stand(this);
            const sig = JSON.stringify(s);
            if (sig !== zuletzt && K.verlauf.length < 400) {
                zuletzt = sig;
                K.verlauf.push([Math.round(performance.now()), s]);
            }
            if (s.paesse && !K.erstZug) {
                K.erstZug = [Math.round(performance.now()), s];
                if (s.bild) bild(this, "karte");
            }
            if (s.bild && !nachBild) nachBild = performance.now();
            if (nachBild && !K.spaet && performance.now() - nachBild >= 3000) {
                K.spaet = [Math.round(performance.now()), s];
                bild(this, "spaet");
            }
        } catch (err) {
            K.fehler = String(err.message);
        }
        return aus;
    };
    // der Task des ersten Weltbilds: gleich nach dem EINEN Schreiber, hinter dem Render desselben Tasks
    const W0 = P._weltbildSteht;
    P._weltbildSteht = function () {
        const aus = W0.call(this);
        try {
            K.amBild = [Math.round(performance.now()), stand(this)];
            bild(this, "weltbild");
        } catch (err) {
            K.fehler = String(err.message);
        }
        return aus;
    };
}
