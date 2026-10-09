// 0710-11 (3): die Linse (H) DIE HAUS-TÜR in gate:brennglas-takt — und `_tickHausTueren` in den Takten der Quell-Wand.
// Aufruf: node tuer-gate-patch.cjs <worktree>
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/scripts/diag-brennglas-takt.cjs";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER " + (s.split(a).length - 1) + ": " + a.slice(0, 140));
    s = s.replace(a, b);
}
// der Kopf
ers(
    `//   (D) DER DORF-RAUCH: dieselben Quellen wie die Schleife über den Bestand;`,
    `//   (D) DER DORF-RAUCH: dieselben Quellen wie die Schleife über den Bestand;
//   (H) DIE HAUS-TÜR (0710-11): ein Haus mit Tür, das nach dem letzten Scan in die Nähe kommt, steht 2 s später in der Nähe-Liste
//       des Tür-Takts (\`_tickHausTueren\`) und trägt sein Tür-Gedächtnis; die Liste ist der Filter über den Bestand, in seiner
//       Ordnung (bis 0710-11 baute sie sich nur alle 1 000 s neu: Sekunden gegen \`> 1000\`);`
);
// die Takte der Quell-Wand
ers(
    `    "_lofiNearResonantArchitecture",
];`,
    `    "_lofiNearResonantArchitecture",
    "_tickHausTueren",
];`
);
// die Probe — vor dem Ende der Probe
ers(
    `    aus.bestand = st.architectures.length;
    return aus;`,
    `    // (H) DIE HAUS-TÜR: fern von jedem Haus scannt der Tür-Takt (nichts), dann 5 m vor ein Haus mit Tür — 2 s Frames später
    // steht es in der Nähe-Liste und trägt sein Tür-Gedächtnis (\`_tuerRec\`); die Liste ist der Filter über den Bestand
    const haeuser = st.architectures.filter((e) => e && e.tuer && e.position);
    aus.tuer = { haeuser: haeuser.length, mitInstanz: haeuser.filter((e) => e.instSlots).length };
    const haus = haeuser.find((e) => e.instSlots);
    if (haus) {
        const echt = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
        stelle(ox + 900, oz + 900);
        r._hausTuerScanT = 0;
        r._hausTuerNah = null;
        const t0 = 5000; // Sekunden wie der Loop
        P._tickHausTueren.call(r, t0);
        const fernListe = (r._hausTuerNah || []).length;
        stelle(haus.position.x + 5, haus.position.z);
        delete haus._tuerRec;
        for (let i = 1; i <= 120; i++) P._tickHausTueren.call(r, t0 + i / 60);
        const nah = r._hausTuerNah || [];
        const q = pm.position;
        const soll = st.architectures.filter(
            (e) =>
                e &&
                e.tuer &&
                e.position &&
                e.instSlots &&
                (e.position.x - q.x) ** 2 + (e.position.z - q.z) ** 2 < 1600
        );
        Object.assign(aus.tuer, {
            fernListe,
            drin: nah.includes(haus),
            rec: !!haus._tuerRec,
            liste: nah.length,
            soll: soll.length,
            gleich: nah.length === soll.length && nah.every((e, k) => e === soll[k]),
        });
        pm.position.set(echt.x, echt.y, echt.z);
    }
    aus.bestand = st.architectures.length;
    return aus;`
);
// das Urteil
ers(
    `    if (!S.rauch.gleich) rot.push(\`(D) DORF-RAUCH: die Quellen weichen von der Schleife über den Bestand ab\`);`,
    `    if (!S.rauch.gleich) rot.push(\`(D) DORF-RAUCH: die Quellen weichen von der Schleife über den Bestand ab\`);
    const H = S.tuer || {};
    if (!(H.haeuser > 0 && H.mitInstanz > 0))
        rot.push(\`(H) DIE HAUS-TÜR: kein Haus mit Tür und Instanz in der Welt (vakuös) — \${JSON.stringify(H)}\`);
    else {
        if (H.fernListe !== 0) rot.push(\`(H) DIE HAUS-TÜR: die Probe stand nicht fern (\${H.fernListe} Häuser in der Liste)\`);
        if (!H.drin || !H.rec)
            rot.push(
                \`(H) DIE HAUS-TÜR bleibt zu: 2 s nach der Annäherung fehlt das Haus in der Nähe-Liste des Tür-Takts \` +
                    \`(_tickHausTueren) — \${JSON.stringify(H)}\`
            );
        if (!H.gleich) rot.push(\`(H) die Nähe-Liste der Türen ist nicht der Filter über den Bestand (\${H.liste} ≠ \${H.soll})\`);
    }`
);
// die Ausgabe
ers(
    `    console.log(\`  Dorf-Rauch: \${S.rauch.quellen} Quellen, gleich \${S.rauch.gleich}\`);`,
    `    console.log(\`  Dorf-Rauch: \${S.rauch.quellen} Quellen, gleich \${S.rauch.gleich}\`);
    const Ht = S.tuer || {};
    console.log(
        \`  Haus-Tür: \${Ht.haeuser} Häuser mit Tür (\${Ht.mitInstanz} mit Instanz) · fern \${Ht.fernListe} in der Liste · 2 s nach der \` +
            \`Annäherung drin \${Ht.drin}, Tür-Gedächtnis \${Ht.rec} · Liste = Filter \${Ht.gleich} (\${Ht.liste}/\${Ht.soll})\`
    );`
);
fs.writeFileSync(p, s);
console.log("ok");
