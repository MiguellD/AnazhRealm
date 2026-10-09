// fügt diag-blocker-netz.cjs die Kapsel- und Hüllen-Runden hinzu (0710-7 (3), die Klasse)
"use strict";
const fs = require("fs");
const p = process.argv[2] + "/scripts/diag-blocker-netz.cjs";
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 120));
    s = s.replace(a, b);
}
// Kopf: die Kapsel
ers(
    `//   (A) ARBEIT: ein Strahl ruft \`_segmentAABB\` genau für die Boxen, deren Hülle die seines Segments berührt (im Nah-Cull) —
//       vorher für jede Box im 80-m-Umkreis;`,
    `//   (A) ARBEIT: ein Strahl ruft \`_segmentAABB\` genau für die Boxen, deren Hülle die seines Segments berührt (im Nah-Cull) —
//       vorher für jede Box im 80-m-Umkreis;
//   (L) DER LÖSER (\`_stepCharacterStructures\`, Kapsel des Spielers und Hülle des Wagens): je Runde Körper an, in und zwischen
//       den Boxen lösen byte-gleich wie die Schleife über den Bestand (Position, Auflage, Wand-Kontakt, Schübe der Hülle), und
//       er löst keinen Eintrag, dessen Hülle der Körper an seiner Stelle nicht erreicht (vorher jede Box im 60-m-Umkreis);`
);
// das Orakel des Lösers und die Runde der Körper, vor der Konsistenz
ers(
    `    // DIE KONSISTENZ des Netzes gegen den Bestand`,
    `    // DAS ORAKEL DES LÖSERS: die Schleife über den ganzen Bestand (V18.535), dieselben Löser je Box
    const alterLoeser = (pos, feetY, headY, radius, huelle) => {
        const arches = st.architectures;
        if (!arches || !arches.length) return -Infinity;
        let supportTop = -Infinity;
        const riddenId = st.player ? st.player.mountedArch : null;
        for (let a = 0; a < arches.length; a++) {
            const e = arches[a];
            if (!e || !e.blockerAABBs || !e.position) continue;
            if (riddenId !== null && riddenId !== undefined && e.id === riddenId) continue;
            const cullR = 60 + (e._blockerReach || 0);
            if (Math.abs(e.position.x - pos.x) > cullR || Math.abs(e.position.z - pos.z) > cullR) continue;
            const boxes = e.blockerAABBs;
            for (let b = 0; b < boxes.length; b++) {
                if (huelle) {
                    if (!(boxes[b].dick < huelle.stufe)) r._resolveHuelleVsAABB(boxes[b], pos, huelle);
                } else supportTop = r._resolveCapsuleVsAABB(boxes[b], pos, feetY, headY, radius, supportTop);
            }
        }
        return supportTop;
    };
    // die Löser-Rufe: je Ruf, ob der Körper die Hülle des Eintrags der Box an seiner Stelle erreicht
    const boxEintrag = new Map();
    let rufe = 0,
        fern = 0,
        reichJetzt = 0;
    const huelleVon = (e) => {
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (const b of e.blockerAABBs) {
            x0 = Math.min(x0, b.minX);
            x1 = Math.max(x1, b.maxX);
            z0 = Math.min(z0, b.minZ);
            z1 = Math.max(z1, b.maxZ);
        }
        return [x0, x1, z0, z1];
    };
    // je Eintrag zählt die Stelle, an der der Löser ihn beginnt (ein Schub innerhalb des Eintrags trägt den Körper weiter,
    // seine übrigen Boxen löst auch die Schleife über den Bestand an der neuen Stelle)
    let letzter = null;
    const zaehle = (box, pos) => {
        rufe++;
        const e = boxEintrag.get(box);
        if (!e || e === letzter) return;
        letzter = e;
        const h = huelleVon(e);
        if (pos.x < h[0] - reichJetzt || pos.x > h[1] + reichJetzt || pos.z < h[2] - reichJetzt || pos.z > h[3] + reichJetzt)
            fern++;
    };
    const P0 = Object.getPrototypeOf(r);
    r._resolveCapsuleVsAABB = function (box, pos, ...rest) {
        zaehle(box, pos);
        return P0._resolveCapsuleVsAABB.call(this, box, pos, ...rest);
    };
    r._resolveHuelleVsAABB = function (box, pos, h) {
        zaehle(box, pos);
        return P0._resolveHuelleVsAABB.call(this, box, pos, h);
    };
    const loeserRunde = (name, n) => {
        boxEintrag.clear();
        for (const e of st.architectures) if (e && e.blockerAABBs) for (const b of e.blockerAABBs) boxEintrag.set(b, e);
        const boxen = ortsBoxen();
        const R = { name, koerper: 0, geschoben: 0, getragen: 0, abweichung: [], rufeAlt: 0, rufeNeu: 0, fern: 0 };
        for (let i = 0; i < n; i++) {
            const b = boxen[Math.floor(rng() * boxen.length)];
            const nahe = rng() < 0.8;
            const x = nahe ? b.minX - 0.5 + rng() * (b.maxX - b.minX + 1) : ox - 90 + rng() * 180;
            const z = nahe ? b.minZ - 0.5 + rng() * (b.maxZ - b.minZ + 1) : oz - 90 + rng() * 180;
            const h0 = r.getTerrainHeightAt(x, z);
            const feetY = rng() < 0.5 ? b.topY - 0.1 + rng() * 0.3 : (Number.isFinite(h0) ? h0 : 0) + rng() * 0.4;
            const headY = feetY + 1.8;
            let huelle = null;
            if (rng() < 0.3) {
                const w = rng() * Math.PI * 2;
                huelle = {
                    mitte: 0.3,
                    hl: 2.2,
                    hw: 0.9,
                    stufe: 0.25,
                    fX: Math.sin(w),
                    fZ: Math.cos(w),
                    qX: Math.cos(w),
                    qZ: -Math.sin(w),
                    unten: feetY + 0.2,
                    oben: feetY + 1.6,
                    schub: [],
                };
            }
            const lauf = (fn) => {
                st._wandKontaktNx = 0.123;
                st._wandKontaktNz = 0.456;
                const pos = { x, y: feetY, z };
                const h = huelle ? Object.assign({}, huelle, { schub: [] }) : null;
                rufe = 0;
                fern = 0;
                letzter = null;
                reichJetzt = (h ? Math.abs(h.mitte) + h.hl + h.hw : 0.35) + 1e-6;
                const top = fn(pos, feetY, headY, 0.35, h);
                return {
                    werte: [pos.x, pos.z, top, st._wandKontaktNx, st._wandKontaktNz, h ? h.schub.join(",") : ""],
                    rufe,
                    fern,
                };
            };
            const soll = lauf(alterLoeser);
            const ist = lauf((pos, f, hd, rad, h) => r._stepCharacterStructures(pos, f, hd, rad, h));
            R.koerper++;
            R.rufeAlt += soll.rufe;
            R.rufeNeu += ist.rufe;
            R.fern += ist.fern;
            if (soll.werte[0] !== x || soll.werte[1] !== z) R.geschoben++;
            if (Number.isFinite(soll.werte[2])) R.getragen++;
            const ab = soll.werte.map((v, k) => (Object.is(v, ist.werte[k]) ? null : k)).filter((k) => k !== null);
            if (ab.length) {
                R.abweichungen = (R.abweichungen || 0) + 1;
                if (R.abweichung.length < 3) R.abweichung.push({ koerper: [x, feetY, z, !!huelle], soll: soll.werte, ist: ist.werte });
            }
        }
        return R;
    };

    // DIE KONSISTENZ des Netzes gegen den Bestand`
);
// je Runde der Löser mit
for (const [nach, name] of [
    [`    aus.runden.push(runde("Ort", N));`, "Ort"],
    [`    aus.runden.push(runde("Abriss", N));`, "Abriss"],
    [`    aus.runden.push(runde("Neu gestempelt", N));`, "Neu gestempelt"],
    [`    aus.runden.push(runde("Neues Array", N));`, "Neues Array"],
    [`    aus.runden.push(runde("Neue Bäume", N));`, "Neue Bäume"],
])
    ers(nach, `${nach}\n    aus.loeser.push(loeserRunde("${name}", 800));`);
