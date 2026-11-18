// DIE PROBEN DES GESICHTS (w28-iris-frei; Leser: scripts/werkbank.cjs `bild --klasse …:kopf/`, koerper-core `gesichtMasse`) — die
// Seiten-Werkzeuge der Iris: die FLÄCHE jeder Ecke vor der Kamera und der STRAHL der Kamera zu ihr. Aus der Werkbank gezogen
// (die Decke der Datei); die Seite trägt sie über `GESICHT_INSTALL`.
"use strict";

// DIE FLÄCHE DER ECKE VOR DER KAMERA (`gesichtMasse` g): je Ecke eines Teils ein Drittel jedes Dreiecks an ihr, wie die Kamera
// des Schusses es sieht (Fläche × |Normale · Blick|) — die Ecken einer Iris-Kugel sitzen an ihren Polen dicht, ihre Zahl ist kein
// Maß der Fläche (am selben offenen Auge zählten die Ecken 0,45–0,72 je Winkel der Kamera, die Fläche 0,88).
function gesichtFlaeche(o, cam, T) {
    const pa = o.geometry.attributes.position,
        ix = o.geometry.index;
    const P = [];
    for (let i = 0; i < pa.count; i++) P.push(o.getVertexPosition(i, new T.Vector3()).applyMatrix4(o.matrixWorld));
    const g = new Float64Array(pa.count),
        [e1, e2, zc] = [new T.Vector3(), new T.Vector3(), new T.Vector3()];
    for (let t = 0, n = ix ? ix.count : pa.count; t + 2 < n; t += 3) {
        const [a, b, c] = ix ? [ix.getX(t), ix.getX(t + 1), ix.getX(t + 2)] : [t, t + 1, t + 2];
        const nr = e1.subVectors(P[b], P[a]).cross(e2.subVectors(P[c], P[a]));
        zc.copy(cam.position).sub(P[a]).normalize();
        const f = Math.abs(nr.dot(zc)) / 6;
        ((g[a] += f), (g[b] += f), (g[c] += f));
    }
    return g;
}

// DER STRAHL DER KAMERA ZUR IRIS → { frei, lid, treffer }: `frei`, wo nichts im Strahl steht; `lid`, wo NUR Lider in ihm stehen
// (die Dreiecke an den Lid-Gelenken des Rigs, `knochen`) — das Lid in seiner Lage ist die Lidspalte, die Probe unter ihm zählt
// nicht als verdeckt; `treffer` das erste Teil, das kein Lid ist (Haut, Braue, Haar: der Täter beim Namen), sonst das Lid.
function gesichtStrahl(strahl, richt, cam, p, decke, knochen) {
    const lang = richt.copy(p.w).sub(cam.position).length();
    strahl.set(cam.position, richt.divideScalar(lang));
    strahl.near = 0;
    strahl.far = lang - 1e-4;
    const hs = strahl.intersectObjects(decke, false);
    const haut = hs.find((h) => !(h.face && /^lid[TB][LR]$/.test(knochen(h.object, h.face.a) || "")));
    return { frei: !hs.length, lid: hs.length > 0 && !haut, treffer: haut ? haut.object : null };
}

module.exports = {
    gesichtFlaeche,
    gesichtStrahl,
    GESICHT_INSTALL: `window.__gesichtFlaeche = ${gesichtFlaeche.toString()};window.__gesichtStrahl = ${gesichtStrahl.toString()};`,
};
