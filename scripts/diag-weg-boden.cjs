// diag-weg-boden.cjs — DIE WEG-KANTEN-PROBE: der Siedlungs-Weg ist Boden, kein schwebendes Quad — `_stlWegeBuild` malt die
// Boden-Schichten in die Wege-Karte, die der Boden-Shader und die Wiese lesen. Die Linse baut eine Probe-Siedlung durch DENSELBEN Hebel und prüft:
//   1 KEIN QUAD   keine Boden-Streifen mehr als Geometrie (der Zaun-Pool trägt nur hüfthohe Zäune)
//   2 BODEN       die Karte trägt den Weg: Mitte voll, 2 m außerhalb leer; Platz und Acker in ihren Kanälen
//   3 KANTE       der Rand ist weich (an der Weg-Kante liegt ein Zwischenwert, kein Sprung 0 → 1)
//   4 KONSUM      der frische Chunk-Stoff mischt die Wege-Farbe aus der Karte (am Ruf), die Wiese dünnt auf dem Weg
//   5 ECKE        ein um 45° gedrehter Acker trägt seine Ecke (die Ausdehnung ist die Diagonale, kein Achteck)
//   6 FERNE       ein Weg 300 m vom Spieler steht in der Karte (die ferne Stufe der Clipmap, kein Loch hinter 120 m)
//   7 BESTAND     die Kronen-Karte derselben Fenster: eine Eintrags-Krone übersteht 1,6 km Ausflug (Register, Streu,
//                 verschoben = voll neu gemalt)
//   8 TRITT       die Trittfläche einer Feuerstelle (`fx.tritt` des Gesetzbuchs) als EINZIGE Form der Karte: gesetzt
//                 tragen GPU-Bytes und CPU-Leser Erde und die Wiesen-/Streu-Kachel darüber fällt; abgebaut über den
//                 echten Abbau (`removeArchitecture`) sind die Bytes sofort leer und gehen hoch, der CPU-Leser liest 0,
//                 die Kacheln fallen (der nächste Takt lässt Wiese und Nah-Streu zurückwachsen)
//   9 VOLL        ein Plan über der alten Kappe (1 000 Gassen-Stücke, danach ein Platz) malt jede Form, der Platz steht
//  10 KÖRPER      die Fahrstraße der Stadt (fachwerk WEG_GESETZ, Art `strasse`) trägt ihren Querschnitt in der Karte: die
//                 Fahrbahn als zweite Höhe des Pflasters (Mitte 1, am Bord ½, linear über ±fahrRandM), der Gehweg volles
//                 Pflaster ohne Fahrbahn, hinter der Bauflucht nichts — und auf dem Pflaster steht bis an seine Kante kein Halm
//  11 ACKER       der Acker ist ein Grundriss der Natur-Wand: in ihm stehen 0 Büschel der Nah-Wiese und 0 Pflanzen der
//                 Nah-Streu (`_ackerGrund`), ohne den Plan trägt dieselbe Fläche Wiese
// --selftest: ein injizierter Boden-Streifen im Pool, eine harte Kante, der vergessliche ferne Umzug, der alte
// Abbau der Trittfläche, die stille Kappe von 900 Formen, die Fahrstraße ohne Bord und der Acker ohne Grundriss müssen
// beim Namen rot werden.
//   node scripts/diag-weg-boden.cjs [--selftest]

const { statikServer, hauptLauf, SELBSTTEST, nullWelt } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.WEG_PORT || 4596);
const server = statikServer();