ers(`    const aus = { runden: [], konsistenz: [] };`, `    const aus = { runden: [], konsistenz: [], loeser: [] };`);
// das Urteil
ers(
    `    for (const [name, f] of S.konsistenz) for (const x of f) rot.push(\`(K) KONSISTENZ \${name}: \${x}\`);`,
    `    for (const L of S.loeser) {
        if (L.abweichungen)
            rot.push(
                \`(L) LÖSER \${L.name}: \${L.abweichungen} von \${L.koerper} Körpern lösen anders als die Schleife über den Bestand — \${JSON.stringify(L.abweichung.slice(0, 2))}\`
            );
        if (L.fern)
            rot.push(
                \`(L) LÖSER \${L.name}: \${L.fern} Löser-Rufe für Einträge, deren Hülle der Körper an seiner Stelle nicht erreicht (\${(L.rufeNeu / L.koerper).toFixed(1)} Rufe je Körper, vorher \${(L.rufeAlt / L.koerper).toFixed(1)}) — Rufer _stepCharacterStructures\`
            );
        if (L.geschoben < 50 || L.getragen < 50)
            rot.push(\`(L) \${L.name}: zu wenig Schübe oder Auflagen (\${L.geschoben} geschoben, \${L.getragen} getragen)\`);
    }
    for (const [name, f] of S.konsistenz) for (const x of f) rot.push(\`(K) KONSISTENZ \${name}: \${x}\`);`
);
// die Ausgabe
ers(
    `    console.log(
        \`  Decken-Probe am Ort:`,
    `    for (const L of S.loeser)
        console.log(
            \`  Löser \${L.name.padEnd(15)} \${L.koerper} Körper, \${L.geschoben} geschoben, \${L.getragen} getragen · \` +
                \`Löser-Rufe je Körper \${(L.rufeNeu / L.koerper).toFixed(1)} (vorher \${(L.rufeAlt / L.koerper).toFixed(1)}), fern \${L.fern} · \` +
                \`Abweichungen \${L.abweichungen || 0}\`
        );
    console.log(
        \`  Decken-Probe am Ort:`
);
fs.writeFileSync(p, s);
console.log("ok");
