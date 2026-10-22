// Leib K1 St. 2 an f3865c80: `werkbank latenz` kennt gehen, wechsel, hieb. Mess-Patch (nur lokal, danach checkout) für springen (Space)
// und einsteigen (KeyE, toggleMountAtPlayer; der GT steht per latenz-gt.js neben dem Start) — dieselbe Uhr (CDP-Eingabe → erstes Bild
// mit Leib/Kamera ≥ 1 cm). Vor jeder Probe von springen/einsteigen zurück an den Start, abgesessen.
const fs = require("fs"), f = process.argv[2];
let t = fs.readFileSync(f, "utf8"); const t0 = t;
const rep = (a, b) => { if (!t.includes(a)) { console.error("FEHLT: " + a.slice(0, 90)); process.exit(1); } t = t.replace(a, b); };
rep('const taste = { gehen: ["KeyW", "w", 87], wechsel: ["KeyV", "v", 86] };',
    'const taste = { gehen: ["KeyW", "w", 87], wechsel: ["KeyV", "v", 86], springen: ["Space", " ", 32], einsteigen: ["KeyE", "e", 69] };');
rep('window.__latenz.bereit(s, z, v), s, verb === "gehen", verb)', 'window.__latenz.bereit(s, z, v), s, verb === "gehen" || verb === "springen" || verb === "einsteigen", verb)');
rep('        if (zurueck || (L.verb = verb) === "hieb") st.playerMesh.position.copy(L.start);',
    '        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();\n        if (zurueck || (L.verb = verb) === "hieb") st.playerMesh.position.copy(L.start);');
rep('        if (L.tier) r.removeCreature(L.tier);\n        rend.setAnimationLoop(null);',
    '        if (L.tier) r.removeCreature(L.tier);\n        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();\n        rend.setAnimationLoop(null);');
fs.writeFileSync(f, t); console.log("gepatcht Δ=" + (t.length - t0.length));
