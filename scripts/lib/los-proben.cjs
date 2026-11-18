"use strict";
// scripts/lib/los-proben.cjs — DIE LOSE ÜBERDECKEN SICH NIE (siedlung; w28-stadt-grammatik): die Proben der Settlement-Linse
// (`node scripts/diag-settlement.cjs`, Teil A am Tisch) am Los-Gesetz des Fachwerk-Kerns — `loseEntzerren` (nach reihenSnap und
// brandwand, am Grundriss des Slots), `grundrissTief`, `LOS_GESETZ`. Der Konsum-Leser am Gerät ist gate:kreatur-takt zielplan
// (die Lose des Plans stehen: jedes Haus, jede Rolle). Dazu, was um das Los gilt: das Maß des Landes (`BAU_LAND`) und der Raum der
// Wende am Torplatz (`torRaum`, `VERKEHR_GESETZ.bahnN`; Konsum-Leser am Gerät: gate:fahr-leben VK).

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
    // DER RAUM DER WENDE TRÄGT KEINEN FREIEN STAND (fachwerk `torRaum`, `STADT_DICHTE.torplatz.zulaufM`; w28-bau-rezept): das Geviert
    // des Torplatzes, längs der Trasse um den Zulauf der Bahnen gestreckt, hält die freie Laterne (`dorfLayout`: `laterneNeben`) und
    // den Brunnen (`brunnenWeicht`) fern — dort zweigen die Bahnen der Wende ab. Die Zählung (`imRaum`, am Maß des Gesetzes) nennt
    // jeden Stand im Raum beim Namen; ihr Täter ist das Gesetz ohne den Zulauf (nur das Geviert, wie bis hier). Die Fälle: die Stadt
    // der Fahr-Linse VK, die Kleinstadt des Worts, zwei weitere Städte. Der Konsum-Leser am Gerät ist gate:fahr-leben VK (Wenden
    // an 4 von 4 Enden, fahrend je Minute).
    const [TP, VG, AUS] = [FC.STADT_DICHTE.torplatz, FC.VERKEHR_GESETZ, FC.AUSSTATTUNG];
    const zu0 = TP.zulaufM;
    check(
        "Tor-Probe: der Zulauf der Wende ist ihr Bogen samt der Geraden auf die Spur (zulaufM = wendeM + abzweigZulaufM)",
        zu0 === VG.wendeM + VG.abzweigZulaufM,
        `${zu0} m · ${VG.wendeM} + ${VG.abzweigZulaufM}`
    );
    const imRaum = (ex) => {
        const raeume = (ex.zonen || []).filter((q) => q.name === "torplatz").map((q) => ({ cx: q.cx, cz: q.cz, phi: q.phi, ex: q.ex + zu0, ez: q.ez }));
        const nennt = (art, L, r) =>
            (L || []).flatMap((p) => {
                const f = raeume.find((o) => FC.distPunktOBB(p.x, p.z, o) < r);
                return f ? [`${art} ${p.x.toFixed(1)}/${p.z.toFixed(1)} im Raum der Wende ${f.cx.toFixed(1)}/${f.cz.toFixed(1)}`] : [];
            });
        return nennt("laterne", (ex.laternen || []).filter((p) => !p.wand), AUS.laterne.tritt.r).concat(nennt("brunnen", ex.brunnen, AUS.brunnen.tritt.r));
    };
    const torFaelle = () =>
        [[7, 300], [7, 18], [2, 120], [7, 60]].flatMap(([seed, nH]) => imRaum(FC.exportSettlement({ seed, nH })).map((x) => `dorf ${seed} ${nH}: ${x}`));
    let tTor;
    try {
        TP.zulaufM = 0;
        tTor = torFaelle();
    } finally {
        TP.zulaufM = zu0;
    }
    check(
        "Tor-Probe (Täter): ohne den Zulauf nennt die Zählung die Stände im Raum der Wende beim Namen",
        tTor.length >= 10 && tTor.every((x) => /^dorf \d+ \d+: (laterne|brunnen) -?[\d.]+\/-?[\d.]+ im Raum der Wende /.test(x)),
        `${tTor.length}: ${tTor.slice(0, 3).join(" · ")}`
    );
    const fTor = torFaelle();
    check("Tor-Probe: kein freier Stand (Laterne, Brunnen) steht im Raum einer Wende (4 Pläne)", fTor.length === 0, `${fTor.length}: ${fTor.slice(0, 4).join(" · ")}`);
    // DIE HÖHE URTEILT ÜBER JEDE BAHN DES KREISES (fachwerk `verkehrsNetz`: `versuch`, `VERKEHR_GESETZ.bahnN`; w28-bau-rezept): ein
    // Boden, der je Kreis die erste Bahn heraus verwirft (`faellt: "aus"`) und jede weitere trägt — der Kreis des Torplatzes sucht
    // ohne sie weiter und trägt seine Wende. Der Täter ist die Suche mit EINER Bahn je Kreis (`bahnN` 1, wie bis hier): mit der
    // ersten Bahn fällt der Kreis, das Ende steht ohne Wende.
    const stadt = FC.exportSettlement({ seed: 7, nH: 300 });
    const traegt = (w) => ({ plaetze: w.plaetze, y: 0, hEin: null, hAus: null });
    const streng = () => {
        const gesehen = new Set();
        const wende = (w) => (gesehen.has(`${w.x}/${w.z}`) ? traegt(w) : (gesehen.add(`${w.x}/${w.z}`), { faellt: "aus" }));
        return { kreis: () => true, wende };
    };
    const enden = (boden) => FC.verkehrsNetz(stadt, 0, 0, false, boden).kreuzungen.filter((K) => K.ende);
    const amTor = (E) => E.filter((K) => K.wenden[0] && K.wenden[0].tor).length;
    const [frei, mit] = [enden({ kreis: () => true, wende: traegt }), enden(streng())];
    const bahn0 = VG.bahnN;
    let ohne;
    try {
        VG.bahnN = 1;
        ohne = enden(streng());
    } finally {
        VG.bahnN = bahn0;
    }
    const tBahn = ohne.filter((K) => !K.wenden.length).map((K) => `Ende ${K.x.toFixed(1)}/${K.z.toFixed(1)}: der Kreis fällt mit seiner ersten Bahn`);
    check(
        "Tor-Probe (Täter): mit EINER Bahn je Kreis fällt jedes Ende, dessen erste Bahn die Höhe verwirft, beim Namen",
        frei.length >= 2 && tBahn.length === frei.length && amTor(ohne) === 0,
        `${tBahn.length} von ${frei.length}: ${tBahn.slice(0, 2).join(" · ")}`
    );
    check(
        "Tor-Probe: fällt die erste Bahn an der Höhe, trägt der Kreis des Torplatzes die nächste (jedes Ende wie ohne das Urteil)",
        amTor(frei) >= 2 && amTor(mit) === amTor(frei) && mit.every((K) => K.wenden.length),
        `am Torplatz ${amTor(mit)} von ${amTor(frei)} · Enden ${mit.length}`
    );
}

module.exports = { losProben };
