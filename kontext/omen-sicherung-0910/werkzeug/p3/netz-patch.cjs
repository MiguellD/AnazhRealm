// 0710-7 (3): DIE NACHBARSCHAFT DER BLOCKER — der Struktur-Strahl fragt die Zellen seines Segments, nie den 80-m-Umkreis.
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/anazhRealm.js";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// (1) der Strahl fragt die Nachbarschaft
ers(
    `        // (2) STRUKTUREN — Segment vs solide Part-AABBs (Slab-Methode), nähester Treffer.
        let structHitT = Infinity,
            sFace = null;
        const arches = this.state.architectures;
        if (arches && arches.length) {
            for (let a = 0; a < arches.length; a++) {
                const e = arches[a];
                if (!e || !e.blockerAABBs || !e.position) continue;
                // V18.464: + _blockerReach (Rand-Parts großer Bauwerke, s. _stepCharacterStructures)
                const rcCull = 80 + (e._blockerReach || 0);
                if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                const boxes = e.blockerAABBs;
                for (let bi = 0; bi < boxes.length; bi++) {
                    const bx = boxes[bi];
                    const hitInfo = this._segmentAABB(sx, sy, sz, dx, dy, dz, bx);
                    if (hitInfo && hitInfo.t < structHitT) {
                        structHitT = hitInfo.t;
                        sFace = hitInfo;
                    }
                }
            }
        }`,
    `        // (2) STRUKTUREN — Segment vs solide Part-AABBs (Slab-Methode), nähester Treffer. Gefragt wird die Nachbarschaft der
        // Blocker (\`_blockerNetz\`): nur die Einträge der Zellen, die die Hülle des Segments überdeckt (dazu die Riesen-Zelle),
        // je Eintrag der Nah-Cull wie immer, je Box ihre Hülle vor dem Slab — eine Box, deren Hülle die des Segments nicht
        // berührt, schneidet es nie (die Marge 1e-6 m trägt die Rundung des Slabs und seinen Kehrwert 1e9). Den Gleichstand
        // zweier Treffer entscheidet die Ordnung des Bestands und der Box wie die Schleife über das Array: die Treffer sind
        // byte-gleich (gate:blocker-netz). Vorher prüfte jeder Strahl jede Box im 80-m-Umkreis — an der Mess-Wiese 22 758
        // Slabs je Strahl der Decken-Probe (ein Strahl je Frame), keine Box berührte das 4,5-m-Segment.
        let structHitT = Infinity,
            sFace = null,
            sSeq = Infinity,
            sBox = 0;
        const arches = this.state.architectures;
        if (arches && arches.length) {
            const N = this._blockerNetz();
            const frage = ++N.frage;
            const M = 1e-6;
            const qx0 = Math.min(sx, ex) - M,
                qx1 = Math.max(sx, ex) + M,
                qy0 = Math.min(sy, ey) - M,
                qy1 = Math.max(sy, ey) + M,
                qz0 = Math.min(sz, ez) - M,
                qz1 = Math.max(sz, ez) + M;
            const Z = AnazhRealm.BLOCKER_ZELLE;
            const ix0 = Math.floor(qx0 / Z),
                iz0 = Math.floor(qz0 / Z);
            const nx = Math.floor(qx1 / Z) - ix0 + 1;
            const nZellen = nx * (Math.floor(qz1 / Z) - iz0 + 1);
            for (let c = -1; c < nZellen; c++) {
                const zelle = N.zellen.get(
                    c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
                );
                if (!zelle) continue;
                for (let i = 0; i < zelle.length; i++) {
                    const e = zelle[i];
                    if (e._blockerFrage === frage) continue;
                    e._blockerFrage = frage;
                    if (!e.blockerAABBs || !e.position) continue;
                    // V18.464: + _blockerReach (Rand-Parts großer Bauwerke, s. _stepCharacterStructures)
                    const rcCull = 80 + (e._blockerReach || 0);
                    if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                    const boxes = e.blockerAABBs;
                    const seq = e._blockerSeq;
                    for (let bi = 0; bi < boxes.length; bi++) {
                        const bx = boxes[bi];
                        if (
                            bx.maxX < qx0 ||
                            bx.minX > qx1 ||
                            bx.topY < qy0 ||
                            bx.botY > qy1 ||
                            bx.maxZ < qz0 ||
                            bx.minZ > qz1
                        )
                            continue;
                        const hitInfo = this._segmentAABB(sx, sy, sz, dx, dy, dz, bx);
                        if (
                            hitInfo &&
                            (hitInfo.t < structHitT ||
                                (hitInfo.t === structHitT && (seq < sSeq || (seq === sSeq && bi < sBox))))
                        ) {
                            structHitT = hitInfo.t;
                            sFace = hitInfo;
                            sSeq = seq;
                            sBox = bi;
                        }
                    }
                }
            }
        }`
);
// (2) die Nachbarschaft selbst, neben dem Stempel der Reichweite
ers(
    `        entry._blockerReach = r;
    }
`,
    `        entry._blockerReach = r;
        this._blockerNetzSetzen(entry);
    }

    // DIE NACHBARSCHAFT DER BLOCKER (0710-7): ein Gitter aus Zellen (AnazhRealm.BLOCKER_ZELLE m) über die Hülle jedes Eintrags
    // im Bestand (\`state.architectures\`) — je Zelle die Einträge, deren Blocker-Boxen sie überdecken; wer mehr als
    // BLOCKER_ZELLEN_MAX Zellen überdeckte oder keine endliche Hülle trägt, steht in der Riesen-Zelle (jede Frage liest sie).
    // Gestempelt, wo sich der Bestand ändert: beim Eintritt (\`spawnArchitecture\` → \`_blockerEintritt\`), bei jedem Schreiben
    // der Boxen (\`_blockerStampReach\`), beim Austritt (\`removeArchitecture\`, \`_evictArchitecture\` → \`_blockerAustritt\`); ein
    // neues Array (eine neue Welt, der geleerte Bestand) baut das Netz in seiner Ordnung neu — nie je Leser. \`_blockerSeq\`
    // ist die Ordnung des Bestands (Eintritt aufsteigend = die Ordnung des Arrays): ein Leser entscheidet Gleichstände wie die
    // Schleife über das Array. Leser: der Struktur-Strahl (\`_fieldRaycast\`). Das alte Bucket-Grid (\`state.blockerIndex\`,
    // V9.65) trug die Hydrosphäre und fiel mit ihr (V9.75).
    _blockerNetz() {
        const liste = this.state.architectures;
        const alt = this._blockerNetzStand;
        if (alt && alt.liste === liste) return alt;
        const N = (this._blockerNetzStand = {
            liste,
            zellen: new Map(),
            seq: alt ? alt.seq : 0,
            gen: alt ? alt.gen + 1 : 1,
            frage: 0,
        });
        if (Array.isArray(liste))
            for (const e of liste) {
                if (!e) continue;
                e._blockerGen = N.gen;
                e._blockerSeq = ++N.seq;
                this._blockerNetzSetzen(e);
            }
        return N;
    }

    // Eintritt in den Bestand (nach dem push): die Ordnung und die Zellen.
    _blockerEintritt(entry) {
        const N = this._blockerNetz();
        entry._blockerGen = N.gen;
        entry._blockerSeq = ++N.seq;
        this._blockerNetzSetzen(entry);
    }

    // Austritt aus dem Bestand (nach dem splice): die Zellen geben ihn frei.
    _blockerAustritt(entry) {
        this._blockerNetzLoesen(entry);
        entry._blockerGen = 0;
    }

    // Die Zellen eines Eintrags aus der Hülle seiner Boxen (die alten vorher gelöst; außerhalb des Bestands keine).
    _blockerNetzSetzen(entry) {
        const N = this._blockerNetz();
        this._blockerNetzLoesen(entry);
        const boxes = entry.blockerAABBs;
        if (entry._blockerGen !== N.gen || !boxes || !boxes.length) return;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (b.minX < x0) x0 = b.minX;
            if (b.maxX > x1) x1 = b.maxX;
            if (b.minZ < z0) z0 = b.minZ;
            if (b.maxZ > z1) z1 = b.maxZ;
        }
        const Z = AnazhRealm.BLOCKER_ZELLE;
        const keys = [];
        if (Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(z0) && Number.isFinite(z1)) {
            const ix0 = Math.floor(x0 / Z),
                ix1 = Math.floor(x1 / Z),
                iz0 = Math.floor(z0 / Z),
                iz1 = Math.floor(z1 / Z);
            if ((ix1 - ix0 + 1) * (iz1 - iz0 + 1) <= AnazhRealm.BLOCKER_ZELLEN_MAX)
                for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) keys.push(ix * 2097152 + iz);
        }
        if (!keys.length) keys.push(AnazhRealm.BLOCKER_RIESE);
        for (let i = 0; i < keys.length; i++) {
            let zelle = N.zellen.get(keys[i]);
            if (!zelle) N.zellen.set(keys[i], (zelle = []));
            zelle.push(entry);
        }
        entry._blockerZellen = keys;
        entry._blockerZellenGen = N.gen;
    }

    _blockerNetzLoesen(entry) {
        const keys = entry._blockerZellen;
        if (!keys) return;
        entry._blockerZellen = null;
        const N = this._blockerNetzStand;
        if (!N || entry._blockerZellenGen !== N.gen) return;
        for (let i = 0; i < keys.length; i++) {
            const zelle = N.zellen.get(keys[i]);
            if (!zelle) continue;
            const j = zelle.indexOf(entry);
            if (j < 0) continue;
            zelle[j] = zelle[zelle.length - 1];
            zelle.pop();
            if (!zelle.length) N.zellen.delete(keys[i]);
        }
    }
`
);
// (3) der Bestand: Eintritt, zwei Austritte, das Leeren
ers(
    `        this.state.architectures.push(entry);
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`,
    `        this.state.architectures.push(entry);
        this._blockerEintritt(entry);
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`
);
ers(
    `        if (idx >= 0) arches.splice(idx, 1);
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`,
    `        if (idx >= 0) {
            arches.splice(idx, 1);
            this._blockerAustritt(entry);
        }
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`
);
ers(
    `        this.state.architectures.splice(idx, 1);
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`,
    `        this.state.architectures.splice(idx, 1);
        this._blockerAustritt(entry);
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte`
);
ers(
    `        this.state.architectures = [];
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
        // V9.75 (Welle C.4+5) — kein \`state.blockerIndex\`-Reset mehr; das
        // Bucket-Grid ist gestrichen. \`spawnArchitecture\` setzt
        // \`entry.blockerAABBs\` direkt (V9.65-Pro-Part-Logik bleibt).`,
    `        this.state.architectures = [];
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
        // Das neue Array ist ein neuer Bestand: die Nachbarschaft der Blocker (\`_blockerNetz\`) baut sich bei der nächsten Frage
        // aus ihm. \`spawnArchitecture\` setzt \`entry.blockerAABBs\` direkt (V9.65-Pro-Part-Logik bleibt).`
);
// (4) die Leser-Liste des Schreibers
ers(
    `    // Schreibt \`entry.blockerAABBs\` (nur solide Parts, \`_isPartSolid\`) — Spawn, Restore und Dismount-
    // Refresh laufen hier durch. Leser: Cell-Stempel (\`_stampArchitectureSolidCellsInto\`), Kapsel,
    // Raycast.`,
    `    // Schreibt \`entry.blockerAABBs\` (nur solide Parts, \`_isPartSolid\`) — Spawn, Restore und Dismount-
    // Refresh laufen hier durch. Leser: Cell-Stempel (\`_stampArchitectureSolidCellsInto\`), Kapsel,
    // Raycast (über die Nachbarschaft \`_blockerNetz\`, gestempelt in \`_blockerStampReach\`).`
);
// (5) die Maße der Nachbarschaft
ers(
    `AnazhRealm.PLAYER_WALL_RADIUS = 0.35;`,
    `AnazhRealm.PLAYER_WALL_RADIUS = 0.35;
// DIE NACHBARSCHAFT DER BLOCKER (\`_blockerNetz\`): die Kante einer Zelle (Meter, eine Zweier-Potenz — die Zelle eines Punkts ist
// exakt \`Math.floor(x / 8)\`), die Zahl der Zellen, über der ein Eintrag in der Riesen-Zelle steht, und deren Schlüssel (keine
// ganze Zahl, nie der Schlüssel einer Zelle).
AnazhRealm.BLOCKER_ZELLE = 8;
AnazhRealm.BLOCKER_ZELLEN_MAX = 1024;
AnazhRealm.BLOCKER_RIESE = -0.5;`
);
fs.writeFileSync(p, s);
console.log("ok");
