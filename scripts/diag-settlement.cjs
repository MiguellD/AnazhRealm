// diag-settlement.cjs (gate:settlement) — Teil J (`--nur-j` allein): die Jahresringe der Chronik (`jahresringe`, siedlung.K4) ·
// Teil Z (`--nur-z` allein): das Rang-Gesetz (`rangZensus`) · K (`--nur-k` nach Z): die Kreuzung als EINE Fläche
// (`kreuzungsUrteil`) · G (`--nur-g` nach K): die Gründung ist flach (`gruendungFlach`, Operationen je Stand) · N: der Export
// deterministisch und eingefroren (spec/asset-contract/v6/golden/siedlung.json, gemintet nur ohne Datei) · B (Browser): Worker,
// Slots am Anker, Wasser- und fail-closed-Wand, Erlebnis-Schichten · C: die Auto-Zellen · O: der Ort auf dem Gelände ·
// `--breite [--ort stadt-voll]` allein: die Breite der Stadt im Gang durch ihre Gassen (lib/stadt-proben.cjs, die Zeile `BREITE {…}`) ·
// Teil F (`--nur-f` allein): das wache Glas jedes Hauses ist eine Quelle „fenster“ im EINEN Lichtweg (lib/ort-proben.cjs `fensterLicht`).
// --selftest: jede Wand feuert an injizierten Brüchen.
const {
    statikServer,
    waitFor,
    ROOT: root,
    hauptLauf,
    nullWelt,
    pruefer,
    wandEnde,
    selbsttestEnde,
    studioKern,
    SELBSTTEST,
    path,
    fs,
    jsonLesen,
    jsonSchreiben,
    jsonKlon,
    fehlerStapel,
    taeterFaelle,
} = require("./lib/welt-boot.cjs");
const { stadtBreite, breiteUrteil, breiteOhne, breiteSelbsttest, BREITE } = require("./lib/stadt-proben.cjs");
const { verkehrsnetzProben } = require("./lib/verkehrsnetz-proben.cjs");
const { losProben, huelleProben, wurfProben, brandwandProben, kernMutante, kernAusText } = require("./lib/los-proben.cjs");
const {
    gassenGefaelle,
    erdbauMedian,
    dorfZugAmOrt,
    belagUrteil,
    lokal,
    kasten,
    ortUrteil,
    slotHuelle,
    POOL_AUSSER_RANG,
    poolZaehlen,
    ortVerdikt,
    poseSicht,
    gassenLicht,
    stadtFunktion,
    fensterLicht,
    fensterUrteil,
    FENSTER_TAETER,
} = require("./lib/ort-proben.cjs");

// C3n DER ORT KENNT SEINE NACHBARN (Karte 2 mensch.kultur.sprache#1): das Urteil über den Zensus der Seite — jeder Nachbar des
// Gesetzes (`_wegenetzNachbarn` des erwachten Orts, ohne die verworfene und die verdrängte Zelle) steht im Register der Orte
// (`_bewohnerSiedlungen`) mit Plan, Name und Region. Rückgabe: die fehlenden beim Namen (leer: GRÜN).
const nachbarLuecke = (n) =>
    !n || !Array.isArray(n.gesetz) ? ["kein Zensus der Nachbarn"] : n.gesetz.filter((k) => !n.register.some((e) => e.k === k && e.name && e.region)); // prettier-ignore
const goldenDir = path.join(root, "spec/asset-contract/v6/golden");
const goldenFile = path.join(goldenDir, "siedlung.json");
// das Golden der Lose (los-huelle, `huelleProben`): je Fall je Haus eine Zeile [Same, x, z, phi, Hülle]
const loseGolden = {
    datei: path.join(goldenDir, "siedlung-lose.json"),
    lesen: () => jsonLesen(loseGolden.datei),
    schreiben: (G) =>
        fs.writeFileSync(
            loseGolden.datei,
            "{\n" +
                Object.entries(G)
                    .map(([k, L]) => `    ${JSON.stringify(k)}: [\n${L.map((h) => "        " + JSON.stringify(h)).join(",\n")}\n    ]`)
                    .join(",\n") +
                "\n}\n"
        ),
};
const kernText = () => fs.readFileSync(path.join(root, "fachwerk-core.js"), "utf8");

const { errs, check } = pruefer();
const { sha } = require("./lib/stamm.cjs");

// Kanonischer Fingerabdruck eines Exports: das volle JSON (Slots + benannte Schichten).
function fingerprint(plan) {
    return sha(JSON.stringify(plan));
}

// ===== TEIL Z (siedlung.K2): je Saat ein zufälliger Spawn (±8 km) und um ihn 32 × 32 km Welt-Zellen, jede durch das Gesetz
// (`siedlungsZelle`). Z1: binnen 2 km eine Stadt ≥ stadt, deren Export die Mauer trägt. Z3 ZIPF (die Zeile `ZIPF {…}`, die
// Station siedlung.K2#2): der Exponent ζ von N(≥ s) ∝ s^−ζ je Fenster nach Gabaix-Ibragimov — ln(Rang − ½) = a − ζ·ln nH über
// die Orte ab der ersten Rang-Stufe, der Rang einer Größe ist N(≥ s) (gleich große teilen ihn: die Wand des DORF ist EIN
// Punkt, keine erfundene Reihe) —, sein Mittel und das Intervall [kleinste, größte] über die Saaten: über 8 deckt es den
// Median mit 1 − 2 · 0,5⁸ = 99,2 % (die Ordnungs-Statistik der Kaskade); GRÜN nur ganz in 0,8–1,2, und jede Stadt aus Z1
// exportiert Mauer und Graph.
const mittel = (a) => a.reduce(addiere, 0) / a.length;
function rangZensus(FC, o = {}) {
    const [S, N, Z] = [o.S || FC.SIEDLUNG, o.saaten || 8, { saaten: [], mitStadt: 0, graph: 0, je: [], n: [] }];
    const W = Math.round(32000 / S.cellM);
    let lcg = 7;
    const zuf = () => ((lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0) / 2 ** 32 - 0.5) * 16000;
    const fnv = (t) => [...t].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
    for (let k = 0; k < N; k++) {
        const [M, st, sx, sz, H] = [new Map(), [], zuf(), zuf(), (u, v) => fnv(`saat-${k}:dorf:${u},${v}`)];
        const [x0, z0] = [sx, sz].map((v) => Math.floor(v / S.cellM - W / 2));
        for (let i = 0; i < W * W; i++) {
            const q = S.rang.length && FC.siedlungsZelle(S, x0 + (i % W), z0 + ((i / W) | 0), H, M);
            if (q?.stufe) st.push([Math.hypot(q.x - sx, q.z - sz), q]);
        }
        let w = null;
        for (const [d, q] of st.filter((u) => u[0] <= 2000).sort((u, v) => u[0] - v[0])) {
            const x = (o.ex || FC.exportSettlement)({ seed: q.seed, nH: q.nH, epoche: FC.siedlungsEpoche(q.seed) });
            if (/stadt|metropole/.test(x.groesse) && x.mauer?.segs.length && (w = [d, x])) break;
        }
        [Z.mitStadt, Z.graph] = [Z.mitStadt + !!w, Z.graph + !!w?.[1].graph?.nE];
        Z.saaten.push(`saat-${k}: ${w ? `${w[1].groesse} ${w[1].slots.length} Slots ${Math.round(w[0])} m` : "keine"}`);
        const g = st.map((u) => u[1].nH).sort((u, v) => v - u);
        const x = g.map(Math.log);
        const dx = x.map((v) => v - mittel(x));
        const zeta = -mittel(g.map((v, i) => dx[i] * Math.log(g.lastIndexOf(v) + 0.5))) / mittel(dx.map((v) => v * v));
        Z.je.push(g[0] > g.at(-1) ? +zeta.toFixed(3) : NaN); // gleich groß: kein Rang-Gesetz, kein ζ
        Z.n.push(g.length);
    }
    const ki = [Math.min(...Z.je), Math.max(...Z.je)];
    const [zeta, ex] = [+mittel(Z.je).toFixed(3), `Mauer und Graph ${Z.graph}/${Z.mitStadt}`];
    const gruen = ki[0] >= 0.8 && ki[1] <= 1.2 && Z.mitStadt > 0 && Z.graph === Z.mitStadt;
    return Object.assign(Z, { ok: Z.mitStadt >= (N * 6) / 8, zipf: { zeta, ki, je: Z.je, n: Z.n, export: ex, gruen } });
}

// ===== TEIL J (siedlung.K4): DIE JAHRESRINGE — je Saat dieselbe Zelle unter 1320 · 1560 · 1860 · 1935 (die Epochen ohne Zahl:
// die Chronik ihrer Region, fachwerk `chronikJahr`). Je Paar (älter, jünger) die Überdeckung je Slot — der Anteil der 3 × 3
// Punkte seines Grundrisses (Ecken, Kanten-Mitten, Mitte), die ein Grundriss des jüngeren trägt —, über den älteren Kern
// gemittelt (Soll ≥ 0,8, die kleinste über Saaten und Paare). Die Epoche bestimmt Rolle, Bauart und Kleidung: jedes Baujahr
// bis zum Schnitt (jahr + spanne), kein Turm vor 1905, keine Halle vor 1850, die Kultur aus der Historie ihres Baujahrs
// (REGION_HIST; die Kirche trägt die Marke ihrer Epoche: vier Epochen, vier Kirchen), die Kleidung die Tracht der Epoche;
// moderne ergibt stadt und trägt den Turm. `ohneErbe` (die Mutante): jede Epoche ein eigener Plan (ihr eigener Same). `nH`
// (J3): die Zelle der Welt trägt ihre Zahl (das Rang-Gesetz, „dorf 7 300") und ihre Legende — ihre Gestalt am Ende jeder Epoche
// geschnitten; bis w3w schaltete die Zahl die Chronik ab. DIE MAUER (J4): der Schnitt steht ummauert genau dann, wenn er
// städtisch ist und das Jahr der Welt (das Jahr des Auftrags, ohne es das des Schnitts) vor MAUER_BIS liegt (mensch.macht.wehrbau#3:
// die Entfestigung urteilt die Welt-Zeit, auch wo die Chronik früher endet), kein Haus in ihr.
const JAHRESRINGE = ["mittelalter", "hanse", "gruenderzeit", "moderne"];
// die Überdeckung je Slot: der Anteil der 3 × 3 Punkte jedes Grundrisses des älteren Plans, die ein Grundriss des jüngeren trägt
const ueberdeckung = (FC, alt, jung) =>
    ((d) => +(d.filter(Boolean).length / d.length).toFixed(3))(
        alt.slots.flatMap(({ obb: b }) =>
            [-1, 0, 1, -1, 0, 1, -1, 0, 1]
                .map((u, i) => lokal(0, 0, -b.phi, u * b.ex, ((i / 3) | 0) * b.ez - b.ez))
                .map(([x, z]) => jung.slots.some((t) => FC.distPunktOBB(b.cx + x, b.cz + z, t.obb) < 1e-6))
        )
    );
// DIE GESTALT DER WEHR (mauer-im-stoff, fachwerk `mauerNetz` · `zaunNetz` · MAUER_GESTALT): je Form ihrer Zeit (MAUER_FORM.zeit)
// das Netz eines Wand-Stücks am Hang und eines Turms, dazu ein Zaun — jedes Dreieck zur Normale seiner Ecken gewunden, keine
// entartete Fläche, der Fuß `fuss` unter der Sehne, der Kopf in der Höhe des Gesetzes; die Zinne im Band der Quelle (Piper,
// Burgenkunde, Nachdruck 1994, S. 329: 0,76–2,35 m breit, 1–2 m hoch; de Caboga, Die Burg im Mittelalter, 1982: 0,70–2 m breit,
// 1–1,40 m hoch; die Scharte höchstens so breit wie die Zinne). `o.mut`: die Mutante dreht ein Dreieck des ersten Netzes.
function wehrGestalt(FC, o = {}) {
    // BÜHNE: der Ring ist die Eingabe des Kerns in node (keine Welt, kein Ort) — nur seine Maße zählen
    const ring = { R: 100, segs: [{ x0: 100, z0: 0, x1: 100, z1: 36 }], towers: [{ x: 100, z: 0 }], gates: [] };
    const G = FC.MAUER_GESTALT;
    const aus = { formen: [], fehl: [] };
    let gedreht = !o.mut;
    const pruef = (wer, netze, unten, oben, spiel = 0) => {
        let [tris, falsch, lo, hi] = [0, 0, Infinity, -Infinity];
        for (const N of netze) {
            const idx = Array.from(N.idx);
            if (!gedreht) {
                [idx[1], idx[2]] = [idx[2], idx[1]];
                gedreht = true;
            }
            for (let i = 1; i < N.pos.length; i += 3) [lo, hi] = [Math.min(lo, N.pos[i]), Math.max(hi, N.pos[i])];
            for (let t = 0; t < idx.length; t += 3) {
                const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]].map((i) => [N.pos[i * 3], N.pos[i * 3 + 1], N.pos[i * 3 + 2]]);
                const [u, v] = [b.map((x, k) => x - a[k]), c.map((x, k) => x - a[k])];
                const g = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
                tris++;
                if (
                    !(Math.hypot(...g) > 1e-9) ||
                    [idx[t], idx[t + 1], idx[t + 2]].some((i) => g[0] * N.nrm[i * 3] + g[1] * N.nrm[i * 3 + 1] + g[2] * N.nrm[i * 3 + 2] <= 0)
                )
                    falsch++;
            }
        }
        if (falsch) aus.fehl.push(`${wer}: ${falsch} von ${tris} Dreiecken gegen ihre Normale oder entartet`);
        if (Math.abs(lo - unten) > 1e-4 || hi > oben + 1e-4 || hi < oben - spiel - 1e-4)
            aus.fehl.push(`${wer}: Fuß ${lo.toFixed(3)} · Kopf ${hi.toFixed(3)} (Soll ${unten.toFixed(3)} · ${oben.toFixed(3)})`);
        return tris;
    };
    const fuss = 1.5;
    for (const [ab] of FC.MAUER_FORM.zeit) {
        const jahr = Number.isFinite(ab) ? ab + 1 : 900;
        const M = FC.mauerGestalt(ring, "mitteleuropa", jahr);
        const [W, K, T, D, BW] = [M.wand, M.krone, M.turm, M.dach, M.bollwerk];
        const holz = FC.gefuegeReihe(M.stoff) === FC.GEFUEGE_GESETZ.rolle.holz;
        const kopf = holz
            ? W.hoch + G.stamm.wechsel / 2
            : K
              ? K.y + K.hoch / 2 + (K.aussen ? 0 : G.zinne.brust + G.zinne.hoch)
              : W.hoch;
        const wand = FC.mauerNetz(M, { art: "wand", lang: 36, fuss, steig: 0, aussen: 1, saat: 7 });
        const hang = FC.mauerNetz(M, { art: "wand", lang: 36, fuss, steig: 0.2, aussen: -1, saat: 7 });
        const turm = FC.mauerNetz(M, { art: "turm", fuss, saat: 3 });
        const teile = wand.flatMap((N) => N.teile.map((x) => x.art));
        const zinnen = teile.filter((a) => a === "zinne").length;
        if (M.art === "steinring" && zinnen !== Math.floor((36 + W.ueber) / (G.zinne.breit + G.zinne.luecke)))
            aus.fehl.push(`steinring: ${zinnen} Zinnen auf 36 m`);
        const L = 36 + W.ueber;
        aus.formen.push({
            art: M.art,
            jahr,
            wand: pruef(M.art + " Wand", wand, -fuss, kopf, holz ? G.stamm.wechsel : 0),
            hang: pruef(M.art + " Wand am Hang", hang, -fuss - 0.1 * L, kopf + 0.1 * L, 0.5),
            turm: pruef(M.art + " Turm", turm, -fuss, BW ? BW.hoch + (K ? K.hoch : 0) : D && M.dachStoff ? D.y + D.hoch / 2 : T.hoch),
            teile: [...new Set(teile)].join("+"),
            zinnen,
        });
    }
    const zh = 0.1 * (6 + G.zaun.pfosten / 2); // der Hub des Hangs am letzten Pfosten (12 m, 0,1 je Meter)
    aus.zaun = pruef("Zaun", FC.zaunNetz(12, 0.1, 5), -G.zaun.fuss - zh, G.zaun.hoch + zh);
    const Z = G.zinne;
    aus.band = Z.breit >= 0.7 && Z.breit <= 2.35 && Z.hoch >= 1 && Z.hoch <= 2 && Z.luecke > 0 && Z.luecke <= Z.breit;
    return aus;
}
function jahresringe(FC, o = {}) {
    const J = { paare: [], fehl: [] };
    for (const seed of o.saaten || [1, 2, 3, 5, 7, 11, 13, 17]) {
        // die Zelle der Welt (`nH`): ihre Legende (mittelalter) und ihre Zahl, geschnitten am Ende jeder Epoche (das Jahr des Orts,
        // um die Saat-Verschiebung d ihrer Chronik)
        const [E, d] = [FC.EPOCHEN, FC.DORF({ seed, epoche: "moderne" }).jahr - FC.EPOCHEN.moderne.jahr];
        const dp = (epoche, k) => ({
            seed: o.ohneErbe ? seed + 101 * k : seed,
            ...(o.nH ? { nH: o.nH, epoche: "mittelalter", jahr: E[epoche].jahr + d + E[epoche].spanne } : { epoche }),
        });
        const P = JAHRESRINGE.map((epoche, k) => (o.ex || FC.exportSettlement)(dp(epoche, k)));
        J.paare.push(P.slice(1).map((jung, k) => ueberdeckung(FC, P[k], jung)));
        // die Epoche, die der Stand der Saat trägt (Teil T, `epocheDerSaat`): die Tracht, die Kirchen und der Turm folgen ihr —
        // ein Ort ohne Stahlbeton bleibt in der Gründerzeit
        const ep = (x, k) => x.technik?.epoche || JAHRESRINGE[k];
        const traegt = (x, c) => FC.kulturTechnik(c).every((t) => x.technik.stand.includes(t));
        const kirchen = new Set(P.map((x) => x.slots.find((s) => s.rolle === "kirche")?.kultur)).size;
        const epochen = new Set(P.map(ep)).size;
        const heute = o.nH ? FC.DORF(dp("moderne", 0)).groesse : "stadt";
        if (P.every((x, k) => ep(x, k) === JAHRESRINGE[k])) J.voll = (J.voll || 0) + 1;
        P.forEach((x, k) => {
            const fehl = (w) => J.fehl.push(`${seed}/${JAHRESRINGE[k]}: ${w}`);
            const welt = dp(JAHRESRINGE[k], k).jahr; // das Jahr der Welt des Auftrags (ohne Zahl keins: dann urteilt der Schnitt)
            if (JSON.stringify(x.kleidung) !== JSON.stringify(FC.EPOCHEN[ep(x, k)].tracht))
                fehl(`Kleidung ${JSON.stringify(x.kleidung)}`);
            if (k === 3 && ep(x, k) === "moderne" && (x.groesse !== heute || kirchen < epochen || !x.slots.some((s) => s.rolle === "turm")))
                fehl(`${x.groesse}, ${kirchen} Kirchen`);
            const quer = x.mauer?.segs.some((g) =>
                x.slots.some((s) =>
                    [0, 0.5, 1].some(
                        (f) => FC.distPunktOBB(g.x0 + (g.x1 - g.x0) * f, g.z0 + (g.z1 - g.z0) * f, s.obb) < 1
                    )
                )
            );
            if (!!x.mauer !== (x.staedtisch && Math.max(x.jahr, welt ?? -Infinity) < FC.MAUER_BIS) || quer)
                fehl(`Mauer ${x.mauer ? (quer ? "durch ein Haus" : "zu viel") : "fehlt"} (${x.groesse}, Ort der Welt ${welt ?? "—"}, Schnitt ${x.jahr})`);
            for (const s of x.slots)
                if (
                    s.baujahr > x.jahr + x.spanne ||
                    s.baujahr < { turm: 1905, halle: 1850 }[s.rolle] ||
                    !(
                        /kirche|scheune/.test(s.rolle) ||
                        // die Kultur aus der jüngsten Historie bis zum Baujahr, deren Bauweise der Stand trägt (sonst der Notbau)
                        (FC.REGION_HIST[x.region]
                            .filter(([ab]) => s.baujahr >= ab)
                            .map(([, n]) => n.filter((c) => FC.KULTUR[c] && traegt(x, c)))
                            .filter((n) => n.length)
                            .pop() || [FC.TECHNIK.notbau[x.region]]
                        ).includes(s.kultur)
                    )
                )
                    fehl(`${s.rolle} ${s.kultur} ${s.baujahr}`);
        });
    }
    return Object.assign(J, { min: Math.min(...J.paare.flat()) });
}

// ===== TEIL R (haus-gestalt, Karte mensch.bau.bauen): DIE BAUWEISE FOLGT DEM KLIMA — je Saat 1 … 200 das Dorf ohne Wort (18 Häuser)
// unter drei Klimaten des Orts (fachwerk `REGION_KLIMA`, `DP.klima` {winter, sommer}): die Heimat (−4 / 18 °C, gelaende-core
// TEMPERATUR), ein Mittelmeer-Ort (10 / 27, Athen) und ein subpolarer (−12 / 14). R1: kein Dorf trägt eine Region außerhalb ihres
// Klima-Bands (die Heimat: kein mediterranes, antikes, fernöstliches Dorf); R2: jedes Klima trägt mindestens zwei Regionen (der
// Wurf bleibt ein Wurf); R3 DIE GEGENPROBE: der Wechsel des Klimas ändert die Gestalt — die mittlere Dachneigung der Häuser der
// Heimat liegt ≥ 10° über der des Mittelmeer-Orts (Schnee und Regen gegen Sonne: steile Deckung im Norden), und das Fachwerk
// (Stil `alt`) steht in der Heimat, am Mittelmeer-Ort nicht; R4: ohne Klima (das Labor) würfelt der Kern über alle sechs Regionen
// (die Schwellen bis haus-gestalt; der Byte-Beweis des Labors steht im Commit). Mutante „der Kern liest das Klima nicht“ fällt in R1 beim Namen.
// Jedes Klima der Linse ist das Klima eines Orts nach dem EINEN Gesetz des Spiels (gelaende-core `ortKlima`, kultur-aus-klima): die
// Heimat mit Temperatur, Wasser-Spende und Niederschlag des Orts — den Schnee und die Trockenheit rechnet das Gesetz, nie die Linse.
// Der Niederschlag ohne Zahl ist der der Heimat; der Mittelmeer-Ort trägt den Athens (≈ 400 mm/a, BSh nach Kottek et al. 2006).
let _GC = null;
const gelaende = () => _GC || (_GC = studioKern("gelaende-core.js", "__gelaendeCore"));
function ortKlimaVon({ winter, sommer, spendeVerh, niederschlagMm }) {
    const GC = gelaende(),
        H = GC.ortGesetz(null);
    const N = niederschlagMm ?? H.klimaHeute.niederschlagMm;
    return GC.ortKlima({ ...H, spendeVerh, klimaHeute: { ...H.klimaHeute, winter, sommer, niederschlagMm: N } });
}
const KLIMA_ORTE = {
    heimat: { winter: -4, sommer: 18, spendeVerh: 1 },
    mittelmeer: { winter: 10, sommer: 27, spendeVerh: 1, niederschlagMm: 400 },
    subpolar: { winter: -12, sommer: 14, spendeVerh: 1 },
};
// R5 (haus-stoff): DER SOCKEL FOLGT DEM WASSER DES ORTS — dasselbe Dorf (Saat 7, 18 Häuser, das Klima der Heimat) am trockenen
// Ort (Spende 0), in der Heimat (1) und am nassen (2): jeder Bau trägt die Sockel-Höhe aus fachwerk `sockelImWasser` im Rezept
// (`ov.foundH`), und seine Hülle (`ext.y1`, die Masse des Baus aus `massBau`) steigt vom trockenen zum nassen Ort um
// genau den Unterschied der Sockel (Soll 0,50 m: 0,30 → 0,80). Die Mutante „der Sockel liest das Wasser nicht“ fällt in R5.
const SOCKEL_SPENDEN = { trocken: 0, heimat: 1, nass: 2 };
function sockelGang(FC) {
    const je = {};
    for (const [ort, v] of Object.entries(SOCKEL_SPENDEN)) {
        const ex = FC.exportSettlement({ seed: 7, nH: 18, klima: ortKlimaVon({ winter: -4, sommer: 18, spendeVerh: v }) });
        je[ort] = { region: ex.region, fh: ex.slots.map((q) => q.ov.foundH), y1: ex.slots.map((q) => q.ext.y1) };
    }
    const n = je.trocken.y1.length;
    const hub = je.nass.y1.map((y, i) => +(y - je.trocken.y1[i]).toFixed(3));
    const soll = +(FC.sockelImWasser({ spendeVerh: 2 }) - FC.sockelImWasser({ spendeVerh: 0 })).toFixed(3);
    return { je, n, hub, soll, gleich: hub.filter((d) => Math.abs(d - soll) < 0.005).length };
}
function sockelUrteil(S, check) {
    const fh = (o) => [...new Set(S.je[o].fh)].join("/");
    check(
        `R5 die Gegenprobe: der Sockel folgt dem Wasser — trocken ${fh("trocken")} m · Heimat ${fh("heimat")} m · nass ${fh("nass")} m, die Hülle steigt vom trockenen zum nassen Ort um ${S.soll} m an ${S.gleich} von ${S.n} Bauten`,
        S.soll >= 0.4 && S.gleich === S.n && S.n > 0 && S.je.trocken.region === S.je.nass.region,
        "Hub je Bau " + S.hub.join(",")
    );
}
const KLIMA_SAATEN = Array.from({ length: 200 }, (_, i) => i + 1);
function klimaGang(FC) {
    const je = {},
        aus = {},
        unter = [];
    for (const [ort, k0] of Object.entries(KLIMA_ORTE)) {
        const k = ortKlimaVon(k0);
        const R = {},
            neig = [],
            stil = {},
            deck = {};
        for (const s of KLIMA_SAATEN) {
            const d = FC.DORF({ seed: s, nH: 18, klima: k });
            R[d.region] = (R[d.region] || 0) + 1;
            for (const h of d.houses) {
                const p = h.p || h;
                if (isFinite(p.pitchDeg)) neig.push(p.pitchDeg);
                deckWand(FC, p, ort + " " + s, unter);
                deck[p.deckung || "?"] = (deck[p.deckung || "?"] || 0) + 1;
                const st = (FC.KULTUR[p.kultur] || {}).stil || "?";
                stil[st] = (stil[st] || 0) + 1;
            }
        }
        je[ort] = {
            regionen: R,
            neigung: +(neig.reduce((a, b) => a + b, 0) / Math.max(1, neig.length)).toFixed(1),
            stil,
            deck,
        };
        aus[ort] = Object.keys(R).filter((r) => {
            const z = FC.REGION_KLIMA.find((q) => q.region === r);
            return (
                !z ||
                k.winter < z.winter[0] ||
                k.winter > z.winter[1] ||
                k.sommer < z.sommer[0] ||
                k.sommer > z.sommer[1]
            );
        });
    }
    // R4: ohne Klima (das Labor) würfelt der Kern über ALLE Regionen von REGION_KLIMA
    const labor = new Set(
        KLIMA_SAATEN.map((s) => {
            const d = FC.DORF({ seed: s, nH: 18 });
            for (const h of d.houses) deckWand(FC, h.p || h, "labor " + s, unter);
            return d.region;
        })
    );
    const r4 = FC.REGION_KLIMA.filter((q) => !labor.has(q.region)).map((q) => q.region);
    // jede Kultur aus dem Rezept (200 Würfe) und jeder Stil für sich: keine Deckung unter ihrer Regel
    for (const k of Object.keys(FC.KULTUR)) for (const s of KLIMA_SAATEN) deckWand(FC, Object.assign(FC.bauRezept({ bauweise: k }, null, s), { kultur: k }), "kultur " + k + " " + s, unter);
    for (const st of ["alt", "modern", "huette", "stein", "glas", "klinker", "stroh"]) {
        const g = FC.grenzNeigung({ stil: st }),
            d = FC.deckungVon({ stil: st });
        if (g < FC.DECKUNG_GESETZ[d].grad) unter.push(`stil ${st}: Grenze ${g}° unter ${d} ${FC.DECKUNG_GESETZ[d].grad}°`);
    }
    return { je, aus, r4, unter, sockel: sockelGang(FC), dach: dachGang(FC), regen: regenGang(FC), planet: planetGang(FC), sprache: spracheGang(FC), baum: baumGang(FC), himmel: himmelGang(FC), mundart: mundartGang(FC) };
}
function klimaUrteil(K, check) {
    const fremd = Object.entries(K.aus)
        .filter(([, l]) => l.length)
        .map(([o, l]) => o + ": " + l.join(","));
    check(
        "R1 kein Dorf trägt eine Region außerhalb des Klima-Bands seines Orts (REGION_KLIMA)",
        !fremd.length,
        fremd.join(" · ")
    );
    const eng = Object.entries(K.je)
        .filter(([, v]) => Object.keys(v.regionen).length < 2)
        .map(([o]) => o);
    check("R2 jedes Klima trägt mindestens zwei Regionen (der Wurf bleibt ein Wurf)", !eng.length, eng.join(","));
    const [h, m] = [K.je.heimat, K.je.mittelmeer];
    check(
        `R3 die Gegenprobe: die Heimat deckt steiler als der Mittelmeer-Ort (${h.neigung}° gegen ${m.neigung}°, Soll ≥ 10°) und trägt Fachwerk (alt ${h.stil.alt || 0}), der Mittelmeer-Ort keins (alt ${m.stil.alt || 0})`,
        h.neigung - m.neigung >= 10 && (h.stil.alt || 0) > 0 && !(m.stil.alt > 0)
    );
    check("R4 ohne Klima (das Labor) würfelt über alle sechs Regionen", !K.r4.length, K.r4.join(","));
    if (K.sockel) sockelUrteil(K.sockel, check);
    check(
        `R6 keine Deckung unter ihrer Regeldachneigung (DECKUNG_GESETZ) — über 200 Saaten in drei Klimaten und im Labor, jede Kultur in 200 Würfen, jeder Stil: ${K.unter.length} darunter`,
        !K.unter.length,
        K.unter.slice(0, 6).join(" · ")
    );
    if (K.dach) dachUrteil(K.dach, check);
    if (K.regen) regenUrteil(K.regen, check);
    if (K.planet) planetUrteil(K.planet, check);
    if (K.sprache) spracheUrteil(K.sprache, check);
    if (K.baum) baumUrteil(K.baum, check);
    if (K.himmel) himmelUrteil(K.himmel, check);
    if (K.mundart) mundartUrteil(K.mundart, check);
}
// R6/R7 (haus-dach): DIE DECKUNG FOLGT DEM ORT, DIE NEIGUNG DER DECKUNG — R6 die Wand: kein Bau trägt eine Deckung unter ihrer
// Regeldachneigung (Reet 45°, Mönch-Nonne 40°, Biber 30°, Schiefer 26,5°, Schindel 22°, Hohlziegel 16,7°; fachwerk DECKUNG_GESETZ);
// bis haus-dach stand der Stil `stroh` bei 38° unter der Reet-Regel. R7 die Gegenprobe: dasselbe Dorf des Messorts (Same 4291161376,
// 13 Häuser, −4 / 18 °C) im nassen Land (Spende 1, die Heimat) und im trockenen Schnee-Land (Spende 0,5) — ohne neue Vorlage (dieselben
// Kulturen) wechselt die Deckung (Reet ↔ Schindel) und mit ihr die Neigung und die Schneelast μ1 = 0,8·(60°−α)/30° (EN 1991-1-3).
function deckWand(FC, p, wo, unter) {
    const d = FC.deckungVon(p),
        g = FC.DECKUNG_GESETZ[d].grad;
    if (!(p.pitchDeg >= g)) unter.push(`${wo} ${p.kultur || p.stil}: ${d} bei ${p.pitchDeg}° (Regel ${g}°)`);
}
const mu1 = (a) => (a <= 30 ? 0.8 : a >= 60 ? 0 : (0.8 * (60 - a)) / 30);
const DACH_ORTE = { nass: { winter: -4, sommer: 18, spendeVerh: 1 }, trocken: { winter: -4, sommer: 18, spendeVerh: 0.5 } };
function dachGang(FC) {
    const je = {};
    for (const [ort, k] of Object.entries(DACH_ORTE)) {
        const d = FC.DORF({ seed: 4291161376, nH: 13, klima: ortKlimaVon(k) }),
            hs = d.houses.map((h) => h.p || h);
        const deck = {};
        for (const p of hs) deck[p.deckung] = (deck[p.deckung] || 0) + 1;
        const mittel = (f) => +(hs.reduce((a, p) => a + f(p), 0) / Math.max(1, hs.length)).toFixed(2);
        je[ort] = { region: d.region, kulturen: hs.map((p) => p.kultur).join(","), deck, neigung: mittel((p) => p.pitchDeg), mu: mittel((p) => mu1(p.pitchDeg)) };
    }
    return je;
}
function dachUrteil(D, check) {
    const [n, t] = [D.nass, D.trocken],
        z = (o) => Object.entries(o.deck).map(([k, v]) => k + " " + v).join(", ");
    check(
        `R7 die Gegenprobe: die Deckung folgt dem Ort — nass ${z(n)} (Neigung ${n.neigung}°, μ1 ${n.mu}) · trocken ${z(t)} (Neigung ${t.neigung}°, μ1 ${t.mu}), dieselben Kulturen`,
        n.kulturen === t.kulturen && (n.deck.reet || 0) > 0 && !(t.deck.reet > 0) && (t.deck.schindel || 0) > 0 && n.neigung - t.neigung >= 2,
        n.kulturen === t.kulturen ? "" : "die Vorlage wechselt"
    );
}
// R8 (kultur-aus-klima, Karte 2 mensch.kopplung.kultur#2): DAS DACH FOLGT DEM NIEDERSCHLAG — 32 Saaten der Heimat (14 Häuser) an
// drei Orten, die nur der Niederschlag trennt: das Ort-Gesetz des Spiels (gelaende-core `ortGesetz`, Δ Regen-Quote −0,3 · 0 · +0,3 →
// ≈ 76 · 548 · 1 897 mm/a bei der Temperatur der Heimat), sein Klima (`ortKlima`: Niederschlag und Schneefall) in den Plan. Das Soll
// des Richters: die Neigung folgt dem Niederschlag (r über (N, mittlere Neigung) ≥ 0,5), jeder trockene und jeder nasse Plan deckt
// anders als derselbe in der Heimat (≥ 90 %), der Gegenlauf (die Heimat zweimal) ist gleich, das trockene Land deckt flacher als die
// Heimat und die Heimat nicht steiler als das nasse. Die Mutante „das Dach liest den Niederschlag nicht“ (die Neigung vor dem Schnitt:
// nur Kultur, Samen und die Grenze der Deckung; fachwerk-core.js `_bauweiseWurf`) fällt in R8 beim Namen.
const REGEN_ORTE = { heimat: 0, trocken: -0.3, nass: 0.3, gegen: 0 };
// der Pol der Probe: 9 K kälter als die Heimat (−13 / 9 °C) und trocken (Δ Regen-Quote −0,35 → 26 mm) — unter der Grenze B allein
// (A = 26 / 100 = 0,26) läge er in der Wüste, erst die Reihe Kotteks (E vor B) nimmt ihn heraus
const [POL_KALT, POL_REGEN] = [-9, -0.35];
const REGEN_SAATEN = Array.from({ length: 32 }, (_, i) => (((i * 2654435761) >>> 0) % 100000) + 1);
function regenKlima(dq, kalt = 0) {
    const GC = gelaende();
    if (dq === 0 && !kalt) return GC.ortKlima(GC.ortGesetz(null));
    const d = {
        wildnis: {},
        meer: { waterLevelM: 0 },
        klima: { sommer: kalt, winter: kalt, tagAmp: 0, sommerPhase: 0, spendeVerh: 1 },
        wetter: { regenQuote: dq, sturmQuote: 0, nebelQuote: 0 },
        wuchs: { decke: 1, wald: 1 },
        eis: { zeit: 0 },
    };
    return GC.ortKlima(GC.ortGesetz({ samen: "linse-r8", version: "linse-r8", breite: 0, laenge: 0, zeitMa: 0, delta: d }));
}
function regenGang(FC) {
    const kl = Object.fromEntries(Object.entries(REGEN_ORTE).map(([o, dq]) => [o, regenKlima(dq)]));
    const paare = [],
        bild = {},
        je = { heimat: [], trocken: [], nass: [] };
    for (const s of REGEN_SAATEN)
        for (const o of Object.keys(REGEN_ORTE)) {
            const hs = FC.DORF({ seed: s, nH: 14, klima: kl[o] }).houses.map((h) => h.p || h);
            const dach = hs.reduce((q, p) => q + (p.pitchDeg || 0), 0) / Math.max(1, hs.length);
            (bild[s] = bild[s] || {})[o] = JSON.stringify(hs.map((p) => [p.kultur, p.deckung, p.pitchDeg]));
            if (o !== "gegen") paare.push([kl[o].niederschlagMm, dach]), je[o].push(dach);
        }
    const m = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
    const [mx, my] = [m(paare.map((p) => p[0])), m(paare.map((p) => p[1]))];
    let [sxy, sxx, syy] = [0, 0, 0];
    for (const [x, y] of paare) (sxy += (x - mx) * (y - my)), (sxx += (x - mx) ** 2), (syy += (y - my) ** 2);
    let [mut, gegen] = [0, 0];
    for (const s of REGEN_SAATEN) {
        mut += (bild[s].trocken !== bild[s].heimat) + (bild[s].nass !== bild[s].heimat);
        gegen += bild[s].gegen === bild[s].heimat;
    }
    // DER POL ZUERST (Kottek u. a. 2006: E vor B): ein trockener Himmel 9 K kälter (der Sommer der Heimat 18 → 9 °C, unter der
    // Grenze +10 °C des wärmsten Monats) ist kein Trockenklima — kein Plan deckt dort flach, das Dach folgt dem Schnee
    const kp = regenKlima(POL_REGEN, POL_KALT);
    let [polFlach, polHaeuser, polDach] = [0, 0, 0];
    for (const s of REGEN_SAATEN)
        for (const h of FC.DORF({ seed: s, nH: 14, klima: kp }).houses.map((h) => h.p || h))
            (polHaeuser += 1), (polFlach += h.deckung === "flach"), (polDach += h.pitchDeg || 0);
    return {
        pol: { sommer: kp.sommer, N: Math.round(kp.niederschlagMm), flach: polFlach, n: polHaeuser, dach: +(polDach / Math.max(1, polHaeuser)).toFixed(2) },
        r: syy > 0 ? +(sxy / Math.sqrt(sxx * syy)).toFixed(3) : 0,
        mutation: +((100 * mut) / (2 * REGEN_SAATEN.length)).toFixed(1),
        gegen,
        n: REGEN_SAATEN.length,
        N: Object.fromEntries(Object.entries(kl).map(([o, k]) => [o, Math.round(k.niederschlagMm)])),
        dach: Object.fromEntries(Object.entries(je).map(([o, a]) => [o, +m(a).toFixed(2)])),
    };
}
// R10 (kultur-aus-klima 2, Karte 2 mensch.kopplung.kultur#2): DIE DÄCHER DES PLANETEN — die Reise-Ziele des Standard-Planeten
// („anazh-realm-seed“, 1 200 Fibonacci-Punkte, Land im Relief, Band 16 km wie der Satz „reise“), je Ziel das Δ des Planet-Fadens
// (planet-core `planetOrt`, wie voxel-worker `planetOrtAuftrag`) durch das Ort-Gesetz (`ortGesetz(teil)` → `ortKlima`) in die Dörfer
// derselben vier Saaten (fachwerk `DORF`, wie der Wirt sie stempelt). Die Klassen nach Kottek u. a. 2006 in ihrer Reihe (E vor B vor
// A/C/D, gelesen vom Richter an der Quelle); das Soll je Klasse ist die Form des Gesetzes am Haus: die Wüste (BW) deckt JEDES Dach flach
// (Lehm, nie steiler als `flach` = 8°, die Grenze, unter der ein Dach als flach gilt, wie STADT_MASSEN der Stadt-Masse), der Pol nie
// flach, der warme Süden (Winter ≥ 4 °C) in Kanal-Ziegeln (≥ 95 %), das kühle nasse Land in Reet oder steiler als 40° (≥ 95 %).
// Gemessen 26.11. an 4 000 Punkten und 8 Saaten (Kopf 1 → Kopf 2): Wüste 38 066 → 38 729 von 38 729 Häusern flach (die 663 waren das
// Werk des Stils — modern 14–16°, glas 11° — und der Schiefer der Kultur auf 26,5°), Pol 0 flach, Süden 98,1 %, nass 97,0 %. Am alten
// Kern (die Neigung aus Kultur und Samen) deckt die Wüste 0 %.
const PLANET_DACH = { samen: "anazh-realm-seed", punkte: 1200, saaten: [4291161376, 7, 11, 23, 101, 777, 4242, 90001], soll: { wueste: 1, sueden: 0.95, nass: 0.95 }, kottek: { polar: 10, bw: 5, bs: 10 }, flach: 8 };
function planetGang(FC) {
    const GC = gelaende(),
        P = require(path.join(root, "planet-core.js")),
        RAD = Math.PI / 180,
        plan = P.planetPlan(PLANET_DACH.samen, P.PLANET_ERDE),
        S = P.planetScheibe(plan, 0),
        og = GC.ortGesetz(),
        K = PLANET_DACH.kottek;
    // die Klasse liest der Richter selbst an der Quelle (Kottek u. a. 2006, Tafel 1), nie am Gesetz, das er prüft: E, wo der wärmste
    // Monat unter +10 °C bleibt; BW, wo P_ann < 5 · P_th (P_th = 2 T_ann + 14, mm und °C); BS bis 10 · P_th
    const klasse = (k) => {
        const pth = 2 * ((k.winter + k.sommer) / 2) + 14;
        if (k.sommer < K.polar) return "polar";
        if (pth > 0 && k.niederschlagMm < K.bw * pth) return "wueste";
        if (pth > 0 && k.niederschlagMm < K.bs * pth) return "steppe";
        return k.winter >= 4 ? "sueden" : k.spendeVerh >= 1 ? "nass" : "kalt";
    };
    // die Wüste liest der Richter am BAU (kultur-aus-klima 4): das Dach, das HAUS baut (der Mass-Bau des Gesetzbuchs, `MASSNUR`, wie
    // los-proben; Masse „haupt“: dach · curve · dachRolle, „rund“: spitze · zwiebel), nie das Plan-Feld allein — bis Kopf 3 stand der Plan
    // auf „flach, 2°“ und HAUS baute darauf den Sattel mit Ziegeln und Schwung (544 von 12 336 flach gebaut). Flach ist die Platte ohne
    // Schwung im Lehm der Deckung (`dachmod`) oder der flache Rundbau; das Gewölbe (Kuppel, Tonne, Zwiebel) trägt sich ohne Balken und
    // bleibt. Gebaut wird je Signatur des Plans (alle Felder außer Maß, Same, Alter, Bewohner — das Dach liest keins davon) einmal.
    const bauSig = {},
        bau = (h) => {
            const q = Object.assign({}, h);
            for (const k of ["W", "D", "storeys", "seed", "baujahr", "wohl", "leute", "parent", "foundH", "col", "mark", "parzelle", "programm"]) delete q[k];
            const sig = JSON.stringify(q);
            if (bauSig[sig]) return bauSig[sig];
            const H = FC.HAUS(globalThis.THREE, (r) => ({ __role: r }), Object.assign({}, h, { nur: FC.MASSNUR, __nurMass: true }));
            H.build(FC.LOD1F);
            const M = H.masse || [],
                m = M.find((x) => x.art === "haupt") || M.find((x) => x.art === "rund") || {},
                dach = m.art === "rund" ? (m.zwiebel ? "rund:gewoelbe" : m.spitze - m.y1 <= 0.2 ? "flat" : "rund") : String(m.dach);
            return (bauSig[sig] = {
                dach,
                schwung: m.curve > 0,
                flach: dach === "flat" && !(m.curve > 0) && (m.art === "rund" || m.dachRolle === "dachmod"),
                gewoelbe: dach === "dome" || dach === "rund:gewoelbe" || dach === "alt:tonne" || dach === "alt:zwiebel",
            });
        };
    const form = {
        wueste: (h, Z) => {
            const B = bau(h);
            (Z.bauFlach += B.flach), (Z.gewoelbe += B.gewoelbe), (Z.schwung += B.schwung);
            if (!B.flach && !B.gewoelbe) Z.anders[h.kultur + "/" + B.dach] = (Z.anders[h.kultur + "/" + B.dach] || 0) + 1;
            return h.deckung === "flach" && h.pitchDeg <= PLANET_DACH.flach && (B.flach || B.gewoelbe);
        },
        sueden: (h) => h.deckung === "hohlziegel",
        nass: (h) => h.deckung === "reet" || h.pitchDeg >= 40,
    };
    const je = {};
    for (let i = 0, N = PLANET_DACH.punkte; i < N; i++) {
        const y = 1 - (2 * (i + 0.5)) / N,
            th = Math.PI * (3 - Math.sqrt(5)) * i;
        const [b, l] = [Math.round((Math.asin(y) / RAD) * 100) / 100, Math.round((Math.atan2(Math.sin(th), Math.cos(th)) / RAD) * 100) / 100];
        const p = {};
        P.planetPunkt(S, b * RAD, l * RAD, 16, p);
        if (!(p.hoeheM > 0)) continue;
        const d = P.planetOrt(S, b * RAD, l * RAD, og, undefined, plan).delta;
        const teil = { samen: PLANET_DACH.samen, version: P.VERSION, breite: b, laenge: l, zeitMa: 0, delta: { klima: d.klima, meer: d.meer, wetter: d.wetter, wuchs: d.wuchs, eis: d.eis, wildnis: d.wildnis } };
        const kl = GC.ortKlima(GC.ortGesetz(teil)),
            k = klasse(kl),
            Z = (je[k] = je[k] || { ziele: 0, haus: 0, form: 0, flach: 0, dorf: 0, dorfForm: 0, bauFlach: 0, gewoelbe: 0, schwung: 0, anders: {} });
        Z.ziele++;
        for (const s of PLANET_DACH.saaten) {
            const hs = FC.DORF({ seed: s, nH: 14, klima: kl }).houses.map((h) => h.p || h);
            let n = 0;
            for (const h of hs) (Z.haus += 1), (Z.flach += h.deckung === "flach"), (n += form[k] ? form[k](h, Z) : 0);
            (Z.form += n), (Z.dorf += 1), (Z.dorfForm += n === hs.length);
        }
    }
    return je;
}
function planetUrteil(J, check) {
    const A = (k) => (J[k] ? J[k].form / Math.max(1, J[k].haus) : 0),
        z = (k) => (J[k] ? `${k} ${J[k].form} von ${J[k].haus} Häusern (${(100 * A(k)).toFixed(1)} %, ${J[k].dorfForm} von ${J[k].dorf} Dörfern, ${J[k].ziele} Ziele)` : `${k} ohne Ziel`);
    const S = PLANET_DACH.soll,
        pol = J.polar || { flach: 0, haus: 0 },
        W = J.wueste || { bauFlach: 0, gewoelbe: 0, schwung: 0, haus: 0, anders: {} },
        anders = Object.entries(W.anders)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([k, n]) => `${k} ${n}`)
            .join(", ");
    check(
        `R10 die Dächer des Planeten (${PLANET_DACH.samen}, ${PLANET_DACH.punkte} Punkte) — ${z("wueste")} flach (Lehm ≤ ${PLANET_DACH.flach}°, gebaut: Platte im Lehm ${W.bauFlach}, Gewölbe ${W.gewoelbe}, Schwung ${W.schwung}${anders ? `; anders gebaut ${anders}` : ""}) · ${z("sueden")} in Kanal-Ziegeln · ${z("nass")} in Reet oder ≥ 40° · Pol flach ${pol.flach} von ${pol.haus} (Soll 0)`,
        A("wueste") >= S.wueste && !W.schwung && A("sueden") >= S.sueden && A("nass") >= S.nass && !pol.flach && J.wueste && J.wueste.ziele > 0
    );
}
function regenUrteil(G, check) {
    const D = G.dach;
    check(
        `R8 das Dach folgt dem Niederschlag — trocken ${G.N.trocken} mm ${D.trocken}° · Heimat ${G.N.heimat} mm ${D.heimat}° · nass ${G.N.nass} mm ${D.nass}°: r ${G.r} (Soll ≥ 0,5), Mutation ${G.mutation} % (Soll ≥ 90), Gegenlauf ${G.gegen} von ${G.n} gleich · der Pol zuerst (${G.pol.N} mm, Sommer ${G.pol.sommer} °C): flach ${G.pol.flach} von ${G.pol.n} (Soll 0), ${G.pol.dach}° (Soll über trocken)`,
        G.r >= 0.5 && G.mutation >= 90 && G.gegen === G.n && D.trocken < D.heimat && D.heimat <= D.nass && G.pol.flach === 0 && G.pol.dach > D.trocken
    );
}
// R9 (kultur-aus-klima, Karte 2 mensch.kultur.sprache#1): DER NAME FOLGT DER REGION — die 32 Saaten von R8 in der Heimat: je Plan
// der Ortsname (`ORTSNAME`) und 20 Leute (fachwerk `sprachName` vorname + familie, dasselbe Gesetz, das der Wirt `_bewohnerLauf`
// liest; Same des Hauses wie dort), jeder Name mit der Region seines Plans. Der Leser ist der der Station (k2-mensch-kultur.js
// `zuordnung`, wörtlich): je Name die Zweier-Laute, die Region mit der höchsten Wahrscheinlichkeit aus den ANDEREN Namen (Laplace).
// Soll: ≥ 2 Regionen, richtig zugeordnet ≥ 90 %. Die Mutante „die Sprache kennt keine Region“ (jeder Ort spricht das Gesetz
// Mitteleuropas) fällt in R9 beim Namen.
function spracheGang(FC) {
    // vor kultur-aus-klima trug der Kern kein Sprachgesetz (die Ortsnamen eine Silben-Liste je Region, die Leute eine Sprache ohne Region)
    if (typeof FC.sprachName !== "function") return { namen: 0, saaten: 0, zugeordnet: 0, beispiel: ["der Kern trägt kein Sprachgesetz (fachwerk sprachName fehlt)"] };
    const k = regenKlima(0),
        L = [];
    for (const seed of REGEN_SAATEN) {
        const plan = FC.DORF({ seed, nH: 14, klima: k }),
            S = FC.spracheVon(plan.region, plan.mundart), // der Plan ohne Ort spricht die Ursprache seiner Familie (sprache#4)
            nh = plan.houses.length;
        L.push({ w: plan.name, s: plan.region });
        for (let j = 0; j < 20; j++)
            L.push({ w: FC.sprachName(S, "vorname", seed + ":" + j) + " " + FC.sprachName(S, "familie", seed + ":" + (j % nh)), s: plan.region });
    }
    const bi = (w) => {
        const t = "^" + String(w).toLowerCase() + "$",
            o = [];
        for (let i = 0; i + 1 < t.length; i++) o.push(t.slice(i, i + 2));
        return o;
    };
    const saaten = [...new Set(L.map((x) => x.s))],
        B = L.map((x) => bi(x.w));
    const tafel = new Map(saaten.map((r) => [r, new Map()])),
        summe = new Map(saaten.map((r) => [r, 0]));
    L.forEach((x, i) => {
        const m = tafel.get(x.s);
        for (const g of B[i]) m.set(g, (m.get(g) || 0) + 1);
        summe.set(x.s, summe.get(x.s) + B[i].length);
    });
    let ok = 0;
    L.forEach((x, i) => {
        const eigen = new Map();
        for (const g of B[i]) eigen.set(g, (eigen.get(g) || 0) + 1);
        let [best, bw] = [null, -Infinity];
        for (const r of saaten) {
            const m = tafel.get(r),
                selbst = r === x.s,
                tot = summe.get(r) - (selbst ? B[i].length : 0);
            let w = 0;
            for (const g of B[i]) w += Math.log(((m.get(g) || 0) - (selbst ? eigen.get(g) : 0) + 1) / (tot + 900));
            if (w > bw) [best, bw] = [r, w];
        }
        if (best === x.s) ok++;
    });
    // DIE FUGE (das OCP, fachwerk `_ocp`): kein Name trägt zwei gleiche Konsonanten nebeneinander, die das Gesetz seiner Region nicht
    // trägt (`doppel`) — vor dem OCP 4,19 % von 36 000 Namen („Betzzel“, „Gonggros“, „Hesschon“)
    const fuge = L.filter((x) =>
        (String(x.w).toLowerCase().match(/([^aeiouyäöüøåæ ])\1/g) || []).some((d) => !FC.SPRACHE_GESETZ[x.s].doppel.includes(d))
    );
    return {
        namen: L.length,
        saaten: saaten.length,
        zugeordnet: +(ok / L.length).toFixed(3),
        fuge: fuge.length,
        fugeBeispiel: fuge.slice(0, 3).map((x) => x.w),
        beispiel: L.slice(0, 3).map((x) => x.w),
    };
}
function spracheUrteil(G, check) {
    check(
        `R9 der Name folgt der Region — ${G.namen} Namen aus ${G.saaten} Regionen (Soll ≥ 2), richtig zugeordnet ${G.zugeordnet} (Soll ≥ 0,9; ${G.beispiel.join(", ")}), Doppel-Laut ohne Gesetz an der Fuge ${G.fuge} (Soll 0${G.fuge ? ": " + G.fugeBeispiel.join(", ") : ""})`,
        G.saaten >= 2 && G.zugeordnet >= 0.9 && G.fuge === 0
    );
}
// R11 (Karte 2 mensch.kultur.sprache#3): DER STAMMBAUM IST AUS DEN WORTLISTEN LESBAR — je Familie (fachwerk `SPRACHE_GESETZ`) die
// 2^tiefe Blätter ihres Baums (die Saaten 1, 2, … bis jedes Blatt eine Sprache trägt), je Blatt die Wortliste der Grundliste
// (fachwerk `sprachWort`, `SPRACH_BAUM.bedeutungen`). Der Leser kennt nur die Formen: je Bedeutung ist jede Form eine Klasse, die
// Splits nach der Zahl der Bedeutungen, die sie tragen, gierig, solange verträglich (die Kompatibilität der Kognaten-Bäume:
// Buneman 1971; Ringe, Warnow & Taylor 2002). Gegen den wahren Baum (der Weg des Blatts, `zweig`) misst Robinson-Foulds (Robinson &
// Foulds 1981, normiert auf 2(n − 3)). Soll (Karte 2): U_eff ≥ 100 unterscheidbare Sprachen, ≥ 5 Familien, RF ≤ 0,3 in ≥ 70 % der
// Familien. Dazu der Leser in der Welt: jeder Ortsname (`ORTSNAME`, der Name auf der Karte und am Ort) beginnt mit einem Wort seiner
// Sprache (`SPRACH_BAUM.bestimmung`). Die Mutanten „die Wortliste kennt keinen Ersatz“ (nur die Lautgesetze: RF 0,36–0,62) und
// „der Ort liest die Wortliste nicht“ fallen in R11 beim Namen; der Kern ohne Wortliste (main bis kultur-aus-klima 3) auch.
function baumGang(FC) {
    const SB = FC.SPRACH_BAUM;
    if (typeof FC.sprachWort !== "function" || !SB || !Array.isArray(SB.bestimmung))
        return { familien: 0, ueff: 0, gut: 0, rf: [], leser: 0, namen: 0, beispiel: ["der Kern trägt keine Wortliste (fachwerk sprachWort fehlt)"] };
    const T = SB.tiefe,
        N = 1 << T,
        NB = SB.bedeutungen.length;
    const kanon = (S) => {
        const M = new Set(S),
            seite = M.has(0) ? [...Array(N).keys()].filter((k) => !M.has(k)) : [...M];
        return seite.sort((a, b) => a - b).join(",");
    };
    // der wahre Baum: je Knoten der Tiefe 1 … tiefe − 1 die Blätter unter ihm
    const wahr = new Set();
    for (let t = 1; t < T; t++)
        for (let q = 0; q < 1 << t; q++) {
            const S = [...Array(N).keys()].filter((x) => x >> (T - t) === q);
            if (S.length > 1 && S.length < N - 1) wahr.add(kanon(S));
        }
    const vertraeglich = (a, b) => {
        const A = new Set(a),
            B = new Set(b);
        let ab = 0,
            an = 0,
            nb = 0;
        for (const x of A) B.has(x) ? ab++ : an++;
        for (const x of B) if (!A.has(x)) nb++;
        return !ab || !an || !nb || N - ab - an - nb === 0;
    };
    const rf = [],
        listen = new Set(),
        beispiel = [];
    let leser = 0,
        namen = 0;
    for (const R of Object.keys(FC.SPRACHE_GESETZ)) {
        const blatt = new Array(N).fill(null);
        for (let s = 0; s < N; s++) {
            // je Blatt die Mundart, die ganz dieses Blatt spricht (fachwerk `mundartBlatt`; bis sprache-dialekt wählte der Same das Blatt)
            const L = FC.spracheVon(R, FC.mundartBlatt(s));
            blatt[L.blatt] = L;
            const name = String(FC.ORTSNAME(R, s + 1, FC.mundartBlatt(s))).toLowerCase();
            namen++;
            if (SB.bestimmung.some((b) => name.startsWith(FC.sprachWort(L, b)))) leser++;
            else if (beispiel.length < 3) beispiel.push(`${R} ${name}`);
        }
        const lex = blatt.map((L) => SB.bedeutungen.map((b) => FC.sprachWort(L, b)));
        lex.forEach((l) => listen.add(R + "|" + l.join(" ")));
        const zahl = new Map();
        for (let i = 0; i < NB; i++) {
            const kl = new Map();
            lex.forEach((l, k) => (kl.has(l[i]) ? kl.get(l[i]).push(k) : kl.set(l[i], [k])));
            for (const S of kl.values()) if (S.length > 1 && S.length < N - 1) zahl.set(kanon(S), (zahl.get(kanon(S)) || 0) + 1);
        }
        const an = [];
        for (const [k] of [...zahl.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))) {
            const S = k.split(",").map(Number);
            if (an.every((a) => vertraeglich(a, S))) an.push(S);
            if (an.length >= N - 3) break;
        }
        const gelesen = new Set(an.map(kanon)),
            gemein = [...wahr].filter((w) => gelesen.has(w)).length;
        rf.push({ R, rf: +((wahr.size - gemein + gelesen.size - gemein) / (2 * (N - 3))).toFixed(3) });
    }
    return {
        familien: rf.length,
        ueff: listen.size,
        gut: rf.filter((x) => x.rf <= 0.3).length,
        rf,
        leser,
        namen,
        beispiel,
    };
}
function baumUrteil(G, check) {
    const anteil = G.familien ? Math.round((100 * G.gut) / G.familien) : 0;
    check(
        `R11 der Stammbaum ist aus den Wortlisten lesbar — ${G.ueff} Sprachen (Soll ≥ 100) in ${G.familien} Familien (Soll ≥ 5), RF ≤ 0,3 in ${G.gut} von ${G.familien} (${anteil} %, Soll ≥ 70 %: ${G.rf.map((x) => x.R + " " + x.rf).join(" · ")}) · der Ortsname liest die Wortliste ${G.leser} von ${G.namen}${G.beispiel.length ? " (" + G.beispiel.join(", ") + ")" : ""}`,
        G.ueff >= 100 && G.familien >= 5 && anteil >= 70 && G.namen > 0 && G.leser === G.namen
    );
}
// R12 (sprache-familie, Karte 2 mensch.kopplung.kultur#2, die Station S2 am Fächer wörtlich): DER GEHALTENE HIMMEL HEBT DAS DACH —
// die 32 Saaten von R8 als Plan des Worts (14 Häuser, OHNE Klima: die Station bestellt `_foundryRequestSettlement({seed, nH})`) unter
// dem Himmel klar (kein Eingang, der Wirt `_himmelDesPlans` ohne Wort), Regen (`himmel` 0,6: die Zeile `regen` von WX_GESETZ, der EINE
// Wetter-Leser) und klar als Gegenlauf; dazu klar als Wort (`himmel` 0: derselbe Plan wie ohne Wort). Das Soll der Station: r über
// (Regen, mittlere Neigung) ≥ 0,5, Mutation ≥ 90 %, der Gegenlauf gleich. Die Mutante „das Dach liest den Himmel nicht“ (der Deck-Schritt
// ohne `himmelNeigung`; main bis sprache-familie: der Export kennt keinen Himmel) fällt in R12 beim Namen.
const HIMMEL_REGEN = 0.6;
function himmelGang(FC) {
    const hash = (P) => JSON.stringify(P.slots.map((x) => [x.kultur, x.x, x.z, x.ov && x.ov.W, x.ov && x.ov.D, x.ov && x.ov.storeys, x.ov && x.ov.pitchDeg, x.ov && x.ov.stil]));
    const dach = (P) => P.slots.reduce((q, x) => q + ((x.ov && x.ov.pitchDeg) || 0), 0) / P.slots.length;
    const paare = [];
    let mutation = 0, gegen = 0, wort0 = 0, sonne = 0, regen = 0;
    for (const seed of REGEN_SAATEN) {
        const a = FC.exportSettlement({ seed, nH: 14 }), b = FC.exportSettlement({ seed, nH: 14, himmel: HIMMEL_REGEN });
        const c = FC.exportSettlement({ seed, nH: 14 }), d = FC.exportSettlement({ seed, nH: 14, himmel: 0 });
        paare.push([0, dach(a)], [HIMMEL_REGEN, dach(b)]);
        (sonne += dach(a)), (regen += dach(b));
        mutation += hash(a) !== hash(b);
        gegen += hash(a) === hash(c);
        wort0 += hash(a) === hash(d);
    }
    const n = REGEN_SAATEN.length, mx = paare.reduce((q, x) => q + x[0], 0) / paare.length, my = paare.reduce((q, x) => q + x[1], 0) / paare.length;
    let sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of paare) (sxy += (x - mx) * (y - my)), (sxx += (x - mx) ** 2), (syy += (y - my) ** 2);
    const r = sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
    return { n, r: Math.round(r * 1000) / 1000, mutation: Math.round((1000 * mutation) / n) / 10, gegen, wort0, sonne: Math.round((10 * sonne) / n) / 10, regen: Math.round((10 * regen) / n) / 10 };
}
function himmelUrteil(G, check) {
    check(
        `R12 der gehaltene Himmel hebt das Dach — ${G.n} Pläne des Worts ohne Klima: klar ${G.sonne}° · Regen ${G.regen}°: r ${G.r} (Soll ≥ 0,5), Mutation ${G.mutation} % (Soll ≥ 90), Gegenlauf ${G.gegen} von ${G.n} gleich, klar als Wort ${G.wort0} von ${G.n} gleich dem freien Himmel`,
        G.r >= 0.5 && G.mutation >= 90 && G.gegen === G.n && G.wort0 === G.n
    );
}
// R13 (sprache-dialekt, Karte 2 mensch.kultur.sprache#4): DIE MUNDART FOLGT DEM TAL — je Welt-Saat von MUNDART_RAUM ein Gitter von
// Orten um den Ursprung (die Lage der Saat, gelaende-core `lageGrund`): je trockenem Ort die Senke seines Tals (`talWeg`, der Wirt
// `_mundartAm` liest dieselbe) und ihre Mundart (fachwerk `mundartVon`), je Familie seine Sprache (`spracheVon`). Gemessen wie die
// Station: die KL der Laut-Verteilung (Vokal-Ketten und Konsonanten der Grundliste, symmetrisch, Glättung 0,5) zwischen Nachbarn —
// p95 ≤ 0,2; die Wort-Isoglossen (ein Wort, das zwischen zwei Nachbarn wechselt) auf Barrieren (ein anderes Tal oder Wasser auf der
// Strecke) ≥ 70 % — die Basis (der Anteil der Barrieren-Kanten) steht daneben; U_eff ≥ 1 000 verschiedene Sprachen. Der Täter
// „die Sprache liest den Ort nicht“ (das Blatt aus dem Samen des Orts, main bis sprache-dialekt) fällt in R13 beim Namen.
const MUNDART_RAUM = { saaten: ["welt-1", "welt-2"], gitter: 32, schrittM: 1600, stich: 8 };
let _mundartOrte = null;
function mundartOrte() {
    if (_mundartOrte) return _mundartOrte;
    const GC = gelaende(),
        SNm = require(path.join(root, "vendor/simplex-noise.js")),
        SN = SNm.SimplexNoise || SNm,
        { gitter: G, schrittM: D, stich } = MUNDART_RAUM;
    _mundartOrte = MUNDART_RAUM.saaten.map((saat) => {
        const L = GC.lageGrund(saat, SN),
            H = (x, z) => GC.hoehe(L, x, z, false),
            orte = [];
        for (let i = 0; i < G; i++)
            for (let j = 0; j < G; j++) {
                const x = (i - G / 2) * D,
                    z = (j - G / 2) * D;
                let w = GC.talWeg(L, x, z);
                while (w.unter) w = w.unter;
                orte.push({ i, j, x, z, nass: H(x, z) < L.waterLevel, senke: w });
            }
        const kanten = [];
        for (const a of orte)
            for (const [di, dj] of [[1, 0], [0, 1]]) {
                const b = a.i + di < G && a.j + dj < G ? orte[(a.i + di) * G + a.j + dj] : null;
                if (!b || a.nass || b.nass) continue;
                let barriere = a.senke !== b.senke;
                for (let k = 1; k < stich && !barriere; k++) barriere = H(a.x + ((b.x - a.x) * k) / stich, a.z + ((b.z - a.z) * k) / stich) < L.waterLevel;
                kanten.push({ a, b, barriere });
            }
        return { saat, orte, kanten };
    });
    return _mundartOrte;
}
function mundartGang(FC) {
    if (typeof FC.mundartVon !== "function") return { kl: Infinity, iso: 0, basis: 0, ueff: 0, orte: 0, beispiel: ["der Kern trägt keine Mundart: fachwerk spracheVon(region, seed) — das Blatt ein Wurf des Samens, kein Ort im Raum (mundartVon fehlt)"] };
    const LAUT = /[aeiouyäöüøåæ]+|[^aeiouyäöüøåæ]/g,
        vert = new Map(),
        verteilung = (L) => {
            if (vert.has(L)) return vert.get(L);
            const m = new Map();
            let t = 0;
            for (const w of L.lex) for (const c of w.match(LAUT) || []) (m.set(c, (m.get(c) || 0) + 1), t++);
            vert.set(L, [m, t]);
            return [m, t];
        },
        kl = ([ma, ta], [mb, tb]) => {
            const K = new Set([...ma.keys(), ...mb.keys()]),
                na = ta + 0.5 * K.size,
                nb = tb + 0.5 * K.size;
            let d = 0;
            for (const k of K) {
                const p = ((ma.get(k) || 0) + 0.5) / na,
                    q = ((mb.get(k) || 0) + 0.5) / nb;
                d += 0.5 * (p * Math.log(p / q) + q * Math.log(q / p));
            }
            return d;
        };
    const R = Object.keys(FC.SPRACHE_GESETZ),
        kls = [],
        ueff = new Set(),
        beispiel = [];
    let iso = 0,
        isoB = 0,
        bar = 0,
        n = 0,
        orte = 0;
    for (const { saat, orte: O, kanten } of mundartOrte()) {
        const M = new Map(),
            mund = (o) => M.get(o.senke) || (M.set(o.senke, FC.mundartVon(saat, o.senke.x, o.senke.z)), M.get(o.senke));
        // DER LESER DES SPIELS: der Plan liest die Mundart (`DP.mundart`); der Täter liest den Samen des Orts — er steht hier für ihn
        const sprache = (r, o) => FC.spracheVon(r, mund(o));
        for (const o of O) if (!o.nass) (orte++, R.forEach((r) => ueff.add(r + "|" + sprache(r, o).lex.join(" "))));
        for (const { a, b, barriere } of kanten) {
            n++;
            if (barriere) bar++;
            for (const r of R) {
                const A = sprache(r, a),
                    B = sprache(r, b);
                kls.push(kl(verteilung(A), verteilung(B)));
                let q = 0;
                for (let i = 0; i < A.lex.length; i++) if (A.lex[i] !== B.lex[i]) q++;
                iso += q;
                if (barriere) isoB += q;
                if (q && !barriere && beispiel.length < 2 && q > 20) beispiel.push(`${saat} ${a.x}/${a.z}↔${b.x}/${b.z} ${r}: ${q} Wörter im selben Tal`);
            }
        }
    }
    kls.sort((x, y) => x - y);
    return {
        kl: kls.length ? +kls[Math.floor(kls.length * 0.95)].toFixed(3) : Infinity,
        iso: iso ? +(isoB / iso).toFixed(3) : 0,
        basis: n ? +(bar / n).toFixed(3) : 0,
        ueff: ueff.size,
        orte,
        beispiel,
    };
}
function mundartUrteil(G, check) {
    check(
        `R13 die Mundart folgt dem Tal — ${G.orte} Orte in ${MUNDART_RAUM.saaten.length} Welten: KL p95 zwischen Nachbarn ${G.kl} (Soll ≤ 0,2), Wort-Isoglossen auf Barrieren ${G.iso} (Soll ≥ 0,7; Basis ${G.basis}), U_eff ${G.ueff} (Soll ≥ 1 000)${G.beispiel.length ? " · " + G.beispiel.join(", ") : ""}`,
        G.kl <= 0.2 && G.iso >= 0.7 && G.ueff >= 1000
    );
}
const KLIMA_TAETER = {
    "der Kern liest das Klima nicht": [
        ["var im = Z.filter(function (z) { return klimaAbstand(z, klima) === 0; });", "var im = Z.slice();"],
    ],
    "der Sockel liest das Wasser nicht": [
        ["h = S.spritz + (S.heimat - S.spritz) * v;", "h = S.spritz + (S.heimat - S.spritz) * 1;"],
    ],
};
KLIMA_TAETER["die alte Grenze (stroh 38°, die Deckung zählt nicht)"] = [
    ["return Math.max(g, DECKUNG_GESETZ[deckungVon(P)].grad);", "return g;"],
    ["glas: 4, klinker: 22, stroh: 45 };", "glas: 4, klinker: 22, stroh: 38 };"],
];
KLIMA_TAETER["die Deckung liest den Ort nicht"] = [["if (klima.winter >= 4) return \"hohlziegel\";", "return d;"]];
// das alte Gesetz (vor kultur-aus-klima): die Neigung aus Kultur und Samen, die Grenze der Deckung — kein Niederschlag, kein Schnee
KLIMA_TAETER["die Sprache kennt keine Region"] = [['var R = SPRACHE_GESETZ[region] ? region : "mitteleuropa"', 'var R = "mitteleuropa"']];
// die Grundliste ohne den Ersatz des Worts (Lees 1953): nur die Lautgesetze tragen den Baum
KLIMA_TAETER["die Wortliste kennt keinen Ersatz"] = [["var ERSATZ = { halten: 0.86,", "var ERSATZ = { halten: 1,"]];
// der Ortsname aus einer Silbe der Ursprache (bis kultur-aus-klima 3): die Wortliste trägt keinen Namen der Welt
KLIMA_TAETER["der Ort liest die Wortliste nicht"] = [
    [
        "return _gross(_ocp(L, sprachWort(L, B[Math.floor(_sprachU(z, \"bestimmung\") * B.length) % B.length]) + L.grund[g])); }",
        "return _gross(_ocp(L, wandle(L, _urWort(L, z, _sprachU(z, \"n\") < 0.6 ? 1 : 2, false) + U.grund[g]))); }",
    ],
];
KLIMA_TAETER["die Fuge kennt kein OCP"] = [["var D = L.gesetz.doppel; return w.replace(", "var D = L.gesetz.doppel; return w; w.replace("]];
KLIMA_TAETER["das Dach liest den Niederschlag nicht"] = [
    ["b.pitchDeg=ortNeigung(DP.klima, b, b.pitchDeg, d0);", "b.pitchDeg=Math.max(b.pitchDeg, Math.ceil(grenzNeigung(b)));"],
    ["if (ariditaet(klima) <= DACH_KLIMA.wueste) return \"flach\";", ""],
];
// die Wüste ohne ihr Dach (die Deckung des Orts kennt die Trockenheit nicht): am Planeten deckt keine Wüste flach
KLIMA_TAETER["die Wüste deckt nicht flach"] = [["if (ariditaet(klima) <= DACH_KLIMA.wueste) return \"flach\";", ""]];
KLIMA_TAETER["die Wüste lässt das Werk des Stils stehen"] = [["if (A <= K.wueste) return K.flachGrad;", ""]];
// das Haus von Kopf 3 (der Plan sagt flach, HAUS baut den Sattel und behält den Schwung): die Wüste baut nicht, was sie deckt
KLIMA_TAETER["die Wüste baut den Sattel"] = [['P.zinnen || P.arkade || dachFlach(P, pitch) ? "flat"', 'P.zinnen || P.arkade ? "flat"']];
KLIMA_TAETER["die Wüste behält den Schwung"] = [["const DEF_cv=(P.roofCurve>0&&ROOFMODE!=='flat')?P.roofCurve:0", "const DEF_cv=(P.roofCurve>0)?P.roofCurve:0"]];
// das Gesetz ohne die Reihe Kotteks (B vor E): die Polwüste deckt flach wie die Wüste
KLIMA_TAETER["das Dach liest den Himmel nicht"] = [["b.pitchDeg=himmelNeigung(b, b.pitchDeg, DP.himmel);", ""]];
KLIMA_TAETER["die Trockenheit kennt den Pol nicht"] = [["if (klima.sommer < K.polar) return Infinity;", ""]];
// das Blatt als Wurf des Orts (der Täter von main bis sprache-dialekt: `spracheVon(region, seed)`, EIN Blatt je Ort, kein Raum): die
// Herde stehen je 5 m, ohne Fächer — jedes Tal zieht EIN beliebiges Blatt für alle Wörter, zwei Nachbarn sprechen so fremd wie zwei Enden
// der Welt. (Mit dem Fächer zöge jedes Wort sein eigenes Blatt: die Mischung gleicht jede Laut-Verteilung dem Mittel der Familie an.)
KLIMA_TAETER["die Sprache liest den Raum nicht"] = [["var SPRACH_RAUM = { sigma: 5000, faecher: 0.3 };", "var SPRACH_RAUM = { sigma: 5, faecher: 0 };"]];
// der Fächer fehlt: jedes Wort eines Tals stammt aus dem Kern-Blatt, die Isoglossen bündeln sich zu einer Linie, U_eff fällt auf die Blätter
KLIMA_TAETER["die Mundart kennt keinen Fächer"] = [["var SPRACH_RAUM = { sigma: 5000, faecher: 0.3 };", "var SPRACH_RAUM = { sigma: 5000, faecher: 0 };"]];
const KLIMA_SOLL = {
    "die Trockenheit kennt den Pol nicht": "R8",
    "das Dach liest den Himmel nicht": "R12",
    "die Wüste deckt nicht flach": "R10",
    "die Wüste lässt das Werk des Stils stehen": "R10",
    "die Wüste baut den Sattel": "R10",
    "die Wüste behält den Schwung": "R10",
    "der Kern liest das Klima nicht": "R1",
    "der Sockel liest das Wasser nicht": "R5",
    "die alte Grenze (stroh 38°, die Deckung zählt nicht)": "R6",
    "die Deckung liest den Ort nicht": "R7",
    "das Dach liest den Niederschlag nicht": "R8",
    "die Sprache kennt keine Region": "R9",
    "die Fuge kennt kein OCP": "R9",
    "die Wortliste kennt keinen Ersatz": "R11",
    "der Ort liest die Wortliste nicht": "R11",
    "die Sprache liest den Raum nicht": "R13",
    "die Mundart kennt keinen Fächer": "R13",
};


// ===== TEIL T (mensch.wirtschaft.technik): DIE TECHNIK WÄCHST AUS VORAUSSETZUNGEN — je Saat 1 … 20 der Ort ihrer Epoche
// (`siedlungsEpoche`, 60 Häuser) im Export: das Bild fragt den Graphen (fachwerk `technikImBild`: keine Technik im Bild, die der
// Stand der Saat nicht trägt, kein Vorgänger einer Technik im Bild außer dem Stand), der Stand gehorcht dem Gesetz, nachgerechnet
// aus den Stoff-Zeilen (jeder Vorgänger steht, jeder Stoff kommt am Ort vor, T_schmelz des Prozesses liegt unter der Grenze der
// Öfen der Vorgänger; ohne Zinn keine Bronze, ohne Kupfer keine Kuppel), die Saaten tragen verschiedene Stände, die Epoche des
// Orts trägt ihr Stand. Der Spike an EINEM Ort mit gesetzten Stoffen: alle Stoffe tragen Bronze, ohne Zinn fehlt sie, Eisen am
// Herd (Grenze Feldstein) statt am Schachtofen fehlt an der Temperatur. Die Mutanten fallen beim Namen (der Selbsttest).
const TECHNIK_SAATEN = Array.from({ length: 20 }, (_, i) => i + 1);
const TECHNIK_TAETER = {
    "Bronze ohne Zinn": [
        [
            "bronze:     { stoffe:['kupfer','zinn'], prozess:'bronze',    vor:['kupfer','zinn'],",
            "bronze:     { stoffe:['kupfer'],        prozess:'bronze',    vor:['kupfer'],",
        ],
    ],
    "Technik ohne Vorgänger im Bild": [
        [
            "alle.forEach((b,ai)=>{ technikBau(b,stand,region); schreibe(b,null); for(const f of za[ai].fr){ technikBau(f.v,stand,region); schreibe(f.v,b); } });",
            "alle.forEach((b,ai)=>{ schreibe(b,null); for(const f of za[ai].fr){ schreibe(f.v,b); } });",
        ],
    ],
    "jede Saat derselbe Stand": [["var s=Math.round(Number(samen)*1000)|0, V={}", "var s=0, V={}"]],
    "Eisen ohne Schachtofen": [["zuHeiss=T>0&&!(T<g);", "zuHeiss=false;"]],
};
function technikGang(FC, o = {}) {
    const S = globalThis.__schmiedeCore.STOFF_GESETZ, G = FC.TECHNIK.graph, tS = (x) => S.zeile(x).tSchmelz;
    const T = { ohneVor: 0, ohne: {}, imBild: {}, fehl: [], staende: new Set(), spike: [], bild: o.bild, saaten: o.saaten };
    const fehl = (w) => T.fehl.push(w);
    // der Graph: ≥ 10 Techniken mit Vorgänger, jeder Prozess und jedes Futter eine Stoff-Zeile mit T_schmelz
    const mitVor = Object.keys(G).filter((k) => G[k].vor.length);
    if (mitVor.length < 10) fehl(`Graph: ${mitVor.length} Techniken mit Vorgänger (Soll ≥ 10)`);
    for (const [k, t] of Object.entries(G))
        for (const x of [t.prozess, t.ofen].filter(Boolean)) if (!(tS(x) > 0)) fehl(`Graph: ${k} liest ${x} ohne T_schmelz`);
    for (const seed of o.saaten || TECHNIK_SAATEN) {
        const P = o.bild === false ? null : FC.exportSettlement({ seed, nH: 60, epoche: FC.siedlungsEpoche(seed) });
        // ohne Bild (der Selbsttest der Stände) der Stand der Saat in Mitteleuropa
        const TS = P ? P.technik : FC.technikStand(seed, "mitteleuropa");
        if (!TS || !Array.isArray(TS.stand)) {
            fehl(`${seed}: der Export trägt keinen Technik-Stand`);
            continue;
        }
        const st = TS.stand, V = TS.vorkommen, grenze = {};
        T.staende.add(st.join(","));
        // das Gesetz, nachgerechnet aus den Stoff-Zeilen
        for (const id of Object.keys(G).filter((k) => st.includes(k))) {
            const t = G[id], g = Math.max(0, ...t.vor.map((v) => grenze[v] || 0));
            for (const v of t.vor) if (!st.includes(v)) fehl(`${seed}: ${id} steht ohne Vorgänger ${v}`);
            for (const x of t.stoffe) if (!V[x]) fehl(`${seed}: ${id} steht ohne ${x} am Ort`);
            if (t.prozess && !(tS(t.prozess) < g)) fehl(`${seed}: ${id} schmilzt ${t.prozess} bei ${tS(t.prozess)} K über der Grenze ${g} K`);
            grenze[id] = Math.max(g, t.ofen ? tS(t.ofen) : 0);
        }
        if (!V.zinn && st.includes("bronze")) fehl(`${seed}: Bronze ohne Zinn am Ort`);
        if (!P) continue;
        if (P.technik.epoche && !FC.EPOCHEN[P.technik.epoche].technik.every((k) => st.includes(k)))
            fehl(`${seed}: die Epoche ${P.technik.epoche} trägt Technik außer dem Stand`);
        const B = FC.technikImBild(P);
        T.ohneVor += B.ohneVor;
        for (const [k, n] of Object.entries(B.ohne)) T.ohne[k] = (T.ohne[k] || 0) + n;
        for (const [k, n] of Object.entries(B.imBild)) T.imBild[k] = (T.imBild[k] || 0) + n;
        if (B.vorgaengerFehlt.length) fehl(`${seed}: Vorgänger außer dem Stand ${B.vorgaengerFehlt.join(" ")}`);
        if (!V.kupfer && B.imBild.kupfer) fehl(`${seed}: Kuppel aus Kupfer ohne Kupfer am Ort`);
    }
    // der Spike: EIN Ort, die Stoffe gesetzt
    const alle = Object.fromEntries(Object.keys(FC.TECHNIK.vorkommen).map((k) => [k, true]));
    const voll = FC.technikStand(1, "mitteleuropa", alle);
    const ohneZinn = FC.technikStand(1, "mitteleuropa", { ...alle, zinn: false });
    const amHerd = FC.technikStand(1, "mitteleuropa", alle, { ...G, eisen: { ...G.eisen, vor: ["feuer"] } });
    if (!voll.stand.includes("bronze") || voll.stand.length !== Object.keys(G).length)
        T.spike.push(`alle Stoffe: ${voll.stand.length} von ${Object.keys(G).length} Techniken, Bronze ${voll.stand.includes("bronze")}`);
    if (ohneZinn.stand.includes("bronze")) T.spike.push("ohne Zinn steht Bronze");
    if (amHerd.stand.includes("eisen") || !amHerd.fehlt.eisen || amHerd.fehlt.eisen.T < amHerd.fehlt.eisen.grenze)
        T.spike.push(`Eisen am Herd steht (${JSON.stringify(amHerd.fehlt.eisen || null)})`);
    return T;
}
// das Urteil des Gangs: T1 das Bild, T2 das Gesetz und der Spike, T3 die Saaten (die Namen tragen die Mutanten des Selbsttests)
function technikUrteil(T, check) {
    const n = (T.saaten || TECHNIK_SAATEN).length;
    if (T.bild !== false)
        check(
            `T1 BILD (${n} Saaten): ${T.ohneVor} Techniken ohne Voraussetzung im Bild, im Bild ${Object.keys(T.imBild).length} Techniken (Soll 0 · ≥ 5)`,
            T.ohneVor === 0 && Object.keys(T.imBild).length >= 5,
            `${JSON.stringify(T.ohne)} · ${JSON.stringify(T.imBild)}`
        );
    check(`T2 GESETZ: ${T.fehl.length} Brüche am Stand, Spike ${T.spike.length}`, !T.fehl.length && !T.spike.length, [...T.spike, ...T.fehl.slice(0, 6)].join(" · "));
    check(`T3 SAATEN: ${T.staende.size} verschiedene Stände über ${n} Saaten (Soll ≥ 2)`, T.staende.size >= 2, [...T.staende].join(" | "));
}

// ===== TEIL W (siedlung.K4 Staffel 2): DAS WACHSTUM — je Ort (Saat, Zahl) der Ort des Mittelalters über `WACHS_S` s Welt-Uhr in
// Takten von 60 s (fachwerk `wachstum`, die Furcht tetrapoda `furchtErinnert`): er wächst bis zur Gegenwart seiner Gestalt, jeder
// Plan des Gangs (je 10 min) liegt zu ≥ 0,8 im nächsten (die Jahresringe), der Gang in Takten ist der Gang am Stück. Aus
// Bewohnern: ohne Wohlstand (wohl → 0) und ohne Leute wächst nichts, nach dreimal gesehener Gewalt langsamer.
const WACHS_S = 3 * 3600;
function wachstumsGang(FC, o = {}, TC = studioKern("tetrapoda-core.js", "__tetrapodaCore")) {
    const [F, wf, W] = [TC.FURCHT_GESETZ, o.wachstum || FC.wachstum, { je: [], ringe: [], stueck: 0, halten: [] }];
    const lauf = (C, Z, ak = [], t = WACHS_S) => wf(C, Z, ak, t, (a) => TC.furchtErinnert(a, F), F.fluchtJeFurcht);
    for (const [seed, nH] of o.orte || [[1], [2], [3], [5, 24], [7, 24], [11, 96]]) {
        const ort = (jahr) => FC.exportSettlement({ seed, nH, epoche: "mittelalter", jahr });
        const [x0, Z0] = ((x) => [x, { jahr: x.jahr + x.spanne, kraft: 0, uhr: 0 }])(ort());
        const C = x0.chronik;
        let [Z, P] = [Z0, x0];
        for (let t = 60; t <= WACHS_S; t += 60) {
            Z = lauf(C, Z, [], t);
            if (t % 600 === 0 && Z.jahr !== Z0.jahr)
                [P, W.ringe[W.ringe.length]] = ((x) => [x, ueberdeckung(FC, P, x)])(ort(Z.jahr));
        }
        W.stueck += JSON.stringify(lauf(C, Z0)) !== JSON.stringify(Z);
        W.je.push(`${seed}/${nH || "-"} ${x0.slots.length}→${P.slots.length} ${Z.lose}/${C.jahre.length} ${Z.jahr}`);
        const halb = (ak) => lauf(C, Z0, ak, WACHS_S / 6).lose; // die Lose nach 30 min Welt-Uhr
        const mut = [{ wohl: C.wohl.map(() => 0) }, { leute: C.leute.map(() => 0) }];
        W.halten.push([
            ...mut.map((c) => +(lauf({ ...C, ...c }, Z0).jahr === Z0.jahr)),
            +(halb([1, 2, 3].map((t) => ({ t, type: "gewalt" }))) < halb()),
        ]);
        W.ganz = (W.ganz ?? true) && Z.lose === C.jahre.length;
    }
    return Object.assign(W, { min: Math.min(...W.ringe), halt: W.halten.flat().every(Boolean) });
}

// ===== TEIL WW (siedlung.K4, in der Welt): DAS JAHR UND DAS WACHSTUM — der Satz „dorf 7 300 jahr 1560" trägt sein Jahr, „dorf 7
// hanse" seine Epoche; die Akte mit Jahr 1320 und 1935 (`spawnSettlement`) stehen mit der Größe, dem Turm und der Tracht ihrer
// Epoche (`_bewohnerGestalten`); dann geht die Welt-Uhr `uhr` s vor: der Takt des Wachstums (`_ortWachstumTakt`) rechnet das
// Gesetz, der Ort von 1320 wird am neuen Jahr Welt und der Zug hebt seine neuen Häuser (`_tickAutoSettlement`) — mehr Häuser,
// die alten Einträge stehen (bis auf neu bebaute Lose), der Erdbau trägt sie; sein Nachbar von 1320 (Same 11, 180 m) wächst im
// selben Takt (WW4: bis w3w verschluckte der erste, der wuchs, den Takt). Läuft im Browser (jeMarke) — selbstgenügsam.
async function weltWachstum() {
    const res = (window.__kanal.res = { uhr: 1500 });
    window.__marke("WW-Satz");
    [res.satz, r.spawnSettlement] = [[], (o) => res.satz.push(o)];
    for (const w of ["dorf 7 300 jahr 1560", "dorf 7 hanse"]) r._chatDispatchLegacyCommand(w, [], () => {});
    delete r.spawnSettlement;
    const zellen = st.worldMeta.settlementCells || (st.worldMeta.settlementCells = {});
    const ort = async (jahr, x, seed = 7, z = 300) => {
        window.__marke(`WW-${jahr}`);
        await r.spawnSettlement({ seed, jahr, position: { x, y: 0, z } });
        const k = Object.keys(zellen).find((q) => zellen[q].seed === seed && Math.abs(zellen[q].x - x) < 200);
        const S = r._bewohnerSiedlungen.get(k);
        const haeuser = () =>
            S.plan.slots.map((s) => r._dorfHaus(S.ox + s.x, S.oz + s.z, s.seed >>> 0)).filter(Boolean);
        const P = S.plan;
        const kopf = {
            groesse: P.groesse,
            jahr: P.jahr + P.spanne,
            slots: P.slots.length,
            haeuser: haeuser().length,
            turm: P.slots.some((s) => s.rolle === "turm"),
            tracht: [...new Set(r._bewohnerGestalten(S).map((g) => g.ov.top))],
        };
        return { S, c: zellen[k], haeuser, kopf };
    };
    const [alt, neu, nach] = [await ort(1320, 700), await ort(1935, -700), await ort(1320, 700, 11, 120)];
    [res.alt, res.neu] = [alt.kopf, neu.kopf];
    const [E0, erd0, p] = [alt.haeuser(), st.worldMeta.erdbau[alt.c.ort].length, { x: alt.c.x, z: alt.c.z }];
    const wachse = async (m) => {
        window.__marke(m);
        r._weltUhrNimm(st.spielZeit + res.uhr);
        const takt = r._ortWachstumTakt(p);
        await r._ortWachsFlug;
        window.__anazhAutoSettlement = true;
        for (let i = 0; i < 4000 && (r._ortWachstumTakt(p), r._dorfOffen()); i++) {
            r._tickAutoSettlement(p);
            await new Promise(requestAnimationFrame);
        }
        delete window.__anazhAutoSettlement;
        return takt;
    };
    res.takt = await wachse("WW-Wachstum");
    res.nachbar = [nach.kopf.jahr, nach.c.wachs.jahr];
    const E1 = alt.haeuser();
    res.wuchs = {
        jahr: alt.c.wachs.jahr,
        slots: alt.S.plan.slots.length,
        haeuser: E1.length,
        erdbau: [erd0, st.worldMeta.erdbau[alt.c.ort].length],
        bleiben: +(E0.filter((e) => E1.includes(e)).length / E0.length).toFixed(3),
    };
    // DER KERN EINES RINGS: ein gesetztes Haus (Werk, sein Grund `haus:`) 6 m vor dem Rand des Orts; wächst er wieder, stehen die
    // neuen Häuser um das Haus — ihr Median näher an ihm als am Kern des Orts
    const R =
        6 + Math.max(...alt.S.plan.slots.map((s) => Math.hypot(s.obb.cx, s.obb.cz) + Math.hypot(s.obb.ex, s.obb.ez)));
    for (let a = 0; a < 8 && !res.haus; a++) {
        const [x, z] = [p.x + Math.cos(a * 0.785) * R, p.z + Math.sin(a * 0.785) * R];
        const Y = r.getTerrainHeightAt(x, z) + 0.5;
        if (r._landAt(x, z, 0.2) && r.spawnArchitecture("haus_alemannisch", { x, y: Y, z }, { seed: 4711, werk: true }))
            res.haus = [x, z];
    }
    for (let i = 0; i < 600 && !alt.c.kern; i++) await sleep(50);
    await wachse("WW-Kern");
    const ring = alt
        .haeuser()
        .filter((e) => !E1.includes(e))
        .map((e) => [e.position.x, e.position.z]);
    const med = (q) => rang(ring.map(([x, z]) => Math.hypot(x - q[0], z - q[1])).sort(aufsteigend));
    res.ring = { neu: ring.length, zumHaus: med(res.haus), zumOrt: med([p.x, p.z]) };
    return res;
}

// DER ORT AUF DEM GELÄNDE — Gefälle, Erdbau, `ortUrteil`, `ortVerdikt`, `poseSicht`, `gassenLicht` (rein): lib/ort-proben.cjs

// DER GT AUF DEM DORFWEG: im Browser, durch den echten Spiel-Takt (`_gameLoopTick`, feste 60-Hz-Frames) mit dem EINEN Fahrer am
// Steuer (`fahrerSetzen`: die Verb-Tafel, der Fahr-Schritt des Kerns — bis fahrzeug.K2 ein zweiter Fahrer aus W und A/D). Der
// Weg ist die längste Kette der Hauptwege (gen 0, Weg an Weg, wo der nächste beginnt, wo der vorige endet) des Plans, den die
// Welt trägt; der Wagen startet 2 m hinter ihrem Anfang in ihrer Richtung. Gemessen: der Fortschritt längs der Kette in `sek`
// Sekunden (gtWeg, `F.s`), die gefahrene Strecke, die größte Ablage von der Kette (`F.quer`) und der Anteil der Frames auf dem
// Weg. Läuft im Browser (page.evaluate) — selbstgenügsam.
async function gtDorfweg(v2, anker, sek) {
    const res = {};
    try {
        const wege = (v2.roads || []).filter((w) => w.gen === 0 && Array.isArray(w.pts) && w.pts.length > 1);
        const laenge = (w) =>
            w.pts.reduce((L, p, k) => (k ? L + Math.hypot(p.x - w.pts[k - 1].x, p.z - w.pts[k - 1].z) : 0), 0);
        let best = null;
        for (const w0 of wege) {
            const kette = [w0];
            for (let nx = w0; nx;) {
                const ende = nx.pts[nx.pts.length - 1];
                nx = wege.find((w) => !kette.includes(w) && Math.hypot(w.pts[0].x - ende.x, w.pts[0].z - ende.z) < 0.5);
                if (nx) kette.push(nx);
            }
            const L = kette.reduce((s, w) => s + laenge(w), 0);
            if (!best || L > best.L) best = { kette, L };
        }
        if (!best) return { err: "kein Hauptweg im Plan" };
        const P = [];
        for (const p of best.kette.flatMap((w) => w.pts)) {
            const q = { x: anker.x + p.x, z: anker.z + p.z };
            if (!P.length || Math.hypot(q.x - P[P.length - 1].x, q.z - P[P.length - 1].z) > 1e-3) P.push(q);
        }
        const hw = (best.kette[0].w || 5) / 2;
        res.kette = Math.round(best.L * 10) / 10;
        let tMs = performance.now();
        const frame = () => r._gameLoopTick((tMs += 1000 / 60));
        const u = Math.hypot(P[1].x - P[0].x, P[1].z - P[0].z);
        const a0 = { x: P[0].x + ((P[1].x - P[0].x) * 2) / u, z: P[0].z + ((P[1].z - P[0].z) * 2) / u };
        const fahrt = Math.atan2(P[1].x - P[0].x, P[1].z - P[0].z); // Bug (sin, cos)
        st.playerMesh.position.set(
            a0.x + Math.cos(fahrt) * 1.5,
            r.getTerrainHeightAt(a0.x, a0.z) + 1.8,
            a0.z - Math.sin(fahrt) * 1.5
        );
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        for (let i = 0; i < 20; i++) frame();
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: a0.x, y: r.getTerrainHeightAt(a0.x, a0.z) + 0.5, z: a0.z },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "k10-gt-dorfweg" }
        );
        if (!e) return Object.assign(res, { err: "kein GT" });
        await __gebautNach(e, { takt: frame });
        const auf = r.mountArchitecture(e);
        if (!auf || !auf.ok || st.player.mountedArch !== e.id)
            return Object.assign(res, { err: "der Fahrer sitzt nicht im GT" });
        for (let i = 0; i < 12; i++) frame();
        const F = r.fahrerSetzen(P);
        frame();
        const s0 = F.s;
        let [px, pz, strecke, ablage, aufWeg, gezaehlt] = [
            st.playerMesh.position.x,
            st.playerMesh.position.z,
            0,
            0,
            0,
            0,
        ];
        // der Bau mit Blocker, der dem Wagen am nächsten steht (der Täter beim Namen, wo er den Weg verlässt oder auf ihm steckt)
        const naechsterBau = (pos) =>
            st.architectures
                .filter((a) => a && a !== e && a.position && Array.isArray(a.blockerAABBs) && a.blockerAABBs.length)
                .reduce(
                    (b, a) =>
                        Math.hypot(a.position.x - pos.x, a.position.z - pos.z) < b[0]
                            ? [Math.hypot(a.position.x - pos.x, a.position.z - pos.z), a.type]
                            : b,
                    [Infinity, null]
                );
        let sVor = F.s;
        for (let i = 0, N = Math.round(sek * 60); i < N; i++) {
            frame();
            const pos = st.playerMesh.position;
            strecke += Math.hypot(pos.x - px, pos.z - pz);
            [px, pz, ablage] = [pos.x, pos.z, Math.max(ablage, F.quer)];
            if (F.ende) {
                res.endeNachS = Math.round(((i + 1) / 60) * 10) / 10;
                break;
            }
            // STECKT der Wagen auf dem Weg (eine Sekunde < 0,1 m Fortschritt nach der ersten), nennt die Probe den Bau davor —
            // bis samen-ein-baum nannte sie nur den, an dem er den Weg verließ (Auto-Dorf −4,−4: 1,83 m, ablage 0, kein Name)
            if (i % 60 === 59) {
                if (i > 60 && F.s - sVor < 0.1 && !res.steckt) {
                    const [nd, naechster] = naechsterBau(pos);
                    res.steckt = { s: Math.round((F.s - s0) * 10) / 10, naechster, abstand: Math.round(nd * 10) / 10, bei: [Math.round(pos.x * 10) / 10, Math.round(pos.z * 10) / 10] };
                }
                sVor = F.s;
            }
            gezaehlt++;
            if (F.quer <= hw) aufWeg++;
            else if (!res.verlassen) {
                // der Täter beim Namen: der nächste Bau mit Blocker am Ort, wo der Wagen den Weg verlässt
                const [nd, naechster] = naechsterBau(pos);
                res.verlassen = { s: Math.round((F.s - s0) * 10) / 10, naechster, abstand: Math.round(nd * 10) / 10 };
            }
        }
        r.fahrerSetzen(null);
        Object.assign(res, {
            gtWeg: Math.round((F.s - s0) * 100) / 100,
            strecke: Math.round(strecke * 100) / 100,
            ablage: Math.round(ablage * 100) / 100,
            aufWeg: Math.round((1000 * aufWeg) / Math.max(1, gezaehlt)) / 1000,
            start: { x: Math.round(a0.x * 10) / 10, z: Math.round(a0.z * 10) / 10 },
        });
        r.dismountArchitecture();
        r.removeArchitecture(e);
    } catch (err) {
        res.err = fehlerStapel(err);
    }
    return res;
}

// DIE WÜRFE DES FELDS WEICHEN DEM ORT: jede Art, die das Affinitäts-Feld wirft (Wald, Fels, Geode — die Feuerstelle
// setzt der Mensch, nie das Feld), weicht dem Ort wie die Natur — sie sperrt der Ort-Wahl keinen Grund (`_bauFrei`, die Wand der Wahl und der
// Slot-Quelle), der Grundriss eines Hauses räumt sie (`_grundrissRaeumen`), der Weg des Dorfs auch (`_naturRaeumen`).
// C-K5b DER VORRAT JE ZELLE (Karte vorrat-pingpong): am Mess-Ort `dorf` liegen zwei Zellen im Vorlauf-Ring. Der Zug läuft je
// Gang einen Takt, bis 20 Gänge nichts unterwegs ist und kein Export beginnt, dann 150 Gänge Ruhe; gezählt werden die Bereitungen
// (`_ortMitTrasse`) je Zelle. Der Selbsttest `alt` "vorrat" hält EINEN Vorrat zur Zeit, "wand" stellt die Steil-Wand 0,35 zurück
// in `_autoSettlementSiteOk`, die bis siedlung-k3-hang jeden Ort steiler als 0,35 abwies. C-K3 DIE TRASSE AM ORT: je Vorrat der
// Abstand seines Plans v2 vom Ort, `hang` die Steilheit dort (die EINE `_slopeAt`, die auch die Wand fragt; der Grund des
// Vorrats liegt vor dem Erwachen, w13-dorf-strom — er fällt vor der Messung, `_dorfVorratGrundFaellt`)
// seines Höhen-Rasters, die Lese-Punkte außerhalb des Rasters und die Gassen (das Gefälle misst `gassenGefaelle`). Browser.
async function vorratAmDorf(messort, alt) {
    const SG = AnazhRealm._siedlungGesetz();
    const [cx, cz] = [Math.floor(messort[0] / SG.cellM), Math.floor(messort[1] / SG.cellM)];
    const zelle = new Map();
    for (let i = 0; i < 25; i++) {
        const z = r._autoSettlementCellInfo(cx + (i % 5) - 2, cz + Math.floor(i / 5) - 2);
        if (z) zelle.set(z.seed, z.key);
    }
    const e = { exporte: {}, alle: 0, nachZug: -1, trasse: [], welt: r._gelaende().seed };
    // die Grundriss-Leser neben dem EINEN (`_grundrissVon`), die bis siedlung-k3-hang dieselbe Zeile lasen
    e.leser = ["_slotGrundriss", "_werkGrundriss"].filter((k) => k in r || k in AnazhRealm);
    const [req, bereite, ok] = [r._foundryRequestSettlement, r._ortMitTrasse, r._autoSettlementSiteOk];
    // die alte Wand wörtlich (bis siedlung-k3-hang: `slope > SIEDLUNG.slopeMax`, die EINE Steilheit `_slopeAt`)
    if (alt === "wand") r._autoSettlementSiteOk = (x, z, ...a) => !(r._slopeAt(x, z) > 0.35) && ok.call(r, x, z, ...a);
    r._foundryRequestSettlement = function (dp, ...a) {
        e.alle++;
        return req.call(this, dp, ...a);
    };
    r._ortMitTrasse = function (dp, ...a) {
        const k = zelle.get(dp && dp.seed) || "fremd";
        e.exporte[k] = (e.exporte[k] || 0) + 1;
        return bereite.call(this, dp, ...a);
    };
    const bereiten = r._dorfBereiten;
    if (alt === "vorrat")
        r._dorfBereiten = function (key, ...a) {
            for (const k of this._dorfVorraete.keys()) if (k !== key) this._dorfVorraete.delete(k);
            return bereiten.call(this, key, ...a);
        };
    const hook0 = window.__anazhAutoSettlement;
    window.__anazhAutoSettlement = true;
    r._dorfVorraete = new Map();
    const pm = st.playerMesh.position;
    pm.set(messort[0], r.getTerrainHeightAt(messort[0], messort[1]) + 1, messort[1]);
    const leer = () =>
        !r._autoSettlementQueue &&
        !r._autoSettlementPendingKey &&
        !r._stlWegePending &&
        !r._weltOffen().foundry &&
        [...r._dorfVorraete.values()].every((v) => v.da);
    let gaenge = 0;
    try {
        for (let still = 0; still < 20 && gaenge < 600; gaenge++) {
            const vor = e.alle;
            r._tickAutoSettlement(pm);
            still = leer() && e.alle === vor ? still + 1 : 0;
            await sleep(20);
        }
        e.nachZug = -e.alle;
        for (let g = 0; g < 150; g++) {
            r._tickAutoSettlement(pm);
            await sleep(20);
        }
        for (const w of r._dorfVorraete.values()) r._dorfVorratGrundFaellt(w);
        for (const [k, v] of r._dorfVorraete) {
            const b = await v.fertig;
            const v2 = b && r._ortPlaene.get(AnazhRealm._ortSchluessel(b.plan, b.anker));
            if (v2)
                e.trasse.push({
                    zelle: k,
                    versatzM: +Math.hypot(v2.ort.x - b.anker.x, v2.ort.z - b.anker.z).toFixed(1),
                    aussen: (b.plan.trasse || {}).aussen,
                    hang: +r._slopeAt(v2.ort.x, v2.ort.z).toFixed(2),
                    v2: { ort: v2.ort, roads: v2.roads, slots: v2.slots },
                });
        }
    } finally {
        delete r._foundryRequestSettlement;
        delete r._ortMitTrasse;
        delete r._dorfBereiten;
        r._autoSettlementSiteOk = ok;
        window.__anazhAutoSettlement = hook0;
    }
    return Object.assign(e, { nachZug: e.nachZug + e.alle, gaenge, offen: r._weltOffen().foundry });
}
// Je Art ein Wurf an einem
// freien Ort (die Wand in jeder Höhe der Platte: im Hang liegt die Platte tiefer als der Wurf), in der Mitte eines Hauses
// und auf dem Weg. DAS WERK DERSELBEN ART weicht nie: der Stein des Satzes oder des Bau-Modus ist Werk (er sperrt den
// Grund, kein Grundriss und kein Weg räumt ihn) — es entscheidet die HERKUNFT (die Marke `feldWurf`, die nur der Wurf des
// Felds trägt: `_enqueueVegetationSpawn`), nie die Art. Das Feld wirft seit landmarken-geologie keinen Bau mehr (die Feuerstelle
// setzt der Mensch, `FELD_WURF`); einen Bau mit der Marke trägt noch der AKT des Felds (der Nexus, `autonomous`) — ihn wirft der
// Selbst-Schein als Probe. `defekt` ist der Selbst-Schein: "bau" — der Bau mit der Marke gilt wieder als Bau (der Wurf
// MUSS sperren); "art" — die Art entscheidet (das Werk MUSS weichen).
// Läuft im Browser (page.evaluate) — selbstgenügsam.
function feldWurfImOrt(anker, defekt) {
    const res = { sperrt: [], grundriss: [], weg: [], fehl: [], werk: { arten: [], weicht: [] } };
    const A = AnazhRealm;
    // die Arten des Felds (`_vegetationSampleSpawn`), wie die Linse sie kennt — die Welt trägt sie als EINE Liste
    const LISTE = [
        "baum_eiche",
        "baum_kiefer",
        "baum_birke",
        "baum_erle",
        "baum_buche",
        "baum_tanne",
        "baum_karst",
        "stein_block",
        "kristall_geode",
    ];
    res.arten = LISTE.length;
    res.quelle = Array.isArray(A.FELD_WURF) && A.FELD_WURF.join() === LISTE.join();
    // die Probe des Selbst-Scheins "bau": die Feuerstelle als Akt des Felds (ein Bau mit der Marke des Wurfs)
    const WURF = defekt === "bau" ? LISTE.concat(["glutbrunnen"]) : LISTE;
    if (defekt === "bau")
        r._weichtDemBau = function (e) {
            return this._istNatur(e);
        };
    if (defekt === "art")
        r._weichtDemBau = function (e) {
            return this._istNatur(e) || (!!e && A.FELD_WURF.includes(e.type));
        };
    // die Marke trägt der EINE Wurf-Pfad des Felds (`_enqueueVegetationSpawn`): seine Optionen, am Setzen abgegriffen
    let feldOpts = null;
    {
        const sofort = r._vegSpawnImmediate;
        r._naturSetzen = (name, pos, o) => {
            feldOpts = o;
            return null;
        };
        r._wildnisTraegt = () => true;
        r._vegSpawnImmediate = true;
        try {
            r._enqueueVegetationSpawn("stein_block", { x: anker.x, y: 0, z: anker.z }, { silent: true, seed: 4711 });
        } finally {
            delete r._naturSetzen; // die Methoden des Prototyps gelten wieder
            delete r._wildnisTraegt;
            r._vegSpawnImmediate = sofort;
        }
    }
    res.feldMarke = !!(feldOpts && feldOpts.feldWurf === true);
    const neu = [];
    try {
        const H = (x, z) => r.getTerrainHeightAt(x, z);
        const haus = st.architectures.find(
            (e) => e.fundament && e.position && Math.hypot(e.position.x - anker.x, e.position.z - anker.z) < 200
        );
        if (!haus) {
            res.err = "kein Haus am Ort";
            return res;
        }
        const ry = haus.rotationY || 0;
        const f = r._grundrissVon(haus);
        const hx = haus.position.x + f.ox * Math.cos(ry) + f.oz * Math.sin(ry);
        const hz = haus.position.z - f.ox * Math.sin(ry) + f.oz * Math.cos(ry);
        const box = { ex: 2, ez: 2, ox: 0, oz: 0 };
        // trocken auch nach der Wasser-Wand jedes Werks der Liste (`_werkImWasser`, die Wurzel `spawnArchitecture`)
        const trocken = (x, z) =>
            r._landAt(x, z, 0.2) &&
            r._landAt(x + 2, z + 2, 0.2) &&
            r._landAt(x - 2, z - 2, 0.2) &&
            !WURF.some((t) => r._werkImWasser(t, { x, z }, {}, 4711));
        // ein Punkt des Wegs (keine Grundriss-Fläche binnen 3 m) und ein freier Ort (kein Grundriss, kein Bau binnen 4 m)
        let weg = null;
        let frei = null;
        for (let i = 0; i < 6400 && !(weg && frei); i++) {
            const x = anker.x + ((i % 80) - 40) * 2.5;
            const z = anker.z + (Math.floor(i / 80) - 40) * 2.5;
            if (!trocken(x, z)) continue;
            const g = r._imGrundriss(x, z, 3, 0);
            if (!weg && g === "weg" && r._imGrundriss(x, z, 0.8, 0) === "weg") weg = { x, z };
            if (!frei && g === false && r._bauFrei(x, z, 0, { ex: 4, ez: 4, ox: 0, oz: 0 }, null, -Infinity))
                frei = { x, z };
        }
        res.orte = { haus: [+hx.toFixed(1), +hz.toFixed(1)], weg, frei };
        if (!weg || !frei) {
            res.err = `kein ${weg ? "freier Ort" : "Punkt des Wegs"} um ${anker.x.toFixed(0)}/${anker.z.toFixed(0)}`;
            return res;
        }
        // der Wurf mit den Optionen des Felds (samt seiner Marke), das Werk präzise mit der Marke werk (der Satz, der Bau-Modus)
        const wirf = (t, x, z, wo, werk) => {
            let nein = "";
            const o = Object.assign(werk ? { precise: true, werk: true } : Object.assign({}, feldOpts), {
                seed: 4711,
                absage: (g) => (nein = " " + g),
            });
            const e = r.spawnArchitecture(t, { x, y: H(x, z) + 0.5, z }, o);
            if (!e && werk) res.werk.weicht.push(`${t} (kein Werk @${wo}${nein})`);
            else if (!e) res.fehl.push(t + "@" + wo + nein);
            else neu.push(e);
            return e;
        };
        const steht = (e) => st.architectures.includes(e);
        for (const t of LISTE) {
            res.werk.arten.push(t);
            const wo = [];
            const w1 = wirf(t, frei.x, frei.z, "frei", true);
            if (w1 && r._bauFrei(frei.x, frei.z, 0, box, null, -Infinity)) wo.push("sperrt nicht");
            if (w1) r.removeArchitecture(w1);
            const w2 = wirf(t, hx, hz, "haus", true);
            if (w2) {
                r._grundrissRaeumen(haus);
                if (!steht(w2)) wo.push("im Grundriss geräumt");
            }
            const w3 = wirf(t, weg.x, weg.z, "weg", true);
            if (w3) {
                r._naturRaeumen(weg.x, weg.z, 2, false, null);
                if (!steht(w3)) wo.push("auf dem Weg geräumt");
            }
            if (wo.length) res.werk.weicht.push(`${t} (${wo.join(" · ")})`);
            for (const e of [w1, w2, w3]) if (e && steht(e)) r.removeArchitecture(e);
        }
        for (const t of WURF) {
            const e1 = wirf(t, frei.x, frei.z, "frei");
            if (e1 && !r._bauFrei(frei.x, frei.z, 0, box, null, -Infinity)) res.sperrt.push(t);
            if (e1) r.removeArchitecture(e1);
            const e2 = wirf(t, hx, hz, "haus");
            if (e2) {
                r._grundrissRaeumen(haus);
                if (steht(e2)) res.grundriss.push(t);
            }
            const e3 = wirf(t, weg.x, weg.z, "weg");
            if (e3) {
                r._naturRaeumen(weg.x, weg.z, 2, false, null);
                if (steht(e3)) res.weg.push(t);
            }
        }
    } catch (err) {
        res.err = fehlerStapel(err);
    } finally {
        for (const e of neu) if (st.architectures.includes(e)) r.removeArchitecture(e);
        if (defekt) delete r._weichtDemBau; // die Wand des Prototyps gilt wieder
    }
    const fiel = new Set([...res.sperrt, ...res.grundriss, ...res.weg, ...res.fehl.map((s) => s.split("@")[0])]);
    res.weichen = res.arten - fiel.size;
    return res;
}

// DIE BRÜCKE QUERT (bruecke-quert, Selbst-Test 14b): der Plan v2 (fachwerk `ortPlan` → `amUfer`) über einem Fluss, der längs z
// fließt (das Wasser |x − 100| < 4, 2 m tief; ctx.flussAt: der Lauf (0, 1) binnen der Krone |x − 100| < 6), mit fünf Gassen —
// längs im Bett (48 m bei x = −1), schräg (53° zum Lauf), quer (90°), eine, die längs im Wasser endet, und eine ganz im Bett.
// Grün: jede Brücke schneidet den Lauf unter mindestens `BRUECKE_GESETZ.querGrad` und ist so lang, wie das Wasser quer breit ist
// (8 m); die Gassen längs, endend und im Bett tragen keine und keinen Punkt im Wasser (sie liegen am Ufer); die schräge trägt
// genau eine; die quere ist mit dem Lauf byte-gleich wie ohne ihn. `wo` nennt jeden Bruch beim Namen (Gasse, Widerlager, Winkel).
function brueckeQuertUrteil(FC, Gb) {
    const Q = FC.BRUECKE_GESETZ.querGrad;
    const nass = (x) => Math.abs(x - 100) < 4;
    const ctx = (mitLauf) => ({
        hoeheAt: (x) => (nass(x) ? -2 : 0),
        flaeche: (sp) => {
            const E = Gb.erdbauNormal(sp);
            return (x, z) => Gb.erdbauFlaeche(E, x, z);
        },
        wasserAt: (x) => nass(x),
        ...(mitLauf
            ? {
                  flussAt: (x) =>
                      Math.abs(x - 100) < 6
                          ? { flowX: 0, flowZ: 1, centerness: Math.max(0, 1 - Math.abs(x - 100) / 4), breite: 8 }
                          : null,
              }
            : null),
    });
    const linie = (P, d) => {
        const aus = [{ x: P[0][0], z: P[0][1] }];
        for (let j = 1; j < P.length; j++) {
            const [ax, az] = P[j - 1];
            const [bx, bz] = P[j];
            const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / d));
            for (let i = 1; i <= n; i++) aus.push({ x: ax + ((bx - ax) * i) / n, z: az + ((bz - az) * i) / n });
        }
        return aus;
    };
    const plan = {
        slots: [],
        laternen: [],
        roads: [
            { pts: linie([[-9, -36], [-1, -24], [-1, 24], [-9, 36]], 3), w: 3 },
            { pts: linie([[-20, -75], [20, -45]], 2.5), w: 3 },
            { pts: linie([[-20, 60], [20, 60]], 2), w: 3 },
            { pts: linie([[-12, 110], [-1, 120], [-1, 150]], 3), w: 3 },
            { pts: linie([[1, 180], [1, 210]], 3), w: 3 },
        ],
    };
    const mit = FC.ortPlan(plan, { x: 100, z: 0 }, ctx(true)); // BÜHNE: reines ortPlan-Fixture über einem gedachten Fluss
    const ohne = FC.ortPlan(plan, { x: 100, z: 0 }, ctx(false)); // BÜHNE: reines ortPlan-Fixture über einem gedachten Fluss
    const fehl = Q > 0 ? [] : ["BRUECKE_GESETZ trägt keinen querGrad — kein Gesetz des Winkels, den die Brücke zum Lauf hält"];
    mit.roads.forEach((w, i) => {
        for (const [wa, wb] of w.bruecken || []) {
            const [a, b] = [w.pts[wa], w.pts[wb]];
            const [dx, dz] = [b.x - a.x, b.z - a.z];
            const th = (Math.acos(Math.min(1, Math.abs(dz) / Math.hypot(dx, dz))) * 180) / Math.PI;
            if (th < Q) fehl.push(`Gasse ${i} Brücke [${wa}, ${wb}] liegt längs: ${th.toFixed(1)}° zum Lauf (Soll ≥ ${Q}°)`);
            if (Math.abs(dx) < 8) fehl.push(`Gasse ${i} Brücke [${wa}, ${wb}] quer ${Math.abs(dx).toFixed(2)} m kürzer als das Wasser (8 m)`);
        }
    });
    [[0, "die Gasse längs"], [3, "die Gasse, die im Wasser endet"], [4, "die Gasse im Bett"]].forEach(([i, wer]) => {
        const imBett = mit.roads[i].pts.filter((p) => nass(100 + p.x)).length;
        if (imBett) fehl.push(`${wer} hat ${imBett} Punkte im Wasser — sie liegt nicht am Ufer`);
    });
    const nS = (mit.roads[1].bruecken || []).length;
    if (nS !== 1) fehl.push(`die schräge Gasse trägt ${nS} Brücken (Soll 1: normal zum Lauf über das andere Ufer)`);
    if (!(mit.roads[2].bruecken || []).length) fehl.push("die quere Gasse trägt keine Brücke");
    if (JSON.stringify(mit.roads[2]) !== JSON.stringify(ohne.roads[2])) fehl.push("die quere Gasse ist mit dem Lauf nicht byte-gleich wie ohne ihn");
    return { gruen: !fehl.length, wo: fehl.join(" · ") };
}

// DER FELDWEG QUERT (bruecke-quert, Selbst-Test 14c): der Feldweg zwischen zwei Orten (fachwerk `wegZwischen` → `brueckenAmWeg`,
// wie der Ort-Faden `ort-weg` und der Wirt `_wegenetzLegen` ihn legen) über einem flachen Raster (41 × 41 je 4 m) mit einem Fluss,
// der längs x fließt (nass |z| < 6, der Lauf (1, 0) binnen |z| < 8), und einem Teich (nass r < 10 um 0/−50, derselbe Lauf). Vier
// Fälle: frei (die Orte schräg über dem Fluss: er quert ≥ querGrad), gezwungen (Grundrisse lassen nur zwei Zugänge 80 m
// versetzt — die Furt längs im Bett ist kein Weg: kein Lauf oder eine quere Brücke), der Teich (der Weg um ihn liegt nie im
// Wasser) und trocken (ohne Wasser byte-gleich mit und ohne Lauf). `wo` nennt jeden Bruch beim Namen (Fall, Spanne, Winkel).
function feldwegQuertUrteil(FC) {
    const Q = FC.BRUECKE_GESETZ.querGrad;
    const n = 41;
    const raster = { x0: -80, z0: -80, d: 4, n, h: new Float32Array(n * n) };
    const nassF = (x, z) => Math.abs(z) < 6 || Math.hypot(x, z + 50) < 10;
    const flussF = (x, z) =>
        Math.abs(z) < 8 || Math.hypot(x, z + 50) < 12 ? { flowX: 1, flowZ: 0, centerness: Math.max(0, 1 - Math.abs(z) / 8) } : null;
    const box = (x0, x1, z0, z1) => ({ cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, phi: 0, ex: (x1 - x0) / 2, ez: (z1 - z0) / 2 });
    const zwang = [box(-34, 80, 8, 80), box(-80, -46, 8, 80), box(-80, 34, -30, -8), box(46, 80, -30, -8)];
    const faelle = [
        ["frei", { x: -30, z: 40 }, { x: 30, z: -24 }, []], // BÜHNE: reines wegZwischen-Fixture über einem gedachten Raster
        ["gezwungen", { x: -40, z: 60 }, { x: 40, z: -24 }, zwang], // BÜHNE: reines wegZwischen-Fixture über einem gedachten Raster
        ["Teich", { x: -36, z: -50 }, { x: 36, z: -50 }, []], // BÜHNE: reines wegZwischen-Fixture über einem gedachten Raster
        ["trocken", { x: -60, z: -70 }, { x: 60, z: -66 }, []], // BÜHNE: reines wegZwischen-Fixture über einem gedachten Raster
    ];
    const fehl = Q > 0 ? [] : ["BRUECKE_GESETZ trägt keinen querGrad"];
    const aus = {};
    for (const [wer, A, B, sp] of faelle) {
        const pts = FC.wegZwischen(raster, [A], [B], sp, nassF, flussF);
        aus[wer] = pts;
        if (!pts) {
            if (wer !== "gezwungen") fehl.push(`der Feldweg ${wer} trägt keinen Lauf`);
            continue;
        }
        const nass = pts.map((p) => nassF(p.x, p.z));
        const spannen = FC.brueckenAmWeg(pts, nass, pts.map(() => 0));
        for (const s of spannen) {
            const [dx, dz] = [s.b.x - s.a.x, s.b.z - s.a.z];
            const th = (Math.acos(Math.min(1, Math.abs(dx) / (Math.hypot(dx, dz) || 1))) * 180) / Math.PI;
            if (th < Q) fehl.push(`Feldweg ${wer} Brücke [${s.wa}, ${s.wb}] liegt längs: ${th.toFixed(1)}° zum Lauf (Soll ≥ ${Q}°)`);
        }
        const imWasser = nass.filter(Boolean).length;
        if (wer === "frei" && !spannen.length) fehl.push("der Feldweg frei quert den Fluss ohne Brücke");
        if ((wer === "Teich" || wer === "trocken") && imWasser) fehl.push(`der Feldweg ${wer} liegt mit ${imWasser} Punkten im Wasser`);
    }
    const ohneLauf = FC.wegZwischen(raster, [faelle[3][1]], [faelle[3][2]], [], nassF);
    if (JSON.stringify(ohneLauf) !== JSON.stringify(aus.trocken)) fehl.push("der Feldweg trocken ist mit dem Lauf nicht byte-gleich wie ohne ihn");
    return { gruen: !fehl.length, wo: fehl.join(" · ") };
}

// ===== TEIL K (Leiter mensch.netz.verkehr): DIE KREUZUNG IST EINE FLÄCHE — je Fixture (T · X · Knick · Fort · Schräg) über einem Hang
// von 6, 12 und 20 % der Plan v2 (fachwerk `ortPlan`), sein Erdbau wie die Welt ihn liest (gelaende-core `erdbauY`, der Leser
// jeder Höhe: Körper, Rad, die Stufen-Probe des Verkehrs `_verkehrAnlegen`): auf jeder Fahrbahn (den Kernen) springt der Boden
// je 0,5 m höchstens um das Gefälle des Gesetzes (`ORT_GESETZ.gefaelle` 12 % → 0,06 m). Bis K hatte jeder Weg an der
// Kreuzung sein eigenes Profil, die letzte Trasse gewann: 0,15–0,67 m je 0,5 m (T 0,61 · X 0,67 · Knick 0,36 · Fort 0,36),
// in der Metropole 60 Stellen, an denen jeder Wagen stand. `stoer` (Selbsttest) hebt die Fahrbahn des zweiten Wegs um 0,3 m.
function kreuzungsUrteil(FC, Gb, o = {}) {
    const lauf = (dx, dz, n, w, x0 = 0) => ({
        pts: Array.from({ length: n }, (_, i) => ({ x: x0 + dx * i * 3, z: dz * i * 3 })),
        w,
    });
    const quer = lauf(1, 0, 31, 5, -45);
    const faelle = {
        T: [quer, lauf(0, 1, 15, 3.9)],
        X: [quer, lauf(0, 1, 15, 5), lauf(0, -1, 15, 5)],
        Knick: [lauf(1, 0, 16, 5, -45), lauf(0.6, 0.8, 15, 5)],
        Fort: [lauf(1, 0, 16, 5, -45), lauf(1, 0, 15, 5)],
        Schraeg: [quer, lauf(0.707, 0.707, 15, 3.9)],
    };
    const strecke = (p, a, b) => {
        const [dx, dz] = [b.x - a.x, b.z - a.z];
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz)));
        return Math.hypot(p.x - a.x - dx * t, p.z - a.z - dz * t);
    };
    const amKern = (roads, p) => roads.some((r) => r.pts.some((q, i) => i && strecke(p, r.pts[i - 1], q) <= r.w / 2));
    const aus = { max: 0, wo: "", je: [] };
    for (const [name, roads] of Object.entries(faelle))
        for (const hang of [0.06, 0.12, 0.2]) {
            const ctx = {
                hoeheAt: (x, z) => x * hang + z * hang * 0.5 + Math.sin(x * 0.2) * 0.5,
                flaeche: (sp) =>
                    (
                        (E) => (x, z) =>
                            Gb.erdbauFlaeche(E, x, z)
                    )(Gb.erdbauNormal(sp)),
            };
            const v2 = FC.ortPlan({ slots: [], roads, laternen: [] }, { x: 0, z: 0 }, ctx); // BÜHNE: reines ortPlan-Fixture am Hang
            const E = Gb.erdbauNormal(
                v2.erdbau.map((q) => (o.stoer && q.weg === 3 ? { ...q, y0: q.y0 + 0.3, y1: q.y1 + 0.3 } : q))
            );
            let [max, wo] = [0, ""];
            for (let x = -44; x < 44; x += 0.5)
                for (let z = -44; z < 44; z += 0.5) {
                    if (!amKern(roads, { x, z })) continue;
                    const a = Gb.erdbauY(E, x, z, NaN);
                    for (const [u, v] of [
                        [0.5, 0],
                        [0, 0.5],
                    ]) {
                        const b = amKern(roads, { x: x + u, z: z + v }) ? Gb.erdbauY(E, x + u, z + v, NaN) : NaN;
                        if (Math.abs(b - a) > max) [max, wo] = [Math.abs(b - a), `${x}/${z}`];
                    }
                }
            aus.je.push(`${name} ${hang * 100} % ${max.toFixed(3)}`);
            if (max > aus.max) [aus.max, aus.wo] = [max, `${name} am Hang ${hang * 100} % bei ${wo}`];
        }
    aus.gruen = aus.max <= 0.06 + 1e-6;
    return aus;
}

// Die dp-Fixtures der Goldens (klein = schnell; ein Dorf + ein Weiler).
const FIXTURES = [
    { seed: 7, nH: 12 },
    { seed: 12345, nH: 6 },
];

// ===== TEIL G (w28-gruendung-flach): DIE GRÜNDUNG IST FLACH — die Wandlaterne (`wandLaternen`) fragt je Stand ihres Kopfs nur
// die Grundrisse ihrer Zelle (`GRUENDUNG_RASTER`); gezählt werden OPERATIONEN (`GRUENDUNG_OPS`: Stände und ihre Grundriss-Proben),
// nie die Uhr. Je Saat die Proben je Stand bei N und 2N verlangten Häusern: das Verhältnis ≤ G_SCHRANKE (die Proben eines
// Stands wachsen nicht mit N). Bis w28-gruendung-flach fragte `fremd` jeden Grundriss samt der geparkten — die Proben je Stand
// waren N (gemessen 150 → 300: 1,91–1,97; mit dem Raster 1,20–1,31). `o.raster` setzt die Zelle (die Mutante: Infinity).
const G_SCHRANKE = 1.5;
function gruendungFlach(FC, o = {}) {
    const R = FC.GRUENDUNG_RASTER;
    if (!R || !FC.GRUENDUNG_OPS)
        return { je: "der Kern zählt die Proben von `fremd` nicht", max: Infinity, gruen: false };
    const alt = R.wandM;
    if (o.raster !== undefined) R.wandM = o.raster;
    try {
        const jeStand = (dp) => {
            Object.assign(FC.GRUENDUNG_OPS, { staende: 0, grundriss: 0 });
            FC.exportSettlement(dp);
            return FC.GRUENDUNG_OPS.grundriss / Math.max(1, FC.GRUENDUNG_OPS.staende);
        };
        const je = [7, 21].map((seed) => {
            const [a, b] = [150, 300].map((nH) => jeStand({ seed, nH }));
            return { seed, n: +a.toFixed(2), zweiN: +b.toFixed(2), v: +(b / a).toFixed(2) };
        });
        const max = Math.max(...je.map((g) => g.v));
        return { je, max, gruen: max <= G_SCHRANKE };
    } finally {
        R.wandM = alt;
    }
}

hauptLauf(async () => {
    const FC = studioKern("fachwerk-core.js", "__fachwerkCore");
    // die Bau-Typen der EINEN Grammatik: die Zeilen des Bau-Gesetzes (BAU_NUTZUNG) und die Rollen davor (die Kirche, der Palas, die Scheune)
    const breiteRollen = [...Object.keys(FC.BAU_NUTZUNG), "kirche", "burg", "scheune"];

    // ===== SELBST-TEST =====
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Settlement-Linse feuert ===");
        const a = FC.exportSettlement(FIXTURES[0]);
        // V2: ein manipulierter Export (ein Slot verschoben) kippt den Fingerabdruck — die Byte-Wand ist nicht vakuös.
        const b = jsonKlon(a);
        b.slots[0].x += 0.001;
        check("Selbst-Test 2: ein 1-mm-Slot-Versatz kippt den Fingerabdruck", fingerprint(a) !== fingerprint(b));
        // V6 (K10, Teil O): das Urteil des Orts feuert am Täter — ein ebener Ort hält, ein Absatz vor der Tür, ein Haus über
        // dem Grund und ein Haus ohne Weg fallen beim Namen; das Verdikt nennt jede verfehlte Zahl.
        const haus = (x, z, y) => ({
            x,
            z,
            phi: 0,
            y,
            rolle: "wohnhaus",
            tuer: { x: 0, z: -2, y: 0, W: 4, D: 4 },
            obb: { cx: x, cz: z, phi: 0, ex: 2.5, ez: 2.5 },
        });
        const ortT = (slots) => ({
            ort: { x: 100, z: 100 }, // BÜHNE: reines Urteil-Fixture, kein Welt-Ort
            slots,
            roads: [
                {
                    pts: [
                        { x: -20, z: 0 }, // BÜHNE: Weg im Plan-Rahmen eines Fixtures
                        { x: 20, z: 0 }, // BÜHNE: Weg im Plan-Rahmen eines Fixtures
                    ],
                    w: 3,
                },
            ],
            platz: null,
        });
        const eben = () => 10;
        const u0 = ortUrteil(ortT([haus(-8, 8, 10), haus(8, 8, 10)]), eben);
        check(
            "Selbst-Test 8: ein ebener Ort hält (Sockel 0, Türen 2/2)",
            u0.sockelMax === 0 && u0.tuerenOk === 2 && u0.tuerenN === 2,
            u0
        );
        const absatz = (x, z) => (z - 100 < 5 ? 9 : 10);
        const u1 = ortUrteil(ortT([haus(-8, 8, 10), haus(8, 8, 10)]), absatz);
        check(
            "Selbst-Test 9: ein Absatz von 1 m vor den Türen -> 0/2, die Stufe beim Namen",
            u1.tuerenOk === 0 && u1.tuerenFehl.every((t) => t.vorStufe === 1),
            u1.tuerenFehl
        );
        const u2 = ortUrteil(ortT([haus(-8, 8, 11), haus(8, 8, 10)]), eben);
        check(
            "Selbst-Test 10: ein Haus 1 m über dem Grund -> Sockel max 1, seine Schwelle fällt",
            u2.sockelMax === 1 && u2.tuerenOk === 1 && u2.tuerenFehl[0].si === 0,
            u2
        );
        const u3 = ortUrteil(Object.assign(ortT([haus(-8, 8, 10)]), { roads: [] }), eben, { kappe: 4000 });
        check("Selbst-Test 11: ohne Weg erreicht keine Tür ein Ziel", u3.tuerenOk === 0 && u3.tuerenN === 1);
        // das HOF-Haus (`eingangVon`): die Haustür (Diele 0,55) öffnet auf das Hofpflaster, der Gang betritt das Tor im Torriegel
        // (0,63) von seiner Vorplatz-Platte (0,3 über dem Grund) — die Probe am Tor hält, dieselbe Probe an der Haustür fällt mit
        // der Schwelle 0,55 beim Namen (bis w28-bau-rezept las sie jede Hof-Tür so)
        const hofHaus = Object.assign(haus(8, 8, 10), { tuer: { x: 0, z: -2, y: 0.55, W: 4, D: 4 } });
        const platte = (x, z) => (z - 100 < 2 ? 10.3 : 10);
        const u4 = ortUrteil(ortT([Object.assign({}, hofHaus, { eingang: { z: -6, y: 0.63 } })]), platte);
        const u5 = ortUrteil(ortT([hofHaus]), platte);
        check(
            "Selbst-Test 11c: das Hof-Haus geht durch sein Tor (1/1); die Haustür über dem Hofpflaster fällt mit 0,55",
            u4.tuerenOk === 1 && u5.tuerenOk === 0 && u5.tuerenFehl[0].schwelle === 0.55,
            { tor: u4.tuerenFehl, haustuer: u5.tuerenFehl }
        );
        // C3n: der Täter von main — das Register trägt nur den erwachten Ort, seine Nachbarn fehlen → ROT beim Namen
        const gesetzN = { gesetz: ["3,2", "2,1"], register: [] };
        check(
            "Selbst-Test 11n: ein Ort ohne gemeldete Nachbarn → ROT, „3,2“ und „2,1“ beim Namen",
            nachbarLuecke(gesetzN).join(" ") === "3,2 2,1"
        );
        const voll = { gesetz: ["3,2", "2,1"], register: [{ k: "3,2", name: "Stihalm", region: "nordisch" }, { k: "2,1", name: "Chagrin", region: "mitteleuropa" }] }; // prettier-ignore
        check("Selbst-Test 11o: jeder Nachbar mit Name und Region → GRÜN", nachbarLuecke(voll).length === 0);
        const ohneName = { gesetz: ["3,2"], register: [{ k: "3,2", name: null, region: "nordisch" }] };
        check("Selbst-Test 11p: ein Nachbar ohne Namen ist ROT", nachbarLuecke(ohneName).join() === "3,2");
        // das L-Haus: der Grund unter der leeren Ecke der obb (x > 0, z < 0) liegt 1 m tiefer — unter den Wänden (`grund.boxen`)
        // steht es eben (Sockel 0), die obb allein läse die Ecke als Sockel 1
        // das Grund-Datum des Kerns (`grundVon`, keine Hüllen-Zeile): seine Boxen im Rahmen des Hauses
        const lHaus = Object.assign(haus(8, 8, 10), { grund: {} });
        lHaus.grund.boxen = [
            [-2.5, 0, -2.5, 2.5, 0, 3],
            [0, 2.5, 0, 2.5, 0, 3],
        ];
        const ecke = (x, z) => (x - 100 > 8.2 && z - 100 < 7.8 ? 9 : 10);
        const [u6, u7] = [ortUrteil(ortT([lHaus]), ecke), ortUrteil(ortT([haus(8, 8, 10)]), ecke)];
        check(
            "Selbst-Test 11d: das L-Haus steht auf seinen Wänden (Sockel 0); die obb allein liest die leere Ecke als Sockel 1",
            u6.sockelMax === 0 && u7.sockelMax === 1 && u7.sockelTaeter[0].si === 0,
            { waende: u6.sockelTaeter, obb: u7.sockelTaeter }
        );
        // DER FUSS DES GEBAUTEN KÖRPERS (`sl.huelle`): ein Hof-Haus auf ebenem Grund, dessen Ring (hofarm) erst 0,55 m über Grade
        // beginnt, fällt mit 0,55 beim Namen seines Körpers; mit Sockel bis Grade hält es. Und am echten Kern: jedes Hof-Haus
        // des Messort-Plans steht mit dem Fuß jedes Körpers auf Grade (`slotHuelle`); ohne die Solids unter der Diele vor der
        // Front (die Mutante: der Hof-Ring ohne seinen Sockel, wie bis w28-bau-rezept) fällt es am hofarm
        const hofSlots = FC.exportSettlement({ seed: 4291161376, nH: 13 })
            .slots.filter((sl) => (sl.grund?.arten || []).includes("hofarm"))
            .slice(0, 2);
        // das gesetzte Haus: der Grund eines Hof-Hauses des Kerns (`grundVon`), je Körper EIN Kasten vom Fuß bis 3 m — der des Rings ab `fuss`
        const ringHaus = (fuss) =>
            Object.assign({}, hofSlots[0], {
                y: 10,
                huelle: ((q) => q.boxen.map((b, k) => [b[0], q.arten[k] === "hofarm" ? fuss : 0, b[2], b[1], 3, b[3]]))(hofSlots[0].grund),
            });
        const [u8, u9] = [ortUrteil(ortT([ringHaus(0.55)]), eben), ortUrteil(ortT([ringHaus(0)]), eben)];
        const amKern = (mutante) =>
            ortUrteil(
                ortT(
                    hofSlots.map((sl) => {
                        const hu = slotHuelle(FC, sl);
                        return Object.assign({}, sl, {
                            y: 10,
                            // die Mutante: ohne jeden Körper, der unter der Diele ganz vor der Front liegt (die Sockel-Platte des Rings)
                            huelle: mutante ? hu.filter((q) => !(q[4] <= sl.tuer.y + 0.01 && q[5] < sl.tuer.z - 0.1)) : hu,
                        });
                    })
                ),
                eben
            );
        const [u10, u11] = [amKern(false), amKern(true)];
        check(
            "Selbst-Test 11e: der Fuß des gebauten Körpers — der schwebende Hof-Ring fällt mit 0,55 beim Namen (hofarm), mit Sockel hält er; am Kern steht jedes Hof-Haus auf Grade, ohne den Sockel des Rings fällt es",
            u8.sockelMax === 0.55 &&
                u8.sockelTaeter[0].art === "hofarm" &&
                u8.sockelTaeter[0].fuss === 0.55 &&
                u9.sockelMax === 0 &&
                hofSlots.length === 2 &&
                u10.sockelMax === 0 &&
                u11.sockelMax > 0.3 &&
                u11.sockelTaeter.every((q) => q.art === "hofarm"),
            { schwebt: u8.sockelTaeter, kern: u10.sockelTaeter, mutante: u11.sockelTaeter }
        );
        // DIE SICHT DER POSE: der freie Strahl hält; ein Kamm 3 m über dem Boden und die lange Wand eines Nachbarn (ihr Kreis mit
        // der kleineren Halbachse erreicht den Strahl nicht) fallen je beim Namen; die Wand des Ziels selbst zählt nicht
        const ziel = { cx: 20, cz: 0, phi: 0, ex: 3, ez: 3 };
        const pose = { x: 0, z: 0, ziel: { x: 17, z: 0 } };
        const kamm = (x) => (x > 8 && x < 12 ? 13 : 10);
        const nachbar = { cx: 10, cz: 2, phi: 0, ex: 1, ez: 2.5 };
        const [p0, p1, p2] = [
            poseSicht(pose, 11.6, eben, [ziel]),
            poseSicht(pose, 11.6, kamm, [ziel]),
            poseSicht(pose, 11.6, eben, [ziel, nachbar]),
        ];
        check("Selbst-Test P1: der freie Strahl der Pose hält (die Wand des Ziels zählt nicht)", p0.length === 0, p0);
        check(
            "Selbst-Test P2: ein Kamm vor der Fassade fällt als Gelände",
            /^Gelände 1\.40 m .* in 8\.25 m$/.test(p1[0] || ""),
            p1
        );
        check(
            "Selbst-Test P3: die lange Wand des Nachbarn fällt als Grundriss",
            /Grundriss \(10\.0 2\.0\) in 9\.25 m/.test(p2[0] || ""),
            p2
        );
        // der Belag: Gesetz = Karte hält; die Mutante des alten Wirts (Pflaster-Gasse als Erde gemalt) und Pflaster auf der
        // Erd-Gasse fallen beim Namen
        const gasse = (soll, pflaster, erde, gehweg = pflaster) => ({
            i: 3,
            gen: 0,
            quer: false,
            soll,
            pflaster,
            erde,
            gehweg,
        });
        const bF = belagUrteil([gasse("pflaster", 0, 1), gasse("weg", 0.5, 1), gasse("pflaster", 1, 0, 0.2)]);
        check(
            "Selbst-Test 11b: der Belag — Gesetz = Karte hält; die Pflaster-Gasse in Erde, Pflaster auf der Erd-Gasse und ein Gehweg ohne Pflaster fallen beim Namen",
            belagUrteil([gasse("pflaster", 1, 0), gasse("weg", 0, 1)]).length === 0 &&
                bF.length === 3 &&
                /Gehweg 0.2/.test(bF[2]) &&
                /Gasse 3 \(gen 0\): Gesetz pflaster, Karte Pflaster 0/.test(bF[0]),
            bF
        );
        const gut = {
            haeuser: 16,
            slots: 16,
            sockelMax: 0,
            sockelMedian: 0,
            huellen: 16,
            tuerenOk: 2,
            tuerenN: 2,
            kronen: 0,
            laternenWelt: 6,
            laternenPlan: 6,
            laterneWand: 3.1,
            laterneWandSoll: 2.548,
            laterneWeg: 1.55,
            laterneWegSoll: 0.45,
            vorplatzOk: 16,
            vorplatzN: 16,
            terrasseWand: 120,
            terrasseWiese: 0,
            terrasseHalm: 0,
            terrasseFerne: 0,
        };
        Object.assign(gut, {
            planHashGleich: true,
            fremdBauten: 0,
            gtWeg: 76.4,
            quellenGasse: 5,
            poolGasse: 4,
            poolPlaetze: 4,
        });
        check("Selbst-Test 12: das Verdikt eines gehaltenen Orts ist leer", ortVerdikt(gut).length === 0);
        const schlecht = Object.assign({}, gut, {
            kronen: 3,
            laternenWelt: 0,
            planHashGleich: false,
            sockelMax: 2.72,
            gtWeg: 5.2,
            haeuser: 12,
            wasserSlots: 4,
            laterneWand: 1.45,
            laterneWeg: -1.2,
            vorplatzOk: 0,
            terrasseWiese: 87,
            terrasseHalm: 64,
            terrasseFerne: 120,
        });
        const vs = ortVerdikt(schlecht).join(" · ");
        check(
            "Selbst-Test 13: das Verdikt nennt Sockel, Kronen, Laternen, Plan-Hash, den GT auf dem Dorfweg und die Häuser des Exports (4 im Wasser geworfen) beim Namen",
            /Sockel max 2.72/.test(vs) &&
                /Kronen in Grundrissen 3/.test(vs) &&
                /Laternen Welt 0/.test(vs) &&
                /Plan-Hash/.test(vs) &&
                /GT auf dem Dorfweg 5.2 m/.test(vs) &&
                /Häuser 12\/16 des Exports \(4 Slots im Wasser/.test(vs) &&
                /Laterne 1.45 m vor einer Hauswand/.test(vs) &&
                /Laterne -1.2 m neben dem Wegrand/.test(vs) &&
                /Stufe und Vorplatz bis zur Gasse auf dem Weg 0\/16/.test(vs) &&
                /Wand der Terrasse mit Wiesen-Stoff 87\/120/.test(vs) &&
                /Wand der Terrasse mit Halm-Grund 64\/120/.test(vs) &&
                /Wand der Terrasse in der Ferne ohne Schutt 120\/120/.test(vs) &&
                /Wand der Terrasse mit Wiesen-Stoff 0\/0/.test(
                    ortVerdikt(Object.assign({}, gut, { terrasseWand: 0 })).join(" · ")
                ),
            vs
        );
        check(
            "Selbst-Test 13b: endet der Dorfweg vor 8 s, zählt das Tempo bis zum Ende (48 m in 5,1 s hält, 20 m in 5,1 s fällt)",
            ortVerdikt(Object.assign({}, gut, { gtWeg: 48.16, gtEnde: 5.1 })).length === 0 &&
                /GT auf dem Dorfweg 20 m in 5.1 s/.test(
                    ortVerdikt(Object.assign({}, gut, { gtWeg: 20, gtEnde: 5.1 })).join(" · ")
                )
        );
        // Selbst-Test 16 (das Dorf-Licht der Gasse): ein Weg von 60 m, fünf Laternen 3 m neben ihm alle 10 m — die Gasse
        // sieht vier, ein Haus zwischen Weg und Laternen verdeckt zwei, ohne Quellen bleibt nichts, und das Verdikt nennt die Gasse
        {
            const weg = [];
            for (let x = 0; x <= 60; x += 2) weg.push([x, 0]);
            const lat = [10, 20, 30, 40, 50].map((x) => [x, 3]);
            const hfov = 2 * Math.atan(Math.tan((75 * Math.PI) / 360) * (16 / 9));
            const frei = gassenLicht(lat, [weg], [], hfov);
            const haus = { cx: 35, cz: 2, ex: 6, ez: 0.5, phi: 0 };
            const zu = gassenLicht(lat, [weg], [haus], hfov);
            const leer = gassenLicht([], [weg], [], hfov);
            // die Quelle an der Wand: drei Häuser 3–9 m neben dem Weg, je eine Wandlaterne 0,3 m tief unter der Traufe — an der
            // Wand zum Weg sieht die Gasse alle drei, an der Rückwand keine (die Linie läge tiefer im Grundriss als die Quelle)
            const reihe = [15, 30, 45].map((x) => ({ cx: x, cz: 6, ex: 4, ez: 3, phi: 0 }));
            const vorn = gassenLicht(
                reihe.map((h) => [h.cx, h.cz - h.ez + 0.3]),
                [weg],
                reihe,
                hfov
            );
            const hinten = gassenLicht(
                reihe.map((h) => [h.cx, h.cz + h.ez - 0.3]),
                [weg],
                reihe,
                hfov
            );
            const vg = ortVerdikt(Object.assign({}, gut, { quellenGasse: 3, poolGasse: 0 })).join(" · ");
            const vp = ortVerdikt(Object.assign({}, gut, { quellenGasse: 4, poolGasse: 1 })).join(" · ");
            check(
                "Selbst-Test 16: die Gasse sieht die Laternen am Weg, ein Haus verdeckt sie, ohne Quellen bleibt 0, die Wandlaterne zählt an der Wand zum Weg und nie an der Rückwand, das Verdikt nennt Gasse und Pool",
                frei.n >= 4 &&
                    zu.n < frei.n &&
                    zu.verdeckt > 0 &&
                    leer.n === 0 &&
                    vorn.n === 3 &&
                    hinten.n === 0 &&
                    hinten.verdeckt === 3 &&
                    /Dorf-Licht der Gasse nachts 3 sichtbare Quellen/.test(vg) &&
                    /Licht-Pool der Gasse nachts 0/.test(vg) &&
                    /Licht-Pool der Gasse nachts 1 Quellen des Orts \(Soll ≥ 4\)/.test(vp),
                JSON.stringify({
                    frei: frei.n,
                    zu: zu.n,
                    verdeckt: zu.verdeckt,
                    leer: leer.n,
                    wandVorn: vorn.n,
                    wandHinten: hinten.n,
                })
            );
            // Selbst-Test 16b (`poolZaehlen`, der Rang des Pools): vier sichtbare Laternen A 8 m · B 21 m · C 35 m · D 43 m, die
            // Wandlaterne W 20 m ohne sichtbaren Kopf; der Pool hält A, W, B, C — D wartet. W zählt, solange ihre Kugel den Kegel
            // berührt und ihr Rang vor D liegt (4 von 4); außer dem Kegel, hinter D oder als fremdes Licht zählt sie nie (3 von 4, ROT).
            {
                const [A, B, C, D, W] = [
                    [8, 0],
                    [21, 0],
                    [35, 0],
                    [43, 0],
                    [0, 20],
                ];
                const P = (q) => ({ x: q[0], z: q[1] });
                const pool = [A, W, B, C].map((q) => ({ ...P(q), staerke: 1 }));
                const rang = (w) =>
                    [
                        [A, 8],
                        [W, w],
                        [B, 21],
                        [C, 35],
                        [D, 43],
                    ].map(([q, n]) => ({ ...P(q), rang: n }));
                const zahl = (w, qs = [A, B, C, D, W]) =>
                    poolZaehlen(pool, [A, B, C, D], qs, rang(w), [A, B, C, D].map(P), POOL_AUSSER_RANG);
                const [recht, ausser, hinter, fremd] = [
                    zahl(20),
                    zahl(POOL_AUSSER_RANG + 20),
                    zahl(50),
                    zahl(20, [A, B, C, D]),
                ];
                const rot = (n) =>
                    ortVerdikt(Object.assign({}, gut, { quellenGasse: 4, poolPlaetze: 4, poolGasse: n }))
                        .join(" · ")
                        .includes("Licht-Pool der Gasse nachts 3 Quellen des Orts (Soll ≥ 4)");
                check(
                    "Selbst-Test 16b: der Pool nach seinem Rang — die nähere Quelle des Orts im Kegel zählt, außer dem Kegel, hinter der Wartenden und fremdes Licht fallen ROT",
                    recht.poolOrt === 4 &&
                        recht.poolNaeher === 1 &&
                        [ausser, hinter, fremd].every((q) => q.poolOrt === 3 && q.poolNaeher === 0 && rot(q.poolOrt)) &&
                        !rot(recht.poolOrt),
                    JSON.stringify({ recht, ausser, hinter, fremd })
                );
            }
        }
        // V7 (K10, das Brücken-Etikett): ein Weg quer über einen Fluss (die Rinne |x| < 3, 2 m tief) trägt eine Brücke von
        // Widerlager zu Widerlager, unter ihr keine Trasse und ein FREI-Splat: der Grund in der Rinne bleibt (kein Damm). Ohne
        // das Wasser-Urteil (ctx.wasserAt) staut der Erdbau die Rinne auf die Höhe des Wegs — die Linse sieht den Unterschied.
        {
            require(path.join(root, "gelaende-core.js"));
            const Gb = globalThis.__gelaendeCore;
            const pts = [];
            for (let x = -20; x <= 20; x += 2) pts.push({ x, z: 0 });
            const planB = { slots: [], roads: [{ pts, w: 3 }], laternen: [] };
            const rinne = (x) => (Math.abs(x) < 3 ? -2 : 0);
            const ctxB = (mitWasser) => ({
                hoeheAt: (x) => rinne(x - 100),
                flaeche: (sp) => {
                    const E = Gb.erdbauNormal(sp);
                    return (x, z) => Gb.erdbauFlaeche(E, x, z);
                },
                wasserAt: mitWasser ? (x) => Math.abs(x - 100) < 3 : null,
            });
            const mit = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(true)); // BÜHNE: reines ortPlan-Fixture über einer gedachten Rinne
            const ohne = FC.ortPlan(planB, { x: 100, z: 0 }, ctxB(false)); // BÜHNE: reines ortPlan-Fixture über einer gedachten Rinne
            const yMit = Gb.erdbauY(Gb.erdbauNormal(mit.erdbau), 100, 0, -2);
            const yOhne = Gb.erdbauY(Gb.erdbauNormal(ohne.erdbau), 100, 0, -2);
            const br = mit.roads[0].bruecken || [];
            const freiN = mit.erdbau.filter((p) => p.art === "frei").length;
            check(
                "Selbst-Test 14: das Brücken-Etikett — der Weg über die Rinne trägt EINE Brücke, ein FREI-Splat hält den Grund (kein Damm), ohne Wasser-Urteil staut der Erdbau",
                br.length === 1 && freiN === 1 && yMit === -2 && yOhne > -1.5 && Math.abs(mit.roads[0].ys[10]) < 1e-9,
                JSON.stringify({ br, freiN, yMit, yOhne, deck: mit.roads[0].ys[10] })
            );
            // V7b (bruecke-quert, `amUfer`): DIE BRÜCKE QUERT — derselbe Plan über einem Fluss, der längs z fließt (ctx.flussAt),
            // mit drei Gassen: längs im Bett, schräg (53° zum Lauf) und quer. Das Gesetz: jede Brücke ≥ querGrad zum Lauf und so
            // lang wie das Wasser quer breit ist, die Gasse längs ohne Brücke am Ufer, die schräge quert am anderen Ufer normal,
            // die quere byte-gleich wie ohne Lauf. ROT beim Namen: der Kern ohne die Wand des Winkels (jeder Lauf bleibt Brücke).
            const quert = brueckeQuertUrteil(FC, Gb);
            const ohneWinkel = kernMutante(kernText(), [
                ["return !(dl > 1e-6) || Math.abs(dx * t.tx + dz * t.tz) <= cosQ * dl; // die Spanne quert", "return true; // die Spanne quert"],
            ]);
            const quertRot = ohneWinkel.text ? brueckeQuertUrteil(kernAusText(ohneWinkel.text, "ohne-winkel"), Gb) : null;
            check(
                "Selbst-Test 14b: die Brücke quert — längs, endend und im Bett am Ufer ohne Brücke, schräg normal über das andere Ufer, quer byte-gleich; der Kern ohne Winkel-Wand ist ROT beim Namen",
                quert.gruen && !!quertRot && !quertRot.gruen && /längs/.test(quertRot.wo),
                `Gesetz: ${quert.wo || "grün"} · ohne Winkel: ${quertRot ? quertRot.wo || "grün (die Linse sieht ihn nicht)" : ohneWinkel.fehlt}`
            );
            // V7c (bruecke-quert, `wegZwischen`): DER FELDWEG QUERT — frei schräg über den Fluss, gezwungen zu einer Furt längs,
            // um einen Teich, trocken. ROT beim Namen: der Kern ohne die gerade Brücke (Schritt für Schritt durchs Bett) und der
            // Kern, dessen Glättung Punkte ins Wasser zieht.
            const feld = feldwegQuertUrteil(FC);
            const feldRot = [
                ["ohne gerade Brücke", ["if(fluss&&!zu[k2]){ if(feucht[k2]<0)", "if(false){ if(feucht[k2]<0)"], /gezwungen.*längs/],
                ["Glättung ins Wasser", ["&&!(nass&&nass(q.x,q.z))? q : p;", "? q : p;"], /Teich/],
            ].map(([wer, mu, re]) => {
                const m = kernMutante(kernText(), [mu]);
                const u = m.text ? feldwegQuertUrteil(kernAusText(m.text, "feldweg")) : null;
                return { wer, rot: !!u && !u.gruen && re.test(u.wo), wo: u ? u.wo || "grün (die Linse sieht ihn nicht)" : m.fehlt };
            });
            check(
                "Selbst-Test 14c: der Feldweg quert — frei mit querer Brücke, die gezwungene Furt längs kein Weg, um den Teich nie im Wasser, trocken byte-gleich; der Kern ohne gerade Brücke und der mit der Glättung ins Wasser sind ROT beim Namen",
                feld.gruen && feldRot.every((f) => f.rot),
                `Gesetz: ${feld.wo || "grün"} · ${feldRot.map((f) => `${f.wer}: ${f.wo}`).join(" · ")}`
            );
        }
        // V-K (Leiter mensch.netz.verkehr): die Kreuzung — das Gesetz GRÜN, eine um 0,3 m gehobene Fahrbahn des zweiten Wegs ROT beim Namen
        {
            require(path.join(root, "gelaende-core.js"));
            const [k0, k1] = [{}, { stoer: 1 }].map((o) => kreuzungsUrteil(FC, globalThis.__gelaendeCore, o));
            check(
                "Selbst-Test K KREUZUNG: das Gesetz GRÜN · die gehobene Fahrbahn ROT beim Namen",
                k0.gruen && !k1.gruen && /bei -?\d/.test(k1.wo),
                `Gesetz ${k0.max.toFixed(3)} · Mutante ${k1.max.toFixed(3)} (${k1.wo})`
            );
        }
        // V-Z (siedlung.K2): der Zensus am Rang-Gesetz mit festem Export (das Fenster misst die Größen allein) — das Gesetz
        // GRÜN; ROT beim Namen ZIPF: gleich große Siedlungen, jede Stufe so groß wie die erste, ein Export ohne Graph, einer
        // ohne Mauer (Z1: keine Stadt), kein Rang
        const R = FC.SIEDLUNG.rang;
        const zf = [
            {},
            { gleich: 36 },
            { rang: R.map((r) => ({ ...r, nH: R[0].nH })) },
            { graph: null },
            { mauer: null },
        ];
        const zs = [...zf, { rang: [] }].map((f) => {
            const ex = () => ({ groesse: "stadt", mauer: { segs: [0] }, graph: { nE: 1 }, slots: [], ...f });
            const zelle = (...a) => ((q) => (q && f.gleich ? { ...q, nH: f.gleich } : q))(FC.siedlungsZelle(...a));
            return rangZensus({ ...FC, siedlungsZelle: zelle }, { ex, S: { ...FC.SIEDLUNG, rang: f.rang || R } }).zipf;
        });
        check(
            "Selbst-Test Z ZIPF: das Gesetz GRÜN · gleich große Siedlungen, Stufen gleich groß, ohne Graph, ohne Mauer, ohne Rang ROT",
            zs[0].gruen && !zs.slice(1).some((z) => z.gruen),
            zs.map((z) => `ZIPF ζ ${z.zeta} [${z.ki}] ${z.export}`).join(" · ")
        );
        // V-S (w28-stadt-funktion · w28-stadt-netz): das Gesetz der Kacheln GRÜN; ROT beim Namen: ein Ring, der Kacheln verliert (die
        // Summe), eine Kachel ohne Erbe (sie stünde in der Zeit ihres eigenen Samens), ein Gesetz, das beim zweiten Fragen anders
        // antwortet, eines, das zwei Kacheln denselben Samen gibt, und ein Netz, dessen Tore aus dem Samen der KACHEL kommen statt
        // aus dem der Kante (die Naht reißt)
        const sm = [
            {},
            { wort: (s, n, i, k) => (i > 0 ? null : FC.viertelWort(s, n, i, k)) },
            {
                wort: (s, n, i, k) =>
                    ((v) => (v && (i || k) ? { ...v, erbe: undefined } : v))(FC.viertelWort(s, n, i, k)),
            },
            {
                wort: (
                    (z) => (s, n, i, k) =>
                        ((v) => (v && (i || k) ? { ...v, nH: v.nH - (z++ % 2) } : v))(FC.viertelWort(s, n, i, k))
                )(0),
            },
            { wort: (s, n, i, k) => ((v) => (v && (i || k) ? { ...v, seed: 4711 } : v))(FC.viertelWort(s, n, i, k)) },
            {
                netz: (s, ix, iz) =>
                    ((N) => ({ ...N, tore: { ...N.tore, w: N.tore.w.map((t) => t + ((ix * 7 + iz * 3) % 5) * 0.5) } }))(
                        FC.kachelNetz(s, ix, iz)
                    ),
            },
            // die Form im Bild (w28-stadt-form): Massen auf halber Tiefe (der Stab) · der Ton je Kachel statt je Lage (die Kante)
            {
                massen: (...a) =>
                    ((m) => m && { ...m, lage: m.lage.map((v, j) => (j % 7 === 4 ? v / 2 : v)) })(FC.kachelMassen(...a)),
            },
            { tonAn: (s, i, k, m) => ((f) => (col) => f(col, 0, 0))(FC.stadtTonAn(s, i, k, m)) },
        ].map((o) => stadtFunktion(FC, o));
        check(
            "Selbst-Test S STADT ALS NETZ: das Gesetz GRÜN · verlorene Kacheln, ohne Erbe, nicht zustandslos, gleiche Samen, Tore aus dem Samen der Kachel, Massen als Stäbe, der Ton je Kachel ROT beim Namen",
            sm[0].gruen &&
                /die Kacheln tragen/.test(sm[1].fehl) &&
                /ohne Erbe|die Mitte in/.test(sm[2].fehl) &&
                /beim zweiten Fragen/.test(sm[3].fehl) &&
                /denselben Samen/.test(sm[4].fehl) &&
                /NAHT/.test(sm[5].fehl) &&
                /FORM STAB/.test(sm[6].fehl) &&
                /FORM TON-KANTE/.test(sm[7].fehl),
            sm.map((m) => m.fehl.slice(0, 2).join(" | ") || "grün").join(" · ")
        );
        // V-G (w28-gruendung-flach): ohne Raster (eine Zelle für alle) fragt `fremd` wieder jeden Grundriss — G1 fällt beim Namen
        const Gm = gruendungFlach(FC, { raster: Infinity });
        check(
            `Selbst-Test G: ohne Raster wachsen die Proben je Stand mit N (${Gm.max} > ${G_SCHRANKE})`,
            !Gm.gruen,
            Gm.je
        );
        // V-W (siedlung.K4 Staffel 2): ein Zeitplan, der je 2 min Welt-Uhr ein Los setzt (ohne Bewohner), wächst auch ohne
        // Wohlstand, in Furcht und ohne Leute — W2 nennt ihn
        const zeitplan = (C, Z, ak, t) =>
            ((m) => ({ jahr: Math.max(Z.jahr, C.jahre[m - 1]), kraft: 0, uhr: t, lose: m }))(
                Math.min(C.jahre.length, 1 + Math.floor(t / 120))
            );
        const [Wg, Wz] = [{}, { wachstum: zeitplan }].map((o) => wachstumsGang(FC, { ...o, orte: [[1]] }));
        check("Selbst-Test W: das Gesetz hält ohne Bewohner, ein Zeitplan nicht (W2)", Wg.halt && !Wz.halt, Wz.halten);
        // V-C2: der Ort hält den Zug — die Ruhe am Null-Renderer (vor w12-dorf-probe) und ein Takt, der unter dem Haken bestellt,
        // fallen beim Namen
        check("Selbst-Test C2", !dorfZugAmOrt({ still: 1 }) && dorfZugAmOrt({ ohne: 1, still: 1 }));
        errs.push(...breiteSelbsttest(taeterFaelle, breiteRollen)); // die Breite der Stadt: der grüne Gang und seine Täter
        huelleProben(FC, check, { kernText: kernText(), golden: loseGolden, taeter: true }); // die Hülle vor dem Schnitt fällt beim Namen
        wurfProben(check, { kernText: kernText(), taeter: true }); // der EINE Strom der Lose (vor Welle SAMEN) fällt beim Los
        brandwandProben(FC, check, { kernText: kernText(), taeter: true }); // die Brandwand an dims (vor los-huelle-2) fällt beim Namen
        // V-T (mensch.wirtschaft.technik): jede Mutante des Technik-Gesetzes fällt in ihrem Urteil beim Namen
        const tSoll = { "Bronze ohne Zinn": "T2", "Technik ohne Vorgänger im Bild": "T1", "jede Saat derselbe Stand": "T3", "Eisen ohne Schachtofen": "T2" };
        for (const [name, R] of Object.entries(TECHNIK_TAETER)) {
            const m = kernMutante(kernText(), R), rot = [];
            if (m.text) {
                const K = kernAusText(m.text, "technik-" + name);
                const o = tSoll[name] === "T1" ? { saaten: [1, 7] } : { bild: false };
                technikUrteil(Object.assign(technikGang(K, o), o), (w, ok, d) => ok || rot.push(`${w} — ${d || ""}`.slice(0, 220)));
            }
            check(`Selbst-Test T: „${name}“ fällt in ${tSoll[name]} beim Namen`, rot.some((w) => w.startsWith(tSoll[name])), m.fehlt || rot.join(" · "));
        }
        // V-R (mensch.bau.bauen, haus-gestalt): der Kern, der das Klima des Orts nicht liest, fällt in R1 beim Namen
        for (const [name, R] of Object.entries(KLIMA_TAETER)) {
            const m = kernMutante(kernText(), R),
                rot = [];
            if (m.text)
                klimaUrteil(
                    klimaGang(kernAusText(m.text, "klima-" + name)),
                    (w, ok, d) => ok || rot.push(`${w} — ${d || ""}`.slice(0, 220))
                );
            check(
                `Selbst-Test R: „${name}“ fällt in ${KLIMA_SOLL[name]} beim Namen`,
                rot.some((w) => w.startsWith(KLIMA_SOLL[name])),
                m.fehlt || rot.join(" · ")
            );
        }
        // Selbst-Test F (nacht-fenster-glas): je Täter am Stamm fällt die Linse des wachen Glases (`fensterLicht`, vier Häuser des
        // Plans) beim Namen — der Zweig des Glases fehlt in den Quellen, das Glas nimmt einen Platz, der Fleck strahlt hinter die Wand
        const FENSTER_SOLL = {
            "ohne Glas-Zweig": /Fenster 0 .*: 0 Quellen in `_leuchtQuellen`/,
            "Glas auf dem Platz": /Normale auf einem Platz des Pools \(`_leuchtWahl`\)/,
            "ohne Lambert": /Zellen hinter der Wand tragen Licht \(`_lichtKarteFleck`\)/,
        };
        let fensterRohe = null;
        for (const [name, T] of Object.entries(FENSTER_TAETER)) {
            const m = fensterLicht(root, { FC, taeter: T, haeuser: 4, rohe: fensterRohe });
            fensterRohe = m.rohe;
            const v = fensterUrteil(m);
            check(
                `Selbst-Test F: „${name}“ fällt in der Linse des wachen Glases beim Namen`,
                v.some((x) => FENSTER_SOLL[name].test(x)),
                v.slice(0, 2).join(" · ")
            );
        }
        selbsttestEnde(errs);
        process.exit(0);
    }
    // ===== DIE BREITE DER STADT (siedlung, Staffel Breite): die Stadt des Messorts steht in der Welt, der Gang durch jede Gasse
    // zählt, was steht und im Bild ist (lib/stadt-proben.cjs) =====
    if (process.argv.includes("--breite")) {
        const ort = process.argv.includes("--ort") ? process.argv[process.argv.indexOf("--ort") + 1] : BREITE.ort;
        const server = statikServer();
        const { browser, page } = await nullWelt(server, {
            port: Number(process.env.SETTLEMENT_PORT || 4436),
            frist: 900000,
        });
        const m = await page.evaluate(stadtBreite, { ...BREITE, ort });
        await browser.close();
        server.close();
        const v = breiteUrteil(m, breiteRollen);
        // was der Ort nicht tragen kann, steht beim Namen in der Zeile (die Rolle folgt der Lage, `breiteOhne`)
        const ohne = breiteOhne(m);
        check(
            `BREITE (siedlung) die Stadt am Messort ${m.ort} im Gang durch ihre Gassen${ohne.length ? ` — ${ohne.join(" · ")}` : ""}`,
            !v.length,
            v.join(" · ")
        );
        console.log(`BREITE ${JSON.stringify(m)}`);
        process.exit(errs.length ? 1 : 0);
    }

    // Teil J urteilt über das Gesetz und seine Mutanten: ohne Erbe bricht die Überdeckung, der Turm von 1455 (bis K4 die
    // Ring-Stadt) und ein Export ohne Tracht fallen beim Namen
    const [nur, ww] = [(t) => process.argv.includes("--nur-" + t), process.argv.includes("--nur-ww")];
    // Teil F (`--nur-f` allein): DAS WACHE GLAS IST EINE QUELLE — die Familie des Dorf-Lichts in Node (lib/ort-proben.cjs
    // `fensterLicht`: der Stamm im vm, die Häuser des Plans durch den EINEN Eintritt der Hülle, Mitternacht)
    if (nur("f") || (!nur("z") && !nur("w") && !nur("j") && !nur("t") && !nur("r") && !ww)) {
        console.log("=== TEIL F: DAS WACHE GLAS IST EINE QUELLE (nacht-fenster-glas, Dorf-Licht) ===");
        const m = fensterLicht(root, { FC });
        const { rohe, ...zahl } = m;
        console.log("FENSTER-LICHT " + JSON.stringify({ ...zahl, fehl: m.fehl.length }));
        const v = fensterUrteil(m);
        check(
            `F1 DAS WACHE GLAS: ${m.wach} wache Fenster in ${m.haeuser} Häusern (${m.jeHaus} je Haus) tragen ${m.quellen} Quellen „fenster“ (je Zeile genau eine, 0,05 m vor ihrem Glas), ${m.verzeichnis} Häuser im Verzeichnis „licht“, ${m.wahlGlas} Glas auf einem Platz, je Fleck ${m.zellen} Zellen, ${m.hinten} hinter der Wand`,
            !v.length,
            v.join(" · ")
        );
        console.log(`  Teil F: ${(m.ms / 1000).toFixed(1)} s`);
        if (nur("f")) wandEnde(errs, "DAS WACHE GLAS IST EINE QUELLE (Teil F).");
    }
    if (nur("r") || (!nur("z") && !nur("w") && !nur("j") && !nur("t") && !nur("f") && !ww)) {
        console.log("=== TEIL R: DIE BAUWEISE FOLGT DEM KLIMA (mensch.bau.bauen, haus-gestalt) ===");
        const t0 = Date.now(),
            K = klimaGang(FC);
        console.log("KLIMA " + JSON.stringify(K.je));
        klimaUrteil(K, check);
        console.log(`  Teil R: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        if (nur("r")) wandEnde(errs, "DIE BAUWEISE FOLGT DEM KLIMA (Teil R).");
    }
    if (nur("t") || (!nur("z") && !nur("w") && !nur("j") && !nur("r") && !ww)) {
        console.log("=== TEIL T: DIE TECHNIK WÄCHST AUS VORAUSSETZUNGEN (mensch.wirtschaft.technik) ===");
        const t0 = Date.now(), T = technikGang(FC);
        console.log(
            "TECHNIK " +
                JSON.stringify({ ohneVor: T.ohneVor, ohne: T.ohne, imBild: T.imBild, staende: [...T.staende], fehl: T.fehl, spike: T.spike })
        );
        technikUrteil(T, check);
        console.log(`  Teil T: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
        if (nur("t")) wandEnde(errs, "DIE TECHNIK WÄCHST AUS VORAUSSETZUNGEN (Teil T).");
    }
    if (!nur("z") && !nur("w") && !nur("t") && !nur("r") && !ww) {
        console.log("=== TEIL J: DIE JAHRESRINGE (siedlung.K4) ===");
        const mut = (dp) =>
            ((x) => ({ ...x, kleidung: null, mauer: null, slots: [{ ...x.slots[1], rolle: "turm", baujahr: 1455 }] }))(
                FC.exportSettlement(dp)
            );
        // die Mutante der Welt-Zeit (mensch.macht.wehrbau#3): der Kern urteilt die Mauer am Jahr des Schnitts — der Ort der Welt
        // 1900, dessen Chronik in der Hanse endet, trüge seine Mauer
        const mutWelt = (dp) =>
            ((x) => (x.mauer || !(x.staedtisch && x.jahr < FC.MAUER_BIS) ? x : { ...x, mauer: { segs: [], towers: [], R: 0 } }))(
                FC.exportSettlement(dp)
            );
        const zahl = { nH: 24, saaten: [1, 2, 3, 5] };
        const [J, J0, Jm, Jz, Jz0, Jw] = [
            {},
            { ohneErbe: 1 },
            { ex: mut, saaten: [5] },
            zahl,
            { ...zahl, ohneErbe: 1 },
            { ...zahl, ex: mutWelt, saaten: [1] },
        ].map((o) => jahresringe(FC, o));
        const fehl = [...J.fehl, ...Jz.fehl];
        console.log(
            "JAHRESRINGE " +
                JSON.stringify({
                    min: J.min,
                    paare: J.paare,
                    ohneErbe: J0.min,
                    fehl,
                    zahl: [Jz.min, Jz0.min],
                })
        );
        check(
            `J1 JAHRESRINGE ${J.min}, mit Zahl ${Jz.min} (≥ 0,8; ohne Erbe ${J0.min} · ${Jz0.min})`,
            Math.min(J.min, Jz.min) >= 0.8 && Math.max(J0.min, Jz0.min) < 0.8
        );
        check(
            `J2 EPOCHE: ${fehl.length} Brüche, die Mutanten ${Jm.fehl.length} · ${Jw.fehl.length}; ${J.voll || 0} von 8 Saaten tragen die ganze Achse bis zur Moderne (Soll ≥ 1)`,
            !fehl.length &&
                J.voll >= 1 &&
                /turm \S+ 1455/.test(Jm.fehl) &&
                /Kleidung null/.test(Jm.fehl) &&
                /Mauer fehlt/.test(Jm.fehl) &&
                /Mauer zu viel \(\S+, Ort der Welt \d+, Schnitt \d+\)/.test(Jw.fehl),
            fehl.slice(0, 6).join(" · ")
        );
        const [WG, WGm] = [wehrGestalt(FC), wehrGestalt(FC, { mut: 1 })];
        check(
            `J3 DIE GESTALT DER WEHR (fachwerk mauerNetz): ${WG.formen.map((x) => `${x.art} ${x.wand} + ${x.turm} Dreiecke (${x.teile}${x.zinnen ? ", " + x.zinnen + " Zinnen" : ""})`).join(" · ")} · Zaun ${WG.zaun} — jedes zu seiner Normale gewunden, Fuß und Kopf im Gesetz, die Zinne im Band der Quelle (0,70–2,35 m breit, 1–2 m hoch, Scharte ≤ Zinne); die Mutante mit einem gedrehten Dreieck fällt (${WGm.fehl.length})`,
            WG.formen.length === 3 && !WG.fehl.length && WG.band === true && WGm.fehl.length === 1,
            [...WG.fehl, ...WGm.fehl].slice(0, 4).join(" · ")
        );
        if (nur("j")) wandEnde(errs, "DIE JAHRESRINGE STEHEN (Teil J).");
    }
    if (!nur("z") && !ww) {
        console.log("=== TEIL W: DAS WACHSTUM (siedlung.K4 Staffel 2) ===");
        const W = wachstumsGang(FC);
        console.log("WACHSTUM " + JSON.stringify({ ...W, ringe: undefined }));
        check(
            `W1 WACHSTUM in ${WACHS_S} s: ${W.je.join(" · ")}; Ringe ${W.min} (≥ 0,8), Takte ≠ Stück ${W.stueck}`,
            W.ganz && W.min >= 0.8 && !W.stueck
        );
        check(`W2 AUS BEWOHNERN (wohl 0, ohne Leute halten; Gewalt bremst): ${W.halten.join(" ")}`, W.halt);
        if (nur("w")) wandEnde(errs, "DER ORT WÄCHST AUS SEINEN BEWOHNERN (Teil W).");
    }

    if (!ww) {
        console.log("=== TEIL Z: DAS RANG-GESETZ (siedlung.K2) ===");
        const Z = rangZensus(FC);
        const alt = FC.exportSettlement({ seed: 5 }); // „moderne" ohne Zahl ergibt stadt: Teil J
        check(
            `Z1 RANG: binnen 2 km eine ummauerte Stadt in ${Z.mitStadt}/8 Saaten (Soll ≥ 6)`,
            Z.ok,
            Z.saaten.join(" · ")
        );
        // 18 Lose, zwei Scheunen und das Burg-Viertel der Stadt-Grammatik (Palas, Bergfried, Torhaus, Kapelle) — bis zu ihr 21 Slots;
        // bis w28-bau-rezept fiel die zweite Scheune des Plans beim Setzen still (23 von 24 Losen), jetzt steht jedes Los des Plans
        check(`Z2 OHNE EPOCHE ${alt.slots.length} Slots (18 Häuser)`, alt.slots.length === 24 && alt.slots.length === FC.DORF({ seed: 5 }).houses.length); // prettier-ignore
        console.log("ZIPF " + JSON.stringify(Z.zipf));
        check(
            `Z3 ZIPF: ζ ${Z.zipf.zeta} [${Z.zipf.ki.join("; ")}] über ${Z.je.length} Saaten × 32 × 32 km (Soll 0,8–1,2), ${Z.zipf.export}`,
            Z.zipf.gruen
        );
        // Z4 (w28-stadt-funktion): die Stadt über der Wand eines Viertels ist eine Funktion über Vierteln (lib/ort-proben.cjs)
        const SV = stadtFunktion(FC);
        check(
            `Z4 STADT ALS NETZ (Wand ${FC.STADT_FUNKTION.voll}, ${FC.STADT_NETZ.jeKachel} Häuser je Kachel): die Summe der Kacheln ist die Zahl des Worts, die Tore jeder Kante aus beiden Kacheln gleich, die Mauer nur am Rand der Stadt, die Kachel in der Zeit der Mitte, kein Haus ein Stab, keine Ton-Kante — ${SV.je.join(" · ")}`,
            SV.gruen,
            SV.fehl.slice(0, 4).join(" · ")
        );
        if (process.argv.includes("--nur-z")) process.exit(errs.length ? 1 : 0);

        console.log("=== TEIL K: DIE KREUZUNG IST EINE FLÄCHE (Leiter mensch.netz.verkehr) ===");
        require(path.join(root, "gelaende-core.js"));
        const K = kreuzungsUrteil(FC, globalThis.__gelaendeCore);
        console.log("KREUZUNG " + JSON.stringify({ max: +K.max.toFixed(3), wo: K.wo, je: K.je }));
        check(
            `K1 KREUZUNG: der größte Sprung der Fahrbahn je 0,5 m ${K.max.toFixed(3)} m (Soll ≤ 0,06) — ${K.wo}`,
            K.gruen
        );
        if (process.argv.includes("--nur-k")) process.exit(errs.length ? 1 : 0);

        console.log("=== TEIL G: DIE GRÜNDUNG IST FLACH (w28-gruendung-flach) ===");
        const G = gruendungFlach(FC);
        console.log("GRUENDUNG " + JSON.stringify(G.je));
        check(
            `G1 FLACH: die Grundriss-Proben je Stand der Wandlaterne (\`fremd\`) bei 2N / N höchstens ${G.max} (Soll ≤ ${G_SCHRANKE})`,
            G.gruen,
            G.je
        );
        if (process.argv.includes("--nur-g")) process.exit(errs.length ? 1 : 0);

        console.log("=== N5.7 SETTLEMENT — TEIL N: exportSettlement (Node, deterministisch + eingefroren) ===");
        const plans = {};
        for (const dp of FIXTURES) {
            const key = JSON.stringify(dp);
            const p1 = FC.exportSettlement(dp);
            const p2 = FC.exportSettlement(dp);
            plans[key] = p1;
            check(`deterministisch fuer ${key} (zwei Läufe byte-gleich)`, fingerprint(p1) === fingerprint(p2));
            check(
                `Slots sauber fuer ${key} (>=4, bekannte Kulturen, endliche Anker, |x/z| < 5000)`,
                Array.isArray(p1.slots) &&
                    p1.slots.length >= 4 &&
                    p1.slots.every(
                        (s) =>
                            typeof s.kultur === "string" &&
                            FC.KULTUR[s.kultur] &&
                            isFinite(s.x) &&
                            isFinite(s.z) &&
                            isFinite(s.phi) &&
                            Math.abs(s.x) < 5000 &&
                            Math.abs(s.z) < 5000 &&
                            s.ov &&
                            typeof s.ov === "object"
                    ),
                `slots=${p1.slots?.length}`
            );
        }

        // Golden: EINGEFROREN — gemintet NUR wenn die Datei fehlt (Taille-Disziplin).
        if (!fs.existsSync(goldenFile)) {
            fs.mkdirSync(goldenDir, { recursive: true });
            const golden = {};
            for (const dp of FIXTURES) {
                const key = JSON.stringify(dp);
                golden[key] = {
                    sha256: fingerprint(plans[key]),
                    slots: plans[key].slots.length,
                    name: plans[key].name,
                    groesse: plans[key].groesse,
                };
            }
            jsonSchreiben(goldenFile, golden, 4, "\n");
            console.log(`  🧊 Golden GEMINTET (${goldenFile}) — ab jetzt EINGEFROREN.`);
        }
        const golden = jsonLesen(goldenFile);
        for (const dp of FIXTURES) {
            const key = JSON.stringify(dp);
            check(
                `GOLDEN byte-treu fuer ${key} (${golden[key]?.slots} Slots · „${golden[key]?.name}")`,
                !!golden[key] && golden[key].sha256 === fingerprint(plans[key]),
                golden[key] ? fingerprint(plans[key]).slice(0, 12) : "Golden fehlt"
            );
        }
    }

    // ===== U6c: SNAP-/BRANDWAND-PROBE — die EINE Wahrheit, zwei Leser =====
    // Die Gesetze wohnen im Kern (__fachwerkCore.reihenSnap/brandwand, verbatim aus
    // buildDorf gewandert); das Lab ruft DIESELBEN Funktionen. Probe 1 (synthetisch):
    // zwei dichte parallele Nachbarn docken auf die Norm-Fuge und markieren die
    // anliegende Seite als Brandwand. Probe 2 (end-to-end): ein städtischer Export
    // trägt ov.brandwand — der Kern-Layout-Pfad KONSUMIERT das Gesetz.
    if (!ww) console.log("\n=== U6c: REIHEN-SNAP + BRANDWAND (Kern-Gesetz, beidseitiger Konsum) ===");
    if (!ww) {
        const gap = 0.06; // Metropol-Norm — dicht (<=0.6), der Snap-Pfad ist scharf
        // zwei Nachbarn (8 × 7 m) in einer Reihe, der zweite `x` m weiter (Grundriss-Daten einer Einheits-Probe, kein Ort)
        const paar = (x) => [
            [0, x].map(() => ({ dims: { W: 8, D: 7 }, kern: false, p: {}, reich: { x0: 0, x1: 0, z0: 0, z1: 0 } })),
            [0, x].map((cx) => ({ phi: 0, x: cx, z: 0, obb: { cx, cz: 0, phi: 0, ex: 4, ez: 3.5 } })),
        ];
        const [Bs, pl] = paar(9);
        const snaps = FC.reihenSnap(Bs, pl, gap);
        const fuge = Math.abs(pl[1].obb.cx - pl[0].obb.cx) - 8; // (Wi+Wj)/2 = 8
        check("Snap-Probe: zwei dichte Nachbarn docken an (1 Paar)", snaps === 1, `snaps=${snaps}`);
        check("Snap-Probe: die Fuge ist die Norm-Fuge", Math.abs(fuge - gap) < 1e-9, `fuge=${fuge.toFixed(4)}`);
        check(
            "Snap-Probe: x und obb.cx rücken kohärent (Solids/OBB fließen konsistent)",
            pl[0].x === pl[0].obb.cx && pl[1].x === pl[1].obb.cx
        );
        Bs.forEach((B, i) => (B.q = pl[i]));
        const bwN = FC.brandwand(Bs, gap);
        check(
            "Brandwand-Probe: die anliegenden Seiten sind markiert (x1 am linken, x0 am rechten Haus)",
            bwN === 2 &&
                Bs[0].p.brandwand &&
                Bs[0].p.brandwand.x1 === 1 &&
                Bs[1].p.brandwand &&
                Bs[1].p.brandwand.x0 === 1,
            `bwN=${bwN}`
        );
        const weit = FC.reihenSnap(...paar(30), gap);
        check("Snap-Probe: ferne Nachbarn (Fuge>1.8m) bleiben stehen", weit === 0, `snaps=${weit}`);
        losProben(FC, check);
        huelleProben(FC, check, { kernText: kernText(), golden: loseGolden }); // die Hülle liest keine Öffnung, das Los je Same wie am Golden
        wurfProben(check, { kernText: kernText() }); // der Würfel je Los: eine Front würfelt kein anderes Haus neu (Welle SAMEN)
        brandwandProben(FC, check, { kernText: kernText() }); // keine Öffnung reicht in den Körper eines Nachbarn (B1, los-huelle-2)
        const stadt = FC.exportSettlement({ seed: 7, nH: 60 }); // die Großstadt: ihre Reihen docken (der Markt-Flecken von 20 Häusern steht seit der Stadt-Grammatik in Vierteln ohne Reihe)
        const bwSlots = stadt.slots.filter((s) => s.ov?.brandwand).length;
        check(
            "Konsum-Probe: der städtische Export trägt ov.brandwand (der Kern-Pfad ruft DIESELBE Wahrheit wie buildDorf)",
            stadt.staedtisch === true && bwSlots >= 1,
            `groesse=${stadt.groesse} · brandwand-Slots=${bwSlots}`
        );
        // DAS DORF-LICHT: gemessen wird das Licht je METER der Gasse, nie die Zahl der Laternen. Gemessen wird jeder Meter der Weg-Achse, sein Maß der Abstand zur
        // nächsten Quelle des Plans, die nachts brennt (Mast und Wandlaterne, Zeitplan `nacht` > 0): in der Gasse (eine Kern-Wand
        // näher als LICHT_MARKE_M − armM, dort trägt die Wand ihr Licht) jeder ≤ LICHT_MARKE_M (das Gesetz des Kerns,
        // wandLaternen), über alle Meter p90 ≤ 10 m. Je
        // Laterne bleibt ihr Stand: der Mast vor der Wand (LATERNE_WAND aus LICHT_GESETZ.laterne, die Wand trägt höchstens das
        // Doppelte der Gasse; K66) und mit dem Fuß neben jedem Weg (der Tritt des Rezepts), die Wandlaterne mit dem Kopf `armM` vor der Wand eines Kerns (W × D der Tür-Zeile, nie vor der Traufe).
        const trittR = FC.PRESETS.laterne.fx.tritt.r;
        const LGd = FC.LICHT_GESETZ.laterne;
        const LWd = FC.LICHT_GESETZ.wandlaterne;
        const wandSoll = Math.sqrt(Math.max(0, (LGd.hoeheM ** 2 + LGd.kernM ** 2) / 2 - LGd.kernM ** 2));
        const MARKE_SOLL = Number.isFinite(FC.LICHT_MARKE_M) ? FC.LICHT_MARKE_M : 10; // ohne das Gesetz misst sie mit 10 m und fällt
        const MARKE_P90 = 10;
        const GASSE_M = MARKE_SOLL - (LWd ? LWd.armM : 0);
        // der Abstand eines Punkts zur Wand des Kerns eines Slots (die Tür-Zeile W × D um den Slot)
        const kernAbstand = (sl, x, z) => {
            const tu = sl.tuer;
            return tu && tu.W > 0 && tu.D > 0 ? kasten(sl.x, sl.z, sl.phi, tu.W / 2, tu.D / 2, x, z) : Infinity;
        };
        const brennt = (l) => ((l.wand ? LWd : LGd) || { zeit: {} }).zeit.nacht > 0;
        const wegPunkt = (rd, u) => {
            const P = rd.pts || [];
            let acc = 0;
            for (let i = 0; i + 1 < P.length; i++) {
                const s = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z);
                if (acc + s >= u) {
                    const t = s > 0 ? (u - acc) / s : 0;
                    return { x: P[i].x + (P[i + 1].x - P[i].x) * t, z: P[i].z + (P[i + 1].z - P[i].z) * t };
                }
                acc += s;
            }
            return P[P.length - 1];
        };
        // DER RAND DES WEGS FÜR DEN FUSS DER AUSSTATTUNG (w28-stadt-grammatik, Leiter mensch.netz.verkehr): die halbe Fahrbahn — an der
        // Fahrstraße der Stadt (`staedtisch`, ab VERKEHR_GESETZ.breiteM) samt ihrem Gehweg (STADT_DICHTE.gehwegFahrM): der Raum, in
        // den der Wagen ausschert, der einen Stehenden umfährt. Die Linse rechnet ihn aus den Zahlen des Gesetzbuchs, nie aus dem
        // Setzer (fachwerk `wegRand`)
        const wegRandSoll = (pl, rd) =>
            Math.max(1.2, rd.w || 2.5) / 2 +
            (pl.staedtisch && (rd.w || 0) >= FC.VERKEHR_GESETZ.breiteM ? FC.STADT_DICHTE.gehwegFahrM : 0);
        const achsAbstand = (rd, x, z) => {
            const P = rd.pts || [];
            let b = Infinity;
            for (let i = 0; i + 1 < P.length; i++) {
                const [dx, dz] = [P[i + 1].x - P[i].x, P[i + 1].z - P[i].z];
                const L2 = dx * dx + dz * dz;
                const t = L2 > 1e-9 ? Math.max(0, Math.min(1, ((x - P[i].x) * dx + (z - P[i].z) * dz) / L2)) : 0;
                b = Math.min(b, Math.hypot(x - P[i].x - dx * t, z - P[i].z - dz * t));
            }
            return b;
        };
        // DIE AUSSTATTUNG AN DER TRASSE: der Fuß jedes Masts neben dem Rand jedes Wegs (`weg`, wie das Dorf-Licht), die Mitte jedes
        // Brunnens `BRUNNEN_SAUM` hinter ihm (wie `brunnenWeicht` ihn zieht) und keiner von beiden auf einem Torplatz (der Raum der
        // Wende am Ende der Trasse) — der Täter beim Namen (Art, Ort im Plan, Weg)
        const BRUNNEN_SAUM = 0.35;
        const trassenRaum = (pl) => {
            const wege = [...(pl.roads || []), ...(pl.feldwege || [])];
            const tore = (pl.zonen || []).filter((z) => z.name === "torplatz" && z.form === "kasten");
            const taeter = [];
            const pruefe = (art, l, soll, tritt) => {
                wege.forEach((rd, ri) => {
                    const d = achsAbstand(rd, l.x, l.z) - wegRandSoll(pl, rd);
                    if (d < soll - 0.01)
                        taeter.push(
                            `${art} ${l.x.toFixed(1)}/${l.z.toFixed(1)}: ${d.toFixed(2)} m neben dem Rand von Weg ${ri} (w ${rd.w}, Soll ≥ ${soll} m)`
                        );
                });
                for (const z of tore)
                    if (kasten(z.cx, z.cz, z.phi || 0, z.ex, z.ez, l.x, l.z) < tritt - 0.01)
                        taeter.push(
                            `${art} ${l.x.toFixed(1)}/${l.z.toFixed(1)} auf dem Torplatz ${z.cx.toFixed(1)}/${z.cz.toFixed(1)}`
                        );
            };
            for (const l of pl.laternen || []) if (!l.wand) pruefe("Mast", l, trittR, trittR);
            for (const b of pl.brunnen || []) pruefe("Brunnen", b, BRUNNEN_SAUM, FC.AUSSTATTUNG.brunnen.tritt.r);
            return taeter;
        };
        const dorfLicht = (pl) => {
            const L = Array.isArray(pl.laternen) ? pl.laternen : [];
            const maste = L.filter((l) => !l.wand);
            const waende = L.filter((l) => l.wand);
            const ds = [];
            const dunkel = [];
            let gasse = 0;
            (pl.roads || []).forEach((rd, ri) => {
                for (let u = 0; u <= (rd.len || 0); u += 1) {
                    const m = wegPunkt(rd, u);
                    let d = Infinity;
                    for (const l of L) if (brennt(l)) d = Math.min(d, Math.hypot(l.x - m.x, l.z - m.z));
                    ds.push(d);
                    let w = Infinity;
                    for (const sl of pl.slots || []) w = Math.min(w, kernAbstand(sl, m.x, m.z));
                    if (!(w <= GASSE_M)) continue;
                    gasse++;
                    if (!(d <= MARKE_SOLL)) dunkel.push([ri, u, Math.round(d * 10) / 10]);
                }
            });
            let wand = Infinity;
            for (const l of maste)
                for (const { obb: o } of pl.slots || [])
                    if (o) wand = Math.min(wand, kasten(o.cx, o.cz, o.phi, o.ex, o.ez, l.x, l.z));
            const wandOk = !(wand < wandSoll - 0.01);
            let weg = Infinity;
            for (const l of maste)
                for (const rd of [...(pl.roads || []), ...(pl.feldwege || [])]) {
                    const P = rd.pts || [];
                    const halb = wegRandSoll(pl, rd);
                    for (let i = 0; i + 1 < P.length; i++) {
                        const dx = P[i + 1].x - P[i].x;
                        const dz = P[i + 1].z - P[i].z;
                        const L2 = dx * dx + dz * dz;
                        const t =
                            L2 > 1e-9 ? Math.max(0, Math.min(1, ((l.x - P[i].x) * dx + (l.z - P[i].z) * dz) / L2)) : 0;
                        weg = Math.min(weg, Math.hypot(l.x - P[i].x - dx * t, l.z - P[i].z - dz * t) - halb);
                    }
                }
            const wegOk = !(weg < trittR - 0.01);
            // die Wandlaterne hängt: ihr Kopf liegt armM (± 5 cm) vor der Wand eines Kerns (die Tür-Zeile W × D um den Slot)
            let haengt = 0;
            for (const l of waende) {
                let best = Infinity;
                for (const sl of pl.slots || []) best = Math.min(best, Math.abs(kernAbstand(sl, l.x, l.z) - LWd.armM));
                if (best <= 0.05) haengt++;
            }
            const ueber = dunkel.length;
            const weiteste = dunkel.reduce((a, b) => (b[2] > a[2] ? b : a), [null, null, 0]);
            return {
                n: L.length,
                nWand: waende.length,
                ds,
                gasse,
                ueber,
                maxD: weiteste[2],
                wo: weiteste[0] === null ? "-" : `Weg ${weiteste[0]} bei ${weiteste[1]} m`,
                wand: Math.round(wand * 100) / 100,
                weg: Math.round(weg * 100) / 100,
                wegOk,
                haengt,
                haengtOk: haengt === waende.length,
                ok: ueber === 0 && wandOk && wegOk && haengt === waende.length,
            };
        };
        const lichtFehl = [];
        const alleDs = [];
        let lichtN = 0;
        let wandAlle = 0;
        let lAlle = 0;
        let gasseAlle = 0;
        let dunkelAlle = 0;
        for (const [seed, nH] of [
            [7, 12],
            [12345, 6],
            [4291161376, 13],
            [3, 9],
            [7, 18],
            [11, 40],
            [5, 14],
            [9, 20],
            [7, 16],
            [2, 10],
            [1, 8],
        ])
            for (const epoche of [undefined, "antike"]) {
                const pl = FC.exportSettlement({ seed, nH, epoche });
                const d = dorfLicht(pl);
                lichtN++;
                alleDs.push(...d.ds);
                wandAlle += d.nWand;
                lAlle += d.n;
                gasseAlle += d.gasse;
                dunkelAlle += d.ueber;
                if (!d.ok)
                    lichtFehl.push(
                        `${seed}/${nH}/${epoche || "-"}: ${d.ueber}/${d.gasse} Meter der Gasse weiter als ${MARKE_SOLL} m von einer brennenden Quelle (der dunkelste ${d.maxD} m, ${d.wo}), der nächste Mast ${d.wand} m vor einer Wand (Soll ≥ ${wandSoll.toFixed(2)} m) und ${d.weg} m neben dem Wegrand (Soll ≥ ${trittR} m), Wandlaternen an der Wand ${d.haengt}/${d.nWand}`
                    );
            }
        // die Stadt der Moderne (der Zweig der Gas- und Elektro-Laternen, laterneQuer wie im Dorf): kein Fuß im Weg
        for (const [seed, nH, epoche] of [[3, 30, "moderne"]]) {
            const d = dorfLicht(FC.exportSettlement({ seed, nH, epoche }));
            lichtN++;
            if (!d.wegOk)
                lichtFehl.push(
                    `${seed}/${nH}/${epoche}: die nächste Laterne ${d.weg} m neben dem Wegrand (Soll ≥ ${trittR} m)`
                );
        }
        // DIE STADT DER GRAMMATIK (w28-stadt-grammatik): an ihren Fahrstraßen steht kein Mast und kein Brunnen im Gehweg, keiner auf
        // einem Torplatz (`trassenRaum`)
        const trassenFehl = [];
        let trassenN = 0;
        for (const [seed, nH] of [
            [7, 18],
            [7, 120],
            [7, 300],
            [11, 200],
        ]) {
            const pl = FC.exportSettlement({ seed, nH });
            const t = trassenRaum(pl);
            trassenN += (pl.laternen || []).filter((l) => !l.wand).length + (pl.brunnen || []).length;
            if (!pl.staedtisch) trassenFehl.push(`${seed}/${nH}: keine Stadt (die Probe prüfte nichts)`);
            if (t.length) trassenFehl.push(`${seed}/${nH}: ${t.length} — ${t.slice(0, 2).join(" · ")}`);
        }
        check(
            `DER RAUM DER TRASSE (Leiter mensch.netz.verkehr): an der Fahrstraße der Stadt steht kein Mast und kein Brunnen im Gehweg (${FC.STADT_DICHTE.gehwegFahrM} m: der Raum des Wagens, der einen Stehenden umfährt) und keiner auf einem Torplatz (4 Städte, ${trassenN} Masten und Brunnen)`,
            trassenFehl.length === 0,
            trassenFehl.slice(0, 3).join(" · ")
        );
        // DER PLATZ REICHT BIS ZUR BAUFLUCHT (w28-stadt-grammatik, fachwerk `platzSaum`): je Haus, das den Platz fasst (die
        // Strecke vom nächsten Punkt seines Grundrisses zum nächsten Punkt des Platzes ≤ STADT_DICHTE.platzFassM, kein anderer
        // Grundriss auf ihr), liegt jeder halbe Meter dieser Strecke in einer Form mit Belag — der Platz, eine Fläche des Plans
        // (kein Rasen), ein Weg in seiner Belag-Breite (`gassenBreite`) — oder unter einem Grundriss. Was bleibt, ist Wiese
        // zwischen den Leuten des Markts: der Täter beim Namen (Slot, Rolle, Meter)
        const platzWiese = (pl) => {
            const pz = pl.platz;
            const fern = FC.STADT_DICHTE.platzFassM;
            const nah = (o, x, z) => {
                const [u, v] = lokal(o.cx, o.cz, o.phi, x, z);
                const [a, b] = [Math.max(-o.ex, Math.min(o.ex, u)), Math.max(-o.ez, Math.min(o.ez, v))];
                const [c, s] = [Math.cos(o.phi || 0), Math.sin(o.phi || 0)];
                return [o.cx + a * c + b * s, o.cz - a * s + b * c];
            };
            const drin = (o, x, z) => kasten(o.cx, o.cz, o.phi, o.ex, o.ez, x, z) <= 1e-6;
            const obbs = (pl.slots || []).map((sl) => sl.obb);
            const belegt = (x, z) =>
                drin(pz, x, z) ||
                (pl.zonen || []).some(
                    (q) => q.art === "flaeche" && q.form === "kasten" && q.belag !== "gras" && drin(q, x, z)
                ) ||
                (pl.roads || []).some((rd) => achsAbstand(rd, x, z) <= FC.gassenBreite(pl, rd) / 2) ||
                obbs.some((o) => o && drin(o, x, z));
            const aus = { haeuser: 0, wieseM: 0, streckeM: 0, taeter: [] };
            obbs.forEach((o, i) => {
                if (!o) return;
                const b = nah(o, ...nah(pz, o.cx, o.cz));
                const a = nah(pz, ...b);
                const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
                if (!(L > 0.01) || L > fern) return;
                let [w, n] = [0, 0];
                for (let t = 0.25; t < L; t += 0.5) {
                    const [x, z] = [b[0] + ((a[0] - b[0]) * t) / L, b[1] + ((a[1] - b[1]) * t) / L];
                    if (obbs.some((q, k) => k !== i && q && drin(q, x, z))) return; // ein Nachbar steht davor: es fasst den Platz nicht
                    n++;
                    if (!belegt(x, z)) w++;
                }
                aus.haeuser++;
                aus.wieseM += w / 2;
                aus.streckeM += n / 2;
                if (w) aus.taeter.push(`#${i} ${pl.slots[i].rolle || ""} ${w / 2} m Wiese von ${L.toFixed(1)} m`);
            });
            return aus;
        };
        const platzFehl = [];
        let [platzHaeuser, platzM] = [0, 0];
        for (const [seed, nH] of [
            [7, 18],
            [7, 120],
            [7, 300],
            [11, 200],
        ]) {
            const pl = FC.exportSettlement({ seed, nH });
            const w = platzWiese(pl);
            platzHaeuser += w.haeuser;
            platzM += w.streckeM;
            if (!(pl.zonen || []).some((q) => q.name === "platzsaum"))
                platzFehl.push(`${seed}/${nH}: der Plan trägt keinen Saum des Platzes (die Probe prüfte nichts)`);
            if (w.wieseM > 0 || !w.haeuser)
                platzFehl.push(
                    `${seed}/${nH}: ${w.wieseM} m Wiese von ${w.streckeM} m an ${w.haeuser} Häusern — ${w.taeter.slice(0, 2).join(" · ")}`
                );
        }
        check(
            `DER PLATZ REICHT BIS ZUR BAUFLUCHT: zwischen dem Platz der Stadt und jedem Haus, das ihn fasst (≤ ${FC.STADT_DICHTE.platzFassM} m, freie Sicht), liegt Belag — 0 m Wiese (4 Städte, ${platzHaeuser} Häuser, ${platzM} m Strecke)`,
            platzFehl.length === 0,
            platzFehl.slice(0, 3).join(" · ")
        );
        {
            // Selbst-Test 15c: derselbe Plan ohne seinen Saum (der Stand bis w28-stadt-grammatik: „dorf 7 300“ 79 m von 313 m) fällt
            // beim Namen; ein Saum aus Rasen ist keiner
            const st = FC.exportSettlement({ seed: 7, nH: 300 });
            const ohne = platzWiese(Object.assign({}, st, { zonen: st.zonen.filter((q) => q.name !== "platzsaum") }));
            const rasen = platzWiese(Object.assign({}, st, { zonen: st.zonen.map((q) => (q.name === "platzsaum" ? Object.assign({}, q, { belag: "gras" }) : q)) })); // prettier-ignore
            check(
                "Selbst-Test 15c: der Platz bis zur Bauflucht — die Metropole des Gesetzes besteht (0 m), ohne ihren Saum fällt sie beim Namen, ein Saum aus Rasen ebenso",
                platzWiese(st).wieseM === 0 &&
                    ohne.wieseM > 20 &&
                    ohne.taeter.length > 0 &&
                    rasen.wieseM === ohne.wieseM,
                JSON.stringify({
                    mit: platzWiese(st).wieseM,
                    ohne: `${ohne.wieseM} m von ${ohne.streckeM} m`,
                    taeter: ohne.taeter[0],
                    rasen: rasen.wieseM,
                })
            );
        }
        // DER VERKEHR IM PLAN (w28-stadt-grammatik, lib/verkehrsnetz-proben.cjs): der Wagen im Ring, die Wende ohne Begegnung, der
        // Kranz samt Ausscheren, der freie Fahrer-Stand — samt den Selbst-Tests 15d bis 15g
        verkehrsnetzProben(FC, check, studioKern("koerper-core.js", "__koerperCore"), studioKern("tetrapoda-core.js", "__tetrapodaCore"));
        alleDs.sort(aufsteigend);
        const mq = (q) => (alleDs.length ? rang(alleDs, q) : Infinity);
        if (!Number.isFinite(FC.LICHT_MARKE_M)) lichtFehl.push("der Kern trägt kein LICHT_MARKE_M (das Soll je Meter)");
        if (!(mq(0.9) <= MARKE_P90)) lichtFehl.push(`p90 je Meter ${mq(0.9).toFixed(1)} m (Soll ≤ ${MARKE_P90} m)`);
        console.log(
            `  DORF-LICHT je Meter: dunkle Gasse ${dunkelAlle}/${gasseAlle} Meter weiter als ${MARKE_SOLL} m · alle Meter Median ${mq(0.5).toFixed(1)} m · p90 ${mq(0.9).toFixed(1)} m · max ${(alleDs[alleDs.length - 1] || 0).toFixed(1)} m · Laternen ${lAlle} (Wand ${wandAlle})`
        );
        check(
            `DAS DORF-LICHT je Meter: jeder Meter der Gasse (Kern-Wand ≤ ${GASSE_M.toFixed(1)} m) ≤ ${MARKE_SOLL} m von einer Quelle, die nachts brennt, alle Meter p90 ≤ ${MARKE_P90} m; der Mast vor der Wand und mit dem Fuß neben dem Weg, die Wandlaterne an der Wand (${lichtN} Pläne, ${gasseAlle} Meter Gasse)`,
            lichtFehl.length === 0,
            lichtFehl.slice(0, 3).join(" · ")
        );
        // DAS LICHT DER WANDLATERNE IST DAS DER LATERNE (nacht-lichter): dieselbe Leuchte — Lichtstärke, Kern (die Flamme),
        // Farbtemperatur, Reichweite, Abfall, Glas —, nur ihr Leib hängt anders (Kopf hoeheM über der Gasse, armM vor der Wand),
        // und sie brennt nachts. Bis nacht-lichter urteilte hier das Wand-Gesetz K66 (die Wand ≤ 2 × die Gasse): es hielt nur mit
        // einem Kern von 2,74 m in einem Glas von 22 cm — die Gasse trug ein Siebtel einer Laterne. Das Datum ihres Rezepts hält
        // gate:fachwerk-contract.
        const gleich = ["cd", "kernM", "kelvin", "reichweiteM", "abfall", "glasStreu"].filter((s) => !LWd || LWd[s] !== LGd[s]);
        check(
            `Das Licht der Wandlaterne ist das der Laterne (${LWd ? LWd.cd : "?"} cd, Kern ${LWd ? LWd.kernM : "?"} m, ${LWd ? LWd.kelvin : "?"} K), ihr Leib ${LWd ? LWd.hoeheM : "?"} m über der Gasse und ${LWd ? LWd.armM : "?"} m vor der Wand${gleich.length ? " — anders: " + gleich.join(", ") : ""}`,
            !!LWd && !gleich.length && LWd.zeit.nacht > 0 && LWd.armM > 0 && LWd.hoeheM < LGd.hoeheM
        );
        // DIE WANDLATERNE IM ORTPLAN (K66-2 N1): fällt ein Slot ins Wasser (ortPlan, auch der Rückfall von `_ortWahl`), hängt jede
        // Wandlaterne armM vor der Wand des Hauses, mit dem die Welt sie hebt (`v2.slots[l.slot]`, `_spawnSettlementSlot`), und die
        // des nassen Hauses fällt mit ihm.
        const wandImOrt = (pl, v2, nass) => {
            const W = (v2.laternen || []).filter((l) => l.wand);
            let haengt = 0;
            const fremd = [];
            for (const l of W) {
                const sl = v2.slots[l.slot];
                const d = sl ? kernAbstand(sl, l.x, l.z) : Infinity;
                if (LWd && Math.abs(d - LWd.armM) <= 0.05) haengt++;
                else fremd.push(Number.isFinite(d) ? Math.round(d * 10) / 10 : "kein Haus");
            }
            const nassL = (pl.laternen || []).filter((l) => l.wand && l.slot === nass);
            const bleibt = nassL.filter((l) => W.some((w) => w.x === l.x && w.z === l.z)).length;
            return {
                n: W.length,
                haengt,
                fremd,
                nass: nassL.length,
                bleibt,
                ok: W.length > 0 && !fremd.length && !bleibt,
            };
        };
        {
            const pl = FC.exportSettlement({ seed: 7, nH: 16 });
            const j = (pl.laternen.find((l) => l.wand) || {}).slot;
            const o = Number.isInteger(j) && pl.slots[j] ? pl.slots[j].obb : null;
            const v2 = o
                ? FC.ortPlan(
                      pl,
                      { x: 0, z: 0 },
                      {
                          hoeheAt: () => 10,
                          flaeche: () => () => 10,
                          wasserAt: (x, z) => Math.hypot(x - o.cx, z - o.cz) < 1.0, // nur der Grund von Slot j ist nass
                      }
                  )
                : null;
            const w = v2 ? wandImOrt(pl, v2, j) : null;
            check(
                `Die Wandlaterne hängt im Ortplan an ihrem Haus: Slot ${j} fällt ins Wasser (${v2 ? v2.wasserSlots || 0 : "?"} nass), ${w ? w.haengt : 0}/${w ? w.n : 0} hängen ${LWd ? LWd.armM : "?"} m vor der Wand ihres Slots, ${w ? w.bleibt : "?"}/${w ? w.nass : "?"} des nassen Hauses bleiben`,
                !!w && w.ok && v2.wasserSlots === 1 && w.nass > 0,
                JSON.stringify({ fremd: w && w.fremd.slice(0, 6) })
            );
            // der Ortplan, wie er bis N1 reiste (die Laternen mit den Nummern des v1-Plans), hängt sie an fremde Häuser
            const alt = v2 ? wandImOrt(pl, Object.assign({}, v2, { laternen: pl.laternen }), j) : null;
            check(
                "Selbst-Test 16: der Ortplan mit den Slot-Nummern des v1-Plans (wie bis N1) fällt — Wandlaternen an fremden Häusern, die des nassen Hauses bleibt",
                !!alt && !alt.ok && alt.fremd.length > 0 && alt.bleibt > 0,
                JSON.stringify(
                    alt && { haengt: alt.haengt, n: alt.n, fremd: alt.fremd.slice(0, 4), bleibt: alt.bleibt }
                )
            );
        }
        {
            const pl = FC.exportSettlement({ seed: 7, nH: 12 });
            const o0 = pl.slots[0].obb;
            const p0 = pl.roads[0].pts[2];
            const w0 = pl.roads[0].w;
            const inDerFahrbahn = dorfLicht(
                Object.assign({}, pl, {
                    laternen: pl.laternen.concat([
                        { x: p0.x - Math.sin(p0.th) * (w0 / 4), z: p0.z + Math.cos(p0.th) * (w0 / 4), th: 0 },
                    ]),
                })
            );
            // DIE DICHTE GASSE: derselbe Plan ohne seine Wandlaternen — die Marken der dichten Gasse sind dunkel; eine
            // Wandlaterne 0,9 m von ihrem Stand weg hängt an keiner Wand
            const plG = FC.exportSettlement({ seed: 7, nH: 16 });
            const ohneWand = dorfLicht(Object.assign({}, plG, { laternen: plG.laternen.filter((l) => !l.wand) }));
            const schwebt = dorfLicht(
                Object.assign({}, plG, {
                    laternen: plG.laternen.map((l) =>
                        l.wand
                            ? Object.assign({}, l, { x: l.x - Math.cos(l.th) * 0.9, z: l.z - Math.sin(l.th) * 0.9 })
                            : l
                    ),
                })
            );
            check(
                "Selbst-Test 15: derselbe Plan ohne Laternen fällt im Dorf-Licht, ein Mast an der Wand (0,45 m wie bis K66) ebenso, einer in der Fahrbahn (rd.w/4 von der Achse wie bis K66-n4) am Weg; die dichte Gasse ohne ihre Wandlaternen an der Marke, eine Wandlaterne 0,9 m vor ihrem Stand an der Wand",
                dorfLicht(pl).ok &&
                    !dorfLicht(Object.assign({}, pl, { laternen: [] })).ok &&
                    !dorfLicht(
                        Object.assign({}, pl, {
                            laternen: pl.laternen.concat([
                                {
                                    x: o0.cx + (o0.ex + 0.45) * Math.cos(o0.phi || 0),
                                    z: o0.cz - (o0.ex + 0.45) * Math.sin(o0.phi || 0),
                                    th: 0,
                                },
                            ]),
                        })
                    ).ok &&
                    !inDerFahrbahn.ok &&
                    !inDerFahrbahn.wegOk &&
                    dorfLicht(plG).ok &&
                    plG.laternen.some((l) => l.wand) &&
                    ohneWand.ueber > 0 &&
                    !schwebt.haengtOk,
                JSON.stringify({
                    weg: inDerFahrbahn.weg,
                    wegOk: inDerFahrbahn.wegOk,
                    ohneWand: `${ohneWand.ueber}/${ohneWand.gasse} Meter der Gasse > ${MARKE_SOLL} m, der dunkelste ${ohneWand.maxD} m`,
                    schwebt: `${schwebt.haengt}/${schwebt.nWand}`,
                })
            );
        }
        {
            // DER RAUM DER TRASSE FÄNGT SEINE TÄTER: der Mast am Bordstein der Fahrstraße (der Stand bis w28-stadt-grammatik:
            // der Fuß am Wegrand), der Brunnen 0,6 m hinter dem Bordstein (wie bis dahin gezogen) und der Brunnen auf dem Torplatz
            // fallen beim Namen; derselbe Mast am Wegrand des Dorfs (keine Stadt, kein Gehweg der Trasse) fällt nicht
            const st = FC.exportSettlement({ seed: 7, nH: 120 });
            const tr = st.roads.find((rd) => rd.w >= FC.VERKEHR_GESETZ.breiteM && rd.pts.length > 4);
            const q = tr.pts[3];
            const neben = (rd, p, o) => ({ x: p.x - Math.sin(p.th) * o, z: p.z + Math.cos(p.th) * o, th: 0 });
            const tor = (st.zonen || []).find((z) => z.name === "torplatz");
            const mast = trassenRaum(Object.assign({}, st, { laternen: st.laternen.concat([neben(tr, q, tr.w / 2 + trittR + 0.05)]) })); // prettier-ignore
            const brunnen = trassenRaum(Object.assign({}, st, { brunnen: st.brunnen.concat([neben(tr, q, tr.w / 2 + 0.6)]) })); // prettier-ignore
            const amTor = tor ? trassenRaum(Object.assign({}, st, { brunnen: st.brunnen.concat([{ x: tor.cx, z: tor.cz }]) })) : []; // prettier-ignore
            const dorf = FC.exportSettlement({ seed: 7, nH: 12 });
            const dq = dorf.roads[0].pts[2];
            const imDorf = trassenRaum(Object.assign({}, dorf, { laternen: dorf.laternen.concat([neben(dorf.roads[0], dq, dorf.roads[0].w / 2 + trittR + 0.05)]) })); // prettier-ignore
            check(
                "Selbst-Test 15b: der Raum der Trasse — die Stadt des Gesetzes besteht, ein Mast am Bordstein ihrer Fahrstraße, ein Brunnen 0,6 m hinter dem Bordstein und einer auf dem Torplatz fallen beim Namen; der Mast am Wegrand des Dorfs fällt nicht",
                st.staedtisch &&
                    !dorf.staedtisch &&
                    trassenRaum(st).length === 0 &&
                    mast.length > 0 &&
                    mast.every((t) => t.startsWith("Mast")) &&
                    brunnen.some((t) => t.startsWith("Brunnen")) &&
                    amTor.some((t) => t.includes("auf dem Torplatz")) &&
                    imDorf.length === 0,
                JSON.stringify({
                    stadt: trassenRaum(st).slice(0, 2),
                    mast: mast[0],
                    brunnen: brunnen[0],
                    amTor: amTor[0],
                    imDorf,
                }).slice(0, 700)
            );
        }
    }
    // `--nur-a`: die Pläne am Tisch (Teil A, Node ohne Karte) — der schnelle Lauf nach einem Schnitt am Setzer
    if (process.argv.includes("--nur-a")) process.exit(errs.length ? 1 : 0);

    // ===== TEIL B: der lebende Kanal (Browser, foundry-ON) =====
    console.log("\n=== TEIL B: der lebende Kanal (Browser, foundry-ON, Null-Renderer) ===");
    const PORT = Number(process.env.SETTLEMENT_PORT || 4436);
    const server = statikServer();
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 240000 });
    // DIE PROBEN JE LAUFZEIT-MARKE: `fn` läuft in der Seite, jede Probe setzt ihre Marke (`__marke(name)`); gewartet wird Marke um
    // Marke über das EINE Warten (`waitFor`, sein Name im Puls der Stall-Akte), höchstens eine Runde je Marke — so trägt jede Probe
    // die Frist des Browsers allein, nie die Summe (bis 26.10. EIN Ruf über Teil B und C: am belasteten Laptop riss er nach 240 s
    // in C-K5c, die Linse brach mit Exit 2 vor C-K3). Reißt oder wirft eine, trägt das Ergebnis `bruch` mit ihrer Marke (ein Wurf
    // samt Stapel, ein Riss samt Ursache) und was `fn` bis dahin in `__kanal.res` trug — die EINE Wand der Proben, keine eigene
    // catch-Kette je Probe.
    const jeMarke = async (fn) => {
        await page.evaluate((src) => {
            const K = (window.__kanal = { n: 0 });
            window.__marke = (m) => ((K.marke = m), K.n++);
            K.lauf = new Function("return (" + src + ")")()()
                .catch((e) => ({ ...K.res, bruch: `${K.marke}: ${(e && e.stack) || e}` }))
                .finally(() => (K.ende = true));
        }, fn.toString());
        let K = {};
        try {
            while (!(K = await page.evaluate(() => window.__kanal)).ende)
                await waitFor(page, (n) => window.__kanal.n > n || window.__kanal.ende, K.marke, K.n);
            return await page.evaluate(() => window.__kanal.lauf);
        } catch (e) {
            return { ...K.res, bruch: `${K.marke}: ${(e.cause || e).message}` };
        }
    };
    // die Welt samt den Rezepten der Foundry — vor Teil B und, brach eine Probe, frisch geladen für Teil O
    const bereit = () =>
        page.evaluate(async () => {
            const f = (await __weltDa())._ensureAssetFoundry();
            await __weltDa(() => f && f.ready && f.recipes && f.recipes.alemannisch);
        });
    await bereit();
    if (ww) {
        console.log("=== TEIL WW: DAS JAHR UND DAS WACHSTUM IN DER WELT (siedlung.K4) ===");
        const W = await jeMarke(weltWachstum);
        console.log("WELTWACHSTUM " + JSON.stringify(W));
        const [a, n, g] = [W.alt || {}, W.neu || {}, W.wuchs || {}];
        const ist = `${(W.satz || []).map((o) => [o.nH, o.jahr, o.epoche])} · ${[a.groesse, a.turm, a.tracht, n.groesse, n.turm, n.tracht]}`;
        check(
            `WW1 DAS JAHR: Satz · 1320 · 1935 ${ist}, Häuser ${a.haeuser}/${a.slots} · ${n.haeuser}/${n.slots}`,
            ist === "300,1560,,,,hanse · dorf,false,poncho,stadt,true,tshirt" && a.haeuser * n.haeuser > 0,
            W.bruch
        );
        const k = W.ring || {};
        check(
            `WW3 KERN EINES RINGS: ${k.neu} neue Häuser, Median ${k.zumHaus} m vom Haus, ${k.zumOrt} m vom Ort`,
            k.neu > 0 && k.zumHaus < k.zumOrt,
            W.bruch
        );
        check(`WW4 JEDER NAHE ORT JE TAKT: der Nachbar ${W.nachbar}`, W.nachbar?.[1] > W.nachbar[0], W.bruch);
        check(
            `WW2 DAS WACHSTUM in ${W.uhr} s: ${a.jahr} → ${g.jahr}, Häuser ${a.haeuser} → ${g.haeuser}/${g.slots}, die alten ${g.bleiben}, Erdbau ${g.erdbau}`,
            W.takt &&
                g.jahr > a.jahr &&
                g.haeuser > a.haeuser &&
                g.haeuser >= 0.9 * g.slots &&
                g.bleiben >= 0.9 &&
                g.erdbau?.[1] > g.erdbau[0],
            W.bruch
        );
        await browser.close();
        server.close();
        wandEnde(errs, "DAS JAHR UND DAS WACHSTUM STEHEN IN DER WELT (Teil WW).");
    }

    const out = await jeMarke(async () => {
        const res = (window.__kanal.res = {});
        window.__marke("B");
        // 1) Der Export durch den EINEN Worker (massBau × Häuser braucht Sekunden; ein Hänger reißt an der Marke B).
        const plan = await r._foundryRequestSettlement({ seed: 7, nH: 8 });
        res.planOk = !!(plan && Array.isArray(plan.slots) && plan.slots.length >= 4);
        res.planName = plan && plan.name;
        res.planSlots = plan?.slots ? plan.slots.length : -1;
        if (!res.planOk) return res;
        // 2) Der Konsument: POSITIONS-DETERMINISTISCH am SELBEN Anker (die Wasser-Wand ist
        //    Terrain-Wahrheit je Ort — verschiedene Anker duerfen verschieden viele Slots
        //    tragen; die Determinismus-Aussage ist: derselbe Export + derselbe Anker ⇒
        //    jedes Haus beider Akte exakt am Slot des Plans v2 [x/z/rot/seed]).
        const before = st.architectures.length;
        // BÜHNE: Bau-Anker: derselbe Export am selben Anker — den Ort trägt das Platz-Gesetz des Stamms (_spawnSettlementFromExport)
        const o1 = { x: 400, z: 400 };
        // Der zweite Akt steht auf dem geräumten Ort: die Bau-Wand (_bauFrei) setzt kein Haus in ein Haus — neben dem ersten
        // Dorf entstünde am selben Anker keines (Integration Welle L, gate:haus-welt W7). Die folgenden Proben lesen die
        // lebenden Einträge des zweiten Akts.
        // der Akt hebt über den Zug (K5): Häuser vor dem ersten Bild nach dem ersten — der Zug fragt die EINE Frist vor jedem
        // Haus (`_bauFrist("dorf")`), unter abgelaufener Frist trägt der Schritt genau EINS (die Takt-Garantie)
        const lift0 = r._spawnSettlementSlot;
        let [zugAkt, aus] = [0, false];
        r._spawnSettlementSlot = function (...a) {
            if (!zugAkt) requestAnimationFrame(() => (aus = true));
            zugAkt += !aus;
            return lift0.apply(this, a);
        };
        const fristAus = leihe(r, { _bauFrist: () => -Infinity });
        const r1 = await r._spawnSettlementFromExport(await r._ortWahl(plan, o1), o1);
        fristAus();
        delete r._spawnSettlementSlot;
        res.zugAkt = zugAkt === 1 && r1.placed > zugAkt;
        const akt1 = st.architectures.slice(before);
        for (const e of akt1) r.removeArchitecture(e);
        const mid2 = st.architectures.length;
        const r2 = await r._spawnSettlementFromExport(await r._ortWahl(plan, o1), o1);
        const after = st.architectures.length;
        res.placed1 = r1.placed;
        res.skipped1 = r1.skipped;
        res.placed2 = r2.placed;
        // Die Buchhaltung: der Akt setzt die Häuser seiner Slots und an ihnen die Stücke ihres Hauses — die Wandlaterne (die
        // Laterne des Plans mit `wand` und dem Slot des Hauses, `_spawnSettlementSlot`) und jedes Stück des Plans mit `slot`
        // (`gegenstaende`, das Schild: sein Bauplan aus der Tafel der Welt `ORT_AUSSTATTUNG`) — sonst nichts.
        const istHaus = (e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0;
        const alle1 = st.architectures.slice(mid2, after);
        const e1 = alle1.filter(istHaus);
        const amHaus = (plan.gegenstaende || []).filter((q) => q && Number.isInteger(q.slot));
        const amHausTyp = new Set(["wandlaterne_dorf", ...amHaus.map((q) => (AnazhRealm.ORT_AUSSTATTUNG[q.art] || {}).bauplan)]);
        const wandPlan = (plan.laternen || []).filter((l) => l?.wand).length + amHaus.length;
        res.wand1 = alle1.length - e1.length;
        res.wandPlan = wandPlan;
        res.entriesMatch =
            akt1.filter(istHaus).length === r1.placed &&
            mid2 === before &&
            e1.length === r2.placed &&
            akt1.length === alle1.length &&
            res.wand1 <= wandPlan;
        res.allHaus = alle1.every((e) => istHaus(e) || amHausTyp.has(e.type));
        // Slot-Anker == Plan-Slot, POSITIONS-DETERMINISTISCH: JEDES Haus BEIDER Akte trägt exakt anker + slot.x/z, phi und seed
        // seines Slots, beide Akte heben gleich viele; der zweite steht auf dem Boden des Plans v2 (y = slot.y + 0,5,
        // `_ortWahl` — derselbe Plan am selben Anker; y des ersten ist der Grund vor seinem Erdbau). Die Welt rückt kein Haus:
        // die Ersatz-Orte und die hMax-Suche fielen mit dem Erdbau.
        const v2 = await r._ortWahl(plan, o1);
        res.planV2 = !!(v2 && v2.version === 2);
        res.slotAnchorExact =
            !!v2 &&
            e1.length > 0 &&
            r1.placed === r2.placed &&
            [...akt1.filter(istHaus), ...e1].every((e) => {
                const sl = v2.slots.find((x) => x.seed >>> 0 === e.seed);
                if (!sl || e.rotationY !== (sl.phi || 0)) return false;
                return (
                    Math.abs(e.position.x - (o1.x + sl.x)) < 1e-9 &&
                    Math.abs(e.position.z - (o1.z + sl.z)) < 1e-9 &&
                    (!e1.includes(e) || Math.abs(e.position.y - (sl.y + 0.5)) < 1e-9)
                );
            });
        // HAUS-DOPPELBAU-SCHNITT — der KONSUM-Beweis lebt:
        // (a) jeder platzierte Eintrag trägt den Slot-ov als studioOv (rolle
        //     byte-gleich, per seed dem Export-Slot zugeordnet),
        // (b) der Flatten-Chokepoint LIEST ihn (_artifactStudioOv non-null) und
        //     zwei rollen-verschiedene Häuser trennen sich im ov-Hash — das
        //     Dorf ist kein Kultur-Default-Klonfeld mehr.
        res.ovTravels =
            e1.length > 0 &&
            e1.every((e) => {
                const s = plan.slots.find((sl) => sl.seed >>> 0 === e.seed);
                return (
                    s && e.studioOv && typeof e.studioOv === "object" && e.studioOv.rolle === (s.rolle || "wohnhaus")
                );
            });
        const ovA = e1.length ? r._artifactStudioOv(e1[0]) : null;
        const eB = e1.find((e) => e.studioOv && ovA && e.studioOv.rolle !== ovA.rolle);
        const ovB = eB ? r._artifactStudioOv(eB) : null;
        res.ovKeysSplit = !!(ovA && ovB && r._studioOvHash(ovA) !== r._studioOvHash(ovB));
        // DER ERLEBNIS-HEBEL (Schicht-Vollendung): die Hof-Bäume und Marktstände des Plans stehen, Zäune und Mauer liegen im Satz
        // der Einfriedung (`_einfriedungLege`), die Äcker in der Wege-Karte; ohne die Schichten hebt er keins davon (die Zähne).
        // Die Probe räumt ihre Bauten und zählt das GEBAUTE: die Stücke des Satzes (Zaun) und die Teile des Lesers (`_mauerGebaut`:
        // Wand und Krone je Segment, Turm und Dach je Turm — die Zählung der Streifen des Pools bis mauer-im-stoff).
        const einfriedung = () => [...(st.einfriedung || new Map()).keys()];
        const mauerZahl = () =>
            r._mauerGebaut().filter((x) => /^(wand|turm|dach)$/.test(x.art) || (x.art === "krone" && /:w\d+$/.test(x.stueck)))
                .length;
        const erlebnis = (p, key) => {
            const n0 = st.architectures.length;
            const wk = r._wegeKarteEnsure();
            const b0 = wk.siedlungen.length;
            for (const k of einfriedung()) r._einfriedungFaellt(k);
            __rufe(r, "_spawnSettlementErlebnis", r, "_einfriedungLege", [p, o1, { key }]);
            const zaeune = einfriedung().filter((k) => k.startsWith("zaun:")).length;
            const neu = st.architectures.slice(n0);
            neu.forEach((e) => r.removeArchitecture(e));
            const aecker = wk.siedlungen.slice(b0).some((b) => b.formen.some((fo) => fo.kanal === 1));
            const plan_ = [p.trees, p.staende, p.fences, p.felder].map((x) => (x || []).length).join("/");
            return {
                baeume: neu.filter((e) => e.type.indexOf("baum_") === 0).length,
                staende: neu.filter((e) => e.type === "marktstand_dorf").length,
                zaeune,
                aecker,
                plan: plan_,
                mauer: mauerZahl(),
            };
        };
        // Die Stände stehen nur auf einem Markt-Platz; der Plan des Samens 7 hat keinen — zwei Stände an Hof-Baum-Plätzen des Plans.
        res.erlebnis = v2
            ? erlebnis(
                  Object.assign({}, v2, { staende: (v2.trees || []).slice(0, 2).map((t) => ({ x: t.x, z: t.z })) }),
                  "__probe"
              )
            : null;
        res.planKern = [plan.kernel, (plan.staende || []).length];
        res.erlebnisLeer = v2
            ? erlebnis(Object.assign({}, v2, { trees: [], staende: [], fences: [], felder: [] }), "__probe2")
            : null;
        // DIE STADTMAUER (siedlung.K2): der Erlebnis-Hebel legt die Mauer des Exports der Stadt (Same 9, 36 Häuser) in den
        // Satz der Einfriedung — Wand und Krone je Segment, Turm und Dach je Turm, in der Form ihrer Zeit (fachwerk `mauerGestalt`:
        // die Palisade ohne Krone, die Bastion mit Bollwerken ohne Dach); er wirft, die Natur weicht ihrer Linie
        const vS = await r._ortWahl(await r._foundryRequestSettlement({ seed: 9, nH: 36 }), o1);
        const g = vS.mauer.segs[0];
        res.stadt = Object.assign(erlebnis(vS, "__mauer"), {
            soll: vS.mauer.segs.length * (vS.mauer.krone ? 2 : 1) + vS.mauer.towers.length * (vS.mauer.dach ? 2 : 1),
            wirft: st.chunkSaetze.get("siedlung-einfriedung").mesh.castShadow,
            natur: r._aufWeg(o1.x + (g.x0 + g.x1) / 2, o1.z + (g.z0 + g.z1) / 2, 0.5),
        });
        // DIE MAUER IM STOFF DER WELT (mauer-im-stoff, Gebot 10): was die Mauer ZEICHNET, gelesen am Puffer ihres Satzes — nie am
        // Quelltext. (a) Kein Instanz-Pool der Kiste zeichnet Mauer oder Zaun (der Täter beim Namen: `siedlung-mauer inst×n`, der
        // weiße Stoff mit Instanz-Farbe, ohne Verband); (b) ihr Satz zeichnet im Bau-Stoff der Häuser: derselbe Stoff, den der
        // Wirt den Teilen eines Hauses für ihren Satz gibt (`hausStoffe`); (c) jede Ecke trägt die Nummer des Verbands oder
        // Gefüges ihrer Rolle (`aRegler.w` × 127 gegen fachwerk `gefuegeReihe`; Holz: die Faser ab `GEFUEGE_GESETZ.faser.ab` oder
        // Hirnholz) und den Ton ihrer Rolle; (d) die Gestalt der Form ihrer Zeit steht (Steinring: Zinnen je Wand, das Zeltdach
        // je Turm; Palisade: die Pfahlreihe; Bastion: die Wallkrone). DER LESER GEGEN DEN PUFFER: jedes Teil von `_mauerGebaut`
        // steht im Puffer, wo seine Matrix es nennt (m × Einheits-Form, fachwerk `mauerEinheit`), und jede Ecke der Mauer im
        // Puffer gehört einem Teil des Lesers. `mutant`: "flach" nimmt einem Bereich im Puffer den Verband (und stellt ihn
        // zurück), "zwilling" lässt den Satz in einem zweiten Stoff zeichnen (und stellt den EINEN zurück), "geist" hängt dem
        // Leser ein Teil an, das nicht gezeichnet wird.
        // DER BAU-STOFF DER HÄUSER, wie der Wirt ihn ihrem Satz gibt: das Flat eines Hauses der Probe (Stufe 0, der EINE Chokepoint
        // `_foundryFlattenFor`), je Teil der Stoff seines Satzes (`_bauSatzArt`: der Weg jeder Instanz-Gruppe eines Hauses). Unter
        // dem Null-Renderer zeichnet kein Haus — sein Satz-Stoff steht trotzdem fest; die Probe nimmt die Satz-Arten wieder, die
        // sie dabei eintrug.
        const hausE = e1[0];
        const hausPreset = hausE ? r._foundryPresetForEntry(hausE) : null;
        let hausFlat = false;
        if (hausPreset) await __weltDa(() => (hausFlat = r._foundryFlattenFor(hausE, hausPreset, 0)) !== null);
        const artenVor = new Set((st.satzStoffe || new Map()).keys());
        const hausStoffe = ((hausFlat && hausFlat.leaves) || []).map((lf) => {
            const art = r._bauSatzArt(lf, null, lf.castShadow !== undefined ? !!lf.castShadow : true);
            return art ? st.satzStoffe.get(art).mat : null;
        });
        for (const k of [...(st.satzStoffe || new Map()).keys()]) if (!artenVor.has(k)) st.satzStoffe.delete(k);
        const mauerLinse = (mutant = null) => {
            const FCk = globalThis.__fachwerkCore;
            const s = st.chunkSaetze ? st.chunkSaetze.get("siedlung-einfriedung") : null;
            const kisten = [];
            st.scene.traverse((o) => {
                if (o.isInstancedMesh && /^siedlung-(mauer|zaun)/.test(o.name) && o.count > 0)
                    kisten.push(`${o.name} inst×${o.count}`);
            });
            if (!s || typeof r._mauerGebaut !== "function")
                return { kisten, teile: 0, grund: "kein Satz der Einfriedung, kein Leser" };
            const teile = r._mauerGebaut();
            if (mutant === "geist" && teile.length) {
                const g = Object.assign({}, teile[teile.length - 1]);
                g.m = g.m.slice();
                g.m[12] += 5;
                teile.push(g);
            }
            const A = s.mesh.geometry.attributes;
            const [pos, reg, col] = [A.position.array, A.aRegler.array, A.color.array];
            const stoff = s.mesh.material;
            if (mutant === "zwilling") s.mesh.material = Object.create(stoff);
            const hausTeile = hausStoffe.filter((m) => m === s.mesh.material).length;
            s.mesh.material = stoff;
            const flach = mutant === "flach" && teile.length ? s.bloecke.get(teile[0].bereich) : null;
            const alt = flach ? reg.slice(flach.vStart * 4, (flach.vStart + flach.vAnzahl) * 4) : null;
            if (flach) for (let i = 0; i < flach.vAnzahl; i++) reg[(flach.vStart + i) * 4 + 3] = 0;
            const GG = FCk.GEFUEGE_GESETZ;
            const aus = {
                kisten,
                teile: teile.length,
                hausTeile,
                hausVon: hausStoffe.length,
                ohneVerband: 0,
                tonAb: 0,
                lageAb: 0,
                fremd: 0,
                arten: {},
                formen: {},
                ecken: 0,
                imPuffer: 0,
            };
            // (die Farbe des Satzes als Zahl: ein Float16Array liefert sie, ein Puffer aus rohen Halb-Zahlen (Uint16) wird gewandelt;
            // sRGB → linear wie fachwerk `_linHex`)
            const halb = (h) => {
                if (!(col instanceof Uint16Array)) return h;
                const [e, f] = [(h >> 10) & 31, h & 1023];
                return (h >> 15 ? -1 : 1) * (e === 0 ? f * 2 ** -24 : 2 ** (e - 15) * (1 + f / 1024));
            };
            const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
            for (const x of teile) {
                aus.arten[x.art] = (aus.arten[x.art] || 0) + 1;
                aus.formen[x.form] = (aus.formen[x.form] || 0) + 1;
                const b = s.bloecke.get(x.bereich);
                if (!b) {
                    aus.fremd++;
                    continue;
                }
                const E = FCk.mauerEinheit(x.form, x.arg);
                const reihe = FCk.gefuegeReihe(x.stoff);
                const holz = reihe === GG.rolle.holz;
                const ton = FCk.MAUER_GESTALT.ton[x.stoff];
                // (die Untersicht des Wehrgangs trägt den Anteil des Gesetzes, jedes andere Teil den vollen Ton — aus dem Gesetz, nie
                // aus dem Wort des Lesers)
                const anteil = x.art === "untersicht" ? FCk.MAUER_GESTALT.untersicht : 1;
                const soll = (ton != null ? [16, 8, 0].map((sh) => lin(((ton >> sh) & 255) / 255)) : FCk._colFor(x.stoff)).map(
                    (c) => c * anteil
                );
                const m = x.m;
                aus.ecken += x.n;
                for (let i = 0; i < x.n; i++) {
                    const v = b.vStart + x.v0 + i;
                    const [ex, ey, ez] = [E.pos[i * 3], E.pos[i * 3 + 1], E.pos[i * 3 + 2]];
                    let ab = 0;
                    for (let k = 0; k < 3; k++)
                        ab = Math.hypot(ab, m[k] * ex + m[4 + k] * ey + m[8 + k] * ez + m[12 + k] - pos[v * 3 + k]);
                    aus.lageAb = Math.max(aus.lageAb, ab);
                    const nr = reg[v * 4 + 3];
                    if (holz ? !(nr === GG.faser.hirn || nr >= GG.faser.ab) : nr !== reihe || !(reihe > 0 || x.stoff === "gras"))
                        aus.ohneVerband++;
                    for (let k = 0; k < 3; k++) aus.tonAb = Math.max(aus.tonAb, Math.abs(halb(col[v * 4 + k]) - soll[k]));
                }
            }
            for (const [k, b] of s.bloecke) if (k.startsWith("mauer:")) aus.imPuffer += b.vAnzahl;
            if (flach) reg.set(alt, flach.vStart * 4);
            aus.lageAb = +aus.lageAb.toFixed(5);
            aus.tonAb = +aus.tonAb.toFixed(4);
            return aus;
        };
        res.mauerStoff = Object.assign(mauerLinse(), {
            form: vS.mauer.art,
            segs: vS.mauer.segs.length,
            towers: vS.mauer.towers.length,
        });
        res.mauerMutant = { flach: mauerLinse("flach"), zwilling: mauerLinse("zwilling"), geist: mauerLinse("geist") };
        // DORF-IN-TERRAIN — der Footprint reist als entry.fundament (der Grundriss der Wände und des Erdbaus eines Altstands);
        // das Podest fiel mit dem Erdbau: keine Fundament-Box, kein Sockel-Pool.
        res.fundamentTravels = e1.length > 0 && e1.every((e) => e.fundament && Number.isFinite(e.fundament.ex));
        // 3) fail-closed: ein Slot mit unbekannter Kultur faellt (kein Spawn, kein Crash).
        const fake = jsonKlon(plan);
        fake.slots = [Object.assign({}, fake.slots[0], { kultur: "gibtsnicht" })];
        const o3 = { x: 900, z: 900 }; // BÜHNE: fail-closed gilt an jedem Ort
        const r3 = await r._spawnSettlementFromExport(await r._ortWahl(fake, o3), o3);
        res.failClosed = r3.placed === 0 && r3.skipped === 1;
        // 4) Γ5: spawnSettlement wuerfelt seed-frei aus dem Welt-Stream (Source-Probe am lebenden Symbol).
        // der Same zieht aus dem EINEN Bau-Strom `_bauSame("stadt")` (Welt-Seed:<art>:<n>, FNV-1a) — derselbe für
        // den Chat-Satz „baue dorf hier" (die Probe wandert mit dem Code).
        // derselbe Strom für den Chat-Satz „baue dorf hier" (kein Math.random im Satz hält gate:werkstatt-weg W1)
        const baueHier = (r.chatDslPatterns || []).find((p) => p.example === "baue dorf hier");
        res.gammaHier = !!baueHier && __rufe(baueHier, "build", r, "_bauSame", [["baue dorf hier", "dorf"]]) > 0;
        res.gammaStream =
            __rufe(r, "spawnSettlement", r, "_bauSame", [{ position: null }]) > 0 &&
            __fehlt([r.spawnSettlement, r._bauSame], /Math\.random/);
        // DER DSL-AKT spawn_village liest die Größe aus dem Siedlungs-Gesetz NACH der Buch-Ankunft: das Dorf
        // des Akts trägt nH = SIEDLUNG.nHMin + (Same >>> 24) % SIEDLUNG.nHSpan, gemessen am Rebuild-Gedächtnis (settlementCells).
        {
            const SG = AnazhRealm._siedlungGesetz();
            const same = 0x5a5a1234;
            const pv = { x: o1.x + 600, y: 0, z: o1.z - 600 };
            pv.y = r.getTerrainHeightAt(pv.x, pv.z);
            const ctxV = { budget: { spawnsLeft: 4 }, log: [], rng: () => 0.5, source: "human" };
            r.dslEffects.spawn_village([["at", pv.x, pv.y, pv.z], same], ctxV);
            let cell = null;
            for (const weiter = __deckel("B: das Dorf des DSL-Akts", 600); !cell && weiter();) {
                await sleep(100);
                const sc = st.worldMeta?.settlementCells || {};
                // der Wege-Schlüssel des Dorfs: d:<Same>@<Ort> (der EINE Schreiber `spawn_village`, stamm/siedlung-ort.js;
                // die Probe läuft in frischer Welt, ein älterer Stand ohne @<Ort> lädt hier nie)
                for (const key of Object.keys(sc)) if (key.startsWith(`d:${same >>> 0}@`)) cell = sc[key];
            }
            res.villageNH = cell ? cell.nH : null;
            res.villageNHSoll = SG ? AnazhRealm.Gesetz("fachwerk:siedlungsGroesse")(SG, same, 0) : null;
        }
        // ===== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) =====
        res.c = {};
        window.__marke("C");
        {
            const A = AnazhRealm.AUTO_SETTLEMENT;
            // C1 — die Zell-Wahrheit des Wirts zieht aus dem Strom des Welt-Seeds (Γ5) und kehrt mit ihm zurück; Seltenheit,
            // Größen und Determinismus des Gesetzes (fachwerk `siedlungsZelle` am Kern-Hash) misst Teil Z über 8 × 32 × 32 km.
            const zelleN = (n) => r._autoSettlementCellInfo((n % 13) - 6, Math.floor(n / 13) - 6);
            const cand = [...Array(169).keys()].map(zelleN).find((i1) => i1 && r._autoSettlementSiteOk(i1.x, i1.z));
            const zellen = () =>
                [...Array(169).keys()]
                    .map(zelleN)
                    .filter(Boolean)
                    .map((z) => z.key + ":" + z.seed)
                    .join("|");
            const wmS = st.worldMeta;
            const s0 = wmS.seed;
            const z0 = zellen();
            wmS.seed = (s0 || "anazh-realm-seed") + ":x";
            const z1 = zellen();
            wmS.seed = s0;
            res.c.seedStrom = z0 !== "" && z0 !== z1 && z0 === zellen();
            res.c.spawnClearWall = r._autoSettlementSiteOk(0, 0) === false; // die Warmup-Welt bleibt dorffrei
            // C2 — DER ORT HÄLT DEN ZUG, NIE DAS BILD (`dorfZugAmOrt`): an der Null-Seite lebt der Takt ohne Haken, unter dem
            // Haken false (der Ort der Linse) bestellt er nichts
            const prevHook = window.__anazhAutoSettlement;
            delete window.__anazhAutoSettlement;
            res.c.ohne = r._dorfTaktLebt();
            window.__anazhAutoSettlement = false;
            if (cand) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.still = !r._autoSettlementPendingKey && !r._autoSettlementQueue;
            // C3 — die ERZWUNGENE Dorf-Zelle (Hook an, sichern + wiederherstellen):
            // Export -> Reservierung -> budgetierte Materialisierung ueber Ticks.
            window.__anazhAutoSettlement = true;
            const wm = st.worldMeta;
            const key = cand ? cand.key : null;
            const [kx, kz] = key ? key.split(",").map(Number) : [];
            const archBefore = st.architectures.length;
            const plan = cand ? await r._autoSettlementSpawnCell(kx, kz, cand) : null;
            res.c.planOk = !!(plan && Array.isArray(plan.slots));
            // DORF-ERLEBNIS — das Band wandert MIT dem Gesetz: die
            // Reservierung ist jetzt das Rebuild-Gedächtnis-OBJEKT {seed,nH,x,z}.
            res.c.reserved = !!(
                key &&
                wm.settlementCells &&
                wm.settlementCells[key] &&
                typeof wm.settlementCells[key] === "object" &&
                isFinite(wm.settlementCells[key].seed)
            );
            // EXISTENZ VOR FRAMERATE (Lehre 13): nach der Frist des Takts WARTET der Zug am Tor wie jeder Bauer, er verhungert
            // nie — Takte dauerhaft über der Frist tragen Häuser, und jeder Gang des Zugs ist dort das Pflicht-Stück des Takts.
            // Gemessen über den ECHTEN Pfad des Takts (Q0): der Frame-Dispatcher (`_dispatchFrameJobs`) mit den Jobs des Spiels
            // (`_buildDeferrableJobs`, der Spieler steht, wo er steht), dahinter der Bauer „dorf“ am Tor (`TAKT_BAUER.dorf`, wie
            // `_runFrameScheduler` ihn ruft) unter der abgelaufenen EINEN Frist (w28-takt-frist: `takt`) — er geht nur als
            // Pflicht-Stück (`_bauPflichtGang`), reihum mit jedem Bauer, der Arbeit hat. Gezählt wird in Frames, bis zwei Slots
            // bearbeitet sind (höchstens 3000 Frames ≈ 50 s bei 60 Bildern/s): die Siedlung wächst, kein Gang des Zugs neben dem Tor.
            const fob = st._frameOverBudget;
            let dorfPflicht = 0;
            const takt = (jobs, pos) => {
                r._fristStellen(performance.now() - 1e3, false);
                r._dispatchFrameJobs(jobs);
                r._bauer("dorf", AnazhRealm.TAKT_BAUER.dorf, pos);
                dorfPflicht += r._bauPflichtGang() === "dorf";
            };
            const pmP = st.playerMesh.position;
            const qIdx0 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : null;
            const qJetzt = () => (r._autoSettlementQueue ? r._autoSettlementQueue.idx : null);
            // erst steht der Ring (der Boden zuerst — ein Frame mit Chunk-Bau trägt keine Deko): normale Frames, bis 60 in
            // Folge ohne Chunk-Bau laufen; der Auto-Zug ruht dabei (Hook aus), die Schlange wartet auf die Messung
            let ruhig = 0;
            let vorlauf = 0;
            st._frameOverBudget = false;
            window.__anazhAutoSettlement = false;
            while (ruhig < 60 && vorlauf < 3000) {
                st._frameChunksBuilt = false;
                r._dispatchFrameJobs(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }));
                ruhig = st._frameChunksBuilt ? 0 : ruhig + 1;
                vorlauf++;
                await sleep(0);
            }
            res.c.vorlaufFrames = vorlauf;
            window.__anazhAutoSettlement = true;
            const qStart = qJetzt();
            let dorfGaenge = 0;
            let FRAMES = 0;
            // der Null-Renderer baut sonst ohne Ende; gezählt wird jeder Gang des Dorf-Takts — solange der Zug Häuser trägt, fragt
            // er die Frist (er hat Arbeit) und gibt das Pflicht-Stück nie weiter
            const dorfTakt = AnazhRealm.prototype._tickAutoSettlement;
            const ohne = leihe(r, { _bauFristOhneEnde: () => false, _tickAutoSettlement: (...a) => (dorfGaenge++, dorfTakt.apply(r, a)) }); // prettier-ignore
            while (FRAMES < 3000 && r._autoSettlementQueue && qJetzt() - qStart < 2) {
                st._frameChunksBuilt = false;
                st._frameOverBudget = true;
                takt(r._buildDeferrableJobs({ x: pmP.x, y: pmP.y, z: pmP.z }), { x: pmP.x, y: pmP.y, z: pmP.z });
                FRAMES++;
                await sleep(0);
            }
            ohne();
            r._bauFristTakt = null;
            // gezählt werden die bearbeiteten Slots (ein Slot an Wasser/Klippe fällt geschlossen, er zählt als Schritt)
            const qIdx1 = r._autoSettlementQueue ? r._autoSettlementQueue.idx : qIdx0;
            res.c.ueberBudget = Number.isFinite(qStart) && Number.isFinite(qIdx1) ? qIdx1 - qStart : null;
            res.c.ueberBudgetFrames = FRAMES;
            res.c.dorfGaenge = dorfGaenge;
            res.c.dorfPflicht = dorfPflicht;
            res.c.budgetWall = res.c.ueberBudget >= 1 && dorfGaenge >= 1 && dorfGaenge === dorfPflicht;
            st._frameOverBudget = false;
            // die Materialisierung über Ticks (das Budget je Schritt des Zugs misst Teil B am Akt, `zugAkt`)
            let ticks = 0;
            for (; r._autoSettlementQueue && ticks < 500; ticks++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            const archAfter = st.architectures.length;
            res.c.placed = archAfter - archBefore;
            res.c.ticks = ticks;
            // DORF-ERLEBNIS — die Siedlung hebt auch BRUNNEN (brunnen_dorf) und HOF-BÄUME (Studio-Bäume der
            // trees-Schicht), dazu jedes Stück ihrer Ausstattung (die Bauplan-Zeilen der Tafel `ORT_AUSSTATTUNG`: Stand, Grab,
            // Schild): das Band wandert mit dem Gesetz. Liegt Wasser am Ort, legt sie den Anleger — Steg und Boot, die Werke, die
            // das Gesetz des Anlegers nennt (`AnazhRealm.ANLEGER`, fahrzeug-gattung), nie eine Liste der Linse.
            const stueckTyp = new Set([...Object.values(AnazhRealm.ORT_AUSSTATTUNG).map((Z) => Z.bauplan).filter(Boolean)]);
            const anleger = AnazhRealm.ANLEGER ? [AnazhRealm.ANLEGER.steg, AnazhRealm.ANLEGER.boot] : [];
            res.c.allHaus = st.architectures
                .slice(archBefore)
                .every(
                    (e) =>
                        typeof e.type === "string" &&
                        (e.type.indexOf("haus_") === 0 ||
                            e.type === "brunnen_dorf" ||
                            e.type === "marktstand_dorf" ||
                            e.type === "laterne_dorf" ||
                            e.type === "wandlaterne_dorf" ||
                            stueckTyp.has(e.type) ||
                            anleger.includes(e.type) ||
                            e.type.indexOf("baum_") === 0)
                );
            // C4 — IDEMPOTENZ: dieselbe Zelle nochmal -> 0 neue (Reservierung traegt).
            const again = await r._autoSettlementSpawnCell(kx, kz, cand);
            for (let t2 = 0; t2 < 5; t2++) r._tickAutoSettlement({ x: cand.x, z: cand.z });
            res.c.idempotent = again === null && st.architectures.length === archAfter;
            // C3n — DER ORT KENNT SEINE NACHBARN (mensch.kultur.sprache#1): erwacht, meldet die Zelle jeden Ort des Gesetzes binnen
            // `WEGENETZ.maxM` (`_bewohnerMelden`) — gezählt an den Nachbarn ihres Wegenetzes (`_wegenetzNachbarn`, offen, bis ihr
            // Wasser steht), je Nachbar Name und Region im Register; bis sprache-saaten kannte das Register nur Erwachtes
            {
                const B = r._bewohnerSiedlungen || new Map();
                let nb;
                for (let i = 0; i < 400 && (nb = r._wegenetzNachbarn(key)) === undefined; i++) (r._tickAutoSettlement({ x: cand.x, z: cand.z }), await sleep(20)); // prettier-ignore
                const zelle = (k) => {
                    const m = /^(-?\d+),(-?\d+)$/.exec(k);
                    if (!m || (r._autoSettlementRejected && r._autoSettlementRejected.has(k))) return false;
                    const info = r._autoSettlementCellInfo(+m[1], +m[2]);
                    return !!info && !r._wortOrtVerdraengt(info);
                };
                const gesetz = (nb || []).filter(zelle);
                for (let i = 0; i < 500 && gesetz.some((k) => !B.has(k)); i++) await sleep(20);
                res.c.nachbarn = {
                    key,
                    offen: nb === undefined,
                    gesetz,
                    register: [...B.values()].map((S) => ({ k: S.key, name: S.plan && S.plan.name, region: S.plan && S.plan.region, gemeldet: !!S.gemeldet })), // prettier-ignore
                };
            }
            // C5 — DER GENESIS-PORTAL-RING (Schöpfer: „beim ersten spawn
            // die kernportale um die genesis-plattform anordnen"): am Genesis-Ort
            // (`_genesisMitte`, die Mitte des Plans der Welt) setzt der Ort-Takt jedes Tor des Plans auf seinen Slot (Ring-Weg
            // R 22, Pflicht F); idempotent über die id jedes Elements (die Existenz-Probe), der Stempel `genesisOrt.steht`.
            res.c.ring = {};
            window.__marke("C5");
            {
                const wm5 = st.worldMeta;
                const M5 = r._genesisMitte();
                const d2M = (e) => (e.position.x - M5.x) ** 2 + (e.position.z - M5.z) ** 2;
                const portalArten = [...r._genesisTorTypen().values()];
                res.c.ring.arten = portalArten.length;
                const imRing = () =>
                    st.architectures.filter((e) => e && e.position && portalArten.includes(e.type) && d2M(e) <= 30 * 30)
                        .length;
                const ringVorher = imRing();
                for (let t5 = 0; t5 < 30 && !wm5.genesisOrt?.steht; t5++) r._genesisOrt({ x: M5.x, y: 1, z: M5.z });
                res.c.ring.stempel = !!wm5.genesisOrt?.steht;
                res.c.ring.gebaut = imRing() - ringVorher;
                res.c.ring.stehen = imRing();
                const archRing = st.architectures.filter((e) => portalArten.includes(e.type)).length;
                r._genesisOrt({ x: M5.x, y: 1, z: M5.z }); // Idempotenz: die id jedes Tors trägt
                res.c.ring.idempotent =
                    st.architectures.filter((e) => portalArten.includes(e.type)).length === archRing;
                // Slot-Probe: jedes Tor des Plans sitzt auf seinem Slot (± 0,5 m), dem Ring-Weg R 22
                const P5 = r._genesisPlan;
                res.c.ring.radiusOk = P5.tore.every((t) => {
                    const e = st.architectures.find((a) => a && a.id === "genesis:tor:" + t.k);
                    return !!e && Math.hypot(e.position.x - P5.ort.x - t.x, e.position.z - P5.ort.z - t.z) <= 0.5;
                });
            }
            // C6 — DER WEGE-SCHLÜSSEL TRÄGT DEN ORT: zwei Siedlungen mit DEMSELBEN Samen an
            // zwei Orten bauen je ihre Wege (die Wege-Formen werden am echten Bau gezählt: der Gang der Raten `_stlWegeRaten` läuft
            // durch — ihn gehen der Akt, `_dorfErlebnis`, und `_stlWegeBuild`; die Nähte seines Netzes legt der Ort als Feldweg
            // ohne Gassen, fahrzeug.K2 — gezählt wird der Bau mit Gassen).
            window.__marke("C6");
            {
                const orig = r._stlWegeRaten;
                const formen = [];
                r._stlWegeRaten = function* (...a) {
                    const n6 = yield* orig.apply(this, a);
                    if (a[0] && a[0].roads) formen.push(n6);
                    return n6;
                };
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: 1500, y: 0, z: 1500 } });
                await r.spawnSettlement({ seed: 4711, nH: 6, position: { x: -1500, y: 0, z: 1500 } });
                delete r._stlWegeRaten;
                res.c.wegeJeOrt = formen;
            }
            // C7 — DER BLICK GEHÖRT DEM, DER DAS DORF VERLANGT: ein Dorf aus einem Nexus-Programm (DSL-Quelle „nexus") lässt den Blick des Spielers
            // stehen; eines aus dem Chat-Programm des Spielers (DSL-Quelle „human") und der Befehl „dorf" richten ihn auf IHR
            // neues Dorf (den Schwerpunkt der eben gesetzten Häuser) — nie auf alle Häuser der Welt.
            window.__marke("C7");
            {
                const pm = st.playerMesh;
                const orig = r.spawnSettlement;
                let laeuft = null;
                r.spawnSettlement = function (o) {
                    laeuft = orig.call(this, o);
                    return laeuft;
                };
                const probe = async (px, pz, setzen) => {
                    pm.position.set(px, r.getTerrainHeightAt(px, pz) + 1.2, pz);
                    st.yaw = 1;
                    const vorher = new Set(st.architectures);
                    laeuft = null;
                    setzen();
                    if (laeuft) await laeuft;
                    const neu = st.architectures.filter(
                        (e) => e && !vorher.has(e) && typeof e.type === "string" && e.type.startsWith("haus_")
                    );
                    let cx = 0,
                        cz = 0;
                    for (const e of neu) {
                        cx += e.position.x;
                        cz += e.position.z;
                    }
                    const soll = neu.length ? r._blickGierZu(cx / neu.length - px, cz / neu.length - pz) : null;
                    const d = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
                    return {
                        haeuser: neu.length,
                        gier: +st.yaw.toFixed(4),
                        gedreht: +d(st.yaw, 1).toFixed(4),
                        nebenDorf: soll === null ? null : +d(st.yaw, soll).toFixed(4),
                    };
                };
                const dorf = (same, source) => () => r.dslRun(["spawn_village", ["at_player"], same], { source });
                res.c.blick = {
                    nexus: await probe(1500, -1500, dorf(4712, "nexus")),
                    spieler: await probe(-1500, -1500, dorf(4713, "human")),
                    chat: await probe(1800, 600, () => {
                        const muster = r.chatSystemPatterns.find((q) => q.re.test("dorf 4714 8"));
                        muster.run("dorf 4714 8".match(muster.re), () => {});
                    }),
                    // die Werkzeuge des Spielers: Fähigkeit per Taste, Wirken, Verzehr — und ein Mitspieler (für die Welt)
                    faehigkeit: await probe(-1800, 600, dorf(4715, "ability:dorfruf")),
                    wirken: await probe(1800, -600, dorf(4716, "capability:dorf")),
                    verzehr: await probe(-1800, -600, dorf(4717, "consume:dorfsamen")),
                    mitspieler: await probe(600, 1800, dorf(4718, "remote-peer")),
                };
                r.spawnSettlement = orig;
            }
            // C-K5 — DAS ERSTE HAUS AM ERWACHEN (siedlung.K5): die Zelle von C3, der Spieler naht durch den Vorlauf-Ring; `haus` =
            // Takte vom Erwachen bis zum ersten Slot, `plaene` = Pläne v2 (`ortPlan`) im Haupt-Thread und im Ort-Faden (die
            // Kandidaten JEDER Wahl des Laufs; `letzteWahl` und `runden` nennen die Trasse); `alt` (Selbsttest) stellt die
            // Schichten des Gangs vor das erste Haus
            res.c.k5 = {};
            window.__marke("C-K5");
            const FC = globalThis.__fachwerkCore;
            const ortPlan0 = FC.ortPlan;
            const alt = ["_autoSettlementRejected", "_stlWegePending", "_autoSettlementQueue"].map((f) => r[f]);
            const zelle = wm.settlementCells[key];
            const vorher = [new Set(st.architectures), new Set(Object.keys(wm.erdbau || {}))];
            // die Läufe gehen samt Bauten, Erdbau und Wegen (für den nächsten Lauf und Teil O)
            const raeume = () => {
                for (const e of st.architectures.filter((e) => !vorher[0].has(e))) r.removeArchitecture(e);
                for (const k of Object.keys(wm.erdbau).filter((k) => !vorher[1].has(k))) {
                    const s = wm.erdbau[k];
                    delete wm.erdbau[k];
                    r._erdbauWirkt(s, false);
                }
                if (r._stlWegeKeys) r._stlWegeKeys.delete(key);
            };
            const pm = st.playerMesh;
            const p0 = pm.position.clone();
            // kx, kz: die Zelle von C3 (oben einmal aus `key` gelesen)
            const lauf = async (nH, vorlauf, alt, fern) => {
                st._frameOverBudget = false;
                const seed = (cand.seed ^ Math.imul(nH * 2 + !vorlauf, 0x9e3779b1)) >>> 0;
                r._autoSettlementCellInfo = (x, z) => (x === kx && z === kz ? { ...cand, seed, nH } : null);
                Object.assign(r, {
                    _autoSettlementRejected: new Set(),
                    _stlWegePending: true,
                    _autoSettlementQueue: null,
                });
                delete wm.settlementCells[key];
                let [wach, erst, haus, haupt, faden] = [false, null, -1, 1, 0];
                FC.ortPlan = function (p, ...a) {
                    haupt += wach && p?.slots ? 1 : 0;
                    return ortPlan0.call(this, p, ...a);
                };
                // JEDER Plan des Ort-Fadens in JEDER Runde der Trasse (`_ortMitTrasse`): `_ortWahlMass` nennt nur die letzte Wahl —
                // das Dorf, das nach 11 Plänen 48 m rückte und am neuen Ort 2 rechnete, zählte 2, die Stadt in EINER Runde alle
                const neben = r._nebenAuftrag;
                r._nebenAuftrag = function (wer, msg, ...a) {
                    const p = neben.call(this, wer, msg, ...a);
                    if (msg?.type === "ort-wahl")
                        p.then(
                            (x) => (faden += x.kandidaten),
                            () => {}
                        );
                    return p;
                };
                const lift = AnazhRealm.prototype._spawnSettlementSlot;
                r._spawnSettlementSlot = function (sl, o, ...a) {
                    const q = r._autoSettlementQueue;
                    if (!erst && q && q.cellKey === key) erst = q;
                    return lift.call(this, sl, o, ...a);
                };
                const zug = r._dorfZug;
                if (alt)
                    r._dorfZug = (p, o, k, g) =>
                        zug.call(
                            r,
                            p,
                            o,
                            k,
                            (function* () {
                                for (const v of g) if (v !== true) yield v;
                                yield true;
                            })()
                        );
                // die Umkehr gilt vor dem Gang: die Bahn des Gangs (je Schritt 4 m) kann die Stadt schon wecken (`_bedarfZeit`)
                if (fern) r._dorfZug = (...a) => ((q) => (q.reihe.reverse(), q))(zug.apply(r, a));
                // DER RING STEHT AM ORT DES VORRATS (die Welt: `_autoSettlementZelle` misst `ort = w || i3`): die Ort-Wahl rückt den
                // Plan bis 128 m — bis samen-ein-baum stand die Probe am Wunsch `cand`, und ein Vorrat, den die Wahl 48 + 16 m
                // rückte, erwachte nie (C-K5: 3637 Takte, `zelle` false, `zug` null); nach dem Vorlauf misst sie ab seinem Ort
                let bezug = cand;
                const stell = (m) => (pm.position.set(bezug.x + m, pm.position.y, bezug.z), pm.position);
                const nah = A.nearM + (cand.mehrM || 0); // der Ring, an dem die Zelle erwacht (`_autoSettlementZelle`)
                // DER VORLAUF IST ZEIT (w13-dorf-strom): die Bahn naht mit 16 m/s 40 m jenseits des Rings der Sicht — der Ort
                // bereitet sich vor, weil sie ihn binnen `bereitS` erreicht (`_bedarfZeit`); nH 13 (Selbsttest) steht still: dort
                // ist es eine Strecke (nah + 200 m: der Ring der Sicht `vorlaufM` 160 m und 40 m)
                if (nH - 13) r._bedarf = { t: 0, vx: -16, vz: 0, wand: performance.now() }; // nH 13: ohne Bahn
                if (vorlauf) r._tickAutoSettlement(stell(nah + 200));
                if (vorlauf) for (const v of r._dorfVorraete.values()) await v.fertig;
                const vr = vorlauf && !alt && r._dorfVorraete.get(key);
                if (vr && Number.isFinite(vr.x) && Number.isFinite(vr.z)) bezug = { x: vr.x, z: vr.z };
                for (let i = 0; vorlauf && !alt && i < 20; i++) r._tickAutoSettlement(pm.position);
                // der Gang durch den Vorlauf-Ring (4 m/s, 20 s bis zum Ring): je 4 m ein Takt, der Vorrat liest die Reihe des Zugs,
                // bis seine Stufen stehen — dann erwacht die Zelle am Ring (das Auge des Vorrats, `_dorfVorbacken`)
                for (let m = nah + 80; vr && m > nah + 1; m -= 4)
                    for (let i = 0; i < 400 && (r._tickAutoSettlement(stell(m)), !vr.vorgebacken); i++) await sleep(5);
                const vor0 = new Set(st.architectures); // die Häuser der Läufe davor zählen nie
                const pw = stell(nah - 2);
                // DAS ERSTE HAUS IM BILD (sk5-haus): `bild` = Takte vom Erwachen, bis ein Haus der Zelle in der Stufe steht, die
                // seine Kette für seinen Abstand wählt — in der Mesh-Zone seine gedockte Stufe (`_foundryPlatzBereit`), dahinter
                // seine Hülle im Welt-March über den Chokepoint des Cull-Takts (`_archZiegelFern`; der Null-Renderer zeichnet kein
                // Feld, die Linse öffnet es je Ruf). Der Fit-Takt ist voll wie am Dorf: nähere Fits fragten zuerst (Werkbank am
                // Messort dorf: 49 ja / 1 210 nein). `nahImSchirm`: ein Slot der Mesh-Zone mit der Mitte im Schirm; `fern`
                // (Selbsttest) dreht die Reihe des Zugs um — die Hülle vor dem Haus in der Mesh-Zone.
                const [R, rd] = [st.architectureCullingRadius, st.renderer];
                const d = (q) => Math.hypot(q.x - pw.x, q.z - pw.z);
                const stufe = (e) => {
                    if (d(e.position) <= R) return r._foundryPlatzBereit(e, r._foundryPresetForEntry(e)) && "mesh";
                    while (r._weltBakeErlaubt(0));
                    rd._isHeadlessNull = false;
                    r._archZiegelFern(e);
                    rd._isHeadlessNull = true;
                    return e._ziegelSlot && "huelle";
                };
                let [bild, erstes] = [-1, null];
                wach = true;
                // je Takt die abgelaufene EINE Frist (der Null-Renderer baut sonst am Stück): der Schritt des Zugs trägt sein
                // Pflicht-Stück — EINE Rate des Gangs oder EIN Haus; so zählen die Takte bis zum ersten Haus
                const ohneEnde = leihe(r, { _bauFristOhneEnde: () => false });
                // HÄNGT die Welt vor dem ersten Haus, nennt die Meldung den Zug beim Namen: die Zelle im Export, der Vorrat (sein
                // Wasser-Urteil), der Zug (Gang, Reihe), die Trasse und die abgewiesenen Zellen — bis samen-ein-baum nannte sie nur
                // das Offene der Welt (wald 4476, 3635 Takte), nie, wo der Dorf-Zug stand
                const zugZustand = () => {
                    const q = r._autoSettlementQueue, v = r._dorfVorraete && r._dorfVorraete.get(key);
                    return JSON.stringify({
                        pending: r._autoSettlementPendingKey || null,
                        zelle: !!(wm.settlementCells || {})[key],
                        vorrat: v ? { da: !!v.da, vorgebacken: !!v.vorgebacken, nass: v.wasser ? v.wasser.nass : "-", slots: v.v2 && v.v2.slots ? v.v2.slots.length : null } : null,
                        zug: q ? { zelle: q.cellKey, idx: q.idx, reihe: q.reihe ? q.reihe.length : null, gang: !!q.gang } : null,
                        trasse: r._ortTrasseMass || null,
                        abgewiesen: [...(r._autoSettlementRejected || [])].slice(0, 6),
                        haus,
                        bild,
                    }).slice(0, 700);
                };
                try {
                    for (
                        const weiter = __deckel("C-K5: das erste Haus", 400, () => !!r._autoSettlementPendingKey);
                        (!erst || (!erstes && bild < 400)) && weiter();
                    ) {
                        haus += !erst;
                        r._fristStellen(performance.now() - 1e3, false);
                        r._tickAutoSettlement(pw);
                        bild++;
                        const e = st.architectures.find((e) => !vor0.has(e) && /^haus_/.test(e.type) && stufe(e));
                        if (e) erstes = { typ: e.type, stufe: stufe(e), d: +d(e.position).toFixed(1) };
                        await sleep(5);
                    }
                } catch (f) {
                    // ein NEUER Fehler: die Probe druckt den Stapel, und der trägt die Meldung seiner Geburt
                    throw new Error("DER ZUG " + zugZustand() + " · " + (f && f.message));
                }
                ohneEnde();
                r._bauFristTakt = null;
                [r._dorfZug, r._nebenAuftrag] = [zug, neben];
                const nahImSchirm = (erst ? erst.plan.slots : []).some((s) => {
                    const q = { x: erst.origin.x + s.x, z: erst.origin.z + s.z };
                    return d(q) <= R && r._imErstenBlick(q.x, q.z, 0, true);
                });
                return (
                    erst && {
                        nH,
                        plaene: haupt + faden,
                        letzteWahl: r._ortWahlMass.kandidaten,
                        faellt: { ...r._ortWahlMass.faellt, wirt: r._ortWahlMass.wirt },
                        runden: r._ortTrasseMass.runden,
                        haus,
                        vorrat: vr?.vorgebacken,
                        bild,
                        erstes,
                        nahImSchirm,
                    }
                );
            };
            try {
                for (const [k, nH, v, alt, fern] of [
                    ["vorlauf12", 12, 1],
                    ["vorlauf300", 300, 1],
                    ["fern300", 302, 1, 0, 1],
                    ["teleport12", 12, 0],
                    ["teleport300", 300, 0],
                    ["alt300", 301, 1, 1],
                    ["strecke13", 13, 1],
                ])
                    res.c.k5[k] = await lauf(nH, v, alt, fern);
                const y = st.yaw;
                const slot = (d, w, e = 3) => ({
                    x: d * Math.sin(y + w),
                    z: d * Math.cos(y + w),
                    obb: { ex: e, ez: e },
                });
                // DIE MITTE ZUERST (siedlung-k5-erstes-haus, Winkel in rad): 11 m bei 70° mit 10-m-Grundriss streift der Bildwinkel
                // nur — die Mitte 40 m voraus hebt vor ihm, er vor dem 15 m neben dem Spieler (die Scheibe allein hob ihn zuerst)
                res.c.k5.schirm = r._dorfZug(
                    { slots: [slot(15, 1.57), slot(40, 0), slot(11, 1.22, 5)] },
                    pm.position
                ).reihe;
                // C-K5c DER ORT IST EINE FUNKTION (Lehre 7): zwei Vorläufe derselben Saat, der Spieler 3,7 m versetzt im Vorlauf-Ring
                // — der Plan v2 bit-gleich, sonst die erste abweichende Größe; `stoer` (Selbsttest) rückt den Wunsch mit ihm
                const i3 = { ...cand, seed: (cand.seed ^ 0x51ed) >>> 0, nH: 300 };
                const fnv = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
                const ortLauf = async (d, stoer) => {
                    Object.assign(r, { _dorfVorraete: new Map(), _ortPlaene: new Map(), _ortWahlFlug: new Map() });
                    pm.position.set(i3.x + d, pm.position.y, i3.z);
                    const wahl = r._ortWahl;
                    if (stoer)
                        r._ortWahl = (p, o, ...a) => wahl.call(r, p, Object.assign(o, { x: o.x + d / 1e3 }), ...a);
                    const b = await r._dorfBereiten(key, i3).finally(() => delete r._ortWahl);
                    const v2 = r._ortPlaene.get(AnazhRealm._ortSchluessel(b.plan, b.anker));
                    const s = [
                        b.anker.x,
                        b.anker.z,
                        v2.ort.x,
                        v2.ort.z,
                        ...v2.slots.flatMap((q) => [q.x, q.z, q.y, q.phi]),
                    ];
                    return { s, erdbau: fnv(JSON.stringify(v2.erdbau)), hash: fnv(JSON.stringify(v2)) };
                };
                const erste = (a, b) => {
                    const i = a.s.findIndex((v, j) => v !== b.s[j]);
                    const name =
                        ["anker.x", "anker.z", "ort.x", "ort.z"][i] ||
                        `slot ${(i - 4) >> 2}.${"xzy"[(i - 4) & 3] || "phi"}`;
                    return i >= 0 ? `${name} ${a.s[i]} ≠ ${b.s[i]}` : a.erdbau !== b.erdbau ? "erdbau" : null;
                };
                const ortPaar = async (stoer) => {
                    const [a, b] = [await ortLauf(A.nearM + 140, stoer), await ortLauf(A.nearM + 136.3, stoer)];
                    return { hash: [a.hash, b.hash], erste: erste(a, b) };
                };
                window.__marke("C-K5c");
                res.c.k5.ort = await ortPaar(false);
                res.c.k5.ortStoer = await ortPaar(true);
                // C-K5d DAS ERWACHEN IN RATEN (Lehre 14): je Takt vom Erwachen bis zum letzten Haus (`_tickAutoSettlement`, seine
                // Mikro-Tasks, `_wegeRaeumen`) die Schritte des Dorfs und die ms; `voll` (Selbsttest) baut alles im ersten Takt
                const wachLauf = async (voll) => {
                    raeume();
                    Object.assign(r, { _dorfVorraete: new Map(), _ortPlaene: new Map(), _autoSettlementQueue: null });
                    delete wm.settlementCells[key];
                    pm.position.set(i3.x + A.nearM + 80, pm.position.y, i3.z);
                    await r._dorfBereiten(key, i3);
                    const pw = pm.position.set(i3.x + A.nearM - 20, pm.position.y, i3.z).clone();
                    let [s, im] = [{}, 0];
                    const zaehl = (n, art, f = AnazhRealm.prototype[n]) =>
                        (r[n] = function (...a) {
                            if (!im && (n !== "spawnArchitecture" || /^(brunnen|marktstand)_dorf$/.test(a[0])))
                                s[art] = (s[art] || 0) + 1;
                            return f.apply(this, a);
                        });
                    // EINE Tafel der Haken: sie zählen, und der Lauf löst sie (samt der Slot-Quelle)
                    const HAKEN = {
                        _erdbauSetzen: "erdbau",
                        _erdbauAmWasser: "erdbau",
                        _stlWegeBuild: "wege",
                        _dorfLaterneSetzen: "laternen",
                        spawnArchitecture: "ausstattung",
                        _naturSetzen: "ausstattung",
                    };
                    for (const n in HAKEN) zaehl(n, HAKEN[n]);
                    const slot = r._spawnSettlementSlot;
                    r._spawnSettlementSlot = function (...a) {
                        im++;
                        try {
                            return ((s.haeuser = (s.haeuser || 0) + 1), slot.apply(this, a));
                        } finally {
                            im--;
                        }
                    };
                    const takte = [];
                    r._wegeRaeumen(); // die Flächen der Läufe davor
                    // je Takt die abgelaufene EINE Frist (der Null-Renderer baut sonst am Stück): der Schritt des Zugs trägt dann
                    // genau sein Pflicht-Stück — EINE Rate des Gangs oder EIN Haus (`_dorfZugSchritt`)
                    const ohne = leihe(r, { _bauFristOhneEnde: () => false });
                    try {
                        for (
                            let t = 0, weiter = __deckel("C-K5d", 400, false);
                            t === 0 || r._autoSettlementQueue;
                            t++
                        ) {
                            weiter();
                            s = {};
                            r._fristStellen(performance.now() - 1e3, false);
                            const t0 = performance.now();
                            if (t) r._tickAutoSettlement(pw);
                            else r._autoSettlementSpawnCell(kx, kz, i3);
                            for (let m = 0; m < 3; m++) await Promise.resolve();
                            if (voll && !t)
                                for (pm.position.x += 2000; r._autoSettlementQueue;) r._tickAutoSettlement(pw);
                            r._wegeRaeumen();
                            takte.push({ ms: +(performance.now() - t0).toFixed(1), s });
                            // steht der Spieler im Grund jedes offenen Slots (`_dorfZugSchritt`), geht er
                            const q = r._autoSettlementQueue;
                            if (t && q && !q.gang && !s.haeuser) pm.position.x += 2000;
                        }
                    } finally {
                        for (const n of [...Object.keys(HAKEN), "_spawnSettlementSlot"]) delete r[n];
                        ohne();
                        r._bauFristTakt = null;
                    }
                    const zeile = (t, i) =>
                        `Takt ${i} ${t.ms} ms: ${Object.entries(t.s)
                            .map(([k, n]) => `${k} ${n}`)
                            .join(" · ")}`;
                    const lang = takte.map((_t, i) => i).sort((a, b) => takte[b].ms - takte[a].ms);
                    return {
                        takte: takte.length,
                        haus: takte.findIndex((t) => t.s.haeuser),
                        mehr: takte
                            .map(zeile)
                            .filter((_z, i) => Object.keys(takte[i].s).length > 1)
                            .slice(0, 3),
                        max: lang.slice(0, 4).map((i) => zeile(takte[i], i)),
                        kopf: takte.slice(0, 6).map(zeile),
                    };
                };
                window.__marke("C-K5d");
                res.c.k5.wach = await wachLauf(false);
                res.c.k5.wachVoll = await wachLauf(true);
            } finally {
                FC.ortPlan = ortPlan0;
                for (const f of ["_autoSettlementCellInfo", "_spawnSettlementSlot", "_dorfZug"]) delete r[f];
                [r._autoSettlementRejected, r._stlWegePending, r._autoSettlementQueue] = alt;
                Object.assign(r, { _autoSettlementPendingKey: null, _dorfVorraete: new Map() });
                wm.settlementCells[key] = zelle;
                pm.position.copy(p0);
                raeume();
            }
            // Hook wiederherstellen (sichern + wiederherstellen, nie loeschen — die Disziplin):
            if (prevHook === undefined) delete window.__anazhAutoSettlement;
            else window.__anazhAutoSettlement = prevHook;
            st._frameOverBudget = fob;
        }
        return res;
    });
    const wurf = await jeMarke(async () => {
        window.__marke("Selbsttest");
        throw "__probeWurf";
    });
    check("B/C: jede Probe kehrt an ihrer Marke zurück", !out.bruch, out.bruch);
    check(
        "B/C Selbsttest: die Probe, die wirft, steht beim Namen ihrer Marke",
        wurf.bruch === "Selbsttest: __probeWurf"
    );
    // die gebrochene Probe hält ihre Haken in der Seite (ein Hänger läuft nie in sein finally)
    if (out.bruch) await page.reload().then(bereit);

    // ===== TEIL O: DER ORT AUF DEM GELÄNDE — das Dorf 7/18 der Gründerzeit an einem Hang, gemessen an der Welt =====
    // Der Akt `spawnSettlement` an einem Hang (Gefälle 0,12–0,25 über 16 m, fern der Orte der Teile B und C); gemessen wird,
    // was die Welt trägt: die Häuser (Eintrag: Ort, Gier, Boden y − 0,5), der Grund unter und vor ihnen (`getTerrainHeightAt`,
    // der Boden der Körper), der Wald-Plan (`_forestCellDarts`), die Laternen (Einträge der Studio-Gestalt laterne) und der
    // Plan v2 (`_ortPlaene`).
    const messeOrt = async (modus, messort) => {
        const dpO = { seed: 7, nH: 18, epoche: "gruenderzeit" };
        const outO = await page.evaluate(
            async (urteilSrc, dp, modus, messort) => {
                const [ortUrteil, kasten] = new Function(urteilSrc)();
                const res = {};
                try {
                    const H = (x, z) => r._terrainMacroSurfaceY(x, z, true);
                    const L = r._gelaende();
                    const vorher = st.architectures.length;
                    const zellenVor = new Set(Object.keys(st.worldMeta?.settlementCells || {}));
                    let plan;
                    if (modus === "auto") {
                        // DAS AUTO-DORF DER WELT (Leiter mensch.netz.verkehr): der Dorf-Zug, wie er im Spiel läuft — der Spieler steht am
                        // Mess-Ort `dorf` (spec/profiband/haushalt.json), der Takt (`_tickAutoSettlement`) wählt die Zelle, holt den
                        // Export, legt den Plan v2 und baut die Häuser budgetiert über seine Takte
                        const pm = st.playerMesh;
                        pm.position.set(messort[0], H(messort[0], messort[1]) + 1, messort[1]);
                        const SG = AnazhRealm._siedlungGesetz();
                        const [cx, cz] = [Math.floor(messort[0] / SG.cellM), Math.floor(messort[1] / SG.cellM)];
                        const zelle = (res.zelle = cx + "," + cz);
                        const cells = () => st.worldMeta?.settlementCells || {};
                        // DER SELBST-TEST (Karte SO): ein zweites Dorf im Fenster, die
                        // erste Dorf-Zelle des Gesetzes drei Zellen weit (ihr Bau berührt die Zelle nie), kommt zuerst an und wächst zuerst
                        for (let i = 0; i < 49 && !res.zweit; i++) {
                            const [dx, dz] = [(i % 7) - 3, Math.floor(i / 7) - 3];
                            const zi =
                                Math.max(Math.abs(dx), Math.abs(dz)) === 3 &&
                                r._autoSettlementCellInfo(cx + dx, cz + dz);
                            if (!zi || cells()[zi.key]) continue;
                            r._autoSettlementSpawnCell(cx + dx, cz + dz, zi);
                            res.zweit = r._autoSettlementPendingKey === zi.key ? zi.key : "abgewiesen";
                        }
                        // das Fenster endet am Ereignis DER Zelle (reserviert, ihre Schlange gewachsen), nie an der Ruhe aller Dörfer; baut
                        // der Zug sie nie, ruht er ohne sie (nichts unterwegs über acht Takte) — die Uhr wacht nur gegen ein Hängen
                        const leer = () =>
                            !r._autoSettlementQueue && !r._autoSettlementPendingKey && !r._stlWegePending;
                        const hook0 = window.__anazhAutoSettlement;
                        window.__anazhAutoSettlement = true;
                        try {
                            for (let still = 0; still <= 8;) {
                                const vor = leer();
                                r._tickAutoSettlement(pm.position);
                                const q = r._autoSettlementQueue;
                                if (cells()[zelle] && !(q && q.cellKey === zelle)) break;
                                still = vor && leer() ? still + 1 : 0;
                                await sleep(20);
                            }
                        } finally {
                            window.__anazhAutoSettlement = hook0;
                        }
                        const c = cells()[zelle];
                        if (!c || !Number.isFinite(c.seed)) {
                            res.err = `der Dorf-Zug baut an ${messort.join("/")} kein Dorf der Zelle ${zelle}`;
                            return res;
                        }
                        // das Dorf ohne Wort plant im Klima seines Orts (`_zellEingang`) — die Linse reicht es als Argument aus dem
                        // Ort-Gesetz des Geländes (gelaende-core `ortGesetz`, sein Klima `ortKlima`: Temperatur, Spende, Niederschlag,
                        // Schneefall), nicht aus dem Leser der Welt; der Akt (ein Wort) trägt keins
                        const klima = globalThis.__gelaendeCore.ortKlima(L.ort);
                        plan = { seed: c.seed, nH: c.nH, epoche: r._siedlungEpoche(c.seed), klima };
                    } else {
                        const ort = globalThis.__gelaendeCore.hangOrt(L, (x, z) => r._landAt(x, z, 0.2));
                        res.hang = ort;
                        if (!ort) return res;
                        plan = dp;
                        await r.spawnSettlement(
                            Object.assign({}, dp, { position: { x: ort.x, y: H(ort.x, ort.z), z: ort.z } })
                        );
                    }
                    // DIE ZELLE, DIE DER LAUF BESTELLT HAT (Karte SO): ihr Gedächtnis (`settlementCells`: die Zelle am Mess-Ort, im
                    // Akt der neue Eintrag mit seinem Samen) trägt den Anker, ihr Plan v2 ist der mit ihrem Samen an ihrem Ort, ihre
                    // Häuser und Laternen stehen am Anker + Slot bzw. Laterne des Plans — nie die erste neue Zelle, der letzte Plan
                    // oder alle Bauten seit vorher (die Ankunfts-Reihenfolge mischte ein zweites Dorf im Fenster ein)
                    const sc = st.worldMeta?.settlementCells || {};
                    const neuKeys = Object.keys(sc).filter((k) => !zellenVor.has(k));
                    const zc = sc[res.zelle || neuKeys.find((k) => sc[k]?.seed === dp.seed)];
                    const anker = zc ? { x: zc.x, z: zc.z } : null;
                    // der Export am Ort der Trasse (`wx`, `wz`), wie ihn der Wege-Bau nach dem Laden holt (siedlung.K3)
                    plan = await r._foundryRequestSettlement(
                        Object.assign({}, plan, zc && { ort: { x: zc.wx, z: zc.wz } })
                    );
                    const amOrt = (e, l) =>
                        !!anker &&
                        Math.abs(e.position.x - anker.x - l.x) + Math.abs(e.position.z - anker.z - l.z) < 0.01;
                    const v2 = [...((anker && r._ortPlaene) || new Map()).values()].find(
                        (p) => p.seed >>> 0 === zc.seed >>> 0 && p.ort.x === anker.x && p.ort.z === anker.z
                    );
                    const P = v2 || plan;
                    res.anker = anker;
                    res.planV2 = !!v2;
                    res.trasse = v2 &&
                        zc && {
                            zelle: res.zelle || "Akt",
                            versatzM: +Math.hypot(anker.x - zc.wx, anker.z - zc.wz).toFixed(1),
                            aussen: (plan.trasse || {}).aussen,
                            v2: { ort: v2.ort, roads: v2.roads, slots: v2.slots },
                        };
                    const istHaus = (e) => typeof e.type === "string" && e.type.indexOf("haus_") === 0;
                    const haeuser = st.architectures.filter(
                        (e) => istHaus(e) && P.slots.some((sl) => sl.seed >>> 0 === e.seed && amOrt(e, sl))
                    );
                    res.haeuser = haeuser.length;
                    // die Ankunfts-Lesart (bis Karte SO) für den Selbst-Test: die erste neue Zelle, alle Häuser seit vorher — und das
                    // Ereignis, das er prüft (W9): der Eintrag des zweiten Dorfs steht VOR dem der Zelle (der Zug hält EINE Zelle unterwegs)
                    const [iZ, iZweit] = [neuKeys.indexOf(res.zelle), neuKeys.indexOf(res.zweit)];
                    res.ankunft = {
                        zelle: neuKeys[0],
                        haeuser: st.architectures.slice(vorher).filter(istHaus).length,
                        zweitVor: iZweit >= 0 && iZweit < iZ,
                    };
                    const PR = globalThis.__fachwerkCore.PRESETS;
                    const laternen = st.architectures.filter(
                        (e) =>
                            [PR.laterne?.fx?.licht, PR.wandlaterne?.fx?.licht].includes(r._lichtDatumDerGestalt(e)) &&
                            (P.laternen || []).some((l) => amOrt(e, l))
                    );
                    const masten = laternen.filter((e) => r._lichtDatumDerGestalt(e) === PR.laterne?.fx?.licht);
                    // gezählt am EXPORT (die Slots des Studios): der Plan v2 wirft nasse Slots, bevor er steht (fachwerk `ortPlan`,
                    // `wasserSlots`) — an ihm gezählt sähe die Linse die Häuser nie, die ein Ort ohne trockenen Grund verliert
                    res.slots = plan.slots.length;
                    res.wasserSlots = v2?.wasserSlots || 0;
                    // DER TÄTER JE FEHLENDEM HAUS: die Wand der EINEN Slot-Quelle, an der der Slot fiel — das Wasser
                    // (`_fundamentLand`) oder ein Bau im Weg (`_bauFrei`, mit den Bauten, die keine Natur sind, binnen 8 m)
                    // die Meldung der Ort-Wahl (`_ortWahl`: kein trockener Ort in den Ringen) und ihre Kosten (`_ortWahlMass`)
                    res.ortMass = r._ortWahlMass;
                    res.ortWahl = (st.logBuffer || [])
                        .map(String)
                        .filter((z) => /ORT: der Plan/.test(z))
                        .slice(-2);
                    res.slotFehl = [];
                    if (anker)
                        for (const sl of P.slots) {
                            if (haeuser.some((e) => e.seed === sl.seed >>> 0)) continue;
                            const ry = sl.phi || 0;
                            // der Grundriss des Slots aus dem EINEN Leser (`_grundrissVon`: obb samt Saum, sonst der Tür-Kern)
                            const fp = r._grundrissVon(sl) || { ex: 0.5, ez: 0.5, ox: 0, oz: 0 };
                            const wx = anker.x + sl.x;
                            const wz = anker.z + sl.z;
                            const saum = fp.saum || 0;
                            // die nassen Punkte des EINEN Fundament-Rasters: Spiegel des Gesetzes über dem gebauten Boden
                            const c0 = Math.cos(ry);
                            const s0 = Math.sin(ry);
                            const ras = AnazhRealm._fundamentRaster(
                                { ex: fp.ex + saum, ez: fp.ez + saum, ox: fp.ox, oz: fp.oz },
                                sl.tuer,
                                0.5
                            );
                            let nassN = 0;
                            let tief = 0;
                            for (const [lx, lz] of ras) {
                                const px = wx + lx * c0 + lz * s0;
                                const pz = wz - lx * s0 + lz * c0;
                                if (r._landAt(px, pz, 0.2)) continue;
                                nassN++;
                                const b = r._voxelSurfaceY(px, pz);
                                tief = Math.max(tief, r._atlasWaterLevelAt(px, pz, b) - b);
                            }
                            res.slotFehl.push({
                                y: Math.round(sl.y * 100) / 100,
                                nass: nassN + "/" + ras.length,
                                tief: Math.round(tief * 100) / 100,
                                x: Math.round(wx * 10) / 10,
                                z: Math.round(wz * 10) / 10,
                                wasser: !r._fundamentLand(wx, wz, ry, fp, sl.tuer, saum),
                                bau: !r._bauFrei(wx, wz, ry, fp, sl.tuer, sl.y),
                                nah: st.architectures
                                    .filter(
                                        (e) =>
                                            e.position &&
                                            !r._istNatur(e) &&
                                            Math.hypot(e.position.x - wx, e.position.z - wz) < 8
                                    )
                                    .map((e) => e.type),
                            });
                        }
                    const slots = [];
                    for (const e of haeuser) {
                        const sl = P.slots.find((s) => s.seed >>> 0 === e.seed);
                        if (!sl || !anker) continue;
                        const lx = e.position.x - anker.x;
                        const lz = e.position.z - anker.z;
                        const ob = sl.obb
                            ? Object.assign({}, sl.obb, { cx: sl.obb.cx + lx - sl.x, cz: sl.obb.cz + lz - sl.z })
                            : null;
                        slots.push({
                            x: lx,
                            z: lz,
                            phi: e.rotationY || 0,
                            y: e.position.y - 0.5,
                            rolle: sl.rolle,
                            kultur: sl.kultur,
                            ov: sl.ov || null,
                            seed: sl.seed,
                            tuer: sl.tuer,
                            // der Eingang der EINEN Regel (`eingangVon`): beim Hof-Haus das Tor im Torriegel, nie die Haustür
                            // über dem Hofpflaster
                            eingang: sl.tuer ? globalThis.__fachwerkCore.eingangVon(sl) : null,
                            obb: ob,
                            grund: sl.grund || null,
                        });
                    }
                    const ortW = { ort: anker, slots, roads: P.roads || [], platz: P.platz || null };
                    // das Urteil fällt nach diesem Gang (unten): Node legt je Slot die Hülle seines Baus dazu (`slotHuelle`)
                    res.ortW = anker ? ortW : null;
                    // die Kronen des Wald-Plans über den Grundrissen (Dach-Fläche + Krone T)
                    const F = AnazhRealm.FOREST;
                    const seedInt = r._forestSeedInt();
                    let [x0, x1, z0, z1] = [Infinity, -Infinity, Infinity, -Infinity];
                    const dachW = [];
                    for (const sl of slots) {
                        if (!sl.obb) continue;
                        const ob = Object.assign({}, sl.obb, { cx: sl.obb.cx + anker.x, cz: sl.obb.cz + anker.z });
                        dachW.push(ob);
                        const rr = Math.hypot(ob.ex, ob.ez);
                        x0 = Math.min(x0, ob.cx - rr);
                        x1 = Math.max(x1, ob.cx + rr);
                        z0 = Math.min(z0, ob.cz - rr);
                        z1 = Math.max(z1, ob.cz + rr);
                    }
                    let kronen = 0;
                    for (let gx = Math.floor((x0 - 20) / F.cell); gx <= Math.floor((x1 + 20) / F.cell); gx++)
                        for (let gz = Math.floor((z0 - 20) / F.cell); gz <= Math.floor((z1 + 20) / F.cell); gz++)
                            for (const d of r._forestGeborene(gx, gz, seedInt)) {
                                if (
                                    dachW.some(
                                        (ob) =>
                                            Math.max(0, kasten(ob.cx, ob.cz, ob.phi, ob.ex, ob.ez, d.x, d.z)) <
                                            (d.T || 0)
                                    )
                                )
                                    kronen++;
                            }
                    res.kronen = kronen;
                    // die Laternen der Zelle gegen die des Plans: je Laterne die Studio-Gestalt (fachwerk AUSSTATTUNG laterne) als
                    // Eintrag, dessen Licht ihr Rezept trägt (`_lichtDatumDerGestalt`) — ein Licht ohne Leib zählt nicht
                    res.laternenWelt = laternen.length;
                    res.laternenPlan = Array.isArray(P.laternen) ? P.laternen.length : 0;
                    // DIE LATERNE VOR DER WAND: je Laterne der
                    // Zelle der Abstand zur nächsten Hauswand des Plans (die Tür-Zeile W × D um den Slot); das Soll aus dem EINEN
                    // Licht-Gesetz (fachwerk LICHT_GESETZ.laterne, Abfall 1/(d² + k²)): die Wand trägt höchstens das Doppelte der Gasse
                    const LGl = globalThis.__fachwerkCore.LICHT_GESETZ.laterne;
                    res.laterneWandSoll =
                        Math.round(
                            1000 * Math.sqrt(Math.max(0, (LGl.hoeheM ** 2 + LGl.kernM ** 2) / 2 - LGl.kernM ** 2))
                        ) / 1000;
                    let lwMin = Infinity;
                    for (const e of P.ort ? masten : [])
                        for (const sl of P.slots) {
                            const tu = sl.tuer;
                            if (!tu || !Number.isFinite(tu.W) || !Number.isFinite(tu.D)) continue;
                            const [x, z] = [P.ort.x + sl.x, P.ort.z + sl.z];
                            lwMin = Math.min(
                                lwMin,
                                Math.max(0, kasten(x, z, sl.phi, tu.W / 2, tu.D / 2, e.position.x, e.position.z))
                            );
                        }
                    res.laterneWand = Number.isFinite(lwMin) ? Math.round(lwMin * 100) / 100 : null;
                    // DIE LATERNE NEBEN DER FAHRBAHN:
                    // je Laterne der Zelle der Abstand zum Rand jedes Wegs der EINEN Wege-Karte (die Segmente der Straßen und Feldwege,
                    // `_wegeFormAbstand`; der Tritt einer Ausstattung ist ein Segment ohne Länge und zählt nicht) — Soll: der Tritt des Rezepts
                    const AR = AnazhRealm;
                    const GZ = AR.GRUNDRISS_ZELLE;
                    res.laterneWegSoll = globalThis.__fachwerkCore.PRESETS.laterne.fx.tritt.r;
                    let lwegMin = Infinity;
                    for (const { position: q } of masten)
                        for (let a = -1; a <= 1; a++)
                            for (let b = -1; b <= 1; b++) {
                                const zk = AR._grundrissSchluessel(Math.floor(q.x / GZ) + a, Math.floor(q.z / GZ) + b);
                                for (const bb of r._grundrissStand().wege.get(zk) || [])
                                    for (const f of bb.formen)
                                        if (
                                            f.typ === "segment" &&
                                            f.kanal >= 0 &&
                                            Math.hypot(f.bx - f.ax, f.bz - f.az) > 0.01
                                        )
                                            lwegMin = Math.min(lwegMin, AR._wegeFormAbstand(f, q.x, q.z));
                            }
                    res.laterneWeg = Number.isFinite(lwegMin) ? Math.round(lwegMin * 100) / 100 : null;
                    // DIE STUFE VOR DER TÜR IST WEG: je Haus der Punkt 0,8 m
                    // vor der Mitte seiner Haustür liegt auf einer Fläche des Dorfs (`_aufWeg`: die Formen der EINEN Wege-Karte, die
                    // die Wiese über `_pfadFeldAt` und die Natur-Wand lesen) — Grundriss gegen Natur gilt auch für Treppe und Vorplatz
                    let vpOk = 0;
                    let vpN = 0;
                    const vpFehl = [];
                    // und vom Eingang
                    // (fachwerk `eingangVon`, beim Hof-Haus das Tor) bis zur Gasse liegt keine Lücke: auf der Achse der Tür je 0,25 m
                    // bis vorplatzM + gasseM — wer nach einem Punkt ohne Fläche wieder auf eine Fläche tritt, hat Wiese vor der Tür
                    const OG = window.__fachwerkCore.ORT_GESETZ;
                    // und die
                    // Wiese liest das GEMALTE Feld (`_pfadFeldAt` → `_wegeFeldAt`: die Bytes der Wege-Karte, weich um ±randM) — zwei Formen, die sich
                    // nur berühren, tragen an der Naht je 0,5: auf der Achse der Tür bis in die Gasse (die erste Weg-Form, die kein
                    // Kasten ist) hält das Feld ≥ 0,9 (die Wiese ≤ 17 % ihrer Dichte). Die Karte zieht dafür an den Ort und zurück.
                    const inGasse = (x, z) => {
                        const l = r
                            ._grundrissStand()
                            .wege.get(AR._grundrissSchluessel(Math.floor(x / GZ), Math.floor(z / GZ)));
                        if (l)
                            for (const b of l)
                                for (const f of b.formen)
                                    if (f.typ !== "kasten" && f.kanal >= 0 && AR._wegeFormAbstand(f, x, z) < 0)
                                        return true;
                        return false;
                    };
                    const pmW = st.playerMesh;
                    let feldMin = Infinity;
                    if (P.ort) r._tickWegeKarte({ x: P.ort.x, z: P.ort.z });
                    if (P.ort)
                        P.slots.forEach((sl, si) => {
                            const tu = sl.tuer;
                            if (!tu || !Number.isFinite(tu.x) || !Number.isFinite(tu.z)) return;
                            const c = Math.cos(sl.phi || 0);
                            const sn = Math.sin(sl.phi || 0);
                            const welt = (lz) => [
                                P.ort.x + sl.x + tu.x * c + lz * sn,
                                P.ort.z + sl.z - tu.x * sn + lz * c,
                            ];
                            vpN++;
                            const [wx, wz] = welt(tu.z - 0.8);
                            const ez = window.__fachwerkCore.eingangVon(sl).z;
                            let luecke = null;
                            let frei = null;
                            for (let t = 0.3; t <= OG.vorplatzM + OG.gasseM; t += 0.25) {
                                const [qx, qz] = welt(ez - t);
                                const auf = r._aufWeg(qx, qz, 0);
                                if (!auf && frei === null) frei = t;
                                if (auf && frei !== null) {
                                    luecke = [+frei.toFixed(2), +t.toFixed(2)];
                                    break;
                                }
                            }
                            let tief = OG.vorplatzM;
                            for (let t = 0.3; t <= OG.vorplatzM + OG.gasseM; t += 0.25)
                                if (inGasse(...welt(ez - t))) {
                                    tief = t;
                                    break;
                                }
                            // und in der
                            // ganzen Breite der Stufe (fachwerk `vorplatzFlaeche`: Türbreite samt Saum) — der Maler fällt an der
                            // Kante einer Form auf 0,5, die Wiese stand dort mit der Hälfte ihrer Dichte auf der Platte
                            const exS = window.__fachwerkCore.vorplatzFlaeche(sl).ex;
                            const quer = (lx, lz) => [
                                P.ort.x + sl.x + (tu.x + lx) * c + lz * sn,
                                P.ort.z + sl.z - (tu.x + lx) * sn + lz * c,
                            ];
                            let duenn = null;
                            for (let t = 0.3; t <= tief + 0.01; t += 0.1)
                                for (const lx of [0, -exS, exS]) {
                                    const [qx, qz] = quer(lx, ez - t);
                                    const v = r._wegeFeldAt(qx, qz);
                                    if (v < feldMin) feldMin = v;
                                    if (v < 0.9 && duenn === null)
                                        duenn = [+t.toFixed(2), +v.toFixed(2), +lx.toFixed(2)];
                                }
                            if (r._aufWeg(wx, wz, 0) && !luecke && !duenn) vpOk++;
                            else
                                vpFehl.push(
                                    luecke
                                        ? `${si}: Wiese ${luecke[0]}–${luecke[1]} m vor dem Eingang`
                                        : duenn
                                          ? `${si}: Feld ${duenn[1]} ${duenn[0]} m vor dem Eingang${duenn[2] ? `, ${duenn[2]} m quer (Flanke der Stufe)` : ""} (Gasse ab ${tief.toFixed(2)} m)`
                                          : `${si}: Stufe`
                                );
                        });
                    // DER BELAG DER GASSEN (w28-stadt-boden): je Gasse des Plans das Gesetz (fachwerk `gassenBelag`: Rang × Größe ×
                    // Jahr) neben den GEMALTEN Bytes ihrer Mitte (`_wegeBelagAt` — was Boden, Wiese und Schritt lesen); eine Mitte im
                    // Band einer anders belegten Gasse (die Kreuzung) zählt nicht. Das Urteil fällt in `belagUrteil`.
                    const FCb = window.__fachwerkCore;
                    res.belag = [];
                    if (P.ort)
                        (P.roads || []).forEach((rd, i) => {
                            const m = rang(rd.pts); // die Mitte der Gasse (DER EINE Rang, welt-boot)
                            const soll = FCb.gassenBelag(P, rd);
                            if (!m || !r._landAt(P.ort.x + m.x, P.ort.z + m.z, 0.2)) return;
                            const kreuzt = P.roads.some(
                                (o) =>
                                    o !== rd &&
                                    FCb.gassenBelag(P, o) !== soll &&
                                    FCb.belagAm({ roads: [o], groesse: P.groesse, jahr: P.jahr }, m.x, m.z, 1.2) !==
                                        null
                            );
                            if (kreuzt) return;
                            const aus = {};
                            r._wegeBelagAt(P.ort.x + m.x, P.ort.z + m.z, aus);
                            const z2 = (v) => Math.round((v || 0) * 100) / 100;
                            // und der GEHWEG (der gemalte Saum bis zur Bauflucht, fachwerk `gassenBreite`): 0,4 m vor ihr, quer zur Gasse
                            const k = rd.pts.indexOf(m);
                            const n2 = rd.pts[k + 1] || rd.pts[k - 1];
                            const [dx, dz] = [n2.x - m.x, n2.z - m.z];
                            const ab = (FCb.gassenBreite(P, rd) / 2 - 0.4) / (Math.hypot(dx, dz) || 1);
                            const geh = {};
                            r._wegeBelagAt(P.ort.x + m.x - dz * ab, P.ort.z + m.z + dx * ab, geh);
                            res.belag.push({
                                i,
                                gen: rd.gen,
                                quer: !!rd.quer,
                                soll,
                                pflaster: z2(aus.pflaster),
                                erde: z2(aus.erde),
                                gehweg: z2(geh.pflaster),
                            });
                        });
                    if (P.ort && pmW) r._tickWegeKarte(pmW.position);
                    res.vorplatzFeld = Number.isFinite(feldMin) ? Math.round(feldMin * 100) / 100 : null;
                    // DIE WAND DER TERRASSE, gezählt am Netz, das der Spieler sieht: der voxel-worker baut die Chunks um den Ort (± 60 m,
                    // Stufe 0, `_voxelWorkerComputeChunkMesh` — derselbe Bau wie das Streaming); Wand ist jeder Vertex unter dem
                    // Himmel, steiler als der Schutt-Kandidat (23°), den der Erdbau um > 0,25 m hebt oder senkt und der auf keiner
                    // Fläche des Erdbaus liegt (`erdbauFlaeche`); Wiese ist er, wo sein Fels-Stoff (die Steile über rockLo … rockHi
                    // plus der Schutt im Vertex, gelaende-core `felsStoff`) unter 0,5 bleibt
                    if (P.ort) {
                        const GC = globalThis.__gelaendeCore;
                        const GG = AnazhRealm.TERRAIN_GEOLOGY;
                        const Lg = r._gelaende();
                        const Lo = Object.assign({}, Lg, { erdbau: null });
                        const span = r._voxelChunkConfig(0).span;
                        let wand = 0;
                        let wiese = 0;
                        let halm = 0;
                        let ferne = 0;
                        const fernFehl = [];
                        const fehl = [];
                        for (let a = Math.floor((P.ort.x - 60) / span); a <= Math.floor((P.ort.x + 60) / span); a++)
                            for (
                                let b = Math.floor((P.ort.z - 60) / span);
                                b <= Math.floor((P.ort.z + 60) / span);
                                b++
                            ) {
                                const w = await r._voxelWorkerComputeChunkMesh(a, b, 0);
                                if (!w || w.empty) continue;
                                const pos = w.positions;
                                const nor = w.normals;
                                for (let i = 0; i < pos.length / 3; i++) {
                                    const x = pos[3 * i];
                                    const y = pos[3 * i + 1];
                                    const z = pos[3 * i + 2];
                                    if (Math.abs(x - P.ort.x) > 60 || Math.abs(z - P.ort.z) > 60) continue;
                                    if (w.himmel[i] < 1) continue;
                                    const st = 1 - nor[3 * i + 1];
                                    if (st < GG.schuttKandidat) continue;
                                    const f = GC.erdbauFlaeche(Lg.erdbau, x, z);
                                    if (f !== null && Math.abs(y - f) <= 0.25) continue;
                                    const hub = GC.hoehe(Lg, x, z, true) - GC.hoehe(Lo, x, z, true);
                                    if (Math.abs(hub) <= 0.25) continue;
                                    wand++;
                                    // K66, Prüfung 2: die Halme der Wand — die Nah-Wiese wächst nach dem Grün-Kanal der Boden-Karte
                                    // (`_bodenKarteAusMesh`: die Wiesen-Wache `gruenSchwelle` über der FERTIGEN Vertex-Farbe), die
                                    // Ferne nach `_fernSchuttAt` (Ring, Kronen-Karte, Feld-Pass): Wiese ab dem halben Grün, Ferne ohne Schutt
                                    // — wo das Netz den Stoff der Wand zeigt (Schutt ≥ 0,5) und der Erdbau die Höhe der Ferne bewegt (ohne Detail-Term, wie
                                    // der Ring); die Ferne ist ein Höhenfeld: unter der Kante einer Fläche zeigt sie die Fläche
                                    const C3 = w.colors;
                                    let tg = (C3[3 * i + 1] - 0.5 * (C3[3 * i] + C3[3 * i + 2])) / GG.gruenSchwelle;
                                    tg = tg < 0 ? 0 : tg > 1 ? 1 : tg;
                                    if (tg * tg * (3 - 2 * tg) >= 0.5) halm++;
                                    if (
                                        f === null &&
                                        w.schutt[i] >= 0.5 &&
                                        Math.abs(GC.hoehe(Lg, x, z, false) - GC.hoehe(Lo, x, z, false)) > 0.25 &&
                                        !((a) => (GC.hoehe(r._gelaende(), x, z, false, a), a.schutt > 0 || a.wand > 0))(
                                            { hang: 0, schutt: 0, wand: 0 }
                                        )
                                    ) {
                                        ferne++;
                                        if (fernFehl.length < 4)
                                            fernFehl.push([x, y, z, hub].map((v) => Math.round(v * 100) / 100));
                                    }
                                    let t = (st - GG.rockLo) / (GG.rockHi - GG.rockLo);
                                    t = t < 0 ? 0 : t > 1 ? 1 : t;
                                    if (t * t * (3 - 2 * t) + w.schutt[i] < 0.5) {
                                        wiese++;
                                        if (fehl.length < 6)
                                            fehl.push(
                                                [x, y, z, st, w.schutt[i], hub].map((v) => Math.round(v * 100) / 100)
                                            );
                                    }
                                }
                            }
                        res.terrasseWand = wand;
                        res.terrasseWiese = wiese;
                        res.terrasseHalm = halm;
                        res.terrasseFerne = ferne;
                        res.terrasseFerneFehl = fernFehl;
                        res.terrasseFehl = fehl;
                    }
                    res.vorplatzOk = vpOk;
                    res.vorplatzN = vpN;
                    res.vorplatzFehl = vpFehl;
                    // die Altwelten: Bauten, die kein Ort trägt (kein Haus mit Grundriss, keine Ausstattung des Dorfs: brunnen_dorf,
                    // marktstand_dorf, keine Brücke seiner Gassen: bruecke_jochfeld, kein Werk des Genesis-Orts: die ids seines Plans
                    // `genesis:<art>:<n>`, `_genesisWerkListeBauen` — Tore, Bänke, Laternen), auf dem Erdbau eines Orts — nie das gesetzte
                    // Haus auf seinem EIGENEN Grund (`haus:`, S4)
                    // Ein Wagen des Verkehrs (`_verkehrWagen`, siedlung-verkehr `_verkehrWagenStellen`) ist kein Bau: sein Ort ist seine
                    // Bahn, nicht der Grund, über den er gerade fährt — bis fahrzeug-gattung zählte die Schleife ihn, wo er im Augenblick
                    // der Zählung stand (zwei rote Läufe von drei, `fahrzeug_kompakt_fwd`, `fahrzeug_suv` am Zweit-Dorf −7,−7: ein
                    // Urteil nach der Uhr). Das Urteil liest den Zustand des Eintrags, nie den Takt.
                    // Dieselbe Röte traf haus-stoff2 am nordischen Dorf des Mess-Orts: seine Wagen parken an der Wende ihrer Gasse, die
                    // der Erdbau trägt (Kleinwagen und SUV zählten als „fremde Bauten im Erdbau 2“).
                    const fremdBau = (e) =>
                        !e.fundament &&
                        !e._verkehrWagen &&
                        !/^genesis:/.test(e.id) &&
                        !/_dorf$|^bruecke_/.test(e.type) &&
                        !st.worldMeta.erdbau[`haus:${Math.round(e.position.x * 100)},${Math.round(e.position.z * 100)}`] &&
                        !r._ortFrei(e.position.x, e.position.z, 0.01);
                    let fremd = 0;
                    for (const e of st.architectures)
                        if (fremdBau(e)) {
                            fremd++;
                            (res.fremdArten || (res.fremdArten = {}))[e.type] = (res.fremdArten[e.type] || 0) + 1;
                        }
                    res.fremdBauten = fremd;
                    // der Schein: am Grund eines Hauses des Orts (0,37 m neben seiner Mitte) zählt ein fremdes Werk (1), derselbe Eintrag
                    // als Wagen des Verkehrs nicht (0) — und die Zählung ohne den Zustand (`_verkehrWagen` übergangen) zählte ihn (1)
                    const hausO = st.architectures.find((e) => e.fundament && e.position);
                    if (hausO) {
                        const pos = { x: hausO.position.x + 0.37, y: hausO.position.y, z: hausO.position.z };
                        const werk = { type: "haus_schein", id: "schein:werk", position: pos };
                        const wagen = Object.assign({}, werk, { type: "fahrzeug_schein", _verkehrWagen: {} });
                        res.fremdSchein = {
                            werk: +fremdBau(werk),
                            wagen: +fremdBau(wagen),
                            ohneZustand: +fremdBau(Object.assign({}, wagen, { _verkehrWagen: undefined })),
                        };
                    }
                    // DAS DORF-LICHT DER GASSE (Leiter mensch.netz.verkehr): Mitternacht über den EINEN Uhr-Schreiber, die brennenden Quellen aus
                    // dem EINEN Licht-Gesetz der Welt (`_leuchtQuellen`: Datum × Zeitplan > 0) — gezählt wird jede mit Leib (Studio-
                    // Gestalt mit Licht-Datum oder Glut) im Ort; die Gasse und ihre Sicht rechnet `gassenLicht` (Node), den Licht-Pool
                    // der Gasse liest `gassenPool`. Der Schein: derselbe Ort mit dunklem Zeitplan.
                    if (anker) {
                        const uhr0 = st.timeOfDay;
                        if (!r._uhrSetzen(0, "regler")) throw new Error("die Uhr nimmt Mitternacht nicht");
                        const brennend = () =>
                            r
                                ._leuchtQuellen(anker.x, H(anker.x, anker.z), anker.z, 250, null)
                                .filter(
                                    (q) =>
                                        q.id?.position &&
                                        (r._lichtDatumDerGestalt(q.id) || r._glutFlaeche(q.id) > 0) &&
                                        Math.hypot(q.x - anker.x, q.z - anker.z) < 250
                                )
                                .map((q) => [q.x, q.z]);
                        const qs = brennend();
                        r._lichtZeitplan = () => 0;
                        let dunkel;
                        try {
                            dunkel = brennend();
                        } finally {
                            delete r._lichtZeitplan;
                        }
                        r._uhrSetzen(uhr0, "regler");
                        res.gasseIn = {
                            qs,
                            dunkel,
                            wege: (P.roads || []).map((w) => (w.pts || []).map((p) => [anker.x + p.x, anker.z + p.z])),
                            haeuser: dachW,
                            hfov: 2 * Math.atan(Math.tan((st.camera.fov * Math.PI) / 360) * (16 / 9)),
                        };
                    }
                    res.v2Json = v2 ? JSON.stringify(v2) : null;
                    // DER PLAN-HASH STUDIO = WELT (in derselben Seite, kein Plattform-Bit dazwischen): der Export des Fachwerk-Kerns
                    // (die Foundry rechnet ihn, das Labor baut dasselbe Layout — Teil A friert ihn ein) am Anker über die Lage des
                    // STUDIOS (gelaende-core `lageGrund` der Saat) und seinen ctx (`ortCtx`) — byte-gleich mit dem Plan v2 der Welt,
                    // oder der Wirt weicht vom Grund der Lage ab.
                    if (v2 && anker) {
                        const Gs = globalThis.__gelaendeCore;
                        const studio = globalThis.__fachwerkCore.ortPlan(
                            plan,
                            anker,
                            Gs.ortCtx(Gs.lageGrund(L.seed, window.SimplexNoise))
                        );
                        // der Hash beider Seiten beim Namen (FNV-1a über das JSON des Plans)
                        const fnv = (t) => {
                            let h = 0x811c9dc5;
                            for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193);
                            return (h >>> 0).toString(16).padStart(8, "0");
                        };
                        res.planHash = { studio: fnv(JSON.stringify(studio)), welt: fnv(res.v2Json) };
                        res.planHashGleich = JSON.stringify(studio) === res.v2Json;
                    }
                    res.planJson = JSON.stringify({ roads: P.roads || [] });
                } catch (e) {
                    res.err = fehlerStapel(e);
                }
                return res;
            },
            `${lokal}\n${kasten}\nreturn [${ortUrteil}, kasten]`,
            dpO,
            modus,
            messort
        );
        // DAS URTEIL DES ORTS mit dem Fuß des gebauten Körpers: je Slot die Hülle seines Stufe-0-Baus aus dem Kern (`slotHuelle`,
        // hier in Node — die Seite baut kein Haus im Haupt-Faden), dann das Urteil an der Höhe der Welt
        if (outO.ortW) {
            for (const sl of outO.ortW.slots) sl.huelle = slotHuelle(FC, sl);
            outO.huellen = outO.ortW.slots.filter((sl) => sl.huelle && sl.huelle.length).length;
            outO.urteil = await page.evaluate(
                (urteilSrc, ortW) => {
                    const u = new Function(urteilSrc)()[0](ortW, (x, z) => r.getTerrainHeightAt(x, z));
            // DER SPLAT AM TIEFSTEN PUNKT je Sockel-Haus (die Linse nennt ihn beim Namen): jeder Splat der Normalform der Welt
            // (`_erdbauNorm`), der den Punkt deckt, in seiner Reihenfolge — auf der Fläche gewinnt der letzte (gelaende-core
            // `erdbauY`), unter einem freien (der Brücke) gilt der Grund
            const E = r._erdbauNorm;
            // (und am Tritt vor jeder Tür ohne Gang: derselbe Splat-Befund an ihrer Stufe, `stufeBei.tief`)
            for (const h of [...((u && u.sockelFehl) || []), ...((u && u.tuerenFehl) || []).map((t) => t.stufeBei).filter(Boolean)]) {
                if (!h.tief || !E || !E.zellen) continue;
                const [wx, wz] = [ortW.ort.x + h.tief[0], ortW.ort.z + h.tief[1]];
                const Zm = globalThis.__gelaendeCore.ERDBAU ? globalThis.__gelaendeCore.ERDBAU.zelleM : null;
                const liste = Zm ? E.zellen.get((Math.floor(wx / Zm) + 32768) * 65536 + (Math.floor(wz / Zm) + 32768)) || [] : [];
                const decken = [];
                for (const k of liste) {
                    const q = E.splats[k];
                    let d;
                    if (q.frei || q.platte) {
                        const ux = Math.abs((wx - q.cx) * q.c - (wz - q.cz) * q.s) - q.ex, vz = Math.abs((wx - q.cx) * q.s + (wz - q.cz) * q.c) - q.ez;
                        d = Math.max(ux, vz, 0);
                    } else {
                        let s = q.len2 > 0 ? ((wx - q.x0) * q.dx + (wz - q.z0) * q.dz) / q.len2 : 0;
                        s = s < 0 ? 0 : s > 1 ? 1 : s;
                        d = Math.max(0, Math.hypot(wx - q.x0 - q.dx * s, wz - q.z0 - q.dz * s) - q.hw);
                    }
                    if (d === 0) decken.push(`${k}:${q.frei ? "frei" : q.platte ? "platte" : "trasse w" + q.weg} y${Math.round((q.platte ? q.y : q.y0) * 100) / 100}`);
                }
                h.splats = decken.length ? decken.slice(-5).join(" ") : Zm ? "keiner deckt" : "ERDBAU.zelleM fehlt";
                h.welt = Math.round(r.getTerrainHeightAt(wx, wz) * 100) / 100;
            }
                    return u;
                },
                `${lokal}\n${kasten}\nreturn [${ortUrteil}, kasten]`,
                outO.ortW
            );
            delete outO.ortW;
        }
        // DIE GASSE (rein, hier) und IHR LICHT-POOL (die Seite): Mitternacht, die Kamera der Gasse in Augenhöhe, ein frischer Pool
        // über den EINEN Schreiber (`_leuchtTakt`) — gezählt die Plätze, die eine sichtbare Quelle des Orts trägt, und die an
        // einer näheren brennenden Quelle des Orts, als jede sichtbare ist, die noch wartet (`poolNaeher`).
        if (outO.gasseIn) {
            const gi = outO.gasseIn;
            const g = gassenLicht(gi.qs, gi.wege, gi.haeuser, gi.hfov);
            outO.gasse = {
                n: g.n,
                pose: g.pose && g.pose.map((v) => Math.round(v * 10) / 10),
                je: g.je,
                verdeckt: g.verdeckt,
                brennend: gi.qs.length,
                schein: gassenLicht(gi.dunkel, gi.wege, gi.haeuser, gi.hfov).n,
            };
            if (g.pose)
                Object.assign(
                    outO.gasse,
                    await page.evaluate(
                        (pose, je, qs, zaehlSrc, ausser) => {
                            const cam = st.camera;
                            const H = (x, z) => r._terrainMacroSurfaceY(x, z, true);
                            const uhr0 = st.timeOfDay;
                            const cam0 = { p: cam.position.clone(), q: cam.quaternion.clone(), a: cam.aspect };
                            const [px, pz, lx, lz] = pose;
                            r._uhrSetzen(0, "regler");
                            cam.aspect = 16 / 9;
                            cam.updateProjectionMatrix();
                            cam.position.set(px, H(px, pz) + 1.7, pz);
                            cam.lookAt(lx, H(lx, lz) + 1.7, lz);
                            cam.updateMatrixWorld(true);
                            r._leuchtPool = null;
                            r._leuchtTakt();
                            const pl = r._leuchtPool?.plaetze || [];
                            // DER HORIZONT DES POOLS: die sichtbaren Quellen der Gasse, die das Gesetz des Pools überhaupt
                            // wählen darf (`_leuchtQuellen` im `umkreisM` um das Auge, ohne Sichtkegel) — eine Laterne 63 m vor
                            // dem Auge zeigt ihren glühenden Kopf, ihr Licht trägt der Pool nicht (Gebot 7: Kosten am Schirm)
                            const LP = AnazhRealm.LICHT_POOL;
                            const an = (p, l) => l.some(([x, z]) => Math.hypot(x - p.x, z - p.z) < 0.5);
                            // (das wache Glas nimmt nie einen Platz, `_leuchtWahl`: es zählt weder im Horizont noch im Rang)
                            const horizont = r
                                ._leuchtQuellen(cam.position.x, cam.position.y, cam.position.z, LP.umkreisM, null)
                                .filter((q) => !q.normale && an(q, je));
                            const imHorizont = horizont.length;
                            // DER PLATZ NACH DEM RANG DES POOLS (w28-stadt-grammatik, `poolZaehlen`): der Pool vergibt nach dem Rang aus
                            // `_leuchtQuellen` mit dem Sichtkegel (stamm/dirigent-kern.js: erst die Quelle, deren Lichtkugel den Kegel berührt, dann
                            // der Abstand) — die Linse liest DENSELBEN Rang, nie ein eigenes Maß. Ein Platz an einer brennenden Quelle des Orts ohne
                            // sichtbaren Kopf (die Wandlaterne um die Ecke) ist kein verlorener, wenn ihre Kugel den Kegel berührt und ihr Rang vor
                            // jeder sichtbaren liegt, die noch wartet. Bis hier zählten nur sichtbare Köpfe: mit vier im Horizont und einer
                            // Wandlaterne 20 m neben dem Auge (die fernste sichtbare 43 m) fiel der Akt „3 Quellen (Soll ≥ 4)“ — an main hielt
                            // dieselbe Art Wandlaterne einen Platz, nur stand das Soll dort bei 3.
                            const kegel = r
                                ._leuchtQuellen(
                                    cam.position.x,
                                    cam.position.y,
                                    cam.position.z,
                                    LP.umkreisM,
                                    r._leuchtKegel(cam)
                                )
                                .filter((q) => !q.normale)
                                .map((q) => ({ x: q.x, z: q.z, rang: q.rang }));
                            const gezaehlt = (0, eval)("(" + zaehlSrc + ")")(
                                pl.map((p) => ({ x: p.x, z: p.z, staerke: p.staerke })),
                                je,
                                qs,
                                kegel,
                                horizont.map((q) => ({ x: q.x, z: q.z })),
                                ausser
                            );
                            const out = {
                                plaetze: Math.min(LP.plaetze, imHorizont),
                                pool: pl.map((p) => [p.quelle, Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10]),
                                poolOrt: gezaehlt.poolOrt,
                                poolNaeher: gezaehlt.poolNaeher,
                            };
                            r._uhrSetzen(uhr0, "regler");
                            cam.position.copy(cam0.p);
                            cam.quaternion.copy(cam0.q);
                            cam.aspect = cam0.a;
                            cam.updateProjectionMatrix();
                            r._leuchtPool = null;
                            return out;
                        },
                        g.pose,
                        g.je,
                        gi.qs,
                        poolZaehlen.toString(),
                        POOL_AUSSER_RANG
                    )
                );
        }
        // DER GT AUF DEM DORFWEG des Orts, den die Welt trägt (Plan v2, sonst der Export)
        const gtO =
            outO.anker && (outO.v2Json || outO.planJson)
                ? await page.evaluate(gtDorfweg, JSON.parse(outO.v2Json || outO.planJson), outO.anker, 8)
                : { err: "kein Ort" };
        return { outO, gtO };
    };
    const MESSORT_DORF = jsonLesen("spec/profiband/haushalt.json").messorte.find((o) => o.id === "dorf").spieler;
    const O = await messeOrt("akt", null);
    const OA = await messeOrt("auto", MESSORT_DORF);
    // DIE SICHT DER POSE AM STAMM (w28-stadt-grammatik): `_ortPose` der Welt an einer Siedlung der Bühne — Platz 20 × 8 m, ein
    // Haus 20 m östlich auf der langen Achse, eines 30 m westlich, fern jedes Bestands (40 km) auf einer Fixture der Höhe. Eben
    // blickt die Pose auf das nahe Haus; ein Kamm 3 m hoch zwischen ihm und dem Stand und die lange Wand eines Nachbarn (10 m
    // östlich, 2 m neben der Achse) stellen ihn: sie blickt auf das ferne, und `poseSicht` nennt den Strahl frei. DIE MUTANTE: die
    // Marge des Geländes so tief, dass kein Kamm sie erreicht (`SICHT_GELAENDE_M`), und die Pose blickt in den Kamm — ROT beim Namen
    const poseO = await page.evaluate(async (src) => {
        const [poseSicht] = new Function(src)();
        const A = Object.getPrototypeOf(r).constructor;
        const [ox, oz, B] = [40000, 40000, 10]; // BÜHNE: eine Siedlung der Fixture fern jedes Bestands
        const haus = (cx, cz, ex, ez) => ({ obb: { cx, cz, phi: 0, ex, ez } });
        const fall = (slots, kamm, marge, bestand) => {
            const S = { key: "pose-fixture", ox, oz, plan: { platz: { cx: 0, cz: 0, phi: 0, ex: 10, ez: 4 }, slots } };
            const hoehe = (x) => B + (kamm && x - ox > 8 && x - ox < 12 ? 3 : 0);
            const map0 = r._bewohnerSiedlungen;
            r._bewohnerSiedlungen = new Map([[S.key, S]]);
            // DER BESTAND (`bestand`): ein gebauter Eintrag, der in keinem Plan steht, quer im Strahl zum nahen Haus — die Pose liest
            // den Plan und das Gesetz, vom gebauten Bestand nur die Natur; „lade“ ist die Mutante, die jeden gebauten Eintrag liest
            const fremd = { type: "haus_fixture", position: { x: ox + 10, y: B, z: oz } };
            const zurueck = leihe(r, {
                getTerrainHeightAt: hoehe,
                ...(bestand && { _blockerUmPlatz: (x, z, w, out) => (out.push(fremd), out) }),
                ...(bestand === "lade" && { _istNatur: () => true }),
            });
            const m0 = A.SICHT_GELAENDE_M;
            if (marge != null) A.SICHT_GELAENDE_M = marge;
            try {
                const P = r._ortPose([ox, oz]);
                const rechtecke = slots.map((q) => Object.assign({}, q.obb, { cx: ox + q.obb.cx, cz: oz + q.obb.cz }));
                return {
                    ziel: [+(P.ziel.x - ox).toFixed(2), +(P.ziel.z - oz).toFixed(2)],
                    taeter: poseSicht(P, hoehe(P.x, P.z) + A.EGO_AUGE_M, hoehe, rechtecke),
                };
            } catch (e) {
                return { fehler: String(e.message || e) };
            } finally {
                A.SICHT_GELAENDE_M = m0;
                zurueck();
                r._bewohnerSiedlungen = map0;
            }
        };
        const [nah, fern] = [haus(20, 0, 3, 3), haus(-30, 0, 3, 3)];
        return {
            eben: fall([nah, fern], false),
            kamm: fall([nah, fern], true),
            wand: fall([nah, fern, haus(10, 2, 1, 2.5)], false),
            mutante: fall([nah, fern], true, -1e9),
            bestand: fall([nah, fern], false, null, "gebaut"),
            lade: fall([nah, fern], false, null, "lade"),
        };
    }, `${lokal}\n${kasten}\nreturn [${poseSicht}]`);
    console.log("  POSE-SICHT " + JSON.stringify(poseO));
    const K5 = [];
    for (const alt of [null, "vorrat"]) K5.push(await page.evaluate(vorratAmDorf, MESSORT_DORF, alt));
    const [K5b, K5bS] = K5;
    // DER HANG-ORT (siedlung.K3 Staffel 2): in seinem Vorlauf-Ring liegen vier Zellen, deren Anker zwischen der alten Wand 0,35 und
    // der Böschung des Erdbaus liegt (−3,−14 0,38 · −1,−14 0,49 · −3,−12 0,51 · −1,−12 0,57; am Mess-Ort dorf −3,−3 0,51)
    const [H, HS] = [
        await page.evaluate(vorratAmDorf, [-400, -3175], null),
        await page.evaluate(vorratAmDorf, [-400, -3175], "wand"),
    ];
    const HD = H.trasse.filter((t) => t.hang > 0.35);
    // die Würfe des Felds am Auto-Dorf (`feldWurfImOrt`) und ihr Selbst-Schein
    const wirf = (d) => (OA.outO.anker ? page.evaluate(feldWurfImOrt, OA.outO.anker, d) : { err: "kein Ort" });
    const [FW, FWd, FWa] = [await wirf(false), await wirf("bau"), await wirf("art")];

    await browser.close();
    server.close();

    check(
        "B: _foundryRequestSettlement liefert den Export durch den EINEN Worker",
        out.planOk === true,
        `slots=${out.planSlots} name=${out.planName}`
    );
    check(
        // placed > 0, Buchhaltung exakt
        "B: der Konsument platziert",
        out.placed1 > 0 && out.entriesMatch === true,
        `placed=${out.placed1} skipped=${out.skipped1} Stücke am Haus ${out.wand1}/${out.wandPlan}`
    );
    check(
        // Tabellen-Regel, kein Literal
        "B: jeder Eintrag ist ein haus_<kultur>-Blueprint oder ein Stück seines Hauses (Wandlaterne, Schild)",
        out.allHaus === true
    );
    check(
        // derselbe Anker zweimal, beide Akte heben gleich viele, jedes Haus beider Akte: entry == anker + slot.x/z, phi, seed
        // (y == slot.y + 0,5 am zweiten) — der Slot-Anker trägt den Determinismus, kein eigener Offset-Vergleich
        "B: POSITIONS-DETERMINISTISCH — der Slot-Anker sitzt EXAKT auf dem Plan v2",
        out.planV2 === true && out.slotAnchorExact === true,
        `v2=${out.planV2} placed1=${out.placed1} placed2=${out.placed2}`
    );
    check("B: DORF-IN-TERRAIN — der Slot-Footprint reist als entry.fundament {ex,ez}", out.fundamentTravels === true);
    check(
        "B: DER AKT hebt über den Zug — nach abgelaufener Frist vor dem nächsten Bild genau EIN Haus (K5, die Takt-Garantie)",
        out.zugAkt === true
    );
    check(
        // rolle == Export
        "B: HAUS-DOPPELBAU — der Slot-ov reist als studioOv an JEDEM Eintrag",
        out.ovTravels === true
    );
    check(
        // der ov-Hash trennt Kirche von Wohnhaus
        "B: HAUS-DOPPELBAU — der Flatten-Chokepoint liest den Stempel",
        out.ovKeysSplit === true
    );
    const eh = out.erlebnis || {};
    const el = out.erlebnisLeer || {};
    check(
        // Hof-Bäume, Marktstände, Zäune im Satz der Einfriedung, Äcker in der Wege-Karte
        "B: der Erlebnis-Hebel hebt die Schichten des Plans — ohne sie keine",
        eh.baeume > 0 &&
            eh.staende > 0 &&
            eh.zaeune > 0 &&
            eh.aecker === true &&
            el.baeume === 0 &&
            el.staende === 0 &&
            el.zaeune === 0 &&
            el.aecker === false,
        `mit ${JSON.stringify(out.erlebnis)} · ohne ${JSON.stringify(out.erlebnisLeer)} · Plan ${JSON.stringify(out.planKern)}`
    );
    const sm = out.stadt || {};
    check(
        `B: DIE STADTMAUER (siedlung.K2) — ${sm.mauer}/${sm.soll} Streifen, wirft, die Natur weicht; Dorf ${eh.mauer}`,
        sm.mauer >= 0.8 * sm.soll && sm.wirft && sm.natur && !eh.mauer,
        sm
    );
    // DIE MAUER IM STOFF DER WELT und DER LESER GEGEN DEN PUFFER (mauer-im-stoff): beide Zeilen mit ihrer Mutante
    const ms = out.mauerStoff || {};
    const mm = out.mauerMutant || {};
    const gestalt = (x) =>
        ({
            steinring: x.arten.zinne >= ms.segs && x.formen.zelt === ms.towers,
            palisade: x.formen.pfahlreihe > 0 && x.formen.pfahlreihe === x.arten.wand,
            bastion: x.arten.wallkrone > 0,
        })[ms.form] === true;
    const imStoff = (x) =>
        !!x &&
        !!x.arten &&
        x.kisten.length === 0 &&
        x.teile > 0 &&
        x.hausTeile > 0 &&
        x.ohneVerband === 0 &&
        x.tonAb <= 0.004 &&
        gestalt(x);
    const leserTreu = (x) => !!x && x.teile > 0 && x.fremd === 0 && x.lageAb <= 0.001 && x.ecken === x.imPuffer;
    check(
        `B: DIE MAUER IM STOFF DER WELT (${ms.form}) — keine Kiste mit Instanz-Farbe zeichnet sie${ms.kisten && ms.kisten.length ? " (Täter: " + ms.kisten.join(", ") + ")" : ""}, ihr Satz zeichnet im Bau-Stoff der Häuser (${ms.hausTeile} von ${ms.hausVon} Teilen eines Hauses ziehen denselben Stoff in ihren Satz), ${ms.ecken} Ecken tragen Verband und Ton ihrer Rolle (ohne ${ms.ohneVerband}, Ton ab ${ms.tonAb}), die Gestalt steht (${JSON.stringify(ms.arten)}); die Mutanten ohne Verband und mit einem zweiten Stoff fallen`,
        imStoff(ms) && !imStoff(mm.flach) && !imStoff(mm.zwilling),
        { ist: ms, flach: mm.flach, zwilling: mm.zwilling && { hausTeile: mm.zwilling.hausTeile } }
    );
    check(
        `B: DER LESER DES GEBAUTEN (\`_mauerGebaut\`) nennt, was im Puffer steht — ${ms.teile} Teile, Lage ab ${ms.lageAb} m (≤ 0,001), ${ms.ecken} von ${ms.imPuffer} Ecken der Mauer gehören einem Teil; die Mutante mit einem Teil, das nicht gezeichnet wird, fällt (Lage ab ${mm.geist && mm.geist.lageAb} m)`,
        leserTreu(ms) && !leserTreu(mm.geist),
        { ist: ms, mutant: mm.geist }
    );
    check("B: fail-closed — unbekannte Kultur faellt (0 platziert, 1 uebersprungen)", out.failClosed === true);
    check(
        // `_bauSame` am Ruf, kein Math.random
        "B: Γ5 — der Siedlungs-Same zieht aus dem Bau-Strom",
        out.gammaStream === true
    );
    check("B: Γ5 — „baue dorf hier“ zieht denselben Bau-Strom (_bauSame)", out.gammaHier === true);
    check(
        // nach der Buch-Ankunft, nie der Kern-Default
        "B: der DSL-Akt spawn_village trägt die Größe des Siedlungs-Gesetzes",
        Number.isFinite(out.villageNH) && out.villageNH === out.villageNHSoll,
        `nH ${out.villageNH} (Soll ${out.villageNHSoll})`
    );
    const pruefeOrt = (titel, modusName, outO, gtO) => {
        console.log(`\n=== TEIL O: DER ORT AUF DEM GELÄNDE (K10, ${titel}) ===`);
        if (outO.err) console.log("  Fehler im Akt: " + outO.err.split("\n").slice(0, 3).join(" | "));
        if (outO.zelle)
            check(
                // wie im Spiel, _tickAutoSettlement
                `O ${modusName}: der Dorf-Zug baut das Dorf der Zelle am Mess-Ort`,
                !outO.err && outO.haeuser > 0,
                `Zelle ${outO.zelle}`
            );
        else
            check(
                `O ${modusName}: ein Hang trägt den Akt (Gefälle 0,12–0,25 über 16 m, trocken)`,
                !!outO.hang,
                outO.hang
                    ? `${outO.hang.x.toFixed(1)}/${outO.hang.z.toFixed(1)} Gefälle ${outO.hang.g.toFixed(3)}`
                    : "kein Hang"
            );
        const planHashGleich = outO.planHashGleich === true;
        const u = outO.urteil || {};
        // die Zahlen des Orts je Name aus der Welt (`outO`) und dem Urteil (`u`)
        const je = (q, namen) => namen.split(" ").map((k) => [k, q[k]]);
        const m = Object.fromEntries([
            ...je(outO, "haeuser slots wasserSlots kronen laternenWelt laternenPlan laterneWand laterneWandSoll"),
            ...je(outO, "laterneWeg laterneWegSoll vorplatzOk vorplatzN vorplatzFehl terrasseWand terrasseWiese"),
            ...je(outO, "terrasseHalm terrasseFerne terrasseFerneFehl vorplatzFeld fremdBauten"),
            ...je(outO, "huellen"),
            ...je(u, "sockelMedian sockelMax sockelFehl tuerenOk tuerenN"),
        ]);
        Object.assign(m, {
            planHashGleich,
            gtWeg: gtO.gtWeg,
            gtSteckt: gtO.steckt || null,
            gtEnde: gtO.endeNachS,
            quellenGasse: outO.gasse ? outO.gasse.n : null,
            poolGasse: outO.gasse ? outO.gasse.poolOrt : null,
            poolPlaetze: outO.gasse ? outO.gasse.plaetze : null,
        });
        check(
            `O ${modusName}: Selbst-Schein — ein fremdes Werk am Grund des Orts zählt, ein Wagen des Verkehrs dort nicht, die Zählung nach der Uhr fiele`,
            !!outO.fremdSchein && outO.fremdSchein.werk === 1 && outO.fremdSchein.wagen === 0 && outO.fremdSchein.ohneZustand === 1,
            JSON.stringify(outO.fremdSchein || null)
        );
        console.log("  DORF-LICHT DER GASSE " + JSON.stringify(outO.gasse || null));
        console.log("  GT AUF DEM DORFWEG " + JSON.stringify(gtO.err ? { err: gtO.err.split("\n")[0] } : gtO));
        console.log(
            "  ORT-ZAHLEN " +
                JSON.stringify(
                    Object.assign(
                        { planV2: outO.planV2, planHash: outO.planHash, zellen: u.zellen, fremdArten: outO.fremdArten || {}, zweit: outO.zweit },
                        m
                    )
                )
        );
        if (u.tuerenFehl?.length) console.log("  Türen ohne Gang: " + JSON.stringify(u.tuerenFehl));
        if (u.sockelTaeter?.length) console.log("  Sockel über dem Grund: " + JSON.stringify(u.sockelTaeter));
        if (outO.terrasseFehl?.length)
            console.log("  Wand im Wiesen-Stoff (x, y, z, Steile, Schutt, Hub): " + JSON.stringify(outO.terrasseFehl));
        if (outO.slotFehl?.length) console.log("  Slots ohne Haus: " + JSON.stringify(outO.slotFehl));
        if (outO.ortWahl?.length) console.log("  Ort-Wahl: " + outO.ortWahl.join(" | "));
        if (outO.ortMass) console.log("  ORT-WAHL-KOSTEN " + JSON.stringify(outO.ortMass));
        const belagO = outO.belag || [];
        const belagFehl = belagUrteil(belagO);
        check(
            `O ${modusName}: jede Gasse trägt in der Wege-Karte den Belag ihres Gesetzes (fachwerk BELAG_GESETZ)`,
            belagO.length > 0 && belagFehl.length === 0,
            `${belagO.filter((g) => g.soll === "pflaster").length} Pflaster · ${belagO.filter((g) => g.soll === "weg").length} Erde${belagFehl.length ? " — " + belagFehl.slice(0, 4).join(" | ") : ""}`
        );
        const fehlO = ortVerdikt(m);
        check(
            `O ${modusName}: das Dorf trägt jedes Haus (alle Slots stehen)`,
            outO.haeuser > 0 && outO.haeuser === outO.slots,
            `${outO.haeuser}/${outO.slots}`
        );
        if (outO.zelle)
            check(
                `O ${modusName}: Selbst-Test — ein zweites Dorf im Fenster, vor der Zelle angekommen, lässt das Urteil der Zelle gleich; die Ankunfts-Reihenfolge (erste neue Zelle, alle Häuser seit vorher) mischt es ein`,
                !!outO.ankunft &&
                    outO.ankunft.zweitVor &&
                    outO.ankunft.zelle !== outO.zelle &&
                    outO.ankunft.haeuser > outO.haeuser,
                `zweites Dorf ${outO.zweit}, vor der Zelle ${(outO.ankunft || {}).zweitVor} · Ankunft: Zelle ${(outO.ankunft || {}).zelle}, Häuser ${(outO.ankunft || {}).haeuser}/${outO.slots} · Zelle ${outO.zelle}: ${outO.haeuser}/${outO.slots}`
            );
        check(
            // Sockel 0, Türen, Kronen 0, Laternen, Plan-Hash, Altwelten 0, der GT ≥ 60 m in 8 s auf dem Dorfweg, ≥ 4 Quellen in der Gasse nachts
            `O ${modusName}: der Ort hält jede Zahl`,
            fehlO.length === 0,
            fehlO.join(" · ") || "gehalten"
        );
        check(
            // die Zahl liest das Licht-Gesetz der Welt
            `O ${modusName}: Selbst-Schein — der Zeitplan dunkel, die Gasse sieht keine Quelle`,
            !!outO.gasse && outO.gasse.schein === 0 && outO.gasse.n > 0,
            outO.gasse ? `hell ${outO.gasse.n} · dunkel ${outO.gasse.schein}` : "keine Gasse"
        );
    };
    pruefeOrt("Dorf 7/18 Gründerzeit am Hang", "Akt", O.outO, O.gtO);
    pruefeOrt(`das Auto-Dorf der Welt am Mess-Ort dorf, Zelle ${OA.outO.zelle || "?"}`, "Auto-Dorf", OA.outO, OA.gtO);
    const poseZeile = (f) =>
        f ? f.fehler || `Ziel ${f.ziel.join(" ")} · ${f.taeter.join(" · ") || "frei"}` : "ungemessen";
    const zielIst = (f, x) => !!f && !f.fehler && f.ziel[0] === x && f.ziel[1] === 0;
    check(
        "O Pose: eben blickt sie auf das nahe Haus, Kamm und lange Wand davor lenken sie auf das ferne — der Strahl frei",
        zielIst(poseO.eben, 17) &&
            zielIst(poseO.kamm, -27) &&
            zielIst(poseO.wand, -27) &&
            ["eben", "kamm", "wand"].every((k) => poseO[k].taeter.length === 0),
        ["eben", "kamm", "wand"].map((k) => `${k}: ${poseZeile(poseO[k])}`).join(" | ")
    );
    check(
        "O Pose: dieselbe Pose bei leerer und bei stehender Welt — ein gebauter Eintrag außer dem Plan quer im Strahl ändert sie nicht",
        zielIst(poseO.bestand, 17) && poseO.bestand.taeter.length === 0,
        `leer: ${poseZeile(poseO.eben)} | gebaut: ${poseZeile(poseO.bestand)}`
    );
    check(
        "O Pose: Mutante — die Pose aus dem Lade-Stand (jeder gebaute Eintrag ein Hindernis) wandert mit dem Bestand",
        zielIst(poseO.lade, -27),
        `Lade-Stand: ${poseZeile(poseO.lade)}`
    );
    check(
        "O Pose: Mutante — ohne die Marge des Geländes blickt sie in den Kamm, und die Sicht nennt ihn",
        zielIst(poseO.mutante, 17) && /^Gelände 1\.40 m/.test(poseO.mutante.taeter[0] || ""),
        poseZeile(poseO.mutante)
    );
    console.log("  FELD-WURF IM ORT " + JSON.stringify(FW));
    check(
        // keiner sperrt der Wahl Grund (_bauFrei), Grundriss und Weg räumen ihn (die Arten aus EINER Liste, FELD_WURF)
        "O Auto-Dorf: jeder Wurf des Felds weicht dem Ort wie die Natur",
        !FW.err && FW.quelle === true && FW.feldMarke === true && FW.weichen === FW.arten,
        FW.err
            ? FW.err.split("\n")[0]
            : `${FW.weichen}/${FW.arten} Arten weichen` +
                  (FW.quelle ? "" : " · die Liste ist nicht EINE Quelle") +
                  (FW.feldMarke ? "" : " · der Wurf des Felds trägt keine Marke (feldWurf, _enqueueVegetationSpawn)") +
                  (FW.sperrt.length ? " · sperrt: " + FW.sperrt.join(", ") : "") +
                  (FW.grundriss.length ? " · im Grundriss: " + FW.grundriss.join(", ") : "") +
                  (FW.weg.length ? " · auf dem Weg: " + FW.weg.join(", ") : "") +
                  (FW.fehl.length ? " · kein Wurf: " + FW.fehl.join(", ") : "")
    );
    check(
        // und bleibt im Grundriss: die Linse sieht den Täter
        "O Auto-Dorf: Selbst-Schein — der Akt des Felds als Bau sperrt den Grund",
        !FWd.err && FWd.sperrt.includes("glutbrunnen") && FWd.grundriss.includes("glutbrunnen"),
        FWd.err
            ? FWd.err.split("\n")[0]
            : `sperrt: ${FWd.sperrt.join(", ") || "—"} · im Grundriss: ${FWd.grundriss.join(", ") || "—"}`
    );
    check(
        // der Satz, der Bau-Modus: es sperrt den Grund, kein Grundriss und kein Weg räumt es (die Herkunft entscheidet, die Marke werk, nie die Art)
        "O Auto-Dorf: das Werk jeder Art weicht nie",
        !FW.err && FW.werk.arten.length === FW.arten && FW.werk.weicht.length === 0,
        FW.err
            ? FW.err.split("\n")[0]
            : `Werk-Arten ${FW.werk.arten.join(", ") || "—"}` +
                  (FW.werk.weicht.length ? " · weicht als Werk: " + FW.werk.weicht.join(", ") : " · keins weicht")
    );
    check(
        // die Linse sieht den Täter
        "O Auto-Dorf: Selbst-Schein — entscheidet die Art, weicht der Stein des Menschen",
        !FWa.err && FWa.werk.weicht.some((w) => w.startsWith("stein_block")),
        FWa.err ? FWa.err.split("\n")[0] : `weicht als Werk: ${FWa.werk.weicht.join(", ") || "—"}`
    );
    console.log("\n=== TEIL C: WORLDGEN-AUTO-DÖRFER (Nachlese-Welle) ===");
    const c = out.c || {};
    check(
        // ein anderer Seed, andere Dörfer; zurück, dieselben (Γ5) — selten und deterministisch misst Teil Z am Kern-Hash
        "C1: die Zell-Wahrheit des Wirts aus dem Welt-Seed",
        c.seedStrom === true,
        `seedStrom=${c.seedStrom}`
    );
    check("C1b: die Spawn-Klar-Wand steht (der Welt-Ursprung ist nie Dorf-Site)", c.spawnClearWall === true);
    check("C2: der Ort hält den Zug, nie das Bild", dorfZugAmOrt(c), [c.ohne, c.still]);
    check(
        // Export → Reservierung → Häuser
        "C3: die erzwungene Dorf-Zelle materialisiert",
        c.planOk === true && c.reserved === true && c.placed >= 1 && c.allHaus === true,
        `placed=${c.placed} ticks=${c.ticks}`
    );
    check(
        // echter Pfad des Takts (Jobs, dann der Bauer „dorf“ am Tor): Slots in Frames, nie 0, jeder Gang des Zugs ein Pflicht-Stück
        "C3b: Existenz vor Framerate — über der Frist wächst die Siedlung im Pflicht-Gang, nie neben dem Tor",
        c.budgetWall === true,
        `über der Frist: ${c.ueberBudget} Slots in ${c.ueberBudgetFrames} Frames (${c.dorfGaenge} Gänge des Zugs, ${c.dorfPflicht} als Pflicht-Stück; der Ring stand nach ${c.vorlaufFrames} Frames)`
    );
    check(
        // zwei Siedlungen mit demselben Samen bauen je ihre Wege
        "C6: der Wege-Schlüssel trägt den Ort",
        Array.isArray(c.wegeJeOrt) && c.wegeJeOrt.length === 2 && c.wegeJeOrt.every((n6) => n6 > 0),
        `Wege-Formen je Ort: ${(c.wegeJeOrt || []).join(" / ")}`
    );
    const bl = c.blick || {};
    const blZ = (q) =>
        q ? `${q.haeuser} Häuser, Gier ${q.gier} (gedreht ${q.gedreht}, neben dem Dorf ${q.nebenDorf})` : "–";
    check(
        // 0710-7; 4B: −2,745 mitten im Lauf
        "C7: ein Nexus-Dorf lässt den Blick stehen",
        !!bl.nexus && bl.nexus.haeuser > 0 && bl.nexus.gedreht < 1e-6,
        `Nexus: ${blZ(bl.nexus)}`
    );
    check(
        // Chat-Programm und Befehl „dorf“: der Blick auf SEIN neues Dorf
        "C7: das verlangte Dorf richtet den Blick auf sich",
        !!bl.spieler &&
            !!bl.chat &&
            bl.spieler.haeuser > 0 &&
            bl.chat.haeuser > 0 &&
            bl.spieler.nebenDorf < 0.05 &&
            bl.chat.nebenDorf < 0.05,
        `Chat-Programm: ${blZ(bl.spieler)} · dorf: ${blZ(bl.chat)}`
    );
    const werkzeug = ["faehigkeit", "wirken", "verzehr"];
    check(
        // Fähigkeit ability:, Wirken capability:, Verzehr consume: (0710-8)
        "C7: das Dorf eines Werkzeugs schaut auf sich",
        werkzeug.every((k) => bl[k] && bl[k].haeuser > 0 && bl[k].nebenDorf < 0.05),
        werkzeug.map((k) => `${k}: ${blZ(bl[k])}`).join(" · ")
    );
    check(
        // remote-…: er handelt für die Welt
        "C7: das Dorf eines Mitspielers lässt den Blick stehen",
        !!bl.mitspieler && bl.mitspieler.haeuser > 0 && bl.mitspieler.gedreht < 1e-6,
        `Mitspieler: ${blZ(bl.mitspieler)}`
    );
    const ring = c.ring || {};
    check(
        // alle builtIn-Welt-Portale, Stempel gesetzt
        "C5: DER GENESIS-ORT setzt jedes Tor seines Plans",
        ring.stempel === true && ring.arten === 10 && ring.stehen === 10,
        `arten=${ring.arten} stehen=${ring.stehen} gebaut=${ring.gebaut}`
    );
    check(
        // der Stempel trägt, 0 Doppel
        "C5: jedes Tor auf seinem Slot (R 22), idempotent",
        ring.radiusOk === true && ring.idempotent === true,
        `radiusOk=${ring.radiusOk} idem=${ring.idempotent}`
    );
    check(
        // worldMeta.settlementCells trägt über den Reload
        "C4: IDEMPOTENT — dieselbe Zelle nochmal: 0 neue Häuser",
        c.idempotent === true
    );
    {
        const n = c.nachbarn;
        const fehlt = nachbarLuecke(n);
        const reg = n ? n.register.filter((e) => n.gesetz.includes(e.k)) : [];
        check(
            "C3n: der Ort kennt seine Nachbarn — jeder Nachbar des Gesetzes steht mit Name und Region im Register",
            !!n && !n.offen && n.gesetz.length > 0 && fehlt.length === 0,
            n ? `Ort ${n.key}: ${n.gesetz.length} Nachbarn${n.offen ? " (offen: ihr Wasser kam nicht)" : ""}, gemeldet ${reg.map((e) => e.k + " " + e.name + "/" + e.region).join(", ") || "keiner"}${fehlt.length ? " — es fehlen " + fehlt.join(", ") : ""}` : "kein Zensus" // prettier-ignore
        );
    }
    const k5 = c.k5 || {};
    // das erste Haus steht im zweiten Takt nach dem Erwachen: der erste legt den Grund (der Gang zuerst), der nächste hebt
    const soll = 2;
    const je = (n, f) => n.every((k) => k5[k] && f(k5[k]));
    // DAS ERSTE HAUS IM BILD (sk5-haus): nH 12 und 300 heben das nächste Haus nach dem Vorlauf, seine Stufen bestellt vor ihm, und
    // es steht in der Stufe seines Abstands ≤ `soll` Takte nach dem Erwachen, auch hinter vollem Fit-Takt — nie als Hülle, solange
    // ein Haus der Mesh-Zone vorn im Schirm liegt (das ferne vor dem nahen, beim Namen)
    const fernVorNah = (w = {}) =>
        w.erstes &&
        w.erstes.stufe === "huelle" &&
        w.nahImSchirm &&
        `${w.erstes.typ} als Hülle in ${w.erstes.d} m vor dem nahen`;
    check(
        `C-K5: DAS ERSTE HAUS IM BILD — nH 12 und 300 ≤ ${soll} Takte nach dem Erwachen, das nahe zuerst, vorgebacken`,
        je(["vorlauf12", "vorlauf300"], (w) => w.vorrat && w.erstes && w.bild <= soll && !fernVorNah(w)),
        k5
    );
    check(
        "C-K5 Selbsttest: ein fernes Haus vor dem nahen ist ROT beim Namen",
        !!fernVorNah(k5.fern300),
        fernVorNah(k5.fern300) || k5
    );
    check(
        // der Export nach dem Erwachen (Teleport) und die Schichten vor dem ersten Haus (alt)
        "C-K5 Selbsttest: Teleport und alt fallen ROT",
        je(["teleport300", "alt300"], (w) => w.haus > soll) && !k5.strecke13.vorrat,
        k5
    );
    check(
        // Teleport, Start-Dorf; die Pläne im Haupt-Thread und im Ort-Faden
        "C-K5 OHNE VORLAUF: Pläne bis zum ersten Haus nH 300 / nH 12 ≤ 1,2",
        je(["teleport12", "teleport300"], () => k5.teleport300.plaene / k5.teleport12.plaene <= 1.2),
        k5
    );
    check(
        // 40 m voraus, 11 m bei 70°, 15 m daneben
        "C-K5: DER RANG — Mitte vor Streifen vor außer Schirm",
        String(k5.schirm) === "1,2,0",
        k5
    );
    const [ort, ortS, wach, voll] = [k5.ort || {}, k5.ortStoer || {}, k5.wach || {}, k5.wachVoll || {}];
    check(
        // zwei Vorläufe nH 300, der Spieler 3,7 m versetzt
        "C-K5c: DER ORT IST EINE FUNKTION — der Plan v2 bit-gleich",
        !!ort.hash && ort.hash[0] === ort.hash[1] && !ort.erste,
        ort.erste ? `die erste Abweichung: ${ort.erste}` : JSON.stringify(ort.hash)
    );
    check("C-K5c Selbsttest: der Wunsch, der mit dem Spieler rückt, ist ROT", !!ortS.erste, ortS);
    console.log("  C-K5d DAS ERWACHEN " + JSON.stringify(wach));
    check(
        // vom Erwachen bis zum letzten Haus, je Takt ein Schritt des Dorfs
        "C-K5d: DAS ERWACHEN IN RATEN — je Takt höchstens EIN Schritt",
        wach.takte > 1 && !!wach.mehr && !wach.mehr.length,
        (wach.mehr || []).join(" | ") ||
            `${wach.takte} Takte, das erste Haus im Takt ${wach.haus}, der längste ${wach.max}`
    );
    check(
        "C-K5d Selbsttest: der Voll-Bau im Takt des Erwachens ist ROT",
        !!voll.mehr && voll.mehr.length > 0,
        (voll.mehr || []).join(" | ")
    );
    const mehrfach = (e) =>
        Object.entries(e.exporte)
            .filter(([, x]) => x > 1)
            .map(([k, x]) => `Zelle ${k}: ${x} Exporte`);
    const ruht = (e) => !e.nachZug && !e.offen;
    check(
        // am Mess-Ort dorf bereiten sich zwei Zellen vor
        "C-K5b: EIN VORRAT JE ZELLE — höchstens EIN Export",
        Object.keys(K5b.exporte).length >= 2 && !mehrfach(K5b).length,
        K5b
    );
    // 150 Gänge ohne Export, kein Foundry-Auftrag offen
    check("C-K5b: NACH DEM ZUG STEHT DIE WELT", ruht(K5b), K5b);
    check(
        // das alte Überspringen
        "C-K5b Selbsttest: EIN Vorrat zur Zeit ist ROT",
        mehrfach(K5bS).length > 0 && !ruht(K5bS),
        mehrfach(K5bS).join(" · ") + " " + JSON.stringify(K5bS)
    );
    // C-K3: die Vorräte am Mess-Ort, das Auto-Dorf und der Akt am Hang — jeder Plan steht am Ort seines Rasters und hält das Gefälle
    require(path.join(root, "gelaende-core.js"));
    const GN = globalThis.__gelaendeCore;
    const Lw = GN.lageGrund(K5b.welt, require(path.join(root, "vendor/simplex-noise.js")));
    // der Selbsttest der Trasse (`fremd`): dieselben Gassen am Grund 24 m daneben — eine Trasse, die einem anderen Boden folgt
    const trassen = [...K5b.trasse, OA.outO.trasse, O.outO.trasse];
    for (const t of [...trassen, ...H.trasse, ...HS.trasse].filter((q) => q?.v2)) {
        const grund = (dx) => (x, z) => GN.hoehe(Lw, x + dx, z, true);
        [t.p95, t.fremd, t.erdbauM3, t.v2] = [
            gassenGefaelle(t.v2, grund(0)),
            gassenGefaelle(t.v2, grund(24)),
            erdbauMedian(t.v2, grund(0)),
        ];
    }
    const gefSoll = FC.ORT_GESETZ.gefaelle * 100;
    const traegt = (t) => t && t.versatzM === 0 && t.aussen === 0 && t.p95 <= gefSoll;
    check(
        `C-K3: DIE TRASSE AM ORT — ${trassen.length} Dörfer stehen am Ort ihres Höhen-Rasters, Gassen-Gefälle p95 ≤ ${gefSoll} % am Grund ohne Erdbau`,
        trassen.length >= 4 && trassen.every(traegt),
        trassen
    );
    check(
        // Staffel 2: der Ort steht am Hang über der alten Wand, die Trasse hält die Gassen, der Erdbau je Haus ist die Kosten
        `C-K3: DIE HANGDÖRFER — ${HD.length} Dörfer über der alten Wand 0,35, Gassen p95 ≤ ${gefSoll} %, Erdbau-Median, ${1 + H.leser.length} Grundriss-Leser`,
        HD.length >= 4 && HD.every(traegt) && !H.leser.length,
        HD
    );
    check(
        "C-K3 Selbsttest: die Gassen am Grund 24 m daneben sind ROT",
        HD.some((t) => t.fremd > gefSoll),
        HD
    );
    const hangS = HS.trasse.filter((t) => t.hang > 0.35); // dieselbe Lesart wie HD
    check(
        "C-K3 Selbsttest: die Wand 0,35 zurück trägt am Hang-Ort keine vier Hangdörfer (ROT)",
        hangS.length < 4,
        hangS
    );
    wandEnde(errs, "DER SETTLEMENT-KANAL N5.7 STEHT.");
});
