// BAUSTEIN-MESSUNG (kein Schnitt): der Stoff OHNE den Würfel-Schatten des Licht-Pools — der Faktor des Wurfs ist 1.
if (P) {
    const L0 = P._lichtWurf;
    P._lichtWurf = function () {
        const K = L0.call(this);
        if (!K.__ohne) [K.faktor, K.__ohne] = [THREE.TSL.float(1), true];
        return K;
    };
}
