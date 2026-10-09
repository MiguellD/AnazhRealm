// 0710-4 Klasse 1: EINE Masse-Quelle im Wirt (_leibMasse, _fahrMasse), STOSS ohne Dichten.
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 90));
    s = s.replace(a, b);
}
// (a) _fahrGesetz: masseDichte
ers(
    `        Number.isFinite(vc.A_PITCH_MAX) &&
        Number.isFinite(vc.A_LAT_MAX)
    ) {
        AnazhRealm._fahrGesetzMemo = {
            he,
            pitchGain: F.pitchGain,
            rollGain: F.rollGain,
            aPitchMax: vc.A_PITCH_MAX,
            aLatMax: vc.A_LAT_MAX,
        };`,
    `        Number.isFinite(vc.A_PITCH_MAX) &&
        Number.isFinite(vc.A_LAT_MAX) &&
        F.masseDichte > 0
    ) {
        AnazhRealm._fahrGesetzMemo = {
            he,
            pitchGain: F.pitchGain,
            rollGain: F.rollGain,
            aPitchMax: vc.A_PITCH_MAX,
            aLatMax: vc.A_LAT_MAX,
            // die Masse des Wagens: das Volumen des Kerns (carPhys, im Fahr-Satz G.m) mal dieser Dichte (0710-4)
            masseDichte: F.masseDichte,
        };`
);
ers(
    `    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.hostEmergent");`,
    `    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.hostEmergent / FAHR.masseDichte");`
);
// (b) STOSS ohne Dichten + Leib-Gesetz + Volumen
ers(
    `AnazhRealm.STOSS = Object.freeze({
    dichteLeib: 1000, // kg/m³: ein Leib wiegt sein Volumen Wasser
    // kg je m³ Hüll-Volumen eines Wagens: der Kern (carPhys) trägt die Masse als Länge · Spur · Dach in m³ (darauf ist
    // sein Schub geeicht) — die Rohdichte macht sie zu kg (ein GT 4,6 × 1,6 × 1,3 m ≈ 1,4 t)
    dichteWagen: 150,
    stossZahl:`,
    `AnazhRealm.STOSS = Object.freeze({
    stossZahl:`
);
ers(
    `// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {`,
    `// DIE MASSE KOMMT AUS DEM KERN (0710-4): der Wirt hält keine Dichte. Tier · Mensch · Wagen tragen ihre Dichte in ihrem
// Gesetzbuch (tetrapoda MASSSTAB.dichteKgM3 · koerper LEIB.dichteKgM3 · vehicle FAHR.masseDichte), das Volumen ist ihre
// Gestalt (\`_leibVolumen\` der geschlossenen Haut, carPhys des Wagens). Bis 0710-4 hielt STOSS zwei Studio-Größen
// (dichteLeib 1000 über eine Kapsel aus der Hüft-Höhe — der Hirsch wog 436 kg, der Bär 255 —, dichteWagen 150).
AnazhRealm.LEIB_KLASSEN = Object.freeze(["fell", "haut"]); // die Material-Klassen der geschlossenen Haut eines Leibs
AnazhRealm._leibGesetz = function () {
    if (AnazhRealm._leibGesetzMemo) return AnazhRealm._leibGesetzMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const K = typeof globalThis !== "undefined" ? globalThis.__koerperCore : null;
    const tier = T && T.MASSSTAB ? T.MASSSTAB.dichteKgM3 : NaN;
    const mensch = K && K.LEIB ? K.LEIB.dichteKgM3 : NaN;
    if (!(tier > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:MASSSTAB.dichteKgM3");
    if (!(mensch > 0)) return AnazhRealm._kernPflichtBruch("koerper:LEIB.dichteKgM3");
    AnazhRealm._leibGesetzMemo = Object.freeze({ tier, mensch });
    return AnazhRealm._leibGesetzMemo;
};
// Das Volumen einer GESCHLOSSENEN Fläche (m³ im Rahmen ihrer Geometrie) über den Divergenz-Satz, Σ a · (b × c) / 6 je
// Dreieck — und ob sie geschlossen ist (jede Kante genau zweimal). Eine offene Fläche (Mähne, Strähnen) hat kein Volumen.
AnazhRealm._geschlossenesVolumen = function (geo) {
    const pos = geo && geo.attributes && geo.attributes.position;
    if (!pos) return { v: 0, geschlossen: false };
    const p = pos.array;
    const ix = geo.index ? geo.index.array : null;
    const n = ix ? ix.length : pos.count;
    const N = pos.count;
    const kanten = new Map();
    let v = 0;
    for (let t = 0; t + 2 < n; t += 3) {
        const a = ix ? ix[t] : t;
        const b = ix ? ix[t + 1] : t + 1;
        const c = ix ? ix[t + 2] : t + 2;
        const ax = p[3 * a];
        const ay = p[3 * a + 1];
        const az = p[3 * a + 2];
        const bx = p[3 * b];
        const by = p[3 * b + 1];
        const bz = p[3 * b + 2];
        const cx = p[3 * c];
        const cy = p[3 * c + 1];
        const cz = p[3 * c + 2];
        v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
        for (let k = 0; k < 3; k++) {
            const u = k === 0 ? a : k === 1 ? b : c;
            const w = k === 0 ? b : k === 1 ? c : a;
            const key = u < w ? u * N + w : w * N + u;
            kanten.set(key, (kanten.get(key) || 0) + 1);
        }
    }
    let geschlossen = kanten.size > 0;
    for (const z of kanten.values())
        if (z !== 2) {
            geschlossen = false;
            break;
        }
    return { v: Math.abs(v), geschlossen };
};
// DAS VOLUMEN EINER GESTALT (m³ im Rahmen \`rahmen\`): die geschlossene Haut (LEIB_KLASSEN) unter \`teil\` — die Nah-Gestalt,
// nie die Fern-Gestalt daneben. Offene Teile und der Schalen-Stapel des Fells (\`fellSchale\`: N Kopien der Haut) tragen
// keine Masse. Je Geometrie gemerkt (jede Kreatur teilt die Geometrien ihrer Vorlage). Gemessen bei Größe 1: Fuchs 0,015 ·
// Wolf 0,064 · Hirsch 0,094 · Bär 0,335 · Mensch 0,100 m³.
AnazhRealm._leibVolumen = function (teil, rahmen) {
    if (!teil || typeof THREE === "undefined") return 0;
    const memo = AnazhRealm._leibVolumenMemo || (AnazhRealm._leibVolumenMemo = new WeakMap());
    const r = rahmen || teil;
    r.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(r.matrixWorld).invert();
    const m = new THREE.Matrix4();
    let v = 0;
    teil.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
        if (!AnazhRealm.LEIB_KLASSEN.includes(kl)) return;
        let g = memo.get(o.geometry);
        if (!g) {
            g = AnazhRealm._geschlossenesVolumen(o.geometry);
            memo.set(o.geometry, g);
        }
        if (!g.geschlossen) return;
        m.multiplyMatrices(inv, o.matrixWorld);
        v += g.v * Math.abs(m.determinant());
    });
    return v;
};
// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {`
);
// (c) creature builder
ers(
    `                bein: AnazhRealm._tierBeinMass(t0, f2),
                wrap: wrap2,
                fern: wrap3,
            };
            return group2;`,
    `                bein: AnazhRealm._tierBeinMass(t0, f2),
                wrap: wrap2,
                fern: wrap3,
                // das Volumen der Gestalt bei Größe 1 (m³, die Nah-Gestalt im Rahmen des Tiers) — die Masse liest es
                leibV: AnazhRealm._leibVolumen(wrap2, group2),
            };
            return group2;`
);
// (d) human rig + group
ers(
    `        return { mesh: wrap, rig, kh, bones: [] };
    }`,
    `        wrap.userData._leibNah = klon; // die Nah-Gestalt (die Masse misst ihre Haut, nie die Fern-Gestalt)
        return { mesh: wrap, rig, kh, bones: [] };
    }`
);
ers(
    `            attachMesh(built.mesh); // der Baum steht sofort (sync — kein async-Pfad mehr)`,
    `            attachMesh(built.mesh); // der Baum steht sofort (sync — kein async-Pfad mehr)
            // das Volumen der Gestalt (m³ im Rahmen des Avatars) — die Masse des Menschen liest es (_leibMasse)
            group.userData._leibV = AnazhRealm._leibVolumen(
                (built.mesh.userData && built.mesh.userData._leibNah) || built.mesh,
                group
            );`
);
// (e) _leibMasse statt _kreaturMasse
ers(
    `    // DIE MASSE DES LEIBS (das EINE Impuls-Gesetz, AnazhRealm.STOSS): die Kapsel \`_kreaturLeib\` — der Rumpf 2·halb lang
    // mit dem Radius, die Enden Halbkugeln — mal der Dichte des Gewebes. Dieselbe Gestalt, mit der jeder Kontakt löst.
    _kreaturMasse(creature) {
        const lb = this._kreaturLeib(creature, 0, this._kreaturMasseLeib || (this._kreaturMasseLeib = {}));
        const r = lb.radius;
        return AnazhRealm.STOSS.dichteLeib * Math.PI * r * r * (2 * lb.halb + (4 / 3) * r);
    }`,
    `    // DIE MASSE EINES LEIBS (kg, das EINE Impuls-Gesetz AnazhRealm.STOSS): das Volumen seiner Gestalt (die geschlossene
    // Haut, \`_leibVolumen\`, bei Größe 1 gemessen) × Skala³ × die Dichte seines Kerns — ein Tier (\`_tierBaum.leibV\`,
    // tetrapoda) oder ein Mensch (\`userData._leibV\` am Avatar oder an einem Kind, koerper). Fail-closed: ein Leib ohne
    // gemessene Gestalt bricht laut. Vorher: eine Kapsel aus der Hüft-Höhe × 1000 im Wirt (Bär 255 kg, Hirsch 436 kg).
    _leibMasse(koerper) {
        const LG = AnazhRealm._leibGesetz();
        const tb = koerper && koerper.userData ? koerper.userData._tierBaum : null;
        const sk = this._leibMasseSkala || (this._leibMasseSkala = new THREE.Vector3());
        if (tb && tb.leibV > 0) {
            koerper.getWorldScale(sk);
            return tb.leibV * sk.x * sk.y * sk.z * LG.tier;
        }
        let avatar = null;
        if (koerper && typeof koerper.traverse === "function")
            koerper.traverse((o) => {
                if (!avatar && o.userData && o.userData._leibV > 0) avatar = o;
            });
        if (avatar) {
            avatar.getWorldScale(sk);
            return avatar.userData._leibV * sk.x * sk.y * sk.z * LG.mensch;
        }
        return AnazhRealm._kernPflichtBruch("leib:Gestalt ohne Volumen (" + ((koerper && koerper.name) || "?") + ")");
    }

    // DIE MASSE EINES WAGENS (kg): das Volumen seines Fahr-Satzes (carPhys des Kerns, G.m in m³) × FAHR.masseDichte.
    _fahrMasse(G) {
        return G && G.m > 0 ? G.m * AnazhRealm._fahrGesetz().masseDichte : 0;
    }`
);
// (g) uses
ers(`            const mT = this._kreaturMasse(creature);`, `            const mT = this._leibMasse(creature);`);
ers(
    `        const mW = entry._fahrSatz && entry._fahrSatz.m > 0 ? entry._fahrSatz.m * ST.dichteWagen : 0;`,
    `        const mW = this._fahrMasse(entry._fahrSatz);`
);
ers(
    `            const mG = leib ? this._kreaturMasse(q) : wagenG ? wagenG.m * ST.dichteWagen : Infinity;`,
    `            const mG = leib ? this._leibMasse(q) : wagenG ? this._fahrMasse(wagenG) : Infinity;`
);
fs.writeFileSync(p, s);
console.log("ok");
