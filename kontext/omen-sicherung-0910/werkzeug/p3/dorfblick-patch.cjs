// 0710-7 (1): der Blick gehört dem, der das Dorf verlangt — und zielt auf SEIN Dorf.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 100));
    s = s.replace(a, b);
}
// (1) die DSL-Quelle reist als Absicht
ers(
    `                this.spawnSettlement({ position: pos, seed: s, nHAusGesetz: true, autonomous: ctx.source === "nexus" });`,
    `                this.spawnSettlement({
                    position: pos,
                    seed: s,
                    nHAusGesetz: true,
                    autonomous: ctx.source === "nexus",
                    verlangt: ctx.source,
                });`
);
// (2) der Chat-Befehl „dorf" ist der Spieler selbst
ers(
    `                run: (m, append) => {
                    const opts = {};
                    if (m[1] !== undefined) opts.seed = Number(m[1]);`,
    `                run: (m, append) => {
                    const opts = { verlangt: "human" };
                    if (m[1] !== undefined) opts.seed = Number(m[1]);`
);
// (3) die Mitte der gesetzten Häuser
ers(
    `        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0 };
        const f = this._foundry;
        let placed = 0;
        let skipped = 0;
        for (const slot of plan.slots) {
            if (this._spawnSettlementSlot(slot, origin, f, so)) placed++;
            else skipped++;
        }
        return { placed, skipped, name: plan.name || null, groesse: plan.groesse || null };`,
    `        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0, mitte: null };
        const f = this._foundry;
        let placed = 0;
        let skipped = 0;
        let mx = 0;
        let mz = 0;
        for (const slot of plan.slots) {
            if (this._spawnSettlementSlot(slot, origin, f, so)) {
                placed++;
                mx += origin.x + slot.x; // das Haus steht am Anker + seinem Slot (\`_spawnSettlementSlot\`)
                mz += origin.z + slot.z;
            } else skipped++;
        }
        // die Mitte der gesetzten Häuser — dorthin schaut, wer das Dorf verlangt hat (\`_nachDorfOrientieren\`)
        const mitte = placed ? { x: mx / placed, z: mz / placed } : null;
        return { placed, skipped, name: plan.name || null, groesse: plan.groesse || null, mitte };`
);
// (4) die Ausrichtung
ers(
    `    // Nach deliberate Dorf-Spawn: Spieler Richtung Häuser drehen + Bauten-Zeile.
    _nachDorfOrientieren(anchor, res) {
        try {
            const list = (this.state && this.state.architectures) || [];
            const houses = list.filter(
                (e) => e && e.position && typeof e.type === "string" && e.type.startsWith("haus_")
            );
            const pm = this.state && this.state.playerMesh;
            if (pm && houses.length) {
                let cx = 0,
                    cz = 0;
                for (const h of houses) {
                    cx += h.position.x;
                    cz += h.position.z;
                }
                cx /= houses.length;
                cz /= houses.length;
                const dx = cx - pm.position.x;
                const dz = cz - pm.position.z;
                if (Math.hypot(dx, dz) > 0.5) {
                    // der Blick zu den Häusern (die Umkehrung der EINEN Vorwärts-Richtung)
                    this.state.yaw = this._blickGierZu(dx, dz);
                }
            }`,
    `    // WER VERLANGT? Die DSL-Quelle eines Akts (\`ctx.source\`): der Spieler selbst ist „human" (sein Chat, seine Werkzeuge,
    // der Befehl „dorf") und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln, Resonanz und
    // Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        return quelle === "human" || (typeof quelle === "string" && quelle.startsWith("llm:"));
    }

    // Nach einem Dorf-Spawn: hat der SPIELER das Dorf verlangt (\`verlangt\`, die Quelle des Akts), schaut er auf die Mitte
    // DIESES Dorfs (\`res.mitte\`, die gesetzten Häuser; ohne sie der Anker) — ein Nexus- oder Welt-Dorf lässt seinen Blick
    // stehen (OMEN 0710-6, Boot 4B: ein Nexus-Dorf drehte die Gier mitten im Lauf auf −2,745; und der Blick zielte auf den
    // Schwerpunkt ALLER Häuser der Welt, gate:settlement C7). Dazu die Bauten-Zeile und das nächste Haus sofort gemesht.
    _nachDorfOrientieren(anchor, res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            const houses = list.filter(
                (e) => e && e.position && typeof e.type === "string" && e.type.startsWith("haus_")
            );
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte ? res.mitte : anchor;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {
                const dx = ziel.x - pm.position.x;
                const dz = ziel.z - pm.position.z;
                if (Math.hypot(dx, dz) > 0.5) {
                    // der Blick zum Dorf (die Umkehrung der EINEN Vorwärts-Richtung)
                    this.state.yaw = this._blickGierZu(dx, dz);
                }
            }`
);
ers(
    `            // Konsum: Blick + Locator automatisch (Sonden starren sonst in die Schlucht)
            this._nachDorfOrientieren?.(anchor, res);`,
    `            // Konsum: Blick (nur für den, der das Dorf verlangt hat) + Locator automatisch
            this._nachDorfOrientieren(anchor, res, o.verlangt);`
);
ers(
    `    // spawnSettlement (unten) — der deliberate Siedlungs-Akt (Chat „dorf [seed] [n]" / Gate): Samen`,
    `    // spawnSettlement (unten) — der Siedlungs-Akt (Chat „dorf [seed] [n]", DSL \`spawn_village\` je Quelle, Gate): Samen`
);
fs.writeFileSync(p, s);
console.log("ok");