function probe(stoerung) {
    const T = window.THREE;
    const A = AnazhRealm;
    // Ein trockener Probe-Ort nahe dem Spieler (die Wasser-Wand würde Formen verwerfen), auf dem der Kern der Straße
    // (x −24 … −2, |dz| < 1,2) ohne Weg Wiese trägt: die Büschel der Nah-Wiese im Streifen (−1 = eine Kachel ohne Boden).
    const pm = st.playerMesh.position;
    const KW = A.NAH_WIESE.kachel;
    const wiese = (p) => {
        let n = 0;
        for (let tx = Math.floor((p.x - 24) / KW); tx <= Math.floor((p.x - 2) / KW); tx++) {
            const k = r._nahWieseKachelBueschel(tx, Math.floor(p.z / KW));
            if (!k) return -1;
            n += k.filter((b) => Math.abs(b.z - p.z) < 1.2 && b.x >= p.x - 24 && b.x <= p.x - 2).length;
        }
        return n;
    };
    r._stlWegeDispose();
    let o = null;
    for (let k = 0; k < 64 && !o; k++) {
        const x = pm.x + (k % 8) * 40 - 140;
        const z = pm.z + Math.floor(k / 8) * 40 - 140;
        let trocken = true;
        for (let i = -2; i <= 2 && trocken; i++)
            for (let j = -2; j <= 2 && trocken; j++) trocken = r._landAt(x + i * 15, z + j * 15, 0.2);
        if (trocken && wiese({ x, z }) >= 10) o = { x, z };
    }
    if (!o) return { fehler: "kein trockener Probe-Ort" };
    // Ein trockener Ort ~300 m vom Probe-Ort (die ferne Stufe): acht Richtungen, die erste trockene trägt den Fern-Weg.
    let fern = null;
    for (let k = 0; k < 8 && !fern; k++) {
        const a = (k / 8) * Math.PI * 2;
        const fx = Math.round(Math.cos(a) * 300);
        const fz = Math.round(Math.sin(a) * 300);
        if (r._landAt(o.x + fx, o.z + fz, 0.2) && r._landAt(o.x + fx + 30, o.z + fz, 0.2))
            fern = { x: fx, z: fz };
    }
    const wieseOhne = wiese(o);
    // 11 ACKER: die Büschel der Nah-Wiese und die Pflanzen der Nah-Streu im ersten Acker des Plans (Mitte −18, −18, 6 × 4 m, innen
    // 0,5 m vor seiner Kante) — dieselben Bauten der Kacheln, die das Spiel zeichnet
    const imAcker = () => {
        let [w, s] = [0, 0];
        const [x0, x1, z0, z1] = [o.x - 23.5, o.x - 12.5, o.z - 21.5, o.z - 14.5];
        const arten = r._nahStreuArten() || [];
        for (let tx = Math.floor(x0 / KW); tx <= Math.floor(x1 / KW); tx++)
            for (let tz = Math.floor(z0 / KW); tz <= Math.floor(z1 / KW); tz++)
                for (const b of r._nahWieseKachelBueschel(tx, tz) || []) if (b.x > x0 && b.x < x1 && b.z > z0 && b.z < z1) w++;
        const KS = A.NAH_STREU.kachel;
        for (let tx = Math.floor(x0 / KS); tx <= Math.floor(x1 / KS); tx++)
            for (let tz = Math.floor(z0 / KS); tz <= Math.floor(z1 / KS); tz++) {
                const k = r._nahStreuKachel(tx, tz, arten);
                for (const it of (k && k.items) || []) {
                    const art = arten[it.art];
                    if (art && art.kind !== "rock" && art.kind !== "deadwood" && it.x > x0 && it.x < x1 && it.z > z0 && it.z < z1) s++;
                }
            }
        return { wiese: w, streu: s };
    };
    const ackerOhne = imAcker();
    const randAlt = A.WEGE_KARTE;
    if (stoerung === "hart") A.WEGE_KARTE = Object.freeze(Object.assign({}, randAlt, { randM: 0.001 }));
    const plan = {
        roads: [{ pts: [{ x: -25, z: 0 }, { x: 0, z: 0 }, { x: 25, z: 2 }], w: 4 }],
        feldwege: [{ pts: [{ x: 0, z: 0 }, { x: 0, z: -25 }], w: 2 }],
        platz: { cx: 10, cz: 14, ex: 6, ez: 4, phi: 0.3, typ: "erde" },
        felder: [
            { cx: -18, cz: -18, ex: 6, ez: 4, phi: 0 },
            { cx: 22, cz: -22, ex: 5, ez: 5, phi: Math.PI / 4 },
        ],
        fences: [{ x0: -6, z0: 6, x1: 6, z1: 6 }],
    };
    if (fern) plan.roads.push({ pts: [{ x: fern.x, z: fern.z }, { x: fern.x + 30, z: fern.z }], w: 4 });
    r._stlWegeBuild(plan, o, "probe:weg");
    if (stoerung === "streifen") {
        // die Störung: ein flacher Boden-Streifen (4 × 0,14 × 3 m) als Stück im Satz der Einfriedung
        const E = globalThis.__fachwerkCore.mauerEinheit("kasten");
        const n = E.pos.length / 3;
        const mass = [4, 0.14, 3];
        const netz = {
            stoff: "holz",
            rau: 0.9,
            pos: Float32Array.from(E.pos, (v, i) => v * mass[i % 3]),
            nrm: new Float32Array(E.nrm),
            farbe: new Float32Array(n * 3).fill(0.3),
            nr: new Float32Array(n),
            lage: new Float32Array(n * 2),
            idx: new Uint32Array(E.idx),
            teile: [{ art: "streifen", form: "kasten", arg: null, stoff: "holz", m: [4, 0, 0, 0, 0, 0.14, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1], v0: 0, n }],
        };
        r._einfriedungLege("zaun:probe:flach", plan, [netz], o.x, 0, o.z, 0);
    }
    r._tickWegeKarte({ x: o.x, z: o.z });
    const out = { ort: o };
    // 1 KEIN QUAD: jedes Stück Zaun im Satz der Einfriedung steht (ein Teil ≥ 0,5 m hoch: der Pfosten), keines ist ein flacher
    // Boden-Streifen — gelesen an den Teilen, mit denen das Stück in den Puffer ging (`_einfriedungLege`)
    let flach = 0;
    let zaun = 0;
    for (const [k, e] of st.einfriedung || [])
        if (k.startsWith("zaun:")) {
            if (Math.max(...e.teile.map((x) => Math.hypot(x.m[4], x.m[5], x.m[6]))) < 0.5) flach++;
            else zaun++;
        }
    out.flacheStreifen = flach;
    out.zaeune = zaun;
    // 2 BODEN + 3 KANTE: die Karte über der Straße (halbe Breite 2 m)
    out.mitte = +r._wegeFeldAt(o.x - 12, o.z).toFixed(3);
    out.aussen = +r._wegeFeldAt(o.x - 12, o.z + 4.5).toFixed(3);
    let kante = 0;
    for (let dz = 1.6; dz <= 2.6; dz += 0.1) {
        const v = r._wegeFeldAt(o.x - 12, o.z + dz);
        if (v > 0.15 && v < 0.85) kante++;
    }
    out.kantenProben = kante;
    const nah = st.wegeKarte.stufen[0];
    const kanal = (x, z, c) => {
        const S = nah.S;
        const i = Math.floor((x - (nah.mitteX - S.fensterM / 2)) / S.texelM);
        const j = Math.floor((z - (nah.mitteZ - S.fensterM / 2)) / S.texelM);
        return (nah.daten[(j * nah.N + i) * 2 + c] - A.WEGE_KARTE.null) / A.WEGE_KARTE.voll;
    };
    out.platz = +kanal(o.x + 10, o.z + 14, 0).toFixed(3);
    out.acker = +kanal(o.x - 18, o.z - 18, 1).toFixed(3);
    out.feldweg = +kanal(o.x, o.z - 15, 0).toFixed(3);
    // 5 ECKE: die Ecke des 45°-Quadrats (Halbachse 5 m) liegt 7,07 m entlang +x; 6,6 m liegen innen, im weichen Rand
    // der Ecke (der Texel nächst der Probe liest 0,56). Die alte Ausdehnung max(ex, ez) + Rand endete bei 5,6 m (+ ein
    // Texel Schlupf): dort las dieselbe Probe 0 — die Ecke fehlte.
    out.ecke = +kanal(o.x + 22 + 6.6, o.z - 22, 1).toFixed(3);
    // 6 FERNE: der Fern-Weg (300 m) liest die Karte (die nahe Stufe endet bei 208 m, die ferne trägt)
    out.fernWeg = fern ? +r._wegeFeldAt(o.x + fern.x + 15, o.z + fern.z).toFixed(3) : -1;
    // 4 KONSUM: das Chunk-Material liest die Karte, die Wiese das Pfad-Feld
    // am Ruf: der frische Chunk-Stoff mischt die Wege-Farbe (nur mit wegeKarte), sie liest die EINE Karte
    const ruft = (f, k) => {
        const alt = r[k];
        let n = 0;
        const zurueck = leihe(r, { [k]: function (...a) { n++; return alt.apply(this, a); } });
        try { f(); } catch { /* ein Wurf nach dem Ruf entwertet den Konsum nicht */ } finally { zurueck(); }
        return n > 0;
    };
    const stoffAlt = st.voxelChunkMaterial;
    st.voxelChunkMaterial = null;
    const pbr = (wegeKarte) => () => r._buildPbrNodeMaterial({ vertexColors: true, wegeKarte, felsImVertex: true, himmelsSicht: true, geomorph: true });
    out.shaderLiest = ruft(() => r._getVoxelChunkMaterial(), "_wegeBodenFarbe") && !ruft(pbr(false), "_wegeBodenFarbe") && ruft(() => r._wegeBodenFarbe({}, null), "_wegeKarteEnsure");
    st.voxelChunkMaterial = stoffAlt;
    // die Wiese dünnt über das Pfad-Feld: auf dem Kern der Straße wächst höchstens 30 % der Büschel von vorher
    out.wiese = { ohne: wieseOhne, mit: wiese(o) };
    out.wieseLiest = out.wiese.mit >= 0 && out.wiese.mit <= 0.3 * wieseOhne && r._pfadFeldAt(o.x - 12, o.z, null) > 0.9;
    // 11 ACKER: der Acker ist ein Grundriss der Natur-Wand — die Störung `ohnegrundriss` nimmt ihm den Grund (`_ackerGrund`)
    const ackerGrund = stoerung === "ohnegrundriss" ? leihe(r, { _ackerGrund: () => false }) : null;
    try {
        out.acker11 = { ohne: ackerOhne, mit: imAcker() };
    } finally {
        if (ackerGrund) ackerGrund();
    }
    // 7 BESTAND: eine Eintrags-Krone (a:, trägt sich nur beim Entstehen ein) übersteht einen Ausflug über das ferne
    // Fenster — 1,6 km hin und zurück: sie steht im Register, die Laubstreu liegt unter ihr, und jede verschobene
    // Stufe gleicht dem vollen Neumalen aus dem Register (der Raum-Index verliert keine Krone am Streifen-Rand).
    const wk = st.wegeKarte;
    const kx = o.x + 30;
    const kz = o.z + 30;
    r._kronenStreuNeu("a:probe-bestand", kx, kz, 5);
    if (stoerung === "vergessen") {
        // die Lücke bis 06.10.: der Umzug der fernen Stufe vergaß jede Krone jenseits seines Fensters
        const fernStufe = wk.stufen[wk.stufen.length - 1];
        const umzug = r._kronenStreuUmzug;
        r._kronenStreuUmzug = function (stufe, war) {
            const hk = stufe.S.fensterM / 2;
            if (stufe === fernStufe)
                for (const [k, c] of [...wk.kronen])
                    if (Math.abs(c[0] - stufe.mitteX) - c[2] > hk || Math.abs(c[1] - stufe.mitteZ) - c[2] > hk) {
                        wk.kronen.delete(k);
                        wk.kronenZellen.get(A._kronenZelle(c[0], c[1])).delete(k);
                    }
            return umzug.call(this, stufe, war);
        };
    }
    try {
        r._tickWegeKarte({ x: o.x + 1600, z: o.z });
        r._tickWegeKarte({ x: o.x, z: o.z });
    } finally {
        delete r._kronenStreuUmzug; // die Störung lebte als eigene Eigenschaft, der Prototyp trägt wieder
    }
    out.bestandRegister = wk.kronen.has("a:probe-bestand");
    out.bestandStreu = +r._kronenStreuAt(kx, kz).toFixed(3);
    let ungleich = 0;
    for (const stufe of wk.stufen) {
        const verschoben = stufe.kronen.summe.slice();
        r._kronenStreuUmzug(stufe, null);
        const voll = stufe.kronen.summe;
        for (let i = 0; i < voll.length; i++) if (voll[i] !== verschoben[i]) ungleich++;
    }
    out.bestandUngleich = ungleich;
    r._kronenStreuWeg("a:probe-bestand");
    // 9 VOLL (w28-stadt-grund): ein Plan über der alten Kappe — 1 000 Gassen-Stücke, danach ein Platz — malt JEDE Form. Bis hier hielt
    // `_stlWegeBuild` still bei 900 (stadt-voll: der Platz, 300 Vorplätze und 47 Äcker fielen ungenannt, Wiese in Gasse und Vorplatz).
    // Die Störung `kappe` ist die alte Kappe: der Plan endet nach 900 Formen.
    const [vor, k] = [wk.siedlungen.length, stoerung === "kappe"];
    const pts = Array.from({ length: k ? 901 : 1001 }, (_, i) => ({ x: i / 50 - 10, z: -8 }));
    r._stlWegeBuild({ roads: [{ pts, w: 2 }], platz: k ? null : { cx: 8, cz: -12, ex: 2, ez: 1.5 } }, o, "probe:voll", true);
    out.voll = [wk.siedlungen.length > vor ? wk.siedlungen.at(-1).formen.length : 0, +kanal(o.x + 8, o.z - 12, 0).toFixed(3)];
    // 10 KÖRPER (w28-weg-koerper): die Fahrstraße einer Metropole von 1800 (gen 0, 5 m ≥ VERKEHR_GESETZ.breiteM: Pflaster, Art
    // `strasse`) 40 m neben der Probe. Gelesen über den EINEN CPU-Leser (`_wegeBelagAt`: dieselben Bytes wie der Boden-Stoff).
    // Die Störung `ohnebord`: das Gesetz nimmt der Art ihren Bord — die Karte trägt eine Ebene.
    const FC = globalThis.__fachwerkCore;
    const artAlt = FC.WEG_GESETZ.art.strasse;
    if (stoerung === "ohnebord") FC.WEG_GESETZ.art.strasse = Object.assign({}, artAlt, { bord: false });
    const stadt = { staedtisch: true, groesse: "metropole", jahr: 1800, roads: [{ pts: [{ x: -20, z: 40 }, { x: 20, z: 40 }], w: 5, gen: 0 }] };
    const Q = FC.wegQuerschnitt(stadt, stadt.roads[0]);
    try {
        r._stlWegeBuild(stadt, o, "probe:koerper", true);
    } finally {
        FC.WEG_GESETZ.art.strasse = artAlt;
    }
    const lies = (dz) => {
        const aus = {};
        const feld = r._wegeBelagAt(o.x, o.z + 40 + dz, aus);
        return [+aus.pflaster.toFixed(3), +aus.fahr.toFixed(3), +feld.toFixed(3)];
    };
    const [halb, R] = [Q.fahrM / 2, A.WEGE_KARTE.fahrRandM];
    out.koerper = {
        art: Q.art, gehM: Q.gehM, bordM: Q.bordM,
        mitte: lies(0), bord: lies(halb), innen: lies(halb - R / 2), aussen: lies(halb + R / 2),
        gehweg: lies(halb + Q.gehM - 0.7), hinter: lies(halb + Q.gehM + 1.5),
    };
    A.WEGE_KARTE = randAlt;
    r._stlWegeDispose();
    return out;
}

