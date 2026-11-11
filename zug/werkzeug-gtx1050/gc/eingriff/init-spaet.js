// EINGRIFF ZUM BEWEIS — DER RENDERER WIRD SPÄT FERTIG (w28-loop-vor-init): das `init()` des ERSTEN Renderers der Seite (der der
// Welt) beginnt INIT_SPAET_MS (Vorgabe 1 500 ms) nach seinem ersten Ruf — JEDER Ruf wartet auf dieselbe Frist (r184 ruft `init`
// auch aus `setAnimationLoop`; verzögerte der Eingriff nur den ersten Ruf, startete der Vendor das echte init dort selbst, und nur
// die Marke `rendererReady` des Spiels käme spät). So kommt die Antwort des Buch-Fadens (die Vorlage des Leibs) sicher an, BEVOR
// der Renderer steht — die Lage, die an der GTX 1050 in 7 von 126 Zweit-Boots von selbst eintrat (44–64 ms davor) und dort den
// Leib im Haupt-Faden gießen ließ. Mit takt-abschnitte.js dahinter nennt der Lauf die Abschnitte und jeden Bruch.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const S = (X.initSpaet = { ms: Number(window.__initSpaetMs || 1500), gehakt: false, gerufen: null, begann: null, endete: null, rufe: 0, fehler: "" });
    try {
        const K = THREE.WebGPURenderer.prototype;
        const I0 = K.init;
        let erster = null;
        let frist = null;
        K.init = function (...a) {
            if (erster === null) erster = this;
            if (this !== erster) return I0.apply(this, a); // nur der Renderer der Welt
            S.rufe++;
            if (!frist) {
                S.gerufen = Math.round(performance.now());
                frist = new Promise((f) => setTimeout(f, S.ms));
            }
            return frist.then(() => {
                if (S.begann === null) S.begann = Math.round(performance.now());
                return I0.apply(this, a).finally(() => {
                    if (S.endete === null) S.endete = Math.round(performance.now());
                });
            });
        };
        S.gehakt = true;
    } catch (e) {
        S.fehler = String(e && e.message);
    }
}
