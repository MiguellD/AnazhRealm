const st = r.state, C = AnazhRealm;
// same.physik.reaktion#2 — „Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen": der SPIKE des Zensus (kein Schnitt im Stamm).
// AUFBAU: an der Mess-Wiese drei Strahlen Probe-Fenster (ein Holz-Bock, darauf eine Scheibe 0,5 × 0,5 m, 4 mm, aus der Zeile
// quarz — der Wirt trägt keine Zeile glas) in geometrischer Staffel 4 m · 1,09^k, dazu zwei Kisten der Welt (frei) auf einem
// vierten Strahl. Die Probe schreibt nichts in den Stand: der Speicher-Wunsch und das Journal ruhen, der Abbau gibt sie zurück.
const r3 = (v) => Math.round(v * 1e3) / 1e3;
if (window.__druckProbe) return { fehler: "die Probe steht schon" };
const H = { x: -277.4, z: -1045.6 };
// die Welt steht: die Bühne, der gezeichnete Boden am Herd und am Ende der Strahlen (Lauf 1 setzte in eine Welt im Boot, sein
// Abbau räumte die später gewachsene Welt). DIE HÖHE EINES WERKS: `position.y` ist sein Fuß + 0,5 m (koerper-frei.js:82,
// siedlung-instanz.js:1014, werkstatt-bauen.js:380) — Lauf 1 und 2 gaben den Boden selbst, jede Scheibe und jede Kiste stand
// 0,5 m im Boden (die Kisten sprangen im ersten Schritt um 0,50 m heraus).
let wartS = 0;
const steht = () =>
    r._buehneSteht() &&
    [0, 120, 240].every((g) => r._bodenSichtAt(H.x + 34 * Math.cos((g * Math.PI) / 180), H.z + 34 * Math.sin((g * Math.PI) / 180), {}) !== null) &&
    r._bodenSichtAt(H.x, H.z, {}) !== null;
while (!steht() && wartS < 150) {
    await new Promise((ok) => setTimeout(ok, 1000));
    wartS++;
}
if (!steht()) return { fehler: "die Welt steht nach " + wartS + " s nicht (Bühne " + r._buehneSteht() + ", Boden am Herd " + r._bodenSichtAt(H.x, H.z, {}) + ")" };
const D = (window.__druckProbe = {
    scheiben: [],
    kisten: [],
    eigen: new Set(),
    plaeneVor: new Set(Object.keys(st.blueprints)),
    werkeVor: st.architectures.length,
    vor: new Set(st.architectures),
});
r._scheduleEditSave = () => {};
r.journalAppend = () => {};
const pm = st.playerMesh.position;
let ausGesetz = 0;
const boden = (x, z) => {
    const s = r._bodenSichtAt(x, z, {});
    if (s !== null && Number.isFinite(s)) return s;
    ausGesetz++;
    const g = r._koerperBodenUnter(x, pm.y + 20, z);
    if (!Number.isFinite(g)) throw new Error("kein Boden an " + r3(x) + "/" + r3(z));
    return g;
};
H.y = boden(H.x, H.z);
D.herd = H;
const NAME = "probe_fenster";
st.blueprints[NAME] = C._etikett({
    name: NAME,
    builtIn: false,
    vomGesetz: true,
    label: "Probe-Fenster",
    parts: [
        { shape: "box", material: "holz", size: { x: 0.7, y: 0.12, z: 0.35 }, position: { x: 0, y: 0.06, z: 0 } },
        { shape: "box", material: "quarz", size: { x: 0.5, y: 0.5, z: 0.004 }, position: { x: 0, y: 0.37, z: 0 } },
    ],
});
const bp = st.blueprints[NAME];
const v = r._workshopPhysicsVerdict(bp, 0);
const urteil = { schwebt: v.floatingParts.slice(), lean: r3(v.lean), knickt: !!v.buckles };
if (urteil.schwebt.length || v.lean >= 1 || v.buckles) return { fehler: "das Probe-Fenster steht nicht", urteil };
const absagen = [];
let nr = 0;
for (const [si, grad] of [0, 120, 240].entries()) {
    const [ux, uz] = [Math.cos((grad * Math.PI) / 180), Math.sin((grad * Math.PI) / 180)];
    for (let k = 0; k <= 25; k++) {
        const d = 4 * 1.09 ** k;
        const quer = k % 2 ? 0.45 : -0.45; // versetzt: keine Scheibe steht im Schatten der vorigen, die Scherben fliegen frei
        const x = H.x + ux * d - uz * quer;
        const z = H.z + uz * d + ux * quer;
        const y = boden(x, z);
        const e = r.spawnArchitecture(
            NAME,
            { x, y: y + 0.5, z },
            {
                precise: true,
                silent: true,
                seed: 7000 + nr++,
                rotationY: Math.atan2(H.x - x, H.z - z),
                absage: (g) => absagen.push([si, k, g]),
            }
        );
        if (e) D.scheiben.push({ e, strahl: si, k, x, y, z, heil: true, hatGesetz: !!e._gesetz }), D.eigen.add(e);
    }
}
for (const d of [6, 12]) {
    const [ux, uz] = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)];
    const [x, z] = [H.x + ux * d, H.z + uz * d];
    const e = r.spawnArchitecture("kiste", { x, y: boden(x, z) + 0.5, z }, { precise: true, silent: true, seed: 7900 + d, ruht: true, absage: (g) => absagen.push(["kiste", d, g]) });
    if (e) D.kisten.push({ e, d, frei: !!e._frei }), D.eigen.add(e);
}
return {
    herd: { x: r3(H.x), y: r3(H.y), z: r3(H.z) },
    spieler: { x: r3(pm.x), y: r3(pm.y), z: r3(pm.z) },
    wartS,
    werkeVor: D.werkeVor,
    bodenAusGesetz: ausGesetz,
    scheiben: D.scheiben.length,
    mitGesetz: D.scheiben.filter((s) => s.hatGesetz).length,
    kisten: D.kisten.map((k) => ({ d: k.d, frei: k.frei })),
    absagen,
    urteil,
    hoehen: { min: r3(Math.min(...D.scheiben.map((s) => s.y))), max: r3(Math.max(...D.scheiben.map((s) => s.y))) },
    // EINE Pose für das Paar: die erhöhte, die die Blick-Wahl in Lauf 3 vor dem Bruch selbst nahm (bodennah verdeckt die erste Scheibe das Ziel)
    bild: [r3(H.x + 3.12), r3(H.y + 9.6), r3(H.z + 4.27), r3(H.x + 9), r3(H.y + 0.35), r3(H.z + 0.2)],
};