// 8 TRITT — eine Feuerstelle (Bauplan `glutbrunnen`, Gestalt fachwerk `feuerstelle`) nahe dem Spieler; die Karte trägt
// sonst nichts (kein Weg, keine Krone: der Fall, in dem der Takt früh zurückkehrt).
function trittProbe(stoerung) {
    const A = AnazhRealm;
    const pm = st.playerMesh.position;
    let o = null;
    for (let k = 0; k < 64 && !o; k++) {
        const x = pm.x + (k % 8) * 6 - 21;
        const z = pm.z + Math.floor(k / 8) * 6 - 21;
        if (r._landAt(x, z, 0.2) && r._landAt(x + 3, z + 3, 0.2) && r._landAt(x - 3, z - 3, 0.2))
            o = { x, z };
    }
    if (!o) return { fehler: "kein trockener Tritt-Ort" };
    r._stlWegeDispose();
    const wk = r._wegeKarteEnsure();
    const nah = wk.stufen[0];
    // die GPU-Bytes der Nah-Stufe (Kanal Erde) — dieselben, die der Boden-Shader liest, unabhängig vom CPU-Leser
    const byte = (x, z) => {
        const S = nah.S;
        const i = Math.floor((x - (nah.mitteX - S.fensterM / 2)) / S.texelM);
        const j = Math.floor((z - (nah.mitteZ - S.fensterM / 2)) / S.texelM);
        return i < 0 || j < 0 || i >= nah.N || j >= nah.N ? -1 : (nah.daten[(j * nah.N + i) * 2] - A.WEGE_KARTE.null) / A.WEGE_KARTE.voll; // prettier-ignore
    };
    // Je Ring EINE Kachel über der Feuerstelle: steht dort keine (der Null-Renderer baut die Wiese nicht), sät die
    // Probe einen leeren Platzhalter — die Probe zählt, ob der Abbau sie fallen lässt: ihr Satz gilt als alt, sie steht, bis
    // ihr Takt den Neubau an ihre Stelle setzt (w28-pop-treue, `_nahWieseKachelFaellt` · `_nahStreuKachelFaellt`; bis dahin
    // verschwand sie sofort aus der Karte). Eine Kachel, deren Satz beim Säen schon alt war, zählt nicht.
    const vorWiese = st.nahWiese;
    const vorStreu = st.nahStreu;
    const eigenWiese = !vorWiese;
    const eigenStreu = !vorStreu;
    if (eigenWiese) st.nahWiese = { kacheln: new Map(), senken: new Map(), vorlagen: new Map(), neu: true, offen: 0 };
    if (eigenStreu) st.nahStreu = { senken: new Map(), kacheln: new Map() };
    const KW = A.NAH_WIESE.kachel;
    const KS = A.NAH_STREU.kachel;
    const kw = `${Math.floor(o.x / KW)},${Math.floor(o.z / KW)}`;
    const ks = `${Math.floor(o.x / KS)},${Math.floor(o.z / KS)}`;
    const gesaet = new Set();
    const warAlt = new Set();
    const saeen = () => {
        warAlt.clear();
        for (const [ring, key, k] of [
            [st.nahWiese, kw, { meshes: null, quellen: null }],
            [st.nahStreu, ks, { key: ks, senken: new Set(), zustand: null }],
        ]) {
            const da = ring.kacheln.get(key);
            if (!da) {
                ring.kacheln.set(key, k);
                gesaet.add(k);
            } else if (gesaet.has(da)) da.satzAlt = false; // der eigene Platzhalter gilt wieder
            else if (da.satzAlt) warAlt.add(da);
        }
    };
    const gefallen = () =>
        [st.nahWiese.kacheln.get(kw), st.nahStreu.kacheln.get(ks)].filter((k) => !k || (k.satzAlt && !warAlt.has(k))).length;
    const out = { ort: o };
    saeen(); // vor dem Bau: auf gebautem Boden setzt der Studio-Platz die Fläche schon im Spawn
    const entry = r.spawnArchitecture(
        "glutbrunnen",
        { x: o.x, y: r.getTerrainHeightAt(o.x, o.z), z: o.z },
        { silent: true, seed: 7 }
    );
    if (!entry) return { fehler: "die Feuerstelle steht nicht (spawnArchitecture)" };
    r._trittFlaecheSetzen(entry); // der Studio-Platz ruft sie beim ersten Primär-Add (`_archInstanceAdd`)
    out.gesetztForm = !!entry._trittBox;
    out.gesetztCpu = +r._wegeFeldAt(o.x, o.z).toFixed(3);
    out.gesetztGpu = +byte(o.x, o.z).toFixed(3);
    out.gesetztGefallen = gefallen();
    saeen();
    const version = nah.tex.version;
    if (stoerung === "tritt") {
        // der Abbau bis 06.10.: die Form fällt, die Stufen warten auf den Takt, keine Wiese wächst nach
        r._trittFlaecheLoesen = function (e) {
            const k = this.state.wegeKarte;
            if (!e || !e._trittBox || !k) return;
            const i = k.siedlungen.indexOf(e._trittBox);
            if (i >= 0) k.siedlungen.splice(i, 1);
            e._trittBox = null;
            for (const s of k.stufen) s.zentriert = false;
        };
    }
    try {
        r.removeArchitecture(entry);
        r._tickWegeKarte({ x: pm.x, z: pm.z }); // der nächste Spiel-Takt
    } finally {
        delete r._trittFlaecheLoesen; // die Störung lebte als eigene Eigenschaft, der Prototyp trägt wieder
    }
    out.geloestCpu = +r._wegeFeldAt(o.x, o.z).toFixed(3);
    out.geloestGpu = +byte(o.x, o.z).toFixed(3);
    out.geloestUpload = nah.tex.version > version;
    out.geloestGefallen = gefallen();
    out.formenRest = wk.siedlungen.length;
    // nur die eigenen Platzhalter räumen (eine echte Kachel bleibt dem Takt)
    if (gesaet.has(st.nahWiese.kacheln.get(kw))) st.nahWiese.kacheln.delete(kw);
    if (gesaet.has(st.nahStreu.kacheln.get(ks))) st.nahStreu.kacheln.delete(ks);
    if (eigenWiese) st.nahWiese = vorWiese;
    if (eigenStreu) st.nahStreu = vorStreu;
    r._stlWegeDispose();
    return out;
}

