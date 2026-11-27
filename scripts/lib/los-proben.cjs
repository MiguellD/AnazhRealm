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
        ["L.rotation.y=(cz<0?FLUEGEL_WINKEL:-FLUEGEL_WINKEL)+", "L.rotation.y=0+"],
        ["L.rotation.y=(cx<0?-FLUEGEL_WINKEL:FLUEGEL_WINKEL)+", "L.rotation.y=0+"],
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
    // Tür achtfach: vierfach (Stock 1,04 m) bleibt an keinem der 519 Plan-Häuser vor der Treppe, auch an der Hülle des Täters (p3/n1911/los-huelle/vergleich.log)
    "Türstock und Sturz achtfach tief": [
        ["beam(g,-doorW/2-0.06,cy,-Dp/2,0.14,doorH+0.12,0.26,'holz'); beam(g,doorW/2+0.06,cy,-Dp/2,0.14,doorH+0.12,0.26,'holz');", "beam(g,-doorW/2-0.06,cy,-Dp/2,0.14,doorH+0.12,2.08,'holz'); beam(g,doorW/2+0.06,cy,-Dp/2,0.14,doorH+0.12,2.08,'holz');"],
        ["beam(g,0,baseY+doorH+0.05,-Dp/2,doorW+0.36,0.16,0.26,'holz');", "beam(g,0,baseY+doorH+0.05,-Dp/2,doorW+0.36,0.16,2.08,'holz');"],
        ["beam(g,bcx-bw2/2-0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz'); beam(g,bcx+bw2/2+0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz');", "beam(g,bcx-bw2/2-0.06,bcy,Dp/2,0.13,doorH+0.06,1.92,'holz'); beam(g,bcx+bw2/2+0.06,bcy,Dp/2,0.13,doorH+0.06,1.92,'holz');"],
        ["beam(g,bcx,baseY+doorH+0.0,Dp/2,bw2+0.32,0.14,0.24,'holz');", "beam(g,bcx,baseY+doorH+0.0,Dp/2,bw2+0.32,0.14,1.92,'holz');"],
    ],
    "Läden an (offen, 0,45 m vor der Wand)": [
        ["beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr);", "beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx-w/2-0.12,cy,cz+(cz<0?-0.22:0.22),0.04,h,0.45,fr); beam(g,cx+w/2+0.12,cy,cz+(cz<0?-0.22:0.22),0.04,h,0.45,fr);"],
        ["beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr);", "beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr); beam(g,cx+(cx<0?-0.22:0.22),cy,cz-w/2-0.12,0.45,h,0.04,fr); beam(g,cx+(cx<0?-0.22:0.22),cy,cz+w/2+0.12,0.45,h,0.04,fr);"],
    ],
};
// der Täter: die Hülle vor dem Schnitt (an main f68dbf09 `var bx = new THREE.Box3().setFromObject(mass.g);`) — die Box über den ganzen
// Mass-Bau; sie trägt die Reichweite der Öffnungen (`reich`, los-huelle-2) weiter, die `brandwand` liest
const HUELLE_TAETER = ["var bx = koerperHuelle(mass.g);", "var bx = koerperHuelle(mass.g).setFromObject(mass.g);"];
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
// DER ZENSUS DER TEILBAUM-KLASSEN (H1b, los-huelle): je Mass-Bau (die Plan-Häuser der Fälle und je Haus-Rezept eins) jedes Mesh
// in seiner Klasse „Teilsystem/Art“ — Art `fluegel` (unter einem Fenster-Flügel `window`), `blatt` (unter einem Türblatt `door`),
// `marke` (unter der Marke `oeffnung`), sonst `koerper`. Ein Körper-Mesh, das an einer Öffnung des Baus (die Lichter `H.licht`,
// die Haus- und Hintertür `dims.tuer`, die Tore und Türen der Anbauten `H.annexDoors`) vor die Wand ragt (> ÖFFNUNG_VOR m, im
// Feld der Öffnung ± ÖFFNUNG_RAND m ganz, an der Wand sitzend: die innere Kante ≤ 0,05 m davor) und nicht in einer Masse der Erschließung liegt (Treppe,
// Stufe, Sockel, Vordach: addMasse), ist ein UNMARKIERTES Öffnungs-Teil — die Linse nennt es mit Klasse, Rezept und Öffnung.
const OEFFNUNG_VOR = 0.07,
    OEFFNUNG_RAND = 0.35,
    OEFFNUNG_WEIT = 0.8, // weiter vor der Wand steht ein Bau (Balkon, Laube, Portikus), kein Teil der Öffnung: der offene Flügel ragt ≤ 0,58 × 1,1 m
    ERSCHLIESSUNG = new Set(["treppe", "stufe", "sockel", "vordach"]),
    GLAS = new Set(["glas", "glasdunkel"]), // Glas trägt nur die Öffnung: jedes Glas ohne Marke ist ein Teil der Öffnung
    RAHMEN = new Set(["holz", "metall", "stein"]); // die Rollen von Stock, Sturz, Bank, Gitter und Schwelle — die Wand des Stils trägt eigene Rollen
