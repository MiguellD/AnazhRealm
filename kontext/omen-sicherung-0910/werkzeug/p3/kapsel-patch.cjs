// 0710-7 (3), die Klasse: der Struktur-Löser von Kapsel und Wagen-Hülle fragt dieselbe Nachbarschaft — geordnet, byte-gleich.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// (1) der Löser
ers(
    `    _stepCharacterStructures(pos, feetY, headY, radius, huelle) {
        const arches = this.state.architectures;
        if (!arches || !arches.length) return -Infinity;
        let supportTop = -Infinity;
        // Das GERITTENE Gefährt blockt seinen Reiter nicht — er sitzt per Definition in dessen
        // blockerAABBs und würde sonst beim Aufsteigen herausgedrückt.
        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        for (let a = 0; a < arches.length; a++) {
            const e = arches[a];
            if (!e || !e.blockerAABBs || !e.position) continue;
            if (riddenId !== null && riddenId !== undefined && e.id === riddenId) continue;
            // grobe XZ-Distanz — nur nahe Bauwerke berühren den Spieler.
            // V18.464: + gestempelte Blocker-Reichweite (_blockerReach) — der
            // Zentrums-Cull verlor bei großen/skalierten Bauwerken die Rand-Parts.
            const cullR = 60 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - pos.x) > cullR || Math.abs(e.position.z - pos.z) > cullR) continue;
            const boxes = e.blockerAABBs;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = this._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
        }
        return supportTop;
    }`,
    `    _stepCharacterStructures(pos, feetY, headY, radius, huelle) {
        const arches = this.state.architectures;
        if (!arches || !arches.length) return -Infinity;
        let supportTop = -Infinity;
        // Das GERITTENE Gefährt blockt seinen Reiter nicht — er sitzt per Definition in dessen
        // blockerAABBs und würde sonst beim Aufsteigen herausgedrückt.
        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        // DIE NACHBARSCHAFT (0710-7): eine Box wirkt nur, wenn der Körper ihre Hülle erreicht — die Kapsel ihren Radius weit
        // (Auflage und Wand verlangen die Position in der Hülle ± radius), die Hülle des Wagens |mitte| + hl + hw weit (sonst
        // trennt eine Achse ihr Rechteck von der Box). Gelöst werden nur die Einträge der Nachbarschaft (\`_blockerNahe\`),
        // deren Hülle diese Reichweite um die Position berührt, in der Ordnung des Bestands; schiebt ein Eintrag den Körper,
        // fragt der Löser die Nachbarschaft der neuen Stelle hinter ihm nach. So sieht jede Box die Position, die sie in der
        // Schleife über das Array sah, und ein ausgelassener Eintrag hätte mit ihr nichts bewirkt: der Löser ist byte-gleich
        // (gate:blocker-netz, Kapsel und Hülle). Vorher löste jeder Schritt jede Box im 60-m-Umkreis (Wiese: 12 034).
        const reich = (huelle ? Math.abs(huelle.mitte) + huelle.hl + huelle.hw : radius) + 1e-6;
        const nah = this._blockerNahListe || (this._blockerNahListe = []);
        nah.length = 0;
        this._blockerNahe(pos.x, pos.z, reich, -Infinity, nah);
        for (let a = 0; a < nah.length; a++) {
            const e = nah[a];
            if (!e.blockerAABBs || !e.position) continue;
            if (riddenId !== null && riddenId !== undefined && e.id === riddenId) continue;
            // grobe XZ-Distanz — nur nahe Bauwerke berühren den Spieler.
            // V18.464: + gestempelte Blocker-Reichweite (_blockerReach) — der
            // Zentrums-Cull verlor bei großen/skalierten Bauwerken die Rand-Parts.
            const cullR = 60 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - pos.x) > cullR || Math.abs(e.position.z - pos.z) > cullR) continue;
            const x0 = pos.x,
                z0 = pos.z;
            const boxes = e.blockerAABBs;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) this._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = this._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
            if (pos.x !== x0 || pos.z !== z0) {
                // der Schub trug den Körper an eine neue Stelle: deren Nachbarschaft, hinter diesem Eintrag
                nah.length = 0;
                this._blockerNahe(pos.x, pos.z, reich, e._blockerSeq, nah);
                a = -1;
            }
        }
        return supportTop;
    }`
);
// (2) die Frage der Nähe, neben der Nachbarschaft
ers(
    `    _blockerNetzLoesen(entry) {`,
    `    // DIE FRAGE DER NÄHE (Leser: der Struktur-Löser \`_stepCharacterStructures\`): die Einträge des Bestands hinter \`nachSeq\`,
    // deren Hülle (\`_blockerHuelle\`) den Punkt x/z auf \`reich\` erreicht — aus den Zellen um ihn und der Riesen-Zelle, in der
    // Ordnung des Bestands nach \`out\`. Eine nicht endliche Frage (Reichweite oder Punkt) erreicht jeden Eintrag.
    _blockerNahe(x, z, reich, nachSeq, out) {
        const N = this._blockerNetz();
        const frage = ++N.frage;
        if (!(Number.isFinite(reich) && Number.isFinite(x) && Number.isFinite(z))) {
            for (const e of N.liste) if (e && e._blockerSeq > nachSeq) out.push(e);
            return out;
        }
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const ix0 = Math.floor((x - reich) / Z),
            iz0 = Math.floor((z - reich) / Z);
        const nx = Math.floor((x + reich) / Z) - ix0 + 1;
        const nZellen = nx * (Math.floor((z + reich) / Z) - iz0 + 1);
        const n0 = out.length;
        for (let c = -1; c < nZellen; c++) {
            const zelle = N.zellen.get(
                c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
            );
            if (!zelle) continue;
            for (let i = 0; i < zelle.length; i++) {
                const e = zelle[i];
                if (e._blockerFrage === frage) continue;
                e._blockerFrage = frage;
                if (!(e._blockerSeq > nachSeq)) continue;
                const h = e._blockerHuelle;
                if (h && (x < h[0] - reich || x > h[1] + reich || z < h[2] - reich || z > h[3] + reich)) continue;
                out.push(e);
            }
        }
        if (out.length - n0 > 1) out.sort(AnazhRealm._nachBestand);
        return out;
    }

    _blockerNetzLoesen(entry) {`
);
// (3) die Hülle eines Eintrags steht beim Stempel
ers(
    `        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        for (let i = 0; i < keys.length; i++) {`,
    `        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        entry._blockerHuelle =
            Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)
                ? [x0, x1, z0, z1]
                : null;
        for (let i = 0; i < keys.length; i++) {`
);
// (4) die Leser der Nachbarschaft
ers(
    `    // Schleife über das Array. Leser: der Struktur-Strahl (\`_fieldRaycast\`). Das alte Bucket-Grid (\`state.blockerIndex\`,
    // V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75).`,
    `    // Schleife über das Array. Leser: der Struktur-Strahl (\`_fieldRaycast\`) und der Struktur-Löser von Kapsel und Wagen-Hülle
    // (\`_stepCharacterStructures\` über \`_blockerNahe\`). Das alte Bucket-Grid (\`state.blockerIndex\`, V9.65) trug die
    // Hydrosphäre und fiel mit ihr (V9.75).`
);
// (5) die Ordnung des Bestands als Vergleich
ers(
    `AnazhRealm.BLOCKER_RIESE = -0.5;`,
    `AnazhRealm.BLOCKER_RIESE = -0.5;
AnazhRealm._nachBestand = (a, b) => a._blockerSeq - b._blockerSeq;`
);
fs.writeFileSync(p, s);
console.log("ok");