function urteil(S) {
    if (S.fehler) return ["Probe: " + S.fehler];
    const rot = [];
    if (S.flacheStreifen !== 0) rot.push(`1 KEIN QUAD: ${S.flacheStreifen} flache Boden-Streifen als Geometrie im Pool`);
    if (S.zaeune < 1) rot.push("1 KEIN QUAD: der Zaun fehlt im Zaun-Pool");
    if (!(S.mitte > 0.95 && S.aussen < 0.02))
        rot.push(`2 BODEN: Straßen-Mitte ${S.mitte} (soll > 0,95), 2,5 m außerhalb ${S.aussen} (soll < 0,02)`);
    if (!(S.platz > 0.9 && S.acker > 0.9 && S.feldweg > 0.9))
        rot.push(`2 BODEN: Platz ${S.platz} · Acker ${S.acker} · Feldweg ${S.feldweg} (soll > 0,9)`);
    if (!(S.kantenProben >= 4)) rot.push(`3 KANTE: hart — nur ${S.kantenProben} Zwischenwerte über 1 m Rand (soll ≥ 4)`);
    if (!S.shaderLiest) rot.push("4 KONSUM: der Boden-Shader liest die Wege-Karte nicht");
    if (!(S.ecke > 0.3)) rot.push(`5 ECKE: die Ecke des 45°-Ackers trägt ${S.ecke} (soll > 0,3 — die Ausdehnung ist die Diagonale)`);
    if (!(S.fernWeg > 0.5)) rot.push(`6 FERNE: der Weg in 300 m liest ${S.fernWeg} (soll > 0,5 — die ferne Stufe trägt)`);
    if (!S.wieseLiest) rot.push(`4 WIESE: auf der Straße wachsen ${JSON.stringify(S.wiese)} Büschel (soll mit ≤ 30 % von ohne, keine Kachel ohne Boden)`);
    if (!(S.bestandRegister && S.bestandStreu > 0.5 && S.bestandUngleich === 0))
        rot.push(
            `7 BESTAND: nach 1,6 km Ausflug steht die Eintrags-Krone ${S.bestandRegister ? "im" : "NICHT im"} Register, ` +
                `Streu unter ihr ${S.bestandStreu} (soll > 0,5), ${S.bestandUngleich} Texel ungleich dem vollen Neumalen (soll 0)`
        );
    const AC = S.acker11;
    if (!AC || !(AC.ohne.wiese > 0) || AC.mit.wiese !== 0 || AC.mit.streu !== 0)
        rot.push(`11 ACKER: im Acker stehen ${AC ? JSON.stringify(AC.mit) : "—"} Büschel und Pflanzen (soll 0; ohne Acker ${AC ? JSON.stringify(AC.ohne) : "—"}, Wiese soll > 0) — der Acker räumt die Wiese nicht (_ackerGrund)`);
    if (!(S.voll[0] === 1001 && S.voll[1] > 0.9)) rot.push(`9 VOLL: ${S.voll[0]} von 1001 Formen, der Platz danach ${S.voll[1]}`);
    const K = S.koerper;
    const um = (v, soll) => Math.abs(v - soll) <= 0.07; // ein Byte der Lage ist 1/63, die Probe liegt bis ¼ Texel neben dem Soll
    if (
        !(K.art === "strasse" && K.bordM > 0 && K.mitte[0] === 1 && K.mitte[1] > 0.95 && um(K.bord[1], 0.5) && um(K.innen[1], 0.75) && um(K.aussen[1], 0.25) &&
          K.gehweg[0] > 0.95 && K.gehweg[1] < 0.07 && K.gehweg[2] === 1 && K.hinter[0] < 0.02)
    )
        rot.push(
            `10 KÖRPER: Art ${K.art} (Bord ${K.bordM} m, Gehweg ${K.gehM} m) — Pflaster · Lage zum Bord: Mitte ${K.mitte[0]} · ${K.mitte[1]} (soll 1 · > 0,95), ` +
                `am Bord ${K.bord[1]} (soll 0,5), ½ m innen ${K.innen[1]} (0,75), ½ m außen ${K.aussen[1]} (0,25), Gehweg ${K.gehweg[0]} · ${K.gehweg[1]} ` +
                `(soll > 0,95 · < 0,07, Halm-Feld ${K.gehweg[2]} soll 1), hinter der Bauflucht ${K.hinter[0]} (soll < 0,02)`
        );
    const T = S.tritt;
    if (!T) rot.push("8 TRITT: nicht gemessen");
    else if (T.fehler) rot.push("8 TRITT: " + T.fehler);
    else {
        if (!(T.gesetztForm && T.gesetztCpu > 0.9 && T.gesetztGpu > 0.9 && T.gesetztGefallen === 2))
            rot.push(
                `8 TRITT gesetzt: Form ${T.gesetztForm} · CPU ${T.gesetztCpu} · GPU-Byte ${T.gesetztGpu} (soll > 0,9) · ` +
                    `${T.gesetztGefallen}/2 Kacheln gefallen`
            );
        if (!(T.geloestCpu < 0.02 && T.geloestGpu === 0 && T.geloestUpload && T.geloestGefallen === 2 && T.formenRest === 0))
            rot.push(
                `8 TRITT gelöst: CPU ${T.geloestCpu} · GPU-Byte ${T.geloestGpu} (soll 0) · Upload ${T.geloestUpload} · ` +
                    `${T.geloestGefallen}/2 Kacheln gefallen (Wiese und Nah-Streu wachsen zurück) · ${T.formenRest} Formen übrig`
            );
    }
    return rot;
}

