// VERGLEICHS-EINGRIFF „nach Schirm-Fläche": dieselben Programme wie heute, aber der Knoten-Bau in Raten (`_knotenRate`) geht je Bild
// nur dem ungebauten Bürger weiter, dessen Hülle (Kugel der Geometrie in der Welt-Matrix des Dings; eine Arena ohne Kugel gilt
// als bildfüllend) am Schirm die größte Fläche deckt — gewählt aus den Fragenden des letzten Bilds. Die Pipelines folgen der
// Reihenfolge der fertigen Bauten. → extra.flaeche = { folge: [[ms, Fläche, Ding ¦ Stoff]], gewartet: Rufe, die warten mussten }
if (P && !P.__stoffFlaeche) {
    P.__stoffFlaeche = true;
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const F = (X.flaeche = { folge: [], gewartet: 0, fehler: "" });
    const K0 = P._knotenRate;
    let [frame, vor, jetzt, wahl] = [-1, new Map(), new Map(), null];
    const gesehen = new Set();
    const v = { x: 0, y: 0, z: 0 };
    const flaeche = (w, ro) => {
        const o = ro.object;
        const g = o.geometry;
        if (g && g.boundingSphere === null) g.computeBoundingSphere();
        const bs = g && g.boundingSphere;
        if (!bs || !(bs.radius > 0) || !Number.isFinite(bs.radius)) return 4;
        const e = o.matrixWorld.elements;
        const [x, y, z] = [bs.center.x, bs.center.y, bs.center.z];
        v.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        v.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        v.z = e[2] * x + e[6] * y + e[10] * z + e[14];
        const s = Math.max(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10]));
        const c = w.state.camera.position;
        const d = Math.max(0.1, Math.hypot(v.x - c.x, v.y - c.y, v.z - c.z));
        return Math.min(4, ((bs.radius * s) / d) ** 2);
    };
    P._knotenRate = function (N, ro, E) {
        try {
            // nur die Welt-Szene unter dem Ladeschirm wird sortiert; alles andere baut wie heute
            if (ro.scene !== this.state.scene || !this._ladeTakt()) return K0.call(this, N, ro, E);
            const f = N.nodeFrame.frameId;
            if (f !== frame) {
                [frame, vor, jetzt, wahl] = [f, jetzt, new Map(), null];
                let best = -1;
                for (const [k, a] of vor) if (a > best && N.nodeBuilderCache.get(k) === undefined) [best, wahl] = [a, k];
            }
            const key = N.getForRenderCacheKey(ro);
            const a = flaeche(this, ro);
            if (!(jetzt.get(key) >= a)) jetzt.set(key, a);
            if (wahl !== null && key !== wahl) return (F.gewartet++, false);
            const r = K0.call(this, N, ro, E);
            if (r && !gesehen.has(key)) {
                gesehen.add(key);
                const m = ro.material || {};
                F.folge.push([Math.round(performance.now()), +a.toFixed(3), (ro.object.name || ro.object.type) + " ¦ " + (m.name || m.type) + "_" + m.id]);
            }
            return r;
        } catch (err) {
            F.fehler = String(err.message);
            return K0.call(this, N, ro, E);
        }
    };
}
