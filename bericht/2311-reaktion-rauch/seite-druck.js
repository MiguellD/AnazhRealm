const st = r.state, C = AnazhRealm;
// same.physik.reaktion#2 — „Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen": die Probe der Station an der Mess-Wiese, gemessen IN DER
// WELT. DREI LADUNGEN verschiedener Energie: dasselbe Werk der Welt (`donnerfass`, stamm/bau-vorlagen.js) in drei Maßen — die Ladung
// trägt Volumen × Maß³ × ρ × q aus der Zeile ihres Stoffs (stamm/feld-brand.js `_ladungJ`); W liest die Probe an der Welle, die die
// Welt schrieb. JE LADUNG eine Leiter von Probe-Scheiben (das Fenster von gate:stand-takt (D): Quarz 0,5 × 0,5 m × 4 mm auf einem
// Holz-Bock, der Welle zugewandt) — GROB über 3 … 70 m im Verhältnis Q, dann dieselbe Ladung noch einmal mit NF Scheiben FEIN zwischen
// der fernsten gebrochenen und der nächsten stehenden (grob allein stünde der Radius auf ±5 %, das Urteil der drei auf ±4 Punkte).
// Der Funke fällt am Fass (`_brandEntfachen`: der Weg des Brennglases), die Ladung setzt um, die Welle trifft jede Scheibe zu IHRER
// Ankunft (`_tickDruck` an der Uhr der Welt). DER SCHADENSRADIUS einer Ladung: der Abstand, bis zu dem Scheiben brachen — das
// geometrische Mittel der fernsten gebrochenen und der nächsten stehenden (Abstand im Raum von der Welle zur Mitte der Scheibe);
// liegen die beiden weiter als einen groben Schritt auseinander, trägt die Ladung keinen Radius. GEGEN W^(1/3): R ÷ ∛W je Ladung, die
// größte Abweichung vom Mittel der drei; dazu der Exponent der Welt (Steigung ln R über ln W). Kein Radius kommt aus dem Buch des
// Gesetzes. Die Probe räumt hinter sich auf (Bauten, Scherben, Bauplan, das Feuer des Funkens, Tat und Tagebuch), der Spieler steht wieder.
const r3 = (v) => Math.round(v * 1e3) / 1e3;
const t0 = performance.now();
const [O, MASSE, D0, Q, N, NF] = [{ x: -248, z: -1064 }, [0.4, 0.63, 1], 3, 1.1, 34, 12];
const [plaeneVor, bautenVor] = [new Set(Object.keys(st.blueprints)), new Set(st.architectures)];
const taten = st.worldMeta.taten || (st.worldMeta.taten = []);
const tagebuch = st.worldJournal && Array.isArray(st.worldJournal.entries) ? st.worldJournal.entries : null;
const [tatenVor, tagebuchVor] = [taten.length, tagebuch ? tagebuch.length : 0];
const pm = st.playerMesh.position;
const heim = [pm.x, pm.y, pm.z];
const NAME = "_k2_scheibe";
const setz = (typ, x, z, mehr) => r.spawnArchitecture(typ, { x, y: r._voxelSurfaceY(x, z) + 0.5, z }, { precise: true, silent: true, ...mehr });
const raeumen = () => {
    for (const e of st.architectures.filter((e) => !bautenVor.has(e))) r.removeArchitecture(e, { still: true });
    if (r._brandRest) r._brandArbeit(Infinity);
    if (st.brandFeld) st.brandFeld.clear();
    r._brandRest = null;
    if (taten.length > tatenVor) (taten.length = tatenVor), (r._tatGen = (r._tatGen | 0) + 1);
    if (tagebuch && st.worldJournal.entries === tagebuch && tagebuch.length > tagebuchVor) tagebuch.length = tagebuchVor;
};
// EINE LADUNG vor ihren Scheiben (Abstände in der Ebene, je Scheibe ein eigener Strahl-Winkel `winkel(k)`): zünden, die Welle zu Ende
// schreiten, je Scheibe ihr Abstand im Raum und ob sie brach → { energieJ, S } oder { fehler }
const feuer = (i, mass, stufe, abstaende, winkel) => {
    try {
        const fass = setz("donnerfass", O.x, O.z, { seed: 7990 + i, ruht: true, scale: mass });
        if (!fass) return { fehler: "das Donnerfass im Maß " + mass + " steht nicht (stamm/siedlung-satz.js `spawnArchitecture`)" };
        const scheiben = [];
        for (const [k, d] of abstaende.entries()) {
            const [x, z] = [O.x + d * Math.cos(winkel(k)), O.z + d * Math.sin(winkel(k))];
            const e = setz(NAME, x, z, { seed: 7100 + 1000 * stufe + 100 * i + k, rotationY: Math.atan2(O.x - x, O.z - z) });
            if (!e) return { fehler: "die Probe-Scheibe in " + r3(d) + " m steht nicht (stamm/siedlung-satz.js `spawnArchitecture`)" };
            scheiben.push({ e, d });
        }
        const wellenVor = new Set(r._druckWellen || []);
        r._brandEntfachen(O.x, O.z);
        const wand = performance.now();
        for (let n = 0; r._druckFristen && r._druckFristen.length && n < 4000 && performance.now() - wand < 6000; n++) {
            r._weltUhrNimm(st.spielZeit + 0.02);
            r._tickDruck();
        }
        const w = (r._druckWellen || []).find((x) => !wellenVor.has(x));
        if (!w) return { fehler: "keine Welle: die Ladung im Maß " + mass + " setzte nicht um (stamm/feld-brand.js `_ladungUmsatz`)" };
        if (r._druckFristen && r._druckFristen.length) return { fehler: "die Welle der Ladung im Maß " + mass + " kam in 6 s nicht zu Ende (" + r._druckFristen.length + " Fristen offen)" };
        return { energieJ: w.energieJ, S: scheiben.map(({ e, d }) => ({ d, R: Math.hypot(e.position.x - w.x, e.position.y - 0.5 + 0.37 - w.y, e.position.z - w.z), gebrochen: !st.architectures.includes(e) })) };
    } finally {
        raeumen();
    }
};
const rand = (S) => {
    const [innen, aussen] = [S.filter((s) => s.gebrochen).sort((a, b) => b.R - a.R)[0], S.filter((s) => !s.gebrochen).sort((a, b) => a.R - b.R)[0]];
    return [innen || null, aussen || null];
};
const ladungen = [];
r._feldFolgeSteht = () => true; // die Probe schreitet ihre eigene Uhr: der Funke fällt jetzt (wie `masseProbe`)
try {
    st.blueprints[NAME] = C._etikett({
        name: NAME,
        builtIn: false,
        vomGesetz: true,
        parts: [
            { shape: "box", material: "holz", size: { x: 0.7, y: 0.12, z: 0.35 }, position: { x: 0, y: 0.06, z: 0 } },
            { shape: "box", material: "quarz", size: { x: 0.5, y: 0.5, z: 0.004 }, position: { x: 0, y: 0.37, z: 0 } },
        ],
    });
    for (const [i, mass] of MASSE.entries()) {
        const grob = feuer(i, mass, 0, Array.from({ length: N }, (_, k) => D0 * Q ** k), (k) => 0.35 + (k % 4) * (Math.PI / 2));
        if (grob.fehler) {
            ladungen.push({ mass, fehler: grob.fehler });
            continue;
        }
        let S = grob.S;
        let [innen, aussen] = rand(S);
        if (innen && aussen && innen.d < aussen.d) {
            const fein = feuer(i, mass, 1, Array.from({ length: NF }, (_, k) => innen.d * (aussen.d / innen.d) ** ((k + 1) / (NF + 1))), (k) => 0.35 + (k * 2 * Math.PI) / NF);
            if (fein.fehler || Math.abs(fein.energieJ - grob.energieJ) > 1e-9 * grob.energieJ) {
                ladungen.push({ mass, fehler: fein.fehler || "dieselbe Ladung trug zwei Energien (" + r3(grob.energieJ / 1e6) + " · " + r3(fein.energieJ / 1e6) + " MJ)" });
                continue;
            }
            S = S.concat(fein.S);
            [innen, aussen] = rand(S);
        }
        // der Rand ist scharf, wenn die fernste gebrochene und die nächste stehende höchstens einen groben Schritt auseinander liegen
        const scharf = innen && aussen && Math.abs(Math.log(aussen.R / innen.R)) <= Math.log(Q);
        const radius = scharf ? Math.sqrt(innen.R * aussen.R) : null;
        ladungen.push({
            mass,
            energieMJ: r3(grob.energieJ / 1e6),
            scheiben: S.length,
            gebrochen: S.filter((s) => s.gebrochen).length,
            innenM: innen ? r3(innen.R) : null,
            aussenM: aussen ? r3(aussen.R) : null,
            radiusM: radius === null ? null : r3(radius),
            jeW3: radius === null ? null : radius / Math.cbrt(grob.energieJ),
        });
    }
} finally {
    delete r._feldFolgeSteht;
    raeumen();
    for (const k of Object.keys(st.blueprints)) if (!plaeneVor.has(k)) delete st.blueprints[k];
    pm.set(heim[0], heim[1], heim[2]);
    if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
}
// drei Ladungen VERSCHIEDENER Energie mit einem scharfen Rand: nur sie richten
const gut = ladungen.filter((l) => l.radiusM > 0).filter((l, i, a) => a.findIndex((m) => m.energieMJ === l.energieMJ) === i);
const k = gut.map((l) => l.jeW3);
const mittel = k.reduce((s, v) => s + v, 0) / (k.length || 1);
// der Exponent der Welt: die Steigung von ln R über ln W (kleinste Quadrate über die Ladungen)
const [lx, ly] = [gut.map((l) => Math.log(l.energieMJ)), gut.map((l) => Math.log(l.radiusM))];
const [mx, my] = [lx.reduce((s, v) => s + v, 0) / (lx.length || 1), ly.reduce((s, v) => s + v, 0) / (ly.length || 1)];
const sxx = lx.reduce((s, v) => s + (v - mx) * (v - mx), 0);
return {
    ladungen: ladungen.map((l) => ({ ...l, jeW3: typeof l.jeW3 === "number" ? Math.round(l.jeW3 * 1e5) / 1e5 : null })),
    gemessen: gut.length,
    radius_abw_pct: gut.length >= MASSE.length ? r3(Math.max(...k.map((v) => (100 * Math.abs(v - mittel)) / mittel))) : null,
    hoch: sxx > 0 ? r3(lx.reduce((s, v, i) => s + (v - mx) * (ly[i] - my), 0) / sxx) : null,
    gebrochen: ladungen.reduce((s, l) => s + (l.gebrochen | 0), 0),
    bautenRest: st.architectures.filter((e) => !bautenVor.has(e)).length,
    ms: Math.round(performance.now() - t0),
};
