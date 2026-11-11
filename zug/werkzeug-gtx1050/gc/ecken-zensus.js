// Messung ohne Eingriff — DER ZENSUS DER JAHRES-ECKEN (w28-baum-programm, Nadel ≡ Laub): je Umwandlung eines Studio-Teils
// (`_foundryBuildMesh`) seine Art (kind), ob es die Ecken trägt (aCenter · aType), welche Typen, wie viele Ecken, ob es zu einem Baum
// gehört (Wind-Daten) und die Signatur seines Stoffs (`foundrySignatur`) — summiert je (Art · Ecken · Typen · Baum). Dazu je Signatur
// die Zahl der Teile. → `extra.ecken`
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const Z = (X.ecken = { je: {}, sig: {}, teile: 0, fehler: "" });
    const B0 = P._foundryBuildMesh;
    P._foundryBuildMesh = function (m, baum) {
        const mesh = B0.apply(this, arguments);
        try {
            if (m && m.position && m.position.array) {
                Z.teile++;
                const n = m.position.array.length / 3;
                const paar = !!(m.aCenter && m.aCenter.array) && !!(m.aType && m.aType.array);
                const typen = paar ? [...new Set(Array.from(m.aType.array))].sort().join("+") : "—";
                const k = `${m.kind || "?"} · ${paar ? "Ecken " + typen : "ohne Ecken"} · ${baum ? "Baum" : "kein Baum"}`;
                const e = Z.je[k] || (Z.je[k] = { teile: 0, ecken: 0 });
                e.teile++;
                e.ecken += n;
                const sig = mesh && mesh.material && mesh.material.userData && mesh.material.userData.foundrySignatur;
                if (sig) Z.sig[sig] = (Z.sig[sig] || 0) + 1;
            }
        } catch (err) {
            Z.fehler = String(err && err.message);
        }
        return mesh;
    };
}
