// Messung ohne Eingriff: je Render-Objekt der Erst-Zeichnung der Knoten-Bau in Raten — erster Ruf, jeder weitere gezählt, fertig —
// mit Objekt (Name), Stoff (Name/Typ und id) und Pass (Render-Kontext); eine Geometrie-Arena nennt ihre Glieder (die Schlüssel
// ihrer Senken, `userData.archInstanceKey`, sonst ihren Namen), jedes andere Objekt seinen Namen und den seiner Eltern.
// Der Leser paart den Stoff mit dem Etikett seiner Pipeline (`renderPipeline_<Typ>_<id>`, FREI_ZERLEGE `pipes`).
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const log = (X.programme = []);
    const je = new Map();
    const wer = (o) => {
        if (o.isGeometrieArena && Array.isArray(o.glieder))
            return "Arena[" + o.glieder.slice(0, 6).map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type).join(", ") + (o.glieder.length > 6 ? ", … " + o.glieder.length : "") + "]";
        const kette = [];
        for (let x = o; x && kette.length < 3; x = x.parent) kette.push(x.name || x.type);
        return kette.join(" < ") + (o.userData && o.userData.archInstanceKey ? " {" + o.userData.archInstanceKey + "}" : "");
    };
    const K0 = P._knotenRate;
    P._knotenRate = function (N, ro, E) {
        const r = K0.call(this, N, ro, E);
        try {
            const m = ro.material || {};
            const o = ro.object || {};
            const id = (m.name || m.type || "?") + "_" + m.id + " ¦ " + ((ro.context && ro.context.id) ?? "?") + " ¦ " + o.id;
            let e = je.get(id);
            if (!e) {
                e = [Math.round(performance.now()), null, 0, (o.name || o.type || "?") + " ¦ " + (m.name || m.type || "?") + "_" + m.id + " ¦ " + ((ro.context && ro.context.id) ?? "?"), ""];
                je.set(id, e);
                log.push(e);
            }
            e[2]++;
            e[4] = wer(o); // die Glieder beim letzten Ruf (die Arena wächst)
            if (r && e[1] == null) e[1] = Math.round(performance.now());
        } catch (err) {
            X.programmFehler = String(err.message);
        }
        return r;
    };
}
