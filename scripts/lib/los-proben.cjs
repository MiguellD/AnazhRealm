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
    // DER KÖRPER STEHT AUF DEM, WAS SEINE PARZELLE TRÄGT (fachwerk `bauProgramm`, die Tafel `BAU_LAND`; w28-bau-rezept): der Fuß
    // eines Hauses (W × D) endet am Fuß seiner Parzelle × `koerper` (dicht · frei), nie unter `minM2`, nie über `maxM2` — was das
    // höchste Geschoss seiner Zeile dann nicht fasst, bleibt ungebaut. Die Zählung (`land`) nennt jedes Haus über seinem Land
    // beim Namen; ihr Täter ist das Gesetz ohne das Maß des Landes (der Körper endet erst an `maxM2`, wie bis hier). Das Raster
    // der Maße (halbe Meter je Seite) trägt ¼ m je Seite. Die Fälle: die Stadt der Fahr-Linse VK („dorf 7 300"), das Dorf des
    // Worts, das Dorf des Messorts, eine zweite Stadt.
    const BL = FC.BAU_LAND;
    const land = (P, koerper) =>
        P.houses.flatMap((h) => {
            const [F0, F] = [Math.max(BL.minM2, h.parzelle.W * h.parzelle.D), h.W * h.D];
            const traegt = Math.max(BL.minM2, Math.min(BL.maxM2, F0 * koerper[P.staedtisch ? "dicht" : "frei"]));
            return F > traegt + 0.25 * (h.W + h.D) + 0.1
                ? [`${h.rolle} #${h.seed} ${h.W} × ${h.D} auf ${h.parzelle.W} × ${h.parzelle.D} (das ${(F / F0).toFixed(2)}-Fache)`]
                : [];
        });
    const landFaelle = (koerper) =>
        [[7, 300], [7, 18], [4291161376, 13], [21, 144]].flatMap(([seed, nH]) =>
            land(FC.DORF({ seed, nH }), koerper).map((x) => `dorf ${seed} ${nH}: ${x}`)
        );
    const k0 = Object.assign({}, BL.koerper);
    let tLand;
    try {
        Object.assign(BL.koerper, { dicht: Infinity, frei: Infinity });
        tLand = landFaelle(k0);
    } finally {
        Object.assign(BL.koerper, k0);
    }
    check(
        "Los-Probe (Täter): ohne das Maß des Landes nennt die Zählung die Häuser über ihrer Parzelle beim Namen",
        tLand.length >= 20 && tLand.every((x) => /^dorf \d+ \d+: [a-z_]+ #\d+ [\d.]+ × [\d.]+ auf [\d.]+ × [\d.]+ /.test(x)),
        `${tLand.length}: ${tLand.slice(0, 3).join(" · ")}`
    );
    const fLand = landFaelle(BL.koerper);
    check("Los-Probe: jeder Körper steht auf dem, was seine Parzelle trägt (4 Pläne)", fLand.length === 0, `${fLand.length}: ${fLand.slice(0, 4).join(" · ")}`);
}

module.exports = { losProben };
