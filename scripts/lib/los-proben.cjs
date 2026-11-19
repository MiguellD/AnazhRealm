"use strict";
// scripts/lib/los-proben.cjs — DIE LOSE ÜBERDECKEN SICH NIE (siedlung; w28-stadt-grammatik): die Proben der Settlement-Linse
// (`node scripts/diag-settlement.cjs`, Teil A am Tisch) am Los-Gesetz des Fachwerk-Kerns — `loseEntzerren` (nach reihenSnap und
// brandwand, am Grundriss des Slots), `grundrissTief`, `LOS_GESETZ`. Der Konsum-Leser am Gerät ist gate:kreatur-takt zielplan
// (die Lose des Plans stehen: jedes Haus, jede Rolle).

// FC = der Fachwerk-Kern, wie die Linse ihn am Tisch lädt (`studioKern`), check = ihr Prüfer (Name, bestanden, Detail)
function losProben(FC, check) {
    // DIE LOSE ÜBERDECKEN SICH NIE (fachwerk `loseEntzerren`, w28-stadt-grammatik): zwei Nachbarn (8 × 7 m), der zweite um
    // 0,3 rad gedreht und 7,6 m weiter — sie liegen ineinander; nach dem Gesetz berühren sie sich, das Haus mit der einzigen
    // Tür seiner Rolle steht, das Wohnhaus weicht. Die Zählung (`ueber`: je Paar der Slots die Tiefe über LOS_GESETZ.fugeM)
    // nennt ohne das Gesetz das Paar beim Namen (der Täter), und kein Export der Fälle unten trägt eins — noch einen Rest.
    const decken = () => [
        ["bergfried", "wohnhaus"].map((rolle) => ({ ext: { x0: -4, x1: 4, z0: -3.5, z1: 3.5 }, p: { rolle } })),
        [0, 7.6].map((cx, i) => ({ phi: i * 0.3, x: cx, z: 0, obb: { cx, cz: 0, phi: i * 0.3, ex: 4, ez: 3.5 } })),
    ];
    const ueber = (slots) =>
        slots.flatMap((a, i) =>
            slots.slice(i + 1).flatMap((b, k) => {
                const d = FC.grundrissTief(a.obb, b.obb).d;
                return d > FC.LOS_GESETZ.fugeM + 1e-9 ? [`Los ${i} ${a.rolle} × Los ${i + 1 + k} ${b.rolle} ${d.toFixed(2)} m`] : [];
            })
        );
    const alsSlots = ([B, q]) => q.map((x, i) => ({ obb: x.obb, rolle: B[i].p.rolle }));
    const tLos = ueber(alsSlots(decken()));
    check(
        "Los-Probe (Täter): zwei Lose, die ineinander liegen, nennt die Zählung beim Namen",
        tLos.length === 1 && /^Los 0 bergfried × Los 1 wohnhaus /.test(tLos[0]),
        tLos.join(" · ")
    );
    const [Bd, pd] = decken();
    const E = FC.loseEntzerren(Bd, pd, null);
    check(
        "Los-Probe: nach dem Gesetz berühren sie sich (1 Paar gerückt, kein Rest, die Zählung leer)",
        E.paare === 1 && !E.rest.length && !ueber(alsSlots([Bd, pd])).length,
        `paare ${E.paare} · rest ${E.rest.length} · tief ${FC.grundrissTief(pd[0].obb, pd[1].obb).d.toFixed(4)} m`
    );
    check(
        "Los-Probe: die einzige Tür einer Rolle steht, das Wohnhaus weicht (x und obb.cx kohärent)",
        pd[0].x === 0 && pd[0].z === 0 && Math.hypot(pd[1].x - 7.6, pd[1].z) > 0.3 && pd[1].x === pd[1].obb.cx && pd[1].z === pd[1].obb.cz,
        `Bergfried ${pd[0].x}/${pd[0].z} · Wohnhaus ${pd[1].x.toFixed(2)}/${pd[1].z.toFixed(2)}`
    );
    // die Fälle: die Stadt der Probe zielplan („dorf 7 30": 1 Paar 0,42 m), die Großstadt, die Klemme (seed 2 nH 120: ein
    // Wohnhaus zwischen zwei Festen, 0,25 m), ein Dorf
    const losFaelle = [[7, 30], [7, 60], [2, 120], [3, 12]].flatMap(([seed, nH]) => {
        const ex = FC.exportSettlement({ seed, nH });
        return ueber(ex.slots).concat((ex.loseRest || []).map((r) => `Rest ${r}`)).map((x) => `dorf ${seed} ${nH}: ${x}`);
    });
    check("Los-Probe: kein Export trägt zwei Lose, die ineinander liegen, und keinen Rest (4 Pläne)", losFaelle.length === 0, losFaelle.slice(0, 4).join(" · "));
}