function zensusBauten(FC) {
    const hps = [];
    for (const dp of LOSE_FAELLE) for (const hp of FC.DORF(dp).houses) hps.push(["dorf " + dp.seed + "/" + dp.nH, hp]);
    for (const id of Object.keys(FC.PRESETS).filter((k) => /^haus_/.test(k))) hps.push([id, FC.hausParams(FC.PRESETS[id], null)]);
    return hps;
}
function oeffnungsZensus(K, hps) {
    const THREE = globalThis.THREE;
    const klassen = {},
        frei = [];
    let gestapelt = 0;
    const b = new THREE.Box3();
    for (const [wer, hp] of hps) {
        // der Mass-Bau im Rollen-Harness (wie gate:fachwerk-contract): jedes Mesh trägt die Rolle seines Baus (`__role`)
        if ((hp.storeys || 1) > 11) {
            gestapelt++; // der Stapel über 11 Geschossen: sein Aufsatz trägt eigene Öffnungen ohne Liste im Basis-Bau
            continue;
        }
        const H = K.HAUS(THREE, (r) => ({ __role: r }), Object.assign({}, hp, { nur: K.MASSNUR, __nurMass: true })),
            D = H.dims,
            G = H.build(K.LOD1F);
        G.updateMatrixWorld(true);
        const KM = (H.masse || []).filter((m) => !ERSCHLIESSUNG.has(m.art));
        // die Außenseite einer Öffnung: weg von der Mitte der Masse, an deren Rand sie liegt (Haupthaus, Turm, Hofarm …)
        const aussen = (perp, wand, c) => {
            const m = KM.find((m) => (perp === "z" ? Math.min(Math.abs(wand - m.z0), Math.abs(wand - m.z1)) < 0.35 && c >= m.x0 - 0.3 && c <= m.x1 + 0.3 : Math.min(Math.abs(wand - m.x0), Math.abs(wand - m.x1)) < 0.35 && c >= m.z0 - 0.3 && c <= m.z1 + 0.3));
            return m ? (wand > (perp === "z" ? (m.z0 + m.z1) / 2 : (m.x0 + m.x1) / 2) ? 1 : -1) : wand < 0 ? -1 : 1;
        };
        const O = (H.licht || []).map((l) => ({ c: l.perp === "z" ? l.cx : l.cz, wand: l.perp === "z" ? l.cz : l.cx, perp: l.perp, cy: l.cy, w: l.w, h: l.h, art: l.glas ? "fenster" : "tür" }));
        if (D.tuer) {
            O.push({ c: D.tuer.x, wand: D.tuer.z, perp: "z", cy: D.tuer.y + D.tuer.h / 2, w: D.tuer.w, h: D.tuer.h, art: "haustür" });
            if (D.tuer.hinten) O.push({ c: D.tuer.hinten.x, wand: D.tuer.hinten.z, perp: "z", cy: D.tuer.y + D.tuer.h / 2, w: D.tuer.hinten.w, h: D.tuer.h, art: "hintertür" });
        }
        for (const a of H.annexDoors || []) O.push({ c: (a.x0 + a.x1) / 2, wand: a.z, perp: "z", cy: (a.y0 + a.y1) / 2, w: a.x1 - a.x0, h: a.y1 - a.y0, art: a.kind });
        for (const q of O) q.s = aussen(q.perp, q.wand, q.c);
        const M = (H.masse || []).filter((m) => ERSCHLIESSUNG.has(m.art));
        for (const [sub, grp] of Object.entries(H.subsystems)) {
            (function lies(o, art) {
                const u = o.userData || {};
                art = art || (u.window ? "fluegel" : u.door ? "blatt" : u.oeffnung ? "marke" : null);
                if (o.geometry) {
                    const k = `${sub}/${art || "koerper"}`;
                    klassen[k] = (klassen[k] || 0) + 1;
                    const rolle = (o.material && o.material.__role) || "?";
                    if (!art && GLAS.has(rolle)) frei.push(`${sub}/${rolle}: Glas ohne Marke (${wer})`);
                    else if (!art && RAHMEN.has(rolle)) {
                        if (o.geometry.boundingBox === null) o.geometry.computeBoundingBox();
                        b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
                        const inMasse = M.some((m) => b.min.x >= m.x0 - 0.05 && b.max.x <= m.x1 + 0.05 && b.min.z >= m.z0 - 0.05 && b.max.z <= m.z1 + 0.05);
                        for (const q of O) {
                            if (inMasse) break;
                            const [a0, a1] = q.perp === "z" ? [b.min.x, b.max.x] : [b.min.z, b.max.z];
                            const [w0, w1] = q.perp === "z" ? [b.min.z, b.max.z] : [b.min.x, b.max.x];
                            const s = q.s;
                            const vor = s > 0 ? w1 - q.wand : q.wand - w0,
                                fuss = s > 0 ? w0 - q.wand : q.wand - w1; // die innere Kante: das Teil sitzt an der Wand (≤ 0,05 m davor)
                            if (a0 >= q.c - q.w / 2 - OEFFNUNG_RAND && a1 <= q.c + q.w / 2 + OEFFNUNG_RAND && b.min.y >= q.cy - q.h / 2 - OEFFNUNG_RAND && b.max.y <= q.cy + q.h / 2 + OEFFNUNG_RAND + 0.15 && fuss <= 0.05 && vor > OEFFNUNG_VOR && vor <= OEFFNUNG_WEIT) {
                                frei.push(`${sub}/${rolle} an ${q.art} (${wer}, ${vor.toFixed(2)} m vor der Wand, ${[b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z].map((v) => v.toFixed(2)).join("×")} m bei y ${b.min.y.toFixed(2)})`);
                                break;
                            }
                        }
                    }
                }
                for (const c of o.children) lies(c, art);
            })(grp, null);
        }
        G.traverse((o) => o.geometry && o.geometry.dispose && o.geometry.dispose());
    }
    return { klassen, frei, n: hps.length, gestapelt };
}
// der Täter des Zensus: der Fenster-Bau und die Haustür ohne die Marke (wie vor dem Schnitt)
const MARKE_TAETER = {
    "Fenster ohne Marke": [["return oeffnung(g,()=>fensterTeile(g,cx,cy,cz,w,h,horiz,capY));", "return fensterTeile(g,cx,cy,cz,w,h,horiz,capY);"]],
    "Haustür ohne Marke": [["    oeffnung(g,()=>{   // die Haustür als Öffnung", "    ((f)=>f())(()=>{   // die Haustür als Öffnung"]],
};
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
        const hps = zensusBauten(FC);
        for (const [name, R] of Object.entries(MARKE_TAETER)) {
            const mm = kernMutante(kernText, R);
            const Z = mm.text ? oeffnungsZensus(kernAusText(mm.text, "marke-" + name), hps) : null;
            check(`Selbst-Test Hülle H1b: „${name}“ — der Zensus nennt die unmarkierten Öffnungs-Teile beim Namen`, !!Z && Z.frei.length > 0, mm.fehlt || `${Z.frei.length} — ${Z.frei.slice(0, 2).join(" · ")}`);
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
    const Z = oeffnungsZensus(FC, zensusBauten(FC));
    const kl = Object.entries(Z.klassen).sort();
    check(
        `Hülle liest keine Öffnung je Teilbaum-Klasse (H1b, ${Z.n - Z.gestapelt} Mass-Bauten): kein Körper-Mesh ragt an einer Öffnung vor die Wand`,
        !Z.frei.length,
        `${Z.frei.length} — ${Z.frei.slice(0, 4).join(" · ")}`
    );
    console.log(`  Klassen (${kl.length}): ${kl.map(([k, n]) => k + " " + n).join(" · ")}`);
    console.log(`  Hülle/Los: ${LOSE_FAELLE.length} Fälle × ${1 + Object.keys(OEFFNUNG_MUTANTEN).length} Kerne + Zensus ${Z.n} Bauten (${Z.gestapelt} gestapelt, ohne Liste) · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

// DER WÜRFEL JE LOS (Welle SAMEN, los-wurf): jedes Los zieht Zeiger-Wahl, Versatz, Fuge und Scheunen-Stand aus seinem EIGENEN
// Strom (fachwerk `dorfLayout`, samen-core `samenBaum(seed)("los:<i>")`) — eine Front, die sich ändert, würfelt kein anderes Los neu.
// Die Linse ändert je Fall jedes Los um jedes WURF_DELTAS (die Breite seiner Front, die Mitte bleibt; der Haken `__losStoer` am Ruf von
// dorfLayout, sonst der Kern Zeichen für Zeichen) und zählt je Probe die ANDEREN Häuser, die fehlen, hinzukommen, weiter als
// WURF_WANDER m wandern oder sich drehen. Bis zur Welle zogen alle Lose aus dem EINEN Strom `rnd`: kippte ein Los an einer Probe,
// stand Same 431794 85 m weiter (p3/n1911/los-huelle/ursache). Der Täter des Selbsttests ist dieser EINE Strom: ROT beim Los.
// die Stadt der Grammatik 7/30 (ummauert, Markt, Viertel): an ihr kippt der EINE Strom (main 92b7afd07: -5 cm an 7 von 37 Losen 13
// Häuser, +1 cm an 2 Losen 2), und dort kreuzt bei -5 cm und +1 cm keine Front eine Schwelle des GESETZES (eine Probe des Setzers,
// der Versuch zu 1,1 m, die Kirche als Anker ihres Viertels) — die Linse misst den Würfel allein. Wo eine Front eine Schwelle kreuzt
// (7/18 -5 cm an der Kirche: 15 Häuser, 7/60 -5 cm Los 10: 41), rückt das Gesetz, nicht der Wurf (p3/n1911/samen/messung-26baeab7/
// loswurf-final.log); die Dörfer 3/12 und 12345/6 kippen auch am EINEN Strom nie.
// das Dorf 35/24 (bau-funktion): seit die Rolle ihre Anbauten in die Masse trägt (Chor, Beschlagstand, Schlot, Erker) rücken die Lose
// der Stadt 7/30, dort beißt der Snap der harten Kante nicht mehr; an 35/24 beißt er, das Gesetz rückt dort nicht (Suche 1..40 × nH 24)
const WURF_FAELLE = [{ seed: 7, nH: 30 }, { seed: 35, nH: 24 }]; // prettier-ignore
const [WURF_DELTAS, WURF_WANDER] = [[-0.05, 0.01], 0.5];
const LOS_HAKEN = ["var L = dorfLayout(p, ext.slice(von, bis), ", "var L = dorfLayout(p, (globalThis.__losStoer || function (e) { return e; })(ext.slice(von, bis), von), "]; // prettier-ignore
const WURF_TAETER = [
    ["const g=plan.houses[i], wurf=losWurf(i);", "const g=plan.houses[i], wurf=rnd;"],
    ["    const wurf=losWurf(i);", "    const wurf=rnd;"],
];
const WURF_ENG_TAETER = [["if(stadt&&cu.eng+ENG_FUGE<=2*exH) return null;", "if(stadt&&cu.eng<=2*exH) return null;"]];
const WURF_SNAP_TAETER = [["const zug=(Math.abs(lx)-soll)/2*Math.min(1,(1.8-fuge)/0.3), s2=Math.sign(lx);", "const zug=(Math.abs(lx)-soll)/2, s2=Math.sign(lx);"]];
// je Fall und Los: die anderen Häuser, die anders stehen, beim Namen (Same#n)
function wurfAnders(K) {
    const out = [];
    const haeuser = (ex) => {
        const n = {};
        return new Map(ex.slots.map((s) => [s.seed + "#" + (n[s.seed] = (n[s.seed] || 0) + 1), s]));
    };
    for (const dp of WURF_FAELLE) {
        globalThis.__losStoer = null;
        const H0 = haeuser(K.exportSettlement(dp)),
            lose = K.DORF(dp).houses;
        for (const delta of WURF_DELTAS) lose.forEach((h, k) => {
            globalThis.__losStoer = (ext, von) => ext.map((e, j) => (j + von === k ? Object.assign({}, e, { x0: e.x0 - delta / 2, x1: e.x1 + delta / 2 }) : e)); // prettier-ignore
            const H1 = haeuser(K.exportSettlement(dp));
            globalThis.__losStoer = null;
            for (const key of new Set([...H0.keys(), ...H1.keys()])) {
                if (key.startsWith(h.seed + "#")) continue;
                const [a, b] = [H0.get(key), H1.get(key)];
                const d = a && b ? Math.hypot(a.x - b.x, a.z - b.z) : Infinity;
                if (!(d <= WURF_WANDER) || Math.abs(Math.atan2(Math.sin(a.phi - b.phi), Math.cos(a.phi - b.phi))) > 0.05)
                    out.push(`dorf ${dp.seed}/${dp.nH} Los ${k} (${h.rolle}) ${delta * 100} cm → ${key} ${a && b ? d.toFixed(2) + " m" : a ? "fällt" : "kommt"}`);
            }
        });
    }
    return out;
}
function wurfProben(check, { kernText, taeter = false }) {
    const t0 = Date.now();
    const m = kernMutante(kernText, taeter ? [LOS_HAKEN, ...WURF_TAETER] : [LOS_HAKEN]);
    const v = m.text ? wurfAnders(kernAusText(m.text, taeter ? "wurf-taeter" : "wurf")) : null;
    const n = WURF_FAELLE.map((dp) => dp.seed + "/" + dp.nH).join(", ");
    if (taeter)
        check(`Selbst-Test Würfel je Los: der EINE Strom (jedes Los zieht aus rnd) fällt beim Los (${n})`, !!v && v.length > 0, m.fehlt || `${v.length} — ${v.slice(0, 2).join(" · ")}`);
    else
        check(`Würfel je Los (${n}): eine Front ${WURF_DELTAS.map((d) => d * 100).join(" / ")} cm würfelt kein anderes Haus neu (fehlt · kommt · wandert > ${WURF_WANDER} m)`, !!v && !v.length, m.fehlt || `${v.length} — ${v.slice(0, 3).join(" · ")}`);
    if (taeter) {
        // die Breite eines anderen Loses ohne Fuge (vor w28-bau-rezept-tuer): bei gleicher Breite urteilt sein Zentimeter
        const mE = kernMutante(kernText, [LOS_HAKEN, ...WURF_ENG_TAETER]);
        const vE = mE.text ? wurfAnders(kernAusText(mE.text, "wurf-eng")) : null;
        check(`Selbst-Test Würfel je Los: die Breite eines anderen Loses ohne Fuge (eng) fällt beim Los (${n})`, !!vE && vE.length > 0, mE.fehlt || `${vE.length} — ${vE.slice(0, 2).join(" · ")}`);
        // der Snap der Reihe mit der harten Kante bei 1,8 m (vor w28-bau-rezept-tuer): 5 cm Front rücken den Nachbarn um 0,86 m
        const mS = kernMutante(kernText, [LOS_HAKEN, ...WURF_SNAP_TAETER]);
        const vS = mS.text ? wurfAnders(kernAusText(mS.text, "wurf-snap")) : null;
        check(`Selbst-Test Würfel je Los: der Snap der Reihe mit harter Kante fällt beim Los (${n})`, !!vS && vS.length > 0, mS.fehlt || `${vS.length} — ${vS.slice(0, 2).join(" · ")}`);
    }
    console.log(`  Würfel je Los${taeter ? " (Täter)" : ""}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}


// DIE ÖFFNUNG REICHT NIE IN DEN NACHBARN (B1, los-huelle-2): je Fall (LOSE_FAELLE) je Slot die Reichweite seiner Öffnungen über die
// Körper-Hülle je Seite — die Hülle MIT Öffnung (der Mass-Bau unter HUELLE_TAETER, Box3 über den ganzen Bau) − die Körper-Hülle
// (`massBau`), auf einer Brandwand-Seite 0 (dort baut das Haus keine Öffnung). Gezählt wird jedes Paar (A, B), deren Körper sich nicht
// > 1 cm durchdringen und bei dem A samt der Reichweite seiner Seite zu B > 1 cm in den Körper von B ragt (Grundriss, SAT über die
// vier Achsen; die Seite: die dominante Achse von A zu B). Die Zählung ist die von p3/n1911/los-huelle/ursache/haus-im-haus2.cjs:
// an der Stadt 7/4750 (3 × 3) vor dem Schnitt 26 Paare, an den Fällen der Lose 12 (7/60: 2, 2/120: 10).
const BW_TIEF = 0.01;
// die Fälle der Linse: die Fälle der Lose und die Stadt 10/400 — dort rückt das Los-Gesetz einen Körper an den Nachbarn (der Ruf danach;
// bis zum Technik-Gesetz die Stadt 2/400 — ohne Kupfer fiel ihre Kuppel, ihr Plan legte sich neu: 3 Paare → 0, an 10/400 2)
const BW_FAELLE = LOSE_FAELLE.concat([{ seed: 10, nH: 400 }]);
// die Täter, je mit dem Fall, an dem sie fallen (der Selbsttest fährt nur ihn)
const BRANDWAND_TAETER = {
    // die Brandwand vor dem Schnitt: „anliegend“ an den Wänden dims.W/D statt an der Körper-Hülle
    "brandwand an dims": { R: [["ex=a.ex+halb(b,ci,-si), ez=a.ez+halb(b,si,ci);", "ex=(A.dims.W+Bj.dims.W)/2, ez=(A.dims.D+Bj.dims.D)/2;"]], faelle: LOSE_FAELLE.slice(0, 2) },
    // die Toleranz ohne die Reichweite der Öffnungen (nur die Norm gap + 0,15)
    // (seit bau-rezept-tuer am Burg-Paar 12/60: die Brandwand urteilt über die ganze seitliche Überdeckung, an 2/120 reicht die Norm allein)
    "ohne Reichweite": { R: [["<Math.max(norm,A.reich[s])", "<norm"]], faelle: [{ seed: 12, nH: 60 }] },
    // nur vor dem Los-Gesetz: die Brandwand urteilt nicht, wo die Lose stehen (seit der Wache des Grund-Satzes, ort-ausstattung:
    // 10/400 legt sich mit zwei Wachen neu, die Mutante fand dort 0 Paare — an 11/400 4, die tiefste Öffnung 0,151 m)
    "nur vor dem Los-Gesetz": { R: [["            // DIE BRANDWAND, WO DIE LOSE STEHEN (los-huelle-2)", "            if (0) // DIE BRANDWAND, WO DIE LOSE STEHEN (los-huelle-2)"]], faelle: [{ seed: 11, nH: 400 }] },
};
function oeffnungImNachbarn(K, KH, faelle) {
    const ax = (o) => [[Math.cos(o.phi), -Math.sin(o.phi)], [Math.sin(o.phi), Math.cos(o.phi)]];
    const proj = (o, a) => { const [u, v] = ax(o); return o.ex * Math.abs(u[0] * a[0] + u[1] * a[1]) + o.ez * Math.abs(v[0] * a[0] + v[1] * a[1]); };
    const tief = (A, B) => { let m = Infinity; for (const a of [...ax(A), ...ax(B)]) m = Math.min(m, proj(A, a) + proj(B, a) - Math.abs((B.cx - A.cx) * a[0] + (B.cz - A.cz) * a[1])); return m; };
    const weit = (o, s, r) => { const c = Math.cos(o.phi), si = Math.sin(o.phi), lx = s === "x1" ? r / 2 : s === "x0" ? -r / 2 : 0, lz = s === "z1" ? r / 2 : s === "z0" ? -r / 2 : 0; return { cx: o.cx + lx * c + lz * si, cz: o.cz - lx * si + lz * c, phi: o.phi, ex: o.ex + Math.abs(lx), ez: o.ez + Math.abs(lz) }; };
    const seite = (o, b) => { const c = Math.cos(o.phi), s = Math.sin(o.phi), dx = b.cx - o.cx, dz = b.cz - o.cz, lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) / o.ex >= Math.abs(lz) / o.ez ? (lx > 0 ? "x1" : "x0") : lz > 0 ? "z1" : "z0"; };
    const aus = [];
    for (const dp of faelle) {
        const S = K.exportSettlement(dp).slots.filter((s) => s.obb && Math.abs(s.obb.cx) <= 5000 && Math.abs(s.obb.cz) <= 5000);
        for (const a of S) {
            const hp = Object.assign({}, a.ov);
            delete hp.brandwand;
            const e = K.massBau(hp).ext, m = KH.massBau(hp).ext, bw = a.ov.brandwand || {};
            const r = { x0: e.x0 - m.x0, x1: m.x1 - e.x1, z0: e.z0 - m.z0, z1: m.z1 - e.z1 };
            for (const b of S) {
                if (b === a || Math.hypot(a.obb.cx - b.obb.cx, a.obb.cz - b.obb.cz) > 40 || tief(a.obb, b.obb) > BW_TIEF) continue;
                const s = seite(a.obb, b.obb);
                if (bw[s] || !(r[s] > 0)) continue;
                const t = tief(weit(a.obb, s, r[s]), b.obb);
                if (t > BW_TIEF) aus.push(`${dp.seed}/${dp.nH} Same ${a.seed} ${a.kultur}/${a.rolle} Seite ${s} → ${b.seed} ${b.rolle}: ${t.toFixed(3)} m`);
            }
        }
    }
    return aus;
}
function brandwandProben(FC, check, { kernText, taeter = false }) {
    const t0 = Date.now();
    const mitOeffnung = (text, name) => kernAusText(kernMutante(text, [HUELLE_TAETER]).text, name + "-mit-oeffnung");
    if (taeter) {
        for (const [name, { R, faelle }] of Object.entries(BRANDWAND_TAETER)) {
            const m = kernMutante(kernText, R);
            const z = m.text ? oeffnungImNachbarn(kernAusText(m.text, "bw-" + name), mitOeffnung(m.text, "bw-" + name), faelle) : null;
            check(`Selbst-Test Brandwand B1: „${name}“ — die Zählung nennt die Öffnung im Nachbarn beim Namen`, !!z && z.length > 0, m.fehlt || `${z.length} Paare — ${z.slice(0, 2).join(" · ")}`);
        }
        console.log(`  Brandwand Selbsttest: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        return;
    }
    const z = oeffnungImNachbarn(FC, mitOeffnung(kernText, "kopf"), BW_FAELLE);
    check(`Brandwand an der Körper-Hülle (B1, ${BW_FAELLE.length} Fälle): keine Öffnung einer Seite ohne Brandwand ragt > 1 cm in den Körper eines Nachbarn`, !z.length, `${z.length} Paare — ${z.slice(0, 3).join(" · ")}`);
    console.log(`  Brandwand B1: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
module.exports = { losProben, huelleProben, wurfProben, brandwandProben, oeffnungImNachbarn, BRANDWAND_TAETER, oeffnungsZensus, zensusBauten, MARKE_TAETER, OEFFNUNG_MUTANTEN, HUELLE_TAETER, LOSE_FAELLE, kernMutante, kernAusText, loseVon, loseUrteil };
