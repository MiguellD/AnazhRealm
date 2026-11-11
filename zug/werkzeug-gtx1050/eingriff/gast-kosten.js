// Messung ohne Eingriff — WAS KOSTET DER GAST DER ANKUNFT VOR DEM BILD? Die Zeit im Ruf (Haupt-Faden) und die Zahl der Rufe von
// `_kammKroneVorbau`, `_kammKroneStoff`, `_vorbauGast` und `_gastOhneRaum` bis zum ersten Weltbild und danach; dazu je Ruf der
// Erst-Zeichnung für ein Objekt mit Gast-Prägung die Zeit im ganzen Ruf (`_renderObjectDirect` am Renderer).
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const K = (X.gastKosten = { vor: {}, nach: {}, fehler: "" });
    const zaehl = (name, dt, r) => {
        const z = r.state && r.state._weltbildDa ? K.nach : K.vor;
        const e = z[name] || (z[name] = [0, 0]);
        e[0]++;
        e[1] = Math.round((e[1] + dt) * 1000) / 1000;
    };
    for (const name of ["_kammKroneVorbau", "_kammKroneStoff", "_vorbauGast", "_gastOhneRaum"]) {
        const f0 = P[name];
        if (typeof f0 !== "function") {
            K.fehler += "kein Glied " + name + " · ";
            continue;
        }
        P[name] = function (...a) {
            const t = performance.now();
            try {
                return f0.apply(this, a);
            } finally {
                zaehl(name, performance.now() - t, this);
            }
        };
    }
    let gehakt = false;
    const K0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (direkt) {
        const aus = K0.call(this, direkt);
        try {
            const rend = this.state.renderer;
            if (!gehakt && rend && !rend._isHeadlessNull && typeof rend._renderObjectDirect === "function") {
                gehakt = true;
                const welt = this;
                const R0 = rend._renderObjectDirect;
                rend._renderObjectDirect = function (object, ...a) {
                    if (!object.__vorbauGast) return R0.call(this, object, ...a);
                    const t = performance.now();
                    try {
                        return R0.call(this, object, ...a);
                    } finally {
                        zaehl("Erst-Zeichnung des Gasts", performance.now() - t, welt);
                    }
                };
            }
        } catch (err) {
            K.fehler += String(err.message);
        }
        return aus;
    };
}
