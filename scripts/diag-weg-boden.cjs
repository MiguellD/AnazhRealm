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
//   9 TON      die Deckung der Wiese ist ein Feld des Gesetzes (der Stoff, `WIESEN_GRUND.deckung`), die Farbe ihr Leser
//              (w26-ferne-ton-4): derselbe Boden in zwei Tönen des Wiesen-Grunds (`BODEN_FARBE.mead` 0x3e5026 ↔ 0x55632f, der
//              Faden im Stand) — die 3 × 3 Chunks um den Spieler, je Ton gebaut im Faden (`chunk-mesh`) und im Haupt-Faden
//              (`_buildVoxelChunkData`): Deckung je Vertex und Grün der Boden-Karte byte-gleich; mit der Karte des Haupt-Fadens
//              lesen Haftung (`_fahrHaft`), Schritt (`_kontaktStoffAt`) und Wuchs der Nah-Wiese (`_nahWieseKachelBueschel`)
//              dasselbe. Die Farbe der Vertices MUSS sich ändern (sonst wirkt der Ton nicht, die Probe wäre blind).
// --selftest: ein injizierter Boden-Streifen im Pool, eine harte Kante, der vergessliche ferne Umzug, der alte
// Abbau der Trittfläche und die Deckung aus dem Ton (g − (r+b)/2 der Farbe, die Wache bis w26-ferne-ton-4) müssen beim Namen
// rot werden.
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
    if (stoerung === "streifen") r._stlZaunAddStrip(o.x, 0, o.z, 0, 0, 4, 0.14, 3, 0x8a7456);
    r._tickWegeKarte({ x: o.x, z: o.z });
    const out = { ort: o };
    // 1 KEIN QUAD: jeder Streifen im Pool ist ein hüfthoher Zaun (sy ≥ 0,5), keiner ein flacher Boden-Streifen
    const P = st.stlZaun;
    const m = new T.Matrix4();
    const pos = new T.Vector3();
    const q = new T.Quaternion();
    const sk = new T.Vector3();
    let flach = 0;
    let zaun = 0;
    for (let i = 0; P && i < P.top; i++) {
        P.mesh.getMatrixAt(i, m);
        m.decompose(pos, q, sk);
        if (sk.y < 0.5) flach++;
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
    // Probe einen leeren Platzhalter — die Probe zählt, ob der Abbau sie fallen lässt (der Takt baut Fehlendes neu).
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
    const saeen = () => {
        for (const [ring, key, k] of [
            [st.nahWiese, kw, { meshes: null, quellen: null }],
            [st.nahStreu, ks, { key: ks, senken: new Set(), zustand: null }],
        ])
            if (!ring.kacheln.has(key)) {
                ring.kacheln.set(key, k);
                gesaet.add(k);
            }
    };
    const gefallen = () => (st.nahWiese.kacheln.has(kw) ? 0 : 1) + (st.nahStreu.kacheln.has(ks) ? 0 : 1);
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

// 9 TON: zwei Töne des Wiesen-Grunds, je Ton der Boden der 3 × 3 Chunks im Faden und im Haupt-Faden und seine Leser —
// `farbe`: die Deckung liest den Ton (der Täter vor w26-ferne-ton-4, als Laufzeit-Stub am Haupt-Faden). → je Größe die
// Zahl der Stellen, die der Ton ändert; `farbe` die der Vertex-Farben (sie MUSS sich ändern). Den Spiegel Faden ↔ Haupt-Faden
// (Deckung, Karte, Farbe am fertigen Bau) hält der Playtest (`checkBandWellePerf3cPhase3FullMesh`, das Merge-Gate) — bis
// w27-ferne-ton-5 zählte ihn diese Probe ein zweites Mal
async function tonProbe(farbe) {
    const [A, P, basis, span] = [AnazhRealm, r.constructor.prototype, AnazhRealm.BODEN_FARBE, r._voxelChunkConfig(0).span];
    const [c0x, c0z] = [st.playerMesh.position.x, st.playerMesh.position.z].map((v) => Math.floor(v / span));
    const C = [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => [c0x + i, c0z + j, st.voxelChunks.get(c0x + i + "," + (c0z + j))]));
    if (C.some(([, , E]) => !(E && E.surfMap && E.gruenMap))) return { fehler: "die 3 × 3 Chunks um den Spieler tragen keine Karte" };
    const zu = [];
    if (farbe) zu.push(leihe(r, { _bodenFarbeAt(x, y, z, o, aus) { P._bodenFarbeAt.call(this, x, y, z, o, aus); if (aus) aus.deckung = (o[1] - (o[0] + o[2]) / 2) / 0.0651; return o; } })); // prettier-ignore
    const messe = async (hex) => {
        Object.defineProperty(A, "BODEN_FARBE", { value: { ...basis, mead: A._srgbHexLinear(hex) }, configurable: true });
        await r._voxelWorkerSyncState({ op: "state-set" });
        const M = { faden: [], haupt: [], farbe: [], haft: [], wuchs: [] };
        for (const [cx, cz, E] of C) {
            const w = await r._voxelWorkerComputeChunkMesh(cx, cz, E.lod || 0);
            const frei = leihe(r, { _syncStelle: "naht" });
            const g = r._buildVoxelChunkData(cx, cz, E.lod || 0);
            frei();
            M.faden.push(...w.karte.gruen, ...w.stoff);
            M.haupt.push(...g.gruenMap, ...g.mesh.geometry.attributes.aStoff.array);
            M.farbe.push(...w.colors, ...g.mesh.geometry.attributes.color.array);
            zu.push(leihe(E, { gruenMap: g.gruenMap }));
        }
        for (let i = 0; i < 72 * 72; i++) {
            const [x, z] = [(c0x - 1) * span + ((i % 72) + 0.5) * 1.8, (c0z - 1) * span + (Math.floor(i / 72) + 0.5) * 1.8];
            const y = r._bodenSichtAt(x, z);
            M.haft.push(y === null ? "-" : r._fahrHaft({ x, z, y }) + r._kontaktStoffAt(x, z, y));
        }
        const K = A.NAH_WIESE.kachel;
        for (let t = 0; t < 64; t++) M.wuchs.push(JSON.stringify((r._nahWieseKachelBueschel(Math.floor((c0x * span) / K) + (t % 8), Math.floor((c0z * span) / K) + (t >> 3)) || []).map((b) => [b.gi, b.gj, b.y, b.s]))); // prettier-ignore
        while (zu.length > (farbe ? 1 : 0)) zu.pop()();
        return M;
    };
    let a, b;
    try {
        [a, b] = [await messe(0x3e5026), await messe(0x55632f)];
    } finally {
        while (zu.length) zu.pop()();
        Object.defineProperty(A, "BODEN_FARBE", { value: basis, configurable: true });
        await r._voxelWorkerSyncState({ op: "state-set" });
    }
    const anders = (x, y) => x.filter((v, i) => v !== y[i]).length;
    const N = Object.fromEntries(Object.keys(a).map((k) => [k, anders(a[k], b[k])]));
    return Object.assign(N, { wiese: a.haft.filter((v) => /gras$/.test(v)).length, bueschel: a.wuchs.join("").split("],[").length }); // prettier-ignore
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
    const N = S.ton;
    if (!N || N.fehler) rot.push("9 TON: " + (N ? N.fehler : "nicht gemessen"));
    else {
        if (!(N.farbe > 0 && N.wiese > 0 && N.bueschel > 1)) rot.push("9 TON blind: " + JSON.stringify(N));
        const folgt = ["faden", "haupt", "haft", "wuchs"].filter((k) => N[k] > 0);
        if (folgt.length) rot.push("9 TON: die Deckung liest die Farbe — " + folgt.map((k) => `${k} ${N[k]}`).join(" · "));
    }
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
        Object.assign(await page.evaluate(probe, stoerung === "tritt" || stoerung === "farbe" ? null : stoerung), {
            tritt: await page.evaluate(trittProbe, stoerung === "tritt" ? "tritt" : null),
            // der Ton fährt nur im heilen Lauf und mit seinem Täter (die anderen Störungen lassen den Boden, wie er ist)
            ton: stoerung == null || stoerung === "farbe" ? await page.evaluate(tonProbe, !!stoerung) : {},
        });
    const S = await messen(null);
    // der Selbsttest: je Störung ihr Befund beim Namen (der Kopf seiner Zeile), danach heilt die Welt
    const selbst = [];
    if (SELBSTTEST) {
        // die Störungen: ein Boden-Streifen im Pool · die harte Kante · der ferne Umzug vergisst · der alte Abbau der Trittfläche ·
        // die Deckung aus dem Ton
        const FAELLE = { streifen: "1 KEIN QUAD", hart: "3 KANTE", vergessen: "7 BESTAND", tritt: "8 TRITT gelöst", farbe: "9 TON: die Deckung liest die Farbe" };
        for (const stoerung in FAELLE) selbst.push([stoerung, urteil(await messen(stoerung)).find((e) => e.startsWith(FAELLE[stoerung]))]);
        selbst.push(["heil", urteil(await messen(null)).length ? null : "grün"]);
    }
    await browser.close();
    server.close();

    console.log("=== DIE WEG-KANTEN-PROBE — der Weg ist Boden ===");
    // DIE ZEILE: jede Zahl jeder Probe (die Urteile nennen den Täter beim Namen)
    console.log("  " + JSON.stringify(S));
    const rot = urteil(S);
    for (const [name, fund] of selbst) {
        console.log(`  Selbsttest: ${name} → ${fund || "-"}`);
        if (!fund) rot.push(`SELBSTTEST: ${name} — nicht beim Namen`);
    }
    require("./lib/welt-boot.cjs").wandEnde(rot, "der Weg ist getretene Erde im Boden: weich gerändert, kein Quad, die Wiese weicht ihm.");
});
