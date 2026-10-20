"use strict";
// DIE WARTE-WAND der Linsen (gate:altlasten, K-WANDUHR, Lehre 26: eine Wand urteilt in Bau-Ereignissen, nie in Wanduhr-Sekunden).
// BAU: eine Schleife wartet, solange der Bau eines Eintrags fehlt (`!e.mesh`, `!e.instanced`, `!(e._hausHuelle && …)`); FRIST: ihre
// Bedingung vergleicht die Wanduhr mit einer Frist (`performance.now()` / `Date.now()`) — unter Last kommt das Ereignis nach der
// Frist, die Linse fällt rot ohne Täter. Beide ROT; das EINE Warten ist welt-boot `__gebautNach` (der Deckel zählt Takte ohne
// Offenes) und `__weltDa` (ohne Frist, die Stall-Akte nennt den Hänger). Der REST (spec/ci/frist-rest.json, je Grund Datei → Zahl)
// schrumpft nur, jede Zahl steht genau: Messfenster, eine Welt ohne zählbaren Takt, ein Werkzeug in Sekunden — und OFFEN, was
// noch umzustellen ist. Bis K-WANDUHR: 157 Frist-Schleifen in 62 Dateien.
const { ast, wandere, zeileVon } = require("./stamm.cjs");
const REST = Object.assign({}, ...Object.values(require("../../spec/ci/frist-rest.json")));
const BAU = /^(instanced|mesh|instSlots|_hausHuelle)$/;
const uhr = (x) => {
    let j = false;
    wandere(x, (c) => {
        if (c.type === "CallExpression" && c.callee.property && c.callee.property.name === "now" && /^(performance|Date)$/.test(c.callee.object.name)) j = true;
    });
    return j;
};
function scanWarteWand(dateien, rest = REST) {
    const errs = [];
    for (const [name, src] of dateien) {
        const fristen = [];
        wandere(ast(src), (n) => {
            if (!/^(For|While|DoWhile)Statement$/.test(n.type) || !n.test) return;
            let frist = false,
                bau = null;
            wandere(n.test, (b) => {
                if (b.type === "BinaryExpression" && /^[<>]=?$/.test(b.operator) && (uhr(b.left) || uhr(b.right))) frist = true;
                if (b.operator === "!") wandere(b.argument, (x) => x.object && x.object.type === "Identifier" && BAU.test(x.property.name) && (bau = x.property.name));
            });
            if (frist) fristen.push(zeileVon(src, n.start));
            if (bau && name !== "scripts/lib/welt-boot.cjs") errs.push(`Warte-Wand: ${name}:${zeileVon(src, n.start)} wartet selbst auf einen Bau (${bau}) — das EINE Warten ist \`__gebautNach\``);
        });
        const soll = rest[name] || 0;
        if (fristen.length > soll) errs.push(`Warte-Wand: ${name}:${fristen.join(",")} urteilt an der Wanduhr (${fristen.length} Frist-Schleifen, REST ${soll}) — das EINE Warten ist \`__gebautNach\` / \`__weltDa\``);
        else if (fristen.length < soll) errs.push(`Warte-Wand: ${name} trägt nur ${fristen.length} von ${soll} Frist-Schleifen im REST — die Zahl senken (sie schrumpft nur)`);
    }
    for (const name of Object.keys(rest)) if (!dateien.some(([n]) => n === name)) errs.push(`Warte-Wand: ${name} steht im REST, die Datei fehlt — streichen`);
    return errs;
}
module.exports = { scanWarteWand };
