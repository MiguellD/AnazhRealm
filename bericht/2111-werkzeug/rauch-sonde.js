// SONDE DER GEBURT (rauch-nan): in die Seite VOR der Probe (werkbank eval / H.seite), liest nur, ändert keinen Wert der Welt.
// window.__rauchGeburt.fall nennt den ERSTEN nicht-endlichen Ballen der Fahne: wo (Geburt · Zug · anderer Schreiber · Wind am
// endlichen Ort), seinen Stand vorher und nachher, das Bild (qu, Flammen) und die Glieder von `_windAt` an seinem Ort.
(() => {
    const r = window.anazhRealm;
    const st = r.state;
    if (r.__rauchSondeEcht) r._brandRauch = r.__rauchSondeEcht;
    const echt = (r.__rauchSondeEcht = r._brandRauch);
    const K = ["x", "y", "z", "s", "a", "w", "b0", "tr2", "m"];
    const ok = (p) => K.every((k) => Number.isFinite(p[k]));
    const zahl = (f) => { try { return f(); } catch (e) { return "wirft: " + String(e.message).slice(0, 120); } };
    const glieder = (x, z) => {
        const t = st.spielZeit, d = zahl(() => r._windDirAt(t));
        return {
            dir: d, wf: zahl(() => r._wetterFeldAm(x, z, t, {}, false).wind), wob: zahl(() => r._windWob(t)),
            boe: zahl(() => r._boePhase(t)), form: zahl(() => r._windForm(x, z, d)), gasse: zahl(() => ({ ...r._gassenWind(x, z, d) })),
        };
    };
    const G = (window.__rauchGeburt = { fall: null, takte: 0 });
    let vor = new Map();
    r._brandRauch = function (dt, qu, wind) {
        G.takte++;
        const T = st.brandRauch.teilchen;
        if (!G.fall) {
            const p = T.find((q) => !ok(q));
            if (p) G.fall = { wo: "zwischen zwei Bildern (ein anderer Schreiber)", p: { ...p }, vorher: vor.get(p) || null, t: st.spielZeit };
        }
        const ww = (x, z) => {
            if (!G.fall && !(Number.isFinite(x) && Number.isFinite(z))) {
                const p = T.find((q) => q.x === x && q.z === z) || null;
                G.fall = { wo: "der Ort des Winds ist nicht endlich", x, z, p: p && { ...p }, vorher: p && vor.get(p), t: st.spielZeit };
            }
            const w = wind(x, z);
            if (!G.fall && ![w.x, w.z, w.ms].every(Number.isFinite))
                G.fall = { wo: "_windAt am endlichen Ort", x, z, w: { ...w }, glieder: glieder(x, z), t: st.spielZeit };
            return w;
        };
        vor = new Map(T.map((p) => [p, { ...p }]));
        try {
            return echt.call(this, dt, qu, ww);
        } finally {
            if (!G.fall) {
                const p = T.find((q) => !ok(q));
                if (p)
                    G.fall = {
                        wo: vor.has(p) ? "im Zug (Zeile 1084–1091)" : "bei der Geburt (Zeile 1049–1078)",
                        p: { ...p }, vorher: vor.get(p) || null, dt, t: st.spielZeit, bild: r._bildZeit,
                        qu: qu.map((q) => ({ von: q.von, bis: q.bis, holz: q.holz, glut: q.b.glut, rauchKg: q.b.rauchKg, schuld: q.b.rauchSchuld, iw: q.b.iw })),
                        fl: (r._brandFlammen || []).slice(0, 4).map((f) => ({ x: f.x, z: f.z, y: f.y, lang: f.lang, I: f.I })),
                        glieder: vor.has(p) ? glieder(vor.get(p).x, vor.get(p).z) : null,
                    };
            }
        }
    };
    return "SONDE rauch-nan steht";
})();
