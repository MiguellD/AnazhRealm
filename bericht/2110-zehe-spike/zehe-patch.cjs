// Spike leib.K2 (Hebel Leib H1, Zehen-Gelenk): trägt es? Mess-Patch an scripts/diag-koerper-stand.cjs (nur lokal, danach checkout).
// Im Fuß-Lock des K8-Gangs teilt er je Probe die Schuh-Vertices des Knöchels längs der Fuß-Achse (Knöchel → weiteste Ausdehnung)
// in ZEHE (vor der Ballen-Linie, die vordersten 28 % der Fußlänge) und REST. Ein ideales Zehen-Gelenk legt die Zehe auf den
// Boden; was bleibt, ist der Fehler des Rests: „ohneZehe" = tiefster Rest-Vertex gegen das gezeichnete Mesh. Liegt dessen p95 über
// 3 cm, trägt das Gelenk nicht. Dazu: wie oft die Zehe der tiefste Punkt ist und eintaucht.
//   node zehe-patch.cjs <diag-koerper-stand.cjs> [--ballen 0.72]
const fs = require("fs"),
    f = process.argv[2];
const ballen = process.argv.includes("--ballen") ? +process.argv[process.argv.indexOf("--ballen") + 1] : 0.72;
let t = fs.readFileSync(f, "utf8");
const t0 = t;
const rep = (a, b) => {
    if (!t.includes(a)) {
        console.error("FEHLT: " + a.slice(0, 80));
        process.exit(1);
    }
    t = t.replace(a, b);
};
rep(
    `        return (j) => {
            let t = null;
            for (const [o, i] of je[j]) {
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld);
                if (!t || v.y < t.y) t = v.clone();
            }
            const g = t && gez(t.x, t.z);
            return g === null || !t ? null : t.y - g;
        };`,
    `        return (j) => {
            let t = null;
            const alle = [];
            for (const [o, i] of je[j]) {
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld);
                alle.push(v.clone());
                if (!t || v.y < t.y) t = v.clone();
            }
            const g = t && gez(t.x, t.z);
            // SPIKE Zehe: die Fuß-Achse = waagrecht vom Knöchel zum weitesten Vertex; Ballen-Linie bei ${ballen} der Länge
            const zz = (window.__zz = window.__zz || { ohne: [], zehe: [], zeheTiefst: 0, zeheTaucht: 0, n: 0 });
            const k = knochen[j].getWorldPosition(new T.Vector3());
            let w = null, d = -1;
            for (const p of alle) { const e = Math.hypot(p.x - k.x, p.z - k.z); if (e > d) (d = e), (w = p); }
            if (w && d > 0.05 && g !== null) {
                const ax = (w.x - k.x) / d, az = (w.z - k.z) / d;
                const pr = alle.map((p) => (p.x - k.x) * ax + (p.z - k.z) * az);
                const lo = Math.min(...pr), hi = Math.max(...pr), grenze = lo + ${ballen} * (hi - lo);
                let rest = null, zehe = null;
                alle.forEach((p, i) => {
                    if (pr[i] > grenze) { if (!zehe || p.y < zehe.y) zehe = p; }
                    else if (!rest || p.y < rest.y) rest = p;
                });
                const gr = rest && gez(rest.x, rest.z), gz = zehe && gez(zehe.x, zehe.z);
                if (gr !== null && rest) zz.ohne.push(rest.y - gr);
                if (gz !== null && zehe) zz.zehe.push(zehe.y - gz);
                zz.n++;
                if (zehe && t && zehe.y <= t.y + 1e-6) { zz.zeheTiefst++; if (gz !== null && zehe.y - gz < -0.01) zz.zeheTaucht++; }
            }
            return g === null || !t ? null : t.y - g;
        };`
);
rep(
    `        s.keys.w = false;
        streuJetzt();`,
    `        s.keys.w = false;
        {
            const zz = window.__zz || { ohne: [], zehe: [], n: 0 };
            R.spike = { ohneZehe: mass(zz.ohne), zehe: mass(zz.zehe), proben: zz.n, zeheTiefst: zz.zeheTiefst, zeheTaucht: zz.zeheTaucht };
            window.__zz = null;
        }
        streuJetzt();`
);
rep(`        console.log("  " + zeileK8(k8.o));`, `        console.log("  " + zeileK8(k8.o));
        console.log("SPIKE-ZEHE " + JSON.stringify({ wiese: k8.o.wiese && Object.assign({ fuss: k8.o.wiese.fuss }, k8.o.wiese.spike), hang: k8.o.hang && Object.assign({ fuss: k8.o.hang.fuss }, k8.o.hang.spike) }));`);
fs.writeFileSync(f, t);
console.log("gepatcht ballen=" + ballen + " Δ=" + (t.length - t0.length));
