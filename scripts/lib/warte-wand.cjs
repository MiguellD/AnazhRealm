"use strict";
// DIE WARTE-WAND der Linsen (gate:altlasten, K-WANDUHR, Lehre 26: eine Wand urteilt in Bau-Ereignissen, nie in Wanduhr-Sekunden).
// ROT: eine Schleife wartet selbst auf einen Bau (`!e.mesh` …); eine FRIST — die Wanduhr (`performance.now()` / `Date.now()`)
// endet die Schleife, im Kopf oder als `if (…) break|return|throw` im Rumpf; ein `__gebautNach(…).catch(() => {})` schluckt
// den Deckel. Das EINE Warten ist welt-boot `__gebautNach` / `__deckel` (zählt nur Gänge ohne Offenes) und `__weltDa`.
// Der REST (spec/ci/frist-rest.json, je Grund Datei → Zahl) schrumpft nur: Messfenster, deren Maß die Zeit ist.
const { ast, wandere, zeileVon } = require("./stamm.cjs");
const REST = Object.assign({}, ...Object.values(require("../../spec/ci/frist-rest.json")));
const BAU = /^(instanced|mesh|instSlots|_hausHuelle)$/;
const hat = (x, f) => {
    let j = false;
    wandere(x, (c) => {
        j = j || !!f(c);
    });
    return j;
};
const uhr = (c) => c.type === "CallExpression" && c.callee.property && c.callee.property.name === "now" && /^(performance|Date)$/.test(c.callee.object.name);
const frist = (t) => hat(t, (b) => b.type === "BinaryExpression" && /^[<>]=?$/.test(b.operator) && (hat(b.left, uhr) || hat(b.right, uhr)));
function scanWarteWand(dateien, rest = REST) {
    const errs = [];
    for (const [name, src] of dateien) {
        const schleifen = [];
        const fristen = new Set();
        wandere(ast(src), (n) => {
            if (/^(For|While|DoWhile)Statement$/.test(n.type)) {
                schleifen.push(n);
                if (n.test && frist(n.test)) fristen.add(n);
                const bau = n.test && hat(n.test, (b) => b.operator === "!" && hat(b.argument, (x) => x.object && x.object.type === "Identifier" && BAU.test(x.property.name)));
                if (bau && name !== "scripts/lib/welt-boot.cjs") errs.push(`Warte-Wand: ${name}:${zeileVon(src, n.start)} wartet selbst auf einen Bau — das EINE Warten ist \`__gebautNach\``);
            } else if (n.type === "IfStatement" && frist(n.test) && hat(n.consequent, (c) => /^(Break|Return|Throw)Statement$/.test(c.type))) {
                const s = schleifen.filter((l) => l.body.start <= n.start && n.end <= l.body.end).pop();
                if (s) fristen.add(s);
            } else if (n.type === "CallExpression" && n.callee.property && n.callee.property.name === "catch" && hat(n.callee.object, (c) => c.property && c.property.name === "__gebautNach")) {
                const f = n.arguments[0];
                if (f && f.body && f.body.type === "BlockStatement" && !f.body.body.length) errs.push(`Warte-Wand: ${name}:${zeileVon(src, n.start)} schluckt den Deckel von \`__gebautNach\` — er wirft beim Namen`);
            }
        });
        const zeilen = [...fristen].map((n) => zeileVon(src, n.start));
        const soll = rest[name] || 0;
        if (zeilen.length > soll) errs.push(`Warte-Wand: ${name}:${zeilen.join(",")} urteilt an der Wanduhr (${zeilen.length} Frist-Schleifen, REST ${soll}) — das EINE Warten ist \`__deckel\` / \`__weltDa\``);
        else if (zeilen.length < soll) errs.push(`Warte-Wand: ${name} trägt nur ${zeilen.length} von ${soll} Frist-Schleifen im REST — die Zahl senken (sie schrumpft nur)`);
    }
    for (const name of Object.keys(rest)) if (!dateien.some(([n]) => n === name)) errs.push(`Warte-Wand: ${name} steht im REST, die Datei fehlt — streichen`);
    return errs;
}
module.exports = { scanWarteWand };
