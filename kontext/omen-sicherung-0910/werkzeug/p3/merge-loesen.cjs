// 0710-8: die 7 Konflikte welle-m-nexus ← origin/integ-probe nach Semantik, dazu die Folgen ausserhalb der Konflikte.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
// der Merge schrieb die Datei mit CRLF (autocrlf beim Checkout der Konflikte) — der Stamm ist LF
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER " + s.split(a).length + ": " + a.slice(0, 140));
    s = s.replace(a, b);
}
// die Konflikte der Reihe nach: [ours, theirs] je Block
function block(k) {
    let i = -1;
    for (let n = 0; n <= k; n++) i = s.indexOf("<<<<<<< HEAD\n", i + 1);
    const m = s.indexOf("\n=======\n", i);
    const e = s.indexOf("\n>>>>>>> origin/integ-probe\n", m);
    return { i, m, e, ours: s.slice(i + 13, m + 1), theirs: s.slice(m + 9, e + 1), ende: e + 28 };
}
const loesungen = [];
// (1) spawn_village: die Absicht ist die Quelle (`verlangt`), der Blick des Sprechers legt den Anker (Platzierung) — der
// Flag-Zwilling `orientieren` fällt
loesungen.push(() => `                    verlangt: ctx.source,\n                    blick,\n`);
// (2) _fieldRaycast: die Netz-Schleife trägt den Pflanzen-Sprung
loesungen.push((b) => {
    const a = `                        const bx = boxes[bi];
                        if (`;
    if (b.ours.split(a).length !== 2) throw new Error("K2");
    return (
        b.ours.replace(
            a,
            `                        const bx = boxes[bi];
                        if (durchPflanzen && bx.pflanze === true) continue;
                        if (`
        ) + "                        }\n"
    );
});
// (3) die Leser-Zeile des Box-Schreibers (welle-m-nexus); die Welt-Skala eines Studio-Baums (integ-probe) steht als eigene
// Methode VOR der Beschreibung des Box-Schreibers (unten eingesetzt)
let baumSkala = null;
loesungen.push((b) => {
    if (!b.theirs.startsWith("    // Raycast.\n")) throw new Error("K3");
    baumSkala = b.theirs.slice("    // Raycast.\n".length);
    return b.ours;
});
// (4) die Mitte der gesetzten Häuser — summiert, wo jedes Haus wirklich steht (der Ersatz-Ort eingeschlossen); dahinter der
// Anker aus dem Plan (integ-probe)
loesungen.push((b) => {
    const rest = b.theirs.slice(b.theirs.indexOf("    // DAS DORF VOR DIR"));
    return `        let mx = 0;
        let mz = 0;
        const haeuser = [];
        const zaehler = { ersatz: 0 };
        const so2 = Object.assign({}, so, { zaehler });
        for (const slot of plan.slots) {
            // das gesetzte Haus (\`_spawnSettlementSlot\`): am Anker + seinem Slot oder an seinem Ersatz-Ort daneben
            const haus = this._spawnSettlementSlot(slot, origin, f, so2);
            if (haus) {
                placed++;
                haeuser.push(haus);
                mx += haus.position.x;
                mz += haus.position.z;
            } else skipped++;
        }
        // die Mitte der gesetzten Häuser — dorthin schaut, wer das Dorf verlangt hat (\`_nachDorfOrientieren\`)
        const mitte = placed ? { x: mx / placed, z: mz / placed } : null;
        return {
            placed,
            skipped,
            ersatz: zaehler.ersatz,
            name: plan.name || null,
            groesse: plan.groesse || null,
            mitte,
            haeuser,
        };
    }

${rest}`;
});
// (5) der Satz und der Blick gehören dem, der das Dorf verlangt hat — EINE Prüfung, die Quelle des Akts
loesungen.push(
    () => `            // Zwei Kanäle (V-D8): das Log trägt Same, Größe, Slots und Ersatz-Orte; wer das Dorf verlangt hat (\`_spielerVerlangt\`,
            // die Quelle des Akts), hört den Satz der Welt und schaut auf SEIN Dorf — Nexus, Welt-Regeln und Mitspieler handeln
            // für die Welt: kein Satz an den Empfänger, kein Blick.
            this.log(
                \`Siedlung „\${res.name || "?"}" (\${res.groesse || "?"}, Seed \${seed}): \${res.placed} Häuser platziert (\${res.ersatz} am Ersatz-Ort), \${res.skipped} Slots übersprungen; Mitte \${Math.round(anchor.radius || 0)} m Radius.\`,
                "INFO"
            );
            if (this._spielerVerlangt(o.verlangt))
                this._chatEcho?.(
                    res.placed > 0
                        ? \`„\${res.name || "Das Dorf"}" steht vor dir: \${res.placed} \${res.placed === 1 ? "Haus" : "Häuser"}.\`
                        : "Hier findet kein Haus Grund — zu steil, zu nass oder verbaut. Versuch es an einem anderen Ort."
                );
            // Konsum: Blick (nur für den, der das Dorf verlangt hat) + Locator automatisch
            this._nachDorfOrientieren(res, o.verlangt);
`
);
// (6) der Löser: ein rutschender Wagen löst nie gegen sich selbst (integ-probe), EIN Paar vor/nach
loesungen.push(() => `            if (huelle && huelle.eigen === e.id) continue; // ein rutschender Wagen löst nie gegen sich selbst\n`);
// (7) der Schub: gesammelt für den Impuls (integ-probe) und die Nachbarschaft der neuen Stelle (welle-m-nexus)
loesungen.push(
    () => `            if (pos.x !== vorX || pos.z !== vorZ) {
                // der Schub dieses Bauwerks (der Spieler-Pfad sammelt ihn: ein Wagen bekommt seinen Impuls, 0710-4)
                if (quellen) quellen.push(e, pos.x - vorX, pos.z - vorZ);
                // der Schub trug den Körper an eine neue Stelle: deren Nachbarschaft, hinter diesem Eintrag
                nah.length = 0;
                this._blockerNahe(pos.x, pos.z, reich, e._blockerSeq, nah);
                a = -1;
            }
`
);
// von hinten nach vorn ersetzen (die Indizes bleiben gültig)
const bloecke = [];
for (let k = 0; k < 7; k++) bloecke.push(block(k));
if (s.indexOf("<<<<<<< HEAD\n", bloecke[6].ende) >= 0) throw new Error("mehr als 7 Konflikte");
for (let k = 6; k >= 0; k--) {
    const b = bloecke[k];
    s = s.slice(0, b.i) + loesungen[k](b) + s.slice(b.ende);
}
// die Folgen ausserhalb der Konflikte
ers(
    "    // Schreibt `entry.blockerAABBs` (nur solide Parts, `_isPartSolid`) — Spawn, Restore und Dismount-\n",
    baumSkala + "    // Schreibt `entry.blockerAABBs` (nur solide Parts, `_isPartSolid`) — Spawn, Restore und Dismount-\n"
);
ers(
    `        if (entry) this._grundrissRaeumen(entry);
        return !!entry;
    }`,
    `        if (entry) this._grundrissRaeumen(entry);
        return entry || false; // das gesetzte Haus (die Dorf-Mitte summiert, wo es steht)
    }`
);
ers(
    `            // Ein Programm eines Mitspielers (\`orientieren: false\`) baut sein Dorf, wie es dort steht — es spricht den
            // Empfänger nie mit „vor dir" an und dreht nie seinen Blick.
            const eigen = o.orientieren !== false;
`,
    ``
);
ers(
    `    _nachDorfOrientieren(anchor, res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            // die Häuser DIESES Dorfs (sein Kreis aus \`_siedlungsAnker\`), nie die Mitte aller Häuser der Welt — ein Auto-Dorf
            // 300 m weiter drehte den Blick vom neuen Dorf weg
            const M = anchor && anchor.mitte;
            const houses = list.filter(
                (e) =>
                    e &&
                    e.position &&
                    typeof e.type === "string" &&
                    e.type.startsWith("haus_") &&
                    (!M || Math.hypot(e.position.x - M.x, e.position.z - M.z) <= (anchor.radius || 0) + 8)
            );
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte ? res.mitte : anchor;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {`,
    `    _nachDorfOrientieren(res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            // die Häuser DIESES Dorfs: die eben gesetzten (\`res.haeuser\`, ihre Mitte \`res.mitte\`) — nie die Mitte aller Häuser
            // der Welt (ein Auto-Dorf 300 m weiter drehte den Blick vom neuen Dorf weg), nie ein Kreis um den Anker (er fing die
            // Häuser eines Nachbar-Dorfs mit); ohne gesetztes Haus kein Blick
            const houses = (res && res.haeuser) || [];
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {`
);
fs.writeFileSync(p, s);
console.log("ok");
