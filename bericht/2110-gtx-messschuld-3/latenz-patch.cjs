// Messschuld 3, Leib K1 Staffel 2 (GTX-Hälfte): `werkbank latenz` kennt am Kopf 2160be58 nur gehen und wechsel. Dieser Mess-Patch
// (nur lokal, nach dem Lauf zurück per checkout, wie k8-patch.cjs) gibt ihr zwei Verben mehr, mit derselben Uhr (CDP-Taste → erstes
// Ausgabe-Bild mit Leib/Kamera ≥ 1 cm bewegt):
//   springen  = Space (keys[" "], Aktion jump) — vor jeder Probe zurück an den Start wie gehen
//   einsteigen = KeyE (FAHR_TASTEN.einsteigen, toggleMountAtPlayer) — vor jeder Probe absitzen und zurück an den Start; das Fahrzeug
//                stellt latenz-gt.js neben den Start (in Reichweite vehicle:FAHR.mountRangeM)
//   node latenz-patch.cjs <werkbank.cjs>
const fs = require("fs"),
    f = process.argv[2];
let t = fs.readFileSync(f, "utf8");
const t0 = t;
const rep = (a, b) => {
    if (!t.includes(a)) {
        console.error("FEHLT: " + a);
        process.exit(1);
    }
    t = t.replace(a, b);
};
rep(
    'const taste = { gehen: ["KeyW", "w", 87], wechsel: ["KeyV", "v", 86] };',
    'const taste = { gehen: ["KeyW", "w", 87], wechsel: ["KeyV", "v", 86], springen: ["Space", " ", 32], einsteigen: ["KeyE", "e", 69] };'
);
rep('window.__latenz.bereit(s, z), s, verb === "gehen")', 'window.__latenz.bereit(s, z), s, verb !== "wechsel")');
rep(
    "        if (zurueck) st.playerMesh.position.copy(L.start);",
    "        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();\n" +
        "        if (zurueck) st.playerMesh.position.copy(L.start);"
);
rep(
    "        rend.setAnimationLoop(null);\n        st.playerMesh.position.copy(L.start);",
    "        rend.setAnimationLoop(null);\n        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();\n        st.playerMesh.position.copy(L.start);"
);
fs.writeFileSync(f, t);
console.log("gepatcht Δ=" + (t.length - t0.length));
