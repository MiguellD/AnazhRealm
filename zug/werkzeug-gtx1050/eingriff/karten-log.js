// Messung ohne Eingriff: je Karte der Back-Schlange jeder Wechsel ihres Zustands — worauf sie wartet (die Antwort der Platte,
// die Programme der GPU-Ablage, ihre Höhen-Stufe L1 aus der Foundry, die Bühne) und wann sie steht. Dazu je Körper-Schlüssel der
// Foundry die Zeit, in der er im Cache des Wirts ankam (`_foundryCacheSet`-frei: gelesen am Wechsel von undefined).
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const log = (X.karten = []);
    const zuletzt = new Map();
    const B0 = P._karteWeltBacken;
    P._karteWeltBacken = function (at, z) {
        const vorPlatte = z._platte;
        const r = B0.call(this, at, z);
        let wort;
        if (r === null) {
            const lod = this._karteStufe(z.preset);
            const key = this._foundryKoerperKey(z.preset, z.variant, lod, z.ov);
            wort =
                z._platte === false
                    ? "wartet: Platte"
                    : this._foundryCacheGet(key) === undefined
                      ? "wartet: L" + lod + " " + z.preset
                      : at.offen && at.offen.z !== z
                        ? "wartet: Bühne (" + at.offen.z.key + ")"
                        : vorPlatte === false
                          ? "Platte antwortete"
                          : "wartet: Programme";
        } else wort = r === true ? "GEBACKEN" : r === 0 ? "Ring steht" : "gescheitert";
        if (zuletzt.get(z.key) !== wort) {
            zuletzt.set(z.key, wort);
            log.push([Math.round(performance.now()), z.key, wort]);
        }
        return r;
    };
    // die Ankunft jedes Foundry-Körpers im Wirt (der Ruf, der die Antwort eines Auftrags einlöst)
    const an = (X.koerper = []);
    const A0 = P._foundryAntwort;
    P._foundryAntwort = function (f, m) {
        if (m && m.type === "asset") an.push([Math.round(performance.now()), m.presetId + " L" + m.lod, m.platte ? "P" : "B"]);
        return A0.call(this, f, m);
    };
}