// DIE HÜLLE LIEST KEINE ÖFFNUNG (los-huelle): das Los (`dorfLayout` über `exportSettlement`) liest je Haus die Hülle `ext` des
// Mass-Baus (fachwerk `massBau` → `koerperHuelle`) — nur den Baukörper, nie ein Teil mit der Marke `oeffnung` (Flügel, Rahmen,
// Bank, Bogen, Gitter, Tür) oder ein Flügel-/Türblatt. Befund vor dem Schnitt (p3/n1911/los): der zugestellte Flügel änderte `ext`
// an 476 von 519 Plan-Häusern und versetzte die Stadt 7/4750 um Median 90,9 m. Die Linse baut die Exporte der Fälle an drei
// Mutanten des Fenster-Baus (am Kern-Text, jede greift genau einmal je Stelle) und vergleicht je Same mit dem Golden
// (spec/asset-contract/v6/golden/siedlung-lose.json, gemintet nur ohne Datei): H1 die Hülle jedes Hauses gleich, H2 das Los
// (Lage, Gier) gleich. Der Täter des Selbsttests ist die Hülle vor dem Schnitt (Box3.setFromObject über den ganzen Mass-Bau) am
// zugestellten Flügel: ROT beim Namen. Leser: die Vorprüfung jeder Bau-Bahn (gate:settlement, check.yml Gruppe 18).
const OEFFNUNG_MUTANTEN = {
    "Flügel zu (0 statt 0,62 rad)": [
        ["L.rotation.y=(cz<0?0.62:-0.62)+", "L.rotation.y=0+"],
        ["L.rotation.y=(cx<0?-0.62:0.62)+", "L.rotation.y=0+"],
    ],
    // Rahmen vierfach tief: die doppelte Tiefe (Sturz, Pfosten 0,36 · Bank 0,48) reicht an keinem der 519 Plan-Häuser der Stadt 7/4750
    // über Dach und Sockel, auch nicht an der Hülle vor dem Schnitt (p3/n1911/los-huelle/vergleich.log) — sie wäre vakuös; vierfach an 94
    "Rahmen vierfach tief": [
        ["beam(g,cx,cy+h/2+0.05,cz,w+0.2,0.1,0.18,fr)", "beam(g,cx,cy+h/2+0.05,cz,w+0.2,0.1,0.72,fr)"],
        ["beam(g,cx,cy-h/2-0.05,cz,w+0.22,0.1,0.24,fr)", "beam(g,cx,cy-h/2-0.05,cz,w+0.22,0.1,0.96,fr)"],
        ["beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr);", "beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.72,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.72,fr);"],
        ["beam(g,cx,cy+h/2+0.05,cz,0.18,0.1,w+0.2,fr)", "beam(g,cx,cy+h/2+0.05,cz,0.72,0.1,w+0.2,fr)"],
        ["beam(g,cx,cy-h/2-0.05,cz,0.24,0.1,w+0.22,fr)", "beam(g,cx,cy-h/2-0.05,cz,0.96,0.1,w+0.22,fr)"],
        ["beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr);", "beam(g,cx,cy,cz-w/2-0.05,0.72,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.72,h+0.1,0.1,fr);"],
    ],
    "Läden an (offen, 0,45 m vor der Wand)": [
        ["beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr);", "beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx-w/2-0.12,cy,cz+(cz<0?-0.22:0.22),0.04,h,0.45,fr); beam(g,cx+w/2+0.12,cy,cz+(cz<0?-0.22:0.22),0.04,h,0.45,fr);"],
        ["beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr);", "beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr); beam(g,cx+(cx<0?-0.22:0.22),cy,cz-w/2-0.12,0.45,h,0.04,fr); beam(g,cx+(cx<0?-0.22:0.22),cy,cz+w/2+0.12,0.45,h,0.04,fr);"],
    ],
};
// der Täter: die Hülle vor dem Schnitt (an main f68dbf09 `var bx = new THREE.Box3().setFromObject(mass.g);`)
const HUELLE_TAETER = ["var bx = koerperHuelle(mass.g);", "var bx = new THREE.Box3().setFromObject(mass.g);"];
// die Fälle: die Stadt der Lose (Teil A, 1 Paar), die Großstadt, ein Dorf, ein Weiler
const LOSE_FAELLE = [
    { seed: 7, nH: 60 },
    { seed: 2, nH: 120 },
    { seed: 3, nH: 12 },
    { seed: 12345, nH: 6 },
];
// der Kern-Text mit den Ersetzungen R — oder das Wort, warum die Mutante nicht greift
function kernMutante(text, R) {
    let t = text;
    for (const [a, b] of R) {
        const n = t.split(a).length - 1;
        if (n !== 1) return { fehlt: `„${a.slice(0, 48)}…“ greift ${n}×` };
        t = t.replace(a, b);
    }
    return { text: t };
}
// ein Kern aus Text in diesem Prozess (dieselbe Engine THREE), ohne den geladenen zu verdrängen
function kernAusText(text, name) {
    const alt = globalThis.__fachwerkCore;
    delete globalThis.__fachwerkCore;
    try {
        require("vm").runInThisContext(text, { filename: `fachwerk-core.${name}.js` });
        return globalThis.__fachwerkCore;
    } finally {
        globalThis.__fachwerkCore = alt;
    }
}
const r4 = (v) => Math.round(v * 1e4) / 1e4;
// die Lose eines Kerns: je Fall je Haus [Same, x, z, phi] und die Hülle [x0, x1, z0, z1, y1] (auf 0,1 mm)
function loseVon(K) {
    const L = {};
    for (const dp of LOSE_FAELLE) {
        const ex = K.exportSettlement(dp);
        L[JSON.stringify(dp)] = ex.slots.map((s) => [s.seed, r4(s.x), r4(s.z), r4(s.phi), ["x0", "x1", "z0", "z1", "y1"].map((k) => r4(s.ext[k]))]);
    }
    return L;
}
// das Urteil gegen das Golden: `huelle` je Haus, dessen Hülle anders ist, `los` je Haus, das anders liegt (oder fehlt)
function loseUrteil(L, G) {
    const v = { huelle: [], los: [] };
    for (const k of Object.keys(G)) {
        const g = new Map(G[k].map((h) => [h[0], h]));
        const l = L[k] || [];
        if (l.length !== G[k].length) v.los.push(`${k}: ${l.length} statt ${G[k].length} Häuser`);
        for (const h of l) {
            const q = g.get(h[0]);
            if (!q) v.los.push(`${k} Same ${h[0]}: kein Haus im Golden`);
            else {
                if (h[4].some((x, i) => x !== q[4][i])) v.huelle.push(`${k} Same ${h[0]}: ext [${q[4]}] → [${h[4]}]`);
                if (h[1] !== q[1] || h[2] !== q[2] || h[3] !== q[3]) v.los.push(`${k} Same ${h[0]}: Los ${q[1]}/${q[2]} → ${h[1]}/${h[2]} (${Math.hypot(h[1] - q[1], h[2] - q[2]).toFixed(2)} m)`);
            }
        }
    }
    return v;
}
// die Linse: `kernText` der Text von fachwerk-core.js, `golden` {datei, lesen, schreiben}; im Selbsttest (`taeter`) die Hülle vor
// dem Schnitt am zugestellten Flügel — sie MUSS in H1 und H2 rot werden
function huelleProben(FC, check, { kernText, golden, taeter = false }) {
    const t0 = Date.now();
    const fs = require("fs");
    if (!fs.existsSync(golden.datei)) {
        golden.schreiben(loseVon(FC));
        console.log(`  🧊 Golden der Lose GEMINTET (${golden.datei}) — ab jetzt EINGEFROREN.`);
    }
    const G = golden.lesen();
    const zu = Object.keys(OEFFNUNG_MUTANTEN)[0];
    if (taeter) {
        const T = [HUELLE_TAETER, ...OEFFNUNG_MUTANTEN[zu]];
        const m = kernMutante(kernText, T);
        const Lt = m.text ? loseVon(kernAusText(m.text, "taeter")) : null;
        const v = Lt ? loseUrteil(Lt, G) : null;
        check(
            `Selbst-Test Hülle: die Hülle vor dem Schnitt (setFromObject über den ganzen Mass-Bau) am Mutanten „${zu}“ fällt in H1 und H2 beim Namen`,
            !!v && v.huelle.length > 0 && v.los.length > 0,
            m.fehlt || `H1 ${v.huelle.length} Häuser (${v.huelle[0] || "—"}) · H2 ${v.los.length} (${v.los[0] || "—"})`
        );
        // keine Mutante ist vakuös: an der Hülle des Täters (Flügel zu — sonst deckt der offene Flügel jedes andere Teil) reicht
        // jede andere Mutante in die Hülle wenigstens eines Hauses
        for (const [name, R] of Object.entries(OEFFNUNG_MUTANTEN).slice(1)) {
            const mm = Lt && kernMutante(m.text, R);
            const w = mm && mm.text ? loseUrteil(loseVon(kernAusText(mm.text, "taeter-" + name)), Lt) : null;
            check(`Selbst-Test Hülle: die Mutante „${name}“ greift an der Hülle des Täters (nicht vakuös)`, !!w && w.huelle.length > 0, (mm && mm.fehlt) || (w ? `H1 ${w.huelle.length} Häuser (${w.huelle[0] || "—"})` : "kein Täter"));
        }
        console.log(`  Hülle/Los Selbsttest: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        return;
    }
    const v0 = loseUrteil(loseVon(FC), G);
    check(
        `Los je Same wie am Golden (H2, ${LOSE_FAELLE.length} Fälle): der Kern legt jedes Haus wie das Golden`,
        !v0.los.length && !v0.huelle.length,
        v0.los.concat(v0.huelle).slice(0, 3).join(" · ")
    );
    for (const [name, R] of Object.entries(OEFFNUNG_MUTANTEN)) {
        const m = kernMutante(kernText, R);
        const v = m.text ? loseUrteil(loseVon(kernAusText(m.text, name)), G) : null;
        check(`Hülle liest keine Öffnung (H1) und das Los bleibt (H2) am Mutanten „${name}“`, !!v && !v.huelle.length && !v.los.length, m.fehlt || v.huelle.concat(v.los).slice(0, 3).join(" · "));
    }
    console.log(`  Hülle/Los: ${LOSE_FAELLE.length} Fälle × ${1 + Object.keys(OEFFNUNG_MUTANTEN).length} Kerne · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

module.exports = { losProben, huelleProben, OEFFNUNG_MUTANTEN, HUELLE_TAETER, LOSE_FAELLE, kernMutante, kernAusText, loseVon, loseUrteil };
