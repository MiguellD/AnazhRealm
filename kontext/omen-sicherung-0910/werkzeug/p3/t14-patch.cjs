// 0710-4 Klasse 1: gate:kampf-gefuehl T14 — die Masse-Tafel (EINE Quelle je Leib, die Zwillinge beim Namen).
"use strict";
const fs = require("fs");
const p = process.argv[2];
let s = fs.readFileSync(p, "utf8");
function ers(a, b) {
    if (s.split(a).length !== 2) throw new Error("TREFFER: " + a.slice(0, 90));
    s = s.replace(a, b);
}
// das Urteil (pure Funktion) neben dem von T13
ers(
    `const mime = {
    ".html": "text/html",`,
    `// (T14) DIE MASSE-TAFEL (0710-4 — pure Funktion, Probe UND Selbst-Test): jeder Leib wiegt, was seine Gestalt wiegt — das
// Volumen der geschlossenen Haut (die Linse rechnet es selbst, Divergenz-Satz) mal der Dichte SEINES Kerns (tetrapoda
// MASSSTAB.dichteKgM3 · koerper LEIB.dichteKgM3), der Wagen sein Kern-Volumen (carPhys) mal FAHR.masseDichte. Der Wirt hält
// keine Dichte (kein STOSS.dichteLeib / dichteWagen, kein Kapsel-Leser _kreaturMasse), und die Reihe steht: Fuchs < Wolf <
// Hirsch < Bär < Wagen. Vorher: Kapsel aus der Hüft-Höhe × 1000 im Wirt — der Hirsch wog 436 kg, der Bär 255.
const MASSE = { toleranz: 0.02, reihe: ["fuchs", "wolf", "hirsch", "baer", "gt"] };
function masseVerdict(M) {
    if (!M || !M.leiber) return ["masse keine Probe"];
    const v = [];
    for (const k of M.kernFehlt || []) v.push(\`masse-kern: \${k} fehlt — die Dichte lebt im Wirt, nicht im Gesetzbuch\`);
    for (const z of M.zwillinge || []) v.push(\`masse-zwilling: \${z} im Wirt (eine Studio-Größe neben dem Kern)\`);
    for (const name of [...MASSE.reihe, "mensch"]) {
        const l = M.leiber[name];
        if (!l || !(l.wirtKg > 0)) {
            v.push(\`masse-\${name}: keine Masse im Wirt\`);
            continue;
        }
        if (!(l.gestaltKg > 0)) continue; // ohne Kern-Dichte nennt masse-kern den Täter
        if (!(Math.abs(l.wirtKg - l.gestaltKg) <= MASSE.toleranz * l.gestaltKg))
            v.push(
                \`masse-\${name}: der Wirt rechnet \${l.wirtKg.toFixed(1)} kg, die Gestalt wiegt \${l.gestaltKg.toFixed(1)} kg\`
            );
    }
    for (let i = 1; i < MASSE.reihe.length; i++) {
        const a = M.leiber[MASSE.reihe[i - 1]];
        const b = M.leiber[MASSE.reihe[i]];
        if (a && b && !(a.wirtKg < b.wirtKg))
            v.push(
                \`masse-reihe: \${MASSE.reihe[i - 1]} \${a.wirtKg.toFixed(1)} kg ≥ \${MASSE.reihe[i]} \${b.wirtKg.toFixed(1)} kg\`
            );
    }
    return v;
}
const mime = {
    ".html": "text/html",`
);
// die Probe: nach T13
ers(
    `        w.z.rueck = {
            fuchsDolch: rueck(fuchsR, "klinge_dolch"),
            fuchsKeule: rueck(fuchsR, "klinge_keule"),
            baerDolch: rueck(baer, "klinge_dolch"),
            baerKeule: rueck(baer, "klinge_keule"),
        };`,
    `        w.z.rueck = {
            fuchsDolch: rueck(fuchsR, "klinge_dolch"),
            fuchsKeule: rueck(fuchsR, "klinge_keule"),
            baerDolch: rueck(baer, "klinge_dolch"),
            baerKeule: rueck(baer, "klinge_keule"),
        };
        // (T14) DIE MASSE-TAFEL (0710-4): je Gattung ein frisches Tier der Größe 1, der Spieler und ein GT — die Masse, mit
        // der der Wirt stößt, gegen das Gewicht der Gestalt (die Linse misst die geschlossene Haut selbst).
        {
            const TC = globalThis.__tetrapodaCore;
            const KC = globalThis.__koerperCore;
            const VC = globalThis.__vehicleCore;
            const dichteTier = TC && TC.MASSSTAB ? TC.MASSSTAB.dichteKgM3 : undefined;
            const dichteMensch = KC && KC.LEIB ? KC.LEIB.dichteKgM3 : undefined;
            const dichteWagen = VC && VC.FAHR ? VC.FAHR.masseDichte : undefined;
            const kernFehlt = [];
            if (!(dichteTier > 0)) kernFehlt.push("tetrapoda MASSSTAB.dichteKgM3");
            if (!(dichteMensch > 0)) kernFehlt.push("koerper LEIB.dichteKgM3");
            if (!(dichteWagen > 0)) kernFehlt.push("vehicle FAHR.masseDichte");
            const zwillinge = [];
            if (A.STOSS && A.STOSS.dichteLeib !== undefined) zwillinge.push("STOSS.dichteLeib " + A.STOSS.dichteLeib);
            if (A.STOSS && A.STOSS.dichteWagen !== undefined) zwillinge.push("STOSS.dichteWagen " + A.STOSS.dichteWagen);
            if (typeof r._kreaturMasse === "function") zwillinge.push("_kreaturMasse (die Kapsel aus der Hüft-Höhe)");
            // das Volumen der geschlossenen Haut (Klasse fell/haut, jede Kante gerade oft) im Rahmen von \`rahmen\`
            const hautVolumen = (teil, rahmen, klassen) => {
                rahmen.updateMatrixWorld(true);
                const inv = new THREE.Matrix4().copy(rahmen.matrixWorld).invert();
                const mm = new THREE.Matrix4();
                let vol = 0;
                teil.traverse((o) => {
                    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                    const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
                    if (!klassen.includes(kl)) return;
                    const pa = o.geometry.attributes.position.array;
                    const ix = o.geometry.index ? o.geometry.index.array : null;
                    const n = ix ? ix.length : pa.length / 3;
                    const kanten = new Map();
                    let vv = 0;
                    for (let t = 0; t + 2 < n; t += 3) {
                        const ia = ix ? ix[t] : t;
                        const ib = ix ? ix[t + 1] : t + 1;
                        const ic = ix ? ix[t + 2] : t + 2;
                        const [ax, ay, az] = [pa[3 * ia], pa[3 * ia + 1], pa[3 * ia + 2]];
                        const [bx, by, bz] = [pa[3 * ib], pa[3 * ib + 1], pa[3 * ib + 2]];
                        const [cx, cy, cz] = [pa[3 * ic], pa[3 * ic + 1], pa[3 * ic + 2]];
                        vv += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
                        for (const [u, q] of [
                            [ia, ib],
                            [ib, ic],
                            [ic, ia],
                        ]) {
                            const key = u < q ? u + ":" + q : q + ":" + u;
                            kanten.set(key, (kanten.get(key) || 0) + 1);
                        }
                    }
                    for (const zz of kanten.values()) if (zz % 2) return; // offen: keine Masse
                    mm.multiplyMatrices(inv, o.matrixWorld);
                    vol += Math.abs(vv) * Math.abs(mm.determinant());
                });
                return vol;
            };
            const wirtLeib = (k) =>
                typeof r._leibMasse === "function" ? r._leibMasse(k) : r._kreaturMasse ? r._kreaturMasse(k) : 0;
            const leiber = {};
            const ort = pm.position;
            for (const [name, seele] of [
                ["fuchs", "fuchs"],
                ["wolf", "wolf"],
                ["hirsch", "wesen"],
                ["baer", "baer"],
            ]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                const c = r.spawnCreatureAt(ort.x + 320, ort.y, ort.z + 320, "calm", seele, { bodySize: 1 });
                if (!c) continue;
                const tb = c.userData._tierBaum;
                const sk = new THREE.Vector3();
                c.getWorldScale(sk);
                const vol = tb && tb.wrap ? hautVolumen(tb.wrap, c, ["fell"]) * sk.x * sk.y * sk.z : 0;
                leiber[name] = { wirtKg: wirtLeib(c), gestaltKg: dichteTier > 0 ? vol * dichteTier : null, vM3: vol };
                r.removeCreature(c);
            }
            {
                // der Spieler: seine Nah-Gestalt (der Fern-Klon daneben trägt dieselbe Haut noch einmal)
                let nah = null;
                pm.traverse((o) => {
                    if (!nah && o.userData && o.userData._menschFern && o.userData._menschFern.nah)
                        nah = o.userData._menschFern.nah;
                });
                const vol = hautVolumen(nah || pm, pm, ["haut"]);
                leiber.mensch = {
                    wirtKg: typeof r._leibMasse === "function" ? r._leibMasse(pm) : 0,
                    gestaltKg: dichteMensch > 0 ? vol * dichteMensch : null,
                    vM3: vol,
                };
            }
            {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: ort.x + 330, y: r.getTerrainHeightAt(ort.x + 330, ort.z + 330) + 0.5, z: ort.z + 330 },
                    { silent: true, precise: true }
                );
                const prof = e ? r._vehicleProfile(e) : null;
                const G = prof ? r._fahrSatz(e, prof) : null;
                if (G)
                    leiber.gt = {
                        wirtKg:
                            typeof r._fahrMasse === "function"
                                ? r._fahrMasse(G)
                                : A.STOSS && A.STOSS.dichteWagen
                                  ? G.m * A.STOSS.dichteWagen
                                  : 0,
                        gestaltKg: dichteWagen > 0 ? G.m * dichteWagen : null,
                        vM3: G.m,
                    };
                if (e) r.removeArchitecture(e);
            }
            w.z.masse = { leiber, kernFehlt, zwillinge };
        }`
);
// Bericht + Verdikt + Selbst-Test nach K-D9
ers(
    `        check(c.bogenVerschleiss, "Q8 K-D6: der Bogen verschleißt wie die Klinge`,
    `        const mz = z.masse || {};
        const ml = mz.leiber || {};
        console.log(
            "  (T14) Masse-Tafel (Wirt / Gestalt): " +
                ["fuchs", "wolf", "hirsch", "baer", "mensch", "gt"]
                    .map((k) =>
                        ml[k]
                            ? \`\${k} \${ml[k].wirtKg.toFixed(1)} / \${ml[k].gestaltKg === null ? "–" : ml[k].gestaltKg.toFixed(1)} kg\`
                            : k + " –"
                    )
                    .join(" · ") +
                (mz.zwillinge && mz.zwillinge.length ? " · Zwillinge: " + mz.zwillinge.join(", ") : "")
        );
        const mv = masseVerdict(z.masse);
        check(
            mv.length === 0,
            "0710-4 T14: EINE Masse je Leib — die Gestalt (geschlossene Haut × Dichte des Kerns, der Wagen carPhys × FAHR.masseDichte), keine Dichte im Wirt, die Reihe Fuchs < Wolf < Hirsch < Bär < Wagen" +
                (mv.length ? " — " + mv.join(" · ") : "")
        );
        // der Selbst-Test der Tafel: der Befund (Kapsel aus der Hüft-Höhe, Dichten im Wirt) fällt rot beim Namen
        const mvAlt = masseVerdict({
            kernFehlt: ["tetrapoda MASSSTAB.dichteKgM3"],
            zwillinge: ["STOSS.dichteLeib 1000", "STOSS.dichteWagen 150"],
            leiber: {
                fuchs: { wirtKg: 35.4, gestaltKg: 15 },
                wolf: { wirtKg: 140.5, gestaltKg: 64 },
                hirsch: { wirtKg: 435.6, gestaltKg: 94.2 },
                baer: { wirtKg: 254.8, gestaltKg: 335.4 },
                mensch: { wirtKg: 98.8, gestaltKg: 98.8 },
                gt: { wirtKg: 1341.4, gestaltKg: 1341.4 },
            },
        });
        const mvGut = masseVerdict({
            kernFehlt: [],
            zwillinge: [],
            leiber: {
                fuchs: { wirtKg: 15, gestaltKg: 15 },
                wolf: { wirtKg: 64, gestaltKg: 64 },
                hirsch: { wirtKg: 94.2, gestaltKg: 94.2 },
                baer: { wirtKg: 335.4, gestaltKg: 335.4 },
                mensch: { wirtKg: 98.8, gestaltKg: 98.8 },
                gt: { wirtKg: 1341.4, gestaltKg: 1341.4 },
            },
        });
        check(
            mvGut.length === 0 &&
                ["masse-kern", "masse-zwilling", "masse-hirsch", "masse-baer", "masse-reihe"].every((t) =>
                    mvAlt.some((x) => x.startsWith(t))
                ),
            "Selbst-Test T14: der Befund (Kapsel aus der Hüft-Höhe, Dichten im Wirt) nennt Kern, Zwilling, Hirsch, Bär und Reihe; eine Tafel aus EINER Quelle bleibt grün"
        );
        check(c.bogenVerschleiss, "Q8 K-D6: der Bogen verschleißt wie die Klinge`
);
// T13: die Masse aus dem EINEN Leser
ers(
    `            const masse = typeof r._kreaturMasse === "function" ? r._kreaturMasse(c) : null;`,
    `            const masse =
                typeof r._leibMasse === "function"
                    ? r._leibMasse(c)
                    : typeof r._kreaturMasse === "function"
                      ? r._kreaturMasse(c)
                      : null;`
);
fs.writeFileSync(p, s);
console.log("ok");
