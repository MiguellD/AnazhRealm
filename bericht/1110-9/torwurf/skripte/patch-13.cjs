// patch 13: die Kette einer gezeichneten Röhre folgt IHREM Polygonzug (path · tubularSegments der TubeGeometry) und lässt
// Punkte nur aus, solange die Sehne höchstens `roehreM` × r neben dem Gezeichneten liegt (Douglas-Peucker); die Geflecht-Achse
// (keine Röhre) behält die Kurven-Teilung. Arg 2: der Bruchteil (Standard 0.25).
const fs = require("fs");
const p = process.argv[2], k = process.argv[3] || "0.25";
let s = fs.readFileSync(p, "utf8");
const ersetze = (alt, neu, name) => {
    const n = s.split(alt).length - 1;
    if (n !== 1) throw new Error(name + ": " + n + " Treffer");
    s = s.replace(alt, () => neu);
};
ersetze(
    "sichtMinM: 0.03, kastenM: 0.032 };",
    "sichtMinM: 0.03, kastenM: 0.032, roehreR: " + k + " };",
    "Gesetz"
);
ersetze(
    `    function hKette(H, pts, r, m, dz) {
        if (!H || !(2 * r >= HUELLE_GESETZ.dickeM - 1e-9) || pts.length < 2) return;`,
    `    // Trägt die Kette eine GEZEICHNETE Röhre (\`roehre\`, ihre TubeGeometry), folgt sie deren Polygonzug — denselben Punkten,
    // die die Röhre trägt (\`path.getPointAt(i / tubularSegments)\`) — und lässt einen Punkt nur aus, solange die Sehne höchstens
    // \`roehreR\` × r neben ihm liegt (Douglas-Peucker). Vorher teilte die Kette nach eigener Sehne (≤ r) und lief neben der
    // Röhre, die selbst nach dem Detail-Gesetz (≤ 1 cm) geteilt ist: geisttor-Monolith r 1,7 cm, Wurf-IoU 0,747.
    function hRoehrenKette(H, roehre, r, m, dz) {
        var P = roehre.parameters.path, n = roehre.parameters.tubularSegments, pts = [], i;
        for (i = 0; i <= n; i++) pts.push(P.getPointAt(i / n));
        var tol = Math.min(HUELLE_GESETZ.sehneM, HUELLE_GESETZ.roehreR * r), halte = [0, n], stapel = [[0, n]];
        while (stapel.length) {
            var ab = stapel.pop(), a = pts[ab[0]], b = pts[ab[1]], best = -1, wo = -1;
            var ba = new THREE.Vector3().subVectors(b, a), l2 = Math.max(1e-12, ba.lengthSq());
            for (i = ab[0] + 1; i < ab[1]; i++) {
                var t = Math.max(0, Math.min(1, new THREE.Vector3().subVectors(pts[i], a).dot(ba) / l2));
                var dd = pts[i].distanceTo(new THREE.Vector3().copy(a).addScaledVector(ba, t));
                if (dd > best) { best = dd; wo = i; }
            }
            if (wo >= 0 && best > tol) { halte.push(wo); stapel.push([ab[0], wo], [wo, ab[1]]); }
        }
        halte.sort(function (x, y) { return x - y; });
        for (i = 1; i < halte.length; i++) {
            var u = pts[halte[i - 1]], v = pts[halte[i]];
            hKapsel(H, new THREE.Vector3(u.x, u.y, u.z + (dz || 0)), new THREE.Vector3(v.x, v.y, v.z + (dz || 0)), r, m);
        }
    }
    function hKette(H, pts, r, m, dz, roehre) {
        if (!H || !(2 * r >= HUELLE_GESETZ.dickeM - 1e-9) || pts.length < 2) return;
        if (roehre) return hRoehrenKette(H, roehre, r, m, dz);`,
    "Kette"
);
ersetze("hKette(HU,oc2,jambW*0.5*p.wMono+0.01,fmat,zO);", "hKette(HU,oc2,jambW*0.5*p.wMono+0.01,fmat,zO,mt.geometry);", "Monolith");
ersetze("hKette(HU,pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,0);", "hKette(HU,pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,0,tb.geometry);", "Wurzel");
fs.writeFileSync(p, s);
console.log("patch-13 ok (roehreR " + k + ")");