hauptLauf(async () => {
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 120000 }, 30000);
    // die Trittfläche nennt das Gesetzbuch: das Buch muss warm sein (der Foundry-Worker läuft auch headless); die Wiesen-
    // Probe liest den gebauten Boden: das Chunk-Streaming baut den Ring um den Spieler (nur er — Wiese und Streu baut die Probe).
    // Die Büschel einer Kachel stehen erst mit der Weite der gezeichneten Vorlagen (`nahWiese.reich`, ihr EINER Schreiber ist
    // `_tickNahWiese`): der Takt läuft mit verstrichener Frist — er misst die Weite und baut keine Kachel.
    await page.evaluate(async () => {
        await __weltDa((r) => r.state && r.state.scene);
        const warm = () =>
            r._foundry?.recipes?.feuerstelle && st.voxelChunks?.size > 20 && st.nahWiese?.reich > 0;
        for (const weiter = __deckel("Buch, Ring und Wiesen-Weite", 4500); !warm() && weiter(); ) {
            r._tickVoxelChunkStreaming(st.playerMesh.position);
            r._tickNahWiese(performance.now() - 1);
            await sleep(20);
        }
    });
    const messen = async (stoerung) =>
        Object.assign(await page.evaluate(probe, stoerung === "tritt" ? null : stoerung), {
            tritt: await page.evaluate(trittProbe, stoerung === "tritt" ? "tritt" : null),
        });
    const S = await messen(null);
    let selbst = null;
    if (SELBSTTEST) {
        const streifen = urteil(await messen("streifen"));
        const hart = urteil(await messen("hart"));
        const vergessen = urteil(await messen("vergessen"));
        const tritt = urteil(await messen("tritt"));
        const kappe = urteil(await messen("kappe"));
        const ohnebord = urteil(await messen("ohnebord"));
        const ohnegrundriss = urteil(await messen("ohnegrundriss"));
        const heil = urteil(await messen(null));
        selbst = {
            streifenRot: streifen.some((e) => e.startsWith("1 KEIN QUAD")),
            hartRot: hart.some((e) => e.startsWith("3 KANTE")),
            vergessenRot: vergessen.some((e) => e.startsWith("7 BESTAND")),
            trittRot: tritt.some((e) => e.startsWith("8 TRITT gelöst")),
            kappeRot: kappe.some((e) => e.startsWith("9 VOLL")),
            ohnebordRot: ohnebord.some((e) => e.startsWith("10 KÖRPER")),
            ohnebord: ohnebord.find((e) => e.startsWith("10 KÖRPER")) || ohnebord[0] || "-",
            ohnegrundrissRot: ohnegrundriss.some((e) => e.startsWith("11 ACKER")),
            ohnegrundriss: ohnegrundriss.find((e) => e.startsWith("11 ACKER")) || ohnegrundriss[0] || "-",
            heilGruen: heil.length === 0,
            streifen: streifen[0] || "-",
            hart: hart.find((e) => e.startsWith("3 KANTE")) || hart[0] || "-",
            vergessen: vergessen.find((e) => e.startsWith("7 BESTAND")) || vergessen[0] || "-",
            tritt: tritt.find((e) => e.startsWith("8 TRITT")) || tritt[0] || "-",
        };
    }
    await browser.close();
    server.close();

    console.log("=== DIE WEG-KANTEN-PROBE — der Weg ist Boden ===");
    if (S.fehler) console.log("  " + S.fehler);
    else {
        console.log(`  Pool: ${S.flacheStreifen} flache Boden-Streifen · ${S.zaeune} Zaun-Streifen`);
        console.log(`  Straße: Mitte ${S.mitte} · 2,5 m außerhalb ${S.aussen} · weiche Rand-Proben ${S.kantenProben}`);
        console.log(`  Platz ${S.platz} · Acker ${S.acker} · Feldweg ${S.feldweg}`);
        console.log(`  Konsum: Boden-Shader ${S.shaderLiest} · Wiese ${JSON.stringify(S.wiese)}`);
        console.log(`  Ecke (45°-Acker) ${S.ecke} · Weg in 300 m ${S.fernWeg} · voll ${S.voll}`);
        if (S.acker11) console.log(`  Acker (11): Büschel · Pflanzen innen ohne Acker ${JSON.stringify(S.acker11.ohne)} → mit ${JSON.stringify(S.acker11.mit)}`);
        console.log(`  Körper der Fahrstraße (Pflaster · Lage zum Bord · Halm-Feld): ${JSON.stringify(S.koerper)}`);
        console.log(
            `  Kronen-Bestand nach 1,6 km Ausflug: im Register ${S.bestandRegister} · Streu ${S.bestandStreu} · ` +
                `${S.bestandUngleich} Texel ungleich dem vollen Neumalen`
        );
        const T = S.tritt || {};
        if (T.fehler) console.log("  Trittfläche: " + T.fehler);
        else
            console.log(
                `  Trittfläche gesetzt: CPU ${T.gesetztCpu} · GPU-Byte ${T.gesetztGpu} · ${T.gesetztGefallen}/2 Kacheln neu · ` +
                    `gelöst: CPU ${T.geloestCpu} · GPU-Byte ${T.geloestGpu} · Upload ${T.geloestUpload} · ` +
                    `${T.geloestGefallen}/2 Kacheln neu · ${T.formenRest} Formen übrig`
            );
    }
    const rot = urteil(S);
    if (selbst) {
        console.log(`  Selbsttest: Boden-Streifen im Pool → ${selbst.streifen}`);
        console.log(`  Selbsttest: harte Kante → ${selbst.hart}`);
        console.log(`  Selbsttest: der ferne Umzug vergisst → ${selbst.vergessen}`);
        console.log(`  Selbsttest: der alte Abbau der Trittfläche → ${selbst.tritt}`);
        if (!selbst.streifenRot) rot.push("SELBSTTEST: der injizierte Boden-Streifen blieb grün");
        if (!selbst.hartRot) rot.push("SELBSTTEST: die harte Kante blieb grün");
        if (!selbst.vergessenRot) rot.push("SELBSTTEST: der vergessene Kronen-Bestand blieb grün");
        if (!selbst.trittRot) rot.push("SELBSTTEST: der alte Abbau der Trittfläche blieb grün");
        if (!selbst.kappeRot) rot.push("SELBSTTEST: die stille Kappe blieb grün");
        console.log(`  Selbsttest: die Fahrstraße ohne Bord → ${selbst.ohnebord}`);
        if (!selbst.ohnebordRot) rot.push("SELBSTTEST: die Fahrstraße ohne Bord blieb grün");
        console.log(`  Selbsttest: der Acker ohne Grundriss → ${selbst.ohnegrundriss}`);
        if (!selbst.ohnegrundrissRot) rot.push("SELBSTTEST: der Acker ohne Grundriss blieb grün");
        if (!selbst.heilGruen) rot.push("SELBSTTEST: nach der Heilung nicht grün");
    }
    require("./lib/welt-boot.cjs").wandEnde(rot, "der Weg ist getretene Erde im Boden: weich gerändert, kein Quad, die Wiese weicht ihm.");
});
